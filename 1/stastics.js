/**
 * @fileoverview 统计类，用于统计数据的最大值、最小值、平均值等
 */
export class Stastics {
    constructor() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    } 

    print(){
        console.log("Stastics:", "max:", this._max, "min:", this._min, "average:", this._average);
        console.log("data:", this._data);
    }

    clear() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    }

    update() {
        this.dropna();
        this._max = Math.max(...this._data);
        this._min = Math.min(...this._data);
        this._average = this._data.reduce((a, b) => a + b, 0) / this._data.length;
    }

    dropna() {
        this._data = this._data.filter((value) => value !== null && value !== undefined && !isNaN(value));
    }

    append(value, getVal) {
        this._data.push(...value.map(getVal));
        this.update();
    }

    updateData(value) {
        this._data = value;
        this.update();
    }

    // 根据内置的统计值进行值映射，支持拉伸函数
    mapValue(value, isReverse = false, stretch = 'linear') {
        let mappedValue = (value - this._min) / (this._max - this._min);

        switch (stretch) {
            case 'log': // 对数拉伸
                mappedValue = Math.log10(1 + mappedValue * 9); // 可调整基数
                break;
            case 'exp': // 指数拉伸
                mappedValue = Math.pow(mappedValue, 2); // 可调整指数
                break;
            case 'sqrt': // 平方根拉伸
                mappedValue = Math.sqrt(mappedValue);
                break;
        }

        if (isReverse) {
            // 反转后判断是否小于0，如果小于0则返回0
            return Math.max(0, 1 - mappedValue);
        } else {
            return mappedValue;
        }
    }

    mapValue2Color(value, isReverse = false, colors = defaultColors, stretch = 'linear') {
        let index = Math.floor(this.mapValue(value, isReverse, stretch) * (colors.length - 1));
        return colors[index];
    }

    getGrades(num, fixed = 2) {
        let grades = [];
    
        // 计算出最大最小值差距
        let range = this._max - this._min;
    
        // 确定一个合适的步长，使得每个区间的范围是整数
        let roughStep = range / num;
    
        // 找到最近的 "漂亮的" 步长 (比如10, 50, 100这样的数字)
        let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep))); // 获得步长的数量级
        let niceStep = Math.ceil(roughStep / magnitude) * magnitude; // 找到适合的步长
    
        // 计算新的分级区间
        let niceMin = Math.floor(this._min / niceStep) * niceStep; // 向下取整到最近的漂亮整数
        let niceMax = Math.ceil(this._max / niceStep) * niceStep;  // 向上取整到最近的漂亮整数
    
        // 生成分级
        for (let i = niceMin; i <= niceMax; i += niceStep) {
            grades.push(i);
        }

        // 保留两位小数
        grades = grades.map(d => d.toFixed(fixed));
    
        return grades;
    }

    // 等距离
    getGradesFixed(num,fixed = 2) {
        let grades = [];
        let step = (this._max - this._min) / num;
        for (let i = 0; i <= num; i++) {
            grades.push((this._min + i * step).toFixed(fixed));
        }
        return grades;
    }
    
    
}


// const defaultColors  = [
//     '#00441b', '#f7fbff', '#deebf7', '#9ecae1', 
//     '#6baed6', '#3182bd', '#08519c', '#08306b'
// ];

const defaultColors = [ // 红色基调的暖色调
    '#67000d', '#f7f4f9', '#fde0dd', '#fcbba1',
    '#fc9272', '#fb6a4a', '#ef3b2c', '#99000d'
];