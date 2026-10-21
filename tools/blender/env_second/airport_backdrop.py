"""桃園機場第二航廈的窗外遠景（ART-VAC-AIRPORT-1021，LAWWW2 2026-10-21）：原本 airport_tex.py 的 tex_outside 用 PIL 畫的平面圖（綠色圓球樹、灰色方塊停車場）
換成 Blender 搭的 3D 場景渲染。從大廳中間（遊戲座標 (0, 4, 0)、往 +z 看）透視投影到遊戲裡的遠景平面：
  出境 z 60、x −90～90、y −2～34；入境 z 42、x −70～70、y −2～26——兩個都是 5:1，共用一張圖（貼圖左邊＝+x：從大廳往外看，東邊在左手邊）。
場景（遊戲座標，x 東、y 上、z 南＝往外）：外側車道（z 30～44，幾台車）、中央分隔島（樟樹＋雙臂路燈，z 44～52）、停車大樓（z 64～96、x −86～86，
五層：樓板邊白色、矮牆清水混凝土、柱子、裡面看得到停著的車、兩端的樓梯電梯塔＋P2 指標）、遠處高架道路（z 132～140，橋面 y 8）、飯店、辦公大樓、塔台、天空。
樹：street_trees.glb 的樟樹（tree_atlas.py 的葉片卡樹）；車：us_cars.glb（掀背、轎車、休旅；車色每台隨機，含少數黃色計程車）。名字、標誌都是虛構的。
  /opt/blenv/bin/python tools/blender/env_second/airport_backdrop.py -- [--night] [--res 2560] [--samples 48] [--out 路徑]
  → tools/blender/env_second/textures/gen/ap_outside.png（白天）／ap_outside_night.png（晚上：停車場樓層、路燈、窗戶、塔台亮）
之後重跑 airport_t2.py（--area dep、--area arr）把新的圖包進 GLB。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
NIGHT = '--night' in ARGS; RES = int(arg('--res', '2560')); SAMPLES = int(arg('--samples', '48'))
GEN = os.path.join(HERE, 'textures', 'gen')
OUT = arg('--out', os.path.join(GEN, 'ap_outside_night.png' if NIGHT else 'ap_outside.png'))
rng = random.Random(20261021)
B.reset(texres=512)
root = B.group('ap_backdrop')
lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def rgb(h): h = h.lstrip('#'); return tuple(lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4))
def glow(m, col, strength):
    bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Emission Color'].default_value = (*rgb(col), 1.0); bs.inputs['Emission Strength'].default_value = strength; return m

M = {'conc': L.pbr('bd_conc', 'concrete_wall_006', tile=2.0, target='#c9c7c1', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'slab': L.flat('bd_slab', '#e4e2dc', rough=0.8),
     'ceil': L.flat('bd_ceil', '#5d6063', rough=0.9),
     'gfloor': L.flat('bd_gfloor', '#76787b', rough=0.9),
     'asph': L.pbr('bd_asph', 'asphalt_02', tile=4.0, target='#7d7e80', normal=0.2, maps=('diff',), rough_value=0.9),
     'grass': L.pbr('bd_grass', 'grass_ground', tile=3.0, target='#6d8848', maps=('diff',), rough_value=0.95),
     'curb': L.flat('bd_curb', '#c7c4bd', rough=0.8), 'lane': L.flat('bd_lane', '#e9e7e0', rough=0.6),
     'steel': L.flat('bd_steel', '#8f949a', rough=0.45, metal=0.4),
     'lamp': glow(L.flat('bd_lamp', '#fff6e2', rough=0.4), '#ffe0aa', 40.0 if NIGHT else 0.0),
     'soffit': glow(L.flat('bd_soffit', '#f3f5f3', rough=0.4), '#f4f8ff', 9.0 if NIGHT else 1.2),
     'hotel': L.flat('bd_hotel', '#d9d3c7', rough=0.8), 'office': L.flat('bd_office', '#b9bfc4', rough=0.6),
     'glass': L.flat('bd_glass', '#56636d', rough=0.15, metal=0.3),
     'win': glow(L.flat('bd_win', '#56636d', rough=0.15, metal=0.3), '#ffd9a0', 2.6 if NIGHT else 0.0),
     'sign': L.flat('bd_sign', '#1d5a44', rough=0.5), 'signw': glow(L.flat('bd_signw', '#ffffff', rough=0.5), '#ffffff', 3.0 if NIGHT else 0.4),
     'tower': L.flat('bd_tower', '#d3d1cb', rough=0.7), 'cab': glow(L.flat('bd_cab', '#3e4c52', rough=0.1, metal=0.3), '#d8f0e8', 1.8 if NIGHT else 0.0),
     'red': glow(L.flat('bd_red', '#c0221c', rough=0.4), '#ff2a1a', 30.0 if NIGHT else 0.0)}

# ---------- 地面：外側車道、分隔島、停車場前的道路 ----------
X0, X1 = -260.0, 260.0
Mesh('bd_road', M['asph'], tile=4.0).box(X0, X1, -0.05, 0.0, 28.0, 64.0).box(X0, X1, -0.05, 0.0, 96.0, 220.0).finish(root)
gr = Mesh('bd_median', M['grass'], tile=3.0); gr.box(X0, X1, 0.0, 0.16, 44.4, 51.6); gr.finish(root)
cb = Mesh('bd_curbs', M['curb']); cb.box(X0, X1, 0.0, 0.18, 44.0, 44.4).box(X0, X1, 0.0, 0.18, 51.6, 52.0).box(X0, X1, 0.0, 0.18, 62.6, 63.2); cb.finish(root)
ln = Mesh('bd_lanes', M['lane'])
for z in (33.4, 37.0, 40.6, 56.8):
    x = X0
    while x < X1: ln.box(x, x + 3.0, 0.0, 0.012, z - 0.06, z + 0.06); x += 9.0
for z in (29.0, 43.6, 52.6): ln.box(X0, X1, 0.0, 0.012, z - 0.08, z + 0.08)
ln.finish(root)

# ---------- 停車大樓 P2（z 64～96）：五層 ----------
GX0, GX1, GZ0, GZ1, LV = -72.0, 72.0, 64.0, 96.0, 3.2
cs, sl, ce, gf, sf = Mesh('bd_g_conc', M['conc'], tile=2.0), Mesh('bd_g_slab', M['slab']), Mesh('bd_g_ceil', M['ceil']), Mesh('bd_g_floor', M['gfloor']), Mesh('bd_g_soffit', M['soffit'])
gf.box(GX0, GX1, 0.0, 0.05, GZ0, GZ1)
for i in range(1, 5):
    y = i * LV
    gf.box(GX0, GX1, y - 0.02, y, GZ0 + 0.2, GZ1)                                   # 樓板上面（地坪）
    ce.box(GX0, GX1, y - 0.32, y - 0.3, GZ0 + 0.2, GZ1)                              # 樓板下面（天花，深灰）
    sl.box(GX0, GX1, y - 0.32, y + 0.08, GZ0, GZ0 + 0.22)                            # 樓板邊（白）
    cs.box(GX0, GX1, y + 0.08, y + 1.05, GZ0, GZ0 + 0.18)                            # 矮牆（清水混凝土）
    for zz in (66.5, 72.0, 78.0, 84.0):                                              # 天花的燈管
        x = GX0 + 2.0
        while x < GX1 - 1.0: sf.box(x - 0.6, x + 0.6, y - 0.36, y - 0.32, zz - 0.05, zz + 0.05); x += 4.0
for x in [GX0 + 0.3 + k * 8.0 for k in range(int((GX1 - GX0) / 8.0) + 1)]:
    cs.box(x - 0.3, x + 0.3, 0.0, 4 * LV, GZ0 + 0.3, GZ0 + 0.9)                      # 柱子（到屋頂樓板）
    cs.box(x - 0.3, x + 0.3, 0.0, 4 * LV, GZ0 + 16.0, GZ0 + 16.6)
cs.box(GX0, GX0 + 0.3, 0.0, 4 * LV + 1.1, GZ0, GZ1).box(GX1 - 0.3, GX1, 0.0, 4 * LV + 1.1, GZ0, GZ1)
cs.box(GX0, GX1, 0.0, 4 * LV + 1.1, GZ1 - 0.3, GZ1)                                     # 後面的牆
gl, sg = Mesh('bd_g_glass', M['glass']), Mesh('bd_g_sign', M['sign'])
for cx in (GX0 + 3.0, GX1 - 3.0):                                                      # 兩端的樓梯電梯塔
    cs.box(cx - 3.2, cx + 3.2, 0.0, 17.5, GZ0 - 1.2, GZ0 + 6.0); gl.box(cx - 2.2, cx + 2.2, 1.0, 16.5, GZ0 - 1.25, GZ0 - 1.15)
    sg.box(cx - 1.6, cx + 1.6, 13.6, 16.2, GZ0 - 1.4, GZ0 - 1.25)
for m_ in (cs, sl, ce, gf, sf, gl, sg): m_.finish(root)
FONT = bpy.data.fonts.load('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc')
def text(body, x, y, z, size, mat, rot_y=0.0):
    cu = bpy.data.curves.new('t_' + body, 'FONT'); cu.body = body; cu.font = FONT; cu.size = size; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.extrude = 0.02
    ob = bpy.data.objects.new('t_' + body, cu); bpy.context.scene.collection.objects.link(ob); ob.data.materials.append(mat)
    ob.location = g2b(x, y, z); ob.rotation_euler = (math.radians(90), 0, math.radians(180) + rot_y); return ob
for cx in (GX0 + 3.0, GX1 - 3.0): text('P2', cx, 15.25, GZ0 - 1.45, 1.9, M['signw'])
text('第二航廈停車場', 0.0, 4 * LV + 0.62, GZ0 - 0.03, 0.7, M['signw'])

# ---------- 高架道路（z 132～140）、遠處的樓、塔台 ----------
vd = Mesh('bd_viaduct', M['conc'], tile=2.0); vd.box(X0, X1, 8.0, 8.8, 132.0, 140.0).box(X0, X1, 8.8, 9.9, 132.0, 132.3)
for x in range(int(X0), int(X1), 30): vd.box(x - 1.0, x + 1.0, 0.0, 8.0, 135.0, 137.0)
vd.finish(root)
hb, hg, hw = Mesh('bd_hotel', M['hotel']), Mesh('bd_hotel_glass', M['glass']), Mesh('bd_hotel_win', M['win'])
def tower_block(x0, x1, z0, h, wall, bands):
    wall.box(x0, x1, 0.0, h, z0, z0 + 22.0)
    y = 4.0
    while y < h - 2.0:
        x = x0 + 1.2
        while x < x1 - 1.4:
            (hw if rng.random() < 0.38 else hg).box(x, x + 1.6, y, y + 1.5, z0 - 0.05, z0); x += 2.4
        y += 3.2
tower_block(-74.0, -32.0, 160.0, 46.0, hb, None)
ob_ = Mesh('bd_office', M['office']); tower_block(28.0, 76.0, 188.0, 40.0, ob_, None)
lw = Mesh('bd_low', M['hotel'])                                                         # 停車大樓兩側露出來的低層建築（貨運、旅館）
tower_block(96.0, 170.0, 112.0, 16.0, lw, None); tower_block(-180.0, -100.0, 118.0, 22.0, lw, None); tower_block(-250.0, -190.0, 150.0, 30.0, ob_, None)
for m_ in (hb, hg, hw, ob_, lw): m_.finish(root)
tw, tc, tr = Mesh('bd_tower', M['tower']), Mesh('bd_cab', M['cab']), Mesh('bd_red', M['red'])
TX, TZ, TH = -14.0, 260.0, 78.0                                                         # 塔台（細長的塔身＋上面一圈玻璃的管制室）
tw.cyl((TX, 0.0, TZ), (TX, TH, TZ), 3.2, seg=20, r2=2.6).cyl((TX, TH + 5.0, TZ), (TX, TH + 6.6, TZ), 7.0, seg=24).cyl((TX, TH + 6.6, TZ), (TX, TH + 11.0, TZ), 0.4, seg=8)
tw.cyl((TX, TH - 2.0, TZ), (TX, TH, TZ), 4.0, seg=24, r2=6.2)
tc.cyl((TX, TH, TZ), (TX, TH + 5.0, TZ), 6.2, seg=24, r2=7.0); tr.sphere((TX, TH + 11.3, TZ), 0.6)
for m_ in (tw, tc, tr): m_.finish(root)

# ---------- 分隔島：路燈（雙臂）、樹 ----------
st, lp = Mesh('bd_poles', M['steel']), Mesh('bd_lamps', M['lamp'])
LAMPS = [x for x in range(-240, 241, 32)]
for x in LAMPS:
    st.cyl((x, 0.16, 48.0), (x, 10.2, 48.0), 0.13, seg=10, r2=0.09)
    for s in (-1, 1):
        st.box(x - 0.06, x + 0.06, 9.95, 10.1, 48.0, 48.0 + s * 2.3)
        lp.box(x - 0.24, x + 0.24, 9.82, 9.98, 48.0 + s * 2.3 - 0.45, 48.0 + s * 2.3 + 0.45)
for x in range(-250, 251, 40):                                                        # 停車場前道路另一側的路燈
    st.cyl((x, 0.18, 63.0), (x, 9.0, 63.0), 0.12, seg=10, r2=0.08); st.box(x - 0.06, x + 0.06, 8.85, 9.0, 63.0, 61.2); lp.box(x - 0.22, x + 0.22, 8.72, 8.86, 60.85, 61.65)
for x in range(int(GX0) + 12, int(GX1) - 6, 24):                                      # 停車大樓屋頂的燈桿
    st.cyl((x, 4 * LV + 0.1, GZ0 + 8.0), (x, 4 * LV + 8.0, GZ0 + 8.0), 0.09, seg=8); lp.box(x - 0.2, x + 0.2, 4 * LV + 7.85, 4 * LV + 8.0, GZ0 + 7.6, GZ0 + 8.4)
st.finish(root); lp.finish(root)

def import_glb(path):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); return [o for o in bpy.data.objects if o not in before]
def to_collection(objs, name, keep):
    col = bpy.data.collections.new(name)
    tops = [o for o in objs if o.parent is None]
    for o in objs:
        for c in list(o.users_collection): c.objects.unlink(o)
        col.objects.link(o)
    return col, tops
def instance(col, x, y, z, yaw=0.0, s=1.0):
    e = bpy.data.objects.new('inst_' + col.name, None); e.instance_type = 'COLLECTION'; e.instance_collection = col
    e.location = g2b(x, y, z); e.rotation_euler = (0, 0, yaw); e.scale = (s, s, s); bpy.context.scene.collection.objects.link(e); return e

trees = import_glb(os.path.join(L.ROOT, 'assets/models/env/second_ai/street_trees.glb'))
TCOL = {}
for key in ('tree_camphor_a', 'tree_camphor_b'):
    top = next(o for o in trees if o.name.startswith(key))
    parts = [top] + list(top.children_recursive); top.parent = None; top.location = (0, 0, 0)   # street_trees.glb 的樹都在原點、沒有變換
    TCOL[key], _ = to_collection(parts, key, True)
for o in list(trees):
    if all(c.name not in TCOL for c in o.users_collection): bpy.data.objects.remove(o, do_unlink=True)
x = -250.0
while x < 250.0:
    if all(abs(x - lx) > 4.0 for lx in LAMPS): instance(TCOL[rng.choice(list(TCOL))], x + rng.uniform(-1.5, 1.5), 0.16, 48.0 + rng.uniform(-1.2, 1.2), rng.uniform(0, 6.28), rng.uniform(0.85, 1.2))
    x += rng.uniform(8.5, 12.0)

cars = import_glb(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_cars.glb'))
CCOL = {}
for key in ('car_hatch', 'car_sedan', 'car_minivan'):
    top = next(o for o in cars if o.name == key)
    parts = [top] + list(top.children_recursive); top.parent = None; top.location = (0, 0, 0); top.rotation_euler = (0, 0, 0)   # 車長沿遊戲 z（±2.42 m）
    CCOL[key], _ = to_collection(parts, key, True)
for o in list(cars):
    if all(c.name not in CCOL for c in o.users_collection): bpy.data.objects.remove(o, do_unlink=True)
paint = bpy.data.materials.get('car_paint')
if paint:                                                                             # 車色：每台的隨機值挑一種常見車色（白、銀、灰、黑、深藍、紅、黃色計程車）
    nt = paint.node_tree; bs = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    oi = nt.nodes.new('ShaderNodeObjectInfo'); cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.interpolation = 'CONSTANT'
    pal = [(0.0, '#e9e9e6'), (0.26, '#b8bbbe'), (0.44, '#6c7074'), (0.6, '#1d1f22'), (0.76, '#24365a'), (0.86, '#8e1d1d'), (0.94, '#e8b10c')]
    el = cr.color_ramp.elements
    while len(el) < len(pal): el.new(0.5)
    for e, (p, c) in zip(el, pal): e.position = p; e.color = (*rgb(c), 1.0)
    nt.links.new(oi.outputs['Random'], cr.inputs['Fac']); nt.links.new(cr.outputs['Color'], bs.inputs['Base Color'])
for i in range(1, 5):                                                                 # 停車場每一層：車頭朝外停一排
    x = GX0 + 4.0
    while x < GX1 - 4.0:
        if rng.random() < 0.72: instance(CCOL[rng.choice(list(CCOL))], x, i * LV, 67.4, 0.0 if rng.random() < 0.5 else math.pi)
        x += 2.7
x = GX0 + 4.0
while x < GX1 - 4.0:
    if rng.random() < 0.6: instance(CCOL[rng.choice(list(CCOL))], x, 0.05, 67.4, 0.0 if rng.random() < 0.5 else math.pi)
    x += 2.7
for (x, z, yaw) in ((-40.0, 35.2, -90), (-8.0, 38.8, -90), (30.0, 35.2, 90), (64.0, 38.8, 90), (12.0, 58.6, -90), (-70.0, 58.6, 90)):   # 車道上的車
    instance(CCOL[rng.choice(list(CCOL))], x, 0.0, z, math.radians(yaw))

# ---------- 天空、太陽、晚上的燈 ----------
sc = bpy.context.scene
w = bpy.data.worlds.new('bd_sky'); sc.world = w; w.use_nodes = True; nt = w.node_tree; N = nt.nodes
bg = N['Background']; tc_ = N.new('ShaderNodeTexCoord'); sx = N.new('ShaderNodeSeparateXYZ'); ramp = N.new('ShaderNodeValToRGB')
nt.links.new(tc_.outputs['Generated'], sx.inputs[0]); nt.links.new(sx.outputs['Z'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
e0, e1 = ramp.color_ramp.elements[0], ramp.color_ramp.elements[1]
if NIGHT: e0.position, e1.position = 0.0, 0.5; e0.color = (0.05, 0.055, 0.085, 1); e1.color = (0.006, 0.009, 0.024, 1); bg.inputs['Strength'].default_value = 1.0
else: e0.position, e1.position = 0.0, 0.55; e0.color = (0.80, 0.86, 0.93, 1); e1.color = (0.33, 0.52, 0.82, 1); bg.inputs['Strength'].default_value = 1.0
if not NIGHT:
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.2; sun.color = (1.0, 0.96, 0.9); sun.angle = math.radians(1.5)
    so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
    el_, az = math.radians(38), math.radians(235)                                     # 15:00 左右：西南方、仰角 38°
    d = g2b(math.sin(az) * math.cos(el_), math.sin(el_), -math.cos(az) * math.cos(el_)).normalized()
    so.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
else:
    for x in LAMPS:
        for s in (-1, 1):
            sp = bpy.data.lights.new('lampspot', 'SPOT'); sp.energy = 1800; sp.spot_size = math.radians(115); sp.color = (1.0, 0.86, 0.62)
            o = bpy.data.objects.new('lampspot', sp); sc.collection.objects.link(o); o.location = g2b(x, 9.7, 48.0 + s * 2.3); o.rotation_euler = (0, 0, 0)
    for i in range(1, 5):
        a = bpy.data.lights.new('garage', 'AREA'); a.shape = 'RECTANGLE'; a.size = GX1 - GX0; a.size_y = 14.0; a.energy = 9000; a.color = (0.92, 0.96, 1.0)
        o = bpy.data.objects.new('garage', a); sc.collection.objects.link(o); o.location = g2b(0.0, i * LV - 0.45, 72.0); o.rotation_euler = (0, 0, 0)

# ---------- 鏡頭：大廳中間 (0, 4, 0) 往 +z，透視投影到 z 60 的平面（x ±90、y −2～34）----------
cam = bpy.data.cameras.new('bd_cam'); cam.sensor_fit = 'HORIZONTAL'; cam.angle = 2 * math.atan(90.0 / 60.0); cam.shift_y = (16.0 - 4.0) / 180.0; cam.clip_end = 2000
co = bpy.data.objects.new('bd_cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = g2b(0.0, 4.0, 0.0); co.rotation_euler = (math.radians(90), 0, math.radians(180))
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.device = 'CPU'; sc.render.threads = int(arg('--threads', '2'))
try: sc.cycles.use_denoising = True
except Exception: pass
sc.render.resolution_x = RES; sc.render.resolution_y = RES // 5; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = -0.2 if not NIGHT else 0.3
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGB'; sc.render.filepath = OUT   # 不要 alpha（全不透明，匯出時白佔空間）
bpy.ops.render.render(write_still=True)
print('backdrop', 'night' if NIGHT else 'day', OUT, RES, SAMPLES)
