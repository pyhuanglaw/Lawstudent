"""室內 GLB 的 Blender 驗收渲染（不是遊戲截圖）：Cycles CPU、AgX、OIDN 降噪、Nishita 天空＋太陽；GLOW_ 節點放暖色點光源（燈泡）。
用法：/opt/blenv/bin/python tools/blender/env_second/aa_support/render_interior.py -- <glb> <輸出資料夾> <前綴> <views.json> [--res 1280x800] [--samples 48] [--exposure 0] [--sun 角度仰角,方位] [--sunC r,g,b] [--lampC r,g,b] [--hide 名稱片段]...（GLOW_*candle* 的燈只有 1/4 亮）
views.json：[["名稱", [眼睛 x,y,z], [看的點 x,y,z], 焦距mm, ["要藏的物件名稱片段", ...]], ...]（遊戲座標；第五欄可省略：例如鏡頭在牆外時藏那面牆 WALL_front）"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
def opt(k, d): return A[A.index(k) + 1] if k in A else d
RW, RH = map(int, opt('--res', '1280x800').split('x')); samples = int(opt('--samples', '48'))
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.cycles.max_bounces = 6
sc.view_settings.exposure = float(opt('--exposure', '0'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'
except Exception: pass
el, az = map(float, opt('--sun', '30,35').split(','))
try: sky.sun_elevation = math.radians(el); sky.sun_rotation = math.radians(az)
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = float(opt('--world', '0.35'))
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sunE', '2.2')); sun.data.color = tuple(map(float, opt('--sunC', '1.0,0.92,0.8').split(',')))   # v2：--sunC 傍晚的橘色; sun.data.angle = math.radians(2)
sun.rotation_euler = (math.radians(90 - el), 0, math.radians(az))
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -0.06)); gp = bpy.context.active_object
gm = bpy.data.materials.new('ground'); gm.use_nodes = True; gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.32, 0.31, 0.29, 1); gp.data.materials.append(gm)
n = 0
for ob in list(bpy.data.objects):
    if ob.name.startswith('GLOW_'):
        L_ = bpy.data.lights.new(f'pl{n}', 'POINT'); L_.energy = float(opt('--lamp', '25')) * (0.25 if 'candle' in ob.name else 1.0); L_.color = tuple(map(float, opt('--lampC', '1.0,0.78,0.55').split(','))); L_.shadow_soft_size = 0.06
        lo = bpy.data.objects.new(f'pl{n}', L_); sc.collection.objects.link(lo); lo.location = ob.matrix_world.translation; n += 1
print('lamps', n, flush=True)
for ob in bpy.data.objects:   # 窗景卡不擋陽光（遊戲裡是背景）
    if 'VIEW' in ob.name and ob.type == 'MESH': ob.visible_shadow = False
_gb = opt('--gobo', '')   # 窗外樹影（只擋陽光、鏡頭看不到）：--gobo x0,x1,y0,y1,z（遊戲座標，一片直立的板子，法線朝 ±z）；2026-11-04 AA 頁間書屋
if _gb:
    gx0, gx1, gy0, gy1, gz = map(float, _gb.split(','))
    import random as _r; _rr = _r.Random(7); W_, H_ = 512, 512
    img = bpy.data.images.new('gobo', W_, H_, alpha=True); pix = [1.0, 1.0, 1.0, 0.0] * (W_ * H_)
    for _ in range(260):   # 一片一片橢圓的葉子影子
        cx, cy, rx, ry = _rr.uniform(0, W_), _rr.uniform(0, H_), _rr.uniform(8, 26), _rr.uniform(5, 14)
        for yy in range(max(0, int(cy - ry)), min(H_, int(cy + ry))):
            for xx in range(max(0, int(cx - rx)), min(W_, int(cx + rx))):
                if ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1: pix[(yy * W_ + xx) * 4 + 3] = 1.0
    img.pixels = pix
    me = bpy.data.meshes.new('gobo'); vs = [g2b(gx0, gy0, gz), g2b(gx1, gy0, gz), g2b(gx1, gy1, gz), g2b(gx0, gy1, gz)]
    me.from_pydata(vs, [], [(0, 1, 2, 3)]); me.uv_layers.new(); ob_ = bpy.data.objects.new('gobo', me); sc.collection.objects.link(ob_)
    for i_, uv in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))): me.uv_layers[0].data[i_].uv = uv
    gmat = bpy.data.materials.new('gobo'); gmat.use_nodes = True; gnt = gmat.node_tree; tx = gnt.nodes.new('ShaderNodeTexImage'); tx.image = img
    gnt.links.new(tx.outputs['Alpha'], gnt.nodes['Principled BSDF'].inputs['Alpha']); gnt.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.05, 0.08, 0.04, 1)
    me.materials.append(gmat); ob_.visible_camera = False; ob_.visible_glossy = False; ob_.visible_diffuse = False
GHIDE = [A[i + 1] for i, x in enumerate(A) if x == '--hide']   # 全部視角都藏（2026-11-03 修：以前每個視角會把它重設回來）
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
for v in views:
    name, eye, look, lens = v[:4]; hide = v[4] if len(v) > 4 else []
    for ob in bpy.data.objects:
        if ob.type == 'MESH' and ob.name != 'Plane': ob.hide_render = any(h in ob.name for h in list(hide) + GHIDE)
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'{prefix}_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
