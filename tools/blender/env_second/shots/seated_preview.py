"""坐姿替身的預覽場景（Blender 渲染用，不是遊戲畫面）：讀 furniture_study.glb（講堂椅、桌板）和 seated_figures.glb，
照遊戲的放法（替身和講堂椅同一個原點）排成兩排，每個替身坐在一張椅子上 → 輸出 GLB 給 render_cycles.py。
/opt/blenv/bin/python tools/blender/env_second/shots/seated_preview.py -- <furniture_study.glb> <seated_figures.glb> <輸出.glb> [--lod1]"""
import math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
FURN, FIG, OUT = A[0], A[1], A[2]; LOD1 = '--lod1' in A
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(FURN)); bpy.ops.import_scene.gltf(filepath=os.path.abspath(FIG))
M = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
for o in M.values(): o.hide_render = True; o.hide_viewport = True
sc = bpy.context.scene


def put(name, x, y, z, yaw=0.0):
    src = M[name]; ob = bpy.data.objects.new(name + '_i', src.data); sc.collection.objects.link(ob)
    ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, yaw); return ob


def box(name, x0, x1, y0, y1, z0, z1, col):
    me = bpy.data.meshes.new(name); a, b = g2b(x0, y0, z1), g2b(x1, y1, z0)
    v = [(a.x, a.y, a.z), (b.x, a.y, a.z), (b.x, b.y, a.z), (a.x, b.y, a.z), (a.x, a.y, b.z), (b.x, a.y, b.z), (b.x, b.y, b.z), (a.x, b.y, b.z)]
    me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
    mt = bpy.data.materials.new(name + '_m'); mt.use_nodes = True
    mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*col, 1); mt.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
    me.materials.append(mt); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


figs = sorted(n for n in M if n.startswith('fig_') and (n.endswith('_lod1') == LOD1))
rows = [figs[i:i + 6] for i in range(0, len(figs), 6)]
for r, row in enumerate(rows):
    y = 0.16 * r; z = -1.0 * r
    box(f'riser{r}', -0.6, 0.52 * 8 + 0.4, 0.0, y, z - 0.65, z + 0.35, (0.36, 0.3, 0.26))
    for k in range(8):
        x = 0.52 * k; nm = row[k] if k < len(row) else None
        put('lecture_seat' if nm else 'lecture_seat_up', x, y, z); put('lecture_desk', x, y, z)
        if nm: put(nm, x, y, z)
    put('lecture_standard', -0.2525, y, z)
box('floor', -3, 7, -0.02, 0.0, -8, 4, (0.55, 0.53, 0.5))
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT, len(figs), 'figures')
