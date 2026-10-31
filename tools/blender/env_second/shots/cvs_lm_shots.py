"""日日便利室內（cvs 區域，cvs_interior.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → cvs_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/cvs_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 cvs 區域（room() 12×9×3.2 m）：x −6～6、z −4.5～4.5；店面（玻璃、自動門）在 z=+4.5，後牆 z=−4.5 是貨架，右牆 x=+6 是飲料櫃，櫃檯在 (4, −1.5)。
藏玩家、NPC；14:00、20:30 各一組。鏡頭：①從門口往裡看 ②中間走道往後牆 ③櫃檯（從雙面貨架和右牆之間的走道）④飲料櫃（雙面貨架在 x=±2、長 5 m：鏡頭不要放進貨架）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('door', (0.0, 1.7, 4.2), (0.0, 1.2, -4.5)),
     ('aisle', (-4.0, 1.6, 3.0), (-1.0, 1.0, -4.4)),
     ('counter', (3.5, 1.7, 3.8), (4.0, 0.9, -1.8)),
     ('cooler', (3.0, 1.6, -0.4), (6.0, 1.1, 2.6))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'cvs', 'hour': h, 'pos': {'x': 0.0, 'z': 3.5, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'cvs_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
