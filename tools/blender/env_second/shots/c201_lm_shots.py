"""法律系館A 201 階梯教室（classroom 區域，classroom_201.glb；LM-COLLAPSE-1030，LAWWW2-B 2026-10-30）：固定鏡頭清單 → c201_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/c201_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/classroom_layout.js）：16 × 17.4 m；講台在北（z < −4.6），座位往南一排一排升高，門在南（z 7.9）。藏玩家、NPC；14:00、20:30 各一組。
對準 collapse_black 壓扁過的西牆下緣兩小塊（lm_squash_scan.py）：①講台西側 ②第二排西側 ③從後門口看整間"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('west_stage', (-2.0, 1.7, -2.5), (-7.9, 0.8, -5.1)),
     ('west_rows', (-3.0, 2.4, 3.0), (-7.9, 1.0, -1.1)),
     ('overview', (0.0, 4.0, 7.0), (0.0, 1.5, -8.0))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'classroom', 'hour': h, 'pos': {'x': 0.0, 'z': 7.4, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'c201_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
