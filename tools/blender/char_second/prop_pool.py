"""法律系同學二十位（AA_498、src/data/pool_story.js 的 PEOPLE）＋麵店阿姨（heroine_circle.js hc_ayi）的隨身道具 → GLB
（NPC-POOL-ART-1028，LAWWW2-C 2026-10-28；Blender 5.2，bpy 無介面）。
D99 人物美術凍結：這裡只做「配件」（使用者：「做好的就放進去」）；衣服（系服、系學會外套、格子襯衫、藍白拖）、動作（趴著睡）不做。
沒有牌子、商標、真的社團名字（D77）。

用法：
  1. 量身體（掛脖子的相機背帶、名牌掛繩要貼著那一位的身體；只有換底模才要重量）→ tools/blender/char_second/prop_pool_fit.json：
       python3 tools/blender/char_second/prop_pool.py --fit        （純 numpy，不用 Blender）
  2. 做 GLB：
       /opt/blenv/bin/python tools/blender/char_second/prop_pool.py [-- --outdir assets/models/char/second_ai] [--only camera_film,...]

座標（和 props3d.js 的掛法一致）：
  - 掛脖子的（camera_film、lanyard_tag）：VRM 的 upperChest 骨頭座標（VRM 0.x 檔案空間：x＝人物右邊、y 上、z＝人物後面，前方 −z），
    props3d 用 boneGlb 掛在 upperChest、位置 (0,0,0)。背帶是照那一位的底模量的：camera_film＝元碩（char.npc_nm9）、lanyard_tag＝佳蓉（char.npc_nf18）；
    換底模要重量（--fit）。
  - 手上拿的（heldGlb，掛前臂、位置照手的骨頭算）：
      垂著拿的（保溫瓶、飲料、保冷袋、音源線、湯杓）：原點＝手握的地方或瓶身中間、上面朝 +y；props3d 轉 [0,0,π/2]（上面朝肩膀＝手放下來時朝上）。
      平拿的（小說、筆記本、講義、錄音筆）：照家豪的筆記本——原點在中心、長邊沿 x（手臂方向）、正面朝 +y（手背那一側＝手放下來時朝外）。
  - 繃帶（bandage）：掛手的骨頭（leftHand），手掌、手腕一圈（照 VRoid 女性手的大小）。
"""
import json, math, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FIT = os.path.join(HERE, 'prop_pool_fit.json')
ARGV = sys.argv[1:]


# ================================================================ 1. 量身體（numpy）
def _vrm(path):
    import numpy as np
    b = open(path, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + jl]); bo = 20 + jl + 8
    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        dt = np.dtype({5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a['componentType']])
        off = bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride')
        if st and st != n * dt.itemsize:
            raw = np.frombuffer(b, np.uint8, count=st * a['count'], offset=off).reshape(a['count'], st)
            return raw[:, :n * dt.itemsize].copy().view(dt).reshape(a['count'], n)
        return np.frombuffer(b, dt, count=n * a['count'], offset=off).reshape(a['count'], n)
    N = J['nodes']; par = {}
    for i, n in enumerate(N):
        for c in n.get('children', []): par[c] = i
    def wpos(i):   # VRoid 的骨頭在 rest pose 沒有旋轉：位置＝一路加 translation
        p = np.array(N[i].get('translation', [0, 0, 0]), float)
        while i in par: i = par[i]; p = p + np.array(N[i].get('translation', [0, 0, 0]), float)
        return p
    idx = {n.get('name'): i for i, n in enumerate(N)}; uc = wpos(idx['J_Bip_C_UpperChest'])
    out, seen = [], set()
    for n in N:
        if 'mesh' not in n or n.get('name', '').startswith('Hair') or n.get('name') == 'Face': continue   # 頭髮蓋在帶子外面（後頸），不算
        for p in J['meshes'][n['mesh']]['primitives']:
            a = p['attributes']['POSITION']
            if a in seen: continue
            seen.add(a); out.append(acc(a).astype(np.float64) - uc)
    V = np.concatenate(out)
    return V[(V[:, 1] > -0.45) & (V[:, 1] < 0.32) & (np.abs(V[:, 0]) < 0.26)]


def fit():
    import numpy as np
    def env(V, x, y, z, rx, ry, rz, axis, fn):
        m = (np.abs(V[:, 0] - x) < rx) & (np.abs(V[:, 1] - y) < ry) & (np.abs(V[:, 2] - z) < rz)
        return fn(V[m, axis]) if m.any() else None
    def front_min(V, x0, x1, y0, y1):
        m = (V[:, 0] > x0) & (V[:, 0] < x1) & (V[:, 1] > y0) & (V[:, 1] < y1) & (V[:, 2] < 0); return float(V[m, 2].min())
    def catmull(pts, n):
        P = np.array(pts, float); P = np.vstack([P[0] * 2 - P[1], P, P[-1] * 2 - P[-2]]); out = []; seg = len(P) - 3
        for i in range(seg):
            p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
            for t in np.linspace(0, 1, max(2, n // seg), endpoint=(i == seg - 1)):
                out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
        return np.array(out)
    def resample(C, n):
        d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(C, axis=0), axis=1))]; t = np.linspace(0, d[-1], n)
        return np.stack([np.interp(t, d, C[:, k]) for k in range(3)], 1)
    def clear(C, V, c, iters=14, smooth=0.35):
        """推到離身體至少 c；兩端（掛點）不動；每一輪推完做一次平滑"""
        C = C.copy()
        for _ in range(iters):
            for i in range(1, len(C) - 1):
                dd = np.linalg.norm(V - C[i], axis=1); j = int(np.argmin(dd))
                if dd[j] < c:
                    v = C[i] - V[j]; nv = np.linalg.norm(v)
                    if nv > 1e-6: C[i] = V[j] + v / nv * c
            S = C.copy()
            for i in range(1, len(C) - 1): S[i] = C[i] * (1 - smooth) + 0.5 * smooth * (C[i - 1] + C[i + 1])
            C = S
        return C
    def outward(C, V):
        """每一點往外的方向（離最近的 12 個身體頂點），沿路徑平滑：扁帶子寬的那一面貼著身體"""
        Nn = []
        for p in C:
            dd = np.linalg.norm(V - p, axis=1); k = np.argsort(dd)[:12]; v = p - V[k].mean(0); Nn.append(v / max(1e-9, np.linalg.norm(v)))
        Nn = np.array(Nn)
        for _ in range(4): Nn[1:-1] = (Nn[:-2] + 2 * Nn[1:-1] + Nn[2:]) / 4; Nn /= np.linalg.norm(Nn, axis=1)[:, None]
        return Nn
    def neck_loop(V, lugL, lugR, yb, c, xt, front_y):
        """掛點 L → 胸前 → 肩膀上緣（xt）→ 後頸（yb）→ 另一邊 → 掛點 R；推開到離身體 c"""
        zback = env(V, 0, yb, 0.06, 0.02, 0.012, 0.1, 2, np.max) + c
        ytp = env(V, xt, (yb + 0.03 - 0.1) / 2, 0.0, 0.012, (yb + 0.03 + 0.1) / 2, 0.03, 1, np.max) + c   # 肩膀上緣（只看 yb＋3 cm 以下：不要領子上緣、耳朵）
        def side(s, lg):
            zf = env(V, s * 0.075, front_y, -0.05, 0.012, 0.012, 0.12, 2, np.min) - c
            mid = np.array(lg) * 0.5 + np.array([s * 0.075, front_y, zf]) * 0.5
            zm = env(V, mid[0], mid[1], -0.05, 0.015, 0.015, 0.13, 2, np.min)
            if zm is not None: mid[2] = min(mid[2], zm - c)
            return [list(mid), [s * 0.075, front_y, zf], [s * xt, ytp, -0.005], [s * 0.055, yb + 0.003, zback - 0.022]]
        L = side(-1, lugL); R = side(1, lugR)
        C = resample(catmull([list(lugL)] + L + [[0, yb, zback]] + R[::-1] + [list(lugR)], 140), 120)
        C = clear(C, V, c)
        md = min(float(np.min(np.linalg.norm(V - p, axis=1))) for p in C[1:-1])
        return C, outward(C, V), md
    out = {}
    # ---- 元碩（char.npc_nm9）：底片相機，掛在胸口下緣、上腹 ----
    V = _vrm(os.path.join(ROOT, 'assets/models/char/second_ai/bl_npc_nm9.vrm')); c = 0.012
    cam = dict(W=0.128, H=0.078, D=0.034, yc=-0.15)
    zb = front_min(V, -0.075, 0.075, cam['yc'] - cam['H'] / 2 - 0.01, cam['yc'] + cam['H'] / 2 + 0.01) - c; cam['back_z'] = round(zb, 4)
    lugs = [(s * 0.068, cam['yc'] + cam['H'] / 2 - 0.012, zb - cam['D'] / 2) for s in (-1, 1)]
    C, Nn, md = neck_loop(V, lugs[0], lugs[1], 0.135, c, xt=0.095, front_y=0.10)
    out['camera_film'] = {'model': 'char.npc_nm9', 'who': 'pool_6（元碩）', 'cam': cam, 'lugs': [list(map(float, l)) for l in lugs],
                          'strap': [[round(float(v), 4) for v in p] for p in C], 'strap_n': [[round(float(v), 4) for v in p] for p in Nn], 'min_clear': round(md, 4)}
    print('camera_film：背帶 %.2f m、離身體最近 %.1f mm' % (float(np.sum(np.linalg.norm(np.diff(C, axis=0), axis=1))), md * 1000))
    # ---- 佳蓉（char.npc_nf18）：法服的名牌，卡套掛在胸口 ----
    V = _vrm(os.path.join(ROOT, 'assets/models/char/second_ai/bl_npc_nf18.vrm')); c = 0.010
    tag = dict(W=0.066, H=0.098, T=0.004, yc=-0.075)
    zt = front_min(V, -0.04, 0.04, tag['yc'] - tag['H'] / 2, tag['yc'] + tag['H'] / 2) - c
    ztop = front_min(V, -0.04, 0.04, tag['yc'] + tag['H'] / 2 - 0.01, tag['yc'] + tag['H'] / 2 + 0.01) - c
    tag['back_z'] = round(min(zt, ztop), 4)
    clip = (0.0, tag['yc'] + tag['H'] / 2 + 0.012, tag['back_z'] - 0.006)
    C, Nn, md = neck_loop(V, (-0.006, clip[1] + 0.006, clip[2]), (0.006, clip[1] + 0.006, clip[2]), 0.11, c, xt=0.085, front_y=0.07)
    out['lanyard_tag'] = {'model': 'char.npc_nf18', 'who': 'pool_20（佳蓉）', 'tag': tag, 'clip': list(map(float, clip)),
                          'cord': [[round(float(v), 4) for v in p] for p in C], 'cord_n': [[round(float(v), 4) for v in p] for p in Nn], 'min_clear': round(md, 4)}
    print('lanyard_tag：掛繩 %.2f m、離身體最近 %.1f mm' % (float(np.sum(np.linalg.norm(np.diff(C, axis=0), axis=1))), md * 1000))
    json.dump(out, open(FIT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('→', os.path.relpath(FIT, ROOT))


if '--fit' in ARGV:
    fit(); sys.exit(0)

# ================================================================ 2. 做 GLB（Blender）
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import random   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402
from mathutils import Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUTDIR = os.path.join(L.ROOT, ARGS[ARGS.index('--outdir') + 1] if '--outdir' in ARGS else 'assets/models/char/second_ai')
ONLY = set(ARGS[ARGS.index('--only') + 1].split(',')) if '--only' in ARGS else None
GEN = os.path.join(HERE, '..', 'env_second', 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
FITD = json.load(open(FIT, encoding='utf-8'))
PI = math.pi


def img_material(name, png, rough=0.7):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; Nd = nt.nodes
    tx = Nd.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); nt.links.new(tx.outputs['Color'], Nd['Principled BSDF'].inputs['Base Color'])
    return m


def uvquad(mesh, pts, rect):
    """一個貼圖的四邊形（遊戲座標的四個點：左下、右下、右上、左上；rect＝(u0, v0, u1, v1)）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


def ribbon(cm, pts, nrm, w, t, hexcol):
    """扁帶子：寬 w（沿 binormal）、厚 t（沿 outward），每一段四個頂點；寬的那一面貼著身體"""
    bm = cm.bm; rings = []
    P = [Vector(p) for p in pts]; Nn = [Vector(n) for n in nrm]
    for i, p in enumerate(P):
        T = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized()
        n = (Nn[i] - T * Nn[i].dot(T)).normalized(); bn = T.cross(n).normalized()
        ring = []
        for a, b in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
            q = p + bn * (a * w / 2) + n * (b * t / 2); ring.append(bm.verts.new(g2b(q.x, q.y, q.z)))
        rings.append(ring)
    new = []
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(4): new.append(bm.faces.new((r0[k], r0[(k + 1) % 4], r1[(k + 1) % 4], r1[k])))
    new.append(bm.faces.new(list(reversed(rings[0])))); new.append(bm.faces.new(rings[-1]))
    cm.paint(new, hexcol)


def ccyl(cm, a, b, r, hexcol, seg=16, r2=None):
    """頂點色圓柱（兩端點、半徑）"""
    before = set(cm.bm.faces); cm.cyl(a, b, r, seg=seg, r2=r2); cm.paint([f for f in cm.bm.faces if f not in before], hexcol)


def ctube(cm, pts, r, hexcol, seg=6, closed=False):
    """沿折線掃一條圓管（每一點一圈、相鄰的圈連起來；一整條只有一個網格，比一段一段的圓柱省很多三角形）"""
    bm = cm.bm; P = [Vector(p) for p in pts]; rings = []; ref = Vector((0.0, 0.0, 1.0))
    for i, p in enumerate(P):
        T = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized()
        if abs(T.dot(ref)) > 0.95: ref = Vector((1.0, 0.0, 0.0))
        n = (ref - T * ref.dot(T)).normalized(); bn = T.cross(n); ref = n
        rings.append([bm.verts.new(g2b(*(p + (n * math.cos(2 * PI * k / seg) + bn * math.sin(2 * PI * k / seg)) * r))) for k in range(seg)])
    fs = []
    for a, b in zip(rings, rings[1:] + ([rings[0]] if closed else [])):
        for k in range(seg): fs.append(bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k])))
    if not closed: fs.append(bm.faces.new(list(reversed(rings[0])))); fs.append(bm.faces.new(rings[-1]))
    cm.paint(fs, hexcol)


def clathe(cm, prof, hexcols, seg=24, axis_pt=(0, 0, 0)):
    """旋轉體（沿 y 軸，遊戲座標）：prof＝[(半徑, y)]；hexcols＝每一段的顏色（len(prof)-1 個）"""
    import bmesh
    bm = cm.bm; rings = []
    for (r, y) in prof:
        rings.append([bm.verts.new(g2b(axis_pt[0] + r * math.cos(2 * PI * i / seg), axis_pt[1] + y, axis_pt[2] + r * math.sin(2 * PI * i / seg))) for i in range(seg)])
    for k, (a, b) in enumerate(zip(rings, rings[1:])):
        fs = [bm.faces.new((a[i], b[i], b[(i + 1) % seg], a[(i + 1) % seg])) for i in range(seg)]
        cm.paint(fs, hexcols[min(k, len(hexcols) - 1)])
    if prof[0][0] > 1e-4: cm.paint([bm.faces.new(list(rings[0]))], hexcols[0])
    if prof[-1][0] > 1e-4: cm.paint([bm.faces.new(list(reversed(rings[-1])))], hexcols[-1])


def save(name, owner, hold, extra=None):
    out = os.path.join(OUTDIR, name + '.glb'); st = L.export(out, gpu_instances=False)
    meta = {'glb': os.path.relpath(out, L.ROOT), 'owner': owner, 'bytes': st['bytes'], 'tris': st.get('tris'), 'hold': hold, 'note': '沒有牌子、商標（D77）；NPC-POOL-ART-1028'}
    if extra: meta.update(extra)
    L.write_json(out.replace('.glb', '.json'), meta); return st


# ---------------------------------------------------------------- 元碩：底片相機＋背帶
def camera_film():
    B.reset(texres=256); F = FITD['camera_film']; cam = F['cam']
    root = B.group('camera_film', props={'kind': 'prop_camera', 'owner': 'pool_6'})
    W, H, D, yc, zb = cam['W'], cam['H'], cam['D'], cam['yc'], cam['back_z']; zf = zb - D
    x0, x1, y0, y1 = -W / 2, W / 2, yc - H / 2, yc + H / 2
    SIL, SILD, BLK, LEA = '#b9bcc0', '#8e9297', '#1b1c1f', '#26262a'
    cm = CMesh('camera_body', L.vc_material('camera_vc', rough=0.45))
    cm.crbox(x0, x1, y0 + 0.007, y1 - 0.019, zf + 0.0005, zb - 0.0005, LEA, r=0.004)            # 中間一圈黑色皮紋
    cm.crbox(x0, x1, y0, y0 + 0.008, zf + 0.001, zb - 0.001, SIL, r=0.003)                       # 底板（銀）
    cm.crbox(x0, x1, y1 - 0.02, y1, zf + 0.001, zb - 0.001, SIL, r=0.003)                         # 頂蓋（銀）
    # 觀景窗的稜鏡（梯形，銀色；正面一塊黑）
    pw0, pw1, ph, pz0, pz1 = 0.030, 0.019, 0.022, zf + 0.004, zb - 0.007
    for z_, s_ in ((pz0, 1), (pz1, -1)):
        pts = [(-pw0, y1, z_), (pw0, y1, z_), (pw1, y1 + ph, z_), (-pw1, y1 + ph, z_)]
        cm.poly(pts if s_ < 0 else pts[::-1], SIL)
    cm.poly([(-pw1, y1 + ph, pz0), (pw1, y1 + ph, pz0), (pw1, y1 + ph, pz1), (-pw1, y1 + ph, pz1)][::-1], SIL)
    cm.poly([(pw0, y1, pz0), (pw0, y1, pz1), (pw1, y1 + ph, pz1), (pw1, y1 + ph, pz0)][::-1], SIL)
    cm.poly([(-pw0, y1, pz1), (-pw0, y1, pz0), (-pw1, y1 + ph, pz0), (-pw1, y1 + ph, pz1)][::-1], SIL)
    cm.cbox(-0.012, 0.012, y1 + 0.006, y1 + 0.016, pz0 - 0.0008, pz0 + 0.0002, BLK)               # 稜鏡正面的黑色小窗（沒有字）
    # 鏡頭（往前 −z）：卡口銀圈、黑色鏡筒、對焦環（深灰）、前緣銀圈、鏡片
    ccyl(cm, (0, yc - 0.004, zf), (0, yc - 0.004, zf - 0.004), 0.029, SIL, seg=28)
    ccyl(cm, (0, yc - 0.004, zf - 0.004), (0, yc - 0.004, zf - 0.031), 0.026, BLK, seg=28)
    ccyl(cm, (0, yc - 0.004, zf - 0.012), (0, yc - 0.004, zf - 0.021), 0.0274, '#3a3b3f', seg=28)
    ccyl(cm, (0, yc - 0.004, zf - 0.031), (0, yc - 0.004, zf - 0.034), 0.0262, SILD, seg=28)
    ccyl(cm, (0, yc - 0.004, zf - 0.0336), (0, yc - 0.004, zf - 0.0342), 0.020, '#203040', seg=28)
    # 頂蓋上的東西：快門鈕、捲片桿、回片鈕、熱靴
    ccyl(cm, (0.040, y1, (zf + zb) / 2), (0.040, y1 + 0.005, (zf + zb) / 2), 0.0042, SIL, seg=12)
    cm.crbox(0.046, 0.062, y1, y1 + 0.004, (zf + zb) / 2 - 0.004, (zf + zb) / 2 + 0.010, SILD, r=0.0015)
    ccyl(cm, (-0.045, y1, (zf + zb) / 2), (-0.045, y1 + 0.007, (zf + zb) / 2), 0.0085, BLK, seg=16)
    cm.cbox(-0.009, 0.009, y1 + ph, y1 + ph + 0.003, pz0 + 0.004, pz1 - 0.002, SILD)
    # 背帶的扣環（左右兩側）
    for (lx, ly, lz) in F['lugs']:
        s = 1 if lx > 0 else -1
        ccyl(cm, (s * W / 2, ly, lz), (s * (W / 2 + 0.004), ly, lz), 0.0035, SILD, seg=10)
    # 背帶：照元碩的身體量過的路徑（深咖啡色編織帶）、兩端皮革片
    ribbon(cm, F['strap'], F['strap_n'], 0.022, 0.0028, '#3d2b20')
    S = F['strap']
    for i in (0, len(S) - 1):
        j = 5 if i == 0 else len(S) - 6; p, q = Vector(S[i]), Vector(S[j]); d = (q - p).normalized(); c_ = p + d * 0.022
        nn = F['strap_n'][i]; ribbon(cm, [list(p + d * 0.008), list(c_), list(p + d * 0.036)], [nn, nn, nn], 0.026, 0.0045, '#6b4a32')
    cm.finish(root, uv=False)
    return save('camera_film', 'pool_6（元碩，char.npc_nm9）', {'bone': 'upperChest', 'make': "boneGlb('prop.camera_film','camera_film')", 'note': '背帶照 char.npc_nm9 量的（prop_pool_fit.json）；別的底模要重量'})


# ---------------------------------------------------------------- 佳蓉：法服的名牌（卡套＋掛繩）
def lanyard_tag():
    B.reset(texres=256); F = FITD['lanyard_tag']; t = F['tag']
    png = os.path.join(GEN, 'pool_lanyard_card.png'); W_, H_ = 256, 384
    im = Image.new('RGB', (W_, H_), '#fbfbf8'); d = ImageDraw.Draw(im); fnt = lambda n: ImageFont.truetype(CJK, n)
    d.rectangle([0, 0, W_, 96], fill='#24365e')
    # 天秤（自己畫的簡單圖示，不是真的社團標誌）
    cx, cy = 52, 48; d.line([(cx, cy - 26), (cx, cy + 24)], fill='#e9d9a8', width=4); d.line([(cx - 28, cy - 16), (cx + 28, cy - 16)], fill='#e9d9a8', width=4)
    for sx in (-1, 1):
        d.line([(cx + sx * 28, cy - 16), (cx + sx * 20, cy + 6)], fill='#e9d9a8', width=2); d.line([(cx + sx * 28, cy - 16), (cx + sx * 36, cy + 6)], fill='#e9d9a8', width=2)
        d.chord([cx + sx * 28 - 12, cy - 4, cx + sx * 28 + 12, cy + 14], 0, 180, fill='#e9d9a8')
    d.rectangle([cx - 14, cy + 22, cx + 14, cy + 28], fill='#e9d9a8')
    d.text((96, 26), '值班', font=fnt(44), fill='#ffffff')
    d.rectangle([28, 128, 124, 252], fill='#d6dbe2', outline='#9aa4b1', width=2)                     # 大頭照的位置（灰色，不放臉）
    d.ellipse([56, 150, 96, 190], fill='#b9c1cc'); d.chord([42, 192, 110, 262], 180, 360, fill='#b9c1cc')
    for k, y in enumerate((150, 196, 236)): d.rectangle([140, y, 140 + (90 if k else 76), y + 14], fill='#6b7380')
    d.text((28, 284), '器材組', font=fnt(30), fill='#24365e'); d.rectangle([28, 336, 228, 344], fill='#c7ccd4')
    im.save(png)
    root = B.group('lanyard_tag', props={'kind': 'prop_lanyard', 'owner': 'pool_20'})
    cm = CMesh('lanyard_vc', L.vc_material('lanyard_vc', rough=0.5))
    Wt, Ht, T, yc, zb = t['W'], t['H'], t['T'], t['yc'], t['back_z']
    xa, xb, ya, yb = -Wt / 2, Wt / 2, yc - Ht / 2, yc + Ht / 2
    cm.crbox(xa, xb, ya, yb, zb - T, zb, '#dfe6ec', r=0.0018)                                    # 透明卡套（遊戲沒有透明：淡藍灰）
    cm.cbox(-0.008, 0.008, yb - 0.008, yb - 0.004, zb - T - 0.0004, zb + 0.0004, '#8a949e')      # 卡套上緣的掛孔
    # 夾子（銀色）：掛孔 → 掛繩接頭
    cx_, cy_, cz_ = F['clip']
    ccyl(cm, (0, yb - 0.006, zb - T / 2), (0, cy_ - 0.004, cz_), 0.0016, '#b9bec4', seg=8)
    cm.crbox(-0.0045, 0.0045, cy_ - 0.006, cy_ + 0.008, cz_ - 0.003, cz_ + 0.003, '#c3c8ce', r=0.0015)
    ribbon(cm, F['cord'], F['cord_n'], 0.012, 0.0016, '#24365e')                                  # 深藍掛繩（照佳蓉的身體量過）
    cm.finish(root, uv=False)
    pm = Mesh('lanyard_card', img_material('lanyard_card', png, rough=0.4)); z_ = zb - T - 0.0006; m_ = 0.004
    uvquad(pm, [(xb - m_, ya + m_, z_), (xa + m_, ya + m_, z_), (xa + m_, yb - 0.011, z_), (xb - m_, yb - 0.011, z_)], (0, 0, 1, 1))   # 正面朝 −z（人物前方）：從前面看左右要對
    pm.finish(root, uv=False)
    return save('lanyard_tag', 'pool_20（佳蓉，char.npc_nf18）', {'bone': 'upperChest', 'make': "boneGlb('prop.lanyard_tag','lanyard_tag')", 'note': '掛繩照 char.npc_nf18 量的；別的底模要重量'})


# ---------------------------------------------------------------- 靖雯：銀色保溫瓶（照品妤的黑色那一支的尺寸、提環）
def thermos_silver():
    B.reset(texres=256); root = B.group('thermos_silver', props={'kind': 'prop_thermos', 'owner': 'pool_7', 'cap': '+y'})
    cm = CMesh('thermos_silver_vc', L.vc_material('thermos_silver_vc', rough=0.35))
    R, H0, H1 = 0.034, -0.105, 0.07
    clathe(cm, [(0.0, H0), (R - 0.004, H0), (R, H0 + 0.006), (R, H0 + 0.02), (R, H1 - 0.03), (R, H1 - 0.006), (R - 0.002, H1)],
           ['#9da2a8', '#b8bcc1', '#c9cdd2', '#d3d7db', '#c9cdd2', '#b8bcc1'], seg=28)            # 霧面不鏽鋼（上下暗一點，看得出是圓的）
    clathe(cm, [(R - 0.0015, H1 - 0.001), (R + 0.0006, H1 - 0.001), (R + 0.0006, H1 + 0.004), (R - 0.0015, H1 + 0.004)], ['#7d8288'], seg=28)
    clathe(cm, [(0.0, H1 + 0.004), (R - 0.001, H1 + 0.004), (R - 0.001, H1 + 0.032), (R - 0.006, H1 + 0.038), (0.0, H1 + 0.038)], ['#2a2c30', '#2a2c30', '#2a2c30', '#2a2c30'], seg=28)
    ctube(cm, [(0.016 * math.cos(a), H1 + 0.038 + 0.018 * max(0.0, math.sin(a)), 0.0) for a in [i * PI / 10 for i in range(11)]], 0.003, '#2a2c30', seg=6)
    cm.finish(root, uv=False, smooth=True)
    return save('thermos_silver', 'pool_7（靖雯）', {'bone': 'leftLowerArm', 'make': "heldGlb('prop.thermos_silver','thermos_silver',0.21,-0.022,[0,0,Math.PI/2])", 'note': '提環勾在手指上（同品妤）；托特包在右肩，所以拿左手；坐下時藏起來'})


# ---------------------------------------------------------------- 孟儒：運動飲料（寶特瓶，沒有牌子）
def sports_drink():
    B.reset(texres=256); root = B.group('sports_drink', props={'kind': 'prop_bottle', 'owner': 'pool_12', 'cap': '+y'})
    cm = CMesh('sports_drink_vc', L.vc_material('sports_drink_vc', rough=0.2))
    R = 0.032; LQ, LQD, LB, LW = '#cfe6f2', '#b6d6e8', '#2f6db3', '#f4f7fa'
    prof = [(0.0, -0.1), (R - 0.006, -0.1), (R - 0.002, -0.097), (R, -0.09), (R, -0.06), (R - 0.0015, -0.055), (R, -0.05), (R, 0.02), (R - 0.0015, 0.025), (R, 0.03),
            (R, 0.045), (R - 0.006, 0.062), (0.018, 0.074), (0.0135, 0.08), (0.0135, 0.083)]
    cols = [LQD, LQD, LQ, LQ, LQ, LB, LB, LQ, LQ, LQ, LQ, LQ, LQ, LQ]
    clathe(cm, prof, cols, seg=28)
    # 標籤上的白色波浪（四段，貼在標籤外面 0.4 mm）
    for k in range(4):
        a0 = k * PI / 2 + 0.2; seg = 10
        for i in range(seg):
            a, b = a0 + i * 0.09, a0 + (i + 1) * 0.09; ya, yb2 = -0.018 + 0.008 * math.sin(i * 0.7), -0.018 + 0.008 * math.sin((i + 1) * 0.7)
            r_ = R + 0.0004
            cm.poly([(r_ * math.cos(a), ya - 0.004, r_ * math.sin(a)), (r_ * math.cos(b), yb2 - 0.004, r_ * math.sin(b)), (r_ * math.cos(b), yb2 + 0.004, r_ * math.sin(b)), (r_ * math.cos(a), ya + 0.004, r_ * math.sin(a))][::-1], LW)
    clathe(cm, [(0.0145, 0.083), (0.0152, 0.083), (0.0152, 0.1), (0.0145, 0.101), (0.0, 0.101)], ['#f2f2f2', '#f2f2f2', '#f2f2f2', '#f2f2f2'], seg=20)   # 白色瓶蓋
    cm.finish(root, uv=False, smooth=True)
    return save('sports_drink', 'pool_12（孟儒）', {'bone': 'rightLowerArm', 'make': "heldGlb('prop.sports_drink','sports_drink',0.18,-0.02,[0,0,Math.PI/2])", 'note': '手指夾著瓶頸、瓶子垂下來；坐下時藏起來'})


# ---------------------------------------------------------------- 靜儀：錄音筆
def recorder():
    B.reset(texres=256); root = B.group('recorder', props={'kind': 'prop_recorder', 'owner': 'pool_13'})
    cm = CMesh('recorder_vc', L.vc_material('recorder_vc', rough=0.4))
    L_, T_, W_ = 0.055, 0.0075, 0.018   # 半長（x）、半厚（y）、半寬（z）
    cm.crbox(-L_, L_, -T_, T_, -W_, W_, '#b3b8be', r=0.006)                                              # 銀灰色機身（拿在黑色長裙前面也看得到）
    cm.cbox(-L_ + 0.004, L_ - 0.028, T_ - 0.0002, T_ + 0.0002, -W_ + 0.003, W_ - 0.003, '#2e3136')          # 深色的前面板
    cm.crbox(L_ - 0.026, L_ - 0.0005, -T_ - 0.0004, T_ + 0.0004, -W_ - 0.0004, W_ + 0.0004, '#d4d8dc', r=0.006)   # 前端的麥克風網
    for i in range(5):
        for j in range(3): cm.cbox(L_ - 0.023 + i * 0.0045, L_ - 0.0205 + i * 0.0045, T_ + 0.0004, T_ + 0.0008, -0.009 + j * 0.0075, -0.0065 + j * 0.0075, '#6d7278')
    cm.cbox(-0.006, 0.020, T_ + 0.0001, T_ + 0.0006, -0.012, 0.012, '#9cb0a2')                       # 小螢幕
    cm.cbox(-0.004, 0.002, T_ + 0.0006, T_ + 0.0009, -0.009, -0.003, '#3c4a40')
    ccyl(cm, (-0.022, T_, 0.0), (-0.022, T_ + 0.0018, 0.0), 0.0055, '#c0392b', seg=14)                 # 紅色錄音鍵
    for dz in (-0.011, 0.011): ccyl(cm, (-0.036, T_, dz), (-0.036, T_ + 0.0012, dz), 0.0035, '#6d7278', seg=10)
    ccyl(cm, (-0.0475, T_ + 0.0004, -0.012), (-0.0475, T_ + 0.0007, -0.012), 0.0013, '#e74c3c', seg=8)  # 錄音中的小紅燈
    cm.finish(root, uv=False)
    return save('recorder', 'pool_13（靜儀）', {'bone': 'rightLowerArm', 'make': "heldGlb('prop.recorder','recorder',0.06,-0.014)", 'note': '像拿手機：長邊沿手指、螢幕朝外'})


# ---------------------------------------------------------------- 家齊：保冷袋（媽媽寄的虱目魚丸）
def cooler_bag():
    B.reset(texres=256); root = B.group('cooler_bag', props={'kind': 'prop_bag', 'owner': 'pool_3', 'top': '+y'})
    cm = CMesh('cooler_bag_vc', L.vc_material('cooler_bag_vc', rough=0.75))
    X0, X1, Y0, Y1, Z0, Z1 = -0.075, 0.075, -0.30, -0.075, -0.15, 0.15                      # 包身：厚 15 cm（x：手放下來時往外）、高 22.5、寬 30（z：前後）
    bm = L.rbox_bm(X1 - X0, Y1 - Y0, Z1 - Z0, r=0.03, seg=3)
    for v in bm.verts:   # 軟的：上緣中間塌一點、側面鼓一點
        gx, gy, gz = v.co.x, v.co.z, -v.co.y; u = gz / ((Z1 - Z0) / 2); hy = (gy + (Y1 - Y0) / 2) / (Y1 - Y0)
        if hy > 0.8: gy -= 0.012 * (1 - u * u) * (hy - 0.8) / 0.2
        gx *= 1 + 0.08 * math.sin(PI * hy) * (1 - 0.5 * u * u); v.co = Vector((gx, -gz, gy))
    me = bpy.data.meshes.new('_t'); bm.to_mesh(me); bm.free(); me.transform(Matrix.Translation(g2b(0, (Y0 + Y1) / 2, 0)))
    before = set(cm.bm.faces); cm.bm.from_mesh(me); bpy.data.meshes.remove(me); cm.paint([f for f in cm.bm.faces if f not in before], '#2b3f6b')
    cm.cbox(X0 - 0.002, X1 + 0.002, Y1 - 0.045, Y1 - 0.033, Z0 + 0.012, Z1 - 0.012, '#d9dde2')            # 一圈白色條紋
    cm.cbox(-0.004, 0.004, Y1 + 0.001, Y1 + 0.006, Z0 + 0.02, Z1 - 0.02, '#a9adb3')                        # 上面的拉鍊（銀）
    cm.crbox(X0 - 0.004, X0 + 0.002, -0.24, -0.15, -0.06, 0.06, '#24355c', r=0.004)                         # 外側口袋
    # 兩條提把（從包口兩端拱上來，在手裡併在一起）
    for s in (-1, 1):
        ctube(cm, [(0.0, Y1 + 0.002, s * 0.11), (0.0, Y1 + 0.03, s * 0.1), (0.0, Y1 + 0.052, s * 0.075), (0.0, -0.012, s * 0.035), (0.0, 0.0, s * 0.006)], 0.0065, '#1d2a48', seg=8)
    ccyl(cm, (-0.012, 0.0, 0.0), (0.012, 0.0, 0.0), 0.009, '#1d2a48', seg=10)                              # 手握的地方（提把併在一起的套子）
    cm.finish(root, uv=False, smooth=True)
    return save('cooler_bag', 'pool_3（家齊）', {'bone': 'rightLowerArm', 'make': "heldGlb('prop.cooler_bag','cooler_bag',0.075,-0.01,[0,0,Math.PI/2])", 'note': '原點＝手握提把的地方；包身垂在手下面；坐下時藏起來'})


# ---------------------------------------------------------------- 書、筆記本、講義（平拿：長邊沿 x、正面朝 +y）
def book_png(path):
    W_, H_ = 512, 320; im = Image.new('RGB', (W_, H_), '#7b2a2a'); d = ImageDraw.Draw(im); rr = random.Random(7)
    # 左半＝封底（拿的時候朝外：只有一小段文字、條碼一樣的方塊）；右半＝封面（朝內：看不到；暗紅、一個人影和一把傘）
    d.rectangle([0, 0, 255, H_], fill='#6e2424')
    for k in range(6): d.rectangle([34, 60 + k * 18, 34 + rr.randint(120, 180), 68 + k * 18], fill='#c9a99a')
    d.rectangle([150, 238, 222, 290], fill='#efe8e0')
    for k in range(18): d.rectangle([156 + k * 3.4, 244, 157.5 + k * 3.4 + rr.randint(0, 1), 278], fill='#1b1b1b')
    d.rectangle([256, 0, W_, H_], fill='#8a2f2f'); d.ellipse([360, 120, 400, 160], fill='#1d1010'); d.rectangle([366, 158, 394, 250], fill='#1d1010')
    d.polygon([(330, 110), (430, 110), (380, 80)], fill='#2b1a1a'); d.line([(380, 110), (380, 160)], fill='#2b1a1a', width=3)
    d.rectangle([290, 40, 478, 64], fill='#e8d9c9'); d.rectangle([290, 270, 420, 284], fill='#e8d9c9')
    im.save(path)


def flat_item(name, owner, Lx, Ty, Wz, front_png, uv_front, uv_back, side_col, hold, extras=None):
    """長 Lx（x）、厚 Ty（y）、寬 Wz（z）的平東西；+y 面、−y 面各貼一塊貼圖；側面頂點色"""
    B.reset(texres=512); root = B.group(name, props={'kind': 'prop_flat', 'owner': owner})
    cm = CMesh(name + '_vc', L.vc_material(name + '_vc', rough=0.7))
    cm.crbox(-Lx / 2, Lx / 2, -Ty / 2, Ty / 2, -Wz / 2, Wz / 2, side_col, r=min(0.002, Ty / 2.2))
    if extras: extras(cm)
    cm.finish(root, uv=False)
    pm = Mesh(name + '_print', img_material(name + '_print', front_png, rough=0.6)); e = 0.0004 + (0.0016 if name == 'novel' else 0.0)
    if uv_front: uvquad(pm, [(-Lx / 2 + 0.001, Ty / 2 + e, Wz / 2 - 0.001), (Lx / 2 - 0.001, Ty / 2 + e, Wz / 2 - 0.001), (Lx / 2 - 0.001, Ty / 2 + e, -Wz / 2 + 0.001), (-Lx / 2 + 0.001, Ty / 2 + e, -Wz / 2 + 0.001)], uv_front)
    if uv_back: uvquad(pm, [(Lx / 2 - 0.001, -Ty / 2 - e, Wz / 2 - 0.001), (-Lx / 2 + 0.001, -Ty / 2 - e, Wz / 2 - 0.001), (-Lx / 2 + 0.001, -Ty / 2 - e, -Wz / 2 + 0.001), (Lx / 2 - 0.001, -Ty / 2 - e, -Wz / 2 + 0.001)], uv_back)
    pm.finish(root, uv=False)
    return save(name, owner, hold)


def novel():
    png = os.path.join(GEN, 'pool_novel.png'); book_png(png)
    def covers(cm):   # 本體是書頁（米白）；封面、封底是兩片 1.2 mm 的紙板、書背在 −x（暗紅）
        for s in (-1, 1): cm.cbox(-0.085, 0.0855, s * 0.0078, s * 0.009, -0.0532, 0.0532, '#7b2a2a')
        cm.cbox(-0.0862, -0.085, -0.009, 0.009, -0.0532, 0.0532, '#6a2222')
    return flat_item('novel', 'pool_1（采潔）', 0.168, 0.0156, 0.104, png, (0.0, 0.0, 0.5, 1.0), (0.5, 0.0, 1.0, 1.0), '#efe6d2',
                     {'bone': 'leftLowerArm', 'make': "heldGlb('prop.novel','novel',0.055,-0.03)", 'note': '推理小說，封面朝內（朝身體）：外面只看到封底'}, covers)


def notebook_q():
    png = os.path.join(GEN, 'pool_notebook_q.png'); W_, H_ = 512, 360; im = Image.new('RGB', (W_, H_), '#b9b2a3'); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W_, H_], fill='#8f99a3'); d.rectangle([60, 70, 300, 120], fill='#eef0f2'); d.line([(70, 100), (280, 100)], fill='#7c8794', width=3)
    d.text((70, 76), '問題', font=ImageFont.truetype(CJK, 22), fill='#3b4552')
    d.rectangle([0, 0, 24, H_], fill='#5d6670')
    im.save(png)
    def extras(cm):   # 封底（灰紙板）＋螺旋線圈（書背 −x）＋從書口、上緣冒出來的一排便利貼
        cm.cbox(-0.105, 0.105, -0.0062, -0.0048, -0.074, 0.074, '#6f7880')
        for k in range(13):
            z = -0.068 + k * 0.0113; ccyl(cm, (-0.105, -0.0055, z), (-0.105, 0.0075, z), 0.0042, '#9aa0a6', seg=8)
        rr = random.Random(10); cols = ['#f7d64a', '#f59bb0', '#8fd3f4', '#a6e3a1', '#f7a14a']
        for k in range(9):
            x = -0.07 + k * 0.019 + rr.uniform(-0.003, 0.003); cm.cbox(x, x + 0.012, -0.003 + k % 3 * 0.002, -0.0025 + k % 3 * 0.002, 0.074, 0.084 + rr.uniform(0, 0.006), cols[k % 5])
        for k in range(5):
            z = -0.05 + k * 0.022; cm.cbox(0.105, 0.114 + rr.uniform(0, 0.005), -0.001, -0.0005, z, z + 0.012, cols[(k + 2) % 5])
    return flat_item('notebook_q', 'pool_10（宇軒）', 0.21, 0.012, 0.148, png, (0.0, 0.0, 1.0, 1.0), None, '#e9e5dc',
                     {'bone': 'leftLowerArm', 'make': "heldGlb('prop.notebook_q','notebook_q',0.07,-0.024)", 'note': '寫滿問題的筆記本：螺旋線圈、便利貼'}, extras)


def handouts():
    png = os.path.join(GEN, 'pool_handouts.png'); W_, H_ = 512, 362; im = Image.new('RGB', (W_, H_), '#f6f5f1'); d = ImageDraw.Draw(im); rr = random.Random(3)
    d.rectangle([40, 30, 260, 44], fill='#2c2c2c')
    for k in range(13): d.rectangle([40, 70 + k * 20, 40 + rr.randint(250, 430), 76 + k * 20], fill='#8b8b8b')
    d.rectangle([300, 60, 470, 160], outline='#555555', width=2)                                           # 一張小圖表（財金的講義）
    pts = [(300 + i * 17, 150 - int(70 * (0.5 + 0.5 * math.sin(i * 0.8)) * (0.4 + i / 14))) for i in range(11)]; d.line(pts, fill='#2f6db3', width=3)
    for k in range(3): d.line([(40 + rr.randint(0, 200), 120 + k * 60), (40 + rr.randint(250, 420), 122 + k * 60)], fill='#f2c94c', width=6)   # 螢光筆
    im.save(png)
    def extras(cm):   # 長尾夾（黑）夾在左上角＋下面幾張紙錯開
        cm.cbox(-0.15, -0.128, -0.006, 0.006, 0.07, 0.096, '#1c1c1e'); cm.cbox(-0.153, -0.15, 0.006, 0.0075, 0.074, 0.092, '#a9adb3')
        cm.cbox(-0.146, 0.146, -0.0042, -0.003, -0.104, 0.103, '#ecebe6')
    return flat_item('handouts', 'pool_2（宗霖）', 0.297, 0.006, 0.21, png, (0.0, 0.0, 1.0, 1.0), None, '#f1f0ec',
                     {'bone': 'rightLowerArm', 'make': "heldGlb('prop.handouts','handouts',0.09,-0.018)", 'note': '一疊財金的講義（長尾夾）；計算機在左前臂，所以拿右手'}, extras)


# ---------------------------------------------------------------- 立群：音源線（一捲黑色的線＋接頭）
def audio_cable():
    B.reset(texres=256); root = B.group('audio_cable', props={'kind': 'prop_cable', 'owner': 'pool_16', 'top': '+y'})
    cm = CMesh('audio_cable_vc', L.vc_material('audio_cable_vc', rough=0.5)); rr = random.Random(16)
    for k in range(7):   # 七圈，每一圈半徑、角度差一點；手握在最上面
        R = 0.11 + rr.uniform(-0.012, 0.012); ph = rr.uniform(-0.15, 0.15); xo = (k - 3) * 0.0042; pts = []
        for i in range(24):
            a = PI / 2 + ph + 2 * PI * i / 24; pts.append((xo + 0.003 * math.sin(a * 3 + k), -R + R * math.sin(a) - 0.004, R * math.cos(a) * 0.92))
        ctube(cm, pts, 0.0042, '#16171a', seg=6, closed=True)
    ccyl(cm, (-0.016, 0.0, 0.0), (0.016, 0.0, 0.0), 0.012, '#16171a', seg=10)                            # 手握的地方（線圈收在一起）
    # 垂下來的一段線＋接頭（銀色）
    tail = [(0.012, -0.21, 0.07), (0.016, -0.25, 0.085), (0.018, -0.29, 0.09)]
    ctube(cm, [(0.006, -0.17, 0.05)] + tail, 0.0042, '#16171a', seg=6)
    ccyl(cm, (0.018, -0.29, 0.09), (0.018, -0.34, 0.092), 0.0095, '#2a2b2e', seg=12); ccyl(cm, (0.018, -0.34, 0.092), (0.018, -0.36, 0.093), 0.0098, '#b9bec4', seg=12)
    cm.finish(root, uv=False, smooth=True)
    return save('audio_cable', 'pool_16（立群）', {'bone': 'leftLowerArm', 'make': "heldGlb('prop.audio_cable','audio_cable',0.075,-0.01,[0,0,Math.PI/2])", 'note': '一捲線垂在手下面；坐下時藏起來'})


# ---------------------------------------------------------------- 麵店阿姨（hc_ayi）：湯杓、手上的繃帶
def ladle():
    B.reset(texres=256); root = B.group('ladle', props={'kind': 'prop_ladle', 'owner': 'hc_ayi', 'top': '+y'})
    cm = CMesh('ladle_vc', L.vc_material('ladle_vc', rough=0.3))
    ccyl(cm, (0, 0.06, 0), (0, -0.2, 0.0), 0.0045, '#b4b9bf', seg=10)                                      # 柄（握在 0；上面露出一小段）
    ccyl(cm, (0, 0.06, 0), (0, 0.075, 0.0), 0.006, '#2c2c2e', seg=10)                                      # 柄尾（黑）
    clathe(cm, [(0.0, -0.265), (0.03, -0.258), (0.042, -0.24), (0.044, -0.222), (0.042, -0.218), (0.0, -0.218)], ['#b4b9bf', '#c3c8cd', '#c3c8cd', '#9ea3a9', '#9ea3a9'], seg=24, axis_pt=(0.0, 0.0, 0.03))
    ccyl(cm, (0, -0.2, 0.0), (0, -0.222, 0.03), 0.0045, '#b4b9bf', seg=10)
    cm.finish(root, uv=False, smooth=True)
    return save('ladle', 'hc_ayi（麵店阿姨）', {'bone': 'rightLowerArm', 'make': "heldGlb('prop.ladle','ladle',0.075,-0.01,[0,0,Math.PI/2])", 'note': '握柄、杓子朝下（手放下來時）'})


def bandage():
    B.reset(texres=256); root = B.group('bandage', props={'kind': 'prop_bandage', 'owner': 'hc_ayi'})
    cm = CMesh('bandage_vc', L.vc_material('bandage_vc', rough=0.85))
    # 手的骨頭座標（VRM 0.x 左手 T 字姿勢：手指往 −x、手掌朝 −y、大拇指那一側 −z）：手掌、手腕各包一圈（扁的橢圓管）。
    # 照阿姨的底模（bl_npc_nf3.vrm）量的手：手腕 y −0.02～0.015、z −0.03～0.025；手掌 y −0.026～0.015、z −0.06～0.03（含大拇指根部）
    for (x0, x1, cy, cz, ry, rz, col) in ((-0.058, -0.024, -0.005, -0.013, 0.024, 0.05, '#f6f4ef'), (-0.006, 0.022, -0.001, 0.001, 0.0205, 0.031, '#f1efe9')):
        seg = 20; bm = cm.bm; rings = []
        for x in (x0, x1):
            rings.append([bm.verts.new(g2b(x, cy + ry * math.sin(2 * PI * i / seg), cz + rz * math.cos(2 * PI * i / seg))) for i in range(seg)])
        fs = [bm.faces.new((rings[0][i], rings[0][(i + 1) % seg], rings[1][(i + 1) % seg], rings[1][i])) for i in range(seg)]
        cm.paint(fs, col)
    cm.cbox(-0.034, -0.012, 0.0178, 0.0194, -0.02, -0.006, '#e8e2d6')                                      # 膠帶（手背）
    cm.finish(root, uv=False, smooth=True)
    return save('bandage', 'hc_ayi（麵店阿姨）', {'bone': 'leftHand', 'make': "boneGlb('prop.bandage','bandage')（DEF 的 bone 用 leftHand）", 'note': '照阿姨的底模 bl_npc_nf3 的左手量的；別的底模要看一下有沒有浮起來或陷進去'})


BUILD = {'camera_film': camera_film, 'lanyard_tag': lanyard_tag, 'thermos_silver': thermos_silver, 'sports_drink': sports_drink, 'recorder': recorder,
         'cooler_bag': cooler_bag, 'novel': novel, 'notebook_q': notebook_q, 'handouts': handouts, 'audio_cable': audio_cable, 'ladle': ladle, 'bandage': bandage}
os.makedirs(OUTDIR, exist_ok=True)
for k, fn in BUILD.items():
    if ONLY and k not in ONLY: continue
    st = fn(); print(k, st.get('tris'), st.get('bytes'))
