"""美國交換：校園（SCN-US-02 第二階段；區域 us_campus）配置 → assets/models/env/second_ai/us_campus.layout.json。LAWWW2-C 2026-10-18。
範圍（LAWWW-C 2026-10-18 00:20，D99 最小範圍）：社區 → 公車（字卡）→ **校門 → 校園裡的紅磚步道 → 上課系館的門口**，門口互動「進教室」（教室 2D，不做 3D 室內）；不接主街。
遊戲（LAWWW-C：導航格、互動點、出生點）和 Blender（tools/blender/env_second/us_campus.py）讀同一份。
用法：python3 tools/blender/env_second/us_campus_layout_gen.py [--check]
沒有照片：學院哥德式石灰岩系館（tools/blender/env_second/us_campus_kit.py）＋一般的石柱校門，不像任何真的建築（PROPOSAL；D77 不放校名、校徽）。
座標：區域座標 x 往東、z 往南、y 往上；單位公尺。建築 yaw：正面法線＝(sin yaw, cos yaw)（0＝朝南）。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_campus.layout.json')
rng = random.Random(1018)
X0, X1, Z0, Z1 = -46.0, 46.0, -42.0, 34.0
ROAD = {'z0': 22.4, 'z1': 32.0, 'note': '校門前的馬路（走不到）'}
WALK_S = {'z0': 17.0, 'z1': 22.2, 'note': '馬路邊的人行道（公車站在這裡）'}
FENCE_Z = 16.0                                    # 校園的矮石牆＋鐵欄杆（校門在 x 0）
GATE = {'x': 0.0, 'z': FENCE_Z, 'open': 6.0, 'pier': 1.4, 'pier_h': 5.2, 'side_pier': 1.0, 'side_h': 3.0, 'side_x': 7.2,
        'note': '一般的石灰岩校門：中間兩根大石柱（頂上一盞鐵燈）夾 6 m 的開口、外側兩根小石柱接矮石牆＋鐵欄杆；不照真的校門'}
BUS = {'x': -13.0, 'z': 19.6, 'w': 4.2, 'd': 1.6, 'note': '公車站：玻璃候車亭、長椅、站牌（只寫 BUS 和路線號碼，沒有公司名）'}
HALLS = [
    {'id': 'main', 'cx': 0.0, 'cz': -29.0, 'len': 40.0, 'dep': 14.0, 'yaw': 0.0, 'floors': 3, 'tower': True, 'note': '上課的系館（正面朝南、正中間的塔＝入口）'},
    {'id': 'west', 'cx': -31.0, 'cz': -3.0, 'len': 30.0, 'dep': 13.0, 'yaw': math.pi / 2, 'floors': 3, 'tower': False, 'note': '西邊的系館（正面朝東）'},
    {'id': 'east', 'cx': 31.0, 'cz': -3.0, 'len': 30.0, 'dep': 13.0, 'yaw': -math.pi / 2, 'floors': 3, 'tower': False, 'note': '東邊的系館（正面朝西）'},
]
TOWER_D = 1.6                                     # 塔凸出正面多少（us_campus_kit.gothic_hall：tv1＝vF＋1.6）
STEPS_D = 1.05                                    # 塔前的三階台階


def W_(h, u, v):
    """建築局部 (u 沿正面、v 往正面外) → 區域 (x, z)（和 us_community 同一個換算）"""
    c, s_ = math.cos(h['yaw']), math.sin(h['yaw'])
    return (h['cx'] + u * c + v * s_, h['cz'] - u * s_ + v * c)


def rect_w(h, u0, u1, v0, v1, why):
    pts = [W_(h, u, v) for u in (u0, u1) for v in (v0, v1)]
    return {'x0': round(min(p[0] for p in pts), 3), 'x1': round(max(p[0] for p in pts), 3), 'z0': round(min(p[1] for p in pts), 3), 'z1': round(max(p[1] for p in pts), 3), 'why': why}


main = HALLS[0]
door_z = main['cz'] + main['dep'] / 2 + TOWER_D + STEPS_D + 0.6       # 台階前面
PATHS = [
    {'x0': -1.9, 'x1': 1.9, 'z0': main['cz'] + main['dep'] / 2 + TOWER_D, 'z1': FENCE_Z + 0.4, 'note': '校門 → 系館的紅磚步道（4 m 寬）'},
    {'x0': -31.0 + 6.5, 'x1': 31.0 - 6.5, 'z0': -4.6, 'z1': -1.4, 'note': '東西向的紅磚步道（兩邊系館的門口）'},
    {'x0': -8.0, 'x1': 8.0, 'z0': door_z - 3.0, 'z1': main['cz'] + main['dep'] / 2 + TOWER_D, 'note': '系館門口的小廣場'},
]
L = {'version': 1, 'zone': 'us_campus', 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'road': ROAD, 'walk_s': WALK_S, 'fence_z': FENCE_Z,
     'gate': GATE, 'bus': BUS, 'halls': HALLS, 'paths': PATHS,
     'spawn_bus': {'x': BUS['x'] + 3.4, 'z': 20.8, 'yaw': math.pi, 'note': '公車到站（字卡）以後站在站牌旁邊、面向校門那一側（北）'},
     'spawn_class_out': {'x': 0.0, 'z': round(door_z + 1.2, 3), 'yaw': 0.0, 'note': '下課從系館出來：台階前、面向校門（南）'},
     'interact': [
         {'id': 'class', 'x': 0.0, 'z': round(door_z, 3), 'r': 1.4, 'label': '進教室', 'note': '上課系館的門口（教室是 2D：LAWWW-C 接「進教室」→ 2D 課堂 → 下課回到 spawn_class_out）'},
         {'id': 'bus', 'x': BUS['x'], 'z': 21.0, 'r': 1.4, 'label': '搭公車（回社區）', 'note': '公車站（字卡，回 us_outside 的社區入口）'},
         {'id': 'gate', 'x': 0.0, 'z': FENCE_Z + 2.4, 'r': 1.6, 'label': '校門', 'note': '看（說明文字由 AA 寫）'},
     ]}
# 樹：步道兩旁的大樹（每 9 m）、草坪上散的大樹；長椅、路燈
TREES, PROPS = [], []
for z in range(10, -16, -9):
    for sx in (-1, 1): TREES.append({'x': sx * rng.uniform(5.5, 6.5), 'z': z + rng.uniform(-1, 1), 'h': round(rng.uniform(13, 17), 1), 'kind': 'big'})
for k in range(16):
    for _ in range(40):
        x, z = rng.uniform(-22, 22), rng.uniform(-14, 12)
        if abs(x) > 8 and not (-6.0 < z < 0.0) and all(math.hypot(x - t['x'], z - t['z']) > 7 for t in TREES): break
    TREES.append({'x': round(x, 2), 'z': round(z, 2), 'h': round(rng.uniform(12, 18), 1), 'kind': 'big'})
for z in (12.0, 3.0, -9.0):
    for sx in (-1, 1): PROPS.append({'type': 'bench', 'x': sx * 2.7, 'z': z, 'yaw': -sx * math.pi / 2})
for z in (13.5, 4.5, -4.5, -13.5):
    for sx in (-1, 1): PROPS.append({'type': 'lamp', 'x': sx * 2.4, 'z': z, 'yaw': 0.0})
for x in (-16.0, -9.0, 9.0, 16.0): PROPS.append({'type': 'lamp', 'x': x, 'z': -5.0, 'yaw': 0.0})
PROPS.append({'type': 'bikerack', 'x': 6.5, 'z': door_z - 1.5, 'yaw': 0.0})
PROPS.append({'type': 'trash', 'x': -3.2, 'z': door_z - 0.5, 'yaw': 0.0})
L['trees'], L['props'] = TREES, PROPS
# 導航阻擋
BLOCKS = []
for h in HALLS:
    BLOCKS.append(rect_w(h, -h['len'] / 2 - 0.6, h['len'] / 2 + 0.6, -h['dep'] / 2 - 0.6, h['dep'] / 2 + 0.6, 'building ' + h['id']))   # 含扶壁
    if h['tower']:
        BLOCKS.append(rect_w(h, -3.6, 3.6, h['dep'] / 2, h['dep'] / 2 + TOWER_D, 'tower ' + h['id']))
        BLOCKS.append(rect_w(h, -1.8, 1.8, h['dep'] / 2 + TOWER_D, h['dep'] / 2 + TOWER_D + STEPS_D - 0.35, 'steps ' + h['id'] + '（台階上半：門口互動點在台階前）'))
BLOCKS.append({'x0': X0, 'x1': X1, 'z0': ROAD['z0'], 'z1': Z1, 'why': 'road'})
g = GATE
for sx in (-1, 1):
    BLOCKS.append({'x0': round(sx * (g['open'] / 2 + g['pier'] / 2) - g['pier'] / 2, 3), 'x1': round(sx * (g['open'] / 2 + g['pier'] / 2) + g['pier'] / 2, 3), 'z0': FENCE_Z - g['pier'] / 2, 'z1': FENCE_Z + g['pier'] / 2, 'why': 'gate pier'})
    xa, xb = sorted((sx * (g['open'] / 2 + g['pier']), sx * X1))
    BLOCKS.append({'x0': round(xa, 3), 'x1': round(xb, 3), 'z0': FENCE_Z - 0.3, 'z1': FENCE_Z + 0.3, 'why': 'fence'})
BLOCKS.append({'x0': BUS['x'] - BUS['w'] / 2, 'x1': BUS['x'] + BUS['w'] / 2, 'z0': BUS['z'] - BUS['d'] / 2 - 0.1, 'z1': BUS['z'] - 0.1, 'why': 'bus shelter（背牆＋長椅：候車亭開口朝馬路＝南）'})
for p in PROPS:
    hs = {'lamp': (0.3, 0.3), 'bench': (0.9, 0.4), 'bikerack': (1.4, 0.5), 'trash': (0.35, 0.35)}[p['type']]
    hx, hz = (hs[1], hs[0]) if abs(math.sin(p['yaw'])) > 0.5 else hs
    BLOCKS.append({'x0': round(p['x'] - hx, 3), 'x1': round(p['x'] + hx, 3), 'z0': round(p['z'] - hz, 3), 'z1': round(p['z'] + hz, 3), 'why': p['type']})
for t in TREES: BLOCKS.append({'x0': round(t['x'] - 0.5, 3), 'x1': round(t['x'] + 0.5, 3), 'z0': round(t['z'] - 0.5, 3), 'z1': round(t['z'] + 0.5, 3), 'why': 'tree'})
L['blocks'] = BLOCKS


def check(L):
    bad = []
    pts = [('spawn_bus', L['spawn_bus']), ('spawn_class_out', L['spawn_class_out'])] + [('it ' + i['label'], i) for i in L['interact']]
    for nm, p in pts:
        for r in L['blocks']:
            if r['x0'] - 0.35 < p['x'] < r['x1'] + 0.35 and r['z0'] - 0.35 < p['z'] < r['z1'] + 0.35: bad.append((nm, r['why']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('halls', len(HALLS), 'trees', len(TREES), 'props', len(PROPS), 'blocks', len(BLOCKS), 'door_z', round(door_z, 2), 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
