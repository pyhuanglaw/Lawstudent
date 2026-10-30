"""普通教學館室內配置（D55；docs/campus/TEACHING_BUILDINGS_PLAN.md）→ src/data/putong_layout.js（純 JSON）。
遊戲（src/teach3d.js，和共同、博雅同一個模板）與 LAWWW2 的 Blender 模型讀同一份。

查證過的（教務處教室容量表、維基百科；經由搜尋摘要）：普通教學館 25 間教室、約 2,630 個座位（大教室多）；二樓有空橋連博雅教學館。
沒有查證的（模板，不宣稱和真實建築相同）：走廊、教室的位置與大小、樓梯、座位數（遊戲裡少很多）。
課程（使用者 2026-10-13）：法律系大一的「經濟學原理」在普通教學館上（課表資料等 AA 統一後才改）。

第一版：中間一條東西向走廊（一、二樓），入口在南牆中間、進門是門廳；
  1F：北側 101（西）、102（東），南側 103（西）、104（東），都是平面的大教室；走廊北邊中間是樓梯，兩旁是洗手間（關著）。
  2F：201、202 平面教室；203、204 關著；樓梯西邊是往博雅的空橋（關著，寫清楚之後開放）。
座標：區域自己的座標，入口在南牆（+z）；外觀 34×16（校園方案 A 是 34×17）。
導航格 0.4 m、格子中心在 0.4 的倍數上：牆放在 0.4 的倍數上，門洞兩端在格子邊界（0.4k+0.2）上、寬 1.2 m（見 boya_layout_gen.py）。
教室的桌子和走廊牆的距離和共同教學館一樣（z1−4.9、z1−1.9），對格子的相對位置相同（共同教學館的教室測過每個位子都坐得到）。
用法：python3 tools/layout/putong_layout_gen.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, D, Y1 = 34.0, 16.0, 4.2
R, T = 0.168, 0.28   # 一層 4.2 m＝25 階（13＋12），和共同教學館一樣
L = {'version': 1, 'id': 'putong', 'name': '普通教學館', 'W': W, 'D': D, 'cell': 0.4, 'wallT': 0.2,
     'floors': [{'lv': 0, 'y': 0.0, 'name': '1F'}, {'lv': 1, 'y': Y1, 'name': '2F'}], 'roofY': 7.8, 'ceil0': 3.6, 'slabT': 0.3,
     'note': '教室多、大教室多是查證過的方向；房間形狀、大小、座位數是模板（docs/campus/TEACHING_BUILDINGS_PLAN.md）'}
L['entrance'] = {'wall': 'S', 'a0': -1.8, 'a1': 1.8, 'exit': {'x': 0.0, 'z': 7.2, 'r': 1.1}, 'spawn': {'x': 0.0, 'z': 5.8, 'lv': 0, 'yaw': 3.1416}, 'campus': {'x': -38.0, 'z': -47.4, 'yaw': 0.0}}   # 校園上的位置等使用者決定（方案 A／B）
CZN, CZS = -1.2, 1.6   # 走廊（東西向，整棟寬）
# 樓梯（U 形，走廊北邊中間：A 跑從走廊往北爬到平台，B 跑往南回到二樓走廊）
A = {'x0': -1.9, 'x1': -0.15, 'z1': CZN, 'risers': 13}; A['z0'] = round(A['z1'] - A['risers'] * T, 3)
LD = {'x0': -1.9, 'x1': 1.9, 'z0': -6.6, 'z1': A['z0'], 'y': round(A['risers'] * R, 3)}
B = {'x0': 0.15, 'x1': 1.9, 'z0': A['z0'], 'risers': 12}; B['z1'] = round(B['z0'] + B['risers'] * T, 3)
L['stair'] = {'dir': 'N', 'rise': R, 'tread': T, 'A': A, 'landing': LD, 'B': B, 'midWall': {'x0': -0.15, 'x1': 0.15},
              'well': {'x0': -1.9, 'x1': 1.9, 'z0': -6.6, 'z1': B['z1']}, 'sign': '往 3F（之後開放）'}
walls = []
def wall(lv, x0, z0, x1, z1, gaps=(), kind='solid'): walls.append({'lv': lv, 'x0': x0, 'z0': z0, 'x1': x1, 'z1': z1, 'gaps': [list(g) for g in gaps], 'kind': kind})
for lv in (0, 1):
    # 走廊北牆：北側教室的前門、後門；樓梯（一樓 A 跑入口、二樓 B 跑出口）
    wall(lv, -16.9, CZN, 16.9, CZN, [(-16.2, -15.0), (-6.2, -5.0), (5.0, 6.2), (15.0, 16.2)] + ([(-1.8, -0.2)] if lv == 0 else [(0.2, 1.8), (-3.8, -2.6)]))   # 二樓 -3.8..-2.6：往空橋的通道（2026-10-16 打開）
    wall(lv, -4.4, -7.9, -4.4, CZN); wall(lv, 4.4, -7.9, 4.4, CZN)           # 樓梯間兩側（旁邊是洗手間、器材室（關著）；二樓西側是往空橋的通道）
    # 走廊南牆：一樓南側教室的前門、後門；二樓南側關著。中間（-4.4..4.4）是門廳，和走廊連通
    wall(lv, -16.9, CZS, -4.4, CZS, [(-16.2, -15.0), (-6.2, -5.0)] if lv == 0 else [])
    wall(lv, 4.4, CZS, 16.9, CZS, [(5.0, 6.2), (15.0, 16.2)] if lv == 0 else [])
    wall(lv, -4.4, CZS, -4.4, 7.9); wall(lv, 4.4, CZS, 4.4, 7.9)             # 門廳兩側
L['walls'] = walls

def classroom(rid, lv, x0, x1, z0, z1, board, label, front_door):
    """平面的大教室：黑板在西牆（W）或東牆（E）；五排、每排兩張雙人桌（中間走道）。排距 2.0 m（椅子也擋住）。
    桌子在走廊牆往裡 1.9 m、4.9 m（共同教學館的位置）：北側教室走廊牆是 z1，南側是 z0"""
    s = 1 if board == 'W' else -1
    front = x0 if board == 'W' else x1
    rows = [round(front + s * d, 2) for d in (2.0, 4.0, 6.0, 8.0, 10.0)]   # 排距 2.0 m：椅子擋住以後，椅子後面還有一條站得住的走道（不能穿過椅子）
    north = z1 <= CZN + 1e-6
    wz = z1 if north else z0                      # 走廊那一道牆
    inward = -1 if north else 1
    zs = [round(wz + inward * 4.9, 2), round(wz + inward * 1.9, 2)]
    desks, seats = [], []
    for ri, dx in enumerate(rows):
        for zi, zc in enumerate(sorted(zs)):
            desks.append({'x': dx, 'z': zc, 'w': 0.5, 'd': 1.2})
            for ci, dz in enumerate((-0.3, 0.3)):
                seats.append({'x': round(dx + s * 0.5, 2), 'z': round(zc + dz, 2), 'yaw': round(-1.5708 * s, 4), 'lv': lv, 'room': rid, 'row': ri, 'col': zi * 2 + ci})
    mid = round((zs[0] + zs[1]) / 2, 2)
    return {'id': rid, 'kind': 'classroom', 'label': label, 'lv': lv, 'x0': x0, 'x1': x1, 'z0': z0, 'z1': z1, 'board': board,
            'teacher': {'x': round(front + s * 0.9, 2), 'z': mid, 'w': 0.6, 'd': 1.4}, 'blackboard': {'x': round(front + s * 0.05, 2), 'z': mid, 'len': 4.2},
            'desks': desks, 'seats': seats, 'doorFront': list(front_door), 'doorZ': wz, 'lookLabel': '看看' + label + ' 教室',
            'look': label + '：大教室，黑板、講桌、兩人一張的桌子。必修和大堂的選修在這裡上。'}

L['rooms'] = [classroom('101', 0, -16.9, -4.4, -7.9, CZN, 'W', '普通 101', (-16.2, -15.0)),
              classroom('102', 0, 4.4, 16.9, -7.9, CZN, 'E', '普通 102', (15.0, 16.2)),
              classroom('103', 0, -16.9, -4.4, CZS, 7.9, 'W', '普通 103', (-16.2, -15.0)),
              classroom('104', 0, 4.4, 16.9, CZS, 7.9, 'E', '普通 104', (15.0, 16.2)),
              classroom('201', 1, -16.9, -4.4, -7.9, CZN, 'W', '普通 201', (-16.2, -15.0)),
              classroom('202', 1, 4.4, 16.9, -7.9, CZN, 'E', '普通 202', (15.0, 16.2)),
              {'id': 'wc', 'kind': 'closed', 'label': '洗手間', 'lv': 0, 'x0': -4.4, 'x1': -1.9, 'z0': -7.9, 'z1': CZN, 'door': [-3.8, -2.6], 'doorZ': CZN, 'look': '洗手間。'},
              {'id': 'wc2', 'kind': 'closed', 'label': '洗手間', 'lv': 0, 'x0': 1.9, 'x1': 4.4, 'z0': -7.9, 'z1': CZN, 'door': [2.6, 3.8], 'doorZ': CZN, 'look': '洗手間。'},
              # 方案 A（D55）：空橋接到北邊博雅教學館的二樓（校園上的空橋在 x≈-41.2、z -66.5～-74）。
              # 2026-10-16（使用者試玩回報「空橋是一扇門」）：passage＝打開的通道（不擋、沒有門板），北牆開 1.8 m 的門洞，空橋本身在 L['bridge']（走得過去）
              {'id': 'bridge', 'kind': 'passage', 'label': '往空橋', 'lv': 1, 'x0': -4.4, 'x1': -1.9, 'z0': -7.9, 'z1': CZN, 'door': [-3.8, -2.6], 'doorZ': CZN,
               'look': '往博思教學館的空橋。'},
              {'id': 'store', 'kind': 'closed', 'label': '器材室', 'lv': 1, 'x0': 1.9, 'x1': 4.4, 'z0': -7.9, 'z1': CZN, 'door': [2.6, 3.8], 'doorZ': CZN, 'look': '器材室，門鎖著。'},
              {'id': '203', 'kind': 'closed', 'label': '普通 203（借用中）', 'lv': 1, 'x0': -16.9, 'x1': -4.4, 'z0': CZS, 'z1': 7.9, 'door': [-6.2, -5.0], 'doorZ': CZS, 'look': '普通 203：門上貼著「本學期借用中」。'},
              {'id': '204', 'kind': 'closed', 'label': '普通 204（借用中）', 'lv': 1, 'x0': 4.4, 'x1': 16.9, 'z0': CZS, 'z1': 7.9, 'door': [5.0, 6.2], 'doorZ': CZS, 'look': '普通 204：門上貼著「本學期借用中」。'}]
# 空橋（LAWWW2-B skybridge.glb a22ba0e：原點＝普通那一端門口中心的地板、往北 7.5 m；可走 x ±1.15；兩端各 1 m 平台＋中間緩坡，升 0.6 m＝博雅二樓 4.8 − 普通二樓 4.2；門洞 1.8 m）
# 走到博雅那一端的門才換到博雅二樓（落點在博雅的空橋通道裡、面向館內）；從博雅回來落在這一端（要走過整條空橋）
L['bridge'] = {'lv': 1, 'x': -3.2, 'z': -D / 2, 'len': 7.5, 'half': 1.15, 'rise': 0.6, 'flat': 1.0, 'doorW': 1.8, 'outerW': 3.2, 'clear': 2.8,
               'glb': 'bldg.skybridge', 'to': 'boya', 'label': '進博思教學館', 'spawn': {'x': -3.2, 'z': 7.0, 'lv': 1, 'yaw': 3.1416}}   # 落點離博雅那一端的門 1.4 m（2026-10-13 審查：太近一到就跳出回程的按鈕）
L['areas'] = [{'id': 'corridor', 'lv': 0, 'x0': -16.9, 'x1': 16.9, 'z0': CZN, 'z1': CZS, 'label': '走廊'}, {'id': 'corridor', 'lv': 1, 'x0': -16.9, 'x1': 16.9, 'z0': CZN, 'z1': CZS, 'label': '走廊'},
              {'id': 'lobby', 'lv': 0, 'x0': -4.4, 'x1': 4.4, 'z0': CZS, 'z1': 7.9, 'label': '門廳'}, {'id': 'lobby2', 'lv': 1, 'x0': -4.4, 'x1': 4.4, 'z0': CZS, 'z1': 7.9, 'label': '二樓門廳'}]
L['benches'] = [{'lv': 0, 'x': -4.05, 'z': 4.4, 'ry': 1.5708, 'label': '坐在門廳的長椅'}, {'lv': 0, 'x': 4.05, 'z': 4.4, 'ry': -1.5708, 'label': '坐在門廳的長椅'},
                {'lv': 1, 'x': 0.0, 'z': 7.45, 'ry': 3.1416, 'label': '坐在二樓的長椅'}]
L['boards'] = [{'lv': 0, 'x': -4.25, 'z': 6.6, 'ry': 1.5708, 'w': 1.4, 'label': '看公告欄', 'look': '公告欄：教室借用時間表、課程異動、社團招生的海報。'}]
L['signs'] = [{'lv': 0, 'text': '普通教學館　101　102　103　104', 'x': 0.0, 'y': 2.75, 'z': CZS + 0.1, 'ry': 3.1416, 'w': 3.4},
              {'lv': 1, 'text': '201 ←　→ 202', 'x': 0.0, 'y': Y1 + 2.75, 'z': CZS + 0.1, 'ry': 3.1416, 'w': 2.4}]
# 窗外的景（#61，LAWWW2-B 2026-10-24）：tools/blender/env_second/shots/teach_views.py 在遊戲的校園拍的畫面（assets/models/env/views/putong_*）；名稱的 south／north＝這裡的 S／N 牆；
#   photoWide＝照片水平約 127°（2048×512）：teach3d.js 把窗景的 sxy 設成 (0.5, 1)，長窗斜著看不會跑出照片的左右邊（90° 的照片會在邊緣拉出橫紋）
L['windows'] = [{'lv': 0, 'wall': 'S', 'a0': -15.6, 'a1': -6.0, 'y0': 0.9, 'y1': 2.8, 'n': 5, 'photo': 'putong_south', 'photoWide': True},
                {'lv': 0, 'wall': 'S', 'a0': 6.0, 'a1': 15.6, 'y0': 0.9, 'y1': 2.8, 'n': 5, 'photo': 'putong_south', 'photoWide': True},
                {'lv': 0, 'wall': 'N', 'a0': -15.6, 'a1': -6.0, 'y0': 0.9, 'y1': 2.8, 'n': 5, 'photo': 'putong_north', 'photoWide': True},
                {'lv': 0, 'wall': 'N', 'a0': 6.0, 'a1': 15.6, 'y0': 0.9, 'y1': 2.8, 'n': 5, 'photo': 'putong_north', 'photoWide': True},
                {'lv': 1, 'wall': 'S', 'a0': -3.6, 'a1': 3.6, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 4, 'photo': 'putong_2f_south', 'photoWide': True},
                {'lv': 1, 'wall': 'N', 'a0': -15.6, 'a1': -6.0, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 5, 'photo': 'putong_2f_north', 'photoWide': True},
                {'lv': 1, 'wall': 'N', 'a0': 6.0, 'a1': 15.6, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 5, 'photo': 'putong_2f_north', 'photoWide': True}]
L['lights'] = [[0, 3.3, 0.2, 6, 4], [-10.6, 3.3, -4.6, 6, 3], [10.6, 3.3, -4.6, 6, 3], [-10.6, 3.3, 4.8, 6, 3], [10.6, 3.3, 4.8, 6, 3], [0, 3.3, 5.0, 5, 3],
               [0, 7.4, 0.2, 6, 4], [-10.6, 7.4, -4.6, 6, 3], [10.6, 7.4, -4.6, 6, 3]]
L['lightPanels'] = {'xs': [-14.4, -10.6, -6.8, -2.4, 2.4, 6.8, 10.6, 14.4], 'zs': [-5.6, -2.8, 0.2, 3.6, 6.4]}
L['waitSpots'] = [{'lv': 0, 'room': rid, 'x': x, 'z': 0.2} for rid, x in (('101', -10.6), ('102', 10.6), ('103', -12.0), ('104', 12.0))] + \
                 [{'lv': 1, 'room': rid, 'x': x, 'z': 0.2} for rid, x in (('201', -10.6), ('202', 10.6))]
out = os.path.join(ROOT, 'src', 'data', 'putong_layout.js')
with open(out, 'w', encoding='utf8') as f:
    f.write('/* 普通教學館室內配置（D55）。產生器：tools/layout/putong_layout_gen.py（改這裡不如改產生器）。\n'
            '   教室多、大教室多是查證過的方向；房間形狀、大小、座位數是模板（docs/campus/TEACHING_BUILDINGS_PLAN.md）。 */\n')
    f.write('const PUTONG_LAYOUT=' + json.dumps(L, ensure_ascii=False) + ';\n')
print('wrote', out, 'room seats', {r['id']: len(r.get('seats', [])) for r in L['rooms'] if r.get('seats')})
