"""宿舍房間（遊戲 dorm 區域：玩家每天起床的地方）室內 → GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_interior.py [-- --out assets/models/env/second_ai/dorm_interior.glb]

座標＝遊戲 dorm 區域的座標（room() 6×7×3.0 m；門在前牆 z=+3.5 中間，窗在後牆 x=1.5、中心高 2.1、2.2×1.6）。
只換畫面：導航、床（睡覺）、書桌座位、離開 (0,3.3)、出生點在 src/zones3d.js 的 dorm 區塊，不變；
家具的位置與佔地照套件：床 1.1×2.1 在 (−2.2,−1.5)（床頭朝後牆）、書架 2.4 m 長在 (−1,−3.3) 靠後牆、
我的書桌 1.6×0.7 在 (1.8,−2.6)＋椅子 (1.8,−1.9)、室友的書桌在 (1.8,1.5)＋椅子 (1.8,2.2)（椅子都朝 −z）。
椅子座面 0.485 m、桌面 0.77 m（和套件一樣，坐下的姿勢不用改）。沒有在走得到的地方加新的家具；牆上的東西（冷氣、掛勾、毛巾、帆布袋、窗簾）不佔地，而且放在那面牆的 WALL_ 群組裡（牆淡出時一起淡出，不會浮在半空中）。
牆上的月曆和床頭的社團傳單是遊戲原本的 canvas（留在遊戲裡，不在 GLB）。

台灣大學宿舍的雙人房：米白漆牆＋深灰踢腳板、米色磨石子地板、兩組日光燈、分離式冷氣、鋁框推拉窗＋紗窗＋窗簾、木門（壓把、門檔）；
木床（床頭板、床尾板、床墊、藍色被子、枕頭、床下收納箱）、書架（法律書、六法、講義夾、雜物）、
我的書桌（抽屜櫃、筆電、檯燈、書、馬克杯、筆筒）、室友的書桌（兩台螢幕、鍵盤、耳機、零食）、辦公椅（五爪腳、氣壓桿、網背）。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01, combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_interior.glb'))

W, D, H = 6.0, 7.0, 3.0
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
T = 0.1                                           # 牆的厚度（室內面在 ±2.9／±3.4；遊戲的月曆、傳單在 ±2.88，正好貼在牆前）
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
WIN = (0.45, 2.55, 1.32, 2.86)                    # 後牆的窗洞 x0,x1,y0,y1（遊戲的窗景平面 2.2×1.6 在 x=1.5、中心 2.1，往外 0.42 m）
DOOR = (-0.48, 0.48, 2.1)                         # 前牆的門洞 x0,x1,高
random.seed(17)
B.reset(texres=512)
root = B.group('dorm_interior', props={'kind': 'dorm_interior', 'w': W, 'd': D, 'h': H})
M = {
    'floor': L.pbr('dorm_floor', 'terrazzo_tiles', tile=1.2, target='#d3c9b6', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.42),
    'wall': L.pbr('dorm_wall', 'painted_plaster_wall', tile=1.6, target='#eee8dc', normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.88),
    'skirt': L.flat('dorm_skirting', '#6e6a63', rough=0.5),
    'ceil': L.flat('dorm_ceiling', '#f3f0e9', rough=0.92, cull=True),
    'tube': L.flat('dorm_tube', '#ffffff', rough=0.3, emit=B.srgb('#fff7ea')), 'fixture': L.flat('dorm_fixture', '#e9e9e4', rough=0.35, metal=0.2),
    'alu': L.flat('dorm_alu', '#c5c8ca', rough=0.32, metal=0.45), 'glass': L.flat('dorm_glass', '#dfe8ec', rough=0.05, alpha=0.16),
    'screen': L.flat('dorm_insect_screen', '#3c4044', rough=0.6, alpha=0.38), 'sill': L.pbr('dorm_sill', 'terrazzo_tiles', tile=0.8, target='#bdb4a4', maps=('diff',), res=256, rough_value=0.35),
    'curtain': L.flat('dorm_curtain', '#c9b48a', rough=0.95), 'rod': L.flat('dorm_rod', '#8a8f94', rough=0.3, metal=0.45),
    'wood': L.pbr('dorm_wood', 'walnut_veneer', tile=0.9, target='#b48b61', maps=('diff',), res=512, rough_value=0.5),
    'wood_dark': L.pbr('dorm_wood_dark', 'walnut_veneer', tile=0.9, target='#6f4e34', maps=('diff',), res=256, rough_value=0.5),
    'door': L.pbr('dorm_door', 'walnut_veneer', tile=1.4, target='#8b6646', maps=('diff',), res=256, rough_value=0.45), 'trim': L.flat('dorm_trim', '#e4ded2', rough=0.5),
    'metal': L.flat('dorm_metal', '#8d9298', rough=0.35, metal=0.45), 'chrome': L.flat('dorm_chrome', '#c9ced2', rough=0.18, metal=0.45),
    'black': L.flat('dorm_black', '#202225', rough=0.45), 'fabric': L.flat('dorm_chair_fabric', '#33373d', rough=0.85),
    'mattress': L.flat('dorm_sheet', '#eef0f0', rough=0.9), 'duvet': L.flat('dorm_duvet', '#4d6f8f', rough=0.95), 'pillow': L.flat('dorm_pillow', '#fbfaf6', rough=0.95),
    'ac': L.flat('dorm_ac', '#f3f3f0', rough=0.35), 'plastic': L.flat('dorm_box_plastic', '#cfdde6', rough=0.3, alpha=0.75),
    'lcd': L.flat('dorm_lcd', '#7fa8c9', rough=0.2, emit=B.srgb('#5f86a8')), 'lamp': L.flat('dorm_lamp_bulb', '#fff4d8', rough=0.3, emit=B.srgb('#ffe9b8')),
    'items': L.vc_material('dorm_items', rough=0.6),          # 書、講義夾、杯子、零食、雜物：顏色在頂點色（一次 draw call）
}
walls = {'front': [], 'back': [], 'left': [], 'right': []}


def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=T):
    """沿牆的一段（a＝沿牆座標：前後牆是 x、左右牆是 z；t＝從牆外緣往內）"""
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


def soft_box(m, x0, x1, y0, y1, z0, z1, r=0.03, seg=2):
    """圓角方塊（被子、床墊、枕頭、椅墊）：先做方塊再倒角"""
    bm = bmesh.new(); L.bm_box(bm, x0, x1, y0, y1, z0, z1)
    r = min(r, (x1 - x0) / 2.2, (y1 - y0) / 2.2, (z1 - z0) / 2.2)
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


def fin(m, smooth=None, uv=True):
    if m.empty(): return None
    bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
    ob = m.finish(root, uv=uv)
    if smooth: L.smooth_mesh(ob, angle=smooth)
    return ob


# ---------------- 地板、天花板、日光燈 ----------------
Mesh('dorm_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh('dorm_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
tb = Mesh('dorm_tubes', M['tube']); fx = Mesh('dorm_fixtures', M['fixture'])
for z in (-1.6, 1.6):                                 # 兩組雙管日光燈（燈座＋兩根燈管＋格柵）
    fx.box(-0.66, 0.66, H - 0.07, H - 0.01, z - 0.16, z + 0.16)
    for dz in (-0.06, 0.06): tb.cyl((-0.6, H - 0.1, z + dz), (0.6, H - 0.1, z + dz), 0.014, seg=6)
    for dx in (-0.4, 0.0, 0.4): fx.box(dx - 0.005, dx + 0.005, H - 0.13, H - 0.07, z - 0.16, z + 0.16)
fx.box(1.3, 1.42, H - 0.035, H, -0.06, 0.06)            # 偵煙器
tb.finish(root, uv=False); fx.finish(root, uv=False)

# ---------------- 牆：米白漆＋深灰踢腳板；後牆有窗、前牆有門 ----------------
for side, (a0, a1) in (('left', (Z0, Z1)), ('right', (Z0, Z1))):
    wall_box(side, 'wall', a0, a1, 0.0, H); wall_box(side, 'skirt', a0 + T, a1 - T, 0.0, 0.09, T, T + 0.012)
x0w, x1w, y0w, y1w = WIN
for a0, a1 in ((X0, x0w), (x1w, X1)): wall_box('back', 'wall', a0, a1, 0.0, H)
wall_box('back', 'wall', x0w, x1w, 0.0, y0w); wall_box('back', 'wall', x0w, x1w, y1w, H)
wall_box('back', 'skirt', X0 + T, X1 - T, 0.0, 0.09, T, T + 0.012)
dx0, dx1, dh = DOOR
for a0, a1 in ((X0, dx0), (dx1, X1)): wall_box('front', 'wall', a0, a1, 0.0, H)
wall_box('front', 'wall', dx0, dx1, dh, H)
for a0, a1 in ((X0 + T, dx0 - 0.07), (dx1 + 0.07, X1 - T)): wall_box('front', 'skirt', a0, a1, 0.0, 0.09, T, T + 0.012)

# 窗：鋁框推拉窗（兩扇、中間的重疊框）、右半邊紗窗、石材窗台、窗洞側面
fr = wm('back', 'alu'); zf = Z0 + 0.05
for y in (y0w, y1w - 0.05): fr.box(x0w, x1w, y, y + 0.05, zf - 0.03, zf + 0.04)
for x in (x0w, x1w - 0.05): fr.box(x, x + 0.05, y0w, y1w, zf - 0.03, zf + 0.04)
xm = (x0w + x1w) / 2
for dx, dz in ((-0.025, -0.015), (0.025, 0.015)): fr.box(xm + dx - 0.022, xm + dx + 0.022, y0w + 0.05, y1w - 0.05, zf + dz - 0.012, zf + dz + 0.012)
for x0s, x1s, dz in ((x0w + 0.05, xm + 0.02, -0.015), (xm - 0.02, x1w - 0.05, 0.015)):
    for y in (y0w + 0.05, y1w - 0.09): fr.box(x0s, x1s, y, y + 0.04, zf + dz - 0.012, zf + dz + 0.012)
fr.box(x1w - 0.09, x1w - 0.07, 1.95, 2.2, zf + 0.03, zf + 0.05)                                   # 把手
gl = wm('back', 'glass')
for x0s, x1s, dz in ((x0w + 0.05, xm, -0.015), (xm, x1w - 0.05, 0.015)):
    gl.quad([(x0s, y0w + 0.09, zf + dz), (x1s, y0w + 0.09, zf + dz), (x1s, y1w - 0.09, zf + dz), (x0s, y1w - 0.09, zf + dz)])
wm('back', 'screen').quad([(xm, y0w + 0.06, zf + 0.04), (x1w - 0.05, y0w + 0.06, zf + 0.04), (x1w - 0.05, y1w - 0.06, zf + 0.04), (xm, y1w - 0.06, zf + 0.04)])
wm('back', 'sill').box(x0w - 0.06, x1w + 0.06, y0w - 0.04, y0w, Z0 + 0.04, Z0 + T + 0.07)
wm('back', 'trim').box(x0w - 0.05, x0w, y0w, y1w, Z0 + T - 0.004, Z0 + T + 0.008); wm('back', 'trim').box(x1w, x1w + 0.05, y0w, y1w, Z0 + T - 0.004, Z0 + T + 0.008)
wm('back', 'trim').box(x0w - 0.05, x1w + 0.05, y1w, y1w + 0.05, Z0 + T - 0.004, Z0 + T + 0.008)

# 門：木門（關著）、白色門框、壓把、門檔、門上的通風百葉
tr = wm('front', 'trim'); zi = Z1 - T
for x in (dx0 - 0.07, dx1): tr.box(x, x + 0.07, 0.0, dh + 0.07, zi - 0.015, zi + 0.01)
tr.box(dx0 - 0.07, dx1 + 0.07, dh, dh + 0.07, zi - 0.015, zi + 0.01)
wm('front', 'door').box(dx0 + 0.01, dx1 - 0.01, 0.01, dh - 0.01, zi + 0.02, zi + 0.06)
for y0, y1 in ((0.25, 0.95), (1.15, 1.85)): wm('front', 'door').box(dx0 + 0.12, dx1 - 0.12, y0, y1, zi + 0.012, zi + 0.02)   # 門板上的凸框
lv = wm('front', 'black')
for i in range(5): lv.box(dx0 + 0.25, dx1 - 0.25, 0.08 + i * 0.028, 0.095 + i * 0.028, zi + 0.012, zi + 0.02)                     # 門下的通風百葉
ch_ = wm('front', 'chrome'); ch_.cyl((dx1 - 0.12, 1.0, zi + 0.02), (dx1 - 0.12, 1.0, zi - 0.03), 0.028, seg=10); ch_.cyl((dx1 - 0.12, 1.0, zi - 0.03), (dx1 - 0.25, 1.0, zi - 0.045), 0.012, seg=6)
ch_.cyl((dx0 + 0.15, 0.0, zi - 0.12), (dx0 + 0.15, 0.04, zi - 0.12), 0.025, seg=8)                                             # 門檔
sw = wm('front', 'trim'); sw.box(dx1 + 0.16, dx1 + 0.24, 1.22, 1.34, zi - 0.012, zi)                                               # 電燈開關
wm('front', 'black').box(dx1 + 0.185, dx1 + 0.215, 1.255, 1.305, zi - 0.016, zi - 0.012)

# ---------------- 冷氣（後牆、書架上方）、掛勾＋毛巾＋帆布袋（前牆門左邊）----------------
# 貼在牆上的東西都放進那面牆的 WALL_ 群組（wm）：牆淡出時一起淡出（2026-10-10 LAWWW 回報：原本牆淡出後它們浮在半空中）
ac = wm('back', 'ac'); soft_box(ac, -1.45, -0.55, 2.52, 2.82, Z0 + T, Z0 + T + 0.22, r=0.03, seg=2)
acl = wm('back', 'black'); acl.box(-1.4, -0.6, 2.53, 2.555, Z0 + T + 0.12, Z0 + T + 0.225)
pipe = wm('back', 'trim'); pipe.box(-0.56, -0.3, 2.58, 2.65, Z0 + T, Z0 + T + 0.06); pipe.box(-0.36, -0.3, 2.65, 2.95, Z0 + T, Z0 + T + 0.06)   # 冷媒管的蓋板（往上進牆）
hk = wm('front', 'chrome')
for i in range(4):
    x = -2.3 + i * 0.22; hk.box(x - 0.012, x + 0.012, 1.68, 1.74, Z1 - T - 0.02, Z1 - T); hk.cyl((x, 1.7, Z1 - T - 0.02), (x, 1.75, Z1 - T - 0.07), 0.008, seg=5)
hk.box(-2.42, -1.56, 1.66, 1.76, Z1 - T - 0.012, Z1 - T)
tw = wm('front', 'curtain'); soft_box(tw, -2.24, -1.94, 1.12, 1.71, Z1 - T - 0.06, Z1 - T - 0.03, r=0.012, seg=1)   # 掛勾上的毛巾、帆布袋（不佔地）
bg = wm('front', 'pillow'); soft_box(bg, -1.88, -1.56, 1.22, 1.62, Z1 - T - 0.1, Z1 - T - 0.04, r=0.02, seg=1); bg.box(-1.84, -1.83, 1.62, 1.73, Z1 - T - 0.075, Z1 - T - 0.065); bg.box(-1.61, -1.6, 1.62, 1.73, Z1 - T - 0.075, Z1 - T - 0.065)

# ---------------- 家具與雜物 ----------------
wood = Mesh('dorm_wood', M['wood'], tile=1.0); woodd = Mesh('dorm_wood_dark', M['wood_dark'], tile=1.0)
met = Mesh('dorm_metal', M['metal']); blk = Mesh('dorm_black', M['black']); fab = Mesh('dorm_chair_fabric', M['fabric'])
it = CMesh('dorm_items', M['items'])

# 床（中心 (−2.2,−1.5)，1.1×2.1，床頭朝後牆）
bx, bz = -2.2, -1.5; bx0, bx1, bz0, bz1 = bx - 0.55, bx + 0.55, bz - 1.05, bz + 1.05
for z0, z1 in ((bz0, bz0 + 0.05), (bz1 - 0.05, bz1)):
    for x in (bx0, bx1 - 0.06): wood.box(x, x + 0.06, 0.0, 0.99 if z0 == bz0 else 0.53, z0, z1)       # 四根床柱（床頭的高）
wood.box(bx0 + 0.04, bx1 - 0.04, 0.12, 0.95, bz0, bz0 + 0.035)                                     # 床頭板
woodd.box(bx0 - 0.02, bx1 + 0.02, 0.95, 0.99, bz0 - 0.01, bz0 + 0.05)
wood.box(bx0 + 0.04, bx1 - 0.04, 0.12, 0.5, bz1 - 0.035, bz1)                                      # 床尾板
for x in (bx0, bx1 - 0.035): wood.box(x, x + 0.035, 0.2, 0.34, bz0 + 0.05, bz1 - 0.05)             # 側板
sh = Mesh('dorm_sheet', M['mattress']); soft_box(sh, bx0 + 0.03, bx1 - 0.03, 0.3, 0.5, bz0 + 0.05, bz1 - 0.05, r=0.04, seg=2); fin(sh, smooth=0.7, uv=False)
dv = Mesh('dorm_duvet', M['duvet'])
soft_box(dv, bx0 - 0.02, bx1 + 0.02, 0.3, 0.56, bz0 + 0.62, bz1 - 0.06, r=0.06, seg=3)                # 被子（從枕頭下面蓋到床尾，兩邊垂到床框）
soft_box(dv, bx0 + 0.06, bx1 - 0.06, 0.55, 0.64, bz1 - 0.45, bz1 - 0.08, r=0.04, seg=2)             # 床尾摺起來的一段
for v in dv.bm.verts:                                                                                # 一點點不規則的起伏（不要像方塊）
    p = v.co; p.z += 0.012 * math.sin(p.x * 9.0) * math.cos(p.y * 7.0)
fin(dv, smooth=0.9, uv=False)
pw = Mesh('dorm_pillow', M['pillow']); soft_box(pw, bx - 0.33, bx + 0.33, 0.5, 0.62, bz0 + 0.12, bz0 + 0.5, r=0.055, seg=3)
for v in pw.bm.verts:
    if v.co.z > 0.55: v.co.z += 0.02 * (1 - min(1.0, abs(v.co.x - bx) / 0.33))
fin(pw, smooth=0.9, uv=False)
pl = Mesh('dorm_storage_box', M['plastic']); pl.box(bx0 + 0.12, bx1 - 0.12, 0.02, 0.19, bz - 0.2, bz + 0.45); fin(pl)   # 床下收納箱
blk.box(bx0 + 0.13, bx1 - 0.13, 0.185, 0.2, bz - 0.19, bz + 0.44)

# 書架（中心 (−1,−3.3)，2.4 m 長、2.4 m 高、0.4 m 深，靠後牆）：側板、兩片直隔板、五層層板、背板、底座；書與雜物用頂點色
sx0, sx1, sz0, sz1, SH = -2.2, 0.2, -3.5 + T, -3.1, 2.4
woodd.box(sx0, sx1, 0.0, SH, sz0, sz0 + 0.015)
for x in (sx0, -1.4, -0.6, sx1 - 0.025): wood.box(x, x + 0.025, 0.0, SH, sz0, sz1)
levels = [0.08, 0.55, 1.02, 1.49, 1.96]
for y in levels: wood.box(sx0, sx1, y, y + 0.025, sz0, sz1)
wood.box(sx0 - 0.01, sx1 + 0.01, SH - 0.03, SH, sz0, sz1 + 0.01); woodd.box(sx0, sx1, 0.0, 0.08, sz0 + 0.015, sz1 - 0.02)
BOOK = ['#7a1f24', '#2f4f6b', '#e3d9c2', '#3e5a48', '#b88a3a', '#5a4a6a', '#c9c3b5', '#1f3b57', '#8c3b47', '#d6cdb8', '#4a6c8c', '#a35a2a']
def books(xa, xb, y, zb, tall=0.32, lean=False):
    x = xa
    while x < xb - 0.04:
        if random.random() < 0.08: x += random.uniform(0.04, 0.1); continue
        w = random.uniform(0.022, 0.05); h = tall * random.uniform(0.72, 1.0); d = random.uniform(0.17, 0.24); c = random.choice(BOOK)
        if x + w > xb: break
        it.cbox(x, x + w, y, y + h, zb, zb + d, c, k=random.uniform(0.85, 1.05))
        if w > 0.035: it.cbox(x + 0.004, x + w - 0.004, y + h * 0.78, y + h * 0.8, zb + d, zb + d + 0.001, '#e8dcbc')   # 書背上的字帶
        x += w + 0.002
for i, y in enumerate(levels[:-1]):
    y0 = y + 0.025
    for xa, xb in ((sx0 + 0.03, -1.41), (-1.375, -0.61), (-0.575, sx1 - 0.03)):
        if (i, xa) == (1, -1.375):                                                                      # 這一格：六法全書（紅色厚書）＋講義夾
            it.cbox(xa + 0.02, xa + 0.12, y0, y0 + 0.27, sz0 + 0.05, sz0 + 0.27, '#8e1d1d'); it.cbox(xa + 0.025, xa + 0.115, y0 + 0.2, y0 + 0.23, sz0 + 0.27, sz0 + 0.271, '#d9b45a')
            for k in range(5): it.cbox(xa + 0.14 + k * 0.075, xa + 0.205 + k * 0.075, y0, y0 + 0.3, sz0 + 0.03, sz0 + 0.29, ['#2f6db0', '#f2f0ea', '#2f6db0', '#c23f35', '#f2f0ea'][k])
            continue
        if (i, xa) == (3, sx0 + 0.03):                                                                  # 這一格：盆栽、相框、小盒子
            it.cbox(xa + 0.05, xa + 0.17, y0, y0 + 0.11, sz0 + 0.1, sz0 + 0.22, '#c86f4a'); it.cbox(xa + 0.07, xa + 0.15, y0 + 0.11, y0 + 0.22, sz0 + 0.12, sz0 + 0.2, '#4e7a45')
            it.cbox(xa + 0.3, xa + 0.46, y0, y0 + 0.2, sz0 + 0.18, sz0 + 0.2, '#3a3f46'); it.cbox(xa + 0.315, xa + 0.445, y0 + 0.015, y0 + 0.185, sz0 + 0.2, sz0 + 0.201, '#d9c8a8')
            it.cbox(xa + 0.55, xa + 0.75, y0, y0 + 0.12, sz0 + 0.06, sz0 + 0.24, '#e0b95b'); continue
        books(xa, xb, y0, sz0 + 0.04, tall=0.36 if i < 2 else 0.3)
        if random.random() < 0.5:                                                                       # 疊起來躺著的書
            yy = y0
            for k in range(random.randint(2, 4)):
                hh = random.uniform(0.025, 0.045); it.cbox(xb - 0.26, xb - 0.04, yy, yy + hh, sz0 + 0.05, sz0 + 0.26, random.choice(BOOK)); yy += hh
it.cbox(-2.0, -1.65, levels[-1] + 0.025, levels[-1] + 0.3, sz0 + 0.04, sz1 - 0.04, '#b9a37f')        # 最上層：紙箱、收納盒
it.cbox(-1.2, -0.75, levels[-1] + 0.025, levels[-1] + 0.22, sz0 + 0.04, sz1 - 0.06, '#e6e2d8'); it.cbox(-0.4, -0.05, levels[-1] + 0.025, levels[-1] + 0.26, sz0 + 0.05, sz1 - 0.05, '#c8b896')


def desk(cx, cz, drawers=True):
    """書桌：1.6×0.7、桌面 0.77（厚 2.5 cm 的木桌板）；左邊三抽屜櫃、右邊金屬方管腳、背後擋板。桌子背面朝 −z（靠窗那一側）"""
    x0, x1, z0, z1 = cx - 0.8, cx + 0.8, cz - 0.35, cz + 0.35
    wood.box(x0, x1, 0.745, 0.77, z0, z1)
    woodd.box(x0 + 0.04, x1 - 0.04, 0.32, 0.72, z0 + 0.02, z0 + 0.04)
    if drawers:
        wood.box(x0 + 0.02, x0 + 0.44, 0.03, 0.745, z0 + 0.03, z1 - 0.02)
        for k, (y0, y1) in enumerate(((0.05, 0.3), (0.32, 0.52), (0.54, 0.73))):
            woodd.box(x0 + 0.04, x0 + 0.42, y0, y1, z1 - 0.02, z1 - 0.005); met.box(x0 + 0.18, x0 + 0.28, (y0 + y1) / 2 - 0.008, (y0 + y1) / 2 + 0.008, z1 - 0.005, z1 + 0.012)
    else:
        for z in (z0 + 0.05, z1 - 0.05): met.box(x0 + 0.04, x0 + 0.08, 0.0, 0.745, z - 0.02, z + 0.02)
        met.box(x0 + 0.04, x0 + 0.08, 0.03, 0.06, z0 + 0.05, z1 - 0.05)
    for z in (z0 + 0.05, z1 - 0.05): met.box(x1 - 0.08, x1 - 0.04, 0.0, 0.745, z - 0.02, z + 0.02)
    met.box(x1 - 0.08, x1 - 0.04, 0.03, 0.06, z0 + 0.05, z1 - 0.05)


def office_chair(cx, cz):
    """辦公椅（朝 −z）：五爪腳＋輪子、氣壓桿、座墊（頂 0.485）、網背、扶手"""
    for k in range(5):
        a = k * 2 * math.pi / 5 + 0.3; ex, ez = cx + 0.3 * math.cos(a), cz + 0.3 * math.sin(a)
        sweep(blk, [(cx, 0.1, cz), (ex, 0.07, ez)], 0.018, seg=5); blk.sphere((ex, 0.03, ez), 0.03, seg=8, rings=4)
    met.cyl((cx, 0.09, cz), (cx, 0.4, cz), 0.022, seg=8); blk.cyl((cx, 0.08, cz), (cx, 0.13, cz), 0.045, seg=10)
    soft_box(fab, cx - 0.24, cx + 0.24, 0.41, 0.485, cz - 0.22, cz + 0.24, r=0.03, seg=2)
    blk.box(cx - 0.03, cx + 0.03, 0.42, 0.62, cz + 0.22, cz + 0.27)
    soft_box(fab, cx - 0.22, cx + 0.22, 0.6, 1.05, cz + 0.27, cz + 0.32, r=0.025, seg=2)
    for sx in (-1, 1):
        blk.box(cx + sx * 0.25 - 0.015, cx + sx * 0.25 + 0.015, 0.45, 0.66, cz + 0.05, cz + 0.09); blk.box(cx + sx * 0.25 - 0.03, cx + sx * 0.25 + 0.03, 0.66, 0.69, cz - 0.08, cz + 0.16)


desk(1.8, -2.6); office_chair(1.8, -1.9)
desk(1.8, 1.5, drawers=False); office_chair(1.8, 2.2)

# 我的書桌上：筆電（開著）、檯燈、書、馬克杯、筆筒、手機
Y = 0.77
blk.box(1.55, 1.9, Y, Y + 0.015, -2.62, -2.38)                                                    # 筆電底座
bmL = bmesh.new(); L.bm_box(bmL, 1.55, 1.9, 0.0, 0.23, -0.008, 0.0); blk.add_bm(bmL, Matrix.Translation(g2b(0, Y + 0.015, -2.62)) @ Matrix.Rotation(-0.25, 4, 'X')); bmL.free()
lcd = Mesh('dorm_laptop_screen', M['lcd']); bmS = bmesh.new(); L.bm_box(bmS, 1.565, 1.885, 0.012, 0.218, 0.0005, 0.001)
lcd.add_bm(bmS, Matrix.Translation(g2b(0, Y + 0.015, -2.62)) @ Matrix.Rotation(-0.25, 4, 'X')); bmS.free(); fin(lcd, uv=False)
met.cyl((2.42, Y, -2.85), (2.42, Y + 0.02, -2.85), 0.07, seg=14)                                   # 檯燈：底座、兩節臂、燈罩、燈泡
sweep(met, [(2.42, Y + 0.02, -2.85), (2.38, Y + 0.32, -2.8), (2.3, Y + 0.42, -2.62)], 0.009, seg=5)
sh_ = L.lathe([(0.0, 0.0), (0.03, 0.0), (0.075, -0.09), (0.085, -0.1)], seg=14); blk.add_bm(sh_, Matrix.Translation(g2b(2.29, Y + 0.45, -2.6)) @ Matrix.Rotation(0.5, 4, 'X')); sh_.free()
bl = Mesh('dorm_lamp_bulb', M['lamp']); bl.sphere((2.285, Y + 0.385, -2.585), 0.028, seg=10, rings=6); fin(bl, uv=False)
it.cbox(1.05, 1.32, Y, Y + 0.04, -2.85, -2.48, '#8e1d1d'); it.cbox(1.07, 1.3, Y + 0.04, Y + 0.07, -2.83, -2.5, '#2f4f6b'); it.cbox(1.06, 1.31, Y + 0.07, Y + 0.09, -2.82, -2.52, '#e3d9c2')   # 書堆
it.cbox(1.22, 1.5, Y, Y + 0.012, -2.42, -2.28, '#f4f1e8'); it.cbox(1.36, 1.37, Y + 0.012, Y + 0.013, -2.42, -2.28, '#b0a890')   # 攤開的筆記本
def add_painted(bm_src, matrix, hexcol):
    it.bm.faces.ensure_lookup_table(); n0 = len(it.bm.faces); it.add_bm(bm_src, matrix); bm_src.free()
    it.bm.faces.ensure_lookup_table(); it.paint([it.bm.faces[i] for i in range(n0, len(it.bm.faces))], hexcol)
add_painted(L.lathe([(0.0, 0.0), (0.04, 0.0), (0.042, 0.1), (0.036, 0.1), (0.034, 0.012), (0.0, 0.012)], seg=14), Matrix.Translation(g2b(2.25, Y, -2.35)), '#2f6d8a')   # 馬克杯
add_painted(L.lathe([(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.03, 0.1), (0.03, 0.01), (0.0, 0.01)], seg=10), Matrix.Translation(g2b(1.43, Y, -2.74)), '#3a3f46')    # 筆筒（2026-10-14：從左前角 (1.12,−2.32) 移到書堆和筆電中間，左前角放黃金葛 prop_pothos.glb）
for k in range(4): it.cbox(1.42 + k * 0.006, 1.425 + k * 0.006, Y + 0.08, Y + 0.17, -2.745, -2.74, ['#c23f35', '#2f6db0', '#202225', '#e0b95b'][k])
it.cbox(2.0, 2.075, Y, Y + 0.008, -2.33, -2.18, '#16181b')                                         # 手機

# 室友的書桌上：兩台螢幕、鍵盤、滑鼠、耳機、零食、飲料——v2（V0-ART-DORM2，LAWWW-B）：全部放進 ROOMMATE_KAI 一個節點（經濟系那一年的 412 藏起來，換阿勳的 XUN_DESK）
KAI = B.group('ROOMMATE_KAI', root, {'kind': 'roommate_items', 'who': 'kai'})
kblk = Mesh('ROOMMATE_KAI_black', M['black']); kit = CMesh('ROOMMATE_KAI_items', M['items'])
for (mx, mz, ry) in ((1.8, 1.27, 0.0), (1.22, 1.33, 0.3)):
    bmM = bmesh.new(); L.bm_box(bmM, -0.3, 0.3, 0.06, 0.4, -0.02, 0.0); kblk.add_bm(bmM, Matrix.Translation(g2b(mx, Y + 0.08, mz)) @ Matrix.Rotation(ry, 4, 'Z')); bmM.free()
    bmN = bmesh.new(); L.bm_box(bmN, -0.29, 0.29, 0.07, 0.39, 0.0, 0.002)
    scr = Mesh(f'dorm_monitor_screen_{mx}', M['lcd']); scr.add_bm(bmN, Matrix.Translation(g2b(mx, Y + 0.08, mz)) @ Matrix.Rotation(ry, 4, 'Z')); bmN.free(); scr.finish(KAI, uv=False)
    kblk.cyl((mx, Y, mz - 0.05), (mx, Y + 0.012, mz - 0.05), 0.09, seg=12); kblk.box(mx - 0.02, mx + 0.02, Y, Y + 0.16, mz - 0.06, mz - 0.03)
kblk.box(1.55, 2.0, Y, Y + 0.02, 1.62, 1.77); kit.cbox(2.1, 2.16, Y, Y + 0.02, 1.64, 1.74, '#d9d6cf')       # 鍵盤、滑鼠
sweep(kblk, [(2.35, Y + 0.02, 1.35), (2.35, Y + 0.2, 1.38), (2.35, Y + 0.02, 1.41)], 0.012, seg=5)        # 耳機（掛著的頭帶）
kit.cbox(1.05, 1.3, Y, Y + 0.05, 1.55, 1.8, '#d65a3a'); kit.cbox(2.33, 2.4, Y, Y + 0.12, 1.6, 1.67, '#2f6db0')   # 零食、飲料
kit.cbox(2.42, 2.48, Y, Y + 0.2, 1.42, 1.48, '#e8eef0')
ob_ = kblk.finish(KAI, uv=False)
if ob_ is not None: L.smooth_mesh(ob_, angle=0.9)
kit.bm.normal_update(); kit.finish(KAI, uv=False)

fin(wood); fin(woodd); fin(met, smooth=0.9, uv=False); fin(blk, smooth=0.9, uv=False); fin(fab, smooth=0.8, uv=False)
it.bm.normal_update(); it.finish(root, uv=False)

# ---------------- 窗簾（窗的兩側收起來的波浪布）、窗簾桿：後牆的 WALL_ 群組 ----------------
cu = wm('back', 'curtain'); rd = wm('back', 'rod')
rd.cyl((x0w - 0.3, y1w + 0.12, Z0 + T + 0.08), (x1w + 0.3, y1w + 0.12, Z0 + T + 0.08), 0.012, seg=8)
for xa, xb in ((x0w - 0.28, x0w + 0.14), (x1w - 0.14, x1w + 0.28)):
    n = 9; top = y1w + 0.1; bot = y0w - 0.12; zc = Z0 + T + 0.08
    rows = []
    for yy in (top, (top + bot) / 2, bot):
        row = []
        for k in range(n + 1):
            x = xa + (xb - xa) * k / n; z = zc + (0.035 if k % 2 else -0.035) * (1.15 if yy == bot else 1.0)
            row.append(cu.bm.verts.new(g2b(x, yy, z)))
        rows.append(row)
    for a, b_ in zip(rows, rows[1:]):
        for k in range(n): cu.bm.faces.new((a[k], a[k + 1], b_[k + 1], b_[k]))
cu.bm.normal_update()

# ---------------- 收尾 ----------------
WALL_SMOOTH = {'ac': 0.6, 'curtain': 0.8, 'pillow': 0.6, 'rod': 0.9, 'chrome': 0.6}   # 貼牆零件（冷氣、毛巾、窗簾、帆布袋、窗簾桿、掛勾）照原本的平滑設定
for side, ms in walls.items():
    for m in ms:
        key = m.name.split('_', 1)[1]; m.name = f'WALL_{m.name}'; bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
        ob = m.finish(root, uv=True, props={'dir': DIRS[side]})
        if key in WALL_SMOOTH: L.smooth_mesh(ob, angle=WALL_SMOOTH[key])
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('ROOMMATE_') or (ob.parent is not None and ob.parent.name.startswith('ROOMMATE_')), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
