"""118 巷店面室內重做（L118-SHOPS-REDO-1111，USER_WANTS X338）——奈良咖哩（店 id omu，原蛋包飯研究所）的室內。
LAWWW 的 Blender 子代理臨時代 LAWWW2 做（使用者 2026-11-11 要求臨時分工）；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/l118_int_omu.py [-- [--out-dir assets/models/env/second_ai] [--preview]]
產出（覆蓋）：assets/models/env/second_ai/l118_omu.glb、l118_omu.json、l118_omu.layout.json；--preview 另外用 Cycles 算兩張預覽圖
  docs/art-rebuild/second_ai/wip/l118_int_1111/omu_door.jpg（從門口往裡）、omu_back.jpg（從最裡面往門口）。
參考圖：docs/handoff/user_specs/l118_ref/int_omu.webp（使用者提供）；店名、品名、價錢照 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md（不照圖抄）。

做法：沿用 LAWWW2 的 lane118_shops.py（import，不修改它）——Shop、kitchen、finish（匯出＋配置＋導航檢查）照舊；
  這個檔的前半是「118 巷新室內共用的零件」（義大麵屋 l118_int_pasta.py、迪倫窯烤披薩 l118_int_noodle2.py 也 import 這個檔用；三支各自可以單獨執行、一間店一個 Blender 程序）：
  - begin()：改寫 LS.SPEC／LS.TX.SHOPS 那一筆（W、D、door_x 維持原值）、畫這間店自己的印刷品貼圖集（覆蓋 textures/gen/l118_<id>_print.png，每次執行都重畫）、建 Shop；
  - shell2()：LS.shell 的複本（出處 lane118_shops.py shell()，LAWWW2-C 2026-10-20），多了店面門窗框的顏色、每一面牆各自的材質；
  - 天花板：單面朝下（材質名 l118_<id>_ceiling，同 LS.shell）；樑、吊燈、吸頂冷氣、管線放在 CEIL_fix／CEIL_bulbs（各自一個材質，不會被合併）：
    鏡頭高過天花板時 zones3d.js 的 ceilHide 把 CEIL_* 一起藏起來（做法同 tz_shops_interior.py）；樑、冷氣沒有頂面（l118_arcade_unit 的「天花板那一層沒有雙面的大片水平面」）；
  - table_unit()：一張桌子＋椅子整組是一塊導航阻擋（邊對齊 0.4 m 的導航格線），椅子從走道坐：走近點 ap 在走道上；離走道遠的（靠牆那一張）多寫 r（互動半徑）、inner
    （做法同 LAWWW2 WIP l118_wip_v1a.patch 的 booth()）；
  - trap_check()：導航格上每一個空格旁邊一格以內都要有「走得到、站得穩」的格子（沒有 0.3～0.7 m 的縫；汀州鮮果卡人的教訓）；
  - 餐點照片：程式畫的（PIL），_C、_curry、_pasta、_pizza 複製自 LAWWW2 的 l118_food_tex.py（origin/claude/second-ai-env-art
    docs/art-rebuild/second_ai/wip/l118_redo_1111/l118_wip_v1a.patch，LAWWW2 2026-11-11；那個檔還沒進開發分支，所以複製一份在這裡）。
座標、牆的分組（WALL_N/W/E/S）、GLOW_ 材質、配置欄位：見 lane118_shops.py 檔頭。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as LS   # noqa: E402
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

PI = math.pi; H = LS.H
ccyl, csph, clathe, rbox, rot, uvquad = LS.ccyl, LS.csph, LS.clathe, LS.rbox, LS.rot, LS.uvquad
ARGS = LS.ARGS
PREVIEW_DIR = os.path.join(L.ROOT, 'docs/art-rebuild/second_ai/wip/l118_int_1111')
SIT_TOP = 0.47   # 遊戲坐下對準的椅面（character3d.js C.SIT_TOP）
BAR_LIFT = 0.29  # 吧檯高腳椅座面 0.76 − 0.47（tests/l118_bar_lift_unit.js）


# ================= 貼圖：字、紙、木紋 =================
def F(n): return ImageFont.truetype(LS.TX.CJK, int(n))
def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)


def ctext(d, cx, y, t, f, fill):
    w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def fit(d, t, w, n0):
    """寬度放得下的最大字級（從 n0 往下）"""
    n = n0
    while n > 10 and d.textlength(t, font=F(n)) > w: n -= 2
    return F(n)


def wood_tex(w, h, base, seed, vertical=False):
    """木板底（深淺條紋＋模糊）"""
    rr = random.Random(seed); im = Image.new('RGB', (w, h), base); d = ImageDraw.Draw(im); b = hexrgb(base)
    for y in range(0, (w if vertical else h), 3):
        k = 0.92 + 0.14 * rr.random(); col = shade(b, k)
        if vertical: d.line([(y, 0), (y, h)], fill=col, width=3)
        else: d.line([(0, y), (w, y)], fill=col, width=3)
    return im.filter(ImageFilter.GaussianBlur(1.3))


def paper(w, h, col='#f6f1e4', seed=1):
    rr = random.Random(seed); im = Image.new('RGB', (w, h), col); px = im.load(); b = hexrgb(col)
    for _ in range(w * h // 30):
        x, y = rr.randrange(w), rr.randrange(h); px[x, y] = shade(b, rr.uniform(0.93, 1.0))
    return im


def chalk(w, h, col='#2c2f2c', seed=3):
    """黑板底（有擦過的淡痕）"""
    rr = random.Random(seed); im = Image.new('RGB', (w, h), col); d = ImageDraw.Draw(im); b = hexrgb(col)
    for _ in range(40):
        x, y = rr.randrange(w), rr.randrange(h); d.ellipse([x - 60, y - 14, x + 60, y + 14], fill=shade(b, rr.uniform(1.05, 1.22)))
    return im.filter(ImageFilter.GaussianBlur(9))


def menu_lines(d, x0, x1, y, items, fh, fg, ac, gap=None, dots=True):
    """品名 …… 價錢（一行一道）；items＝[(品名, 價錢)]（文字規格的品名和價錢）"""
    for (nm, pr) in items:
        f = F(fh); d.text((x0, y), nm, font=f, fill=fg); t = str(pr); w = d.textlength(t, font=f); d.text((x1 - w, y), t, font=f, fill=ac)
        if dots:
            x = x0 + d.textlength(nm, font=f) + fh * 0.3
            while x < x1 - w - fh * 0.4: d.ellipse([x, y + fh * 0.6, x + fh * 0.09, y + fh * 0.69], fill=fg); x += fh * 0.34
        y += gap or int(fh * 1.42)
    return y


# ---- 餐點照片（複製自 LAWWW2 l118_food_tex.py，見檔頭）----
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


def dish(kind, w=480, h=360):
    """kind：curry_cutlet／curry_chicken／curry_beef／curry_croquette、pasta_tomato／pasta_cream／pasta_pesto／pasta_clam、pizza_marg／pizza_hawaii／pizza_chicken／pizza_cheese"""
    c = _C(w, h, sum(ord(ch) * (i + 3) for i, ch in enumerate(kind)), (120, 100, 80))
    if kind.startswith('curry_'): return _curry(c, kind[6:])
    if kind.startswith('pasta_'): return _pasta(c, kind[6:])
    if kind.startswith('pizza_'): return _pizza(c, kind[6:])
    raise KeyError(kind)


def poster(w, h, kind, caption, bg='#f6efdc', fg='#4a2c14', edge='#e2d6b8'):
    """餐點海報：上面照片、下面品名"""
    p = paper(w, h, bg, seed=len(caption) * 7 + w); d = ImageDraw.Draw(p); m = int(w * 0.06); ph = int((w - 2 * m) * 0.8)
    p.paste(dish(kind, w - 2 * m, ph), (m, m)); f = fit(d, caption, w - 2 * m, int((h - ph - 2 * m) * 0.62))
    ctext(d, w / 2, m + ph + (h - ph - 2 * m - f.size) / 2, caption, f, hexrgb(fg)); d.rectangle([2, 2, w - 3, h - 3], outline=hexrgb(edge), width=3)
    return p


def put(atlas, reg, key, im):
    x0, y0, x1, y1 = reg[key]
    atlas.paste(im if im.size == (x1 - x0, y1 - y0) else im.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0))


# ================= 開始、結束 =================
def shop_data(sid):
    """店家資料 src/data/lane118_shops.js（AA_280 匯入；店名、類型、菜單、營業時間——菜單和使用者文字規格逐項一樣，tests/l118_shops_redo_1111_unit.js 釘住）"""
    s = open(os.path.join(L.ROOT, 'src/data/lane118_shops.js'), encoding='utf-8').read(); j = json.loads(s[s.index('{', s.index('const LANE118_SHOPS=')):s.rindex('}') + 1])
    return next(q for q in j['shops'] if q['id'] == sid)


def ensure_view(sid):
    """門外的巷景 textures/gen/l118_view_<id>.png（從街景模型拍的產生檔，沒進版控）：本機沒有就從 git 歷史 0227ce848 取舊的那一張
    （LAWWW2 街景定了以後會重拍；那時候重跑這支就換成新的）"""
    p = os.path.join(LS.GEN, f'l118_view_{sid}.png')
    if os.path.exists(p): return
    try:
        r = subprocess.run(['git', '-C', L.ROOT, 'show', f'0227ce848:tools/blender/env_second/textures/gen/l118_view_{sid}.png'], capture_output=True, check=True)
        open(p, 'wb').write(r.stdout); print('門外巷景：從 git 0227ce848 取回', os.path.basename(p))
    except Exception as e: print('沒有門外巷景（門外是一片淺灰）：', e)


def begin(sid, spec, regions, atlas):
    """spec＝LS.SPEC 那一筆（地板、牆、腰牆、木頭、配色；W、D、door_x 用原值）；regions＝印刷品貼圖集的區域；atlas＝畫好的 1024×1024 PIL 圖"""
    old = LS.SPEC[sid]
    LS.SPEC[sid] = dict(spec, W=old['W'], D=old['D'], door_x=old['door_x'])
    # 配置的 name／type＝店家資料的新店名、類型（和 LAWWW2 重做的那四間一樣）。街景模型還是舊招牌的時候（開發分支 64add9fcf 以前）遊戲靠「配置記的舊店名」把招牌板面的舊字換成新店名
    #   （zones3d.js 的 ud118），那時候這裡先不改；64add9fcf 新街景的招牌板面已經是新店名（tests/l118_shops_redo_1111_unit.js 3-7 的 same），所以改成新的。
    sh = shop_data(sid); LS.TX.SHOPS[sid] = dict(LS.TX.SHOPS[sid], name=sh['name'], sub=sh['type'])
    os.makedirs(LS.GEN, exist_ok=True); ensure_view(sid)
    if not os.path.exists(os.path.join(LS.GEN, 'l118_screens.png')): LS.TX.screens()
    assert atlas.size == (1024, 1024); atlas.save(os.path.join(LS.GEN, f'l118_{sid}_print.png'))
    LS.TX.REG = regions                                                    # LS.printed() 讀這張表（只在這個程序裡換）
    c = LS.Shop(sid); c.extra = {}; c.REG = regions
    c.M['ceilvc'] = L.vc_material(f'l118_{sid}_ceilvc', rough=0.6)
    c.M['ceilwarm'] = L.flat(f'GLOW_l118_{sid}_ceilwarm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a'))
    c.cf = CMesh('CEIL_fix', c.M['ceilvc']); c.cw = Mesh('CEIL_bulbs', c.M['ceilwarm']); c._cf0 = c.cf
    if sid in LS.CC0_INT:   # SHOP-CC0-HELP-1113（D161）：CC0 材質組＋Poly Haven 模型（lane118_shops.cc0_setup，九間同一套）；天花板上的零件（軌道燈、冷氣）照顏色分到 CEIL_ 開頭的材質組網格
        LS.cc0_setup(c); import cc0_kit as CK; R = LS.CC0_ROUTE[sid]
        def cm_(k, n=None):
            n = f'CEIL_l118_{sid}_{k}'
            if n not in c.cc0m: c.cc0m[n] = Mesh(n, c.MX[k])
            return c.cc0m[n]
        c.cf = CK.Route(c.cf, {col: (lambda k=k: cm_(k)) for col, k in R.items()})
    return c


def grid(lay, cell=0.4):
    """和遊戲一樣的導航格（同 LS.navcheck）：回傳 blk、cols、rows、格子中心、從出生點走得到而且站得穩（clear 0.33）的格子 seen"""
    Bd = lay['bounds']; ox, oz = Bd['x0'], Bd['z0']; cols, rows = math.ceil((Bd['x1'] - ox) / cell - 1e-9), math.ceil((Bd['z1'] - oz) / cell - 1e-9)
    blk = [[False] * cols for _ in range(rows)]; w2 = lambda cx, cz: (ox + (cx + 0.5) * cell, oz + (cz + 0.5) * cell)
    for r_ in range(rows):
        for c_ in range(cols):
            x, z = w2(c_, r_)
            if x < Bd['x0'] + 0.25 or x > Bd['x1'] - 0.25 or z < Bd['z0'] + 0.25 or z > Bd['z1'] - 0.25: blk[r_][c_] = True
    for b in lay['blocks']:
        cx_, cz_ = (b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2; hw, hd = max(b['x1'] - b['x0'], 0.4) / 2, max(b['z1'] - b['z0'], 0.4) / 2
        for r_ in range(rows):
            for c_ in range(cols):
                x, z = w2(c_, r_)
                if abs(x - cx_) <= hw and abs(z - cz_) <= hd: blk[r_][c_] = True
    cellof = lambda x, z: (math.floor((x - ox) / cell), math.floor((z - oz) / cell))
    def free(x, z):
        cx, cz = cellof(x, z); return 0 <= cx < cols and 0 <= cz < rows and not blk[cz][cx]
    clear = lambda x, z, r: free(x, z) and free(x + r, z) and free(x - r, z) and free(x, z + r) and free(x, z - r)
    sp = lay['spawn']; s0 = cellof(sp['x'], sp['z']); seen = {s0}; q = [s0]
    while q:
        cx, cz = q.pop()
        for dx in (-1, 0, 1):
            for dz in (-1, 0, 1):
                n = (cx + dx, cz + dz)
                if n in seen or not (0 <= n[0] < cols and 0 <= n[1] < rows) or blk[n[1]][n[0]] or not clear(*w2(*n), 0.33): continue
                seen.add(n); q.append(n)
    return blk, cols, rows, w2, seen


def trap_check(lay):
    """每個空的導航格，旁邊一格以內（含自己）要有一格「從出生點走得到、站得穩」的格子——
    不然就是家具之間、家具和牆之間 0.3～0.7 m 的縫（格子是空的、人站不進去或進去出不來；汀州鮮果 BUG-XIANGUO-TRAP-1111）。回傳有問題的格子中心"""
    blk, cols, rows, w2, seen = grid(lay); bad = []
    for r_ in range(rows):
        for c_ in range(cols):
            if blk[r_][c_]: continue
            if not any((c_ + dx, r_ + dz) in seen for dx in (-1, 0, 1) for dz in (-1, 0, 1)): bad.append([round(v, 2) for v in w2(c_, r_)])
    return bad


def ascii_map(lay):
    blk, cols, rows, w2, seen = grid(lay); out = []
    for r_ in range(rows): out.append(''.join('#' if blk[r_][c_] else ('.' if (c_, r_) in seen else 'o') for c_ in range(cols)))
    return '\n'.join(out)


def end(c, src):
    """CEIL_* 收尾 → LS.finish（WALL_* 分組、合併、匯出、配置、導航檢查）→ 配置補上出處、縫的檢查"""
    if getattr(c, 'cc0m', None) is not None: LS.cc0_post(c)
    for m in (c._cf0, c.cw): m.finish(c.root, uv=False)
    prob = LS.finish(c)
    p = os.path.join(LS.OUTDIR, f'l118_{c.sid}.layout.json'); lay = json.load(open(p, encoding='utf-8'))
    lay['src'] = src; bad = trap_check(lay)
    lay['navcheck']['problems'] = list(prob) + [f'空格旁邊沒有站得穩的格子 {b}' for b in bad]
    lay['navcheck']['trap_check'] = '每個空的導航格旁邊一格以內有走得到、站得穩的格子（l118_int_omu.trap_check）'
    L.write_json(p, lay); print(ascii_map(lay))
    print('L118_INT', c.sid, 'OK' if not lay['navcheck']['problems'] else lay['navcheck']['problems'])
    return lay


def preview(sid, views, points, samples=40, exposure=0.0, extra=()):
    """Cycles 預覽圖（render_cycles.py 匯入剛匯出的 GLB；不是遊戲截圖）→ docs/art-rebuild/second_ai/wip/l118_int_1111/<id>_<名稱>.jpg（1280×720）
    views＝[[名稱, 眼睛, 看的點, 焦距 mm]]；points＝[(x, y, z, 瓦數)]（吊燈、日光燈的位置：GLB 的發光材質在 Cycles 裡照不亮房間）"""
    tmp = os.path.join(os.environ.get('TMPDIR', '/tmp'), f'l118_int_prev_{sid}'); os.makedirs(tmp, exist_ok=True); os.makedirs(PREVIEW_DIR, exist_ok=True)
    vf = os.path.join(tmp, 'views.json'); json.dump(views, open(vf, 'w'))
    cmd = [sys.executable, os.path.join(HERE, 'render_cycles.py'), '--', os.path.join(LS.OUTDIR, f'l118_{sid}.glb'), tmp, sid, vf, '--res', '1280x720', '--samples', str(samples), '--view', 'Standard', '--exposure', str(exposure)]
    for (x, y, z, w) in points: cmd += ['--point', f'{x},{y},{z},{w}']
    subprocess.run(cmd + list(extra), check=False, stdout=subprocess.DEVNULL)
    for (name, *_r) in views:
        src = os.path.join(tmp, f'{sid}_{name}.png')
        if os.path.exists(src): Image.open(src).convert('RGB').save(os.path.join(PREVIEW_DIR, f'{sid}_{name}.jpg'), quality=88); print('preview', f'{sid}_{name}.jpg')


# ================= 殼（LS.shell 的複本＋門窗框顏色、每面牆的材質）=================
def street_back(c, key, sx, sy, sw, sdoor, step=0.0):
    """窗上海報的背面放在哪裡：照街上那一張（wz_shopkit.py SHOPS[店]['photos']：中心 x sx、下緣 y sy、寬 sw；街上的門 x sdoor）換算——
    離門的距離一樣、方向相反（從外面看和從店裡看左右相反；奈良咖哩原本的兩張就是這樣放的），高＝寬×參考圖裁下來那一塊的高寬比，下緣扣掉門口的台階 step。
    回傳 shell2 的 backs 一項 (x0, x1, y0, y1, key)"""
    import l118_signs_tex as ST
    _sid, box, _w = ST.REF_POSTERS[key]; h = sw * (box[3] - box[1]) / (box[2] - box[0]); xc = c.S['door_x'] + (sdoor - sx); y0 = sy - step
    return (round(xc - sw / 2, 3), round(xc + sw / 2, 3), round(y0, 3), round(y0 + h, 3), key)


def poster_backs(c, backs):
    """窗上海報的背面（從店裡往外看；LAWWW 11-11 09:41：原本是一整片米白方塊）：米白的紙＋從外面透進來、左右相反的淡淡圖案（白天外面亮，
    印的東西會從紙背透出來；圖案就是街上那一張，l118_signs_tex.py 從使用者參考圖裁的那一塊）＋四個角的透明膠帶（海報從店裡貼在玻璃上）。
    一間店一張貼圖 l118_<店>_pback.png（一張海報一格，橫著排）；放在南牆 WALL_S_pback（和牆一起淡出）"""
    import l118_signs_tex as ST
    from PIL import ImageChops, ImageOps
    Z1 = c.Z1; TW, PAD = 256, 4; PAPER = (240, 235, 222); tiles = []
    for i, b in enumerate(backs):
        xa, xb, ya, yb = b[:4]; key = b[4] if len(b) > 4 else None
        th = round(TW * (yb - ya) / (xb - xa)); rng = random.Random(41 + i); t = Image.new('RGB', (TW, th), PAPER); d = ImageDraw.Draw(t)
        for _ in range(TW * th // 60):                                                                            # 紙的纖維：一點一點深淺
            x, y, g = rng.randrange(TW), rng.randrange(th), rng.randint(-8, 5); d.point((x, y), fill=tuple(max(0, min(255, v + g)) for v in PAPER))
        if key:
            sid_, box, _w = ST.REF_POSTERS[key]
            if ST.has_ref(sid_):
                im = ImageOps.mirror(ST.ref_crop(sid_, box).resize((TW, th), Image.LANCZOS)).filter(ImageFilter.GaussianBlur(2.4))
                im = Image.blend(ImageOps.grayscale(im).convert('RGB'), im, 0.4)                                      # 透過紙的顏色淡、偏灰
                t = ImageChops.multiply(t, im.point(lambda v: int(176 + 79 * v / 255)))                               # 深的地方暗約三成
        ov = Image.new('RGBA', (TW, th), (0, 0, 0, 0)); od = ImageDraw.Draw(ov); L_ = round(TW * 0.1 / (xb - xa)); W_ = max(6, L_ // 3)
        for (cx, cy, sx_, sy_) in ((0, 0, 1, 1), (TW, 0, -1, 1), (0, th, 1, -1), (TW, th, -1, -1)):                # 四個角斜貼的透明膠帶（偏黃、邊上一條亮線）
            ux, uy = sx_ * 0.7071, sy_ * 0.7071; px, py = -uy, ux; a = (cx - ux * L_ * 0.35, cy - uy * L_ * 0.35); b_ = (cx + ux * L_ * 0.75, cy + uy * L_ * 0.75)
            poly = [(a[0] + px * W_ / 2, a[1] + py * W_ / 2), (b_[0] + px * W_ / 2, b_[1] + py * W_ / 2), (b_[0] - px * W_ / 2, b_[1] - py * W_ / 2), (a[0] - px * W_ / 2, a[1] - py * W_ / 2)]
            od.polygon(poly, fill=(236, 226, 186, 92)); od.line(poly[:2], fill=(255, 252, 236, 120), width=1)
        t = Image.alpha_composite(t.convert('RGBA'), ov).convert('RGB'); ImageDraw.Draw(t).rectangle([0, 0, TW - 1, th - 1], outline=(214, 208, 194), width=1)   # 紙邊
        tiles.append(t)
    Hh = max(t.height for t in tiles); Ww = (TW + PAD) * len(tiles); img = Image.new('RGB', (Ww, Hh), PAPER); rects = []
    for i, t in enumerate(tiles):
        x0 = i * (TW + PAD); img.paste(t, (x0, Hh - t.height)); rects.append(((x0 + 0.5) / Ww, 0.5 / Hh, (x0 + TW - 0.5) / Ww, (t.height - 0.5) / Hh))   # 貼在下面：v 從 0 開始
    fn = f'l118_{c.sid}_pback.png'; img.save(os.path.join(LS.GEN, fn))
    pm = c.wg('S', 'pback', LS.img_mat(f'l118_{c.sid}_pback', fn, rough=0.85))
    for b, r in zip(backs, rects):
        xa, xb, ya, yb = b[:4]; uvquad(pm, [(xb, ya, Z1 - 0.032), (xa, ya, Z1 - 0.032), (xa, yb, Z1 - 0.032), (xb, yb, Z1 - 0.032)], r)


def shell2(c, frame='#8f969b', doorc=None, sillc=None, wallmat=None, wainmat=None, base='#3a3530', handle='#c9ccce', backs=(), rail=True, grid=False):
    """地板、牆、腰牆、踢腳板、天花板、店面玻璃＋門、門外的巷子、兩側鄰居店面卡。出處：lane118_shops.py shell()（LAWWW2-C 2026-10-20）；
    不一樣的地方：frame／doorc＝店面窗框、門框的顏色（原本固定鋁色）；wallmat／wainmat＝{'W': 材質…}（那一面牆、腰牆用別的材質）；
    backs＝貼在玻璃上的海報的背面 [(x0, x1, y0, y1, 街上那一張的鍵)]（poster_backs：紙的背面＋透過來的圖案＋膠帶；街上的位置換算用 street_back）；rail＝腰牆上緣的壓條要不要；grid＝店面是鐵件格子窗（直條密一點＋兩道橫條）"""
    s = c.S; X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; wh = s['wainH']; doorc = doorc or frame; wallmat = wallmat or {}; wainmat = wainmat or {}
    fl = Mesh(f'l118_{c.sid}_floorm', M['floor'], tile=s['floor'][2]); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    dx, dw = s['door_x'], 1.0; tc = s.get('trim', '#6b4a30')
    for k in 'NWE':
        wl = c.wg(k, 'wall', wallmat.get(k, M['wall'])); wn = c.wg(k, 'wain', wainmat.get(k, M['wain'])); tr = c.wg(k, 'trim', M['vc'], cm=True)
        if k == 'N': Q = lambda y0, y1: [(X0, y0, Z0), (X1, y0, Z0), (X1, y1, Z0), (X0, y1, Z0)]
        elif k == 'W': Q = lambda y0, y1: [(X0, y0, Z1), (X0, y0, Z0), (X0, y1, Z0), (X0, y1, Z1)]
        else: Q = lambda y0, y1: [(X1, y0, Z0), (X1, y0, Z1), (X1, y1, Z1), (X1, y1, Z0)]
        if k == 'N' and s.get('kpass'): continue                                                   # 後牆有出菜口：LS.kitchen 自己開洞
        wl.quad(Q(wh, H)); wn.quad(Q(0.0, wh))
        ya = (wh - 0.02) if rail else 0.0; yb = (wh + 0.03) if rail else 0.001                    # 沒有壓條：只留踢腳板（那一塊壓扁到看不到）
        if k == 'N': tr.cbox(X0, X1, ya, yb, Z0, Z0 + 0.015, tc); tr.cbox(X0, X1, 0.0, 0.09, Z0, Z0 + 0.012, base)
        elif k == 'W': tr.cbox(X0, X0 + 0.015, ya, yb, Z0, Z1, tc); tr.cbox(X0, X0 + 0.012, 0.0, 0.09, Z0, Z1, base)
        else: tr.cbox(X1 - 0.015, X1, ya, yb, Z0, Z1, tc); tr.cbox(X1 - 0.012, X1, 0.0, 0.09, Z0, Z1, base)
    wl = c.wg('S', 'wall', wallmat.get('S', M['wall'])); wn = c.wg('S', 'wain', wainmat.get('S', M['wain'])); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass'])
    g0, g1, gy0, gy1 = X0 + 0.3, X1 - 0.3, 0.32, 2.6
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    for (xa, xb) in ((X0, g0), (g1, X1)): wl.quad(QS(xa, xb, wh, H)); wn.quad(QS(xa, xb, 0.0, wh))
    wl.quad(QS(g0, g1, gy1, H))
    d0, d1 = dx - dw / 2, dx + dw / 2
    for (xa, xb) in ((g0, d0), (d1, g1)):
        if xb - xa > 0.05: wn.quad(QS(xa, xb, 0.0, gy0))
    fz0, fz1 = Z1 - 0.06, Z1 + 0.02
    fr.cbox(g0, g1, gy1 - 0.0, gy1 + 0.06, fz0, fz1, frame)
    for (xa, xb) in ((g0, d0), (d1, g1)):
        if xb - xa < 0.05: continue
        fr.cbox(xa, xb, gy0 - 0.05, gy0, fz0, fz1, sillc or frame)
        n = max(1, round((xb - xa) / (0.62 if grid else 1.2))); tw = 0.02 if grid else 0.03
        for j in range(n + 1): xx = xa + j * (xb - xa) / n; fr.cbox(xx - tw, xx + tw, gy0, gy1, fz0 - 0.005, fz1 + 0.005, frame)
        if grid:
            for yy in (gy0 + (gy1 - gy0) / 3, gy0 + 2 * (gy1 - gy0) / 3): fr.cbox(xa, xb, yy - 0.018, yy + 0.018, fz0 - 0.003, fz1 + 0.003, frame)
        gl.quad([(xb, gy0, Z1 - 0.02), (xa, gy0, Z1 - 0.02), (xa, gy1, Z1 - 0.02), (xb, gy1, Z1 - 0.02)])
    for xx in (d0, d1): fr.cbox(xx - 0.04, xx + 0.04, 0.0, gy1, fz0 - 0.01, fz1 + 0.01, doorc)
    fr.cbox(d0 + 0.04, d1 - 0.04, 0.0, 0.1, Z1 - 0.045, Z1 + 0.005, doorc); fr.cbox(d0 + 0.04, d1 - 0.04, 2.08, 2.16, Z1 - 0.045, Z1 + 0.005, doorc)
    fr.cbox(d0 + 0.04, d1 - 0.04, 0.0, 0.012, Z1 - 0.1, Z1 + 0.04, '#5f6468')
    gl.quad([(d1 - 0.04, 0.1, Z1 - 0.025), (d0 + 0.04, 0.1, Z1 - 0.025), (d0 + 0.04, 2.08, Z1 - 0.025), (d1 - 0.04, 2.08, Z1 - 0.025)])
    gl.quad([(d1 - 0.04, 2.16, Z1 - 0.025), (d0 + 0.04, 2.16, Z1 - 0.025), (d0 + 0.04, gy1, Z1 - 0.025), (d1 - 0.04, gy1, Z1 - 0.025)])
    fr.cbox(d1 - 0.2, d1 - 0.17, 0.85, 1.35, Z1 - 0.1, Z1 - 0.07, handle)
    tr = c.wg('S', 'trim', M['vc'], cm=True)
    if backs: poster_backs(c, backs)
    vz = Z1 + 2.4; vw = (X1 - X0) * 1.9; vh = vw * 0.5; vy0 = 1.6 - vh / 2
    vm = c.wg('S', 'view', M['view'] if 'view' in M else L.flat(f'l118_{c.sid}_viewflat', '#c9cbc6', rough=0.9))
    uvquad(vm, [(vw / 2, vy0, vz), (-vw / 2, vy0, vz), (-vw / 2, vy0 + vh, vz), (vw / 2, vy0 + vh, vz)], (0.0, 0.0, 1.0, 1.0))
    c.vc.cbox(X0 - LS.NB_W, X1 + LS.NB_W, -0.05, 0.0, Z1, vz, '#9a9893')
    LS.neighbors(c)
    ce = Mesh(f'l118_{c.sid}_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root, uv=False)   # 單面朝下
    c.door = dict(x=dx, w=dw, z=Z1)
    c.spawn = dict(x=dx, z=round(Z1 - 1.5, 3), yaw=PI, note='從門進來、面向店裡')
    c.exits = [dict(x=dx, z=round(Z1 - 0.45, 3), r=0.7, label='離開' + c.T['name'], to='lane118')]


# ================= 天花板上的東西（CEIL_*）=================
def beam(c, x0, x1, z0, z1, d=0.16, col='#4a2f1c'):
    """樑（沒有頂面：貼著天花板）"""
    y = H - d; m = c.cf
    m.poly([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], col, 0.92)
    m.poly([(x0, y, z0), (x0, H, z0), (x1, H, z0), (x1, y, z0)], col); m.poly([(x0, y, z1), (x1, y, z1), (x1, H, z1), (x0, H, z1)], col)
    m.poly([(x0, y, z0), (x0, y, z1), (x0, H, z1), (x0, H, z0)], col, 0.96); m.poly([(x1, y, z0), (x1, H, z0), (x1, H, z1), (x1, y, z1)], col, 0.96)


def cassette_ac(c, x, z, w=0.86, col='#f1efe8'):
    """吸頂式冷氣的面板（沒有頂面）：外框、四邊出風口、中間的回風格柵"""
    y = H - 0.045; m = c.cf; a = w / 2
    m.poly([(x - a, y, z - a), (x + a, y, z - a), (x + a, y, z + a), (x - a, y, z + a)], col)
    for (xa, xb, za, zb) in ((x - a, x + a, z - a, z - a), (x - a, x + a, z + a, z + a), (x - a, x - a, z - a, z + a), (x + a, x + a, z - a, z + a)):
        m.poly([(xa, y, za), (xb, y, zb), (xb, H, zb), (xa, H, za)], col, 0.94)
    g = a * 0.62
    m.poly([(x - g, y - 0.004, z - g), (x + g, y - 0.004, z - g), (x + g, y - 0.004, z + g), (x - g, y - 0.004, z + g)], '#d9d7d0')
    for k in range(-3, 4): m.poly([(x - g, y - 0.006, z + k * g / 3.6 - 0.012), (x + g, y - 0.006, z + k * g / 3.6 - 0.012), (x + g, y - 0.006, z + k * g / 3.6 + 0.012), (x - g, y - 0.006, z + k * g / 3.6 + 0.012)], '#a9a8a2')
    for (dx, dz, lx, lz) in ((0, -a * 0.84, a * 0.7, 0.03), (0, a * 0.84, a * 0.7, 0.03), (-a * 0.84, 0, 0.03, a * 0.7), (a * 0.84, 0, 0.03, a * 0.7)):
        m.poly([(x + dx - lx, y - 0.004, z + dz - lz), (x + dx + lx, y - 0.004, z + dz - lz), (x + dx + lx, y - 0.004, z + dz + lz), (x + dx - lx, y - 0.004, z + dz + lz)], '#55565a')


def pendant2(c, x, z, y=2.55, col='#3a2a1e', r=0.22, seg=12, drop=0.2):
    """吊燈（金屬燈罩＋暖光燈泡）放在 CEIL_*；燈罩底 y ≥ 2.5（遊戲鏡頭在人物後上方，太低會擋住人）。燈罩輪廓出處：lane118_shops.py pendant()"""
    ccyl(c.cf, (x, y + drop, z), (x, H, z), 0.006, '#2a2a2a', seg=4, caps=False)
    clathe(c.cf, [(0.0, drop - 0.015), (r * 0.57, drop * 0.475), (r * 0.97, -0.004), (r, 0.0), (r * 0.6, drop * 0.5), (0.05, drop - 0.01), (0.02, drop)], x, y, z, col, seg=seg)
    ccyl(c.cf, (x, y + drop - 0.01, z), (x, y + drop + 0.05, z), 0.035, col, seg=8)
    c.cw.sphere((x, y + 0.035, z), 0.055, seg=8, rings=5)


def downlight(c, x, z, r=0.06):
    """嵌燈（天花板上一個發光的小圓片）"""
    c.cw.cyl((x, H - 0.012, z), (x, H - 0.004, z), r, seg=10)


# ================= 家具 =================
def chair_slat(c, x, z, yaw, col='#4b2e1c', cush=None, slats=4, back=0.9):
    """木頭直條靠背椅：椅面板（＋坐墊）、四支方腳（後腳往上接椅背）、上下橫木、直條。座面頂 0.47（SIT_TOP）"""
    T = rot(x, z, yaw); v = c.vc; top = SIT_TOP - (0.03 if cush else 0.0)
    rbox(v, T, -0.21, 0.21, top - 0.035, top, -0.158, 0.2, col, r=0.008, seg=1)   # 椅面停在後腳前面（原本和後腳的背面共面：會閃）
    if cush: rbox(v, T, -0.19, 0.19, top, SIT_TOP, -0.15, 0.18, cush)
    for lx in (-0.185, 0.185):
        rbox(v, T, lx - 0.018, lx + 0.018, 0.0, top - 0.035, 0.145, 0.181, col)
        rbox(v, T, lx - 0.018, lx + 0.018, 0.0, back, -0.2, -0.164, col)
    rbox(v, T, -0.167, 0.167, back - 0.075, back - 0.004, -0.196, -0.17, col); rbox(v, T, -0.167, 0.167, top + 0.07, top + 0.105, -0.194, -0.172, col)
    for k in range(slats):
        lx = -0.13 + k * 0.26 / max(1, slats - 1); rbox(v, T, lx - 0.016, lx + 0.016, top + 0.105, back - 0.075, -0.194, -0.176, col)


def table_top(c, x0, x1, z0, z1, h=0.74, t=0.04, legs='posts', legc='#262220', vcol=None):
    """桌子：桌面（木紋材質；vcol 有給＝頂點色）＋桌腳（posts＝兩支黑鐵圓柱＋底盤；four＝四支方腳）"""
    if vcol: c.vc.crbox(x0, x1, h - t, h, z0, z1, vcol, r=0.006, seg=1)
    else: c.wood.rbox(x0, x1, h - t, h, z0, z1, r=0.008, seg=2)
    cz = (z0 + z1) / 2
    if legs == 'posts':
        for px in ((x0 + 0.24, x1 - 0.24) if x1 - x0 > 0.9 else ((x0 + x1) / 2,)):
            ccyl(c.vm, (px, 0.0, cz), (px, h - t, cz), 0.032, legc, seg=8, caps=False); c.vm.cbox(px - 0.03, px + 0.03, 0.0, 0.025, z0 + 0.08, z1 - 0.08, legc); c.vm.cbox(px - 0.2, px + 0.2, h - t - 0.02, h - t, cz - 0.03, cz + 0.03, legc)
    else:
        for lx in (x0 + 0.05, x1 - 0.05):
            for lz in (z0 + 0.05, z1 - 0.05): c.vc.cbox(lx - 0.022, lx + 0.022, 0.0, h - t, lz - 0.022, lz + 0.022, legc)
        c.vc.cbox(x0 + 0.05, x1 - 0.05, h - t - 0.07, h - t, z0 + 0.04, z0 + 0.06, legc); c.vc.cbox(x0 + 0.05, x1 - 0.05, h - t - 0.07, h - t, z1 - 0.06, z1 - 0.04, legc)


def table_unit(c, block, tab, tz, seats_x, aisles, chair, td=0.72, why='table_unit', half=1.0, gap=0.3, zext=None, notop=False, **tk):
    """一張桌子＋兩側的椅子（椅子在桌子的 −z、+z 兩邊，面向桌子），整組一塊導航阻擋。
    block＝(x0, x1)（對齊導航格線）、z 方向 tz±half（zext 有給＝阻擋的 z 範圍）；tab＝桌面的 (x0, x1)；seats_x＝每一邊的椅子 x；gap＝椅子離桌邊；
    aisles＝[(走道邊的 x, 走道在哪一邊 ±1)]：每張椅子從最近的走道坐（ap＝走道邊外 0.35 m）；離 ap 超過 0.6 m 的寫 r（互動半徑），隔著另一張椅子的寫 inner。
    chair＝畫椅子的函式 (c, x, z, yaw)；notop＝桌面呼叫的地方自己畫（併桌）"""
    if not notop: table_top(c, tab[0], tab[1], tz - td / 2, tz + td / 2, **tk)
    for sg in (-1, 1):
        sz = tz + sg * (td / 2 + gap); yaw = 0.0 if sg < 0 else PI
        for sx in seats_x:
            chair(c, sx, sz, yaw); (ex, dr) = min(aisles, key=lambda a: abs(sx - a[0])); ap = (ex + dr * 0.35, sz); d = abs(sx - ap[0])
            c.seat(sx, sz, yaw, ((tab[0] + tab[1]) / 2, tz), 'eat', ap=ap)
            if d > 0.6: c.seats[-1]['r'] = round(d + 0.15, 2)
            if any((s2 - sx) * dr > 0.05 and (ex - s2) * dr > -0.05 for s2 in seats_x if s2 != sx): c.seats[-1]['inner'] = True
    zb = zext or (tz - half, tz + half); c.block(block[0], block[1], zb[0], zb[1], why)
    return ((tab[0] + tab[1]) / 2, tz)


def caddy(c, x, z, col='#5a3a24'):
    """桌上的木頭小盒（紙巾、筷子）＋兩個調味罐"""
    v = c.vc; y = 0.74
    v.cbox(x - 0.07, x + 0.07, y, y + 0.09, z - 0.05, z + 0.05, col); v.cbox(x - 0.055, x + 0.055, y + 0.09, y + 0.135, z - 0.035, z + 0.0, '#f6f3ea')
    for k in range(4): ccyl(v, (x - 0.04 + k * 0.026, y + 0.08, z + 0.025), (x - 0.045 + k * 0.03, y + 0.2, z + 0.03), 0.0045, '#e6d4ae', seg=4, caps=False)
    for (dx, cc) in ((0.12, '#e9e6de'), (0.17, '#a8241a')):
        ccyl(v, (x + dx, y, z), (x + dx, y + 0.075, z), 0.02, cc, seg=6); ccyl(c.vm, (x + dx, y + 0.075, z), (x + dx, y + 0.095, z), 0.021, '#b9bec2', seg=6)


def leaf(m, x, y, z, s, a, tilt, col, k=1.0):
    """一片葉子（菱形的一片，雙面材質）：a＝水平方向、tilt＝往下垂的角度"""
    dx, dz = math.cos(a), math.sin(a); px, pz = -dz, dx; ct, st = math.cos(tilt), math.sin(tilt)
    tip = (x + dx * s * ct, y - s * st, z + dz * s * ct); mid = (x + dx * s * 0.45 * ct, y - s * 0.45 * st + 0.012, z + dz * s * 0.45 * ct)
    m.poly([(x, y, z), (mid[0] + px * s * 0.34, mid[1], mid[2] + pz * s * 0.34), tip, (mid[0] - px * s * 0.34, mid[1], mid[2] - pz * s * 0.34)], col, k)


def vine(c, m, x, y, z, length, seed, n=None, spread=0.08, col='#5f9a3c', out=(0.0, 0.0)):
    """垂下來的黃金葛：一條細莖＋一片片葉子；out＝往室內偏的方向（單位向量）"""
    if getattr(c, 'ph', None):   # CC0 的店（BB 11-13：頂點色的垂藤 FAIL）：Poly Haven 蕨類（葉子往下垂），同一個地方 0.35 m 內只放一叢
        ferns = c.__dict__.setdefault('_ferns', [])
        if any(abs(x - fx) + abs(z - fz) < 0.35 and abs(y - fy) < 0.3 for (fx, fy, fz) in ferns): return
        ferns.append((x, y, z)); c.ph.put('fern_02', x + out[0] * 0.12, y - 0.05, z + out[1] * 0.12, random.Random(seed).uniform(0, 6.283), s=0.28 + 0.12 * min(length, 1.5), share=True, decimate=0.12, texres=256); return
    rr = random.Random(seed); n = n or int(length / 0.075)
    ccyl(m, (x, y, z), (x + out[0] * 0.03, y - length, z + out[1] * 0.03), 0.004, '#4a6a2c', seg=3, caps=False)
    for k in range(n):
        t = (k + 0.5) / n; a = rr.uniform(0, 2 * PI)
        leaf(m, x + out[0] * (0.03 + 0.04 * rr.random()) + rr.uniform(-spread, spread) * abs(out[1]), y - t * length, z + out[1] * (0.03 + 0.04 * rr.random()) + rr.uniform(-spread, spread) * abs(out[0]),
             rr.uniform(0.07, 0.11), a if not any(out) else math.atan2(out[1], out[0]) + rr.uniform(-1.2, 1.2), rr.uniform(0.5, 1.2), col, rr.uniform(0.8, 1.15))


def pot_plant(c, x, z, y=0.0, h=0.5, pot='#b9623a', col='#4f8f37', seed=1, r=0.13, m=None, n=16):
    """盆栽（陶盆＋一叢葉子）：m＝放進哪一個頂點色網格（預設 c.vc）"""
    if getattr(c, 'ph', None):   # CC0 的店：Poly Haven 掃描盆栽（小的 potted_plant_02、落地的大盆 pachira_aquatica_01）
        hh = h * 1.6 if h >= 0.55 else max(0.25, h * 1.1)   # 落地的也用有陶盆的 potted_plant_02 放大（pachira 沒有盆子：LAWWW2-C 11-13 退件「像從地磚長出來」）
        c.ph.put('potted_plant_02', x, y, z, random.Random(seed).uniform(0, 6.283), s=hh / 0.6, share=True, height=0.6, part_faces=400, texres=256); return   # share：同一種盆栽共用一份網格（GLB 只存一次）；這幾間不烘光照。減面：每間店 GLB 1.5 倍、6 萬三角形以內（tests/l118_int_home_cafe2_1111_unit.js 第 5 項）
    m = m or c.vc; rr = random.Random(seed)
    clathe(m, [(0.0, 0.0), (r * 0.72, 0.0), (r, r * 1.5), (r * 1.06, r * 1.6), (0.0, r * 1.6)], x, y, z, pot, seg=10)
    for k in range(n):
        a = rr.uniform(0, 2 * PI); hh = rr.uniform(0.35, 1.0) * h; rd = rr.uniform(0.0, r * 0.6)
        leaf(m, x + rd * math.cos(a), y + r * 1.6 + hh, z + rd * math.sin(a), rr.uniform(0.14, 0.22) * (h / 0.5) ** 0.5, a, rr.uniform(-0.3, 0.8), col, rr.uniform(0.8, 1.15))
        if k % 3 == 0: ccyl(m, (x, y + r * 1.5, z), (x + rd * math.cos(a), y + r * 1.6 + hh, z + rd * math.sin(a)), 0.005, '#4a6a2c', seg=3, caps=False)


def plates(m, x, y, z, n=6, r=0.115, col='#f4f1ea'):
    """一疊盤子"""
    for k in range(n): clathe(m, [(0.0, 0.0), (r * 0.55, 0.0), (r, 0.018), (r, 0.024), (0.0, 0.01)], x, y + k * 0.013, z, col, seg=10)


def basket(m, x0, x1, y, z0, z1, h=0.2, col='#c9a56a'):
    """藤籃（上緣一圈深一點、兩條橫的編織線）"""
    m.cbox(x0, x1, y, y + h, z0, z1, col); m.cbox(x0 - 0.006, x1 + 0.006, y + h - 0.03, y + h, z0 - 0.006, z1 + 0.006, '#a8834a')
    for k in (0.33, 0.62): m.cbox(x0 - 0.003, x1 + 0.003, y + h * k, y + h * k + 0.012, z0 - 0.003, z1 + 0.003, '#b8935a')


def noren(m, x0, x1, y0, y1, z, n, col, band=None, gap=0.012, wave=0.018):
    """短門簾（一片一片的布，中間有縫；每片微微折一下）：掛在 z 這一條線上、沿 x"""
    w = (x1 - x0) / n
    for k in range(n):
        a, b = x0 + k * w + gap / 2, x0 + (k + 1) * w - gap / 2; mid = (a + b) / 2; zz = z + (wave if k % 2 else -wave) * 0.5
        m.poly([(a, y0, z), (mid, y0, zz + wave), (mid, y1, z + 0.004), (a, y1, z)], col, 1.0); m.poly([(mid, y0, zz + wave), (b, y0, z), (b, y1, z), (mid, y1, z + 0.004)], col, 0.93)
    if band: m.cbox(x0 - 0.03, x1 + 0.03, y1 - 0.01, y1 + 0.035, z - 0.014, z + 0.014, band)


def print_quad(c, mesh, pts, key):
    """不貼在牆上的印刷品（立牌、掛在攤架上的匾）：pts＝左下、右下、右上、左上（從正面看）"""
    uvquad(mesh, pts, LS.TX.uv(c.REG, key))


def framed(c, side, a0, a1, y0, y1, key, col='#4a2e1c', t=0.035):
    LS.frame_board(c, side, a0, a1, y0, y1, col, t=t); LS.printed(c, side, a0, a1, y0, y1, key, inset=0.014)


def a_board(c, x, z, yaw, key, w=0.56, h=0.95, col='#5a3a22', spread=0.24):
    """A 字立牌（兩片斜板；正面貼印刷品）：正面朝 yaw"""
    T = rot(x, z, yaw); v = c.vc; fx, fz = math.sin(yaw), math.cos(yaw)
    for sg in (1, -1):
        bl, br_, tl, tr_ = T(-w / 2, sg * spread), T(w / 2, sg * spread), T(-w / 2, sg * 0.02), T(w / 2, sg * 0.02)        # 從正面看：左下、右下、左上、右上（LS.rot 的 lx＝從正面看的人的右手邊；第 1 版寫反了，字是鏡像的）
        pts = [(bl[0], 0.02, bl[1]), (br_[0], 0.02, br_[1]), (tr_[0], h, tr_[1]), (tl[0], h, tl[1])]
        v.poly(pts, col)
        if sg > 0:
            def P(u, t):
                a = [pts[0][i] + (pts[1][i] - pts[0][i]) * u for i in range(3)]; b = [pts[3][i] + (pts[2][i] - pts[3][i]) * u for i in range(3)]
                q = [a[i] + (b[i] - a[i]) * t for i in range(3)]; return (q[0] + fx * 0.012, q[1] + 0.003, q[2] + fz * 0.012)
            print_quad(c, c.prt, [P(0.08, 0.07), P(0.92, 0.07), P(0.92, 0.95), P(0.08, 0.95)], key)
    for sx in (-w / 2, w / 2):
        for sg in (1, -1):
            a = T(sx, sg * (spread + 0.01)); b = T(sx, sg * 0.01); ccyl(v, (a[0], 0.0, a[1]), (b[0], h + 0.03, b[1]), 0.016, shade_hex(col, 0.8), seg=4)


def shade_hex(h, k): return '#%02x%02x%02x' % shade(hexrgb(h), k)


# ======================================================================
# 奈良咖哩（omu）
# ======================================================================
OMU_REG = {'NAME': (0, 0, 704, 176), 'HOURS': (704, 0, 1024, 176), 'P1': (0, 176, 256, 496), 'P2': (256, 176, 512, 496), 'P3': (512, 176, 768, 496), 'P4': (768, 176, 1024, 496),
           'NOREN': (0, 496, 400, 880), 'TODAY': (400, 496, 720, 880), 'ABOARD': (720, 496, 1024, 1024), 'SPICE': (0, 880, 720, 1024)}
OMU_MENU = [('豬排咖哩', 190), ('雞肉咖哩', 180), ('牛肉咖哩', 210), ('可樂餅咖哩', 170)]   # 使用者文字規格（L118_SHOPS_REDO_1111.md 第二節 8）
OMU_NAME = '奈良咖哩'


def omu_atlas(hours):
    R = OMU_REG; im = Image.new('RGB', (1024, 1024), '#808080'); br = hexrgb('#4a2c14'); ye = '#e3a82f'
    # NAME：木匾（淺木底、深咖啡字，兩邊各三道短線）
    w, h = 704, 176; a = wood_tex(w, h, '#d8b47a', 11); d = ImageDraw.Draw(a); ctext(d, w / 2, 26, OMU_NAME, F(116), br)
    for sx in (60, w - 150):
        for k in range(3): d.rectangle([sx, 66 + k * 18, sx + 90, 70 + k * 18], fill=br)
    d.rectangle([3, 3, w - 4, h - 4], outline=shade(hexrgb('#d8b47a'), 0.72), width=5); put(im, R, 'NAME', a)
    # HOURS：營業時間
    w, h = 320, 176; a = paper(w, h, '#fbf6e8', 7); d = ImageDraw.Draw(a); ctext(d, w / 2, 14, '營業時間', F(40), (60, 44, 30)); yy = 70
    for ln in hours.split('；'): ctext(d, w / 2, yy, ln, fit(d, ln, w - 24, 30), (80, 64, 50)); yy += 42
    d.rectangle([3, 3, w - 4, h - 4], outline=hexrgb(ye), width=5); put(im, R, 'HOURS', a)
    # P1～P4：四張咖哩飯的照片（品名照規格）
    for key, kind, cap in (('P1', 'curry_cutlet', '豬排咖哩'), ('P2', 'curry_chicken', '雞肉咖哩'), ('P3', 'curry_beef', '牛肉咖哩'), ('P4', 'curry_croquette', '可樂餅咖哩')): put(im, R, key, poster(256, 320, kind, cap))
    # NOREN：掛在牆上的黃色布簾（店名直排兩行）
    w, h = 400, 384; a = Image.new('RGB', (w, h), ye); d = ImageDraw.Draw(a); b = hexrgb(ye)
    for k in range(1, 4): d.line([(k * w / 4, 60), (k * w / 4, h)], fill=shade(b, 0.78), width=3)
    for x in range(0, w, 5): d.line([(x, 0), (x, h)], fill=shade(b, 0.97 + 0.05 * ((x * 7) % 11) / 11), width=2)
    d.rectangle([0, h - 46, w, h - 34], fill=br); d.rectangle([0, h - 26, w, h - 18], fill=br)
    for i, ch in enumerate(OMU_NAME): ctext(d, 50 + i * 100, 110, ch, F(92), br)
    put(im, R, 'NOREN', a.filter(ImageFilter.GaussianBlur(0.6)))
    # TODAY：黃色的「本日咖哩」牌（四樣＋價錢）
    w, h = 320, 384; a = Image.new('RGB', (w, h), '#e9b23a'); d = ImageDraw.Draw(a); d.rectangle([5, 5, w - 6, h - 6], outline=br, width=4)
    ctext(d, w / 2, 20, '本日咖哩', F(52), br); d.line([(30, 92), (w - 30, 92)], fill=br, width=3)
    menu_lines(d, 26, w - 26, 112, OMU_MENU, 32, br, br, gap=62, dots=True); put(im, R, 'TODAY', a)
    # ABOARD：門口的 A 字黑板立牌
    w, h = 304, 528; a = chalk(w, h, '#33302b', 5); d = ImageDraw.Draw(a); ctext(d, w / 2, 22, OMU_NAME, F(54), (244, 232, 204)); d.line([(50, 92), (w - 50, 92)], fill=(214, 190, 140), width=3)
    d.rounded_rectangle([22, 108, w - 22, 322], radius=10, fill=hexrgb('#e9b23a')); menu_lines(d, 36, w - 36, 122, OMU_MENU, 27, br, br, gap=48, dots=True)
    ph = dish('curry_cutlet', 240, 180); a.paste(ph, (32, 336)); d.rectangle([32, 336, 271, 515], outline=(214, 190, 140), width=3); put(im, R, 'ABOARD', a)
    # SPICE：辣度的小牌子
    w, h = 720, 144; a = paper(w, h, '#fbf3df', 9); d = ImageDraw.Draw(a); d.rectangle([4, 4, w - 5, h - 5], outline=br, width=4)
    ctext(d, w / 2, 34, '辣度　不辣・小辣・中辣', F(58), br); put(im, R, 'SPICE', a)
    return im


def omu_chair(c, x, z, yaw): chair_slat(c, x, z, yaw, col='#4b2e1c', cush='#6e4a38')


def build_omu():
    sid = 'omu'; sd = shop_data(sid); hours = sd['hours']['text']
    assert [tuple(m) for m in sd['menu']] == OMU_MENU and sd['name'] == OMU_NAME, '店家資料和這裡寫的菜單不一樣'
    spec = dict(floor=('laminate_floor_02', '#c79d69', 1.2), wall='#f2e1b9', wain=('dark_wood', '#5c3a25', 1.2), wainH=0.95, wood=('walnut_veneer', '#6a442c'),
                trim='#4a2e1c', ceil='#ecdfbf', noren='#7a3d24', kpass=True)   # 地板：中等偏淺的暖木色（D112：不准深色木地板；參考圖也是這個深淺）
    c = begin(sid, spec, OMU_REG, omu_atlas(hours)); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; v = c.vc; DW = '#4b2e1c'
    dd_x = c.S['door_x']
    shell2(c, frame='#4a2e1c', doorc='#4a2e1c', handle='#b08a4a', backs=[street_back(c, 'omu_p1', -2.35, 1.25, 0.8, 1.2, step=0.06), street_back(c, 'omu_p2', -1.05, 1.25, 0.8, 1.2, step=0.06)])   # 海報的背面：照街上那兩張（wz_shopkit.py SHOPS['omu'] photos；原本 x −0.32～0.45、0.85～1.62，y 1.0～1.9 的米白方塊）
    LS.kitchen(c, -1.0, 2.2, depth=1.6, win=(1.02, 1.95), door=(-2.7, -1.9))
    # ---- 最裡面：木造出餐檯（檯面、開放層架：盤子、藤籃）＋攤架（兩支柱子、橫木、黃色短門簾、木匾）----
    cx0, cx1, cz0, cz1, ch = -1.3, 2.5, Z0 + 0.95, Z0 + 1.5, 1.0
    c.wood.rbox(cx0 - 0.03, cx1 + 0.03, ch - 0.05, ch, cz0 - 0.03, cz1 + 0.04, r=0.008, seg=2)
    v.cbox(cx0, cx1, 0.0, ch - 0.05, cz0, cz0 + 0.04, '#553621'); v.cbox(cx0, cx1, 0.0, 0.08, cz0, cz1, '#3a2416')                      # 背板、底座
    for xx in (cx0, -0.05, 1.2, cx1 - 0.05): v.cbox(xx, xx + 0.05, 0.08, ch - 0.05, cz0, cz1, '#5a3a24')                                   # 立板
    v.cbox(cx0, cx1, 0.5, 0.535, cz0, cz1, '#5a3a24')                                                                                      # 中間的層板
    for k in range(3): plates(v, -0.95 + k * 0.32, 0.535, cz1 - 0.2, n=5 + k % 2)
    for k in range(2): plates(v, 0.35 + k * 0.4, 0.535, cz1 - 0.2, n=6, r=0.1, col='#3a3532')
    for k in range(2): plates(v, 1.6 + k * 0.4, 0.535, cz1 - 0.2, n=4, col='#efe6d2')
    basket(v, -1.1, -0.65, 0.08, cz1 - 0.42, cz1 - 0.06); basket(v, -0.55, -0.12, 0.08, cz1 - 0.42, cz1 - 0.06)
    basket(v, 0.15, 0.6, 0.08, cz1 - 0.42, cz1 - 0.06, col='#e6d2a4'); basket(v, 0.7, 1.12, 0.08, cz1 - 0.42, cz1 - 0.06, col='#e6d2a4')
    basket(v, 1.38, 1.85, 0.08, cz1 - 0.42, cz1 - 0.06); basket(v, 1.95, 2.4, 0.08, cz1 - 0.42, cz1 - 0.06)
    zt = (cz0 + cz1) / 2
    LS.register(c, -0.95, ch, zt, face='+z')
    v.crbox(-0.48, -0.12, ch, ch + 0.3, zt - 0.17, zt + 0.17, '#f3f0e8', r=0.04, seg=2); v.cbox(-0.42, -0.18, ch + 0.3, ch + 0.325, zt - 0.1, zt + 0.1, '#d9d6cc'); v.cbox(-0.4, -0.2, ch + 0.08, ch + 0.16, zt + 0.17, zt + 0.175, '#3a3a3a')   # 電子鍋
    clathe(c.vm, [(0.0, 0.0), (0.2, 0.0), (0.21, 0.03), (0.21, 0.34), (0.2, 0.36), (0.0, 0.36)], 0.3, ch, zt, '#c4c8cb', seg=14)           # 不鏽鋼保溫鍋
    clathe(v, [(0.0, 0.0), (0.205, 0.0), (0.16, 0.05), (0.03, 0.065), (0.03, 0.1), (0.0, 0.1)], 0.3, ch + 0.36, zt, '#2a2a2a', seg=14)
    clathe(v, [(0.0, 0.0), (0.17, 0.0), (0.185, 0.2), (0.19, 0.21), (0.0, 0.21)], 0.85, ch, zt, '#6a4a30', seg=12)                         # 咖哩鍋
    clathe(v, [(0.0, 0.0), (0.185, 0.0), (0.03, 0.035), (0.0, 0.06)], 0.85, ch + 0.21, zt, '#5a3c26', seg=12)
    ccyl(v, (1.08, ch, zt + 0.12), (1.08, ch + 0.12, zt + 0.12), 0.04, '#c9ced2', seg=8)
    for k in range(3): ccyl(v, (1.07 + k * 0.012, ch + 0.1, zt + 0.12), (1.05 + k * 0.03, ch + 0.26, zt + 0.1), 0.005, '#8a6a48', seg=3, caps=False)   # 湯勺筒
    plates(v, 1.3, ch, zt - 0.02, n=8, r=0.12)
    # 可樂餅保溫櫃（玻璃櫃、兩層、裡面是暖光）
    gx0, gx1, gz0, gz1 = 1.55, 2.42, zt - 0.2, zt + 0.22; gl = c.extra.setdefault('cglass', Mesh('l118_omu_caseglass', c.M['glass']))
    v.cbox(gx0, gx1, ch, ch + 0.06, gz0, gz1, '#b9bec2')
    for (a, b) in ((gx0, gz0), (gx0, gz1), (gx1, gz0), (gx1, gz1)): c.vm.cbox(a - 0.012, a + 0.012, ch + 0.06, ch + 0.5, b - 0.012, b + 0.012, '#b9bec2')
    c.vm.cbox(gx0, gx1, ch + 0.5, ch + 0.53, gz0, gz1, '#b9bec2'); c.warm.box(gx0 + 0.04, gx1 - 0.04, ch + 0.49, ch + 0.5, gz0 + 0.04, gz1 - 0.04)
    gl.quad([(gx0, ch + 0.06, gz1), (gx1, ch + 0.06, gz1), (gx1, ch + 0.5, gz1), (gx0, ch + 0.5, gz1)]); gl.quad([(gx0, ch + 0.06, gz0), (gx0, ch + 0.06, gz1), (gx0, ch + 0.5, gz1), (gx0, ch + 0.5, gz0)])
    gl.quad([(gx1, ch + 0.06, gz1), (gx1, ch + 0.06, gz0), (gx1, ch + 0.5, gz0), (gx1, ch + 0.5, gz1)])
    for (yy, n) in ((ch + 0.07, 5), (ch + 0.28, 4)):
        c.vm.cbox(gx0 + 0.03, gx1 - 0.03, yy, yy + 0.012, gz0 + 0.03, gz1 - 0.03, '#d9dcde')
        for k in range(n): csph(v, (gx0 + 0.13 + k * (gx1 - gx0 - 0.26) / (n - 1), yy + 0.04, zt + (0.05 if k % 2 else -0.04)), 0.062, '#d49a3c', seg=7, rings=4, sy=0.55)
    c.block(cx0, X1, Z0, cz1 + 0.03, 'counter'); c.counter = dict(x0=cx0, x1=cx1, z0=cz0, z1=cz1, h=ch, note='木造出餐檯（上面是黃色短門簾和木匾；後面出菜口看得到廚房）')
    c.clerk = dict(x=0.4, z=round(Z0 + 0.5, 3), yaw=0.0, note='出餐檯後面（電子鍋和保溫鍋後面），面向店裡；店員＝綁頭巾的姊姊（AA_772 staff）')
    c.order = dict(x=-0.9, z=round(cz1 + 0.6, 3), r=0.8, label='點餐（' + c.T['name'] + '）', note='出餐檯左端的收銀前面（shop118:omu）')
    st = c.wg('N', 'stall', c.M['vc'], cm=True); sp = c.wg('N', 'stallprint', c.M['print']); zs = cz1 + 0.02
    c.WGP[('N', 'stall')] = c.WGP[('N', 'stallprint')] = {'at': [0.6, 1.6, round(zs, 3)]}                                                   # 攤架在後牆前面 1.5 m：淡出判斷點放在攤架這一條線上
    for xx in (cx0 - 0.05, cx1 + 0.05): st.cbox(xx - 0.055, xx + 0.055, 0.0, H, zs - 0.055, zs + 0.055, DW)
    st.cbox(cx0 - 0.1, cx1 + 0.1, 2.08, 2.22, zs - 0.05, zs + 0.05, DW); st.cbox(cx0 - 0.05, cx1 + 0.05, 2.22, H, zs - 0.02, zs + 0.0, '#efdcae')   # 橫木、上面的板
    noren(st, cx0 + 0.02, cx1 - 0.02, 1.7, 2.08, zs + 0.03, 9, '#e3a82f', band=None)
    st.cbox(-0.56, 1.76, 2.33, 2.98, zs + 0.0, zs + 0.025, '#6a442c')                                                                       # 木匾的框
    print_quad(c, sp, [(-0.5, 2.38, zs + 0.03), (1.7, 2.38, zs + 0.03), (1.7, 2.93, zs + 0.03), (-0.5, 2.93, zs + 0.03)], 'NAME')
    # 右後角：矮櫃＋盆栽、後牆的黃色「本日咖哩」牌、東牆的層板和黃金葛
    v.crbox(2.62, X1 - 0.02, 0.0, 0.9, Z0 + 0.02, Z0 + 0.5, '#5a3a24', r=0.008, seg=1); v.cbox(2.6, X1, 0.9, 0.93, Z0, Z0 + 0.52, '#6a442c')
    pot_plant(c, 2.82, Z0 + 0.26, 0.93, h=0.3, seed=3, r=0.09, pot='#f1ece0'); pot_plant(c, 3.08, Z0 + 0.3, 0.93, h=0.22, seed=4, r=0.07, pot='#f1ece0', col='#6aa63a')
    framed(c, 'N', 2.56, 3.2, 1.45, 2.22, 'TODAY', col='#4a2e1c')
    trE = c.wg('E', 'trim', c.M['vc'], cm=True); trW = c.wg('W', 'trim', c.M['vc'], cm=True)
    trE.cbox(X1 - 0.24, X1, 2.3, 2.335, -3.7, -2.7, DW)
    for zz in (-3.6, -2.8): trE.cbox(X1 - 0.2, X1, 2.12, 2.3, zz - 0.015, zz + 0.015, DW)
    pot_plant(c, X1 - 0.13, -3.45, 2.335, h=0.2, seed=6, r=0.075, m=trE, pot='#b9623a'); vine(c, trE, X1 - 0.22, 2.33, -3.2, 0.8, 21, out=(-1, 0)); vine(c, trE, X1 - 0.22, 2.33, -2.85, 0.55, 22, out=(-1, 0))
    # ---- 桌椅：左牆兩張雙人桌、中間一張四人桌、右牆三張四人桌（深木桌面、黑鐵桌腳、深木直條椅＋咖啡色坐墊）；共 20 席 ----
    #   （第 1 版中間兩張、24 席：遊戲的店內客人同時最多 10 位，位子太多的店看起來永遠空空的——tests/shop_diners_unit.js「坐滿約四到六成」；參考圖也是五張桌子上下）
    for tz in (-1.0, 1.0):
        t = table_unit(c, (X0, -2.5), (-3.26, -2.56), tz, [-2.9], [(-2.5, 1)], omu_chair); caddy(c, t[0] - 0.12, t[1])
    for tz in (1.0,):
        t = table_unit(c, (-0.9, 0.3), (-0.88, 0.28), tz, [-0.6, 0.0], [(-0.9, -1), (0.3, 1)], omu_chair); caddy(c, t[0] - 0.1, t[1])
    for tz in (-1.4, 0.6, 2.6):
        t = table_unit(c, (1.9, X1), (1.96, 3.26), tz, [2.28, 2.92], [(1.9, -1)], omu_chair); caddy(c, t[0] + 0.25, t[1])
    # ---- 牆上：左牆（門邊）黃色布簾、兩張咖哩飯照片、層板和黃金葛；右牆兩張照片、辣度牌、層板 ----
    LS.printed(c, 'W', 2.25, 3.45, 1.2, 2.35, 'NOREN', inset=0.03); trW.cbox(X0, X0 + 0.05, 2.36, 2.39, 2.15, 3.55, DW)                      # 布簾的掛桿
    for zz in (2.2, 3.5): trW.cbox(X0, X0 + 0.06, 2.34, 2.41, zz - 0.012, zz + 0.012, '#b08a4a')
    framed(c, 'W', 0.6, 1.4, 1.22, 2.22, 'P1'); framed(c, 'W', -1.4, -0.6, 1.22, 2.22, 'P2')
    trW.cbox(X0, X0 + 0.24, 2.5, 2.535, -0.5, 1.9, DW)
    for zz in (-0.35, 0.7, 1.75): trW.cbox(X0, X0 + 0.2, 2.34, 2.5, zz - 0.015, zz + 0.015, DW)
    rr = c.rng
    for k in range(5): trW.cbox(X0 + 0.04, X0 + 0.2, 2.535, 2.535 + rr.uniform(0.12, 0.22), 0.1 + k * 0.16, 0.1 + k * 0.16 + rr.uniform(0.08, 0.13), rr.choice(['#c9a56a', '#8a6a4a', '#e6d2a4', '#a8543a']))
    for k in range(3): clathe(trW, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.13), (0.03, 0.15), (0.0, 0.16)], X0 + 0.12, 2.535, -0.3 + k * 0.13, rr.choice(['#e0c070', '#c89040', '#e8d8a0']), seg=6)
    pot_plant(c, X0 + 0.13, 1.6, 2.535, h=0.22, seed=8, r=0.08, m=trW); vine(c, trW, X0 + 0.22, 2.53, 1.82, 1.0, 31, out=(1, 0)); vine(c, trW, X0 + 0.22, 2.53, 1.5, 0.6, 32, out=(1, 0)); vine(c, trW, X0 + 0.22, 2.53, -0.45, 0.75, 33, out=(1, 0))
    framed(c, 'E', -1.8, -1.0, 1.22, 2.22, 'P3'); framed(c, 'E', 0.2, 1.0, 1.22, 2.22, 'P4'); LS.printed(c, 'E', 1.55, 2.55, 1.62, 1.82, 'SPICE')
    trE.cbox(X1 - 0.24, X1, 2.5, 2.535, 2.0, 3.5, DW)
    for zz in (2.15, 3.35): trE.cbox(X1 - 0.2, X1, 2.34, 2.5, zz - 0.015, zz + 0.015, DW)
    pot_plant(c, X1 - 0.13, 3.2, 2.535, h=0.22, seed=9, r=0.08, m=trE); vine(c, trE, X1 - 0.22, 2.53, 3.4, 0.9, 41, out=(-1, 0)); vine(c, trE, X1 - 0.22, 2.53, 2.9, 0.5, 42, out=(-1, 0))
    for k in range(4): clathe(trE, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.13), (0.03, 0.15), (0.0, 0.16)], X1 - 0.12, 2.535, 2.15 + k * 0.14, rr.choice(['#e0c070', '#c89040', '#e8d8a0']), seg=6)
    c.look('curry_photos', -2.3, 1.0, 0.8, '牆上的咖哩飯照片', note='（牆上的照片都是咖哩飯。每一張的福神漬都放在同一個位置。）', dev='AA_772 look_lines omu；左牆兩張、右牆兩張都是咖哩飯的照片（福神漬畫在同一個位置）')
    LS.printed(c, 'S', dd_x + 0.55, dd_x + 1.0, 1.28, 1.53, 'HOURS', inset=0.03)
    # ---- 門邊：A 字立牌、盆栽 ----
    a_board(c, -0.55, 3.55, -PI / 2, 'ABOARD')                                                                                            # 中間那一排桌子和店面玻璃之間：立牌朝門口、木箱上的盆栽
    v.cbox(-0.2, 0.2, 0.0, 0.32, 3.34, 3.74, '#8a6a48'); v.cbox(-0.22, 0.22, 0.32, 0.35, 3.32, 3.76, '#6a4a30'); pot_plant(c, 0.0, 3.54, 0.35, h=0.5, seed=12, r=0.13, n=20, col='#5f9a3c')
    c.block(-0.9, 0.3, 3.2, Z1, 'a_board_plant')
    pot_plant(c, X0 + 0.22, 2.25, 0.0, h=0.7, seed=13, r=0.14, n=22, pot='#8a5a3a')
    # ---- 天花板：深木格子樑、錐形吊燈、嵌燈、吸頂冷氣 ----
    for zz in (-2.55, -0.9, 0.75, 2.4): beam(c, X0, X1, zz - 0.07, zz + 0.07)
    for xx in (-1.7, 0.0, 1.7): beam(c, xx - 0.07, xx + 0.07, Z0, Z1, d=0.15)
    beam(c, X0, X0 + 0.1, Z0, Z1, d=0.2); beam(c, X1 - 0.1, X1, Z0, Z1, d=0.2); beam(c, X0, X1, Z1 - 0.1, Z1, d=0.2)
    lamps = [(-2.75, -1.0), (-2.75, 1.0), (-0.3, 1.0), (-1.6, -1.5), (2.6, -1.4), (2.6, 0.6), (2.6, 2.6)]
    for (x_, z_) in lamps: pendant2(c, x_, z_, 2.52, '#3a2a1e', r=0.24)
    for (x_, z_) in ((-0.85, -1.7), (0.85, -1.7), (-0.85, 1.6), (0.85, 3.2), (-2.2, 3.1), (-1.4, -3.2), (0.6, -3.3), (1.9, -3.3)): downlight(c, x_, z_)
    cassette_ac(c, 0.85, -0.1)
    lay = end(c, 'L118-SHOPS-REDO-1111（使用者 2026-11-11 規格＋參考圖 int_omu.webp）；店名、菜單 AA_280；室內 tools/blender/env_second/l118_int_omu.py（LAWWW 子代理代 LAWWW2）')
    if '--preview' in ARGS:
        pts = [(x_, 2.45, z_, 55) for (x_, z_) in lamps] + [(0.6, 2.6, Z0 + 0.6, 60), (0.6, 2.4, Z0 - 0.8, 80), (-1.5, 2.8, -2.6, 40), (0.0, 2.8, 3.0, 40)]
        preview(sid, [['door', [dd_x + 0.25, 1.5, Z1 - 0.3], [0.9, 1.15, Z0 + 0.6], 17], ['back', [0.2, 1.75, Z0 + 1.75], [-0.6, 1.0, Z1], 15]], pts, samples=28)
    return lay


if __name__ == '__main__':
    build_omu()
