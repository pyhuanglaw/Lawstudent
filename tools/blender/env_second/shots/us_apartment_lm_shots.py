"""美國公寓（us_apartment 區域，us_apartment.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → usapt_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/us_apartment_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 us_apartment 區域（src/data/us_apartment_layout.js）：整戶 x −4.6～5、z −3～3（天花板 2.6 m）；窗、陽台門在北牆 z −3；大門在南牆，外面是走廊平台 z 3～5。
藏玩家、NPC；14:00、20:30 各一組（日子照 fast_shots.py 預設的第 8 天：九月，窗外沒有雪）。
鏡頭：①客廳（從走道往北：沙發、吊扇、窗）②臥室（從門口往東北：床、書桌、窗）③廚房（從客廳往南：吧檯、爐子、冰箱）④門外平台（從平台東端往西：大門、壁燈）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('living', (-0.6, 1.6, 1.6), (-3.2, 0.9, -2.4)),
     ('bedroom', (1.7, 1.6, 0.6), (4.4, 0.8, -2.2)),
     ('kitchen', (-1.4, 1.6, -1.8), (-3.6, 0.9, 2.4)),
     ('landing', (3.8, 1.7, 4.3), (-1.8, 1.0, 3.2))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'us_apartment', 'hour': h, 'pos': {'x': -1.0, 'z': 2.2, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'usapt_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
