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
配置只寫在 src/data/nanyang_layout.js（Blender 和遊戲共用）。座標：房間中心在原點，x 東、y 上、z 南；店門在 +z。
"""
import ast, json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

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


P = {k: tex(f'{k}.png', s, f) for k, s, f in (('sign', (1024, 300), big_sign), ('menu', (560, 420), menu_board), ('chalk', (600, 520), chalk_stand),
                                               ('popbox', (560, 180), popcorn_box), ('slats', (512, 256), slats), ('photos', (340, 460), photo_board),
                                               ('hall', (512, 512), dark_hall))}
posters = [('sea', '夏日的風'), ('bike', '河邊的約定'), ('train', '小站的…')]
for k, t in posters: P['poster_' + k] = titled_poster(k, t, os.path.join(TMP, f'poster3_{k}.png'))

# ---------------- 材質（≤12，最後 vc_consolidate／atlas_small 合併）----------------
m_carpet = L.pbr('ny_carpet', 'dirty_carpet', tile=1.6, target='#8c1d24', normal=0.4, maps=('diff', 'nor'), rough_value=0.95)
m_wall = L.pbr('ny_plaster', 'painted_plaster_wall', tile=2.5, target='#eadbc0', normal=0.3, maps=('diff', 'nor'))
m_top = L.pbr('ny_counter', 'granite_tile_03', tile=0.8, target='#d9d0c2', normal=0.3, maps=('diff', 'nor'), rough_value=0.3)
m_wood = L.pbr('ny_wood', 'wood_table_001', tile=1.0, target='#7a4a2c', normal=0.3, maps=('diff', 'nor'), rough_value=0.5)   # 門、長椅木條（不是地板）
m_maroon = L.flat('ny_maroon', '#7c1e24', rough=0.55)
m_cream = L.flat('ny_cream', '#e8dcc6', rough=0.75)
m_beam = L.flat('ny_beam', '#d9c9ad', rough=0.8)
m_brass = L.flat('ny_brass', '#b58a43', rough=0.32, metal=0.42)
m_iron = L.flat('ny_iron', '#2b2a2a', rough=0.5, metal=0.35)
m_steel = L.flat('ny_steel', '#b8bcc0', rough=0.3, metal=0.4)
m_glass = L.flat('ny_glass', '#d8e6ea', rough=0.05, alpha=0.25)
m_warm = glowmat('ny_warm', '#ffe1ad', 4.0)
m_white = glowmat('ny_whiteglow', '#f6f2e8', 1.6)
m_vc = L.vc_material('ny_props_vc', rough=0.6)
IM = {k: img_mat('ny_' + k, p, rough=0.6) for k, p in P.items()}

# ---------------- 地板、天花板、樑 ----------------
Mesh('FLOOR', m_carpet, tile=1.6).box(X0, X1, -0.05, 0.0, Z0, Z1).finish(root)
Mesh('CEILING', m_cream).box(X0, X1, H, H + 0.04, Z0, Z1).finish(root, props={'ceiling': 1})
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
Mesh('DOORMAT', L.flat('ny_mat', '#5c2a24', rough=0.95)).rbox(ex0 + 0.1, ex1 - 0.1, 0.0, 0.015, Z1 - 1.3, Z1 - 0.1, r=0.006, seg=1).finish(root)

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
props = CMesh('CONC_PROPS', m_vc); rng = random.Random(7)
for _ in range(520):   # 爆米花堆（機器裡）
    x = px + rng.uniform(-0.34, 0.34); z = pz + rng.uniform(-0.24, 0.24); y = 1.31 + abs(rng.gauss(0, 0.1)) * (1.4 - abs(x - px) * 2)
    props.ell((x, y, z), 0.022, 0.018, 0.02, seg=6, rings=4)
props.paint(list(props.bm.faces), '#f4dfa0')
# 倒角（bevel）會釋放面、之後新加的面可能佔進前面的位置，所以用集合比對新面、不用 list[n:]（v3 飲料櫃側面變綠就是這個）
n0 = set(props.bm.faces)
for i in range(6):   # 紅白條紋紙桶疊
    for j in range(3):
        bx_, bz_ = cx + depth - 0.3, cz0 + 2.0 + i * 0.16
        props.add_bm(L.lathe([(0.0, 0.0), (0.06, 0.0), (0.08, 0.17), (0.0, 0.17)], seg=12), Matrix.Translation(g2b(bx_, 1.06 + j * 0.12, bz_)))
props.paint([f for f in props.bm.faces if f not in n0], '#d63a34'); n0 = set(props.bm.faces)
props.crbox(cx + depth - 0.6, cx + depth - 0.2, 1.06, 1.32, cz0 + 3.0, cz0 + 3.35, '#2a2b2e', r=0.03)                    # 收銀機
props.add_bm(L.lathe([(0.0, 0.0), (0.1, 0.0), (0.12, 0.08), (0.12, 0.26), (0.07, 0.3), (0.0, 0.3)], seg=16), Matrix.Translation(g2b(cx + depth - 0.4, 1.06, cz0 + 3.7)))   # 糖果罐
props.paint([f for f in props.bm.faces if f not in n0], '#e7a7c0'); n0 = set(props.bm.faces)
props.crbox(X0 + 0.1, X0 + 0.75, 0.0, 0.3, cz0 + 4.3, cz0 + 5.1, '#c8ccd0', r=0.03); props.crbox(X0 + 0.1, X0 + 0.75, 1.9, 2.05, cz0 + 4.3, cz0 + 5.1, '#c8ccd0', r=0.03)   # 飲料櫃（中間空的、放瓶子）
props.crbox(X0 + 0.1, X0 + 0.16, 0.3, 1.9, cz0 + 4.3, cz0 + 5.1, '#e6e8ea', r=0.01); props.crbox(X0 + 0.1, X0 + 0.75, 0.3, 1.9, cz0 + 4.3, cz0 + 4.34, '#c8ccd0', r=0.01); props.crbox(X0 + 0.1, X0 + 0.75, 0.3, 1.9, cz0 + 5.06, cz0 + 5.1, '#c8ccd0', r=0.01)
for row in range(4):   # 一層一層的玻璃瓶、易開罐（旋轉體，顏色照參考圖：綠、橘、紅、白、藍）
    for k in range(5):
        n1 = set(props.bm.faces); bx_, by_, bz_ = X0 + 0.62, 0.36 + row * 0.38, cz0 + 4.43 + k * 0.145
        prof = [(0.0, 0.0), (0.035, 0.0), (0.035, 0.16), (0.014, 0.22), (0.012, 0.27), (0.0, 0.27)] if (k + row) % 2 == 0 else [(0.0, 0.0), (0.033, 0.0), (0.033, 0.12), (0.028, 0.125), (0.0, 0.125)]
        props.add_bm(L.lathe(prof, seg=10), Matrix.Translation(g2b(bx_, by_, bz_)))
        props.paint([f for f in props.bm.faces if f not in n1], ['#3c8a4a', '#d8a030', '#c84030', '#e8e0c8', '#3a6fb0'][(k + row) % 5])
    props.crbox(X0 + 0.12, X0 + 0.74, 0.33 + row * 0.38, 0.35 + row * 0.38, cz0 + 4.34, cz0 + 5.06, '#d8dcde', r=0.003)   # 層板
n0 = set(props.bm.faces)
props.cbox(X0 + 0.02, X0 + 0.1, 2.15, 2.6, cz0 + 2.4, cz0 + 2.5, '#3a3a3a')                                                 # 牆上電風扇的座
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
tb = Mesh('BINS', m_steel)
for (x, z) in LAY['bins']: tb.add_bm(L.lathe([(0.0, 0.0), (0.17, 0.0), (0.19, 0.65), (0.17, 0.7), (0.0, 0.72)], seg=18), Matrix.Translation(g2b(x, 0.0, z)))
tb.finish(root, smooth=True)

# ---------------- 天花板的 Art Deco 吊燈（乳白玻璃、層層燈罩、銅吊桿）----------------
pend = Mesh('PENDANT_ROD', m_brass); pg = Mesh('PENDANT_GLASS', m_warm)
for (x, z) in LAY['pendants']:
    pend.cyl((x, H - 0.34, z), (x, 3.5, z), 0.012, seg=8); pend.cyl((x, 3.5, z), (x, 3.45, z), 0.06, seg=16)
    pg.add_bm(L.lathe([(0.0, 0.0), (0.24, 0.0), (0.26, 0.05), (0.2, 0.09), (0.22, 0.13), (0.15, 0.18), (0.17, 0.22), (0.08, 0.26), (0.0, 0.27)], seg=24), Matrix.Translation(g2b(x, 3.18, z)))
pend.finish(root); pg.finish(root, smooth=True)

# ---------------- 進門右手邊：舊放映機展示＋兩張紅色座椅（外觀圖看得到）----------------
pj = LAY['projector']
pro = Mesh('PROJECTOR', m_iron); pro.rbox(pj['x'] - 0.25, pj['x'] + 0.25, 0.0, 1.0, pj['z'] - 0.3, pj['z'] + 0.3, r=0.03, seg=2); pro.rbox(pj['x'] - 0.2, pj['x'] + 0.2, 1.0, 1.4, pj['z'] - 0.35, pj['z'] + 0.25, r=0.04, seg=2)
pro.cyl((pj['x'], 1.35, pj['z'] + 0.25), (pj['x'], 1.35, pj['z'] + 0.45), 0.07, seg=16)
for dz in (-0.32, 0.18): pro.cyl((pj['x'] - 0.03, 1.85, pj['z'] + dz), (pj['x'] + 0.03, 1.85, pj['z'] + dz), 0.32, seg=28); pro.cyl((pj['x'], 1.4, pj['z'] + dz * 0.6), (pj['x'], 1.6, pj['z'] + dz), 0.02)
pro.finish(root, smooth=True)
seats = Mesh('RED_CHAIRS', m_maroon); seatl = Mesh('RED_CHAIRS_LEGS', m_iron)
for k in range(2):
    z = pj['z'] - 1.0 - k * 0.6
    seats.rbox(X1 - 0.75, X1 - 0.25, 0.42, 0.52, z - 0.25, z + 0.25, r=0.05, seg=3); seats.rbox(X1 - 0.3, X1 - 0.18, 0.5, 1.0, z - 0.25, z + 0.25, r=0.05, seg=3)
    seatl.box(X1 - 0.6, X1 - 0.3, 0, 0.42, z - 0.03, z + 0.03)
seats.finish(root, smooth=True); seatl.finish(root)

# ---------------- 減量（SCENE_RULES 第 10 節：材質 ≤ 12）----------------
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = L.vc_material('ny_vc_matte', rough=0.62); vc_g = L.vc_material('ny_vc_gloss', rough=0.35); vc_x = L.vc_metal('ny_vc_metal', rough=0.35, metal=0.4)
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'ny_glass', 'ny_warm', 'ny_whiteglow'})
grp['ny_props_vc'] = vc_m
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, 'ny3_atlas.png'), 'ny_atlas', max_tris=6000, max_rep=1, cell=512, rough=0.6)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
L.export(OUT)
print('OK', OUT, B.stats())
