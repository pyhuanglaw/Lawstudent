"""平面教室（LINZE-WANCAI-FLOORS-1020；LAWWW-C 10-20 15:51 回覆：霖澤館 202 開成第二間平面教室、萬才館多功能教室要能走進去）
→ 室內區域的 GLB＋配置：assets/models/env/second_ai/<id>.glb＋<id>.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/flat_classroom.py [-- --room linze_202|wancai_multi|all] [--out-dir assets/models/env/second_ai]
兩間都是同一套做法（取代 10-20 的草稿 wancai_room.py）：房間自己的座標，
  −z 那一面是走廊（門在後面靠東）、+z 那一面一排窗（窗洞 2.2 × 1.6、中心 2.1 m，和遊戲 room() 的 front 窗一樣）；
  講台、白板、投影幕在西牆（−x），學生面向西（窗在學生的左手邊）；後面（東牆）是公告欄、置物櫃。
  每排兩張長桌（一張 4 位），中間一條走道；排和排相距 1.9 m（和 201 階梯教室一樣的道理：導航格 0.4 m 量化之後，椅子後面要站得住、走得過去，
  玩家和 NPC 從中間走道、前後的橫走道走進每一排）；講台前留老師走動的空間。
  linze_202：霖澤館 2F 的 202（linze_layout.js doors.c202，x 3.0）：13.6 × 9.6 m、5 排 40 位（courses.js 的 LINZE 8 門課由 LAWWW-C 搬過來）；
  wancai_multi：萬才館 1F 的多功能教室（wancai_layout.js doors.multi，x 2.0）：11.6 × 9.0 m、4 排 32 位（吉他社的社課；講台前的空地比較大）。
做法和霖澤館 3F、118 巷的店一樣（lane118_shops.py 的共用零件；遊戲端 Z3.room＋attachRoomGLB）。白板是擦過的（字由遊戲或事件決定）。"""
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
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'PLATE': (0, 0, 512, 128), 'RULES': (512, 0, 1024, 384), 'BOARD': (0, 128, 512, 640), 'NOTICE': (0, 640, 512, 1024), 'CLOCK': (512, 672, 768, 928), 'EXIT': (768, 672, 1024, 768)}
ROOMS = {
    'linze_202': dict(name='霖澤館 202 教室', plate='202 教室', W=13.6, D=9.6, H=3.4, door_x=5.9, wins=[-4.0, -0.4, 3.2], rows=[-3.4, -1.5, 0.4, 2.3, 4.2], tables=[(-3.6, -0.8), (0.8, 3.6)],
                      floor=('large_floor_tiles_02', '#c9c3b6'), wain='#7a6450', back='lockers', src='LAWWW-C 10-20 15:51 回覆 Q1（B：開成第二間平面教室）', door_id='c202', host='linze', host_lv=1, view='linze_201'),   # 窗景用 201 的（同一層樓；往北拍到的是很近的背景大樓牆）
    'wancai_multi': dict(name='萬才館 多功能教室', plate='多功能教室', W=11.6, D=9.0, H=3.4, door_x=4.8, wins=[-3.2, 0.0, 3.2], rows=[-2.2, -0.3, 1.6, 3.5], tables=[(-3.4, -0.6), (0.6, 3.4)],
                         floor=('floor_tiles_06', '#c4c0b6'), wain='#8a6a4c', back='shelf', src='LAWWW-C 10-20 15:51 回覆 Q2（多功能教室走進去：吉他社）', door_id='multi', host='wancai', host_lv=0),
}


def F(n): return ImageFont.truetype(CJK, n)
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)
def ctext(d, cx, y, t, f, fill): w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex(rid, R):
    """門牌、教室使用須知、白板（擦過的淡字跡）、公告欄、時鐘、安全門標示（虛構：沒有真實課號、姓名）"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 26, R['plate'], F(64), (240, 240, 236))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(90, 60, 50))
    ctext(d, (x0 + x1) / 2, y0 + 12, '教室使用須知', F(40), (255, 255, 255))
    lines = ['上課時請把手機調成靜音', '離開時關燈、關冷氣', '飲料請放在桌下', '借用請到學院辦公室登記', '投影機遙控器在講桌抽屜'] if rid == 'linze_202' else \
            ['社團借用請先登記', '練習結束請把桌椅排回原位', '音量請在晚上九點前降低', '離開時關燈、關冷氣', '樂器不可留在教室過夜']
    for k, ln in enumerate(lines): d.text((x0 + 30, y0 + 90 + k * 54), '・' + ln, font=F(32), fill=(50, 50, 46))
    x0, y0, x1, y1 = REG['BOARD']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 248, 248))
    ghost = Image.new('L', (x1 - x0, y1 - y0), 0); gd = ImageDraw.Draw(ghost); rr = random.Random(11 if rid == 'linze_202' else 13)
    for k in range(9):
        y = 40 + k * 50; xx = 30 + rr.randint(0, 40)
        while xx < (x1 - x0) - 60:
            w = rr.randint(20, 70); gd.line([(xx, y + rr.randint(-4, 4)), (xx + w, y + rr.randint(-4, 4))], fill=rr.randint(30, 70), width=rr.randint(5, 9)); xx += w + rr.randint(8, 30)
    ghost = ghost.filter(ImageFilter.GaussianBlur(5)); base = im.crop((x0, y0, x1, y1)); tint = Image.new('RGB', base.size, (150, 160, 175)); im.paste(Image.composite(tint, base, ghost), (x0, y0))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    notes = [('期中考\n考場公告', (250, 228, 140)), ('借用登記表', (250, 250, 250)), ('講座\n週三 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214))] if rid == 'linze_202' else \
            [('社團借用\n時段表', (250, 250, 250)), ('成果發表\n報名', (250, 228, 140)), ('講座\n週四 18:30', (210, 232, 246)), ('失物招領', (232, 246, 214))]
    for k, (t, col) in enumerate(notes):
        px, py = x0 + 24 + (k % 2) * 240, y0 + 24 + (k // 2) * 176; w, h = 216, 156
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 34 + j * 40, ln, F(30), (60, 50, 40))
    x0, y0, x1, y1 = REG['CLOCK']; cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, 120
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 242)); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(40, 40, 40), width=8)
    for k in range(12): a = k * math.pi / 6; d.line([(cx + (r - 22) * math.sin(a), cy - (r - 22) * math.cos(a)), (cx + (r - 8) * math.sin(a), cy - (r - 8) * math.cos(a))], fill=(40, 40, 40), width=6)
    d.line([(cx, cy), (cx + 55 * math.sin(0.4), cy - 55 * math.cos(0.4))], fill=(30, 30, 30), width=10); d.line([(cx, cy), (cx + 90 * math.sin(3.4), cy - 90 * math.cos(3.4))], fill=(30, 30, 30), width=6)
    x0, y0, x1, y1 = REG['EXIT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(30, 140, 70)); ctext(d, (x0 + x1) / 2, y0 + 26, '安全門 →', F(40), (255, 255, 255))
    im.save(os.path.join(GEN, f'{rid}_print.png'))


class Room(K.Shop):
    def __init__(self, rid, R):
        self.sid = rid; self.R = R; self.T = {'name': R['name'], 'sub': '教室'}; self.S = dict(trim='#5a4a3e', wainH=1.0)
        self.W, self.D = R['W'], R['D']; self.X0, self.X1, self.Z0, self.Z1 = -R['W'] / 2, R['W'] / 2, -R['D'] / 2, R['D'] / 2
        self.rng = random.Random(hash(rid) & 0xffff); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(rid, props={'kind': rid, 'layout': f'{rid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        fid, ftgt = R['floor']
        self.M = M = {
            'floor': L.pbr(f'{rid}_floor', fid, tile=0.9, target=ftgt, contrast=0.5, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.35),
            'wall': L.pbr(f'{rid}_wall', 'painted_plaster_wall', tile=2.0, target='#ede9e0', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{rid}_wain', 'walnut_veneer', tile=0.9, target=R['wain'], contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'wood': L.pbr(f'{rid}_wood', 'wood_table_001', tile=0.9, target='#b08a62', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material(f'{rid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{rid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45), 'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')), 'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr(f'{rid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9),
            'print': img_mat(f'{rid}_print', f'{rid}_print.png', rough=0.55), 'screen': img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
            'board': L.flat(f'{rid}_whiteboard', '#f6f8f8', rough=0.15),
        }
        self.vc = CMesh(f'{rid}_props', M['vc']); self.vm = CMesh(f'{rid}_metal', M['vcm'])
        self.wood = Mesh(f'{rid}_woodparts', M['wood']); self.steel = Mesh(f'{rid}_steel', M['steel'])
        self.tube = Mesh(f'{rid}_tubes', M['tube']); self.warm = Mesh(f'{rid}_warm', M['warm']); self.fridgel = Mesh(f'{rid}_glowpanel', M['fridge'])
        self.prt = Mesh(f'{rid}_prints', M['print']); self.scr = Mesh(f'{rid}_screens', M['screen'])
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


def long_table(c, cx, z0, z1, d=0.5):
    """教室長桌（學生面向 −x）：木紋桌面、朝講台那一面的前擋板、兩端和中間的鐵腳、桌下置物網；z0..z1＝桌子的長、d＝沿 x 的深"""
    c.wood.rbox(cx - d / 2, cx + d / 2, 0.72, 0.75, z0, z1, r=0.006, seg=1)
    c.vc.cbox(cx - d / 2, cx - d / 2 + 0.02, 0.35, 0.72, z0 + 0.03, z1 - 0.03, '#8a8f94')
    for zz in (z0 + 0.05, (z0 + z1) / 2, z1 - 0.05): c.vm.cbox(cx - d / 2 + 0.03, cx + d / 2 - 0.03, 0.0, 0.72, zz - 0.02, zz + 0.02, '#2b2b2b')
    c.vm.cbox(cx - d / 2 + 0.03, cx + d / 2 - 0.08, 0.55, 0.57, z0 + 0.06, z1 - 0.06, '#4a4f54')
    c.block(cx - d / 2 - 0.03, cx + d / 2 + 0.03, z0 - 0.03, z1 + 0.03, 'desk')


def build(rid):
    R = ROOMS[rid]; H = R['H']; K.H = H
    c = Room(rid, R); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    fl = Mesh(f'{rid}_floorm', M['floor'], tile=0.9); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{rid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z1), (X1, H, Z1), (X1, H, Z0), (X0, H, Z0)]); ce.finish(c.root)
    wh = 1.0
    # +z（S）：一排窗
    WX = R['wins']; wy0, wy1 = 1.3, 2.9
    c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall＝front（+z），winXs 要寫 −x（room() 的 front 牆 x 是反的）；窗外的景用遊戲裡拍的照片')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass']); tr = c.wg('S', 'trim', M['vc'], cm=True)
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], wh, H))
    wn.quad(QS(X0, X1, 0.0, wh)); tr.cbox(X0, X1, wh - 0.02, wh + 0.03, Z1 - 0.015, Z1, '#5a4a3e')
    for wx in WX:
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, wh, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
        fr.cbox(a + 0.05, b - 0.05, wy1 + 0.02, wy1 + 0.12, Z1 - 0.14, Z1 - 0.06, '#e6e2d8')                              # 捲簾（拉上去的）
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')
    # −z（N，走廊那一側）：後門（靠東）、門牌、安全門標示、時鐘
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood'])
    dx, dw = R['door_x'], 1.0; d0, d1 = dx - dw / 2 - 0.08, dx + dw / 2 + 0.08
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    for (xa, xb) in ((X0, d0), (d1, X1)): wl.quad(QN(xa, xb, wh, H)); wn.quad(QN(xa, xb, 0.0, wh)); tr.cbox(xa, xb, wh - 0.02, wh + 0.03, Z0, Z0 + 0.015, '#5a4a3e')
    wl.quad(QN(d0, d1, 2.2, H))
    for (xa, xb) in ((d0, d0 + 0.08), (d1 - 0.08, d1)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    tr.cbox(d0, d1, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
    wd.rbox(dx - dw / 2 + 0.01, dx + dw / 2 - 0.01, 0.0, 2.11, Z0, Z0 + 0.04, r=0.004, seg=1)
    c.vm.cbox(dx - dw / 2 + 0.08, dx - dw / 2 + 0.18, 1.0, 1.04, Z0 + 0.04, Z0 + 0.09, '#c9ced2')
    tr.cbox(dx - 0.2, dx + 0.2, 1.4, 1.85, Z0 + 0.04, Z0 + 0.045, '#2a2e33')
    tr.cbox(d0 - 0.65, d0 - 0.2, 1.7, 1.86, Z0, Z0 + 0.016, '#40464c'); pq(c, 'N', d0 - 0.64, d0 - 0.21, 1.71, 1.85, 'PLATE', inset=0.018)
    pq(c, 'N', dx - 0.3, dx + 0.3, 2.3, 2.52, 'EXIT', inset=0.016); c.fridgel.box(dx - 0.3, dx + 0.3, 2.28, 2.3, Z0, Z0 + 0.02)
    pq(c, 'N', -1.0, -0.2, 2.45, 3.15, 'CLOCK', inset=0.016)
    # 西牆（前面）：白板、投影幕（收起來）、講桌、老師的位置
    wl = c.wg('W', 'wall', M['wall']); wn = c.wg('W', 'wain', M['wain']); tr = c.wg('W', 'trim', M['vc'], cm=True); bm = c.wg('W', 'board', M['board'])
    wl.quad([(X0, wh, Z1), (X0, wh, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, wh, Z0), (X0, wh, Z1)]); tr.cbox(X0, X0 + 0.015, wh - 0.02, wh + 0.03, Z0, Z1, '#5a4a3e')
    bw = min(3.6, R['D'] / 2 - 0.9)
    tr.cbox(X0, X0 + 0.03, 0.95, 2.35, -bw, bw, '#b9bec2'); bm.quad([(X0 + 0.032, 1.0, bw - 0.05), (X0 + 0.032, 1.0, -bw + 0.05), (X0 + 0.032, 2.3, -bw + 0.05), (X0 + 0.032, 2.3, bw - 0.05)])
    pq(c, 'W', -bw + 0.2, -bw + 3.2, 1.05, 2.25, 'BOARD', inset=0.034); pq(c, 'W', bw - 3.2, bw - 0.2, 1.05, 2.25, 'BOARD', inset=0.034)
    tr.cbox(X0, X0 + 0.09, 0.93, 0.96, -bw + 0.1, bw - 0.1, '#9aa0a4')
    for k, col in enumerate(('#202020', '#1a3a8a', '#a02020')): c.vc.cbox(X0 + 0.03, X0 + 0.08, 0.96, 0.98, -0.6 + k * 0.14, -0.48 + k * 0.14, col)
    tr.cbox(X0, X0 + 0.14, 2.92, 3.02, -1.6, 1.6, '#e8e8e4')                                                          # 投影幕的捲軸
    px_ = X0 + 3.0; c.vc.crbox(px_ - 0.2, px_ + 0.2, H - 0.24, H - 0.14, -0.2, 0.2, '#e8e8e4', r=0.01, seg=1); c.vm.cbox(px_ - 0.02, px_ + 0.02, H - 0.14, H, -0.02, 0.02, '#9aa0a4')
    c.fridgel.box(px_ - 0.205, px_ - 0.2, H - 0.22, H - 0.17, -0.06, 0.06)
    lx = X0 + 1.4
    c.vc.crbox(lx - 0.28, lx + 0.28, 0.0, 1.05, -0.55, 0.55, '#6a5040', r=0.01, seg=1); c.wood.rbox(lx - 0.33, lx + 0.33, 1.05, 1.1, -0.6, 0.6, r=0.01, seg=2)   # 講桌
    c.vc.cbox(lx - 0.15, lx + 0.15, 1.1, 1.13, -0.25, 0.25, '#2b2b2b'); c.vc.cbox(lx - 0.16, lx - 0.14, 1.13, 1.43, -0.24, 0.24, '#202225')
    uvquad(c.scr, [(lx - 0.162, 1.15, -0.22), (lx - 0.162, 1.15, 0.22), (lx - 0.162, 1.41, 0.22), (lx - 0.162, 1.41, -0.22)], K.TX.uv(K.TX.SCR, 'pos'))   # 筆電螢幕朝老師（−x），在螢幕蓋的前面
    c.block(lx - 0.36, lx + 0.36, -0.63, 0.63, 'lectern')
    c.clerk = dict(x=round(X0 + 0.75, 3), z=0.0, yaw=round(PI / 2, 4), note='teacherSpot：老師站的位置（講桌後面、白板前，面向學生；clerk 欄位沿用店員的格式）')
    # 東牆（後面）：公告欄、使用須知、置物櫃或層架
    wl = c.wg('E', 'wall', M['wall']); wn = c.wg('E', 'wain', M['wain']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, wh, Z0), (X1, wh, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, wh, Z1), (X1, wh, Z0)]); tr.cbox(X1 - 0.015, X1, wh - 0.02, wh + 0.03, Z0, Z1, '#5a4a3e')
    K.frame_board(c, 'E', 0.4, 2.4, 1.2, 2.0, '#6a4a30'); pq(c, 'E', 0.4, 2.4, 1.2, 2.0, 'NOTICE', inset=0.014)
    K.frame_board(c, 'E', -1.9, -0.5, 1.3, 2.05, '#5a4a3e'); pq(c, 'E', -1.9, -0.5, 1.3, 2.05, 'RULES', inset=0.014)
    if R['back'] == 'lockers':   # 霖澤館 202：後面一排學生置物櫃（低的，上面可以放東西）
        z0, z1 = Z1 - 0.32 - 2.2, Z1 - 0.4
        c.vc.cbox(X1 - 0.45, X1, 0.0, 1.0, z0, z1, '#7d868f')
        n = int((z1 - z0) / 0.37)
        for k in range(n):
            a = z0 + k * (z1 - z0) / n
            for yy in (0.05, 0.52): c.vc.cbox(X1 - 0.455, X1 - 0.45, yy, yy + 0.43, a + 0.01, a + (z1 - z0) / n - 0.01, '#8e979f'); c.vm.cbox(X1 - 0.47, X1 - 0.455, yy + 0.3, yy + 0.36, a + 0.04, a + 0.06, '#2b2b2b')
        c.block(X1 - 0.48, X1, z0, z1, 'lockers')
    else:                         # 萬才館多功能教室：後面一個開放層架（譜架、音箱、延長線）
        z0, z1 = Z1 - 0.32 - 2.0, Z1 - 0.4
        c.wood.box(X1 - 0.42, X1, 0.0, 0.05, z0, z1); c.wood.box(X1 - 0.42, X1, 0.95, 1.0, z0, z1); c.wood.box(X1 - 0.42, X1, 0.0, 1.0, z0, z0 + 0.03); c.wood.box(X1 - 0.42, X1, 0.0, 1.0, z1 - 0.03, z1)
        c.vc.crbox(X1 - 0.4, X1 - 0.06, 0.05, 0.5, z0 + 0.1, z0 + 0.55, '#2b2b2b', r=0.02, seg=1); c.vc.cbox(X1 - 0.39, X1 - 0.38, 0.12, 0.43, z0 + 0.15, z0 + 0.5, '#4a4a4a')   # 音箱
        for k in range(3): c.vm.cbox(X1 - 0.38, X1 - 0.08, 0.05 + k * 0.02, 0.07 + k * 0.02, z0 + 0.8 + k * 0.02, z0 + 1.4, '#2b2b2b')                               # 收起來的譜架
        c.vc.cbox(X1 - 0.35, X1 - 0.1, 1.0, 1.06, z1 - 0.7, z1 - 0.2, '#f4f4f1')                                                                                    # 延長線盒
        c.block(X1 - 0.45, X1, z0, z1, 'shelf')
    K.ac_unit(c, X1, 2.65, -2.4, '-x', w=1.0); K.ac_unit(c, X0, 2.65, Z1 - 1.2, '+x', w=1.0)
    c.vc.crbox(X1 - 0.45, X1 - 0.1, 0.0, 0.6, Z0 + 0.25, Z0 + 0.6, '#3f6fb0', r=0.03, seg=1); c.block(X1 - 0.48, X1, Z0, Z0 + 0.65, 'bin')
    # 學生座位：每排兩張長桌（面向 −x）、一張 4 位；中間是走道，排和排之間 1.9 m（椅子後面走得過去）
    for cx in R['rows']:
        for (z0, z1) in R['tables']:
            long_table(c, cx, z0, z1)
            n = 4
            for k in range(n):
                x, z = cx + 0.55, z0 + (k + 0.5) * (z1 - z0) / n; class_chair(c, x, z, -PI / 2); c.seat(x, z, -PI / 2, (cx, z), 'class', ap=(x + 0.45, z), label='坐下');   # 走近點在椅子後面 0.45 m（預設 0.6 m 離「坐下」按鈕的 0.7 m 太近：10-20 流程測試） c.seats[-1]['uses'] = ['上課'] + (['社課'] if rid == 'wancai_multi' else ['自習'])
    # 燈
    for x in [X0 + 1.6 + k * 2.8 for k in range(int((R['W'] - 2.0) / 2.8) + 1)]:
        for z in (-R['D'] / 4 - 0.3, R['D'] / 4 + 0.3):
            if x > X1 - 0.8: continue
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    c.look('board', round(X0 + 1.0, 3), round(bw - 0.6, 3), 0.9, '白板', '白板（字由課堂或事件決定）')
    c.look('notice', round(X1 - 0.9, 3), 1.4, 0.9, '公告欄', '公告欄（說明文字由 AA 寫）')
    c.door = dict(x=dx, w=dw, z=Z0, note=f"−z 那一面靠東（後門）；從{'霖澤館 2F 迴廊的 202 門（linze_layout.js doors.c202，lv 1、x 3.0）' if rid == 'linze_202' else '萬才館 1F 大廳北牆的「多功能教室」門（wancai_layout.js doors.multi，lv 0、x 2.0）'}進來")
    c.spawn = dict(x=dx, z=round(Z0 + 1.45, 3), yaw=round(-PI / 2 + 0.4, 4), note='進門，大致面向講台（−x）')
    c.exits = [dict(x=dx, z=round(Z0 + 0.45, 3), r=0.7, label='離開教室', to=R['host'], spawn_note=f"回到{R['host']}、{R['door_id']} 的門前面（lv {R['host_lv']}）")]
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': D[k]}, uv=key in ('wall', 'wain', 'door'), merge=key not in ('print', 'screen', 'view'))
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{rid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=rid, name=R['name'], type='教室', src=R['src'] + '；LINZE-WANCAI-FLOORS-1020',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=4.4, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins,
               counter=None, clerk=c.clerk, teacherSpot=dict(c.clerk), order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, view=R.get('view', rid),
               host_door=dict(zone=R['host'], id=R['door_id'], lv=R['host_lv'], note='門的資料（linze_layout.js／wancai_layout.js 的 doors）：拿掉 closed、加 to，出生點用這裡的 spawn；上課、社課的流程由 LAWWW-C 改'))
    auto_ap(c, lay)
    prob = navcheck(c, lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{rid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{rid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': rid, 'tris': tris, 'seats': len(c.seats), 'ap': lay['navcheck']['ap'], 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    which = arg('--room', 'all'); ids = list(ROOMS) if which == 'all' else which.split(',')
    if len(ids) > 1:   # 每一間一個 Blender 行程（B.reset 以後共用的貼圖快取會失效，和 lane118_shops.py --shop all 一樣）
        import subprocess
        for rid in ids: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--room', rid, '--out-dir', os.path.relpath(OUTDIR, L.ROOT)], check=False)
    else:
        make_tex(ids[0], ROOMS[ids[0]]); p = build(ids[0]); print('FLAT_CLASSROOM', ids[0], 'OK' if not p else p)
