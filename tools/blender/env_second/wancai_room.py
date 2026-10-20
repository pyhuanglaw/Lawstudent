"""萬才館 1F 多功能教室（LINZE-WANCAI-FLOORS-1020；使用者 10-20：「霖澤館3-8樓為什麼永遠都在蓋 萬才也是阿」、X78「為什麼法律系的課都在霖澤館 萬才呢?」）
→ 能上課的平面教室：assets/models/env/second_ai/wancai_room.glb＋wancai_room.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/wancai_room.py [-- --out-dir assets/models/env/second_ai]
萬才館大廳北牆的「多功能教室」（src/data/wancai_layout.js 的 doors.multi，x 2.0）進來。區域自己的座標：x −5.5…5.5、z −4.25…4.25，
  門在南牆（+z，靠東），講台、白板、投影幕在北牆，東牆一排窗（窗洞 2.2 × 1.6、中心 2.1 m，和遊戲 room() 的窗一樣：窗外的景由遊戲換）。
學生座位：三排雙人課桌（固定的長桌＋課椅），每張桌子坐兩個人，一共 24 位；老師站在講台後面（clerk 欄位）。
做法和 118 巷的店、霖澤館 3F 一樣（lane118_shops.py 的共用零件；遊戲端 Z3.room＋attachRoomGLB）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, g2b, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, plant, counter, navcheck, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
H = 3.4; K.H = H
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'PLATE': (0, 0, 512, 128), 'RULES': (512, 0, 1024, 384), 'BOARD': (0, 128, 512, 640), 'SCREEN': (512, 384, 1024, 672), 'NOTICE': (0, 640, 512, 1024), 'CLOCK': (512, 672, 768, 928)}


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """門牌、教室使用規則、白板上的字（虛構：沒有真實課號、姓名）、投影幕、公告、時鐘"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 26, '萬才館 多功能教室', F(60), (240, 240, 236))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(90, 60, 50))
    ctext(d, (x0 + x1) / 2, y0 + 12, '教室使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['上課時請把手機調成靜音', '離開時關燈、關冷氣', '飲料請放在桌下', '借用請到學院辦公室登記', '投影機遙控器在講桌抽屜']):
        d.text((x0 + 30, y0 + 90 + k * 54), '・' + ln, font=F(32), fill=(50, 50, 46))
    x0, y0, x1, y1 = REG['BOARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 250, 250))
    for k, (ln, col) in enumerate([('今天的進度', (30, 60, 160)), ('一、上週的問題', (40, 40, 40)), ('二、案例討論', (40, 40, 40)), ('三、下週報告分組', (40, 40, 40)), ('→ 每組四個人', (180, 40, 40))]):
        d.text((x0 + 30 + (0 if k == 0 else 20), y0 + 30 + k * 88), ln, font=F(48 if k == 0 else 40), fill=col)
    x0, y0, x1, y1 = REG['SCREEN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(236, 240, 244)); d.rectangle([x0 + 20, y0 + 20, x1 - 21, y0 + 80], fill=(40, 70, 120))
    d.text((x0 + 40, y0 + 30), '第三週', font=F(40), fill=(255, 255, 255))
    for k in range(4): d.rectangle([x0 + 40, y0 + 110 + k * 40, x0 + 40 + (380 - k * 50), y0 + 126 + k * 40], fill=(150, 160, 175))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    for k, (t, col) in enumerate([('借用登記表\n（今天：空）', (250, 250, 250)), ('期中考\n考場公告', (250, 228, 140)), ('講座\n週三 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214))]):
        px, py = x0 + 24 + (k % 2) * 240, y0 + 24 + (k // 2) * 176; w, h = 216, 156
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 34 + j * 40, ln, F(30), (60, 50, 40))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 120
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * math.pi / 6; d.line([(cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a)), (cx + (r - 8) * math.sin(a), cy - (r - 8) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 55 * math.sin(-0.5), cy - 55 * math.cos(-0.5))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 90 * math.sin(2.1), cy - 90 * math.cos(2.1))], fill=(30, 30, 30), width=6)
    im.save(os.path.join(GEN, 'wancai_room_print.png'))


class Room(K.Shop):
    def __init__(self):
        self.sid = 'wancai_room'; self.T = {'name': '萬才館 多功能教室', 'sub': '教室'}; self.S = dict(trim='#5a4a3e', wainH=1.0)
        self.W, self.D = 11.0, 8.5; self.X0, self.X1, self.Z0, self.Z1 = -5.5, 5.5, -4.25, 4.25
        self.rng = random.Random(2026); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(self.sid, props={'kind': 'wancai_room', 'layout': 'wancai_room.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr('wancai_room_floor', 'floor_tiles_06', tile=0.9, target='#c4c0b6', contrast=0.5, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.35),
            'wall': L.pbr('wancai_room_wall', 'painted_plaster_wall', tile=2.0, target='#ede9e0', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr('wancai_room_wain', 'walnut_veneer', tile=0.9, target='#8a6a4c', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'wood': L.pbr('wancai_room_wood', 'wood_table_001', tile=0.9, target='#b08a62', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material('wancai_room_vc', rough=0.6), 'vcm': L.vc_metal('wancai_room_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45), 'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')), 'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr('wancai_room_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9),
            'print': img_mat('wancai_room_print', 'wancai_room_print.png', rough=0.55), 'screen': img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
            'board': L.flat('wancai_room_whiteboard', '#f6f8f8', rough=0.15),
        }
        self.vc = CMesh('wancai_room_props', M['vc']); self.vm = CMesh('wancai_room_metal', M['vcm'])
        self.wood = Mesh('wancai_room_woodparts', M['wood']); self.steel = Mesh('wancai_room_steel', M['steel'])
        self.tube = Mesh('wancai_room_tubes', M['tube']); self.warm = Mesh('wancai_room_warm', M['warm']); self.fridgel = Mesh('wancai_room_glowpanel', M['fridge'])
        self.prt = Mesh('wancai_room_prints', M['print']); self.scr = Mesh('wancai_room_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def pq(c, side, a0, a1, y0, y1, key, inset=0.015):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


def class_chair(c, x, z, yaw):
    """課椅：灰色塑膠一體成形的座面＋椅背、黑色鐵腳"""
    T = rot(x, z, yaw)
    rbox(c.vc, T, -0.21, 0.21, 0.43, 0.46, -0.2, 0.2, '#5a6470', r=0.015)
    rbox(c.vc, T, -0.2, 0.2, 0.62, 0.86, -0.22, -0.2, '#5a6470', r=0.012)
    for lx in (-0.18, 0.18):
        for lz in (-0.17, 0.17): (px, pz) = T(lx, lz); ccyl(c.vm, (px, 0.0, pz), (px, 0.43, pz), 0.012, '#2b2b2b', seg=6)
        (a, b) = T(lx, -0.19); ccyl(c.vm, (a, 0.46, b), (a, 0.62, b), 0.012, '#2b2b2b', seg=6)


def desk(c, cx, cz, w=1.4, d=0.5):
    """雙人課桌（木紋桌面、前擋板、鐵腳、桌下置物網）"""
    c.wood.rbox(cx - w / 2, cx + w / 2, 0.72, 0.75, cz - d / 2, cz + d / 2, r=0.006, seg=1)
    c.vc.cbox(cx - w / 2 + 0.03, cx + w / 2 - 0.03, 0.35, 0.72, cz - d / 2, cz - d / 2 + 0.02, '#8a8f94')   # 前擋板（朝講台那一面）
    for sx in (-1, 1): c.vm.cbox(cx + sx * (w / 2 - 0.05) - 0.02, cx + sx * (w / 2 - 0.05) + 0.02, 0.0, 0.72, cz - d / 2 + 0.03, cz + d / 2 - 0.03, '#2b2b2b')
    c.vm.cbox(cx - w / 2 + 0.06, cx + w / 2 - 0.06, 0.55, 0.57, cz - d / 2 + 0.03, cz + d / 2 - 0.08, '#4a4f54')                 # 置物網
    c.block(cx - w / 2 - 0.03, cx + w / 2 + 0.03, cz - d / 2 - 0.03, cz + d / 2 + 0.03, 'desk')


def build():
    c = Room(); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    fl = Mesh('wancai_room_floorm', M['floor'], tile=0.9); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh('wancai_room_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z1), (X1, H, Z1), (X1, H, Z0), (X0, H, Z0)]); ce.finish(c.root)
    wh = 1.0
    # 北牆（講台那一面）、西牆：木頭腰牆＋白牆
    for k in 'NW':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain']); tr = c.wg(k, 'trim', M['vc'], cm=True)
        if k == 'N': wl.quad([(X0, wh, Z0), (X1, wh, Z0), (X1, H, Z0), (X0, H, Z0)]); wn.quad([(X0, 0, Z0), (X1, 0, Z0), (X1, wh, Z0), (X0, wh, Z0)]); tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#5a4a3e')
        else: wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)]); tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, '#5a4a3e')
    # 東牆：一排窗（窗洞中心 2.1 m、2.2 × 1.6）
    WZ = [-2.4, 0.4, 3.0]; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='E', wall='right', x=X1, zs=WZ, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝right（+x 那一面）；winXs 照 room() 的換算（right 牆的 x 是 z 方向，正負請照 room() 的 at() 確認）')
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); fr = c.wg('E', 'frame', M['vcm'], cm=True); gl = c.wg('E', 'glass', M['glass']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    QE = lambda za, zb, y0, y1: [(X1, y0, za), (X1, y0, zb), (X1, y1, zb), (X1, y1, za)]
    zs = [Z0] + [v for wz in WZ for v in (wz - 1.1, wz + 1.1)] + [Z1]
    for k in range(0, len(zs), 2): wl.quad(QE(zs[k], zs[k + 1], wh, H))
    wn.quad(QE(Z0, Z1, 0.0, wh)); tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#5a4a3e')
    for wz in WZ:
        a, b = wz - 1.1, wz + 1.1; wl.quad(QE(a, b, wh, wy0)); wl.quad(QE(a, b, wy1, H))
        fr.cbox(X1 - 0.3, X1, wy0 - 0.03, wy0, a, b, '#d9d6cf')
        for (za, zb) in ((a, a + 0.05), (b - 0.05, b), (wz - 0.025, wz + 0.025)): fr.cbox(X1 - 0.08, X1 - 0.03, wy0, wy1, za, zb, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(X1 - 0.085, X1 - 0.035, ya, yb, a, b, '#a9aeb2')
        gl.quad([(X1 - 0.055, wy0, a), (X1 - 0.055, wy0, b), (X1 - 0.055, wy1, b), (X1 - 0.055, wy1, a)])
    c.block(X1 - 0.32, X1, Z0, Z1, 'window_sill')
    # 南牆：門（靠東，x 4.2），門牌、公告欄
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); tr = c.wg('S', 'trim', M['vc'], cm=True); wd = c.wg('S', 'door', M['wood'])
    dx, dw = 4.2, 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QS(xa, xb, wh, H)); wn.quad(QS(xa, xb, 0.0, wh))
    wl.quad(QS(d0, d1, 2.2, H))
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z1 - 0.06, Z1, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z1 - 0.06, Z1, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx - 0.01, 0.0, 2.11, Z1 - 0.04, Z1 - 0.0, r=0.004, seg=1)                                  # 門片（開一半：右邊那一扇推開）
    T = rot(dx + 0.02, Z1 - 0.04, -PI / 2 + 0.6); rbox(c.wood, T, 0.0, 0.48, 0.0, 2.11, -0.02, 0.02)
    tr.cbox(d0 - 0.65, d0 - 0.2, 1.7, 1.86, Z1 - 0.016, Z1, '#40464c'); pq(c, 'S', d0 - 0.64, d0 - 0.21, 1.71, 1.85, 'PLATE', inset=0.018)   # 門牌（門的西邊）
    K.frame_board(c, 'S', -3.2, -1.2, 1.2, 1.95, '#6a4a30'); pq(c, 'S', -3.2, -1.2, 1.2, 1.95, 'NOTICE', inset=0.014)
    K.frame_board(c, 'S', 0.2, 1.4, 1.3, 2.0, '#5a4a3e'); pq(c, 'S', 0.2, 1.4, 1.3, 2.0, 'RULES', inset=0.014)
    # 講台那一面：白板（兩片）、投影幕（拉下來一半）、講桌、老師的位子、時鐘
    bm = c.wg('N', 'board', M['board']); tr = c.wg('N', 'trim', M['vc'], cm=True)
    tr.cbox(-3.9, 3.9, 0.95, 2.35, Z0, Z0 + 0.03, '#b9bec2'); bm.quad([(-3.85, 1.0, Z0 + 0.032), (3.85, 1.0, Z0 + 0.032), (3.85, 2.3, Z0 + 0.032), (-3.85, 2.3, Z0 + 0.032)])
    tr.cbox(-3.8, 3.8, 0.93, 0.96, Z0, Z0 + 0.09, '#9aa0a4')                                                                    # 筆槽
    pq(c, 'N', -3.6, -0.6, 1.1, 2.2, 'BOARD', inset=0.034)
    tr.cbox(0.2, 3.6, 2.92, 3.02, Z0, Z0 + 0.14, '#e8e8e4'); tr.cbox(0.25, 3.55, 2.0, 2.92, Z0 + 0.06, Z0 + 0.065, '#f4f4f2')  # 投影幕（拉下來一半）
    pq(c, 'N', 0.35, 3.45, 2.06, 2.86, 'SCREEN', inset=0.068)
    tr.cbox(0.25, 3.55, 1.98, 2.01, Z0 + 0.05, Z0 + 0.08, '#2b2b2b')
    c.vc.crbox(1.6, 2.0, 3.16, 3.26, -1.0, -0.6, '#e8e8e4', r=0.01, seg=1); c.vm.cbox(1.78, 1.82, 3.26, H, -0.82, -0.78, '#9aa0a4')   # 吊掛的投影機
    c.fridgel.box(1.74, 1.86, 3.18, 3.23, -1.005, -1.0)
    pq(c, 'N', -5.2, -4.4, 2.5, 3.2, 'CLOCK', inset=0.016)
    # 講桌（講台在老師的位子前面）
    c.vc.crbox(-0.55, 0.55, 0.0, 1.05, Z0 + 1.0, Z0 + 1.55, '#6a5040', r=0.01, seg=1); c.wood.rbox(-0.6, 0.6, 1.05, 1.1, Z0 + 0.95, Z0 + 1.6, r=0.01, seg=2)
    c.vc.cbox(-0.25, 0.25, 1.1, 1.13, Z0 + 1.15, Z0 + 1.45, '#2b2b2b'); c.vc.cbox(-0.24, 0.24, 1.13, 1.43, Z0 + 1.43, Z0 + 1.45, '#202225')   # 筆電
    uvquad(c.scr, [(0.22, 1.15, Z0 + 1.428), (-0.22, 1.15, Z0 + 1.428), (-0.22, 1.41, Z0 + 1.428), (0.22, 1.41, Z0 + 1.428)], K.TX.uv(K.TX.SCR, 'pos'))
    ccyl(c.vm, (0.4, 1.1, Z0 + 1.2), (0.45, 1.45, Z0 + 1.35), 0.008, '#2b2b2b', seg=5); csph(c.vc, (0.45, 1.47, Z0 + 1.36), 0.025, '#2b2b2b', seg=8, rings=5)   # 麥克風
    c.block(-0.63, 0.63, Z0, Z0 + 1.63, 'lectern')
    c.counter = dict(x0=-0.55, x1=0.55, z0=Z0 + 1.0, z1=Z0 + 1.55, h=1.05, note='講桌')
    c.clerk = dict(x=0.0, z=round(Z0 + 0.55, 3), yaw=0.0, note='老師站的位置：講桌後面、面向學生（clerk 欄位沿用店員的格式）')
    # 學生座位：三排雙人課桌、四列（24 位），面向講台（北）
    for cx in (-3.6, -0.6, 2.4):                                                                   # 東邊留一條 2 m 的走道（門在東邊）
        for cz in (-1.3, 0.1, 1.5, 2.9):
            desk(c, cx, cz)
            for sx in (-0.35, 0.35):
                x, z = cx + sx, cz + 0.55; class_chair(c, x, z, PI); c.seat(x, z, PI, (x, cz), 'class', label='坐下')
    # 燈、冷氣、垃圾桶、盆栽
    for x in (-3.4, 0.0, 3.4):
        for z in (-2.6, 0.2, 3.0):
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    K.ac_unit(c, X0, 2.65, 0.0, '+x', w=1.0)
    c.vc.crbox(X0 + 0.1, X0 + 0.45, 0.0, 0.6, Z1 - 0.55, Z1 - 0.2, '#3f6fb0', r=0.03, seg=1); c.block(X0, X0 + 0.48, Z1 - 0.58, Z1, 'bin')
    plant(c, X0 + 0.45, Z0 + 0.5, 1.1)
    c.look('board', -2.0, Z0 + 1.6, 0.9, '白板', '白板上寫著今天的進度（說明文字由 AA 寫）')
    c.look('notice', -2.2, Z1 - 0.7, 0.8, '公告欄', '借用登記表、考場公告（說明文字由 AA 寫）')
    c.door = dict(x=dx, w=dw, z=Z1, note='南牆靠東；從萬才館大廳北牆的「多功能教室」（wancai_layout.js doors.multi，x 2.0）進來')
    c.spawn = dict(x=dx, z=round(Z1 - 1.5, 3), yaw=PI, note='進門、面向教室裡（北）')
    c.exits = [dict(x=dx, z=round(Z1 - 0.45, 3), r=0.7, label='離開教室', to='wancai', spawn_note='回到萬才館大廳、多功能教室的門前面（wancai_layout.js doors.multi 的 x，lv 0）')]
    # 收尾（和 lane118_shops.finish 一樣，配置的欄位換成教室的）
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain', 'door'), merge=key not in ('print', 'screen', 'view'))
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, 'wancai_room.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone='wancai_room', name='萬才館 多功能教室', type='教室', src='使用者 10-20（X73、X78）；LINZE-WANCAI-FLOORS-1020',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.4, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins,
               counter=c.counter, clerk=c.clerk, order=None, seats=c.seats, interact=c.inter, blocks=c.blocks,
               wancai_door=dict(id='multi', note='wancai_layout.js 的 doors.multi：拿掉 closed、加 to:"wancai_room"，出生點用這裡的 spawn'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, 'wancai_room.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout='wancai_room.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': 'wancai_room', 'tris': tris, 'seats': len(c.seats), 'ap': lay['navcheck']['ap'], 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    make_tex(); p = build(); print('WANCAI_ROOM', 'OK' if not p else p)
