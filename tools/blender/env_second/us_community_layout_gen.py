"""美國交換：校外學生公寓社區的戶外（SCN-US-01「社區外觀」；區域 us_outside）配置 → assets/models/env/second_ai/us_community.layout.json。
LAWWW2-C 2026-10-17。遊戲（LAWWW：導航格、出生點、互動點、停車場的車）和 Blender（tools/blender/env_second/us_community.py）讀同一份。
用法：python3 tools/blender/env_second/us_community_layout_gen.py [--check]

參考：使用者 2026-10-16 的社區外觀照片（docs/art-rebuild/second_ai/research/us_apartment_photos.md 照片二）：
  兩層的木構公寓（使用者 2026-10-17 又給一張：橄欖灰褐壁板、有幾棟淺米色、樓梯間入口上面也是山牆、入口紅磚柱＋紅色社區牌、白色欄杆、深灰柏油）沿停車場一棟接一棟；灰褐色橫向壁板、白色轉角與窗框飾條；山牆朝前的斜屋頂（深色瀝青瓦）、山牆上白色圓形通風口；
  一樓轉角、入口兩側紅磚；開放式樓梯間（有屋頂、白柱子）；內凹陽台、咖啡色木欄杆；柏油停車場白色格線；矮灌木、新種的小樹；後面成片的大樹（自然保護區）；牆上一排電錶。
遊戲版（不宣稱還原真實社區、不放社區名、門牌號碼、車牌，D77）：
  區域座標 x 往東、z 往南、y 往上；範圍 x −42～42、z −32～32。
  B 棟＝祐廷住的那棟（北邊、正面朝南）：二樓 213 的樓梯平台（us_apartment 的 breezeway）往東的樓梯下來就是這裡的出生點（樓梯口）。
  A 棟在 B 棟西邊（同一排），C 棟在東邊（轉 90°、正面朝西）。中間是停車場（兩排車位夾一條車道），南邊是樹林，西邊是社區出口（往公車站，之後的區域）。
座位 yaw：人物面向 (sin yaw, cos yaw)。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_community.layout.json')
rng = random.Random(1017)
X0, X1, Z0, Z1 = -42.0, 42.0, -32.0, 32.0
FLOOR_H, FLOORS = 2.9, 2   # 使用者 2026-10-17 照片：兩層樓

# 建築：中心、長（沿正面）、深、正面朝向（yaw：正面法線＝(sin, cos)；0＝朝南）、山牆數、樓梯間在正面的位置（沿正面的局部座標）
BUILDINGS = [
    {'id': 'A', 'cx': -25.0, 'cz': -22.5, 'len': 28.0, 'dep': 13.0, 'yaw': 0.0, 'gables': 3, 'breezeway': [-4.0], 'tint': '#777566'},
    {'id': 'B', 'cx': 8.0, 'cz': -22.5, 'len': 32.0, 'dep': 13.0, 'yaw': 0.0, 'gables': 4, 'breezeway': [-8.0, 6.0], 'tint': '#6d6c5f', 'home': True},
    {'id': 'C', 'cx': 33.5, 'cz': 6.0, 'len': 26.0, 'dep': 13.0, 'yaw': -math.pi / 2, 'gables': 3, 'breezeway': [2.0], 'tint': '#8c8572'},
]
# 會所（clubhouse：社區辦公室＋交誼廳；BB_215「社區走到 C 棟和會所門口」，會所晚餐是 2D）：停車場南邊、往西出口旁（美國社區的會所通常在入口附近）。
# 一層樓、正面朝北（yaw π）、正中間有門廊（兩根白柱、小山牆）；門口的互動點在門廊下
CLUB = {'id': 'H', 'cx': -28.0, 'cz': 16.8, 'len': 13.0, 'dep': 7.6, 'yaw': math.pi, 'eave': 3.8, 'porch': {'w': 4.8, 'd': 2.0}, 'tint': '#b8ad95',
        'note': '會所（辦公室＋交誼廳）：一層、正面朝北；門廊兩根白柱；招牌空白（D77）'}
# 停車場：柏油範圍、兩排車位（車頭朝車道）、車道
LOT = {'x0': -34.0, 'x1': 24.0, 'z0': -10.0, 'z1': 10.0}
STALL_W, STALL_D, AISLE = 2.7, 5.5, 7.0
rows = [{'z': LOT['z0'] + STALL_D / 2 + 0.3, 'face': 1}, {'z': LOT['z1'] - STALL_D / 2 - 0.3, 'face': -1}]   # face：車頭朝 +z（1）或 −z（−1）
KINDS = [('car_sedan', 0.30), ('car_suv', 0.30), ('car_pickup', 0.12), ('car_hatch', 0.16), ('car_minivan', 0.12)]
COLORS = ['#f2f2ef', '#c9ccd0', '#8d9196', '#2b2d30', '#1f2f4f', '#7a1f24', '#3d4a3c', '#b8b2a5', '#f2f2ef', '#c9ccd0', '#2b2d30']
STALLS, CARS = [], []
for ri, r in enumerate(rows):
    n = int((LOT['x1'] - LOT['x0'] - 2.0) // STALL_W)
    for k in range(n):
        x = LOT['x0'] + 1.0 + STALL_W * (k + 0.5)
        STALLS.append({'x': round(x, 3), 'z': round(r['z'], 3), 'face': r['face']})
        if rng.random() < 0.72:      # 停滿七成（白天上課時間；空位留給玩家走）
            u = rng.random(); kind = 'car_sedan'
            for kk, w in KINDS:
                if u < w: kind = kk; break
                u -= w
            CARS.append({'x': round(x + rng.uniform(-0.12, 0.12), 3), 'z': round(r['z'] + rng.uniform(-0.15, 0.15), 3), 'yaw': round((0.0 if r['face'] > 0 else math.pi) + rng.uniform(-0.04, 0.04), 4),
                         'kind': kind, 'color': rng.choice(COLORS)})
HOME = next(b for b in BUILDINGS if b.get('home'))
# 出生點：B 棟東邊那個樓梯間的樓梯口（正面＝南、z＝cz＋dep/2＋1.4）
bx = HOME['cx'] + HOME['breezeway'][1]; front_z = HOME['cz'] + HOME['dep'] / 2
L = {'version': 1, 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'floorH': FLOOR_H, 'floors': FLOORS,
     'buildings': BUILDINGS, 'lot': LOT, 'stall': {'w': STALL_W, 'd': STALL_D, 'aisle': AISLE}, 'stalls': STALLS, 'cars': CARS,
     'sidewalk': {'w': 1.8},
     'spawn_home': {'x': round(bx, 3), 'z': round(front_z + 1.5, 3), 'yaw': 0.0, 'note': '213 樓梯平台往下的樓梯口（us_apartment 的 exit to us_outside）：樓梯間在正中間一跑直上二樓，樓梯腳在樓梯間前緣；出生點在入口白鐵欄杆外面、面向停車場'},
     'to_home': {'x': round(bx, 3), 'z': round(front_z - 0.4, 3), 'r': 1.0, 'label': '上樓（213）', 'to': 'us_apartment'},
     'breezeway_geom': {'w': 4.4, 'depth': 6.0, 'stair_w': 1.4, 'stair_from_front': 0.2, 'tread': 0.25, 'steps': 18, 'landing_depth': 1.3,
                        'note': '樓梯間（區域座標：正面往內 6 m）；樓梯在正中間、從前緣往內 0.2 m 開始往後爬到二樓平台；一樓兩側牆後段各一戶的門、二樓平台後牆兩戶的門；入口走道兩側白鐵欄杆（x＝中心±1.25、正面往外 0.2～1.2 m）'},
     'exit_west': {'x': X0 + 2.0, 'z': 0.0, 'r': 1.6, 'label': '社區出口（往公車站）', 'to': 'us_bus_stop'},
     'forest': {'z0': 18.0, 'z1': Z1, 'note': '南邊成片的大樹：近的幾棵是模型、後面是一排樹的剪影（走不到）'}}
PROPS = []
def prop(t, x, z, yaw=0.0, **kw): PROPS.append(dict({'type': t, 'x': round(x, 3), 'z': round(z, 3), 'yaw': round(yaw, 4)}, **kw))
prop('mailboxes', -6.0, -12.6, 0.0)                  # 集中信箱（社區常見的金屬信箱組）
prop('dumpster', -38.0, -12.0, math.pi / 2)          # 垃圾子母車＋圍牆
prop('bikerack', 18.0, -12.6, 0.0)
prop('bench', 26.0, 14.0, -math.pi / 2)
for x in (-30.0, -14.0, 2.0, 18.0):                  # 美式路燈（停車場兩側）
    prop('lamp', x, LOT['z0'] - 0.6, 0.0); prop('lamp', x, LOT['z1'] + 0.6, math.pi)
for b in BUILDINGS:                                  # 冷氣室外機（每棟背面一排；正面的轉角兩台）、電錶（樓梯間旁邊的牆）
    for k in (-1, 1):
        prop('ac_unit', 0.0, 0.0, 0.0, building=b['id'], local=[k * (b['len'] / 2 - 2.0), b['dep'] / 2 + 0.6])
    prop('meters', 0.0, 0.0, 0.0, building=b['id'], local=[b['breezeway'][0] - 2.4, b['dep'] / 2 + 0.05])
TREES = []
for k in range(14):                                  # 停車場兩側的新種小樹（樹穴）＋南邊樹林前緣的大樹
    TREES.append({'x': round(LOT['x0'] + 2.0 + k * 4.2, 3), 'z': round(LOT['z1'] + 2.2, 3), 'kind': 'young', 'h': round(rng.uniform(3.2, 4.4), 2)})
for k in range(18):
    TREES.append({'x': round(X0 + 3.0 + k * 4.6 + rng.uniform(-1, 1), 3), 'z': round(L['forest']['z0'] + 3.0 + rng.uniform(0, 6), 3), 'kind': 'big', 'h': round(rng.uniform(11, 17), 1)})
_cx0, _cx1 = CLUB['cx'] - CLUB['len'] / 2 - 1.5, CLUB['cx'] + CLUB['len'] / 2 + 1.5   # 會所前面的小樹拿掉、後面的大樹往後退（樹冠不插進屋頂）
TREES = [t for t in TREES if not (t['kind'] == 'young' and _cx0 < t['x'] < _cx1)]
for t in TREES:
    if t['kind'] == 'big' and _cx0 - 2 < t['x'] < _cx1 + 2 and t['z'] < 24.5: t['z'] = round(24.5 + (t['z'] - 21.0) * 0.4, 3)
CLUB['door'] = {'x': CLUB['cx'], 'z': round(CLUB['cz'] - CLUB['dep'] / 2 - 0.9, 3), 'r': 1.2, 'label': '會所'}
L['clubhouse'] = CLUB
L['props'], L['trees'] = PROPS, TREES


def W_(b, u, v):
    """建築局部 (u 沿正面、v 往正面外) → 區域 (x, z)"""
    c, s_ = math.cos(b['yaw']), math.sin(b['yaw'])
    return (b['cx'] + u * c + v * s_, b['cz'] - u * s_ + v * c)


def rect_w(b, u0, u1, v0, v1):
    pts = [W_(b, u, v) for u in (u0, u1) for v in (v0, v1)]
    return {'x0': round(min(p[0] for p in pts), 3), 'x1': round(max(p[0] for p in pts), 3), 'z0': round(min(p[1] for p in pts), 3), 'z1': round(max(p[1] for p in pts), 3)}


# 導航阻擋（給遊戲；長方形、區域座標）：建築本體（樓梯間凹進去的地方走得進去，只擋中間的樓梯）、正面灌木帶、路燈、小東西、樹幹、外圍樹林
BLOCKS = []
for b in BUILDINGS:
    Lb, Db = b['len'], b['dep']; bw = 4.4; vF = Db / 2
    cuts = sorted([(c - bw / 2, c + bw / 2) for c in b['breezeway']])
    u = -Lb / 2
    for (x0, x1) in cuts:
        BLOCKS.append(dict(rect_w(b, u, x0, -Db / 2, vF), why='building ' + b['id']))
        BLOCKS.append(dict(rect_w(b, x0, x1, -Db / 2, vF - 6.0), why='building ' + b['id'] + ' (behind breezeway)'))
        xm = (x0 + x1) / 2
        BLOCKS.append(dict(rect_w(b, xm - 0.75, xm + 0.75, vF - 4.75, vF - 0.6), why='breezeway stair (to_home at its foot)'))
        for xr in (xm - 1.25, xm + 1.25): BLOCKS.append(dict(rect_w(b, xr - 0.06, xr + 0.06, vF + 0.15, vF + 1.25), why='entry rail'))
        u = x1
    BLOCKS.append(dict(rect_w(b, u, Lb / 2, -Db / 2, vF), why='building ' + b['id']))
    k = -Lb / 2 + 0.5                                           # 灌木帶（樓梯間入口前 ±3.4 m 留走道）
    segs = []; cur = None
    while k < Lb / 2 - 0.5:
        ok = not any(abs(k - bx) < 3.4 for bx in b['breezeway'])
        if ok and cur is None: cur = k
        if not ok and cur is not None: segs.append((cur, k)); cur = None
        k += 0.1
    if cur is not None: segs.append((cur, Lb / 2 - 0.5))
    for (a_, c_) in segs: BLOCKS.append(dict(rect_w(b, a_, c_, vF, vF + 1.15), why='shrubs'))
_cf = CLUB['cz'] - CLUB['dep'] / 2   # 會所正面（朝北）的 z
BLOCKS.append({'x0': CLUB['cx'] - CLUB['len'] / 2, 'x1': CLUB['cx'] + CLUB['len'] / 2, 'z0': round(_cf, 3), 'z1': round(CLUB['cz'] + CLUB['dep'] / 2, 3), 'why': 'building H (clubhouse)'})
for _sx in (-1, 1):
    _px = CLUB['cx'] + _sx * (CLUB['porch']['w'] / 2 - 0.3); _pz = _cf - CLUB['porch']['d'] + 0.2
    BLOCKS.append({'x0': round(_px - 0.2, 3), 'x1': round(_px + 0.2, 3), 'z0': round(_pz - 0.2, 3), 'z1': round(_pz + 0.2, 3), 'why': 'clubhouse porch column'})
for p in PROPS:
    if 'building' in p: continue
    hs = {'lamp': (0.3, 0.3), 'mailboxes': (1.35, 0.45), 'dumpster': (1.5, 1.35), 'bikerack': (1.15, 0.4), 'bench': (0.35, 1.0)}.get(p['type'], (0.4, 0.4))
    hx, hz = (hs[1], hs[0]) if abs(math.sin(p['yaw'])) > 0.5 else hs
    BLOCKS.append({'x0': round(p['x'] - hx, 3), 'x1': round(p['x'] + hx, 3), 'z0': round(p['z'] - hz, 3), 'z1': round(p['z'] + hz, 3), 'why': p['type']})
for t in TREES:
    r = 0.3 if t['kind'] == 'young' else 0.45
    BLOCKS.append({'x0': round(t['x'] - r, 3), 'x1': round(t['x'] + r, 3), 'z0': round(t['z'] - r, 3), 'z1': round(t['z'] + r, 3), 'why': 'tree ' + t['kind']})
BLOCKS += [{'x0': X0, 'x1': X1, 'z0': Z1 - 4.5, 'z1': Z1, 'why': 'forest belt S'},
           {'x0': X1 - 2.5, 'x1': X1, 'z0': Z0, 'z1': Z1, 'why': 'forest belt E'},
           {'x0': X0, 'x1': X0 + 2.5, 'z0': Z0, 'z1': -6.0, 'why': 'forest belt W (north of exit road)'},
           {'x0': X0, 'x1': X0 + 2.5, 'z0': 6.0, 'z1': Z1, 'why': 'forest belt W (south of exit road)'}]
L['blocks'] = BLOCKS
L['cars_note'] = '車由遊戲照 cars 放（us_cars.glb 的 car_sedan／car_suv／car_pickup／car_hatch／car_minivan 節點；car_paint 材質是白色，照 color 上色）；每台的阻擋＝車長×車寬（us_cars.json 的 dims）轉 yaw'


def check(L):
    bad = []
    s = L['spawn_home']
    for b in L['buildings']:
        hl, hd = (b['len'] / 2, b['dep'] / 2) if abs(math.sin(b['yaw'])) < 0.5 else (b['dep'] / 2, b['len'] / 2)
        if abs(s['x'] - b['cx']) < hl and abs(s['z'] - b['cz']) < hd: bad.append(('spawn in building', b['id']))
    for c in L['cars']:
        if abs(c['x'] - s['x']) < 3.0 and abs(c['z'] - s['z']) < 3.5: bad.append(('car at spawn', c['x'], c['z']))
    for k in ('spawn_home', 'to_home', 'exit_west', 'club_door'):
        p = L[k] if k != 'club_door' else L['clubhouse']['door']
        for r in L['blocks']:
            if r['x0'] < p['x'] < r['x1'] and r['z0'] < p['z'] < r['z1']: bad.append((k + ' blocked', r['why']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('stalls', len(STALLS), 'cars', len(CARS), 'kinds', {k: sum(1 for c in CARS if c['kind'] == k) for k, _ in KINDS}, 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
