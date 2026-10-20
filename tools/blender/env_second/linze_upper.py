"""霖澤館 3、4 樓（LINZE-34F-TABLES-1020＋LINZE-WANCAI-FLOORS-1020；使用者 10-20 試玩 v9.10.2：
  「霖澤3.4樓要有長條桌子附椅子像野餐椅子讓大家可以在那邊討論事情功課或者吃飯啊」「霖澤館3-8樓為什麼永遠都在蓋 萬才也是阿」）
→ 每層樓一個室內區域的 GLB＋配置：assets/models/env/second_ai/linze_3f.glb、linze_4f.glb＋.layout.json。LAWWW2-C 2026-10-20；Blender 5.2：
  /opt/blenv/bin/python tools/blender/env_second/linze_upper.py [-- --floor 3f|4f|all] [--out-dir assets/models/env/second_ai]
座標和霖澤館室內（src/data/linze_layout.js）完全相同：x −8…8（+x 是穿堂那一側）、z −7…7（+z 是正面、朝南），每層自己的地板 y＝0；
  電梯井（x 3.6…5.6、z −3.2…−0.8，門朝北 z −3.2）、樓梯間的門（x 7.0、北牆）和一、二樓同一個位置，電梯、樓梯接得上。
每層：北邊一條走廊（教室的門在北牆）、南邊是開放的討論區（野餐桌式的長桌附長椅、微波爐、飲水機、販賣機、回收桶、公告欄）、南牆一排窗
  （窗洞 2.2 × 1.6 m、中心 2.1 m 高，和遊戲 room() 的窗一樣：窗外的景由遊戲照時段換，配置寫 windows）。
做法和 118 巷的店一樣（lane118_shops.py 的共用零件；遊戲端 Z3.room＋attachRoomGLB）：四面牆 WALL_<N|W|E|S>_*（淡出）、GLOW_ 整天亮。
還沒做的樓層（5F–8F）不寫「整修中」：電梯按鈕寫「研究室（教職員）」，按下去說要刷教職員證。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402  共用零件（桌椅、日光燈、盆栽、飲水機…）
from lane118_shops import L, B, Mesh, CMesh, g2b, bpy, uvquad, img_mat, rot, rbox, ccyl, csph, clathe, table_set, tubes, plant, water_station, cups_stack, counter, navcheck, chair, auto_ap   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
src = open(os.path.join(L.ROOT, 'src/data/linze_layout.js'), encoding='utf-8').read()
LZ = json.loads(src[src.index('{', src.index('const LINZE_LAYOUT=')):src.rindex('}') + 1])
H = 3.4; K.H = H                     # 三樓以上的樓高（天花板 3.4 m）
EL = LZ['elevator']
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
REG = {'FLOOR3': (0, 0, 512, 160), 'FLOOR4': (512, 0, 1024, 160), 'RULES': (0, 160, 512, 512), 'NOTICE': (512, 160, 1024, 512),
       'R301': (0, 512, 256, 608), 'R302': (256, 512, 512, 608), 'R401': (512, 512, 768, 608), 'R402': (768, 512, 1024, 608),
       'BIN1': (0, 608, 256, 672), 'BIN2': (256, 608, 512, 672), 'BIN3': (512, 608, 768, 672), 'STAIR': (768, 608, 1024, 672),
       'WB': (0, 672, 512, 1024), 'WB2': (512, 672, 1024, 1024)}
FLOORS = {
    '3f': dict(name='霖澤館 3F', label='3F 討論區', sign='FLOOR3', rooms=[('R301', -4.6, '301 教室'), ('R302', -0.6, '302 教室')], up='4f', down='2f'),
    '4f': dict(name='霖澤館 4F', label='4F 自習討論區', sign='FLOOR4', rooms=[('R401', -4.6, '401 教室'), ('R402', -0.6, '402 研討室')], up=None, down='3f'),
}


def F(n): return ImageFont.truetype(CJK, n)


def uv(key):
    x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)


def ctext(d, cx, y, t, f, fill):
    w = d.textlength(t, font=f); d.text((cx - w / 2, y), t, font=f, fill=fill)


def make_tex():
    """3、4 樓的印刷品貼圖集（樓層牌、使用規則、公告欄、門牌、回收桶標籤、白板）；內容是虛構的校園日常，沒有真實姓名、課號"""
    im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im)
    for key, t1, t2 in (('FLOOR3', '3F', '討論區・301・302'), ('FLOOR4', '4F', '自習討論區・401・402')):
        x0, y0, x1, y1 = REG[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); d.text((x0 + 26, y0 + 18), t1, font=F(112), fill=(240, 240, 236)); d.text((x0 + 200, y0 + 56), t2, font=F(40), fill=(220, 220, 214))
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(58, 92, 74))
    ctext(d, (x0 + x1) / 2, y0 + 12, '討論區使用須知', F(40), (255, 255, 255))
    for k, ln in enumerate(['可以討論、可以吃東西', '請小聲一點，樓上有人在讀書', '垃圾請分類，廚餘倒進廚餘桶', '微波爐用完請擦乾淨', '離開時把椅子、桌面整理好', '晚上 22:00 關燈']):
        d.text((x0 + 30, y0 + 90 + k * 40), '・' + ln, font=F(30), fill=(50, 50, 46))
    x0, y0, x1, y1 = REG['NOTICE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    rr = random.Random(34)
    for k, (t, col) in enumerate([('讀書會招人\n週四 19:00\n3F 長桌', (250, 246, 230)), ('二手書\n出清', (250, 228, 140)), ('系學會\n迎新茶會', (210, 232, 246)), ('失物招領\n黑色水壺', (250, 250, 250)), ('排球系隊\n練球時間', (232, 246, 214)), ('微波爐\n排隊請自重', (250, 214, 214))]):
        px, py = x0 + 20 + (k % 3) * 164, y0 + 20 + (k // 3) * 166; w, h = 150, 150
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 26 + j * 36, ln, F(26), (60, 50, 40))
    for key, t in (('R301', '301'), ('R302', '302'), ('R401', '401'), ('R402', '402 研討室')):
        x0, y0, x1, y1 = REG[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); ctext(d, (x0 + x1) / 2, y0 + 18, t, F(56 if len(t) <= 3 else 40), (240, 240, 236))
    for key, t, col in (('BIN1', '一般垃圾', (90, 90, 90)), ('BIN2', '資源回收', (40, 110, 180)), ('BIN3', '廚餘', (70, 140, 60)), ('STAIR', '樓梯間', (58, 92, 74))):
        x0, y0, x1, y1 = REG[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 10, t, F(40), (255, 255, 255))
    for key, lines in (('WB', ['期中考範圍', '第 1～6 章', '週四前把筆記傳到群組', '→ 誰負責整理？']), ('WB2', ['討論：案例 3', '甲、乙的關係？', '下週一 12:10 這裡見', '（不要擦）'])):
        x0, y0, x1, y1 = REG[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 250, 250))
        for k, ln in enumerate(lines): d.text((x0 + 30 + rr.randint(-6, 6), y0 + 30 + k * 76), ln, font=F(44 if k == 0 else 36), fill=[(30, 60, 160), (40, 40, 40), (180, 40, 40), (30, 120, 60)][k % 4])
    im.save(os.path.join(GEN, 'linze_upper_print.png'))


class Floor(K.Shop):
    """一層樓的建造狀態（沿用 Shop 的累積網格、配置；不跑 Shop.__init__）"""
    def __init__(self, fid):
        self.sid = 'linze_' + fid; self.fid = fid; self.FD = FLOORS[fid]; self.T = {'name': self.FD['name'], 'sub': self.FD['label']}
        self.S = dict(trim='#5a5f63', wainH=0.12)
        self.W, self.D = LZ['W'], LZ['D']; self.X0, self.X1, self.Z0, self.Z1 = -self.W / 2, self.W / 2, -self.D / 2, self.D / 2
        self.rng = random.Random(3400 + (4 if fid == '4f' else 3)); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(self.sid, props={'kind': 'linze_upper', 'floor': fid, 'layout': f'{self.sid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(f'{self.sid}_floor', 'large_floor_tiles_02', tile=0.8, target='#c9c4ba', contrast=0.5, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.3),
            'wall': L.pbr(f'{self.sid}_wall', 'painted_plaster_wall', tile=2.0, target='#ece8df', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.85),
            'wain': L.pbr(f'{self.sid}_granite', 'granite_tile_03', tile=1.2, target='#7d7a76', contrast=0.8, normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.3),
            'wood': L.pbr(f'{self.sid}_wood', 'wood_table_001', tile=0.9, target='#a07a52', contrast=0.8, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'vc': L.vc_material(f'{self.sid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{self.sid}_vcmetal', rough=0.32, metal=0.4),
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45),
            'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')),
            'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'fridge': L.flat('GLOW_l118_fridge', '#f4f8ff', rough=0.3, emit=B.srgb('#cfe0f4')),
            'ceil': L.pbr(f'{self.sid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9),
            'print': img_mat(f'{self.sid}_print', 'linze_upper_print.png', rough=0.55),
            'screen': img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
        }
        self.vc = CMesh(f'{self.sid}_props', M['vc']); self.vm = CMesh(f'{self.sid}_metal', M['vcm'])
        self.wood = Mesh(f'{self.sid}_woodparts', M['wood']); self.steel = Mesh(f'{self.sid}_steel', M['steel'])
        self.tube = Mesh(f'{self.sid}_tubes', M['tube']); self.warm = Mesh(f'{self.sid}_warm', M['warm']); self.fridgel = Mesh(f'{self.sid}_fridgelight', M['fridge'])
        self.prt = Mesh(f'{self.sid}_prints', M['print']); self.scr = Mesh(f'{self.sid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def pq(c, side, a0, a1, y0, y1, key, inset=0.015):
    """牆上的印刷品（這一層的貼圖集）：side 牆、a0..a1 沿牆（W、E 牆是 z）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


def picnic(c, cx, cz, Lx=1.9, wood='#b08a5e', frame='#3f4a52', along='x'):
    """野餐桌式的長桌：木頭桌面＋兩側連在一起的長椅（一體的鐵框：A 字腳＋兩根橫桿撐住長椅）；兩側各坐三個人。
    along＝桌子長邊的方向（'x'：窗下那一排；'z'：沿著西牆）。使用者 10-20：「霖澤館長椅都是靠窗的靠牆的」"""
    tw, bd, bz = 0.8, 0.3, 0.6                     # 桌面深、長椅深、長椅中心離桌子中心
    yaw = 0.0 if along == 'x' else PI / 2; T = rot(cx, cz, yaw)   # 本地座標：lx＝長邊、lz＝短邊
    def B_(m, lx0, lx1, y0, y1, lz0, lz1, col=None, r=0.0):
        (ax, az), (bx, bz_) = T(lx0, lz0), T(lx1, lz1); x0, x1, z0, z1 = min(ax, bx), max(ax, bx), min(az, bz_), max(az, bz_)
        if col is None: m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=2) if r else m.box(x0, x1, y0, y1, z0, z1)
        else: m.cbox(x0, x1, y0, y1, z0, z1, col)
    B_(c.wood, -Lx / 2, Lx / 2, 0.72, 0.76, -tw / 2, tw / 2, r=0.01)
    for s_ in (-1, 1): B_(c.wood, -Lx / 2 + 0.05, Lx / 2 - 0.05, 0.42, 0.46, s_ * bz - bd / 2, s_ * bz + bd / 2, r=0.01)
    for lx in (-Lx / 2 + 0.25, Lx / 2 - 0.25):
        for s_ in (-1, 1): a_, b_ = T(lx, s_ * 0.78), T(lx, s_ * 0.12); ccyl(c.vm, (a_[0], 0.0, a_[1]), (b_[0], 0.72, b_[1]), 0.022, frame, seg=8)   # A 字腳
        B_(c.vm, lx - 0.025, lx + 0.025, 0.38, 0.42, -0.82, 0.82, frame)                                                                       # 撐長椅的橫桿
        B_(c.vm, lx - 0.025, lx + 0.025, 0.68, 0.72, -tw / 2 + 0.05, tw / 2 - 0.05, frame)
    B_(c.vm, -Lx / 2 + 0.25, Lx / 2 - 0.25, 0.25, 0.29, -0.02, 0.02, frame)                                                                    # 中間的長桿
    (ax, az), (bx, bz_) = T(-Lx / 2 - 0.03, -bz - bd / 2 - 0.02), T(Lx / 2 + 0.03, bz + bd / 2 + 0.02)
    c.block(min(ax, bx), max(ax, bx), min(az, bz_), max(az, bz_), 'picnic_table')
    for s_ in (-1, 1):
        for k in (-1, 0, 1):
            x, z = T(k * 0.6, s_ * bz); c.seat(x, z, yaw + (PI if s_ > 0 else 0.0), (cx, cz), 'study', label='坐長椅'); c.seats[-1]['uses'] = ['討論', '讀書', '吃東西']   # kind study：坐下的選單有「讀書」；吃東西、和同學討論由 LAWWW 接


def whiteboard(c, x, z, key, yaw=0.0):
    """有輪子的白板（討論用）：鋁框、白板面（字是印刷品）、兩支腳"""
    T = rot(x, z, yaw)
    rbox(c.vm, T, -0.62, 0.62, 0.85, 1.85, -0.025, 0.025, '#c9ced2', r=0.008)
    a, b = T(-0.58, 0.027), T(0.58, 0.027); pts = [(a[0], 0.89, a[1]), (b[0], 0.89, b[1]), (b[0], 1.81, b[1]), (a[0], 1.81, a[1])]
    uvquad(c.prt, pts, uv(key))
    for lx in (-0.6, 0.6):
        p0 = T(lx, 0); ccyl(c.vm, (p0[0], 0.06, p0[1]), (p0[0], 0.85, p0[1]), 0.015, '#9aa0a4', seg=6); rbox(c.vm, T, lx - 0.03, lx + 0.03, 0.03, 0.06, -0.25, 0.25, '#5a5f63')
        for lz in (-0.22, 0.22): q = T(lx, lz); csph(c.vc, (q[0], 0.03, q[1]), 0.03, '#2b2b2b', seg=6, rings=4)
    (ax, az), (bx, bz) = T(-0.64, -0.26), T(0.64, 0.26); c.block(min(ax, bx), max(ax, bx), min(az, bz), max(az, bz), 'whiteboard')


def shell(c):
    """地板、牆、踢腳板（花崗石）、天花板（礦纖板）＋日光燈、南牆一排窗（和遊戲 room() 的窗一樣大）、北牆的門（教室、樓梯間）、電梯井"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M
    fl = Mesh(f'{c.sid}_floorm', M['floor'], tile=0.8); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(c.root)
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z1), (X1, H, Z1), (X1, H, Z0), (X0, H, Z0)]); ce.finish(c.root)
    # 南牆：窗洞（中心 2.1 m、2.2 × 1.6）；窗台、鋁框、玻璃
    WX = [-5.6, -2.0, 1.6, 5.4]; wy0, wy1 = 1.3, 2.9; c.wins = dict(side='S', wall='front', z=Z1, xs=WX, y=2.1, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall 照這一面、winXs、winY；窗外的景（view）用遊戲裡拍的照片')
    wl = c.wg('S', 'wall', M['wall']); wn = c.wg('S', 'wain', M['wain']); fr = c.wg('S', 'frame', M['vcm'], cm=True); gl = c.wg('S', 'glass', M['glass'])
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    xs = [X0] + [v for wx in WX for v in (wx - 1.1, wx + 1.1)] + [X1]
    for k in range(0, len(xs), 2): wl.quad(QS(xs[k], xs[k + 1], 0.12, H))
    wn.quad(QS(X0, X1, 0.0, 0.12))
    for wx in WX:
        a, b = wx - 1.1, wx + 1.1; wl.quad(QS(a, b, 0.12, wy0)); wl.quad(QS(a, b, wy1, H))
        fr.cbox(a, b, wy0 - 0.03, wy0, Z1 - 0.3, Z1, '#d9d6cf')                                                          # 窗台（往內凸 30 cm）
        for (xa, xb) in ((a, a + 0.05), (b - 0.05, b), (wx - 0.025, wx + 0.025)): fr.cbox(xa, xb, wy0, wy1, Z1 - 0.08, Z1 - 0.03, '#a9aeb2')
        for (ya, yb) in ((wy0, wy0 + 0.05), (wy1 - 0.05, wy1)): fr.cbox(a, b, ya, yb, Z1 - 0.085, Z1 - 0.035, '#a9aeb2')
        gl.quad([(b, wy0, Z1 - 0.055), (a, wy0, Z1 - 0.055), (a, wy1, Z1 - 0.055), (b, wy1, Z1 - 0.055)])
    # 西、東牆
    for k in 'WE':
        wl = c.wg(k, 'wall', M['wall']); wn = c.wg(k, 'wain', M['wain'])
        if k == 'W': wl.quad([(X0, 0.12, Z1), (X0, 0.12, Z0), (X0, H, Z0), (X0, H, Z1)]); wn.quad([(X0, 0.0, Z1), (X0, 0.0, Z0), (X0, 0.12, Z0), (X0, 0.12, Z1)])
        else: wl.quad([(X1, 0.12, Z0), (X1, 0.12, Z1), (X1, H, Z1), (X1, H, Z0)]); wn.quad([(X1, 0.0, Z0), (X1, 0.0, Z1), (X1, 0.12, Z1), (X1, 0.12, Z0)])
    # 北牆：教室的門（木門＋門框＋門牌）、樓梯間的門（鐵門）
    wl = c.wg('N', 'wall', M['wall']); wn = c.wg('N', 'wain', M['wain']); tr = c.wg('N', 'trim', M['vc'], cm=True); wd = c.wg('N', 'door', M['wood']); dm = c.wg('N', 'doormetal', M['vcm'], cm=True)
    doors = [(x, 1.0, 'room', key, lab) for (key, x, lab) in c.FD['rooms']] + [(7.0, 1.0, 'stair', 'STAIR', '樓梯間')]
    xs = sorted({X0, X1} | {v for (x, w, *_r) in doors for v in (x - w / 2 - 0.08, x + w / 2 + 0.08)})
    for xa, xb in zip(xs, xs[1:]):
        hole = any(x - w / 2 - 0.08 <= xa + 1e-6 and x + w / 2 + 0.08 >= xb - 1e-6 for (x, w, *_r) in doors)
        if hole: wl.quad([(xa, 2.2, Z0), (xb, 2.2, Z0), (xb, H, Z0), (xa, H, Z0)])
        else: wl.quad([(xa, 0.12, Z0), (xb, 0.12, Z0), (xb, H, Z0), (xa, H, Z0)]); wn.quad([(xa, 0.0, Z0), (xb, 0.0, Z0), (xb, 0.12, Z0), (xa, 0.12, Z0)])
    c.doors = []
    for (x, w, kind, key, lab) in doors:
        a, b = x - w / 2, x + w / 2
        for (xa, xb) in ((a - 0.08, a), (b, b + 0.08)): tr.cbox(xa, xb, 0.0, 2.2, Z0, Z0 + 0.06, '#5a5f63')
        tr.cbox(a - 0.08, b + 0.08, 2.12, 2.2, Z0, Z0 + 0.06, '#5a5f63')
        if kind == 'room':
            wd.rbox(a + 0.01, b - 0.01, 0.0, 2.11, Z0 - 0.04, Z0 + 0.0, r=0.004, seg=1)                              # 門片（退在門框裡）
            dm.cbox(b - 0.16, b - 0.06, 1.0, 1.04, Z0 + 0.0, Z0 + 0.06, '#c9ced2')                                       # 門把
            gl_ = c.wg('N', 'glass', M['glass']); gl_.quad([(a + 0.25, 1.35, Z0 + 0.001), (a + 0.45, 1.35, Z0 + 0.001), (a + 0.45, 1.85, Z0 + 0.001), (a + 0.25, 1.85, Z0 + 0.001)])
            tr.cbox(a + 0.25, a + 0.45, 1.35, 1.85, Z0 - 0.045, Z0 - 0.041, '#2a2e33')                                  # 門上小窗後面是暗的教室
        else:
            dm.cbox(a + 0.01, b - 0.01, 0.0, 2.11, Z0 - 0.04, Z0 + 0.0, '#6a7078'); dm.cbox(a + 0.1, a + 0.5, 1.0, 1.04, Z0 + 0.0, Z0 + 0.05, '#c9ced2')   # 安全門＋推桿
        pa = b + 0.12 if b + 0.6 < X1 else a - 0.52; pq(c, 'N', pa, pa + 0.4, 1.75, 1.9, key, inset=0.016)                # 門牌（門的右邊；靠東牆的樓梯間放左邊）
        c.doors.append(dict(id=key.lower(), kind=kind, x=x, z=Z0, w=w, label=lab))
    # 電梯井（和一、二樓同一個位置）：井的四面牆、北面兩扇不鏽鋼門、旁邊的按鈕、門上的樓層牌
    ex0, ex1, ez0, ez1 = EL['x0'], EL['x1'], EL['z0'], EL['z1']; core = c.vc
    core.cbox(ex0 - 0.15, ex1 + 0.15, 0.0, H, ez0, ez1 + 0.15, '#d6d2c9')
    dx0, dx1 = EL['doorX0'], EL['doorX1']; c.steel.box(dx0, (dx0 + dx1) / 2 - 0.005, 0.0, 2.1, ez0 - 0.02, ez0); c.steel.box((dx0 + dx1) / 2 + 0.005, dx1, 0.0, 2.1, ez0 - 0.02, ez0)
    c.vm.cbox(dx0 - 0.08, dx1 + 0.08, 2.1, 2.18, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx0 - 0.08, dx0, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4'); c.vm.cbox(dx1, dx1 + 0.08, 0.0, 2.1, ez0 - 0.03, ez0, '#9aa0a4')
    c.vm.cbox(dx1 + 0.18, dx1 + 0.3, 1.0, 1.28, ez0 - 0.015, ez0, '#c9ced2'); c.fridgel.box(dx1 + 0.21, dx1 + 0.27, 1.06, 1.1, ez0 - 0.02, ez0 - 0.015); c.fridgel.box(dx1 + 0.21, dx1 + 0.27, 1.16, 1.2, ez0 - 0.02, ez0 - 0.015)
    uvquad(c.prt, [(dx0 - 0.2, 2.3, ez0 - 0.005), (dx1 + 0.2, 2.3, ez0 - 0.005), (dx1 + 0.2, 2.68, ez0 - 0.005), (dx0 - 0.2, 2.68, ez0 - 0.005)], uv(c.FD['sign']))   # 樓層牌（電梯門上面，朝走廊）
    c.block(ex0 - 0.17, ex1 + 0.17, ez0 - 0.05, ez1 + 0.17, 'elevator_core')
    # 討論區兩側的木條護牆板（1 m 高；跟著那一面牆淡出）
    for k, xw, sg in (('W', X0, 1), ('E', X1, -1)):
        sl = c.wg(k, 'slat', M['wood']); z = -2.9
        while z < Z1 - 0.45:
            sl.box(*sorted((xw, xw + sg * 0.02)), 0.12, 1.05, z, z + 0.045); z += 0.085
        c.wg(k, 'trim', M['vc'], cm=True).cbox(*sorted((xw, xw + sg * 0.035)), 1.05, 1.09, -2.95, Z1 - 0.4, '#6b5038')
    # 走廊：時鐘、兩張長椅（可以坐）
    tr = c.wg('N', 'trim', M['vc'], cm=True)
    ccyl(tr, (-2.6, 2.55, Z0), (-2.6, 2.55, Z0 + 0.05), 0.18, '#2b2b2b', seg=24); ccyl(tr, (-2.6, 2.55, Z0 + 0.05), (-2.6, 2.55, Z0 + 0.056), 0.16, '#f6f6f2', seg=24)
    tr.cbox(-2.605, -2.595, 2.55, 2.67, Z0 + 0.056, Z0 + 0.062, '#1a1a1a'); tr.cbox(-2.6, -2.5, 2.545, 2.555, Z0 + 0.062, Z0 + 0.068, '#1a1a1a')   # 時針、分針（十點）
    for bx in (-2.6, 5.0):
        c.wood.rbox(bx - 0.7, bx + 0.7, 0.43, 0.47, Z0 + 0.05, Z0 + 0.45, r=0.01, seg=2)
        for lx in (bx - 0.6, bx + 0.6): c.vm.cbox(lx - 0.025, lx + 0.025, 0.0, 0.43, Z0 + 0.08, Z0 + 0.42, '#5a5f63')
        c.block(bx - 0.72, bx + 0.72, Z0, Z0 + 0.47, 'bench')
        for k in (-0.4, 0.4): c.seat(bx + k, Z0 + 0.25, 0.0, (bx + k, Z0 + 0.8), 'sit', label='坐在走廊的長椅')   # 背靠北牆、面向南
    # 結構柱（走廊和討論區中間）
    for x in (-6.0, -2.4, 1.2):
        c.vc.cbox(x - 0.25, x + 0.25, 0.0, H, -3.65, -3.15, '#e4e0d7'); c.vc.cbox(x - 0.255, x + 0.255, 0.0, 0.12, -3.655, -3.145, '#6f6c68')
        c.block(x - 0.27, x + 0.27, -3.67, -3.13, 'column')
    # 日光燈（嵌在天花板，一排一排）
    for x in (-6.0, -3.0, 0.0, 3.0, 6.0):
        for z in (-5.2, 0.4, 3.6):
            if ex0 - 0.5 < x < ex1 + 0.5 and ez0 - 0.5 < z < ez1 + 0.5: continue
            c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); c.tube.box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    # 出入口：電梯、樓梯間
    c.spawn = dict(x=round((dx0 + dx1) / 2, 3), z=round(ez0 - 1.7, 3), yaw=PI, note='出電梯，面向走廊（北）；離電梯的按鈕 1 m（不會一出來就站在「電梯」上）')
    c.spawn_stair = dict(x=7.0, z=round(Z0 + 1.5, 3), yaw=0.0, note='從樓梯間進來，面向南；離樓梯間的門 1.5 m（不會一上來就站在「走樓梯」上）')
    c.exits = []
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')                                                          # 窗台（1.3 m 高、往內凸 30 cm）：走到窗邊不會穿過去
    c.look('elevator', round((dx0 + dx1) / 2, 3), round(ez0 - 0.7, 3), 0.8, '電梯', '電梯（LAWWW 接：樓層照 elevator.floors）')
    c.look('stairs', 7.0, round(Z0 + 0.55, 3), 0.7, '樓梯間', '樓梯間（LAWWW 接：stairs.up／down）')


def finish_floor(c):
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'door'); mg = key not in ('print', 'screen', 'view')
            m.finish(c.root, props={'dir': D[k]}, uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    FD = c.FD
    efl = [dict(label='1F 大廳', zone='linze', lv=0, open=True), dict(label='2F 201、202 教室', zone='linze', lv=1, open=True),
           dict(label='3F 討論區、301、302', zone='linze_3f', open=True), dict(label='4F 自習討論區、401、402', zone='linze_4f', open=True),
           dict(label='5F–8F 研究室（教職員）', open=False, closed='研究室樓層。電梯要刷教職員證才會停。')]
    stairs = dict(door=dict(x=7.0, z=c.Z0, w=1.0), spawn=c.spawn_stair, down=dict(label='走樓梯下樓（' + FD['down'].upper() + '）', to='linze' if FD['down'] == '2f' else 'linze_' + FD['down'], spawn=dict(x=7.0, z=-4.7, lv=1, yaw=0.0) if FD['down'] == '2f' else None, note='2F：linze 第 1 層，迴廊上、樓梯間的門（stairs3f）前面 1.5 m' if FD['down'] == '2f' else '下一層的 spawn_stair'),
                  up=(dict(label='走樓梯上樓（' + FD['up'].upper() + '）', to='linze_' + FD['up'], note='上一層的 spawn_stair') if FD['up'] else dict(label='往 5F 以上', closed='5 樓以上是研究室，樓梯間的門要刷教職員證。')))
    lay = dict(version=1, zone=c.sid, name=FD['name'], label=FD['label'], src='使用者 10-20（X73、X74）；LINZE-34F-TABLES-1020、LINZE-WANCAI-FLOORS-1020',
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=4.4, coords='和 linze_layout.js 同一套（x、z），每層自己的地板 y＝0',
               spawn=c.spawn, elevator=dict(EL, floors=efl, note='位置和 linze_layout.js 的 elevator 相同；樓層清單取代原本的「整修中」'),
               stairs=stairs, doors=c.doors, windows=c.wins, exits=c.exits, seats=c.seats, interact=c.inter, blocks=c.blocks, order=None)
    auto_ap(c, dict(lay, spawn=c.spawn_stair))
    prob = navcheck(c, dict(lay, spawn=c.spawn)); prob += [p + '（從樓梯間進來）' for p in navcheck(c, dict(lay, spawn=c.spawn_stair)) if p not in prob]
    lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s_ in lay['seats'] if s_.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{c.sid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{c.sid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'floor': c.sid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


def build_3f(c):
    """3F 討論區（使用者 10-20：「霖澤館長椅都是靠窗的靠牆的」）：南窗下一排四張野餐桌（一張對一扇窗）、西牆兩張（沿著牆）；
    中間空出來走路。東牆：販賣機兩台、微波爐台、飲水機、回收桶；西牆使用須知、北牆走廊公告欄"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    for cx in c.wins['xs']: picnic(c, cx, Z1 - 1.2)                                                   # 靠窗：外側那條長椅背對窗台
    for cz in (-0.75, 2.75): picnic(c, X0 + 1.1, cz, along='z')                                        # 靠牆：西牆那條長椅背對牆（兩張中間留 1.4 m，裡面那兩個位子走得進去）
    # 東牆（北段）：微波爐台、飲水機；販賣機；回收桶
    counter(c, X1 - 0.6, X1, -2.9, -1.3, h=0.9, top='wood', front='#d9d6cf', why='microwave_counter')
    for (za, zb) in ((-2.75, -2.25), (-2.0, -1.5)):
        c.vc.crbox(X1 - 0.5, X1 - 0.08, 0.9, 1.2, za, zb, '#ecebe6', r=0.015, seg=1)                     # 微波爐（門朝西）
        c.vc.cbox(X1 - 0.504, X1 - 0.5, 0.94, 1.16, za + 0.03, za + 0.35, '#202428'); c.fridgel.box(X1 - 0.504, X1 - 0.5, 1.12, 1.16, za + 0.38, za + 0.46)
    c.look('microwave', X1 - 1.1, -2.1, 0.9, '微波爐', '熱便當（排隊請自重）；說明文字由 AA 寫')
    water_station(c, X1 - 0.3, -0.6, face='+z'); cups_stack(c, X1 - 0.3, 1.05, -0.6, 5)
    for (z0_, col) in ((0.2, '#c8322a'), (1.05, '#2f6fb0')): vend_x(c, X1, z0_, z0_ + 0.8, col)
    c.look('vending', X1 - 1.2, 1.05, 0.9, '販賣機', '飲料（說明文字由 AA 寫）')
    bins_e(c, X1, 2.3)
    c.look('bins', X1 - 1.0, 2.95, 0.8, '回收桶', '垃圾分類：一般垃圾、資源回收、廚餘')
    K.frame_board(c, 'W', 3.9, 5.0, 1.3, 2.05, '#3a5c4a'); pq(c, 'W', 3.9, 5.0, 1.3, 2.05, 'RULES', inset=0.014)
    K.frame_board(c, 'N', 2.4, 3.6, 1.2, 2.0, '#6a4a30'); pq(c, 'N', 2.4, 3.6, 1.2, 2.0, 'NOTICE', inset=0.014)
    c.look('notice', 3.0, -6.2, 0.9, '公告欄', '讀書會、二手書、系學會（說明文字由 AA 寫）')
    plant(c, -0.2, 2.2, 1.3); plant(c, 3.4, 2.2, 1.2)
    K.ac_unit(c, X0, 2.75, 1.0, '+x', w=1.0)


def bins_e(c, xw, z0):
    """三個回收桶背靠東牆（面向 −x），貼標籤"""
    for k, (col, key) in enumerate((('#5a5a5a', 'BIN1'), ('#2f6fb0', 'BIN2'), ('#3b8f4a', 'BIN3'))):
        za = z0 + k * 0.46; c.vc.crbox(xw - 0.45, xw - 0.05, 0.0, 0.78, za, za + 0.4, col, r=0.03, seg=1); c.vc.cbox(xw - 0.42, xw - 0.08, 0.78, 0.8, za + 0.03, za + 0.37, '#2b2b2b')
        x_ = xw - 0.452; uvquad(c.prt, [(x_, 0.5, za + 0.37), (x_, 0.5, za + 0.03), (x_, 0.64, za + 0.03), (x_, 0.64, za + 0.37)], uv(key))
    c.block(xw - 0.48, xw, z0 - 0.02, z0 + 1.38, 'bins')


def vend_x(c, xw, z0, z1, col):
    """販賣機背靠東牆（面向 −x）：vending() 只做背靠南北牆的，這裡轉 90°"""
    x0, x1 = xw - 0.72, xw
    c.vc.crbox(x0, x1, 0.0, 1.83, z0, z1, col, r=0.02, seg=1)
    xw_ = x0 - 0.005; w0, w1 = z0 + 0.28, z1 - 0.06
    c.fridgel.quad([(xw_, 0.95, w1), (xw_, 0.95, w0), (xw_, 1.72, w0), (xw_, 1.72, w1)])
    for y in (1.0, 1.36):
        n = int((w1 - w0) / 0.1)
        for j in range(n):
            bz = w0 + 0.05 + j * (w1 - w0 - 0.04) / n; colb = c.rng.choice(['#2f6fb0', '#e8b640', '#3b8f4a', '#f2f2ee', '#7a4a2a', '#e6702e', '#c8322a'])
            clathe(c.vc, [(0.0, 0.0), (0.028, 0.0), (0.028, 0.17), (0.012, 0.22), (0.012, 0.25), (0.0, 0.25)], xw_ - 0.03, y, bz, colb, seg=8)
    c.vc.cbox(x0 - 0.01, x0, 0.95, 1.6, z0 + 0.06, z0 + 0.24, '#2b2b2b')
    for k in range(4): c.vc.cbox(x0 - 0.016, x0 - 0.01, 1.05 + k * 0.12, 1.12 + k * 0.12, z0 + 0.1, z0 + 0.2, '#e6e6e2')
    c.vc.cbox(x0 - 0.012, x0, 0.2, 0.45, w0, w1, '#1a1a1a')
    c.block(x0 - 0.03, x1, z0 - 0.02, z1 + 0.02, 'vending')


def build_4f(c):
    """4F 自習討論區（同上，靠窗、靠牆）：南窗下西半邊兩張野餐桌、東半邊窗邊自習桌＋六張高腳椅；西牆兩張野餐桌；
    中間兩塊有輪子的白板（討論用）；東牆販賣機、飲水機、回收桶"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    for cx in c.wins['xs'][:2]: picnic(c, cx, Z1 - 1.2)
    for cz in (-0.75, 2.75): picnic(c, X0 + 1.1, cz, along='z')
    c.wood.rbox(0.6, X1 - 0.3, 0.98, 1.02, Z1 - 0.62, Z1 - 0.2, r=0.006, seg=1); c.vm.cbox(0.7, X1 - 0.4, 0.0, 0.98, Z1 - 0.26, Z1 - 0.22, '#5a5f63')
    c.block(0.58, X1 - 0.28, Z1 - 0.65, Z1, 'window_desk')
    for x_ in (1.2, 2.2, 3.2, 4.2, 5.2, 6.2): chair(c, x_, Z1 - 0.95, 0.0, 'bar', '#3f4a52'); c.seat(x_, Z1 - 0.95, 0.0, (x_, Z1 - 0.4), 'study', label='坐窗邊（自習）')
    whiteboard(c, -2.6, 1.4, 'WB', yaw=-PI / 2); whiteboard(c, -2.6, -0.5, 'WB2', yaw=-PI / 2)
    c.look('whiteboard', -3.4, 0.45, 0.9, '白板', '上面寫著期中考範圍和討論的題目（說明文字由 AA 寫）')
    water_station(c, X1 - 0.3, -0.6, face='+z'); cups_stack(c, X1 - 0.3, 1.05, -0.6, 5)
    vend_x(c, X1, 0.2, 1.0, '#3b8f4a')
    c.look('vending', X1 - 1.2, 0.6, 0.9, '販賣機', '飲料（說明文字由 AA 寫）')
    bins_e(c, X1, 1.6)
    K.frame_board(c, 'W', 3.9, 5.0, 1.3, 2.05, '#3a5c4a'); pq(c, 'W', 3.9, 5.0, 1.3, 2.05, 'RULES', inset=0.014)
    K.frame_board(c, 'N', 2.4, 3.6, 1.2, 2.0, '#6a4a30'); pq(c, 'N', 2.4, 3.6, 1.2, 2.0, 'NOTICE', inset=0.014)
    c.look('notice', 3.0, -6.2, 0.9, '公告欄', '讀書會、二手書、系學會（說明文字由 AA 寫）')
    plant(c, 0.2, Z1 - 0.55, 1.1); plant(c, 1.0, 2.2, 1.2)
    K.ac_unit(c, X0, 2.75, 1.0, '+x', w=1.0)


BUILD = {'3f': build_3f, '4f': build_4f}


def build(fid):
    c = Floor(fid); BUILD[fid](c); return finish_floor(c)


if __name__ == '__main__':
    make_tex()
    which = arg('--floor', 'all'); todo = list(BUILD) if which == 'all' else which.split(',')
    if len(todo) == 1:
        p = build(todo[0]); print('LINZE_UPPER', 'OK' if not p else p)
    else:
        import subprocess
        for f in todo: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--floor', f, '--out-dir', OUTDIR], check=False)
