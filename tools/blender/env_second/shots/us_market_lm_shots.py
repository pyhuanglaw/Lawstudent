"""美國草原超市（us_market 區域，us_market.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2（帳號 A）2026-11-02）：固定鏡頭清單 → us_market_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/us_market_lm_shots.py <輸出資料夾> <標籤> [鏡頭，逗號分開，預設前四個] → fast_shots.py <URL> <JSON>
座標＝遊戲 us_market 區域：x −22～22、z −16～16，挑高 6.4 m；入口在南邊（z 16，玻璃帷幕）。藏玩家、NPC；14:00、20:30 各一組。
鏡頭：①入口往北看整間 ②第 5、6 排貨架中間的走道 ③東邊蔬果區（冷藏蔬菜牆） ④西南的結帳區往入口看
  ⑤ frozen（要另外指定）：西邊冷凍走道往北（天花板這一段沒有燈條，烘出來比中間走道暗；11-02 定案後補拍確認）"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('entry', (10.0, 2.4, 14.6), (-4.0, 1.0, -10.0)),
     ('aisle', (0.65, 1.6, 8.0), (0.65, 1.0, -10.0)),
     ('produce', (11.5, 1.8, 9.5), (21.0, 1.0, -4.0)),
     ('checkout', (-14.0, 1.9, 4.0), (-2.0, 1.0, 13.5)),
     ('frozen', (-17.5, 1.7, 7.5), (-18.0, 1.0, -10.0))]
PICK = sys.argv[3].split(',') if len(sys.argv) > 3 else ['entry', 'aisle', 'produce', 'checkout']
V = [v for v in V if v[0] in PICK]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'us_market', 'hour': h, 'pos': {'x': 13.5, 'z': 13.6, 'yaw': 3.1416}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'us_market_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
