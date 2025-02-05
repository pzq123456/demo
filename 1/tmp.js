// 加速代码

const DATA_URL = 'data/index.csv';
const DATA_URL_2 = 'data/trajectory.json';

let data = []; // 用来存储解析后的 CSV 数据
let trajectoryData = []; // 用来存储解析后的轨迹数据

// 读取并解析 CSV 文件
Papa.parse(DATA_URL, {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function(results) {
    console.log('CSV 解析完成：', results);
    data = results.data;
    console.log('CSV 数据加载完毕，数据总数：', data.length);
  },
  error: function(error) {
    console.error('读取 CSV 文件时发生错误：', error);
  }
});

// 读取并解析轨迹数据
fetch(DATA_URL_2)
  .then(response => response.json())
  .then(json => {
    trajectoryData = json;
    console.log('轨迹数据加载完毕，数据总数：', trajectoryData.length);
  })
  .catch(error => {
    console.error('读取轨迹数据时发生错误：', error);
  });

// 查找与给定时间戳有交集的活跃行数据
function findActiveRowsAtTimestamp(timestamp) {
  return data.filter(row => row.s_time < timestamp && row.e_time > timestamp);
}

// 生成轨迹数据的函数
function generateTrajectoryData(activeRows) {
  // 遍历所有活跃行，查找对应轨迹并进行时间戳偏移
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
        path: track.path, // 假设路径不需要修改
        timestamps: updatedTimestamps
      });
    }
  });

  return result;
}

// 测试函数：模拟给定时间戳，计算并生成轨迹数据
function test() {
  // 假设要查询的时间戳
  const timestamp = Math.floor(Math.random() * 10000);
  
  console.time('findActiveRowsAtTimestamp');
  
  // 查找与时间戳有交集的活跃行数据
  const activeRows = findActiveRowsAtTimestamp(timestamp);
  
  // 输出活跃行数据
  console.log(`时间戳 ${timestamp} 时活跃的行：`, activeRows);

  // 生成轨迹数据
  const trajectory = generateTrajectoryData(activeRows);
  
  // 输出生成的轨迹数据
  console.log('生成的轨迹数据：', trajectory);
  
  console.timeEnd('findActiveRowsAtTimestamp');
}

// 在数据加载完成后，进行测试
setTimeout(test, 3000); // 延迟 3 秒以确保数据加载完成（可以根据需要调整）
