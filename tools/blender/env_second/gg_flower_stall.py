"""公館捷運站口的花攤「晨露花舖」（GG-FLOWER-STALL-1110；LAWWW 11-10 派：GIFT-HOLIDAY-1110 AA_732 的 gg_flower「公館站口花攤」——花束、向日葵，09:00～21:00）
→ assets/models/env/second_ai/gg_flower_stall.glb（＋.json：位置、導航阻擋、互動點）。LAWWW2 帳號 A，2026-11-10。用法：
  /opt/blenv/bin/python tools/blender/env_second/gg_flower_stall.py [-- --out <glb>]
座標＝公館區域座標（x 東、y 上、z 南；店面街在 z 19～22，騎樓那一側是 +z），放在 (0,0,0) 不用轉。
位置：捷運出口（TK.mrtExit／gongguan_mrt_exit.glb，(−36.6, 11)，導航阻擋 x −43.1～−36.5）的西邊，人行道上 (−47, 11.6)，攤子正面朝騎樓（+z）：
  東邊離捷運出口 2.6 m（走得過去）、西邊離行道樹（−53, 9.4）的樹冠 0.8 m、北邊離路邊的機車（z 6.8）3.4 m；
  路人那一條 (−60,10)→(−48,14.5)（story3d.js walkRoutes.gongguan）在 x −48 是 z 14.5，攤子前緣 z 12.5——中間 2 m。
做法（D141 v1）：木頭三層階梯花台、鋅桶裡的花（玫瑰、向日葵、滿天星、尤加利、葉材）、牛皮紙包好的花束、右邊一張小工作台（包裝紙捲、剪刀、收銀小鐵盒）、
  四支細鋼柱撐著深綠／米白條紋的帆布雨棚，前面垂下的布簾寫店名（原創，D77）、雨棚下一串燈泡（ggf_lit_bulb：晚上亮，遊戲照 TK.addNight）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/gg_flower_stall.glb'))
GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

SX, SZ = -47.0, 11.6          # 攤子中心（公館區域座標）
W, D = 2.8, 1.5               # 寬（x）、深（z）
X0, X1, Z0, Z1 = SX - W / 2, SX + W / 2, SZ - D / 2, SZ + D / 2   # Z1＝正面（朝騎樓）
FRONT = Z1 + 0.25             # 正面地上的兩個鋅桶放到這裡
BLOCK = (SX, (Z0 - 0.15 + FRONT + 0.15) / 2, W + 0.1, FRONT + 0.3 - Z0)   # 導航阻擋 (cx, cz, w, d)：後面多 0.15 m（0.5 m 的格子照格子中心算，背板那一格要擋到）
INTERACT = (SX - 0.2, FRONT + 0.85)
NAME = '晨露花舖'

random.seed(1110)
B.reset(texres=512)
root = B.group('gg_flower_stall', props={'kind': 'gg_flower_stall', 'note': 'GG-FLOWER-STALL-1110：公館捷運站口花攤；ggf_lit_bulb 晚上亮'})
base = CL.materials()
P = 'ggf_'
M = {
    'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=0.8, target='#8a6a4a', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.65),
    'wood_dk': L.pbr(P + 'wood_dark', 'dark_wood', tile=0.8, target='#4e3a2a', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'zinc': L.flat(P + 'zinc', '#9aa1a6', rough=0.35, metal=0.45),
    'steel': L.flat(P + 'steel', '#2f3336', rough=0.45, metal=0.4),
    'water': L.flat(P + 'water', '#3d4a4c', rough=0.1),
    'stem': L.flat(P + 'stem', '#4f7a3a', rough=0.7),
    'rose_r': L.flat(P + 'rose_red', '#b2232f', rough=0.6),
    'rose_p': L.flat(P + 'rose_pink', '#e58fa6', rough=0.6),
    'rose_w': L.flat(P + 'rose_white', '#f1ece2', rough=0.6),
    'tulip_y': L.flat(P + 'tulip_yellow', '#f1c43a', rough=0.6),
    'lav': L.flat(P + 'lavender', '#8a78c0', rough=0.7),
    'sun_p': L.flat(P + 'sunflower_petal', '#f3b51c', rough=0.6),
    'sun_c': L.flat(P + 'sunflower_core', '#4a2d14', rough=0.9),
    'gyp': L.flat(P + 'gypsophila', '#f6f4ee', rough=0.8),
    'euc': L.flat(P + 'eucalyptus', '#8fa8a0', rough=0.7),
    'kraft': L.flat(P + 'kraft', '#b88a5a', rough=0.85),
    'cello': L.flat(P + 'cellophane', '#e8f0f2', rough=0.1, alpha=0.35),
    'paper': L.flat(P + 'paper_roll', '#d9c3a0', rough=0.85),
    'tin': L.flat(P + 'cash_tin', '#2f5d4a', rough=0.4, metal=0.3),
    'bulb': L.flat(P + 'lit_bulb', '#fff1cf', rough=0.3, emit=B.srgb('#ffdca0')),
    'wire': L.flat(P + 'wire', '#222222', rough=0.6),
    'mat': L.flat(P + 'rubber_mat', '#3a3b3a', rough=0.95),
    'broad': base['broad'], 'fern': base['fern'],
}
M['cello'].use_backface_culling = False
_acc = {}
def acc(key):
    if key not in _acc: _acc[key] = Mesh(P + key, M[key])
    return _acc[key]


def stripe_tex():
    """雨棚帆布：深綠／米白直條紋（每條 0.2 m；貼圖 1 個循環＝0.4 m）"""
    img = Image.new('RGB', (256, 64), (238, 230, 210)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 127, 63], fill=(46, 92, 70))
    p = os.path.join(GEN, 'gg_flower_stripe.png'); img.save(p); return p


def valance_tex():
    """前面垂下的布簾：深綠底、米白店名＋小字（原創店名，D77）"""
    Wp, Hp = 1024, 128; img = Image.new('RGB', (Wp, Hp), (46, 92, 70)); d = ImageDraw.Draw(img)
    f1 = ImageFont.truetype(FONT, 76); f2 = ImageFont.truetype(FONT, 34)
    t1, t2 = NAME, '鮮花・花束・盆栽'
    w1 = d.textlength(t1, font=f1); w2 = d.textlength(t2, font=f2); x = (Wp - w1 - 40 - w2) / 2
    d.text((x, 20), t1, font=f1, fill=(244, 238, 222)); d.text((x + w1 + 40, 58), t2, font=f2, fill=(226, 214, 186))
    for k in range(0, Wp, 64): d.polygon([(k, Hp - 10), (k + 32, Hp), (k + 64, Hp - 10), (k + 64, Hp), (k, Hp)], fill=(238, 230, 210))   # 下緣的小波浪
    p = os.path.join(GEN, 'gg_flower_valance.png'); img.save(p); return p


def price_tex():
    """花台前面的小黑板（價目）"""
    img = Image.new('RGB', (256, 192), (38, 44, 40)); d = ImageDraw.Draw(img); f = ImageFont.truetype(FONT, 30)
    for i, t in enumerate(('花束　450', '向日葵　120', '玫瑰一枝　60', '滿天星　100')): d.text((18, 14 + i * 42), t, font=f, fill=(236, 232, 220))
    p = os.path.join(GEN, 'gg_flower_price.png'); img.save(p); return p


def img_mat(name, path, rough=0.85, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    return m


def uv_quad(name, mat, pts, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
    for lp, t in zip(f.loops, uv): lp[uvl].uv = t
    bm.normal_update(); return B.mesh_obj(name, bm, mat, root)


# ======================================================================
# 地上：一塊深色橡膠墊（攤子的範圍）、木頭棧板底座
acc('mat').box(X0 - 0.05, X1 + 0.05, 0.0, 0.012, Z0 - 0.05, FRONT + 0.3)
acc('wood_dk').box(X0, X1 - 0.75, 0.012, 0.12, Z0, Z1)
# 三層階梯花台（左邊 2.05 m；右邊 0.75 m 是工作台）：前面一層最矮、後面最高
HX1 = X1 - 0.75
TIERS = [(Z1 - 0.5, Z1, 0.42), (Z1 - 1.0, Z1 - 0.5, 0.72), (Z0, Z1 - 1.0, 1.02)]
for (z0, z1, h) in TIERS:
    acc('wood').box(X0, HX1, h - 0.04, h, z0, z1)                       # 層板
    acc('wood_dk').box(X0, HX1, 0.12, h - 0.04, z1 - 0.04, z1)         # 正面的擋板
for x in (X0 + 0.03, (X0 + HX1) / 2, HX1 - 0.03):                      # 側板／中間的支撐
    acc('wood_dk').box(x - 0.03, x + 0.03, 0.12, 1.02, Z0, Z1)
# 價目小黑板（斜靠在最前面那一層的正面）
pm = img_mat(P + 'price', price_tex(), rough=0.9)
uv_quad(P + 'price_board', pm, [(X0 + 0.15, 0.14, Z1 + 0.06), (X0 + 0.55, 0.14, Z1 + 0.06), (X0 + 0.55, 0.40, Z1 + 0.02), (X0 + 0.15, 0.40, Z1 + 0.02)])
acc('wood_dk').box(X0 + 0.13, X0 + 0.57, 0.12, 0.14, Z1 + 0.02, Z1 + 0.08)


# ======================================================================
# 花：鋅桶＋莖＋花頭（花種：rose、tulip、lav、sun、gyp、euc、mix）
def bucket(cx, cy, cz, r=0.13, h=0.26):
    acc('zinc').cyl((cx, cy, cz), (cx, cy + h, cz), r * 0.85, seg=12, r2=r)
    acc('zinc').cyl((cx, cy + h - 0.02, cz), (cx, cy + h, cz), r + 0.008, seg=12)   # 桶口的捲邊
    acc('water').cyl((cx, cy + h - 0.06, cz), (cx, cy + h - 0.055, cz), r * 0.95, seg=12)
    return cy + h


def stems(cx, top, cz, n, hgt, spread):
    out = []
    for k in range(n):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.07)
        hx, hz = cx + math.cos(a) * (r + spread * random.uniform(0.3, 1)), cz + math.sin(a) * (r + spread * random.uniform(0.3, 1))
        hy = top + hgt * random.uniform(0.8, 1.05)
        acc('stem').cyl((cx + math.cos(a) * r * 0.5, top - 0.05, cz + math.sin(a) * r * 0.5), (hx, hy, hz), 0.006, seg=4, caps=False)
        out.append((hx, hy, hz))
    return out


def flowers(kind, cx, cy, cz):
    top = bucket(cx, cy, cz)
    if kind == 'sun':
        for (x, y, z) in stems(cx, top, cz, 5, 0.55, 0.12):
            ry = random.uniform(-0.5, 0.5); dz = 0.025
            acc('sun_c').ell((x, y, z + dz * 0.4), 0.045, 0.045, 0.016, seg=10, rings=4)
            for k in range(12):
                t = k * 2 * math.pi / 12
                acc('sun_p').ell((x + math.cos(t) * 0.07, y + math.sin(t) * 0.07, z), 0.03, 0.012, 0.006, seg=6, rings=3,
                                 matrix=Matrix.Rotation(-t, 4, 'Y'))   # 遊戲的 xy 平面（朝 +z）＝Blender 的 xz 平面：繞 Blender 的 y 軸
        for k in range(4): CL.card(acc('broad'), cx + random.uniform(-0.12, 0.12), top + random.uniform(0.1, 0.3), cz + random.uniform(-0.12, 0.12), 0.18, 0.16, ry=random.uniform(0, math.pi), rx=random.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))
    elif kind in ('rose_r', 'rose_p', 'rose_w', 'tulip_y'):
        for (x, y, z) in stems(cx, top, cz, 11, 0.38, 0.1):
            acc(kind).ell((x, y, z), 0.028, 0.032, 0.028, seg=8, rings=5)
        for k in range(5): CL.card(acc('fern'), cx + random.uniform(-0.1, 0.1), top + random.uniform(0.05, 0.25), cz + random.uniform(-0.1, 0.1), 0.14, 0.18, ry=random.uniform(0, math.pi), rx=random.uniform(-0.6, 0.6), uv=CL.rand_uv(0.5))
    elif kind == 'lav':
        for (x, y, z) in stems(cx, top, cz, 14, 0.4, 0.09):
            acc('lav').cyl((x, y - 0.07, z), (x, y + 0.02, z), 0.012, seg=5, r2=0.006)
    elif kind == 'gyp':
        for (x, y, z) in stems(cx, top, cz, 9, 0.36, 0.14):
            for k in range(7): acc('gyp').sphere((x + random.uniform(-0.05, 0.05), y + random.uniform(-0.04, 0.03), z + random.uniform(-0.05, 0.05)), 0.012, seg=5, rings=3)
    elif kind == 'euc':
        for (x, y, z) in stems(cx, top, cz, 7, 0.45, 0.12):
            for k in range(5): acc('euc').ell((x + random.uniform(-0.03, 0.03), y - k * 0.06, z + random.uniform(-0.03, 0.03)), 0.022, 0.022, 0.006, seg=7, rings=3)


# 三層各放一排鋅桶（每一層的桶照不同花種，前面矮、後面高）
LAYOUT = [['rose_r', 'gyp', 'tulip_y', 'rose_w', 'lav'],
          ['euc', 'rose_p', 'sun', 'rose_r', 'gyp'],
          ['sun', 'euc', 'rose_w', 'lav', 'sun']]
for (z0, z1, h), row in zip(TIERS, LAYOUT):
    n = len(row)
    for i, kind in enumerate(row):
        flowers(kind, X0 + 0.2 + i * (HX1 - X0 - 0.4) / (n - 1), h, (z0 + z1) / 2)
# 正面地上：一個高桶插著包好的花束（牛皮紙圓錐＋玻璃紙）、一個桶的向日葵
def bouquet(x, y, z, tilt, color):
    a, b = Vector((x, y, z)), Vector((x + math.sin(tilt) * 0.05, y + 0.32, z + math.cos(tilt) * 0.05))
    acc('kraft').cyl(tuple(a), tuple(b), 0.03, seg=10, r2=0.1, caps=False)
    acc('cello').cyl(tuple(b - Vector((0, 0.05, 0))), tuple(b + Vector((0, 0.05, 0))), 0.1, seg=10, r2=0.12, caps=False)
    for k in range(6): acc(color).ell((b.x + random.uniform(-0.06, 0.06), b.y + random.uniform(-0.01, 0.04), b.z + random.uniform(-0.06, 0.06)), 0.03, 0.032, 0.03, seg=8, rings=5)
    for k in range(5): acc('gyp').sphere((b.x + random.uniform(-0.07, 0.07), b.y + random.uniform(0, 0.05), b.z + random.uniform(-0.07, 0.07)), 0.012, seg=5, rings=3)
top = bucket(X0 + 0.45, 0.012, FRONT, r=0.17, h=0.42)
for k, c in enumerate(('rose_r', 'rose_p', 'tulip_y', 'rose_w')):
    t = k * math.pi / 2 + 0.4; bouquet(X0 + 0.45 + math.cos(t) * 0.07, top - 0.12, FRONT + math.sin(t) * 0.07, t, c)
flowers('sun', X0 + 1.05, 0.012, FRONT)

# ======================================================================
# 右邊的工作台：檯面、下面的層架；上面一捲牛皮紙（架子）、剪刀、收銀小鐵盒、兩束包到一半的花
WX0 = HX1 + 0.05
acc('wood').box(WX0, X1, 0.86, 0.9, Z0 + 0.1, Z1 - 0.05)
acc('wood_dk').box(WX0, X1, 0.25, 0.28, Z0 + 0.1, Z1 - 0.05)
for x in (WX0 + 0.03, X1 - 0.03):
    for z in (Z0 + 0.13, Z1 - 0.08): acc('wood_dk').box(x - 0.025, x + 0.025, 0.012, 0.86, z - 0.025, z + 0.025)
acc('steel').box(WX0 + 0.08, X1 - 0.08, 1.0, 1.015, Z0 + 0.14, Z0 + 0.16)                        # 紙捲的桿子
acc('paper').cyl((WX0 + 0.1, 1.0, Z0 + 0.15), (X1 - 0.1, 1.0, Z0 + 0.15), 0.05, seg=12)
acc('paper').box(WX0 + 0.1, X1 - 0.1, 0.9, 0.903, Z0 + 0.2, Z0 + 0.55)                          # 拉出來的那一段
acc('tin').box(X1 - 0.3, X1 - 0.1, 0.9, 0.97, Z1 - 0.35, Z1 - 0.2)
acc('steel').box(WX0 + 0.15, WX0 + 0.3, 0.9, 0.905, Z1 - 0.3, Z1 - 0.26)                        # 剪刀（簡化）
bouquet(WX0 + 0.35, 0.9, Z0 + 0.75, 1.3, 'rose_p')
for k in range(3): acc('paper').box(WX0 + 0.05, X1 - 0.05, 0.28 + k * 0.012, 0.29 + k * 0.012, Z0 + 0.2, Z1 - 0.15)   # 下層的包裝紙

# ======================================================================
# 雨棚：四支細鋼柱、後高前低的條紋帆布（上面、下面各一面）、前面垂下的布簾（店名）、側面短簾
HB, HF = 2.45, 2.2          # 雨棚後緣、前緣高度
OZ0, OZ1 = Z0 - 0.1, Z1 + 0.45
for x in (X0 + 0.04, X1 - 0.04):
    for z, h in ((Z0 + 0.02, HB), (Z1 + 0.4, HF)): acc('steel').cyl((x, 0.012, z), (x, h, z), 0.022, seg=8)
acc('steel').box(X0 - 0.05, X1 + 0.05, HB - 0.04, HB, Z0, Z0 + 0.04); acc('steel').box(X0 - 0.05, X1 + 0.05, HF - 0.04, HF, Z1 + 0.38, Z1 + 0.42)
sm = img_mat(P + 'canvas', stripe_tex(), rough=0.9); rep = W / 0.4
top_pts = [(X0 - 0.1, HB, OZ0), (X1 + 0.1, HB, OZ0), (X1 + 0.1, HF, OZ1), (X0 - 0.1, HF, OZ1)]
uv_quad(P + 'canvas_top', sm, top_pts[::-1], uv=((0, 1), (rep, 1), (rep, 0), (0, 0))[::-1])      # 朝上（從上面、從遠處看）
uv_quad(P + 'canvas_under', sm, top_pts, uv=((0, 1), (rep, 1), (rep, 0), (0, 0)))               # 朝下（站在攤子前看）
vm = img_mat(P + 'valance', valance_tex(), rough=0.9)
VH = 0.3
for pts in ([(X0 - 0.1, HF - VH, OZ1), (X1 + 0.1, HF - VH, OZ1), (X1 + 0.1, HF, OZ1), (X0 - 0.1, HF, OZ1)],
            [(X1 + 0.1, HF - VH, OZ1 - 0.005), (X0 - 0.1, HF - VH, OZ1 - 0.005), (X0 - 0.1, HF, OZ1 - 0.005), (X1 + 0.1, HF, OZ1 - 0.005)]):
    uv_quad(P + 'valance', vm, pts)
for x in (X0 - 0.1, X1 + 0.1):        # 側面的三角短簾（條紋，雙面＝兩片）
    tri = [(x, HB, OZ0), (x, HF, OZ1), (x, HF - 0.22, OZ1)]
    for pts in (tri, tri[::-1]):
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
        for lp, t in zip(f.loops, ((0, 1), (1, 0), (1, 0.3))): lp[uvl].uv = t
        bm.normal_update(); B.mesh_obj(P + 'canvas_side', bm, sm, root)
# 一串燈泡（雨棚下、前緣後面一點，微微下垂）
n = 9
for k in range(n):
    t = k / (n - 1); x = X0 + 0.1 + t * (W - 0.2); sag = 0.08 * math.sin(math.pi * t); y = HF - 0.08 - sag; z = Z1 + 0.3
    acc('wire').cyl((x, y + 0.035, z), (x, y + 0.07, z), 0.006, seg=4)
    acc('bulb').sphere((x, y, z), 0.028, seg=8, rings=5)
    if k < n - 1:
        x2 = X0 + 0.1 + (k + 1) / (n - 1) * (W - 0.2); y2 = HF - 0.08 - 0.08 * math.sin(math.pi * (k + 1) / (n - 1))
        acc('wire').cyl((x, y + 0.07, z), (x2, y2 + 0.07, z), 0.004, seg=4, caps=False)

# ======================================================================
for k, m in _acc.items():
    m.finish(root, uv=(k not in ('broad', 'fern')), smooth=False)
L.merge_by_material(root)
info = L.export(OUT, gpu_instances=True)
info.update({'stall': {'center': [SX, SZ], 'rect': [round(X0, 3), round(Z0, 3), round(X1, 3), round(FRONT + 0.3, 3)], 'faces': '+z（騎樓）'},
             'navBlock': {'cx': round(BLOCK[0], 3), 'cz': round(BLOCK[1], 3), 'w': round(BLOCK[2], 3), 'd': round(BLOCK[3], 3)},
             'interact': {'x': round(INTERACT[0], 3), 'z': round(INTERACT[1], 3), 'kind': 'gg_flower', 'label': '看看花攤'},
             'name': NAME, 'hours': '09:00～21:00（AA_732；places.js 由 LAWWW 決定要不要加）', 'nightMats': ['ggf_lit_bulb']})
L.write_json(OUT[:-4] + '.json', info)
print('OK', OUT, info.get('tris'))
