"""美國交換：校外學生公寓社區的戶外（SCN-US-01「社區外觀」；區域 us_outside）配置 → assets/models/env/second_ai/us_community.layout.json。
LAWWW2-C 2026-10-17。遊戲（LAWWW：導航格、出生點、互動點、停車場的車）和 Blender（tools/blender/env_second/us_community.py）讀同一份。
用法：python3 tools/blender/env_second/us_community_layout_gen.py [--check]

參考：使用者 2026-10-16 的社區外觀照片（docs/art-rebuild/second_ai/research/us_apartment_photos.md 照片二）：
  兩到三層的木構公寓沿停車場一棟接一棟；灰褐色橫向壁板、白色轉角與窗框飾條；山牆朝前的斜屋頂（深色瀝青瓦）、山牆上白色圓形通風口；
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
FLOOR_H, FLOORS = 2.9, 3

# 建築：中心、長（沿正面）、深、正面朝向（yaw：正面法線＝(sin, cos)；0＝朝南）、山牆數、樓梯間在正面的位置（沿正面的局部座標）
BUILDINGS = [
    {'id': 'A', 'cx': -25.0, 'cz': -22.5, 'len': 28.0, 'dep': 13.0, 'yaw': 0.0, 'gables': 3, 'breezeway': [-4.0], 'tint': '#8e8474'},
    {'id': 'B', 'cx': 8.0, 'cz': -22.5, 'len': 32.0, 'dep': 13.0, 'yaw': 0.0, 'gables': 4, 'breezeway': [-8.0, 6.0], 'tint': '#8f8574', 'home': True},
    {'id': 'C', 'cx': 33.5, 'cz': 6.0, 'len': 26.0, 'dep': 13.0, 'yaw': -math.pi / 2, 'gables': 3, 'breezeway': [2.0], 'tint': '#8c8272'},
]
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
     'spawn_home': {'x': round(bx + 1.6, 3), 'z': round(front_z + 1.6, 3), 'yaw': 0.0, 'note': '213 樓梯平台往下的樓梯口（us_apartment 的 exit to us_outside）'},
     'to_home': {'x': round(bx + 1.6, 3), 'z': round(front_z + 0.9, 3), 'r': 1.0, 'label': '上樓（213）', 'to': 'us_apartment'},
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
L['props'], L['trees'] = PROPS, TREES


def check(L):
    bad = []
    s = L['spawn_home']
    for b in L['buildings']:
        hl, hd = (b['len'] / 2, b['dep'] / 2) if abs(math.sin(b['yaw'])) < 0.5 else (b['dep'] / 2, b['len'] / 2)
        if abs(s['x'] - b['cx']) < hl and abs(s['z'] - b['cz']) < hd: bad.append(('spawn in building', b['id']))
    for c in L['cars']:
        if abs(c['x'] - s['x']) < 3.0 and abs(c['z'] - s['z']) < 3.5: bad.append(('car at spawn', c['x'], c['z']))
    return bad


if __name__ == '__main__':
    bad = check(L)
    print('stalls', len(STALLS), 'cars', len(CARS), 'kinds', {k: sum(1 for c in CARS if c['kind'] == k) for k, _ in KINDS}, 'problems', bad)
    if bad: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(L, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('wrote', OUT)
