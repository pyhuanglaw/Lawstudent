"""家具模組的預覽場景（Blender 渲染用，不是遊戲畫面）：讀 furniture_study.glb，照遊戲的放法排成三組——
自習區（雙人小桌＋面對面兩張椅子）、圓桌（四張椅子）、講堂（4 排×6 席、排距 1.0 m、每排升高 0.16 m、前面連續桌板、排尾側板、空位收起）
→ 輸出一個 GLB 給 render_cycles.py。
/opt/blenv/bin/python tools/blender/env_second/shots/furniture_preview.py -- <furniture_study.glb> <輸出.glb>"""
import math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = A[0], A[1]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(SRC))
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
    mt = bpy.data.materials.get(name + '_m') or bpy.data.materials.new(name + '_m'); mt.use_nodes = True
    mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*col, 1); mt.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
    me.materials.append(mt); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


# 地板（淺色磨石子的顏色；渲染用）
box('floor', -7, 9, -0.02, 0.0, -9, 4, (0.55, 0.53, 0.5))
# 自習區：兩張雙人小桌（左右間距 2.0 m）
for tx in (0.0, 2.0):
    put('study_table2', tx, 0, 0)
    put('study_chair', tx, 0, 0.65, math.pi); put('study_chair', tx, 0, -0.65, 0.0)
# 圓桌（四張椅子）
put('round_table', 5.0, 0, 0)
for a in (math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4):
    put('study_chair', 5.0 + 0.85 * math.sin(a), 0, 0.85 * math.cos(a), (a + math.pi) % (2 * math.pi))
# 講堂：4 排×6 席，往 -z 一排一排升高；講台在 +z
X0, Z0 = -5.5, -3.0
for r in range(4):
    y = 0.16 * (r + 1); z = Z0 - 1.0 * r
    box(f'riser{r}', X0 - 0.8, X0 + 6 * 0.52 + 0.6, 0.0, y, z - 0.65, z + 0.35, (0.36, 0.3, 0.26))
    for k in range(6):
        x = X0 + 0.52 * k
        occupied = (r, k) in ((0, 1), (0, 2), (1, 4), (2, 0), (2, 1), (3, 3))
        put('lecture_seat' if occupied or r == 3 else 'lecture_seat_up', x, y, z)   # 最後一排全部放下（比較用）
        put('lecture_desk', x, y, z)
    put('lecture_standard', X0 - 0.2525, y, z)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT)
