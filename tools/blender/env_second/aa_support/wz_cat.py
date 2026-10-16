"""ART-WZ5 溫州街的貓（AA_164 5-5、AA_167 線四；LAWWW2-B 分工 SCENE_RULES.md 第 8 節；AA-B 支援製作 2026-10-16）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/wz_cat.py [-- --out assets/models/env/second_ai/aa_support/wz_cat.glb]

一隻橘白色的胖貓（體長約 46 cm，不含尾巴）。三種靜態姿勢，每個一個頂層節點（原點＝四腳中間的地面、頭朝 +z）：
  CAT_sit   坐著，尾巴繞到前腳前面
  CAT_lie   趴著睡，縮成一團（麻糬）
  CAT_walk  走路中的一步（左前腳、右後腳往前）
每個姿勢都有 morph target `fat`（大二上胖了；大二下瘦一點＝0.5）。
造型：身體、胸、臀、頭、臉頰、口鼻、四腳、腳掌、尾巴一串的橢球（實際尺寸）→ 體素重建網格（關節自然融合）→ 平滑 → 減面；耳朵、眼睛、鼻子另外建（耳朵是有厚度的三角錐，眼睛是半埋的橢球）。不用方塊。
花色：程序產生（橘色底、背上和腳、尾巴的虎斑、白色的肚子、胸、口鼻、腳掌），烘進貼圖（cat_fur＝年輕、cat_fur_old＝毛色淡、口鼻偏白）。
"""
import json, math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/wz_cat.glb'
TRI_BUDGET = 2640   # 每個姿勢的身體（＋耳朵眼睛鼻子）；配件約 300，合起來 3k 以內（SCENE_RULES）

# ---------------- 姿勢：metaball 元素（遊戲座標，公尺；頭朝 +z）----------------
# (種類, 中心 (x,y,z), 半徑, 尺寸 (sx,sy,sz)＝ELLIPSOID 的三軸比例或 CAPSULE 的半長, 旋轉 (繞 x, 繞 y, 繞 z) 度, 部位)
# 部位用來決定花色與 fat 的權重：torso／chest／hip／head／cheek／muzzle／leg／paw／tail
def tail_chain(points, r0, r1, part='tail'):
    """尾巴：沿著折線每 0.45 倍半徑放一顆球（球和球重疊，重建網格後是連續的一條）"""
    pts = [np.array(p, float) for p in points]; seglen = [np.linalg.norm(b - a) for a, b in zip(pts, pts[1:])]; total = sum(seglen)
    out, acc = [], 0.0
    for a, b, L_ in zip(pts, pts[1:], seglen):
        n = max(1, int(math.ceil(L_ / (0.45 * min(r0, r1)))))
        for k in range(n):
            t = (acc + L_ * k / n) / total; p = a + (b - a) * k / n
            out.append(('BALL', tuple(p), r0 + (r1 - r0) * t, (1, 1, 1), (0, 0, 0), part))
        acc += L_
    out.append(('BALL', tuple(pts[-1]), r1 * 0.95, (1, 1, 1), (0, 0, 0), part))
    return out


POSES = {
    'sit': [
        ('ELLIPSOID', (0, 0.105, -0.06), 0.13, (0.9, 1.0, 0.95), (0, 0, 0), 'hip'),
        ('ELLIPSOID', (0, 0.17, 0.02), 0.10, (0.85, 1.25, 0.8), (-20, 0, 0), 'torso'),
        ('ELLIPSOID', (0, 0.18, 0.07), 0.075, (0.95, 1.1, 0.8), (-10, 0, 0), 'chest'),
        ('BALL', (0, 0.305, 0.075), 0.068, (1, 1, 1), (0, 0, 0), 'head'),
        ('ELLIPSOID', (0, 0.288, 0.095), 0.05, (1.25, 0.8, 0.8), (0, 0, 0), 'cheek'),
        ('ELLIPSOID', (0, 0.282, 0.128), 0.028, (1.2, 0.8, 0.9), (0, 0, 0), 'muzzle'),
        ('CAPSULE', (0.035, 0.07, 0.085), 0.019, (0.055, 1, 1), (0, 0, 90), 'leg'),
        ('CAPSULE', (-0.035, 0.07, 0.085), 0.019, (0.055, 1, 1), (0, 0, 90), 'leg'),
        ('ELLIPSOID', (0.035, 0.012, 0.098), 0.022, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (-0.035, 0.012, 0.098), 0.022, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (0.075, 0.035, -0.02), 0.045, (0.7, 0.9, 1.5), (0, 0, 0), 'hip'),
        ('ELLIPSOID', (-0.075, 0.035, -0.02), 0.045, (0.7, 0.9, 1.5), (0, 0, 0), 'hip'),
        ('ELLIPSOID', (0.06, 0.012, 0.03), 0.022, (1.0, 0.6, 1.3), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (-0.06, 0.012, 0.03), 0.022, (1.0, 0.6, 1.3), (0, 0, 0), 'paw'),
    ] + tail_chain([(-0.06, 0.02, -0.14), (-0.10, 0.018, -0.08), (-0.11, 0.017, 0.0), (-0.09, 0.016, 0.07), (-0.05, 0.016, 0.12), (0.0, 0.016, 0.135)], 0.024, 0.018),
    'lie': [
        ('ELLIPSOID', (0, 0.085, -0.03), 0.16, (0.95, 0.55, 1.3), (0, 0, 0), 'torso'),
        ('ELLIPSOID', (0, 0.075, -0.15), 0.11, (1.05, 0.7, 0.8), (0, 0, 0), 'hip'),
        ('ELLIPSOID', (0, 0.07, 0.10), 0.09, (1.0, 0.75, 0.7), (0, 0, 0), 'chest'),
        ('BALL', (0.0, 0.135, 0.165), 0.066, (1, 1, 1), (0, 0, 0), 'head'),
        ('ELLIPSOID', (0, 0.118, 0.185), 0.05, (1.25, 0.8, 0.8), (0, 0, 0), 'cheek'),
        ('ELLIPSOID', (0, 0.112, 0.217), 0.027, (1.2, 0.8, 0.9), (0, 0, 0), 'muzzle'),
        ('ELLIPSOID', (0.03, 0.022, 0.19), 0.022, (1.0, 0.6, 1.2), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (-0.03, 0.022, 0.185), 0.022, (1.0, 0.6, 1.2), (0, 0, 0), 'paw'),
    ] + tail_chain([(-0.08, 0.03, -0.20), (-0.13, 0.025, -0.13), (-0.15, 0.022, -0.03), (-0.135, 0.02, 0.06), (-0.09, 0.02, 0.13)], 0.024, 0.018),
    'walk': [
        ('ELLIPSOID', (0, 0.20, -0.02), 0.13, (0.85, 0.85, 1.65), (0, 0, 0), 'torso'),
        ('ELLIPSOID', (0, 0.205, -0.16), 0.095, (1.0, 1.0, 0.9), (0, 0, 0), 'hip'),
        ('ELLIPSOID', (0, 0.20, 0.13), 0.085, (0.95, 1.05, 0.85), (0, 0, 0), 'chest'),
        ('BALL', (0, 0.29, 0.235), 0.066, (1, 1, 1), (0, 0, 0), 'head'),
        ('ELLIPSOID', (0, 0.272, 0.255), 0.05, (1.25, 0.8, 0.8), (0, 0, 0), 'cheek'),
        ('ELLIPSOID', (0, 0.266, 0.288), 0.027, (1.2, 0.8, 0.9), (0, 0, 0), 'muzzle'),
        # 腳：左前腳、右後腳往前（+z），另外兩隻往後
        ('CAPSULE', (0.04, 0.10, 0.17), 0.019, (0.075, 1, 1), (0, 0, 90 - 12), 'leg'),
        ('CAPSULE', (-0.04, 0.10, 0.10), 0.019, (0.075, 1, 1), (0, 0, 90 + 14), 'leg'),
        ('CAPSULE', (0.05, 0.10, -0.20), 0.022, (0.075, 1, 1), (0, 0, 90 + 14), 'leg'),
        ('CAPSULE', (-0.05, 0.10, -0.12), 0.022, (0.075, 1, 1), (0, 0, 90 - 12), 'leg'),
        ('ELLIPSOID', (0.04, 0.014, 0.19), 0.021, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (-0.04, 0.014, 0.075), 0.021, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (0.05, 0.014, -0.225), 0.022, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
        ('ELLIPSOID', (-0.05, 0.014, -0.10), 0.022, (1.0, 0.6, 1.25), (0, 0, 0), 'paw'),
    ] + tail_chain([(0, 0.24, -0.27), (0, 0.30, -0.31), (0, 0.37, -0.32), (0.0, 0.43, -0.30), (0.0, 0.47, -0.26)], 0.024, 0.018),
}
HEAD = {'sit': ((0, 0.305, 0.075), 0.068), 'lie': ((0, 0.135, 0.165), 0.066), 'walk': ((0, 0.29, 0.235), 0.066)}


# ---------------- 建模 ----------------
def rotm(rot):
    rx, ry, rz = (math.radians(v) for v in rot)
    cx, sx, cy, sy, cz, sz = math.cos(rx), math.sin(rx), math.cos(ry), math.sin(ry), math.cos(rz), math.sin(rz)
    Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]]); Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Ry @ Rz @ Rx


def blob_mesh(name, elems, voxel=0.0055, smooth_iter=6):
    """部位的橢球（實際尺寸，遊戲座標）合在一起 → 體素重建網格（關節自然融合）→ 平滑。
    BALL：半徑 r；ELLIPSOID：三軸半徑 r×(sx, sy, sz)；CAPSULE：沿局部 x 的長橢球（半長 sz[0]＋r）"""
    bm = bmesh.new()
    for (t, c, r, sz, rot, part) in elems:
        radii = {'BALL': (r, r, r), 'ELLIPSOID': (r * sz[0], r * sz[1], r * sz[2]), 'CAPSULE': (sz[0] + r, r, r)}[t]
        R = rotm(rot); res = bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=12, radius=1.0)
        for v in res['verts']:
            u = np.array([v.co.x, v.co.z, -v.co.y]) * np.array(radii)   # 單位球（當成遊戲座標）→ 三軸半徑
            p = R @ u + np.array(c); v.co = g2b(*p)
    me = bpy.data.meshes.new(name + '_raw'); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name + '_raw', me); B.scene().collection.objects.link(ob)
    rm = ob.modifiers.new('remesh', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = voxel; rm.use_smooth_shade = True
    sm = ob.modifiers.new('smooth', 'LAPLACIANSMOOTH'); sm.lambda_factor = 0.6; sm.iterations = smooth_iter; sm.use_volume_preserve = True   # 保持體積：一般平滑會把尾巴、腳這種細管子縮瘦
    dg = bpy.context.evaluated_depsgraph_get(); out = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); out.name = name
    bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    return out


def decimate(me, target):
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    if tris <= target: return me
    ob = bpy.data.objects.new('_dec', me); B.scene().collection.objects.link(ob)
    m = ob.modifiers.new('d', 'DECIMATE'); m.ratio = target / tris; m.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); me2.name = me.name
    bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    return me2


def ear(bm, base, tip_up, side, s=1.0):
    """有厚度的三角錐耳朵（遊戲座標）：base＝耳根中心、side＝±1（左右）"""
    bx, by, bz = base; w, h, d = 0.022 * s, 0.038 * s, 0.012 * s
    pts = [(bx - w, by, bz + d * 0.3), (bx + w, by, bz + d * 0.3), (bx + side * 0.006, by + h, bz - 0.004), (bx, by + 0.004, bz - d)]
    vs = [bm.verts.new(g2b(*p)) for p in pts]
    for f in ((0, 1, 2), (1, 3, 2), (3, 0, 2), (0, 3, 1)):
        try: bm.faces.new([vs[i] for i in f])
        except ValueError: pass
    return vs


def build_pose(pose):
    """回傳 (網格, 範圍)：範圍＝{'body': (0, n), 'ear': (a, b), 'eye': …, 'nose': …} 頂點編號"""
    me = blob_mesh('CAT_' + pose, POSES[pose])
    me = decimate(me, TRI_BUDGET - 140)
    bm = bmesh.new(); bm.from_mesh(me); rng = {'body': (0, len(bm.verts))}
    (hx, hy, hz), hr = HEAD[pose]
    a = len(bm.verts)
    for side in (1, -1):   # 耳朵：頭頂兩側，稍微往外、往前
        ear(bm, (hx + side * hr * 0.55, hy + hr * 0.62, hz - hr * 0.05), True, side)
    rng['ear'] = (a, len(bm.verts)); a = len(bm.verts)
    for side in (1, -1):   # 眼睛：半埋在臉上的扁橢球
        r = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=5, radius=1.0)
        for v in r['verts']: v.co = Vector((v.co.x * 0.011, v.co.y * 0.006, v.co.z * 0.009))
        bmesh.ops.translate(bm, verts=r['verts'], vec=g2b(hx + side * hr * 0.42, hy + hr * 0.12, hz + hr * 0.86))
    rng['eye'] = (a, len(bm.verts)); a = len(bm.verts)
    r = bmesh.ops.create_uvsphere(bm, u_segments=6, v_segments=4, radius=1.0)   # 鼻子
    for v in r['verts']: v.co = Vector((v.co.x * 0.006, v.co.y * 0.004, v.co.z * 0.004))
    bmesh.ops.translate(bm, verts=r['verts'], vec=g2b(hx, hy - hr * 0.18, hz + hr * 1.32))
    rng['nose'] = (a, len(bm.verts))
    bm.normal_update(); bm.to_mesh(me); bm.free(); me.validate(clean_customdata=False); me.name = 'CAT_' + pose
    return me, rng


# ---------------- 花色（頂點色）與 fat ----------------
PAL = {   # sRGB
    'young': {'base': '#df8f45', 'stripe': '#b4612b', 'white': '#f4efe6', 'nose': '#d98a8a', 'eye': '#2c2a1c', 'ear': '#d3843f'},
    'old':   {'base': '#e8b483', 'stripe': '#d49866', 'white': '#f6f3ee', 'nose': '#d6a0a0', 'eye': '#3a3628', 'ear': '#dcae80'},
}
FAT = {'torso': 1.0, 'hip': 0.9, 'chest': 0.7, 'cheek': 0.45, 'head': 0.12, 'muzzle': 0.1, 'leg': 0.25, 'paw': 0.0, 'tail': 0.08}
FAT_D = 0.020   # 最胖的地方往外 2 公分


def lin(hexc):
    c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return np.array([v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c])


def nearest_part(p, elems):
    """頂點最靠近哪一個部位（用橢球的正規化距離）：回傳 (部位, 元素, 正規化距離)"""
    best = None
    for e in elems:
        t, c, r, sz, rot, part = e
        radii = np.array({'BALL': (r, r, r), 'ELLIPSOID': (r * sz[0], r * sz[1], r * sz[2]), 'CAPSULE': (sz[0] + r, r, r)}[t])
        q = rotm(rot).T @ (p - np.array(c)); d = np.linalg.norm(q / radii)
        if best is None or d < best[2]: best = (part, e, d)
    return best


def fat_offsets(pose, me, rng):
    elems = POSES[pose]; (hx, hy, hz), hr = HEAD[pose]; head_c = np.array([hx, hy, hz]); off = []
    for i, v in enumerate(me.vertices):
        p = np.array([v.co.x, v.co.z, -v.co.y]); n = np.array([v.normal.x, v.normal.z, -v.normal.y])
        if i >= rng['body'][1]:   # 耳朵、眼睛、鼻子跟著頭往外
            d = p - head_c; d /= max(1e-6, np.linalg.norm(d)); off.append(d * FAT_D * FAT['head']); continue
        part, e, dist = nearest_part(p, elems)
        w = FAT[part] * (0.0 if p[1] < 0.012 else 1.0)   # 貼地的那一圈不動（胖了也不會陷進地板）
        off.append(n * FAT_D * w)
    return np.array(off)


# ---------------- 遮罩（烘焙用）：白色區域、條紋強度、條紋座標；特殊部位 ----------------
STRIPE_P = 0.046   # 條紋的間距（公尺）


def masks(pose, me, rng, old=False):
    """Mask＝(白, 條紋強度, 條紋座標)、Spec＝(眼, 鼻, 耳)；條紋座標是位置的線性函數，三角形內插值以後由著色器算 sin，條紋才會清楚"""
    elems = POSES[pose]; (hx, hy, hz), hr = HEAD[pose]; M, Sp = [], []
    for i, v in enumerate(me.vertices):
        p = np.array([v.co.x, v.co.z, -v.co.y]); n = np.array([v.normal.x, v.normal.z, -v.normal.y])
        if rng['ear'][0] <= i < rng['ear'][1]: M.append((0, 0, 0)); Sp.append((0, 0, 1)); continue
        if rng['eye'][0] <= i < rng['eye'][1]: M.append((0, 0, 0)); Sp.append((1, 0, 0)); continue
        if rng['nose'][0] <= i < rng['nose'][1]: M.append((0, 0, 0)); Sp.append((0, 1, 0)); continue
        part, e, d = nearest_part(p, elems); c = np.array(e[1]); w = 0.0
        if part == 'paw': w = 1.0
        elif part == 'muzzle': w = 1.0 if p[1] < c[1] + e[2] * 0.35 else 0.0
        elif part == 'cheek': w = 1.0 if (p[1] < c[1] - e[2] * 0.15 and n[2] > -0.2) else 0.0
        elif part == 'chest': w = 1.0 if (n[2] > 0.15 or n[1] < -0.3) else 0.0
        elif part in ('torso', 'hip'): w = 1.0 if n[1] < -0.45 else 0.0
        elif part == 'leg': w = 1.0 if p[1] < 0.045 else 0.0
        if part in ('torso', 'hip', 'chest'):
            axis = np.array([0, 0.55, 0.45]) if pose == 'sit' else np.array([0, 0, 1.0])
            sc, sg = float(np.dot(p, axis)), max(0.0, min(1.0, (n[1] + 0.25) * 1.3))
        elif part == 'leg': sc, sg = p[1], 0.9
        elif part == 'tail': sc, sg = abs(p[0]) + abs(p[2]) + p[1], 1.0
        elif part == 'head' and p[1] > hy + hr * 0.3 and n[2] > -0.3: sc, sg = p[0] * (STRIPE_P / 0.022), 0.8   # 頭頂的 M 字紋
        elif part in ('head', 'cheek'): sc, sg = p[1], 0.25 if p[1] > hy else 0.0
        else: sc, sg = 0.0, 0.0
        M.append((w, sg, sc)); Sp.append((0, 0, 0))
    return np.array(M, float), np.array(Sp, float)


def set_attr(me, name, vals):
    ca = me.color_attributes.new(name, 'FLOAT_COLOR', 'POINT')
    for i, v in enumerate(vals): ca.data[i].color = (float(v[0]), float(v[1]), float(v[2]), 1.0)


def uv_tile(ob, tile):
    """智慧展開 UV，再縮到貼圖集的那一格（tile＝(u0, v0)，一格 0.5×0.5）"""
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.view_layer.objects: o.select_set(o == ob)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.012, area_weight=0.0)
    bpy.ops.object.mode_set(mode='OBJECT')
    uv = ob.data.uv_layers.active.data; u0, v0 = tile
    for d in uv: d.uv = (u0 + 0.01 + d.uv[0] * 0.48, v0 + 0.01 + d.uv[1] * 0.48)


# ---------------- 配件：項圈＋名牌、繃帶（每個姿勢一份）----------------
NECK = {   # (中心, 朝頭的方向, 半徑)
    'sit': ((0, 0.255, 0.07), (0, 0.85, 0.5), 0.047),
    'lie': ((0, 0.10, 0.135), (0, 0.35, 0.94), 0.050),
    'walk': ((0, 0.245, 0.19), (0, 0.5, 0.87), 0.048),
}
LEG = {    # 左前腳：(中心, 腳的方向, 半徑)
    'sit': ((0.035, 0.065, 0.086), (0, 1, 0), 0.0215),
    'lie': ((0.03, 0.024, 0.175), (0, 0, 1), 0.024),
    'walk': ((0.04, 0.085, 0.172), (0, 0.98, 0.2), 0.0215),
}
ACC_UV = {'collar': (0.52, 0.02, 0.96, 0.10), 'tag': (0.52, 0.12, 0.74, 0.28), 'tag_back': (0.76, 0.12, 0.96, 0.28), 'bandage': (0.52, 0.30, 0.96, 0.46)}


def frame_from(axis):
    a = np.array(axis, float); a /= np.linalg.norm(a)
    t = np.array([1.0, 0, 0]) if abs(a[0]) < 0.9 else np.array([0, 1.0, 0])
    u = np.cross(a, t); u /= np.linalg.norm(u); w = np.cross(a, u); return a, u, w


def ring(bm, c, axis, r, h, seg, region, radial_out, th=0.003, fat_list=None, fat_w=0.0):
    """有厚度的環（項圈、繃帶）：中心 c、軸 axis、半徑 r、寬 h；UV 照 ACC_UV 的區域"""
    a, u, w = frame_from(axis); c = np.array(c); x0, y0, x1, y1 = ACC_UV[region]
    rows = []
    for (rr, hh, tv) in ((r, -h / 2, 0.0), (r, h / 2, 0.45), (r + th, h / 2, 0.55), (r + th, -h / 2, 1.0)):
        rows.append([bm.verts.new(g2b(*(c + a * hh + (u * math.cos(2 * math.pi * k / seg) + w * math.sin(2 * math.pi * k / seg)) * rr))) for k in range(seg + 1)])
    for v in [vv for row in rows for vv in row]:
        if fat_list is not None:
            q = np.array([v.co.x, v.co.z, -v.co.y]) - c; q -= a * np.dot(q, a); q /= max(1e-6, np.linalg.norm(q)); fat_list.append((v, q * FAT_D * fat_w))
    uvl = bm.loops.layers.uv.verify()
    for ri in range(3):
        A, Bv = rows[ri], rows[ri + 1]
        for k in range(seg):
            f = bm.faces.new((A[k], A[k + 1], Bv[k + 1], Bv[k]))
            for lp, (uu, vv) in zip(f.loops, ((k / seg, ri / 3), ((k + 1) / seg, ri / 3), ((k + 1) / seg, (ri + 1) / 3), (k / seg, (ri + 1) / 3))):
                lp[uvl].uv = (x0 + uu * (x1 - x0), y0 + vv * (y1 - y0))
    return bm


def tag(bm, c, normal, up, fat_list, fat_w):
    """名牌：倒角的小牌子（3×2.2 cm，3 mm 厚），正面有字"""
    n = np.array(normal, float); n /= np.linalg.norm(n); up_ = np.array(up, float); up_ -= n * np.dot(up_, n); up_ /= np.linalg.norm(up_); rt = np.cross(up_, n)
    W, H, T = 0.030, 0.022, 0.003; c = np.array(c); uvl = bm.loops.layers.uv.verify(); vs_all = []
    for side, region, off in ((1, 'tag', T / 2), (-1, 'tag_back', -T / 2)):
        x0, y0, x1, y1 = ACC_UV[region]; corners = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
        vs = [bm.verts.new(g2b(*(c + rt * sx * W / 2 + up_ * sy * H / 2 + n * off))) for sx, sy in corners]
        f = bm.faces.new(vs if side > 0 else list(reversed(vs)))
        for lp in f.loops:
            q = np.array([lp.vert.co.x, lp.vert.co.z, -lp.vert.co.y]) - c; uu = 0.5 + np.dot(q, rt) / W * side; vv = 0.5 + np.dot(q, up_) / H
            lp[uvl].uv = (x0 + uu * (x1 - x0), y0 + vv * (y1 - y0))
        vs_all += vs
    for i in range(4):   # 側邊
        a, b = vs_all[i], vs_all[(i + 1) % 4]; a2, b2 = vs_all[4 + i], vs_all[4 + (i + 1) % 4]
        f = bm.faces.new((a, a2, b2, b))
        for lp in f.loops: lp[uvl].uv = (ACC_UV['tag_back'][0] + 0.005, ACC_UV['tag_back'][1] + 0.005)
    for v in vs_all: fat_list.append((v, n * FAT_D * fat_w))


def accessory_objects(pose, parent, mat, body=None):
    """CAT_<pose>_tag（項圈＋名牌）、CAT_<pose>_bandage（左前腳的繃帶）；都有 fat"""
    out = []
    (nc, na, nr) = NECK[pose]; (lc, la, lr) = LEG[pose]
    for kind in ('tag', 'bandage'):
        bm = bmesh.new(); fl = []
        if kind == 'tag':
            ring(bm, nc, na, nr, 0.012, 28, 'collar', True, th=0.003, fat_list=fl, fat_w=0.55)
            a, u, w = frame_from(na); front = np.array([0, -0.35, 1.0]); front -= np.array(na) * np.dot(front, np.array(na) / np.linalg.norm(na)); front /= np.linalg.norm(front)
            nd = np.array(na) / np.linalg.norm(na)
            q = np.array(nc) + front * nr - nd * 0.016   # 項圈正面往下 1.6 cm：名牌掛的地方
            # 貼在離那一點最近的身體表面上（胸口比脖子凸，只用項圈半徑會埋進去），朝那裡的法線往外 4 mm
            V = np.array([(v.co.x, v.co.z, -v.co.y) for v in body.data.vertices]); Nv = np.array([(v.normal.x, v.normal.z, -v.normal.y) for v in body.data.vertices])
            k = int(np.argmin(np.linalg.norm(V - q, axis=1))); nrm = Nv[k] / max(1e-6, np.linalg.norm(Nv[k]))
            tc = V[k] + nrm * 0.004; front = nrm
            tag(bm, tc, front, na, fl, 0.55)
        else:
            ring(bm, lc, la, lr + 0.002, 0.030, 20, 'bandage', True, th=0.0025, fat_list=fl, fat_w=0.3)
        name = f'CAT_{pose}_{kind}'; me = bpy.data.meshes.new(name)
        idx = {v: i for i, v in enumerate(bm.verts)}; offs = [(idx[v], d) for v, d in fl]
        bm.to_mesh(me); bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent
        ob.shape_key_add(name='Basis'); k = ob.shape_key_add(name='fat'); k.value = 0.0   # 預設 0（不設的話匯出成權重 1＝一開始就是胖的）
        for i, d in offs: k.data[i].co = k.data[i].co + Vector((d[0], -d[2], d[1]))
        L.smooth_mesh(ob, angle=1.0); out.append(ob)
    return out


# ---------------- 烘焙：程序花色＋AO → 512 貼圖（年輕、老兩張）----------------
TEX_N = 512
GEN = os.path.join(PARENT, 'textures', 'gen')
FUR, FUR_OLD = (os.path.join(GEN, f'wz_cat_{k}.png') for k in ('fur', 'fur_old'))


def bake_material(name, img, pal):
    """烘焙用的材質：Mask／Spec 屬性 → 花色（條紋＝sin(2π×條紋座標／間距)）→ 乘上 AO → Emission；img 是要烘進去的圖（作用中的貼圖節點）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links.new
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission')
    am = N.new('ShaderNodeAttribute'); am.attribute_name = 'Mask'; asp = N.new('ShaderNodeAttribute'); asp.attribute_name = 'Spec'
    sm = N.new('ShaderNodeSeparateColor'); Lk(am.outputs['Color'], sm.inputs['Color'])
    ss = N.new('ShaderNodeSeparateColor'); Lk(asp.outputs['Color'], ss.inputs['Color'])
    def math_(op, a, b=None, v=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        if isinstance(a, float): n.inputs[0].default_value = a
        else: Lk(a, n.inputs[0])
        if b is not None:
            if isinstance(b, float): n.inputs[1].default_value = b
            else: Lk(b, n.inputs[1])
        return n.outputs[0]
    ph = math_('MULTIPLY', sm.outputs['Blue'], 2 * math.pi / STRIPE_P)
    sn = math_('SINE', ph)
    st = math_('MULTIPLY', math_('SUBTRACT', math_('MULTIPLY', sn, 1.8), 0.35), 1.0); st = N.new('ShaderNodeClamp'); Lk(math_('SUBTRACT', math_('MULTIPLY', sn, 1.8), 0.35), st.inputs['Value'])
    stf = math_('MULTIPLY', st.outputs[0], sm.outputs['Green'])
    if pal == 'old': stf = math_('MULTIPLY', stf, 0.55)
    P = {k: (*lin(v), 1.0) for k, v in PAL[pal].items()}
    def mix(fac, a, b):
        n = N.new('ShaderNodeMix'); n.data_type = 'RGBA'; Lk(fac, n.inputs['Factor'])
        for sock, val in ((n.inputs[6], a), (n.inputs[7], b)):
            if isinstance(val, tuple): sock.default_value = val
            else: Lk(val, sock)
        return n.outputs[2]
    c = mix(stf, P['base'], P['stripe'])
    c = mix(sm.outputs['Red'], c, P['white'])
    c = mix(ss.outputs['Red'], c, P['eye']); c = mix(ss.outputs['Green'], c, P['nose']); c = mix(ss.outputs['Blue'], c, P['ear'])
    ao = N.new('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = 0.035; ao.samples = 16
    aof = math_('ADD', math_('MULTIPLY', ao.outputs['AO'], 0.55), 0.45)
    fin = N.new('ShaderNodeMix'); fin.data_type = 'RGBA'; fin.blend_type = 'MULTIPLY'; fin.inputs['Factor'].default_value = 1.0
    Lk(c, fin.inputs[6]); Lk(aof, fin.inputs[7])
    Lk(fin.outputs[2], em.inputs['Color']); Lk(em.outputs['Emission'], out.inputs['Surface'])
    tn = N.new('ShaderNodeTexImage'); tn.image = img; N.active = tn; tn.select = True
    return m


def paint_accessories(path):
    """配件那一格：紅色皮項圈（縫線）、名牌（字）、名牌背面、繃帶（紗布）——用 PIL 畫在貼圖的右下角"""
    from PIL import Image, ImageDraw, ImageFont
    im = Image.open(path).convert('RGB'); d = ImageDraw.Draw(im); Nn = im.size[0]
    def box(region):
        x0, y0, x1, y1 = ACC_UV[region]; return int(x0 * Nn), int((1 - y1) * Nn), int(x1 * Nn), int((1 - y0) * Nn)
    x0, y0, x1, y1 = box('collar'); d.rectangle([x0, y0, x1, y1], fill=(170, 46, 38))
    for k in range(x0, x1, 6): d.line([(k, y0 + 3), (k + 3, y0 + 3)], fill=(214, 120, 96)); d.line([(k, y1 - 4), (k + 3, y1 - 4)], fill=(214, 120, 96))
    x0, y0, x1, y1 = box('tag'); d.rectangle([x0, y0, x1, y1], fill=(250, 248, 240), outline=(176, 52, 44), width=3)
    f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', max(8, (y1 - y0) // 6))
    for i, t in enumerate(('請不要再餵我，', '我很胖。', '——里長')):
        d.text((x0 + 6, y0 + 6 + i * (y1 - y0) // 3.4), t, font=f, fill=(40, 40, 40))
    x0, y0, x1, y1 = box('tag_back'); d.rectangle([x0, y0, x1, y1], fill=(240, 238, 230))
    x0, y0, x1, y1 = box('bandage'); d.rectangle([x0, y0, x1, y1], fill=(246, 246, 240))
    for k in range(x0, x1, 4): d.line([(k, y0), (k, y1)], fill=(232, 232, 226))
    for k in range(y0, y1, 4): d.line([(x0, k), (x1, k)], fill=(234, 234, 228))
    im.save(path)


def fur_material(name, path):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.image.pack(); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.85; b.inputs['Metallic'].default_value = 0.0
    return m


TILES = {'sit': (0.0, 0.5), 'lie': (0.5, 0.5), 'walk': (0.0, 0.0)}
SPREAD = {'sit': -0.6, 'lie': 0.0, 'walk': 0.6}


def build():
    B.reset(texres=TEX_N)
    sc = B.scene(); sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 16
    root = B.group('wz_cat', props={'kind': 'wz_cat'})
    bodies, info, OFF = {}, {}, {}
    for pose in POSES:
        me, rng = build_pose(pose)
        ob = bpy.data.objects.new('CAT_' + pose, me); sc.collection.objects.link(ob); ob.parent = root
        L.smooth_mesh(ob, angle=3.1)   # 全部平滑（減面後的細長三角形，角度小一點就會一格一格）
        M, Sp = masks(pose, me, rng); set_attr(me, 'Mask', M); set_attr(me, 'Spec', Sp)
        uv_tile(ob, TILES[pose])
        OFF[pose] = fat_offsets(pose, me, rng)   # 存在 Python 裡（自訂屬性存巢狀陣列會壞掉，lib2 merge_by_material 的註解）
        bodies[pose] = ob
    os.makedirs(GEN, exist_ok=True)
    for pal, path in (('young', FUR), ('old', FUR_OLD)):
        img = bpy.data.images.new('cat_bake_' + pal, TEX_N, TEX_N, alpha=False); img.generated_color = (0.5, 0.5, 0.5, 1)
        for pose, ob in bodies.items():
            ob.data.materials.clear(); ob.data.materials.append(bake_material(f'bake_{pal}_{pose}', img, pal))
        for o in bpy.context.view_layer.objects: o.select_set(o.name in [b.name for b in bodies.values()])
        bpy.context.view_layer.objects.active = bodies['sit']
        bpy.ops.object.bake(type='EMIT', margin=6, use_clear=True)
        img.filepath_raw = path; img.file_format = 'PNG'; img.save()
        paint_accessories(path)
    fur, fur_old = fur_material('cat_fur', FUR), fur_material('cat_fur_old', FUR_OLD)
    tris = {}
    for pose, ob in bodies.items():
        ob.data.materials.clear(); ob.data.materials.append(fur)
        for a in ('Mask', 'Spec'):
            ca = ob.data.color_attributes.get(a)
            if ca: ob.data.color_attributes.remove(ca)
        off = OFF[pose]
        ob.shape_key_add(name='Basis'); k = ob.shape_key_add(name='fat'); k.value = 0.0   # 預設 0（不設的話匯出成權重 1＝一開始就是胖的）
        for i, dd in enumerate(off): k.data[i].co = k.data[i].co + Vector((dd[0], -dd[2], dd[1]))
        accs = accessory_objects(pose, ob, fur, body=ob)
        ob.location = g2b(SPREAD[pose], 0, 0)
        tris[ob.name] = sum(len(p.vertices) - 2 for p in ob.data.polygons)
        for a in accs: tris[a.name] = sum(len(p.vertices) - 2 for p in a.data.polygons)
    # cat_fur_old 要在 GLB 裡：一個很小的隱藏節點掛著（遊戲端照名稱找到材質，換到身上；這個節點不顯示）
    hm = bpy.data.meshes.new('CAT_fur_old_holder'); hm.from_pydata([(0, 0, -1.0), (0.001, 0, -1.0), (0, 0.001, -1.0)], [], [(0, 1, 2)])
    hm.uv_layers.new(); hm.materials.append(fur_old)
    ho = bpy.data.objects.new('CAT_fur_old_holder', hm); sc.collection.objects.link(ho); ho.parent = root; ho['hidden'] = True
    for pose in POSES:
        t = tris['CAT_' + pose] + tris[f'CAT_{pose}_tag'] + tris[f'CAT_{pose}_bandage']
        assert t <= 3000, (pose, t)
    out = os.path.join(L.ROOT, OUT)
    st = L.export(out, gpu_instances=False)
    st['materials'] = len({m.name for o in bpy.data.objects if o.type == 'MESH' for m in o.data.materials if m})   # L.export 數的是 bpy.data 全部（含烘焙用的暫時材質）；GLB 裡只有掛在網格上的 2 個
    st['tris_per_node'] = tris
    st['textures'] = [os.path.relpath(p, L.ROOT) for p in (FUR, FUR_OLD)]
    st['note'] = ('三個姿勢 CAT_sit／CAT_lie／CAT_walk（原點＝四腳中間的地面、頭朝 +z；GLB 裡的位置只是排開給人看）；'
                  '每個姿勢底下 CAT_<姿勢>_tag（項圈＋名牌，大三）、CAT_<姿勢>_bandage（左前腳繃帶，大三上第 9 週那一週）；'
                  '所有網格都有 morph target「fat」（大二上 1.0、大二下 0.5）；材質 cat_fur（年輕）、cat_fur_old（大四：毛色淡、口鼻偏白，掛在隱藏節點 CAT_fur_old_holder，遊戲換材質）')
    L.write_json(out[:-4] + '.json', st)
    print(json.dumps(tris, ensure_ascii=False))
    return st


if __name__ == '__main__':
    build()
