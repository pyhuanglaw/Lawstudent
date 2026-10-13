"""共同教學館室內配置（D55 第二階段；docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 2 節）→ src/data/gongtong_layout.js（純 JSON）。
遊戲（src/teach3d.js）與 LAWWW2 的 Blender 模型讀同一份，兩邊的位置一定一致。
**室內沒有查證**：這是可替換的教學館模板（大廳、走廊、普通教室、樓梯、休息區、自習區），不宣稱和真實的共同教學館相同。
座標：區域自己的座標，入口在南牆（+z），走進去往北（-z）；外觀 24×14（和校園上的共同教學館同尺寸）。導航格 0.4 m：牆放在格子中心線上（0.4 的倍數），門洞 ≥ 1.2 m。
用法：python3 tools/layout/gongtong_layout_gen.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, D, Y1 = 24.0, 14.0, 4.2
R, T = 0.168, 0.28   # 樓梯：一階 16.8 cm、踏面 28 cm（和霖澤館、法圖一樣）
L = {'version': 1, 'id': 'gongtong', 'name': '共同教學館', 'W': W, 'D': D, 'cell': 0.4, 'wallT': 0.2,
     'floors': [{'lv': 0, 'y': 0.0, 'name': '1F'}, {'lv': 1, 'y': Y1, 'name': '2F'}], 'roofY': 7.8, 'ceil0': 3.6, 'slabT': 0.3,
     'note': '室內沒有查證：可替換的教學館模板（docs/campus/PUBLIC_BUILDINGS_DESIGN.md）'}
L['entrance'] = {'wall': 'S', 'a0': -1.2, 'a1': 1.2, 'exit': {'x': 0.0, 'z': 6.2, 'r': 1.1}, 'spawn': {'x': 0.0, 'z': 4.8, 'lv': 0, 'yaw': 3.1416},   # 進門後站在大廳（離出口 1.4 m：不會一進來就跳出「走出」）
                 'campus': {'x': 2.0, 'z': 20.6, 'yaw': 3.1416}}   # 走出去：校園上共同教學館的正門前，面向椰林大道（離門口 2.2 m）
# 樓梯（U 形，A 跑從走廊往北爬到北邊的平台，B 跑往南爬回二樓走廊）
A = {'x0': -3.5, 'x1': -1.75, 'z1': -0.6, 'risers': 13}; A['z0'] = round(A['z1'] - A['risers'] * T, 3)
LD = {'x0': -3.5, 'x1': 0.3, 'z0': -5.9, 'z1': A['z0'], 'y': round(A['risers'] * R, 3)}
B = {'x0': -1.45, 'x1': 0.3, 'z0': A['z0'], 'risers': 12}; B['z1'] = round(B['z0'] + B['risers'] * T, 3)
L['stair'] = {'dir': 'N', 'rise': R, 'tread': T, 'A': A, 'landing': LD, 'B': B, 'midWall': {'x0': -1.75, 'x1': -1.45},
              'well': {'x0': -3.5, 'x1': 0.3, 'z0': -5.9, 'z1': B['z1']}, 'sign': '往 3F（整修中，暫停開放）'}
# 牆（軸向；gaps＝門洞／開口，沿牆的座標）；h 省略＝那一層的高度
CZN, CZS = -0.4, 2.4   # 走廊的北牆、南牆
walls = []
def wall(lv, x0, z0, x1, z1, gaps=(), kind='solid'): walls.append({'lv': lv, 'x0': x0, 'z0': z0, 'x1': x1, 'z1': z1, 'gaps': [list(g) for g in gaps], 'kind': kind})
for lv in (0, 1):
    # 走廊北牆：教室前門、後門；一樓 A 跑的入口、二樓 B 跑的出口（中間是洗手間，關著）
    gaps = [(-11.4, -10.2), (-5.0, -3.8), (3.8, 5.0), (10.2, 11.4)] + ([(-3.5, -1.75)] if lv == 0 else [(-1.45, 0.3)])
    wall(lv, -11.9, CZN, 11.9, CZN, gaps, 'solid')
    wall(lv, -3.6, -6.9, -3.6, CZN); wall(lv, 3.6, -6.9, 3.6, CZN)          # 教室和樓梯間之間
    wall(lv, 0.4, -6.9, 0.4, CZN)                                            # 樓梯間和洗手間之間
    wall(lv, 3.6, CZS, 11.9, CZS, [], 'solid'); wall(lv, 3.6, CZS, 3.6, 6.9)  # 東南的房間（一樓管理室、二樓 203）：關著
L['walls'] = walls
# 房間
def classroom(rid, lv, x0, x1, board):
    # 黑板在西牆（board W：學生面向西）或東牆（E）；4 排、每排兩張雙人桌，中間走道
    s = 1 if board == 'W' else -1   # 往後（離黑板）的方向：W 黑板 → +x
    front = x0 if board == 'W' else x1
    rows = [round(front + s * d, 2) for d in (2.0, 3.6, 5.2, 6.8)]   # 排距 1.6 m：椅子那一條 1.1 m 寬（1.5 m 時北邊的座位走不過去，tests/nav_teach_unit.js）
    desks, seats = [], []
    for ri, dx in enumerate(rows):
        for zc in (-5.3, -2.3):
            desks.append({'x': dx, 'z': zc, 'w': 0.5, 'd': 1.2})
            for ci, dz in enumerate((-0.3, 0.3)):
                seats.append({'x': round(dx + s * 0.5, 2), 'z': round(zc + dz, 2), 'yaw': round(-1.5708 * s, 4), 'lv': lv, 'room': rid, 'row': ri, 'col': (0 if zc < -3 else 2) + ci})
    return {'id': rid, 'kind': 'classroom', 'label': '共同 ' + rid, 'lv': lv, 'x0': x0, 'x1': x1, 'z0': -6.9, 'z1': CZN, 'board': board,
            'teacher': {'x': round(front + s * 0.9, 2), 'z': -3.65, 'w': 0.6, 'd': 1.4}, 'blackboard': {'x': round(front + s * 0.05, 2), 'z': -3.65, 'len': 4.2},
            'desks': desks, 'seats': seats, 'doorFront': [-11.4, -10.2] if board == 'W' else [10.2, 11.4]}
L['rooms'] = [classroom('101', 0, -11.9, -3.6, 'W'), classroom('102', 0, 3.6, 11.9, 'E'), classroom('201', 1, -11.9, -3.6, 'W'), classroom('202', 1, 3.6, 11.9, 'E'),
              {'id': 'office', 'kind': 'closed', 'label': '共同教學館管理室', 'lv': 0, 'x0': 3.6, 'x1': 11.9, 'z0': CZS, 'z1': 6.9, 'door': [6.6, 7.8], 'look': '共同教學館管理室。門關著，門上貼著教室借用的時間表。'},
              {'id': '203', 'kind': 'closed', 'label': '共同 203（整修中）', 'lv': 1, 'x0': 3.6, 'x1': 11.9, 'z0': CZS, 'z1': 6.9, 'door': [6.6, 7.8], 'look': '共同 203。門口貼著「整修中，暫停使用」。'},
              {'id': 'wc', 'kind': 'closed', 'label': '洗手間', 'lv': 0, 'x0': 0.4, 'x1': 3.6, 'z0': -6.9, 'z1': CZN, 'door': [1.4, 2.6], 'look': '洗手間。'},
              {'id': 'wc2', 'kind': 'closed', 'label': '洗手間', 'lv': 1, 'x0': 0.4, 'x1': 3.6, 'z0': -6.9, 'z1': CZN, 'door': [1.4, 2.6], 'look': '洗手間。'}]
# 一樓西南：休息區（小圓桌）；二樓西南：自習區（小桌子）；大廳：公告欄、長椅
lounge = [{'x': -10.0, 'z': 4.6}, {'x': -7.2, 'z': 4.6}, {'x': -10.0, 'z': 6.2}, {'x': -7.2, 'z': 6.2}]
L['lounge'] = {'lv': 0, 'label': '休息區', 'tables': [{'x': t['x'], 'z': t['z'] - 0.0, 'r': 0.45} for t in lounge[:2]],
               'seats': [{'x': t['x'] + dx, 'z': 4.6, 'yaw': (1.5708 if dx < 0 else -1.5708), 'lv': 0, 'room': 'lounge'} for t in lounge[:2] for dx in (-0.85, 0.85)]}
study = []
for x in (-10.4, -8.0, -5.6):
    for z in (3.6, 5.4):
        study.append({'x': x, 'z': z, 'w': 1.0, 'd': 0.6, 'seats': [{'x': x, 'z': round(z + 0.55, 2), 'yaw': 3.1416, 'lv': 1, 'room': 'study'}]})
L['study'] = {'lv': 1, 'label': '自習區', 'tables': study}
L['benches'] = [{'lv': 0, 'x': 3.15, 'z': 4.0, 'ry': -1.5708, 'label': '坐在大廳的長椅'}, {'lv': 0, 'x': 3.15, 'z': 5.8, 'ry': -1.5708, 'label': '坐在大廳的長椅'},
                {'lv': 1, 'x': 0.0, 'z': 6.4, 'ry': 3.1416, 'label': '坐在二樓的長椅'}]
L['boards'] = [{'lv': 0, 'x': -3.3, 'z': 4.9, 'ry': 1.5708, 'w': 1.8, 'label': '看公告欄', 'look': '公告欄：教室借用時間表、課程異動、社團招生的海報。（演講與活動的資訊之後會貼在這裡）'}]
L['signs'] = [{'lv': 0, 'text': '共同教學館　101 ← → 102', 'x': 0.0, 'y': 2.75, 'z': 2.3, 'ry': 3.1416, 'w': 2.8},
              {'lv': 1, 'text': '201 ← → 202　自習區', 'x': 0.0, 'y': Y1 + 2.75, 'z': 2.3, 'ry': 3.1416, 'w': 2.6}]
# 窗外的景：還沒拍（之後用 tools/shots 從遊戲裡拍共同教學館南北兩側的景）；null＝程序化的景，不會去抓不存在的檔案
L['windows'] = [{'lv': 0, 'wall': 'S', 'a0': -11.4, 'a1': -4.0, 'y0': 0.9, 'y1': 2.8, 'n': 4, 'photo': None},
                {'lv': 0, 'wall': 'N', 'a0': -11.0, 'a1': -4.6, 'y0': 0.9, 'y1': 2.8, 'n': 3, 'photo': None},
                {'lv': 0, 'wall': 'N', 'a0': 4.6, 'a1': 11.0, 'y0': 0.9, 'y1': 2.8, 'n': 3, 'photo': None},
                {'lv': 1, 'wall': 'S', 'a0': -11.4, 'a1': 3.0, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 6, 'photo': None},
                {'lv': 1, 'wall': 'N', 'a0': -11.0, 'a1': -4.6, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 3, 'photo': None},
                {'lv': 1, 'wall': 'N', 'a0': 4.6, 'a1': 11.0, 'y0': Y1 + 0.9, 'y1': Y1 + 2.8, 'n': 3, 'photo': None}]
L['lights'] = [[0, 3.3, 1.0, 6, 4], [-7.8, 3.3, -3.6, 6, 3], [7.8, 3.3, -3.6, 6, 3], [-7.6, 3.3, 5.0, 5, 3], [0, 7.4, 1.0, 6, 4], [-7.8, 7.4, -3.6, 6, 3], [7.8, 7.4, -3.6, 6, 3], [-7.6, 7.4, 5.0, 5, 3]]
# 人流（src/crowd3d.js 的室內版之後用）：走廊的等候點（教室門口）、大廳
L['waitSpots'] = [{'lv': lv, 'room': rid, 'x': x, 'z': 0.6} for lv, rid, x in ((0, '101', -7.6), (0, '102', 7.6), (1, '201', -7.6), (1, '202', 7.6))]
out = os.path.join(ROOT, 'src', 'data', 'gongtong_layout.js')
with open(out, 'w', encoding='utf8') as f:
    f.write('/* 共同教學館室內配置（D55 第二階段）。產生器：tools/layout/gongtong_layout_gen.py（改這裡不如改產生器）。\n'
            '   室內沒有查證：可替換的教學館模板，不宣稱和真實的共同教學館相同（docs/campus/PUBLIC_BUILDINGS_DESIGN.md）。 */\n')
    f.write('const GONGTONG_LAYOUT=' + json.dumps(L, ensure_ascii=False) + ';\n')
print('wrote', out, 'seats', sum(len(r.get('seats', [])) for r in L['rooms']))
