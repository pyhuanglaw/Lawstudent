"""溫書瑀（heroine_05）的衣服：沿用沈以安的 h01_clothes（p00_clothes.run：BodyMap 對到沈以安的比例、做完再轉回來），款式照參考圖 06：
白色棉質襯衫（開第一顆扣子的 V 字開口、反摺領、前面門襟＋扣子、袖子捲到手肘下、下擺紮進褲子）、卡其色直筒長褲、深棕皮帶、深棕樂福鞋。
領子、門襟、扣子、捲起來的袖口是這個檔案自己做的網格（h01_clothes 只有身片、袖子、褲子、鞋）。判決節錄資料夾是 props3d.js。"""
import math
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import common as C
import p00_clothes as PC

STYLE = dict(KNIT_RGB=np.array([238, 236, 231]) / 255.0, TROUSER_RGB=np.array([180, 160, 124]) / 255.0, BELT_RGB=np.array([74, 50, 36]) / 255.0,
             LEATHER_RGB=np.array([76, 48, 34]) / 255.0, SOLE_RGB=np.array([40, 30, 24]) / 255.0, GOLD_RGB=np.array([196, 166, 104]) / 255.0,
             SHOE_STYLE='loafer', NECK_STYLE='V', HEM_OVER_PANTS=False, SLIM=True, TOP_TEX='linen', TROUSER_TEX='twill',
             SLEEVE_LEN=0.64, SLEEVE_K=0.80, CUFF_EASE=0.018, EASE_K=0.70, DROP_X=0.105, TOP_FIT=0.50, HEM_LOOSE=True,
             PANTS_ELLIPSE=(0.066, 0.076), PANTS_DROP=False, PANTS_HEM_UP=0.030)
# 高度寫在溫書瑀身上（Sendagaya Shino 樣本：胯骨 0.935、脊椎骨頭 0.988、脖子 1.343）：
# 卡其褲的褲頭在腰（脊椎骨頭上方 3 cm）、襯衫紮進去（下擺停在褲頭上緣，皮帶整條露出來）；開第一顆扣子的 V 字最低點在脖子根部下 9 cm
STYLE_M = dict(PANTS_TOP=1.018, PANTS_BAND=0.983, KNIT_HEM=1.011, KNIT_HEM_TOP=1.023, V_BOTTOM=1.253, BACK_NECK_Z=1.356)
SIDE_NECK_M = (0.052, 1.360)

COLLAR_STAND = (0.024, 0.014)     # 領座在後中心、側頸的高度（往上沿著脖子）
COLLAR_W = (0.032, 0.036, 0.050)  # 領片寬度：後中心、側頸、前面領尖（第二版收窄：4／4.4／6 cm 在肩膀上像披肩）
BUTTON_R = 0.0048
BUTTON_STEP = 0.088


def _u(v):
    v = np.asarray(v, float); n = np.linalg.norm(v, axis=-1, keepdims=True); return v / np.maximum(n, 1e-9)


def _sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def _world(obj):
    mw = np.array(obj.matrix_world); return C.co(obj) @ mw[:3, :3].T + mw[:3, 3]


def _bvh(obj):
    P = _world(obj); return BVHTree.FromPolygons(P.tolist(), [list(p.vertices) for p in obj.data.polygons]), P


def _boundary_loops(obj, P):
    """衣服網格的開口邊界（領口、袖口、下擺、褲腳……）：回傳每一圈的頂點索引（依順序）"""
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.verts.ensure_lookup_table()
    nb = {}
    for e in bm.edges:
        if e.is_boundary:
            a, b = e.verts[0].index, e.verts[1].index; nb.setdefault(a, []).append(b); nb.setdefault(b, []).append(a)
    bm.free()
    loops, seen = [], set()
    for s in nb:
        if s in seen: continue
        loop = [s]; seen.add(s); prev, cur = None, s
        while True:
            nxt = [x for x in nb[cur] if x != prev and x not in seen]
            if not nxt: break
            prev, cur = cur, nxt[0]; loop.append(cur); seen.add(cur)
        loops.append(loop)
    return loops


class Mesh:
    def __init__(self): self.V, self.F, self.UV, self.W = [], [], [], []

    def strip(self, A, B, uvv, w):
        """A、B 兩條等長的點列之間的四邊形帶（A 是內緣）"""
        base = len(self.V); n = len(A)
        for i in range(n):
            u = 0.04 + 0.92 * i / max(1, n - 1)
            self.V += [A[i], B[i]]; self.UV += [(u, uvv[0]), (u, uvv[1])]; self.W += [w[i], w[i]]
        for i in range(n - 1):
            a0 = base + 2 * i; self.F.append((a0, a0 + 2, a0 + 3, a0 + 1))

    def obj(self, name, arm, mat, groups):
        me = bpy.data.meshes.new(name); me.from_pydata([tuple(p) for p in self.V], [], self.F); me.validate(clean_customdata=False); me.update()
        uvl = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
        uvl.data.foreach_set('uv', np.array(self.UV)[li].reshape(-1).astype(np.float32))
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
        o = bpy.data.objects.new(name, me)
        (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(o)
        me.materials.append(mat); C.bind(o, arm, groups(np.array(self.V), np.array(self.W)))
        return o


def build_shirt_parts(m, clothes):
    arm = m['arm']
    N = C.bone_head(arm, 'J_Bip_C_Neck'); U = C.bone_head(arm, 'J_Bip_C_UpperChest')
    bvh, P = _bvh(clothes)
    knit = next(mt for mt in clothes.data.materials if mt and 'Knit' in mt.name)
    img = knit.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_texture.index.source
    mat = C.mtoon_from(knit.name, 'P05_Collar_CLOTH', base_img=img, double_sided=True)

    def onsurf(p, off):
        hit = bvh.find_nearest(Vector(p))
        if hit[0] is None: return np.array(p)
        return np.array(hit[0]) + np.array(hit[1]) * off

    # ---- 1. 領口那一圈（衣服網格的邊界）：從 V 字最低點往人物左邊、繞過後頸、到右邊 ----
    loops = _boundary_loops(clothes, P)
    neck = max((l for l in loops if len(l) > 8), key=lambda l: float(np.mean(P[l, 2])) - 3 * float(np.mean(np.abs(P[l, 0]))))
    R = P[neck]
    i0 = int(np.argmin(R[:, 2] + 5 * np.abs(R[:, 0])))       # V 字最低點（前中心）
    R = np.roll(R, -i0, axis=0)
    if R[len(R) // 4, 0] < 0: R = R[::-1]; R = np.roll(R, 1, axis=0)   # 先往 +x（人物的左邊）走
    seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(np.vstack([R, R[:1]]), axis=0), axis=1))]
    L = seg[-1]
    print('  collar: neck loop %d verts, length %.3f, V bottom %s' % (len(R), L, np.round(R[0], 3)))
    # 均勻重新取樣（不含 V 字最低點附近 1.5 cm：那裡是門襟）
    s = np.linspace(0.015, L - 0.015, 97)
    Rc = np.vstack([R, R[:1]])
    ring = np.stack([np.interp(s, seg, Rc[:, k]) for k in range(3)], -1)
    t = s / L                                   # 0..1：左前 → 後中心 0.5 → 右前
    back = np.cos(np.pi * (t - 0.5) * 1.0) ** 2  # 後中心 1、前面 0
    tan = _u(np.gradient(ring, axis=0))
    cen = np.array([N[0], N[1], float(np.mean(ring[:, 2]))])
    # 2. 領座：從領口往上沿著脖子（後中心 2.4 cm、側頸 1.4 cm、前面 0）
    stand_h = np.interp(np.abs(t - 0.5), [0, 0.17, 0.30, 0.42, 0.5], [COLLAR_STAND[0], COLLAR_STAND[0] * 0.9, COLLAR_STAND[1], 0.004, 0.0])
    radial = _u(np.column_stack([ring[:, 0] - cen[0], ring[:, 1] - cen[1], np.zeros(len(ring))]))
    fold = ring + np.array([0, 0, 1.0]) * stand_h[:, None] + radial * 0.0035
    # 3. 領片：從領座上緣（反摺線）沿著衣服表面往外、往下鋪（後中心 4 cm、側頸 4.4 cm、前面領尖 6 cm）
    width = np.interp(np.abs(t - 0.5), [0, 0.17, 0.30, 0.38, 0.44, 0.5], [COLLAR_W[0], COLLAR_W[0], COLLAR_W[1], COLLAR_W[2], COLLAR_W[2] * 0.75, 0.012])
    outer, mid = [], []
    for i in range(len(ring)):
        p = fold[i] + radial[i] * 0.004
        nrm = np.array(bvh.find_nearest(Vector(ring[i]))[1])
        d = _u(np.cross(tan[i], nrm))
        hd = np.array([d[0], d[1], 0.0])
        if np.dot(hd, radial[i]) - 0.5 * d[2] < 0: d = -d
        walked, q = 0.0, p.copy(); step = 0.002; qm = None; target = width[i] + stand_h[i]
        while walked < target:
            st = min(step, target - walked)
            q = onsurf(q + d * st, 0.0028)
            nrm = np.array(bvh.find_nearest(Vector(q))[1]); d = _u(d - nrm * np.dot(d, nrm)); walked += st
            if qm is None and walked >= stand_h[i] + 0.45 * width[i]: qm = q + nrm * 0.0010    # 領片中間（布料蓋在領座、衣服上面，比外緣多浮 1 mm）
        outer.append(q); mid.append(qm if qm is not None else (p + q) / 2)
    outer = np.array(outer); mid = np.array(mid)
    # 領尖：前面的外緣往下、往外拉出尖角（兩邊各一個）
    w = _sstep(0.30, 0.42, np.abs(t - 0.5)) * (1 - _sstep(0.44, 0.48, np.abs(t - 0.5)))
    outer += np.array([0, 0, -0.010])[None, :] * w[:, None]
    for _ in range(8):      # 外緣、中間線磨順（沿著表面一步一步走出來的點會跟著網格的面上下抖，領子看起來像荷葉邊）
        outer[1:-1] = outer[1:-1] * 0.5 + (outer[:-2] + outer[2:]) * 0.25
        mid[1:-1] = mid[1:-1] * 0.5 + (mid[:-2] + mid[2:]) * 0.25
    mc = Mesh()
    wneck = 0.65 * back + 0.25
    mc.strip(ring + radial * 0.0015, fold, (0.40, 0.46), wneck)        # 領座（貼圖 v 0.75 以上是下擺、袖口的車縫線：領子用中間素面的部分）
    mc.strip(fold + radial * 0.004, mid, (0.46, 0.53), wneck * 0.6)    # 領片（反摺線 → 中間 → 外緣，兩段：一段直的會穿進肩膀的弧面）
    mc.strip(mid, outer, (0.53, 0.60), wneck * 0.5)
    collar = mc.obj('Clothes_Collar', arm, mat, lambda V, W: {'J_Bip_C_Neck': W, 'J_Bip_C_UpperChest': 1 - W})

    # ---- 3b. V 字開口裡的胸口皮膚 ----
    # Sendagaya Shino 樣本的身體在原本上衣蓋住的地方（胸口、上背、上臂）沒有面（VRoid 匯出時刪掉了），襯衫開 V 領會看到一個洞。
    # 第二版：從脖子皮膚的下緣（身體網格的開口邊界）往下長出一片——第一列就是邊界上的點（接縫看不出來）、每一行的 UV 用那個邊界頂點的 UV
    # （顏色接得上）、法線從邊界頂點的法線漸變到胸口的方向；深度照開口兩邊襯衫表面內插（中間微微往前凸 4 mm）、在襯衫表面後面 6 mm。
    # （第一版是一片單色、和脖子分開的面：遊戲裡脖子下緣的鋸齒邊和顏色差都看得到。）
    body = m['body']; Mb = np.array(body.matrix_world); Pb = C.co(body) @ Mb[:3, :3].T + Mb[:3, 3]
    Nl = np.empty(len(body.data.vertices) * 3); body.data.vertices.foreach_get('normal', Nl); Nw = _u(Nl.reshape(-1, 3) @ Mb[:3, :3].T)
    zN = float(N[2]); yc = float(N[1]); zb = float(R[0][2]) - 0.025
    # 脖子前面的下緣：身體網格開口邊界（軀幹那個大洞的邊界是一整圈，脖子、肩膀、手臂連在一起）上，|x| < 7.5 cm、比脖子骨頭低不到 10 cm、在前面的那一段；
    # 照邊界的順序取最長的連續一段（不用 x 排序：下緣是鋸齒狀的）
    okf = lambda v: bool(Pb[v, 1] < yc - 0.005 and abs(Pb[v, 0]) < 0.075 and zN - 0.10 < Pb[v, 2] < zN + 0.03)
    best = []
    for l in _boundary_loops(body, Pb):
        isf = [okf(v) for v in l]
        if not any(isf): continue
        if all(isf): runs = [l]
        else:
            st = next(i for i in range(len(l)) if not isf[i]); runs = []; cur = []
            for k in range(1, len(l) + 1):
                i = (st + k) % len(l)
                if isf[i]: cur.append(l[i])
                elif cur: runs.append(cur); cur = []
            if cur: runs.append(cur)
        for r_ in runs:
            if len(r_) > len(best): best = r_
    front = best
    if Pb[front[0], 0] > Pb[front[-1], 0]: front = front[::-1]
    uvb = body.data.uv_layers.active.data; li = np.zeros(len(body.data.loops), int); body.data.loops.foreach_get('vertex_index', li)
    first_loop = {}
    for k, v in enumerate(li):
        if v not in first_loop: first_loop[int(v)] = k
    def chest_y(x, z):
        hits = {}
        for sg in (-1, 1):
            for k in range(45):
                xx = x + sg * 0.003 * k
                h = bvh.ray_cast(Vector((xx, -0.5, z)), Vector((0, 1, 0)), 1.0)
                if h[0] is not None and h[1][1] < -0.3 and h[0][1] < yc: hits[sg] = (xx, h[0][1]); break
        if not hits: return None
        if len(hits) == 1: return list(hits.values())[0][1] + 0.006
        (xl, yl), (xr, yr) = hits[-1], hits[1]
        if xr - xl < 1e-4: return yl + 0.006
        t = (x - xl) / (xr - xl)
        return yl + (yr - yl) * t + 0.006 - 0.004 * 4 * t * (1 - t)
    depth = [0.0, 0.010, 0.022, 0.036, 0.052, 0.072, 0.095, 0.120]
    ms = Mesh(); NN = []; ncol = len(front)
    for v in front:
        pb = Pb[v]; uv0 = tuple(uvb[first_loop[int(v)]].uv); prev_y = pb[1]
        for k, dz in enumerate(depth):
            z = max(pb[2] - dz, zb) if k else pb[2]
            x = pb[0] * (1 + 0.25 * dz / 0.12)
            yt = chest_y(x, z)
            yt = prev_y if yt is None else yt
            w = float(_sstep(0.0, 0.026, dz))
            y = pb[1] * (1 - w) + yt * w if k else pb[1]
            prev_y = y
            ms.V.append(np.array([x, y, z])); ms.UV.append(uv0); ms.W.append(float(_sstep(zN - 0.045, zN + 0.010, z)))
            nk = _u(Nw[v] * (1 - w) + np.array([0, -0.97, 0.24]) * w); NN.append(nk)
    nr = len(depth)
    for c in range(ncol - 1):
        for k in range(nr - 1):
            a0 = c * nr + k; ms.F.append((a0, a0 + nr, a0 + nr + 1, a0 + 1))
    smat = next(sl.material for sl in body.material_slots if sl.material and 'Body_00_SKIN' in sl.material.name)
    chest = ms.obj('Body_ChestPatch', arm, smat, lambda V, W: {'J_Bip_C_Neck': W, 'J_Bip_C_UpperChest': 1 - W})
    me = chest.data; pn = np.array([p.normal for p in me.polygons])
    if pn[:, 1].mean() > 0:
        for p in me.polygons: p.flip()
        me.update()
    try: me.normals_split_custom_set_from_vertices([tuple(n) for n in NN])
    except Exception as ex: print('  chest normals', ex)
    print('  chest patch: %d boundary verts on the neck front (x %.3f..%.3f, z %.3f..%.3f), %d faces' % (ncol, Pb[front[0], 0], Pb[front[-1], 0], Pb[front, 2].min(), Pb[front, 2].max(), len(ms.F)))

    # ---- 4. 門襟＋扣子：V 字最低點到褲頭（紮進去的地方）的前中心 ----
    vb = R[0]; ztop = vb[2] - 0.004; zbot = C.bone_head(arm, 'J_Bip_C_Spine')[2] + 0.034
    mp = Mesh(); A, B, ww = [], [], []
    zs = np.linspace(ztop, zbot, 24)
    for z in zs:
        rows = []
        for dx in (-0.013, 0.013):
            h = bvh.ray_cast(Vector((dx, -0.5, z)), Vector((0, 1, 0)), 1.0)[0]
            rows.append(np.array([dx, (float(h[1]) if h is not None else vb[1]) - 0.0016, z]))
        A.append(rows[0]); B.append(rows[1]); ww.append(0.0)
    mp.strip(np.array(A), np.array(B), (0.50, 0.56), np.zeros(len(A)))
    nbtn = 0
    zb = ztop - 0.020
    while zb > zbot + 0.015:
        h = bvh.ray_cast(Vector((0.0, -0.5, zb)), Vector((0, 1, 0)), 1.0)[0]
        y = (float(h[1]) if h is not None else vb[1]) - 0.0030
        base = len(mp.V); nseg = 10
        mp.V.append(np.array([0.0, y - 0.0012, zb])); mp.UV.append((0.53, 0.53)); mp.W.append(0.0)
        for k in range(nseg):
            a = 2 * math.pi * k / nseg; mp.V.append(np.array([BUTTON_R * math.cos(a), y, zb + BUTTON_R * math.sin(a)])); mp.UV.append((0.53, 0.53)); mp.W.append(0.0)
        for k in range(nseg):
            mp.F.append((base, base + 1 + (k + 1) % nseg, base + 1 + k))
        nbtn += 1; zb -= BUTTON_STEP
    bmat = C.mtoon_from(knit.name, 'P05_Placket_CLOTH', base_img=img, double_sided=True)
    try: bmat.vrm_addon_extension.mtoon1.pbr_metallic_roughness.base_color_factor = (0.93, 0.92, 0.90, 1.0)
    except Exception as ex: print('  placket factor', ex)
    sp = C.bone_head(arm, 'J_Bip_C_Spine'); ch = C.bone_head(arm, 'J_Bip_C_Chest')
    def torso_w(V, W):
        z = V[:, 2]; a = np.clip((z - sp[2]) / max(1e-3, ch[2] - sp[2]), 0, 1); b = np.clip((z - ch[2]) / max(1e-3, U[2] - ch[2]), 0, 1)
        return {'J_Bip_C_Spine': (1 - a) * (z < ch[2]), 'J_Bip_C_Chest': np.where(z < ch[2], a, 1 - b), 'J_Bip_C_UpperChest': b * (z >= ch[2])}
    placket = mp.obj('Clothes_Placket', arm, bmat, torso_w)

    # ---- 5. 捲起來的袖口：袖子末端外面一圈 4 cm 寬、厚 5 mm 的布 ----
    mu = Mesh(); cuffs = 0
    sides = []
    for l in loops:
        if len(l) < 8: continue
        Q = P[l]; xm = float(np.mean(Q[:, 0]))
        if abs(xm) > 0.25 and float(np.ptp(Q[:, 0])) < 0.05: sides.append((xm, Q))
    for xm, Q in sides:
        sg = 1 if xm > 0 else -1; c0 = Q.mean(0); rad = float(np.max(np.linalg.norm((Q - c0)[:, 1:], axis=1))) + 0.0050
        nseg = 24; ax = np.array([sg * 1.0, 0, 0])
        ringA = []; ringB = []; ringC = []
        for k in range(nseg + 1):
            a = 2 * math.pi * k / nseg; r = np.array([0, math.cos(a), math.sin(a)])
            ringA.append(c0 + ax * 0.004 + r * (rad - 0.002)); ringB.append(c0 + r * (rad + 0.002)); ringC.append(c0 - ax * 0.040 + r * (rad + 0.0015))
        bone = 'J_Bip_%s_LowerArm' % ('L' if sg > 0 else 'R')
        mu.strip(np.array(ringA), np.array(ringB), (0.88, 0.92), np.ones(nseg + 1))
        mu.strip(np.array(ringB), np.array(ringC), (0.60, 0.70), np.ones(nseg + 1))
        mu.strip(np.array(ringC), np.array(ringC) - ax * 0.002 - (np.array(ringC) - c0 + ax * 0.040) * 0.06, (0.58, 0.60), np.ones(nseg + 1))
        cuffs += 1
    if cuffs:
        cmat = C.mtoon_from(knit.name, 'P05_Cuff_CLOTH', base_img=img, double_sided=True)
        cuff = mu.obj('Clothes_Cuffs', arm, cmat, lambda V, W: {'J_Bip_L_LowerArm': (V[:, 0] > 0).astype(float), 'J_Bip_R_LowerArm': (V[:, 0] <= 0).astype(float)})
    print('  shirt parts: collar %d faces, placket+buttons %d faces (%d buttons), cuffs %d' % (len(mc.F), len(mp.F), nbtn, cuffs))
    return [o for o in (collar, chest, placket, cuff if cuffs else None) if o is not None]


def apply(m):
    obj = PC.run(m, STYLE, STYLE_M, SIDE_NECK_M)
    build_shirt_parts(m, obj)
    m['clothes'] = obj      # 頭髮模組只避開襯衫身片：試過把領子、胸口皮膚、門襟、袖口也算進去，雙面的薄片法線方向不一，馬尾被推到前面肩膀上（長度變成 1 m）
    return obj
