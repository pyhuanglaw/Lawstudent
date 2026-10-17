"""2D 背景：公館・二輪戲院的大廳（BG-19，key gongguan_cinema；事件 ev_zhiruo_early_show「東京物語的早場」：週六 10:00，看完去豆漿店）。LAWWW2-C 2026-10-17。
虛構的戲院（D77：不放店名、標誌、真實電影的海報；參考台北二輪戲院常見的樣子：老大樓的一樓大廳、售票口、場次板、海報牆、往樓上影廳的樓梯）：
  - 左邊：售票口（玻璃窗、對講孔、找錢的凹槽，窗後亮著一盞桌燈），上面是場次板（只有時間；片名是看不清楚的線），旁邊一張票價表（「一票兩片」）；
  - 右邊：海報牆（五張虛構的海報：海、電車、雨傘、老屋和月亮、腳踏車；每張上面一盞小投射燈），下面一張紅色人造皮長椅；
  - 後面：右半邊往二樓影廳的樓梯（銅扶手、地毯），樓梯口紅色絨繩和兩支銅柱；左半邊賣爆米花和飲料的櫃台（爆米花機亮著）、上面的價目燈箱；
  - 上午十點：陽光從身後的大門照進來，地上一塊亮的；天花板是老的輕鋼架＋日光燈。
畫面上沒有人（人物用 ADV 立繪疊上去），中間留給人物站。
  /opt/blenv/bin/python tools/blender/env_second/bg_cinema.py -- <輸出.png> [--res 1920x1080] [--samples 96]
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
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_cinema_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(1019)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.4'))
try: sc.view_settings.look = opt('--look', 'AgX - Base Contrast')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
root = B.group('cinema')


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


def area_light(name, x, y, z, w, d, power, col=(1.0, 0.95, 0.86), aim=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    if aim is not None: ob.rotation_euler = (g2b(*aim) - g2b(x, y, z)).to_track_quat('-Z', 'Y').to_euler()
    return ob


def spot(name, x, y, z, aim, power, size=0.6, col=(1.0, 0.9, 0.76)):
    l = bpy.data.lights.new(name, 'SPOT'); l.energy = power; l.color = col; l.spot_size = size; l.spot_blend = 0.6; l.shadow_soft_size = 0.03
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    ob.rotation_euler = (g2b(*aim) - g2b(x, y, z)).to_track_quat('-Z', 'Y').to_euler(); return ob


# ---------------- 貼圖（PIL）----------------
def text_center(d, box, txt, f, fill):
    x0, y0, x1, y1 = box; w = d.textlength(txt, font=f); bb = f.getbbox(txt)
    d.text((x0 + (x1 - x0 - w) / 2, y0 + (y1 - y0 - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=fill)


def showtime_tex(path, W=1300, H=460):
    """場次板：黑底、橘色的時間（看得清楚）、片名是白色看不清楚的線（不放真實電影名）"""
    im = Image.new('RGB', (W, H), (14, 14, 16)); d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(FONT, 54); f2 = ImageFont.truetype(FONT, 62)
    text_center(d, (0, 10, W, 90), '今 日 放 映', f1, (238, 200, 120))
    d.line([(40, 100), (W - 40, 100)], fill=(120, 96, 60), width=3)
    times = [('10:00', '12:20'), ('14:40', '17:00'), ('19:30', '21:50')]
    for k, (ta, tb) in enumerate(times):
        y = 130 + k * 106
        for j, t in enumerate((ta, tb)):
            x = 60 + j * 630
            d.text((x, y), t, font=f2, fill=(255, 150, 60))
            for q in range(2):                                     # 片名：兩條看不清楚的白線
                ww = rng.randint(220, 330); d.rounded_rectangle([x + 210, y + 12 + q * 34, x + 210 + ww, y + 30 + q * 34], 8, fill=(226, 224, 218))
    im = im.filter(ImageFilter.GaussianBlur(1.2)); im.save(path); return path


def price_tex(path, W=420, H=600):
    im = Image.new('RGB', (W, H), (246, 240, 226)); d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(FONT, 64); f2 = ImageFont.truetype(FONT, 46)
    d.rectangle([0, 0, W, 120], fill=(150, 34, 36)); text_center(d, (0, 0, W, 120), '一票兩片', f1, (252, 244, 228))
    for k, (a, b) in enumerate((('全票', '130'), ('學生', '110'), ('早場', '100'))):
        y = 160 + k * 120; d.text((50, y), a, font=f2, fill=(40, 36, 34)); d.text((260, y), b, font=f2, fill=(40, 36, 34))
        d.line([(40, y + 82), (W - 40, y + 82)], fill=(200, 190, 170), width=2)
    im = im.filter(ImageFilter.GaussianBlur(0.8)); im.save(path); return path


def menu_tex(path, W=1400, H=380):
    im = Image.new('RGB', (W, H), (52, 34, 26)); d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(FONT, 84); f2 = ImageFont.truetype(FONT, 56)
    items = (('爆米花', '60'), ('熱狗', '45'), ('汽水', '30'), ('咖啡', '40'))
    for k, (a, b) in enumerate(items):
        x = 40 + k * 340; d.rounded_rectangle([x, 40, x + 300, 340], 22, fill=(250, 226, 160) if k == 0 else (236, 228, 212))
        text_center(d, (x, 70, x + 300, 200), a, f1 if len(a) < 3 else f2, (110, 40, 30)); text_center(d, (x, 220, x + 300, 320), b, f1, (60, 40, 30))
    im = im.filter(ImageFilter.GaussianBlur(1.0)); im.save(path); return path


def stair_sign_tex(path, W=700, H=200):
    im = Image.new('RGB', (W, H), (30, 32, 36)); d = ImageDraw.Draw(im); f = ImageFont.truetype(FONT, 92)
    text_center(d, (0, 0, W, H), '影廳 2F ↑', f, (244, 236, 220)); im.save(path); return path


def poster_tex(path, kind, W=560, H=800):
    """虛構的海報（不放真實電影）。第二版（LAWWW2-C 2026-10-17 精修：第一版只有大色面＋一兩個形，在畫面上是幾塊暗灰）：
    有層次的插畫（天空漸層、遠中近景、光）、白邊、紙張泛黃、邊角磨損；片名是看不清楚的筆刷字形，下面兩三行演職員（細線）"""
    r = random.Random(sum(map(ord, kind))); im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    def grad(c0, c1, y0=0, y1=H, x0=0, x1=W):
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0 - 1); d.line([(x0, y), (x1, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(c0, c1)))
    def blob(cx, cy, rx, ry, col, n=1):
        for _ in range(n):
            ox, oy = r.uniform(-rx * 0.3, rx * 0.3), r.uniform(-ry * 0.3, ry * 0.3); d.ellipse([cx + ox - rx, cy + oy - ry, cx + ox + rx, cy + oy + ry], fill=col)
    if kind == 'sea':        # 夏天的海：夕陽、地平線、浪、站在淺水裡的人影、海鷗
        grad((246, 196, 150), (250, 226, 196), 0, 300); grad((250, 226, 196), (190, 210, 222), 300, 430)
        d.ellipse([330, 250, 430, 350], fill=(255, 238, 210))
        grad((96, 150, 178), (40, 86, 118), 430, H)
        for y in range(440, 640, 9): d.line([(0, y), (W, y + r.randint(-3, 3))], fill=(120, 170, 196), width=2)
        for k in range(26):                                                                       # 夕陽倒影：一條條閃光
            y = 436 + k * 8; hw = 18 + k * 3.2 + r.uniform(-6, 6); cx = 380 + r.uniform(-8, 8); d.line([(cx - hw, y), (cx + hw, y)], fill=(244, 214, 176), width=3)
        d.rectangle([258, 470, 270, 560], fill=(36, 34, 44)); d.ellipse([252, 448, 276, 474], fill=(36, 34, 44)); d.polygon([(262, 480), (238, 530), (246, 534), (266, 490)], fill=(36, 34, 44))
        for k in range(5): x, y = r.randint(60, 500), r.randint(80, 240); d.arc([x, y, x + 22, y + 12], 200, 340, fill=(80, 70, 80), width=3); d.arc([x + 20, y, x + 42, y + 12], 200, 340, fill=(80, 70, 80), width=3)
    elif kind == 'train':    # 黃昏的電車：架空線、亮著的車窗、月台上的人
        grad((252, 196, 140), (150, 96, 120), 0, 380); grad((150, 96, 120), (60, 44, 70), 380, H)
        for k in range(4): d.line([(0, 120 + k * 22), (W, 160 + k * 14)], fill=(70, 50, 70), width=2)
        for x in (90, 300, 510): d.line([(x, 100), (x - 6, 470)], fill=(50, 36, 54), width=6)
        d.rounded_rectangle([20, 360, 540, 500], 18, fill=(214, 222, 210)); d.rectangle([20, 440, 540, 470], fill=(70, 120, 92))
        for x in range(46, 520, 64): d.rounded_rectangle([x, 378, x + 46, 430], 6, fill=(255, 224, 150))
        d.rectangle([0, 500, W, 530], fill=(56, 46, 56)); d.rectangle([0, 530, W, H], fill=(92, 80, 90))
        d.rectangle([420, 540, 432, 620], fill=(30, 26, 34)); d.ellipse([414, 518, 438, 544], fill=(30, 26, 34))
    elif kind == 'umbrella': # 下雨的夜晚街道：紅傘的背影、濕地上的反光、散景
        grad((40, 52, 80), (70, 84, 110), 0, 520); grad((50, 58, 80), (30, 34, 50), 520, H)
        for k in range(28):
            x, y, rr_ = r.randint(0, W), r.randint(120, 480), r.randint(12, 34); c = r.choice([(250, 200, 120), (240, 150, 110), (150, 200, 240), (250, 240, 200)])
            d.ellipse([x - rr_, y - rr_, x + rr_, y + rr_], fill=tuple(int(v * 0.75) for v in c))
            d.rectangle([x - 3, 540, x + 3, 540 + r.randint(40, 160)], fill=tuple(int(v * 0.5) for v in c))   # 濕地上的光
        for k in range(220): x = r.randint(0, W); y = r.randint(0, H); d.line([(x, y), (x - 5, y + 24)], fill=(160, 180, 200), width=1)
        d.pieslice([170, 300, 430, 520], 180, 360, fill=(206, 56, 52)); d.line([(300, 410), (300, 560)], fill=(30, 24, 28), width=6)
        d.rectangle([272, 420, 330, 600], fill=(34, 32, 42)); d.ellipse([280, 390, 322, 430], fill=(34, 32, 42))
    elif kind == 'house':    # 月夜的老屋：瓦屋頂、亮著的窗、屋簷上的貓、樹的剪影
        grad((20, 28, 56), (64, 66, 100), 0, H)
        for k in range(60): x, y = r.randint(0, W), r.randint(0, 300); d.point((x, y), fill=(220, 220, 240))
        d.ellipse([370, 80, 470, 180], fill=(250, 240, 206)); d.ellipse([350, 60, 490, 200], outline=(120, 120, 150), width=2)
        blob(80, 420, 110, 120, (24, 30, 36), 4)
        d.polygon([(60, 470), (280, 330), (500, 470)], fill=(40, 36, 44)); d.rectangle([100, 470, 460, 660], fill=(58, 46, 40))
        for y in range(350, 470, 14): d.line([(280 - (y - 330) * 1.55, y), (280 + (y - 330) * 1.55, y)], fill=(52, 46, 54), width=2)   # 瓦片的線
        d.rectangle([230, 520, 330, 610], fill=(255, 206, 120)); d.line([(280, 520), (280, 610)], fill=(120, 80, 50), width=3)
        d.ellipse([340, 330, 372, 352], fill=(20, 18, 24)); d.polygon([(344, 334), (350, 318), (356, 334)], fill=(20, 18, 24)); d.polygon([(358, 334), (364, 318), (368, 334)], fill=(20, 18, 24))
    else:                    # 夏天的腳踏車：稻田、雲、騎車的人
        grad((140, 196, 236), (230, 236, 220), 0, 420)
        for cx, cy in ((140, 140), (420, 190), (280, 90)): blob(cx, cy, 80, 34, (250, 250, 246), 4)
        grad((150, 196, 96), (96, 150, 70), 420, H)
        for y in range(440, H, 18): d.line([(0, y), (W, y)], fill=(130, 180, 84), width=2)
        d.rectangle([0, 520, W, 548], fill=(214, 200, 168))
        for cx in (230, 350): d.ellipse([cx - 52, 470, cx + 52, 574], outline=(40, 36, 34), width=7)
        d.line([(230, 522), (290, 476), (350, 522)], fill=(40, 36, 34), width=7); d.line([(290, 476), (300, 446)], fill=(40, 36, 34), width=7)
        d.polygon([(270, 370), (300, 370), (310, 450), (280, 460)], fill=(244, 244, 238)); d.ellipse([272, 330, 304, 366], fill=(40, 30, 26))
    # 片名（筆刷感的看不清楚的字形）＋演職員（細線）
    light = kind in ('house', 'umbrella', 'train')
    tc = (250, 246, 236) if light else (40, 34, 30)
    x = 70
    while x < W - 100:                                                                            # 每個「字」幾筆粗筆畫（橫、豎、撇、點），遠看像片名、看不出是什麼字
        w_ = r.randint(40, 58); y0, y1 = 650, 702
        for _ in range(r.randint(3, 5)):
            kind_ = r.random()
            if kind_ < 0.35: yy = r.randint(y0 + 4, y1 - 4); d.line([(x + r.randint(0, 8), yy), (x + w_ - r.randint(0, 8), yy + r.randint(-3, 3))], fill=tc, width=7)
            elif kind_ < 0.65: xx = r.randint(x + 6, x + w_ - 6); d.line([(xx, y0 + r.randint(0, 8)), (xx + r.randint(-4, 4), y1 - r.randint(0, 8))], fill=tc, width=7)
            elif kind_ < 0.85: d.line([(x + w_ * 0.6, y0 + 6), (x + 4, y1 - 4)], fill=tc, width=7)
            else: cx_, cy_ = x + r.randint(10, w_ - 10), r.randint(y0 + 10, y1 - 10); d.ellipse([cx_ - 5, cy_ - 5, cx_ + 5, cy_ + 5], fill=tc)
        x += w_ + r.randint(12, 20)
    for k in range(3): d.rectangle([90, 718 + k * 16, W - 90 - r.randint(0, 140), 724 + k * 16], fill=(210, 204, 192) if light else (80, 70, 60))
    im = im.filter(ImageFilter.GaussianBlur(1.0))
    # 紙：白邊、泛黃、邊角磨損
    out = Image.new('RGB', (W, H), (240, 232, 214)); out.paste(im.resize((W - 36, H - 36)), (18, 18))
    od = ImageDraw.Draw(out)
    for _ in range(14):                                                                           # 邊角磨損：不規則的小缺口（四個角多一點）
        cx_, cy_ = r.choice([(r.randint(0, 40), r.randint(0, 40)), (r.randint(W - 40, W), r.randint(0, 40)), (r.randint(0, 40), r.randint(H - 40, H)), (r.randint(W - 40, W), r.randint(H - 40, H)), (r.choice([0, W]), r.randint(0, H))])
        pts = [(cx_ + math.cos(a_) * r.uniform(3, 9), cy_ + math.sin(a_) * r.uniform(3, 9)) for a_ in [k * 0.9 for k in range(7)]]; od.polygon(pts, fill=(222, 208, 180))
    yl = Image.new('RGB', (W, H), (226, 200, 140)); out = Image.blend(out, yl, 0.12)
    out.save(path); return path


def street_tex(path, W=1600, H=900):
    """門外的騎樓與街（上午、很亮、模糊）：看到的只有門的玻璃裡一點點"""
    im = Image.new('RGB', (W, H), (236, 232, 222)); d = ImageDraw.Draw(im)
    for y in range(H): t = y / H; d.line([(0, y), (W, y)], fill=(int(244 - 30 * t), int(240 - 30 * t), int(230 - 34 * t)))
    for k in range(6): x = 120 + k * 260; d.rectangle([x, 0, x + 40, H], fill=(196, 190, 178))
    im = im.filter(ImageFilter.GaussianBlur(10)); im.save(path); return path


def popcorn_tex(path, W=512, H=512):
    r = random.Random(5); im = Image.new('RGB', (W, H), (236, 196, 110)); d = ImageDraw.Draw(im)
    for k in range(1600):
        x = r.randint(0, W); y = r.randint(int(H * 0.35), H); rr = r.randint(6, 14); c = r.randint(220, 255)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(c, int(c * 0.88), int(c * 0.62)))
    im = im.filter(ImageFilter.GaussianBlur(1.2)); im.save(path); return path


# ---------------- 材質 ----------------
M = {
    'terrazzo': L.pbr('cn_terrazzo', 'terrazzo_tiles', tile=1.2, target='#a2998a', normal=0.2, maps=('diff', 'nor', 'rough')),
    'carpet': L.pbr('cn_carpet', 'dirty_carpet', tile=1.2, target='#6e2628', normal=0.45, maps=('diff', 'nor', 'rough')),
    'plaster': L.pbr('cn_plaster', 'painted_plaster_wall', tile=2.4, target='#e7dccb', normal=0.15, maps=('diff', 'nor')),
    'wood': L.pbr('cn_wood', 'walnut_veneer', tile=1.2, target='#5e3e2a', normal=0.25, maps=('diff', 'nor'), rough_value=0.45),
    'wood_l': L.pbr('cn_wood_l', 'walnut_veneer', tile=1.2, target='#8a6444', normal=0.25, maps=('diff', 'nor'), rough_value=0.5),
    'ceil': L.flat('cn_ceil', '#e9e5dc', rough=0.9), 'grid': L.flat('cn_grid', '#cfccc4', rough=0.5, metal=0.2),
    'lamp': L.flat('cn_lamp', '#ffffff', rough=0.3, emit=B.srgb('#fff4e2')),
    'brass': L.flat('cn_brass', '#b8954e', rough=0.28, metal=0.45), 'alu': L.flat('cn_alu', '#a9acae', rough=0.35, metal=0.4),
    'glass': L.flat('cn_glass', '#9fb0b8', rough=0.04, alpha=0.04),   # 第五版 0.12 → 0.04、顏色調暗：售票口右邊（遠的）那扇窗原本蓋著一層白霧
    'dark': L.flat('cn_dark', '#1e1d1f', rough=0.6),
    'black': L.flat('cn_black', '#121214', rough=0.4), 'vinyl': L.flat('cn_vinyl', '#8e2a2a', rough=0.35),
    'rope': L.flat('cn_rope', '#7a1c22', rough=0.8), 'booth_in': L.flat('cn_booth_in', '#3a302a', rough=0.8),
    'cream': L.flat('cn_cream', '#efe6d4', rough=0.6), 'chair': L.flat('cn_chair', '#3c3e46', rough=0.7), 'warm': L.flat('cn_warm', '#ffd9a0', rough=0.5, emit=B.srgb('#ffc880')),
    'fridge': L.flat('cn_fridge', '#d8eef4', rough=0.2, emit=B.srgb('#a8d0e0')),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('cn_' + k, M[k])
    return _acc[k]


X0, X1, ZF, ZB, H = -4.2, 4.2, 1.8, -11.0, 3.3
# 地板：磨石子；往樓梯的一條紅地毯（離地 8 mm）
acc('terrazzo').quad([(X0, 0.0, ZF), (X1, 0.0, ZF), (X1, 0.0, ZB), (X0, 0.0, ZB)])
acc('carpet').box(0.75, 3.45, 0.0, 0.008, -8.6, -3.2)
# 天花板：輕鋼架＋日光燈
acc('ceil').quad([(X0, H, ZF), (X1, H, ZF), (X1, H, ZB), (X0, H, ZB)][::-1])
x = X0
while x <= X1 + 1e-6: acc('grid').box(x - 0.012, x + 0.012, H - 0.015, H, ZB, ZF); x += 0.6
z = ZF
while z >= ZB - 1e-6: acc('grid').box(X0, X1, H - 0.015, H, z - 0.012, z + 0.012); z -= 0.6
for lx, lz in ((-2.1, -0.6), (2.1, -0.6), (-2.1, -4.2), (2.1, -4.2), (-2.1, -7.8), (2.1, -7.8)):
    acc('lamp').box(lx - 0.29, lx + 0.29, H - 0.022, H - 0.016, lz - 0.59, lz + 0.59)
    area_light('ceil_%.1f_%.1f' % (lx, lz), lx, H - 0.03, lz, 0.58, 1.18, 40, col=(1.0, 0.95, 0.86))

# ---- 左牆：售票口 ----
acc('plaster').quad([(X0, 0.0, ZB), (X0, 0.0, ZF), (X0, H, ZF), (X0, H, ZB)])
acc('wood').box(X0, X0 + 0.025, 0.0, 1.0, -1.7, ZF - 0.2)                          # 入口到售票口之間的牆裙
BX = X0 + 1.35; BZ0, BZ1 = -4.7, -1.8                                                # 售票亭往大廳凸出 1.35 m
acc('wood').box(BX - 0.02, BX + 0.02, 0.0, 1.02, BZ0, BZ1)                            # 正面下半：木作
acc('wood_l').box(BX - 0.02, BX + 0.16, 1.02, 1.07, BZ0, BZ1)                         # 窗前的檯面（往外凸）
acc('wood').box(X0 + 0.025, BX - 0.02, 0.0, 1.07, BZ1 - 0.02, BZ1 + 0.02)            # 側面（靠入口那一面）
acc('plaster').box(X0 + 0.025, BX + 0.02, 2.22, H - 0.02, BZ1 - 0.02, BZ1 + 0.02)
acc('plaster').box(BX - 0.02, BX + 0.02, 2.22, H - 0.02, BZ0, BZ1 - 0.02)             # 窗上面的牆（場次板掛在這）
for zz in (BZ0 + 0.02, (BZ0 + BZ1) / 2, BZ1 - 0.02):                                  # 窗框（鋁）
    acc('alu').box(BX - 0.03, BX + 0.03, 1.07, 2.22, zz - 0.025, zz + 0.025)
acc('alu').box(BX - 0.03, BX + 0.03, 2.18, 2.22, BZ0, BZ1); acc('alu').box(BX - 0.03, BX + 0.03, 1.07, 1.10, BZ0, BZ1)
acc('glass').quad([(BX, 1.10, BZ1 - 0.04), (BX, 1.10, BZ0 + 0.04), (BX, 2.18, BZ0 + 0.04), (BX, 2.18, BZ1 - 0.04)])
for zc in ((BZ0 + BZ1) / 2 - 0.7, (BZ0 + BZ1) / 2 + 0.7):                            # 兩個售票窗：對講孔（深色圓）＋找錢的凹槽
    Mesh('cn_talk%.1f' % zc, M['dark']).cyl((BX + 0.002, 1.55, zc), (BX + 0.012, 1.55, zc), 0.07, seg=20).finish(parent=root)
    acc('dark').box(BX + 0.04, BX + 0.16, 1.04, 1.072, zc - 0.20, zc + 0.20)
acc('booth_in').box(X0 + 0.03, X0 + 0.06, 0.0, 2.2, BZ0 + 0.03, BZ1 - 0.06)            # 亭子裡的後牆（第二版：第一版整個亭子是實心的方塊，窗後面擋住，看起來是兩片灰板）
acc('booth_in').box(X0 + 0.06, BX - 0.06, 2.16, 2.2, BZ0 + 0.03, BZ1 - 0.06)          # 亭子的天花板
for zz in (BZ0 + 0.06, BZ1 - 0.09): acc('booth_in').box(X0 + 0.06, BX - 0.06, 0.0, 2.16, zz - 0.03, zz)   # 兩側
for yy in (1.45, 1.80): acc('wood_l').box(X0 + 0.06, X0 + 0.32, yy, yy + 0.025, BZ0 + 0.2, BZ1 - 0.25)   # 後牆的層架：票卷、文件夾
for k in range(7):
    zz = BZ0 + 0.35 + k * 0.32; acc('cream' if k % 2 else 'vinyl').box(X0 + 0.08, X0 + 0.28, 1.475, 1.475 + rng.uniform(0.14, 0.26), zz, zz + rng.uniform(0.05, 0.12))
acc('dark').box(BX - 0.55, BX - 0.25, 1.0, 1.16, -2.55, -2.25)                        # 售票機（印票的小機器）
acc('wood_l').box(BX - 0.65, BX - 0.10, 0.95, 1.0, BZ0 + 0.3, BZ1 - 0.3)             # 裡面的桌子
Mesh('cn_desklamp', M['warm']).cyl((BX - 0.45, 1.30, -3.4), (BX - 0.45, 1.36, -3.4), 0.09, seg=16, r2=0.05).finish(parent=root)
area_light('booth_lamp', BX - 0.45, 1.25, -3.4, 0.25, 0.25, 6, col=(1.0, 0.78, 0.5), aim=(BX - 0.45, 0.9, -3.4))
area_light('booth_ceil', BX - 0.6, 2.1, -2.5, 0.6, 0.6, 22, col=(1.0, 0.92, 0.8), aim=(BX - 0.6, 0.5, -2.5))
# 第五版：亭子裡遠的那一半（畫面右邊那扇窗）原本只有層架，窗看起來是一片灰——加月曆、小電扇、零錢盤、椅背
cal = img_mat('cn_cal', price_tex(os.path.join(TMP, 'cal.png'), W=300, H=420), rough=0.7)
uvquad('cn_cal', (X0 + 0.062, 1.25, -3.75), (X0 + 0.062, 1.25, -4.15), (X0 + 0.062, 1.8, -4.15), (X0 + 0.062, 1.8, -3.75), cal)
acc('cream').box(BX - 0.62, BX - 0.42, 1.0, 1.02, -3.95, -3.7)                           # 零錢盤
# 小電扇（第五版第二次：第一次的扇頭是一個白色實心圓柱，看起來浮在半空）：底座、立桿、馬達、三片扇葉、一圈護網，朝窗戶
FX, FY, FZ = BX - 0.3, 1.32, -4.35
Mesh('cn_fan_base', M['dark']).cyl((FX, 1.0, FZ), (FX, 1.025, FZ), 0.075, seg=18).finish(parent=root, smooth=True)
Mesh('cn_fan_pole', M['dark']).cyl((FX - 0.06, 1.025, FZ), (FX - 0.06, FY - 0.04, FZ), 0.011, seg=8).finish(parent=root)
Mesh('cn_fan_motor', M['cream']).cyl((FX - 0.11, FY, FZ), (FX - 0.03, FY, FZ), 0.045, seg=16, r2=0.035).finish(parent=root, smooth=True)
fb = Mesh('cn_fan_blades', M['cream'])
for k in range(3):
    a_ = 2 * math.pi * k / 3 + 0.4; fb.cyl((FX - 0.005, FY + 0.055 * math.sin(a_), FZ + 0.055 * math.cos(a_)), (FX + 0.001, FY + 0.055 * math.sin(a_), FZ + 0.055 * math.cos(a_)), 0.045, seg=14)
fb.cyl((FX - 0.02, FY, FZ), (FX + 0.008, FY, FZ), 0.018, seg=12); fb.finish(parent=root)
fg = Mesh('cn_fan_guard', M['alu'])
for xg in (FX - 0.02, FX + 0.02):                                                         # 前後兩圈護網＋前面的幾條輻條
    pts = [(xg, FY + 0.115 * math.sin(2 * math.pi * k / 20), FZ + 0.115 * math.cos(2 * math.pi * k / 20)) for k in range(21)]
    for p0, p1 in zip(pts[:-1], pts[1:]): fg.cyl(p0, p1, 0.0035, seg=5)
for k in range(8):
    a_ = 2 * math.pi * k / 8; fg.cyl((FX + 0.024, FY, FZ), (FX + 0.02, FY + 0.115 * math.sin(a_), FZ + 0.115 * math.cos(a_)), 0.0025, seg=4)
fg.finish(parent=root)
# 椅背（第五版第二次：原本一塊鮮紅的方塊）：深灰的辦公椅，圓角、低一點
Mesh('cn_chair', M['chair']).rbox(X0 + 0.50, X0 + 0.92, 0.72, 1.16, -4.03, -3.95, r=0.035, seg=2).finish(parent=root, smooth=True)
Mesh('cn_chair_post', M['dark']).cyl((X0 + 0.71, 0.45, -3.99), (X0 + 0.71, 0.72, -3.99), 0.015, seg=8).finish(parent=root)
area_light('booth_ceil2', BX - 0.6, 2.1, -4.0, 0.5, 0.5, 12, col=(1.0, 0.92, 0.8), aim=(BX - 0.6, 0.5, -4.0))   # 亭子遠的那一半也有燈（月曆看得到）
st = img_mat('cn_showtime', showtime_tex(os.path.join(TMP, 'showtime.png')), emit=1.3, rough=0.4)   # 場次板（窗上面）
acc('black').box(BX + 0.02, BX + 0.08, 2.32, 3.12, BZ0 + 0.1, BZ1 - 0.1)
uvquad('cn_showtime', (BX + 0.082, 2.36, BZ1 - 0.14), (BX + 0.082, 2.36, BZ0 + 0.14), (BX + 0.082, 3.08, BZ0 + 0.14), (BX + 0.082, 3.08, BZ1 - 0.14), st)
pm = img_mat('cn_price', price_tex(os.path.join(TMP, 'price.png')), rough=0.6)          # 票價表（售票口旁邊的牆上）
acc('wood').box(X0 + 0.02, X0 + 0.05, 1.18, 2.08, BZ0 - 0.95, BZ0 - 0.30)
uvquad('cn_price', (X0 + 0.052, 1.21, BZ0 - 0.33), (X0 + 0.052, 1.21, BZ0 - 0.92), (X0 + 0.052, 2.05, BZ0 - 0.92), (X0 + 0.052, 2.05, BZ0 - 0.33), pm)
acc('wood').box(X0, X0 + 0.025, 0.0, 1.0, ZB + 0.02, BZ0)                            # 售票口後面的牆裙

# ---- 右牆：海報牆＋長椅 ----
acc('plaster').quad([(X1, 0.0, ZF), (X1, 0.0, ZB), (X1, H, ZB), (X1, H, ZF)])
acc('wood').box(X1 - 0.025, X1, 0.0, 1.0, ZB + 0.02, ZF - 0.2)
for k, kind in enumerate(('sea', 'train', 'umbrella', 'house', 'bike')):
    zc = -0.9 - k * 1.55
    acc('black').box(X1 - 0.05, X1 - 0.02, 1.12, 2.30, zc - 0.43, zc + 0.43)          # 黑色的框
    pt = img_mat('cn_poster_' + kind, poster_tex(os.path.join(TMP, 'poster_%s.png' % kind), kind), rough=0.5)
    uvquad('cn_poster_' + kind, (X1 - 0.052, 1.16, zc + 0.39), (X1 - 0.052, 1.16, zc - 0.39), (X1 - 0.052, 2.26, zc - 0.39), (X1 - 0.052, 2.26, zc + 0.39), pt)
    acc('glass').quad([(X1 - 0.056, 1.14, zc + 0.41), (X1 - 0.056, 1.14, zc - 0.41), (X1 - 0.056, 2.28, zc - 0.41), (X1 - 0.056, 2.28, zc + 0.41)])
    Mesh('cn_spot%d' % k, M['black']).cyl((X1 - 0.02, 2.62, zc), (X1 - 0.24, 2.52, zc), 0.035, seg=12, r2=0.05).finish(parent=root)   # 小投射燈
    spot('spot%d' % k, X1 - 0.26, 2.50, zc, (X1, 1.7, zc), 40, size=0.9)
acc('vinyl').rbox(X1 - 0.50, X1 - 0.06, 0.40, 0.48, -5.6, -2.2, r=0.03)               # 紅色人造皮長椅（坐墊、靠背）
acc('vinyl').rbox(X1 - 0.16, X1 - 0.06, 0.48, 0.92, -5.6, -2.2, r=0.03)
for zz in (-5.45, -2.35):
    acc('alu').box(X1 - 0.46, X1 - 0.42, 0.0, 0.40, zz - 0.02, zz + 0.02); acc('alu').box(X1 - 0.12, X1 - 0.08, 0.0, 0.40, zz - 0.02, zz + 0.02)

# ---- 後面：右半邊往二樓的樓梯、左半邊的賣店 ----
acc('plaster').quad([(X0, 0.0, ZB), (X1, 0.0, ZB), (X1, H, ZB), (X0, H, ZB)][::-1])
SX0, SX1 = 0.6, 3.6; NST, TR, RI = 9, 0.27, 0.165
for i in range(NST):                                                                # 樓梯：九階往後上，最上面是平台（轉角往左上二樓）
    z1 = -8.6 - i * TR; z0 = z1 - TR; y = (i + 1) * RI
    acc('carpet').box(SX0, SX1, y - RI, y, z0, z1 - 0.004)
    acc('brass').box(SX0, SX1, y - 0.012, y + 0.002, z1 - 0.03, z1 - 0.004)          # 踏面前緣的銅條
zl = -8.6 - NST * TR
acc('carpet').box(SX0, SX1, 0.0, NST * RI, ZB + 0.02, zl)                            # 平台
acc('plaster').box(SX0 - 0.10, SX0, 0.0, H, ZB, -8.55)                                # 樓梯左邊的矮牆＋柱（擋住後面）
acc('plaster').box(SX1, SX1 + 0.10, 0.0, H, ZB, -8.55)
acc('plaster').box(SX0 + 0.05, SX1 - 0.05, NST * RI, H, ZB + 0.005, ZB + 0.03)       # 平台後面的牆（第二版：第一版是一塊純黑）
acc('wood').box(SX0 + 0.05, SX1 - 0.05, NST * RI, NST * RI + 0.9, ZB + 0.03, ZB + 0.05)
Mesh('cn_sconce', M['warm']).sphere((2.1, NST * RI + 1.75, ZB + 0.12), 0.11, seg=16, rings=10, sy=0.7).finish(parent=root, smooth=True)   # 平台上的壁燈
area_light('landing', 2.1, NST * RI + 1.6, ZB + 0.4, 0.5, 0.5, 30, col=(1.0, 0.78, 0.5), aim=(2.1, NST * RI, ZB + 1.2))
# 驗票台（樓梯口右邊，木頭講台＋一疊票根）、垃圾桶（長椅旁）
acc('wood').rbox(3.55, 4.05, 0.0, 1.05, -8.15, -7.65, r=0.02); acc('wood_l').box(3.5, 4.1, 1.05, 1.09, -8.2, -7.6)
acc('cream').box(3.68, 3.86, 1.09, 1.13, -7.98, -7.84)
Mesh('cn_bin', M['alu']).cyl((3.85, 0.0, -1.55), (3.85, 0.62, -1.55), 0.17, seg=20).finish(parent=root, smooth=True)
Mesh('cn_bin_t', M['black']).cyl((3.85, 0.62, -1.55), (3.85, 0.66, -1.55), 0.18, seg=20).finish(parent=root, smooth=True)
for xx in (SX0 + 0.08, SX1 - 0.08):                                                  # 銅扶手（沿樓梯斜上）
    pts = [(xx, 0.92, -8.4)] + [(xx, 0.92 + (i + 1) * RI, -8.6 - (i + 0.5) * TR) for i in range(NST)] + [(xx, 0.92 + NST * RI, ZB + 0.3)]
    for a, b in zip(pts[:-1], pts[1:]): Mesh('cn_rail', M['brass']).cyl(a, b, 0.022, seg=10).finish(parent=root, smooth=True)
    for i in range(0, NST + 1, 2):
        p = pts[min(i, len(pts) - 1)]; Mesh('cn_post', M['brass']).cyl((xx, p[1] - 0.92 + (RI if i else 0), p[2]), (xx, p[1], p[2]), 0.012, seg=8).finish(parent=root)
ss = img_mat('cn_stairsign', stair_sign_tex(os.path.join(TMP, 'stair_sign.png')), emit=1.1, rough=0.4)
acc('black').box(1.35, 2.85, 2.52, 2.96, -8.52, -8.48)
uvquad('cn_stairsign', (1.40, 2.55, -8.475), (2.80, 2.55, -8.475), (2.80, 2.93, -8.475), (1.40, 2.93, -8.475), ss)
acc('plaster').box(SX0 - 0.10, SX1 + 0.10, 2.45, H, -8.55, -8.45)                     # 樓梯口上面的牆（樓梯往上鑽進去）
for xx in (0.95, 3.25):                                                              # 樓梯口的紅色絨繩＋銅柱（還沒開放進場）
    Mesh('cn_stanch', M['brass']).cyl((xx, 0.0, -8.25), (xx, 0.95, -8.25), 0.025, seg=12).finish(parent=root, smooth=True)
    Mesh('cn_stanch_b', M['brass']).cyl((xx, 0.0, -8.25), (xx, 0.03, -8.25), 0.16, seg=20).finish(parent=root, smooth=True)
    Mesh('cn_stanch_t', M['brass']).sphere((xx, 0.97, -8.25), 0.04, seg=12, rings=8).finish(parent=root, smooth=True)
rope = [(0.95 + 2.3 * t, 0.86 - 0.22 * math.sin(math.pi * t), -8.25) for t in [k / 12 for k in range(13)]]
for a, b in zip(rope[:-1], rope[1:]): Mesh('cn_rope', M['rope']).cyl(a, b, 0.018, seg=8).finish(parent=root, smooth=True)
# 賣店（左半邊）：木作底座＋玻璃展示櫃、爆米花機、飲料冰箱、價目燈箱
CZ0, CZ1 = -9.7, -8.9
acc('wood').box(-3.9, 0.1, 0.0, 0.95, CZ0, CZ1)
acc('wood_l').box(-3.95, 0.15, 0.95, 1.0, CZ0 - 0.02, CZ1 + 0.05)
acc('glass').quad([(-2.6, 1.0, CZ1), (0.05, 1.0, CZ1), (0.05, 1.32, CZ1), (-2.6, 1.32, CZ1)])
acc('cream').box(-2.6, 0.05, 1.0, 1.02, CZ0 + 0.1, CZ1 - 0.02)
pc = img_mat('cn_popcorn', popcorn_tex(os.path.join(TMP, 'popcorn.png')), emit=0.6, rough=0.7)
acc('vinyl').box(-3.8, -2.85, 1.0, 1.08, CZ0 + 0.05, CZ1 - 0.05)                     # 爆米花機：紅色底座、玻璃箱、裡面亮著
for xx in (-3.8, -2.85):
    for zz in (CZ0 + 0.05, CZ1 - 0.05): acc('vinyl').box(xx - 0.02, xx + 0.02, 1.08, 1.86, zz - 0.02, zz + 0.02)
acc('vinyl').box(-3.82, -2.83, 1.86, 1.96, CZ0 + 0.03, CZ1 - 0.03)
uvquad('cn_popcorn_f', (-3.78, 1.09, CZ1 - 0.08), (-2.87, 1.09, CZ1 - 0.08), (-2.87, 1.84, CZ1 - 0.08), (-3.78, 1.84, CZ1 - 0.08), pc)
acc('glass').quad([(-3.8, 1.08, CZ1 - 0.04), (-2.85, 1.08, CZ1 - 0.04), (-2.85, 1.86, CZ1 - 0.04), (-3.8, 1.86, CZ1 - 0.04)])
area_light('popcorn', -3.32, 1.80, CZ1 - 0.35, 0.6, 0.4, 14, col=(1.0, 0.82, 0.55), aim=(-3.32, 1.0, CZ1 - 0.35))
acc('fridge').box(-1.6, -0.4, 0.0, 1.9, ZB + 0.05, ZB + 0.12)                        # 後牆的飲料冰箱（玻璃門亮著）
acc('alu').box(-1.65, -0.35, 0.0, 1.95, ZB + 0.02, ZB + 0.05)
for yy in (0.5, 0.95, 1.4): acc('dark').box(-1.55, -0.45, yy, yy + 0.02, ZB + 0.12, ZB + 0.14)
mn = img_mat('cn_menu', menu_tex(os.path.join(TMP, 'menu.png')), emit=1.2, rough=0.4)
acc('black').box(-3.8, 0.0, 2.25, 3.0, ZB + 0.01, ZB + 0.06)
uvquad('cn_menu', (-3.72, 2.30, ZB + 0.065), (-0.08, 2.30, ZB + 0.065), (-0.08, 2.95, ZB + 0.065), (-3.72, 2.95, ZB + 0.065), mn)

# ---- 入口（身後）：雙開玻璃門，上午的陽光從這裡照進來 ----
acc('plaster').box(X0, -1.8, 0.0, H, ZF, ZF + 0.25); acc('plaster').box(1.8, X1, 0.0, H, ZF, ZF + 0.25); acc('plaster').box(-1.8, 1.8, 2.6, H, ZF, ZF + 0.25)
for xx in (-1.8, -0.9, 0.0, 0.9, 1.8): acc('alu').box(xx - 0.04, xx + 0.04, 0.0, 2.6, ZF, ZF + 0.08)
acc('alu').box(-1.8, 1.8, 2.52, 2.6, ZF, ZF + 0.08); acc('alu').box(-1.8, 1.8, 0.0, 0.1, ZF, ZF + 0.08)
sv = img_mat('cn_street', street_tex(os.path.join(TMP, 'street.png')), emit=2.2, rough=1.0)
stq = uvquad('cn_street', (6.0, -0.5, ZF + 5.0), (-6.0, -0.5, ZF + 5.0), (-6.0, 4.5, ZF + 5.0), (6.0, 4.5, ZF + 5.0), sv)
stq.visible_shadow = False                                                           # 第二版：街景那一片擋住了太陽（地上沒有陽光）

# ======================== 收尾、光、鏡頭 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.86, 0.84, 0.80, 1); bg.inputs[1].default_value = 0.35
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = float(opt('--sun', '9.0'))   # 第三版 3.2 → 9：室內燈比太陽亮時，地上那塊陽光看不出來; sun.color = (1.0, 0.92, 0.80); sun.angle = math.radians(1.5)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (g2b(0, 0, 0) - g2b(-0.28, 0.42, 1.0)).to_track_quat('-Z', 'Y').to_euler()     # 上午十點：太陽在身後偏左（門外的騎樓那一側），光從大門斜照進大廳
area_light('door_fill', 0.0, 2.0, ZF - 0.2, 3.4, 2.4, 160, col=(1.0, 0.96, 0.9), aim=(0.0, 1.2, -6.0))   # 門口進來的天光
# ---------------- 第五版精修：使用痕跡（貼花；LAWWW2-C 2026-10-17）——第一版的天花板、牆、地板太乾淨，不像開了幾十年的二輪戲院 ----------------
from PIL import ImageDraw as _D
def decal_mat(name, path, rough=0.8):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
    b.inputs['Roughness'].default_value = rough; mt.blend_method = 'HASHED'; return mt
def stain_png(path, W=512, seed=1):
    """天花板的水漬：幾圈不規則的咖啡色環（外圈深、裡面淡）"""
    rr_ = random.Random(seed); im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = _D.Draw(im)
    for ring in range(5):
        R = W * (0.42 - ring * 0.07); pts = [(W / 2 + math.cos(a) * R * rr_.uniform(0.82, 1.08), W / 2 + math.sin(a) * R * rr_.uniform(0.82, 1.08)) for a in [k * 2 * math.pi / 40 for k in range(40)]]
        d.polygon(pts, fill=(170, 132, 84, 44 + ring * 9)); d.line(pts + [pts[0]], fill=(140, 100, 60, 150 - ring * 14), width=4)
    im.filter(ImageFilter.GaussianBlur(3)).save(path); return path
def tape_png(path):
    """撕剩的膠帶：泛黃、邊緣鋸齒"""
    im = Image.new('RGBA', (96, 48), (0, 0, 0, 0)); d = _D.Draw(im)
    d.polygon([(4, 6), (88, 2), (92, 20), (86, 30), (90, 44), (6, 46), (2, 30), (8, 20)], fill=(226, 204, 150, 210)); im.save(path); return path
def ghost_png(path):
    """舊海報拿掉以後褪色的框（牆面比旁邊亮一點、邊緣有一點灰）"""
    W, H = 280, 400; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = _D.Draw(im)
    d.rectangle([0, 0, W, H], fill=(250, 246, 236, 70)); d.rectangle([0, 0, W - 1, H - 1], outline=(120, 110, 96, 60), width=4)
    im.filter(ImageFilter.GaussianBlur(1.5)).save(path); return path
def grime_png(path, W=1024, H=128, seed=3):
    """牆裙上緣、地板走道的髒污：低對比的雲狀灰咖啡"""
    rr_ = random.Random(seed); im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = _D.Draw(im)
    for _ in range(260):
        x, y, R = rr_.uniform(0, W), rr_.uniform(0, H), rr_.uniform(6, 26); d.ellipse([x - R * 2, y - R, x + R * 2, y + R], fill=(70, 58, 46, rr_.randint(8, 22)))
    im.filter(ImageFilter.GaussianBlur(6)).save(path); return path
def scuff_png(path, seed=5):
    """牆裙下緣的鞋印擦痕：幾道深色的弧"""
    rr_ = random.Random(seed); im = Image.new('RGBA', (512, 128), (0, 0, 0, 0)); d = _D.Draw(im)
    for _ in range(14):
        x, y = rr_.uniform(20, 490), rr_.uniform(60, 120); d.arc([x - 40, y - 12, x + 40, y + 12], rr_.uniform(180, 220), rr_.uniform(300, 350), fill=(40, 32, 28, rr_.randint(60, 120)), width=rr_.randint(2, 4))
    im.filter(ImageFilter.GaussianBlur(0.8)).save(path); return path
STN = [decal_mat('cn_stain%d' % k, stain_png(os.path.join(TMP, 'stain%d.png' % k), seed=k)) for k in range(3)]
for (sx, sz, sw, k) in ((-1.2, -2.9, 0.75, 0), (1.5, -5.6, 0.55, 1), (-2.9, -8.6, 0.9, 2), (0.3, 0.6, 0.45, 1)):   # 天花板的水漬（往下看的那一面）
    y = H - 0.017; uvquad('cn_stain', (sx - sw, y, sz + sw), (sx + sw, y, sz + sw), (sx + sw, y, sz - sw), (sx - sw, y, sz - sw), STN[k])
TAPE = decal_mat('cn_tape', tape_png(os.path.join(TMP, 'tape.png')), rough=0.5); GH = decal_mat('cn_ghost', ghost_png(os.path.join(TMP, 'ghost.png')))
for k in (1, 3):                                                                      # 海報牆：舊海報換過位置，留下褪色的框和撕剩的膠帶
    zc = -0.9 - k * 1.55 + 0.07; y0, y1 = 1.12, 2.33; xw = X1 - 0.003
    uvquad('cn_ghost', (xw, y0, zc + 0.44), (xw, y0, zc - 0.44), (xw, y1, zc - 0.44), (xw, y1, zc + 0.44), GH)
    for (ty, tz) in ((y1 - 0.02, zc + 0.43), (y0 + 0.02, zc + 0.42), (y1 - 0.03, zc - 0.43)):
        uvquad('cn_tape', (xw - 0.001, ty - 0.012, tz + 0.025), (xw - 0.001, ty - 0.012, tz - 0.025), (xw - 0.001, ty + 0.012, tz - 0.025), (xw - 0.001, ty + 0.012, tz + 0.025), TAPE)
GR = decal_mat('cn_grime', grime_png(os.path.join(TMP, 'grime.png')))
uvquad('cn_grime_r', (X1 - 0.026, 0.92, ZF - 0.3), (X1 - 0.026, 0.92, ZB + 0.1), (X1 - 0.026, 1.18, ZB + 0.1), (X1 - 0.026, 1.18, ZF - 0.3), GR)   # 牆裙上緣（手摸、椅背靠的地方）
uvquad('cn_grime_l', (X0 + 0.027, 0.92, ZB + 0.1), (X0 + 0.027, 0.92, -1.75), (X0 + 0.027, 1.18, -1.75), (X0 + 0.027, 1.18, ZB + 0.1), GR)
SC = decal_mat('cn_scuff', scuff_png(os.path.join(TMP, 'scuff.png')), rough=0.6)
uvquad('cn_scuff_r', (X1 - 0.027, 0.02, -0.2), (X1 - 0.027, 0.02, -6.2), (X1 - 0.027, 0.32, -6.2), (X1 - 0.027, 0.32, -0.2), SC)
uvquad('cn_scuff_b', (BX + 0.022, 0.02, BZ1), (BX + 0.022, 0.02, BZ0), (BX + 0.022, 0.30, BZ0), (BX + 0.022, 0.30, BZ1), SC)
FW = decal_mat('cn_floorwear', grime_png(os.path.join(TMP, 'floorwear.png'), W=1024, H=1024, seed=9), rough=0.95)   # 入口到樓梯走出來的一條磨暗的路
uvquad('cn_floorwear', (-1.2, 0.003, 1.6), (3.6, 0.003, 1.6), (3.6, 0.003, -3.4), (-1.2, 0.003, -3.4), FW)

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye = tuple(map(float, opt('--eye', '0.25,1.55,1.1').split(','))); look = tuple(map(float, opt('--look', '-0.15,1.32,-10.0').split(',')))
cam.data.lens = float(opt('--lens', '22')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('saved', OUT)
