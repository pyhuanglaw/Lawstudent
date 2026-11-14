"""公館燒臘（noodle 區域＝原本的阿鳳麵店改成燒臘店，AA_612 A 表）室內 v5 → GLB。BB（帳號 A）2026-11-03。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/shaola_interior.py [-- --out <glb>]
照 SCENE_RULES 第 11、12 節：參考圖 docs/story_planning/ref_images/shops/gongguan_shaola_int.webp 就是規格；拆圖清單在
docs/story_planning/bb_models/shaola/README.md（23 項）。配置照 src/data/shaola_layout.js v1（LAWWW2 11-03 23:08 選 A：6 × 13 × 3.2 窄長老店）：
  房間中心在原點、x 東、z 南、y 上；店門在 +z（z＝6.5，門 x −0.8～0.8，兩邊是窗）。
  左邊一欄 5 張不鏽鋼方桌（x −2.1；z 4.0／2.2／0.4／−1.4／−3.2；0.8 × 0.8）＋紅色圓凳（遊戲坐的位置 z ±0.62；靠牆那邊多一張只是擺著）；
  中間走道 x −1.3～0.9；右邊整排不鏽鋼櫃台 x 1.0～1.9、z −4.5～5.4：前段燒臘玻璃櫃（z 2.2～5.4）、中段砧板檯（−1.0～2.2）、後段盛飯台（−4.5～−1.0）；
  櫃台後面靠右牆的層架（x 2.7～3.0、z −4.5～3.0）；後牆：菜單板、不鏽鋼工作檯、往廚房的布簾門（x 1.5、寬 1.0）、不鏽鋼冰箱＋紅籃（[2.4, −5.6, 1.2, 0.9]）。
  配置之外多的導航阻擋（給 LAWWW2 補）寫在 EXTRA_BLOCKS，也存進 GLB 根節點的 props。
做法：牆、地、天花板用 PIL＋numpy 自己畫的貼圖（shaola_tex.py：發黃的舊灰泥＋水漬、暗沉方格天花板、髒的小方磚地＋粗糙度圖、刷紋不鏽鋼＋凹痕）；
  小東西的字和花紋在一張印刷圖集；燒臘、圓凳、調味罐是頂點色（燒鴨、油雞照高度做焦糖色漸層，粗糙度 0.2）；材質 12 個。
v8（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 11-13）：頂點色零件照顏色分族到 ambientCG 材質組（cc0kit.std_route：白／灰／黑塑膠、紙箱、金屬、紅色塑膠凳和籃子），
  燒臘、醬料這些飽和的小東西照舊頂點色；收銀機、冰箱上的紅籃和紙箱換 Poly Haven 掃描模型。位置、座位、導航阻擋都沒動。
D77：店名是遊戲裡的替代名（使用者給的圖照用）、沒有真實品牌；D112：地板是淺色小方磚；金屬度 ≤ 0.45（遊戲沒有環境貼圖）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import shaola_tex as TX   # noqa: E402
import cc0kit as KK   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/shaola_interior.glb')
GEN = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/shaola'); os.makedirs(GEN, exist_ok=True)
PI = math.pi
# ---- 配置（src/data/shaola_layout.js v1 的數字）----
W, D, H = 6.0, 13.0, 3.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
TABLES_Z = [4.0, 2.2, 0.4, -1.4, -3.2]; TX_, TW = -2.1, 0.8
AISLE = (-1.3, 0.9)
CT = dict(x0=1.0, x1=1.9, z0=-4.5, z1=5.4, h=0.92)
CASE_Z, CHOP_Z, RICE_Z = (2.2, 5.4), (-1.0, 2.2), (-4.5, -1.0)
SHELF = dict(x0=2.7, x1=3.0, z0=-4.5, z1=3.0)
KDOOR = (1.0, 2.0)
FRIDGE = dict(x0=1.8, x1=3.0, z0=-6.05, z1=-5.15)          # 配置的 [2.4, −5.6, 1.2, 0.9]
DOOR = (-0.8, 0.8)
LEAF_DEG = -100                                                # 左邊門扇往外開（開在騎樓那一側）：參考圖的鏡頭在門的右邊，遊戲的門在 x −0.8～0.8、鏡頭照參考圖的桌子位置要站在 x −1.2，往裡開的門扇會擋在鏡頭右前方
BACKTABLE = dict(x0=-2.9, x1=-0.35, z0=-6.5, z1=-5.92)        # 後牆不鏽鋼工作檯（參考圖第 10 項）
EXTRA_BLOCKS = [[round((BACKTABLE['x0'] + BACKTABLE['x1']) / 2, 3), round((BACKTABLE['z0'] + BACKTABLE['z1']) / 2, 3), round(BACKTABLE['x1'] - BACKTABLE['x0'], 3), round(BACKTABLE['z1'] - BACKTABLE['z0'], 3), '後牆不鏽鋼工作檯'],
                [-2.75, 0.0, 0.4, 0.0, '靠牆的圓凳（每桌一張，z＝桌子；見 README）']]
EXTRA_BLOCKS = EXTRA_BLOCKS[:1] + [[-2.74, z, 0.36, 0.36, f'靠牆的圓凳（第 {i + 1} 桌）'] for i, z in enumerate(TABLES_Z)] + [[-1.5, z, 0.36, 0.36, f'靠走道的圓凳（第 {i + 1} 桌；走道剩 x −1.32～0.9＝2.2 m）'] for i, z in enumerate(TABLES_Z)]
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}

random.seed(612); R = random.Random(612)
B.reset(texres=1024)
root = B.group('shaola_interior', props={'kind': 'shaola_interior', 'layout': 'src/data/shaola_layout.js', 'w': W, 'd': D, 'h': H,
                                         'extraBlocks': json.dumps(EXTRA_BLOCKS, ensure_ascii=False)})
G = {s: B.group(f'WALL_{s}', root, props={'dir': DIRS[s]}) for s in DIRS}
P = TX.build_all(GEN, TABLES_Z, AISLE); C = TX.CELLS


# ================= 材質（12 個） =================
def img_mat(name, path, rough=0.6, metal=0.0, emit=0.0, rough_img=None, cull=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    if rough_img:
        tr = nt.nodes.new('ShaderNodeTexImage'); tr.image = bpy.data.images.load(rough_img, check_existing=True); tr.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(tr.outputs['Color'], b.inputs['Roughness'])
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    m.use_backface_culling = cull; m['tile'] = 1.0
    return m


M = dict(
    floor=img_mat('sl_floor', P['floor'], rough=0.22),
    wall=img_mat('sl_wall', P['wall'], rough=0.88),
    ceil=img_mat('sl_ceiling', P['ceil'], rough=0.92, cull=True),       # 單面朝下（剖面視角）
    steel=img_mat('sl_steel', P['steel'], rough=0.3, metal=0.45),
    print=img_mat('sl_print', P['prints'], rough=0.6),
    vc=L.vc_material('sl_vc', rough=0.62),
    gloss=L.vc_material('sl_vc_gloss', rough=0.3),                         # 燒臘油亮（LAWWW2 11-04：roughness 約 0.3）、人造皮、玻璃罐
    vm=L.vc_metal('sl_vc_metal', rough=0.32, metal=0.45),                  # 鋼管、鋁框、銅燈罩、勾子
    glass=L.flat('sl_glass', '#dfe6e8', rough=0.04, alpha=0.06),   # 淡一點：燒臘櫃的玻璃不要蓋一層霧
    tube=L.flat('GLOW_sl_tube', '#ffffff', rough=0.3, emit=tuple(v * 8.0 for v in B.srgb('#eef2ff'))),
    warm=L.flat('GLOW_sl_warm', '#ffe2b0', rough=0.4, emit=tuple(v * 5.0 for v in B.srgb('#ffb85c'))),
    screen=img_mat('GLOW_sl_screen', P['screen'], rough=0.15, emit=1.2),
)
M['steel']['tile'] = 0.7
K = KK.Kit(root, 'sl'); KK.std_mats(K, M)
M.update(plastic_red=K.acg('plastic_red', 'Plastic006', vary=0.05, target='#c4302a', tile=0.4, rough_value=0.32),
         plastic_blue=K.acg('plastic_blue', 'Plastic006', vary=0.05, maps=('diff',), target='#2a5aa8', tile=0.4, rough_value=0.35, res=256),
         sack=K.acg('sack', 'Fabric036', maps=('diff',), target='#e6e0cf', tile=0.25, rough_value=0.9, res=256))
for k_, nm_, col_, em_ in (('tube', 'GLOW_sl_tube', '#ffffff', tuple(v * 8.0 for v in B.srgb('#eef2ff'))), ('warm', 'GLOW_sl_warm', '#ffe2b0', tuple(v * 5.0 for v in B.srgb('#ffb85c')))):
    bpy.data.materials.remove(M[k_]); M[k_] = K.glow(nm_, col_, em_)   # v8：燈管、暖燈也用乳白塑膠的紋路（同名，烘焙照名字找燈）
EXT = {'#c8342c': 'plastic_red', '#c42e26': 'plastic_red', '#2a5aa8': 'plastic_blue', '#e8e2d0': 'sack'}
RV, RM = KK.std_route(False, EXT), KK.std_route(True)
TM = {}
def tm(k):
    if k == 'steel': return ST
    if k not in TM: TM[k] = Mesh(f'sl_cc_{k}', M[k])
    return TM[k]
MS = {k: (KK.RCMesh(f'sl_{k}', M[k], RM if k == 'vm' else RV, tm) if k in ('vc', 'gloss', 'vm') else Mesh(f'sl_{k}', M[k])) for k in ('vc', 'gloss', 'vm', 'steel', 'glass', 'tube', 'warm')}
VC, GL, VM, ST = MS['vc'], MS['gloss'], MS['vm'], MS['steel']
PR = Mesh('sl_prints', M['print']); SCR = Mesh('sl_screens', M['screen'])
WG = {}   # (side, key) → mesh（會淡出的牆分組）


def wg(side, key):
    k = (side, key)
    if k not in WG:
        m = M[key]; WG[k] = (KK.RCMesh(f'WALL_{side}_{key}', m, RM if key == 'vm' else RV, lambda k_, s_=side: wg(s_, k_)) if key in ('vc', 'gloss', 'vm') else Mesh(f'WALL_{side}_{key}', m))
    return WG[k]


def lin(h):
    return [v for v in B.srgb(h)] + [1.0]


def mix(a, b, t):
    ca, cb = B.srgb(a), B.srgb(b); return [ca[i] + (cb[i] - ca[i]) * t for i in range(3)] + [1.0]


def paint_fn(cm, faces, fn):
    """每個頂點自己的顏色（fn(遊戲座標的點) → 線性 RGBA）"""
    for f in faces:
        for lp in f.loops:
            co = lp.vert.co; lp[cm.col] = fn(co.x, co.z, -co.y)
    return faces


def gloss_pass(cm, faces, k=0.55, p=7, L_=(-0.55, 0.75, 0.3)):
    """把「油亮的反光」畫進頂點色（遊戲沒有點光源、也沒有環境貼圖：只靠粗糙度看不出油亮）：法線朝走道上方的地方變亮"""
    cm.bm.normal_update(); lv_ = g2b(*L_).normalized()
    for f in faces:
        for lp in f.loops:
            h = max(0.0, lp.vert.normal.dot(lv_)) ** p * k; c_ = lp[cm.col]
            lp[cm.col] = (c_[0] + (1 - c_[0]) * h, c_[1] + (0.85 - c_[1]) * h, c_[2] + (0.6 - c_[2]) * h, 1.0)


def newfaces(cm, before): return [f for f in cm.bm.faces if f not in before]


def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):
    f0 = set(m.bm.faces); m.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return m.paint(newfaces(m, f0), col)


def clathe(m, prof, x, y, z, col, seg=14, mat=None):
    f0 = set(m.bm.faces); tr = Matrix.Translation(g2b(x, y, z)) @ (mat if mat is not None else Matrix.Identity(4))
    m.add_bm(L.lathe(prof, seg=seg), tr); fs = newfaces(m, f0)
    if col: m.paint(fs, col)
    return fs


def uvq(mesh, pts, rect):
    """貼圖四邊形：pts＝左下、右下、右上、左上（從正面看逆時針，遊戲座標）；rect＝(u0, v0, u1, v1)"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


def sub(rect, a0, b0, a1, b1):   # 圖集格子的一部分
    u0, v0, u1, v1 = rect; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


# 牆面上的點：side、沿牆往右的距離 a（從室內看）、高度 y、離牆 d（往室內）
def wpt(side, a, y, d=0.0):
    if side == 'left': return (X0 + d, y, Z1 - a)
    if side == 'right': return (X1 - d, y, Z0 + a)
    if side == 'back': return (X0 + a, y, Z0 + d)
    return (X1 - a, y, Z1 - d)


def on_wall(mesh, side, a0, a1, y0, y1, rect, d=0.0):
    return uvq(mesh, [wpt(side, a0, y0, d), wpt(side, a1, y0, d), wpt(side, a1, y1, d), wpt(side, a0, y1, d)], rect)


WALL_STRIP = {'left': (0, 13.0, 0.0), 'right': (1, 13.0, 0.0), 'back': (2, 6.0, 0.0), 'front': (2, 6.0, 1024 / 2048)}


def wall_face(side, a0, a1, y0, y1):
    k, ln, uoff = WALL_STRIP[side]; vb = 1 - (k + 1) / 3
    ppm = 2048 / 13.0 if ln == 13.0 else 157.5
    on_wall(wg(side, 'wall'), side, a0, a1, y0, y1, (uoff + a0 * ppm / 2048, vb + y0 / H / 3, uoff + a1 * ppm / 2048, vb + y1 / H / 3))


# 遊戲座標的旋轉：面向 yaw（(sin, cos)）的本地 (lx 右手, lz 前方)
def rot(x, z, yaw):
    f = (math.sin(yaw), math.cos(yaw)); r = (math.cos(yaw), -math.sin(yaw))
    return lambda lx, lz: (x + lx * r[0] + lz * f[0], z + lx * r[1] + lz * f[1])


# ================= 地板、天花板、牆 =================
fl = Mesh('FLOOR', M['floor']); uvq(fl, [(X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0)], (0, 0, 1, 1)); fl.finish(root, uv=False)
ce = Mesh('CEILING', M['ceil']); uvq(ce, [(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)], (0, 1, 1, 0)); ce.finish(root, uv=False)
for s, ln in (('left', 13.0), ('right', 13.0)): wall_face(s, 0, ln, 0, H)
wall_face('back', 0, KDOOR[0] - X0, 0, H); wall_face('back', KDOOR[1] - X0, 6.0, 0, H); wall_face('back', KDOOR[0] - X0, KDOOR[1] - X0, 2.25, H)   # 廚房門留空
# 前牆：門 a 2.2～3.8、兩邊窗 a 0～2.2、3.8～6（窗台 0.6、窗頂 2.6）
for a0, a1 in ((0.0, 2.2), (3.8, 6.0)): wall_face('front', a0, a1, 0, 0.6)
wall_face('front', 0.0, 6.0, 2.6, H)
# 牆的外殼（厚 0.12，從外面看的；離室內那一面 1 cm，不和貼圖的牆面重疊）
for s in DIRS:
    m = wg(s, 'vc')
    if s == 'left': m.cbox(X0 - 0.13, X0 - 0.01, 0, H, Z0, Z1, '#cfc6b0')
    elif s == 'right': m.cbox(X1 + 0.01, X1 + 0.13, 0, H, Z0, Z1, '#cfc6b0')
    elif s == 'back':
        m.cbox(X0 - 0.13, KDOOR[0], 0, H, Z0 - 0.13, Z0 - 0.01, '#cfc6b0'); m.cbox(KDOOR[1], X1 + 0.13, 0, H, Z0 - 0.13, Z0 - 0.01, '#cfc6b0'); m.cbox(KDOOR[0], KDOOR[1], 2.25, H, Z0 - 0.13, Z0 - 0.01, '#cfc6b0')
    else:
        m.cbox(X0 - 0.12, X1 + 0.12, 2.6, H, Z1 + 0.01, Z1 + 0.13, '#cfc6b0')
        for a, b in ((X0 - 0.12, -0.8), (0.8, X1 + 0.12)): m.cbox(a, b, 0, 0.6, Z1 + 0.01, Z1 + 0.13, '#cfc6b0')
# 踢腳（灰色水泥、髒）與牆角的壓條電線
for s, ln in (('left', 13.0), ('right', 13.0), ('back', 6.0)):
    m = wg(s, 'vc'); p0, p1 = wpt(s, 0, 0, 0.0), wpt(s, ln, 0.12, 0.012)
    m.cbox(min(p0[0], p1[0]), max(p0[0], p1[0]), 0, 0.12, min(p0[2], p1[2]), max(p0[2], p1[2]), '#8a8676')
# 左牆的壓條走線：天花板下一條，往下到開關箱、冷氣、壁扇
m = wg('left', 'vc')
m.cbox(X0, X0 + 0.025, 3.02, 3.05, -6.4, 6.4, '#ece8de')
for z, y0 in ((5.15, 1.25), (4.55, 2.8), (1.3, 1.5)): m.cbox(X0, X0 + 0.025, y0, 3.02, z - 0.015, z + 0.015, '#ece8de')

# ================= 前面：鋁窗、玻璃、左邊門扇（開著）、窗外 =================
fv = wg('front', 'vm'); fg = wg('front', 'glass')
for x0, x1 in ((X0, -0.8), (0.8, X1)):
    fv.cbox(x0, x1, 0.56, 0.62, Z1 - 0.06, Z1, '#9aa0a4'); fv.cbox(x0, x1, 2.56, 2.62, Z1 - 0.06, Z1, '#9aa0a4')
    for x in (x0, (x0 + x1) / 2, x1): fv.cbox(x - 0.03, x + 0.03, 0.6, 2.6, Z1 - 0.07, Z1, '#9aa0a4')
    fg.quad([(x1, 0.62, Z1 - 0.035), (x0, 0.62, Z1 - 0.035), (x0, 2.56, Z1 - 0.035), (x1, 2.56, Z1 - 0.035)])
    wr = wg('front', 'vm')
    for y in (1.05, 1.13): wr.cbox(x0 + 0.03, x1 - 0.03, y, y + 0.05, Z1 - 0.04, Z1 - 0.03, '#c8342c')   # 窗上兩條紅線
for x in DOOR: fv.cbox(x - 0.04, x + 0.04, 0, 2.6, Z1 - 0.08, Z1, '#9aa0a4')
fv.cbox(DOOR[0], DOOR[1], 2.52, 2.6, Z1 - 0.08, Z1, '#9aa0a4')
ow = wg('front', 'print')   # 窗外的街（對面騎樓、行道樹）
on_wall(ow, 'front', -1.0, 7.0, -0.4, 3.6, C['outside'], d=-2.6)
fvc = wg('front', 'vc'); fvc.cbox(X0 - 1.2, X1 + 1.2, -0.01, 0.0, Z1, Z1 + 2.7, '#8f8c84')   # 騎樓地
# 左門扇：鉸鏈在 (−0.8, 6.46)，往裡開 LEAF_DEG
th = math.radians(LEAF_DEG); hx, hz = -0.8, Z1 - 0.04; ux, uz = math.cos(th), -math.sin(th); LW = 0.8
def leaf_pt(t, y, off=0.0): return (hx + ux * t * LW - uz * off, y, hz + uz * t * LW + ux * off)
lf = wg('front', 'vm')
for t0, t1 in ((0.0, 0.07), (0.93, 1.0)):
    a, b = leaf_pt(t0, 0), leaf_pt(t1, 0)
    f0 = set(lf.bm.faces); lf.box(min(a[0], b[0]), max(a[0], b[0]), 0.02, 2.48, min(a[2], b[2]), max(a[2], b[2])); lf.paint(newfaces(lf, f0), '#9aa0a4')
for y0, y1 in ((0.02, 0.14), (2.38, 2.48), (1.0, 1.06)):
    pts = [leaf_pt(0, y0), leaf_pt(1, y0), leaf_pt(1, y1), leaf_pt(0, y1)]; lf.poly(pts, '#9aa0a4'); lf.poly(pts[::-1], '#9aa0a4')
for y0, y1 in ((1.18, 1.25), (1.31, 1.35)):   # 門上兩條紅線（參考圖）
    pts = [leaf_pt(0.07, y0, 0.006), leaf_pt(0.93, y0, 0.006), leaf_pt(0.93, y1, 0.006), leaf_pt(0.07, y1, 0.006)]; lf.poly(pts, '#c8342c'); lf.poly(pts[::-1], '#c8342c')
    pts = [leaf_pt(0.07, y0, -0.006), leaf_pt(0.93, y0, -0.006), leaf_pt(0.93, y1, -0.006), leaf_pt(0.07, y1, -0.006)]; lf.poly(pts[::-1], '#c8342c')
fg.quad([leaf_pt(0.07, 0.14), leaf_pt(0.93, 0.14), leaf_pt(0.93, 2.38), leaf_pt(0.07, 2.38)])
lf.poly([leaf_pt(0.75, 1.4, 0.05), leaf_pt(0.8, 1.4, 0.05), leaf_pt(0.8, 1.7, 0.05), leaf_pt(0.75, 1.7, 0.05)], '#c4c8cc')   # 門把
# 門口上的店內小招牌燈箱的背面不用做；門口地上一塊紅色腳踏墊
VC.cbox(-0.7, 0.7, 0.0, 0.012, 5.9, 6.45, '#7a2a24')

# ================= 天花板：日光燈 =================
def tube(x, z, ax, Ln=1.22):
    if ax == 'x':
        VC.cbox(x - Ln / 2 - 0.05, x + Ln / 2 + 0.05, H - 0.07, H, z - 0.09, z + 0.09, '#e6e4dc')
        for dz in (-0.045, 0.045): MS['tube'].cyl((x - Ln / 2, H - 0.095, z + dz), (x + Ln / 2, H - 0.095, z + dz), 0.02, seg=8)
    else:
        VC.cbox(x - 0.09, x + 0.09, H - 0.07, H, z - Ln / 2 - 0.05, z + Ln / 2 + 0.05, '#e6e4dc')
        for dx in (-0.045, 0.045): MS['tube'].cyl((x + dx, H - 0.095, z - Ln / 2), (x + dx, H - 0.095, z + Ln / 2), 0.02, seg=8)


TUBES = [(-1.1, z, 'x') for z in (5.4, 3.3, 1.2, -0.9, -3.0, -5.1)] + [(1.45, z, 'z') for z in (0.9, -1.9, -4.6)]
for t in TUBES: tube(*t)

# ================= 左邊：不鏽鋼桌＋紅色圓凳＋桌上的東西 =================
def table(z):
    x = TX_; hw = TW / 2; y = 0.76
    ST.box(x - hw, x + hw, y - 0.035, y, z - hw, z + hw)
    for s in (-1, 1): ST.box(x - hw, x + hw, y - 0.07, y - 0.035, z + s * hw - 0.02, z + s * hw); ST.box(x + s * hw - 0.02, x + s * hw, y - 0.07, y - 0.035, z - hw, z + hw)   # 折邊
    for sx in (-1, 1):
        for sz in (-1, 1): VM.cbox(x + sx * (hw - 0.05) - 0.018, x + sx * (hw - 0.05) + 0.018, 0.0, y - 0.07, z + sz * (hw - 0.05) - 0.018, z + sz * (hw - 0.05) + 0.018, '#a9aeb2')
    for s in (-1, 1): VM.cbox(x - hw + 0.05, x + hw - 0.05, 0.16, 0.185, z + s * (hw - 0.05) - 0.01, z + s * (hw - 0.05) + 0.01, '#a2a7ab')
    # 桌上：竹筷筒、辣椒醬玻璃罐、醬油瓶、牙籤罐、面紙盒（照參考圖放在靠牆那一半）
    cx, cz = x - 0.18, z - 0.12
    clathe(VM, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.14), (0.047, 0.14), (0.047, 0.01), (0.0, 0.01)], cx, y, cz, '#c2c6c8', seg=14)
    f0 = set(VC.bm.faces)
    for k in range(26):
        a = k * 2.399; rr = 0.036 * math.sqrt((k + 0.5) / 26); px, pz = cx + rr * math.cos(a), cz + rr * math.sin(a); tilt = 0.012 * math.cos(a)
        ccyl(VC, (px, y + 0.01, pz), (px + tilt * 3, y + 0.25 + R.uniform(-0.01, 0.015), pz + 0.012 * math.sin(a) * 3), 0.0035, '#dcbc7e' if k % 3 else '#c8a464', seg=4)
    # 辣椒醬（玻璃罐、紅醬、紅蓋）
    jx, jz = x - 0.04, z - 0.2
    clathe(GL, [(0.0, 0.0), (0.032, 0.0), (0.034, 0.08), (0.03, 0.095), (0.0, 0.095)], jx, y, jz, '#a8200e', seg=12)
    clathe(GL, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.025), (0.0, 0.025)], jx, y + 0.095, jz, '#c22a20', seg=12)
    # 醬油瓶（深色、白色蓋）
    bx, bz = x + 0.06, z - 0.22
    clathe(GL, [(0.0, 0.0), (0.026, 0.0), (0.026, 0.11), (0.014, 0.14), (0.0, 0.14)], bx, y, bz, '#2a140a', seg=10)
    clathe(VC, [(0.0, 0.0), (0.016, 0.0), (0.016, 0.025), (0.0, 0.025)], bx, y + 0.14, bz, '#e6e2d8', seg=8)
    # 牙籤罐
    clathe(GL, [(0.0, 0.0), (0.018, 0.0), (0.018, 0.075), (0.0, 0.075)], x - 0.05, y, z - 0.05, '#e8dcc0', seg=8)
    # 面紙盒（印刷：粉紅花紋）＋白色面紙
    tx0, tx1, tz0, tz1, ty = x + 0.08, x + 0.3, z - 0.1, z + 0.02, y + 0.075
    rc = C['tissue']
    uvq(PR, [(tx0, ty, tz1), (tx1, ty, tz1), (tx1, ty, tz0), (tx0, ty, tz0)], sub(rc, 0, 0, 1, 1))
    for (a0, a1, b0, b1, side) in ((tx0, tx1, tz1, tz1, 'S'), (tx1, tx0, tz0, tz0, 'N')):
        uvq(PR, [(a0, y, b0), (a1, y, b1), (a1, ty, b1), (a0, ty, b0)], sub(rc, 0, 0, 1, 0.4))
    uvq(PR, [(tx1, y, tz1), (tx1, y, tz0), (tx1, ty, tz0), (tx1, ty, tz1)], sub(rc, 0, 0, 0.5, 0.4)); uvq(PR, [(tx0, y, tz0), (tx0, y, tz1), (tx0, ty, tz1), (tx0, ty, tz0)], sub(rc, 0.5, 0, 1, 0.4))
    _f0 = set(VC.bm.faces); VC.ell(((tx0 + tx1) / 2, ty + 0.012, (tz0 + tz1) / 2), 0.04, 0.025, 0.03, seg=8, rings=4); VC.paint(newfaces(VC, _f0), '#f8f8f4')


def stool(x, z):
    # 座墊：暗紅人造皮，中間磨亮（頂點色漸層）、邊緣捲邊
    fs = clathe(GL, [(0.0, 0.0), (0.155, 0.0), (0.17, 0.02), (0.172, 0.045), (0.16, 0.068), (0.11, 0.078), (0.0, 0.08)], x, 0.4, z, None, seg=20)
    paint_fn(GL, fs, lambda px, py, pz: mix('#3e0c10', '#7a2228', max(0.0, min(1.0, 1 - math.hypot(px - x, pz - z) / 0.16)) * (1 if py > 0.46 else 0.3)))
    for k in range(4):
        a = k * PI / 2 + PI / 4; ccyl(VM, (x + 0.15 * math.cos(a), 0.0, z + 0.15 * math.sin(a)), (x + 0.11 * math.cos(a), 0.4, z + 0.11 * math.sin(a)), 0.011, '#b4b8bc', seg=6)
    clathe(VM, [(0.122, 0.0), (0.13, 0.0), (0.13, 0.012), (0.122, 0.012)], x, 0.15, z, '#a8acb0', seg=16)
    clathe(VM, [(0.0, 0.0), (0.13, 0.0), (0.13, 0.012), (0.0, 0.012)], x, 0.392, z, '#8a8e92', seg=16)


for z in TABLES_Z:
    table(z)
    for dz in (-0.62, 0.62): stool(TX_, z + dz)
    stool(-2.74, z + R.uniform(-0.08, 0.08)); stool(-1.5, z + R.uniform(-0.06, 0.06))   # 靠牆、靠走道各多一張（參考圖每桌四張）

# ================= 左牆的東西（從前到後） =================
lv = wg('left', 'vc')
# 壁扇（z 5.6，高 2.45，面向 +x 偏後）
fx, fz, fy = X0, 5.55, 2.45
lv.cbox(fx, fx + 0.05, fy - 0.1, fy + 0.1, fz - 0.07, fz + 0.07, '#ece8dc')
ccyl(lv, (fx + 0.05, fy, fz), (fx + 0.2, fy - 0.04, fz), 0.022, '#ece8dc', seg=8)
ccyl(lv, (fx + 0.18, fy - 0.04, fz), (fx + 0.3, fy - 0.07, fz - 0.03), 0.075, '#ece8dc', seg=12)
ax = Vector((0.88, -0.25, -0.4)).normalized()   # 扇面朝向（遊戲座標）
cen = Vector((fx + 0.36, fy - 0.1, fz - 0.06))
ua = ax.cross(Vector((0, 1, 0))).normalized(); va = ua.cross(ax).normalized()
def fpt(r, a, off=0.0): p = cen + ua * (r * math.cos(a)) + va * (r * math.sin(a)) + ax * off; return (p.x, p.y, p.z)
for k in range(16):   # 網罩：放射條＋兩圈
    a = k * 2 * PI / 16; ccyl(lv, fpt(0.03, a, 0.04), fpt(0.22, a, 0.0), 0.003, '#f2f0ea', seg=3, caps=False); ccyl(lv, fpt(0.03, a, -0.06), fpt(0.22, a, -0.02), 0.003, '#f2f0ea', seg=3, caps=False)
for rr, off in ((0.22, -0.01), (0.14, 0.02), (0.22, -0.03)):
    for k in range(20): ccyl(lv, fpt(rr, k * 2 * PI / 20, off), fpt(rr, (k + 1) * 2 * PI / 20, off), 0.003, '#f2f0ea', seg=3, caps=False)
for k in range(3):    # 扇葉（淡藍半透明的塑膠，畫成淺灰藍）
    a = k * 2 * PI / 3; lv.poly([fpt(0.03, a - 0.3, -0.01), fpt(0.19, a - 0.45, -0.01), fpt(0.2, a + 0.2, -0.01), fpt(0.03, a + 0.3, -0.01)], '#b8c8d0')
    lv.poly([fpt(0.03, a + 0.3, -0.012), fpt(0.2, a + 0.2, -0.012), fpt(0.19, a - 0.45, -0.012), fpt(0.03, a - 0.3, -0.012)], '#b8c8d0')
ccyl(lv, fpt(0.0, 0, 0.06), fpt(0.0, 0, -0.03), 0.04, '#ece8dc', seg=10)
# 窗型冷氣（z 3.85～4.75、高 2.35～2.8；米色、前面百葉、下面一條水漬）
ax0, ax1, ay0, ay1 = 3.85, 4.75, 2.35, 2.8
f0 = set(lv.bm.faces); lv.crbox(X0, X0 + 0.32, ay0, ay1, ax0, ax1, '#e6dcc4', r=0.015, seg=1)
for k in range(9): lv.cbox(X0 + 0.32, X0 + 0.335, ay0 + 0.05 + k * 0.035, ay0 + 0.065 + k * 0.035, ax0 + 0.35, ax1 - 0.05, '#b8ae98')
for k in range(5): lv.cbox(X0 + 0.32, X0 + 0.335, ay0 + 0.06, ay1 - 0.06, ax0 + 0.06 + k * 0.05, ax0 + 0.08 + k * 0.05, '#c8bea6')
lv.cbox(X0 + 0.32, X0 + 0.336, ay0 + 0.03, ay0 + 0.12, ax0 + 0.06, ax0 + 0.3, '#d8ccb0')
lv.cbox(X0 + 0.001, X0 + 0.004, 1.6, ay0, ax0 + 0.4, ax0 + 0.5, '#b8a888')   # 冷氣下面的水漬
ccyl(lv, (X0 + 0.02, ay0, ax1 - 0.05), (X0 + 0.02, 1.2, ax1 + 0.05), 0.008, '#e8e4da', seg=4)   # 排水管
# 電錶、開關箱（z 5.15 低一點）
lv.crbox(X0, X0 + 0.09, 1.15, 1.45, 5.02, 5.28, '#d8d4c8', r=0.01, seg=1); lv.cbox(X0 + 0.09, X0 + 0.095, 1.25, 1.35, 5.1, 5.2, '#4a4a48')
lv.crbox(X0, X0 + 0.03, 1.5, 1.6, 4.4, 4.5, '#efebe2', r=0.004, seg=1)   # 開關
lp = wg('left', 'print')
on_wall(lp, 'left', Z1 - 3.25, Z1 - 2.85, 1.7, 2.1, C['fu'], d=0.006)                        # 福（z 3.25～2.85）
on_wall(lp, 'left', Z1 - 4.45, Z1 - 4.05, 1.25, 1.7, C['note0'], d=0.004)                    # 今日公休
on_wall(lp, 'left', Z1 - 5.9, Z1 - 5.55, 1.3, 1.62, C['note2'], d=0.004)                     # 不收信用卡
on_wall(lp, 'left', Z1 - 7.2, Z1 - 6.75, 1.25, 1.6, C['note4'], d=0.004)                     # 徵工讀
on_wall(lp, 'left', Z1 - 9.0, Z1 - 8.7, 1.45, 1.85, C['cal'], d=0.004)                       # 月曆
on_wall(lp, 'left', Z1 - 2.2, Z1 - 1.9, 1.55, 1.92, C['poster'], d=0.004)                    # 舊海報
for (zc, y0, key, w_, h_) in ((6.5 - 4.9, 1.6, 'cert', 0.26, 0.34), (6.5 - 6.4, 1.55, 'photo', 0.28, 0.36), (6.5 - 7.9, 1.6, 'cert', 0.22, 0.3)):   # 相框（深褐框）
    a0 = 6.5 - zc - w_ / 2; on_wall(lp, 'left', a0, a0 + w_, y0, y0 + h_, C[key], d=0.022)
    z0_, z1_ = zc - w_ / 2 - 0.025, zc + w_ / 2 + 0.025
    for (b0, b1, c0, c1) in ((z0_, z1_, y0 - 0.025, y0), (z0_, z1_, y0 + h_, y0 + h_ + 0.025), (z0_, z0_ + 0.025, y0, y0 + h_), (z1_ - 0.025, z1_, y0, y0 + h_)):
        lv.cbox(X0, X0 + 0.024, c0, c1, b0, b1, '#4a3222')
# 神明桌（左牆高處，紅色小佛龕＋紅色小燈）、掛在牆上的塑膠袋、湯匙杯架、更多手寫紙條
sx0, sz0 = X0, 0.6
lv.cbox(sx0, sx0 + 0.36, 2.28, 2.31, sz0 - 0.3, sz0 + 0.3, '#7a2a1c'); lv.cbox(sx0, sx0 + 0.04, 2.31, 2.75, sz0 - 0.28, sz0 + 0.28, '#8a2a1c')
lv.crbox(sx0 + 0.04, sx0 + 0.3, 2.31, 2.68, sz0 - 0.2, sz0 + 0.2, '#a8281c', r=0.01, seg=1)
lv.cbox(sx0 + 0.3, sx0 + 0.305, 2.35, 2.62, sz0 - 0.14, sz0 + 0.14, '#3a1810')
_f0 = set(lv.bm.faces); lv.ell((sx0 + 0.2, 2.42, sz0), 0.05, 0.08, 0.05, seg=8, rings=5); lv.paint(newfaces(lv, _f0), '#d8a030')
for dz in (-0.17, 0.17): wg('left', 'warm').sphere((sx0 + 0.28, 2.36, sz0 + dz), 0.025, seg=8, rings=5)
for dz in (-0.08, 0.08): ccyl(lv, (sx0 + 0.3, 2.31, sz0 + dz), (sx0 + 0.3, 2.4, sz0 + dz), 0.02, '#b8862a', seg=8)
lv.cbox(sx0, sx0 + 0.006, 2.1, 2.27, sz0 - 0.25, sz0 + 0.25, '#c82a20')   # 紅色的布條
for k in range(3): clathe(lv, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.26), (0.0, 0.26)], X0 + 0.07, 1.05 - k * 0.002, -2.3 + k * 0.03, '#f0eee8' if k else '#e8e0d0', seg=8)   # 一串塑膠袋
ccyl(lv, (X0, 1.36, -2.27), (X0 + 0.07, 1.33, -2.27), 0.006, '#8a8a8a', seg=4)
lv.cbox(X0, X0 + 0.16, 1.05, 1.08, -3.2, -2.7, '#c4c8cb')   # 湯匙杯架
for k in range(4): clathe(lv, [(0.0, 0.0), (0.04, 0.0), (0.045, 0.12), (0.0, 0.12)], X0 + 0.08, 1.08, -3.12 + k * 0.12, '#e8e4dc', seg=8)
on_wall(lp, 'left', Z1 - 0.2 - 3.4, Z1 - 0.2 - 3.1, 1.4, 1.62, C['note3'], d=0.004)   # 滷蛋一顆 15
on_wall(lp, 'left', Z1 - 10.3, Z1 - 10.0, 1.3, 1.52, C['note5'], d=0.004)            # 湯自取
on_wall(lp, 'left', Z1 - 2.9, Z1 - 2.6, 1.05, 1.27, C['note1'], d=0.004)             # 外帶加 10 元
# 圓鐘（後面，z −4.9，高 2.45）
cz_, cy_ = -4.9, 2.45
fs = clathe(lv, [(0.0, 0.0), (0.17, 0.0), (0.175, 0.015), (0.17, 0.04), (0.15, 0.04), (0.15, 0.01), (0.0, 0.01)], X0, cy_, cz_, '#2a2a2c', seg=28, mat=Matrix.Rotation(PI / 2, 4, 'Y'))
cf = C['clock']; uvl = lp.bm.loops.layers.uv.verify(); n = 24
vs = [lp.bm.verts.new(g2b(X0 + 0.025, cy_ + 0.15 * math.sin(k * 2 * PI / n), cz_ - 0.15 * math.cos(k * 2 * PI / n))) for k in range(n)]
f = lp.bm.faces.new(vs); f.normal_update()
for lp_, k in zip(f.loops, range(n)):
    lp_[uvl].uv = ((cf[0] + cf[2]) / 2 + (cf[2] - cf[0]) / 2 * 0.98 * math.cos(k * 2 * PI / n), (cf[1] + cf[3]) / 2 + (cf[3] - cf[1]) / 2 * 0.98 * math.sin(k * 2 * PI / n))
if f.normal.dot(g2b(1, 0, 0) - g2b(0, 0, 0)) < 0: f.normal_flip()

# ================= 後牆：菜單板、不鏽鋼工作檯（鍋、紅罐）、布簾門＋廚房、冰箱 =================
bp = wg('back', 'print'); bv = wg('back', 'vc'); bs = wg('back', 'steel'); bm_ = wg('back', 'vm'); bg = wg('back', 'gloss')
on_wall(bp, 'back', 0.75, 3.55, 1.72, 2.97, C['menu'], d=0.03)
bv.cbox(0.72 + X0, 3.58 + X0, 1.69, 3.0, Z0, Z0 + 0.025, '#d8d0c0')
b = BACKTABLE
bs.box(b['x0'], b['x1'], 0.86, 0.9, b['z0'], b['z1']); bs.box(b['x0'], b['x1'], 0.9, 1.05, Z0, Z0 + 0.02)   # 檯面＋後擋板
bs.box(b['x0'] + 0.03, b['x1'] - 0.03, 0.12, 0.145, b['z0'] + 0.02, b['z1'] - 0.02)                           # 下層
for x in (b['x0'] + 0.03, b['x1'] - 0.03):
    for z in (b['z0'] + 0.03, b['z1'] - 0.03): bm_.cbox(x - 0.018, x + 0.018, 0, 0.86, z - 0.018, z + 0.018, '#a9aeb2')
bs.box(-2.85, -0.4, 1.38, 1.41, Z0, Z0 + 0.26)                                                                   # 牆上層板
for x in (-2.7, -0.55): bm_.cbox(x - 0.01, x + 0.01, 1.2, 1.38, Z0, Z0 + 0.22, '#a9aeb2')
POT = [(0.0, 0.0), (0.12, 0.0), (0.125, 0.16), (0.13, 0.17), (0.0, 0.17)]
for (x, r_, h_) in ((-2.55, 0.14, 0.22), (-2.2, 0.11, 0.18), (-1.4, 0.15, 0.26), (-0.8, 0.12, 0.2)):
    clathe(bm_, [(0.0, 0.0), (r_, 0.0), (r_ + 0.004, h_), (r_ + 0.012, h_ + 0.01), (0.0, h_ + 0.01)], x, 0.9, -6.2, '#bcc0c4', seg=16)
for (x, col) in ((-1.95, '#c8342c'), (-1.78, '#c8342c'), (-1.1, '#e0d6c0'), (-0.65, '#c8b080')):   # 紅色奶粉罐、調味罐
    clathe(bg, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.16), (0.0, 0.16)], x, 0.9, -6.3, col, seg=12)
for k in range(7): clathe(bg, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.12), (0.0, 0.12)], -2.7 + k * 0.32, 1.41, -6.37, ['#e8d8a8', '#a83a20', '#3a2a1a', '#f0f0e8'][k % 4], seg=10)
for k in range(3): clathe(bm_, [(0.0, 0.0), (0.13, 0.0), (0.135, 0.1), (0.0, 0.01)], -2.4 + k * 0.6, 1.41, -6.35, '#c4c8cb', seg=14)
clathe(bv, [(0.0, 0.0), (0.2, 0.0), (0.21, 0.03), (0.21, 0.3), (0.18, 0.35), (0.0, 0.36)], -0.95, 0.145, -6.2, '#e8e4dc', seg=16)   # 下層的舊電鍋
bv.crbox(-2.7, -2.2, 0.145, 0.45, -6.4, -6.0, '#c8342c', r=0.015, seg=1)   # 下層紅籃
# 布簾門（x 1.0～2.0）：門框、拉到左邊的布簾（印刷花紋、皺）
kx0, kx1 = KDOOR
bv.cbox(kx0 - 0.06, kx0, 0, 2.25, Z0, Z0 + 0.06, '#8a8070'); bv.cbox(kx1, kx1 + 0.06, 0, 2.25, Z0, Z0 + 0.06, '#8a8070'); bv.cbox(kx0 - 0.06, kx1 + 0.06, 2.2, 2.28, Z0, Z0 + 0.06, '#8a8070')
bm_.cbox(kx0 - 0.02, kx1 + 0.02, 2.17, 2.19, Z0 + 0.05, Z0 + 0.07, '#9aa0a4')
uvl = bp.bm.loops.layers.uv.verify(); rc = C['curtain']
def curtain(xa, xb, n, amp, y0, y1, z_):
    for i in range(n):
        ta, tb = i / n, (i + 1) / n
        pa = (xa + (xb - xa) * ta, z_ + amp * math.sin(ta * n * PI)); pb = (xa + (xb - xa) * tb, z_ + amp * math.sin(tb * n * PI))
        f = bp.bm.faces.new([bp.bm.verts.new(g2b(pa[0], y0, pa[1])), bp.bm.verts.new(g2b(pb[0], y0, pb[1])), bp.bm.verts.new(g2b(pb[0], y1, pb[1])), bp.bm.verts.new(g2b(pa[0], y1, pa[1]))])
        for lp_, (u, v) in zip(f.loops, ((ta, 0), (tb, 0), (tb, 1), (ta, 1))): lp_[uvl].uv = (rc[0] + (rc[2] - rc[0]) * u, rc[1] + (rc[3] - rc[1]) * v)
curtain(kx0 + 0.02, kx0 + 0.48, 9, 0.035, 0.45, 2.17, Z0 + 0.09)       # 拉到左邊、收起來
curtain(kx1 - 0.18, kx1 - 0.02, 4, 0.025, 1.45, 2.17, Z0 + 0.09)       # 右邊一小片
# 廚房（門後面，深 1.8 m）：牆、不鏽鋼檯、爐子、吊燈、在裡面忙的人
kz = Z0 - 1.8
bv.cbox(0.4, 2.6, 0, 0.02, kz, Z0, '#a49c8c'); bv.cbox(0.4, 2.6, 2.6, 2.62, kz, Z0, '#8e887c')
bv.cbox(0.4, 0.42, 0, 2.6, kz, Z0, '#b8ae98'); bv.cbox(2.58, 2.6, 0, 2.6, kz, Z0, '#b8ae98'); bv.cbox(0.4, 2.6, 0, 2.6, kz, kz + 0.02, '#c0b6a0')
for k in range(8): bv.cbox(0.42, 2.58, 1.0 + k * 0.15, 1.0 + k * 0.15 + 0.005, kz + 0.02, kz + 0.025, '#d8d2c4')   # 磁磚縫
bs.box(0.45, 2.55, 0.82, 0.86, kz + 0.02, kz + 0.62); bs.box(0.45, 2.55, 0.0, 0.82, kz + 0.02, kz + 0.6)
bs.box(0.6, 2.4, 1.55, 1.58, kz + 0.02, kz + 0.3)
for x in (0.8, 1.3, 2.1): clathe(bm_, POT, x, 0.86, kz + 0.3, '#b8bcc0', seg=14)
for k in range(5): clathe(bg, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.14), (0.0, 0.14)], 0.8 + k * 0.33, 1.58, kz + 0.15, ['#e0c070', '#c83a2a', '#3a2a1a'][k % 3], seg=8)
wg('back', 'tube').cyl((0.9, 2.55, kz + 0.9), (2.1, 2.55, kz + 0.9), 0.016, seg=8); bv.cbox(0.85, 2.15, 2.57, 2.6, kz + 0.84, kz + 0.96, '#e6e4dc')
# 廚房裡的人（深色衣服、白圍裙：剪影，背對）
px_, pz_ = 1.55, kz + 0.95
_f0 = set(bv.bm.faces); bv.ell((px_, 1.03, pz_), 0.17, 0.32, 0.12, seg=10, rings=6); bv.paint(newfaces(bv, _f0), '#2c2e34')
_f0 = set(bv.bm.faces); bv.ell((px_, 1.32, pz_), 0.2, 0.22, 0.13, seg=10, rings=6); bv.paint(newfaces(bv, _f0), '#3a3c44')
_f0 = set(bv.bm.faces); bv.ell((px_, 1.66, pz_), 0.09, 0.11, 0.1, seg=10, rings=6); bv.paint(newfaces(bv, _f0), '#1c1814')
_f0 = set(bv.bm.faces); bv.ell((px_, 0.95, pz_ + 0.1), 0.15, 0.3, 0.02, seg=8, rings=4); bv.paint(newfaces(bv, _f0), '#e8e6e0')
for s in (-1, 1): ccyl(bv, (px_ + s * 0.08, 0.0, pz_), (px_ + s * 0.08, 0.75, pz_), 0.06, '#2a2c30', seg=8)
for s in (-1, 1): ccyl(bv, (px_ + s * 0.2, 1.48, pz_), (px_ + s * 0.25, 1.05, pz_ - 0.12), 0.045, '#3a3c44', seg=6)
# 冰箱（兩門、不鏽鋼、把手；上面紅籃、紙箱）
fr = FRIDGE; fx0, fx1, fz0, fz1 = fr['x0'] + 0.15, fr['x1'] - 0.08, fr['z0'] + 0.05, fr['z1'] - 0.05
ST.box(fx0, fx1, 0.08, 2.0, fz0, fz1); VC.cbox(fx0 + 0.02, fx1 - 0.02, 0.0, 0.08, fz0 + 0.02, fz1 - 0.02, '#2a2a2a')
mx = (fx0 + fx1) / 2
VM.cbox(mx - 0.004, mx + 0.004, 0.1, 1.98, fz1, fz1 + 0.004, '#6a6e72')
for s in (-1, 1): VM.cbox(mx + s * 0.05 - 0.012, mx + s * 0.05 + 0.012, 0.9, 1.5, fz1 + 0.004, fz1 + 0.04, '#d0d4d8')
VC.cbox(fx0 + 0.1, fx0 + 0.32, 1.6, 1.75, fz1 + 0.002, fz1 + 0.004, '#f2ecd8')   # 冰箱上貼的紙
K.ph_put('plastic_crate_02', fx0 + 0.27, 2.0, (fz0 + fz1) / 2, 0.04, height=0.28, decimate=0.1, recolor=('#6a1410', '#d8483a'), tag='_r')   # v8：冰箱上的紅籃、紙箱（Poly Haven）
K.ph_put('cardboard_box_01', fx0 + 0.72, 2.0, (fz0 + fz1) / 2, PI / 2 + 0.06, height=0.24, decimate=0.035)
VC.crbox(fr['x0'] + 0.01, fx0 - 0.01, 0.0, 0.28, fz0 + 0.1, fz1 - 0.05, '#c8342c', r=0.012, seg=1)   # 冰箱旁地上的紅籃

# ================= 右邊：櫃台三段 =================
c = CT; cz0, cz1 = c['z0'], c['z1']
# 櫃身（不鏽鋼板，前面一片一片、接縫、踢腳暗）
ST.box(c['x0'] + 0.02, c['x1'], 0.1, c['h'] - 0.03, CHOP_Z[0], CASE_Z[1])
VC.cbox(c['x0'] + 0.05, c['x1'] - 0.02, 0.0, 0.1, CHOP_Z[0], CASE_Z[1], '#3a3834')
for z in [CHOP_Z[0] + k * 0.8 for k in range(1, 8)]:
    if z < CASE_Z[1] - 0.1: VM.cbox(c['x0'] + 0.015, c['x0'] + 0.022, 0.1, c['h'] - 0.04, z - 0.006, z + 0.006, '#7c8084')
ST.box(c['x0'] - 0.03, c['x1'] + 0.02, c['h'] - 0.035, c['h'], CHOP_Z[0], CHOP_Z[1])                          # 砧板檯檯面（前緣捲邊）
ST.box(c['x0'] - 0.035, c['x0'], c['h'] - 0.07, c['h'], CHOP_Z[0], CHOP_Z[1])
# 盛飯台（後段）：開放的不鏽鋼檯，下面兩層架（紅籃、鍋、碗）
rz0, rz1 = RICE_Z
ST.box(c['x0'] - 0.03, c['x1'] + 0.02, c['h'] - 0.035, c['h'], rz0, rz1); ST.box(c['x0'] - 0.035, c['x0'], c['h'] - 0.07, c['h'], rz0, rz1)
for z in (rz0 + 0.04, -2.75, rz1 - 0.04):
    for x in (c['x0'] + 0.04, c['x1'] - 0.04): VM.cbox(x - 0.02, x + 0.02, 0, c['h'] - 0.035, z - 0.02, z + 0.02, '#a9aeb2')
for y in (0.14, 0.5): ST.box(c['x0'] + 0.04, c['x1'] - 0.04, y, y + 0.025, rz0 + 0.04, rz1 - 0.04)
VC.crbox(c['x0'] + 0.12, c['x0'] + 0.62, 0.165, 0.43, -2.4, -1.7, '#c8342c', r=0.015, seg=1)                     # 紅色塑膠籃（參考圖第 23 項）
for k in range(6): VC.cbox(c['x0'] + 0.12, c['x0'] + 0.13, 0.2, 0.42, -2.35 + k * 0.11, -2.32 + k * 0.11, '#9a2420')
VC.crbox(c['x0'] + 0.12, c['x0'] + 0.62, 0.525, 0.8, -2.4, -1.75, '#c8342c', r=0.015, seg=1)
for k in range(4): clathe(VM, [(0.0, 0.0), (0.14, 0.0), (0.16, 0.08), (0.0, 0.01)], c['x0'] + 0.35, 0.525 + k * 0.025, -3.4, '#c4c8cb', seg=16)   # 疊起來的不鏽鋼盆
for k in range(10): clathe(VC, [(0.0, 0.0), (0.06, 0.0), (0.1, 0.035), (0.0, 0.006)], c['x0'] + 0.4, 0.165 + k * 0.03, -3.6, '#f2efe6', seg=12)  # 碗
clathe(VC, [(0.0, 0.0), (0.16, 0.0), (0.17, 0.3), (0.0, 0.3)], c['x0'] + 0.35, 0.165, -1.35, '#e8e8e2', seg=14)  # 白色水桶
# 盛飯台上：大電鍋、湯桶、碗盤疊、不鏽鋼盆（燙青菜）、外帶餐盒、湯勺
clathe(VC, [(0.0, 0.0), (0.24, 0.0), (0.26, 0.04), (0.26, 0.34), (0.23, 0.4), (0.06, 0.44), (0.0, 0.45)], 1.45, c['h'], -3.9, '#e8e4dc', seg=20)
VC.cbox(1.42, 1.48, c['h'] + 0.42, c['h'] + 0.46, -3.92, -3.86, '#3a3a3a'); VC.cbox(1.19, 1.21, c['h'] + 0.12, c['h'] + 0.2, -3.95, -3.85, '#c8342c')
clathe(VM, [(0.0, 0.0), (0.2, 0.0), (0.21, 0.36), (0.22, 0.37), (0.0, 0.37)], 1.48, c['h'], -3.25, '#bcc0c4', seg=18)            # 湯桶
clathe(VM, [(0.0, 0.0), (0.2, 0.0), (0.21, 0.03), (0.0, 0.03)], 1.48, c['h'] + 0.37, -3.25, '#c8ccd0', seg=18)
ccyl(VM, (1.48, c['h'] + 0.4, -3.25), (1.6, c['h'] + 0.62, -3.15), 0.01, '#c4c8cc', seg=5)
for k in range(2): clathe(VM, [(0.0, 0.0), (0.16, 0.0), (0.2, 0.11), (0.0, 0.01)], 1.42, c['h'], -2.55 + k * 0.45, '#c4c8cb', seg=16)
for k in range(2):
    fs = clathe(GL, [(0.0, 0.0), (0.17, 0.0), (0.12, 0.05), (0.0, 0.06)], 1.42, c['h'] + 0.05, -2.55 + k * 0.45, None, seg=12)
    paint_fn(GL, fs, lambda px, py, pz: lin(R.choice(['#4a7a2a', '#5a8a30', '#3e6a24'])))
for stk in range(3):
    for k in range(9): clathe(VC, [(0.0, 0.0), (0.06, 0.0), (0.1, 0.035), (0.0, 0.006)], 1.7, c['h'] + k * 0.028, -1.85 + stk * 0.24, '#f4f2ea', seg=12)
for k in range(10): VC.crbox(1.15, 1.45, c['h'] + k * 0.05, c['h'] + 0.045 + k * 0.05, -1.55, -1.25, '#f6f4ee', r=0.006, seg=1)   # 外帶餐盒
# 砧板檯（中段）：圓木砧板＋菜刀、電子秤、不鏽鋼盤（叉燒）、白抹布（紅線）、收銀機
bx_, bz_ = 1.47, 1.35
fs = clathe(VC, [(0.0, 0.0), (0.3, 0.0), (0.31, 0.02), (0.31, 0.2), (0.3, 0.22), (0.0, 0.22)], bx_, c['h'], bz_, None, seg=28)
paint_fn(VC, fs, lambda px, py, pz: mix('#4a2e1a', '#8a5c38', min(1.0, max(0.0, (py - c['h']) / 0.2)) * (0.7 + 0.3 * math.sin(math.atan2(pz - bz_, px - bx_) * 7))))
uvl = PR.bm.loops.layers.uv.verify(); rw = C['wood']; n = 28
vs = [PR.bm.verts.new(g2b(bx_ + 0.302 * math.cos(k * 2 * PI / n), c['h'] + 0.2205, bz_ + 0.302 * math.sin(k * 2 * PI / n))) for k in range(n)]
f = PR.bm.faces.new(vs)
for lp_, k in zip(f.loops, range(n)): lp_[uvl].uv = ((rw[0] + rw[2]) / 2 + (rw[2] - rw[0]) / 2 * math.cos(k * 2 * PI / n), (rw[1] + rw[3]) / 2 + (rw[3] - rw[1]) / 2 * -math.sin(k * 2 * PI / n))
f.normal_update()
if f.normal.z < 0: f.normal_flip()
ky = c['h'] + 0.22
VM.cbox(1.25, 1.27, ky - 0.04, ky + 0.12, 1.15, 1.42, '#c8ccd0'); VC.cbox(1.24, 1.28, ky + 0.12, ky + 0.15, 1.18, 1.4, '#c8ccd0')   # 菜刀（插在砧板上）
VC.cbox(1.245, 1.275, ky + 0.15, ky + 0.17, 1.27, 1.31, '#5a3a22'); ccyl(VC, (1.26, ky + 0.13, 1.42), (1.26, ky + 0.1, 1.56), 0.016, '#5a3a22', seg=8)
VC.crbox(1.32, 1.68, c['h'], c['h'] + 0.09, 1.78, 2.1, '#e8e8e2', r=0.01, seg=1); VC.cbox(1.36, 1.64, c['h'] + 0.09, c['h'] + 0.095, 1.8, 2.08, '#c8ccd0')   # 電子秤
uvq(PR, [(1.321, c['h'] + 0.02, 1.8), (1.321, c['h'] + 0.02, 2.08), (1.321, c['h'] + 0.08, 2.08), (1.321, c['h'] + 0.08, 1.8)], sub(C['panel'], 0, 0.45, 0.6, 1))
for (tz, kind) in ((0.35, 'cs'), (-0.3, 'sy')):   # 不鏽鋼盤：切好的叉燒、燒肉
    VM.crbox(1.15, 1.62, c['h'], c['h'] + 0.035, tz - 0.2, tz + 0.2, '#b8bcc0', r=0.01, seg=1)
    for k in range(12):
        sx, sz = 1.2 + (k % 4) * 0.1, tz - 0.16 + (k // 4) * 0.11
        if kind == 'cs':
            fs = GL.crbox(sx, sx + 0.08, c['h'] + 0.035, c['h'] + 0.06, sz, sz + 0.09, '#8e2016', r=0.008, seg=1)
            paint_fn(GL, fs, lambda px, py, pz, sx=sx, sz=sz: mix('#3a0e08', '#b84a30', min(1.0, (py - c['h'] - 0.035) / 0.022) * min(1.0, 4 * min(px - sx, sx + 0.08 - px) / 0.08)))
        else:
            fs = GL.crbox(sx, sx + 0.08, c['h'] + 0.035, c['h'] + 0.075, sz, sz + 0.08, '#e8d8c0', r=0.006, seg=1)
            paint_fn(GL, fs, lambda px, py, pz: lin('#c07a2a') if py > c['h'] + 0.068 else (lin('#f2e6d4') if py > c['h'] + 0.058 else lin('#d8a898')))
f0 = set(VC.bm.faces)   # 白抹布掛在檯邊（紅線）：用印刷
uvq(PR, [(c['x0'] - 0.04, c['h'] - 0.38, 0.75), (c['x0'] - 0.04, c['h'] - 0.38, 0.38), (c['x0'] - 0.04, c['h'] + 0.005, 0.38), (c['x0'] - 0.04, c['h'] + 0.005, 0.75)], C['towel'])
uvq(PR, [(c['x0'] - 0.04, c['h'] + 0.006, 0.75), (c['x0'] - 0.04, c['h'] + 0.006, 0.38), (c['x0'] + 0.2, c['h'] + 0.006, 0.38), (c['x0'] + 0.2, c['h'] + 0.006, 0.75)], sub(C['towel'], 0, 0.6, 1, 1))
# 收銀機（z −0.75，面向走道）
K.ph_put('CashRegister_01', 1.41, c['h'], -0.7, -PI / 2, height=0.3, decimate=0.08)   # v8：收銀機（Poly Haven）
VC.crbox(1.12, 1.3, c['h'], c['h'] + 0.1, -0.35, -0.15, '#d8c8a0', r=0.004, seg=1)    # 筷子、湯匙籃
# 砧板檯後面（老闆那一側）的小東西：辣椒罐、塑膠袋一捲
for k in range(4): clathe(GL, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.1), (0.0, 0.1)], 1.8, c['h'], -0.3 + k * 0.2, ['#a8200e', '#e8d8a8', '#2a140a', '#e8e0c8'][k], seg=8)
# 招牌下的橫樑（砧板檯上方，面向走道）＋「公館燒臘」招牌
VC.cbox(c['x0'] - 0.02, c['x0'] + 0.06, 2.34, H, CASE_Z[0] - 4.2, CASE_Z[0] + 0.05, '#cfc6b0')
on_wall(PR, 'right', CASE_Z[0] - 4.1 - Z0, CASE_Z[0] - Z0, 2.38, 3.18, C['sign'], d=X1 - (c['x0'] - 0.025))
# 電視（後段上方，吊架，斜斜面向用餐區）
T = rot(1.35, -4.75, -PI * 0.13)
def rbox_rot(m, T, lx, ly, lz, w, h, d, yaw, col):   # 轉了 yaw 的方塊（中心在本地 lx, ly, lz）
    cx, cz = T(lx, lz); bm = L.rbox_bm(w, h, d, r=0.01, seg=1); f0 = set(m.bm.faces)
    m.add_bm(bm, Matrix.Translation(g2b(cx, ly, cz)) @ Matrix.Rotation(yaw, 4, 'Z')); bm.free(); return m.paint(newfaces(m, f0), col)
TVYAW = -PI * 0.13
rbox_rot(VC, T, 0, 2.62, -0.13, 0.54, 0.4, 0.38, TVYAW, '#222326'); rbox_rot(VC, T, 0, 2.62, -0.37, 0.4, 0.32, 0.12, TVYAW, '#2a2b2e')
a, b_ = T(-0.23, 0.061), T(0.23, 0.061)
uvq(SCR, [(a[0], 2.46, a[1]), (b_[0], 2.46, b_[1]), (b_[0], 2.78, b_[1]), (a[0], 2.78, a[1])], (0, 0, 1, 1))
p_ = T(0, -0.15); ccyl(VM, (p_[0], 2.42, p_[1]), (p_[0], H, p_[1]), 0.02, '#3a3a3a', seg=6); VM.cbox(p_[0] - 0.3, p_[0] + 0.3, 2.38, 2.42, p_[1] - 0.2, p_[1] + 0.2, '#3a3a3a')

# ================= 燒臘玻璃櫃（前段 z 2.2～5.4） =================
kz0, kz1 = CASE_Z; gx0, gx1 = c['x0'], c['x1']; top = 2.48
ST.box(gx0 - 0.03, gx1 + 0.02, c['h'] - 0.035, c['h'], kz0, kz1)                    # 櫃子下面的檯面（放肉盤）
ST.box(gx0 - 0.03, gx1 + 0.02, top, top + 0.06, kz0, kz1)                            # 頂框
for z in (kz0, kz0 + 1.07, kz0 + 2.14, kz1):
    for x in (gx0 - 0.015, gx1 - 0.02): VM.cbox(x - 0.018, x + 0.018, c['h'], top, z - 0.02 if z > kz0 else z, z + 0.02 if z < kz1 else z, '#c0c4c8')
MS['glass'].quad([(gx0 - 0.02, c['h'], kz1), (gx0 - 0.02, c['h'], kz0), (gx0 - 0.02, top, kz0), (gx0 - 0.02, top, kz1)])   # 面向走道的玻璃
MS['glass'].quad([(gx0, c['h'], kz1 - 0.01), (gx1, c['h'], kz1 - 0.01), (gx1, top, kz1 - 0.01), (gx0, top, kz1 - 0.01)])  # 門那一端
VM.cbox(gx0 - 0.03, gx0 - 0.015, c['h'] + 0.26, c['h'] + 0.28, kz0, kz1, '#c0c4c8')
ST.box(X1 - 0.02, X1, c['h'], 2.5, kz0, kz1)   # 櫃子後面右牆的不鏽鋼擋板（參考圖櫃子裡亮亮的反光）                                  # 玻璃中段的橫條
# 吊桿＋勾子（兩根桿，前低後高）
RAIL_X, RAIL_Y = 1.42, 2.3
ccyl(VM, (RAIL_X, RAIL_Y, kz0 + 0.05), (RAIL_X, RAIL_Y, kz1 - 0.05), 0.012, '#b0b4b8', seg=8)
for z in (kz0 + 0.05, kz1 - 0.05): ccyl(VM, (RAIL_X, RAIL_Y, z), (RAIL_X, top, z), 0.01, '#b0b4b8', seg=6)


def hook(x, z, y1):
    ccyl(VM, (x, RAIL_Y, z), (x, y1, z), 0.004, '#c8b890', seg=4)
    ccyl(VM, (x, y1, z), (x + 0.02, y1 - 0.03, z), 0.004, '#c8b890', seg=4)


def bird(x, z, kind):
    """v6 燒鴨、油雞：勾子穿過細長的脖子吊著；身體長（鴨身長 0.45 m）、胸窄、前後扁；皮有一圈一圈的皺褶（頂點往外推、顏色深淺跟著走）；
    鴨頭深色、彎過勾子；棒腿收在身體下段兩側、翅膀貼兩側。焦糖色漸層：中間亮、下面和邊緣深；油亮反光畫進頂點色"""
    if kind == 'duck': sc, col_hi, col_lo, col_edge, body_r, body_h, neck_len = 1.0, '#9a3406', '#4a1002', '#1e0401', 0.118, 0.45, 0.17   # 深焦糖色帶紅（飽和一點：粗糙度 0.3 的反光會把顏色洗淡）
    else: sc, col_hi, col_lo, col_edge, body_r, body_h, neck_len = 0.9, '#eab650', '#c4861c', '#865008', 0.12, 0.33, 0.1   # 淡金黃
    ytop = RAIL_Y - 0.03; hook(x, z, ytop)
    yb = ytop - neck_len - body_h
    prof = [(0.0, 0.0), (body_r * 0.4, 0.012), (body_r * 0.8, body_h * 0.1), (body_r * 0.98, body_h * 0.26), (body_r, body_h * 0.42), (body_r * 0.9, body_h * 0.6),
            (body_r * 0.66, body_h * 0.78), (body_r * 0.36, body_h * 0.92), (0.022 * sc, body_h * 0.99)]
    nn = 5
    prof += [(0.019 * sc - 0.004 * k / nn, body_h + neck_len * k / nn) for k in range(1, nn + 1)] + [(0.0, body_h + neck_len + 0.004)]
    sq = Matrix.Diagonal((1.0, 0.55, 1.0, 1.0))   # 前後扁（Blender y＝遊戲 −z）
    bm = L.lathe(prof, seg=20); rr = random.Random(int(z * 997))
    ph = rr.uniform(0, 6)
    for v in bm.verts:
        t = v.co.z / body_h
        if t > 1.0: continue
        a = math.atan2(v.co.y, v.co.x)
        wr = 0.035 * math.sin(t * 34 + ph + 0.6 * math.sin(a * 2)) * math.sin(PI * t)        # 皮的皺褶（一圈一圈、不整齊）
        k = 1 + wr + 0.05 * math.sin(a * 3 + ph) * math.sin(PI * t) + rr.uniform(-0.02, 0.02)
        v.co.x *= k * (0.92 if t > 0.55 else 1.0); v.co.y *= k * (1.12 if v.co.y < 0 else 0.88)   # 胸窄、胸前鼓一點、背平
        v.co.x += 0.012 * math.sin(t * 5 + ph) * math.sin(PI * t)                                 # 掛著有點歪
    f0 = set(GL.bm.faces); GL.add_bm(bm, Matrix.Translation(g2b(x, yb, z)) @ sq); bm.free(); fs = newfaces(GL, f0)
    def grad(px, py, pz):
        t = (py - yb) / body_h
        if t > 1.0: return mix(col_edge, col_lo, 0.5)                                            # 脖子：深色
        e = min(1.0, abs(px - x) / body_r)
        base = mix(col_lo, col_hi, max(0.0, min(1.0, 0.1 + 1.2 * t if t < 0.55 else 0.76 - (t - 0.55) * 1.4)))
        wr = 0.5 + 0.5 * math.sin(t * 34 + ph)                                                   # 皺褶的凹處深一點
        sp = 0.5 + 0.5 * math.sin(px * 61 + py * 47 + pz * 83) * math.sin(py * 29 - px * 37)
        k = (1 - 0.55 * e ** 2.2) * (0.78 + 0.22 * wr) * (0.86 + 0.22 * sp); return [base[0] * k, base[1] * k, base[2] * k, 1.0]
    paint_fn(GL, fs, grad); gloss_pass(GL, fs, 0.6 if kind == 'duck' else 0.5, 22)   # 表皮的高光：窄而亮（油光）
    # 頭：深色、彎過勾子垂在前面
    f0 = set(GL.bm.faces)
    GL.ell((x + 0.028, ytop + 0.004, z), 0.03 * sc, 0.02 * sc, 0.019 * sc, seg=8, rings=5)
    GL.ell((x + 0.052, ytop - 0.04, z), 0.02 * sc, 0.04 * sc, 0.017 * sc, seg=8, rings=5)
    if kind == 'duck': ccyl(GL, (x + 0.056, ytop - 0.07, z), (x + 0.06, ytop - 0.12, z), 0.012, '#1a0802', seg=6, r2=0.005)
    paint_fn(GL, newfaces(GL, f0), lambda px, py, pz: lin('#1e0a04') if kind == 'duck' else mix(col_edge, col_lo, 0.5))
    for s in (-1, 1):
        f0 = set(GL.bm.faces)   # 棒腿（收在身體下段兩側，腿骨尖朝下外）
        GL.ell((x + s * body_r * 0.72, yb + body_h * 0.13, z - 0.01), 0.036 * sc, 0.085 * sc, 0.034 * sc, seg=8, rings=5, matrix=Matrix.Rotation(-s * 0.45, 4, 'Y'))
        ccyl(GL, (x + s * body_r * 0.95, yb + body_h * 0.0, z - 0.01), (x + s * body_r * 1.15, yb - 0.05, z - 0.01), 0.011, col_edge, seg=6, r2=0.007)
        paint_fn(GL, newfaces(GL, f0), lambda px, py, pz: mix(col_edge, col_lo, 0.6))
        f0 = set(GL.bm.faces)   # 翅膀：貼著身體兩側、翅尖往外翹
        GL.ell((x + s * body_r * 0.86, yb + body_h * 0.55, z), 0.022 * sc, 0.13 * sc, 0.05 * sc, seg=8, rings=5, matrix=Matrix.Rotation(-s * 0.16, 4, 'Y'))
        paint_fn(GL, newfaces(GL, f0), lambda px, py, pz: mix(col_edge, col_hi, 0.35))


def charsiu(x, z, ln):
    """v6 叉燒：長條、截面不規則（每一圈頂點的半徑都亂一點）、邊角焦黑往外翹；紅色往內漸淡；勾子穿過上端"""
    ytop = RAIL_Y - 0.03; hook(x, z, ytop)
    rr = random.Random(int(z * 1000)); n = 12; seg = 9
    prof = [(0.0, 0.0), (0.026, 0.006)] + [(0.046, ln * k / n) for k in range(1, n)] + [(0.03, ln), (0.0, ln + 0.004)]
    f0 = set(GL.bm.faces); bm = L.lathe(prof, seg=seg)
    bend = rr.uniform(-0.05, 0.05); flare = [rr.uniform(0.75, 1.25) for _ in range(seg)]; tw = rr.uniform(-0.4, 0.4)
    for v in bm.verts:
        t = v.co.z / ln; a = math.atan2(v.co.y, v.co.x); i_ = int(round(a / (2 * PI / seg))) % seg
        k = flare[i_] * (0.85 + 0.15 * math.sin(t * 9 + i_)) * (1 + rr.uniform(-0.08, 0.08))
        v.co.x *= k; v.co.y *= k * 0.5
        ca, sa = math.cos(tw * t), math.sin(tw * t); v.co.x, v.co.y = v.co.x * ca - v.co.y * sa, v.co.x * sa + v.co.y * ca
        v.co.x += bend * math.sin(PI * t)
    GL.add_bm(bm, Matrix.Translation(g2b(x, ytop - ln, z))); bm.free(); fs = newfaces(GL, f0)
    def grad(px, py, pz):
        e = math.hypot((px - x) / 0.046, (pz - z) / 0.023); t = (py - (ytop - ln)) / ln
        edge = max(0.0, min(1.0, (e - 0.7) / 0.5)); spot = 0.5 + 0.5 * math.sin(py * 53 + px * 91 + pz * 37)
        base = mix('#8e1004', '#1a0201', edge)   # 深紅、邊緣焦黑
        k = (1 - 0.6 * edge * (0.5 + 0.5 * spot)) * (0.45 + 0.55 * min(1.0, t * 5)); return [base[0] * k, base[1] * k, base[2] * k, 1.0]
    paint_fn(GL, fs, grad); gloss_pass(GL, fs, 0.4, 22)


# v6：肉擠滿一排、互相貼近（參考圖由近到遠：油雞、燒鴨、叉燒）：叉燒 9 條、燒鴨 4 隻、油雞 3 隻
for k in range(9): charsiu(RAIL_X + (0.025 if k % 2 else -0.025), kz0 + 0.14 + k * 0.1, 0.5 + 0.06 * ((k * 7) % 3))
for k in range(4): bird(RAIL_X, kz0 + 1.2 + k * 0.29, 'duck')
for k in range(3): bird(RAIL_X, kz0 + 2.42 + k * 0.27, 'chicken')
# 下層：不鏽鋼淺盤 4 個，堆滿兩層（切好的叉燒、燒肉、油雞、燒鴨）
for k, kind in enumerate(('cs', 'sy', 'ck', 'dk')):
    tz = kz0 + 0.42 + k * 0.78
    VM.crbox(1.1, 1.8, c['h'], c['h'] + 0.05, tz - 0.36, tz + 0.36, '#b8bcc0', r=0.012, seg=1)
    # v8（D159：不准一樣大小的方塊排格子）：切好的肉一片一片疊成魚鱗狀（每片長、寬、厚、角度都不同，往盤子中間堆高，邊上有幾片斜靠）
    rr = random.Random(611 + k); n_ = 0
    for row in range(5):
        zc = tz - 0.27 + row * 0.135 + rr.uniform(-0.02, 0.02); ncol = rr.randint(4, 6); xs_ = sorted(rr.uniform(1.17, 1.72) for _ in range(ncol))
        for col_, xc in enumerate(xs_):
            for lay in range(1 + (1 if 1.3 < xc < 1.6 and rr.random() < 0.6 else 0)):
                L_ = rr.uniform(0.09, 0.15); W_ = rr.uniform(0.05, 0.085); T_ = rr.uniform(0.016, 0.03) if kind in ('cs', 'sy') else rr.uniform(0.025, 0.045)
                cx_, cz_ = xc + rr.uniform(-0.02, 0.02), zc + rr.uniform(-0.02, 0.02); y0 = c['h'] + 0.04 + lay * 0.022 + rr.uniform(0.0, 0.006)
                sx, sz = cx_ - W_ / 2, cz_ - L_ / 2
                if kind == 'cs':
                    fs = GL.crbox(sx, sx + W_, y0, y0 + T_, sz, sz + L_, '#8e2016', r=0.006, seg=1)
                    paint_fn(GL, fs, lambda px, py, pz, sx=sx, W_=W_: mix('#3a0e08', '#c04a30', min(1.0, 4 * min(px - sx, sx + W_ - px) / W_)))
                elif kind == 'sy':
                    fs = GL.crbox(sx, sx + W_, y0, y0 + T_ + 0.015, sz, sz + L_, '#e8d8c0', r=0.005, seg=1)
                    paint_fn(GL, fs, lambda px, py, pz, y0=y0, T_=T_: lin('#b8681e') if py > y0 + T_ + 0.008 else (lin('#f2e6d4') if py > y0 + T_ * 0.6 else lin('#c89080')))
                elif kind == 'ck':
                    fs = GL.crbox(sx, sx + W_, y0, y0 + T_, sz, sz + L_, '#e8b850', r=0.01, seg=1)
                    paint_fn(GL, fs, lambda px, py, pz, y0=y0, T_=T_: lin('#e8b048') if py > y0 + T_ * 0.7 else lin('#f4e8d0'))
                else:
                    fs = GL.crbox(sx, sx + W_, y0, y0 + T_, sz, sz + L_, '#7a2e10', r=0.01, seg=1)
                    paint_fn(GL, fs, lambda px, py, pz, y0=y0, T_=T_: lin('#6a240c') if py > y0 + T_ * 0.7 else lin('#e8c8b0'))
                vs_ = list({v for f in fs for v in f.verts}); tilt = rr.uniform(-0.25, 0.25) if lay or rr.random() < 0.3 else rr.uniform(-0.06, 0.06)
                bmesh.ops.rotate(GL.bm, verts=vs_, cent=g2b(cx_, y0, cz_), matrix=(Matrix.Rotation(rr.uniform(-0.5, 0.5), 3, 'Z') @ Matrix.Rotation(tilt, 3, 'Y')))
                gloss_pass(GL, fs, 0.3, 4); n_ += 1
# 櫃子裡的暖色燈泡：一排 5 盞，直接照在肉上
for z in [kz0 + 0.3 + k * 0.65 for k in range(5)]:
    clathe(VM, [(0.0, 0.0), (0.03, 0.0), (0.09, -0.08), (0.095, -0.1), (0.0, -0.1)], 1.3, top - 0.01, z, '#b8863e', seg=14)
    MS['warm'].sphere((1.3, top - 0.1, z), 0.035, seg=10, rings=6)
# 價目卡（放大，貼在玻璃正面的靠門那一段、肉的下面，照參考圖）
for k, key in enumerate(('card0', 'card1')):
    y0 = 1.32 - k * 0.34; za, zb = 3.33, 4.29   # 在兩根玻璃框中間
    uvq(PR, [(gx0 - 0.025, y0, za), (gx0 - 0.025, y0, zb), (gx0 - 0.025, y0 + 0.31, zb), (gx0 - 0.025, y0 + 0.31, za)], C[key])
# 櫃台後面（老闆那一側）的地墊、腳下
VC.cbox(c['x1'] + 0.05, SHELF['x0'] - 0.05, 0.0, 0.015, -4.2, 2.8, '#3a3a36')

# ================= 櫃台後面靠右牆的層架（白色碗盤疊、調味罐、小紙條） =================
s = SHELF
for y in (0.0, 0.9, 1.3, 1.7, 2.1):
    if y == 0.0: VC.cbox(s['x0'], s['x1'], 0, 0.9, s['z0'], s['z1'], '#a8aca8'); continue
    ST.box(s['x0'] - 0.03, s['x1'], y - 0.025, y, s['z0'], s['z1'])
for z in (s['z0'] + 0.02, -1.0, 1.0, s['z1'] - 0.02): VM.cbox(s['x0'] - 0.03, s['x0'] - 0.01, 0.9, 2.12, z - 0.012, z + 0.012, '#a9aeb2')
z = s['z0'] + 0.15
while z < s['z1'] - 0.15:
    kind = R.random()
    if kind < 0.45:
        for k in range(R.randint(6, 12)): clathe(VC, [(0.0, 0.0), (0.06, 0.0), (0.1, 0.035), (0.0, 0.006)], 2.85, 1.3 + k * 0.028, z, '#f4f2ea', seg=12)
        z += 0.24
    elif kind < 0.75:
        for k in range(R.randint(8, 14)): clathe(VC, [(0.0, 0.0), (0.09, 0.0), (0.12, 0.018), (0.0, 0.004)], 2.85, 1.7 + k * 0.012, z, '#f6f4ee', seg=14)
        z += 0.28
    else:
        for k in range(3): clathe(GL, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.11), (0.025, 0.13), (0.0, 0.13)], 2.82, 2.1, z + (k - 1) * 0.08, R.choice(['#e0c070', '#a8301e', '#3a2a1a', '#c8a060']), seg=8)
        z += 0.26
for k in range(6): clathe(GL, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.12), (0.03, 0.14), (0.0, 0.14)], 2.84, 0.9, -3.8 + k * 0.5, R.choice(['#e0c070', '#a8301e', '#e8e0d0']), seg=8)
rp = wg('right', 'print')
for k, key in enumerate(('note1', 'note3', 'note5')):   # 層架上貼的小紙條（手寫）
    zc = -3.0 + k * 1.6; on_wall(rp, 'right', zc - Z0, zc - Z0 + 0.2, 2.15, 2.3, C[key], d=0.29)
rv = wg('right', 'vc'); rv.crbox(X1 - 0.3, X1, 2.45, 2.9, -1.0, -0.1, '#e6dcc4', r=0.015, seg=1)   # 右牆也有一台冷氣
for k in range(8): rv.cbox(X1 - 0.315, X1 - 0.3, 2.5 + k * 0.045, 2.515 + k * 0.045, -0.95, -0.15, '#b8ae98')

# ================= v6 密度：後段、每個角落 =================
def pbox(m, x0, x1, y0, y1, z0, z1, rect, side_rect=None):
    """印刷貼圖的紙箱（六面，上面和側面可以不同格子）"""
    sr = side_rect or rect
    uvq(m, [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], sub(sr, 0, 0.6, 1, 1))
    uvq(m, [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], rect); uvq(m, [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], rect)
    uvq(m, [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], sr); uvq(m, [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], sr)


def red_stool_stack(x, z, n):
    """紅色塑膠椅（台灣小吃店的方凳）疊起來：上窄下寬的方殼"""
    for k in range(n):
        y = k * 0.055
        fs = clathe(GL, [(0.17 * 1.414, 0.0), (0.2 * 1.414, 0.0), (0.155 * 1.414, 0.44), (0.0, 0.45)], x, y, z, '#c42e26', seg=4, mat=Matrix.Rotation(PI / 4, 4, 'Z'))
        gloss_pass(GL, fs, 0.25, 4)
    VC.cbox(x - 0.07, x + 0.07, n * 0.055 + 0.445, n * 0.055 + 0.452, z - 0.025, z + 0.025, '#5a1010')   # 椅面的提手洞


# 走道邊（店門左邊、窗前）：紅色塑膠椅一疊 7 張；最前面左角一疊 5 張
red_stool_stack(-1.82, 5.78, 7); red_stool_stack(-2.62, 5.9, 5)
EXTRA_BLOCKS.append([-1.82, 5.78, 0.46, 0.46, '紅色塑膠椅疊（走道邊、店門左邊）'])
EXTRA_BLOCKS.append([-2.62, 5.9, 0.46, 0.46, '紅色塑膠椅疊（左前角）'])
# 左後角：紙箱（免洗餐盒、白米）疊三個、一袋米
pbox(PR, -2.95, -2.45, 0.0, 0.4, -5.85, -5.45, C['box']); pbox(PR, -2.92, -2.5, 0.4, 0.74, -5.82, -5.48, C['box2']); pbox(PR, -2.95, -2.55, 0.74, 1.0, -5.86, -5.5, C['box'])
VC.crbox(-2.4, -2.02, 0.0, 0.2, -5.85, -5.45, '#e8e2d0', r=0.06, seg=2)   # 一袋米（塑膠編織袋）
EXTRA_BLOCKS.append([-2.47, -5.65, 0.96, 0.44, '左後角紙箱、米袋'])
# 櫃台後面靠門那一角（老闆那一側，x 1.9～3.0、z 3.0～6.4）：紙箱、米袋、塑膠桶、一捆塑膠袋
pbox(PR, 2.35, 2.95, 0.0, 0.42, 5.55, 6.35, C['box']); pbox(PR, 2.4, 2.92, 0.42, 0.78, 5.6, 6.2, C['box2'])
pbox(PR, 2.3, 2.95, 0.0, 0.42, 4.6, 5.45, C['box2']); clathe(VC, [(0.0, 0.0), (0.19, 0.0), (0.22, 0.48), (0.0, 0.48)], 2.6, 0.0, 3.9, '#2a5aa8', seg=14)
for k in range(3): clathe(VC, [(0.0, 0.0), (0.12, 0.0), (0.14, 0.3), (0.0, 0.3)], 2.6 + 0.02 * k, 0.78, 5.85 + 0.03 * k, '#f2f0ea', seg=8)
EXTRA_BLOCKS.append([2.63, 5.47, 0.7, 1.8, '櫃台後面靠門那一角的紙箱'])
EXTRA_BLOCKS.append([2.6, 3.9, 0.46, 0.46, '櫃台後面的藍色塑膠桶'])
# 後牆不鏽鋼工作檯：更多鍋、罐、塑膠袋；牆上手寫紙條、外送單（夾子）、延長線
for (x, r_, h_) in ((-2.75, 0.1, 0.14), (-1.7, 0.09, 0.12), (-0.55, 0.11, 0.3)):
    clathe(bm_, [(0.0, 0.0), (r_, 0.0), (r_ + 0.004, h_), (r_ + 0.012, h_ + 0.01), (0.0, h_ + 0.01)], x, 0.9, -6.05, '#c0c4c8', seg=14)
for k in range(6): clathe(bg, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.15), (0.03, 0.18), (0.0, 0.18)], -2.45 + k * 0.12, 0.9, -5.98, ['#f0e8c8', '#3a2a1a', '#a8301e', '#e0c070', '#2a4a2a', '#f4f0e8'][k], seg=8)
for k in range(2): clathe(bv, [(0.0, 0.0), (0.09, 0.0), (0.1, 0.22), (0.0, 0.22)], -0.85 + k * 0.05, 0.145, -6.3 + k * 0.05, '#f0eee8', seg=8)   # 下層一捆塑膠袋
pbox(bp, -2.15, -1.6, 0.145, 0.5, -6.45, -6.05, C['box'])
on_wall(bp, 'back', 3.6, 3.92, 1.5, 1.85, C['order0'], d=0.004); on_wall(bp, 'back', 3.62, 3.94, 1.1, 1.45, C['order1'], d=0.006)   # 外送單（廚房門左邊）
for y in (1.85, 1.45): bm_.cbox(X0 + 3.74, X0 + 3.82, y - 0.02, y + 0.015, Z0, Z0 + 0.012, '#3a3a3e')
on_wall(bp, 'back', 0.12, 0.42, 1.48, 1.68, C['note4'], d=0.004); on_wall(bp, 'back', 0.15, 0.45, 2.4, 2.6, C['note2'], d=0.004)
on_wall(bp, 'back', 5.05, 5.32, 1.0, 1.2, C['note0'], d=0.004)
bv.crbox(-1.1, -0.75, 0.9, 0.94, -6.2, -6.1, '#f2f2ee', r=0.008, seg=1)   # 延長線（白色插座排）
for k in range(4): bv.cbox(-1.06 + k * 0.08, -1.02 + k * 0.08, 0.94, 0.945, -6.18, -6.12, '#c83a2a' if k == 0 else '#3a3a3a')
ccyl(bv, (-0.75, 0.92, -6.15), (-0.4, 0.92, -6.42), 0.006, '#1e1e1e', seg=4); ccyl(bv, (-0.4, 0.92, -6.42), (-0.4, 0.4, -6.47), 0.006, '#1e1e1e', seg=4)
bv.cbox(-0.48, -0.32, 0.3, 0.42, Z0, Z0 + 0.02, '#ece8de')   # 牆上的插座
# 左牆後段（工作檯上面）：掛勺子、漏勺的橫桿
lvm = wg('left', 'vm'); ccyl(lvm, (X0 + 0.07, 1.62, -6.3), (X0 + 0.07, 1.62, -5.25), 0.01, '#a8acb0', seg=6)
for k in range(7):
    zz = -6.2 + k * 0.15; ccyl(lvm, (X0 + 0.07, 1.62, zz), (X0 + 0.07, 1.2, zz), 0.008, '#c4c8cc', seg=5)
    if k % 2: clathe(lvm, [(0.0, 0.0), (0.05, 0.0), (0.055, 0.04), (0.0, 0.01)], X0 + 0.08, 1.12, zz, '#c4c8cc', seg=10)                       # 湯勺
    else:
        clathe(lvm, [(0.0, 0.0), (0.06, 0.012), (0.07, 0.03), (0.0, 0.03)], X0 + 0.08, 1.14, zz, '#9a9ea2', seg=12)                                  # 漏勺
for k in range(2): lv.cbox(X0 + 0.02, X0 + 0.06, 1.66, 1.7, -6.32 + k * 1.1, -6.28 + k * 1.1, '#6a6a6a')
# 盛飯台：第二個大電鍋、飯匙、另一個湯桶、塑膠袋一捆掛在檯邊、延長線
clathe(VC, [(0.0, 0.0), (0.22, 0.0), (0.24, 0.04), (0.24, 0.32), (0.21, 0.38), (0.06, 0.42), (0.0, 0.43)], 1.72, c['h'], -4.15, '#ece8e0', seg=20)
VC.cbox(1.48, 1.5, c['h'] + 0.1, c['h'] + 0.18, -4.2, -4.1, '#c8342c')
VC.crbox(1.5, 1.56, c['h'] + 0.44, c['h'] + 0.46, -3.75, -3.5, '#e8dcc0', r=0.004, seg=1); _f0 = set(VC.bm.faces); VC.ell((1.53, c['h'] + 0.45, -3.42), 0.035, 0.008, 0.05, seg=8, rings=4); VC.paint(newfaces(VC, _f0), '#ece0c4')   # 飯匙
clathe(VM, [(0.0, 0.0), (0.17, 0.0), (0.18, 0.32), (0.19, 0.33), (0.0, 0.33)], 1.72, c['h'], -2.95, '#bcc0c4', seg=16)
clathe(VM, [(0.0, 0.0), (0.18, 0.0), (0.19, 0.03), (0.0, 0.03)], 1.72, c['h'] + 0.33, -2.95, '#c8ccd0', seg=16)
for k in range(3): clathe(VC, [(0.0, 0.0), (0.06, 0.0), (0.07, 0.24), (0.0, 0.24)], c['x0'] - 0.02 - 0.03 * k, c['h'] - 0.3, -1.15 + 0.03 * k, '#f2f0ea', seg=8)
VC.crbox(1.15, 1.45, c['h'], c['h'] + 0.035, -4.45, -4.3, '#f2f2ee', r=0.006, seg=1); ccyl(VC, (1.3, c['h'] + 0.02, -4.3), (1.45, c['h'] + 0.15, -4.2), 0.006, '#1e1e1e', seg=4)
# 砧板檯、收銀機旁：手寫紙條貼在玻璃、塑膠袋掛勾、外帶紙袋
on_wall(PR, 'right', 1.35 - Z0, 1.62 - Z0, c['h'] + 0.05, c['h'] + 0.22, C['note1'], d=X1 - (c['x0'] - 0.04))
for k in range(2): clathe(VC, [(0.0, 0.0), (0.07, 0.0), (0.08, 0.28), (0.0, 0.28)], c['x0'] - 0.05, c['h'] - 0.34, -0.15 + 0.06 * k, '#f2f0ea', seg=8)
for k in range(5): VC.crbox(1.62, 1.85, c['h'] + k * 0.012, c['h'] + 0.01 + k * 0.012, 0.0, 0.3, '#c8a878', r=0.002, seg=1)   # 一疊外帶紙袋
# ================= 收尾：牆分組、合併、匯出 =================
for k, m in list(WG.items()):
    if isinstance(m, KK.RCMesh): m.flush()
for k, m in list(WG.items()):
    side, key = k; m.finish(G[side], uv=(key in ('steel', 'vc', 'vm', 'gloss', 'tube', 'glass') or key in M and key not in ('print', 'wall', 'floor', 'ceil', 'screen')),
                            props={'glass': 1} if key == 'glass' else None, smooth=key in ('gloss', 'vm'))
for k in ('vc', 'gloss', 'vm'): MS[k].flush()
for m in TM.values(): m.finish(root, uv=True, smooth=True)
K.remove_protos()
for k in ('vc', 'gloss', 'vm', 'steel', 'glass', 'tube', 'warm'):
    MS[k].finish(root, props={'glass': 1} if k == 'glass' else None, smooth=k in ('gloss', 'vm'), uv=k not in ('vc', 'gloss', 'vm'))
PR.finish(root, uv=False); SCR.finish(root, uv=False)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
root['extraBlocks'] = json.dumps(EXTRA_BLOCKS, ensure_ascii=False)
st = L.export(OUT)
print('CC0_USED', K.used())
mats = sorted({ms.material.name for ob in bpy.data.objects if ob.type == 'MESH' for ms in ob.material_slots if ms.material})
print('OK', OUT, 'materials', len(mats), mats, 'extraBlocks', EXTRA_BLOCKS)
