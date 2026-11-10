"""汀州路商圈的夜市攤位模組（TINGZHOU-AREA-1110 第 2 版；LAWWW2 帳號 A 2026-11-10）→ assets/models/env/second_ai/tingzhou_stalls.glb（＋.json）、textures/gen/tz_stalls_atlas.jpg
使用者 11-10：「夜市攤位請設計成可依遊戲時間出現、營業、收攤的模組化物件，不要永久佔據道路」「攤位要有種類差異」「不必每個攤位都能互動」「不要把固定店家的門口全部堵住」；
攤車的樣子照使用者的參考圖 7（不鏽鋼攤車、黃色燈箱招牌、瓦斯桶、塑膠桶；圖不進 repo，分析在 docs/art-rebuild/second_ai/ref/tingzhou_1110/REF_ANALYSIS.md）。
攤名、賣什麼、價錢：AA_744 第 2 節（企劃線；第 2、3 節有效）。
每一種兩個節點（原點＝攤車中心的地面；+z＝客人那一面；本地 x＝攤車的長邊）：
  STALL_<種類>_open    營業：攤車＋上面的器具和食物＋黃色燈箱招牌（字在貼圖集）＋燈泡＋瓦斯桶／水桶／板凳
  STALL_<種類>_closed  收攤：攤車罩帆布、綁繩子、板凳倒扣在上面
位置在 src/data/tingzhou_layout.js 的 stalls（遊戲 src/tingzhou3d.js 照時間切換；看、買由 LAWWW 接）。
材質兩個：tzs_vc（頂點色）、tzs_atlas（招牌、價目、燈泡；自己發光，遊戲照晚上的程度調亮）。
  /opt/blenv/bin/python tools/blender/env_second/tz_stalls.py [-- --out <glb>]"""
import os, sys, math, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/tingzhou_stalls.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'

# 種類：代號 → (攤名, 價目一行, 燈箱底色, 字色, 能不能買)。攤名、價錢照 AA_744 第 2 節；背景攤（不能買）只有種類
KINDS = [
    ('guabao', '老鄭割包', '割包 60', '#f6d23a', '#b8231c', True),
    ('pepper', '炭爐胡椒餅', '胡椒餅 60', '#f6d23a', '#7a2a12', True),
    ('wheelcake', '三姊妹紅豆餅', '紅豆・奶油・芋頭 15', '#fff2c8', '#b8231c', True),
    ('ball', '小黃地瓜球', '一包 40', '#f6d23a', '#5a3a12', True),
    ('scallion', '阿嬤蔥油餅', '加蛋 45', '#ffffff', '#2f7d3a', True),
    ('stinky', '巷尾臭豆腐', '炸臭豆腐 70', '#f6d23a', '#1f1f1f', True),
    ('corn', '炭火烤玉米', '烤玉米 80', '#fbe7b0', '#8a3a12', True),
    ('eggcake', '動物雞蛋糕', '十個 50', '#ffe9a8', '#a8501c', True),
    ('cane', '現榨甘蔗汁', '加檸檬 50', '#d9f0b8', '#2f6a2a', True),
    ('jelly', '粉圓冰・燒仙草', '一碗 45', '#ffffff', '#3b5a8c', True),
    ('ring', '套圈圈', '十個圈 50', '#ffdede', '#b8231c', False),
    ('phonecase', '手機殼・配件', '任選 100', '#e8f0ff', '#1f3f9a', False),
    ('socks', '襪子', '三雙一百', '#fff6a8', '#b8231c', False),
    ('fortune', '算命・卜卦', '', '#8a1f1f', '#f6d23a', False),
]
CW, CD, CH = 1.5, 0.7, 0.85     # 攤車：長、深、檯面高
SW, SH = 1.5, 0.34              # 燈箱招牌
STEEL, STEEL_D, BLACK, WOOD = '#c9ccd0', '#8f9498', '#26282a', '#9a7448'


def make_atlas():
    """招牌（512×116 一格）、價目牌（256×84）、燈泡的暖白色塊 → tz_stalls_atlas.jpg；回傳 {key: (u0, v0, u1, v1)}"""
    W = H = 1024; im = Image.new('RGB', (W, H), (30, 30, 30)); d = ImageDraw.Draw(im); uv = {}
    def put(key, x, y, w, h): uv[key] = (x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H)
    def text_fit(t, w, px):
        while px > 8:
            f = ImageFont.truetype(FONT, px); b = d.textbbox((0, 0), t, font=f)
            if b[2] - b[0] <= w: break
            px -= 2
        return f, b
    for i, (k, name, price, bg, fg, _) in enumerate(KINDS):
        x, y, w, h = (i % 2) * 512, (i // 2) * 120, 508, 116
        d.rectangle([x, y, x + w, y + h], fill=bg); d.rectangle([x + 3, y + 3, x + w - 3, y + h - 3], outline=fg, width=3)
        f, b = text_fit(name, w - 40, 76); d.text((x + w / 2 - (b[0] + b[2]) / 2, y + h / 2 - (b[1] + b[3]) / 2), name, font=f, fill=fg)
        put('sign_' + k, x, y, w, h)
        if price:
            px, py, pw, ph = (i % 4) * 256, 850 + (i // 4) * 44, 252, 40
            d.rectangle([px, py, px + pw, py + ph], fill='#fffdf4'); f, b = text_fit(price, pw - 16, 28); d.text((px + pw / 2 - (b[0] + b[2]) / 2, py + ph / 2 - (b[1] + b[3]) / 2), price, font=f, fill='#b8231c')
            put('price_' + k, px, py, pw, ph)
    d.rectangle([980, 980, 1023, 1023], fill='#fff0c8'); put('bulb', 990, 990, 24, 24)
    os.makedirs(GEN, exist_ok=True); im.save(os.path.join(GEN, 'tz_stalls_atlas.jpg'), quality=90); return uv


class Stall:
    """一個攤位節點：頂點色網格（V）＋貼圖集網格（A）"""
    def __init__(self, name, mats, uv):
        self.name = name; self.V = CMesh(name + '_vc', mats['vc']); self.A = Mesh(name + '_at', mats['atlas']); self.uv = uv; self.aq = []

    def box(self, x0, x1, y0, y1, z0, z1, col, k=1.0): self.V.cbox(x0, x1, y0, y1, z0, z1, col, k)
    def rbox(self, x0, x1, y0, y1, z0, z1, col, r=0.03): self.V.crbox(x0, x1, y0, y1, z0, z1, col, r=r)

    def _new(self, fn, col, k=1.0):
        before = set(self.V.bm.faces); fn(); self.V.paint([f for f in self.V.bm.faces if f not in before], col, k)

    def cyl(self, a, b, r, col, seg=12, r2=None, k=1.0): self._new(lambda: self.V.cyl(a, b, r, seg=seg, r2=r2), col, k)
    def ball(self, c, r, col, sy=1.0, seg=8, rings=5): self._new(lambda: self.V.sphere(c, r, seg=seg, rings=rings, sy=sy), col)

    def quad(self, key, pts):
        """貼圖集的一格貼在四邊形上（pts：左下、右下、右上、左上）"""
        self.aq.append((key, [g2b(*p) for p in pts]))

    def finish(self, root, props):
        g = B.group(self.name, root, props=props)
        self.V.finish(g, uv=False)
        if self.aq:
            bm = self.A.bm; lay = bm.loops.layers.uv.new('UVMap')
            for key, pts in self.aq:
                u0, v0, u1, v1 = self.uv[key]; f = bm.faces.new([bm.verts.new(p) for p in pts])
                for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[lay].uv = t
            self.A.finish(g, uv=False, merge=False)
        else: self.A.bm.free()
        return g


def cart(s, tall=True):
    """不鏽鋼攤車：檯面、圍板、下層、四個輪子；後面兩根立柱撐燈箱"""
    x0, x1, z0, z1 = -CW / 2, CW / 2, -CD / 2, CD / 2
    s.rbox(x0, x1, CH - 0.04, CH, z0, z1, STEEL, r=0.012)                      # 檯面
    s.box(x0 + 0.02, x1 - 0.02, 0.2, CH - 0.04, z1 - 0.03, z1 - 0.01, STEEL, 0.94)   # 前圍板
    for xx in (x0 + 0.02, x1 - 0.04): s.box(xx, xx + 0.02, 0.2, CH - 0.04, z0, z1 - 0.02, STEEL, 0.9)
    s.box(x0 + 0.02, x1 - 0.02, 0.2, 0.23, z0, z1, STEEL_D)                    # 下層板
    for xx in (x0 + 0.03, x1 - 0.06):
        for zz in (z0 + 0.01, z1 - 0.04): s.box(xx, xx + 0.03, 0.1, CH - 0.04, zz, zz + 0.03, STEEL_D)
    for xx in (x0 + 0.12, x1 - 0.12):
        for zz in (z0 + 0.1, z1 - 0.1): s.cyl((xx - 0.025, 0.08, zz), (xx + 0.025, 0.08, zz), 0.08, BLACK, seg=10)
    if tall:
        for xx in (x0 + 0.03, x1 - 0.06): s.box(xx, xx + 0.03, CH, 2.0, z0 + 0.01, z0 + 0.04, STEEL_D)


def lightbox(s, kind, y=2.0):
    """黃色燈箱招牌（兩面）＋下面兩顆燈泡＋檯面前緣的價目牌"""
    x0, x1, z0 = -SW / 2, SW / 2, -CD / 2 - 0.02
    s.box(x0, x1, y, y + SH, z0, z0 + 0.12, STEEL_D)
    s.quad('sign_' + kind, [(x0 + 0.02, y + 0.02, z0 + 0.123), (x1 - 0.02, y + 0.02, z0 + 0.123), (x1 - 0.02, y + SH - 0.02, z0 + 0.123), (x0 + 0.02, y + SH - 0.02, z0 + 0.123)])
    s.quad('sign_' + kind, [(x1 - 0.02, y + 0.02, z0 - 0.003), (x0 + 0.02, y + 0.02, z0 - 0.003), (x0 + 0.02, y + SH - 0.02, z0 - 0.003), (x1 - 0.02, y + SH - 0.02, z0 - 0.003)])
    for bx in (-0.42, 0.42):                                                    # 燈泡：電線＋八面體（貼圖集的暖白色塊）
        s.box(bx - 0.004, bx + 0.004, y - 0.16, y, -0.004, 0.004, BLACK)
        c = (bx, y - 0.21, 0.0); r = 0.05
        P = [(c[0], c[1] + r * 1.2, c[2]), (c[0] + r, c[1], c[2]), (c[0], c[1], c[2] + r), (c[0] - r, c[1], c[2]), (c[0], c[1], c[2] - r), (c[0], c[1] - r * 1.2, c[2])]
        for i in range(4):
            a, b = P[1 + i], P[1 + (i + 1) % 4]; s.quad('bulb', [b, a, P[0], P[0]]); s.quad('bulb', [a, b, P[5], P[5]])
    if ('price_' + kind) in s.uv:
        s.box(-0.33, 0.33, CH - 0.27, CH - 0.05, CD / 2 - 0.012, CD / 2 + 0.004, '#fffdf4')
        s.quad('price_' + kind, [(-0.31, CH - 0.26, CD / 2 + 0.006), (0.31, CH - 0.26, CD / 2 + 0.006), (0.31, CH - 0.06, CD / 2 + 0.006), (-0.31, CH - 0.06, CD / 2 + 0.006)])


def gas(s, x, z): s.cyl((x, 0.0, z), (x, 0.5, z), 0.16, '#7d8a94', seg=12); s.cyl((x, 0.5, z), (x, 0.58, z), 0.16, '#7d8a94', seg=12, r2=0.06); s.cyl((x, 0.58, z), (x, 0.66, z), 0.035, '#b8a04a', seg=8)
def bucket(s, x, z, col='#3d6fb0', r=0.17, h=0.3): s.cyl((x, 0.0, z), (x, h, z), r * 0.85, col, seg=12, r2=r)
def stool(s, x, z, col='#c9463d', y=0.0, flip=False):
    s.cyl((x, y + (0.0 if flip else 0.4), z), (x, y + (0.04 if flip else 0.44), z), 0.15, col, seg=10)
    for (dx, dz) in ((0.1, 0.1), (-0.1, 0.1), (0.1, -0.1), (-0.1, -0.1)): s.box(x + dx - 0.015, x + dx + 0.015, y + (0.04 if flip else 0.0), y + (0.44 if flip else 0.4), z + dz - 0.015, z + dz + 0.015, col, 0.85)
def parasol(s, col_a, col_b, x=0.0, z=-0.1, y=2.5, r=1.25):
    """大陽傘（八片兩色相間）＋傘桿"""
    s.cyl((x, 0.0, z), (x, y + 0.25, z), 0.02, STEEL_D, seg=6)
    for i in range(8):
        a0, a1 = i * math.pi / 4, (i + 1) * math.pi / 4; top = (x, y + 0.3, z)
        p0 = (x + math.cos(a0) * r, y, z + math.sin(a0) * r); p1 = (x + math.cos(a1) * r, y, z + math.sin(a1) * r)
        s.V.poly([p1, p0, top], col_a if i % 2 else col_b); s.V.poly([p0, p1, top], col_a if i % 2 else col_b, 0.8)
def griddle(s, x0, x1, y=CH): s.box(x0, x1, y, y + 0.05, -0.26, 0.26, '#2b2b2d'); s.box(x0 - 0.02, x1 + 0.02, y, y + 0.09, -0.29, -0.26, STEEL_D)
def fryer(s, x, w=0.5):
    s.box(x - w / 2, x + w / 2, CH, CH + 0.16, -0.24, 0.24, STEEL_D); s.box(x - w / 2 + 0.03, x + w / 2 - 0.03, CH + 0.13, CH + 0.165, -0.21, 0.21, '#b8862e')   # 油鍋：油面
def tray(s, x0, x1, z0, z1, col=STEEL, y=CH): s.box(x0, x1, y, y + 0.04, z0, z1, col)


def equip(s, k):
    """檯面上的器具和食物（每一種不一樣）"""
    import random; rnd = random.Random(hash(k) & 0xffff)
    if k == 'guabao':
        for i, x in enumerate((-0.42, 0.02)):
            for j in range(3 - i): s.cyl((x, CH + j * 0.11, 0.0), (x, CH + j * 0.11 + 0.1, 0.0), 0.2, '#c8a46a', seg=14, k=1.0 - 0.06 * j)
            s.cyl((x, CH + (3 - i) * 0.11, 0.0), (x, CH + (3 - i) * 0.11 + 0.05, 0.0), 0.2, '#b8904f', seg=14, r2=0.08)
        tray(s, 0.3, 0.68, -0.22, 0.02); s.box(0.33, 0.65, CH + 0.04, CH + 0.09, -0.19, -0.01, '#6e3f22')     # 滷肉
        s.cyl((0.5, CH, 0.2), (0.5, CH + 0.1, 0.2), 0.09, STEEL, seg=10); s.cyl((0.5, CH + 0.08, 0.2), (0.5, CH + 0.105, 0.2), 0.08, '#d9c08a', seg=10)   # 花生粉
    elif k == 'pepper':
        s.cyl((-0.38, CH, 0.0), (-0.38, CH + 0.5, 0.0), 0.3, '#7a3b22', seg=16); s.cyl((-0.38, CH + 0.5, 0.0), (-0.38, CH + 0.56, 0.0), 0.3, '#5a2a18', seg=16, r2=0.2)   # 炭爐（陶甕）
        s.cyl((-0.38, CH + 0.545, 0.0), (-0.38, CH + 0.565, 0.0), 0.19, '#e0562a', seg=12)                           # 爐口的炭火
        tray(s, 0.05, 0.68, -0.25, 0.25)
        for i in range(8): s.ball((0.15 + (i % 4) * 0.14, CH + 0.07, -0.12 + (i // 4) * 0.24), 0.06, '#c98a45', sy=0.6)
    elif k == 'wheelcake':
        griddle(s, -0.68, 0.3)
        for i in range(12): s.cyl((-0.58 + (i % 6) * 0.155, CH + 0.05, -0.1 + (i // 6) * 0.2), (-0.58 + (i % 6) * 0.155, CH + 0.075, -0.1 + (i // 6) * 0.2), 0.062, '#d9a54a' if i % 3 else '#f0d9a0', seg=10)
        for j, c in enumerate(('#6a2a2a', '#f4e2a0', '#9a7ab0')): s.cyl((0.5, CH, -0.2 + j * 0.2), (0.5, CH + 0.12, -0.2 + j * 0.2), 0.085, STEEL, seg=10); s.cyl((0.5, CH + 0.1, -0.2 + j * 0.2), (0.5, CH + 0.125, -0.2 + j * 0.2), 0.075, c, seg=10)
    elif k == 'ball':
        fryer(s, -0.35, 0.6)
        for i in range(10): s.ball((-0.55 + (i % 5) * 0.1, CH + 0.17, -0.08 + (i // 5) * 0.16), 0.04, '#e0a83a')
        s.box(0.1, 0.68, CH, CH + 0.3, -0.24, 0.24, STEEL_D); s.box(0.12, 0.66, CH + 0.02, CH + 0.3, -0.22, 0.25, '#f4f4f0')   # 保溫箱（白）
        for i in range(24): s.ball((0.18 + rnd.random() * 0.42, CH + 0.06 + rnd.random() * 0.14, 0.22 + rnd.random() * 0.03), 0.045, '#e8b040')
    elif k == 'scallion':
        griddle(s, -0.68, 0.25)
        for (x, z, r) in ((-0.45, 0.0, 0.19), (-0.02, 0.02, 0.19)): s.cyl((x, CH + 0.05, z), (x, CH + 0.065, z), r, '#e0c078', seg=14); s.cyl((x + 0.03, CH + 0.065, z), (x + 0.03, CH + 0.07, z), r * 0.6, '#7fae58', seg=8)
        s.box(0.35, 0.68, CH, CH + 0.1, -0.22, 0.05, STEEL); s.box(0.37, 0.66, CH + 0.08, CH + 0.105, -0.2, 0.03, '#6fa84a')   # 蔥花
        s.cyl((0.5, CH, 0.2), (0.5, CH + 0.14, 0.2), 0.06, '#3a2418', seg=8)                                        # 醬油膏
    elif k == 'stinky':
        fryer(s, -0.38, 0.56)
        for i in range(8): s.box(-0.58 + (i % 4) * 0.12, -0.5 + (i % 4) * 0.12, CH + 0.16, CH + 0.21, -0.12 + (i // 4) * 0.18, -0.04 + (i // 4) * 0.18, '#d9a040')
        s.cyl((0.2, CH, -0.05), (0.2, CH + 0.26, -0.05), 0.13, '#dfe8d0', seg=12); s.cyl((0.2, CH + 0.26, -0.05), (0.2, CH + 0.29, -0.05), 0.135, '#b8231c', seg=12)   # 泡菜罐
        tray(s, 0.38, 0.7, -0.22, 0.22)
        for i in range(6): s.box(0.42 + (i % 2) * 0.13, 0.52 + (i % 2) * 0.13, CH + 0.04, CH + 0.09, -0.17 + (i // 2) * 0.13, -0.08 + (i // 2) * 0.13, '#e8d9b8')
    elif k == 'corn':
        s.box(-0.68, 0.2, CH, CH + 0.18, -0.24, 0.24, '#2b2b2d'); s.box(-0.65, 0.17, CH + 0.15, CH + 0.185, -0.21, 0.21, '#c9461e')   # 炭烤爐（炭火）
        for i in range(6): s.box(-0.66 + i * 0.165, -0.655 + i * 0.165, CH + 0.185, CH + 0.195, -0.23, 0.23, STEEL_D)
        for i in range(5): s.cyl((-0.58 + i * 0.16, CH + 0.22, -0.11), (-0.58 + i * 0.16, CH + 0.22, 0.11), 0.03, '#e8b72e' if i % 2 else '#c98a1e', seg=8)
        for j in range(2): s.cyl((0.4 + j * 0.2, CH, -0.1), (0.4 + j * 0.2, CH + 0.15, -0.1), 0.07, STEEL, seg=10)   # 醬料桶
        s.box(0.3, 0.7, CH, CH + 0.12, 0.05, 0.27, '#8a6a3a')                                                        # 生玉米的籃子
        for i in range(4): s.cyl((0.34, CH + 0.15, 0.09 + i * 0.05), (0.66, CH + 0.15, 0.09 + i * 0.05), 0.027, '#a8c46a', seg=6)
    elif k == 'eggcake':
        s.box(-0.66, -0.1, CH, CH + 0.1, -0.22, 0.22, '#2b2b2d'); s.box(-0.66, -0.1, CH + 0.1, CH + 0.14, -0.22, 0.22, '#3a3a3c')   # 烤模（合起來）
        s.box(-0.42, -0.34, CH + 0.12, CH + 0.16, 0.22, 0.42, '#5a3a22')                                             # 把手
        tray(s, 0.0, 0.68, -0.25, 0.25)
        for i in range(15): s.ball((0.08 + (i % 5) * 0.13, CH + 0.065, -0.16 + (i // 5) * 0.16), 0.05, '#e3b062', sy=0.65)
    elif k == 'cane':
        s.box(-0.68, -0.05, CH, CH + 0.55, -0.25, 0.2, '#4f8a4a'); s.box(-0.6, -0.13, CH + 0.3, CH + 0.5, 0.2, 0.215, STEEL)     # 榨汁機
        for j in range(2): s.cyl((-0.55, CH + 0.36 + j * 0.09, 0.22), (-0.18, CH + 0.36 + j * 0.09, 0.22), 0.04, STEEL_D, seg=8)   # 滾輪
        for i in range(7): s.cyl((0.55 + i * 0.03 - 0.1, 0.05, -0.3), (0.5 + i * 0.035 - 0.1, 2.0, -0.42), 0.022, '#6a7a3a' if i % 2 else '#8a5a6a', seg=6)   # 一捆甘蔗靠在後面
        for i in range(6): s.cyl((0.2 + (i % 3) * 0.16, CH, -0.05 + (i // 3) * 0.17), (0.2 + (i % 3) * 0.16, CH + 0.13, -0.05 + (i // 3) * 0.17), 0.042, '#e4e8c8', seg=8, r2=0.05)
    elif k == 'jelly':
        for (x, c) in ((-0.45, '#2a2220'), (0.0, '#3a2a22')): s.cyl((x, CH, -0.02), (x, CH + 0.3, -0.02), 0.2, STEEL, seg=14); s.cyl((x, CH + 0.27, -0.02), (x, CH + 0.305, -0.02), 0.185, c, seg=14)   # 粉圓、仙草
        for i in range(6): s.cyl((0.36 + (i % 2) * 0.2, CH, -0.2 + (i // 2) * 0.2), (0.36 + (i % 2) * 0.2, CH + 0.07, -0.2 + (i // 2) * 0.2), 0.08, '#f4f4f0', seg=10, r2=0.09); s.cyl((0.36 + (i % 2) * 0.2, CH + 0.06, -0.2 + (i // 2) * 0.2), (0.36 + (i % 2) * 0.2, CH + 0.075, -0.2 + (i // 2) * 0.2), 0.075, ('#c9a24a', '#8a5a9a', '#e8e0c8', '#7a2a2a', '#d9c08a', '#3a2a22')[i], seg=10)
    elif k == 'phonecase':
        s.box(-0.72, 0.72, CH, 1.95, -0.33, -0.3, '#3a3a3c')                                                         # 後面的網板
        cols = ['#e05a5a', '#5a8ae0', '#f0c040', '#5ab87a', '#e08ac0', '#2b2b2d', '#f4f4f0', '#8a5ae0']
        for i in range(48): s.box(-0.68 + (i % 12) * 0.115, -0.6 + (i % 12) * 0.115, CH + 0.12 + (i // 12) * 0.25, CH + 0.29 + (i // 12) * 0.25, -0.3, -0.285, cols[(i * 5 + i // 12) % len(cols)])
        for i in range(10): s.box(-0.66 + (i % 5) * 0.27, -0.46 + (i % 5) * 0.27, CH, CH + 0.03, -0.12 + (i // 5) * 0.22, 0.04 + (i // 5) * 0.22, cols[(i * 3) % len(cols)])
    elif k == 'socks':
        cols = ['#f4f4f0', '#2b2b2d', '#8a8f98', '#c9463d', '#3d6fb0', '#e0b83a']
        for i in range(15): s.rbox(-0.66 + (i % 5) * 0.27, -0.44 + (i % 5) * 0.27, CH, CH + 0.06 + (i % 3) * 0.03, -0.27 + (i // 5) * 0.19, -0.11 + (i // 5) * 0.19, cols[(i * 5) % len(cols)], r=0.015)


def build_open(k, mats, uv, root, props):
    s = Stall('STALL_%s_open' % k, mats, uv)
    if k == 'ring':       # 套圈圈：地上一塊紅布、一排排獎品、後面一根桿子掛燈箱
        s.box(-1.1, 1.1, 0.0, 0.015, -1.0, 0.6, '#b8231c')
        import random; rnd = random.Random(7); cols = ['#f0c040', '#5a8ae0', '#5ab87a', '#f4f4f0', '#e08ac0', '#8a5a2a']
        for i in range(30):
            x, z = -0.95 + (i % 6) * 0.38, -0.85 + (i // 6) * 0.3; h = 0.12 + rnd.random() * 0.2
            s.cyl((x, 0.015, z), (x, 0.015 + h, z), 0.05 + rnd.random() * 0.03, cols[rnd.randrange(len(cols))], seg=8)
        for xx in (-1.05, 1.02): s.box(xx, xx + 0.03, 0.0, 2.0, -1.03, -1.0, STEEL_D)
        global SW; _sw = SW; SW = 2.1
        s2z = -1.0 + CD / 2; s.box(-1.05, 1.05, 2.0, 2.0 + SH, -1.02, -0.9, STEEL_D)
        s.quad('sign_ring', [(-1.03, 2.02, -0.897), (1.03, 2.02, -0.897), (1.03, 2.0 + SH - 0.02, -0.897), (-1.03, 2.0 + SH - 0.02, -0.897)]); SW = _sw
        stool(s, 1.35, -0.2); bucket(s, 1.35, 0.35, '#c9463d', r=0.14, h=0.25)
    elif k == 'fortune':  # 算命：小方桌鋪紅布、籤筒、兩張板凳、立牌
        s.box(-0.4, 0.4, 0.0, 0.72, -0.3, 0.3, '#8a1f1f'); s.box(-0.42, 0.42, 0.72, 0.74, -0.32, 0.32, '#a82a22')
        s.cyl((0.2, 0.74, -0.05), (0.2, 0.92, -0.05), 0.05, '#8a5a2a', seg=8); s.box(-0.25, 0.0, 0.74, 0.76, -0.12, 0.1, '#f4ead8')
        stool(s, 0.0, -0.6, '#3d6fb0'); stool(s, 0.0, 0.62, '#c9463d')
        s.box(0.62, 0.66, 0.0, 1.5, -0.02, 0.02, BLACK); s.box(0.46, 0.82, 1.0, 1.5, -0.01, 0.01, '#8a1f1f')
        s.quad('sign_fortune', [(0.47, 1.19, 0.012), (0.81, 1.19, 0.012), (0.81, 1.31, 0.012), (0.47, 1.31, 0.012)])
    else:
        cart(s); lightbox(s, k); equip(s, k)
        if k in ('guabao', 'pepper', 'stinky', 'ball', 'scallion', 'corn', 'wheelcake', 'eggcake'): gas(s, CW / 2 + 0.25, -0.25)
        bucket(s, -CW / 2 - 0.24, -0.2, '#3d6fb0' if k not in ('jelly', 'cane') else '#c9463d'); stool(s, 0.3, -0.75)
        if k in ('corn', 'cane', 'socks', 'jelly'): parasol(s, {'corn': '#c9463d', 'cane': '#2f7d3a', 'socks': '#3d6fb0', 'jelly': '#e0b83a'}[k], '#f4f4f0')
    return s.finish(root, props)


def build_closed(k, i, mats, uv, root, props):
    """收攤：攤車罩帆布（三種顏色輪流）、兩條繩子、板凳倒扣在上面；套圈圈、算命收成一捆"""
    s = Stall('STALL_%s_closed' % k, mats, uv); tarp = ('#3d6fb0', '#2f6a4a', '#8a8f98')[i % 3]
    if k in ('ring', 'fortune'):
        s.rbox(-0.5, 0.5, 0.0, 0.5, -0.3, 0.3, tarp, r=0.06); s.box(-0.52, 0.52, 0.2, 0.23, -0.31, 0.31, BLACK); stool(s, 0.0, 0.0, '#c9463d', y=0.5, flip=True)
    else:
        cart(s, tall=False); h = CH + (0.5 if k in ('cane', 'phonecase', 'pepper') else 0.32)
        s.rbox(-CW / 2 - 0.04, CW / 2 + 0.04, 0.26, h, -CD / 2 - 0.04, CD / 2 + 0.04, tarp, r=0.07)
        for xx in (-0.4, 0.4): s.box(xx - 0.012, xx + 0.012, 0.26, h + 0.006, -CD / 2 - 0.047, CD / 2 + 0.047, '#e8e0c8')
        stool(s, 0.35, 0.0, '#c9463d', y=h, flip=True); bucket(s, -CW / 2 - 0.24, -0.2, '#3d6fb0')
    return s.finish(root, props)


def build():
    B.reset(texres=1024); uv = make_atlas()
    root = B.group('tingzhou_stalls', props={'kind': 'tingzhou_stalls', 'note': 'TINGZHOU-AREA-1110 夜市攤位模組：STALL_<種類>_open／_closed；位置在 tingzhou_layout.js 的 stalls'})
    at = bpy.data.materials.new('tzs_atlas'); at.use_nodes = True; nt = at.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.5
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, 'tz_stalls_atlas.jpg')); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    mats = {'vc': L.vc_material('tzs_vc', rough=0.5), 'atlas': at}
    kinds = {}
    for i, (k, name, price, bg, fg, buy) in enumerate(KINDS):
        p = {'stall': k, 'name': name, 'price': price, 'buy': 1 if buy else 0}
        go = build_open(k, mats, uv, root, dict(p, state='open')); gc = build_closed(k, i, mats, uv, root, dict(p, state='closed'))
        if arg('--grid'): go.location = g2b((i % 5) * 3.2, 0, (i // 5) * 3.6); gc.location = g2b((i % 5) * 3.2, 0, 12 + (i // 5) * 3.0)   # 只給預覽：排成格子（正式的都在原點）
        kinds[k] = {'name': name, 'price': price, 'buy': buy}
    info = L.export(OUT, gpu_instances=False)
    info.update({'note': 'TINGZHOU-AREA-1110 夜市攤位模組', 'kinds': kinds, 'footprint': {'w': CW + 0.9, 'd': CD + 0.9, 'note': '攤車＋瓦斯桶、水桶、後面站人的位置（導航擋這麼大）'}})
    L.write_json(OUT[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(json.dumps(build(), ensure_ascii=False)[:600])
