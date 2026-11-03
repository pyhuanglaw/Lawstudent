"""新生運動廣場的室內（兩層：一樓＋夾層；新生南路新店，CC 建模子代理 2026-11-03 v1；BB 分派、LAWWW2 整合）→ GLB。Blender 5.x（bpy，無介面）：
  nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/xinsheng_sports_interior.py -- [--out 路徑] [--tmp 暫存資料夾]
參考圖：使用者 11-03 生成的 xinsheng_sports_int（室內）。規格：AA_620 第 1、2 節、3-2、3-4；SCENE_RULES 第 10 節。
配置（家具、樓梯、夾層、互動點、導航阻擋）只寫在 src/data/xinsheng_sports_layout.js，這裡讀同一份。座標＝遊戲區域座標（中心在原點、x 東、z 南、店門在 +z）。
節點：L0_*＝一樓（含樓梯）、L1_*＝夾層（樓板、樓板底的天花板、欄杆、上面的東西、7.2 m 的天花板）；會淡出的牆 WALL_<side>_L0_*／WALL_<side>_L1_*（自訂屬性 dir）；
      instancing 的衣服、球、水壺、背包掛在 L0_inst／L1_inst 底下。玻璃的材質名有 glass；天花板單面朝下（材質 cull）。
不放任何字：球衣只有背號（數字貼圖），學校名、品牌 logo 一律不做（使用者 11-03、D77）；橫幅、尺寸表、樓層牌只有底板，字由遊戲畫。
貼圖：Poly Haven CC0（large_floor_tiles_02、painted_plaster_wall、walnut_veneer、granite_tile_03）；球的接縫、背號的貼圖由這支腳本用 PIL 畫（xs_print 圖集）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LIB2 = os.environ.get('XS_LIB2', '/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/wt_l2/tools/blender/env_second')   # claude/second-ai-env-art 的 lib2（SCENE_RULES 第 10 節）
if not os.path.isdir(LIB2): LIB2 = os.path.dirname(HERE)
sys.path.insert(0, LIB2)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/xinsheng_sports_layout.js')))"], cwd=REPO))
OUT = os.path.join(REPO, arg('--out', LAY['glb']))
TMP = arg('--tmp', os.path.join(os.path.dirname(OUT), '_xs_tmp'))
os.makedirs(TMP, exist_ok=True)
W, D, H1 = LAY['w'], LAY['d'], LAY['h']; HT = LAY['hTotal']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12                                   # 牆厚（牆在房間的範圍裡面，內面 ±4.38、±7.88）
IX0, IX1, IZ0, IZ1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT
LV1 = LAY['levels'][1]; MZ = LV1['slab']['z1']; SLT = LV1['slab']['t']; Y1 = LV1['y']; YS = Y1 - SLT   # 夾層前緣 z、樓板厚、二樓地板、樓板底
ST = LAY['stairs']
random.seed(1103)
B.reset(texres=512)
root = B.group('xinsheng_sports_interior', props={'kind': 'xinsheng_sports_interior', 'w': W, 'd': D, 'h': H1, 'levels': 2, 'layout': LAY['version']})
INST = {0: B.group('L0_inst', root, {'lv': 0}), 1: B.group('L1_inst', root, {'lv': 1})}


def lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c] + [1.0]


# ---------------- 球的接縫、背號：PIL 畫的圖集（1024×512）----------------
NUM_CELLS = ['37w', '16w', '88n', '7w', '12w', '21w', '5n', '30w']   # 右下 4×2 格；w＝白字、n＝深藍字


def make_atlas(path):
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    Wd, Hd = 1024, 512; img = np.zeros((Hd, Wd, 4), np.uint8)
    yy, xx = np.mgrid[0:256, 0:512]; th = (yy + 0.5) / 256 * math.pi; ph = (xx + 0.5) / 512 * 2 * math.pi
    px, py, pz = np.sin(th) * np.cos(ph), np.sin(th) * np.sin(ph), np.cos(th)
    rng = np.random.default_rng(7)
    # 籃球：橘色＋細顆粒，兩條互相垂直的大圓＋兩條彎的接縫（黑）
    base = np.array([196, 98, 42], np.float32); n = rng.normal(0, 1, (256, 512, 1)).astype(np.float32)
    bb = base * (1 + 0.05 * n); w = 0.022
    ang = np.arccos(np.clip(np.abs(py), 0, 1)); phi2 = np.arctan2(pz, px)
    seam = (np.abs(pz) < w) | (np.abs(px) < w) | (np.abs(ang - (0.78 + 0.28 * np.cos(2 * phi2))) < w * 1.1)
    bb[seam] = [38, 26, 22]; img[0:256, 0:512, :3] = np.clip(bb, 0, 255); img[0:256, 0:512, 3] = 255
    # 排球：照立方體的六面，每面三條（黃、藍、白），條和條之間深灰接縫
    ab = np.stack([np.abs(px), np.abs(py), np.abs(pz)], -1); ax = ab.argmax(-1); comp = [px, py, pz]
    vb = np.zeros((256, 512, 3), np.float32); cols = {0: [236, 196, 40], 1: [36, 72, 160], 2: [240, 238, 230]}
    for a in range(3):
        m = ax == a; other = comp[(a + 1) % 3] / np.maximum(ab[..., a], 1e-6); strip = np.clip(((other + 1) / 2 * 3).astype(int), 0, 2)
        for s in range(3):
            k = m & (strip == s); vb[k] = cols[(s + a) % 3]
        edge = m & ((np.abs(np.abs(other) - 1 / 3) < 0.03) | (np.abs(np.abs(other) - 1) < 0.03) | (np.abs(np.abs(comp[(a + 2) % 3] / np.maximum(ab[..., a], 1e-6)) - 1) < 0.03))
        vb[edge] = [90, 90, 92]
    vb *= (1 + 0.025 * n); img[0:256, 512:1024, :3] = np.clip(vb, 0, 255); img[0:256, 512:1024, 3] = 255
    # 網球：黃綠絨毛（細雜訊）＋一條白色彎曲接縫
    tb = np.array([206, 222, 70], np.float32) * (1 + 0.08 * n)
    tb[np.abs(th - (math.pi / 2 + 0.55 * np.cos(2 * ph))) < 0.045] = [238, 238, 226]
    img[256:512, 0:512, :3] = np.clip(tb, 0, 255); img[256:512, 0:512, 3] = 255
    im = Image.fromarray(img, 'RGBA'); dr = ImageDraw.Draw(im)
    try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 92)
    except Exception: fnt = ImageFont.load_default()
    for i, cell in enumerate(NUM_CELLS):
        cx, cy = 512 + (i % 4) * 128 + 64, 256 + (i // 4) * 128 + 64; txt = cell[:-1]
        fill = (250, 250, 248, 255) if cell[-1] == 'w' else (26, 38, 78, 255)
        bx = dr.textbbox((0, 0), txt, font=fnt); tw, tht = bx[2] - bx[0], bx[3] - bx[1]
        dr.text((cx - tw / 2 - bx[0], cy - tht / 2 - bx[1]), txt, font=fnt, fill=fill)
    im.save(path)


ATLAS = os.path.join(TMP, 'xs_print.png'); make_atlas(ATLAS)


def cell_uv(name):
    """圖集格子的 UV（u0, v0, u1, v1；Blender 的 v 從下面算）"""
    if name in ('basket', 'volley', 'tennis'):
        x0, y0 = {'basket': (0, 0), 'volley': (512, 0), 'tennis': (0, 256)}[name]; return (x0 / 1024, 1 - (y0 + 256) / 512, (x0 + 512) / 1024, 1 - y0 / 512)
    i = NUM_CELLS.index(name); x0, y0 = 512 + (i % 4) * 128, 256 + (i // 4) * 128
    return (x0 / 1024, 1 - (y0 + 128) / 512, (x0 + 128) / 1024, 1 - y0 / 512)


def img_mat(name, path, rough=0.6, clip=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    m['tile'] = 1.0; return m


# ---------------- 材質（全部 12 個；兩層共用）----------------
P = 'xs_'
M = {
    'floor': L.pbr(P + 'floor_tile', 'large_floor_tiles_02', tile=1.8, target='#e3d7c4', normal=0.45, maps=('diff', 'nor'), rough_value=0.32),   # 淺米色磁磚（參考圖）
    'paint': L.pbr(P + 'wall_paint', 'painted_plaster_wall', tile=2.0, target='#ece6db', normal=0.25, maps=('diff',), res=256, rough_value=0.85),
    'ceil': L.flat(P + 'ceiling', '#f1f0ea', rough=0.9, cull=True),          # 天花板：單面朝下（鏡頭在上面時看得穿）
    'steel': L.flat(P + 'steel', '#b9bdc0', rough=0.3, metal=0.45),
    'dark': L.flat(P + 'dark_metal', '#33363a', rough=0.45, metal=0.3),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'wood': L.pbr(P + 'wood_light', 'walnut_veneer', tile=0.9, target='#c8a172', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'stone': L.pbr(P + 'stair_stone', 'granite_tile_03', tile=1.2, target='#a3a19c', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'vc': L.vc_material(P + 'vc_matte', rough=0.75),                        # 布、紙箱、背包、底板……（頂點色）
    'vcg': L.vc_material(P + 'vc_gloss', rough=0.3),                         # 水壺、獎盃、塑膠
    'tube': L.flat(P + 'tube', '#ffffff', rough=0.3, emit=B.srgb('#f6f8ff')),
    'print': img_mat(P + 'print', ATLAS, rough=0.62, clip=True),             # 球的接縫、背號
}
M['vcg'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0.2


def lvn(y): return 0 if y < Y1 - 0.01 else 1


_acc = {}
def acc(key, lv):
    k = (key, lv)
    if k not in _acc: _acc[k] = (L.CMesh if key in ('vc', 'vcg') else Mesh)(f'L{lv}_{key}', M[key])
    return _acc[k]


walls = {}
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
def wm(side, lv, key):
    k = (side, lv, key)
    if k not in walls: walls[k] = (L.CMesh if key in ('vc', 'vcg') else Mesh)(f'WALL_{side}_L{lv}_{key}', M[key])
    return walls[k]


def put(cm, bm, mat=None, col=None):
    """bmesh（Blender 座標）放進累積的網格；頂點色網格要給 col（sRGB 色碼）"""
    n0 = len(cm.bm.faces); cm.add_bm(bm, mat); bm.free()
    if col is not None:
        cm.bm.faces.ensure_lookup_table(); cm.paint([cm.bm.faces[i] for i in range(n0, len(cm.bm.faces))], col)
    return cm


def cyl_bm(a, b, r, seg=8, r2=None, caps=True):
    bm = bmesh.new(); pa, pb = g2b(*a), g2b(*b); d = pb - pa
    res = bmesh.ops.create_cone(bm, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
    bmesh.ops.rotate(bm, verts=res['verts'], cent=(0, 0, 0), matrix=rot); bmesh.ops.translate(bm, verts=res['verts'], vec=(pa + pb) / 2); return bm


def ell_bm(rx, ry, rz, seg=10, rings=6):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * rx, v.co.y * rz, v.co.z * ry))
    return bm


class Xf:
    """物件自己的座標（x 右、z 前、y 上；正面朝 +z）→ 區域座標：中心 (px,pz)、轉 ry"""
    def __init__(self, px, pz, ry=0.0, py=0.0): self.px, self.pz, self.py, self.c, self.s, self.ry = px, pz, py, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, self.py + y, self.pz - x * self.s + z * self.c)
    def M(self, x=0.0, y=0.0, z=0.0): return Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z')
    def rb(self, m, x0, x1, y0, y1, z0, z1, col=None, r=0.012, seg=1):
        return put(m, L.rbox_bm(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), r, seg), self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), col)
    def cy(self, m, a, b, r, col=None, seg=8, r2=None, caps=True): return put(m, cyl_bm(a, b, r, seg, r2, caps), self.M(), col)
    def la(self, m, prof, x, y, z, col=None, seg=12, sx=1.0, sz=1.0):
        return put(m, L.lathe(prof, seg=seg), self.M(x, y, z) @ Matrix.Diagonal((sx, sz, 1.0, 1.0)), col)
    def el(self, m, x, y, z, rx, ry, rz, col=None, seg=10, rings=6, tilt=0.0):
        return put(m, ell_bm(rx, ry, rz, seg, rings), self.M(x, y, z) @ Matrix.Rotation(tilt, 4, 'X'), col)


# ---------------- 牆（淡出的組；每一面在 y 3.6 切成 L0／L1 兩組）----------------
def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=WT):
    for lo, hi, lv in ((y0, min(y1, Y1), 0), (max(y0, Y1), y1, 1)):
        if hi - lo < 1e-4: continue
        m = wm(side, lv, key)
        if side == 'back': m.box(a0, a1, lo, hi, Z0 + t0, Z0 + t1)
        elif side == 'front': m.box(a0, a1, lo, hi, Z1 - t1, Z1 - t0)
        elif side == 'left': m.box(X0 + t0, X0 + t1, lo, hi, a0, a1)
        else: m.box(X1 - t1, X1 - t0, lo, hi, a0, a1)


def wall_open(side, key, a0, a1, y0, y1, holes):
    """一面牆（沿牆座標 a0～a1、高 y0～y1）挖出長方形的洞 holes=[(a0,a1,y0,y1)]：洞的左右整條、洞的上下補齊"""
    hs = sorted(holes); xs = [a0]
    for h in hs: xs += [h[0], h[1]]
    xs.append(a1)
    for i in range(0, len(xs), 2):
        if xs[i + 1] - xs[i] > 1e-4: wall_box(side, key, xs[i], xs[i + 1], y0, y1)
    for h in hs:
        if h[2] > y0 + 1e-4: wall_box(side, key, h[0], h[1], y0, h[2])
        if h[3] < y1 - 1e-4: wall_box(side, key, h[0], h[1], h[3], y1)


def glass_pane(side, a0, a1, y0, y1, off=0.06):
    for lo, hi, lv in ((y0, min(y1, Y1), 0), (max(y0, Y1), y1, 1)):
        if hi - lo < 1e-4: continue
        g = wm(side, lv, 'glass')
        if side == 'left': g.quad([(X0 + off, lo, a1), (X0 + off, lo, a0), (X0 + off, hi, a0), (X0 + off, hi, a1)])
        elif side == 'front': g.quad([(a1, lo, Z1 - off), (a0, lo, Z1 - off), (a0, hi, Z1 - off), (a1, hi, Z1 - off)])
        elif side == 'back': g.quad([(a0, lo, Z0 + off), (a1, lo, Z0 + off), (a1, hi, Z0 + off), (a0, hi, Z0 + off)])


def frame_bar(side, a0, a1, y0, y1, t0=0.02, t1=0.11):
    """窗框、門框（深色金屬；牆的組）"""
    for lo, hi, lv in ((y0, min(y1, Y1), 0), (max(y0, Y1), y1, 1)):
        if hi - lo < 1e-4: continue
        m = wm(side, lv, 'dark')
        if side == 'left': m.box(X0 + t0, X0 + t1, lo, hi, a0, a1)
        elif side == 'front': m.box(a0, a1, lo, hi, Z1 - t1, Z1 - t0)
        elif side == 'back': m.box(a0, a1, lo, hi, Z0 + t0, Z0 + t1)


def window(side, a0, a1, y0, y1, mull=1.0, transom=None):
    glass_pane(side, a0, a1, y0, y1)
    for y in (y0, y1) + ((transom,) if transom else ()): frame_bar(side, a0, a1, y - 0.035, y + 0.035)
    n = max(1, round((a1 - a0) / mull))
    for j in range(n + 1): a = a0 + j * (a1 - a0) / n; frame_bar(side, a - 0.03, a + 0.03, y0, y1)


def board(side, lv, a, y, w, h, base='#1d3a8a', stripe='#e8782a', white=False, off=0.13):
    """牆上的底板（橫幅、尺寸表、樓層牌；字由遊戲畫）：深藍底＋下緣橘色、白色兩道斜條（參考圖的設計，沒有字）"""
    m = wm(side, lv, 'vc'); t = 0.025
    def bx(a0, a1, y0, y1, d0, d1, col):
        if side == 'back': m.crbox(a0, a1, y0, y1, Z0 + d0, Z0 + d1, col, r=0.006)
        elif side == 'right': m.crbox(X1 - d1, X1 - d0, y0, y1, a0, a1, col, r=0.006)
        elif side == 'front': m.crbox(a0, a1, y0, y1, Z1 - d1, Z1 - d0, col, r=0.006)
    if white:
        bx(a - w / 2, a + w / 2, y - h / 2, y + h / 2, off - t, off, '#f4f4f0'); bx(a - w / 2, a + w / 2, y + h / 2 - 0.2, y + h / 2, off, off + 0.004, base)
        for k in range(1, 7): bx(a - w / 2 + 0.05, a + w / 2 - 0.05, y + h / 2 - 0.2 - k * 0.17, y + h / 2 - 0.2 - k * 0.17 + 0.008, off, off + 0.003, '#b8c0cc')   # 表格的橫線（空白）
        return
    bx(a - w / 2, a + w / 2, y - h / 2, y + h / 2, off - t, off, base)
    bx(a - w / 2, a + w / 2, y - h / 2 + 0.05, y - h / 2 + 0.09, off, off + 0.004, stripe)
    bx(a - w / 2 + w * 0.55, a + w / 2, y - h / 2 + 0.11, y - h / 2 + 0.13, off, off + 0.004, '#f4f4f0')


# ---------------- 衣服（三種款式：T 恤、球衣背心、球褲；換顏色＝另一個原型，instancing）----------------
TS = [0.0, 0.06, 0.14, 0.24, 0.27, 0.42, 0.58, 0.74, 0.88, 1.0]


def garment_bm(style, col, trim=None, hanger='#3b3c40', flat=1.0, hang=True):
    """衣架上的一件衣服（自己的座標：掛鉤頂端在原點、正面朝 +z）：前後兩片曲面＋側邊封起來；肩斜、領口、下襬波浪、垂下來的布紋"""
    bm = bmesh.new(); C = bm.loops.layers.float_color.new('Col'); NC = 6
    trim = trim or col
    if style == 'tee': Ln, hw = 0.70, [0.20, 0.30, 0.35, 0.355, 0.25, 0.252, 0.256, 0.26, 0.263, 0.266]
    elif style == 'jersey': Ln, hw = 0.74, [0.12, 0.13, 0.17, 0.235, 0.258, 0.262, 0.265, 0.268, 0.27, 0.272]
    else: Ln, hw = 0.50, [0.24, 0.245, 0.25, 0.255, 0.26, 0.265, 0.272, 0.28, 0.286, 0.29]
    top = -0.075 if style == 'shorts' else -0.085; ph = {'tee': 0.4, 'jersey': 1.3, 'shorts': 2.1}[style]
    F, K = [], []
    for r, t in enumerate(TS):
        rf, rk = [], []
        for c in range(NC + 1):
            u = -1 + 2 * c / NC; x = hw[r] * u; y = top - t * Ln
            if style == 'tee' and t < 0.26: y -= 0.11 * max(0.0, abs(x) - 0.11) / 0.25                          # 肩斜、袖子往下垂
            if style == 'jersey' and r == 0: y -= 0.12 * max(0.0, 1 - (x / 0.105) ** 2)                          # 背心的 U 領
            if style == 'tee' and r == 0: y -= 0.045 * max(0.0, 1 - (x / 0.1) ** 2)                               # 圓領
            if style == 'shorts' and t > 0.55: y += 0.17 * max(0.0, 1 - abs(x) / 0.12) * (t - 0.55) / 0.45       # 褲襠
            if r == len(TS) - 1: y += 0.012 * math.sin(x * 16 + ph)                                               # 下襬波浪
            th = (0.012 + 0.032 * math.sqrt(max(0.0, 1 - u * u))) * flat
            if style == 'tee' and t < 0.26 and abs(x) > 0.2: th *= 0.55
            fold = 0.011 * t * math.sin(x * 21 + ph) * flat
            rf.append(bm.verts.new(g2b(x, y, th + fold))); rk.append(bm.verts.new(g2b(x, y, -th + fold * 0.5)))
        F.append(rf); K.append(rk)
    def face(vs, hx):
        f = bm.faces.new(vs)
        for lp in f.loops: lp[C] = lin(hx)
    NR = len(TS) - 1
    for r in range(NR):
        for c in range(NC):
            tr = (style == 'jersey' and TS[r] < 0.27 and c in (0, NC - 1)) or (style == 'shorts' and c in (0, NC - 1))
            hx = trim if (tr or (r == 0 and style != 'tee') or (style == 'jersey' and r == NR - 1)) else col
            face([F[r][c], F[r][c + 1], F[r + 1][c + 1], F[r + 1][c]], hx); face([K[r][c + 1], K[r][c], K[r + 1][c], K[r + 1][c + 1]], hx)
        face([F[r + 1][0], K[r + 1][0], K[r][0], F[r][0]], trim if style != 'tee' else col); face([F[r][NC], K[r][NC], K[r + 1][NC], F[r + 1][NC]], trim if style != 'tee' else col)
    for c in range(NC):
        face([F[0][c + 1], F[0][c], K[0][c], K[0][c + 1]], col); face([F[NR][c], F[NR][c + 1], K[NR][c + 1], K[NR][c]], col)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if hang:   # 衣架：掛鉤＋兩支肩架（球褲：直的夾子衣架）
        hv = Vector(lin(hanger))
        parts = [((0, 0.0, 0), (0.028, -0.018, 0)), ((0.028, -0.018, 0), (0.0, -0.05, 0))]
        if style == 'shorts': parts += [((0, -0.05, 0), (0, -0.07, 0)), ((-0.23, -0.07, 0), (0.23, -0.07, 0))]
        else: parts += [((0, -0.05, 0), (-0.2, -0.1, 0)), ((0, -0.05, 0), (0.2, -0.1, 0))]
        for a, b in parts:
            tmp = cyl_bm(a, b, 0.004 if b[1] > -0.06 else 0.009, seg=4, caps=False); n0 = len(bm.faces)
            me = bpy.data.meshes.new('_t'); tmp.to_mesh(me); tmp.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
            bm.faces.ensure_lookup_table()
            for i in range(n0, len(bm.faces)):
                for lp in bm.faces[i].loops: lp[C] = list(hv)
    return bm


PROTO = {}
def proto(key, build, mat):
    if key not in PROTO:
        bm = build(); me = bpy.data.meshes.new(P + key); bm.to_mesh(me); bm.free(); me.materials.append(M[mat])
        for p in me.polygons: p.use_smooth = True
        PROTO[key] = me
    return PROTO[key]


_ni = [0]
def inst(me, lv, x, y, z, ry=0.0, s=1.0, sx=None):
    _ni[0] += 1; ob = bpy.data.objects.new(f'L{lv}_{me.name}_{_ni[0]}', me); B.scene().collection.objects.link(ob); ob.parent = INST[lv]
    ob.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Diagonal((s if sx is None else sx, s, s, 1.0)); return ob


COLS = {'navy': '#1f2d55', 'deepnavy': '#17213f', 'red': '#b8242c', 'white': '#efefea', 'royal': '#2950a8', 'maroon': '#6e1f2c', 'green': '#2f6b45',
        'lightblue': '#8fb8de', 'black': '#26272b', 'grey': '#8d9196', 'heather': '#b9bcbf', 'orange': '#d8742c'}
TRIM = {'navy': '#efefea', 'deepnavy': '#d9b45a', 'red': '#efefea', 'white': '#1f2d55', 'royal': '#efefea', 'maroon': '#e9e2cf', 'green': '#efefea',
        'lightblue': '#1f2d55', 'black': '#d8742c', 'grey': '#26272b', 'heather': '#1f2d55', 'orange': '#26272b'}


def garment(style, cname, flat=1.0):
    return proto(f'{style}_{cname}' + ('_flat' if flat < 1 else ''), lambda: garment_bm(style, COLS[cname], TRIM[cname] if style != 'tee' else None, flat=flat), 'vc')


# ---------------- 球（UV 球、接縫在圖集貼圖上）----------------
def ball_bm(r, kind, seg, rings):
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); u0, v0, u1, v1 = cell_uv(kind)
    vs = [[bm.verts.new((r * math.sin(math.pi * i / rings) * math.cos(2 * math.pi * j / seg), r * math.sin(math.pi * i / rings) * math.sin(2 * math.pi * j / seg), r * math.cos(math.pi * i / rings)))
           for j in range(seg + 1)] for i in range(rings + 1)]
    for i in range(rings):
        for j in range(seg):
            f = bm.faces.new([vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]])
            for lp, (ii, jj) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                lp[uvl].uv = (u0 + (u1 - u0) * jj / seg, v1 - (v1 - v0) * ii / rings)
    bmesh.ops.remove_doubles(bm, verts=[v for row in (vs[0], vs[-1]) for v in row], dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); return bm


def ball(kind):
    r, seg, rings = {'basket': (0.121, 14, 9), 'volley': (0.105, 14, 9), 'tennis': (0.033, 8, 5)}[kind]
    return proto('ball_' + kind, lambda: ball_bm(r, kind, seg, rings), 'print')


# ---------------- 水壺、背包 ----------------
BOTTLE_COLS = [('#e9a8b4', '#f2f2ee'), ('#9cc6e4', '#2a2c30'), ('#2c3e66', '#c9ccce'), ('#e9e6df', '#2a2c30'), ('#7a9a76', '#e9e6df'), ('#c9ccce', '#2a2c30'), ('#e8873a', '#f2f2ee')]


def bottle_bm(body, cap):
    cm = L.CMesh('_b', M['vcg']); xf = Xf(0, 0)
    xf.la(cm, [(0.0, 0.0), (0.033, 0.0), (0.035, 0.014), (0.035, 0.2), (0.026, 0.226), (0.021, 0.236)], 0, 0, 0, body, seg=7)
    xf.la(cm, [(0.022, 0.236), (0.023, 0.268), (0.0, 0.272)], 0, 0, 0, cap, seg=7)
    xf.rb(cm, -0.006, 0.006, 0.255, 0.275, 0.018, 0.04, cap, r=0.004)   # 提把
    return cm.bm


BAG_COLS = [('#1f2d55', '#e8a33a'), ('#26272b', '#6d7076'), ('#b32a30', '#1f2d55')]


def bag_bm(body, trim):
    """後背包（自己的座標：底面中心在原點、正面朝 +z）"""
    cm = L.CMesh('_g', M['vc']); xf = Xf(0, 0)
    xf.rb(cm, -0.15, 0.15, 0.0, 0.44, -0.09, 0.09, body, r=0.06, seg=2)
    xf.rb(cm, -0.12, 0.12, 0.05, 0.25, 0.06, 0.13, body, r=0.035, seg=2)                 # 前袋
    xf.rb(cm, -0.11, 0.11, 0.245, 0.26, 0.10, 0.125, trim, r=0.005)                      # 前袋的拉鍊
    xf.rb(cm, -0.13, 0.13, 0.35, 0.365, 0.075, 0.095, trim, r=0.005)                     # 主袋的拉鍊
    xf.cy(cm, (-0.04, 0.44, 0.0), (0.0, 0.49, 0.0), 0.009, trim, seg=5, caps=False); xf.cy(cm, (0.0, 0.49, 0.0), (0.04, 0.44, 0.0), 0.009, trim, seg=5, caps=False)   # 提把
    for sx in (-0.08, 0.08): xf.rb(cm, sx - 0.025, sx + 0.025, 0.08, 0.42, -0.12, -0.095, '#2a2b2f', r=0.008)   # 背帶
    return cm.bm


# ======================================================================
# 地板、牆、天花板
# ======================================================================
Mesh('L0_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
fr = LAY['front']; dx, dw = fr['door']['x'], fr['door']['w']; DH = 2.3
front_holes = [(a, b, fr['sill'], fr['head']) for a, b in fr['windows']] + [(dx - dw / 2, dx + dw / 2, 0.0, DH)]
up = fr['upper']
wall_open('front', 'paint', X0, X1, 0.0, Y1, front_holes)                                     # 一樓：門＋兩扇櫥窗
wall_open('front', 'paint', X0, X1, Y1, HT, [(up['x0'], up['x1'], up['y0'], up['y1'])])          # 二樓高度：一整條橫窗
for a, b in fr['windows']: window('front', a, b, fr['sill'], fr['head'], mull=1.2)
window('front', up['x0'], up['x1'], up['y0'], up['y1'], mull=1.0)
glass_pane('front', dx - dw / 2, dx + dw / 2, 0.02, DH - 0.03)                              # 玻璃雙開門
for a in (dx - dw / 2, dx, dx + dw / 2): frame_bar('front', a - 0.04, a + 0.04, 0.0, DH)
frame_bar('front', dx - dw / 2, dx + dw / 2, DH - 0.06, DH + 0.02)
for sx in (dx - 0.09, dx + 0.06):
    wm('front', 0, 'steel').box(sx, sx + 0.03, 0.85, 1.45, Z1 - 0.2, Z1 - 0.17)              # 長門把
lw, lw1 = LAY['leftWindow'], LAY['leftWindowL1']
wall_open('left', 'paint', Z0, Z1, 0.0, HT, [(lw['z0'], lw['z1'], lw['y0'], lw['y1']), (lw1['z0'], lw1['z1'], lw1['y0'], lw1['y1'])])
window('left', lw['z0'], lw['z1'], lw['y0'], lw['y1'], mull=1.0, transom=lw['transom'])
window('left', lw1['z0'], lw1['z1'], lw1['y0'], lw1['y1'], mull=1.1)
bd = LAY['backDoor']
wall_open('back', 'paint', X0, X1, 0.0, HT, [(bd['x'] - bd['w'] / 2, bd['x'] + bd['w'] / 2, 0.0, bd['h'])])
glass_pane('back', bd['x'] - bd['w'] / 2, bd['x'] + bd['w'] / 2, 0.02, bd['h'] - 0.03)
for a in (bd['x'] - bd['w'] / 2, bd['x'], bd['x'] + bd['w'] / 2): frame_bar('back', a - 0.04, a + 0.04, 0.0, bd['h'])
frame_bar('back', bd['x'] - bd['w'] / 2, bd['x'] + bd['w'] / 2, bd['h'] - 0.06, bd['h'] + 0.02)
bk = wm('back', 0, 'vc')                                                                       # 門後面的員工走道（暗一點的牆、地）
bk.cbox(bd['x'] - bd['w'] / 2 - 0.2, bd['x'] + bd['w'] / 2 + 0.2, 0.0, bd['h'] + 0.1, Z0 - 1.25, Z0 - 1.2, '#a9a49b')
bk.cbox(bd['x'] - bd['w'] / 2 - 0.2, bd['x'] + bd['w'] / 2 + 0.2, -0.02, 0.0, Z0 - 1.2, Z0, '#8e8a84')
for sx in (bd['x'] - bd['w'] / 2 - 0.2, bd['x'] + bd['w'] / 2 + 0.2): bk.cbox(sx - 0.05, sx + 0.05, 0.0, bd['h'] + 0.1, Z0 - 1.2, Z0, '#b9b4aa')
bk.cbox(bd['x'] - bd['w'] / 2 - 0.2, bd['x'] + bd['w'] / 2 + 0.2, bd['h'] + 0.05, bd['h'] + 0.1, Z0 - 1.2, Z0, '#b9b4aa')
wall_box('right', 'paint', Z0, Z1, 0.0, HT)
for side, a0, a1 in (('left', Z0 + WT, Z1 - WT), ('right', Z0 + WT, Z1 - WT), ('back', X0 + WT, X1 - WT), ('front', X0 + WT, X1 - WT)):   # 踢腳板（一樓、夾層）
    for yb in (0.0, Y1):
        if side == 'front' and yb > 0: continue
        if side in ('left', 'right') and yb > 0: a1_ = MZ
        else: a1_ = a1
        segs = [(a0, a1_)]
        if side == 'front' and yb == 0: segs = [(a0, a) for a, _ in [(fr['windows'][0][0], 0)]] + [(fr['windows'][0][1], dx - dw / 2), (dx + dw / 2, fr['windows'][1][0])]
        if side == 'back' and yb == 0: segs = [(a0, bd['x'] - bd['w'] / 2), (bd['x'] + bd['w'] / 2, a1)]
        for s0, s1 in segs:
            if s1 - s0 < 0.05: continue
            t0, t1 = WT, WT + 0.015; mm = wm(side, lvn(yb + 0.01), 'vc')
            if side == 'back': mm.cbox(s0, s1, yb, yb + 0.09, Z0 + t0, Z0 + t1, '#5b5e63')
            elif side == 'front': mm.cbox(s0, s1, yb, yb + 0.09, Z1 - t1, Z1 - t0, '#5b5e63')
            elif side == 'left': mm.cbox(X0 + t0, X0 + t1, yb, yb + 0.09, s0, s1, '#5b5e63')
            else: mm.cbox(X1 - t1, X1 - t0, yb, yb + 0.09, s0, s1, '#5b5e63')

# 窗型冷氣（左牆大窗的上半；參考圖）
ac = wm('left', 1, 'vc'); az0, az1, ay0, ay1 = 5.0, 5.8, 5.15, 5.75
ac.crbox(X0 + 0.02, X0 + 0.42, ay0, ay1, az0, az1, '#e4e2dc', r=0.02)
for k in range(9): ac.cbox(X0 + 0.42, X0 + 0.425, ay0 + 0.08, ay0 + 0.36, az0 + 0.06 + k * 0.075, az0 + 0.09 + k * 0.075, '#9a9a96')   # 出風口的百葉
ac.cbox(X0 + 0.42, X0 + 0.428, ay0 + 0.42, ay1 - 0.06, az0 + 0.06, az0 + 0.3, '#c9c7c0')
ac.cbox(X0 + 0.02, X0 + 0.07, ay0 - 0.08, ay0, az0 - 0.05, az1 + 0.05, '#7d7f84')              # 托架

# 天花板（7.2 m：方格輕鋼架、日光燈、軌道燈）＋夾層樓板（底面是一樓後段的天花板）
def tbar_ceiling(lv, y, x0, x1, z0, z1, troffers):
    ce = acc('ceil', lv); ce.quad([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)])
    vc = acc('vc', lv)
    xs = [x0 + 0.6 * k for k in range(1, int((x1 - x0) / 0.6) + 1) if x0 + 0.6 * k < x1 - 0.05]; zs = [z0 + 0.6 * k for k in range(1, int((z1 - z0) / 0.6) + 1) if z0 + 0.6 * k < z1 - 0.05]
    for x in xs: vc.cbox(x - 0.012, x + 0.012, y - 0.02, y - 0.001, z0, z1, '#e6e4de')
    for z in zs: vc.cbox(x0, x1, y - 0.02, y - 0.001, z - 0.012, z + 0.012, '#e6e4de')
    for (cx, cz) in troffers:
        vc.cbox(cx - 0.62, cx + 0.62, y - 0.05, y - 0.002, cz - 0.17, cz + 0.17, '#f4f4f2')
        acc('tube', lv).quad([(cx - 0.56, y - 0.052, cz - 0.12), (cx + 0.56, y - 0.052, cz - 0.12), (cx + 0.56, y - 0.052, cz + 0.12), (cx - 0.56, y - 0.052, cz + 0.12)])


tbar_ceiling(1, HT, IX0, IX1, IZ0, IZ1, [(x, z) for x in (-2.4, 0.0, 2.4) for z in (-6.0, -3.2, 3.0, 6.0)] + [(-2.4, 0.2), (0.0, 0.2)])
tbar_ceiling(1, YS, IX0, IX1, IZ0, MZ, [(x, z) for x in (-2.7, -0.3, 2.3) for z in (-6.3, -3.8, -1.8)])
sl = acc('paint', 1); sl.box(X0, X1, YS, Y1 - 0.02, Z0, MZ)                                    # 樓板（結構）
acc('floor', 1).box(X0, X1, Y1 - 0.02, Y1, Z0, MZ)                                             # 夾層地板（同一種磁磚）
acc('vc', 1).cbox(X0 + WT, X1 - WT, YS - 0.06, Y1 + 0.005, MZ, MZ + 0.04, '#d9d6cf')           # 樓板前緣的收邊板
for zt in (2.1, 5.4):                                                                          # 挑空區的軌道燈
    acc('dark', 1).box(-3.6, 2.6, HT - 0.06, HT - 0.02, zt - 0.02, zt + 0.02)
    for k in range(6):
        x = -3.3 + k * 1.15; spot = Xf(x, zt)
        spot.cy(acc('dark', 1), (0, HT - 0.06, 0), (0, HT - 0.16, 0), 0.012, seg=6)
        spot.cy(acc('dark', 1), (0, HT - 0.17, -0.06), (0, HT - 0.27, 0.1), 0.045, seg=10)
        spot.cy(acc('tube', 1), (0, HT - 0.265, 0.092), (0, HT - 0.272, 0.103), 0.038, seg=10)

# ======================================================================
# 樓梯（右牆直跑、21 階；兩層共用：模型放 L0）
# ======================================================================
sx0, sx1, sz0, sz1, NRZ = ST['x0'], ST['x1'], ST['z0'], ST['z1'], ST['risers']; rise = (ST['ya'] - ST['yb']) / NRZ; tread = (sz1 - sz0) / NRZ
for i in range(NRZ):                                                                           # 第 i 階：踏面高 (i+1)*rise，z 從 sz1-(i+1)*tread 到 sz1-i*tread
    ytop = (i + 1) * rise; za, zb = sz1 - (i + 1) * tread, sz1 - i * tread
    if i < NRZ - 1:
        acc('paint', 0).box(sx0, IX1, 0.0, ytop - 0.03, za, zb)                                 # 樓梯的身體（底下封起來）
        acc('stone', 0).box(sx0, IX1, ytop - 0.03, ytop, za, zb + 0.025)                        # 石材踏面（前緣凸出 2.5 cm）
        acc('vc', 0).cbox(sx0 + 0.04, IX1 - 0.04, ytop - 0.002, ytop + 0.002, zb - 0.03, zb + 0.02, '#4d4f53')   # 防滑條
acc('paint', 0).box(sx0, IX1, 0.0, Y1 - 0.03, sz0 - 0.15, sz0 + tread)                                 # 最上面接夾層的那一段（樓梯頂端下面的牆）
acc('stone', 0).box(sx0, IX1, Y1 - 0.03, Y1, sz0, sz0 + tread + 0.025)
strg = acc('paint', 0)                                                                          # 西側的斜樑（蓋住一階一階的側面）
bm = bmesh.new(); pts = []
for xx in (sx0 - 0.05, sx0 + 0.001):
    pts.append([bm.verts.new(g2b(xx, 0.0, sz1 + 0.03)), bm.verts.new(g2b(xx, 0.22, sz1 + 0.03)), bm.verts.new(g2b(xx, Y1 + 0.12, sz0)), bm.verts.new(g2b(xx, Y1 - 0.4, sz0))])
a, b = pts
for q in ([a[0], a[1], a[2], a[3]], [b[3], b[2], b[1], b[0]], [a[0], b[0], b[1], a[1]], [a[1], b[1], b[2], a[2]], [a[2], b[2], b[3], a[3]], [a[3], b[3], b[0], a[0]]): bm.faces.new(q)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces); strg.add_bm(bm); bm.free()


def rail_slope(lv, x, za, zb, ya, yb, posts=5, h=0.95, wall=False):
    """玻璃欄杆＋木扶手（沿 z、從 (za,ya) 到 (zb,yb)；高度是踏面線往上 h）"""
    if not wall:
        for k in range(posts):
            t = k / (posts - 1); z = za + (zb - za) * t; y = ya + (yb - ya) * t
            acc('steel', lv).cyl((x, y, z), (x, y + h - 0.04, z), 0.022, seg=8)
        for k in range(posts - 1):
            t0, t1 = k / (posts - 1) + 0.01, (k + 1) / (posts - 1) - 0.01
            za_, zb_ = za + (zb - za) * t0, za + (zb - za) * t1; ya_, yb_ = ya + (yb - ya) * t0, ya + (yb - ya) * t1
            acc('glass', lv).quad([(x, ya_ + 0.1, za_), (x, yb_ + 0.1, zb_), (x, yb_ + h - 0.1, zb_), (x, ya_ + h - 0.1, za_)])
            for yy in (0.1, h - 0.1):
                for zz, yv in ((za_, ya_), (zb_, yb_)): acc('steel', lv).cyl((x - 0.03, yv + yy, zz), (x + 0.03, yv + yy, zz), 0.012, seg=6)   # 玻璃夾
    else:
        for k in range(posts):
            t = k / (posts - 1); z = za + (zb - za) * t; y = ya + (yb - ya) * t
            acc('steel', lv).cyl((IX1, y + h - 0.06, z), (x, y + h - 0.06, z), 0.01, seg=6)
    acc('wood', lv).cyl((x, ya + h, za), (x, yb + h, zb), 0.03, seg=10)


rail_slope(0, sx0 - 0.02, sz1, sz0, 0.0, Y1, posts=6)                                            # 樓梯西側：玻璃欄杆＋木扶手（參考圖）
rail_slope(0, IX1 - 0.06, sz1 - 0.3, sz0 + 0.2, 0.3 * rise / tread, Y1 - 0.2 * rise / tread, posts=4, h=0.9, wall=True)   # 東側牆上的扶手
# 夾層前緣的玻璃欄杆（x −4.38～3.1，z −1.05）＋木扶手
rx0, rx1, rz = LV1['railX0'], LV1['railX1'], LV1['railZ'] - 0.05
npost = 7
for k in range(npost + 1):
    x = rx0 + 0.05 + (rx1 - 0.05 - rx0 - 0.05) * k / npost; acc('steel', 1).cyl((x, Y1, rz), (x, Y1 + 1.0, rz), 0.022, seg=8)
for k in range(npost):
    xa = rx0 + 0.05 + (rx1 - rx0 - 0.1) * k / npost + 0.04; xb = rx0 + 0.05 + (rx1 - rx0 - 0.1) * (k + 1) / npost - 0.04
    acc('glass', 1).quad([(xa, Y1 + 0.08, rz), (xb, Y1 + 0.08, rz), (xb, Y1 + 0.95, rz), (xa, Y1 + 0.95, rz)])
acc('wood', 1).cyl((rx0, Y1 + 1.03, rz), (rx1 + 0.02, Y1 + 1.03, rz), 0.03, seg=10)
acc('steel', 1).cyl((rx1, Y1 + 0.0, rz), (rx1, Y1 + 1.0, rz), 0.03, seg=8)

# ======================================================================
# 一樓
# ======================================================================
lv = 0
vc0, vg0 = acc('vc', 0), acc('vcg', 0)
# ---- 左牆鐵網籃架（籃球、排球、網球籃）z 3.6～7.2 ----
bx0, bx1, bz0, bz1 = IX0, IX0 + 0.58, 3.6, 7.2
for z in (bz0, (bz0 + bz1) / 2, bz1):
    for x in (bx0 + 0.03, bx1 - 0.03): acc('steel', 0).cyl((x, 0.0, z), (x, 2.3, z), 0.016, seg=6)
for ys in (0.32, 0.86, 1.42, 1.98):
    for k in range(int((bz1 - bz0) / 0.1) + 1):                                                 # 鐵網層板：橫條
        z = bz0 + k * 0.1; acc('steel', 0).box(bx0 + 0.02, bx1, ys - 0.004, ys + 0.004, z - 0.003, z + 0.003)
    for x in (bx0 + 0.03, bx0 + 0.2, bx0 + 0.38, bx1 - 0.02): acc('steel', 0).box(x - 0.004, x + 0.004, ys - 0.012, ys - 0.004, bz0, bz1)
    acc('steel', 0).box(bx1 - 0.01, bx1, ys, ys + 0.06, bz0, bz1)                               # 前緣擋條
    vc0.cbox(bx1 + 0.0, bx1 + 0.004, ys - 0.045, ys + 0.0, bz0 + 0.2, bz0 + 3.4, '#f2f2ee')        # 價格條（空白）
for k in range(int((bz1 - bz0) / 0.1) + 1):                                                     # 背後的鐵網
    z = bz0 + k * 0.1; acc('steel', 0).box(bx0, bx0 + 0.006, 0.3, 2.3, z - 0.003, z + 0.003)
for k in range(21): y = 0.3 + k * 0.1; acc('steel', 0).box(bx0, bx0 + 0.006, y - 0.003, y + 0.003, bz0, bz1)
mb, mv, mt = ball('basket'), ball('volley'), ball('tennis')
for ys in (1.42, 1.98):
    for k in range(14):
        z = bz0 + 0.17 + k * 0.252; inst(mb, 0, bx0 + 0.2 + (0.13 if k % 2 else 0.0) * 0.0, ys + 0.123, z, ry=random.uniform(0, 6.28))
        if k % 3 != 1: inst(mb, 0, bx0 + 0.44, ys + 0.123, z + 0.06, ry=random.uniform(0, 6.28))
for k in range(16): inst(mv, 0, bx0 + 0.3 + (0.1 if k % 2 else -0.08), 0.86 + 0.107, bz0 + 0.15 + k * 0.215, ry=random.uniform(0, 6.28))
for j in range(3):                                                                              # 網球：三個鐵網籃
    cz = bz0 + 0.65 + j * 1.15; bk_ = Xf(bx0 + 0.29, cz)
    for k in range(9):
        zz = -0.4 + k * 0.1; acc('steel', 0).box(bx0 + 0.04, bx1 - 0.02, 0.33, 0.6, cz + zz - 0.003, cz + zz + 0.003)
    for x in (bx0 + 0.04, bx1 - 0.02): acc('steel', 0).box(x - 0.003, x + 0.003, 0.33, 0.6, cz - 0.4, cz + 0.4)
    for y in (0.45, 0.6): acc('steel', 0).box(bx0 + 0.04, bx1 - 0.02, y - 0.004, y + 0.004, cz - 0.4, cz + 0.4)
    rr = random.Random(j)
    for k in range(15):
        inst(mt, 0, bx0 + 0.1 + rr.uniform(0, 0.36), 0.36 + 0.033 + (k // 8) * 0.06 + rr.uniform(0, 0.03), cz + rr.uniform(-0.34, 0.34), ry=rr.uniform(0, 6.28))
# ---- 護具網牆＋背包地台 z 0.7～3.1 ----
gz0, gz1 = 0.7, 3.1
for z in (gz0, gz1): acc('steel', 0).cyl((IX0 + 0.06, 0.0, z), (IX0 + 0.06, 2.25, z), 0.016, seg=6)
for k in range(int((gz1 - gz0) / 0.1) + 1): z = gz0 + k * 0.1; acc('steel', 0).box(IX0 + 0.05, IX0 + 0.058, 0.6, 2.25, z - 0.0035, z + 0.0035)
for k in range(17): y = 0.6 + k * 0.1; acc('steel', 0).box(IX0 + 0.05, IX0 + 0.058, y - 0.0035, y + 0.0035, gz0, gz1)
hx = Xf(IX0 + 0.06, 0.0, math.pi / 2)                                                           # 網牆上的東西（掛鉤＋護膝、護肘、護踝包裝）
for row, y in enumerate((2.0, 1.55, 1.1)):
    for k in range(6):
        z = gz0 + 0.25 + k * 0.38
        acc('steel', 0).cyl((IX0 + 0.06, y + 0.12, z), (IX0 + 0.2, y + 0.14, z), 0.004, seg=4, caps=False)
        it = Xf(IX0 + 0.12, z, math.pi / 2)
        if row == 0 or (row == 1 and k % 2 == 0):                                              # 護膝：黑色的弧形墊
            it.el(vc0, 0, y - 0.06, 0.0, 0.07, 0.11, 0.045, '#232427', seg=10, rings=6); it.el(vc0, 0, y - 0.06, 0.03, 0.045, 0.075, 0.02, '#3c3e43', seg=8, rings=5)
            it.rb(vc0, -0.075, 0.075, y + 0.03, y + 0.06, -0.035, 0.0, '#46484d', r=0.008)
        else:                                                                                   # 包裝好的護腕、護踝（卡紙＋透明袋）
            it.rb(vc0, -0.07, 0.07, y - 0.2, y + 0.1, -0.01, 0.0, '#1f3f8a' if k % 3 else '#e9e6df', r=0.006)
            it.rb(vc0, -0.055, 0.055, y - 0.17, y - 0.02, 0.0, 0.035, '#2a2b2f' if k % 2 else '#1f2d55', r=0.012)
pf = Xf(IX0 + 0.39, (gz0 + gz1) / 2)                                                            # 背包地台（原木）
pf.rb(acc('wood', 0), -0.39 + 0.0, 0.39, 0.0, 0.26, -1.2, 1.2, r=0.02, seg=2)
bagp = [proto(f'bag_{i}', (lambda i=i: bag_bm(*BAG_COLS[i])), 'vc') for i in range(3)]
for k, z in enumerate((0.98, 1.6, 2.2, 2.82)): inst(bagp[k % 3], 0, IX0 + 0.42, 0.26, z, ry=math.pi / 2 + random.uniform(-0.15, 0.15))
# ---- 人台（深藍球衣＋白色側片、深藍短褲；沒有頭） ----
mq = Xf(-1.75, 4.7, 0.25)
mq.la(acc('dark', 0), [(0.0, 0.0), (0.2, 0.0), (0.2, 0.02), (0.05, 0.035), (0.0, 0.04)], 0, 0, 0, seg=16)
mq.cy(acc('steel', 0), (0, 0.03, 0), (0, 0.62, 0), 0.014, seg=8)
mq.la(vc0, [(0.0, 0.0), (0.155, 0.0), (0.165, 0.12), (0.17, 0.28), (0.16, 0.36), (0.0, 0.37)], 0, 0.6, 0, '#1f2d55', seg=16, sz=0.62)          # 短褲
for sx in (-0.085, 0.085): mq.la(vc0, [(0.0, 0.0), (0.085, 0.0), (0.09, 0.2), (0.0, 0.21)], sx, 0.52, 0, '#1f2d55', seg=10, sz=0.9)
mq.la(vc0, [(0.15, 0.0), (0.16, 0.1), (0.17, 0.25), (0.19, 0.42), (0.2, 0.5), (0.17, 0.58), (0.08, 0.62), (0.0, 0.625)], 0, 0.95, 0, '#1f2d55', seg=16, sz=0.6)   # 上身（球衣）
mq.rb(vc0, -0.205, -0.17, 1.02, 1.48, -0.05, 0.05, '#efefea', r=0.01); mq.rb(vc0, 0.17, 0.205, 1.02, 1.48, -0.05, 0.05, '#efefea', r=0.01)   # 白色側片
mq.cy(vc0, (0, 1.56, 0), (0, 1.66, 0), 0.05, '#d9d6cf', seg=10); mq.la(vc0, [(0.05, 0.0), (0.06, 0.03), (0.0, 0.04)], 0, 1.66, 0, '#d9d6cf', seg=10)   # 頸部
for s in (-1, 1):
    mq.cy(vc0, (s * 0.19, 1.47, 0), (s * 0.27, 1.28, 0), 0.06, '#1f2d55', seg=10, r2=0.055)      # 袖子
    mq.cy(vc0, (s * 0.26, 1.29, 0), (s * 0.3, 0.98, 0.02), 0.038, '#d9d6cf', seg=8, r2=0.03)     # 手臂
# ---- 衣架（雙桿／單桿；原木底座、鐵管） ----
def rack(lv, cx, cz, ry, length, rails, items, height=1.45):
    xf = Xf(cx, cz, ry, py=LAY['levels'][lv]['y']); hl = length / 2
    xf.rb(acc('wood', lv), -0.36, 0.36, 0.08, 0.13, -hl, hl, r=0.015, seg=2)
    for sz in (-hl + 0.06, hl - 0.06):
        for sx in (-0.3, 0.3): xf.cy(acc('dark', lv), (sx, 0.0, sz), (sx, 0.08, sz), 0.03, seg=8)   # 輪子
    for sz in (-hl + 0.05, hl - 0.05):
        for rx, ry_ in rails: xf.cy(acc('steel', lv), (rx, 0.13, sz), (rx, ry_ + 0.03, sz), 0.016, seg=8)
    for rx, ry_ in rails: xf.cy(acc('steel', lv), (rx, ry_, -hl + 0.03), (rx, ry_, hl - 0.03), 0.013, seg=8)
    for (rx, ry_), its in zip(rails, items):
        n = len(its)
        for k, me in enumerate(its):
            t = (k + 0.5) / n; z = -hl + 0.12 + (length - 0.24) * t
            gx, gy, gz = xf.p(rx, ry_ + 0.005, z); inst(me, lv, gx, gy, gz, ry=ry + random.uniform(-0.08, 0.08))


def mix(styles, cols, n, seed):
    rr = random.Random(seed); return [garment(rr.choice(styles), rr.choice(cols)) for _ in range(n)]


rack(0, 0.75, 3.2, 0.0, 2.3, [(-0.22, 1.5), (0.22, 1.32)], [mix(['tee'], ['navy', 'white', 'red', 'grey', 'navy', 'white', 'heather'], 18, 1), mix(['shorts'], ['navy', 'black'], 16, 2)])
rack(0, -1.7, 1.4, math.pi / 2, 1.8, [(0.0, 1.45)], [mix(['tee', 'jersey'], ['maroon', 'white', 'navy', 'grey', 'red'], 15, 3)])
rack(0, -0.1, -3.6, 0.0, 1.8, [(0.0, 1.45)], [mix(['tee'], ['black', 'grey', 'navy', 'heather', 'royal'], 14, 4)])
# ---- 摺好的 T 恤桌 ----
tb = Xf(-1.75, 6.45)
tb.rb(acc('wood', 0), -0.6, 0.6, 0.72, 0.77, -0.35, 0.35, r=0.015, seg=2)
for sx in (-0.52, 0.52):
    for sz in (-0.28, 0.28): tb.cy(acc('steel', 0), (sx, 0.0, sz), (sx, 0.72, sz), 0.018, seg=8)
tb.rb(acc('wood', 0), -0.52, 0.52, 0.18, 0.21, -0.28, 0.28, r=0.01)
rr = random.Random(9)
for i, sx in enumerate((-0.38, 0.0, 0.38)):
    for j, sz in enumerate((-0.15, 0.15)):
        c = rr.choice(['navy', 'white', 'red', 'grey', 'royal', 'black'])
        for k in range(4 + (i + j) % 3): tb.rb(vc0, sx - 0.15, sx + 0.15, 0.77 + k * 0.032, 0.77 + k * 0.032 + 0.03, sz - 0.12, sz + 0.12, COLS[c], r=0.01)
# ---- 收銀台（原木＋白色檯面、POS 螢幕、刷卡機、小商品架） ----
cs = Xf(2.4, 6.8, math.pi)                                                                      # 正面（客人那一面）朝 −z
cs.rb(acc('wood', 0), -0.9, 0.9, 0.0, 0.98, -0.3, 0.3, r=0.02, seg=2)
cs.rb(vc0, -0.92, 0.92, 0.98, 1.02, -0.32, 0.32, '#f2f1ec', r=0.01)
cs.rb(vc0, -0.88, 0.88, 0.0, 0.08, 0.28, 0.31, '#3a3b3f', r=0.005)
cs.rb(vc0, -0.7, 0.4, 0.55, 0.62, 0.3, 0.315, '#1d3a8a', r=0.004)                                # 前面的藍色飾條
cs.rb(vc0, 0.1, 0.42, 1.06, 1.3, -0.1, -0.08, '#1b1c1f', r=0.01); cs.cy(vc0, (0.26, 1.02, -0.06), (0.26, 1.1, -0.08), 0.02, '#2a2b2f', seg=6)   # POS 螢幕（朝店員）
cs.rb(vc0, -0.2, -0.08, 1.02, 1.06, -0.12, 0.02, '#2a2b2f', r=0.01)                              # 刷卡機
cs.rb(vc0, -0.75, -0.4, 1.02, 1.3, -0.05, 0.12, '#e9e6df', r=0.01)                              # 襪子展示盒
for k in range(5): cs.rb(vc0, -0.73 + k * 0.066, -0.68 + k * 0.066, 1.08, 1.27, 0.12, 0.135, ['#1f2d55', '#efefea', '#26272b', '#b8242c', '#8d9196'][k], r=0.006)
# ---- 樓梯下的掛勾區（白板＋掛勾＋小包裝） ----
pg = Xf(3.08 - 0.01, 0.4, -math.pi / 2)                                                         # 正面朝 −x
pg.rb(vc0, -1.2, 1.2, 0.3, 1.95, -0.02, 0.0, '#f0efea', r=0.006)
for row in range(5):
    for k in range(7):
        x = -1.05 + k * 0.35; y = 1.78 - row * 0.32
        pg.cy(acc('steel', 0), (x, y, 0.0), (x, y + 0.01, 0.14), 0.0035, seg=4, caps=False)
        c = ['#1f3f8a', '#e8782a', '#26272b', '#efefea', '#2f6b45', '#b8242c'][(row * 7 + k) % 6]
        pg.rb(vc0, x - 0.06, x + 0.06, y - 0.22, y + 0.02, 0.02, 0.03, c, r=0.004); pg.rb(vc0, x - 0.045, x + 0.045, y - 0.18, y - 0.04, 0.03, 0.05, '#2a2b2f' if k % 2 else '#8fb8de', r=0.01)
# ---- 夾層下：獎盃架（後牆左） ----
tr = Xf(-2.7, IZ0 + 0.2)
tr.rb(acc('wood', 0), -1.5, 1.5, 0.0, 0.08, -0.2, 0.2, r=0.01); tr.rb(acc('wood', 0), -1.5, 1.5, 2.15, 2.2, -0.2, 0.2, r=0.01)
for sx in (-1.48, -0.5, 0.5, 1.48): tr.rb(acc('wood', 0), sx - 0.02, sx + 0.02, 0.0, 2.2, -0.2, 0.2, r=0.005)
for y in (0.6, 1.1, 1.6): tr.rb(acc('wood', 0), -1.5, 1.5, y - 0.02, y + 0.02, -0.2, 0.2, r=0.005)
rr = random.Random(5)
for y in (0.62, 1.12, 1.62):
    for k in range(7):
        x = -1.3 + k * 0.43; hh = rr.uniform(0.22, 0.42); w_ = 0.06 + hh * 0.12
        tr.rb(vg0, x - 0.05, x + 0.05, y, y + 0.05, -0.05, 0.05, '#3a2a22', r=0.008)
        tr.la(vg0, [(0.0, 0.0), (0.02, 0.0), (0.012, hh * 0.35), (w_, hh * 0.75), (w_ * 1.05, hh * 0.95), (0.0, hh * 0.95)], x, y + 0.05, 0, '#d2a945', seg=10)
        for s in (-1, 1): tr.cy(vg0, (x + s * w_ * 0.9, y + 0.05 + hh * 0.85, 0), (x + s * w_ * 1.5, y + 0.05 + hh * 0.65, 0), 0.008, '#d2a945', seg=5, caps=False)
for k in range(5): tr.rb(vc0, -1.35 + k * 0.62, -0.95 + k * 0.62, 0.08, 0.5, -0.12, 0.12, '#b08c5e' if k % 2 else '#c79f6c', r=0.01)   # 下層的紙箱
# ---- 夾層下：紙箱貨架（後牆右）、左牆層架、中間雙面貨架、右牆層架 ----
def steel_shelf(lv, cx, cz, ry, w, d, h, levels):
    xf = Xf(cx, cz, ry)
    for sx in (-w / 2 + 0.02, w / 2 - 0.02):
        for sz in (-d / 2 + 0.02, d / 2 - 0.02): xf.rb(acc('steel', lv), sx - 0.018, sx + 0.018, 0.0, h, sz - 0.018, sz + 0.018, r=0.004)
    for y in levels: xf.rb(acc('wood', lv), -w / 2, w / 2, y - 0.025, y, -d / 2, d / 2, r=0.008); xf.rb(vc0 if lv == 0 else acc('vc', lv), -w / 2, w / 2, y - 0.06, y - 0.025, d / 2, d / 2 + 0.006, '#f2f2ee', r=0.002)
    return xf


xf = steel_shelf(0, 2.95, IZ0 + 0.25, 0.0, 2.7, 0.5, 2.3, (0.1, 0.75, 1.4, 2.05))
rr = random.Random(6)
for y in (0.1, 0.75, 1.4, 2.05):
    x = -1.28
    while x < 1.2:
        bw = rr.uniform(0.3, 0.55); bh = rr.uniform(0.25, 0.5) if y < 2 else rr.uniform(0.2, 0.32)
        xf.rb(vc0, x, x + bw - 0.02, y, y + bh, -0.2, 0.2, rr.choice(['#b08c5e', '#c79f6c', '#a37f55', '#1f3f8a', '#efefea']), r=0.01)
        xf.rb(vc0, x + 0.05, x + bw - 0.08, y + bh * 0.4, y + bh * 0.7, 0.2, 0.203, '#f4f2ea', r=0.002); x += bw
xf = steel_shelf(0, -4.13, -4.2, math.pi / 2, 4.6, 0.5, 2.3, (0.1, 0.6, 1.1, 1.6, 2.1))         # 左牆：摺好的運動服、護具盒
for y in (0.1, 0.6, 1.1, 1.6):
    for k in range(10):
        x = -2.1 + k * 0.44; c = COLS[rr.choice(list(COLS))]
        for j in range(3 + k % 2): xf.rb(vc0, x, x + 0.34, y + j * 0.034, y + j * 0.034 + 0.032, -0.15, 0.14, c, r=0.01)
for k in range(8): xf.rb(vc0, -2.1 + k * 0.55, -1.7 + k * 0.55, 2.1, 2.34, -0.17, 0.17, rr.choice(['#1f3f8a', '#e8782a', '#efefea', '#26272b']), r=0.012)
cg = Xf(-2.0, -4.1, math.pi / 2)                                                                 # 中間雙面貨架（護脛、運動襪、球網）
cg.rb(acc('wood', 0), -1.5, 1.5, 0.0, 0.12, -0.3, 0.3, r=0.015, seg=2); cg.rb(vc0, -1.5, 1.5, 0.12, 1.7, -0.02, 0.02, '#f0efea', r=0.006)
for sx in (-1.5, 1.5): cg.rb(acc('steel', 0), sx - 0.025, sx + 0.025, 0.0, 1.75, -0.04, 0.04, r=0.005)
for side in (-1, 1):
    cg.rb(acc('wood', 0), -1.45, 1.45, 0.4, 0.43, 0.02 * side, 0.3 * side, r=0.006)
    for row, y in enumerate((1.55, 1.2, 0.85)):
        for k in range(8):
            x = -1.3 + k * 0.37; cg.cy(acc('steel', 0), (x, y, 0.02 * side), (x, y + 0.01, 0.17 * side), 0.0035, seg=4, caps=False)
            c = ['#26272b', '#efefea', '#1f2d55', '#e8782a'][(row + k) % 4]; cg.rb(vc0, x - 0.065, x + 0.065, y - 0.26, y + 0.02, 0.025 * side, 0.04 * side, c, r=0.006)
    for k in range(6): cg.rb(vc0, -1.35 + k * 0.47, -0.97 + k * 0.47, 0.43, 0.7, 0.05 * side, 0.27 * side, rr.choice(['#b08c5e', '#efefea', '#1f3f8a']), r=0.01)
# 水壺雙面架（夾層下，z −4.2～−1.3；端頭朝 +z）
wb = Xf(1.9, -2.75, math.pi / 2)
wb.rb(acc('wood', 0), -1.45, 1.45, 0.0, 0.12, -0.3, 0.3, r=0.015, seg=2); wb.rb(vc0, -1.45, 1.45, 0.12, 1.95, -0.015, 0.015, '#f0efea', r=0.006)
for sx in (-1.45, 0.0, 1.45): wb.rb(acc('steel', 0), sx - 0.025, sx + 0.025, 0.0, 2.0, -0.3, 0.3, r=0.005)
bott = [proto(f'bottle_{i}', (lambda i=i: bottle_bm(*BOTTLE_COLS[i])), 'vcg') for i in range(len(BOTTLE_COLS))]
for side in (-1, 1):
    for y in (0.75, 1.25, 1.7):
        wb.rb(acc('wood', 0), -1.42, 1.42, y - 0.025, y, 0.02 * side, 0.29 * side, r=0.006); wb.rb(vc0, -1.42, 1.42, y - 0.06, y - 0.025, 0.29 * side, 0.296 * side, '#f2f2ee', r=0.002)
        if y > 1.6:
            for k in range(7): wb.rb(vc0, -1.35 + k * 0.4, -1.03 + k * 0.4, y, y + 0.2, 0.06 * side, 0.26 * side, rr.choice(['#1f3f8a', '#efefea', '#e8782a', '#2f6b45']), r=0.01)   # 上層：盒裝的水壺
            continue
        for k in range(30):
            x = -1.35 + k * 0.093; gx, gy, gz = wb.p(x, y, 0.17 * side); inst(bott[(k + int(y * 7) + (side > 0)) % len(bott)], 0, gx, gy, gz, ry=random.uniform(0, 6.28))
    for k in range(6):                                                                         # 最下層：摺好的毛巾
        x = -1.25 + k * 0.48; c = ['#efefea', '#8fb8de', '#efefea', '#1f2d55', '#efefea', '#8d9196'][k]
        for j in range(4): wb.rb(vc0, x, x + 0.36, 0.12 + j * 0.045, 0.12 + j * 0.045 + 0.042, 0.05 * side, 0.26 * side, c, r=0.015)
xf = steel_shelf(0, 4.13, -4.4, -math.pi / 2, 4.0, 0.5, 2.3, (0.1, 0.85, 1.6))                   # 右牆：運動背包、球袋
for k, z in enumerate((-1.4, -0.7, 0.0, 0.7, 1.4)):
    gx, gy, gz = xf.p(z, 0.85, 0.0); inst(bagp[k % 3], 0, gx, gy, gz, ry=-math.pi / 2 + random.uniform(-0.2, 0.2))
for k in range(4):                                                                             # 籃球袋（網袋裝球）
    x = -1.5 + k * 1.0; xf.el(vc0, x, 0.32, 0.0, 0.16, 0.22, 0.14, '#26272b', seg=10, rings=6); xf.cy(vc0, (x, 0.5, 0), (x, 0.62, 0), 0.03, '#26272b', seg=6)
for k in range(6): xf.rb(vc0, -1.8 + k * 0.62, -1.38 + k * 0.62, 1.6, 1.95, -0.18, 0.18, rr.choice(['#b08c5e', '#1f3f8a', '#efefea']), r=0.01)
# 夾層前緣下面的長橫幅（店名底板；字由遊戲畫）
sg = next(s for s in LAY['signs'] if s['id'] == 'name_banner')
bn = acc('vc', 1); bz = MZ + 0.045
bn.crbox(sg['x'] - sg['w'] / 2, sg['x'] + sg['w'] / 2, sg['y'] - sg['h'] / 2, sg['y'] + sg['h'] / 2, bz, bz + 0.03, '#1d3a8a', r=0.008)
bn.crbox(sg['x'] - sg['w'] / 2, sg['x'] + sg['w'] / 2, sg['y'] - sg['h'] / 2 + 0.05, sg['y'] - sg['h'] / 2 + 0.1, bz + 0.03, bz + 0.035, '#e8782a', r=0.003)
bn.crbox(sg['x'] + sg['w'] * 0.2, sg['x'] + sg['w'] / 2, sg['y'] - sg['h'] / 2 + 0.12, sg['y'] - sg['h'] / 2 + 0.145, bz + 0.03, bz + 0.035, '#f4f4f0', r=0.003)
bn.crbox(sg['x'] - sg['w'] / 2, sg['x'] - sg['w'] * 0.25, sg['y'] + sg['h'] / 2 - 0.1, sg['y'] + sg['h'] / 2 - 0.06, bz + 0.03, bz + 0.035, '#e8782a', r=0.003)
# 右牆高處的樓層牌（底板）
fg = next(s for s in LAY['signs'] if s['id'] == 'floor_guide'); board('right', 1, fg['z'], fg['y'], fg['w'], fg['h'], off=0.15)

# ======================================================================
# 夾層（二樓）
# ======================================================================
vc1, vg1 = acc('vc', 1), acc('vcg', 1)
DECAL = {0: [], 1: [], 'wall': []}


def decal(where, xf, cx, cy, cz, w, h, cell):
    u0, v0, u1, v1 = cell_uv(cell)
    DECAL[where].append(([xf.p(cx - w / 2, cy - h / 2, cz), xf.p(cx + w / 2, cy - h / 2, cz), xf.p(cx + w / 2, cy + h / 2, cz), xf.p(cx - w / 2, cy + h / 2, cz)], (u0, v0, u1, v1)))


# 欄杆上方吊著的三件系隊球衣（只有背號 37、16、88；參考圖）
rod_y, rod_z = 6.55, MZ - 0.35
acc('steel', 1).cyl((-4.0, rod_y, rod_z), (-0.6, rod_y, rod_z), 0.014, seg=8)
for x in (-3.9, -0.7): acc('steel', 1).cyl((x, rod_y, rod_z), (x, HT, rod_z), 0.004, seg=4)
for x, j in zip((-3.3, -2.3, -1.3), LAY['jerseys']['display']):
    me = garment('jersey', j['color']); inst(me, 1, x, rod_y + 0.005, rod_z, ry=0.0, s=1.2)
    cell = f"{j['no']}{'n' if j['color'] in ('white', 'lightblue') else 'w'}"; decal(1, Xf(x, rod_z), 0, rod_y - 0.52, 0.072, 0.3, 0.3, cell)
# 後牆的系隊球衣牆（法律系深藍 7 號在中間；牆的組，掛鉤＋扁平的球衣）
for k, j in enumerate(LAY['jerseys']['wall']):
    x = -3.85 + k * 0.82; y = 5.85; zf = IZ0 + 0.05
    wm('back', 1, 'steel').box(x - 0.012, x + 0.012, y - 0.01, y + 0.012, IZ0, zf + 0.02)
    gb = garment_bm('jersey', COLS[j['color']], TRIM[j['color']], flat=0.45)
    put(wm('back', 1, 'vc'), gb, Matrix.Translation(g2b(x, y, zf + 0.035)), None)
    cell = f"{j['no']}{'n' if j['color'] in ('white', 'lightblue') else 'w'}"; decal('wall', Xf(x, zf + 0.035), 0, y - 0.48, 0.03, 0.24, 0.24, cell)
ob = next(s for s in LAY['signs'] if s['id'] == 'order_banner'); board('back', 1, ob['x'], ob['y'], ob['w'], ob['h'], off=0.15)
sc_ = next(s for s in LAY['signs'] if s['id'] == 'size_chart'); board('back', 1, sc_['x'], sc_['y'], sc_['w'], sc_['h'], white=True, off=0.15)
for k, z in enumerate((-6.2, -5.4)):                                                            # 右牆兩件藍色樣品（參考圖右邊）
    wm('right', 1, 'steel').box(IX1 - 0.04, IX1, 5.6, 5.62, z - 0.012, z + 0.012)
    put(wm('right', 1, 'vc'), garment_bm('jersey', COLS['royal'], TRIM['royal'], flat=0.45), Matrix.Translation(g2b(IX1 - 0.05, 5.6, z)) @ Matrix.Rotation(-math.pi / 2, 4, 'Z'), None)
# 長桌（摺好的系服樣品、型錄、布樣本）
lt = Xf(-2.2, -5.3)
lt.rb(acc('wood', 1), -1.2, 1.2, Y1 + 0.74, Y1 + 0.78, -0.3, 0.3, r=0.015, seg=2)
for sx in (-1.12, 1.12):
    lt.rb(acc('dark', 1), sx - 0.025, sx + 0.025, Y1, Y1 + 0.74, -0.26, 0.26, r=0.006); lt.rb(acc('dark', 1), sx - 0.03, sx + 0.03, Y1, Y1 + 0.03, -0.28, 0.28, r=0.006)
lt.rb(acc('dark', 1), -1.12, 1.12, Y1 + 0.66, Y1 + 0.7, -0.02, 0.02, r=0.006)
for i, (sx, c) in enumerate(((-0.85, 'deepnavy'), (-0.45, 'maroon'), (-0.05, 'green'), (0.35, 'royal'))):
    for k in range(3 + i % 2): lt.rb(vc1, sx - 0.16, sx + 0.16, Y1 + 0.78 + k * 0.03, Y1 + 0.78 + k * 0.03 + 0.028, -0.18, 0.12, COLS[c], r=0.01)
lt.rb(vc1, 0.62, 0.92, Y1 + 0.78, Y1 + 0.83, -0.2, 0.1, '#1d3a8a', r=0.01); lt.rb(vc1, 0.64, 0.9, Y1 + 0.83, Y1 + 0.84, -0.18, 0.08, '#f4f2ea', r=0.003)   # 型錄
for k in range(6): lt.rb(vc1, 0.98, 1.12, Y1 + 0.78 + k * 0.006, Y1 + 0.784 + k * 0.006, -0.15 + k * 0.012, 0.0 + k * 0.012, ['#1f2d55', '#b8242c', '#efefea', '#2f6b45', '#d8742c', '#26272b'][k], r=0.002)   # 布樣本
# 運動服衣架（Alison 在這裡挑）
rack(1, -2.0, -3.6, math.pi / 2, 1.8, [(0.0, 1.45)], [mix(['tee', 'jersey', 'shorts'], ['lightblue', 'white', 'navy', 'maroon', 'grey', 'black'], 14, 8)])
# 訂做櫃台（原木、白色檯面；客人那一面朝 +z）
oc = Xf(1.2, -4.7)
oc.rb(acc('wood', 1), -1.2, 1.2, Y1, Y1 + 0.98, -0.3, 0.3, r=0.02, seg=2)
oc.rb(vc1, -1.22, 1.22, Y1 + 0.98, Y1 + 1.02, -0.32, 0.32, '#f2f1ec', r=0.01)
oc.rb(vc1, -1.18, 1.18, Y1, Y1 + 0.08, 0.28, 0.31, '#3a3b3f', r=0.005); oc.rb(vc1, -1.0, 1.0, Y1 + 0.5, Y1 + 0.56, 0.3, 0.315, '#e8782a', r=0.004)
oc.rb(vc1, -0.6, -0.1, Y1 + 1.06, Y1 + 1.36, -0.14, -0.12, '#1b1c1f', r=0.01); oc.cy(vc1, (-0.35, Y1 + 1.02, -0.12), (-0.35, Y1 + 1.08, -0.13), 0.02, '#2a2b2f', seg=6)   # 螢幕（朝店員）
oc.rb(vc1, -0.55, -0.15, Y1 + 1.02, Y1 + 1.04, -0.02, 0.12, '#2a2b2f', r=0.005)                  # 鍵盤
for k in range(4): oc.rb(vc1, 0.2 + k * 0.05, 0.24 + k * 0.05, Y1 + 1.02, Y1 + 1.3, -0.2, 0.0, ['#1d3a8a', '#b8242c', '#2f6b45', '#efefea'][k], r=0.005)   # 型錄、資料夾
oc.la(vc1, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.0, 0.1)], 0.7, Y1 + 1.02, -0.05, '#3a3b3f', seg=10)   # 筆筒
for k in range(3): oc.cy(vc1, (0.69 + k * 0.01, Y1 + 1.1, -0.05), (0.66 + k * 0.03, Y1 + 1.22, -0.05), 0.004, ['#1d3a8a', '#b8242c', '#26272b'][k], seg=4)
for k in range(3): oc.rb(vc1, 0.85, 1.12, Y1 + 1.02 + k * 0.028, Y1 + 1.048 + k * 0.028, -0.05, 0.2, COLS[['deepnavy', 'white', 'red'][k]], r=0.01)   # 摺好的樣品球衣
# 裁縫車桌＋工業裁縫車＋線軸＋圓凳
st_ = Xf(3.4, -6.75)
st_.rb(acc('wood', 1), -0.6, 0.6, Y1 + 0.74, Y1 + 0.78, -0.3, 0.3, r=0.012, seg=2)
for sx in (-0.55, 0.55): st_.rb(acc('dark', 1), sx - 0.02, sx + 0.02, Y1, Y1 + 0.74, -0.26, 0.26, r=0.005)
st_.rb(acc('dark', 1), -0.55, 0.55, Y1 + 0.12, Y1 + 0.15, -0.02, 0.02, r=0.005)
st_.rb(vc1, -0.12, 0.08, Y1 + 0.05, Y1 + 0.1, -0.05, 0.15, '#2a2b2f', r=0.01)                     # 踏板
ym = Y1 + 0.78
st_.rb(vc1, -0.28, 0.24, ym, ym + 0.06, -0.12, 0.08, '#e6e2d6', r=0.012)                          # 機台底座
st_.rb(vc1, 0.12, 0.24, ym + 0.06, ym + 0.34, -0.1, 0.06, '#e6e2d6', r=0.03, seg=2)              # 立柱
st_.rb(vc1, -0.26, 0.24, ym + 0.27, ym + 0.38, -0.08, 0.05, '#e6e2d6', r=0.035, seg=2)           # 機臂
st_.rb(vc1, -0.3, -0.18, ym + 0.12, ym + 0.38, -0.07, 0.05, '#e6e2d6', r=0.025, seg=2)          # 機頭
st_.cy(vc1, (0.24, ym + 0.26, -0.02), (0.28, ym + 0.26, -0.02), 0.07, '#3a3b3f', seg=14)          # 手輪
st_.cy(vc1, (-0.25, ym + 0.12, 0.0), (-0.25, ym + 0.06, 0.0), 0.006, '#c9ccce', seg=5)            # 針
st_.cy(vc1, (-0.25, ym + 0.08, 0.0), (-0.25, ym + 0.07, 0.03), 0.018, '#c9ccce', seg=6)           # 壓布腳
for k, c in enumerate(('#1f2d55', '#efefea', '#b8242c')):
    st_.cy(vc1, (-0.05 + k * 0.08, ym + 0.38, -0.02), (-0.05 + k * 0.08, ym + 0.5, -0.02), 0.004, '#c9ccce', seg=4)
    st_.la(vc1, [(0.0, 0.0), (0.028, 0.0), (0.02, 0.07), (0.008, 0.09), (0.0, 0.09)], -0.05 + k * 0.08, ym + 0.38, -0.02, c, seg=8)   # 線軸
st_.cy(vc1, (-0.22, ym + 0.38, 0.02), (-0.22, ym + 0.55, 0.04), 0.006, '#3a3b3f', seg=5); st_.la(vc1, [(0.0, 0.0), (0.045, 0.0), (0.03, 0.06), (0.0, 0.06)], -0.22, ym + 0.5, 0.08, '#3a3b3f', seg=10)   # 檯燈
st_.rb(vc1, 0.32, 0.56, ym, ym + 0.02, -0.2, 0.15, '#1f2d55', r=0.006); st_.rb(vc1, 0.34, 0.52, ym + 0.02, ym + 0.03, -0.18, 0.1, '#efefea', r=0.004)   # 裁好的布片
stool = Xf(3.4, -6.12)
stool.la(vc1, [(0.0, 0.0), (0.17, 0.0), (0.18, 0.04), (0.0, 0.05)], 0, Y1 + 0.46, 0, '#2a2b2f', seg=14)
stool.cy(acc('dark', 1), (0, Y1, 0), (0, Y1 + 0.46, 0), 0.022, seg=8)
for k in range(4): a = k * math.pi / 2 + 0.4; stool.cy(acc('dark', 1), (0, Y1 + 0.03, 0), (0.2 * math.cos(a), Y1, 0.2 * math.sin(a)), 0.014, seg=6)
# 布料捲的桶（右牆）
fb = Xf(4.0, -3.4)
for (a0, a1, b0, b1) in ((-0.33, 0.33, -0.43, -0.4), (-0.33, 0.33, 0.4, 0.43), (-0.33, -0.3, -0.43, 0.43), (0.3, 0.33, -0.43, 0.43)): fb.rb(acc('wood', 1), a0, a1, Y1, Y1 + 0.55, b0, b1, r=0.006)
fb.rb(acc('wood', 1), -0.33, 0.33, Y1, Y1 + 0.03, -0.43, 0.43, r=0.006)
rr = random.Random(11)
for k, c in enumerate(('#1f2d55', '#b8242c', '#efefea', '#2950a8', '#26272b', '#d8742c', '#8d9196', '#17213f')):
    x = -0.18 + (k % 3) * 0.17 + rr.uniform(-0.02, 0.02); z = -0.3 + (k // 3) * 0.28 + rr.uniform(-0.03, 0.03); h = rr.uniform(1.35, 1.7)
    fb.cy(vc1, (x, Y1 + 0.03, z), (x + rr.uniform(-0.06, 0.06), Y1 + h, z + rr.uniform(-0.05, 0.05)), 0.065, c, seg=12)
    fb.cy(vc1, (x, Y1 + h - 0.02, z), (x, Y1 + h + 0.04, z), 0.025, '#c9a46a', seg=8)
for k, c in enumerate(('#efefea', '#1f2d55', '#2f6b45')):                                       # 右牆架子上躺著的三捲
    zc = -2.3 - k * 0.0; y = Y1 + 1.4 + k * 0.16
    wm('right', 1, 'vc').cbox(IX1 - 0.3, IX1, y - 0.075, y - 0.065, -2.9, -1.7, '#c9ccce') if k == 0 else None
    put(wm('right', 1, 'vc'), cyl_bm((IX1 - 0.16, y, -2.8), (IX1 - 0.16, y, -1.8), 0.068, 12), None, c)
# ---- 背號貼圖（三組：一樓（沒有）、夾層、後牆的組） ----
for where, items in DECAL.items():
    if not items: continue
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, (u0, v0, u1, v1) in items:
        f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    name = 'WALL_back_L1_print' if where == 'wall' else f'L{where}_print'
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M['print']); o = bpy.data.objects.new(name, me); B.scene().collection.objects.link(o); o.parent = root
    if where == 'wall': o['dir'] = DIRS['back']
# 夾層的燈：吸頂日光燈已經在 7.2 m 的天花板

# ======================================================================
for (key, lv_), m in _acc.items(): m.finish(root, uv=key not in ('vc', 'vcg'), smooth=key in ('vc', 'vcg', 'steel', 'dark', 'wood'))
for (side, lv_, key), m in walls.items(): m.finish(root, uv=key not in ('vc', 'vcg'), props={'dir': DIRS[side]}, smooth=key in ('vc',))
L.merge_by_material(root, keep=lambda ob: ob.parent is not root, key=lambda ob: '_'.join(ob.name.split('_')[:3]) if ob.name.startswith('WALL_') else ob.name.split('_')[0])
ss = L.single_side(root, keep=r'glass')
# 每一層的三角形（instancing 照實際畫出的數量）
per = {0: 0, 1: 0}
for o in [o for o in root.children_recursive if o.type == 'MESH']:
    n = sum(len(p.vertices) - 2 for p in o.data.polygons); nm = o.name
    lvv = 1 if ('_L1_' in nm or nm.startswith('L1_') or (o.parent and o.parent.name == 'L1_inst')) else 0
    per[lvv] += n
mats = {0: set(), 1: set()}
for o in [o for o in root.children_recursive if o.type == 'MESH']:
    lvv = 1 if ('_L1_' in o.name or o.name.startswith('L1_') or (o.parent and o.parent.name == 'L1_inst')) else 0
    for m in o.data.materials: mats[lvv].add(m.name)
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAY['version'], 'tris_per_level': per, 'materials_per_level': {k: len(v) for k, v in mats.items()}, 'textures': ['large_floor_tiles_02', 'painted_plaster_wall', 'walnut_veneer', 'granite_tile_03', 'xs_print（PIL 產生：球的接縫、背號）']})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps({'per_level_tris': per, 'per_level_mats': {k: sorted(v) for k, v in mats.items()}}, ensure_ascii=False))
