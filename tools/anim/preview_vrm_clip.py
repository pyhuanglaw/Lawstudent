#!/usr/bin/env python3
"""把 UAL 骨架的動作片段套到 VRoid 人物（VRM 0.x）上、用 Blender 拍預覽（NPC-ANIM-LOOPS-1104，LAWWW2-C 2026-11-04）。
做法和遊戲一樣（character3d.js 的 ambClip／sitAmbient）：每一根骨頭的「世界旋轉差」D＝片段裡的世界旋轉 × 靜止世界旋轉的反；
VRoid 的骨頭靜止時沒有旋轉，所以人物那一根骨頭的世界旋轉差就是 D（骨盆照遊戲不轉）。座標：UAL（+z 前、+x 左手邊）→ VRM 0.x（−z 前、+x 右手邊）→ Blender（Z 上）。
人物照遊戲的做法縮到身高 H、坐下往下 0.47×H/1.75；桌子照 sit_task_loops.REF（高 0.75 m、桌緣離座位 0.30 m）；筆電、筆記本、書、杯子、手機照實際尺寸。這只是預覽，不是遊戲畫面。

用法（Blender 的 Python）：
  /opt/blenv/bin/python tools/anim/preview_vrm_clip.py --vrm assets/models/char/vroid_npc_f1.vrm --src assets/models/char/ual_sit_clips.glb \
      --clips assets/models/char/ual_sit_tasks.glb --out 輸出資料夾 --body F [--names Sit_Type_F_Loop,...] [--times 0,1.8,2.3]
"""
import argparse, json, math, os, shutil, struct, sys
import numpy as np
import bpy
from mathutils import Matrix, Vector, Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sit_task_loops as T

ap = argparse.ArgumentParser()
ap.add_argument('--vrm', required=True); ap.add_argument('--src', required=True); ap.add_argument('--clips', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--names', default=''); ap.add_argument('--times', default='0,1.8,2.3'); ap.add_argument('--res', type=int, default=520); ap.add_argument('--body', default='F'); ap.add_argument('--props', default='')
A = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
os.makedirs(A.out, exist_ok=True)

UAL2VRM = {k: v for k, v in T.UAL2VRM.items() if not T.LEAF(k)}
M = np.array([[-1.0, 0, 0], [0, 0, 1.0], [0, 1.0, 0]])     # UAL → Blender（經過 VRM 0.x）：(x, y, z) → (−x, z, y)

# ---------------------------------------------------------------- 場景
bpy.ops.wm.read_factory_settings(use_empty=True)
tmp = os.path.join(A.out, '_in.glb'); shutil.copyfile(A.vrm, tmp)
bpy.ops.import_scene.gltf(filepath=tmp); os.remove(tmp)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
V = T.VSkel(A.vrm, T.BODIES[A.body][1]); T.set_body(V)
HP = {}
if A.props:                                                      # 手上配件 GLB（sit_task_props.py）：照遊戲的掛法——右手骨頭底下、不轉
    before = set(bpy.data.objects); tmp2 = os.path.join(A.out, '_props.glb'); shutil.copyfile(A.props, tmp2); bpy.ops.import_scene.gltf(filepath=tmp2); os.remove(tmp2)
    for o in set(bpy.data.objects) - before:
        if o.type == 'MESH' and o.name.split('.')[0] in ('hand_cup', 'hand_phone', 'hand_pen'):
            HP[o.name.split('.')[0]] = o; o.parent = None; o.hide_render = True
            for m in o.data.materials:                               # Workbench 拿「作用中」的貼圖節點當顏色：設成底色那一張（不然拿到自發光那一張＝全黑）
                for nd in m.node_tree.nodes:
                    if nd.type == 'TEX_IMAGE' and nd.image and 'atlas' in nd.image.name: m.node_tree.nodes.active = nd
DROP = 0.47 * V.H / 1.75
arm.scale = (V.s, V.s, V.s); arm.location = (0, 0, -DROP); bpy.context.view_layer.update()      # 遊戲：縮到身高、坐下往下 0.47×H/1.75
Aw = np.array(arm.matrix_world.to_3x3().normalized())
pb = arm.pose.bones
def depth(b): return 0 if b.parent is None else 1 + depth(b.parent)
order = sorted([b.name for b in arm.data.bones if b.name in UAL2VRM.values()], key=lambda n: depth(arm.data.bones[n]))
rest_rot = {n: np.array(arm.data.bones[n].matrix_local.to_3x3()) for n in order}
J, d, bo = T.load_glb(A.src); sk = T.Skel(J)
R0, P0 = T.rest_world(sk)
def ual_pt(p):
    """VRoid 骨架（UAL 的方向、站著的座標、腳底 y=0）的位置 → Blender 世界"""
    return M @ np.asarray(p, float) + np.array([0.0, 0.0, -DROP])
print('身材 %s：身高 %.2f、縮放 %.3f、手 %.3f m、坐下往下 %.3f' % (A.body, V.H, V.s, V.HL, DROP))

def pose(rot):
    wr, wp = sk.fk(rot)
    for n in order:
        u = next(k for k, v in UAL2VRM.items() if v == n)
        if u == 'pelvis': Dq = np.array([0, 0, 0, 1.0])
        else: Dq = T.qmul(wr[sk.idx[u]], T.qinv(R0[sk.idx[u]]))
        x, y, z, w = Dq; Dm = np.array(Quaternion((w, x, y, z)).to_matrix())
        Db = M @ Dm @ M.T; Darm = Aw.T @ Db @ Aw
        R = Darm @ rest_rot[n]
        b = pb[n]; head = b.head.copy()
        mat = Matrix(R.tolist()).to_4x4(); mat.translation = head
        b.matrix = mat; bpy.context.view_layer.update()

def mat_obj(name, col, alpha=1.0):
    m = bpy.data.materials.new(name); m.diffuse_color = (*col, alpha); return m
def box(name, size, loc, rotm=None, col=(0.6, 0.6, 0.6)):
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.active_object; o.name = name; o.scale = size
    if rotm is not None: o.rotation_euler = Matrix(rotm.tolist()).to_euler()
    o.location = loc; o.data.materials.append(mat_obj(name, col)); return o
def cyl(name, r, h, loc, axis, col):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=24); o = bpy.context.active_object; o.name = name
    z = Vector((0, 0, 1)); o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = z.rotation_difference(Vector(axis)); o.location = loc
    o.data.materials.append(mat_obj(name, col)); return o

PROPS = []
def clear_props():
    for o in PROPS: bpy.data.objects.remove(o, do_unlink=True)
    PROPS.clear()
def hand_frame_b(side):
    """人物（Blender）手的方向：f、n、b——和 sit_task_loops.hand_axes 同一個定義"""
    S = 'L' if side == 'l' else 'R'
    def P(n): return np.array(arm.matrix_world @ pb[n].head)
    h = P('J_Bip_%s_Hand' % S); f = P('J_Bip_%s_Middle1' % S) - h; f /= np.linalg.norm(f)
    lat = P('J_Bip_%s_Index1' % S) - P('J_Bip_%s_Little1' % S)
    n = np.cross(f, lat) * (1 if side == 'l' else -1); n /= np.linalg.norm(n); return h, f, n, np.cross(f, n)
def props(kind):
    D, E = T.DESK_Y, T.EDGE
    top = ual_pt((0, D, E + 0.4))[2]
    PROPS.append(box('desk', (1.2, 0.75, 0.03), tuple(ual_pt((0, D, E + 0.375)) - np.array([0, 0, 0.015])), col=(0.55, 0.42, 0.3)))
    if kind in ('type', 'typepad'):
        PROPS.append(box('laptop', (0.304 , 0.212 , 0.02 ), tuple(ual_pt((0, D + 0.01, E + 0.112))), col=(0.75, 0.76, 0.8)))
        PROPS.append(box('screen', (0.304 , 0.006 , 0.2 ), tuple(ual_pt((0, D + 0.115, E + 0.245))), rotm=np.array(Matrix.Rotation(-0.3, 3, 'X')), col=(0.2, 0.22, 0.26)))
    if kind == 'write': PROPS.append(box('notebook', (0.368 , 0.261 , 0.004 ), tuple(ual_pt((0, D + 0.002, E + 0.15))), col=(0.95, 0.94, 0.88)))
    if kind == 'page': PROPS.append(box('book', (0.31 , 0.22 , 0.025 ), tuple(ual_pt((0, D + 0.0125, E + 0.14))), col=(0.95, 0.92, 0.82)))
    for o in HP.values(): o.hide_render = True
    want = {'drink': 'hand_cup', 'phone': 'hand_phone', 'write': 'hand_pen'}.get(kind)
    if want in HP:
        hb = pb['J_Bip_R_Hand']; Rp = np.array(hb.matrix.to_3x3().normalized()); Rr = np.array(arm.data.bones['J_Bip_R_Hand'].matrix_local.to_3x3().normalized())
        Mx = Matrix((Rp @ Rr.T).tolist()).to_4x4(); Mx.translation = hb.head
        HP[want].matrix_world = arm.matrix_world @ Mx; HP[want].hide_render = False
        return
    if kind == 'drink':
        h, f, n, b = hand_frame_b('r'); B = T.basis(f, n); g = h + B @ (np.array(T.CUP_HAND) ); ax = b
        c = g + ax * ((T.CUP_H / 2 - T.CUP_GRIP) ); PROPS.append(cyl('cup', T.CUP_R , T.CUP_H , tuple(c), tuple(ax), (0.92, 0.9, 0.85)))
    if kind == 'phone':
        h, f, n, b = hand_frame_b('r'); B = T.basis(f, n); c = h + B @ (np.array(T.PHONE_HAND) )
        l_ = np.array(M @ np.array([0.0, 0.35, 1.0])); l_ = l_ - n * np.dot(l_, n); l_ /= np.linalg.norm(l_); m_ = np.cross(l_, n)
        R = np.column_stack([m_, l_, n]); PROPS.append(box('phone', (0.072 , 0.146 , 0.008 ), tuple(c), rotm=R, col=(0.1, 0.1, 0.12)))
    if kind in ('drink', 'eat'):                                         # 嘴的位置（sit_task_loops 用的那一點）：紅色小球
        hb = pb['J_Bip_C_Head']; Rp = np.array((arm.matrix_world @ hb.matrix).to_3x3().normalized()); Rr = np.array((arm.matrix_world @ arm.data.bones['J_Bip_C_Head'].matrix_local).to_3x3().normalized())
        mo = np.array(arm.matrix_world @ hb.head) + (Rp @ Rr.T) @ (M @ np.array(T.MOUTH))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.006, location=tuple(mo)); o = bpy.context.active_object; o.data.materials.append(mat_obj('mouth', (1, 0, 0))); PROPS.append(o)

# ---------------------------------------------------------------- 鏡頭、算圖
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'TEXTURE'
sc.display.shading.show_cavity = False; sc.render.resolution_x = A.res; sc.render.resolution_y = int(A.res * 1.0); sc.render.film_transparent = False
sc.world = bpy.data.worlds.new('w'); sc.display.shading.background_type = 'VIEWPORT'
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'
def shoot(path, view):
    tgt = ual_pt((0, T.DESK_Y + 0.13, 0.2))
    if view == 'front3q': dirv = M @ np.array([-0.35, 0.55, 1.0]); cam.data.ortho_scale = 0.95
    elif view == 'side': dirv = M @ np.array([-1.0, 0.08, 0.0]); cam.data.ortho_scale = 0.95
    else: dirv = M @ np.array([0.0, 0.1, 1.0]); cam.data.ortho_scale = 0.95
    dirv = dirv / np.linalg.norm(dirv); cam.location = tuple(tgt + dirv * 3.0)
    cam.rotation_mode = 'QUATERNION'; cam.rotation_quaternion = (Vector(tuple(-dirv))).to_track_quat('-Z', 'Y')
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)

Jc, dc, boc = T.load_glb(A.clips)
names = [a['name'] for a in Jc['animations'] if a['name'].endswith('_%s_Loop' % A.body)] if not A.names else A.names.split(',')
times = [float(x) for x in A.times.split(',')]
outs = []
for nm in names:
    kind = nm.replace('Sit_', '').replace('_Loop', '').replace('_F', '').replace('_M', '').lower()
    fr, L = T.sample_clip(Jc, dc, boc, sk, nm, times)
    for t, rot in zip(times, fr):
        pose(rot); clear_props(); props(kind)
        for view in ('front3q', 'side'):
            p = os.path.join(A.out, '%s_%s_t%.1f.png' % (nm, view, t)); shoot(p, view); outs.append(p)
json.dump(outs, open(os.path.join(A.out, 'shots.json'), 'w'))
print('done', len(outs))
