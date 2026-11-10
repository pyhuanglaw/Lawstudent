"""美國交換：社區會所的窗景（US-CLUBHOUSE-3D-1110，AA_741；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/views/usch_<季節>_{day,night}.webp、usch_front_<季節>_{day,night}.webp（各 4 季×2）。
遊戲 src/us_clubhouse3d.js 在每扇窗、玻璃門外放視差窗景（W3.windowMat；照 US3.usSeasonKey() 換季）：
  usch＝會所後面（室內北牆的玻璃門、東西牆的窗）：草地、烤肉架、野餐桌、後面的樹林（AA_741「看得到草地和烤肉架」；草地不做 3D）
  usch_front＝會所正面（室內南牆的窗）：門廊、社區的停車場、對面的公寓
會所在社區（us_community.glb）的 (−28, 16.8)、正面朝北；室內的 +z（南）＝社區的 −z（北）。鏡頭在一樓窗口高度 1.6 m：
  usch 在後牆外 0.6 m（z 21.2）往南（+z）；usch_front 在正面牆外、自習室那扇窗的位置（x −34、z 12.9）往北（−z）。
草地、野餐桌、烤肉架、後門外的水泥小平台只在這裡加（社區模型裡沒有；遊戲不做 3D）；停車場的車照社區配置（us_cars.glb）擺。
  /opt/blenv/bin/python tools/blender/env_second/us_clubhouse_view.py [-- --view usch|usch_front|all] [--season summer|autumn|bare|snow|all] [--day|--night] [--samples 64] [--res 1024x512] [--png 資料夾]
這是渲染成照片的背景，不進遊戲的 3D 場景。社區（us_community.glb）改了要重拍。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
TIMES = ['day', 'night'] if not ('--day' in ARGS or '--night' in ARGS) else (['day'] if '--day' in ARGS else ['night'])
SEASONS = ['summer', 'autumn', 'bare', 'snow'] if opt('--season', 'all') == 'all' else [opt('--season')]
RW, RH = map(int, opt('--res', '1024x512').split('x')); SAMPLES = int(opt('--samples', '64'))
OUTDIR = os.path.join(L.ROOT, opt('--out', 'assets/models/env/views')); PNG = opt('--png')
GLB = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'us_community.glb'); CARS = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'us_cars.glb')
PI = math.pi
VIEWS = {'usch': {'cam': (-28.0, 1.6, 21.2), 'yaw': 0.0, 'pitch': 3.0, 'lamp': ((-28.0, 2.7, 20.75), (0, -0.4, 1))},          # 後面：往南（+z）
         'usch_front': {'cam': (-34.0, 1.6, 12.9), 'yaw': 180.0, 'pitch': 2.0, 'lamp': ((-34.0, 2.9, 13.1), (0, -0.5, -1))}}   # 正面：往北（−z）。鏡頭在室內南牆的窗那裡（門口西邊約 6 m；室內 x＝−(世界 x＋28)）：第一次放在門口正前方，最近的兩台車擋掉半張
VLIST = ['usch_front', 'usch'] if opt('--view', 'all') == 'all' else [opt('--view')]   # 正面先拍（後面那張要先在樹林裡清出草地）
def lin(h): return B.srgb(h)
_s = open(os.path.join(L.ROOT, 'src/data/us_layouts.js'), encoding='utf-8').read(); import re as _re
CL = json.loads(_re.search(r'const US_COMMUNITY_LAYOUT=(\{.*?\});\n', _s, _re.S).group(1))


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


# 停車場的車（社區配置 cars；us_cars.glb 的款式節點，車漆照 color）：只放會所正面看得到的（x −50～−5）
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=CARS); cobj = [o for o in bpy.data.objects if o not in before]
KIND = {o.name.split('.')[0]: o for o in cobj if o.parent is not None and o.parent.name.split('.')[0] == 'us_cars'}
for o in cobj: o.hide_render = True
PAINT = {}
def dup_tree(o, parent=None):
    c = o.copy(); bpy.context.scene.collection.objects.link(c); c.parent = parent; c.hide_render = False
    for k in o.children: dup_tree(k, c)
    return c
ncar = 0
for car in CL.get('cars', []):
    if not (-50 < car['x'] < -5) or car['kind'] not in KIND: continue
    c = dup_tree(KIND[car['kind']]); c.location = g2b(car['x'], 0.0, car['z']); c.rotation_euler = (0, 0, car.get('yaw', 0.0)); ncar += 1
    col = car.get('color', '#cccccc')
    if col not in PAINT:
        src_m = next((m for m in bpy.data.materials if m.name.split('.')[0] == 'car_paint'), None)
        if src_m:
            m2 = src_m.copy(); m2.name = 'car_paint_' + col; b_ = m2.node_tree.nodes.get('Principled BSDF')
            if b_: b_.inputs['Base Color'].default_value = (*lin(col), 1)
            PAINT[col] = m2
    for k in [c] + list(c.children_recursive):
        if k.type == 'MESH':
            k.data = k.data.copy()
            for i_, m in enumerate(k.data.materials):
                if m and m.name.split('.')[0] == 'car_paint' and col in PAINT: k.data.materials[i_] = PAINT[col]
                if m and m.name.startswith('GLOW_car'): pass
print('cars', ncar, flush=True)
# 會所後面：水泥小平台（後門外）、野餐桌、烤肉架、草地（社區模型這裡是樹林的地面，鋪一片修剪過的草地）
grass = L.pbr('usch_v_grass', 'leafy_grass', tile=2.0, target='#5f7d45', normal=0.4, maps=('diff', 'nor')) if os.path.isdir(os.path.join(HERE, 'textures', 'leafy_grass')) else L.flat('usch_v_grass', '#5f7d45', rough=0.9)
conc = L.flat('usch_v_conc', '#b9b5ac', rough=0.85); wood = L.flat('usch_v_wood', '#8a6a48', rough=0.7); blk = L.flat('usch_v_black', '#1d1e20', rough=0.4, metal=0.3)
fl = Mesh('usch_v_floor', L.flat('usch_v_forest_floor', '#3f4a31', rough=0.95)); fl.quad([(-260.0, -0.06, 260.0), (220.0, -0.06, 260.0), (220.0, -0.06, -220.0), (-260.0, -0.06, -220.0)]); fl.finish(None, uv=False)   # 社區模型外圍沒有地面：樹林後面的地面破洞露出天空，像一條浮著的灰帶（第二次拍）——整片墊一層林地
gm = Mesh('usch_v_lawn', grass); gm.quad([(-42.0, 0.02, 29.0), (-14.0, 0.02, 29.0), (-14.0, 0.02, 20.6), (-42.0, 0.02, 20.6)]); gm.finish(None, uv=True)
cm = Mesh('usch_v_patio', conc); cm.box(-31.0, -25.0, 0.0, 0.06, 20.6, 23.0); cm.finish(None, uv=True)
wm_ = Mesh('usch_v_picnic', wood)
px, pz = -30.4, 26.3
wm_.box(px - 0.9, px + 0.9, 0.72, 0.77, pz - 0.38, pz + 0.38)
for sz in (-0.65, 0.65): wm_.box(px - 0.9, px + 0.9, 0.42, 0.46, pz + sz - 0.14, pz + sz + 0.14)
for sx in (-0.7, 0.7):
    for sz in (-0.75, 0.75): wm_.box(px + sx - 0.04, px + sx + 0.04, 0.0, 0.72, pz + sz * 0.5 - 0.04, pz + sz * 0.5 + 0.04)
wm_.finish(None, uv=True)
bm_ = Mesh('usch_v_grill', blk); gx, gz = -26.0, 25.6
bm_.sphere((gx, 0.85, gz), 0.3, seg=16, rings=8, sy=0.8)
for k in range(3):
    a = k / 3 * math.tau; bm_.cyl((gx + math.cos(a) * 0.08, 0.7, gz + math.sin(a) * 0.08), (gx + math.cos(a) * 0.32, 0.0, gz + math.sin(a) * 0.32), 0.015, seg=6)
bm_.cyl((gx, 1.08, gz), (gx, 1.16, gz), 0.03, seg=8); bm_.finish(None, uv=False)
# 一張長椅（草地邊、樹林前）
wm2 = Mesh('usch_v_bench', wood); wm2.box(-21.8, -20.2, 0.42, 0.46, 27.4, 27.8); wm2.box(-21.8, -20.2, 0.55, 0.85, 27.85, 27.9); [wm2.box(x - 0.03, x + 0.03, 0.0, 0.42, 27.45, 27.75) for x in (-21.6, -20.4)]; wm2.finish(None, uv=True)


# 光、天空、鏡頭（同 jp_view.py）
def sun_vec(az, el):
    a, e = math.radians(az), math.radians(el); return Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))


world = bpy.data.worlds.new('ubv_world'); sc.world = world; world.use_nodes = True; WN = world.node_tree.nodes; WL = world.node_tree.links
bg = WN['Background']; sky = WN.new('ShaderNodeTexSky'); sky.sky_type = 'HOSEK_WILKIE'; sky.turbidity = 3.0; sky.ground_albedo = 0.3
tc = WN.new('ShaderNodeTexCoord'); sep = WN.new('ShaderNodeSeparateXYZ'); WL.new(tc.outputs['Generated'], sep.inputs[0])
ramp = WN.new('ShaderNodeValToRGB'); WL.new(sep.outputs['Z'], ramp.inputs['Fac']); E_ = ramp.color_ramp.elements
E_[0].position = 0.0; E_[0].color = (*lin('#2c3046'), 1); E_[1].position = 0.32; E_[1].color = (*lin('#070b1c'), 1); e2 = E_.new(0.08); e2.color = (*lin('#151a30'), 1)
sun = bpy.data.objects.new('ubv_sun', bpy.data.lights.new('ubv_sun', 'SUN')); sc.collection.objects.link(sun); sun.data.angle = math.radians(1.2)
wall = bpy.data.objects.new('ubv_wallpack', bpy.data.lights.new('ubv_wallpack', 'AREA')); sc.collection.objects.link(wall); LAMPS = []   # 後門外／門廊的燈（位置照 VIEWS 的 lamp；晚上亮）
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


AZ_ADD = 0.0; EXP_ADD = 0.0   # 每個景另外轉太陽、加曝光（後面往南看：太陽轉到西邊＝夏天下午的方位，樹影往東倒、不蓋住草地；正對鏡頭逆光時第一次試拍整張很暗）
def set_time(t, season):
    night = t == 'night'
    for lk in list(bg.inputs['Color'].links): WL.remove(lk)
    if night:
        WL.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.6
        sun.data.energy = 0.14; sun.data.color = (0.7, 0.78, 1.0); sun.rotation_euler = (-sun_vec(160, 35)).to_track_quat('-Z', 'Y').to_euler()
        wall.data.energy = 60.0; sc.view_settings.exposure = 1.5   # 後門外／門廊的燈（晚上照到平台、草地）
    else:
        WL.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 1.0 if season == 'snow' else 1.2
        az, el = {'summer': (205, 55), 'autumn': (198, 40), 'bare': (190, 30), 'snow': (186, 25)}[season]; sv = sun_vec(az + AZ_ADD, el)   # 中午過後、太陽在南（太陽在西的話 C 棟的影子蓋住窗前的樹）；入秋以後比較低
        sky.sun_direction = sv; sun.data.energy = 2.4 if season == 'snow' else 3.2; sun.data.color = (1.0, 0.97, 0.92); sun.rotation_euler = (-sv).to_track_quat('-Z', 'Y').to_euler()
        wall.data.energy = 0.0; sc.view_settings.exposure = (0.55 if season == 'snow' else 0.8) + EXP_ADD
    for m, e0 in GLOWS.items(): m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = e0 if night and not m.name.startswith('GLOW_car') else 0.0   # 停著的車不開燈（遊戲也是：waiting 的車才亮）——第一次拍晚上的車大燈全亮



CLEAR = (-40.0, -16.0, 20.7, 30.2)   # 會所後面的草地（x0, x1, z0, z1）：社區的樹林從 z 18 開始、整片蓋到會所後牆，往南看全是樹蔭（第一次試拍整張是黑的）
def clear_lawn():
    """只拍後面那張時：把草地範圍裡地面以上的東西（樹、樹叢）刪掉，留一塊修剪過的草地；社區模型、遊戲都不改"""
    n = 0
    for o in [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.startswith('usch_v_') and not o.hide_render]:
        mw = o.matrix_world; bm = bmesh.new(); bm.from_mesh(o.data)
        kill = []
        for v in bm.verts:
            w = mw @ v.co; gx, gy, gz = w.x, w.z, -w.y
            if CLEAR[0] < gx < CLEAR[1] and CLEAR[2] < gz < CLEAR[3] and gy > 0.08: kill.append(v)
        if kill:   # 整叢刪：從範圍裡的點沿著邊擴散（地面以上的點）——只刪範圍裡的點會留下切一半的樹叢浮在空中（第二次試拍）
            seen = set(kill); st = list(kill)
            while st:
                v = st.pop()
                for e in v.link_edges:
                    u = e.other_vert(v)
                    if u in seen: continue
                    w = mw @ u.co
                    if w.z > 0.08: seen.add(u); st.append(u)
            kill = list(seen)
            if o.data.users > 1: o.data = o.data.copy()
            bmesh.ops.delete(bm, geom=kill, context='VERTS'); bm.to_mesh(o.data); n += len(kill)
        bm.free()
    print('clear_lawn', n, flush=True)

os.makedirs(OUTDIR, exist_ok=True); info = {}
for v in VLIST:
    if v == 'usch':
        clear_lawn()
        for o in bpy.data.objects:   # 後面那張：樹林後面的柏油、人行道從樹冠下的縫看出去像一條浮在空中的灰帶（第一次拍）——後面看不到停車場，整片藏起來
            if o.type == 'MESH' and any(m and m.name.split('.')[0] in ('usc_asphalt', 'usc_concrete') for m in o.data.materials): o.hide_render = True
    VW = VIEWS[v]; AZ_ADD = 75.0 if v == 'usch' else 0.0; EXP_ADD = 0.45 if v == 'usch' else 0.0; CAM = VW['cam']; YAW = math.radians(VW['yaw']); PITCH = VW['pitch']
    (lx, ly, lz), (dx, dy, dz) = VW['lamp']; wall.location = g2b(lx, ly, lz); wall.rotation_euler = (g2b(dx, dy, dz) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
    for s in SEASONS:
        set_season(s)
        for t in TIMES:
            set_time(t, s); P_ = math.radians(PITCH)
            cam.location = g2b(*CAM); cam.rotation_euler = (g2b(math.sin(YAW) * math.cos(P_), math.sin(P_), math.cos(YAW) * math.cos(P_)) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()
            name = '%s_%s_%s' % (v, s, t)
            png = os.path.join(PNG, name + '.png') if PNG else os.path.join(OUTDIR, '_' + name + '.png')
            if PNG: os.makedirs(PNG, exist_ok=True)
            sc.render.filepath = png; bpy.ops.render.render(write_still=True)
            out = os.path.join(OUTDIR, name + '.webp'); Image.open(png).convert('RGB').save(out, 'WEBP', quality=80, method=6)
            if not PNG: os.remove(png)
            info[name] = {'webp': os.path.relpath(out, L.ROOT), 'bytes': os.path.getsize(out)}; print('wrote', info[name], flush=True)
print(json.dumps({'samples': SAMPLES, 'res': [RW, RH], 'views': VIEWS, 'out': info}, ensure_ascii=False))
