"""同弦樂器室內的 Cycles 預覽（CC 帳號 A；匯入 GLB；室內光：後窗的天光＋太陽、軌道投射燈、吊燈）
v2（11-03，CC_40 缺點 5：光太冷、太平）：午後的太陽更暖、更強，窗的天光改暖白、天花板補光減半，投射燈 2700K 左右、光錐收窄（吉他牆上看得到光斑）；960×540（BB：PC 渲染）
用法：blender -b --python render_tx.py -- <glb> <輸出資料夾> <views.json> [只渲染這幾個,逗號分隔]（PC 佇列：CC_BLENDER_DEVICE、CC_SAMPLES）"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, views = A[0], A[1], json.load(open(A[2]))
only = A[3].split(',') if len(A) > 3 else None
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(os.environ.get('CC_SAMPLES', '64'))
sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.render.resolution_x, sc.render.resolution_y = 960, 540; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = 0.3
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 64
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.82, 0.9, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.3
def light(kind, loc, energy, color=(1, 0.93, 0.82), size=0.2, aim=None, spot=None, sx=None, sy=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy
    elif kind != 'SUN': ld.shadow_soft_size = size
    if spot: ld.spot_size = math.radians(spot); ld.spot_blend = 0.6
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (aim - loc).to_track_quat('-Z', 'Y').to_euler()
    return o
H = 3.4
light('SUN', g2b(0, 5, -9), 4.5, color=(1, 0.82, 0.6), aim=g2b(0, 5, -9) + Vector((0.35, 1.0, -0.55)))     # 午後的太陽，從後窗斜照進來
light('AREA', g2b(-1.4, 1.7, -7.05), 220, color=(1.0, 0.93, 0.82), aim=g2b(-1.4, 1.2, 0), sx=3.4, sy=1.6)    # 窗的天光
light('AREA', g2b(0, H - 0.05, 0), 130, color=(1, 0.9, 0.78), aim=g2b(0, 0, 0), sx=6.5, sy=13.5)          # 天花板反射的補光
for z in [-6.15 + k * 1.52 for k in range(8)]:   # 吉他牆的軌道燈
    light('SPOT', g2b(2.35, H - 0.17, z), 110, color=(1, 0.78, 0.55), aim=g2b(3.4, 1.8, z), spot=42, size=0.04)
light('SPOT', g2b(2.35, H - 0.17, -6.15), 45, color=(1, 0.86, 0.66), aim=g2b(2.35, 1.5, -7.0), spot=40, size=0.04)
for z in (-2.35, -0.3, 1.75, 3.95): light('SPOT', g2b(-0.9, H - 0.17, z), 40, aim=g2b(-0.3, 0.9, z - 1.2), spot=70, size=0.05)
light('POINT', g2b(-1.55, 2.42, -5.1), 60, color=(1, 0.78, 0.52), size=0.05)   # 吊燈
light('AREA', g2b(1.0, 0.95, 3.3), 12, color=(1, 0.95, 0.85), aim=g2b(1.0, 0.0, 3.3), sx=0.4, sy=3.0)      # 櫃台裡的燈條
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'tx_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
