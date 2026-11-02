"""總圖 3F 閱覽區第二版的配置（LIB-3F-1102，LAWWW2 帳號 A 2026-11-02）：純 Python，不需要 Blender。WIP，還沒交件。
  python3 tools/blender/env_second/library_3f_v2_layout.py [--write <repo>] [--json <檔>]
  --write 寫 <repo>/src/data/library_3f_layout.js（const LIBRARY3F_LAYOUT）；遊戲 src/library_3f_v2.js、Blender tools/blender/env_second/library_3f_v2.py 讀同一份。

依據（使用者 11-02 08:58 的 3F 平面圖，docs/art-rebuild/second_ai/ref/lib1102_user/0858_plan_3f.jpg）：
  臺大人文庫（北側半圓）、討論室 344／346（人文庫兩旁）、無線上網區、現期期刊（中間的紅色展示架＋休息區）、
  人社西文裝訂期刊（西北，粉紅）、人社中文裝訂期刊（西側，黃）、科技西文裝訂期刊（東側，藍）、科技中文裝訂期刊（中南，綠）、
  研究小間（西南、東南角）、考古題、指定參考書、四庫全書、參考書（東南）、靠東西兩面窗的閱覽桌。
和大廳第二版（src/data/library_layout.js version 2）同一個外框：x −12～12、z −17～9；北側半圓（人文庫）圓心 (0, −17)、半徑 5.4（大廳的展演廳挑高到 9.6 m，3F 在它上面）。
  樓梯間：大廳二樓東牆 (11.8, −6) 的門「往 3F 閱覽區」→ 3F 的門在同一個位置（東牆 z −6）。
  電梯：和大廳同一個井（x 9.4～11.4、z −2.6～−0.4、門朝北）。
這是遊戲化的配置：實際的總圖 3F 比遊戲的外框大很多，這裡照平面圖的相對位置與氣氛壓縮。

劇情要保留的（LAWWW 11-02 15:34）：
  - seats 的順序：seats[2]＝學姊（story3d.js:303），放在西側靠窗那一排（「三樓靠窗」）；
  - 「三樓靠窗（那排）」的台詞很多：東、西兩面窗前都有閱覽桌；
  - pool 的 seatAt (−2.4, 1.5)（pool_more3d.js）、(5.6, −3.9)（pool_story.js「坐窗邊的人」）、課程導覽最後一站 (0, 3.2)（classes3d.js）：
    第二版的對照在 SEAT_MAP，patch 一起改那幾個檔，README 附新舊對照表。
"""
import json, math, os, sys

W, D = 24.0, 26.0
X0, X1, Z0, Z1 = -12.0, 12.0, -17.0, 9.0
H = 4.0                                   # 天花板（第一版 3F 也是 4.0）
ROT = {'cx': 0.0, 'cz': -17.0, 'r': 5.4, 'open': {'x0': -1.6, 'x1': 1.6}}      # 人文庫：北牆中間的玻璃門 x ±1.6
ELEV = {'x0': 9.4, 'x1': 11.4, 'z0': -2.6, 'z1': -0.4, 'doorX0': 9.8, 'doorX1': 11.0, 'doorZ': -2.6, 'callZ': -3.6}   # 和大廳同一個井
STAIR_DOOR = {'x': 11.8, 'z': -6.0, 'w': 1.2}                                     # 東牆的樓梯間門（往下 2F、1F）
SPAWN_STAIRS = {'x': 10.6, 'z': -6.0, 'yaw': -math.pi / 2}                        # 從樓梯間進來：面向西


def build():
    L = {'version': 2, 'W': W, 'D': D, 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'h': H, 'rotunda': ROT,
         'navBox': {'x0': -13.0, 'x1': 13.0, 'z0': -23.6, 'z1': 10.0},
         'elevator': ELEV, 'stairDoor': STAIR_DOOR, 'spawnFromStairs': SPAWN_STAIRS,
         'note': '總圖 3F 第二版（LIB-3F-1102，LAWWW2 2026-11-02）：使用者 11-02 08:58 的 3F 平面圖。產生：tools/blender/env_second/library_3f_v2_layout.py，不要手改。'}
    F = []      # 家具（type：desk 閱覽桌、stack 雙面書架、wallShelf 靠牆書架、display 現期期刊展示架、roundTable、lounge、carrel 研究小間、room 討論室）
    seats = []  # [x, z, yaw, label]；順序有意義：seats[2]＝學姊

    # ---- 西側靠窗的閱覽桌（「三樓靠窗」）：單面長桌貼西窗，人面向窗（−x） ----
    for zc in (-8.4, -5.0, -1.6, 1.8):
        F.append({'type': 'desk', 'x': -11.35, 'z': zc, 'w': 0.8, 'd': 3.0, 'h': 0.76, 'lamp': True, 'side': 'west'})
        for k in (-1, 0, 1):
            seats.append([-10.55, round(zc + k * 1.0, 2), -math.pi / 2, '西側靠窗'])
    # ---- 東側靠窗：電梯（z −2.6～−0.4）和樓梯間門（z −6）的南邊、北邊 ----
    for zc in (1.6, 4.6):
        F.append({'type': 'desk', 'x': 11.35, 'z': zc, 'w': 0.8, 'd': 3.0, 'h': 0.76, 'lamp': True, 'side': 'east'})
        for k in (-1, 0, 1):
            seats.append([10.55, round(zc + k * 1.0, 2), math.pi / 2, '東側靠窗'])
    # ---- 南側：科技中文裝訂期刊前面的長桌（雙面） ----
    for xc in (-3.0, 3.0):
        F.append({'type': 'desk', 'x': xc, 'z': 6.4, 'w': 3.4, 'd': 1.2, 'h': 0.76, 'lamp': True, 'side': 'both'})
        for k in (-1, 0, 1):
            for s in (-1, 1):
                seats.append([round(xc + k * 1.05, 2), round(6.4 + s * 0.85, 2), 0.0 if s < 0 else math.pi, '南側長桌'])
    # ---- 東北：無線上網區（兩張四人桌） ----
    for xc in (8.0, 10.4):
        F.append({'type': 'desk', 'x': xc, 'z': -12.6, 'w': 1.6, 'd': 1.0, 'h': 0.76, 'lamp': False, 'side': 'both', 'outlets': True})
        for k in (-1, 1):
            for s in (-1, 1):
                seats.append([round(xc + k * 0.4, 2), round(-12.6 + s * 0.8, 2), 0.0 if s < 0 else math.pi, '無線上網區'])
    # ---- 北側中間：現期期刊的休息區（兩張圓桌＋扶手椅） ----
    for xc in (-2.4, 2.4):
        F.append({'type': 'roundTable', 'x': xc, 'z': -10.4, 'r': 0.45})
        for a in (0, 120, 240):
            t = math.radians(a + 90)
            seats.append([round(xc + 0.95 * math.cos(t), 2), round(-10.4 + 0.95 * math.sin(t), 2), round(math.atan2(math.cos(t), math.sin(t)) + math.pi, 3), '現期期刊休息區'])
    # 學姊坐 seats[2]：照順序前三個都是西側靠窗那一排（z −9.4、−8.4、−7.4）——seats[2]＝(−10.55, −7.4)
    # ---- 書架 ----
    F.append({'type': 'stack', 'x': -9.0, 'z': -15.4, 'w': 4.6, 'd': 0.62, 'h': 2.1, 'cap': '#f2b8a0', 'label': '人社西文裝訂期刊'})       # 西北：粉紅
    F.append({'type': 'stack', 'x': -9.0, 'z': -13.0, 'w': 4.6, 'd': 0.62, 'h': 2.1, 'cap': '#f2b8a0', 'label': '人社西文裝訂期刊'})
    for xs in (-7.4, -5.6):                                                                                                              # 西側：黃，南北向
        F.append({'type': 'stack', 'x': xs, 'z': -3.4, 'w': 0.62, 'd': 8.6, 'h': 2.1, 'cap': '#e8b923', 'label': '人社中文裝訂期刊'})
    for xs in (5.6, 7.4):                                                                                                                # 東側：藍，南北向
        F.append({'type': 'stack', 'x': xs, 'z': -5.4, 'w': 0.62, 'd': 6.6, 'h': 2.1, 'cap': '#3a7ca5', 'label': '科技西文裝訂期刊'})
    for xs in (-1.6, 1.6):                                                                                                               # 中南：綠（科技中文）
        F.append({'type': 'stack', 'x': xs, 'z': 2.6, 'w': 2.4, 'd': 0.62, 'h': 1.6, 'cap': '#2bb3a0', 'label': '科技中文裝訂期刊'})
    for zc in (-7.4, -5.4, -3.4):                                                                                                        # 中間：現期期刊（紅）的展示架
        F.append({'type': 'display', 'x': 0.0, 'z': zc, 'w': 3.6, 'd': 0.6, 'h': 1.4, 'cap': '#b3283a', 'label': '現期期刊'})
    F.append({'type': 'wallShelf', 'x': 11.65, 'z': -13.6, 'w': 0.45, 'd': 4.4, 'h': 2.1, 'ry': -math.pi / 2, 'label': '考古題'})      # 東北牆：考古題
    F.append({'type': 'wallShelf', 'x': 7.0, 'z': 8.65, 'w': 3.0, 'd': 0.45, 'h': 2.1, 'ry': math.pi, 'label': '指定參考書'})          # 東南
    F.append({'type': 'wallShelf', 'x': 10.2, 'z': 8.65, 'w': 3.0, 'd': 0.45, 'h': 2.1, 'ry': math.pi, 'label': '四庫全書'})
    F.append({'type': 'wallShelf', 'x': 11.65, 'z': 7.6, 'w': 0.45, 'd': 1.8, 'h': 2.1, 'ry': -math.pi / 2, 'label': '參考書'})
    # ---- 研究小間（西南角，一排四間，關著） ----
    for k in range(4):
        F.append({'type': 'carrel', 'x': round(-11.0 + k * 1.6, 2), 'z': 7.8, 'w': 1.5, 'd': 2.2, 'label': '研究小間 3%02d' % (56 + k)})
    # ---- 討論室 344、346（人文庫兩旁，關著） ----
    F.append({'type': 'room', 'id': 'disc344', 'x0': -9.2, 'x1': -5.6, 'z0': -17.0, 'z1': -14.6, 'label': '討論室 344'})
    F.append({'type': 'room', 'id': 'disc346', 'x0': 5.6, 'x1': 9.2, 'z0': -17.0, 'z1': -14.6, 'label': '討論室 346'})
    L['furniture'] = F
    # 窗：西、東、南三面（每 2.4 m 一扇；東牆避開樓梯間門和電梯）。Blender 開窗洞、遊戲在窗外放景（views/library_3f_*）
    zs = [round(Z0 + 1.6 + 2.4 * k, 2) for k in range(11) if Z0 + 1.6 + 2.4 * k + 0.9 < Z1 - 0.3]
    xs = [round(X0 + 1.4 + 2.4 * k, 2) for k in range(10) if X0 + 1.4 + 2.4 * k + 0.9 < X1 - 0.3]
    L['windows'] = {'y0': 0.95, 'y1': 3.05, 'hw': 0.85, 'west': zs,
                    'east': [z for z in zs if abs(z - STAIR_DOOR['z']) > 1.6 and not (ELEV['z0'] - 1.0 < z < ELEV['z1'] + 1.0)], 'south': xs}
    L['seats'] = [{'x': s[0], 'z': s[1], 'yaw': round(s[2], 4), 'label': s[3]} for s in seats]
    # 第一版 → 第二版的座標對照（劇情、作息寫死的位置；patch 一起改）
    L['seatMap'] = [{'what': '學姊（story3d.js:303，seats[2]）', 'v1': [-2.4, -3.9], 'v2': seats[2][:2]},
                    {'what': 'pool「愛睡覺的男生」seatAt（pool_more3d.js:70）', 'v1': [-2.4, 1.5], 'v2': [-3.0, 7.25]},
                    {'what': 'pool「坐窗邊的人」seatAt（pool_story.js:72）', 'v1': [5.6, -3.9], 'v2': [10.55, 1.6]},
                    {'what': '課程導覽最後一站（classes3d.js:410）', 'v1': [0, 3.2], 'v2': [0.0, 4.4]},
                    {'what': '從樓梯間進來（library_layout.js reading.spawnFromStairs）', 'v1': [0, 7], 'v2': [SPAWN_STAIRS['x'], SPAWN_STAIRS['z']]},
                    {'what': '電梯（library_layout.js reading.elevator）', 'v1': [[8.8, 10.8], [-1, 1.2]], 'v2': [[ELEV['x0'], ELEV['x1']], [ELEV['z0'], ELEV['z1']]]},
                    {'what': '「看桌上的紙條」（守誠那張桌子；pool_more3d.js 的 POP）', 'v1': [-2.4, 0.6], 'v2': [-3.0, 6.75]},
                    {'what': '「看期刊架」（語彤的系刊；r2y4a3d.js 的 shelfPlace）', 'v1': [-9.7, 2.4], 'v2': [0.0, -2.75]}]
    L['signs'] = [{'text': '臺大人文庫', 'x': 0.0, 'z': -16.88, 'y': 3.0, 'ry': 0, 'w': 2.4},
                  {'text': '現期期刊', 'x': 0.0, 'z': -8.6, 'y': 2.6, 'ry': 0, 'w': 1.8},
                  {'text': '無線上網區', 'x': 9.2, 'z': -16.88, 'y': 2.9, 'ry': 0, 'w': 2.2},
                  {'text': '樓梯間 ↓ 2F・1F', 'x': 11.88, 'z': -6.0, 'y': 2.7, 'ry': -math.pi / 2, 'w': 1.8},
                  {'text': '研究小間', 'x': -8.6, 'z': 6.5, 'y': 2.6, 'ry': 0, 'w': 1.6},
                  {'text': '指定參考書・四庫全書', 'x': 8.6, 'z': 8.42, 'y': 2.6, 'ry': math.pi, 'w': 3.0}]
    return L


def write_js(L, repo):
    p = os.path.join(repo, 'src', 'data', 'library_3f_layout.js')
    head = ('/* ===== 總圖 3F 閱覽區第二版的配置（LIB-3F-1102）=====\n'
            '   由 tools/blender/env_second/library_3f_v2_layout.py 產生，不要手改。遊戲 src/library_3f_v2.js、Blender tools/blender/env_second/library_3f_v2.py 讀同一份。\n'
            '   座標：x 往東、z 往南（+z 是正面）、y 往上；和大廳（src/data/library_layout.js version 2）同一個外框。 */\n')
    open(p, 'w', encoding='utf-8').write(head + 'const LIBRARY3F_LAYOUT=' + json.dumps(L, ensure_ascii=False, indent=2) + ';\n')
    return p


if __name__ == '__main__':
    A = sys.argv[1:]
    L = build()
    if '--write' in A:
        print('寫', write_js(L, A[A.index('--write') + 1]))
    if '--json' in A:
        json.dump(L, open(A[A.index('--json') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({'furniture': len(L['furniture']), 'seats': len(L['seats']), 'seat2': L['seats'][2]}, ensure_ascii=False))
