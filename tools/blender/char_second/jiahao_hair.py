"""宋家豪（econ_jiahao）的頭髮＋棒球帽（參考圖 jiahao.webp：灰色棒球帽、帽沿往前；帽子下面露出黑色短髮——鬢角、耳朵上面、後頸、帽沿下一點點瀏海）。
LAWWW2-C 2026-10-17 第一版：
  頭髮＝韋綸的 weilun_hair（黑色短髮）換亂數種子；帽子蓋住的髮片整片刪掉（只留帽緣下面露出來的）。
  帽子做在 VRM 裡（網格綁頭骨，跟著頭動），不用遊戲端的配件（props3d）：
    帽冠＝從頭頂往下一圈一圈到帽緣（前面在眉毛上方 1.5 cm、兩側在耳朵上面、後面在後腦中間），每個方向的半徑＝那個方向附近頭髮的最外面＋5 mm（不穿模）；
    帽沿＝前面 ±72° 從帽緣往前伸 7.6 cm、往下彎 1.2 cm（雙面材質）；頂上一顆小鈕。顏色灰（參考圖 #6b6d70）。"""
import math
import numpy as np
import bpy, bmesh
import common as C
import h01_hair as HB
from h01_hair import _unit, sph
import weilun_hair as WH

HEAD = 'J_Bip_C_Head'
CAP_RGB = np.array([104, 106, 110]) / 255.0
NA, NE = 48, 11


def _hair_world(obj):
    mw = np.array(obj.matrix_world); return C.co(obj) @ mw[:3, :3].T + mw[:3, 3]


def build_cap(m, hair):
    arm = m['arm']; H = HB.Head(m); c = H.c
    HP = _hair_world(hair); Hd = _unit(HP - c); Hr = np.linalg.norm(HP - c, axis=1)

    def az(a): return abs(((a + 180) % 360) - 180)

    def z_rim(a):
        return float(np.interp(az(a), [0, 40, 75, 110, 150, 180],
                               [H.brow_top + 0.016, H.brow_top + 0.012, H.brow_z + 0.026, H.brow_z + 0.022, c[2] - 0.004, c[2] - 0.018]))

    def rad(d):     # 這個方向：頭皮＋1.2 cm，和附近（8° 以內）頭髮最外面＋5 mm，取大的
        near = Hd @ d > math.cos(math.radians(8.0))
        rh = float(Hr[near].max()) + 0.005 if near.any() else 0.0
        return max(H.R(d) + 0.012, rh)

    def e_rim(a):
        lo, hi = -45.0, 60.0
        for _ in range(22):
            mid = (lo + hi) / 2; d = sph(a, mid)
            if (c + d * rad(d))[2] > z_rim(a): hi = mid
            else: lo = mid
        return (lo + hi) / 2

    A = np.linspace(-180, 180, NA + 1)[:-1]; erim = np.array([e_rim(a) for a in A])
    V, F, UV = [], [], []; rows = []
    for j in range(NE + 1):
        t = j / NE; ring = []
        for i, a in enumerate(A):
            e = 88.0 - (88.0 - erim[i]) * t; d = sph(a, e)
            V.append(c + d * rad(d) * (1.0 + 0.012 * math.sin(math.pi * t))); UV.append((i / NA, t)); ring.append(len(V) - 1)
        rows.append(ring)
    top = c + np.array([0.0, 0.0, 1.0]) * rad(np.array([0.0, 0.0, 1.0])); apex = len(V); V.append(top + np.array([0, 0, 0.002])); UV.append((0.5, 0.0))
    for i in range(NA): F.append((apex, rows[0][(i + 1) % NA], rows[0][i]))
    for j in range(NE):
        for i in range(NA):
            i2 = (i + 1) % NA; F.append((rows[j][i], rows[j][i2], rows[j + 1][i2], rows[j + 1][i]))
    rim = rows[-1]; bi = sorted([i for i, a in enumerate(A) if abs(a) <= 72.0], key=lambda i: A[i]); outer = []
    for i in bi:
        a = A[i]; p = np.array(V[rim[i]]); hd = _unit(np.array([p[0] - c[0], p[1] - c[1], 0.0]))
        L = 0.072 * max(0.0, math.cos(math.radians(a) * 90.0 / 76.0)) ** 0.7 + 0.004
        V.append(p + hd * L + np.array([0.0, 0.0, -0.012 * L / 0.076])); UV.append((a / 144.0 + 0.5, 1.0)); outer.append(len(V) - 1)
    for k in range(len(bi) - 1):
        F.append((rim[bi[k]], rim[bi[k + 1]], outer[k + 1], outer[k]))
    me = bpy.data.meshes.new('Cap_J01'); me.from_pydata([list(map(float, v)) for v in V], [], F); me.validate(); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    obj = bpy.data.objects.new('Cap_J01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    S = 64; img = np.ones((S, S, 4)); rng = np.random.default_rng(3); img[..., :3] = CAP_RGB[None, None, :] * (0.94 + 0.06 * rng.random((S, S, 1)))
    im = C.image_from_array('J01_Cap', img, '/tmp/j01_cap.png')
    tmpl = next(mt.name for mt in bpy.data.materials if mt.name.endswith('_CLOTH') and getattr(mt, 'vrm_addon_extension', None))
    mat = C.mtoon_from(tmpl, 'J01_Cap_CLOTH', base_img=im, double_sided=True)
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    # 帽子蓋住的髮片刪掉：頂點的仰角都在那個方位帽緣上面 3° 以上的面
    hb = bmesh.new(); hb.from_mesh(hair.data); Mh = np.array(hair.matrix_world)
    def inside(v):
        p = Mh[:3, :3] @ np.array(v.co) + Mh[:3, 3] - c; d = _unit(p)
        a = math.degrees(math.atan2(d[0], -d[1])); e = math.degrees(math.asin(max(-1.0, min(1.0, d[2]))))
        return e > float(np.interp(a, np.r_[A - 360, A, A + 360], np.r_[erim, erim, erim])) + 3.0
    ins = {v.index: inside(v) for v in hb.verts}
    dead = [f for f in hb.faces if all(ins[v.index] for v in f.verts)]
    bmesh.ops.delete(hb, geom=dead, context='FACES')
    loose = [v for v in hb.verts if not v.link_faces]; bmesh.ops.delete(hb, geom=loose, context='VERTS')
    hb.to_mesh(hair.data); hb.free(); hair.data.update()
    print('  cap: verts %d faces %d (rim elevation %.1f..%.1f°); hair faces under the cap removed %d' % (len(V), len(F), erim.min(), erim.max(), len(dead)))
    return obj


def apply(m):
    WH.SEED = 20261019
    hair = WH.apply(m)
    cap = build_cap(m, hair)
    m['cap'] = cap
    return hair
