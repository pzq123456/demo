// ==== Worker Start ====

const worker = new Worker('worker.js');

// 监听 Worker 返回的数据
worker.onmessage = function(e) {
  const { type, data, error } = e.data;

  if (type === 'INIT_COMPLETE') {
    console.log('数据加载完成，准备好提供服务');
  } else if (type === 'ACTIVE_ROWS') {
    console.log('活跃行数据：', data);
  } else if (type === 'TRAJECTORY_DATA') {
    // console.log('生成的轨迹数据：', data);
    globe_data = data;
  } else if (type === 'ERROR') {
    console.error('数据加载出错：', error);
  }
};

// 生成轨迹数据
// function generateTrajectoryDataForRows(timestamp) {
//     worker.postMessage({ type: 'GENERATE_TRAJECTORY', timestamp });
// }

// 使用异步函数改写
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

// ==== Worker End ====



const { DeckGL, TripsLayer } = deck;

// 获取播放按钮和滑动条
const playBtn = document.getElementById('play-btn');
const slider = document.getElementById('time-slider');
const currentTimeDisplay = document.getElementById('current-time');



// def time_convert_reverse(x, min=1726617600):
//     return pd.to_datetime(x + min, unit='s')

function time_convert_reverse(x, min=1726617600) {
    return new Date((x + min) * 1000);
}

// console.log(time_convert_reverse(0).toUTCString());

// 初始化地图和视图
const initialViewState = {
    // 香港中心
    latitude:  22.3193039,
    longitude: 114.1693611,
    zoom: 11.9,
    minZoom: 2,
    maxZoom: 15,
    pitch: 0,
    bearing: 0,
};



// 数据路径
const DATA_URL = 'data/trajectory.json';

// 初始化时间
let currentTime = 0;

// 动画相关变量
let animationId = null;
const step = 1;
const intervalMS = 20;
const loopLength = 84928;
let isPlaying = false;

// 加载数据
// async function loadData() {
//     const response = await fetch(DATA_URL);
//     return response.json();
// }

// 创建 TripsLayer
function createTripsLayer(data, currentTime) {
    return new TripsLayer({
        id: 'trips',
        data,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => (d.vendor === 0 ? RED : BLUE),
        opacity: 0.5,
        widthMinPixels: 3,
        rounded: true,
        trailLength: 80,
        currentTime,
    });
}

// 更新时间和图层
async function updateTime(newTime) {
    currentTime = newTime;
    slider.value = currentTime;
    currentTimeDisplay.textContent = `Current Time: ${time_convert_reverse(currentTime).toUTCString()}`; // fix: 调整为 UTC 时间即 Python 默认时间

    data = await generateTrajectoryDataForRows(currentTime); // 使用 Worker 生成轨迹数据

    // 更新图层
    const newLayer = createTripsLayer(data, currentTime);
    deckgl.setProps({ layers: [newLayer] });
}

// 节流函数
function throttle(fn, interval) {
    let lastCallTime = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastCallTime >= interval) {
            fn(...args);
            lastCallTime = now;
        }
    };
}

// 动画循环
function animate() {
    if (!isPlaying) return;

    currentTime = (currentTime + step) % loopLength;
    // updateTime(currentTime);
    throttle(updateTime, 2000)(currentTime); // 限制更新频率

    // 递归调用
    animationId = requestAnimationFrame(animate);
}

// 播放/暂停动画
function togglePlay() {
    isPlaying = !isPlaying;

    if (isPlaying) {
        playBtn.textContent = 'Pause';
        animate();
    } else {
        playBtn.textContent = 'Play';
        cancelAnimationFrame(animationId);
    }
}

// 初始化 DeckGL
let deckgl;
let data;
async function init() {
    // data = await loadData();
    data = await generateTrajectoryDataForRows(0); // 使用 Worker 生成轨迹数据

    // 创建初始图层
    const layer = createTripsLayer(data, currentTime);

    // 初始化 DeckGL
    deckgl = new DeckGL({
        // mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // 白色地图
        // https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json
        mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json', // 黑色地图

        controller: true,
        initialViewState,
        layers: [layer],
        onViewStateChange: ({ viewState }) => {
            deckgl.setProps({ viewState });
        },
        container: 'map',
    });

    // 绑定滑动条事件
    slider.addEventListener('input', (e) => {
        updateTime(parseFloat(e.target.value));
    });

    // 绑定播放按钮事件
    playBtn.addEventListener('click', togglePlay);
}

// 启动
document.addEventListener('DOMContentLoaded', init);

// 颜色定义
const BLUE = [23, 184, 190];
const RED = [253, 128, 93];

const legend = document.getElementById('legend');

// GMB : 0 RED
// non-GMB : 1 BLUE


// 创建 legend 条目
function createLegendItem(color, label) {
    // 创建 legend 条目
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');

    // 创建颜色块
    const colorBlock = document.createElement('div');
    colorBlock.classList.add('legend-color');
    colorBlock.style.backgroundColor = `rgb(${color.join(',')})`;

    // 创建标签
    const labelText = document.createElement('span');
    labelText.innerText = label;

    // 添加颜色块和标签到 legend 条目
    legendItem.appendChild(colorBlock);
    legendItem.appendChild(labelText);

    return legendItem;
}

// 添加 GMB 和非 GMB 条目到 legend
legend.appendChild(createLegendItem(RED, 'GMB'));
legend.appendChild(createLegendItem(BLUE, 'Non-GMB'));