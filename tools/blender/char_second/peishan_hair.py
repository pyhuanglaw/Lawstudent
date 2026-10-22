"""郭沛珊（classmate_peishan）髮型：黑色、低而鬆的馬尾＋側分瀏海＋臉旁鬆散的長碎髮（LAWWW2-B 2026-10-15；照 BB 通過的參考圖
story-planning 分支 docs/story_planning/art_reference/classmate_peishan.webp、BB_109 第 2 節「低而鬆的馬尾、側分瀏海【已定案】」）。
從溫書瑀的 p05_hair.py（低馬尾、中分長瀏海，LAWWW 的檔案）複製改寫，只改這幾件事：
  - 髮色：深棕 → 近黑（參考圖的黑髮，受光處偏暖灰）；
  - 分線：幾乎中分 → 側分（人物的右邊，PART −22°）；瀏海往人物的左邊斜撥，靠分線那邊短、另一邊長到顴骨（不擋住眼鏡中間）；
  - 鬆：頭頂、兩側的髮殼比學姊蓬、第二層往後梳的髮片拱起來一點（學姊梳得整齊、沛珊鬆鬆的，兩人才分得開，BB_109）；
  - 臉旁碎髮比學姊長（到下巴下面）、多一束；後頸的碎髮多兩束；馬尾粗一點、綁點低一點。
座標：Blender Z 朝上、人物面向 -Y、+X＝人物的左手邊。"""
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
PART = -10.0             # 分線的方位角（度）：中間偏一邊（第二版，照立繪；第一版 −22° 側分＋一排瀏海，BB-C 10-17 不通過）
TIE_ELEV = -44.0         # 第十一版（BB-C：馬尾太高，和眼睛差不多高；立繪綁在後頸、耳垂以下）：−24° → −44°   # 綁點的仰角（度，從頭的中心往正後方量）：後頸上方（低馬尾）
PONY_BONES = 6
SIDE_BONES = 3
PONY_HIT = 0.034          # 低馬尾比較細； 馬尾彈簧骨的碰撞半徑：馬尾朝身體那一側約 4 cm 厚，走路、急轉身時不會壓進背（之後穿毛衣也留了厚度）
SEED = 20261016

# 髮際線（方位角 → 仰角，度；方位角 0＝前額正中、90＝人物左耳、180＝後頸）：前額 → 太陽穴 → 耳前的鬢角 → 越過耳朵上緣 → 耳後 → 後頸
# 第十一版（BB-C：耳朵上方的頭髮要蓋住耳朵上面三分之一到一半）：耳朵上方那一段低 6～9°
# 第十三版：改回原本（第十二版壓低 6～9° 之後，髮片從耳朵外緣出發，兩側往外翹成刺）
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
DEEP = np.array([0.058, 0.044, 0.038]); BASE = np.array([0.125, 0.098, 0.084]); LIGHT = np.array([0.245, 0.195, 0.165]); SHEEN = np.array([0.400, 0.330, 0.285])   # 第二版：深黑褐、看得出一束一束的亮面（立繪；BB-C 10-17：第一版純黑一塊）
# 第二版（2026-10-10）：照參考圖 01 取樣的灰棕（臉旁長髮、馬尾的中位數約 sRGB (0.35, 0.28, 0.24)、暗部 (0.27, 0.20, 0.17)）；
# 第一版 #3a2820 一帶偏暖偏深，遊戲裡打光之後像黑髮、瀏海尖端很硬
# 第二十九版（使用者 10-22 11:5x「臉啊頭髮啊 醜死了」，LAWWW2）：
#   - 遊戲渲染器裡頭髮的中位數是 sRGB (0.04, 0.02, 0.01)＝一頂純黑的安全帽；參考圖 classmate_peishan.webp 頭髮的中位數 (0.21, 0.18, 0.17)、
#     亮的那一成 (0.35, 0.31, 0.30)：深棕灰、看得出一束一束。整組顏色調亮、往參考圖的灰棕靠（HAIR_K 試亮度）。
#   - 前面改成參考圖的中分八字瀏海（見 apply 的「3b」）。PS_HAIR_V=28 做回第二十八版（顏色、瀏海都是舊的，位元組相同）。
V29 = os.environ.get('PS_HAIR_V', '29') != '28'
if V29:
    # 試做 a1（這組顏色、K 1.0）遊戲渲染器量到 (0.125, 0.09, 0.07)：太暗、偏紅棕（打光和 MToon 的暖色陰影都偏暖）→ 顏色偏冷一點、K 1.2
    _K = float(os.environ.get('HAIR_K', '1.3'))     # 試做 f3（K 1.2）量到中位數 (0.18, 0.15, 0.13)，參考圖 (0.21, 0.18, 0.17)
    DEEP = np.array([0.100, 0.092, 0.092]) * _K; BASE = np.array([0.235, 0.214, 0.212]) * _K
    LIGHT = np.array([0.390, 0.360, 0.355]) * _K; SHEEN = np.array([0.600, 0.560, 0.550]) * _K


# 第三十版（LAWWW 13:0x 驗收第二十九版沒通過：瀏海太短像一頂安全帽、太陽穴是硬的一條邊、臉旁沒有長碎髮、頭頂太蓬、三分之四側有梳痕、馬尾太高太緊）：
# 髮色照第二十九版（LAWWW：對，不要動）。PS_HAIR_V=29 做回第二十九版、=28 做回第二十八版（位元組相同）。
V30 = os.environ.get('PS_HAIR_V', '30') not in ('28', '29')
if V30: TIE_ELEV = -52.0      # 馬尾綁低一點（−44° → −52°：參考圖背面綁在後頸、耳垂下面）


def _json_env(name, default):
    """試參數用：環境變數（JSON）蓋過預設值，不改檔案就能一次只改一樣、同鏡頭比"""
    import json
    s = os.environ.get(name); return json.loads(s) if s else default


CUR_LIFT = _json_env('HAIR_CUR_LIFT', [0.0110, 0.0095, 0.0065] if V30 else [0.0150, 0.0115, 0.0065])   # 第三十版：頭頂貼一點（LAWWW：參考圖頭頂是貼著的）   # 八字瀏海離皮膚多遠（m）：越過髮際線、中段、髮尾


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


STREAK = (0.07, 0.17, 0.15) if V30 else ((0.10, 0.28, 0.24) if V29 else (0.18, 0.42, 0.38))   # 第二十九版：髮束、大塊明暗的對比降低（試做 f2 遊戲渲染器裡像木紋，一條一條很硬）；1px 細紋也淡一點（f4 遊戲內的距離變成雜訊）


def _strand_color(rng, h, w, root_dark=0.8, sheen=None, tip_light=0.06, base=BASE):
    """細髮絲（1px）＋中等髮束（4px）＋大的明暗（16px），沿長度方向拉長；髮根暗、髮尾稍亮；柔和的高光帶"""
    S = _streaks(rng, h, w, 2, 90, STREAK[0]) + _streaks(rng, h, w, 6, 170, STREAK[1]) + _streaks(rng, h, w, 20, 360, STREAK[2])
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
    put('lock', _strand_color(rng, h, w, 0.8, tip_light=0.14, base=BASE * 1.22), A)   # 第十一版：臉旁碎髮、斜瀏海亮一點（BB-C：深黑褐，不要純黑）
    # 瀏海：一束主髮束＋兩側較短的小束，收成尖端
    # （第二版，2026-10-10：原本每片 3 個寬三角形尖端，近看像鋸齒；參考圖是細的空氣瀏海）
    # 上段 45%（髮根、越過髮際線）合成一片；下段分成 5 束細髮束，長短不一、慢慢收尖、往中間微靠（一小撮一小撮），束和束之間露出額頭
    for nm, lens in (('bangA', (0.74, 1.0)), ('bangB', (0.70, 0.95))):
        x0, x1, y0, y1 = REG_PX[nm]; h, w = y1 - y0, x1 - x0
        A = _clumps(rng, h, w, 5, 0.50, lens[0], lens[1], hw_k=(0.95, 1.25), lean=0.10, power=0.6, full=3.0, minw=2.2)
        put(nm, _strand_color(rng, h, w, 0.82, tip_light=0.05), A)
    if V29:     # 八字瀏海的寬髮片（第二十九版用 bangA 這一格；舊的空氣瀏海貼圖已經沒有用到）：整片不透明、最後兩成分成 5 束柔和收尖，邊緣有長短不一的髮絲
        rc = np.random.default_rng(seed + 29)        # 另一個亂數：不影響後面髮殼、髮圈的貼圖
        x0, x1, y0, y1 = REG_PX['bangA']; h, w = y1 - y0, x1 - x0
        # 試做 a1：髮尾分束只在最後兩成、尖端齊（像剪齊的帽沿）→ 從 64% 開始分 6 束、長短差多一點、慢慢收細（參考圖的髮尾一撮一撮、有細的碎髮）
        # 試做 f4 遊戲內（男宿走廊、公館，鏡頭 1.5 m）：6 束細髮尖在遊戲的距離變成一排鋸齒點 → 4 束、寬一點、最細的針尖不要（minw 6 px）
        A = _edge_breakup(rc, _clumps(rc, h, w, 4, 0.68, 0.84, 1.0, edge_taper=0.05, hw_k=(1.25, 1.5), power=0.9, full=1.8, minw=6.0), 0.04)
        if V30:   # 第三十版：髮尾從一半就開始分 5 束、長短差很多、慢慢削細（LAWWW：髮尾細、不齊）；最細的針尖照舊不要（遊戲的距離會變點）
            A = _edge_breakup(rc, _clumps(rc, h, w, 5, 0.50, 0.66, 1.0, edge_taper=0.08, hw_k=(1.2, 1.5), power=0.75, full=1.4, minw=5.0), 0.06)
        put('bangA', _strand_color(rc, h, w, 0.88, sheen=(0.10, 0.26), tip_light=0.10), A)
    # 髮殼：不透明、偏暗；髮際線那一端細細的鋸齒
    x0, x1, y0, y1 = REG_PX['shell']; h, w = y1 - y0, x1 - x0
    A = _clumps(rng, h, w, 14, 0.975, 0.99, 1.0, hw_k=(1.1, 1.4), power=0.55)   # 第十三版：4 → 14 束（BB-C：髮際線前緣一階一階；細的髮尖比大鋸齒自然）   # 同上（原本 3 束、0.93）
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
        cl = m.get('clothes')
        cl = [cl] if cl is not None and not isinstance(cl, (list, tuple)) else list(cl or [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == arm and o not in (face, body) and not o.name.startswith('Hair')])
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
        if V30: return 0.0080 + 0.0040 * max(ca, 0) ** 1.2 + 0.0080 * sa ** 2 + 0.0016 * max(-ca, 0)   # 第三十版：頭頂、前額貼頭皮（0.011＋0.0085 → 0.008＋0.004），兩側略收
        return 0.0110 + 0.0085 * max(ca, 0) ** 1.2 + 0.0090 * sa ** 2 + 0.0016 * max(-ca, 0)   # 第十三版：兩側 0.012 → 0.009   # 第十一版（BB-C：太陽穴高度每邊比頭寬 1.5～2 cm）：兩側 0.0055 → 0.012   # 第八版：再鬆一點（第七版在遊戲裡還是貼著頭）
        # 第七版（BB-C v5：「鬆一點，不要往後貼」）：前額頭頂、兩側都再蓬 1～2 mm   # 沛珊：比學姊蓬（鬆鬆綁起來）   # 低馬尾：往後梳整齊，頭頂、兩側比沈以安服貼   # 前額頭頂蓬、兩側耳上也有蓬度（參考圖頭髮離頭皮約 2 cm）

    def off_shell(a, v):
        return 0.0022 + vol(a) * float(sstep(0.0, 0.42, v)) * (1 - 0.35 * float(sstep(0.72, 0.95, v))) + 0.0065 * float(sstep(0.82, 1.0, v))

    dV = sph(180, 40)       # 第十一版：綁點低（−44°）時，前面的髮片從前額直接 slerp 到綁點會走另一邊（從臉前面繞過去）→ 改走「經過後腦上方」的二次曲線
    def line_dir(a, v):
        d0 = sph(a, hairline_beta(a)); om = math.acos(float(np.clip(np.dot(d0, dT), -1, 1)))
        g = slerp(d0, dT, v)
        w = float(sstep(2.2, 2.7, om))
        if w <= 0: return g
        q = slerp(slerp(d0, dV, v), slerp(dV, dT, v), v)
        return _unit(g * (1 - w) + q * w)

    def path_len(a):        # 沿 line_dir 的角長度（v_end 用；二次曲線比直接 slerp 長）
        pts = [line_dir(a, t) for t in np.linspace(0, 1, 41)]
        return float(sum(math.acos(float(np.clip(np.dot(p0, p1), -1, 1))) for p0, p1 in zip(pts[:-1], pts[1:])))

    def surf(a, v, extra=0.0):
        d = line_dir(a, v); return c + d * (H.R(d) + off_shell(a, v) + extra), d

    RT = H.R(dT); T0 = c + dT * (RT + off_shell(180, 1.0))

    def v_end(a):    # 髮片停在綁點外 1.4 cm（髮圈蓋住）
        return 1 - (0.014 / RT) / max(0.3, path_len(a))

    def v_bang(a):   # 瀏海區（前額）的範圍：第二版沒有瀏海（立繪：額頭露出來、往後梳），往後梳的髮片從髮際線開始
        return 0.0

    # ---- 1. 髮殼 ----
    Nu, Nv, PAN = 128, 15, 4      # 第十一版：64 → 128（BB-C：髮際線前緣一階一階的）
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
        tt = 0.965 * (1 - (vv - vstart) / (vstop - vstart))       # 綁點那端＝髮根（貼圖上緣）；第八版：髮際線那端不用到貼圖最尖的 3.5%（第七版髮際線一排白點）
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=arch, tt=tt, tilt=0.08 if V30 else 0.25)   # 第三十版：髮片橫向的法線少偏一點（0.25：一片一條明暗＝LAWWW 說的梳痕）

    for k in range(72):            # 第十一版：52 → 72（髮際線前緣的鋸齒）
        a = -180 + 360 * (k + 0.5) / 72 + rng.uniform(-1.2, 1.2)
        swept(a, v_bang(a) + 0.02 + rng.uniform(0.0, 0.03), v_end(a), 0.0016 + 0.0010 * rng.random(), 1.75, 'swept')   # 第十三版：從髮際線後面 2% 開始（髮際線交給髮殼的細髮尖，髮片的平頭不露在最前面）
    for k in range(30):
        a = -180 + 360 * (k + rng.uniform(0.2, 0.8)) / 30
        vb = v_bang(a); vst = vb + (0.03 if vb > 0.01 else 0.0) + rng.uniform(0.0, 0.10)
        swept(a, vst, v_end(a) - rng.uniform(0.0, 0.05), 0.0028 + 0.0008 * rng.random(), rng.uniform(1.1, 1.5),
              'swept', bulge=0.0014 + 0.0010 * rng.random(), arch=0.11)   # 第七版：第二層再拱一點點（鬆）   # 沛珊：第二層比學姊拱一點點（鬆；第一版 0.0016＋、0.14：頭頂剪影一根根翹起來）     # 溫書瑀：第二層貼得比較近、不拱起（低馬尾往後梳整齊；第一版頭頂的剪影一根根翹起來）
    # 太陽穴的髮際線：幾束細碎髮從髮際線稍前方往後梳，讓邊緣不是一條硬線
    # 第七版拿掉：BB-C v5「太陽穴的白線」就是這幾束（細碎髮貼圖側著看是亮的線）
    # 後頸幾束沒收進馬尾的短碎髮（參考圖背面）：從髮際線稍上方往下垂 3～4 cm
    NAPE_DROP = {-163: 36, 152: 34, 168: 30}       # 第三十版：其中三束長一點（LAWWW：馬尾鬆一點、散出幾綹）
    for a in (-170, -163, -148, -134, 140, 152, 168):   # 沛珊：後頸沒收進馬尾的碎髮多幾束（鬆）
        b0_ = hairline_beta(a) + 7; q = []
        for k in range(8):
            t = k / 7; d = sph(a + 4 * t * np.sign(a), b0_ - (NAPE_DROP.get(a, 22) if V30 else 22) * t); q.append(c + d * (H.R(d) + 0.0045 + 0.003 * t))
        Q = H.push(np.array(q), 0.004); Dq = _unit(Q - c); Tq = tangents(Q)
        mb.ribbon(Q, _unit(np.cross(Dq, Tq)), Dq, 0.010, 'wisp', 'head', np.zeros(len(Q)), arch=0.0, both=True)
    # （試過頭頂另外加拱起的細碎髮：遊戲裡在頭的剪影上變成一條條暗色的「電線」，拿掉）
    n_swept = len(mb.F) - n_shell

    # ---- 3. 空氣瀏海 ----
    # 每一束：從頭頂的瀏海區（根部）往前越過髮際線（離額頭約 1.2 cm 的「空氣感」），沿額頭往下、往外撥，髮尾到眉毛；兩側較長、到顴骨。
    # (越過髮際線的方位角, 髮尾方位角, 髮尾高度（相對眉毛上緣）, 寬度, 貼圖)；分線在 PART（略偏人物右邊）
    # 溫書瑀：中分往兩旁撥的長瀏海——靠分線的幾束短、停在眉毛上方（看得到額頭），越往外越長、往外撥，最外面一束到顴骨（眼尾外側，不擋眼睛）
    # 第二版：每束加寬、外側兩束用「臉旁碎髮」那張較完整的貼圖（第一版是細髮束的貼圖，一條條分開，正面看很亂）
    # 第三版：全部用「臉旁碎髮」那張較完整的貼圖、再加寬（遊戲裡細髮束的瀏海一根根散開，看起來亂）；拿掉兩束細碎髮
    # 第四版：靠分線的兩束細一點、往兩旁撥得更開（第三版中間兩束太寬，正面看像一排齊瀏海、看不到中分）
    # 沛珊：側分（PART −22°），瀏海往人物的左邊（+）斜撥越過額頭；靠分線、往右邊的兩束短、到顴骨（參考圖側分瀏海）
    # 第二版（照立繪，BB-C 10-17）：不要一排瀏海；從分線兩旁各垂兩綹細的直碎髮，沿臉的兩側到下巴（立繪：額頭露出來、臉旁幾綹細碎髮）
    # 第三版：從太陽穴的髮際線（±32～40°）出發、細、用比較透的碎髮貼圖（第二版從分線旁邊直直垂下、太粗太黑，像兩根棒子）
    # 第七版（BB-C v5）：分線那一邊（PART 的那一側）一片斜瀏海，從分線旁邊往外撥、蓋住那一邊額頭的角，髮尾到眉尾～眼尾外側（不擋眼鏡中間）；
    # 另一邊塞到耳後（沒有瀏海）；額頭露出約七成。拿掉第三～六版太陽穴到臉頰的四束細碎髮（BB-C：像鐵絲彎的鉤子）
    sg = -1.0 if PART < 0 else 1.0
    # 第八版：用 lock 貼圖（第七版用空氣瀏海的 bangA／B：一條一條透光，遊戲裡幾乎看不到）、寬一點、三片疊在一起
    # 第十一版（BB-C：像一整塊，要分幾綹）：五片窄一點（1.1～1.3 cm）、長短不一、髮尾分開
    bangs = [(PART + sg * 2, PART + sg * 26, 0.014, 0.012, 'lock'), (PART + sg * 7, PART + sg * 32, 0.004, 0.013, 'lock'),
             (PART + sg * 12, PART + sg * 37, -0.006, 0.013, 'lock'), (PART + sg * 17, PART + sg * 42, -0.016, 0.012, 'lock'),
             (PART + sg * 22, PART + sg * 47, -0.026, 0.011, 'lock')]
    # 使用者 10-22「好憨」（LAWWW2）：額頭太大——參考圖是中分、兩邊都往外撥，露出的額頭是中間一個倒 V；3D 只有分線那一邊有瀏海、另一邊塞到耳後，
    # 額頭（髮際線到眉毛）是「眉毛到下巴」的 0.76 倍（參考圖約 0.5）。另一邊也加四綹往外撥的瀏海（比分線那邊短一點）
    if os.environ.get('HAIR_BANGS2', '1') != '0':      # 第二十七版起預設有（HAIR_BANGS2=0 回到第二十六版的單邊）
        bangs += [(PART - sg * 3, PART - sg * 27, 0.012, 0.012, 'lock'), (PART - sg * 9, PART - sg * 33, 0.002, 0.013, 'lock'),
                  (PART - sg * 15, PART - sg * 39, -0.008, 0.012, 'lock'), (PART - sg * 21, PART - sg * 45, -0.018, 0.011, 'lock')]

    def beta_at_z(a, z_tip):
        bt = 0.0
        for _ in range(30):
            d = sph(a, bt); r = H.R(d, True); bt += (z_tip - (c[2] + d[2] * r)) / max(0.03, r) * 57.3 * 0.8
        return bt

    if V29: bangs = []        # 第二十九版：舊的窄瀏海拿掉，換成下面「3b」的八字瀏海
    for ah, at, zt, w0, reg in bangs:
        ar = PART + (ah - PART) * 0.55; vr = 0.33
        dr = line_dir(ar, vr); p_root = c + dr * (H.R(dr) + off_shell(ar, vr) + 0.0042)
        bh = hairline_beta(ah) + 2.0; dh = sph(ah, bh); p_h = c + dh * (H.R(dh, True) + 0.0125)
        bt = beta_at_z(at, H.brow_z + zt + rng.uniform(-0.002, 0.002))
        am = ah + (at - ah) * 0.5; bm = bh + (bt - bh) * 0.5; dm = sph(am, bm); p_m = c + dm * (H.R(dm, True) + 0.0088)
        dt_ = sph(at, bt); p_t = c + dt_ * (H.R(dt_, True) + 0.0052)
        P = catmull(np.array([p_root, p_h, p_m, p_t]), 20); P, sl = resample(P, 32); n = len(P)   # 第十一版：15 → 32 點（BB-C：瀏海下緣一階一階）
        P = H.push(P, np.linspace(0.009, 0.0045, n)); P[1:-1] = P[1:-1] * 0.6 + (P[:-2] + P[2:]) * 0.2; P = H.push(P, np.linspace(0.009, 0.0045, n))
        D = _unit(P - c); Tn = tangents(P)
        side = _unit(np.cross(D, Tn)); width = w0 * (0.55 + 0.45 * sstep(0.0, 0.3, np.linspace(0, 1, n)))
        if os.environ.get('HAIR_DEBUG'): print('   bang', ah, at, 'root', np.round(p_root, 3), 'hl', np.round(p_h, 3), 'tip', np.round(P[-1], 3), 'w', np.round(width[[0, n // 2, -1]], 3), 'side', np.round(side[n // 2], 2))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(n), arch=0.10)
    # ---- 3b. 中分八字瀏海（第二十九版，使用者 10-22 11:5x「臉啊頭髮啊 醜死了」）----
    # 參考圖 classmate_peishan.webp（平常、微笑、大頭像）：分線在中間，兩邊的頭髮從分線往下、往外垂成兩片簾子，
    # 蓋住額頭的兩個角和眉毛的外側；露出的額頭是中間一個窄的倒 V（分線那裡約 1 cm、眉毛的高度約 3～4 cm）；
    # 靠中間的髮尾停在眉毛附近、往外撥，越往外越長，最外面到顴骨、包住臉的兩側。
    # 第二十八版是一根一根 1.1～1.3 cm 的窄髮片＋近黑色：正面看是幾根黑色的刺，額頭整片露出來。
    # 這一版每邊 7 片 2.0～2.6 cm 寬、彼此重疊的髮片（bangA 的寬髮片貼圖：整片不透明、只有髮尾分束），
    # 從分線旁邊的頭頂出發、越過髮際線時離額頭約 1.5 cm（蓬），雙面（側面看得到內側）。
    if V29:
        # 試做 a1 的 7 片：眉毛高度露出的額頭約 4.5 cm 寬（參考圖約 2.6 cm，到眉頭）→ 最裡面加一片短的、裡面兩片的髮尾往中間收
        # 試做 f2（最裡面髮尾 9°、15°）：中間只剩分線下面一點點，正面看像一排齊瀏海 → 裡面幾片的髮尾往外撥、停在眉頭上方，露出到眉頭的倒 V
        CUR = [(1, 13, 0.014, 0.016), (4, 19, 0.008, 0.020), (8, 25, 0.002, 0.023), (13, 32, -0.006, 0.025), (19, 40, -0.014, 0.026),
               (25, 48, -0.024, 0.025), (31, 55, -0.034, 0.023), (37, 61, -0.043, 0.021)]   # （越過髮際線、髮尾的方位角離分線幾度，髮尾高度相對眉毛 m，寬度 m）
        if V30:   # 第三十版：兩側加長——靠中間的停在眉毛～上眼皮、往外撥到外眼角，越往外越長，最外面到下顎（LAWWW：兩側長到眼睛／顴骨的高度）
            CUR = [(1, 16, 0.010, 0.016), (3, 22, 0.000, 0.019), (6, 28, -0.010, 0.021), (10, 34, -0.018, 0.023), (15, 41, -0.027, 0.024),
                   (20, 48, -0.037, 0.024), (26, 55, -0.049, 0.022), (32, 61, -0.061, 0.020)]
        CUR = _json_env('HAIR_CUR', CUR)
        for sgn_c in (1.0, -1.0):
            for k, (dh_, dt_a, zt, w0) in enumerate(CUR):
                ah = PART + sgn_c * dh_; at = PART + sgn_c * dt_a
                ar = PART + sgn_c * (0.8 + 0.15 * dh_); vr = 0.20 + 0.012 * k
                dr = line_dir(ar, vr); p_root = c + dr * (H.R(dr) + off_shell(ar, vr) + 0.0040)
                bh = hairline_beta(ah) + 3.0; dh = sph(ah, bh); p_h = c + dh * (H.R(dh, True) + CUR_LIFT[0])
                bt = beta_at_z(at, H.brow_z + zt + (rng.uniform(-0.005, 0.005) if V30 else rng.uniform(-0.0015, 0.0015)))   # 第三十版：髮尾高度差多一點（不齊）
                am = ah + (at - ah) * 0.45; bm = bh + (bt - bh) * 0.55; dm = sph(am, bm); p_m = c + dm * (H.R(dm, True) + CUR_LIFT[1])
                dtt = sph(at, bt); p_t = c + dtt * (H.R(dtt, True) + CUR_LIFT[2])
                P = catmull(np.array([p_root, p_h, p_m, p_t]), 20); P, sl = resample(P, 36); n = len(P)
                marg = np.linspace(0.010, CUR_LIFT[2] - 0.001, n)
                P = H.push(P, marg); P[1:-1] = P[1:-1] * 0.6 + (P[:-2] + P[2:]) * 0.2; P = H.push(P, marg)
                D = _unit(P - c); Tn = tangents(P); side = _unit(np.cross(D, Tn)); t = np.linspace(0, 1, n)
                width = w0 * (0.70 + 0.30 * sstep(0.0, 0.22, t)) * (1 - 0.30 * sstep(0.70, 1.0, t))
                if os.environ.get('HAIR_DEBUG'): print('   curtain', sgn_c, dh_, 'hl', np.round(p_h, 3), 'tip', np.round(P[-1], 3), 'w', round(w0, 3))
                mb.ribbon(P, side, D, width, 'bangA', 'head', np.zeros(n), arch=0.12, both=True)
        if V30:   # 第三十版：每邊一綹細碎髮從瀏海裡面斜斜越過鏡框外側上角、停在顴骨（LAWWW：有幾綹越過眼鏡框）
            for sgn_c in (1.0, -1.0):
                ah = PART + sgn_c * 9; at = PART + sgn_c * 36       # 髮尾在鏡框外側（試做 g1 停在 30°，從正面看在鏡片中間）
                ar = PART + sgn_c * 2.0; vr = 0.24; dr = line_dir(ar, vr); p_root = c + dr * (H.R(dr) + off_shell(ar, vr) + 0.0045)
                bh = hairline_beta(ah) + 3.0; dh = sph(ah, bh); p_h = c + dh * (H.R(dh, True) + CUR_LIFT[0] + 0.001)
                bt = beta_at_z(at, H.brow_z - 0.034)
                am = ah + (at - ah) * 0.55; bm = bh + (bt - bh) * 0.6; dm = sph(am, bm); p_m = c + dm * (H.R(dm, True) + 0.016)
                dtt = sph(at, bt); p_t = c + dtt * (H.R(dtt, True) + 0.019)
                P = catmull(np.array([p_root, p_h, p_m, p_t]), 20); P, sl = resample(P, 30); n = len(P)
                D = _unit(P - c); Tn = tangents(P); side = _unit(np.cross(D, Tn)); t = np.linspace(0, 1, n)
                if os.environ.get('HAIR_DEBUG'): print('   over-glasses wisp', sgn_c, 'tip', np.round(P[-1], 3))
                mb.ribbon(P, side, D, 0.0090 * (1 - 0.4 * t), 'wisp', 'head', np.zeros(n), arch=0.05, both=True)   # 細碎髮的貼圖（三小束、有空隙）：試做 g1 用 lock 像一條黑線
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
        for z, dx, dy in ((jaw + 0.030, 0.069, -0.034), (jaw + 0.008, 0.072, -0.037), (jaw - 0.012, 0.070, -0.035)):   # 第十一版：中段往外彎一點（BB-C：軟、有一點彎）   # 第七版：到下巴就停（BB-C v5：3～4 綹細的直碎髮到下巴）   # 沛珊：臉旁的長碎髮到下巴下面（參考圖鬆散垂在臉旁）     # 溫書瑀：臉旁碎髮只到下巴（其他頭髮都綁到後面），髮尾沿著下顎線往前收
            ctrl.append(np.array([sgn * dx, min(H.front_y(sgn * dx, z) - 0.024, dy), z]))
        P = catmull(np.array(ctrl), 16)
        P, s = resample(P, 25)
        marg = np.where(P[:, 2] > jaw, 0.008, 0.012); marg[:4] = [0.0035, 0.0045, 0.006, 0.007]     # 溫書瑀：下巴以下離脖子 1.2 cm（2.2 cm 時髮尾被推得往外翹）
        P = H.push(P, marg); P = push_spheres(P, colliders(arm, {'J_Bip_C_UpperChest', 'J_Bip_C_Neck'}), 0.012, start=12)
        for _ in range(2):
            P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
        P = H.push(P, marg)
        P, s = resample(P, 25); L = s[-1]
        # 下段微微的 S 形波浪（參考圖臉旁的長髮有弧度，不是一條直的；第二版 2026-10-10）
        uu = s / L   # 第二版：拿掉下段的 S 形波浪（BB-C：兩頰各一撮捲髮像鬢角；立繪是直的細碎髮）
        P = H.push(P, marg)
        Tn = tangents(P)
        out = _unit(np.column_stack([P[:, 0], -0.5 + 0.6 * P[:, 1], np.zeros(len(P))]))   # 髮片正面朝外、略朝前
        SIDE_SET = ((0.0, 0.26, 'lock', 0.0), (0.35 * sgn, 0.20, 'lock', 0.005)) if sgn * PART > 0 else ((0.0, 0.22, 'lock', 0.0),)
        if V30: SIDE_SET = ((0.0, 0.30, 'lock', 0.0), (0.40 * sgn, 0.22, 'lock', 0.006), (-0.35 * sgn, 0.20, 'lock', -0.005))   # 第三十版：兩邊都 3 綹、寬一點（LAWWW：臉兩側各兩三綹長的碎髮垂到下巴）
        for rot, wfac, reg, dx in SIDE_SET:   # 第八版再細（第七版遊戲裡像黑色的棒子）   # 第七版：分線那邊兩綹、另一邊一綹（其他塞到耳後），都細一點   # 第二版：兩束、細（立繪的臉旁碎髮是細的）   # 沛珊：多一束    # 溫書瑀：臉旁一束細的（第一版三束：正面看像鮑伯頭的兩塊）   # 主髮束＋兩旁各一小束（轉個角度，側面看有厚度、正面看比較蓬）
            nrm = _unit(out - Tn * np.sum(out * Tn, 1)[:, None])
            sd = _unit(np.cross(nrm, Tn))
            twist = np.linspace(0, 0.15 * sgn, len(P))[:, None]   # 第八版：少扭一點（0.5：下端轉過來，正面看往內勾）
            sd2 = _unit(sd * np.cos(twist + rot) + nrm * np.sin(twist + rot)); n2 = _unit(np.cross(Tn, sd2))
            if np.mean(np.sum(n2 * nrm, 1)) < 0: n2 = -n2
            width = 0.010 * (wfac / 0.26) * (1 - 0.70 * sstep(0.15, 1.0, s / L)) * (0.6 + 0.4 * sstep(0.0, 0.08, s / L))   # 第十一版（BB-C：根部約 1 cm、往下變細、末端半透明；第十版到下巴還是一樣寬，像黑鐵絲）
            mb.ribbon(P + nrm * dx, sd2, _unit(n2 * 0.5 + nrm * 0.3 + np.array([0, -0.45, 0.15])), width, reg, grp, s, arch=0.14, both=True)   # 法線偏向前方：亮度和瀏海接近
        side_chains[grp] = (P, s, jaw)
        # 臉頰旁較短的碎髮（太陽穴 → 顴骨 → 下顎，剛體）：和長的臉旁碎髮一起做出參考圖那種包住臉側的層次
        for a_r, a_m, wq in ():   # 第二版拿掉臉頰旁彎的短碎髮（BB-C：像鬢角的捲髮）
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
        # 耳前短碎髮：第七版拿掉（BB-C v5：像鐵絲彎的鉤子）
    n_side = len(mb.F) - n_shell - n_swept - n_bang

    # ---- 5. 馬尾 ----
    # 溫書瑀：低馬尾——綁點在後頸上方，先往後下方離開頭皮一點，再沿著後頸、襯衫領子外面垂到肩胛骨中間（高度照這個人物的脖子算）
    zN = float(C.bone_head(arm, 'J_Bip_C_Neck')[2])
    b0 = _unit(np.array([0, math.cos(math.radians(-35)), math.sin(math.radians(-35))]))
    def by(z, gap): return H.back_y(z) + gap
    ctrl = [T0, T0 + b0 * 0.022, T0 + np.array([0, 0.026, -0.040])]
    for z, gap in ((zN + 0.045, 0.040), (zN - 0.020, 0.040), (zN - 0.090, 0.036), (zN - 0.160, 0.031), (zN - 0.205, 0.027)):
        if z < T0[2] - 0.050: ctrl.append(np.array([0, by(z, gap), z]))   # 第十一版：綁點低了，比綁點高的控制點不用（不然馬尾先往上再往下）
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
    rr = np.interp(sn, [0, 0.03, 0.08, 0.18, 0.4, 0.65, 0.85, 1.0], [0.013, 0.016, 0.023, 0.030, 0.033, 0.031, 0.024, 0.013])
    if V30: rr = rr * (1 + 0.16 * sstep(0.05, 0.3, sn) * (1 - 0.6 * sstep(0.75, 1.0, sn)))   # 第三十版：綁得鬆一點（中段粗 16%）   # 沛珊：綁得鬆、比學姊粗   # 低馬尾：綁得緊、比高馬尾細
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
    me = bpy.data.meshes.new('Hair_S01'); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_S01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    atlas = make_atlas()
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array('S01_HairCard', atlas, os.path.join(wip, 's01_hair_atlas.png'))
    mat = C.mtoon_from('F00_000_Hair_00_HAIR_01', 'S01_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=False, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.78, 0.74, 0.74) if V29 else (0.80, 0.70, 0.70)     # 原本的頭髮陰影偏藍紫；深棕髮的陰影用暖色（第二十九版：灰棕髮，陰影不要太紅）
    try:      # Sendagaya Shino 樣本的頭髮材質有一張加亮的 MatCap（Matcap_RimHair）：頭頂、髮片邊緣斜著看會發白光（第一版的頭頂一圈白邊）
        mt.matcap_texture.index.source = None; mt.matcap_factor = (0.0, 0.0, 0.0)
    except Exception as ex: print('  matcap off failed', ex)
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
        s0 = float(np.interp(-(jaw + 0.03), -Ps[:, 2], ss))   # 第七版：臉旁碎髮到下巴就停，彈簧骨從下巴上面 3 cm 開始
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
    C.add_spring_group(arm, 'Hair_Ponytail', [pony[0]], stiffness=0.75, gravity=0.55, drag=0.5, hit_radius=PONY_HIT,
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
