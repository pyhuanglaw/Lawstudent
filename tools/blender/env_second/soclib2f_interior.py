"""社會科學院圖書館 東側館（SOCLIB-2F-1104，LAWWW2-C 2026-11-04）室內 → GLB。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/soclib2f_interior.py [-- --out assets/models/env/second_ai/soclib2f_interior.glb]

使用者 11-04 16:1x（對 AA-C）：「我那時候大學最喜歡去社科院圖書館2樓，你現在好像沒有2樓，你查一下他的2樓有一個專門的讀書室還會有洗手間啊」；規格 AA_669 第 6 節。
配置讀 src/data/soclib2f_layout.js（soclib2f_layout_gen.py 產生；遊戲 src/soclib2f3d.js 的導航、座位、互動點讀同一份，兩邊一定對得上）。
座標＝配置的座標：x 往東、z 往南、y 往上；一樓地板 0、二樓 4.2、二樓天花板 7.8；外牆中心線 x ±8、z ±11.2。
接法（和總圖大廳、宿舍走廊一樣）：L0_root（一樓）、L1_root（二樓）；外牆 WALL_L<層>_<N|S|E|W>（extras dir＝朝室內，遊戲淡出）；
  電梯（井道、車廂、門）由遊戲畫（B3.buildElevator），這裡在樓板上留洞；字（指標、預約螢幕上的字、使用規則）由遊戲畫。
風格：跟一樓閱覽室（soclib_interior.py）同一套——淺色磨石子（terrazzo_tiles）、白牆、竹集成材的家具（walnut_veneer 改淺蜂蜜色）；
  D112 不用深色木地板：自習室、討論室是淺灰藍的地毯（安靜）；一樓的樹狀柱不延伸到這裡（D136：這是另外接的兩層樓）。
做成：
- 一樓：門廳（從閱覽室的門進來）、雙跑樓梯（A 跑往南、平台、B 跑往北）、影印休息區（兩台影印機、儲值機、沙發、矮桌）、館員辦公室和書庫的門（關著）。
- 二樓：走廊（男女廁、中間一台飲水機）、三間討論室（玻璃牆、玻璃門、會議桌、白板）、電梯廳（長椅、回收桶）、南北向走廊（一排置物櫃、公告欄、研究小間的門）、
  自習室（北面玻璃隔間＋玻璃門、南北向長桌六張＝36 位：中間一道矮隔板、位子之間小隔板、每個位子一個插座；東面整排窗前的長檯面 13 位：北往南第三個＝劇情的「老位子」）。
- 燈：天花板的日光燈盤（位置照配置的 lights；統計 JSON 的 lights 給烘焙用）。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from lane118_shops import rot, rbox, ccyl, clathe, chair as wchair, plant   # noqa: E402
import linze_upper as LU   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/soclib2f_interior.glb'))
src = open(os.path.join(L.ROOT, arg('--layout', 'src/data/soclib2f_layout.js')), encoding='utf8').read()
J = json.loads(src[src.index('{', src.index('const SOCLIB2F_LAYOUT=')):src.rindex('}') + 1])
W, D, T, ST, RY = J['W'], J['D'], J['wallT'], J['slabT'], J['roofY']; Y1 = J['floors'][1]['y']
XW, XE, ZN, ZS = -W / 2, W / 2, -D / 2, D / 2
XI0, XI1, ZI0, ZI1 = XW + T / 2, XE - T / 2, ZN + T / 2, ZS - T / 2
S = J['stair']; A_, B_, LD, MW, WL = S['A'], S['B'], S['landing'], S['midWall'], S['well']; EL = J['elevator']; PI = math.pi
rng = random.Random(1104)

BAND = {0: '#b86f4f', 1: '#3f7f8c'}   # 樓層色帶（BB_260 §5 第 2 點）：一樓陶土紅、二樓灰藍綠——腰板上緣下面一條、地板嵌條、二樓玻璃隔間的防撞條同色
B.reset(texres=512)
root = B.group('soclib2f_interior', props={'kind': 'soclib2f_interior'})
R0 = B.group('L0_root', root); R1 = B.group('L1_root', root)
M = {
    'floor': L.pbr('sl2_floor', 'terrazzo_tiles', tile=1.6, target='#d3cdc2', normal=0.3, maps=('diff', 'nor'), rough_value=0.4),        # 和一樓閱覽室同一種磨石子
    'carpet': L.pbr('sl2_carpet', 'dirty_carpet', tile=2.0, target='#9aa3a8', contrast=0.45, normal=0.35, maps=('diff', 'nor'), rough_value=0.97),   # 淺灰藍地毯（D112）
    'wall': L.pbr('sl2_wall', 'painted_plaster_wall', tile=3.0, target='#ede8df', normal=0.25, maps=('diff', 'nor'), rough_value=0.9),   # 白色粉光漆（淡淡的刷痕，不是一片平的白）
    'exit': L.flat('GLOW_sl2_exit', '#3fbf6f', rough=0.4, emit=B.srgb('#5fe08a')),
    'ceil': L.pbr('sl2_ceiling', 'ceiling_interior', tile=2.4, target='#efece6', maps=('diff',), rough_value=0.95),
    'bamboo': L.pbr('sl2_bamboo', 'walnut_veneer', tile=1.2, target='#d4b27a', maps=('diff',), res=512, rough_value=0.45),
    'stair': L.pbr('sl2_stair', 'terrazzo_tiles', tile=1.2, target='#cfccc4', normal=0.3, maps=('diff', 'nor'), rough_value=0.45),
    'glass': L.flat('sl2_glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'frost': L.flat('sl2_frost', '#eef3f4', rough=0.4, alpha=0.62),
    'alu': L.flat('sl2_alu', '#c4c8cb', rough=0.35, metal=0.35),
    'steel': L.flat('sl2_steel', '#b9bdc1', rough=0.3, metal=0.4),
    'frame': L.flat('sl2_frame', '#3a3d41', rough=0.45, metal=0.25),
    'light': L.flat('sl2_lightpanel', '#fffaf0', rough=0.5, emit=B.srgb('#fff6e8'), cull=True),
    'screen': L.flat('sl2_screen', '#cfe3f2', rough=0.3, emit=B.srgb('#9fc4e6')),
    'vc': L.vc_material('sl2_vc', rough=0.6),
    'vcm': L.vc_material('sl2_vcm', rough=0.35),
}


class Lv:
    """一層樓的網格（材質一個一個累積，最後合併成一個物件掛在 L0_root／L1_root）；vc／vm＝頂點色的小東西（一般／金屬感）"""
    def __init__(self, k, parent):
        self.k, self.parent, self.m = k, parent, {}
        self.vc = self.get('vc', cm=True); self.vm = self.get('vcm', cm=True)
    def get(self, key, cm=False, tile=None):
        if key not in self.m: self.m[key] = CMesh(f'L{self.k}_{key}', M[key]) if cm else Mesh(f'L{self.k}_{key}', M[key], tile=tile)
        return self.m[key]
    @property
    def wood(self): return self.get('bamboo')
    @property
    def steel(self): return self.get('steel')
    def finish(self):
        for key, mm in self.m.items(): mm.finish(self.parent, uv=key not in ('vc', 'vcm', 'light', 'glass', 'frost', 'screen'))


C0, C1 = Lv(0, R0), Lv(1, R1)
CL = lambda lv: C1 if lv == 1 else C0
YF = lambda lv: Y1 if lv == 1 else 0.0


class _Tmp:
    """在 y=0 畫好（lane118_shops 的 plant 之類只會畫在地上）再整組搬到某一層"""
    def __init__(self): self.m = {}
    def get(self, key, cm=False, tile=None):
        if key not in self.m: self.m[key] = CMesh('_t_' + key, M[key]) if cm else Mesh('_t_' + key, M[key])
        return self.m[key]
    vc = property(lambda s: s.get('vc', cm=True)); vm = property(lambda s: s.get('vcm', cm=True)); wood = property(lambda s: s.get('bamboo')); steel = property(lambda s: s.get('steel'))
def at_level(lv, draw):
    t = _Tmp(); draw(t); c = CL(lv)
    for key, mm in t.m.items():
        c.get(key, cm=isinstance(mm, CMesh)).add_bm(mm.bm, Matrix.Translation((0, 0, YF(lv)))); mm.bm.free()


WALLS = {}   # 淡出的外牆：每一層每一面一個物件（WALL_L<層>_<面>）
def wallmesh(lv, side, dirv):
    wid = f'L{lv}_{side}'
    if wid not in WALLS: WALLS[wid] = (Mesh(f'WALL_{wid}', M['wall']), R1 if lv == 1 else R0, dirv)
    return WALLS[wid][0]


def pieces(a0, a1, y0, y1, holes):
    """一道牆沿著 a 的範圍 a0～a1、高 y0～y1，挖掉 holes＝[(a, b, ya, yb)]：回傳一塊一塊的 (a, b, ya, yb)"""
    out = []; x = a0
    for (a, b, ya, yb) in sorted(holes):
        a, b = max(a, a0), min(b, a1)
        if b - a < 1e-3: continue
        if a - x > 1e-3: out.append((x, a, y0, y1))
        if ya - y0 > 1e-3: out.append((a, b, y0, ya))
        if y1 - yb > 1e-3: out.append((a, b, yb, y1))
        x = b
    if a1 - x > 1e-3: out.append((x, a1, y0, y1))
    return out


def wbox(m, along, at, a, b, ya, yb, t=T):
    if along: m.box(a, b, ya, yb, at - t / 2, at + t / 2)
    else: m.box(at - t / 2, at + t / 2, ya, yb, a, b)


# =====================================================================
# 一、地板、天花板（二樓樓板＝一樓天花板；電梯井、樓梯間挖洞）
# =====================================================================
def rect_minus(r, holes):
    parts = [r]
    for h in holes:
        nxt = []
        for q in parts:
            if h[1] <= q[0] or h[0] >= q[1] or h[3] <= q[2] or h[2] >= q[3]: nxt.append(q); continue
            if h[2] > q[2]: nxt.append((q[0], q[1], q[2], h[2]))
            if h[3] < q[3]: nxt.append((q[0], q[1], h[3], q[3]))
            z0, z1 = max(q[2], h[2]), min(q[3], h[3])
            if h[0] > q[0]: nxt.append((q[0], h[0], z0, z1))
            if h[1] < q[1]: nxt.append((h[1], q[1], z0, z1))
        parts = nxt
    return parts
SHAFT = (EL['x0'] - 0.1, EL['x1'] + 0.1, EL['z0'] - 0.1, EL['z1'] + 0.1)
WELL = (WL['x0'], WL['x1'], WL['z0'], WL['z1'])
def floor(c, key, x0, x1, z0, z1, y, tile=None):
    c.get(key, tile=tile).quad([(x0, y, z1), (x1, y, z1), (x1, y, z0), (x0, y, z0)])
def ceiling(c, x0, x1, z0, z1, y):
    c.get('ceil', tile=2.4).quad([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)])
# 一樓：門廳＋影印休息區（樓梯間的地面在樓梯底下，A 跑每一階實心到地面）
for r in rect_minus((XI0, XI1, ZI0, -4.9), []) + rect_minus((-3.9, XI1, -4.9, 2.7), []):   # 一樓地板不挖電梯井（井底＝一樓地板；車廂在二樓時看下去是地板）
    floor(C0, 'floor', r[0], r[1], r[2], r[3], 0.0, tile=1.6)
for (x0, x1, z0, z1) in ((XI0 + 1.0, XI1 - 1.0, ZI0 + 1.0, -5.9),):   # 一樓門廳地上一圈深色磨石子嵌條（離牆 1 m；地面的層次，不擋路）
    for (a0, a1, b0_, b1_) in ((x0, x1, z0, z0 + 0.12), (x0, x1, z1 - 0.12, z1), (x0, x0 + 0.12, z0, z1), (x1 - 0.12, x1, z0, z1)):
        C0.vc.cbox(a0, a1, 0.0, 0.003, b0_, b1_, '#8c8a84')
H0 = Y1 - ST
for r in rect_minus((XI0, XI1, ZI0, -4.9), [SHAFT]) + rect_minus((-3.9, XI1, -4.9, 2.7), [SHAFT]): ceiling(C0, r[0], r[1], r[2], r[3], H0)
# 二樓：走廊、電梯廳、南北向走廊磨石子；自習室、討論室地毯
SR = J['study']
for r in rect_minus((XI0, XI1, J['discZ'][1] + T / 2, -4.9), []) + rect_minus((-3.9, SR['x0'] - T / 2, -4.9, ZI1), []) + rect_minus((SR['x0'] - T / 2, XI1, -4.9, SR['z0'] - 0.05), [SHAFT]):
    floor(C1, 'floor', r[0], r[1], r[2], r[3], Y1, tile=1.6)
floor(C1, 'carpet', SR['x0'] + T / 2, XI1, SR['z0'] + 0.05, ZI1, Y1 + 0.004, tile=2.0)
for d in J['disc']: floor(C1, 'carpet', d['x0'] + T / 2, d['x1'] - T / 2, ZI0, J['discZ'][1] - 0.05, Y1 + 0.004, tile=2.0)
for r in rect_minus((XI0, XI1, ZI0, ZI1), [WELL, SHAFT]): ceiling(C1, r[0], r[1], r[2], r[3], RY)
# 樓梯間頂上（7.8）、樓板邊（A 跑上方的欄杆下面那一條）
ceiling(C0, WL['x0'], WL['x1'], WL['z0'], WL['z1'], RY)
C0.get('wall').box(A_['vx0'], A_['x1'], Y1 - ST, Y1, -4.95, -4.85)

# =====================================================================
# 二、牆（配置的 walls：中心線；外牆照窗挖洞、一面一個物件；室內的牆合併）、踢腳板、窗框
# =====================================================================
SIDE = lambda w: ('N' if abs(w['z0'] - ZN) < 0.05 else 'S') if abs(w['z1'] - w['z0']) < 1e-6 else ('E' if abs(w['x0'] - XE) < 0.05 else 'W')
for w in J['walls']:
    along = abs(w['z1'] - w['z0']) < 1e-6; at = w['z0'] if along else w['x0']
    a0, a1 = (min(w['x0'], w['x1']), max(w['x0'], w['x1'])) if along else (min(w['z0'], w['z1']), max(w['z0'], w['z1']))
    lvv = 1 if w['lv'] == 1 else 0; c = CL(lvv); y0, y1 = w['y0'], w['y1']
    if w['kind'] == 'rail':                                                               # 二樓 A 跑上方：玻璃欄杆＋不鏽鋼扶手
        c.get('glass').quad([(a0, y0 + 0.08, at), (a1, y0 + 0.08, at), (a1, y1 - 0.06, at), (a0, y1 - 0.06, at)])
        c.get('steel').box(a0, a1, y1 - 0.05, y1, at - 0.03, at + 0.03); c.get('steel').box(a0, a1, y0, y0 + 0.08, at - 0.04, at + 0.04)
        k = a0
        while k <= a1 + 1e-6: c.get('steel').box(k - 0.02, k + 0.02, y0, y1, at - 0.025, at + 0.025); k += 0.85
        continue
    if w['kind'] == 'glass':                                                              # 玻璃隔間：鋁框（每 1.2 m 一支直框、上下框）＋玻璃＋腰線一條霧面防撞條
        h = y1 - y0; g = c.get('glass'); al = c.get('alu'); fr = c.get('frost')
        if along: g.quad([(a0, y0 + 0.08, at), (a1, y0 + 0.08, at), (a1, y1 - 0.08, at), (a0, y1 - 0.08, at)])
        else: g.quad([(at, y0 + 0.08, a1), (at, y0 + 0.08, a0), (at, y1 - 0.08, a0), (at, y1 - 0.08, a1)])
        n = max(1, round((a1 - a0) / 1.2))
        for k in range(n + 1): u = a0 + (a1 - a0) * k / n; wbox(al, along, at, u - 0.03, u + 0.03, y0, y1, t=0.08)
        for (ya, yb) in ((y0, y0 + 0.08), (y1 - 0.08, y1), (y0 + 2.3, y0 + 2.36)): wbox(al, along, at, a0, a1, ya, yb, t=0.09)
        wbox(fr, along, at, a0, a1, y0 + 1.3, y0 + 1.42, t=0.075)
        if lvv == 1:                                                                      # 二樓：防撞條中間一條樓層色（BB_260 §5 第 2 點；走廊、電梯廳看得到）
            if along: c.vc.cbox(a0, a1, y0 + 1.345, y0 + 1.375, at - 0.04, at + 0.04, BAND[1])
            else: c.vc.cbox(at - 0.04, at + 0.04, y0 + 1.345, y0 + 1.375, a0, a1, BAND[1])
        continue
    wins = [o for o in J['windows'] if o['lv'] == lvv and o['wall'] == SIDE(w)] if w['kind'] == 'outer' else []
    holes = [(o['a0'], o['a1'], YF(lvv) + o['y0'], YF(lvv) + o['y1']) for o in wins]
    if w['kind'] == 'outer':
        m = wallmesh(lvv, SIDE(w), w['dir'])
        for (a, b, ya, yb) in pieces(a0, a1, y0, y1, holes): wbox(m, along, at, a, b, ya, yb)
    else:
        for (a, b, ya, yb) in pieces(a0, a1, y0, y1, []): wbox(c.get('wall'), along, at, a, b, ya, yb)
    for lv_ in ((0, 1) if w['lv'] == 2 else (lvv,)):                                       # 踢腳板（淺灰，兩面）
        fy = YF(lv_)
        for s in ((-1, 1) if w['kind'] != 'outer' else (1,)):
            off = (T / 2 + 0.006) * (s if w['kind'] != 'outer' else 1) * (1 if w['kind'] != 'outer' else 0)
            if w['kind'] == 'outer':
                d = w['dir']; nx, nz = d[0], d[2]
                if along: CL(lv_).vc.cbox(a0, a1, fy, fy + 0.09, at + nz * (T / 2) - 0.006 * (nz < 0), at + nz * (T / 2 + 0.012) + 0.006 * (nz < 0), '#bfc1bd')
                else: CL(lv_).vc.cbox(min(at + nx * T / 2, at + nx * (T / 2 + 0.012)), max(at + nx * T / 2, at + nx * (T / 2 + 0.012)), fy, fy + 0.09, a0, a1, '#bfc1bd')
            else:
                if along: CL(lv_).vc.cbox(a0, a1, fy, fy + 0.09, at + s * T / 2 - (0.012 if s < 0 else 0), at + s * T / 2 + (0.012 if s > 0 else 0), '#bfc1bd')
                else: CL(lv_).vc.cbox(at + s * T / 2 - (0.012 if s < 0 else 0), at + s * T / 2 + (0.012 if s > 0 else 0), fy, fy + 0.09, a0, a1, '#bfc1bd')
    for o in wins:                                                                        # 窗：深灰鋁框＋直櫺＋玻璃＋窗台
        d = w['dir']; inward = d[2] if along else d[0]; ya, yb = YF(lvv) + o['y0'], YF(lvv) + o['y1']; a, b = o['a0'], o['a1']
        fz = at + inward * (T / 2 - 0.05); fr = c.get('frame')
        def fb(p0, p1, q0, q1):
            if along: fr.box(p0, p1, q0, q1, fz - 0.035, fz + 0.035)
            else: fr.box(fz - 0.035, fz + 0.035, q0, q1, p0, p1)
        fb(a, a + 0.06, ya, yb); fb(b - 0.06, b, ya, yb); fb(a, b, ya, ya + 0.06); fb(a, b, yb - 0.06, yb)
        nm = max(1, round((b - a) / 1.5))
        for k in range(1, nm): u = a + (b - a) * k / nm; fb(u - 0.025, u + 0.025, ya, yb)
        gz = at
        if along: c.get('glass').quad([(a, ya, gz), (b, ya, gz), (b, yb, gz), (a, yb, gz)])
        else: c.get('glass').quad([(gz, ya, b), (gz, ya, a), (gz, yb, a), (gz, yb, b)])
        if along: c.vc.cbox(a - 0.04, b + 0.04, ya - 0.035, ya, min(at + inward * T / 2, at + inward * (T / 2 + 0.14)), max(at + inward * T / 2, at + inward * (T / 2 + 0.14)), '#e4e1da')
        else: c.vc.cbox(min(at + inward * T / 2, at + inward * (T / 2 + 0.14)), max(at + inward * T / 2, at + inward * (T / 2 + 0.14)), ya - 0.035, ya, a - 0.04, b + 0.04, '#e4e1da')

# 開口：門框；玻璃門兩扇推開 90°；門上面（門高到天花板）補牆或玻璃
for o in J['openings']:
    lv = o['lv']; c = CL(lv); y = YF(lv); along = o['axis'] == 'x'; hw = o['w'] / 2; inw = o['inward']; top = (RY if lv == 1 else H0)
    post = lambda a: (o['x'] + a, o['z']) if along else (o['x'], o['z'] + a)
    glassy = o['kind'] == 'glassDoor'; fm = c.get('alu' if glassy else 'frame')
    for s in (-1, 1):
        px, pz = post(s * (hw + 0.03))
        fm.box(px - (0.04 if along else 0.07), px + (0.04 if along else 0.07), y, y + o['h'], pz - (0.07 if along else 0.04), pz + (0.07 if along else 0.04))
    if along: fm.box(o['x'] - hw - 0.07, o['x'] + hw + 0.07, y + o['h'], y + o['h'] + 0.08, o['z'] - 0.07, o['z'] + 0.07)
    else: fm.box(o['x'] - 0.07, o['x'] + 0.07, y + o['h'], y + o['h'] + 0.08, o['z'] - hw - 0.07, o['z'] + hw + 0.07)
    above = [w for w in J['walls'] if w['lv'] in (lv, 2) and w['kind'] in ('glass', 'inner', 'outer') and ((along and abs(w['z0'] - o['z']) < 0.01) or (not along and abs(w['x0'] - o['x']) < 0.01))]
    isglass = any(w['kind'] == 'glass' for w in above)
    if top - (y + o['h'] + 0.08) > 0.02:
        if isglass:
            if along: c.get('glass').quad([(o['x'] - hw, y + o['h'] + 0.08, o['z']), (o['x'] + hw, y + o['h'] + 0.08, o['z']), (o['x'] + hw, top - 0.08, o['z']), (o['x'] - hw, top - 0.08, o['z'])])
            else: c.get('glass').quad([(o['x'], y + o['h'] + 0.08, o['z'] + hw), (o['x'], y + o['h'] + 0.08, o['z'] - hw), (o['x'], top - 0.08, o['z'] - hw), (o['x'], top - 0.08, o['z'] + hw)])
            wbox(c.get('alu'), along, o['z'] if along else o['x'], o['x' if along else 'z'] - hw, o['x' if along else 'z'] + hw, top - 0.08, top, t=0.09)
        else:
            m = wallmesh(lv, 'W', [1, 0, 0]) if o['id'] == 'entrance' else c.get('wall')
            wbox(m, along, o['z'] if along else o['x'], o['x' if along else 'z'] - hw - 0.1, o['x' if along else 'z'] + hw + 0.1, y + o['h'] + 0.08, top)
    if glassy:                                                                            # 玻璃門扇：推開靠著門邊（鋁框＋玻璃＋直桿門把）
        lw = hw - 0.04
        for s in (-1, 1):
            hx, hz = post(s * (hw - 0.02)); px, pz = hx + inw[0] * lw / 2, hz + inw[2] * lw / 2
            if along:
                c.get('glass').quad([(px, y + 0.06, pz - lw / 2), (px, y + 0.06, pz + lw / 2), (px, y + o['h'] - 0.06, pz + lw / 2), (px, y + o['h'] - 0.06, pz - lw / 2)])
                for e in (-1, 1): c.get('alu').box(px - 0.02, px + 0.02, y, y + o['h'] - 0.02, pz + e * lw / 2 - 0.025, pz + e * lw / 2 + 0.025)
                c.get('alu').box(px - 0.02, px + 0.02, y, y + 0.1, pz - lw / 2, pz + lw / 2); c.get('alu').box(px - 0.02, px + 0.02, y + o['h'] - 0.07, y + o['h'] - 0.02, pz - lw / 2, pz + lw / 2)
                c.get('steel').cyl((px - 0.05, y + 0.8, pz + s * 0.0), (px - 0.05, y + 1.4, pz), 0.015, seg=8)
            else:
                c.get('glass').quad([(px - lw / 2, y + 0.06, pz), (px + lw / 2, y + 0.06, pz), (px + lw / 2, y + o['h'] - 0.06, pz), (px - lw / 2, y + o['h'] - 0.06, pz)])
                for e in (-1, 1): c.get('alu').box(px + e * lw / 2 - 0.025, px + e * lw / 2 + 0.025, y, y + o['h'] - 0.02, pz - 0.02, pz + 0.02)
                c.get('alu').box(px - lw / 2, px + lw / 2, y, y + 0.1, pz - 0.02, pz + 0.02); c.get('alu').box(px - lw / 2, px + lw / 2, y + o['h'] - 0.07, y + o['h'] - 0.02, pz - 0.02, pz + 0.02)
                c.get('steel').cyl((px, y + 0.8, pz - 0.05), (px, y + 1.4, pz - 0.05), 0.015, seg=8)
    else:                                                                                 # 從閱覽室進來的門：兩扇關著的竹色木門（中間一條霧面玻璃、不鏽鋼推板）——開著的話門外是區域外面，什麼都沒有
        lw = hw - 0.01; dx = o['x'] + 0.12                                                    # 門片在西牆內側（門廳這一邊）
        for s in (-1, 1):
            zc = o['z'] + s * (hw / 2)
            c.wood.rbox(dx - 0.02, dx + 0.025, y + 0.01, y + o['h'] - 0.01, zc - lw / 2, zc + lw / 2, r=0.006, seg=1)
            c.get('frost').box(dx - 0.024, dx + 0.028, y + 0.9, y + 1.95, zc - 0.07, zc + 0.07)
            c.get('steel').box(dx + 0.025, dx + 0.03, y + 0.95, y + 1.25, zc - s * (lw / 2 - 0.06) - 0.06, zc - s * (lw / 2 - 0.06) + 0.06)
        C0.vc.cbox(o['x'] + 0.16, o['x'] + 1.6, 0.0, 0.012, o['z'] - hw - 0.1, o['z'] + hw + 0.1, '#4a4d50')   # 門口的腳踏墊

# 關著的門：門框＋門片＋門把（洗手間灰色美耐板＋踢腳鋼板；研究小間淺木色＋小窗；書庫、館員辦公室）
FACE = {'+z': (0, 1), '-z': (0, -1), '+x': (1, 0), '-x': (-1, 0)}
for d in J['doors']:
    lv = d['lv']; c = CL(lv); y = YF(lv); fx, fz = FACE[d['face']]; along = fz != 0
    o = T / 2 + 0.01; cx, cz = d['x'] + fx * o, d['z'] + fz * o; hw = 0.45
    leaf = '#9aa6ad' if d.get('wc') else ('#c9b089' if d['id'].startswith('rs') else '#b8a888')
    if along:
        c.vm.cbox(cx - hw - 0.06, cx - hw, y, y + 2.16, cz - 0.02, cz + 0.03 * fz, '#3a3d41'); c.vm.cbox(cx + hw, cx + hw + 0.06, y, y + 2.16, cz - 0.02, cz + 0.03 * fz, '#3a3d41')
        c.vm.cbox(cx - hw - 0.06, cx + hw + 0.06, y + 2.1, y + 2.16, cz - 0.02, cz + 0.03 * fz, '#3a3d41')
        z0_, z1_ = sorted((cz, cz + 0.035 * fz)); c.vc.crbox(cx - hw, cx + hw, y + 0.005, y + 2.1, z0_, z1_, leaf, r=0.006, seg=1)
        ccyl(c.vm, (cx + hw - 0.1, y + 1.0, cz + fz * 0.045), (cx + hw - 0.24, y + 1.0, cz + fz * 0.045), 0.012, '#c9ccd0', seg=8)
        if d.get('wc'): c.vm.cbox(cx - hw + 0.02, cx + hw - 0.02, y + 0.02, y + 0.25, *sorted((cz + fz * 0.035, cz + fz * 0.04)), '#c9ccd0')
        if d['id'].startswith('rs'): c.get('glass').quad([(cx - 0.1, y + 1.35, cz + fz * 0.04), (cx + 0.1, y + 1.35, cz + fz * 0.04), (cx + 0.1, y + 1.85, cz + fz * 0.04), (cx - 0.1, y + 1.85, cz + fz * 0.04)])
    else:
        c.vm.cbox(cx - 0.02, cx + 0.03 * fx, y, y + 2.16, cz - hw - 0.06, cz - hw, '#3a3d41') if fx > 0 else c.vm.cbox(cx + 0.03 * fx, cx + 0.02, y, y + 2.16, cz - hw - 0.06, cz - hw, '#3a3d41')
        x0_, x1_ = sorted((cx - 0.02 * fx, cx + 0.03 * fx)); c.vm.cbox(x0_, x1_, y, y + 2.16, cz + hw, cz + hw + 0.06, '#3a3d41'); c.vm.cbox(x0_, x1_, y + 2.1, y + 2.16, cz - hw - 0.06, cz + hw + 0.06, '#3a3d41')
        a_, b_ = sorted((cx, cx + 0.035 * fx)); c.vc.crbox(a_, b_, y + 0.005, y + 2.1, cz - hw, cz + hw, leaf, r=0.006, seg=1)
        ccyl(c.vm, (cx + fx * 0.045, y + 1.0, cz + hw - 0.1), (cx + fx * 0.045, y + 1.0, cz + hw - 0.24), 0.012, '#c9ccd0', seg=8)
        if d['id'].startswith('rs'): c.get('glass').quad([(cx + fx * 0.04, y + 1.35, cz - 0.1 * fx), (cx + fx * 0.04, y + 1.35, cz + 0.1 * fx), (cx + fx * 0.04, y + 1.85, cz + 0.1 * fx), (cx + fx * 0.04, y + 1.85, cz - 0.1 * fx)])

# =====================================================================
# 三、樓梯：A 跑每一階實心到地面、平台實心、B 跑懸空（踏階＋斜的樓梯板）；止滑條；兩跑中間的牆（到二樓地板再高 1 m）；牆上的扶手
# =====================================================================
r, t = S['rise'], S['tread']; st = C0.get('stair', tile=1.2)
for k in range(A_['risers']):
    top = (k + 1) * r; z0 = A_['z0'] + k * t
    st.box(A_['vx0'], A_['x1'], 0.0, top, z0, z0 + t); C0.vc.cbox(A_['vx0'] + 0.05, A_['x1'] - 0.05, top, top + 0.004, z0 + 0.02, z0 + 0.07, '#5c6064')
st.box(A_['vx0'], B_['vx1'], 0.0, LD['y'], LD['z0'], LD['vz1'])
slope = math.atan2(Y1 - LD['y'], B_['z1'] - B_['z0'])
for k in range(B_['risers']):
    top = LD['y'] + (k + 1) * r; z1 = B_['z1'] - k * t
    st.box(B_['x0'], B_['vx1'], top - r - 0.02, top, z1 - t, z1); C0.vc.cbox(B_['x0'] + 0.05, B_['vx1'] - 0.05, top, top + 0.004, z1 - 0.07, z1 - 0.02, '#5c6064')
bm_ = bmesh.new(); L.bm_box(bm_, -(B_['vx1'] - B_['x0']) / 2, (B_['vx1'] - B_['x0']) / 2, -0.12, 0.12, -math.hypot(Y1 - LD['y'], B_['z1'] - B_['z0']) / 2, math.hypot(Y1 - LD['y'], B_['z1'] - B_['z0']) / 2)
C0.get('wall').add_bm(bm_, Matrix.Translation(g2b((B_['x0'] + B_['vx1']) / 2, (LD['y'] + Y1) / 2 - 0.17, (B_['z0'] + B_['z1']) / 2)) @ Matrix.Rotation(-slope, 4, 'X')); bm_.free()   # B 跑底下斜的樓梯板
C0.get('wall').box(MW['x0'], MW['x1'], 0.0, MW['h'], B_['z0'], B_['z1'])
C0.get('steel').box(MW['x0'] - 0.01, MW['x1'] + 0.01, MW['h'], MW['h'] + 0.04, B_['z0'], B_['z1'])
def handrail(c, x, za, ya, zb, yb):
    c.get('steel').cyl((x, ya + 0.9, za), (x, yb + 0.9, zb), 0.022, seg=8)
    n = max(2, int(abs(zb - za) / 1.2))
    for k in range(n + 1):
        zz = za + (zb - za) * k / n; yy = ya + (yb - ya) * k / n; c.get('steel').cyl((x, yy + 0.83, zz), (x, yy + 0.9, zz), 0.008, seg=6)
handrail(C0, A_['vx0'] + 0.07, A_['z0'] + 0.1, r, A_['z1'], LD['y']); handrail(C0, MW['x0'] - 0.05, A_['z0'] + 0.1, r, A_['z1'], LD['y'])
handrail(C0, MW['x1'] + 0.05, B_['z1'], LD['y'] + r, B_['z0'] + 0.1, Y1); handrail(C0, B_['vx1'] - 0.07, B_['z1'], LD['y'] + r, B_['z0'] + 0.1, Y1)
for x in (A_['vx0'] + 0.07, B_['vx1'] - 0.07): C0.get('steel').cyl((x, LD['y'] + 0.9, A_['z1'] if x < -6 else B_['z1']), (x, LD['y'] + 0.9, LD['vz1'] - 0.1), 0.022, seg=8)   # 平台的扶手

# =====================================================================
# 四、家具
# =====================================================================
CHAIRS = {0: [], 1: []}; TCHAIRS = {0: [], 1: []}
for s in J['seats']:
    (TCHAIRS if s['kind'] == 'discuss' else CHAIRS)[s['lv']].append((s['x'], s['z'], s['yaw']))
OUTLETS = []
for f in J['furniture']:
    k = f['type']; lv = f.get('lv', 0); c = CL(lv); y = YF(lv); ry = f.get('ry', 0.0)
    if k == 'studyTable':                                                                 # 南北向長桌：竹集成材桌面、鋼管 ㄈ 字腳、中間的霧面矮隔板（竹壓條）、位子之間的小隔板、插座盒
        x, z, w, d = f['x'], f['z'], f['w'], f['d']
        c.wood.rbox(x - w / 2, x + w / 2, y + 0.715, y + 0.75, z - d / 2, z + d / 2, r=0.008, seg=2)
        for ez in (z - d / 2 + 0.07, z + d / 2 - 0.07):
            for ex in (x - w / 2 + 0.05, x + w / 2 - 0.05): c.vm.cbox(ex - 0.02, ex + 0.02, y, y + 0.715, ez - 0.02, ez + 0.02, '#7b8086')
            c.vm.cbox(x - w / 2 + 0.05, x + w / 2 - 0.05, y + 0.66, y + 0.7, ez - 0.02, ez + 0.02, '#7b8086'); c.vm.cbox(x - w / 2 + 0.03, x + w / 2 - 0.03, y, y + 0.03, ez - 0.03, ez + 0.03, '#6b7076')
        ccyl(c.vm, (x, y + 0.2, z - d / 2 + 0.07), (x, y + 0.2, z + d / 2 - 0.07), 0.015, '#7b8086', seg=6)   # 兩端桌腳中間一支細橫撐
        c.get('frost').box(x - 0.008, x + 0.008, y + 0.75, y + 1.08, z - d / 2 + 0.04, z + d / 2 - 0.04)
        c.wood.box(x - 0.018, x + 0.018, y + 1.08, y + 1.1, z - d / 2 + 0.03, z + d / 2 - 0.03)
        for dz in (-0.475, 0.475): c.get('frost').box(x - w / 2 + 0.03, x + w / 2 - 0.03, y + 0.75, y + 1.0, z + dz - 0.006, z + dz + 0.006)
        for kz in (-0.95, 0.0, 0.95):
            for sx in (-1, 1):
                ox = x + sx * 0.03; c.vm.cbox(min(ox, ox + sx * 0.03), max(ox, ox + sx * 0.03), y + 0.78, y + 0.86, z + kz - 0.06, z + kz + 0.06, '#3a3e44')
                c.vm.cbox(min(ox + sx * 0.03, ox + sx * 0.032), max(ox + sx * 0.03, ox + sx * 0.032), y + 0.8, y + 0.84, z + kz - 0.04, z + kz - 0.005, '#e8e6e0')   # 插座面板
                OUTLETS.append((round(ox, 3), round(z + kz, 3)))
    elif k == 'windowCounter':                                                            # 窗前的長檯面：前面一片擋板、位子之間小隔板、每三個位子兩個插座
        x0, x1, z0, z1 = f['x0'], f['x1'], f['z0'], f['z1']
        c.wood.rbox(x0, x1 - 0.02, y + 0.72, y + 0.755, z0, z1, r=0.008, seg=2); c.wood.box(x0 + 0.04, x0 + 0.07, y, y + 0.72, z0, z1)
        kz = z0
        while kz <= z1 + 1e-6: c.vm.cbox(x0 + 0.08, x1 - 0.05, y, y + 0.72, kz - 0.02, kz + 0.02, '#7b8086'); kz += 2.4
        for s in [q for q in J['seats'] if q['kind'] == 'window']:
            c.get('frost').box(x0 + 0.02, x1 - 0.06, y + 0.755, y + 0.98, s['z'] + 0.425 - 0.006, s['z'] + 0.425 + 0.006)
            c.vm.cbox(x1 - 0.1, x1 - 0.06, y + 0.76, y + 0.82, s['z'] - 0.06, s['z'] + 0.06, '#3a3e44'); OUTLETS.append((round(x1 - 0.08, 3), round(s['z'], 3)))
    elif k == 'discTable':                                                                # 討論室：白色美耐板會議桌（圓角）＋鋼腳；桌上一個集線插座盒
        x, z, w, d = f['x'], f['z'], f['w'], f['d']
        c.vc.crbox(x - w / 2, x + w / 2, y + 0.71, y + 0.745, z - d / 2, z + d / 2, '#eceae4', r=0.012, seg=2)
        for ez in (z - d / 2 + 0.12, z + d / 2 - 0.12): c.vm.cbox(x - w / 2 + 0.08, x + w / 2 - 0.08, y, y + 0.71, ez - 0.025, ez + 0.025, '#6b7076')
        c.vm.cbox(x - 0.08, x + 0.08, y + 0.745, y + 0.775, z - 0.12, z + 0.12, '#3a3e44')
    elif k == 'whiteboard':                                                               # 白板：鋁框、筆槽、兩三支白板筆
        x, z, w = f['x'], f['z'], f['w']
        c.vc.cbox(x - w / 2, x + w / 2, y + 0.95, y + 2.05, z - 0.015, z + 0.015, '#f7f8f6'); c.get('alu').box(x - w / 2 - 0.03, x + w / 2 + 0.03, y + 0.92, y + 2.08, z - 0.03, z - 0.016)
        c.get('alu').box(x - w / 2, x + w / 2, y + 0.9, y + 0.94, z + 0.0, z + 0.08)
        for j, col in enumerate(('#1f4a8a', '#b8262b', '#202225')): ccyl(c.vm, (x - 0.3 + j * 0.12, y + 0.945, z + 0.04), (x - 0.18 + j * 0.12, y + 0.945, z + 0.04), 0.009, col, seg=6)
    elif k == 'bookingScreen':                                                            # 預約小螢幕（BB_260 §5 第 3 點：細框 4 mm、螢幕 0.18×0.115）＋一支短臂接到玻璃牆的鋁框；字由遊戲畫（f.z+0.022，在螢幕面 +0.015 前面）
        x, z = f['x'], f['z']; yc = y + 1.46
        c.vm.cbox(x - 0.094, x + 0.094, yc - 0.0615, yc + 0.0615, z - 0.012, z + 0.012, '#2a2e33'); c.get('screen').box(x - 0.09, x + 0.09, yc - 0.0575, yc + 0.0575, z + 0.012, z + 0.015)
        c.vm.cbox(x - 0.02, x + 0.02, yc - 0.03, yc + 0.03, J['discZ'][1] + 0.045, z - 0.012, '#8f969b')
    elif k == 'lockers':                                                                  # 置物櫃：8 欄 × 4 層，灰色鋼板、門上一排通風孔、鑰匙（橘色號碼牌）
        x, z0, z1, dd, n = f['x'], f['z0'], f['z1'], f['d'], f['n']; cw = (z1 - z0) / n; xf = x + dd
        c.vm.cbox(x, xf - 0.02, y, y + 1.85, z0, z1, '#b9c0c5'); c.vm.cbox(x, xf, y, y + 0.08, z0, z1, '#5f656b')
        for i in range(n):
            for j in range(4):
                zc = z0 + cw * (i + 0.5); y0_ = y + 0.1 + j * 0.435
                c.vm.cbox(xf - 0.02, xf, y0_ + 0.01, y0_ + 0.42, zc - cw / 2 + 0.008, zc + cw / 2 - 0.008, '#c6ccd0')
                for v in range(3): c.vm.cbox(xf, xf + 0.003, y0_ + 0.3 + v * 0.03, y0_ + 0.315 + v * 0.03, zc - 0.12, zc + 0.12, '#8d949a')
                c.vm.cbox(xf, xf + 0.01, y0_ + 0.18, y0_ + 0.22, zc + cw / 2 - 0.08, zc + cw / 2 - 0.05, '#5a6066')
                if rng.random() < 0.55: c.vc.cbox(xf + 0.008, xf + 0.014, y0_ + 0.1, y0_ + 0.17, zc + cw / 2 - 0.08, zc + cw / 2 - 0.05, '#e07a2e')   # 還插著鑰匙的格子（空的）
    elif k == 'notice':                                                                   # 公告欄：鋁框軟木板＋一張張的公告（頂點色）
        x, z, w = f['x'], f['z'], f['w']; T_ = rot(x, z, ry)
        rbox(c.get('alu'), T_, -w / 2 - 0.03, w / 2 + 0.03, y + 0.98, y + 2.12, -0.0, 0.025); rbox(c.vc, T_, -w / 2, w / 2, y + 1.0, y + 2.1, 0.0, 0.03, '#c4a77d')
        # BB_260 §5 第 1 點「公告欄上的海報」：三張 A3 海報（標題色塊、圖、幾行字）＋幾張 A4 公告、便條；字不放
        for (u, v, pw, ph, base, acc, img) in (((-0.66, 1.56, 0.32, 0.44, '#fbfaf4', '#c8452f', '#7fa7c9'), (-0.24, 1.6, 0.3, 0.42, '#24476b', '#f3c64a', '#e9e1cf'), (0.62, 1.53, 0.34, 0.46, '#f5e7c8', '#2f7d5b', '#d9774a'))
                                               if f['what'] == 'floor1' else ((-0.62, 1.55, 0.34, 0.46, '#f5e7c8', '#2f6f8a', '#e0a24a'), (0.1, 1.58, 0.3, 0.42, '#fbfaf4', '#5b3e6b', '#9cc28a'), (0.6, 1.36, 0.3, 0.42, '#2d4a3a', '#efe3c2', '#c9d8de'))):
            v = y + v
            rbox(c.vc, T_, u - pw / 2, u + pw / 2, v - ph / 2, v + ph / 2, 0.03, 0.033, base)
            rbox(c.vc, T_, u - pw / 2 + 0.02, u + pw / 2 - 0.02, v + ph / 2 - 0.02 - ph * 0.17, v + ph / 2 - 0.02, 0.033, 0.035, acc)          # 標題色塊
            rbox(c.vc, T_, u - pw / 2 + 0.03, u + pw / 2 - 0.03, v - ph * 0.1, v + ph * 0.2, 0.033, 0.035, img)                                  # 圖
            dark = base in ('#24476b', '#2d4a3a')
            for j in range(3): rbox(c.vc, T_, u - pw / 2 + 0.03, u + pw / 2 - 0.03 - (0.07 if j == 2 else 0.0), v - ph * 0.2 - j * 0.04 - 0.012, v - ph * 0.2 - j * 0.04, 0.033, 0.035, '#e9e6dc' if dark else '#4a4d52')   # 幾行字（細線）
            for sx in (-1, 1): rbox(c.vc, T_, u + sx * (pw / 2 - 0.03) - 0.008, u + sx * (pw / 2 - 0.03) + 0.008, v + ph / 2 - 0.018, v + ph / 2 - 0.002, 0.035, 0.038, '#d33b2f')   # 圖釘
        for (u, v, pw, ph) in ((0.2 if f['what'] == 'floor1' else -0.26, 1.78, 0.21, 0.3), (0.2 if f['what'] == 'floor1' else -0.24, 1.3, 0.21, 0.3), (-0.86, 1.18, 0.14, 0.1), (0.86, 1.86, 0.15, 0.1)):
            v = y + v; rbox(c.vc, T_, u - pw / 2, u + pw / 2, v - ph / 2, v + ph / 2, 0.03, 0.033, rng.choice(['#fbfaf4', '#fff3c4', '#d9ecf4', '#ffffff']))
            for j in range(int(ph / 0.05)): rbox(c.vc, T_, u - pw / 2 + 0.02, u + pw / 2 - 0.02 - (0.04 if j % 3 == 2 else 0.0), v + ph / 2 - 0.04 - j * 0.035, v + ph / 2 - 0.032 - j * 0.035, 0.033, 0.035, '#6a6d72')
    elif k == 'water':                                                                    # 飲水機：不鏽鋼機身、上面的出水口、接水盤、三個按鈕
        x, z = f['x'], f['z']
        c.vm.cbox(x - 0.2, x + 0.2, y, y + 1.2, z - 0.2, z + 0.2, '#c9ccd0'); c.vm.cbox(x - 0.16, x + 0.16, y + 0.88, y + 1.05, z + 0.2, z + 0.23, '#4a4e52')
        c.vm.cbox(x - 0.15, x + 0.15, y + 0.62, y + 0.66, z + 0.18, z + 0.3, '#8f9599'); c.vm.cbox(x - 0.03, x + 0.03, y + 0.98, y + 1.02, z + 0.23, z + 0.27, '#2b2b2b')
        for j, col in enumerate(('#d33b2f', '#e7a33a', '#2e6fb0')): c.vc.cbox(x - 0.1 + j * 0.08, x - 0.06 + j * 0.08, y + 1.08, y + 1.11, z + 0.2, z + 0.215, col)
    elif k == 'bench':                                                                    # 長椅：竹條座面＋不鏽鋼腳
        T_ = rot(f['x'], f['z'], ry); w, dd = f['w'], f['d']
        for j in range(4): rbox(c.wood, T_, -w / 2, w / 2, y + 0.42, y + 0.45, -dd / 2 + j * dd / 4 + 0.01, -dd / 2 + (j + 1) * dd / 4 - 0.01, r=0.004, seg=1)
        for sx in (-1, 1): rbox(c.vm, T_, sx * (w / 2 - 0.12) - 0.025, sx * (w / 2 - 0.12) + 0.025, y, y + 0.42, -dd / 2 + 0.03, dd / 2 - 0.03, '#9aa0a6')
    elif k == 'bins':                                                                     # 資源回收：一般、紙類、寶特瓶・鐵鋁罐（顏色分，字不放）
        T_ = rot(f['x'], f['z'], ry); w = f['w']; bw = (w - 0.08) / 3
        for j, col in enumerate(('#4a5058', '#2f8a4e', '#2e6fb0')):
            l0 = -w / 2 + j * (bw + 0.04); rbox(c.vc, T_, l0, l0 + bw, y, y + 0.78, -0.2, 0.2, col, r=0.02, seg=1); rbox(c.vm, T_, l0 + 0.01, l0 + bw - 0.01, y + 0.78, y + 0.82, -0.19, 0.19, '#dfe2e4')
            rbox(c.vm, T_, l0 + bw / 2 - 0.08, l0 + bw / 2 + 0.08, y + 0.815, y + 0.825, 0.0, 0.12, '#2b2b2b')
    elif k == 'planter':
        at_level(lv, lambda tm, f=f: plant(tm, f['x'], f['z'], h=1.15 if f['r'] < 0.29 else 1.35, pot='#e9e6df', leaf='#3f7a3a'))
    elif k == 'extinguisher':
        ccyl(c.vc, (f['x'], y, f['z']), (f['x'], y + 0.52, f['z']), 0.085, '#b0262a', seg=12); ccyl(c.vm, (f['x'], y + 0.52, f['z']), (f['x'], y + 0.6, f['z']), 0.03, '#2b2b2b', seg=8)
    elif k == 'clock':                                                                    # 牆上的時鐘（黑框白面、時針分針）
        x, z = f['x'], f['z']
        bm_ = bmesh.new(); bmesh.ops.create_cone(bm_, cap_ends=True, segments=24, radius1=0.17, radius2=0.17, depth=0.04)
        c.vm.add_bm(bm_, Matrix.Translation(g2b(x, y + 2.55, z)) @ Matrix.Rotation(PI / 2, 4, 'X')); bm_.free()
        c.vm.paint([q for q in c.vm.bm.faces if (q.calc_center_median() - g2b(x, y + 2.55, z)).length < 0.2], '#1f2124')
        c.vc.cbox(x - 0.15, x + 0.15, y + 2.4, y + 2.7, z - 0.03, z - 0.022, '#f7f5ef'); c.vc.cbox(x - 0.006, x + 0.006, y + 2.55, y + 2.66, z - 0.034, z - 0.03, '#1a1a1a'); c.vc.cbox(x, x + 0.08, y + 2.546, y + 2.554, z - 0.034, z - 0.03, '#1a1a1a')
    elif k == 'rules':                                                                    # 使用規則的框（字由遊戲畫）
        x, z, w = f['x'], f['z'], f['w']; c.vm.cbox(x - w / 2 - 0.03, x + w / 2 + 0.03, y + 1.17, y + 2.03, z - 0.02, z, '#3a3d41'); c.vc.cbox(x - w / 2, x + w / 2, y + 1.2, y + 2.0, z - 0.024, z - 0.02, '#fbfaf6')
    elif k == 'copier':                                                                   # 影印機（面向北：ry π）：機身、抽屜、出紙盤、掃描蓋、操作面板
        T_ = rot(f['x'], f['z'], ry); w, dd = f['w'], f['d']
        rbox(c.vc, T_, -w / 2, w / 2, y + 0.06, y + 0.92, -dd / 2, dd / 2, '#e8e8e3', r=0.015, seg=1); rbox(c.vm, T_, -w / 2 + 0.02, w / 2 - 0.02, y, y + 0.06, -dd / 2 + 0.02, dd / 2 - 0.02, '#3a3d41')
        for j in range(3): rbox(c.vm, T_, -w / 2 + 0.03, w / 2 - 0.03, y + 0.12 + j * 0.22, y + 0.124 + j * 0.22, dd / 2, dd / 2 + 0.004, '#9a9ea3'); rbox(c.vm, T_, -0.08, 0.08, y + 0.25 + j * 0.22, y + 0.27 + j * 0.22, dd / 2, dd / 2 + 0.02, '#5a5e64')
        rbox(c.vc, T_, -w / 2 + 0.02, w / 2 - 0.02, y + 0.92, y + 1.08, -dd / 2 + 0.02, dd / 2 - 0.06, '#c9ccce', r=0.01, seg=1); rbox(c.vm, T_, w / 2 - 0.3, w / 2 - 0.04, y + 1.0, y + 1.06, dd / 2 - 0.12, dd / 2 + 0.04, '#2c2f34')
        rbox(c.get('screen'), T_, w / 2 - 0.26, w / 2 - 0.12, y + 1.061, y + 1.065, dd / 2 - 0.08, dd / 2 + 0.01); rbox(c.vc, T_, -w / 2 + 0.06, -0.05, y + 0.76, y + 0.79, dd / 2 - 0.05, dd / 2 + 0.16, '#fbfaf4')
    elif k == 'cardKiosk':
        T_ = rot(f['x'], f['z'], ry); w, dd = f['w'], f['d']
        rbox(c.vc, T_, -w / 2, w / 2, y, y + 1.25, -dd / 2, dd / 2, '#3c5a78', r=0.02, seg=1); rbox(c.get('screen'), T_, -0.15, 0.15, y + 0.95, y + 1.15, dd / 2, dd / 2 + 0.006); rbox(c.vm, T_, -0.12, 0.12, y + 0.7, y + 0.76, dd / 2, dd / 2 + 0.03, '#2b2b2b')
    elif k == 'sofa':                                                                     # 布沙發（灰藍）
        T_ = rot(f['x'], f['z'], ry); w = f['w']
        rbox(c.vc, T_, -w / 2, w / 2, y + 0.08, y + 0.3, -0.43, 0.43, '#6f797b', r=0.03, seg=2)
        for sx in (-1, 1): rbox(c.vc, T_, (0 if sx > 0 else -w / 2 + 0.14), (w / 2 - 0.14 if sx > 0 else 0), y + 0.3, y + 0.44, -0.27, 0.41, '#7f8a8c', r=0.04, seg=2)
        rbox(c.vc, T_, -w / 2 + 0.12, w / 2 - 0.12, y + 0.3, y + 0.82, -0.43, -0.25, '#6f797b', r=0.05, seg=2)
        for sx in (-1, 1): rbox(c.vc, T_, sx * (w / 2 - 0.07) - 0.07, sx * (w / 2 - 0.07) + 0.07, y + 0.08, y + 0.62, -0.43, 0.43, '#66706f', r=0.03, seg=2)
        for sx in (-1, 1):
            for sz in (-1, 1): rbox(c.vm, T_, sx * (w / 2 - 0.08) - 0.02, sx * (w / 2 - 0.08) + 0.02, y, y + 0.08, sz * 0.36 - 0.02, sz * 0.36 + 0.02, '#2b2b2b')
    elif k == 'lowShelf':                                                                 # 北面窗下的矮書架（竹集成材、兩層三格）：預約書架（書裡夾著紙條）／新書推薦（封面朝外立著）
        x, z, w, dd, h = f['x'], f['z'], f['w'], f['d'], f['h']; x0, x1, z0, z1 = x - w / 2, x + w / 2, z - dd / 2, z + dd / 2
        c.wood.rbox(x0, x1, y + h - 0.03, y + h, z0 - 0.01, z1 + 0.01, r=0.006, seg=1); c.wood.box(x0, x1, y, y + 0.06, z0, z1 - 0.02); c.wood.box(x0, x1, y + 0.06, y + h - 0.03, z0, z0 + 0.02)
        nc = 3
        for j in range(nc + 1): u = x0 + (x1 - x0) * j / nc; c.wood.box(u - 0.012, u + 0.012, y, y + h - 0.03, z0, z1)
        c.wood.box(x0, x1, y + h / 2 - 0.012, y + h / 2 + 0.012, z0, z1)
        for (ya, yb) in ((y + 0.06, y + h / 2 - 0.012), (y + h / 2 + 0.012, y + h - 0.03)):
            for j in range(nc):
                u0, u1 = x0 + (x1 - x0) * j / nc + 0.03, x0 + (x1 - x0) * (j + 1) / nc - 0.03; u = u0
                while u < u1 - 0.05:
                    bw = rng.uniform(0.025, 0.05); bh = min(yb - ya - 0.03, rng.uniform(0.2, 0.3))
                    c.vc.cbox(u, u + bw, ya, ya + bh, z0 + 0.03, z0 + 0.03 + rng.uniform(0.17, 0.22), rng.choice(['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f']))
                    if f['what'] == 'reserve' and rng.random() < 0.7: c.vc.cbox(u + bw * 0.3, u + bw * 0.7, ya + bh, ya + bh + 0.06, z0 + 0.1, z0 + 0.16, '#fbfaf4')   # 預約單（夾在書裡、露出一截）
                    u += bw + rng.uniform(0.0, 0.006)
        if f['what'] == 'newbooks':                                                       # 新書：幾本封面朝外立在檯面上
            for j in range(6): bx = x0 + 0.3 + j * (w - 0.6) / 5; c.vc.cbox(bx - 0.08, bx + 0.08, y + h, y + h + 0.23, z1 - 0.07, z1 - 0.05, rng.choice(['#c94b3b', '#2d6cae', '#e8c34a', '#3c6b4f', '#efe9dc', '#5b3e6b']))
    elif k == 'slatWall':                                                                 # 竹木條牆（深色底板＋一條一條的竹條）＋中間一個樓層導覽框
        x, z0, z1, h = f['x'], f['z0'], f['z1'], f['h']
        c.vc.cbox(x, x + 0.015, y + 0.1, y + h, z0, z1, '#3a332c'); zz = z0 + 0.02
        while zz < z1 - 0.03: c.wood.box(x + 0.015, x + 0.04, y + 0.1, y + h, zz, zz + 0.045); zz += 0.075
        zc = (z0 + z1) / 2; c.vm.cbox(x + 0.04, x + 0.06, y + 1.0, y + 2.0, zc - 0.65, zc + 0.65, '#3a3d41'); c.vc.cbox(x + 0.06, x + 0.065, y + 1.04, y + 1.96, zc - 0.61, zc + 0.61, '#f6f4ee')
        for (a_, b_, za, zb) in ((1.15, 1.45, -0.5, -0.05), (1.15, 1.45, 0.05, 0.5), (1.55, 1.85, -0.5, 0.5)): c.vc.cbox(x + 0.065, x + 0.068, y + a_, y + b_, zc + za, zc + zb, '#c8d3d8')   # 導覽圖上的方塊（一樓、二樓的平面）
    elif k == 'hose':                                                                     # 消防栓箱：紅色鋼板箱、上面一顆紅色警示燈
        T_ = rot(f['x'], f['z'], ry)
        rbox(c.vc, T_, -0.37, 0.37, y + 0.25, y + 1.55, 0.0, 0.12, '#b3262b', r=0.01, seg=1); rbox(c.vc, T_, -0.3, 0.3, y + 0.8, y + 1.45, 0.12, 0.123, '#d8dcde'); rbox(c.vc, T_, -0.3, 0.3, y + 0.35, y + 0.7, 0.12, 0.123, '#8c1d21')
        rbox(c.vc, T_, -0.05, 0.05, y + 1.62, y + 1.72, 0.0, 0.07, '#e03a30')
    elif k == 'exitSign':                                                                 # 避難方向指示燈（綠色，自己發光；字和跑步的人由遊戲畫的指標代替，這裡只有燈箱）
        T_ = rot(f['x'], f['z'], ry); yy = y + f['y']
        rbox(c.vm, T_, -0.22, 0.22, yy - 0.08, yy + 0.08, -0.03, 0.03, '#e6e8e6'); rbox(c.get('exit'), T_, -0.19, 0.19, yy - 0.06, yy + 0.06, 0.03, 0.033)
        if f.get('hang'): rbox(c.get('exit'), T_, -0.19, 0.19, yy - 0.06, yy + 0.06, -0.033, -0.03); ccyl(c.vm, (f['x'], yy + 0.08, f['z']), (f['x'], RY - Y1 + y, f['z']), 0.008, '#9aa0a6', seg=6)
    elif k == 'umbrella':                                                                 # 傘架（不鏽鋼桶＋幾把傘）
        x, z, r_ = f['x'], f['z'], f['r']
        clathe(c.vm, [(0.0, 0.0), (r_, 0.0), (r_ * 0.95, 0.55), (r_ - 0.02, 0.55), (r_ * 0.9, 0.06), (0.0, 0.06)], x, y, z, '#9aa0a6', seg=16)
        for j in range(4): a_ = j * 1.6 + 0.3; ccyl(c.vc, (x + 0.06 * math.cos(a_), y + 0.08, z + 0.06 * math.sin(a_)), (x + 0.11 * math.cos(a_), y + 0.88, z + 0.11 * math.sin(a_)), 0.035, ['#22303f', '#7a2a2a', '#2f4a3a', '#c9a24f'][j], seg=8)
    elif k == 'posterStand':                                                              # 海報立牌（A 字型細鋁框、兩面都貼海報；正面的字由遊戲畫）
        T_ = rot(f['x'], f['z'], ry); w = f['w']
        for sz, sgn in ((0.0, 1), (-0.3, -1)):
            for lx in (-w / 2, w / 2 - 0.025): rbox(c.vm, T_, lx, lx + 0.025, y, y + 1.5, sz - 0.012, sz + 0.012, '#c4c8cb')
            for yy in (y + 0.5, y + 1.47): rbox(c.vm, T_, -w / 2, w / 2, yy, yy + 0.03, sz - 0.012, sz + 0.012, '#c4c8cb')
            rbox(c.vc, T_, -w / 2 + 0.025, w / 2 - 0.025, y + 0.53, y + 1.47, sz - 0.006, sz + 0.006, '#f6f1e4')
            rbox(c.vc, T_, -w / 2 + 0.07, w / 2 - 0.07, y + 0.62, y + 0.95, sz + sgn * 0.007, sz + sgn * 0.008, '#c8d6dc')   # 海報上的圖（色塊）
        rbox(c.vm, T_, -w / 2 + 0.03, w / 2 - 0.03, y + 0.2, y + 0.22, -0.3, 0.0, '#c4c8cb')
    elif k == 'kiosk':                                                                    # 自助服務機（米白機身、斜的觸控螢幕、感應區）
        T_ = rot(f['x'], f['z'], ry); w, dd = f['w'], f['d']
        rbox(c.vc, T_, -w / 2, w / 2, y, y + 1.0, -dd / 2, dd / 2, '#d9d6d0', r=0.02, seg=1); rbox(c.vm, T_, -w / 2 + 0.03, w / 2 - 0.03, y + 1.0, y + 1.42, -0.06, 0.0, '#1a1c1f')
        rbox(c.get('screen'), T_, -w / 2 + 0.06, w / 2 - 0.06, y + 1.04, y + 1.38, 0.0, 0.004); rbox(c.vm, T_, -0.1, 0.1, y + 0.9, y + 0.93, dd / 2, dd / 2 + 0.05, '#3a3e44')
    elif k == 'bookcart':                                                                 # 還書車（BB_260 §5 第 1 點）：不鏽鋼管框、三層層板（後面一條擋條）、四個輪子、一端推把；下兩層書排滿（書脊朝外）、最上層幾本平放，一本夾著紙條
        T_ = rot(f['x'], f['z'], ry); w, dd = f['w'], f['d']                                   # 窗台 1.0 m、凸出 14 cm：車高 0.95，最上層的書放前半邊
        for lx in (-w / 2 + 0.02, w / 2 - 0.02):
            for lz in (-dd / 2 + 0.02, dd / 2 - 0.02):
                (px, pz) = T_(lx, lz); ccyl(c.vm, (px, y + 0.08, pz), (px, y + 0.95, pz), 0.012, '#a7adb2', seg=8)
                (ax, az), (bx, bz) = T_(lx - 0.014, lz), T_(lx + 0.014, lz); ccyl(c.vm, (ax, y + 0.035, az), (bx, y + 0.035, bz), 0.035, '#26282b', seg=10)   # 輪子
                rbox(c.vm, T_, lx - 0.02, lx + 0.02, y + 0.065, y + 0.085, lz - 0.02, lz + 0.02, '#3a3d41')
        for yy in (y + 0.16, y + 0.52, y + 0.86):
            rbox(c.vm, T_, -w / 2 + 0.01, w / 2 - 0.01, yy - 0.018, yy, -dd / 2 + 0.01, dd / 2 - 0.01, '#b9bdc1'); rbox(c.vm, T_, -w / 2 + 0.01, w / 2 - 0.01, yy, yy + 0.05, -dd / 2 + 0.01, -dd / 2 + 0.022, '#b9bdc1')
        for lz in (-dd / 2 + 0.06, dd / 2 - 0.06):
            (ax, az), (bx, bz) = T_(-w / 2 + 0.02, lz), T_(-w / 2 - 0.07, lz); ccyl(c.vm, (ax, y + 0.92, az), (bx, y + 0.92, bz), 0.01, '#a7adb2', seg=6)
        (ax, az), (bx, bz) = T_(-w / 2 - 0.07, -dd / 2 + 0.05), T_(-w / 2 - 0.07, dd / 2 - 0.05); ccyl(c.vm, (ax, y + 0.92, az), (bx, y + 0.92, bz), 0.015, '#2b2d30', seg=8)   # 推把（黑色握把）
        BOOKC = ['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f', '#e8e2d2']
        for ya in (y + 0.16, y + 0.52):
            u = -w / 2 + 0.04
            while u < w / 2 - 0.07:
                bw = rng.uniform(0.022, 0.048); bh = rng.uniform(0.19, 0.29); bd = rng.uniform(0.16, 0.23)
                if rng.random() < 0.12: rbox(c.vc, T_, u, u + bh * 0.75, ya, ya + bw, dd / 2 - 0.03 - bd, dd / 2 - 0.03, rng.choice(BOOKC)); u += bh * 0.75 + 0.004   # 偶爾一本平放
                else: rbox(c.vc, T_, u, u + bw, ya, ya + bh, dd / 2 - 0.03 - bd, dd / 2 - 0.03, rng.choice(BOOKC)); u += bw + rng.uniform(0.0, 0.005)
        hy = y + 0.86
        for j, (u, bw, bh) in enumerate(((-0.28, 0.24, 0.035), (-0.27, 0.22, 0.03), (0.02, 0.26, 0.04), (0.25, 0.2, 0.03))):
            yb = hy + (0.035 if j == 1 else 0.0); rbox(c.vc, T_, u - bw / 2, u + bw / 2, yb, yb + bh, -0.02, 0.16, BOOKC[(j * 3 + 1) % len(BOOKC)])
        rbox(c.vc, T_, -0.33, -0.21, hy + 0.065, hy + 0.068, 0.0, 0.12, '#fbfaf4')                      # 「請勿自行上架」的紙條（字不放；遊戲的說明有）
    elif k == 'coffeeTable':
        x, z, w, dd = f['x'], f['z'], f['w'], f['d']; c.wood.rbox(x - w / 2, x + w / 2, y + 0.38, y + 0.42, z - dd / 2, z + dd / 2, r=0.01, seg=2)
        for ex in (x - w / 2 + 0.06, x + w / 2 - 0.06):
            for ez in (z - dd / 2 + 0.06, z + dd / 2 - 0.06): ccyl(c.vm, (ex, y, ez), (ex, y + 0.38, ez), 0.015, '#3a3d41', seg=6)
        for j in range(3): c.vc.cbox(x - 0.3 + j * 0.2, x - 0.14 + j * 0.2, y + 0.42, y + 0.425, z - 0.12, z + 0.1, rng.choice(['#e8e2d2', '#d9433a', '#2d6cae', '#c9b48a']))   # 幾本雜誌


# 吊牌（signs 的 hang：「自習室在二樓」「影印區」）：深色框＋兩支吊桿到天花板（字由遊戲畫在框的兩面 ±0.026）
for s in J['signs']:
    if not s.get('hang'): continue
    lv = s['lv']; c = CL(lv); yy = YF(lv) + s['y']; w = s['w']; h = w * 0.22; T_ = rot(s['x'], s['z'], s.get('ry', 0.0)); top = RY if lv == 1 else H0
    rbox(c.vm, T_, -w / 2 - 0.03, w / 2 + 0.03, yy - h / 2 - 0.03, yy + h / 2 + 0.03, -0.02, 0.02, '#2b2d30')
    for lx in (-w / 2 + 0.12, w / 2 - 0.12):
        (px, pz) = T_(lx, 0.0); ccyl(c.vm, (px, yy + h / 2 + 0.03, pz), (px, top - 0.01, pz), 0.006, '#9aa0a6', seg=6)
        rbox(c.vm, T_, lx - 0.04, lx + 0.04, top - 0.012, top - 0.002, -0.03, 0.03, '#9aa0a6')    # 天花板的固定座

# =====================================================================
# 四之二、牆面的細節：竹木腰板（自習室；BB_260 §5 第 2 點起一樓門廳、影印區、二樓走廊也是，嵌一條樓層色帶）、天花板空調出風口、窗的捲簾
# =====================================================================
def wainscot(c, along, at, inward, a0, a1, y, h, kind, skip=(), band=None):
    """腰板：牆面（中心線 at、朝房間 inward＝±1）a0～a1、高 h；skip＝[(a, b)] 門或櫃子的範圍不做；band＝色帶的顏色（腰板上緣往下 5～13 cm）"""
    face = at + inward * T / 2; segs = [(a0, a1)]
    for (sa, sb) in skip: segs = [q for (p0, p1) in segs for q in ((p0, min(p1, sa)), (max(p0, sb), p1)) if q[1] - q[0] > 0.05]
    for (p0, p1) in segs:
        d0, d1 = sorted((face, face + inward * 0.018))
        if kind == 'wood':
            if along: c.wood.box(p0, p1, y + 0.09, y + h, d0, d1)
            else: c.wood.box(d0, d1, y + 0.09, y + h, p0, p1)
            e0, e1 = sorted((face, face + inward * 0.035))
            if along: c.wood.box(p0, p1, y + h, y + h + 0.03, e0, e1)
            else: c.wood.box(e0, e1, y + h, y + h + 0.03, p0, p1)
            gtop = y + h
            if band:
                b0_, b1_ = sorted((face + inward * 0.018, face + inward * 0.021)); gtop = y + h - 0.13
                if along: c.vc.cbox(p0, p1, y + h - 0.13, y + h - 0.05, b0_, b1_, band)
                else: c.vc.cbox(b0_, b1_, y + h - 0.13, y + h - 0.05, p0, p1, band)
            u = p0 + 0.6
            while u < p1 - 0.1:                                                               # 板和板之間的細縫
                g0, g1 = sorted((face + inward * 0.018, face + inward * 0.0185))
                if along: c.vc.cbox(u - 0.002, u + 0.002, y + 0.09, gtop, g0, g1, '#6b5034')
                else: c.vc.cbox(g0, g1, y + 0.09, gtop, u - 0.002, u + 0.002, '#6b5034')
                u += 0.6
        else:
            if along: c.vc.cbox(p0, p1, y + 0.09, y + h, d0, d1, '#d6d9d3'); c.vm.cbox(p0, p1, y + h, y + h + 0.025, *sorted((face, face + inward * 0.03)), '#8f969b')
            else: c.vc.cbox(d0, d1, y + 0.09, y + h, p0, p1, '#d6d9d3'); c.vm.cbox(*sorted((face, face + inward * 0.03)), y + h, y + h + 0.025, p0, p1, '#8f969b')
SW = J['study']['doors'][1]
wainscot(C1, False, SR['x0'], 1, SR['z0'] + 0.1, ZI1, Y1, 1.1, 'wood', skip=[(SW['z'] - 0.7, SW['z'] + 0.7)])   # 自習室西牆（室內那一面）
wainscot(C1, True, ZS, -1, SR['x0'] + 0.1, XI1, Y1, 1.1, 'wood')                                            # 自習室南牆（時鐘、使用規則在腰板上面）
wainscot(C1, False, SR['x0'], -1, SR['z0'] + 0.1, ZI1, Y1, 1.0, 'wood', skip=[(SW['z'] - 0.7, SW['z'] + 0.7)], band=BAND[1])  # 南北向走廊東側（自習室西牆的走廊那一面）
wainscot(C1, False, -4.0, 1, J['research']['z0'], ZI1, Y1, 1.0, 'wood', skip=[(1.1, 3.3), (3.5, 4.5), (5.15, 6.05), (6.7, 7.7), (9.9, 10.9)], band=BAND[1])   # 研究小間的走廊那一面（公告欄、門、消防栓箱不做）
wainscot(C1, True, J['discZ'][1], 1, XI0, J['wc']['x1'], Y1, 1.0, 'wood', skip=[(-7.35, -6.25), (-5.85, -5.35), (-4.95, -3.85)], band=BAND[1])   # 洗手間前牆（門、飲水機不做）
# 一樓（BB_260 §5 第 2 點：門廳、影印休息區太白）：腰板 0.9 m（窗台 1.0 m 下面）＋陶土紅色帶；門、窗下的矮書架、消防栓箱、書庫門、館員辦公室的門不做
wainscot(C0, False, XW, 1, ZI0, -9.35, 0.0, 0.9, 'wood', band=BAND[0]); wainscot(C0, False, XW, 1, -7.45, -5.0, 0.0, 0.9, 'wood', band=BAND[0])   # 西牆（往閱覽室的門兩邊）
wainscot(C0, True, ZN, 1, XI0, XI1, 0.0, 0.9, 'wood', skip=[(-6.35, -2.45), (2.45, 5.95)], band=BAND[0])                                       # 北牆（矮書架那兩段不做）
wainscot(C0, False, XE, -1, ZI0, 2.7, 0.0, 0.9, 'wood', skip=[(-5.75, -4.65)], band=BAND[0])                                                   # 東牆（館員辦公室的門不做）
wainscot(C0, True, 2.8, -1, -3.9, XI1, 0.0, 0.9, 'wood', skip=[(-3.0, -2.2), (5.05, 6.15)], band=BAND[0])                                      # 影印區南牆（消防栓箱、書庫的門不做）
wainscot(C0, False, -4.0, 1, 0.35, 2.7, 0.0, 0.9, 'wood', band=BAND[0])                                                                        # 影印區西牆（木條牆南邊那一段）
wainscot(C0, False, -4.0, 1, -4.9, -4.35, 0.0, 0.9, 'wood', band=BAND[0])                                                                      # 影印區西牆（木條牆北邊那一小段）
wainscot(C0, True, -4.9, -1, MW['x1'], -4.1, 0.0, 0.9, 'wood', band=BAND[0])                                                                   # 樓梯 B 跑下面那面牆（門廳往南看的正面；「2F 自習室・討論室・洗手間」牌子在上面）
# 地板的樓層色嵌條：一樓門廳深色嵌條裡面再一圈陶土紅；二樓走廊沿著東西向、南北向走廊各一條灰藍綠（往自習室的方向）
for (x0, x1, z0, z1) in ((XI0 + 1.28, XI1 - 1.28, ZI0 + 1.28, -6.18),):
    for (a0, a1, b0_, b1_) in ((x0, x1, z0, z0 + 0.06), (x0, x1, z1 - 0.06, z1), (x0, x0 + 0.06, z0, z1), (x1 - 0.06, x1, z0, z1)):
        C0.vc.cbox(a0, a1, 0.0, 0.003, b0_, b1_, BAND[0])
C1.vc.cbox(XI0 + 0.3, XI1 - 0.3, Y1, Y1 + 0.003, -6.47, -6.41, BAND[1]); C1.vc.cbox(-2.13, -2.07, Y1, Y1 + 0.003, -6.41, 10.2, BAND[1])   # 南北向那條到盆栽前面停

# 天花板的空調出風口（方形四面出風：外框＋三圈）
DIFF = [(0, -4.0, -8.0), (0, 0.0, -8.0), (0, 4.0, -8.0), (0, -1.8, 0.8), (0, 4.2, 1.2), (1, -4.0, -5.8), (1, 0.0, -5.8), (1, 4.0, -5.8), (1, 0.0, -2.6), (1, 6.8, -2.6),
        (1, 1.0, 2.0), (1, 4.0, 2.0), (1, 1.0, 4.65), (1, 4.0, 4.65), (1, 1.0, 7.35), (1, 4.0, 7.35), (1, 1.0, 10.0), (1, 4.0, 10.0), (1, -2.8, 6.0)] + [(1, (d['x0'] + d['x1']) / 2 + 0.9, -7.8) for d in J['disc']]
for (lv, x, z) in DIFF:
    c = CL(lv); y = (RY if lv == 1 else H0) - 0.004
    c.vc.cbox(x - 0.3, x + 0.3, y - 0.02, y, z - 0.3, z + 0.3, '#ecebe7')
    for k_, (r_, col) in enumerate(((0.24, '#c9cac6'), (0.18, '#e8e7e3'), (0.12, '#c9cac6'), (0.06, '#e8e7e3'))): c.vc.cbox(x - r_, x + r_, y - 0.024 - k_ * 0.004, y - 0.02 - k_ * 0.004, z - r_, z + r_, col)

# 自習室東面窗的捲簾（每一格窗頂上一支捲軸；有幾格放下一半，擋一點太陽）
wst = [o for o in J['windows'] if o.get('room') == 'study'][0]; a, b = wst['a0'], wst['a1']; nm = max(1, round((b - a) / 1.5)); xr = XE - T / 2 - 0.09
for k_ in range(nm):
    u0, u1 = a + (b - a) * k_ / nm + 0.04, a + (b - a) * (k_ + 1) / nm - 0.04; yt = Y1 + wst['y1'] - 0.03
    C1.get('steel').cyl((xr, yt, u0), (xr, yt, u1), 0.035, seg=10)
    drop = (0.25, 0.0, 0.55, 0.1, 0.0, 0.45, 0.0, 0.3)[k_ % 8]
    if drop > 0.01:
        C1.vc.cbox(xr - 0.004, xr + 0.004, yt - drop * (wst['y1'] - wst['y0']), yt, u0, u1, '#e9e5da'); C1.vm.cbox(xr - 0.012, xr + 0.012, yt - drop * (wst['y1'] - wst['y0']) - 0.03, yt - drop * (wst['y1'] - wst['y0']), u0, u1, '#b9bdc1')

# 一樓東面兩扇窗也有捲簾（早上太陽從東南東照進來；BB_260 §5 第 4 點：門廳的窗太亮）
for k_w, wo in enumerate([o for o in J['windows'] if o['lv'] == 0 and o['wall'] == 'E']):
    a, b = wo['a0'], wo['a1']; nm = max(1, round((b - a) / 1.5)); xr = XE - T / 2 - 0.09
    for k_ in range(nm):
        u0, u1 = a + (b - a) * k_ / nm + 0.04, a + (b - a) * (k_ + 1) / nm - 0.04; yt = wo['y1'] - 0.03
        C0.get('steel').cyl((xr, yt, u0), (xr, yt, u1), 0.035, seg=10)
        drop = ((0.35, 0.0, 0.25), (0.0, 0.4, 0.15, 0.3))[k_w % 2][k_ % (3 if k_w % 2 == 0 else 4)]
        if drop > 0.01:
            C0.vc.cbox(xr - 0.004, xr + 0.004, yt - drop * (wo['y1'] - wo['y0']), yt, u0, u1, '#e9e5da'); C0.vm.cbox(xr - 0.012, xr + 0.012, yt - drop * (wo['y1'] - wo['y0']) - 0.03, yt - drop * (wo['y1'] - wo['y0']), u0, u1, '#b9bdc1')

# 天花板的日光燈盤（白色外框＋發光面）
LIGHTS = []
for l in J['lights']:
    lv = l['lv']; c = CL(lv); y = (RY if lv == 1 else H0) - 0.004
    c.vc.cbox(l['x'] - l['w'] / 2 - 0.03, l['x'] + l['w'] / 2 + 0.03, y - 0.02, y, l['z'] - l['d'] / 2 - 0.03, l['z'] + l['d'] / 2 + 0.03, '#f3f2ee')
    c.get('light').quad([(l['x'] - l['w'] / 2, y - 0.022, l['z'] - l['d'] / 2), (l['x'] + l['w'] / 2, y - 0.022, l['z'] - l['d'] / 2), (l['x'] + l['w'] / 2, y - 0.022, l['z'] + l['d'] / 2), (l['x'] - l['w'] / 2, y - 0.022, l['z'] + l['d'] / 2)])
    LIGHTS.append(dict(lv=lv, x=l['x'], z=l['z'], y=round(y - 0.022, 3), w=l['w'], d=l['d']))
for (x, z) in ((-6.0, -3.2), (-6.0, -0.3)):                                              # 樓梯間頂上
    C0.vc.cbox(x - 0.33, x + 0.33, RY - 0.024, RY - 0.004, z - 0.33, z + 0.33, '#f3f2ee'); C0.get('light').quad([(x - 0.3, RY - 0.026, z - 0.3), (x + 0.3, RY - 0.026, z - 0.3), (x + 0.3, RY - 0.026, z + 0.3), (x - 0.3, RY - 0.026, z + 0.3)])
    LIGHTS.append(dict(lv=2, x=x, z=z, y=round(RY - 0.026, 3), w=0.6, d=0.6))


# 討論室：側牆（東牆）一片吸音布板（深灰藍、細鋁框）
for d in J['disc']:
    xw = d['x1'] - T / 2; c = C1
    c.vc.cbox(xw - 0.03, xw, Y1 + 0.9, Y1 + 2.3, -10.4, -8.2, '#4f5b66'); c.vm.cbox(xw - 0.035, xw, Y1 + 0.88, Y1 + 0.9, -10.42, -8.18, '#b9bdc1'); c.vm.cbox(xw - 0.035, xw, Y1 + 2.3, Y1 + 2.32, -10.42, -8.18, '#b9bdc1')

# --preview-elev：只給 Blender 預覽（遊戲的電梯是 B3.buildElevator 畫的，模型在樓板上留洞）：玻璃井道＋四根角柱＋停在一樓的車廂，渲染圖才不會看起來是地板破洞
if '--preview-elev' in ARGS:
    ex0, ex1, ez0, ez1 = EL['x0'], EL['x1'], EL['z0'], EL['z1']
    for (x, z) in ((ex0 - 0.08, ez0 - 0.08), (ex1 + 0.08, ez0 - 0.08), (ex0 - 0.08, ez1 + 0.08), (ex1 + 0.08, ez1 + 0.08)): C0.get('steel').box(x - 0.07, x + 0.07, 0.0, RY, z - 0.07, z + 0.07)
    for yy in (0.0, Y1): C0.get('steel').box(ex0 - 0.15, ex1 + 0.15, yy - 0.12, yy, ez0 - 0.14, ez0 - 0.02)
    C0.get('glass').quad([(ex0 - 0.08, 0.0, ez1 + 0.08), (ex1 + 0.08, 0.0, ez1 + 0.08), (ex1 + 0.08, RY - 0.5, ez1 + 0.08), (ex0 - 0.08, RY - 0.5, ez1 + 0.08)])
    for x in (ex0 - 0.08, ex1 + 0.08): C0.get('glass').quad([(x, 0.0, ez0), (x, 0.0, ez1), (x, RY - 0.5, ez1), (x, RY - 0.5, ez0)])
    C0.vm.cbox(ex0 + 0.05, ex1 - 0.05, 0.0, 0.08, ez0 + 0.05, ez1 - 0.05, '#5a5d60'); C0.vm.cbox(ex0 - 0.2, ex1 + 0.2, RY - 0.5, RY, ez0 - 0.2, ez1 + 0.2, '#3a3d41')
    for yy in (0.0, Y1): C0.get('glass').quad([(ex0 + 0.4, yy, ez0 - 0.04), (ex1 - 0.4, yy, ez0 - 0.04), (ex1 - 0.4, yy + 2.3, ez0 - 0.04), (ex0 + 0.4, yy + 2.3, ez0 - 0.04)])

# --preview-view：只給 Blender 預覽（BB_260 §5 第 4 點「窗曝光過頭」）：窗外放遊戲用的窗景圖（一樓 soclib_north、二樓 soclib_west：都是遊戲裡拍的校園畫面，不是照片），
#   預覽的窗才和遊戲一樣亮；遊戲裡的窗景是 B3.outView（有視差），這裡只是外牆外 3 m 一整面發光的圖
if '--preview-view' in ARGS:
    for lv, name, sides in ((0, 'soclib_north_day', ('N', 'E')), (1, 'soclib_west_day', ('N', 'E', 'S'))):
        img = bpy.data.images.load(os.path.join(L.ROOT, 'assets/models/env/views', name + '.webp'))
        mat = bpy.data.materials.new(f'PREVIEW_view{lv}'); mat.use_nodes = True; nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; bs.inputs['Base Color'].default_value = (0, 0, 0, 1)
        nt.links.new(tex.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
        y0, y1 = YF(lv) - 1.0, YF(lv) + 4.6
        for sd in sides:
            if sd == 'N': q = [(XW - 4, y0, ZN - 3), (XE + 4, y0, ZN - 3), (XE + 4, y1, ZN - 3), (XW - 4, y1, ZN - 3)]
            elif sd == 'S': q = [(XE + 4, y0, ZS + 3), (XW - 4, y0, ZS + 3), (XW - 4, y1, ZS + 3), (XE + 4, y1, ZS + 3)]
            else: q = [(XE + 3, y0, ZN - 4), (XE + 3, y0, ZS + 4), (XE + 3, y1, ZS + 4), (XE + 3, y1, ZN - 4)]
            me = bpy.data.meshes.new(f'PREVIEW_view{lv}{sd}'); me.from_pydata([g2b(*p) for p in q], [], [(0, 1, 2, 3) if sd != 'E' else (0, 1, 2, 3)]); me.uv_layers.new(name='UVMap')
            for li, uv in zip(me.polygons[0].loop_indices, ((0, 0), (1, 0), (1, 1), (0, 1))): me.uv_layers[0].data[li].uv = uv
            me.materials.append(mat); ob = bpy.data.objects.new(me.name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root

# 椅子：instancing（一個網格、很多物件；GLB 的 EXT_mesh_gpu_instancing）——自習室、靠窗：竹色木頭靠背椅；討論室：辦公椅
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
    inst(par, f'chair{lv}', [(x, z, yaw, YF(lv)) for (x, z, yaw) in CHAIRS[lv]], lambda t: wchair(t, 0.0, 0.0, 0.0, 'wood', '#c9a66b'))
    inst(par, f'tchair{lv}', [(x, z, yaw, YF(lv)) for (x, z, yaw) in TCHAIRS[lv]], lambda t: LU.task_chair(t, 0.0, 0.0, 0.0, '#3a4a58'))

# =====================================================================
# 完成：外牆一面一個物件（遊戲淡出）、其他同層同材質合併；材質改單面（玻璃照舊雙面）
# =====================================================================
for wid, (m, par, d) in WALLS.items(): m.finish(par, props={'dir': d})
C0.finish(); C1.finish()
L.merge_by_material(root, keep=lambda ob: 'WALL_' in ob.name or ob.name.startswith('INST_') or (ob.data.users > 1), key=lambda ob: 'L0' if ob.parent == R0 else 'L1')
# --nosingle：只給 Cycles 預覽用（render_cycles.py 不剔除反面：single_side 給開口的零件補的反面和正面疊在一起，打到反面就整片黑；烘焙的 bake_room.py 會先拿掉反面，遊戲會剔除反面）
_ss = None if '--nosingle' in ARGS else L.single_side(root, keep=r'glass|frost', nodup=r'(ceil|lightpanel)', skip=lambda ob: ob.name.startswith('INST_'))
tris = {}
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris[ob.name] = len(ob.data.loop_triangles)
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=sum(tris.values()), tris_by_object=dict(sorted(tris.items(), key=lambda kv: -kv[1])[:40]),
             seats=len(J['seats']), chairs={k: len(v) for k, v in CHAIRS.items()}, tchairs={k: len(v) for k, v in TCHAIRS.items()}, outlets=len(OUTLETS),
             lights={'panels': LIGHTS, 'H0': H0, 'RY': RY, 'note': '日光燈盤（發光面在天花板下 2.2 cm；lv 2＝樓梯間頂上）；lightbake/bake_soclib2f.sh 讀這裡'}))
print(json.dumps({'SOCLIB2F': 'OK', 'tris': sum(tris.values()), 'walls': len(WALLS), 'chairs': {k: len(v) for k, v in CHAIRS.items()}, 'outlets': len(OUTLETS)}, ensure_ascii=False))
