// main.js
const worker = new Worker('worker.js');

// let globe_data;

// // 监听 Worker 返回的数据
// worker.onmessage = function(e) {
//   const { type, data, error } = e.data;

//   if (type === 'INIT_COMPLETE') {
//     console.log('数据加载完成，准备好提供服务');
//   } else if (type === 'ACTIVE_ROWS') {
//     console.log('活跃行数据：', data);
//   } else if (type === 'TRAJECTORY_DATA') {
//     // console.log('生成的轨迹数据：', data);
//     // globe_data = data;
//   } else if (type === 'ERROR') {
//     console.error('数据加载出错：', error);
//   }
// };

// // 请求活跃行数据
// function getActiveRowsAtTimestamp(timestamp) {
//   worker.postMessage({ type: 'GET_ACTIVE_ROWS', timestamp });
// }

async function generateTrajectoryDataForRows(timestamp) {
    worker.postMessage({ type: 'GENERATE_TRAJECTORY', timestamp });
    return new Promise((resolve, reject) => {
        worker.onmessage = function(e) {
            const { type, data, error } = e.data;

            if (type === 'TRAJECTORY_DATA') {
                resolve(data);
            } else {
                reject(error);
            }
        };
    });
}


// 每隔一段时间请求一次数据
setInterval(() => {
  const timestamp = Math.floor(Math.random() * 10000); // 随机时间戳

    generateTrajectoryDataForRows(timestamp)
        .then(data => {
        console.log('生成的轨迹数据：', data);
        })
        .catch(error => {
        console.error('生成轨迹数据出错：', error);
        });

}, 2000); // 每 5 秒请求一次活跃行数据