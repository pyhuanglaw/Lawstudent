"""2D 背景：公館巷子裡的機車行（ART-BG-AA185 第 1 張；AA_185 3-5 A26、AA_177 4-7：大二下模擬法庭「模 2」，祐廷去問機車行老闆二手車的事）。
LAWWW2-C 2026-10-17。Blender 5.2（bpy，無介面）＋Cycles（CPU），畫面上沒有人（老闆是 ADV 立繪／旁白），做法照 bg_home.py（場景直接用 bpy 蓋，不輸出 GLB）。
旁白（AA_177）：「公館巷子裡的機車行。地上都是機油，老闆蹲著在換輪胎。」→ 傍晚、店裡的日光燈亮著，升降台上一台機車、旁邊一個拆下來的輪胎。
道具：BB-B 的機車行道具組 v2（assets/models/env/second_ai/bb_support/scooter_shop_props.glb；LAWWW2-B 5d5bb8aa 驗收通過，SPREAD 的位置照用）；
機車：assets/models/env/second_ai/scooter.glb（LAWWW2；台灣常見的速克達款式，沒有品牌）。店名虛構（D77），沒有電話號碼。
台灣機車行的辨識點（BB-B 的清單＋這裡補的）：一樓店面＋騎樓、拉起來的鐵捲門、牆下半部的白色小磁磚（油污）、水泥地上的機油漬、
工具牆、輪胎堆、零件架、油桶、打氣機、塑膠矮凳、日光燈、牆上的工業電扇、月曆、神明桌（紅色的燈）、騎樓停的機車、直立的招牌燈箱。
座標＝遊戲座標（x 往右、y 往上、z 往鏡頭；店面在 z＝2.35，後牆 z＝−1.85），g2b 轉成 Blender。
  /opt/blenv/bin/python tools/blender/env_second/bg_scooter_shop.py -- <輸出.png> [--res 1920x1080] [--samples 64] [--exposure 0] [--eye x,y,z --look x,y,z] [--lens 22]
  之後：python3 tools/blender/env_second/bg_paint.py <輸出.png> assets/bg/gongguan_scooter_shop.webp"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default): return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '64'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..')); ENV2 = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai')
TEXR = os.path.join(ROOT, 'tools', 'blender', 'textures')
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_shop_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1017); nrng = np.random.default_rng(1017)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.5'))
try: sc.view_settings.look = opt('--look-grade', 'AgX - Punchy')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16

X0, X1, ZB, ZF, H = -3.1, 3.4, -1.85, 2.35, 3.2       # 店內（BB-B 試擺場景的尺寸）
ZA = 5.45                                             # 騎樓外緣（往外是巷子，低 15 cm）


# ---------------- 材質 ----------------
def img_mat(name, path, emit=0.0, rough=0.7, alpha=False):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if alpha: nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def mask_mat(name, base_path, mask_path, tile, tint, rough=0.85, dark=0.7, gloss=0.45):
    """底色貼圖（世界座標鋪）× tint，再乘上 mask（油漬：暗、亮）"""
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; N = nt.nodes; Lk = nt.links; b = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (tile, tile, tile)
    Lk.new(tc.outputs['UV'], mp.inputs['Vector'])
    ti = N.new('ShaderNodeTexImage'); ti.image = bpy.data.images.load(base_path); Lk.new(mp.outputs['Vector'], ti.inputs['Vector'])
    tm = N.new('ShaderNodeTexImage'); tm.image = bpy.data.images.load(mask_path); tm.image.colorspace_settings.name = 'Non-Color'
    tc2 = N.new('ShaderNodeUVMap'); tc2.uv_map = 'mask'; Lk.new(tc2.outputs['UV'], tm.inputs['Vector'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
    mx.inputs[6].default_value = (*tint, 1); Lk.new(ti.outputs['Color'], mx.inputs[7])
    m2 = N.new('ShaderNodeMix'); m2.data_type = 'RGBA'; m2.blend_type = 'MULTIPLY'; Lk.new(tm.outputs['Color'], m2.inputs['Factor'])
    m2.inputs[7].default_value = (1 - dark, 1 - dark * 0.95, 1 - dark * 0.9, 1); Lk.new(mx.outputs[2], m2.inputs[6]); Lk.new(m2.outputs[2], b.inputs['Base Color'])
    mr = N.new('ShaderNodeMath'); mr.operation = 'MULTIPLY_ADD'; Lk.new(tm.outputs['Color'], mr.inputs[0]); mr.inputs[1].default_value = -gloss; mr.inputs[2].default_value = rough
    Lk.new(mr.outputs[0], b.inputs['Roughness'])
    return mt


def emit_mat(name, col, strength):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; nt.nodes.clear()
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*col, 1); em.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(em.outputs['Emission'], o.inputs['Surface']); return mt


def uvquad(name, p0, p1, p2, p3, mat):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def area_light(name, x, y, z, w, d, power, col, rot=(0, 0, 0)):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); ob.rotation_euler = rot; sc.collection.objects.link(ob); return ob


def point_light(name, x, y, z, power, col, r=0.1):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def font(sz): return ImageFont.truetype(FONT, sz)


M = {'plaster': L.pbr('sh_plaster', 'plaster_grey_04', tile=1.4, target='#b9bcae', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),       # 店裡上半部：淡綠灰的油漆
     'plaster_out': L.pbr('sh_plaster_out', 'plaster_grey_04', tile=1.4, target='#c9c3b4', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'facade': L.pbr('sh_facade', 'rectangular_facade_tiles', tile=1.0, target='#b7a690', normal=0.5, maps=('diff', 'nor'), rough_value=0.6),   # 騎樓柱子、外牆的二丁掛磁磚
     'terrazzo': L.pbr('sh_terrazzo', 'terrazzo_tiles', tile=1.2, target='#9c968c', normal=0.3, maps=('diff', 'nor'), rough_value=0.55),       # 騎樓地板（磨石子）
     'asph': L.pbr('sh_asph', 'asphalt_02', tile=3.0, target='#5e5e5c', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'conc': L.pbr('sh_conc', 'concrete_wall_006', tile=2.0, target='#8f8d88', normal=0.3, maps=('diff', 'nor'), rough_value=0.9),
     'shutter': L.pbr('sh_shutter', 'painted_metal_shutter', tile=1.0, target='#8a8f92', normal=0.6, maps=('diff', 'nor'), rough_value=0.5),
     'metal': L.flat('sh_metal', '#7d8186', rough=0.45, metal=0.35), 'dark': L.flat('sh_dark', '#26282b', rough=0.6),
     'white': L.flat('sh_white', '#e9e7e0', rough=0.5), 'red': L.flat('sh_red', '#b3241e', rough=0.45), 'wood': L.flat('sh_wood', '#7a5236', rough=0.6),
     'cable': L.flat('sh_cable', '#1d1e20', rough=0.5), 'cardboard': L.flat('sh_card', '#b48a5a', rough=0.85), 'curtain': L.flat('sh_curtain', '#4e5a72', rough=0.9),
     'green': L.flat('sh_green', '#3f6b52', rough=0.5), 'yellow': L.flat('sh_yellow', '#d8b23a', rough=0.5), 'black': L.flat('sh_black', '#121314', rough=0.55)}


# ---------------- 程式畫的貼圖 ----------------
def tex_floor_mask(path):
    """店內＋騎樓靠店的那一段水泥地的油漬（1＝油，第 0 列＝z ZF+1.2（前）……最後一列＝ZB）"""
    W_, H_ = 1024, 768; xs = np.linspace(X0, X1, W_); zs = np.linspace(ZF + 1.2, ZB, H_); XX, ZZ = np.meshgrid(xs, zs); st = np.zeros_like(XX)
    for (cx, cz, r, k) in ((-0.05, 0.1, 0.65, 0.95), (0.6, 0.6, 0.3, 0.85), (2.3, -0.5, 0.5, 0.9), (1.4, 0.8, 0.35, 0.7), (-2.1, -1.1, 0.4, 0.6),
                           (0.9, -1.2, 0.35, 0.6), (-1.2, 0.9, 0.3, 0.5), (0.4, 1.6, 0.35, 0.7), (-0.8, 1.9, 0.25, 0.6), (1.6, 2.2, 0.3, 0.55),
                           (-0.4, 2.8, 0.4, 0.5), (0.8, 3.1, 0.25, 0.4)):
        st = np.maximum(st, k * np.exp(-((XX - cx) ** 2 + (ZZ - cz) ** 2) / (2 * (r * 0.6) ** 2)))
    for _ in range(80):
        cx, cz, r = nrng.uniform(X0, X1), nrng.uniform(ZB, ZF + 1.2), nrng.uniform(0.02, 0.14)
        st = np.maximum(st, nrng.uniform(0.25, 0.75) * np.exp(-((XX - cx) ** 2 + (ZZ - cz) ** 2) / (2 * r * r)))
    for tx in (-0.07, 0.03):                                                       # 推車進出的輪胎痕（從騎樓到升降台）
        st = np.maximum(st, 0.4 * np.exp(-((XX - tx - 0.05 * np.sin(ZZ * 1.7)) / 0.035) ** 2) * (ZZ > 0.35))
    ao = np.clip(1 - (ZZ - ZB) / 0.4, 0, 1) ** 1.5 + np.clip(1 - (XX - X0) / 0.4, 0, 1) ** 1.5 + np.clip(1 - (X1 - XX) / 0.4, 0, 1) ** 1.5
    st = np.clip(st + 0.45 * ao, 0, 1)
    Image.fromarray((st * 255).astype(np.uint8)).save(path)


def tex_tiles(path, W_=1024, H_=512, cols=40, rows=20):
    """牆下半部的白色小磁磚（10 cm 見方、灰色填縫）：越靠地面越髒、有幾塊黃、幾道油手印（第 0 列＝上緣）"""
    a = np.ones((H_, W_, 3)) * np.array([0.90, 0.90, 0.87]); tw, th = W_ / cols, H_ / rows
    for r in range(rows):
        for c in range(cols):
            k = nrng.uniform(0.94, 1.02); y0, y1, x0, x1 = int(r * th), int((r + 1) * th), int(c * tw), int((c + 1) * tw)
            a[y0:y1, x0:x1] *= k * (np.array([1.0, 0.98, 0.9]) if nrng.random() < 0.08 else 1.0)
    yy, xx = np.mgrid[0:H_, 0:W_]
    grout = ((xx % tw) < 2.2) | ((yy % th) < 2.2); a[grout] = np.array([0.62, 0.61, 0.57])
    grime = (yy / H_) ** 2.2 * 0.55; a *= (1 - grime[..., None] * np.array([0.55, 0.62, 0.75]))
    for _ in range(14):                                                             # 油手印、靠東西磨的灰
        cx, cy, rx, ry = nrng.uniform(0, W_), nrng.uniform(H_ * 0.3, H_), nrng.uniform(20, 70), nrng.uniform(10, 50)
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2; a *= (1 - 0.35 * np.exp(-d * 2))[..., None]
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save(path)


def tex_sign(path, lines, size=(1024, 256), bg=(250, 248, 240), fg=(178, 30, 30), sub=None):
    im = Image.new('RGB', size, bg); d = ImageDraw.Draw(im); W_, H_ = size
    f = font(int(H_ * (0.62 if not sub else 0.5))); tw = d.textlength(lines, font=f)
    d.text(((W_ - tw) / 2, H_ * (0.12 if not sub else 0.06)), lines, font=f, fill=fg)
    if sub:
        f2 = font(int(H_ * 0.2)); tw = d.textlength(sub, font=f2); d.text(((W_ - tw) / 2, H_ * 0.70), sub, font=f2, fill=(40, 40, 46))
    d.rectangle([4, 4, W_ - 5, H_ - 5], outline=(120, 30, 30), width=6)
    im.save(path)


def tex_vsign(path, text, size=(220, 900)):
    """直立的招牌燈箱（白底紅字、上下藍邊）"""
    im = Image.new('RGB', size, (248, 246, 236)); d = ImageDraw.Draw(im); W_, H_ = size
    d.rectangle([0, 0, W_, 70], fill=(30, 60, 140)); d.rectangle([0, H_ - 70, W_, H_], fill=(30, 60, 140))
    f = font(int(W_ * 0.74)); n = len(text); step = (H_ - 160) / n
    for i, ch in enumerate(text):
        tw = d.textlength(ch, font=f); d.text(((W_ - tw) / 2, 80 + i * step + (step - W_ * 0.8) / 2), ch, font=f, fill=(190, 28, 28))
    im.save(path)


def tex_calendar(path):
    im = Image.new('RGB', (400, 560), (246, 244, 236)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 400, 230], fill=(198, 214, 196)); d.ellipse([90, 30, 310, 210], fill=(120, 160, 120))     # 上半是風景照（綠色的山）
    f = font(70); d.text((40, 245), '3', font=f, fill=(180, 30, 30)); f2 = font(26); d.text((120, 270), 'MARCH', font=f2, fill=(60, 60, 60))
    f3 = font(22)
    for i in range(35):
        r, c = divmod(i, 7); n = i - 2
        if 1 <= n <= 31: d.text((22 + c * 53, 340 + r * 42), str(n), font=f3, fill=(180, 30, 30) if c == 0 else (40, 40, 40))
    im.save(path)


tex_floor_mask(os.path.join(TMP, 'floor_mask.png')); tex_tiles(os.path.join(TMP, 'tiles.png'))
tex_sign(os.path.join(TMP, 'sign.png'), '順發機車行', sub='買賣・維修・保養・輪胎')
tex_vsign(os.path.join(TMP, 'vsign.png'), '機車行'); tex_calendar(os.path.join(TMP, 'cal.png'))
FLOOR = mask_mat('sh_floor', os.path.join(TEXR, 'granular_concrete', 'granular_concrete_diff_1k.jpg'), os.path.join(TMP, 'floor_mask.png'), 3.0, (0.60, 0.60, 0.58), 0.86, 0.72, 0.42)
TILES = img_mat('sh_tiles', os.path.join(TMP, 'tiles.png'), rough=0.35)


# ---------------- 店內 ----------------
def floor_obj():
    """水泥地：店內＋騎樓靠店 1.2 m（第二個 UV 'mask' 照世界座標鋪油漬）"""
    bm = bmesh.new(); xs = np.linspace(X0, X1, 14); zs = np.linspace(ZB, ZF + 1.2, 10); V = {}
    for i, x in enumerate(xs):
        for j, z in enumerate(zs): V[i, j] = bm.verts.new(g2b(x, 0.0, z))
    uv0 = bm.loops.layers.uv.new('UVMap'); uv1 = bm.loops.layers.uv.new('mask')
    for i in range(len(xs) - 1):
        for j in range(len(zs) - 1):
            f = bm.faces.new((V[i, j + 1], V[i + 1, j + 1], V[i + 1, j], V[i, j]))
            for lp in f.loops:
                p = lp.vert.co; x, z = p.x, -p.y
                lp[uv0].uv = (x / 2.0, z / 2.0); lp[uv1].uv = ((x - X0) / (X1 - X0), 1 - (z - ZB) / (ZF + 1.2 - ZB))
    me = bpy.data.meshes.new('floor'); bm.to_mesh(me); bm.free(); me.materials.append(FLOOR)
    ob = bpy.data.objects.new('floor', me); sc.collection.objects.link(ob); return ob


floor_obj()
m = Mesh('walls', M['plaster'])
m.box(X0 - 0.12, X1 + 0.12, 1.30, H, ZB - 0.12, ZB)                                   # 後牆（上半）
m.box(X0 - 0.12, X0, 1.30, H, ZB, ZF)                                                 # 左牆
m.box(X1, X1 + 0.12, 1.30, H, ZB, ZF)                                                 # 右牆
m.finish()
mt_ = Mesh('wall_tiles', TILES, tile=1.0)
mt_.box(X0 - 0.12, X1 + 0.12, 0, 1.30, ZB - 0.121, ZB - 0.001); mt_.box(X0 - 0.121, X0 + 0.001, 0, 1.30, ZB, ZF); mt_.box(X1 - 0.001, X1 + 0.121, 0, 1.30, ZB, ZF)
ob = mt_.finish(uv=False)
# 小磁磚的 UV：每 4 m × 1.3 m 一張（世界座標）
me = ob.data; uvl = me.uv_layers.new(name='UVMap') if not me.uv_layers else me.uv_layers[0]
for poly in me.polygons:
    for li in poly.loop_indices:
        co = me.vertices[me.loops[li].vertex_index].co; x, y, z = co.x, co.z, -co.y
        u = (x if abs(poly.normal.x) < 0.5 else z) / 4.0; uvl.data[li].uv = (u, y / 1.30)
m = Mesh('ceiling', M['conc']); m.box(X0 - 0.12, X1 + 0.12, H, H + 0.15, ZB - 0.12, ZA); m.finish()
m = Mesh('beam', M['plaster_out']); m.box(X0 - 0.6, X1 + 0.6, H - 0.42, H, ZF - 0.05, ZF + 0.35); m.finish()      # 店面上方的梁（騎樓）
# 鐵捲門：捲起來的箱子＋兩邊的導軌
m = Mesh('shutter_box', M['shutter']); m.rbox(X0 + 0.05, X1 - 0.05, H - 0.70, H - 0.42, ZF + 0.02, ZF + 0.36, r=0.05); m.finish()
m = Mesh('rails', M['metal'])
for x in (X0 + 0.02, X1 - 0.08): m.box(x, x + 0.06, 0, H - 0.70, ZF + 0.05, ZF + 0.14)
m.finish()
# 後牆左邊往後面倉庫的門（布簾半掩）
m = Mesh('door_dark', M['black']); m.box(-2.75, -1.95, 0, 2.1, ZB - 0.11, ZB - 0.05); m.finish()
m = Mesh('curtain', M['curtain'])
for i in range(7):
    x = -2.74 + i * 0.115; m.box(x, x + 0.11, 0.55 + 0.05 * math.sin(i * 1.7), 2.08, ZB + 0.015 + 0.012 * (i % 2), ZB + 0.03 + 0.012 * (i % 2))
m.cyl((-2.8, 2.1, ZB + 0.03), (-1.9, 2.1, ZB + 0.03), 0.012, seg=8); m.finish()
# 天花板：兩組日光燈（燈座＋燈管發光）、外露的電線管
TUBE = emit_mat('sh_tube', (0.92, 0.97, 1.0), 9.0)
m = Mesh('lamp_fix', M['white'])
for (x, z) in ((-1.2, -0.6), (1.3, 0.5), (0.0, 1.9)): m.box(x - 0.66, x + 0.66, H - 0.07, H, z - 0.09, z + 0.09)
m.finish()
m = Mesh('tubes', TUBE)
for (x, z) in ((-1.2, -0.6), (1.3, 0.5), (0.0, 1.9)):
    for dz in (-0.04, 0.04): m.cyl((x - 0.6, H - 0.085, z + dz), (x + 0.6, H - 0.085, z + dz), 0.014, seg=8)
m.finish()
m = Mesh('conduit', M['metal'])
m.cyl((X0 + 0.05, H - 0.04, -0.6), (X1 - 0.05, H - 0.04, -0.6), 0.012, seg=8); m.cyl((0.0, H - 0.04, -0.6), (0.0, H - 0.04, ZF), 0.012, seg=8)
m.cyl((X0 + 0.04, H - 0.04, -0.6), (X0 + 0.04, 1.4, -0.6), 0.012, seg=8)
m.box(X0 + 0.0, X0 + 0.04, 1.25, 1.42, -0.66, -0.54)                                   # 開關盒
m.finish()
# 牆上的工業電扇（左牆）
m = Mesh('fan', M['dark']); fx, fy, fz = X0 + 0.25, 2.45, 0.4
m.box(X0, X0 + 0.06, fy - 0.12, fy + 0.12, fz - 0.06, fz + 0.06); m.cyl((X0 + 0.06, fy, fz), (fx, fy - 0.08, fz + 0.12), 0.025, seg=8)
m.ell((fx + 0.04, fy - 0.1, fz + 0.15), 0.06, 0.24, 0.24, seg=18, rings=6)
m.finish()
m = Mesh('fan_guard', M['metal'])
for k in range(6):
    t = k / 6 * math.pi
    m.cyl((fx + 0.1, fy - 0.1 + 0.25 * math.cos(t), fz + 0.15 + 0.25 * math.sin(t)), (fx + 0.1, fy - 0.1 - 0.25 * math.cos(t), fz + 0.15 - 0.25 * math.sin(t)), 0.004, seg=5)
m.finish()
# 月曆、時鐘（後牆）、神明桌（後牆右上：紅色木架＋兩盞紅燈＋香爐；不放神像）
uvquad('calendar', (2.05, 1.55, ZB + 0.005), (2.45, 1.55, ZB + 0.005), (2.45, 2.11, ZB + 0.005), (2.05, 2.11, ZB + 0.005), img_mat('sh_cal', os.path.join(TMP, 'cal.png'), rough=0.8))
m = Mesh('clock', M['white']); m.cyl((1.0, 2.55, ZB), (1.0, 2.55, ZB + 0.04), 0.15, seg=24); m.finish()
m = Mesh('clock_rim', M['dark']); m.cyl((1.0, 2.55, ZB + 0.039), (1.0, 2.55, ZB + 0.045), 0.155, seg=24, r2=0.15); m.box(0.995, 1.005, 2.55, 2.66, ZB + 0.045, ZB + 0.05); m.box(1.0, 1.08, 2.545, 2.555, ZB + 0.045, ZB + 0.05); m.finish()
m = Mesh('shrine', M['red'])
m.box(2.45, 3.3, 2.35, 2.40, ZB, ZB + 0.38); m.box(2.45, 3.3, 2.40, 2.88, ZB, ZB + 0.02); m.box(2.45, 2.5, 2.40, 2.88, ZB, ZB + 0.3); m.box(3.25, 3.3, 2.40, 2.88, ZB, ZB + 0.3)
m.box(2.42, 3.33, 2.88, 2.93, ZB, ZB + 0.34); m.finish()
m = Mesh('shrine_burner', M['yellow']); m.cyl((2.875, 2.40, ZB + 0.2), (2.875, 2.52, ZB + 0.2), 0.07, seg=16, r2=0.08); m.finish()
SHRINE = emit_mat('sh_shrine_lamp', (1.0, 0.18, 0.12), 14.0)
m = Mesh('shrine_lamps', SHRINE)
for x in (2.58, 3.17): m.cyl((x, 2.40, ZB + 0.2), (x, 2.62, ZB + 0.2), 0.03, seg=10); m.sphere((x, 2.66, ZB + 0.2), 0.045, seg=10, rings=6)
m.finish()
# 第二版：牆上補東西（第一版牆面上半部空空的）——左牆掛的輪胎、右牆的海報、後牆的白板（進度：換胎、保養）
for k, (yy, zz) in enumerate(((2.15, -0.7), (2.15, 0.05), (1.62, -0.33), (2.15, 0.8))):
    bmt = bmesh.new(); bmesh.ops.create_cone(bmt, cap_ends=False, segments=24, radius1=0.25, radius2=0.25, depth=0.1)
    me_ = bpy.data.meshes.new('wall_tire%d' % k); bmt.to_mesh(me_); bmt.free(); me_.materials.append(M['black']); me_.polygons.foreach_set('use_smooth', [True] * len(me_.polygons))
    o_ = bpy.data.objects.new('wall_tire%d' % k, me_); sc.collection.objects.link(o_); o_.location = g2b(X0 + 0.08, yy, zz); o_.rotation_euler = (0, math.radians(90), 0)
m = Mesh('tire_pegs', M['metal'])
for (yy, zz) in ((2.15, -0.7), (2.15, 0.05), (1.62, -0.33), (2.15, 0.8)): m.cyl((X0, yy + 0.2, zz), (X0 + 0.16, yy + 0.2, zz), 0.012, seg=6)
m.finish()


def tex_poster(path):
    im = Image.new('RGB', (420, 600), (24, 52, 96)); d = ImageDraw.Draw(im)
    d.rectangle([0, 380, 420, 600], fill=(236, 186, 40)); d.ellipse([120, 120, 300, 300], fill=(210, 220, 230)); d.ellipse([170, 170, 250, 250], fill=(24, 52, 96))
    f = font(64); d.text((40, 30), '定期保養', font=f, fill=(250, 250, 250)); f2 = font(40)
    for i, t_ in enumerate(('換機油', '檢查煞車', '胎壓・胎紋')): d.text((40, 400 + i * 62), t_, font=f2, fill=(30, 30, 40))
    im.save(path)


def tex_board(path):
    im = Image.new('RGB', (700, 460), (240, 241, 238)); d = ImageDraw.Draw(im); f = font(34)
    rows = [('3/11', '125 換前胎', (30, 60, 160)), ('3/12', '保養・機油', (30, 60, 160)), ('3/12', '後煞車皮', (180, 30, 30)), ('3/13', '二手 100 整理', (30, 60, 160)), ('3/14', '電瓶', (30, 60, 160))]
    for i, (a_, b_, c_) in enumerate(rows):
        d.text((30 + nrng.integers(-4, 5), 30 + i * 80 + nrng.integers(-3, 4)), a_, font=f, fill=c_); d.text((160 + nrng.integers(-4, 5), 30 + i * 80 + nrng.integers(-3, 4)), b_, font=f, fill=c_)
    d.line([(20, 440), (680, 440)], fill=(160, 160, 160), width=3)
    im.save(path)


tex_poster(os.path.join(TMP, 'poster.png')); tex_board(os.path.join(TMP, 'board.png'))
uvquad('poster', (X1 - 0.002, 1.55, 0.2), (X1 - 0.002, 1.55, -0.32), (X1 - 0.002, 2.29, -0.32), (X1 - 0.002, 2.29, 0.2), img_mat('sh_poster', os.path.join(TMP, 'poster.png'), rough=0.6))
uvquad('board', (0.85, 1.45, ZB + 0.012), (1.75, 1.45, ZB + 0.012), (1.75, 2.04, ZB + 0.012), (0.85, 2.04, ZB + 0.012), img_mat('sh_board', os.path.join(TMP, 'board.png'), rough=0.3))
m = Mesh('board_frame', M['metal']); m.box(0.82, 1.78, 1.42, 2.07, ZB, ZB + 0.01); m.box(0.85, 1.75, 1.38, 1.42, ZB, ZB + 0.06); m.finish()

# 招牌（梁上、朝騎樓）
SIGN = img_mat('sh_sign', os.path.join(TMP, 'sign.png'), emit=0.0, rough=0.5)
uvquad('signboard', (-1.6, H - 0.40, ZF + 0.36), (1.9, H - 0.40, ZF + 0.36), (1.9, H - 0.02, ZF + 0.36), (-1.6, H - 0.02, ZF + 0.36), SIGN)
# 騎樓：柱子（二丁掛）、隔壁兩家拉下來的鐵捲門、騎樓地（磨石子）、巷子（柏油、低 15 cm）
m = Mesh('pillars', M['facade'])
for x in (X0 - 0.62, X1 + 0.02): m.box(x, x + 0.6, 0, H, ZA - 0.6, ZA)
m.finish()
m = Mesh('neighbor_shutters', M['shutter'])
m.box(X0 - 4.2, X0 - 0.62, 0, H - 0.42, ZF - 0.02, ZF + 0.02); m.box(X1 + 0.62, X1 + 4.0, 0, H - 0.42, ZF - 0.02, ZF + 0.02); m.finish()
m = Mesh('neighbor_walls', M['facade'])
m.box(X0 - 0.62, X0 - 0.12, 0, H, ZF - 0.3, ZF + 0.02); m.box(X1 + 0.12, X1 + 0.62, 0, H, ZF - 0.3, ZF + 0.02)
m.box(X0 - 4.4, X0 - 4.0, 0, H, ZA - 0.6, ZA); m.box(X1 + 3.9, X1 + 4.3, 0, H, ZA - 0.6, ZA)
m.finish()
m = Mesh('arcade_floor', M['terrazzo']); m.box(X0 - 4.5, X1 + 4.5, -0.02, 0.0, ZF + 1.2, ZA); m.box(X0 - 4.5, X0, -0.02, 0.0, ZF, ZF + 1.2); m.box(X1, X1 + 4.5, -0.02, 0.0, ZF, ZF + 1.2); m.finish()
m = Mesh('curb', M['conc']); m.box(X0 - 4.5, X1 + 4.5, -0.15, 0.0, ZA, ZA + 0.12); m.finish()
m = Mesh('street', M['asph']); m.box(X0 - 8, X1 + 8, -0.17, -0.15, ZA + 0.12, ZA + 12); m.finish()
m = Mesh('arcade_ceiling', M['conc']); m.box(X0 - 4.5, X0 - 0.12, H, H + 0.15, ZF, ZA); m.box(X1 + 0.12, X1 + 4.5, H, H + 0.15, ZF, ZA); m.finish()

# ---------------- 道具：BB-B 的機車行道具組（照 SPREAD 的位置匯入）、機車 ----------------
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(ENV2, 'bb_support', 'scooter_shop_props.glb'))
props = [o for o in bpy.data.objects if o not in before]
print('props', sorted(o.name for o in props if o.parent is None))
LIB = {}
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ENV2, 'scooter.glb'))
for o in bpy.data.objects:
    if o not in before:
        LIB[o.name.split('.')[0]] = o; o.hide_render = True; o.hide_viewport = True
for mt in bpy.data.materials:                                                    # scooter_parts 的顏色在頂點色裡
    if not mt.name.startswith('scooter_') or not mt.use_nodes: continue
    nt = mt.node_tree; bsdf = nt.nodes.get('Principled BSDF')
    for n in nt.nodes:
        if n.bl_idname == 'ShaderNodeVertexColor': n.layer_name = 'Color'
    if bsdf is not None and not bsdf.inputs['Base Color'].is_linked:
        ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Color'; nt.links.new(ca.outputs['Color'], bsdf.inputs['Base Color'])
_paint = {}


def paint_mat(hexcol):
    if hexcol not in _paint:
        mt = L.flat('scooter_paint_' + hexcol, '#ffffff', rough=0.3); nt = mt.node_tree; bsdf = nt.nodes['Principled BSDF']
        vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Color'
        mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs['Fac'].default_value = 1.0; mx.inputs['Color2'].default_value = (*B.srgb(hexcol), 1)
        nt.links.new(vc.outputs['Color'], mx.inputs['Color1']); nt.links.new(mx.outputs['Color'], bsdf.inputs['Base Color']); _paint[hexcol] = mt
    return _paint[hexcol]


def place(key, x, y, z, yaw, col):
    src = LIB[key]; root = bpy.data.objects.new(key + '_i', None); sc.collection.objects.link(root)
    root.location = g2b(x, y, z); root.rotation_euler = (0, 0, yaw)
    def dup(o, parent):
        c = o.copy(); sc.collection.objects.link(c); c.hide_render = False; c.hide_viewport = False; c.parent = parent
        if c.type == 'MESH':
            for slot in c.material_slots:
                if slot.material and slot.material.name.startswith('scooter_paint'): slot.link = 'OBJECT'; slot.material = paint_mat(col)
        c.matrix_parent_inverse.identity(); c.location = o.location if o is not src else (0, 0, 0)
        if o is src: c.rotation_euler = (0, 0, 0); c.rotation_quaternion = (1, 0, 0, 0); c.scale = (1, 1, 1)
        for ch in o.children:
            if not ch.name.endswith('_lod1') and '_lod1' not in ch.name: dup(ch, c)
    dup(src, root); return root


# 機車的長軸：scooter.glb 的車頭朝 +z（遊戲座標）。升降台沿 x：車頭朝 +x（yaw −90°）；檯面頂 0.34 m
place('scooter_S1B', -0.05, 0.34, 0.05, 0.0, '#f1f1ee')                         # 升降台上的「新機車」（白色、新款通勤）：側面朝鏡頭、車頭朝右（scooter.glb 的長軸是 x：yaw 0＝車頭朝 +x）
place('scooter_S1A', -2.0, 0.0, 4.15, math.radians(140), '#22344f')              # 騎樓停的兩台：斜停（3/4 側面）
place('scooter_S2', 2.15, 0.0, 4.3, math.radians(38), '#8f1f24')
# 拆下來的輪胎（靠著升降台）、工具箱、地上的扳手、紙箱、騎樓的安全帽
def tire_obj(name, mat, r, depth):
    bmt = bmesh.new(); bmesh.ops.create_cone(bmt, cap_ends=False, segments=28, radius1=r, radius2=r, depth=depth)
    me = bpy.data.meshes.new(name); bmt.to_mesh(me); bmt.free(); me.materials.append(mat); me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.location = g2b(1.0, 0.25, 0.75); ob.rotation_euler = (math.radians(90), math.radians(18), math.radians(35)); return ob


tire_obj('loose_tire', M['black'], 0.24, 0.11); tire_obj('loose_rim', M['metal'], 0.15, 0.09)
cap = Mesh('loose_rim_cap', M['metal'])
bmc = bmesh.new(); bmesh.ops.create_circle(bmc, cap_ends=True, segments=20, radius=0.15); cap.add_bm(bmc); bmc.free(); oc = cap.finish(uv=False)
oc.location = g2b(1.0, 0.25, 0.75); oc.rotation_euler = (math.radians(90), math.radians(18), math.radians(35))
m = Mesh('toolbox', M['red']); m.rbox(-1.25, -0.75, 0, 0.24, 0.55, 0.85, r=0.02); m.finish()
m = Mesh('toolbox_h', M['metal']); m.cyl((-1.2, 0.27, 0.7), (-0.8, 0.27, 0.7), 0.012, seg=8); m.box(-1.25, -0.75, 0.12, 0.13, 0.849, 0.856); m.finish()
m = Mesh('wrench', M['metal']); m.box(-0.55, -0.27, 0.0, 0.012, 0.95, 0.975); m.cyl((-0.27, 0.006, 0.962), (-0.27, 0.012, 0.962), 0.025, seg=10); m.finish()
m = Mesh('boxes', M['cardboard'])
m.box(-2.95, -2.45, 0.0, 0.42, -1.5, -1.1); m.box(-2.9, -2.5, 0.0, 0.30, -1.0, -0.65); m.box(-2.92, -2.5, 0.42, 0.72, -1.47, -1.12)
m.finish()
m = Mesh('helmet', M['white']); m.ell((-2.1, 0.98, 4.35), 0.13, 0.12, 0.15, seg=16, rings=8); m.finish()
m = Mesh('helmet_visor', M['dark']); m.ell((-2.1, 0.97, 4.47), 0.11, 0.06, 0.05, seg=12, rings=6); m.finish()
m = Mesh('hose', M['black'])
pts = [(1.45 + 0.35 * math.cos(t), 0.02, 0.62 + 0.45 + 0.30 * math.sin(t)) for t in np.linspace(0, 5.5, 24)]
for a_, b_ in zip(pts[:-1], pts[1:]): m.cyl(a_, b_, 0.012, seg=6)
m.finish()
# 直立的招牌燈箱（右邊柱子朝巷子那一面的上方）
VS = img_mat('sh_vsign', os.path.join(TMP, 'vsign.png'), emit=2.2, rough=0.4)
m = Mesh('vsign_box', M['metal']); m.box(X0 - 0.52, X0 - 0.12, 1.45, 3.05, ZA, ZA + 0.14); m.finish()      # 第二版：左邊柱子的正面（朝巷子、鏡頭看得到）
uvquad('vsign_face', (X0 - 0.50, 1.5, ZA + 0.141), (X0 - 0.14, 1.5, ZA + 0.141), (X0 - 0.14, 3.0, ZA + 0.141), (X0 - 0.50, 3.0, ZA + 0.141), VS)
# 對面（鏡頭後面、看得到一點點）：不做；巷子遠方用天空的光

# ---------------- 光：傍晚（天空偏藍紫、低的暖色陽光從巷口斜進來）、店裡日光燈（冷白）、升降台上的工作燈（暖）、神明燈（紅）、燈箱 ----------------
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
for t in ('NISHITA', 'MULTIPLE_SCATTERING', 'SINGLE_SCATTERING'):
    try: sky.sky_type = t; break
    except Exception: continue
try: sky.sun_elevation = math.radians(4.0); sky.sun_rotation = math.radians(250); sky.sun_disc = False
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = float(opt('--sky', '0.22'))
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sun', '2.6')); sun.data.color = (1.0, 0.62, 0.36); sun.data.angle = math.radians(1.5)
sun.rotation_euler = (math.radians(84), 0, math.radians(-128))
for (x, z) in ((-1.2, -0.6), (1.3, 0.5), (0.0, 1.9)):
    area_light('tube_l', x, H - 0.1, z, 1.25, 0.12, float(opt('--tube', '320')), (0.90, 0.96, 1.0))
point_light('work_lamp', 0.25, 1.95, 0.35, float(opt('--work', '160')), (1.0, 0.72, 0.42), 0.12)
point_light('street_lamp', -5.5, 4.4, 8.0, float(opt('--street', '700')), (1.0, 0.66, 0.38), 0.4)      # 巷子的路燈（畫面外左前方）：騎樓的機車有暖色的輪廓光
m = Mesh('work_lamp_shade', M['green']); m.cyl((0.25, 2.05, 0.35), (0.25, 1.92, 0.35), 0.03, seg=16, r2=0.14); m.cyl((0.25, 2.05, 0.35), (0.25, H, 0.35), 0.006, seg=6); m.finish()
point_light('shrine_glow', 2.875, 2.6, ZB + 0.3, 8, (1.0, 0.2, 0.12), 0.05)
point_light('vsign_glow', X0 - 0.32, 2.3, ZA + 0.5, 25, (1.0, 0.93, 0.85), 0.3)
area_light('street_bounce', -1.0, 1.4, ZA + 3.0, 6.0, 2.5, float(opt('--bounce', '120')), (0.55, 0.62, 0.9), rot=(math.radians(-90), 0, 0))   # 巷子的天空反光（藍紫）

# ---------------- 鏡頭：站在巷子邊、騎樓外緣，往店裡看（升降台在畫面中間偏左，招牌、神明燈、工具牆都看得到） ----------------
eye = tuple(map(float, opt('--eye', '0.1,1.5,9.7').split(','))); look = tuple(map(float, opt('--look', '0.25,1.25,0.0').split(',')))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(opt('--lens', '20')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, RW, RH, SAMPLES)
