import os
import json
import pandas as pd
from shapely.geometry import LineString
import tqdm

DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(DIR, '..', 'data')
SAVE_PATH5 = os.path.join(DATA_DIR, 'trajectory3.json') 

# 加载JSON文件并将其转换为DataFrame
def load_JSON_as_df(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return pd.DataFrame(data)


def simplify_trajectory(trajectory, tolerance=0.0001):
    """
    简化轨迹数据，减少轨迹点的数量，同时保留轨迹的整体形状。
    
    参数:
        trajectory (pd.DataFrame): 轨迹数据，包含 'vendor', 'path', 'timestamps' 列。
        tolerance (float): 简化容忍度，控制简化程度。值越小，保留的细节越多。
    
    返回:
        pd.DataFrame: 简化后的轨迹数据。
    """
    simplified_data = []

    for index, row in tqdm.tqdm(trajectory.iterrows(), total=len(trajectory)):
        vendor = row['vendor']
        path = row['path']
        timestamps = row['timestamps']
        
        # 将路径转换为LineString对象
        line = LineString(path)
        
        # 使用shapely的simplify方法简化轨迹
        simplified_line = line.simplify(tolerance, preserve_topology=True)
        
        # 获取简化后的路径点
        simplified_path = list(simplified_line.coords)
        
        # 对时间戳进行插值，确保与简化后的路径点一一对应
        if len(simplified_path) < len(timestamps):
            # 如果简化后的路径点减少，则对时间戳进行插值
            simplified_timestamps = [
                int(timestamps[0] + i * (timestamps[-1] - timestamps[0]) / (len(simplified_path) - 1))
                for i in range(len(simplified_path))
            ]
        else:
            # 如果路径点未减少，则直接使用原始时间戳
            simplified_timestamps = timestamps
        
        # 将结果添加到简化数据中
        simplified_data.append({
            'vendor': vendor,
            'path': simplified_path,
            'timestamps': simplified_timestamps
        })
    
    return pd.DataFrame(simplified_data)

# print(SAVE_PATH5)

if __name__ == '__main__':
    trajectory = load_JSON_as_df(SAVE_PATH5)
    simplified_trajectory = simplify_trajectory(trajectory, tolerance=0.0001)
    # 保存简化后的轨迹数据
    simplified_trajectory.to_json(SAVE_PATH5, orient='records')
