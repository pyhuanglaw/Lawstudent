"""花序 Flower Notes 室內（公館 G11；FLOWER-NOTES-ART-1110，X325；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/flower_notes_interior.glb（＋.json）
使用者規格 docs/handoff/user_specs/FLOWER_NOTES_1110.md 第五、六節；參考圖 flower_notes_ref/interior_1f.png（一樓，從入口往內看）、interior_2f.png（二樓教室，只參考室內）。
配置 src/data/flower_notes_layout.js（遊戲 src/flower_notes3d.js 讀同一份）。座標＝遊戲座標（x 往東、y 往上、z 往南；店面在 +z）。
接法（和社科院圖書館東側館、萬才館一樣）：L0_root（一樓）、L1_root（二樓）；外牆 WALL_L<層>_<N|S|E|W>（extras dir＝朝室內，遊戲淡出）。
材質：洞石色牆、淺色石材地板（一樓）、淺色木地板（二樓，D112）、淺橡木直紋（展示台、櫃檯）、香檳金（細框、踢腳、扶手）、玻璃；花、花器、禮盒是頂點色。
字（區牌、招牌、黑板）畫在一張貼圖集 textures/gen/fn_signs_atlas.jpg（規格：招牌「花序 Flower Notes」、區牌「永生花藝」「鮮花花束」「包裝服務」「收銀結帳」可以用）。
  /opt/blenv/bin/python tools/blender/env_second/flower_notes_interior.py [-- --out <glb>] [--nosingle]"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from lane118_shops import rot, rbox, clathe   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/flower_notes_interior.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
src = open(os.path.join(L.ROOT, 'src/data/flower_notes_layout.js'), encoding='utf-8').read()
J = json.loads(src[src.index('{', src.index('const FLOWER_NOTES_LAYOUT=')):src.rindex('}') + 1])
W, D, T, Y1, RY, ST = J['W'], J['D'], J['wallT'], J['floors'][1]['y'], J['roofY'], J['slabT']
U, WL, SR, LD, FR, CT, DP = J['upper'], J['well'], J['stair'], J['landing'], J['front'], J['counter'], J['display']
PI = math.pi; H0 = Y1 - ST   # 一樓（二樓樓板底下）的天花板高度
GOLD, GOLD_D, STONE, STONE_D, OAK, OAK_D, CREAM = '#c9a86a', '#a88a52', '#ece6da', '#d9d1c2', '#cdb38c', '#b89a70', '#f3eee4'
PINK, ROSE, LILAC, WHITE, PEACH, YEL, LEAF, LEAF_D = '#f0b8c4', '#e58aa0', '#b9a3d8', '#f6f1e8', '#f4cdb0', '#f0d264', '#5c8a4a', '#3f6a3a'


# ---------- 字的貼圖集 ----------
def make_signs():
    Wp = Hp = 1024; im = Image.new('RGB', (Wp, Hp), STONE); d = ImageDraw.Draw(im); uv = {}
    def F(px): return ImageFont.truetype(FONT, px)
    def put(k, x, y, w, h): uv[k] = (x / Wp, 1 - (y + h) / Hp, (x + w) / Wp, 1 - y / Hp)
    def branch(cx, cy, s, col):   # 花枝圖示：一根彎的枝、五片葉、三朵小花
        pts = [(cx - s * 0.5 + i * s / 10, cy + s * 0.5 - i * s / 10 - math.sin(i / 10 * PI) * s * 0.12) for i in range(11)]; d.line(pts, fill=col, width=max(2, int(s * 0.04)))
        for i in (2, 4, 6, 8):
            px, py = pts[i]; sg = 1 if i % 4 else -1; d.ellipse([px + sg * s * 0.04 - s * 0.07, py - s * 0.16, px + sg * s * 0.04 + s * 0.07, py - s * 0.02], outline=col, width=max(2, int(s * 0.03)))
        for i in (5, 8, 10):
            px, py = pts[i]
            for a in range(5): d.ellipse([px + math.cos(a * 1.257) * s * 0.07 - s * 0.045, py - s * 0.2 + math.sin(a * 1.257) * s * 0.07 - s * 0.045, px + math.cos(a * 1.257) * s * 0.07 + s * 0.045, py - s * 0.2 + math.sin(a * 1.257) * s * 0.07 + s * 0.045], outline=col, width=max(1, int(s * 0.025)))
    def plaque(k, x, y, w, h, zh, en, bg=STONE, fg='#8a6e3a', icon=False, zpx=None):
        d.rectangle([x, y, x + w, y + h], fill=bg); zpx = zpx or int(h * 0.42)
        if icon: branch(x + w / 2, y + h * 0.2, h * 0.26, fg)
        f = F(zpx); b = d.textbbox((0, 0), zh, font=f); d.text((x + w / 2 - (b[0] + b[2]) / 2, y + h * (0.5 if icon else 0.36) - (b[1] + b[3]) / 2), zh, font=f, fill=fg)
        if en: f2 = F(int(zpx * 0.4)); b = d.textbbox((0, 0), en, font=f2); d.text((x + w / 2 - (b[0] + b[2]) / 2, y + h * (0.78 if icon else 0.76) - (b[1] + b[3]) / 2), en, font=f2, fill=fg)
        put(k, x, y, w, h)
    plaque('preserved', 0, 0, 508, 200, '永生花藝', 'Preserved Flowers'); plaque('bouquets', 512, 0, 508, 200, '鮮花花束', 'Fresh Bouquets')
    plaque('wrap', 0, 204, 508, 120, '包裝服務｜Wrapping', '', zpx=44); plaque('checkout', 512, 204, 508, 120, '收銀結帳｜Checkout', '', zpx=44)
    plaque('logo', 0, 328, 400, 440, '花 序', 'Flower Notes', icon=True, zpx=110); plaque('stairsign', 404, 328, 400, 180, '二樓 花藝課程', 'Floral Classroom (2F)', zpx=52)
    plaque('logo_w', 404, 512, 616, 256, '花 序', 'Flower Notes', zpx=120)
    x, y, w, h = 0, 772, 420, 250; d.rectangle([x, y, x + w, y + h], fill='#2f3a36'); f = F(48); d.text((x + 24, y + 14), J['items1'][3]['lines'][0], font=f, fill='#f1efe6')
    for i, t in enumerate(J['items1'][3]['lines'][1:]): d.text((x + 34, y + 84 + i * 52), '・' + t, font=F(34), fill='#e6e2d6')
    branch(x + w - 70, y + 150, 90, '#e6e2d6'); put('board', x, y, w, h)
    os.makedirs(GEN, exist_ok=True); im.save(os.path.join(GEN, 'fn_signs_atlas.jpg'), quality=92); return uv


SUV = make_signs()
B.reset(texres=512)
root = B.group('flower_notes_interior', props={'kind': 'flower_notes_interior'})
R0 = B.group('L0_root', root); R1 = B.group('L1_root', root)
_sg = bpy.data.materials.new('fn_signs'); _sg.use_nodes = True; _nt = _sg.node_tree; _bs = _nt.nodes['Principled BSDF']; _bs.inputs['Roughness'].default_value = 0.6
_tx = _nt.nodes.new('ShaderNodeTexImage'); _tx.image = bpy.data.images.load(os.path.join(GEN, 'fn_signs_atlas.jpg')); _nt.links.new(_tx.outputs['Color'], _bs.inputs['Base Color'])
M = {
    'floor': L.pbr('fn_floor', 'granite_tile', tile=1.6, target='#e6e0d6', normal=0.2, maps=('diff', 'nor'), rough_value=0.32),       # 淺色石材地板（D112）
    'wood_floor': L.pbr('fn_wood_floor', 'laminate_floor_02', tile=1.8, target='#d9c3a0', normal=0.25, maps=('diff', 'nor'), rough_value=0.5),   # 二樓淺色木地板
    'wall': L.pbr('fn_travertine', 'white_plaster_02', tile=2.4, target='#ece5d8', normal=0.2, maps=('diff', 'nor'), rough_value=0.7),  # 米白洞石色的牆
    'ceil': L.flat('fn_ceiling', '#f4f0e8', rough=0.95),
    'oak': L.pbr('fn_oak', 'walnut_veneer', tile=0.9, target=OAK, maps=('diff',), res=256, rough_value=0.5),
    'glass': L.flat('fn_glass', '#e6eeee', rough=0.05, alpha=0.14),
    'light': L.flat('fn_lightpanel', '#fff6e6', rough=0.5, emit=B.srgb('#fff0d8')),
    'signs': _sg,
    'vc': L.vc_material('fn_vc', rough=0.65),
    'vcm': L.vc_material('fn_vcm', rough=0.3),
}
M['vcm'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = min(0.4, B.MAX_METAL)


class Lv:
    def __init__(self, k, parent): self.k, self.parent, self.m = k, parent, {}; self.sq = []
    def get(self, key, cm=False):
        if key not in self.m: self.m[key] = CMesh(f'L{self.k}_{key}', M[key]) if cm else Mesh(f'L{self.k}_{key}', M[key])
        return self.m[key]
    vc = property(lambda s: s.get('vc', cm=True)); vm = property(lambda s: s.get('vcm', cm=True))
    def sign(self, key, pts): self.sq.append((key, [g2b(*p) for p in pts]))   # 左下、右下、右上、左上
    def finish(self):
        for key, mm in self.m.items(): mm.finish(self.parent, uv=key not in ('vc', 'vcm', 'light', 'glass'), smooth=key in ('vc', 'vcm'))
        if self.sq:
            m = Mesh(f'L{self.k}_signs', M['signs']); lay = m.bm.loops.layers.uv.new('UVMap')
            for key, pts in self.sq:
                u0, v0, u1, v1 = SUV[key]; f = m.bm.faces.new([m.bm.verts.new(p) for p in pts])
                for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
            m.finish(self.parent, uv=False, merge=False)


C0, C1 = Lv(0, R0), Lv(1, R1)
WALLS = {}
def wallmesh(lv, side, dirv):
    wid = f'L{lv}_{side}'
    if wid not in WALLS: WALLS[wid] = (Mesh(f'WALL_{wid}', M['wall']), R1 if lv == 1 else R0, dirv)
    return WALLS[wid][0]


# ---------- 花 ----------
def ccyl(m, a, b, r, col, seg=10, r2=None, caps=True):   # 蓋掉 lane118_shops 的 ccyl：那一版每畫一根就把整個網格的面做成集合，這裡幾千根會慢到跑不完
    pa, pb = g2b(*a), g2b(*b); d = pb - pa
    res = bmesh.ops.create_cone(m.bm, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    bmesh.ops.rotate(m.bm, verts=res['verts'], cent=(0, 0, 0), matrix=Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()); bmesh.ops.translate(m.bm, verts=res['verts'], vec=(pa + pb) / 2)
    m.paint({f for v in res['verts'] for f in v.link_faces}, col)
RR = random.Random(11)
def blob(c, x, y, z, r, col, k=1.0):
    """一顆小球（花、葉團）。直接拿 bmesh 回傳的頂點找面來上色——不能每顆都把整個網格的面做成集合（幾千顆會慢到跑不完）"""
    bm = c.vc.bm; res = bmesh.ops.create_uvsphere(bm, u_segments=9, v_segments=5, radius=r); bmesh.ops.translate(bm, verts=res['verts'], vec=g2b(x, y, z))
    c.vc.paint({f for v in res['verts'] for f in v.link_faces}, col, k)
def cluster(c, x, y, z, r, cols, n=14, leaf=True):
    """一團花（幾顆小球＋葉子）"""
    for i in range(n):
        a = RR.uniform(0, 2 * PI); rd = RR.uniform(0, r * 0.75); blob(c, x + math.cos(a) * rd, y + RR.uniform(-0.25, 0.45) * r, z + math.sin(a) * rd, r * RR.uniform(0.2, 0.3), RR.choice(cols), RR.uniform(0.92, 1.05))
    if leaf:
        for i in range(max(3, n // 2)): a = RR.uniform(0, 2 * PI); blob(c, x + math.cos(a) * r * 0.85, y - r * 0.3, z + math.sin(a) * r * 0.85, r * 0.28, RR.choice((LEAF, LEAF_D)))
def vase(c, x, y, z, h, cols, r=0.16, glass=True):
    """花瓶＋一束花"""
    if glass: c.get('glass').cyl((x, y, z), (x, y + h, z), r * 0.45, seg=10, r2=r * 0.55)
    else: clathe(c.vc, [(0.0, 0.0), (r * 0.4, 0.0), (r * 0.55, h * 0.5), (r * 0.35, h), (0.0, h)], x, y, z, WHITE, seg=10)
    for i in range(4): a = i * PI / 2; ccyl(c.vc, (x, y + 0.02, z), (x + math.cos(a) * r * 0.5, y + h + r * 0.4, z + math.sin(a) * r * 0.5), 0.006, LEAF_D, seg=4)
    cluster(c, x, y + h + r * 0.9, z, r * 1.5, cols)
def bouquet(c, x, y, z, s, cols, wrap=PEACH):
    """包好的花束（立著）：包裝紙圓錐、緞帶、上面一團花"""
    f0 = set(c.vc.bm.faces); c.vc.cyl((x, y, z), (x, y + s * 0.58, z), s * 0.05, seg=12, r2=s * 0.24); c.vc.paint([q for q in c.vc.bm.faces if q not in f0], wrap)
    ccyl(c.vc, (x, y + s * 0.2, z), (x, y + s * 0.25, z), s * 0.12, ROSE, seg=8); cluster(c, x, y + s * 0.74, z, s * 0.3, cols, n=8)
def dome(c, x, y, z, h=0.42, cols=(ROSE, PINK)):
    """玻璃罩永生玫瑰：香檳金底座、一小團花、玻璃罩"""
    ccyl(c.vm, (x, y, z), (x, y + 0.04, z), 0.15, GOLD, seg=14); cluster(c, x, y + 0.2, z, 0.1, cols, n=5)
    g = c.get('glass'); g.cyl((x, y + 0.04, z), (x, y + h * 0.7, z), 0.14, seg=12, caps=False); g.sphere((x, y + h * 0.7, z), 0.14, seg=12, rings=6, sy=0.9)
def giftbox(c, x, y, z, s=0.22, col=PINK):
    c.vc.crbox(x - s / 2, x + s / 2, y, y + s * 0.6, z - s / 2, z + s / 2, col, r=0.01); c.vc.cbox(x - 0.012, x + 0.012, y, y + s * 0.61, z - s / 2 - 0.002, z + s / 2 + 0.002, WHITE); c.vc.cbox(x - s / 2 - 0.002, x + s / 2 + 0.002, y, y + s * 0.61, z - 0.012, z + 0.012, WHITE)
def tree(c, x, z, h=1.9, y=0.0):
    """大盆栽（橄欖樹那一種）：白色圓盆、細樹幹、一團團葉子"""
    clathe(c.vc, [(0.0, 0.0), (0.2, 0.0), (0.26, 0.5), (0.24, 0.52), (0.0, 0.52)], x, y, z, CREAM, seg=14)
    ccyl(c.vc, (x, y + 0.5, z), (x + 0.04, y + h * 0.7, z), 0.022, '#7a6a52', seg=6)
    for i in range(14): a = RR.uniform(0, 2 * PI); rd = RR.uniform(0.05, 0.42); blob(c, x + math.cos(a) * rd, y + RR.uniform(h * 0.6, h), z + math.sin(a) * rd, RR.uniform(0.12, 0.2), RR.choice((LEAF, LEAF_D, '#7a9a5a')))
def blossom(c, x, y, z, h=1.5):
    """一大瓶櫻花枝（中央展示台、參考圖的視覺焦點）"""
    c.get('glass').cyl((x, y, z), (x, y + 0.5, z), 0.13, seg=12, r2=0.17)
    for i in range(9):
        a = i * 2 * PI / 9 + RR.uniform(-0.2, 0.2); sp = RR.uniform(0.35, 0.8); top = (x + math.cos(a) * sp, y + h * RR.uniform(0.75, 1.0), z + math.sin(a) * sp * 0.7)
        ccyl(c.vc, (x, y + 0.1, z), top, 0.012, '#6a5038', seg=5)
        for k in range(9): t = RR.uniform(0.45, 1.0); blob(c, x + (top[0] - x) * t + RR.uniform(-0.07, 0.07), y + 0.1 + (top[1] - y - 0.1) * t + RR.uniform(-0.05, 0.05), z + (top[2] - z) * t + RR.uniform(-0.07, 0.07), RR.uniform(0.035, 0.06), RR.choice((PINK, '#f7d3da', WHITE)))
MIX = [(PINK, ROSE, WHITE), (LILAC, '#8f86c8', WHITE), (WHITE, PEACH, '#f2e6c0'), (YEL, '#e9a23a', WHITE), (ROSE, '#d9577a', PINK), ('#8fb6e0', LILAC, WHITE)]


# ---------- 殼：地板、樓板、天花板、牆 ----------
C0.get('floor').box(-W / 2, W / 2, -0.1, 0.0, -D / 2, D / 2)
def rect_minus(r, h):
    x0, x1, z0, z1 = r; out = []
    if h[2] > z0: out.append((x0, x1, z0, h[2]))
    if h[3] < z1: out.append((x0, x1, h[3], z1))
    if h[0] > x0: out.append((x0, h[0], max(z0, h[2]), min(z1, h[3])))
    if h[1] < x1: out.append((h[1], x1, max(z0, h[2]), min(z1, h[3])))
    return out
for (a, b, c_, d_) in rect_minus((U['x0'], U['x1'], U['z0'], U['z1']), (WL['x0'], WL['x1'], WL['z0'], WL['z1'])):
    C1.get('wood_floor').box(a, b, Y1 - 0.03, Y1, c_, d_); C0.get('ceil').box(a, b, Y1 - ST, Y1 - 0.03, c_, d_)
C0.vm.cbox(U['x0'], WL['x0'], Y1 - ST - 0.01, Y1 + 0.02, U['z1'], U['z1'] + 0.03, GOLD)            # 樓板邊緣的香檳金收邊
C1.get('ceil').box(-W / 2, W / 2, RY, RY + 0.1, -D / 2, D / 2)
# 牆：北、東、西（兩層各一塊）；南＝店面（一樓門＋兩個櫥窗，二樓整排玻璃）
for lv, (ya, yb) in enumerate(((0.0, Y1), (Y1, RY))):
    wallmesh(lv, 'N', [0, 0, 1]).box(-W / 2, W / 2, ya, yb, -D / 2 - T, -D / 2)
    wallmesh(lv, 'W', [1, 0, 0]).box(-W / 2 - T, -W / 2, ya, yb, -D / 2, D / 2)
    wallmesh(lv, 'E', [-1, 0, 0]).box(W / 2, W / 2 + T, ya, yb, -D / 2, D / 2)
ws = wallmesh(0, 'S', [0, 0, -1]); DR = FR['door']; zS = D / 2; h1 = FR['head1']
xs = [-W / 2] + [v for w_ in FR['windows1'][:1] for v in w_] + [DR['x0'], DR['x1']] + [v for w_ in FR['windows1'][1:] for v in w_] + [W / 2]
for a, b in ((xs[0], xs[1]), (xs[2], xs[3]), (xs[4], xs[5]), (xs[6], xs[7])): ws.box(a, b, 0.0, Y1, zS, zS + T)          # 洞石牆墩
for (a, b) in FR['windows1']: ws.box(a, b, 0.0, FR['sill1'], zS, zS + T); ws.box(a, b, h1, Y1, zS, zS + T)
ws.box(DR['x0'], DR['x1'], DR['h'], Y1, zS, zS + T)
ws2 = wallmesh(1, 'S', [0, 0, -1]); w2 = FR['window2']
ws2.box(-W / 2, w2[0], Y1, RY, zS, zS + T); ws2.box(w2[1], W / 2, Y1, RY, zS, zS + T); ws2.box(w2[0], w2[1], Y1, FR['sill2'], zS, zS + T); ws2.box(w2[0], w2[1], FR['head2'], RY, zS, zS + T)
# 店面的玻璃和香檳金細框（掛在各層的群組，不跟牆一起淡出）
def glazing(c, a, b, ya, yb, n, door=False):
    c.get('glass').quad([(a, ya, zS + 0.05), (b, ya, zS + 0.05), (b, yb, zS + 0.05), (a, yb, zS + 0.05)])
    for i in range(n + 1): x = a + i * (b - a) / n; c.vm.cbox(x - 0.02, x + 0.02, ya, yb, zS + 0.02, zS + 0.09, GOLD)
    for y in (ya, yb): c.vm.cbox(a, b, y - 0.02, y + 0.02, zS + 0.02, zS + 0.09, GOLD)
    if door:
        for x in (a + 0.12, (a + b) / 2 - 0.06, (a + b) / 2 + 0.06, b - 0.12)[1:3]: ccyl(c.vm, (x, 0.9, zS - 0.02), (x, 1.5, zS - 0.02), 0.014, GOLD, seg=6)
for (a, b) in FR['windows1']: glazing(C0, a, b, FR['sill1'], h1, 2)
glazing(C0, DR['x0'], DR['x1'], 0.0, DR['h'], 2, door=True)
glazing(C1, w2[0], w2[1], FR['sill2'], FR['head2'], 6)
for (a, b) in ((w2[0], w2[0] + 0.9), (w2[1] - 0.9, w2[1])):   # 二樓窗兩端的白紗簾
    for i in range(6): x = a + (i + 0.5) * (b - a) / 6; C1.vc.cbox(x - 0.07, x + 0.07, FR['sill2'], FR['head2'], zS - 0.12 + (i % 2) * 0.04, zS - 0.1 + (i % 2) * 0.04, '#f7f4ee')
# 櫥窗展示（一樓兩個櫥窗裡面：矮台＋花）
for (a, b) in FR['windows1']:
    C0.vc.crbox(a + 0.15, b - 0.15, 0.0, 0.3, zS - 0.75, zS - 0.1, STONE, r=0.015)
    for i in range(4): x = a + 0.5 + i * (b - a - 1.0) / 3; (vase(C0, x, 0.3, zS - 0.42, 0.42, MIX[(i + int(a)) % 6]) if i % 2 == 0 else bouquet(C0, x, 0.3, zS - 0.42, 0.62, MIX[(i * 2 + 1) % 6]))


# ---------- 樓梯：一階一階（淺色石材）、底下封起來、玻璃欄板＋香檳金扶手 ----------
st = C0.get('floor'); n, r_, t_ = SR['risers'], SR['rise'], SR['tread']
for k in range(n):
    top = (k + 1) * r_; za = SR['zBottom'] - (k + 1) * t_; st.box(SR['x0'], SR['x1'], max(0.0, top - 0.6) if k > 3 else 0.0, top, za, za + t_)
    C0.vm.cbox(SR['x0'], SR['x1'], top - 0.012, top + 0.002, za + t_ - 0.02, za + t_ + 0.004, GOLD)                    # 每一階前緣的香檳金防滑條
C0.vc.cbox(SR['x0'], SR['x1'], 0.0, Y1 - ST, SR['zTop'] - 1.5, SR['zTop'] + 2.4, STONE)                                 # 樓梯底下（高的那一段）封成儲藏間
C0.vc.cbox(SR['railX'] - 0.06, SR['railX'], 0.0, 0.12, SR['zTop'], SR['zBottom'] - 0.3, STONE_D)
def rail(c, pts, x=None, z=None):
    """玻璃欄板＋上面的香檳金扶手；pts＝[(沿線座標, y)…]，x 固定（沿 z）或 z 固定（沿 x）"""
    for (a0, y0), (a1, y1) in zip(pts, pts[1:]):
        P = (lambda a, y: (x, y, a)) if x is not None else (lambda a, y: (a, y, z))
        c.get('glass').quad([P(a0, y0 + 0.06), P(a1, y1 + 0.06), P(a1, y1 + 1.0), P(a0, y0 + 1.0)])
        ccyl(c.vm, P(a0, y0 + 1.03), P(a1, y1 + 1.03), 0.022, GOLD, seg=8)
        for a, y in ((a0, y0), (a1, y1)): ccyl(c.vm, P(a, y), P(a, y + 1.03), 0.015, GOLD, seg=6)
rail(C0, [(SR['zBottom'] - 0.3, 0.3 / t_ * r_), (WL['z1'], (SR['zBottom'] - WL['z1']) / t_ * r_)], x=SR['railX'])       # 一樓看得到的那一段（挑高區）
rail(C1, [(LD['z1'] + 0.1, Y1), (WL['z1'], Y1)], x=WL['x0'])                                                           # 二樓：樓梯開口西邊
rail(C1, [(U['x0'], Y1), (WL['x0'], Y1)], z=U['railZ'])                                                                # 二樓南緣（往挑高區看）
rail(C1, [(WL['x0'], Y1), (WL['x1'], Y1)], z=WL['z1'])                                                                 # 樓梯開口南邊
C0.sign('stairsign', [(SR['railX'] - 0.9, 2.2, SR['zTop'] + 2.42), (SR['railX'] - 0.9 + 1.5, 2.2, SR['zTop'] + 2.42), (SR['railX'] - 0.9 + 1.5, 2.88, SR['zTop'] + 2.42), (SR['railX'] - 0.9, 2.88, SR['zTop'] + 2.42)]) if False else None
C0.vc.cbox(1.82, SR['railX'], 1.75, 2.45, SR['zBottom'] + 0.02, SR['zBottom'] + 0.05, STONE)                     # 樓梯口的指示牌（掛在櫃檯北端上方的橫板）
C0.sign('stairsign', [(1.86, 1.78, SR['zBottom'] + 0.055), (3.36, 1.78, SR['zBottom'] + 0.055), (3.36, 2.42, SR['zBottom'] + 0.055), (1.86, 2.42, SR['zBottom'] + 0.055)])


# ---------- 一樓 ----------
# 中央橢圓展示台：木格柵側面、石材檯面、香檳金底邊；上面花束、禮盒、中間一大瓶櫻花枝
def oval(c, key, x, z, w, d, y0, y1, seg=28):
    m = c.get(key); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=0.5, radius2=0.5, depth=1.0)
    m.add_bm(bm, Matrix.Translation(g2b(x, (y0 + y1) / 2, z)) @ Matrix.Diagonal((w, d, y1 - y0, 1.0))); bm.free()
oval(C0, 'oak', DP['x'], DP['z'], DP['w'], DP['d'], 0.1, DP['h'] - 0.06)
f0 = set(C0.vm.bm.faces); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=0.5, radius2=0.5, depth=1.0); C0.vm.add_bm(bm, Matrix.Translation(g2b(DP['x'], 0.05, DP['z'])) @ Matrix.Diagonal((DP['w'] + 0.02, DP['d'] + 0.02, 0.1, 1.0))); bm.free(); C0.vm.paint([q for q in C0.vm.bm.faces if q not in f0], GOLD)
f0 = set(C0.vc.bm.faces); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=0.5, radius2=0.5, depth=1.0); C0.vc.add_bm(bm, Matrix.Translation(g2b(DP['x'], DP['h'] - 0.03, DP['z'])) @ Matrix.Diagonal((DP['w'] + 0.08, DP['d'] + 0.08, 0.06, 1.0))); bm.free(); C0.vc.paint([q for q in C0.vc.bm.faces if q not in f0], STONE)
for i in range(46):   # 木格柵：一圈細直條
    a = i * 2 * PI / 46; C0.vc.cbox(DP['x'] + math.cos(a) * DP['w'] / 2 - 0.012, DP['x'] + math.cos(a) * DP['w'] / 2 + 0.012, 0.12, DP['h'] - 0.07, DP['z'] + math.sin(a) * DP['d'] / 2 - 0.012, DP['z'] + math.sin(a) * DP['d'] / 2 + 0.012, OAK_D)
blossom(C0, DP['x'], DP['h'], DP['z'] - 0.1, h=1.7)
for i, (dx, dz) in enumerate(((-1.1, 0.25), (-0.55, 0.42), (0.0, 0.48), (0.55, 0.42), (1.1, 0.25), (-0.9, -0.35), (0.9, -0.35))):
    (bouquet(C0, DP['x'] + dx, DP['h'], DP['z'] + dz, 0.6, MIX[i % 6], wrap=(PEACH, '#e9e0f2', WHITE)[i % 3]) if i % 2 == 0 else vase(C0, DP['x'] + dx, DP['h'], DP['z'] + dz, 0.3, MIX[(i + 2) % 6]))
giftbox(C0, DP['x'] - 1.35, DP['h'], DP['z'] - 0.1, 0.3, WHITE); dome(C0, DP['x'] + 1.38, DP['h'], DP['z'])
C0.vc.cbox(DP['x'] - 2.2, DP['x'] + 2.2, 0.0, 0.008, DP['z'] - 1.35, DP['z'] + 1.35, '#bfb9ae')                        # 展示台底下的淺灰地毯
# 展示台上面的長吊燈（兩層樓高的挑高區）
C0.vm.cbox(DP['x'] - 1.5, DP['x'] + 1.5, 4.6, 4.72, DP['z'] - 0.09, DP['z'] + 0.09, GOLD); C0.get('light').box(DP['x'] - 1.46, DP['x'] + 1.46, 4.585, 4.6, DP['z'] - 0.07, DP['z'] + 0.07)
for dx in (-1.2, 1.2): ccyl(C1.vm, (DP['x'] + dx, 4.72, DP['z']), (DP['x'] + dx, RY, DP['z']), 0.008, GOLD, seg=5)
# 物件
for it in J['items0']:
    k = it['kind']
    if k == 'preserved_shelf':
        x0, x1, z0, z1, h = it['x0'], it['x1'], it['z0'], it['z1'], it['h']
        C0.get('oak').box(x0, x1, 0.0, 0.9, z0, z1); C0.vc.cbox(x0, x1 + 0.03, 0.9, 0.94, z0 - 0.02, z1 + 0.02, STONE)   # 下面的木櫃＋石材檯面
        nb = 4
        for i in range(nb + 1): z = z0 + i * (z1 - z0) / nb; C0.vm.cbox(x1 - 0.03, x1, 0.94, h, z - 0.015, z + 0.015, GOLD); C0.vm.cbox(x0, x1, 0.94, h, z - 0.008, z + 0.008, GOLD)
        for y in (1.55, 2.15, 2.72):
            C0.vc.cbox(x0, x1, y - 0.02, y, z0, z1, CREAM); C0.get('light').box(x0 + 0.02, x0 + 0.05, y - 0.05, y - 0.02, z0 + 0.05, z1 - 0.05)
        for j, y in enumerate((0.94, 1.55, 2.15)):
            for i in range(nb):
                zc = z0 + (i + 0.5) * (z1 - z0) / nb; kd = (i + j) % 3
                if kd == 0: dome(C0, (x0 + x1) / 2, y, zc, cols=MIX[(i + j) % 6][:2])
                elif kd == 1: giftbox(C0, (x0 + x1) / 2, y, zc - 0.15, 0.24, (PINK, CREAM, PEACH)[i % 3]); giftbox(C0, (x0 + x1) / 2, y, zc + 0.18, 0.18, (WHITE, PINK)[j % 2])
                else: vase(C0, (x0 + x1) / 2, y, zc, 0.18, MIX[(i * 2 + j) % 6], r=0.1, glass=False)
        C0.vc.cbox(x1, x1 + 0.03, 2.95, 3.6, z0 + 0.4, z0 + 2.2, STONE)
        C0.sign('preserved', [(x1 + 0.035, 2.98, z0 + 2.15), (x1 + 0.035, 2.98, z0 + 0.45), (x1 + 0.035, 3.57, z0 + 0.45), (x1 + 0.035, 3.57, z0 + 2.15)])
    elif k == 'plinth':
        x, z, w_, h = it['x'], it['z'], it['w'], it['h']; C0.vc.crbox(x - w_ / 2, x + w_ / 2, 0.02, h, z - w_ / 2, z + w_ / 2, STONE, r=0.012); C0.vm.cbox(x - w_ / 2 - 0.005, x + w_ / 2 + 0.005, 0.0, 0.03, z - w_ / 2 - 0.005, z + w_ / 2 + 0.005, GOLD)
        dome(C0, x, h, z, h=0.5) if it['top'] == 'dome' else (giftbox(C0, x, h, z, 0.3, PINK), giftbox(C0, x + 0.02, h + 0.18, z, 0.2, WHITE))
    elif k == 'bouquet_stand':
        x0, x1, z0, z1, h = it['x0'], it['x1'], it['z0'], it['z1'], it['h']; xm = (x0 + x1) / 2
        C0.get('oak').box(x0, x1, 0.0, h - 0.04, z0, z1); C0.vc.cbox(x0, x1 + 0.03, h - 0.04, h, z0 - 0.02, z1 + 0.02, STONE)
        C0.vc.cbox(x0, xm, h, h + 0.35, z0 + 0.1, z1 - 0.1, STONE); C0.vm.cbox(x0, x1 + 0.03, 0.0, 0.04, z0 - 0.02, z1 + 0.02, GOLD)   # 靠牆高一階
        nq = 9
        for i in range(nq):
            zc = z0 + 0.4 + i * (z1 - z0 - 0.8) / (nq - 1)
            vase(C0, x0 + 0.22, h + 0.35, zc, 0.42, MIX[i % 6], r=0.17); (bouquet(C0, xm + 0.22, h, zc + 0.1, 0.55, MIX[(i + 3) % 6], wrap=(PEACH, WHITE, '#e9e0f2')[i % 3]) if i % 2 else vase(C0, xm + 0.22, h, zc + 0.1, 0.3, MIX[(i + 1) % 6], r=0.14))
        C0.vc.cbox(x0, x0 + 0.03, 2.2, 2.85, z1 - 2.3, z1 - 0.5, STONE)
        C0.sign('bouquets', [(x0 + 0.035, 2.23, z1 - 0.55), (x0 + 0.035, 2.23, z1 - 2.25), (x0 + 0.035, 2.82, z1 - 2.25), (x0 + 0.035, 2.82, z1 - 0.55)])
    elif k == 'cold_case':
        x0, x1, z0, z1, h, nd = it['x0'], it['x1'], it['z0'], it['z1'], it['h'], it['doors']
        C0.vc.cbox(x0, x1, 0.0, 0.18, z0, z1, STONE_D); C0.vc.cbox(x0, x1, h - 0.14, h, z0, z1, STONE); C0.vc.cbox(x0, x1, 0.18, h - 0.14, z0, z0 + 0.04, '#f4f6f6')
        C0.get('light').box(x0 + 0.05, x1 - 0.05, h - 0.17, h - 0.14, z1 - 0.2, z1 - 0.1)
        for i in range(nd + 1): x = x0 + i * (x1 - x0) / nd; C0.vm.cbox(x - 0.025, x + 0.025, 0.18, h - 0.14, z1 - 0.05, z1, GOLD)
        C0.get('glass').quad([(x0, 0.18, z1 - 0.02), (x1, 0.18, z1 - 0.02), (x1, h - 0.14, z1 - 0.02), (x0, h - 0.14, z1 - 0.02)])
        for j, y in enumerate((0.2, 0.98, 1.72)):
            C0.vc.cbox(x0 + 0.03, x1 - 0.03, y - 0.02, y, z0 + 0.04, z1 - 0.08, '#e8ecec')
            for i in range(nd * 2): xc = x0 + (i + 0.5) * (x1 - x0) / (nd * 2); ccyl(C0.vm, (xc, y, z0 + 0.4), (xc, y + 0.26, z0 + 0.4), 0.1, '#b9bdc1', seg=8); cluster(C0, xc, y + 0.42, z0 + 0.4, 0.17, MIX[(i + j * 2) % 6], n=6)
    elif k == 'wrap_shelf':
        x0, x1, z0, z1, h = it['x0'], it['x1'], it['z0'], it['z1'], it['h']
        for i in range(4): z = z0 + i * (z1 - z0) / 3; C0.vm.cbox(x0, x1, 0.9, h, z - 0.012, z + 0.012, GOLD)
        for y in (1.25, 1.7, 2.15): C0.vc.cbox(x0, x1, y - 0.02, y, z0, z1, CREAM)
        for j, y in enumerate((1.25, 1.7)):
            for i in range(7): zc = z0 + 0.25 + i * (z1 - z0 - 0.5) / 6; ccyl(C0.vc, (x0 + 0.02, y + 0.07 + (i % 2) * 0.0, zc), (x1 - 0.02, y + 0.07, zc), 0.06, (PEACH, CREAM, PINK, '#e9e0f2', WHITE, '#d9c9a8')[(i + j) % 6], seg=8)   # 包裝紙捲
        for i in range(5): giftbox(C0, (x0 + x1) / 2, 2.15, z0 + 0.3 + i * (z1 - z0 - 0.6) / 4, 0.2, (CREAM, PINK, WHITE)[i % 3])
        C0.sign('wrap', [(x0 - 0.005, 0.95, z1 - 0.1), (x0 - 0.005, 0.95, z1 - 1.5), (x0 - 0.005, 1.22, z1 - 1.5), (x0 - 0.005, 1.22, z1 - 0.1)]) if False else None
    elif k == 'plant_big': tree(C0, it['x'], it['z'])
# 東牆：櫃檯後面上方的「花序 Flower Notes」和兩塊區牌（參考圖右邊的牆）
xe = W / 2 - 0.005
C0.sign('logo', [(xe, 2.75, 5.9), (xe, 2.75, 4.5), (xe, 4.3, 4.5), (xe, 4.3, 5.9)]) if False else None
C1.sign('logo', [(xe, 4.4, 4.2), (xe, 4.4, 5.6), (xe, 5.95, 5.6), (xe, 5.95, 4.2)])                                     # 在挑高區的東牆上（掛在二樓的群組：高度在二樓）
C0.sign('wrap', [(xe, 2.75, 4.05), (xe, 2.75, 5.75), (xe, 3.15, 5.75), (xe, 3.15, 4.05)]); C0.sign('checkout', [(xe, 3.22, 4.05), (xe, 3.22, 5.75), (xe, 3.62, 5.75), (xe, 3.62, 4.05)])
# 包裝＋收銀長櫃檯：淺木直紋正面、石材檯面、香檳金踢腳；檯面上收銀螢幕、包裝紙、緞帶、小花瓶
cx0, cx1, cz0, cz1, ch = CT['x0'], CT['x1'], CT['z0'], CT['z1'], CT['h']
C0.get('oak').box(cx0, cx1, 0.06, ch - 0.05, cz0, cz1); C0.vc.crbox(cx0 - 0.04, cx1 + 0.02, ch - 0.05, ch, cz0 - 0.04, cz1 + 0.04, STONE, r=0.012); C0.vm.cbox(cx0 - 0.01, cx1, 0.0, 0.06, cz0 - 0.01, cz1 + 0.01, GOLD)
C0.get('light').box(cx0 - 0.012, cx0 - 0.004, 0.07, 0.1, cz0 + 0.1, cz1 - 0.1)
for i in range(26): z = cz0 + 0.06 + i * (cz1 - cz0 - 0.12) / 25; C0.vc.cbox(cx0 - 0.012, cx0, 0.1, ch - 0.06, z - 0.012, z + 0.012, OAK_D)
zr = CT['clerk']['z']; C0.vc.cbox(cx1 - 0.3, cx1 - 0.26, ch + 0.12, ch + 0.42, zr - 0.22, zr + 0.22, '#2b2d30'); ccyl(C0.vc, (cx1 - 0.28, ch, zr), (cx1 - 0.28, ch + 0.14, zr), 0.03, '#2b2d30', seg=6)   # 收銀螢幕
vase(C0, (cx0 + cx1) / 2, ch, cz1 - 0.5, 0.26, MIX[0]); giftbox(C0, (cx0 + cx1) / 2, ch, cz0 + 0.5, 0.26, CREAM)
for i in range(3): ccyl(C0.vc, (cx0 + 0.12, ch + 0.05, cz0 + 1.0 + i * 0.13), (cx1 - 0.1, ch + 0.05, cz0 + 1.0 + i * 0.13), 0.05, (PEACH, WHITE, PINK)[i], seg=8)
# 一樓天花板的崁燈（二樓樓板底下）
for x in (-3.5, -1.2, 1.2):
    for z in (-5.5, -3.5, -1.5, -0.2): C0.get('light').cyl((x, H0 - 0.012, z), (x, H0 - 0.002, z), 0.09, seg=10)


# ---------- 二樓花藝教室 ----------
for it in J['items1']:
    k = it['kind']
    if k == 'demo_table':
        x, z, w_, d_, h = it['x'], it['z'], it['w'], it['d'], it['h']
        C1.vc.crbox(x - w_ / 2, x + w_ / 2, Y1 + h - 0.06, Y1 + h, z - d_ / 2, z + d_ / 2, STONE, r=0.012)
        for sx in (-1, 1): C1.get('oak').box(x + sx * (w_ / 2 - 0.25) - 0.2, x + sx * (w_ / 2 - 0.25) + 0.2, Y1, Y1 + h - 0.06, z - d_ / 2 + 0.06, z + d_ / 2 - 0.06)
        C1.get('oak').box(x - w_ / 2 + 0.45, x + w_ / 2 - 0.45, Y1 + 0.15, Y1 + h - 0.06, z - d_ / 2 + 0.06, z - d_ / 2 + 0.1)
        vase(C1, x - 0.3, Y1 + h, z, 0.36, MIX[0], r=0.26); vase(C1, x + 1.2, Y1 + h, z + 0.05, 0.26, MIX[1], r=0.16)
        for i in range(5): ccyl(C1.vc, (x - 1.5 + i * 0.07, Y1 + h + 0.012, z - 0.2), (x - 1.2 + i * 0.07, Y1 + h + 0.012, z + 0.25), 0.008, LEAF, seg=4)   # 桌上的花材
        for i in range(4): clathe(C1.vc, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.12), (0.04, 0.16), (0.0, 0.16)], x + 0.4 + i * 0.16, Y1 + h, z - 0.22, (WHITE, CREAM)[i % 2], seg=10)
    elif k == 'stool':
        x, z = it['x'], it['z']; ccyl(C1.vc, (x, Y1 + 0.66, z), (x, Y1 + 0.7, z), 0.18, OAK, seg=14)
        for a in range(4): ang = a * PI / 2 + PI / 4; ccyl(C1.vc, (x + math.cos(ang) * 0.1, Y1 + 0.66, z + math.sin(ang) * 0.1), (x + math.cos(ang) * 0.17, Y1, z + math.sin(ang) * 0.17), 0.016, OAK_D, seg=6)
    elif k == 'wall_logo':
        zz = -D / 2 + 0.006; C1.sign('logo_w', [(it['x'] - 1.15, it['y'] - 0.5, zz), (it['x'] + 1.15, it['y'] - 0.5, zz), (it['x'] + 1.15, it['y'] + 0.46, zz), (it['x'] - 1.15, it['y'] + 0.46, zz)])
    elif k == 'blackboard':
        x, z, w_, h = it['x'], it['z'], it['w'], it['h']; y0 = Y1 + 1.05
        for sx in (-1, 1): ccyl(C1.vc, (x + sx * w_ * 0.42, Y1, z + 0.18), (x + sx * w_ * 0.3, y0 + h + 0.2, z - 0.05), 0.02, OAK_D, seg=6)
        ccyl(C1.vc, (x, Y1, z - 0.32), (x, y0 + h + 0.1, z - 0.06), 0.02, OAK_D, seg=6)
        C1.vc.cbox(x - w_ / 2 - 0.03, x + w_ / 2 + 0.03, y0 - 0.03, y0 + h + 0.03, z - 0.03, z, OAK); C1.sign('board', [(x - w_ / 2, y0, z + 0.004), (x + w_ / 2, y0, z + 0.004), (x + w_ / 2, y0 + h, z + 0.004), (x - w_ / 2, y0 + h, z + 0.004)])
    elif k == 'vase_shelf':
        x0, x1, z0, z1, h = it['x0'], it['x1'], it['z0'], it['z1'], it['h']
        C1.get('oak').box(x0, x1, Y1, Y1 + 0.85, z0, z1)
        for xx in (x0, x1 - 0.03): C1.get('oak').box(xx, xx + 0.03, Y1 + 0.85, Y1 + h, z0, z1)
        for y in (0.85, 1.3, 1.75, 2.2): C1.get('oak').box(x0, x1, Y1 + y - 0.03, Y1 + y, z0, z1)
        for j, y in enumerate((0.85, 1.3, 1.75)):
            for i in range(4): clathe(C1.vc, [(0.0, 0.0), (0.05, 0.0), (0.075, 0.12), (0.04, 0.22), (0.05, 0.25), (0.0, 0.25)], x0 + 0.18 + i * (x1 - x0 - 0.36) / 3, Y1 + y, (z0 + z1) / 2, (WHITE, CREAM, '#d9c9a8', PEACH)[(i + j) % 4], seg=10)
        cluster(C1, (x0 + x1) / 2, Y1 + h + 0.25, (z0 + z1) / 2, 0.3, (WHITE, LEAF, LEAF_D), n=10)
    elif k == 'glass_cabinet':
        x0, x1, z0, z1, h = it['x0'], it['x1'], it['z0'], it['z1'], it['h']
        C1.get('oak').box(x0, x1, Y1, Y1 + 0.8, z0, z1); C1.vc.cbox(x0, x0 + 0.03, Y1 + 0.8, Y1 + h, z0, z1, CREAM); C1.vc.cbox(x0, x1, Y1 + h - 0.04, Y1 + h, z0, z1, OAK)
        for i in range(5): z = z0 + i * (z1 - z0) / 4; C1.vc.cbox(x1 - 0.03, x1, Y1 + 0.8, Y1 + h, z - 0.015, z + 0.015, OAK)
        C1.get('glass').quad([(x1 - 0.01, Y1 + 0.8, z1), (x1 - 0.01, Y1 + 0.8, z0), (x1 - 0.01, Y1 + h, z0), (x1 - 0.01, Y1 + h, z1)])
        for j, y in enumerate((0.8, 1.3, 1.8)):
            C1.vc.cbox(x0, x1 - 0.03, Y1 + y - 0.02, Y1 + y, z0, z1, CREAM)
            for i in range(8): clathe(C1.vc, [(0.0, 0.0), (0.04, 0.0), (0.065, 0.1), (0.035, 0.2), (0.0, 0.2)], (x0 + x1) / 2, Y1 + y, z0 + 0.25 + i * (z1 - z0 - 0.5) / 7, (WHITE, CREAM, '#e6ddd0')[(i + j) % 3], seg=8)
    elif k == 'plant_big': tree(C1, it['x'], it['z'], y=Y1)
# 學員桌（淺木）＋布面木椅；桌上一瓶花、剪刀筒、桌墊
def fchair(c, x, z, yaw, y):
    Tr = rot(x, z, yaw); sh = y + 0.46
    rbox(c.vc, Tr, -0.22, 0.22, sh - 0.07, sh, -0.21, 0.21, '#e9e2d6', r=0.02, seg=1)                                    # 布面坐墊
    for lx in (-0.19, 0.19):
        for lz in (-0.18, 0.18): (px, pz) = Tr(lx, lz); ccyl(c.vc, (px, y, pz), (px, sh - 0.07, pz), 0.018, OAK, seg=6)
    for lx in (-0.19, 0.19): (px, pz) = Tr(lx, -0.2); ccyl(c.vc, (px, sh, pz), (px, y + 0.84, pz), 0.018, OAK, seg=6)
    rbox(c.vc, Tr, -0.2, 0.2, y + 0.6, y + 0.84, -0.225, -0.185, '#e9e2d6', r=0.015, seg=1)
for t in J['tables1']:
    x, z, w_, d_ = t['x'], t['z'], t['w'], t['d']
    C1.get('oak').box(x - w_ / 2, x + w_ / 2, Y1 + 0.7, Y1 + 0.74, z - d_ / 2, z + d_ / 2)
    for sx in (-1, 1):
        for sz in (-1, 1): C1.get('oak').box(x + sx * (w_ / 2 - 0.08) - 0.03, x + sx * (w_ / 2 - 0.08) + 0.03, Y1, Y1 + 0.7, z + sz * (d_ / 2 - 0.08) - 0.03, z + sz * (d_ / 2 - 0.08) + 0.03)
    vase(C1, x - 0.25, Y1 + 0.74, z, 0.22, MIX[t['id'] % 6], r=0.15); ccyl(C1.vc, (x + 0.3, Y1 + 0.74, z + 0.1), (x + 0.3, Y1 + 0.88, z + 0.1), 0.055, '#c9a878', seg=10)
    C1.vc.cbox(x - 0.2, x + 0.5, Y1 + 0.74, Y1 + 0.746, z - 0.3, z - 0.05, '#d9d2c0')
for q in J['seats1']: fchair(C1, q['x'], q['z'], q['yaw'], Y1)
# 二樓天花板：長條吊燈兩支、軌道燈
for (x, z) in ((-0.9, -5.0), (-0.8, -2.0)):
    C1.vc.cbox(x - 1.3, x + 1.3, RY - 0.75, RY - 0.66, z - 0.1, z + 0.1, OAK); C1.get('light').box(x - 1.26, x + 1.26, RY - 0.765, RY - 0.75, z - 0.08, z + 0.08)
    for dx in (-1.0, 1.0): ccyl(C1.vm, (x + dx, RY - 0.66, z), (x + dx, RY, z), 0.007, '#8a8f98', seg=5)
C1.vm.cbox(-4.0, 3.0, RY - 0.06, RY - 0.03, -4.02, -3.98, '#f4f1ea')
for i in range(8): x = -3.7 + i * 0.9; ccyl(C1.vm, (x, RY - 0.06, -4.0), (x, RY - 0.2, -4.05), 0.04, '#f4f1ea', seg=8); C1.get('light').cyl((x, RY - 0.212, -4.054), (x, RY - 0.2, -4.05), 0.034, seg=8)


# ---------- 完成 ----------
for wid, (m, par, d) in WALLS.items(): m.finish(par, props={'dir': d})
C0.finish(); C1.finish()
L.merge_by_material(root, keep=lambda ob: 'WALL_' in ob.name, key=lambda ob: 'L0' if ob.parent == R0 else 'L1')
if '--nosingle' not in ARGS: L.single_side(root, keep=r'glass', nodup=r'(ceil|lightpanel)')
tris = {}
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris[ob.name] = len(ob.data.loop_triangles)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=sum(tris.values()), walls=sorted(WALLS), note='FLOWER-NOTES-ART-1110 花序室內：L0_root 一樓花藝賣場、L1_root 二樓花藝教室'))
print(json.dumps({'FLOWER_NOTES': 'OK', 'tris': sum(tris.values()), 'walls': len(WALLS)}, ensure_ascii=False))
