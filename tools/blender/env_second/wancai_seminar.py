"""萬才館 2F 研討室 A（WANCAI-SEMA；使用者 10-20 第二項「霖澤館與萬才館樓層規劃」＋LAWWW-C 15:51 回覆 Q2：研討室 A 要能走進去坐下）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/wancai_sema.glb＋wancai_sema.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/wancai_seminar.py [-- --out-dir assets/models/env/second_ai]
用途（開發分支 courses.js、activities.js、events.js）：WSEM 研討課 4 門、法服讀書會、公法讀書會（大一下第 12 週起週四 20:00）、法服學期檢討會；
  以安、學姊的事件寫「研討室的白板」「一年級坐後面」「研討室安靜了十秒」。
萬才館 2F 北側走廊的「研討室 A」門（src/data/wancai_layout.js 的 doors.seminarA，lv 1、x −3.0）進來。區域自己的座標：x −4.5…4.5、z −3.3…3.3；
  門在 −z 那一面（走廊那一側，靠東），進門面向 +z；+z 那一面是一排窗（窗洞 2.2 × 1.6、中心 2.1 m，和遊戲 room() 的 front 窗一樣）。
房間：中間一張長會議桌（兩側各 6 位＋東端 1 位＝13 位，上課、讀書會坐這裡），西牆白板＋投影幕（老師、報告的人站在西端），
  門那一側靠牆一排旁聽椅（5 位：「一年級坐後面」），東牆書櫃（法典、判決彙編、論文集，書背沒有字）。
做法和霖澤館 3F、118 巷的店一樣（lane118_shops.py 的共用零件；遊戲端 Z3.room＋attachRoomGLB）。白板的字由遊戲或事件決定，模型上的白板是擦過的。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, plant, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.2; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'PLATE': (0, 0, 512, 128), 'RULES': (512, 0, 1024, 384), 'BOARD': (0, 128, 512, 640), 'SCREEN': (512, 384, 1024, 672),
       'NOTICE': (0, 640, 512, 1024), 'CLOCK': (512, 672, 768, 928), 'SIGNUP': (768, 672, 1024, 1024)}


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """門牌、使用須知、白板（擦過的：淡淡的字跡，字由遊戲決定）、投影幕（沒開）、公告、時鐘、借用登記表（內容虛構，沒有真實姓名、課號）"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 26, '研討室 A', F(64), (240, 240, 236))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(70, 56, 46))
    ctext(d, (x0 + x1) / 2, y0 + 12, '研討室使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['借用請到學院辦公室登記', '使用後請把椅子推回桌下', '白板筆用完請蓋好', '離開時關燈、關冷氣', '投影機遙控器在書櫃上']):
        d.text((x0 + 30, y0 + 90 + k * 54), '・' + ln, font=F(32), fill=(50, 50, 46))
    # 白板：底色＋擦過留下的淡灰色字跡（看不出內容）
    x0, y0, x1, y1 = REG['BOARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 248, 248))
    ghost = Image.new('L', (x1 - x0, y1 - y0), 0); gd = ImageDraw.Draw(ghost); rr = random.Random(7)
    for k in range(9):
        y = 40 + k * 50; xx = 30 + rr.randint(0, 40)
        while xx < (x1 - x0) - 60:
            w = rr.randint(20, 70); gd.line([(xx, y + rr.randint(-4, 4)), (xx + w, y + rr.randint(-4, 4))], fill=rr.randint(30, 70), width=rr.randint(5, 9)); xx += w + rr.randint(8, 30)
    ghost = ghost.filter(ImageFilter.GaussianBlur(5)); base = im.crop((x0, y0, x1, y1)); tint = Image.new('RGB', base.size, (150, 160, 175)); im.paste(Image.composite(tint, base, ghost), (x0, y0))
    x0, y0, x1, y1 = REG['SCREEN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(232, 234, 236))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    for k, (t, col) in enumerate([('讀書會\n每週三 19:00', (250, 250, 250)), ('期末報告\n繳交方式', (250, 228, 140)), ('講座\n週四 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214))]):
        px, py = x0 + 24 + (k % 2) * 240, y0 + 24 + (k // 2) * 176; w, h = 216, 156
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 34 + j * 40, ln, F(30), (60, 50, 40))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 120
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * math.pi / 6; d.line([(cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a)), (cx + (r - 8) * math.sin(a), cy - (r - 8) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 55 * math.sin(2.6), cy - 55 * math.cos(2.6))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 90 * math.sin(0.0), cy - 90 * math.cos(0.0))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['SIGNUP']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250)); ctext(d, (x0 + x1) / 2, y0 + 14, '借用登記', F(30), (40, 40, 40))
    for k in range(7): yy = y0 + 64 + k * 40; d.line([(x0 + 14, yy), (x1 - 14, yy)], fill=(150, 150, 150), width=2)
    d.line([(x0 + 84, y0 + 64), (x0 + 84, y1 - 40)], fill=(150, 150, 150), width=2)
    for k, w in enumerate([120, 0, 90, 0, 0, 0]):
        if w: d.line([(x0 + 100, y0 + 88 + k * 40), (x0 + 100 + w, y0 + 86 + k * 40)], fill=(40, 60, 140), width=4)
    im.save(os.path.join(GEN, 'wancai_sema_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = 'wancai_sema'; self.T = {'name': '法律系館B 研討室 A', 'sub': '研討室'}; self.S = dict(trim='#5a4a3e', wainH=0.9)
        self.W, self.D = 9.0, 6.6; self.X0, self.X1, self.Z0, self.Z1 = -4.5, 4.5, -3.3, 3.3
        self.rng = random.Random(2027); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(self.sid, props={'kind': 'wancai_sema', 'layout': 'wancai_sema.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr('wancai_sema_floor', 'laminate_floor_02', tile=1.4, target='#cdb594', contrast=0.7, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.45),   # 地板改淺色（使用者 10-23：不要深色木地板，整個遊戲都不要；ART-NO-DARK-WOOD-1023）
            'wall': L.pbr('wancai_sema_wall', 'painted_plaster_wall', tile=2.0, target='#ece7dc', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr('wancai_sema_wain', 'walnut_veneer', tile=0.9, target='#7a5a40', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'wood': L.pbr('wancai_sema_wood', 'wood_table_001', tile=1.1, target='#8e6a4a', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.4),
            'vc': L.vc_material('wancai_sema_vc', rough=0.6), 'vcm': L.vc_metal('wancai_sema_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45), 'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')), 'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr('wancai_sema_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),   # 單面朝下（10-22：原本雙面朝上，鏡頭比天花板高 1 cm，拉遠是一大片白）
            'print': img_mat('wancai_sema_print', 'wancai_sema_print.png', rough=0.55), 'screen': img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
            'board': L.flat('wancai_sema_whiteboard', '#f6f8f8', rough=0.15),
        }
        self.vc = CMesh('wancai_sema_props', M['vc']); self.vm = CMesh('wancai_sema_metal', M['vcm'])
        self.wood = Mesh('wancai_sema_woodparts', M['wood']); self.steel = Mesh('wancai_sema_steel', M['steel'])
        self.tube = Mesh('wancai_sema_tubes', M['tube']); self.warm = Mesh('wancai_sema_warm', M['warm']); self.fridgel = Mesh('wancai_sema_glowpanel', M['fridge'])
        self.prt = Mesh('wancai_sema_prints', M['print']); self.scr = Mesh('wancai_sema_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def pq(c, side, a0, a1, y0, y1, key, inset=0.015):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


def meet_chair(c, x, z, yaw):
    """會議椅：深灰布面座墊、黑色網布椅背、扶手、鍍鉻弓形腳（不會轉）；(x, z) 是坐的位置，面向 yaw"""
    T = rot(x, z, yaw)
    rbox(c.vc, T, -0.23, 0.23, 0.42, 0.48, -0.22, 0.22, '#3e4348', r=0.03)                                  # 座墊
    rbox(c.vc, T, -0.22, 0.22, 0.56, 0.98, -0.27, -0.24, '#24272a', r=0.03)                                 # 椅背（網布）
    rbox(c.vc, T, -0.23, 0.23, 0.95, 0.99, -0.275, -0.235, '#2b2b2b', r=0.015)
    for sx in (-1, 1):
        a, b = T(sx * 0.255, -0.22), T(sx * 0.255, 0.12)
        ccyl(c.vm, (a[0], 0.0, a[1]), (a[0], 0.66, a[1]), 0.011, '#c9ced2', seg=6)                             # 後腳接扶手
        ccyl(c.vm, (b[0], 0.0, b[1]), (b[0], 0.66, b[1]), 0.011, '#c9ced2', seg=6)                             # 前腳接扶手
        ccyl(c.vm, (a[0], 0.0, a[1]), (b[0], 0.0, b[1]), 0.011, '#c9ced2', seg=6)                              # 地上的弓形腳
        rbox(c.vc, T, sx * 0.255 - 0.025, sx * 0.255 + 0.025, 0.66, 0.69, -0.22, 0.14, '#2b2b2b', r=0.01)    # 扶手墊
        c1, c2 = T(sx * 0.255, -0.24), T(sx * 0.2, -0.24); ccyl(c.vm, (c1[0], 0.6, c1[1]), (c2[0], 0.6, c2[1]), 0.01, '#c9ced2', seg=5)


def wall_chair(c, x, z, yaw):
    """靠牆的旁聽椅：灰色塑膠一體成形＋鐵腳（比會議椅簡單）"""
    T = rot(x, z, yaw)
    rbox(c.vc, T, -0.21, 0.21, 0.43, 0.46, -0.2, 0.2, '#6a7480', r=0.015)
    rbox(c.vc, T, -0.2, 0.2, 0.62, 0.86, -0.22, -0.2, '#6a7480', r=0.012)
    for lx in (-0.18, 0.18):
        for lz in (-0.17, 0.17): (px, pz) = T(lx, lz); ccyl(c.vm, (px, 0.0, pz), (px, 0.43, pz), 0.012, '#2b2b2b', seg=6)
        (a, b) = T(lx, -0.19); ccyl(c.vm, (a, 0.46, b), (a, 0.62, b), 0.012, '#2b2b2b', seg=6)


def conf_table(c, x0, x1, z0, z1):
    """長會議桌：木紋桌面（圓角）、深色桌邊、兩組板腳＋擋板、中間一條走線槽（插座蓋板）"""
    h = 0.74
    c.wood.rbox(x0, x1, h - 0.04, h, z0, z1, r=0.02, seg=2)
    c.vc.cbox(x0 + 0.02, x1 - 0.02, h - 0.07, h - 0.04, z0 + 0.02, z1 - 0.02, '#3a2c22')
    for xx in (x0 + 0.6, (x0 + x1) / 2, x1 - 0.6):
        c.vc.cbox(xx - 0.04, xx + 0.04, 0.0, h - 0.07, (z0 + z1) / 2 - 0.42, (z0 + z1) / 2 + 0.42, '#4a3a2e')     # 板腳
        c.vc.cbox(xx - 0.06, xx + 0.06, 0.0, 0.03, (z0 + z1) / 2 - 0.5, (z0 + z1) / 2 + 0.5, '#2b2b2b')
    c.vc.cbox(x0 + 0.6, x1 - 0.6, 0.3, h - 0.07, (z0 + z1) / 2 - 0.015, (z0 + z1) / 2 + 0.015, '#4a3a2e')       # 擋板
    for xx in (x0 + 1.4, (x0 + x1) / 2, x1 - 1.4):
        c.vm.cbox(xx - 0.18, xx + 0.18, h, h + 0.006, (z0 + z1) / 2 - 0.06, (z0 + z1) / 2 + 0.06, '#8a8f94')   # 插座蓋板
    c.block(x0 - 0.03, x1 + 0.03, z0 - 0.03, z1 + 0.03, 'conference_table')


def table_things(c, rr, x0, x1, z0, z1):
    """桌上散放的東西：幾本書、一疊講義、水瓶（不多，讓人坐下時不會穿模）"""
    h = 0.74
    for k in range(5):
        xx = rr.uniform(x0 + 0.5, x1 - 0.5); side = rr.choice((-1, 1)); zz = (z0 + z1) / 2 + side * rr.uniform(0.18, 0.32)
        kind = rr.random()
        if kind < 0.45:
            T = rot(xx, zz, rr.uniform(-0.3, 0.3)); rbox(c.vc, T, -0.11, 0.11, h, h + rr.uniform(0.02, 0.05), -0.15, 0.15, rr.choice(('#7a2a24', '#25425e', '#3e5a3a', '#6a5a3a')), r=0.003)
        elif kind < 0.8:
            T = rot(xx, zz, rr.uniform(-0.4, 0.4)); rbox(c.vc, T, -0.105, 0.105, h, h + 0.012, -0.148, 0.148, '#f2f0ea', r=0.002)
        else:
            clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.17), (0.02, 0.2), (0.015, 0.23), (0.0, 0.23)], xx, h, zz, '#cfe2ea', seg=10)


def law_books(c, x0, x1, z0, z1, h=2.1):
    """東牆書櫃：五層、法典（厚、紅色或深藍書背、燙金線）、判決彙編（一整排同色）、論文集；書背沒有字。
    整個書櫃跟著東牆淡出（10-20 截圖：鏡頭在東牆外面時書櫃擋住整個畫面）"""
    wd = c.wg('E', 'bookwood', c.M['wood']); bv = c.wg('E', 'books', c.M['vc'], cm=True)
    wd.box(x0, x1, 0.0, 0.08, z0, z1); wd.box(x0, x1, h - 0.03, h, z0, z1)
    wd.box(x0, x1, 0.0, h, z0, z0 + 0.02); wd.box(x0, x1, 0.0, h, z1 - 0.02, z1)
    bv.cbox(x1 - 0.015, x1, 0.08, h - 0.03, z0, z1, '#4a3a2e')   # 背板（靠牆那一面；10-20 算圖：原本放在朝房間那一面，把書遮住了）
    rr = c.rng; shelves = [0.08 + k * (h - 0.11) / 5 for k in range(6)]
    for s in range(5):
        y0 = shelves[s] + 0.02; y1 = shelves[s + 1]
        wd.box(x0, x1, y1 - 0.02, y1, z0, z1)
        zz = z0 + 0.03; run = rr.choice(('code', 'reports', 'mixed'))
        while zz < z1 - 0.06:
            if run == 'reports': t, hh, col = 0.045, (y1 - y0) * 0.86, '#2e3e5a'
            elif run == 'code': t, hh, col = rr.uniform(0.06, 0.09), (y1 - y0) * rr.uniform(0.78, 0.9), rr.choice(('#7a2420', '#7a2420', '#23324e'))
            else: t, hh, col = rr.uniform(0.025, 0.05), (y1 - y0) * rr.uniform(0.6, 0.88), rr.choice(('#e8e2d2', '#5a6a4a', '#8a6a3a', '#3a3a3a', '#a8463a'))
            if zz + t > z1 - 0.03: break
            bv.cbox(x0 + 0.04, x1 - 0.02, y0, y0 + hh, zz, zz + t - 0.004, col)
            if run != 'mixed': bv.cbox(x1 - 0.021, x1 - 0.018, y0 + hh * 0.78, y0 + hh * 0.8, zz + 0.006, zz + t - 0.01, '#c9a64a')   # 燙金線
            zz += t
            if rr.random() < 0.04: zz += 0.12
        if s == 2: rbox(bv, rot(x1 - 0.15, z0 + 0.35, 0.2), -0.06, 0.06, y0, y0 + 0.025, -0.03, 0.03, '#2b2b2b', r=0.008)   # 投影機遙控器
    c.block(x0 - 0.03, x1, z0, z1, 'bookcase')


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = c.rng
    fl = Mesh('wancai_sema_floorm', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh('wancai_sema_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)   # 朝下
    wh = 0.9
    # +z（S）：一排窗（窗洞中心 2.1 m、2.2 × 1.6；和霖澤館 3F 同一套）
    WX = [-2.6, 0.0, 2.6]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x（room() 的 front 牆 x 是反的）；窗外的景用遊戲裡拍的照片')
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
        # 捲簾（拉上來的：窗頂一條）
        fr.cbox(a + 0.05, b - 0.05, wy1 + 0.02, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#e6e2d8')
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊那一側）：門（靠東 x 3.2）、門牌、公告欄、旁聽椅
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood'])
    dx, dw = 3.2, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh))
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((X0, d0), (d1, X1)): tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#4a3a2e')
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0 + 0.0, Z0 + 0.04, r=0.004, seg=1)                     # 門片（關著；玩家出入用互動點）
    tr.cbox(dx - dw / 2 + 0.08, dx - dw / 2 + 0.18, 1.0, 1.04, Z0 + 0.04, Z0 + 0.09, '#c9ced2')                          # 門把（跟著牆淡出）
    tr.cbox(dx - 0.2, dx + 0.2, 1.4, 1.85, Z0 + 0.04, Z0 + 0.045, '#2a2e33')                                             # 門上小窗（外面是走廊，暗的）
    K.frame_board(c, 'N', -4.0, -2.4, 1.15, 1.95, '#5a4030'); pq(c, 'N', -4.0, -2.4, 1.15, 1.95, 'NOTICE', inset=0.014)
    K.frame_board(c, 'N', 1.55, 2.35, 1.3, 2.0, '#4a3a2e'); pq(c, 'N', 1.55, 2.35, 1.3, 2.0, 'SIGNUP', inset=0.014)
    pq(c, 'N', -1.6, -0.6, 2.35, 3.0, 'CLOCK', inset=0.016)
    for x in (-1.9, -1.1, -0.3, 0.5, 1.3):   # 椅背靠牆；碰撞框只到椅子中間，走近點在椅子前面 0.5 m（10-20 流程測試：碰撞框太深時走近點在 0.8 m，剛好在按鈕範圍的邊上）
        z = Z0 + 0.34; wall_chair(c, x, z, 0.0); c.seat(x, z, 0.0, (x, z + 0.6), 'sit', ap=(x, z + 0.5), label='坐旁聽席'); c.seats[-1]['uses'] = ['旁聽', '等人']
    c.block(-2.2, 1.6, Z0, Z0 + 0.42, 'wall_chairs')
    # 西牆：白板（兩片）、投影幕（收起來）、講者的位置
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); bm = c.wg('W', 'board', M['board'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)])
    tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    tr.cbox(X0, X0 + 0.03, 0.95, 2.3, -2.3, 2.3, '#b9bec2'); bm.quad([(X0 + 0.032, 1.0, 2.25), (X0 + 0.032, 1.0, -2.25), (X0 + 0.032, 2.25, -2.25), (X0 + 0.032, 2.25, 2.25)])
    pq(c, 'W', -2.2, 2.2, 1.02, 2.23, 'BOARD', inset=0.034)
    tr.cbox(X0, X0 + 0.09, 0.93, 0.96, -2.2, 2.2, '#9aa0a4')                                                              # 筆槽
    for k, col in enumerate(('#202020', '#1a3a8a', '#a02020')): tr.cbox(X0 + 0.03, X0 + 0.08, 0.96, 0.98, -1.6 + k * 0.14, -1.48 + k * 0.14, col)   # 白板筆（跟著牆淡出：10-20 截圖，牆藏起來時飄在半空中）
    tr.cbox(X0 + 0.03, X0 + 0.09, 0.96, 1.0, -1.1, -0.95, '#3a3f44')                                                       # 板擦
    tr.cbox(X0, X0 + 0.14, 2.82, 2.92, -1.3, 1.3, '#e8e8e4')                                                              # 投影幕的捲軸（收起來）
    c.vc.crbox(-1.6, -1.2, 2.98, 3.08, -0.2, 0.2, '#e8e8e4', r=0.01, seg=1); c.vm.cbox(-1.42, -1.38, 3.08, H, -0.02, 0.02, '#9aa0a4')   # 吊掛的投影機
    c.fridgel.box(-1.605, -1.6, 3.0, 3.05, -0.06, 0.06)
    # 東牆：書櫃（法典、判決彙編、論文集）＋冷氣、盆栽
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)])
    tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#4a3a2e')
    law_books(c, X1 - 0.38, X1, -0.9, 2.2)
    K.ac_unit(c, X1, 2.6, -1.9, '-x', w=0.9, fade=True)
    plant(c, X1 - 0.4, Z1 - 0.7, 1.2); c.block(X1 - 0.65, X1, Z1 - 0.95, Z1 - 0.45, 'plant')
    c.vc.crbox(X0 + 0.15, X0 + 0.45, 0.0, 0.55, Z1 - 0.75, Z1 - 0.45, '#3f6fb0', r=0.03, seg=1); c.block(X0, X0 + 0.5, Z1 - 0.8, Z1 - 0.4, 'bin')   # 回收桶
    # 會議桌（中間偏西，西端留講者的位置）＋13 張會議椅
    tx0, tx1, tz0, tz1 = -2.9, 2.3, -0.65, 0.65
    conf_table(c, tx0, tx1, tz0, tz1); table_things(c, rr, tx0, tx1, tz0, tz1)
    for x in (-2.3, -1.45, -0.6, 0.25, 1.1, 1.85):
        for s_ in (-1, 1):
            z = s_ * 1.07; yaw = 0.0 if s_ < 0 else PI
            meet_chair(c, x, z, yaw); c.seat(x, z, yaw, (x, 0.0), 'class', label='坐下'); c.seats[-1]['uses'] = ['上課', '讀書會', '討論']
    meet_chair(c, tx1 + 0.45, 0.0, -PI / 2); c.seat(tx1 + 0.45, 0.0, -PI / 2, (tx1, 0.0), 'class', label='坐下'); c.seats[-1]['uses'] = ['上課', '讀書會', '討論']
    c.clerk = dict(x=round(X0 + 0.75, 3), z=0.0, yaw=round(PI / 2, 4), note='teacherSpot：老師或報告的人站的位置（白板前、會議桌西端；clerk 欄位沿用店員的格式）')
    c.teacher = dict(c.clerk)
    # 燈、天花板
    for x in (-2.8, 0.0, 2.8):
        for z in (-1.7, 1.7):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    c.look('board', round(X0 + 0.9, 3), 1.6, 0.9, '白板', '', dev='白板上的字由事件或課堂決定；遊戲裡顯示的字等 AA 寫')
    c.look('books', round(X1 - 0.9, 3), 0.65, 0.9, '書櫃', '', dev='法典、判決彙編、論文集（書背沒有字）；遊戲裡顯示的字等 AA 寫')
    c.look('signup', 1.95, round(Z0 + 0.75, 3), 0.7, '借用登記表', '', dev='研討室的借用登記表；遊戲裡顯示的字等 AA 寫')
    c.door = dict(x=dx, w=dw, z=Z0, note='−z 那一面靠東；從萬才館 2F 北側走廊的「研討室 A」門（wancai_layout.js doors.seminarA，lv 1、x −3.0）進來')
    c.spawn = dict(x=dx, z=round(Z0 + 1.45, 3), yaw=0.0, note='進門、面向房間裡（+z）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='離開研討室', to='wancai', spawn_note='回到萬才館 2F 北側走廊、研討室 A 的門前面（wancai_layout.js doors.seminarA 的 x，lv 1）')]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain', 'door', 'bookwood'), merge=key not in ('print', 'screen', 'view'))
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, 'wancai_sema.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone='wancai_sema', name='法律系館B 研討室 A', type='研討室', src='使用者 10-20 第二項；LAWWW-C 15:51 回覆 Q2（WANCAI-SEMA）',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.2, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins,
               counter=None, clerk=c.clerk, teacherSpot=c.teacher, order=None, seats=c.seats, interact=c.inter, blocks=c.blocks,
               host_door=dict(zone='wancai', id='seminarA', lv=1, note='wancai_layout.js 的 doors.seminarA：拿掉 closed、加 to，出生點用這裡的 spawn；上課、社課從「門口上課」改成走進來由 LAWWW-C 改'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, 'wancai_sema.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout='wancai_sema.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': 'wancai_sema', 'tris': tris, 'seats': len(c.seats), 'ap': lay['navcheck']['ap'], 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('WANCAI_SEMA', 'OK' if not p else p)
