"""博雅 203 討論室：即興劇社的期末小演出（AA_399 第 10 節，企劃線 5d09bb725；SK07 唐睿的即興劇，src/data/events.js ev_sk07_improv；LAWWW-B 10-24 任務 #82 第四間）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/boya_203.glb＋boya_203.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/boya_203.py [-- --out-dir assets/models/env/second_ai]
企劃：只有那一晚開（2026-05-27，大一下第 14 週週三 19:00）；其他時間門照舊（boya_layout.js 的 203「之後開放」）。
  事件原文：「即興劇社借了博雅的教室，辦期末的小演出。品妤坐在第一排，沒有表情。阿哲是被你拉來的。」「輪到『觀眾給一個詞』。」
從博雅教學館 2F 的 203 門（teach3d.js 的關著的房間，lv 1）進來。區域自己的座標：x −5.4…5.4、z −3.2…3.2；門在 −z 那一面的中間（x −0.15，和走廊上的門同一個位置），+z 那一面一排窗。
房間（借來的討論室，臨時布置）：
  - 西邊是「舞台」：地上白色膠帶圍的一塊、兩張木椅＋一張小桌、椅子上一頂帽子、畫架上一塊「給我一個詞」的板子；西牆白板寫「即興劇社　期末小演出」。
  - 兩支三腳架夾燈對著舞台。
  - 觀眾席：三排、每排六張摺疊椅，面向西；門那一側留一條走道。品妤坐第一排。
  - 討論室原本的桌子推到東牆、椅子倒放在桌上；教室後面一張小桌放簽到表、一袋零食。
內容虛構（社團、演出都是遊戲裡的；沒有真實社團名稱或商標）。
區域的 x 和博雅教學館同方向（西＝−x）、+z＝南（窗外是南邊：窗景用 boya_2f_south）。做法和萬才館研討室 B、系辦、考場一樣（lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js）。"""
import json, math, os, random, sys, types
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, plant, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.2; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'boya_203'
REG = {'BOARD': (0, 0, 1024, 384), 'EASEL': (0, 384, 384, 768), 'SIGN': (384, 384, 768, 640), 'POSTER': (768, 384, 1024, 768), 'CLOCK': (384, 640, 640, 896), 'SIGNUP': (640, 640, 768, 896), 'NOTICE': (0, 768, 384, 1024)}
ROWS = [-1.6, 0.0, 1.6]                        # 觀眾席的三排（x；排和排之間 1.6 m：0.4 m 導航格上留得出一條走道）
COLS = [-1.2, -0.6, 0.0, 0.6, 1.2, 1.8]        # 每排六張（z）；門那一側（−z）留 1.5 m 的走道
DX = -0.15                                     # 門（−z 那一面）：博雅 2F 的 203 門在 x −12.2～−11.0，房間 −16.9～−6.0 的中間偏西 0.15 m
SZ = 0.3                                       # 舞台的中線（z）＝觀眾席的中線


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """白板（手寫的演出名稱、小塗鴉）、畫架上的板子、門口的小海報、時鐘、簽到表、公告"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(9)
    x0, y0, x1, y1 = REG['BOARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 248, 248))
    d.text((x0 + 60, y0 + 40), '即興劇社', font=F(70), fill=(30, 60, 150)); d.text((x0 + 60, y0 + 140), '期末小演出', font=F(90), fill=(30, 60, 150))
    d.text((x0 + 620, y0 + 60), '今晚的規則：', font=F(40), fill=(180, 40, 40))
    for k, t in enumerate(['1. 觀眾給一個詞', '2. 不能說「不」', '3. 演到有人笑為止']): d.text((x0 + 640, y0 + 120 + k * 56), t, font=F(36), fill=(40, 40, 40))
    for k in range(5):   # 幾顆星星、箭頭的塗鴉
        cx, cy = x0 + 80 + k * 110, y0 + 300; d.polygon([(cx, cy - 18), (cx + 6, cy - 5), (cx + 20, cy - 5), (cx + 9, cy + 4), (cx + 13, cy + 18), (cx, cy + 9), (cx - 13, cy + 18), (cx - 9, cy + 4), (cx - 20, cy - 5), (cx - 6, cy - 5)], outline=(220, 140, 30), width=4)
    x0, y0, x1, y1 = REG['EASEL']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 246, 232)); ctext(d, (x0 + x1) / 2, y0 + 60, '給我', F(80), (40, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 170, '一個詞', F(80), (40, 40, 40))
    d.line([(x0 + 80, y0 + 300), (x1 - 80, y0 + 300)], fill=(200, 60, 50), width=8)
    x0, y0, x1, y1 = REG['SIGN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(40, 40, 52)); ctext(d, (x0 + x1) / 2, y0 + 40, '演出中', F(64), (250, 220, 120)); ctext(d, (x0 + x1) / 2, y0 + 140, '請輕聲進場', F(40), (230, 230, 230))
    x0, y0, x1, y1 = REG['POSTER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 214, 92)); ctext(d, (x0 + x1) / 2, y0 + 30, '即興劇社', F(40), (40, 30, 20)); ctext(d, (x0 + x1) / 2, y0 + 90, '期末', F(56), (40, 30, 20)); ctext(d, (x0 + x1) / 2, y0 + 160, '小演出', F(56), (40, 30, 20))
    ctext(d, (x0 + x1) / 2, y0 + 260, '週三 19:00', F(32), (40, 30, 20)); ctext(d, (x0 + x1) / 2, y0 + 310, '博雅 203', F(32), (40, 30, 20))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 110
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 20) * math.sin(a), cy - (r - 20) * math.cos(a)), (cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 50 * math.sin(3.7), cy - 50 * math.cos(3.7))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 80 * math.sin(0.5), cy - 80 * math.cos(0.5))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['SIGNUP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 10, '簽到', F(26), (40, 40, 40))
    for k in range(8): yy = y0 + 50 + k * 24; d.line([(x0 + 8, yy), (x1 - 8, yy)], fill=(170, 170, 170), width=2)
    for k in range(5): d.line([(x0 + 14, y0 + 44 + k * 24), (x0 + 14 + rr.randint(30, 90), y0 + 42 + k * 24)], fill=(40, 50, 120), width=3)
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); d.rectangle([x0, y0, x1 - 1, y0 + 50], fill=(70, 80, 90))
    ctext(d, (x0 + x1) / 2, y0 + 8, '討論室使用須知', F(30), (255, 255, 255))
    for k, t in enumerate(['借用請到系辦登記', '桌椅用完請歸位', '離開時關燈、關冷氣']): d.text((x0 + 20, y0 + 74 + k * 44), '・' + t, font=F(24), fill=(50, 50, 46))
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '博雅 203', 'sub': '討論室（即興劇社借用）'}; self.S = dict(trim='#5a4a3e', wainH=0.9)
        self.W, self.D = 10.8, 6.4; self.X0, self.X1, self.Z0, self.Z1 = -5.4, 5.4, -3.2, 3.2
        self.rng = random.Random(203); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_floor', 'laminate_floor_02', tile=1.4, target='#d2bc9a', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.45),   # 淺色木地板
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#ecebe6', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.flat(SID + '_wain', '#c3bba9', rough=0.6),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=1.1, target='#c4a27a', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'ceil': L.pbr(SID + '_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.55),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.tube = Mesh(SID + '_tubes', M['tube'])
        self.prt = Mesh(SID + '_prints', M['print']); self.lamp = Mesh(SID + '_lamps', L.flat('GLOW_' + SID + '_lamp', '#fff8ea', rough=0.3, emit=B.srgb('#fff2d2')))
        self.WG = {k: {} for k in 'NWES'}


def fold_chair(c, x, z, yaw, col='#4a5a6a'):
    """摺疊椅：灰藍色塑膠椅面、椅背，黑色鐵管腳（X 形）；(x, z) 是坐的位置，面向 yaw"""
    T = rot(x, z, yaw)
    rbox(c.vc, T, -0.21, 0.21, 0.44, 0.47, -0.2, 0.2, col, r=0.015)
    rbox(c.vc, T, -0.2, 0.2, 0.66, 0.88, -0.23, -0.21, col, r=0.012)
    for lx in (-0.19, 0.19):
        a, b = T(lx, -0.22), T(lx, 0.18); ccyl(c.vm, (a[0], 0.0, a[1]), (b[0], 0.45, b[1]), 0.011, '#2b2b2b', seg=6)
        a, b = T(lx, 0.18), T(lx, -0.22); ccyl(c.vm, (a[0], 0.0, a[1]), (b[0], 0.88, b[1]), 0.011, '#2b2b2b', seg=6)


def wood_chair(c, x, z, yaw):
    T = rot(x, z, yaw)
    rbox(c.wood, T, -0.21, 0.21, 0.43, 0.47, -0.2, 0.2, None, r=0.01)
    rbox(c.wood, T, -0.2, 0.2, 0.6, 0.9, -0.22, -0.19, None, r=0.01)
    for lx in (-0.18, 0.18):
        for lz in (-0.17, 0.17): rbox(c.wood, T, lx - 0.02, lx + 0.02, 0.0, 0.43, lz - 0.02, lz + 0.02, None)
        rbox(c.wood, T, lx - 0.02, lx + 0.02, 0.47, 0.6, -0.21, -0.19, None)


def tripod_lamp(c, x, z, aim):
    """三腳架夾燈：三支腳、一根桿子、U 形支架夾著燈罩（黑色圓錐，後面窄前面寬）對著舞台；前緣一圈黑框，裡面是暖白的燈面（從側面、後面看不到）。
    第一版燈罩短、燈面是米色圓盤，從觀眾席看像一顆蛋（10-24 遊戲內截圖）"""
    for k in range(3):
        a = k * 2 * PI / 3; ccyl(c.vm, (x + 0.3 * math.cos(a), 0.0, z + 0.3 * math.sin(a)), (x, 1.15, z), 0.012, '#2b2b2b', seg=5)
    ccyl(c.vm, (x, 1.15, z), (x, 1.9, z), 0.015, '#2b2b2b', seg=6)
    dx, dz = aim[0] - x, aim[1] - z; n = math.hypot(dx, dz); ux, uz = dx / n, dz / n; px, pz = -uz, ux
    for s_ in (-1, 1):                                                                                        # U 形支架
        ccyl(c.vm, (x, 1.9, z), (x + px * 0.14 * s_, 1.9, z + pz * 0.14 * s_), 0.01, '#2b2b2b', seg=5)
        ccyl(c.vm, (x + px * 0.14 * s_, 1.9, z + pz * 0.14 * s_), (x + px * 0.14 * s_, 2.02, z + pz * 0.14 * s_), 0.01, '#2b2b2b', seg=5)
    a, b = (x - ux * 0.12, 2.05, z - uz * 0.12), (x + ux * 0.16, 2.0, z + uz * 0.16)
    ccyl(c.vc, a, b, 0.055, '#1c1c1e', seg=14, r2=0.12)                                                       # 燈罩
    ccyl(c.vc, (b[0] - ux * 0.005, b[1], b[2] - uz * 0.005), (b[0] + ux * 0.025, b[1] - 0.004, b[2] + uz * 0.025), 0.128, '#2a2a2c', seg=14, caps=False)   # 前緣的框
    c.lamp.cyl((b[0] - ux * 0.01, b[1], b[2] - uz * 0.01), (b[0] + ux * 0.004, b[1] - 0.001, b[2] + uz * 0.004), 0.112, seg=14)   # 燈面


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    wh = 0.9
    WX = [-3.2, 0.0, 3.2]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x；窗朝南，窗景借 boya_2f_south；演出是晚上，窗簾拉下一半')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], wh, H))
    wn.quad(QS(X0, X1, 0.0, wh)); tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z1 - 0.015, Z1, '#7a756a')
    for wx in WX:
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, wh, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
        fr.cbox(a + 0.05, b - 0.05, wy1 - 0.75, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#5a6070')                                   # 深色窗簾拉下一半（晚上的演出）
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊那一側）：門（x −0.15）、門上的「演出中」牌子、門邊的小海報、使用須知、時鐘
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood']); pn = c.wg('N', 'print', M['print'])
    dx, dw = DX, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#7a756a')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0, Z0 + 0.04, r=0.004, seg=1)
    uvquad(pn, [(dx - 0.25, 1.55, Z0 + 0.045), (dx + 0.25, 1.55, Z0 + 0.045), (dx + 0.25, 1.88, Z0 + 0.045), (dx - 0.25, 1.88, Z0 + 0.045)], uv('SIGN'))   # 門的裡面一面也貼著「演出中」
    uvquad(pn, [(0.7, 1.2, Z0 + 0.015), (1.3, 1.2, Z0 + 0.015), (1.3, 2.08, Z0 + 0.015), (0.7, 2.08, Z0 + 0.015)], uv('POSTER'))
    uvquad(pn, [(-2.4, 1.25, Z0 + 0.015), (-1.6, 1.25, Z0 + 0.015), (-1.6, 1.85, Z0 + 0.015), (-2.4, 1.85, Z0 + 0.015)], uv('NOTICE'))
    uvquad(pn, [(2.6, 2.45, Z0 + 0.016), (3.1, 2.45, Z0 + 0.016), (3.1, 2.95, Z0 + 0.016), (2.6, 2.95, Z0 + 0.016)], uv('CLOCK'))
    # 教室後面的小桌：簽到表、一袋零食、筆
    tx, tz = 2.9, Z0 + 0.45
    c.wood.rbox(tx - 0.45, tx + 0.45, 0.72, 0.75, tz - 0.25, tz + 0.25, r=0.01, seg=1)
    for xx in (tx - 0.41, tx + 0.41):
        for zz in (tz - 0.21, tz + 0.21): c.vm.cbox(xx - 0.012, xx + 0.012, 0.0, 0.72, zz - 0.012, zz + 0.012, '#5a5f63')
    uvquad(c.prt, [(tx - 0.3, 0.752, tz + 0.1), (tx - 0.06, 0.752, tz + 0.1), (tx - 0.06, 0.752, tz - 0.2), (tx - 0.3, 0.752, tz - 0.2)], uv('SIGNUP'))
    rbox(c.vc, rot(tx + 0.22, tz, 0.3), -0.12, 0.12, 0.75, 0.93, -0.07, 0.07, '#e8a030', r=0.03)                              # 一袋零食
    c.block(tx - 0.48, tx + 0.48, Z0, tz + 0.28, 'signup_table')
    # 西牆（舞台那一面）：白板
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); bd = c.wg('W', 'board', M['print'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    tr.cbox(X0, X0 + 0.03, 0.95, 2.3, SZ - 2.4, SZ + 2.4, '#b9bec2')
    uvquad(bd, [(X0 + 0.035, 1.0, SZ + 2.35), (X0 + 0.035, 1.0, SZ - 2.35), (X0 + 0.035, 2.25, SZ - 2.35), (X0 + 0.035, 2.25, SZ + 2.35)], uv('BOARD'))
    tr.cbox(X0, X0 + 0.09, 0.93, 0.96, SZ - 2.3, SZ + 2.3, '#9aa0a4')
    # 東牆：推到牆邊的桌子（椅子倒放在桌上）、冷氣
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#7a756a')
    for k, tz0 in enumerate((-1.6, -0.3, 1.0)):
        x0_, x1_, z0_, z1_ = X1 - 0.65, X1 - 0.05, tz0, tz0 + 1.2
        c.wood.rbox(x0_, x1_, 0.72, 0.75, z0_, z1_, r=0.01, seg=1)
        for xx in (x0_ + 0.04, x1_ - 0.04):
            for zz in (z0_ + 0.04, z1_ - 0.04): c.vm.cbox(xx - 0.013, xx + 0.013, 0.0, 0.72, zz - 0.013, zz + 0.013, '#5a5f63')
        for j, zz in enumerate((z0_ + 0.3, z0_ + 0.9)):   # 倒放的椅子
            T = rot((x0_ + x1_) / 2, zz, PI / 2 if j else -PI / 2)
            rbox(c.vc, T, -0.2, 0.2, 0.75, 0.78, -0.19, 0.19, '#4a5a6a', r=0.01)
            for lx in (-0.17, 0.17):
                for lz in (-0.16, 0.16): (px, pz) = T(lx, lz); ccyl(c.vm, (px, 0.78, pz), (px, 1.2, pz), 0.011, '#2b2b2b', seg=5)
    c.block(X1 - 0.68, X1, -1.65, 2.25, 'pushed_tables')
    K.ac_unit(c, X1, 2.6, 0.3, '-x', w=0.9, fade=True)
    # 舞台：地上的膠帶、兩張木椅＋小桌、帽子、畫架
    sx0, sx1, sz0, sz1 = -5.0, -2.8, SZ - 2.0, SZ + 2.0
    for (a, b, cc, dd) in ((sx0, sx1, sz0 - 0.025, sz0 + 0.025), (sx0, sx1, sz1 - 0.025, sz1 + 0.025), (sx1 - 0.025, sx1 + 0.025, sz0, sz1), (sx0 - 0.025, sx0 + 0.025, sz0, sz1)):
        c.vc.cbox(a, b, 0.0, 0.002, cc, dd, '#f2f0e8')
    wood_chair(c, -4.2, SZ - 0.75, PI / 2); wood_chair(c, -4.2, SZ + 0.75, PI / 2)
    c.wood.rbox(-4.55, -4.05, 0.6, 0.63, SZ - 0.25, SZ + 0.25, r=0.01, seg=1)
    for xx in (-4.52, -4.08):
        for zz in (SZ - 0.22, SZ + 0.22): c.vm.cbox(xx - 0.012, xx + 0.012, 0.0, 0.6, zz - 0.012, zz + 0.012, '#2b2b2b')
    clathe(c.vc, [(0.0, 0.0), (0.16, 0.0), (0.16, 0.01), (0.09, 0.02), (0.09, 0.12), (0.0, 0.13)], -4.22, 0.47, SZ + 0.75, '#2a2a30', seg=16)   # 帽子（放在椅子上）
    clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.036, 0.11), (0.0, 0.11)], -4.35, 0.63, SZ - 0.1, '#cfe2ea', seg=10)                             # 一瓶水
    # 畫架（板子朝觀眾）
    ex, ez = -3.3, SZ - 1.55
    for (ax, az) in ((-0.2, -0.12), (0.2, -0.12), (0.0, 0.22)): ccyl(c.vc, (ex + az, 0.0, ez + ax), (ex, 1.55, ez), 0.015, '#8a6a4a', seg=5)
    c.vc.cbox(ex - 0.04, ex - 0.02, 0.85, 1.45, ez - 0.32, ez + 0.32, '#f4f0e4')
    uvquad(c.prt, [(ex - 0.016, 0.88, ez + 0.29), (ex - 0.016, 0.88, ez - 0.29), (ex - 0.016, 1.42, ez - 0.29), (ex - 0.016, 1.42, ez + 0.29)], uv('EASEL'))   # 面向 +x（觀眾）：左下角在 +z（第一版左右反了，字是鏡像）
    c.block(ex - 0.3, ex + 0.25, ez - 0.35, ez + 0.35, 'easel')
    c.block(-4.7, -3.95, SZ - 1.05, SZ + 1.05, 'stage_props')
    tripod_lamp(c, -2.5, -2.6, (-4.0, SZ)); tripod_lamp(c, -2.5, 2.55, (-4.0, SZ))
    c.block(-2.85, -2.15, -2.95, -2.25, 'lamp_s'); c.block(-2.85, -2.15, 2.2, 2.9, 'lamp_n')
    # 觀眾席：三排 × 六張摺疊椅（門那一側是走道）
    for ri, x in enumerate(ROWS):
        for z in COLS:
            fold_chair(c, x, z, -PI / 2, col=rr.choice(('#4a5a6a', '#4a5a6a', '#5a6a5a')))
            c.seat(x, z, -PI / 2, (x - 0.5, z), 'sit', ap=(x + 0.8, z), label='坐下（看演出）'); c.seats[-1]['uses'] = ['看演出']
        c.block(x - 0.25, x + 0.25, COLS[0] - 0.25, COLS[-1] + 0.25, 'row%d' % ri)
    # 燈（舞台那一半暗一點：只開觀眾席的兩排）
    for x in (0.0, 3.0):
        for z in (-1.5, 1.5):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    for z in (-1.5, 1.5): c.vc.cbox(-4.0 - 0.62, -4.0 + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#e4e4e0')                       # 舞台上面那兩盞關著
    spots = {'tang': dict(x=-3.5, z=SZ, yaw=round(PI / 2, 4), act='stand', note='唐睿（舞台中間、道具前面，面向觀眾）'),
             'member': [dict(x=-3.4, z=SZ + 1.6, yaw=round(PI / 2 + 0.5, 4), act='stand', note='即興劇社的社員（舞台邊）'),
                        dict(x=3.45, z=round(tz + 0.65, 3), yaw=round(-PI / 2, 4), act='stand', note='簽到桌旁的社員（看著舞台）')],
             'pinyu': dict(x=ROWS[0], z=0.0, yaw=round(-PI / 2, 4), act='sit', note='品妤（第一排正中間，沒有表情）'),
             'me': dict(x=ROWS[0], z=0.6, yaw=round(-PI / 2, 4), act='sit', note='玩家（第一排，品妤旁邊）'),
             'zhe': dict(x=ROWS[0], z=1.2, yaw=round(-PI / 2, 4), act='sit', note='阿哲（被玩家拉來的）'),
             'audience': [dict(x=x, z=z, yaw=round(-PI / 2, 4), act='sit') for x in ROWS for z in COLS
                          if (x, z) not in ((ROWS[0], 0.0), (ROWS[0], 0.6), (ROWS[0], 1.2), (ROWS[0], 1.8), (ROWS[1], -0.6), (ROWS[2], -1.2), (ROWS[2], 1.8))]}
    c.look('board', round(X0 + 0.65, 3), round(SZ - 1.7, 3), 0.9, '白板', '', dev='「即興劇社　期末小演出」「今晚的規則」；遊戲裡顯示的字等 AA 寫')
    c.look('easel', -2.9, round(SZ - 1.2, 3), 0.7, '「給我一個詞」', '', dev='畫架上的板子；遊戲裡顯示的字等 AA 寫')
    c.look('signup', 2.5, round(tz + 0.65, 3), 0.7, '簽到表', '', dev='教室後面小桌上的簽到表、一袋零食；遊戲裡顯示的字等 AA 寫')
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面的中間；從博雅教學館 2F 的 203 門（teach3d.js 關著的房間，lv 1）進來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.25, 3), yaw=round(-PI / 2, 4), note='進門、面向舞台（−x）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.4, 3), r=0.6, label='離開 203', to='boya', spawn_note='回到博雅教學館 2F、203 的門前面（back_spawn）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'door'), merge=key not in ('print', 'board'))
    for m in (c.vc, c.vm, c.tube, c.lamp): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.prt.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='博思 203（即興劇社的小演出）', type='討論室', src='AA_399 第 10 節（企劃線 5d09bb725）；SK07（events.js ev_sk07_improv）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.4, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='boya_2f_south',
               counter=None, clerk=None, teacherSpot=spots['tang'], order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               open=dict(days=['2026-05-27'], dayHours=[18.5, 21.5], daysOnly=True, note='AA_399 第 10 節：只有 SK07 那一晚開（2026-05-27 18:30～21:30）。其他時間門照舊（boya_layout.js 203「之後開放」）'),
               back_spawn=dict(x=-11.6, z=1.5, lv=1, yaw=round(PI, 4), note='博雅教學館 2F、203 門前面的走廊（teach3d.js 關著的房間的互動點）'),
               host_door=dict(zone='boya', id='203', lv=1, label='進入 博思 203', note='teach3d.js 的關著的房間 203：那一晚多一個「進入 博雅 203」，原本的「之後開放」那天藏起來'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('BOYA_203', 'OK' if not p else p)
