"""美國：C 棟 208 臥室 C（學姊的房間）的窗景（AA_399 第 8 節：「窗戶對著一棵樹，和她臺灣研究室的位子一樣」）。
LAWWW2-B 2026-10-24。Blender 5.2（bpy，無介面）把遊戲的社區戶外（us_community.glb，區域 us_outside）載進來、Cycles 從 C 棟背面二樓的窗口渲染 → 窗景照片：
  /opt/blenv/bin/python tools/blender/env_second/us_bed_c_view.py [-- --season summer|autumn|bare|snow|all] [--day|--night] [--samples 64] [--res 1024x512] [--pitch 7] [--png 資料夾]
輸出 assets/models/env/views/us_bed_c_<季節>_{day,night}.webp；1024×512、水平視角 90°（W3.windowMat 的比例，同 jp_view.py）。
  季節＝us3d.js 的 usSeasonKey()：summer 夏末、autumn 秋天、bare 初冬、snow 雪（交換在 2028/8/2～12/23，四季都會看到）。
  用 us_community.glb 的四季約定（tools/blender/env_second/us_season.py）：SEASON_MATS 底下的「<原材質名>__S_<季節>」換掉原材質、SEASON_GEO_* 照 seasons 屬性開關（開關的是它底下的網格）。
鏡頭：C 棟（配置 buildings 的 C：cx 33.5、長 26 沿 z、背面 x 40 朝東）背面外 0.6 m、z 13.5（樓梯間 z 5.8～10.2 的南邊那一戶）、二樓窗口高度 4.4 m，往東（+x）看、仰 7°。
  臥室 C 的窗在房間的東牆（us_bed_c.py），和 C 棟背面同一個方向。
窗外（C 棟背面：遊戲裡哪裡都看不到，渲染的時候自己補）：
  - 拿掉配置 blocks 的「forest belt E」（x 39.5～42）在窗前那一段（鏡頭本來在樹帶裡，窗前全是暗的樹幹）；
  - 草地（社區的 usc_grass，四季照換）、一條水泥步道、兩盞步道路燈（晚上亮）；
  - 窗前 7.4 m 一棵大樹：複製社區配置 trees 的 (12.4, 21.1) 那一棵（葉片卡、樹幹、冬天的細枝，材質四季照換）；
  - 遠一點四排樹林（同樣從社區的大樹複製、轉向、放大）。
  - 樹冠裡近黑色的實心（usc_tree_core，遊戲裡擋住樹冠的透空）渲染時藏起來：路徑追蹤會從葉片的縫看到一團一團黑的。
  - 太陽在南（中午過後）：在西的話 C 棟的影子蓋住窗前的樹；晚上 C 棟牆上一盞燈照到樹冠。
這是渲染成照片的背景，不進遊戲的 3D 場景。社區的樹（us_community.glb）改了要重拍。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
TIMES = ['day', 'night'] if not ('--day' in ARGS or '--night' in ARGS) else (['day'] if '--day' in ARGS else ['night'])
SEASONS = ['summer', 'autumn', 'bare', 'snow'] if opt('--season', 'all') == 'all' else [opt('--season')]
RW, RH = map(int, opt('--res', '1024x512').split('x')); SAMPLES = int(opt('--samples', '64'))
OUTDIR = os.path.join(L.ROOT, opt('--out', 'assets/models/env/views')); PNG = opt('--png')
GLB = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'us_community.glb')
J = json.load(open(os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'us_community.layout.json'), encoding='utf-8'))
PITCH = float(opt('--pitch', '7')); CAM = tuple(map(float, opt('--cam', '40.6,4.4,13.5').split(','))); YAW = math.radians(float(opt('--yaw', '90'))); PI = math.pi   # --cam／--yaw（度，0＝往 +z）：除錯用
def lin(h): return B.srgb(h)


B.reset(texres=1024); sc = bpy.context.scene
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); objs = [o for o in bpy.data.objects if o not in before]
car = next((o for o in objs if o.name.split('.')[0] == 'SEASON_MATS'), None)
inCar = set()
if car:
    stack = [car]
    while stack:
        o = stack.pop(); inCar.add(o); stack.extend(o.children)
SW = {}   # 原材質名 → {季節: 材質}
for o in inCar:
    if o.type != 'MESH': continue
    for m in o.data.materials:
        n = (m.name if m else '') or ''; i = n.rfind('__S_')
        if i >= 0: SW.setdefault(n[:i], {})[n[i + 4:].split('.')[0]] = m
for o in inCar: o.hide_render = True
def kids(o):
    out, st = [], list(o.children)
    while st:
        k = st.pop(); out.append(k); st.extend(k.children)
    return out


GEOP = {}   # 網格 → 只在哪幾季看得到（SEASON_GEO_* 是空物件、網格是它的子物件：Cycles 不會因為父物件隱藏就不畫子物件）
for o in objs:
    if o not in inCar and o.get('seasons') is not None:
        for k in kids(o): GEOP[k] = str(o.get('seasons'))
CORE = [o for o in objs if o not in inCar and o.type == 'MESH' and 'tree_core' in o.name]   # 樹冠裡面那一團近黑色的實心（遊戲裡擋住樹冠的透空）：路徑追蹤會從葉片的縫看到一團一團黑的，渲染照片不要
TREEM = [o for o in objs if o not in inCar and o.type == 'MESH' and o.name.split('.')[0] in ('usc_tree_cards_a', 'usc_tree_cards_b', 'usc_tree_cards_c', 'usc_trunks', 'usc_twig_inner')]


def copy_tree(src, dst, R=4.5, s=1.0, ry=0.0):
    """把社區裡的一棵樹（配置 trees 的位置 src＝(x, z)）複製到 dst：只留面中心離樹幹 R 以內的（葉片卡、樹幹、冬天的細枝），
    繞樹幹轉 ry、放大 s；材質和原本一樣（四季照樣換）"""
    S = g2b(src[0], 0, src[1]); D = g2b(dst[0], 0, dst[1]); out = []
    for o in TREEM:
        me = o.data.copy(); ob = bpy.data.objects.new(o.name + '_cp', me); sc.collection.objects.link(ob)
        bm_ = bmesh.new(); bm_.from_mesh(me); bm_.transform(o.matrix_world)
        dead = [f for f in bm_.faces if math.hypot(f.calc_center_median().x - S.x, f.calc_center_median().y - S.y) > R]
        bmesh.ops.delete(bm_, geom=dead, context='FACES')
        Mx = Matrix.Translation(D) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Scale(s, 4) @ Matrix.Translation(-S)
        bm_.transform(Mx); bm_.to_mesh(me); bm_.free()
        if o in GEOP: GEOP[ob] = GEOP[o]
        out.append(ob)
    return out


def prune(z0, z1, x0=39.3):
    """拿掉東邊那條樹帶（配置 blocks 的 forest belt E：x 39.5～42）在窗前那一段：C 棟背面，遊戲裡哪裡都看不到；留著的話鏡頭在樹帶裡、窗前全是暗的樹幹和樹冠底"""
    n = 0
    for o in TREEM + CORE + [q for q in objs if q.type == 'MESH' and q.name.split('.')[0] in ('usc_shrub_cards', 'usc_shrub_core', 'usc_leaf_litter')]:
        bm_ = bmesh.new(); bm_.from_mesh(o.data); M_ = o.matrix_world
        dead = [f for f in bm_.faces if (lambda c: c.x > x0 and z0 < -c.y < z1)(M_ @ f.calc_center_median())]
        n += len(dead); bmesh.ops.delete(bm_, geom=dead, context='FACES'); bm_.to_mesh(o.data); bm_.free()
    return n


print('pruned belt faces', prune(CAM[2] - 45, CAM[2] + 45), flush=True)
# 窗外：C 棟東邊（背面，遊戲裡走不到、看不到的那一側）——草地、一條小路、正前方一棵大樹、遠一點一排樹林
BIG = [(t['x'], t['z'], t['h']) for t in J['trees'] if t['kind'] == 'big' and t['x'] < 39.0]   # 東邊樹帶裡那棵已經拿掉了
HERO = (12.357, 21.142)   # 拿這一棵（高 15 m，旁邊的樹最遠）當窗前的樹
copy_tree(HERO, (CAM[0] + 7.4, CAM[2] - 1.6), R=4.2)   # 離窗 7.4 m、偏左一點（太近只看得到樹幹）
rr = __import__('random').Random(208)
for row, (x0, n, s0) in enumerate(((72, 11, 1.0), (82, 13, 1.1), (96, 16, 1.25), (115, 20, 1.4))):   # 東邊的樹林：四排、越遠越大越密（前兩排看得到樹幹，後面是一片樹冠）
    for k in range(n):
        x = x0 + rr.uniform(-3, 3); z = CAM[2] - 85 + (k + 0.5) * 170 / n + rr.uniform(-4, 4)
        t = BIG[rr.randrange(len(BIG))]; copy_tree((t[0], t[1]), (x, z), R=4.2, s=s0 * rr.uniform(0.9, 1.15), ry=rr.uniform(0, 6.28))
grass = bpy.data.materials.get('usc_grass'); conc = bpy.data.materials.get('usc_concrete')
def plane(name, mat, x0, x1, z0, z1, y=0.0):
    me = bpy.data.meshes.new(name); bm_ = bmesh.new()
    vs = [bm_.verts.new(g2b(x, y, z)) for (x, z) in ((x0, z0), (x0, z1), (x1, z1), (x1, z0))]; bm_.faces.new(vs)
    uv = bm_.loops.layers.uv.new()
    for f in bm_.faces:
        for lp in f.loops: co = lp.vert.co; lp[uv].uv = (co.x / 4.0, co.y / 4.0)
    bm_.to_mesh(me); bm_.free(); me.materials.append(mat); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob
plane('ubv_lawn', grass, 42.0, 600.0, -400.0, 400.0)
plane('ubv_path', conc, 55.0, 56.6, -400.0, 400.0, 0.02)   # 樹林前一條水泥步道
LAMPS = []
for lz in (CAM[2] - 9.0, CAM[2] + 16.0):   # 步道旁的路燈（社區的美式路燈：深古銅色桿＋鞋盒燈頭；晚上亮）
    me = bpy.data.meshes.new('ubv_lamp'); bm_ = bmesh.new()
    bmesh.ops.create_cone(bm_, cap_ends=True, segments=10, radius1=0.07, radius2=0.05, depth=4.2, matrix=Matrix.Translation(g2b(57.2, 2.1, lz)))
    bmesh.ops.create_cube(bm_, size=1.0, matrix=Matrix.Translation(g2b(57.2, 4.25, lz)) @ Matrix.Diagonal((0.5, 0.32, 0.14, 1.0)))
    bm_.to_mesh(me); bm_.free(); me.materials.append(bpy.data.materials.get('usc_bronze_parts') or grass); ob = bpy.data.objects.new('ubv_lamp', me); sc.collection.objects.link(ob)
    gl = bpy.data.materials.new('ubv_lamp_glow'); gl.use_nodes = True; bs = gl.node_tree.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (*lin('#fff1d6'), 1); bs.inputs['Emission Color'].default_value = (*lin('#ffd9a0'), 1)
    me2 = bpy.data.meshes.new('ubv_lamp_lens'); bm_ = bmesh.new(); bmesh.ops.create_cube(bm_, size=1.0, matrix=Matrix.Translation(g2b(57.2, 4.08, lz)) @ Matrix.Diagonal((0.44, 0.28, 0.02, 1.0))); bm_.to_mesh(me2); bm_.free()
    me2.materials.append(gl); ob2 = bpy.data.objects.new('ubv_lamp_lens', me2); sc.collection.objects.link(ob2)
    lt = bpy.data.objects.new('ubv_lampL', bpy.data.lights.new('ubv_lampL', 'SPOT')); lt.data.spot_size = math.radians(120); lt.data.color = (1.0, 0.84, 0.6); lt.location = g2b(57.2, 4.0, lz); lt.rotation_euler = (0, 0, 0); sc.collection.objects.link(lt)
    LAMPS.append((lt, bs))

for o in CORE: o.hide_render = True
SLOTS = []   # (物件, 第幾個材質, 原材質)
for o in bpy.data.objects:
    if o in inCar or o.type != 'MESH': continue
    for i, m in enumerate(o.data.materials):
        if m and m.name.split('.')[0] in SW: SLOTS.append((o, i, m))
for m in bpy.data.materials:
    if m.name.startswith('usc_leaf') or 'leaf' in m.name: m.use_backface_culling = False
print('season swaps', len(SW), 'slots', len(SLOTS), 'geo', len(GEOP), flush=True)


def set_season(key):
    for o, i, m0 in SLOTS: o.data.materials[i] = SW[m0.name.split('.')[0]].get(key, m0)
    for o, s_ in GEOP.items(): o.hide_render = key not in s_.split(',') or o in CORE


# 光、天空、鏡頭（同 jp_view.py）
def sun_vec(az, el):
    a, e = math.radians(az), math.radians(el); return Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))


world = bpy.data.worlds.new('ubv_world'); sc.world = world; world.use_nodes = True; WN = world.node_tree.nodes; WL = world.node_tree.links
bg = WN['Background']; sky = WN.new('ShaderNodeTexSky'); sky.sky_type = 'HOSEK_WILKIE'; sky.turbidity = 3.0; sky.ground_albedo = 0.3
tc = WN.new('ShaderNodeTexCoord'); sep = WN.new('ShaderNodeSeparateXYZ'); WL.new(tc.outputs['Generated'], sep.inputs[0])
ramp = WN.new('ShaderNodeValToRGB'); WL.new(sep.outputs['Z'], ramp.inputs['Fac']); E_ = ramp.color_ramp.elements
E_[0].position = 0.0; E_[0].color = (*lin('#2c3046'), 1); E_[1].position = 0.32; E_[1].color = (*lin('#070b1c'), 1); e2 = E_.new(0.08); e2.color = (*lin('#151a30'), 1)
sun = bpy.data.objects.new('ubv_sun', bpy.data.lights.new('ubv_sun', 'SUN')); sc.collection.objects.link(sun); sun.data.angle = math.radians(1.2)
wall = bpy.data.objects.new('ubv_wallpack', bpy.data.lights.new('ubv_wallpack', 'AREA')); sc.collection.objects.link(wall)   # C 棟南端一樓牆上的燈（晚上照到樹幹和草地）
wall.data.size = 0.4; wall.data.color = (1.0, 0.86, 0.62); wall.location = g2b(40.3, 2.6, 7.2); wall.rotation_euler = (g2b(1, -0.5, 0) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
cam = bpy.data.objects.new('ubv_cam', bpy.data.cameras.new('ubv_cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.angle = math.radians(90.0); cam.data.clip_start = 0.1; cam.data.clip_end = 3000
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 64
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception as e: print('view', e)
GLOWS = {m: m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value for m in bpy.data.materials if m.name.startswith('GLOW_') and m.use_nodes and m.node_tree.nodes.get('Principled BSDF')}   # 原本的發光強度（晚上照原樣、白天關掉）


def set_time(t, season):
    night = t == 'night'
    for lk in list(bg.inputs['Color'].links): WL.remove(lk)
    if night:
        WL.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.6
        sun.data.energy = 0.14; sun.data.color = (0.7, 0.78, 1.0); sun.rotation_euler = (-sun_vec(160, 35)).to_track_quat('-Z', 'Y').to_euler()
        wall.data.energy = 420; sc.view_settings.exposure = 1.5
        for lt, bs in LAMPS: lt.data.energy = 2600; bs.inputs['Emission Strength'].default_value = 8.0
    else:
        WL.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 1.0 if season == 'snow' else 1.2
        az, el = {'summer': (205, 55), 'autumn': (198, 40), 'bare': (190, 30), 'snow': (186, 25)}[season]; sv = sun_vec(az, el)   # 中午過後、太陽在南（太陽在西的話 C 棟的影子蓋住窗前的樹）；入秋以後比較低
        sky.sun_direction = sv; sun.data.energy = 2.4 if season == 'snow' else 3.2; sun.data.color = (1.0, 0.97, 0.92); sun.rotation_euler = (-sv).to_track_quat('-Z', 'Y').to_euler()
        wall.data.energy = 0.0; sc.view_settings.exposure = 0.55 if season == 'snow' else 0.8
        for lt, bs in LAMPS: lt.data.energy = 0.0; bs.inputs['Emission Strength'].default_value = 0.0
    for m, e0 in GLOWS.items(): m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = e0 if night else 0.0


os.makedirs(OUTDIR, exist_ok=True); info = {}
for s in SEASONS:
    set_season(s)
    for t in TIMES:
        set_time(t, s); P_ = math.radians(PITCH)
        cam.location = g2b(*CAM); cam.rotation_euler = (g2b(math.sin(YAW) * math.cos(P_), math.sin(P_), math.cos(YAW) * math.cos(P_)) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
        name = 'us_bed_c_%s_%s' % (s, t)
        png = os.path.join(PNG, name + '.png') if PNG else os.path.join(OUTDIR, '_' + name + '.png')
        if PNG: os.makedirs(PNG, exist_ok=True)
        sc.render.filepath = png; bpy.ops.render.render(write_still=True)
        out = os.path.join(OUTDIR, name + '.webp'); Image.open(png).convert('RGB').save(out, 'WEBP', quality=80, method=6)
        if not PNG: os.remove(png)
        info[name] = {'webp': os.path.relpath(out, L.ROOT), 'bytes': os.path.getsize(out)}; print('wrote', info[name], flush=True)
print(json.dumps({'samples': SAMPLES, 'res': [RW, RH], 'pitch': PITCH, 'cam': CAM, 'out': info}, ensure_ascii=False))
