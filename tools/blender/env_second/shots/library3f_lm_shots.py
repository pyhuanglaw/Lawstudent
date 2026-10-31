"""總圖 3F 閱覽區（library 區域，library_3f.glb；ART-ECON-3D-GAP-1021 C，LAWWW2-B 2026-10-31）：固定鏡頭清單 → library3f_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/library3f_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 library 區域（room() 22×16×4.0 m）：x −11～11、z −8～8；後牆 z=−8 有四扇窗，前牆 z=+8 中間是樓梯間的門。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①從門口往北看整間 ②長桌（綠色檯燈）③西牆整面書架 ④後牆的窗和矮書櫃"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('door', (0.0, 1.7, 7.2), (0.0, 1.3, -7.0)),
     ('desks', (-6.6, 1.5, 1.8), (-1.0, 0.8, -3.0)),
     ('shelf', (-4.0, 1.6, 3.0), (-10.8, 1.4, -0.5)),
     ('windows', (2.0, 1.6, 1.0), (5.5, 1.8, -8.0))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'library', 'hour': h, 'pos': {'x': 0.0, 'z': 7.0, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'library3f_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
