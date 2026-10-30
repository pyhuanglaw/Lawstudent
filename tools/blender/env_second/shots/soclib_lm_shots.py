"""社科院圖書館（辜先生紀念圖書館一樓開架閱覽室；SOCLIB-LM-1030，LAWWW2-B 2026-10-30）：固定鏡頭清單 → soclib_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/soclib_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/soclib_layout.js）：30 × 22 m、天花板 5.6 m；x 往東、z 往南（+z＝南牆：入口、服務台）；北牆、西牆是玻璃帷幕。藏玩家、NPC；14:00、20:30 各一組。
  ①入口往東北看整個閱覽室 ②閱覽長桌 ③樹狀柱、天窗（往上看）④北面窗邊長桌 ⑤弧形書架"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('hall', (-12.0, 2.4, 8.5), (2.0, 1.6, -6.0)),
     ('tables', (-1.0, 1.8, 2.5), (-9.0, 0.8, -4.0)),
     ('columns', (3.5, 1.7, 5.0), (8.0, 4.6, -3.0)),
     ('window', (0.0, 1.8, -6.5), (-6.0, 1.2, -10.5)),
     ('shelves', (9.0, 1.7, -1.5), (5.0, 1.0, -6.0))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'soclib', 'hour': h, 'pos': {'x': -9.0, 'z': 9.3, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'soclib_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
