"""ART-KH-BUS：經濟系 7/25 成績公布那天的三張 2D 背景（AA_272 第 4 節 4-2、4-3；LAWWW-C 派工 2026-10-17）。LAWWW2-C。
Blender 5.2（bpy，無介面）＋Cycles（CPU）→ PNG → bg_paint.py（繪畫感）→ assets/bg/*.webp（1672×941，和 bus_night、cram_class 同規格）。畫面上沒有人（人物用 ADV 立繪疊上去，中間留空）。
  /opt/blenv/bin/python tools/blender/env_second/bg_kh.py -- <bus|station|store> <輸出.png> [--res 1672x941] [--samples 64]
- bus：客運車廂（白天，國道上）。4-2「國道上。你已經坐了一個多小時。」「窗外是一片一片的田。」7 月上午十一點、往南開：
  台灣的國道客運（2＋2 深藍花紋座椅、白色頭枕套、窗簾綁在窗柱上、頭頂行李架＋閱讀燈）；窗外右邊（西）是稻田、農舍、檳榔樹、電線桿，左邊（東）是中央分隔島、對向車道、遠山。
- station：高雄客運站出口（白天 12:10）。4-3「客運站出口。她在等。」：出口的雨遮、玻璃自動門、「出口 EXIT」指標、旁邊的客運月台（兩台客運）、
  大王椰子、整排機車、人行道的地磚、正中午的大太陽。站名不寫真的（只寫「客運站」）。
- store：客運站外面的便利商店前（晚上 20:00）。4-3「客運站外面的便利商店前」：虛構的「日日便利」（和機場同一家虛構連鎖，D77）、
  亮著的店面、門口的機車、路燈、對街客運站亮著的招牌。
座標＝Blender 原生（x 往右、y 往前、z 往上）。"""
import math, os, random, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter

A = sys.argv[sys.argv.index('--') + 1:]
VAR, OUT = A[0], A[1]
def opt(name, default): return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1672x941').split('x')); SAMPLES = int(opt('--samples', '64'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_kh_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random({'bus': 725, 'station': 1210, 'store': 2000}[VAR])
NIGHT = VAR == 'store'

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'
sc.view_settings.exposure = float(opt('--exposure', {'bus': '0.0', 'station': '-0.3', 'store': '0.4'}[VAR]))
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 32; sc.cycles.transmission_bounces = 8


# ---------------- 材質、幾何的小工具（和 bg_car.py 同一套）----------------
def mat(name, col, rough=0.5, metal=0.0, emit=None, estr=1.0, trans=0.0, ior=1.45, alpha=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    c = tuple(B.srgb(col)) + (1.0,)
    b.inputs['Base Color'].default_value = c; b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if trans: b.inputs['Transmission Weight'].default_value = trans; b.inputs['IOR'].default_value = ior
    if emit: b.inputs['Emission Color'].default_value = (*B.srgb(emit), 1.0); b.inputs['Emission Strength'].default_value = estr
    if alpha is not None: b.inputs['Alpha'].default_value = alpha
    return m


def noise_mat(name, c1, c2, scale=8.0, rough=0.9, bump=0.3, detail=6.0, p0=0.35, p1=0.65):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; b = N['Principled BSDF']
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = detail
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (*B.srgb(c1), 1); ramp.color_ramp.elements[1].color = (*B.srgb(c2), 1)
    ramp.color_ramp.elements[0].position = p0; ramp.color_ramp.elements[1].position = p1
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if bump:
        bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def img_mat(name, path, rough=0.6, emit=0.0, repeat=True, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.extension = 'REPEAT' if repeat else 'EXTEND'
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    if alpha: nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    return m


def obj(name, bm, m, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


class Acc:
    """同一個材質的零件累積成一個物件（算圖快、場景樹乾淨）"""
    def __init__(self, name, m): self.name, self.m, self.bm = name, m, bmesh.new()
    def box(self, c, size, rz=0.0, rx=0.0, bevel=0.0):
        if bevel:
            t = L.rbox_bm(size[0], size[2], size[1], bevel, 2); me = bpy.data.meshes.new('_t'); t.to_mesh(me); t.free()
            vs0 = len(self.bm.verts); self.bm.from_mesh(me); bpy.data.meshes.remove(me)
            self.bm.verts.ensure_lookup_table(); vs = [self.bm.verts[i] for i in range(vs0, len(self.bm.verts))]
        else:
            vs = bmesh.ops.create_cube(self.bm, size=1.0)['verts']
            for v in vs: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
        M_ = Matrix.Translation(Vector(c)) @ Matrix.Rotation(rz, 4, 'Z') @ Matrix.Rotation(rx, 4, 'X')
        bmesh.ops.transform(self.bm, matrix=M_, verts=vs); return self
    def quad(self, pts, uv=None):
        f = self.bm.faces.new([self.bm.verts.new(Vector(p)) for p in pts])
        if uv:
            ul = self.bm.loops.layers.uv.verify()
            for lp, t in zip(f.loops, uv): lp[ul].uv = t
        return self
    def cyl(self, a, b, r, seg=10, r2=None):
        pa, pb = Vector(a), Vector(b); d = pb - pa
        res = bmesh.ops.create_cone(self.bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
        bmesh.ops.rotate(self.bm, verts=res['verts'], cent=(0, 0, 0), matrix=rot); bmesh.ops.translate(self.bm, verts=res['verts'], vec=(pa + pb) / 2); return self
    def ell(self, c, rx, ry, rz, seg=10, rings=6):
        vs = bmesh.ops.create_uvsphere(self.bm, u_segments=seg, v_segments=rings, radius=1.0)['verts']
        for v in vs: v.co = Vector((c[0] + v.co.x * rx, c[1] + v.co.y * ry, c[2] + v.co.z * rz))
        return self
    def done(self, smooth=False):
        if len(self.bm.faces) == 0: self.bm.free(); return None
        return obj(self.name, self.bm, self.m, smooth)


def ridge(name, dist, h0, amp, col, seed, x0=-1400, x1=1400, n=220, side=1, z0=-18):
    """遠山的稜線（幾個正弦波疊加）；dist＝沿 x 的距離（side＝−1 在左邊：面朝 +x）或沿 y"""
    rr = random.Random(seed); ph = [rr.uniform(0, 6.28) for _ in range(4)]
    bm_ = bmesh.new(); pts = []
    for i in range(n + 1):
        t = x0 + i * (x1 - x0) / n; u = t / 300.0
        z = h0 + amp * (0.55 * math.sin(u * 1.3 + ph[0]) + 0.3 * math.sin(u * 2.9 + ph[1]) + 0.15 * math.sin(u * 6.1 + ph[2]) + 0.06 * math.sin(u * 13.0 + ph[3]))
        e = min(1.0, (t - x0) / 180.0, (x1 - t) / 180.0) ** 0.7; z = z0 + (z - z0) * e
        pts.append((bm_.verts.new((side * dist, t, z0)), bm_.verts.new((side * dist, t, max(z, z0)))))
    for i in range(n): bm_.faces.new((pts[i][0], pts[i + 1][0], pts[i + 1][1], pts[i][1]))
    return obj(name, bm_, mat(name, col, rough=1.0))


def world_day(sun_elev, sun_rot, strength=0.32, sun_energy=4.5, sun_col=(1.0, 0.95, 0.86)):
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
    sky = nt.nodes.new('ShaderNodeTexSky')
    try: sky.sky_type = 'NISHITA'
    except Exception: pass
    try: sky.sun_elevation = math.radians(sun_elev); sky.sun_rotation = math.radians(sun_rot); sky.air_density = 1.4; sky.dust_density = 2.2
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = strength
    lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = sun_energy; lt.angle = math.radians(1.2); lt.color = sun_col
    o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(90 - sun_elev), 0, math.radians(sun_rot + 90))


def clouds(n, dist0, dist1, zlo, zhi, seed, side_ok=lambda x, y: True):
    """積雲：遠處幾片畫的雲（PIL 白色團塊、柔邊、透明）"""
    p = os.path.join(TMP, 'cloud.png')
    if not os.path.exists(p):
        r = random.Random(5); im = Image.new('RGBA', (512, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        for k in range(26):
            cx, cy = r.uniform(80, 432), r.uniform(110, 190); rr_ = r.uniform(30, 70)
            sh = int(235 + 20 * (1 - cy / 256)); d.ellipse([cx - rr_, cy - rr_ * 0.8, cx + rr_, cy + rr_ * 0.8], fill=(sh, sh, min(255, sh + 6), 255))
        d.rectangle([0, 200, 512, 256], fill=(0, 0, 0, 0)); im = im.filter(ImageFilter.GaussianBlur(6))
        a = np.array(im).astype(np.float32); a[..., :3] = np.clip(a[..., :3] * np.linspace(1.0, 0.86, 256)[:, None, None], 0, 255); Image.fromarray(a.astype(np.uint8)).save(p)
    m = img_mat('cloud', p, rough=1.0, emit=1.2, repeat=False, alpha=True)
    r = random.Random(seed); ac = Acc('clouds', m)
    for k in range(n):
        for _ in range(20):
            a = r.uniform(-math.pi, math.pi); dd = r.uniform(dist0, dist1); x, y = math.sin(a) * dd, math.cos(a) * dd
            if side_ok(x, y): break
        w = r.uniform(180, 420); h = w * 0.5; z = r.uniform(zlo, zhi); nx, ny = -x / dd, -y / dd; tx, ty = -ny, nx
        ac.quad([(x - tx * w / 2, y - ty * w / 2, z), (x + tx * w / 2, y + ty * w / 2, z), (x + tx * w / 2, y + ty * w / 2, z + h), (x - tx * w / 2, y - ty * w / 2, z + h)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)])
    return ac.done()


def camera(eye, look, lens):
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.data.clip_end = 6000
    cam.location = Vector(eye); d = Vector(look) - Vector(eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


# ================================================================ bus：客運車廂（白天、國道上）
def tex_seat_fabric():
    """座椅布：深藍底、細細的淺藍小花紋（國道客運常見）"""
    p = os.path.join(TMP, 'seat.png'); W = 256; r = random.Random(3)
    im = Image.new('RGB', (W, W), (30, 40, 72)); d = ImageDraw.Draw(im)
    for y in range(0, W, 32):
        for x in range(0, W, 32):
            ox = 16 if (y // 32) % 2 else 0; cx, cy = x + ox, y + 16
            d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], outline=(70, 96, 150), width=2); d.line([cx - 9, cy, cx + 9, cy], fill=(52, 70, 118), width=1)
    a = np.array(im).astype(np.float32) + np.random.default_rng(2).normal(0, 5, (W, W, 1)); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(p); return p


def tex_paddy():
    """稻田（7 月：綠油油、一格一格、田埂淺色、有幾格剛插秧有水的反光）：1 張＝60 m × 60 m"""
    p = os.path.join(TMP, 'paddy.png'); W = 1024; r = random.Random(11)
    im = Image.new('RGB', (W, W), (88, 128, 52)); d = ImageDraw.Draw(im)
    xs = [0]; ys = [0]
    while xs[-1] < W: xs.append(xs[-1] + r.randint(110, 200))
    while ys[-1] < W: ys.append(ys[-1] + r.randint(150, 300))
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            k = r.random()
            col = (r.randint(52, 74), r.randint(104, 128), r.randint(30, 44)) if k < 0.6 else ((r.randint(96, 120), r.randint(132, 150), r.randint(44, 60)) if k < 0.85 else ((r.randint(140, 160), r.randint(150, 166), r.randint(70, 84)) if k < 0.94 else (126, 150, 160)))   # 深綠、黃綠、快熟的黃、剛插秧的水田
            d.rectangle([xs[i] + 3, ys[j] + 3, xs[i + 1] - 3, ys[j + 1] - 3], fill=col)
            for t in range(ys[j] + 6, ys[j + 1] - 3, 7): d.line([xs[i] + 4, t, xs[i + 1] - 4, t], fill=tuple(max(0, c - 14) for c in col), width=1)   # 稻子的行
    for x in xs: d.line([x, 0, x, W], fill=(128, 118, 84), width=6)
    for y in ys: d.line([0, y, W, y], fill=(128, 118, 84), width=6)
    im.filter(ImageFilter.GaussianBlur(1.0)).save(p); return p


def tex_highway():
    """國道路面（一個方向三線＋路肩）：u 0～1＝0～14 m；v 每 1＝18 m（虛線 4 m 一段）"""
    p = os.path.join(TMP, 'hw.png'); W, H = 512, 1024; rs = np.random.default_rng(4)
    a = np.zeros((H, W, 3), np.float32) + np.array([96, 96, 98], np.float32); a += rs.normal(0, 6, (H, W, 1))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im); WL = (232, 232, 224); YL = (226, 176, 50)
    for u in (0.035,): d.rectangle([u * W - 3, 0, u * W + 3, H], fill=YL)                     # 內側（分隔島那一側）黃線
    for u in (0.82,): d.rectangle([u * W - 4, 0, u * W + 4, H], fill=WL)                       # 外側（路肩）白實線
    for u in (0.3, 0.56):                                                                     # 車道虛線
        for v in range(0, H, 1024 // 18 * 6): d.rectangle([u * W - 3, v, u * W + 3, v + 1024 // 18 * 4], fill=WL)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(p); return p


def palm(TRUNK, CROWN, x, y, z0, h, lean, r, nf=9, fl=2.2, w=0.16):
    """檳榔樹、椰子樹：細長的樹幹（微彎）＋頂上一圈往下垂的羽狀葉（每片葉子＝幾段越來越細的扁圓柱）"""
    tx, ty = x + lean, y
    TRUNK.cyl((x, y, z0), (tx, ty, z0 + h), 0.12, seg=6, r2=0.09)
    for k in range(nf):
        a = k * 2 * math.pi / nf + r.uniform(-0.2, 0.2); L_ = fl * r.uniform(0.85, 1.1); droop = r.uniform(0.9, 1.5)
        ex, ey = tx + math.cos(a) * L_, ty + math.sin(a) * L_
        for t in range(5):
            t0, t1 = t / 5, (t + 1) / 5
            z0_ = z0 + h + 0.25 + 0.5 * math.sin(math.pi * t0 * 0.7) - droop * t0 ** 2; z1_ = z0 + h + 0.25 + 0.5 * math.sin(math.pi * t1 * 0.7) - droop * t1 ** 2
            CROWN.cyl((tx + (ex - tx) * t0, ty + (ey - ty) * t0, z0_), (tx + (ex - tx) * t1, ty + (ey - ty) * t1, z1_), w * (1 - t0 * 0.6), seg=4, r2=w * (1 - t1 * 0.6))


def scene_bus():
    L0, L1 = -7.0, 6.4                         # 車廂前後（y）；地板 z 0；路面 z −1.35
    HW = 1.2                                    # 車廂內半寬
    FLOOR = mat('floor', '#5a5d62', rough=0.7); AISLE = mat('aisle', '#3e4146', rough=0.85)
    WALL = mat('wall_panel', '#c9c4b8', rough=0.75); TRIM = mat('trim', '#8d8a84', rough=0.5); DARK = mat('dark', '#26282c', rough=0.6)
    CEIL = mat('ceiling', '#dcd8ce', rough=0.9); RACK = mat('rack', '#b9b5ac', rough=0.55, metal=0.15)
    SEAT = img_mat('seat_fabric', tex_seat_fabric(), rough=0.95); COVER = mat('headrest_cover', '#dcd7cc', rough=0.95)
    PLAST = mat('seat_plastic', '#3a3d44', rough=0.5); CURT = noise_mat('curtain', '#4a5a7a', '#5e6e8e', scale=30, bump=0.1)
    GLASS = mat('glass', '#dfeee8', rough=0.02, trans=1.0, ior=1.05, alpha=1.0); LAMP = mat('lamp_off', '#e8e4da', rough=0.3)
    ac = {k: Acc('bus_' + k, m) for k, m in (('floor', FLOOR), ('aisle', AISLE), ('wall', WALL), ('trim', TRIM), ('dark', DARK), ('ceil', CEIL), ('rack', RACK),
                                              ('seat', SEAT), ('cover', COVER), ('plast', PLAST), ('curt', CURT), ('lamp', LAMP), ('stripe', mat('cover_stripe', '#2a4a8a', rough=0.8)))}
    ac['floor'].box((0, (L0 + L1) / 2, -0.05), (2 * HW + 0.2, L1 - L0, 0.1))
    ac['aisle'].box((0, (L0 + L1) / 2, 0.003), (0.46, L1 - L0 - 1.2, 0.006))
    # 兩側：窗下的牆板（0～0.82）、窗柱（每 1.7 m）、窗上的牆（1.78～1.95）；窗是玻璃
    WIN0, WIN1 = 0.82, 1.78; pillars = [0.86 + (k - 4) * 1.72 for k in range(8)]   # 鏡頭那一格窗（y −0.86～0.86）正好在祐廷旁邊
    for s in (-1, 1):
        x = s * HW
        ac['wall'].box((x + s * 0.03, (L0 + L1) / 2, WIN0 / 2), (0.06, L1 - L0, WIN0))
        ac['trim'].box((x - s * 0.06, (L0 + L1) / 2, 0.32), (0.12, L1 - L0, 0.18))           # 窗下的暖氣管罩
        ac['wall'].box((x + s * 0.03, (L0 + L1) / 2, (WIN1 + 2.0) / 2), (0.06, L1 - L0, 2.0 - WIN1))
        for y in pillars:
            ac['trim'].box((x - s * 0.02, y, (WIN0 + WIN1) / 2), (0.1, 0.16, WIN1 - WIN0))
            # 窗簾：綁在柱子旁邊的一束布（上面寬、綁帶的地方窄、下面再散開），一褶一褶的鋸齒斷面
            prof = [(WIN1 + 0.06, 0.26), (1.36, 0.1), (1.24, 0.07), (WIN0 + 0.06, 0.16)]
            rows_ = []
            for (zz, wd) in prof:
                pts_ = []
                for k in range(9):
                    t = k / 8; pts_.append((x - s * (0.07 + (0.035 if k % 2 else 0.0)), y + 0.09 + t * wd, zz))
                rows_.append(pts_)
            for a_, b_ in zip(rows_, rows_[1:]):
                for k in range(8): ac['curt'].quad([a_[k], a_[k + 1], b_[k + 1], b_[k]])   # 單面就好（Cycles 兩面都畫；疊兩片反向的面會變成一大塊黑：第七次預覽）
            ac['trim'].box((x - s * 0.09, y + 0.14, 1.3), (0.06, 0.14, 0.05))                                   # 綁帶
        ac['dark'].box((x - s * 0.02, (L0 + L1) / 2, WIN1 + 0.04), (0.08, L1 - L0, 0.06))       # 窗簾軌
        # 窗玻璃不放：Cycles 的薄玻璃（透射）讓窗外整片發白（第一次預覽）；畫面上看不出有沒有玻璃
        # 行李架（牆往內 0.45 m、底下一排閱讀燈＋出風口的服務面板）
        ac['rack'].box((x - s * 0.24, (L0 + L1) / 2, 2.02), (0.48, L1 - L0 - 0.6, 0.04))
        ac['rack'].box((x - s * 0.47, (L0 + L1) / 2, 2.08), (0.03, L1 - L0 - 0.6, 0.16))
        ac['ceil'].box((x - s * 0.24, (L0 + L1) / 2, 1.95), (0.46, L1 - L0 - 0.6, 0.1))
        for y in [L0 + 0.8 + k * 0.86 for k in range(14)]:
            ac['lamp'].cyl((x - s * 0.3, y, 1.895), (x - s * 0.3, y, 1.9), 0.04, seg=12); ac['dark'].cyl((x - s * 0.16, y, 1.895), (x - s * 0.16, y, 1.9), 0.03, seg=10)
    ac['ceil'].quad([(-HW + 0.45, L0, 2.18), (HW - 0.45, L0, 2.18), (HW - 0.45, L1, 2.18), (-HW + 0.45, L1, 2.18)][::-1])
    for y in [L0 + 1.0 + k * 1.6 for k in range(8)]: ac['lamp'].box((0, y, 2.17), (0.5, 0.9, 0.015))   # 天花板的燈罩（白天沒開）
    # 座椅：2＋2，每排 0.86 m；座墊、椅背（往後倒 14°）、白色頭枕套、扶手、椅背後面的塑膠殼、腳踏
    rows = [L0 + 1.2 + k * 0.86 for k in range(12)]
    for y in rows:
        for s in (-1, 1):
            for k in (0, 1):
                xc = s * (0.5 + k * 0.46)   # 走道 0.5 m、一個位子 0.46 m：靠窗那個的外緣 1.19（之前 1.38，穿出牆外）
                ac['seat'].box((xc, y, 0.47), (0.42, 0.48, 0.12), bevel=0.03)
                tilt = math.radians(14); bz = 0.52 + 0.36; by = y - 0.26 - math.sin(tilt) * 0.36
                ac['seat'].box((xc, by, bz), (0.42, 0.12, 0.74), rx=-tilt, bevel=0.04)
                ac['plast'].box((xc, by - 0.07 + math.sin(tilt) * 0.16, bz - 0.2), (0.38, 0.03, 0.34), rx=-tilt, bevel=0.01)   # 椅背後面下半的塑膠殼（雜誌袋）；上半是布
                hz = bz + 0.4; hy = by - math.sin(tilt) * 0.4
                ac['cover'].box((xc, hy + 0.005, hz - 0.07), (0.39, 0.125, 0.17), rx=-tilt, bevel=0.035)   # 白色頭枕套（蓋住椅背上緣前後）
                ac['stripe'].box((xc, hy + 0.005, hz - 0.13), (0.394, 0.137, 0.012), rx=-tilt)
                ac['plast'].box((xc, y - 0.05, 0.22), (0.36, 0.06, 0.4))                                   # 椅腳
            ac['plast'].box((s * 0.27, y - 0.05, 0.62), (0.05, 0.42, 0.05), bevel=0.01)                    # 走道那一側的扶手
            ac['plast'].box((s * 0.27, y + 0.12, 0.42), (0.04, 0.04, 0.4))
    # 前面：駕駛座後面的隔板（下半實心、上半玻璃）、天花板吊的電視、擋風玻璃
    ac['wall'].box((-0.6, L1 - 0.95, 0.55), (1.2, 0.06, 1.1)); ac['trim'].box((-0.6, L1 - 0.95, 1.12), (1.22, 0.08, 0.05))
    ac['dark'].box((0.0, L1 - 1.2, 1.98), (0.62, 0.08, 0.38)); ac['dark'].box((0.0, L1 - 1.2, 2.13), (0.06, 0.06, 0.1))
    tv = Acc('tv_screen', mat('tv', '#1a2230', rough=0.15, emit='#4a6688', estr=0.6)); tv.box((0.0, L1 - 1.24, 1.98), (0.56, 0.005, 0.32)); tv.done()
    ac['dark'].box((0.0, L1 - 0.2, 0.3), (2.4, 0.4, 0.6)); ac['dark'].box((-0.65, L1 - 0.55, 0.75), (0.5, 0.4, 0.3))          # 儀表板、方向盤座
    ac['dark'].cyl((-0.65, L1 - 0.55, 0.95), (-0.55, L1 - 0.45, 1.05), 0.22, seg=24, r2=0.22)
    ac['dark'].box((-HW + 0.06, L1 - 0.1, 1.3), (0.12, 0.2, 1.5)); ac['dark'].box((HW - 0.06, L1 - 0.1, 1.3), (0.12, 0.2, 1.5)); ac['dark'].box((0, L1 - 0.1, 2.12), (2.4, 0.2, 0.16))   # 擋風玻璃的框（玻璃不放，同上）
    for k, a in ac.items(): a.done(smooth=(k in ('seat', 'cover', 'curt')))
    # ---- 外面：國道（往南、靠右行駛：我們在右邊三線；左邊是中央分隔島、對向車道、遠山；右邊是路肩、護欄、稻田、農舍、檳榔樹、電線桿）----
    ZR = -1.35; BX = 0.0                         # 車子在中間車道（車道寬 3.6）；路面 u 0＝分隔島那一側
    hw = Acc('highway', img_mat('hw', tex_highway(), rough=0.8))
    for side, xs in ((1, (-5.7, 8.3)), (-1, (-19.9, -5.7 - 1.2))):
        x0, x1 = xs
        if side == 1: hw.quad([(x0, -400, ZR), (x1, -400, ZR), (x1, 2400, ZR), (x0, 2400, ZR)], uv=[(0, 0), (1, 0), (1, 2800 / 18), (0, 2800 / 18)])
        else: hw.quad([(x1, -400, ZR), (x0, -400, ZR), (x0, 2400, ZR), (x1, 2400, ZR)], uv=[(0, 0), (1, 0), (1, 2800 / 18), (0, 2800 / 18)])
    hw.done()
    con = Acc('barrier', noise_mat('concrete', '#a9a59c', '#bdb9ae', scale=20, bump=0.1))
    con.quad([(-6.1, -400, ZR), (-6.1, 2400, ZR), (-6.05, 2400, ZR + 0.85), (-6.05, -400, ZR + 0.85)]).quad([(-6.35, 2400, ZR), (-6.35, -400, ZR), (-6.4, -400, ZR + 0.85), (-6.4, 2400, ZR + 0.85)])
    con.quad([(-6.05, -400, ZR + 0.85), (-6.05, 2400, ZR + 0.85), (-6.4, 2400, ZR + 0.85), (-6.4, -400, ZR + 0.85)]); con.done()
    rail = Acc('guardrail', mat('rail', '#c8ccd0', rough=0.35, metal=0.6)); post = Acc('rail_posts', mat('rail_post', '#9aa0a6', rough=0.4, metal=0.5))
    rail.box((8.9, 1000, ZR + 0.62), (0.08, 2800, 0.32))
    for k in range(-40, 900): post.box((9.0, k * 2.5, ZR + 0.38), (0.1, 0.1, 0.76))
    rail.done(); post.done()
    grass = Acc('shoulder_grass', noise_mat('grass', '#6a8a3e', '#8aa252', scale=1.5, bump=0.2))
    grass.quad([(8.3, -400, ZR - 0.01), (40, -400, ZR - 0.6), (40, 2400, ZR - 0.6), (8.3, 2400, ZR - 0.01)]).quad([(-200, -400, ZR - 0.6), (-20, -400, ZR - 0.01), (-20, 2400, ZR - 0.01), (-200, 2400, ZR - 0.6)]); grass.done()
    pad = Acc('paddies', img_mat('paddy', tex_paddy(), rough=0.9))
    pad.quad([(40, -400, ZR - 0.6), (2600, -400, ZR - 0.6), (2600, 3000, ZR - 0.6), (40, 3000, ZR - 0.6)], uv=[(0, 0), (2560 / 60, 0), (2560 / 60, 3400 / 60), (0, 3400 / 60)])
    pad.quad([(-2600, -400, ZR - 0.6), (-200, -400, ZR - 0.6), (-200, 3000, ZR - 0.6), (-2600, 3000, ZR - 0.6)], uv=[(0, 0), (2400 / 60, 0), (2400 / 60, 3400 / 60), (0, 3400 / 60)]); pad.done()
    # 農舍（白色、灰色的透天、鐵皮屋頂）、檳榔樹（細長的樹幹＋上面一叢）、電線桿＋電線、竹叢
    HOUSE = Acc('farmhouses', noise_mat('house_wall', '#d8d4ca', '#c4beb0', scale=0.6, bump=0.05)); ROOF = Acc('roofs', mat('tin_roof', '#7a8a96', rough=0.5, metal=0.3))
    ROOF2 = Acc('roofs_red', mat('tin_roof_red', '#9a4a3a', rough=0.6)); WIN = Acc('house_windows', mat('house_win', '#3a4448', rough=0.2))
    TRUNK = Acc('palm_trunks', mat('trunk', '#8a8270', rough=0.9)); CROWN = Acc('palm_crowns', noise_mat('palm', '#3e6a2e', '#5a8a3a', scale=3, bump=0.4))
    BAMB = Acc('bamboo', noise_mat('bamboo', '#4a7a36', '#6a9a46', scale=0.8, bump=0.5)); POLE = Acc('poles', mat('pole', '#8a8680', rough=0.8))
    r = random.Random(77)
    for side in (1, -1):
        for k in range(70):
            y = r.uniform(10, 1600); x = side * (r.uniform(22, 90) if (side > 0 and k < 22) else r.uniform(60 if side > 0 else 80, 900))   # 右邊（窗外）前 22 個在 22～90 m：近一點的農舍、檳榔樹
            if r.random() < 0.55:
                w_, d_, h_ = r.uniform(7, 12), r.uniform(8, 14), r.choice([3.4, 6.8, 6.8, 10.2])
                HOUSE.box((x, y, ZR - 0.6 + h_ / 2), (w_, d_, h_), rz=r.uniform(-0.1, 0.1))
                (ROOF if r.random() < 0.6 else ROOF2).box((x, y, ZR - 0.6 + h_ + 0.25), (w_ + 0.6, d_ + 0.6, 0.5), rz=r.uniform(-0.1, 0.1))
                for f in range(int(h_ / 3.4)): WIN.box((x - side * (w_ / 2 + 0.02), y, ZR - 0.6 + 1.6 + f * 3.4), (0.05, d_ * 0.6, 1.2))
            for _ in range(r.randint(2, 6)):                                                              # 檳榔樹（一排一排）
                tx_, ty_ = x + r.uniform(-12, 12), y + r.uniform(-12, 12); th = r.uniform(8, 13)
                lean = r.uniform(-0.3, 0.3); palm(TRUNK, CROWN, tx_, ty_, ZR - 0.6, th, lean, r)
            if r.random() < 0.35:                                                                            # 竹叢：幾個大小不一、高高低低的團（不是一顆球）
                bx_, by_ = x + r.uniform(-15, 15), y + r.uniform(-15, 15)
                for _ in range(5): BAMB.ell((bx_ + r.uniform(-3, 3), by_ + r.uniform(-3, 3), ZR - 0.6 + r.uniform(2.5, 6)), r.uniform(1.5, 3), r.uniform(1.5, 3), r.uniform(2.5, 4.5), seg=9, rings=6)
    for k in range(-2, 40):                                                                                   # 右邊田裡一排電線桿（＋三條線）
        y = k * 45.0; POLE.cyl((46, y, ZR - 0.6), (46, y, ZR + 9.5), 0.14, seg=8, r2=0.1); POLE.box((46, y, ZR + 9.0), (1.6, 0.12, 0.12))
    wire = Acc('wires', mat('wire', '#2a2a2a', rough=0.6))
    for dx in (-0.7, 0.0, 0.7):
        for k in range(-2, 39):
            y0, y1 = k * 45.0, (k + 1) * 45.0
            for t in range(6):
                a0, a1 = t / 6, (t + 1) / 6; s0 = 0.6 * math.sin(math.pi * a0); s1 = 0.6 * math.sin(math.pi * a1)
                wire.cyl((46 + dx, y0 + 45 * a0, ZR + 9.05 - s0), (46 + dx, y0 + 45 * a1, ZR + 9.05 - s1), 0.012, seg=3)
    for a in (HOUSE, ROOF, ROOF2, WIN, TRUNK, CROWN, BAMB, POLE, wire): a.done(smooth=a in (CROWN, BAMB))
    # 前面的車（遠一點的貨櫃車、一台小客車）
    TRK = Acc('trucks', mat('truck', '#d8d6d0', rough=0.5)); TRK.box((BX + 3.6, 70, ZR + 2.0), (2.5, 12, 3.4)); TRK.box((BX + 3.6, 77, ZR + 1.5), (2.4, 2.4, 2.4))
    TRK.box((BX, 160, ZR + 0.75), (1.8, 4.4, 1.3)); TRK.done()
    WH = Acc('wheels', mat('tire', '#1a1a1a', rough=0.8))
    for (wx, wy) in ((BX + 2.5, 66), (BX + 4.7, 66), (BX + 2.5, 74), (BX + 4.7, 74)): WH.cyl((wx - 0.15, wy, ZR + 0.5), (wx + 0.15, wy, ZR + 0.5), 0.5, seg=14)
    WH.done()
    ridge('far_mtn', 3200, 520, 260, '#9fb0c2', 3, x0=-500, x1=4000, side=-1, z0=-30)                         # 左邊（東）的中央山脈：遠、淡
    ridge('mid_mtn', 1900, 140, 110, '#7f9a94', 9, x0=-200, x1=3200, side=-1, z0=-30)
    world_day(68, 160, strength=0.16, sun_energy=2.4)   # 外面調暗、裡面補光：不然窗外整片過曝（照片是這樣，但插畫要看得到田）
    for y in (-4.0, -0.5, 3.0):
        lt = bpy.data.lights.new('fill_%d' % int(y * 10), 'AREA'); lt.energy = 60; lt.size = 1.8; lt.color = (1.0, 0.97, 0.92)
        o = bpy.data.objects.new('fill_%d' % int(y * 10), lt); sc.collection.objects.link(o); o.location = (0, y, 2.1)
    clouds(16, 1500, 3000, 300, 700, 12)
    # 鏡頭＝祐廷坐在右邊（西側）靠窗的位子（第 6 排）往前、往窗外看：「你把手機蓋在腿上。窗外是一片一片的田。」
    # （第一版在走道上往前看：座椅擋住窗的下半，窗外只看得到天空）
    if opt('--cam', 'seat') == 'aisle': camera((0.05, -3.4, 1.22), (0.1, 6.0, 1.02), float(opt('--lens', '19')))
    else: camera((0.92, 0.14, 1.18), (2.4, 1.7, 0.86), float(opt('--lens', '22')))   # 第 7 排靠窗（座位 y 0.22）：往右前方 55°，左邊是前一排的椅背、窗框和綁起來的窗簾，右邊整片窗


# ================================================================ station：高雄客運站出口（白天 12:10）
def tex_sign(path, lines, W=1024, H=256, bg=(30, 70, 120), fg=(250, 250, 248), sizes=None, sub=None):
    im = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(im); sizes = sizes or [int(H * 0.5)]
    y = (H - sum(sizes) - 10 * (len(sizes) - 1)) / 2
    for t, s in zip(lines, sizes):
        f = ImageFont.truetype(FONT, s); tw = d.textlength(t, font=f); d.text(((W - tw) / 2, y), t, font=f, fill=fg); y += s + 10
    im.save(path); return path


def tex_tiles(path, c1=(196, 186, 172), c2=(170, 156, 140), n=8, W=512):
    """人行道的地磚（兩種顏色交錯、縫）"""
    im = Image.new('RGB', (W, W), c1); d = ImageDraw.Draw(im); s = W // n; r = random.Random(9)
    for i in range(n):
        for j in range(n):
            c = c1 if (i + j) % 2 else c2; c = tuple(max(0, min(255, v + r.randint(-6, 6))) for v in c); d.rectangle([i * s + 2, j * s + 2, (i + 1) * s - 2, (j + 1) * s - 2], fill=c)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(path); return path


def scooters(ac_body, ac_dark, ac_seat, xs, y0, ry=0.0, r=None):
    """一排機車（車身塑膠殼、座墊、輪子、把手）：簡化的速克達，從側面、斜面看是機車的輪廓"""
    r = r or random.Random(4); cols = ['#e8e6e0', '#c8302b', '#2a2c30', '#7a8a96', '#e0c040', '#3a5a8a', '#f2f0ea']
    for x in xs:
        c = r.choice(cols); m = Acc('sc_%d' % int(x * 10), mat('sc_%d' % int(x * 10), c, rough=0.35))
        yy = y0 + r.uniform(-0.1, 0.1)
        m.box((x, yy, 0.55), (0.32, 1.25, 0.42), bevel=0.08); m.box((x, yy + 0.62, 0.85), (0.3, 0.22, 0.75), bevel=0.06); m.box((x, yy - 0.3, 0.72), (0.34, 0.6, 0.18), bevel=0.06)
        m.done(smooth=True)
        ac_seat.box((x, yy - 0.18, 0.86), (0.28, 0.75, 0.08), bevel=0.03)
        for wy in (yy + 0.55, yy - 0.5): ac_dark.cyl((x - 0.06, wy, 0.25), (x + 0.06, wy, 0.25), 0.25, seg=14)
        ac_dark.cyl((x - 0.32, yy + 0.7, 1.15), (x + 0.32, yy + 0.7, 1.15), 0.018, seg=6)
        if r.random() < 0.5: ac_dark.ell((x, yy - 0.05, 0.98), 0.14, 0.16, 0.12, seg=10, rings=6)                  # 掛在座墊上的安全帽


def scene_station():
    TILE = img_mat('tiles', tex_tiles(os.path.join(TMP, 'tiles.png')), rough=0.75)
    ASPH = noise_mat('asphalt', '#5e5e5c', '#6c6c69', scale=12, bump=0.05)
    WALLW = noise_mat('station_wall', '#e4e0d6', '#d6d0c2', scale=2, bump=0.05); GRAYP = mat('panel_gray', '#9aa0a6', rough=0.5, metal=0.3)
    STEEL = mat('steel_white', '#eef0f0', rough=0.35, metal=0.2); GLASS = mat('door_glass', '#bcd4dc', rough=0.03, trans=0.9, ior=1.1)
    DARK = mat('dark', '#2a2c30', rough=0.5); CONC = noise_mat('curb', '#b8b4aa', '#a8a49a', scale=8, bump=0.1)
    # 地面：人行道（地磚，y −2～9）、路緣、車道（柏油）
    gnd = Acc('sidewalk', TILE); gnd.quad([(-30, -6, 0), (30, -6, 0), (30, 9, 0), (-30, 9, 0)], uv=[(0, 0), (60 / 4, 0), (60 / 4, 15 / 4), (0, 15 / 4)]); gnd.done()
    cb = Acc('curb', CONC); cb.box((0, -6.1, -0.05), (60, 0.25, 0.2)); cb.done()
    road = Acc('road', ASPH); road.quad([(-60, -40, -0.15), (60, -40, -0.15), (60, -6.2, -0.15), (-60, -6.2, -0.15)]); road.done()
    # 客運站建築：正面在 y 9（朝 −y），兩層（7.5 m）；中間偏左的出口（玻璃自動門 4 m 寬）；上面大雨遮（白色鋼構、往外 5 m）
    st = Acc('station', WALLW); st.box((-4, 12, 4.0), (30, 6, 8.0))
    gl = Acc('station_glass', GLASS); dk = Acc('station_dark', DARK); stl = Acc('steel', STEEL); gp = Acc('panels', GRAYP)
    for (x0, x1) in ((-13, -5.0), (-1.0, 6.0), (7.5, 10.5)): gl.quad([(x0, 8.98, 0.3), (x1, 8.98, 0.3), (x1, 8.98, 3.2), (x0, 8.98, 3.2)])   # 一樓的玻璃牆
    for x in [-13 + k * 1.5 for k in range(17)]: dk.box((x, 8.95, 1.75), (0.08, 0.08, 2.9))
    gl.quad([(-5.0, 8.9, 0.0), (-1.0, 8.9, 0.0), (-1.0, 8.9, 2.6), (-5.0, 8.9, 2.6)])                          # 出口的自動門（開著一半）
    dk.box((-3.0, 8.85, 2.75), (4.3, 0.3, 0.3)); dk.box((-3.0, 8.86, 1.3), (0.06, 0.06, 2.6))
    inside = Acc('station_inside', mat('inside', '#d8d2c0', rough=0.9, emit='#f2ead8', estr=0.6)); inside.quad([(-13, 11.5, 0), (10.5, 11.5, 0), (10.5, 11.5, 3.2), (-13, 11.5, 3.2)])
    for x in (-10, -6.5, 3.5, 7): inside.box((x, 10.6, 0.5), (1.6, 0.5, 1.0))                                    # 裡面的候車椅（模糊的影子）
    inside.done()
    for k in range(9): gp.box((-13 + k * 3.4, 8.95, 5.6), (3.2, 0.1, 2.6))                                       # 二樓的灰色鋁板
    stl.box((-3.0, 6.4, 3.6), (14.0, 5.6, 0.25)); stl.box((-3.0, 3.65, 3.45), (14.2, 0.12, 0.5))                 # 雨遮（平的、前緣一條白色封邊）
    for x in (-9.6, 3.6): stl.cyl((x, 3.9, 0), (x, 3.9, 3.5), 0.14, seg=14)
    lgt = Acc('canopy_lights', mat('canopy_light', '#ffffff', emit='#fffaf0', estr=3.0))
    for x in (-8, -5, -2, 1): lgt.box((x, 6.0, 3.46), (1.2, 0.2, 0.02))
    lgt.done()
    sg1 = Acc('sign_exit', img_mat('sign_exit', tex_sign(os.path.join(TMP, 'exit.png'), ['出口  EXIT'], bg=(28, 100, 64)), rough=0.4, emit=0.4))
    sg1.quad([(-4.6, 3.58, 3.0), (-1.4, 3.58, 3.0), (-1.4, 3.58, 3.4), (-4.6, 3.58, 3.4)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)]); sg1.done()
    sg2 = Acc('sign_station', img_mat('sign_station', tex_sign(os.path.join(TMP, 'station.png'), ['客 運 站', 'BUS STATION'], W=1024, H=300, bg=(244, 244, 240), fg=(30, 70, 120), sizes=[150, 60]), rough=0.4, emit=0.15))
    sg2.quad([(-9, 8.88, 6.0), (1, 8.88, 6.0), (1, 8.88, 8.0), (-9, 8.88, 8.0)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)]); sg2.done()
    # 右邊：客運月台（雨棚下兩台客運，車頭朝鏡頭這邊斜斜的）
    stl.box((17, 10, 4.2), (14, 12, 0.25))
    for (x, y) in ((11, 5), (23, 5), (11, 15), (23, 15)): stl.cyl((x, y, 0), (x, y, 4.2), 0.16, seg=12)
    BUSB = mat('bus_body', '#f2f2ee', rough=0.3); BUSS = mat('bus_stripe', '#1f4f9a', rough=0.35); BW = mat('bus_window', '#2a3640', rough=0.08, metal=0.3)
    for (x, y, rz) in ((14.5, 9.5, 0.12), (19.5, 10.5, 0.12)):
        b = Acc('bus_%d' % int(x), BUSB); b.box((x, y, 1.85), (2.5, 12, 3.3), rz=rz, bevel=0.15); b.done(smooth=True)
        s_ = Acc('bus_stripe_%d' % int(x), BUSS); s_.box((x, y, 1.05), (2.52, 12.02, 0.4), rz=rz); s_.done()
        w_ = Acc('bus_win_%d' % int(x), BW); w_.box((x, y, 2.45), (2.53, 11.0, 1.2), rz=rz); w_.box((x - math.sin(rz) * 6.02, y - math.cos(rz) * 6.02, 2.3), (2.2, 0.04, 1.6), rz=rz); w_.done()
        wh = Acc('bus_wheels_%d' % int(x), mat('tire%d' % int(x), '#1a1a1a', rough=0.8))
        for dy in (-3.8, 3.6):
            cxw, cyw = x + math.sin(rz) * dy, y + math.cos(rz) * dy
            for sx in (-1.27, 1.27): wh.cyl((cxw + sx - 0.12, cyw, 0.5), (cxw + sx + 0.12, cyw, 0.5), 0.5, seg=16)
        wh.done()
    # 左邊：整排機車（機車停車格）、路邊的大王椰子、行道樹、垃圾桶、長椅、計程車招呼站
    acb, acs = Acc('sc_dark', mat('sc_dark', '#1e1f22', rough=0.6)), Acc('sc_seat', mat('sc_seat', '#26272a', rough=0.7))
    scooters(None, acb, acs, [-24 + k * 0.85 for k in range(12)], 6.0, r=random.Random(6)); scooters(None, acb, acs, [-24 + k * 0.85 for k in range(10)], 2.4, r=random.Random(8))
    acb.done(); acs.done()
    pl = Acc('scooter_lines', mat('paint_white', '#efefea', rough=0.6))
    for k in range(13): pl.box((-24.4 + k * 0.85, 6.0, 0.003), (0.05, 2.0, 0.006))
    pl.done()
    TR = Acc('palm_trunk', noise_mat('royal_trunk', '#b8b2a4', '#cfc9bc', scale=6, bump=0.2)); CR = Acc('palm_fronds', noise_mat('frond', '#3e6e2e', '#5e9040', scale=4, bump=0.5))
    for x in (-15.5, -7.5, 5.5, 26):
        y = -4.8; h = 11.5; TR.cyl((x, y, 0), (x, y, h), 0.32, seg=14, r2=0.26); TR.cyl((x, y, h), (x, y, h + 1.6), 0.24, seg=12, r2=0.22)
        for k in range(10):
            a = k * 0.63 + 0.2; L_ = 3.6; ex, ey = x + math.cos(a) * L_, y + math.sin(a) * L_
            for t in range(6):
                t0, t1 = t / 6, (t + 1) / 6; z0 = h + 1.6 + 0.6 * math.sin(math.pi * t0 * 0.8) - 1.6 * t0 ** 2; z1 = h + 1.6 + 0.6 * math.sin(math.pi * t1 * 0.8) - 1.6 * t1 ** 2
                CR.cyl((x + (ex - x) * t0, y + (ey - y) * t0, z0), (x + (ex - x) * t1, y + (ey - y) * t1, z1), 0.22 * (1 - t0 * 0.7), seg=5, r2=0.22 * (1 - t1 * 0.7))
    TR.done(); CR.done(smooth=True)
    pots = Acc('planters', noise_mat('planter', '#9a958a', '#aaa598', scale=8)); shr = Acc('shrubs', noise_mat('shrub', '#3a6a2e', '#5a8a3e', scale=5, bump=0.5))
    for x in (-12.5, -6.2, 0.6, 4.6):
        pots.box((x, 8.0, 0.3), (1.4, 0.7, 0.6)); shr.ell((x, 8.0, 0.85), 0.7, 0.32, 0.4, seg=10, rings=6)
    pots.done(); shr.done(smooth=True)
    misc = Acc('misc', DARK); misc.box((-11.2, 7.5, 0.45), (1.6, 0.45, 0.06)); misc.box((-11.2, 7.72, 0.7), (1.6, 0.05, 0.5)); misc.box((-11.8, 7.5, 0.22), (0.06, 0.4, 0.44)); misc.box((-10.6, 7.5, 0.22), (0.06, 0.4, 0.44))
    misc.cyl((2.3, 7.8, 0), (2.3, 7.8, 0.9), 0.25, seg=14); misc.done()
    vm = Acc('vending', mat('vending', '#c8302b', rough=0.4)); vm.box((7.9, 8.5, 0.95), (0.9, 0.7, 1.9)); vm.done()
    vmf = Acc('vending_front', mat('vending_front', '#e8eef2', emit='#ffffff', estr=0.8)); vmf.box((7.9, 8.14, 1.15), (0.7, 0.02, 1.1)); vmf.done()
    taxi = Acc('taxi', mat('taxi', '#f2c81e', rough=0.3)); taxi.box((-1.5, -9.2, 0.65), (1.8, 4.6, 0.9), bevel=0.2); taxi.box((-1.4, -9.0, 1.3), (1.6, 2.4, 0.6), bevel=0.2); taxi.done(smooth=True)
    tw = Acc('taxi_wheels', mat('tire2', '#1a1a1a', rough=0.8))
    for (x, y) in ((-2.4, -10.6), (-0.6, -10.6), (-2.4, -7.8), (-0.6, -7.8)): tw.cyl((x - 0.1, y, 0.18), (x + 0.1, y, 0.18), 0.33, seg=14)
    tw.done()
    for a in (gl, dk, stl, gp, st): a.done()
    # 對街的樓（鏡頭背後不畫；左右兩邊遠一點的透天、招牌）
    bld = Acc('far_buildings', noise_mat('far_bld', '#cfc6b6', '#b8ae9c', scale=0.3)); fw = Acc('far_windows', mat('far_win', '#4a5660', rough=0.2))
    for k in range(10):
        x = -40 + k * 5.2; h = random.Random(k).choice([12, 15, 18, 21]); bld.box((x - 20, 20, h / 2), (5.0, 8, h))
        for f in range(int(h / 3)): fw.box((x - 20, 15.95, 1.6 + f * 3), (3.6, 0.1, 1.2))
    bld.done(); fw.done()
    world_day(78, 200, strength=0.35, sun_energy=5.0)
    clouds(12, 800, 1600, 200, 500, 5, side_ok=lambda x, y: y > 100)
    camera((-1.5, -4.8, 1.55), (-1.0, 8.0, 2.4), float(opt('--lens', '22')))


# ================================================================ store：客運站外面的便利商店前（晚上 20:00）
def tex_store_sign(path):
    """虛構的「日日便利 DAILY MART」（和機場同一家虛構連鎖）：白底、綠橘兩條色帶、店名"""
    W, H = 2048, 256; im = Image.new('RGB', (W, H), (250, 250, 246)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 34], fill=(26, 140, 80)); d.rectangle([0, 34, W, 58], fill=(240, 140, 40)); d.rectangle([0, H - 20, W, H], fill=(26, 140, 80))
    f1 = ImageFont.truetype(FONT, 120); f2 = ImageFont.truetype(FONT, 54)
    d.ellipse([300, 80, 440, 220], fill=(240, 140, 40)); d.ellipse([330, 110, 410, 190], fill=(250, 250, 246))   # 太陽的標誌（虛構）
    d.text((480, 70), '日日便利', font=f1, fill=(26, 120, 70)); d.text((1020, 120), 'DAILY MART', font=f2, fill=(240, 120, 30))
    d.text((1500, 120), '24H', font=f2, fill=(26, 120, 70))
    im.save(path); return path


def tex_store_inside(path):
    """店裡（從外面隔著玻璃看）：白光、一排一排貨架（色塊）、冷藏櫃的光、櫃台；沒有字"""
    W, H = 2048, 512; im = Image.new('RGB', (W, H), (236, 238, 232)); d = ImageDraw.Draw(im); r = random.Random(2)
    d.rectangle([0, 0, W, 60], fill=(250, 250, 250))
    for k in range(0, W, 16): d.line([k, 0, k, 60], fill=(232, 234, 230))
    for x0 in range(40, W, 330):                                                                   # 貨架（側面看是一層一層的色塊）
        for lvl in range(5):
            y = 160 + lvl * 60
            for x in range(x0, x0 + 260, 14): d.rectangle([x, y, x + 11, y + 44], fill=r.choice([(200, 60, 50), (240, 200, 60), (60, 120, 190), (250, 250, 245), (60, 160, 90), (240, 140, 50), (120, 60, 140)]))
            d.rectangle([x0 - 4, y + 46, x0 + 264, y + 50], fill=(200, 202, 198))
    d.rectangle([0, 440, W, H], fill=(214, 214, 208))
    d.rectangle([1580, 120, 2040, 420], fill=(220, 236, 244))                                       # 右邊的冷藏櫃（亮）
    for x in range(1590, 2040, 75): d.rectangle([x, 130, x + 68, 410], outline=(160, 170, 176), width=3)
    im.filter(ImageFilter.GaussianBlur(2.0)).save(path); return path


def scene_store():
    TILE = img_mat('tiles_n', tex_tiles(os.path.join(TMP, 'tiles_n.png'), (150, 140, 128), (130, 120, 108)), rough=0.6)
    ASPH = noise_mat('asphalt_n', '#3c3c3c', '#464646', scale=12, bump=0.05, rough=0.55)
    WALLW = noise_mat('bld_wall', '#d6cfc0', '#c6bead', scale=2, bump=0.05); DARK = mat('dark', '#202226', rough=0.5); CONC = noise_mat('curb_n', '#8a8780', '#7a7770', scale=8)
    gnd = Acc('sidewalk', TILE); gnd.quad([(-30, -4, 0), (30, -4, 0), (30, 6, 0), (-30, 6, 0)], uv=[(0, 0), (15, 0), (15, 2.5), (0, 2.5)]); gnd.done()
    cb = Acc('curb', CONC); cb.box((0, -4.1, -0.05), (60, 0.25, 0.2)); cb.done()
    road = Acc('road', ASPH); road.quad([(-60, -40, -0.15), (60, -40, -0.15), (60, -4.2, -0.15), (-60, -4.2, -0.15)]); road.done()
    # 便利商店（騎樓下的一間，正面在 y 6，寬 9 m）：整面玻璃、亮的室內、招牌帶、自動門；兩旁是別的店（鐵捲門拉下、一間亮著的飲料店）
    bld = Acc('building', WALLW); bld.box((0, 9.5, 7.0), (40, 7, 14))
    sg = Acc('store_sign', img_mat('store_sign', tex_store_sign(os.path.join(TMP, 'store_sign.png')), rough=0.4, emit=2.2))
    sg.quad([(-4.5, 5.94, 2.75), (4.5, 5.94, 2.75), (4.5, 5.94, 3.35), (-4.5, 5.94, 3.35)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)]); sg.done()
    ins = Acc('store_inside', img_mat('store_inside', tex_store_inside(os.path.join(TMP, 'store_inside.png')), rough=0.9, emit=1.6))
    ins.quad([(-4.4, 8.6, 0.0), (4.4, 8.6, 0.0), (4.4, 8.6, 2.7), (-4.4, 8.6, 2.7)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)]); ins.done()
    side = Acc('store_side', mat('store_side_wall', '#f0f0ec', emit='#f4f6f2', estr=0.8))
    side.quad([(-4.4, 6.0, 0), (-4.4, 8.6, 0), (-4.4, 8.6, 2.7), (-4.4, 6.0, 2.7)]).quad([(4.4, 8.6, 0), (4.4, 6.0, 0), (4.4, 6.0, 2.7), (4.4, 8.6, 2.7)])
    side.quad([(-4.4, 6.0, 2.7), (4.4, 6.0, 2.7), (4.4, 8.6, 2.7), (-4.4, 8.6, 2.7)][::-1]); side.done()
    fl = Acc('store_floor', mat('store_floor', '#e4e4de', rough=0.3)); fl.quad([(-4.4, 6.0, 0.005), (4.4, 6.0, 0.005), (4.4, 8.6, 0.005), (-4.4, 8.6, 0.005)]); fl.done()
    gl = Acc('store_glass', mat('store_glass', '#dfeaee', rough=0.02, trans=0.95, ior=1.1)); gl.quad([(-4.4, 6.0, 0.0), (4.4, 6.0, 0.0), (4.4, 6.0, 2.7), (-4.4, 6.0, 2.7)]); gl.done()
    mul = Acc('mullions', mat('mullion', '#d8dad8', rough=0.3, metal=0.5))
    for x in (-4.4, -2.2, 0.0, 1.6, 2.6, 4.4): mul.box((x, 5.98, 1.35), (0.07, 0.07, 2.7))
    mul.box((0, 5.98, 2.68), (8.9, 0.08, 0.08)); mul.box((0, 5.98, 0.05), (8.9, 0.08, 0.1)); mul.done()
    post = Acc('posters', mat('poster', '#f4d050', rough=0.5, emit='#fff0a0', estr=0.4))
    post.box((-3.3, 5.96, 1.6), (0.7, 0.01, 0.95)); post.box((3.5, 5.96, 1.6), (0.7, 0.01, 0.95)); post.done()
    # 騎樓：柱子、騎樓天花板＋燈；左右兩間店
    arc = Acc('arcade', WALLW)
    for x in (-13.5, -4.7, 4.7, 13.5): arc.box((x, 0.6, 1.75), (0.6, 0.6, 3.5))
    arc.box((0, 3.3, 3.65), (40, 6.0, 0.3)); arc.done()
    al = Acc('arcade_lights', mat('arcade_light', '#ffffff', emit='#fff6e4', estr=4.0))
    for x in (-9, -2.4, 2.4, 9): al.box((x, 3.2, 3.49), (0.9, 0.18, 0.02))
    al.done()
    shut = Acc('shutters', noise_mat('shutter', '#8a8e92', '#9a9ea2', scale=60, bump=0.2)); shut.box((-9.3, 6.0, 1.55), (8.0, 0.1, 3.1)); shut.done()
    drk = Acc('tea_shop', mat('tea_shop', '#f2e2c0', emit='#ffd890', estr=1.2)); drk.box((9.3, 6.05, 1.3), (8.0, 0.1, 2.6)); drk.done()
    teasg = Acc('tea_sign', mat('tea_sign', '#7a3a2a', emit='#c0603a', estr=0.8)); teasg.box((9.3, 5.95, 3.0), (7.6, 0.1, 0.5)); teasg.done()
    # 門口：兩張戶外小桌椅、垃圾桶、機車一排、路燈、行道樹
    tb = Acc('tables', mat('table_white', '#e8e8e4', rough=0.4))
    for x in (-2.8, 2.9):
        tb.cyl((x, 4.3, 0.72), (x, 4.3, 0.75), 0.36, seg=20); tb.cyl((x, 4.3, 0), (x, 4.3, 0.72), 0.03, seg=8)
        for dx in (-0.55, 0.55): tb.cyl((x + dx, 4.3, 0.44), (x + dx, 4.3, 0.47), 0.18, seg=14); tb.cyl((x + dx, 4.3, 0), (x + dx, 4.3, 0.44), 0.02, seg=6)
    tb.done()
    bin_ = Acc('bins', mat('bin', '#2a6a4a', rough=0.5)); bin_.box((5.4, 5.3, 0.45), (0.5, 0.5, 0.9)); bin_.box((6.0, 5.3, 0.45), (0.5, 0.5, 0.9)); bin_.done()
    acb, acs = Acc('sc_dark', mat('sc_dark', '#141416', rough=0.6)), Acc('sc_seat', mat('sc_seat', '#1c1c1e', rough=0.7))
    scooters(None, acb, acs, [-16 + k * 0.85 for k in range(9)], -2.8, r=random.Random(12)); scooters(None, acb, acs, [8.5 + k * 0.85 for k in range(8)], -2.8, r=random.Random(13))
    acb.done(); acs.done()
    lamp = Acc('street_lamp', mat('lamp_pole', '#4a4e52', rough=0.4, metal=0.5))
    for x in (-11, 12): lamp.cyl((x, -3.7, 0), (x, -3.7, 7.5), 0.1, seg=10, r2=0.07); lamp.box((x, -2.9, 7.4), (0.12, 1.6, 0.12)); lamp.box((x, -2.2, 7.32), (0.35, 0.6, 0.12))
    lamp.done()
    lh = Acc('lamp_heads', mat('lamp_head', '#ffe8b0', emit='#ffd890', estr=25.0))
    for x in (-11, 12): lh.box((x, -2.2, 7.25), (0.3, 0.5, 0.02))
    lh.done()
    for x in (-11, 12):
        lt = bpy.data.lights.new('street_%d' % x, 'SPOT'); lt.energy = 900; lt.spot_size = math.radians(110); lt.spot_blend = 0.6; lt.color = (1.0, 0.82, 0.55)
        o = bpy.data.objects.new('street_%d' % x, lt); sc.collection.objects.link(o); o.location = (x, -2.2, 7.1); o.rotation_euler = (0, 0, 0)
    lt = bpy.data.lights.new('store_spill', 'AREA'); lt.energy = 900; lt.size = 8.0; lt.size_y = 2.6; lt.shape = 'RECTANGLE'; lt.color = (0.92, 0.97, 1.0)
    o = bpy.data.objects.new('store_spill', lt); sc.collection.objects.link(o); o.location = (0, 6.3, 1.4); o.rotation_euler = (math.radians(-90), 0, 0)
    lt = bpy.data.lights.new('arcade_fill', 'AREA'); lt.energy = 260; lt.size = 18.0; lt.size_y = 4.0; lt.shape = 'RECTANGLE'; lt.color = (1.0, 0.92, 0.8)
    o = bpy.data.objects.new('arcade_fill', lt); sc.collection.objects.link(o); o.location = (0, 3.0, 3.45)
    # 對街（鏡頭背後不畫）；左後方遠處客運站亮著的招牌（藍底白字「客運站」）＋停著的客運
    far = Acc('far_station', mat('far_station', '#3a4048', rough=0.8)); far.box((-26, 16, 4.5), (14, 8, 9)); far.done()
    fsg = Acc('far_station_sign', img_mat('far_station_sign', tex_sign(os.path.join(TMP, 'station_n.png'), ['客 運 站', 'BUS STATION'], W=1024, H=300, bg=(30, 70, 140), fg=(250, 250, 248), sizes=[150, 60]), rough=0.4, emit=3.0))
    fsg.quad([(-31, 11.9, 6.0), (-21, 11.9, 6.0), (-21, 11.9, 8.0), (-31, 11.9, 8.0)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)]); fsg.done()
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.012, 0.016, 0.03, 1); bg.inputs['Strength'].default_value = 1.0
    lt = bpy.data.lights.new('sky_fill', 'SUN'); lt.energy = 0.06; lt.color = (0.6, 0.7, 1.0); o = bpy.data.objects.new('sky_fill', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(40), 0, math.radians(20))
    camera((-0.6, -6.6, 1.55), (0.2, 6.0, 1.75), float(opt('--lens', '24')))


{'bus': scene_bus, 'station': scene_station, 'store': scene_store}[VAR]()
sc.render.filepath = os.path.abspath(OUT); bpy.ops.render.render(write_still=True); print('saved', OUT)
