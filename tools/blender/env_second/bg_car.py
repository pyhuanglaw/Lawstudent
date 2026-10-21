"""BG-08 車上（ev_kexin_trip_spring_y1 春假開車旅行；AA_147：祐廷開車、從駕駛座看出去：方向盤、儀表板、擋風玻璃外的路）。
LAWWW2-B 2026-10-16（BB-B 04:25 讓出）。Blender 5.2（bpy，無介面）＋Cycles（CPU），1920×1080，畫面上沒有人（人物用 ADV 立繪疊上去）。
三版：morning（早上，東海岸的濱海公路，太陽在海那一側）、night（晚上，車頭燈照著路、儀表板亮）、rain（雨天，擋風玻璃上的雨滴、雨刷、濕的路面）。
  /opt/blenv/bin/python tools/blender/env_second/bg_car.py -- <morning|night|rain> <輸出.png> [--res 1920x1080] [--samples 48]
- 台灣是左駕：方向盤在左邊，車開在右側車道，左邊是雙黃線、對向車道和山壁，右邊是護欄和海。
- 車子沒有品牌：方向盤中間是素面的、儀表板只有指針和刻度。
- 座標＝Blender 原生（x 往右、y 往前、z 往上）；駕駛的眼睛在 (−0.37, −0.05, 1.17)，路面 z 0。"""
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
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '48'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_car_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
NIGHT, RAIN = VAR == 'night', VAR == 'rain'
rng = random.Random(8)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'
sc.view_settings.exposure = float(opt('--exposure', '0.6' if NIGHT else ('0.3' if RAIN else '0.0')))
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 32; sc.cycles.transmission_bounces = 8


# ---------------- 材質 ----------------
def mat(name, col, rough=0.5, metal=0.0, emit=None, estr=1.0, trans=0.0, ior=1.45, coat=0.0, alpha=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    c = col if isinstance(col, tuple) else tuple(B.srgb(col)) + (1.0,)
    b.inputs['Base Color'].default_value = c if len(c) == 4 else (*c, 1.0); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if trans: b.inputs['Transmission Weight'].default_value = trans; b.inputs['IOR'].default_value = ior
    if coat: b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = (*B.srgb(emit), 1.0); b.inputs['Emission Strength'].default_value = estr
    if alpha is not None: b.inputs['Alpha'].default_value = alpha
    return m


def noise_mat(name, c1, c2, scale=8.0, rough=0.9, bump=0.3, detail=6.0):
    """兩個顏色用 Noise 混（山坡、樹叢、海浪）：純色看起來像積木"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; b = N['Principled BSDF']
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = detail
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (*B.srgb(c1), 1); ramp.color_ramp.elements[1].color = (*B.srgb(c2), 1)
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[1].position = 0.65
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if bump:
        bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def img_mat(name, path, rough=0.6, emit=0.0, repeat=True, bump=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.extension = 'REPEAT' if repeat else 'EXTEND'
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    if bump:
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; nt.links.new(tx.outputs['Color'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def obj(name, bm, m, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def box(name, m, c, size, rot=(0, 0, 0), bevel=0.0, smooth=False):
    bm = L.rbox_bm(size[0], size[2], size[1], bevel, 2) if bevel else None
    if bm is None:
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    else:   # rbox_bm 的軸：(w, h, d) → Blender (x, z, y)；轉回 Blender 的 x、y、z
        for v in bm.verts: v.co = Vector((v.co.x, v.co.y, v.co.z))
    M_ = Matrix.Translation(Vector(c)) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[0], 4, 'X')
    bmesh.ops.transform(bm, matrix=M_, verts=bm.verts); return obj(name, bm, m, smooth)


def quad(name, m, pts, uv=None):
    bm = bmesh.new(); f = bm.faces.new([bm.verts.new(Vector(p)) for p in pts])
    if uv:
        ul = bm.loops.layers.uv.new('UVMap')
        for lp, t in zip(f.loops, uv): lp[ul].uv = t
    return obj(name, bm, m)


def extrude_profile(name, m, prof, x0, x1, smooth=True):
    """(y, z) 的閉合斷面沿 x 拉出來（儀表板、車頂）"""
    bm = bmesh.new(); a = [bm.verts.new((x0, y, z)) for (y, z) in prof]; b = [bm.verts.new((x1, y, z)) for (y, z) in prof]; n = len(prof)
    for i in range(n): j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.faces.new(list(reversed(a))); bm.faces.new(b); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj(name, bm, m, smooth)


# ---------------- 貼圖（程式畫）----------------
def tex_cluster():
    W, H = 1024, 340; im = Image.new('RGB', (W, H), (8, 9, 12)); d = ImageDraw.Draw(im); f = lambda s: ImageFont.truetype(FONT, s)
    glow = (120, 200, 255) if NIGHT else (210, 220, 230)
    for cx, val, mx_, lab in ((250, 68, 180, 'km/h'), (774, 2.1, 8, 'x1000rpm')):
        r = 140
        for k in range(0, 41):
            a = math.radians(225 - 270 * k / 40); r0 = r - (18 if k % 5 == 0 else 9)
            d.line([cx + r0 * math.cos(a), 170 - r0 * math.sin(a), cx + r * math.cos(a), 170 - r * math.sin(a)], fill=glow, width=3 if k % 5 == 0 else 1)
        a = math.radians(225 - 270 * val / mx_); d.line([cx, 170, cx + (r - 22) * math.cos(a), 170 - (r - 22) * math.sin(a)], fill=(255, 90, 60), width=6)
        d.ellipse([cx - 14, 156, cx + 14, 184], fill=(40, 40, 46)); d.text((cx - 30, 215), lab, font=f(22), fill=glow)
    d.text((440, 120), '68', font=f(80), fill=(240, 244, 250)); d.text((470, 210), 'km/h', font=f(24), fill=glow)
    p = os.path.join(TMP, 'cluster.png'); im.save(p); return p


def tex_road():
    """濱海公路（雙線道）：u 0～1＝路面寬（左邊對向車道、雙黃線、右邊我們這一線、白色邊線）；v 每 1＝12 m（虛線一段）"""
    W, H = 512, 1024; rs = np.random.default_rng(3)
    a = np.zeros((H, W, 3), np.float32) + (np.array([70, 70, 72], np.float32) if (RAIN or NIGHT) else np.array([118, 118, 116], np.float32))
    a += rs.normal(0, 7, (H, W, 1)); a += np.repeat(np.repeat(rs.normal(0, 6, (H // 8, W // 8, 1)), 8, 0), 8, 1)
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    lw = 9; WL = (236, 236, 228); YL = (232, 180, 40)
    for u in (0.03, 0.97): d.rectangle([u * W - lw / 2, 0, u * W + lw / 2, H], fill=WL)          # 兩側白色邊線
    for u in (0.485, 0.515): d.rectangle([u * W - lw / 2, 0, u * W + lw / 2, H], fill=YL)       # 中間雙黃線
    im = im.filter(ImageFilter.GaussianBlur(0.6)); p = os.path.join(TMP, 'road.png'); im.save(p); return p


# ---------------- 車內 ----------------
EYE = Vector((-0.37, -0.05, 1.13))
DASH = mat('dash', '#26282c', rough=0.65); DASH2 = mat('dash_trim', '#3b3e44', rough=0.4, metal=0.2)
LINER = mat('roof_liner', '#b9b6ae', rough=0.95); PILLAR = mat('pillar', '#2e3034', rough=0.8)
SEAT = mat('seat', '#2b2d31', rough=0.85); LEATHER = mat('wheel', '#1d1e21', rough=0.45); CHROME = mat('chrome', '#b8bcc0', rough=0.18, metal=0.9)
def thin_glass(name, refl=0.07, tint=(0.92, 0.96, 0.95)):
    """薄玻璃：透明＋一點反光（單面的折射玻璃在 Cycles 裡光線進去就出不來，擋風玻璃斜得很，看出去全是天空）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    for n in list(N):
        if n.type != 'OUTPUT_MATERIAL': N.remove(n)
    tr = N.new('ShaderNodeBsdfTransparent'); tr.inputs['Color'].default_value = (*tint, 1)
    gl = N.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.03
    fr = N.new('ShaderNodeLayerWeight'); fr.inputs['Blend'].default_value = 0.25
    mx = N.new('ShaderNodeMixShader'); mth = N.new('ShaderNodeMath'); mth.operation = 'MULTIPLY_ADD'; mth.inputs[1].default_value = 0.6; mth.inputs[2].default_value = refl
    nt.links.new(fr.outputs['Fresnel'], mth.inputs[0]); nt.links.new(mth.outputs[0], mx.inputs['Fac'])
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(gl.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], N['Material Output'].inputs['Surface'])
    return m


GLASS = thin_glass('glass')
PAINT = mat('paint', '#e9ebec' if not RAIN else '#e2e5e7', rough=0.25, coat=1.0)
CLUSTER = img_mat('cluster', tex_cluster(), rough=0.3, emit=(3.0 if NIGHT else 0.9), repeat=False)
SCREEN = mat('screen', '#0c1016', rough=0.15, emit='#24384e', estr=(0.45 if NIGHT else 0.3))

extrude_profile('dashboard', DASH, [(0.30, 0.66), (0.33, 0.80), (0.48, 0.89), (0.72, 0.945), (1.00, 0.955), (1.06, 0.935), (1.02, 0.66)], -0.80, 0.80)
extrude_profile('cluster_hood', DASH, [(0.48, 0.985), (0.49, 1.0), (0.58, 1.012), (0.69, 0.965), (0.67, 0.952), (0.58, 0.992), (0.50, 0.978)], -0.60, -0.14)   # 儀表上方的遮光罩（薄的，儀表在下面看得到）
extrude_profile('dash_trim', DASH2, [(0.335, 0.80), (0.345, 0.835), (0.47, 0.885), (0.465, 0.86)], -0.78, 0.78)
quad('cluster_screen', CLUSTER, [(-0.57, 0.60, 0.865), (-0.17, 0.60, 0.865), (-0.17, 0.625, 0.975), (-0.57, 0.625, 0.975)], uv=[(0, 0), (1, 0), (1, 1), (0, 1)])
box('cluster_back', DASH, (-0.37, 0.65, 0.92), (0.46, 0.06, 0.14))
box('center_screen', SCREEN, (0.08, 0.50, 0.90), (0.32, 0.02, 0.17), rot=(math.radians(-15), 0, 0), bevel=0.008)
for x in (-0.70, 0.02, 0.18, 0.66):                                                                   # 出風口
    box(f'vent_{x}', mat(f'vent_{x}', '#111214', rough=0.7), (x, 0.36, 0.78), (0.12, 0.03, 0.05), bevel=0.01)
# 方向盤：輪圈（旋轉體的圓管）、三根輻條、素面的中間（沒有品牌）、轉向柱
wc = Vector((-0.37, 0.36, 0.84)); tilt = Matrix.Rotation(math.radians(62), 4, 'X')   # 輪圈的上緣比下緣前面（面向駕駛的胸口）
bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=48, radius1=0.19, radius2=0.19, depth=0.001)
bm.free()
bm = bmesh.new(); R_, r_ = 0.185, 0.016; nu, nv = 64, 12; rings = []
for i in range(nu):
    th = 2 * math.pi * i / nu; ring = []
    for j in range(nv):
        ph = 2 * math.pi * j / nv; rr = R_ + r_ * math.cos(ph); ring.append(bm.verts.new((rr * math.cos(th), rr * math.sin(th), r_ * 1.25 * math.sin(ph))))
    rings.append(ring)
for i in range(nu):
    for j in range(nv): bm.faces.new((rings[i][j], rings[(i + 1) % nu][j], rings[(i + 1) % nu][(j + 1) % nv], rings[i][(j + 1) % nv]))
for ang in (0, 180, 270):                                                                            # 輻條（左、右、下）
    a = math.radians(ang); bx = bmesh.ops.create_cube(bm, size=1.0)['verts']
    for v in bx: v.co = Vector((v.co.x * 0.15, v.co.y * 0.04, v.co.z * 0.018))
    bmesh.ops.translate(bm, verts=bx, vec=(0.09, 0, 0)); bmesh.ops.rotate(bm, verts=bx, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, 'Z'))
hub = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=0.07, radius2=0.06, depth=0.04)['verts']
bmesh.ops.transform(bm, matrix=Matrix.Translation(wc) @ tilt, verts=bm.verts)
obj('steering_wheel', bm, LEATHER, smooth=True)
col = bmesh.new(); bmesh.ops.create_cone(col, cap_ends=True, segments=16, radius1=0.045, radius2=0.06, depth=0.32)
bmesh.ops.transform(col, matrix=Matrix.Translation(wc + Vector((0, 0.15, -0.08))) @ tilt, verts=col.verts); obj('column', col, DASH, smooth=True)
# 擋風玻璃、A 柱、車頂、遮陽板、後照鏡、左邊車門與車窗
WS = [(-0.76, 1.05, 0.95), (0.76, 1.05, 0.95), (0.70, 0.38, 1.44), (-0.70, 0.38, 1.44)]
quad('windshield', GLASS, WS)
for s in (-1, 1):
    a, b = Vector((s * 0.80, 1.07, 0.93)), Vector((s * 0.73, 0.36, 1.46)); d = b - a
    bm = bmesh.new(); res = bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * 0.075, v.co.y * d.length, v.co.z * 0.06))
    rot = Vector((0, 1, 0)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((a + b) / 2) @ rot, verts=bm.verts); obj(f'a_pillar_{s}', bm, PILLAR, smooth=False)
quad('roof_liner', LINER, [(-0.78, 0.38, 1.45), (0.78, 0.38, 1.45), (0.78, -0.9, 1.47), (-0.78, -0.9, 1.47)])
box('visor', LINER, (-0.38, 0.30, 1.405), (0.36, 0.17, 0.025), rot=(math.radians(12), 0, 0), bevel=0.012)
box('mirror', mat('mirror_body', '#1e1f22', rough=0.5), (0.02, 0.44, 1.33), (0.25, 0.035, 0.075), rot=(0, 0, math.radians(-8)), bevel=0.02)
box('mirror_glass', CHROME, (0.02, 0.421, 1.33), (0.23, 0.004, 0.06), rot=(0, 0, math.radians(-8)))
box('mirror_stem', DASH, (0.02, 0.43, 1.40), (0.025, 0.025, 0.09))
box('door_panel', DASH, (-0.82, 0.10, 0.70), (0.08, 1.30, 0.50), bevel=0.02)
box('door_top', DASH, (-0.80, 0.10, 0.96), (0.10, 1.30, 0.04), bevel=0.01)
quad('side_glass', thin_glass('side_glass', refl=0.02, tint=(0.78, 0.84, 0.82)), [(-0.79, 0.95, 0.98), (-0.79, -0.6, 0.98), (-0.75, -0.6, 1.40), (-0.76, 0.40, 1.42)])   # 側窗：隔熱紙的深一點、反光少（斜看時整片發白）
box('b_pillar', PILLAR, (-0.78, -0.62, 1.2), (0.06, 0.10, 0.5))
box('seat_side', SEAT, (0.40, -0.25, 0.75), (0.50, 0.35, 0.45), bevel=0.06)                          # 副駕駛座的椅墊前緣（右下角看得到一點）
# 引擎蓋（車外）：中間微微隆起、往前往下
bm = bmesh.new(); nx, ny = 16, 10; vs = []
for j in range(ny + 1):
    y = 1.08 + j * 1.6 / ny; row = []
    for i in range(nx + 1):
        x = -0.86 + i * 1.72 / nx; z = 0.93 - 0.11 * (j / ny) ** 1.3 + 0.03 * (1 - (x / 0.86) ** 2) - 0.05 * (abs(x) / 0.86) ** 4
        row.append(bm.verts.new((x, y, z)))
    vs.append(row)
for j in range(ny):
    for i in range(nx): bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
obj('hood', bm, PAINT, smooth=True)

# ---------------- 車外：濱海公路（往左彎）、護欄、海、山壁、遠山 ----------------
def cx(y):                                                           # 路的中心線（車子的車道中心在 x 0；雙黃線在 x −1.9）
    return -0.0016 * max(0.0, y - 60.0) ** 2
ROADW = 7.6; LANE0 = -1.9 - ROADW / 2
road_m = img_mat('road', tex_road(), rough=(0.12 if RAIN else 0.85), bump=0.15)
bm = bmesh.new(); ul = bm.loops.layers.uv.new('UVMap'); prev = None
for k in range(0, 121):
    y = k * 3.0; c = cx(y); row = [bm.verts.new((c + LANE0, y, 0.0)), bm.verts.new((c + LANE0 + ROADW, y, 0.0))]
    if prev:
        f = bm.faces.new((prev[0], prev[1], row[1], row[0]))
        for lp, t in zip(f.loops, ((0, (k - 1) * 0.25), (1, (k - 1) * 0.25), (1, k * 0.25), (0, k * 0.25))): lp[ul].uv = t
    prev = row
obj('road', bm, road_m)
STEEL = mat('guardrail', '#c4c8cb', rough=0.35, metal=0.6)
bm = bmesh.new()
for k in range(0, 90):                                               # 右邊的護欄：每 4 m 一根柱子＋兩條橫板
    y = k * 4.0; c = cx(y); x = c + LANE0 + ROADW + 0.6
    bx = bmesh.ops.create_cube(bm, size=1.0)['verts']
    for v in bx: v.co = Vector((x + v.co.x * 0.12, y + v.co.y * 0.12, 0.38 + v.co.z * 0.76))
    if k:
        y0 = (k - 1) * 4.0; x0 = cx(y0) + LANE0 + ROADW + 0.6
        for zz in (0.55, 0.72):
            a, b = bm.verts.new((x0 - 0.07, y0, zz - 0.07)), bm.verts.new((x - 0.07, y, zz - 0.07)); c2, d2 = bm.verts.new((x - 0.07, y, zz + 0.07)), bm.verts.new((x0 - 0.07, y0, zz + 0.07))
            bm.faces.new((a, b, c2, d2))
obj('guardrail', bm, STEEL)
SEA = noise_mat('sea', '#164a68' if not RAIN else '#344c57', '#1f5d7e' if not RAIN else '#3d5560', scale=60.0, rough=(0.12 if not RAIN else 0.25), bump=0.08, detail=3.0)
quad('sea', SEA, [(5, -50, -18), (3000, -50, -18), (3000, 3000, -18), (5, 3000, -18)])
cl = bmesh.new()                                                     # 路右邊往下的邊坡（到海）
for k in range(0, 60):
    y0, y1 = k * 6.0, (k + 1) * 6.0
    a, b = cl.verts.new((cx(y0) + LANE0 + ROADW + 0.8, y0, 0.0)), cl.verts.new((cx(y1) + LANE0 + ROADW + 0.8, y1, 0.0))
    c2, d2 = cl.verts.new((cx(y1) + LANE0 + ROADW + 14, y1, -18.5)), cl.verts.new((cx(y0) + LANE0 + ROADW + 14, y0, -18.5))
    cl.faces.new((a, b, c2, d2))
GREEN = noise_mat('slope', '#34502e' if not RAIN else '#33453a', '#4d6e3c' if not RAIN else '#3f5642', scale=1.5)
obj('sea_slope', cl, GREEN)
# 左邊的山壁：起伏的斜面（numpy 雜訊）＋零散的樹叢（橢球）
hm = bmesh.new(); nr, nh = 70, 8; g = []
rs = np.random.default_rng(5); noise = rs.normal(0, 1, (nr + 1, nh + 1))
for k in range(nr + 1):
    y = k * 5.0; row = []
    for j in range(nh + 1):
        t = j / nh; x = cx(y) + LANE0 - 0.8 - t * 30.0; z = t ** 0.8 * (22.0 + 6 * math.sin(y * 0.03)) + noise[k, j] * 0.8 * t
        row.append(hm.verts.new((x, y, z)))
    g.append(row)
for k in range(nr):
    for j in range(nh): hm.faces.new((g[k][j], g[k][j + 1], g[k + 1][j + 1], g[k + 1][j]))
HILL = noise_mat('hill', '#3a5c32' if not RAIN else '#36503a', '#5a7d44' if not RAIN else '#46604a', scale=0.6, bump=0.5)
obj('hillside', hm, HILL, smooth=True)
tm = bmesh.new()
for i in range(700):                                                  # 樹叢：小顆、壓扁、互相疊在一起（v1 是一顆顆大球，像玩具）
    y = rng.uniform(5, 340); t = rng.uniform(0.22, 0.95) ** 0.8; x = cx(y) + LANE0 - 1.4 - t * 30.0; z = t ** 0.8 * (22.0 + 6 * math.sin(y * 0.03))   # 離路 6 m 以內不放（近的樹叢在畫面上太大，像石頭）
    s = rng.uniform(0.7, 1.9) * (1.0 + 0.6 * t); r_ = bmesh.ops.create_icosphere(tm, subdivisions=2, radius=1.0)['verts']
    sq = rng.uniform(0.55, 0.8)
    for v in r_: v.co = Vector((x + v.co.x * s * 1.3 + rng.uniform(-0.15, 0.15) * s, y + v.co.y * s * 1.3, z + s * 0.35 + v.co.z * s * sq))
for i in range(500):                                                  # 路邊山坡下段：矮灌木、草叢（小顆、很扁）
    y = rng.uniform(3, 200); t = rng.uniform(0.02, 0.3); x = cx(y) + LANE0 - 1.0 - t * 30.0; z = t ** 0.8 * (22.0 + 6 * math.sin(y * 0.03))
    s = rng.uniform(0.35, 0.8); r_ = bmesh.ops.create_icosphere(tm, subdivisions=2, radius=1.0)['verts']
    for v in r_: v.co = Vector((x + v.co.x * s * 1.6, y + v.co.y * s * 1.6, z + s * 0.1 + v.co.z * s * 0.45))
TREE = noise_mat('trees', '#24421f' if not RAIN else '#28402c', '#4a6e34' if not RAIN else '#3d5a40', scale=0.9, bump=0.8)
obj('hill_trees', tm, TREE, smooth=True)
def ridge(name, dist, h0, amp, col, seed, x0=-1400, x1=1400, n=260):
    """遠山的稜線：平滑的起伏（幾個正弦波疊加），越遠越淡（v1 是鋸齒三角形）"""
    rr = random.Random(seed); ph = [rr.uniform(0, 6.28) for _ in range(4)]
    bm_ = bmesh.new(); pts = []
    for i in range(n + 1):
        x = x0 + i * (x1 - x0) / n; u = x / 300.0
        z = h0 + amp * (0.55 * math.sin(u * 1.3 + ph[0]) + 0.3 * math.sin(u * 2.9 + ph[1]) + 0.15 * math.sin(u * 6.1 + ph[2]) + 0.06 * math.sin(u * 13.0 + ph[3]))
        e = min(1.0, (x - x0) / 180.0, (x1 - x) / 180.0) ** 0.7; z = -18 + (z + 18) * e   # 兩端降下去（不要切開的斷面）
        pts.append((bm_.verts.new((x, dist - 0.2 * abs(x), -18)), bm_.verts.new((x, dist - 0.2 * abs(x), max(z, -18)))))
    for i in range(n): bm_.faces.new((pts[i][0], pts[i + 1][0], pts[i + 1][1], pts[i][1]))
    return obj(name, bm_, mat(name, col, rough=1.0))


ridge('far_mountains', 1500, 90, 70, '#8ea2b6' if not NIGHT else '#0c111b', 3)
ridge('mid_mountains', 900, 45, 45, '#6c8a8a' if not NIGHT else '#0a0f16', 7, x0=-1200, x1=-40)   # 左前方、近一點的山（綠一點）
hd = bmesh.new(); nh_, nd_ = 60, 8; gg = []                          # 右前方伸進海裡的岬角：山稜往海那頭慢慢降下去（v1 的壓扁球像飛碟）
for i in range(nh_ + 1):
    t = i / nh_; x = 60 + t * 650; top = -18 + 100 * math.sin(math.pi * min(1.0, t * 1.6)) ** 0.7 * (1 - t) ** 0.6 * (0.88 + 0.12 * math.sin(t * 17))   # 兩頭都降到海面（v1 左端是切開的斷面，像隧道口）
    row = []
    for j in range(nd_ + 1):
        k = j / nd_; yv = 560 + k * 420; zz = -18 + (max(top, -16) + 18) * math.sin(math.pi * k) ** 0.6
        row.append(hd.verts.new((x, yv, zz)))
    gg.append(row)
for i in range(nh_):
    for j in range(nd_): hd.faces.new((gg[i][j], gg[i + 1][j], gg[i + 1][j + 1], gg[i][j + 1]))
obj('headland', hd, noise_mat('headland', '#557263' if not NIGHT else '#0b1210', '#6f8c7a' if not NIGHT else '#0e1612', scale=0.03, bump=0.3), smooth=True)

# ---------------- 光線、天空、版本差異 ----------------
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
if NIGHT:
    bg.inputs['Color'].default_value = (0.004, 0.006, 0.014, 1); bg.inputs['Strength'].default_value = 1.0
    for s in (-1, 1):                                                # 車頭燈
        lt = bpy.data.lights.new(f'head_{s}', 'SPOT'); lt.energy = 2500; lt.spot_size = math.radians(48); lt.spot_blend = 0.5; lt.color = (1.0, 0.95, 0.85)
        o = bpy.data.objects.new(f'head_{s}', lt); sc.collection.objects.link(o); o.location = (s * 0.62, 2.75, 0.72); o.rotation_euler = (math.radians(84), 0, math.radians(-s * 2))
    EM = mat('reflector', '#ffffff', emit='#fff4d8', estr=6.0)          # 路邊的反光標（貓眼）
    bm = bmesh.new()
    for k in range(4, 100):
        y = k * 6.0; c = cx(y)
        for x in (c + LANE0 + 0.15, c + LANE0 + ROADW - 0.15):
            bx = bmesh.ops.create_cube(bm, size=1.0)['verts']
            for v in bx: v.co = Vector((x + v.co.x * 0.12, y + v.co.y * 0.12, 0.02 + v.co.z * 0.03))
    obj('reflectors', bm, EM)
    TOWN = mat('town_lights', '#ffffff', emit='#ffcf8a', estr=12.0); bm = bmesh.new()   # 遠處海岸小鎮的燈
    for i in range(140):
        x = rng.uniform(80, 500); y = rng.uniform(500, 1100); z = rng.uniform(-17, -10)
        bx = bmesh.ops.create_cube(bm, size=1.0)['verts']
        for v in bx: v.co = Vector((x + v.co.x * 0.8, y + v.co.y * 0.8, z + v.co.z * 0.8))
    obj('town', bm, TOWN)
    lt = bpy.data.lights.new('moon', 'SUN'); lt.energy = 0.08; lt.color = (0.7, 0.8, 1.0); o = bpy.data.objects.new('moon', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(50), 0, math.radians(140))
    lt = bpy.data.lights.new('dash_glow', 'AREA'); lt.energy = 2.0; lt.size = 0.5; lt.color = (0.6, 0.8, 1.0); o = bpy.data.objects.new('dash_glow', lt); sc.collection.objects.link(o); o.location = (-0.37, 0.5, 0.95); o.rotation_euler = (math.radians(-80), 0, 0)
elif RAIN:
    bg.inputs['Color'].default_value = (0.42, 0.45, 0.48, 1); bg.inputs['Strength'].default_value = 1.1
    lt = bpy.data.lights.new('overcast', 'SUN'); lt.energy = 0.6; lt.angle = math.radians(60); o = bpy.data.objects.new('overcast', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(35), 0, math.radians(200))
    DROP = mat('raindrop', '#ffffff', rough=0.0, trans=1.0, ior=1.33)   # 擋風玻璃上的雨滴（貼在玻璃外面的半顆水珠）
    bm = bmesh.new(); a, b, c = Vector(WS[0]), Vector(WS[1]), Vector(WS[3]); nrm = (b - a).cross(c - a).normalized()
    if nrm.y < 0: nrm = -nrm
    for i in range(900):
        u, v = rng.random(), rng.random() ** 0.8
        p = a + (b - a) * u + (c - a) * v * (1 - 0.08 * abs(u - 0.5)); r = rng.uniform(0.002, 0.007) * (1.6 if rng.random() < 0.08 else 1.0)
        sv = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=4, radius=1.0)['verts']
        for q in sv: q.co = p + nrm * (0.002 + q.co.z * r * 0.35) + Vector((q.co.x * r, q.co.y * r * 0.4, 0)) + (c - a).normalized() * q.co.y * r
    obj('raindrops', bm, DROP, smooth=True)
    WIPER = mat('wiper', '#121314', rough=0.6)
    for (x0, ang) in ((-0.62, 18), (0.06, 24)):                       # 雨刷（停在玻璃下緣、斜斜的）
        p0 = a + (b - a) * ((x0 + 0.76) / 1.52) + (c - a) * 0.05; d = Matrix.Rotation(math.radians(ang), 3, nrm) @ (b - a).normalized()
        bmw = bmesh.new(); bx = bmesh.ops.create_cube(bmw, size=1.0)['verts']
        for q in bx: q.co = Vector((q.co.x * 0.55, q.co.y * 0.012, q.co.z * 0.02))
        rot = Vector((1, 0, 0)).rotation_difference(d).to_matrix().to_4x4()
        bmesh.ops.transform(bmw, matrix=Matrix.Translation(p0 + d * 0.28 + nrm * 0.015) @ rot, verts=bmw.verts); obj(f'wiper_{x0}', bmw, WIPER)
else:
    sky = nt.nodes.new('ShaderNodeTexSky')
    try: sky.sky_type = 'NISHITA'
    except Exception: pass
    try: sky.sun_elevation = math.radians(14); sky.sun_rotation = math.radians(60); sky.air_density = 1.2; sky.dust_density = 1.6
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.35
    lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 4.0; lt.angle = math.radians(1.5); lt.color = (1.0, 0.92, 0.80)
    o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(76), 0, math.radians(150))

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(opt('--lens', '20')); cam.data.clip_start = 0.05; cam.data.clip_end = 4000
cam.location = EYE; d = Vector((-0.20, 8.0, 0.30)) - EYE; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); bpy.ops.render.render(write_still=True); print('saved', OUT)
