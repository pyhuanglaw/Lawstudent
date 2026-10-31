"""普通教學館室內（putong 區域；ART-ECON-3D-GAP-1021 B，LAWWW2-B 2026-10-31）：固定鏡頭清單 → putong_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/putong_int_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/putong_layout.js）：34 × 16 m，x 往東、z 往南（+z＝入口）；一樓 0、二樓 4.2。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①入口往北看大廳、樓梯 ②一樓走廊往西 ③101 教室 ④104 教室 ⑤樓梯 ⑥二樓走廊往西 ⑦202 教室 ⑧二樓大廳往空橋口"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
Y1 = 4.2
V = [('lobby', 0, (0.0, 1.6, 7.4), (0.0, 1.4, -3.0)),
     ('corr1', 0, (3.6, 1.6, 0.2), (-16.0, 1.3, 0.2)),
     ('cls101', 0, (-4.9, 1.6, -1.6), (-16.8, 1.3, -5.0)),
     ('cls104', 0, (4.9, 1.6, 2.0), (16.8, 1.3, 5.5)),
     ('stair', 0, (2.6, 1.6, 0.6), (0.0, 2.6, -6.0)),
     ('corr2', 1, (16.0, Y1 + 1.6, 0.2), (-16.0, Y1 + 1.3, 0.2)),
     ('cls202', 1, (4.9, Y1 + 1.6, -1.6), (16.8, Y1 + 1.3, -5.0)),
     ('lobby2', 1, (0.0, Y1 + 1.6, 7.2), (-3.2, Y1 + 1.3, -7.9))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, lv, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'putong', 'hour': h, 'pos': {'x': 0.0, 'z': 0.2, 'yaw': 3.1416, 'lv': lv}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'putong_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
