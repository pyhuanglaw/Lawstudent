"""博雅教學館室內配置（D55；docs/campus/PUBLIC_BUILDINGS_DESIGN.md、docs/campus/TEACHING_BUILDINGS_PLAN.md）→ src/data/boya_layout.js（純 JSON）。
遊戲（src/teach3d.js，和共同教學館同一個模板）與 LAWWW2 的 Blender 模型讀同一份，兩邊的位置一定一致。

查證過的（教務處教室容量表、教室借用收費標準表、維基百科；經由搜尋摘要）：
  博雅有 7 間階梯教室，一樓是博雅 101（約 400 人）、102、103（約 280 人）；二樓 2 間階梯＋4 間討論教室；三樓 2 間階梯＋10 間討論教室；
  **一樓有三處大型公共空間：沙發、桌椅，供學生自習與討論**（使用者記得的自習小桌）。
沒有查證的（模板，不宣稱和真實建築相同）：大廳、走廊的形狀，教室的位置與大小，樓梯的位置，座位數（遊戲裡比真實少很多）。

第一版：
  1F：博雅 101、102 兩間階梯教室（講台在南端、門開在大廳那一側的講台端）；大廳三處公共空間（沙發區、自習小桌、討論桌）；
      講座資訊螢幕、公告欄、長椅；博雅 103 和樓梯間北邊的房間關著（寫清楚之後開放）。
  2F：走廊、兩間討論教室（平面，可以坐）；南側兩間討論室關著；往 3F 的樓梯口關著。
座標：區域自己的座標，入口在南牆（+z），走進去往北（-z）；外觀 34×18（校園方案 A 的大小；方案還在等使用者決定）。
導航格 0.4 m、格子中心在 0.4 的倍數上：牆放在 0.4 的倍數上，門洞兩端放在格子邊界（0.4k+0.2）上、寬 1.2 m；階梯教室每排的前緣在格子中心上。
用法：python3 tools/layout/boya_layout_gen.py"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
W, D, Y1 = 34.0, 18.0, 4.8
R, T = 0.1714, 0.28   # 樓梯：一層 4.8 m＝28 階（每跑 14 階）、一階 17.1 cm、踏面 28 cm
L = {'version': 1, 'id': 'boya', 'name': '博思教學館', 'W': W, 'D': D, 'cell': 0.4, 'wallT': 0.2,
     'floors': [{'lv': 0, 'y': 0.0, 'name': '1F'}, {'lv': 1, 'y': Y1, 'name': '2F'}], 'roofY': 8.6, 'ceil0': 4.2, 'slabT': 0.3,
     'note': '一樓兩間階梯教室與三處公共空間是查證過的配置方向；房間形狀、大小、座位數是模板（docs/campus/TEACHING_BUILDINGS_PLAN.md）'}
L['entrance'] = {'wall': 'S', 'a0': -1.8, 'a1': 1.8, 'exit': {'x': 0.0, 'z': 8.2, 'r': 1.2}, 'spawn': {'x': 0.0, 'z': 6.8, 'lv': 0, 'yaw': 3.1416},
                 'campus': {'x': -38.0, 'z': -70.6, 'yaw': 0.0}}   # 離門口的互動點 (-38,-72.8) 2.2 m（一出來不會又跳出「博雅教學館」；2026-10-13 審查，原本 1.4 m）   # 校園上的位置等使用者決定（方案 A／B）；決定之前校園上沒有門，這個區域只在測試裡進得來
# 樓梯（U 形，大廳東北：A 跑從大廳往北爬到平台，B 跑往南爬回二樓）
A = {'x0': 2.0, 'x1': 3.75, 'z1': -1.0, 'risers': 14}; A['z0'] = round(A['z1'] - A['risers'] * T, 3)
LD = {'x0': 2.0, 'x1': 5.8, 'z0': -6.6, 'z1': A['z0'], 'y': round(A['risers'] * R, 3)}
B = {'x0': 4.05, 'x1': 5.8, 'z0': A['z0'], 'risers': 14}; B['z1'] = round(B['z0'] + B['risers'] * T, 3)
L['stair'] = {'dir': 'N', 'rise': R, 'tread': T, 'A': A, 'landing': LD, 'B': B, 'midWall': {'x0': 3.75, 'x1': 4.05},
              'well': {'x0': 2.0, 'x1': 5.8, 'z0': -6.6, 'z1': B['z1']}, 'sign': '往 3F（階梯教室、討論教室：之後開放）'}
walls = []
def wall(lv, x0, z0, x1, z1, gaps=(), kind='solid'): walls.append({'lv': lv, 'x0': x0, 'z0': z0, 'x1': x1, 'z1': z1, 'gaps': [list(g) for g in gaps], 'kind': kind})
# ---- 1F ----
wall(0, -6.0, -8.9, -6.0, 8.9, [(5.4, 6.6)])     # 博雅 101 東牆：門在講台那一端（大廳南邊）
wall(0, 6.0, -8.9, 6.0, 8.9, [(5.4, 6.6)])       # 博雅 102 西牆
wall(0, -6.0, -5.2, -1.2, -5.2); wall(0, -1.2, -8.9, -1.2, -5.2)   # 博雅 103（關著）
wall(0, 2.0, -8.9, 2.0, -1.0)                    # 樓梯間西牆（A 跑旁邊）
# ---- 2F ----
CZN, CZS = -0.4, 2.4   # 二樓走廊（東西向，整棟寬）
wall(1, -16.9, CZN, -6.0, CZN, [(-16.2, -15.0), (-7.4, -6.2)])   # 201 的前門、後門
wall(1, 6.0, CZN, 16.9, CZN, [(6.2, 7.4), (15.0, 16.2)])         # 202 的前門、後門
wall(1, -6.0, -8.9, -6.0, CZN); wall(1, 6.0, -8.9, 6.0, CZN)
wall(1, -16.9, CZS, -6.0, CZS); wall(1, -6.0, CZS, -6.0, 8.9)    # 203（關著）
wall(1, 6.0, CZS, 16.9, CZS); wall(1, 6.0, CZS, 6.0, 8.9)        # 204（關著）
L['walls'] = walls

def lecture(rid, lv, x0, x1, z0, z1, stage, edge, rows, depth, rise, aisles, sx0, sx1, seat_xs, desk_dz, desk_d, seat_dz, step_d, **extra):
    sg = -1 if stage == 'S' else 1
    yaw = 0.0 if stage == 'S' else 3.1416
    far = z0 if stage == 'S' else z1
    rd, seats = [], []
    for r in range(rows):
        f = round(edge + sg * r * depth, 3)
        b = round(f + sg * depth, 3) if r < rows - 1 else far
        y, yp = round(rise * (r + 1), 3), round(rise * r, 3)
        rd.append({'r': r, 'front': f, 'back': b, 'y': y, 'yPrev': yp, 'deskZ': round(f + sg * desk_dz, 3), 'seatZ': round(f + sg * seat_dz, 3), 'stepEnd': round(f + sg * 2 * step_d, 3)})
        for ci, x in enumerate(seat_xs):
            seats.append({'x': round(x, 3), 'z': round(f + sg * seat_dz, 3), 'y': y, 'yaw': yaw, 'lv': lv, 'room': rid, 'row': r, 'col': ci})
    out = {'id': rid, 'kind': 'lecture', 'lv': lv, 'x0': x0, 'x1': x1, 'z0': z0, 'z1': z1, 'stage': stage, 'stageEdge': edge, 'rows': rows, 'rowDepth': depth, 'rise': rise,
           'stepD': step_d, 'aisles': [list(a) for a in aisles], 'seatX0': sx0, 'seatX1': sx1, 'deskD': desk_d, 'rowsData': rd, 'seats': seats}
    out.update(extra)
    return out

def classroom(rid, lv, x0, x1, z0, z1, board, label, doors):
    """平面的討論教室：黑板在西牆（W）或東牆（E）；四排、每排兩張雙人桌（中間走道）。排距 2.0 m（椅子也擋住）"""
    s = 1 if board == 'W' else -1
    front = x0 if board == 'W' else x1
    rows = [round(front + s * d, 2) for d in (2.0, 4.0, 6.0, 8.0)]   # 排距 2.0 m：椅子也擋住（不能穿過椅子）
    desks, seats = [], []
    for ri, dx in enumerate(rows):
        for zc in (-6.4, -3.2):
            desks.append({'x': dx, 'z': zc, 'w': 0.5, 'd': 1.2})
            for ci, dz in enumerate((-0.3, 0.3)):
                seats.append({'x': round(dx + s * 0.5, 2), 'z': round(zc + dz, 2), 'yaw': round(-1.5708 * s, 4), 'lv': lv, 'room': rid, 'row': ri, 'col': (0 if zc < -5 else 2) + ci})
    return {'id': rid, 'kind': 'classroom', 'label': label, 'lv': lv, 'x0': x0, 'x1': x1, 'z0': z0, 'z1': z1, 'board': board,
            'teacher': {'x': round(front + s * 0.9, 2), 'z': -4.8, 'w': 0.6, 'd': 1.4}, 'blackboard': {'x': round(front + s * 0.05, 2), 'z': -4.8, 'len': 4.2},
            'desks': desks, 'seats': seats, 'doorFront': list(doors[0]), 'doorZ': CZN, 'lookLabel': '看看' + label + ' 教室',
            'look': label + '：討論教室，黑板、講桌、兩人一張的桌子。小班的課、分組討論在這裡上。'}

LECT = dict(rows=6, depth=2.0, rise=0.3, desk_dz=0.3, desk_d=0.45, seat_dz=0.85, step_d=0.5)
b101 = lecture('101', 0, -16.9, -6.0, -8.9, 8.9, 'S', 4.0, aisles=[(-16.9, -15.3), (-7.3, -6.1)], sx0=-15.3, sx1=-7.3, seat_xs=[-14.95 + 0.7 * i for i in range(11)], **LECT,
               label='博思 101（階梯教室）', lookLabel='看看博思 101 階梯教室', door={'wall': 'E', 'x': -6.0, 'a0': 5.4, 'a1': 6.6},
               lectern={'x': -9.2, 'z': 7.0, 'w': 1.2, 'd': 0.6}, board={'x': -11.3, 'w': 5.6, 'y0': 0.95, 'y1': 2.15}, screen={'x': -11.3, 'w': 4.0, 'y0': 2.3, 'y1': 3.9},
               look='博思 101：一樓最大的階梯教室，一排比一排高。大堂的通識、講座常在這裡。門在講台那一端。')
b102 = lecture('102', 0, 6.0, 16.9, -8.9, 8.9, 'S', 4.0, aisles=[(6.1, 7.3), (15.3, 16.9)], sx0=7.3, sx1=15.3, seat_xs=[7.95 + 0.7 * i for i in range(11)], **LECT,
               label='博思 102（階梯教室）', lookLabel='看看博思 102 階梯教室', door={'wall': 'W', 'x': 6.0, 'a0': 5.4, 'a1': 6.6},
               lectern={'x': 9.2, 'z': 7.0, 'w': 1.2, 'd': 0.6}, board={'x': 11.3, 'w': 5.6, 'y0': 0.95, 'y1': 2.15}, screen={'x': 11.3, 'w': 4.0, 'y0': 2.3, 'y1': 3.9},
               look='博思 102：階梯教室，比 101 小一點。門在講台那一端。')
L['rooms'] = [b101, b102,
              classroom('201', 1, -16.9, -6.0, -8.9, CZN, 'W', '博思 201', [(-16.2, -15.0)]),
              classroom('202', 1, 6.0, 16.9, -8.9, CZN, 'E', '博思 202', [(15.0, 16.2)]),
              {'id': '103', 'kind': 'closed', 'label': '博思 103（之後開放）', 'lv': 0, 'x0': -6.0, 'x1': -1.2, 'z0': -8.9, 'z1': -5.2, 'door': [-3.4, -2.2], 'doorZ': -5.2,
               'look': '博思 103：階梯教室。門上貼著「本學期借用中」——之後開放。'},
              {'id': '203', 'kind': 'closed', 'label': '博思 203 討論室（之後開放）', 'lv': 1, 'x0': -16.9, 'x1': -6.0, 'z0': CZS, 'z1': 8.9, 'door': [-12.2, -11.0], 'doorZ': CZS,
               'look': '博思 203：討論室，門鎖著。門邊貼著借用登記表——之後開放。'},
              {'id': '204', 'kind': 'closed', 'label': '博思 204 討論室（之後開放）', 'lv': 1, 'x0': 6.0, 'x1': 16.9, 'z0': CZS, 'z1': 8.9, 'door': [11.0, 12.2], 'doorZ': CZS,
               'look': '博思 204：討論室，門鎖著。門邊貼著借用登記表——之後開放。'},
              # 方案 A（D55）：二樓南面接到普通教學館的空橋（校園上 x≈-41.2）。2026-10-16（使用者試玩回報「空橋是一扇門」）：passage＝打開的通道，
              # 南牆上是往空橋的玻璃門（linkDoor）；走出去落在空橋博雅那一端（普通教學館區域的 L['bridge']），面向南、要走過整條空橋
              {'id': 'bridge', 'kind': 'passage', 'label': '往空橋', 'lv': 1, 'x0': -4.4, 'x1': -2.0, 'z0': 6.6, 'z1': 8.9, 'door': [-3.8, -2.6], 'doorZ': 6.6,
               'look': '往普通教學館的空橋。', 'linkDoor': {'x': -3.2, 'w': 1.8, 'z': 9.0},
               'link': {'to': 'putong', 'label': '走上空橋（往普通教學館）', 'spawn': {'x': -3.2, 'z': -13.8, 'lv': 1, 'yaw': 0.0}}}]   # 空橋博雅那一端往南 1.7 m（離那一端的門 1.35 m）
# 一樓大廳的三處公共空間（查證：教務處「博雅教學館藝文空間借用管理使用規定」——一樓有「101 階梯教室旁西側大廳桌椅區」「中央大廳圓桌區」，
# 平日 8:00–18:00 給學生自主學習；第一版的查證：「沙發、桌椅，供學生自習與討論」）
# 2026-10-13 第二版（LAWWW2 審查 c5e2170 第 3 節：第一版 6 張單人小桌面向牆，看起來像走廊放了幾張桌子；使用者記得的是「很多小桌子」）：
#   ① 101 旁桌椅區：雙人小桌（0.9 × 0.6 m，兩張椅子面對面）兩列 × 六張；② 圓桌區（直徑 1 m、四張椅子）兩張；③ 窗邊沙發（南面的窗下）兩張。
#   審查提案是 16 張雙人小桌＋3 張圓桌（R2 的大廳，比現在大）；現在的大廳 12 m 寬、北邊有 103 和樓梯，放 12 張＋2 張，中間留 2.2 m 以上的走道（大門 → 講座資訊角、樓梯）。
#   同一張桌子的座位有同一個 table（'d1'…、'r1'…）：「坐在一起」（AA_110 5-3 npcNear 同桌）、習慣記憶 table:boya:d3。
#   坐下前站的位置（GAME.seatApproach：椅子後面 0.6 m）：西列的西側（靠 101 的牆）、兩列中間的走道、東列的東側（中間走道）；圓桌在椅子外圈。
groups = []
# ① 自習區（101 旁桌椅區）：桌子長邊南北向，椅子在東、西兩側（面對面）；兩列（x -3.8、-1.0），每列六張（z 每 1.6 m）
#    西列離 101 的牆 1.3 m、兩列中間 1.2 m（椅背到椅背）：人走得過去（-4.2 那一版西側只剩 0.9 m，7 個位子走不到，tests/nav_teach_unit.js）
st = []
for ci, x in enumerate((-3.8, -1.0)):
    for ri, z in enumerate((-4.0, -2.4, -0.8, 0.8, 2.4, 4.0)):
        tid = 'd%d' % (ci * 6 + ri + 1)
        st.append({'id': tid, 'x': x, 'z': z, 'w': 0.6, 'd': 0.9,
                   'seats': [{'x': round(x - 0.55, 2), 'z': z, 'yaw': 1.5708, 'table': tid}, {'x': round(x + 0.55, 2), 'z': z, 'yaw': -1.5708, 'table': tid}]})
groups.append({'id': 'study', 'kind': 'study', 'lv': 0, 'label': '自習區（101 旁桌椅區）', 'seatLabel': '坐下讀書（自習小桌）', 'tables': st})
# ② 圓桌區：大廳東側、樓梯南邊（樓梯口 x 2.0–3.75 留空）；椅子在桌子四邊、面向桌子中心
rt = []
for i, (x, z) in enumerate(((3.6, 1.2), (3.6, 4.0))):   # 東側的椅子離 102 的牆 1.3 m（x 4.0 那一版只剩 0.9 m，走不到）
    tid = 'r%d' % (i + 1)
    rt.append({'id': tid, 'shape': 'round', 'x': x, 'z': z, 'r': 0.5,
               'seats': [{'x': x, 'z': round(z - 0.8, 2), 'yaw': 0.0, 'table': tid}, {'x': x, 'z': round(z + 0.8, 2), 'yaw': 3.1416, 'table': tid},
                         {'x': round(x - 0.8, 2), 'z': z, 'yaw': 1.5708, 'table': tid}, {'x': round(x + 0.8, 2), 'z': z, 'yaw': -1.5708, 'table': tid}]})
groups.append({'id': 'round', 'kind': 'study', 'lv': 0, 'label': '圓桌區', 'seatLabel': '坐下（圓桌）', 'chairColor': '#5a6470', 'tables': rt})
# ③ 窗邊沙發：南面兩扇窗下（靠背貼著窗下的牆、面向大廳）；長椅照舊在兩側牆邊
groups.append({'id': 'sofa', 'kind': 'lounge', 'lv': 0, 'label': '窗邊沙發', 'seatLabel': '坐在沙發上',
               'sofas': [{'x': -3.7, 'z': 8.45, 'ry': 3.1416, 'len': 2.0, 'seats': 2}, {'x': 3.7, 'z': 8.45, 'ry': 3.1416, 'len': 2.0, 'seats': 2}], 'tables': []})
L['groups'] = groups
L['areas'] = [{'id': 'study', 'lv': 0, 'x0': -6.0, 'x1': -0.2, 'z0': -5.2, 'z1': 4.8, 'label': '自習區（101 旁桌椅區）'},
              {'id': 'round', 'lv': 0, 'x0': 2.0, 'x1': 6.0, 'z0': -1.0, 'z1': 5.0, 'label': '圓桌區'},
              {'id': 'sofa', 'lv': 0, 'x0': -6.0, 'x1': -1.8, 'z0': 7.4, 'z1': 8.9, 'label': '窗邊沙發'},
              {'id': 'sofa', 'lv': 0, 'x0': 1.8, 'x1': 6.0, 'z0': 7.4, 'z1': 8.9, 'label': '窗邊沙發'},
              {'id': 'info', 'lv': 0, 'x0': -1.2, 'x1': 2.0, 'z0': -8.9, 'z1': -5.2, 'label': '講座資訊'},
              {'id': 'corridor', 'lv': 1, 'x0': -16.9, 'x1': 16.9, 'z0': CZN, 'z1': CZS, 'label': '二樓走廊'}]
L['benches'] = [{'lv': 0, 'x': -5.55, 'z': 7.4, 'ry': 1.5708, 'label': '坐在大廳的長椅'}, {'lv': 0, 'x': 5.55, 'z': 7.4, 'ry': -1.5708, 'label': '坐在大廳的長椅'},
                {'lv': 1, 'x': 0.0, 'z': 8.45, 'ry': 3.1416, 'label': '坐在二樓的長椅'}]
# 講座資訊螢幕（活動資料：src/data/activities.js）、公告欄
L['boards'] = [{'lv': 0, 'x': -0.4, 'z': -8.75, 'ry': 0.0, 'w': 1.4, 'style': 'screen', 'label': '看講座資訊（螢幕）', 'zoneFilter': True,
                'look': '講座資訊螢幕：這一週博思的演講、活動、教室異動。'},
               {'lv': 0, 'x': 1.3, 'z': -8.75, 'ry': 0.0, 'w': 1.2, 'label': '看公告欄', 'look': '公告欄：社團招生、講座海報、失物招領。'}]   # 大廳北邊的「資訊角」
L['signs'] = [{'lv': 0, 'text': '博思教學館　101 ←　→ 102', 'x': 0.0, 'y': 3.4, 'z': 8.7, 'ry': 3.1416, 'w': 3.0},
              {'lv': 0, 'text': '博思 101　階梯教室', 'x': -5.88, 'y': 2.75, 'z': 6.0, 'ry': 1.5708, 'w': 1.8},
              {'lv': 0, 'text': '博思 102　階梯教室', 'x': 5.88, 'y': 2.75, 'z': 6.0, 'ry': -1.5708, 'w': 1.8},
              {'lv': 1, 'text': '201 ←　討論教室　→ 202', 'x': 0.0, 'y': Y1 + 2.75, 'z': CZS - 0.1, 'ry': 3.1416, 'w': 2.8}]
# 窗外景：LAWWW2 c15a648（boya_views.py，在方案 A 的校園拍；VISUAL_REVIEW（second_ai）第 26 節）。一樓北面看醉月湖的窗（boya_north）等 R2 把 103 搬走再加
# 窗外的景：二樓的長窗用寬照片（_w，2048×512、水平約 127°；tools/blender/env_second/shots/boya_views.py）＋photoWide（teach3d.js 把 sxy 設成 (0.5, 1)）：長窗斜著看不會跑出照片的左右邊；一樓南面兩扇 3 m 的窗照舊 90°（LAWWW2-B 2026-10-24）
L['windows'] = [{'lv': 0, 'wall': 'S', 'a0': -5.4, 'a1': -2.4, 'y0': 0.9, 'y1': 3.4, 'n': 2, 'photo': 'boya_south'},
                {'lv': 0, 'wall': 'S', 'a0': 2.4, 'a1': 5.4, 'y0': 0.9, 'y1': 3.4, 'n': 2, 'photo': 'boya_south'},
                {'lv': 1, 'wall': 'S', 'a0': -1.6, 'a1': 5.4, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 4, 'photo': 'boya_2f_south_w', 'photoWide': True},   # 西半邊是空橋的門（方案 A）
                {'lv': 1, 'wall': 'N', 'a0': -15.6, 'a1': -7.4, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 4, 'photo': 'boya_2f_north_w', 'photoWide': True},
                {'lv': 1, 'wall': 'N', 'a0': 7.4, 'a1': 15.6, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 4, 'photo': 'boya_2f_north_w', 'photoWide': True}]
L['lights'] = [[0, 3.9, 2.0, 6, 4], [0, 3.9, -3.0, 5, 3], [-11.4, 3.9, -3.0, 6, 3], [-11.4, 3.9, 5.0, 6, 3], [11.4, 3.9, -3.0, 6, 3], [11.4, 3.9, 5.0, 6, 3],
               [0, 8.2, 1.0, 6, 4], [-11.4, 8.2, -4.6, 6, 3], [11.4, 8.2, -4.6, 6, 3]]
L['lightPanels'] = {'xs': [-14.4, -11.4, -8.4, -3.6, 0.0, 3.6, 8.4, 11.4, 14.4], 'zs': [-6.8, -3.2, 0.4, 4.0, 7.2]}
L['waitSpots'] = [{'lv': 0, 'room': '101', 'x': -5.2, 'z': 6.0}, {'lv': 0, 'room': '102', 'x': 5.2, 'z': 6.0},
                  {'lv': 1, 'room': '201', 'x': -15.6, 'z': 1.0}, {'lv': 1, 'room': '202', 'x': 15.6, 'z': 1.0}]
out = os.path.join(ROOT, 'src', 'data', 'boya_layout.js')
with open(out, 'w', encoding='utf8') as f:
    f.write('/* 博思教學館室內配置（D55）。產生器：tools/layout/boya_layout_gen.py（改這裡不如改產生器）。\n'
            '   一樓兩間階梯教室與三處公共空間是查證過的方向；房間形狀、大小、座位數是模板（docs/campus/TEACHING_BUILDINGS_PLAN.md）。 */\n')
    f.write('const BOYA_LAYOUT=' + json.dumps(L, ensure_ascii=False) + ';\n')
print('wrote', out, 'room seats', {r['id']: len(r.get('seats', [])) for r in L['rooms'] if r.get('seats')},
      'group seats', {g['id']: sum(len(t['seats']) for t in g.get('tables', [])) + sum(s['seats'] for s in g.get('sofas', [])) for g in groups})
