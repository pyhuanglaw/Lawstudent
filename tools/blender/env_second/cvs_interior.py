"""全日便利商店（遊戲 cvs 區域，公館南側店面）室內 → GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/cvs_interior.py [-- --out assets/models/env/second_ai/cvs_interior.glb]

座標＝遊戲 cvs 區域的座標（room() 12×9×3.2 m，店面在 z=+4.5，門在中間、兩扇窗在 x=±3.6）。
只換畫面：導航、互動點（結帳 (3.2,−0.6)、離開 (0,4.2)）、出生點在 src/zones3d.js 的 cvs 區塊，不變；
貨架、雙面貨架、櫃檯、飲料櫃的位置和大小照套件（goodsWall、counter、fridge 的導航阻擋），沒有加新的障礙物。

台灣便利商店（不仿特定品牌；店的顏色照溫州街「日日便利」招牌：白底、青綠字、琥珀色色帶）：
  白色大地磚、白牆＋青綠／琥珀色帶、明亮的天花板＋一排排 LED 燈條、吊在走道上的分類牌、
  白色金屬貨架（每層有價格條；商品是很多小盒子、瓶子、罐子、袋子，顏色放在頂點色：一次 draw call）、
  雙面貨架的端架（促銷堆疊）、玻璃門飲料櫃（櫃內打光、一排排飲料）、
  櫃檯（白色檯面、兩台收銀機、關東煮鍋、茶葉蛋鍋、包子蒸櫃、發票盒）、櫃檯後面的香菸櫃＋咖啡機、
  店面玻璃窗與自動門（門上的貼紙、門口的地墊）、牆上的海報。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）。字（分類牌、海報標題）用 canvas：SIGN_FACE_*。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/cvs_interior.glb'))

W, D, H = 12.0, 9.0, 3.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
random.seed(711)
B.reset(texres=512)
root = B.group('cvs_interior', props={'kind': 'cvs_interior', 'w': W, 'd': D, 'h': H})


def vc_mat(name, rough=0.5):
    """顏色全部來自頂點色（Color Attribute → Base Color；glTF COLOR_0）"""
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
    nt.links.new(vc.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m


M = {
    'floor': L.pbr('cvs_floor', 'large_floor_tiles_02', tile=1.2, target='#e3e1db', normal=0.4, maps=('diff', 'nor'), rough_value=0.35),
    'wall': L.flat('cvs_wall', '#f1f0eb', rough=0.85), 'teal': L.flat('cvs_teal', '#1f6f78', rough=0.6), 'amber': L.flat('cvs_amber', '#e8a33a', rough=0.6),
    'ceil': L.flat('cvs_ceiling', '#f4f4f1', rough=0.9, cull=True), 'led': L.flat('cvs_led', '#ffffff', rough=0.3, emit=B.srgb('#ffffff')),
    'shelf': L.flat('cvs_shelf', '#e7e8e6', rough=0.45, metal=0.15), 'rail': L.flat('cvs_rail', '#c9ccd0', rough=0.4, metal=0.3),
    'tag': L.flat('cvs_pricetag', '#f6e27a', rough=0.6), 'goods': vc_mat('cvs_goods', rough=0.5),
    'cooler': L.flat('cvs_cooler_frame', '#c4c8cc', rough=0.35, metal=0.4), 'coolerlit': L.flat('cvs_cooler_light', '#eef6fb', rough=0.4, emit=B.srgb('#e9f4ff')),
    'glass': L.flat('cvs_glass', '#dfe9ec', rough=0.05, alpha=0.18), 'black': L.flat('cvs_black', '#222325', rough=0.45),
    'counter': L.flat('cvs_counter', '#f3f2ee', rough=0.4), 'top': L.pbr('cvs_countertop', 'granite_tile_03', tile=0.8, target='#8d9093', maps=('diff',), res=256, rough_value=0.3),
    'steel': L.flat('cvs_steel', '#b8bcbf', rough=0.25, metal=0.6), 'mat': L.flat('cvs_mat', '#3a3d40', rough=0.95),
    'board': L.flat('cvs_sign_face', '#ffffff', rough=0.7, cull=True), 'poster': vc_mat('cvs_poster', rough=0.7), 'oden': L.flat('cvs_oden', '#b98a4e', rough=0.4),
    'bun': L.flat('cvs_bun', '#f1e9da', rough=0.6), 'frame': L.flat('cvs_frame', '#9aa0a5', rough=0.35, metal=0.5),
}
PALETTE = ['#d8432f', '#f0b429', '#2f7ed8', '#3fa34d', '#f4f1ea', '#e86f2c', '#7a4fb3', '#1d1d1f', '#c9e2f2', '#e8d5b0', '#d64b8a', '#5bb6c9', '#a6c34a', '#f29fb5']


class GMesh(Mesh):
    """商品網格：每個零件一個顏色（頂點色 Col，sRGB → 線性）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.col = self.bm.loops.layers.float_color.new('Col')
    def paint(self, faces, hexcol, k=1.0):
        lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        c = [lin(int(hexcol[i:i + 2], 16) / 255 * k) for i in (1, 3, 5)] + [1.0]
        for f in faces:
            for lp in f.loops: lp[self.col] = c
    def cbox(self, x0, x1, y0, y1, z0, z1, hexcol, k=1.0, face=None):
        """商品盒：face＝朝外的方向（'+z'、'-z'、'+x'、'-x'）時只做看得到的四面（正面、頂、兩側；背面和底貼著貨架，不做）"""
        if face is None: self.paint(L.bm_box(self.bm, x0, x1, y0, y1, z0, z1), hexcol, k); return
        bm = self.bm; V = lambda x, y, z: bm.verts.new(g2b(x, y, z)); fs = []
        q = lambda pts: fs.append(bm.faces.new([V(*p) for p in pts]))
        if face == '+z':
            q([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]); q([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)])
            q([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]); q([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)])
        elif face == '-z':
            q([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)]); q([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)])
            q([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]); q([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)])
        elif face == '+x':
            q([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)]); q([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)])
            q([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)]); q([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])
        else:
            q([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]); q([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)])
            q([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)]); q([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])
        self.paint(fs, hexcol, k)
    def ccyl(self, x, y0, y1, z, r, hexcol, seg=6, k=1.0, r2=None):
        """瓶子、罐子：側面＋上蓋（底不做）"""
        bm = self.bm; r2 = r if r2 is None else r2; lo, hi = [], []
        for i in range(seg):
            a = 2 * math.pi * i / seg; lo.append(bm.verts.new(g2b(x + math.cos(a) * r, y0, z + math.sin(a) * r))); hi.append(bm.verts.new(g2b(x + math.cos(a) * r2, y1, z + math.sin(a) * r2)))
        fs = [bm.faces.new((lo[i], hi[i], hi[(i + 1) % seg], lo[(i + 1) % seg])) for i in range(seg)]
        fs.append(bm.faces.new(hi[::-1] if False else hi))
        bmesh.ops.recalc_face_normals(bm, faces=fs); self.paint(fs, hexcol, k)


walls = {'front': [], 'back': [], 'left': [], 'right': []}
def wm(side, key):
    """會淡出的牆的零件（每面牆、每個材質一個）"""
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


# ---- 地板、天花板、LED 燈條
Mesh('cvs_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh('cvs_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
led = Mesh('cvs_led', M['led'])
for z in (-3.2, -1.6, 0.0, 1.6, 3.2):
    for x0, x1 in ((-5.4, -0.6), (0.6, 5.4)): led.box(x0, x1, H - 0.05, H - 0.01, z - 0.06, z + 0.06)
led.finish(root)

# ---- 牆（白牆、上緣青綠＋琥珀色帶、牆腳）；前牆有兩扇大窗（x=±3.6，2.8×1.9 m）和自動門（x=0，1.9×2.35 m）
def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=0.12):
    """牆面上的一塊：a＝沿牆位置、t＝離牆面往室內的距離"""
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)
for side, (a0, a1) in (('back', (X0, X1)), ('left', (Z0, Z1)), ('right', (Z0, Z1))):
    wall_box(side, 'wall', a0, a1, 0.12, H)
    wall_box(side, 'mat', a0, a1, 0.0, 0.12, 0.0, 0.13)                                   # 牆腳（深灰踢腳板）
    wall_box(side, 'teal', a0, a1, H - 0.42, H - 0.3, 0.0, 0.14); wall_box(side, 'amber', a0, a1, H - 0.3, H - 0.24, 0.0, 0.14)
# 前牆：窗與門以外的部分
xs = [X0, -5.0, -2.2, -0.95, 0.95, 2.2, 5.0, X1]       # 實牆｜窗（−5.0～−2.2）｜實牆｜門（−0.95～0.95）｜實牆｜窗｜實牆
for a0, a1 in ((xs[0], xs[1]), (xs[2], xs[3]), (xs[4], xs[5]), (xs[6], xs[7])): wall_box('front', 'wall', a0, a1, 0.0, H)
for a0, a1 in ((xs[1], xs[2]), (xs[5], xs[6])):
    wall_box('front', 'wall', a0, a1, 0.0, 1.05); wall_box('front', 'wall', a0, a1, 2.95, H)
    fr = wm('front', 'frame')
    fr.box(a0, a1, 1.0, 1.06, Z1 - 0.14, Z1 - 0.02); fr.box(a0, a1, 2.94, 3.0, Z1 - 0.14, Z1 - 0.02)
    for x in (a0, (a0 + a1) / 2, a1): fr.box(x - 0.03, x + 0.03, 1.0, 3.0, Z1 - 0.14, Z1 - 0.02)
    wm('front', 'glass').quad([(a1, 1.06, Z1 - 0.08), (a0, 1.06, Z1 - 0.08), (a0, 2.94, Z1 - 0.08), (a1, 2.94, Z1 - 0.08)])
wall_box('front', 'wall', xs[3], xs[4], 2.35, H)
fr = wm('front', 'frame')
for x in (xs[3], 0.0, xs[4]): fr.box(x - 0.04, x + 0.04, 0.0, 2.35, Z1 - 0.15, Z1 - 0.02)
fr.box(xs[3], xs[4], 2.3, 2.38, Z1 - 0.15, Z1 - 0.02); fr.box(xs[3] - 0.05, xs[4] + 0.05, 2.38, 2.6, Z1 - 0.2, Z1 - 0.02)   # 自動門的門頂箱
wm('front', 'glass').quad([(xs[4], 0.02, Z1 - 0.09), (xs[3], 0.02, Z1 - 0.09), (xs[3], 2.3, Z1 - 0.09), (xs[4], 2.3, Z1 - 0.09)])
for x0, x1 in ((xs[3] + 0.08, -0.06), (0.06, xs[4] - 0.08)):                                   # 門上的貼紙帶（琥珀＋青綠）
    wm('front', 'amber').box(x0, x1, 1.05, 1.13, Z1 - 0.1, Z1 - 0.085); wm('front', 'teal').box(x0, x1, 1.13, 1.18, Z1 - 0.1, Z1 - 0.085)
wall_box('front', 'teal', X0, X1, H - 0.42, H - 0.3, 0.0, 0.14); wall_box('front', 'amber', X0, X1, H - 0.3, H - 0.24, 0.0, 0.14)
Mesh('cvs_doormat', M['mat']).box(-1.1, 1.1, 0.0, 0.012, 3.3, 4.38).finish(root)

# ---- 貨架：白色金屬（底座、背板、層板＋價格條），商品（頂點色）
goods = GMesh('cvs_goods', M['goods']); sh, rl, tg = Mesh('cvs_shelf', M['shelf']), Mesh('cvs_rail', M['rail']), Mesh('cvs_tag', M['tag'])
# 商品（2026-10-14 第二版，使用者：「便利商店店面裡面的東西看起來就是一堆模板複製貼上超假的」）：虛構品牌的包裝貼圖集＋各類商品的形狀、同一種並排、分區陳列（cvs_goods.py）
import tempfile, cvs_goods as CG   # noqa: E402
ATLAS = CG.make_atlas(os.path.join(tempfile.gettempdir(), 'cvs_goods_atlas.png'))
gd = CG.Goods('cvs_goods_items', CG.atlas_material('cvs_goods_atlas', ATLAS)); RNG = random.Random(14)


def wall_shelf(x0, x1, zb, levels=(0.12, 0.5, 0.86, 1.22, 1.58), top=2.0, cats=None):
    """靠後牆的貨架（背板在 zb，往 +z 深 0.45）；cats＝每一層放哪幾類（由下往上）"""
    sh.box(x0, x1, 0.0, 0.1, zb, zb + 0.45); sh.box(x0, x1, 0.1, top, zb, zb + 0.03); sh.box(x0, x1, top, top + 0.05, zb, zb + 0.47)
    for x in (x0, x1): sh.box(x - 0.02, x + 0.02, 0.0, top, zb, zb + 0.45)
    for y in levels:
        sh.box(x0, x1, y - 0.025, y, zb, zb + 0.44); rl.box(x0, x1, y - 0.06, y, zb + 0.43, zb + 0.46); tg.box(x0 + 0.05, x1 - 0.05, y - 0.05, y - 0.012, zb + 0.461, zb + 0.465)
        nxt = [l for l in levels if l > y]; hmax = (nxt[0] if nxt else top) - y - 0.04
        gd.shelf(x0, x1, y, zb + 0.43, '+z', 'x', cats[levels.index(y)], hmax, RNG, rail_y=y, tag_d=zb + 0.467)


def island(xc, z0, z1, levels=(0.12, 0.48, 0.84, 1.2), top=1.55, cats_neg=None, cats_pos=None):
    """雙面貨架（中間背板，兩面都有商品）＋兩端的端架（促銷堆疊）"""
    sh.box(xc - 0.25, xc + 0.25, 0.0, 0.1, z0, z1); sh.box(xc - 0.015, xc + 0.015, 0.1, top, z0, z1); sh.box(xc - 0.26, xc + 0.26, top, top + 0.04, z0, z1)
    for y in levels:
        for s in (-1, 1):
            a, b = sorted((xc + s * 0.02, xc + s * 0.25)); sh.box(a, b, y - 0.025, y, z0, z1)
            ra, rb = sorted((xc + s * 0.24, xc + s * 0.27)); rl.box(ra, rb, y - 0.06, y, z0, z1)
            ta, tb = sorted((xc + s * 0.271, xc + s * 0.275)); tg.box(ta, tb, y - 0.05, y - 0.012, z0 + 0.05, z1 - 0.05)
            nxt = [l for l in levels if l > y]; hmax = (nxt[0] if nxt else top) - y - 0.04
            cats = (cats_pos if s > 0 else cats_neg)[levels.index(y)]
            gd.shelf(z0, z1, y, xc + s * 0.24, '+x' if s > 0 else '-x', 'z', cats, hmax, RNG, rail_y=y, tag_d=xc + s * 0.277)


wall_shelf(X0 + 0.02, -1.5, Z0 + 0.05, cats=[['daily'], ['daily2', 'daily'], ['stationery', 'daily2'], ['bread'], ['bread', 'cookie']])   # 後牆左段（套件 goodsWall(−4.5,−4.2,0,6)：牆裡面那段藏在牆後）
island(-2.0, -2.5, 2.5, cats_neg=[['chips'], ['chips'], ['chips', 'candy'], ['candy', 'cookie']], cats_pos=[['cookie'], ['cookie'], ['candy', 'cookie'], ['chips']])   # 兩排雙面貨架（套件 goodsWall(±2,0,π/2,5)）：零食・餅乾
island(2.0, -2.5, 2.5, cats_neg=[['bagnoodle'], ['cupnoodle'], ['cupnoodle'], ['cupnoodle', 'bagnoodle']], cats_pos=[['bagnoodle'], ['cupnoodle'], ['cupnoodle'], ['bread']])   # 泡麵・調味
# 端架促銷堆疊（在貨架的導航阻擋範圍內：z 端點往內 0.25 m）：每個端架只放一種商品（堆四層）＋上面一張促銷牌
ENDCAP = {(-2.0, -2.5): ('chips', 0), (-2.0, 2.5): ('cookie', 1), (2.0, -2.5): ('cupnoodle', 2), (2.0, 2.5): ('bagnoodle', 0)}
for (xc, zz), (cat, promo) in ENDCAP.items():
    s = 1 if zz > 0 else -1; face = '+z' if s > 0 else '-z'; front = zz - s * 0.02
    p = RNG.choice(CG.CATS[cat])
    for k in range(4):
        y = 0.1 + k * 0.26; sh.box(xc - 0.25, xc + 0.25, y - 0.02, y, min(front, zz - s * 0.25), max(front, zz - s * 0.25))
        a = xc - 0.24
        while a + p['w'] <= xc + 0.24 and p['h'] <= 0.24:
            gd.one(p, a, y, front, face, 'x'); a += p['w'] + 0.006
    gd.promo(xc - 0.22, xc + 0.22, 1.14, 1.46, front + s * 0.005, face, promo, back=True)   # 補背面：商品貼圖集單面（single_side 的 nodup），促銷牌從貨架另一頭看得到背面

# ---- 櫃檯後面：香菸櫃（後牆右段，套件 goodsWall(4.5,−4.2,0,3) 的位置）＋咖啡機台
cab = Mesh('cvs_cabinet', M['black']); cab.box(3.0, X1 - 0.02, 0.0, 0.9, Z0 + 0.05, Z0 + 0.5)
# 香菸櫃（上半）：黑框＋打光背板＋四層菸盒（在框裡面、玻璃後面看得到）
cab.box(3.0, X1 - 0.02, 2.14, 2.2, Z0 + 0.05, Z0 + 0.36); cab.box(3.0, X1 - 0.02, 1.2, 1.26, Z0 + 0.05, Z0 + 0.36)
for x in (3.0, X1 - 0.06): cab.box(x, x + 0.04, 1.2, 2.2, Z0 + 0.05, Z0 + 0.36)
Mesh('cvs_cabinet_light', M['coolerlit']).box(3.04, X1 - 0.06, 1.26, 2.14, Z0 + 0.05, Z0 + 0.08).finish(root)
for y in (1.4, 1.6, 1.8, 2.0):
    cab.box(3.04, X1 - 0.06, y - 0.17, y - 0.155, Z0 + 0.08, Z0 + 0.33)
    a = 3.08
    while a < X1 - 0.12:
        pk = RNG.choice(CG.CATS['smoke']); gd.box(a, a + 0.056, y - 0.155, y - 0.067, Z0 + 0.24, Z0 + 0.262, '+z', pk['cell']); a += 0.07
Mesh('cvs_cabinet_glass', M['glass']).quad([(3.04, 1.26, Z0 + 0.34), (X1 - 0.06, 1.26, Z0 + 0.34), (X1 - 0.06, 2.14, Z0 + 0.34), (3.04, 2.14, Z0 + 0.34)]).finish(root)
cab.finish(root)
top = Mesh('cvs_backtop', M['top']); top.box(3.0, X1 - 0.02, 0.9, 0.95, Z0 + 0.05, Z0 + 0.52); top.finish(root)
cm = Mesh('cvs_coffee', M['black']); cm.box(3.3, 3.8, 0.95, 1.6, Z0 + 0.1, Z0 + 0.45); cm.box(4.1, 4.6, 0.95, 1.55, Z0 + 0.1, Z0 + 0.45); cm.finish(root)
st = Mesh('cvs_coffee_steel', M['steel']); st.box(3.38, 3.72, 1.1, 1.18, Z0 + 0.45, Z0 + 0.5); st.box(4.18, 4.52, 1.1, 1.18, Z0 + 0.45, Z0 + 0.5); st.finish(root)

# ---- 櫃檯（套件 (4,−1.5) 3×0.8）：白色櫃身、石材檯面、收銀機兩台、關東煮、茶葉蛋、包子蒸櫃
cx0, cx1, cz0, cz1 = 2.5, 5.5, -1.9, -1.1
ct = Mesh('cvs_counter', M['counter']); ct.box(cx0, cx1, 0.0, 0.95, cz0, cz1); ct.finish(root)
Mesh('cvs_counter_band', M['teal']).box(cx0 - 0.005, cx1 + 0.005, 0.7, 0.82, cz1 - 0.01, cz1 + 0.005).finish(root)
Mesh('cvs_countertop', M['top']).box(cx0 - 0.03, cx1 + 0.03, 0.95, 1.0, cz0 - 0.02, cz1 + 0.05).finish(root)
pos = Mesh('cvs_pos', M['black'])
for x in (4.3, 5.05):
    pos.box(x - 0.18, x + 0.18, 1.0, 1.08, cz0 + 0.1, cz0 + 0.42); pos.box(x - 0.16, x + 0.16, 1.1, 1.36, cz0 + 0.18, cz0 + 0.22); pos.box(x - 0.02, x + 0.02, 1.0, 1.12, cz0 + 0.18, cz0 + 0.22)
pos.finish(root)
ss = Mesh('cvs_hotfood_steel', M['steel'])
ss.box(2.6, 3.25, 1.0, 1.18, cz0 + 0.1, cz1 - 0.05)                                             # 關東煮鍋
ss.cyl((3.55, 1.0, -1.5), (3.55, 1.16, -1.5), 0.17, seg=14)                                       # 茶葉蛋鍋
ss.box(2.6, 3.25, 1.18, 1.22, cz0 + 0.1, cz0 + 0.14); ss.finish(root)
od = Mesh('cvs_oden', M['oden']); od.box(2.63, 3.22, 1.16, 1.17, cz0 + 0.13, cz1 - 0.08); od.finish(root)
for i in range(9): goods.cbox(2.66 + (i % 3) * 0.19, 2.66 + (i % 3) * 0.19 + 0.12, 1.17, 1.2, cz0 + 0.18 + (i // 3) * 0.17, cz0 + 0.18 + (i // 3) * 0.17 + 0.1, random.choice(['#e8d5b0', '#c98f52', '#f4f1ea', '#d8a46a']))
for i in range(7): goods.ccyl(3.55 + math.cos(i) * 0.08, 1.14, 1.19, -1.5 + math.sin(i) * 0.08, 0.03, '#7a4a2a')   # 茶葉蛋
bs = Mesh('cvs_bun_case', M['steel']); bs.box(3.9, 4.0, 1.0, 1.5, cz0 + 0.15, cz1 - 0.1); bs.box(3.9, 4.0, 1.46, 1.5, cz0 + 0.15, cz1 - 0.1); bs.finish(root)
Mesh('cvs_bun_glass', M['glass']).box(3.72, 3.9, 1.02, 1.46, cz0 + 0.15, cz1 - 0.1).finish(root)
bn = Mesh('cvs_buns', M['bun'])
for i in range(6): bn.sphere((3.79, 1.08 + (i // 3) * 0.2, cz0 + 0.24 + (i % 3) * 0.17), 0.055, seg=8, rings=5, sy=0.75)
bn.finish(root, smooth=True)

# ---- 飲料櫃（右牆，套件 fridge (5.6,2) 0.8×4）：不鏽鋼框、玻璃門（五扇）、櫃內打光背板、五層飲料
fz0, fz1, fx = 0.0, 4.0, 5.2
cf = Mesh('cvs_cooler', M['cooler']); cf.box(fx, X1 - 0.02, 0.0, 0.25, fz0, fz1); cf.box(fx, X1 - 0.02, 2.2, 2.45, fz0, fz1)
for k in range(6): z = fz0 + k * (fz1 - fz0) / 5; cf.box(fx - 0.02, fx + 0.06, 0.25, 2.2, z - 0.03, z + 0.03)
for k in range(5): z = fz0 + (k + 0.5) * (fz1 - fz0) / 5; cf.box(fx - 0.05, fx - 0.02, 0.9, 1.6, z + 0.3, z + 0.33)      # 門把
cf.finish(root)
Mesh('cvs_cooler_light', M['coolerlit']).box(X1 - 0.08, X1 - 0.04, 0.25, 2.2, fz0, fz1).finish(root)
Mesh('cvs_cooler_glass', M['glass']).quad([(fx + 0.02, 0.25, fz0), (fx + 0.02, 0.25, fz1), (fx + 0.02, 2.2, fz1), (fx + 0.02, 2.2, fz0)]).finish(root)
cs = Mesh('cvs_cooler_shelf', M['rail'])
for y in (0.3, 0.68, 1.06, 1.44, 1.82):
    cs.box(fx + 0.1, X1 - 0.1, y - 0.02, y, fz0, fz1)
    door = [(['drink'], ['drink']), (['drink'], ['drink']), (['drink', 'can'], ['can']), (['carton'], ['drink']), (['can'], ['can'])]
    for k in range(5):
        za, zb = fz0 + k * (fz1 - fz0) / 5 + 0.05, fz0 + (k + 1) * (fz1 - fz0) / 5 - 0.05
        cats = door[k][0] if y < 1.4 else door[k][1]
        if k == 0: cats = ['drink']
        gd.shelf(za, zb, y, fx + 0.12, '-x', 'z', cats, 0.3, RNG, rail_y=y, tag_d=fx + 0.095, facings=(3, 5))
cs.finish(root)

# ---- 後牆中間（貨架與香菸櫃之間）：促銷看板（canvas 字）＋海報色塊
# 海報（2026-10-15 LAWWW2-B：原本是四塊純色方塊）：貼圖集裡的海報（現煮咖啡、集點換好禮、早餐組合、霜淇淋），跟著後牆淡出
pb = CG.Goods('WALL_back_posters', gd.mat)
for i in range(4):
    a0, a1, zf = -1.25 + i * 1.02, -0.35 + i * 1.02, Z0 + 0.13
    pb.poster('back', i, [(a0, 1.28, zf), (a1, 1.28, zf), (a1, 1.955, zf), (a0, 1.955, zf)])
pm = Mesh('WALL_back_SIGN_FACE_promo', M['board']); pm.quad([(-1.3, 2.05, Z0 + 0.125), (2.75, 2.05, Z0 + 0.125), (2.75, 2.5, Z0 + 0.125), (-1.3, 2.5, Z0 + 0.125)])
PROMO = (pm, {'dir': DIRS['back'], 'sign': '咖啡第二杯半價・集點換好禮', 'promo': 1})

# ---- 走道上的分類牌（吊在天花板，兩面）、牆上的海報
hang = Mesh('cvs_sign_hang', M['frame'])
for i, (x, z, txt) in enumerate(((-2.0, 0.0, '零食・餅乾'), (2.0, 0.0, '泡麵・調味'), (-3.8, -3.6, '麵包・飯糰'), (5.6, 2.0, '冷藏飲料'))):
    vertical = abs(x) > 5
    if vertical:
        for zz in (z - 0.5, z + 0.5): hang.cyl((x - 0.3, H, zz), (x - 0.3, 2.62, zz), 0.008, seg=4)
        for s in (-1, 1):
            p = [(x - 0.3 + s * 0.012, 2.3, z - 0.6), (x - 0.3 + s * 0.012, 2.3, z + 0.6), (x - 0.3 + s * 0.012, 2.6, z + 0.6), (x - 0.3 + s * 0.012, 2.6, z - 0.6)]
            m = Mesh(f'SIGN_FACE_aisle{i}{"ab"[s > 0]}', M['board']); m.quad(p if s > 0 else [p[1], p[0], p[3], p[2]]); uv01(m.finish(root, props={'sign': txt}))
    else:
        for xx in (x - 0.55, x + 0.55): hang.cyl((xx, H, z), (xx, 2.62, z), 0.008, seg=4)
        for s in (-1, 1):
            p = [(x - 0.65, 2.3, z + s * 0.012), (x + 0.65, 2.3, z + s * 0.012), (x + 0.65, 2.6, z + s * 0.012), (x - 0.65, 2.6, z + s * 0.012)]
            m = Mesh(f'SIGN_FACE_aisle{i}{"ab"[s > 0]}', M['board']); m.quad(p if s > 0 else [p[1], p[0], p[3], p[2]]); uv01(m.finish(root, props={'sign': txt}))
hang.finish(root)
pst = CG.Goods('WALL_left_posters', gd.mat)          # 左牆三張（關東煮、代收繳費・包裹取件、冰涼特調）：從室內看（面向 −x），左邊是 +z
for i, z in enumerate((0.8, -0.6, -2.0)):
    xf = X0 + 0.13; pst.poster('left', i, [(xf, 1.4, z + 0.4), (xf, 1.4, z - 0.4), (xf, 2.2, z - 0.4), (xf, 2.2, z + 0.4)])

# ---- 收尾：會淡出的牆（WALL_<side>_*，dir＝往室內）、商品等
for side, ms in walls.items():
    for m in ms:
        m.name = f'WALL_{m.name}'; ob = m.finish(root, uv=True, props={'dir': DIRS[side]})
for m in (goods, sh, rl, tg): m.finish(root, uv=(m is not goods))
gd.finish(root)
pb.finish(root, props={'dir': DIRS['back']}); pst.finish(root, props={'dir': DIRS['left']})
uv01(PROMO[0].finish(root, uv=True, props=PROMO[1]))
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。
# 封閉的殼直接單面；開口的零件（牆面、葉片卡、薄板）補反面，看起來和原本一樣；玻璃照舊雙面；遊戲照名字接手的板面（*_FACE_*）不動網格
# 開口但背面看不到的不補：架上的商品（正面朝走道，後面是層架）
# 分類牌、促銷看板（cvs_sign_face，只有 SIGN_FACE 在用）：明確單面（cull=True）。single_side 會跳過只有 SIGN_FACE 在用的材質（照舊雙面，第四份改的規則），
#   但部署的 GLB（10-25 第一份）是單面、tests/singleside_interiors_unit.js 也要單面；吊牌兩面各自一片、看板只從店裡看，單面就對（10-31 光照烘焙重匯時發現兩邊不一樣）
_ss = L.single_side(root, keep=r'glass', nodup=r'^cvs_goods_atlas', skip=lambda ob: 'FACE' in ob.name)
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
