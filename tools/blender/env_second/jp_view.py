"""日本交換那一學期：國際學生宿舍「你的房間」的窗景（AA_341：「宿舍的房間比想像的小。窗外是一片田，遠一點的地方有一座山。」；2D 背景 jp_room.webp：電線、瓦屋頂、一棵櫻花）。
LAWWW2-C 2026-10-21。Blender 5.2（bpy，無介面）蓋一個真的 3D 場景、Cycles 從二樓的窗口高度渲染 → 窗景照片：
  /opt/blenv/bin/python tools/blender/env_second/jp_view.py [-- --day|--night] [--sakura] [--samples 64] [--res 1024x512] [--pitch 12] [--png 資料夾]
輸出 assets/models/env/views/jp_room_{day,night}.webp（--sakura：jp_room_sakura_{day,night}.webp，櫻花開的那兩週）；1024×512、水平視角 90°（W3.windowMat 的比例，同 dorm_back_view.py）。
場景（鏡頭在原點、窗口高度 4.6 m（二樓）、往 +z 看；x 往右）：
  z 2～9     宿舍前面：草地、一條窄柏油路（白色邊線）、水泥電線桿＋電線（往兩邊拉）
  z 12～120  幾戶兩層樓的日式住宅（白、米色外牆；黑瓦屋頂 jp_kawara）、一小塊菜園、塑膠布溫室、一棵櫻花（--sakura 開花，平常綠葉）、樟樹
  z 60～900  一片田（剛犁過的土、放了水的水田、已經綠的田，一塊一塊）、田間小路、遠一點的一排房子和樹
  z 1200～   一座山（AA「遠一點的地方有一座山」）＋後面兩層比較淡的山稜
素材：樹 street_trees.glb（本作）；Poly Haven CC0（草、土、柏油、灰泥、外牆板）；瓦 jp_kawara（本作程式產生，gen_jp_textures.py）。
這是渲染成照片的背景，不進遊戲的 3D 場景。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, Vector, Matrix   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
TIMES = ['day', 'night'] if not ('--day' in ARGS or '--night' in ARGS) else (['day'] if '--day' in ARGS else ['night'])
SAKURA = '--sakura' in ARGS
RW, RH = map(int, opt('--res', '1024x512').split('x')); SAMPLES = int(opt('--samples', '64'))
OUTDIR = os.path.join(L.ROOT, opt('--out', 'assets/models/env/views')); PNG = opt('--png')
MODELS = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai')
PITCH = float(opt('--pitch', '12')); CAM_Y = 4.6; PI = math.pi
B.reset(texres=1024); sc = bpy.context.scene
def lin(h): return B.srgb(h)


def flat(name, hexcol, rough=0.7, metal=0.0):
    m = L.flat(name, hexcol, rough=rough); m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = metal; return m


def pbr(name, pid, tile, target=None, rough=None, normal=0.8):
    m = L.pbr(name, pid, tile=tile, target=target, normal=normal)
    if rough is not None:
        bs = m.node_tree.nodes['Principled BSDF']
        for lk in list(bs.inputs['Roughness'].links): m.node_tree.links.remove(lk)
        bs.inputs['Roughness'].default_value = rough
    return m


NIGHT = {}
def glow(m, hexcol, s): NIGHT[m.name] = (hexcol, s); return m


MAT = {
    'grass': pbr('jv_grass', 'leafy_grass', 3.0, target='#6f8a4c'), 'grass_far': pbr('jv_grass_far', 'leafy_grass', 12.0, target='#7a9152'),
    'soil': pbr('jv_soil', 'withered_grass', 6.0, target='#7a6249'), 'soil_d': pbr('jv_soil_d', 'withered_grass', 6.0, target='#5e4b39'),
    'paddy': flat('jv_paddy', '#5f6f72', rough=0.04), 'seed': pbr('jv_seed', 'leafy_grass', 8.0, target='#8fa85a'),
    'asphalt': pbr('jv_asphalt', 'asphalt_02', 3.0, target='#8e8e8c', rough=0.9), 'line': flat('jv_line', '#e8e6df', rough=0.6),
    'wall_w': pbr('jv_wall_w', 'white_plaster_02', 2.0, target='#e6e0d4'), 'wall_c': pbr('jv_wall_c', 'exterior_wall_cladding_02', 2.0, target='#c9b99c'),
    'wall_g': pbr('jv_wall_g', 'white_plaster_02', 2.0, target='#b8b4aa'),
    'kawara': pbr('jv_kawara', 'jp_kawara', 1.2, target='#3e4248', rough=0.45), 'kawara_b': pbr('jv_kawara_b', 'jp_kawara', 1.2, target='#4f5a66', rough=0.45),
    'win': glow(flat('jv_win', '#2b3238', rough=0.15), '#ffd9a0', 2.2), 'win_dark': flat('jv_win_d', '#2b3238', rough=0.15),
    'conc': pbr('jv_conc', 'concrete_wall_006', 2.0, target='#b9b5ab'), 'pole': flat('jv_pole', '#9d9a92', rough=0.8), 'wire': flat('jv_wire', '#202224', rough=0.6),
    'film': flat('jv_film', '#dfe6e6', rough=0.3), 'wood': flat('jv_wood', '#6b5139', rough=0.7),
    'mtn': flat('jv_mtn', '#5f7a64', rough=0.95), 'mtn2': flat('jv_mtn2', '#8798a0', rough=0.95), 'mtn3': flat('jv_mtn3', '#aab8c2', rough=0.95),
    'lamp': glow(flat('jv_lamp', '#e8e8e2', rough=0.4), '#ffe2b0', 6.0),
}
def forest(m, a, b):
    """山的樹林：兩種綠用雜訊混（一片一片的樹冠）＋越高越淡（空氣的霧）"""
    nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 0.02; nz.inputs['Detail'].default_value = 8.0
    co = N.new('ShaderNodeTexCoord'); nt.links.new(co.outputs['Object'], nz.inputs['Vector'])
    rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].color = (*lin(a), 1); rp.color_ramp.elements[1].color = (*lin(b), 1); rp.color_ramp.elements[0].position = 0.35; rp.color_ramp.elements[1].position = 0.65
    nt.links.new(nz.outputs['Fac'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], bs.inputs['Base Color'])
forest(MAT['mtn'], '#4c6a50', '#7d9474')
M = {k: Mesh('jv_' + k, m, tile=1.0) for k, m in MAT.items()}


def box(k, x0, x1, y0, y1, z0, z1): M[k].box(min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1), min(z0, z1), max(z0, z1))
def quad(k, pts): M[k].quad(pts)
def ground(k, x0, x1, z0, z1, y=0.0): quad(k, [(x0, y, z1), (x1, y, z1), (x1, y, z0), (x0, y, z0)])


def house(x, z, w, d, rng, rot=False, floors=2):
    """兩層樓的日式住宅：外牆（白灰泥／米色外牆板）、黑瓦的雙坡屋頂（屋簷出挑）、窗（晚上有的亮）、一樓的雨遮"""
    if rot: w, d = d, w
    h = 2.9 * floors; wk = rng.choice(['wall_w', 'wall_c', 'wall_w', 'wall_g']); box(wk, x - w / 2, x + w / 2, 0, h, z - d / 2, z + d / 2)
    rk = rng.choice(['kawara', 'kawara', 'kawara_b']); ov = 0.5; rh = d / 2 * 0.55
    if not rot:   # 屋脊沿 x
        for s in (-1, 1): quad(rk, [(x - w / 2 - ov, h - 0.1, z + s * (d / 2 + ov)), (x + w / 2 + ov, h - 0.1, z + s * (d / 2 + ov)), (x + w / 2 + ov, h + rh, z), (x - w / 2 - ov, h + rh, z)][::(1 if s < 0 else -1)])
        for s in (-1, 1): quad(wk, [(x + s * w / 2, h, z - d / 2), (x + s * w / 2, h, z + d / 2), (x + s * w / 2, h + rh, z), (x + s * w / 2, h + rh, z)])
    else:         # 屋脊沿 z
        for s in (-1, 1): quad(rk, [(x + s * (w / 2 + ov), h - 0.1, z - d / 2 - ov), (x + s * (w / 2 + ov), h - 0.1, z + d / 2 + ov), (x, h + rh, z + d / 2 + ov), (x, h + rh, z - d / 2 - ov)][::(1 if s > 0 else -1)])
        for s in (-1, 1): quad(wk, [(x - w / 2, h, z + s * d / 2), (x + w / 2, h, z + s * d / 2), (x, h + rh, z + s * d / 2), (x, h + rh, z + s * d / 2)])
    zf = z - d / 2 - 0.02   # 朝鏡頭那一面（−z）的窗
    for fl in range(floors):
        for k in range(max(1, int(w / 2.2))):
            wx = x - w / 2 + (k + 0.5) * w / max(1, int(w / 2.2)); lit = rng.random() < 0.45
            box('win' if lit else 'win_dark', wx - 0.55, wx + 0.55, fl * 2.9 + 0.9, fl * 2.9 + 2.1, zf - 0.02, zf)
    box(rk, x - w / 2 - 0.1, x + w / 2 + 0.1, 2.5, 2.6, zf - 0.7, zf)


def pole(x, z, h=9.0):
    M['pole'].cyl((x, 0, z), (x, h, z), 0.16, seg=10, r2=0.12)
    box('pole', x - 0.9, x + 0.9, h - 0.6, h - 0.5, z - 0.06, z + 0.06)
    return [(x - 0.8, h - 0.45, z), (x, h - 0.45, z), (x + 0.8, h - 0.45, z), (x, h - 1.4, z)]


def wire(a, b, sag=0.35, n=10):
    pts = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t) for t in [i / n for i in range(n + 1)]]
    for p, q in zip(pts[:-1], pts[1:]): M['wire'].cyl(p, q, 0.012, seg=4)


def ridge(k, z, h0, h1, seed, x0=-4000, x1=4000, n=120, peak=None):
    rr = random.Random(seed); pts = []
    for i in range(n + 1):
        t = i / n; xx = x0 + (x1 - x0) * t
        hh = h0 + (h1 - h0) * (0.5 + 0.5 * math.sin(t * 7.3 + seed)) * (0.6 + 0.4 * math.sin(t * 23.1 + seed * 2)) + rr.uniform(-10, 10)
        if peak: px, ph, pw = peak; hh = max(hh, ph * math.exp(-((xx - px) / pw) ** 2) + rr.uniform(-6, 6))
        pts.append((xx, max(15.0, hh)))
    for (xa, ha), (xb, hb) in zip(pts[:-1], pts[1:]): quad(k, [(xb, -5, z), (xa, -5, z), (xa, ha, z + 80), (xb, hb, z + 80)])


rng = random.Random(21)
# 近景：草地、宿舍前的窄路、電線桿
ground('grass', -60, 60, 0, 6.0); ground('asphalt', -80, 80, 6.0, 10.0, 0.02); ground('grass', -80, 80, 10.0, 14.0)
for zz in (6.15, 9.85): box('line', -80, 80, 0.025, 0.03, zz - 0.06, zz + 0.06)
tops = [pole(x, 10.6) for x in (-26.0, 6.0, 38.0)]
for a, b in zip(tops[:-1], tops[1:]):
    for i in range(3): wire(a[i], b[i])
for t in tops: wire(t[3], (t[3][0] + 3, 6.0, 1.0), sag=0.2)   # 拉到宿舍那一邊的線（往鏡頭這邊來）
LAMP_P = []
for t in tops:   # 電線桿上的路燈（燈罩晚上亮）
    p = (t[1][0] + 0.9, t[1][1] - 2.4, t[1][2] - 0.4); box('lamp', p[0] - 0.25, p[0] + 0.25, p[1] - 0.05, p[1] + 0.05, p[2] - 0.12, p[2] + 0.12); LAMP_P.append(p)
# 中景：住宅、菜園、溫室、樹
for (x, z, w, d, r) in ((-30, 24, 9, 7, False), (-14, 30, 8, 8, True), (15, 22, 10, 7, False), (32, 34, 8, 9, True), (-46, 46, 9, 7, False), (52, 50, 9, 8, False), (2, 58, 8, 7, True)):
    ground('grass', x - w / 2 - 2, x + w / 2 + 2, z - d / 2 - 2, z + d / 2 + 2, 0.01); house(x, z, w, d, rng, r)
for k in range(9): ground('soil_d' if k % 2 else 'soil', -6 + k * 1.2, -6 + k * 1.2 + 0.9, 16, 36, 0.015)   # 菜園的畦
M['film'].cyl((22, 0, 42), (22, 0, 60), 2.2, seg=16)   # 溫室（半圓：下半埋在地裡）
ground('grass', -200, 200, 14, 60, -0.01)
# 遠一點：一塊一塊的田（犁過的土／放了水的水田／已經綠的田），田間小路
FIELD = ['soil', 'paddy', 'paddy', 'seed', 'soil_d', 'paddy', 'seed']
for i in range(-14, 15):
    for j in range(0, 14):
        x0 = i * 28 + rng.uniform(-2, 2); z0 = 62 + j * 34 * (1 + j * 0.08); ground(rng.choice(FIELD), x0, x0 + 26, z0, z0 + 32 * (1 + j * 0.08), 0.0)
        box('conc', x0 + 26, x0 + 28, -0.05, 0.08, z0, z0 + 32 * (1 + j * 0.08))
ground('grass_far', -3000, 3000, 900, 1500, -0.2)
for k in range(26):   # 遠處的一排房子和樹（田的盡頭）
    x = -700 + k * 55 + rng.uniform(-15, 15); house(x, 950 + rng.uniform(-30, 30), 9, 8, rng, rng.random() < 0.5)
# 再遠一點的村子：幾叢房子＋樹（田不會一路平到山腳）
VILL = []
for (cx, cz, n) in ((-260, 330, 7), (120, 420, 9), (420, 300, 6), (-520, 520, 8), (300, 640, 7)):
    for k in range(n):
        x = cx + rng.uniform(-60, 60); z = cz + rng.uniform(-30, 30); house(x, z, rng.uniform(8, 11), rng.uniform(7, 9), rng, rng.random() < 0.5); VILL.append((x + rng.uniform(-8, 8), z + rng.uniform(6, 14)))
# 山：一座比較近、比較高的山（AA「遠一點的地方有一座山」）——高度場的網格（不是一個錐）：主峰偏左、右邊一個小峰、山腰起伏；
# 樹林的顏色用程序化雜訊（這是渲染成照片的背景，不是遊戲的材質）；後面兩層淡的山稜
def mountain(k, cx, cz, rx, rz, hmax, seed, nx=60, nz=30):
    rr = random.Random(seed); ph = [rr.uniform(0, 6.28) for _ in range(6)]; bm_ = M[k].bm; vs = []
    for i in range(nx + 1):
        row = []
        for j in range(nz + 1):
            u = i / nx * 2 - 1; v = j / nz * 2 - 1; x = cx + u * rx; z = cz + v * rz
            r = (u * u + v * v * 1.6); base = max(0.0, 1 - r) ** 1.4
            h = hmax * base * (0.78 + 0.12 * math.sin(u * 4.1 + ph[0]) + 0.08 * math.sin(u * 9.3 + v * 5 + ph[1]) + 0.05 * math.sin(u * 21 + ph[2]))
            h += hmax * 0.35 * math.exp(-((u - 0.55) ** 2 / 0.03 + (v + 0.1) ** 2 / 0.08))   # 右邊的小峰
            row.append(bm_.verts.new(g2b(x, max(-4.0, h - 4), z)))
        vs.append(row)
    for i in range(nx):
        for j in range(nz): bm_.faces.new((vs[i][j], vs[i][j + 1], vs[i + 1][j + 1], vs[i + 1][j]))
mountain('mtn', 180, 1700, 1300, 520, 430, 3)
ridge('mtn2', 2600, 160, 330, 7); ridge('mtn3', 3600, 260, 520, 11)

# 樹（本作的 Blender 模型）：樟樹幾棵＋路邊一棵櫻花（--sakura 開花）
def import_glb(fn, keep):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS, fn)); new = [o for o in bpy.data.objects if o not in before]; out = {}
    for name, parts in keep.items():
        col = bpy.data.collections.new('src_' + name); sc.collection.children.link(col)
        for o in new:
            if o.type == 'MESH' and o.name.split('.')[0] in parts:
                for c_ in list(o.users_collection): c_.objects.unlink(o)
                col.objects.link(o); o.parent = None; o.matrix_world = Matrix.Identity(4)
        out[name] = col
    for o in new:
        if not any(o.name in col.objects for col in out.values()): bpy.data.objects.remove(o, do_unlink=True)
    for col in out.values(): bpy.context.view_layer.layer_collection.children[col.name].exclude = True
    return out


def place(col, x, y, z, ry=0.0, s=1.0):
    e = bpy.data.objects.new('i_' + col.name, None); e.instance_type = 'COLLECTION'; e.instance_collection = col; sc.collection.objects.link(e)
    e.location = g2b(x, y, z); e.rotation_euler = (0, 0, ry); e.scale = (s, s, s); return e


TREES = import_glb('street_trees.glb', {'camphor_a': ['camphor_a_bark', 'camphor_a_leaf'], 'camphor_b': ['camphor_b_bark', 'camphor_b_leaf']})
for m in bpy.data.materials:
    if m.name.startswith('tree_'): m.use_backface_culling = False
SAK = bpy.data.collections.new('src_sakura'); sc.collection.children.link(SAK); bpy.context.view_layer.layer_collection.children[SAK.name].exclude = True
for o in TREES['camphor_b'].objects:   # 櫻花：樟樹的樹形，換葉子的顏色（開花：粉白；平常：綠葉）
    c2 = o.copy(); c2.data = o.data.copy(); SAK.objects.link(c2)
    for i, mt in enumerate(c2.data.materials):
        if mt and 'leaf' in mt.name and SAKURA:
            cp = mt.copy(); cp.name = 'jv_sakura_leaf'; bs = cp.node_tree.nodes.get('Principled BSDF')
            mix = cp.node_tree.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
            src = bs.inputs['Base Color'].links[0].from_socket if bs.inputs['Base Color'].links else None
            if src:
                hsv = cp.node_tree.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = 0.0; hsv.inputs['Value'].default_value = 1.6
                cp.node_tree.links.new(src, hsv.inputs['Color']); cp.node_tree.links.new(hsv.outputs['Color'], mix.inputs[6])
                mix.inputs[7].default_value = (*lin('#f3c6d3'), 1); cp.node_tree.links.new(mix.outputs[2], bs.inputs['Base Color'])
            c2.data.materials[i] = cp
place(SAK, -7.5, 0, 12.5, 0.8, 0.62)
for (x, z, s) in ((-38, 36, 0.9), (27, 28, 0.8), (60, 70, 1.0), (-70, 80, 1.1), (8, 75, 0.85)): place(TREES['camphor_a' if x < 0 else 'camphor_b'], x, 0, z, rng.uniform(0, 6), s)
for (x, z) in VILL: place(TREES['camphor_a' if rng.random() < 0.5 else 'camphor_b'], x, 0, z, rng.uniform(0, 6), rng.uniform(0.9, 1.3))   # 村子的樹
for k, m in M.items(): m.finish()

# 光、天空、鏡頭（同 dorm_back_view.py）
def sun_vec(az, el):
    a, e = math.radians(az), math.radians(el); return Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))


world = bpy.data.worlds.new('jv_world'); sc.world = world; world.use_nodes = True; WN = world.node_tree.nodes; WL = world.node_tree.links
bg = WN['Background']; sky = WN.new('ShaderNodeTexSky'); sky.sky_type = 'HOSEK_WILKIE'; sky.turbidity = 3.0; sky.ground_albedo = 0.3
tc = WN.new('ShaderNodeTexCoord'); sep = WN.new('ShaderNodeSeparateXYZ'); WL.new(tc.outputs['Generated'], sep.inputs[0])
ramp = WN.new('ShaderNodeValToRGB'); WL.new(sep.outputs['Z'], ramp.inputs['Fac']); E_ = ramp.color_ramp.elements
E_[0].position = 0.0; E_[0].color = (*lin('#2c3046'), 1); E_[1].position = 0.32; E_[1].color = (*lin('#070b1c'), 1); e2 = E_.new(0.08); e2.color = (*lin('#151a30'), 1)
sun = bpy.data.objects.new('jv_sun', bpy.data.lights.new('jv_sun', 'SUN')); sc.collection.objects.link(sun); sun.data.angle = math.radians(1.2)
lamps = []
for i, p in enumerate(LAMP_P):
    lt = bpy.data.objects.new('jv_l%d' % i, bpy.data.lights.new('jv_l%d' % i, 'POINT')); lt.location = g2b(p[0], p[1] - 0.2, p[2]); sc.collection.objects.link(lt); lt.data.color = (1.0, 0.85, 0.6); lamps.append(lt)
cam = bpy.data.objects.new('jv_cam', bpy.data.cameras.new('jv_cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.angle = math.radians(90.0); cam.data.clip_start = 0.1; cam.data.clip_end = 8000
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 64
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception as e: print('view', e)
# 霧（遠處變淡）：世界的體積散射太慢，改成依距離把遠的材質調淡（山已經是淡的顏色）；田的遠處用 grass_far


def set_time(t):
    night = t == 'night'
    for lk in list(bg.inputs['Color'].links): WL.remove(lk)
    if night:
        WL.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.6
        sun.data.energy = 0.08; sun.data.color = (0.7, 0.78, 1.0); sun.rotation_euler = (-sun_vec(160, 35)).to_track_quat('-Z', 'Y').to_euler()
        for lt in lamps: lt.data.energy = 900
        sc.view_settings.exposure = 0.7
    else:
        WL.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 1.2
        sv = sun_vec(200, 42); sky.sun_direction = sv; sun.data.energy = 3.4; sun.data.color = (1.0, 0.97, 0.92); sun.rotation_euler = (-sv).to_track_quat('-Z', 'Y').to_euler()
        for lt in lamps: lt.data.energy = 0.0
        sc.view_settings.exposure = 0.8
    for m in bpy.data.materials:
        bs = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
        if bs and m.name in NIGHT:
            col, s = NIGHT[m.name]; bs.inputs['Emission Color'].default_value = (*lin(col), 1); bs.inputs['Emission Strength'].default_value = s if night else 0.0


os.makedirs(OUTDIR, exist_ok=True); info = {}
for t in TIMES:
    set_time(t); P_ = math.radians(PITCH)
    cam.location = g2b(0, CAM_Y, 0); cam.rotation_euler = (g2b(0, math.sin(P_), math.cos(P_)) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
    name = 'jp_room%s_%s' % ('_sakura' if SAKURA else '', t)
    png = os.path.join(PNG, name + '.png') if PNG else os.path.join(OUTDIR, '_' + name + '.png')
    if PNG: os.makedirs(PNG, exist_ok=True)
    sc.render.filepath = png; bpy.ops.render.render(write_still=True)
    out = os.path.join(OUTDIR, name + '.webp'); Image.open(png).convert('RGB').save(out, 'WEBP', quality=80, method=6)
    if not PNG: os.remove(png)
    info[name] = {'webp': os.path.relpath(out, L.ROOT), 'bytes': os.path.getsize(out)}; print('wrote', info[name], flush=True)
print(json.dumps({'samples': SAMPLES, 'res': [RW, RH], 'pitch': PITCH, 'sakura': SAKURA, 'out': info}, ensure_ascii=False))
