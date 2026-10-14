"""醉月湖的預覽場景（Blender 渲染用，不是遊戲畫面）：讀 campus_lake.glb，加上示意的水面（照遊戲 lake() 的外形）與草地 → 輸出 GLB 給 render_cycles.py。
座標＝湖的本地座標（原點＝湖中心）。
/opt/blenv/bin/python tools/blender/env_second/shots/lake_preview.py -- <campus_lake.glb> <輸出.glb>"""
import math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
GLB, OUT = A[:2]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
sc = bpy.context.scene


def mat(name, col, rough=0.9, metal=0.0):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; b = mt.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return mt


def poly(name, pts, y, m):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(x, y, z)) for x, z in pts], [], [tuple(range(len(pts)))]); me.update(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


A_, B_, N = 16.5, 9.2, 80
rad = lambda t: 1 + 0.10 * math.sin(3 * t + 0.6) + 0.05 * math.cos(5 * t + 1.3)
P = [(math.cos(i / N * 2 * math.pi) * A_ * rad(i / N * 2 * math.pi), math.sin(i / N * 2 * math.pi) * B_ * rad(i / N * 2 * math.pi)) for i in range(N)]
poly('water', [(x * 1.004, z * 1.004) for x, z in P], 0.035, mat('water', (0.03, 0.07, 0.06), rough=0.08))
poly('grass', [(-40, -30), (40, -30), (40, 30), (-40, 30)], -0.002, mat('grass', (0.2, 0.32, 0.14)))
poly('path', [(-25, 13.2), (25, 13.2), (25, 15.4), (-25, 15.4)], 0.004, mat('path', (0.62, 0.58, 0.52)))
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT)
