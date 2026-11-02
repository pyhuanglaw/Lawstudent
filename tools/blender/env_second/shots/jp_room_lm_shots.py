"""日本宿舍房間（jp_room 區域，jp_room.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2（帳號 A）2026-11-02）：固定鏡頭清單 → jp_room_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/jp_room_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 jp_room 區域：x −1.4～1.4、z −2.3～2.3，天花板 2.5 m；窗在北牆（z −2.3），門在南牆靠西。藏玩家、NPC；14:00、21:00 各一組。
鏡頭：①門口往窗看（整間） ②窗邊往門口看（衣櫃、玄關） ③書桌（檯燈、書櫃） ④床（床頭靠窗）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('door', (-0.55, 1.6, 2.05), (0.0, 1.15, -2.3)),
     ('window', (0.35, 1.6, -1.95), (-0.3, 0.95, 2.3)),
     ('desk', (0.1, 1.5, -0.35), (-1.25, 0.85, -1.55)),
     ('bed', (-0.75, 1.7, 0.45), (1.0, 0.45, -1.3))]
L = []
for h, ht in ((14.0, '1400'), (21.0, '2100')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'jp_room', 'hour': h, 'pos': {'x': -0.55, 'z': 1.1, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'jp_room_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
