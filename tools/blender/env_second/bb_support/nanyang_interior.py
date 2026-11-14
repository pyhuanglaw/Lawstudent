"""南洋戲院（新生南路的二輪戲院，AA_615 第 3 節）一樓大廳 → GLB。BB（帳號 A）2026-11-03 協助 LAWWW2。
  v3：照使用者 11-03 生成的參考圖 docs/story_planning/ref_images/shops/nanyang_lobby.webp（＋外觀 nanyang_ext.webp 對齊入口與售票亭）。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/nanyang_interior.py
參考圖的重點（照做）：紅地毯；牆下半截深紅色直條護牆板、上半截米色灰泥；木樑天花板＋Art Deco 吊燈（乳白玻璃、層層的燈罩）；
  左牆一整排弧形的爆米花櫃檯（紅色直條正面、淺色石材檯面、上面一條弧形燈帶＋「爆米花」燈箱、黑板價目表、爆米花機、紅白條紋紙桶、
  玻璃門飲料櫃、糖果罐、收銀機、鵝頸吊燈、牆上的電風扇）；後牆大招牌「南洋戲院」（舊木框＋米色底紅字）兩邊兩盞 Art Deco 壁燈；
  後牆兩組雙開門：左邊關著（深木、兩扇小窗、銅把手、下緣銅踢板），右邊開著，看得到影廳的紅椅子和銀幕；門口立一塊黑板架「今日放映」；
  右牆：插畫海報（夏日的風、河邊的約定、小站的…）、劇照板、每張上面一盞鵝頸燈；兩張木條長椅（黑鐵腳）；金屬垃圾桶。
外觀對齊（nanyang_ext.webp）：正面左半是售票亭（窗口朝外，大廳這側是售票亭的背牆＋一扇小門），右半是玻璃門入口；進門右手邊有舊放映機展示和兩張紅色座椅。
D77：片名、店名都是虛構的（參考圖上的片名照用，README 允許）；沒有真實品牌。D112：地板是紅地毯、不是深色木地板。
v7（11-14，LAWWW2-C 驗收 P2）：飲料櫃瓶子有標籤帶、高矮不同；紅白條紋紙桶分五疊、有條紋；入口旁的放映機改成木頭展示台＋Poly Haven 掃描的舊放映機。
v6（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 11-13）：原本的純色材質（護牆板深紅、米色、樑、黃銅、黑鐵、不鏽鋼、天花板）改成 ambientCG 材質組（名字不變），
  櫃檯小東西照顏色分族（cc0kit.std_route）；收銀機、垃圾桶換 Poly Haven 掃描模型；吊燈乳白玻璃用塑膠紋路的發光材質。位置、座位、導航阻擋都沒動。
配置只寫在 src/data/nanyang_layout.js（Blender 和遊戲共用）。座標：房間中心在原點，x 東、y 上、z 南；店門在 +z。
"""
import ast, json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402
sys.path.insert(0, HERE)
import cc0kit as KK   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/nanyang_layout.js')))"], cwd=L.ROOT))['lobby']
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else LAY['glb'])
TMP = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/nanyang'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = LAY['wallsFade']
WAIN = 1.15     # 護牆板高度
random.seed(615)
B.reset(texres=512)
root = B.group('nanyang_lobby', props={'kind': 'nanyang_lobby', 'w': W, 'd': D, 'h': H, 'layout': LAY.get('v', 3)})
_src = open(os.path.join(os.path.dirname(HERE), 'bg_cinema.py'), encoding='utf-8').read()
_fn = next(n for n in ast.parse(_src).body if isinstance(n, ast.FunctionDef) and n.name == 'poster_tex')
_ns = {'Image': Image, 'ImageDraw': ImageDraw, 'ImageFilter': ImageFilter, 'random': random, 'math': math}
exec(compile(ast.Module(body=[_fn], type_ignores=[]), 'bg_cinema.poster_tex', 'exec'), _ns)
poster_tex = _ns['poster_tex']
def font(sz): return ImageFont.truetype(FONT, sz)


def img_mat(name, path, rough=0.7):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; return mt


def uvquad(name, p0, p1, p2, p3, mat, parent=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = t
    return B.mesh_obj(name, bm, mat, parent or root, None)


def glowmat(name, hexcol, k):
    c = B.srgb(hexcol); return L.flat(name, hexcol, rough=0.4, emit=tuple(v * k for v in c[:3]))


# ---------------- 貼圖（PIL）----------------
def tex(name, size, draw):
    p = os.path.join(TMP, name); im = Image.new('RGB', size, (0, 0, 0)); draw(im, ImageDraw.Draw(im)); im.save(p); return p


def big_sign(im, d):   # 後牆的大招牌：舊木框、米色底、紅字、角落的花飾
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(120, 40, 34)); d.rounded_rectangle([14, 14, w - 14, h - 14], 30, fill=(234, 220, 194))
    d.rounded_rectangle([30, 30, w - 30, h - 30], 22, outline=(160, 60, 48), width=6)
    for cx in (70, w - 70): d.ellipse([cx - 18, h // 2 - 18, cx + 18, h // 2 + 18], outline=(160, 60, 48), width=5)
    t = '南洋戲院'; f = font(150); x = (w - 4 * 162) // 2
    for i, ch in enumerate(t): d.text((x + i * 162 + 4, 52), ch, font=f, fill=(90, 20, 18)); d.text((x + i * 162, 48), ch, font=f, fill=(176, 36, 30))
    r = random.Random(4)
    for _ in range(900): x_, y_ = r.randint(16, w - 16), r.randint(16, h - 16); d.point((x_, y_), fill=(210, 196, 170))   # 斑駁


def menu_board(im, d):   # 黑板價目表（參考圖照抄）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(70, 46, 30)); d.rectangle([16, 16, w - 16, h - 16], fill=(34, 38, 36))
    rows = [('爆米花', '50'), ('飲料(罐/瓶)', '30'), ('汽水', '30'), ('套餐(爆米花+飲料)', '70')]
    for i, (n, p) in enumerate(rows):
        y = 40 + i * 92; d.text((40, y), n, font=font(46 if len(n) < 8 else 36), fill=(236, 232, 220)); d.text((w - 120, y), p, font=font(48), fill=(236, 232, 220))


def chalk_stand(im, d):   # 黑板架「今日放映」（午場兩片，對齊外觀的時刻表：午場 13:00）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(80, 54, 34)); d.rectangle([18, 18, w - 18, h - 18], fill=(30, 34, 32))
    d.text((60, 40), '今日放映', font=font(70), fill=(240, 236, 224))
    d.text((60, 160), 'A片　13:00', font=font(60), fill=(240, 236, 224)); d.text((60, 250), 'B片　15:10', font=font(60), fill=(240, 236, 224))
    d.rounded_rectangle([50, 360, w - 50, 470], 30, outline=(240, 214, 120), width=5); d.text((100, 378), '一票兩片', font=font(64), fill=(240, 214, 120))


def popcorn_box(im, d):  # 「爆米花」燈箱
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(252, 240, 214)); d.rectangle([0, 0, w, 20], fill=(196, 40, 36)); d.rectangle([0, h - 20, w, h], fill=(196, 40, 36))
    d.text((70, 36), '爆米花', font=font(110), fill=(190, 30, 28))


def slats(im, d):        # 櫃檯正面：紅色直條
    w, h = im.size
    for x in range(0, w, 24): d.rectangle([x, 0, x + 20, h], fill=(150, 30, 34)); d.rectangle([x + 20, 0, x + 24, h], fill=(96, 18, 22))


def photo_board(im, d):  # 劇照板：一格一格的黑白劇照
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(92, 60, 36)); r = random.Random(8)
    for j in range(4):
        for i in range(3):
            x, y = 20 + i * 100, 20 + j * 110; g = r.randint(90, 200); d.rectangle([x, y, x + 86, y + 96], fill=(240, 236, 226)); d.rectangle([x + 6, y + 6, x + 80, y + 70], fill=(g, g, g - 8))
            d.ellipse([x + 26, y + 20, x + 46, y + 40], fill=(g - 60, g - 60, g - 64))


def titled_poster(kind, title, path):   # 虛構插畫海報（LAWWW2 bg_cinema 畫法）＋參考圖的片名
    poster_tex(path, kind); im = Image.open(path).convert('RGB'); d = ImageDraw.Draw(im); w, h = im.size
    d.rectangle([0, 0, w, 150], fill=(250, 246, 236)); d.text((40, 30), title, font=font(84), fill=(40, 60, 110)); im.save(path); return path


def dark_hall(im, d):    # 開著的門後面：影廳一角（暗、紅椅子、銀幕）——2D 卡片，影廳之後另做
    w, h = im.size
    for y in range(h): d.line([(0, y), (w, y)], fill=(int(18 + y / h * 10), int(12 + y / h * 6), 14))
    d.rectangle([w * 0.16, h * 0.18, w * 0.86, h * 0.46], fill=(214, 214, 206))
    for row in range(5):
        y = h * 0.58 + row * h * 0.085; n = 6 + row
        for k in range(n):
            x = w * 0.5 + (k - n / 2) * (w * 0.11 + row * 6)
            d.rounded_rectangle([x, y, x + w * 0.08 + row * 4, y + h * 0.07], 6, fill=(150 - row * 8, 26, 30))
    for k in range(6): d.ellipse([w * 0.1, h * (0.62 + k * 0.06), w * 0.1 + 6, h * (0.62 + k * 0.06) + 6], fill=(255, 200, 120))


def carpet_tex(path):
    """v5 地毯（整片 9 × 14 m＝720 × 1120）：深紅、纖維雜訊、一塊一塊深淺不一、中間走道（入口→兩組門、櫃檯前）磨得淡一點、牆邊暗"""
    import numpy as np
    Wp, Hp = 720, 1120; ppm = 80; rng = np.random.RandomState(615)
    def nz(sc, seed):
        g = np.random.RandomState(seed).rand(Hp // sc + 2, Wp // sc + 2).astype(np.float32)
        return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize(((Wp // sc + 2) * sc, (Hp // sc + 2) * sc), Image.BICUBIC), np.float32)[:Hp, :Wp] / 255
    n1, n2 = nz(90, 1), nz(18, 2); fib = rng.rand(Hp, Wp).astype(np.float32)
    X, Zg = np.meshgrid((np.arange(Wp) + 0.5) / ppm - W / 2, (np.arange(Hp) + 0.5) / ppm - D / 2)   # 第 0 列＝z −7（後牆）
    base = np.array([118, 22, 26], np.float32)
    k = 0.82 + 0.22 * n1 + 0.1 * (n2 - 0.5) + 0.12 * (fib - 0.5)
    worn = np.exp(-((X - 0.2) / 1.3) ** 2) * 0.6 + np.exp(-((X + 2.6) / 0.6) ** 2) * (Zg < 3.6) * (Zg > -5.6) * 0.5   # 走道、櫃檯前
    edge = np.clip(1 - np.minimum.reduce([X + W / 2, W / 2 - X, Zg + D / 2, D / 2 - Zg]) / 0.5, 0, 1)
    col = base[None, None] * (k * (1 + 0.16 * worn - 0.3 * edge))[..., None]
    col = col * (1 - 0.25 * worn[..., None]) + np.array([150, 70, 64]) * 0.25 * worn[..., None] * (0.8 + 0.4 * n2[..., None])
    Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(path); return path


P = {k: tex(f'{k}.png', s, f) for k, s, f in (('sign', (1024, 300), big_sign), ('menu', (560, 420), menu_board), ('chalk', (600, 520), chalk_stand),
                                               ('popbox', (560, 180), popcorn_box), ('slats', (512, 256), slats), ('photos', (340, 460), photo_board),
                                               ('hall', (512, 512), dark_hall))}
Image.open(P['chalk']).resize((512, 444), Image.LANCZOS).save(P['chalk'])   # v5：縮到 512 以內，才收得進貼圖集（材質 ≤ 12）
posters = [('sea', '夏日的風'), ('bike', '河邊的約定'), ('train', '小站的…')]
for k, t in posters: P['poster_' + k] = titled_poster(k, t, os.path.join(TMP, f'poster3_{k}.png'))

# ---------------- 材質（≤12，最後 vc_consolidate／atlas_small 合併）----------------
m_carpet = img_mat('ny_carpet', carpet_tex(os.path.join(TMP, 'carpet5.png')), rough=0.95)   # v5：自己畫的整片地毯（深紅、深淺不一、走道磨淡）
m_wall = L.pbr('ny_plaster', 'painted_plaster_wall', tile=2.5, target='#c8864a', normal=0.3, maps=('diff', 'nor'))   # v5：暖黃的舊灰泥（不是白；參考圖在暖光下是橘黃）
m_top = L.pbr('ny_counter', 'granite_tile_03', tile=0.8, target='#b8ab96', normal=0.3, maps=('diff', 'nor'), rough_value=0.3)
m_wood = L.pbr('ny_wood', 'wood_table_001', tile=1.0, target='#4a2c1a', normal=0.3, maps=('diff', 'nor'), rough_value=0.45)   # v5：深色木頭（門、長椅、招牌框；不是地板）
K = KK.Kit(root, 'ny')   # v6：純色材質換成 ambientCG 材質組（target＝原本的顏色）
m_maroon = K.acg_as('ny_maroon', 'Wood049', target='#5e1418', tile=0.8, rough_value=0.5)   # 漆成深紅的木頭（護牆板、紅椅子）
m_cream = K.acg_as('ny_cream', 'Plaster001', maps=('diff',), vary=0.04, target='#a0703e', tile=2.0, rough_value=0.8, res=256)   # v5：天花板、售票亭背牆：暖褐米色、比牆暗（不是白）
m_beam = K.acg_as('ny_beam', 'Wood049', maps=('diff',), target='#9c6e40', tile=1.2, rough_value=0.8, res=256)
m_brass = K.acg_as('ny_brass', 'Metal009', maps=('diff',), target='#b58a43', tile=0.5, rough_value=0.32, metal=0.42, res=256)
m_iron = K.acg_as('ny_iron', 'Metal009', maps=('diff',), target='#2b2a2a', tile=0.6, rough_value=0.5, metal=0.35, res=256)
m_steel = K.acg_as('ny_steel', 'Metal009', maps=('diff',), target='#a8a090', tile=0.6, rough_value=0.35, metal=0.4, res=256)
m_glass = L.flat('ny_glass', '#d8e6ea', rough=0.05, alpha=0.25)
m_warm = K.glow('ny_warm', '#ffb860', tuple(v * 8.0 for v in B.srgb('#ffb860')))   # v6：乳白玻璃燈罩（塑膠紋路＋發光；名字不變，烘焙時照名字藏起來）
m_white = m_warm   # v5：材質 ≤ 12（天花板多一個單面材質），飲料櫃的燈也用暖光
m_vc = L.vc_material('ny_props_vc', rough=0.6)
M = {}; KK.std_mats(K, M)
# v7（LAWWW2-C 11-14 P2）：①飲料櫃的瓶子不是一色一瓶：每種顏色一張「瓶身色＋白色標籤帶＋標籤上的字紋」×ambientCG 紙紋 ②紅白條紋紙桶有條紋
DRINK = ['#3c8a4a', '#d8a030', '#c84030', '#e8e0c8', '#3a6fb0']
def _drink(col):
    c = tuple(int(col[i:i + 2], 16) for i in (1, 3, 5)); dk = tuple(max(0, v - 60) for v in c)
    def dr(d, s_):
        d.rectangle([0, 0, s_, s_], fill=c); d.rectangle([0, int(s_ * 0.18), s_, int(s_ * 0.5)], fill=(246, 242, 232))   # 瓶身色、白色標籤帶（box UV 每 0.38 m 一輪＝一層架一瓶）
        d.rectangle([0, int(s_ * 0.22), s_, int(s_ * 0.26)], fill=dk); d.rectangle([0, int(s_ * 0.42), s_, int(s_ * 0.45)], fill=dk)
        for k in range(0, s_, s_ // 8): d.rectangle([k + s_ // 32, int(s_ * 0.3), k + s_ // 12, int(s_ * 0.38)], fill=dk)   # 標籤上的字紋（不寫字、沒有品牌，D77）
        d.rectangle([0, int(s_ * 0.86), s_, s_], fill=tuple(min(255, v + 40) for v in c))   # 瓶肩的反光
    return dr
for i_, c_ in enumerate(DRINK): M[f'drink{i_}'] = K.printed(f'drink{i_}', f'ny_drink{i_}', _drink(c_), 'Paper001', size=128, amp=0.1, tile=0.38, rough_value=0.3)
def _stripe(d, s_):
    for k in range(8): d.rectangle([k * s_ // 8, 0, (k + 1) * s_ // 8, s_], fill=(214, 58, 52) if k % 2 == 0 else (246, 240, 228))
M['cupstripe'] = K.printed('cupstripe', 'ny_cupstripe', _stripe, 'Paper001', size=128, amp=0.12, tile=0.16, rough_value=0.6)
RV = KK.std_route(False, dict({c_: f'drink{i_}' for i_, c_ in enumerate(DRINK)}, **{'#d63a34': 'cupstripe'}))
TM = {}
def tm(k):
    if k not in TM: TM[k] = Mesh(f'ny_cc_{k}', M[k])
    return TM[k]
IM = {k: img_mat('ny_' + k, p, rough=0.6) for k, p in P.items()}

# ---------------- 地板、天花板、樑 ----------------
_fl = Mesh('FLOOR', m_carpet); _uv = _fl.bm.loops.layers.uv.verify(); _f = _fl.bm.faces.new([_fl.bm.verts.new(g2b(*p_)) for p_ in ((X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0))])
for _lp, _t in zip(_f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): _lp[_uv].uv = _t
_fl.finish(root, uv=False)
Mesh('CEILING', K.acg_as('ny_ceiling', 'Plaster001', maps=('diff',), vary=0.04, target='#8a5e34', tile=2.4, rough_value=0.85, res=256, cull=True)).quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]).finish(root, props={'ceiling': 1})   # v5：單面朝下、暖褐（不是白）
bm_ = Mesh('BEAMS', m_beam)
for z in [Z0 + 2.0 * i for i in range(1, int(D / 2.0))]: bm_.rbox(X0, X1, H - 0.34, H, z - 0.17, z + 0.17, r=0.02, seg=2)
for x in (X0 + 0.25, X1 - 0.25): bm_.rbox(x - 0.25, x + 0.25, H - 0.34, H, Z0, Z1, r=0.02, seg=2)
bm_.finish(root)


# ---------------- 牆：上半灰泥、下半深紅直條護牆板（可淡出）----------------
def wall(d, quads, wains_runs):
    g = B.group(f'WALL_{d}', root, props={'dir': DIRS[d]})
    m = Mesh(f'WALL_{d}_plaster', m_wall, tile=2.5)
    for q in quads: m.box(*q)
    m.finish(g)
    w = Mesh(f'WALL_{d}_wains', m_maroon)
    for (ax, a0, a1, fixed, inward) in wains_runs:   # 一條一條的直板，每 0.12 m 一條、中間凹縫
        n = int(abs(a1 - a0) / 0.12)
        for i in range(n):
            u0 = a0 + i * (a1 - a0) / n; u1 = a0 + (i + 1) * (a1 - a0) / n; g_ = 0.006 * (1 if a1 > a0 else -1)
            if ax == 'x': w.rbox(min(u0, u1) + abs(g_), max(u0, u1) - abs(g_), 0, WAIN, min(fixed, fixed + inward), max(fixed, fixed + inward), r=0.004, seg=1)
            else: w.rbox(min(fixed, fixed + inward), max(fixed, fixed + inward), 0, WAIN, min(u0, u1) + abs(g_), max(u0, u1) - abs(g_), r=0.004, seg=1)
        if ax == 'x': w.rbox(min(a0, a1), max(a0, a1), WAIN - 0.02, WAIN + 0.05, min(fixed, fixed + inward * 1.6), max(fixed, fixed + inward * 1.6), r=0.01, seg=1)
        else: w.rbox(min(fixed, fixed + inward * 1.6), max(fixed, fixed + inward * 1.6), WAIN - 0.02, WAIN + 0.05, min(a0, a1), max(a0, a1), r=0.01, seg=1)
    w.finish(g); return g


T = 0.2
DL = LAY['doors']['left']; DR = LAY['doors']['right']; DH = LAY['doors']['h']
bx = [(X0, DL['x'] - DL['w'] / 2), (DL['x'] + DL['w'] / 2, DR['x'] - DR['w'] / 2), (DR['x'] + DR['w'] / 2, X1)]
wall('back', [(a, b, 0, H, Z0 - T, Z0) for a, b in bx] + [(DL['x'] - DL['w'] / 2, DL['x'] + DL['w'] / 2, DH, H, Z0 - T, Z0), (DR['x'] - DR['w'] / 2, DR['x'] + DR['w'] / 2, DH, H, Z0 - T, Z0)],
     [('x', a, b, Z0, 0.025) for a, b in bx])
EN = LAY['front']['door']; bo = LAY['booth']
wall('front', [(X0, bo['x1'], 0, H, Z1, Z1 + T), (bo['x1'], EN['x'] - EN['w'] / 2, 0, H, Z1, Z1 + T), (EN['x'] + EN['w'] / 2, X1, 0, H, Z1, Z1 + T), (EN['x'] - EN['w'] / 2, EN['x'] + EN['w'] / 2, 2.9, H, Z1, Z1 + T)],
     [('x', bo['x1'], EN['x'] - EN['w'] / 2, Z1, -0.025), ('x', EN['x'] + EN['w'] / 2, X1, Z1, -0.025)])
wall('left', [(X0 - T, X0, 0, H, Z0, Z1)], [('z', Z0, Z1, X0, 0.025)])
wall('right', [(X1, X1 + T, 0, H, Z0, Z1)], [('z', Z0, Z1, X1, -0.025)])

# 入口玻璃門（銅框、兩扇開著一點）
fr = Mesh('ENTRY_FRAME', m_brass); gl = Mesh('ENTRY_GLASS', m_glass)
ex0, ex1 = EN['x'] - EN['w'] / 2, EN['x'] + EN['w'] / 2
for x in (ex0, (ex0 + ex1) / 2, ex1): fr.box(x - 0.035, x + 0.035, 0, 2.9, Z1 - 0.03, Z1 + 0.05)
fr.box(ex0, ex1, 2.86, 2.94, Z1 - 0.03, Z1 + 0.05); fr.box(ex0, ex1, 0.0, 0.08, Z1 - 0.03, Z1 + 0.05)
gl.box(ex0 + 0.04, ex1 - 0.04, 0.08, 2.86, Z1 + 0.0, Z1 + 0.012); fr.finish(root); gl.finish(root, props={'glass': 1})
dm = CMesh('DOORMAT', L.vc_material('ny_mat_vc', rough=0.95))   # v5b（LAWWW2 選 B：近景加東西）：門口一塊深色地墊（炭灰、一圈深紅邊）
dm.crbox(ex0 - 0.2, ex1 + 0.2, 0.0, 0.018, Z1 - 1.9, Z1 - 0.15, '#5a1c1c', r=0.008, seg=1); dm.cbox(ex0 - 0.08, ex1 + 0.08, 0.018, 0.022, Z1 - 1.78, Z1 - 0.27, '#262022')
for k in range(9): dm.cbox(ex0 + 0.05 + k * 0.33, ex0 + 0.07 + k * 0.33, 0.022, 0.024, Z1 - 1.7, Z1 - 0.35, '#3a3032')
dm.finish(root)

# 售票亭的背面（外觀的售票窗在正面左半；大廳這側是一間小房間的牆＋一扇小門＋門上「售票」牌）
bk = Mesh('BOOTH_BACK', m_cream); bk.box(bo['x0'], bo['x1'], 0, 3.2, bo['z0'] - 0.12, bo['z0']); bk.box(bo['x1'] - 0.12, bo['x1'], 0, 3.2, bo['z0'], Z1); bk.finish(root)
bw = Mesh('BOOTH_BACK_WAINS', m_maroon); bw.rbox(bo['x0'], bo['x1'], 0, WAIN, bo['z0'] + 0.0, bo['z0'] + 0.03, r=0.004, seg=1); bw.finish(root)
bd = Mesh('BOOTH_DOOR', m_wood); dx = (bo['x0'] + bo['x1']) / 2; bd.rbox(dx - 0.45, dx + 0.45, 0, 2.05, bo['z0'] + 0.0, bo['z0'] + 0.05, r=0.01, seg=2); bd.finish(root)
Mesh('BOOTH_DOOR_KNOB', m_brass).sphere((dx + 0.33, 1.0, bo['z0'] + 0.08), 0.03).finish(root)
Mesh('BOOTH_TOP', m_beam).rbox(bo['x0'], bo['x1'], 3.2, 3.3, bo['z0'] - 0.14, Z1, r=0.02, seg=1).finish(root)

# ---------------- 左牆：弧形的爆米花櫃檯 ----------------
cc = LAY['concession']
cx, cz0, cz1, depth = cc['x'], cc['z0'], cc['z1'], cc['depth']
def arc_pts(n=28):   # 櫃檯前緣：z0→z1，中段往大廳凸出（參考圖是一條弧）
    return [(cx + depth + 0.35 * math.sin(math.pi * t), cz0 + (cz1 - cz0) * t) for t in [i / n for i in range(n + 1)]]
pts = arc_pts()
front = Mesh('CONC_FRONT', IM['slats']); top = Mesh('CONC_TOP', m_top); body = Mesh('CONC_BODY', m_maroon); kick = Mesh('CONC_KICK', m_iron)
for (xa, za), (xb, zb) in zip(pts, pts[1:]):
    front.quad([(xa, 0.12, za), (xb, 0.12, zb), (xb, 1.0, zb), (xa, 1.0, za)])
    top.box(min(X0 + 0.1, xa), max(xa, xb) + 0.06, 1.0, 1.06, min(za, zb), max(za, zb))
    kick.quad([(xa - 0.04, 0.0, za), (xb - 0.04, 0.0, zb), (xb - 0.04, 0.12, zb), (xa - 0.04, 0.12, za)])
body.box(X0, cx + depth - 0.02, 0.0, 1.0, cz0, cz1)
front.finish(root); top.finish(root); body.finish(root); kick.finish(root)
# 櫃檯上方的弧形燈帶（soffit）＋「爆米花」燈箱
sof = Mesh('CONC_SOFFIT', m_maroon); band = Mesh('CONC_LIGHTBAND', m_warm)
for (xa, za), (xb, zb) in zip(pts, pts[1:]):
    sof.box(X0, max(xa, xb) + 0.05, 2.75, 3.05, min(za, zb), max(za, zb)); band.quad([(xa + 0.06, 2.75, za), (xb + 0.06, 2.75, zb), (xb + 0.06, 2.88, zb), (xa + 0.06, 2.88, za)])
sof.finish(root); band.finish(root)
pbx, pbz = cx + depth + 0.2, cz0 + 1.2
uvquad('POPCORN_LIGHTBOX', (pbx, 2.25, pbz + 0.9), (pbx, 2.25, pbz - 0.9), (pbx, 2.7, pbz - 0.9), (pbx, 2.7, pbz + 0.9), IM['popbox'])
Mesh('POPCORN_LIGHTBOX_FRAME', m_brass).rbox(pbx - 0.12, pbx - 0.01, 2.22, 2.73, pbz - 0.93, pbz + 0.93, r=0.01, seg=1).finish(root)
# 黑板價目表（掛在左牆）
mz = cz0 + 3.6
uvquad('MENU_BOARD', (X0 + 0.06, 1.65, mz + 0.7), (X0 + 0.06, 1.65, mz - 0.7), (X0 + 0.06, 2.6, mz - 0.7), (X0 + 0.06, 2.6, mz + 0.7), IM['menu'])
# 爆米花機
px, pz = cx + depth - 0.45, cz0 + 1.2
pm = Mesh('POPMACHINE_FRAME', m_steel)
pm.rbox(px - 0.4, px + 0.4, 1.06, 1.3, pz - 0.3, pz + 0.3, r=0.02, seg=2)
for sx in (-1, 1):
    for sz in (-1, 1): pm.box(px + sx * 0.38 - 0.015, px + sx * 0.38 + 0.015, 1.3, 2.05, pz + sz * 0.28 - 0.015, pz + sz * 0.28 + 0.015)
pm.rbox(px - 0.41, px + 0.41, 2.05, 2.15, pz - 0.31, pz + 0.31, r=0.02, seg=2); pm.cyl((px, 1.82, pz), (px, 2.0, pz), 0.13, seg=18); pm.finish(root)
Mesh('POPMACHINE_GLASS', m_glass).box(px - 0.375, px + 0.375, 1.3, 2.05, pz - 0.275, pz + 0.275).finish(root, props={'glass': 1})
Mesh('POPMACHINE_LAMP', m_warm).box(px - 0.3, px + 0.3, 2.02, 2.04, pz - 0.22, pz + 0.22).finish(root)
props = KK.RCMesh('CONC_PROPS', m_vc, RV, tm); rng = random.Random(7)
props.crbox(px - 0.36, px + 0.36, 1.3, 1.52, pz - 0.26, pz + 0.26, '#eccf86', r=0.04, seg=2)   # v5：機器裡滿到一半的爆米花（底下一整塊）
for _ in range(320):   # 上面一顆一顆（v5：少一點、面數低一點，三角形省給別的）
    x = px + rng.uniform(-0.34, 0.34); z = pz + rng.uniform(-0.24, 0.24); y = 1.5 + abs(rng.gauss(0, 0.07)) * (1.4 - abs(x - px) * 2)
    props.ell((x, y, z), 0.024, 0.02, 0.022, seg=5, rings=3)
props.paint(list(props.bm.faces), '#f4dfa0')
# 倒角（bevel）會釋放面、之後新加的面可能佔進前面的位置，所以用集合比對新面、不用 list[n:]（v3 飲料櫃側面變綠就是這個）
n0 = set(props.bm.faces)
_cr = random.Random(616)
for i in range(5):   # 紅白條紋紙桶疊（v7，LAWWW2-C P2：原本 6×3 個貼在一起變一整塊紅）→ 五疊分開、高低不同（3～7 個套在一起），中間留空、有一個單獨放
    bx_, bz_ = cx + depth - 0.3 + _cr.uniform(-0.03, 0.03), cz0 + 2.0 + i * 0.2 + _cr.uniform(-0.02, 0.02)
    for j in range(_cr.randint(3, 7) if i != 3 else 1):
        props.add_bm(L.lathe([(0.0, 0.0), (0.055, 0.0), (0.075, 0.15), (0.08, 0.155), (0.072, 0.155), (0.05, 0.005), (0.0, 0.005)], seg=14), Matrix.Translation(g2b(bx_, 1.06 + j * 0.028, bz_)))
props.paint([f for f in props.bm.faces if f not in n0], '#d63a34'); n0 = set(props.bm.faces)
K.ph_put('CashRegister_01', cx + depth - 0.4, 1.06, cz0 + 3.175, math.pi / 2, height=0.3, decimate=0.1)   # 收銀機（v6：Poly Haven）
props.add_bm(L.lathe([(0.0, 0.0), (0.1, 0.0), (0.12, 0.08), (0.12, 0.26), (0.07, 0.3), (0.0, 0.3)], seg=16), Matrix.Translation(g2b(cx + depth - 0.4, 1.06, cz0 + 3.7)))   # 糖果罐
props.paint([f for f in props.bm.faces if f not in n0], '#e7a7c0'); n0 = set(props.bm.faces)
props.crbox(X0 + 0.1, X0 + 0.75, 0.0, 0.3, cz0 + 4.3, cz0 + 5.1, '#b4a68c', r=0.03); props.crbox(X0 + 0.1, X0 + 0.75, 1.9, 2.05, cz0 + 4.3, cz0 + 5.1, '#b4a68c', r=0.03)   # 飲料櫃（中間空的、放瓶子）
props.crbox(X0 + 0.1, X0 + 0.16, 0.3, 1.9, cz0 + 4.3, cz0 + 5.1, '#c8b89a', r=0.01); props.crbox(X0 + 0.1, X0 + 0.75, 0.3, 1.9, cz0 + 4.3, cz0 + 4.34, '#b4a68c', r=0.01); props.crbox(X0 + 0.1, X0 + 0.75, 0.3, 1.9, cz0 + 5.06, cz0 + 5.1, '#b4a68c', r=0.01)
for row in range(4):   # 一層一層的玻璃瓶、易開罐（旋轉體，顏色照參考圖：綠、橘、紅、白、藍）
    for k in range(5):
        n1 = set(props.bm.faces); bx_, by_, bz_ = X0 + 0.62, 0.36 + row * 0.38, cz0 + 4.43 + k * 0.145
        prof = [(0.0, 0.0), (0.035, 0.0), (0.035, 0.16), (0.014, 0.22), (0.012, 0.27), (0.0, 0.27)] if (k + row) % 2 == 0 else [(0.0, 0.0), (0.033, 0.0), (0.033, 0.12), (0.028, 0.125), (0.0, 0.125)]
        sc_ = 1.0 + 0.08 * (((k * 7 + row * 3) % 5) - 2) / 2   # v7：每瓶高矮差一點
        props.add_bm(L.lathe([(r_, h_ * sc_) for r_, h_ in prof], seg=10), Matrix.Translation(g2b(bx_ + 0.012 * ((k + row) % 3 - 1), by_, bz_)))
        props.paint([f for f in props.bm.faces if f not in n1], ['#3c8a4a', '#d8a030', '#c84030', '#e8e0c8', '#3a6fb0'][(k + row) % 5])
    props.crbox(X0 + 0.12, X0 + 0.74, 0.33 + row * 0.38, 0.35 + row * 0.38, cz0 + 4.34, cz0 + 5.06, '#d8dcde', r=0.003)   # 層板
n0 = set(props.bm.faces)
props.cbox(X0 + 0.02, X0 + 0.1, 2.15, 2.6, cz0 + 2.4, cz0 + 2.5, '#3a3a3a')                                                 # 牆上電風扇的座
# v5：參考圖櫃檯後面的層架（鐵罐、紙箱）、吸管杯、餐巾紙、小立牌
for y in (1.62, 2.12): props.crbox(X0 + 0.02, X0 + 0.36, y - 0.025, y, cz0 + 0.3, cz0 + 3.4, '#5a3a24', r=0.006, seg=1)
for k in range(9):
    n1 = set(props.bm.faces); zz = cz0 + 0.45 + k * 0.33; yy = 1.62 if k % 2 else 2.12
    if k % 3 == 2: props.crbox(X0 + 0.05, X0 + 0.33, yy, yy + 0.24, zz - 0.13, zz + 0.13, '#b08a5a', r=0.006, seg=1)   # 紙箱
    else:
        props.add_bm(L.lathe([(0.0, 0.0), (0.09, 0.0), (0.09, 0.2), (0.085, 0.21), (0.0, 0.21)], seg=12), Matrix.Translation(g2b(X0 + 0.18, yy, zz)))
        props.paint([f for f in props.bm.faces if f not in n1], ['#a8a8a0', '#c4b080', '#8a8a86'][k % 3])          # 鐵罐
n1 = set(props.bm.faces)
props.add_bm(L.lathe([(0.0, 0.0), (0.045, 0.0), (0.05, 0.14), (0.0, 0.14)], seg=10), Matrix.Translation(g2b(cx + depth - 0.35, 1.06, cz0 + 2.75)))
props.paint([f for f in props.bm.faces if f not in n1], '#e8e4da')
for k in range(14):   # 吸管
    a_ = k * 2.4; r_ = 0.03 * ((k % 4) / 4 + 0.2)
    n1 = set(props.bm.faces); props.cyl((cx + depth - 0.35 + r_ * math.cos(a_), 1.1, cz0 + 2.75 + r_ * math.sin(a_)), (cx + depth - 0.35 + r_ * math.cos(a_) * 1.6, 1.36, cz0 + 2.75 + r_ * math.sin(a_) * 1.6), 0.004, seg=4)
    props.paint([f for f in props.bm.faces if f not in n1], ['#f0ece4', '#d84a3a'][k % 2])
props.crbox(cx + depth - 0.25, cx + depth - 0.1, 1.06, 1.2, cz0 + 3.45, cz0 + 3.62, '#f2f0ea', r=0.01, seg=1)   # 餐巾紙
props.crbox(cx + depth - 0.12, cx + depth - 0.1, 1.06, 1.3, cz0 + 3.85, cz0 + 4.05, '#d8403a', r=0.004, seg=1)  # 小立牌
props.finish(root, smooth=True)
Mesh('FRIDGE_GLASS', m_glass).box(X0 + 0.76, X0 + 0.77, 0.15, 1.9, cz0 + 4.32, cz0 + 5.08).finish(root, props={'glass': 1})
Mesh('FRIDGE_LIGHT', m_white).box(X0 + 0.12, X0 + 0.7, 1.92, 1.95, cz0 + 4.35, cz0 + 5.05).finish(root)
fan = Mesh('WALL_FAN', m_iron); fz = cz0 + 2.45
fan.cyl((X0 + 0.1, 2.38, fz), (X0 + 0.32, 2.38, fz), 0.03); fan.add_bm(L.lathe([(0.0, 0.0), (0.2, 0.0), (0.22, 0.04), (0.0, 0.08)], seg=24), Matrix.Translation(g2b(X0 + 0.32, 2.38, fz)) @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
fan.finish(root)
gn = Mesh('GOOSENECK_COUNTER', m_iron); gs = Mesh('GOOSENECK_COUNTER_SHADE', m_brass)
for z in (cz0 + 1.2, cz0 + 3.2):
    gn.cyl((cx + depth - 0.2, 2.75, z), (cx + depth - 0.2, 2.2, z), 0.01)
    gs.add_bm(L.lathe([(0.02, 0.0), (0.2, -0.16), (0.0, -0.16)], seg=18), Matrix.Translation(g2b(cx + depth - 0.2, 2.2, z)))
gn.finish(root); gs.finish(root, smooth=True)

# ---------------- 後牆：大招牌、壁燈、兩組門、黑板架 ----------------
sg = LAY['sign']
uvquad('BIG_SIGN', (sg['x'] - sg['w'] / 2, sg['y'], Z0 + 0.08), (sg['x'] + sg['w'] / 2, sg['y'], Z0 + 0.08), (sg['x'] + sg['w'] / 2, sg['y'] + sg['h'], Z0 + 0.08), (sg['x'] - sg['w'] / 2, sg['y'] + sg['h'], Z0 + 0.08), IM['sign'])
Mesh('BIG_SIGN_FRAME', m_wood).rbox(sg['x'] - sg['w'] / 2 - 0.06, sg['x'] + sg['w'] / 2 + 0.06, sg['y'] - 0.06, sg['y'] + sg['h'] + 0.06, Z0, Z0 + 0.07, r=0.02, seg=2).finish(root)
sc_ = Mesh('SCONCE_BACK', m_brass); sl_ = Mesh('SCONCE_BACK_GLASS', m_warm)
for x in (sg['x'] - sg['w'] / 2 - 0.7, sg['x'] + sg['w'] / 2 + 0.7):
    sc_.rbox(x - 0.09, x + 0.09, 2.6, 3.25, Z0, Z0 + 0.04, r=0.01, seg=1)
    for k in range(5): sl_.rbox(x - 0.07, x + 0.07, 2.68 + k * 0.11, 2.76 + k * 0.11, Z0 + 0.04, Z0 + 0.14, r=0.02, seg=2)   # 一層一層的燈罩（Art Deco）
sc_.finish(root); sl_.finish(root, smooth=True)
for nm, dd, open_ in (('L', DL, False), ('R', DR, True)):
    x0, x1 = dd['x'] - dd['w'] / 2, dd['x'] + dd['w'] / 2
    f = Mesh(f'HALLDOOR_{nm}_FRAME', m_wood); f.rbox(x0 - 0.1, x0, 0, DH + 0.1, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1); f.rbox(x1, x1 + 0.1, 0, DH + 0.1, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1); f.rbox(x0 - 0.1, x1 + 0.1, DH, DH + 0.1, Z0 - 0.02, Z0 + 0.08, r=0.01, seg=1); f.finish(root)
    leaf = Mesh(f'HALLDOOR_{nm}_LEAVES', m_wood); kickp = Mesh(f'HALLDOOR_{nm}_KICK', m_brass); win = Mesh(f'HALLDOOR_{nm}_WIN', m_glass)
    hw = dd['w'] / 2
    for side in (-1, 1):
        hinge = x0 if side < 0 else x1
        if open_:   # 開著：門扇轉進影廳那一側 75°
            a = math.radians(75); ex = hinge - side * hw * math.cos(a); ez = Z0 - hw * math.sin(a)
            mat = Matrix.Translation(g2b(hinge, 0, Z0)) @ Matrix.Rotation(side * a, 4, 'Z')
            bmL = L.rbox_bm(hw, DH - 0.02, 0.05, 0.01, 2); leaf.add_bm(bmL, mat @ Matrix.Translation(g2b(-side * hw / 2, (DH - 0.02) / 2, -0.03))); bmL.free()
        else:
            lx0, lx1 = (x0, x0 + hw - 0.01) if side < 0 else (x1 - hw + 0.01, x1)
            leaf.rbox(lx0, lx1, 0.0, DH - 0.02, Z0 - 0.05, Z0 + 0.0, r=0.01, seg=2); kickp.box(lx0 + 0.03, lx1 - 0.03, 0.02, 0.28, Z0 + 0.0, Z0 + 0.012)
            win.box(lx0 + hw * 0.3, lx1 - hw * 0.3, 1.4, 1.85, Z0 + 0.0, Z0 + 0.01)
            Mesh(f'HALLDOOR_{nm}_PULL{side}', m_brass).cyl((lx1 - 0.1 if side < 0 else lx0 + 0.1, 0.85, Z0 + 0.05), (lx1 - 0.1 if side < 0 else lx0 + 0.1, 1.3, Z0 + 0.05), 0.014, seg=10).finish(root)
    leaf.finish(root); kickp.finish(root)
    if not win.empty(): win.finish(root, props={'glass': 1})
    else: win.finish(root)
    if open_:   # 門後：影廳一角（深一點的暗走道＋2D 卡片）
        hv = Mesh('HALL_PEEK_BOX', L.flat('ny_halldark', '#1c1214', rough=0.9)); hv.box(x0, x1, 0, DH, Z0 - 2.4, Z0 - 2.38); hv.box(x0 - 0.02, x0, 0, DH, Z0 - 2.4, Z0); hv.box(x1, x1 + 0.02, 0, DH, Z0 - 2.4, Z0); hv.box(x0, x1, DH - 0.01, DH, Z0 - 2.4, Z0); hv.finish(root)
        uvquad('HALL_PEEK_CARD', (x0, 0.0, Z0 - 2.37), (x1, 0.0, Z0 - 2.37), (x1, DH, Z0 - 2.37), (x0, DH, Z0 - 2.37), IM['hall'])
        Mesh('HALL_PEEK_FLOOR', m_carpet, tile=1.6).box(x0, x1, -0.05, 0.0, Z0 - 2.4, Z0).finish(root)
cs = LAY['chalk']
stand = Mesh('CHALK_STAND', m_wood); stand.rbox(cs['x'] - 0.42, cs['x'] + 0.42, 0.95, 1.85, cs['z'] - 0.04, cs['z'] + 0.0, r=0.01, seg=1)
for sx in (-1, 1): stand.box(cs['x'] + sx * 0.4 - 0.02, cs['x'] + sx * 0.4 + 0.02, 0.0, 1.9, cs['z'] - 0.03, cs['z'] + 0.01)
stand.finish(root)
uvquad('CHALK_FACE', (cs['x'] - 0.38, 1.0, cs['z'] + 0.005), (cs['x'] + 0.38, 1.0, cs['z'] + 0.005), (cs['x'] + 0.38, 1.8, cs['z'] + 0.005), (cs['x'] - 0.38, 1.8, cs['z'] + 0.005), IM['chalk'])

# ---------------- 右牆：海報、劇照板、鵝頸燈、長椅、垃圾桶 ----------------
pr = LAY['posters']; xw = X1 - 0.05
for i, (k, t) in enumerate(posters):
    z = pr['z0'] + i * pr['step']
    Mesh(f'POSTER_FRAME_{i}', m_wood).rbox(xw - 0.04, xw, 1.25, 2.85, z - 0.58, z + 0.58, r=0.01, seg=1).finish(root)
    uvquad(f'POSTER_{i}', (xw - 0.045, 1.3, z - 0.53), (xw - 0.045, 1.3, z + 0.53), (xw - 0.045, 2.8, z + 0.53), (xw - 0.045, 2.8, z - 0.53), IM['poster_' + k])   # 站在大廳面向東：左手是 −z
pb = LAY['photoBoard']
uvquad('PHOTO_BOARD', (xw - 0.045, 1.5, pb['z'] - 0.4), (xw - 0.045, 1.5, pb['z'] + 0.4), (xw - 0.045, 2.6, pb['z'] + 0.4), (xw - 0.045, 2.6, pb['z'] - 0.4), IM['photos'])
Mesh('PHOTO_BOARD_FRAME', m_wood).rbox(xw - 0.04, xw, 1.46, 2.64, pb['z'] - 0.44, pb['z'] + 0.44, r=0.01, seg=1).finish(root)
gn2 = Mesh('GOOSENECK_POSTER', m_iron); gs2 = Mesh('GOOSENECK_POSTER_SHADE', m_brass)
for i in range(len(posters) + 1):
    z = pr['z0'] + i * pr['step'] if i < len(posters) else pb['z']
    pts_ = [(xw, 3.2, z), (xw - 0.15, 3.35, z), (xw - 0.35, 3.3, z), (xw - 0.45, 3.12, z)]
    for a, b in zip(pts_, pts_[1:]): gn2.cyl(a, b, 0.012, seg=8)
    gs2.add_bm(L.lathe([(0.02, 0.0), (0.13, -0.12), (0.0, -0.12)], seg=16), Matrix.Translation(g2b(xw - 0.45, 3.12, z)))
gn2.finish(root); gs2.finish(root, smooth=True)
bs = Mesh('BENCH_SLATS', m_wood); bl = Mesh('BENCH_IRON', m_iron)
for bb in LAY['benches']:
    z0, z1 = bb['z0'], bb['z1']; bx0 = X1 - 1.05
    for k in range(4): bs.rbox(bx0 + 0.02 + k * 0.12, bx0 + 0.12 + k * 0.12, 0.43, 0.47, z0, z1, r=0.012, seg=2)               # 坐面四條
    for k in range(3): bs.rbox(X1 - 0.5, X1 - 0.46, 0.6 + k * 0.14, 0.7 + k * 0.14, z0, z1, r=0.012, seg=2)                       # 靠背三條（往後仰）
    for zz in (z0 + 0.15, z1 - 0.15):
        bl.box(bx0 + 0.05, bx0 + 0.09, 0, 0.43, zz - 0.02, zz + 0.02); bl.box(X1 - 0.52, X1 - 0.48, 0, 1.0, zz - 0.02, zz + 0.02); bl.box(bx0 + 0.05, X1 - 0.48, 0.4, 0.43, zz - 0.02, zz + 0.02)
bs.finish(root); bl.finish(root)
for (x, z) in LAY['bins']: K.ph_put('metal_trash_can', x, 0.0, z, 0.3, height=0.72, decimate=0.2, part=0, recolor=('#6a5a3e', '#d8c49a'))   # v6：米色漆的舊鐵桶（Poly Haven，照原本的米色重新上色）

# ---------------- 天花板的 Art Deco 吊燈（乳白玻璃、層層燈罩、銅吊桿）----------------
pend = Mesh('PENDANT_ROD', m_brass); pg = Mesh('PENDANT_GLASS', m_warm)
for (x, z) in LAY['pendants']:
    pend.cyl((x, H - 0.34, z), (x, 3.5, z), 0.012, seg=8); pend.cyl((x, 3.5, z), (x, 3.45, z), 0.06, seg=16)
    pg.add_bm(L.lathe([(0.0, 0.0), (0.24, 0.0), (0.26, 0.05), (0.2, 0.09), (0.22, 0.13), (0.15, 0.18), (0.17, 0.22), (0.08, 0.26), (0.0, 0.27)], seg=24), Matrix.Translation(g2b(x, 3.18, z)))
pend.finish(root); pg.finish(root, smooth=True)

# ---------------- 進門右手邊：舊放映機展示＋兩張紅色座椅（外觀圖看得到）----------------
pj = LAY['projector']
# v7（LAWWW2-C P2：原本是一整塊純黑的立式方箱）：深色木頭展示台＋黃銅收邊＋Poly Haven 掃描的舊放映機（filmstrip_projector_8mm）放在上面；佔的地方和原本一樣
pro = Mesh('PROJECTOR', m_wood); pro.rbox(pj['x'] - 0.25, pj['x'] + 0.25, 0.0, 0.95, pj['z'] - 0.3, pj['z'] + 0.3, r=0.02, seg=2); pro.finish(root, smooth=True)
Mesh('PROJECTOR_TRIM', m_brass).rbox(pj['x'] - 0.27, pj['x'] + 0.27, 0.95, 0.98, pj['z'] - 0.32, pj['z'] + 0.32, r=0.01, seg=1).finish(root)
K.ph_put('filmstrip_projector_8mm', pj['x'], 0.98, pj['z'], math.pi, height=0.62, decimate=0.2)
seats = Mesh('RED_CHAIRS', m_maroon); seatl = Mesh('RED_CHAIRS_LEGS', m_iron)
for k in range(2):
    z = pj['z'] - 1.0 - k * 0.6
    seats.rbox(X1 - 0.75, X1 - 0.25, 0.42, 0.52, z - 0.25, z + 0.25, r=0.05, seg=3); seats.rbox(X1 - 0.3, X1 - 0.18, 0.5, 1.0, z - 0.25, z + 0.25, r=0.05, seg=3)
    seatl.box(X1 - 0.6, X1 - 0.3, 0, 0.42, z - 0.03, z + 0.03)
seats.finish(root, smooth=True); seatl.finish(root)

# ---------------- v5b（LAWWW2 11-04 選 B：配置不縮，近景加東西）----------------
EXTRA = []
# 1)「本日放映」立牌（大廳右前方的空地毯上、面向入口；中間走道剩 x −1.77～1.8）：黑色鐵架＋一張虛構的電影海報
def standee_tex(im, d):
    w, h = im.size; r = random.Random(11)
    for y in range(h): t = y / h; d.line([(0, y), (w, y)], fill=(int(40 + 140 * t), int(60 + 70 * t), int(110 - 40 * t)))   # 黃昏的天空
    d.rectangle([0, int(h * 0.62), w, h], fill=(60, 52, 48)); d.rectangle([int(w * 0.1), int(h * 0.5), int(w * 0.9), int(h * 0.62)], fill=(150, 60, 40))   # 月台、電車
    for k in range(5): d.rectangle([int(w * (0.14 + k * 0.15)), int(h * 0.53), int(w * (0.24 + k * 0.15)), int(h * 0.58)], fill=(240, 210, 140))
    d.ellipse([int(w * 0.38), int(h * 0.3), int(w * 0.62), int(h * 0.5)], fill=(60, 40, 36)); d.rectangle([int(w * 0.36), int(h * 0.44), int(w * 0.64), int(h * 0.62)], fill=(230, 226, 214))   # 背影
    d.rectangle([0, 0, w, int(h * 0.2)], fill=(248, 240, 224)); d.text((int(w * 0.08), int(h * 0.02)), '本日放映', font=font(int(w * 0.16)), fill=(150, 30, 28))
    d.rectangle([0, int(h * 0.8), w, h], fill=(30, 24, 22)); d.text((int(w * 0.08), int(h * 0.82)), '晚風月台', font=font(int(w * 0.16)), fill=(250, 236, 200))
    d.text((int(w * 0.1), int(h * 0.93)), '13:00　15:10', font=font(int(w * 0.07)), fill=(230, 214, 170))
P['standee'] = tex('standee.png', (420, 640), standee_tex)
# 材質 ≤ 12：立牌和黑板架共用一張圖（左邊黑板 512 × 444、右邊立牌 336 × 512）
_cb = Image.new('RGB', (848, 512), (30, 34, 32)); _cb.paste(Image.open(P['chalk']).convert('RGB').resize((512, 444)), (0, 0)); _cb.paste(Image.open(P['standee']).convert('RGB').resize((336, 512), Image.LANCZOS), (512, 0))
_cb.save(P['chalk']); IM['chalk'].node_tree.nodes['Image Texture'].image.reload(); IM['standee'] = IM['chalk']
def _remap_uv(obname, u0, u1, v0, v1):
    me = bpy.data.objects[obname].data
    for d_ in me.uv_layers.active.data: d_.uv = (u0 + d_.uv[0] * (u1 - u0), v0 + d_.uv[1] * (v1 - v0))
_remap_uv('CHALK_FACE', 0.0, 512 / 848, 1 - 444 / 512, 1.0)
sx_, sz_ = 2.2, 0.0
stn = Mesh('STANDEE_FRAME', m_wood)   # v7（LAWWW2-C P2：從店裡看是一塊純黑的立式方箱）：框改深色木頭，背面也貼海報
stn.rbox(sx_ - 0.36, sx_ + 0.36, 0.55, 2.0, sz_ - 0.03, sz_ + 0.0, r=0.01, seg=1)
for dx in (-0.3, 0.3): stn.box(sx_ + dx - 0.015, sx_ + dx + 0.015, 0.0, 0.6, sz_ - 0.02, sz_ + 0.0); stn.box(sx_ + dx - 0.02, sx_ + dx + 0.02, 0.0, 0.02, sz_ - 0.25, sz_ + 0.2)
stn.finish(root)
uvquad('STANDEE_FACE', (sx_ - 0.32, 0.6, sz_ + 0.003), (sx_ + 0.32, 0.6, sz_ + 0.003), (sx_ + 0.32, 1.96, sz_ + 0.003), (sx_ - 0.32, 1.96, sz_ + 0.003), IM['standee'])   # 面向入口（+z）
_remap_uv('STANDEE_FACE', 512 / 848, 1.0, 0.0, 1.0)
uvquad('STANDEE_FACE_BACK', (sx_ + 0.32, 0.6, sz_ - 0.033), (sx_ - 0.32, 0.6, sz_ - 0.033), (sx_ - 0.32, 1.96, sz_ - 0.033), (sx_ + 0.32, 1.96, sz_ - 0.033), IM['standee'])   # v7：背面（朝店裡）也是同一張海報
_remap_uv('STANDEE_FACE_BACK', 512 / 848, 1.0, 0.0, 1.0)
EXTRA.append([sx_, sz_ - 0.02, 0.8, 0.5, '本日放映立牌'])
# 2) 排隊的地方：兩支紅龍柱（銅柱、深紅絨繩）——櫃檯前排隊那一條（x −3.2～−2.0）和中間走道中間；售票窗口在外觀那一面（LAWWW2），大廳裡排隊的是爆米花櫃檯
qx, qz0, qz1 = -1.95, -1.4, 0.6
rp = Mesh('QUEUE_POSTS', m_brass); rope = Mesh('QUEUE_ROPE', L.flat('ny_rope', '#7a1018', rough=0.8))
for z in (qz0, qz1):
    rp.add_bm(L.lathe([(0.0, 0.0), (0.16, 0.0), (0.17, 0.02), (0.06, 0.05), (0.025, 0.07), (0.025, 0.92), (0.045, 0.95), (0.05, 0.99), (0.0, 1.01)], seg=16), Matrix.Translation(g2b(qx, 0.0, z)))
n = 14
for k in range(n):   # 絨繩：中間垂下來的懸鏈線
    t0, t1 = k / n, (k + 1) / n; y0_ = 0.88 - 0.22 * math.sin(math.pi * t0); y1_ = 0.88 - 0.22 * math.sin(math.pi * t1)
    rope.cyl((qx, y0_, qz0 + (qz1 - qz0) * t0), (qx, y1_, qz0 + (qz1 - qz0) * t1), 0.022, seg=8)
rp.finish(root, smooth=True); rope.finish(root, smooth=True)
EXTRA.append([qx, (qz0 + qz1) / 2, 0.36, qz1 - qz0 + 0.36, '紅龍柱＋絨繩（櫃檯排隊那一條和中間走道中間；走道剩 x −1.77～3.3）'])
# 3) 牆邊放傳單的鐵架（右牆、劇照板和入口之間，面向大廳）
fz_, fx_ = 1.25, X1 - 0.02
fr_ = Mesh('FLYER_RACK', m_iron); fl_ = CMesh('FLYERS', L.vc_material('ny_flyer_vc', rough=0.6))
for dz in (-0.3, 0.3): fr_.box(fx_ - 0.12, fx_ - 0.1, 0.0, 1.45, fz_ + dz - 0.012, fz_ + dz + 0.012)
for k in range(4):
    y = 0.45 + k * 0.28; x_ = fx_ - 0.1 - 0.06 * (3 - k)
    fr_.box(x_ - 0.12, x_, y, y + 0.012, fz_ - 0.3, fz_ + 0.3); fr_.box(x_ - 0.125, x_ - 0.115, y + 0.012, y + 0.12, fz_ - 0.3, fz_ + 0.3)
    for j_ in range(4):
        z_ = fz_ - 0.27 + j_ * 0.14; c_ = ['#e8d8a8', '#c8443a', '#3a6a9a', '#f0ece0', '#6a8a4a', '#d89a3a'][(k * 4 + j_) % 6]
        fl_.cbox(x_ - 0.1, x_ - 0.085, y + 0.012, y + 0.22, z_, z_ + 0.12, c_)
fr_.box(fx_ - 0.12, fx_ - 0.1, 1.43, 1.45, fz_ - 0.3, fz_ + 0.3); fr_.finish(root); fl_.finish(root)
EXTRA.append([X1 - 0.2, fz_, 0.4, 0.7, '放傳單的鐵架（右牆）'])
root['extraBlocks'] = json.dumps(EXTRA, ensure_ascii=False)

# ---------------- 減量（SCENE_RULES 第 10 節：材質 ≤ 12）----------------
for m_ in TM.values(): m_.finish(root, uv=True, smooth=True)
K.remove_protos()
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = L.vc_material('ny_vc_matte', rough=0.62); vc_g = L.vc_material('ny_vc_gloss', rough=0.35); vc_x = L.vc_metal('ny_vc_metal', rough=0.35, metal=0.4)
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'ny_glass', 'ny_warm', 'ny_whiteglow', 'ny_ceiling'})
grp['ny_props_vc'] = vc_m; grp['ny_mat_vc'] = vc_m; grp['ny_flyer_vc'] = vc_m
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, 'ny3_atlas.png'), 'ny_atlas', max_tris=6000, max_rep=1, cell=512, rough=0.6)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
L.export(OUT)
print('CC0_USED', K.used())
print('OK', OUT, B.stats())
