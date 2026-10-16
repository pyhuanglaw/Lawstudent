"""2D 背景：新體育館旁的戶外籃球場，晚上（outings3d.js 的 S.BG.ntu_court_night；ART-BG-COURT，LAWWW-B 17:42 派工）。LAWWW2-B 2026-10-16。
劇情（AA_40 哲 2、AA_177）：大二上第 10 週週四（11/12）21:00，阿哲一個人在球場投籃；畫面上沒有人（人物用 ADV 立繪疊上去）。
畫面清單（BB-B 18:18，BB_132 第 55e 組）：前景深綠 PU 半場、後面還有場地、高桿燈白光、圍網外一排樹＋體育館大片玻璃牆、地上一顆球、籃網有點舊。
沒有字、沒有標誌（看板、飲料瓶、體育館外牆都不放字）。對話時人物站在畫面中間、下面四分之一被對話框蓋住：籃架放在左三分之一，中間只有球場和遠景。
尺寸照國際規則（FIBA）：球場 28×15 m、罰球線離底線 5.8 m、禁區寬 4.9 m、三分線 6.75 m（離邊線 0.9 m 的直線段）、籃框高 3.05 m、
籃板 1.8×1.05 m（下緣 2.9 m、板面離底線 1.2 m）、籃框中心離板面 0.151 m＋半徑 0.225 m、板上的小框 0.59×0.45 m。
  /opt/blenv/bin/python tools/blender/env_second/bg_court.py -- <輸出.png> [--res 1920x1080] [--samples 96] [--eye x,y,z --look x,y,z --lens mm]
座標＝遊戲座標（x 東、y 上、z 南）：球場 A 中心在原點、長邊沿 x；鏡頭在 A 場南邊線附近往西北看，西邊的籃架在畫面左邊。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter   # noqa: E402


def gaussian_filter(a, sigma):
    """高斯模糊（Blender 的 python 沒有 scipy）：FFT，邊界環繞；sigma 可以是 (sy, sx, 0) 給 RGB"""
    a = np.asarray(a, np.float32)
    if a.ndim == 3:
        sy = sigma[0] if isinstance(sigma, (tuple, list)) else sigma
        return np.stack([gaussian_filter(a[..., c], sy) for c in range(a.shape[2])], -1)
    if sigma <= 0: return a
    H, W = a.shape; fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.fftfreq(W)[None, :]
    k = np.exp(-2 * (math.pi ** 2) * (sigma ** 2) * (fx ** 2 + fy ** 2))
    return np.real(np.fft.ifft2(np.fft.fft2(a) * k)).astype(np.float32)

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_court_tex'); os.makedirs(TMP, exist_ok=True)
rng = random.Random(1112); nrng = np.random.default_rng(1112)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = opt('--look-name', 'AgX - Punchy')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 24
root = B.group('court')

# ---- 球場（FIBA）----
CL, CW = 28.0, 15.0                 # 長、寬
RX, RZ = 2.0, 2.0                   # 邊線外的緩衝區
COURTS = (0.0, -19.0)               # A（鏡頭這一面）、B（北邊）：中心 z
BASE_X = -CL / 2                    # 西邊底線
BOARD_X = BASE_X + 1.2              # 板面
RIM_X = BOARD_X + 0.151 + 0.225     # 籃框中心（離底線 1.576）


def img_mat(name, path, rough=0.7, alpha=False, emit=0.0, metal=0.0, nonc=False):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if alpha:
        nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, uv): lp[ul].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.parent = root; return ob


# ======================== 地面：PU 球場貼圖（深綠場內、紅褐色緩衝區、白線） ========================
PPM = 64
def court_tex(path, seed):
    """一面球場＋緩衝區（x −16..16、z −9.5..9.5）。圖的 col＝x、row＝z（上＝北）。
    PU 面：細顆粒、大範圍深淺、禁區和罰球線附近被踩得比較淡、幾道修補的接縫、一灘乾掉的水痕；白線有磨損"""
    r = np.random.default_rng(seed)
    W, H = int((CL + 2 * RX) * PPM), int((CW + 2 * RZ) * PPM)
    X0, Z0 = -CL / 2 - RX, -CW / 2 - RZ
    xs = X0 + (np.arange(W) + 0.5) / PPM; zs = Z0 + (np.arange(H) + 0.5) / PPM; xx, zz = np.meshgrid(xs, zs)
    inside = (np.abs(xx) <= CL / 2) & (np.abs(zz) <= CW / 2)
    green, red = np.array([44, 92, 70], np.float32), np.array([128, 58, 46], np.float32)
    rgb = np.where(inside[..., None], green, red)
    n = gaussian_filter(r.standard_normal((H, W)).astype(np.float32), 0.8) * 0.06 + gaussian_filter(r.standard_normal((H, W)).astype(np.float32), 2.5 * PPM) * 1.6
    rgb = rgb * (1 + n[..., None])
    for sx in (-1, 1):   # 兩邊籃下、罰球線附近被踩淡
        bx = sx * (CL / 2 - 1.575)
        wear = np.exp(-(((xx - bx) / 3.2) ** 2 + (zz / 2.4) ** 2)) * 0.18 + np.exp(-(((xx - sx * (CL / 2 - 5.8)) / 1.4) ** 2 + (zz / 1.6) ** 2)) * 0.1
        rgb = rgb * (1 + wear[..., None]) + wear[..., None] * 18
    blot = gaussian_filter(r.standard_normal((H, W)).astype(np.float32), 0.6 * PPM); blot = np.clip((blot / (blot.std() + 1e-6) - 1.2) * 0.6, 0, 1)
    rgb = rgb * (1 - 0.08 * blot[..., None])          # 一塊一塊比較舊、比較暗的 PU（不畫線條狀的補丁：遠看像畫上去的線）
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
    # 線（5 cm 白線）：畫在獨立的圖層，再乘上磨損
    ln = Image.new('L', (W, H), 0); d = ImageDraw.Draw(ln)
    P = lambda x, z: ((x - X0) * PPM, (z - Z0) * PPM); lw = max(2, int(0.05 * PPM))
    def rect(x0, z0, x1, z1): d.rectangle([P(x0, z0), P(x1, z1)], outline=255, width=lw)
    def arc(cx, cz, rad, a0, a1, dashed=False):
        pts = [P(cx + rad * math.cos(math.radians(a)), cz + rad * math.sin(math.radians(a))) for a in np.linspace(a0, a1, 180)]
        if dashed:
            for i in range(0, len(pts) - 1, 12): d.line(pts[i:i + 6], fill=255, width=lw)
        else: d.line(pts, fill=255, width=lw)
    rect(-CL / 2, -CW / 2, CL / 2, CW / 2)                                   # 邊線、底線
    d.line([P(0, -CW / 2), P(0, CW / 2)], fill=255, width=lw); arc(0, 0, 1.8, 0, 360)   # 中線、中圈
    for sx in (-1, 1):
        bx = sx * CL / 2; fx = bx - sx * 5.8; rimx = bx - sx * 1.575
        rect(min(bx, fx), -2.45, max(bx, fx), 2.45)                          # 禁區
        arc(fx, 0, 1.8, -90 if sx < 0 else 90, 90 if sx < 0 else 270)        # 罰球圈：朝中場那一半實線
        arc(fx, 0, 1.8, 90 if sx < 0 else -90, 270 if sx < 0 else 90, dashed=True)   # 禁區裡那一半虛線
        zc = CW / 2 - 0.9; ang = math.degrees(math.asin(zc / 6.75)); xs_ = rimx - sx * math.sqrt(6.75 ** 2 - zc ** 2)
        for s in (-1, 1): d.line([P(bx, s * zc), P(xs_, s * zc)], fill=255, width=lw)   # 三分線直線段
        if sx < 0: arc(rimx, 0, 6.75, -ang, ang)
        else: arc(rimx, 0, 6.75, 180 - ang, 180 + ang)
        arc(rimx, 0, 1.25, -90 if sx < 0 else 90, 90 if sx < 0 else 270)     # 無撞人半圓
        for k in (1.75, 2.6, 3.45):                                          # 禁區兩邊的站位小線
            for s in (-1, 1): d.line([P(bx - sx * k, s * 2.45), P(bx - sx * k, s * 2.6)], fill=255, width=lw)
    a = np.asarray(ln).astype(np.float32) / 255
    worn = np.clip(gaussian_filter(r.random((H, W)).astype(np.float32), 1.5) * 3 - 0.9, 0.35, 1.0)
    a = a * worn
    rgbf = np.asarray(im).astype(np.float32) * (1 - a[..., None] * 0.92) + np.array([232, 234, 228], np.float32) * (a[..., None] * 0.92)
    Image.fromarray(np.clip(rgbf, 0, 255).astype(np.uint8), 'RGB').save(path)
    return W, H


for ci, cz in enumerate(COURTS):
    pth = os.path.join(TMP, f'court_{ci}.png'); court_tex(pth, 70 + ci)
    mt = img_mat(f'court_pu_{ci}', pth, rough=0.75)
    x0, x1, z0, z1 = -CL / 2 - RX, CL / 2 + RX, cz - CW / 2 - RZ, cz + CW / 2 + RZ
    uvquad(f'court_{ci}', (x0, 0.0, z1), (x1, 0.0, z1), (x1, 0.0, z0), (x0, 0.0, z0), mat=mt)
# 球場外面：混凝土步道＋草地
M = {
    'conc': L.pbr('court_conc', 'concrete_floor_painted', tile=2.0, target='#7d7a73', normal=0.3, maps=('diff', 'nor')),
    'grass': L.pbr('court_grass', 'grass_ground', tile=3.0, target='#3c4a30', maps=('diff',)),
    'galv': L.flat('court_galv', '#8f9497', rough=0.42, metal=0.3), 'paint_dk': L.flat('court_pole_paint', '#2d3a46', rough=0.45, metal=0.2),
    'rim': L.flat('court_rim', '#c9552a', rough=0.4, metal=0.3), 'white': L.flat('court_white', '#e9e9e4', rough=0.5),
    'black': L.flat('court_black', '#1d1f21', rough=0.6), 'lamp_glow': L.flat('court_lamp', '#ffffff', rough=0.3, emit=B.srgb('#f4f7ff')),
    'bench': L.pbr('court_bench', 'walnut_veneer', tile=0.8, target='#6e5038', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
    'bottle': L.flat('court_bottle', '#cfe3ea', rough=0.1, alpha=0.45), 'cap': L.flat('court_cap', '#2f6fb0', rough=0.4),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('court_' + k, M[k])
    return _acc[k]
acc('conc').quad([(-22, -0.005, 14), (22, -0.005, 14), (22, -0.005, -34), (-22, -0.005, -34)])
acc('grass').quad([(-80, -0.02, 40), (80, -0.02, 40), (80, -0.02, -90), (-80, -0.02, -90)])

# ======================== 籃架（西邊兩個：A、B 場） ========================
def board_tex(path):
    """壓克力籃板：透明、白色外框 5 cm、板上 0.59×0.45 的小框（白）"""
    W, H = 720, 420; im = Image.new('RGBA', (W, H), (210, 225, 232, 70)); d = ImageDraw.Draw(im); s = W / 1.8
    d.rectangle([0, 0, W - 1, H - 1], outline=(240, 240, 236, 255), width=int(0.05 * s))
    bx0 = (1.8 - 0.59) / 2 * s; by1 = H - 0.15 * s; d.rectangle([bx0, by1 - 0.45 * s, bx0 + 0.59 * s, by1], outline=(240, 240, 236, 255), width=int(0.05 * s))
    im.save(path)
BTEX = os.path.join(TMP, 'board.png'); board_tex(BTEX)
M['board'] = img_mat('court_board', BTEX, rough=0.12, alpha=True)


def net_tex(path):
    """舊籃網：白色尼龍繩織成菱形網眼，有點泛黃、有一兩條斷掉"""
    W, H = 512, 256; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    n = 12
    for i in range(n * 2 + 1):
        x = i * W / (n * 2)
        d.line([(x, 0), (x + W / n * 1.0, H)], fill=(224, 220, 204, 255), width=4); d.line([(x, 0), (x - W / n * 1.0, H)], fill=(224, 220, 204, 255), width=4)
    d.line([(0, 2), (W, 2)], fill=(230, 226, 210, 255), width=6)
    d.rectangle([W * 0.7, H * 0.55, W * 0.76, H], fill=(0, 0, 0, 0))   # 斷掉的一條
    im.save(path)
NTEX = os.path.join(TMP, 'net.png'); net_tex(NTEX); M['net'] = img_mat('court_net', NTEX, rough=0.8, alpha=True)


def hoop(cz):
    """西邊的籃架：場外一支方形鋼柱（底線外 1.0 m）、斜撐的伸臂、籃板、籃框、舊籃網；柱腳一圈防撞墊（深藍）"""
    px = BASE_X - 1.0
    acc('paint_dk').box(px - 0.1, px + 0.1, 0.0, 3.55, cz - 0.1, cz + 0.1)                       # 主柱
    acc('paint_dk').box(px - 0.06, BOARD_X - 0.06, 3.32, 3.44, cz - 0.06, cz + 0.06)             # 上伸臂
    acc('paint_dk').cyl((px + 0.05, 2.25, cz), (BOARD_X - 0.06, 3.0, cz), 0.045, seg=10)         # 斜撐
    acc('paint_dk').box(BOARD_X - 0.08, BOARD_X - 0.03, 2.95, 3.85, cz - 0.4, cz + 0.4)          # 板後的框架
    acc('black').box(px - 0.16, px + 0.16, 0.0, 1.6, cz - 0.16, cz + 0.16)                       # 防撞墊
    acc('galv').box(px - 0.3, px + 0.3, 0.0, 0.02, cz - 0.3, cz + 0.3)                           # 底板
    uvquad(f'board_{cz}', (BOARD_X, 2.9, cz + 0.9), (BOARD_X, 2.9, cz - 0.9), (BOARD_X, 3.95, cz - 0.9), (BOARD_X, 3.95, cz + 0.9), mat=M['board'])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.235, minor_radius=0.01, major_segments=32, minor_segments=8, location=g2b(RIM_X, 3.05, cz))
    rim = bpy.context.active_object; rim.name = f'rim_{cz}'; rim.data.materials.append(M['rim']); rim.parent = root
    acc('rim').box(BOARD_X, RIM_X - 0.2, 3.03, 3.05, cz - 0.06, cz + 0.06)                      # 籃框接板的座
    # 網：上口 0.235、下口 0.14、長 0.42 的斜錐面（透明貼圖），微微被風吹歪
    bm = bmesh.new(); top, bot = [], []; seg = 16
    for i in range(seg + 1):
        a = i / seg * 2 * math.pi
        top.append(bm.verts.new(g2b(RIM_X + 0.235 * math.cos(a), 3.04, cz + 0.235 * math.sin(a))))
        bot.append(bm.verts.new(g2b(RIM_X + 0.14 * math.cos(a) + 0.03, 2.62, cz + 0.14 * math.sin(a))))
    ul = bm.loops.layers.uv.new()
    for i in range(seg):
        f = bm.faces.new((bot[i], bot[i + 1], top[i + 1], top[i]))
        for lp, t in zip(f.loops, ((i / seg, 0), ((i + 1) / seg, 0), ((i + 1) / seg, 1), (i / seg, 1))): lp[ul].uv = t
    me = bpy.data.meshes.new(f'net_{cz}'); bm.to_mesh(me); bm.free(); me.materials.append(M['net'])
    ob = bpy.data.objects.new(f'net_{cz}', me); sc.collection.objects.link(ob); ob.parent = root
for cz in COURTS: hoop(cz)
# 東邊的籃架（遠，畫面右邊外面；B 場的東邊在背景）
for cz in COURTS:
    px = -BASE_X + 1.0; bx = -BOARD_X
    acc('paint_dk').box(px - 0.1, px + 0.1, 0.0, 3.55, cz - 0.1, cz + 0.1); acc('paint_dk').box(bx + 0.06, px + 0.06, 3.32, 3.44, cz - 0.06, cz + 0.06)
    uvquad(f'board_e_{cz}', (bx, 2.9, cz - 0.9), (bx, 2.9, cz + 0.9), (bx, 3.95, cz + 0.9), (bx, 3.95, cz - 0.9), mat=M['board'])
    bpy.ops.mesh.primitive_torus_add(major_radius=0.235, minor_radius=0.01, major_segments=24, minor_segments=6, location=g2b(-RIM_X, 3.05, cz))
    r_ = bpy.context.active_object; r_.data.materials.append(M['rim']); r_.parent = root

# ======================== 高桿燈（每面場四角，10 m，兩顆 LED 燈頭） ========================
LIGHTS = []
for cz in COURTS:
    for sx in (-1, 1):
        for sz in (-1, 1):
            px, pz = sx * (CL / 2 + 1.2), cz + sz * (CW / 2 + 1.2)
            if cz != 0.0 and sz > 0: continue        # 兩面場中間共用一排燈
            acc('galv').cyl((px, 0.0, pz), (px, 10.0, pz), 0.11, seg=12, r2=0.07)
            acc('galv').box(px - 0.6, px + 0.6, 9.9, 10.0, pz - 0.05, pz + 0.05)
            for dx in (-0.4, 0.4):                      # 兩顆燈頭，朝場中間（偏向自己這一半場）
                hx = px + dx
                acc('black').box(hx - 0.22, hx + 0.22, 9.55, 9.9, pz - 0.12, pz + 0.12)
                acc('lamp_glow').box(hx - 0.18, hx + 0.18, 9.53, 9.56, pz - 0.1, pz + 0.1)
                LIGHTS.append(((hx, 9.5, pz), (px * 0.45, 0.0, cz + (0.0 if cz != 0.0 or sz < 0 else 0.0))))

# ======================== 圍網（4 m 高，菱形鐵絲網＋鍍鋅柱） ========================
def mesh_tex(path):
    W, H = 256, 256; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(-4, 5):
        o = k * 64
        d.line([(o, 0), (o + 256, 256)], fill=(150, 156, 158, 255), width=3); d.line([(o + 256, 0), (o, 256)], fill=(150, 156, 158, 255), width=3)
    im.save(path)
MTEX = os.path.join(TMP, 'fence.png'); mesh_tex(MTEX); M['fence'] = img_mat('court_fence', MTEX, rough=0.5, alpha=True, metal=0.3)
FX0, FX1, FZ0, FZ1, FH = -CL / 2 - RX - 0.3, CL / 2 + RX + 0.3, COURTS[1] - CW / 2 - RZ - 0.3, CW / 2 + RZ + 0.3, 4.0
def fence(p0, p1):
    (x0, z0), (x1, z1) = p0, p1; ln = math.hypot(x1 - x0, z1 - z0); rep = ln / 0.6
    uvquad('fence', (x0, 0.0, z0), (x1, 0.0, z1), (x1, FH, z1), (x0, FH, z0), mat=M['fence'], uv=((0, 0), (rep, 0), (rep, FH / 0.6), (0, FH / 0.6)))
    n = max(1, int(ln / 3.0))
    for i in range(n + 1):
        t = i / n; x, z = x0 + (x1 - x0) * t, z0 + (z1 - z0) * t; acc('galv').cyl((x, 0.0, z), (x, FH + 0.05, z), 0.035, seg=8)
    acc('galv').cyl((x0, FH, z0), (x1, FH, z1), 0.022, seg=6); acc('galv').cyl((x0, 0.08, z0), (x1, 0.08, z1), 0.018, seg=6)
fence((FX0, FZ1), (FX0, FZ0)); fence((FX0, FZ0), (FX1, FZ0)); fence((FX1, FZ0), (FX1, FZ1))
fence((FX0, FZ1), (-3.0, FZ1)); fence((3.0, FZ1), (FX1, FZ1))      # 南邊（鏡頭後面）中間留門

# 圍網邊的長椅＋一瓶沒有字的水、阿哲放的運動包不放（沒有人、不搶眼）
bx, bz = FX0 + 0.5, 4.5
acc('bench').box(bx - 0.2, bx + 0.2, 0.42, 0.46, bz - 0.9, bz + 0.9); acc('galv').box(bx - 0.18, bx + 0.18, 0.0, 0.42, bz - 0.8, bz - 0.76); acc('galv').box(bx - 0.18, bx + 0.18, 0.0, 0.42, bz + 0.76, bz + 0.8)
acc('bottle').cyl((bx, 0.46, bz + 0.5), (bx, 0.68, bz + 0.5), 0.035, seg=14); acc('cap').cyl((bx, 0.68, bz + 0.5), (bx, 0.71, bz + 0.5), 0.017, seg=10)

# ======================== 球（罰球線附近，滾到一邊停住） ========================
def ball_tex(path):
    W, H = 1024, 512; im = Image.new('RGB', (W, H), (196, 96, 44)); d = ImageDraw.Draw(im)
    a = np.asarray(im).astype(np.float32); a *= (1 + gaussian_filter(nrng.standard_normal((H, W)).astype(np.float32), 1.0)[..., None] * 0.05); im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.line([(0, H / 2), (W, H / 2)], fill=(30, 22, 18), width=7)                                  # 赤道
    for x in (W / 4, 3 * W / 4): d.line([(x, 0), (x, H)], fill=(30, 22, 18), width=7)            # 經線
    for x0 in (0, W / 2):                                                                        # 兩條彎的
        pts = [(x0 + W / 4 + math.sin(t * math.pi) * W * 0.16 * (1 if x0 == 0 else -1), t * H) for t in np.linspace(0, 1, 60)]; d.line(pts, fill=(30, 22, 18), width=7)
    im.save(path)
BALL = os.path.join(TMP, 'ball.png'); ball_tex(BALL); M['ball'] = img_mat('court_ball', BALL, rough=0.55)
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.12, location=g2b(BASE_X + 7.4, 0.12, 2.9))
ball = bpy.context.active_object; ball.data.materials.append(M['ball']); ball.parent = root; ball.rotation_euler = (0.4, 0.9, 0.2)
for p in ball.data.polygons: p.use_smooth = True

# ======================== 樹（圍網外一排樟樹，street_trees.glb） ========================
TREES = os.path.join(L.ROOT, 'assets/models/env/second_ai/street_trees.glb')
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=TREES); new = [o for o in bpy.data.objects if o not in before]
TSRC = {o.name.split('.')[0]: o for o in new if o.name.startswith('tree_')}
for o in new: o.hide_render = True
def tree(kind, x, z, s=1.0, ry=0.0):
    src = TSRC.get(kind)
    if src is None: return
    def walk(o, par):
        c = o.copy(); sc.collection.objects.link(c); c.hide_render = False; c.parent = par
        for ch in o.children: walk(ch, c)
        return c
    t = walk(src, root); t.location = g2b(x, 0.0, z); t.rotation_euler = (0, 0, ry); t.scale = (s, s, s)
for i, z in enumerate(np.arange(FZ0 - 2.0, FZ1 + 4.0, 5.5)):       # 西邊（籃架後面）一排
    tree('tree_camphor_a' if i % 2 else 'tree_camphor_b', FX0 - 3.2 + rng.uniform(-0.6, 0.6), z + rng.uniform(-0.8, 0.8), rng.uniform(0.9, 1.15), rng.uniform(0, 6.28))
for i, x in enumerate(np.arange(FX0 - 1.0, FX1 + 2.0, 6.0)):        # 北邊一排
    tree('tree_camphor_b' if i % 2 else 'tree_camphor_a', x + rng.uniform(-0.8, 0.8), FZ0 - 3.2 + rng.uniform(-0.6, 0.6), rng.uniform(0.9, 1.15), rng.uniform(0, 6.28))

# ======================== 體育館（西北邊的大片玻璃牆，裡面亮著） ========================
def gym_tex(path):
    """玻璃帷幕（80×15 m 一面）：直櫺 1.5 m、橫樑 3 m（深灰細線）；裡面亮著：天花板的燈一排一排（上面亮、往下漸暗）、
    二樓樓板一條暗帶（5.5 m）、二樓走道的欄杆剪影、一樓大廳靠下比較暗；有幾格比較暗（玻璃反射夜空）。沒有字"""
    W, H = 3200, 600; ppm = W / 80.0
    yy = (H - np.arange(H)[:, None]) / ppm * np.ones((1, W))        # 離地高度（公尺），圖的上緣＝15 m
    xx = np.arange(W)[None, :] / ppm * np.ones((H, 1))
    lum = 0.35 + 0.65 * np.clip((yy - 1.0) / 13.0, 0, 1) ** 0.8         # 越往上越亮（天花板的燈）
    lum *= 1 + 0.25 * np.sin(xx * 0.9) * np.exp(-((yy - 13.2) / 0.6) ** 2)   # 燈的排列
    lum = np.where((yy > 5.3) & (yy < 5.9), lum * 0.2, lum)                  # 二樓樓板
    rail = ((yy > 6.8) & (yy < 6.95)) | (((yy > 5.9) & (yy < 6.9)) & ((xx % 0.25) < 0.03))
    lum = np.where(rail, lum * 0.35, lum)
    cell = (np.floor(xx / 1.5) * 7 + np.floor(yy / 3.0) * 13) % 11
    lum *= np.where(cell < 1.0, 0.45, 1.0)                                   # 幾格比較暗（反射）
    lum = gaussian_filter(lum.astype(np.float32), 1.0)
    mull = ((xx % 1.5) < 0.06) | ((yy % 3.0) < 0.08)
    rgb = np.stack([lum * 1.0, lum * 0.88, lum * 0.7], -1)
    rgb = np.where(mull[..., None], np.array([0.05, 0.055, 0.06]), rgb)
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), 'RGB').save(path)
GTEX = os.path.join(TMP, 'gym_glass.png'); gym_tex(GTEX); M['gym_glass'] = img_mat('court_gym_glass', GTEX, rough=0.2, emit=1.1)
M['gym_wall'] = L.flat('court_gym_wall', '#5c6064', rough=0.7)
GX = FX0 - 16.0
uvquad('gym_glass_w', (GX, 1.0, 26.0), (GX, 1.0, -54.0), (GX, 16.0, -54.0), (GX, 16.0, 26.0), mat=M['gym_glass'])   # 80 m 寬、15 m 高（貼圖照這個比例）
acc('gym_wall').box(GX - 30, GX, 16.0, 18.5, -55, 27)       # 屋頂邊
acc('gym_wall').box(GX - 30, GX - 0.2, 0.0, 1.0, -55, 27)   # 一樓牆腳
acc('gym_wall').box(GX - 0.6, GX + 4.0, 5.6, 5.9, -30, 10)   # 入口的雨遮
uvquad('gym_glass_n', (GX - 30, 1.0, -54.0), (GX, 1.0, -54.0), (GX, 16.0, -54.0), (GX - 30, 16.0, -54.0), mat=M['gym_glass'])

# ======================== 收尾、光、鏡頭 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=k in ('galv', 'bottle', 'cap'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
sky = nt.nodes.new('ShaderNodeTexGradient'); mp = nt.nodes.new('ShaderNodeMapping'); tc = nt.nodes.new('ShaderNodeTexCoord'); ramp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); mp.inputs['Rotation'].default_value = (0, math.pi / 2, 0)
nt.links.new(mp.outputs['Vector'], sky.inputs['Vector']); nt.links.new(sky.outputs['Fac'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].color = (0.012, 0.016, 0.03, 1); ramp.color_ramp.elements[1].color = (0.05, 0.045, 0.05, 1)   # 上面深藍、地平線有城市的光
nt.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs[1].default_value = 1.0
for i, ((x, y, z), (tx, ty, tz)) in enumerate(LIGHTS):      # 高桿燈：白光（約 5000K），往場中間打
    l = bpy.data.lights.new(f'mast_{i}', 'SPOT'); l.energy = float(opt('--mast', '6500')); l.color = (0.93, 0.96, 1.0); l.spot_size = math.radians(95); l.spot_blend = 0.5; l.shadow_soft_size = 0.35
    ob = bpy.data.objects.new(f'mast_{i}', l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    ob.rotation_euler = (g2b(tx, ty, tz) - g2b(x, y, z)).to_track_quat('-Z', 'Y').to_euler()
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye, look = (0.5, 1.55, 5.8), (-13.03, 2.05, -0.68)   # 籃框在畫面約 47%：手機直向（cover、置中，只看到中間約 26%）時整塊籃板在畫面左半（第一版 40%，直向只露出半塊籃板，往左轉 6°）
if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', '24')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
if '--dof' in A:
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = float(opt('--dof', '11')); cam.data.dof.aperture_fstop = 4.0
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
im = np.asarray(Image.open(OUT).convert('RGB')).astype(np.float32) / 255.0; h_, w_ = im.shape[:2]
yy, xx = np.mgrid[0:h_, 0:w_]; r = np.hypot((xx - w_ / 2) / (w_ / 2), (yy - h_ / 2) / (h_ / 2))
im = im * np.array([0.98, 1.0, 1.03]) * (1.0 - 0.25 * np.clip(r - 0.45, 0, 1) ** 1.5)[..., None]
hi = np.clip(im.max(-1) - 0.82, 0, 1)[..., None] * im                       # 燈頭、亮窗的光暈（夜裡的空氣）
im = im + 0.35 * gaussian_filter(hi, (6.0 * w_ / 1920, 0, 0)) + 0.2 * gaussian_filter(hi, (22.0 * w_ / 1920, 0, 0))
Image.fromarray((np.clip(im, 0, 1) * 255).astype(np.uint8)).save(OUT)
print('saved', OUT)
