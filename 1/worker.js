// 通过 importScripts 引入 PapaParse 库
importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js');


// worker.js
let data = []; // 用来存储解析后的 CSV 数据
let trajectoryData = []; // 用来存储解析后的轨迹数据

// 加载 CSV 数据的函数
function loadCSVData() {
  return new Promise((resolve, reject) => {
    Papa.parse('data/index.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        data = results.data;
        resolve();
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

// 加载轨迹数据的函数
function loadTrajectoryData() {
  return fetch('data/trajectory.json')
    .then(response => response.json())
    .then(json => {
      trajectoryData = json;
    });
}

// 查找与给定时间戳有交集的活跃行数据
function findActiveRowsAtTimestamp(timestamp) {
  return data.filter(row => row.s_time < timestamp && row.e_time > timestamp);
}

// 生成轨迹数据的函数
function generateTrajectoryData(activeRows) {
  const result = [];

  activeRows.forEach(row => {
    const trackIndex = row.old_index; // 找到对应的轨迹索引
    const deltaTime = row.delta_time; // 获取偏移时间

    // 获取对应轨迹
    const track = trajectoryData[trackIndex];

    if (track) {
      // 对时间戳进行偏移操作
      const updatedTimestamps = track.timestamps.map(timestamp => timestamp + deltaTime);
      
      // 生成更新后的轨迹数据
      result.push({
        vendor: track.vendor,
        path: track.path,
        timestamps: updatedTimestamps
      });
    }
  });

  return result;
}

// 初始化数据加载
async function initData() {
  try {
    await loadCSVData();
    await loadTrajectoryData();
    postMessage({ type: 'INIT_COMPLETE' }); // 数据加载完成通知主线程
  } catch (error) {
    postMessage({ type: 'ERROR', error });
  }
}

// 监听主线程消息并处理请求
onmessage = function(e) {
  const { type, timestamp } = e.data;

  if (type === 'GET_ACTIVE_ROWS') {
    const activeData = findActiveRowsAtTimestamp(timestamp);
    postMessage({ type: 'ACTIVE_ROWS', data: activeData });
  } else if (type === 'GENERATE_TRAJECTORY') {
    const activeRows = findActiveRowsAtTimestamp(timestamp);
    const trajectory = generateTrajectoryData(activeRows);
    postMessage({ type: 'TRAJECTORY_DATA', data: trajectory });
  }
};

// 初始化数据
initData();
