"""教室門模組的預覽場景（Blender 渲染用，不是遊戲畫面）：兩段牆（厚 0.2、門洞 1.2×2.4）、一個開著的門（門片貼牆）＋門牌、一個關著的門。
/opt/blenv/bin/python tools/blender/env_second/shots/door_preview.py -- <furniture_study.glb> <輸出.glb>"""
import os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
FURN, OUT = A[0], A[1]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(FURN))
M = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
for o in M.values(): o.hide_render = True; o.hide_viewport = True
sc = bpy.context.scene


def put(name, x, y, z, yaw=0.0):
    ob = bpy.data.objects.new(name + '_i', M[name].data); sc.collection.objects.link(ob); ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, yaw); return ob


def box(name, x0, x1, y0, y1, z0, z1, col):
    me = bpy.data.meshes.new(name); a, b = g2b(x0, y0, z1), g2b(x1, y1, z0)
    v = [(a.x, a.y, a.z), (b.x, a.y, a.z), (b.x, b.y, a.z), (a.x, b.y, a.z), (a.x, a.y, b.z), (b.x, a.y, b.z), (b.x, b.y, b.z), (a.x, b.y, b.z)]
    me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
    mt = bpy.data.materials.get(name[:4] + '_m') or bpy.data.materials.new(name[:4] + '_m'); mt.use_nodes = True
    mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*col, 1); mt.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.85
    me.materials.append(mt); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


WALL = (0.55, 0.53, 0.5)
box('floor', -6, 8, -0.02, 0.0, -4, 4, (0.6, 0.58, 0.55))
for cx in (0.0, 5.0):   # 兩個門：牆在 z=0，門洞中心 x=cx
    box(f'wallL{cx}', cx - 2.4, cx - 0.6, 0.0, 3.2, -0.1, 0.1, WALL); box(f'wallR{cx}', cx + 0.6, cx + 2.4, 0.0, 3.2, -0.1, 0.1, WALL)
    box(f'wallH{cx}', cx - 0.6, cx + 0.6, 2.4, 3.2, -0.1, 0.1, WALL)
    put('door_frame', cx, 0, 0); put('door_plate', cx, 0, 0)
put('door_leaf_open', 0.0, 0, 0); put('door_leaf_closed', 5.0, 0, 0)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT)
