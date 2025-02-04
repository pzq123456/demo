import os
import json
import pandas as pd
from shapely.geometry import LineString
import tqdm
import numpy as np

DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(DIR, '..', 'data')
SAVE_PATH4 = os.path.join(DATA_DIR, 'trajectory2.json')

SAVE_FOLDER = os.path.join(DATA_DIR, 'sliced_trajectory')

# 加载JSON文件并将其转换为DataFrame
def load_JSON_as_df(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return pd.DataFrame(data)

def slice_trajectory(trajectory, part=5, direction='horizontal'):
    # print(trajectory.head())
    # 分割为 part 个部分 并存储
    tqdm.tqdm.desc = f"Splitting trajectory into {part} parts"
    # np
    sliced_data = np.array_split(trajectory, part)

    meta = []

    if not os.path.exists(SAVE_FOLDER):
        os.makedirs(SAVE_FOLDER)
    for i, data in tqdm.tqdm(enumerate(sliced_data), total=part):
        meta.append(data.iloc[0]['timestamps'][0])
        file_path = os.path.join(SAVE_FOLDER, f'{i}.json')
        data.to_json(file_path, orient='records')
    with open(os.path.join(SAVE_FOLDER, 'meta.json'), 'w') as f:
        json.dump(meta, f)
    print(f"Saved {part} files to {SAVE_FOLDER}")


# 将 dictionary 保存为 多个小的 JSON 文件 文件名为 键 文件夹名由用户指定
def save_dict_as_json_files(data, folder_name):
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    for key, value in data.items():
        file_path = os.path.join(folder_name, f'{key}.json')
        with open(file_path, 'w') as f:
            json.dump(value, f)
    print(f"Saved {len(data)} files to {folder_name}")


# print(SAVE_PATH5)

if __name__ == '__main__':
    trajectory = load_JSON_as_df(SAVE_PATH4)
    slice_trajectory(trajectory, 100, SAVE_FOLDER)
    # save_dict_as_json_files(sliced_data, SAVE_FOLDER)
