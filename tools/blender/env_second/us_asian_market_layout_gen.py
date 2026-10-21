"""美國交換：大超市（草原超市 us_market）對面的小亞洲超市（區域 us_asian_market）配置 → assets/models/env/second_ai/us_asian_market.layout.json。
LAWWW2-C 2026-10-17；使用者 23:0x「超市一個大的超市對面有一個小的亞洲超市」（US1 的「台灣泡麵」在這裡買）。
遊戲（src/us3d.js：導航格、互動點、出口）和 Blender（tools/blender/env_second/us_asian_market.py）讀同一份。
用法：python3 tools/blender/env_second/us_asian_market_layout_gen.py [--check]

美國大學城常見的小亞洲超市（strip mall 裡的一間）：店面 16 m × 12 m、天花板 3.4 m（輕鋼架天花板＋日光燈盤）、
正面（南邊 z＝+6）整片玻璃＋一扇玻璃門；四排雙面貨架（泡麵、醬料、零食餅乾、乾貨茶葉）、西牆一整面的米（大袋子疊在棧板上）、
東牆開放式冷藏櫃（青菜、豆腐）、北牆冷凍櫃（水餃、包子）＋飲料冰箱；門口西邊結帳櫃台（紅燈籠、月曆）、門口東邊一棧板促銷的米。
店名虛構（竹葉亞洲超市 BAMBOO LEAF ASIAN MARKET）；商品全部是假包裝，不畫品牌、商標、可讀的商品名（D77）。
座標：區域座標 x 往東、z 往南、y 往上；原點＝店中心；單位公尺。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'us_asian_market.layout.json')
X0, X1, Z0, Z1, H = -8.0, 8.0, -6.0, 6.0, 3.4
DOOR = {'x': 4.5, 'w': 1.8}
GZ0, GZ1 = -3.4, 1.6                                    # 貨架的南北範圍（前面留結帳區、後面留冷凍櫃前的走道）
GONDOLAS = [{'x': -4.6, 'cat': 'noodles', 'aisle': 1}, {'x': -1.2, 'cat': 'sauce', 'aisle': 2}, {'x': 2.2, 'cat': 'snacks', 'aisle': 3}, {'x': 5.0, 'cat': 'dry', 'aisle': 4}]
for g in GONDOLAS: g.update({'z0': GZ0, 'z1': GZ1, 'd': 1.0, 'h': 1.8})
CAT_ZH = {'noodles': '泡麵', 'sauce': '醬料', 'snacks': '零食、餅乾', 'dry': '乾貨、茶葉'}
CAT_EN = {'noodles': 'NOODLES', 'sauce': 'SAUCES', 'snacks': 'SNACKS', 'dry': 'DRY GOODS · TEA'}
L = {'version': 1, 'bounds': {'x0': X0, 'x1': X1, 'z0': Z0, 'z1': Z1}, 'h': H,
     'name_en': 'BAMBOO LEAF ASIAN MARKET', 'name_zh': '竹葉亞洲超市',
     'storefront': {'z': Z1, 'x0': X0 + 0.6, 'x1': X1 - 0.6, 'glass_h': 2.6}, 'door': DOOR,
     'spawn': {'x': DOOR['x'], 'z': 3.9, 'yaw': 3.141592653589793, 'note': '從門進來（面向北）'},
     'exits': [{'x': DOOR['x'] + 1.1, 'z': Z1 - 0.5, 'r': 0.9, 'label': '過馬路（回大超市）', 'to': 'us_market', 'note': '對面就是草原超市（使用者 23:0x）'},
               {'x': DOOR['x'] - 1.1, 'z': Z1 - 0.5, 'r': 0.9, 'label': '回社區（搭公車）', 'to': 'us_outside', 'note': '真的要搭公車（公車站先不做 3D，BB_215）'}],
     'gondolas': GONDOLAS, 'cat_zh': CAT_ZH, 'cat_en': CAT_EN,
     'rice_wall': {'x0': X0, 'x1': X0 + 1.1, 'z0': -5.2, 'z1': 2.4, 'note': '西牆：米（25 磅、50 磅的大袋子疊在棧板上，上面一層小袋子）、上面兩層層板放電鍋、大桶的油'},
     'produce_case': {'x0': X1 - 0.9, 'x1': X1, 'z0': -4.6, 'z1': 1.8, 'note': '東牆：開放式冷藏櫃（青江菜、大白菜、薑、蔥、豆腐盒），上面一排燈'},
     'freezers': {'x0': X0 + 1.4, 'x1': 2.6, 'z0': Z0, 'z1': Z0 + 0.9, 'doors': 8, 'note': '北牆：冷凍玻璃門櫃（水餃、包子、湯圓、魚丸）'},
     'drinks': {'x0': 2.9, 'x1': X1 - 1.2, 'z0': Z0, 'z1': Z0 + 0.8, 'doors': 3, 'note': '北牆東段：飲料冰箱（茶、豆漿、汽水）'},
     'checkout': {'x0': -6.4, 'x1': -2.6, 'z0': 3.2, 'z1': 4.0, 'note': '結帳櫃台（收銀機、刷卡機、小零食架）；收銀員站北邊；後牆上紅燈籠、月曆'},
     'promo_rice': {'x0': 6.0, 'x1': 7.4, 'z0': 2.6, 'z1': 4.2, 'note': '門口東邊：一棧板促銷的米（紙板價格牌，沒有字）'},
     'snack_rack': {'x0': -2.4, 'x1': -1.6, 'z0': 3.2, 'z1': 4.0, 'note': '結帳櫃台旁的小零食架'}}
# 互動點（usMarket 的 id 給交換系統接：US1「台灣泡麵」＝noodles）
# 每排貨架兩面放同一類；互動點在貨架旁邊的走道上（第 3、4 排共用一條走道：一個在北半段、一個在南半段）
AT = {'noodles': (-3.5, -0.9), 'sauce': (-0.1, -0.9), 'snacks': (3.3, -2.2), 'dry': (3.9, 0.6)}
IT = [{'id': 'asia_' + g['cat'], 'label': '%s（第 %d 排）' % (CAT_ZH[g['cat']], g['aisle']), 'x': AT[g['cat']][0], 'z': AT[g['cat']][1], 'r': 1.0} for g in GONDOLAS]
IT += [{'id': 'asia_rice', 'label': '米', 'x': X0 + 1.9, 'z': -1.4, 'r': 1.0},
       {'id': 'asia_produce', 'label': '青菜、豆腐', 'x': X1 - 1.6, 'z': -1.4, 'r': 1.0},
       {'id': 'asia_frozen', 'label': '冷凍櫃：水餃、包子', 'x': -2.4, 'z': Z0 + 1.7, 'r': 1.0},
       {'id': 'asia_drinks', 'label': '飲料冰箱', 'x': 4.9, 'z': Z0 + 1.6, 'r': 1.0},
       {'id': 'asia_checkout', 'label': '結帳櫃台', 'x': -4.5, 'z': 4.9, 'r': 1.0}]
L['interact'] = IT
# 導航阻擋（長方形；遊戲另外把範圍邊上 0.25 m 擋住＝牆）
BLOCKS = []
for g in GONDOLAS:
    BLOCKS.append({'x0': g['x'] - g['d'] / 2, 'x1': g['x'] + g['d'] / 2, 'z0': g['z0'] - 0.05, 'z1': g['z1'] + 0.05, 'why': 'gondola %d' % g['aisle']})
for k in ('rice_wall', 'produce_case', 'freezers', 'drinks', 'checkout', 'promo_rice', 'snack_rack'):
    r = L[k]; BLOCKS.append({'x0': r['x0'], 'x1': r['x1'], 'z0': r['z0'], 'z1': r['z1'], 'why': k})
BLOCKS.append({'x0': -6.4, 'x1': -2.6, 'z0': 2.2, 'z1': 3.2, 'why': 'cashier side (behind counter)'})   # 收銀員那一側（玩家不進去）
L['blocks'] = BLOCKS


def check(L):
    bad = []
    pts = [('spawn', L['spawn'])] + [('exit ' + e['label'], e) for e in L['exits']] + [('it ' + i['label'], i) for i in L['interact']]
    for nm, p in pts:
        for b in L['blocks']:
            if b['x0'] - 0.3 < p['x'] < b['x1'] + 0.3 and b['z0'] - 0.3 < p['z'] < b['z1'] + 0.3: bad.append((nm, 'blocked by', b['why']))
    s = L['spawn']
    for e in L['exits']:
        if ((s['x'] - e['x']) ** 2 + (s['z'] - e['z']) ** 2) ** 0.5 < e['r'] + 0.3: bad.append(('spawn inside exit radius', e['label']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('interact', len(IT), 'blocks', len(BLOCKS), 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
