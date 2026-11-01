"""美國法學院圖書館（us_lawlib）、竹葉亞洲超市（us_asian_market）：固定鏡頭清單 → us_<區域>_<標籤>.json（fast_shots.py 用）。INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2-B 2026-10-31。
用法：python3 tools/blender/env_second/shots/us_rooms_lm_shots.py <輸出資料夾> <標籤> lawlib|market → fast_shots.py <URL> <JSON>
藏玩家、NPC；14:00、20:30 各一組。公寓另外一支（us_apartment_lm_shots.py）。
法學院圖書館（us_lawlib.layout.json：一樓 x ±13、z ±10，中庭 x ±7.5、z ±5.5 挑空到屋頂天窗 18.4 m，迴廊底下 4.2 m；大門在南牆，北牆一樓一整排彩色玻璃）：
  ①從大門往北（中庭、彩色玻璃）②中庭西南角往東北往上看（迴廊、天窗）③西北角迴廊底下（嵌燈、書架）④東邊樓梯口
亞洲超市（us_asian_market.layout.json：x ±8、z ±6，天花板 3.4 m；正面玻璃在南 z 6）：
  ①門口往西北（整間店）②中間走道往北 ③收銀台 ④店裡往南看正面玻璃"""
import json, os, sys
OUT, TAG, WHICH = sys.argv[1], sys.argv[2], sys.argv[3]
V = {'lawlib': ('us_lawlib', {'x': 0.0, 'z': 8.5, 'yaw': 0.0}, [
        ('entry', (0.0, 1.7, 9.0), (0.0, 2.6, -9.0)),
        ('atrium_up', (-9.5, 1.6, 7.5), (4.0, 9.0, -4.0)),
        ('gallery', (-11.5, 1.7, -2.0), (-9.5, 1.2, -9.0)),
        ('stair', (10.5, 1.7, 7.5), (6.4, 2.6, -3.0))]),
     'market': ('us_asian_market', {'x': 4.5, 'z': 4.6, 'yaw': 3.1416}, [
        ('entry', (7.0, 1.8, 5.2), (-5.0, 0.9, -4.5)),
        ('aisle', (0.5, 1.6, 5.2), (0.5, 1.0, -5.5)),
        ('checkout', (0.5, 1.7, 0.8), (-5.0, 1.0, 3.6)),
        ('front', (-2.0, 1.7, -4.0), (2.0, 1.2, 8.0))])}
zone, pos, shots = V[WHICH]
L = []
for h, ht in ((14.0, '1400'), (20.5, '2030')):
    for n, e, lk in shots:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': zone, 'hour': h, 'pos': pos}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 5000})
p = os.path.join(OUT, f'us_{WHICH}_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
