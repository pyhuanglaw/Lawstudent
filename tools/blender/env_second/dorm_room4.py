"""宿舍房間 v2：台大四人房（上舖床＋下面書桌的床桌組四組，進門右邊洗手間）→ GLB。LAWWW2-B，ART-DORM-LOFT。
  /opt/blenv/bin/python tools/blender/env_second/dorm_room4.py [-- --out assets/models/env/second_ai/dorm_interior.glb] [--layout 輸出配置.json]

使用者 2026-10-17 01:0x（附實際宿舍照片）：「台大宿舍是這樣 床在上面 書桌在下面 一個房間有四組這個／門口進來右邊是洗手間 再進來是四組這個」
- 照片：白色床架（實心床欄、天花板吊桿、床尾一根立柱）、床下是淺木紋書桌（抽屜櫃、白色開放層架）、高衣櫃；
  床頭那一端是木踏板的階梯收納櫃＋白色彎扶手；白色塑膠椅；淺木紋地板；捲簾；分離式冷氣；圓形吸頂燈。
- 取代 dorm_interior.py 的雙人房（舊腳本保留）。房間大小、門、出口照舊：6×7×3.0 m，門在前牆 z=+3.5 中間（x −0.48..0.48）。
- 座標＝遊戲 dorm 區域座標（x 右、y 上、z 往門）。牆內面 x ±2.9、z ±3.4。
- 配置（--layout 輸出 JSON，給 LAWWW-B 改 zones3d.js 的 dorm 區塊）：
  - 洗手間：進門右邊（+x）x 0.65..2.9、z 1.45..3.4，門開向入口走道（x=0.65 那一面）。
  - 床桌組：右牆兩組（R1 後、R2 前）、左牆兩組（L1 後、L2 前），每組沿牆 2.4 m、離牆 0.95 m；階梯在每組靠門那一端。
    R1＝祐廷（靠窗）、L1＝阿凱（ROOMMATE_KAI）、R2／L2＝另外兩個床位（ROOMMATE_C／ROOMMATE_D，有生活痕跡、人不在；要不要有室友由 AA-B／使用者決定）。
  - 窗移到後牆中間（x −1.1..1.1、y 0.95..2.4），冷氣在窗的右上方。
- 節點：WALL_<front|back|left|right|bath_n|bath_w>_*（會淡出的牆，dir＝往室內）；LOFT_TOP（四組的床板、床欄、床墊、被子、吊桿：鏡頭被擋時給遊戲做透視或淡出）；
  ROOMMATE_KAI／ROOMMATE_C／ROOMMATE_D（各自桌上的東西，可以整組藏起來）；其他照材質合併。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_interior.glb'))
LAYOUT_OUT = arg('--layout')

W, D, H = 6.0, 7.0, 3.0
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
T = 0.1
IX0, IX1, IZ0, IZ1 = X0 + T, X1 - T, Z0 + T, Z1 - T          # 牆的內面
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0], 'bath_n': [0, 0, -1], 'bath_w': [-1, 0, 0]}
WIN = (-1.1, 1.1, 0.95, 2.4)                       # 後牆的窗洞 x0,x1,y0,y1（窗景平面：中心 (0, 1.675)、2.2×1.45，往外放）
DOOR = (-0.48, 0.48, 2.1)                          # 前牆的門洞（照舊）
BATH = dict(x0=0.65, x1=IX1, z0=1.45, z1=IZ1, t=0.1, door=(2.2, 3.0), door_h=2.05)
# 床桌組：沿牆座標 u（＝z）、離牆距離 v；階梯在 ub 那一端（靠門）
VD, STW = 0.95, 0.45                               # 床桌組的深度、階梯寬
DECK0, DECK1, GUARD = 1.56, 1.60, 2.02             # 床板底、床板頂、床欄頂
RISE, NST = 0.32, 4                                # 階梯：四階、每階 32 cm（頂 1.28），再一步上床
UNITS = [('R1', 'R', IZ0 + 0.005, -1.0, 'me'), ('R2', 'R', -0.98, 1.39, 'c'), ('L1', 'L', IZ0 + 0.005, -1.0, 'kai'), ('L2', 'L', -0.98, 1.39, 'd')]
random.seed(23)
B.reset(texres=512)
root = B.group('dorm_interior', props={'kind': 'dorm_interior', 'w': W, 'd': D, 'h': H, 'version': 'loft4'})
M = {
    'floor': L.pbr('dorm_floor', 'laminate_floor_02', tile=1.6, target='#cdb594', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.45),
    'wall': L.pbr('dorm_wall', 'painted_plaster_wall', tile=1.6, target='#efeee9', contrast=0.3, normal=0.12, maps=('diff', 'nor'), res=256, rough_value=0.88),
    'skirt': L.flat('dorm_skirting', '#d9d6cf', rough=0.5),
    'ceil': L.flat('dorm_ceiling', '#f4f3ef', rough=0.92, cull=True),
    'tube': L.flat('dorm_tube', '#ffffff', rough=0.3, emit=B.srgb('#fff7ea')), 'fixture': L.flat('dorm_fixture', '#ecece8', rough=0.35, metal=0.1),
    'alu': L.flat('dorm_alu', '#c5c8ca', rough=0.32, metal=0.45), 'glass': L.flat('dorm_glass', '#dfe8ec', rough=0.05, alpha=0.16),
    'sill': L.flat('dorm_sill', '#e6e3dc', rough=0.4),
    'blind': L.flat('dorm_curtain', '#d8d2c2', rough=0.95), 'trim': L.flat('dorm_trim', '#ebe8e1', rough=0.5),
    'white': L.flat('dorm_frame_white', '#f1f0eb', rough=0.42),                               # 床架、床欄、層架、階梯側板（白色烤漆）
    'wood': L.pbr('dorm_wood', 'walnut_veneer', tile=0.8, target='#d2b893', contrast=0.85, maps=('diff',), res=512, rough_value=0.5),   # 書桌、衣櫃、踏板（淺木紋）
    'door': L.pbr('dorm_door', 'walnut_veneer', tile=1.4, target='#9b7756', maps=('diff',), res=256, rough_value=0.45),
    'metal': L.flat('dorm_metal', '#a7acb1', rough=0.35, metal=0.45), 'chrome': L.flat('dorm_chrome', '#c9ced2', rough=0.18, metal=0.45),
    'rod': L.flat('dorm_rod', '#e9e9e6', rough=0.3, metal=0.2),
    'black': L.flat('dorm_black', '#202225', rough=0.45), 'chair': L.flat('dorm_chair_white', '#f2f2ef', rough=0.32),
    'mattress': L.flat('dorm_sheet', '#eef0f0', rough=0.9), 'pillow': L.flat('dorm_pillow', '#fbfaf6', rough=0.95),
    'duvet_me': L.flat('dorm_duvet', '#4d6f8f', rough=0.95), 'duvet_kai': L.flat('dorm_duvet_kai', '#6b6f75', rough=0.95),
    'duvet_c': L.flat('dorm_duvet_c', '#5f7d62', rough=0.95), 'duvet_d': L.flat('dorm_duvet_d', '#d8c9a8', rough=0.95),
    'ac': L.flat('dorm_ac', '#f3f3f0', rough=0.35),
    'lcd': L.flat('dorm_lcd', '#7fa8c9', rough=0.2, emit=B.srgb('#5f86a8')), 'led': L.flat('dorm_lamp_bulb', '#fff4d8', rough=0.3, emit=B.srgb('#ffe9b8')),
    'items': L.vc_material('dorm_items', rough=0.6),
    'tile_w': L.pbr('dorm_bath_tile', 'long_white_tiles', tile=1.2, target='#eeeeea', maps=('diff', 'nor'), res=256, rough_value=0.25),
    'tile_f': L.pbr('dorm_bath_floor', 'floor_tiles_06', tile=0.8, target='#bfc0bd', maps=('diff',), res=256, rough_value=0.4),
    'ceramic': L.flat('dorm_ceramic', '#f7f7f5', rough=0.12), 'mirror': L.flat('dorm_mirror', '#d4dadd', rough=0.04, metal=0.45),
    'shower': L.flat('dorm_shower_curtain', '#cfe0e6', rough=0.6, alpha=0.85), 'bdoor': L.flat('dorm_bath_door', '#ecebe6', rough=0.4),
}
walls = {k: [] for k in DIRS}


def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=T):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


def soft_box(m, x0, x1, y0, y1, z0, z1, r=0.03, seg=2):
    bm = bmesh.new(); L.bm_box(bm, x0, x1, y0, y1, z0, z1)
    r = min(r, abs(x1 - x0) / 2.2, abs(y1 - y0) / 2.2, abs(z1 - z0) / 2.2)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=r, segments=seg, affect='EDGES', profile=0.5)
    m.add_bm(bm); bm.free(); return m


def sweep(m, pts, r, seg=6, caps=True):
    P = [g2b(*p) for p in pts]; bm = m.bm; rings = []
    T_ = [(P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized() for i in range(len(P))]
    ref = Vector((0, 0, 1)) if abs(T_[0].z) < 0.9 else Vector((1, 0, 0)); N = [T_[0].cross(ref).normalized()]
    for t in T_[1:]:
        n = N[-1] - t * N[-1].dot(t); N.append(n.normalized() if n.length > 1e-6 else t.cross(ref).normalized())
    for p, t, n in zip(P, T_, N):
        b = t.cross(n); rings.append([bm.verts.new(p + (n * math.cos(2 * math.pi * k / seg) + b * math.sin(2 * math.pi * k / seg)) * r) for k in range(seg)])
    for a, b_ in zip(rings, rings[1:]):
        for k in range(seg):
            j = (k + 1) % seg; bm.faces.new((a[k], a[j], b_[j], b_[k]))
    if caps: bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return m


def bend(pts, r=0.06, n=4):
    """折線的轉角改成圓弧（扶手、吊桿的彎）"""
    out = [pts[0]]
    for a, b, c in zip(pts, pts[1:], pts[2:]):
        A_, B_, C_ = Vector(a), Vector(b), Vector(c); d1 = (A_ - B_); d2 = (C_ - B_); l1, l2 = d1.length, d2.length
        rr = min(r, l1 / 2, l2 / 2); p1 = B_ + d1.normalized() * rr; p2 = B_ + d2.normalized() * rr
        for k in range(n + 1):
            t = k / n; q = (1 - t) ** 2 * p1 + 2 * (1 - t) * t * B_ + t ** 2 * p2; out.append(tuple(q))
    out.append(pts[-1]); return out


def fin(m, parent=None, smooth=None, uv=True, props=None):
    if m.empty(): return None
    bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
    ob = m.finish(parent or root, uv=uv, props=props)
    if smooth: L.smooth_mesh(ob, angle=smooth)
    return ob


# 床桌組用的「沿牆座標」：u＝z、v＝離牆距離；右牆往 −x、左牆往 +x
def wx(side, v): return IX1 - v if side == 'R' else IX0 + v
def W3(side, u, y, v): return (wx(side, v), y, u)
def lbox(m, side, u0, u1, y0, y1, v0, v1, fn='box', **kw):
    xa, xb = sorted((wx(side, v0), wx(side, v1)))
    if fn == 'box': return m.box(xa, xb, y0, y1, u0, u1)
    if fn == 'rbox': return m.rbox(xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'soft': return soft_box(m, xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'cbox': return m.cbox(xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'crbox': return m.crbox(xa, xb, y0, y1, u0, u1, **kw)


# ======================================================================= 房間：地板、天花板、燈
Mesh('dorm_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh('dorm_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
tb = Mesh('dorm_tubes', M['tube']); fx = Mesh('dorm_fixtures', M['fixture'])
for (cx, cz, r) in ((0.0, -1.7, 0.24), (0.0, 0.7, 0.24), (1.8, 2.45, 0.13)):     # 圓形吸頂燈（照片）：外殼＋乳白燈罩；最後一盞在洗手間
    fx.add_bm(L.lathe([(r, 0.0), (r, -0.035), (r - 0.02, -0.045), (0.0, -0.045)], seg=24), Matrix.Translation(g2b(cx, H - 0.002, cz)))
    tb.add_bm(L.lathe([(r - 0.03, 0.0), (r - 0.04, -0.012), (0.0, -0.016)], seg=24), Matrix.Translation(g2b(cx, H - 0.046, cz)))
fx.cyl((-1.4, H - 0.002, -0.4), (-1.4, H - 0.035, -0.4), 0.055, seg=14)        # 偵煙器
tb.finish(root, uv=False); fin(fx, smooth=0.8, uv=False)

# ======================================================================= 牆：白漆＋淺灰踢腳板；後牆有窗、前牆有門
for side in ('left', 'right'):
    wall_box(side, 'wall', Z0, Z1, 0.0, H)
x0w, x1w, y0w, y1w = WIN
for a0, a1 in ((X0, x0w), (x1w, X1)): wall_box('back', 'wall', a0, a1, 0.0, H)
wall_box('back', 'wall', x0w, x1w, 0.0, y0w); wall_box('back', 'wall', x0w, x1w, y1w, H)
dx0, dx1, dh = DOOR
for a0, a1 in ((X0, dx0), (dx1, X1)): wall_box('front', 'wall', a0, a1, 0.0, H)
wall_box('front', 'wall', dx0, dx1, dh, H)
# 踢腳板：只放在露出來的牆腳（床桌組底下、洗手間裡面不放）
sk = lambda side, a0, a1: wall_box(side, 'skirt', a0, a1, 0.0, 0.08, T, T + 0.012)
sk('back', -1.94, 1.94)
sk('front', -1.9, dx0 - 0.07); sk('front', dx1 + 0.07, BATH['x0'] - 0.005)
sk('left', 1.41, IZ1 - 0.012)

# 窗：鋁框推拉窗（兩扇）、窗台、窗洞側面、捲簾（拉下三分之一）
fr = wm('back', 'alu'); zf = Z0 + 0.05
for y in (y0w, y1w - 0.05): fr.box(x0w, x1w, y, y + 0.05, zf - 0.03, zf + 0.04)
for x in (x0w, x1w - 0.05): fr.box(x, x + 0.05, y0w + 0.05, y1w - 0.05, zf - 0.03, zf + 0.04)
xm = (x0w + x1w) / 2
for dx, dz in ((-0.025, -0.015), (0.025, 0.015)): fr.box(xm + dx - 0.022, xm + dx + 0.022, y0w + 0.05, y1w - 0.05, zf + dz - 0.012, zf + dz + 0.012)
for x0s, x1s, dz in ((x0w + 0.05, xm + 0.003, -0.015), (xm - 0.003, x1w - 0.05, 0.015)):
    for y in (y0w + 0.05, y1w - 0.09): fr.box(x0s, x1s, y, y + 0.04, zf + dz - 0.012, zf + dz + 0.012)
fr.box(x1w - 0.09, x1w - 0.07, 1.55, 1.8, zf + 0.03, zf + 0.05)                                     # 把手
gl = wm('back', 'glass')
for x0s, x1s, dz in ((x0w + 0.05, xm, -0.006), (xm, x1w - 0.05, 0.006)):
    gl.quad([(x0s, y0w + 0.09, zf + dz), (x1s, y0w + 0.09, zf + dz), (x1s, y1w - 0.09, zf + dz), (x0s, y1w - 0.09, zf + dz)])
wm('back', 'sill').box(x0w - 0.06, x1w + 0.06, y0w - 0.04, y0w - 0.002, Z0 + 0.04, IZ0 + 0.07)
for x0t, x1t in ((x0w - 0.05, x0w), (x1w, x1w + 0.05)): wm('back', 'trim').box(x0t, x1t, y0w - 0.002, y1w + 0.05, IZ0 - 0.004, IZ0 + 0.008)
wm('back', 'trim').box(x0w - 0.05, x1w + 0.05, y1w, y1w + 0.05, IZ0 - 0.004, IZ0 + 0.008)
bl = wm('back', 'blind'); zb_ = IZ0 + 0.05; ybot = y1w - 0.52                                      # 捲簾：捲軸盒、布、下襬桿、拉繩
wm('back', 'trim').rbox(x0w - 0.04, x1w + 0.04, y1w + 0.055, y1w + 0.14, IZ0 + 0.008, IZ0 + 0.1, r=0.012, seg=2)
bl.box(x0w + 0.02, x1w - 0.02, ybot, y1w + 0.06, zb_ - 0.002, zb_ + 0.002)
wm('back', 'alu').box(x0w + 0.01, x1w - 0.01, ybot - 0.025, ybot, zb_ - 0.01, zb_ + 0.01)
wm('back', 'rod').cyl((x1w - 0.12, ybot, zb_ + 0.012), (x1w - 0.12, ybot - 0.45, zb_ + 0.012), 0.003, seg=4)

# 門：木門（關著）、白色門框、壓把、門檔、門下的通風百葉、電燈開關
tr = wm('front', 'trim'); zi = IZ1
for x in (dx0 - 0.07, dx1): tr.box(x, x + 0.07, 0.0, dh + 0.07, zi - 0.015, zi + 0.01)
tr.box(dx0 - 0.07, dx1 + 0.07, dh, dh + 0.07, zi - 0.015, zi + 0.01)
wm('front', 'door').box(dx0 + 0.01, dx1 - 0.01, 0.01, dh - 0.01, zi + 0.02, zi + 0.06)
for y0, y1 in ((0.25, 0.95), (1.15, 1.85)): wm('front', 'door').box(dx0 + 0.12, dx1 - 0.12, y0, y1, zi + 0.012, zi + 0.02)
lv = wm('front', 'black')
for i in range(5): lv.box(dx0 + 0.25, dx1 - 0.25, 0.08 + i * 0.028, 0.095 + i * 0.028, zi + 0.012, zi + 0.02)
ch_ = wm('front', 'chrome'); ch_.cyl((dx1 - 0.12, 1.0, zi + 0.02), (dx1 - 0.12, 1.0, zi - 0.03), 0.028, seg=10); ch_.cyl((dx1 - 0.12, 1.0, zi - 0.03), (dx1 - 0.25, 1.0, zi - 0.045), 0.012, seg=6)
ch_.cyl((dx0 + 0.15, 0.0, zi - 0.12), (dx0 + 0.15, 0.04, zi - 0.12), 0.025, seg=8)
sw = wm('front', 'trim'); sw.box(dx0 - 0.3, dx0 - 0.22, 1.22, 1.34, zi - 0.012, zi)
wm('front', 'black').box(dx0 - 0.275, dx0 - 0.245, 1.255, 1.305, zi - 0.016, zi - 0.012)
hk = wm('front', 'chrome')                                                                           # 門左邊的掛勾＋毛巾、帆布袋
for i in range(4):
    x = -2.3 + i * 0.22; hk.box(x - 0.012, x + 0.012, 1.68, 1.74, zi - 0.02, zi); hk.cyl((x, 1.7, zi - 0.02), (x, 1.75, zi - 0.07), 0.008, seg=5)
hk.box(-2.42, -1.56, 1.66, 1.76, zi - 0.012, zi)
soft_box(wm('front', 'blind'), -2.24, -1.94, 1.12, 1.71, zi - 0.06, zi - 0.03, r=0.012, seg=1)
soft_box(wm('front', 'pillow'), -1.88, -1.56, 1.22, 1.62, zi - 0.1, zi - 0.04, r=0.02, seg=1)

# 冷氣（後牆、窗的右上方）＋冷媒管蓋板
ac = wm('back', 'ac'); soft_box(ac, 0.25, 1.15, 2.55, 2.84, IZ0, IZ0 + 0.22, r=0.03, seg=2)
wm('back', 'black').box(0.3, 1.1, 2.555, 2.575, IZ0 + 0.12, IZ0 + 0.225)
wm('back', 'trim').box(1.14, 1.4, 2.6, 2.66, IZ0, IZ0 + 0.06); wm('back', 'trim').box(1.34, 1.4, 2.66, 2.97, IZ0, IZ0 + 0.06)

# ======================================================================= 洗手間（進門右邊）：隔間牆＋門；裡面：馬桶、洗手台、鏡子、淋浴間
bx0, bx1, bz0, bz1, bt = BATH['x0'], BATH['x1'], BATH['z0'], BATH['z1'], BATH['t']
d0, d1 = BATH['door']; bdh = BATH['door_h']
wm('bath_n', 'wall').box(bx0 - bt / 2, X1 - 0.05, -0.01, H + 0.01, bz0 - bt / 2, bz0 + bt / 2)         # 北面隔間（伸進右牆裡）
bw = wm('bath_w', 'wall')
bw.box(bx0 - bt / 2, bx0 + bt / 2, -0.01, H + 0.01, bz0 + bt / 2, d0)
bw.box(bx0 - bt / 2, bx0 + bt / 2, -0.01, H + 0.01, d1, Z1 - 0.05)
bw.box(bx0 - bt / 2, bx0 + bt / 2, bdh, H + 0.01, d0, d1)
xo = bx0 - bt / 2                                                                                     # 隔間牆在房間那一面
wm('bath_n', 'skirt').box(bx0 - bt / 2 - 0.012, IX1 - 0.95 - 0.02, 0.0, 0.08, bz0 - bt / 2 - 0.012, bz0 - bt / 2)
wm('bath_w', 'skirt').box(xo - 0.012, xo, 0.0, 0.08, bz0 - bt / 2 - 0.012, d0 - 0.06)
wm('bath_w', 'skirt').box(xo - 0.012, xo, 0.0, 0.08, d1 + 0.06, IZ1 - 0.012)
bt_ = wm('bath_w', 'trim')
for z in (d0 - 0.06, d1): bt_.box(xo - 0.015, xo + 0.01, 0.0, bdh + 0.06, z, z + 0.06)
bt_.box(xo - 0.015, xo + 0.01, bdh, bdh + 0.06, d0 - 0.06, d1 + 0.06)
bd = wm('bath_w', 'bdoor'); bd.box(bx0 - 0.02, bx0 + 0.02, 0.01, bdh - 0.01, d0 + 0.01, d1 - 0.01)
for y0, y1 in ((0.3, 0.95), (1.15, 1.85)): bd.box(xo - 0.008, bx0 - 0.02, y0, y1, d0 + 0.12, d1 - 0.12)
for i in range(6): wm('bath_w', 'black').box(xo - 0.008, bx0 - 0.02, 0.06 + i * 0.03, 0.075 + i * 0.03, d0 + 0.2, d1 - 0.2)
bch = wm('bath_w', 'chrome'); bch.cyl((bx0 - 0.02, 1.0, d0 + 0.1), (xo - 0.05, 1.0, d0 + 0.1), 0.025, seg=10); bch.cyl((xo - 0.05, 1.0, d0 + 0.1), (xo - 0.065, 1.0, d0 + 0.23), 0.011, seg=6)
# 裡面（鏡頭進到洗手間時看得到）
bi0, bi1, bj0, bj1 = bx0 + bt / 2, IX1, bz0 + bt / 2, IZ1
Mesh('dorm_bath_floor', M['tile_f']).box(bi0, bi1, 0.0, 0.015, bj0, bj1).finish(root)
tw = Mesh('dorm_bath_tile', M['tile_w'])
tw.box(bi0, bi1 - 0.003, 0.015, 2.2, bj0, bj0 + 0.008); tw.box(bi0, bi1 - 0.003, 0.015, 2.2, bj1 - 0.008, bj1)
tw.box(bi0, bi0 + 0.008, 0.015, 2.2, bj0 + 0.008, d0); tw.box(bi0, bi0 + 0.008, 0.015, 2.2, d1, bj1 - 0.008); tw.box(bi0, bi0 + 0.008, bdh + 0.004, 2.2, d0, d1)
tw.box(bi1 - 0.008, bi1, 0.015, 2.2, bj0 + 0.008, bj1 - 0.008)
fin(tw)
cer = Mesh('dorm_ceramic', M['ceramic'])
tx, tz = bi1 - 0.36, bj1 - 0.42                                                                      # 馬桶（面向 −x）
cer.add_bm(L.lathe([(0.0, 0.0), (0.12, 0.0), (0.16, 0.2), (0.19, 0.38), (0.17, 0.4), (0.0, 0.4)], seg=16), Matrix.Translation(g2b(tx, 0.015, tz)) @ Matrix.Scale(1.0, 4))
cer.rbox(tx + 0.12, tx + 0.3, 0.38, 0.78, tz - 0.2, tz + 0.2, r=0.03, seg=2)
cer.add_bm(L.lathe([(0.0, 0.0), (0.2, 0.0), (0.2, 0.025), (0.0, 0.025)], seg=16), Matrix.Translation(g2b(tx - 0.02, 0.4, tz)))
sx_, sz_ = bi0 + 0.62, bj0 + 0.3                                                                      # 洗手台（靠北面隔間）＋鏡子
cer.rbox(sx_ - 0.28, sx_ + 0.28, 0.72, 0.86, bj0 + 0.008, bj0 + 0.47, r=0.04, seg=2)
cer.cyl((sx_, 0.0, bj0 + 0.15), (sx_, 0.72, bj0 + 0.15), 0.07, seg=12)
fin(cer, smooth=0.7, uv=False)
mr = Mesh('dorm_mirror', M['mirror']); mr.box(sx_ - 0.3, sx_ + 0.3, 1.1, 1.8, bj0 + 0.008, bj0 + 0.02); fin(mr, uv=False)
bch2 = Mesh('dorm_chrome', M['chrome']); bch2.cyl((sx_, 0.86, bj0 + 0.06), (sx_, 1.0, bj0 + 0.06), 0.015, seg=8); bch2.cyl((sx_, 1.0, bj0 + 0.06), (sx_, 0.97, bj0 + 0.17), 0.012, seg=6)
bch2.cyl((bi1 - 0.9, 2.05, bj0 + 0.008), (bi1 - 0.9, 2.05, bj0 + 0.95), 0.012, seg=8)                # 淋浴間的浴簾桿（東北角）
bch2.cyl((bi1 - 0.008, 1.9, bj0 + 0.45), (bi1 - 0.2, 1.9, bj0 + 0.45), 0.02, seg=8); bch2.sphere((bi1 - 0.2, 1.88, bj0 + 0.45), 0.05, seg=10, rings=6)
fin(bch2, smooth=0.8, uv=False)
shc = Mesh('dorm_shower_curtain', M['shower']); n = 12
rows = []
for yy in (2.03, 1.1, 0.12):
    row = [shc.bm.verts.new(g2b(bi1 - 0.9 + 0.035 * (1 if k % 2 else -1), yy, bj0 + 0.03 + k * 0.035)) for k in range(n + 1)]; rows.append(row)
for a, b_ in zip(rows, rows[1:]):
    for k in range(n): shc.bm.faces.new((a[k], a[k + 1], b_[k + 1], b_[k]))
fin(shc, uv=False)

# ======================================================================= 床桌組
wood = Mesh('dorm_wood', M['wood'], tile=1.0); wht = Mesh('dorm_frame_white', M['white']); met = Mesh('dorm_metal', M['metal'])
chair = Mesh('dorm_chair_white', M['chair']); blk = Mesh('dorm_black', M['black']); it = CMesh('dorm_items', M['items'])
led = Mesh('dorm_led', M['led']); lcd = Mesh('dorm_laptop_screen', M['lcd'])
TOP = B.group('LOFT_TOP', root, {'kind': 'loft_top'})
twht = Mesh('LOFT_TOP_frame', M['white']); trod = Mesh('LOFT_TOP_rod', M['rod']); tmat = Mesh('LOFT_TOP_sheet', M['mattress']); tpil = Mesh('LOFT_TOP_pillow', M['pillow'])
tduv = {k: Mesh(f'LOFT_TOP_duvet_{k}', M['duvet_' + k]) for k in ('me', 'kai', 'c', 'd')}
GROUPS = {k: (B.group(f'ROOMMATE_{k.upper()}', root, {'kind': 'roommate_items', 'who': k}) if k != 'me' else None) for k in ('me', 'kai', 'c', 'd')}
ITEMS = {k: (CMesh(f'ROOMMATE_{k.upper()}_items', M['items']) if k != 'me' else it) for k in GROUPS}
BLKS = {k: (Mesh(f'ROOMMATE_{k.upper()}_black', M['black']) if k != 'me' else blk) for k in GROUPS}
BOOK = ['#7a1f24', '#2f4f6b', '#e3d9c2', '#3e5a48', '#b88a3a', '#5a4a6a', '#c9c3b5', '#1f3b57', '#8c3b47', '#d6cdb8', '#4a6c8c', '#a35a2a']
LAYOUT = {'room': {'w': W, 'd': D, 'h': H, 'door': {'x0': dx0, 'x1': dx1}, 'exit': [0, 3.3], 'spawn': [0, 2.4]},
          'window': {'x0': x0w, 'x1': x1w, 'y0': y0w, 'y1': y1w, 'view_center': [0.0, (y0w + y1w) / 2], 'view_size': [x1w - x0w, y1w - y0w]},
          'bath': {'x0': bx0 - bt / 2, 'x1': IX1, 'z0': bz0 - bt / 2, 'z1': IZ1, 'door_z': [d0, d1], 'door_x': xo, 'door_front': [xo - 0.4, (d0 + d1) / 2]},
          'units': [], 'blocks': []}


def books_row(im, side, ua, ub, y, v0, tall=0.28):
    u = ua
    while u < ub - 0.04:
        if random.random() < 0.08: u += random.uniform(0.04, 0.1); continue
        w = random.uniform(0.022, 0.05); h = tall * random.uniform(0.72, 1.0); d = random.uniform(0.17, 0.22)
        if u + w > ub: break
        lbox(im, side, u, u + w, y, y + h, v0, v0 + d, fn='cbox', hexcol=random.choice(BOOK), k=random.uniform(0.85, 1.05)); u += w + 0.002


def plastic_chair(side, u, v):
    """白色塑膠椅（照片）：座面、彎的椅背、四支金屬腳；面向牆（往 v 小的那一邊）"""
    sgn = -1 if side == 'R' else 1                     # v 增加的方向在世界 x 的正負
    lbox(chair, side, u - 0.22, u + 0.22, 0.42, 0.455, v - 0.2, v + 0.21, fn='soft', r=0.02, seg=2)
    bmB = bmesh.new(); L.bm_box(bmB, -0.21, 0.21, 0.0, 0.34, -0.012, 0.012)
    for vv in bmB.verts: vv.co.y += 0.05 * (vv.co.x / 0.21) ** 2   # 椅背微彎（Blender y＝遊戲 −z）
    x_, _, z_ = W3(side, u, 0, v + 0.24)
    chair.add_bm(bmB, Matrix.Translation(g2b(x_, 0.58, z_)) @ Matrix.Rotation(math.pi / 2 if side == 'R' else -math.pi / 2, 4, 'Z') @ Matrix.Rotation(0.12, 4, 'X')); bmB.free()
    for du, dv in ((-0.18, -0.16), (0.18, -0.16), (-0.18, 0.17), (0.18, 0.17)):
        a = W3(side, u + du, 0.42, v + dv); b = W3(side, u + du * 1.12, 0.0, v + dv * 1.15); met.cyl(a, b, 0.011, seg=6)
    for du in (-0.16, 0.16): met.cyl(W3(side, u + du, 0.44, v + 0.2), W3(side, u + du * 0.9, 0.6, v + 0.235), 0.009, seg=5)


def loft(uid, side, ua, ub, who):
    ust = ub - STW                                     # 階梯從 ust 到 ub；床從 ua 到 ust
    # ---- 床板、床欄、立柱、吊桿（LOFT_TOP）
    lbox(twht, side, ua, ust, DECK0, DECK1, 0.005, VD - 0.025)                                      # 床板
    lbox(twht, side, ua, ust, DECK0 - 0.08, GUARD, VD - 0.025, VD, fn='rbox', r=0.008, seg=1)     # 房間那一側的實心床欄（往下包住床板邊）
    lbox(twht, side, ua + 0.001, ua + 0.026, DECK1, GUARD, 0.005, VD - 0.025)                      # 床尾（遠端）擋板
    lbox(twht, side, ust - 0.025, ust, DECK1, GUARD, 0.005, 0.47)                                  # 床頭（階梯端）只擋靠牆那一半，另一半是上下床的口
    for uu in (ua + 0.1, ust - 0.12): trod.cyl(W3(side, uu, GUARD - 0.02, VD - 0.012), W3(side, uu, H, VD - 0.012), 0.009, seg=8)   # 天花板吊桿
    for uu in (ua + 0.1, ust - 0.12): trod.cyl(W3(side, uu, H - 0.004, VD - 0.012), W3(side, uu, H - 0.012, VD - 0.012), 0.03, seg=12)
    sweep(twht, bend([W3(side, ust - 0.035, DECK1 + 0.05, 0.55), W3(side, ust - 0.035, 2.32, 0.55), W3(side, ust - 0.035, 2.32, 0.88), W3(side, ust - 0.035, GUARD - 0.03, 0.88)], r=0.07), 0.016, seg=8)   # 上下床的扶手（白色彎管）
    lbox(tmat, side, ua + 0.035, ust - 0.035, DECK1, DECK1 + 0.16, 0.03, VD - 0.05, fn='soft', r=0.04, seg=2)   # 床墊
    dv = tduv[who]; lbox(dv, side, ua + 0.5, ust - 0.06, DECK1 + 0.1, DECK1 + 0.24, 0.02, VD - 0.04, fn='soft', r=0.05, seg=2)
    if who in ('me', 'kai'): lbox(dv, side, ust - 0.5, ust - 0.08, DECK1 + 0.22, DECK1 + 0.3, 0.1, VD - 0.1, fn='soft', r=0.03, seg=2)   # 摺起來的一段
    lbox(tpil, side, ua + 0.08, ua + 0.46, DECK1 + 0.14, DECK1 + 0.26, 0.15, 0.75, fn='soft', r=0.05, seg=2)
    # ---- 床尾的立柱（照片：床的外角一根白色方管到地上）
    lbox(wht, side, ua + 0.002, ua + 0.052, 0.0, GUARD, VD, VD + 0.05, fn='rbox', r=0.008, seg=1)
    # ---- 衣櫃（階梯旁邊、床下）
    w0, w1 = ust - 0.6, ust - 0.005
    lbox(wood, side, w0, w1, 0.0, DECK0 - 0.01, 0.005, 0.585)
    lbox(wood, side, w0 + 0.008, w1 - 0.008, 0.012, DECK0 - 0.022, 0.585, 0.6)                     # 門板
    lbox(wht, side, w0, w1, 0.0, 0.05, 0.585, 0.6)                                                  # 底座（白）
    met.cyl(W3(side, w0 + 0.06, 0.7, 0.615), W3(side, w0 + 0.06, 1.15, 0.615), 0.008, seg=6)        # 長把手
    # ---- 書桌：桌板、側板、抽屜櫃、背板；牆上的白色開放層架；床板下的 LED 燈條
    k0, k1 = ua + 0.02, w0 - 0.025
    lbox(wood, side, k0, k1 + 0.025, 0.73, 0.76, 0.005, 0.62, fn='rbox', r=0.006, seg=1)
    lbox(wht, side, k1, k1 + 0.022, 0.0, 0.73, 0.005, 0.6)
    lbox(wood, side, k0, k0 + 0.42, 0.0, 0.725, 0.005, 0.56)                                        # 抽屜櫃
    for (y0, y1) in ((0.04, 0.26), (0.28, 0.5), (0.52, 0.72)):
        lbox(wood, side, k0 + 0.008, k0 + 0.412, y0, y1, 0.56, 0.575, fn='rbox', r=0.004, seg=1)
        lbox(met, side, k0 + 0.16, k0 + 0.26, (y0 + y1) / 2 - 0.007, (y0 + y1) / 2 + 0.007, 0.575, 0.59)
    lbox(wht, side, k0 + 0.42, k1, 0.32, 0.72, 0.005, 0.02)                                         # 背板
    s0, s1 = k0 + 0.45, min(k1 - 0.1, k0 + 1.15); sy0, sy1 = 1.0, 1.42                              # 層架
    lbox(wht, side, s0, s1, sy0, sy0 + 0.018, 0.005, 0.27); lbox(wht, side, s0, s1, sy1 - 0.018, sy1, 0.005, 0.27)
    for uu in (s0, (s0 + s1) / 2 - 0.009, s1 - 0.018): lbox(wht, side, uu, uu + 0.018, sy0 + 0.018, sy1 - 0.018, 0.005, 0.27)
    lbox(wood, side, s0 + 0.018, s1 - 0.018, sy0 + 0.018, sy1 - 0.018, 0.005, 0.012)                 # 層架的木紋背板
    lbox(led, side, k0 + 0.45, k1 - 0.05, DECK0 - 0.015, DECK0 - 0.005, 0.3, 0.33)
    # ---- 階梯收納櫃：四階，往牆的方向爬（v 大的一階最低）；每一階的踏板下面是朝房間開的格子
    dd = VD / NST
    for k in range(NST):
        v1 = VD - k * dd; v0 = v1 - dd; top = RISE * (k + 1); bot = RISE * k
        lbox(wood, side, ust + 0.002, ub, top - 0.025, top, v0, v1 + (0.012 if k == 0 else 0.0), fn='rbox', r=0.006, seg=1)   # 踏板
        for (a, b) in ((ust + 0.002, ust + 0.02), (ub - 0.018, ub)): lbox(wht, side, a, b, 0.0, top - 0.025, v0, v1)        # 兩側板
        lbox(wht, side, ust + 0.02, ub - 0.018, bot, top - 0.025, v0 + 0.002, v0 + 0.017)                                   # 格子的背板
        if k > 0: lbox(wht, side, ust + 0.02, ub - 0.018, bot - 0.018, bot, v0 + 0.017, v1)                                # 格子的底板
    # 階梯旁的直扶手（白色彎管，照片）：從最低一階旁邊沿著爬的方向往上
    ur = ub - 0.04
    sweep(twht, bend([W3(side, ur, RISE - 0.025, VD - dd / 2), W3(side, ur, 1.12, VD - dd / 2), W3(side, ur, 2.05, dd * 0.6), W3(side, ur, 2.2, dd * 0.6)], r=0.08), 0.016, seg=8)
    twht.cyl(W3(side, ur, RISE * NST, dd * 0.6), W3(side, ur, 2.05, dd * 0.6), 0.014, seg=8)
    # ---- 椅子
    cu_ = (k0 + 0.45 + k1) / 2
    plastic_chair(side, cu_, 0.86)
    # ---- 生活痕跡（每個人不一樣）
    im = ITEMS[who]; bk = BLKS[who]; Y = 0.76
    books_row(im, side, s0 + 0.03, (s0 + s1) / 2 - 0.02, sy0 + 0.018, 0.04, tall=0.3)               # 層架上的書
    if who == 'me':
        for j, c in enumerate(['#2f6db0', '#f2f0ea', '#2f6db0', '#c23f35', '#f2f0ea']): lbox(im, side, (s0 + s1) / 2 + 0.01 + j * 0.06, (s0 + s1) / 2 + 0.06 + j * 0.06, sy0 + 0.018, sy0 + 0.3, 0.03, 0.27, fn='cbox', hexcol=c)   # 講義夾
        lbox(im, side, k0 + 0.05, k0 + 0.33, Y, Y + 0.05, 0.08, 0.36, fn='cbox', hexcol='#8e1d1d'); lbox(im, side, k0 + 0.07, k0 + 0.31, Y + 0.05, Y + 0.08, 0.1, 0.34, fn='cbox', hexcol='#2f4f6b')   # 六法＋書堆
        lu = k0 + 0.62
        lbox(bk, side, lu - 0.17, lu + 0.17, Y, Y + 0.015, 0.2, 0.44)                                  # 筆電（開著，螢幕靠牆那一側）
        lbox(bk, side, lu - 0.17, lu + 0.17, Y + 0.015, Y + 0.24, 0.17, 0.19)
        lbox(lcd, side, lu - 0.16, lu + 0.16, Y + 0.03, Y + 0.23, 0.19, 0.192)
        lbox(im, side, lu + 0.25, lu + 0.45, Y, Y + 0.01, 0.3, 0.5, fn='cbox', hexcol='#f4f1e8')        # 攤開的筆記本
        lbox(im, side, k1 - 0.2, k1 - 0.12, Y, Y + 0.1, 0.12, 0.2, fn='cbox', hexcol='#2f6d8a')         # 馬克杯
    elif who == 'kai':
        for (du, w_) in ((0.55, 0.56), (1.02, 0.5)):
            lbox(bk, side, k0 + du - w_ / 2, k0 + du + w_ / 2, Y + 0.1, Y + 0.44, 0.1, 0.125)           # 兩台螢幕
            lbox(bk, side, k0 + du - 0.02, k0 + du + 0.02, Y, Y + 0.12, 0.13, 0.16); lbox(bk, side, k0 + du - 0.1, k0 + du + 0.1, Y, Y + 0.012, 0.08, 0.22)
        lbox(bk, side, k0 + 0.5, k0 + 0.95, Y, Y + 0.02, 0.36, 0.5)                                    # 鍵盤
        lbox(im, side, k0 + 0.05, k0 + 0.3, Y, Y + 0.05, 0.3, 0.55, fn='cbox', hexcol='#d65a3a'); lbox(im, side, k1 - 0.12, k1 - 0.06, Y, Y + 0.12, 0.42, 0.48, fn='cbox', hexcol='#2f6db0')   # 零食、飲料
        lbox(im, side, k1 - 0.22, k1 - 0.16, Y, Y + 0.2, 0.45, 0.51, fn='cbox', hexcol='#e8eef0')
    elif who == 'c':
        lbox(im, side, k0 + 0.05, k0 + 0.4, Y, Y + 0.09, 0.1, 0.38, fn='cbox', hexcol='#3a5f8a'); lbox(im, side, k0 + 0.5, k0 + 0.72, Y, Y + 0.24, 0.12, 0.2, fn='cbox', hexcol='#1f3b57')   # 原文書、檔案盒
        lbox(im, side, k1 - 0.18, k1 - 0.1, Y, Y + 0.24, 0.42, 0.5, fn='cbox', hexcol='#9aa5ad')       # 水壺
        n0 = len(im.bm.faces); im.sphere(W3(side, k1 - 0.25, 0.12, 0.3), 0.12, seg=12, rings=8); im.bm.faces.ensure_lookup_table(); im.paint([im.bm.faces[i] for i in range(n0, len(im.bm.faces))], '#c4692e')   # 書桌下的籃球
        lbox(im, side, ust - 0.5, ust - 0.08, DECK1 + 0.0, GUARD - 0.05, VD, VD + 0.03, fn='cbox', hexcol='#2b2d30')   # 掛在床欄上的外套
    else:
        lbox(im, side, k0 + 0.05, k0 + 0.3, Y, Y + 0.06, 0.1, 0.32, fn='cbox', hexcol='#e3d9c2'); lbox(im, side, k0 + 0.5, k0 + 0.62, Y, Y + 0.1, 0.12, 0.24, fn='cbox', hexcol='#c86f4a')   # 書、小盆栽
        lbox(im, side, k0 + 0.52, k0 + 0.6, Y + 0.1, Y + 0.2, 0.14, 0.22, fn='cbox', hexcol='#4e7a45'); lbox(im, side, k1 - 0.15, k1 - 0.08, Y, Y + 0.22, 0.12, 0.19, fn='cbox', hexcol='#b9b2a5')   # 保溫瓶
    for j in range(2): lbox(im, side, ub - 0.38 + j * 0.13, ub - 0.27 + j * 0.13, 0.0, 0.03, VD + 0.1, VD + 0.36, fn='cbox', hexcol={'me': '#2f4f6b', 'kai': '#202225', 'c': '#3e5a48', 'd': '#b88a3a'}[who])   # 階梯前的拖鞋
    lbox(im, side, ust + 0.03, ub - 0.03, 0.0, 0.12, VD - dd + 0.03, VD - 0.02, fn='cbox', hexcol='#e8e2d4')   # 最下面一格：鞋盒
    # ---- 配置資料（給遊戲）
    cx_, _, cz_ = W3(side, cu_, 0, 0.86)
    LAYOUT['units'].append({'id': uid, 'side': side, 'who': who, 'u': [round(ua, 3), round(ub, 3)], 'stair_u': [round(ust, 3), round(ub, 3)],
                            'footprint': {'x': sorted((round(wx(side, 0), 3), round(wx(side, VD + 0.05), 3))), 'z': [round(ua, 3), round(ub, 3)]},
                            'desk_top_y': Y, 'desk_center': [round(wx(side, 0.31), 3), round((k0 + k1) / 2, 3)],
                            'chair': [round(cx_, 3), round(cz_, 3)], 'chair_yaw': math.pi / 2 if side == 'R' else -math.pi / 2,
                            'stair_front': [round(wx(side, VD + 0.35), 3), round((ust + ub) / 2, 3)], 'bed_top_y': DECK1 + 0.16})
    LAYOUT['blocks'].append({'id': uid, 'x': sorted((round(wx(side, 0), 3), round(wx(side, VD + 0.05), 3))), 'z': [round(ua, 3), round(ub, 3)]})


for uid, side, ua, ub, who in UNITS: loft(uid, side, ua, ub, who)

# ======================================================================= 前左角：鞋櫃、垃圾桶、資源回收、曬衣架
lbox(wht, 'L', 1.62, 2.82, 0.0, 0.95, 0.005, 0.34, fn='rbox', r=0.008, seg=1)
for j in range(3): lbox(wood, 'L', 1.63 + j * 0.4, 2.01 + j * 0.4, 0.06, 0.92, 0.34, 0.352)
for j, c in enumerate(['#202225', '#e8e2d4', '#2f4f6b', '#7a1f24']): lbox(it, 'L', 1.7 + j * 0.27, 1.92 + j * 0.27, 0.95, 1.05, 0.06, 0.3, fn='cbox', hexcol=c)   # 鞋櫃上的鞋
for (x_, c) in ((-1.25, '#5f6a73'), (-0.95, '#3a6ea5')):
    n0 = len(it.bm.faces); it.add_bm(L.lathe([(0.0, 0.0), (0.12, 0.0), (0.14, 0.42), (0.0, 0.42)], seg=14), Matrix.Translation(g2b(x_, 0.0, IZ1 - 0.2))); it.bm.faces.ensure_lookup_table(); it.paint([it.bm.faces[i] for i in range(n0, len(it.bm.faces))], c)
for x_ in (-2.25, -1.6):                                                                               # 折疊曬衣架（兩個 A 字腳＋三根桿）
    met.cyl((x_, 0.0, 2.2), (x_, 1.1, 2.45), 0.008, seg=5); met.cyl((x_, 0.0, 2.7), (x_, 1.1, 2.45), 0.008, seg=5)
for (y_, dz) in ((1.1, 0.0), (0.85, -0.1), (0.85, 0.1)): met.cyl((-2.25, y_, 2.45 + dz), (-1.6, y_, 2.45 + dz), 0.006, seg=5)
it.cbox(-2.1, -1.8, 0.62, 1.1, 2.435, 2.465, '#e6e0d2'); it.cbox(-1.75, -1.62, 0.7, 1.1, 2.335, 2.365, '#4a6c8c')   # 曬著的毛巾、T 恤
LAYOUT['blocks'] += [{'id': 'shoe_cabinet', 'x': [IX0, round(IX0 + 0.36, 3)], 'z': [1.62, 2.82]}, {'id': 'bins', 'x': [-1.4, -0.8], 'z': [3.05, IZ1]}, {'id': 'drying_rack', 'x': [-2.3, -1.55], 'z': [2.15, 2.75]},
                     {'id': 'bath', 'x': [round(bx0 - bt / 2, 3), IX1], 'z': [round(bz0 - bt / 2, 3), IZ1]}]

# ======================================================================= 收尾
for k, ob in (('wood', wood), ('white', wht), ('metal', met), ('chair', chair), ('black', blk), ('led', led), ('lcd', lcd)):
    fin(ob, smooth=0.8 if k in ('metal', 'chair', 'black') else None, uv=k in ('wood', 'white'))
it.bm.normal_update(); it.finish(root, uv=False)
for k, g in GROUPS.items():
    if g is None: continue
    for m in (BLKS[k], ITEMS[k]):
        if m.empty(): continue
        m.bm.normal_update(); ob = m.finish(g, uv=False)
for m in [twht, trod, tmat, tpil] + list(tduv.values()):
    if m.empty(): continue
    bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces); ob = m.finish(TOP, uv=m is twht)
    L.smooth_mesh(ob, angle=0.8 if m is not twht else 0.6)
WALL_SMOOTH = {'ac': 0.6, 'blind': 0.8, 'pillow': 0.6, 'rod': 0.9, 'chrome': 0.6}
for side, ms in walls.items():
    for m in ms:
        key = m.name.split('_', 1)[1] if not m.name.startswith('bath_') else m.name.split('_', 2)[2]
        m.name = f'WALL_{m.name}'; bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
        ob = m.finish(root, uv=True, props={'dir': DIRS[side]})
        if key in WALL_SMOOTH: L.smooth_mesh(ob, angle=WALL_SMOOTH[key])
def keep(ob):
    p = ob
    while p is not None:
        if p.name.startswith(('ROOMMATE_', 'LOFT_TOP')): return True
        p = p.parent
    return False
L.merge_by_material(root, keep=keep, key=lambda ob: ('WALL_' + ob.name.split('_')[1] + ('_' + ob.name.split('_')[2] if ob.name.startswith('WALL_bath_') else '')) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
if LAYOUT_OUT:
    L.write_json(os.path.abspath(LAYOUT_OUT), LAYOUT)
print(json.dumps({'units': [u['id'] for u in LAYOUT['units']], 'out': OUT}, ensure_ascii=False))
