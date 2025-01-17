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

// 颜色定义
const BLUE = [23, 184, 190];
const RED = [253, 128, 93];

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
async function loadData() {
    const response = await fetch(DATA_URL);
    return response.json();
}

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
        trailLength: 180,
        currentTime,
    });
}

// 更新时间和图层
function updateTime(newTime) {
    currentTime = newTime;
    slider.value = currentTime;
    currentTimeDisplay.textContent = `Current Time: ${time_convert_reverse(currentTime).toLocaleString()}`;

    // 更新图层
    const newLayer = createTripsLayer(data, currentTime);
    deckgl.setProps({ layers: [newLayer] });
}

// 动画循环
function animate() {
    if (!isPlaying) return;

    currentTime = (currentTime + step) % loopLength;
    updateTime(currentTime);

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
    data = await loadData();

    // 创建初始图层
    const layer = createTripsLayer(data, currentTime);

    // 初始化 DeckGL
    deckgl = new DeckGL({
        mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
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
init();