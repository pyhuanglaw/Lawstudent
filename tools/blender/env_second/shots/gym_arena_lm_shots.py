"""3F 主球場（gym_arena 區域，gym_arena.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → arena_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/gym_arena_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 gym_arena 區域：場地 x ±22、z −22～17（地板 y 0）；下層看台東西南三面；上層看台 7.6～12.1 m；北牆大螢幕；屋頂 23 m。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①南邊入口往北（場地、北牆大螢幕）②場地中間往東看台 ③西南角高處斜看（屋頂 LED、高窗、上層看台）④東看台上往場地"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('north', (0.0, 4.5, 24.0), (0.0, 6.0, -20.0)),
     ('east', (-4.0, 1.7, 0.0), (32.0, 6.0, 0.0)),
     ('corner', (-30.0, 14.0, 30.0), (10.0, 3.0, -12.0)),
     ('stands', (28.0, 6.0, 8.0), (-10.0, 1.0, -6.0))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'gym_arena', 'hour': h, 'pos': {'x': 0.0, 'z': 21.0, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'arena_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
