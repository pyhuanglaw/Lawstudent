"""宿舍書桌上的黃金葛小盆栽（交接包 v1，BB_95 3-1：方奕廷送的；LAWWW 2026-10-14 02:01Z 分派）→ GLB。第二 AI 工作階段（環境美術）；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/prop_pothos.py [-- --out assets/models/env/second_ai/prop_pothos.glb]

原點＝盆底（托盤底）中心、y=0＝放的那個面（桌面）；遊戲座標方向（x 東、y 上、z 南）。
放的位置（2026-10-17 LAWWW2-C 改，ART-04；原本是舊雙人房的書桌 (1.11, 0.77, −2.36)）：
  四人房（dorm_room4.py／src/data/dorm_room_layout.js）祐廷的 L2 書桌：書桌沿左牆（x −2.9）、桌面 u（＝z）−0.96～0.315、前緣 x −2.28、桌面 0.76；
  書桌 +z 那一端是書桌側板（u 0.315～0.337，高 0.73）和整面的衣櫃（u 0.34 起）。黃金葛放在 +z 那一端的前緣：(−2.39, 0.76, 0.145)、ry=π/2
  （局部 +z＝世界 +x＝書桌前緣；局部 −x＝世界 +z＝往衣櫃；局部 +x＝世界 −z＝沿桌面往書桌另一端）。遊戲的互動點 z.spots.pothos＝(−1.55, 0.215) 就在前面。
  往 +z 再挪 6 cm 會碰到 Y203_YUTING 的馬克杯（u 0.255～0.315、離牆 0.42～0.48）。
三條藤：第 2 條往局部 +z 越過前緣垂下；第 3 條從前緣靠衣櫃那一角垂下（衣櫃門面在 x −2.30，垂藤在前緣外 1～3 cm，不碰）；
  第 1 條原本往局部 −x 越過桌子左緣——四人房那裡是書桌側板＋衣櫃，會穿進去，所以改成沿桌面前緣往局部 +x 爬（平放在桌上，S4 爬得更遠），
  避開筆記本（局部 x 0.03～0.21、z ≤ 0.01）。

盆：白色釉面小陶盆（盆口直徑 12.8 cm、高 11 cm）＋同色托盤（直徑 14.2 cm）；土；
黃金葛：心形的模型葉子（一片一片有厚度方向的彎曲：主脈隆起、兩側往下、葉尖下垂），綠底帶黃色斑紋（本作程式畫的葉子貼圖，
兩種斑紋各一半；葉形邊緣與葉基的凹口用貼圖透明度切）；盆裡往上長的葉子 8 片（葉柄 4–8 cm）＋三條垂藤（各 5–6 片葉子、越往藤尖越小）。
材質三個（三個 draw call）：陶盆（釉面）、土＋莖（頂點色）、葉子（貼圖、alpha clip、雙面）。
"""
import json, math, os, sys, random
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/prop_pothos.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); LEAF_PNG = os.path.join(GEN, 'pothos_leaf.png')
PLACE = dict(zone='dorm', x=-2.39, y=0.76, z=0.145, ry=round(math.pi / 2, 6), desk='L2', layout='loft4-v2')
random.seed(1014)


# ---------------- 葉子貼圖（本作：程式畫的，256×256 兩張並排）----------------
def heart_w(t):
    """葉形：t＝0 葉基（兩片圓耳的最下面）→ 1 葉尖；回傳半寬（最寬＝1，在 t≈0.35）"""
    t = np.asarray(t, float)
    lo = np.sqrt(np.clip(1 - ((0.35 - t) / 0.35) ** 2, 0, 1)) ** 0.9
    u = np.clip((t - 0.35) / 0.65, 0, 1); s = np.clip((u - 0.65) / 0.35, 0, 1); s = s * s * (3 - 2 * s)
    hi = np.clip(1 - u ** 1.5, 0, 1) ** 0.85 * (1 - 0.15 * s)
    return np.where(t < 0.35, lo, hi)


SINUS = 0.14          # 葉柄接在主脈 t=0.14（葉基的凹口）
U_HALF = 0.46         # 貼圖上最寬處的半寬（u）


def lattice_noise(rng, X, Y, n=64):
    """任意座標的值雜訊（格點 n×n、循環）"""
    g = rng.random((n, n)); xi = np.floor(X).astype(int); yi = np.floor(Y).astype(int); fx = X - xi; fy = Y - yi
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); x0, x1, y0, y1 = xi % n, (xi + 1) % n, yi % n, (yi + 1) % n
    return g[y0, x0] * (1 - fx) * (1 - fy) + g[y0, x1] * fx * (1 - fy) + g[y1, x0] * (1 - fx) * fy + g[y1, x1] * fx * fy


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def leaf_texture(S=256, seed=0, gold=0.25):
    rng = np.random.default_rng(seed)
    v = 1 - (np.arange(S) + 0.5)[:, None] / S          # 圖片最上面＝葉尖（v=1）
    u = (np.arange(S) + 0.5)[None, :] / S
    t = (v - 0.03) / 0.94; x = (u - 0.5) / U_HALF        # x：±1＝最寬處的葉緣
    w = heart_w(np.clip(t, 0, 1))
    edge = w - np.abs(x)
    inside = np.clip(edge * 60 + 0.5, 0, 1) * (t >= 0) * (t <= 1)
    notch = (np.abs(x) < 0.30) & (t < SINUS * (1 - (np.abs(x) / 0.30) ** 1.4))     # 葉基的凹口（葉柄接的地方）
    alpha = inside * (1 - notch)
    # 黃金葛的斑紋：沿側脈（從主脈斜往葉尖）拉長的黃色筆觸，有的地方多、有的地方幾乎沒有
    ax = np.abs(x); sv = t - 0.55 * ax * (1 + 0.35 * ax); side = (x < 0) * 17.0
    f1 = lattice_noise(rng, sv * 26 + side, ax * 2.2 + 5)
    f2 = lattice_noise(rng, t * 2.6 + 11, x * 2.6 + 3)
    f3 = lattice_noise(rng, sv * 70 + side, ax * 9)
    streak = sstep(0.60 - gold, 0.74 - gold, f1 * (0.75 + 0.25 * f3)) * sstep(0.30, 0.62, f2 + 0.25 * gold)
    streak *= np.clip(edge * 8, 0, 1)                                        # 葉緣一圈綠色
    green_dark = np.array([0.11, 0.29, 0.07]); green = np.array([0.19, 0.42, 0.11]); yellow = np.array([0.88, 0.83, 0.38])
    n2 = lattice_noise(rng, u * 40, v * 40)
    base = green_dark + (green - green_dark) * np.clip(1 - ax * 0.9, 0, 1)[..., None] * (0.7 + 0.3 * n2[..., None])
    col = base * (1 - streak[..., None]) + yellow * streak[..., None]
    mid = np.exp(-(x / 0.03) ** 2) * (t > SINUS) * (t < 0.97)                 # 主脈：淡黃綠
    col = col * (1 - 0.5 * mid[..., None]) + np.array([0.66, 0.72, 0.36]) * 0.5 * mid[..., None]
    lat = np.exp(-((np.sin(sv * 2 * math.pi * 4.5)) / 0.10) ** 2) * (ax > 0.05) * 0.14   # 淡淡的側脈線
    col = col * (1 - lat[..., None]) + np.array([0.45, 0.58, 0.26]) * lat[..., None]
    return np.concatenate([np.clip(col, 0, 1), alpha[..., None]], -1)


def write_leaf_atlas():
    a = leaf_texture(256, 3, gold=0.10); b = leaf_texture(256, 11, gold=0.20)   # 黃金葛的斑紋不多（第二版 0.20／0.34 太白，像白金葛）
    img = np.concatenate([a, b], 1)
    os.makedirs(GEN, exist_ok=True)
    rgb = (np.clip(img[..., :3], 0, 1) * 255).astype(np.uint8); al = (img[..., 3:] * 255).astype(np.uint8)   # 顏色常數就是 sRGB（第一版多做一次 gamma，葉子淡得發白）
    Image.fromarray(np.concatenate([rgb, al], -1), 'RGBA').save(LEAF_PNG)


# ---------------- 材質 ----------------
B.reset(texres=512)
write_leaf_atlas()


def leaf_material():
    m = L.flat('pothos_leaf', '#ffffff', rough=0.45); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(LEAF_PNG); tx.image.alpha_mode = 'STRAIGHT'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # alphaMode MASK
    m.use_backface_culling = False; return m


M = {'pot': L.flat('pothos_pot', '#ebe7de', rough=0.28), 'vc': L.vc_material('pothos_soil_stem', rough=0.75), 'leaf': leaf_material()}
root = B.group('prop_pothos', props={'kind': 'prop_pothos', 'place': json.dumps(PLACE)})

# ---------------- 盆、托盤、土 ----------------
pot = Mesh('pothos_pot', M['pot'])
saucer = L.lathe([(0.0, 0.0), (0.063, 0.0), (0.071, 0.012), (0.0705, 0.0145), (0.067, 0.0145), (0.061, 0.006), (0.0, 0.006)], seg=24)
pot.add_bm(saucer); saucer.free()
POT_TOP, POT_R, SOIL_Y = 0.113, 0.064, 0.097
body = L.lathe([(0.0, 0.006), (0.047, 0.006), (0.050, 0.011), (0.0605, 0.098), (0.0615, 0.101), (0.064, 0.103), (0.064, 0.111), (0.0625, POT_TOP),
                (0.059, POT_TOP), (0.0575, 0.109), (0.0565, SOIL_Y), (0.0, SOIL_Y)], seg=24)
pot.add_bm(body); body.free()
pot_ob = pot.finish(root, uv=False, smooth=False); L.smooth_mesh(pot_ob, angle=0.6)
def new_plant_meshes(key):
    """一個大小一組：土＋莖（頂點色）、葉子（貼圖）；tube()／leaf() 用全域的 vc、leaves、uvl"""
    global vc, leaves, uvl
    vc = CMesh('pothos_soil_stem_' + key, M['vc'])
    soil = L.lathe([(0.0565, SOIL_Y + 0.001), (0.0, SOIL_Y + 0.004)], seg=24)      # 由外往內：法線朝上
    vc.bm.faces.ensure_lookup_table(); n0 = len(vc.bm.faces); vc.add_bm(soil); soil.free(); vc.bm.faces.ensure_lookup_table()
    vc.paint([vc.bm.faces[i] for i in range(n0, len(vc.bm.faces))], '#3a2b20')
    leaves = Mesh('pothos_leaf_' + key, M['leaf']); uvl = leaves.bm.loops.layers.uv.new('UVMap')


STEM, PETIOLE = '#4a6a2c', '#5c7c34'


def tube(pts, r0, r1, sides, hexcol):
    """沿折線的細管（莖、葉柄）：每一點一圈 sides 個頂點，半徑從 r0 漸細到 r1"""
    P = [Vector(g2b(*p)) for p in pts]; n = len(P); rings = []
    for i, p in enumerate(P):
        d = (P[min(i + 1, n - 1)] - P[max(i - 1, 0)]).normalized()
        a = d.orthogonal().normalized(); b = d.cross(a).normalized(); r = r0 + (r1 - r0) * i / (n - 1)
        rings.append([vc.bm.verts.new(p + (a * math.cos(2 * math.pi * k / sides) + b * math.sin(2 * math.pi * k / sides)) * r) for k in range(sides)])
    fs = []
    for A, C in zip(rings, rings[1:]):
        for k in range(sides):
            fs.append(vc.bm.faces.new((A[k], A[(k + 1) % sides], C[(k + 1) % sides], C[k])))
    vc.paint(fs, hexcol); return fs


def catmull(ctrl, per=6):
    C = [np.array(c, float) for c in ctrl]; C = [2 * C[0] - C[1]] + C + [2 * C[-1] - C[-2]]; out = []
    for i in range(1, len(C) - 2):
        p0, p1, p2, p3 = C[i - 1], C[i], C[i + 1], C[i + 2]
        for k in range(per):
            t = k / per; out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(C[-2]); return np.array(out)


# ---------------- 葉子（模型葉：沿主脈 6 段、每段左緣／主脈／右緣）----------------
NLEAF = [0]


def leaf(attach, fwd, normal, Lf, var, droop=0.25, cup=0.22):
    """attach＝葉柄末端（葉基凹口，主脈 t=SINUS）；fwd＝葉尖方向；normal＝葉面朝向（大約）；Lf＝葉長；var＝貼圖 0／1"""
    fwd = np.array(fwd, float); fwd /= np.linalg.norm(fwd); nrm = np.array(normal, float); nrm -= fwd * (nrm @ fwd); nrm /= np.linalg.norm(nrm)
    side = np.cross(nrm, fwd); Wf = Lf * 0.36; rows = []; n = 6
    for i in range(n + 1):
        t = i / n; w = float(heart_w(t)) * 1.08; along = (t - SINUS) * Lf
        sag = -droop * Lf * max(0.0, t - 0.35) ** 2 / 0.42                     # 葉尖往下垂（沿葉面法線的反方向）
        row = []
        for s in ((-1, 0, 1) if i < n else (0,)):          # 葉尖只有一個頂點
            off = s * w * Wf
            lift = (cup * Wf * 0.35 if s == 0 else -cup * 0.5 * w * Wf) + sag    # 主脈隆起、兩側往下
            p = np.array(attach) + fwd * along + side * off + nrm * lift
            uv = (var * 0.5 + 0.5 * (0.5 + s * w * U_HALF), 0.03 + 0.94 * t)
            row.append((leaves.bm.verts.new(g2b(*p)), uv))
        rows.append(row if i < n else row * 3)
    for i in range(n):
        A, C = rows[i], rows[i + 1]
        quads = [(A[0], A[1], C[1], C[0]), (A[1], A[2], C[2], C[1])] if i < n - 1 else [(A[0], A[1], C[1]), (A[1], A[2], C[1])]
        for q in quads:
            f = leaves.bm.faces.new([v for v, _ in q])
            for lp, (_, uv) in zip(f.loops, q): lp[uvl].uv = uv
    NLEAF[0] += 1


def unit(v): v = np.array(v, float); return v / np.linalg.norm(v)


# 四種大小（AA_12 主線 3：黃金葛要四個大小，跟著搬到大四；events.js：每週澆一次就夠，沒澆也不會枯，只是不長大）
#   S1 剛送來（大一）：短藤只越過盆緣、躺在桌面上；S2 長了一點：藤到桌緣、垂下 5～8 cm；S3 一年多：垂下 20～30 cm（2026-10-14 那一版）；S4 很久沒剪：垂下 45～55 cm、盆裡葉子多一圈
SIZES = {'S1': dict(vmax=0.105, ext=0.0, sprouts=4, per=2, leaf=0.86), 'S2': dict(vmax=0.215, ext=0.0, sprouts=4, per=3, leaf=0.94),
         'S3': dict(vmax=9.0, ext=0.0, sprouts=4, per=3, leaf=1.0), 'S4': dict(vmax=9.0, ext=0.24, sprouts=6, per=3, leaf=1.06)}
VINES = [
    [(0.030, SOIL_Y + 0.003, 0.026), (0.050, 0.122, 0.046), (0.068, 0.040, 0.064), (0.090, 0.006, 0.078), (0.135, 0.0035, 0.084),   # 四人房：沿桌面前緣往 +x 爬（不越過桌緣）
     (0.190, 0.0035, 0.078), (0.250, 0.0035, 0.086), (0.310, 0.0035, 0.080)],
    [(0.004, SOIL_Y + 0.003, 0.040), (0.006, 0.122, 0.066), (0.010, 0.040, 0.088), (0.012, 0.006, 0.103), (0.014, -0.004, 0.116),
     (0.004, -0.070, 0.124), (0.030, -0.140, 0.133), (0.050, -0.205, 0.128)],
    [(-0.028, SOIL_Y + 0.003, 0.028), (-0.047, 0.122, 0.047), (-0.068, 0.045, 0.068), (-0.086, 0.007, 0.086), (-0.110, -0.004, 0.110),
     (-0.121, -0.090, 0.116), (-0.112, -0.190, 0.131), (-0.130, -0.300, 0.128)],
]
EXT = [[(0.370, 0.0035, 0.088), (0.430, 0.0035, 0.079), (0.480, 0.0035, 0.090)],      # S4：第 1 條在桌面上再爬遠一點；其他兩條再往下長（輕輕擺動）
       [(0.062, -0.28, 0.130), (0.050, -0.36, 0.142), (0.066, -0.44, 0.136)],
       [(-0.138, -0.39, 0.132), (-0.126, -0.48, 0.140), (-0.140, -0.55, 0.134)]]


def cut(P, Lmax):
    """折線從頭量到 Lmax 為止（最後一點內插）"""
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1); s = np.concatenate([[0], np.cumsum(seg)])
    if Lmax >= s[-1]: return P
    k = int(np.searchsorted(s, Lmax)); t = (Lmax - s[k - 1]) / max(seg[k - 1], 1e-9)
    return np.vstack([P[:k], P[k - 1] + (P[k] - P[k - 1]) * t])


def grow(key, g):
    rnd = random.Random(7)
    # 盆裡：短藤從土裡長出來、往外彎，每條 2–3 片葉子（葉柄 2–3 cm），葉子朝上、朝外，蓋住大部分的土
    for k in range(g['sprouts']):
        a = k * 2 * math.pi / g['sprouts'] + 0.4 + rnd.uniform(-0.25, 0.25); d = np.array([math.cos(a), 0.0, math.sin(a)])
        p0 = np.array([0.0, SOIL_Y + 0.002, 0.0]) + d * (0.012 if k < 4 else 0.03)
        p1 = p0 + d * 0.02 + np.array([0, 0.03 + rnd.uniform(0, 0.02), 0]); p2 = p1 + d * 0.035 + np.array([0, 0.012, 0])
        P = catmull([p0, p1, p2], 4); tube(P, 0.0024, 0.0018, 4, STEM)
        for j, f in enumerate((0.45, 0.75, 1.0)[: g['per'] - (k % 2 if g['per'] == 3 else 0)]):
            q = P[int(round(f * (len(P) - 1)))]; ang = a + (1 if j % 2 else -1) * rnd.uniform(0.5, 1.1); o = np.array([math.cos(ang), 0.0, math.sin(ang)])
            tip = q + o * rnd.uniform(0.015, 0.028) + np.array([0, rnd.uniform(0.008, 0.022), 0])
            tube([q, (q + tip) / 2 + np.array([0, 0.005, 0]), tip], 0.0017, 0.0013, 3, PETIOLE)
            leaf(tip, unit(o + np.array([0, rnd.uniform(0.05, 0.4), 0])), unit(np.array([0, 1.0, 0]) - o * rnd.uniform(0.1, 0.5)), rnd.uniform(0.055, 0.078) * g['leaf'], (k + j) % 2, droop=0.25)
    # 垂藤：越過盆緣、沿桌面到桌緣、垂下去（桌面＝局部 y 0；桌子左緣 x=−0.11、前緣 z=+0.11；抽屜櫃側板 x=−0.09）
    for vi, ctrl in enumerate(VINES):
        P = catmull(ctrl + (EXT[vi] if g['ext'] > 0 else []), 4); P = cut(P, g['vmax'])
        tube(P, 0.0026, 0.0018, 4, STEM)
        seg = np.linalg.norm(np.diff(P, axis=0), axis=1); s = np.concatenate([[0], np.cumsum(seg)]); Ltot = s[-1]
        nl = max(2, int(round(Ltot / 0.062)))
        for j in range(nl):
            sj = float(np.clip(0.07 + (Ltot - 0.09) * (j + rnd.uniform(-0.22, 0.22)) / max(nl - 1, 1), 0.04, Ltot - 0.012))   # 第一片在越過盆緣之後；間隔不完全一樣
            p = np.array([np.interp(sj, s, P[:, c]) for c in range(3)]); q = np.array([np.interp(sj + 0.01, s, P[:, c]) for c in range(3)])
            tdir = unit(q - p); hanging = tdir[1] < -0.5
            outw = unit(np.array([p[0], 0.0, p[2]]))                              # 離開盆子中心的方向（水平）
            sgn = 1 if j % 2 else -1; sidev = unit(np.cross(tdir, np.array([0, 1.0, 0])) if not hanging else np.cross(tdir, outw)) * sgn
            tip = p + sidev * 0.012 + (outw * 0.014 if hanging else np.array([0, 0.012, 0]))
            tube([p, tip], 0.0016, 0.0013, 3, PETIOLE)
            Lf = 0.058 * (1 - 0.45 * j / max(nl - 1, 1)) * rnd.uniform(0.92, 1.08) * g['leaf']
            if hanging:     # 垂下來的那段：葉子朝外、葉尖往下、葉面對著房間
                fwd = unit(outw * 0.35 + sidev * 0.45 + np.array([0, -1.0, 0])); nrm = outw
            else:           # 盆緣到桌緣：葉子平放、葉尖往外
                fwd = unit(outw + sidev * 0.6 + np.array([0, 0.15, 0])); nrm = np.array([0, 1.0, 0])
            leaf(tip, fwd, nrm, Lf, (vi + j) % 2, droop=0.18 if hanging else 0.3)


obs = [pot_ob]; nleaf = {}; drop = {}
for key, g in SIZES.items():
    grp = B.group('POTHOS_' + key, parent=root); n0 = NLEAF[0]
    new_plant_meshes(key); grow(key, g)
    vo = vc.finish(grp, uv=False, smooth=False); L.smooth_mesh(vo, angle=1.2)
    lo = leaves.finish(grp, uv=False, smooth=False); L.smooth_mesh(lo, angle=1.4)
    obs += [vo, lo]; nleaf[key] = NLEAF[0] - n0
    drop[key] = round(-min(min(v.co.z for v in o.data.vertices) for o in (vo, lo)), 3)    # 最低點（Blender z＝遊戲 y）在桌面以下幾公尺

# 四人房祐廷書桌（L2）的實際範圍（DORM203-LM-1030，使用者 10-30「書桌上東西不要重疊」）：這株是照「桌角」做的（左緣 x=−0.11、前緣 z=+0.11 兩邊都垂藤），
# 但四人房的書桌往局部 −x 還有 8.5 cm 才到盡頭、盡頭是衣櫃（不是桌緣）。往 −x 垂下去的藤、S4 盆緣下垂的葉子原本穿過桌板、伸進衣櫃。
# 改法：桌面範圍裡低於桌面的點抬到桌面上（藤平躺在桌上）；越過書桌盡頭、在衣櫃前面那一段的點拉回桌子盡頭。前緣（局部 +z）往走道垂下去的照舊。
DESK = dict(x0=round(PLACE['z'] - 0.34, 3), x1=round(PLACE['z'] + 0.96, 3), z0=round(0.005 - (PLACE['x'] + 2.9), 3), z1=round(0.62 - (PLACE['x'] + 2.9), 3), wz=round(0.6 - (PLACE['x'] + 2.9), 3))
def fit_desk(ob):
    n = 0
    for v in ob.data.vertices:
        x, gz, y = v.co.x, -v.co.y, v.co.z            # Blender → 局部遊戲座標（x、z、y＝高）
        if x < DESK['x0'] and gz < DESK['wz']: v.co.x = DESK['x0'] + 0.005; x = v.co.x; n += 1      # 衣櫃前面：拉回書桌盡頭
        if DESK['x0'] <= x <= DESK['x1'] and DESK['z0'] <= gz <= DESK['z1'] and y < 0.002: v.co.z = 0.002; n += 1   # 桌面上：不低於桌面
    ob.data.update(); return n
fitted = {ob.name: fit_desk(ob) for ob in obs}
print('fit desk', DESK, fitted)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in obs}
print('pothos tris', tris, 'leaves', nleaf, 'drop below desk', drop)
st = L.export(OUT, gpu_instances=False)
if arg('--ctx'):   # Blender 渲染用的桌角（桌面 0.5×0.5、厚 2.5 cm，左緣 x=−0.11、前緣 z=+0.11；左邊抽屜櫃側板往內 2 cm）——只給驗收渲染，不是遊戲的東西
    for ob in list(bpy.data.objects): bpy.data.objects.remove(ob, do_unlink=True)
    B.reset(texres=256); ctx = B.group('desk_ctx'); wd = L.flat('ctx_desk', '#b98e62', rough=0.6); dk = Mesh('ctx_desk', wd)
    dk.box(-0.11, 0.39, -0.025, 0.0, -0.39, 0.11); dk.box(-0.09, 0.33, -0.60, -0.025, -0.37, 0.09); dk.finish(ctx, uv=False)
    bpy.ops.export_scene.gltf(filepath=arg('--ctx'), export_format='GLB', export_yup=True, export_apply=True)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'place': PLACE, 'tris': tris, 'tris_per_size': {k: tris['pothos_pot'] + tris['pothos_soil_stem_' + k] + tris['pothos_leaf_' + k] for k in SIZES},
                                            'leaves': nleaf, 'bytes': st['bytes'], 'materials': ['pothos_pot', 'pothos_soil_stem', 'pothos_leaf'],
                                            'nodes': {'pothos_pot': '盆、托盤（四種大小共用，一直顯示）', 'POTHOS_S1': '剛送來（大一）：短藤只越過盆緣', 'POTHOS_S2': '長了一點：藤到桌緣、垂下一點',
                                                      'POTHOS_S3': '一年多：垂下 20～30 cm', 'POTHOS_S4': '很久沒剪：垂下約 50 cm、盆裡葉子多一圈'},
                                            'show': '同一時間只顯示 POTHOS_S1～S4 其中一個（澆水次數、年級決定；LAWWW-B 定規則）',
                                            'size_m': {'pot_rim_d': 0.128, 'pot_h': POT_TOP, 'saucer_d': 0.142, 'lowest_below_desk_top': drop},
                                            'texture': 'tools/blender/env_second/textures/gen/pothos_leaf.png（本作，程式畫的）'})
