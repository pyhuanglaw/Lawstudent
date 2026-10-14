"""醉月湖（⑩）：石砌湖岸、岸邊的大石頭、湖心亭、木棧道 → assets/models/env/second_ai/campus_lake.glb（第二 AI 工作階段，LAWWW 佇列 ⑩）。
  /opt/blenv/bin/python tools/blender/env_second/campus_lake.py [-- --out 輸出.glb]
座標＝湖的本地座標（原點＝湖中心，x 往東、z 往南、y 往上）；遊戲裡整組放在 lake(g,nav,cx,cz,…) 的 (cx, 0, cz)（方案 A 是 (−36, −112)），湖再搬家也跟著走。
外形照 src/zones3d.js 的 lake()，兩邊一定對得上：
  湖岸：橢圓 A 16.5、B 9.2、80 點、rad(t)=1+0.10 sin(3t+0.6)+0.05 cos(5t+1.3)，法線照遊戲的算法；木棧道經過的南岸留缺口（|x−PX|<BW/2+0.5、z>0 的那幾段）。
  湖心亭：中心 (PX, PZ)=(−3, 0.6)、半徑 2.7（遊戲的導航：中心 2.35 m 內走得到）——六角形平台的平邊朝南北（南邊的平邊接木棧道）。
  木棧道：x PX±0.85、z 2.9～13.4（接南岸步道）。
人站的高度：遊戲裡人物站在 y=0，所以平台、木棧道的頂面做在 y 0.02（遊戲原本的平台頂面 0.05）。
不做（遊戲的 lake() 照舊）：水面（shader）、睡蓮、岸邊的草叢、樹、長椅、路燈；導航不變。
真實性：沒有照片可以核對（沙盒打不開臺大網站）；湖心亭、木棧道、石砌湖岸是一般台灣校園湖景的遊戲化設計，顏色照遊戲原本的（紅柱、深色瓦頂）。"""
import json, math, os, random, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402
from pmesh import PM, T, Ry, frame, box, lathe, bar, to_blender   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_lake.glb')
B.reset(texres=512)
root = B.group('campus_lake', props={'kind': 'campus_lake'})
rng = random.Random(1975)

# ---------------- 遊戲 lake() 的外形 ----------------
A_, B_, N = 16.5, 9.2, 80
rad = lambda t: 1 + 0.10 * math.sin(3 * t + 0.6) + 0.05 * math.cos(5 * t + 1.3)
P = [(math.cos(i / N * 2 * math.pi) * A_ * rad(i / N * 2 * math.pi), math.sin(i / N * 2 * math.pi) * B_ * rad(i / N * 2 * math.pi)) for i in range(N)]
NR = []
for i, p in enumerate(P):
    a, b = P[(i - 1) % N], P[(i + 1) % N]; nx, nz = b[1] - a[1], -(b[0] - a[0]); l = math.hypot(nx, nz) or 1; nx /= l; nz /= l
    if nx * p[0] + nz * p[1] < 0: nx, nz = -nx, -nz
    NR.append((nx, nz))
PX, PZ, PR, BW = -3.0, 0.6, 2.7, 1.7
BZ0, BZ1 = PZ + PR - 0.4, 13.4
def in_gap(i):
    a, b = P[i % N], P[(i + 1) % N]; mx, mz = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    return abs(mx - PX) < BW / 2 + 0.5 and mz > 0
DECK_Y = 0.02

# ---------------- 材質 ----------------
M = {
    'stone': L.pbr('lk_revetment', 'japanese_stone_wall', tile=1.6, target='#a8a295', sat=0.5, normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.85),
    'rock': L.pbr('lk_rock', 'mossy_rock', tile=1.2, target='#7b7b6c', sat=0.45, normal=0.7, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'granite': L.pbr('lk_granite', 'granite_tile', tile=1.5, target='#a29c92', sat=0.4, normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.6),
    'tile': L.pbr('lk_roof_tile', 'jp_kawara', tile=1.0, target='#4a524e', sat=0.4, normal=0.7, maps=('diff', 'nor'), res=512, rough_value=0.55),
    'soffit': L.pbr('lk_soffit', 'dark_wood', tile=1.0, target='#5a3e2a', maps=('diff',), res=256, rough_value=0.7),
    'plank': L.pbr('lk_plank', 'dark_planks', tile=1.0, target='#7a5a3e', normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.75),
    'pile': L.pbr('lk_pile', 'dark_wood', tile=0.8, target='#4a3626', maps=('diff',), res=256, rough_value=0.8),
    'red': L.flat('lk_red_lacquer', '#8e3a2c', rough=0.45),
    'teal': L.flat('lk_teal_paint', '#2f6a64', rough=0.5),
    'gold': L.flat('lk_gold', '#b08a3a', rough=0.35, metal=0.45),
    'cream': L.flat('lk_cream', '#e9e4d6', rough=0.6),
}
PMS = {}
def pm(part, key):
    k = (part, key)
    if k not in PMS: PMS[k] = PM()
    return PMS[k]
def nz(*k):
    """可重現的小雜訊（−1～1）"""
    v = math.sin(sum(x * c for x, c in zip(k, (12.9898, 78.233, 37.719))) ) * 43758.5453; return (v - math.floor(v)) * 2 - 1

# ================= 石砌湖岸 =================
TILE = 1.6
L_ACC = [0.0]
for i in range(N): a, b = P[i], P[(i + 1) % N]; L_ACC.append(L_ACC[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
def at(i, off, y):
    p, n = P[i % N], NR[i % N]; return (p[0] + n[0] * off, y, p[1] + n[1] * off)
CAP_Y, CAP_IN, CAP_OUT = 0.26, -0.07, 0.62
def cap_y(i): return CAP_Y + 0.018 * nz(i, 1)                 # 壓頂石的高度每一點差一點（不是一條直線）
def face_off(i): return 0.025 * nz(i, 2)                      # 石牆面每一點前後差一點
rim = pm('rim', 'stone')
for i in range(N):
    if in_gap(i): continue
    j = i + 1; u0, u1 = L_ACC[i] / TILE, L_ACC[i + 1] / TILE
    # 湖這一側的石牆：水下 −0.35 到壓頂石下（往上稍微內收）
    q = [at(i, -0.14 + face_off(i), -0.35), at(j, -0.14 + face_off(j), -0.35), at(j, -0.05 + face_off(j), cap_y(j) - 0.07), at(i, -0.05 + face_off(i), cap_y(i) - 0.07)]
    rim.face([rim.vid(x) for x in q], [(u0, -0.35 / TILE), (u1, -0.35 / TILE), (u1, (cap_y(j) - 0.07) / TILE), (u0, (cap_y(i) - 0.07) / TILE)], (-NR[i][0], 0, -NR[i][1]))
    # 壓頂石：前緣（朝湖）、頂面、後緣（往草地）
    a0, a1 = at(i, CAP_IN + face_off(i), cap_y(i) - 0.08), at(j, CAP_IN + face_off(j), cap_y(j) - 0.08)
    b0, b1 = at(i, CAP_IN + face_off(i), cap_y(i)), at(j, CAP_IN + face_off(j), cap_y(j))
    c0, c1 = at(i, CAP_OUT, cap_y(i) - 0.01), at(j, CAP_OUT, cap_y(j) - 0.01)
    d0, d1 = at(i, CAP_OUT, -0.03), at(j, CAP_OUT, -0.03)
    rim.face([rim.vid(x) for x in (a0, a1, b1, b0)], [(u0, 0.0), (u1, 0.0), (u1, 0.05), (u0, 0.05)], (-NR[i][0], 0, -NR[i][1]))
    rim.face([rim.vid(x) for x in (b0, b1, c1, c0)], [(u0, 0.0), (u1, 0.0), (u1, (CAP_OUT - CAP_IN) / TILE), (u0, (CAP_OUT - CAP_IN) / TILE)], (0, 1, 0))
    rim.face([rim.vid(x) for x in (c0, c1, d1, d0)], [(u0, 0.2), (u1, 0.2), (u1, 0.37), (u0, 0.37)], (NR[i][0], 0, NR[i][1]))
# 缺口兩端的端面（木棧道兩旁看得到石牆的剖面）
for i in range(N):
    if in_gap(i) == in_gap(i - 1): continue
    k = i
    side = [at(k, -0.14, -0.35), at(k, CAP_OUT, -0.35), at(k, CAP_OUT, cap_y(k) - 0.01), at(k, CAP_IN, cap_y(k)), at(k, -0.05, cap_y(k) - 0.07)]
    t_ = (P[(k + 1) % N][0] - P[k - 1][0], P[(k + 1) % N][1] - P[k - 1][1]); s_ = 1 if in_gap(i) else -1
    rim.face([rim.vid(x) for x in side], [(x[0] * 0.6, x[1] * 0.6) for x in side], (t_[0] * s_, 0, t_[1] * s_))

# ================= 岸邊的大石頭（置石：一半在水裡、一半在岸上） =================
def rock_mesh(sub, cx, cz, r, h, seed, yaw):
    """低多邊形的石頭：細分的八面體 → 依雜訊推擠、底部壓平；UV 用球面投影"""
    rr = random.Random(seed)
    V = [np.array(v, float) for v in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))]
    F = [(0, 2, 4), (4, 2, 1), (1, 2, 5), (5, 2, 0), (4, 3, 0), (1, 3, 4), (5, 3, 1), (0, 3, 5)]
    for _ in range(2):
        mid = {}; F2 = []
        def mp(a, b):
            k = (min(a, b), max(a, b))
            if k not in mid: v = V[a] + V[b]; V.append(v / np.linalg.norm(v)); mid[k] = len(V) - 1
            return mid[k]
        for (a, b, c) in F:
            ab, bc, ca = mp(a, b), mp(b, c), mp(c, a); F2 += [(a, ab, ca), (b, bc, ab), (c, ca, bc), (ab, bc, ca)]
        F = F2
    bumps = [(np.array((rr.uniform(-1, 1), rr.uniform(-0.3, 1), rr.uniform(-1, 1))), rr.uniform(-0.18, 0.12)) for _ in range(7)]
    W = []
    for v in V:
        v = v / np.linalg.norm(v); s = 1.0 + sum(k * max(0.0, float(np.dot(v, d / np.linalg.norm(d)))) ** 3 for d, k in bumps)
        p = v * s; p = np.array((p[0] * r, max(p[1], -0.25) * h, p[2] * r * rr.uniform(0.8, 1.0)))
        c, s_ = math.cos(yaw), math.sin(yaw); W.append(np.array((cx + p[0] * c + p[2] * s_, p[1], cz - p[0] * s_ + p[2] * c)))
    for (a, b, c) in F:
        pts = [W[a], W[b], W[c]]; ctr = sum(pts) / 3
        uvs = [(math.atan2(V[k][2], V[k][0]) / math.pi * 1.2 * r + 0.5, V[k][1] * h * 0.8) for k in (a, b, c)]
        sub.face([sub.vid(tuple(p)) for p in pts], uvs, tuple(ctr - np.array((cx, -0.1, cz))))
rocks = pm('rocks', 'rock')
cand = [i for i in range(N) if not in_gap(i) and not in_gap(i - 1) and not in_gap(i + 1)]
rng.shuffle(cand)
placed = []
for i in cand:
    if len(placed) >= 18: break
    p = P[i]
    if any(math.hypot(p[0] - q[0], p[1] - q[1]) < 3.2 for q in placed): continue
    if abs(p[0] - PX) < 3.0 and p[1] > 0: continue                                                # 木棧道附近不放
    off = rng.uniform(0.05, 0.45); r = rng.uniform(0.35, 0.8); h = r * rng.uniform(0.55, 0.85)
    cx, cz = p[0] + NR[i][0] * off, p[1] + NR[i][1] * off
    rock_mesh(rocks, cx, cz, r, h, 100 + i, rng.uniform(0, 6.28)); placed.append(p)
    if rng.random() < 0.45:                                                                       # 旁邊一顆小的
        a = rng.uniform(0, 6.28); rock_mesh(rocks, cx + math.cos(a) * r * 1.3, cz + math.sin(a) * r * 1.3, r * 0.5, r * 0.4, 300 + i, rng.uniform(0, 6.28))

# ================= 湖心亭 =================
HEX = [(math.cos(k * math.pi / 3), math.sin(k * math.pi / 3)) for k in range(6)]               # 頂點在 ±x：平邊朝南北（+z 那一邊接木棧道）
def hexpts(r, y, cx=PX, cz=PZ): return [(cx + r * c, y, cz + r * s) for (c, s) in HEX]
def hexband(sub, r0, y0, r1, y1, fn, want_out=True, cx=PX, cz=PZ):
    a, b = hexpts(r0, y0, cx, cz), hexpts(r1, y1, cx, cz)
    for k in range(6):
        k2 = (k + 1) % 6; mid = ((HEX[k][0] + HEX[k2][0]) / 2, (HEX[k][1] + HEX[k2][1]) / 2)
        q = [a[k], a[k2], b[k2], b[k]]; w = (mid[0], 0, mid[1]) if want_out else (0, 1 if y1 >= y0 else -1, 0)
        sub.face([sub.vid(x) for x in q], [fn(x) for x in q], w)
# 平台：花崗石，頂面 y 0.02，側面一直到水下
gr = pm('pavilion', 'granite')
plat = lambda p: ((p[0] + p[2]) / 1.5, p[1] / 1.5)
hexband(gr, PR, -0.5, PR, DECK_Y - 0.03, plat)
hexband(gr, PR, DECK_Y - 0.03, PR - 0.03, DECK_Y, plat)
gr.poly(hexpts(PR - 0.03, DECK_Y), lambda p: (p[0] / 1.5, p[2] / 1.5), (0, 1, 0))
# 柱子：花崗石柱珠＋紅漆圓柱
COL_R, COL_H = 2.3, 2.78
red = pm('pavilion', 'red')
for (c, s) in HEX:
    x, z = PX + COL_R * c, PZ + COL_R * s
    lathe(gr, [(0.16, DECK_Y, 0.17, DECK_Y + 0.06, lambda u, v: (u, v * 0.1), 'out'), (0.17, DECK_Y + 0.06, 0.13, DECK_Y + 0.14, lambda u, v: (u, v * 0.1), 'out')],
          12, caps=[(0.13, DECK_Y + 0.14, lambda a, b: (a, b), 'up')], M=T(x, 0, z))
    lathe(red, [(0.105, DECK_Y + 0.14, 0.095, COL_H, lambda u, v: (u, v), 'out')], 12, M=T(x, 0, z))
# 額枋（柱頭之間的橫梁：紅漆＋中間一條青綠彩畫）、雀替（柱子兩邊的托木）
teal, gold = pm('pavilion', 'teal'), pm('pavilion', 'gold')
for k in range(6):
    c0, c1 = HEX[k], HEX[(k + 1) % 6]
    p0 = np.array((PX + COL_R * c0[0], 0, PZ + COL_R * c0[1])); p1 = np.array((PX + COL_R * c1[0], 0, PZ + COL_R * c1[1]))
    d = (p1 - p0) / np.linalg.norm(p1 - p0); out = np.array((c0[0] + c1[0], 0, c0[1] + c1[1])); out /= np.linalg.norm(out)
    for (y0, y1, mat) in ((COL_H - 0.3, COL_H - 0.08, red), (COL_H - 0.08, COL_H + 0.06, red)):
        q0 = p0 + np.array((0, y0, 0)); q1 = p1 + np.array((0, y0, 0))
        M_ = frame(tuple(q0), (0, 1, 0), tuple(d)); L_ = float(np.linalg.norm(p1 - p0))
        sub = PM(); box(sub, -0.08, 0.08, 0, y1 - y0, 0, L_, {'*': lambda p: (p[2], p[1])}); mat.add(sub, M_)
    # 彩畫：橫梁外側中間一條（往外 0.082）
    mid0, mid1 = p0 + d * 0.25, p1 - d * 0.25
    for sgn in (1, -1):
        o = out * 0.0815 * sgn
        q = [tuple(mid0 + o + np.array((0, COL_H - 0.25, 0))), tuple(mid1 + o + np.array((0, COL_H - 0.25, 0))), tuple(mid1 + o + np.array((0, COL_H - 0.13, 0))), tuple(mid0 + o + np.array((0, COL_H - 0.13, 0)))]
        teal.face([teal.vid(x) for x in q], [(0, 0), (1, 0), (1, 1), (0, 1)], tuple(o))
    for (pa, dd) in ((p0, d), (p1, -d)):                                                           # 雀替：柱子旁邊的三角托木
        tri = [tuple(pa + dd * 0.1 + np.array((0, COL_H - 0.3, 0))), tuple(pa + dd * 0.55 + np.array((0, COL_H - 0.3, 0))), tuple(pa + dd * 0.1 + np.array((0, COL_H - 0.62, 0)))]
        for sgn in (1, -1):
            o = out * 0.04 * sgn; t3 = [tuple(np.array(x) + o) for x in tri]
            red.face([red.vid(x) for x in t3], [(0, 0), (1, 0), (0, 1)], tuple(o))
        gold.face([gold.vid(x) for x in (tuple(np.array(tri[1]) + out * 0.04), tuple(np.array(tri[1]) - out * 0.04), tuple(np.array(tri[2]) - out * 0.04), tuple(np.array(tri[2]) + out * 0.04))], [(0, 0), (1, 0), (1, 1), (0, 1)], tuple(-(dd + np.array((0, 1, 0)))))
# 屋頂：六角攢尖、凹曲面（屋簷平緩、往上越陡）、翼角起翹；瓦面（上）＋木板天花（下）＋簷口封板＋六條垂脊＋寶頂
RE, YE, YA, LIFT, NU, NV = 3.45, COL_H + 0.18, COL_H + 1.95, 0.32, 8, 7
def roof_pt(k, u, t, under=0.0):
    """第 k 面：u 0..1 沿屋簷（0、1＝翼角）、t 0..1 從屋簷到頂"""
    c0, c1 = HEX[k], HEX[(k + 1) % 6]; cx_, cz_ = c0[0] * (1 - u) + c1[0] * u, c0[1] * (1 - u) + c1[1] * u
    r = 1 - t * 0.965
    lift = LIFT * (abs(2 * u - 1) ** 4) * (1 - t) ** 2
    y = YE + (YA - YE) * t ** 1.8 + lift - under * (1 - 0.6 * t)
    sc = 1 + 0.06 * (abs(2 * u - 1) ** 3) * (1 - t)                                                 # 翼角往外伸一點
    return (PX + RE * r * cx_ * sc, y, PZ + RE * r * cz_ * sc)
tile_, sof = pm('pavilion', 'tile'), pm('pavilion', 'soffit')
for k in range(6):
    G = [[roof_pt(k, i / NU, j / NV) for j in range(NV + 1)] for i in range(NU + 1)]
    Gu = [[roof_pt(k, i / NU, j / NV, under=0.16) for j in range(NV + 1)] for i in range(NU + 1)]
    mid = HEX[k][0] + HEX[(k + 1) % 6][0], HEX[k][1] + HEX[(k + 1) % 6][1]
    for i in range(NU):
        for j in range(NV):
            q = [G[i][j], G[i + 1][j], G[i + 1][j + 1], G[i][j + 1]]
            tile_.face([tile_.vid(x) for x in q], [(i / NU * 3.2, j / NV * 2.4), ((i + 1) / NU * 3.2, j / NV * 2.4), ((i + 1) / NU * 3.2, (j + 1) / NV * 2.4), (i / NU * 3.2, (j + 1) / NV * 2.4)], (mid[0], 1.2, mid[1]))
            qu = [Gu[i][j], Gu[i + 1][j], Gu[i + 1][j + 1], Gu[i][j + 1]]
            sof.face([sof.vid(x) for x in qu], [(i / NU * 2, j / NV * 2), ((i + 1) / NU * 2, j / NV * 2), ((i + 1) / NU * 2, (j + 1) / NV * 2), (i / NU * 2, (j + 1) / NV * 2)], (0, -1, 0))
        q = [G[i][0], G[i + 1][0], Gu[i + 1][0], Gu[i][0]]                                          # 簷口封板（紅）
        red.face([red.vid(x) for x in q], [(i / NU, 0), ((i + 1) / NU, 0), ((i + 1) / NU, 0.1), (i / NU, 0.1)], (mid[0], 0, mid[1]))
    for j in range(NV):                                                                              # 天花的放射狀椽子（每面中間一根）
        a, b = roof_pt(k, 0.5, j / NV, under=0.2), roof_pt(k, 0.5, (j + 1) / NV, under=0.2)
        bar(red, a, b, 0.07, 0.05, lambda p: (p[0], p[1]))
# 垂脊（翼角到頂：圓脊，尾端翹起）
for k in range(6):
    pts = [roof_pt(k, 0.0, j / 14) for j in range(15)]
    pts = [(p[0], p[1] + 0.06, p[2]) for p in pts]
    tip = pts[0]; dirv = np.array(pts[0]) - np.array(pts[1]); dirv /= np.linalg.norm(dirv)
    pts = [tuple(np.array(tip) + dirv * 0.35 + np.array((0, 0.18, 0)))] + pts
    for a, b in zip(pts, pts[1:]): bar(tile_, a, b, 0.13, 0.11, lambda p: (p[0] * 2, p[1] * 2))
# 寶頂（金色葫蘆）
lathe(gold, [(0.16, YA - 0.02, 0.2, YA + 0.06, lambda u, v: (u, v), 'out'), (0.2, YA + 0.06, 0.07, YA + 0.16, lambda u, v: (u, v), 'out'),
             (0.07, YA + 0.16, 0.13, YA + 0.27, lambda u, v: (u, v), 'out'), (0.13, YA + 0.27, 0.06, YA + 0.4, lambda u, v: (u, v), 'out'),
             (0.06, YA + 0.4, 0.09, YA + 0.48, lambda u, v: (u, v), 'out'), (0.09, YA + 0.48, 0.0, YA + 0.62, lambda u, v: (u, v), 'out')], 12, M=T(PX, 0, PZ))

# ================= 木棧道 =================
plank, pile = pm('boardwalk', 'plank'), pm('boardwalk', 'pile')
HW = BW / 2
z = BZ0
while z < BZ1 - 0.005:
    z1 = min(z + 0.14, BZ1); jit = 0.008 * nz(z, 7)
    box(plank, PX - HW + jit, PX + HW + jit, DECK_Y - 0.04, DECK_Y, z, z1 - 0.012, {'t': lambda p: (p[0] / 1.2, p[2] / 1.2), '*': lambda p: (p[0] / 1.2, p[1] / 1.2)}, faces='tfkrl')
    z = z1
for sx in (-0.62, 0.62):                                                                             # 縱向的托梁
    box(pile, PX + sx - 0.05, PX + sx + 0.05, -0.2, DECK_Y - 0.04, BZ0, BZ1, {'*': lambda p: (p[2], p[1])}, faces='bfkrl')
zp = BZ0 + 0.9
while zp < BZ1 - 0.6:                                                                                # 橫梁＋水裡的木樁
    box(pile, PX - HW + 0.05, PX + HW - 0.05, -0.28, -0.2, zp - 0.06, zp + 0.06, {'*': lambda p: (p[0], p[1])})
    for sx in (-0.72, 0.72): lathe(pile, [(0.09, -0.8, 0.09, -0.06, lambda u, v: (u, v), 'out')], 8, caps=[(0.09, -0.06, lambda a, b: (a, b), 'up')], M=T(PX + sx, 0, zp))
    zp += 2.1
# 欄杆：柱子每 1.6 m、扶手、中間一道橫桿（亭子那一端、岸邊那一端開口）
RX = HW - 0.05
posts = []
zq = BZ0 + 0.25
while zq <= BZ1 - 0.25: posts.append(zq); zq += 1.6
if BZ1 - 0.25 - posts[-1] > 0.4: posts.append(BZ1 - 0.25)
for sx in (-RX, RX):
    for zq in posts: box(pile, PX + sx - 0.045, PX + sx + 0.045, DECK_Y, 0.95, zq - 0.045, zq + 0.045, {'*': lambda p: (p[2] + p[0], p[1])}, faces='tfkrl')
    box(plank, PX + sx - 0.05, PX + sx + 0.05, 0.92, 0.97, posts[0] - 0.05, posts[-1] + 0.05, {'*': lambda p: (p[2] / 1.2, p[0] / 1.2)})
    box(pile, PX + sx - 0.025, PX + sx + 0.025, 0.47, 0.53, posts[0], posts[-1], {'*': lambda p: (p[2], p[1])}, faces='tbrl')

# ================= 輸出 =================
objs = {}
for (part, key), p_ in PMS.items():
    if not p_.f: continue
    ob = to_blender(p_, f'lake_{part}_{key}', M[key], root, B, g2b, bpy); objs[ob.name] = p_.tris()
st = L.export(OUT, gpu_instances=False)
info = dict(st, tris_by_object=objs, origin='湖中心（遊戲 lake() 的 cx, cz）；x 東、z 南', outline={'A': A_, 'B': B_, 'N': N, 'rad': '1+0.10 sin(3t+0.6)+0.05 cos(5t+1.3)'},
            pavilion={'center': [PX, PZ], 'r': PR, 'deck_y': DECK_Y, 'col_r': COL_R, 'eave_r': RE, 'apex_y': YA},
            boardwalk={'x': [PX - HW, PX + HW], 'z': [BZ0, BZ1], 'deck_y': DECK_Y}, rocks=len(placed),
            hide_in_game='lake() 的程序化湖岸（rim）、湖心亭（deck、6 根柱、beam、roof、eave、fin）、木棧道（bw、兩條 rail、posts、piles）；水面、睡蓮、草叢、樹、長椅、路燈留著',
            nav_note='導航不變；木棧道走得到的寬度是 |x−PX|≤0.9（遊戲 onBoard），欄杆在 ±0.8：人走到邊上身體會穿過欄杆——建議接的時候把木棧道的可走寬度縮到 |x−PX|≤0.45')
L.write_json(OUT[:-4] + '.json', info)
print('ok', st.get('bytes'), sum(objs.values()), objs)
