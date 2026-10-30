"""法律學院圖書館（INTERIOR-AAA 第三間，LAWLIB-LM-1030；LAWWW2-B 2026-10-30）：固定鏡頭清單 → lawlib_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/lawlib_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/lawlib_layout.js）：x 往東、z 往南（+z 南牆的窗）；一樓地板 0、二樓 4.2。藏玩家、NPC；14:00、20:30 各一組。
  ①一樓閱覽區（從入口那一側往西北看兩張長桌、綠色桌燈）②長桌旁邊往南看窗 ③櫃台、入口閘門 ④二樓書庫（書架走道）⑤二樓閱覽區（南窗邊）
  ⑥一樓東牆 ⑦二樓東牆 ⑧一樓西南的隔間牆（LM-COLLAPSE-1030：烘焙工具 collapse_black 壓扁的幾面）
  第三個參數（選用）：只拍這幾個鏡頭，逗號分開（例：east1,east2,inner）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('reading', 0, (4.2, 0.0), (5.2, 2.4, 5.6), (-1.5, 0.6, -1.5)),
     ('tables', 0, (-3.0, 0.0), (-4.6, 1.6, -3.6), (1.0, 0.9, 1.6)),
     ('counter', 0, (5.2, 6.6), (6.4, 2.3, 2.4), (2.2, 0.9, 6.6)),
     ('stacks', 1, (0.8, -2.2), (6.2, 6.3, -6.6), (-0.5, 4.8, 0.6)),
     ('upper_read', 1, (1.0, 5.0), (-3.0, 6.0, 2.6), (3.5, 4.8, 6.4)),
     ('east1', 0, (0.0, 2.0), (-3.0, 1.7, 2.6), (7.1, 1.3, -2.4)),
     ('east2', 1, (1.0, 5.0), (-3.0, 5.9, 2.6), (7.1, 5.4, -2.4)),
     ('inner', 0, (0.0, 2.0), (1.0, 1.7, 6.2), (-4.4, 1.3, 3.6))]
if len(sys.argv) > 3: V = [v for v in V if v[0] in sys.argv[3].split(',')]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, lv, p, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'lawlib', 'hour': h, 'pos': {'x': p[0], 'z': p[1], 'yaw': 0, 'lv': lv}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'lawlib_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
