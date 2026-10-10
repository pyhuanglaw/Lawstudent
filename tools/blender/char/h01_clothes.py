"""沈以安（heroine_01）的衣服（Blender bmesh 參數化建模，2026-10-10）：
  上衣：米白 oversize V 領粗針織衫——落肩（身片的肩在上臂、袖子從身片側面接出）、身體直筒寬鬆（胸前直落，不貼身）、
        下擺羅紋在高腰褲的褲頭上緣、長袖有蓬度、手腕羅紋袖口收口、V 領（鎖骨下約 9 cm）有羅紋領邊。
  褲子：藍灰高腰寬褲——褲頭在自然腰線（肚臍上方）、褲頭帶＋鈕扣、前片打褶、褲管從臀部直落到鞋面、前後中線燙痕；
        兩條褲管各自是一個管，胯下以上的內側貼在身體中線的平面（在身體裡面、看不到），胯下以下內側分開。
  鞋：深棕亮皮樂福鞋＋金色馬銜扣、低跟（鞋底厚度照赤腳腳底高度 3.6 cm 分成鞋跟塊、前掌鞋底、鞋面）。
做法：每個部位沿著身體的軸（軀幹、手臂、腿、腳）做一圈一圈的環，環的半徑＝「設計的輪廓」與「身體表面（BVH 射線量）＋寬鬆量」取大的；
      不用任何現成的衣服網格。權重：貼近身體的部分（軀幹、褲頭、臀部）用身體最近點內插；離身體遠的部分（袖子、寬褲管、鞋）照沿著骨頭軸的位置給。
      被衣服完全蓋住的皮膚面刪掉（V 領、脖子、手、腳背開口看得到的皮膚留著）。
用法：heroine_01.py --stages stage0,...,clothes（模組提供 apply(m)）"""
import os, math
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import common as C

WIP = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl')
KNIT_RGB = np.array([232, 220, 198]) / 255.0      # #e8dcc6
TROUSER_RGB = np.array([108, 119, 139]) / 255.0   # #6c778b
LEATHER_RGB = np.array([66, 40, 29]) / 255.0
SOLE_RGB = np.array([36, 26, 22]) / 255.0
GOLD_RGB = np.array([206, 168, 92]) / 255.0
SLIM = True                # 衣服蓋住的胸、臀、胯略收（沈以安；男生不用）
SHOE_STYLE = 'loafer'      # 'loafer'（沈以安：樂福鞋＋馬銜扣）／'sneaker'（球鞋：厚鞋底、鞋口較高、鞋帶）
PANTS_ELLIPSE = (0.083, 0.102)   # 寬褲褲管的截面半徑（左右、前後；膝蓋以下前後再加寬 2 cm）
BUST = ('J_Sec_L_Bust1', 'J_Sec_L_Bust2', 'J_Sec_R_Bust1', 'J_Sec_R_Bust2')
TORSO_BONES = {'J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_C_Neck',
               'J_Bip_L_Shoulder', 'J_Bip_R_Shoulder'} | set(BUST)

# 尺寸（公尺；Blender 座標 Z 朝上、人物面向 -Y、+X＝人物左手邊）
PANTS_TOP = 1.100          # 褲頭上緣（自然腰線，肚臍上方；第二版 1.085 → 1.100：上緣藏在毛衣下擺裡面，站姿彎腰時不會露出肚子）
PANTS_BAND = 1.031         # 褲頭帶下緣
KNIT_HEM = 1.065           # 毛衣下擺（蓋到褲頭帶上緣，褲頭帶與鈕扣露出來）
KNIT_HEM_TOP = 1.112       # 下擺羅紋上緣
V_BOTTOM = 1.252           # V 領最低點（鎖骨下約 9 cm）
DROP_X = 0.162             # 落肩：身片在肩膀的寬度（袖子從這裡接出）。第二版 0.19 → 0.162：T 字姿勢做的身片在腋下往外加寬，遊戲裡手放下來變成肩膀下面一圈像披肩的平台
SHOULDER_Z = 1.366         # 落肩線的高度（身片側面上緣）
SIDE_NECK = (0.071, 1.402) # 領口側頸點（|x|、z）
BACK_NECK_Z = 1.388
NECK_STYLE = 'V'           # 'V'（沈以安）／'crew'（圓領：前中心在 CREW_FRONT_Z，往側頸點圓弧上升）
CREW_FRONT_Z = 1.352
SLEEVE_K = 0.82           # 袖子粗細（設計輪廓的倍數；沈以安 0.82）
EASE_K = 1.0              # 身片寬鬆量的倍數
WSRC = None               # 權重來源：VRoid 原本的上衣網格（祐廷：連帽上衣）。有的話，毛衣的身片、袖子根部照它的權重（VRoid 調過手放下的姿勢）
HEM_OVER_PANTS = False     # 毛衣下擺蓋過褲頭、落在胯部（祐廷）：身片的箱形往下量到下擺，而且把褲子算進去（不然下擺會切進臀部和褲子）


def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0.0, 1.0); return t * t * (3 - 2 * t)


def unit(v):
    v = np.asarray(v, float); return v / max(np.linalg.norm(v), 1e-12)


# ---------------------------------------------------------------- 身體量測與權重
class Skin:
    def __init__(self, body):
        me = body.data; M = np.array(body.matrix_world)
        P = C.co(body); self.P = P @ M[:3, :3].T + M[:3, 3]
        me.calc_loop_triangles()
        T = np.zeros(len(me.loop_triangles) * 3, np.int64); me.loop_triangles.foreach_get('vertices', T); self.T = T.reshape(-1, 3)
        self.names = [g.name for g in body.vertex_groups]
        W = np.zeros((len(P), len(self.names)))
        for v in me.vertices:
            for g in v.groups: W[v.index, g.group] = g.weight
        self.W = W
        N = np.empty(len(P) * 3); me.vertices.foreach_get('normal', N); self.N = N.reshape(-1, 3) @ M[:3, :3].T
        self.cache = {}
        self.full = self.bvh(None)

    def wsum(self, names):
        idx = [i for i, n in enumerate(self.names) if n in names]
        return self.W[:, idx].sum(1) if idx else np.zeros(len(self.P))

    def bvh(self, names, thr=0.5):
        """只用「三個頂點在 names 骨頭上的權重都 ≥ thr」的三角形建 BVH（names=None：全部）"""
        key = None if names is None else tuple(sorted(names))
        if key in self.cache: return self.cache[key]
        if names is None: T = self.T
        else:
            w = self.wsum(set(names)); T = self.T[(w[self.T] >= thr).all(1)]
        b = (BVHTree.FromPolygons(self.P.tolist(), T.tolist(), all_triangles=True), T)
        self.cache[key] = b; return b

    @staticmethod
    def outer(bv, o, d, R0=0.45):
        """從 o 沿 d 方向，身體最外層表面離 o 的距離（從外面往內射）；沒打到回傳 nan"""
        o = np.asarray(o, float); d = unit(d)
        hit = bv[0].ray_cast(Vector(o + d * R0), Vector(-d), R0 + 1e-4)
        if hit[0] is None: return float('nan')
        return R0 - hit[3]

    def nearest_weights(self, Q, bv=None):
        """Q 每個點在身體上最近的三角形 → 重心座標內插骨頭權重（N×G，和 self.names 同順序）"""
        bvt, T = bv or self.full; out = np.zeros((len(Q), len(self.names)))
        for i, q in enumerate(Q):
            loc, nrm, fi, dist = bvt.find_nearest(Vector(q))
            if fi is None: continue
            a, b, c = self.P[T[fi]]; p = np.array(loc)
            v0, v1, v2 = b - a, c - a, p - a
            d00, d01, d11, d20, d21 = v0 @ v0, v0 @ v1, v1 @ v1, v2 @ v0, v2 @ v1
            den = d00 * d11 - d01 * d01
            if abs(den) < 1e-14: bc = np.array([1 / 3, 1 / 3, 1 / 3])
            else:
                v = (d11 * d20 - d01 * d21) / den; w = (d00 * d21 - d01 * d20) / den; bc = np.clip([1 - v - w, v, w], 0, 1); bc = bc / bc.sum()
            out[i] = bc @ self.W[T[fi]]
        return out

    def col(self, name):
        return self.names.index(name) if name in self.names else None


def limit_norm(W, k=4):
    W = W.copy()
    if W.shape[1] > k:
        thr = -np.sort(-W, axis=1)[:, k - 1:k]; W[W < thr] = 0
    s = W.sum(1, keepdims=True); s[s < 1e-9] = 1; return W / s


def weights_dict(skin, W):
    return {skin.names[j]: W[:, j] for j in range(W.shape[1]) if W[:, j].max() > 1e-4}


def axis_weights(skin, n, items):
    """items：[(骨頭名稱, 權重陣列)]，組成 N×G"""
    W = np.zeros((n, len(skin.names)))
    for name, w in items:
        j = skin.col(name)
        if j is not None: W[:, j] += w
    return W


# ---------------------------------------------------------------- 網格建立
class MB:
    """收集頂點、四邊形（每個面自己的 UV）；grid() 會檢查面朝外（必要時整片翻面）"""
    def __init__(self):
        self.V = []; self.F = []; self.FUV = []; self.FMAT = []; self.tag = []

    def add(self, P, tag):
        i0 = len(self.V); P = np.asarray(P, float).reshape(-1, 3)
        self.V.extend(P.tolist()); self.tag.extend([tag] * len(P)); return np.arange(i0, i0 + len(P))

    def grid(self, I, UV, closed=True, mat=0, centers=None, skip=None, outward=1):
        """I：R×K 頂點編號；UV：R×(K+1)×2（closed）或 R×K×2；centers：R×3 每一列的中心（判斷朝外）"""
        R, K = I.shape; V = np.array(self.V)
        quads = []
        for r in range(R - 1):
            for k in range(K if closed else K - 1):
                if skip is not None and skip(r, k): continue
                k2 = (k + 1) % K
                quads.append(((I[r, k], I[r, k2], I[r + 1, k2], I[r + 1, k]),
                              (UV[r, k], UV[r, k + 1], UV[r + 1, k + 1], UV[r + 1, k])))
        if centers is not None and quads:
            s = 0.0
            for (q, _) in quads[::max(1, len(quads) // 200)]:
                a, b, c, d = V[list(q)]; n = np.cross(b - a, d - a); m = (a + b + c + d) / 4
                r = int(np.argmin([abs(np.linalg.norm(m - cc)) for cc in centers]))
                s += np.sign(n @ (m - centers[r]))
            if s * outward < 0: quads = [(q[::-1], uv[::-1]) for (q, uv) in quads]
        for q, uv in quads:
            self.F.append(q); self.FUV.append(uv); self.FMAT.append(mat)
        return len(quads)

    def fan(self, ring, center_idx, uv_ring, uv_c, mat, outward_dir):
        V = np.array(self.V); c = V[center_idx]; K = len(ring); tris = []
        for k in range(K):
            k2 = (k + 1) % K; tris.append(((ring[k], ring[k2], center_idx), (uv_ring[k], uv_ring[k2], uv_c)))
        a, b, cc = V[list(tris[0][0])]; n = np.cross(b - a, cc - a)
        if n @ outward_dir < 0: tris = [(t[::-1], u[::-1]) for (t, u) in tris]
        for t, u in tris: self.F.append(t); self.FUV.append(u); self.FMAT.append(mat)

    def build(self, name, mats):
        bm = bmesh.new(); vs = [bm.verts.new(v) for v in self.V]; bm.verts.ensure_lookup_table()
        uvl = bm.loops.layers.uv.new('UVMap'); bad = 0
        for f, uv, mi in zip(self.F, self.FUV, self.FMAT):
            try: face = bm.faces.new([vs[i] for i in f])
            except ValueError: bad += 1; continue
            face.material_index = mi; face.smooth = True
            for loop, t in zip(face.loops, uv): loop[uvl].uv = (float(t[0]), float(t[1]))
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for mt in mats: me.materials.append(mt)
        obj = bpy.data.objects.new(name, me)
        return obj, bad


def hull2(pts):
    """2D 凸包（Andrew monotone chain），逆時針"""
    P = sorted(map(tuple, np.asarray(pts, float)))
    def cross(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in P:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(P):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return np.array(lo[:-1] + up[:-1])


def ray_poly(H, d):
    """從原點沿 d 方向打到凸多邊形 H 的距離"""
    best = 0.0; n = len(H)
    for i in range(n):
        a = H[i]; e = H[(i + 1) % n] - a; den = d[0] * e[1] - d[1] * e[0]
        if abs(den) < 1e-12: continue
        t = (a[0] * e[1] - a[1] * e[0]) / den; u = (a[0] * d[1] - a[1] * d[0]) / den
        if t > 0 and -1e-9 <= u <= 1 + 1e-9: best = max(best, t)
    return best


def resample(P, n):
    P = np.asarray(P, float); s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    t = np.linspace(0, s[-1], n); return np.stack([np.interp(t, s, P[:, k]) for k in range(P.shape[1])], -1), t


# ---------------------------------------------------------------- 褲子
def drape_pants(rows, phi, sg, z_crotch, mid=None):
    """第二版（2026-10-10）：
    (a) 胯下以上，兩條褲管的內側壓成中線上的平面（D 字形），前、後中線附近 |x|<3 cm 是平的：兩管在中線接起來，
        前面不會出現兩管之間的凹溝（看得到裡面的皮膚）、背後褲頭不會有 V 字缺口。
    (b) 肚子、臀部、胯骨最突出的地方以下，前／後／外側直直落下：寬褲從臀部直落，不貼著臀部的弧線（側面看臀部不會鼓出去）。
    rows：R×K×3（最後兩列是褲腳 'hem'、往內折的 'fold'）"""
    rows = rows.copy(); R, K = rows.shape[:2]; cs, sn = np.cos(phi), np.sin(phi)
    zr = rows[:, :, 2].mean(1)
    X0 = 0.03
    for r in range(R - 2):
        wD = float(sstep(z_crotch + 0.004, z_crotch + 0.045, zr[r]))
        if wD <= 0: continue
        ring = rows[r]; ax = sg * ring[:, 0]
        # 第三版：內側弧照「角度」對應到 D 字形的邊（後角 → 中線 → 前角），不是照點數平均分配——
        # 點數分配時相鄰兩圈同一個點會落在不同的地方，四邊形斜著接，兩管在中縫之間露出細縫（鈕扣下面、褲頭背面）
        order = [(K // 4 + i) % K for i in range(K // 2 + 1)]          # 正後方（90°）→ 內側（180°）→ 正前方（270°）
        axo = ax[order]
        if axo.min() >= X0 or axo[0] < X0 or axo[-1] < X0: continue
        ib = next(i for i in range(1, len(order)) if axo[i] < X0); jf = max(i for i in range(len(order) - 1) if axo[i] < X0)
        fb = (ib - 1) + (axo[ib - 1] - X0) / max(axo[ib - 1] - axo[ib], 1e-9)
        ff = jf + (X0 - axo[jf]) / max(axo[jf + 1] - axo[jf], 1e-9)          # jf 在 X0 裡面、jf+1 在外面
        Pb = ring[order[ib - 1]] + (ring[order[ib]] - ring[order[ib - 1]]) * (fb - (ib - 1))
        Pf = ring[order[jf]] + (ring[order[jf + 1]] - ring[order[jf]]) * (ff - jf)
        arc_i = list(range(ib, jf + 1)); arc = np.array([order[i] for i in arc_i]); ya = ring[arc, 1]
        # 前面的平面不能在肚子後面；後面同理取最後面的
        yb = max(Pb[1], ya[sn[arc] > 0].max() if (sn[arc] > 0).any() else -1e9)
        yf = min(Pf[1], ya[sn[arc] < 0].min() if (sn[arc] < 0).any() else 1e9)
        if mid is not None:          # 身體中線最前面／最後面（射線直接量）＋寬鬆量：中縫不會露出皮膚
            mf, mb_ = mid(zr[r]); yf = min(yf, mf - 0.009); yb = max(yb, mb_ + 0.009)
        path = np.array([[X0, yb], [0.0005, yb], [0.0005, yf], [X0, yf]])
        seg = np.linalg.norm(np.diff(path, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
        for i, k in zip(arc_i, arc):
            t = float(np.clip((i - fb) / max(ff - fb, 1e-9), 0, 1)) * cum[-1]
            j = min(int(np.searchsorted(cum, t, side='right')) - 1, 2); f = (t - cum[j]) / max(seg[j], 1e-9)
            q = path[j] + (path[j + 1] - path[j]) * f
            ring[k, 0] = ring[k, 0] + (sg * q[0] - ring[k, 0]) * wD; ring[k, 1] = ring[k, 1] + (q[1] - ring[k, 1]) * wD
    # (b) 直落（褲頭帶下面 z<1.02 開始）
    yb_ext = np.full(K, -1e9); yf_ext = np.full(K, 1e9); xo_ext = np.full(K, -1e9)
    wb = sstep(0.25, 0.6, sn); wf = sstep(0.25, 0.6, -sn); wo = sstep(0.25, 0.6, sg * 0 + cs)
    last = None
    for r in range(R - 2):
        if zr[r] > 1.02: continue
        ring = rows[r]; old = ring.copy()
        yb_ext = np.maximum(yb_ext, ring[:, 1]); yf_ext = np.minimum(yf_ext, ring[:, 1]); xo_ext = np.maximum(xo_ext, sg * ring[:, 0])
        ring[:, 1] = ring[:, 1] + wb * (yb_ext - ring[:, 1]) + wf * (yf_ext - ring[:, 1])
        ring[:, 0] = sg * (sg * ring[:, 0] + wo * (xo_ext - sg * ring[:, 0]))
        last = (old, ring.copy())
    if os.environ.get('PANTS_DEBUG') and sg > 0:
        for r in range(0, 8):
            ring = rows[r]; sel = [k for k in range(K) if sn[k] > 0.3 or abs(ring[k, 0]) < 0.035]
            print('   row z %.3f' % zr[r], ' '.join('k%d(%.3f,%.3f)' % (k, ring[k, 0], ring[k, 1]) for k in sel))
    if last is not None:
        dlt = last[1] - last[0]
        for r in (R - 2, R - 1): rows[r] = rows[r] + dlt * np.array([1, 1, 0])
    return rows


def build_pants(skin, arm, mb):
    hips_c = C.bone_head(arm, 'J_Bip_C_Hips')
    # 胯下高度：身體中線往上射
    hit = skin.full[0].ray_cast(Vector((0, hips_c[1], 0.45)), Vector((0, 0, 1)), 0.6)
    z_crotch = hit[0].z if hit[0] is not None else 0.80
    K = 32; phi = np.arange(K) * 2 * math.pi / K           # 0＝外側、90°＝後、180°＝內側、270°＝前
    zt = list(np.linspace(PANTS_TOP, PANTS_BAND, 5)) + [PANTS_BAND - 0.003]     # 褲頭帶（照 PANTS_TOP／PANTS_BAND 分 4 段：其他人物的褲頭高度不同）
    zl = list(np.linspace(min(1.00, PANTS_BAND - 0.015), z_crotch + 0.02, 6)) + list(np.linspace(z_crotch - 0.01, 0.62, 5)) + list(np.linspace(0.58, 0.48, 3)) + list(np.linspace(0.42, 0.12, 7)) + [0.09]
    zs = np.array(zt + zl)
    def zhem(ph): return 0.049 - 0.020 * np.sin(ph)        # 後面 3 cm、前面 6.9 cm（褲管蓋在鞋面上）
    legs = {}
    for side, sg in (('L', 1.0), ('R', -1.0)):
        # 褲頭在腰上（1.03–1.085 m）：那裡的皮膚綁 Spine＋Chest，每個頂點單一骨頭的權重常常 < 0.5——第一版只用 Hips/Spine、門檻 0.5，
        # 射線打不到身體，最上面兩圈縮在身體裡面（褲頭後面一個缺口）。加 Chest、門檻 0.3，打不到時沿用上一圈的半徑
        bv = skin.bvh(['J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_%s_UpperLeg' % side, 'J_Bip_%s_LowerLeg' % side], thr=0.3)
        rows = []; cens = []; rb_prev = np.zeros(K)
        for z in list(zs) + ['hem', 'fold']:
            zz = 0.06 if isinstance(z, str) else z
            wl = sstep(z_crotch + 0.07, z_crotch - 0.05, zz)              # 0：臀部（貼身體）、1：寬褲管
            cx = 0.073 + (0.086 - 0.073) * wl; cy = hips_c[1] + 0.004 - 0.004 * wl
            a = PANTS_ELLIPSE[0]; b = PANTS_ELLIPSE[1] + 0.020 * (PANTS_ELLIPSE[1] / 0.102) * np.clip((0.80 - zz) / 0.70, 0, 1)
            gap = -0.004 if zz > z_crotch - 0.005 else 0.0015     # 胯下以上：兩片在中線稍微重疊（前後中縫沒有縫隙）
            ring = []
            for k, ph in enumerate(phi):
                d = np.array([sg * math.cos(ph), math.sin(ph), 0.0])
                zr = zhem(ph) if z == 'hem' else (zhem(ph) + 0.004 if z == 'fold' else zz)
                o = np.array([sg * cx, cy, zr])
                rb = Skin.outer(skin.full if zz > 0.98 else bv, o, d, 0.40)   # 腰上（褲頭）用整個身體：那裡沒有另一條腿擋著
                if not np.isfinite(rb): rb = rb_prev[k]
                rb_prev[k] = rb
                if zz > 1.0: ease = 0.010
                elif zz > z_crotch: ease = 0.006 + 0.008 * sstep(1.0, 0.93, zz) + (0.004 * max(0, math.sin(ph)))
                else: ease = 0.012
                rell = 1.0 / math.sqrt((math.cos(ph) / a) ** 2 + (math.sin(ph) / b) ** 2)
                r = max(rb + ease, wl * rell)
                # 前中線燙痕（稜）、前片的褶（凹）
                if zz < 0.97:
                    if k == 24 or k == 8: r += 0.0035 * sstep(0.97, 0.90, zz)
                if zz < 1.03 and zz > 0.86 and k == 26: r -= 0.005 * sstep(0.86, 0.95, zz)
                if z == 'fold': r -= 0.0045
                if z == PANTS_BAND - 0.003: r -= 0.002
                if math.cos(ph) < -1e-6: r = min(r, (cx - gap) / (-math.cos(ph)))   # 內側不越過中線
                ring.append(o + d * r)
            rows.append(ring); cens.append(np.array([sg * cx, cy, zz]))
        rows = np.array(rows); R = len(rows)
        def mid(z, _cy=hips_c[1]):
            f = Skin.outer(skin.full, (0, _cy, z), (0, -1, 0), 0.40); b = Skin.outer(skin.full, (0, _cy, z), (0, 1, 0), 0.40)
            return (_cy - f if np.isfinite(f) else 1e9), (_cy + b if np.isfinite(b) else -1e9)
        rows0 = rows.copy()
        rows = drape_pants(rows, phi, sg, z_crotch, mid)
        if os.environ.get('PANTS_DEBUG'):
            bad = np.argwhere(np.abs(rows[:, :, :2]).max(-1) > 0.5)
            print('   pants', side, 'extreme points', len(bad), bad[:6].tolist(), 'before drape max', np.abs(rows0[:, :, :2]).max().round(3))
            for r_, k_ in bad[:3]: print('     row', r_, 'k', k_, 'z %.3f' % rows[r_, k_, 2], 'before', rows0[r_, k_].round(3), 'after', rows[r_, k_].round(3))
        # 褲頭上緣往內折（厚度）
        top_in = rows[0].copy(); cc = cens[0]
        top_in[:, :2] = cc[:2] + (top_in[:, :2] - cc[:2]) * 0.95; top_in[:, 2] -= 0.004
        rows = np.concatenate([top_in[None], rows]); cens = [cens[0]] + cens; R += 1
        I = np.stack([mb.add(rw, 'pants' + side) for rw in rows])
        # UV：u＝圈上的位置、v＝高度（1.1 m → 0..1）
        U = np.arange(K + 1) / K
        Vv = np.clip(rows[:, :, 2].mean(1) / 1.12, 0, 0.985)
        Vv[0] = 0.99
        UV = np.zeros((R, K + 1, 2)); UV[:, :, 0] = U[None, :]; UV[:, :, 1] = Vv[:, None]
        mb.grid(I, UV, closed=True, mat=1, centers=np.array(cens))
        legs[side] = dict(I=I, rows=rows, cens=cens)
    # 鈕扣（左片前中、褲頭帶中間）
    yb = min(legs['L']['rows'][3][:, 1].min(), legs['R']['rows'][3][:, 1].min())
    bc = np.array([0.008, yb - 0.0025, (PANTS_TOP + PANTS_BAND) / 2 - 0.007]); nb = 10
    ang = np.arange(nb) * 2 * math.pi / nb
    front = bc + np.stack([0.0075 * np.cos(ang), np.full(nb, -0.0012), 0.0075 * np.sin(ang)], -1)
    back = bc + np.stack([0.0075 * np.cos(ang), np.full(nb, 0.0018), 0.0075 * np.sin(ang)], -1)
    ib = mb.add(np.concatenate([back, front]), 'button'); ic = mb.add([bc + [0, -0.0018, 0]], 'button')[0]
    UVb = np.zeros((2, nb + 1, 2)); UVb[:, :, 0] = 0.93 + 0.05 * np.arange(nb + 1) / nb; UVb[0, :, 1] = 0.935; UVb[1, :, 1] = 0.955
    mb.grid(np.stack([ib[:nb], ib[nb:]]), UVb, closed=True, mat=1, centers=np.array([bc, bc]))
    uvr = [(0.955 + 0.022 * math.cos(t), 0.965 + 0.022 * math.sin(t) * 0.8) for t in ang]
    mb.fan(list(ib[nb:]), ic, uvr, (0.955, 0.965), 1, np.array([0, -1.0, 0]))
    return dict(legs=legs, z_crotch=z_crotch, K=K)


# ---------------------------------------------------------------- 毛衣
def build_top(skin, arm, mb, pants):
    bvT = skin.bvh(TORSO_BONES, thr=0.5)
    # 第二版：身片的「箱形」只量軀幹（不含肩膀骨頭：T 字姿勢下肩膀、上臂的面會把身片在肩膀附近推出去，遊戲裡手放下來變成領口兩邊翹起的尖角）
    bvTO = skin.bvh({'J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_C_Neck'} | set(BUST), thr=0.5)
    bvN = skin.bvh({'J_Bip_C_Neck'}, thr=0.4)                         # 領口：只量脖子
    bvTop = skin.bvh(TORSO_BONES | {'J_Bip_L_UpperArm', 'J_Bip_R_UpperArm'}, thr=0.3)   # 肩膀上面：從上往下量（衣服蓋在肩膀與上臂上面）
    def top_z(x, y):
        h = bvTop[0].ray_cast(Vector((x, y, 1.70)), Vector((0, 0, -1)), 0.5)
        return h[0].z if h[0] is not None else -1.0
    neck_c = C.bone_head(arm, 'J_Bip_C_Neck')
    # 軀幹中心線（y）：每個高度前後表面的中點
    def yc_at(z):
        f = Skin.outer(bvT, (0, 0.0, z), (0, -1, 0), 0.35); b = Skin.outer(bvT, (0, 0.0, z), (0, 1, 0), 0.35)
        if not (np.isfinite(f) and np.isfinite(b)): return 0.0
        return (b - f) / 2
    zz = np.arange(min(1.02, KNIT_HEM - 0.02) if HEM_OVER_PANTS else 1.02, 1.42, 0.01); ycs = np.array([yc_at(z) for z in zz])
    ycs = np.convolve(np.pad(ycs, 3, mode='edge'), np.ones(7) / 7, mode='valid')
    def YC(z): return float(np.interp(z, zz, ycs))
    K = 64; th = np.arange(K) * 2 * math.pi / K - math.pi / 2       # 從正前方（-y）開始，往 +x（人物左）轉
    dirs = np.stack([np.cos(th), np.sin(th), np.zeros(K)], -1)
    def rbody(k, z, R0=0.40):
        r = Skin.outer(bvTO, (0, YC(z), z), dirs[k], R0); return r if np.isfinite(r) else 0.0
    def rneck(k, z):
        r = Skin.outer(bvN, (0, YC(z), z), dirs[k], 0.12); return r if np.isfinite(r) else 0.056
    # 胸前／背後最外面（直落的箱形）：每個方向、每個高度往上到 1.30 的最大值
    zgrid = np.arange(min(1.05, KNIT_HEM - 0.01) if HEM_OVER_PANTS else 1.05, 1.42, 0.005)
    # 褲頭帶的半徑（毛衣下擺套在外面）
    pl = pants['legs']
    def pants_r(k, z):
        o = np.array([0, YC(z), z]); d = dirs[k]
        best = 0.0
        for side in ('L', 'R'):
            rows = pl[side]['rows']; zr = rows[:, :, 2].mean(1); j = int(np.argmin(abs(zr - z)))
            if abs(zr[j] - z) > 0.03: continue
            Pp = rows[j]; v = Pp[:, :2] - o[:2]; t = v @ d[:2]; perp = np.abs(v[:, 0] * d[1] - v[:, 1] * d[0])
            m = (t > 0) & (perp < 0.02)
            if m.any(): best = max(best, float(t[m].max()))
        return best
    def band_r(k, z):
        best = pants_r(k, z)
        return best if best > 0.03 else rbody(k, z) + 0.008
    if HEM_OVER_PANTS:      # 褲頭以下：身體或褲子，取外面的（下擺落在臀部、胯部，蓋在褲子外面）
        RB = np.array([[max(rbody(k, z), pants_r(k, z) + 0.004 if z < PANTS_TOP + 0.005 else 0.0) for z in zgrid] for k in range(K)])
    else:
        RB = np.array([[rbody(k, z) for z in zgrid] for k in range(K)])
    RBmax = np.maximum.accumulate(RB[:, ::-1], axis=1)[:, ::-1]           # 高度 ≥ z 的最大
    # 第二版：每個高度的截面＝「這個高度以上身體最突出的輪廓（直落）＋寬鬆量」與落肩寬度的凸包——
    # 布料跨過胸部中間的凹處（第一版貼著胸形，正面看是兩個鼓包），從胸口直直落下
    EASE = np.where(np.abs(np.sin(th)) > 0.5, 0.024, 0.016) * EASE_K
    HR = np.zeros((K, len(zgrid)))
    for iz, z in enumerate(zgrid):
        W = 0.152 + (DROP_X - 0.152) * float(sstep(1.28, 1.34, z))
        Df = RBmax[0, iz] + 0.024; Db = RBmax[K // 2, iz] + 0.022
        pts = [dirs[k][:2] * (RBmax[k, iz] + EASE[k]) for k in range(K)]
        for k in range(K):
            ax_, ay_ = abs(math.cos(th[k])), abs(math.sin(th[k])); D = Df if math.sin(th[k]) < 0 else Db
            pts.append(dirs[k][:2] * (1.0 / ((ax_ / W) ** 2.7 + (ay_ / D) ** 2.7) ** (1 / 2.7)))
        H = hull2(np.array(pts))
        for k in range(K): HR[k, iz] = ray_poly(H, dirs[k][:2])
    def box_r(k, z):
        iz = int(np.clip(np.searchsorted(zgrid, z), 0, len(zgrid) - 1)); return float(HR[k, iz])
    # 領口曲線（每個方向一個點：r、z）
    def neck_pt(k):
        t = th[k]; s = math.sin(t)
        if s >= -0.05:      # 後半圈＋側面：圓領口
            z = BACK_NECK_Z + (SIDE_NECK[1] - BACK_NECK_Z) * abs(math.cos(t)) ** 1.5
            return rneck(k, z) + 0.013, z
        if NECK_STYLE == 'crew':        # 前面：圓領（前中心最低，往側頸點圓弧上升）
            z = CREW_FRONT_Z + (SIDE_NECK[1] - CREW_FRONT_Z) * abs(math.cos(t)) ** 1.8
            return max(rneck(k, z), rbody(k, z)) + 0.012, z
        # 前面：V 領，側頸點到 V 底的直線（3D），找方向 t 的點
        yb = YC(V_BOTTOM) - (rbody(0, V_BOTTOM) + 0.024)
        if abs(math.cos(t)) < 1e-6: return YC(V_BOTTOM) - yb, V_BOTTOM
        Sx = SIDE_NECK[0] * np.sign(math.cos(t)) if abs(math.cos(t)) > 1e-6 else 0.0
        S = np.array([Sx, YC(SIDE_NECK[1]) - 0.005, SIDE_NECK[1]]); B = np.array([0.0, yb, V_BOTTOM])
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2; P = S + (B - S) * mid; ang = math.atan2(P[1] - YC(P[2]), P[0])
            # 從側頸點（角度接近 0 或 π）往 V 底（-π/2）移動
            if abs(math.atan2(math.sin(ang - t), math.cos(ang - t))) < 1e-5: break
            if (abs(math.atan2(math.sin(ang + math.pi / 2), math.cos(ang + math.pi / 2))) > abs(math.atan2(math.sin(t + math.pi / 2), math.cos(t + math.pi / 2)))): lo = mid
            else: hi = mid
        P = S + (B - S) * mid; r = math.hypot(P[0], P[1] - YC(P[2]))
        return max(r, rbody(k, P[2]) + 0.012), P[2]
    NB = 26; NBAND = 4; NNECK = 3
    rows = []
    hem_rows = np.linspace(KNIT_HEM, KNIT_HEM_TOP, NBAND + 1)
    cols = []
    for k in range(K):
        rn, zn = neck_pt(k)
        c = abs(math.cos(th[k]))
        zbt = min(zn, 1.30 + (SHOULDER_Z - 1.30) * c ** 2)
        dense = []
        for z in np.arange(KNIT_HEM_TOP, zbt, 0.002):
            rb = box_r(k, z); rh = max(band_r(k, KNIT_HEM_TOP) + 0.014, box_r(k, KNIT_HEM_TOP + 0.08) - 0.016)   # 第二版：下擺只比身片小一點（第一版緊箍）
            w = float(sstep(KNIT_HEM_TOP, KNIT_HEM_TOP + 0.075, z))
            r = rh + (rb - rh) * (1 - (1 - w) ** 2)
            dense.append((r, z))
        if zn > zbt + 1e-4:
            r0 = box_r(k, zbt) if dense else rn
            for t in np.linspace(0, 1, 60)[1:]:
                r = r0 + (rn - r0) * t; z = zbt + (zn - zbt) * (1 - (1 - t) ** 1.6)
                # 肩膀上面：從上往下量身體（肩膀、上臂的上緣），衣服比它高 1 cm（第一版從側面往內量，打到 T 字姿勢的手臂）
                zt_ = top_z(dirs[k][0] * r, YC(z) + dirs[k][1] * r)
                if t < 0.97: z = max(z, zt_ + 0.010)
                dense.append((r, z))
        else:
            dense.append((rn, zn))
        dense = np.array(dense)
        # 領邊羅紋：最後 2.2 cm
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(dense, axis=0), axis=1))]); L = s[-1]
        sb = np.linspace(0, L - 0.022, NB); sn = np.linspace(L - 0.022, L, NNECK + 1)[1:]
        body_rz = np.stack([np.interp(sb, s, dense[:, 0]), np.interp(sb, s, dense[:, 1])], -1)
        neck_rz = np.stack([np.interp(sn, s, dense[:, 0]) + 0.003, np.interp(sn, s, dense[:, 1])], -1)
        fold = neck_rz[-1] + np.array([-0.006, -0.004])
        band_rz = []
        for i, z in enumerate(hem_rows):
            r = max(band_r(k, z) + 0.011, box_r(k, KNIT_HEM_TOP + 0.08) - 0.020) + 0.003 * (i / NBAND) + 0.002 * math.sin(math.pi * i / NBAND)
            band_rz.append((r, z))
        band_rz = np.array(band_rz); hem_fold = band_rz[0] + np.array([-0.005, 0.004])
        col = np.concatenate([[hem_fold], band_rz, body_rz[1:], neck_rz, [fold]])
        vs = np.concatenate([[0.755], 0.76 + (hem_rows - KNIT_HEM) * 2.0, 0.02 + sb[1:] * 1.4, 0.90 + (sn - (L - 0.022)) * 3.0, [0.975]])
        cols.append((col, vs))
    R = len(cols[0][0])
    P = np.zeros((R, K, 3)); UV = np.zeros((R, K + 1, 2)); cens = []
    for k in range(K):
        col, vs = cols[k]
        for r in range(R):
            rr, z = col[r]; P[r, k] = [dirs[k][0] * rr, YC(z) + dirs[k][1] * rr, z]
            UV[r, k] = (k / K, vs[r])
    UV[:, K] = UV[:, 0]; UV[:, K, 0] = 1.0
    cens = np.array([[0, YC(P[r, :, 2].mean()), P[r, :, 2].mean()] for r in range(R)])
    I = np.stack([mb.add(P[r], 'torso') for r in range(R)])
    mb.grid(I, UV, closed=True, mat=0, centers=cens)
    # ---- 袖子（沿手臂軸的環，從身片裡面開始；落肩）----
    sleeves = {}
    for side, sg in (('L', 1.0), ('R', -1.0)):
        S = C.bone_head(arm, 'J_Bip_%s_UpperArm' % side); E = C.bone_head(arm, 'J_Bip_%s_LowerArm' % side); Wr = C.bone_head(arm, 'J_Bip_%s_Hand' % side)
        bvA = skin.bvh(['J_Bip_%s_UpperArm' % side, 'J_Bip_%s_LowerArm' % side, 'J_Bip_%s_Hand' % side], thr=0.5)
        Lu = np.linalg.norm(E - S); Lf = np.linalg.norm(Wr - E); Lt = Lu + Lf
        def axis_pt(s):
            if s <= Lu: return S + (E - S) * (s / Lu), unit(E - S)
            return E + (Wr - E) * ((s - Lu) / Lf), unit(Wr - E)
        s_end = Lt - 0.008
        st_body = list(np.linspace(-0.010, Lt - 0.075, 20))
        st_cuff = list(np.linspace(Lt - 0.062, s_end, 5))
        KS = 24; ph = np.arange(KS) * 2 * math.pi / KS
        prof_s = np.array([-0.01, 0.03, 0.08, 0.14, Lu, Lu + 0.08, Lt - 0.10, Lt - 0.075])
        prof_r = np.array([0.058, 0.060, 0.066, 0.069, 0.071, 0.072, 0.068, 0.056]) * SLEEVE_K   # 第二版：袖子細一點（第一版正面看像氣球）
        rings = []; cens_s = []; vv = []
        for i, s in enumerate(st_body + st_cuff + ['fold']):
            cuff = (s == 'fold') or (s >= Lt - 0.0621)
            ss = s_end - 0.004 if s == 'fold' else s
            c0, ax = axis_pt(ss)
            up = unit(np.array([0, 0, 1.0]) - ax * ax[2]); fr = np.cross(up, ax)
            ring = []
            for j, p in enumerate(ph):
                d = math.cos(p) * up + math.sin(p) * fr
                ra = Skin.outer(bvA, c0, d, 0.15)
                if not np.isfinite(ra): ra = 0.03
                if cuff:
                    r = ra + 0.0085 + (0.002 if s != 'fold' else -0.003)
                else:
                    r = float(np.interp(ss, prof_s, prof_r))
                    # 下臂的布料皺褶（袖口上方堆起來）
                    bunch = float(sstep(Lu, Lt - 0.09, ss))
                    r *= 1 + 0.045 * bunch * math.sin(3 * p + ss * 55 * sg)
                    r = max(r, ra + 0.014)
                ring.append(c0 + d * r)
            rings.append(ring); cens_s.append(c0)
            vv.append(0.975 if s == 'fold' else (0.78 + (ss - (Lt - 0.062)) * 2.6 if cuff else 0.02 + (ss + 0.01) * 1.4))
        rings = np.array(rings); Rr = len(rings)
        Is = np.stack([mb.add(rg, 'sleeve' + side) for rg in rings])
        UVs = np.zeros((Rr, KS + 1, 2)); UVs[:, :, 0] = (np.arange(KS + 1) / KS * 0.5)[None, :]; UVs[:, :, 1] = np.array(vv)[:, None]
        # 袖子的開口（袖口）朝外：環的中心沿軸
        mb.grid(Is, UVs, closed=True, mat=0, centers=np.array(cens_s))
        sleeves[side] = dict(I=Is, S=S, E=E, W=Wr, Lu=Lu, Lt=Lt, st=np.array([x if not isinstance(x, str) else s_end - 0.004 for x in st_body + st_cuff + ['fold']]))
    return dict(I=I, K=K, sleeves=sleeves)


# ---------------------------------------------------------------- 鞋
def build_shoes(skin, arm, mb):
    out = {}
    for side, sg in (('L', 1.0), ('R', -1.0)):
        w = skin.wsum({'J_Bip_%s_Foot' % side, 'J_Bip_%s_ToeBase' % side, 'J_Bip_%s_ToeBase_end' % side})
        Pf = skin.P[(w > 0.5) & (skin.P[:, 2] < 0.16)]
        y_heel = Pf[:, 1].max() + 0.007; y_toe = Pf[:, 1].min() - 0.012
        y_ball = C.bone_head(arm, 'J_Bip_%s_ToeBase' % side)[1]
        y_vamp = y_ball + (0.040 if SHOE_STYLE == 'loafer' else 0.072)
        NS = 18
        tt = np.linspace(0, 1, NS); ys = y_heel + (y_toe - y_heel) * (0.5 - 0.5 * np.cos(math.pi * tt))  # 兩端密
        rings = []; cen = []; vv = []
        for y in ys:
            sel = Pf[np.abs(Pf[:, 1] - y) < 0.012]
            if len(sel) < 6: sel = Pf[np.argsort(np.abs(Pf[:, 1] - y))[:12]]
            xmn, xmx = sel[:, 0].min(), sel[:, 0].max(); xc = (xmn + xmx) / 2; a = (xmx - xmn) / 2 + 0.006
            ztop = sel[:, 2].max() + 0.006
            # 兩端收圓
            ft = (y_toe + 0.032 - y) / 0.032 if y < y_toe + 0.032 else 0.0
            fh = (y - (y_heel - 0.022)) / 0.022 if y > y_heel - 0.022 else 0.0
            f = max(ft, fh); sh = math.sqrt(max(0.0, 1 - min(f, 0.985) ** 2))
            a = a * (0.35 + 0.65 * sh)
            heel = float(sstep(y_heel - 0.075, y_heel - 0.060, y))       # 鞋跟塊
            arch = float(sstep(y_ball + 0.020, y_ball + 0.040, y)) * (1 - heel)
            z_bot = 0.0 + 0.007 * arch
            z_welt = 0.015 + 0.015 * heel
            if SHOE_STYLE == 'sneaker': z_bot = 0.0; z_welt = 0.027 + 0.004 * float(sstep(y_ball + 0.03, y_heel - 0.02, y))   # 球鞋：平的厚鞋底
            opening = y > y_vamp + 1e-4
            if opening: ztop = (0.072 if SHOE_STYLE == 'loafer' else 0.080) + 0.010 * float(sstep(y_heel - 0.04, y_heel, y))
            if ft > 0: ztop = z_welt + (ztop - z_welt) * (0.45 + 0.55 * math.sqrt(max(0, 1 - min(ft, 0.99) ** 2)))
            hh = ztop - z_welt
            def side_w(zq):
                m = np.abs(sel[:, 2] - zq) < 0.012
                return (np.abs(sel[m, 0] - xc).max() + 0.0045) if m.any() else a
            pr = []   # 右半（+x 側，局部），之後鏡射
            pr.append((0.0, z_bot))
            pr.append((0.6 * a, z_bot))
            pr.append((a + 0.002, z_bot + 0.002))
            pr.append((a + 0.003, z_welt))
            pr.append((a, z_welt + 0.0025))
            for fz, fw in ((0.25, 0.99), (0.55, 0.93), (0.82, 0.78)):
                zq = z_welt + fz * hh; pr.append((max(fw * a, min(a * 1.08, side_w(zq))), zq))
            pr.append((0.42 * a, z_welt + 0.97 * hh))
            top = (0.0, ztop)
            ring = [pr[0]] + pr[1:] + [top] + [(-x, z) for (x, z) in pr[1:][::-1]]
            # ring: 0 底中、1..9 右側、10 頂、11..19 左側
            ring3 = [np.array([xc + x, y, z]) for (x, z) in ring]
            rings.append(ring3); cen.append(np.array([xc, y, (z_bot + ztop) / 2])); vv.append(None)
        rings = np.array(rings); KS = rings.shape[1]
        I = np.stack([mb.add(rg, 'shoe' + side) for rg in rings])
        U = np.arange(KS + 1) / KS * 0.86; Vv = np.linspace(0.02, 0.84, NS)
        UV = np.zeros((NS, KS + 1, 2)); UV[:, :, 0] = U[None, :]; UV[:, :, 1] = Vv[:, None]
        open_rows = [i for i in range(NS) if ys[i] > y_vamp + 1e-4]
        def skip(r, k):     # 腳背開口：鞋跟到鞋舌之間，頂部的面拿掉
            return (r in open_rows and r + 1 in open_rows and 7 <= k <= 10)
        mb.grid(I, UV, closed=True, mat=2, centers=np.array(cen), skip=skip)
        # 兩端封口
        for end, sgn in ((0, 1.0), (NS - 1, -1.0)):
            cc = rings[end].mean(0); ic = mb.add([cc], 'shoe' + side)[0]
            mb.fan(list(I[end]), ic, [tuple(UV[end, k]) for k in range(KS)], (0.43, Vv[end]), 2, np.array([0, sgn, 0]))
        if SHOE_STYLE != 'loafer':
            out[side] = dict(y_ball=y_ball, I=I); continue
        # 馬銜扣：鞋舌前面橫跨鞋面的一條金色細桿＋兩個環
        iv = int(np.argmin(np.abs(ys - (y_vamp - 0.012))))
        rg = rings[iv]; pts = [rg[k] for k in (7, 8, 9, 10, 11)]
        cpts, _ = resample(np.array(pts), 11)
        cen_v = cen[iv]
        tube = []
        for q in cpts:
            nrm = unit(q - cen_v); tube.append(q + nrm * 0.0035)
        tube = np.array(tube); NT = 6; rt = 0.0019
        trings = []
        for i in range(len(tube)):
            tg = unit(tube[min(i + 1, len(tube) - 1)] - tube[max(i - 1, 0)]); n1 = unit(np.cross(tg, [0, 1.0, 0])); n2 = np.cross(tg, n1)
            trings.append([tube[i] + rt * (math.cos(a_) * n1 + math.sin(a_) * n2) for a_ in np.arange(NT) * 2 * math.pi / NT])
        trings = np.array(trings)
        It = np.stack([mb.add(t, 'bit' + side) for t in trings])
        UVt = np.zeros((len(trings), NT + 1, 2)); UVt[:, :, 0] = 0.93 + 0.05 * np.arange(NT + 1)[None, :] / NT; UVt[:, :, 1] = np.linspace(0.90, 0.98, len(trings))[:, None]
        mb.grid(It, UVt, closed=True, mat=2, centers=tube)
        for e in (0, len(tube) - 1):     # 兩端的環
            q = tube[e]; nrm = unit(q - cen_v); tg = unit(tube[1] - tube[0]); bvec = unit(np.cross(nrm, tg))
            Rm, rm = 0.0055, 0.0015; NU, NV = 8, 4
            tor = []
            for jv in range(NV):
                pv = 2 * math.pi * jv / NV; ring = []
                for iu in range(NU):
                    pu = 2 * math.pi * iu / NU; rd = math.cos(pu) * tg + math.sin(pu) * bvec
                    ring.append(q + rd * Rm + (math.cos(pv) * rd + math.sin(pv) * nrm) * rm)
                tor.append(ring)
            tor = np.array(tor); Ito = np.stack([mb.add(t, 'bit' + side) for t in tor])
            Ito = np.concatenate([Ito, Ito[:1]])
            UVo = np.zeros((NV + 1, NU + 1, 2)); UVo[:, :, 0] = 0.93 + 0.05 * np.arange(NU + 1)[None, :] / NU; UVo[:, :, 1] = 0.90 + 0.08 * np.arange(NV + 1)[:, None] / NV
            ctr = np.array([q + math.cos(2 * math.pi * jv / NV) * 0 for jv in range(NV + 1)])
            # 圓環的朝外：管子截面中心
            cc_list = np.array([q + (math.cos(2 * math.pi * iu / NU) * tg + math.sin(2 * math.pi * iu / NU) * bvec) * Rm for iu in range(NU)])
            n0 = len(mb.F)
            mb.grid(Ito, UVo, closed=True, mat=2, centers=None)
            # 手動檢查朝外
            V = np.array(mb.V); flip = 0
            for fi in range(n0, len(mb.F)):
                a_, b_, c_, d_ = V[list(mb.F[fi])]; nn = np.cross(b_ - a_, d_ - a_); m_ = (a_ + b_ + c_ + d_) / 4
                cc = cc_list[int(np.argmin(np.linalg.norm(cc_list - m_, axis=1)))]
                flip += np.sign(nn @ (m_ - cc))
            if flip < 0:
                for fi in range(n0, len(mb.F)): mb.F[fi] = mb.F[fi][::-1]; mb.FUV[fi] = mb.FUV[fi][::-1]
        out[side] = dict(y_ball=y_ball, I=I)
    return out


# ---------------------------------------------------------------- 貼圖
def _noise(rng, h, w, scale):
    n = rng.random((h // scale + 2, w // scale + 2))
    ys = np.linspace(0, n.shape[0] - 1.001, h); xs = np.linspace(0, n.shape[1] - 1.001, w)
    y0 = ys.astype(int); x0 = xs.astype(int); fy = (ys - y0)[:, None]; fx = (xs - x0)[None, :]
    a = n[y0][:, x0]; b = n[y0][:, x0 + 1]; c = n[y0 + 1][:, x0]; d = n[y0 + 1][:, x0 + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy


def knit_texture(S=1024, seed=7):
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S          # 第 0 列是圖片最上面＝v 1
    u = (np.arange(S) + 0.5)[None, :] / S
    # 身片：直向粗羅紋（一圈 100 條）＋針目（V 形）
    pu = (u * 100) % 1.0; pv = v / 0.0072
    rib = np.cos(math.pi * (pu - 0.5)) ** 0.8                  # 每條羅紋中間亮、兩邊暗（柔和）
    chev = 0.5 + 0.5 * np.cos(2 * math.pi * (pv + np.abs(pu - 0.5) * 1.1))
    body = 0.83 + 0.13 * rib + 0.045 * chev * rib
    # 羅紋邊（v 0.75 以上）：細密的羅紋（一圈 200 條）
    pu2 = (u * 200) % 1.0
    rib2 = np.abs(np.cos(math.pi * (pu2 - 0.5))) ** 1.2
    band = 0.80 + 0.19 * rib2 + 0.02 * np.cos(2 * math.pi * v / 0.005)
    m = (v > 0.75).astype(float)
    lum = body * (1 - m) + band * m
    fuzz = _noise(rng, S, S, 3) * 0.05 + _noise(rng, S, S, 40) * 0.04 - 0.045
    lum = lum + fuzz
    rgb = KNIT_RGB[None, None, :] * lum[:, :, None]
    rgb = np.clip(rgb * 1.02, 0, 1)
    return np.concatenate([rgb, np.ones((S, S, 1))], -1)


def trouser_texture(S=512, seed=11):
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S; u = (np.arange(S) + 0.5)[None, :] / S
    lum = 1.0 + (_noise(rng, S, S, 2) - 0.5) * 0.07 + (_noise(rng, S, S, 24) - 0.5) * 0.06
    lum += 0.015 * np.cos(2 * math.pi * (u * S / 3 + v * S / 3))           # 斜紋
    z = v * 1.12
    # 燙痕（前 k=24、後 k=8）：亮線；褶（k=26）：暗線
    for kc, amp, zmax in ((24, 0.10, 0.97), (8, 0.07, 0.97)):
        lum += amp * np.exp(-((u - kc / 32) / 0.0045) ** 2) * (z < zmax)
    lum -= 0.10 * np.exp(-((u - 26 / 32) / 0.004) ** 2) * ((z > 0.88) & (z < PANTS_BAND))
    # 褲頭帶：上下縫線、皮帶環（暗色細條）
    band = (z > PANTS_BAND - 0.004) & (z < PANTS_TOP + 0.01)
    lum = np.where(band, lum * 0.97, lum)
    for zz in (PANTS_BAND + 0.004, PANTS_TOP - 0.004):
        lum -= 0.07 * np.exp(-((z - zz) / 0.0016) ** 2) * (z < 1.1)
    for kc in (4.0, 12.0, 28.5):
        lum -= 0.12 * (np.abs(u - kc / 32) < 0.006) * band
        lum += 0.05 * (np.abs(u - kc / 32 - 0.008) < 0.002) * band
    rgb = TROUSER_RGB[None, None, :] * lum[:, :, None]
    # 鈕扣（右上角）
    bu, bv_ = 0.955, 0.955; d = np.sqrt((u - bu) ** 2 + (v - bv_) ** 2)
    btn = (u > 0.92) & (v > 0.92)
    col = np.array([0.30, 0.27, 0.25])[None, None, :] * ((1.0 - 0.35 * (d > 0.018)) * (1 + 0.25 * (d < 0.008)))[:, :, None]
    rgb = np.where(btn[:, :, None], col, rgb)
    return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)


def loafer_texture(S=256, seed=5):
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S; u = (np.arange(S) + 0.5)[None, :] / S
    k = u / 0.86 * 18                                   # 環上的點（0..18；0 底中、3／15 鞋底邊、9 頂）
    rgb = LEATHER_RGB[None, None, :] * (1 + (_noise(rng, S, S, 6) - 0.5) * 0.08)[:, :, None]
    sole = (k < 3.0) | (k > 15.0)
    rgb = np.where(sole[:, :, None], SOLE_RGB[None, None, :] * np.ones_like(rgb), rgb)
    welt = (np.abs(k - 3.0) < 0.16) | (np.abs(k - 15.0) < 0.16)
    rgb = np.where(welt[:, :, None], (LEATHER_RGB * 0.6)[None, None, :] * np.ones_like(rgb), rgb)
    # 亮皮的高光（鞋頭上方）：環頂附近、鞋頭那一段
    gl = np.exp(-((k - 9) / 1.5) ** 2) * np.exp(-((v - 0.70) / 0.10) ** 2) * 0.55
    gl += np.exp(-((k - 6.4) / 0.6) ** 2) * np.exp(-((v - 0.66) / 0.14) ** 2) * 0.25 + np.exp(-((k - 11.6) / 0.6) ** 2) * np.exp(-((v - 0.66) / 0.14) ** 2) * 0.25
    rgb = rgb + gl[:, :, None] * np.array([0.42, 0.33, 0.28])[None, None, :]
    # 鞋面縫線（moc toe）＋橫帶
    stitch = ((np.abs(k - 6.8) < 0.10) | (np.abs(k - 11.2) < 0.10)) & (v > 0.50) & (v < 0.84) & ((np.floor(v * 160) % 2) == 0)
    rgb = np.where(stitch[:, :, None], (LEATHER_RGB * 1.6)[None, None, :] * np.ones_like(rgb), rgb)
    if SHOE_STYLE == 'sneaker':     # 球鞋：白色鞋面、鞋底一條灰線、鞋舌上的鞋帶（淺灰橫條）、腳跟一塊淺灰
        rgb = np.where(sole[:, :, None], SOLE_RGB[None, None, :] * (1 - 0.18 * (np.abs(k - 1.5) < 0.25) - 0.18 * (np.abs(k - 16.5) < 0.25))[:, :, None], LEATHER_RGB[None, None, :] * (1 + (_noise(rng, S, S, 6) - 0.5) * 0.05)[:, :, None])
        lace = (np.abs(k - 9) < 1.6) & (v > 0.48) & (v < 0.66) & ((np.floor(v * 90) % 3) == 0)
        rgb = np.where(lace[:, :, None], np.array([0.78, 0.78, 0.76])[None, None, :] * np.ones_like(rgb), rgb)
        heelp = (v < 0.12) & (k > 4) & (k < 14)
        rgb = np.where(heelp[:, :, None], (LEATHER_RGB * 0.88)[None, None, :] * np.ones_like(rgb), rgb)
        return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)
    # 金色（右上角）
    gold = (u > 0.92) & (v > 0.88)
    gcol = GOLD_RGB[None, None, :] * (0.85 + 0.35 * np.cos((u - 0.95) * 60) ** 2)[:, :, None]
    rgb = np.where(gold[:, :, None], gcol, rgb)
    return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)


def make_mat(template, name, img, shade):
    mat = C.mtoon_from(template, name, base_img=img, alpha='OPAQUE', double_sided=True)
    e1 = mat.vrm_addon_extension.mtoon1
    try: e1.pbr_metallic_roughness.base_color_factor = (1.0, 1.0, 1.0, 1.0)
    except Exception as ex: print('  base factor', ex)
    mt = e1.extensions.vrmc_materials_mtoon
    try: mt.shade_color_factor = shade
    except Exception as ex: print('  shade factor', ex)
    for attr in ('emissive_texture', 'normal_texture'):
        try: getattr(e1, attr).index.source = None
        except Exception as ex: print('  clear', attr, ex)
    for attr in ('shading_shift_texture', 'rim_multiply_texture', 'matcap_texture', 'outline_width_multiply_texture', 'uv_animation_mask_texture'):
        try: getattr(mt, attr).index.source = None
        except Exception: pass
    try: e1.emissive_factor = (0.0, 0.0, 0.0)
    except Exception: pass
    return mat


# ---------------------------------------------------------------- 權重
def compute_weights(skin, arm, mb, top, pants, shoes):
    V = np.array(mb.V); tags = np.array(mb.tag); n = len(V)
    W = np.zeros((n, len(skin.names)))
    bust = [skin.col(b) for b in BUST if skin.col(b) is not None]
    src = Skin(WSRC) if WSRC is not None else None
    col = {n: j for j, n in enumerate(skin.names)}
    def near_w(Q):
        Wn = skin.nearest_weights(Q)
        if src is None: return Wn
        Ws = src.nearest_weights(Q); out = np.zeros_like(Wn)
        for j, n in enumerate(src.names):
            if n in col: out[:, col[n]] += Ws[:, j]
        bad = out.sum(1) < 0.5                       # 來源在已經拿掉的骨頭上：退回身體最近點
        out[bad] = Wn[bad]
        return out
    # 軀幹：最近點內插（胸部的彈簧骨不要）
    m = tags == 'torso'
    Wt = near_w(V[m]); Wt[:, bust] = 0; W[m] = Wt
    if os.environ.get('WDEBUG'):
        Vt = V[m]; ua = [col[n] for n in ('J_Bip_L_UpperArm', 'J_Bip_R_UpperArm', 'J_Bip_L_Shoulder', 'J_Bip_R_Shoulder') if n in col]
        sel = (np.abs(Vt[:, 0]) > DROP_X - 0.04) & (Vt[:, 2] > SHOULDER_Z - 0.06)
        Wb = skin.nearest_weights(Vt[sel])
        print('   WDEBUG torso shoulder verts', int(sel.sum()), 'src', src is not None,
              'upperarm w (src/body): %.2f / %.2f' % (Wt[sel][:, ua[:2]].sum(1).mean(), Wb[:, ua[:2]].sum(1).mean()),
              'shoulder w: %.2f / %.2f' % (Wt[sel][:, ua[2:]].sum(1).mean(), Wb[:, ua[2:]].sum(1).mean()))
    # 袖子：肩膀附近用最近點、其他沿手臂軸
    for side, sl in top['sleeves'].items():
        m = tags == 'sleeve' + side; Q = V[m]
        S, E, Wr, Lu, Lt = sl['S'], sl['E'], sl['W'], sl['Lu'], sl['Lt']
        ax = unit(Wr - S); s = (Q - S) @ ax
        near = near_w(Q); near[:, bust] = 0
        u_ = 1 - sstep(Lu - 0.045, Lu + 0.045, s)
        Wa = axis_weights(skin, len(Q), [('J_Bip_%s_UpperArm' % side, u_), ('J_Bip_%s_LowerArm' % side, 1 - u_)])
        a = sstep(0.035, 0.13, s)[:, None]
        W[m] = (1 - a) * near + a * Wa
    # 褲子：臀部以上最近點（只拿自己這一側的腿），胯下以下沿腿軸
    zc = pants['z_crotch']
    for side, other in (('L', 'R'), ('R', 'L')):
        m = tags == 'pants' + side; Q = V[m]
        bv = skin.bvh(['J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_%s_UpperLeg' % side, 'J_Bip_%s_LowerLeg' % side], thr=0.5)
        near = skin.nearest_weights(Q, bv)
        for j, nm in enumerate(skin.names):
            if ('_%s_' % other) in nm or 'Arm' in nm or 'Hand' in nm or 'Shoulder' in nm: near[:, j] = 0
        near[:, bust] = 0
        K_ = C.bone_head(arm, 'J_Bip_%s_LowerLeg' % side)[2]
        u_ = sstep(K_ - 0.06, K_ + 0.06, Q[:, 2])          # 膝蓋以上＝大腿、以下＝小腿（第一版寫反：褲腳綁在大腿上，膝蓋一彎褲腳就不跟著腳，腳從褲管旁邊穿出來）
        hip = sstep(zc - 0.02, zc + 0.10, Q[:, 2]) * 0.0
        Wa = axis_weights(skin, len(Q), [('J_Bip_%s_UpperLeg' % side, u_), ('J_Bip_%s_LowerLeg' % side, 1 - u_)])
        a = sstep(zc + 0.02, zc - 0.16, Q[:, 2])[:, None]
        W[m] = (1 - a) * near + a * Wa
    m = tags == 'button'
    if m.any():
        Wb = skin.nearest_weights(V[m]); Wb[:, bust] = 0; W[m] = Wb
    # 鞋：腳／腳尖（前掌彎折處漸變）
    for side in ('L', 'R'):
        m = np.isin(tags, ['shoe' + side, 'bit' + side]); Q = V[m]; yb = shoes[side]['y_ball']
        t = sstep(yb + 0.012, yb - 0.018, Q[:, 1])
        W[m] = axis_weights(skin, len(Q), [('J_Bip_%s_Foot' % side, 1 - t), ('J_Bip_%s_ToeBase' % side, t)])
    return limit_norm(W, 4)


# ---------------------------------------------------------------- 刪掉被蓋住的皮膚
def cull_skin(body, clothes_obj):
    """被衣服蓋住、從外面任何方向都看不到的皮膚面刪掉。
    身體物件有 180° 旋轉、衣服網格是世界座標：身體頂點與法線先轉成世界座標
    （第一版直接用身體的區域座標比，前後顛倒：V 領裡面的胸口被刪成一個洞、小腿後面沒刪而穿出褲子）"""
    me = clothes_obj.data; P = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3)
    Mc = np.array(clothes_obj.matrix_world); P = P @ Mc[:3, :3].T + Mc[:3, 3]
    F = [list(p.vertices) for p in me.polygons]
    bv = BVHTree.FromPolygons(P.tolist(), F)
    bme = body.data; M = np.array(body.matrix_world)
    Pb = C.co(body) @ M[:3, :3].T + M[:3, 3]
    Nb = np.empty(len(bme.vertices) * 3); bme.vertices.foreach_get('normal', Nb); Nb = Nb.reshape(-1, 3) @ M[:3, :3].T
    Nb /= np.linalg.norm(Nb, axis=1, keepdims=True) + 1e-12
    VIEW = [unit(v) for v in ((0, -1, 0), (0, 1, 0), (1, 0, 0), (-1, 0, 0), (0, 0, 1), (0, -1, 0.7), (0, 1, 0.7), (1, 0, 0.7), (-1, 0, 0.7),
                              (0.7, -0.7, 0), (-0.7, -0.7, 0), (0.7, 0.7, 0), (-0.7, 0.7, 0), (0, -1, -0.6), (0, 1, -0.6), (1, 0, -0.6), (-1, 0, -0.6))]
    cov = np.zeros(len(Pb), bool)
    for i in range(len(Pb)):
        p = Pb[i]; n = Nb[i]
        if p[2] > 1.45: continue
        h1 = bv.ray_cast(Vector(p + n * 0.001), Vector(n), 0.20)
        if h1[0] is None: continue
        if np.dot(np.array(h1[1]), n) <= 0.05: continue          # 打到衣服外側（例如脖子往下看到肩膀）不算蓋住
        vis = False
        for d in VIEW:
            if np.dot(d, n) < 0.2: continue
            if bv.ray_cast(Vector(p + d * 0.8), Vector(-d), 0.8 - 0.0015)[0] is None: vis = True; break
        cov[i] = not vis
    pm = np.array([all(cov[v] for v in p.vertices) for p in bme.polygons])
    return C.delete_faces(body, pm)


# ---------------------------------------------------------------- 身形
def slim_body(body):
    """VRoid 樣本的胸部、臀部、胯部是動畫比例（偏大），穿上寬鬆毛衣、寬褲後，側面看胸前與臀部鼓得太誇張；
    參考圖是纖瘦的成年女性。衣服蓋住的這幾個部位略收（所有 shape key 一起；臉、手、腳不動）"""
    M = np.array(body.matrix_world); R = M[:3, :3]; t = M[:3, 3]; Ri = np.linalg.inv(R)
    B = C.co(body) @ R.T + t; mid = B[np.abs(B[:, 0]) < 0.02]
    zb = np.arange(0.70, 1.46, 0.01); yc = []
    for z in zb:
        q = mid[np.abs(mid[:, 2] - z) < 0.01]
        yc.append((q[:, 1].min() + q[:, 1].max()) / 2 if len(q) > 3 else np.nan)
    yc = np.array(yc); ok = np.isfinite(yc); yc = np.interp(zb, zb[ok], yc[ok])
    def fn(P, basis):
        Wd = P @ R.T + t; x, y, z = Wd[:, 0], Wd[:, 1], Wd[:, 2]; c = np.interp(z, zb, yc)
        wb = np.exp(-((z - 0.90) / 0.075) ** 2) * (1 - sstep(0.10, 0.16, np.abs(x))) * sstep(0.0, 0.03, y - c)    # 臀部（後面 +Y）
        wf = np.exp(-((z - 1.255) / 0.055) ** 2) * (1 - sstep(0.12, 0.17, np.abs(x))) * sstep(0.0, 0.03, c - y)   # 胸部（前面 -Y）
        wh = np.exp(-((z - 0.90) / 0.09) ** 2)                                                                     # 胯部左右
        W2 = Wd.copy(); W2[:, 1] = c + (y - c) * (1 - 0.22 * wb - 0.20 * wf); W2[:, 0] = x * (1 - 0.07 * wh)
        return (W2 - t) @ Ri.T
    C.warp(body, fn)


# ---------------------------------------------------------------- 主程式
def apply(m):
    arm, body = m['arm'], m['body']
    if SLIM: slim_body(body)
    skin = Skin(body)
    mb = MB()
    pants = build_pants(skin, arm, mb)
    print('  pants crotch z %.3f' % pants['z_crotch'])
    top = build_top(skin, arm, mb, pants)
    shoes = build_shoes(skin, arm, mb)
    os.makedirs(WIP, exist_ok=True)
    img_k = C.image_from_array('H01_Knit', knit_texture(), os.path.join(WIP, 'clothes_Knit.png'))
    img_t = C.image_from_array('H01_Trouser', trouser_texture(), os.path.join(WIP, 'clothes_Trouser.png'))
    img_l = C.image_from_array('H01_Loafer', loafer_texture(), os.path.join(WIP, 'clothes_Loafer.png'))
    def tmpl(pat):      # 範本材質（女性樣本 F00_002_01_Tops_01_CLOTH、男性樣本 M00_006_01_Tops_01_CLOTH……）
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith('H01_'))
    mats = [make_mat(tmpl('Tops'), 'H01_Knit_CLOTH', img_k, (0.84, 0.78, 0.74)),
            make_mat(tmpl('Tops'), 'H01_Trouser_CLOTH', img_t, (0.74, 0.76, 0.84)),
            make_mat(tmpl('Shoes'), 'H01_Loafer_CLOTH', img_l, (0.62, 0.56, 0.56))]
    W = compute_weights(skin, arm, mb, top, pants, shoes)
    obj, bad = mb.build('Clothes_H01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, weights_dict(skin, W))
    me = obj.data
    tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  clothes: verts %d faces %d (bad %d) tris knit %d trouser %d loafer %d' % (len(me.vertices), len(me.polygons), bad, tris.get(0, 0), tris.get(1, 0), tris.get(2, 0)))
    n = cull_skin(body, obj)
    print('  culled skin faces', n)
    m['clothes'] = obj
    return obj
