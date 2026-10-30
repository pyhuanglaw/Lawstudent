#!/usr/bin/env python3
"""祐廷的經濟系系外套（X140 SK02-LINE-JACKET-1030，LAWWW2-B 2026-10-30）。

使用者 10-30：「我選了穿去霖澤上課 結果我的衣服在遊戲裡面也沒換」→ LAWWW-B 派工：
  祐廷的 VRM 多一件外套網格 JACKET_ECON（同一副骨架），遊戲預設藏起來，劇情選「穿去上課」時才顯示。
  胸前小字「首都帝大 經濟」、背後「CIU ECON」（docs/WORLD_NAMING.md 3-2：紀念品上的字可以縮寫）；不能有臺大、NTU、真實校徽。

做法（在 char_polish.py 精修過的 vroid_yuting.vrm 上加，不重建人物）：
  1. 上衣（Tops）那一份網格複製一份，每個點往外推 OFFSET（同一組骨頭權重：動起來外套和上衣一起變形，彎手肘、坐下都隔著同樣的距離，不會穿模）。
     上衣下襬、袖口本來就是反摺的雙層（只有領口一圈是開口）：反摺朝內的那一層也往「身體外面」推，不是照它自己朝內的法向。
  2. 領口那一圈往上長一圈立領（3 cm，上緣往內摺回來，看起來有厚度）。
  3. 貼圖：上衣貼圖的皺褶明暗換成深藍；下襬、袖口、領子是羅紋＋兩條米白細線；前面中間一條拉鍊；字用 3D 位置投影畫上去
     （上衣的 UV 背後中線是接縫，字跨過接縫也接得起來）。
  4. 新的節點 JACKET_ECON（網格名稱也是 JACKET_ECON），材質 J00_Tops_JacketEcon_CLOTH（名稱含 _CLOTH、Tops：遊戲的衣服壓暗、邊緣光照上衣的規則）。

用法：python3 tools/jacket_econ.py [--in assets/models/char/vroid_yuting.vrm] [--out 同一個檔] [--tex 另存貼圖.png]
  已經有 JACKET_ECON 的檔案會先拿掉舊的再加（可以重複跑）。重建 vroid_yuting.vrm（vroid_build.py → char_polish.py）以後要再跑一次。
"""
import os, sys, json, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from collections import defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vroid_build as VB

ROOT = VB.ROOT
NAME = 'JACKET_ECON'
MAT = 'J00_Tops_JacketEcon_CLOTH'
OFFSET = 0.013                    # 外套離上衣（公尺）
EXTEND = 0.014                    # 袖口、下襬比上衣長多少
NECK_RX, NECK_RZ, NECK_CZ = 0.092, 0.062, 0.003            # 立領上緣那一圈（脖子皮膚在 Neck 骨頭上 2 cm 量：x ±0.064、z −0.036～0.038；留約 2.5 cm）
COLLAR_TOP_FRONT, COLLAR_TOP_BACK, COLLAR_FOLD = 0.004, 0.022, 0.012   # 立領上緣比 Neck 骨頭高多少（前低後高；下巴最低在 1.496，前面上緣 1.46）、往內摺回來的長度
NAVY, RIB, LINE = '#2e3a58', '#232c44', '#e8e3d6'
TEXT, ZIP_TAPE, ZIP_TEETH = '#ece8dc', '#1e2538', '#8e929b'
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
LATIN = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
SWATCH = (0.36, 0.005, 0.64, 0.075)   # 領子用的貼圖區（上衣 UV 裡帽子拿掉後空出來的地方；跑的時候會檢查沒有別的三角形用到）


def tops_prim(v):
    for m in v.j['meshes']:
        if not m['name'].startswith('Body'): continue
        for p in m['primitives']:
            if 'Tops' in v.j['materials'][p['material']]['name']: return p
    raise KeyError('Tops')


def remove_old(v):
    """已經有 JACKET_ECON 的檔案（重跑）：拿掉節點、網格、材質、貼圖。這幾樣都是 build() 最後加上去的，所以都在陣列的最後面，直接拿掉、不用重排其他索引。"""
    j = v.j; vm = j['extensions']['VRM']
    ni = next((i for i, n in enumerate(j['nodes']) if n.get('name') == NAME), None)
    if ni is None: return
    mi = j['nodes'][ni]['mesh']; mat = j['meshes'][mi]['primitives'][0]['material']
    ti = j['materials'][mat]['pbrMetallicRoughness']['baseColorTexture']['index']; ii = j['textures'][ti]['source']
    last = (ni == len(j['nodes']) - 1, mi == len(j['meshes']) - 1, mat == len(j['materials']) - 1, ti == len(j['textures']) - 1, ii == len(j['images']) - 1)
    assert all(last), ('JACKET_ECON 不在最後面，不能直接拿掉：改從沒有外套的 vroid_yuting.vrm 重跑（vroid_build.py → char_polish.py）', last)
    for sc in j['scenes']: sc['nodes'] = [x for x in sc['nodes'] if x != ni]
    fp = vm.get('firstPerson', {})
    if 'meshAnnotations' in fp: fp['meshAnnotations'] = [m for m in fp['meshAnnotations'] if m.get('mesh') != mi]
    pr = j['meshes'][mi]['primitives'][0]; accs = sorted(list(pr['attributes'].values()) + [pr['indices']])
    assert accs == list(range(len(j['accessors']) - len(accs), len(j['accessors']))), ('JACKET_ECON 的 accessor 不在最後面', accs)
    del j['accessors'][accs[0]:]
    j['nodes'].pop(); j['meshes'].pop(); j['materials'].pop(); vm['materialProperties'].pop(); j['textures'].pop(); j['images'].pop()
    print('  removed old', NAME)


def weld(P, eps=2e-4):
    _, wid = np.unique(np.round(P / eps).astype(np.int64), axis=0, return_inverse=True)
    return wid.reshape(-1)


def bone_axis_dir(P, v):
    """每個點「往身體外面」的方向：軀幹＝離脊椎垂直軸、袖子＝離上臂到手的那條線。"""
    J = {k: VB.joint_world(v, k)[:3, 3] for k in ('L_UpperArm', 'L_Hand', 'R_UpperArm', 'R_Hand', 'C_Chest')}
    out = np.zeros_like(P)
    for i, p in enumerate(P):
        side = 'L' if p[0] < 0 else 'R'
        a, b = J[side + '_UpperArm'], J[side + '_Hand']
        if abs(p[0]) > abs(a[0]) + 0.06:     # 袖子
            t = np.clip(np.dot(p - a, b - a) / np.dot(b - a, b - a), 0, 1); c = a + t * (b - a)
        else:
            c = np.array([0.0, p[1], J['C_Chest'][2]])
        d = p - c; out[i] = d / max(1e-6, np.linalg.norm(d))
    return out


def loop_order(adj, start):
    order = [start]; prev = None; cur = start
    while True:
        nxt = [x for x in adj[cur] if x != prev]
        if not nxt or nxt[0] == start: break
        prev, cur = cur, nxt[0]; order.append(cur)
    return order


def raster(UVt, At, size):
    """三角形畫到貼圖空間，每個像素內插頂點的屬性 At（三角形數×3×K：3D 位置、法向、離開口的距離）；後畫的蓋前面的。邊緣多畫一點點，接縫不露底色。"""
    W, H = size; K = At.shape[2]; AA = np.zeros((H, W, K)); M = np.zeros((H, W), bool)
    for uv, A in zip(UVt, At):
        uv = uv * [W, H]; x0, y0 = np.floor(uv.min(0)).astype(int) - 1; x1, y1 = np.ceil(uv.max(0)).astype(int) + 1
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W - 1), min(y1, H - 1)
        if x1 < x0 or y1 < y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        (ax, ay), (bx, by), (cx, cy) = uv; d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(d) < 1e-12: continue
        l0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / d; l1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / d; l2 = 1 - l0 - l1
        ins = (l0 >= -0.04) & (l1 >= -0.04) & (l2 >= -0.04)
        if not ins.any(): continue
        L = np.stack([l0[ins], l1[ins], l2[ins]], 1)
        yy, xx = (gy[ins] - 0.5).astype(int), (gx[ins] - 0.5).astype(int)
        AA[yy, xx] = L @ A; M[yy, xx] = True
    return AA, M


def edge_dist(a, ang, edge_is_max, tol=0.025):
    """開口邊緣（袖口、下襬）不是一條直線：取最靠邊緣那一圈的點（離最外面 tol 以內），照角度線性內插出邊緣 → 每個點離邊緣多遠。"""
    ext = a.max() if edge_is_max else a.min()
    ring = np.abs(a - ext) < tol
    o = np.argsort(ang[ring]); ra, rv = ang[ring][o], a[ring][o]
    edge = np.interp(ang, ra, rv, period=2 * np.pi)
    return (edge - a) if edge_is_max else (a - edge)


def text_img(lines, px_per_m, box_w):
    """lines: [(字, 字型, 字高 m)] 由上往下 → 白字在透明底（灰階 alpha）、圖的寬＝box_w 公尺；回傳 (alpha, 高度 m)。"""
    W = int(box_w * px_per_m); rows = []
    for s, font, h in lines:
        f = ImageFont.truetype(font, max(8, int(h * px_per_m * 1.25)))
        x0, y0, x1, y1 = f.getbbox(s); im = Image.new('L', (W, int((y1 - y0) * 1.25) + 4), 0)
        ImageDraw.Draw(im).text(((W - (x1 - x0)) / 2 - x0, 2 - y0), s, fill=255, font=f)
        rows.append(im)
    H = sum(r.size[1] for r in rows); out = Image.new('L', (W, H), 0); y = 0
    for r in rows: out.paste(r, (0, y)); y += r.size[1]
    return np.asarray(out).astype(np.float64) / 255, H / px_per_m


def sample(alpha, s, t):
    H, W = alpha.shape; ok = (s >= 0) & (s < 1) & (t >= 0) & (t < 1)
    out = np.zeros(s.shape)
    xi = np.clip((s * W).astype(int), 0, W - 1); yi = np.clip((t * H).astype(int), 0, H - 1)
    out[ok] = alpha[yi[ok], xi[ok]]
    return out


def build(v, tex_out=None):
    j = v.j
    remove_old(v)
    p = tops_prim(v); A = p['attributes']
    idx = v.acc(p['indices']).astype(np.int64).reshape(-1, 3)
    used, inv = np.unique(idx, return_inverse=True); T = inv.reshape(-1, 3)
    P = v.acc(A['POSITION']).astype(np.float64)[used]; N = v.acc(A['NORMAL']).astype(np.float64)[used]
    UV = v.acc(A['TEXCOORD_0']).astype(np.float64)[used]
    Jn = v.acc(A['JOINTS_0']).astype(np.int64)[used]; Wt = v.acc(A['WEIGHTS_0']).astype(np.float64)[used]
    N /= np.maximum(1e-8, np.linalg.norm(N, axis=1, keepdims=True))
    # 1. 往外推：反摺朝內的那一層（法向朝身體）也往外；同一個位置的點（UV 接縫、反摺邊）一起動
    out_dir = bone_axis_dir(P, v)
    No = np.where((np.sum(N * out_dir, 1) < 0)[:, None], -N, N)
    wid = weld(P); nw = wid.max() + 1
    acc = np.zeros((nw, 3)); np.add.at(acc, wid, No)
    Dn = acc[wid]; Dn /= np.maximum(1e-8, np.linalg.norm(Dn, axis=1, keepdims=True))
    # 離開口的距離（袖口沿著手臂量、下襬往上量）
    J = {k: VB.joint_world(v, k)[:3, 3] for k in ('L_Hand', 'R_Hand', 'L_UpperArm', 'R_UpperArm')}
    is_sl = np.abs(P[:, 0]) > abs(J['L_UpperArm'][0]) + 0.06
    dedge = np.full(len(P), 9.0); edir = np.zeros_like(P); edir[:, 1] = -1.0
    for sd in 'LR':
        a0, a1 = J[sd + '_UpperArm'], J[sd + '_Hand']; ax = (a1 - a0) / np.linalg.norm(a1 - a0)
        m = is_sl & ((P[:, 0] < 0) if sd == 'L' else (P[:, 0] > 0))
        q = P[m] - a0; al = q @ ax; perp = q - al[:, None] * ax[None, :]
        e1 = np.cross(ax, [0, 0, 1.0]); e1 /= np.linalg.norm(e1); e2 = np.cross(ax, e1)
        dedge[m] = edge_dist(al, np.arctan2(perp @ e2, perp @ e1), True); edir[m] = ax
    m = ~is_sl
    dedge[m] = edge_dist(P[m, 1], np.arctan2(P[m, 0], P[m, 2] - P[m, 2].mean()), False)
    # 開口往外多長一點（袖口沿手臂、下襬往下）：只往外推的話外套的袖口、下襬比上衣短一點，底下露出一圈灰色上衣（第二版截圖）
    ext = EXTEND * np.clip(1 - dedge / 0.03, 0, 1)
    PJ = P + Dn * OFFSET + edir * ext[:, None]
    # 2. 立領：領口那一圈（焊接後唯一的邊界）
    E = defaultdict(int)
    for t in wid[T]:
        for a, b in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            if a != b: E[(min(a, b), max(a, b))] += 1
    adj = defaultdict(list)
    for (a, b), c in E.items():
        if c == 1: adj[a].append(b); adj[b].append(a)
    rep = {}
    for i in range(len(P)): rep.setdefault(wid[i], i)
    loops = []; seen = set()
    for s in adj:
        if s in seen: continue
        lp = loop_order(adj, s); seen.update(lp); loops.append(lp)
    neck = max(loops, key=lambda lp: np.mean([P[rep[w]][1] for w in lp]))
    assert len(loops) == 1 and len(neck) > 20, ('預期上衣只有領口一個開口', [len(x) for x in loops])
    L = np.array([rep[w] for w in neck])
    cz = PJ[L, 2].mean()
    phi = np.arctan2(PJ[L, 0], (PJ[L, 2] - cz))            # 0＝背後中間（+z），接縫放在背後
    k0 = int(np.argmin(np.abs(phi))); L = np.roll(L, -k0); phi = np.roll(phi, -k0)
    if np.mean(np.diff(np.unwrap(phi))) < 0: L = np.concatenate([L[:1], L[1:][::-1]])
    L = np.concatenate([L, L[:1]])                         # 頭尾重複一點：貼圖不從 1 跳回 0
    s = np.linspace(0, 1, len(L))
    base = PJ[L]
    # 原本的圓領開口很寬（左右各到肩膀上 ±0.19 m）：直接往上長會變成肩膀上兩片翅膀。
    # 立領的上緣改成貼著脖子的一圈橢圓（離皮膚約 2 cm），開口到上緣中間多一圈往上拱，像拉鍊拉到頂的運動外套領子。
    yN = VB.joint_y(v, 'Neck')
    ph = np.arctan2(base[:, 0], base[:, 2] - NECK_CZ)        # 0＝背後
    back = 0.5 + 0.5 * np.cos(ph)                            # 背後 1、前面 0
    top = np.stack([NECK_RX * np.sin(ph), yN + COLLAR_TOP_FRONT + (COLLAR_TOP_BACK - COLLAR_TOP_FRONT) * back, NECK_CZ + NECK_RZ * np.cos(ph)], 1)
    top[:, 1] = np.maximum(top[:, 1], base[:, 1] + 0.012)
    mid = base * 0.45 + top * 0.55; mid[:, 1] += 0.004
    inward = np.stack([-top[:, 0], np.zeros(len(L)), -(top[:, 2] - NECK_CZ)], 1)
    inward /= np.maximum(1e-8, np.linalg.norm(inward, axis=1, keepdims=True))
    fold = top - np.array([0, COLLAR_FOLD, 0]) + inward * 0.004
    rings = [base, mid, top, fold]; nring = len(L)
    u0, v0, u1, v1 = SWATCH
    ring_v = [v1, v0 + (v1 - v0) * 0.55, v0 + (v1 - v0) * 0.2, v0]
    CP = np.concatenate(rings)
    ct = []
    for r in range(len(rings) - 1):
        for i in range(nring - 1):
            a_, b_, c_, d_ = r * nring + i, r * nring + i + 1, (r + 1) * nring + i, (r + 1) * nring + i + 1
            ct += [(a_, b_, d_), (a_, d_, c_)]
    ct = np.array(ct)
    # 法向：照三角形算（面積加權），朝外（前三圈）／朝脖子（往內摺的那一圈）
    fn = np.cross(CP[ct[:, 1]] - CP[ct[:, 0]], CP[ct[:, 2]] - CP[ct[:, 0]])
    CN = np.zeros_like(CP); np.add.at(CN, ct.reshape(-1), np.repeat(fn, 3, 0))
    outw = np.concatenate([-inward] * len(rings)); flip = np.sum(CN * outw, 1) < 0
    CN[flip] *= -1; CN[-nring:] = inward + [0, -0.3, 0]
    CN /= np.maximum(1e-8, np.linalg.norm(CN, axis=1, keepdims=True))
    CUV = np.concatenate([np.stack([u0 + (u1 - u0) * s, np.full(nring, rv)], 1) for rv in ring_v])
    CJ = np.concatenate([Jn[L]] * len(rings)); CW = np.concatenate([Wt[L]] * len(rings))
    CT = ct + len(P)
    # 3. 貼圖
    mi_t = p['material']
    src_img = v.get_image(v.image_of_tex(v.vrm_mat(mi_t)['textureProperties']['_MainTex']))
    W, H = src_img.size
    # 領子用的貼圖區不能有上衣的三角形
    occ = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(occ)
    for t in T: dr.polygon([tuple(UV[i] * [W, H]) for i in t], fill=255)
    o = np.asarray(occ)[int(v0 * H):int(v1 * H) + 1, int(u0 * W):int(u1 * W) + 1]
    assert o.max() == 0, '領子貼圖區和上衣的三角形重疊：換 SWATCH'
    base_img = VB.recolor(src_img, NAVY, strength=1.0, keep_detail=0.8)
    a = np.asarray(base_img).astype(np.float64) / 255
    lum = np.asarray(src_img.convert('L')).astype(np.float64) / 255
    med = np.median(lum[np.asarray(occ) > 0]); detail = np.clip(1 + (lum / med - 1) * 0.8, 0.7, 1.15)[..., None]
    AT = np.concatenate([PJ[T], Dn[T], dedge[T][..., None]], 2)
    AA, M = raster(UV[T], AT, (W, H)); PP, NN, DE = AA[..., :3], AA[..., 3:6], AA[..., 6]
    rgb = a[..., :3]
    def paint(mask, col, alpha=1.0):
        c = VB.hexrgb(col)[None, None, :] * detail; w = (np.clip(mask, 0, 1) * alpha)[..., None]
        rgb[:] = rgb * (1 - w) + c * w
    X, Y, Z = PP[..., 0], PP[..., 1], PP[..., 2]
    hem_y = P[:, 1].min(); cuff_x = np.abs(P[:, 0]).max()
    sleeve = M & (np.abs(X) > abs(J['L_UpperArm'][0]) + 0.06)
    hem = M & ~sleeve & (DE < 0.05)
    cuff = sleeve & (DE < 0.05)
    ang_body = np.arctan2(X, Z); ang_arm = np.arctan2(Z, Y - J['L_Hand'][1])
    ribs = lambda ang, n: 0.86 + 0.14 * (0.5 + 0.5 * np.cos(ang * n))
    paint(hem, RIB); rgb[hem] *= ribs(ang_body, 180)[hem][:, None]
    paint(cuff, RIB); rgb[cuff] *= ribs(ang_arm, 70)[cuff][:, None]
    # 兩條米白細線（下襬、袖口羅紋中間）
    for d0 in (0.020, 0.028):
        paint((hem | cuff) & (np.abs(DE - d0) < 0.0022), LINE)
    # 拉鍊：前面中間（拉鍊布帶＋鍊齒）
    front = M & ~sleeve & (Z < 0) & (NN[..., 2] < -0.3)
    zt = front & (np.abs(X) < 0.0075) & (DE > 0.003)
    paint(zt, ZIP_TAPE)
    teeth = zt & (np.abs(X) < 0.0032) & (np.mod(Y, 0.0042) < 0.0026)
    paint(teeth, ZIP_TEETH)
    # 字（3D 投影：正面看過去，胸前在祐廷的左胸＝−x、看的人的右邊）
    ppm = 2600
    al, th = text_img([('首都帝大 經濟', CJK, 0.0125)], ppm, 0.105)
    cx, cy = -0.083, 1.335
    sx = (cx + 0.105 / 2 - X) / 0.105; ty = (cy + th / 2 - Y) / th
    paint((front & (X < -0.015)) * sample(al, sx, ty), TEXT)
    back = M & ~sleeve & (Z > 0) & (NN[..., 2] > 0.2)
    al2, th2 = text_img([('CIU', LATIN, 0.030), ('ECON', LATIN, 0.052)], ppm, 0.22)   # 寬 22 cm 以內：背後的平面上（第一版 30 cm，N 繞到側面）
    bcy = 1.275
    sx2 = (X + 0.11) / 0.22; ty2 = (bcy + th2 / 2 - Y) / th2
    paint(back * sample(al2, sx2, ty2), TEXT)
    # 領子貼圖區：羅紋、拉鍊延伸上來
    sw = np.zeros((H, W), bool); sw[int(v0 * H) - 2:int(v1 * H) + 3, int(u0 * W) - 2:int(u1 * W) + 3] = True
    uu = (np.arange(W)[None, :] + 0.5) / W; vv = (np.arange(H)[:, None] + 0.5) / H
    detail[sw] = 1.0
    paint(sw, RIB)
    rib_u = 0.86 + 0.14 * (0.5 + 0.5 * np.cos((uu - u0) / (u1 - u0) * 2 * np.pi * 90))
    rgb[sw] *= np.broadcast_to(rib_u, (H, W))[sw][:, None]
    s_front = 0.5                                           # 領口那一圈從背後中間繞一圈，0.5＝正前方
    uf = u0 + (u1 - u0) * s_front
    zsw = sw & (np.abs(uu - uf) < 0.004)
    paint(zsw, ZIP_TAPE); paint(zsw & (np.abs(uu - uf) < 0.0017) & (np.mod(vv * H, 3) < 1.8), ZIP_TEETH)
    pull = sw & (np.abs(uu - uf) < 0.0035) & (vv > v0 + (v1 - v0) * 0.15) & (vv < v0 + (v1 - v0) * 0.55)
    paint(pull, '#c9ccd2')
    a[..., :3] = np.clip(rgb, 0, 1); a[..., 3] = 1.0
    img = Image.fromarray((a * 255).astype(np.uint8), 'RGBA')
    if tex_out: img.save(tex_out)
    # 4. 材質、網格、節點
    smat = json.loads(json.dumps(j['materials'][mi_t])); svm = json.loads(json.dumps(v.vrm_mat(mi_t)))
    ti = v.add_image(img, NAME); v.set_image(v.image_of_tex(ti), img.convert('RGB'), 'JPEG')
    smat['name'] = svm['name'] = MAT
    smat['pbrMetallicRoughness']['baseColorTexture']['index'] = ti
    svm['textureProperties']['_MainTex'] = ti; svm['textureProperties']['_ShadeTexture'] = ti
    svm['vectorProperties']['_ShadeColor'] = [0.62, 0.66, 0.8, 1]
    j['materials'].append(smat); j['extensions']['VRM']['materialProperties'].append(svm); new_mi = len(j['materials']) - 1
    allP = np.concatenate([PJ, CP]); allN = np.concatenate([N, CN]); allUV = np.concatenate([UV, CUV])
    allJ = np.concatenate([Jn, CJ]); allW = np.concatenate([Wt, CW]); allT = np.concatenate([T, CT])
    prim = {'attributes': {'POSITION': v.add_acc(allP.astype(np.float32), 5126, 'VEC3', 34962, True),
                           'NORMAL': v.add_acc(allN.astype(np.float32), 5126, 'VEC3', 34962),
                           'TEXCOORD_0': v.add_acc(allUV.astype(np.float32), 5126, 'VEC2', 34962),
                           'JOINTS_0': v.add_acc(allJ.astype(np.uint16), 5123, 'VEC4', 34962),
                           'WEIGHTS_0': v.add_acc(allW.astype(np.float32), 5126, 'VEC4', 34962)},
            'indices': v.add_acc(allT.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963), 'material': new_mi, 'mode': 4}
    j['meshes'].append({'name': NAME, 'primitives': [prim]})
    bni, bnode = v.mesh_node('Body')
    j['nodes'].append({'name': NAME, 'mesh': len(j['meshes']) - 1, 'skin': bnode['skin']})
    j['scenes'][j.get('scene', 0)]['nodes'].append(len(j['nodes']) - 1)
    fp = j['extensions']['VRM'].get('firstPerson', {})
    if 'meshAnnotations' in fp: fp['meshAnnotations'].append({'mesh': len(j['meshes']) - 1, 'firstPersonFlag': 'Auto'})
    return dict(verts=len(allP), tris=len(allT), collar_ring=nring, hem_y=round(float(hem_y), 3), tex=img.size)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', default=os.path.join(ROOT, 'assets/models/char/vroid_yuting.vrm'))
    ap.add_argument('--out', default=None); ap.add_argument('--tex', default=None)
    a = ap.parse_args()
    v = VB.VRM(a.inp)
    print(NAME, build(v, a.tex))
    n = v.save(a.out or a.inp)
    print('saved', a.out or a.inp, round(n / 1e6, 2), 'MB')
