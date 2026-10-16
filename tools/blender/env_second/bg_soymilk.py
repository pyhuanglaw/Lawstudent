"""BG-20 2D 背景：公館巷子裡的老豆漿店（soymilk_shop；芷若 Z5 早場散場後，週六約 12:00；AA_147：老豆漿店的桌子、豆漿，老闆不入鏡）。
LAWWW2-B 2026-10-16。Blender 5.2（bpy，無介面）＋Cycles（CPU），1920×1080，畫面上沒有人（人物用 ADV 立繪疊上去）。
道具是 AA-B 的 ART-SOY1（assets/models/env/second_ai/aa_support/soy_props.glb：前檯＋豆漿桶、燒餅爐、油條炸鍋、玻璃保溫櫃、桌椅、桌上小物、蒸籠），
店本身（牆、地、天花板、菜單、冰箱、電扇、電視、廚房門簾）在這裡用 bpy 蓋。
  /opt/blenv/bin/python tools/blender/env_second/bg_soymilk.py -- <輸出.png> [--res 1920x1080] [--samples 96]
構圖：從店門口往裡面看。右邊沿牆是前檯（豆漿桶、保溫櫃），右前景是燒餅爐和炸鍋（老店都在門口做）；左邊兩張桌子＋紅色圓凳；
中間的走道空著（對話時人物站在畫面中間，下面四分之一被對話框蓋住）；後牆是紅字菜單、冰箱、往廚房的門簾。
快中午了：外面的日光從門口照進來，店裡的日光燈開著。菜單沒有店名（D77），價錢是一般的價錢。
座標＝遊戲座標（x 東、y 上、z 南；門口在 +z），g2b 轉成 Blender。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_soy_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(2020)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '-0.35'))
try: sc.view_settings.look = opt('--look', 'AgX - Punchy')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
root = B.group('soymilk_shop')

X0, X1, ZB, ZF, H = -3.2, 3.2, -7.6, 1.6, 3.0   # 店：寬 6.4 m、深 9.2 m（門口在 z 1.6）、天花板 3.0 m


def img_mat(name, path, emit=0.0, rough=0.7):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, uv): lp[ul].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.parent = root; return ob


def area_light(name, x, y, z, w, d, power, col=(1.0, 0.95, 0.88), rot=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    if rot: ob.rotation_euler = rot
    return ob


M = {
    'floor': L.pbr('soy_floor', 'terrazzo_tiles', tile=1.4, target='#9d968a', normal=0.4, maps=('diff', 'nor', 'rough')),
    'tile': L.pbr('soy_wall_tile', 'long_white_tiles', tile=0.9, target='#d9d8cc', normal=0.5, maps=('diff', 'nor', 'rough'), rough_value=0.25),
    'plaster': L.pbr('soy_plaster', 'white_plaster_02', tile=2.0, target='#dcd0b6', normal=0.3, maps=('diff', 'nor')),
    'ceil': L.flat('soy_ceiling', '#d9d4c6', rough=0.9), 'paper_y': L.flat('soy_paper_y', '#efe2b8', rough=0.8),
    'steel': L.flat('soy_steel', '#c9ccce', rough=0.32, metal=0.4), 'steel_dk': L.flat('soy_steel_dk', '#6d7276', rough=0.4, metal=0.4),
    'wood': L.pbr('soy_wood', 'walnut_veneer', tile=0.8, target='#8a5f3c', normal=0.3, maps=('diff', 'nor'), rough_value=0.5),
    'white': L.flat('soy_white', '#f1f0ea', rough=0.4), 'black': L.flat('soy_black', '#1e2022', rough=0.35),
    'tube': L.flat('soy_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f8ff')),
    'red': L.flat('soy_red', '#c33a32', rough=0.45), 'fan_blue': L.flat('soy_fan_blue', '#8fb4c8', rough=0.4),
    'curtain': L.flat('soy_curtain', '#3e5f86', rough=0.85), 'glass': L.flat('soy_glass_d', '#9fb8c0', rough=0.05, alpha=0.25),
    'screen': L.flat('soy_tv', '#15181b', rough=0.15),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('soy_' + k, M[k])
    return _acc[k]


# ======================== 牆、地、天花板 ========================
acc('floor').quad([(X0, 0.0, ZF), (X1, 0.0, ZF), (X1, 0.0, ZB), (X0, 0.0, ZB)])
for (a, b_) in ((X0, X0), (X1, X1)):   # 左右牆：下半磁磚、上半水泥漆
    s = -1 if a < 0 else 1
    for (y0, y1, k) in ((0.0, 1.5, 'tile'), (1.5, H, 'plaster')):
        p = [(a, y0, ZF), (a, y0, ZB), (a, y1, ZB), (a, y1, ZF)]
        acc(k).quad(p if s < 0 else p[::-1])
for (y0, y1, k) in ((0.0, 1.5, 'tile'), (1.5, H, 'plaster')):   # 後牆
    acc(k).quad([(X0, y0, ZB), (X1, y0, ZB), (X1, y1, ZB), (X0, y1, ZB)])
acc('ceil').quad([(X0, H, ZB), (X1, H, ZB), (X1, H, ZF), (X0, H, ZF)])
acc('steel_dk').box(X0, X1, 0.0, 0.08, ZB, ZB + 0.012)                          # 踢腳
for x in (X0 + 0.006, X1 - 0.006): acc('steel_dk').box(min(x, x + 0.01), max(x, x + 0.01), 0.0, 0.08, ZB, ZF)
acc('white').box(X0, X1, 1.48, 1.52, ZB, ZB + 0.02)                             # 磁磚收邊
for x in (X0, X1 - 0.02): acc('white').box(x, x + 0.02, 1.48, 1.52, ZB, ZF)
# 日光燈：三排兩支（燈座＋燈管發光）
for z in (-1.0, -3.6, -6.2):
    for x in (-1.3, 1.3):
        acc('white').box(x - 0.62, x + 0.62, H - 0.07, H, z - 0.08, z + 0.08); acc('tube').cyl((x - 0.58, H - 0.09, z), (x + 0.58, H - 0.09, z), 0.016, seg=8)
        area_light(f'tube_{x}_{z}', x, H - 0.11, z, 1.2, 0.12, 55, col=(0.93, 0.97, 1.0))
# 天花板吊扇（老店都有）
cfx, cfz = 0.6, -3.0
acc('white').cyl((cfx, H, cfz), (cfx, H - 0.45, cfz), 0.02, seg=8); acc('white').cyl((cfx, H - 0.45, cfz), (cfx, H - 0.6, cfz), 0.11, seg=16)
for k in range(3):
    a = k * 2.094 + 0.4; c, s_ = math.cos(a), math.sin(a)
    acc('wood').quad([(cfx + c * 0.1 - s_ * 0.06, H - 0.55, cfz + s_ * 0.1 + c * 0.06), (cfx + c * 0.72 - s_ * 0.075, H - 0.57, cfz + s_ * 0.72 + c * 0.075),
                      (cfx + c * 0.72 + s_ * 0.075, H - 0.57, cfz + s_ * 0.72 - c * 0.075), (cfx + c * 0.1 + s_ * 0.06, H - 0.55, cfz + s_ * 0.1 - c * 0.06)])

# ======================== 後牆：菜單、往廚房的門簾、冰箱、電視 ========================
def menu_tex(path):
    W, Hh = 2400, 560; im = Image.new('RGB', (W, Hh), (247, 244, 236)); d = ImageDraw.Draw(im)
    fT = ImageFont.truetype(FONT, 74); fI = ImageFont.truetype(FONT, 62); fP = ImageFont.truetype(FONT, 50)
    d.rectangle([0, 0, W, 112], fill=(178, 36, 32)); d.text((W // 2, 56), '豆漿・燒餅・油條・飯糰', font=fT, fill=(255, 246, 228), anchor='mm')
    items = [('豆漿', '20／25'), ('米漿', '25'), ('鹹豆漿', '35'), ('燒餅油條', '45'), ('蛋餅', '35'), ('飯糰', '40'),
             ('燒餅夾蛋', '40'), ('蘿蔔絲餅', '35'), ('小籠包', '70'), ('油條', '20'), ('甜燒餅', '20'), ('蔥油餅', '30')]
    cw = W // 4
    for i, (n, p) in enumerate(items):
        cx, cy = (i % 4) * cw, 140 + (i // 4) * 136
        d.text((cx + 40, cy + 30), n, font=fI, fill=(150, 28, 26)); d.text((cx + cw - 50, cy + 40), p, font=fP, fill=(40, 40, 40), anchor='ra')
        d.line([(cx + 30, cy + 112), (cx + cw - 30, cy + 112)], fill=(220, 210, 196), width=3)
    for x in range(cw, W, cw): d.line([(x, 124), (x, Hh - 10)], fill=(214, 200, 182), width=4)
    im.save(path); return path
mm = img_mat('soy_menu', menu_tex(os.path.join(TMP, 'menu.png')), rough=0.5)
uvquad('soy_menu_face', (-2.2, 1.95, ZB + 0.04), (1.6, 1.95, ZB + 0.04), (1.6, 2.83, ZB + 0.04), (-2.2, 2.83, ZB + 0.04), mm)
acc('wood').box(-2.26, 1.66, 1.89, 1.95, ZB, ZB + 0.06); acc('wood').box(-2.26, 1.66, 2.83, 2.89, ZB, ZB + 0.06)
for x in (-2.26, 1.6): acc('wood').box(x, x + 0.06, 1.89, 2.89, ZB, ZB + 0.06)
# 往廚房的門（右後）：門框＋藍色布簾（兩片，下襬一點點擺動）
kx0, kx1 = 2.0, 2.95
acc('steel_dk').box(kx0 - 0.05, kx0, 0.0, 2.15, ZB, ZB + 0.08); acc('steel_dk').box(kx1, kx1 + 0.05, 0.0, 2.15, ZB, ZB + 0.08); acc('steel_dk').box(kx0 - 0.05, kx1 + 0.05, 2.1, 2.15, ZB, ZB + 0.08)
acc('black').quad([(kx0, 0.0, ZB + 0.01), (kx1, 0.0, ZB + 0.01), (kx1, 2.1, ZB + 0.01), (kx0, 2.1, ZB + 0.01)])                      # 門裡面（暗）
for j, (a, b_) in enumerate(((kx0, (kx0 + kx1) / 2 - 0.01), ((kx0 + kx1) / 2 + 0.01, kx1))):
    n = 8
    for k in range(n):
        xa, xb = a + (b_ - a) * k / n, a + (b_ - a) * (k + 1) / n; wa, wb = 0.012 * math.sin(k * 1.7 + j), 0.012 * math.sin((k + 1) * 1.7 + j)
        acc('curtain').quad([(xa, 0.85, ZB + 0.1 + wa), (xb, 0.85, ZB + 0.1 + wb), (xb, 2.08, ZB + 0.1), (xa, 2.08, ZB + 0.1)])
# 冰箱（左後角）：玻璃門、裡面一排一排的飲料、上面的燈箱
fx0, fx1, fz0, fz1 = -3.15, -2.35, ZB + 0.05, ZB + 0.7
acc('white').box(fx0, fx1, 0.0, 0.12, fz0, fz1); acc('white').box(fx0, fx1, 1.7, 1.95, fz0, fz1); acc('white').box(fx0, fx1, 0.0, 1.95, fz0, fz0 + 0.04)   # 冰箱：底座、上面的燈箱、背板、兩側（前面是玻璃門）
for x in (fx0, fx1 - 0.04): acc('white').box(x, x + 0.04, 0.0, 1.95, fz0, fz1)
acc('black').box(fx0 + 0.04, fx1 - 0.04, 0.12, 1.7, fz0 + 0.04, fz0 + 0.05)
cols = ['#e8e4d6', '#c94338', '#3b7d3a', '#d8a63a', '#2b4f8a', '#f0f0f0', '#7a3a2a']
for r_, y in enumerate((0.2, 0.62, 1.04, 1.36)):
    acc('white').box(fx0 + 0.06, fx1 - 0.06, y - 0.015, y, fz0 + 0.1, fz1 - 0.05)
    for k in range(6):
        x = fx0 + 0.13 + k * 0.105; c = cols[(k + r_ * 2) % len(cols)]
        if f'bottle_{c}' not in M: M[f'bottle_{c}'] = L.flat(f'soy_bottle_{c[1:]}', c, rough=0.3)
        acc(f'bottle_{c}').cyl((x, y, fz1 - 0.18), (x, y + 0.24, fz1 - 0.18), 0.032, seg=10); acc(f'bottle_{c}').cyl((x, y + 0.24, fz1 - 0.18), (x, y + 0.29, fz1 - 0.18), 0.014, seg=8)
acc('glass').quad([(fx0 + 0.05, 0.12, fz1 + 0.012), (fx1 - 0.05, 0.12, fz1 + 0.012), (fx1 - 0.05, 1.7, fz1 + 0.012), (fx0 + 0.05, 1.7, fz1 + 0.012)])
acc('tube').box(fx0 + 0.08, fx1 - 0.08, 1.78, 1.88, fz1, fz1 + 0.01)
area_light('fridge', (fx0 + fx1) / 2, 1.5, fz1 - 0.2, 0.6, 0.3, 12, col=(0.9, 0.97, 1.0))
# 電視（左上角，牆上的架子；關著）
acc('steel_dk').box(-3.2, -3.05, 2.35, 2.45, -5.2, -5.0); acc('black').box(-3.05, -2.98, 2.0, 2.7, -5.75, -4.45)
acc('screen').quad([(-2.975, 2.04, -5.71), (-2.975, 2.04, -4.49), (-2.975, 2.66, -4.49), (-2.975, 2.66, -5.71)][::-1])
# 左牆：壁扇、月曆（只有畫和看不清楚的數字）、牆上的鏡子條
wfx, wfz = -3.2, -2.2
acc('white').box(wfx, wfx + 0.08, 2.18, 2.32, wfz - 0.08, wfz + 0.08)
acc('white').cyl((wfx + 0.08, 2.25, wfz), (wfx + 0.3, 2.22, wfz), 0.07, seg=14)
for k in range(12):   # 護網：一圈一圈的鐵絲（從側面看是一個淺碗）
    a = k / 12 * math.tau
    acc('white').cyl((wfx + 0.31, 2.22, wfz), (wfx + 0.38, 2.22 + 0.2 * math.sin(a), wfz + 0.2 * math.cos(a)), 0.004, seg=4)
acc('white').cyl((wfx + 0.37, 2.22, wfz), (wfx + 0.39, 2.22, wfz), 0.2, seg=24, caps=False)
for k in range(3):
    a = k * 2.094; acc('fan_blue').quad([(wfx + 0.33, 2.22, wfz), (wfx + 0.34, 2.22 + 0.17 * math.sin(a), wfz + 0.17 * math.cos(a)),
                                         (wfx + 0.34, 2.22 + 0.17 * math.sin(a + 0.6), wfz + 0.17 * math.cos(a + 0.6)), (wfx + 0.33, 2.22, wfz)])
def cal_tex(path):
    im = Image.new('RGB', (360, 520), (250, 248, 242)); d = ImageDraw.Draw(im)
    d.rectangle([20, 20, 340, 230], fill=(120, 160, 120)); d.ellipse([60, 60, 200, 180], fill=(230, 200, 120)); d.polygon([(20, 230), (140, 120), (260, 230)], fill=(80, 120, 90))
    for r in range(5):
        for c in range(7): d.rectangle([28 + c * 44, 262 + r * 48, 58 + c * 44, 290 + r * 48], fill=(200, 196, 188) if c not in (0, 6) else (226, 150, 140))
    im.save(path); return path
uvquad('soy_calendar', (X0 + 0.01, 1.62, -3.3), (X0 + 0.01, 1.62, -3.7), (X0 + 0.01, 2.2, -3.7), (X0 + 0.01, 2.2, -3.3), img_mat('soy_cal', cal_tex(os.path.join(TMP, 'cal.png')), rough=0.6))

# 左牆貼的單子（今日、外帶、春聯剩下的「福」）、後牆的時鐘
def note_tex(path, lines, bg=(250, 246, 232), fg=(40, 40, 40), size=64, W=420, Hh=560, title=None, tcol=(178, 36, 32)):
    im = Image.new('RGB', (W, Hh), bg); d = ImageDraw.Draw(im); y = 40
    if title: d.text((W // 2, 60), title, font=ImageFont.truetype(FONT, size + 12), fill=tcol, anchor='mm'); y = 130
    for ln in lines: d.text((40, y), ln, font=ImageFont.truetype(FONT, size), fill=fg); y += int(size * 1.45)
    im.save(path); return path
NOTES = [('today', ['韭菜盒　35', '蘿蔔糕　30', '鹹粥　　40'], (-4.3, 1.75, 0.42, 0.56), '今日'),
         ('togo', ['外帶請先點', '豆漿可加糖', '　少糖・無糖'], (-2.75, 1.68, 0.42, 0.52), None)]
for nm, lines, (zc, y0, w_, h_), tt in NOTES:
    mt = img_mat(f'soy_note_{nm}', note_tex(os.path.join(TMP, f'note_{nm}.png'), lines, title=tt), rough=0.8)
    uvquad(f'soy_note_{nm}', (X0 + 0.012, y0, zc + w_ / 2), (X0 + 0.012, y0, zc - w_ / 2), (X0 + 0.012, y0 + h_, zc - w_ / 2), (X0 + 0.012, y0 + h_, zc + w_ / 2), mt)
fu = Image.new('RGB', (300, 300), (196, 36, 34)); dfu = ImageDraw.Draw(fu); dfu.text((150, 150), '福', font=ImageFont.truetype(FONT, 210), fill=(240, 196, 80), anchor='mm'); fu = fu.rotate(45, fillcolor=(0, 0, 0, 0), expand=False); fp = os.path.join(TMP, 'fu.png'); fu.save(fp)
uvquad('soy_fu', (kx0 + 0.2, 2.25, ZB + 0.02), (kx1 - 0.2, 2.25, ZB + 0.02), (kx1 - 0.2, 2.8, ZB + 0.02), (kx0 + 0.2, 2.8, ZB + 0.02), img_mat('soy_fu', fp, rough=0.7))
ck = Image.new('RGB', (256, 256), (245, 243, 236)); dck = ImageDraw.Draw(ck); dck.ellipse([4, 4, 252, 252], outline=(60, 60, 60), width=10)
for k in range(12): a = k / 12 * math.tau; dck.line([(128 + 100 * math.sin(a), 128 - 100 * math.cos(a)), (128 + 112 * math.sin(a), 128 - 112 * math.cos(a))], fill=(60, 60, 60), width=6)
dck.line([(128, 128), (128, 52)], fill=(30, 30, 30), width=9); dck.line([(128, 128), (134, 40)], fill=(30, 30, 30), width=5); cp = os.path.join(TMP, 'clock.png'); ck.save(cp)   # 11:58
uvquad('soy_clock', (-2.75, 2.35, ZB + 0.03), (-2.4, 2.35, ZB + 0.03), (-2.4, 2.7, ZB + 0.03), (-2.75, 2.7, ZB + 0.03), img_mat('soy_clock', cp, rough=0.4))

# ======================== SOY1 道具（AA-B） ========================
GLB = os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/soy_props.glb')
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); new = [o for o in bpy.data.objects if o not in before]
SRC = {o.name.split('.')[0]: o for o in new if o.name.split('.')[0].startswith('SOY_')}
for o in new:
    o.hide_render = True
def put(name, x, y, z, ry=0.0):
    src = SRC[name]; ob = src.copy(); ob.data = src.data; sc.collection.objects.link(ob); ob.hide_render = False
    ob.parent = root; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry); ob.scale = (1, 1, 1); return ob
put('SOY_COUNTER', 2.8, 0.0, -3.0, -math.pi / 2)                     # 右牆的前檯（客人那面朝左）
acc('steel').box(2.5, 3.15, 0.0, 0.86, -5.0, -4.25); acc('steel').box(2.47, 3.18, 0.86, 0.9, -5.03, -4.22)   # 保溫櫃底下的矮櫃（接在前檯後面）
put('SOY_DISPLAY', 2.82, 0.9, -4.62, -math.pi / 2)
put('SOY_STEAMER', 2.92, 0.9, -2.05, 0.3)
put('SOY_OVEN', 2.6, 0.0, 0.15, -0.5)                                 # 右前景：燒餅爐（老店都在門口做）
put('SOY_FRYER', 2.75, 0.0, -1.05, -math.pi / 2)                      # 炸鍋沿著右牆，油條架在靠門那一邊
for (tx, tz, ry) in ((-1.9, -1.4, 0.06), (-1.9, -3.6, -0.04), (-1.75, -5.7, 0.1), (0.55, -6.3, -0.08)):   # 第四張在後面中間（人物站的地方後面）
    put('SOY_TABLE', tx, 0.0, tz, ry); put('SOY_CONDIMENT', tx + 0.2, 0.74, tz - 0.15, ry + 0.4)
# 前檯上的雜物（客人那一側看得到）：一疊外帶杯、糖罐、收錢的小鐵盤、點單夾
for k in range(9): acc('white').cyl((2.62, 0.9 + k * 0.012, -3.75), (2.62, 0.912 + k * 0.012, -3.75), 0.045 - 0.0, seg=14, r2=0.047)
acc('glass').cyl((2.7, 0.9, -3.95), (2.7, 1.06, -3.95), 0.06, seg=14); acc('paper_y').cyl((2.7, 0.9, -3.95), (2.7, 1.0, -3.95), 0.055, seg=14)
acc('steel_dk').box(2.48, 2.7, 0.9, 0.93, -2.55, -2.35); acc('white').box(2.6, 2.85, 0.9, 0.905, -2.25, -2.08)
# 前檯上面牆上的層板：保溫瓶、鐵罐、一台收音機
acc('wood').box(2.95, 3.2, 1.78, 1.82, -4.4, -1.9)
for k, (zc, kind) in enumerate(((-4.2, 'tin'), (-3.9, 'tin'), (-3.55, 'thermos'), (-3.2, 'tin'), (-2.6, 'radio'))):
    if kind == 'tin': acc('red' if k % 2 else 'steel').cyl((3.08, 1.82, zc), (3.08, 2.0, zc), 0.07, seg=14)
    elif kind == 'thermos': acc('fan_blue').cyl((3.08, 1.82, zc), (3.08, 2.12, zc), 0.065, seg=14); acc('white').cyl((3.08, 2.12, zc), (3.08, 2.18, zc), 0.05, seg=12)
    else: acc('black').box(2.98, 3.18, 1.82, 1.98, zc - 0.17, zc + 0.17); acc('steel').cyl((3.0, 1.9, zc + 0.08), (2.98, 1.9, zc + 0.08), 0.05, seg=12)
# 桌上剛吃完的：一個碗、豆漿杯、竹筷（第一張桌子）
acc('white').cyl((-2.1, 0.74, -1.25), (-2.1, 0.8, -1.25), 0.07, seg=16); acc('white').cyl((-1.7, 0.74, -1.5), (-1.7, 0.86, -1.5), 0.04, seg=12)
# 牆邊疊起來的紅色圓凳（快打烊）
for k in range(4): acc('red').cyl((-2.85, 0.02 + k * 0.07, -6.6), (-2.85, 0.45 + k * 0.07, -6.6), 0.16 - 0.0, seg=16, r2=0.13)

# ======================== 收尾、光、鏡頭 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=k in ('red', 'tube'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.75, 0.8, 0.86, 1); bg.inputs[1].default_value = 0.25
area_light('door_day', 0.0, 1.4, ZF + 0.3, 6.2, 2.6, 1400, col=(1.0, 0.95, 0.86), rot=(math.pi / 2, 0, 0))   # 門口的日光（朝店裡）
area_light('door_bounce', 0.0, 0.2, ZF - 0.5, 5.0, 2.0, 300, col=(1.0, 0.94, 0.85), rot=(math.pi / 2 + 0.6, 0, 0))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye, look = (-1.0, 1.45, 1.4), (0.75, 1.25, -6.0)
if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', '19')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
# 後製：一點暖色、四角暗角（和其他 2D 背景一樣的畫面感）
import numpy as np   # noqa: E402
im = np.asarray(Image.open(OUT).convert('RGB')).astype(np.float32) / 255.0; h_, w_ = im.shape[:2]
yy, xx = np.mgrid[0:h_, 0:w_]; r = np.hypot((xx - w_ / 2) / (w_ / 2), (yy - h_ / 2) / (h_ / 2))
im = im * np.array([1.03, 1.0, 0.95]) * (1.0 - 0.22 * np.clip(r - 0.45, 0, 1) ** 1.5)[..., None]
Image.fromarray((np.clip(im, 0, 1) * 255).astype(np.uint8)).save(OUT)
print('saved', OUT)
