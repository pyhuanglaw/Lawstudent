"""坐著讀書的人手上那本「打開的書」（READ-POSE-BOOK-1103，使用者 11-03：「不管事咖啡廳 還是圖書館 都給我這樣念書 會笑出來 書在哪」）→ GLB。
LAWWW 2026-11-03；Blender（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/book_open.py [-- --out assets/models/char/second_ai/book_open.glb]

一本打開的精裝書：單頁 15 × 20.7 cm（封面 15.3 × 21.3 cm），打開寬約 30.6 cm。
  ① 書頁：左右兩疊各 9 mm 厚，上面那一頁從書溝（中間）往外拱起來、到外緣變平、最外面略往下垂（真的打開的書，不是一片平板）；
  ② 書溝：兩疊在中間往下收進書脊；③ 封面：2.5 mm 的硬殼，比書頁大一圈（上、下、外緣各 3 mm），在書溝下面彎成書脊；
  ④ 紙的側邊：一層一層的淺色紙紋（貼圖）；⑤ 頁面：印刷的字行、段落、章名、頁碼、靠書溝的陰影（貼圖，字是灰色的線段，不是真的字：沒有任何真實書的內容）。
座標＝three.js 模型座標：原點在書溝的中間（頁面高度一半、書頁最低的地方）；x＝左右（左頁在 −x）、y＝頁面往上、+z＝頁面朝向讀的人。
一個網格、一個材質、一張 512×512 貼圖（頁面／紙的側邊／封面布紋在同一張）：每個讀書的人只多 1 次 draw call。
尺寸寫在 book_open.json（src/character3d.js 的 READ_BOOK 照這個放書、放手）。"""
import math, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, g2b   # noqa: E402
import bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/book_open.glb')
W, H2 = 0.150, 0.1035          # 單頁寬、頁面半高
OV = 0.003                     # 封面比書頁多出來的邊
T = 0.009                      # 一疊書頁的厚度
CT = 0.0025                    # 封面厚度
NX = 12                        # 每一頁沿 x 的格數
COVER = '#2e4a5c'              # 封面：深藍綠的布面（沒有書名、商標）


def top(s):
    """上面那一頁的高度（s＝離書溝 0～1）：書溝最低、往外拱起、外緣變平再略往下垂"""
    s = min(1.0, max(0.0, s))
    return 0.0 + 0.0135 * math.sin(min(1.0, s * 1.45) * math.pi / 2) - 0.0025 * max(0.0, s - 0.7) / 0.3


def under(s):
    """書頁那一疊的底（貼著封面內側）：書溝那邊往下收進書脊"""
    return top(s) - T * min(1.0, 0.35 + s * 4.0) - 0.004 * max(0.0, 1 - s / 0.08)


def cover_in(x):
    """封面內側（x 是實際座標，含多出來的邊）：書頁底下；書溝下面彎成書脊"""
    s = abs(x) / W; c = under(min(1.0, s)) if s <= 1 else under(1.0)
    sp = 0.014                 # 書脊半寬
    if abs(x) < sp: c = min(c, under(0.0) - 0.006 * (1 - (x / sp) ** 2))
    return c


# ---------- 貼圖（512×512；v 往上：上半＝兩頁的頁面、0.25～0.5＝紙的側邊、0～0.25＝封面布紋）----------
R = 512
rng = np.random.default_rng(1103)
img = np.zeros((R, R, 3), np.float32)          # [列（v 從下往上）, 欄, rgb]（sRGB 0～1）
def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)
paper = hexrgb('#f1ebdd'); ink = hexrgb('#5a5650')
# ① 頁面：欄＝x（−W～W → 0～R），列＝y（−H2～H2 → R/2～R）
pg = np.tile(paper, (R // 2, R, 1))
px_x = R / (2 * W); px_y = (R // 2) / (2 * H2)     # 每公尺幾個像素
def rows(y0, y1): return int((y0 + H2) * px_y), int((y1 + H2) * px_y)
def cols(x0, x1): return int((x0 + W) * px_x), int((x1 + W) * px_x)
line = 0.0062; lh = 0.0021
for side in (-1, 1):
    xin, xout = 0.017, W - 0.016                  # 靠書溝的邊、外邊
    xa, xb = (-xout, -xin) if side < 0 else (xin, xout)
    ytop, ybot = H2 - 0.019, -H2 + 0.024
    y = ytop
    if side < 0:                                  # 左頁：章名（粗一點、短一點），下面空一行
        r0, r1 = rows(y - 0.0045, y); c0, c1 = cols(xa + 0.03, xb - 0.03); pg[r0:r1, c0:c1] = ink * 0.9 + paper * 0.1; y -= 0.016
    para_left = True
    while y > ybot:
        n_words = 0; x = xa + (0.008 if para_left else 0.0); para_left = False
        end = xb if rng.random() > 0.12 else xa + (xb - xa) * rng.uniform(0.3, 0.8)   # 段落最後一行比較短
        if end < xb: para_left = True
        while x < end - 0.004:
            wl = rng.uniform(0.004, 0.016); x2 = min(end, x + wl)
            r0, r1 = rows(y - lh, y); c0, c1 = cols(x, x2)
            pg[r0:max(r1, r0 + 1), c0:max(c1, c0 + 1)] = ink * 0.75 + paper * 0.25
            x = x2 + 0.0022; n_words += 1
        y -= line
    r0, r1 = rows(-H2 + 0.009, -H2 + 0.0115); c0, c1 = cols(side * (W - 0.03) - 0.004, side * (W - 0.03) + 0.004)   # 頁碼
    pg[r0:r1, min(c0, c1):max(c0, c1)] = ink * 0.7 + paper * 0.3
xs = (np.arange(R) + 0.5) / px_x - W          # 每一欄的 x
shade = 1 - 0.30 * np.exp(-np.abs(xs) / 0.010) - 0.06 * np.exp(-np.abs(xs) / 0.04)   # 靠書溝的陰影（紙往下彎進去）
pg *= shade[None, :, None]
pg *= (1 + rng.normal(0, 0.012, pg.shape[:2]))[:, :, None]   # 紙的細微斑點
img[R // 2:, :] = pg
# ② 紙的側邊（列 R/4～R/2；v 方向＝書頁那一疊的厚度方向）：一頁一頁的細線
ed = np.tile(hexrgb('#e9e1cf'), (R // 4, R, 1))
for r in range(R // 4):
    k = 0.93 + 0.07 * math.sin(r * 2.1) + rng.normal(0, 0.015)
    ed[r] *= k
img[R // 4:R // 2, :] = ed
# ③ 封面布紋（列 0～R/4）
cv = np.tile(hexrgb(COVER), (R // 4, R, 1)) * (1 + rng.normal(0, 0.035, (R // 4, R)))[:, :, None]
weave = 1 + 0.03 * np.sin(np.arange(R) * 1.7)[None, :, None] + 0.03 * np.sin(np.arange(R // 4) * 1.9)[:, None, None]
img[:R // 4, :] = cv * weave
img = np.clip(img, 0, 1)

B.reset(texres=0)
im = bpy.data.images.new('book_open_atlas', R, R, alpha=False)
rgba = np.concatenate([img, np.ones((R, R, 1), np.float32)], axis=2)
im.pixels.foreach_set(rgba.ravel())
im.pack()
mat = bpy.data.materials.new('book_open'); mat.use_nodes = True
N = mat.node_tree.nodes; bsdf = N['Principled BSDF']; tx = N.new('ShaderNodeTexImage'); tx.image = im
mat.node_tree.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.85
mat.use_backface_culling = True

# ---------- 網格（遊戲座標，自己給 UV）----------
bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
def face(pts, uvs):
    vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f
U_PAGE = lambda x, y: ((x + W) / (2 * W), 0.5 + 0.5 * (y + H2) / (2 * H2))
U_EDGE = lambda a, t: (a, 0.25 + 0.25 * min(1.0, max(0.0, t)))      # a＝沿著邊 0～1，t＝厚度方向 0～1
U_COV = lambda a, b: (0.02 + 0.96 * a, 0.02 + 0.21 * b)
for side in (-1, 1):
    S = [i / NX for i in range(NX + 1)]
    for i in range(NX):
        s0, s1 = S[i], S[i + 1]; x0, x1 = side * s0 * W, side * s1 * W
        # 頁面（朝 +z）
        q = [(x0, -H2, top(s0)), (x1, -H2, top(s1)), (x1, H2, top(s1)), (x0, H2, top(s0))]
        uv = [U_PAGE(*p[:2]) for p in q]
        if side < 0: q, uv = q[::-1], uv[::-1]
        face(q, uv)
        # 書頁那一疊的上、下緣（紙的側邊）
        for yy, sg in ((H2, 1), (-H2, -1)):
            q = [(x0, yy, under(s0)), (x1, yy, under(s1)), (x1, yy, top(s1)), (x0, yy, top(s0))]
            uv = [U_EDGE(abs(p[0]) / W, (p[2] - under(abs(p[0]) / W)) / max(1e-4, top(abs(p[0]) / W) - under(abs(p[0]) / W))) for p in q]
            if (side * sg) > 0: q, uv = q[::-1], uv[::-1]
            face(q, uv)
    # 書頁外緣
    xo = side * W; q = [(xo, -H2, under(1)), (xo, H2, under(1)), (xo, H2, top(1)), (xo, -H2, top(1))]
    uv = [U_EDGE(0.5 + 0.5 * p[1] / H2, 0.0 if p[2] == under(1) else 1.0) for p in q]
    if side < 0: q, uv = q[::-1], uv[::-1]
    face(q, uv)
# 封面：從左邊外緣到右邊外緣一整片（內側＋外側＋邊），中間彎成書脊
NXC = 2 * NX + 6
XS = sorted(set([-(W + OV)] + [-W * (1 - i / NX) for i in range(NX)] + [-0.014, -0.007, 0.0, 0.007, 0.014] + [W * i / NX for i in range(1, NX + 1)] + [W + OV]))
YC = H2 + OV
def ci(x): return cover_in(x)
for a, b in zip(XS, XS[1:]):
    ua, ub = (a + W + OV) / (2 * (W + OV)), (b + W + OV) / (2 * (W + OV))
    zi_a, zi_b = ci(a), ci(b); zo_a, zo_b = zi_a - CT, zi_b - CT
    face([(a, -YC, zi_a), (b, -YC, zi_b), (b, YC, zi_b), (a, YC, zi_a)], [U_COV(ua, 0), U_COV(ub, 0), U_COV(ub, 1), U_COV(ua, 1)])   # 內側（朝 +z）
    face([(a, YC, zo_a), (b, YC, zo_b), (b, -YC, zo_b), (a, -YC, zo_a)], [U_COV(ua, 1), U_COV(ub, 1), U_COV(ub, 0), U_COV(ua, 0)])   # 外側（朝 −z）
    face([(a, YC, zi_a), (b, YC, zi_b), (b, YC, zo_b), (a, YC, zo_a)], [U_COV(ua, 1)] * 2 + [U_COV(ub, 0.95), U_COV(ua, 0.95)])     # 上緣
    face([(a, -YC, zo_a), (b, -YC, zo_b), (b, -YC, zi_b), (a, -YC, zi_a)], [U_COV(ua, 0)] * 2 + [U_COV(ub, 0.05), U_COV(ua, 0.05)])  # 下緣
for xo, sg in ((-(W + OV), -1), (W + OV, 1)):
    z0, z1 = ci(xo), ci(xo) - CT
    q = [(xo, -YC, z1), (xo, YC, z1), (xo, YC, z0), (xo, -YC, z0)]
    if sg < 0: q = q[::-1]
    face(q, [U_COV(0.5, 0), U_COV(0.5, 1), U_COV(0.52, 1), U_COV(0.52, 0)])
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
bm.normal_update()
root = B.group('book_open', props={'kind': 'prop_book_open', 'front': '+z', 'note': 'READ-POSE-BOOK-1103'})
ob = B.mesh_obj('book_open', bm, mat, root)
L.smooth_mesh(ob, angle=0.6)
tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
print('book tris', tris)
st_ = L.export(OUT, gpu_instances=False)
# 給遊戲放書、放手用的尺寸（src/character3d.js 的 READ_BOOK）
L.write_json(OUT.replace('.glb', '.json'), {
    'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st_['bytes'], 'tex': R,
    'page_w': W, 'half_h': H2, 'cover_over': OV, 'cover_t': CT, 'pages_t': T,
    'outer_page_top_z': round(top(1.0), 4), 'outer_cover_back_z': round(cover_in(W + OV) - CT, 4), 'gutter_back_z': round(cover_in(0.0) - CT, 4),
    'frame': '原點＝書溝中間；x 左右、y 頁面往上、+z 朝向讀的人'})
