"""2D 背景：宿舍頂樓（outings3d.js 的 S.BG.dorm_roof；BG-05／ART-BG05）。LAWWW2-B 2026-10-16。
劇情（AA_147）：跨年頂樓 ev_nye_roof（CG-15），12/31 23:45；v0 E24c 也是晚上。麵店團在頂樓（阿哲回頭、其他人背影）；和可昕約的玩家 23:59 接視訊、走到角落。
必要元素（AA_147）：水泥平台、矮牆、水塔、一盞昏黃的燈；遠方最高的大樓放煙火，很小、很遠；矮牆上有便利商店塑膠袋、飲料。**煙火不打出字或數字**。
遊戲裡的男一舍（CK.hall 套件）沒有頂樓，所以用 Blender 蓋一個台灣宿舍常見的頂樓：
  - 水泥地（防水漆斑駁、排水孔、伸縮縫）、女兒牆（1.1 m，壓頂），
  - 樓梯間出口的小屋（鐵門、門上一盞昏黃的壁燈＝唯一的燈）、不鏽鋼水塔兩個（架在鋼架上）、冷氣室外機、管線，
  - 女兒牆上：便利商店的白色塑膠袋（沒有字和標誌）、兩罐啤酒／汽水、一瓶寶特瓶茶（瓶身素色）。
遠景：校園的樹（暗的剪影）→ 公館、新店溪那一側的城市燈光 → 遠山 → 遠方最高的大樓（很遠、很小，不畫成任何特定建築的細節）上面幾朵小煙火（只有圓形的光點）。
  /opt/blenv/bin/python tools/blender/env_second/bg_roof.py -- <輸出.png> [--res 1920x1080] [--samples 96]
座標＝遊戲座標（x 東、y 上、z 南）；鏡頭站在頂樓、往北看出女兒牆。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_roof_tex'); os.makedirs(TMP, exist_ok=True)
rng = random.Random(1231)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.9'))
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16


def emit_only(name, path, strength, alpha=False):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; nt.nodes.clear()
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(tx.outputs['Color'], em.inputs['Color'])
    if alpha:
        tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader'); tx.image.alpha_mode = 'STRAIGHT'
        nt.links.new(tx.outputs['Alpha'], mx.inputs['Fac']); nt.links.new(tr.outputs['BSDF'], mx.inputs[1]); nt.links.new(em.outputs['Emission'], mx.inputs[2]); nt.links.new(mx.outputs['Shader'], o.inputs['Surface'])
    else: nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    return mt


def uvquad(name, p0, p1, p2, p3, mat):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def lathe_obj(name, profile, mat, at, seg=32, smooth=True):
    bm = L.lathe(profile, seg); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = g2b(*at)
    if smooth: me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    return ob


def point_light(name, x, y, z, power, col=(1.0, 0.8, 0.55), r=0.08):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def camera(eye, look, lens):
    if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
    cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()


# ---------------- 遠景（畫的）：夜空＋遠山＋城市燈光＋最高的大樓與小煙火；校園的樹另外一層（近一點，有透明） ----------------
def skyline(path, W=4096, H=1536, seed=12):
    r = random.Random(seed); im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):                                                        # 夜空：上面深藍，地平線被城市照成暗橘紫
        t = y / H; c = (int(10 + 70 * t ** 3), int(14 + 42 * t ** 3), int(30 + 40 * t ** 2.5)); d.line([(0, y), (W, y)], fill=c)
    for _ in range(140):                                                      # 很少的星星（城市光害）
        x, y = r.randint(0, W), r.randint(0, int(H * 0.45)); b = r.randint(90, 170); d.point((x, y), fill=(b, b, b + 10))
    HZ = int(H * 0.70)                                                        # 地平線（城市的燈帶）
    pts = [(0, H)]                                                            # 遠山：盆地邊緣的圓緩山稜（比夜空亮一點點）
    for x in range(0, W + 1, 16):
        n = 0.5 * math.sin(x / 520.0 + 1.3) + 0.3 * math.sin(x / 210.0 + 0.4) + 0.2 * math.sin(x / 90.0)
        pts.append((x, int(HZ - 120 - 70 * n)))
    pts.append((W, H)); d.polygon(pts, fill=(24, 22, 34))
    # 最高的大樓（遠方、偏右）：細長、分節的塔，頂端一根尖；只有輪廓＋一點點燈（不畫成任何特定建築的細節）
    tx, tw, ttop = int(W * 0.62), 30, int(HZ - 330)
    for k in range(8):                                                        # 往上一節一節微微收窄
        y0 = ttop + 30 + k * 34; d.polygon([(tx - tw // 2 - 3 + k // 2, y0 + 34), (tx + tw // 2 + 3 - k // 2, y0 + 34), (tx + tw // 2 - k // 2, y0), (tx - tw // 2 + k // 2, y0)], fill=(44, 42, 58))
    d.rectangle([tx - tw // 2 - 4, ttop + 300, tx + tw // 2 + 4, HZ], fill=(40, 38, 52)); d.line([(tx, ttop + 30), (tx, ttop - 20)], fill=(60, 58, 70), width=2)
    for k in range(10): yy = ttop + 44 + k * 26; d.line([(tx - 9, yy), (tx + 9, yy)], fill=(120, 112, 90), width=2)   # 燈帶
    # 城市：很多層低矮的樓＋燈（越遠越小、越密）
    for layer, (base_y, hmin, hmax, wmin, wmax, col, wsz, lit) in enumerate(((HZ - 40, 30, 120, 30, 90, (30, 28, 40), 5, 0.35), (HZ + 20, 30, 110, 40, 110, (22, 22, 30), 6, 0.38), (HZ + 70, 50, 150, 60, 150, (18, 18, 24), 9, 0.4))):
        x = -r.randint(0, 60)
        while x < W:
            bw = r.randint(wmin, wmax); bh = r.randint(hmin, hmax)
            if abs(x + bw / 2 - tx) < 70 and layer == 0: x += bw; continue
            d.rectangle([x, base_y - bh, x + bw, H], fill=col)
            for yy in range(base_y - bh + 6, H - 4, wsz * 2):
                for xx in range(x + 4, x + bw - wsz, wsz * 2):
                    if r.random() < lit:
                        c = r.choice([(255, 200, 130), (255, 220, 170), (230, 236, 255), (255, 180, 110)]); k = r.uniform(0.45, 1.0)
                        d.rectangle([xx, yy, xx + wsz, yy + max(2, wsz - 3)], fill=tuple(int(v * k) for v in c))
            x += bw + r.randint(2, 18)
    glow = Image.new('RGB', (W, H)); gd = ImageDraw.Draw(glow)                # 城市的光暈（地平線上一層暖色）
    gd.rectangle([0, HZ - 160, W, HZ + 40], fill=(90, 50, 40)); glow = glow.filter(ImageFilter.GaussianBlur(90))
    im = Image.blend(im, Image.eval(Image.merge('RGB', [Image.eval(c, lambda v: v) for c in im.split()]), lambda v: v), 0)
    im = Image.fromarray(__import__('numpy').clip(__import__('numpy').asarray(im).astype(int) + __import__('numpy').asarray(glow).astype(int) // 2, 0, 255).astype('uint8'))
    # 煙火：大樓頂端兩側幾朵（小、很遠；只有放射狀的光點，不成字、不成數字）
    fw = Image.new('RGB', (W, H)); fd = ImageDraw.Draw(fw)
    for (cx, cy, rad, col) in ((tx - 44, ttop - 30, 26, (255, 120, 150)), (tx + 38, ttop - 58, 32, (255, 214, 120)), (tx + 6, ttop - 8, 20, (150, 220, 255)), (tx - 14, ttop - 88, 22, (200, 255, 170)), (tx + 74, ttop - 16, 18, (255, 170, 90))):
        for k in range(36):
            a = k / 36 * 2 * math.pi + r.uniform(-0.05, 0.05); rr = rad * r.uniform(0.75, 1.0)
            for j in range(5):
                f = 0.45 + j * 0.13; px, py = cx + math.cos(a) * rr * f, cy + math.sin(a) * rr * f + j * 1.5
                s = 1 if j < 4 else 2; fd.ellipse([px - s, py - s, px + s, py + s], fill=tuple(int(v * (0.25 + 0.08 * j)) for v in col))
        fd.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=tuple(int(v * 0.5) for v in col))
    fwb = fw.filter(ImageFilter.GaussianBlur(6))
    im = Image.fromarray(__import__('numpy').clip(__import__('numpy').asarray(im).astype(int) + __import__('numpy').asarray(fw).astype(int) + __import__('numpy').asarray(fwb).astype(int), 0, 255).astype('uint8'))
    im.save(path); return path


def treeline(path, W=4096, H=1024, seed=5):
    """校園的樹（近一點的剪影；下緣被宿舍旁的路燈照到一點綠）：透明 PNG"""
    r = random.Random(seed); im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for _ in range(900):
        x = r.randint(-100, W + 100); y = r.randint(int(H * 0.30), int(H * 0.8)); rr = r.randint(18, 60)
        g = r.randint(10, 22); d.ellipse([x - rr, y - int(rr * 0.8), x + rr, y + int(rr * 0.8)], fill=(g, g + 8, g + 6, 255))
    d.rectangle([0, int(H * 0.72), W, H], fill=(12, 18, 16, 255))
    im = im.filter(ImageFilter.GaussianBlur(1.2)); im.save(path); return path


sky_png = skyline(os.path.join(TMP, 'roof_skyline.png')); tree_png = treeline(os.path.join(TMP, 'roof_trees.png'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.012, 0.016, 0.03, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
SKY = emit_only('roof_sky', sky_png, 1.0); TREE = emit_only('roof_trees', tree_png, 1.0, alpha=True)
uvquad('skyline', (-560, -74, -420), (560, -74, -420), (560, 226, -420), (-560, 226, -420), SKY)                 # 很遠（420 m）；地平線（圖的 70%）在眼睛上方約 2°
uvquad('treeline', (-160, -30, -110), (160, -30, -110), (160, 13, -110), (-160, 13, -110), TREE)                   # 校園的樹（110 m；頂樓比樹高，樹梢只在女兒牆上面露一點）

# ---------------- 頂樓（第 6 層屋頂，地面 y=0；往北 −z 是女兒牆）----------------
M = {
    'floor': L.pbr('roof_floor', 'concrete_wall_006', tile=2.6, target='#7f837f', normal=0.35, maps=('diff', 'nor'), rough_value=0.85),
    'wall': L.pbr('roof_wall', 'concrete_wall_006', tile=1.6, target='#a7a49c', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
    'cap': L.pbr('roof_cap', 'concrete_wall_006', tile=0.8, target='#bab6ad', normal=0.3, maps=('diff',), rough_value=0.85),
    'tile': L.pbr('roof_tile', 'rectangular_facade_tiles', tile=0.9, target='#c9c0ac', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
    'door': L.flat('roof_door', '#55695d', rough=0.45, metal=0.3),
    'steel': L.flat('roof_steel', '#b9bcbf', rough=0.25, metal=0.6),
    'rust': L.flat('roof_rust', '#5a4a40', rough=0.7, metal=0.3),
    'pipe': L.flat('roof_pipe', '#8d8f8c', rough=0.5, metal=0.2),
    'ac': L.flat('roof_ac', '#d9d8d2', rough=0.5),
    'ac_d': L.flat('roof_ac_dark', '#3a3d40', rough=0.6),
    'bag': L.flat('roof_bag', '#eeeeea', rough=0.35, alpha=0.82),
    'can1': L.flat('roof_can1', '#2f6d9c', rough=0.25, metal=0.6), 'can2': L.flat('roof_can2', '#b8b9bb', rough=0.2, metal=0.7),
    'pet': L.flat('roof_pet', '#c9a45a', rough=0.15, alpha=0.75), 'cap_w': L.flat('roof_capw', '#f2f2ee', rough=0.4),
    'lamp': L.flat('roof_lamp', '#fff1c8', rough=0.3, emit=B.srgb('#ffcf8a')), 'lamp_cage': L.flat('roof_lampcage', '#2b2b2b', rough=0.5, metal=0.4),
    'drain': L.flat('roof_drain', '#2a2b2c', rough=0.6, metal=0.3),
}
M['lamp'].node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 9.0
X0, X1, Z0, Z1 = -9.0, 9.0, -6.0, 8.0; PH, PT = 1.1, 0.22
fl = Mesh('roof_floor', M['floor']); fl.box(X0, X1, -0.1, 0.0, Z0, Z1)
for x in (-3.0, 3.0): Mesh('roof_joint', M['drain']).box(x - 0.02, x + 0.02, 0.0, 0.004, Z0, Z1).finish()        # 伸縮縫
fl.finish()
wl = Mesh('roof_parapet', M['wall']); cp = Mesh('roof_cap', M['cap'])
for (a0, a1, b0, b1) in ((X0, X1, Z0 - PT, Z0), (X0 - PT, X0, Z0 - PT, Z1), (X1, X1 + PT, Z0 - PT, Z1)):
    wl.box(a0, a1, 0.0, PH, b0, b1); cp.box(a0 - 0.04, a1 + 0.04, PH, PH + 0.06, b0 - 0.04, b1 + 0.04)
wl.finish(); cp.finish()
for x in (-6.5, 1.5, 7.5): Mesh('roof_drain', M['drain']).box(x - 0.12, x + 0.12, 0.0, 0.006, Z0 + 0.05, Z0 + 0.25).finish()   # 排水孔
# 樓梯間出口小屋（西北角，鏡頭左前方）：磁磚外牆、綠色鐵門朝東、門上一盞昏黃的壁燈（＝唯一的燈）；水塔架在小屋的屋頂上（台灣公寓、宿舍常見）
SX0, SX1, SZ0, SZ1, SH = -6.2, -2.6, -6.0, -2.8, 2.7
st = Mesh('roof_stair', M['tile']); st.box(SX0, SX1, 0.0, SH, SZ0, SZ1); st.finish()
Mesh('roof_stair_top', M['cap']).box(SX0 - 0.1, SX1 + 0.1, SH, SH + 0.12, SZ0 - 0.1, SZ1 + 0.1).finish()
DZ0, DZ1 = -4.6, -3.6
uvquad('roof_door', (SX1 + 0.002, 0.0, DZ1), (SX1 + 0.002, 0.0, DZ0), (SX1 + 0.002, 2.05, DZ0), (SX1 + 0.002, 2.05, DZ1), M['door'])
Mesh('roof_door_frame', M['rust']).box(SX1, SX1 + 0.03, 2.05, 2.12, DZ0 - 0.05, DZ1 + 0.05).finish()
dp = Mesh('roof_door_detail', M['rust']); dp.box(SX1, SX1 + 0.02, 0.0, 2.12, DZ0 - 0.05, DZ0); dp.box(SX1, SX1 + 0.02, 0.0, 2.12, DZ1, DZ1 + 0.05); dp.box(SX1, SX1 + 0.012, 1.0, 1.04, DZ0, DZ1)
dp.box(SX1, SX1 + 0.04, 0.98, 1.02, DZ1 - 0.16, DZ1 - 0.06); dp.finish()   # 門框、中間的橫條、門把
lc = Mesh('roof_lamp_cage', M['lamp_cage']); lc.box(SX1, SX1 + 0.16, 2.28, 2.3, (DZ0 + DZ1) / 2 - 0.1, (DZ0 + DZ1) / 2 + 0.1); lc.finish()
Mesh('roof_lamp', M['lamp']).sphere((SX1 + 0.1, 2.38, (DZ0 + DZ1) / 2), 0.075, seg=14, rings=10, sy=1.2).finish(smooth=True)
point_light('roof_lamp_light', SX1 + 0.3, 2.34, (DZ0 + DZ1) / 2, 140, (1.0, 0.72, 0.42), 0.06)
fr = Mesh('roof_tank_frame', M['rust'])
for (tx_, tz_) in ((-5.3, -4.4), (-3.6, -4.4)):
    for dx in (-0.55, 0.55):
        for dz in (-0.55, 0.55): fr.box(tx_ + dx - 0.04, tx_ + dx + 0.04, SH + 0.12, SH + 0.7, tz_ + dz - 0.04, tz_ + dz + 0.04)
    fr.box(tx_ - 0.62, tx_ + 0.62, SH + 0.66, SH + 0.72, tz_ - 0.62, tz_ + 0.62)
    lathe_obj('roof_tank', [(0.0, 0.0), (0.58, 0.0), (0.6, 0.04), (0.6, 1.5), (0.55, 1.62), (0.18, 1.7), (0.18, 1.78), (0.0, 1.78)], M['steel'], (tx_, SH + 0.72, tz_), seg=40)
    for k in range(3): lathe_obj('roof_tank_band', [(0.604, 0.0), (0.614, 0.0), (0.614, 0.03), (0.604, 0.03)], M['steel'], (tx_, SH + 1.05 + k * 0.4, tz_), seg=40)
fr.finish()
pp = Mesh('roof_pipes', M['pipe'])
pp.cyl((-2.4, 0.1, -3.2), (4.8, 0.1, -3.2), 0.04, seg=10); pp.cyl((-3.0, 2.4, -2.75), (-3.0, 0.1, -2.75), 0.03, seg=10); pp.cyl((-3.0, 0.1, -2.75), (-3.0, 0.1, -3.2), 0.03, seg=10)
pp.finish(smooth=True)
# 冷氣室外機（右前方，靠北邊的女兒牆，兩台）
for (ax, az) in ((2.6, -5.4), (3.6, -5.4)):
    a1 = Mesh('roof_ac', M['ac']); a1.box(ax - 0.4, ax + 0.4, 0.12, 0.7, az - 0.3, az + 0.3); a1.finish()
    Mesh('roof_ac_grill', M['ac_d']).cyl((ax, 0.42, az + 0.301), (ax, 0.42, az + 0.31), 0.22, seg=24).finish()
    Mesh('roof_ac_feet', M['rust']).box(ax - 0.42, ax + 0.42, 0.0, 0.12, az - 0.25, az + 0.25).finish()
# 曬衣架（右邊，空的）
rk = Mesh('roof_rack', M['pipe'])
for x in (4.6, 6.6): rk.cyl((x, 0.0, -3.9), (x, 1.7, -3.9), 0.025, seg=8); rk.cyl((x, 0.0, -2.5), (x, 1.7, -2.5), 0.025, seg=8)
for z in (-3.9, -3.45, -2.95, -2.5): rk.cyl((4.6, 1.7, z), (6.6, 1.7, z), 0.016, seg=6)
rk.finish(smooth=True)
# 女兒牆上：便利商店的白色塑膠袋（沒有字和標誌）、兩罐飲料、一瓶寶特瓶茶；鏡頭正前方偏左
BX, BZ, BY = -0.6, Z0 - PT / 2, PH + 0.06
bag = L.lathe([(0.0, 0.0), (0.13, 0.0), (0.16, 0.06), (0.15, 0.2), (0.11, 0.27), (0.05, 0.3), (0.0, 0.3)], 18)
for v in bag.verts: v.co.y *= 0.55; v.co.z *= 1.0 + 0.08 * math.sin(v.co.x * 20)
mb = Mesh('roof_bag', M['bag']); mb.add_bm(bag, __import__('mathutils').Matrix.Translation(g2b(BX, BY, BZ))); bag.free(); mb.finish(smooth=True)
hb = Mesh('roof_bag_handle', M['bag']); hb.cyl((BX - 0.05, BY + 0.28, BZ), (BX, BY + 0.36, BZ), 0.01, seg=6); hb.cyl((BX, BY + 0.36, BZ), (BX + 0.05, BY + 0.28, BZ), 0.01, seg=6); hb.finish(smooth=True)
for (cx_, mat) in ((-0.15, M['can1']), (0.0, M['can2'])):
    lathe_obj('roof_can', [(0.0, 0.0), (0.03, 0.0), (0.033, 0.01), (0.033, 0.11), (0.028, 0.122), (0.0, 0.122)], mat, (cx_, BY, BZ + rng.uniform(-0.03, 0.03)), seg=20)
lathe_obj('roof_pet', [(0.0, 0.0), (0.033, 0.0), (0.035, 0.02), (0.035, 0.16), (0.024, 0.2), (0.014, 0.215), (0.0, 0.215)], M['pet'], (0.25, BY, BZ), seg=20)
lathe_obj('roof_pet_cap', [(0.0, 0.0), (0.015, 0.0), (0.015, 0.02), (0.0, 0.02)], M['cap_w'], (0.25, BY + 0.215, BZ), seg=12)
# 天光：城市反射的暗紫藍補光（從北邊的天空來），讓水泥、牆的形狀出得來
fill = bpy.data.lights.new('city_fill', 'AREA'); fill.energy = 1600; fill.color = (0.55, 0.5, 0.75); fill.shape = 'RECTANGLE'; fill.size = 30; fill.size_y = 8
fo = bpy.data.objects.new('city_fill', fill); fo.location = g2b(0, 7, -10); fo.rotation_euler = (math.radians(55), 0, 0); sc.collection.objects.link(fo)
camera((-0.4, 1.62, 1.6), (1.4, 2.1, -12.0), float(opt('--lens', '22')))
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('rendered', OUT, RW, RH, SAMPLES)
