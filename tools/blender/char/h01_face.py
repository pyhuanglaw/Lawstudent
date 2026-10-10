"""沈以安（heroine_01）臉部：立體結構與五官（Blender bpy；heroine_01.py 的 face 階段，提供 apply(m)）。
2026-10-10 使用者要求「用 Blender 真正改善 3D 造型」：VRoid 樣本的臉是大眼娃娃（眼裂高、虹膜佔滿眼裂、細上挑眉、鼻子只有一個尖點、
嘴寬只有兩眼距離的 0.3、下半臉很短），這裡改成參考圖（docs/art-rebuild/references/01_shen_yian_character_sheet.webp）的成年寫實日系臉。

做法（全部在 Blender 裡做，表情跟著變）：
  1. 局部細分（bpy.ops.mesh.subdivide＋BEAUTY 三角化）：下半臉細分一次、鼻子再一次（3158 → 4600 三角形）。
     shape key、UV、權重由 Blender 線性內插（已驗證誤差 < 1e-7 m）；法向量自己內插（見 subdivide）。
  2. 空間變形（common.warp：同一個平滑位移場套在 Basis 與全部 41 個表情 shape key，眨眼、嘴型仍然對得上）：
     下半臉加長、兩眼往中間靠、眉毛降低、眼睛（眼裂高度、寬度、外眼角上揚）、下巴變圓、嘴變寬。每個變形都檢查 det J > 0（不摺疊）。
  3. 表面細節（同一個位移加到 Basis 與全部 shape key，張嘴時嘴唇跟著動）：鼻樑、鼻頭、鼻翼、嘴唇厚度、下巴、臉頰；休息時的嘴縫合起來。
  4. 法向量：VRoid 原本調好的平滑法向量照每個變形的 Jacobian 轉（n' ∝ J^-T n），不從低面數幾何重算（重算會出現放射狀雜紋、亮帶）。
  5. 貼圖（numpy）：先把每個材質的 UV 三角形「點陣化」成每個像素在臉上的 3D 位置（休息姿勢），再用臉上的座標畫：
     虹膜（深棕、外圈、瞳孔、小高光；EyeHighlight 網格拿掉）、眼白、上眼線＋眼尾、下眼線、細睫毛、自然的眉毛、雙眼皮線、唇形與唇色、鼻孔；
     VRoid 畫在臉皮上的「^」、鼻尖線、嘴線拿掉。眉毛／眼線／睫毛／虹膜／眼白的 UV 重新排滿各自的貼圖（解析度用滿）。

座標：Face 物件的網格座標（物件有 180° 旋轉）：+Y＝臉的前方、|x| 越大越靠外側、Z 朝上。
臉的網格邊界（後腦勺、脖子和身體網格的接縫）全部固定不動（所有變形都乘上 pin 權重）。
vrm_finish.py 之後會把 0.5×Fcl_EYE_Natural＋0.2×Fcl_EYE_Close 烘進基本形（FEMALE_EYES）、眨眼權重 ×0.8；
這裡所有「休息姿勢」的計算都照這個組合。"""
import bpy, bmesh, math, os
import numpy as np
import common as C

REST = {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2}   # = tools/vroid_build.py 的 FEMALE_EYES（vrm_finish.py 會烘進基本形）

# ---------------- 造型參數（公尺；臉網格座標）----------------
D_CHIN = 0.009           # 下巴往下（下半臉加長：鼻下到下巴 4.1 → 5.1 cm，接近參考圖的三等分）
LOW_ZA = 1.438           # 下半臉加長從這個高度開始（鼻頭下方，不拉長鼻子）
BROW_DROP = 0.0055       # 眉毛降低（參考圖眉眼距離較近）
EYE_SX, EYE_SZ = 1.12, 0.74   # 眼裂寬、高的縮放（眼睛中心；之後整張臉再收窄 FACE_NARROW）
EYE_TILT = 0.10          # 外眼角上揚（z 位移 / x 距離）
EYE_IN = 0.0030           # 兩眼往中間靠（VRoid 兩眼內眼角距離是 1.5 個眼寬，參考圖約 1 個）
EYE_LIFT = 0.0006        # 眼睛整體上移一點（眼睛在頭的位置偏低是動畫比例）
CHIN_WIDEN = 0.45        # 下巴尖端變寬（圓下巴）
JAW_OUT = 0.0032         # 下顎線中段往外（鵝蛋臉）
MOUTH_K = 1.80           # 嘴寬倍數（VRoid 嘴縫只有 2.2 cm）
FACE_NARROW = 0.95       # 臉的前半（眉毛以下、耳朵以前）左右收窄：VRoid 的臉頰／太陽穴偏寬，參考圖的眼寬約臉寬 1/4
JAW_OUTLINE = 0.5        # 下巴、下顎描邊寬度倍數（45 度看下顎那條描邊像刀切；參考圖沒有描邊）
IRIS_FRAC = 0.53         # 虹膜直徑 / 眼裂寬（參考圖約 0.5）
# 貼圖參數（v9.4 人物生產線：其他人物的模組可以改這些，沈以安用預設值）
EYELINE_K = 1.0          # 上眼線粗細倍數
WING = 0.0030            # 眼尾往外上延伸的長度（m）
LASH_N, LASH_L = 28, 1.0 # 睫毛根數、長度倍數
BROW_K, BROW_ARCH = 1.0, 1.0   # 眉毛粗細倍數、眉峰高度倍數（1＝沈以安的柔和弧眉）
BROW_COL = (0.39, 0.28, 0.215)
BROW_A = 0.85             # 眉毛濃度
BROW_SCALE_Z = 1.0        # 眉毛網格（FaceBrow）上下放大（男生的粗眉：原本的網格太窄，畫粗的眉會被網格邊緣切掉）
EYE_TINT_K = 0.0          # 眼睛周圍皮膚的粉紅色調拿掉多少（男生：VRoid 貼圖眼周的粉色像眼影）
CHEEK_TINT_K = 0.0        # 臉頰腮紅拿掉多少（VRoid 女性貼圖的腮紅是動畫式的大塊粉紅；林芷若 0.7）
LIP_OUT, LIP_IN, LIP_HI = (0.86, 0.54, 0.56), (0.77, 0.36, 0.43), (0.94, 0.72, 0.72)
LIP_A = 0.9              # 唇色濃度
LOWER_BACK = (0.0010, 0.0055)   # 嘴縫、下巴往後收（側面看下半臉像往前推：遊戲內側面截圖；參考圖側面嘴唇在鼻尖後 1.1–1.7 cm、下巴在 2.7–3.4 cm，原本 1.0／2.2 cm）
CHIN_FWD = 0.0036        # 下巴尖（頦）往前：下唇下面的凹（頦唇溝）到下巴是一個圓的小突起，不是一路斜下去（原本 2.2 mm）
MOUTH_DOWN = 0.0020      # 嘴往下（人中加長：參考圖正面鼻下→嘴：嘴→下巴＝1:2，原本 1:2.2；側面參考圖嘴更低）
SUBDIV_L1 = dict(ax=0.056, z0=1.383, z1=1.468, y0=0.045, amin=1.5e-6)   # 下半臉細分一次
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


def smooth_normals(f, N, w, iters=12, lam=0.6):
    """法向量在網格上做拉普拉斯平滑（w：每個頂點的強度 0～1）。嘴下面到下巴的明暗直條紋是法向量的高頻變化
    （關掉描邊還在、把陰影色改成亮色就不見：遊戲內實測），在這一區把它磨平；位置相同的頂點（UV 接縫）當成同一個"""
    me = f.data; P = C.co(f); wid = weld_ids(P); nW = wid.max() + 1
    E = np.empty(len(me.edges) * 2, np.int64); me.edges.foreach_get('vertices', E); E = wid[E.reshape(-1, 2)]
    E = E[E[:, 0] != E[:, 1]]; E = np.unique(np.sort(E, 1), axis=0)
    deg = np.bincount(E.ravel(), minlength=nW).astype(float)
    Nw = np.zeros((nW, 3)); np.add.at(Nw, wid, N); Nw /= np.linalg.norm(Nw, axis=1, keepdims=True) + 1e-12
    ww = np.zeros(nW); np.maximum.at(ww, wid, w)
    for _ in range(iters):
        S = np.zeros_like(Nw); np.add.at(S, E[:, 0], Nw[E[:, 1]]); np.add.at(S, E[:, 1], Nw[E[:, 0]])
        avg = S / np.maximum(deg, 1)[:, None]
        Nw = Nw + (lam * ww)[:, None] * (avg - Nw); Nw /= np.linalg.norm(Nw, axis=1, keepdims=True) + 1e-12
    return np.where((w > 0)[:, None], Nw[wid], N)


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
    if not out['eye']:          # 別的人物（臉的高度不同，例如祐廷）：不用絕對高度，眼睛＝離中線遠的兩個洞、嘴＝中線上的洞
        cs = [(L, B[L].mean(0)) for L in loops if L is not big]
        out['eye'] = [L for L, c in cs if abs(c[0]) > 0.015]
        mids = [(L, c) for L, c in cs if abs(c[0]) < 0.006]
        if mids: out['mouth'] = min(mids, key=lambda t: t[1][2])[0]
    return out


def pin_weight(P, pts, r0=0.004, r1=0.022):
    """離臉網格邊界（和身體網格的接縫）越近越不動：邊界上 0、r1 以外 1（空間函數，所有 shape key 一樣）"""
    d = np.full(len(P), 1e9)
    for i in range(0, len(pts), 64):
        q = pts[i:i + 64]; d = np.minimum(d, np.sqrt(((P[:, None, :] - q[None]) ** 2).sum(-1)).min(1))
    return ss(r0, r1, d)


# ---------------- 局部細分 ----------------
def subdivide(f, N, ax, z0, z1, y0, amin, mat_pat='Face_00_SKIN'):
    """選到的皮膚面細分一次（線性，不改形狀）。N：細分前每個頂點的法向量 → 回傳細分後的（新頂點＝所在邊／面的頂點法向量平均）。
    不能用 Blender 自己內插的 custom normal：它是在每個 corner 的 lnor 空間編碼的整數，跨 corner 內插會變成亂掉的法向量（臉上出現亮帶）"""
    P0 = C.co(f); nv0 = len(P0); me = f.data
    E = np.array([e.vertices[:] for e in me.edges]); ls, lt, mi, lv = poly_data(f)
    cand = [((P0[E[:, 0]] + P0[E[:, 1]]) / 2, E)]
    polys_ = [lv[ls[p]:ls[p] + lt[p]] for p in range(len(ls))]
    cand.append((np.array([P0[q].mean(0) for q in polys_]), polys_))
    skin = mat_index(f, mat_pat); C.activate(f, 'EDIT'); bm = bmesh.from_edit_mesh(f.data); bm.faces.ensure_lookup_table(); n = 0
    for fc in bm.faces: fc.select_set(False)
    for fc in bm.faces:
        c = fc.calc_center_median()
        if fc.material_index == skin and abs(c.x) < ax and z0 < c.z < z1 and c.y > y0 and fc.calc_area() > amin \
                and not any(e.is_boundary for e in fc.edges):      # 嘴縫、眼洞邊上的面不細分（邊界保持原樣）
            fc.select_set(True); n += 1
    bmesh.update_edit_mesh(f.data)
    if n:
        bpy.ops.mesh.subdivide(number_cuts=1, smoothness=0)
        # 細分後鄰接的面會變成「邊上多一個點」的四邊形；先用 BEAUTY 三角化（不然變形後匯出時的三角化可能摺疊，露出嘴巴內側的細黑線）
        bm = bmesh.from_edit_mesh(f.data); bmesh.ops.triangulate(bm, faces=[q for q in bm.faces if len(q.verts) > 3], quad_method='BEAUTY', ngon_method='BEAUTY')
        # 三個點共線的退化三角形（面積 0）：翻轉它的長邊（和鄰面換對角線），變形後才不會變成方向相反的細縫
        for _ in range(3):
            bad = [q for q in bm.faces if len(q.verts) == 3 and q.calc_area() < 1e-10]
            if not bad: break
            for q in bad:
                if not q.is_valid: continue
                e = max(q.edges, key=lambda e: e.calc_length())
                if len(e.link_faces) == 2: bmesh.utils.edge_rotate(e, True)
        bmesh.update_edit_mesh(f.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    P1 = C.co(f); N1 = np.zeros((len(P1), 3)); N1[:nv0] = N[:nv0]; miss = 0
    from mathutils import kdtree
    trees = []
    for pts, _ in cand:
        kd = kdtree.KDTree(len(pts))
        for i, p in enumerate(pts): kd.insert(p, i)
        kd.balance(); trees.append(kd)
    for v in range(nv0, len(P1)):
        best = None
        for (pts, src), kd in zip(cand, trees):
            co_, i, d = kd.find(P1[v])
            if d < 1e-7 and (best is None or d < best[0]): best = (d, src[i])
        if best is None:
            miss += 1; d = np.linalg.norm(P0 - P1[v], axis=1); near = np.argsort(d)[:4]; N1[v] = N[near].sum(0); continue
        N1[v] = N[np.asarray(best[1])].sum(0)
    N1 /= np.linalg.norm(N1, axis=1, keepdims=True) + 1e-12
    if miss: print('  subdivide: %d new verts without a source edge/face' % miss)
    return n, N1


# ---------------- 空間變形（P: N×3；所有 shape key 用同一個函數）----------------
def front_gate(y):
    return ss(0.012, 0.038, y)


def warp_lower(P, z_a, z_b, D, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    t = np.clip((z_a - z) / (z_a - z_b), 0, None); a = 0.3
    r = np.where(t < a, t * t / (2 * a), np.minimum(t, 1) - a / 2) / (1 - a / 2)
    w = r * front_gate(y) * (1 - ss(0.05, 0.085, np.abs(x))) * pin
    Q = P.copy(); Q[:, 2] -= D * w; return Q


def shift_w(P, cx, cz):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
    return np.exp(-(((ax - cx) / 0.026) ** 2 + ((z - cz) / 0.032) ** 2)) * ss(0.004, 0.016, ax) * front_gate(y)


def warp_eye_in(P, cx, cz, pin):
    """眼睛＋眉毛一起往中間移 EYE_IN（中線附近不動）"""
    Q = P.copy(); Q[:, 0] -= np.sign(P[:, 0]) * EYE_IN * shift_w(P, cx, cz) * pin; return Q


def warp_brow(P, bx, bz, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    r = np.sqrt(((np.abs(x) - bx) / 0.030) ** 2 + ((z - bz) / 0.013) ** 2)
    w = (1 - ss(0.6, 1.6, r)) * front_gate(y) * pin
    Q = P.copy(); Q[:, 2] -= BROW_DROP * w; return Q


def warp_eyes(P, ex, ez, ru, rv, pin, fall=2.5):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; s = np.sign(x); ax = np.abs(x)
    u = ax - ex; v = z - ez
    r = np.sqrt((u / ru) ** 2 + (v / rv) ** 2); w = (1 - ss(1.0, fall, r)) * front_gate(y) * pin
    ax2 = ex + u * (1 - (1 - EYE_SX) * w * ss(0.003, 0.016, ax))      # 中線附近不左右縮放（放大時不會把鼻樑的點推過中線）
    z2 = ez + v * (1 - (1 - EYE_SZ) * w) + (EYE_TILT * u + EYE_LIFT) * w
    Q = P.copy(); Q[:, 0] = s * ax2; Q[:, 2] = z2; return Q


def warp_jaw(P, chin_z, pin):
    """下巴變圓、下顎線外凸一點（VRoid 是尖 V 字下巴，參考圖是柔和的鵝蛋臉）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x); g = front_gate(y) * pin
    gc = np.exp(-((z - (chin_z + 0.005)) / 0.011) ** 2) * (1 - ss(0.010, 0.032, ax))
    gj = np.exp(-(((ax - 0.036) / 0.016) ** 2 + ((z - (chin_z + 0.022)) / 0.014) ** 2))
    Q = P.copy(); Q[:, 0] = x * (1 + CHIN_WIDEN * gc * g) + np.sign(x) * JAW_OUT * gj * g; return Q


def warp_narrow(P, ez, chin_z, pin):
    """臉的前半左右收窄（耳朵、太陽穴、頭頂不動；下巴附近少收，不變回尖下巴）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    w = front_gate(y) * (1 - ss(0.060, 0.078, np.abs(x))) * (1 - ss(ez + 0.020, ez + 0.050, z)) * (0.35 + 0.65 * ss(chin_z + 0.012, chin_z + 0.040, z)) * pin
    Q = P.copy(); Q[:, 0] = x * (1 - (1 - FACE_NARROW) * w); return Q


def warp_retract(P, zs, pin):
    """下唇、下巴往後收（只動臉的前面、嘴角以外漸弱；y 方向的剪切，不會摺疊）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    R = LOWER_BACK[0] * ss(zs + 0.006, zs - 0.001, z) + (LOWER_BACK[1] - LOWER_BACK[0]) * ss(zs, zs - 0.010, z)
    Q = P.copy(); Q[:, 1] -= R * (1 - ss(0.022, 0.052, np.abs(x))) * front_gate(y) * pin; return Q


def warp_mouth_down(P, tip_z, zs, chin_z, pin):
    """嘴（連同嘴裡）往下移 MOUTH_DOWN：鼻子下面拉長、嘴到下巴縮短（鼻子、下巴底不動）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    w = ss(tip_z - 0.005, zs + 0.004, z) * ss(chin_z + 0.004, zs - 0.007, z) * (1 - ss(0.030, 0.055, np.abs(x))) * front_gate(y) * pin
    Q = P.copy(); Q[:, 2] -= MOUTH_DOWN * w; return Q


def jacobian_min3(fn, B, h=2e-5):
    J = np.empty((len(B), 3, 3))
    for k in range(3):
        e = np.zeros(3); e[k] = h; J[:, :, k] = (fn(B + e) - fn(B - e)) / (2 * h)
    return float(np.linalg.det(J).min())


def warp_mouth(P, zs, pin):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    sz = np.where(z > zs, 0.010, 0.012)
    w = np.exp(-((z - zs) / sz) ** 2) * (1 - ss(0.008, 0.046, np.abs(x))) * front_gate(y) * pin
    Q = P.copy(); Q[:, 0] = x * (1 + (MOUTH_K - 1) * w); return Q


def tri_normals(f, mat_i):
    TV, _ = tris(f, mat_i); P = C.co(f); a, b, c = P[TV[:, 0]], P[TV[:, 1]], P[TV[:, 2]]; n = np.cross(b - a, c - a)
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-15), np.linalg.norm(n, axis=1) / 2


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


def softplus(u, eps=0.0005):
    return 0.5 * (u + np.sqrt(u * u + eps * eps))


def nose_field(P, prof, tip_z):
    """鼻樑（鼻根到鼻頭幾乎一直線）、鼻頭、鼻翼。空間函數（P 任意點 → 位移），法向量用它的 Jacobian 轉"""
    zz, yy = prof; x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
    ymid = np.interp(z, zz, yy)
    z_n = tip_z + 0.0285; y_n = np.interp(z_n, zz, yy) + 0.0004          # 鼻根（兩眼之間）
    z_t = tip_z + 0.0012; y_t = np.interp(tip_z, zz, yy) + 0.0016        # 鼻頭最高點
    t = np.clip((z_n - z) / (z_n - z_t), 0, 1)
    y_line = y_n + (y_t - y_n) * t ** 1.2                               # 鼻樑：幾乎直線（略凹）
    along = ss(z_t - 0.0045, z_t + 0.002, z) * (1 - ss(z_n - 0.004, z_n + 0.004, z))
    sig = 0.0042 + 0.0022 * t                                            # 鼻樑寬度：鼻根窄、鼻頭寬
    dy = softplus(y_line - ymid) * along * np.exp(-(x / sig) ** 2)
    dy += 0.0010 * np.exp(-((x / 0.0048) ** 2 + ((z - (tip_z + 0.0002)) / 0.0040) ** 2))    # 鼻頭圓潤
    ala_z = tip_z - 0.0040; ala_x = 0.0088                                                  # 鼻翼（左右小鼓起）＋鼻翼溝
    ra = np.sqrt(((ax - ala_x) / 0.0036) ** 2 + ((z - ala_z) / 0.0027) ** 2)
    dy += 0.0005 * np.exp(-ra ** 2)
    dx = 0.0004 * np.exp(-ra ** 2) * np.tanh(x / 0.002)
    dy -= 0.0003 * np.exp(-((ra - 1.55) / 0.35) ** 2) * (1 - ss(ala_z + 0.002, ala_z + 0.006, z))
    g = front_gate(y); D = np.zeros_like(P); D[:, 0] = dx * g; D[:, 1] = dy * g; return D


def lip_field(P, slit, mw):
    """嘴唇厚度：上唇（唇峰在嘴縫上 1.7 mm）、下唇較飽滿；嘴縫上下兩邊位移相同（不會露出縫）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; sx_, sz_ = slit
    zs = np.interp(np.abs(x), sx_, sz_); d = z - zs
    side = np.clip(1 - (np.abs(x) / (mw * 1.15)) ** 2, 0, 1) ** 1.5
    g = lambda mu, sg: np.exp(-((d - mu) / sg) ** 2)
    dy = (0.0011 * g(0.0018, 0.0018) + 0.0019 * g(-0.0032, 0.0026) - 0.0005 * g(-0.0095, 0.0022)) * side
    D = np.zeros_like(P); D[:, 1] = dy * front_gate(y); return D


def cheek_field(P, ez):
    """顴骨下方的臉頰飽滿一點（45 度看比較圓潤，VRoid 臉頰是平的）"""
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)
    w = np.exp(-(((ax - 0.046) / 0.016) ** 2 + ((z - (ez - 0.033)) / 0.020) ** 2)) * front_gate(y)
    D = np.zeros_like(P); D[:, 0] = 0.0018 * w * np.tanh(x / 0.01); D[:, 1] = 0.0024 * w; return D


def chin_field(P, chin_z):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    w = np.exp(-((x / 0.016) ** 2 + ((z - (chin_z + 0.009)) / 0.009) ** 2)) * front_gate(y)
    D = np.zeros_like(P); D[:, 1] = CHIN_FWD * w; D[:, 2] = -0.0008 * w; return D


def slit_fit(sp):
    """嘴縫（上下唇的邊界點，左右混在一起）→ 平滑的 z(|x|)：最小平方擬合 a + b x² + c x⁴（直接內插會鋸齒狀，嘴下面出現直條紋）"""
    ax = np.abs(sp[:, 0]); A = np.column_stack([np.ones_like(ax), ax ** 2, ax ** 4]); c = np.linalg.lstsq(A, sp[:, 2], rcond=None)[0]
    g = np.linspace(0, ax.max() * 1.6, 60); return g, c[0] + c[1] * g ** 2 + c[2] * g ** 4


def smooth_profile(zz, yy, step=0.00025, sigma=0.0012):
    g = np.arange(zz.min(), zz.max(), step); v = np.interp(g, zz, yy)
    k = np.arange(-4 * sigma, 4 * sigma + step, step); k = np.exp(-(k / sigma) ** 2); k /= k.sum()
    vp = np.pad(v, len(k) // 2, mode='edge'); return g, np.convolve(vp, k, mode='valid')[:len(g)]


# ---------------- 法向量 ----------------
def corner_normals(f):
    me = f.data; a = np.empty(len(me.loops) * 3); me.corner_normals.foreach_get('vector', a); return a.reshape(-1, 3)


def vertex_normals_from_corners(f):
    _, _, _, lv = poly_data(f); cn = corner_normals(f); n = np.zeros((len(f.data.vertices), 3))
    np.add.at(n, lv, cn); return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


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


def dilate_into(rgb, mask, n=4):
    """UV 島外面的像素（mask=False）用旁邊島內的顏色填（貼圖過濾時島的邊緣才不會混到舊顏色，例如嘴縫下面的亮線）"""
    rgb = rgb.copy(); m = mask.copy()
    for _ in range(n):
        acc = np.zeros_like(rgb); cnt = np.zeros(m.shape)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            mm = np.roll(m, (dy, dx), (0, 1)); acc += np.roll(rgb, (dy, dx), (0, 1)) * mm[..., None]; cnt += mm
        new = (~m) & (cnt > 0); rgb[new] = acc[new] / cnt[new][:, None]; m |= new
    return rgb


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
def transport_normals(B, fn, N, h=2e-5):
    """法向量照空間變形 fn 的 Jacobian 轉（n' ∝ J^-T n）：保留 VRoid 原本調好的平滑法向量，不從低面數幾何重算（重算會有放射狀雜紋）"""
    J = np.empty((len(B), 3, 3))
    for k in range(3):
        e = np.zeros(3); e[k] = h; J[:, :, k] = (fn(B + e) - fn(B - e)) / (2 * h)
    N2 = np.einsum('nji,nj->ni', np.linalg.inv(J), N)            # (J^-1)^T n
    return N2 / (np.linalg.norm(N2, axis=1, keepdims=True) + 1e-12)


def warp_n(f, fn, N):
    N2 = transport_normals(C.co(f), fn, N); C.warp(f, lambda P, _B: fn(P)); return N2


def apply(m):
    f = m['face']; me = f.data
    print('  face: verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
    loops = classify_loops(f); back = C.co(f)[loops['back']]
    # 眼睛高光（遊戲裡 C.LOOK.hideEye 本來就不畫；高光改畫在虹膜貼圖裡）
    hi = mat_index(f, 'EyeHighlight'); ls, lt, mi, lv = poly_data(f)
    print('  removed EyeHighlight faces', C.delete_faces(f, mi == hi))
    C.activate(f); bpy.ops.object.material_slot_remove_unused()
    skin = mat_index(f, 'Face_00_SKIN')
    # 1. 局部細分（新頂點的 shape key、UV、權重、法向量由 Blender 內插）
    N = vertex_normals_from_corners(f)                       # VRoid 原本的平滑法向量（之後跟著細分、變形轉）
    n1, N = subdivide(f, N, **SUBDIV_L1); n2, N = subdivide(f, N, **SUBDIV_L2)
    print('  subdivide L1', n1, 'L2', n2, '→ face tris', sum(len(p.vertices) - 2 for p in me.polygons))
    tn0, ta0 = tri_normals(f, None)
    B = C.co(f)
    pin = lambda P: pin_weight(P, back)
    # 2. 空間變形
    R = rest_pose(f); loops = classify_loops(f)
    eyes = [eye_arcs(R, L) for L in loops['eye']]
    ex = float(np.mean([E['cx'] for E in eyes])); ez = float(np.mean([(E['up'].max() + E['lo'].min()) / 2 for E in eyes]))
    ew = float(np.mean([E['a_out'] - E['a_in'] for E in eyes]))
    print('  eye: center ax %.4f z %.4f width %.4f  rest height %.4f  inner z %.4f outer z %.4f' % (ex, ez, ew, np.mean([E['up'].max() - E['lo'].min() for E in eyes]), eyes[0]['z_in'], eyes[0]['z_out']))
    chin_z = float(B[(np.abs(B[:, 0]) < 0.002) & (B[:, 1] > 0.05), 2].min())
    tip_i = np.argmax(np.where(np.abs(B[:, 0]) < 0.002, B[:, 1], -1)); tip_z = float(B[tip_i, 2])
    print('  chin z %.4f  nose tip z %.4f y %.4f' % (chin_z, tip_z, B[tip_i, 1]))
    W_lower = lambda P: warp_lower(P, LOW_ZA, chin_z, D_CHIN, pin(P))
    W_in = lambda P: warp_eye_in(P, ex + 0.002, ez + 0.015, pin(P))
    ex2 = ex - EYE_IN * float(shift_w(np.array([[ex, 0.07, ez]]), ex + 0.002, ez + 0.015)[0])
    bx2 = 0.045 - EYE_IN * float(shift_w(np.array([[0.045, 0.075, ez + 0.036]]), ex + 0.002, ez + 0.015)[0])
    W_brow = lambda P: warp_brow(P, bx2, ez + 0.036, pin(P))
    W_eye = lambda P: warp_eyes(P, ex2, ez, 0.0185, 0.0115, pin(P))
    W_jaw = lambda P: warp_jaw(P, chin_z - D_CHIN, pin(P))
    for nm, fn, box in (('lower', W_lower, ((-0.07, 0.07), (1.37, 1.46), 0.07)), ('eye_in', W_in, ((-0.08, 0.08), (1.44, 1.54), 0.07)), ('brow', W_brow, ((-0.08, 0.08), (1.46, 1.54), 0.075)),
                        ('eye', W_eye, ((-0.08, 0.08), (1.44, 1.51), 0.07)), ('jaw', W_jaw, ((-0.08, 0.08), (1.36, 1.45), 0.06))):
        print('  warp', nm, 'min det J %.3f' % jacobian_check(fn, box))
        if nm in os.environ.get('H01_SKIP', ''): continue
        N = warp_n(f, fn, N)
    # 嘴：下半臉拉長之後量嘴縫
    B = C.co(f); slit = B[classify_loops(f)['mouth']]; zs = float(slit[:, 2].mean())
    W_mouth = lambda P: warp_mouth(P, zs, pin(P))
    print('  warp mouth (slit z %.4f half width %.4f) min det J %.3f' % (zs, np.abs(slit[:, 0]).max(), jacobian_check(W_mouth, ((-0.07, 0.07), (1.39, 1.44), 0.08))))
    # 嘴變寬只動位置、不轉法向量：這個變形是臉平面內的左右拉伸，轉法向量只會在臉頰邊緣出現一圈像法令紋的明暗線（實測）
    if 'mouth' not in os.environ.get('H01_SKIP', ''): C.warp(f, lambda P, _B: W_mouth(P))
    chin_now = float(C.co(f)[(np.abs(C.co(f)[:, 0]) < 0.002) & (C.co(f)[:, 1] > 0.05), 2].min())
    W_nar = lambda P: warp_narrow(P, ez, chin_now, pin(P))
    print('  warp narrow min det J %.3f' % jacobian_check(W_nar, ((-0.09, 0.09), (1.36, 1.56), 0.06)))
    if 'narrow' not in os.environ.get('H01_SKIP', ''): N = warp_n(f, W_nar, N)
    # 3. 表面細節（鼻、唇、下巴）：同一個位移加到所有 shape key；法向量加上「細節造成的幾何法向量變化」
    B = C.co(f); skin_v = np.unique(tris(f, skin)[0])
    tip_i = np.argmax(np.where(np.abs(B[:, 0]) < 0.002, B[:, 1], -1)); tip_z = float(B[tip_i, 2])
    slitL = classify_loops(f)['mouth']; sp = B[slitL]; mw = float(np.abs(sp[:, 0]).max())
    slit_curve = slit_fit(sp)
    chin_z = float(B[(np.abs(B[:, 0]) < 0.002) & (B[:, 1] > 0.05), 2].min())
    prof = smooth_profile(*midline_profile(B, skin_v))
    _sk = os.environ.get('H01_SKIP', ''); _z = lambda P: np.zeros_like(P)
    field = lambda P: ((_z(P) if 'nose' in _sk else nose_field(P, prof, tip_z)) + (_z(P) if 'lip' in _sk else lip_field(P, slit_curve, mw)) + (_z(P) if 'chinf' in _sk else chin_field(P, chin_z)) + (_z(P) if 'cheek' in _sk else cheek_field(P, ez))) * pin(P)[:, None]
    is_skin = np.zeros(len(B), bool); is_skin[skin_v] = True
    Dn = field(B) * is_skin[:, None]
    # 休息時嘴縫有 ~0.7 mm 的縫（會看到後面的牙齒變成一條白線）：上下唇邊緣往中間合起來（只動 Basis 附近的相對位移，張嘴表情照常）
    sx_, sz_ = slit_curve; dsl = B[:, 2] - np.interp(np.abs(B[:, 0]), sx_, sz_)
    gap = float(np.median(np.abs(B[slitL, 2] - np.interp(np.abs(B[slitL, 0]), sx_, sz_))))
    near = np.exp(-(dsl / 0.0015) ** 2) * (1 - ss(mw * 0.9, mw * 1.25, np.abs(B[:, 0]))) * (B[:, 1] > 0.06) * is_skin
    Dn[:, 2] -= np.sign(dsl) * np.minimum(np.abs(dsl), gap) * near
    print('    mouth slit half-gap %.5f m closed' % gap)
    i = int(np.argmax(np.linalg.norm(Dn, axis=1))); print('    detail max %.4f at %s' % (np.linalg.norm(Dn[i]), np.round(B[i], 4)))
    N = np.where(is_skin[:, None], transport_normals(B, lambda P: P + field(P), N), N)
    C.warp(f, lambda P, _B: P + Dn)
    print('  surface detail max %.4f m; mouth half width %.4f; chin z %.4f' % (np.abs(Dn).max(), mw, chin_z))
    # 4. 側面輪廓：下唇、下巴往後收；嘴往下（量好的嘴縫、鼻尖、下巴底）
    B = C.co(f); zs0 = float(np.interp(0.0, slit_curve[0], slit_curve[1]))
    W_ret = lambda P: warp_retract(P, zs0, pin(P))
    W_md = lambda P: warp_mouth_down(P, tip_z, zs0, chin_z, pin(P))
    for nm, fn in (('retract', W_ret), ('mouth_down', W_md)):
        print('  warp %s min det J (3D, vertices) %.3f' % (nm, jacobian_min3(fn, B)))
        if nm in _sk: continue
        N = warp_n(f, fn, N); B = C.co(f)
    tn1, ta1 = tri_normals(f, None); flip = ((tn0 * tn1).sum(1) < 0) & (ta0 > 1e-9)
    print('  folded triangles after all deformations: %d (degenerate before: %d)' % (flip.sum(), (ta0 <= 1e-9).sum()))
    if flip.any():
        TVa, _ = tris(f, None); Pa = C.co(f); nm = mat_names(f); _, _, mia, _ = poly_data(f)
        print('    folded at', np.round(Pa[TVa[flip]].mean(1), 4).tolist())
    # 4. 法向量（嘴下面到下巴先磨平）
    B = C.co(f); zs1 = float(np.interp(0.0, slit_curve[0], slit_curve[1])) - MOUTH_DOWN
    w_sm = ss(zs1 - 0.0025, zs1 - 0.0060, B[:, 2]) * (1 - ss(0.022, 0.034, np.abs(B[:, 0]))) * ss(0.045, 0.060, B[:, 1]) * pin(B)
    N = smooth_normals(f, N, w_sm); print('  smoothed normals below the lower lip: %d vertices' % int((w_sm > 0.01).sum()))
    me.normals_split_custom_set_from_vertices([tuple(v) for v in N])
    # 5. 貼圖
    paint_all(f)
    print('  face done: verts', len(me.vertices), 'tris', sum(len(p.vertices) - 2 for p in me.polygons))
    blink_check(f)


# ---------------- 貼圖 ----------------
def scale_brow_mesh(f, k):
    """眉毛網格以每一邊的中心高度為準上下放大 k 倍（所有 shape key 一起；只動 FaceBrow 的頂點）"""
    mi_ = mat_index(f, 'FaceBrow'); idx = sorted({v for p in f.data.polygons if p.material_index == mi_ for v in p.vertices})
    if not idx: return
    idx = np.array(idx); B0 = C.co(f)
    cz = {sg: float(B0[idx][(B0[idx, 0] > 0) == (sg > 0), 2].mean()) for sg in (1, -1)}
    def fn(P, B):
        P = P.copy(); zc = np.where(B[idx, 0] > 0, cz[1], cz[-1])
        P[idx, 2] = zc + (P[idx, 2] - zc) * k; return P
    C.warp(f, fn)
    print('  brow mesh scaled in z by %.2f (%d vertices)' % (k, len(idx)))


def paint_all(f):
    if BROW_SCALE_Z != 1.0: scale_brow_mesh(f, BROW_SCALE_Z)
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
    paint_eyewhite(f, R, eyes)
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
        zl = np.interp(cx, E['g'], E['lo']); cz = zl + Ri - 0.0002   # 虹膜下緣剛好碰到下眼瞼、上緣被上眼瞼蓋住一些
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
        hl = np.sqrt(((pos[..., 0] - (0.30 * Ri * 1 + (cx if s > 0 else -cx))) / (0.10 * Ri)) ** 2 + ((z - (cz + 0.30 * Ri)) / (0.085 * Ri)) ** 2)
        col = mix(col, [0.97, 0.96, 0.94], (1 - ss(0.7, 1.0, hl)) * 0.9)
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
        th = (0.0005 + 0.0010 * ss(0.0, 0.45, t) + 0.0006 * ss(0.5, 0.95, t)) * EYELINE_K   # 上眼線粗細：內眼角細、眼尾粗
        a_up = ss(-0.0007, -0.0003, du) * (1 - ss(th - 0.00018, th + 0.00018, du)) * ss(-0.03, 0.06, t) * (1 - ss(0.99, 1.04, t))
        # 眼尾：從外眼角往外上延伸 2.6 mm（18°）
        p0 = np.array([E['a_out'] - 0.0012, np.interp(E['a_out'] - 0.0012, E['g'], E['up'])]); ang = math.radians(16)
        p1 = np.array([E['a_out'] + WING * math.cos(ang), E['z_out'] + WING * math.sin(ang) + 0.0005])
        dseg, ts = seg_dist(np.stack([ax, z], -1), p0, p1)
        a_wing = 1 - ss(0.0013 * (1 - ts) * 0.85 + 0.00005, 0.0013 * (1 - ts) * 0.85 + 0.0003, dseg)
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
        for k in range(LASH_N):
            t = 0.18 + 0.86 * k / (LASH_N - 1) + rng.uniform(-0.015, 0.015)
            ax0 = E['a_in'] + t * (E['a_out'] - E['a_in']) if t <= 1 else E['a_out'] + (t - 1) * 0.008
            z0 = np.interp(min(ax0, E['a_out']), E['g'], E['up']) + 0.0005 + (0.0003 * (t - 1) / 0.04 if t > 1 else 0)
            L = (0.0009 + 0.0017 * ss(0.3, 1.0, t)) * LASH_L
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
    col = np.array(BROW_COL); img = np.zeros((H, W, 4)); img[..., :3] = col
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]
        top = E['up'].max()
        b0, bp, b1 = E['a_in'] - 0.0072, E['a_in'] + 0.024, E['a_out'] + 0.0075     # 眉頭、眉峰、眉尾
        zp = top + 0.0160; z0 = zp - 0.0032 * BROW_ARCH; z1 = zp - 0.0046 * BROW_ARCH
        t = np.clip((ax - b0) / (b1 - b0), -0.2, 1.2); tp = (bp - b0) / (b1 - b0)
        zc = np.where(t < tp, z0 + (zp - z0) * np.sin(np.clip(t / tp, 0, 1) * np.pi / 2), zp + (z1 - zp) * (np.clip((t - tp) / (1 - tp), 0, 1) ** 1.6))
        hw = np.where(t < tp, 0.0018 - 0.0003 * (t / tp), 0.0015 * (1 - np.clip((t - tp) / (1 - tp), 0, 1)) ** 1.1 + 0.0001) * BROW_K   # 半粗細
        d = z - zc
        a = (1 - ss(hw - 0.0005, hw + 0.0004, np.abs(d - 0.0002 * (t < tp))))
        a *= ss(-0.03, 0.09, t) * (1 - ss(0.96, 1.03, t))            # 眉頭羽化、眉尾收細
        a *= 0.50 + 0.42 * ss(0.0, 0.30, t)                          # 眉頭淡、眉峰濃
        a *= 1 - 0.28 * ss(-hw, hw, d)                               # 下緣濃、上緣淡（不畫毛流條紋：貼圖解析度低會變成斜條紋）
        img[sel, 3] = np.clip(a * BROW_A, 0, 1)[sel]
    im = C.image_from_array('H01_FaceBrow', np.clip(img, 0, 1)); set_tex(mat, im, white=True, shade=(0.85, 0.82, 0.82))


def paint_eyewhite(f, R, eyes):
    """眼白：乾淨的白（VRoid 原本偏灰褐）、上眼瞼下面一條柔和的陰影、眼頭／眼尾略帶粉"""
    mi_ = mat_index(f, 'EyeWhite'); mat = f.data.materials[mi_]
    remap_uv(f, mi_, [(0.01, 0.02, 0.49, 0.98), (0.51, 0.02, 0.99, 0.98)])
    W, H = 256, 128; pos, mask = raster(f, mi_, W, H, R)
    img = np.ones((H, W, 4)); img[..., :3] = [0.94, 0.92, 0.91]
    for s, E in eyes.items():
        sel = mask & ((pos[..., 0] > 0) == (s > 0))
        ax = np.abs(pos[..., 0]); z = pos[..., 2]; t, du, dl = eye_coords(E, ax, z)
        col = np.zeros(pos.shape) + [0.95, 0.935, 0.925]
        col = mix(col, [0.70, 0.62, 0.60], (1 - ss(0.0, 0.0018, -du)) * 0.8)        # 上眼瞼的影子
        col = mix(col, [0.90, 0.78, 0.77], (1 - ss(0.0, 0.16, t)) * 0.5)            # 眼頭
        col = mix(col, [0.85, 0.79, 0.77], ss(0.82, 1.0, t) * 0.45)                 # 眼尾
        img[sel, :3] = col[sel]
    img[..., :3] = dilate_into(img[..., :3], mask)
    im = C.image_from_array('H01_EyeWhite', np.clip(img, 0, 1)); set_tex(mat, im, white=True)


def paint_skin(f, R, eyes, loops):
    skin = mat_index(f, 'Face_00_SKIN'); mat = f.data.materials[skin]; e = mat.vrm_addon_extension.mtoon1
    src = e.pbr_metallic_roughness.base_color_texture.index.source
    base = img_array(src); H, W = base.shape[:2]
    out = base.copy()
    # (a) VRoid 畫在貼圖上的五官記號拿掉（換成「排除記號後」模糊的底色）：眼睛內側上方的「^」、鼻尖的小線、嘴巴的紅線和下面的白點
    #     （鼻子、嘴唇現在是幾何＋下面重畫的唇形，舊記號的位置和新形狀對不上）
    bl = blur(base, 10); dev = np.abs(base[..., :3] - bl[..., :3]).max(-1)
    reg = np.zeros((H, W), bool)
    for r0, r1, c0, c1 in ((0.462, 0.50, 0.365, 0.44), (0.462, 0.50, 0.56, 0.635), (0.62, 0.70, 0.47, 0.53), (0.735, 0.79, 0.43, 0.57)):
        reg[int(r0 * H):int(r1 * H), int(c0 * W):int(c1 * W)] = True
    mk = blur((reg & (dev > 0.025)).astype(float), 3) > 0.02
    keep = (~mk).astype(float)[..., None]
    bl2 = blur(base * keep, 14) / np.maximum(blur(keep, 14), 1e-3)
    wk = np.clip(blur(mk.astype(float), 2) * 1.5, 0, 1)[..., None]       # 邊緣羽化，不留補丁的邊
    out[..., :3] = out[..., :3] * (1 - wk) + bl2[..., :3] * wk
    pos, mask = raster(f, skin, W, H, R)
    ax = np.abs(pos[..., 0]); x = pos[..., 0]; z = pos[..., 2]; y = pos[..., 1]
    rgb = out[..., :3]
    # (a2) 眼睛周圍的粉紅色調拿掉（保留明暗，顏色換成臉頰的膚色）：男生的 VRoid 貼圖眼周偏粉，看起來像畫了眼影
    if EYE_TINT_K > 0 or CHEEK_TINT_K > 0:
        lw = np.array([0.299, 0.587, 0.114]); lum = rgb @ lw
        ez_ = float(np.mean([E['up'].max() for E in eyes.values()]))
        ck = mask & (y > 0.05) & (ax > 0.018) & (ax < 0.040) & (z < ez_ - 0.016) & (z > ez_ - 0.030)
        fh = mask & (y > 0.05) & (ax < 0.024) & (z > ez_ + 0.030) & (z < ez_ + 0.048)       # 額頭（沒有腮紅、眼影）：女性樣本的臉頰有腮紅，不能當參考
        ref = fh if (CHEEK_TINT_K > 0 and fh.sum() > 20) else ck
        if ref.sum() > 20:
            med = np.median(rgb[ref], axis=0); tgt = lum[..., None] * (med / max(float(med @ lw), 1e-3))
            if CHEEK_TINT_K > 0:
                # 第二版（2026-10-10 林芷若第七版）：第一版把腮紅中心換成「同亮度、額頭色相」——粉紅色的亮度比膚色低，換完變成一塊灰藍色，
                # 而且橢圓只蓋到腮紅中心，外圈的粉紅還在。改成：在臉頰範圍內，比額頭更紅的像素才算腮紅，
                # 用周圍「不是腮紅」的皮膚模糊補上（亮度、色相都跟著周圍走）。
                redn = (rgb[..., 0] - rgb[..., 1]) - float(med[0] - med[1])
                area = np.zeros(lum.shape)
                for s_ in (1, -1):
                    E0 = eyes[s_]; cxc = (E0['a_in'] + E0['a_out']) / 2 + 0.004; czc = (E0['up'].max() + E0['lo'].min()) / 2 - 0.020
                    dc = np.sqrt(((ax - cxc) / 0.034) ** 2 + ((z - czc) / 0.026) ** 2)
                    area = np.maximum(area, (1 - ss(0.65, 1.0, dc)) * mask * ((x > 0) == (s_ > 0)))
                bm = area * ss(0.008, 0.045, redn)
                keep = (mask & (bm < 0.04)).astype(float)
                fill = blur(rgb * keep[..., None], 40) / np.maximum(blur(keep, 40), 1e-4)[..., None]
                rgb[:] = mix(rgb, fill, np.clip(bm * CHEEK_TINT_K * 1.25, 0, 1))
                print('  cheek blush removed (forehead skin %s, blush px %d)' % (np.round(med, 3), int((bm > 0.5).sum())))
            for s, E in eyes.items():
                cx = (E['a_in'] + E['a_out']) / 2; cz = (E['up'].max() + E['lo'].min()) / 2
                de = np.sqrt(((ax - cx) / 0.021) ** 2 + ((z - cz) / 0.0135) ** 2)
                w = (1 - ss(0.65, 1.0, de)) * EYE_TINT_K * mask * ((x > 0) == (s > 0))
                if EYE_TINT_K > 0: rgb[:] = mix(rgb, tgt, w)
            if EYE_TINT_K > 0: print('  eye tint removed (reference skin %s)' % np.round(med, 3))
    # (b) 雙眼皮線（末廣型：內眼角窄、往外變寬）＋下眼瞼淡淡的陰影
    for s, E in eyes.items():
        sel = mask & ((x > 0) == (s > 0)) & (y > 0.03)
        t, du, dl = eye_coords(E, ax, z)
        th = 0.0005 + 0.0010 * ss(0.0, 0.45, t) + 0.0006 * ss(0.5, 0.95, t)          # = paint_eyeline 的上眼線粗細
        off = th + 0.0007 + 0.0008 * ss(0.1, 0.7, t)                                  # 雙眼皮線在眼線上方 0.7～1.5 mm
        a = 0.55 * ss(0.08, 0.35, t) * (1 - ss(0.92, 1.1, t)) * (1 - ss(0.00014, 0.00036, np.abs(du - off)))
        rgb[sel] = mix(rgb[sel], [0.62, 0.42, 0.38], a[sel])
        a2 = 0.16 * ss(0.15, 0.4, t) * (1 - ss(0.95, 1.08, t)) * ss(-0.0002, 0.0002, dl) * (1 - ss(0.0006, 0.0018, dl))
        rgb[sel] = mix(rgb[sel], [0.78, 0.55, 0.50], a2[sel])
    # (c) 嘴唇
    B = C.co(f); sp = R[loops['mouth']]; mw = float(np.abs(sp[:, 0]).max()); sg, sz = slit_fit(sp)
    zs = np.interp(ax, sg, sz); d = z - zs; zs0 = float(np.interp(0.0, sg, sz))
    xn = np.clip(ax / (mw * 1.06), 0, 1.5)
    bow = 1 - 0.20 * np.exp(-(x / 0.0016) ** 2) + 0.05 * np.exp(-((ax - 0.0042) / 0.0022) ** 2)
    hu = 0.0049 * np.clip(1 - xn ** 2.4, 0, 1) ** 0.55 * bow
    hl = 0.0068 * np.clip(1 - xn ** 2.0, 0, 1) ** 0.6
    a_u = (1 - ss(hu - 0.00035, hu + 0.00025, d)) * (d >= -0.0001)
    a_l = (1 - ss(hl - 0.0005, hl + 0.0004, -d)) * (d < 0.0001)
    a = np.maximum(a_u, a_l) * (1 - ss(0.96, 1.12, xn)) * (y > 0.06) * (np.abs(d) < 0.01)
    lip_out = np.array(LIP_OUT); lip_in = np.array(LIP_IN); lip_hi = np.array(LIP_HI)
    col = mix(lip_out, lip_in, (1 - ss(0.0, 0.0024, np.abs(d))) * 0.85)
    col = mix(col, lip_hi, np.exp(-((ax / 0.0055) ** 2 + ((d + 0.0029) / 0.0011) ** 2)) * 0.55)
    col = mix(col, [0.55, 0.27, 0.29], (1 - ss(0.0, 0.00045, np.abs(d))) * (1 - ss(0.85, 1.0, xn)))   # 嘴縫
    sel = mask & (a > 0.001)
    rgb[sel] = mix(rgb[sel], col[sel], (a * LIP_A)[sel])
    # 嘴角：往上的一點小陰影（表情柔和）
    for sgn in (1, -1):
        dc = np.sqrt(((x - sgn * mw * 1.02) / 0.0012) ** 2 + ((z - (np.interp(mw, sg, sz) + 0.0003)) / 0.0007) ** 2)
        sel = mask & (y > 0.06)
        rgb[sel] = mix(rgb[sel], [0.74, 0.50, 0.47], ((1 - ss(0.5, 1.0, dc)) * 0.18)[sel])
    # (d) 鼻孔、鼻下陰影、鼻翼溝
    mid = (np.abs(B[:, 0]) < 0.002); tip_i = np.argmax(np.where(mid, R[:, 1], -1)); tip = R[tip_i]
    for sgn in (1, -1):
        cxn, czn = sgn * 0.0040, tip[2] - 0.0043
        rx, rz = (x - cxn), (z - czn); c, s_ = math.cos(math.radians(22 * sgn)), math.sin(math.radians(22 * sgn))
        u_, v_ = rx * c + rz * s_, -rx * s_ + rz * c
        dn = np.sqrt((u_ / 0.0013) ** 2 + (v_ / 0.0007) ** 2)
        sel = mask & (y > 0.07)
        rgb[sel] = mix(rgb[sel], [0.66, 0.43, 0.40], ((1 - ss(0.4, 1.0, dn)) * 0.40)[sel])
    sel = mask & (y > 0.07)
    dsub = np.sqrt((x / 0.0055) ** 2 + ((z - (tip[2] - 0.0058)) / 0.0018) ** 2)
    rgb[sel] = mix(rgb[sel], [0.82, 0.60, 0.55], ((1 - ss(0.4, 1.0, dsub)) * 0.18)[sel])
    out[..., :3] = np.clip(dilate_into(rgb, mask), 0, 1); out[..., 3] = 1
    im = C.image_from_array('H01_Face_00', out.astype(np.float32))
    set_tex(mat, im)
    # 描邊寬度貼圖：嘴巴以下（下巴、下顎）描邊變細
    mt = e.extensions.vrmc_materials_mtoon; osrc = mt.outline_width_multiply_texture.index.source
    if osrc is not None:
        ob = img_array(osrc); oh, ow = ob.shape[:2]; opos, omask = raster(f, skin, ow, oh, R)
        jaw = (1 - ss(zs0 - 0.012, zs0 - 0.002, opos[..., 2])) * omask
        ob[..., :3] *= (1 - (1 - JAW_OUTLINE) * jaw)[..., None]
        mt.outline_width_multiply_texture.index.source = C.image_from_array('H01_Face_00_out', np.clip(ob, 0, 1).astype(np.float32))
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
