"""社會科學院 辜先生紀念圖書館（⑬）的室內配置 → src/data/soclib_layout.js（const SOCLIB_LAYOUT= 後面接純 JSON）。
遊戲（LAWWW 的區域程式：導航格、座位、互動點）和 Blender（tools/blender/env_second/soclib_interior.py）讀同一份，兩邊一定對得上。
用法：python3 tools/blender/env_second/soclib_layout_gen.py [--check]（--check：只檢查、不寫檔）

參考（公開報導，不是實測）：一樓開架閱覽室挑高將近 6 m，屋頂由 88 支白色樹狀柱撐起、柱頂像荷葉一樣散開，中間有 130 個形狀不一的天窗；
竹製的書架與閱覽家具；「知識的森林」。遊戲版只做一層：入口、服務台、開架書區（弧形矮書架圍著柱子）、閱覽長桌、窗邊座位。
不宣稱還原真實的平面：柱子數量、位置、書架排法都是遊戲化設計。

座標：x 往東、z 往南（+z＝南：入口、服務台）；單位公尺；y 往上（地板 y=0）。北牆、西牆是玻璃帷幕（窗邊座位），東牆是靠牆書架，南牆有入口。
座位 yaw：人物面向 (sin yaw, cos yaw)（yaw=0 面向 +z、π 面向 −z），和 library_layout.js 一樣。"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'src', 'data', 'soclib_layout.js')

W, D, H, WT = 30.0, 22.0, 5.6, 0.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
R_PLAYER = 0.33

L = {'version': 1, 'W': W, 'D': D, 'H': H, 'wallT': WT, 'cell': 0.4,
     'walls': {'north': 'glass', 'west': 'glass', 'east': 'solid', 'south': 'solid'},
     'entrance': {'x': -9.0, 'w': 2.4, 'exitZ': 10.2, 'spawn': {'x': -9.0, 'z': 9.3, 'yaw': round(math.pi, 4)}},
     'gates': {'z': 8.0, 'posts': [-11.4, -9.8, -8.2, -6.6], 'postW': 0.3, 'postD': 1.0,
               'rails': [[X0 + WT, -11.55], [-6.45, -4.4]]},          # 閘門兩邊的矮玻璃欄杆（看得到，不是隱形牆）
     'desk': {'x0': -4.4, 'x1': 0.6, 'z0': 7.4, 'z1': 8.2, 'staff': {'z0': 8.2, 'z1': Z1 - WT}},   # 服務台（借還書）；後面是館員區（矮隔板圍起來）
     }

# ---------- 家具 ----------
F = []; SEATS = []
def table(x, z, w=3.6, d=1.1, n=3):
    F.append({'type': 'readingTable', 'x': x, 'z': z, 'w': w, 'd': d, 'seats': n * 2})
    for i in range(n):
        sx = round(x - w / 2 + w / (2 * n) * (2 * i + 1), 3)
        for s in (-1, 1):
            SEATS.append({'x': sx, 'z': round(z + s * (d / 2 + 0.25), 3), 'yaw': round(math.pi if s > 0 else 0.0, 4), 'kind': 'table'})
# 閱覽長桌（中間偏西的空地；檯燈是桌子的一部分）
for (x, z) in [(-8.8, -5.1), (-8.8, -0.9), (-3.4, -5.1), (-3.4, -0.9)]:
    table(x, z)
# 窗邊座位：北牆（面向北）、西牆（面向西）的長吧台＋椅子
nc = {'type': 'windowCounter', 'x0': -13.2, 'x1': 13.2, 'z': round(Z0 + WT + 0.02 + 0.275, 3), 'd': 0.55, 'side': 'north'}
F.append(nc)
for i in range(int((nc['x1'] - nc['x0']) / 1.2)):
    SEATS.append({'x': round(nc['x0'] + 0.6 + i * 1.2, 3), 'z': round(nc['z'] + 0.75, 3), 'yaw': round(math.pi, 4), 'kind': 'window'})
wc = {'type': 'windowCounter', 'z0': -8.8, 'z1': 4.4, 'x': round(X0 + WT + 0.02 + 0.275, 3), 'd': 0.55, 'side': 'west'}
F.append(wc)
for i in range(int((wc['z1'] - wc['z0']) / 1.2)):
    SEATS.append({'x': round(wc['x'] + 0.75, 3), 'z': round(wc['z0'] + 0.6 + i * 1.2, 3), 'yaw': round(-math.pi / 2, 4), 'kind': 'window'})
# 東牆靠牆書架（2.4 m）
F.append({'type': 'wallShelf', 'x': round(X1 - WT - 0.01 - 0.25, 3), 'z0': -10.2, 'z1': 6.2, 'd': 0.5, 'h': 2.4, 'side': 'east'})
# 弧形矮書架（竹製）：東半邊四個「林間書房」——弧形書架圍出一個小空間、中間站著一支樹狀柱，開口朝走道；
# 第一個外面再一道矮弧（錯開開口，像繞進去的小書房）。手排的位置：兩座書架之間至少 1.1 m（人走得過去），導航另外用格子檢查
def arcf(cx, cz, r, open_deg, span_deg, h=1.5):
    a0 = math.radians(open_deg) + (2 * math.pi - math.radians(span_deg)) / 2
    return {'type': 'arcShelf', 'cx': cx, 'cz': cz, 'r': r, 'a0': round(a0, 3), 'a1': round(a0 + math.radians(span_deg), 3), 'd': 0.42, 'h': h}
def arc_pts(f, n=24):
    return [(f['cx'] + f['r'] * math.cos(f['a0'] + (f['a1'] - f['a0']) * k / n), f['cz'] + f['r'] * math.sin(f['a0'] + (f['a1'] - f['a0']) * k / n)) for k in range(n + 1)]
GROVES = [(5.3, -5.6, 2.1, 180, 240), (12.0, -5.8, 1.8, 135, 230), (6.0, 1.6, 2.3, -135, 220), (11.9, 2.1, 1.7, 180, 230)]
ARCS = [arcf(*g) for g in GROVES] + [arcf(5.3, -5.6, 3.5, 0, 100, h=1.2)]
F += ARCS
# 東南角的閱報區：兩對單人沙發＋矮桌（期刊架前面）
F.append({'type': 'lounge', 'x': 7.4, 'z': 7.0, 'n': 4}); F.append({'type': 'lounge', 'x': 11.2, 'z': 7.0, 'n': 4})
for lx in (7.4, 11.2):
    for sx, yaw in ((-1.0, math.pi / 2), (1.0, -math.pi / 2)):
        for sz in (-0.55, 0.55): SEATS.append({'x': round(lx + sx, 3), 'z': round(7.0 + sz, 3), 'yaw': round(yaw, 4), 'kind': 'lounge'})
# 入口附近：新書展示台、查詢電腦、還書箱（閘門外）、期刊架（南牆東段）
F.append({'type': 'display', 'x': -12.4, 'z': 5.2, 'w': 2.2, 'd': 0.9})
F.append({'type': 'opac', 'x': -6.0, 'z': 5.6, 'n': 2})
F.append({'type': 'returnBox', 'x': -12.9, 'z': 9.9, 'ry': round(math.pi / 2, 4)})
F.append({'type': 'periodicals', 'x0': 2.0, 'x1': 12.0, 'z': round(Z1 - WT - 0.01 - 0.25, 3), 'd': 0.5, 'h': 1.6})
# ---------- 柱子（樹狀柱：細白柱、柱頂像荷葉散開成圓盤；圓盤之間是天窗）：先排家具再排柱子 ----------
rng = random.Random(1311)
cols = [{'x': g[0], 'z': g[1], 'r': 0.19, 'cap': 2.2} for g in GROVES]
def clear_of_furniture(x, z):
    for f in F:
        t = f['type']
        if t == 'arcShelf' and min(math.hypot(x - u, z - v) for (u, v) in arc_pts(f)) < 0.9: return False
        if t == 'readingTable' and abs(x - f['x']) < f['w'] / 2 + 0.9 and abs(z - f['z']) < f['d'] / 2 + 1.4: return False
        if t == 'lounge' and abs(x - f['x']) < 2.2 and abs(z - f['z']) < 1.6: return False
    return True
for j, z in enumerate([-7.6, -4.3, -1.0, 2.3, 5.4]):
    for i, x in enumerate([-12.0, -8.4, -4.8, -1.2, 2.4, 6.0, 9.6, 13.2]):
        xx = x + (1.8 if j % 2 else 0.0) + rng.uniform(-0.5, 0.5); zz = z + rng.uniform(-0.4, 0.4)
        if zz > 3.8 and xx < -2.5: continue                                  # 入口、閘門、服務台那一帶不放柱子
        if xx > X1 - 1.8 or xx < X0 + 2.0: continue
        if not clear_of_furniture(xx, zz): continue
        if any(math.hypot(xx - c['x'], zz - c['z']) < 2.7 for c in cols): continue
        cols.append({'x': round(xx, 2), 'z': round(zz, 2), 'r': round(rng.uniform(0.15, 0.21), 3), 'cap': round(rng.uniform(1.7, 2.3), 2)})
for c in cols: c['capY'] = round(rng.uniform(4.75, 5.25), 2)            # 柱頂（荷葉）的高度不一樣：一片一片錯開，像樹冠
L['columns'] = cols
# 天窗：屋頂上圓形的開口（底下是短短的光井、頂上是天空色的面板）；放在荷葉柱頂之間的空隙
sky = []
for z in [Z0 + 1.6 + k * 1.55 for k in range(13)]:
    for x in [X0 + 1.6 + k * 1.55 for k in range(18)]:
        xx, zz = x + rng.uniform(-0.35, 0.35), z + rng.uniform(-0.35, 0.35)
        if not (X0 + 1.2 < xx < X1 - 1.2 and Z0 + 1.2 < zz < Z1 - 1.6): continue
        r = round(rng.uniform(0.45, 0.8), 2)
        if any(math.hypot(xx - c['x'], zz - c['z']) < c['cap'] + r + 0.15 for c in cols): continue
        if any(math.hypot(xx - u['x'], zz - u['z']) < r + u['r'] + 0.5 for u in sky): continue
        sky.append({'x': round(xx, 2), 'z': round(zz, 2), 'r': r})
L['skylights'] = sky
L['furniture'] = F
L['seats'] = SEATS
L['signs'] = [{'text': '社會科學院圖書館', 'x': -2.0, 'z': round(Z1 - WT - 0.02, 3), 'y': 3.6, 'ry': round(math.pi, 4), 'w': 3.6}]

# ---------- 導航阻擋（給遊戲端直接用：rects＝[x,z,w,d,ry]、circles＝[x,z,r]）＋檢查 ----------
rects, circles = [], []
for c in cols: circles.append([c['x'], c['z'], round(c['r'] + 0.05, 3)])
for f in F:
    t = f['type']
    if t == 'readingTable': rects.append([f['x'], f['z'], f['w'], f['d'] + 1.0, 0])      # 桌子＋兩邊的椅子
    elif t == 'windowCounter':
        if f['side'] == 'north': rects.append([(f['x0'] + f['x1']) / 2, f['z'], f['x1'] - f['x0'], f['d'], 0])
        else: rects.append([f['x'], (f['z0'] + f['z1']) / 2, f['d'], f['z1'] - f['z0'], 0])
    elif t == 'wallShelf': rects.append([f['x'], (f['z0'] + f['z1']) / 2, f['d'], f['z1'] - f['z0'], 0])
    elif t == 'arcShelf':
        n = max(3, int((f['a1'] - f['a0']) * f['r'] / 0.6))
        for k in range(n):
            a = f['a0'] + (k + 0.5) * (f['a1'] - f['a0']) / n; seg = (f['a1'] - f['a0']) * f['r'] / n + 0.06
            rects.append([round(f['cx'] + f['r'] * math.cos(a), 3), round(f['cz'] + f['r'] * math.sin(a), 3), round(seg, 3), f['d'], round(-a + math.pi / 2, 4)])
    elif t == 'display': rects.append([f['x'], f['z'], f['w'], f['d'], 0])
    elif t == 'opac': rects.append([f['x'], f['z'], 0.9 * f['n'], 0.6, 0])
    elif t == 'returnBox': rects.append([f['x'], f['z'], 0.7, 0.6, f['ry']])
    elif t == 'periodicals': rects.append([(f['x0'] + f['x1']) / 2, f['z'], f['x1'] - f['x0'], f['d'], 0])
    elif t == 'lounge': rects.append([f['x'], f['z'], 2.6, 1.9, 0])                            # 兩對沙發＋矮桌
g = L['gates']
for px in g['posts']: rects.append([px, g['z'], g['postW'], g['postD'], 0])
for a, b in g['rails']: rects.append([(a + b) / 2, g['z'], b - a, 0.1, 0])
dk = L['desk']; rects.append([(dk['x0'] + dk['x1']) / 2, (dk['z0'] + dk['z1']) / 2, dk['x1'] - dk['x0'], dk['z1'] - dk['z0'], 0])
rects.append([(dk['x0'] + dk['x1']) / 2, (dk['staff']['z0'] + dk['staff']['z1']) / 2 + 0.2, dk['x1'] - dk['x0'] + 2.0, dk['staff']['z1'] - dk['staff']['z0'] + 0.4, 0])   # 館員區（矮隔板圍起來，不開放）
L['nav'] = {'rects': [[round(v, 3) for v in r] for r in rects], 'circles': circles,
            'note': 'rects＝[中心x, 中心z, 寬(沿 ry 轉過的 x), 深, ry]；circles＝[x, z, r]；牆照 W×D、wallT 另外擋；入口門洞在南牆 x=entrance.x 寬 entrance.w'}


def blocked(x, z, pad):
    if not (X0 + WT / 2 + pad <= x <= X1 - WT / 2 - pad and Z0 + WT / 2 + pad <= z <= Z1 - WT / 2 - pad): return True
    for cx, cz, r in circles:
        if (x - cx) ** 2 + (z - cz) ** 2 < (r + pad) ** 2: return True
    for cx, cz, w, d, ry in rects:
        dx, dz = x - cx, z - cz; c, s = math.cos(ry), math.sin(ry)
        lx, lz = dx * c - dz * s, dx * s + dz * c
        if abs(lx) < w / 2 + pad and abs(lz) < d / 2 + pad: return True
    return False


def check():
    step = 0.2; nx, nz = int(W / step), int(D / step)
    free = [[not blocked(X0 + (i + 0.5) * step, Z0 + (j + 0.5) * step, R_PLAYER) for j in range(nz)] for i in range(nx)]
    sp = L['entrance']['spawn']; si, sj = int((sp['x'] - X0) / step), int((sp['z'] - Z0) / step)
    assert free[si][sj], '出生點被擋住'
    seen = {(si, sj)}; st = [(si, sj)]
    while st:
        i, j = st.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < nx and 0 <= b < nz and free[a][b] and (a, b) not in seen: seen.add((a, b)); st.append((a, b))
    bad = []
    for s in SEATS:   # 座位的走近點：椅子前面 0.7 m（人物面向的反方向是椅背；走近點在椅子靠走道那一側）
        ax, az = s['x'] - math.sin(s['yaw']) * 0.0, s['z'] - math.cos(s['yaw']) * 0.0
        ok = False
        for r in (0.6, 0.8, 1.0):
            for k in range(16):
                a = 2 * math.pi * k / 16; i, j = int((ax + r * math.cos(a) - X0) / step), int((az + r * math.sin(a) - Z0) / step)
                if 0 <= i < nx and 0 <= j < nz and (i, j) in seen: ok = True; break
            if ok: break
        if not ok: bad.append(s)
    tot = sum(1 for i in range(nx) for j in range(nz) if free[i][j])
    print(f'柱子 {len(cols)}、家具 {len(F)}、座位 {len(SEATS)}（長桌 {sum(1 for s in SEATS if s["kind"]=="table")}、窗邊 {sum(1 for s in SEATS if s["kind"]=="window")}）；'
          f'走得到的格子 {len(seen)}／可站的格子 {tot}；走不到的座位 {len(bad)}')
    return bad, len(seen), tot


bad, reach, tot = check()
if bad: print('走不到的座位：', bad[:6])
if '--check' not in sys.argv:
    head = __doc__.split('用法')[0].strip()
    txt = '/* ===== 社會科學院 辜先生紀念圖書館（⑬）室內配置：tools/blender/env_second/soclib_layout_gen.py 產生，不要手改 =====\n   ' + \
          head.replace('\n', '\n   ') + ' */\nconst SOCLIB_LAYOUT=' + json.dumps(L, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(OUT, 'w', encoding='utf8').write(txt); print('wrote', OUT, len(txt))
