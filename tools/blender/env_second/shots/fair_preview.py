"""社團博覽會攤位的預覽場景（Blender 渲染用，不是遊戲畫面）：讀 club_fair.glb，照配置提案（clubfair_plan.py 的 --json）把攤位排在草地上，
前面是石磚人行道與柏油路的一部分 → 輸出 GLB 給 render_cycles.py。座標＝遊戲校園的世界座標。
/opt/blenv/bin/python tools/blender/env_second/shots/fair_preview.py -- <club_fair.glb> <plan.json> <輸出.glb>"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
GLB, PLAN, OUT = A[:3]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
M = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
for o in M.values(): o.hide_render = True; o.hide_viewport = True
sc = bpy.context.scene


def plane(name, x0, x1, z0, z1, y, col, rough=0.9):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(x0, y, z0)), tuple(g2b(x1, y, z0)), tuple(g2b(x1, y, z1)), tuple(g2b(x0, y, z1))], [], [(0, 1, 2, 3)]); me.update()
    mt = bpy.data.materials.new(name + '_m'); mt.use_nodes = True; b = mt.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; me.materials.append(mt)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def cyl(name, x, z, r, h, col):
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=h, location=tuple(g2b(x, h / 2, z)))
    ob = bpy.context.active_object; ob.name = name
    mt = bpy.data.materials.new(name + '_m'); mt.use_nodes = True; mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*col, 1); ob.data.materials.append(mt)


plane('grass', -40, 25, 8, 30, 0.0, (0.22, 0.34, 0.15))
plane('walk', -40, 25, 6, 8, 0.005, (0.55, 0.5, 0.43))
plane('road', -40, 25, -8, 6, 0.0, (0.42, 0.42, 0.41))
for k in range(25):   # 大王椰子的樹幹位置（只放樹幹，示意）
    x = -110 + 7.5 * k
    if -40 < x < 25: cyl(f'palm{k}', x, 9.5, 0.3, 6.0, (0.62, 0.6, 0.55))
for b in json.load(open(PLAN))['booths']:
    src = M['booth_' + b['id']]; ob = bpy.data.objects.new(b['id'], src.data); sc.collection.objects.link(ob)
    ob.location = g2b(b['x'], 0, b['z']); ob.rotation_euler = (0, 0, b['ry'])
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT)
