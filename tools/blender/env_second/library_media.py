"""總圖 2F 多媒體中心（AA_399 第 12 節，企劃線 5d09bb725；LAWWW-B 10-24 任務 #82 第六間）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/library_media.glb＋library_media.layout.json。LAWWW2-B 2026-10-24；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/library_media.py [-- --out-dir assets/models/env/second_ai]
企劃：
  - 芷若：看電影、做字幕作業（ZR3_SUBTITLE）。LAWWW 先查她的作息，有空的下午才放；2027-09～2028-02 她在英國，不放。
  - 玩家：可以一個人看一部片（60 分）。旁白「（你借了一副耳機。片子很長，你看到一半睡著了。）」（closed2_3d.js 的 S.media，原本做在門口；這次搬到裡面的服務台）
從總圖 2F 的「多媒體中心」門（library_layout.js doors 的 media，x 10.4、z −8.8，lv 1）進來。總圖開館的時候都開（關館以後本來就進不了總圖）。
區域自己的座標：x −5…5、z −3.5…3.5；門在 +z 那一面靠東（x 3.4）；沒有窗（視聽室）。
房間：
  - 進門左手邊：多媒體服務台（借耳機、還片）、後面牆上一排掛著的耳機；服務台西邊：影片架（光碟盒的書背）、查詢機。
  - 後牆（−z）：六個單人視聽座（隔板、螢幕、耳機、椅子）；西牆：三個單人座（芷若常坐中間那個：桌上多一台筆電，做字幕作業）。
  - 東牆：兩個雙人座（小沙發對著牆上的大螢幕）；東北角一扇玻璃門「團體視聽室（預約制）」（關著）。
  - 地毯（和研究小間同一種）、牆上「請戴耳機・請勿飲食」、本週片單。
內容虛構（片名、海報都是遊戲裡的；沒有真實片名、品牌）。做法同萬才館研討室 B、系辦、考場、博雅 203、洗衣間（lane118_shops.py 的共用零件；遊戲端 rooms_glb3d.js）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, clathe, plant, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.0; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SID = 'library_media'
REG = {'SIGN': (0, 0, 512, 128), 'RULES': (512, 0, 1024, 256), 'LIST': (0, 128, 256, 512), 'POSTER': (256, 128, 512, 512), 'GROUP': (512, 256, 768, 384),
       'SCREEN': (512, 384, 1024, 640), 'DESK': (0, 512, 256, 640), 'CLOCK': (768, 256, 1024, 384)}
DX = 3.4                                         # 門（+z 那一面，靠東）
BACK = [-4.2, -3.2, -2.2, -1.2, -0.2, 0.8]      # 後牆的單人座（x）
WEST = [-0.7, 0.3, 1.3]                         # 西牆的單人座（z）；往北移，讓出後牆第一個座位的走近點
PAIR = [-2.3, -0.3]                             # 東牆的雙人座（z）；離後牆留一格，靠牆那個位子的走近點才站得住


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """服務台的牌子、規則、本週片單、影展海報、團體視聽室的門牌、螢幕畫面（片頭的暗畫面）、桌上的小牌、時鐘"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(12)
    x0, y0, x1, y1 = REG['SIGN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(44, 62, 80)); ctext(d, (x0 + x1) / 2, y0 + 30, '多媒體服務台', F(56), (240, 240, 236))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); d.rectangle([x0, y0, x1 - 1, y0 + 60], fill=(44, 62, 80))
    ctext(d, (x0 + x1) / 2, y0 + 12, '視聽區使用須知', F(36), (255, 255, 255))
    for k, t in enumerate(['請戴耳機', '請勿飲食', '離開前請把耳機還到服務台']): d.text((x0 + 30, y0 + 80 + k * 54), '・' + t, font=F(32), fill=(40, 40, 40))
    x0, y0, x1, y1 = REG['LIST']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 240, 226)); ctext(d, (x0 + x1) / 2, y0 + 16, '本週片單', F(34), (120, 50, 40))
    for k in range(7):
        y = y0 + 80 + k * 40; d.text((x0 + 20, y), ['週一', '週二', '週三', '週四', '週五', '週六', '週日'][k], font=F(22), fill=(80, 60, 50))
        d.line([(x0 + 90, y + 14), (x0 + 90 + rr.randint(80, 140), y + 14)], fill=(110, 100, 90), width=4)
    x0, y0, x1, y1 = REG['POSTER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(28, 34, 52))
    for k in range(40):
        cx, cy = rr.randint(x0 + 10, x1 - 10), rr.randint(y0 + 10, y0 + 230); d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=(240, 230, 190))
    d.ellipse([x0 + 140, y0 + 40, x0 + 220, y0 + 120], fill=(244, 232, 196)); ctext(d, (x0 + x1) / 2, y0 + 260, '秋季影展週', F(36), (244, 232, 196)); ctext(d, (x0 + x1) / 2, y0 + 320, '多媒體中心・每晚七點', F(20), (200, 200, 210))
    x0, y0, x1, y1 = REG['GROUP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); ctext(d, (x0 + x1) / 2, y0 + 20, '團體視聽室', F(36), (40, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 76, '預約制', F(26), (150, 40, 40))
    x0, y0, x1, y1 = REG['SCREEN']; g = Image.new('RGB', (x1 - x0, y1 - y0)); gd = ImageDraw.Draw(g)
    for yy in range(y1 - y0): c = int(18 + 30 * yy / (y1 - y0)); gd.line([(0, yy), (x1 - x0, yy)], fill=(c, c + 6, c + 18))
    gd.rectangle([60, 150, 450, 200], fill=(60, 70, 96)); gd.ellipse([370, 40, 440, 110], fill=(230, 210, 160)); im.paste(g, (x0, y0))
    x0, y0, x1, y1 = REG['DESK']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 248, 244)); ctext(d, (x0 + x1) / 2, y0 + 24, '借耳機', F(30), (40, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 70, '請出示學生證', F(24), (90, 90, 90))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 56
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=5)
    for k in range(12): a = k * PI / 6; d.line([(cx + (r - 10) * math.sin(a), cy - (r - 10) * math.cos(a)), (cx + (r - 3) * math.sin(a), cy - (r - 3) * math.cos(a))], fill=(40, 40, 40), width=3)
    d.line([(cx, cy), (cx + 28 * math.sin(1.2), cy - 28 * math.cos(1.2))], fill=(30, 30, 30), width=5); d.line([(cx, cy), (cx + 44 * math.sin(4.0), cy - 44 * math.cos(4.0))], fill=(30, 30, 30), width=3)
    im.save(os.path.join(GEN, SID + '_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = SID; self.T = {'name': '多媒體中心', 'sub': '總圖 2F'}; self.S = dict(trim='#7a756a', wainH=0.12)
        self.W, self.D = 10.0, 7.0; self.X0, self.X1, self.Z0, self.Z1 = -5.0, 5.0, -3.5, 3.5
        self.rng = random.Random(46); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(SID, props={'kind': SID, 'layout': SID + '.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(SID + '_carpet', 'dirty_carpet', tile=1.0, target='#a3a8ab', contrast=0.5, normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.95),   # 和研究小間同一種地毯
            'wall': L.pbr(SID + '_wall', 'painted_plaster_wall', tile=2.0, target='#e8e6e0', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wood': L.pbr(SID + '_wood', 'wood_table_001', tile=0.9, target='#c4a074', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material(SID + '_vc', rough=0.6), 'vcm': L.vc_metal(SID + '_vcmetal', rough=0.32, metal=0.4),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'ceil': L.pbr(SID + '_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),
            'print': img_mat(SID + '_print', SID + '_print.png', rough=0.55),
            'screen': img_mat('GLOW_' + SID + '_screens', SID + '_print.png', rough=0.3, emit=0.85),
        }
        self.vc = CMesh(SID + '_props', M['vc']); self.vm = CMesh(SID + '_metal', M['vcm'])
        self.wood = Mesh(SID + '_woodparts', M['wood']); self.tube = Mesh(SID + '_tubes', M['tube']); self.glass = Mesh(SID + '_glassparts', M['glass'])
        self.prt = Mesh(SID + '_prints', M['print']); self.scr = Mesh(SID + '_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def headphones(c, x, y, z, yaw=0.0, col='#2b2b2b'):
    """頭戴式耳機（放在桌上）：頭帶一個弧＋兩個耳罩"""
    T = rot(x, z, yaw)
    for s_ in (-1, 1):
        px, pz = T(s_ * 0.075, 0.0); ccyl(c.vc, (px, y, pz), (px, y + 0.035, pz), 0.04, col, seg=10)
    pts = [T(-0.075, 0.0), T(-0.06, 0.0), T(0.0, 0.0), T(0.06, 0.0), T(0.075, 0.0)]; hs = [0.035, 0.09, 0.12, 0.09, 0.035]
    for k in range(4): ccyl(c.vc, (pts[k][0], y + hs[k], pts[k][1]), (pts[k + 1][0], y + hs[k + 1], pts[k + 1][1]), 0.008, col, seg=5)


def booth(c, x, z, yaw, k, laptop=False):
    """單人視聽座（靠牆）：(x, z)＝桌子靠牆那一邊的中點，人面向 yaw 的反方向坐（面向牆）；桌子、兩側隔板、螢幕、耳機、椅子；回傳座位"""
    T = rot(x, z, yaw)   # 本地：lz＝離牆（往房間），lx＝沿牆
    rbox(c.wood, T, -0.48, 0.48, 0.72, 0.75, 0.0, 0.62, None, r=0.006)
    for lx in (-0.44, 0.44):
        for lz in (0.06, 0.56): (px, pz) = T(lx, lz); c.vm.cbox(px - 0.012, px + 0.012, 0.0, 0.72, pz - 0.012, pz + 0.012, '#5a5f63')
    for lx in (-0.5, 0.5): rbox(c.vc, T, lx - 0.012, lx + 0.012, 0.0, 1.3, 0.0, 0.85, '#c9c6bd', r=0.004)            # 隔板
    rbox(c.vc, T, -0.26, 0.26, 0.86, 1.18, 0.06, 0.09, '#1e1f22', r=0.006)                                              # 螢幕
    (a, b) = T(-0.24, 0.092), T(0.24, 0.092)
    ux, uz = T(0.0, 1.0)[0] - T(0.0, 0.0)[0], T(0.0, 1.0)[1] - T(0.0, 0.0)[1]
    u0, v0, u1, v1 = uv('SCREEN')
    pts = [(a[0], 0.88, a[1]), (b[0], 0.88, b[1]), (b[0], 1.16, b[1]), (a[0], 1.16, a[1])]
    if ux * (b[1] - a[1]) - uz * (b[0] - a[0]) > 0: pts = [pts[1], pts[0], pts[3], pts[2]]                              # 從房間那一側看是正面（不鏡像）
    uvquad(c.scr, pts, (u0, v0, u1, v1))
    (px, pz) = T(0.0, 0.12); ccyl(c.vm, (px, 0.75, pz), (px, 0.86, pz), 0.012, '#2b2b2b', seg=6); rbox(c.vc, T, -0.08, 0.08, 0.75, 0.758, 0.06, 0.18, '#2b2b2b')
    (hx, hz) = T(0.28, 0.4); headphones(c, hx, 0.75, hz, yaw)
    if laptop:
        (lx_, lz_) = T(-0.15, 0.4); rbox(c.vc, rot(lx_, lz_, yaw), -0.16, 0.16, 0.75, 0.765, -0.11, 0.11, '#9aa0a4'); rbox(c.vc, rot(lx_, lz_, yaw), -0.16, 0.16, 0.765, 0.97, -0.12, -0.11, '#9aa0a4'); rbox(c.vc, rot(lx_, lz_, yaw), -0.145, 0.145, 0.78, 0.955, -0.109, -0.105, '#2a3140')   # 筆電螢幕（朝坐的人；第一輪只有灰色的背面）
        (nx, nz) = T(0.05, 0.48); rbox(c.vc, rot(nx, nz, yaw), -0.08, 0.08, 0.75, 0.758, -0.1, 0.1, '#f2efe4')                    # 字幕稿
    (cx, cz) = T(0.0, 0.95)
    # 椅子（布面辦公椅，面向牆）
    ccyl(c.vm, (cx, 0.05, cz), (cx, 0.42, cz), 0.025, '#2b2b2b', seg=8)
    for j in range(5): a_ = j * 2 * PI / 5; ccyl(c.vm, (cx, 0.05, cz), (cx + 0.26 * math.cos(a_), 0.03, cz + 0.26 * math.sin(a_)), 0.014, '#2b2b2b', seg=5)
    rbox(c.vc, rot(cx, cz, yaw), -0.23, 0.23, 0.42, 0.5, -0.22, 0.22, '#3c4a5c', r=0.03)
    rbox(c.vc, rot(cx, cz, yaw), -0.21, 0.21, 0.55, 0.95, 0.2, 0.26, '#3c4a5c', r=0.03)
    fx, fz = T(0, 1)[0] - T(0, 0)[0], T(0, 1)[1] - T(0, 0)[1]
    seat = dict(x=round(cx, 3), z=round(cz, 3), yaw=round(math.atan2(-fx, -fz), 4))   # 面向牆
    return seat


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh(SID + '_floorm', M['floor'], tile=1.0); fl.box(X0, X1, -0.03, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(SID + '_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)
    c.wins = dict(side='S', wall='front', z=Z1, xs=[], y=1.6, w=0.0, h=0.0, note='沒有窗（視聽室）：遊戲 room() 的 winXs 給空陣列')
    sk = 0.1
    # 四面牆（簡單）：+z（門那一面）
    wl = c.wg('S', 'wall', M['wall']); tr = c.wg('S', 'trim', M['vc'], cm=True); pn = c.wg('S', 'print', M['print'])
    dw = 1.0; d0, d1 = DX - dw / 2 - 0.08, DX + dw / 2 + 0.08
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QS(xa, xb, 0.0, H))
    wl.quad(QS(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, 0.0, sk, Z1 - 0.015, Z1, '#5a5650')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z1 - 0.06, Z1, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z1 - 0.06, Z1, '#5a5f63')
    c.wood.rbox(DX - dw / 2 + 0.01, DX + dw / 2 - 0.01, 0.0, 2.11, Z1 - 0.04, Z1, r=0.004, seg=1)
    uvquad(pn, [(1.0, 2.35, Z1 - 0.012), (0.55, 2.35, Z1 - 0.012), (0.55, 2.8, Z1 - 0.012), (1.0, 2.8, Z1 - 0.012)], uv('CLOCK'))
    # −z（N）：後牆，六個單人座；上面規則、海報
    wl = c.wg('N', 'wall', M['wall']); tr = c.wg('N', 'trim', M['vc'], cm=True); pn = c.wg('N', 'print', M['print'])
    wl.quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, H, Z0), (X0, H, Z0)]); tr.cbox(X0, X1, 0.0, sk, Z0, Z0 + 0.015, '#5a5650')
    uvquad(pn, [(-3.6, 1.6, Z0 + 0.012), (-2.4, 1.6, Z0 + 0.012), (-2.4, 2.2, Z0 + 0.012), (-3.6, 2.2, Z0 + 0.012)], uv('RULES'))
    uvquad(pn, [(-0.6, 1.5, Z0 + 0.012), (0.0, 1.5, Z0 + 0.012), (0.0, 2.4, Z0 + 0.012), (-0.6, 2.4, Z0 + 0.012)], uv('POSTER'))
    for k, x in enumerate(BACK):
        s = booth(c, x, Z0, 0.0, k)
        c.seat(s['x'], s['z'], s['yaw'], (x, Z0 + 0.3), 'sit', ap=(x, round(Z0 + 1.75, 3)), label='坐下（單人視聽座）'); c.seats[-1]['uses'] = ['看片']
    c.block(BACK[0] - 0.52, BACK[-1] + 0.52, Z0, Z0 + 0.87, 'back_booths')
    # 西牆（W）：三個單人座（中間那個桌上多一台筆電：芷若做字幕作業的位子）
    wl = c.wg('W', 'wall', M['wall']); tr = c.wg('W', 'trim', M['vc'], cm=True); pn = c.wg('W', 'print', M['print'])
    wl.quad([(X0, 0.0, Z1), (X0, 0.0, Z0), (X0, H, Z0), (X0, H, Z1)]); tr.cbox(X0, X0 + 0.015, 0.0, sk, Z0, Z1, '#5a5650')
    zr_seat = None
    for k, z in enumerate(WEST):
        s = booth(c, X0, z, PI / 2, k, laptop=(k == 1))
        c.seat(s['x'], s['z'], s['yaw'], (X0 + 0.3, z), 'sit', ap=(round(X0 + 1.75, 3), z), label='坐下（單人視聽座）'); c.seats[-1]['uses'] = ['看片']
        if k == 1: zr_seat = s
    c.block(X0, X0 + 0.87, WEST[0] - 0.52, WEST[-1] + 0.52, 'west_booths')
    uvquad(pn, [(X0 + 0.012, 1.5, 2.4), (X0 + 0.012, 1.5, 1.9), (X0 + 0.012, 2.3, 1.9), (X0 + 0.012, 2.3, 2.4)], uv('LIST'))   # 面向 +x：左下角在 +z
    # 東牆（E）：兩個雙人座（沙發對著牆上的大螢幕）、團體視聽室的玻璃門
    wl = c.wg('E', 'wall', M['wall']); tr = c.wg('E', 'trim', M['vc'], cm=True); pn = c.wg('E', 'print', M['print']); gl = c.wg('E', 'glass', M['glass'])
    g0, g1 = 1.45, 2.55
    wl.quad([(X1, 0.0, Z0), (X1, 0.0, g0), (X1, H, g0), (X1, H, Z0)]); wl.quad([(X1, 0.0, g1), (X1, 0.0, Z1), (X1, H, Z1), (X1, H, g1)]); wl.quad([(X1, 2.25, g0), (X1, 2.25, g1), (X1, H, g1), (X1, H, g0)])
    tr.cbox(X1 - 0.015, X1, 0.0, sk, Z0, g0, '#5a5650'); tr.cbox(X1 - 0.015, X1, 0.0, sk, g1, Z1, '#5a5650')
    for (za, zb) in ((g0, g0 + 0.06), (g1 - 0.06, g1), ((g0 + g1) / 2 - 0.02, (g0 + g1) / 2 + 0.02)): tr.cbox(X1 - 0.07, X1, 0.0, 2.25, za, zb, '#4a4f55')
    tr.cbox(X1 - 0.07, X1, 2.19, 2.25, g0, g1, '#4a4f55')
    gl.quad([(X1 - 0.035, 0.0, g0 + 0.06), (X1 - 0.035, 0.0, g1 - 0.06), (X1 - 0.035, 2.19, g1 - 0.06), (X1 - 0.035, 2.19, g0 + 0.06)])
    c.vc.cbox(X1 - 0.03, X1 - 0.02, 0.0, 2.19, g0 + 0.06, g1 - 0.06, '#3a3f45')   # 門後面暗暗的（團體視聽室關著燈）
    uvquad(pn, [(X1 - 0.075, 1.45, g0 + 0.15), (X1 - 0.075, 1.45, g1 - 0.15), (X1 - 0.075, 1.75, g1 - 0.15), (X1 - 0.075, 1.75, g0 + 0.15)], uv('GROUP'))   # 面向 −x（從房間看是往 +x 看）：左下角在 −z
    c.block(X1 - 0.3, X1, g0, g1, 'group_door')
    for j, z in enumerate(PAIR):
        tz0, tz1 = z - 0.75, z + 0.75
        c.vc.cbox(X1 - 0.06, X1 - 0.02, 0.95, 1.75, z - 0.7, z + 0.7, '#1e1f22')                                       # 大螢幕
        u0, v0, u1, v1 = uv('SCREEN'); uvquad(c.scr, [(X1 - 0.062, 0.98, z - 0.66), (X1 - 0.062, 0.98, z + 0.66), (X1 - 0.062, 1.72, z + 0.66), (X1 - 0.062, 1.72, z - 0.66)], (u0, v0, u1, v1))
        sx = X1 - 1.65                                                                                                 # 雙人沙發（面向 +x）
        c.vc.crbox(sx - 0.4, sx + 0.4, 0.0, 0.42, z - 0.7, z + 0.7, '#7a4a3c', r=0.04)
        c.vc.crbox(sx - 0.45, sx - 0.25, 0.42, 0.85, z - 0.7, z + 0.7, '#7a4a3c', r=0.04)
        for zz in (z - 0.7, z + 0.7): c.vc.crbox(sx - 0.42, sx + 0.38, 0.42, 0.62, zz - 0.09 if zz < z else zz - 0.01, zz + 0.01 if zz < z else zz + 0.09, '#6a3f33', r=0.03)
        for k2, zz in enumerate((z - 0.33, z + 0.33)):
            c.seat(sx, zz, PI / 2, (X1 - 0.3, zz), 'sit', ap=(round(sx - 0.95, 3), zz), label='坐下（雙人座）'); c.seats[-1]['uses'] = ['看片（兩個人）']
        c.vc.cbox(X1 - 0.75, X1 - 0.35, 0.0, 0.42, z - 0.25, z + 0.25, '#4a4f55')                                    # 小茶几（放耳機）
        headphones(c, X1 - 0.55, 0.42, z - 0.08, PI / 2); headphones(c, X1 - 0.55, 0.42, z + 0.1, PI / 2, col='#9aa0a4')
        c.block(sx - 0.47, X1, z - 0.8, z + 0.8, 'pair_%d' % j)
        if j == 0: c.vc.cbox(sx - 0.47, X1, 0.0, 1.5, z + 0.8, z + 0.83, '#c9c6bd')                                 # 兩個雙人座中間的隔板
    # 服務台（門西邊）、後面掛耳機、影片架、查詢機
    cx0, cx1, cz0, cz1 = -0.6, 2.4, 2.0, 2.6
    c.wood.rbox(cx0, cx1, 1.0, 1.05, cz0 - 0.04, cz1, r=0.008, seg=1)
    c.vc.cbox(cx0, cx1, 0.0, 1.0, cz0, cz0 + 0.04, '#e8e4dc'); c.vc.cbox(cx0, cx0 + 0.04, 0.0, 1.0, cz0, cz1, '#e8e4dc'); c.vc.cbox(cx1 - 0.04, cx1, 0.0, 1.0, cz0, cz1, '#e8e4dc')
    c.vc.cbox(cx0, cx1, 0.06, 0.1, cz0 - 0.005, cz0, '#5a5650')
    uvquad(c.prt, [(cx0 + 2.0, 0.62, cz0 - 0.004), (cx0 + 0.6, 0.62, cz0 - 0.004), (cx0 + 0.6, 0.97, cz0 - 0.004), (cx0 + 2.0, 0.97, cz0 - 0.004)], uv('SIGN'))   # 面向 −z（從房間看是往 +z 看）：左下角在 +x
    rbox(c.vc, rot(1.7, 2.12, 0.0), -0.14, 0.14, 1.05, 1.2, -0.02, 0.02, '#f4f4f0')
    uvquad(c.prt, [(1.84, 1.055, 2.098), (1.56, 1.055, 2.098), (1.56, 1.195, 2.098), (1.84, 1.195, 2.098)], uv('DESK'))   # 面向 −z（客人看過來是往 +z）：左下角在 +x
    rbox(c.vc, rot(0.6, 2.35, 0.0), -0.22, 0.22, 1.05, 1.36, -0.03, 0.0, '#1e1f22'); rbox(c.vc, rot(0.6, 2.42, 0.0), -0.05, 0.05, 1.05, 1.18, -0.03, 0.03, '#2b2b2b')   # 館員的螢幕（背面朝外）
    for k in range(3): headphones(c, -0.2 + k * 0.22, 1.05, 2.22, 0.0, col=['#2b2b2b', '#9aa0a4', '#2b2b2b'][k])
    rbox(c.vc, rot(2.05, 2.3, 0.0), -0.2, 0.2, 1.05, 1.2, -0.15, 0.15, '#c99a5a')                                       # 還片箱
    c.vc.cbox(-0.4, 2.2, 1.25, 1.95, Z1 - 0.04, Z1 - 0.02, '#8a7a5a')                                                   # 後面牆上的洞洞板
    for k in range(10):
        hx = -0.25 + k * 0.24; c.vm.cbox(hx - 0.006, hx + 0.006, 1.7, 1.72, Z1 - 0.12, Z1 - 0.04, '#9aa0a4')
        for s_ in (-1, 1): ccyl(c.vc, (hx + s_ * 0.07, 1.5, Z1 - 0.1), (hx + s_ * 0.07, 1.5, Z1 - 0.06), 0.045, '#2b2b2b' if k % 3 else '#9aa0a4', seg=10)
        ccyl(c.vc, (hx - 0.07, 1.52, Z1 - 0.08), (hx, 1.7, Z1 - 0.08), 0.008, '#2b2b2b', seg=5); ccyl(c.vc, (hx, 1.7, Z1 - 0.08), (hx + 0.07, 1.52, Z1 - 0.08), 0.008, '#2b2b2b', seg=5)
    c.block(cx0 - 0.03, cx1 + 0.03, cz0 - 0.05, Z1, 'counter')
    sx0, sx1 = -4.85, -1.25                                                                                              # 影片架（+z 牆，面向 −z）
    for (xa, xb) in ((sx0, (sx0 + sx1) / 2 - 0.02), ((sx0 + sx1) / 2 + 0.02, sx1)):
        c.vc.cbox(xa, xb, 0.0, 0.06, Z1 - 0.36, Z1 - 0.02, '#5a5650'); c.vc.cbox(xa, xb, 1.86, 1.9, Z1 - 0.38, Z1 - 0.02, '#e8e4dc')
        for xx in (xa, xb - 0.03): c.vc.cbox(xx, xx + 0.03, 0.0, 1.9, Z1 - 0.38, Z1 - 0.02, '#e8e4dc')
        c.vc.cbox(xa, xb, 0.06, 1.86, Z1 - 0.04, Z1 - 0.02, '#e8e4dc')
        for k in range(5):
            y = 0.1 + k * 0.36; c.vc.cbox(xa, xb, y, y + 0.025, Z1 - 0.36, Z1 - 0.02, '#e8e4dc')
            x = xa + 0.05
            while x < xb - 0.06:
                w = 0.016 if rr.random() < 0.85 else 0.012; h = 0.19 if rr.random() < 0.8 else 0.17
                c.vc.cbox(x, x + w, y + 0.025, y + 0.025 + h, Z1 - 0.24, Z1 - 0.07, rr.choice(['#1e2a3a', '#3a1e2a', '#2a3a1e', '#e8e4dc', '#7a2a2a', '#2a4a7a', '#c9a24f', '#1e1f22']))
                x += w + 0.002
                if rr.random() < 0.04: x += 0.05
    c.block(sx0, sx1, Z1 - 0.4, Z1, 'shelves')
    kx = -0.92; c.vc.crbox(kx - 0.2, kx + 0.2, 0.0, 0.95, Z1 - 0.45, Z1 - 0.15, '#e8e4dc', r=0.02)                      # 查詢機
    rbox(c.vc, rot(kx, Z1 - 0.32, 0.0), -0.18, 0.18, 0.95, 1.25, -0.04, 0.02, '#1e1f22')
    uvquad(c.scr, [(kx + 0.16, 0.97, Z1 - 0.362), (kx - 0.16, 0.97, Z1 - 0.362), (kx - 0.16, 1.23, Z1 - 0.362), (kx + 0.16, 1.23, Z1 - 0.362)], uv('SCREEN'))   # 面向 −z：左下角在 +x
    c.block(kx - 0.25, kx + 0.25, Z1 - 0.5, Z1, 'kiosk')
    # 燈（偏暗：視聽區）
    for x in (-3.0, 0.0, 3.0):
        for z in (-1.8, 1.2):
            c.vc.cbox(x - 0.6, x + 0.6, H - 0.02, H, z - 0.3, z + 0.3, '#f4f4f1'); c.tube.box(x - 0.56, x + 0.56, H - 0.026, H - 0.02, z - 0.26, z + 0.26)
    K.ac_unit(c, X0, 2.4, -2.6, '+x', w=0.9, fade=True)
    plant(c, X1 - 0.45, Z1 - 0.45, h=1.2)
    c.block(X1 - 0.7, X1, Z1 - 0.7, Z1, 'plant')
    # 看東西、劇情的位置
    c.look('counter', 0.9, round(cz0 - 0.65, 3), 0.8, '多媒體服務台', '', dev='「看一部片」（60 分）從這裡：closed2_3d.js 的 S.media（借耳機）；遊戲裡顯示的字等 AA 寫')
    c.look('shelves', -3.0, round(Z1 - 1.05, 3), 0.8, '影片架', '', dev='光碟盒的書背（沒有片名）；遊戲裡顯示的字等 AA 寫')
    c.look('group', round(X1 - 0.85, 3), 2.0, 0.6, '團體視聽室', '（門上貼著：預約制。）', dev='關著（預約制）；字等 AA 改')
    spots = {'staff': dict(x=0.9, z=3.05, yaw=round(PI, 4), act='stand', note='館員（服務台後面，面向房間）'),
             'zhiruo': dict(x=zr_seat['x'], z=zr_seat['z'], yaw=zr_seat['yaw'], act='sit', note='芷若（西牆中間那個單人座：桌上筆電、字幕稿；ZR3_SUBTITLE）'),
             'player': dict(x=0.9, z=round(cz0 - 0.65, 3), yaw=0.0, act='stand', note='玩家（服務台前面，借耳機）')}
    c.door = dict(x=DX, w=dw, z=Z1, note='+z 那一面靠東；從總圖 2F 的「多媒體中心」門（library_layout.js doors 的 media，lv 1）進來')
    c.spawn = dict(x=DX, z=round(Z1 - 1.25, 3), yaw=round(PI, 4), note='進門、面向 −z（房間裡）')
    c.exits = [dict(x=DX, z=round(Z1 - 0.4, 3), r=0.6, label='離開多媒體中心', to='library_hall', spawn_note='回到總圖 2F、多媒體中心的門前面（back_spawn）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall',), merge=key not in ('print',))
    for m in (c.vc, c.vm, c.tube, c.glass): m.finish(c.root, uv=False)
    c.wood.finish(c.root); c.prt.finish(c.root, uv=False, merge=False); c.scr.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, SID + '.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=SID, name='總圖 2F 多媒體中心', type='視聽室', src='AA_399 第 12 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.0, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins, view='library_carrels',
               counter=None, clerk=spots['staff'], teacherSpot=None, order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, spots=spots,
               back_spawn=dict(x=10.4, z=-8.05, lv=1, yaw=0.0, note='總圖 2F、多媒體中心門前面＝library3d.js 門的互動點（門 z −8.8 往大廳 0.75 m）'),
               host_door=dict(zone='library_hall', id='media', lv=1, label='進入 多媒體中心', note='library3d.js 的門：照 d.to 變成出入口（沒有 open：總圖開館的時候都開）'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, SID + '.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=SID + '.layout.json', seats=len(c.seats), out='assets/models/env/second_ai/' + SID + '.glb'))
    print(json.dumps({'room': SID, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('LIBRARY_MEDIA', 'OK' if not p else p)
