"""山嵐書店文具區 v2（SIS-STATIONERY-1110，LAWWW2-B 2026-11-10）：分區擺好的文具 → 一顆「新增用」的 GLB，再用 glb_strip_merge.py 換進 shanlan.glb。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/shanlan_stationery/stationery_add.py -- --out <新增.glb> [--root <repo 根目錄>]
配置讀 src/data/shanlan_layout.js（兩張文具桌 stationery、東牆文具架 stationery_wall）；桌子、層板、背板、最上面一層明信片是 AA 原本的（shanlan_interior.py），這裡不重做。
分區（LAWWW-B 11-10 00:51：筆、筆記本、便條、紙膠帶分區擺；原創、無品牌的文具牌，D77）：
  靠門那張桌（z 7.4）：筆——木頭筆盤（六格：黑、藍、紅、綠、粉彩、鉛筆）、三個筆筒、鉛筆盒、色鉛筆鐵盒、試寫本。分區牌「筆」。
  裡面那張桌（z 5.6）：紙膠帶——格子木盤（平放）、兩階展示台（立著、看得到中間的洞）、禮盒組、試貼板。分區牌「紙膠帶」。
  東牆文具架分三段，木隔板隔開，每段 1.2 m 那層放分區牌：
    北段（z 4.25～5.65）紙膠帶：1.2 m 立著兩排、0.8 m 掛在木棍上、0.4 m 平放疊成一柱一柱。
    中段（z 5.75～7.05）筆記本：1.2、0.8 m 封面朝外斜靠＋前面平放的庫存；0.4 m 一疊一疊。
    南段（z 7.15～8.45）便條紙：1.2 m 便利貼方塊、0.8 m 便條本斜靠＋索引貼、0.4 m 牛皮紙盒。
  架子最上面加一片頂板（AA 原本的盆栽放在 2.0 m、背板的頂上，看起來浮著）；牆上加一塊「文具選物」木牌（2.1～2.46 m）。
材質名字和 shanlan.glb 原本的一樣（shl_vc／shl_vc_gloss／shl_oak_rt），glb_strip_merge.py 照名字接進原本的網格（不多 draw call）；字是新的材質 shl_stat_label（label_atlas.py 的圖）。
座標＝遊戲座標（x 東、y 上、z 南）；顏色寫 sRGB，存成線性的頂點色（和 AA 的 shl_vc 一樣）。"""
import math, os, random, subprocess, sys, json
import bpy
import numpy as np
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
ROOT = os.path.abspath(arg('--root', os.getcwd())); OUT = os.path.abspath(arg('--out', 'stationery_add.glb'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/shanlan_layout.js')))"], cwd=ROOT))
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
TABLES = sorted(IT['stationery'], key=lambda t: -t['z'])   # [靠門 z 7.4, 裡面 z 5.6]
SW = IT['stationery_wall'][0]; X1 = LAY['w'] / 2           # 東牆面 x 7.0
TOP = 0.82                                                 # 桌面高（AA rect_table h）
SHELF_X0, SHELF_X1 = 6.68, 6.98                            # 層板前緣～背板（AA 的背板朝西那一面在 x 6.98）
LEVELS = (0.4, 0.8, 1.2)                                   # 層板頂面（1.6 那層是明信片，AA 的，不動）
ZW0, ZW1 = SW['z'] - SW['w'] / 2, SW['z'] + SW['w'] / 2    # 4.2～8.5
SECT = {'washi': (4.25, 5.65), 'notebooks': (5.75, 7.05), 'sticky': (7.15, 8.45)}
CELLS = {'plaque': (0, 0, 1024, 256), 'pens': (0, 256, 512, 512), 'washi': (512, 256, 1024, 512),
         'notebooks': (0, 512, 512, 768), 'sticky': (512, 512, 1024, 768), 'try_tape': (0, 768, 512, 1024), 'try_pen': (512, 768, 1024, 1024)}
rng = random.Random(1110)


def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def shade(h, k):
    c = [min(255, max(0, int(int(h[i:i + 2], 16) * k))) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(c)


class Bucket:
    """一個材質的幾何：頂點（遊戲座標）、面（頂點編號）、每個面角的顏色或 UV、面要不要平滑"""
    def __init__(s, name, kind): s.name, s.kind, s.V, s.F, s.C, s.UV, s.sm = name, kind, [], [], [], [], []
    def face(s, pts, col=None, uv=None, smooth=False):
        b = len(s.V); s.V += [tuple(p) for p in pts]; s.F.append(tuple(range(b, b + len(pts))))
        s.C.append([lin(col)] * len(pts) if col else None); s.UV.append(uv); s.sm.append(smooth)


B = {k: Bucket(*k_) for k, k_ in {'vc': ('shl_vc', 'vc'), 'vcg': ('shl_vc_gloss', 'vc'), 'wood': ('shl_oak_rt', 'wood'), 'label': ('shl_stat_label', 'uv')}.items()}


class Xf:
    """物件座標 → 遊戲座標：先繞 x 傾斜 tilt（往後靠），再繞 y 轉 ry，再平移"""
    def __init__(s, x, y, z, ry=0.0, tilt=0.0, roll=0.0):
        s.t = np.array([x, y, z], float); cy, sy = math.cos(ry), math.sin(ry); ct, st = math.cos(tilt), math.sin(tilt); cr, sr = math.cos(roll), math.sin(roll)
        Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, ct, -st], [0, st, ct]]); Rz = np.array([[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]])
        s.R = Ry @ Rx @ Rz
    def p(s, *v): return tuple(s.R @ np.array(v, float) + s.t)


def box(b, xf, x0, x1, y0, y1, z0, z1, col=None, cols=None, uvlab=None):
    """六面盒子。cols：{'top','bot','side','front','back'} 各面顏色（front＝+z）"""
    P = lambda x, y, z: xf.p(x, y, z)
    faces = {'top': [(x0, y1, z0), (x0, y1, z1), (x1, y1, z1), (x1, y1, z0)], 'bot': [(x0, y0, z1), (x0, y0, z0), (x1, y0, z0), (x1, y0, z1)],
             'front': [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], 'back': [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)],
             'right': [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], 'left': [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]}
    for k, q in faces.items():
        c = (cols or {}).get(k) or (cols or {}).get('side' if k in ('front', 'back', 'right', 'left') else k) or col or (cols or {}).get('side') or next(iter((cols or {}).values()), None)
        b.face([P(*v) for v in q], col=c)


def ring(b, xf, r0, r1, w, seg, col, side_cols=None, core='#d8cbb0', caps='fb', inner=True):
    """紙膠帶一捲：軸＝物件的 z（寬 w，z 0～w）；外圈 r1、中間的洞 r0。side_cols：外圈一格一格的顏色（花紋）。
    看不到的面不做（省三角形）：caps 'f'＝z＝w 那一面、'b'＝z＝0 那一面；inner＝洞的內壁"""
    pts = [(math.cos(2 * math.pi * k / seg), math.sin(2 * math.pi * k / seg)) for k in range(seg)]
    cc = shade(col, 0.86)
    for k in range(seg):
        a, c_ = pts[k], pts[(k + 1) % seg]
        sc = side_cols[k % len(side_cols)] if side_cols else col
        b.face([xf.p(a[0] * r1, a[1] * r1, w), xf.p(a[0] * r1, a[1] * r1, 0), xf.p(c_[0] * r1, c_[1] * r1, 0), xf.p(c_[0] * r1, c_[1] * r1, w)], col=sc, smooth=True)
        if 'f' in caps: b.face([xf.p(a[0] * r0, a[1] * r0, w), xf.p(a[0] * r1, a[1] * r1, w), xf.p(c_[0] * r1, c_[1] * r1, w), xf.p(c_[0] * r0, c_[1] * r0, w)], col=cc)
        if 'b' in caps: b.face([xf.p(c_[0] * r0, c_[1] * r0, 0), xf.p(c_[0] * r1, c_[1] * r1, 0), xf.p(a[0] * r1, a[1] * r1, 0), xf.p(a[0] * r0, a[1] * r0, 0)], col=cc)
        if inner: b.face([xf.p(c_[0] * r0, c_[1] * r0, w), xf.p(c_[0] * r0, c_[1] * r0, 0), xf.p(a[0] * r0, a[1] * r0, 0), xf.p(a[0] * r0, a[1] * r0, w)], col=core)


def tower(b, x, y, z, n, r0, r1, w, seg, cols):
    """平放疊起來的一柱紙膠帶（n 捲）：外圈一捲一個顏色、只有最上面一捲有頂面和洞"""
    for k in range(n):
        last = k == n - 1
        ring(b, Xf(x, y + k * w, z, 0, tilt=-math.pi / 2), r0, r1, w * 0.97, seg, cols[k % len(cols)], caps='f' if last else '', inner=last)


def cyl(b, xf, r, h, seg, col, top=None, cap=True, smooth=True):
    """直立圓柱（物件 y 0～h）"""
    pts = [(math.cos(2 * math.pi * k / seg) * r, math.sin(2 * math.pi * k / seg) * r) for k in range(seg)]
    for k in range(seg):
        a, c_ = pts[k], pts[(k + 1) % seg]
        b.face([xf.p(a[0], 0, a[1]), xf.p(a[0], h, a[1]), xf.p(c_[0], h, c_[1]), xf.p(c_[0], 0, c_[1])], col=col, smooth=smooth)
    if cap: b.face([xf.p(p[0], h, p[1]) for p in reversed(pts)], col=top or col)


def pen(b, xf, L, r, body, cap=None, tip='#2a2a2a', seg=6, pencil=False):
    """一支筆，物件的 z 方向躺（z 0～L）：筆身、筆蓋（後 30%）、筆尖（錐）。pencil＝六角、木頭色筆尖"""
    pts = [(math.cos(2 * math.pi * k / seg) * r, math.sin(2 * math.pi * k / seg) * r + r) for k in range(seg)]
    seg_def = [(0.0, 0.70, body), (0.70, 1.0, cap or body)] if not pencil else [(0.0, 0.92, body), (0.92, 1.0, '#e8c9a0')]
    for z0, z1, c in seg_def:
        for k in range(seg):
            a, c_ = pts[k], pts[(k + 1) % seg]
            b.face([xf.p(a[0], a[1], z0 * L), xf.p(c_[0], c_[1], z0 * L), xf.p(c_[0], c_[1], z1 * L), xf.p(a[0], a[1], z1 * L)], col=c, smooth=not pencil)
    b.face([xf.p(p[0], p[1], 0) for p in reversed(pts)], col=shade(cap or body, 0.9))
    tipc = '#e8c9a0' if pencil else tip
    for k in range(seg):   # 筆尖：錐
        a, c_ = pts[k], pts[(k + 1) % seg]
        b.face([xf.p(a[0], a[1], L), xf.p(c_[0], c_[1], L), xf.p(0, r, L + 0.012)], col=tipc)


def label_quad(xf, w, h, cell, y0=0.0, z=0.0):
    """有字的卡（物件 x −w/2～w/2、y y0～y0+h，朝 +z）"""
    x0, y0p, x1, y1p = CELLS[cell]; u0, u1 = x0 / 1024, x1 / 1024; v0, v1 = 1 - y1p / 1024, 1 - y0p / 1024
    B['label'].face([xf.p(-w / 2, y0, z), xf.p(w / 2, y0, z), xf.p(w / 2, y0 + h, z), xf.p(-w / 2, y0 + h, z)], uv=[(u0, v0), (u1, v0), (u1, v1), (u0, v1)])


def tent(x, z, ry, cell, w=0.17, h=0.09, lean=0.32):
    """桌上的三角立牌（A 字形）：兩面都印同一張字；ry＝正面朝向（0＝朝 +z）。斜面長 h/cos、底邊各往外 h·tan，頂端在中間碰在一起"""
    hs = h / math.cos(lean); dz = hs * math.tan(lean); y0 = -dz * math.tan(lean)
    for s_ in (0, math.pi):
        label_quad(Xf(x, TOP, z, ry + s_, tilt=-lean), w, hs, cell, y0, dz)
    box(B['vc'], Xf(x, TOP, z, ry, 0.0), -w / 2, w / 2, h - 0.002, h + 0.001, -0.002, 0.002, col='#f6f1e6')   # 摺線


# ------------------------------------------------------------------ 東牆文具架：隔板、頂板、木牌
wall_xf = Xf(0, 0, 0)
for zc in (5.70, 7.10):   # 兩片木隔板（0.375～1.6）
    box(B['wood'], wall_xf, SHELF_X0 + 0.01, SHELF_X1, LEVELS[0], 1.575, zc - 0.009, zc + 0.009)
box(B['wood'], wall_xf, SHELF_X0 - 0.02, X1 - 0.002, 1.975, 2.0, ZW0, ZW1)   # 頂板（AA 的盆栽放在 2.0）
pz0, pz1 = 5.45, 6.95; py0, py1 = 2.10, 2.46
box(B['wood'], wall_xf, X1 - 0.03, X1 - 0.002, py0, py1, pz0, pz1)               # 木牌的板
label_quad(Xf(X1 - 0.031, 0, (pz0 + pz1) / 2, -math.pi / 2), (pz1 - pz0) - 0.06, (py1 - py0) - 0.045, 'plaque', py0 + 0.0225)


def header(sect, y=None):
    """每段的分區牌：掛在 1.6 m 那層擋條（x 6.65～6.68、y 1.6～1.65）的前面，0.30 × 0.13，朝西、在人眼的高度；兩個小夾子"""
    z0, z1 = SECT[sect]; zc = (z0 + z1) / 2; x = SHELF_X0 - 0.008
    label_quad(Xf(x - 0.0035, 0, zc, -math.pi / 2), 0.30, 0.13, sect, 1.51)
    box(B['vc'], wall_xf, x - 0.003, x, 1.505, 1.642, zc - 0.151, zc + 0.151, col='#f6f1e6')   # 卡紙（字的後面）
    for dz_ in (-0.1, 0.1): box(B['vcg'], wall_xf, x - 0.008, SHELF_X0 + 0.012, 1.60, 1.665, zc + dz_ - 0.008, zc + dz_ + 0.008, col='#8a8f94')   # 夾在層板前緣
    return zc


# ------------------------------------------------------------------ 北段：紙膠帶
WASHI = ['#e8b4a0', '#a8c8d8', '#f0d890', '#b8d0a0', '#d8b8d8', '#f4f1ea', '#c9a27a', '#e98a7a', '#7fa7c4', '#9bbf8a', '#f2c6c2', '#c4b5e0', '#e3b448', '#6b7f5a', '#d26a5a', '#f6e3a3']


def washi_cols(c):
    k = rng.random()
    if k < 0.35: return [c, shade(c, 1.12)]                    # 兩色條紋
    if k < 0.55: return [c, c, '#f6f1e6']                      # 點點／格子的感覺
    return None


z0, z1 = SECT['washi']
y = LEVELS[2]   # 1.2：立著兩排（後排墊高），看得到中間的洞
box(B['wood'], wall_xf, 6.80, SHELF_X1, y, y + 0.05, z0 + 0.02, z1 - 0.02)
for row, (xr, yb) in enumerate(((6.715, y), (6.84, y + 0.05))):   # 捲子朝西：x 從 xr 往西一個寬度
    zz = z0 + 0.05
    while zz < z1 - 0.04:
        r1 = rng.choice((0.028, 0.030, 0.032)); c = rng.choice(WASHI); w = rng.choice((0.015, 0.015, 0.02, 0.025))
        ring(B['vcg'], Xf(xr, yb + r1, zz, -math.pi / 2), 0.0125, r1, w, 12, c, washi_cols(c), caps='f'); zz += 2 * r1 + 0.008
header('washi')
y = LEVELS[1]   # 0.8：掛在兩根木棍上（軸＝z），一捲一捲看得到側面的花色
for (xr, yr) in ((6.80, y + 0.30), (6.88, y + 0.16)):
    box(B['wood'], wall_xf, xr - 0.006, xr + 0.006, yr - 0.006, yr + 0.006, z0 + 0.02, z1 - 0.02)
    for zb in (z0 + 0.03, (z0 + z1) / 2, z1 - 0.03): box(B['wood'], wall_xf, xr - 0.008, SHELF_X1, yr - 0.012, yr + 0.012, zb - 0.008, zb + 0.008)   # 托架
    zz = z0 + 0.05; zmid = (z0 + z1) / 2
    while zz < z1 - 0.12:   # 一組 4～7 捲同一個尺寸（不同顏色），組跟組之間空 2.5 cm
        n = rng.randint(4, 7); r1 = rng.choice((0.03, 0.032, 0.034)); w = rng.choice((0.015, 0.015, 0.02))
        if zz < zmid < zz + n * (w + 0.002) + 0.02: zz = zmid + 0.025; continue   # 中間的托架
        for k in range(n):
            if zz + w > z1 - 0.05: break
            c = rng.choice(WASHI)
            ring(B['vcg'], Xf(xr, yr + 0.006 - 0.0125, zz, 0), 0.0125, r1, w, 10, c, washi_cols(c), caps=('b' if k == 0 else '') + ('f' if k == n - 1 else ''), inner=False)   # 洞的頂端靠在木棍上
            zz += w + 0.002
        zz += 0.025
y = LEVELS[0]   # 0.4：平放疊成一柱一柱（庫存）
zz = z0 + 0.06
while zz < z1 - 0.05:
    for xr in (6.76, 6.88):
        c = rng.choice(WASHI); tower(B['vcg'], xr, y, zz, rng.randint(4, 8), 0.0125, 0.03, 0.0152, 8, [c, shade(c, 1.08)])
    zz += 0.072

# ------------------------------------------------------------------ 中段：筆記本
NB = ['#b89466', '#2e3f5c', '#3f5a46', '#b5654a', '#d4a640', '#2a2a2a', '#efe6d2', '#d9a7a0', '#a7b89a', '#9db7c9', '#8c3b47', '#c9b48a']
PAGE = '#efe8d8'


def notebook(xf, w, h, t, c, band=False, lab=True):
    """一本筆記本（物件：x −w/2～w/2、y 0～h、z 0～t；封面朝 +z）：封面、封底、三面頁緣；封面上一張白色小標籤、有的有鬆緊帶"""
    box(B['vc'], xf, -w / 2, w / 2, 0, h, 0, t, cols={'front': c, 'back': c, 'right': PAGE, 'top': PAGE, 'bot': PAGE, 'left': shade(c, 0.85)})
    if lab: box(B['vc'], xf, -w * 0.28, w * 0.28, h * 0.62, h * 0.74, t, t + 0.0006, col='#f6f1e6')
    if band: box(B['vc'], xf, w * 0.30, w * 0.34, -0.001, h + 0.001, -0.0012, t + 0.0012, col=shade(c, 0.45) if c not in ('#2a2a2a', '#2e3f5c') else '#b5654a')


z0, z1 = SECT['notebooks']
for y, pal, (w, h) in ((LEVELS[2], ['#b89466', '#2a2a2a', '#2e3f5c', '#3f5a46', '#8c3b47', '#b89466'], (0.148, 0.21)),
                       (LEVELS[1], ['#efe6d2', '#d9a7a0', '#a7b89a', '#9db7c9', '#d4a640', '#b5654a'], (0.13, 0.182))):
    n = len(pal); step = (z1 - z0 - 0.04) / n
    for k, c in enumerate(pal):
        zc = z0 + 0.02 + step * (k + 0.5)
        # 封面朝外斜靠背板（往後靠 12°），前面平放 3～6 本同款
        notebook(Xf(SHELF_X1 - 0.012 - h * math.sin(0.21), y, zc, -math.pi / 2, tilt=-0.21), w, h, 0.009, c, band=(k % 3 == 1))
        for q in range(rng.randint(3, 6)):   # 平放：封面朝上、高 h 沿 +x（從 6.69 往牆）、寬沿 z
            notebook(Xf(6.69, y + q * 0.0095, zc + rng.uniform(-0.004, 0.004), -math.pi / 2 + rng.uniform(-0.02, 0.02), tilt=-math.pi / 2), w, h, 0.0093, c, lab=(q == 0))
header('notebooks')
y = LEVELS[0]   # 0.4：一疊一疊（側面看得到顏色）
zz = z0 + 0.1
while zz < z1 - 0.08:
    c = rng.choice(NB)
    for q in range(rng.randint(6, 12)):
        notebook(Xf(6.72, y + q * 0.0095, zz, -math.pi / 2 + rng.uniform(-0.02, 0.02), tilt=-math.pi / 2), 0.148, 0.21, 0.0093, c, lab=False)
    zz += 0.17

# ------------------------------------------------------------------ 南段：便條紙
STICKY = ['#f3dc6a', '#f2a7b8', '#a9dcc0', '#9cc8e8', '#f4b07a', '#c7b4e0', '#f6f1e6']
z0, z1 = SECT['sticky']
y = LEVELS[2]   # 1.2：便利貼方塊（7.6 cm）兩排，同色排在一起
for xr in (6.73, 6.86):
    zz = z0 + 0.05; k = 0
    while zz < z1 - 0.06:
        c = STICKY[(k // 2) % len(STICKY)]; hgt = rng.choice((0.04, 0.05, 0.06))
        box(B['vc'], Xf(xr, y, zz, rng.uniform(-0.05, 0.05)), -0.038, 0.038, 0, hgt, -0.038, 0.038, cols={'top': c, 'side': shade(c, 1.06)})
        for s_ in range(2, int(hgt / 0.01), 2):   # 側面幾條細線（一張一張的紙）
            box(B['vc'], Xf(xr, y, zz, 0), -0.0385, 0.0385, s_ * 0.01, s_ * 0.01 + 0.0008, -0.0385, 0.0385, col=shade(c, 0.9))
        zz += 0.082; k += 1
header('sticky')
y = LEVELS[1]   # 0.8：便條本（10 × 15 cm）斜靠背板＋前面小盒子裝索引貼
n = 8; step = (z1 - z0 - 0.04) / n
for k in range(n):
    zc = z0 + 0.02 + step * (k + 0.5); c = STICKY[k % 6]
    for q in range(3):
        xf = Xf(SHELF_X1 - 0.03 - q * 0.02, y, zc, -math.pi / 2, tilt=-0.24)
        box(B['vc'], xf, -0.05, 0.05, 0, 0.15, 0, 0.012, cols={'front': '#f8f5ee', 'side': '#efe8d8', 'top': shade(c, 0.95)})
        box(B['vc'], xf, -0.05, 0.05, 0.125, 0.15, 0.012, 0.0126, col=c)   # 上面一條色帶
    # 索引貼：一小盒五色
    for j in range(5):
        box(B['vcg'], Xf(6.72, y, zc - 0.04 + j * 0.018, 0), -0.022, 0.022, 0, 0.006 + 0.001 * j, -0.007, 0.007, col=STICKY[j])
y = LEVELS[0]   # 0.4：牛皮紙盒（庫存）
zz = z0 + 0.12
while zz < z1 - 0.1:
    box(B['vc'], Xf(6.82, y, zz, rng.uniform(-0.04, 0.04)), -0.12, 0.12, 0, rng.choice((0.12, 0.16)), -0.1, 0.1, cols={'top': '#c9a27a', 'side': '#b8915f'})
    zz += 0.24

# ------------------------------------------------------------------ 靠門的桌子：筆（桌子 x 4.55～6.05；西邊＝走道、互動點那一邊放矮的，東邊放筆筒）
t = TABLES[0]; tx, tz = t['x'], t['z']
INK = [('#2a2a2a', '#2a2a2a'), ('#2e4a8c', '#2e4a8c'), ('#c43a32', '#c43a32'), ('#3f7a4a', '#3f7a4a'), ('pastel', None), ('pencil', None)]
PASTEL = ['#f2a7b8', '#9cc8e8', '#a9dcc0', '#f3dc6a', '#c7b4e0', '#f4b07a']
tray = Xf(tx + 0.0, TOP, tz - 0.15, 0)   # 筆盤 0.96 × 0.26（x 4.82～5.78），六格；筆躺著沿 z
box(B['wood'], tray, -0.47, 0.47, 0, 0.012, -0.12, 0.12)   # 盤底縮在四邊的木條裡面（不和木條的外側面疊在同一個平面）
for sx in (-0.48, 0.47): box(B['wood'], tray, sx, sx + 0.01, 0, 0.035, -0.13, 0.13)
for sz in (-0.13, 0.12): box(B['wood'], tray, -0.48, 0.48, 0, 0.035, sz, sz + 0.01)
cw = 0.95 / 6
for k, (body, cap) in enumerate(INK):
    cx0 = -0.475 + k * cw
    if k: box(B['wood'], tray, cx0 - 0.004, cx0 + 0.004, 0, 0.03, -0.12, 0.12)
    for j in range(9):
        x = cx0 + 0.014 + j * (cw - 0.028) / 8
        if body == 'pastel':
            c = PASTEL[j % 6]; pen(B['vcg'], Xf(*tray.p(x, 0.012, -0.10)), 0.14, 0.0048, c, cap=shade(c, 0.8), tip='#3a3a3a')
        elif body == 'pencil':
            pen(B['vc'], Xf(*tray.p(x, 0.012, -0.10)), 0.175 if j % 2 else 0.16, 0.0042, rng.choice(('#e3b448', '#2f4a3a', '#b5654a', '#e8c9a0')), pencil=True)
        else:
            pen(B['vcg'], Xf(*tray.p(x, 0.012, -0.10)), 0.14, 0.0048, '#f4f1ea' if j % 3 == 0 else '#d8d4cc', cap=body, tip=body)
ps = Xf(tx - 0.02, TOP, tz - 0.38, 0)   # 試寫筆架（北邊桌緣，x 4.84～5.72）：木塊兩排孔，筆立著、筆蓋朝上
box(B['wood'], ps, -0.44, 0.44, 0, 0.05, -0.045, 0.045)
box(B['wood'], ps, -0.44, 0.44, 0.05, 0.075, -0.045, -0.002)
for row, (zr, yr) in enumerate(((0.022, 0.05), (-0.022, 0.075))):
    for j in range(26):
        body = (['#2a2a2a', '#2e4a8c', '#c43a32', '#3f7a4a'] + PASTEL)[(j + row * 3) % 10]
        p_ = ps.p(-0.42 + j * 0.0336, yr - 0.03, zr)
        pen(B['vcg'], Xf(p_[0], p_[1], p_[2], 0, tilt=-math.pi / 2), 0.14, 0.0045, '#f4f1ea' if body in PASTEL else body, cap=body, tip='#3a3a3a')
for k, (dz, c) in enumerate(((-0.25, '#e8e4dc'), (0.0, '#2f4a5a'), (0.25, '#c9a27a'))):   # 三個筆筒（東邊一排）
    cx, cz = tx + 0.62, tz + dz
    cyl(B['vcg'], Xf(cx, TOP, cz), 0.04, 0.10, 14, c, top=shade(c, 0.6))
    for q in range(10):
        a = q * 2.4; rr = 0.022 * math.sqrt((q + 1) / 10)
        body = rng.choice(['#2a2a2a', '#2e4a8c', '#c43a32', '#f4f1ea'] + PASTEL)
        pen(B['vcg'], Xf(cx + math.cos(a) * rr, TOP + 0.005, cz + math.sin(a) * rr, 0, tilt=-math.pi / 2 + rng.uniform(-0.12, 0.12)), 0.14, 0.0045, body, cap=shade(body, 0.75))
tp = Xf(tx - 0.45, TOP, tz + 0.22, 0.06)   # 試寫本（x 4.75～4.95）＋小牌（朝西）
box(B['vc'], tp, -0.105, 0.105, 0, 0.008, -0.075, 0.075, cols={'top': '#f8f5ee', 'side': '#efe8d8'})
for j in range(5):
    box(B['vc'], tp, -0.08 + (j % 2) * 0.02, 0.03 + j * 0.01, 0.008, 0.0084, -0.05 + j * 0.022, -0.048 + j * 0.022, col=['#2a2a2a', '#2e4a8c', '#c43a32', '#3f7a4a', '#7a5aa0'][j])
label_quad(Xf(tx - 0.58, TOP, tz + 0.22, -math.pi / 2, tilt=-0.5), 0.09, 0.045, 'try_pen', 0.0)
pc = Xf(tx - 0.02, TOP, tz + 0.26, 0.08)   # 鉛筆盒兩個（布的；上下疊）
for k, c in enumerate(('#6b7f5a', '#8c3b47')):
    box(B['vc'], pc, -0.10, 0.10, k * 0.045, k * 0.045 + 0.044, -0.035 + k * 0.004, 0.035 + k * 0.004, cols={'top': c, 'side': shade(c, 0.9)})
    box(B['vcg'], pc, -0.095, 0.095, k * 0.045 + 0.044, k * 0.045 + 0.047, -0.002 + k * 0.004, 0.002 + k * 0.004, col='#c9c4b8')   # 拉鍊
tin = Xf(tx + 0.28, TOP, tz + 0.24, -0.08)   # 色鉛筆鐵盒（打開）
box(B['vcg'], tin, -0.095, 0.095, 0, 0.012, -0.045, 0.045, cols={'top': '#e8e4dc', 'side': '#8a8f94'})
for j in range(12):
    c = ['#c43a32', '#e98a3a', '#e3b448', '#9bbf8a', '#3f7a4a', '#7fa7c4', '#2e4a8c', '#7a5aa0', '#d26a8a', '#8a5a3a', '#2a2a2a', '#f4f1ea'][j]
    pen(B['vc'], Xf(*tin.p(-0.085 + j * 0.0155, 0.012, -0.04), -0.08), 0.08, 0.0035, c, pencil=True, seg=6)
tent(t['x'] - t['w'] / 2 + 0.09, tz - 0.05, -math.pi / 2, 'pens')

# ------------------------------------------------------------------ 裡面的桌子：紙膠帶
t = TABLES[1]; tx, tz = t['x'], t['z']
st = Xf(tx - 0.35, TOP, tz - 0.05, 0)   # 兩階展示台（x 4.87～5.03），捲子立著、朝西看得到洞
box(B['wood'], st, -0.08, 0.08, 0, 0.04, -0.3, 0.3); box(B['wood'], st, 0.0, 0.08, 0.04, 0.09, -0.3, 0.3)
for (dx, dy) in ((-0.045, 0.04), (0.04, 0.09)):
    zz = -0.27
    while zz < 0.27:
        r1 = rng.choice((0.03, 0.032)); c = rng.choice(WASHI)
        ring(B['vcg'], Xf(*st.p(dx, dy + r1, zz), -math.pi / 2), 0.0125, r1, 0.015, 12, c, washi_cols(c), caps='f'); zz += 2 * r1 + 0.008
grid = Xf(tx + 0.18, TOP, tz - 0.12, 0)   # 格子木盤（x 5.16～5.80）：6 × 4 格，每格平放一到三捲
box(B['wood'], grid, -0.32, 0.32, 0, 0.01, -0.2, 0.2)
for j in range(7): box(B['wood'], grid, -0.32 + j * 0.1067 - 0.003, -0.32 + j * 0.1067 + 0.003, 0, 0.03, -0.2, 0.2)
for j in range(5): box(B['wood'], grid, -0.32, 0.32, 0, 0.03, -0.2 + j * 0.1 - 0.003, -0.2 + j * 0.1 + 0.003)
for i in range(6):
    for j in range(4):
        c = WASHI[(i * 4 + j) % len(WASHI)]
        p_ = grid.p(-0.32 + (i + 0.5) * 0.1067, 0.01, -0.2 + (j + 0.5) * 0.1)
        tower(B['vcg'], p_[0], p_[1], p_[2], rng.choice((1, 2, 2, 3)), 0.0125, 0.032, 0.0152, 12, [c, WASHI[(i * 4 + j + 5) % len(WASHI)], c])
for k in range(3):   # 禮盒組（盒子＋上面五捲）：x 5.15、5.35、5.55，z 5.88
    gb = Xf(tx - 0.15 + k * 0.2, TOP, tz + 0.28, rng.uniform(-0.1, 0.1))
    c = ['#e8b4a0', '#a8c8d8', '#b8d0a0'][k]
    box(B['vc'], gb, -0.075, 0.075, 0, 0.03, -0.055, 0.055, cols={'top': '#f6f1e6', 'side': c})
    for j in range(5): ring(B['vcg'], Xf(*gb.p(-0.06 + j * 0.03, 0.03, 0.0), 0, tilt=-math.pi / 2), 0.008, 0.014, 0.01, 8, WASHI[(k * 5 + j) % 16], caps='f', inner=False)
tbx, tbz = tx + 0.62, tz + 0.02   # 試貼板（東邊，朝西斜靠）：x 5.86～5.95
box(B['wood'], Xf(tbx, TOP, tbz, -math.pi / 2), -0.16, 0.16, 0, 0.02, -0.04, 0.05)
tb = Xf(tbx + 0.02, TOP + 0.02, tbz, -math.pi / 2, tilt=-0.35)
box(B['wood'], tb, -0.15, 0.15, 0, 0.22, -0.012, 0.0)
for j in range(7):
    c = WASHI[(j * 3) % 16]; yb = 0.02 + j * 0.022; xr_ = 0.13 - (j % 3) * 0.03
    B['vcg'].face([tb.p(-0.13, yb, 0.0008), tb.p(xr_, yb, 0.0008), tb.p(xr_, yb + 0.015, 0.0008), tb.p(-0.13, yb + 0.015, 0.0008)], col=c)
label_quad(tb, 0.10, 0.05, 'try_tape', 0.17 - 0.005, 0.0012)
tent(t['x'] - t['w'] / 2 + 0.09, tz - 0.05, -math.pi / 2, 'washi')


# ------------------------------------------------------------------ 輸出
def build(bk):
    if not bk.F: return None
    me = bpy.data.meshes.new(bk.name)
    V = [(x, -z, y) for (x, y, z) in bk.V]   # 遊戲 → Blender（z 往上）
    me.from_pydata(V, [], bk.F); me.update()
    me.polygons.foreach_set('use_smooth', bk.sm)
    if bk.kind == 'vc':
        ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER'); vals = []
        for f, cs in zip(me.polygons, bk.C):
            for c in cs: vals += [c[0], c[1], c[2], 1.0]
        ca.data.foreach_set('color', vals); me.color_attributes.active_color = ca
    elif bk.kind == 'uv':
        uv = me.uv_layers.new(name='UVMap'); vals = []
        for f, u in zip(me.polygons, bk.UV): vals += [c for p in u for c in p]
        uv.data.foreach_set('uv', vals)
    elif bk.kind == 'wood':   # 和 AA 的 rbox 一樣：Blender 世界座標的立方體投影、除以 1.3（材質 extras.tile）
        uv = me.uv_layers.new(name='UVMap'); vals = []
        for f in me.polygons:
            n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
            for li in f.loop_indices:
                co = me.vertices[me.loops[li].vertex_index].co
                a, b_ = ((co.y, co.z), (co.x, co.z), (co.x, co.y))[ax]; vals += [a / 1.3, b_ / 1.3]
        uv.data.foreach_set('uv', vals)
    import bmesh
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.to_mesh(me); bm.free(); me.update()
    try: me.set_sharp_from_angle(angle=math.radians(40))
    except Exception: pass
    m = bpy.data.materials.get(bk.name) or bpy.data.materials.new(bk.name)
    me.materials.append(m)
    ob = bpy.data.objects.new(bk.name, me); bpy.context.scene.collection.objects.link(ob); return ob


bpy.ops.wm.read_factory_settings(use_empty=True)
obs = [build(b) for b in B.values()]
tri = {b.name: sum(len(f) - 2 for f in b.F) for b in B.values()}
print('三角形', tri, '合計', sum(tri.values()))
kw = dict(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_materials='EXPORT', export_normals=True)
try: bpy.ops.export_scene.gltf(**kw, export_vertex_color='ACTIVE')
except TypeError: bpy.ops.export_scene.gltf(**kw)
print('wrote', OUT)
