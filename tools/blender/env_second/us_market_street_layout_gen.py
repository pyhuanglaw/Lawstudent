"""美國交換：草原超市和對面竹葉亞洲超市之間的停車場、馬路（US-MARKET-STREET；區域 us_market_street）配置
→ assets/models/env/second_ai/us_market_street.layout.json。LAWWW2 2026-10-21。
遊戲（src/us3d.js：導航格、出生點、互動點、停著的車）和 Blender（tools/blender/env_second/us_market_street.py）讀同一份。
用法：python3 tools/blender/env_second/us_market_street_layout_gen.py [--check]

使用者 2026-10-17 23:0x：「超市一個大的超市對面有一個小的亞洲超市」；14:0x 選「做停車場和馬路」（UA-LAWWW2-1017-03）。
和兩家店的室內對得上：
  - 草原超市（us_market）：正面 44 m、自動門 IN（x +13.5）、OUT（x −13.5）各 2.4 m，玻璃 3.8 m 高；從竹葉亞洲超市看出去的景（us_am_view.png）＝米色牆、
    深綠色帶、中間米白招牌板上深綠色「Prairie Basket」、兩端兩道門、停車場的路燈和車 → 外觀照這張做。
  - 竹葉亞洲超市（us_asian_market）：正面 14.8 m、門 1.8 m 在室內 x +4.5（室內門在南牆、進門面向北）。這裡它在馬路南邊、正面朝北（轉 180°），
    所以門在街道座標 x＝店中心 − 4.5。
遊戲版（D77：店名虛構；不放車牌、真的路名）：區域座標 x 往東、z 往南、y 往上；範圍 x −42～42、z −30～46。
  北：草原超市（正面 z −22、朝南），門前人行道＋雨遮（z −22～−16.2）、消防車道（紅色路緣）。
  中：停車場（z −16.2～9.2：前車道、A 排（車頭朝南）、B 排（車頭朝北）、後車道）；南緣綠帶（z 9.2～11.6）、北側人行道（11.6～13.6）、行道樹草帶（13.6～15.4）。
  馬路（z 15.4～31.6）：往西兩線、中央分隔島（22.6～24.4，路口斷開）、往東兩線；路口在停車場大門（x 14～24），兩側斑馬線、號誌、行人燈。
    主幹道是紅燈：路口兩邊各有幾台車停在停止線後面等（行人燈是綠的＝玩家過馬路的時候）。
  南：人行道（31.6～34.4）、一排一層樓小商店的騎樓（34.4～38），正面 z 38：自助洗衣、麵店、竹葉亞洲超市（正對草原超市）、招租；東邊是往後面停車場的車道和社區招牌。
  公車站在北側人行道西段（社區的公車到這裡；回社區也在這裡搭）。
座位、出生點 yaw：人物面向 (sin yaw, cos yaw)（0＝朝南、π＝朝北）。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_market_street.layout.json')
MK = json.load(open(os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_market.layout.json'), encoding='utf-8'))
AM = json.load(open(os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_asian_market.layout.json'), encoding='utf-8'))
rng = random.Random(1021)
X0, X1, Z0, Z1 = -42.0, 42.0, -30.0, 46.0
R = lambda v: round(v, 3)

# ---------------- 草原超市（北，正面朝南）----------------
PB_FZ = -22.0
PB = {'x0': MK['bounds']['x0'], 'x1': MK['bounds']['x1'], 'front_z': PB_FZ, 'back_z': PB_FZ - (MK['bounds']['z1'] - MK['bounds']['z0']),
      'h': 7.4, 'sign_h': 9.4, 'sign_w': 17.0, 'glass': {'x0': MK['storefront']['x0'], 'x1': MK['storefront']['x1'], 'h': MK['storefront']['glass_h']},
      'doors': [dict(d) for d in MK['doors']], 'vestibule': {'w': 6.0, 'd': 2.6, 'h': 3.3},
      'canopy': {'z1': PB_FZ + 3.2, 'y': 3.9, 'fascia': 0.6, 'cols': [-20.0, -6.75, 6.75, 20.0]},
      'name_en': MK['name_en'], 'name_zh': MK['name_zh'],
      'note': '室內 us_market 的正面在南牆（z 16）：x 一樣、不用轉；門 IN x 13.5、OUT x −13.5；外觀照 us_am_view.png（米色牆、深綠色帶、米白招牌板、兩端兩道門）'}
APRON = {'z0': PB_FZ, 'z1': -16.2}          # 門前人行道（雨遮下）
FIRE = {'z0': -16.2, 'z1': -12.6}           # 消防車道（柏油上畫斜線、路緣漆紅）
# ---------------- 停車場 ----------------
LOT = {'x0': -38.0, 'x1': 38.0, 'z0': -16.2, 'z1': 9.2}
STALL_W, STALL_D = 2.7, 5.5
ROWS = [{'id': 'A', 'z': -9.0 + STALL_D / 2, 'face': 1}, {'id': 'B', 'z': -3.5 + STALL_D / 2, 'face': -1}]   # A：從前車道開進去、車頭朝南；B：從後車道、車頭朝北
AISLES = [{'z0': -16.2, 'z1': -9.0}, {'z0': 2.0, 'z1': 9.2}]
POLES = [-27.0, -9.45, 9.45, 27.0]           # 停車場燈桿（A、B 兩排車頭中間，z −3.5；放在車位線上、旁邊兩格不停車）
STRIP = {'z0': 9.2, 'z1': 11.6}             # 停車場南緣綠帶（路緣、灌木、小樹）
WALK_N = {'z0': 11.6, 'z1': 13.6}           # 北側人行道
LAWN_N = {'z0': 13.6, 'z1': 15.4}           # 行道樹草帶
ROAD = {'z0': 15.4, 'z1': 31.6, 'lanes_w': [15.4, 22.6], 'median': [22.6, 24.4], 'lanes_e': [24.4, 31.6], 'lane_w': 3.6}
DRIVE = {'x0': 14.0, 'x1': 24.0, 'note': '停車場大門＝路口北側；南側是商店後面停車場的車道'}
DRIVE_W = {'x0': -37.6, 'x1': -31.6, 'note': '停車場西側出入口（右進右出，沒有號誌）'}
CROSS = [{'x0': 10.6, 'x1': 13.6}, {'x0': 24.4, 'x1': 27.4}]     # 路口兩側的斑馬線（跨整條馬路）
WALK_S = {'z0': 31.6, 'z1': 34.4}           # 南側人行道
ARCADE = {'z0': 34.4, 'z1': 38.0, 'y': 3.4}  # 小商店的騎樓（雨遮下）
STRIPMALL_FZ = 38.0
AM_CX = 0.0                                  # 竹葉亞洲超市正對草原超市
UNITS = [
    {'id': 'laundry', 'x0': -34.0, 'x1': -22.0, 'name_en': 'COIN LAUNDRY', 'kind': 'laundry', 'note': '自助洗衣（通稱，不是店名）'},
    {'id': 'noodle', 'x0': -22.0, 'x1': -8.0, 'name_en': 'NOODLE HOUSE', 'kind': 'noodle', 'note': '麵店（通稱）'},
    {'id': 'asian', 'x0': AM_CX - 8.0, 'x1': AM_CX + 8.0, 'name_en': AM['name_en'], 'name_zh': AM['name_zh'], 'kind': 'asian',
     'door_x': AM_CX - AM['door']['x'], 'door_w': AM['door']['w'], 'note': '室內 us_asian_market（門在室內 x +4.5、南牆）轉 180°：街道 x＝中心 − 4.5'},
    {'id': 'lease', 'x0': 8.0, 'x1': 14.0, 'name_en': 'FOR LEASE', 'kind': 'vacant', 'note': '招租（窗上貼紙）'},
]
STRIPMALL = {'x0': UNITS[0]['x0'], 'x1': UNITS[-1]['x1'], 'front_z': STRIPMALL_FZ, 'back_z': STRIPMALL_FZ + 14.0, 'h': 5.2, 'parapet': 6.0, 'units': UNITS,
             'cols': [-34.0 + 0.2 + k * 6.0 for k in range(9)] + [13.8]}
# ---------------- 車（停著的；等紅燈的）----------------
KINDS = [('car_sedan', 0.30), ('car_suv', 0.32), ('car_pickup', 0.12), ('car_hatch', 0.14), ('car_minivan', 0.12)]
COLORS = ['#f2f2ef', '#c9ccd0', '#8d9196', '#2b2d30', '#1f2f4f', '#7a1f24', '#3d4a3c', '#b8b2a5', '#f2f2ef', '#c9ccd0', '#2b2d30', '#5a2a1e']
def pick_kind():
    u = rng.random()
    for k, w in KINDS:
        if u < w: return k
        u -= w
    return 'car_sedan'
CORRAL_STALLS = [('B', -19.45), ('B', 18.35)]                          # 停車場裡的推車回收欄放在 B 排的兩格（不停車）
STALLS, CARS, ADA = [], [], []
for r in ROWS:
    n = int((LOT['x1'] - LOT['x0'] - 2.0) // STALL_W)
    for k in range(n):
        x = LOT['x0'] + 1.0 + STALL_W * (k + 0.5)
        pole = any(abs(x - p) < STALL_W * 0.75 for p in POLES)       # 燈桿旁邊那兩格不停車（燈座在車頭線上）
        ada = r['id'] == 'A' and any(abs(x - d['x']) < STALL_W * 1.6 for d in PB['doors'])   # 門口正前方 A 排兩三格是無障礙車位（藍色標誌）
        s = {'x': R(x), 'z': R(r['z']), 'face': r['face'], 'row': r['id']}
        if ada: s['ada'] = True; ADA.append(s)
        STALLS.append(s)
        corral = any(r['id'] == rr and abs(x - xx) < 0.2 for rr, xx in CORRAL_STALLS)
        if corral: s['corral'] = True
        if pole or corral: continue
        near = min(abs(x - d['x']) for d in PB['doors'])                # 門口附近停得比較滿（下午買菜）
        p = (0.75 if near < 14 else 0.5) * (0.4 if ada else 1.0)
        if rng.random() < p:
            CARS.append({'x': R(x + rng.uniform(-0.12, 0.12)), 'z': R(r['z'] + rng.uniform(-0.15, 0.15)), 'yaw': round((0.0 if r['face'] > 0 else math.pi) + rng.uniform(-0.04, 0.04), 4),
                         'kind': pick_kind(), 'color': rng.choice(COLORS)})
LANE_C = {'w1': 17.2, 'w2': 20.8, 'e2': 26.2, 'e1': 29.8}             # 車道中心（w＝往西、e＝往東；1＝外側車道）
STOP_W, STOP_E = CROSS[1]['x1'] + 1.0, CROSS[0]['x0'] - 1.0           # 停止線（往西的車停在東側斑馬線外、往東的停在西側斑馬線外）
WAIT = [('w1', STOP_W + 2.6, -math.pi / 2), ('w1', STOP_W + 9.0, -math.pi / 2), ('w2', STOP_W + 2.7, -math.pi / 2),
        ('e1', STOP_E - 2.6, math.pi / 2), ('e2', STOP_E - 2.8, math.pi / 2), ('e2', STOP_E - 9.2, math.pi / 2)]
for ln, x, yaw in WAIT:
    CARS.append({'x': R(x), 'z': R(LANE_C[ln] + rng.uniform(-0.1, 0.1)), 'yaw': round(yaw, 4), 'kind': pick_kind(), 'color': rng.choice(COLORS), 'waiting': True})
CARS.append({'x': 21.6, 'z': 6.4, 'yaw': 0.0, 'kind': 'car_suv', 'color': '#c9ccd0', 'waiting': True, 'note': '從停車場要出去、在大門的停止線等左轉'})

# ---------------- 出生點、互動點 ----------------
D_IN = next(d for d in PB['doors'] if d['id'] == 'in'); D_OUT = next(d for d in PB['doors'] if d['id'] == 'out')
VZ = PB_FZ + PB['vestibule']['d']                                       # 門斗正面（自動門）z
UA = next(u for u in UNITS if u['id'] == 'asian')
BUS = {'x': -26.0, 'z': R((WALK_N['z0'] + WALK_N['z1']) / 2), 'shelter': {'x0': -28.2, 'x1': -23.8, 'z0': 9.7, 'z1': 11.3}, 'sign': {'x': -22.6, 'z': 14.9},
       'note': '社區的公車停這裡（往西那一側）；回社區也在這裡搭'}
L = {'version': 1, 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1},
     'market': PB, 'apron': APRON, 'fire_lane': FIRE, 'lot': LOT, 'stall': {'w': STALL_W, 'd': STALL_D}, 'rows': ROWS, 'aisles': AISLES, 'stalls': STALLS, 'poles': [{'x': p, 'z': -3.5} for p in POLES],
     'strip': STRIP, 'walk_n': WALK_N, 'lawn_n': LAWN_N, 'road': ROAD, 'lane_c': LANE_C, 'drive': DRIVE, 'drive_w': DRIVE_W, 'cross': CROSS, 'stop_w': R(STOP_W), 'stop_e': R(STOP_E),
     'walk_s': WALK_S, 'arcade': ARCADE, 'stripmall': STRIPMALL, 'bus': BUS, 'cars': CARS,
     'spawn_bus': {'x': BUS['x'], 'z': R(BUS['z'] + 0.3), 'yaw': math.pi, 'note': '從社區搭公車來：下車站在公車站、面向北（停車場、草原超市）'},
     'spawn_pb_out': {'x': D_OUT['x'], 'z': R(VZ + 1.2), 'yaw': 0.0, 'note': '從草原超市 OUT 門出來（us_market 的「離開超市」），面向南'},
     'spawn_am_out': {'x': UA['door_x'], 'z': R(STRIPMALL_FZ - 1.4), 'yaw': math.pi, 'note': '從竹葉亞洲超市出來，面向北（馬路、草原超市）'},
     'interact': [
         {'id': 'pb_in', 'x': D_IN['x'], 'z': R(VZ + 0.6), 'r': 1.2, 'label': '進草原超市', 'to': 'us_market'},
         {'id': 'am_in', 'x': UA['door_x'], 'z': R(STRIPMALL_FZ - 0.7), 'r': 1.0, 'label': '進竹葉亞洲超市', 'to': 'us_asian_market'},
         {'id': 'bus', 'x': BUS['x'], 'z': BUS['z'], 'r': 1.3, 'label': '搭公車（回社區）', 'to': 'us_outside'},
         {'id': 'lease', 'x': 11.0, 'z': R(STRIPMALL_FZ - 0.7), 'r': 1.0, 'label': '看招租的告示', 'look': '空的店面，玻璃上貼著招租的紙：一個電話號碼、「FOR LEASE」。'},
     ]}

# ---------------- 樹、小東西 ----------------
TREES = []
for x in (-36.4, 36.4):                                                   # 停車場兩端的安全島（A、B 兩排的端點）
    TREES.append({'x': x, 'z': -3.5, 'kind': 'island', 'h': round(rng.uniform(6.5, 7.5), 2)})
for k in range(9):                                                         # 南緣綠帶的小樹（大門、西出入口、行人缺口不種）
    x = -34.0 + k * 8.6
    if DRIVE['x0'] - 2 < x < DRIVE['x1'] + 2 or DRIVE_W['x0'] - 2 < x < DRIVE_W['x1'] + 2 or 8.6 < x < 14.0 or BUS['shelter']['x0'] - 1.5 < x < BUS['shelter']['x1'] + 1.5: continue
    TREES.append({'x': R(x), 'z': R((STRIP['z0'] + STRIP['z1']) / 2), 'kind': 'young', 'h': round(rng.uniform(4.0, 5.2), 2)})
for k in range(8):                                                         # 北側行道樹（草帶）
    x = -39.0 + k * 11.0
    if DRIVE['x0'] - 3 < x < DRIVE['x1'] + 3 or CROSS[0]['x0'] - 2 < x < CROSS[0]['x1'] + 2 or DRIVE_W['x0'] - 2 < x < DRIVE_W['x1'] + 2: continue
    TREES.append({'x': R(x), 'z': R((LAWN_N['z0'] + LAWN_N['z1']) / 2), 'kind': 'street', 'h': round(rng.uniform(8.0, 10.0), 2)})
for x in (-30.0, -14.0, 2.0):                                              # 南側人行道的樹（樹穴格柵）
    TREES.append({'x': x, 'z': 32.6, 'kind': 'street', 'h': round(rng.uniform(7.5, 9.0), 2), 'grate': True})
for k in range(6):                                                         # 商店東邊的草地、社區招牌後面
    TREES.append({'x': R(28.0 + (k % 3) * 5.0 + rng.uniform(-1, 1)), 'z': R(37.0 + (k // 3) * 6.0 + rng.uniform(-1, 1)), 'kind': 'big', 'h': round(rng.uniform(10, 14), 1)})
for k in range(7):                                                         # 草原超市兩側後面的樹（背景）
    for sx in (-1, 1):
        TREES.append({'x': R(sx * (25.0 + k * 2.6)), 'z': R(-24.0 - (k % 3) * 2.2), 'kind': 'big', 'h': round(rng.uniform(11, 15), 1)})
PROPS = []
def prop(t, x, z, yaw=0.0, **kw): PROPS.append(dict({'type': t, 'x': R(x), 'z': R(z), 'yaw': round(yaw, 4)}, **kw))
for d in PB['doors']:                                                      # 門口：推車回收欄、垃圾桶、車阻（雨遮下）
    s = 1 if d['x'] > 0 else -1
    prop('cart_corral', d['x'] + s * 5.9, PB_FZ + 0.9, math.pi / 2, carts=6)       # 門斗外側、沿牆（長邊沿 x）
    prop('trash', d['x'] - s * 3.6, VZ + 0.3, 0.0)
    for k in (-1, 0, 1): prop('bollard', d['x'] + k * 1.6, VZ + 1.9, 0.0)
prop('ice_chest', -4.2, PB_FZ + 0.6, 0.0); prop('propane_cage', 3.6, PB_FZ + 0.6, 0.0); prop('bench', 0.0, PB_FZ + 2.4, math.pi)
prop('season_display', -7.0, PB_FZ + 1.5, 0.0, note='季節陳列：夏天花架、秋天南瓜、初冬柴薪和融雪鹽、雪天聖誕樹')
prop('season_display', 7.0, PB_FZ + 1.5, 0.0)
for rr, x in CORRAL_STALLS:                                                # 停車場裡的推車回收欄（B 排的兩格）
    prop('cart_corral', x, ROWS[1]['z'], 0.0, carts=3)
prop('bus_shelter', (BUS['shelter']['x0'] + BUS['shelter']['x1']) / 2, (BUS['shelter']['z0'] + BUS['shelter']['z1']) / 2, 0.0)   # 開口朝南（面向馬路）
prop('bus_sign', BUS['sign']['x'], BUS['sign']['z'], math.pi / 2)                                                                 # 站牌面向東（往西開來的公車）
for x in (-34.0, -10.0, 32.0):                                             # 北側路燈（草帶，燈臂朝馬路）
    prop('street_lamp', x, LAWN_N['z0'] + 1.3, 0.0)
for x in (-24.0, 4.0, 34.0):                                               # 南側路燈（人行道外緣，燈臂朝北）
    prop('street_lamp', x, WALK_S['z0'] + 0.4, math.pi)
prop('signal_mast', CROSS[0]['x0'] - 1.0, LAWN_N['z0'] + 1.0, 0.0, note='西北角（往西的車過了路口那一邊＝美國的號誌在路口遠側）：橫桿往南伸過往西的兩線、燈面向東；桿上另一組燈面向南（給商店那邊開出來的車）')
prop('signal_mast', CROSS[1]['x1'] + 1.0, WALK_S['z0'] + 1.0, math.pi, note='東南角（往東的車的遠側）：橫桿往北伸過往東的兩線、燈面向西；桿上另一組燈面向北（給停車場開出來的車）')
prop('ped_signal', CROSS[0]['x0'] - 0.4, WALK_N['z1'] + 0.3, 0.0); prop('ped_signal', CROSS[0]['x0'] - 0.4, WALK_S['z0'] + 0.3, math.pi)
prop('ped_signal', CROSS[1]['x1'] + 0.4, WALK_N['z1'] + 0.3, 0.0); prop('ped_signal', CROSS[1]['x1'] + 0.4, WALK_S['z0'] + 0.3, math.pi)
prop('hydrant', -16.0, LAWN_N['z0'] + 0.5, 0.0); prop('hydrant', 18.0, WALK_S['z1'] - 0.4, 0.0)
prop('newsbox', -20.0, ARCADE['z0'] + 0.6, math.pi); prop('bench', -12.0, STRIPMALL_FZ - 0.6, math.pi); prop('trash', -2.0, STRIPMALL_FZ - 0.5, 0.0)
prop('monument_sign', 31.0, 35.4, -math.pi / 4, note='商店街的社區招牌（Bamboo Plaza，虛構）')
for x in (-30.6, -27.6):                                                   # 洗衣店門口的長椅、盆栽
    prop('planter', x, STRIPMALL_FZ - 0.5, 0.0)
L['trees'], L['props'] = TREES, PROPS

# ---------------- 導航阻擋（長方形；遊戲端用 blockRect；建築以 building 開頭的會加鏡頭碰撞）----------------
BLOCKS = []
def blk(x0, x1, z0, z1, why): BLOCKS.append({'x0': R(min(x0, x1)), 'x1': R(max(x0, x1)), 'z0': R(min(z0, z1)), 'z1': R(max(z0, z1)), 'why': why})
blk(PB['x0'], PB['x1'], Z0, PB_FZ, 'building 草原超市')
for d in PB['doors']:                                                      # 門斗（玻璃盒）：自動門在正面，互動點在門外
    blk(d['x'] - PB['vestibule']['w'] / 2, d['x'] + PB['vestibule']['w'] / 2, PB_FZ, VZ - 0.05, 'building 門斗 ' + d['id'])
for x in PB['canopy']['cols']: blk(x - 0.35, x + 0.35, PB['canopy']['z1'] - 0.65, PB['canopy']['z1'] + 0.05, 'canopy column')
blk(X0, PB['x0'] - 0.5, Z0, -18.0, 'landscape 超市西側（草坡、樹）'); blk(PB['x1'] + 0.5, X1, Z0, -18.0, 'landscape 超市東側（草坡、樹）')
blk(X0, LOT['x0'], -18.0, STRIP['z0'], 'landscape 停車場西緣'); blk(LOT['x1'], X1, -18.0, STRIP['z0'], 'landscape 停車場東緣')
for x in (-36.4, 36.4): blk(x - 1.4, x + 1.4, -9.0, 2.0, 'island 安全島＋樹')
for p in POLES: blk(p - 0.4, p + 0.4, -3.9, -3.1, 'lot pole base')
# 南緣綠帶：大門、西出入口、行人缺口（對齊西側斑馬線）、公車站以外都擋（灌木）
gaps = sorted([(DRIVE['x0'], DRIVE['x1']), (DRIVE_W['x0'], DRIVE_W['x1']), (CROSS[0]['x0'] - 1.6, CROSS[0]['x1'] + 0.4), (BUS['shelter']['x0'] - 1.2, BUS['shelter']['x1'] + 1.2)])
x = LOT['x0']
for g0, g1 in gaps:
    if g0 > x: blk(x, g0, STRIP['z0'], STRIP['z1'], 'strip 停車場南緣灌木帶')
    x = max(x, g1)
if x < LOT['x1']: blk(x, LOT['x1'], STRIP['z0'], STRIP['z1'], 'strip 停車場南緣灌木帶')
blk(LOT['x1'], X1, STRIP['z0'], STRIP['z1'], 'strip 東段'); blk(X0, LOT['x0'], STRIP['z0'], STRIP['z1'], 'strip 西段')
S = BUS['shelter']; blk(S['x0'], S['x1'], S['z0'], S['z0'] + 0.35, 'bus shelter back panel'); blk(S['x0'], S['x0'] + 0.3, S['z0'], S['z1'] - 0.2, 'bus shelter side'); blk(S['x1'] - 0.3, S['x1'], S['z0'], S['z1'] - 0.2, 'bus shelter side')
# 中央分隔島（路口斷開）：走得過去的只有斑馬線
blk(X0, CROSS[0]['x0'], ROAD['median'][0], ROAD['median'][1], 'median 中央分隔島'); blk(CROSS[1]['x1'], X1, ROAD['median'][0], ROAD['median'][1], 'median 中央分隔島')
# 小商店
blk(STRIPMALL['x0'], STRIPMALL['x1'], STRIPMALL_FZ, Z1, 'building 小商店')
for x in STRIPMALL['cols']: blk(x - 0.35, x + 0.35, ARCADE['z0'] + 0.1, ARCADE['z0'] + 0.8, 'arcade column')
blk(X0, STRIPMALL['x0'], ARCADE['z0'], Z1, 'landscape 小商店西邊（圍籬、樹）')
blk(DRIVE['x1'] + 2.0, X1, WALK_S['z1'] + 0.6, Z1, 'landscape 社區招牌後面的草地、樹')
for t in TREES:
    if t['kind'] in ('young', 'street'): blk(t['x'] - 0.35, t['x'] + 0.35, t['z'] - 0.35, t['z'] + 0.35, 'tree trunk')
for p in PROPS:
    sz = {'cart_corral': (1.0, 4.4), 'trash': (0.7, 0.7), 'bollard': (0.4, 0.4), 'ice_chest': (2.0, 0.9), 'propane_cage': (1.6, 0.9), 'bench': (1.8, 0.7),
          'season_display': (3.2, 1.6), 'bus_sign': (0.3, 0.3), 'street_lamp': (0.45, 0.45), 'signal_mast': (0.6, 0.6), 'ped_signal': (0.3, 0.3), 'hydrant': (0.45, 0.45),
          'newsbox': (0.6, 0.6), 'monument_sign': (3.6, 1.2), 'planter': (0.9, 0.9)}.get(p['type'])
    if not sz: continue
    w, d = sz
    if abs(math.sin(p['yaw'])) > 0.7: w, d = d, w
    blk(p['x'] - w / 2, p['x'] + w / 2, p['z'] - d / 2, p['z'] + d / 2, 'prop ' + p['type'])
L['blocks'] = BLOCKS
L['cars_note'] = '車由遊戲照 cars 放（us_cars.glb 的 car_sedan／car_suv／car_pickup／car_hatch／car_minivan；car_paint 照 color 上色）；阻擋＝車長×車寬轉 yaw；waiting＝等紅燈的車'


def check():
    bad = []
    def inside(x, z, b): return b['x0'] <= x <= b['x1'] and b['z0'] <= z <= b['z1']
    pts = [('spawn_bus', L['spawn_bus']), ('spawn_pb_out', L['spawn_pb_out']), ('spawn_am_out', L['spawn_am_out'])] + [(i['id'], i) for i in L['interact']]
    for n, p in pts:
        for b in BLOCKS:
            if inside(p['x'], p['z'], b): bad.append(f'{n} ({p["x"]},{p["z"]}) 在阻擋裡：{b["why"]}')
    for c in CARS:
        for n, p in pts:
            if abs(c['x'] - p['x']) < 2.6 and abs(c['z'] - p['z']) < 2.6: bad.append(f'{n} 旁邊有車 {c}')
    # 小東西之間、小東西和建築／門斗不重疊（導航阻擋的長方形）
    rects = [b for b in BLOCKS if b['why'].startswith('prop ')]
    hard = [b for b in BLOCKS if b['why'].startswith('building') or b['why'].startswith('canopy') or b['why'].startswith('arcade')]
    ov = lambda a, b: a['x0'] < b['x1'] - 0.01 and b['x0'] < a['x1'] - 0.01 and a['z0'] < b['z1'] - 0.01 and b['z0'] < a['z1'] - 0.01
    for i, a in enumerate(rects):
        for b in hard:
            if ov(a, b): bad.append(f"{a['why']} ({a['x0']},{a['z0']})–({a['x1']},{a['z1']}) 壓到 {b['why']}")
        for b in rects[i + 1:]:
            if ov(a, b): bad.append(f"{a['why']} 和 {b['why']} 重疊 ({a['x0']},{a['z0']})")
    for c in CARS:
        for b in rects:
            if b['x0'] - 1.2 < c['x'] < b['x1'] + 1.2 and b['z0'] - 2.6 < c['z'] < b['z1'] + 2.6 and 'corral' in b['why']: bad.append(f"車 {c['x']},{c['z']} 停在推車欄上")
    return bad


if __name__ == '__main__':
    bad = check()
    for b in bad: print('NG', b)
    if '--check' in sys.argv: sys.exit(1 if bad else 0)
    json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('寫入', OUT, '車', len(CARS), '車位', len(STALLS), '阻擋', len(BLOCKS), '樹', len(TREES), '小東西', len(PROPS))
