"""總圖大廳第二版的正式模型（LIB-INTERIOR-1102 一樓，LAWWW2 帳號 A 2026-11-02）→ assets/models/env/second_ai/library_hall_v2.glb
  /opt/blenv/bin/python tools/blender/env_second/library_hall_v2.py -- --layout <v2 的 library_layout.js 或 .json> [--out 輸出.glb]
配置：src/data/library_layout.js 的 version 2（tools/blender/env_second/library_hall_v2_layout.py 產生）；遊戲 src/library_hall_v2.js 讀同一份。
依據：使用者 11-02 的 1F 平面圖＋兩張照片（見 library_hall_v2_layout.py 開頭）：
  ① 中庭：深灰地毯走道、兩旁亮燈的木頭展示櫃 → 一整片蜂蜜色木頭的「台階書牆」（中間走的樓梯、兩旁坐的大階梯，每一階的立面是書架）上到二樓；
     兩側二樓迴廊、玻璃欄杆、白牆、上面方格天花板＋崁燈。
  ② 展演廳：半圓、挑高兩層、一圈高窗（一樓高窗、二樓高側窗）、淺色木地板、深灰石材牆裙、白牆、弧形矮展示櫃、一圈弧形軌道燈。
接法和第一版（tools/blender/library_interior.py）一樣：L0_root（一樓）、L1_root（二樓），外牆 WALL_*（extras dir＝朝室內，遊戲淡出），
  src/building3d.js 的 B3.attachFormal 接手；家具全部在模型裡（遊戲的程序化家具是備用、正式模型載入後藏起來；影印機是自己的 GLB）。
  電梯（車廂、門、井道玻璃）是遊戲畫的：二樓樓板在電梯井的地方挖洞。字（招牌、樓層簡介）是遊戲畫的（layout 的 signs）。
材質：Poly Haven CC0（large_floor_tiles_02、dirty_carpet、herringbone_parquet、granite_tile_03、painted_plaster_wall、fine_grained_wood、
  walnut_veneer、ceiling_interior）；書、小東西是頂點色。
"""
import json, math, os, re, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Matrix   # noqa: E402
from lane118_shops import rot, rbox, ccyl, clathe, chair, plant   # noqa: E402
import linze_upper as LU   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/library_hall_v2.glb'))
LP = arg('--layout', os.path.join(L.ROOT, 'src', 'data', 'library_layout.js'))
src = open(LP, encoding='utf-8').read()
LAY = json.loads(src[src.index('{'):src.rindex('}') + 1]) if LP.endswith('.js') else json.loads(src)
assert LAY.get('version') == 2, '要第二版的配置（library_hall_v2_layout.py）'
PI = math.pi
Y1 = LAY['floors'][1]['y']; RY = LAY['roofY']; ST = LAY['slabT']; T = LAY['wallT']
BD = LAY['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']
BS = LAY['bookstair']; K = BS['walk']; SE = BS['seats']; U = LAY['upper']; V = LAY['vestibule']; GT = LAY['gates']; EL = LAY['elevator']; R = LAY['rotunda']
XI0, XI1, ZI0, ZI1 = X0 + T / 2, X1 - T / 2, Z0 + T / 2, Z1 - T / 2       # 牆的室內那一面
rng = random.Random(1102)

B.reset(texres=512)
root = B.group('library_hall_v2', props={'kind': 'library_hall_v2'})
R0 = B.group('L0_root', root); R1 = B.group('L1_root', root)
M = {
    'floor': L.pbr('lh2_floor', 'large_floor_tiles_02', tile=2.4, target='#d8d2c6', normal=0.3, maps=('diff', 'nor'), rough_value=0.45),
    'carpet': L.pbr('lh2_carpet', 'dirty_carpet', tile=2.0, target='#45494e', contrast=0.6, normal=0.4, maps=('diff', 'nor'), rough_value=0.97),
    'parquet': L.pbr('lh2_parquet', 'herringbone_parquet', tile=2.2, target='#c7a77e', normal=0.35, maps=('diff', 'nor'), rough_value=0.42),
    'stone': L.pbr('lh2_stone_dark', 'granite_tile_03', tile=1.4, target='#4b4d50', normal=0.3, maps=('diff', 'nor'), rough_value=0.35),
    'plaster': L.pbr('lh2_plaster', 'painted_plaster_wall', tile=3.0, target='#ece8e0', normal=0.25, maps=('diff', 'nor'), rough_value=0.9),
    'wood': L.pbr('lh2_wood_honey', 'fine_grained_wood', tile=1.6, target='#c08a52', normal=0.3, maps=('diff', 'nor'), rough_value=0.5),
    'walnut': L.pbr('lh2_walnut', 'walnut_veneer', tile=1.2, target='#6b4a32', normal=0.25, maps=('diff', 'nor'), rough_value=0.55),
    'ceil': L.pbr('lh2_ceiling', 'ceiling_interior', tile=2.4, target='#efece6', maps=('diff',), rough_value=0.95),
    'trim': L.flat('lh2_trim', '#e6e1d6', rough=0.6),
    'steel': L.flat('lh2_steel', '#b8bcc0', rough=0.3, metal=0.45),
    'frame': L.flat('lh2_frame', '#3a3d41', rough=0.45, metal=0.3),
    'glass': L.flat('lh2_glass', '#cfe0e6', rough=0.05, alpha=0.22),
    'light': L.flat('lh2_lightpanel', '#fffaf0', rough=0.5, emit=B.srgb('#fff4e0')),
    'warm': L.flat('GLOW_lh2_case', '#fff1d8', rough=0.5, emit=B.srgb('#ffe8c0')),
    'vc': L.vc_material('lh2_vc', rough=0.6),
    'vcm': L.vc_material('lh2_vcm', rough=0.35),
    'books': L.vc_material('lh2_books', rough=0.75),
}


class Lv:
    """一層樓的網格（材質一個一個累積，最後合併成一個物件掛在 L0_root／L1_root）"""
    def __init__(self, k, parent):
        self.k, self.parent, self.m = k, parent, {}
        self.vc = self.get('vc', cm=True); self.vm = self.get('vcm', cm=True)
    def get(self, key, cm=False, tile=None):
        if key not in self.m: self.m[key] = (CMesh if cm else Mesh)(f'L{self.k}_{key}', M[key]) if cm else Mesh(f'L{self.k}_{key}', M[key], tile=tile)
        return self.m[key]
    def finish(self):
        for key, mm in self.m.items(): mm.finish(self.parent, uv=key not in ('vc', 'vcm', 'books', 'light', 'warm', 'glass'))


C0, C1 = Lv(0, R0), Lv(1, R1)
WALLS = {}   # 淡出的外牆：每一面一個物件（WALL_<id>）


def wallmesh(wid, parent, dirv, key='plaster'):
    if wid not in WALLS: WALLS[wid] = (Mesh(f'WALL_{wid}', M[key]), parent, dirv)
    return WALLS[wid][0]


def wall_holes(m, axis, at, a0, a1, y0, y1, holes, t=T):
    """一道牆（axis 'x'：沿 x、z＝at；'z'：沿 z、x＝at），開口 holes＝[(a, b, ya, yb)]：牆拆成一塊一塊的方塊（開口上下、開口之間）"""
    def bx(a, b, ya, yb):
        if b - a < 1e-3 or yb - ya < 1e-3: return
        if axis == 'x': m.box(a, b, ya, yb, at - t / 2, at + t / 2)
        else: m.box(at - t / 2, at + t / 2, ya, yb, a, b)
    cuts = sorted(holes)
    x = a0
    for (a, b, ya, yb) in cuts:
        bx(x, a, y0, y1); bx(a, b, y0, ya); bx(a, b, yb, y1); x = b
    bx(x, a1, y0, y1)


def win_frame(c, axis, at, a, b, ya, yb, inward, mull=2):
    """窗框（深灰鋁框＋直櫺）：開口 a～b、ya～yb；inward＝朝室內的方向（+1／−1，沿牆的法線）"""
    d = at + inward * (T / 2 - 0.04)
    fr = c.get('frame')
    def bx(p0, p1, q0, q1):
        if axis == 'x': fr.box(p0, p1, q0, q1, d - 0.04, d + 0.04)
        else: fr.box(d - 0.04, d + 0.04, q0, q1, p0, p1)
    bx(a, a + 0.06, ya, yb); bx(b - 0.06, b, ya, yb); bx(a, b, ya, ya + 0.06); bx(a, b, yb - 0.06, yb)
    for k in range(1, mull + 1):
        u = a + (b - a) * k / (mull + 1); bx(u - 0.025, u + 0.025, ya, yb)
    bx(a, b, ya + (yb - ya) * 0.62 - 0.025, ya + (yb - ya) * 0.62 + 0.025)
    sill = c.get('trim')
    if axis == 'x': sill.box(a - 0.05, b + 0.05, ya - 0.04, ya, at + inward * (T / 2), at + inward * (T / 2 + 0.12))
    else: sill.box(min(at + inward * T / 2, at + inward * (T / 2 + 0.12)), max(at + inward * T / 2, at + inward * (T / 2 + 0.12)), ya - 0.04, ya, a - 0.05, b + 0.05)


# =====================================================================
# 一、地板、樓板、天花板
# =====================================================================
fl = C0.get('floor', tile=2.4)
for (xa, xb, za, zb) in ((XI0, -2.6, ZI0, ZI1), (2.6, XI1, ZI0, ZI1), (-2.6, 2.6, ZI0, BS['z0']), (-2.6, 2.6, V['z0'], ZI1)):
    fl.quad([(xa, 0, zb), (xb, 0, zb), (xb, 0, za), (xa, 0, za)])
cp = C0.get('carpet', tile=2.0)
cp.quad([(-2.6, 0.004, V['z0']), (2.6, 0.004, V['z0']), (2.6, 0.004, BS['z1']), (-2.6, 0.004, BS['z1'])])   # 中庭走道（照片 1）
fl.quad([(-2.6, 0.0, BS['z1']), (2.6, 0.0, BS['z1']), (2.6, 0.0, BS['z0']), (-2.6, 0.0, BS['z0'])])           # 台階下面（看不到，補洞）
# 展演廳：淺色人字拼木地板（半圓＋開口那一條）
#   扇形的頂點順序：圓心 → a0 → a1（朝上）。11-02 第一次烘焙寫成圓心 → a1 → a0，法線朝下：材質是雙面所以看得到，可是光照貼圖烘的是朝下那一面（0.001，整片黑；lm_probe 抓到）
pq = C0.get('parquet', tile=2.2); NR = 36
for i in range(NR):
    a0, a1 = PI * i / NR, PI * (i + 1) / NR
    pq.quad([(R['cx'], 0.002, R['cz']), (R['cx'] + R['r'] * math.cos(a0), 0.002, R['cz'] - R['r'] * math.sin(a0)), (R['cx'] + R['r'] * math.cos(a1), 0.002, R['cz'] - R['r'] * math.sin(a1))])
pq.quad([(R['open']['x0'], 0.002, ZI0 + 0.001), (R['open']['x1'], 0.002, ZI0 + 0.001), (R['open']['x1'], 0.002, Z0 - 0.001), (R['open']['x0'], 0.002, Z0 - 0.001)])


def slab_rects():
    out = [U['band'], U['north']] + U['wings'] + U.get('closed', [])
    return out


def cut_elev(r):
    """樓板讓出電梯井（和遊戲 B3.slabPieces 同一個規則）"""
    parts = [dict(r)]; h = EL
    nxt = []
    for q in parts:
        if h['x1'] <= q['x0'] or h['x0'] >= q['x1'] or h['z1'] <= q['z0'] or h['z0'] >= q['z1']: nxt.append(q); continue
        if h['z0'] > q['z0']: nxt.append(dict(q, z1=h['z0']))
        if h['z1'] < q['z1']: nxt.append(dict(q, z0=h['z1']))
        z0, z1 = max(q['z0'], h['z0']), min(q['z1'], h['z1'])
        if h['x0'] > q['x0']: nxt.append(dict(q, x1=h['x0'], z0=z0, z1=z1))
        if h['x1'] < q['x1']: nxt.append(dict(q, x0=h['x1'], z0=z0, z1=z1))
    return nxt


f1 = C1.get('parquet', tile=2.2); sl = C1.get('plaster', tile=3.0); cl0 = C0.get('ceil', tile=2.4)   # 二樓：人字拼木地板（第一版、2D 背景 ntu_library_2f 都是）
for r in slab_rects():
    for q in cut_elev(r):
        f1.quad([(q['x0'], Y1, q['z1']), (q['x1'], Y1, q['z1']), (q['x1'], Y1, q['z0']), (q['x0'], Y1, q['z0'])])
        cl0.quad([(q['x0'], Y1 - ST, q['z0']), (q['x1'], Y1 - ST, q['z0']), (q['x1'], Y1 - ST, q['z1']), (q['x0'], Y1 - ST, q['z1'])])   # 一樓的天花板＝二樓樓板底面
# 樓板的邊（面向挑空的那幾邊）：白色收邊
edge = C1.get('trim')
for (x0_, z0_, x1_, z1_) in LAY['rails']:
    if abs(z1_ - z0_) < 1e-6: edge.box(min(x0_, x1_), max(x0_, x1_), Y1 - ST, Y1 + 0.02, z0_ - 0.06, z0_ + 0.06)
    else: edge.box(x0_ - 0.06, x0_ + 0.06, Y1 - ST, Y1 + 0.02, min(z0_, z1_), max(z0_, z1_))
# 一樓天花板（二樓樓板底下）的崁燈
lt0 = C0.get('light')
for r in slab_rects():
    nx, nz = max(1, int((r['x1'] - r['x0']) / 2.4)), max(1, int((r['z1'] - r['z0']) / 2.4))
    for i in range(nx):
        for j in range(nz):
            x = r['x0'] + (i + 0.5) * (r['x1'] - r['x0']) / nx; z = r['z0'] + (j + 0.5) * (r['z1'] - r['z0']) / nz
            if EL['x0'] - 0.3 < x < EL['x1'] + 0.3 and EL['z0'] - 0.3 < z < EL['z1'] + 0.3: continue
            lt0.cyl((x, Y1 - ST - 0.006, z), (x, Y1 - ST - 0.001, z), 0.09, seg=10)
# 屋頂（9.6）：整片天花板＋中庭、台階上方的方格天花板（照片 1：一格一格往上凹、每格中間一片燈）
cl1 = C1.get('ceil', tile=2.4); lt1 = C1.get('light'); tr1 = C1.get('trim')
CX0, CX1, CZ0, CZ1 = -3.7, 3.7, U['north']['z1'], U['band']['z0']                          # 方格天花板的範圍（台階上方的挑空）
for (xa, xb, za, zb) in ((XI0, CX0, ZI0, ZI1), (CX1, XI1, ZI0, ZI1), (CX0, CX1, ZI0, CZ0), (CX0, CX1, CZ1, ZI1)):
    cl1.quad([(xa, RY, za), (xb, RY, za), (xb, RY, zb), (xa, RY, zb)])
nxc, nzc = 4, 8
for i in range(nxc):
    for j in range(nzc):
        xa = CX0 + (CX1 - CX0) * i / nxc; xb = CX0 + (CX1 - CX0) * (i + 1) / nxc; za = CZ0 + (CZ1 - CZ0) * j / nzc; zb = CZ0 + (CZ1 - CZ0) * (j + 1) / nzc
        cl1.quad([(xa + 0.12, RY + 0.45, za + 0.12), (xb - 0.12, RY + 0.45, za + 0.12), (xb - 0.12, RY + 0.45, zb - 0.12), (xa + 0.12, RY + 0.45, zb - 0.12)])   # 凹進去的頂
        for (p, q) in (((xa, za), (xb, za)), ((xb, za), (xb, zb)), ((xb, zb), (xa, zb)), ((xa, zb), (xa, za))):   # 四邊的斜面（往上收 12 cm）
            cx_, cz_ = (xa + xb) / 2, (za + zb) / 2
            pi_ = ((p[0] + (cx_ - p[0]) * 0.24 / max(0.24, abs(cx_ - p[0]) * 2)) if False else p[0], p[1])
            ins = lambda P: (P[0] + (0.12 if P[0] < cx_ else -0.12), P[1] + (0.12 if P[1] < cz_ else -0.12))
            pa, pb = ins(p), ins(q)
            cl1.quad([(p[0], RY, p[1]), (q[0], RY, q[1]), (pb[0], RY + 0.45, pb[1]), (pa[0], RY + 0.45, pa[1])])
        lt1.box((xa + xb) / 2 - 0.35, (xa + xb) / 2 + 0.35, RY + 0.43, RY + 0.44, (za + zb) / 2 - 0.35, (za + zb) / 2 + 0.35)
    tr1.box(CX0 + (CX1 - CX0) * i / nxc - 0.06, CX0 + (CX1 - CX0) * i / nxc + 0.06, RY - 0.02, RY + 0.02, CZ0, CZ1)
for x in (-11.0, -8.0, 8.0, 11.0):                                                            # 兩翼屋頂的燈條
    for z in [ZI0 + 1.6 + 3.0 * k for k in range(int((ZI1 - ZI0 - 2) / 3.0) + 1)]:
        lt1.box(x - 0.6, x + 0.6, RY - 0.012, RY - 0.004, z - 0.15, z + 0.15)

# =====================================================================
# 二、柱子（中庭四角＋北側連廊下兩根）：一樓花崗石、二樓粉光，到屋頂
# =====================================================================
COLS = [(-5.2, U['band']['z1']), (5.2, U['band']['z1']), (-5.2, GT['z']), (5.2, GT['z']), (-5.2, U['north']['z1']), (5.2, U['north']['z1'])]
for (x, z) in COLS:
    C0.get('stone', tile=1.4).cyl((x, 0, z), (x, Y1 - ST, z), 0.3, seg=20); C0.get('stone', tile=1.4).cyl((x, 0, z), (x, 0.12, z), 0.36, seg=20)
    C1.get('plaster', tile=3.0).cyl((x, Y1, z), (x, RY, z), 0.26, seg=20)

# =====================================================================
# 三、外牆（每一層每一面一個 WALL_ 物件，淡出）＋窗、門
# =====================================================================
WZ = LAY['windowsV2']['xWallZ']; b1z = LAY['b1Door']['z']
for (lv, par, y0, y1, wy0, wy1) in ((0, R0, 0.0, Y1, 1.1, 3.5), (1, R1, Y1, RY, Y1 + 1.0, Y1 + 3.4)):
    c = C0 if lv == 0 else C1
    # 西牆：窗（一樓 z −2.4 那一扇換成往 B1 的樓梯間門）
    holes = []
    for z in WZ:
        if lv == 0 and abs(z - b1z) < 0.6: holes.append((z - 0.55, z + 0.55, 0.0, 2.3)); continue
        holes.append((z - 0.8, z + 0.8, wy0, wy1))
    wall_holes(wallmesh(f'W{lv}', par, [1, 0, 0]), 'z', X0, Z0, Z1, y0, y1, holes)
    for (a, b, ya, yb) in holes:
        if yb - ya > 2.2 and ya > 0.5: win_frame(c, 'z', X0, a, b, ya, yb, +1)
    # 東牆：北段（數位媒體區、二樓多媒體中心）開窗；南段照第一版：二樓研究小間、樓梯間的門
    holes = [(z - 0.8, z + 0.8, wy0, wy1) for z in WZ if z < -9.4]
    if lv == 1:
        for d in (LAY['stairDoor'], next(q for q in LAY['doors'] if q['id'] == 'carrels')): holes.append((d['z'] - 0.6, d['z'] + 0.6, Y1, Y1 + 2.3))
    wall_holes(wallmesh(f'E{lv}', par, [-1, 0, 0]), 'z', X1, Z0, Z1, y0, y1, holes)
    for (a, b, ya, yb) in holes:
        if ya > y0 + 0.5: win_frame(c, 'z', X1, a, b, ya, yb, -1)
    # 北牆：中間是展演廳的開口（一樓、二樓都打通）
    for sx in (-1, 1):
        a, b = sorted((sx * R['open']['x1'], sx * X1))
        wall_holes(wallmesh(f'N{lv}{"W" if sx < 0 else "E"}', par, [0, 0, 1]), 'x', Z0, a, b, y0, y1, [])
    # 南面兩翼（門廳兩旁）
    for sx in (-1, 1):
        a, b = sorted((sx * V['x1'], sx * X1))
        wall_holes(wallmesh(f'S{lv}{"W" if sx < 0 else "E"}', par, [0, 0, -1]), 'x', Z1, a, b, y0, y1, [((a + b) / 2 - 1.2, (a + b) / 2 + 1.2, wy0, wy1)])
        win_frame(c, 'x', Z1, (a + b) / 2 - 1.2, (a + b) / 2 + 1.2, wy0, wy1, -1)
    # 牆腳的踢腳板
    kk = c.get('stone', tile=1.4); yk = y0
    kk.box(XI0, XI0 + 0.02, yk, yk + 0.12, ZI0, ZI1); kk.box(XI1 - 0.02, XI1, yk, yk + 0.12, ZI0, ZI1)
# 門板：B1 樓梯間（一樓西牆）、二樓樓梯間（東牆）、研究小間（東牆）、多媒體中心（二樓隔間）、館員辦公室（一樓）
def door_leaf(c, axis, at, cpos, y0, inward, w=1.1, h=2.3, col='#6e7377'):
    d = at + inward * (T / 2 + 0.01)
    if axis == 'z': c.vm.cbox(min(d, d + inward * 0.05), max(d, d + inward * 0.05), y0, y0 + h, cpos - w / 2, cpos + w / 2, col)
    else: c.vm.cbox(cpos - w / 2, cpos + w / 2, y0, y0 + h, min(d, d + inward * 0.05), max(d, d + inward * 0.05), col)
    hx = cpos + w * 0.32
    if axis == 'z': c.vm.cbox(d + inward * 0.05, d + inward * 0.09, y0 + 1.0, y0 + 1.06, hx - 0.12, hx + 0.12, '#c9ccd0')
    else: c.vm.cbox(hx - 0.12, hx + 0.12, y0 + 1.0, y0 + 1.06, min(d + inward * 0.05, d + inward * 0.09), max(d + inward * 0.05, d + inward * 0.09), '#c9ccd0')
door_leaf(C0, 'z', X0, b1z, 0.0, +1)
door_leaf(C1, 'z', X1, LAY['stairDoor']['z'], Y1, -1)
cr = next(q for q in LAY['doors'] if q['id'] == 'carrels'); door_leaf(C1, 'z', X1, cr['z'], Y1, -1, col='#8a6a4a')
# 館員辦公室（一樓東南、辦公室隔間牆上，門朝北）、二樓北牆的討論室 225、226（11-02 二樓平面圖；關著）：遊戲的備用門框在正式模型載入後會藏起來，門要畫在模型裡
OW = next((f for f in LAY['furniture'] if f['type'] == 'officeWall'), None)
for dd in LAY['doors']:
    if dd['id'] == 'staff' and OW: door_leaf(C0, 'x', OW['z'] + 0.05, dd['x'], 0.0, -1, w=1.0, col='#6e5a48')   # 牆北面 z−0.06：門片貼在北面
    elif dd['id'] in ('disc225', 'disc226'): door_leaf(C1, 'x', Z0, dd['x'], Y1, +1, w=1.0, col='#8a6a4a'); C1.get('glass').box(dd['x'] - 0.2, dd['x'] + 0.2, Y1 + 1.3, Y1 + 2.0, Z0 + T / 2 + 0.055, Z0 + T / 2 + 0.065)   # 門上的小窗
# 正面：門廳的挑高玻璃帷幕（一樓那段 L0、二樓那段 L1）＋兩扇自動門
for (c, ya, yb) in ((C0, 0.0, Y1), (C1, Y1, RY - 0.2)):
    gl = c.get('glass'); fr = c.get('frame')
    gl.quad([(V['x0'], ya, Z1 - 0.03), (V['x1'], ya, Z1 - 0.03), (V['x1'], yb, Z1 - 0.03), (V['x0'], yb, Z1 - 0.03)])
    for k in range(7):
        x = V['x0'] + (V['x1'] - V['x0']) * k / 6; fr.box(x - 0.06, x + 0.06, ya, yb, Z1 - 0.1, Z1 + 0.02)
    for y in [v for v in (3.0, Y1, Y1 + 2.4, RY - 0.2) if ya - 1e-6 <= v <= yb + 1e-6]: fr.box(V['x0'], V['x1'], y - 0.06, y + 0.06, Z1 - 0.1, Z1 + 0.02)
C0.vm.cbox(-1.6, 1.6, 2.5, 2.62, Z1 - 0.2, Z1 - 0.05, '#4a4e52')   # 自動門的門頭
# 門廳兩側的木作牆（3 m）
for sx in (-1, 1):
    C0.get('walnut', tile=1.2).box(sx * V['x1'] - 0.1, sx * V['x1'] + 0.1, 0.0, 3.0, V['z0'], V['z1'])

# =====================================================================
# 四、展演廳：半圓的牆（一樓高窗、二樓高側窗）、深灰石材牆裙、天花板、弧形展示櫃、弧形軌道燈、長椅
# =====================================================================
NF = 15                                            # 一段 12°；窗在 18°、54°、90°、126°、162° 那幾段（＝layout 的 rotundaDeg）
WIN_AT = {1, 4, 7, 10, 13}
def facet(i):
    a0, a1 = PI * i / NF, PI * (i + 1) / NF
    p0 = (R['cx'] + R['r'] * math.cos(a0), R['cz'] - R['r'] * math.sin(a0)); p1 = (R['cx'] + R['r'] * math.cos(a1), R['cz'] - R['r'] * math.sin(a1))
    return a0, a1, p0, p1
def facet_quad(m, p0, p1, ya, yb, off=0.0, ua=0.0, ub=1.0):
    """弧牆的一段（p0→p1 的直線段），往外推 off；室內那一面（法線朝圓心）＋外面那一面（法線朝外，厚度 T）。
    11-02 第二次改：原本兩面的頂點順序都反了（室內那一面的法線朝外）。烘焙把室內那一面當成背對室內（和 dir 反方向）不分像素、收成一點，
    遊戲裡（雙面材質）看到的就是那一點的光——一片一片的平三角（第一次只修了 dir 的東西對調，沒修到這裡）。"""
    ax, az = p0[0] + (p1[0] - p0[0]) * ua, p0[1] + (p1[1] - p0[1]) * ua
    bx_, bz = p0[0] + (p1[0] - p0[0]) * ub, p0[1] + (p1[1] - p0[1]) * ub
    mx, mz = (ax + bx_) / 2 - R['cx'], (az + bz) / 2 - R['cz']; n = math.hypot(mx, mz); ox, oz = mx / n * off, mz / n * off
    m.quad([(bx_ + ox, ya, bz + oz), (ax + ox, ya, az + oz), (ax + ox, yb, az + oz), (bx_ + ox, yb, bz + oz)])
    m.quad([(ax + mx / n * (off + T), ya, az + mz / n * (off + T)), (bx_ + mx / n * (off + T), ya, bz + mz / n * (off + T)), (bx_ + mx / n * (off + T), yb, bz + mz / n * (off + T)), (ax + mx / n * (off + T), yb, az + mz / n * (off + T))])
def rot_group(i): return 'RE' if i < 5 else ('RN' if i < 10 else 'RW')   # facet(i) 從 +x（東）開始：i < 5 是東側。11-02 第一次烘焙東西寫反了→ dir 朝外：朝室內的面被當成背面縮成一點（光照貼圖一片一片的平三角），遊戲裡鏡頭在室內時兩側弧牆反而淡出
RDIR = {'RW': [0.7, 0, 0.5], 'RN': [0, 0, 1], 'RE': [-0.7, 0, 0.5]}
TIERS = ((0, R0, 0.0, Y1, 0.9, 4.2), (1, R1, Y1, RY, 6.0, 8.8))
for (lv, par, y0, y1, wa, wb) in TIERS:
    c = C0 if lv == 0 else C1
    for i in range(NF):
        a0, a1, p0, p1 = facet(i); g = rot_group(i); m = wallmesh(f'{g}{lv}', par, RDIR[g])
        if i in WIN_AT:
            ua, ub = 0.12, 0.88
            facet_quad(m, p0, p1, y0, wa); facet_quad(m, p0, p1, wb, y1)
            facet_quad(m, p0, p1, wa, wb, ua=0.0, ub=ua); facet_quad(m, p0, p1, wa, wb, ua=ub, ub=1.0)
            # 窗框（深灰）＋窗台
            fr = c.get('frame'); A = (p0[0] + (p1[0] - p0[0]) * ua, p0[1] + (p1[1] - p0[1]) * ua); Bq = (p0[0] + (p1[0] - p0[0]) * ub, p0[1] + (p1[1] - p0[1]) * ub)
            for (u0, u1) in ((ua, ua + 0.04), (ub - 0.04, ub), (0.49, 0.51)): facet_quad(fr, p0, p1, wa, wb, off=0.02, ua=u0, ub=u1)
            for yy in (wa, (wa + wb) / 2, wb - 0.05): facet_quad(fr, p0, p1, yy, yy + 0.05, off=0.02, ua=ua, ub=ub)
        else:
            facet_quad(m, p0, p1, y0, y1)
        if lv == 0:                                    # 深灰石材牆裙（照片 2：窗台以下）
            facet_quad(c.get('stone', tile=1.4), p0, p1, 0.0, 0.9, off=-0.012)
# 展演廳的天花板（半圓）＋中間一圈燈：頂點順序圓心 → a1 → a0（朝下；和地板相反，11-02 第一次烘焙寫反了）
for i in range(NR):
    a0, a1 = PI * i / NR, PI * (i + 1) / NR
    C1.get('ceil', tile=2.4).quad([(R['cx'], RY, R['cz']), (R['cx'] + R['r'] * math.cos(a1), RY, R['cz'] - R['r'] * math.sin(a1)), (R['cx'] + R['r'] * math.cos(a0), RY, R['cz'] - R['r'] * math.sin(a0))])
# 弧形軌道燈（照片 2）：半徑 3.4、離地 6.6，吊線六條，燈頭一顆一顆
RR, RYL = 3.4, 6.6
for i in range(24):
    a0, a1 = PI * (0.05 + 0.9 * i / 24), PI * (0.05 + 0.9 * (i + 1) / 24)
    C1.vm.cbox(0, 0, 0, 0, 0, 0, '#202326') if False else None
    ccyl(C1.vm, (R['cx'] + RR * math.cos(a0), RYL, R['cz'] - RR * math.sin(a0)), (R['cx'] + RR * math.cos(a1), RYL, R['cz'] - RR * math.sin(a1)), 0.035, '#2a2d30', seg=6)
    if i % 3 == 1:
        am = (a0 + a1) / 2; hx, hz = R['cx'] + RR * math.cos(am), R['cz'] - RR * math.sin(am)
        ccyl(C1.vm, (hx, RYL - 0.02, hz), (hx, RYL - 0.22, hz), 0.05, '#2a2d30', seg=8); C1.get('light').cyl((hx, RYL - 0.225, hz), (hx, RYL - 0.22, hz), 0.045, seg=8)
for k in range(6):
    am = PI * (0.1 + 0.8 * k / 5); hx, hz = R['cx'] + RR * math.cos(am), R['cz'] - RR * math.sin(am)
    ccyl(C1.vm, (hx, RYL, hz), (hx, RY, hz), 0.006, '#8a8e92', seg=4)
# 弧形矮展示櫃（照片 2：木頭櫃、上面一格一格的玻璃展示格、裡面亮燈）
CR0, CR1, CA0, CA1 = 3.5, 4.2, PI * 0.30, PI * 0.70
NC = 10
for i in range(NC):
    a0, a1 = CA0 + (CA1 - CA0) * i / NC, CA0 + (CA1 - CA0) * (i + 1) / NC
    P = lambda r, a, y: (R['cx'] + r * math.cos(a), y, R['cz'] - r * math.sin(a))
    wd = C0.get('wood', tile=1.6)
    wd.quad([P(CR0, a0, 0.0), P(CR0, a1, 0.0), P(CR0, a1, 0.62), P(CR0, a0, 0.62)]); wd.quad([P(CR1, a1, 0.0), P(CR1, a0, 0.0), P(CR1, a0, 0.62), P(CR1, a1, 0.62)])
    wd.quad([P(CR0, a0, 0.62), P(CR0, a1, 0.62), P(CR1, a1, 0.62), P(CR1, a0, 0.62)])
    C0.get('glass').quad([P(CR0 + 0.04, a0, 0.62), P(CR0 + 0.04, a1, 0.62), P(CR0 + 0.04, a1, 1.0), P(CR0 + 0.04, a0, 1.0)])
    C0.get('glass').quad([P(CR0 + 0.04, a0, 1.0), P(CR0 + 0.04, a1, 1.0), P(CR1 - 0.04, a1, 1.0), P(CR1 - 0.04, a0, 1.0)])
    C0.get('warm').quad([P(CR0 + 0.1, a0, 0.97), P(CR0 + 0.1, a1, 0.97), P(CR1 - 0.1, a1, 0.97), P(CR1 - 0.1, a0, 0.97)])
    am = (a0 + a1) / 2; ox, oz = R['cx'] + (CR0 + CR1) / 2 * math.cos(am), R['cz'] - (CR0 + CR1) / 2 * math.sin(am)
    C0.get('books', cm=True).cbox(ox - 0.12, ox + 0.12, 0.63, 0.63 + rng.uniform(0.06, 0.2), oz - 0.09, oz + 0.09, rng.choice(['#8c3b47', '#2f5d50', '#d9c9a0', '#4a6c8c']))
for (a, b) in ((CA0, CA0), (CA1, CA1)):
    for (r0_, r1_) in ((CR0, CR1),):
        P = lambda r, a, y: (R['cx'] + r * math.cos(a), y, R['cz'] - r * math.sin(a))
        C0.get('wood', tile=1.6).quad([P(r0_, a, 0.0), P(r1_, a, 0.0), P(r1_, a, 0.62), P(r0_, a, 0.62)])
# 展演廳的兩張矮長椅
for f in [q for q in LAY['furniture'] if q.get('kind') == 'benchLow']:
    C0.get('wood', tile=1.6).box(f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, 0.38, 0.45, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2)
    for dx in (-f['w'] / 2 + 0.12, f['w'] / 2 - 0.12): C0.vm.cbox(f['x'] + dx - 0.04, f['x'] + dx + 0.04, 0.0, 0.38, f['z'] - f['d'] / 2 + 0.05, f['z'] + f['d'] / 2 - 0.05, '#2a2d30')

# =====================================================================
# 五、台階書牆（照片 1）：中間走的樓梯（蜂蜜色木頭、止滑條）、兩旁坐的大階梯（踏面木頭、立面是書架）
# =====================================================================
wd = C0.get('wood', tile=1.6); wn = C0.get('walnut', tile=1.2); bk = C0.get('books', cm=True)
for k in range(K['risers']):                                     # 中間走的那一跑：一階一塊（實心到地面看不到的那一段省掉：只做踏面＋踢面）
    z1 = BS['z1'] - k * K['tread']; y = (k + 1) * K['rise']
    wd.box(K['x0'], K['x1'], y - 0.04, y, z1 - K['tread'], z1)                                         # 踏面
    wn.box(K['x0'], K['x1'], y - K['rise'], y - 0.04, z1 - 0.025, z1)                                  # 踢面（深色）
    C0.vm.cbox(K['x0'] + 0.03, K['x1'] - 0.03, y - 0.001, y + 0.003, z1 - 0.06, z1 - 0.02, '#3a3d41')   # 止滑條
for sx in (-1, 1):
    xa, xb = (BS['x0'], K['x0']) if sx < 0 else (K['x1'], BS['x1'])
    for k in range(SE['risers']):
        z1 = BS['z1'] - k * SE['tread']; y = (k + 1) * SE['rise']
        wd.box(xa, xb, y - 0.045, y, z1 - SE['tread'], z1 + 0.02)                                          # 踏面（坐的地方，前緣凸出 2 cm）
        # 立面：書架（每 0.6 m 一格，格子裡放書，背板深色）
        nb = max(2, int((xb - xa) / 0.6)); cw = (xb - xa) / nb
        wn.box(xa, xb, y - SE['rise'], y - 0.045, z1 - 0.32, z1 - 0.30)                                    # 背板
        for j in range(nb + 1):
            xx = xa + j * cw; wd.box(xx - 0.02, xx + 0.02, y - SE['rise'], y - 0.045, z1 - 0.32, z1)      # 隔板
        wd.box(xa, xb, y - SE['rise'], y - SE['rise'] + 0.03, z1 - 0.32, z1)                               # 格子底板
        for j in range(nb):
            x = xa + j * cw + 0.04
            while x < xa + (j + 1) * cw - 0.06:
                bw = rng.uniform(0.025, 0.055); bh = rng.uniform(0.2, 0.32) if SE['rise'] > 0.36 else 0.18
                if rng.random() < 0.88: bk.cbox(x, x + bw, y - SE['rise'] + 0.03, y - SE['rise'] + 0.03 + bh, z1 - 0.29, z1 - 0.06, rng.choice(['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6', '#3e4a5c', '#6e2f2f', '#5d7a4a']))
                x += bw + 0.004
        # 踏面底下到下一階的實心（看得到的側面：書架後面的木箱）
        wd.box(xa, xb, 0.0, y - SE['rise'], z1 - SE['tread'], z1 - 0.32) if k > 0 else None
    # 側面（x ±3.6）：一階一階的輪廓（胡桃木）
    xs = BS['x0'] if sx < 0 else BS['x1']
    for k in range(SE['risers']):
        z1 = BS['z1'] - k * SE['tread']; y = (k + 1) * SE['rise']
        wn.box(xs - 0.03, xs + 0.03, 0.0, y, z1 - SE['tread'], z1)
# 中間那一跑下面（兩側坐的階梯之間）：實心，兩側和走的樓梯接起來
for k in range(K['risers']):
    z1 = BS['z1'] - k * K['tread']; y = (k + 1) * K['rise']
    for xs in (K['x0'], K['x1']): wn.box(xs - 0.02, xs + 0.02, 0.0, y - 0.04, z1 - K['tread'], z1)
# 台階背面（最上面一階後面：一樓那一側是白牆＋踢腳板）
C0.get('plaster', tile=3.0).box(BS['x0'], BS['x1'], 0.0, Y1 - ST, BS['z0'] - 0.12, BS['z0'])
# 中間那一跑兩側的不鏽鋼扶手（立柱＋扶手，跟著斜度）
for xs in (K['x0'] + 0.06, K['x1'] - 0.06):
    za, zb = BS['z1'] - 0.15, BS['z0'] + 0.3; ya, yb = 0.9, Y1 + 0.9
    ccyl(C0.vm, (xs, ya, za), (xs, yb, zb), 0.022, '#b8bcc0', seg=8)
    for k in range(0, K['risers'] + 1, 4):
        z = BS['z1'] - k * K['tread'] - 0.15; y = min(Y1, (k + 1) * K['rise'])
        ccyl(C0.vm, (xs, y, z), (xs, y + 0.9, z), 0.016, '#b8bcc0', seg=6)
# 坐墊（幾個人留下的，照片：有人坐在階梯上看書）
for (sx, k, dx) in ((-1, 2, 0.5), (1, 3, 1.1), (-1, 5, 1.5), (1, 7, 0.4)):
    x = (K['x0'] - dx) if sx < 0 else (K['x1'] + dx); z1 = BS['z1'] - k * SE['tread']; y = (k + 1) * SE['rise']
    rbox(C0.vc, rot(x, z1 - SE['tread'] / 2, 0.0), -0.22, 0.22, y, y + 0.06, -0.22, 0.22, rng.choice(['#a8463c', '#3e5a7a', '#c9a24f']), r=0.02, seg=1)

# =====================================================================
# 六、二樓的玻璃欄杆（挑空的邊）＋扶手
# =====================================================================
for (x0_, z0_, x1_, z1_) in LAY['rails']:
    gl = C1.get('glass'); horiz = abs(z1_ - z0_) < 1e-6
    if horiz: gl.box(min(x0_, x1_), max(x0_, x1_), Y1 + 0.08, Y1 + 1.0, z0_ - 0.008, z0_ + 0.008)
    else: gl.box(x0_ - 0.008, x0_ + 0.008, Y1 + 0.08, Y1 + 1.0, min(z0_, z1_), max(z0_, z1_))
    if horiz: C1.vm.cbox(min(x0_, x1_), max(x0_, x1_), Y1 + 1.0, Y1 + 1.06, z0_ - 0.03, z0_ + 0.03, '#b8bcc0')
    else: C1.vm.cbox(x0_ - 0.03, x0_ + 0.03, Y1 + 1.0, Y1 + 1.06, min(z0_, z1_), max(z0_, z1_), '#b8bcc0')

# =====================================================================
# 七、二樓多媒體中心（整修中、關著）：隔間牆＋門
# =====================================================================
for cl in U.get('closed', []):
    wm = wallmesh('MEDIA_S', R1, [0, 0, 1]); md = next(q for q in LAY['doors'] if q['id'] == 'media')
    wall_holes(wm, 'x', cl['z1'], cl['x0'], cl['x1'], Y1, RY, [(md['x'] - 0.6, md['x'] + 0.6, Y1, Y1 + 2.3)], t=0.15)
    door_leaf(C1, 'x', cl['z1'], md['x'], Y1, +1, w=1.2, col='#8a6a4a')
    wall_holes(wallmesh('MEDIA_W', R1, [-1, 0, 0]), 'z', cl['x0'], cl['z0'], cl['z1'], Y1, RY, [], t=0.15)

# =====================================================================
# 八、家具（第一版的種類照第一版的位置；第二版新加的）
# =====================================================================
CHAIRS = {0: [], 1: []}; TCHAIRS = {0: [], 1: []}   # instancing：木椅、辦公椅
LAMPS = {0: [], 1: []}   # 二樓長桌的綠色銀行燈（instancing）
# 室內的大葉盆栽（琴葉榕一類）：樹幹＋幾團葉子（深色芯外面一圈葉片卡）——和 B1 下沉中庭、118 巷的大樹同一套（tools/blender/plants.py 的葉子貼圖）；
#   第一版程序化的「幾根細枝」從畫面上看像枯枝。葉子的材質名有 leaf：遊戲擋到鏡頭時網點透空（library_hall_v2.js 的 seeThru）。
PLM = {}
def pmesh(k, kind):
    if not PLM:
        try:
            import plants as PL
            P = PL.materials('lh2_'); PLM.update(leaf=P['leaf_small'], bark=P['bark'])
        except Exception as ex:   # noqa: BLE001
            print('plants', ex); PLM.update(leaf=L.flat('lh2_leaf_small', '#46683a', rough=0.8), bark=L.flat('lh2_bark', '#5a4a3c', rough=0.9))
        PLM['core'] = L.flat('lh2_leaf_core', '#2c4325', rough=0.98)
    key = (k, kind)
    if key not in PL_MESH: PL_MESH[key] = Mesh(f'L{k}_lh2_plant_{kind}', PLM[kind])
    return PL_MESH[key]
PL_MESH = {}
def leafy(k, x, y0, z, r, seed, h=1.55):
    rr = random.Random(seed); cards, bark, core = pmesh(k, 'leaf'), pmesh(k, 'bark'), pmesh(k, 'core')
    def card(px, py, pz, sz, yaw, tilt):
        ca, sa = math.cos(yaw), math.sin(yaw)
        P = lambda du, dv: (px + ca * du, py + dv + tilt * du, pz + sa * du)
        fc = cards.bm.faces.new([cards.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
        uvl = cards.bm.loops.layers.uv.verify()
        for lp, uv in zip(fc.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
    top = y0 + h
    bark.cyl((x, y0, z), (x, top - 0.35, z), 0.035, seg=6, r2=0.022)
    tufts = []
    for j in range(4):
        a_ = j * PI / 2 + rr.uniform(-0.5, 0.5); yb = y0 + h * rr.uniform(0.35, 0.55); d_ = rr.uniform(0.18, 0.3)
        tx, ty, tz = x + math.cos(a_) * d_, y0 + h * rr.uniform(0.55, 0.8), z + math.sin(a_) * d_
        bark.cyl((x, yb, z), (tx, ty, tz), 0.018, seg=5, r2=0.012); tufts.append((tx, ty, tz, rr.uniform(0.24, 0.32)))
    tufts.append((x, top - 0.2, z, 0.3))
    for (cx, cy, cz, rad) in tufts:
        v0 = set(core.bm.verts); core.ell((cx, cy, cz), rad * 0.55, rad * 0.5, rad * 0.55, seg=7, rings=4)
        c0 = g2b(cx, cy, cz)
        for vv in core.bm.verts:
            if vv not in v0: vv.co = c0 + (vv.co - c0) * rr.uniform(0.85, 1.08)
        for _ in range(int(30 * rad / 0.3)):
            a_ = rr.uniform(0, 2 * PI); e_ = math.asin(rr.uniform(-0.6, 1.0)); q = rr.uniform(0.75, 1.0)
            card(cx + rad * q * math.cos(a_) * math.cos(e_), cy + rad * 0.85 * q * math.sin(e_), cz + rad * q * math.sin(a_) * math.cos(e_), rr.uniform(0.2, 0.3), rr.uniform(0, PI), rr.uniform(-0.6, 0.6))


def lvl(f): return (C0, 0.0) if not f.get('lv') else (C1, Y1)
def bookrow(c, x0, x1, y, z, depth, facing, h=0.3):
    x = x0
    while x < x1 - 0.03:
        bw = rng.uniform(0.022, 0.05)
        if rng.random() < 0.9: c.get('books', cm=True).cbox(x, x + bw, y, y + rng.uniform(h * 0.7, h), z - depth / 2, z + depth / 2, rng.choice(['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6', '#3e4a5c']))
        x += bw + 0.003
def shelf(c, cx, cz, w, ry, y0, H=2.0, Dp=0.4):
    T_ = rot(cx, cz, ry)
    rbox(c.vc, T_, -w / 2, w / 2, y0, y0 + H, -Dp / 2, -Dp / 2 + 0.03, '#5a3e2a')
    for lx in (-w / 2, w / 2): rbox(c.vc, T_, lx - 0.02, lx + 0.02, y0, y0 + H, -Dp / 2, Dp / 2, '#6b4a32')
    for k in range(5):
        yy = y0 + 0.08 + k * (H - 0.1) / 4.6; rbox(c.vc, T_, -w / 2, w / 2, yy, yy + 0.025, -Dp / 2, Dp / 2, '#6b4a32')
        if k < 4:
            x = -w / 2 + 0.04
            while x < w / 2 - 0.05:
                bw = rng.uniform(0.025, 0.05); bh = rng.uniform(0.22, 0.32)
                if rng.random() < 0.9: rbox(c.get('books', cm=True), T_, x, x + bw, yy + 0.025, yy + 0.025 + bh, -Dp / 2 + 0.05, Dp / 2 - 0.04, rng.choice(['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6']))
                x += bw + 0.003
def banker_lamp_parts(t):
    """綠色銀行燈（2D 背景 ntu_library_2f、B1 自習室同一款）：在原點畫一份，inst() 用 instancing 放到每張長桌的中線"""
    ccyl(t.vm, (0, 0.76, 0), (0, 0.775, 0), 0.06, '#b08a3a', seg=10)
    ccyl(t.vm, (0, 0.775, 0), (0, 0.99, 0), 0.008, '#b08a3a', seg=6)
    y0, r, n = 0.99, 0.06, 8
    arc = [(r * math.cos(PI * k / n), r * math.sin(PI * k / n)) for k in range(n + 1)]
    for (u0, v0), (u1, v1) in zip(arc, arc[1:]):
        t.vm.poly([(-0.14, y0 + v0, u0), (0.14, y0 + v0, u0), (0.14, y0 + v1, u1), (-0.14, y0 + v1, u1)], '#2f5d43')
        t.vm.poly([(-0.14, y0 + v1, u1), (0.14, y0 + v1, u1), (0.14, y0 + v0, u0), (-0.14, y0 + v0, u0)], '#2f5d43')
    for xe in (-0.14, 0.14): t.vm.poly([(xe, y0 + v, u) for (u, v) in arc], '#2f5d43'); t.vm.poly([(xe, y0 + v, u) for (u, v) in reversed(arc)], '#2f5d43')


def stack(c, cx, cz, w, y0, H=2.1, D=0.62, cap='#888888'):
    """二樓的雙面書架（11-02 二樓平面圖：西半邊黃色＝人社中日韓文、東半邊藍色＝人社西文）：淺灰鋼架、中間背板、
    兩面各四層書（一叢一叢的書：寬 6～14 cm 一塊、顏色不同，三角形是一本一本畫的三分之一）、兩端是平面圖顏色的端板（索書號是遊戲畫的字）"""
    x0, x1, z0, z1 = cx - w / 2, cx + w / 2, cz - D / 2, cz + D / 2
    c.vm.cbox(x0, x1, y0, y0 + 0.08, z0 + 0.02, z1 - 0.02, '#4a4e52')                      # 踢腳
    c.vm.cbox(x0, x1, y0 + 0.08, y0 + H, cz - 0.012, cz + 0.012, '#c3c7cb')                # 中間背板
    c.vm.cbox(x0, x1, y0 + H - 0.03, y0 + H, z0, z1, '#c3c7cb')                             # 頂板
    n = max(2, int(round(w / 1.0)))
    for i in range(n + 1):                                                                  # 立柱（每 1 m 一節）
        xx = x0 + i * w / n; c.vm.cbox(xx - 0.015, xx + 0.015, y0 + 0.08, y0 + H - 0.03, z0, z1, '#b5b9bd')
    for k in range(5):
        yy = y0 + 0.08 + k * (H - 0.16) / 4.4; c.vm.cbox(x0, x1, yy, yy + 0.02, z0, z1, '#c9cdd1')
        if k == 4: continue
        for s in (-1, 1):
            za, zb = (cz + 0.02, z1 - 0.03) if s > 0 else (z0 + 0.03, cz - 0.02)
            x = x0 + 0.03
            while x < x1 - 0.08:
                bw = rng.uniform(0.06, 0.14); bh = rng.uniform(0.2, 0.3)
                if rng.random() < 0.88: c.get('books', cm=True).cbox(x, min(x + bw, x1 - 0.03), yy + 0.02, yy + 0.02 + bh, za, zb, rng.choice(['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6', '#3e4a5c', '#5e6b45']))
                x += bw + 0.004
    for e in (-1, 1):                                                                        # 端板（平面圖的顏色）
        xe = cx + e * (w / 2 + 0.015); c.vc.cbox(xe - 0.015, xe + 0.015, y0, y0 + H, z0 - 0.01, z1 + 0.01, cap)
def exhibit(c, x, z, w, h, y0):
    """二樓展示區：北牆上的展板（白底、三張圖、幾行字；顏色都是頂點色）"""
    c.vc.cbox(x - w / 2, x + w / 2, y0 + 0.7, y0 + 0.7 + h, z - 0.025, z + 0.025, '#f2efe8')
    for i, col in enumerate(('#7a5a46', '#3e6a7c', '#8c3b47')):
        px = x - w / 2 + 0.12 + i * (w - 0.24) / 3; c.vc.cbox(px, px + (w - 0.24) / 3 - 0.06, y0 + 1.45, y0 + 2.05, z + 0.025, z + 0.03, col)
    for j in range(4): c.vc.cbox(x - w / 2 + 0.12, x + w / 2 - 0.3 * (j % 2) - 0.12, y0 + 0.95 + j * 0.1, y0 + 0.97 + j * 0.1, z + 0.025, z + 0.03, '#5a5d61')


for f in LAY['furniture']:
    c, y = lvl(f); t = f['type']; ry = f.get('ry', 0.0); T_ = rot(f.get('x', 0), f.get('z', 0), ry)
    if t == 'lockers':
        rbox(c.vm, T_, -f['w'] / 2, f['w'] / 2, y, y + 1.9, -f['d'] / 2, f['d'] / 2, '#8c9196', r=0.01, seg=1)
        for i in range(8):
            for j in range(4):
                lx = -f['w'] / 2 + 0.2 + i * (f['w'] - 0.4) / 7; rbox(c.vm, T_, lx - 0.02, lx + 0.02, y + 0.28 + j * 0.45, y + 0.32 + j * 0.45, f['d'] / 2, f['d'] / 2 + 0.015, '#5b6065')
    elif t == 'returnBox':
        rbox(c.vm, T_, -0.35, 0.35, y, y + 1.1, -0.3, 0.3, '#3e5a48', r=0.02, seg=1); rbox(c.vm, T_, -0.22, 0.22, y + 0.85, y + 0.9, 0.3, 0.31, '#1e2124')
    elif t == 'notice':
        rbox(c.vc, T_, -1.2, 1.2, y + 0.8, y + 2.0, -0.04, 0.04, '#b78a5a'); rbox(c.vc, T_, -1.12, 1.12, y + 0.86, y + 1.94, 0.04, 0.05, '#d8c49a')
        for k in range(7): lx = -1.0 + k * 0.32; rbox(c.vc, T_, lx, lx + 0.22, y + 1.1 + (k % 2) * 0.35, y + 1.4 + (k % 2) * 0.35, 0.05, 0.055, rng.choice(['#ffffff', '#f4e6a8', '#cfe3f4', '#f6d0d0']))
    elif t == 'desk':                                   # 總服務台（L 形木頭櫃台）
        x, z = f['x'], f['z']
        C0.get('walnut', tile=1.2).box(x - f['w'] / 2, x + f['w'] / 2, y, y + 1.05, z - f['d'] / 2, z + f['d'] / 2)
        C0.get('wood', tile=1.6).box(x - f['w'] / 2 - 0.05, x + f['w'] / 2 + 0.05, y + 1.05, y + 1.1, z - f['d'] / 2 - 0.08, z + f['d'] / 2 + 0.03)
        for k in range(3):
            mx = x - 1.0 + k * 1.0; c.vm.cbox(mx - 0.22, mx + 0.22, y + 1.12, y + 1.42, z + 0.1, z + 0.13, '#1e2124')
    elif t == 'partition': c.vc.cbox(f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y, y + 2.4, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, '#d9d3c6')
    elif t == 'officeWall': C0.get('plaster', tile=3.0).box(f['x0'], f['x1'], y, y + 3.0, f['z'] - 0.06, f['z'] + 0.06)
    elif t == 'display':                               # 新書展示台（木頭、斜面上的書）
        rbox(c.vc, T_, -f['w'] / 2, f['w'] / 2, y, y + 0.75, -f['d'] / 2, f['d'] / 2, '#8a6440', r=0.01, seg=1)
        for k in range(6):
            lx = -f['w'] / 2 + 0.25 + k * (f['w'] - 0.5) / 5; rbox(c.get('books', cm=True), T_, lx - 0.1, lx + 0.1, y + 0.75, y + 0.78, -0.15, 0.15, rng.choice(['#8c3b47', '#2f5d50', '#d9c9a0', '#4a6c8c', '#c46a4a']))
    elif t == 'sofa':
        rbox(c.vc, T_, -f['w'] / 2, f['w'] / 2, y + 0.12, y + 0.45, -f['d'] / 2, f['d'] / 2, '#5d6a74', r=0.04, seg=2)
        rbox(c.vc, T_, -f['w'] / 2, f['w'] / 2, y + 0.45, y + 0.85, -f['d'] / 2, -f['d'] / 2 + 0.2, '#56636d', r=0.04, seg=2)
        for lx in (-f['w'] / 2, f['w'] / 2 - 0.16): rbox(c.vc, T_, lx, lx + 0.16, y + 0.45, y + 0.62, -f['d'] / 2, f['d'] / 2, '#56636d', r=0.03, seg=1)
    elif t == 'armchair':
        rbox(c.vc, T_, -0.38, 0.38, y + 0.12, y + 0.44, -0.36, 0.36, '#7a5a46', r=0.04, seg=2); rbox(c.vc, T_, -0.38, 0.38, y + 0.44, y + 0.82, -0.36, -0.2, '#6e5040', r=0.04, seg=2)
    elif t == 'racks':                                  # 期刊架（斜放的雜誌）
        shelf(c, f['x'], f['z'], f['w'], ry, y, H=1.6, Dp=0.5)
    elif t == 'planter':
        clathe(c.vc, [(0.0, 0.0), (f['r'] * 0.8, 0.0), (f['r'], 0.55), (f['r'] * 1.02, 0.6), (0.0, 0.6)], f['x'], y, f['z'], '#d9d3c6', seg=16)
        ccyl(c.vc, (f['x'], y + 0.6, f['z']), (f['x'], y + 0.606, f['z']), f['r'] * 0.95, '#3d3226', seg=16)   # 土
        leafy(c.k, f['x'], y + 0.6, f['z'], f['r'], seed=int(abs(f['x']) * 31 + abs(f['z']) * 17) + 7 * c.k)
    elif t == 'studyTable':                            # 二樓的長桌（第一版同一個位置：小安的座位）
        x, z, w = f['x'], f['z'], f['w']
        C1.get('wood', tile=1.6).box(x - w / 2, x + w / 2, y + 0.72, y + 0.76, z - 0.5, z + 0.5)
        for dx in (-w / 2 + 0.1, w / 2 - 0.14): C1.vm.cbox(x + dx, x + dx + 0.04, y, y + 0.72, z - 0.45, z + 0.45, '#3a3d41')
        n = f.get('seats', 4)
        for i in range(n):
            sxx = x - w / 2 + (i + 0.5) * w / n
            for s in (-1, 1): CHAIRS[1].append((sxx, z + s * 0.8, PI if s > 0 else 0.0))
            LAMPS[1].append((sxx, z, 0.0))                                                    # 綠色銀行燈（2D 背景 ntu_library_2f：桌子中線一排）
            C1.get('warm').box(sxx - 0.13, sxx + 0.13, y + 0.995, y + 0.999, z - 0.05, z + 0.05)   # 燈罩下面亮的一條（GLOW_，晚上亮）
    elif t == 'shelf': shelf(c, f['x'], f['z'], f['w'], ry, y)
    elif t == 'stack': stack(c, f['x'], f['z'], f['w'], y, H=f.get('h', 2.1), D=f.get('d', 0.62), cap=f.get('cap', '#888888'))
    elif t == 'groupTable':                            # 一樓多元共享區的四人桌（淺色木頭、中間一支腳）
        x, z = f['x'], f['z']
        c.get('wood', tile=1.6).box(x - f['w'] / 2, x + f['w'] / 2, y + 0.71, y + 0.75, z - f['d'] / 2, z + f['d'] / 2)
        c.vm.cbox(x - 0.04, x + 0.04, y, y + 0.71, z - 0.3, z + 0.3, '#3a3f45'); c.vm.cbox(x - 0.5, x + 0.5, y, y + 0.03, z - 0.3, z + 0.3, '#3a3f45')
        for s in (-1, 1):
            for dx in (-f['w'] / 4, f['w'] / 4): CHAIRS[0].append((x + dx, z + s * (f['d'] / 2 + 0.42), PI if s > 0 else 0.0))
    elif t == 'pcDesk':                                # 數位媒體區：一排電腦桌、螢幕、辦公椅
        x, z = f['x'], f['z']; n = f.get('seats', 4)
        c.vc.cbox(x - f['w'] / 2, x + f['w'] / 2, y + 0.72, y + 0.75, z - f['d'] / 2, z + f['d'] / 2, '#e4e0d8')
        for dx in (-f['w'] / 2 + 0.05, f['w'] / 2 - 0.09): c.vm.cbox(x + dx, x + dx + 0.04, y, y + 0.72, z - f['d'] / 2 + 0.05, z + f['d'] / 2 - 0.05, '#3a3f45')
        c.vc.cbox(x - f['w'] / 2, x + f['w'] / 2, y + 0.75, y + 1.15, z - f['d'] / 2, z - f['d'] / 2 + 0.03, '#c9c4ba')   # 背板
        for i in range(n):
            sxx = x - f['w'] / 2 + (i + 0.5) * f['w'] / n
            c.vm.cbox(sxx - 0.28, sxx + 0.28, y + 0.86, y + 1.2, z - f['d'] / 2 + 0.1, z - f['d'] / 2 + 0.13, '#1a1c1f')
            c.get('light').box(sxx - 0.26, sxx + 0.26, y + 0.88, y + 1.18, z - f['d'] / 2 + 0.131, z - f['d'] / 2 + 0.133) if i % 2 == 0 else None
            c.vm.cbox(sxx - 0.03, sxx + 0.03, y + 0.75, y + 0.86, z - f['d'] / 2 + 0.11, z - f['d'] / 2 + 0.15, '#2a2d30')
            c.vm.cbox(sxx - 0.22, sxx + 0.22, y + 0.751, y + 0.765, z - 0.02, z + 0.14, '#2a2d30')   # 鍵盤
            TCHAIRS[0].append((sxx, z + f['d'] / 2 + 0.42, PI))
    elif t == 'prop':
        k = f.get('kind'); w, d, h = f.get('w', 0.5), f.get('d', 0.5), f.get('h', 1.0)
        if k == 'exhibit': exhibit(c, f['x'], f['z'], w, h, y)
        elif k == 'displayCase':                           # 中庭走道兩旁的展示櫃（照片 1：木頭櫃、上面玻璃、裡面亮燈）
            x0_, x1_, z0_, z1_ = f['x'] - w / 2, f['x'] + w / 2, f['z'] - d / 2, f['z'] + d / 2
            C0.get('wood', tile=1.6).box(x0_, x1_, y, y + 0.72, z0_, z1_)
            C0.get('glass').box(x0_ + 0.02, x1_ - 0.02, y + 0.72, y + h, z0_ + 0.02, z1_ - 0.02)
            C0.get('warm').box(x0_ + 0.06, x1_ - 0.06, y + 0.725, y + 0.73, z0_ + 0.06, z1_ - 0.06)
            zz = z0_ + 0.2
            while zz < z1_ - 0.25:
                C0.get('books', cm=True).cbox(f['x'] - 0.16, f['x'] + 0.16, y + 0.73, y + 0.76, zz, zz + 0.22, rng.choice(['#8c3b47', '#2f5d50', '#d9c9a0', '#4a6c8c'])); zz += rng.uniform(0.45, 0.6)
        elif k == 'lowScreen':
            c.vc.cbox(f['x'] - w / 2, f['x'] + w / 2, y + 0.05, y + h, f['z'] - 0.04, f['z'] + 0.04, '#7d8a86')
            c.vm.cbox(f['x'] - w / 2, f['x'] + w / 2, y + h, y + h + 0.03, f['z'] - 0.045, f['z'] + 0.045, '#3a3f45')
        elif k in ('newsRack', 'mediaShelf'):
            shelf(c, f['x'], f['z'], d if k == 'newsRack' else d, ry, y, H=h, Dp=w + 0.05)
        elif k in ('curveCase', 'benchLow'): pass        # 展演廳那一段畫了
        elif k == 'umbrellas':
            clathe(c.vm, [(0.0, 0.0), (0.17, 0.0), (0.18, 0.55), (0.0, 0.55)], f['x'], y, f['z'], '#6b7075', seg=14)
            for j in range(5): a = j * 1.26; ccyl(c.vc, (f['x'] + 0.07 * math.cos(a), y + 0.2, f['z'] + 0.07 * math.sin(a)), (f['x'] + 0.1 * math.cos(a), y + 0.85, f['z'] + 0.1 * math.sin(a)), 0.03, rng.choice(['#22303f', '#7a2a2a', '#2f4a3a', '#c9a24f', '#3a3a3a']), seg=6)
        elif k == 'bagger': rbox(c.vm, T_, -w / 2, w / 2, y, y + h, -d / 2, d / 2, '#5d6a74', r=0.02, seg=1)
        elif k in ('opac', 'selfcheck'):
            rbox(c.vm, T_, -w / 2, w / 2, y, y + 1.0, -d / 2, d / 2, '#d9d6d0', r=0.02, seg=1); rbox(c.vm, T_, -w / 2 + 0.03, w / 2 - 0.03, y + 1.0, y + 1.42, -0.05, 0.0, '#1a1c1f')
            rbox(c.get('light'), T_, -w / 2 + 0.06, w / 2 - 0.06, y + 1.04, y + 1.38, 0.0, 0.004)
        elif k == 'bookcart':
            rbox(c.vm, T_, -w / 2, w / 2, y + 0.15, y + 0.2, -d / 2, d / 2, '#7d8287'); rbox(c.vm, T_, -w / 2, w / 2, y + 0.6, y + 0.64, -d / 2, d / 2, '#7d8287')
            for lx in (-w / 2, w / 2 - 0.03): rbox(c.vm, T_, lx, lx + 0.03, y + 0.05, y + h, -d / 2, d / 2, '#7d8287')
            for yy in (y + 0.2, y + 0.64):
                lx = -w / 2 + 0.05
                while lx < w / 2 - 0.06:
                    bw = rng.uniform(0.03, 0.05); rbox(c.get('books', cm=True), T_, lx, lx + bw, yy, yy + rng.uniform(0.2, 0.28), -0.12, 0.12, rng.choice(['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c'])); lx += bw + 0.004
        elif k == 'water': rbox(c.vm, T_, -w / 2, w / 2, y, y + h, -d / 2, d / 2, '#c9ccd0', r=0.02, seg=1); rbox(c.vm, T_, -0.12, 0.12, y + 0.9, y + 1.05, d / 2, d / 2 + 0.06, '#4a4e52')
        elif k == 'extinguisher': ccyl(c.vc, (f['x'], y, f['z']), (f['x'], y + 0.5, f['z']), 0.08, '#b0262a', seg=10)
        elif k == 'sidetable': ccyl(c.vc, (f['x'], y + 0.46, f['z']), (f['x'], y + 0.5, f['z']), 0.26, '#8a6440', seg=16); ccyl(c.vm, (f['x'], y, f['z']), (f['x'], y + 0.46, f['z']), 0.03, '#3a3d41', seg=8)
# 椅子：instancing（一個網格、很多物件；GLB 的 EXT_mesh_gpu_instancing）
def inst(c_parent, key, spots, draw):
    if not spots: return
    tmp = type('T', (), {})(); tmp.vc = CMesh(f'INST_{key}_vc', M['vc']); tmp.vm = CMesh(f'INST_{key}_vm', M['vcm'])
    draw(tmp)
    for m in (tmp.vc, tmp.vm):
        ob = m.finish(c_parent, uv=False)
        if ob is None: continue
        for i, (x, z, yaw, yb) in enumerate(spots):
            o = ob if i == 0 else bpy.data.objects.new(f'{ob.name}_{i}', ob.data)
            if i: bpy.context.scene.collection.objects.link(o); o.parent = c_parent
            o.matrix_world = Matrix.Translation(g2b(x, yb, z)) @ Matrix.Rotation(yaw, 4, 'Z')
for lv, par in ((0, R0), (1, R1)):
    yb = Y1 if lv else 0.0
    inst(par, f'chair{lv}', [(x, z, yaw, yb) for (x, z, yaw) in CHAIRS[lv]], lambda t: chair(t, 0.0, 0.0, 0.0, 'wood', '#a8743e'))
    inst(par, f'tchair{lv}', [(x, z, yaw, yb) for (x, z, yaw) in TCHAIRS[lv]], lambda t: LU.task_chair(t, 0.0, 0.0, 0.0, '#2e3440'))
    inst(par, f'lamp{lv}', [(x, z, yaw, yb) for (x, z, yaw) in LAMPS[lv]], banker_lamp_parts)

# =====================================================================
# 九、入口閘門（第一版的位置）
# =====================================================================
for px in GT['posts']:
    C0.vm.cbox(px - GT['postW'] / 2, px + GT['postW'] / 2, 0.0, 1.0, GT['z'] - GT['postD'] / 2, GT['z'] + GT['postD'] / 2, '#c9ccd0')
    C0.get('light').box(px - 0.08, px + 0.08, 1.0, 1.005, GT['z'] - 0.3, GT['z'] - 0.1)
for sxx in (-1, 0, 1):
    pass
ep = GT['posts'][-1]
DIR = LAY.get('directory')
if DIR:                                                                                   # 樓層簡介立牌（字是遊戲畫的 canvas，貼在板子的南面）
    dx_, dz_ = DIR['x'], DIR['z']
    C0.get('frame').box(dx_ - 0.95, dx_ + 0.95, 1.1, 2.1, dz_ - 0.025, dz_ + 0.025)
    for sx in (-0.85, 0.85): C0.get('steel').box(dx_ + sx - 0.025, dx_ + sx + 0.025, 0.0, 1.1, dz_ - 0.02, dz_ + 0.02)
    for sx in (-0.85, 0.85): C0.get('steel').box(dx_ + sx - 0.05, dx_ + sx + 0.05, 0.0, 0.025, dz_ - 0.22, dz_ + 0.22)
for sx in (-1, 1):
    a, b = sorted((sx * ep, sx * V['x1'])); C0.get('glass').box(a, b, 0.0, 1.0, GT['z'] - 0.02, GT['z'] + 0.02)

# =====================================================================
# 完成：外牆一面一個物件（遊戲淡出）、其他同層同材質合併
# =====================================================================
for wid, (m, par, d) in WALLS.items():
    m.finish(par, props={'dir': d})
C0.finish(); C1.finish()
for (k, kind), m in PL_MESH.items(): m.finish(R0 if k == 0 else R1, uv=False, merge=False, smooth=(kind == 'core'))
L.merge_by_material(root, keep=lambda ob: 'WALL_' in ob.name or ob.name.startswith('INST_') or (ob.data.users > 1), key=lambda ob: 'L0' if ob.parent == R0 else 'L1')
for ob in [o for o in root.children_recursive if o.type == 'MESH' and o.parent == root]:
    pass
info = L.export(OUT, gpu_instances=True)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=tris))
print(json.dumps({'LIBRARY_HALL_V2': 'OK', 'tris': tris, 'walls': len(WALLS), 'chairs': {k: len(v) for k, v in CHAIRS.items()}, 'tchairs': {k: len(v) for k, v in TCHAIRS.items()}}, ensure_ascii=False))
