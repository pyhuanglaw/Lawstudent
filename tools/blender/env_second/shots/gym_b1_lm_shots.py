"""B1（gym_b1 區域，gym_b1.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → b1_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/gym_b1_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 gym_b1 區域：泳池 x ±24、z −24～−0.2（天花板 7 m）；走廊 z −0.2～3；健身中心 x −24～10、z 3～14；大廳 x 12～24、z 2～14。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①泳池（從池邊東南角往西北）②健身中心（從門口往西）③走廊（從閘門往西）④大廳（往櫃台、樓梯）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('pool', (22.0, 2.4, -1.5), (-10.0, 0.5, -16.0)),
     ('fitness', (8.5, 1.7, 4.0), (-20.0, 1.0, 11.0)),
     ('corridor', (11.0, 1.7, 1.4), (-20.0, 1.2, 1.4)),
     ('lobby', (23.0, 1.8, 3.0), (12.0, 1.0, 9.0))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'gym_b1', 'hour': h, 'pos': {'x': 18.0, 'z': 6.0, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'b1_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
