"""118 巷新店的「餐點照片」（L118-SHOPS-REDO-1111，X338；LAWWW2 2026-11-11）。
使用者的規格：辛亥韓食、奈良咖哩的招牌有餐點照片，義大麵屋的玻璃窗貼義大利麵照片。專案不放第三方照片，
所以這裡用程式畫（PIL）：從正上方看的一盤菜——盤子、醬汁的深淺、配料的碎點、一點陰影和柔邊；遠看是菜單照片的樣子，不是真的照片。
用法：from l118_food_tex import dish；dish('stew', 480, 360) → PIL.Image（RGB）。同一個 kind 每次畫出來一樣（固定亂數種子）。
kind：stew（泡菜鍋）、seafood（海鮮豆腐鍋）、bibimbap（石鍋拌飯）、teppan_pork、teppan_beef（鐵板肉）、curry_cutlet、curry_chicken、curry_beef、curry_croquette、
  pasta_tomato、pasta_cream、pasta_pesto、pasta_clam、pizza_marg、pizza_hawaii、pizza_chicken、pizza_cheese、steak、steak_chicken、bento_leg、bento_cutlet、
  dumpling、soup_sour、soup_corn、noodle_beef、noodle_tomato、noodle_fried、noodle_zha、buffet、cup_milktea、cup_black、cup_green、cup_fruit、cup_passion、cup_yakult、cup_coffee"""
import math, random
from PIL import Image, ImageDraw, ImageFilter

SS = 2   # 畫的時候放大兩倍，最後縮回來（邊緣才不會鋸齒）


def _rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def _mix(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def _sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)


class _C:
    """一張畫布：中心 (cx, cy)、單位 u（盤子半徑＝1）"""
    def __init__(self, w, h, seed, bg):
        self.w, self.h = w * SS, h * SS; self.r = random.Random(seed); self.im = Image.new('RGB', (self.w, self.h), bg); self.d = ImageDraw.Draw(self.im)
        self.cx, self.cy = self.w / 2, self.h / 2; self.u = min(self.w, self.h) * 0.43

    def P(self, x, y): return (self.cx + x * self.u, self.cy + y * self.u)

    def table(self, kind='wood'):
        """桌面：木紋（橫的深淺條）或深色石面"""
        d, r = self.d, self.r; base = _rgb({'wood': '#b98d5e', 'dark': '#3a3230', 'light': '#e9e2d4', 'steel': '#c9cdd0', 'red': '#8a2a22'}[kind])
        d.rectangle([0, 0, self.w, self.h], fill=base)
        y = 0
        while y < self.h:
            hh = r.randint(3, 14) * SS; d.rectangle([0, y, self.w, y + hh], fill=_sh(base, r.uniform(0.9, 1.08))); y += hh
        self.im = self.im.filter(ImageFilter.GaussianBlur(2.5 * SS)); self.d = ImageDraw.Draw(self.im)

    def shadow(self, x, y, rx, ry, k=0.5):
        lay = Image.new('L', (self.w, self.h), 0); dd = ImageDraw.Draw(lay); p = self.P(x + 0.06, y + 0.09)
        dd.ellipse([p[0] - rx * self.u, p[1] - ry * self.u, p[0] + rx * self.u, p[1] + ry * self.u], fill=int(255 * k))
        lay = lay.filter(ImageFilter.GaussianBlur(0.07 * self.u)); self.im.paste(Image.new('RGB', (self.w, self.h), (20, 14, 10)), (0, 0), lay); self.d = ImageDraw.Draw(self.im)

    def ell(self, x, y, rx, ry, col, outline=None, width=0):
        p = self.P(x, y); self.d.ellipse([p[0] - rx * self.u, p[1] - ry * self.u, p[0] + rx * self.u, p[1] + ry * self.u], fill=col, outline=outline, width=int(width * self.u) if width else 0)

    def disc_grad(self, x, y, r, c_in, c_out, steps=14, ry=None):
        for i in range(steps):
            t = i / (steps - 1); k = 1 - t * 0.999; self.ell(x, y, r * k, (ry or r) * k, _mix(c_out, c_in, t))

    def plate(self, x=0, y=0, r=1.0, col='#f6f4ee', ry=None, rim=0.16):
        ry = ry or r; c = _rgb(col); self.shadow(x, y, r, ry)
        self.ell(x, y, r, ry, _sh(c, 0.93)); self.ell(x, y, r * 0.985, ry * 0.985, c); self.ell(x, y, r * (1 - rim), ry * (1 - rim), _sh(c, 0.95)); self.ell(x, y, r * (1 - rim) * 0.97, ry * (1 - rim) * 0.97, _sh(c, 0.99))

    def pot(self, x=0, y=0, r=1.0, col='#2a2726'):
        c = _rgb(col); self.shadow(x, y, r * 1.02, r * 1.02, 0.6); self.ell(x, y, r, r, _sh(c, 0.8)); self.ell(x, y, r * 0.97, r * 0.97, c); self.ell(x, y, r * 0.86, r * 0.86, _sh(c, 0.6))
        for sx in (-1, 1): self.rrect(x + sx * (r + 0.07), y, 0.1, 0.2, _sh(c, 0.9), 0.04)

    def rrect(self, x, y, hw, hh, col, rad=0.05, rot=0.0):
        if not rot:
            p = self.P(x, y); self.d.rounded_rectangle([p[0] - hw * self.u, p[1] - hh * self.u, p[0] + hw * self.u, p[1] + hh * self.u], radius=rad * self.u, fill=col); return
        c, s = math.cos(rot), math.sin(rot); pts = [self.P(x + a * c - b * s, y + a * s + b * c) for (a, b) in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]; self.d.polygon(pts, fill=col)

    def bits(self, x, y, r, cols, n, s0=0.02, s1=0.05, ry=None, sq=False, ring=0.0):
        """在圓（或橢圓）裡撒小碎點：蔥花、辣椒、玉米……；ring＞0 只撒在外圈"""
        rr = self.r
        for _ in range(n):
            a = rr.uniform(0, 6.283); q = math.sqrt(rr.uniform(ring * ring, 1.0)); px, py = x + math.cos(a) * r * q, y + math.sin(a) * (ry or r) * q; s = rr.uniform(s0, s1); col = _sh(_rgb(rr.choice(cols)), rr.uniform(0.85, 1.12))
            if sq: self.rrect(px, py, s, s * rr.uniform(0.6, 1.0), col, s * 0.3, rr.uniform(0, 3.14))
            else: self.ell(px, py, s, s * rr.uniform(0.6, 1.0), col)

    def strokes(self, x, y, r, col, n, w=0.035, ln=(0.5, 1.1), ry=None, jitter=0.12):
        """麵條：一條條彎的線（從圓裡的一點到另一點，中間拐一下）"""
        rr = self.r; base = _rgb(col)
        for _ in range(n):
            a = rr.uniform(0, 6.283); q = rr.uniform(0, 0.75); x0, y0 = x + math.cos(a) * r * q, y + math.sin(a) * (ry or r) * q; b = rr.uniform(0, 6.283); L_ = rr.uniform(*ln) * r
            pts = []
            for k in range(9):
                t = k / 8; bb = b + math.sin(t * 3.1 + a) * 1.3; px = x0 + math.cos(bb) * L_ * (t - 0.5); py = y0 + math.sin(bb) * L_ * (t - 0.5) * ((ry or r) / r)
                dd = math.hypot((px - x) / r, (py - y) / (ry or r))
                if dd > 0.95: px = x + (px - x) * 0.95 / dd; py = y + (py - y) * 0.95 / dd
                pts.append(self.P(px, py))
            c = _sh(base, rr.uniform(0.86, 1.1)); self.d.line(pts, fill=_sh(c, 0.72), width=int((w + 0.012) * self.u), joint='curve'); self.d.line(pts, fill=c, width=int(w * self.u), joint='curve')

    def gloss(self, x, y, r, k=0.22, ry=None):
        lay = Image.new('L', (self.w, self.h), 0); dd = ImageDraw.Draw(lay); p = self.P(x - r * 0.3, y - (ry or r) * 0.35)
        dd.ellipse([p[0] - r * 0.45 * self.u, p[1] - (ry or r) * 0.25 * self.u, p[0] + r * 0.45 * self.u, p[1] + (ry or r) * 0.25 * self.u], fill=int(255 * k))
        lay = lay.filter(ImageFilter.GaussianBlur(0.1 * self.u)); self.im.paste(Image.new('RGB', (self.w, self.h), (255, 250, 240)), (0, 0), lay); self.d = ImageDraw.Draw(self.im)

    def egg(self, x, y, r=0.2, raw=True):
        rr = self.r
        if raw:
            pts = [self.P(x + math.cos(a) * r * rr.uniform(0.85, 1.15), y + math.sin(a) * r * rr.uniform(0.85, 1.15)) for a in [i * 0.52 for i in range(12)]]; self.d.polygon(pts, fill=(250, 247, 238))
        self.ell(x, y, r * 0.42, r * 0.42, (238, 160, 30)); self.ell(x - r * 0.1, y - r * 0.12, r * 0.12, r * 0.09, (255, 214, 120))

    def done(self, vignette=0.35):
        im = self.im.filter(ImageFilter.GaussianBlur(0.6 * SS))
        if vignette:
            lay = Image.new('L', (self.w, self.h), 0); dd = ImageDraw.Draw(lay); dd.ellipse([-self.w * 0.15, -self.h * 0.2, self.w * 1.15, self.h * 1.2], fill=255)
            lay = lay.filter(ImageFilter.GaussianBlur(self.w * 0.12)); dark = Image.eval(im, lambda v: int(v * (1 - vignette))); im = Image.composite(im, dark, lay)
        return im.resize((self.w // SS, self.h // SS), Image.LANCZOS)


GREEN = ['#4e8a2e', '#6aa63a', '#3f7a2a']; ONION = ['#7fb04a', '#a8cf6a', '#e9f0d0']; CHILI = ['#c8281c', '#a81c14']; CARROT = ['#e8842a', '#f09a3a']; CORN = ['#f4d040', '#f0c030']
MEAT = ['#6a3a22', '#7a4428', '#5a2e1a']; TOFU = ['#f6f0dc', '#efe6cc']; CHEESE = ['#f6e6a8', '#f2d98a', '#fff2c8']


def _curry(c, top):
    c.table('wood'); c.plate(0, 0, 1.0, ry=0.82)
    c.ell(-0.3, 0, 0.5, 0.56, (250, 248, 240)); c.bits(-0.3, 0, 0.46, ['#ffffff', '#f2efe4', '#e9e6da'], 260, 0.012, 0.026, ry=0.52)       # 白飯
    c.disc_grad(0.3, 0.03, 0.52, _rgb('#8a5220'), _rgb('#6a3c14'), ry=0.56); c.bits(0.32, 0.05, 0.42, CARROT + ['#e6c878', '#e6c878'], 16, 0.04, 0.075, ry=0.46, sq=True); c.gloss(0.3, 0.0, 0.45, 0.16)
    if top == 'cutlet':
        for k in range(6): c.rrect(-0.2 + k * 0.105, -0.02 + (k % 2) * 0.01, 0.045, 0.3, _rgb('#d09438'), 0.03, 0.22); c.rrect(-0.2 + k * 0.105, -0.02, 0.022, 0.27, _rgb('#f0dcb0'), 0.02, 0.22)
        c.bits(0.02, -0.02, 0.3, ['#b87820', '#e0aa50'], 60, 0.008, 0.016, ry=0.3)
    elif top == 'croquette':
        for (x, y) in ((-0.12, -0.2), (0.0, 0.18)): c.disc_grad(x, y, 0.2, _rgb('#d8a048'), _rgb('#b87a28'), ry=0.15); c.bits(x, y, 0.18, ['#e8c070', '#a86a20'], 50, 0.008, 0.016, ry=0.13)
    elif top == 'chicken': c.bits(0.3, 0.02, 0.36, ['#e8c890', '#d8b070', '#f0d8a8'], 9, 0.07, 0.11, ry=0.4, sq=True)
    else: c.bits(0.3, 0.02, 0.36, MEAT, 10, 0.07, 0.11, ry=0.4, sq=True)
    c.bits(-0.55, -0.35, 0.08, ['#c8281c', '#d8402c'], 9, 0.02, 0.03)                                                               # 福神漬
    return c.done()


def _stew(c, seafood=False):
    c.table('dark'); c.pot(0, 0, 0.98)
    c.disc_grad(0, 0, 0.84, _rgb('#d8442a' if not seafood else '#d85a30'), _rgb('#a8241a')); c.bits(0, 0, 0.78, ['#e8683a', '#f08a4a', '#b82a1c'], 70, 0.02, 0.06)
    for (x, y, a) in ((-0.3, -0.25, 0.2), (0.25, -0.3, -0.3), (-0.1, 0.3, 0.5), (0.38, 0.2, 0.1), (-0.45, 0.15, -0.4)): c.rrect(x, y, 0.14, 0.11, _rgb(TOFU[0]), 0.03, a); c.rrect(x - 0.02, y - 0.02, 0.1, 0.07, _rgb('#fffaf0'), 0.03, a)
    if seafood:
        for (x, y) in ((0.05, -0.05), (-0.35, -0.02), (0.3, -0.05)): c.ell(x, y, 0.13, 0.09, (240, 150, 110)); c.ell(x + 0.02, y, 0.08, 0.05, (250, 200, 170))
        c.bits(0, 0, 0.6, ['#3a3a40', '#f4f0e8'], 8, 0.05, 0.07)
    else:
        c.bits(0, 0, 0.6, ['#e8d8a0', '#d8b870', '#c84a2a'], 26, 0.04, 0.08, sq=True); c.egg(0.02, 0.0, 0.22)
    c.bits(0, 0, 0.7, ONION, 46, 0.015, 0.03); c.gloss(0, 0, 0.7, 0.2)
    return c.done()


def _bibimbap(c):
    c.table('dark'); c.pot(0, 0, 0.98); c.ell(0, 0, 0.84, 0.84, (244, 240, 228))
    secs = [('#e8842a', 22), ('#3f7a2a', 22), ('#efe6c8', 26), ('#6a4a2e', 18), ('#5a2e1a', 20), ('#c8281c', 14)]
    for i, (col, n) in enumerate(secs):
        a = i * 6.283 / len(secs); x, y = math.cos(a) * 0.48, math.sin(a) * 0.48
        c.ell(x, y, 0.3, 0.3, _sh(_rgb(col), 0.9)); c.strokes(x, y, 0.28, col, n, w=0.022, ln=(0.6, 1.2))
    c.egg(0, 0, 0.3); c.bits(0, 0, 0.75, ['#f4f0e0', '#2a2a2a'], 40, 0.008, 0.014); c.gloss(0, 0, 0.7, 0.14)
    return c.done()


def _teppan(c, beef=False):
    c.table('wood'); c.shadow(0, 0, 1.12, 0.78); c.rrect(0, 0, 1.12, 0.74, _rgb('#8a5a30'), 0.12); c.ell(0, 0, 1.0, 0.64, (30, 28, 27)); c.ell(0, 0, 0.93, 0.58, (48, 44, 42))
    col = '#6a2e1a' if beef else '#a8663a'
    for k in range(11): a = c.r.uniform(-0.5, 0.5); c.rrect(-0.32 + (k % 6) * 0.13, -0.12 + (k // 6) * 0.24 + c.r.uniform(-0.04, 0.04), 0.085, 0.17, _sh(_rgb(col), c.r.uniform(0.85, 1.15)), 0.04, a)
    c.bits(-0.05, 0, 0.5, ['#3a1c10', '#c88a50'], 50, 0.01, 0.025, ry=0.32)
    c.strokes(0.55, 0.05, 0.28, '#f0e2b0', 26, w=0.02, ry=0.3); c.bits(0.55, 0.05, 0.26, ONION + CARROT, 22, 0.015, 0.03, ry=0.28)       # 洋蔥、豆芽
    c.bits(-0.68, 0.1, 0.16, GREEN, 26, 0.02, 0.04, ry=0.2); c.bits(0, 0, 0.8, ['#f4f0e0'], 30, 0.006, 0.012, ry=0.5); c.gloss(0, 0, 0.7, 0.14, ry=0.4)
    return c.done()


def _pasta(c, sauce):
    c.table('light'); c.plate(0, 0, 1.0, rim=0.22)
    base = {'tomato': '#d8562e', 'cream': '#f2e6c0', 'pesto': '#8aa83a', 'clam': '#ecd89a'}[sauce]
    c.ell(0, 0, 0.62, 0.62, _sh(_rgb(base), 0.85)); c.strokes(0, 0, 0.6, {'tomato': '#eeb068', 'cream': '#f6ecc8', 'pesto': '#c8d27a', 'clam': '#f2e2a8'}[sauce], 150, w=0.03, ln=(0.7, 1.4))
    if sauce == 'tomato': c.disc_grad(0, 0, 0.3, _rgb('#b8321c'), _rgb('#c8482a')); c.bits(0, 0, 0.3, MEAT + ['#d8562e'], 60, 0.015, 0.035); c.bits(0, 0, 0.1, GREEN, 8, 0.03, 0.05)
    elif sauce == 'cream': c.bits(0, 0, 0.42, ['#f0d8a8', '#e8c890', '#d8b070'], 12, 0.06, 0.1, sq=True); c.bits(0, 0, 0.5, ['#6a4a2e', '#8a6a4a'], 14, 0.03, 0.05); c.bits(0, 0, 0.5, GREEN + ['#2a2a2a'], 26, 0.008, 0.016)
    elif sauce == 'pesto': c.bits(0, 0, 0.45, ['#d87a6a', '#c8584a', '#e89a8a'], 14, 0.035, 0.09, sq=True); c.bits(0, 0, 0.5, ['#4e7a2a', '#f4f0e0'], 40, 0.01, 0.02)
    else:
        for k in range(7): a = k * 0.9 + 0.3; x, y = math.cos(a) * 0.42, math.sin(a) * 0.42; c.ell(x, y, 0.12, 0.09, (70, 62, 58)); c.ell(x, y, 0.08, 0.055, (236, 214, 170))
        c.bits(0, 0, 0.5, GREEN + CHILI, 34, 0.01, 0.02); c.bits(0, 0, 0.45, ['#f4ecd0'], 12, 0.02, 0.03)
    c.gloss(0, 0, 0.55, 0.14)
    return c.done()


def _pizza(c, kind):
    c.table('dark'); c.shadow(0, 0, 1.08, 1.08); c.ell(0, 0, 1.1, 1.1, _rgb('#b98d5e')); c.ell(0, 0, 1.06, 1.06, _rgb('#c89a68'))                 # 木盤
    c.disc_grad(0, 0, 0.98, _rgb('#e8c078'), _rgb('#c8903a')); c.bits(0, 0, 0.97, ['#8a5a20', '#5a3410', '#f0d090'], 50, 0.02, 0.05, ring=0.86)       # 餅皮的焦斑
    if kind == 'cheese': c.ell(0, 0, 0.84, 0.84, _rgb('#f2dc98'))
    else: c.ell(0, 0, 0.84, 0.84, _rgb('#c83a22'))
    c.bits(0, 0, 0.8, CHEESE, 70 if kind != 'cheese' else 110, 0.07, 0.15)
    if kind == 'marg':
        c.bits(0, 0, 0.7, ['#c83a22', '#d8482c'], 16, 0.05, 0.09)
        for k in range(7): a = k * 0.9 + 0.2; q = 0.25 + (k % 3) * 0.2; c.rrect(math.cos(a) * q, math.sin(a) * q, 0.11, 0.06, _rgb('#3f7a2a'), 0.05, a)
    elif kind == 'hawaii': c.bits(0, 0, 0.7, ['#f4d040', '#f0c838'], 18, 0.06, 0.08, sq=True); c.bits(0, 0, 0.7, ['#e89a8a', '#d87a6a'], 14, 0.07, 0.1, sq=True)
    elif kind == 'chicken': c.bits(0, 0, 0.7, ['#d8a868', '#c89050'], 14, 0.07, 0.1, sq=True); c.bits(0, 0, 0.7, ['#8a6a4a', '#e8dcc8'], 18, 0.05, 0.07); c.bits(0, 0, 0.7, GREEN, 26, 0.01, 0.02)
    else: c.bits(0, 0, 0.78, ['#e8b848', '#f8f0d0', '#d8982a', '#f4e4b0'], 60, 0.04, 0.1); c.bits(0, 0, 0.7, ['#2a2a2a', '#4e7a2a'], 30, 0.008, 0.014)
    c.bits(0, 0, 0.8, ['#8a5a20', '#a87030'], 26, 0.015, 0.035)
    for k in range(3): a = k * 1.047 + 0.3; c.d.line([c.P(math.cos(a) * 0.97, math.sin(a) * 0.97), c.P(-math.cos(a) * 0.97, -math.sin(a) * 0.97)], fill=(150, 96, 40), width=max(1, int(0.012 * c.u)))
    c.gloss(0, 0, 0.75, 0.12)
    return c.done()


def _steak(c, chicken=False):
    c.table('wood'); c.shadow(0, 0, 1.15, 0.8); c.rrect(0, 0, 1.15, 0.76, _rgb('#7a4e28'), 0.14); c.ell(0, 0, 1.02, 0.66, (26, 24, 24)); c.ell(0, 0, 0.95, 0.6, (44, 40, 38))
    c.strokes(0.42, 0.08, 0.36, '#e8cf8a', 60, w=0.026, ry=0.34); c.disc_grad(0.42, 0.08, 0.2, _rgb('#7a3a1c'), _rgb('#8a4a26'), ry=0.16)        # 鐵板麵＋醬
    col = ('#c88a3a', '#e0aa58') if chicken else ('#5a2a16', '#7a3e22')
    c.disc_grad(-0.36, -0.02, 0.42, _rgb(col[1]), _rgb(col[0]), ry=0.34)
    for k in range(5): c.rrect(-0.36 + (k - 2) * 0.13, -0.02, 0.016, 0.26 - abs(k - 2) * 0.05, _sh(_rgb(col[0]), 0.55), 0.01, 0.5)                  # 烤痕
    c.egg(0.22, -0.34, 0.2); c.bits(-0.1, 0.42, 0.14, CORN, 34, 0.018, 0.028, ry=0.08); c.bits(0.72, -0.2, 0.1, GREEN, 16, 0.03, 0.05)
    c.disc_grad(-0.36, -0.02, 0.16, _rgb('#3a1c10'), _rgb('#5a2a16'), ry=0.1) if not chicken else None
    c.gloss(0, 0, 0.7, 0.16, ry=0.4)
    return c.done()


def _bento(c, cutlet=False):
    c.table('wood'); c.shadow(0, 0, 1.2, 0.86); c.rrect(0, 0, 1.2, 0.84, _rgb('#e9dcc0'), 0.08); c.rrect(0, 0, 1.14, 0.78, _rgb('#f6efdc'), 0.06)
    c.rrect(-0.5, 0, 0.58, 0.7, _rgb('#fbf8ee'), 0.05); c.bits(-0.5, 0, 0.5, ['#ffffff', '#efece0', '#e6e2d4'], 320, 0.012, 0.024, ry=0.62)
    if cutlet:
        for k in range(6): c.rrect(-0.76 + k * 0.105, 0.0, 0.045, 0.36, _rgb('#d09438'), 0.03, 0.1); c.rrect(-0.76 + k * 0.105, 0.0, 0.02, 0.32, _rgb('#f0dcb0'), 0.02, 0.1)
    else:
        c.disc_grad(-0.5, 0.05, 0.36, _rgb('#c87a2a'), _rgb('#9a5216'), ry=0.3); c.rrect(-0.2, -0.3, 0.2, 0.07, _rgb('#b0661e'), 0.06, -0.7); c.ell(-0.06, -0.44, 0.05, 0.05, (240, 232, 214))   # 雞腿＋骨頭
        c.bits(-0.5, 0.05, 0.3, ['#e0a04a', '#8a4a14'], 60, 0.012, 0.03, ry=0.24)
    for (x, y, cols) in ((0.42, -0.42, GREEN), (0.86, -0.42, ['#f4d040', '#f0e090']), (0.42, 0.1, CARROT + ['#e9e2c8']), (0.86, 0.1, ['#6a4a2e', '#8a6a4a'])):
        c.rrect(x, y, 0.2, 0.24, _sh(_rgb(cols[0]), 0.8), 0.04); c.bits(x, y, 0.19, cols, 46, 0.025, 0.05, ry=0.22, sq=True)
    c.rrect(0.64, 0.55, 0.42, 0.14, _rgb('#f4e9a8'), 0.04); c.bits(0.64, 0.55, 0.36, ['#e8c838', '#f8f0c0'], 30, 0.02, 0.04, ry=0.1)
    return c.done()


def _dumpling(c):
    c.table('steel'); c.plate(0, 0, 1.0, ry=0.84, rim=0.14)
    for k in range(10):
        a = k * 0.628 + 0.2; q = 0.56 if k % 2 == 0 else 0.3; x, y = math.cos(a) * q * 1.05, math.sin(a) * q * 0.86
        c.ell(x, y, 0.2, 0.115, (232, 222, 196)); c.ell(x - 0.01, y - 0.015, 0.17, 0.09, (248, 242, 224)); c.d.arc([c.P(x - 0.17, y - 0.1)[0], c.P(x, y - 0.1)[1], c.P(x + 0.17, y)[0], c.P(x, y + 0.1)[1]], 190, 350, fill=(206, 192, 160), width=max(1, int(0.014 * c.u)))
    c.gloss(0, 0, 0.7, 0.16, ry=0.6)
    return c.done()


def _soup(c, kind):
    c.table('steel'); c.plate(0, 0, 0.98, rim=0.12)
    if kind == 'sour': c.disc_grad(0, 0, 0.82, _rgb('#a8662a'), _rgb('#8a4a1c')); c.strokes(0, 0, 0.76, '#f0e6c8', 26, w=0.02, ln=(0.3, 0.6)); c.bits(0, 0, 0.72, ['#2a2422', '#e8842a', '#f6f0dc', '#c8281c'], 70, 0.015, 0.045, sq=True)
    else: c.disc_grad(0, 0, 0.82, _rgb('#f2d878'), _rgb('#e8c458')); c.bits(0, 0, 0.74, CORN + ['#f8f0c0'], 90, 0.015, 0.03); c.bits(0, 0, 0.6, ['#f8f4e4'], 16, 0.03, 0.07)
    c.bits(0, 0, 0.7, ONION, 30, 0.012, 0.022); c.gloss(0, 0, 0.7, 0.2)
    return c.done()


def _noodle(c, kind):
    c.table('steel')
    if kind in ('fried', 'zha'): c.plate(0, 0, 1.0, rim=0.16); r = 0.7
    else: c.plate(0, 0, 0.98, rim=0.1); r = 0.84; c.disc_grad(0, 0, r, _rgb({'beef': '#8a4a22', 'tomato': '#d8562e'}[kind]), _rgb({'beef': '#6a3414', 'tomato': '#b83a1e'}[kind]))
    c.strokes(0, 0, r * 0.9, '#f2e4b8' if kind != 'fried' else '#e0c080', 46, w=0.075, ln=(0.5, 1.0))                                                    # 刀削麵：寬的短麵片
    if kind == 'beef': c.bits(0.05, -0.05, 0.5, MEAT, 9, 0.1, 0.16, sq=True); c.bits(-0.4, 0.3, 0.2, GREEN, 10, 0.05, 0.09)
    elif kind == 'tomato': c.bits(0, 0, 0.55, ['#e84a2c', '#f06a40'], 10, 0.08, 0.13); c.bits(0, 0, 0.55, ['#f6e8a0', '#f0d870'], 12, 0.05, 0.1)
    elif kind == 'fried': c.bits(0, 0, 0.55, ['#2a2422', '#f0d870', '#e8842a'] + GREEN, 46, 0.03, 0.07, sq=True); c.bits(0, 0, 0.5, MEAT, 14, 0.04, 0.07, sq=True)
    else: c.disc_grad(0, 0, 0.34, _rgb('#4a2614'), _rgb('#6a3a1e')); c.bits(0, 0, 0.3, MEAT + ['#8a5a30'], 50, 0.015, 0.035); c.strokes(0.3, -0.3, 0.2, '#b8d88a', 14, w=0.02)
    c.bits(0, 0, r * 0.8, ONION, 30, 0.012, 0.024); c.gloss(0, 0, r * 0.8, 0.16)
    return c.done()


def _buffet(c):
    c.table('steel'); c.plate(0, 0, 1.05, ry=0.84, rim=0.1, col='#f4f2ec')
    c.ell(-0.42, 0.05, 0.4, 0.5, (250, 248, 240)); c.bits(-0.42, 0.05, 0.36, ['#ffffff', '#efece0'], 200, 0.012, 0.024, ry=0.46)
    for (x, y, cols) in ((0.2, -0.38, GREEN), (0.62, -0.1, ['#f4d040', '#e84a2c']), (0.22, 0.12, MEAT), (0.5, 0.42, CARROT + ['#6a4a2e'])): c.bits(x, y, 0.26, cols, 40, 0.03, 0.07, ry=0.22, sq=True)
    c.gloss(0, 0, 0.7, 0.14, ry=0.5)
    return c.done()


def _cup(c, kind):
    """外帶杯（側面）：杯身的飲料、封膜、吸管；珍珠、水果片、冰塊"""
    bg = {'milktea': '#e9dcc4', 'black': '#e6d2c0', 'green': '#dfe8cc', 'fruit': '#f4e4c0', 'passion': '#f6e6b0', 'yakult': '#f6efd8', 'coffee': '#d8c8b8'}[kind]
    c.d.rectangle([0, 0, c.w, c.h], fill=_rgb(bg)); u = c.u
    liq = {'milktea': '#c89a68', 'black': '#7a3a1c', 'green': '#b8c858', 'fruit': '#f0a030', 'passion': '#f2c030', 'yakult': '#f4e6b8', 'coffee': '#5a3420'}[kind]
    top, bot, yt, yb = 0.46, 0.36, -0.82, 0.86
    cup = [c.P(-top, yt), c.P(top, yt), c.P(bot, yb), c.P(-bot, yb)]
    c.shadow(0.05, yb, 0.5, 0.08, 0.4); c.d.polygon(cup, fill=_sh(_rgb(liq), 1.0))
    for i in range(10):   # 杯身的明暗（左亮右暗）
        t = i / 10; xa = -top + (top * 2) * t; xb = -bot + (bot * 2) * t; k = 1.12 - 0.3 * t
        c.d.polygon([c.P(xa, yt), c.P(xa + top * 0.2, yt), c.P(xb + bot * 0.2, yb), c.P(xb, yb)], fill=_sh(_rgb(liq), k))
    if kind in ('milktea',): c.bits(0, 0.62, 0.3, ['#2a1a12', '#3a2418'], 26, 0.045, 0.055, ry=0.2)
    if kind in ('fruit', 'passion', 'green'):
        for (x, y, col) in ((-0.15, 0.1, '#f6d84a'), (0.18, -0.25, '#f08a2a' if kind != 'green' else '#f6d84a'), (0.0, 0.5, '#e84a4a' if kind == 'fruit' else '#f6d84a')): c.ell(x, y, 0.17, 0.17, _sh(_rgb(col), 0.85)); c.ell(x, y, 0.14, 0.14, _rgb(col)); c.ell(x, y, 0.03, 0.03, (255, 250, 230))
        if kind == 'passion': c.bits(0, 0.3, 0.3, ['#2a2018'], 30, 0.012, 0.018, ry=0.45)
    c.bits(0, -0.35, 0.3, ['#ffffff'], 7, 0.07, 0.1, ry=0.3, sq=True) if kind != 'coffee' else None                                                       # 冰塊
    c.d.polygon([c.P(-top - 0.03, yt - 0.06), c.P(top + 0.03, yt - 0.06), c.P(top + 0.03, yt + 0.02), c.P(-top - 0.03, yt + 0.02)], fill=(250, 250, 250))
    c.d.line([c.P(0.12, yt - 0.42), c.P(0.02, yb - 0.25)], fill=(40, 40, 40) if kind == 'milktea' else (230, 60, 60), width=int(0.06 * u))
    c.d.line([c.P(-top + 0.06, yt + 0.1), c.P(-bot + 0.07, yb - 0.1)], fill=(255, 255, 255), width=int(0.03 * u))
    return c.done(vignette=0.15)


def dish(kind, w=480, h=360):
    c = _C(w, h, sum(ord(ch) * (i + 3) for i, ch in enumerate(kind)), (120, 100, 80))
    if kind.startswith('curry_'): return _curry(c, kind[6:])
    if kind == 'stew': return _stew(c)
    if kind == 'seafood': return _stew(c, True)
    if kind == 'bibimbap': return _bibimbap(c)
    if kind.startswith('teppan_'): return _teppan(c, kind.endswith('beef'))
    if kind.startswith('pasta_'): return _pasta(c, kind[6:])
    if kind.startswith('pizza_'): return _pizza(c, kind[6:])
    if kind == 'steak': return _steak(c)
    if kind == 'steak_chicken': return _steak(c, True)
    if kind.startswith('bento_'): return _bento(c, kind.endswith('cutlet'))
    if kind == 'dumpling': return _dumpling(c)
    if kind.startswith('soup_'): return _soup(c, kind[5:])
    if kind.startswith('noodle_'): return _noodle(c, kind[7:])
    if kind == 'buffet': return _buffet(c)
    if kind.startswith('cup_'): return _cup(c, kind[4:])
    raise KeyError(kind)


ALL = ['stew', 'seafood', 'bibimbap', 'teppan_pork', 'teppan_beef', 'curry_cutlet', 'curry_chicken', 'curry_beef', 'curry_croquette', 'pasta_tomato', 'pasta_cream', 'pasta_pesto', 'pasta_clam',
       'pizza_marg', 'pizza_hawaii', 'pizza_chicken', 'pizza_cheese', 'steak', 'steak_chicken', 'bento_leg', 'bento_cutlet', 'dumpling', 'soup_sour', 'soup_corn', 'noodle_beef', 'noodle_tomato', 'noodle_fried', 'noodle_zha',
       'buffet', 'cup_milktea', 'cup_black', 'cup_green', 'cup_fruit', 'cup_passion', 'cup_yakult', 'cup_coffee']

if __name__ == '__main__':   # 總表（檢查用）：python3 l118_food_tex.py out.jpg
    import sys
    W, H = 240, 180; n = len(ALL); cols = 6; rows = (n + cols - 1) // cols; sheet = Image.new('RGB', (cols * W, rows * H), (30, 30, 30))
    for i, k in enumerate(ALL): sheet.paste(dish(k, W, H), ((i % cols) * W, (i // cols) * H))
    sheet.save(sys.argv[1] if len(sys.argv) > 1 else 'l118_food_sheet.jpg', quality=90); print('ok', n)
