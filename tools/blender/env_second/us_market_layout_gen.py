"""美國交換：大型超市「Prairie Basket」（草原超市；AA_144 5-4，虛構，D77）的室內（SCN-US-03；區域 us_market）配置 → assets/models/env/second_ai/us_market.layout.json。
LAWWW2-C 2026-10-17。遊戲（LAWWW：導航格、出生點、互動點）和 Blender（tools/blender/env_second/us_market.py）讀同一份。
用法：python3 tools/blender/env_second/us_market_layout_gen.py [--check]

首次出現：抵達那天（US1：巴士站 → 超市 → 公寓，AA_144）。美國中西部大學城的大型超市（一層樓的大賣場）：
  正面整面玻璃、兩組自動門（右進左出）、門口推車區；前段是結帳道（有人收銀＋自助結帳）、服務台；右邊蔬果區（斜面陳列台、靠牆的冷藏噴霧櫃）；
  中間八條貨架走道（雙面貨架、走道上方吊著號碼牌）；後牆乳製品冷藏櫃（玻璃門）、肉品開放冷藏櫃；左後角麵包熟食櫃台；左邊冷凍櫃（玻璃門）。
  天花板是外露的鋼構桁架（白色）、圓形風管、一排一排的長條 LED 燈。不放真實品牌、商品名稱（貨架上的商品是程式產生的假包裝，D77）。
遊戲版：區域座標 x 往東、z 往南、y 往上；原點＝賣場中心；正面（入口）在南邊 z＝+16。
座位 yaw：人物面向 (sin yaw, cos yaw)。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_market.layout.json')
rng = random.Random(1018)
X0, X1, Z0, Z1, H = -22.0, 22.0, -16.0, 16.0, 6.4

L = {'version': 1, 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'h': H, 'name_en': 'Prairie Basket', 'name_zh': '草原超市'}
# 正面：玻璃帷幕（x −20～20、高 0～3.8），兩組雙開自動門；門外是停車場（遊戲畫的背景／之後的戶外區域）
L['storefront'] = {'z': Z1, 'x0': -20.0, 'x1': 20.0, 'glass_h': 3.8}
L['doors'] = [{'id': 'in', 'x': 13.5, 'w': 2.4, 'label': 'IN'}, {'id': 'out', 'x': -13.5, 'w': 2.4, 'label': 'OUT'}]
L['spawn'] = {'x': 13.5, 'z': 13.6, 'yaw': math.pi, 'note': '從入口自動門進來（面向北）'}
L['exit'] = {'x': -13.5, 'z': 14.9, 'r': 1.2, 'label': '離開超市', 'to': 'us_outside'}
# 前段（z 8～15）
CHECK = []
for k in range(5):                                   # 有人收銀的結帳道：輸送帶櫃台沿 z（客人從北往南走出去）
    x = -9.0 + k * 3.0
    CHECK.append({'kind': 'lane', 'x': round(x, 2), 'z0': 7.8, 'z1': 11.6, 'n': k + 1})
SELF = [{'x': 7.2 + (k % 3) * 1.5, 'z': 8.6 + (k // 3) * 2.4, 'yaw': 0.0 if k // 3 == 0 else math.pi} for k in range(6)]   # 自助結帳機（兩排、背對背）
L['checkouts'], L['self_checkout'] = CHECK, SELF
L['service_desk'] = {'x0': -21.4, 'x1': -15.6, 'z0': 8.6, 'z1': 10.2, 'note': '服務台（退換貨、彩券、郵票）；後面的牆是香菸櫃（門關著、不畫品牌）'}
L['carts'] = {'x0': 16.0, 'x1': 20.6, 'z0': 13.2, 'z1': 15.4, 'n': 14, 'note': '推車排在入口內側（一排一排套在一起）'}
L['seasonal'] = [{'x': 15.0, 'z': 10.0, 'w': 2.4, 'd': 1.2, 'kind': 'flowers'}, {'x': 4.0, 'z': 13.4, 'w': 3.0, 'd': 1.0, 'kind': 'water_pallet'}]
# 蔬果區（右邊 x 11～21、z −9～6）：斜面陳列台＋靠牆冷藏噴霧櫃
L['produce_tables'] = [{'x': 13.2 + (k % 2) * 4.2, 'z': -6.0 + (k // 2) * 4.4, 'w': 3.0, 'd': 1.5, 'mix': rng.choice(['apple', 'orange', 'banana', 'pepper', 'potato', 'onion', 'melon', 'lemon'])} for k in range(6)]
L['produce_wall'] = {'x': X1 - 0.55, 'z0': -10.5, 'z1': 6.5, 'd': 1.1, 'note': '冷藏蔬菜（噴霧）：生菜、花椰菜、紅蘿蔔、香草'}
# 中間八條雙面貨架（沿 z）
GON = []
for k in range(8):
    x = -12.4 + k * 2.9
    GON.append({'x': round(x, 2), 'z0': -9.0, 'z1': 5.4, 'd': 1.2, 'h': 1.95, 'aisle': k + 1,
                'cat': ['cereal', 'snacks', 'drinks', 'canned', 'pasta', 'baking', 'household', 'personal'][k]})
L['gondolas'] = GON
L['aisle_signs'] = [{'aisle': k + 1, 'x': round(-12.4 + k * 2.9 + 1.45, 2), 'z': -1.8, 'y': 3.6} for k in range(8)]   # 走道上方的號碼牌（號碼、類別字由遊戲畫：PLATE_FACE_aisle_<n>）
# 後牆（z −16）：乳製品玻璃門冷藏櫃、肉品開放櫃；左後角麵包熟食櫃台
L['dairy_wall'] = {'x0': -4.0, 'x1': 16.0, 'z': Z0 + 0.6, 'd': 1.2, 'doors': 16}
L['meat_case'] = {'x0': -13.5, 'x1': -5.0, 'z': Z0 + 0.7, 'd': 1.3}
L['deli'] = {'x0': -21.4, 'x1': -14.6, 'z0': -15.4, 'z1': -11.0, 'counter_z': -11.6, 'note': '熟食＋麵包：玻璃展示櫃台、後面烤箱與層架、上面吊牌'}
# 左邊（x −21～−16、z −9～6）：冷凍玻璃門櫃（靠牆一排＋中島一排背對背）
L['freezers'] = [{'x': X0 + 0.6, 'z0': -9.5, 'z1': 6.0, 'face': 1, 'doors': 13}, {'x': -16.6, 'z0': -8.0, 'z1': 4.5, 'face': -1, 'doors': 11}, {'x': -15.4, 'z0': -8.0, 'z1': 4.5, 'face': 1, 'doors': 11}]
L['wall_signs'] = [{'text': 'PRODUCE', 'x': X1 - 0.05, 'z': -2.0, 'y': 4.3, 'face': 'W'}, {'text': 'DAIRY', 'x': 6.0, 'z': Z0 + 0.05, 'y': 4.3, 'face': 'S'},
                   {'text': 'MEAT', 'x': -9.2, 'z': Z0 + 0.05, 'y': 4.3, 'face': 'S'}, {'text': 'BAKERY · DELI', 'x': -18.0, 'z': Z0 + 0.05, 'y': 4.3, 'face': 'S'},
                   {'text': 'FROZEN', 'x': X0 + 0.05, 'z': -2.0, 'y': 4.3, 'face': 'E'}]
L['interact'] = [{'id': 'service', 'x': -18.5, 'z': 10.9, 'r': 1.2, 'label': '服務台'},
                 {'id': 'checkout', 'x': -4.5, 'z': 12.4, 'r': 1.4, 'label': '結帳'},
                 {'id': 'self_checkout', 'x': 8.7, 'z': 9.8, 'r': 1.2, 'label': '自助結帳'},
                 {'id': 'produce', 'x': 15.3, 'z': -1.6, 'r': 1.6, 'label': '蔬果'},
                 {'id': 'dairy', 'x': 6.0, 'z': -13.6, 'r': 1.6, 'label': '牛奶、蛋'},
                 {'id': 'deli', 'x': -18.0, 'z': -10.2, 'r': 1.4, 'label': '熟食櫃台'},
                 {'id': 'frozen', 'x': -18.4, 'z': -1.5, 'r': 1.4, 'label': '冷凍食品'},
                 {'id': 'carts', 'x': 17.5, 'z': 12.6, 'r': 1.2, 'label': '推車'}]


def blocks(L):
    B = []
    def r(x0, x1, z0, z1, why): B.append({'x0': round(x0, 3), 'x1': round(x1, 3), 'z0': round(z0, 3), 'z1': round(z1, 3), 'why': why})
    for c in L['checkouts']: r(c['x'] - 0.45, c['x'] + 0.45, c['z0'], c['z1'], 'checkout lane %d' % c['n']); r(c['x'] + 0.45, c['x'] + 1.1, c['z1'] - 1.2, c['z1'] - 0.4, 'register stand')
    for s in L['self_checkout']: r(s['x'] - 0.5, s['x'] + 0.5, s['z'] - 0.35, s['z'] + 0.35, 'self checkout')
    d = L['service_desk']; r(d['x0'], d['x1'], d['z0'], d['z1'], 'service desk'); r(X0, d['x1'], d['z0'] - 1.45, d['z0'], 'service staff area + back cabinet')
    c = L['carts']; r(c['x0'], c['x1'], c['z0'], c['z1'], 'carts')
    for t in L['seasonal']: r(t['x'] - t['w'] / 2, t['x'] + t['w'] / 2, t['z'] - t['d'] / 2, t['z'] + t['d'] / 2, t['kind'])
    for t in L['produce_tables']: r(t['x'] - t['w'] / 2, t['x'] + t['w'] / 2, t['z'] - t['d'] / 2, t['z'] + t['d'] / 2, 'produce table')
    w = L['produce_wall']; r(X1 - w['d'], X1, w['z0'], w['z1'], 'produce wall case')
    for g in L['gondolas']: r(g['x'] - g['d'] / 2, g['x'] + g['d'] / 2, g['z0'], g['z1'], 'gondola %d' % g['aisle'])
    dw = L['dairy_wall']; r(dw['x0'], dw['x1'], Z0, Z0 + dw['d'], 'dairy wall')
    m = L['meat_case']; r(m['x0'], m['x1'], Z0, Z0 + m['d'] + 0.1, 'meat case')
    dl = L['deli']; r(dl['x0'], dl['x1'], dl['z0'] - 0.6, dl['counter_z'] + 0.5, 'deli counter + back')
    for f in L['freezers']:
        if f['x'] < X0 + 1: r(X0, X0 + 1.2, f['z0'], f['z1'], 'freezer wall')
    r(-17.2, -14.8, -8.0, 4.5, 'freezer island')
    return B


L['blocks'] = blocks(L)


def check(L):
    bad = []
    for k in ('spawn', 'exit'):
        p = L[k]
        for b in L['blocks']:
            if b['x0'] < p['x'] < b['x1'] and b['z0'] < p['z'] < b['z1']: bad.append((k, b['why']))
    for it in L['interact']:
        for b in L['blocks']:
            if b['x0'] < it['x'] < b['x1'] and b['z0'] < it['z'] < b['z1']: bad.append(('interact ' + it['id'], b['why']))
    # 走道寬度：貨架之間至少 1.6 m
    xs = sorted(g['x'] for g in L['gondolas'])
    for a, b in zip(xs, xs[1:]):
        if b - a - 1.2 < 1.6: bad.append(('aisle too narrow', a, b))
    # 結帳道之間至少 1.0 m（客人站的地方）
    cx = sorted(c['x'] for c in L['checkouts'])
    for a, b in zip(cx, cx[1:]):
        if b - a - 0.9 - 0.65 < 0.9: bad.append(('checkout gap', a, b))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('blocks', len(L['blocks']), 'gondolas', len(GON), 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
