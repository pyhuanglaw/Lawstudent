"""共同教學館 3F 考場（AA_399 第 9 節，企劃線 5d09bb725；LAWWW-B 10-24 03:53 任務 #82 第三間）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/gongtong_3f.glb＋gongtong_3f.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/gongtong_3f.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 只有考試那天開：2029-02-03（ev_grad_exam）、2030-02-16（延畢版，AA_327）。其他時間：2F 樓梯口的鍊子「整修中」照舊（teach3d.js）。
  - 玩家走到 3F 的教室，找到自己的座位。以安那句「你在三樓。我在二樓。」從此有了地方。考試本身照現在的旁白（黑底）。
  - 學姊 08:30 的便條在共同教學館門口（校園；劇情，LAWWW-B）。國考照 2D，不搬。
從共同教學館 2F 的樓梯口（teach3d.js 的「往 3F」，lv 1）上來。區域自己的座標：x −6.0…6.0、z −4.5…4.5；
  門在 −z 那一面靠東（x 4.6，樓梯間那一側），進門面向 +z；+z 那一面一排窗；黑板在西牆（−x），考生面向西。
房間：
  - 黑板（綠色、粉筆字：考試的節次與時間、「准考證放在桌子右上角」，都是一般用語）、監考桌（考卷袋、答案卷、桌鐘）、牆上的時鐘。
  - 24 套單人課桌椅（6 排 × 4 列，列和列之間 1.4 m 的走道）；每張桌子右上角一張座位號碼條（只有號碼）。玩家的位子＝spots.me。
  - 教室後面（東邊）：靠牆一排放書包的地方（考生的包包、外套）、垃圾桶；冷氣。
內容虛構（沒有真實姓名、校名、考試名稱）。做法和萬才館研討室 B、系辦一樣（lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js）。"""
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
H = 3.4; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'gongtong_3f'
REG = {'BOARD': (0, 0, 1024, 384), 'CLOCK': (0, 384, 256, 640), 'NUMS': (256, 384, 1024, 640), 'PLATE': (0, 640, 512, 768), 'ENV': (512, 640, 768, 896),
       'SHEET': (768, 640, 1024, 1024), 'NOTICE': (0, 768, 512, 1024)}
ROWS = [-2.9, -1.7, -0.5, 0.7, 1.9, 3.1]      # 排（離黑板由近到遠，x）
COLS = [-3.0, -1.0, 1.0, 3.0]                  # 列（z）；列和列中間 1.4 m 的走道（0.4 m 導航格上留得出一條站得住的格子；1 m 的走道不行）
LANES = [-1.9, 0.1, 2.1]                       # 走道的中線（導航格站得住的那一條）：座位的走近點
ME = (2, 2)                                    # 玩家的位子：第 3 排（x −0.5）、第 3 列（z 1.0）


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def uvsub(key, i, n):   # 第 i 格（橫向 n 等分）
    u0, v0, u1, v1 = uv(key); w = (u1 - u0) / n; return (u0 + i * w, v0, u0 + (i + 1) * w, v1)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def seat_no(r, c): return '%02d' % (c * len(ROWS) + r + 1)


def make_tex():
    """黑板（粉筆字）、時鐘、座位號碼條（30 張，一格一張）、門牌、考卷袋、答案卷、門口的公告（應考須知）"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(3)
    x0, y0, x1, y1 = REG['BOARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(46, 74, 60))
    ghost = Image.new('L', (x1 - x0, y1 - y0), 0); gd = ImageDraw.Draw(ghost)
    for k in range(14):   # 擦過的粉筆痕
        y = rr.randint(10, y1 - y0 - 10); gd.line([(rr.randint(0, 300), y), (rr.randint(500, 1000), y + rr.randint(-20, 20))], fill=rr.randint(20, 45), width=rr.randint(20, 50))
    ghost = ghost.filter(ImageFilter.GaussianBlur(14)); base = im.crop((x0, y0, x1, y1)); im.paste(Image.composite(Image.new('RGB', base.size, (150, 170, 160)), base, ghost), (x0, y0))
    d = ImageDraw.Draw(im); chalk = (238, 238, 228)
    d.text((x0 + 40, y0 + 30), '入學考試　第三試場', font=F(54), fill=chalk)
    for k, t in enumerate(['第一節　09:00–10:40', '第二節　11:00–12:40', '第三節　14:00–15:40']): d.text((x0 + 60, y0 + 120 + k * 62), t, font=F(42), fill=chalk)
    d.text((x0 + 600, y0 + 130), '准考證放在', font=F(40), fill=(246, 226, 150)); d.text((x0 + 600, y0 + 182), '桌子右上角', font=F(40), fill=(246, 226, 150))
    d.text((x0 + 600, y0 + 250), '手機關機', font=F(40), fill=(246, 200, 200))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 110
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 20) * math.sin(a), cy - (r - 20) * math.cos(a)), (cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 50 * math.sin(4.95), cy - 50 * math.cos(4.95))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 80 * math.sin(5.6), cy - 80 * math.cos(5.6))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['NUMS']; n = len(ROWS) * len(COLS); w = (x1 - x0) / n
    for k in range(n):
        a = x0 + k * w; d.rectangle([a + 1, y0, a + w - 1, y1], fill=(250, 250, 246)); d.rectangle([a + 1, y0, a + w - 1, y0 + 40], fill=(200, 60, 50))
        ctext(d, a + w / 2, y0 + 70, '%02d' % (k + 1), F(22), (30, 30, 30))
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 30, '301　試場', F(58), (240, 240, 236))
    x0, y0, x1, y1 = REG['ENV']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(196, 160, 110)); ctext(d, (x0 + x1) / 2, y0 + 30, '試卷', F(54), (60, 40, 20)); d.rectangle([x0 + 40, y0 + 120, x1 - 40, y0 + 200], fill=(240, 236, 226))
    ctext(d, (x0 + x1) / 2, y0 + 140, '彌封', F(34), (160, 40, 40))
    x0, y0, x1, y1 = REG['SHEET']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 14, '答案卷', F(32), (40, 40, 40))
    for k in range(10): yy = y0 + 70 + k * 30; d.line([(x0 + 16, yy), (x1 - 16, yy)], fill=(190, 190, 190), width=2)
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); d.rectangle([x0, y0, x1 - 1, y0 + 56], fill=(120, 40, 36))
    ctext(d, (x0 + x1) / 2, y0 + 10, '應考須知', F(36), (255, 255, 255))
    for k, t in enumerate(['預備鈴響才可以進場', '開考二十分鐘後不得入場', '書包請放在教室後面', '作答完畢請舉手']): d.text((x0 + 26, y0 + 76 + k * 42), '・' + t, font=F(26), fill=(50, 50, 46))
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '共同教學館 301', 'sub': '考場'}; self.S = dict(trim='#5a4a3e', wainH=0.9)
        self.W, self.D = 12.0, 9.0; self.X0, self.X1, self.Z0, self.Z1 = -6.0, 6.0, -4.5, 4.5
        self.rng = random.Random(2029); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_floor', 'terrazzo_tiles', tile=1.6, target='#cbc6bc', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.55),   # 磨石子，淺色
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#ecebe6', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.flat(SID + '_wain', '#b9b2a4', rough=0.6),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=1.1, target='#c4a27a', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'ceil': L.pbr(SID + '_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.55),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.tube = Mesh(SID + '_tubes', M['tube'])
        self.prt = Mesh(SID + '_prints', M['print'])
        self.WG = {k: {} for k in 'NWES'}


def flat_quad(m, x0, x1, y, z0, z1, rect, up_minus_x=True):
    """水平的貼圖（字的上緣朝 −x：給面向 −x 坐著的人看）"""
    if up_minus_x: uvquad(m, [(x1, y, z0), (x1, y, z1), (x0, y, z1), (x0, y, z0)], rect)
    else: uvquad(m, [(x0, y, z1), (x0, y, z0), (x1, y, z0), (x1, y, z1)], rect)


def desk_unit(c, x, z, r, col_i, bag):
    """單人課桌椅（考生面向 −x）：淺木紋桌面＋鐵腳、桌面下的置物網；椅子：塑膠椅面＋鐵腳；桌子右上角的座位號碼條（只有號碼）"""
    h = 0.74; dx0, dx1 = x - 0.67, x - 0.22; dz0, dz1 = z - 0.3, z + 0.3
    c.wood.rbox(dx0, dx1, h - 0.025, h, dz0, dz1, r=0.008, seg=1)
    for xx in (dx0 + 0.04, dx1 - 0.04):
        for zz in (dz0 + 0.04, dz1 - 0.04): c.vm.cbox(xx - 0.013, xx + 0.013, 0.0, h - 0.025, zz - 0.013, zz + 0.013, '#5a5f63')
    c.vm.cbox(dx0 + 0.06, dx1 - 0.06, 0.5, 0.52, dz0 + 0.05, dz1 - 0.05, '#6a7075')                                       # 桌面下的置物架
    k = col_i * len(ROWS) + r; flat_quad(c.prt, dx0 + 0.03, dx0 + 0.12, h + 0.001, dz0 + 0.03, dz0 + 0.15, uvsub('NUMS', k, len(ROWS) * len(COLS)))   # 號碼條：右上角（面向 −x 的人，右手邊是 −z）
    T = rot(x, z, -PI / 2)
    rbox(c.vc, T, -0.2, 0.2, 0.43, 0.46, -0.19, 0.19, '#3f6fa0', r=0.015)                                                 # 椅面
    rbox(c.vc, T, -0.19, 0.19, 0.6, 0.85, -0.22, -0.2, '#3f6fa0', r=0.012)                                               # 椅背
    for lx in (-0.17, 0.17):
        for lz in (-0.16, 0.16): (px, pz) = T(lx, lz); ccyl(c.vm, (px, 0.0, pz), (px, 0.43, pz), 0.011, '#2b2b2b', seg=6)
        (a, b) = T(lx, -0.19); ccyl(c.vm, (a, 0.46, b), (a, 0.62, b), 0.011, '#2b2b2b', seg=6)
    if bag:   # 有人坐的位子：桌上一枝筆、一張准考證大小的卡（考生還沒進來，東西先放著）
        c.vc.cbox(dx0 + 0.05, dx0 + 0.13, h, h + 0.002, dz1 - 0.16, dz1 - 0.05, '#f4f2ec')
        c.vm.cbox(dx0 + 0.25, dx0 + 0.26, h, h + 0.008, z - 0.08, z + 0.08, c.rng.choice(('#2a3a6a', '#202020', '#7a2a24')))


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    wh = 0.9
    WX = [-4.4, -1.4, 1.6, 4.6]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x；窗景 gongtong_3f（shots/teach_views.py：正面三樓往北）')
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
        fr.cbox(a + 0.05, b - 0.05, wy1 + 0.02, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#e6e2d8')
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊／樓梯間那一側）：門（x 4.6）、門邊的應考須知
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood']); pn = c.wg('N', 'print', M['print'])
    dx, dw = 4.6, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#7a756a')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0, Z0 + 0.04, r=0.004, seg=1)
    tr.cbox(dx - 0.2, dx + 0.2, 1.4, 1.85, Z0 + 0.04, Z0 + 0.045, '#2a2e33')
    uvquad(pn, [(2.6, 1.25, Z0 + 0.015), (3.4, 1.25, Z0 + 0.015), (3.4, 1.85, Z0 + 0.015), (2.6, 1.85, Z0 + 0.015)], uv('NOTICE'))
    # 西牆（前面）：黑板、時鐘；監考桌
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); bd = c.wg('W', 'board', M['print'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    tr.cbox(X0, X0 + 0.04, 0.92, 2.32, -3.0, 3.0, '#8a6a4a')                                                              # 黑板的框
    uvquad(bd, [(X0 + 0.045, 0.97, 2.95), (X0 + 0.045, 0.97, -2.95), (X0 + 0.045, 2.27, -2.95), (X0 + 0.045, 2.27, 2.95)], uv('BOARD'))
    tr.cbox(X0, X0 + 0.11, 0.9, 0.93, -2.9, 2.9, '#8a6a4a')                                                               # 粉筆槽
    for k in range(5): tr.cbox(X0 + 0.04, X0 + 0.1, 0.93, 0.95, -1.8 + k * 0.08, -1.74 + k * 0.08, ('#f2f2ee', '#f2f2ee', '#f6e08a', '#f2b0b0', '#f2f2ee')[k])
    uvquad(c.wg('W', 'print', M['print']), [(X0 + 0.016, 2.5, -3.6), (X0 + 0.016, 2.5, -4.1), (X0 + 0.016, 3.0, -4.1), (X0 + 0.016, 3.0, -3.6)], uv('CLOCK'))
    # 監考桌（面向考生 +x）：考卷袋、答案卷一疊、桌鐘
    px, pz = -4.95, 0.0   # 桌子 0.6 m 深：椅子（x −5.55）不在牆邊那一格導航格裡，桌子前面也留得出一條走道
    c.wood.rbox(px - 0.3, px + 0.3, 0.72, 0.75, pz - 0.7, pz + 0.7, r=0.01, seg=1)
    c.vc.cbox(px + 0.28, px + 0.3, 0.1, 0.72, pz - 0.68, pz + 0.68, '#8a8f94')                                              # 前擋板
    for zz in (pz - 0.65, pz + 0.65): c.vc.cbox(px - 0.28, px + 0.28, 0.0, 0.72, zz - 0.02, zz + 0.02, '#8a8f94')
    c.vc.cbox(px - 0.2, px + 0.1, 0.75, 0.80, pz - 0.5, pz - 0.1, '#c4a06e')                                                 # 考卷袋（牛皮紙）
    flat_quad(c.prt, px - 0.2, px + 0.1, 0.801, pz - 0.5, pz - 0.1, uv('ENV'), up_minus_x=False)
    for k in range(6): c.vc.cbox(px - 0.15, px + 0.15, 0.75 + k * 0.006, 0.755 + k * 0.006, pz + 0.05, pz + 0.47, '#f6f6f2')   # 答案卷一疊
    flat_quad(c.prt, px - 0.15, px + 0.15, 0.787, pz + 0.05, pz + 0.47, uv('SHEET'), up_minus_x=False)
    T = rot(px, pz + 0.58, PI / 2); rbox(c.vc, T, -0.06, 0.06, 0.75, 0.86, -0.03, 0.03, '#2b2b2b', r=0.01)                    # 桌鐘
    SA_chair_T = rot(px - 0.6, pz, PI / 2); rbox(c.vc, SA_chair_T, -0.2, 0.2, 0.43, 0.46, -0.19, 0.19, '#5a6470', r=0.015); rbox(c.vc, SA_chair_T, -0.19, 0.19, 0.6, 0.85, -0.22, -0.2, '#5a6470', r=0.012)
    for lx in (-0.17, 0.17):
        for lz in (-0.16, 0.16): (qx, qz) = SA_chair_T(lx, lz); ccyl(c.vm, (qx, 0.0, qz), (qx, 0.43, qz), 0.011, '#2b2b2b', seg=6)
    c.block(px - 0.32, px + 0.32, pz - 0.73, pz + 0.73, 'proctor_desk')   # 只擋桌子：椅子在桌子和牆中間（0.3 m，玩家站不進去），監考老師坐得下
    # 東牆（後面）：放書包的地方（地上一排包包、外套）、垃圾桶、冷氣
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#7a756a')
    bz = -2.6
    while bz < 3.6:
        kind = rr.random(); col = rr.choice(('#2b3a4a', '#3a3a3a', '#5a2a2a', '#2a4a3a', '#6a5a3a', '#1f2a3a', '#7a7a7a'))
        T = rot(X1 - 0.3, bz, -PI / 2 + rr.uniform(-0.25, 0.25))
        if kind < 0.7: rbox(c.vc, T, -0.15, 0.15, 0.0, rr.uniform(0.38, 0.48), -0.1, 0.1, col, r=0.04)                       # 後背包
        else: rbox(c.vc, T, -0.22, 0.22, 0.0, 0.26, -0.12, 0.12, col, r=0.03)                                                # 手提袋
        bz += rr.uniform(0.38, 0.55)
    c.block(X1 - 0.55, X1, -2.9, 3.8, 'bags')
    clathe(c.vc, [(0.0, 0.0), (0.16, 0.0), (0.19, 0.6), (0.0, 0.6)], X1 - 0.4, 0.0, -3.6, '#3f6fb0', seg=12); c.block(X1 - 0.65, X1, -3.9, -3.3, 'bin')
    K.ac_unit(c, X1, 2.7, 0.0, '-x', w=1.0, fade=True)
    # 30 套課桌椅
    taken = set()
    while len(taken) < 16: taken.add((rr.randrange(len(ROWS)), rr.randrange(len(COLS))))
    taken.discard(ME)
    for ci, z in enumerate(COLS):
        for ri, x in enumerate(ROWS):
            desk_unit(c, x, z, ri, ci, (ri, ci) in taken)
            me = (ri, ci) == ME
            lane = min(LANES, key=lambda q: abs(q - z)); c.seat(x, z, -PI / 2, (x - 0.45, z), 'sit', ap=(x, lane), label='坐下（自己的位子）' if me else '坐下')
            c.seats[-1]['no'] = seat_no(ri, ci); c.seats[-1]['uses'] = ['考試（玩家）'] if me else ['考試（考生）']
            c.block(x - 0.69, x + 0.24, z - 0.31, z + 0.31, 'desk_' + seat_no(ri, ci))
    # 燈
    for x in (-3.6, 0.0, 3.6):
        for z in (-2.2, 2.2):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    rme, cme = ME; mx, mz = ROWS[rme], COLS[cme]
    spots = {'me': dict(x=mx, z=mz, yaw=round(-PI / 2, 4), act='sit', no=seat_no(rme, cme), note='玩家的位子（第 %d 排、第 %d 列，座號 %s）' % (rme + 1, cme + 1, seat_no(rme, cme))),
             'proctor': dict(x=round(px - 0.6, 3), z=pz, yaw=round(PI / 2, 4), act='sit', note='監考老師（坐在監考桌後面，面向考生）'),
             'proctor_walk': [dict(x=-4.0, z=z, yaw=round(PI / 2, 4), act='stand', note='監考老師在前面走動、發考卷') for z in (-2.4, 0.0, 2.4)],
             'examinees': [dict(x=ROWS[r], z=COLS[ci], yaw=round(-PI / 2, 4), act='sit', no=seat_no(r, ci)) for (r, ci) in sorted(taken)]}
    c.look('board', round(X0 + 0.9, 3), -1.0, 0.9, '黑板', '', dev='考試的節次與時間、准考證放右上角、手機關機（粉筆字）；遊戲裡顯示的字等 AA 寫')
    c.look('notice', 3.0, round(Z0 + 0.75, 3), 0.7, '應考須知', '', dev='門邊的應考須知；遊戲裡顯示的字等 AA 寫')
    c.look('bags', round(X1 - 0.95, 3), 1.0, 0.9, '放書包的地方', '', dev='教室後面一排包包；遊戲裡顯示的字等 AA 寫')
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面靠東；從共同教學館 2F 樓梯口的「往 3F」（teach3d.js，lv 1）上來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.35, 3), yaw=0.0, note='進門、面向教室裡（+z）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='下樓（回 2F）', to='gongtong', spawn_note='回到共同教學館 2F 的樓梯口（back_spawn）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'door'), merge=key not in ('print', 'board'))
    for m in (c.vc, c.vm, c.tube): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.prt.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='共同教學館 301（考場）', type='考場', src='AA_399 第 9 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.6, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='gongtong_3f',
               counter=None, clerk=None, teacherSpot=spots['proctor'], order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               open=dict(days=['2029-02-03', '2030-02-16'], daysOnly=True, note='AA_399 第 9 節：只有考試那天開（研究所筆試；延畢版）。其他時間 2F 樓梯口的鍊子「整修中」照舊'),
               back_spawn=dict(x=-0.575, z=-0.38, lv=1, yaw=0.0, note='共同教學館 2F 樓梯口（teach3d.js「往 3F」的位置：B 跑的頂端前面）'),
               host_door=dict(zone='gongtong', id='stair3f', lv=1, note='不是 doors 裡的門：teach3d.js 2F 樓梯口的「往 3F」；考試那天多一個「上 3F（考場）」'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('GONGTONG_3F', 'OK' if not p else p)
