"""街道道具（腳踏車、路燈、長椅）三時段前後比較的鏡頭清單 → props_shots.json（修改前／後用同一份清單；修改前＝fast_shots 加 --block=street_props.glb，只關掉道具的正式模型，其他正式模型照舊）。
用法：python3 tools/blender/env_second/shots/props_shots.py <前綴 before|after>"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = 'docs/art-rebuild/second_ai/shots'
mode = sys.argv[1]
H = {'1100': 11, '1730': 17.5, '2030': 20.5}
VIEWS = [   # 名稱、區域、玩家位置（藏起來）、鏡頭
    ('campus_bench', 'campus', {'x': -42, 'z': 5, 'yaw': 0}, [-42.5, 1.6, 7.0], [-50, 0.6, 13]),          # 椰林大道：長椅 (−50,13)、路燈 (−39,11)、(−61,11)
    ('campus_racks', 'campus', {'x': 6, 'z': 18, 'yaw': 0}, [5.5, 1.7, 18.0], [12, 0.5, 24]),             # 停車架 (12,24)
    ('wenzhou_park', 'wenzhou', {'x': 26, 'z': 2, 'yaw': 0}, [26, 1.7, 2.2], [26, 1.0, 9]),               # 小公園：長椅 (23.6,8)、(28.4,8)、路燈 (31,9.6)
    ('gongguan_lamps', 'gongguan', {'x': -50, 'z': 0, 'yaw': 0}, [-52, 1.7, -1], [-40, 2.6, 5]),         # 公館：路燈 (−45,5)、(−27,5)
]
shots = []
for name, zone, pos, eye, look in VIEWS:
    for t in ('1100', '1730', '2030'):
        shots.append({'out': f'{OUT}/props_{mode}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': zone, 'hour': H[t], 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3000})
p = os.path.join(HERE, f'props_{mode}.json'); json.dump(shots, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(shots))
