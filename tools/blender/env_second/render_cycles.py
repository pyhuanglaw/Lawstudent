"""Blender 模型渲染圖（驗收用，D38 第 12.8 節的⑤；不是遊戲截圖）：匯入 GLB → Cycles（CPU、低取樣＋降噪）→ PNG。
這個沙盒的 EEVEE 要用軟體 OpenGL，一張圖十幾分鐘還出不來，所以用 Cycles。
用法：/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- <glb> <輸出資料夾> <前綴> <views.json> [--res 960x600] [--samples 24] [--night]
views.json：[["名稱", [眼睛 x,y,z], [看的點 x,y,z], 鏡頭焦距mm], ...]（遊戲座標）"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
res = A[A.index('--res') + 1] if '--res' in A else '960x600'; RW, RH = map(int, res.split('x'))
samples = int(A[A.index('--samples') + 1]) if '--samples' in A else 24
night = '--night' in A
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'
sc.cycles.max_bounces = 4
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'
except Exception: pass
try:
    sky.sun_elevation = math.radians(4 if night else 28); sky.sun_rotation = math.radians(250)
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.05 if night else 0.6
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 0.2 if night else 3.5; sun.rotation_euler = (math.radians(62), 0, math.radians(-110))
if night:   # 夜景：燈泡位置放點光（GLB 的 GLOW_* 空節點）
    for o in list(sc.objects):
        if o.name.startswith('GLOW_'):
            lt = bpy.data.objects.new('pt_' + o.name, bpy.data.lights.new('pt', 'POINT')); lt.data.energy = 25; lt.data.color = (1.0, 0.8, 0.55); lt.location = o.matrix_world.translation; sc.collection.objects.link(lt)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    cam.data.lens = lens; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'{prefix}_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
