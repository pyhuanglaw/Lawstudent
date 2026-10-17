"""社會科學院大樓 一樓室內（SCN-V0-01，SOCSCI_PLAN 第 3 節第③步；LAWWW2-C 2026-10-17）的配置 → assets/models/env/second_ai/socsci_bldg1f.layout.json。
遊戲（LAWWW 的區域程式：導航格、座位、互動點、出口）和 Blender（tools/blender/env_second/socbldg_interior.py）讀同一份，兩邊一定對得上。
用法：python3 tools/blender/env_second/socbldg_layout_gen.py [--check]（--check：只檢查、不寫檔）

範圍：大樓 30×16 m（世界 x 95–125、z −58～−42，中心 (110, −50)；campus_socsci.py 的 ②）。一樓西面、北面往內退 2.4 m 是玻璃大廳（外面一排柱子），
所以室內是 x −12.6～14.8、z −5.6～7.8（區域座標：原點＝大樓中心，x 往東、z 往南、y 往上，地板 y=0）。
一樓（遊戲版、不宣稱還原真實平面）：
  大廳（西半邊，玻璃兩面）：西面主入口、北面次入口；樓層指引、公告欄、長椅、販賣機、盆栽。
  電梯＋樓梯核心（大廳東側）：兩部電梯（2F 以上要刷卡：按鈕不亮）、樓梯間的門關著（刷卡）——看得懂的「關著」，不是隱形牆、也不是走不上去的假樓梯（D36）。
  北側走廊（沿北面玻璃）：往東通到教室。
  經濟學系辦公室：走廊南側，櫃台窗口朝走廊（裡面的辦公桌、信箱格、盆栽看得到；系辦是職員區，玩家在櫃台前互動）——對應 2D 背景 soc_office。
  101 教室：東端，東、南兩面外牆有窗；黑板在西牆；可以移動的桌椅（兩人一桌）——對應 2D 背景 soc_classroom（迎新、做價目表那間）。
房間用途（哪個事件、哪一週）等 AA-C 確認（D79）；這份只決定空間。座位 yaw：人物面向 (sin yaw, cos yaw)（yaw=0 面向 +z），和 library_layout.js 一樣。"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'socsci_bldg1f.layout.json')

X0, X1, Z0, Z1 = -12.6, 14.8, -5.6, 7.8          # 室內範圍（西、北是玻璃；東、南是外牆內面）
H, WT, R_PLAYER = 4.4, 0.2, 0.33
LOBBY_X1 = -2.2                                    # 大廳東緣＝核心、系辦的西牆
COR_Z1 = -3.0                                      # 走廊南緣＝系辦、教室的北牆
CORE = dict(x0=LOBBY_X1, x1=2.4, z0=1.6, z1=Z1)    # 電梯＋樓梯
OFFICE = dict(x0=LOBBY_X1, x1=5.2, z0=COR_Z1, z1=CORE['z0'])
STORE = dict(x0=CORE['x1'], x1=5.2, z0=CORE['z0'], z1=Z1)        # 核心旁邊的機房、儲藏室（門關著）
CLASS = dict(x0=5.2, x1=X1, z0=COR_Z1, z1=Z1)

L = {'version': 1, 'world_center': [110.0, -50.0], 'H': H, 'wallT': WT, 'cell': 0.4,
     'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1},
     'glass': {'west': {'x': X0, 'z0': Z0, 'z1': Z1}, 'north': {'z': Z0, 'x0': X0, 'x1': X1}},
     'entrances': [
         {'id': 'west', 'wall': 'west', 'x': X0, 'z0': 0.0, 'z1': 2.4, 'spawn': {'x': -11.6, 'z': 1.2, 'yaw': round(math.pi / 2, 4)},
          'exit': {'world': [95.6, -48.8], 'label': '離開社科院（往法學院廣場）'}},
         {'id': 'north', 'wall': 'north', 'z': Z0, 'x0': -8.6, 'x1': -6.6, 'spawn': {'x': -7.6, 'z': -4.6, 'yaw': 0.0},
          'exit': {'world': [102.4, -56.8], 'label': '離開社科院（往中庭）'}}],
     'rooms': {'lobby': {'x0': X0, 'x1': LOBBY_X1, 'z0': Z0, 'z1': Z1}, 'corridor': {'x0': LOBBY_X1, 'x1': X1, 'z0': Z0, 'z1': COR_Z1},
               'core': CORE, 'office': OFFICE, 'store': STORE, 'classroom': CLASS},
     'columns': [{'x': -7.4, 'z': -0.6, 's': 0.6}, {'x': -7.4, 'z': 4.6, 's': 0.6}],
     }

# ---------- 牆（隔間；外牆另外在 Blender 做）：每一段 [x0,z0,x1,z1]，門洞另外列 ----------
WALLS = [
    {'id': 'core_west', 'a': [LOBBY_X1, CORE['z0']], 'b': [LOBBY_X1, Z1]},
    {'id': 'office_west', 'a': [LOBBY_X1, COR_Z1], 'b': [LOBBY_X1, CORE['z0']]},
    {'id': 'office_north', 'a': [LOBBY_X1, COR_Z1], 'b': [OFFICE['x1'], COR_Z1]},
    {'id': 'office_south', 'a': [LOBBY_X1, CORE['z0']], 'b': [OFFICE['x1'], CORE['z0']]},
    {'id': 'office_east', 'a': [OFFICE['x1'], COR_Z1], 'b': [OFFICE['x1'], Z1]},          # 也是教室的西牆（黑板）
    {'id': 'core_east', 'a': [CORE['x1'], CORE['z0']], 'b': [CORE['x1'], Z1]},
    {'id': 'class_north', 'a': [CLASS['x0'], COR_Z1], 'b': [X1, COR_Z1]},
]
DOORS = [
    {'id': 'class_front', 'wall': 'class_north', 'x0': 6.0, 'x1': 7.1, 'open': True, 'label': '101 教室', 'plate': '101'},
    {'id': 'class_back', 'wall': 'class_north', 'x0': 13.2, 'x1': 14.3, 'open': True, 'label': '101 教室（後門）', 'plate': '101'},
    {'id': 'office_door', 'wall': 'office_north', 'x0': 3.7, 'x1': 4.7, 'open': False, 'label': '經濟學系辦公室（職員出入）', 'plate': '經濟學系辦公室'},
    {'id': 'elev_a', 'wall': 'core_west', 'z0': 2.2, 'z1': 3.3, 'open': False, 'kind': 'elevator', 'label': '電梯（2F 以上請刷卡）'},
    {'id': 'elev_b', 'wall': 'core_west', 'z0': 3.9, 'z1': 5.0, 'open': False, 'kind': 'elevator', 'label': '電梯（2F 以上請刷卡）'},
    {'id': 'stair', 'wall': 'core_west', 'z0': 6.0, 'z1': 7.2, 'open': False, 'kind': 'stair', 'label': '樓梯間（研究室樓層・刷卡進出）'},
]
COUNTER = {'wall': 'office_north', 'x0': -1.4, 'x1': 2.8, 'y0': 0.95, 'y1': 2.15, 'top': 1.05, 'label': '經濟學系辦公室 櫃台'}

# ---------- 家具（導航阻擋）＋座位 ----------
F = []; SEATS = []
def add(t, x, z, w, d, yaw=0.0, **kw):
    F.append(dict({'type': t, 'x': round(x, 3), 'z': round(z, 3), 'w': w, 'd': d, 'yaw': round(yaw, 4)}, **kw))
# 大廳：西面玻璃邊的長椅（面向室內）、公告欄（南牆）、販賣機兩台（南牆西段）、樓層指引（核心西牆，電梯旁）、大盆栽兩盆
for z in (-3.6, 4.6):
    add('bench', X0 + 0.55, z, 0.5, 2.0, yaw=math.pi / 2)
    for k in (-0.6, 0.0, 0.6): SEATS.append({'x': X0 + 0.95, 'z': round(z + k, 3), 'yaw': round(math.pi / 2, 4), 'kind': 'bench'})
add('board', -9.2, Z1 - 0.06, 2.4, 0.08, yaw=math.pi, posters=9)
add('board', -5.6, Z1 - 0.06, 2.0, 0.08, yaw=math.pi, posters=7)
add('vending', -11.0, Z1 - 0.45, 2.0, 0.8, yaw=math.pi, n=2)                       # 兩台並排（南牆西段；不擋樓梯間的門）
add('directory', LOBBY_X1 - 0.05, 0.9, 1.4, 0.1, yaw=-math.pi / 2)                 # 樓層指引（掛牆，字由遊戲畫：PLATE_FACE_dir）
add('planter', X0 + 0.7, -5.0, 0.8, 0.8, kind='big')
add('planter', LOBBY_X1 - 0.6, -2.4, 0.8, 0.8, kind='big')
# 走廊：北面玻璃邊三張長椅（面向南）、一個資源回收桶組
for x in (1.0, 6.6, 11.2):
    add('bench', x, Z0 + 0.5, 2.0, 0.5, yaw=0.0)
    for k in (-0.6, 0.0, 0.6): SEATS.append({'x': round(x + k, 3), 'z': Z0 + 0.9, 'yaw': 0.0, 'kind': 'bench'})
add('bins', 4.6, COR_Z1 - 0.35, 1.2, 0.45, yaw=math.pi)
# 系辦（職員區，不能進去；從櫃台看得到）：辦公桌四張、信箱格、影印機、盆栽
OFF_ITEMS = [{'type': 'desk', 'x': -0.6, 'z': -0.9}, {'type': 'desk', 'x': 1.6, 'z': -0.9}, {'type': 'desk', 'x': -0.6, 'z': 0.6}, {'type': 'desk', 'x': 1.6, 'z': 0.6},
             {'type': 'pigeonholes', 'x': 4.9, 'z': -0.7}, {'type': 'copier', 'x': 4.5, 'z': 1.0}, {'type': 'plant', 'x': -1.8, 'z': 1.2}]
# 教室：講桌（黑板前）、兩人一桌 5 排 × 3 組（面向西）、窗台盆栽、後面的置物櫃
add('lectern', CLASS['x0'] + 1.0, 2.4, 0.6, 1.2, yaw=math.pi / 2)
cols = [0.2, 2.9, 5.6]                                  # 每排三組桌子的 z 中心（往北偏，留後門走道）
for r in range(5):
    x = CLASS['x0'] + 2.8 + r * 1.45
    for z in cols:
        add('table2', x, z, 0.55, 1.3, yaw=-math.pi / 2)
        for s in (-0.33, 0.33): SEATS.append({'x': round(x + 0.45, 3), 'z': round(z + s, 3), 'yaw': round(-math.pi / 2, 4), 'kind': 'class'})
add('lockers', X1 - 0.3, 6.6, 0.5, 2.0, yaw=-math.pi / 2)
L['walls'], L['doors'], L['counter'], L['furniture'], L['office_items'], L['seats'] = WALLS, DOORS, COUNTER, F, OFF_ITEMS, SEATS
L['windows'] = {'class_east': {'x': X1 + WT, 'z0': -2.6, 'z1': 7.4, 'sill': 0.9, 'top': 3.0}, 'class_south': {'z': Z1 + WT, 'x0': 5.6, 'x1': 14.4, 'sill': 0.9, 'top': 3.0}}
L['interact'] = [{'id': 'counter', 'x': 0.7, 'z': COR_Z1 - 0.7, 'r': 0.9, 'label': COUNTER['label']},
                 {'id': 'directory', 'x': LOBBY_X1 - 0.8, 'z': 0.9, 'r': 0.8, 'label': '樓層指引'},
                 {'id': 'board', 'x': -7.4, 'z': Z1 - 0.8, 'r': 1.2, 'label': '公告欄'},
                 {'id': 'elevator', 'x': LOBBY_X1 - 0.8, 'z': 3.6, 'r': 0.9, 'label': '電梯（2F 以上請刷卡）'},
                 {'id': 'stair', 'x': LOBBY_X1 - 0.7, 'z': 6.6, 'r': 0.8, 'label': '樓梯間（刷卡進出）'}]


def check(L):
    """座位不在家具、牆裡面；互動點、出生點走得到（在室內、不在阻擋裡）"""
    bad = []
    def inside_rect(x, z, f, pad=0.0):
        if f.get('skip'): return False
        w, d = (f['d'], f['w']) if abs(math.sin(f['yaw'])) > 0.7 else (f['w'], f['d'])
        return abs(x - f['x']) < w / 2 + pad and abs(z - f['z']) < d / 2 + pad
    pts = [('spawn_' + e['id'], e['spawn']['x'], e['spawn']['z']) for e in L['entrances']] + [('it_' + i['id'], i['x'], i['z']) for i in L['interact']]
    for n, x, z in pts:
        if not (X0 + R_PLAYER < x < X1 - R_PLAYER and Z0 + R_PLAYER < z < Z1 - R_PLAYER): bad.append((n, 'outside'))
        for f in L['furniture']:
            if inside_rect(x, z, f, R_PLAYER): bad.append((n, f['type']))
        for rn in ('core', 'office', 'store'):
            r = L['rooms'][rn]
            if r['x0'] < x < r['x1'] and r['z0'] < z < r['z1']: bad.append((n, 'in ' + rn))
    for i, s in enumerate(L['seats']):
        for f in L['furniture']:
            if f['type'] not in ('table2', 'bench') and inside_rect(s['x'], s['z'], f): bad.append(('seat%d' % i, f['type']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('seats', len(SEATS), 'furniture', len(F), 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
