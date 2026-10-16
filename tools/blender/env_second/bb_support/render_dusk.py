"""ART-SHOP1 的傍晚暖光渲染（驗收用的 Blender 渲染圖，不是遊戲截圖）。寫法照 tools/blender/env_second/render_cycles.py（那份是共用工具，這裡不改它）：
匯入 GLB → Cycles（CPU、低取樣＋降噪）→ PNG → 轉 WebP（PIL，quality 82，PNG 刪掉）。
傍晚的光：
  - 天空：Nishita（Blender 5 改名 MULTIPLE_SCATTERING，兩個都試），太陽仰角 8°，強度比白天低；
  - 太陽燈：偏橘 (1.0, 0.72, 0.45)，仰角 8°、從左前方斜射進店裡；能量比白天（render_cycles.py 的 3.5）低；
  - 店裡一盞 3000K 暖色點光（約 (1.0, 0.70, 0.42)），在畫面上方；
  - 灰色地面；鏡頭指定 wall 的加一面背牆（只在渲染裡，不進 GLB；Poly Haven painted_plaster_wall，CC0）；
  - 色彩 Standard（AgX 會把飽和的紅、藍洗淡）；曝光用 --exposure 調到不過曝、不死黑。
用法：
  /opt/blenv/bin/python tools/blender/env_second/bb_support/render_dusk.py -- <glb> <輸出資料夾> <前綴> <views.json>
        [--samples 48] [--exposure EV] [--sun W/m²] [--sky 強度] [--lamp W] [--only 名稱,名稱] [--scale 0.5] [--keep-png] [--threads N]
  例：/opt/blenv/bin/python tools/blender/env_second/bb_support/render_dusk.py -- assets/models/env/second_ai/bb_support/scooter_shop_props.glb \\
        docs/art-rebuild/second_ai/test_shots/bb_support/scooter_shop shop1 tools/blender/env_second/bb_support/scooter_shop_views.json
views.json（遊戲座標：y 上、+z 朝前）：[{"name": 名稱, "eye": [x,y,z], "look": [x,y,z], "lens": 焦距mm, "res": "1280x640", "samples": 48,
  "only": 頂層節點名稱（只渲染這一件，並把它搬到原點、不轉）或 {名稱: [x, z, yaw°], ...}（只渲染這幾件、擺在指定位置）,
  "wall": 背牆的 z（不給就沒有牆）, "lamp": [x,y,z]（點光位置；不給就在看的點上方 2.5 m、往前 0.8 m）, "lamp_w": 點光瓦數}, ...]
--only：只渲染這幾個鏡頭（名稱用逗號分開）；--scale：解析度倍率（試算用）。
"""
import json, math, os, sys
import bpy
from mathutils import Vector, Matrix
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
SAMPLES = int(opt('--samples', 48)); SCALE = float(opt('--scale', 1.0))
ONLY = opt('--only', None); ONLY = set(ONLY.split(',')) if ONLY else None
HERE = os.path.dirname(os.path.abspath(__file__)); TEXR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'textures')
g2b = lambda x, y, z: Vector((x, -z, y))
SUN_ELEV, SUN_AZ = 8.0, -35.0          # 仰角；方位（rz：−35° 是從左前方照進來）
SUN_COL, LAMP_COL = (1.0, 0.72, 0.45), (1.0, 0.70, 0.42)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.view_settings.view_transform = opt('--view', 'Standard')
sc.view_settings.exposure = float(opt('--exposure', 0.0))
sc.cycles.max_bounces = 6
if '--threads' in A: sc.render.threads_mode = 'FIXED'; sc.render.threads = int(opt('--threads', 4))
# 天空
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
for t in ('NISHITA', 'MULTIPLE_SCATTERING', 'SINGLE_SCATTERING'):
    try: sky.sky_type = t; break
    except Exception: continue
try: sky.sun_elevation = math.radians(SUN_ELEV); sky.sun_rotation = math.radians((SUN_AZ + 180 + 360) % 360)
except Exception: pass
try: sky.sun_disc = False                # 太陽交給太陽燈：天空裡的太陽圓盤是物理亮度，會整片過曝
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = float(opt('--sky', 0.35))
# 太陽燈（偏橘、低）
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sun', 2.2)); sun.data.color = SUN_COL; sun.data.angle = math.radians(1.2)
sun.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(SUN_AZ))
# 店裡的暖色點光（3000K）
lamp = bpy.data.objects.new('lamp', bpy.data.lights.new('lamp', 'POINT')); sc.collection.objects.link(lamp)
lamp.data.energy = float(opt('--lamp', 140)); lamp.data.color = LAMP_COL; lamp.data.shadow_soft_size = 0.3
# 灰色地面
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -0.002)); gp = bpy.context.active_object; gm = bpy.data.materials.new('ground'); gm.use_nodes = True
gb = gm.node_tree.nodes['Principled BSDF']; gb.inputs['Base Color'].default_value = (0.30, 0.30, 0.29, 1); gb.inputs['Roughness'].default_value = 0.88; gp.data.materials.append(gm)
# 背牆（只在渲染裡）：14×5 m，面朝 +z
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0)); wall = bpy.context.active_object; wall.name = 'render_wall'
wall.scale = (14, 5, 1); wall.rotation_euler = (math.radians(90), 0, 0)
wmat = bpy.data.materials.new('wall'); wmat.use_nodes = True; wn = wmat.node_tree.nodes; wl = wmat.node_tree.links; wb = wn['Principled BSDF']
wb.inputs['Roughness'].default_value = 0.92
tex = os.path.join(TEXR, 'painted_plaster_wall', 'painted_plaster_wall_diff_1k.jpg')
if os.path.exists(tex):
    ti = wn.new('ShaderNodeTexImage'); ti.image = bpy.data.images.load(tex); tc = wn.new('ShaderNodeTexCoord'); mp = wn.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (7.0, 2.5, 1.0); wl.new(tc.outputs['UV'], mp.inputs['Vector']); wl.new(mp.outputs['Vector'], ti.inputs['Vector'])
    mx = wn.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
    mx.inputs[6].default_value = (0.62, 0.58, 0.52, 1); wl.new(ti.outputs['Color'], mx.inputs[7]); wl.new(mx.outputs[2], wb.inputs['Base Color'])
else: wb.inputs['Base Color'].default_value = (0.42, 0.40, 0.37, 1)
wall.data.materials.append(wmat)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o not in (gp, wall)]
orig = {o.name: o.matrix_world.copy() for o in meshes}
for v in views:
    name = v['name']
    if ONLY and name not in ONLY: continue
    for o in meshes:
        o.matrix_world = orig[o.name]; o.hide_render = False
    if v.get('only'):
        keep = v['only'] if isinstance(v['only'], dict) else {v['only']: [0.0, 0.0, 0.0]}
        for o in meshes:
            if o.name in keep:
                x, z, yaw = keep[o.name]; o.matrix_world = Matrix.Translation(g2b(x, 0.0, z)) @ Matrix.Rotation(math.radians(yaw), 4, 'Z')
            else: o.hide_render = True
    wall.hide_render = 'wall' not in v
    if 'wall' in v: wall.location = g2b(0.0, 2.5, v['wall'])
    look = v['look']; lp = v.get('lamp') or [look[0], look[1] + 2.5, look[2] + 0.8]
    lamp.location = g2b(*lp); lamp.data.energy = float(v.get('lamp_w', opt('--lamp', 140)))
    rw, rh = map(int, v.get('res', '1280x640').split('x'))
    sc.render.resolution_x, sc.render.resolution_y = max(16, int(rw * SCALE)), max(16, int(rh * SCALE))
    sc.cycles.samples = int(v.get('samples', SAMPLES))
    cam.data.lens = v['lens']; cam.location = g2b(*v['eye']); d = g2b(*look) - g2b(*v['eye']); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    png = os.path.join(outdir, f'{prefix}_{name}.png'); sc.render.filepath = png
    bpy.ops.render.render(write_still=True)
    from PIL import Image
    Image.open(png).convert('RGB').save(png[:-4] + '.webp', 'WEBP', quality=82)
    if '--keep-png' not in A: os.remove(png)
    print('render', png[:-4] + '.webp', flush=True)
