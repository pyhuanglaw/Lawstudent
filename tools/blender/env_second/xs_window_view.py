"""新生南路西側二樓窗外的景（窗景照片）：從店家二樓的窗往東看——新生南路四線道、分隔島、對面紅磚人行道的大王椰子和樟樹、首都帝大的紅磚圍牆，牆裡面是校園的樹（LAWWW2 11-04，給 CC 的同弦樂器 v4c）。
照 src/data/xinsheng_layout.js（路、人行道、圍牆、樹、路燈的位置；改那邊要重拍）。樹是 street_trees.glb（⑦行道樹，和遊戲同一組模型）；遊戲裡圍牆後面現在還是空地（側門外的遠景還沒做），這張先放校園的樹。
用法：/opt/blenv/bin/python tools/blender/env_second/xs_window_view.py -- <店的 z 中心> <輸出 png> [--h 5.75] [--res 1024x640] [--lens 28] [--night] [--layout <xinsheng_layout.js>] [--ground（一樓店門裡往外，騎樓）] [--look-dy <鏡頭往下看幾 m，預設 −3.2；--ground 是 0>]
例：同弦樂器（z −12.4～−6.0，窗在 z −12.2～−9.6）：... -- -10.9 out.png"""
import json, math, os, random, sys
import bpy, bmesh
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
A = sys.argv[sys.argv.index('--') + 1:]
ZC, OUTP = float(A[0]), A[1]
def opt(k, d): return A[A.index(k) + 1] if k in A else d
EYE_H = float(opt('--h', '5.75')); RW, RH = map(int, opt('--res', '1024x640').split('x')); NIGHT = '--night' in A
src = open(opt('--layout', os.path.join(ROOT, 'src', 'data', 'xinsheng_layout.js')), encoding='utf-8').read()   # 這個分支沒有 src/data/xinsheng_layout.js 時用 --layout 指到開發分支的那一份
X = None; s0 = src.index('{', src.index('const XINSHENG_LAYOUT=')); depth = 0
for i in range(s0, len(src)):
    depth += {'{': 1, '}': -1}.get(src[i], 0)
    if depth == 0: X = json.loads(src[s0:i + 1]); break
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def mat(name, col, rough=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    c = tuple(int(col[i:i + 2], 16) / 255 for i in (1, 3, 5)); c = tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)
    b.inputs['Base Color'].default_value = (*c, 1); b.inputs['Roughness'].default_value = rough; return m
def box(name, m, x0, x1, y0, y1, z0, z1):
    bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
    a, b = g2b(min(x0, x1), y0, max(z0, z1)), g2b(max(x0, x1), y1, min(z0, z1))
    for v in r['verts']: v.co = Vector((a.x if v.co.x < 0 else b.x, a.y if v.co.y < 0 else b.y, a.z if v.co.z < 0 else b.z))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob
R, WE, WW, CW = X['road'], X['walkEast'], X['walkWest'], X['campusWall']
Z0, Z1 = ZC - 70, ZC + 70
box('ground_far', mat('g_far', '#6d6a64', 0.95), -60, 200, -0.06, -0.02, Z0 - 60, Z1 + 60)
box('campus_soil', mat('g_campus', '#5f6b47', 0.95), CW['x'] + 0.3, 200, -0.03, 0.0, Z0 - 60, Z1 + 60)
box('road', mat('asphalt', '#acacaa', 0.9), R['x0'], R['x1'], -0.02, 0.0, Z0, Z1)
box('median', mat('median', '#8e8a82', 0.9), R['median']['x0'], R['median']['x1'], 0.0, 0.18, Z0, Z1)
box('median_green', mat('shrub', '#4d6b3a', 0.9), R['median']['x0'] + 0.08, R['median']['x1'] - 0.08, 0.18, 0.45, Z0, Z1)
lm = mat('lane', '#efefe8', 0.6)
for lx in (R['x0'] + 3.6, R['x1'] - 3.6):
    for zz in range(int(Z0), int(Z1), 8): box('lane', lm, lx - 0.08, lx + 0.08, 0.0, 0.012, zz, zz + 4)
for lx in (R['x0'] + 0.25, R['x1'] - 0.25): box('edge', lm, lx - 0.06, lx + 0.06, 0.0, 0.012, Z0, Z1)
for c in X.get('crossings', []):
    for x in [R['x0'] + 0.7 + 1.2 * k for k in range(int((R['x1'] - R['x0'] - 1.2) / 1.2) + 1)]: box('zebra', lm, x - 0.28, x + 0.28, 0.0, 0.014, c['z'] - c['w'] / 2 + 0.3, c['z'] + c['w'] / 2 - 0.3)
box('curb_e', mat('curb', '#bdb7ab', 0.85), R['x1'], R['x1'] + 0.25, 0.0, 0.15, Z0, Z1)
box('walk_e', mat('brick', '#b77a62', 0.9), R['x1'] + 0.25, CW['x'] + 0.3, 0.0, 0.15, Z0, Z1)
for k in range(int(Z0), int(Z1), 2): box('brickline', mat('brickj', '#9c6552', 0.9), R['x1'] + 0.25, CW['x'] - 0.3, 0.15, 0.152, k, k + 0.03)
box('walk_w', mat('walkw', '#cfc8bb', 0.9), WW['x0'], R['x0'], 0.0, 0.15, Z0, Z1)
wall = mat('wall', '#a8634a', 0.9); cap = mat('cap', '#d9d3c6', 0.7); post = mat('post', '#bdb5a6', 0.8)
segs = [(Z0, CW['gateGap'][0]), (CW['gateGap'][1], Z1)]
for a, b in segs:
    box('cwall', wall, CW['x'] - 0.3, CW['x'] + 0.3, 0.15, CW['h'], a, b); box('ccap', cap, CW['x'] - 0.38, CW['x'] + 0.38, CW['h'], CW['h'] + 0.12, a, b)
    for zz in [a + 3.0 * k for k in range(int((b - a) / 3.0) + 1)]: box('pilaster', wall, CW['x'] - 0.38, CW['x'] + 0.38, 0.15, CW['h'] + 0.05, zz - 0.25, zz + 0.25)
for zz in CW['gateGap']: box('gpost', post, CW['x'] - 0.5, CW['x'] + 0.5, 0.0, 3.0, zz - 0.5, zz + 0.5)
pole = mat('pole', '#3a3f45', 0.5)
for (x, z) in X.get('lamps', []):
    if abs(z - ZC) > 60: continue
    box('lamp', pole, x - 0.07, x + 0.07, 0.0, 7.5, z - 0.07, z + 0.07); sx = -1 if x > 0 else 1
    box('lamparm', pole, min(x, x + sx * 1.6), max(x, x + sx * 1.6), 7.4, 7.5, z - 0.05, z + 0.05); box('lamphead', mat('lh', '#d9dde0', 0.4), x + sx * 1.3, x + sx * 1.9, 7.3, 7.42, z - 0.15, z + 0.15)
# 樹（⑦行道樹 street_trees.glb，和遊戲同一組）：對面人行道照配置，圍牆裡面是校園的樹（亂數排，固定種子）
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/street_trees.glb'))
TR = {o.name.replace('tree_', ''): o for o in bpy.data.objects if o.name.startswith('tree_') and o.name != 'tree_card'}
for o in bpy.data.objects:
    if o.name == 'tree_card' or (o.parent and o.parent.name == 'tree_card'): o.hide_render = True
def hier(o): return [o] + [d for c in o.children for d in hier(c)]
def place(kind, x, z, ry=0.0, s=1.0):
    src_ = TR[kind]; mp = {}
    for o in hier(src_):
        c = o.copy(); sc.collection.objects.link(c); mp[o] = c
    for o, c in mp.items():
        if o.parent in mp: c.parent = mp[o.parent]
    r = mp[src_]; r.parent = None; r.location = g2b(x, 0, z); r.rotation_euler = (0, 0, ry); r.scale = (s, s, s)
for o in TR.values(): o.location = (0, 0, -500)   # 原件藏到地下
rnd = random.Random(1104)
for i, (x, z) in enumerate(X['trees']['palms']):
    if abs(z - ZC) < 70: place('palm_a', x, z, i * 1.7, (15 + (i % 3) * 1.2) / 18.0)
for i, (x, z) in enumerate(X['trees']['camphor']):
    if abs(z - ZC) < 70: place('camphor_a' if i % 2 else 'camphor_b', x, z, i * 2.3, (9 + (i % 4) * 1.1) / 10.0)
for k in range(150):   # 校園裡的樹：圍牆內 4～75 m（近的密一點，遠的大一點，從二樓看過去是一整片樹冠）
    x = CW['x'] + 4 + (rnd.random() ** 1.3) * 71; z = ZC - 60 + rnd.random() * 120
    place(rnd.choice(['camphor_a', 'camphor_b', 'banyan_a', 'banyan_a']), x, z, rnd.random() * 6.3, 0.9 + rnd.random() * 0.5 + (x - CW['x']) / 140)
# --ground（XS-WINCARD-1105，LAWWW2-C 11-05）：一樓店門裡往外看——騎樓的天花板、地磚、每間店靠北那一端的柱子（和 xinsheng3d.js 的騎樓、wz_street.py 的 xs_front 同一套位置）
GROUND = '--ground' in A
if GROUND:
    F = X['facade']; walk0 = WW['x0'] if WW.get('x0') is not None else F['upper']
    box('arc_floor', mat('arc_tile', '#c9c2b4', 0.85), F['x'], walk0, 0.0, 0.14, Z0, Z1)
    box('arc_ceil', mat('arc_ceil', '#e7e2d8', 0.9), F['x'], F['upper'] + 0.05, F['groundH'] - 0.05, F['groundH'] + 0.3, Z0, Z1)
    box('arc_beam', mat('arc_beam', '#d9d3c6', 0.85), F['upper'] - 0.35, F['upper'] + 0.05, F['groundH'] - 0.55, F['groundH'], Z0, Z1)
    pil = mat('arc_pillar', '#d6cfc1', 0.85)
    for q in X['shops']:
        if Z0 < q['z0'] < Z1: box('arc_pillar', pil, F['upper'] - 0.6, F['upper'], 0.0, F['groundH'], q['z0'], q['z0'] + 0.3)
fac = mat('campus_bldg', '#d9cfbd', 0.85); roofm = mat('campus_roof', '#8a7f72', 0.8); winm = mat('campus_win', '#5e6670', 0.3)
for (x0, z0, w, d, h) in ((95, ZC - 38, 18, 30, 16), (100, ZC + 8, 14, 26, 13), (120, ZC - 10, 20, 40, 22)):   # 樹後面遠遠的系館（看得到上半截）
    box('cbldg', fac, x0, x0 + w, 0, h, z0, z0 + d); box('croof', roofm, x0 - 0.3, x0 + w + 0.3, h, h + 0.4, z0 - 0.3, z0 + d + 0.3)
    for fy in range(2, int(h) - 1, 4):
        for zz in range(int(z0) + 2, int(z0 + d) - 1, 3): box('cwin', winm, x0 - 0.05, x0, fy, fy + 1.6, zz, zz + 1.6)
# 燈光、天空、相機（Cycles，和 aa_support/render_interior.py 同一套設定）
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '32'))
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
try: sc.view_settings.view_transform = 'AgX'
except Exception: pass
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(8 if NIGHT else 42); sky.sun_rotation = math.radians(120)
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.06 if NIGHT else 0.35
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun); sun.data.energy = 0.3 if NIGHT else 2.6
sun.rotation_euler = (math.radians(48), 0, math.radians(120))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = float(opt('--lens', '28')); cam.data.clip_end = 600
LOOKDY = float(opt('--look-dy', '0' if GROUND else '-3.2'))
eye = g2b((X['facade']['x'] - 0.3) if GROUND else (X['facade']['upper'] + 0.25), EYE_H, ZC); look = g2b(40.0, EYE_H + LOOKDY, ZC)
cam.location = eye; cam.rotation_euler = (look - eye).to_track_quat('-Z', 'Y').to_euler()
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.filepath = os.path.abspath(OUTP)
bpy.ops.render.render(write_still=True); print('render', OUTP, flush=True)
