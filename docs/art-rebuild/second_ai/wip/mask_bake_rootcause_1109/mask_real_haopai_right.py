# 好拍的真實幾何：只烘左牆（WALL_left_wall_wall），一盞面光源在店中間往左牆照；比較 hp_alpha 有／藏
import bpy, sys, numpy as np, re
A = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=A[0])
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 16; sc.cycles.use_denoising = False
sc.render.threads_mode = 'FIXED'; sc.render.threads = 2; sc.cycles.transparent_max_bounces = 16
for o in bpy.data.objects:
    if o.type == 'LIGHT': o.hide_render = True
    if o.type == 'MESH' and re.search('glass', o.name): o.hide_render = True
wall = bpy.data.objects['WALL_right_wall_wall']
alpha = [o for o in bpy.data.objects if o.type == 'MESH' and any(s.material and s.material.name == 'hp_alpha' for s in o.material_slots)]
print('alpha objs', len(alpha), [o.name for o in alpha][:6])
# LM：新的 UV 層，智慧展開
me = wall.data; uvl = me.uv_layers.new(name='LMx'); me.uv_layers.active = uvl
bpy.ops.object.select_all(action='DESELECT'); wall.select_set(True); bpy.context.view_layer.objects.active = wall
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.subdivide(number_cuts=24); bpy.ops.uv.smart_project(island_margin=0.02); bpy.ops.object.mode_set(mode='OBJECT')
R = 128; img = bpy.data.images.new('LM', R, R, float_buffer=True)
for s in wall.material_slots:
    nt = s.material.node_tree; n = nt.nodes.new('ShaderNodeTexImage'); n.image = img; nt.nodes.active = n
    uvm = nt.nodes.new('ShaderNodeUVMap'); uvm.uv_map = 'LMx'; nt.links.new(uvm.outputs[0], n.inputs[0])
ld = bpy.data.lights.new('L', 'AREA'); ld.energy = 300; ld.size = 2.0; lo = bpy.data.objects.new('L', ld); sc.collection.objects.link(lo)
lo.location = (-0.5, -2.5, 1.8); lo.rotation_euler = (0, -np.pi / 2, 0)   # 朝 +x（右牆）
# 只量洞洞板後面那一塊牆：牆的世界座標 z 1.2～2.5、y -6.5～0.8
def bake(tag):
    bpy.ops.object.select_all(action='DESELECT'); wall.select_set(True); bpy.context.view_layer.objects.active = wall
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT'}, margin=2, use_clear=True)
    px = np.empty(R * R * 4, dtype=np.float32); img.pixels.foreach_get(px); P = px.reshape(R, R, 4)
    # 牆上每個面的中心 → UV → 像素，取在洞洞板後面的面
    vals = []; uvd = me.uv_layers['LMx'].data; mw = wall.matrix_world
    for p in me.polygons:
        c = mw @ p.center
        if -6.5 < c.y < 0.8 and 1.2 < c.z < 2.5 and p.normal.x > 0.5 or True:
            for li in p.loop_indices:
                u, v = uvd[li].uv; vals.append((c.y, c.z, P[min(R - 1, int(v * R)), min(R - 1, int(u * R)), :3].mean()))
    print('BAKE', tag, 'mean', round(float(P[..., :3].mean()), 4), flush=True); return P
a = bake('有板'); 
for o in alpha: o.hide_render = True
b = bake('藏板')
for o in alpha: o.hide_render = False
def region(P):
    uvd = me.uv_layers['LMx'].data; mw = wall.matrix_world; ins, out = [], []
    for p in me.polygons:
        c = mw @ p.center; n = (mw.to_3x3() @ p.normal)
        if n.x > -0.5: continue
        u = sum(uvd[li].uv[0] for li in p.loop_indices) / len(p.loop_indices); v = sum(uvd[li].uv[1] for li in p.loop_indices) / len(p.loop_indices)
        val = P[min(R - 1, int(v * R)), min(R - 1, int(u * R)), :3].mean()
        (ins if (-6.5 < c.y < 1.1 and 0.5 < c.z < 3.2) else out).append(val)
    return np.mean(ins), np.mean(out), len(ins), len(out)
ra, rb = region(a), region(b)
print('REGION 有板：板後 %.4f（%d 面）其他 %.4f（%d 面）' % (ra[0], ra[2], ra[1], ra[3]))
print('REGION 藏板：板後 %.4f 其他 %.4f' % (rb[0], rb[1]))
print('RATIO 板後 有板／藏板', round(float(ra[0] / rb[0]), 3), '（貼圖透空 0.646）')
d = np.abs(a - b)[..., :3].mean(-1); m = b[..., :3].mean(-1) > 1e-4
print('RATIO 有板／藏板（有光的格子）', round(float(a[..., :3].mean(-1)[m].sum() / b[..., :3].mean(-1)[m].sum()), 3))
