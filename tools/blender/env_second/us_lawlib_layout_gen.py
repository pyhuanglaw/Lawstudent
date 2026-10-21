"""美國交換：法學院圖書館（SCN-US-LIB；區域 us_lawlib）配置 → assets/models/env/second_ai/us_lawlib.layout.json。LAWWW2-C 2026-10-18。
使用者 2026-10-18 01:0x 給了兩張「法學院圖書館」照片（不放 repo；文字描述在 docs/art-rebuild/second_ai/HANDOFF.md）：
挑高中庭、四周幾層書庫（玻璃欄杆＋淺色木扶手）、斜穿中庭的樓梯（樓梯邊一排小燈）、中庭吊著鐵絲球裝置藝術、一樓一整面藍綠色的彩色鉛條玻璃窗、
淺木色長閱覽桌、圓桌、藍色地毯、軟椅、米白色方柱。
範圍（LAWWW-C 00:36，最小可玩）：大門進去、中庭一樓可以走、幾張讀書的長桌可以坐；樓上（二～四樓書庫）照「看得懂的方式關起來」——樓梯口拉一條紅絨繩
（D38 第 4 點：不用隱形牆）。從校園進來：法學院台階下「進圖書館」（us_campus 的 interact 'library'），出去回到同一個地方。
遊戲（LAWWW-C：導航格、座位、互動點、出口）和 Blender（tools/blender/env_second/us_lawlib.py）讀同一份。
用法：python3 tools/blender/env_second/us_lawlib_layout_gen.py [--check]
座標：區域座標 x 往東、z 往南、y 往上；原點＝圖書館中心；單位公尺。"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_lawlib.layout.json')
X0, X1, Z0, Z1 = -13.0, 13.0, -10.0, 10.0
LEVELS = [0.0, 4.6, 9.2, 13.8]; TOP = 18.4; SLAB = 0.4          # 一樓地板、二～四樓樓板頂；屋頂；樓板厚（樓板底 4.2：一樓走廊的天花板，鏡頭在這下面）
VOID = {'x0': -7.5, 'x1': 7.5, 'z0': -5.5, 'z1': 5.5, 'note': '中庭（一樓到天窗挑空）'}
DOOR = {'x': 0.0, 'w': 2.4, 'h': 2.9, 'note': '南牆正中間：木框玻璃雙開門（從法學院的走廊進來）'}
WINDOWS = {'wall': 'N', 'x0': -11.5, 'x1': 11.5, 'y0': 0.5, 'y1': 3.9, 'panels': 16,
           'note': '北牆一樓：一整排細長的藍綠色彩色鉛條玻璃窗，每扇之間一根木頭直櫺（照片二；第一版是五組方窗，和照片不像）'}
STAIR = {'x0': 5.6, 'x1': 7.2, 'z0': -5.5, 'z1': 4.0, 'y0': 0.0, 'y1': 4.6, 'up': 'N', 'rope_z': 4.6,
         'note': '一樓 → 二樓：中庭東邊、往北爬到二樓北邊的迴廊；樓梯口一條紅絨繩（樓上這一版關著）'}
STAIRS_UP = [{'x0': -7.2, 'x1': -5.6, 'z0': -5.5, 'z1': 4.0, 'y0': 4.6, 'y1': 9.2, 'up': 'S'}, {'x0': 5.6, 'x1': 7.2, 'z0': -5.5, 'z1': 4.0, 'y0': 9.2, 'y1': 13.8, 'up': 'N'}]   # 離中庭邊 0.3 m（迴廊的欄杆不和樓梯的玻璃疊在一起）
TABLES = [{'x': x, 'z': -0.8, 'w': 1.1, 'd': 3.6, 'axis': 'z', 'chairs': 3, 'note': '中庭的長閱覽桌（淺木色、每邊三張椅子）'} for x in (-5.6, -2.6, 0.4, 3.4)]   # 東邊留 1.5 m 走道到樓梯
TABLES += [{'x': x, 'z': -7.6, 'w': 1.0, 'd': 2.4, 'axis': 'z', 'chairs': 2, 'note': '北邊彩色玻璃窗前的閱覽桌（垂直窗）'} for x in (-9.0, -5.2, 5.2, 9.0)]
ROUND = [{'x': -10.2, 'z': z, 'r': 0.55, 'chairs': 3} for z in (-3.0, 0.6, 4.2)]
LOUNGE = [{'x': 9.0, 'z': 6.2, 'yaw': math.pi * 0.25}, {'x': 11.2, 'z': 6.2, 'yaw': -math.pi * 0.25}, {'x': 9.0, 'z': 8.4, 'yaw': math.pi * 0.75}, {'x': 11.2, 'z': 8.4, 'yaw': -math.pi * 0.75}]
LOUNGE_TABLE = {'x': 10.1, 'z': 7.3, 'r': 0.45}
STACKS = [{'x0': 9.0, 'x1': 12.4, 'z': z, 'd': 0.6, 'h': 2.2, 'note': '一樓東邊的書架（兩面）'} for z in (-4.6, -2.8, -1.0, 0.8, 2.6)]   # 北邊讓給窗前的閱覽桌
DESK = {'x0': -7.0, 'x1': -2.8, 'z0': 6.6, 'z1': 7.4, 'note': '服務台（借還書）：淺木色櫃台；後面一排還書車'}
CATALOG = [{'x': 2.6, 'z': 7.0, 'note': '查詢電腦（站著用的小桌、螢幕）'}, {'x': 4.0, 'z': 7.0}]

L = {'version': 1, 'zone': 'us_lawlib', 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'levels': LEVELS, 'top': TOP, 'slab': SLAB, 'void': VOID,
     'door': DOOR, 'windows': WINDOWS, 'stair': STAIR, 'stairs_up': STAIRS_UP, 'tables': TABLES, 'round_tables': ROUND, 'lounge': LOUNGE, 'lounge_table': LOUNGE_TABLE,
     'stacks': STACKS, 'desk': DESK, 'catalog': CATALOG,
     'spawn': {'x': 0.0, 'z': 7.8, 'yaw': math.pi, 'note': '從南邊的門進來、面向中庭（北）；離「離開圖書館」1.4 m（US-CAMPUS-WIRE：原本 0.8 m，一進門就站在出口上）'},
     'exits': [{'x': 0.0, 'z': 9.2, 'r': 0.9, 'label': '離開圖書館', 'to': 'us_campus', 'spawn': 'spawn_library_out', 'note': '回到法學院台階下（us_campus 的 spawn_library_out）'}],
     'cam_dist': 5.0, 'note_cam': '一樓走廊的天花板（樓板底）4.2 m：鏡頭高度要在這下面（camDist 5、俯角照一般室內）；四面牆 WALL_<面>_* 各自淡出'}
# 座位（坐下讀書）：長桌每張椅子；圓桌、沙發
SEATS = []
for t in TABLES:
    n = t['chairs']; span = t['d'] - 0.8
    for s in (-1, 1):
        for k in range(n):
            zz = t['z'] - span / 2 + (k + 0.5) * span / n if n > 1 else t['z']
            SEATS.append({'x': round(t['x'] + s * (t['w'] / 2 + 0.3), 3), 'z': round(zz, 3), 'yaw': (-math.pi / 2 if s > 0 else math.pi / 2), 'kind': 'study', 'table': [t['x'], t['z']]})
for r in ROUND:
    for k in range(r['chairs']):
        a = math.pi / 2 + k * 2 * math.pi / r['chairs']
        SEATS.append({'x': round(r['x'] + math.cos(a) * (r['r'] + 0.45), 3), 'z': round(r['z'] + math.sin(a) * (r['r'] + 0.45), 3), 'yaw': round(math.atan2(-math.cos(a), -math.sin(a)), 4), 'kind': 'study', 'table': [r['x'], r['z']]})
for c in LOUNGE: SEATS.append({'x': c['x'], 'z': c['z'], 'yaw': c['yaw'], 'kind': 'lounge', 'y': 0.42})
L['seats'] = SEATS
# yaw：0＝面向南（+z）；人坐在 x 正那一側（s＝+1）要面向 −x：yaw −π/2（遊戲的 yaw：面向 (sin yaw, cos yaw)）
L['interact'] = [
    {'id': 'desk', 'x': -4.9, 'z': 8.2, 'r': 1.0, 'label': '服務台', 'note': '借還書（說明文字由 AA 寫）'},
    {'id': 'stair_rope', 'x': STAIR['x0'] + 0.8, 'z': STAIR['rope_z'] + 0.7, 'r': 1.0, 'label': '樓梯（樓上書庫）', 'note': '樓上這一版關著：紅絨繩（看得懂）；說明文字由 AA 寫'},
    {'id': 'window', 'x': 0.0, 'z': Z0 + 1.4, 'r': 1.2, 'label': '彩色玻璃窗', 'note': '看'},
    {'id': 'stacks', 'x': 8.2, 'z': -3.5, 'r': 1.0, 'label': '書架', 'note': '看（美國的判例彙編一整排）'},
    {'id': 'catalog', 'x': 3.3, 'z': 7.9, 'r': 1.0, 'label': '查詢電腦', 'note': '看'},
]
# 導航阻擋（遊戲另外把範圍邊上 0.25 m 擋住＝牆）
BLOCKS = []
def B_(x0, x1, z0, z1, why): BLOCKS.append({'x0': round(min(x0, x1), 3), 'x1': round(max(x0, x1), 3), 'z0': round(min(z0, z1), 3), 'z1': round(max(z0, z1), 3), 'why': why})
for t in TABLES: B_(t['x'] - t['w'] / 2, t['x'] + t['w'] / 2, t['z'] - t['d'] / 2, t['z'] + t['d'] / 2, 'table')
for r in ROUND: B_(r['x'] - r['r'], r['x'] + r['r'], r['z'] - r['r'], r['z'] + r['r'], 'round table')
B_(LOUNGE_TABLE['x'] - 0.45, LOUNGE_TABLE['x'] + 0.45, LOUNGE_TABLE['z'] - 0.45, LOUNGE_TABLE['z'] + 0.45, 'lounge table')
for c in LOUNGE: B_(c['x'] - 0.25, c['x'] + 0.25, c['z'] - 0.25, c['z'] + 0.25, 'armchair (back half)')
for s in STACKS: B_(s['x0'], s['x1'], s['z'] - s['d'] / 2, s['z'] + s['d'] / 2, 'stacks')
B_(DESK['x0'], DESK['x1'], DESK['z0'], DESK['z1'], 'desk'); B_(DESK['x0'], DESK['x1'], DESK['z0'] - 1.3, DESK['z0'], 'behind desk (staff side)')
for c in CATALOG: B_(c['x'] - 0.35, c['x'] + 0.35, c['z'] - 0.3, c['z'] + 0.3, 'catalog kiosk')
B_(STAIR['x0'] - 0.1, STAIR['x1'] + 0.1, STAIR['z0'], STAIR['rope_z'] + 0.1, 'stair（一樓 → 二樓；樓梯口紅絨繩）')
for (x, z) in ((VOID['x0'], VOID['z0']), (VOID['x1'], VOID['z0']), (VOID['x0'], VOID['z1']), (VOID['x1'], VOID['z1']), (VOID['x0'], 0.0)):   # 南北兩邊中間不放柱子（第一版正對大門擋住整個中庭）
    B_(x - 0.35, x + 0.35, z - 0.35, z + 0.35, 'column')
L['columns'] = [{'x': (b['x0'] + b['x1']) / 2, 'z': (b['z0'] + b['z1']) / 2} for b in BLOCKS if b['why'] == 'column']
for s_ in SEATS:   # 椅子後面 1.1 m 內有方柱：遊戲的走近點（前、後、兩側）都站不住，另外給一個走近點 ap（側後方、遠離柱子；US-CAMPUS-WIRE-1018）
    for c_ in L['columns']:
        if math.hypot(s_['x'] - c_['x'], s_['z'] - c_['z']) < 1.1:
            fx, fz = math.sin(s_['yaw']), math.cos(s_['yaw']); sx, sz = fz, -fx
            sg = 1 if (s_['x'] - c_['x']) * sx + (s_['z'] - c_['z']) * sz >= 0 else -1
            s_['ap'] = [round(s_['x'] - fx * 0.35 + sg * sx * 0.75, 2), round(s_['z'] - fz * 0.35 + sg * sz * 0.75, 2)]
L['blocks'] = BLOCKS


def check(L):
    bad = []
    pts = [('spawn', L['spawn'])] + [('exit ' + e['label'], e) for e in L['exits']] + [('it ' + i['label'], i) for i in L['interact']]
    for nm, p in pts:
        for r in L['blocks']:
            if r['x0'] - 0.3 < p['x'] < r['x1'] + 0.3 and r['z0'] - 0.3 < p['z'] < r['z1'] + 0.3: bad.append((nm, r['why']))
    for s in L['seats']:   # 椅子不能壓在桌子、書架上（自己那張桌子除外）
        for r in L['blocks']:
            if r['why'] in ('table', 'round table', 'lounge table', 'armchair (back half)'): continue
            if r['x0'] - 0.2 < s['x'] < r['x1'] + 0.2 and r['z0'] - 0.2 < s['z'] < r['z1'] + 0.2: bad.append(('seat', s['x'], s['z'], r['why']))
    q = 0.4
    def free(x, z):
        if not (X0 + 0.45 < x < X1 - 0.45 and Z0 + 0.45 < z < Z1 - 0.45): return False
        return not any(r['x0'] - 0.3 < x < r['x1'] + 0.3 and r['z0'] - 0.3 < z < r['z1'] + 0.3 for r in L['blocks'])
    st = [(round(L['spawn']['x'] / q), round(L['spawn']['z'] / q))]; seen = set(st)
    while st:
        i, j = st.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (i + di, j + dj)
            if n not in seen and free(n[0] * q, n[1] * q): seen.add(n); st.append(n)
    near = lambda x, z: any(abs(i * q - x) <= 0.9 and abs(j * q - z) <= 0.9 for (i, j) in seen)   # noqa: E731  座位旁邊 0.9 m 內走得到
    for nm, p in pts:
        if not near(p['x'], p['z']): bad.append((nm, 'unreachable'))
    nun = sum(1 for s in L['seats'] if not near(s['x'], s['z']))
    if nun: bad.append(('seats unreachable', nun))
    return bad, len(seen)


if __name__ == '__main__':
    bad, n = check(L)
    print('seats', len(SEATS), 'blocks', len(BLOCKS), 'reachable cells', n, 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
