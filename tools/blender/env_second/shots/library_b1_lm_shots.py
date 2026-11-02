"""總圖 B1 自習室・討論室（library_b1 區域，library_b1.glb；INTERIOR-AAA-REVIEW-1028 光照烘焙，LAWWW2（帳號 A）2026-11-02）：固定鏡頭清單 → library_b1_<標籤>.json（fast_shots.py 用）。
用法：python3 tools/blender/env_second/shots/library_b1_lm_shots.py <輸出資料夾> <標籤> → fast_shots.py <URL> <JSON>
座標＝遊戲 library_b1 區域：x −12～12、z −9～9，天花板 3.2 m；地下室沒有窗（白天、晚上一樣，照樣各拍一組確認）。藏玩家、NPC；14:00、22:00 各一組。
鏡頭：①自習室門口往北看整間 ②中間那排雙面長桌（綠色檯燈）③討論室 1 門口往南（六人桌、白板）④樓梯間門口往東看門廳、走道"""
import json, os, sys
OUT, TAG = sys.argv[1], sys.argv[2]
V = [('study', (-5.0, 1.7, -1.7), (2.0, 1.0, -8.5)),
     ('desks', (-6.4, 1.5, -2.5), (1.0, 0.85, -4.0)),
     ('disc1', (-3.0, 1.7, 1.7), (-4.5, 1.0, 8.5)),
     ('lobby', (-11.2, 1.7, -2.4), (2.0, 1.2, -2.0))]
L = []
for h, ht in ((14.0, '1400'), (22.0, '2200')):
    for n, e, lk in V:
        L.append({'out': os.path.join(OUT, f'{TAG}_{n}_{ht}.png'), 'w': 1280, 'h': 720, 'hidePlayer': True, 'hideNPCs': True,
                  'state': {'zone': 'library_b1', 'hour': h, 'pos': {'x': -10.5, 'z': -2.4, 'yaw': 1.5708}}, 'cam': {'pos': list(e), 'look': list(lk)}, 'wait': 4000})
p = os.path.join(OUT, f'library_b1_{TAG}.json'); json.dump(L, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(L))
