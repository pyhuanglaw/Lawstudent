"""TripoSR 輸出的整理（Blender 無頭）：法線翻正、轉成遊戲座標（glTF Y 向上、+Z 朝前）、縮到真實高度、原點放在底部中心、
刪掉小碎塊、平滑、減面成兩個版本（近景 / 遠景），匯出 GLB（頂點色）。
用法：blender -b -P cleanup_tsr.py -- <in.glb> <out_prefix> --height 1.3 [--lod0 8000] [--lod1 2000] [--rot x,y,z]"""
import bpy, bmesh, sys, math
from mathutils import Vector, Euler, Matrix

A = sys.argv[sys.argv.index('--') + 1:]
src, pre = A[0], A[1]
opt = lambda k, d=None: A[A.index(k) + 1] if k in A else d
HEIGHT = float(opt('--height', 1.0)); LOD0 = int(opt('--lod0', 8000)); LOD1 = int(opt('--lod1', 2000))
ROT = [math.radians(float(v)) for v in opt('--rot', '90,0,0').split(',')]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in obs: o.select_set(True)
bpy.context.view_layer.objects.active = obs[0]
if len(obs) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active
for o in list(bpy.context.scene.objects):
    if o.type != 'MESH': bpy.data.objects.remove(o)
ob.parent = None
ob.matrix_world = Matrix.Rotation(ROT[2], 4, 'Z') @ Matrix.Rotation(ROT[1], 4, 'Y') @ Matrix.Rotation(ROT[0], 4, 'X') @ ob.matrix_world   # 先轉 X、再 Y、再 Z
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data
n0 = len(me.polygons)
bm = bmesh.new(); bm.from_mesh(me)
# 小碎塊：面數不到最大塊 2% 的刪掉（漂浮的雜點）
bm.faces.ensure_lookup_table()
islands, seen = [], set()
for f in bm.faces:
    if f.index in seen: continue
    stack, isl = [f], []
    seen.add(f.index)
    while stack:
        g = stack.pop(); isl.append(g)
        for e in g.edges:
            for h in e.link_faces:
                if h.index not in seen: seen.add(h.index); stack.append(h)
    islands.append(isl)
big = max(len(i) for i in islands)
drop = [f for i in islands if len(i) < 0.02 * big for f in i]
bmesh.ops.delete(bm, geom=drop, context='FACES')
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)   # marching cubes 的繞向反了：一律重算朝外
bm.to_mesh(me); bm.free()
print(f'CLEAN islands={len(islands)} dropped_faces={len(drop)} faces {n0} -> {len(me.polygons)}')
# 尺寸、原點
bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
mnz = min(p.z for p in bb); mxz = max(p.z for p in bb)
cx = (min(p.x for p in bb) + max(p.x for p in bb)) / 2; cy = (min(p.y for p in bb) + max(p.y for p in bb)) / 2
s = HEIGHT / (mxz - mnz)
ob.location = (-cx * s, -cy * s, -mnz * s); ob.scale = (s, s, s)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# 平滑（marching cubes 的階梯紋）
mod = ob.modifiers.new('smooth', 'SMOOTH'); mod.factor = 0.5; mod.iterations = 2
bpy.ops.object.modifier_apply(modifier='smooth')
bpy.ops.object.shade_smooth()
base = len(me.polygons)
# 頂點色接進材質（glTF 匯出器只在材質用到頂點色時才匯出 COLOR_0）
mat = bpy.data.materials.new('tsr_vcol'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 0.8
if me.color_attributes:
    vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = me.color_attributes[0].name; nt.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
me.materials.clear(); me.materials.append(mat)


def export(tag, target):
    o2 = ob.copy(); o2.data = ob.data.copy(); bpy.context.scene.collection.objects.link(o2)
    bpy.ops.object.select_all(action='DESELECT'); o2.select_set(True); bpy.context.view_layer.objects.active = o2
    if target < len(o2.data.polygons):
        d = o2.modifiers.new('dec', 'DECIMATE'); d.ratio = target / len(o2.data.polygons); bpy.ops.object.modifier_apply(modifier='dec')
    tris = sum(len(p.vertices) - 2 for p in o2.data.polygons)
    out = f'{pre}_{tag}.glb'
    bpy.ops.export_scene.gltf(filepath=out, use_selection=True, export_format='GLB', export_yup=True)
    print(f'EXPORT {out} tris={tris}')
    bpy.data.objects.remove(o2)


export('full', base); export('lod0', LOD0); export('lod1', LOD1)
