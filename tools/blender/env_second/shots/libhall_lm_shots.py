"""總圖大廳室內（library_hall；LM-COLLAPSE-1030，LAWWW2-B 2026-10-30）：固定鏡頭清單 → libhall_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/libhall_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/library_layout.js）：24 × 18 m，x 往東、z 往南（+z＝入口）；一樓地板 0、二樓 5.0。藏玩家、NPC；14:00、20:30 各一組。
對準 collapse_black 壓扁過的幾面（lm_squash_scan.py）：①從入口往北看中央大樓梯、北牆 ②往東北上看二樓樓板底面 ③西側灰泥牆 ④東側灰泥牆"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('stair_n', (0.0, 1.7, 6.0), (0.0, 2.6, -8.9)),
     ('slab_ne', (-3.0, 1.5, 7.5), (8.0, 4.6, 4.0)),
     ('west', (-10.0, 1.7, 2.0), (-5.2, 1.6, -6.1)),
     ('east', (10.0, 1.7, 2.0), (5.2, 1.6, -3.4))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'library_hall', 'hour': h, 'pos': {'x': 0.0, 'z': 6.6, 'yaw': 3.1416, 'lv': 0}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'libhall_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
