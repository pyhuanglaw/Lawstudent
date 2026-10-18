"""宋家豪（econ_jiahao）的頭髮＋棒球帽（參考圖 jiahao.webp：灰色棒球帽、帽沿往前；帽子下面露出黑色短髮——鬢角、耳朵上面、後頸、帽沿下一點點瀏海）。
LAWWW2-C 2026-10-17 第一版：
  頭髮＝韋綸的 weilun_hair（黑色短髮）換亂數種子；帽子蓋住的髮片整片刪掉（只留帽緣下面露出來的）。
  帽子做在 VRM 裡（網格綁頭骨，跟著頭動），不用遊戲端的配件（props3d）：
    帽冠＝從頭頂往下一圈一圈到帽緣（前面在眉毛上方 1.5 cm、兩側在耳朵上面、後面在後腦中間），每個方向的半徑＝那個方向附近頭髮的最外面＋5 mm（不穿模）；
    帽沿＝前面 ±75° 從帽緣往前伸 7.6 cm、往下彎 2.4 cm、上下兩層 3 mm 厚（雙面材質）。顏色灰（參考圖 #6b6d70）。
第二版：帽冠貼頭（第一版照頭髮外緣撐成水桶帽）、帽沿有厚度和弧度（第一版平視只剩一條線）。
第三版：帽舌改成棒球帽的樣子——只在前面 ±58°、往正前方伸（第二版 ±75° 沿半徑往外伸：正面看一整圈帽簷，像頭盔）、中間 7 cm、兩側往下彎；
帽頂的尖刺（頂點用了頭髮外緣的半徑）改成扁的鈕扣；帽冠貼圖畫六片的縫線＋車線；帽緣以上的髮片只要中心在帽緣上面就刪（第二版只刪整片都在裡面的，前面有髮尾穿出帽子）。"""
import math
import numpy as np
import bpy, bmesh
from mathutils import Vector
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

    def rad(d, near_rim=1.0):     # 帽冠貼頭：頭皮＋1.4 cm（第一版照頭髮最外面＋5 mm：韋綸那頭往上翹的頭髮把帽冠撐成水桶帽）；
        r0 = H.R(d) + 0.014                # 只有靠帽緣那一段（near_rim→1）讓到附近頭髮最外面＋4 mm、最多多 1.2 cm（帽緣下面露出來的頭髮不穿出帽子）
        near = Hd @ d > math.cos(math.radians(8.0))
        rh = float(Hr[near].max()) + 0.004 if near.any() else 0.0
        return r0 + min(max(rh - r0, 0.0), 0.012) * near_rim

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
            V.append(c + d * rad(d, float(HB.sstep(0.55, 1.0, t))) * (1.0 + 0.010 * math.sin(math.pi * t))); UV.append((i / NA, t)); ring.append(len(V) - 1)
        rows.append(ring)
    top = c + np.array([0.0, 0.0, 1.0]) * rad(np.array([0.0, 0.0, 1.0]), 0.0); apex = len(V); V.append(top + np.array([0, 0, 0.001])); UV.append((0.5, 0.0))   # 第三版：頂點和第一圈同一個半徑（第二版用頭髮外緣：尖刺）
    for i in range(NA): F.append((apex, rows[0][(i + 1) % NA], rows[0][i]))
    for j in range(NE):
        for i in range(NA):
            i2 = (i + 1) % NA; F.append((rows[j][i], rows[j][i2], rows[j + 1][i2], rows[j + 1][i]))
    # 帽舌（第三版）：帽緣前面 ±58° 那一段是內緣；外緣＝內緣往正前方（-y）伸 L(a)（中間 7 cm、兩端 0）、x 往外一點點；
    # 從根部到前緣往下 1.6 cm，而且左右兩側再往下彎（預彎的帽舌）；上下兩層相距 3.5 mm＋前緣
    rim = rows[-1]; bi = sorted([i for i, a in enumerate(A) if abs(a) <= 58.0], key=lambda i: A[i]); top_o, bot_i, bot_o = [], [], []
    for i in bi:
        a = A[i]; p = np.array(V[rim[i]]); u = a / 58.0
        L = 0.070 * max(0.0, math.cos(math.radians(a) * 90.0 / 62.0)) ** 0.55 + 0.003; k_ = L / 0.073
        q = p + np.array([p[0] - c[0], 0.0, 0.0]) * 0.10 * k_ + np.array([0.0, -L, -0.016 * k_ - 0.010 * u * u * k_])
        V.append(q); UV.append((0.02 + 0.06 * (u + 1) / 2, 0.98)); top_o.append(len(V) - 1)
        V.append(p + np.array([0.0, 0.0, -0.0035])); UV.append((0.02 + 0.06 * (u + 1) / 2, 0.98)); bot_i.append(len(V) - 1)
        V.append(q + np.array([0.0, 0.0, -0.0035])); UV.append((0.02 + 0.06 * (u + 1) / 2, 0.98)); bot_o.append(len(V) - 1)
    for k in range(len(bi) - 1):
        F.append((rim[bi[k]], rim[bi[k + 1]], top_o[k + 1], top_o[k]))          # 上面
        F.append((bot_i[k], bot_o[k], bot_o[k + 1], bot_i[k + 1]))              # 下面
        F.append((top_o[k], top_o[k + 1], bot_o[k + 1], bot_o[k]))              # 前緣
    # 帽頂的鈕扣：扁圓柱（半徑 7 mm、高 3 mm）
    nb = 12; b0 = len(V)
    for k in range(nb):
        t_ = 2 * math.pi * k / nb; V.append(top + np.array([0.007 * math.cos(t_), 0.007 * math.sin(t_), -0.001])); UV.append((0.5, 0.02))
    for k in range(nb):
        t_ = 2 * math.pi * k / nb; V.append(top + np.array([0.0065 * math.cos(t_), 0.0065 * math.sin(t_), 0.003])); UV.append((0.5, 0.02))
    bc_ = len(V); V.append(top + np.array([0.0, 0.0, 0.0035])); UV.append((0.5, 0.02))
    for k in range(nb):
        F.append((b0 + k, b0 + (k + 1) % nb, b0 + nb + (k + 1) % nb, b0 + nb + k)); F.append((b0 + nb + k, b0 + nb + (k + 1) % nb, bc_))
    me = bpy.data.meshes.new('Cap_J01'); me.from_pydata([list(map(float, v)) for v in V], [], F); me.validate(); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    obj = bpy.data.objects.new('Cap_J01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    # 貼圖（第三版）：帽冠 u＝方位（i/NA，0＝正後方）、v＝頂到帽緣——六片的縫線（深一點的細線＋兩旁的車線）、帽緣上面一圈車線；棉斜紋的細雜訊
    S = 256; img = np.ones((S, S, 4)); rng = np.random.default_rng(3); img[..., :3] = CAP_RGB[None, None, :] * (0.95 + 0.05 * rng.random((S, S, 1)))
    uu = (np.arange(S) + 0.5)[None, :] / S; vv = (np.arange(S) + 0.5)[:, None] / S
    seam = np.zeros((S, S))
    for k in range(6):
        d = np.abs(((uu - k / 6.0 + 0.5) % 1.0) - 0.5)
        seam = np.maximum(seam, (d < 0.0035) * 1.0 + ((np.abs(d - 0.010) < 0.0018) & ((np.arange(S)[:, None] // 3) % 2 == 0)) * 0.5)
    seam = seam * (vv > 0.03)
    seam = np.maximum(seam, ((np.abs(vv - 0.90) < 0.004) & ((np.arange(S)[None, :] // 3) % 2 == 0)) * 0.5)
    img[..., :3] *= (1 - 0.30 * seam)[..., None]
    img[:, :int(0.10 * S), :3] = CAP_RGB * 0.98            # 帽舌（u 0.02～0.08）：素面
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
    def inside_f(f):     # 第三版：面的中心在帽緣上面 0.5° 以上就刪（第二版只刪整片在裡面的：前面有髮尾從帽冠穿出來）
        p = Mh[:3, :3] @ np.array(f.calc_center_median()) + Mh[:3, 3] - c; d = _unit(p)
        a = math.degrees(math.atan2(d[0], -d[1])); e = math.degrees(math.asin(max(-1.0, min(1.0, d[2]))))
        return e > float(np.interp(a, np.r_[A - 360, A, A + 360], np.r_[erim, erim, erim])) + 0.5
    dead = [f for f in hb.faces if inside_f(f)]
    bmesh.ops.delete(hb, geom=dead, context='FACES')
    loose = [v for v in hb.verts if not v.link_faces]; bmesh.ops.delete(hb, geom=loose, context='VERTS')
    # 第四版：留下來的髮片，靠近帽緣（帽緣上面 4° 以內）的點壓到帽冠裡面 3 mm（第三版帽緣前面一圈髮尖從帽冠穿出來）
    Mi = np.linalg.inv(Mh); npull = 0
    for v in hb.verts:
        p = Mh[:3, :3] @ np.array(v.co) + Mh[:3, 3]; q = p - c; r = float(np.linalg.norm(q)); d = q / max(r, 1e-9)
        a = math.degrees(math.atan2(d[0], -d[1])); e = math.degrees(math.asin(max(-1.0, min(1.0, d[2]))))
        if e > float(np.interp(a, np.r_[A - 360, A, A + 360], np.r_[erim, erim, erim])) - 4.0:
            rc = rad(d, 0.0) - 0.003
            if r > rc:
                pn = c + d * rc; v.co = (Mi[:3, :3] @ pn + Mi[:3, 3]).tolist(); npull += 1
    print('  hair verts pulled under the cap', npull)
    hb.to_mesh(hair.data); hb.free(); hair.data.update()
    print('  cap: verts %d faces %d (rim elevation %.1f..%.1f°); hair faces under the cap removed %d' % (len(V), len(F), erim.min(), erim.max(), len(dead)))
    return obj


def cap_bangs(m, hair, n=11):
    """第五版：帽緣下面一排短瀏海（參考圖帽舌底下看得到一撮一撮的瀏海；第四版把帽緣附近的髮片壓進帽子裡，前面一根都看不到）。
    每撮：從帽緣內側 5 mm 往下到眉毛上面，寬 1.6 cm，貼著額頭外 6 mm；用頭髮的同一個材質、weilun_hair 貼圖的 'bang' 區；綁頭骨"""
    H = HB.Head(m); c = H.c; arm = m['arm']
    u0, v0, u1, v1 = HB.reg_uv('bang')
    V, F, UV = [], [], []
    for k in range(n):
        a = -48 + 96 * (k + 0.5) / n + np.random.default_rng(20 + k).uniform(-3, 3)
        # 帽緣的仰角（build_cap 的 z_rim）：前面在眉毛上緣＋1.6 cm——這裡直接用高度：根部 brow_top＋1.1 cm、髮尾 brow_z＋0.4～1.2 cm
        z_root = H.brow_top + 0.011; z_tip = H.brow_z + 0.004 + 0.008 * ((k * 7) % 3) / 2
        segs = 6; base = len(V)
        for j in range(segs + 1):
            t = j / segs; z = z_root + (z_tip - z_root) * t
            d = sph(a, 0.0); dh = np.array([d[0], d[1], 0.0]); dh /= np.linalg.norm(dh)
            hit = H.body.ray_cast(Vector(np.array([c[0], c[1], z])), Vector(dh), 0.25)[0]      # 那個高度的額頭表面：從頭的中心水平往外打
            ps = (np.array(hit) if hit is not None else np.array([c[0], c[1], z]) + dh * 0.09) + dh * (0.006 + 0.002 * (1 - t))
            side = np.array([-dh[1], dh[0], 0.0]); w = 0.008 * (1.0 - 0.45 * t)
            V.append(ps - side * w); V.append(ps + side * w)
            vv = v1 - (v1 - v0) * t; UV.append((u0, vv)); UV.append((u1, vv))
        for j in range(segs):
            i0 = base + 2 * j; F.append((i0, i0 + 1, i0 + 3, i0 + 2))
    me = bpy.data.meshes.new('Hair_CapBangs'); me.from_pydata([tuple(map(float, v)) for v in V], [], F); me.validate(); me.update()
    uvl = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uvl.data.foreach_set('uv', np.array(UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    ob = bpy.data.objects.new('Hair_CapBangs', me); (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(ob)
    me.materials.append(hair.data.materials[0]); C.bind(ob, arm, {HEAD: np.ones(len(V))})
    print('  cap bangs', n, 'verts', len(V))
    return ob


def apply(m):
    WH.SEED = 20261019
    hair = WH.apply(m)
    cap = build_cap(m, hair)
    cap_bangs(m, hair)
    m['cap'] = cap
    return hair
