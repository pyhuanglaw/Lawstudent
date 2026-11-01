"""萬才館多功能教室 v2（MULTI-ROOM-V2-1030；LAWWW2-B 2026-10-30）：固定鏡頭清單 → multi_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/multi_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝房間自己的座標（flat_classroom.py）：11.6 × 9.0 m，x −5.8～5.8、z −4.5～4.5；白板、投影幕在西牆（−x）、窗在 +z、門在 −z 靠東。藏玩家、NPC；14:00、20:30。
  ①後面（東北角）往講台看 ②窗邊沿著排往門看 ③椅子近看 ④天花板（燈具、冷氣）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('back', (4.6, -2.6), (5.3, 2.3, -3.9), (-4.5, 0.9, 1.2)),
     ('rows', (0.0, 3.6), (1.2, 1.6, 4.1), (-1.0, 0.6, -3.6)),
     ('chairs', (3.0, 1.6), (3.4, 1.15, 1.9), (1.2, 0.45, -0.6)),
     ('ceiling', (4.4, 0.0), (5.2, 1.5, 0.3), (-5.8, 3.0, -0.2))]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, p, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'wancai_multi', 'hour': h, 'pos': {'x': p[0], 'z': p[1], 'yaw': 0}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'multi_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
