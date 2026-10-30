"""共同教學館室內（gongtong 區域；ART-ECON-3D-GAP-1021 A，LAWWW2-B 2026-10-30）：固定鏡頭清單 → gongtong_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/gongtong_int_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/gongtong_layout.js）：24 × 14 m，x 往東、z 往南（+z＝入口）；一樓 0、二樓 4.2。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①入口往北看大廳、樓梯 ②一樓走廊往西 ③101 階梯教室從最後一排往講台 ④102 教室 ⑤一樓休息區 ⑥二樓走廊往西 ⑦201 教室 ⑧二樓自習區"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
Y1 = 4.2
V = [('lobby', 0, (0.0, 1.6, 5.8), (0.0, 1.4, -3.0)),
     ('corr1', 0, (2.6, 1.6, 1.0), (-11.0, 1.3, 1.0)),
     ('lect101', 0, (8.0, 2.9, -6.2), (7.25, 1.2, 6.5)),
     ('cls102', 0, (-4.2, 1.6, -1.0), (-11.8, 1.3, -4.5)),
     ('lounge', 0, (-4.2, 1.6, 3.0), (-11.0, 0.8, 5.5)),
     ('corr2', 1, (10.8, Y1 + 1.6, 1.0), (-11.0, Y1 + 1.3, 1.0)),
     ('cls201', 1, (-4.2, Y1 + 1.6, -1.0), (-11.8, Y1 + 1.3, -4.5)),
     ('study2', 1, (-4.2, Y1 + 1.6, 3.0), (-11.0, Y1 + 0.8, 5.5))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, lv, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'gongtong', 'hour': h, 'pos': {'x': 0.0, 'z': 1.0, 'yaw': 3.1416, 'lv': lv}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'gongtong_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
