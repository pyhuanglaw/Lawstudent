"""美國交換：校門前的主街（SCN-US-02 第一階段：主街一段＋路口；校門與校園那一側等使用者照片）→ assets/models/env/second_ai/us_street.layout.json。
LAWWW2-C 2026-10-17。遊戲（LAWWW）和 Blender（tools/blender/env_second/us_street.py）讀同一份。
用法：python3 tools/blender/env_second/us_street_layout_gen.py [--check]

依據：AA_30「校園一小段（石灰岩建築、校門、主街）」；地點布魯明頓（AA_144 5-4）。研究筆記：docs/art-rebuild/second_ai/research/us_campus_street.md
  （主街＝Kirkwood Avenue：八個街區連到校門 Sample Gates；兩三層的磚造商業樓（一樓大櫥窗、招牌、有的磚漆成白色、上面石材飾角）、民宅改的店面；餐廳、咖啡、小店、酒吧）。
D77：街名照真的（E Kirkwood Ave、N Indiana Ave），**店名全部虛構**、不畫商標；校名、校徽不出現。
遊戲版：區域座標 x 往東（往校門）、z 往南、y 往上；主街沿 x（z −6～6 車道＋路邊停車），兩側紅磚人行道（4 m），建築正面在 z＝∓10；
  x 0～12 是南北向的 Indiana Ave 路口（斑馬線、紅綠燈），路口東邊（x 12 以後）是校門前的紅磚廣場——**校門本體等照片**，這一版只留位置、不放假的校門。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_street.layout.json')
rng = random.Random(4740)
X0, X1, Z0, Z1 = -72.0, 30.0, -28.0, 28.0
ROAD = {'z0': -6.0, 'z1': 6.0, 'park_w': 2.4, 'note': '兩線車道（中間黃色雙線）＋兩側路邊停車'}
WALK = 4.0; FRONT = ROAD['z1'] + WALK          # 建築正面離中心線 10 m
CROSS = {'x0': 0.0, 'x1': 12.0, 'note': 'N Indiana Ave（南北向）'}
NAMES = [('LIMESTONE COFFEE', 'cafe'), ('GATEWAY BOOKS', 'books'), ('CRESCENT PIZZA', 'pizza'), ('KIRK STREET RECORDS', 'records'), ('RED DOOR DINER', 'diner'),
         ('BLOOM TEA HOUSE', 'tea'), ('OLD OAK HARDWARE', 'hardware'), ('MAPLE BAKERY', 'bakery'), ('THE STUDY HALL', 'bar'), ('CAMPUS COPY & PRINT', 'print'),
         ('FIVE SPICE NOODLES', 'noodle'), ('PRAIRIE BIKES', 'bike'), ('SECOND CHAPTER THRIFT', 'thrift'), ('LANTERN SUSHI', 'sushi')]
STYLES = ['brick_red', 'brick_red', 'brick_buff', 'brick_brown', 'painted', 'house']
BLDGS = []
k_name = 0
for side, sgn in (('N', -1), ('S', 1)):
    x = X0 + 2.0
    while x < CROSS['x0'] - 3.0:
        style = rng.choice(STYLES)
        w = rng.uniform(9.0, 12.0) if style == 'house' else rng.choice([6.5, 7.5, 8.0, 9.0, 10.5, 12.0])
        if x + w > CROSS['x0'] - 1.5: w = CROSS['x0'] - 1.5 - x
        if w < 5.0: break
        name, kind = NAMES[k_name % len(NAMES)]; k_name += 1
        BLDGS.append({'side': side, 'x0': round(x, 2), 'x1': round(x + w, 2), 'front': sgn * FRONT, 'depth': 14.0 if style != 'house' else 11.0,
                      'floors': (2 if style == 'house' else rng.choice([2, 2, 3, 3, 3])), 'style': style, 'shop': name, 'kind': kind,
                      'awning': rng.choice(['#2f5a3e', '#7a1f24', '#1f2f4f', '#c88a2a', None, '#3a3c3e']) if style != 'house' else None,
                      'setback': (3.5 if style == 'house' else 0.0)})
        x += w + (rng.uniform(0.0, 0.6) if style != 'house' else 1.5)
L = {'version': 1, 'zone': 'us_street', 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'road': ROAD, 'walk_w': WALK, 'front': FRONT, 'cross': CROSS,
     'buildings': BLDGS, 'gates_plaza': {'x0': 12.0, 'x1': X1, 'z0': -10.0, 'z1': 10.0, 'note': '校門前的紅磚廣場；Sample Gates 本體等使用者照片（D38：不放假的校門）'}}
PROPS = []
def prop(t, x, z, yaw=0.0, **kw): PROPS.append(dict({'type': t, 'x': round(x, 2), 'z': round(z, 2), 'yaw': round(yaw, 4)}, **kw))
for sgn in (-1, 1):
    zc = sgn * (ROAD['z1'] + 1.2)
    for x in range(int(X0) + 6, int(CROSS['x0']) - 2, 10): prop('tree', x, zc, h=round(rng.uniform(8, 11), 1))
    for x in range(int(X0) + 11, int(CROSS['x0']) - 2, 15): prop('lamp', x, sgn * (ROAD['z1'] + 0.5))
    for x in range(int(X0) + 3, int(CROSS['x0']) - 2, 7): prop('meter', x + rng.uniform(-0.3, 0.3), sgn * (ROAD['z1'] + 0.35))
    for x in (-58.0, -31.0, -9.0): prop('bikerack', x + (2.0 if sgn > 0 else 0.0), sgn * (ROAD['z1'] + 2.6), 0.0)
    for x in (-47.0, -20.0): prop('bench', x, sgn * (ROAD['z1'] + 3.2), 0.0 if sgn < 0 else math.pi)
    for x in (-52.0, -26.0, -4.0): prop('trash', x, sgn * (ROAD['z1'] + 0.9))
prop('hydrant', -36.5, ROAD['z1'] + 0.6); prop('hydrant', -14.5, -(ROAD['z1'] + 0.6))
for (x, z) in ((-1.0, -7.0), (13.0, 7.0)): prop('traffic_light', x, z, 0.0)
for (x, z, t) in ((-1.0, 7.4, 'E Kirkwood Ave'), (13.0, -7.4, 'N Indiana Ave')): prop('street_sign', x, z, 0.0, text=t)
L['props'] = PROPS
CARS = []
for sgn in (-1, 1):
    zc = sgn * (ROAD['z1'] - ROAD['park_w'] / 2)
    x = X0 + 4.0
    while x < CROSS['x0'] - 6.0:
        if rng.random() < 0.7: CARS.append({'x': round(x + 3.0, 2), 'z': round(zc, 2), 'yaw': round(math.pi / 2 if sgn > 0 else -math.pi / 2, 4), 'kind': rng.choice(['car_sedan', 'car_suv', 'car_hatch', 'car_sedan', 'car_pickup', 'car_minivan']),
                                     'color': rng.choice(['#f2f2ef', '#c9ccd0', '#8d9196', '#2b2d30', '#1f2f4f', '#7a1f24', '#3d4a3c', '#b8b2a5'])})
        x += 6.5
L['cars'] = CARS
L['spawn'] = {'x': -30.0, 'z': 8.2, 'yaw': math.pi / 2, 'note': '南側人行道、面向東（往校門）'}
L['exits'] = [{'id': 'west', 'x': X0 + 1.5, 'z': 8.0, 'r': 1.6, 'label': '往市中心', 'to': None}, {'id': 'campus', 'x': X1 - 2.0, 'z': 0.0, 'r': 2.0, 'label': '進校園', 'to': None}]
L['interact'] = [{'id': 'shop_' + b['kind'], 'x': round((b['x0'] + b['x1']) / 2, 2), 'z': round(b['front'] - (1 if b['front'] > 0 else -1) * (1.0 + b['setback']), 2), 'r': 1.2, 'label': b['shop']}
                 for b in BLDGS if b['kind'] in ('cafe', 'books', 'pizza', 'tea', 'bakery', 'noodle')]


def blocks(L):
    B = []
    def r(x0, x1, z0, z1, why): B.append({'x0': round(x0, 3), 'x1': round(x1, 3), 'z0': round(z0, 3), 'z1': round(z1, 3), 'why': why})
    for b in L['buildings']:
        f = b['front']; sg = 1 if f > 0 else -1
        fr = f + sg * b['setback']
        r(b['x0'], b['x1'], min(fr, fr + sg * b['depth']), max(fr, fr + sg * b['depth']), 'building ' + b['shop'])
        if b['style'] == 'house':
            r(b['x0'] + 1.0, b['x1'] - 1.0, min(f + sg * 0.2, f + sg * b['setback']), max(f + sg * 0.2, f + sg * b['setback']), 'porch + yard ' + b['shop'])
    for c in L['cars']: r(c['x'] - 2.4, c['x'] + 2.4, c['z'] - 0.95, c['z'] + 0.95, 'parked car')
    for p in L['props']:
        hs = {'tree': 0.5, 'lamp': 0.2, 'meter': 0.1, 'trash': 0.3, 'hydrant': 0.2, 'traffic_light': 0.25, 'street_sign': 0.1}.get(p['type'])
        if hs: r(p['x'] - hs, p['x'] + hs, p['z'] - hs, p['z'] + hs, p['type'])
        elif p['type'] == 'bikerack': r(p['x'] - 1.6, p['x'] + 1.6, p['z'] - 0.3, p['z'] + 0.3, 'bikerack')
        elif p['type'] == 'bench': r(p['x'] - 0.95, p['x'] + 0.95, p['z'] - 0.35, p['z'] + 0.35, 'bench')
    r(X0, X1, Z0, Z0 + 0.5, 'north edge'); r(X0, X1, Z1 - 0.5, Z1, 'south edge')
    return B


L['blocks'] = blocks(L)


def check(L):
    bad = []
    for k in ['spawn'] + ['exits']:
        pts = L[k] if isinstance(L[k], list) else [L[k]]
        for p in pts:
            for b in L['blocks']:
                if b['x0'] < p['x'] < b['x1'] and b['z0'] < p['z'] < b['z1']: bad.append((k, b['why']))
    for it in L['interact']:
        for b in L['blocks']:
            if b['x0'] < it['x'] < b['x1'] and b['z0'] < it['z'] < b['z1']: bad.append(('interact ' + it['id'], b['why']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('buildings', len(BLDGS), 'cars', len(CARS), 'props', len(PROPS), 'blocks', len(L['blocks']), 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
