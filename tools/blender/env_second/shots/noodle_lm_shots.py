"""阿鳳麵店室內（NOODLE-LM-1030，LAWWW2-B 2026-10-30）：固定鏡頭清單 → noodle_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/noodle_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 noodle 區域（room() 10×9×3.2 m）：店面在 +z（z＝4.5，中間是門、x＝±3 兩扇窗），後牆 z＝−4.5 是煮麵台、價目板。藏玩家、NPC；14:00、20:30 各一組。
  ①門口往裡看（煮麵台、價目板）②後面往店面看（桌子、窗）③煮麵台近看 ④往上看日光燈管 ⑤左邊牆（菜單、電視）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('door', (0.0, 1.75, 3.9), (0.0, 1.2, -4.2)),
     ('tables', (4.2, 1.8, -2.6), (-2.0, 0.9, 3.6)),
     ('counter', (1.6, 1.6, -0.8), (-1.8, 1.0, -4.3)),
     ('ceiling', (-3.6, 1.4, 3.8), (1.0, 3.1, -2.2)),
     ('left', (3.4, 1.7, 3.6), (-4.9, 1.7, -1.2))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'noodle', 'hour': h, 'pos': {'x': 0.0, 'z': 3.4, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'noodle_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
