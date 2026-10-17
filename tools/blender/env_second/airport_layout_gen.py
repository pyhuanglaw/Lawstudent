"""桃園機場第二航廈（VAC-A2）：出境大廳（含航廈外的下車處）、入境大廳 → assets/models/env/second_ai/airport_t2.layout.json。
LAWWW2-C 2026-10-17。遊戲（LAWWW：兩個區域 airport_dep、airport_arr）和 Blender（tools/blender/env_second/airport_t2.py）讀同一份。
用法：python3 tools/blender/env_second/airport_layout_gen.py [--check]

規格：AA-C 2026-10-17 05:56（VAC-A2 回覆）：第二航廈；要走得到 ①出境層外的下車處 ②出境大廳（報到櫃台列、航班看板文字虛構）③出境安檢門口的道別點（最重要）④入境大廳接機處（出關門口、接機欄杆）；
  出境大廳候機椅一排、入境接機處旁邊的椅子；不做登機口、管制區。航空公司、店名虛構（D77）。CG：BCG-31（下車處）、BCG-34（入境大廳）。
  用到的事件：2026-08-24 阿凱那團去日本（出境）、8/28 回國（入境）；2028-03-25 日本路線出發；2028-07-19 學姊出發（下車處）；2028-08-02 美國路線出發；
  2028-08-05、2028-12-16、2028-12-23 入境。
遊戲版（不宣稱照實測尺寸；真實的第二航廈照片之後由使用者提供時再對）：
  出境（airport_dep）：區域座標 x 往東、z 往南（航廈外的車道在南邊）、y 往上；大廳 x −36～36、z −18～12，挑高的弧形天花板；
    四座報到島（沿 z，櫃台在兩側）、中間主通道直通北牆正中的出境安檢入口；正面玻璃帷幕、自動門；外面是有雨遮的下車處、兩線車道。
  入境（airport_arr）：大廳 x −28～28、z −12～12、天花板 5.6 m；北牆正中是出關門（毛玻璃自動門），接機欄杆夾出一條走道；兩側等候椅、外幣兌換、服務台、咖啡；南牆出口往車道。
座位 yaw：人物面向 (sin yaw, cos yaw)。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'airport_t2.layout.json')
rng = random.Random(2026)

# ================= 出境 =================
D = {'zone': 'airport_dep', 'bounds': {'x0': -36.0, 'x1': 36.0, 'z0': -18.0, 'z1': 30.0}, 'hall': {'x0': -36.0, 'x1': 36.0, 'z0': -18.0, 'z1': 12.0},
     'roof': {'eave': 10.5, 'peak': 15.0, 'peak_z': -3.0}, 'facade_z': 12.0}
D['entrances'] = [{'x': x, 'w': 3.2} for x in (-18.0, 0.0, 18.0)] + [{'x': x, 'w': 2.4} for x in (-32.0, 32.0)]
D['curb'] = {'walk_z0': 12.0, 'walk_z1': 19.0, 'road_z0': 19.0, 'road_z1': 27.0, 'canopy_z1': 26.0, 'canopy_h': 8.5,
             'note': '出境層外：人行道（下車處、行李推車）＋兩線車道（之後放車）；大雨遮從航廈一路蓋到車道外側'}
ISL = []
for k, x in enumerate((-27.0, -9.0, 9.0, 27.0)):
    ISL.append({'id': chr(65 + k), 'x': x, 'z0': -11.0, 'z1': 5.0, 'w': 8.4, 'spine': 2.6, 'counter_d': 0.9, 'pitch': 1.9,
                'airline': ['lumen', 'kite', 'nanfeng', 'harbor'][k]})
D['islands'] = ISL
D['security'] = {'x0': -6.0, 'x1': 6.0, 'z': -18.0, 'depth': 2.5, 'note': '出境安檢、證照查驗入口（門後是管制區，不做）；門口留一大塊空地＝道別點'}
D['farewell'] = {'x': 0.0, 'z': -13.8, 'r': 2.5, 'label': '安檢入口'}
D['benches'] = [{'x': x, 'z': -16.4, 'yaw': 0.0, 'n': 4} for x in (-26.0, -19.0, 19.0, 26.0)] + [{'x': x, 'z': 9.6, 'yaw': math.pi, 'n': 3} for x in (-33.0, 33.0)]
D['info_desk'] = {'x': 0.0, 'z': -4.0, 'r': 1.6, 'note': '服務台（圓弧櫃台）'}
D['fids'] = [{'x': x, 'z': -16.8, 'y': 4.6, 'w': 6.0, 'h': 2.4, 'face': 'S'} for x in (-13.0, 13.0)] + [{'x': i['x'], 'z': i['z1'] + 0.05, 'y': 3.6, 'w': 2.2, 'h': 1.2, 'face': 'S'} for i in ISL]
D['shops'] = [{'id': 'mart', 'side': 'W', 'z0': -16.0, 'z1': -8.0, 'name_zh': '日日便利', 'name_en': 'DAILY MART'},
              {'id': 'cafe', 'side': 'W', 'z0': -4.0, 'z1': 4.0, 'name_zh': '雲端咖啡', 'name_en': 'CLOUD CAFE'},
              {'id': 'fx', 'side': 'E', 'z0': -16.0, 'z1': -11.0, 'name_zh': '外幣兌換', 'name_en': 'CURRENCY EXCHANGE'},
              {'id': 'books', 'side': 'E', 'z0': -6.0, 'z1': 2.0, 'name_zh': '旅人書店', 'name_en': 'TRAVELERS BOOKS'}]
D['trolleys'] = [{'x': x, 'z': 10.4, 'n': 8} for x in (-24.0, 24.0)] + [{'x': x, 'z': 13.6, 'n': 10} for x in (-9.0, 9.0)]
D['spawn_hall'] = {'x': 0.0, 'z': 10.0, 'yaw': math.pi, 'note': '從中間的自動門進來（面向北）'}
D['spawn_curb'] = {'x': 4.0, 'z': 17.8, 'yaw': math.pi, 'note': '下車處：車停在車道邊、人站在人行道（BCG-31）'}
D['dropoff'] = {'x': 4.0, 'z': 18.6, 'r': 1.6, 'label': '下車處'}
D['exit'] = {'x': -4.0, 'z': 18.6, 'r': 1.4, 'label': '離開（搭車）', 'to': None}
D['interact'] = [{'id': 'checkin_' + i['id'], 'x': i['x'] + i['w'] / 2 + 1.2, 'z': (i['z0'] + i['z1']) / 2, 'r': 1.5, 'label': '報到櫃台 ' + i['id']} for i in ISL] + \
    [{'id': 'info', 'x': 0.0, 'z': -1.6, 'r': 1.2, 'label': '服務台'}, {'id': 'fids', 'x': 13.0, 'z': -14.0, 'r': 2.0, 'label': '航班看板'},
     {'id': 'mart', 'x': -33.0, 'z': -12.0, 'r': 1.4, 'label': '便利商店'}, {'id': 'cafe', 'x': -33.0, 'z': 0.0, 'r': 1.4, 'label': '咖啡店'}]
D['seats'] = []
for b in D['benches']:
    for k in range(b['n'] * 3):
        off = (k - (b['n'] * 3 - 1) / 2) * 0.62
        D['seats'].append({'x': round(b['x'] + off, 3), 'z': round(b['z'] + (0.05 if b['yaw'] == 0 else -0.05), 3), 'yaw': b['yaw'], 'y': 0.45})


def dep_blocks(L):
    B = []
    def r(x0, x1, z0, z1, why): B.append({'x0': round(x0, 3), 'x1': round(x1, 3), 'z0': round(z0, 3), 'z1': round(z1, 3), 'why': why})
    for i in L['islands']:
        r(i['x'] - i['w'] / 2, i['x'] + i['w'] / 2, i['z0'], i['z1'], 'check-in island ' + i['id'])
        for s in (-1, 1):
            xs = i['x'] + s * (i['w'] / 2 + 1.6)                                             # 排隊欄（伸縮帶）：櫃台前 1.6 m 一條，留兩個缺口
            r(min(xs, xs + s * 0.08), max(xs, xs + s * 0.08), i['z0'] + 1.6, i['z1'] - 2.0, 'queue belt ' + i['id'])
    s = L['security']; r(-36.0, s['x0'], -18.0, -17.4, 'north wall W'); r(s['x1'], 36.0, -18.0, -17.4, 'north wall E')
    r(L['info_desk']['x'] - 1.7, L['info_desk']['x'] + 1.7, L['info_desk']['z'] - 1.7, L['info_desk']['z'] + 1.7, 'info desk (ring)')
    for b in L['benches']: r(b['x'] - b['n'] * 0.95, b['x'] + b['n'] * 0.95, b['z'] - 0.4, b['z'] + 0.4, 'bench')
    for sh in L['shops']:
        if sh['side'] == 'W': r(-36.0, -34.4, sh['z0'], sh['z1'], 'shop ' + sh['id'])
        else: r(34.4, 36.0, sh['z0'], sh['z1'], 'shop ' + sh['id'])
    for t in L['trolleys']: r(t['x'] - 0.45, t['x'] + 0.45, t['z'] - 0.5 - t['n'] * 0.12, t['z'] + 0.5, 'trolleys')
    # 正面玻璃牆（門口留開）
    xs = sorted([(e['x'] - e['w'] / 2, e['x'] + e['w'] / 2) for e in L['entrances']]); cur = -36.0
    for (a, b) in xs: r(cur, a, 11.85, 12.15, 'facade'); cur = b
    r(cur, 36.0, 11.85, 12.15, 'facade')
    c = L['curb']; r(-36.0, 36.0, c['road_z0'] - 0.15, c['road_z0'], 'curb edge (cars on road)')
    for x in (-24.0, -8.0, 8.0, 24.0): r(x - 0.4, x + 0.4, 18.2, 18.8, 'canopy column')
    return B


D['blocks'] = dep_blocks(D)

# ================= 入境 =================
A = {'zone': 'airport_arr', 'bounds': {'x0': -28.0, 'x1': 28.0, 'z0': -12.0, 'z1': 12.0}, 'h': 5.6}
A['customs_door'] = {'x': 0.0, 'z': -12.0, 'w': 3.6, 'note': '出關門（毛玻璃自動門）；門後是海關（不做）'}
A['rail'] = {'x0': -1.6, 'x1': 1.6, 'z0': -12.0, 'z1': -3.0, 'flare': 4.0, 'note': '接機欄杆：從出關門夾出一條 3.2 m 寬的走道，到 z −3 往兩側打開；欄杆外面是接機的人'}
A['meet'] = {'x': 2.6, 'z': -7.0, 'r': 1.6, 'label': '接機處'}
A['benches'] = [{'x': x, 'z': z, 'yaw': yaw, 'n': 3} for (x, z, yaw) in ((-12.0, -10.6, 0.0), (-18.0, -10.6, 0.0), (12.0, -10.6, 0.0), (18.0, -10.6, 0.0), (-14.0, 2.0, math.pi / 2), (14.0, 2.0, -math.pi / 2))]
A['counters'] = [{'id': 'fx', 'x0': -27.4, 'x1': -21.0, 'z0': -4.0, 'z1': -2.6, 'name_zh': '外幣兌換', 'name_en': 'CURRENCY EXCHANGE'},
                 {'id': 'info', 'x0': 20.0, 'x1': 26.0, 'z0': -4.0, 'z1': -2.6, 'name_zh': '旅客服務', 'name_en': 'INFORMATION'},
                 {'id': 'sim', 'x0': -27.4, 'x1': -22.0, 'z0': 3.0, 'z1': 4.4, 'name_zh': '電信門市', 'name_en': 'SIM CARDS'}]
A['cafe'] = {'x0': 18.0, 'x1': 28.0, 'z0': 4.0, 'z1': 12.0, 'name_zh': '雲端咖啡', 'name_en': 'CLOUD CAFE'}
A['exits'] = [{'x': x, 'w': 3.2} for x in (-12.0, 0.0, 12.0)]
A['fids'] = [{'x': x, 'z': -11.9, 'y': 3.2, 'w': 4.0, 'h': 1.6, 'face': 'S'} for x in (-7.0, 7.0)]
A['spawn_customs'] = {'x': 0.0, 'z': -10.8, 'yaw': 0.0, 'note': '從出關門出來（面向南）'}
A['spawn_wait'] = {'x': 3.0, 'z': -5.0, 'yaw': math.pi, 'note': '在欄杆外面等人（面向出關門）'}
A['exit'] = {'x': 0.0, 'z': 11.2, 'r': 1.4, 'label': '出口（往車道）', 'to': None}
A['interact'] = [{'id': 'fx', 'x': -24.2, 'z': -1.6, 'r': 1.2, 'label': '外幣兌換'}, {'id': 'info', 'x': 23.0, 'z': -1.6, 'r': 1.2, 'label': '旅客服務'},
                 {'id': 'cafe', 'x': 17.0, 'z': 8.0, 'r': 1.4, 'label': '咖啡店'}, {'id': 'fids', 'x': -7.0, 'z': -9.0, 'r': 1.6, 'label': '抵達看板'}]
A['seats'] = []
for b in A['benches']:
    for k in range(b['n'] * 3):
        off = (k - (b['n'] * 3 - 1) / 2) * 0.62
        if abs(math.sin(b['yaw'])) > 0.5: A['seats'].append({'x': round(b['x'], 3), 'z': round(b['z'] + off, 3), 'yaw': b['yaw'], 'y': 0.45})
        else: A['seats'].append({'x': round(b['x'] + off, 3), 'z': round(b['z'] + 0.05, 3), 'yaw': b['yaw'], 'y': 0.45})


def arr_blocks(L):
    B = []
    def r(x0, x1, z0, z1, why): B.append({'x0': round(x0, 3), 'x1': round(x1, 3), 'z0': round(z0, 3), 'z1': round(z1, 3), 'why': why})
    rl = L['rail']
    for s in (-1, 1):
        x = rl['x1'] if s > 0 else rl['x0']
        r(min(x, x + s * 0.08), max(x, x + s * 0.08), rl['z0'], rl['z1'], 'arrival rail')
        r(min(x, x + s * rl['flare']), max(x, x + s * rl['flare']), rl['z1'] - 0.04, rl['z1'] + 0.04, 'arrival rail flare')
    for b in L['benches']:
        if abs(math.sin(b['yaw'])) > 0.5: r(b['x'] - 0.4, b['x'] + 0.4, b['z'] - b['n'] * 0.95, b['z'] + b['n'] * 0.95, 'bench')
        else: r(b['x'] - b['n'] * 0.95, b['x'] + b['n'] * 0.95, b['z'] - 0.4, b['z'] + 0.4, 'bench')
    for c in L['counters']: r(c['x0'], c['x1'], c['z0'], c['z1'], 'counter ' + c['id']); r(c['x0'], c['x1'], c['z0'] - 1.4, c['z0'], 'counter back ' + c['id'])
    cf = L['cafe']; r(cf['x0'], cf['x1'], cf['z0'], cf['z0'] + 1.0, 'cafe counter')
    for k in range(3): x = cf['x0'] + 2.5 + k * 2.4; z = cf['z0'] + 3.4; r(x - 0.9, x + 0.9, z - 0.45, z + 0.45, 'cafe table + chairs')
    for (cx, cz) in ((-18.0, -6.0), (18.0, -6.0), (-18.0, 6.0), (18.0, 6.0)): r(cx - 0.45, cx + 0.45, cz - 0.45, cz + 0.45, 'column')
    r(-4.95, -4.05, 10.6 - 0.5 - 8 * 0.12, 11.1, 'trolleys')
    r(-28.0, 28.0, 11.85, 12.0, 'facade (exits at x −12, 0, 12 are doors: game opens them)')
    return B


A['blocks'] = arr_blocks(A)
L = {'version': 1, 'terminal': 'TPE T2（遊戲版）', 'dep': D, 'arr': A,
     'airlines': {'lumen': 'LUMEN AIR 曜光航空', 'kite': 'PACIFIC KITE 太平洋風箏航空', 'nanfeng': 'NANFENG AIRLINES 南風航空', 'harbor': 'HARBOR JET 港灣捷運航空'},
     'note': '航空公司、店名全部虛構（D77）；看板上的城市是真的地名（不是品牌），航班號碼用虛構的航空代碼'}


def check(L):
    bad = []
    for area, keys in (('dep', ('spawn_hall', 'spawn_curb', 'farewell', 'dropoff', 'exit')), ('arr', ('spawn_customs', 'spawn_wait', 'meet', 'exit'))):
        Z = L[area]
        for k in keys:
            p = Z[k]
            for b in Z['blocks']:
                if b['x0'] < p['x'] < b['x1'] and b['z0'] < p['z'] < b['z1']: bad.append((area, k, b['why']))
        for it in Z['interact']:
            for b in Z['blocks']:
                if b['x0'] < it['x'] < b['x1'] and b['z0'] < it['z'] < b['z1']: bad.append((area, 'interact ' + it['id'], b['why']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('dep blocks', len(D['blocks']), 'seats', len(D['seats']), '| arr blocks', len(A['blocks']), 'seats', len(A['seats']), '| problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
