"""宿舍 1F 洗衣間（AA_399 第 11 節，企劃線 5d09bb725；LAWWW-B 10-24 任務 #82 第五間的一半，另一半是 205）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/dorm_laundry.glb＋dorm_laundry.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/dorm_laundry.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 開（全天）。加一個「洗衣服」（40 分；LAWWW-B）。不加數值，只是生活。
  - 阿凱大一週日 21～22 在這裡，接他的 App 訊息（y1fill_events.js）。第一次遇到：「這台烘衣機要投兩次。第一次是騙你的。」
從宿舍 1F 走廊的「洗衣間」門（dorm_layout.js doors 的 laundry，x −11.0、走廊南側，lv 0）進來。
區域自己的座標：x −2.6…2.6、z −2.2…2.2；門在 −z 那一面（走廊那一側）的中間；+z 那一面高處一排霧面窗。
房間（門牌上寫的：投幣式洗衣機、烘衣機各四台）：
  - 東牆（+x）：四台直立式投幣洗衣機（上掀蓋、後面一片操作面板、投幣盒）。
  - 西牆（−x）：烘衣機兩兩疊成兩組（前開圓門）、兌幣機、洗衣精販賣機。第三台烘衣機上一張黃色便條「要投兩次」（阿凱那句的伏筆，AA 不要的話拿掉）。
  - 中間：摺衣服的長桌、幾個洗衣籃；後面（+z）窗下一張長椅（坐著等）；東北角曬衣架、失物招領的籃子。
  - 門那一面：使用須知、時鐘、垃圾桶、洗手台。
  - 地板淺灰的止滑磁磚，牆的下半段白色磁磚。
內容虛構（沒有真實品牌、價錢；機器上只有「洗衣」「烘衣」和號碼）。做法同萬才館研討室 B、系辦、考場、博雅 203（lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.0; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'dorm_laundry'
REG = {'NOTICE': (0, 0, 384, 512), 'LOST': (384, 0, 640, 256), 'CLOCK': (640, 0, 896, 256), 'WASH': (384, 256, 1024, 384), 'DRY': (384, 384, 1024, 512),
       'CHANGE': (0, 512, 256, 768), 'SOAP': (256, 512, 512, 768), 'STICKY': (512, 512, 640, 640), 'PLATE': (640, 512, 1024, 640)}
WZ = [-1.35, -0.7, -0.05, 0.6]            # 洗衣機的中心（z），東牆
DZ = [-0.7, 0.05]                         # 烘衣機兩組（z），西牆，一組上下兩台


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def uvsub(key, i, n):
    u0, v0, u1, v1 = uv(key); w = (u1 - u0) / n; return (u0 + i * w, v0, u0 + (i + 1) * w, v1)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """使用須知、失物招領、時鐘、洗衣機／烘衣機的號碼貼紙（各四格）、兌幣機、洗衣精販賣機的面板、便條、門牌"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(52, 96, 140))
    ctext(d, (x0 + x1) / 2, y0 + 12, '洗衣間使用須知', F(36), (255, 255, 255))
    for k, t in enumerate(['衣物洗好請盡快取走', '烘衣前請先清濾網', '請勿洗鞋子、寵物用品', '機器故障請告訴舍監', '晚上十二點以後', '請小聲']):
        d.text((x0 + 26, y0 + 92 + k * 62), ('・' if k != 5 else '　') + t, font=F(28), fill=(40, 40, 40))
    x0, y0, x1, y1 = REG['LOST']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 238, 190)); ctext(d, (x0 + x1) / 2, y0 + 70, '失物招領', F(48), (120, 60, 30)); ctext(d, (x0 + x1) / 2, y0 + 150, '襪子一隻也算', F(24), (120, 80, 50))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 110
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 20) * math.sin(a), cy - (r - 20) * math.cos(a)), (cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 50 * math.sin(5.6), cy - 50 * math.cos(5.6))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 80 * math.sin(2.0), cy - 80 * math.cos(2.0))], fill=(30, 30, 30), width=6)
    for key, word, col in (('WASH', '洗衣', (40, 110, 170)), ('DRY', '烘衣', (200, 110, 40))):
        x0, y0, x1, y1 = REG[key]; w = (x1 - x0) / 4
        for k in range(4):
            a = x0 + k * w; d.rectangle([a, y0, a + w - 1, y1 - 1], fill=(248, 248, 246)); d.rectangle([a, y0, a + 44, y1 - 1], fill=col)
            ctext(d, a + 22, y0 + 38, str(k + 1), F(44), (255, 255, 255)); d.text((a + 58, y0 + 34), word + ' %d' % (k + 1), font=F(40), fill=(40, 40, 40))
    x0, y0, x1, y1 = REG['CHANGE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(200, 205, 210)); d.rectangle([x0, y0, x1 - 1, y0 + 56], fill=(60, 70, 80))
    ctext(d, (x0 + x1) / 2, y0 + 10, '兌幣機', F(34), (255, 255, 255)); d.rectangle([x0 + 60, y0 + 100, x1 - 60, y0 + 120], fill=(30, 30, 30)); ctext(d, (x0 + x1) / 2, y0 + 128, '紙鈔', F(22), (40, 40, 40))
    d.rectangle([x0 + 90, y0 + 180, x1 - 90, y0 + 230], fill=(50, 50, 55)); ctext(d, (x0 + x1) / 2, y0 + 236, '硬幣', F(20), (40, 40, 40))
    x0, y0, x1, y1 = REG['SOAP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(230, 240, 248)); d.rectangle([x0, y0, x1 - 1, y0 + 50], fill=(70, 140, 190))
    ctext(d, (x0 + x1) / 2, y0 + 8, '洗衣精・柔軟精', F(28), (255, 255, 255))
    for r_ in range(2):
        for c_ in range(3):
            bx, by = x0 + 22 + c_ * 76, y0 + 70 + r_ * 92; d.rectangle([bx, by, bx + 60, by + 74], fill=[(110, 170, 220), (240, 160, 190), (150, 200, 140)][c_]); d.rectangle([bx + 8, by + 22, bx + 52, by + 44], fill=(250, 250, 250))
    d.rectangle([x0 + 22, y1 - 22, x1 - 22, y1 - 8], fill=(30, 34, 40))
    x0, y0, x1, y1 = REG['STICKY']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 230, 110)); d.text((x0 + 14, y0 + 30), '要投', font=F(40), fill=(40, 40, 120)); d.text((x0 + 14, y0 + 76), '兩次', font=F(40), fill=(40, 40, 120))
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 242, 236)); ctext(d, (x0 + x1) / 2, y0 + 26, '洗衣間', F(64), (40, 40, 40))
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '洗衣間', 'sub': '宿舍 1F'}; self.S = dict(trim='#9aa0a4', wainH=1.2)
        self.W, self.D = 5.2, 4.4; self.X0, self.X1, self.Z0, self.Z1 = -2.6, 2.6, -2.2, 2.2
        self.rng = random.Random(77); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_floor', 'large_floor_tiles_02', tile=1.2, target='#c9c9c4', contrast=0.6, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.5),   # 止滑磁磚，淺灰
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#eeede8', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(SID + '_wain', 'large_floor_tiles_02', tile=0.6, target='#ecebe6', contrast=0.5, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.3),   # 牆的下半段：白色磁磚
            'vc': L.vc_material(SID + '_vc', rough=0.45), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.3, metal=0.45),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'frost': L.flat(SID + '_frost', '#eef2f2', rough=0.6, alpha=0.82),                              # 霧面玻璃
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'disp': L.flat('GLOW_' + SID + '_display', '#ffffff', rough=0.3, emit=B.srgb('#7fe0a0')),         # 洗衣機面板上的小螢幕
            'ceil': L.flat(SID + '_ceiling', '#efefea', rough=0.9, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.5),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.tube = Mesh(SID + '_tubes', M['tube']); self.disp = Mesh(SID + '_display', M['disp']); self.glass = Mesh(SID + '_glassparts', M['glass'])
        self.prt = Mesh(SID + '_prints', M['print'])
        self.WG = {k: {} for k in 'NWES'}


def washer(c, z, k):
    """直立式投幣洗衣機（靠東牆、面向 −x）：白色機身、上掀蓋、後面一片操作面板（小螢幕、投幣盒），正面號碼貼紙"""
    X1 = c.X1; x1 = X1 - 0.04; x0 = x1 - 0.66; w = 0.31
    c.vc.crbox(x0, x1, 0.0, 0.9, z - w, z + w, '#f3f3ef', r=0.03, seg=2)
    c.vc.cbox(x0 + 0.02, x1 - 0.02, 0.0, 0.06, z - w + 0.02, z + w - 0.02, '#c9cac6')                                   # 底座
    c.vc.crbox(x0 + 0.04, x1 - 0.18, 0.9, 0.93, z - w + 0.03, z + w - 0.03, '#dfe1e0', r=0.02, seg=1)                   # 上蓋
    c.vc.cbox(x0 + 0.04, x0 + 0.1, 0.928, 0.94, z - 0.12, z + 0.12, '#b9bcbd')                                          # 蓋子的把手
    c.vc.crbox(x1 - 0.18, x1, 0.9, 1.14, z - w, z + w, '#f3f3ef', r=0.02, seg=1)                                       # 後面的操作面板
    c.disp.box(x1 - 0.185, x1 - 0.18, 1.0, 1.06, z - 0.08, z + 0.08)
    c.vm.cbox(x1 - 0.2, x1 - 0.17, 0.95, 1.11, z + 0.13, z + 0.26, '#9aa0a4')                                           # 投幣盒
    c.vc.cbox(x1 - 0.205, x1 - 0.2, 1.06, 1.065, z + 0.17, z + 0.22, '#1a1a1a')                                          # 投幣孔
    for j in range(3): c.vc.cbox(x1 - 0.185, x1 - 0.18, 0.94, 0.97, z - 0.2 + j * 0.06, z - 0.16 + j * 0.06, '#6a7a8a')   # 按鈕
    uvquad(c.prt, [(x0 - 0.002, 0.7, z - 0.18), (x0 - 0.002, 0.7, z + 0.18), (x0 - 0.002, 0.8, z + 0.18), (x0 - 0.002, 0.8, z - 0.18)], uvsub('WASH', k, 4))   # 面向 −x：左下角在 −z


def dryer(c, z, y0, k):
    """前開式烘衣機（靠西牆、面向 +x）：白色機身、圓門（黑色玻璃）、上方投幣盒、號碼"""
    X0 = c.X0; x0 = X0 + 0.04; x1 = x0 + 0.7; w = 0.34; h = 0.84; yc = y0 + 0.42
    c.vc.crbox(x0, x1, y0, y0 + h, z - w, z + w, '#f1f1ed', r=0.02, seg=1)
    ring = [(0.0, 0.0), (0.24, 0.0), (0.245, 0.03), (0.2, 0.035), (0.0, 0.035)]
    f0 = set(c.vc.bm.faces); bm = L.lathe(ring, seg=24)
    from mathutils import Matrix as _M   # 圓門：車床做的圓盤轉 90°（朝 +x）
    c.vc.add_bm(bm, _M.Translation(K.g2b(x1, yc, z)) @ _M.Rotation(PI / 2, 4, 'Y')); bm.free()
    c.vc.paint([q for q in c.vc.bm.faces if q not in f0], '#cfd3d4')
    f0 = set(c.vc.bm.faces); bm = L.lathe([(0.0, 0.0), (0.18, 0.0), (0.18, 0.04), (0.0, 0.045)], seg=24)
    c.vc.add_bm(bm, _M.Translation(K.g2b(x1 + 0.005, yc, z)) @ _M.Rotation(PI / 2, 4, 'Y')); bm.free()
    c.vc.paint([q for q in c.vc.bm.faces if q not in f0], '#2a2f35')
    c.vm.cbox(x1, x1 + 0.03, y0 + h - 0.16, y0 + h - 0.05, z + 0.12, z + 0.28, '#9aa0a4')                                # 投幣盒
    c.vc.cbox(x1 + 0.03, x1 + 0.035, y0 + h - 0.12, y0 + h - 0.115, z + 0.16, z + 0.24, '#1a1a1a')
    uvquad(c.prt, [(x1 + 0.003, y0 + h - 0.16, z + 0.06), (x1 + 0.003, y0 + h - 0.16, z - 0.3), (x1 + 0.003, y0 + h - 0.06, z - 0.3), (x1 + 0.003, y0 + h - 0.06, z + 0.06)], uvsub('DRY', k, 4))   # 面向 +x：左下角在 +z


def basket(c, x, y, z, col, yaw=0.0):
    """塑膠洗衣籃（裡面有衣服）"""
    T = rot(x, z, yaw)
    rbox(c.vc, T, -0.24, 0.24, y, y + 0.26, -0.17, 0.17, col, r=0.03)
    for (a, b, cc) in ((-0.2, 0.2, '#dfe3e8'), (-0.12, 0.18, '#7d8fb0'), (-0.2, 0.05, '#e8d9c4')):
        rbox(c.vc, T, a, b, y + 0.2, y + 0.29, -0.13, 0.13, cc, r=0.05)


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    wh = 1.2
    # +z（S）：高處一排霧面窗
    c.wins = dict(side='S', wall='front', z=Z1, xs=[0.0], y=2.25, w=3.6, h=0.7, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x；霧面玻璃，窗景看不清楚（借 dorm_room）')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['frost'])
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    wy0, wy1 = 1.9, 2.6
    wl.quad(QS(X0, X1, wh, wy0)); wl.quad(QS(X0, X1, wy1, H)); wl.quad(QS(X0, -1.8, wy0, wy1)); wl.quad(QS(1.8, X1, wy0, wy1)); wn.quad(QS(X0, X1, 0.0, wh))
    for xa, xb in ((-1.8, -1.75), (1.75, 1.8), (-0.025, 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.07, Z1 - 0.02, '#b9bec2')
    for ya, yb in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(-1.8, 1.8, ya, yb, Z1 - 0.075, Z1 - 0.025, '#b9bec2')
    fr.cbox(-1.8, 1.8, wy0 - 0.03, wy0, Z1 - 0.16, Z1, '#d9d6cf')
    gl.quad([(1.8, wy0, Z1 - 0.045), (-1.8, wy0, Z1 - 0.045), (-1.8, wy1, Z1 - 0.045), (1.8, wy1, Z1 - 0.045)])
    # −z（N，走廊那一側）：門、使用須知、時鐘、洗手台、垃圾桶
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); pn = c.wg('N', 'print', M['print'])
    dx, dw = 0.0, 0.95; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.15, H))
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.15, Z0, Z0 + 0.06, '#8a9095')
    tr.cbox(d0, d1, 2.07, 2.15, Z0, Z0 + 0.06, '#8a9095')
    tr.cbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.06, Z0, Z0 + 0.04, '#c9ccc8')                                         # 門板（關著；淺灰鐵門）
    tr.cbox(dx + 0.28, dx + 0.4, 1.0, 1.03, Z0 + 0.04, Z0 + 0.09, '#9aa0a4')
    uvquad(pn, [(-1.75, 1.3, Z0 + 0.015), (-1.05, 1.3, Z0 + 0.015), (-1.05, 2.23, Z0 + 0.015), (-1.75, 2.23, Z0 + 0.015)], uv('NOTICE'))
    uvquad(pn, [(dx - 0.18, 2.35, Z0 + 0.016), (dx + 0.18, 2.35, Z0 + 0.016), (dx + 0.18, 2.71, Z0 + 0.016), (dx - 0.18, 2.71, Z0 + 0.016)], uv('CLOCK'))
    sx, sz = 1.35, Z0 + 0.3                                                                                                      # 洗手台（白色、單槽）
    c.vc.crbox(sx - 0.3, sx + 0.3, 0.78, 0.86, Z0 + 0.02, sz + 0.25, '#f4f4f1', r=0.03, seg=2)
    c.vc.cbox(sx - 0.22, sx + 0.22, 0.8, 0.861, sz - 0.18, sz + 0.18, '#d8dcdc')
    ccyl(c.vm, (sx, 0.0, sz), (sx, 0.78, sz), 0.05, '#c9ccc8', seg=10)
    ccyl(c.vm, (sx, 0.86, Z0 + 0.06), (sx, 1.08, Z0 + 0.06), 0.015, '#c9ccc8', seg=8); ccyl(c.vm, (sx, 1.08, Z0 + 0.06), (sx, 1.08, Z0 + 0.22), 0.013, '#c9ccc8', seg=8)
    c.vc.cbox(sx - 0.25, sx + 0.25, 1.15, 1.6, Z0 + 0.005, Z0 + 0.012, '#d9e4e8')                                                 # 鏡子
    clathe(c.vc, [(0.0, 0.0), (0.16, 0.0), (0.18, 0.5), (0.0, 0.5)], 2.15, 0.0, Z0 + 0.3, '#5a7a9a', seg=14)                    # 垃圾桶
    c.vc.cbox(1.97, 2.33, 0.5, 0.52, Z0 + 0.12, Z0 + 0.48, '#4a6a8a')
    c.block(sx - 0.32, 2.35, Z0, sz + 0.28, 'sink_bin')
    # 東牆：四台洗衣機
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain'])
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    for k, z in enumerate(WZ): washer(c, z, k)
    for zz in (WZ[0] - 0.4, WZ[-1] + 0.4): ccyl(c.vm, (X1 - 0.05, 0.0, zz), (X1 - 0.05, 1.3, zz), 0.012, '#b9bec2', seg=6)       # 給水管
    basket(c, X1 - 0.44, 0.93, WZ[3], '#4a8ac0', yaw=PI / 2)                                                                  # 第 4 台的蓋子上一個洗衣籃
    c.block(X1 - 0.72, X1, WZ[0] - 0.33, WZ[-1] + 0.33, 'washers')
    # 東北角：曬衣架（不鏽鋼）、失物招領的籃子
    rx0, rx1, rz0, rz1 = X1 - 0.75, X1 - 0.1, 1.15, 2.05
    for (px, pz) in ((rx0, rz0), (rx1, rz0), (rx0, rz1), (rx1, rz1)): ccyl(c.vm, (px, 0.0, pz), (px, 1.45, pz), 0.012, '#c9ccc8', seg=6)
    for yy in (0.9, 1.45):
        for (a, b) in (((rx0, yy, rz0), (rx1, yy, rz0)), ((rx0, yy, rz1), (rx1, yy, rz1))): ccyl(c.vm, a, b, 0.01, '#c9ccc8', seg=6)
        for k in range(4): zz = rz0 + (k + 0.5) * (rz1 - rz0) / 4; ccyl(c.vm, (rx0, yy, zz), (rx1, yy, zz), 0.008, '#c9ccc8', seg=6)
    for k, col in enumerate(('#f2f2ee', '#8aa0c0', '#d8c8b0')):                                                                 # 掛著的毛巾
        zz = rz0 + 0.2 + k * 0.25; c.vc.cbox(rx0 + 0.05, rx1 - 0.05, 1.05, 1.45, zz - 0.012, zz + 0.012, col)
    c.block(rx0 - 0.05, X1, rz0 - 0.05, Z1, 'rack')
    # 西牆：烘衣機兩組（上下兩台）、兌幣機、洗衣精販賣機
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    for j, z in enumerate(DZ):
        c.vc.cbox(X0 + 0.04, X0 + 0.74, 0.0, 0.1, z - 0.33, z + 0.33, '#9aa0a4')                                                  # 底座
        dryer(c, z, 0.1, j * 2); dryer(c, z, 0.95, j * 2 + 1)
    zs = DZ[1]; uvquad(c.prt, [(X0 + 0.746, 1.55, zs - 0.06), (X0 + 0.746, 1.55, zs - 0.2), (X0 + 0.746, 1.69, zs - 0.2), (X0 + 0.746, 1.69, zs - 0.06)], uv('STICKY'))   # 第 4 台（上面那台）的便條
    cz = 0.75; c.vm.cbox(X0 + 0.04, X0 + 0.5, 0.0, 1.55, cz - 0.24, cz + 0.24, '#aab0b4')                                            # 兌幣機
    uvquad(c.prt, [(X0 + 0.502, 0.6, cz + 0.21), (X0 + 0.502, 0.6, cz - 0.21), (X0 + 0.502, 1.5, cz - 0.21), (X0 + 0.502, 1.5, cz + 0.21)], uv('CHANGE'))
    vz = 1.45; c.vc.crbox(X0 + 0.04, X0 + 0.7, 0.0, 1.8, vz - 0.36, vz + 0.36, '#f0f2f4', r=0.02, seg=1)                             # 洗衣精販賣機
    uvquad(c.prt, [(X0 + 0.703, 0.75, vz + 0.32), (X0 + 0.703, 0.75, vz - 0.32), (X0 + 0.703, 1.7, vz - 0.32), (X0 + 0.703, 1.7, vz + 0.32)], uv('SOAP'))
    c.glass.box(X0 + 0.705, X0 + 0.71, 1.0, 1.66, vz - 0.3, vz + 0.3)
    c.vc.cbox(X0 + 0.7, X0 + 0.73, 0.2, 0.4, vz - 0.25, vz + 0.25, '#2a2f35')                                                      # 取物口
    c.block(X0, X0 + 0.78, DZ[0] - 0.36, vz + 0.38, 'dryers_machines')
    # 窗下的長椅（坐著等）
    bx0, bx1, bz = -2.2, 0.6, Z1 - 0.28
    c.vc.crbox(bx0, bx1, 0.42, 0.46, bz - 0.2, bz + 0.2, '#d9c7a5', r=0.01, seg=1)
    for xx in (bx0 + 0.1, (bx0 + bx1) / 2, bx1 - 0.1): c.vm.cbox(xx - 0.02, xx + 0.02, 0.0, 0.42, bz - 0.17, bz + 0.17, '#5a5f63')
    c.block(bx0, bx1, bz - 0.22, Z1, 'bench')
    for k, x in enumerate((-1.45, -0.6, 0.25)):   # 最西邊那張離販賣機太近（走近點站不住）：整排往東
        c.seat(x, bz, PI, (x, bz - 0.6), 'sit', ap=(x, bz - 0.75), label='坐下（等衣服）'); c.seats[-1]['uses'] = ['等洗衣']
    basket(c, -1.98, 0.46, bz, '#e0a040')
    clathe(c.vc, [(0.0, 0.0), (0.06, 0.0), (0.065, 0.2), (0.03, 0.24), (0.03, 0.27), (0.0, 0.27)], 0.5, 0.46, bz, '#6aaee0', seg=10)   # 一瓶洗衣精
    # 東北角的失物招領（長椅東邊，曬衣架前面的小桌上一個籃子）
    lx, lz = 1.15, Z1 - 0.32
    c.vc.crbox(lx - 0.32, lx + 0.32, 0.7, 0.74, lz - 0.22, lz + 0.22, '#e8e4dc', r=0.01, seg=1)
    for xx in (lx - 0.28, lx + 0.28):
        for zz in (lz - 0.18, lz + 0.18): c.vm.cbox(xx - 0.012, xx + 0.012, 0.0, 0.7, zz - 0.012, zz + 0.012, '#5a5f63')
    rbox(c.vc, rot(lx, lz, 0.0), -0.22, 0.22, 0.74, 0.9, -0.15, 0.15, '#b98a50', r=0.02)
    for k, col in enumerate(('#3a3a3a', '#f2f2ee', '#c04a4a')): c.vc.cbox(lx - 0.15 + k * 0.1, lx - 0.08 + k * 0.1, 0.88, 0.93, lz - 0.08, lz + 0.06, col)   # 襪子、毛巾
    uvquad(c.wg('S', 'print', M['print']), [(lx + 0.22, 1.25, Z1 - 0.012), (lx - 0.22, 1.25, Z1 - 0.012), (lx - 0.22, 1.69, Z1 - 0.012), (lx + 0.22, 1.69, Z1 - 0.012)], uv('LOST'))   # 面向 −z：左下角在 +x
    c.block(lx - 0.35, lx + 0.35, lz - 0.25, Z1, 'lost_table')
    # 中間：摺衣服的長桌、洗衣籃
    tx, tz = -0.3, 0.05
    c.vc.crbox(tx - 0.6, tx + 0.6, 0.86, 0.9, tz - 0.35, tz + 0.35, '#e8e4dc', r=0.01, seg=1)
    for xx in (tx - 0.55, tx + 0.55):
        for zz in (tz - 0.3, tz + 0.3): c.vm.cbox(xx - 0.015, xx + 0.015, 0.0, 0.86, zz - 0.015, zz + 0.015, '#5a5f63')
    c.vm.cbox(tx - 0.55, tx + 0.55, 0.22, 0.24, tz - 0.3, tz + 0.3, '#5a5f63')                                                       # 下層的架子
    basket(c, tx - 0.25, 0.9, tz, '#4a8ac0'); basket(c, tx + 0.3, 0.24, tz, '#e0a040')
    for k in range(3): c.vc.cbox(tx + 0.1, tx + 0.45, 0.9 + k * 0.035, 0.93 + k * 0.035, tz - 0.2, tz + 0.08, ['#f2f2ee', '#9ab0c8', '#e8d9c4'][k])   # 摺好的衣服
    c.block(tx - 0.63, tx + 0.63, tz - 0.38, tz + 0.38, 'fold_table')
    # 燈：兩組日光燈
    for x in (-0.9, 0.9):
        c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, -0.25, 0.25, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, -0.21, 0.21)
    K.ac_unit(c, X1, 2.35, -1.6, '-x', w=0.8, fade=True)
    # 看東西的點、劇情的位置
    c.look('washers', round(X1 - 1.15, 3), round((WZ[1] + WZ[2]) / 2, 3), 0.9, '洗衣機', '', dev='四台直立式投幣洗衣機；「洗衣服」（40 分）也可以放這裡（LAWWW-B）；遊戲裡顯示的字等 AA 寫')
    c.look('dryers', round(X0 + 1.2, 3), round((DZ[0] + DZ[1]) / 2, 3), 0.9, '烘衣機', '', dev='兩組上下疊的烘衣機；第 4 台上面貼著「要投兩次」；遊戲裡顯示的字等 AA 寫')
    c.look('notice', -1.4, round(Z0 + 0.7, 3), 0.7, '使用須知', '', dev='門邊的使用須知；遊戲裡顯示的字等 AA 寫')
    c.look('lost', lx, round(lz - 0.75, 3), 0.6, '失物招領', '', dev='失物招領的籃子（襪子、毛巾）；遊戲裡顯示的字等 AA 寫')
    spots = {'wash': dict(x=round(X1 - 1.05, 3), z=WZ[1], yaw=round(PI / 2, 4), act='stand', note='「洗衣服」：站在第 2 台洗衣機前面（面向 +x）'),
             'kai': dict(x=-0.6, z=round(bz, 3), yaw=round(PI, 4), act='sit', note='阿凱（大一週日 21～22）：坐在長椅中間滑手機、等烘衣'),
             'kai_stand': dict(x=round(X0 + 1.15, 3), z=DZ[1], yaw=round(-PI / 2, 4), act='stand', note='阿凱站在第 3、4 台烘衣機前（「這台烘衣機要投兩次」那一句）'),
             'player': dict(x=round(X0 + 1.3, 3), z=round(DZ[1] + 0.85, 3), yaw=round(-PI / 2 - 0.5, 4), act='stand', note='玩家（在阿凱旁邊）')}
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面的中間；從宿舍 1F 走廊的「洗衣間」門（dorm_layout.js doors 的 laundry，lv 0）進來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.2, 3), yaw=0.0, note='進門、面向 +z')
    c.exits = [dict(x=dx, z=round(Z0 + 0.4, 3), r=0.6, label='離開洗衣間', to='dorm_hall', spawn_note='回到宿舍 1F 走廊、洗衣間的門前面（back_spawn）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain'), merge=key not in ('print',))
    for m in (c.vc, c.vm, c.tube, c.disp, c.glass): m.finish(c.root, uv=False)
    c.prt.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='洗衣間', type='洗衣間', src='AA_399 第 11 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=3.8, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='dorm_room',
               counter=None, clerk=None, teacherSpot=None, order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               back_spawn=dict(x=-11.0, z=0.53, lv=0, yaw=round(PI, 4), note='宿舍 1F 走廊、洗衣間門前面＝dorm3d.js 門的互動點（走廊南牆 z 1.28 往走廊 0.75 m）'),
               host_door=dict(zone='dorm_hall', id='laundry', lv=0, label='進入 洗衣間', note='dorm3d.js 的門：照 d.to 變成出入口（沒有 open＝一直開）'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('DORM_LAUNDRY', 'OK' if not p else p)
