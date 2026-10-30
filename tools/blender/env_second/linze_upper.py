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
REG5 = {'FLOOR5': (0, 0, 512, 160), 'SCR1': (512, 0, 768, 160), 'SCR2': (768, 0, 1024, 160), 'NOTE5': (0, 160, 512, 448), 'BIN1': (0, 448, 256, 512), 'BIN2': (256, 448, 512, 512), 'NOTICE5': (512, 160, 1024, 512),
        'R501': (0, 512, 256, 608), 'R502': (256, 512, 512, 608), 'R503': (512, 512, 768, 608), 'R504': (768, 512, 1024, 608),
        'LAB': (0, 608, 256, 672), 'MEET': (256, 608, 512, 672), 'STAIR': (512, 608, 768, 672), 'LOUNGE': (768, 608, 1024, 672),
        'WB5': (0, 672, 512, 960), 'BIN3': (0, 960, 256, 1024), 'EXAM': (512, 672, 768, 1024), 'POSTIT': (768, 672, 896, 800), 'PAPER': (896, 672, 1024, 800),
        'IO0': (768, 800, 896, 912), 'IO1': (896, 800, 1024, 912), 'IO2': (768, 912, 896, 1024), 'IO3': (896, 912, 1024, 1024)}
CUR = {'reg': REG}                    # 這一層用哪一張印刷品貼圖集（5F 另外一張：linze_5f_print.png）
FLOORS = {
    '3f': dict(name='法律系館A 3F', label='3F 討論區', sign='FLOOR3', rooms=[('R301', -4.6, '301 教室'), ('R302', -0.6, '302 教室')], up='4f', down='2f'),
    '4f': dict(name='法律系館A 4F', label='4F 自習討論區', sign='FLOOR4', rooms=[('R401', -4.6, '401 教室'), ('R402', -0.6, '402 研討室')], up=None, down='3f'),
    # 5F 研究室樓層（CLOSED-SPACES-1023；AA_399 第 1 節，AA-B 2026-10-23）：北牆四間教授研究室（不能進）；南邊西端碩士班研究室（學姊的位子靠窗）、中間交誼區、東邊會議室（門上可以貼「口試中」）
    '5f': dict(name='法律系館A 5F', label='5F 研究室', sign='FLOOR5', rooms=[('R501', -6.2, '501 研究室'), ('R502', -3.6, '502 研究室'), ('R503', -1.0, '503 研究室'), ('R504', 1.6, '504 研究室')], up=None, down='4f',
               atlas='linze_5f_print.png', benches=(5.0,), up_closed=('往 6F 以上', '6 樓以上是教授研究室，樓梯間的門要刷教職員證。'),
               src='使用者 10-23「遊戲裡任何現在關起來的空間都可以開始開發」；AA_399 第 1 節（AA-B）；CLOSED-SPACES-1023（LAWWW2-B）',
               lights=[(x, -5.2, None) for x in (-6.0, -3.0, 0.0, 3.0, 6.0)] + [(-5.7, -1.6, None)] + [(-5.7, z, 'lab') for z in (1.6, 3.7, 5.6)]
                      + [(x, z, None) for x in (-1.8, 1.0) for z in (-1.4, 2.0, 5.0)] + [(5.45, 1.4, None), (5.45, 4.4, None), (6.9, -1.9, None)]),
}


def F(n): return ImageFont.truetype(CJK, n)


def uv(key):
    x0, y0, x1, y1 = CUR['reg'][key]; return (x0 / 1024, 1 - y1 / 1024, x1 / 1024, 1 - y0 / 1024)


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
        self.sid = 'linze_' + fid; self.fid = fid; self.FD = FLOORS[fid]; CUR['reg'] = REG5 if fid == '5f' else REG; self.T = {'name': self.FD['name'], 'sub': self.FD['label']}
        self.S = dict(trim='#5a5f63', wainH=0.12)
        self.W, self.D = LZ['W'], LZ['D']; self.X0, self.X1, self.Z0, self.Z1 = -self.W / 2, self.W / 2, -self.D / 2, self.D / 2
        self.rng = random.Random(3400 + int(fid[0])); self.extra = {}
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
            'ceil': L.pbr(f'{self.sid}_ceiling', 'ceiling_interior', tile=1.2, target='#eeeeea', contrast=0.6, normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.9, cull=True),   # 單面朝下（10-22：原本雙面朝上，拉遠、往上拖是一大片白）
            'print': img_mat(f'{self.sid}_print', self.FD.get('atlas', 'linze_upper_print.png'), rough=0.55),
            'screen': img_mat(f'GLOW_{self.sid}_screens', self.FD['atlas'], rough=0.3, emit=0.9) if 'atlas' in self.FD else img_mat('GLOW_l118_screens', 'l118_screens.png', rough=0.3, emit=0.9),
        }
        self.vc = CMesh(f'{self.sid}_props', M['vc']); self.vm = CMesh(f'{self.sid}_metal', M['vcm'])
        self.wood = Mesh(f'{self.sid}_woodparts', M['wood']); self.steel = Mesh(f'{self.sid}_steel', M['steel'])
        self.tube = Mesh(f'{self.sid}_tubes', M['tube']); self.warm = Mesh(f'{self.sid}_warm', M['warm']); self.fridgel = Mesh(f'{self.sid}_fridgelight', M['fridge'])
        self.prt = Mesh(f'{self.sid}_prints', M['print']); self.scr = Mesh(f'{self.sid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}; self.WGP = {}; self.PDIR = {}; self.lay_extra = {}
        self.labtube = Mesh('LAB_tubes', M['tube'])                   # 碩士班研究室的日光燈（5F；事件只開學姊那一盞檯燈的時候關掉）


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
            x, z = T(k * 0.6, s_ * bz); c.seat(x, z, yaw + (PI if s_ > 0 else 0.0), (cx, cz), 'study', ap=T(k * 0.6, s_ * (bz + 0.45)), label='坐長椅');   # 走近點：長椅外面 0.45 m c.seats[-1]['uses'] = ['討論', '讀書', '吃東西']   # kind study：坐下的選單有「讀書」；吃東西、和同學討論由 LAWWW 接


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
    ce = Mesh(f'{c.sid}_ceiling', M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)   # 朝下
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
    uvquad(c.prt, [(dx1 + 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.3, ez0 - 0.005), (dx0 - 0.2, 2.68, ez0 - 0.005), (dx1 + 0.2, 2.68, ez0 - 0.005)], uv(c.FD['sign']))   # 樓層牌（電梯門上面，朝走廊 −z：從走廊看，+x 在左手邊——10-20 截圖發現原本字是反的）
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
    for bx in c.FD.get('benches', (-2.6, 5.0)):
        c.wood.rbox(bx - 0.7, bx + 0.7, 0.43, 0.47, Z0 + 0.05, Z0 + 0.45, r=0.01, seg=2)
        for lx in (bx - 0.6, bx + 0.6): c.vm.cbox(lx - 0.025, lx + 0.025, 0.0, 0.43, Z0 + 0.08, Z0 + 0.42, '#5a5f63')
        c.block(bx - 0.72, bx + 0.72, Z0, Z0 + 0.47, 'bench')
        for k in (-0.4, 0.4): c.seat(bx + k, Z0 + 0.25, 0.0, (bx + k, Z0 + 0.8), 'sit', label='坐在走廊的長椅')   # 背靠北牆、面向南
    # 結構柱（走廊和討論區中間）
    for x in (-6.0, -2.4, 1.2):
        c.vc.cbox(x - 0.25, x + 0.25, 0.0, H, -3.65, -3.15, '#e4e0d7'); c.vc.cbox(x - 0.255, x + 0.255, 0.0, 0.12, -3.655, -3.145, '#6f6c68')
        c.block(x - 0.27, x + 0.27, -3.67, -3.13, 'column')
    # 日光燈（嵌在天花板，一排一排）；5F 有隔間：照 FLOORS 的 lights（研究室那幾盞另外一個網格 LAB_tubes）
    LT = c.FD.get('lights') or [(x, z, None) for x in (-6.0, -3.0, 0.0, 3.0, 6.0) for z in (-5.2, 0.4, 3.6) if not (ex0 - 0.5 < x < ex1 + 0.5 and ez0 - 0.5 < z < ez1 + 0.5)]
    for (x, z, grp) in LT:
        c.vc.cbox(x - 0.62, x + 0.62, H - 0.02, H, z - 0.32, z + 0.32, '#f4f4f1'); (c.labtube if grp == 'lab' else c.tube).box(x - 0.58, x + 0.58, H - 0.026, H - 0.02, z - 0.28, z + 0.28)
    # 出入口：電梯、樓梯間
    c.spawn = dict(x=round((dx0 + dx1) / 2, 3), z=round(ez0 - 1.7, 3), yaw=PI, note='出電梯，面向走廊（北）；離電梯的按鈕 1 m（不會一出來就站在「電梯」上）')
    c.spawn_stair = dict(x=7.0, z=round(Z0 + 1.5, 3), yaw=0.0, note='從樓梯間進來，面向南；離樓梯間的門 1.5 m（不會一上來就站在「走樓梯」上）')
    c.exits = []
    c.block(X0, X1, Z1 - 0.32, Z1, 'window_sill')                                                          # 窗台（1.3 m 高、往內凸 30 cm）：走到窗邊不會穿過去
    c.look('elevator', round((dx0 + dx1) / 2, 3), round(ez0 - 0.7, 3), 0.8, '電梯', dev='LAWWW 接：樓層照 elevator.floors')
    c.look('stairs', 7.0, round(Z0 + 0.55, 3), 0.7, '樓梯間', dev='LAWWW 接：stairs.up／down')


def finish_floor(c):
    D = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items():
            uv = key in ('wall', 'wain', 'door'); mg = key not in ('print', 'screen', 'view')
            m.finish(c.root, props=dict({'dir': D.get(k) or c.PDIR[k]}, **c.WGP.get(k, {})), uv=uv, merge=mg)
    for m in (c.vc, c.vm, c.tube, c.warm, c.fridgel, c.steel): m.finish(c.root, uv=False)
    if not c.labtube.empty(): c.labtube.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    for m in c.extra.values(): m.finish(c.root, uv=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith(('WALL_', 'LAB_')), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{c.sid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    FD = c.FD
    efl = [dict(label='1F 大廳', zone='linze', lv=0, open=True), dict(label='2F 201、202 教室', zone='linze', lv=1, open=True),
           dict(label='3F 討論區、301、302', zone='linze_3f', open=True), dict(label='4F 自習討論區、401、402', zone='linze_4f', open=True),
           dict(label='5F–8F 研究室（教職員）', open=False, closed='研究室樓層。電梯要刷教職員證才會停。')]
    if c.fid == '5f': efl = efl[:4] + [dict(label='5F 研究室', zone='linze_5f', open=True), dict(label='6F–8F 研究室（教職員）', open=False, closed='研究室樓層。電梯要刷教職員證才會停。')]
    stairs = dict(door=dict(x=7.0, z=c.Z0, w=1.0), spawn=c.spawn_stair, down=dict(label='走樓梯下樓（' + FD['down'].upper() + '）', to='linze' if FD['down'] == '2f' else 'linze_' + FD['down'], spawn=dict(x=7.0, z=-4.7, lv=1, yaw=0.0) if FD['down'] == '2f' else None, note='2F：linze 第 1 層，迴廊上、樓梯間的門（stairs3f）前面 1.5 m' if FD['down'] == '2f' else '下一層的 spawn_stair'),
                  up=(dict(label='走樓梯上樓（' + FD['up'].upper() + '）', to='linze_' + FD['up'], note='上一層的 spawn_stair') if FD['up'] else dict(label=FD.get('up_closed', ('往 5F 以上',))[0], closed=FD.get('up_closed', ('', '5 樓以上是研究室，樓梯間的門要刷教職員證。'))[1])))
    lay = dict(version=1, zone=c.sid, name=FD['name'], label=FD['label'], src=FD.get('src', '使用者 10-20（X73、X74）；LINZE-34F-TABLES-1020、LINZE-WANCAI-FLOORS-1020'),
               bounds=dict(x0=c.X0, x1=c.X1, z0=c.Z0, z1=c.Z1), h=H, cam_dist=4.4, coords='和 linze_layout.js 同一套（x、z），每層自己的地板 y＝0',
               spawn=c.spawn, elevator=dict(EL, floors=efl, note='位置和 linze_layout.js 的 elevator 相同；樓層清單取代原本的「整修中」'),
               stairs=stairs, doors=c.doors, windows=c.wins, exits=c.exits, seats=c.seats, interact=c.inter, blocks=c.blocks, order=None, **c.lay_extra)
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
    for cx in c.wins['xs']: picnic(c, cx, Z1 - 2.2)                                                   # 靠窗：和窗台之間留 0.9 m（外側那條長椅也走得進去；10-20 reachability_all）
    for cz in (-1.2, 2.0): picnic(c, X0 + 2.2, cz, along='z')                                          # 靠牆：和西牆之間留 0.9 m（靠牆那條長椅也走得進去）；兩張中間 1.2 m、和窗邊那張 1.0 m
    # 東牆（北段）：微波爐台、飲水機；販賣機；回收桶
    counter(c, X1 - 0.6, X1, -2.9, -1.3, h=0.9, top='wood', front='#d9d6cf', why='microwave_counter')
    for (za, zb) in ((-2.75, -2.25), (-2.0, -1.5)):
        c.vc.crbox(X1 - 0.5, X1 - 0.08, 0.9, 1.2, za, zb, '#ecebe6', r=0.015, seg=1)                     # 微波爐（門朝西）
        c.vc.cbox(X1 - 0.504, X1 - 0.5, 0.94, 1.16, za + 0.03, za + 0.35, '#202428'); c.fridgel.box(X1 - 0.504, X1 - 0.5, 1.12, 1.16, za + 0.38, za + 0.46)
    c.look('microwave', X1 - 1.1, -2.1, 0.9, '微波爐', dev='熱便當；遊戲裡顯示的字等 AA 寫')
    water_station(c, X1 - 0.3, -0.6, face='+z'); cups_stack(c, X1 - 0.3, 1.05, -0.6, 5)
    for (z0_, col) in ((0.2, '#c8322a'), (1.05, '#2f6fb0')): vend_x(c, X1, z0_, z0_ + 0.8, col)
    c.look('vending', X1 - 1.2, 1.05, 0.9, '販賣機', dev='飲料；遊戲裡顯示的字等 AA 寫')
    bins_e(c, X1, 2.3)
    c.look('bins', X1 - 1.0, 2.95, 0.8, '回收桶', '垃圾分類：一般垃圾、資源回收、廚餘')
    K.frame_board(c, 'W', 3.9, 5.0, 1.3, 2.05, '#3a5c4a'); pq(c, 'W', 3.9, 5.0, 1.3, 2.05, 'RULES', inset=0.014)
    K.frame_board(c, 'N', 2.4, 3.6, 1.2, 2.0, '#6a4a30'); pq(c, 'N', 2.4, 3.6, 1.2, 2.0, 'NOTICE', inset=0.014)
    c.look('notice', 3.0, -6.2, 0.9, '公告欄', dev='讀書會、二手書、系學會；遊戲裡顯示的字等 AA 寫')
    plant(c, -0.2, 2.2, 1.3); plant(c, 3.4, 2.2, 1.2)
    K.ac_unit(c, X0, 2.75, 1.0, '+x', w=1.0, fade=True)


def bins_e(c, xw, z0):
    """三個回收桶背靠東牆（面向 −x），貼標籤"""
    for k, (col, key) in enumerate((('#5a5a5a', 'BIN1'), ('#2f6fb0', 'BIN2'), ('#3b8f4a', 'BIN3'))):
        za = z0 + k * 0.46; c.vc.crbox(xw - 0.45, xw - 0.05, 0.0, 0.78, za, za + 0.4, col, r=0.03, seg=1); c.vc.cbox(xw - 0.42, xw - 0.08, 0.78, 0.8, za + 0.03, za + 0.37, '#2b2b2b')
        x_ = xw - 0.452; uvquad(c.prt, [(x_, 0.5, za + 0.03), (x_, 0.5, za + 0.37), (x_, 0.64, za + 0.37), (x_, 0.64, za + 0.03)], uv(key))   # 朝 −x：從房間裡看 −z 在左手邊（和電梯的樓牌一樣，原本是反的）
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
    for cx in c.wins['xs'][:2]: picnic(c, cx, Z1 - 2.2)
    for cz in (-1.2, 2.0): picnic(c, X0 + 2.2, cz, along='z')
    c.wood.rbox(0.6, X1 - 0.3, 0.98, 1.02, Z1 - 0.62, Z1 - 0.2, r=0.006, seg=1); c.vm.cbox(0.7, X1 - 0.4, 0.0, 0.98, Z1 - 0.26, Z1 - 0.22, '#5a5f63')
    c.block(0.58, X1 - 0.28, Z1 - 0.65, Z1, 'window_desk')
    for x_ in (1.2, 2.2, 3.2, 4.2, 5.2, 6.2): chair(c, x_, Z1 - 0.95, 0.0, 'bar', '#3f4a52'); c.seat(x_, Z1 - 0.95, 0.0, (x_, Z1 - 0.4), 'study', ap=(x_, Z1 - 1.4), label='坐窗邊（自習）')   # 走近點在高腳椅後面 0.45 m（座位按鈕 0.7 m：原本預設 0.6 m，差一點就看不到按鈕）
    whiteboard(c, -2.6, 1.4, 'WB', yaw=-PI / 2); whiteboard(c, -2.6, -0.5, 'WB2', yaw=-PI / 2)
    c.look('whiteboard', -3.4, 0.45, 0.9, '白板', dev='期中考範圍和討論的題目；遊戲裡顯示的字等 AA 寫')
    water_station(c, X1 - 0.3, -0.6, face='+z'); cups_stack(c, X1 - 0.3, 1.05, -0.6, 5)
    vend_x(c, X1, 0.2, 1.0, '#3b8f4a')
    c.look('vending', X1 - 1.2, 0.6, 0.9, '販賣機', dev='飲料；遊戲裡顯示的字等 AA 寫')
    bins_e(c, X1, 1.6)
    K.frame_board(c, 'W', 3.9, 5.0, 1.3, 2.05, '#3a5c4a'); pq(c, 'W', 3.9, 5.0, 1.3, 2.05, 'RULES', inset=0.014)
    K.frame_board(c, 'N', 2.4, 3.6, 1.2, 2.0, '#6a4a30'); pq(c, 'N', 2.4, 3.6, 1.2, 2.0, 'NOTICE', inset=0.014)
    c.look('notice', 3.0, -6.2, 0.9, '公告欄', dev='讀書會、二手書、系學會；遊戲裡顯示的字等 AA 寫')
    plant(c, 0.2, Z1 - 0.55, 1.1); plant(c, 1.0, 2.2, 1.2)
    K.ac_unit(c, X0, 2.75, 1.0, '+x', w=1.0, fade=True)


def make_tex5():
    """5F 研究室樓層的印刷品貼圖集（linze_5f_print.png）：樓層牌、螢幕畫面、公告欄、門牌、研究室白板、「口試中」、便利貼、在室狀態牌。
    內容是虛構的研究室日常，沒有真實姓名、課號、教授名字（門牌只寫房號）"""
    R = REG5; im = Image.new('RGB', (1024, 1024), '#808080'); d = ImageDraw.Draw(im); rr = random.Random(55)
    x0, y0, x1, y1 = R['FLOOR5']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(58, 62, 66)); d.text((x0 + 26, y0 + 18), '5F', font=F(112), fill=(240, 240, 236)); d.text((x0 + 200, y0 + 56), '研究室・會議室', font=F(40), fill=(220, 220, 214))
    # 螢幕：SCR1 論文的文書檔（白頁、灰色字行；標題一行深一點）、SCR2 試算表
    x0, y0, x1, y1 = R['SCR1']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 80)); d.rectangle([x0 + 40, y0 + 10, x1 - 40, y1 - 1], fill=(250, 250, 248))
    d.rectangle([x0, y0, x1 - 1, y0 + 9], fill=(44, 92, 160)); d.rectangle([x0 + 60, y0 + 22, x0 + 150, y0 + 30], fill=(60, 60, 60))
    for k in range(11):
        y = y0 + 40 + k * 10; w = rr.randint(100, 156) if k % 4 != 3 else rr.randint(40, 90); d.rectangle([x0 + 56 + (12 if k % 4 == 0 else 0), y, x0 + 56 + w, y + 3], fill=(150, 150, 150))
    d.rectangle([x0 + 120, y0 + 96, x0 + 200, y0 + 99], fill=(200, 60, 60))                     # 一行紅色的修訂
    x0, y0, x1, y1 = R['SCR2']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 248)); d.rectangle([x0, y0, x1 - 1, y0 + 12], fill=(40, 120, 70))
    for k in range(13): d.line([x0, y0 + 24 + k * 11, x1, y0 + 24 + k * 11], fill=(205, 205, 205))
    for k in range(6): d.line([x0 + 30 + k * 40, y0 + 13, x0 + 30 + k * 40, y1], fill=(205, 205, 205))
    for k in range(12):
        for j in range(5):
            if rr.random() < 0.7: d.rectangle([x0 + 36 + j * 40, y0 + 28 + k * 11, x0 + 36 + j * 40 + rr.randint(12, 30), y0 + 31 + k * 11], fill=(120, 120, 120))
    # 研究室公約（研究室門裡面那一面）
    x0, y0, x1, y1 = R['NOTE5']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 248, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 64], fill=(58, 92, 74))
    ctext(d, (x0 + x1) / 2, y0 + 12, '研究室公約', F(40), (255, 255, 255))
    for k, ln in enumerate(['講電話請到走廊', '冰箱的東西寫名字和日期', '最後離開的人關燈、關冷氣', '印表機沒紙了請補', '鑰匙不要借給別人']):
        d.text((x0 + 30, y0 + 80 + k * 40), '・' + ln, font=F(28), fill=(50, 50, 46))
    for key, t, col in (('BIN1', '一般垃圾', (90, 90, 90)), ('BIN2', '資源回收', (40, 110, 180)), ('BIN3', '廚餘', (70, 140, 60))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 10, t, F(40), (255, 255, 255))
    # 公告欄（走廊）：口試公告（只有格式，沒有名字）、期刊、影印卡、借鑰匙
    x0, y0, x1, y1 = R['NOTICE5']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(176, 132, 88))
    for k, (t, col) in enumerate([('碩士論文口試\n地點：5F 會議室\n請保持安靜', (250, 250, 250)), ('新到期刊\n已上架\n交誼區書架', (210, 232, 246)), ('影印卡加值\n請洽系辦', (250, 228, 140)),
                                  ('研究室鑰匙\n借用登記', (232, 246, 214)), ('走廊請勿\n大聲講電話', (250, 214, 214)), ('學術研討會\n徵稿', (240, 236, 250))]):
        px, py = x0 + 20 + (k % 3) * 164, y0 + 20 + (k // 3) * 166; w, h = 150, 150
        d.rectangle([px, py, px + w, py + h], fill=col); d.ellipse([px + w / 2 - 6, py + 4, px + w / 2 + 6, py + 16], fill=(200, 40, 40))
        for j, ln in enumerate(t.split('\n')): ctext(d, px + w / 2, py + 26 + j * 36, ln, F(24 if len(ln) > 5 else 26), (60, 50, 40))
    for key, t in (('R501', '501'), ('R502', '502'), ('R503', '503'), ('R504', '504')):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 76)); d.text((x0 + 22, y0 + 14), t, font=F(60), fill=(240, 240, 236)); d.text((x0 + 140, y0 + 34), '研究室', font=F(32), fill=(214, 214, 208))
    for key, t, col in (('LAB', '碩士班研究室', (58, 92, 74)), ('MEET', '會議室', (64, 70, 76)), ('STAIR', '樓梯間', (58, 92, 74)), ('LOUNGE', '交誼區', (64, 70, 76))):
        x0, y0, x1, y1 = R[key]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=col); ctext(d, (x0 + x1) / 2, y0 + 12, t, F(36 if len(t) > 3 else 40), (255, 255, 255))
    # 研究室的白板：論文進度（沒有名字，只有章節）
    x0, y0, x1, y1 = R['WB5']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 250, 250))
    for k, ln in enumerate(['論文進度', '第一章　✓', '第二章　✓', '第三章　修改中', '第四章　——', '口試前一個月交全文']):
        d.text((x0 + 30 + rr.randint(-6, 6), y0 + 20 + k * 44), ln, font=F(40 if k == 0 else 30), fill=[(30, 60, 160), (40, 40, 40), (40, 40, 40), (180, 40, 40), (40, 40, 40), (30, 120, 60)][k])
    # 口試中（A4 直式；平常藏起來）
    x0, y0, x1, y1 = R['EXAM']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(252, 252, 250))
    ctext(d, (x0 + x1) / 2, y0 + 70, '口試中', F(64), (170, 30, 30)); ctext(d, (x0 + x1) / 2, y0 + 170, '請勿進入', F(40), (40, 40, 40)); ctext(d, (x0 + x1) / 2, y0 + 240, '謝謝', F(30), (90, 90, 90))
    d.rectangle([x0 + 8, y0 + 4, x0 + 48, y0 + 16], fill=(230, 220, 170)); d.rectangle([x1 - 48, y0 + 4, x1 - 8, y0 + 16], fill=(230, 220, 170))   # 膠帶
    # 便利貼（字看不清楚：只有手寫的筆畫）
    x0, y0, x1, y1 = R['POSTIT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(248, 226, 112))
    for k in range(4):
        y = y0 + 22 + k * 24; pts = [(x0 + 14 + j * 9, y + rr.randint(-5, 5)) for j in range(rr.randint(7, 11))]; d.line(pts, fill=(60, 60, 90), width=2)
    # 論文影印稿最上面一張
    x0, y0, x1, y1 = R['PAPER']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); d.rectangle([x0 + 34, y0 + 10, x1 - 34, y0 + 16], fill=(70, 70, 70))
    for k in range(12): d.rectangle([x0 + 14, y0 + 26 + k * 8, x0 + 14 + rr.randint(70, 100), y0 + 28 + k * 8], fill=(150, 150, 150))
    # 教授研究室門口的在室狀態牌（四格，紅色磁鐵在其中一格）
    for i in range(4):
        x0, y0, x1, y1 = R[f'IO{i}']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(236, 236, 230)); d.rectangle([x0, y0, x1 - 1, y1 - 1], outline=(120, 120, 116), width=3)
        for k, t in enumerate(['在研究室', '上課中', '外出', '開會中']):
            d.text((x0 + 14, y0 + 8 + k * 25), t, font=F(20), fill=(50, 50, 50))
            if k == i: d.ellipse([x1 - 30, y0 + 10 + k * 25, x1 - 12, y0 + 28 + k * 25], fill=(200, 40, 40))
    im.save(os.path.join(GEN, 'linze_5f_print.png'))


def tquad(m, cx, cy, cz, n, w, h, key):
    """直立的印刷品：中心 (cx, cy, cz)、朝向 n＝(nx, nz)（從那一側看字是正的）、寬 w、高 h"""
    rx, rz = n[1], -n[0]
    uvquad(m, [(cx - rx * w / 2, cy - h / 2, cz - rz * w / 2), (cx + rx * w / 2, cy - h / 2, cz + rz * w / 2), (cx + rx * w / 2, cy + h / 2, cz + rz * w / 2), (cx - rx * w / 2, cy + h / 2, cz - rz * w / 2)], uv(key))


def hquad(m, cx, y, cz, up, w, d, key):
    """平放的紙（朝上）：up＝字的上方往哪裡（(ux, uz)，從另一邊看過來）、寬 w、長 d"""
    rx, rz = -up[1], up[0]
    P = lambda a, b: (cx + rx * a + up[0] * b, y, cz + rz * a + up[1] * b)
    uvquad(m, [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)], uv(key))


def partition(c, key, axis, at, a0, a1, gaps=(), dir_=(0, 0, 1), t=0.1):
    """隔間牆（石膏板、兩面踢腳板、門洞上的門楣、門框）：axis 'x'＝沿 x 的牆（z＝at）、'z'＝沿 z 的牆（x＝at）；gaps＝門洞 [(b0, b1)]。
    網格叫 WALL_<key>_*，props partition＝1（zones3d.js fadeWalls：鏡頭和玩家在牆的兩邊才淡出）；dir＝備用的法線（人常在的那一側）"""
    c.WG.setdefault(key, {}); c.PDIR[key] = list(dir_); c.WGP[key] = {'partition': 1}
    wl = c.wg(key, 'wall', c.M['wall']); wn = c.wg(key, 'wain', c.M['wain']); tr = c.wg(key, 'trim', c.M['vc'], cm=True); h = t / 2
    def BX(m, b0, b1, y0, y1, th=h, col=None):
        x0, x1, z0, z1 = (b0, b1, at - th, at + th) if axis == 'x' else (at - th, at + th, b0, b1)
        m.box(x0, x1, y0, y1, z0, z1) if col is None else m.cbox(x0, x1, y0, y1, z0, z1, col)
    cuts = [a0] + [v for g in sorted(gaps) for v in g] + [a1]
    for k in range(0, len(cuts), 2):
        b0, b1 = cuts[k], cuts[k + 1]
        if b1 - b0 < 1e-3: continue
        BX(wl, b0, b1, 0.12, H); BX(wn, b0, b1, 0.0, 0.12, th=h + 0.006)
        if axis == 'x': c.block(b0, b1, at - h, at + h, 'partition')
        else: c.block(at - h, at + h, b0, b1, 'partition')
    for (g0, g1) in gaps:
        BX(wl, g0, g1, 2.25, H)
        BX(tr, g0 - 0.05, g0 + 0.03, 0.0, 2.25, th=h + 0.015, col='#8a8f93'); BX(tr, g1 - 0.03, g1 + 0.05, 0.0, 2.25, th=h + 0.015, col='#8a8f93'); BX(tr, g0 - 0.05, g1 + 0.05, 2.17, 2.25, th=h + 0.015, col='#8a8f93')


def grad_desk(c, cx, cz, yaw, w=1.4, d=0.7, ped=True):
    """研究室的桌子（淺色木紋桌面、灰色鐵腳、右邊一個三層抽屜櫃）；坐的人面向 yaw（rot 的本地座標：lz＝往桌子裡面）。回傳本地座標的轉換"""
    T = rot(cx, cz, yaw)
    rbox(c.wood, T, -w / 2, w / 2, 0.72, 0.75, -d / 2, d / 2, r=0.006, seg=1)
    rbox(c.vm, T, -w / 2 + 0.02, -w / 2 + 0.05, 0.0, 0.72, -d / 2 + 0.04, d / 2 - 0.04, '#9aa0a4')
    rbox(c.vm, T, -w / 2 + 0.05, w / 2 - 0.05, 0.3, 0.7, d / 2 - 0.05, d / 2 - 0.03, '#b4b9bd')
    if ped:
        rbox(c.vc, T, w / 2 - 0.44, w / 2 - 0.02, 0.0, 0.66, -d / 2 + 0.04, d / 2 - 0.06, '#d6d3cc', r=0.004, seg=1)
        for k in range(3): rbox(c.vc, T, w / 2 - 0.4, w / 2 - 0.06, 0.06 + k * 0.2, 0.065 + k * 0.2, -d / 2 + 0.035, -d / 2 + 0.04, '#9aa0a4'); rbox(c.vm, T, w / 2 - 0.28, w / 2 - 0.18, 0.15 + k * 0.2, 0.17 + k * 0.2, -d / 2 + 0.02, -d / 2 + 0.035, '#5a5f63')
    else: rbox(c.vm, T, w / 2 - 0.05, w / 2 - 0.02, 0.0, 0.72, -d / 2 + 0.04, d / 2 - 0.04, '#9aa0a4')
    (ax, az), (bx, bz) = T(-w / 2 - 0.02, -d / 2 - 0.02), T(w / 2 + 0.02, d / 2 + 0.02); c.block(min(ax, bx), max(ax, bx), min(az, bz), max(az, bz), 'desk')
    return T


def task_chair(c, x, z, yaw, col='#3a4048'):
    """辦公椅：五爪腳＋輪子、氣壓棒、座墊、扶手、網背（坐的人面向 yaw）"""
    T = rot(x, z, yaw)
    for k in range(5):
        a = yaw + k * 2 * PI / 5; ex, ez = x + 0.27 * math.sin(a), z + 0.27 * math.cos(a)
        ccyl(c.vm, (x, 0.1, z), (ex, 0.065, ez), 0.016, '#2b2b2b', seg=6); csph(c.vc, (ex, 0.03, ez), 0.03, '#1a1a1a', seg=6, rings=4)
    ccyl(c.vm, (x, 0.1, z), (x, 0.42, z), 0.024, '#9aa0a4', seg=8)
    rbox(c.vc, T, -0.24, 0.24, 0.42, 0.49, -0.22, 0.23, col, r=0.03, seg=2)
    for lx in (-0.26, 0.26): rbox(c.vm, T, lx - 0.015, lx + 0.015, 0.45, 0.64, -0.08, -0.04, '#2b2b2b'); rbox(c.vc, T, lx - 0.03, lx + 0.03, 0.64, 0.67, -0.16, 0.12, '#2b2b2b', r=0.01, seg=1)
    rbox(c.vm, T, -0.03, 0.03, 0.42, 0.62, -0.27, -0.21, '#2b2b2b')
    rbox(c.vc, T, -0.23, 0.23, 0.6, 1.08, -0.29, -0.25, col, r=0.03, seg=2)
    rbox(c.vc, T, -0.2, 0.2, 0.64, 1.04, -0.25, -0.245, '#4a525c')


def monitor(c, T, lx, lz, key, w=0.56, h=0.33):
    """桌上的螢幕（朝坐的人）：底座、支架、外框、畫面（印刷品貼圖集的螢幕畫面，自己發光）"""
    rbox(c.vc, T, lx - 0.12, lx + 0.12, 0.75, 0.765, lz - 0.09, lz + 0.09, '#2b2b2b', r=0.01, seg=1)
    rbox(c.vc, T, lx - 0.025, lx + 0.025, 0.765, 0.95, lz + 0.02, lz + 0.05, '#2b2b2b')
    rbox(c.vc, T, lx - w / 2, lx + w / 2, 0.9, 0.9 + h, lz - 0.02, lz + 0.01, '#1e2024', r=0.006, seg=1)
    if not key: return None                                                                     # 關著的螢幕：只有黑色的外框
    fx, fz = T(lx, lz - 0.021); bx, bz = T(lx, lz + 1.0); n = (fx - bx, fz - bz); L_ = math.hypot(*n); n = (n[0] / L_, n[1] / L_)
    tquad(c.scr, fx, 0.9 + h / 2, fz, n, w - 0.03, h - 0.03, key)
    return n


def desk_lamp(c, T, lx, lz, name='LAB_SIS_LAMP'):
    """檯燈（夾燈式的金屬臂）：燈罩下面亮的那一片是自己的網格（name），事件可以單獨開關"""
    p0 = T(lx, lz); p1 = T(lx - 0.02, lz - 0.05); p2 = T(lx - 0.1, lz - 0.22)
    ccyl(c.vm, (p0[0], 0.75, p0[1]), (p0[0], 0.77, p0[1]), 0.07, '#3a3f45', seg=12)
    ccyl(c.vm, (p0[0], 0.77, p0[1]), (p1[0], 1.12, p1[1]), 0.01, '#3a3f45', seg=6); ccyl(c.vm, (p1[0], 1.12, p1[1]), (p2[0], 1.15, p2[1]), 0.01, '#3a3f45', seg=6)
    ccyl(c.vm, (p2[0], 1.17, p2[1]), (p2[0], 1.08, p2[1]), 0.07, '#3a3f45', seg=12, r2=0.09)
    m = c.extra.setdefault(name, Mesh(name, c.M['warm'])); m.cyl((p2[0], 1.081, p2[1]), (p2[0], 1.079, p2[1]), 0.085, seg=12)


def book_stack(c, T, lx, lz, n, y=0.75, cols=('#7a2a2a', '#2a4a6a', '#e8dcc0', '#3a5a3a', '#c9a24a', '#5a4a6a', '#d8d0c0')):
    """疊起來的書（法典、教科書：沒有字）"""
    for k in range(n):
        t = c.rng.uniform(0.03, 0.06); dw = c.rng.uniform(-0.02, 0.02); col = c.rng.choice(cols)
        rbox(c.vc, T, lx - 0.13 + dw, lx + 0.13 + dw, y, y + t, lz - 0.18, lz + 0.18, col); y += t
    return y


def paper_stack(c, T, lx, lz, n=40, clip=True, y=0.75, up=None):
    """一疊論文影印稿（A4，最上面一張有字）：n 張≈n×0.1 mm；clip＝長尾夾"""
    hgt = n * 0.0011; rbox(c.vc, T, lx - 0.105, lx + 0.105, y, y + hgt, lz - 0.148, lz + 0.148, '#f2f1ec')
    cx, cz = T(lx, lz); ux, uz = T(lx, lz + 1.0); u = (ux - cx, uz - cz); u = u if up is None else up
    hquad(c.prt, cx, y + hgt + 0.0008, cz, u, 0.2, 0.287, 'PAPER')
    if clip: rbox(c.vc, T, lx - 0.025, lx + 0.025, y - 0.002, y + hgt + 0.006, lz + 0.13, lz + 0.155, '#1a1a1a')
    return y + hgt


def sofa(c, x, z, yaw, n=3, col='#6f7d86', cush='#7d8b94', label='坐沙發'):
    """布沙發（交誼區）：n 人座；坐的人面向 yaw"""
    T = rot(x, z, yaw); Lh = 0.31 * n + 0.15
    rbox(c.vc, T, -Lh, Lh, 0.1, 0.42, -0.42, 0.38, col, r=0.04, seg=2)
    rbox(c.vc, T, -Lh, Lh, 0.42, 0.86, -0.44, -0.22, col, r=0.05, seg=2)
    for s_ in (-1, 1): rbox(c.vc, T, s_ * Lh - 0.15 if s_ > 0 else -Lh, Lh if s_ > 0 else -Lh + 0.15, 0.1, 0.62, -0.44, 0.38, col, r=0.04, seg=2)
    for k in range(n):
        lx = -Lh + 0.15 + 0.31 + k * 0.62; rbox(c.vc, T, lx - 0.29, lx + 0.29, 0.42, 0.5, -0.22, 0.36, cush, r=0.04, seg=2)
        sx, sz = T(lx, 0.06); ax, az = T(lx, 0.8); c.seat(sx, sz, yaw, (x, z), 'sit', ap=(ax, az), label=label)
    for lx in (-Lh + 0.08, Lh - 0.08):
        for lz in (-0.36, 0.32): px, pz = T(lx, lz); ccyl(c.vm, (px, 0.0, pz), (px, 0.1, pz), 0.02, '#2b2b2b', seg=6)
    (ax, az), (bx, bz) = T(-Lh - 0.02, -0.46), T(Lh + 0.02, 0.4); c.block(min(ax, bx), max(ax, bx), min(az, bz), max(az, bz), 'sofa')


def copier(c, x0, x1, z0, z1):
    """影印機（正面朝 −z）：機身、掃描蓋、操作面板（小螢幕亮）、紙匣、出紙盤"""
    c.vc.crbox(x0, x1, 0.0, 0.92, z0, z1, '#e2e2de', r=0.02, seg=1); c.vc.crbox(x0 + 0.03, x1 - 0.03, 0.92, 1.06, z0 + 0.04, z1 - 0.02, '#d2d2ce', r=0.015, seg=1)
    for k in range(3): c.vc.cbox(x0 + 0.06, x1 - 0.06, 0.14 + k * 0.17, 0.145 + k * 0.17, z0 - 0.004, z0, '#9a9a96'); c.vc.cbox((x0 + x1) / 2 - 0.08, (x0 + x1) / 2 + 0.08, 0.2 + k * 0.17, 0.22 + k * 0.17, z0 - 0.012, z0, '#5a5f63')
    c.vc.cbox(x1 - 0.32, x1 - 0.04, 1.0, 1.05, z0 - 0.06, z0 + 0.06, '#3a3f45'); c.fridgel.box(x1 - 0.26, x1 - 0.14, 1.05, 1.052, z0 - 0.04, z0 + 0.02)
    c.vc.cbox(x0 - 0.18, x0, 0.62, 0.64, z0 + 0.08, z1 - 0.12, '#cfcfcb'); c.vc.cbox(x0 - 0.16, x0 - 0.02, 0.64, 0.66, z0 + 0.12, z1 - 0.18, '#f6f6f2')
    c.block(x0 - 0.2, x1 + 0.02, z0 - 0.04, z1 + 0.02, 'copier')


def mini_fridge(c, x0, x1, z0, z1, face='+x'):
    """研究室的小冰箱＋上面的熱水壺、馬克杯"""
    c.vc.crbox(x0, x1, 0.0, 0.85, z0, z1, '#ecebe6', r=0.02, seg=1)
    xf = x1 if face == '+x' else x0; s = 1 if face == '+x' else -1
    c.vc.cbox(*sorted((xf, xf + s * 0.004)), 0.6, 0.605, z0 + 0.03, z1 - 0.03, '#b9b9b4'); c.vm.cbox(*sorted((xf, xf + s * 0.03)), 0.3, 0.5, z1 - 0.08, z1 - 0.05, '#9aa0a4')
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    clathe(c.vc, [(0.0, 0.0), (0.08, 0.0), (0.085, 0.16), (0.06, 0.2), (0.0, 0.2)], cx, 0.85, cz - 0.08, '#f4f4f1', seg=14)
    for k, col in enumerate(('#c86a4a', '#f4f4f1', '#3a5c7a')): clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.095), (0.0, 0.095)], cx - 0.08 + k * 0.08, 0.85, cz + 0.13, col, seg=10)
    c.block(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, 'fridge')


def wb_wall(c, key_wall, axis, at, n, a0, a1, y0, y1, key):
    """掛在隔間牆上的白板（鋁框＋白板面是印刷品）：跟著那一面隔間牆淡出"""
    tr = c.wg(key_wall, 'trim', c.M['vc'], cm=True); pr = c.wg(key_wall, 'print', c.M['print']); off = 0.06
    if axis == 'x':
        z_ = at + n[1] * off; tr.cbox(a0 - 0.03, a1 + 0.03, y0 - 0.03, y1 + 0.03, *sorted((at, z_ + n[1] * 0.01)), '#c9ced2'); tquad(pr, (a0 + a1) / 2, (y0 + y1) / 2, z_ + n[1] * 0.012, n, a1 - a0, y1 - y0, key)
    else:
        x_ = at + n[0] * off; tr.cbox(*sorted((at, x_ + n[0] * 0.01)), y0 - 0.03, y1 + 0.03, a0 - 0.03, a1 + 0.03, '#c9ced2'); tquad(pr, x_ + n[0] * 0.012, (y0 + y1) / 2, (a0 + a1) / 2, n, a1 - a0, y1 - y0, key)


def board(c, key_wall, axis, at, n, a0, a1, y0, y1, key, frame='#c9ced2', t=0.05):
    """掛在隔間牆上的板子（白板、公告欄、告示）：框＋印刷品，跟著那一面隔間牆淡出；n＝朝哪一側（(nx, nz)）"""
    tr = c.wg(key_wall, 'trim', c.M['vc'], cm=True); pr = c.wg(key_wall, 'print', c.M['print']); s = 0.05 + 0.006   # 牆面（含踢腳板的厚度）
    if axis == 'x':
        z_ = at + n[1] * s; tr.cbox(a0 - 0.03, a1 + 0.03, y0 - 0.03, y1 + 0.03, *sorted((z_ - n[1] * 0.01, z_ + n[1] * t * 0.3)), frame); tquad(pr, (a0 + a1) / 2, (y0 + y1) / 2, z_ + n[1] * (t * 0.3 + 0.002), n, a1 - a0, y1 - y0, key)
    else:
        x_ = at + n[0] * s; tr.cbox(*sorted((x_ - n[0] * 0.01, x_ + n[0] * t * 0.3)), y0 - 0.03, y1 + 0.03, a0 - 0.03, a1 + 0.03, frame); tquad(pr, x_ + n[0] * (t * 0.3 + 0.002), (y0 + y1) / 2, (a0 + a1) / 2, n, a1 - a0, y1 - y0, key)


def plate(c, key_wall, axis, at, n, a0, a1, y0, y1, key):
    """隔間牆上的門牌（直接貼在牆面上 2 mm）"""
    pr = c.wg(key_wall, 'print', c.M['print']); s = 0.05 + 0.008
    if axis == 'x': tquad(pr, (a0 + a1) / 2, (y0 + y1) / 2, at + n[1] * s, n, a1 - a0, y1 - y0, key)
    else: tquad(pr, at + n[0] * s, (y0 + y1) / 2, (a0 + a1) / 2, n, a1 - a0, y1 - y0, key)


def build_5f(c):
    """5F 研究室樓層（AA_399 第 1 節；使用者 10-23「遊戲裡任何現在關起來的空間都可以開始開發」）：
    北邊走廊兩側：北牆四間教授研究室（門牌只寫房號、在室狀態牌，不能進）；樓梯間、電梯和樓下同一個位置。
    南邊：西端碩士班研究室（走廊最後一間；四張桌子，學姊的位子靠窗，窗外對著樹——窗景照片）、中間交誼區（沙發、圓桌、期刊架）、
    東端會議室（門關著；門上「口試中」的告示 WALL_P3_EXAM_SIGN 平常由遊戲藏起來）；電梯井東邊的角落放影印機、飲水機、回收桶。
    隔間牆 WALL_P1～P4_*（partition＝1）；研究室的日光燈 LAB_tubes、學姊的檯燈 LAB_SIS_LAMP 是各自的節點（事件「只開她那一盞燈」用）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1
    shell(c)
    LX, MX = -3.4, 2.9
    partition(c, 'P1', 'x', 0.0, X0, LX + 0.05, gaps=[(-4.8, -3.6)], dir_=(0, 0, -1))      # 研究室北牆（門開著）
    partition(c, 'P2', 'z', LX, 0.05, Z1, dir_=(1, 0, 0))                                    # 研究室東牆
    partition(c, 'P4', 'x', -0.65, MX - 0.05, X1 - 0.005, dir_=(0, 0, -1))                   # 會議室北牆（電梯井後面）
    partition(c, 'P3', 'z', MX, -0.6, Z1, gaps=[(-0.1, 0.9)], dir_=(-1, 0, 0))              # 會議室西牆（門關著）
    # ---- 研究室的門：開著，門片貼著牆（往西轉 180°、門擋）；門牌在門的左邊（走廊那一面）
    dw = c.wg('P1', 'door', c.M['wood']); dm = c.wg('P1', 'doormetal', c.M['vcm'], cm=True)
    dw.rbox(-5.93, -4.83, 0.01, 2.15, 0.062, 0.102, r=0.004, seg=1); dm.cbox(-5.86, -5.8, 0.98, 1.02, 0.102, 0.15, '#c9ced2'); dm.cbox(-5.96, -5.9, 0.0, 0.06, 0.06, 0.12, '#5a5f63')
    plate(c, 'P1', 'x', 0.0, (0, -1), -5.4, -4.95, 1.74, 1.9, 'LAB')
    # ---- 會議室的門：關著（門片、把手在交誼區那一面）；門牌在門的右邊；「口試中」貼在門上（平常藏起來）
    dw3 = c.wg('P3', 'door', c.M['wood']); dm3 = c.wg('P3', 'doormetal', c.M['vcm'], cm=True)
    dw3.rbox(MX - 0.035, MX + 0.035, 0.01, 2.2, -0.095, 0.895, r=0.004, seg=1)                     # 門片的邊伸進門框裡（圓角不留縫：Cycles 預覽看到門縫漏光）
    for sx in (-1, 1): dm3.cbox(*sorted((MX + sx * 0.035, MX + sx * 0.085)), 0.98, 1.02, 0.7, 0.82, '#c9ced2')
    c.block(MX - 0.06, MX + 0.06, -0.1, 0.9, 'meeting_door')
    plate(c, 'P3', 'z', MX, (-1, 0), 1.0, 1.42, 1.74, 1.9, 'MEET')
    ex = c.wg('P3', 'EXAM_SIGN', c.M['print']); tquad(ex, MX - 0.038, 1.47, 0.4, (-1, 0), 0.3, 0.41, 'EXAM')
    c.look('meeting_door', MX - 0.6, 0.4, 0.9, '會議室', '會議室。門關著。', dev='M9 口試那天門上顯示「口試中」（WALL_P3_EXAM_SIGN，平常藏起來）；門口的站位 spots.meeting_door')
    # ---- 碩士班研究室（x −8…−3.4、z 0…7）
    T = grad_desk(c, -5.65, 6.3, 0.0)                                                             # 學姊的位子：靠窗（窗外的樹在窗景照片裡）
    task_chair(c, -5.65, 5.45, 0.0, '#3a4048')
    n = monitor(c, T, 0.12, 0.12, 'SCR1'); px, pz = T(0.12 + 0.3, 0.12 - 0.022)
    tquad(c.prt, px, 1.14, pz, n, 0.07, 0.07, 'POSTIT')                                          # 螢幕旁邊的便利貼（字看不清楚）
    rbox(c.vc, T, -0.2, 0.25, 0.75, 0.765, -0.24, -0.1, '#2b2b2b', r=0.004, seg=1)                # 鍵盤
    rbox(c.vc, T, 0.34, 0.4, 0.75, 0.77, -0.2, -0.12, '#2b2b2b', r=0.01, seg=1)                  # 滑鼠
    rbox(c.vc, T, -0.62, -0.42, 0.75, 0.778, -0.2, 0.08, '#2f5a48', r=0.004, seg=1); rbox(c.vc, T, -0.53, -0.52, 0.75, 0.781, -0.2, 0.08, '#c9a24a')   # 計畫本（深綠封面、書籤繩）
    p0 = T(-0.35, 0.2); clathe(c.vc, [(0.0, 0.0), (0.036, 0.0), (0.038, 0.2), (0.032, 0.215), (0.032, 0.235), (0.0, 0.235)], p0[0], 0.75, p0[1], '#8fa89a', seg=12)   # 保溫瓶
    yb = paper_stack(c, T, 0.48, 0.05, n=60); paper_stack(c, T, 0.5, 0.08, n=25, clip=False, y=yb)                            # 一疊論文影印稿
    desk_lamp(c, T, -0.6, 0.24)                                                                    # 檯燈（LAB_SIS_LAMP）
    p1 = T(0.58, 0.25); clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.0, 0.1)], p1[0], 0.75, p1[1], '#5a5f63', seg=10)   # 筆筒
    for k in range(4): q = T(0.56 + 0.012 * k, 0.24 + 0.008 * (k % 2)); ccyl(c.vc, (q[0], 0.8, q[1]), (q[0], 0.92, q[1]), 0.004, ['#1a3a8a', '#1a1a1a', '#b02a2a', '#1a1a1a'][k], seg=5)
    T = grad_desk(c, -4.2, 6.3, 0.0, w=1.3)                                                       # 她旁邊的桌子（玩家坐這裡；大四「兩張桌子並排」）
    task_chair(c, -4.2, 5.45, 0.0, '#4a5058')
    c.seat(-4.2, 5.45, 0.0, (-4.2, 6.3), 'study', ap=(-4.2, 4.75), label='坐在旁邊的空位')
    rbox(c.vc, T, -0.1, 0.24, 0.75, 0.768, -0.05, 0.19, '#9aa0a4', r=0.006, seg=1)               # 闔上的筆電
    book_stack(c, T, -0.38, 0.12, 3)
    p2 = T(0.42, 0.0); clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.095), (0.0, 0.095)], p2[0], 0.75, p2[1], '#f4f4f1', seg=10)
    for zc in (2.3, 3.9):                                                                         # 西牆兩張（背景的碩士生）
        T = grad_desk(c, -7.58, zc, -PI / 2); task_chair(c, -6.75, zc, -PI / 2, '#3a4048')
        monitor(c, T, -0.1, 0.1, 'SCR2' if zc < 3 else None); rbox(c.vc, T, -0.3, 0.12, 0.75, 0.765, -0.24, -0.1, '#2b2b2b', r=0.004, seg=1)
        book_stack(c, T, 0.45, 0.1, 5 if zc < 3 else 2); paper_stack(c, T, -0.5, -0.05, n=30, clip=zc > 3)
        q = T(0.5, -0.2); clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.095), (0.0, 0.095)], q[0], 0.75, q[1], '#c86a4a' if zc < 3 else '#3a5c7a', seg=10)
    bx, bz = -6.3, 4.35; c.vc.crbox(bx - 0.16, bx + 0.16, 0.0, 0.42, bz - 0.1, bz + 0.12, '#2f3a48', r=0.05, seg=2)   # 地上的後背包
    mini_fridge(c, -7.95, -7.45, 4.9, 5.45, face='+x')
    K.bookshelf(c, -3.85, -3.47, 1.4, 2.8, h=2.0, along='z'); K.bookshelf(c, -3.85, -3.47, 2.85, 4.25, h=2.0, along='z')
    board(c, 'P1', 'x', 0.0, (0, 1), -7.6, -6.1, 0.95, 1.95, 'WB5')                              # 研究室的白板（論文進度）
    board(c, 'P2', 'z', LX, (-1, 0), 0.45, 1.15, 1.3, 1.69, 'NOTE5', frame='#3a5c4a')           # 研究室公約
    K.ac_unit(c, X0, 2.75, 1.0, '+x', w=1.0, fade=True)
    plant(c, -7.55, 6.3, 1.0)
    c.look('lab_whiteboard', -6.85, 0.75, 0.9, '白板', '白板上畫著論文的進度表：第一章、第二章打勾，第三章寫著「修改中」。', dev='暫定的字，AA 可以改')
    c.look('lab_shelf', -4.35, 2.8, 0.9, '書架', '書架上是法典、判決評釋和一排期刊合訂本，書背貼著研究室的編號。', dev='暫定的字，AA 可以改')
    c.look('lab_fridge', -6.95, 5.15, 0.75, '小冰箱', '小冰箱上貼著一張紙：「東西寫名字和日期」。上面放著熱水壺和三個馬克杯。', dev='暫定的字，AA 可以改')
    # ---- 交誼區（x −3.4…2.9）
    sofa(c, -2.88, 3.4, PI / 2)                                                                   # 背靠研究室的隔間牆
    for zc in (2.6, 4.2): sofa(c, -0.82, zc, -PI / 2, n=1, label='坐單人沙發')                  # 對面兩張單人沙發：中間留 1.3 m（走得過去、坐得到）
    c.wood.cyl((-0.72, 0.5, 3.4), (-0.72, 0.53, 3.4), 0.24, seg=20); ccyl(c.vm, (-0.72, 0.0, 3.4), (-0.72, 0.5, 3.4), 0.02, '#5a5f63', seg=8); ccyl(c.vm, (-0.72, 0.0, 3.4), (-0.72, 0.015, 3.4), 0.16, '#5a5f63', seg=14)   # 兩張單人沙發中間的小邊桌
    c.block(-0.98, -0.46, 3.14, 3.66, 'side_table')
    K.table(c, 1.1, 5.0, 0.9, 0.9, top='wood', base='ped')
    for (sx, sz, yw) in ((1.1 - 0.72, 5.0, PI / 2), (1.1 + 0.72, 5.0, -PI / 2), (1.1, 5.0 - 0.72, 0.0), (1.1, 5.0 + 0.72, PI)):
        chair(c, sx, sz, yw, 'wood', '#b08a5e'); c.seat(sx, sz, yw, (1.1, 5.0), 'study', label='坐下')
    K.bookshelf(c, 2.45, 2.83, 2.0, 3.4, h=1.8, along='z'); K.bookshelf(c, 2.45, 2.83, 3.45, 4.85, h=1.8, along='z')
    c.look('journals', 2.0, 3.4, 0.9, '期刊架', '新到的期刊，最上面一本還包著塑膠套。', dev='暫定的字，AA 可以改')
    plate(c, 'P2', 'z', LX, (1, 0), 0.6, 1.0, 1.74, 1.9, 'LOUNGE')
    plant(c, -2.9, 6.3, 1.2); plant(c, 2.35, 6.3, 1.1)
    # ---- 會議室（x 2.9…8；進不去，家具給鏡頭看：鏡頭跑到隔間牆另一邊時看得到裡面）
    K.table(c, 5.5, 3.0, 1.2, 3.6, top='wood')
    for zc in (1.8, 2.6, 3.4, 4.2):
        task_chair(c, 4.45, zc, PI / 2, '#3a4048'); task_chair(c, 6.55, zc, -PI / 2, '#3a4048')
    task_chair(c, 5.5, 5.25, PI, '#3a4048')
    tr4 = c.wg('P4', 'trim', c.M['vc'], cm=True)
    tr4.cbox(4.4, 6.6, 0.95, 2.45, -0.594, -0.585, '#f4f4f1'); tr4.cbox(4.35, 6.65, 2.45, 2.55, -0.594, -0.5, '#3a3f45')   # 投影幕
    tr3 = c.wg('P3', 'trim', c.M['vc'], cm=True); tr3.cbox(MX + 0.056, MX + 0.07, 0.95, 1.95, 2.2, 3.8, '#f6f7f7'); tr3.cbox(MX + 0.056, MX + 0.09, 0.9, 0.93, 2.2, 3.8, '#c9ced2')   # 白板（空白）＋筆槽
    K.ac_unit(c, X1, 2.75, 3.0, '-x', w=1.0, fade=True)
    plant(c, 7.5, 6.3, 1.1)
    # ---- 電梯井東邊的角落：影印機、飲水機、回收桶
    copier(c, 6.3, 7.2, -1.35, -0.72)
    water_station(c, 7.65, -1.05, face='-z'); cups_stack(c, 7.65, 1.05, -1.05, 4)
    bins_e(c, X1, -2.77)
    c.look('copier', 6.75, -2.0, 0.9, '影印機', '影印機旁邊貼著：「卡紙請找系辦，不要硬拉。」', dev='暫定的字，AA 可以改')
    # ---- 走廊：公告欄（研究室隔間牆的走廊那一面）、教授研究室門口的在室狀態牌
    board(c, 'P1', 'x', 0.0, (0, -1), -7.4, -6.2, 1.2, 2.0, 'NOTICE5', frame='#6a4a30')
    c.look('notice', -6.8, -0.8, 0.9, '公告欄', '公告欄：碩士論文口試的公告、新到期刊、影印卡加值。最上面一張寫著「走廊請勿大聲講電話」。', dev='暫定的字，AA 可以改')
    IO = {'R501': (1, '上課中'), 'R502': (2, '外出'), 'R503': (0, '在研究室'), 'R504': (3, '開會中')}
    for d in c.doors:
        if d['kind'] != 'room': continue
        k, st = IO[d['id'].upper()]; pa = d['x'] + d['w'] / 2 + 0.12
        pq(c, 'N', pa + 0.08, pa + 0.32, 1.44, 1.65, f'IO{k}', inset=0.016)
        d['note'] = f'教授研究室。門牌下面的磁鐵放在「{st}」，門關著。'
    plant(c, -7.55, -2.75, 1.1)
    # ---- 配置的其他欄位（給 LAWWW 接事件）
    c.lay_extra = dict(
        rooms=[dict(id='lab', label='碩士班研究室', x0=X0, x1=LX, z0=0.0, z1=Z1, door=dict(x=-4.2, z=0.0, w=1.14, open=True)),
               dict(id='lounge', label='交誼區', x0=LX, x1=MX, z0=-3.15, z1=Z1),
               dict(id='meeting', label='會議室', x0=MX, x1=X1, z0=-0.65, z1=Z1, door=dict(x=MX, z=0.4, w=1.0, open=False), note='進不去（門關著）；家具是給鏡頭看的')],
        spots=dict(sis_desk=dict(x=-5.65, z=5.45, yaw=0.0, ap=[-5.65, 4.75], note='學姊的位子（靠窗）。不放進 seats：玩家不能坐'),
                   beside=dict(x=-4.2, z=5.45, yaw=0.0, note='她旁邊的空位（seats 裡「坐在旁邊的空位」；大四「兩張桌子並排」）'),
                   desk_c=dict(x=-6.75, z=2.3, yaw=round(-PI / 2, 4), ap=[-6.1, 2.3], note='背景碩士生（西牆）'),
                   desk_d=dict(x=-6.75, z=3.9, yaw=round(-PI / 2, 4), ap=[-6.1, 3.9], note='背景碩士生（西牆）'),
                   lab_door=dict(x=-4.2, z=-0.8, yaw=0.0, note='研究室門口（走廊這一側，面向門）'),
                   meeting_door=dict(x=2.25, z=0.4, yaw=round(PI / 2, 4), note='會議室門口（交誼區這一側，面向門）：M9 口試等在門外'),
                   corridor=dict(x=-1.0, z=-5.4, yaw=PI, note='走廊中間（分開談話）')),
        nodes={'WALL_P3_EXAM_SIGN': '會議室門上的「口試中」：遊戲載入後藏起來，M9 口試那天顯示（linze_upper3d.js 的 examSign）',
               'LAB_tubes': '研究室的三盞日光燈（labLights）', 'LAB_SIS_LAMP': '學姊桌上檯燈亮的那一片（labLights）'})


BUILD = {'3f': build_3f, '4f': build_4f, '5f': build_5f}


def build(fid):
    c = Floor(fid); BUILD[fid](c); return finish_floor(c)


if __name__ == '__main__':
    make_tex(); make_tex5()
    which = arg('--floor', 'all'); todo = list(BUILD) if which == 'all' else which.split(',')
    if len(todo) == 1:
        p = build(todo[0]); print('LINZE_UPPER', 'OK' if not p else p)
    else:
        import subprocess
        for f in todo: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--floor', f, '--out-dir', OUTDIR], check=False)
