"""2D 背景：永康街・咖哩店（BG-14，key yongkang_curry；事件 ev_family_dinner「家族聚餐」：第 4 週週五 18:30，學姊「（看菜單三十秒）兩件事。一，我要辣的。」）。LAWWW2-C 2026-10-17。
虛構的小咖哩店（D77：不放店名、標誌）：日式的小店——木頭桌、木牆、牆上一排咖哩的照片價目板（照片是畫的色塊，字是虛構的品項）、
廚房入口掛著深藍布簾、層架上的香料罐和醃菜罐；左邊的窗外是晚上的永康街（亮著的店、行人道的燈，模糊）。
鏡頭坐在桌邊（眼睛 1.2 m），看對面的座位（學姊坐的位置，人物用 ADV 立繪疊上去，中間留空）：前景是桌面、兩份菜單、水杯、筷子筒。
  /opt/blenv/bin/python tools/blender/env_second/bg_curry.py -- <輸出.png> [--res 1920x1080] [--samples 96]
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_curry_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1014)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.5'))
try: sc.view_settings.look = opt('--look', 'AgX - Base Contrast')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
root = B.group('curry')


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


def point(name, x, y, z, power, r=0.05, col=(1.0, 0.80, 0.55)):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def text_center(d, box, txt, f, fill):
    x0, y0, x1, y1 = box; w = d.textlength(txt, font=f); bb = f.getbbox(txt)
    d.text((x0 + (x1 - x0 - w) / 2, y0 + (y1 - y0 - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=fill)


def menu_board_tex(path, items, W=1800, H=520):
    """牆上的照片價目板：每一格一張「照片」（畫的咖哩：白飯＋褐色的咖哩＋配料的色塊）＋品項＋價錢"""
    im = Image.new('RGB', (W, H), (244, 236, 220)); d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(FONT, 50); f2 = ImageFont.truetype(FONT, 44)
    n = len(items); cw = W // n
    for k, (name, price, top) in enumerate(items):
        x0 = k * cw + 16; x1 = (k + 1) * cw - 16
        d.rectangle([x0, 16, x1, 330], fill=(54, 42, 36))
        cx = (x0 + x1) // 2; d.ellipse([cx - 150, 60, cx + 150, 300], fill=(240, 238, 230))       # 盤子
        d.ellipse([cx - 120, 90, cx + 20, 260], fill=(250, 248, 240))                              # 白飯
        d.pieslice([cx - 110, 80, cx + 130, 280], -70, 110, fill=(150, 88, 34))                    # 咖哩
        r = random.Random(k)
        for q in range(9):
            px = cx + r.randint(-10, 90); py = r.randint(110, 250); pr = r.randint(10, 22); d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=top)
        text_center(d, (x0, 340, x1, 420), name, f1, (60, 36, 26)); text_center(d, (x0, 420, x1, 500), price, f2, (160, 50, 30))
    im = im.filter(ImageFilter.GaussianBlur(1.2)); im.save(path); return path


def paper_menu_tex(path, W=600, H=840):
    im = Image.new('RGB', (W, H), (246, 240, 226)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 130], fill=(120, 60, 34)); f = ImageFont.truetype(FONT, 72); text_center(d, (0, 0, W, 130), '本日咖哩', f, (250, 240, 220))
    for k in range(9):
        y = 170 + k * 72; d.rectangle([50, y, 50 + random.Random(k).randint(220, 360), y + 22], fill=(90, 70, 60)); d.rectangle([470, y, 550, y + 22], fill=(150, 60, 40))
    im = im.filter(ImageFilter.GaussianBlur(1.0)); im.save(path); return path


def street_night_tex(path, W=1800, H=1000, seed=3):
    """窗外：晚上的永康街——對面亮著的店面（暖色）、二樓的窗、行道樹的暗影、地上的反光。
    第二版（LAWWW2-C 2026-10-17 精修：第一版只有幾大塊色塊、模糊 12 px）：店面有招牌燈箱（看不清楚的字形）、雨遮、門口的盆栽、
    騎樓下的機車、走過的人影、串燈、地上的反光；模糊 5 px（窗外是景深外，但看得出是一條街）"""
    r = random.Random(seed); im = Image.new('RGB', (W, H), (26, 30, 44)); d = ImageDraw.Draw(im)
    for y in range(H): t = y / H; d.line([(0, y), (W, y)], fill=(int(24 + 20 * t), int(28 + 14 * t), int(46 - 4 * t)))
    x = 0; gy = int(H * 0.78)
    while x < W:
        w = r.randint(200, 360); c = r.choice([(236, 188, 128), (238, 212, 168), (226, 168, 104), (196, 206, 214)])   # 第五版：店面暗一點、暖一點（第四版 255/236/200 和冷白，窗外看起來像白天）
        d.rectangle([x, int(H * 0.06), x + w, gy], fill=(48, 44, 50))                                     # 樓的牆
        for fx in range(x + 24, x + w - 50, 80):                                                         # 二、三樓的窗（有的亮）
            for fy in (int(H * 0.10), int(H * 0.22)):
                d.rectangle([fx, fy, fx + 46, fy + 70], fill=(226, 196, 146) if r.random() < 0.55 else (34, 36, 46))
                d.rectangle([fx - 5, fy - 6, fx + 51, fy + 76], outline=(70, 70, 74), width=2)                     # 鐵窗（台北的公寓）
                for gx in range(fx + 6, fx + 46, 9): d.line([(gx, fy - 6), (gx, fy + 76)], fill=(70, 70, 74), width=1)
                if r.random() < 0.35: d.rectangle([fx + 50, fy + 40, fx + 72, fy + 62], fill=(150, 150, 150))   # 冷氣機
        y0s = int(H * 0.44)
        for yy in range(y0s, gy):                                                                        # 一樓亮著的店面：上面亮（燈在天花板）、下面暗
            t = (yy - y0s) / (gy - y0s); d.line([(x + 10, yy), (x + w - 10, yy)], fill=tuple(int(v * (0.95 - 0.30 * t)) for v in c))
        dk = tuple(int(v * 0.55) for v in c); md = tuple(int(v * 0.75) for v in c)
        for sy in (y0s + 70, y0s + 130, y0s + 190):                                                       # 店裡後牆的層板（三層）＋上面的東西
            sx0 = x + 14 + r.randint(0, 30); sx1 = x + w - 14 - r.randint(0, 30); d.rectangle([sx0, sy, sx1, sy + 6], fill=md)
            kx = sx0 + 4
            while kx < sx1 - 14:
                kw_ = r.randint(10, 24); d.rectangle([kx, sy - r.randint(14, 34), kx + kw_, sy], fill=r.choice([(196, 84, 62), (96, 124, 84), (226, 206, 160), (84, 94, 126), dk, md])); kx += kw_ + r.randint(2, 10)
        mbx = r.randint(x + 20, max(x + 21, x + w - 120)); d.rectangle([mbx, y0s + 10, mbx + 100, y0s + 50], fill=(46, 40, 36)); d.rectangle([mbx + 6, y0s + 16, mbx + 94, y0s + 44], fill=(232, 222, 196))   # 菜單板
        for k in range(r.randint(1, 3)):                                                                  # 吊燈（亮的燈罩）
            lx = r.randint(x + 30, x + w - 30); d.line([(lx, y0s), (lx, y0s + 30)], fill=dk, width=2); d.chord([lx - 18, y0s + 26, lx + 18, y0s + 56], 180, 360, fill=(255, 240, 206))
        cx0 = r.randint(x + 20, x + w // 2); cx1 = min(x + w - 20, cx0 + r.randint(90, 170))              # 櫃台／長桌（高 0.8 m）
        for k in range(r.randint(1, 2)):                                                                  # 站在櫃台後面的店員（1.7 m）
            hx = r.randint(cx0, max(cx0 + 1, cx1 - 34)); col = r.choice([(40, 36, 40), (230, 226, 220), (120, 60, 50)])
            d.rounded_rectangle([hx, gy - 140, hx + 36, gy - 60], radius=12, fill=col); d.ellipse([hx + 5, gy - 170, hx + 31, gy - 138], fill=(56, 42, 36))
        d.rectangle([cx0, gy - 76, cx1, gy - 6], fill=dk); d.rectangle([cx0 - 4, gy - 82, cx1 + 4, gy - 74], fill=md)
        for k in range(r.randint(0, 2)):                                                                  # 坐著的客人（靠窗的高腳椅）
            hx = r.randint(x + 24, x + w - 44); col = r.choice([(70, 60, 56), (50, 60, 80), (150, 120, 90)])
            d.rounded_rectangle([hx, gy - 118, hx + 34, gy - 50], radius=12, fill=col); d.ellipse([hx + 5, gy - 146, hx + 29, gy - 116], fill=(40, 30, 26))
        for k in range(1, 3 + w // 120):                                                                 # 落地窗的門框
            fx = x + 10 + k * (w - 20) // (3 + w // 120); d.rectangle([fx - 3, y0s, fx + 3, gy], fill=(58, 48, 44))
        d.rectangle([x + 10, gy - 30, x + w - 10, gy - 26], fill=(70, 58, 50))                          # 落地窗下緣
        d.rectangle([x - 9, int(H * 0.39), x + 9, gy], fill=(36, 32, 36))                               # 騎樓的柱子（店和店之間）
        if r.random() < 0.6:                                                                              # 門口的立牌（菜單）
            mx = r.randint(x + 20, x + w - 50); d.polygon([(mx, gy), (mx + 14, gy - 56), (mx + 30, gy - 56), (mx + 44, gy)], fill=(40, 34, 30)); d.rectangle([mx + 12, gy - 50, mx + 32, gy - 16], fill=(230, 222, 200))
        d.polygon([(x + 4, int(H * 0.44)), (x + w - 4, int(H * 0.44)), (x + w - 24, int(H * 0.39)), (x + 24, int(H * 0.39))], fill=r.choice([(120, 40, 40), (40, 70, 60), (60, 60, 90), (150, 110, 50)]))   # 雨遮
        sc_ = r.choice([(250, 240, 220), (255, 200, 120), (180, 220, 255), (255, 150, 120)])            # 招牌燈箱（看不清楚的字形）
        bx = x + r.randint(20, max(21, w - 140)); d.rectangle([bx, int(H * 0.31), bx + 120, int(H * 0.37)], fill=sc_)
        for k in range(4): gx = bx + 10 + k * 27; d.rectangle([gx, int(H * 0.325), gx + 16, int(H * 0.355)], fill=(60, 40, 30))
        if r.random() < 0.5: d.rectangle([x + w - 26, int(H * 0.24), x + w - 10, int(H * 0.44)], fill=r.choice([(250, 120, 90), (255, 220, 140)]))   # 直立的小招牌
        for k in range(r.randint(1, 2)):                                                                  # 門口的盆栽
            px_ = r.randint(x + 20, x + w - 40); d.rectangle([px_, gy - 30, px_ + 24, gy], fill=(90, 60, 44)); d.ellipse([px_ - 14, gy - 70, px_ + 38, gy - 24], fill=(30, 52, 36))
        x += w
    for k in range(40):                                                                                    # 串燈
        sx = k * (W / 40); sy = int(H * 0.30) + 18 * math.sin(k * 0.6); d.ellipse([sx - 4, sy - 4, sx + 4, sy + 4], fill=(255, 220, 150))
    d.rectangle([0, gy, W, H], fill=(52, 48, 50))
    for k in range(60):                                                                                    # 地上的反光（招牌、店面的光拉成直條）
        rx = r.randint(0, W); d.rectangle([rx, gy + 4, rx + r.randint(4, 14), gy + r.randint(30, 160)], fill=r.choice([(120, 100, 80), (110, 90, 70), (90, 100, 120)]))
    for k in range(7):                                                                                     # 騎樓下的機車
        mx = r.randint(0, W); d.rectangle([mx, gy - 46, mx + 70, gy - 20], fill=(20, 20, 24)); d.ellipse([mx - 8, gy - 30, mx + 18, gy - 4], fill=(14, 14, 16)); d.ellipse([mx + 56, gy - 30, mx + 82, gy - 4], fill=(14, 14, 16))
    for k in range(6):                                                                                     # 走過的人影
        hx = r.randint(0, W); d.rectangle([hx, gy - 150, hx + 34, gy - 4], fill=(22, 22, 28)); d.ellipse([hx + 4, gy - 182, hx + 30, gy - 150], fill=(22, 22, 28))
    for k in range(8):
        x0 = r.randint(0, W); d.ellipse([x0 - 150, int(H * 0.0), x0 + 150, int(H * 0.30)], fill=(18, 26, 22))   # 行道樹（上面）
    im = im.filter(ImageFilter.GaussianBlur(5)); im.save(path); return path


def clock_tex(path, hh=18, mm=42, S=512):
    im = Image.new('RGB', (S, S), (70, 50, 36)); d = ImageDraw.Draw(im); c = S / 2
    d.ellipse([10, 10, S - 10, S - 10], fill=(244, 238, 226))
    for k in range(12):
        a = 2 * math.pi * k / 12; d.line([(c + (c - 60) * math.sin(a), c - (c - 60) * math.cos(a)), (c + (c - 24) * math.sin(a), c - (c - 24) * math.cos(a))], fill=(50, 40, 34), width=10)
    for a, ln, w in ((2 * math.pi * ((hh % 12) + mm / 60) / 12, c * 0.5, 16), (2 * math.pi * mm / 60, c * 0.74, 10)):
        d.line([(c, c), (c + ln * math.sin(a), c - ln * math.cos(a))], fill=(30, 26, 24), width=w)
    d.ellipse([c - 14, c - 14, c + 14, c + 14], fill=(30, 26, 24)); im.save(path); return path


def noren_tex(path, W=800, H=600):
    im = Image.new('RGB', (W, H), (34, 46, 76)); d = ImageDraw.Draw(im)
    for x in (W // 3, 2 * W // 3): d.line([(x, 0), (x, H)], fill=(24, 32, 56), width=6)
    d.ellipse([W // 2 - 90, H // 2 - 90, W // 2 + 90, H // 2 + 90], outline=(232, 228, 214), width=10)   # 白色的圓（不放字、不放店名）
    im.save(path); return path


M = {
    'wood': L.pbr('cy_wood', 'walnut_veneer', tile=1.0, target='#6a4630', normal=0.25, maps=('diff', 'nor'), rough_value=0.45),
    'table': L.pbr('cy_table', 'walnut_veneer', tile=0.6, target='#8c6444', normal=0.2, maps=('diff', 'nor'), rough_value=0.4),   # 第二版：wood_table_001 的木紋太粗，像合板
    'plaster': L.pbr('cy_plaster', 'painted_plaster_wall', tile=2.0, target='#e8d8bc', normal=0.15, maps=('diff', 'nor')),
    'floor': L.pbr('cy_floor', 'dark_planks', tile=1.2, target='#5a3e2c', normal=0.3, maps=('diff', 'nor', 'rough')),
    'ceil': L.flat('cy_ceil', '#3a2a20', rough=0.8), 'beam': L.flat('cy_beam', '#4a3222', rough=0.6),
    'glass': L.flat('cy_glass', '#eef2f4', rough=0.04, alpha=0.10), 'dark': L.flat('cy_dark', '#1c1a18', rough=0.6),
    'steel': L.flat('cy_steel', '#c8c8c6', rough=0.25, metal=0.45), 'cup': L.flat('cy_cup', '#e8eef0', rough=0.05, alpha=0.35),
    'shade': L.flat('cy_shade', '#e8d2a8', rough=0.6, emit=B.srgb('#a86a30')),   # 第二版：燈罩自己不要那麼亮（第一版一個白色的圓錐）
    'jar': L.flat('cy_jar', '#d8e2dc', rough=0.08, alpha=0.4),
    'pickle': L.flat('cy_pickle', '#b0452c', rough=0.5), 'spice': L.flat('cy_spice', '#c8902c', rough=0.6), 'spice2': L.flat('cy_spice2', '#6a3a20', rough=0.6),
    'chop': L.flat('cy_chop', '#d6b88a', rough=0.6), 'cream': L.flat('cy_cream', '#efe6d4', rough=0.6),
    'tile': L.pbr('cy_tile', 'long_white_tiles', tile=1.2, target='#cfcabe', normal=0.3, maps=('diff', 'nor'), rough_value=0.25),   # 第五版：布簾後面的小廚房
    'kfloor': L.pbr('cy_kfloor', 'floor_tiles_06', tile=1.5, target='#8a8680', normal=0.3, maps=('diff', 'nor'), rough_value=0.5),
    'kceil': L.flat('cy_kceil', '#d8d4ca', rough=0.8),
    'pot': L.flat('cy_pot', '#7c7e80', rough=0.3, metal=0.45), 'enamel': L.flat('cy_enamel', '#a8452e', rough=0.35),
    'bowl': L.flat('cy_bowl', '#ebe5d8', rough=0.35), 'crate': L.flat('cy_crate', '#3c6a9a', rough=0.6), 'sack': L.flat('cy_sack', '#d8cdb2', rough=0.9),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('cy_' + k, M[k])
    return _acc[k]


X0, X1, ZB, ZF, H = -2.6, 2.8, -2.6, 1.6, 2.7
acc('floor').quad([(X0, 0.0, ZF), (X1, 0.0, ZF), (X1, 0.0, ZB), (X0, 0.0, ZB)])
acc('ceil').quad([(X0, H, ZF), (X1, H, ZF), (X1, H, ZB), (X0, H, ZB)][::-1])
for zz in (-2.0, -0.8, 0.4): acc('beam').box(X0, X1, H - 0.14, H, zz - 0.06, zz + 0.06)      # 天花板的木樑
# 後牆（對面）：下半木作、上半米色灰泥；照片價目板；右邊廚房入口（深藍布簾）
# 第五版：右邊留廚房的門洞（x 1.45–2.45、高 2.05；第四版整面牆，布簾下面看到的是牆）
acc('plaster').quad([(X0, 0.0, ZB), (1.45, 0.0, ZB), (1.45, H, ZB), (X0, H, ZB)][::-1]); acc('plaster').quad([(2.45, 0.0, ZB), (X1, 0.0, ZB), (X1, H, ZB), (2.45, H, ZB)][::-1])
acc('plaster').quad([(1.45, 2.05, ZB), (2.45, 2.05, ZB), (2.45, H, ZB), (1.45, H, ZB)][::-1])
acc('wood').box(X0, 1.3, 0.0, 1.05, ZB, ZB + 0.025)
acc('wood').box(X0, 1.3, 1.05, 1.09, ZB, ZB + 0.05)                                      # 牆裙上緣的木條
mb = img_mat('cy_menuboard', menu_board_tex(os.path.join(TMP, 'menuboard.png'),
             [('雞肉咖哩', '180', (230, 200, 120)), ('豬排咖哩', '220', (200, 150, 80)), ('蔬菜咖哩', '170', (110, 160, 80)), ('牛筋咖哩', '240', (120, 70, 40)), ('起司加點', '+40', (250, 220, 120))]), rough=0.5)
acc('wood').box(-2.45, 1.15, 1.55, 2.12, ZB + 0.005, ZB + 0.04)
uvquad('cy_menuboard', (-2.40, 1.58, ZB + 0.042), (1.10, 1.58, ZB + 0.042), (1.10, 2.09, ZB + 0.042), (-2.40, 2.09, ZB + 0.042), mb)
# 廚房（第二版：第一版入口裡是一塊 20 cm 厚的深色方塊，把後面的工作台整個擋住，布簾下面是一片深灰）：布簾後面蓋一個小廚房——
# 淺色磁磚的後牆、兩側牆、地板、不鏽鋼工作台（湯鍋、勺子）、碗架、暖光
KZ = ZB - 1.4
acc('tile').quad([(1.0, 0.0, KZ), (2.9, 0.0, KZ), (2.9, 2.3, KZ), (1.0, 2.3, KZ)][::-1])
acc('tile').quad([(1.0, 0.0, ZB), (1.0, 0.0, KZ), (1.0, 2.3, KZ), (1.0, 2.3, ZB)][::-1]); acc('tile').quad([(2.9, 0.0, KZ), (2.9, 0.0, ZB), (2.9, 2.3, ZB), (2.9, 2.3, KZ)][::-1])
acc('kfloor').quad([(1.0, 0.0, ZB), (2.9, 0.0, ZB), (2.9, 0.0, KZ), (1.0, 0.0, KZ)]); acc('kceil').quad([(1.0, 2.3, ZB), (2.9, 2.3, ZB), (2.9, 2.3, KZ), (1.0, 2.3, KZ)][::-1])
# 第五版：工作台是真的不鏽鋼桌（檯面、四隻腳、下層架；第四版一整塊實心的白方塊，像冰箱）；湯鍋深一點的鋼色＋鍋蓋、一個紅色琺瑯鍋；碗是陶瓷
TX0, TX1, TZa, TZb = 1.30, 2.60, KZ + 0.15, KZ + 0.75
acc('steel').box(TX0, TX1, 0.86, 0.90, TZa, TZb); acc('steel').box(TX0 + 0.04, TX1 - 0.04, 0.18, 0.21, TZa + 0.04, TZb - 0.04)
for lx in (TX0 + 0.04, TX1 - 0.04):
    for lz in (TZa + 0.04, TZb - 0.04): Mesh('cy_leg%.2f%.2f' % (lx, lz), M['steel']).cyl((lx, 0.0, lz), (lx, 0.86, lz), 0.018, seg=8).finish(parent=root)
acc('sack').box(1.40, 1.80, 0.21, 0.52, TZa + 0.08, TZb - 0.10); acc('crate').box(1.90, 2.30, 0.21, 0.45, TZa + 0.10, TZb - 0.12)   # 下層架：米袋、塑膠籃
for (px_, r_, h_, mk) in ((1.70, 0.17, 0.30, 'pot'), (2.20, 0.14, 0.20, 'enamel')):                # 檯面上的湯鍋（咖哩）＋鍋蓋（斜靠著）
    Mesh('cy_pot%.2f' % px_, M[mk]).cyl((px_, 0.90, KZ + 0.45), (px_, 0.90 + h_, KZ + 0.45), r_, seg=24).finish(parent=root, smooth=True)
    Mesh('cy_potrim%.2f' % px_, M['pot']).cyl((px_, 0.90 + h_ - 0.012, KZ + 0.45), (px_, 0.90 + h_, KZ + 0.45), r_ + 0.008, seg=24).finish(parent=root, smooth=True)
Mesh('cy_lid', M['pot']).cyl((2.20, 1.10, KZ + 0.62), (2.22, 1.11, KZ + 0.66), 0.14, seg=24).finish(parent=root, smooth=True)
Mesh('cy_ladle', M['steel']).cyl((1.62, 1.18, KZ + 0.45), (1.55, 1.40, KZ + 0.40), 0.01, seg=6).finish(parent=root)
acc('table').box(1.95, 2.05 + 0.25, 0.90, 0.93, TZa + 0.05, TZa + 0.33)                                 # 砧板
for k in range(5): Mesh('cy_plate%d' % k, M['bowl']).cyl((2.42, 0.90 + k * 0.012, TZa + 0.25), (2.42, 0.91 + k * 0.012, TZa + 0.25), 0.11, seg=20).finish(parent=root, smooth=True)   # 一疊盤子
acc('steel').box(1.2, 2.7, 1.55, 1.58, KZ + 0.02, KZ + 0.30)                                      # 碗架
for k in range(8): Mesh('cy_bowl%d' % k, M['bowl']).cyl((1.32 + k * 0.17, 1.58, KZ + 0.16), (1.32 + k * 0.17, 1.66, KZ + 0.16), 0.07, seg=14, r2=0.05).finish(parent=root, smooth=True)
acc('wood').box(1.38, 1.45, 0.0, 2.12, ZB, ZB + 0.06); acc('wood').box(2.45, 2.52, 0.0, 2.12, ZB, ZB + 0.06); acc('wood').box(1.38, 2.52, 2.05, 2.12, ZB, ZB + 0.06)
nm = img_mat('cy_noren', noren_tex(os.path.join(TMP, 'noren.png')), rough=0.9)
for k in range(3):                                                                         # 布簾：三片，下緣到 1.4 m，微微的波
    x0 = 1.47 + k * 0.33
    uvquad('cy_noren%d' % k, (x0, 1.40, ZB + 0.08 + 0.01 * k), (x0 + 0.32, 1.40, ZB + 0.08 + 0.01 * k), (x0 + 0.32, 2.04, ZB + 0.07), (x0, 2.04, ZB + 0.07), nm,
           uv=((k / 3, 0), ((k + 1) / 3, 0), ((k + 1) / 3, 1), (k / 3, 1)))
acc('steel').box(1.38, 2.52, 2.03, 2.05, ZB + 0.06, ZB + 0.09)
ck = img_mat('cy_clock', clock_tex(os.path.join(TMP, 'clock.png')), rough=0.5)           # 時鐘 18:42（聚餐約 18:30，Kevin 遲到七分鐘）
uvquad('cy_clock', (1.70, 2.20, ZB + 0.012), (2.20, 2.20, ZB + 0.012), (2.20, 2.70, ZB + 0.012), (1.70, 2.70, ZB + 0.012), ck)
area_light_k = bpy.data.lights.new('kitchen', 'AREA'); area_light_k.energy = 28; area_light_k.color = (1.0, 0.92, 0.80); area_light_k.size = 0.8
ko = bpy.data.objects.new('kitchen', area_light_k); ko.location = g2b(1.95, 2.2, ZB - 0.7); sc.collection.objects.link(ko); ko.rotation_euler = (g2b(1.95, 0.5, ZB - 0.7) - g2b(1.95, 2.2, ZB - 0.7)).to_track_quat('-Z', 'Y').to_euler()
# 右牆：層架上的香料罐、醃菜罐
acc('plaster').quad([(X1, 0.0, ZF), (X1, 0.0, ZB), (X1, H, ZB), (X1, H, ZF)])
acc('wood').box(X1 - 0.025, X1, 0.0, 1.05, ZB, ZF)
for yy in (1.35, 1.75):
    acc('wood').box(X1 - 0.24, X1, yy - 0.03, yy, -1.9, 0.2)
    for k in range(9):
        zz = -1.8 + k * 0.22; hh = rng.uniform(0.12, 0.2)
        Mesh('cy_jar%d_%d' % (int(yy * 10), k), M['jar']).cyl((X1 - 0.12, yy, zz), (X1 - 0.12, yy + hh, zz), 0.055, seg=14).finish(parent=root, smooth=True)
        Mesh('cy_in%d_%d' % (int(yy * 10), k), M[rng.choice(['pickle', 'spice', 'spice2'])]).cyl((X1 - 0.12, yy + 0.005, zz), (X1 - 0.12, yy + hh * 0.75, zz), 0.048, seg=12).finish(parent=root, smooth=True)
# 左牆：窗（晚上的永康街）
acc('plaster').quad([(X0, 0.0, ZB), (X0, 0.0, ZF), (X0, 0.9, ZF), (X0, 0.9, ZB)])
acc('plaster').quad([(X0, 2.2, ZB), (X0, 2.2, ZF), (X0, H, ZF), (X0, H, ZB)])
acc('plaster').quad([(X0, 0.9, ZB), (X0, 0.9, -2.2), (X0, 2.2, -2.2), (X0, 2.2, ZB)])
acc('plaster').quad([(X0, 0.9, 1.2), (X0, 0.9, ZF), (X0, 2.2, ZF), (X0, 2.2, 1.2)])
acc('wood').box(X0, X0 + 0.025, 0.0, 0.9, ZB, ZF)
for zz in (-2.2, -0.5, 1.2): acc('wood').box(X0, X0 + 0.08, 0.9, 2.2, zz - 0.04, zz + 0.04)   # 窗框（木）
for yy in (0.9, 2.2): acc('wood').box(X0, X0 + 0.10, yy - 0.04, yy + 0.02, -2.2, 1.2)
# （第三版：窗玻璃拿掉——鏡頭斜看時玻璃把室內反射成一整片灰藍，窗外的街看不到）
sn = img_mat('cy_street', street_night_tex(os.path.join(TMP, 'street_night.png'), W=3600), emit=0.75, rough=1.0)   # 第三版 1.6 → 0.9（晚上，第二版亮得像白天）；第五版 0.75
q = uvquad('cy_street', (X0 - 8.0, -2.3, -30.0), (X0 - 8.0, -2.3, 8.0), (X0 - 8.0, 8.3, 8.0), (X0 - 8.0, 8.3, -30.0), sn); q.visible_shadow = False   # 第四版：往後延長（鏡頭斜看窗外，視線超出第三版的範圍，看到的是天空底色）
# 第五版：對面的街放到 8 m 外、照真的比例（38×10.6 m：店面 4～7 m 寬、一樓 3 m 高、地面在 y 0）；第四版 4 m 外、18×4.6 m，店面像模型一樣小，從窗戶看一整塊一整塊
# 對面的座位：一張桌子、兩張木椅（後面那張是學姊的位子，人物疊上去）；前景：自己這邊的桌面、菜單、水杯、筷子筒
TZ0, TZ1, TY = -1.5, -0.3, 0.72
acc('table').box(-0.75, 0.75, TY - 0.04, TY, TZ0, TZ1)
for xx in (-0.68, 0.68):
    for zz in (TZ0 + 0.07, TZ1 - 0.07): acc('wood').box(xx - 0.025, xx + 0.025, 0.0, TY - 0.04, zz - 0.025, zz + 0.025)
for xx in (-0.35, 0.35):                                                                   # 對面的兩張椅子（靠背在人物後面，被立繪擋住一部分）
    acc('wood').box(xx - 0.21, xx + 0.21, 0.44, 0.47, TZ0 - 0.45, TZ0 - 0.05)
    acc('wood').box(xx - 0.21, xx + 0.21, 0.47, 0.92, TZ0 - 0.47, TZ0 - 0.43)
    for x2 in (xx - 0.18, xx + 0.18):
        for z2 in (TZ0 - 0.43, TZ0 - 0.08): acc('wood').box(x2 - 0.02, x2 + 0.02, 0.0, 0.44, z2 - 0.02, z2 + 0.02)
pm = img_mat('cy_papermenu', paper_menu_tex(os.path.join(TMP, 'papermenu.png')), rough=0.7)
uvquad('cy_menu_a', (-0.55, TY + 0.002, -0.35), (-0.15, TY + 0.002, -0.35), (-0.15, TY + 0.002, -0.92), (-0.55, TY + 0.002, -0.92), pm)   # 自己這邊攤開的菜單
uvquad('cy_menu_b', (0.12, TY + 0.003, -1.05), (0.42, TY + 0.003, -1.05), (0.42, TY + 0.003, -1.45), (0.12, TY + 0.003, -1.45), pm)     # 對面那份（學姊在看）
for xx, zz in ((0.32, -0.55), (-0.30, -1.25)):
    Mesh('cy_cup%.1f' % xx, M['cup']).cyl((xx, TY, zz), (xx, TY + 0.11, zz), 0.035, seg=16, r2=0.04).finish(parent=root, smooth=True)
Mesh('cy_chopholder', M['wood']).cyl((0.55, TY, -0.95), (0.55, TY + 0.13, -0.95), 0.04, seg=14).finish(parent=root, smooth=True)
for k in range(6):
    a = 2 * math.pi * k / 6; Mesh('cy_chop%d' % k, M['chop']).cyl((0.55 + 0.018 * math.cos(a), TY + 0.05, -0.95 + 0.018 * math.sin(a)), (0.55 + 0.024 * math.cos(a), TY + 0.24, -0.95 + 0.024 * math.sin(a)), 0.004, seg=6).finish(parent=root)
Mesh('cy_spoons', M['steel']).cyl((-0.62, TY, -1.35), (-0.62, TY + 0.09, -1.35), 0.035, seg=14).finish(parent=root, smooth=True)
# 吊燈：桌子上一盞、後面兩盞（布燈罩，暖色）
for (lx, lz, k) in ((0.0, -0.9, 1.0), (-1.7, -1.9, 0.8), (1.6, 0.3, 0.8)):
    Mesh('cy_cord%.1f' % lx, M['dark']).cyl((lx, H, lz), (lx, 1.75, lz), 0.004, seg=6).finish(parent=root)
    Mesh('cy_lamp%.1f' % lx, M['shade']).cyl((lx, 1.75, lz), (lx, 1.58, lz), 0.07, seg=24, r2=0.17, caps=False).finish(parent=root, smooth=True)
    point('lamp%.1f' % lx, lx, 1.62, lz, 60 * k, r=0.06)

for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.12, 0.13, 0.18, 1); bg.inputs[1].default_value = 0.3
fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 40; fill.color = (1.0, 0.86, 0.68); fill.size = 2.0
fo = bpy.data.objects.new('fill', fill); fo.location = g2b(0.0, 2.6, 0.6); sc.collection.objects.link(fo); fo.rotation_euler = (g2b(0, 0, -1.2) - g2b(0, 2.6, 0.6)).to_track_quat('-Z', 'Y').to_euler()
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye = tuple(map(float, opt('--eye', '0.30,1.20,1.15').split(','))); look = tuple(map(float, opt('--look', '-0.20,1.06,-2.6').split(',')))   # 第二版：往後拉、廣一點（第一版只拍到後牆，窗和香料架都在畫面外）
cam.data.lens = float(opt('--lens', '20')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('saved', OUT)
