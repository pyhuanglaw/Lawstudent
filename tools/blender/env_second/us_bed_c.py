"""美國：C 棟 208 的臥室 C＝學姊的房間（AA_399 第 8 節，企劃線 5d09bb725；LAWWW-B 10-24 任務 #82 第七間的一半，另一半是法學院圖書館 2F 書庫）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/us_bed_c.glb＋us_bed_c.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/us_bed_c.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - C 是學姊的：最裡面那間，窗戶對著一棵樹，和她臺灣研究室的位子一樣（她的書桌對著窗）。
  - 只有交往中、週末 14～21 她在房間的時候可以敲門進去；進去以後她坐在書桌前，找她說話照美國版的 talkSis（LAWWW-B）。
  - 其他人：門關著，「看」→「（門上貼著一張手寫的課表。）」（門口的字，LAWWW-B）。A、B 的門一律關著。
從合租戶（us_shared）走道上的「臥室 C」門（US_SHARED_LAYOUT doors 的 bedC，x −0.2、z 1.4、門在 x 方向的牆上）進來。
區域自己的座標：x −1.8…1.8、z −1.7…1.7、天花板 2.6（和公寓一樣）；門在西牆（−x）靠南（z 0.8）；窗在東牆（+x）正中間——進門就看到窗、窗外的樹。
房間（照公寓的做法：米色地毯、白牆、白色六片式房門、白色百葉）：
  - 書桌在窗下、對著窗（她坐的位子）：筆電、一疊判例教科書（很厚、彩色封面）、螢光筆、便利貼、檯燈、馬克杯；椅背上一件開襟衫。
  - 西北角：一張 1.2 m 的床（灰白床單、摺好的被子）、床頭櫃（檯燈、一本書）。
  - 南牆：書架（判例彙編、筆記本、幾本中文書）、雙門衣櫃（百摺門）、衣櫃旁一個洗衣籃。
  - 床上：床尾一條芥末黃的毯子、一個橄欖綠抱枕；書桌上一個霧藍色水壺、窗台旁一小盆多肉。
  - 牆上：書桌旁一張手寫的讀書計畫（字是糊的）、一個小月曆；地上一塊米白小地毯、一盆植物。
  - 窗景：us_bed_c_<季節>（tools/blender/env_second/us_bed_c_view.py 渲染：C 棟背面，窗前一棵大樹、草地、步道、樹林；四季＝us3d.js 的 usSeasonKey，配置 view_season:'us'）。
內容虛構（書名、封面都是遊戲裡的；沒有真實出版社、品牌）。做法同前幾間（lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js，門在 us3d.js）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, plant, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 2.6; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'us_bed_c'
REG = {'PLAN': (0, 0, 256, 384), 'CAL': (256, 0, 512, 256), 'NOTE': (512, 0, 640, 128), 'PHOTO': (640, 0, 768, 128)}
DZ = 0.8                                         # 門（西牆）的 z（門 z 0.39～1.21：床尾 z 0.3、洗衣籃 z 1.2 起）
WZ = (-0.75, 0.75); WY = (0.9, 2.1)              # 東牆的窗


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)


def make_tex():
    """讀書計畫（手寫、糊的）、小月曆、便利貼、相框裡的照片（只有顏色）"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(5)
    x0, y0, x1, y1 = REG['PLAN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 249, 244))
    for k in range(16):
        y = y0 + 24 + k * 22; d.line([(x0 + 12, y + 16), (x1 - 12, y + 16)], fill=(200, 210, 225), width=1)
        if rr.random() < 0.85: d.line([(x0 + 18, y + 8), (x0 + 18 + rr.randint(60, 200), y + 8 + rr.randint(-2, 2))], fill=(40, 50, 110) if k % 4 else (180, 50, 50), width=3)
    sm = im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(1.2)); im.paste(sm, (x0, y0)); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['CAL']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); d.rectangle([x0, y0, x1 - 1, y0 + 46], fill=(60, 90, 130))
    for r_ in range(5):
        for c_ in range(7):
            cx, cy = x0 + 14 + c_ * 33, y0 + 60 + r_ * 36; d.rectangle([cx, cy, cx + 28, cy + 30], outline=(200, 200, 200))
            if rr.random() < 0.15: d.line([(cx + 4, cy + 20), (cx + 22, cy + 20)], fill=(180, 60, 60), width=3)
    x0, y0, x1, y1 = REG['NOTE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 232, 120))
    for k in range(4): d.line([(x0 + 14, y0 + 26 + k * 22), (x0 + 14 + rr.randint(50, 96), y0 + 26 + k * 22)], fill=(60, 60, 90), width=3)
    x0, y0, x1, y1 = REG['PHOTO']; g = Image.new('RGB', (x1 - x0, y1 - y0)); gd = ImageDraw.Draw(g)
    for yy in range(y1 - y0): gd.line([(0, yy), (x1 - x0, yy)], fill=(150 - yy // 3, 180 - yy // 4, 210 - yy // 5))
    gd.rectangle([0, 80, x1 - x0, 128], fill=(90, 110, 80)); g = g.filter(ImageFilter.GaussianBlur(2)); im.paste(g, (x0, y0))
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '臥室 C', 'sub': '學姊的房間'}; self.S = dict(trim='#f1efe9', wainH=0.1)
        self.W, self.D = 3.6, 3.4; self.X0, self.X1, self.Z0, self.Z1 = -1.8, 1.8, -1.7, 1.7
        self.rng = random.Random(208); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_carpet', 'dirty_carpet', tile=0.9, target='#cbbfa9', contrast=0.45, normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.95),   # 米色地毯（同公寓的臥室）
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#efede8', contrast=0.25, normal=0.08, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=0.9, target='#cdb08a', contrast=0.75, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),   # 淺色木
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'fabric': L.pbr(SID + '_fabric', 'rough_linen', tile=0.5, target='#e6e2da', contrast=0.5, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.95),
            'warm': L.flat('GLOW_' + SID + '_bulb', '#fff4dc', rough=0.4, emit=B.srgb('#ffe2b0')),
            'ceil': L.flat(SID + '_ceiling', '#f4f3ef', rough=0.92, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.6),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.glass = Mesh(SID + '_glassparts', M['glass']); self.fab = Mesh(SID + '_fabricparts', M['fabric'])
        self.warm = Mesh(SID + '_bulbs', M['warm']); self.prt = Mesh(SID + '_prints', M['print'])
        self.WG = {k: {} for k in 'NWES'}


def books(c, x0, x1, y, z0, z1, rr, cols, tall=(0.22, 0.27), thick=(0.025, 0.05), axis='x'):
    """一排書（沿 x 或 z）；書背朝 +z 或 −x 那一邊（看的人那一側）"""
    p = x0
    while p < x1 - 0.03:
        w = rr.uniform(*thick); h = rr.uniform(*tall); col = rr.choice(cols)
        if axis == 'x': c.vc.cbox(p, min(p + w, x1), y, y + h, z0, z1, col)
        else: c.vc.cbox(z0, z1, y, y + h, p, min(p + w, x1), col)
        p += w + 0.003


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=0.9); fl.box(X0, X1, -0.03, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    sk = 0.09
    # 東牆（E，+x）：窗（白色窗框、百葉拉到一半），窗台
    wl = c.wg('E', 'wall', M['wall']); tr = c.wg('E', 'trim', M['vc'], cm=True); gl = c.wg('E', 'glass', M['glass'])
    q = lambda za, zb, y0, y1: [(X1, y0, za), (X1, y0, zb), (X1, y1, zb), (X1, y1, za)]
    wl.quad(q(Z0, WZ[0], 0.0, H)); wl.quad(q(WZ[1], Z1, 0.0, H)); wl.quad(q(WZ[0], WZ[1], 0.0, WY[0])); wl.quad(q(WZ[0], WZ[1], WY[1], H))
    tr.cbox(X1 - 0.012, X1, 0.0, sk, Z0, Z1, '#f1efe9')
    for (za, zb) in ((WZ[0] - 0.07, WZ[0]), (WZ[1], WZ[1] + 0.07)): tr.cbox(X1 - 0.03, X1, WY[0] - 0.07, WY[1] + 0.07, za, zb, '#f4f3ef')
    for (ya, yb) in ((WY[0] - 0.07, WY[0]), (WY[1], WY[1] + 0.07)): tr.cbox(X1 - 0.03, X1, ya, yb, WZ[0] - 0.07, WZ[1] + 0.07, '#f4f3ef')
    tr.cbox(X1 - 0.16, X1, WY[0] - 0.04, WY[0], WZ[0] - 0.1, WZ[1] + 0.1, '#f4f3ef')                                     # 窗台
    mid = (WY[0] + WY[1]) / 2; tr.cbox(X1 - 0.06, X1 - 0.02, mid - 0.025, mid + 0.025, WZ[0], WZ[1], '#f4f3ef')        # 上下推窗的中框
    gl.quad([(X1 - 0.04, WY[0], WZ[1]), (X1 - 0.04, WY[0], WZ[0]), (X1 - 0.04, WY[1], WZ[0]), (X1 - 0.04, WY[1], WZ[1])])
    for k in range(14):                                                                                                    # 百葉（上半拉下來）
        y = WY[1] - 0.02 - k * 0.035; tr.cbox(X1 - 0.09, X1 - 0.075, y - 0.004, y, WZ[0] + 0.02, WZ[1] - 0.02, '#f4f2ec')
    tr.cbox(X1 - 0.1, X1 - 0.07, WY[1] - 0.02, WY[1] + 0.03, WZ[0], WZ[1], '#f4f2ec')
    c.wins = dict(side='E', wall='right', x=X1, xs=[0.0], y=round(mid, 3), w=round(WZ[1] - WZ[0], 3), h=round(WY[1] - WY[0], 3), note='東牆（+x）一扇窗；窗景 us_bed_c（窗外一棵大樹）')
    # 西牆（W，−x）：門（白色六片式）、門邊的洗衣籃
    wl = c.wg('W', 'wall', M['wall']); tr = c.wg('W', 'trim', M['vc'], cm=True)
    dw = 0.82; d0, d1 = DZ - dw / 2 - 0.06, DZ + dw / 2 + 0.06
    qw = lambda za, zb, y0, y1: [(X0, y0, zb), (X0, y0, za), (X0, y1, za), (X0, y1, zb)]
    wl.quad(qw(Z0, d0, 0.0, H)); wl.quad(qw(d1, Z1, 0.0, H)); wl.quad(qw(d0, d1, 2.05, H))
    tr.cbox(X0, X0 + 0.012, 0.0, sk, Z0, d0, '#f1efe9'); tr.cbox(X0, X0 + 0.012, 0.0, sk, d1, Z1, '#f1efe9')
    for (za, zb) in ((d0, d0 + 0.06), (d1 - 0.06, d1)): tr.cbox(X0, X0 + 0.03, 0.0, 2.05, za, zb, '#f4f3ef')
    tr.cbox(X0, X0 + 0.03, 1.99, 2.05, d0, d1, '#f4f3ef')
    tr.cbox(X0, X0 + 0.04, 0.0, 1.99, DZ - dw / 2, DZ + dw / 2, '#f2f1ec')                                                # 門板
    for (ya, yb) in ((1.15, 1.85), (0.2, 0.95)):
        for (za, zb) in ((DZ - 0.34, DZ - 0.04), (DZ + 0.04, DZ + 0.34)): tr.cbox(X0 + 0.04, X0 + 0.048, ya, yb, za, zb, '#e8e6df')   # 六片式的凹板（簡化成四片＋上面兩片在下面那一行）
    for (za, zb) in ((DZ - 0.34, DZ - 0.04), (DZ + 0.04, DZ + 0.34)): tr.cbox(X0 + 0.04, X0 + 0.048, 1.88, 1.96, za, zb, '#e8e6df')
    c.vm.cbox(X0 + 0.04, X0 + 0.1, 0.96, 1.0, DZ - 0.33, DZ - 0.27, '#b9a77a')                                           # 門把（黃銅色）
    clathe(c.vc, [(0.0, 0.0), (0.2, 0.0), (0.23, 0.42), (0.0, 0.42)], X0 + 0.6, 0.0, Z1 - 0.26, '#c9c2b2', seg=14)        # 洗衣籃（南牆、衣櫃旁；不擋門）
    c.vc.cbox(X0 + 0.45, X0 + 0.75, 0.36, 0.44, Z1 - 0.41, Z1 - 0.11, '#8aa0b8')
    c.block(X0 + 0.35, X0 + 0.85, Z1 - 0.5, Z1, 'hamper')
    # 北牆（N，−z）：雙人床、床頭櫃
    wl = c.wg('N', 'wall', M['wall']); tr = c.wg('N', 'trim', M['vc'], cm=True); pn = c.wg('N', 'print', M['print'])
    wl.quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, H, Z0), (X0, H, Z0)]); tr.cbox(X0, X1, 0.0, sk, Z0, Z0 + 0.012, '#f1efe9')
    bx0, bx1, bz0, bz1 = X0 + 0.05, -0.55, Z0, Z0 + 2.0   # 靠西北角（門在西牆 z 0.49～1.41，床到 z 0.3）
    c.wood.rbox(bx0, bx1, 0.18, 0.32, bz0 + 0.05, bz1, r=0.012, seg=1)                                                  # 床架
    c.wood.rbox(bx0, bx1, 0.0, 1.05, bz0, bz0 + 0.06, r=0.012, seg=1)                                                    # 床頭板
    for (xx, zz) in ((bx0 + 0.05, bz1 - 0.05), (bx1 - 0.05, bz1 - 0.05)): c.wood.box(xx - 0.03, xx + 0.03, 0.0, 0.18, zz - 0.03, zz + 0.03)
    c.fab.rbox(bx0 + 0.04, bx1 - 0.04, 0.32, 0.52, bz0 + 0.08, bz1 - 0.02, r=0.04, seg=2)                                # 床墊＋床單
    c.vc.crbox(bx0 + 0.02, bx1 - 0.02, 0.5, 0.58, bz0 + 0.95, bz1 - 0.03, '#9aa6b4', r=0.03, seg=2)                       # 摺好的被子（灰藍）
    for xx in (bx0 + 0.31, bx1 - 0.31): c.fab.rbox(xx - 0.26, xx + 0.26, 0.52, 0.64, bz0 + 0.1, bz0 + 0.48, r=0.05, seg=2)   # 枕頭
    c.vc.crbox(bx0 + 0.0, bx1 + 0.01, 0.56, 0.6, bz1 - 0.42, bz1 - 0.12, '#c9a23e', r=0.02, seg=2)                         # 床尾一條芥末黃的毯子（垂到床邊）
    c.vc.cbox(bx1 + 0.0, bx1 + 0.02, 0.32, 0.6, bz1 - 0.42, bz1 - 0.12, '#c9a23e')
    rbox(c.vc, rot(bx0 + 0.6, bz0 + 0.62, 0.25), -0.2, 0.2, 0.6, 0.66, -0.06, 0.12, '#7d8f6a', r=0.04)                  # 抱枕（橄欖綠，靠在枕頭前）
    c.block(bx0, bx1, bz0, bz1, 'bed')
    nx = -0.25; c.wood.rbox(nx - 0.22, nx + 0.22, 0.0, 0.55, Z0 + 0.02, Z0 + 0.42, r=0.008, seg=1)                          # 床頭櫃
    c.vm.cbox(nx - 0.04, nx + 0.04, 0.4, 0.42, Z0 + 0.42, Z0 + 0.43, '#b9a77a')
    clathe(c.vc, [(0.0, 0.0), (0.07, 0.0), (0.06, 0.02), (0.015, 0.03), (0.015, 0.3), (0.0, 0.3)], nx, 0.55, Z0 + 0.2, '#b9a77a', seg=12)
    c.warm.cyl((nx, 0.82, Z0 + 0.2), (nx, 0.98, Z0 + 0.2), 0.12, seg=14, r2=0.09)   # 燈罩（暖光）
    c.vc.cbox(nx - 0.12, nx + 0.06, 0.55, 0.58, Z0 + 0.25, Z0 + 0.38, '#3a5a7a')                                         # 一本書
    c.block(nx - 0.24, nx + 0.24, Z0, Z0 + 0.44, 'nightstand')
    uvquad(pn, [(nx + 0.5, 1.15, Z0 + 0.012), (nx + 0.8, 1.15, Z0 + 0.012), (nx + 0.8, 1.45, Z0 + 0.012), (nx + 0.5, 1.45, Z0 + 0.012)], uv('PHOTO'))   # 小相框（照片只有顏色）
    c.vc.cbox(nx + 0.48, nx + 0.82, 1.13, 1.47, Z0, Z0 + 0.01, '#3a3530')
    # 南牆（S，+z）：書架、衣櫃（百摺門）
    wl = c.wg('S', 'wall', M['wall']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    wl.quad([(X1, 0.0, Z1), (X0, 0.0, Z1), (X0, H, Z1), (X1, H, Z1)]); tr.cbox(X0, X1, 0.0, sk, Z1 - 0.012, Z1, '#f1efe9')
    cx0, cx1 = -0.85, 0.55                                                                                                # 衣櫃（牆裡面，百摺門）
    for k in range(4):
        a = cx0 + k * (cx1 - cx0) / 4; tr.cbox(a + 0.005, a + (cx1 - cx0) / 4 - 0.005, 0.02, 2.0, Z1 - 0.05, Z1 - 0.012, '#f2f1ec')
        for j in range(8): tr.cbox(a + 0.03, a + (cx1 - cx0) / 4 - 0.03, 0.15 + j * 0.23, 0.17 + j * 0.23, Z1 - 0.055, Z1 - 0.05, '#e2e0d8')   # 百葉的橫條
    tr.cbox(cx0 - 0.05, cx1 + 0.05, 2.0, 2.06, Z1 - 0.05, Z1 - 0.012, '#f4f3ef')
    c.block(cx0, cx1, Z1 - 0.15, Z1, 'closet')
    sx0, sx1, sd = 0.75, 1.75, 0.32                                                                                       # 書架
    c.wood.box(sx0, sx0 + 0.02, 0.0, 1.8, Z1 - sd, Z1 - 0.01); c.wood.box(sx1 - 0.02, sx1, 0.0, 1.8, Z1 - sd, Z1 - 0.01); c.wood.box(sx0, sx1, 1.78, 1.8, Z1 - sd, Z1 - 0.01)
    for k in range(5):
        y = 0.05 + k * 0.36; c.wood.box(sx0, sx1, y, y + 0.02, Z1 - sd, Z1 - 0.01)
        if k < 4:
            cols = (['#7a1e22', '#1e3a5a', '#2a4a2a', '#5a3a1e', '#c9b07a'] if k < 2 else ['#e8e4dc', '#3a6a8a', '#c94a3a', '#2b2b2b', '#d6cdb8'])
            books(c, sx0 + 0.03, sx1 - 0.03 - (0.25 if k == 3 else 0.0), y + 0.02, Z1 - sd + 0.03, Z1 - 0.04, rr, cols, tall=(0.24, 0.3), thick=(0.03, 0.07))
    c.block(sx0, sx1, Z1 - sd - 0.02, Z1, 'shelf')
    # 書桌（東牆，窗下，對著窗）
    tx0, tx1, tz0, tz1 = X1 - 0.62, X1 - 0.02, -0.65, 0.65
    c.wood.rbox(tx0, tx1, 0.72, 0.755, tz0, tz1, r=0.006, seg=1)
    for zz in (tz0 + 0.03, tz1 - 0.03): c.wood.box(tx0 + 0.02, tx1 - 0.02, 0.0, 0.72, zz - 0.02, zz + 0.02)
    c.wood.box(tx0 + 0.02, tx0 + 0.4, 0.45, 0.72, tz1 - 0.42, tz1 - 0.05)                                                 # 抽屜櫃
    for j in range(2): c.vm.cbox(tx0 - 0.002, tx0 + 0.02, 0.53 + j * 0.12, 0.55 + j * 0.12, tz1 - 0.28, tz1 - 0.18, '#b9a77a')
    Y = 0.755
    T = rot(tx0 + 0.3, -0.1, PI / 2)   # 本地 z＝往窗（+x）、x＝往 −z
    rbox(c.vc, T, -0.17, 0.17, Y, Y + 0.015, -0.13, 0.1, '#c9cdd1')                                                       # 筆電
    rbox(c.vc, T, -0.17, 0.17, Y + 0.015, Y + 0.23, 0.1, 0.115, '#c9cdd1'); rbox(c.vc, T, -0.155, 0.155, Y + 0.03, Y + 0.215, 0.097, 0.1, '#28303c')
    for k, col in enumerate(('#2a4a7a', '#7a1e22', '#e6dcc0', '#3a5a3a')):                                               # 一疊判例教科書（很厚）
        h = 0.055 + (k % 2) * 0.01; rbox(c.vc, rot(tx0 + 0.3, 0.45, PI / 2 + 0.06 * k), -0.13, 0.13, Y + sum(0.055 + (j % 2) * 0.01 for j in range(k)), Y + sum(0.055 + (j % 2) * 0.01 for j in range(k + 1)) - 0.002, -0.1, 0.1, col)
    rbox(c.vc, rot(tx0 + 0.18, 0.22, PI / 2 + 0.1), -0.11, 0.11, Y, Y + 0.012, -0.15, 0.15, '#f3efe2')                    # 攤開的筆記
    for k, col in enumerate(('#f4e04a', '#f08ab0', '#7ad0f0')): ccyl(c.vc, (tx0 + 0.1 + k * 0.025, Y, -0.45), (tx0 + 0.1 + k * 0.025, Y + 0.012, -0.45 + 0.12), 0.006, col, seg=6)   # 螢光筆
    clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.1), (0.0, 0.1)], tx0 + 0.15, Y, -0.58, '#f2efe8', seg=12)            # 馬克杯
    ccyl(c.vm, (tx0 + 0.12, Y, 0.55), (tx0 + 0.12, Y + 0.24, 0.55), 0.035, '#5b8fa8', seg=12)                               # 水壺（霧藍色、金屬）
    ccyl(c.vc, (tx0 + 0.12, Y + 0.24, 0.55), (tx0 + 0.12, Y + 0.27, 0.55), 0.03, '#2b2b2b', seg=12)
    clathe(c.vc, [(0.0, 0.0), (0.045, 0.0), (0.05, 0.07), (0.0, 0.07)], X1 - 0.12, Y, 0.45, '#e9e2d6', seg=12)             # 窗台旁一小盆多肉
    for k in range(6): a_ = k * PI / 3; c.vc.cbox(X1 - 0.12 + 0.02 * math.cos(a_) - 0.012, X1 - 0.12 + 0.02 * math.cos(a_) + 0.012, Y + 0.07, Y + 0.11, 0.45 + 0.02 * math.sin(a_) - 0.012, 0.45 + 0.02 * math.sin(a_) + 0.012, '#7aa36a')
    ccyl(c.vm, (tx1 - 0.12, Y, -0.55), (tx1 - 0.12, Y + 0.38, -0.55), 0.008, '#2b2b2b', seg=6)                            # 檯燈
    c.vm.cbox(tx1 - 0.2, tx1 - 0.04, Y, Y + 0.015, -0.62, -0.48, '#2b2b2b'); ccyl(c.vc, (tx1 - 0.12, Y + 0.38, -0.55), (tx1 - 0.26, Y + 0.34, -0.45), 0.045, '#2b2b2b', seg=10, r2=0.06)
    c.warm.cyl((tx1 - 0.27, Y + 0.33, -0.44), (tx1 - 0.29, Y + 0.32, -0.43), 0.055, seg=10)
    c.block(tx0, X1, tz0, tz1, 'desk')
    # 椅子（面向窗）、椅背上的開襟衫
    chx, chz = tx0 - 0.32, -0.1
    ccyl(c.vm, (chx, 0.05, chz), (chx, 0.42, chz), 0.025, '#2b2b2b', seg=8)
    for j in range(5): a_ = j * 2 * PI / 5; ccyl(c.vm, (chx, 0.05, chz), (chx + 0.25 * math.cos(a_), 0.03, chz + 0.25 * math.sin(a_)), 0.013, '#2b2b2b', seg=5)
    rbox(c.vc, rot(chx, chz, PI / 2), -0.23, 0.23, 0.42, 0.5, -0.22, 0.22, '#e8e4dc', r=0.03)
    rbox(c.vc, rot(chx, chz, PI / 2), -0.21, 0.21, 0.55, 0.98, -0.27, -0.21, '#e8e4dc', r=0.03)
    rbox(c.vc, rot(chx, chz, PI / 2), -0.22, 0.22, 0.7, 0.99, -0.29, -0.2, '#b8a48a', r=0.04)                            # 開襟衫（駝色）
    c.block(chx - 0.28, chx + 0.18, chz - 0.28, chz + 0.28, 'chair')
    # 書桌旁牆上：讀書計畫、月曆、便利貼（東牆、窗的南邊）
    pn = c.wg('E', 'print', M['print'])
    uvquad(pn, [(X1 - 0.012, 1.2, 1.25), (X1 - 0.012, 1.2, 0.95), (X1 - 0.012, 1.65, 0.95), (X1 - 0.012, 1.65, 1.25)], uv('PLAN'))    # 面向 −x：左下角在 +z
    uvquad(pn, [(X1 - 0.012, 1.7, 1.25), (X1 - 0.012, 1.7, 0.95), (X1 - 0.012, 2.0, 0.95), (X1 - 0.012, 2.0, 1.25)], uv('CAL'))
    for k in range(3): uvquad(pn, [(X1 - 0.013, 1.25 + k * 0.1, 0.9 - k * 0.04), (X1 - 0.013, 1.25 + k * 0.1, 0.8 - k * 0.04), (X1 - 0.013, 1.33 + k * 0.1, 0.8 - k * 0.04), (X1 - 0.013, 1.33 + k * 0.1, 0.9 - k * 0.04)], uv('NOTE'))
    # 小地毯、盆栽、天花板的燈
    c.vc.cbox(-0.95, 0.5, 0.0, 0.006, 0.45, 1.25, '#ece4d4')                                                            # 小地毯：米白、兩道藍灰色的邊
    for (za, zb) in ((0.52, 0.58), (1.12, 1.18)): c.vc.cbox(-0.88, 0.43, 0.006, 0.008, za, zb, '#7d8ea0')
    plant(c, X1 - 0.35, Z0 + 0.35, h=0.95, pot='#d8d2c6')
    c.block(X1 - 0.6, X1, Z0, Z0 + 0.6, 'plant')
    c.warm.cyl((0.0, H - 0.07, 0.0), (0.0, H - 0.01, 0.0), 0.2, seg=20, r2=0.22)   # 吸頂燈
    # 看東西、人的位置
    c.look('desk', round(tx0 - 0.55, 3), 0.35, 0.7, '她的書桌', '', dev='一疊判例教科書、筆電、螢光筆、讀書計畫；遊戲裡顯示的字等 AA 寫')
    c.look('window', round(tx0 - 0.5, 3), -0.75, 0.6, '窗外', '', dev='窗外一棵大樹（和她臺灣研究室的位子一樣）；遊戲裡顯示的字等 AA 寫')
    c.look('shelf', 1.25, round(Z1 - 0.85, 3), 0.6, '書架', '', dev='判例彙編、筆記本、幾本中文書；遊戲裡顯示的字等 AA 寫')
    spots = {'sis': dict(x=round(chx, 3), z=chz, yaw=round(PI / 2, 4), act='sit', note='學姊坐在書桌前（面向窗）'),
             'player': dict(x=-0.35, z=0.55, yaw=round(PI / 2 - 0.45, 4), act='stand', note='玩家（房間中間，看著她）')}
    c.door = dict(x=X0, z=DZ, w=dw, axis='z', note='西牆（−x）靠南；從合租戶走道的「臥室 C」門（US_SHARED_LAYOUT doors 的 bedC）進來')
    c.spawn = dict(x=round(X0 + 1.4, 3), z=DZ, yaw=round(PI / 2, 4), note='進門、面向東（窗）')
    c.exits = [dict(x=round(X0 + 0.6, 3), z=DZ, r=0.55, label='離開房間', to='us_shared', spawn_note='回到合租戶的走道、臥室 C 的門前面（back_spawn）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall',), merge=key not in ('print',))
    for m in (c.vc, c.vm, c.glass, c.warm): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.fab.finish(c.root); c.prt.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='臥室 C（學姊的房間）', type='臥室', src='AA_399 第 8 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=3.2, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='us_bed_c', view_season='us',
               counter=None, clerk=None, teacherSpot=spots['sis'], order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               open=dict(wd=[6, 7], h0=14, h1=21, dating='heroine_05', note='AA_399 第 8 節：交往中（dating：flags.dating_heroine_05 或 romance.heroine_05.status＝dating，和各支線的 S.dating 同一個判斷）、週末（wd 6、7＝週六、週日，calendar.js 的 1＝週一…7＝週日）14～21；她在不在房間：LAWWW-B 的作息再加；其他時間照舊「臥室 C。門關著。」'),
               back_spawn=dict(x=-0.65, z=1.4, lv=0, yaw=round(-PI / 2, 4), note='合租戶的走道、臥室 C 門前面＝us3d.js 門的互動點（門 x −0.2 往走道 0.45 m）'),
               host_door=dict(zone='us_shared', id='bedC', lv=0, label='敲門（臥室 C）', note='us3d.js 的門：時段內是「敲門（臥室 C）」、時段外照舊「臥室 C。門關著。」'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats), out='assets/models/env/second_ai/' + SID + '.glb'))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('US_BED_C', 'OK' if not p else p)
