"""無頭 Blender 渲染一個 GLB（中性光：灰色環境＋一盞斜上方的太陽），多個方位角各一張。
用法：blender -b -P render_glb.py -- <in.glb> <輸出前綴> [--az 0,45,90,180] [--rot x,y,z（度）] [--res 512] [--samples 32] [--clay]
--clay：不用頂點色、全部灰色黏土（看形狀與拓樸）。印出三角形數、頂點數、尺寸。"""
import bpy, sys, math
from mathutils import Vector, Euler

A = sys.argv[sys.argv.index('--') + 1:]
glb, pre = A[0], A[1]
opt = lambda k, d=None: A[A.index(k) + 1] if k in A else d
AZ = [float(v) for v in opt('--az', '0,45,90,180').split(',')]
ROT = [math.radians(float(v)) for v in opt('--rot', '0,0,0').split(',')]
RES = int(opt('--res', 512)); SAMPLES = int(opt('--samples', 32)); CLAY = '--clay' in A

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
root = bpy.data.objects.new('root', None); bpy.context.scene.collection.objects.link(root)
for o in objs:
    if o.parent is None: o.parent = root
root.rotation_euler = Euler(ROT)
bpy.context.view_layer.update()
pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
size = mx - mn; ctr = (mn + mx) / 2
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs); verts = sum(len(o.data.vertices) for o in objs)
print(f'MESHINFO tris={tris} verts={verts} size=({size.x:.3f},{size.y:.3f},{size.z:.3f})')

mat = bpy.data.materials.new('m'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
bsdf.inputs['Roughness'].default_value = 0.75
if CLAY:
    bsdf.inputs['Base Color'].default_value = (0.62, 0.62, 0.6, 1)
else:
    attrs = [a.name for o in objs for a in o.data.color_attributes]
    if attrs:
        ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = attrs[0]; nt.links.new(ca.outputs['Color'], bsdf.inputs['Base Color'])
for o in objs:
    if CLAY or not o.data.materials or not any(m and m.use_nodes for m in o.data.materials):
        o.data.materials.clear(); o.data.materials.append(mat)

sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = RES; sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'
w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.42, 0.42, 0.42, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9; sc.world = w
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 2.2; sun.rotation_euler = Euler((math.radians(50), 0, math.radians(-35))); sc.collection.objects.link(sun)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = 50; sc.collection.objects.link(cam); sc.camera = cam
R = max(size) * 0.5 / math.tan(math.atan(18 / 50)) * 1.25 + max(size) * 0.5
for az in AZ:
    a = math.radians(az); el = math.radians(12)
    cam.location = ctr + Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el))) * R
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{pre}_az{int(az):03d}.png'; bpy.ops.render.render(write_still=True)
    print('RENDERED', sc.render.filepath)
