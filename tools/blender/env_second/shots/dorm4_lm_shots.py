"""宿舍四人房（dorm 區域，dorm_room4.glb；LM-COLLAPSE-1030，LAWWW2-B 2026-10-30）：固定鏡頭清單 → dorm4_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/dorm4_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/dorm_room_layout.js）：6 × 7 m、天花板 3 m；門在 +z（z 3.5），窗在 −z；洗手間在右前角（x 0.6～2.9、z 1.4～3.4）。藏玩家、NPC；14:00、20:30 各一組。
對準 collapse_black 壓扁過的兩面牆（lm_squash_scan.py）：①左牆靠門那一半 ②右牆靠窗那一半 ③從門口看整間"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('left', (1.0, 1.6, 2.8), (-2.9, 1.2, 0.3)),
     ('right', (-1.0, 1.6, 2.8), (2.9, 1.2, -1.4)),
     ('room', (0.0, 1.7, 3.1), (0.0, 1.3, -3.5))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'dorm', 'hour': h, 'pos': {'x': 0.0, 'z': 2.4, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'dorm4_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
