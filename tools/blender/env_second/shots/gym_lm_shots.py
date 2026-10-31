"""綜合體育館室內（gym 區域，gym_interior.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → gym_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/gym_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 gym 區域：球場 x ±20、z −19～11（高 9 m）；大廳 z 11～19（高 4.2 m）；入口在 +z。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①大廳（從入口往裡看）②球場（從中間的開口往看台、記分板）③球場角落斜看（高天井燈、高窗、護牆軟墊）④大廳往樓梯、服務台"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('lobby', (0.0, 1.7, 18.4), (0.0, 1.4, 9.0)),
     ('court', (0.0, 2.0, 9.6), (0.0, 2.5, -18.0)),
     ('corner', (-17.5, 3.0, -16.5), (8.0, 2.0, 6.0)),
     ('desk', (-6.0, 1.7, 17.5), (14.0, 1.2, 13.5))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'gym', 'hour': h, 'pos': {'x': 0.0, 'z': 17.6, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'gym_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
