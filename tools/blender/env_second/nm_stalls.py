"""公館／汀州路夜市十攤＋背景三攤（NIGHT-MARKET-1110，USER_WANTS X326；LAWWW2 帳號 A 2026-11-11）→ assets/models/env/second_ai/tingzhou_stalls.glb（＋.json）
規格 dev docs/handoff/user_specs/NIGHT_MARKET_1110.md；參考圖（使用者生成的十張）docs/art-rebuild/second_ai/ref/night_market_1110/concept/stall_01..10_*.webp。
做法（RULES_2D_TO_3D）：招牌、菜單、正面的圖、布旗從參考圖裁（nm_stalls_tex.py → textures/gen/nm_stalls_atlas.jpg）；攤體、棚、器具、食物是模型。
  店名、口味、價錢以圖為準（使用者定的店名不改）。背景三攤（套圈圈、手機殼、襪子）不取名，只寫賣的東西。舊的刈包攤、算命攤拿掉（算命改成小店「禮貌生財」X332）。
每一攤兩個節點（原點＝攤車中心的地面；+z＝客人那一面；本地 x＝攤車的長邊；營業、收攤同一個原點）：
  STALL_<代號>_open    營業      STALL_<代號>_closed  收攤（每一攤自己的輪廓和規格指定的帆布顏色，不共用一個方盒）
四種尺寸：小推車（紅豆餅、地瓜球、雞蛋糕、甘蔗汁）、中型（鮮奶、蔥油餅、炸豆腐）、中型寬（胡椒餅、烤玉米）、較大型（甜湯：加兩張紅折疊桌、六張紅凳）。
材質三個：tzs_vc（頂點色）、tzs_atlas（招牌、菜單；自己發光，遊戲照晚上的程度調亮）、tzs_glow（燈泡、炭火；頂點色自己發光）。
  /opt/blenv/bin/python tools/blender/env_second/nm_stalls.py [-- --out <glb>] [--grid 1]"""
import os, sys, math, json, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, CMesh, g2b, bpy   # noqa: E402
import tz_stalls as T   # noqa: E402  舊攤位的共用零件（Stall、瓦斯桶、水桶、板凳）

OUT = os.path.join(L.ROOT, T.arg('--out', 'assets/models/env/second_ai/tingzhou_stalls.glb'))
GEN = os.path.join(HERE, 'textures', 'gen')
CH = 0.85
STEEL, STEEL_D, BLACK, WOOD, WALNUT, GOLD = '#c9ccd0', '#8f9498', '#26282a', '#a8845a', '#4a2f1e', '#c9a03a'
BULB = '#fff0c8'

# 代號 → 店名、尺寸分類、攤體長×深、導航擋的範圍（長、深、往後偏）、開收時間（跨午夜寫 24 以上）、收攤帆布顏色（規格 4.3）、能不能買
KINDS = [
    ('milk',      '沈三盃黑糖鮮奶',     'M',  2.0, 0.9,  (2.9, 1.7, 0.25), (14.0, 23.0), '#4a3526', True),
    ('pepper',    '皇家高端胡椒餅',     'MW', 2.4, 0.9,  (3.3, 1.7, 0.25), (17.0, 23.0), '#7a1c22', True),
    ('wheelcake', '二十元紅豆餅',       'S',  1.5, 0.7,  (2.4, 1.5, 0.25), (15.5, 21.5), '#6a7f94', True),
    ('ball',      '一個地球',           'S',  1.5, 0.7,  (2.4, 1.5, 0.25), (16.5, 23.0), '#1f2f5a', True),
    ('scallion',  '當蔥蔥油餅',         'M',  2.0, 0.9,  (2.9, 1.7, 0.25), (16.5, 22.5), '#6f8a72', True),
    ('stinky',    '紹興炸豆腐',         'M',  2.0, 0.9,  (3.1, 1.8, 0.25), (17.5, 24.5), '#5a1a26', True),
    ('corn',      '玉皇大帝',           'MW', 2.4, 0.9,  (3.3, 1.7, 0.25), (17.5, 24.0), '#1e1e20', True),
    ('eggcake',   '陳家古早味雞蛋糕',   'S',  1.5, 0.75, (2.5, 1.5, 0.25), (15.5, 21.5), '#857565', True),
    ('cane',      '節節高甘蔗汁',       'S',  1.8, 0.75, (3.0, 1.5, 0.25), (14.0, 22.0), '#a8c89a', True),
    ('jelly',     '公館阿婆甜湯',       'L',  2.8, 1.0,  (6.2, 2.0, 0.2),  (15.0, 23.5), '#a8605a', True),
    ('ring',      '套圈圈',             'BG', 2.2, 1.6,  (2.9, 2.2, 0.2),  (18.0, 22.5), '#b8231c', False),
    ('phonecase', '手機殼',             'BG', 1.6, 0.7,  (2.2, 1.5, 0.25), (16.0, 22.5), '#8a8f98', False),
    ('socks',     '襪子',               'BG', 1.6, 0.7,  (2.2, 1.5, 0.25), (16.0, 22.0), '#3d6fb0', False),
]
# 圖上的品項和價錢（給 LAWWW／AA 對；以圖為準）
MENU = {
    'milk': [['黑糖珍珠鮮奶（青蛙撞奶）', 65], ['黑糖鮮奶', 55], ['黑糖珍珠奶茶', 55], ['黑糖鮮奶茶', 50], ['黑糖珍珠鮮奶（熱）', 65]],
    'pepper': [['胡椒餅', 60]],
    'wheelcake': [['紅豆', 20], ['奶油', 20], ['花生', 20]],
    'ball': [['經典地瓜球', 50], ['雙色地瓜球', 55], ['起司地瓜球', 60]],
    'scallion': [['原味蔥油餅', 45], ['加蛋蔥油餅', 55], ['起司蔥油餅', 65], ['雙蛋蔥油餅', 65]],
    'stinky': [['炸豆腐', 70], ['加泡菜', 10]],
    'corn': [['炭烤玉米（紹興原味、蒜香厚醬、沙茶霸味、椒麻嗆辣、起司香濃、檸檬椒鹽）', 70]],
    'eggcake': [['原味', 30], ['奶香', 35], ['紅豆', 40], ['花生', 40], ['起司', 45]],
    'cane': [['甘蔗汁 中杯 500ml', 50], ['甘蔗汁 大杯 700ml', 65]],
    'jelly': [['粉圓冰', 50], ['燒仙草', 55]],
}


class S(T.Stall):
    def __init__(self, name, mats, uv):
        self.asp = {k: v[4] for k, v in uv.items()}; super().__init__(name, mats, {k: v[:4] for k, v in uv.items()}); self.G = CMesh(name + '_gl', mats['glow'])

    def _new(self, fn, col, k=1.0, M=None):   # 新加的面用集合差找（bmesh 會重用釋放掉的位置，新面不一定排在最後）
        M = M or self.V; before = set(M.bm.faces); fn(); M.paint([f for f in M.bm.faces if f not in before], col, k)

    def ell(self, c, rx, ry, rz, col, seg=10, rings=6): self._new(lambda: self.V.ell(c, rx, ry, rz, seg=seg, rings=rings), col)

    def rbox(self, x0, x1, y0, y1, z0, z1, col, r=0.03):
        self._new(lambda: self.V.rbox(x0, x1, y0, y1, z0, z1, r=min(r, abs(x1 - x0) / 2.2, abs(y1 - y0) / 2.2, abs(z1 - z0) / 2.2), seg=2), col)

    def poly(self, pts, col, k=1.0, two=True):
        self.V.poly(pts, col, k)
        if two: self.V.poly(list(reversed(pts)), col, k * 0.72)

    def glow(self, c, r, col=BULB, sy=1.0, rx=None):
        self._new((lambda: self.G.sphere(c, r, seg=8, rings=5, sy=sy)) if rx is None else (lambda: self.G.ell(c, rx, r, rx, seg=12, rings=8)), col, M=self.G)

    def gcyl(self, a, b, r, col, seg=12): self._new(lambda: self.G.cyl(a, b, r, seg=seg), col, M=self.G)

    def gbox(self, x0, x1, y0, y1, z0, z1, col): self.G.cbox(x0, x1, y0, y1, z0, z1, col)

    def tq(self, key, cx, cy, w, at, face='+z', h=None):
        """貼圖集的一格：中心 (cx, cy)（沿著面的水平座標、高度）、寬 w（高照比例）、at＝面在垂直那一軸的位置；回傳高"""
        h = h or w / self.asp[key]; a, b, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
        if face == '+z': pts = [(a, y0, at), (b, y0, at), (b, y1, at), (a, y1, at)]
        elif face == '-z': pts = [(b, y0, at), (a, y0, at), (a, y1, at), (b, y1, at)]
        elif face == '+x': pts = [(at, y0, b), (at, y0, a), (at, y1, a), (at, y1, b)]
        else: pts = [(at, y0, a), (at, y0, b), (at, y1, b), (at, y1, a)]
        self.quad(key, pts); return h

    def finish(self, root, props):
        g = super().finish(root, props)
        if len(self.G.bm.faces): self.G.finish(g, uv=False)
        else: self.G.bm.free()
        return g


# ---------- 共用零件 ----------
def body(s, W, D, col, top=STEEL, y0=0.2, wheels=True, trim=None):
    """攤體：箱體＋檯面＋小輪子"""
    s.box(-W / 2, W / 2, y0, CH - 0.04, -D / 2, D / 2, col); s.rbox(-W / 2 - 0.03, W / 2 + 0.03, CH - 0.04, CH, -D / 2 - 0.03, D / 2 + 0.03, top, r=0.012)
    if trim: s.box(-W / 2 - 0.005, W / 2 + 0.005, y0, y0 + 0.05, -D / 2 - 0.005, D / 2 + 0.005, trim)
    if wheels:
        for xx in (-W / 2 + 0.15, W / 2 - 0.15):
            for zz in (-D / 2 + 0.1, D / 2 - 0.1): s.cyl((xx - 0.025, 0.09, zz), (xx + 0.025, 0.09, zz), 0.09, BLACK, seg=10); s.box(xx - 0.02, xx + 0.02, 0.09, y0, zz - 0.02, zz + 0.02, STEEL_D)

def posts(s, W, D, H, col, t=0.04, y0=CH, inset=0.03):
    for xx in (-W / 2 + inset, W / 2 - inset - t):
        for zz in (-D / 2 + inset, D / 2 - inset - t): s.box(xx, xx + t, y0, H, zz, zz + t, col)

def awning(s, W, D, H, cols, over=0.3, rise=0.18, val=0.14, side=0.1):
    """斜的布棚（後高前低）；cols 一色或條紋輪流；前緣垂一條布邊"""
    x0, x1, zb, zf = -W / 2 - side, W / 2 + side, -D / 2 - 0.08, D / 2 + over; n = len(cols) if len(cols) == 1 else max(6, int((x1 - x0) / 0.24)); dx = (x1 - x0) / n
    for i in range(n):
        a, b, c = x0 + i * dx, x0 + (i + 1) * dx, cols[i % len(cols)]
        s.poly([(a, H, zf), (b, H, zf), (b, H + rise, zb), (a, H + rise, zb)], c)
        if val: s.poly([(a, H - val, zf + 0.01), (b, H - val, zf + 0.01), (b, H, zf), (a, H, zf)], c, 0.9)
    for xx in (x0, x1): s.poly([(xx, H, zf), (xx, H + rise, zb), (xx, H - 0.02, zb)], cols[0], 0.85)

def sign(s, key, W, y, z, w=None, frame=STEEL_D, t=0.06, pad=0.03, back=True):
    """橫招牌：板子＋正面貼圖（背面是板子的顏色）；回傳頂端的高度"""
    w = w or W; h = w / s.asp[key]
    s.box(-w / 2 - pad, w / 2 + pad, y - pad, y + h + pad, z - t, z, frame); s.tq(key, 0, y + h / 2, w, z + 0.004)
    if back: s.tq(key, 0, y + h / 2, w, z - t - 0.004, face='-z')
    return y + h + pad

def front(s, key, D, w, cy=0.52, cx=0.0, col=None):
    h = w / s.asp[key]
    if col: s.box(cx - w / 2 - 0.02, cx + w / 2 + 0.02, cy - h / 2 - 0.02, cy + h / 2 + 0.02, D / 2, D / 2 + 0.012, col)
    s.tq(key, cx, cy, w, D / 2 + 0.016); return h

def flag(s, key, x, ytop, w, z=0.0, face='+z', pole=STEEL_D):
    """直幅布旗：掛在橫桿下面（兩面都看得到圖）"""
    h = w / s.asp[key]
    if face in ('+z', '-z'):
        s.box(x - w / 2 - 0.03, x + w / 2 + 0.03, ytop, ytop + 0.02, z - 0.01, z + 0.01, pole); s.tq(key, x, ytop - h / 2, w, z + 0.004); s.tq(key, x, ytop - h / 2, w, z - 0.004, face='-z')
    else:
        s.box(x - 0.01, x + 0.01, ytop, ytop + 0.02, z - w / 2 - 0.03, z + w / 2 + 0.03, pole); s.tq(key, z, ytop - h / 2, w, x + 0.004, face='+x'); s.tq(key, z, ytop - h / 2, w, x - 0.004, face='-x')
    return h

def board(s, key, x, cy, w, z, col='#2a2a2c', face='+z'):
    """小黑板／價目牌（有邊框的板子）"""
    h = w / s.asp[key]
    if face == '+z': s.box(x - w / 2 - 0.02, x + w / 2 + 0.02, cy - h / 2 - 0.02, cy + h / 2 + 0.02, z - 0.025, z, col); s.tq(key, x, cy, w, z + 0.004)
    elif face == '+x': s.box(z - 0.025, z, cy - h / 2 - 0.02, cy + h / 2 + 0.02, x - w / 2 - 0.02, x + w / 2 + 0.02, col); s.tq(key, x, cy, w, z + 0.004, face='+x')
    else: s.box(z, z + 0.025, cy - h / 2 - 0.02, cy + h / 2 + 0.02, x - w / 2 - 0.02, x + w / 2 + 0.02, col); s.tq(key, x, cy, w, z - 0.004, face='-x')
    return h

def bulb(s, x, y, z, drop=0.16, r=0.05, cap=BLACK, shade=None):
    s.box(x - 0.004, x + 0.004, y - drop, y, z - 0.004, z + 0.004, BLACK); s.cyl((x, y - drop - 0.04, z), (x, y - drop, z), 0.022, cap, seg=6)
    if shade: s.cyl((x, y - drop - 0.2, z), (x, y - drop - 0.03, z), 0.1, shade, seg=10, r2=0.03)
    s.glow((x, y - drop - 0.04 - r, z), r, sy=1.15)

def hood(s, x0, x1, D, y=1.75, h=0.3, duct=2.45):
    """不鏽鋼排煙罩（梯形）＋往上的風管"""
    zb, zf = -D / 2, D / 2 - 0.1; i = 0.14; cx = (x0 + x1) / 2
    A = [(x0, y, zf), (x1, y, zf), (x1, y, zb), (x0, y, zb)]; Bt = [(x0 + i, y + h, zf - i), (x1 - i, y + h, zf - i), (x1 - i, y + h, zb + 0.04), (x0 + i, y + h, zb + 0.04)]
    for k in range(4): s.poly([A[k], A[(k + 1) % 4], Bt[(k + 1) % 4], Bt[k]], STEEL, 1.0 - 0.06 * k)
    s.poly(Bt, STEEL, 0.9); s.box(x0, x1, y - 0.04, y, zf - 0.02, zf, STEEL_D)
    s.cyl((cx, y + h, zb + 0.2), (cx, duct, zb + 0.2), 0.11, STEEL, seg=10)

def fryer(s, x, w=0.55, D=0.9, n=0, food='#d9a040'):
    s.box(x - w / 2, x + w / 2, CH, CH + 0.18, -0.26, 0.24, STEEL_D); s.box(x - w / 2 + 0.03, x + w / 2 - 0.03, CH + 0.15, CH + 0.185, -0.23, 0.21, '#b8862e')

def rack(s, x0, x1, z0, z1, y=CH, h=0.1):
    """瀝油架：四支腳＋網面"""
    for xx in (x0, x1 - 0.015):
        for zz in (z0, z1 - 0.015): s.box(xx, xx + 0.015, y, y + h, zz, zz + 0.015, STEEL_D)
    s.box(x0, x1, y + h, y + h + 0.012, z0, z1, STEEL)

def glass_case(s, x0, x1, z0, z1, y=CH, h=0.36, frame=STEEL_D, shelf=True):
    """玻璃保溫櫃：只做框（裡面的東西看得到）＋底盤"""
    t = 0.018
    for xx in (x0, x1 - t):
        for zz in (z0, z1 - t): s.box(xx, xx + t, y, y + h, zz, zz + t, frame)
    s.box(x0, x1, y + h, y + h + t, z0, z1, frame); s.box(x0, x1, y, y + 0.02, z0, z1, frame)
    if shelf: s.box(x0 + t, x1 - t, y + h * 0.5, y + h * 0.5 + 0.01, z0 + t, z1 - t, STEEL)

def cups(s, x, z, n=3, y=CH, col='#f2f2ee'):
    for i in range(n): s.cyl((x + i * 0.09, y, z), (x + i * 0.09, y + 0.3, z), 0.035, col, seg=8, r2=0.042)

def bags(s, x, z, y=CH, col='#c9a878'):
    for i in range(4): s.box(x + i * 0.035, x + i * 0.035 + 0.02, y, y + 0.2 - (i % 2) * 0.02, z - 0.07, z + 0.07, col, 1.0 - 0.05 * i)

def ftable(s, x, z, w=0.9, d=0.6, col='#c9302a'):
    s.rbox(x - w / 2, x + w / 2, 0.7, 0.73, z - d / 2, z + d / 2, col, r=0.01)
    for sx in (-1, 1):
        xx = x + sx * (w / 2 - 0.08); s.box(xx - 0.012, xx + 0.012, 0.0, 0.7, z - d / 2 + 0.05, z - d / 2 + 0.075, STEEL_D); s.box(xx - 0.012, xx + 0.012, 0.0, 0.7, z + d / 2 - 0.075, z + d / 2 - 0.05, STEEL_D); s.box(xx - 0.01, xx + 0.01, 0.3, 0.32, z - d / 2 + 0.05, z + d / 2 - 0.05, STEEL_D)

def drape(s, x0, x1, y0, y1, z0, z1, col, flare=0.06, folds=3, rope=True):
    """帆布罩：上小下大的梯形體＋摺痕＋綁繩（收攤用；每一攤照自己的輪廓疊幾塊）"""
    f = flare; A = [(x0 - f, y0, z1 + f), (x1 + f, y0, z1 + f), (x1 + f, y0, z0 - f), (x0 - f, y0, z0 - f)]; Bt = [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)]
    for k in range(4): s.V.poly([A[k], A[(k + 1) % 4], Bt[(k + 1) % 4], Bt[k]], col, (1.0, 0.86, 0.78, 0.9)[k])
    s.V.poly(Bt, col, 1.06)
    for i in range(folds):                                   # 正面、背面的摺痕（深一點的細條）
        xx = x0 + (x1 - x0) * (i + 0.6) / (folds + 0.2); d = 0.012
        for (za, fa, sg) in ((z1, f, 1), (z0, -f, -1)):
            s.V.poly([(xx - 0.02 * sg, y0, za + fa + d * sg), (xx + 0.02 * sg, y0, za + fa + d * sg), (xx + 0.006 * sg, y1 - 0.03, za + d * sg), (xx - 0.006 * sg, y1 - 0.03, za + d * sg)], col, 0.72)
    if rope:
        ym = y0 + (y1 - y0) * 0.45; e = f * 0.55 + 0.012
        s.box(x0 - e, x1 + e, ym, ym + 0.02, z0 - e, z1 + e, '#e8e0c8')


# ---------- 十攤（營業） ----------
def milk(s, W, D):
    body(s, W, D, WALNUT, top='#3a2418', trim='#2e1c12'); posts(s, W, D, 2.15, WALNUT, t=0.06)
    s.box(-W / 2 - 0.08, W / 2 + 0.08, 2.15, 2.19, -D / 2 - 0.06, D / 2 + 0.12, '#3a2418')                # 木頂板
    for i in range(9): s.box(-W / 2 - 0.08 + i * 0.26, -W / 2 + 0.02 + i * 0.26, 2.19, 2.21, -D / 2 - 0.06, D / 2 + 0.12, WALNUT, 1.12)
    top = sign(s, 'milk_sign', W, 2.25, D / 2 + 0.1, w=W, frame='#2e1c12')
    for bx in (-0.6, 0.0, 0.6): bulb(s, bx, 2.15, D / 2 - 0.12, drop=0.12, shade='#d9d2bc')              # 三盞玻璃罩吊燈
    front(s, 'milk_menu', D, 0.62, cx=-0.6); front(s, 'milk_art', D, 1.05, cx=0.38, cy=0.52)
    s.gbox(-0.15, 0.91, 0.76, 0.775, D / 2 + 0.012, D / 2 + 0.03, BULB)                                       # 版畫上面的燈條
    s.cyl((-0.68, CH, -0.05), (-0.68, CH + 0.1, -0.05), 0.2, BLACK, seg=12); s.cyl((-0.68, CH + 0.1, -0.05), (-0.68, CH + 0.32, -0.05), 0.21, '#b87333', seg=14, r2=0.24)   # 爐＋銅鍋
    s.cyl((-0.68, CH + 0.3, -0.05), (-0.68, CH + 0.325, -0.05), 0.22, '#2a160c', seg=14)                    # 黑糖
    s.cyl((-0.28, CH, -0.1), (-0.28, CH + 0.3, -0.1), 0.15, STEEL, seg=12); s.cyl((-0.28, CH + 0.3, -0.1), (-0.28, CH + 0.33, -0.1), 0.155, STEEL_D, seg=12)             # 珍珠保溫桶
    s.cyl((0.02, CH, 0.2), (0.02, CH + 0.17, 0.2), 0.04, '#d9c4a0', seg=8, r2=0.048); s.cyl((0.02, CH, 0.2), (0.02, CH + 0.05, 0.2), 0.041, '#2a160c', seg=8)            # 展示杯（下面黑糖珍珠）
    board(s, 'milk_board', 0.02, CH + 0.3, 0.3, 0.02)
    s.box(0.3, 0.85, CH, CH + 0.6, -0.4, -0.02, '#3a3c40'); s.tq('milk_fridge', 0.575, CH + 0.3, 0.52, -0.016)                                                    # 冷藏櫃「小農鮮奶」
    s.box(0.32, 0.6, CH, CH + 0.28, 0.08, 0.34, '#e8e8e4'); s.box(0.36, 0.56, CH + 0.28, CH + 0.4, 0.12, 0.3, '#8f9498')                                           # 封口機
    cups(s, 0.7, 0.22, 3)
    flag(s, 'milk_flag', W / 2 + 0.22, 2.1, 0.3, z=D / 2 - 0.05); s.box(W / 2 - 0.03, W / 2 + 0.4, 2.1, 2.12, D / 2 - 0.06, D / 2 - 0.04, WALNUT)
    board(s, 'milk_side', -W / 2 + 0.03, 1.5, 0.22, D / 2 + 0.005, col='#2e1c12')
    T.bucket(s, -W / 2 - 0.25, -0.2, '#8a8f98'); T.stool(s, 0.3, -0.85, '#4a2f1e')

def pepper(s, W, D):
    RED = '#7a1420'
    body(s, W, D, RED, top='#2a2022', trim=GOLD); s.box(-W / 2 - 0.006, W / 2 + 0.006, CH - 0.09, CH - 0.05, -D / 2 - 0.006, D / 2 + 0.006, GOLD)
    front(s, 'pepper_front', D, 1.75, cy=0.5)
    for xx in (-W / 2 + 0.06, W / 2 - 0.06):                                                            # 金色柱子
        for zz in (D / 2 - 0.06, -D / 2 + 0.06):
            s.cyl((xx, CH, zz), (xx, 2.2, zz), 0.045, GOLD, seg=10); s.cyl((xx, CH, zz), (xx, CH + 0.1, zz), 0.07, GOLD, seg=10, k=0.85); s.cyl((xx, 2.1, zz), (xx, 2.2, zz), 0.07, GOLD, seg=10, k=0.85)
    s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.2, 2.26, -D / 2 - 0.05, D / 2 + 0.05, RED); s.box(-W / 2 - 0.06, W / 2 + 0.06, 2.26, 2.29, -D / 2 - 0.06, D / 2 + 0.06, GOLD)
    top = sign(s, 'pepper_sign', W, 2.32, D / 2 + 0.05, w=W - 0.1, frame=GOLD, pad=0.025)
    n = 6; dx = W / n                                                                                   # 紅布幔（一段一段垂下來）＋金流蘇
    for i in range(n):
        a, b = -W / 2 + i * dx, -W / 2 + (i + 1) * dx; m = (a + b) / 2; z = D / 2 + 0.02
        s.poly([(a, 2.2, z), (b, 2.2, z), (b, 2.02, z), (m, 1.92, z), (a, 2.02, z)], RED, 1.1); s.poly([(a, 2.02, z + 0.004), (m, 1.92, z + 0.004), (b, 2.02, z + 0.004), (b, 2.0, z + 0.004), (m, 1.895, z + 0.004), (a, 2.0, z + 0.004)], GOLD)
    for sx in (-1, 1): s.poly([(sx * (W / 2 - 0.02), 2.2, D / 2 + 0.015), (sx * (W / 2 - 0.3), 2.2, D / 2 + 0.015), (sx * (W / 2 - 0.1), 1.35, D / 2 + 0.015), (sx * (W / 2 - 0.02), 1.3, D / 2 + 0.015)], RED, 0.92)
    cy = top + 0.02                                                                                     # 皇冠
    s.cyl((0, cy, D / 2), (0, cy + 0.1, D / 2), 0.2, GOLD, seg=12); s.ball((0, cy + 0.17, D / 2), 0.17, RED, sy=0.8)
    for i in range(6):
        a = i * math.pi / 3; px, pz = math.cos(a) * 0.19, D / 2 + math.sin(a) * 0.19; s.cyl((px, cy + 0.1, pz), (px * 0.5, cy + 0.36, D / 2 + (pz - D / 2) * 0.5), 0.025, GOLD, seg=6); s.ball((px, cy + 0.14, pz), 0.035, GOLD)
    s.ball((0, cy + 0.4, D / 2), 0.05, GOLD)
    ox = -0.78                                                                                          # 圓筒炭爐
    s.cyl((ox, CH, 0.0), (ox, CH + 0.55, 0.0), 0.3, '#3a3c40', seg=16); s.cyl((ox, CH + 0.2, 0.0), (ox, CH + 0.26, 0.0), 0.305, GOLD, seg=16); s.cyl((ox, CH + 0.55, 0.0), (ox, CH + 0.6, 0.0), 0.3, '#2a2022', seg=16, r2=0.2)
    s.gcyl((ox, CH + 0.585, 0.0), (ox, CH + 0.605, 0.0), 0.19, '#ff6a2a')
    s.box(-0.35, 0.3, CH, CH + 0.03, -0.3, 0.3, '#d9c4a0')                                              # 備料台、麵團
    for i in range(8): s.ball((-0.25 + (i % 4) * 0.15, CH + 0.07, -0.12 + (i // 4) * 0.24), 0.055, '#efe4cc', sy=0.7)
    glass_case(s, 0.45, 1.1, -0.3, 0.3, h=0.42, frame=GOLD)
    for i in range(10): s.ball((0.54 + (i % 5) * 0.12, CH + (0.06 if i < 5 else 0.27), -0.1 + (i % 2) * 0.2), 0.055, '#c98a45', sy=0.6)
    board(s, 'pepper_price', 0.78, CH + 0.56, 0.3, 0.3, col=GOLD)
    flag(s, 'pepper_flag', -W / 2 - 0.2, 2.1, 0.26, z=D / 2 - 0.05); s.box(-W / 2 - 0.36, -W / 2 + 0.03, 2.1, 2.12, D / 2 - 0.06, D / 2 - 0.04, GOLD)
    for bx in (-0.6, 0.6): bulb(s, bx, 2.2, 0.0, drop=0.1)
    T.gas(s, W / 2 + 0.25, -0.25); T.stool(s, -0.2, -0.85)

def wheelcake(s, W, D):
    T.cart(s, tall=False); posts(s, W, D, 1.95, STEEL_D, t=0.025); awning(s, W, D, 1.95, ['#b8a57a'], over=0.25)
    sign(s, 'cake_sign', W, 1.46, D / 2 + 0.22, w=W - 0.05, frame='#e8e4d8', t=0.03); board(s, 'cake_tags', 0.0, 0.55, 0.42, D / 2 + 0.03, col='#e8d9b8')
    flag(s, 'cake_side', -W / 2 - 0.02, 1.42, 0.24, z=D / 2 + 0.05, face='-x')
    s.box(-0.7, 0.1, CH, CH + 0.06, -0.26, 0.26, '#2b2b2d')                                              # 長條烤模
    for i in range(10): x, z = -0.62 + (i % 5) * 0.155, -0.12 + (i // 5) * 0.24; s.cyl((x, CH + 0.06, z), (x, CH + 0.075, z), 0.062, '#d9a54a' if i % 3 else '#3a2a22', seg=10)
    for j, c in enumerate(('#6a2a2a', '#f4e2a0')): s.cyl((0.28, CH, -0.16 + j * 0.3), (0.28, CH + 0.16, -0.16 + j * 0.3), 0.11, STEEL, seg=12); s.cyl((0.28, CH + 0.14, -0.16 + j * 0.3), (0.28, CH + 0.165, -0.16 + j * 0.3), 0.1, c, seg=12)
    glass_case(s, 0.42, 0.74, -0.3, 0.05, h=0.26, shelf=False)
    for i in range(6): s.cyl((0.5 + (i % 2) * 0.14, CH + 0.03 + (i // 2) * 0.035, -0.12), (0.5 + (i % 2) * 0.14, CH + 0.06 + (i // 2) * 0.035, -0.12), 0.06, '#d9a54a', seg=10)
    bags(s, 0.45, 0.22); s.box(0.62, 0.74, CH, CH + 0.07, 0.14, 0.3, '#8a6a3a')                           # 紙袋、零錢盒
    for bx in (-0.4, 0.4): bulb(s, bx, 1.95, 0.1, drop=0.1, r=0.06)
    T.gas(s, W / 2 + 0.22, -0.2); T.stool(s, 0.2, -0.75, '#3d6fb0')

def ball(s, W, D):
    NAVY, YEL = '#1f2f6a', '#f4c92e'
    body(s, W, D, NAVY, top=STEEL, trim=YEL); front(s, 'ball_front', D, W - 0.08, cy=0.52)
    posts(s, W, D, 1.95, NAVY, t=0.035); awning(s, W, D, 1.95, [YEL], over=0.3, rise=0.12)
    y1 = sign(s, 'ball_sign', W, 2.08, D / 2 + 0.05, w=W, frame=NAVY, pad=0.02)
    for i in range(5): s.cyl((-0.56 + i * 0.28, y1 - 0.02, D / 2 - 0.02), (-0.56 + i * 0.28, y1 - 0.02, D / 2 + 0.045), 0.13 if i % 2 else 0.1, NAVY, seg=12)   # 雲朵形的上緣
    fryer(s, -0.4, 0.5); rack(s, -0.1, 0.2, -0.25, 0.05)
    for i in range(9): s.ball((-0.56 + (i % 3) * 0.11, CH + 0.2, -0.1 + (i // 3) * 0.12), 0.04, '#e0a83a')
    s.cyl((-0.4, CH + 0.3, 0.2), (-0.1, CH + 0.42, 0.3), 0.012, STEEL_D, seg=6); s.cyl((-0.42, CH + 0.26, 0.19), (-0.42, CH + 0.3, 0.19), 0.09, STEEL, seg=10)   # 漏勺
    glass_case(s, 0.25, 0.74, -0.3, 0.3, h=0.4); rnd = random.Random(4)
    for i in range(40): lo = i < 22; s.ball((0.31 + rnd.random() * 0.37, CH + (0.06 if lo else 0.25) + rnd.random() * 0.06, -0.22 + rnd.random() * 0.44), 0.042, '#e8b040' if (i % 3) else '#8a5aa8')
    board(s, 'ball_menu', -0.02, CH + 0.3, 0.26, 0.31); bags(s, -0.08, 0.14)
    flag(s, 'ball_flag', W / 2 + 0.2, 1.9, 0.27, z=D / 2 - 0.05); s.box(W / 2 - 0.03, W / 2 + 0.36, 1.9, 1.92, D / 2 - 0.06, D / 2 - 0.04, NAVY)
    for bx in (-0.35, 0.35): bulb(s, bx, 1.98, 0.1, drop=0.1)
    T.gas(s, -W / 2 - 0.22, -0.2); T.stool(s, 0.2, -0.75, YEL)

def scallion(s, W, D):
    GRN = '#3f8a4a'
    body(s, W, D, WOOD, top=STEEL, trim='#7a5a38')
    for i in range(7): s.box(-W / 2 + 0.01 + i * W / 7, -W / 2 + 0.02 + i * W / 7, 0.2, CH - 0.04, D / 2, D / 2 + 0.004, '#7a5a38')   # 木板縫
    front(s, 'cong_front', D, 1.7, cy=0.52); posts(s, W, D, 2.1, '#e8e8e4', t=0.035); awning(s, W, D, 2.1, [GRN, '#f4f4ee'], over=0.35, rise=0.2, val=0.16)
    sign(s, 'cong_sign', W, 1.68, D / 2 + 0.3, w=W, frame='#f4f4ee', t=0.02, pad=0.01)
    s.box(-0.9, 0.1, CH, CH + 0.06, -0.33, 0.3, '#2b2b2d'); s.box(-0.92, 0.12, CH, CH + 0.1, -0.36, -0.33, STEEL_D)                       # 大煎台
    for (x, z) in ((-0.62, 0.0), (-0.18, -0.02)): s.cyl((x, CH + 0.06, z), (x, CH + 0.075, z), 0.2, '#e0c078', seg=16); s.cyl((x + 0.03, CH + 0.075, z), (x + 0.03, CH + 0.08, z), 0.12, '#7fae58', seg=8)
    s.box(0.2, 0.55, CH, CH + 0.1, -0.33, -0.05, STEEL); s.box(0.22, 0.53, CH + 0.08, CH + 0.105, -0.31, -0.07, '#6fa84a')                # 蔥花料盒
    s.box(0.2, 0.62, CH, CH + 0.025, 0.02, 0.32, '#d9c4a0'); s.ball((0.4, CH + 0.06, 0.17), 0.09, '#efe4cc', sy=0.5); s.cyl((0.25, CH + 0.06, 0.28), (0.58, CH + 0.06, 0.28), 0.02, WOOD, seg=6)   # 擀麵板
    for i, c in enumerate(('#3a2418', '#b8231c', '#3a2418')): s.cyl((0.7 + i * 0.09, CH, -0.25), (0.7 + i * 0.09, CH + 0.18, -0.25), 0.032, c, seg=8)     # 醬料瓶
    s.box(0.68, 0.94, CH, CH + 0.14, 0.05, 0.3, '#9a7448'); bags(s, 0.72, 0.17, y=CH + 0.03)
    s.box(-W / 2 - 0.34, -W / 2 - 0.3, 0.0, 1.75, 0.3, 0.34, '#5a4630'); board(s, 'cong_menu', -W / 2 - 0.32, 1.35, 0.36, 0.345)          # 左邊立著的黑板菜單
    for bx in (-0.55, 0.55): bulb(s, bx, 2.12, 0.1, drop=0.14)
    T.gas(s, W / 2 + 0.25, -0.25); T.bucket(s, W / 2 + 0.25, 0.2, '#3d6fb0'); T.stool(s, 0.2, -0.85, '#3f8a4a')

def tofu(s, W, D):
    DK, WINE = '#3a2418', '#6a1a26'
    body(s, W, D, DK, top=STEEL, trim='#2a180e'); front(s, 'tofu_cloth', D, 1.6, cy=0.52, col='#2a180e')
    posts(s, W, D, 2.25, DK, t=0.07); s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.25, 2.31, -D / 2 - 0.05, D / 2 + 0.1, DK)
    sign(s, 'tofu_sign', W, 2.34, D / 2 + 0.08, w=W, frame='#2a180e')
    hood(s, -0.95, 0.05, D, y=1.72, h=0.28, duct=2.25)
    fryer(s, -0.5, 0.7); rack(s, 0.0, 0.42, -0.28, 0.1)
    for i in range(9): s.box(0.03 + (i % 3) * 0.13, 0.13 + (i % 3) * 0.13, CH + 0.112, CH + 0.17, -0.25 + (i // 3) * 0.115, -0.16 + (i // 3) * 0.115, '#d9a040')
    for i in range(6): s.box(-0.72 + (i % 3) * 0.16, -0.62 + (i % 3) * 0.16, CH + 0.17, CH + 0.215, -0.14 + (i // 3) * 0.2, -0.05 + (i // 3) * 0.2, '#e0b050')
    s.box(0.5, 0.92, CH, CH + 0.12, -0.3, 0.0, STEEL); s.box(0.52, 0.9, CH + 0.1, CH + 0.13, -0.28, -0.02, '#e8e0b0')                      # 泡菜盒
    for i, c in enumerate(('#3a2418', '#b8231c', '#c9a03a')): s.cyl((0.56 + i * 0.14, CH, 0.2), (0.56 + i * 0.14, CH + 0.14, 0.2), 0.055, STEEL, seg=10); s.cyl((0.56 + i * 0.14, CH + 0.12, 0.2), (0.56 + i * 0.14, CH + 0.145, 0.2), 0.048, c, seg=10)
    board(s, 'tofu_menu', 0.72, 1.85, 0.36, D / 2 - 0.02)
    lx = W / 2 - 0.12; s.box(lx - 0.004, lx + 0.004, 2.0, 2.25, D / 2 + 0.2, D / 2 + 0.208, BLACK)                                         # 紅燈籠
    s.glow((lx, 1.84, D / 2 + 0.2), 0.17, '#e02a22', rx=0.15); s.cyl((lx, 2.0, D / 2 + 0.2), (lx, 2.03, D / 2 + 0.2), 0.07, GOLD, seg=8); s.cyl((lx, 1.65, D / 2 + 0.2), (lx, 1.68, D / 2 + 0.2), 0.07, GOLD, seg=8)
    flag(s, 'tofu_flag', -W / 2 - 0.24, 2.15, 0.34, z=D / 2 - 0.05); s.box(-W / 2 - 0.44, -W / 2 + 0.03, 2.15, 2.17, D / 2 - 0.06, D / 2 - 0.04, DK)
    for jx, jz in ((-W / 2 - 0.3, 0.55), (-W / 2 + 0.1, 0.72)):                                                                           # 兩個酒甕
        s.ell((jx, 0.24, jz), 0.19, 0.24, 0.19, '#5a3422', seg=12, rings=8); s.cyl((jx, 0.44, jz), (jx, 0.5, jz), 0.09, '#5a3422', seg=10); s.cyl((jx, 0.5, jz), (jx, 0.53, jz), 0.1, '#b8231c', seg=10)
    for bx in (0.25, 0.75): bulb(s, bx, 2.25, 0.1, drop=0.12)
    T.gas(s, W / 2 + 0.25, -0.25); T.stool(s, 0.3, -0.85, '#6a1a26')

def corn(s, W, D):
    BK = '#1c1c1e'
    body(s, W, D, BK, top=STEEL, trim=GOLD); front(s, 'corn_front', D, W - 0.1, cy=0.52)
    posts(s, W, D, 2.2, BK, t=0.05); s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.2, 2.25, -D / 2 - 0.05, D / 2 + 0.08, BK)
    sign(s, 'corn_sign', W, 2.28, D / 2 + 0.06, w=W, frame=GOLD, pad=0.02)
    hood(s, -0.6, 0.5, D, y=1.72, h=0.28, duct=2.2)
    for t in range(3):                                                                                                                    # 左邊三層生玉米架
        y = CH + 0.02 + t * 0.22; s.box(-1.15, -0.72, y, y + 0.015, -0.3, 0.28, STEEL)
        for i in range(5): s.cyl((-1.12, y + 0.05, -0.24 + i * 0.12), (-0.76, y + 0.05, -0.24 + i * 0.12), 0.034, '#e8c63a' if (i + t) % 2 else '#a8c46a', seg=7)
    for xx in (-1.15, -0.735):
        for zz in (-0.3, 0.265): s.box(xx, xx + 0.015, CH, CH + 0.5, zz, zz + 0.015, STEEL_D)
    s.box(-0.6, 0.45, CH, CH + 0.2, -0.3, 0.26, '#2b2b2d'); s.gbox(-0.56, 0.41, CH + 0.17, CH + 0.2, -0.26, 0.22, '#ff5a1e')              # 炭烤台（炭火）
    for i in range(8): s.box(-0.58 + i * 0.145, -0.572 + i * 0.145, CH + 0.205, CH + 0.215, -0.28, 0.24, STEEL_D)
    for i in range(6): s.cyl((-0.5 + i * 0.17, CH + 0.245, -0.13), (-0.5 + i * 0.17, CH + 0.245, 0.13), 0.033, '#e8b72e' if i % 2 else '#b8741e', seg=8); s.cyl((-0.5 + i * 0.17, CH + 0.245, 0.13), (-0.5 + i * 0.17, CH + 0.245, 0.3), 0.006, '#c9a878', seg=4)
    for i in range(3): s.cyl((0.6, CH, -0.24 + i * 0.22), (0.6, CH + 0.1, -0.24 + i * 0.22), 0.085, STEEL, seg=10); s.cyl((0.6, CH + 0.08, -0.24 + i * 0.22), (0.6, CH + 0.105, -0.24 + i * 0.22), 0.075, ('#5a2a18', '#b8231c', '#8a5a1e')[i], seg=10)
    rack(s, 0.75, 1.15, -0.28, 0.2, h=0.14)                                                                                               # 右邊烤好的玉米
    for i in range(5): s.cyl((0.78, CH + 0.19, -0.22 + i * 0.1), (1.12, CH + 0.19, -0.22 + i * 0.1), 0.033, '#c98a1e', seg=7)
    s.box(W / 2 + 0.02, W / 2 + 0.06, 0.0, 1.95, 0.25, 0.29, BK); board(s, 'corn_menu', W / 2 + 0.2, 1.48, 0.33, 0.295, col=GOLD)          # 右邊黑金菜單
    flag(s, 'corn_flag', -W / 2 - 0.18, 2.1, 0.23, z=D / 2 - 0.05); s.box(-W / 2 - 0.32, -W / 2 + 0.03, 2.1, 2.12, D / 2 - 0.06, D / 2 - 0.04, GOLD)
    for bx in (-0.9, 0.9): bulb(s, bx, 2.2, 0.15, drop=0.12)
    T.bucket(s, -W / 2 - 0.25, -0.3, '#26282a', r=0.2, h=0.4); T.stool(s, 0.0, -0.85, '#26282a')

def eggcake(s, W, D):
    CR, RED = '#e8d9a8', '#a8322a'
    s.box(-W / 2, W / 2, 0.42, CH - 0.04, -D / 2, D / 2, CR); s.rbox(-W / 2 - 0.02, W / 2 + 0.02, CH - 0.04, CH, -D / 2 - 0.02, D / 2 + 0.02, STEEL, r=0.012); s.box(-W / 2, W / 2, 0.42, 0.46, -D / 2 - 0.004, D / 2 + 0.004, RED)
    front(s, 'egg_front', D, W - 0.1, cy=0.64)
    for sx in (-1, 1):                                                                                                                    # 三輪車的兩個大輪子
        x = sx * (W / 2 + 0.05); s.cyl((x - 0.02, 0.32, 0.0), (x + 0.02, 0.32, 0.0), 0.32, BLACK, seg=18); s.cyl((x - 0.025, 0.32, 0.0), (x + 0.025, 0.32, 0.0), 0.25, STEEL_D, seg=14); s.cyl((x - 0.03, 0.32, 0.0), (x + 0.03, 0.32, 0.0), 0.05, STEEL, seg=8)
    s.cyl((-W / 2 + 0.1, 0.32, 0.0), (W / 2 - 0.1, 0.32, 0.0), 0.02, STEEL_D, seg=6)
    s.cyl((W / 2 + 0.1, 0.5, -D / 2 + 0.05), (W / 2 + 0.75, 0.3, -D / 2 + 0.05), 0.025, RED, seg=6); s.cyl((W / 2 + 0.72, 0.2, -D / 2 + 0.05), (W / 2 + 0.78, 0.2, -D / 2 + 0.05), 0.2, BLACK, seg=14)   # 前叉、前輪
    s.cyl((W / 2 + 0.75, 0.3, -D / 2 + 0.05), (W / 2 + 0.7, 1.0, -D / 2 + 0.05), 0.018, STEEL_D, seg=6); s.cyl((W / 2 + 0.7, 1.0, -D / 2 - 0.15), (W / 2 + 0.7, 1.0, -D / 2 + 0.25), 0.016, BLACK, seg=6)   # 龍頭
    posts(s, W, D, 1.9, STEEL_D, t=0.025); awning(s, W, D, 1.9, ['#ead9a0'], over=0.25, rise=0.14)
    y = 1.5; h = (W - 0.06) / s.asp['egg_sign']; s.box(-W / 2 + 0.01, W / 2 - 0.01, y - 0.03, y + h + 0.03, D / 2 + 0.1, D / 2 + 0.2, '#d9d4c4'); s.tq('egg_sign', 0, y + h / 2, W - 0.06, D / 2 + 0.204); s.tq('egg_sign', 0, y + h / 2, W - 0.06, D / 2 + 0.096, face='-z')
    s.box(-0.68, -0.05, CH, CH + 0.1, -0.24, 0.24, '#2b2b2d'); s.box(-0.68, -0.37, CH + 0.1, CH + 0.14, -0.24, 0.24, '#3a3a3c')             # 鑄鐵烤模（一片蓋著）
    s.poly([(-0.36, CH + 0.1, -0.24), (-0.05, CH + 0.1, -0.24), (-0.05, CH + 0.5, -0.36), (-0.36, CH + 0.5, -0.36)], '#3a3a3c')            # 另一片掀開
    for i in range(6): s.ball((-0.31 + (i % 2) * 0.14, CH + 0.11, -0.15 + (i // 2) * 0.15), 0.045, '#e3b062', sy=0.5)
    s.box(0.05, 0.5, CH, CH + 0.025, -0.25, 0.2, STEEL)                                                                                   # 一盤小豬雞蛋糕
    for i in range(12):
        x, z = 0.11 + (i % 4) * 0.11, -0.17 + (i // 4) * 0.13; s.ell((x, CH + 0.06, z), 0.05, 0.036, 0.04, '#e3b062', seg=8, rings=5)
        for e in (-1, 1): s.ball((x + 0.03, CH + 0.095, z + e * 0.025), 0.014, '#d09a50')
    s.cyl((0.63, CH, -0.15), (0.63, CH + 0.22, -0.15), 0.1, STEEL, seg=12); s.cyl((0.63, CH + 0.2, -0.15), (0.63, CH + 0.225, -0.15), 0.09, '#f0dc9a', seg=12)   # 麵糊桶
    bags(s, 0.55, 0.2); s.box(0.1, 0.3, CH, CH + 0.07, 0.24, 0.36, '#8a6a3a')                                                               # 紙袋、找零木盒
    board(s, 'egg_price', D / 2 - 0.2, 1.3, 0.28, W / 2 + 0.03, col='#e8d9b8', face='+x'); flag(s, 'egg_side', -W / 2 - 0.02, 1.55, 0.2, z=D / 2 + 0.05, face='-x')
    for bx in (-0.4, 0.4): bulb(s, bx, 1.9, 0.12, drop=0.1, r=0.055)
    T.gas(s, -W / 2 - 0.3, -0.3); T.stool(s, 0.2, -0.8, '#a8322a')

def cane_bundle(s, x, z, n=9, h=1.95, seed=1):
    rnd = random.Random(seed); s.box(x - 0.17, x + 0.17, 0.0, 0.04, z - 0.17, z + 0.17, STEEL_D)
    for sx in (-0.16, 0.14):
        for sz in (-0.16, 0.14): s.box(x + sx, x + sx + 0.02, 0.0, 1.1, z + sz, z + sz + 0.02, STEEL_D)
    for yy in (0.5, 1.08): s.box(x - 0.17, x + 0.17, yy, yy + 0.02, z - 0.17, z + 0.17, STEEL_D)
    for i in range(n):
        a = i * 2.4; r = 0.035 + 0.085 * ((i % 3) / 2); px, pz = x + math.cos(a) * r, z + math.sin(a) * r; hh = h - rnd.random() * 0.3; c = '#8a9a4a' if i % 3 else '#6a4a5a'
        s.cyl((px, 0.04, pz), (px + (rnd.random() - 0.5) * 0.08, hh, pz + (rnd.random() - 0.5) * 0.08), 0.024, c, seg=6)
        for k in range(1, 6): s.cyl((px, 0.04 + k * hh / 6, pz), (px, 0.05 + k * hh / 6, pz), 0.027, '#5a6a2a', seg=6)
    return

def cane(s, W, D):
    body(s, W, D, STEEL, top=STEEL, trim=STEEL_D); front(s, 'cane_front', D, W - 0.1, cy=0.52)
    posts(s, W, D, 2.0, STEEL_D, t=0.03)
    y = 2.0; w = W - 0.02; h = w / s.asp['cane_sign']; s.box(-w / 2 - 0.02, w / 2 + 0.02, y - 0.02, y + h + 0.02, D / 2 - 0.12, D / 2 + 0.02, '#e8ece4'); s.tq('cane_sign', 0, y + h / 2, w, D / 2 + 0.024); s.tq('cane_sign', 0, y + h / 2, w, D / 2 - 0.124, face='-z')
    s.gbox(-w / 2, w / 2, y - 0.035, y - 0.02, D / 2 - 0.08, D / 2 - 0.02, '#f4fff0')                                                       # 白光燈條
    s.box(-0.8, -0.3, CH, CH + 0.5, -0.3, 0.15, '#4f8a4a'); s.box(-0.74, -0.36, CH + 0.26, CH + 0.46, 0.15, 0.165, STEEL)                   # 榨汁機
    for j in range(2): s.cyl((-0.72, CH + 0.31 + j * 0.09, 0.18), (-0.38, CH + 0.31 + j * 0.09, 0.18), 0.04, STEEL_D, seg=8)
    s.cyl((-0.55, CH, 0.27), (-0.55, CH + 0.16, 0.27), 0.09, STEEL, seg=10)                                                              # 濾網、接汁桶
    s.cyl((-0.12, CH, 0.1), (-0.12, CH + 0.24, 0.1), 0.07, '#dfe8b8', seg=10, r2=0.06)                                                    # 果汁壺
    for t in range(2):                                                                                                                    # 層架上的甘蔗段
        yy = CH + 0.02 + t * 0.2; s.box(0.0, 0.42, yy, yy + 0.012, -0.32, -0.05, STEEL)
        for i in range(5): s.cyl((0.03, yy + 0.04, -0.29 + i * 0.055), (0.39, yy + 0.04, -0.29 + i * 0.055), 0.024, '#b8c47a' if i % 2 else '#8a9a4a', seg=6)
    glass_case(s, 0.48, 0.86, -0.32, 0.1, h=0.5)
    for i in range(8): s.cyl((0.54 + (i % 4) * 0.085, CH + (0.03 if i < 4 else 0.28), -0.1), (0.54 + (i % 4) * 0.085, CH + (0.17 if i < 4 else 0.42), -0.1), 0.03, '#dfe8a0', seg=8)
    cups(s, 0.5, 0.26, 3)
    cane_bundle(s, -W / 2 - 0.3, -0.05, seed=2); cane_bundle(s, W / 2 + 0.3, -0.05, seed=5)
    board(s, 'cane_price', -W / 2 + 0.2, 1.5, 0.3, D / 2 + 0.0, col='#e8ece4')
    T.bucket(s, 0.2, -0.75, '#3f8a4a'); T.stool(s, -0.3, -0.8, '#3f8a4a')

def jelly(s, W, D):
    RED = '#b23a30'
    body(s, W, D, '#d9d4c8', top=STEEL, trim=STEEL_D); front(s, 'sweet_front', D, W - 0.12, cy=0.52)
    posts(s, W, D, 2.3, STEEL_D, t=0.035); awning(s, W, D, 2.3, [RED], over=0.55, rise=0.25, val=0.2, side=0.25)
    y1 = sign(s, 'sweet_sign', W, 1.78, D / 2 + 0.45, w=W - 0.1, frame='#f0e8d8', t=0.03, pad=0.015)
    w = 1.7; h = w / s.asp['sweet_sub']; s.tq('sweet_sub', 0, 1.74 - h / 2, w, D / 2 + 0.44); s.tq('sweet_sub', 0, 1.74 - h / 2, w, D / 2 + 0.43, face='-z')
    s.box(-1.3, -0.9, CH, CH + 0.62, -0.3, 0.12, '#e8ece8'); s.box(-1.3, -0.9, CH + 0.62, CH + 0.7, -0.3, 0.12, '#3d7ab0'); s.tq('sweet_ice', -1.1, CH + 0.33, 0.33, 0.124)     # 刨冰機
    s.cyl((-1.1, CH + 0.02, 0.26), (-1.1, CH + 0.1, 0.26), 0.09, '#f4f4f0', seg=10, r2=0.11); s.ball((-1.1, CH + 0.13, 0.26), 0.08, '#f8fbff', sy=0.7)
    glass_case(s, -0.75, 0.55, -0.1, 0.35, h=0.3, shelf=False)                                                                            # 長玻璃配料櫃（八格）
    for i, c in enumerate(('#2a2220', '#8a2a2a', '#5a8a3a', '#9a7ab0', '#e0a040', '#e8e0c8', '#f0ead8', '#3a2a22')):
        x = -0.72 + i * 0.158; s.box(x, x + 0.148, CH + 0.02, CH + 0.12, -0.07, 0.32, STEEL); s.box(x + 0.012, x + 0.136, CH + 0.1, CH + 0.13, -0.058, 0.308, c)
    s.cyl((0.85, CH, -0.05), (0.85, CH + 0.34, -0.05), 0.2, STEEL, seg=14); s.cyl((0.85, CH + 0.34, -0.05), (0.85, CH + 0.39, -0.05), 0.2, STEEL_D, seg=14, r2=0.06)           # 燒仙草保溫鍋
    for i in range(3):                                                                                                                    # 碗架
        for j in range(4): s.cyl((1.15 + i * 0.07, CH + j * 0.03, 0.25), (1.15 + i * 0.07, CH + 0.06 + j * 0.03, 0.25), 0.03 if i == 1 else 0.07, '#f4f4f0', seg=10, r2=0.075) if i == 0 else None
    for j in range(5): s.cyl((1.2, CH + j * 0.028, 0.22), (1.2, CH + 0.05 + j * 0.028, 0.22), 0.05, '#f4f4f0', seg=10, r2=0.08)
    s.cyl((-0.4, CH, -0.35), (-0.4, CH + 0.5, -0.35), 0.015, STEEL_D, seg=6); s.cyl((-0.4, CH + 0.5, -0.37), (-0.4, CH + 0.5, -0.3), 0.16, '#5a8ab0', seg=14)                # 電扇
    s.box(W / 2 + 0.04, W / 2 + 0.08, 0.0, 1.8, 0.3, 0.34, '#5a4630'); board(s, 'sweet_menu', W / 2 + 0.24, 1.35, 0.32, 0.345)
    flag(s, 'sweet_flag', -W / 2 - 0.25, 2.05, 0.27, z=D / 2 + 0.2)
    for bx in (-0.9, 0.0, 0.9): bulb(s, bx, 2.32, 0.3, drop=0.2)
    for sx in (-1, 1):                                                                                                                    # 兩張紅折疊桌、六張紅凳（攤子兩邊各一張）
        tx = sx * 2.35; ftable(s, tx, 0.1)
        for (dx, dz) in ((-0.25, 0.6), (0.25, 0.6), (0.0, -0.5)): T.stool(s, tx + dx, 0.1 + dz, '#c9302a')
        s.cyl((tx, 0.73, 0.1), (tx, 0.83, 0.1), 0.035, '#e8e0c8', seg=8)
    T.bucket(s, 0.3, -0.85, '#c9463d'); T.gas(s, -0.6, -0.8)


# ---------- 背景三攤 ----------
def ring(s, W, D):
    s.box(-1.1, 1.1, 0.0, 0.015, -0.8, 0.8, '#b8231c'); rnd = random.Random(7); cols = ['#f0c040', '#5a8ae0', '#5ab87a', '#f4f4f0', '#e08ac0', '#8a5a2a']
    for i in range(30):
        x, z = -0.95 + (i % 6) * 0.38, -0.65 + (i // 6) * 0.3; h = 0.12 + rnd.random() * 0.2; s.cyl((x, 0.015, z), (x, 0.015 + h, z), 0.05 + rnd.random() * 0.03, cols[rnd.randrange(len(cols))], seg=8)
    posts(s, 2.3, 1.7, 2.1, STEEL_D, t=0.03, y0=0.0, inset=0.0); awning(s, 2.2, 1.6, 2.1, ['#c9302a', '#f4d23a'], over=0.15, rise=0.15)
    for t in range(3):                                                                                                                    # 後面的獎品展示架
        y = 0.5 + t * 0.4; s.box(-1.05, 1.05, y, y + 0.02, -0.82, -0.55, WOOD)
        for i in range(7): c = cols[(i + t * 2) % len(cols)]; s.rbox(-0.98 + i * 0.3, -0.8 + i * 0.3, y + 0.02, y + 0.2 + (i % 3) * 0.05, -0.78, -0.6, c, r=0.03)
    sign(s, 'bg_ring', 2.0, 1.6, 0.97, w=1.2, frame='#c9302a', t=0.03); board(s, 'bg_ring_p', 0.75, 0.3, 0.5, 0.82, col='#c9302a')
    for bx in (-0.6, 0.6): bulb(s, bx, 2.1, 0.3, drop=0.14)
    T.stool(s, 1.3, -0.2); T.bucket(s, 1.3, 0.35, '#c9463d', r=0.14, h=0.25)

def phonecase(s, W, D):
    s.rbox(-W / 2, W / 2, 0.72, 0.75, -D / 2, D / 2, '#e8e8e4', r=0.01)                                                                     # 展示桌
    for xx in (-W / 2 + 0.05, W / 2 - 0.08):
        for zz in (-D / 2 + 0.05, D / 2 - 0.08): s.box(xx, xx + 0.03, 0.0, 0.72, zz, zz + 0.03, STEEL_D)
    s.box(-W / 2, W / 2, 0.3, 0.72, D / 2 - 0.01, D / 2, '#2a3a6a'); board(s, 'bg_case_p', 0.0, 0.5, 0.6, D / 2 + 0.026, col='#1f3f9a')
    posts(s, W, D, 2.0, STEEL_D, t=0.025, y0=0.0, inset=0.0); s.box(-W / 2, W / 2, 1.98, 2.0, -D / 2, D / 2 + 0.2, '#e8e8e4')
    s.box(-W / 2, W / 2, 0.75, 1.9, -D / 2, -D / 2 + 0.02, '#3a3a3c'); cols = ['#e05a5a', '#5a8ae0', '#f0c040', '#5ab87a', '#e08ac0', '#2b2b2d', '#f4f4f0', '#8a5ae0']
    for i in range(52): s.box(-0.76 + (i % 13) * 0.118, -0.68 + (i % 13) * 0.118, 0.85 + (i // 13) * 0.26, 1.02 + (i // 13) * 0.26, -D / 2 + 0.02, -D / 2 + 0.035, cols[(i * 5 + i // 13) % len(cols)])
    for i in range(12): s.box(-0.7 + (i % 6) * 0.25, -0.52 + (i % 6) * 0.25, 0.75, 0.77, -0.15 + (i // 6) * 0.22, 0.0 + (i // 6) * 0.22, cols[(i * 3) % len(cols)])
    sign(s, 'bg_case', W, 1.66, D / 2 + 0.2, w=1.0, frame='#e8e8e4', t=0.03); s.gbox(-W / 2 + 0.05, W / 2 - 0.05, 1.955, 1.975, D / 2 - 0.1, D / 2 - 0.04, '#f4f8ff')   # 白色 LED 燈條
    T.stool(s, 0.2, -0.75, '#3d6fb0')

def socks(s, W, D):
    s.rbox(-W / 2, W / 2, 0.72, 0.75, -D / 2, D / 2, '#d9d4c8', r=0.01)                                                                     # 折疊桌
    for sx in (-1, 1): xx = sx * (W / 2 - 0.12); s.box(xx - 0.012, xx + 0.012, 0.0, 0.72, -D / 2 + 0.06, -D / 2 + 0.085, STEEL_D); s.box(xx - 0.012, xx + 0.012, 0.0, 0.72, D / 2 - 0.085, D / 2 - 0.06, STEEL_D)
    cols = ['#f4f4f0', '#2b2b2d', '#8a8f98', '#c9463d', '#3d6fb0', '#e0b83a']
    for i in range(15): s.rbox(-0.72 + (i % 5) * 0.29, -0.48 + (i % 5) * 0.29, 0.75, 0.81 + (i % 3) * 0.03, -0.28 + (i // 5) * 0.19, -0.12 + (i // 5) * 0.19, cols[(i * 5) % len(cols)], r=0.015)
    for xx in (-W / 2 + 0.02, W / 2 - 0.05): s.box(xx, xx + 0.03, 0.0, 1.9, -D / 2 - 0.12, -D / 2 - 0.09, STEEL_D)                           # 後面的金屬掛架
    for t in range(3):
        y = 1.85 - t * 0.38; s.cyl((-W / 2, y, -D / 2 - 0.105), (W / 2, y, -D / 2 - 0.105), 0.012, STEEL, seg=6)
        for i in range(12): c = cols[(i + t) % len(cols)]; x = -0.72 + i * 0.13; s.box(x, x + 0.08, y - 0.28, y - 0.01, -D / 2 - 0.11, -D / 2 - 0.1, c); s.box(x, x + 0.11, y - 0.31, y - 0.25, -D / 2 - 0.11, -D / 2 - 0.1, c, 0.9)
    T.parasol(s, '#3d6fb0', '#f4f4f0', x=0.0, z=-0.1, y=2.2, r=1.2)
    board(s, 'bg_socks', 0.0, 0.5, 0.7, D / 2 + 0.03, col='#b8231c'); board(s, 'bg_socks_p', 0.45, 0.95, 0.42, 0.1, col='#b8231c')
    bulb(s, 0.3, 2.2, 0.2, drop=0.2); T.stool(s, -0.2, -0.75, '#c9463d')


OPEN = {'milk': milk, 'pepper': pepper, 'wheelcake': wheelcake, 'ball': ball, 'scallion': scallion, 'stinky': tofu, 'corn': corn, 'eggcake': eggcake, 'cane': cane, 'jelly': jelly, 'ring': ring, 'phonecase': phonecase, 'socks': socks}


# ---------- 收攤（每一攤自己的輪廓） ----------
def closed(s, k, W, D, tarp):
    x0, x1, z0, z1 = -W / 2 - 0.03, W / 2 + 0.03, -D / 2 - 0.03, D / 2 + 0.03
    def wheels():
        for xx in (-W / 2 + 0.15, W / 2 - 0.15):
            for zz in (-D / 2 + 0.1, D / 2 - 0.1): s.cyl((xx - 0.025, 0.09, zz), (xx + 0.025, 0.09, zz), 0.09, BLACK, seg=10)
        s.box(-W / 2 + 0.05, W / 2 - 0.05, 0.16, 0.24, -D / 2 + 0.05, D / 2 - 0.05, STEEL_D)
    def lash(x, y, col='#c9463d'): T.stool(s, x, 0.0, col, y=y, flip=True)
    if k == 'milk':        # 木框架和頂板留著；攤體罩深褐帆布，中間冷藏櫃那一段比較高；招牌用布蓋起來
        wheels(); posts(s, W, D, 2.15, WALNUT, t=0.06, y0=0.2); s.box(-W / 2 - 0.08, W / 2 + 0.08, 2.15, 2.19, -D / 2 - 0.06, D / 2 + 0.12, '#3a2418')
        drape(s, x0, x1, 0.22, CH + 0.36, z0, z1, tarp, folds=4); drape(s, 0.25, 0.9, CH + 0.3, CH + 0.66, -0.42, 0.02, tarp, flare=0.05, folds=1, rope=False)
        s.box(-W / 2, W / 2, 2.24, 2.62, D / 2 + 0.04, D / 2 + 0.11, tarp, 0.9); lash(-0.5, CH + 0.37, '#4a2f1e')
    elif k == 'pepper':    # 金柱和頂留著、布幔收起來綁在柱子上；爐子那一頭高、保溫櫃那一頭中等；皇冠套一個布袋
        wheels()
        for xx in (-W / 2 + 0.06, W / 2 - 0.06):
            for zz in (D / 2 - 0.06, -D / 2 + 0.06): s.cyl((xx, 0.2, zz), (xx, 2.2, zz), 0.045, GOLD, seg=10)
            s.rbox(xx - 0.09, xx + 0.09, 1.4, 2.15, D / 2 - 0.02, D / 2 + 0.1, '#7a1420', r=0.04); s.box(xx - 0.095, xx + 0.095, 1.7, 1.73, D / 2 - 0.025, D / 2 + 0.105, GOLD)
        s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.2, 2.29, -D / 2 - 0.05, D / 2 + 0.05, '#7a1420')
        drape(s, x0 + 0.1, x1 - 0.1, 0.22, CH + 0.2, z0, z1, tarp, folds=4); drape(s, -1.1, -0.45, CH + 0.15, CH + 0.68, -0.33, 0.33, tarp, flare=0.05, folds=1, rope=False); drape(s, 0.42, 1.12, CH + 0.15, CH + 0.48, -0.33, 0.33, tarp, flare=0.04, folds=2, rope=False)
        s.rbox(-0.24, 0.24, 2.29, 2.78, D / 2 - 0.24, D / 2 + 0.24, '#5a4a3a', r=0.1); s.box(-0.25, 0.25, 2.4, 2.42, D / 2 - 0.25, D / 2 + 0.25, '#e8e0c8')
    elif k == 'wheelcake':  # 小餐車：棚子的桿子放倒綁在上面，藍灰帆布矮矮一包
        T.cart(s, tall=False); drape(s, x0, x1, 0.28, CH + 0.3, z0, z1, tarp, folds=3)
        for i in range(4): s.cyl((-0.7, CH + 0.33 + (i // 2) * 0.03, -0.1 + i * 0.06), (0.72, CH + 0.33 + (i // 2) * 0.03, -0.1 + i * 0.06), 0.014, STEEL_D, seg=6)
        s.rbox(-0.5, 0.5, CH + 0.31, CH + 0.41, 0.12, 0.3, '#b8a57a', r=0.04); T.gas(s, W / 2 + 0.22, -0.2)
    elif k == 'ball':      # 深藍帆布；保溫櫃那一頭高；黃色遮雨板捲起來橫放
        wheels(); drape(s, x0, x1, 0.22, CH + 0.22, z0, z1, tarp, folds=3); drape(s, 0.2, 0.78, CH + 0.18, CH + 0.48, -0.32, 0.32, tarp, flare=0.04, folds=1, rope=False)
        s.cyl((-0.72, CH + 0.3, 0.0), (0.15, CH + 0.3, 0.0), 0.075, '#f4c92e', seg=10); lash(0.48, CH + 0.49, '#f4c92e')
    elif k == 'scallion':  # 棚架留著、條紋棚布捲在前緣；灰綠帆布罩煎台；立著的菜單黑板收起來靠在旁邊
        wheels(); posts(s, W, D, 2.1, '#e8e8e4', t=0.035, y0=0.2)
        for zz in (-D / 2 + 0.03, D / 2 - 0.065): s.box(-W / 2, W / 2, 2.08, 2.11, zz, zz + 0.035, '#e8e8e4')
        for i in range(8): s.cyl((-W / 2 + i * W / 8, 2.16, D / 2 - 0.05), (-W / 2 + (i + 1) * W / 8, 2.16, D / 2 - 0.05), 0.07, '#3f8a4a' if i % 2 else '#f4f4ee', seg=8)
        drape(s, x0, x1, 0.22, CH + 0.26, z0, z1, tarp, folds=4); s.box(-W / 2 - 0.36, -W / 2 - 0.3, 0.0, 1.2, -0.3, 0.3, '#2a2a2c'); lash(0.5, CH + 0.27, '#3f8a4a')
    elif k == 'stinky':    # 深木框和排煙罩留著；酒紅帆布；酒甕收到攤子旁邊蓋著
        wheels(); posts(s, W, D, 2.25, '#3a2418', t=0.07, y0=0.2); s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.25, 2.31, -D / 2 - 0.05, D / 2 + 0.1, '#3a2418'); hood(s, -0.95, 0.05, D, y=1.72, h=0.28, duct=2.25)
        drape(s, x0, x1, 0.22, CH + 0.3, z0, z1, tarp, folds=4); s.box(-W / 2, W / 2, 2.33, 2.75, D / 2 + 0.02, D / 2 + 0.09, tarp, 0.9)
        drape(s, -W / 2 - 0.55, -W / 2 - 0.08, 0.0, 0.58, 0.35, 0.9, tarp, flare=0.05, folds=1)
    elif k == 'corn':      # 黑帆布；玉米架那兩頭高、中間烤台低；排煙罩留著；黑金菜單牌放倒
        wheels(); posts(s, W, D, 2.2, '#1c1c1e', t=0.05, y0=0.2); s.box(-W / 2 - 0.05, W / 2 + 0.05, 2.2, 2.25, -D / 2 - 0.05, D / 2 + 0.08, '#1c1c1e'); hood(s, -0.6, 0.5, D, y=1.72, h=0.28, duct=2.2)
        drape(s, x0, x1, 0.22, CH + 0.24, z0, z1, tarp, folds=5); drape(s, -1.18, -0.68, CH + 0.2, CH + 0.56, -0.32, 0.3, tarp, flare=0.04, folds=1, rope=False); drape(s, 0.72, 1.18, CH + 0.2, CH + 0.4, -0.3, 0.22, tarp, flare=0.04, folds=1, rope=False)
        s.box(-W / 2, W / 2, 2.27, 2.9, D / 2 + 0.0, D / 2 + 0.07, '#2a2a2c', 0.9)
    elif k == 'eggcake':   # 三輪車：輪子、龍頭看得到；灰棕帆布；棚子拆下來捲成一捆橫綁
        for sx in (-1, 1): x = sx * (W / 2 + 0.05); s.cyl((x - 0.02, 0.32, 0.0), (x + 0.02, 0.32, 0.0), 0.32, BLACK, seg=18); s.cyl((x - 0.025, 0.32, 0.0), (x + 0.025, 0.32, 0.0), 0.25, STEEL_D, seg=14)
        s.cyl((W / 2 + 0.1, 0.5, -D / 2 + 0.05), (W / 2 + 0.75, 0.3, -D / 2 + 0.05), 0.025, '#a8322a', seg=6); s.cyl((W / 2 + 0.72, 0.2, -D / 2 + 0.05), (W / 2 + 0.78, 0.2, -D / 2 + 0.05), 0.2, BLACK, seg=14)
        s.cyl((W / 2 + 0.75, 0.3, -D / 2 + 0.05), (W / 2 + 0.7, 1.0, -D / 2 + 0.05), 0.018, STEEL_D, seg=6); s.cyl((W / 2 + 0.7, 1.0, -D / 2 - 0.15), (W / 2 + 0.7, 1.0, -D / 2 + 0.25), 0.016, BLACK, seg=6)
        drape(s, x0, x1, 0.44, CH + 0.34, z0, z1, tarp, flare=0.04, folds=3); s.cyl((-0.7, CH + 0.42, 0.05), (0.7, CH + 0.42, 0.05), 0.08, '#ead9a0', seg=10)
    elif k == 'cane':      # 淺綠帆布；榨汁機那一頭高；兩捆甘蔗各自用布套起來、鐵架留著
        wheels(); drape(s, x0, x1, 0.22, CH + 0.26, z0, z1, tarp, folds=3); drape(s, -0.84, -0.26, CH + 0.2, CH + 0.56, -0.33, 0.2, tarp, flare=0.04, folds=1, rope=False)
        for sx in (-1, 1):
            x = sx * (W / 2 + 0.3); s.box(x - 0.17, x + 0.17, 0.0, 0.04, -0.22, 0.12, STEEL_D); s.cyl((x, 0.04, -0.05), (x, 1.75, -0.05), 0.17, tarp, seg=10, r2=0.12, k=0.9); s.cyl((x, 1.75, -0.05), (x, 1.9, -0.05), 0.12, tarp, seg=10, r2=0.03, k=0.8)
            for yy in (0.5, 1.2): s.cyl((x, yy, -0.05), (x, yy + 0.02, -0.05), 0.175, '#e8e0c8', seg=10)
    elif k == 'jelly':     # 紅灰帆布罩長攤；棚架留著、棚布捲起來；兩張折疊桌收起來靠在攤子兩頭，六張凳子疊成兩疊
        wheels(); posts(s, W, D, 2.3, STEEL_D, t=0.035, y0=0.2)
        for zz in (-D / 2 + 0.03, D / 2 - 0.065): s.box(-W / 2, W / 2, 2.28, 2.31, zz, zz + 0.035, STEEL_D)
        s.cyl((-W / 2 - 0.2, 2.36, -D / 2 + 0.05), (W / 2 + 0.2, 2.36, -D / 2 + 0.05), 0.09, '#b23a30', seg=10)
        drape(s, x0, x1, 0.22, CH + 0.3, z0, z1, tarp, folds=6); drape(s, -1.34, -0.86, CH + 0.25, CH + 0.74, -0.32, 0.14, tarp, flare=0.04, folds=1, rope=False)
        for sx in (-1, 1):
            x = sx * (W / 2 + 0.12); s.box(x - 0.02, x + 0.02, 0.05, 0.95, -0.3, 0.3, '#c9302a'); s.box(x + sx * 0.02, x + sx * 0.045, 0.05, 0.75, -0.25, -0.22, STEEL_D); s.box(x + sx * 0.02, x + sx * 0.045, 0.05, 0.75, 0.22, 0.25, STEEL_D)
            for j in range(3): T.stool(s, sx * (W / 2 + 0.5), 0.0, '#c9302a', y=j * 0.1)
    elif k == 'ring':      # 棚架留著（條紋棚布捲起來）；獎品收進兩個箱子，紅布摺好放上面
        posts(s, 2.3, 1.7, 2.1, STEEL_D, t=0.03, y0=0.0, inset=0.0)
        for i in range(8): s.cyl((-1.1 + i * 0.275, 2.14, -0.75), (-1.1 + (i + 1) * 0.275, 2.14, -0.75), 0.07, '#c9302a' if i % 2 else '#f4d23a', seg=8)
        s.rbox(-0.8, -0.1, 0.0, 0.45, -0.7, -0.2, '#3d6fb0', r=0.03); s.rbox(0.0, 0.7, 0.0, 0.45, -0.7, -0.2, '#8a8f98', r=0.03); s.rbox(-0.7, -0.2, 0.45, 0.53, -0.62, -0.28, tarp, r=0.02)
    elif k == 'phonecase':  # 桌子和網板留著，灰色帆布從網板頂蓋到桌面下
        posts(s, W, D, 2.0, STEEL_D, t=0.025, y0=0.0, inset=0.0); s.box(-W / 2, W / 2, 1.98, 2.0, -D / 2, D / 2 + 0.2, '#e8e8e4')
        drape(s, -W / 2, W / 2, 0.3, 0.8, z0 + 0.03, z1 - 0.03, tarp, flare=0.03, folds=3); drape(s, -W / 2, W / 2, 0.78, 1.92, -D / 2 - 0.02, -D / 2 + 0.08, tarp, flare=0.02, folds=3, rope=False)
        for xx in (-W / 2 + 0.05, W / 2 - 0.08): s.box(xx, xx + 0.03, 0.0, 0.3, D / 2 - 0.08, D / 2 - 0.05, STEEL_D)
    elif k == 'socks':     # 陽傘收起來立著；折疊桌上藍色帆布包著一疊；掛架空的
        for xx in (-W / 2 + 0.02, W / 2 - 0.05): s.box(xx, xx + 0.03, 0.0, 1.9, -D / 2 - 0.12, -D / 2 - 0.09, STEEL_D)
        for t in range(3): s.cyl((-W / 2, 1.85 - t * 0.38, -D / 2 - 0.105), (W / 2, 1.85 - t * 0.38, -D / 2 - 0.105), 0.012, STEEL, seg=6)
        s.rbox(-W / 2, W / 2, 0.72, 0.75, -D / 2, D / 2, '#d9d4c8', r=0.01)
        for sx in (-1, 1): xx = sx * (W / 2 - 0.12); s.box(xx - 0.012, xx + 0.012, 0.0, 0.72, -D / 2 + 0.06, -D / 2 + 0.085, STEEL_D); s.box(xx - 0.012, xx + 0.012, 0.0, 0.72, D / 2 - 0.085, D / 2 - 0.06, STEEL_D)
        drape(s, -0.7, 0.7, 0.75, 1.02, -0.28, 0.28, tarp, flare=0.04, folds=3)
        s.cyl((0.0, 0.0, -0.1), (0.0, 2.3, -0.1), 0.02, STEEL_D, seg=6); s.cyl((0.0, 1.2, -0.1), (0.0, 2.25, -0.1), 0.09, '#3d6fb0', seg=8, r2=0.03)


# ---------- 禮貌生財的算命桌（X332；使用者 11-11 的外觀圖）：原點＝桌子中心的地面，+z＝客人那一側（巷子） ----------
def wchair(s, x, z, face=1, col='#4a2f1e'):
    """深色木椅（face＝1 椅背在 −z、人面向 +z；−1 反過來）"""
    f = face; s.rbox(x - 0.22, x + 0.22, 0.43, 0.47, z - 0.21, z + 0.21, col, r=0.012)
    for dx in (-0.19, 0.19):
        s.box(x + dx - 0.02, x + dx + 0.02, 0.0, 0.43, z + f * 0.17 - 0.02, z + f * 0.17 + 0.02, col, 0.9); s.box(x + dx - 0.02, x + dx + 0.02, 0.0, 0.95, z - f * 0.2 - 0.02, z - f * 0.2 + 0.02, col, 0.9)
    s.box(x - 0.21, x + 0.21, 0.86, 0.95, z - f * 0.2 - 0.015, z - f * 0.2 + 0.015, col); s.box(x - 0.21, x + 0.21, 0.6, 0.64, z - f * 0.2 - 0.012, z - f * 0.2 + 0.012, col)
    for dx in (-0.1, 0.0, 0.1): s.box(x + dx - 0.015, x + dx + 0.015, 0.64, 0.86, z - f * 0.2 - 0.01, z - f * 0.2 + 0.01, col, 0.95)

def tall_plant(s, x, z):
    s.cyl((x, 0.0, z), (x, 0.34, z), 0.15, '#4a4038', seg=10, r2=0.19); s.cyl((x, 0.32, z), (x, 0.35, z), 0.17, '#3a2a1e', seg=10); rnd = random.Random(11)
    s.cyl((x, 0.34, z), (x + 0.03, 1.5, z - 0.02), 0.014, '#5a4a32', seg=5)
    for i in range(16):
        a = i * 2.4; y = 0.7 + i * 0.055; r = 0.2 + rnd.random() * 0.16; cx, cz = x + math.cos(a) * r * 0.6, z + math.sin(a) * r * 0.6
        s.ell((cx, y, cz), 0.13, 0.025, 0.06, '#3f7a3a' if i % 3 else '#5a9a4a', seg=6, rings=4)

def limao_open(s):
    WD, VEL = '#3a2416', '#6a1422'
    for xx in (-0.5, 0.5):
        for zz in (-0.3, 0.3): s.box(xx - 0.03, xx + 0.03, 0.0, 0.74, zz - 0.03, zz + 0.03, WD)
    s.box(-0.575, 0.575, 0.72, 0.76, -0.375, 0.375, WD)
    drape(s, -0.6, 0.6, 0.1, 0.775, -0.4, 0.4, VEL, flare=0.05, folds=4, rope=False)                           # 暗紅絨布桌布，垂到接近地面
    s.cyl((-0.4, 0.775, -0.15), (-0.4, 0.8, -0.15), 0.07, '#b8923a', seg=10); s.cyl((-0.4, 0.8, -0.15), (-0.4, 1.12, -0.15), 0.012, '#b8923a', seg=6)      # 黃銅桌燈
    s.cyl((-0.4, 1.12, -0.15), (-0.22, 1.22, -0.08), 0.012, '#b8923a', seg=6); s.cyl((-0.25, 1.15, -0.09), (-0.16, 1.25, -0.05), 0.09, '#b8923a', seg=10, r2=0.03); s.glow((-0.235, 1.16, -0.085), 0.04)
    s.cyl((-0.12, 0.775, -0.2), (-0.12, 0.95, -0.2), 0.05, '#8a5a2a', seg=8)                                      # 木籤筒＋籤
    for i in range(7): a = i * 0.9; s.cyl((-0.12 + math.cos(a) * 0.025, 0.93, -0.2 + math.sin(a) * 0.025), (-0.12 + math.cos(a) * 0.05, 1.08, -0.2 + math.sin(a) * 0.05), 0.005, '#d9b87a', seg=4)
    s.cyl((0.2, 0.775, -0.18), (0.2, 0.782, -0.18), 0.06, '#f4f0e4', seg=10); s.cyl((0.2, 0.782, -0.18), (0.2, 0.84, -0.18), 0.03, '#f4f0e4', seg=8, r2=0.04); s.cyl((0.2, 0.83, -0.18), (0.2, 0.838, -0.18), 0.034, '#7a5a2a', seg=8)   # 茶杯
    s.box(-0.05, 0.2, 0.775, 0.8, -0.02, 0.2, '#e8dcc0'); s.box(-0.05, 0.2, 0.8, 0.803, -0.02, 0.2, '#c9b890')    # 筆記本
    s.box(-0.36, -0.1, 0.775, 0.785, 0.05, 0.31, '#3a2416'); s.cyl((-0.23, 0.785, 0.18), (-0.23, 0.795, 0.18), 0.11, '#c9a03a', seg=16); s.cyl((-0.23, 0.795, 0.18), (-0.23, 0.8, 0.18), 0.07, '#2a2a2c', seg=12); s.cyl((-0.23, 0.8, 0.18), (-0.23, 0.803, 0.18), 0.025, '#c9302a', seg=8)   # 羅盤
    s.box(0.24, 0.52, 0.775, 0.785, 0.02, 0.3, '#e8dcc0'); s.poly([(0.27, 0.787, 0.16), (0.38, 0.787, 0.27), (0.49, 0.787, 0.16), (0.38, 0.787, 0.05)], '#3a2416', two=False)   # 命盤
    s.box(0.4, 0.55, 0.775, 0.9, -0.34, -0.32, WD); s.box(0.41, 0.54, 0.79, 0.89, -0.319, -0.317, '#e8dcc0')       # 小木牌（免費算命的字 AA 定；這裡是空白的牌子）
    wchair(s, 0.0, -0.75, face=1); wchair(s, 0.0, 0.78, face=-1); tall_plant(s, -0.95, -0.55)

def limao_closed(s):
    WD = '#3a2416'
    for xx in (-0.5, 0.5):
        for zz in (-0.3, 0.3): s.box(xx - 0.03, xx + 0.03, 0.0, 0.74, zz - 0.03, zz + 0.03, WD)
    s.box(-0.575, 0.575, 0.72, 0.76, -0.375, 0.375, WD); drape(s, -0.6, 0.6, 0.3, 0.8, -0.4, 0.4, '#8a5a56', flare=0.04, folds=3)   # 桌上的東西收掉、蓋紅灰帆布
    wchair(s, -0.15, -0.95, face=1); s.box(-0.07, 0.37, 0.47, 0.51, -1.16, -0.74, WD); s.box(-0.07, 0.37, 0.51, 0.55, -1.16, -1.12, WD)   # 兩張椅子收到窗下（一張倒扣在另一張上面）
    tall_plant(s, -0.95, -0.55)

def limao_light(s):
    """店面的暖燈：騎樓天花板下的紙燈籠（門前）、招牌上的鵝頸燈"""
    s.box(-1.954, -1.946, 2.75, 3.1, -1.404, -1.396, BLACK); s.glow((-1.95, 2.55, -1.4), 0.2, '#ffe2a8', rx=0.2); s.cyl((-1.95, 2.74, -1.4), (-1.95, 2.77, -1.4), 0.08, '#3a2416', seg=8); s.cyl((-1.95, 2.33, -1.4), (-1.95, 2.36, -1.4), 0.08, '#3a2416', seg=8)
    s.glow((0.0, 2.6, -0.6), 0.06)


def build():
    B.reset(texres=2048); uv = json.load(open(os.path.join(GEN, 'nm_stalls_atlas.json')))
    root = B.group('tingzhou_stalls', props={'kind': 'tingzhou_stalls', 'note': 'NIGHT-MARKET-1110 夜市十攤＋背景三攤：STALL_<代號>_open／_closed；位置、時間在 tingzhou_layout.js 的 stalls'})
    at = bpy.data.materials.new('tzs_atlas'); at.use_nodes = True; nt = at.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.6
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, 'nm_stalls_atlas.jpg')); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    gl = L.vc_material('tzs_glow', rough=0.6); gn = gl.node_tree; vcn = next(n for n in gn.nodes if n.type == 'VERTEX_COLOR'); gb = gn.nodes['Principled BSDF']
    gn.links.new(vcn.outputs['Color'], gb.inputs['Emission Color']); gb.inputs['Emission Strength'].default_value = 1.0
    mats = {'vc': L.vc_material('tzs_vc', rough=0.55), 'atlas': at, 'glow': gl}
    kinds = {}
    for i, (k, name, size, W, D, blk, hrs, tarp, buy) in enumerate(KINDS):
        p = {'stall': k, 'name': name, 'size': size, 'buy': 1 if buy else 0}
        so = S('STALL_%s_open' % k, mats, uv); OPEN[k](so, W, D); go = so.finish(root, dict(p, state='open'))
        sc = S('STALL_%s_closed' % k, mats, uv); closed(sc, k, W, D, tarp); gc = sc.finish(root, dict(p, state='closed'))
        if T.arg('--grid'): go.location = g2b(i * 9.0, 0, 0); gc.location = g2b(i * 9.0, 0, 30)   # 只給預覽：排成格子（正式的都在原點）
        kinds[k] = {'name': name, 'size': size, 'w': W, 'd': D, 'block': {'w': blk[0], 'd': blk[1], 'back': blk[2]}, 'from': hrs[0], 'to': hrs[1], 'buy': buy, 'tarp': tarp, 'menu': MENU.get(k, [])}
    for j, (nm, fn) in enumerate((('LIMAO_TABLE_open', limao_open), ('LIMAO_TABLE_closed', limao_closed), ('LIMAO_SHOPLIGHT', limao_light))):   # 禮貌生財（X332）的算命桌、店面的燈：同一顆模型裡，位置在配置 limao.table
        sl = S(nm, mats, uv); fn(sl); gl_ = sl.finish(root, {'limao': nm})
        if T.arg('--grid'): gl_.location = g2b(13 * 9.0 + j * 4.0, 0, 0)
    info = L.export(OUT, gpu_instances=False)
    info.update({'note': 'NIGHT-MARKET-1110 夜市十攤＋背景三攤；LIMAO-SHOP-1110 禮貌生財的算命桌', 'kinds': kinds})
    L.write_json(OUT[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(json.dumps(build(), ensure_ascii=False)[:500])
