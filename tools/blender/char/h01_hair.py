"""沈以安（heroine_01）新髮型：高馬尾＋空氣瀏海＋臉旁碎髮（Blender 髮片網格；v9.4 Blender 人物示範，2026-10-10）。
heroine_01.py --stages ...,hair 時執行 apply(m)：新建頭髮物件（Hair_H01）、馬尾與臉旁碎髮的骨頭鏈、彈簧骨群組、頭髮材質與貼圖，指定給 m['hair']。
不沿用 VRoid 樣本的髮束；全部在這裡用 numpy＋bpy 建出來：

 1. 量頭皮：Face 網格的 Face_00_SKIN＋Body 網格綁在頭上的面做成 BVH，從頭的中心往外打射線，得到每個方向頭皮的半徑
    （執行時量測、不寫死座標：臉部模組改了頭形，頭髮跟著貼合）。
 2. 髮殼：以綁點（後腦上方）為極點、髮際線為邊界的球面網格（u＝沿髮際線一圈、v＝從髮際線往綁點），
    貼著頭皮往外加厚——頭頂與前額較蓬、兩側往後梳較貼，靠近綁點的頭髮被拉高收進髮圈。
 3. 往後梳的髮片：沿著 u 固定的線（髮際線 → 綁點）做兩層有寬度、漸細的髮片；第二層離頭皮較遠、中段拱起，做出蓬度與髮束層次。
 4. 空氣瀏海（略偏一邊的分線、一束一束、到眉毛，看得到額頭）、兩側較長的瀏海、太陽穴垂到胸口的臉旁碎髮、太陽穴與耳前的短碎髮（讓髮際線不是一條硬線）。
 5. 高馬尾：綁點往後上方翹起再沿背部 S 形垂到肩胛骨下方；十幾片髮片圍成有蓬度的髮束（截面略扁），髮尾長短不一、稍微散開、微微內彎；深色髮圈。
 6. 貼圖：numpy 產生一張 1024 atlas（細髮絲、髮根到髮尾的明暗、柔和的高光帶、髮尾分成幾束尖端），MToon alpha MASK（cutout）。
    材質是單面：雙面的話 three.js 會把背面的法線翻過來，頭的剪影邊緣出現一條條暗色；兩面都看得到的臉旁碎髮另外做一層背面。
    髮片法線用「從頭的中心／馬尾中心線往外」的自訂法線，整頭頭髮的明暗是一個連續的體積，不是一片一片。
    遠看（遊戲的跟隨鏡頭）不要有細到 1～2 px 的 alpha：瀏海上段整片、下段才分尖端；髮束尖端太細的部分直接不畫。
 7. 骨頭：髮殼、瀏海、梳上去的髮片綁 J_Bip_C_Head（剛體）；馬尾一條 6 節的鏈、臉旁碎髮各 3 節，頂點權重沿鏈漸變；VRM 彈簧骨群組。

預算：約 11.4k 三角形（上限 14k）、一張 1024 貼圖、一個材質；新增骨頭 12 根（馬尾 6、兩側碎髮各 3）、彈簧骨群組 2 個。
驗證：tools/dev_scratch/spring_sim/sim_hair.js（CHAR_FILE=…）、遊戲 look-dev（tools/shots/char_lookdev.py）。
座標：Blender Z 朝上、人物面向 -Y、+X＝人物的左手邊（骨架空間＝世界座標；Face／Body 物件本身有 180° 旋轉，量測時換成世界座標）。"""
import math, os
import numpy as np
try:
    import bpy
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    import common as C
except ImportError:      # 只預覽貼圖時（一般 python3）不需要 bpy
    bpy = None

HEAD = 'J_Bip_C_Head'
PART = -6.0              # 分線的方位角（度）：略偏人物的右邊
TIE_ELEV = 50.0          # 綁點的仰角（度，從頭的中心往正後方量）：後腦上方偏高
PONY_BONES = 6
SIDE_BONES = 3
PONY_HIT = 0.04          # 馬尾彈簧骨的碰撞半徑：馬尾朝身體那一側約 4 cm 厚，走路、急轉身時不會壓進背（之後穿毛衣也留了厚度）
SEED = 20261010

# 髮際線（方位角 → 仰角，度；方位角 0＝前額正中、90＝人物左耳、180＝後頸）：前額 → 太陽穴 → 耳前的鬢角 → 越過耳朵上緣 → 耳後 → 後頸
HAIRLINE = [(0, 35), (20, 34), (35, 31), (50, 21), (58, 10), (66, 2), (74, -1), (82, 0), (90, 1), (100, 0),
            (108, -10), (118, -34), (132, -54), (150, -64), (165, -69), (180, -72)]

# ---------------- 小工具 ----------------
def _unit(v):
    v = np.asarray(v, float); n = np.linalg.norm(v, axis=-1, keepdims=True); return v / np.maximum(n, 1e-12)


def sph(a, b):
    """方位角 a、仰角 b（度）→ 單位向量（0＝正前方 -Y、+90＝+X、仰角往 +Z）"""
    a = np.radians(a); b = np.radians(b)
    return np.stack([np.sin(a) * np.cos(b), -np.cos(a) * np.cos(b), np.sin(b)], -1)


def slerp(d0, d1, t):
    d0 = _unit(d0); d1 = _unit(d1); om = math.acos(float(np.clip(np.dot(d0, d1), -1, 1)))
    if om < 1e-6: return d0
    return (math.sin((1 - t) * om) * d0 + math.sin(t * om) * d1) / math.sin(om)


def sstep(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def hairline_beta(a):
    a0 = ((a + 180) % 360) - 180; a = abs(a0)
    xs, ys = zip(*HAIRLINE)
    jit = (1.6 * math.sin(math.radians(a0) * 9 + 0.7) + 0.9 * math.sin(math.radians(a0) * 23 + 2.1)) * float(sstep(40, 70, a))   # 兩側與後頸的髮際線不是一條平滑的線
    return float(np.interp(a, xs, ys)) + jit


def catmull(P, n=24):
    P = np.asarray(P, float); Q = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]]); out = []
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(P[-1]); return np.array(out)


def resample(P, n):
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]; s = np.linspace(0, d[-1], n)
    return np.stack([np.interp(s, d, P[:, k]) for k in range(3)], -1), s


def tangents(P):
    T = np.gradient(P, axis=0); return _unit(T)


# ---------------- 貼圖 atlas（1024×1024；numpy 第 0 列＝圖片最上面；髮片的「髮根」在區塊上緣、髮尾在下緣）----------------
W = 1024
REG_PX = {'long': (0, 320, 0, 1024), 'swept': (320, 576, 0, 1024), 'lock': (576, 704, 0, 1024),
          'bangA': (704, 832, 0, 1024), 'bangB': (832, 960, 0, 1024), 'shell': (960, 1024, 0, 640), 'wisp': (960, 1024, 640, 896), 'tie': (960, 1024, 896, 1024)}
# 顏色（sRGB）：目標 #3a2820 附近的深棕，有明暗層次
DEEP = np.array([0.20, 0.135, 0.105]); BASE = np.array([0.33, 0.235, 0.18]); LIGHT = np.array([0.47, 0.355, 0.275]); SHEEN = np.array([0.60, 0.49, 0.40])


def reg_uv(name, pad=4):
    x0, x1, y0, y1 = REG_PX[name]
    return ((x0 + pad) / W, 1 - (y1 - pad) / W, (x1 - pad) / W, 1 - (y0 + pad) / W)   # (u0, v0, u1, v1)，v 朝上


def _resize(a, h, w):
    H0, W0 = a.shape; ys = np.linspace(0, H0 - 1, h); xs = np.linspace(0, W0 - 1, w)
    y0 = np.floor(ys).astype(int); x0 = np.floor(xs).astype(int); y1 = np.minimum(y0 + 1, H0 - 1); x1 = np.minimum(x0 + 1, W0 - 1)
    fy = (ys - y0)[:, None]; fx = (xs - x0)[None, :]
    return a[y0][:, x0] * (1 - fy) * (1 - fx) + a[y0][:, x1] * (1 - fy) * fx + a[y1][:, x0] * fy * (1 - fx) + a[y1][:, x1] * fy * fx


def _streaks(rng, h, w, px, py, amp):
    a = rng.random((max(2, h // py + 2), max(2, w // px + 2))); return (_resize(a, h, w) - 0.5) * 2 * amp


def _wobble(f, rng, amp, wl):
    h, w = f.shape; y = np.arange(h); dx = amp * np.sin(2 * np.pi * y / wl + rng.random() * 6.28) + 0.5 * amp * np.sin(2 * np.pi * y / (wl * 0.37) + rng.random() * 6.28)
    xs = np.arange(w)[None, :] + dx[:, None]; x0 = np.floor(xs).astype(int); fr = xs - x0
    return f[y[:, None], x0 % w] * (1 - fr) + f[y[:, None], (x0 + 1) % w] * fr


def _strand_color(rng, h, w, root_dark=0.8, sheen=None, tip_light=0.06, base=BASE):
    """細髮絲（1px）＋中等髮束（4px）＋大的明暗（16px），沿長度方向拉長；髮根暗、髮尾稍亮；柔和的高光帶"""
    S = _streaks(rng, h, w, 2, 90, 0.18) + _streaks(rng, h, w, 6, 170, 0.42) + _streaks(rng, h, w, 20, 360, 0.38)
    S = _wobble(S, rng, 1.6, 260)
    t = ((np.arange(h) + 0.5) / h)[:, None]
    g = root_dark + (1 - root_dark) * sstep(0.0, 0.3, t) + tip_light * t
    k = np.clip(0.5 + 0.42 * S, 0, 1)[..., None]
    col = (DEEP + (LIGHT - DEEP) * k * 0.92 + (base - (DEEP + LIGHT) / 2) * 0.9) * g[..., None]
    fine = _wobble(_streaks(rng, h, w, 1, 40, 1.0), rng, 1.2, 200)
    col = col + (LIGHT - BASE)[None, None, :] * 0.35 * np.clip(fine - 0.6, 0, 1)[..., None] * 2.5   # 少數較亮的髮絲
    if sheen is not None:
        c0, c1 = sheen
        band = sstep(c0 - 0.06, c0, t) * (1 - sstep(c1, c1 + 0.08, t)) * np.clip(0.55 + 0.6 * S, 0, 1)
        col = col + (SHEEN - BASE)[None, None, :] * 0.42 * band[..., None]
    return np.clip(col, 0, 1)


def _clumps(rng, h, w, n, t_split, Lmin, Lmax, edge_taper=0.0, hw_k=(1.0, 1.35), lean=0.15, power=0.75, merged_top=True, full=1.0, minw=1.6):
    """髮尾分成 n 束、各自漸細成尖端（長短不一）；t_split 以上（靠髮根）合成一片。回傳 alpha（h×w，0..1，邊緣 1px 柔化）"""
    xn = (np.arange(w) + 0.5) / w; t = ((np.arange(h) + 0.5) / h)[:, None]
    cen = (np.arange(n) + 0.5) / n + rng.uniform(-0.22, 0.22, n) / n; hw = 0.5 / n * rng.uniform(*hw_k, n)
    L = rng.uniform(Lmin, Lmax, n) - edge_taper * np.abs(cen - 0.5) * 2
    A = np.zeros((h, w))
    for i in range(n):
        u = np.clip((t - t_split) / max(1e-3, L[i] - t_split), 0, None)
        hwi = hw[i] * np.clip(1 - np.clip(u, 0, 1) ** full, 0, 1) ** power   # full>1：髮束維持寬度，接近末端才收尖
        cx = cen[i] + (0.5 - cen[i]) * lean * u
        A = np.maximum(A, np.clip((hwi - np.abs(xn[None, :] - cx)) * w, 0, 1) * (hwi * w > minw))   # 末端太細的針尖不要（遠看會變成散落的點）
    if merged_top: A[t[:, 0] < t_split] = 1
    return A


def _edge_breakup(rng, A, frac=0.07):
    """髮片左右邊緣：一部分髮絲提早結束（邊緣不是一條直線）"""
    h, w = A.shape; xn = (np.arange(w) + 0.5) / w; e = np.minimum(xn, 1 - xn)
    L = 0.35 + 0.65 * _resize(rng.random((2, max(2, w // 3))), 1, w)[0]
    t = ((np.arange(h) + 0.5) / h)[:, None]
    keep = np.where(e < frac, (t < L[None, :] * (0.6 + 0.4 * e / frac)).astype(float), 1.0)
    return A * keep


def make_atlas(seed=SEED):
    rng = np.random.default_rng(seed)
    img = np.zeros((W, W, 4)); img[..., :3] = BASE; img[..., 3] = 0
    def put(name, col, A):
        x0, x1, y0, y1 = REG_PX[name]; img[y0:y1, x0:x1, :3] = col; img[y0:y1, x0:x1, 3] = A
    # 馬尾、臉旁碎髮：大部分不透明，下段 28% 分成多束尖端；上段有柔和的高光帶（馬尾翹起的弧頂受光）
    x0, x1, y0, y1 = REG_PX['long']; h, w = y1 - y0, x1 - x0
    # 尖端區只佔最後 15%，而且髮束彼此重疊（覆蓋率高）：遠看 mipmap 平均後 alpha 不會剛好落在 0.5 附近變成一點一點的雜訊
    A = _clumps(rng, h, w, 5, 0.84, 0.92, 1.0, edge_taper=0.05, hw_k=(1.3, 1.6), power=1.0, full=2.2, minw=4.0)
    put('long', _strand_color(rng, h, w, 0.72, sheen=(0.08, 0.2), tip_light=0.10), A)
    # 往後梳的髮片：髮根（綁點那一端）不透明，髮際線那一端短短的鋸齒
    x0, x1, y0, y1 = REG_PX['swept']; h, w = y1 - y0, x1 - x0
    A = _clumps(rng, h, w, 6, 0.965, 0.985, 1.0, hw_k=(1.05, 1.4), power=0.8, full=1.5)   # 髮際線那一端的尖端短一點（原本 0.93：側面看髮際線像梳子）
    put('swept', _strand_color(rng, h, w, 0.85, sheen=(0.42, 0.56), tip_light=0.0), A)
    # 細碎髮（短髮片：太陽穴、耳前、瀏海之間）：3 小束、彼此有空隙、長短不一
    x0, x1, y0, y1 = REG_PX['wisp']; h, w = y1 - y0, x1 - x0
    A = _clumps(rng, h, w, 3, 0.05, 0.70, 1.0, hw_k=(0.62, 0.85), lean=0.0, power=0.9, merged_top=False, full=2.0, minw=2.0)
    put('wisp', _strand_color(rng, h, w, 0.9, tip_light=0.08), A)
    # 臉旁碎髮：下段 22% 分成 3 束較寬的尖端（遠看不會變成一條條細線）
    x0, x1, y0, y1 = REG_PX['lock']; h, w = y1 - y0, x1 - x0
    A = _clumps(rng, h, w, 3, 0.78, 0.9, 1.0, edge_taper=0.06, hw_k=(1.1, 1.35), power=0.9, full=1.7, minw=3.0)
    put('lock', _strand_color(rng, h, w, 0.8, tip_light=0.10), A)
    # 瀏海：一束主髮束＋兩側較短的小束，收成尖端
    # （第二版，2026-10-10：原本每片 3 個寬三角形尖端，近看像鋸齒；參考圖是細的空氣瀏海）
    # 上段 45%（髮根、越過髮際線）合成一片；下段分成 5 束細髮束，長短不一、慢慢收尖、往中間微靠（一小撮一小撮），束和束之間露出額頭
    for nm, lens in (('bangA', (0.74, 1.0)), ('bangB', (0.70, 0.95))):
        x0, x1, y0, y1 = REG_PX[nm]; h, w = y1 - y0, x1 - x0
        A = _clumps(rng, h, w, 5, 0.50, lens[0], lens[1], hw_k=(0.95, 1.25), lean=0.10, power=0.6, full=3.0, minw=2.2)
        put(nm, _strand_color(rng, h, w, 0.82, tip_light=0.05), A)
    # 髮殼：不透明、偏暗；髮際線那一端細細的鋸齒
    x0, x1, y0, y1 = REG_PX['shell']; h, w = y1 - y0, x1 - x0
    A = _clumps(rng, h, w, 4, 0.975, 0.99, 1.0, hw_k=(1.1, 1.4), power=0.55)   # 同上（原本 3 束、0.93）
    put('shell', _strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.86), A)
    # 髮圈：近黑色，中間一條柔和的光澤
    x0, x1, y0, y1 = REG_PX['tie']; h, w = y1 - y0, x1 - x0; t = ((np.arange(h) + 0.5) / h)[:, None]
    col = np.zeros((h, w, 3)) + np.array([0.055, 0.05, 0.05]) + np.array([0.09, 0.085, 0.085]) * np.exp(-((t - 0.5) / 0.12) ** 2)[..., None]
    put('tie', col, np.ones((h, w)))
    return img


# ---------------- 網格建構 ----------------
class MB:
    """頭髮網格的頂點、UV、自訂法線、權重群組（'head'、'pony'、'sideL'、'sideR'）與沿髮束的弧長 s"""
    def __init__(self):
        self.V, self.UV, self.N, self.G, self.S, self.F = [], [], [], [], [], []

    def grid(self, P, UV, N, grp, s):
        """P：(n, m, 3)，n 沿髮束、m 橫跨髮片；每個四邊形依 N 的方向決定繞向（正面朝外）"""
        n, m = P.shape[:2]; b = len(self.V)
        self.V.extend(P.reshape(-1, 3)); self.UV.extend(UV.reshape(-1, 2)); self.N.extend(_unit(N).reshape(-1, 3))
        self.G.extend([grp] * (n * m)); self.S.extend(np.repeat(np.asarray(s, float).reshape(n), m))
        for i in range(n - 1):
            for j in range(m - 1):
                q = [b + i * m + j, b + i * m + j + 1, b + (i + 1) * m + j + 1, b + (i + 1) * m + j]
                g = np.cross(P[i, j + 1] - P[i, j], P[i + 1, j] - P[i, j])
                if np.dot(g, N[i, j] + N[i + 1, j + 1]) < 0: q = q[::-1]
                self.F.append(q)

    def ribbon(self, P, side, nrm, width, reg, grp, s, ncross=2, arch=0.12, tt=None, tilt=0.25, both=False):
        n = len(P); a = np.linspace(-1, 1, ncross + 1); width = np.broadcast_to(np.asarray(width, float), (n,))
        G = P[:, None, :] + side[:, None, :] * (a[None, :, None] * width[:, None, None] / 2) + nrm[:, None, :] * (arch * width[:, None, None] * (1 - a[None, :, None] ** 2))
        u0, v0, u1, v1 = reg_uv(reg); tt = np.linspace(0, 1, n) if tt is None else np.asarray(tt, float)
        U = u0 + (u1 - u0) * (a + 1) / 2; Vv = v1 - (v1 - v0) * tt
        UV = np.stack(np.broadcast_arrays(U[None, :], Vv[:, None]), -1)
        N = np.broadcast_to(nrm[:, None, :] + side[:, None, :] * (tilt * a[None, :, None]), G.shape).copy()
        self.grid(G, UV, N, grp, s)
        if both: self.grid(G, UV, -N, grp, s)     # 背面另外做一層（材質是單面：頭上的髮片背面不畫，避免剪影邊緣出現翻面的暗色）


class Head:
    """頭皮量測（世界座標）"""
    def __init__(self, m):
        arm, face, body = m['arm'], m['face'], m['body']
        F = self._world(face); B = self._world(body)
        fmats = [s.material.name if s.material else '' for s in face.material_slots]
        fam = {HEAD} | set(C.descendants(arm, HEAD)); wB = C.vgroup_weights(body, fam); nF = len(F)
        fpolys = [(list(p.vertices), fmats[p.material_index]) for p in face.data.polygons]
        bpolys = [list(p.vertices) for p in body.data.polygons]
        skin = [pv for pv, mn in fpolys if 'Face_00_SKIN' in mn]
        bhead = [pv for pv in bpolys if min(wB[i] for i in pv) > 0.45]
        V = np.vstack([F, B]).tolist()
        self.scalp = BVHTree.FromPolygons(V, skin + [[i + nF for i in pv] for pv in bhead])
        # 衣服（服裝模組在頭髮之前執行時）：臉旁碎髮、馬尾要避開毛衣表面，不只避開皮膚——掛在骨架下、不是臉／身體／頭髮的網格都算
        cl = [o for o in (m.get('clothes') or [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == arm and o not in (face, body) and not o.name.startswith('Hair')])]
        CV, CP = [], []
        for o in cl:
            Xo = self._world(o); off = len(V) + sum(len(x) for x in CV); CV.append(Xo); CP += [[i + off for i in p.vertices] for p in o.data.polygons]
        if CV: V = V + np.vstack(CV).tolist()
        self.clothes = [o.name for o in cl]
        self.all = BVHTree.FromPolygons(V, [pv for pv, mn in fpolys] + [[i + nF for i in pv] for pv in bpolys] + CP)
        BB = B.tolist() + (np.vstack(CV).tolist() if CV else []); nB = len(B)
        self.body = BVHTree.FromPolygons(BB, bpolys + [[i - nF for i in pv] for pv in CP])
        sk = sorted({i for pv in skin for i in pv}); hk = sorted({i for pv in bhead for i in pv})
        S = np.vstack([F[sk], B[hk]])
        brow = sorted({i for pv, mn in fpolys if 'FaceBrow' in mn for i in pv})
        self.brow_z = float(F[brow][:, 2].mean()); self.brow_top = float(F[brow][:, 2].max())
        self.z_top = float(S[:, 2].max()); fr = F[sk]
        self.y_front = float(fr[fr[:, 2] > self.brow_top][:, 1].min()); self.y_back = float(B[hk][:, 1].max())
        hd = (self.y_back - self.y_front) / 2
        self.c = np.array([0.0, (self.y_front + self.y_back) / 2, self.z_top - hd])
        self.Rtop = hd

    @staticmethod
    def _world(o):
        mw = np.array(o.matrix_world); return C.co(o) @ mw[:3, :3].T + mw[:3, 3]

    def R(self, d, outside=False):
        """頭皮在方向 d 的半徑（outside＝從外面往內打，取最外層：瀏海、臉旁碎髮要在眉毛、耳朵、臉頰外面）"""
        d = _unit(d); c = Vector(self.c)
        if not outside:
            h = self.scalp.ray_cast(c, Vector(d), 0.4)[0]
            if h is not None: return float(np.dot(np.array(h) - self.c, d))
        h = self.all.ray_cast(Vector(self.c + d * 0.35), Vector(-d), 0.35)[0] if outside else self.scalp.ray_cast(Vector(self.c + d * 0.35), Vector(-d), 0.35)[0]
        if h is not None: return float(np.dot(np.array(h) - self.c, d))
        loc = self.scalp.find_nearest(Vector(self.c + d * 0.1))[0]
        return float(np.dot(np.array(loc) - self.c, d))

    def push(self, P, margin, bvh=None, iters=3):
        """點如果離皮膚不到 margin（或在皮膚裡面），沿表面法線推出去"""
        bvh = bvh or self.all; P = np.array(P, float); margin = np.broadcast_to(np.asarray(margin, float), (len(P),))
        for _ in range(iters):
            for i, p in enumerate(P):
                loc, nrm, _, _ = bvh.find_nearest(Vector(p))
                if loc is None: continue
                loc = np.array(loc); nrm = np.array(nrm); dd = float(np.dot(p - loc, nrm))
                if dd < margin[i]: P[i] = p + nrm * (margin[i] - dd)
        return P

    def back_y(self, z):
        h = self.body.ray_cast(Vector((0, 0.6, z)), Vector((0, -1, 0)), 1.0)[0]
        return float(h[1]) if h is not None else 0.06

    def front_y(self, x, z):
        h = self.all.ray_cast(Vector((x, -0.6, z)), Vector((0, 1, 0)), 1.0)[0]
        return float(h[1]) if h is not None else -0.05


def colliders(arm, names):
    out = []
    for cg in C.ext(arm).secondary_animation.collider_groups:
        if cg.node.bone_name not in names: continue
        for c in cg.colliders:
            ob = c.bpy_object
            if ob is not None: out.append((np.array(ob.matrix_world.translation), float(ob.empty_display_size)))
    return out


def push_spheres(P, spheres, hit, start=0):
    P = np.array(P, float)
    for i in range(start, len(P)):
        for cpos, r in spheres:
            d = P[i] - cpos; L = np.linalg.norm(d); need = r + hit + 0.004
            if L < need: P[i] = cpos + d / max(L, 1e-9) * need
    return P


def chain_weights(s, joints):
    """沿髮束弧長 s → [(骨頭序號, 權重)]；序號 0＝父骨（頭），1..n＝鏈上的骨頭；joints＝每節骨頭的起點弧長（含末端）"""
    js = joints[:-1]; seg = np.diff(joints); b = np.zeros_like(s)
    for k, sj in enumerate(js):
        h = 0.32 * min(seg[k], seg[k - 1] if k > 0 else seg[k] * 0.6)
        b = b + sstep(sj - h, sj + h, s)
    i0 = np.floor(b).astype(int); f = b - i0
    return i0, f


# ---------------- 主程式 ----------------
def apply(m):
    arm, face, body = m['arm'], m['face'], m['body']
    rng = np.random.default_rng(SEED)
    H = Head(m); c = H.c
    print('  hair: head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f' % (H.Rtop, H.brow_z, H.brow_top), 'avoid clothes', H.clothes)
    mb = MB()

    dT = sph(180, TIE_ELEV)

    def vol(a):     # 髮殼加厚：頭頂／前額蓬、兩側貼、後腦中等
        a = abs(((a + 180) % 360) - 180); ca = math.cos(math.radians(a))
        sa = abs(math.sin(math.radians(a)))
        return 0.0095 + 0.0065 * max(ca, 0) ** 1.2 + 0.0045 * sa ** 2 + 0.0010 * max(-ca, 0)   # 前額頭頂蓬、兩側耳上也有蓬度（參考圖頭髮離頭皮約 2 cm）

    def off_shell(a, v):
        return 0.0022 + vol(a) * float(sstep(0.0, 0.42, v)) * (1 - 0.35 * float(sstep(0.72, 0.95, v))) + 0.0065 * float(sstep(0.82, 1.0, v))

    def line_dir(a, v):
        return slerp(sph(a, hairline_beta(a)), dT, v)

    def surf(a, v, extra=0.0):
        d = line_dir(a, v); return c + d * (H.R(d) + off_shell(a, v) + extra), d

    RT = H.R(dT); T0 = c + dT * (RT + off_shell(180, 1.0))

    def v_end(a):    # 髮片停在綁點外 1.4 cm（髮圈蓋住）
        d0 = sph(a, hairline_beta(a)); om = math.acos(float(np.clip(np.dot(d0, dT), -1, 1)))
        return 1 - (0.014 / RT) / om

    def v_bang(a):   # 瀏海區（前額）的範圍：髮際線到 v_bang 這一段由瀏海蓋住
        a = abs(((a + 180) % 360) - 180); return 0.30 * float(1 - sstep(30, 44, a))

    # ---- 1. 髮殼 ----
    Nu, Nv, PAN = 64, 15, 4
    A_ = np.linspace(-180, 180, Nu + 1)
    vmax = min(v_end(a) for a in A_) + 0.02
    vs = np.linspace(0, vmax, Nv + 1)
    SP = np.zeros((Nu + 1, Nv + 1, 3)); SN = np.zeros_like(SP)
    for i, a in enumerate(A_):
        for j, v in enumerate(vs):
            p, d = surf(a, v); SP[i, j] = p; SN[i, j] = d
    u0, v0, u1, v1 = reg_uv('shell')
    for p in range(Nu // PAN):
        G = SP[p * PAN:p * PAN + PAN + 1].transpose(1, 0, 2); Nn = SN[p * PAN:p * PAN + PAN + 1].transpose(1, 0, 2)
        U = u0 + (u1 - u0) * np.linspace(0, 1, PAN + 1); Vv = v1 - (v1 - v0) * (1 - vs / vmax)
        UV = np.stack(np.broadcast_arrays(U[None, :], Vv[:, None]), -1)
        mb.grid(G, UV, Nn, 'head', np.zeros(Nv + 1))
    n_shell = len(mb.F)

    # ---- 2. 往後梳的髮片（兩層）----
    def swept(a, vstart, vstop, layer_off, wfac, reg, nseg=14, bulge=0.0, arch=0.1):
        vv = np.linspace(vstart, vstop, nseg + 1); P = []; D = []; Wd = []
        da = 360.0 / 52
        for v in vv:
            p, d = surf(a, v, layer_off + bulge * math.sin(math.pi * (v - vstart) / max(1e-3, vstop - vstart)))
            q, _ = surf(a + da, v, layer_off); P.append(p); D.append(d); Wd.append(np.linalg.norm(q - p))
        P = np.array(P); D = np.array(D); Tn = tangents(P)
        side = _unit(np.cross(D, Tn)); width = np.maximum(np.array(Wd) * wfac, 0.005)
        tt = 1 - (vv - vstart) / (vstop - vstart)       # 綁點那端＝髮根（貼圖上緣）
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=arch, tt=tt)

    for k in range(52):
        a = -180 + 360 * (k + 0.5) / 52 + rng.uniform(-1.5, 1.5)
        swept(a, v_bang(a) + (rng.uniform(0.0, 0.03) if v_bang(a) < 0.01 else 0.02), v_end(a), 0.0016 + 0.0010 * rng.random(), 1.75, 'swept')
    for k in range(30):
        a = -180 + 360 * (k + rng.uniform(0.2, 0.8)) / 30
        vb = v_bang(a); vst = vb + (0.03 if vb > 0.01 else 0.0) + rng.uniform(0.0, 0.10)
        swept(a, vst, v_end(a) - rng.uniform(0.0, 0.05), 0.0040 + 0.0012 * rng.random(), rng.uniform(1.1, 1.5),
              'swept', bulge=0.002 + 0.002 * rng.random(), arch=0.12)
    # 太陽穴的髮際線：幾束細碎髮從髮際線稍前方往後梳，讓邊緣不是一條硬線
    for sgn in (1, -1):
        for a in (45, 52, 59, 66):
            swept(sgn * (a + rng.uniform(-2, 2)), -0.03 - 0.02 * rng.random(), 0.34 + 0.1 * rng.random(), 0.0042, 0.62, 'wisp', nseg=10, bulge=0.0015)
    # 後頸幾束沒收進馬尾的短碎髮（參考圖背面）：從髮際線稍上方往下垂 3～4 cm
    for a in (-163, -148, 152, 168):
        b0_ = hairline_beta(a) + 7; q = []
        for k in range(8):
            t = k / 7; d = sph(a + 4 * t * np.sign(a), b0_ - 22 * t); q.append(c + d * (H.R(d) + 0.0045 + 0.003 * t))
        Q = H.push(np.array(q), 0.004); Dq = _unit(Q - c); Tq = tangents(Q)
        mb.ribbon(Q, _unit(np.cross(Dq, Tq)), Dq, 0.010, 'wisp', 'head', np.zeros(len(Q)), arch=0.0, both=True)
    # （試過頭頂另外加拱起的細碎髮：遊戲裡在頭的剪影上變成一條條暗色的「電線」，拿掉）
    n_swept = len(mb.F) - n_shell

    # ---- 3. 空氣瀏海 ----
    # 每一束：從頭頂的瀏海區（根部）往前越過髮際線（離額頭約 1.2 cm 的「空氣感」），沿額頭往下、往外撥，髮尾到眉毛；兩側較長、到顴骨。
    # (越過髮際線的方位角, 髮尾方位角, 髮尾高度（相對眉毛上緣）, 寬度, 貼圖)；分線在 PART（略偏人物右邊）
    bangs = [(-13, -17, 0.002, 0.027, 'bangA'), (-21, -29, -0.002, 0.028, 'bangB'), (-30, -40, -0.010, 0.026, 'bangA'), (-38, -51, -0.034, 0.023, 'bangB'),
             (7, 13, 0.001, 0.027, 'bangA'), (16, 25, -0.003, 0.027, 'bangB'), (25, 37, -0.011, 0.026, 'bangA'), (34, 50, -0.035, 0.023, 'bangB'),
             (-24, -21, -0.005, 0.013, 'wisp'), (11, 8, -0.002, 0.013, 'wisp')]

    def beta_at_z(a, z_tip):
        bt = 0.0
        for _ in range(30):
            d = sph(a, bt); r = H.R(d, True); bt += (z_tip - (c[2] + d[2] * r)) / max(0.03, r) * 57.3 * 0.8
        return bt

    for ah, at, zt, w0, reg in bangs:
        ar = PART + (ah - PART) * 0.55; vr = 0.33
        dr = line_dir(ar, vr); p_root = c + dr * (H.R(dr) + off_shell(ar, vr) + 0.0042)
        bh = hairline_beta(ah) + 2.0; dh = sph(ah, bh); p_h = c + dh * (H.R(dh, True) + 0.0125)
        bt = beta_at_z(at, H.brow_z + zt + rng.uniform(-0.002, 0.002))
        am = ah + (at - ah) * 0.5; bm = bh + (bt - bh) * 0.5; dm = sph(am, bm); p_m = c + dm * (H.R(dm, True) + 0.0088)
        dt_ = sph(at, bt); p_t = c + dt_ * (H.R(dt_, True) + 0.0052)
        P = catmull(np.array([p_root, p_h, p_m, p_t]), 10); P, sl = resample(P, 15); n = len(P)
        P = H.push(P, np.linspace(0.009, 0.0045, n)); P[1:-1] = P[1:-1] * 0.6 + (P[:-2] + P[2:]) * 0.2; P = H.push(P, np.linspace(0.009, 0.0045, n))
        D = _unit(P - c); Tn = tangents(P)
        side = _unit(np.cross(D, Tn)); width = w0 * (0.55 + 0.45 * sstep(0.0, 0.3, np.linspace(0, 1, n)))
        if os.environ.get('HAIR_DEBUG'): print('   bang', ah, at, 'root', np.round(p_root, 3), 'hl', np.round(p_h, 3), 'tip', np.round(P[-1], 3), 'w', np.round(width[[0, n // 2, -1]], 3), 'side', np.round(side[n // 2], 2))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(n), arch=0.10)
    n_bang = len(mb.F) - n_shell - n_swept

    # ---- 4. 臉旁碎髮（太陽穴 → 下顎 → 胸口）與耳前短碎髮 ----
    side_chains = {}
    for sgn, grp in ((1, 'sideL'), (-1, 'sideR')):
        ctrl = []
        d = sph(sgn * 52, 30); ctrl.append(c + d * (H.R(d) + 0.0035))     # 髮根藏在往後梳的髮片底下
        d = sph(sgn * 58, 15); ctrl.append(c + d * (H.R(d) + 0.0055))
        d = sph(sgn * 64, -4); ctrl.append(c + d * (H.R(d, True) + 0.008))
        d = sph(sgn * 62, -28); ctrl.append(c + d * (H.R(d, True) + 0.009))
        jaw = H.c[2] - 0.098
        for z, dx, dy in ((jaw, 0.070, -0.030), (jaw - 0.06, 0.079, -0.040), (jaw - 0.115, 0.086, -0.052), (jaw - 0.16, 0.083, -0.066)):
            ctrl.append(np.array([sgn * dx, min(H.front_y(sgn * dx, z) - 0.024, dy), z]))
        P = catmull(np.array(ctrl), 16)
        P, s = resample(P, 25)
        marg = np.where(P[:, 2] > jaw, 0.008, 0.022); marg[:4] = [0.0035, 0.0045, 0.006, 0.007]
        P = H.push(P, marg); P = push_spheres(P, colliders(arm, {'J_Bip_C_UpperChest', 'J_Bip_C_Neck'}), 0.012, start=12)
        for _ in range(2):
            P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
        P = H.push(P, marg)
        P, s = resample(P, 25); L = s[-1]
        # 下段微微的 S 形波浪（參考圖臉旁的長髮有弧度，不是一條直的；第二版 2026-10-10）
        uu = s / L; P[:, 0] += sgn * 0.006 * np.sin((uu - 0.35) / 0.65 * 2 * np.pi * 1.1) * sstep(0.30, 0.55, uu)
        P = H.push(P, marg)
        Tn = tangents(P)
        out = _unit(np.column_stack([P[:, 0], -0.5 + 0.6 * P[:, 1], np.zeros(len(P))]))   # 髮片正面朝外、略朝前
        for rot, wfac, reg, dx in ((0.0, 1.0, 'lock', 0.0), (0.55 * sgn, 0.7, 'lock', 0.0035), (-0.45 * sgn, 0.75, 'lock', -0.004)):   # 主髮束＋兩旁各一小束（轉個角度，側面看有厚度、正面看比較蓬）
            nrm = _unit(out - Tn * np.sum(out * Tn, 1)[:, None])
            sd = _unit(np.cross(nrm, Tn))
            twist = np.linspace(0, 0.5 * sgn, len(P))[:, None]
            sd2 = _unit(sd * np.cos(twist + rot) + nrm * np.sin(twist + rot)); n2 = _unit(np.cross(Tn, sd2))
            if np.mean(np.sum(n2 * nrm, 1)) < 0: n2 = -n2
            width = (0.031 - 0.011 * sstep(0.12, 0.42, s / L) + 0.006 * sstep(0.5, 0.85, s / L)) * wfac * (0.5 + 0.5 * sstep(0.0, 0.12, s / L))   # 第二版加寬（原本 2.4 cm：正面看像兩條細麵）
            mb.ribbon(P + nrm * dx, sd2, _unit(n2 * 0.5 + nrm * 0.3 + np.array([0, -0.45, 0.15])), width, reg, grp, s, arch=0.14, both=True)   # 法線偏向前方：亮度和瀏海接近
        side_chains[grp] = (P, s, jaw)
        # 臉頰旁較短的碎髮（太陽穴 → 顴骨 → 下顎，剛體）：和長的臉旁碎髮一起做出參考圖那種包住臉側的層次
        for a_r, a_m, wq in ((49, 57, 0.015), (55, 63, 0.011)):
            q = []
            d = sph(sgn * a_r, 24); q.append(c + d * (H.R(d) + 0.0035))
            d = sph(sgn * (a_r + 5), 4); q.append(c + d * (H.R(d, True) + 0.007))
            d = sph(sgn * a_m, -22); q.append(c + d * (H.R(d, True) + 0.008))
            q.append(np.array([sgn * (0.064 + 0.006 * (a_m - 57) / 6), -0.044, jaw + 0.012]))
            Q = catmull(np.array(q), 10); Q, sq = resample(Q, 16)
            Q = H.push(Q, np.r_[0.0035, 0.005, np.full(len(Q) - 2, 0.0065)])
            D = _unit(np.column_stack([Q[:, 0], -0.5 + 0.6 * Q[:, 1], 0.2 * np.ones(len(Q))])); Tq = tangents(Q)
            D = _unit(D - Tq * np.sum(D * Tq, 1)[:, None]); sdq = _unit(np.cross(D, Tq))
            wq_ = wq * (0.5 + 0.5 * sstep(0.0, 0.15, np.linspace(0, 1, len(Q))))
            mb.ribbon(Q, sdq, D, wq_, 'lock', 'head', np.zeros(len(Q)), arch=0.12, both=True)
        # 耳前短碎髮（剛體）
        Q = []
        for k in range(9):
            t = k / 8; d = sph(sgn * (66 + 3 * t), 12 - 34 * t); Q.append(c + d * (H.R(d, True) + 0.006 + 0.004 * math.sin(math.pi * t)))
        Q = H.push(np.array(Q), 0.005); D = _unit(Q - c); Tn = tangents(Q)
        mb.ribbon(Q, _unit(np.cross(D, Tn)), D, 0.009, 'wisp', 'head', np.zeros(len(Q)), arch=0.0, both=True)
    n_side = len(mb.F) - n_shell - n_swept - n_bang

    # ---- 5. 馬尾 ----
    b0 = _unit(np.array([0, math.cos(math.radians(26)), math.sin(math.radians(26))]))
    def by(z, gap): return H.back_y(z) + gap
    ctrl = [T0, T0 + b0 * 0.03, T0 + np.array([0, 0.062, 0.003]), T0 + np.array([0, 0.086, -0.04])]
    z1 = T0[2] - 0.12
    # 垂下的部分離背（皮膚）的距離：留毛衣的厚度；上段往外、中段貼著肩胛骨、髮尾微微往內彎（柔和的 S 形）
    ctrl += [np.array([0, max(T0[1] + 0.074, by(z1, 0.062)), z1]), np.array([0, by(1.37, 0.084), 1.37]),
             np.array([0, by(1.27, 0.071), 1.27]), np.array([0, by(1.17, 0.066), 1.17]), np.array([0, by(1.08, 0.053), 1.08])]
    P = catmull(np.array(ctrl), 24); P, s = resample(P, 120)
    sph_p = colliders(arm, {HEAD, 'J_Bip_C_Neck', 'J_Bip_C_UpperChest', 'J_Bip_C_Spine'})
    i_lift = int(np.searchsorted(s, 0.06))
    for _ in range(3):
        P = push_spheres(P, sph_p, PONY_HIT, start=i_lift)
        P[i_lift:] = H.push(P[i_lift:], 0.055, H.body, iters=1)
        P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
    P[0] = T0
    NP = 40; P, s = resample(P, NP); L = s[-1]; sn = s / L
    Tn = tangents(P); e1 = np.array([1.0, 0, 0]); e2 = _unit(np.cross(Tn, e1))
    if e2[len(e2) // 2][1] < 0: e2 = -e2        # e2 朝外（離開身體／頭）
    rr = np.interp(sn, [0, 0.03, 0.08, 0.18, 0.4, 0.65, 0.85, 1.0], [0.013, 0.017, 0.026, 0.035, 0.040, 0.038, 0.030, 0.018])
    print('  ponytail length %.3f m, tip %s' % (L, np.round(P[-1], 3)))
    def tip_tt(sc, tip=0.045):    # 貼圖的分束尖端（t>0.84）只用在每片的最後 4.5 cm：髮尾乾淨，遠看不會一大段變成點狀
        return np.interp(sc, [0, sc[-1] - tip, sc[-1]], [0, 0.84, 1.0])
    K = 14
    for i in range(K):
        th0 = 2 * math.pi * (i + rng.uniform(-0.15, 0.15)) / K; tw = rng.uniform(-0.25, 0.25)
        th = th0 + tw * np.sin(np.pi * sn)
        rho = rr * rng.uniform(0.93, 1.05) * (1 + 0.10 * sstep(0.8, 1.0, sn))
        fx = (0.95 + 0.15 * sstep(0.12, 0.45, sn))[:, None]; fy = (1.0 - 0.1 * sstep(0.12, 0.45, sn))[:, None]   # 綁點附近圓、往下垂的部分略扁（從背後看不會一開始就很寬）
        radial = np.cos(th)[:, None] * e1 * fx + np.sin(th)[:, None] * e2 * fy
        cen = P + radial * rho[:, None]
        nrm = _unit(np.cos(th)[:, None] * e1 + np.sin(th)[:, None] * e2)
        side = _unit(np.cross(nrm, Tn))
        width = 2 * math.pi * rr / K * 1.85 * (1 - 0.6 * sstep(0.7, 1.0, sn))   # 髮尾的尖靠幾何收窄（遠看乾淨），貼圖只做最後一小段的分束
        end = 1.0 - 0.08 * rng.random(); n_use = max(6, int(round(end * (NP - 1)))) + 1
        sl = slice(0, n_use)
        mb.ribbon(cen[sl], side[sl], nrm[sl], width[sl], 'long', 'pony', s[sl], arch=0.16, tt=tip_tt(s[sl]))
    for i in range(5):        # 內層（擋住馬尾中間的空隙）
        th = 2 * math.pi * i / 5 + 0.3
        nrm = _unit(math.cos(th) * e1 + math.sin(th) * e2); side = _unit(np.cross(nrm, Tn))
        cen = P + nrm * (rr * 0.4)[:, None]; n_use = NP - 2
        mb.ribbon(cen[:n_use], side[:n_use], nrm[:n_use], (rr * 1.3)[:n_use], 'long', 'pony', s[:n_use], arch=0.0, tt=tip_tt(s[:n_use]))
    # 髮圈
    s_tie = 0.011; it = int(np.searchsorted(s, s_tie)); pc = P[it]; ax = Tn[it]
    a1 = _unit(np.cross(ax, np.array([1.0, 0, 0]))); a2 = np.cross(ax, a1)
    Rm, rm, nu, nv = float(rr[it]) + 0.003, 0.005, 20, 8
    G = np.zeros((nv + 1, nu + 1, 3)); Nn = np.zeros_like(G); UV = np.zeros((nv + 1, nu + 1, 2)); tu0, tv0, tu1, tv1 = reg_uv('tie')
    for j in range(nv + 1):
        ph = 2 * math.pi * j / nv
        for i in range(nu + 1):
            th = 2 * math.pi * i / nu; rd = math.cos(th) * a1 + math.sin(th) * a2
            nn = math.cos(ph) * rd + math.sin(ph) * ax
            G[j, i] = pc + rd * Rm + nn * rm; Nn[j, i] = nn; UV[j, i] = (tu0 + (tu1 - tu0) * i / nu, tv0 + (tv1 - tv0) * j / nv)
    mb.grid(G, UV, Nn, 'head', np.zeros(nv + 1))
    n_pony = len(mb.F) - n_shell - n_swept - n_bang - n_side

    # ---- 6. 物件、材質 ----
    V = np.array(mb.V); Fc = mb.F
    me = bpy.data.meshes.new('Hair_H01'); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_H01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    atlas = make_atlas()
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array('H01_HairCard', atlas, os.path.join(wip, 'hair_HairCard_atlas.png'))
    mat = C.mtoon_from('F00_000_Hair_00_HAIR_01', 'H01_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=False, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.80, 0.70, 0.70)     # 原本的頭髮陰影偏藍紫；深棕髮的陰影用暖色
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None   # 範本的 VRoid 高光圖、法線圖對不上新的 UV，不用
    me.materials.append(mat)

    # ---- 7. 骨頭、權重、彈簧骨 ----
    Pp, sp = P, s
    j_s = np.linspace(0.055, L, PONY_BONES + 1)
    pts = np.stack([np.interp(j_s, sp, Pp[:, k]) for k in range(3)], -1)
    pony = C.add_bone_chain(arm, 'J_Sec_Hair_Pony', pts, HEAD)
    sides = {}
    for grp, (Ps, ss, jaw) in side_chains.items():
        s0 = float(np.interp(-jaw, -Ps[:, 2], ss))
        js = np.linspace(s0, ss[-1], SIDE_BONES + 1)
        pts = np.stack([np.interp(js, ss, Ps[:, k]) for k in range(3)], -1)
        sides[grp] = (C.add_bone_chain(arm, 'J_Sec_Hair_Side' + grp[-1], pts, HEAD), js)
    Gs = np.array(mb.G); Ss = np.array(mb.S); wts = {HEAD: np.zeros(len(V))}
    def chain(mask, names, joints):
        i0, f = chain_weights(Ss[mask], joints); allb = [HEAD] + names; idx = np.nonzero(mask)[0]
        for k, bn in enumerate(allb):
            w = np.where(i0 == k, 1 - f, 0) + np.where(i0 + 1 == k, f, 0)
            wts.setdefault(bn, np.zeros(len(V)))[idx] += w
    wts[HEAD][Gs == 'head'] = 1
    chain(Gs == 'pony', pony, j_s)
    for grp, (names, js) in sides.items(): chain(Gs == grp, names, js)
    tot = sum(wts.values()); tot[tot < 1e-6] = 1
    C.bind(obj, arm, {k: v / tot for k, v in wts.items() if v.max() > 1e-4})
    C.add_spring_group(arm, 'Hair_Ponytail', [pony[0]], stiffness=0.85, gravity=0.45, drag=0.5, hit_radius=PONY_HIT,
                       colliders={HEAD, 'J_Bip_C_Neck', 'J_Bip_C_UpperChest', 'J_Bip_C_Spine'})
    C.add_spring_group(arm, 'Hair_SideLocks', [sides['sideL'][0][0], sides['sideR'][0][0]], stiffness=1.0, gravity=0.35, drag=0.55, hit_radius=0.012,
                       colliders={HEAD, 'J_Bip_C_Neck', 'J_Bip_C_UpperChest', 'J_Bip_L_UpperArm', 'J_Bip_R_UpperArm'})
    m['hair'] = obj
    print('  hair: tris shell %d swept %d bangs %d side %d pony %d total %d; verts %d; bones pony %d side %d' % (
        2 * n_shell, 2 * n_swept, 2 * n_bang, 2 * n_side, 2 * n_pony, 2 * len(Fc), len(V), len(pony), SIDE_BONES))
    return obj


if __name__ == '__main__' and bpy is None:
    # 預覽貼圖：python3 tools/blender/char/h01_hair.py <輸出.png>
    import sys
    from PIL import Image
    a = make_atlas(); Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA').save(sys.argv[1])
