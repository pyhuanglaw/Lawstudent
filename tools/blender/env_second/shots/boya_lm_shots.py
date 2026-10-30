"""博思教學館室內（BOYA-LM-1030；LAWWW2-B 2026-10-30）：固定鏡頭清單 → boya_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/boya_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝配置（src/data/boya_layout.js）：34 × 18 m，x 往東、z 往南（+z＝南牆：入口）；一樓地板 0、天花板 4.2；二樓地板 4.8、屋頂 8.6。
101（西）、102（東）是階梯教室：講台在南邊（+z）、座位往北一排一排升高（最後一排平台 1.8 m）。藏玩家、NPC；14:00、20:30 各一組。
  ①101 最後一排往講台看 ②101 講台往座位看 ③101 座位近看（翻椅、長桌）④一樓大廳往北 ⑤二樓走廊往西
  ⑥102 最後一排往講台看（BB-B n19 第二次：講台那面牆的斜影 101、102 都有，102 和 101 左右對稱）
  第三個參數（選用）：只拍這幾個鏡頭，逗號分開（例：back,seats,back102）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('back', 0, (-11.0, 6.0), (-8.0, 3.7, -8.4), (-12.4, 1.0, 6.5)),
     ('stage', 0, (-11.0, 6.0), (-8.6, 1.75, 8.3), (-12.0, 1.4, -5.0)),
     ('seats', 0, (-11.0, 6.0), (-12.2, 2.35, 0.2), (-13.8, 0.85, 3.4)),
     ('lobby', 0, (0.0, 5.0), (4.6, 2.1, 8.2), (-2.5, 1.3, -5.0)),
     ('corridor2', 1, (3.0, 1.0), (5.4, 6.5, 1.0), (-6.0, 5.6, 1.0)),
     ('back102', 0, (11.0, 6.0), (8.0, 3.7, -8.4), (12.4, 1.0, 6.5))]
if len(sys.argv) > 3: V = [v for v in V if v[0] in sys.argv[3].split(',')]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, lv, p, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'boya', 'hour': h, 'pos': {'x': p[0], 'z': p[1], 'yaw': 0, 'lv': lv}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'boya_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
