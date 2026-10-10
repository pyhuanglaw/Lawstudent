"""沈以安（heroine_01）臉部：立體結構與五官（Blender bpy；heroine_01.py 的 face 階段，提供 apply(m)）。
2026-10-10 使用者要求「用 Blender 真正改善 3D 造型」：VRoid 樣本的臉是大眼娃娃（眼裂高、虹膜佔滿眼裂、細上挑眉、鼻子只有一個尖點、
嘴寬只有兩眼距離的 0.3、下半臉很短），這裡改成參考圖（docs/art-rebuild/references/01_shen_yian_character_sheet.webp）的成年寫實日系臉。

做法（全部在 Blender 裡做，表情跟著變）：
  1. 局部細分（bpy.ops.mesh.subdivide）：鼻子、嘴、下巴附近加頂點（shape key 由 Blender 線性內插，已驗證誤差 < 1e-7 m）。
  2. 空間變形（common.warp：同一個平滑位移場套在 Basis 與全部 41 個表情 shape key，眨眼、嘴型仍然對得上）：
     下半臉加長、眉毛降低、眼睛（眼裂高度、寬度、外眼角上揚）、嘴變寬。
  3. 表面細節（同一個位移加到 Basis 與全部 shape key）：鼻樑、鼻頭、鼻翼、嘴唇厚度、下巴。
  4. 法向量：改過形狀的地方用焊接後的平滑法向量重算（臉和身體的接縫維持原本的法向量）。
  5. 貼圖（numpy）：先把每個材質的 UV 三角形「點陣化」成每個像素在臉上的 3D 位置（休息姿勢），再用臉上的座標畫：
     虹膜（深棕、外圈、瞳孔、小高光）、上眼線＋眼尾、下眼線、細睫毛、自然的眉毛、雙眼皮線、唇形與唇色、鼻孔。

座標：Face 物件的網格座標（物件有 180° 旋轉）：+Y＝臉的前方、|x| 越大越靠外側、Z 朝上。
臉的網格邊界（後腦勺、脖子和身體網格的接縫）全部固定不動（所有變形都乘上 pin 權重）。
vrm_finish.py 之後會把 0.5×Fcl_EYE_Natural＋0.2×Fcl_EYE_Close 烘進基本形（FEMALE_EYES）、眨眼權重 ×0.8；
這裡所有「休息姿勢」的計算都照這個組合。"""
import bpy, bmesh, math
import numpy as np
import common as C

REST = {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2}   # = tools/vroid_build.py 的 FEMALE_EYES（vrm_finish.py 會烘進基本形）

# ---------------- 造型參數（公尺；臉網格座標）----------------
D_CHIN = 0.010           # 下巴往下（下半臉加長：鼻下到下巴 4.1 → 5.1 cm，接近參考圖的三等分）
LOW_ZA = 1.438           # 下半臉加長從這個高度開始（鼻頭下方，不拉長鼻子）
BROW_DROP = 0.0035       # 眉毛降低（參考圖眉眼距離較近）
EYE_SX, EYE_SZ = 0.94, 0.70   # 眼裂寬、高的縮放（眼睛中心）
EYE_TILT = 0.10          # 外眼角上揚（z 位移 / x 距離）
EYE_LIFT = 0.0006        # 眼睛整體上移一點（眼睛在頭的位置偏低是動畫比例）
MOUTH_K = 1.62           # 嘴寬倍數（VRoid 嘴縫只有 2.2 cm）
IRIS_FRAC = 0.52         # 虹膜直徑 / 眼裂寬（參考圖約 0.5）
SUBDIV_L1 = dict(ax=0.056, z0=1.383, z1=1.468, y0=0.045, amin=1.2e-5)   # 下半臉細分一次
SUBDIV_L2 = dict(ax=0.016, z0=1.430, z1=1.476, y0=0.072, amin=2.0e-6)   # 鼻子再細分一次


# ---------------- 小工具 ----------------
def ss(e0, e1, x):
    t = np.clip((np.asarray(x, float) - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def kname(f, frag):
    return next(k.name for k in f.data.shape_keys.key_blocks if k.name.endswith(frag))


def mat_names(f):
    return [mm.name if mm else '' for mm in f.data.materials]


def mat_index(f, pat):
    return next(i for i, n in enumerate(mat_names(f)) if pat in n)


def poly_data(f):
    me = f.data; n = len(me.polygons)
    ls = np.empty(n, np.int64); me.polygons.foreach_get('loop_start', ls)
    lt = np.empty(n, np.int64); me.polygons.foreach_get('loop_total', lt)
    mi = np.empty(n, np.int64); me.polygons.foreach_get('material_index', mi)
    lv = np.empty(len(me.loops), np.int64); me.loops.foreach_get('vertex_index', lv)
    return ls, lt, mi, lv


def tris(f, mat_i=None):
    """扇形三角化：回傳 (頂點 index M×3, loop index M×3)；mat_i 可以是 int 或 set"""
    ls, lt, mi, lv = poly_data(f); TV, TL = [], []
    want = None if mat_i is None else ({mat_i} if isinstance(mat_i, int) else set(mat_i))
    for p in range(len(ls)):
        if want is not None and mi[p] not in want: continue
        L = list(range(ls[p], ls[p] + lt[p]))
        for k in range(1, len(L) - 1):
            TL.append((L[0], L[k], L[k + 1]))
    TL = np.array(TL, np.int64).reshape(-1, 3)
    return lv[TL], TL


def uvs(f):
    me = f.data; a = np.empty(len(me.loops) * 2); me.uv_layers.active.data.foreach_get('uv', a); return a.reshape(-1, 2)


def set_uvs(f, U):
    f.data.uv_layers.active.data.foreach_set('uv', U.reshape(-1).astype(np.float64)); f.data.update()


def rest_pose(f, close=None):
    """vrm_finish 烘進基本形之後的樣子（close＝Fcl_EYE_Close 的總權重；None＝休息 0.2、1.0＝閉眼）"""
    B = C.co(f); R = B.copy()
    for frag, w in REST.items():
        if frag == 'Fcl_EYE_Close' and close is not None: w = close
        R += w * (C.co(f, kname(f, frag)) - B)
    return R


def weld_ids(P, dec=6):
    _, inv = np.unique(np.round(P, dec), axis=0, return_inverse=True); return inv.ravel()


def boundary_loops(f, mat_i):
    """某個材質的開放邊界（焊接重複頂點之後），回傳 [有順序的頂點 index 陣列]"""
    B = C.co(f); wid = weld_ids(B); TV, _ = tris(f, mat_i)
    # 用原始多邊形（不是三角化）的邊找邊界
    ls, lt, mi, lv = poly_data(f); cnt = {}
    for p in np.nonzero(mi == mat_i)[0]:
        vs = [wid[v] for v in lv[ls[p]:ls[p] + lt[p]]]
        for k in range(len(vs)):
            e = (min(vs[k], vs[k - 1]), max(vs[k], vs[k - 1])); cnt[e] = cnt.get(e, 0) + 1
    adj = {}
    for (a, b), c in cnt.items():
        if c == 1: adj.setdefault(a, []).append(b); adj.setdefault(b, []).append(a)
    rep = {}
    for v in range(len(wid)): rep.setdefault(wid[v], v)
    seen, loops = set(), []
    for s in adj:
        if s in seen: continue
        order = [s]; seen.add(s); prev, cur = None, s
        while True:
            nxt = [n for n in adj[cur] if n != prev and n not in seen]
            if not nxt: break
            prev, cur = cur, nxt[0]; seen.add(cur); order.append(cur)
        loops.append(np.array([rep[w] for w in order]))
    return loops


def classify_loops(f):
    skin = mat_index(f, 'Face_00_SKIN'); B = C.co(f); out = {'eye': [], 'mouth': None, 'back': None}
    loops = boundary_loops(f, skin)
    big = max(loops, key=len)
    for L in loops:
        c = B[L].mean(0)
        if L is big: out['back'] = L
        elif abs(c[0]) > 0.015 and 1.44 < c[2] < 1.51: out['eye'].append(L)
        elif abs(c[0]) < 0.006 and c[2] < 1.44: out['mouth'] = L
    return out


def pin_weight(P, pts, r0=0.004, r1=0.022):
    """離臉網格邊界（和身體網格的接縫）越近越不動：邊界上 0、r1 以外 1（空間函數，所有 shape key 一樣）"""
    d = np.full(len(P), 1e9)
    for i in range(0, len(pts), 64):
        q = pts[i:i + 64]; d = np.minimum(d, np.sqrt(((P[:, None, :] - q[None]) ** 2).sum(-1)).min(1))
    return ss(r0, r1, d)


# ---------------- 局部細分 ----------------
def subdivide(f, ax, z0, z1, y0, amin, mat_pat='Face_00_SKIN'):
    skin = mat_index(f, mat_pat); C.activate(f, 'EDIT'); bm = bmesh.from_edit_mesh(f.data); bm.faces.ensure_lookup_table(); n = 0
    for fc in bm.faces: fc.select_set(False)
    for fc in bm.faces:
        c = fc.calc_center_median()
        if fc.material_index == skin and abs(c.x) < ax and z0 < c.z < z1 and c.y > y0 and fc.calc_area() > amin:
            fc.select_set(True); n += 1
    bmesh.update_edit_mesh(f.data)
    if n: bpy.ops.mesh.subdivide(number_cuts=1, smoothness=0)
    bpy.ops.object.mode_set(mode='OBJECT'); return n


# ---------------- 空間變形（P: N×3；所有 shape key 用同一個函數）----------------
def front_gate(y):
    return ss(0.012, 0.038, y)


def warp_lower(P, z_a, z_b, D, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    t = np.clip((z_a - z) / (z_a - z_b), 0, None); a = 0.3
    r = np.where(t < a, t * t / (2 * a), np.minimum(t, 1) - a / 2) / (1 - a / 2)
    w = r * front_gate(y) * (1 - ss(0.05, 0.085, np.abs(x))) * pin
    Q = P.copy(); Q[:, 2] -= D * w; return Q


def warp_brow(P, bx, bz, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    r = np.sqrt(((np.abs(x) - bx) / 0.030) ** 2 + ((z - bz) / 0.013) ** 2)
    w = (1 - ss(0.6, 1.6, r)) * front_gate(y) * pin
    Q = P.copy(); Q[:, 2] -= BROW_DROP * w; return Q


def warp_eyes(P, ex, ez, ru, rv, pin, fall=2.0):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; s = np.sign(x); ax = np.abs(x)
    u = ax - ex; v = z - ez
    r = np.sqrt((u / ru) ** 2 + (v / rv) ** 2); w = (1 - ss(1.0, fall, r)) * front_gate(y) * pin
    ax2 = ex + u * (1 - (1 - EYE_SX) * w)
    z2 = ez + v * (1 - (1 - EYE_SZ) * w) + (EYE_TILT * u + EYE_LIFT) * w
    Q = P.copy(); Q[:, 0] = s * ax2; Q[:, 2] = z2; return Q


def warp_mouth(P, zs, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    w = np.exp(-((z - zs) / 0.009) ** 2) * (1 - ss(0.010, 0.052, np.abs(x))) * front_gate(y) * pin
    Q = P.copy(); Q[:, 0] = x * (1 + (MOUTH_K - 1) * w); return Q


def jacobian_check(fn, box, n=60):
    """變形在 box 內是否處處可逆（det J > 0）：回傳最小 det（只看 x-z 平面）"""
    (x0, x1), (z0, z1), y = box
    X, Z = np.meshgrid(np.linspace(x0, x1, n), np.linspace(z0, z1, n)); h = 1e-5
    P = np.column_stack([X.ravel(), np.full(X.size, y), Z.ravel()])
    def F(Q): R = fn(Q); return R[:, [0, 2]]
    dx = (F(P + [h, 0, 0]) - F(P - [h, 0, 0])) / (2 * h); dz = (F(P + [0, 0, h]) - F(P - [0, 0, h])) / (2 * h)
    return float((dx[:, 0] * dz[:, 1] - dx[:, 1] * dz[:, 0]).min())


# ---------------- 表面細節（同一個位移加到所有 shape key）----------------
def midline_profile(B, skin_v):
    s = skin_v[(np.abs(B[skin_v, 0]) < 0.0015) & (B[skin_v, 1] > 0.05)]
    o = np.argsort(B[s, 2]); return B[s[o], 2], B[s[o], 1]


def nose_offsets(B, skin_v, tip_z):
    """鼻樑（鼻根到鼻頭一直線）、鼻頭、鼻翼、鼻翼溝。回傳 N×3 位移"""
    D = np.zeros_like(B); P = B[skin_v]; x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
    zz, yy = midline_profile(B, skin_v)
    ymid = np.interp(z, zz, yy)
    z_n = tip_z + 0.0285; y_n = np.interp(z_n, zz, yy) + 0.0006          # 鼻根（兩眼之間）
    z_t = tip_z + 0.0012; y_t = np.interp(tip_z, zz, yy) + 0.0016        # 鼻頭最高點
    t = np.clip((z_n - z) / (z_n - z_t), 0, 1)
    y_line = y_n + (y_t - y_n) * t                                      # 直線鼻樑
    along = ss(z_t - 0.0045, z_t + 0.002, z) * (1 - ss(z_n - 0.004, z_n + 0.004, z))
    sig = 0.0042 + 0.0022 * t                                            # 鼻樑寬度：鼻根窄、鼻頭寬
    dy = np.maximum(0, y_line - ymid) * along * np.exp(-(x / sig) ** 2)
    # 鼻頭圓潤
    dy += 0.0007 * np.exp(-((x / 0.0042) ** 2 + ((z - (tip_z + 0.0004)) / 0.0035) ** 2))
    # 鼻翼（左右小鼓起）＋鼻翼溝
    ala_z = tip_z - 0.0040; ala_x = 0.0088
    ra = np.sqrt(((ax - ala_x) / 0.0034) ** 2 + ((z - ala_z) / 0.0030) ** 2)
    dy += 0.0011 * np.exp(-ra ** 2)
    dx = 0.0007 * np.exp(-ra ** 2) * np.sign(x)
    dy -= 0.0005 * np.exp(-((ra - 1.55) / 0.35) ** 2) * (z < ala_z + 0.004)
    gate = front_gate(y)
    D[skin_v, 0] = dx * gate; D[skin_v, 1] = dy * gate
    return D


def lip_offsets(B, skin_v, slit, mw):
    """嘴唇厚度：上唇（唇峰在嘴縫上 1.6 mm）、下唇較飽滿；嘴縫上下兩邊位移相同（不會露出縫）"""
    D = np.zeros_like(B); P = B[skin_v]; x, y, z = P[:, 0], P[:, 1], P[:, 2]
    sx_, sz_ = slit
    zs = np.interp(np.abs(x), sx_, sz_)
    d = z - zs; side = np.clip(1 - (np.abs(x) / (mw * 1.15)) ** 2, 0, 1) ** 0.7
    g = lambda mu, sg: np.exp(-((d - mu) / sg) ** 2)
    dy = (0.0009 * g(0.0017, 0.0017) + 0.0016 * g(-0.0030, 0.0024) - 0.0005 * g(-0.0088, 0.0022)) * side
    D[skin_v, 1] = dy * front_gate(y); return D


def chin_offsets(B, skin_v, chin_z):
    D = np.zeros_like(B); P = B[skin_v]; x, y, z = P[:, 0], P[:, 1], P[:, 2]
    w = np.exp(-((x / 0.017) ** 2 + ((z - (chin_z + 0.007)) / 0.011) ** 2)) * front_gate(y)
    D[skin_v, 1] = 0.0022 * w; D[skin_v, 2] = -0.0008 * w; return D


# ---------------- 法向量 ----------------
def corner_normals(f):
    me = f.data; a = np.empty(len(me.loops) * 3); me.corner_normals.foreach_get('vector', a); return a.reshape(-1, 3)


def vertex_normals_from_corners(f):
    _, _, _, lv = poly_data(f); cn = corner_normals(f); n = np.zeros((len(f.data.vertices), 3))
    np.add.at(n, lv, cn); return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


def smooth_normals(f, mat_set):
    """焊接（同位置的重複頂點視為同一點）後的面積加權平滑法向量；只用 mat_set 材質的面"""
    B = C.co(f); wid = weld_ids(B); TV, _ = tris(f, mat_set)
    a, b, c = B[TV[:, 0]], B[TV[:, 1]], B[TV[:, 2]]; fn = np.cross(b - a, c - a)
    acc = np.zeros((wid.max() + 1, 3))
    for k in range(3): np.add.at(acc, wid[TV[:, k]], fn)
    n = acc[wid]; return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


# ---------------- UV 點陣化（每個像素在臉上的位置）----------------
def raster(f, mat_i, W, H, R, U=None):
    """mat_i 的三角形在 UV 空間點陣化 → pos (H×W×3，第 0 列是圖片最上面)、mask"""
    TV, TL = tris(f, mat_i); U = uvs(f) if U is None else U
    pos = np.zeros((H, W, 3)); mask = np.zeros((H, W), bool)
    for t in range(len(TV)):
        uv = U[TL[t]] * [W, H]; uv[:, 1] = H - uv[:, 1]                  # 像素座標（y 往下）
        x0, y0 = np.floor(uv.min(0) - 0.5).astype(int); x1, y1 = np.ceil(uv.max(0) + 0.5).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W - 1), min(y1, H - 1)
        if x1 < x0 or y1 < y0: continue
        X, Y = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        (ax_, ay), (bx, by), (cx, cy) = uv
        den = (by - cy) * (ax_ - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12: continue
        l1 = ((by - cy) * (X - cx) + (cx - bx) * (Y - cy)) / den
        l2 = ((cy - ay) * (X - cx) + (ax_ - cx) * (Y - cy)) / den
        l3 = 1 - l1 - l2; e = -0.02
        ins = (l1 >= e) & (l2 >= e) & (l3 >= e)
        if not ins.any(): continue
        Pv = R[TV[t]]
        val = l1[..., None] * Pv[0] + l2[..., None] * Pv[1] + l3[..., None] * Pv[2]
        sub = (slice(y0, y1 + 1), slice(x0, x1 + 1))
        pos[sub][ins] = val[ins]; mask[sub][ins] = True
    return pos, mask


def remap_uv(f, mat_i, rects):
    """mat_i 的 UV：依頂點在左／右臉（x<0／x>0）各自縮放到 rects[0]／rects[1]（u0,v0,u1,v1），讓貼圖解析度用滿"""
    U = uvs(f); ls, lt, mi, lv = poly_data(f); B = C.co(f)
    L = np.concatenate([np.arange(ls[p], ls[p] + lt[p]) for p in np.nonzero(mi == mat_i)[0]])
    pc = {}
    for p in np.nonzero(mi == mat_i)[0]:
        pc[p] = B[lv[ls[p]:ls[p] + lt[p]], 0].mean() > 0
    side = np.concatenate([[pc[p]] * lt[p] for p in np.nonzero(mi == mat_i)[0]])
    for k, s in enumerate((False, True)):
        Ls = L[side == s]
        if not len(Ls): continue
        lo, hi = U[Ls].min(0), U[Ls].max(0); u0, v0, u1, v1 = rects[k]
        sc = min((u1 - u0) / (hi[0] - lo[0]), (v1 - v0) / (hi[1] - lo[1]))     # 等比例
        cu, cv = (u0 + u1) / 2, (v0 + v1) / 2; mc = (lo + hi) / 2
        U[Ls] = [cu, cv] + (U[Ls] - mc) * sc
    set_uvs(f, U)


def set_tex(mat, img, white=False, shade=None):
    e = mat.vrm_addon_extension.mtoon1
    e.pbr_metallic_roughness.base_color_texture.index.source = img
    e.extensions.vrmc_materials_mtoon.shade_multiply_texture.index.source = img
    if white: e.pbr_metallic_roughness.base_color_factor = (1, 1, 1, 1)
    if shade is not None: e.extensions.vrmc_materials_mtoon.shade_color_factor = shade


def img_array(img):
    w, h = img.size; a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a); return a.reshape(h, w, 4)[::-1].astype(np.float64)


def blur(a, r):
    """可分離的盒狀模糊做三次（近似高斯）"""
    out = a.copy()
    for _ in range(3):
        for ax_ in (0, 1):
            c = np.cumsum(np.pad(out, [(r + 1, r) if k == ax_ else (0, 0) for k in range(out.ndim)], mode='edge'), axis=ax_)
            out = (np.take(c, np.arange(2 * r + 1, c.shape[ax_]), axis=ax_) - np.take(c, np.arange(0, c.shape[ax_] - 2 * r - 1), axis=ax_)) / (2 * r + 1)
    return out


def mix(a, b, t):
    t = np.asarray(t, float)[..., None]; return a * (1 - t) + np.asarray(b, float) * t


# ---------------- 眼睛形狀（休息姿勢的眼洞邊界）----------------
def eye_arcs(R, loop):
    """眼洞邊界 → (內眼角 ax, 外眼角 ax, 上緣 z(ax) 的取樣, 下緣 z(ax) 的取樣)。ax＝|x|"""
    p = R[loop]; ax = np.abs(p[:, 0]); z = p[:, 2]
    i_in, i_out = np.argmin(ax), np.argmax(ax)
    a_in, a_out = ax[i_in], ax[i_out]; z_in, z_out = z[i_in], z[i_out]
    chord = z_in + (z_out - z_in) * (ax - a_in) / (a_out - a_in)
    up = z >= chord
    def arc(sel):
        a = np.concatenate([[a_in], ax[sel], [a_out]]); zz = np.concatenate([[z_in], z[sel], [z_out]])
        o = np.argsort(a); a, zz = a[o], zz[o]
        g = np.linspace(a_in, a_out, 80); return g, np.interp(g, a, zz)
    g, zu = arc(up); _, zl = arc(~up)
    return dict(a_in=a_in, a_out=a_out, z_in=z_in, z_out=z_out, g=g, up=zu, lo=zl, cx=(a_in + a_out) / 2)


def eye_coords(E, ax, z):
    """像素位置 → t（0 內眼角 1 外眼角）、到上緣的高度 du、到下緣的距離 dl（正＝在下緣下面）"""
    t = (ax - E['a_in']) / (E['a_out'] - E['a_in'])
    zu = np.interp(ax, E['g'], E['up']); zl = np.interp(ax, E['g'], E['lo'])
    return t, z - zu, zl - z


def seg_dist(P, a, b):
    ab = b - a; t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1); return np.linalg.norm(P - (a + t[..., None] * ab), axis=-1), t


# ---------------- 主程式 ----------------
def apply(m):
    f = m['face']; me = f.data
    skin = mat_index(f, 'Face_00_SKIN')
    print('  face: verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
    # 原本的法向量（之後只在臉和身體的接縫附近沿用）
    n_orig = vertex_normals_from_corners(f); nv_orig = len(me.vertices); B_orig = C.co(f).copy()
    loops = classify_loops(f); back = C.co(f)[loops['back']]
    # 眼睛高光（遊戲裡 C.LOOK.hideEye 本來就不畫；高光改畫在虹膜貼圖裡）
    hi = mat_index(f, 'EyeHighlight'); ls, lt, mi, lv = poly_data(f)
    print('  removed EyeHighlight faces', C.delete_faces(f, mi == hi))
    C.activate(f); bpy.ops.object.material_slot_remove_unused()
    skin = mat_index(f, 'Face_00_SKIN')
    # 1. 局部細分
    print('  subdivide L1', subdivide(f, **SUBDIV_L1), 'L2', subdivide(f, **SUBDIV_L2))
    print('  face tris after subdivide', sum(len(p.vertices) - 2 for p in me.polygons))
    B = C.co(f)
    pin = lambda P: pin_weight(P, back)
    # 2. 空間變形
    R = rest_pose(f); loops = classify_loops(f)
    eyes = [eye_arcs(R, L) for L in loops['eye']]
    ex = float(np.mean([E['cx'] for E in eyes])); ez = float(np.mean([(E['up'].max() + E['lo'].min()) / 2 for E in eyes]))
    ew = float(np.mean([E['a_out'] - E['a_in'] for E in eyes]))
    print('  eye: center ax %.4f z %.4f width %.4f  rest height %.4f' % (ex, ez, ew, np.mean([E['up'].max() - E['lo'].min() for E in eyes])))
    chin_z = float(B[(np.abs(B[:, 0]) < 0.002) & (B[:, 1] > 0.05), 2].min())
    tip_i = np.argmax(np.where(np.abs(B[:, 0]) < 0.002, B[:, 1], -1)); tip_z = float(B[tip_i, 2])
    print('  chin z %.4f  nose tip z %.4f y %.4f' % (chin_z, tip_z, B[tip_i, 1]))
    W_lower = lambda P, _B=None: warp_lower(P, LOW_ZA, chin_z, D_CHIN, pin(P))
    W_brow = lambda P, _B=None: warp_brow(P, 0.045, ez + 0.036, pin(P))
    W_eye = lambda P, _B=None: warp_eyes(P, ex, ez, 0.0185, 0.0115, pin(P))
    for nm, fn, box in (('lower', W_lower, ((-0.07, 0.07), (1.37, 1.46), 0.07)), ('brow', W_brow, ((-0.08, 0.08), (1.46, 1.54), 0.075)),
                        ('eye', W_eye, ((-0.08, 0.08), (1.44, 1.51), 0.07))):
        print('  warp', nm, 'min det J %.3f' % jacobian_check(fn, box))
        C.warp(f, fn)
    # 嘴：下半臉拉長之後量嘴縫
    B = C.co(f); slit = B[classify_loops(f)['mouth']]; zs = float(slit[:, 2].mean())
    W_mouth = lambda P, _B=None: warp_mouth(P, zs, pin(P))
    print('  warp mouth (slit z %.4f half width %.4f) min det J %.3f' % (zs, np.abs(slit[:, 0]).max(), jacobian_check(W_mouth, ((-0.07, 0.07), (1.39, 1.44), 0.08))))
    C.warp(f, W_mouth)
    # 3. 表面細節（鼻、唇、下巴）：同一個位移加到所有 shape key
    B = C.co(f); skin_v = np.unique(tris(f, skin)[0])
    tip_i = np.argmax(np.where(np.abs(B[:, 0]) < 0.002, B[:, 1], -1)); tip_z = float(B[tip_i, 2])
    slitL = classify_loops(f)['mouth']; sp = B[slitL]; mw = float(np.abs(sp[:, 0]).max())
    o = np.argsort(np.abs(sp[:, 0])); slit_curve = (np.abs(sp[o, 0]), sp[o, 2])
    chin_z = float(B[(np.abs(B[:, 0]) < 0.002) & (B[:, 1] > 0.05), 2].min())
    Dn = nose_offsets(B, skin_v, tip_z) + lip_offsets(B, skin_v, slit_curve, mw) + chin_offsets(B, skin_v, chin_z)
    Dn *= pin(B)[:, None]
    C.warp(f, lambda P, _B: P + Dn)
    print('  surface detail max %.4f m; mouth half width %.4f; chin z %.4f' % (np.abs(Dn).max(), mw, chin_z))
    # 4. 法向量
    B = C.co(f); n_new = vertex_normals_from_corners(f)          # 非皮膚：沿用（細分後的新頂點用 Blender 內插的）
    n_skin = smooth_normals(f, {skin})
    is_skin = np.zeros(len(B), bool); is_skin[np.unique(tris(f, skin)[0])] = True
    moved = np.zeros(len(B)); moved[:nv_orig] = np.linalg.norm(B[:nv_orig] - B_orig, axis=1); moved[nv_orig:] = 1
    w = ss(0.0001, 0.0008, moved)
    n_keep = n_new.copy(); n_keep[:nv_orig] = n_orig
    nn = np.where(is_skin[:, None], n_keep * (1 - w[:, None]) + n_skin * w[:, None], n_keep)
    nn /= np.linalg.norm(nn, axis=1, keepdims=True) + 1e-12
    me.normals_split_custom_set_from_vertices([tuple(v) for v in nn])
    # 5. 貼圖
    paint_all(f)
    print('  face done: verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
    blink_check(f)


# ---------------- 貼圖 ----------------
def paint_all(f):
    R = rest_pose(f); loops = classify_loops(f)
    eyes = {}
    for L in loops['eye']:
        E = eye_arcs(R, L); eyes[int(np.sign(R[L, 0].mean()))] = E
    for s, E in eyes.items():
        print('  eye %+d: inner %.4f outer %.4f width %.4f height %.4f  inner z %.4f outer z %.4f' % (s, E['a_in'], E['a_out'], E['a_out'] - E['a_in'], E['up'].max() - E['lo'].min(), E['z_in'], E['z_out']))
    paint_iris(f, R, eyes)
    paint_eyeline(f, R, eyes)
    paint_lash(f, R, eyes)
    paint_brow(f, R, eyes)
    paint_skin(f, R, eyes, loops)


def paint_iris(f, R, eyes):
    mi_ = mat_index(f, 'EyeIris'); mat = f.data.materials[mi_]
    remap_uv(f, mi_, [(0.02, 0.03, 0.48, 0.97), (0.52, 0.03, 0.98, 0.97)])
    W, H = 256, 128; pos, mask = raster(f, mi_, W, H, R)
    img = np.zeros((H, W, 4)); dark = np.array([0.14, 0.085, 0.06]); mid = np.array([0.30, 0.19, 0.125]); light = np.array([0.52, 0.34, 0.22])
    ring = np.array([0.10, 0.062, 0.045]); pupil = np.array([0.055, 0.035, 0.03])
    img[..., :3] = ring
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]
        Ri = IRIS_FRAC * (E['a_out'] - E['a_in']) / 2
        cx = E['cx'] - 0.0004                                  # 稍微偏內側（看前方時虹膜在眼裂中間偏內）
        zl = np.interp(cx, E['g'], E['lo']); cz = zl + Ri - 0.0006   # 虹膜下緣碰到下眼瞼
        E['iris'] = (cx, cz, Ri)
        dxs = (ax - cx); dz = z - cz; r = np.sqrt(dxs ** 2 + dz ** 2) / Ri
        tv = -dz / Ri                                          # 正＝虹膜下半部
        th = np.arctan2(dz, dxs)
        col = mix(dark, mid, ss(-0.9, 0.15, tv))
        col = mix(col, light, ss(0.0, 0.85, tv) * ss(0.35, 0.6, r) * (1 - ss(0.75, 0.92, r)) * 0.85)
        col = col * (1 + 0.05 * np.cos(th * 19 + 2.0 * np.sin(th * 5))[..., None] * ss(0.4, 0.6, r)[..., None])   # 很淡的放射紋
        col = mix(col, ring, ss(0.74, 0.97, r))
        col = mix(col, pupil, 1 - ss(0.30, 0.37, r))
        # 高光：左上（畫面左＝網格 +x）一個、右下一個小的
        hl = np.sqrt(((pos[..., 0] - (0.34 * Ri * 1 + (cx if s > 0 else -cx))) / (0.17 * Ri)) ** 2 + ((z - (cz + 0.36 * Ri)) / (0.13 * Ri)) ** 2)
        col = mix(col, [0.97, 0.96, 0.94], 1 - ss(0.75, 1.0, hl))
        hl2 = np.sqrt(((pos[..., 0] - (-0.30 * Ri + (cx if s > 0 else -cx))) / (0.07 * Ri)) ** 2 + ((z - (cz - 0.42 * Ri)) / (0.06 * Ri)) ** 2)
        col = mix(col, [0.85, 0.75, 0.68], (1 - ss(0.7, 1.0, hl2)) * 0.6)
        a = 1 - ss(0.98, 1.06, r)
        img[sel, :3] = col[sel]; img[sel, 3] = a[sel]
    im = C.image_from_array('H01_EyeIris', np.clip(img, 0, 1)); set_tex(mat, im, white=True)
    mat.name = 'H01_Iris_EYE'          # 不含 'EyeIris'：vrm_finish 的 recolor_iris 不會把高光染成棕色（顏色已經畫在貼圖裡）


def paint_eyeline(f, R, eyes):
    mi_ = mat_index(f, 'FaceEyeline'); mat = f.data.materials[mi_]
    remap_uv(f, mi_, [(0.01, 0.02, 0.49, 0.98), (0.51, 0.02, 0.99, 0.98)])
    W, H = 512, 256; pos, mask = raster(f, mi_, W, H, R)
    line = np.array([0.15, 0.10, 0.085]); lower = np.array([0.45, 0.31, 0.27])
    img = np.zeros((H, W, 4)); img[..., :3] = line
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]
        t, du, dl = eye_coords(E, ax, z)
        th = 0.00035 + 0.0008 * ss(0.0, 0.45, t) + 0.0003 * ss(0.5, 0.9, t)          # 上眼線粗細：內眼角細、眼尾粗
        a_up = ss(-0.0007, -0.0003, du) * (1 - ss(th - 0.00018, th + 0.00018, du)) * ss(-0.03, 0.06, t) * (1 - ss(0.99, 1.04, t))
        # 眼尾：從外眼角往外上延伸 2.6 mm（18°）
        p0 = np.array([E['a_out'] - 0.0012, np.interp(E['a_out'] - 0.0012, E['g'], E['up'])]); ang = math.radians(16)
        p1 = np.array([E['a_out'] + 0.0026 * math.cos(ang), E['z_out'] + 0.0026 * math.sin(ang) + 0.0004])
        dseg, ts = seg_dist(np.stack([ax, z], -1), p0, p1)
        a_wing = 1 - ss(0.0011 * (1 - ts) * 0.85 + 0.00005, 0.0011 * (1 - ts) * 0.85 + 0.0003, dseg)
        # 下眼線：外側 2/3、很淡
        a_lo = 0.5 * ss(0.3, 0.7, t) * (1 - ss(0.97, 1.03, t)) * ss(-0.00025, 0.0, dl) * (1 - ss(0.0003, 0.0006, dl))
        a = np.maximum(np.maximum(a_up, a_wing), 0)
        col = np.where((a_lo > a)[..., None], lower, line)
        img[sel, :3] = col[sel]; img[sel, 3] = np.maximum(a, a_lo)[sel]
    im = C.image_from_array('H01_FaceEyeline', np.clip(img, 0, 1)); set_tex(mat, im, white=True, shade=(0.85, 0.82, 0.82))


def paint_lash(f, R, eyes):
    mi_ = mat_index(f, 'FaceEyelash'); mat = f.data.materials[mi_]
    remap_uv(f, mi_, [(0.01, 0.02, 0.49, 0.98), (0.51, 0.02, 0.99, 0.98)])
    W, H = 512, 256; pos, mask = raster(f, mi_, W, H, R)
    col = np.array([0.13, 0.085, 0.07]); img = np.zeros((H, W, 4)); img[..., :3] = col
    rng = np.random.RandomState(7)
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        P2 = np.stack([np.abs(pos[..., 0]), pos[..., 2]], -1); a = np.zeros(pos.shape[:2])
        for k in range(22):
            t = 0.22 + 0.82 * k / 21 + rng.uniform(-0.015, 0.015)
            ax0 = E['a_in'] + t * (E['a_out'] - E['a_in']) if t <= 1 else E['a_out'] + (t - 1) * 0.008
            z0 = np.interp(min(ax0, E['a_out']), E['g'], E['up']) + 0.0005 + (0.0003 * (t - 1) / 0.04 if t > 1 else 0)
            L = 0.0009 + 0.0017 * ss(0.3, 1.0, t)
            ang = math.radians(90 - 12 - 48 * ss(0.2, 1.05, t))          # 越外側越往外倒
            p0 = np.array([ax0, z0]); p1 = p0 + L * np.array([math.cos(ang), math.sin(ang)])
            d, ts = seg_dist(P2, p0, p1); wdt = 0.00016 * (1 - ts) + 0.00002
            a = np.maximum(a, (1 - ss(wdt * 0.6, wdt * 1.3, d)) * (0.85 - 0.3 * ts))
        img[sel, 3] = a[sel]
    im = C.image_from_array('H01_FaceEyelash', np.clip(img, 0, 1)); set_tex(mat, im, white=True, shade=(0.85, 0.82, 0.82))


def paint_brow(f, R, eyes):
    mi_ = mat_index(f, 'FaceBrow'); mat = f.data.materials[mi_]
    remap_uv(f, mi_, [(0.01, 0.02, 0.49, 0.98), (0.51, 0.02, 0.99, 0.98)])
    W, H = 256, 128; pos, mask = raster(f, mi_, W, H, R)
    col = np.array([0.33, 0.235, 0.18]); img = np.zeros((H, W, 4)); img[..., :3] = col
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]
        top = E['up'].max()
        b0, bp, b1 = E['a_in'] - 0.0072, E['a_in'] + 0.024, E['a_out'] + 0.0075     # 眉頭、眉峰、眉尾
        zp = top + 0.0175; z0 = zp - 0.0028; z1 = zp - 0.0040
        t = np.clip((ax - b0) / (b1 - b0), -0.2, 1.2); tp = (bp - b0) / (b1 - b0)
        zc = np.where(t < tp, z0 + (zp - z0) * np.sin(np.clip(t / tp, 0, 1) * np.pi / 2), zp + (z1 - zp) * (np.clip((t - tp) / (1 - tp), 0, 1) ** 1.6))
        hw = np.where(t < tp, 0.0021 - 0.0003 * (t / tp), 0.0018 * (1 - np.clip((t - tp) / (1 - tp), 0, 1)) ** 0.8 + 0.00015)   # 半粗細
        d = z - zc
        a = (1 - ss(hw - 0.00045, hw + 0.00035, np.abs(d - 0.0002 * (t < tp))))
        a *= ss(-0.02, 0.07, t) * (1 - ss(0.97, 1.03, t))
        a *= 0.55 + 0.4 * ss(0.0, 0.25, t)                          # 眉頭淡、眉峰濃
        strokes = 0.88 + 0.12 * np.cos((ax * 2600 + d * 9000 * (0.6 - 0.5 * t)))   # 很淡的毛流
        a *= strokes
        img[sel, 3] = (a * 0.92)[sel]
    im = C.image_from_array('H01_FaceBrow', np.clip(img, 0, 1)); set_tex(mat, im, white=True, shade=(0.85, 0.82, 0.82))


def paint_skin(f, R, eyes, loops):
    skin = mat_index(f, 'Face_00_SKIN'); mat = f.data.materials[skin]; e = mat.vrm_addon_extension.mtoon1
    src = e.pbr_metallic_roughness.base_color_texture.index.source
    base = img_array(src); H, W = base.shape[:2]
    out = base.copy()
    # (a) VRoid 在眼睛內側上方畫的「^」小線條拿掉（換成模糊後的底色）
    L = 0.299 * base[..., 0] + 0.587 * base[..., 1] + 0.114 * base[..., 2]; bl = blur(base, 10); Lb = 0.299 * bl[..., 0] + 0.587 * bl[..., 1] + 0.114 * bl[..., 2]
    reg = np.zeros((H, W), bool); reg[int(0.43 * H):int(0.53 * H), int(0.33 * W):int(0.67 * W)] = True
    marks = reg & (L < Lb - 0.035)
    mk = blur(marks.astype(float), 3) > 0.02
    out[mk] = bl[mk]
    pos, mask = raster(f, skin, W, H, R)
    ax = np.abs(pos[..., 0]); x = pos[..., 0]; z = pos[..., 2]; y = pos[..., 1]
    rgb = out[..., :3]
    # (b) 雙眼皮線（末廣型：內眼角窄、往外變寬）＋下眼瞼淡淡的陰影
    for s, E in eyes.items():
        sel = mask & ((x > 0) == (s > 0)) & (y > 0.03)
        t, du, dl = eye_coords(E, ax, z)
        off = 0.0010 + 0.0013 * ss(0.0, 0.65, t)
        a = 0.42 * ss(0.08, 0.35, t) * (1 - ss(0.92, 1.1, t)) * (1 - ss(0.00012, 0.00032, np.abs(du - off)))
        rgb[sel] = mix(rgb[sel], [0.62, 0.42, 0.38], a[sel])
        a2 = 0.16 * ss(0.15, 0.4, t) * (1 - ss(0.95, 1.08, t)) * ss(-0.0002, 0.0002, dl) * (1 - ss(0.0006, 0.0018, dl))
        rgb[sel] = mix(rgb[sel], [0.78, 0.55, 0.50], a2[sel])
    # (c) 嘴唇
    B = C.co(f); sp = R[loops['mouth']]; mw = float(np.abs(sp[:, 0]).max()); o = np.argsort(np.abs(sp[:, 0]))
    zs = np.interp(ax, np.abs(sp[o, 0]), sp[o, 2]); d = z - zs
    xn = np.clip(ax / (mw * 1.06), 0, 1.5)
    bow = 1 - 0.20 * np.exp(-(x / 0.0016) ** 2) + 0.05 * np.exp(-((ax - 0.0042) / 0.0022) ** 2)
    hu = 0.0040 * np.clip(1 - xn ** 2.4, 0, 1) ** 0.55 * bow
    hl = 0.0056 * np.clip(1 - xn ** 2.0, 0, 1) ** 0.6
    a_u = (1 - ss(hu - 0.00035, hu + 0.00025, d)) * (d >= -0.0001)
    a_l = (1 - ss(hl - 0.0005, hl + 0.0004, -d)) * (d < 0.0001)
    a = np.maximum(a_u, a_l) * (1 - ss(0.96, 1.12, xn)) * (y > 0.06) * (np.abs(d) < 0.01)
    lip_out = np.array([0.86, 0.56, 0.54]); lip_in = np.array([0.74, 0.38, 0.40]); lip_hi = np.array([0.93, 0.70, 0.67])
    col = mix(lip_out, lip_in, (1 - ss(0.0, 0.0024, np.abs(d))) * 0.85)
    col = mix(col, lip_hi, np.exp(-((ax / 0.0055) ** 2 + ((d + 0.0029) / 0.0011) ** 2)) * 0.55)
    col = mix(col, [0.55, 0.27, 0.29], (1 - ss(0.0, 0.00045, np.abs(d))) * (1 - ss(0.85, 1.0, xn)))   # 嘴縫
    sel = mask & (a > 0.001)
    rgb[sel] = mix(rgb[sel], col[sel], (a * 0.9)[sel])
    # 嘴角：往上的一點小陰影（表情柔和）
    for sgn in (1, -1):
        dc = np.sqrt(((x - sgn * mw * 1.02) / 0.0012) ** 2 + ((z - (np.interp(mw, np.abs(sp[o, 0]), sp[o, 2]) + 0.0003)) / 0.0007) ** 2)
        sel = mask & (y > 0.06)
        rgb[sel] = mix(rgb[sel], [0.70, 0.45, 0.42], ((1 - ss(0.6, 1.0, dc)) * 0.35)[sel])
    # (d) 鼻孔、鼻下陰影、鼻翼溝
    mid = (np.abs(B[:, 0]) < 0.002); tip_i = np.argmax(np.where(mid, R[:, 1], -1)); tip = R[tip_i]
    for sgn in (1, -1):
        cxn, czn = sgn * 0.0040, tip[2] - 0.0043
        rx, rz = (x - cxn), (z - czn); c, s_ = math.cos(math.radians(22 * sgn)), math.sin(math.radians(22 * sgn))
        u_, v_ = rx * c + rz * s_, -rx * s_ + rz * c
        dn = np.sqrt((u_ / 0.0017) ** 2 + (v_ / 0.00085) ** 2)
        sel = mask & (y > 0.07)
        rgb[sel] = mix(rgb[sel], [0.60, 0.38, 0.36], ((1 - ss(0.55, 1.0, dn)) * 0.55)[sel])
        da = np.sqrt(((ax - 0.0088) / 0.0040) ** 2 + ((z - (tip[2] - 0.0040)) / 0.0034) ** 2)
        rgb[sel] = mix(rgb[sel], [0.80, 0.58, 0.52], (np.exp(-((da - 1.15) / 0.22) ** 2) * 0.22 * (x * sgn > 0))[sel])
    sel = mask & (y > 0.07)
    dsub = np.sqrt((x / 0.0055) ** 2 + ((z - (tip[2] - 0.0058)) / 0.0018) ** 2)
    rgb[sel] = mix(rgb[sel], [0.82, 0.60, 0.55], ((1 - ss(0.4, 1.0, dsub)) * 0.25)[sel])
    out[..., :3] = np.clip(rgb, 0, 1); out[..., 3] = 1
    im = C.image_from_array('H01_Face_00', out.astype(np.float32))
    set_tex(mat, im)
    e.normal_texture.index.source = None        # 舊的法線貼圖是照舊臉型畫的（遊戲版本來就拿掉）


def blink_check(f):
    """閉眼（vrm_finish 之後的 blink=1：0.5 Natural＋1.0 Close）正面投影：眼白／虹膜有沒有露在皮膚前面"""
    R = rest_pose(f, close=1.0); TV_all, _ = tris(f)
    ls, lt, mi, lv = poly_data(f)
    names = mat_names(f)
    cls = []
    for p in range(len(ls)):
        nm = names[mi[p]]; c = 2 if ('EyeWhite' in nm or 'Iris' in nm) else (1 if 'SKIN' in nm else 0)
        cls += [c] * (lt[p] - 2)
    cls = np.array(cls)
    res = 0.0002; worst = 0
    for sgn in (1, -1):
        x0, x1, z0, z1 = (0.015, 0.07, 1.445, 1.50) if sgn > 0 else (-0.07, -0.015, 1.445, 1.50)
        Wd, Hd = int((x1 - x0) / res), int((z1 - z0) / res); zb = np.full((Hd, Wd), -1e9); cb = np.zeros((Hd, Wd), int)
        for t in np.nonzero(cls > 0)[0]:
            P = R[TV_all[t]]; uv = np.column_stack([(P[:, 0] - x0) / res, (z1 - P[:, 2]) / res])
            mn = np.floor(uv.min(0)).astype(int); mx = np.ceil(uv.max(0)).astype(int)
            mn = np.maximum(mn, 0); mx = np.minimum(mx, [Wd - 1, Hd - 1])
            if (mx < mn).any(): continue
            X, Y = np.meshgrid(np.arange(mn[0], mx[0] + 1) + 0.5, np.arange(mn[1], mx[1] + 1) + 0.5)
            (ax_, ay), (bx, by), (cx, cy) = uv; den = (by - cy) * (ax_ - cx) + (cx - bx) * (ay - cy)
            if abs(den) < 1e-14: continue
            l1 = ((by - cy) * (X - cx) + (cx - bx) * (Y - cy)) / den; l2 = ((cy - ay) * (X - cx) + (ax_ - cx) * (Y - cy)) / den; l3 = 1 - l1 - l2
            ins = (l1 >= 0) & (l2 >= 0) & (l3 >= 0); dep = l1 * P[0, 1] + l2 * P[1, 1] + l3 * P[2, 1]
            sub = (slice(mn[1], mx[1] + 1), slice(mn[0], mx[0] + 1)); zz = zb[sub]; cc = cb[sub]
            upd = ins & (dep > zz); zz[upd] = dep[upd]; cc[upd] = cls[t]; zb[sub] = zz; cb[sub] = cc
        n = int((cb == 2).sum()); worst = max(worst, n)
        print('  blink check side %+d: eye pixels visible when closed = %d (0.2 mm px)' % (sgn, n))
    return worst
