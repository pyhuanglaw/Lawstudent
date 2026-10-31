"""舊路書房室內（bookstore 區域，bookstore_interior.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → bookstore_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/bookstore_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 bookstore 區域（room() 12×10×3.4 m）：x −6～6、z −5～5；店面（玻璃、門）在 z=+5，後牆、左右牆是書架，中間兩排雙面書架在 x=±2（z −2.5～2.5），櫃台桌在 (0, 3)。
藏玩家、NPC；14:00、20:30 各一組。鏡頭：①門口往裡看 ②左邊走道 ③櫃台桌 ④右牆書架"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('door', (0.0, 1.8, 4.6), (0.0, 1.1, -5.0)),
     ('aisle', (-3.9, 1.6, 3.8), (-3.9, 1.0, -4.6)),
     ('table', (2.8, 1.6, 4.5), (0.0, 0.8, 2.6)),
     ('shelf', (3.6, 1.6, 2.6), (5.8, 1.2, -1.8))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'bookstore', 'hour': h, 'pos': {'x': 0.0, 'z': 4.0, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'bookstore_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
