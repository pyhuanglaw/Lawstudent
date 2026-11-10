"""美國交換：法學院 Room 120 階梯教室的窗景（US-CLASSROOM-3D-1110，LAWWW2 帳號 A 2026-11-10；AA_740 第 1 節「高窗」）。
從 C 棟臥室的窗景腳本（us_bed_c_view.py，LAWWW2-B 10-24）改：Blender 5.2（bpy，無介面）把遊戲的美國校園（us_campus.glb，區域 us_campus）載進來、Cycles 渲染 → 窗景照片：
  /opt/blenv/bin/python tools/blender/env_second/us_classroom_view.py [-- --season summer|autumn|bare|snow|all] [--day|--night] [--samples 64] [--res 1024x512] [--pitch 8] [--png 資料夾]
輸出 assets/models/env/views/us_cls120_<季節>_{day,night}.webp；1024×512、水平視角 90°（W3.windowMat 的比例）。
  季節＝us3d.js 的 usSeasonKey()：summer、autumn、bare、snow（交換 2028/8/2～12/23）；us_campus.glb 的四季約定同社區（SEASON_MAT_* 的「<原材質名>__S_<季節>」、SEASON_GEO_* 的 seasons）。
鏡頭：法學院南面（塔的正面 z 4）東翼外、二樓窗口高度 4.2 m（教室是高窗）、x 16.8（x 12 正前方是一棵行道樹，樹幹擋在畫面中間；16.8 在兩棵樹中間），往南（+z）看、仰 8°：看得到法學院前的馬路、對面的紅磚老建築、行道樹。
  教室室內的窗在西牆（us_classroom_layout.js windows.wall left），玩家在室內看不出外面的方向；選往南是因為往西（x −36）正好在校門後面的樹林裡、整片暗的樹幹。
這是渲染成照片的背景，不進遊戲的 3D 場景。美國校園（us_campus.glb）改了要重拍。"""
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
GLB = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'us_campus.glb')
PITCH = float(opt('--pitch', '8')); CAM = tuple(map(float, opt('--cam', '16.8,4.2,4.0').split(','))); YAW = math.radians(float(opt('--yaw', '0'))); PI = math.pi   # --cam／--yaw（度，0＝往 +z）：除錯用
def lin(h): return B.srgb(h)


B.reset(texres=1024); sc = bpy.context.scene
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); objs = [o for o in bpy.data.objects if o not in before]
car = next((o for o in objs if o.name.split('.')[0] == 'SEASON_MATS'), None)
inCar = set()
if car:
    stack = [car]
    while stack:
        o = stack.pop(); inCar.add(o); stack.extend(o.children)
for o in objs:   # 美國校園（us_campus.glb）的季節材質是一個一個的 SEASON_MAT_* 節點（社區是一個 SEASON_MATS 底下）
    if o.name.split('.')[0].startswith('SEASON_MAT_'): inCar.add(o); inCar.update(o.children_recursive)
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
wall = bpy.data.objects.new('ubv_wallpack', bpy.data.lights.new('ubv_wallpack', 'AREA')); sc.collection.objects.link(wall); LAMPS = []   # C 棟南端一樓牆上的燈（晚上照到樹幹和草地）
wall.data.size = 0.4; wall.data.energy = 0; wall.data.color = (1.0, 0.86, 0.62); wall.location = g2b(40.3, 2.6, 7.2); wall.rotation_euler = (g2b(1, -0.5, 0) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
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
        wall.data.energy = 0.0; sc.view_settings.exposure = 1.5
    else:
        WL.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 1.0 if season == 'snow' else 1.2
        az, el = {'summer': (205, 55), 'autumn': (198, 40), 'bare': (190, 30), 'snow': (186, 25)}[season]; sv = sun_vec(az, el)   # 中午過後、太陽在南（太陽在西的話 C 棟的影子蓋住窗前的樹）；入秋以後比較低
        sky.sun_direction = sv; sun.data.energy = 2.4 if season == 'snow' else 3.2; sun.data.color = (1.0, 0.97, 0.92); sun.rotation_euler = (-sv).to_track_quat('-Z', 'Y').to_euler()
        wall.data.energy = 0.0; sc.view_settings.exposure = 0.55 if season == 'snow' else 0.8
    for m, e0 in GLOWS.items(): m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = e0 if night else 0.0


os.makedirs(OUTDIR, exist_ok=True); info = {}
for s in SEASONS:
    set_season(s)
    for t in TIMES:
        set_time(t, s); P_ = math.radians(PITCH)
        cam.location = g2b(*CAM); cam.rotation_euler = (g2b(math.sin(YAW) * math.cos(P_), math.sin(P_), math.cos(YAW) * math.cos(P_)) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
        name = 'us_cls120_%s_%s' % (s, t)
        png = os.path.join(PNG, name + '.png') if PNG else os.path.join(OUTDIR, '_' + name + '.png')
        if PNG: os.makedirs(PNG, exist_ok=True)
        sc.render.filepath = png; bpy.ops.render.render(write_still=True)
        out = os.path.join(OUTDIR, name + '.webp'); Image.open(png).convert('RGB').save(out, 'WEBP', quality=80, method=6)
        if not PNG: os.remove(png)
        info[name] = {'webp': os.path.relpath(out, L.ROOT), 'bytes': os.path.getsize(out)}; print('wrote', info[name], flush=True)
print(json.dumps({'samples': SAMPLES, 'res': [RW, RH], 'pitch': PITCH, 'cam': CAM, 'out': info}, ensure_ascii=False))
