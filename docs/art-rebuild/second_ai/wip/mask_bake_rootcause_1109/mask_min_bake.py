# 最小場景：一面牆（烘焙）、前面 9 mm 一片好拍洞洞板（hp_alpha 材質，從 GLB 匯入）、一盞面光源。比較：有板／藏板／板換成不透明
import bpy, sys, numpy as np
A = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=A[0])
mat = bpy.data.materials[A[2]]
tex = next(x for x in mat.node_tree.nodes if x.type == 'TEX_IMAGE'); im = tex.image; _p = np.empty(im.size[0] * im.size[1] * 4, np.float32); im.pixels.foreach_get(_p); print('EXPECT 貼圖整張透空', round(float((_p[3::4] < 0.5).mean()), 3))
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(A[1]) if len(A) > 1 else 32
sc.cycles.transparent_max_bounces = 16; sc.cycles.use_denoising = False; sc.render.threads_mode = 'FIXED'; sc.render.threads = 2
# 牆：1×1 m，在 y=0 平面，法線朝 -y
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0, 0), rotation=(np.pi / 2, 0, 0)); wall = bpy.context.object; wall.name = 'wall'
wm = bpy.data.materials.new('wallm'); wm.use_nodes = True; wall.data.materials.append(wm)
img = bpy.data.images.new('LM', 64, 64, float_buffer=True); n = wm.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; wm.node_tree.nodes.active = n
# 板：在牆前 9 mm（y=-0.009），用 hp_alpha，UV 0..1（貼圖 2048×1024，重複 1 次）
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, -0.009, 0), rotation=(np.pi / 2, 0, 0)); card = bpy.context.object; card.name = 'card'; card.data.materials.append(mat)
# 光：在 y=-1.5 朝 +y
ld = bpy.data.lights.new('L', 'AREA'); ld.energy = 200; ld.size = 1.0; lo = bpy.data.objects.new('L', ld); sc.collection.objects.link(lo); lo.location = (0, -1.5, 0); lo.rotation_euler = (np.pi / 2, 0, 0)
def bake(tag):
    for o in bpy.data.objects: o.select_set(False)
    wall.select_set(True); bpy.context.view_layer.objects.active = wall
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT'}, margin=0, use_clear=True)
    px = np.empty(64 * 64 * 4, dtype=np.float32); img.pixels.foreach_get(px); v = px.reshape(-1, 4)[:, :3].mean()
    print('BAKE', tag, round(float(v), 4), flush=True); return v
a = bake('有板（hp_alpha）')
card.hide_render = True; b = bake('藏板'); card.hide_render = False
om = bpy.data.materials.new('opaque'); om.use_nodes = True; card.data.materials[0] = om; c = bake('板換成不透明'); card.data.materials[0] = mat
print('RATIO 有板／藏板', round(float(a / b), 3), '不透明／藏板', round(float(c / b), 3))
