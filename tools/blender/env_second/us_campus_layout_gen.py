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
HALLS = [   # 校門後面的老系館（背景，走不到）：us_campus_kit.gothic_hall（陡屋頂、尖拱窗的學院哥德式）
    {'id': 'old_n', 'cx': -66.0, 'cz': -31.0, 'len': 30.0, 'dep': 13.0, 'yaw': 0.0, 'floors': 3, 'tower': True, 'note': '從校門的開口看得到的塔'},
    {'id': 'old_w', 'cx': -84.0, 'cz': -12.0, 'len': 24.0, 'dep': 12.0, 'yaw': math.pi / 2, 'floors': 3, 'tower': False, 'note': '校門西北邊'},
]
PLANTERS = [{'x': -66.0, 'z': 14.0, 'w': 5.2, 'd': 1.8, 'round': True, 'note': '開口正前方的長圓花台'},
            {'x': -78.4, 'z': 13.4, 'w': 1.6, 'd': 6.0, 'round': False}, {'x': -53.6, 'z': 13.4, 'w': 1.6, 'd': 6.0, 'round': False}]

L = {'version': 2, 'zone': 'us_campus', 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'road': ROAD, 'walk_s': WALK_S, 'cross_streets': CROSS,
     'retaining_wall_z': RET_Z, 'lawn_h': LAWN_H, 'law': LAW, 'steps_foot_z': round(FOOT_Z, 3), 'forecourt': FORE, 'walk': WALK,
     'gate': GATE, 'plaza': PLAZA, 'planters': PLANTERS, 'bus': BUS, 'halls': HALLS,
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
               (-84.0, 12.0), (-84.5, 2.0)):
    put_tree(x + rng.uniform(-0.8, 0.8), z + rng.uniform(-0.6, 0.6), rng.uniform(13, 17))
for (x, z) in ((-75.0, 1.0), (-57.0, 0.5), (-76.0, -10.0), (-55.0, -12.0), (-48.0, -2.0), (-60.0, -20.0), (-73.0, -20.5)):
    put_tree(x + rng.uniform(-1, 1), z + rng.uniform(-1, 1), rng.uniform(14, 19))
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
