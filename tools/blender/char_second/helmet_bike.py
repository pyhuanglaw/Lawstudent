"""邱韋綸的公路車安全帽（BB_101／BB_201 第 1 節：腳踏車安全帽是他的識別物，「掛在後背包側邊就好」；參考圖 weilun.webp：黑色、銀白色的線條、長條通風孔）→ GLB。
LAWWW2-C 2026-10-17；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/helmet_bike.py [-- --out assets/models/char/second_ai/helmet_bike.glb]

外殼：半個橢球（寬 21 cm、長 29 cm、高 12.5 cm）往後拉長收尖、兩側下緣往下 2.2 cm（蓋到耳朵上面）；
參數是（左右角 lat、前後 lon）的格子，通風孔是和格子對齊的長方形（前後方向 5 個長孔＋前額 3 個＋後面 2 個），所以孔的邊是直的、不是鋸齒；
外殼有 2.2 cm 厚（EPS 內襯）：外面黑色亮面、兩側一條銀色、裡面和孔壁是深灰的內襯。下巴帶：兩側各一條前、一條後，在耳朵下面合成 Y 字，往下到扣環（自然垂著）。
座標＝three.js 模型座標：原點在下緣的中心、前方 −z、上方 +y；props3d 掛法建議寫在 .json 的 hang（掛在後背包右側，或背包外面）。
網格五個：helmet_shell（黑）、helmet_stripe（銀）、helmet_liner（深灰）、helmet_strap（黑色織帶）、helmet_buckle（深灰塑膠）。"""
import math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/helmet_bike.glb')
A, Bh, Cf = 0.105, 0.125, 0.132          # 半寬、高、前半長（後半再長 12%）
T = 0.022                                # 殼＋內襯厚度
NL, NA = 60, 56                          # 前後、左右的格子數
B.reset(texres=256)
M = {'shell': L.flat('helmet_shell', '#1c1d20', rough=0.30, metal=0.0),
     'stripe': L.flat('helmet_stripe', '#b9bcc1', rough=0.35, metal=0.40),
     'liner': L.flat('helmet_liner', '#3a3b3e', rough=0.85),
     'strap': L.flat('helmet_strap', '#141416', rough=0.8),
     'buckle': L.flat('helmet_buckle', '#2b2c30', rough=0.5)}
root = B.group('helmet_bike', props={'kind': 'prop_helmet', 'owner': 'econ_weilun', 'front': '-z'})


def surf(lat, lon):
    """外殼上的點（遊戲座標）：lat＝左右角（度，0＝正上方、±90＝下緣），lon＝前後（−1 前、+1 後）"""
    r = math.sqrt(max(0.0, 1 - lon * lon)); la = math.radians(lat); back = max(lon, 0.0)
    x = A * r * math.sin(la) * (1 - 0.30 * back * back)                   # 第二版：後面收尖、拉長（第一版像圓頂的通勤帽）
    y = Bh * r * math.cos(la) * (1 - 0.22 * back * back) - 0.022 * (1 - lon * lon) * (1 - math.cos(la))
    z = Cf * lon * (1.22 if lon > 0 else 1.0)
    return np.array([x, y, z])


# 通風孔：（左右角中心、半寬度°、前後中心、半長）；第二版：和格子對齊的長方形（第一版圓角長方形的寬度沿著孔一格一格變，孔邊是階梯）
VENTS = [(0, 8.0, -0.06, 0.52), (-27, 8.0, -0.08, 0.50), (27, 8.0, -0.08, 0.50), (-52, 7.0, -0.04, 0.40), (52, 7.0, -0.04, 0.40),
         (0, 6.5, -0.82, 0.07), (-21, 6.5, -0.80, 0.07), (21, 6.5, -0.80, 0.07), (-15, 7.0, 0.78, 0.10), (15, 7.0, 0.78, 0.10)]


def vent(lat, lon):
    return any(abs(lat - c) < hw and abs(lon - lc) < hl for c, hw, lc, hl in VENTS)


def stripe(lat, lon):
    return 68 <= abs(lat) <= 76 and -0.55 <= lon <= 0.70             # 第二版：細一點（第一版 15° 寬，像一條銀色的帶子）


LON = -np.cos(np.pi * np.linspace(0, 1, NL + 1))          # 前後：兩端（前額、後腦尖）密一點
LAT = np.linspace(-90, 90, NA + 1)
P = np.array([[surf(la, lo) for la in LAT] for lo in LON])   # [i(lon), j(lat)]
# 法線（往外）：數值偏微分的外積；兩端（點）用往外的方向
N = np.zeros_like(P)
for i in range(NL + 1):
    for j in range(NA + 1):
        lo, la = LON[i], LAT[j]; e = 1e-3
        du = surf(la, min(lo + e, 1)) - surf(la, max(lo - e, -1)); dv = surf(min(la + 0.1, 90), lo) - surf(max(la - 0.1, -90), lo)
        n = np.cross(du, dv); ln = np.linalg.norm(n)
        if ln < 1e-12 or abs(lo) > 0.9999: n = P[i, j] - np.array([0, -0.01, 0])
        n = n / (np.linalg.norm(n) + 1e-12)
        if np.dot(n, P[i, j] - np.array([0, -0.02, 0])) < 0: n = -n
        N[i, j] = n
Q = P - N * T                                               # 內襯那一面
solid = np.zeros((NL, NA), bool); stp = np.zeros((NL, NA), bool)
for i in range(NL):
    for j in range(NA):
        lo = 0.5 * (LON[i] + LON[i + 1]); la = 0.5 * (LAT[j] + LAT[j + 1])
        solid[i, j] = not vent(la, lo); stp[i, j] = stripe(la, lo)
sh = Mesh('helmet_shell', M['shell']); st = Mesh('helmet_stripe', M['stripe']); ln_ = Mesh('helmet_liner', M['liner'])


def quad(mesh, pts):
    """四邊形（遊戲座標）；退化成三角形（兩點重合）時去掉重複的點"""
    q = []
    for p in pts:
        if not q or np.linalg.norm(p - q[-1]) > 1e-7: q.append(p)
    if len(q) > 2 and np.linalg.norm(q[0] - q[-1]) < 1e-7: q.pop()
    if len(q) >= 3: mesh.quad([tuple(map(float, p)) for p in q])


for i in range(NL):
    for j in range(NA):
        if not solid[i, j]: continue
        o = [P[i, j], P[i + 1, j], P[i + 1, j + 1], P[i, j + 1]]
        if np.dot(np.cross(o[1] - o[0], o[3] - o[0]), N[i, j] + N[i + 1, j + 1]) < 0: o = o[::-1]
        quad(st if stp[i, j] else sh, o)
        inn = [Q[i, j], Q[i + 1, j], Q[i + 1, j + 1], Q[i, j + 1]]
        if np.dot(np.cross(inn[1] - inn[0], inn[3] - inn[0]), N[i, j] + N[i + 1, j + 1]) > 0: inn = inn[::-1]
        quad(ln_, inn)
        # 孔壁、下緣：這一格旁邊是孔或外面時補一圈壁（法線朝那個方向）
        for (a, b), nb in ((((i, j), (i + 1, j)), (i, j - 1)), (((i + 1, j + 1), (i, j + 1)), (i, j + 1)),
                           (((i + 1, j), (i + 1, j + 1)), (i + 1, j)), (((i, j + 1), (i, j)), (i - 1, j))):
            ni, nj = nb
            if 0 <= ni < NL and 0 <= nj < NA and solid[ni, nj]: continue
            if ni < 0 or ni >= NL: continue                       # 前後兩端是一個點，沒有邊
            pa, pb = P[a], P[b]
            if np.linalg.norm(pa - pb) < 1e-7: continue
            wall = [pa, pb, Q[b], Q[a]]
            cen = (P[i, j] + P[i + 1, j + 1]) / 2; mid = (pa + pb) / 2
            if np.dot(np.cross(wall[1] - wall[0], wall[3] - wall[0]), mid - cen) < 0: wall = wall[::-1]
            quad(ln_ if (0 <= nj < NA) else sh, wall)             # 孔壁＝內襯色；下緣（左右兩邊的邊）＝外殼的黑色


# ---- 下巴帶：每邊前、後兩條 → 耳朵下面的 Y 字 → 垂到扣環 ----
sp = Mesh('helmet_strap', M['strap']); bk = Mesh('helmet_buckle', M['buckle'])


def ribbon(pts, w=0.016, t=0.0015):
    """扁的織帶：寬度方向＝切線 × 從安全帽中心往外的水平方向"""
    pts = [np.array(p, float) for p in pts]; prev = None
    for k in range(len(pts)):
        tg = pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]; tg /= np.linalg.norm(tg)
        out = np.array([pts[k][0], 0.0, pts[k][2] * 0.4]); out = out / (np.linalg.norm(out) + 1e-9) if np.linalg.norm(out) > 1e-6 else np.array([0, 0, -1.0])
        wd = np.cross(tg, out); wd /= np.linalg.norm(wd) + 1e-9; nn = np.cross(wd, tg)
        ring = [pts[k] + wd * w / 2 + nn * t / 2, pts[k] - wd * w / 2 + nn * t / 2, pts[k] - wd * w / 2 - nn * t / 2, pts[k] + wd * w / 2 - nn * t / 2]
        if prev is not None:
            for q in range(4): quad(sp, [prev[q], ring[q], ring[(q + 1) % 4], prev[(q + 1) % 4]])
        prev = ring


for s in (-1, 1):
    fa = surf(s * 90, -0.30) + np.array([-s * T * 0.6, 0.004, 0]); ba = surf(s * 90, 0.40) + np.array([-s * T * 0.6, 0.004, 0])
    yj = np.array([s * 0.086, -0.072, 0.006])
    ribbon([fa, fa + np.array([0, -0.025, 0.004]), yj])
    ribbon([ba, ba + np.array([0, -0.022, -0.012]), yj])
    ribbon([yj, np.array([s * 0.074, -0.118, 0.0]), np.array([s * 0.042, -0.152, -0.006]), np.array([s * 0.014, -0.166, -0.008])])
    bk.boxc(s * 0.088, -0.072, 0.006, 0.006, 0.012, 0.020)          # Y 字的調整扣
bk.rbox(-0.020, 0.020, -0.176, -0.160, -0.019, 0.003, r=0.004, seg=2)   # 下巴的插扣

objs = [m.finish(root, uv=False, smooth=False) for m in (sh, st, ln_, sp, bk)]
for ob in objs:
    if ob is not None: L.smooth_mesh(ob, angle=0.9)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in objs if ob is not None}
print('helmet tris', tris, 'total', sum(tris.values()))
st_ = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st_['bytes'], 'size_m': {'w': 2 * A, 'l': round(Cf * 2.22, 3), 'h': Bh}, 'shell_t': T,
    'origin': '下緣的中心；前方 −z、上方 +y（three.js 模型座標）',
    'hang': {'side': {'bone': 'upperChest', 'pos': [0.178, -0.09, 0.15], 'rot': [0, 0, -1.5708], 'note': '後背包右側（props3d 的 +x＝人物右邊）：開口朝背包、前額朝前（下緣兩側比原點低 2.2 cm，所以離背包側面 2.8 cm）；手往後擺時可能碰到手肘，要在遊戲裡看'},
             'back': {'bone': 'upperChest', 'pos': [0.0, -0.10, 0.29], 'rot': [1.5708, 0, 0], 'note': '後背包外面：開口貼著前袋、前額朝上（不會碰到手）'}},
    'for': 'econ_weilun（BB_201 第 1 節：掛在後背包側邊）'})
