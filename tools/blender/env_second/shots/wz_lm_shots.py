"""溫州街三家新店室內（wz_brunch／wz_print／wz_teahouse 區域；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31）：固定鏡頭清單 → wz_<店>_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/wz_lm_shots.py <brunch|print|teahouse> <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲區域座標（店門在 +z）。藏玩家、NPC；14:00、20:30 各一組。
  半熟（x ±3.2、z ±5）：①門口往裡看 ②左牆三張兩人桌 ③出餐檯、廚房 ④四人桌、櫃台
  阿德影印（x ±2.2、z ±4.6）：①門口往裡看 ②櫃台（從自助影印機旁邊）③櫃台後面的工作區 ④兩台大影印機
  一盞（房子 z −5～5、緣側 5～6.2、前院 6.2～9.6；遊戲的房間群組 +2.3、正式模型 −2.3，所以遊戲座標＝模型座標）：①玄關往裡看 ②茶席長桌 ③右邊的和室 ④緣側往前院看"""
import json, os, sys
SHOP, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
V = {'brunch': [('door', (0.4, 1.7, 4.3), (-0.5, 1.0, -4.5)),
                ('tables', (1.4, 1.6, 3.6), (-2.6, 0.8, -1.6)),
                ('kitchen', (1.6, 1.7, 2.0), (-1.0, 1.0, -4.6)),
                ('table4', (-1.6, 1.6, 4.0), (2.4, 0.9, -0.6))],
     'print': [('door', (0.0, 1.7, 4.1), (0.0, 1.0, -4.5)),
               ('counter', (1.4, 1.6, 3.8), (-0.9, 0.9, 0.4)),
               ('work', (-0.3, 1.7, 0.2), (1.3, 0.8, -4.4)),
               ('copiers', (1.0, 1.6, 2.0), (-1.9, 0.9, -2.4))],
     'teahouse': [('genkan', (-3.2, 1.6, 4.5), (0.8, 0.8, -1.0)),
                  ('table', (1.6, 1.5, 3.6), (-2.4, 0.7, 0.6)),
                  ('tatami', (3.6, 1.4, -1.0), (0.6, 0.4, -4.6)),
                  ('engawa', (-1.5, 1.4, 3.2), (2.5, 0.2, 8.5))]}[SHOP]
SPAWN = {'brunch': {'x': 0.4, 'z': 4.0, 'yaw': 3.1416}, 'print': {'x': 0.0, 'z': 3.6, 'yaw': 3.1416}, 'teahouse': {'x': -3.0, 'z': 4.2, 'yaw': 3.1416}}[SHOP]   # 配置的 spawn（影印店：牆內 0.95 m）
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'wz_' + SHOP, 'hour': h, 'pos': dict(SPAWN)}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'wz_{SHOP}_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
