"""霖澤館 1F 法律學院辦公室（系辦；AA_399 第 7 節，企劃線 5d09bb725；LAWWW-B 10-24 03:53 任務 #82 第二間）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/linze_office.glb＋linze_office.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/linze_office.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 開：平日 09:00～12:00、13:30～17:00（closed2_3d.js 的 CLOSED2.officeOpen 同一套時間）。櫃台＋系辦助理（背景人物，說話框寫「系辦助理」）。
  - 事件換到這裡：交換志願表繳交（2027-11-18 截止；closed2_3d.js 現在在門口交）、學分採計 C10（現在是 2D）、延畢的證書（2030-01-21）。
  - 其他時間：門上的辦公時間照舊（linze_layout.js doors.office 的 closed）。
霖澤館 1F 大廳北牆的「法律學院辦公室」門（src/data/linze_layout.js 的 doors.office，lv 0、x 1.6）進來。區域自己的座標：x −4.0…4.0、z −3.0…3.0；
  門在 −z 那一面（大廳那一側，靠東 x 2.8），進門面向 +z；+z 那一面一排窗（窗景借 linze_east）。
房間：
  - 客人那一側（門口到櫃台，z −3.0…−0.9）：服務櫃台（一般高度 1.0 m＋一段寫字的低台）、表格架（東牆）、教師信箱（北牆西段，一格一格的木格子）、公告欄、等候的兩張椅子（西牆）。
  - 職員那一側（櫃台後面，玩家走不進去）：兩張辦公桌（螢幕、文件、筆筒、印章盒）、窗下一排矮櫃（檔案夾）、影印機、西南角的檔案櫃、櫃台西端關著的小門。
  - 櫃台上：「服務台」立牌、收件盒（志願表交這裡）、一疊表格、筆。
內容虛構（沒有真實姓名、課號；牌子只寫「法律學院」「服務台」這種一般的字）。做法和萬才館研討室（wancai_seminar.py、wancai_semb.py）一樣。"""
import json, math, os, random, sys, types
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, plant, navcheck, auto_ap   # noqa: E402
import wancai_seminar as SA   # noqa: E402   會議椅、旁聽椅
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.2; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'linze_office'
REG = {'PLAQUE': (0, 0, 512, 128), 'NOTICE': (0, 128, 512, 640), 'HOURS': (512, 0, 768, 256), 'CLOCK': (768, 0, 1024, 256),
       'DESK': (512, 256, 768, 352), 'INBOX': (512, 352, 768, 416), 'FORM': (768, 256, 1024, 608), 'RACK': (0, 640, 512, 1024),
       'PIGEON': (512, 608, 1024, 864), 'SCREEN': (512, 864, 768, 1024), 'BINDER': (768, 864, 1024, 1024), 'PAD': (512, 416, 768, 608)}


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """牆上的「法律學院」字牌、公告欄、辦公時間、時鐘、服務台立牌、收件盒、表格（字是一般的欄位名）、表格架的正面、教師信箱的名條（只有數字）、螢幕、檔案夾書背、便條"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(5)
    x0, y0, x1, y1 = REG['PLAQUE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(44, 54, 62)); ctext(d, (x0 + x1) / 2, y0 + 22, '法律學院辦公室', F(64), (236, 232, 220))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    cards = [('交換學生\n校內甄選\n志願表繳交', (250, 250, 248)), ('學分抵免\n申請期間', (250, 228, 140)), ('獎學金\n公告', (210, 232, 246)),
             ('畢業審查\n請先自行\n核對學分', (232, 246, 214)), ('研究所\n推甄簡章', (246, 220, 220)), ('教室借用\n請線上申請', (250, 250, 248))]
    for k, (t, col) in enumerate(cards):
        px, py = x0 + 18 + (k % 3) * 164, y0 + 20 + (k // 3) * 244; w, h = 150, 220
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        lines = t.split('\n')
        for j, ln in enumerate(lines): ctext(d, px + w / 2, py + 30 + j * 36, ln, F(26), (50, 46, 40))
        for j in range(3): yy = py + 40 + len(lines) * 36 + j * 22; d.line([(px + 14, yy), (px + w - 14 - rr.randint(0, 40), yy)], fill=(160, 156, 150), width=3)
    x0, y0, x1, y1 = REG['HOURS']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); ctext(d, (x0 + x1) / 2, y0 + 16, '辦公時間', F(34), (40, 40, 40))
    ctext(d, (x0 + x1) / 2, y0 + 78, '週一至週五', F(28), (60, 60, 60)); ctext(d, (x0 + x1) / 2, y0 + 128, '09:00–12:00', F(30), (40, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 172, '13:30–17:00', F(30), (40, 40, 40))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 110
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 20) * math.sin(a), cy - (r - 20) * math.cos(a)), (cx + (r - 6) * math.sin(a), cy - (r - 6) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 50 * math.sin(0.3), cy - 50 * math.cos(0.3))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 80 * math.sin(4.2), cy - 80 * math.cos(4.2))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['DESK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(44, 54, 62)); ctext(d, (x0 + x1) / 2, y0 + 22, '服 務 台', F(46), (240, 236, 224))
    x0, y0, x1, y1 = REG['INBOX']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); ctext(d, (x0 + x1) / 2, y0 + 14, '收件（申請表）', F(30), (40, 40, 40))
    x0, y0, x1, y1 = REG['FORM']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 14, '申請表', F(32), (40, 40, 40))
    for k, t in enumerate(['學號', '姓名', '系級', '申請事項', '說明', '簽名']):
        yy = y0 + 66 + k * 44; d.text((x0 + 16, yy), t, font=F(20), fill=(70, 70, 70)); d.line([(x0 + 110, yy + 24), (x1 - 16, yy + 24)], fill=(160, 160, 160), width=2)
    x0, y0, x1, y1 = REG['RACK']   # 表格架正面：一格一格的表格（標題各不同色）
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(200, 196, 188))
    for k in range(12):
        px, py = x0 + 10 + (k % 4) * 125, y0 + 10 + (k // 4) * 124; d.rectangle([px, py, px + 115, py + 114], fill=(250, 250, 246))
        d.rectangle([px, py, px + 115, py + 24], fill=[(38, 74, 92), (70, 104, 64), (150, 60, 50), (200, 160, 60)][k % 4])
        for j in range(4): d.line([(px + 10, py + 40 + j * 18), (px + 105 - rr.randint(0, 30), py + 40 + j * 18)], fill=(170, 170, 170), width=3)
    x0, y0, x1, y1 = REG['PIGEON']   # 教師信箱的名條：只有三位數的號碼
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(236, 232, 222))
    for k in range(24):
        px, py = x0 + 6 + (k % 6) * 84, y0 + 8 + (k // 6) * 62; d.rectangle([px, py, px + 76, py + 26], fill=(250, 250, 248)); ctext(d, px + 38, py + 2, str(501 + k), F(20), (60, 60, 60))
    x0, y0, x1, y1 = REG['SCREEN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(220, 232, 244)); d.rectangle([x0, y0, x1 - 1, y0 + 22], fill=(60, 90, 140))
    for k in range(7): d.rectangle([x0 + 14, y0 + 34 + k * 17, x0 + 14 + rr.randint(60, 210), y0 + 42 + k * 17], fill=(150, 168, 190))
    x0, y0, x1, y1 = REG['BINDER']; cols = [(38, 74, 92), (70, 104, 64), (150, 60, 50), (200, 160, 60), (90, 90, 120), (38, 74, 92), (230, 230, 226), (70, 104, 64)]
    sw = (x1 - x0) / len(cols)
    for k, col in enumerate(cols):
        a = x0 + k * sw; d.rectangle([a, y0, a + sw - 2, y1], fill=col); d.rectangle([a + 4, y0 + 30, a + sw - 6, y0 + 80], fill=(246, 246, 240)); ctext(d, a + sw / 2, y0 + 42, str(111 + k % 4), F(16), (40, 40, 40))
    x0, y0, x1, y1 = REG['PAD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 246, 210))
    for k in range(7): yy = y0 + 22 + k * 22; d.line([(x0 + 12, yy), (x1 - 12, yy)], fill=(200, 196, 160), width=2)
    for k, w in enumerate([150, 120, 170, 90, 140]): d.line([(x0 + 16, y0 + 18 + k * 22), (x0 + 16 + w, y0 + 16 + k * 22)], fill=(40, 50, 120), width=3)
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '法律學院辦公室', 'sub': '系辦'}; self.S = dict(trim='#5a4a3e', wainH=0.9)
        self.W, self.D = 8.0, 6.0; self.X0, self.X1, self.Z0, self.Z1 = -4.0, 4.0, -3.0, 3.0
        self.rng = random.Random(2027); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_floor', 'terrazzo_tiles', tile=1.6, target='#cfcac0', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.55),   # 磨石子（老系館一樓），淺色
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#eceae4', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(SID + '_wain', 'walnut_veneer', tile=0.9, target='#a88a68', contrast=0.7, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=1.1, target='#b8946a', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'scr': L.flat('GLOW_' + SID + '_screen', '#ffffff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr(SID + '_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.55),
            'screen': img_mat('GLOW_' + SID + '_screens', SID + '_print.png', rough=0.3, emit=0.8),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.tube = Mesh(SID + '_tubes', M['tube'])
        self.prt = Mesh(SID + '_prints', M['print']); self.scr = Mesh(SID + '_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def staff_desk(c, cx, cz, yaw, w=1.4, d=0.7):
    """職員的辦公桌（灰色鐵桌＋淺木紋桌面、三層抽屜）：人坐在桌子後面、面向 yaw（桌子在人的前面）；螢幕在桌子的另一邊、畫面朝人；鍵盤、一疊公文、筆筒、印章盒。回傳椅子的位置"""
    T = rot(cx, cz, yaw); h = 0.74
    rbox(c.wood, T, -w / 2, w / 2, h - 0.03, h, -d / 2, d / 2, None, r=0.01)
    rbox(c.vc, T, w / 2 - 0.42, w / 2 - 0.02, 0.0, h - 0.03, -d / 2 + 0.02, d / 2 - 0.04, '#8a8f94')                       # 抽屜櫃
    for k in range(3): rbox(c.vc, T, w / 2 - 0.4, w / 2 - 0.04, 0.08 + k * 0.21, 0.26 + k * 0.21, -d / 2 + 0.03, -d / 2 + 0.045, '#9aa0a4')   # 抽屜面朝人
    rbox(c.vc, T, -w / 2 + 0.02, -w / 2 + 0.05, 0.0, h - 0.03, -d / 2 + 0.02, d / 2 - 0.04, '#8a8f94')                     # 左邊的側板
    rbox(c.vc, T, -w / 2 + 0.05, w / 2 - 0.42, 0.3, h - 0.05, d / 2 - 0.06, d / 2 - 0.04, '#8a8f94')                       # 擋板（桌子的另一邊）
    # 螢幕（朝人）
    a = T(-0.05, 0.2); ccyl(c.vm, (a[0], h, a[1]), (a[0], h + 0.12, a[1]), 0.02, '#2b2b2b', seg=6)
    rbox(c.vc, T, -0.33, 0.23, h + 0.1, h + 0.44, 0.19, 0.22, '#202326', r=0.008)
    p = [T(-0.31, 0.188), T(0.21, 0.188)]   # 螢幕畫面朝 −lz（人那一側）
    uvquad(c.scr, [(p[1][0], h + 0.12, p[1][1]), (p[0][0], h + 0.12, p[0][1]), (p[0][0], h + 0.42, p[0][1]), (p[1][0], h + 0.42, p[1][1])], uv('SCREEN'))
    rbox(c.vc, T, -0.25, 0.15, h, h + 0.02, -0.22, -0.08, '#2b2b2b', r=0.005)                                                 # 鍵盤
    rbox(c.vc, T, 0.22, 0.28, h, h + 0.02, -0.2, -0.12, '#2b2b2b', r=0.01)                                                    # 滑鼠
    for k in range(rr_int(c, 3, 7)): rbox(c.vc, T, -0.62, -0.38, h + k * 0.012, h + k * 0.012 + 0.01, -0.2, 0.12, '#f4f2ec' if k % 3 else '#e8e2d2')   # 一疊公文
    pc = T(0.45, 0.15); clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.0, 0.1)], pc[0], h, pc[1], '#3a3f44', seg=10)   # 筆筒
    q = T(0.45, -0.1); rbox(c.vc, rot(q[0], q[1], yaw), -0.06, 0.06, h, h + 0.05, -0.04, 0.04, '#7a2a24', r=0.006)             # 印章盒
    cb = T(0.0, -(d / 2 + 0.42)); NS = types.SimpleNamespace(vc=c.vc, vm=c.vm); SA.meet_chair(NS, cb[0], cb[1], yaw)       # 人坐的椅子（面向 yaw）
    return cb


def rr_int(c, a, b): return c.rng.randint(a, b)


def flat_print(m, cx, y, cz, w, d, yaw, key):
    """平放的紙（字的上緣朝 −lz；yaw＝π 時給 −z 那一側的人看）"""
    T = rot(cx, cz, yaw); p = [T(-w / 2, d / 2), T(w / 2, d / 2), T(w / 2, -d / 2), T(-w / 2, -d / 2)]
    uvquad(m, [(p[0][0], y, p[0][1]), (p[1][0], y, p[1][1]), (p[2][0], y, p[2][1]), (p[3][0], y, p[3][1])], uv(key))


def tent(vc, prt, cx, cz, yaw, key, w=0.24, h=0.09, y=0.74):
    """三角立牌：字朝 yaw 那一邊"""
    T = rot(cx, cz, yaw); t = 0.035
    for s_ in (1, -1):
        a, b = T(-w / 2, s_ * t), T(w / 2, s_ * t); ta, tb = T(-w / 2, 0.0), T(w / 2, 0.0)
        pts = [(a[0], y, a[1]), (b[0], y, b[1]), (tb[0], y + h, tb[1]), (ta[0], y + h, ta[1])]
        if s_ > 0: uvquad(prt, pts, uv(key))
        else: vc.poly([pts[1], pts[0], pts[3], pts[2]], '#f2f2ee')


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    wh = 0.9
    # +z（S）：一排窗（窗洞中心 2.1 m、2.2 × 1.6）
    WX = [-2.55, 0.0, 2.55]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x；窗景借 linze_east')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], wh, H))
    wn.quad(QS(X0, X1, 0.0, wh)); tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z1 - 0.015, Z1, '#4a3a2e')
    for wx in WX:
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, wh, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
        # 百葉窗（拉起一半）
        for k in range(9): fr.cbox(a + 0.05, b - 0.05, wy1 - 0.06 - k * 0.07, wy1 - 0.045 - k * 0.07, Z1 - 0.13, Z1 - 0.09, '#e6e2d8')
    # 窗下一排矮櫃（檔案夾）
    cab = c.wg('S', 'cab', M['vcm'], cm=True); fp = c.wg('S', 'print', M['print'])
    cab.cbox(X0 + 0.3, X1 - 1.3, 0.0, 0.82, Z1 - 0.42, Z1 - 0.02, '#c9ccc8'); cab.cbox(X0 + 0.3, X1 - 1.3, 0.82, 0.85, Z1 - 0.44, Z1 - 0.02, '#b9bcb8')
    for k in range(int((X1 - 1.3 - X0 - 0.3) / 0.9)):
        xa = X0 + 0.35 + k * 0.9; cab.cbox(xa, xa + 0.85, 0.05, 0.78, Z1 - 0.425, Z1 - 0.42, '#b9bcb8'); cab.cbox(xa + 0.38, xa + 0.47, 0.6, 0.64, Z1 - 0.44, Z1 - 0.425, '#5a5f63')
    for xa in (X0 + 0.5, -1.4, 0.9):   # 矮櫃上的檔案夾（一排立著）
        uvquad(fp, [(xa + 0.9, 0.85, Z1 - 0.3), (xa, 0.85, Z1 - 0.3), (xa, 1.15, Z1 - 0.3), (xa + 0.9, 1.15, Z1 - 0.3)], uv('BINDER'))
        cab.cbox(xa, xa + 0.9, 0.85, 1.15, Z1 - 0.29, Z1 - 0.06, '#5a6a7a')
    c.block(X0, X1, Z1 - 0.46, Z1, 'low_cabinets')
    # 影印機（東南角）
    px0, px1, pz0, pz1 = X1 - 1.15, X1 - 0.35, Z1 - 1.05, Z1 - 0.35
    c.vc.crbox(px0, px1, 0.0, 0.95, pz0, pz1, '#e4e4e0', r=0.02, seg=1); c.vc.cbox(px0 + 0.05, px1 - 0.05, 0.95, 1.05, pz0 + 0.05, pz1 - 0.05, '#d8d8d4')
    c.vc.cbox(px0 + 0.1, px0 + 0.4, 0.98, 1.02, pz0 - 0.002, pz0 + 0.002, '#2a2e33'); c.vc.cbox(px1 - 0.02, px1 + 0.12, 0.7, 0.74, pz0 + 0.15, pz1 - 0.15, '#c9ccc8')
    c.block(px0, px1 + 0.12, pz0, pz1, 'copier')
    # −z（N，大廳那一側）：門（x 2.8）、教師信箱（西段）、公告欄、時鐘、辦公時間
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['glass']); fr = c.wg('N', 'frame', M['vcm'], cm=True)
    dx, dw = 2.8, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#4a3a2e')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): fr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#7a7f84')
    fr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#7a7f84')
    wd.quad([(dx + dw / 2, 0.05, Z0 + 0.02), (dx - dw / 2, 0.05, Z0 + 0.02), (dx - dw / 2, 2.1, Z0 + 0.02), (dx + dw / 2, 2.1, Z0 + 0.02)])   # 玻璃門（關著；玩家出入用互動點）
    fr.cbox(dx - dw / 2, dx + dw / 2, 0.0, 0.08, Z0 + 0.0, Z0 + 0.04, '#7a7f84'); fr.cbox(dx - dw / 2, dx + dw / 2, 2.05, 2.11, Z0, Z0 + 0.04, '#7a7f84')
    fr.cbox(dx + dw / 2 - 0.14, dx + dw / 2 - 0.1, 0.8, 1.3, Z0 + 0.04, Z0 + 0.08, '#c9ced2')                                 # 門把（直的）
    def pq(side, a0, a1, y0, y1, key, inset=0.015):
        m = c.wg(side, 'print', M['print'])
        if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
        elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
        elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
        else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
        uvquad(m, pts, uv(key))
    pq('N', -0.6, 1.6, 1.15, 2.15, 'NOTICE', inset=0.014); K.frame_board(c, 'N', -0.6, 1.6, 1.15, 2.15, '#5a4030')
    pq('N', 3.45, 3.85, 1.3, 1.7, 'HOURS')
    pq('N', 0.35, 0.85, 2.45, 2.95, 'CLOCK', inset=0.016)
    # 教師信箱（北牆西段）：木格子 6 × 4，名條只有號碼；幾格有信
    px0, px1, py0, py1, pd = -3.7, -1.2, 0.95, 2.05, 0.32
    pv = c.wg('N', 'pigeonvc', M['vc'], cm=True); PW = '#b8946a'   # 淺色木頭的單色（10-24 截圖：木紋貼圖在這麼細的板子上紋路太粗）
    pv.cbox(px0, px1, py0 - 0.03, py0, Z0, Z0 + pd, PW); pv.cbox(px0, px1, py1, py1 + 0.03, Z0, Z0 + pd, PW)
    for k in range(7): xx = px0 + k * (px1 - px0) / 6; pv.cbox(xx - 0.012, xx + 0.012, py0, py1, Z0, Z0 + pd, PW)
    for k in range(1, 4): yy = py0 + k * (py1 - py0) / 4; pv.cbox(px0, px1, yy - 0.01, yy + 0.01, Z0, Z0 + pd, PW)
    pv.cbox(px0, px1, py0, py1, Z0, Z0 + 0.01, '#8a6e50')
    for i in range(6):
        for j in range(4):
            xa = px0 + i * (px1 - px0) / 6 + 0.02; ya = py0 + j * (py1 - py0) / 4
            if rr.random() < 0.55:
                n = rr.randint(1, 3)
                for q in range(n): pv.cbox(xa + 0.02, xa + 0.36, ya + 0.012 + q * 0.012, ya + 0.022 + q * 0.012, Z0 + 0.03, Z0 + 0.26 - q * 0.03, rr.choice(('#f4f2ec', '#e8dcc0', '#dfe8f0')))
    for j in range(4):   # 名條（每一層的上緣）
        ya = py0 + (j + 1) * (py1 - py0) / 4 - 0.055
        uvquad(c.wg('N', 'print', M['print']), [(px0 + 0.02, ya, Z0 + pd + 0.002), (px1 - 0.02, ya, Z0 + pd + 0.002), (px1 - 0.02, ya + 0.04, Z0 + pd + 0.002), (px0 + 0.02, ya + 0.04, Z0 + pd + 0.002)],
               (uv('PIGEON')[0], uv('PIGEON')[1] + (3 - j) * (uv('PIGEON')[3] - uv('PIGEON')[1]) / 4, uv('PIGEON')[2], uv('PIGEON')[1] + (4 - j) * (uv('PIGEON')[3] - uv('PIGEON')[1]) / 4))
    c.block(px0, px1, Z0, Z0 + pd + 0.02, 'pigeonholes')
    # 東牆：表格架（客人那一側）
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    rk = c.wg('E', 'rack', M['vcm'], cm=True); rz0, rz1 = -2.3, -1.3
    rk.cbox(X1 - 0.3, X1, 0.0, 1.5, rz0, rz0 + 0.03, '#b9bec2'); rk.cbox(X1 - 0.3, X1, 0.0, 1.5, rz1 - 0.03, rz1, '#b9bec2'); rk.cbox(X1 - 0.03, X1, 0.0, 1.5, rz0, rz1, '#c9ccc8')
    for k in range(4):   # 斜的層板＋表格
        y = 0.35 + k * 0.3; rk.cbox(X1 - 0.28, X1 - 0.03, y, y + 0.02, rz0 + 0.03, rz1 - 0.03, '#c9ccc8')
    pq('E', rz0 + 0.04, rz1 - 0.04, 0.38, 1.48, 'RACK', inset=0.29)
    c.block(X1 - 0.32, X1, rz0, rz1, 'form_rack')
    # 西牆：兩張等候的椅子（客人那一側）、檔案櫃（職員那一側）
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True)
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    pq('W', -2.35, -1.2, 2.3, 2.6, 'PLAQUE')
    for z in (-2.1, -1.45):
        SA.wall_chair(c, X0 + 0.34, z, PI / 2); c.seat(X0 + 0.34, z, PI / 2, (X0 + 0.94, z), 'sit', ap=(X0 + 0.84, z), label='坐下等'); c.seats[-1]['uses'] = ['等候']
    c.block(X0, X0 + 0.42, -2.4, -1.15, 'wait_chairs')
    fk = c.wg('W', 'filecab', M['vcm'], cm=True); fz0, fz1 = 0.2, 1.4
    fk.cbox(X0, X0 + 0.5, 0.0, 1.32, fz0, fz1, '#c9ccc8')
    for k in range(4):
        y = 0.06 + k * 0.32; fk.cbox(X0 + 0.5, X0 + 0.505, y, y + 0.28, fz0 + 0.03, (fz0 + fz1) / 2 - 0.02, '#b9bcb8'); fk.cbox(X0 + 0.5, X0 + 0.505, y, y + 0.28, (fz0 + fz1) / 2 + 0.02, fz1 - 0.03, '#b9bcb8')
        for zc in ((fz0 + (fz0 + fz1) / 2) / 2, ((fz0 + fz1) / 2 + fz1) / 2): fk.cbox(X0 + 0.505, X0 + 0.52, y + 0.2, y + 0.23, zc - 0.07, zc + 0.07, '#5a5f63')
    c.block(X0, X0 + 0.52, fz0, fz1, 'file_cabinet')
    # 櫃台（客人／職員的分界，z −0.9…−0.35）：東段一般高度＋西段關著的小門
    cz0, cz1 = -0.95, -0.4; gx = -3.1
    cw = c.wood; cw.rbox(gx, X1 - 0.02, 1.0, 1.04, cz0 - 0.04, cz1, r=0.01, seg=2)                                          # 櫃台面（客人那一側多出 4 cm）
    c.vc.cbox(gx, X1 - 0.02, 0.0, 1.0, cz0, cz0 + 0.03, '#d8d4c8')                                                         # 正面板
    for xx in [gx + 0.6 * k for k in range(int((X1 - gx) / 0.6) + 1)]: c.vc.cbox(xx - 0.008, xx + 0.008, 0.08, 0.98, cz0 - 0.003, cz0, '#c4c0b4')   # 正面的分割線
    c.vc.cbox(gx, X1 - 0.02, 0.0, 0.08, cz0 + 0.02, cz1, '#5a5f63')                                                        # 踢腳
    c.wood.rbox(gx + 0.02, X1 - 0.04, 0.72, 0.75, cz0 + 0.05, cz1 + 0.25, r=0.01, seg=1)                                    # 職員那一側的工作台（低）
    c.vc.cbox(gx, gx + 0.04, 0.0, 1.0, cz0, cz1, '#d8d4c8')
    c.vc.cbox(X0 + 0.02, gx, 0.0, 0.95, (cz0 + cz1) / 2 - 0.02, (cz0 + cz1) / 2 + 0.02, '#c9c5b8')                         # 西段的小門（關著，職員出入）
    c.vm.cbox(gx - 0.1, gx - 0.06, 0.88, 0.92, (cz0 + cz1) / 2 + 0.02, (cz0 + cz1) / 2 + 0.06, '#c9ced2')
    c.block(X0, X1, cz0 - 0.05, cz1, 'counter')
    # 櫃台上：服務台立牌、收件盒、一疊表格、筆（綁著線）、取號不用（系辦人少）
    tent(c.vc, c.prt, 0.9, cz0 + 0.12, PI, 'DESK', w=0.3, h=0.1, y=1.04)                                                  # 字朝門口（−z）
    bx, bz = -0.6, cz0 + 0.2
    c.vc.cbox(bx - 0.2, bx + 0.2, 1.04, 1.12, bz - 0.15, bz + 0.15, '#3a4048'); c.vc.cbox(bx - 0.18, bx + 0.18, 1.06, 1.1, bz - 0.13, bz + 0.13, '#f4f2ec')   # 收件盒（裡面有幾張）
    T = rot(bx, bz - 0.152, PI); p = [T(-0.15, 0.0), T(0.15, 0.0)]
    uvquad(c.prt, [(p[0][0], 1.045, p[0][1]), (p[1][0], 1.045, p[1][1]), (p[1][0], 1.115, p[1][1]), (p[0][0], 1.115, p[0][1])], uv('INBOX'))
    for k in range(5): flat_print(c.prt, 2.0 + k * 0.003, 1.042 + k * 0.002, cz0 + 0.18, 0.21, 0.297, PI + rr.uniform(-0.05, 0.05), 'FORM')
    c.vm.cbox(2.35, 2.36, 1.042, 1.05, cz0 + 0.1, cz0 + 0.24, '#2a3a6a'); ccyl(c.vm, (2.355, 1.045, cz0 + 0.24), (2.4, 1.042, cz0 + 0.36), 0.003, '#8a8f94', seg=4)
    plant(c, 3.55, -0.05, 0.9); c.block(3.3, X1, -0.35, 0.25, 'plant')
    # 職員那一側：兩張辦公桌（面向櫃台）＋一張靠西（面向東）
    spots = {}
    cb = staff_desk(c, 0.3, 0.45, PI); c.block(-0.42, 1.02, 0.08, 0.82, 'desk_a'); spots['assistant'] = dict(x=round(cb[0], 3), z=round(cb[1], 3), yaw=round(PI, 4), act='sit', note='系辦助理（坐在辦公桌，面向櫃台）')
    cb = staff_desk(c, 2.3, 0.45, PI); c.block(1.58, 3.02, 0.08, 0.82, 'desk_b'); spots['staff2'] = dict(x=round(cb[0], 3), z=round(cb[1], 3), yaw=round(PI, 4), act='sit', note='另一位職員（背景，可以沒有人）')
    cb = staff_desk(c, -2.0, 1.75, PI / 2, w=1.2); c.block(-2.4, -1.6, 1.12, 2.38, 'desk_c'); spots['staff3'] = dict(x=round(cb[0], 3), z=round(cb[1], 3), yaw=round(PI / 2, 4), act='sit', note='第三張桌子（背景）')
    spots['counter'] = dict(x=0.5, z=-0.2, yaw=PI, act='stand', note='系辦助理到櫃台收件、給證書的位置（櫃台後面，面向客人）')
    spots['player'] = dict(x=0.5, z=-1.45, yaw=0.0, act='stand', note='玩家在櫃台前（交志願表、拿證書）')
    # 燈
    for x in (-2.0, 2.0):
        for z in (-1.6, 1.4):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    K.ac_unit(c, X0, 2.6, -0.2, '+x', w=0.9, fade=True)
    c.look('counter', 0.5, -1.45, 0.8, '服務台', '', dev='交換志願表、學分採計、延畢證書都在這裡（LAWWW-B 接事件）；平常的字等 AA 寫')
    c.look('pigeon', -2.45, -2.2, 0.9, '教師信箱', '', dev='一格一格的木格子，名條只有號碼；遊戲裡顯示的字等 AA 寫')
    c.look('rack', round(X1 - 0.85, 3), -1.8, 0.8, '表格架', '', dev='各種申請表；遊戲裡顯示的字等 AA 寫')
    c.look('notice', 0.5, -2.2, 0.8, '公告欄', '', dev='交換、抵免、獎學金、畢業審查、推甄、教室借用的公告（內容泛稱）；遊戲裡顯示的字等 AA 寫')
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面靠東；從霖澤館 1F 大廳北牆的「法律學院辦公室」門（linze_layout.js doors.office，lv 0、x 1.6）進來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.35, 3), yaw=0.0, note='進門、面向櫃台（+z）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='離開辦公室', to='linze', spawn_note='回到霖澤館 1F 大廳、辦公室的門前面')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain'), merge=key not in ('print',))
    for m in (c.vc, c.vm, c.tube): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.prt.finish(c.root, uv=False, merge=False); c.scr.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='法律學院辦公室', type='系辦', src='AA_399 第 7 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.0, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='linze_east',
               counter=dict(x0=X0, x1=X1, z0=-1.0, z1=-0.4, note='櫃台：客人那一側 z < −1.0；職員那一側玩家走不進去'), clerk=spots['counter'], teacherSpot=None, order=None,
               seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               open=dict(wd=[1, 2, 3, 4, 5], ranges=[[9, 12], [13.5, 17]], holiday=False,
                         note='AA_399 第 7 節：平日 09:00～12:00、13:30～17:00（國定假日不開；closed2_3d.js CLOSED2.officeOpen 同一套）。其他時間門照舊關著（門上的辦公時間）'),
               host_door=dict(zone='linze', id='office', lv=0, note='linze_layout.js 的 doors.office：加 to、spawn；open 的時段才走得進去（rooms_glb3d.js Z3.roomGlbOpen），closed（門上的辦公時間）照舊'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('LINZE_OFFICE', 'OK' if not p else p)
