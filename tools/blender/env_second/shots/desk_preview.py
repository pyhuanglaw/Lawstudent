"""桌上小物的預覽場景（Blender 渲染用，不是遊戲畫面）：讀 furniture_study.glb（桌椅、講堂椅）、seated_figures.glb（坐姿替身）、desk_props.glb，
照遊戲的放法排好 → 輸出 GLB 給 render_cycles.py。
/opt/blenv/bin/python tools/blender/env_second/shots/desk_preview.py -- <furniture_study.glb> <seated_figures.glb> <desk_props.glb> <輸出.glb> <場景>
場景：items（單件排在一張大桌上）、lecture（講堂兩排：替身＋lset 組；後面一排 LOD1）、study（自習雙人桌＋圓桌：替身＋tset／rset 組）"""
import math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
FURN, FIG, PROPS, OUT, SCENE = A[:5]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
for f in (FURN, FIG, PROPS): bpy.ops.import_scene.gltf(filepath=os.path.abspath(f))
M = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
for o in M.values(): o.hide_render = True; o.hide_viewport = True
sc = bpy.context.scene


def put(name, x, y, z, yaw=0.0):
    src = M[name]; ob = bpy.data.objects.new(name + '_i', src.data); sc.collection.objects.link(ob)
    ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, yaw); return ob


def box(name, x0, x1, y0, y1, z0, z1, col, rough=0.8):
    me = bpy.data.meshes.new(name); a, b = g2b(x0, y0, z1), g2b(x1, y1, z0)
    v = [(a.x, a.y, a.z), (b.x, a.y, a.z), (b.x, b.y, a.z), (a.x, b.y, a.z), (a.x, a.y, b.z), (b.x, a.y, b.z), (b.x, b.y, b.z), (a.x, b.y, b.z)]
    me.from_pydata(v, [], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]); me.update()
    mt = bpy.data.materials.new(name + '_m'); mt.use_nodes = True
    mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*col, 1); mt.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = rough
    me.materials.append(mt); ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


def fwd(yaw): return math.sin(yaw), math.cos(yaw)


if SCENE == 'items':
    box('top', -0.9, 0.9, 0.70, 0.75, -0.6, 0.6, (0.55, 0.42, 0.3), 0.5)
    box('floor', -3, 3, -0.02, 0.0, -3, 3, (0.5, 0.5, 0.5))
    items = sorted(n for n in M if n.startswith('item_'))
    cols = 5
    for i, n in enumerate(items):
        x = -0.72 + (i % cols) * 0.36; z = -0.42 + (i // cols) * 0.3
        put(n, x, 0.75, z, 0.0)
elif SCENE == 'lecture':
    box('floor', -3, 6, -0.02, 0.0, -8, 4, (0.55, 0.53, 0.5))
    row0 = [('fig_npc_f1_write_c0', 'lset_write'), ('fig_npc_m1_phone_c0', 'lset_phone'), ('fig_npc_f2_listen_c1', 'lset_laptop'), (None, None),
            ('fig_npc_m2_listen_c0', 'lset_book'), ('fig_npc_f1_listen_c1', 'lset_code'), ('fig_npc_m2_write_c1', 'lset_write'), ('fig_npc_f2_phone_c0', 'lset_phone')]
    for r in range(3):
        y = 0.16 * r; z = -1.0 * r; lod = '_lod1' if r == 2 else ''
        box(f'riser{r}', -0.6, 0.52 * 8 + 0.4, 0.0, y, z - 0.65, z + 0.35, (0.36, 0.3, 0.26))
        for k in range(8):
            x = 0.52 * k; fig, ps = row0[(k + 3 * r) % 8]
            put('lecture_seat' if fig else 'lecture_seat_up', x, y, z); put('lecture_desk', x, y, z)
            if fig: put(fig + lod, x, y, z); put(ps + lod, x, y, z)
        put('lecture_standard', -0.2525, y, z)
elif SCENE == 'study':
    box('floor', -4, 4, -0.02, 0.0, -4, 4, (0.6, 0.58, 0.55))
    # 自習雙人桌兩張（桌子長邊沿 x；椅子在 ±z）：四個人
    T1 = [(-0.6, 0.0, [('fig_npc_f2_write_c0', 'tset_notes'), ('fig_npc_m1_listen_c1', 'tset_laptop')]),
          (0.6, 0.0, [('fig_npc_m2_phone_c1', 'tset_book'), (None, 'tset_away')])]
    for tx, tz, people in T1:
        put('study_table2', tx, 0, tz, 0)
        for (fig, ps), yaw in zip(people, (0.0, math.pi)):
            fx, fz = fwd(yaw)
            put('study_chair', tx - fx * 0.55, 0, tz - fz * 0.55, yaw)
            if fig: put(fig, tx - fx * 0.58, -0.02, tz - fz * 0.58, yaw)
            if fig and fig.split('_')[3] == 'phone': put('hold_phone', tx - fx * 0.58, -0.02, tz - fz * 0.58, yaw)
            put(ps, tx - fx * 0.3, 0.75, tz - fz * 0.3, yaw)
    # 圓桌：四個位子
    cx, cz = 0.0, 1.9
    put('round_table', cx, 0, cz, 0)
    for a, (fig, ps) in zip((0.0, math.pi / 2, math.pi, 1.5 * math.pi), (('fig_npc_f1_write_c1', 'rset_notes'), ('fig_npc_m2_listen_c1', 'rset_laptop'), (None, 'rset_book'), ('fig_npc_f2_phone_c1', 'rset_cup'))):
        sx, sz = math.sin(a), math.cos(a); yaw = a + math.pi
        put('study_chair', cx + sx * 0.8, 0, cz + sz * 0.8, yaw)
        if fig:
            put(fig, cx + sx * 0.83, -0.02, cz + sz * 0.83, yaw)
            if 'phone' in fig: put('hold_phone', cx + sx * 0.83, -0.02, cz + sz * 0.83, yaw)
        put(ps, cx + sx * 0.5, 0.75, cz + sz * 0.5, yaw)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_yup=True, use_visible=True, export_apply=True)
print('ok', OUT, SCENE)
