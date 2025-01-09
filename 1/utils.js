export function createSlider(min, max, parentElement) {
    // 创建滑动条容器
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper'; // 添加 class 以便外部定义 CSS

    // 创建原生滑动条
    const slider = document.createElement('input');
    slider.className = 'slider'; // 添加 class 以便外部定义 CSS
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = min; // 初始值为最小值

    // 创建文本提示容器
    const sliderText = document.createElement('div');
    sliderText.className = 'slider-text'; // 添加 class 以便外部定义 CSS
    sliderText.textContent = `${min} : ${max}`; // 初始文本

    // 更新文本提示
    function updateText(value) {
        sliderText.textContent = `${value} : ${max}`;
    }

    // 监听滑动条值的变化
    slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        updateText(value);
    });

    sliderWrapper.appendChild(slider);
    sliderWrapper.appendChild(sliderText);
    parentElement.appendChild(sliderWrapper);

    // 返回当前值
    return {
        setValue: (value) => {
            // 设置滑动条的值
            slider.value = value;
            updateText(value);
        },
        getValue: () => parseFloat(slider.value), // 返回当前值
        slider, // 返回滑动条元素
    };
}
