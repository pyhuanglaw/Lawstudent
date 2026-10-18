"""美國交換：校園（SCN-US-02；區域 us_campus）配置 → assets/models/env/second_ai/us_campus.layout.json。LAWWW2-C 2026-10-18。
第二版（使用者 2026-10-18 01:0x 給法學院、校門照片：「校區門口，其實在法學院的左邊我們可以直接從馬路進去法學院通常不會走校門口，除非我們要去活動中心」）：
  公車（字卡）→ 法學院前的人行道 → 穿過亂石矮牆的走道 → 台階下「進教室」（教室 2D）；校門在法學院西邊（左邊），門口互動「往活動中心」
  （活動中心還沒做：LAWWW-C 接成關著的出口）。第一版（校門在正中間 → 長紅磚步道 → 三棟系館）停用。
遊戲（LAWWW-C：導航格、互動點、出生點）和 Blender（tools/blender/env_second/us_campus.py）讀同一份；建築的阻擋和 us_law_kit 的尺寸一致（us_campus.py 會比對）。
用法：python3 tools/blender/env_second/us_campus_layout_gen.py [--check]
座標：區域座標 x 往東、z 往南、y 往上；單位公尺。建築 yaw：正面法線＝(sin yaw, cos yaw)（0＝朝南、朝街）。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_campus.layout.json')
rng = random.Random(1018)
X0, X1, Z0, Z1 = -110.0, 70.0, -46.0, 40.0
ROAD = {'z0': 22.4, 'z1': 32.0, 'note': '法學院前的馬路（走不到）'}
WALK_S = {'z0': 17.0, 'z1': 22.2, 'note': '馬路邊的人行道（公車站在這裡）'}
CROSS = [{'x0': 50.0, 'x1': 60.0, 'note': '東邊的路口（人行道走到路緣為止）'}, {'x0': -98.0, 'x1': -88.0, 'note': '西邊的路口'}]
RET_Z = 16.6                                       # 亂石矮擋土牆（16.6～17.0）；後面是比人行道高 0.5 m 的草坪（走不上去）
LAWN_H = 0.5
LAW = {'cx': 0.0, 'cz': 4.0, 'yaw': 0.0, 'note': '法學院（us_law_kit.law_school）：塔的正面在 z 4、台階往南到 z 7.12'}
FOOT_V = 0.6 + 6 * 0.42                            # 台階最下面一階的前緣（us_law_kit：vL＋6×TREAD）
FOOT_Z = LAW['cz'] + FOOT_V
FORE = {'x0': -5.8, 'x1': 5.8, 'z0': FOOT_Z, 'z1': 9.8, 'note': '台階前的小廣場（石板）'}
WALK = {'x0': -2.0, 'x1': 2.0, 'z0': 9.8, 'z1': 17.0, 'note': '人行道 → 法學院的走道（穿過亂石矮牆）'}
GATE = {'cx': -66.0, 'cz': 8.6, 'yaw': 0.0, 'open': 7.2, 'width': 20.4, 'note': '校門（us_law_kit.campus_gate）：兩座門樓、中間開口 7.2 m；門後＝往活動中心（區域出口）'}
PLAZA = {'x0': -80.0, 'x1': -52.0, 'z0': 9.8, 'z1': 17.0, 'note': '校門前的紅磚廣場（石灰岩矮花台）'}
BUS = {'x': -24.0, 'z': 19.4, 'w': 4.2, 'd': 1.6, 'note': '公車站：玻璃候車亭、長椅、站牌（只有 BUS 圖示，沒有公司名）；開口朝馬路'}
HALLS = []   # 第二版的兩棟學院哥德式系館（us_campus_kit.gothic_hall）第三版停用：改成照空拍圖的老校區（OLDCAMPUS）
# 第三版（使用者 10-18 03:1x～03:3x：空拍圖「校門口左邊」、校門在圖的右下角；「其他地區照樣子設計、先不要開放進出」）：
# 校門西邊、後面的老校區——全部是背景（在高起來的草坪、校門後面的阻擋範圍裡，走不到），導航、出生點、互動點都不變。
# 空拍圖（文字描述在 HANDOFF.md ★★）：沿街一棟紅瓦大建築（屋頂圍著中庭、中間白色平屋頂＋天窗）；它西北邊一棟有方塔的紅瓦大廳（西側弧形平台）；
# 上方幾棟灰色石材、石板瓦的老建築（其中一棟有圓塔），東邊一個圓形迴車道；右半邊一大片樹林、紅磚小路斜斜穿過。區域範圍小，距離照比例壓縮。
OLDCAMPUS = [
    {'kind': 'tile_hall', 'id': 'oc_tile', 'cx': -117.0, 'cz': 1.0, 'W': 24.0, 'D': 22.0, 'floors': 3, 'yaw': 0.0, 'note': '西邊路口對面、沿街的紅瓦大建築（中庭平屋頂＋天窗、沿街和東側老虎窗）'},
    {'kind': 'tower_hall', 'id': 'oc_tower', 'cx': -119.0, 'cz': -30.0, 'W': 22.0, 'D': 11.0, 'floors': 2, 'yaw': 0.0, 'note': '它北邊：紅瓦山牆大廳＋東北角方塔、西側弧形平台'},
    {'kind': 'castle_hall', 'id': 'oc_castle1', 'cx': -72.5, 'cz': -40.0, 'W': 21.0, 'D': 10.0, 'floors': 3, 'yaw': 0.0, 'turret': 'SE', 'note': '灰色石材、石板瓦；圓塔在東南角（校門往北的紅磚路走到底，右手邊）'},
    {'kind': 'castle_hall', 'id': 'oc_castle2', 'cx': -44.0, 'cz': -41.0, 'W': 18.0, 'D': 9.0, 'floors': 3, 'yaw': 0.0, 'note': '灰色石材、石板瓦'},
    {'kind': 'stone_block', 'id': 'oc_block', 'cx': -116.0, 'cz': -58.0, 'W': 22.0, 'D': 16.0, 'floors': 5, 'yaw': 0.0, 'note': '空拍圖左邊：較高的多層石材建築，旁邊是往北的路（西邊路口那條）'},
]
DRIVE = {'x': -25.0, 'z': -38.0, 'r': 6.0, 'note': '石材老建築東邊的圓形迴車道（背景）'}
WOODS = {'x0': -82.0, 'x1': -34.0, 'z0': -31.0, 'z1': 3.0, 'n': 46, 'clear': [{'x0': -71.5, 'x1': -60.5, 'z0': -46.0, 'z1': 8.0, 'note': '從校門往北看得到老建築和圓塔：中間留一條沒有樹的路'}],
         'note': '校門後面的樹林（紅磚小路穿過）'}
PATHS = [{'w': 2.4, 'pts': [(-66.0, 6.0), (-66.0, -34.0)], 'note': '校門往北'},
         {'w': 1.8, 'pts': [(-66.0, -6.0), (-79.0, -15.0), (-88.0, -24.0)], 'note': '往西北（方塔大廳）'},
         {'w': 1.8, 'pts': [(-66.0, -12.0), (-55.0, -24.0), (-46.0, -35.0)], 'note': '往東北（石材老建築）'},
         {'w': 2.0, 'pts': [(-102.2, -17.0), (-128.0, -17.0)], 'note': '西邊路口對面：兩棟紅瓦建築之間的紅磚步道'},
         {'w': 7.0, 'pts': [(-119.0, -17.0), (-113.0, -17.0)], 'note': '兩棟之間的小廣場（13×7 m）'},
         {'w': 1.8, 'pts': [(-113.0, -17.0), (-108.0, -24.0)], 'note': '小廣場 → 方塔'}]
PLANTERS = [{'x': -66.0, 'z': 14.0, 'w': 5.2, 'd': 1.8, 'round': True, 'note': '開口正前方的長圓花台'},
            {'x': -78.4, 'z': 13.4, 'w': 1.6, 'd': 6.0, 'round': False}, {'x': -53.6, 'z': 13.4, 'w': 1.6, 'd': 6.0, 'round': False}]

L = {'version': 3, 'zone': 'us_campus', 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'road': ROAD, 'walk_s': WALK_S, 'cross_streets': CROSS,
     'retaining_wall_z': RET_Z, 'lawn_h': LAWN_H, 'law': LAW, 'steps_foot_z': round(FOOT_Z, 3), 'forecourt': FORE, 'walk': WALK,
     'gate': GATE, 'plaza': PLAZA, 'planters': PLANTERS, 'bus': BUS, 'halls': HALLS, 'oldcampus': OLDCAMPUS, 'drive': DRIVE, 'woods': WOODS, 'paths': PATHS,
     'spawn_bus': {'x': BUS['x'] + 3.4, 'z': 20.6, 'yaw': math.pi, 'note': '公車到站（字卡）以後站在站牌旁邊、面向法學院（北）'},
     'spawn_class_out': {'x': 0.0, 'z': round(FOOT_Z + 1.3, 3), 'yaw': 0.0, 'note': '下課從法學院出來：台階下、面向馬路（南）'},
     'spawn_gate': {'x': GATE['cx'], 'z': 11.4, 'yaw': 0.0, 'note': '從活動中心回來（之後做活動中心時用）：校門口、面向馬路'},
     'spawn_library_out': {'x': 2.6, 'z': round(FOOT_Z + 1.3, 3), 'yaw': 0.0, 'note': '從法學院圖書館出來（us_lawlib 的出口）：台階下偏東、面向馬路'},
     'interact': [
         {'id': 'class', 'x': 0.0, 'z': round(FOOT_Z + 0.6, 3), 'r': 1.2, 'label': '進教室', 'note': '法學院台階下（教室是 2D：LAWWW-C 接「進教室」→ 2D 課堂 → 下課回到 spawn_class_out）'},
         {'id': 'library', 'x': 2.6, 'z': round(FOOT_Z + 0.6, 3), 'r': 1.0, 'label': '進圖書館', 'note': '法學院圖書館（us_lawlib；SCN-US-LIB）：圖書館在東翼，從同一個大門進去；和「進教室」相距 2.6 m（半徑 1.2＋1.0 不重疊）'},
         {'id': 'bus', 'x': BUS['x'], 'z': 21.0, 'r': 1.4, 'label': '搭公車（回社區）', 'note': '公車站（字卡，回 us_outside 的社區入口）'},
         {'id': 'gate', 'x': GATE['cx'], 'z': 10.6, 'r': 1.8, 'label': '往活動中心', 'note': '校門（活動中心還沒做：LAWWW-C 接成關著的出口，通用提示）'},
     ]}
# ---- 樹：草坪上的大樹（不擋走道看塔）、校門後面的校園、對街的行道樹（在 us_campus.py）
TREES = []
def put_tree(x, z, h):
    TREES.append({'x': round(x, 2), 'z': round(z, 2), 'h': round(h, 1)})
for (x, z) in ((-15.5, 13.4), (-21.0, 9.5), (-30.0, 13.4), (-39.5, 6.0), (-46.0, 13.0), (12.0, 12.6), (21.5, 8.8), (31.0, 13.2), (40.5, 7.5), (46.5, 13.6),
               (-84.5, 2.0), (-84.0, 12.0), (-110.5, 15.2), (-123.0, 15.2)):   # 第三版：西邊路口對面、紅瓦大建築前的草坪加兩棵
    put_tree(x + rng.uniform(-0.8, 0.8), z + rng.uniform(-0.6, 0.6), rng.uniform(13, 17))
# 校門後面的樹林（第三版：照空拍圖的「右半邊一大片樹林」；第二版是 7 棵）：避開中間那條路、紅磚小路
def _onpath(x, z, pad=1.6):
    for p in PATHS:
        for (ax, az), (bx, bz) in zip(p['pts'], p['pts'][1:]):
            dx, dz = bx - ax, bz - az; t = max(0.0, min(1.0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); px, pz = ax + t * dx, az + t * dz
            if math.hypot(x - px, z - pz) < p['w'] / 2 + pad: return True
    return False
_n = 0; _tries = 0
while _n < WOODS['n'] and _tries < 4000:
    _tries += 1; x = rng.uniform(WOODS['x0'], WOODS['x1']); z = rng.uniform(WOODS['z0'], WOODS['z1'])
    if any(c['x0'] < x < c['x1'] and c['z0'] < z < c['z1'] for c in WOODS['clear']) or _onpath(x, z): continue
    if any(math.hypot(x - t['x'], z - t['z']) < 4.2 for t in TREES): continue
    if PLAZA['x0'] - 2 < x < PLAZA['x1'] + 2 and z > GATE['cz'] - 4.0: continue        # 校門廣場、門樓後面留空
    put_tree(x, z, rng.uniform(13, 20)); _n += 1; TREES[-1]['woods'] = 1
    if z < -12.0: TREES[-1]['far'] = 1                                                # far：離校門廣場 20 m 以上，用比較省的樹（葉片卡大、少）；近的照一般的樹（第一版全部省版：校門口看得到樹冠裡深色的芯）
PROPS = []
for x in (-88.0 + 2.0 + k * 17.0 for k in range(9)):                          # 人行道靠草坪那一側的深綠色路燈（照片）
    if abs(x) > 3.0 and not (BUS['x'] - 3 < x < BUS['x'] + 3) and not (PLAZA['x0'] - 1 < x < PLAZA['x1'] + 1): PROPS.append({'type': 'lamp_green', 'x': round(x, 2), 'z': 17.55, 'yaw': 0.0})
for x in (-2.9, 2.9): PROPS.append({'type': 'lamp_green', 'x': x, 'z': 17.55, 'yaw': 0.0})
for x in (-59.0, -73.0): PROPS.append({'type': 'lamp', 'x': x, 'z': 16.2, 'yaw': 0.0})
PROPS.append({'type': 'ped_sign', 'x': 4.2, 'z': 21.7, 'yaw': 0.0})          # 黃色菱形的行人標誌（照片；沒有字）
PROPS.append({'type': 'bikerack', 'x': 8.5, 'z': 17.9, 'yaw': 0.0})
PROPS.append({'type': 'trash', 'x': BUS['x'] - 3.0, 'z': 17.8, 'yaw': 0.0})
PROPS.append({'type': 'trash', 'x': -5.0, 'z': 9.2, 'yaw': 0.0})
for x in (-5.0, 5.0): PROPS.append({'type': 'barrel', 'x': x, 'z': round(FOOT_Z + 0.65, 3), 'yaw': 0.0})   # 台階兩側的木桶花盆（照片）
for (x, z, yaw) in ((-60.5, 16.0, math.pi), (-71.5, 16.0, math.pi)): PROPS.append({'type': 'bench', 'x': x, 'z': z, 'yaw': yaw})
L['trees'], L['props'] = TREES, PROPS

# ---- 導航阻擋
BLOCKS = []
def B_(x0, x1, z0, z1, why): BLOCKS.append({'x0': round(min(x0, x1), 3), 'x1': round(max(x0, x1), 3), 'z0': round(min(z0, z1), 3), 'z1': round(max(z0, z1), 3), 'why': why})
lx, lz = LAW['cx'], LAW['cz']
B_(lx - 6.2, lx + 6.2, lz - 14.2, lz + 0.1, 'building law tower（遊戲的鏡頭碰撞：why 以 building 開頭）')
B_(lx - 4.5, lx + 4.5, lz, lz + FOOT_V - 0.35, 'law steps（台階＋兩側矮牆，上半；門口互動點在台階下）')
B_(lx + 6.0, lx + 44.2, lz - 14.2, lz - 1.8, 'building law east wing')
B_(lx - 36.2, lx - 6.0, lz - 14.2, lz - 4.8, 'building law west wing')
# 高起來的草坪（亂石矮牆後面）：走道、台階前的小廣場、校門廣場之外全部
B_(FORE['x1'], CROSS[0]['x0'] - 0.2, Z0, RET_Z + 0.4, 'raised lawn east（亂石矮牆）')
B_(WALK['x1'], FORE['x1'], FORE['z1'], RET_Z + 0.4, 'raised lawn beside walk E')
B_(4.4, FORE['x1'], Z0, FOOT_Z + 0.3, 'raised lawn beside steps E（前緣一道矮牆 0.3 m）')
B_(PLAZA['x1'], FORE['x0'], Z0, RET_Z + 0.4, 'raised lawn west（亂石矮牆）')
B_(FORE['x0'], WALK['x0'], FORE['z1'], RET_Z + 0.4, 'raised lawn beside walk W')
B_(FORE['x0'], -4.4, Z0, FOOT_Z + 0.3, 'raised lawn beside steps W（前緣一道矮牆 0.3 m）')
B_(CROSS[1]['x1'] + 0.2, PLAZA['x0'], Z0, RET_Z + 0.4, 'raised lawn west of plaza')
B_(-4.5, 4.5, Z0, lz - 14.0, 'behind law school')
# 校門：門樓、側門＋外側石柱（us_law_kit.campus_gate 的 blocks_local）、門後（區域出口）
gx, gz = GATE['cx'], GATE['cz']
for s in (-1, 1):
    B_(gx + s * 3.6 - s * 0.15, gx + s * 5.8 + s * 0.15, gz - 1.25, gz + 1.25, 'building gate tower')
    B_(gx + s * 5.8, gx + s * 10.35, gz - 0.8, gz + 0.8, 'gate side arch + pier')
B_(PLAZA['x0'], PLAZA['x1'], Z0, gz - 1.0, 'behind the gate（往活動中心：區域出口，互動點在門口）')
for p in PLANTERS: B_(p['x'] - p['w'] / 2 - 0.1, p['x'] + p['w'] / 2 + 0.1, p['z'] - p['d'] / 2 - 0.1, p['z'] + p['d'] / 2 + 0.1, 'planter')
# 馬路、路口
B_(X0, X1, ROAD['z0'], Z1, 'road')
for c in CROSS: B_(c['x0'], c['x1'], Z0, Z1, 'cross street')
B_(X0, CROSS[1]['x0'], Z0, Z1, 'beyond west cross street'); B_(CROSS[0]['x1'], X1, Z0, Z1, 'beyond east cross street')
B_(BUS['x'] - BUS['w'] / 2, BUS['x'] + BUS['w'] / 2, BUS['z'] - BUS['d'] / 2 - 0.1, BUS['z'] - 0.1, 'bus shelter（背牆＋長椅：開口朝馬路＝南）')
for p in PROPS:
    hs = {'lamp': (0.3, 0.3), 'lamp_green': (0.3, 0.3), 'bench': (0.9, 0.4), 'bikerack': (1.4, 0.5), 'trash': (0.35, 0.35), 'ped_sign': (0.15, 0.15), 'barrel': (0.4, 0.4)}[p['type']]
    hx, hz = (hs[1], hs[0]) if abs(math.sin(p['yaw'])) > 0.5 else hs
    B_(p['x'] - hx, p['x'] + hx, p['z'] - hz, p['z'] + hz, p['type'])
L['blocks'] = BLOCKS


def check(L):
    bad = []
    pts = [('spawn_bus', L['spawn_bus']), ('spawn_class_out', L['spawn_class_out']), ('spawn_gate', L['spawn_gate']), ('spawn_library_out', L['spawn_library_out'])] + [('it ' + i['label'], i) for i in L['interact']]
    for nm, p in pts:
        for r in L['blocks']:
            if r['x0'] - 0.35 < p['x'] < r['x1'] + 0.35 and r['z0'] - 0.35 < p['z'] < r['z1'] + 0.35: bad.append((nm, r['why']))
    # 走得到：0.5 m 格子從公車站出發 BFS，所有出生點、互動點都要到得了
    def free(x, z):
        if not (X0 < x < X1 and Z0 < z < Z1): return False
        return not any(r['x0'] - 0.3 < x < r['x1'] + 0.3 and r['z0'] - 0.3 < z < r['z1'] + 0.3 for r in L['blocks'])
    q = 0.5; start = (round(L['spawn_bus']['x'] / q), round(L['spawn_bus']['z'] / q)); seen = {start}; st = [start]
    while st:
        i, j = st.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (i + di, j + dj)
            if n not in seen and free(n[0] * q, n[1] * q): seen.add(n); st.append(n)
    for nm, p in pts:
        if (round(p['x'] / q), round(p['z'] / q)) not in seen: bad.append((nm, 'unreachable from spawn_bus'))
    return bad, len(seen)


if __name__ == '__main__':
    bad, n = check(L)
    print('trees', len(TREES), 'props', len(PROPS), 'blocks', len(BLOCKS), 'foot_z', round(FOOT_Z, 2), 'reachable cells', n, 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
