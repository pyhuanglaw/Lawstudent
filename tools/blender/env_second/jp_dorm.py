"""日本交換那一學期的國際學生宿舍（AA_341 第 5 節「給 LAWWW2 的日本場景清單」優先 1；LAWWW-C 2026-10-20 排、10-21 開工）→ 室內區域的 GLB＋配置：
  /opt/blenv/bin/python tools/blender/env_second/jp_dorm.py [-- --room jp_room|all] [--out-dir assets/models/env/second_ai]
輸出 assets/models/env/second_ai/<id>.glb＋<id>.layout.json（格式和 flat_classroom.py、lane118_shops.py 一樣：bounds、blocks、seats、interact、spawn、exits、windows、view）。
LAWWW2-C 2026-10-21。這一版：
  jp_room：祐廷的單人房（hub：睡覺、讀書、看手機；主線 8 視訊）。
    照使用者通過的 2D 背景 assets/bg/jp_room.webp（BB-C 0758caf3）：左邊靠窗是木頭書桌（伸縮臂檯燈、筆電、筆筒、小盆栽、牆上的層板）、書桌旁邊的書櫃；
    正前方一整面鋁框推拉窗（米白窗簾收在兩邊、窗外一道陽台欄杆）；右邊是木頭床架的單人床（白色棉被、枕頭），床頭靠窗；右邊牆上的掛勾掛著一件外套；灰色地毯；木地板。
    企劃另外要的（AA_341）：「宿舍的房間比想像的小。窗外是一片田，遠一點的地方有一座山。」（3/28 摘要日）、小冰箱（第 5 節）。
    日本宿舍常見、2D 沒畫到的那一側（門口）：玄關（磁磚地＋兩雙鞋，脫鞋的地方）、拉門衣櫃、小冰箱（上面熱水壺、杯子）、交換生的行李箱、牆上的冷氣、圓形吸頂燈。
    窗外的景：tools/blender/env_second/jp_view.py 渲染的照片 assets/models/env/views/jp_room_{day,night}.webp（遊戲 room() 的 view：jp_room）。
  坐標：房間自己的座標，x 東、y 上、z 南；窗在北牆（−z，遊戲 room() 的 winWall 'back'、winXs [0]、winY 1.55），門在南牆靠西。
  牆上的東西都放在那一面牆的群組（WALL_<面>_*）：牆淡出時一起淡出（照 75ef4ae3）。字是虛構的（沒有真實的校名、人名）。
共用零件：lane118_shops.py（K）、flat_classroom.py（FC：part、jacket、backpack、book、seatcheck…）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lane118_shops as K   # noqa: E402
from lane118_shops import L, B, Mesh, CMesh, bpy, uvquad, img_mat, ccyl, clathe, navcheck, auto_ap, g2b, Matrix   # noqa: E402
import flat_classroom as FC   # noqa: E402
from flat_classroom import part, Mloc, lw, mark, newf, jacket, backpack, book, bottle, drape, seatcheck, _tube   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUTDIR = os.path.join(L.ROOT, arg('--out-dir', 'assets/models/env/second_ai'))
GEN = K.GEN; PI = math.pi
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def F(n): return ImageFont.truetype(CJK, n)

ROOMS = {
    'jp_room': dict(name='國際學生宿舍・你的房間', W=2.8, D=4.6, H=2.5, door_x=-0.55, WY=1.55,
                    src='AA_341 第 5 節（優先 1）；2D 背景 jp_room.webp（使用者通過、BB-C 0758caf3）'),
}
REG = {'CAL': (0, 0, 256, 320), 'TT': (256, 0, 512, 256), 'PHOTO': (512, 0, 704, 144), 'RULES': (704, 0, 1024, 300),
       'SCREEN': (256, 256, 512, 416), 'PLATE': (512, 160, 704, 224), 'NOTE1': (512, 240, 608, 336), 'NOTE2': (608, 240, 704, 336)}
def uv(key): x0, y0, x1, y1 = REG[key]; return (x0 / 1024, 1 - y1 / 512, x1 / 1024, 1 - y0 / 512)


def make_tex(rid):
    """房間裡印出來的東西（虛構）：月曆（2028 年 4 月）、自己做的課表、照片（臺灣的家人與朋友，只有背影和風景）、宿舍規則（日文看不清楚，只有灰色的行）、
    筆電螢幕（打開的文件）、門牌、兩張便利貼"""
    im = Image.new('RGB', (1024, 512), '#808080'); d = ImageDraw.Draw(im); rs = random.Random(5)
    x0, y0, x1, y1 = REG['CAL']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 249, 244))
    d.rectangle([x0, y0, x1 - 1, y0 + 120], fill=(126, 160, 120))   # 月曆上半：田的照片（色塊）
    d.rectangle([x0, y0 + 70, x1 - 1, y0 + 120], fill=(98, 132, 86)); d.polygon([(x0, y0 + 70), (x0 + 90, y0 + 30), (x0 + 170, y0 + 62), (x1, y0 + 40), (x1, y0 + 70)], fill=(112, 128, 150))
    d.text((x0 + 12, y0 + 128), '2028  4', font=F(30), fill=(60, 60, 58))
    for r in range(5):
        for k in range(7):
            cx, cy = x0 + 14 + k * 33, y0 + 176 + r * 27; n = r * 7 + k - 5
            if 1 <= n <= 30: d.text((cx, cy), str(n), font=F(16), fill=(200, 60, 60) if k == 0 else (70, 70, 66))
    d.ellipse([x0 + 14 + 3 * 33 - 6, y0 + 176 + 2 * 27 - 4, x0 + 14 + 3 * 33 + 24, y0 + 176 + 2 * 27 + 20], outline=(220, 70, 60), width=2)   # 4/19 圈起來
    x0, y0, x1, y1 = REG['TT']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(253, 252, 248)); d.text((x0 + 12, y0 + 8), '課表', font=F(26), fill=(40, 40, 40))
    for k, t in enumerate('一二三四五'): d.text((x0 + 52 + k * 40, y0 + 46), t, font=F(18), fill=(60, 60, 60))
    for r in range(4): d.line([(x0 + 10, y0 + 76 + r * 42), (x1 - 10, y0 + 76 + r * 42)], fill=(190, 190, 186), width=1)
    for (k, r, col) in ((0, 0, (120, 170, 220)), (2, 0, (120, 170, 220)), (4, 0, (120, 170, 220)), (1, 1, (230, 180, 120)), (3, 2, (160, 210, 150))):
        d.rectangle([x0 + 46 + k * 40, y0 + 80 + r * 42, x0 + 80 + k * 40, y0 + 114 + r * 42], fill=col)
    x0, y0, x1, y1 = REG['PHOTO']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 242, 236))
    d.rectangle([x0 + 8, y0 + 8, x1 - 9, y1 - 9], fill=(150, 190, 220)); d.rectangle([x0 + 8, y0 + 90, x1 - 9, y1 - 9], fill=(90, 130, 90))
    for (px, col) in ((70, (60, 60, 70)), (100, (180, 80, 80)), (128, (50, 70, 110))):   # 三個人的背影（看不出是誰）
        d.ellipse([x0 + px - 8, y0 + 58, x0 + px + 8, y0 + 74], fill=(40, 34, 30)); d.rectangle([x0 + px - 11, y0 + 74, x0 + px + 11, y0 + 110], fill=col)
    x0, y0, x1, y1 = REG['RULES']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 246)); d.rectangle([x0, y0, x1 - 1, y0 + 40], fill=(70, 100, 140))
    for k in range(12): d.rectangle([x0 + 18, y0 + 58 + k * 19, x0 + 18 + rs.randint(140, 280), y0 + 64 + k * 19], fill=(150, 150, 146))
    x0, y0, x1, y1 = REG['SCREEN']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(236, 238, 242)); d.rectangle([x0, y0, x1 - 1, y0 + 16], fill=(60, 64, 72))
    for k in range(8): d.rectangle([x0 + 20, y0 + 30 + k * 15, x0 + 20 + rs.randint(110, 210), y0 + 36 + k * 15], fill=(120, 124, 132))
    x0, y0, x1, y1 = REG['PLATE']; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(236, 232, 222)); d.text((x0 + 60, y0 + 14), '2 1 4', font=F(32), fill=(50, 50, 50))
    for key, col in (('NOTE1', (250, 236, 120)), ('NOTE2', (170, 220, 240))):
        x0, y0, x1, y1 = REG[key]; d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], fill=col)
        for k in range(3): d.rectangle([x0 + 14, y0 + 22 + k * 20, x0 + 14 + rs.randint(30, 66), y0 + 27 + k * 20], fill=(90, 90, 90))
    im.save(os.path.join(GEN, f'{rid}_print.png'))


class Room(K.Shop):
    def __init__(self, rid, R):
        self.sid = rid; self.R = R; self.T = {'name': R['name'], 'sub': '宿舍'}; self.S = dict(trim='#8a6a4c', wainH=0.08)
        self.W, self.D = R['W'], R['D']; self.X0, self.X1, self.Z0, self.Z1 = -R['W'] / 2, R['W'] / 2, -R['D'] / 2, R['D'] / 2
        self.rng = random.Random(sum(map(ord, rid))); self.extra = {}
        B.reset(texres=512)
        self.root = B.group(rid, props={'kind': rid, 'layout': f'{rid}.layout.json'})
        self.blocks, self.seats, self.inter = [], [], []; self.clerk = self.order = self.counter = None
        self.M = M = {
            'floor': L.pbr(f'{rid}_floor', 'laminate_floor_02', tile=1.6, target='#8f6442', contrast=1.0, normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.38),
            'wall': L.pbr(f'{rid}_wall', 'white_plaster_02', tile=1.6, target='#e6e0d4', contrast=0.3, normal=0.1, maps=('diff', 'nor'), res=256, rough_value=0.88),
            'wood': L.pbr(f'{rid}_wood', 'wood_table_001', tile=0.5, target='#b8916a', contrast=0.55, normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.45),
            'tile': L.pbr(f'{rid}_genkan', 'floor_tiles_06', tile=0.6, target='#9a968e', contrast=0.8, normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5),
            'rug': L.pbr(f'{rid}_rug', 'dirty_carpet', tile=0.8, sat=0.1, target='#8c8a86', contrast=0.8, normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.95),
            'fabric': L.pbr(f'{rid}_fabric', 'rough_linen', tile=0.6, sat=0.0, target='#ddd2bd', contrast=1.3, normal=0.0, maps=('diff',), res=256),
            'vc': L.vc_material(f'{rid}_vc', rough=0.6), 'vcm': L.vc_metal(f'{rid}_vcmetal', rough=0.32, metal=0.4),
            'cloth': L.vc_material(f'{rid}_cloth', rough=0.95),   # 棉被、枕頭、外套（平滑著色的布）
            'steel': L.flat('l118_steel', '#b9bec2', rough=0.28, metal=0.45), 'glass': L.flat('l118_glass', '#dfe9ec', rough=0.05, alpha=0.16),
            'tube': L.flat('GLOW_l118_tube', '#ffffff', rough=0.3, emit=B.srgb('#f2f6ff')), 'warm': L.flat('GLOW_l118_warm', '#ffe7c2', rough=0.4, emit=B.srgb('#ffc77a')),
            'ceil': L.flat(f'{rid}_ceiling', '#f1efe9', rough=0.9, cull=True),   # 單面朝下（10-22：原本雙面朝上；天花板 2.5 m、預設鏡頭 2.84 m，一進房間畫面上半就是天花板的上面）
            'print': img_mat(f'{rid}_print', f'{rid}_print.png', rough=0.55), 'screen': img_mat(f'GLOW_{rid}_screen', f'{rid}_print.png', rough=0.3, emit=0.6),
        }
        M['fabric'].node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.92
        self.vc = CMesh(f'{rid}_props', M['vc']); self.vm = CMesh(f'{rid}_metal', M['vcm']); self.cl = CMesh(f'{rid}_cloth', M['cloth'])
        self.wood = Mesh(f'{rid}_woodparts', M['wood']); self.steel = Mesh(f'{rid}_steel', M['steel'])
        self.tube = Mesh(f'{rid}_tubes', M['tube']); self.warm = Mesh(f'{rid}_warm', M['warm'])
        self.prt = Mesh(f'{rid}_prints', M['print']); self.scr = Mesh(f'{rid}_screens', M['screen'])
        self.WG = {k: {} for k in 'NWES'}


def soft(fs):
    for f in fs: f.smooth = True
    return fs


def pq(c, side, a0, a1, y0, y1, key, inset=0.012):
    """牆上貼的紙（side 牆；a0..a1＝沿牆的座標：N／S 是 x、W／E 是 z）"""
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; m = c.wg(side, 'print', c.M['print'])
    if side == 'N': z = Z0 + inset; pts = [(a0, y0, z), (a1, y0, z), (a1, y1, z), (a0, y1, z)]
    elif side == 'S': z = Z1 - inset; pts = [(a1, y0, z), (a0, y0, z), (a0, y1, z), (a1, y1, z)]
    elif side == 'W': x = X0 + inset; pts = [(x, y0, a1), (x, y0, a0), (x, y1, a0), (x, y1, a1)]
    else: x = X1 - inset; pts = [(x, y0, a0), (x, y0, a1), (x, y1, a1), (x, y1, a0)]
    uvquad(m, pts, uv(key))


def duvet(c, x0, x1, z0, z1, y, seed=3):
    """棉被：一片布蓋在床墊上、兩側和床尾垂下來（越往下越鬆），表面有幾道起伏、靠枕頭那一端往回折；平滑著色"""
    rs = random.Random(seed); m = c.cl; bm = m.bm; f0 = mark(m); nx, nz = 14, 18; drop = 0.2
    ph = [rs.uniform(0, 2 * PI) for _ in range(4)]
    def hgt(u, v): return 0.05 + 0.018 * math.sin(u * 5.1 + ph[0]) * math.sin(v * 3.3 + ph[1]) + 0.012 * math.sin(u * 9.0 + v * 6.0 + ph[2])
    grid = []
    for i in range(nx + 1):
        u = i / nx; row = []
        for j in range(nz + 1):
            v = j / nz
            # u：橫跨床（含兩側垂下來的部分）；兩端各 2 格是垂下來的
            if i <= 1 or i >= nx - 1:
                side = -1 if i <= 1 else 1; k = (1 - i) if i <= 1 else (i - (nx - 1)); xx = (x0 - 0.02 if side < 0 else x1 + 0.02) + side * 0.015 * k
                yy = y + 0.04 - drop * (0.5 + 0.5 * k) + 0.01 * math.sin(v * 9 + ph[3])
            else:
                xx = x0 + (x1 - x0) * (i - 1) / (nx - 2); yy = y + hgt(u, v)
            zz = z0 + (z1 - z0) * v
            if j == nz: zz = z1 + 0.03; yy = min(yy, y - 0.12)                                   # 床尾垂下來
            row.append(bm.verts.new(g2b(xx, yy, zz)))
        grid.append(row)
    for i in range(nx):
        for j in range(nz): bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    m.paint(soft(newf(m, f0)), '#eceae4')
    f0 = mark(m); part(m, Mloc((x0 + x1) / 2, y + 0.06, z0 + 0.12, 0.0), 0, 0, 0, x1 - x0 + 0.02, 0.05, 0.24, None, r=0.02, seg=2)   # 頭那一端往回折的一段
    m.paint(soft(newf(m, f0)), '#f2f0ea')


def hanging_coat(c, side_x, z, ytop, col, nrm=-1, m=None, hm=None):
    """掛勾上的外套（東牆；衣架掛著，nrm＝往房間的方向 −x）：一片布，肩膀往兩邊斜下來、下襬張開一點、中間微微鼓起、越往下褶子越明顯；
    兩隻袖子垂在兩邊（扁的圓管）；平滑著色"""
    m = m or c.cl; hm = hm or c.vm; bm = m.bm; f0 = mark(m); nw, nh = 10, 12; h = 0.76; x = side_x + nrm * 0.05; grid = []; rs = random.Random(int(z * 100))
    ph = [rs.uniform(0, 6.28) for _ in range(2)]
    for i in range(nw + 1):
        t = i / nw - 0.5; row = []
        for j in range(nh + 1):
            v = j / nh; wdt = 0.4 + 0.1 * v; sl = 0.07 * abs(2 * t) ** 1.3 * (1 - v)
            zz = z + t * wdt; yy = ytop - 0.04 - sl - v * h
            xx = x + nrm * (0.035 * (1 - (2 * t) ** 2) * (0.4 + 0.6 * v) + 0.012 * v * math.sin(t * 13 + ph[0]) + 0.006 * math.sin(t * 27 + v * 5 + ph[1]))
            row.append(bm.verts.new(g2b(xx, yy, zz)))
        grid.append(row)
    for i in range(nw):
        for j in range(nh): bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    m.paint(soft(newf(m, f0)), col)
    for s_ in (-1, 1):   # 袖子：從肩膀垂下來，貼著衣身兩邊、往前一點
        f0 = mark(m); ln = 0.6; bm2 = _tube(ln, 0.042, seg=10, r1=0.036)
        for vv in bm2.verts: vv.co.x *= 0.55; vv.co.x += 0.012 * (0.5 - vv.co.z / ln) ** 2
        m.add_bm(bm2, Matrix.Translation(g2b(x + nrm * 0.06, ytop - 0.1 - ln / 2, z + s_ * 0.235)) @ Matrix.Rotation(s_ * 0.06, 4, 'X')); bm2.free()
        m.paint(soft(newf(m, f0)), col, 0.9)
    f0 = mark(m); bm2 = _tube(0.2, 0.02, seg=8)                                             # 領子
    m.add_bm(bm2, Matrix.Translation(g2b(x + nrm * 0.03, ytop - 0.045, z)) @ Matrix.Rotation(PI / 2, 4, 'X')); bm2.free(); m.paint(soft(newf(m, f0)), col, 0.8)
    ccyl(hm, (side_x - 0.005, ytop + 0.02, z), (side_x + nrm * 0.06, ytop - 0.01, z), 0.006, '#8a8e92', seg=6)   # 衣架的鉤子


def desk_lamp(c, x, y, z, yaw):
    """伸縮臂檯燈（2D 背景那一盞：黑色、燈罩往下照著桌面）"""
    k = '#222426'
    ccyl(c.vm, (x, y, z), (x, y + 0.02, z), 0.07, k, seg=14)
    p0 = (x, y + 0.02, z); p1 = (x + 0.05 * math.sin(yaw), y + 0.38, z + 0.05 * math.cos(yaw)); p2 = (x + 0.33 * math.sin(yaw), y + 0.5, z + 0.33 * math.cos(yaw))
    ccyl(c.vm, p0, p1, 0.008, k, seg=6); ccyl(c.vm, p1, p2, 0.008, k, seg=6)
    sx, sy, sz = p2[0] + 0.05 * math.sin(yaw), p2[1] - 0.05, p2[2] + 0.05 * math.cos(yaw)
    clathe(c.vm, [(0.0, 0.0), (0.075, 0.0), (0.06, 0.05), (0.03, 0.12), (0.0, 0.13)], sx, sy - 0.06, sz, k, seg=16)
    c.warm.sphere((sx, sy - 0.035, sz), 0.03, seg=10, rings=6)


def build(rid):
    R = ROOMS[rid]; H = R['H']; K.H = H; WY = R['WY']
    c = Room(rid, R); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rr = random.Random(11)
    dx, dw = R['door_x'], 0.8
    GZ = Z1 - 0.85                                                                     # 玄關（磁磚）和房間（木地板）的交界
    fl = Mesh(f'{rid}_floorm', M['floor']); fl.box(X0, X1, -0.05, 0.0, Z0, GZ); fl.box(dx + dw / 2 + 0.05, X1, -0.05, 0.0, GZ, Z1); fl.finish(c.root)
    gk = Mesh(f'{rid}_genkanm', M['tile']); gk.box(X0, dx + dw / 2 + 0.05, -0.05, -0.012, GZ, Z1); gk.finish(c.root)
    c.vc.cbox(X0, dx + dw / 2 + 0.05, -0.012, 0.004, GZ - 0.035, GZ, '#6b4c34')        # 玄關的框（上一階的木頭收邊）
    ce = Mesh(f'{rid}_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(c.root)   # 朝下
    trim = '#8a6a4c'
    # ---------- 北牆：一整面鋁框推拉窗（遊戲 room() 的窗：中心 (0, WY)、2.2 × 1.6）----------
    wl = c.wg('N', 'wall', M['wall']); fr = c.wg('N', 'frame', M['vcm'], cm=True); gl = c.wg('N', 'glass', M['glass']); tr = c.wg('N', 'trim', M['vc'], cm=True)
    fab = c.wg('N', 'curtain', M['fabric'])
    a, b = -1.1, 1.1; wy0, wy1 = WY - 0.8, WY + 0.8
    QN = lambda xa, xb, y0, y1: [(xa, y0, Z0), (xb, y0, Z0), (xb, y1, Z0), (xa, y1, Z0)]
    wl.quad(QN(X0, a, 0, H)); wl.quad(QN(b, X1, 0, H)); wl.quad(QN(a, b, 0, wy0)); wl.quad(QN(a, b, wy1, H))
    tr.cbox(X0, X1, 0.0, 0.07, Z0, Z0 + 0.012, trim)                                     # 踢腳板
    for (ya, yb) in ((wy0 - 0.03, wy0), (wy1, wy1 + 0.03)): fr.cbox(a - 0.03, b + 0.03, ya, yb, Z0 - 0.12, Z0 + 0.02, '#b7bbbf')
    for xa in (a - 0.03, b): fr.cbox(xa, xa + 0.03, wy0, wy1, Z0 - 0.12, Z0 + 0.02, '#b7bbbf')
    for (xa, xb, zz) in ((a, 0.03, -0.05), (-0.03, b, -0.09)):                          # 兩扇推拉窗（一前一後；中間重疊）
        for (p, q) in ((xa, xa + 0.045), (xb - 0.045, xb)): fr.cbox(p, q, wy0 + 0.01, wy1 - 0.01, Z0 + zz - 0.03, Z0 + zz, '#a9aeb2')
        for (ya, yb) in ((wy0 + 0.01, wy0 + 0.06), (wy1 - 0.06, wy1 - 0.01)): fr.cbox(xa, xb, ya, yb, Z0 + zz - 0.03, Z0 + zz, '#a9aeb2')
        gl.quad([(xa + 0.04, wy0 + 0.06, Z0 + zz - 0.015), (xb - 0.04, wy0 + 0.06, Z0 + zz - 0.015), (xb - 0.04, wy1 - 0.06, Z0 + zz - 0.015), (xa + 0.04, wy1 - 0.06, Z0 + zz - 0.015)])
    fr.cbox(-0.06, -0.04, WY - 0.05, WY + 0.05, Z0 - 0.055, Z0 - 0.04, '#5a5e62')        # 窗的鎖（月牙鎖）
    tr.cbox(a - 0.08, b + 0.08, wy0 - 0.05, wy0, Z0, Z0 + 0.16, '#d7d0c3')               # 窗台
    ccyl(fr, (a - 0.42, wy1 + 0.12, Z0 + 0.1), (b + 0.42, wy1 + 0.12, Z0 + 0.1), 0.012, '#c8c2b6', seg=8)   # 窗簾桿
    for (p0, p1) in ((a - 0.4, a + 0.12), (b - 0.12, b + 0.4)): drape(fab, p0, p1, 0.12, wy1 + 0.1, Z0 + 0.1, folds=6, depth=0.06)   # 米白窗簾收在兩邊（拉到快到地板）
    # 窗外的陽台：混凝土的地、欄杆（跟著北牆淡出；窗外的照片在欄杆後面）
    rl = c.wg('N', 'rail', M['vcm'], cm=True)
    rl.cbox(a - 0.3, b + 0.3, wy0 - 0.75, wy0 - 0.66, Z0 - 0.9, Z0 - 0.02, '#bdb8ae')
    for xx in [a - 0.25 + k * 0.12 for k in range(int((b - a + 0.5) / 0.12) + 1)]: rl.cbox(xx - 0.008, xx + 0.008, wy0 - 0.66, wy0 + 0.35, Z0 - 0.82, Z0 - 0.806, '#6a6e72')
    rl.cbox(a - 0.3, b + 0.3, wy0 + 0.33, wy0 + 0.37, Z0 - 0.84, Z0 - 0.79, '#6a6e72')
    # ---------- 西牆：書桌（靠窗）、層板、書櫃 ----------
    wl = c.wg('W', 'wall', M['wall']); tr = c.wg('W', 'trim', M['vc'], cm=True); ww = c.wg('W', 'wood', M['wood'])
    wl.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, H, Z0), (X0, H, Z1)]); tr.cbox(X0, X0 + 0.012, 0.0, 0.07, Z0, GZ, trim)
    dz0, dz1, dd = Z0 + 0.12, Z0 + 1.22, 0.58; DY = 0.72
    c.wood.rbox(X0, X0 + dd, DY - 0.03, DY, dz0, dz1, r=0.006, seg=1)                   # 桌面
    c.wood.box(X0 + 0.02, X0 + dd - 0.02, 0.0, DY - 0.03, dz0, dz0 + 0.025)             # 靠窗那一側的側板
    c.wood.box(X0 + 0.02, X0 + dd - 0.04, 0.0, DY - 0.03, dz1 - 0.44, dz1 - 0.42)        # 抽屜櫃
    c.wood.box(X0 + 0.02, X0 + dd - 0.04, 0.0, DY - 0.03, dz1 - 0.025, dz1)
    for k in range(3):
        y0 = 0.06 + k * 0.215; c.wood.box(X0 + dd - 0.045, X0 + dd - 0.025, y0, y0 + 0.2, dz1 - 0.415, dz1 - 0.03)
        c.vm.cbox(X0 + dd - 0.025, X0 + dd - 0.01, y0 + 0.09, y0 + 0.11, dz1 - 0.26, dz1 - 0.18, '#3a3a3a')
    c.block(X0, X0 + dd + 0.03, dz0, dz1, 'desk')
    ww.box(X0, X0 + 0.24, 1.32, 1.35, dz0 + 0.1, dz1 - 0.1)                              # 牆上的層板（跟著西牆淡出）
    for k in range(5): part(tr, Mloc(X0 + 0.11, 1.35, dz1 - 0.2 - k * 0.032, PI / 2), 0, 0.1, 0, 0.028, 0.2, 0.15, ['#2f5d8a', '#8a2f3a', '#d8d2c4', '#3f6a3a', '#c99a2e'][k])
    clathe(tr, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.09), (0.0, 0.09)], X0 + 0.12, 1.35, dz0 + 0.3, '#d9d2c4', seg=10)   # 層板上的小盆栽（垂下來的藤）
    for k in range(7):
        a_ = k * 0.9; f0 = mark(tr); tr.ell((X0 + 0.12 + 0.05 * math.cos(a_), 1.47 - (k % 3) * 0.08, dz0 + 0.3 + 0.05 * math.sin(a_)), 0.03, 0.05, 0.015, seg=6, rings=3)
        tr.paint(newf(tr, f0), '#4f8a3f', 0.85 + 0.05 * (k % 3))
    pq(c, 'W', dz0 + 0.15, dz0 + 0.45, 1.5, 1.75, 'TT'); pq(c, 'W', dz0 + 0.55, dz0 + 0.64, 1.05, 1.14, 'NOTE1'); pq(c, 'W', dz0 + 0.68, dz0 + 0.77, 1.08, 1.17, 'NOTE2')
    # 桌上：筆電（螢幕亮著一份文件）、攤開的筆記本、筆筒、小盆栽、檯燈
    lx, lz = X0 + 0.3, dz0 + 0.62; a_l = 0.25; hx, hy = lx - 0.105, DY + 0.016
    c.vc.crbox(lx - 0.11, lx + 0.11, DY, DY + 0.016, lz - 0.16, lz + 0.16, '#c9ccd0', r=0.004, seg=1)   # 筆電：底座（坐的人在 +x、面向 −x）
    up = (-math.sin(a_l) * 0.21, math.cos(a_l) * 0.21); nx_, ny_ = math.cos(a_l), math.sin(a_l)       # 螢幕往牆那邊仰 a_l；朝坐的人那一面的法線
    def lid(off, za, zb): return [(hx + off * nx_, hy + off * ny_, za), (hx + off * nx_, hy + off * ny_, zb), (hx + up[0] + off * nx_, hy + up[1] + off * ny_, zb), (hx + up[0] + off * nx_, hy + up[1] + off * ny_, za)]
    c.vc.poly(lid(-0.004, lz + 0.16, lz - 0.16), '#c9ccd0'); c.vc.poly(lid(0.0, lz - 0.16, lz + 0.16), '#1b1d22')     # 背蓋、黑色邊框
    sp = lid(0.002, lz - 0.145, lz + 0.145); k_ = 0.06
    sp = [(p_[0] + (up[0] * k_ if i in (0, 1) else -up[0] * k_ * 0.4), p_[1] + (up[1] * k_ if i in (0, 1) else -up[1] * k_ * 0.4), p_[2]) for i, p_ in enumerate(sp)]
    uvquad(c.scr, sp, uv('SCREEN'))                                                                     # 螢幕（亮著一份文件；坐的人看得到）
    nb = Mloc(lx + 0.08, DY, lz + 0.32, -PI / 2 - 0.15)
    part(c.vc, nb, 0, 0.002, 0, 0.34, 0.004, 0.24, '#33507a'); part(c.vc, nb, -0.085, 0.008, 0, 0.165, 0.008, 0.23, '#f6f4ee'); part(c.vc, nb, 0.085, 0.008, 0, 0.165, 0.008, 0.23, '#f6f4ee')
    part(c.vc, nb, 0.05, 0.016, 0.02, 0.009, 0.009, 0.14, '#202020', ry=0.5)
    clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.1), (0.0, 0.1)], X0 + 0.12, DY, dz0 + 0.18, '#d9c4a0', seg=10)       # 筆筒
    for k in range(5): ccyl(c.vc, (X0 + 0.11 + 0.01 * (k % 2), DY + 0.05, dz0 + 0.17 + 0.008 * k), (X0 + 0.1 + 0.02 * (k % 3), DY + 0.17, dz0 + 0.16 + 0.012 * k), 0.004, ['#1d2a55', '#202020', '#a02020', '#2a6a3a', '#202020'][k], seg=5)
    clathe(c.vc, [(0.0, 0.0), (0.045, 0.0), (0.055, 0.08), (0.0, 0.08)], X0 + 0.14, DY, dz0 + 0.42, '#c9b49a', seg=10)       # 小盆栽
    for k in range(6):
        a_ = k * 1.05; f0 = mark(c.vc); c.vc.ell((X0 + 0.14 + 0.03 * math.cos(a_), DY + 0.12, dz0 + 0.42 + 0.03 * math.sin(a_)), 0.025, 0.045, 0.012, seg=6, rings=3, matrix=Matrix.Rotation(-a_, 4, 'Z') @ Matrix.Rotation(0.45, 4, 'X'))
        c.vc.paint(newf(c.vc, f0), '#4f8a3f', 0.9)
    desk_lamp(c, X0 + 0.1, DY, dz0 + 0.95, PI / 2 - 0.5)
    # 椅子（黑色的布面辦公椅；坐的位置面向西＝書桌）
    cx_, cz_ = X0 + 0.82, (dz0 + dz1) / 2 - 0.05; Mc = Mloc(cx_, 0.0, cz_, -PI / 2)
    part(c.vc, Mc, 0, 0.46, 0.0, 0.44, 0.06, 0.42, '#2a2c33', r=0.02, seg=2, sm=True)
    part(c.vc, Mc, 0, 0.78, -0.2, 0.42, 0.42, 0.05, '#2a2c33', r=0.02, seg=2, rx=-0.1, sm=True)
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(c.vm, lw(cx_, cz_, -PI / 2)(sx * 0.19, 0, sz * 0.18), lw(cx_, cz_, -PI / 2)(sx * 0.19, 0.44, sz * 0.18), 0.011, '#3a3c40', seg=6)
    c.seat(cx_, cz_, -PI / 2, (X0 + 0.29, cz_), 'study', label='坐下')
    # 書櫃（書桌南邊，靠西牆）
    bz0, bz1 = dz1 + 0.06, dz1 + 0.86; sw = c.wg('W', 'shelf_wood', M['wood']); sbk = c.wg('W', 'books', M['vc'], cm=True)   # 書櫃靠牆、1.8 m 高：跟著西牆淡出（鏡頭在牆外時不擋住房間）
    sw.box(X0, X0 + 0.32, 0.0, 1.78, bz0, bz0 + 0.02); sw.box(X0, X0 + 0.32, 0.0, 1.78, bz1 - 0.02, bz1); sw.box(X0, X0 + 0.32, 1.76, 1.78, bz0, bz1)
    sw.box(X0, X0 + 0.015, 0.0, 1.78, bz0, bz1)
    for k in range(5):
        y = 0.04 + k * 0.35; sw.box(X0, X0 + 0.32, y - 0.02, y, bz0, bz1)
        if k < 4:
            z = bz0 + 0.03
            while z < bz1 - 0.06:
                t = rr.uniform(0.02, 0.045); hh = rr.uniform(0.18, 0.28)
                if rr.random() < 0.85: part(sbk, Mloc(X0 + 0.17, y, z + t / 2, PI / 2), 0, hh / 2, 0, t, hh, 0.21, rr.choice(['#2f5d8a', '#8a2f3a', '#d8d2c4', '#3f6a3a', '#c99a2e', '#4a4a52', '#e8e2d2', '#5c7a8a']))   # 立著的書（書背朝房間）
                z += t + 0.004
    c.block(X0, X0 + 0.35, bz0, bz1, 'bookshelf')
    backpack(c.vc, Mloc(X0 + 0.55, 0.0, bz1 - 0.2, PI / 2 + 0.4), '#2c3e5c')
    clathe(c.vc, [(0.0, 0.0), (0.11, 0.0), (0.12, 0.3), (0.0, 0.3)], X0 + 0.17, 0.0, dz0 + 0.18, '#d9d6cf', seg=12)   # 垃圾桶（書桌下面靠窗那一端）
    # ---------- 東牆：床（床頭靠窗）、掛勾、冷氣；冰箱、衣櫃在門口那一側 ----------
    wl = c.wg('E', 'wall', M['wall']); tr = c.wg('E', 'trim', M['vc'], cm=True)
    wl.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, H, Z1), (X1, H, Z0)]); tr.cbox(X1 - 0.012, X1, 0.0, 0.07, Z0, Z1, trim)
    bx0, bx1, bz0_, bz1_ = X1 - 0.98, X1 - 0.02, Z0 + 0.05, Z0 + 2.08
    c.wood.box(bx0, bx1, 0.18, 0.3, bz0_ + 0.04, bz1_)                                   # 床架
    for (xa, za) in ((bx0, bz1_ - 0.06), (bx1 - 0.06, bz1_ - 0.06)): c.wood.box(xa, xa + 0.06, 0.0, 0.42, za, za + 0.06)
    c.wood.rbox(bx0, bx1, 0.0, 0.86, bz0_, bz0_ + 0.05, r=0.01, seg=1)                     # 床頭板
    c.wood.box(bx0, bx1, 0.0, 0.42, bz1_ - 0.03, bz1_)
    part(c.vc, Mloc((bx0 + bx1) / 2, 0.3, (bz0_ + bz1_) / 2, 0.0), 0, 0.09, 0, bx1 - bx0 - 0.04, 0.18, bz1_ - bz0_ - 0.1, '#e8e8e2', r=0.04, seg=2, sm=True)   # 床墊
    part(c.cl, Mloc((bx0 + bx1) / 2, 0.48, bz0_ + 0.25, 0.0), 0, 0.06, 0, 0.62, 0.13, 0.36, '#f4f3ee', r=0.06, seg=3, sm=True)   # 枕頭
    duvet(c, bx0 + 0.04, bx1 - 0.04, bz0_ + 0.5, bz1_ - 0.02, 0.48)
    c.block(bx0 - 0.02, bx1 + 0.02, bz0_, bz1_ + 0.02, 'bed')
    tr.cbox(X1 - 0.045, X1, 1.78, 1.82, bz1_ + 0.2, bz1_ + 0.95, '#a07a54')                # 掛勾的木條
    for k in range(4): ccyl(tr, (X1 - 0.045, 1.8, bz1_ + 0.3 + k * 0.2), (X1 - 0.1, 1.83, bz1_ + 0.3 + k * 0.2), 0.008, '#8a8e92', seg=6)
    hanging_coat(c, X1 - 0.1, bz1_ + 0.5, 1.82, '#8f9aa6', m=c.wg('E', 'cloth', M['cloth'], cm=True), hm=tr)   # 掛在牆上的：跟著東牆淡出
    ac = c.wg('E', 'ac', M['vc'], cm=True); ac.crbox(X1 - 0.24, X1, H - 0.38, H - 0.08, -0.45, 0.45, '#f2f2ee', r=0.03, seg=2); ac.cbox(X1 - 0.245, X1 - 0.2, H - 0.36, H - 0.3, -0.42, 0.42, '#d9d9d4')
    pq(c, 'E', bz1_ + 0.12, bz1_ + 0.34, 1.25, 1.53, 'CAL', inset=0.012)
    # 門口那一側：小冰箱（上面熱水壺、杯子）、拉門衣櫃、行李箱
    fz0, fz1 = GZ - 0.6, GZ - 0.06
    c.vc.crbox(X1 - 0.5, X1 - 0.02, 0.0, 0.84, fz0, fz1, '#e9e9e6', r=0.015, seg=2); c.vc.cbox(X1 - 0.505, X1 - 0.49, 0.6, 0.7, fz0 + 0.04, fz0 + 0.07, '#9a9ea2')
    c.vc.cbox(X1 - 0.505, X1 - 0.495, 0.56, 0.565, fz0 + 0.02, fz1 - 0.02, '#c9c9c4')
    clathe(c.vc, [(0.0, 0.0), (0.07, 0.0), (0.075, 0.18), (0.05, 0.22), (0.0, 0.22)], X1 - 0.3, 0.84, fz0 + 0.18, '#f0f0ec', seg=12)   # 熱水壺
    clathe(c.vc, [(0.0, 0.0), (0.04, 0.0), (0.045, 0.09), (0.0, 0.09)], X1 - 0.16, 0.84, fz1 - 0.14, '#3f6a8a', seg=10)
    c.block(X1 - 0.52, X1, fz0, fz1, 'fridge')
    cl0 = dx + dw / 2 + 0.4; cw = c.wg('S', 'closet_wood', M['wood']); cv = c.wg('S', 'closet', M['vc'], cm=True)   # 嵌在南牆的拉門衣櫃（2.2 m 高）：跟著南牆淡出
    cw.box(cl0, X1, 0.0, 2.2, Z1 - 0.62, Z1 - 0.6); cw.box(cl0, X1, 2.18, 2.2, Z1 - 0.62, Z1); cw.box(cl0, cl0 + 0.02, 0.0, 2.2, Z1 - 0.62, Z1)
    for k, (xa, xb) in enumerate(((cl0 + 0.01, (cl0 + X1) / 2 + 0.02), ((cl0 + X1) / 2 - 0.02, X1 - 0.01))):   # 兩片拉門
        cv.cbox(xa, xb, 0.03, 2.17, Z1 - 0.65 - 0.02 * k, Z1 - 0.62 - 0.02 * k, '#e4ddcf')
        cv.cbox(xb - 0.07 if k == 0 else xa + 0.04, xb - 0.04 if k == 0 else xa + 0.07, 0.95, 1.15, Z1 - 0.655 - 0.02 * k, Z1 - 0.65 - 0.02 * k, '#8a8e92')
    c.block(cl0, X1, Z1 - 0.68, Z1, 'closet')
    part(c.vc, Mloc(cl0 + 0.3, 0.0, Z1 - 0.95, -0.2), 0, 0.33, 0, 0.42, 0.62, 0.24, '#5c6670', r=0.03, seg=2, sm=True)   # 行李箱（交換生）
    ccyl(c.vm, (cl0 + 0.27, 0.64, Z1 - 0.95), (cl0 + 0.27, 0.9, Z1 - 0.95), 0.01, '#3a3c40', seg=6); ccyl(c.vm, (cl0 + 0.39, 0.64, Z1 - 0.98), (cl0 + 0.39, 0.9, Z1 - 0.98), 0.01, '#3a3c40', seg=6)
    c.block(cl0 + 0.05, cl0 + 0.55, Z1 - 1.15, Z1 - 0.75, 'suitcase')
    # ---------- 南牆：門（往走廊）、門牌在外面看不到、牆上的宿舍規則、電燈開關 ----------
    wl = c.wg('S', 'wall', M['wall']); tr = c.wg('S', 'trim', M['vc'], cm=True); wd = c.wg('S', 'door', M['wood'])
    d0, d1 = dx - dw / 2, dx + dw / 2
    QS = lambda xa, xb, y0, y1: [(xb, y0, Z1), (xa, y0, Z1), (xa, y1, Z1), (xb, y1, Z1)]
    wl.quad(QS(X0, d0 - 0.06, 0, H)); wl.quad(QS(d1 + 0.06, X1, 0, H)); wl.quad(QS(d0 - 0.06, d1 + 0.06, 2.06, H))
    for (xa, xb) in ((d0 - 0.06, d0), (d1, d1 + 0.06)): tr.cbox(xa, xb, 0.0, 2.06, Z1 - 0.05, Z1, '#d9d4ca')
    tr.cbox(d0 - 0.06, d1 + 0.06, 2.0, 2.06, Z1 - 0.05, Z1, '#d9d4ca')
    wd.box(d0 + 0.005, d1 - 0.005, 0.0, 2.0, Z1 - 0.04, Z1 - 0.005)
    tr.cbox(d1 - 0.12, d1 - 0.04, 0.98, 1.02, Z1 - 0.1, Z1 - 0.04, '#b9bec2'); tr.cbox(d1 - 0.1, d1 - 0.06, 1.12, 1.17, Z1 - 0.06, Z1 - 0.04, '#7a7e82')   # 門把、門鎖
    tr.cbox(d1 + 0.12, d1 + 0.2, 1.15, 1.27, Z1 - 0.012, Z1, '#f2f2ee')                 # 電燈開關
    pq(c, 'S', X0 + 0.2, X0 + 0.55, 1.25, 1.62, 'RULES')
    for (sx_, sz_, col) in ((d0 + 0.2, Z1 - 0.35, '#e8e4dc'), (d0 + 0.42, Z1 - 0.3, '#2f3540')):   # 玄關的兩雙鞋（拖鞋、球鞋）
        for s in (-1, 1): part(c.vc, Mloc(sx_ + s * 0.055, 0.0, sz_, 0.05 * s), 0, 0.035, 0, 0.09, 0.07, 0.26, col, r=0.03, seg=2, sm=True)
    # ---------- 地毯、吸頂燈 ----------
    rg = Mesh(f'{rid}_rugm', M['rug'], tile=0.8); rg.box(-0.55, 0.4, 0.0, 0.012, -1.5, 0.25); rg.finish(c.root)
    c.tube.cyl((0.0, H - 0.08, -0.4), (0.0, H - 0.02, -0.4), 0.22, seg=24)
    c.vc.cbox(-0.05, 0.05, H - 0.02, H, -0.45, -0.35, '#e8e8e4')
    # ---------- 配置 ----------
    c.door = dict(x=dx, w=dw, z=Z1, note='南牆靠西，往走廊（jp_dorm 的走廊、樓梯）；衣櫃在門的東邊，留 1.4 m 的走道（10-21 reachability_all）')
    c.spawn = dict(x=dx, z=round(Z1 - 1.2, 3), yaw=round(PI, 4), note='進門（玄關上來一步），面向窗')
    c.exits = [dict(x=dx, z=round(Z1 - 0.4, 3), r=0.6, label='走出房間', to='jp_dorm', spawn_note='到宿舍的走廊（jp_dorm，下一階段）；這一階段先回 2D 的據點')]
    c.look('window', -0.05, Z0 + 0.7, 0.6, '窗外', dev='AA_341 3/28 摘要日：「宿舍的房間比想像的小。窗外是一片田，遠一點的地方有一座山。」——遊戲裡顯示的字等 AA 寫')
    c.look('bed', bx0 - 0.25, bz1_ - 0.45, 0.6, '床', dev='給 JP.loop 的「睡覺」「在房間休息一下」（LAWWW-C 接）')
    c.look('fridge', X1 - 0.85, (fz0 + fz1) / 2, 0.6, '小冰箱', dev='遊戲裡顯示的字等 AA 寫')
    c.look('suitcase', cl0 + 0.3, Z1 - 1.45, 0.55, '行李箱', dev='遊戲裡顯示的字等 AA 寫')
    c.wins = dict(side='N', wall='back', z=Z0, xs=[0.0], y=WY, w=2.2, h=1.6, note='遊戲 room() 的窗：winWall back（−z）、winXs [0]、winY 1.55；窗外的景 jp_room_{day,night}.webp（jp_view.py）')
    # ---------- 完成 ----------
    Dn = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
    for k, ms in c.WG.items():
        for key, m in ms.items(): m.finish(c.root, props={'dir': Dn[k]}, uv=key in ('wall', 'door', 'curtain') or 'wood' in key, merge=key not in ('print',))
    for m in (c.vc, c.vm, c.cl, c.tube, c.warm, c.steel): m.finish(c.root, uv=False)
    c.wood.finish(c.root)
    for m in (c.prt, c.scr): m.finish(c.root, uv=False, merge=False)
    L.merge_by_material(c.root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: '')
    out = os.path.join(OUTDIR, f'{rid}.glb'); st = L.export(out, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    lay = dict(version=1, zone=rid, name=R['name'], type='宿舍', src=R['src'] + '；LAWWW2-C jp_dorm.py',
               bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=3.2, door=c.door, spawn=c.spawn, exits=c.exits, windows=c.wins,
               counter=None, clerk=None, order=None, seats=c.seats, interact=c.inter, blocks=c.blocks, view=rid)
    auto_ap(c, lay)
    prob = navcheck(c, lay) + seatcheck(lay); lay['navcheck'] = dict(cell=0.4, inset=0.25, problems=prob, ap=sum(1 for s in lay['seats'] if s.get('ap')))
    L.write_json(os.path.join(OUTDIR, f'{rid}.layout.json'), lay)
    L.write_json(out[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout=f'{rid}.layout.json', seats=len(c.seats)))
    print(json.dumps({'room': rid, 'tris': tris, 'seats': len(c.seats), 'problems': prob}, ensure_ascii=False))
    return prob


if __name__ == '__main__':
    which = arg('--room', 'all'); ids = list(ROOMS) if which == 'all' else which.split(',')
    if len(ids) > 1:
        import subprocess
        for rid in ids: subprocess.run([sys.executable, os.path.abspath(__file__), '--', '--room', rid, '--out-dir', os.path.relpath(OUTDIR, L.ROOT)], check=False)
    else:
        make_tex(ids[0]); p = build(ids[0]); print('JP_DORM', ids[0], 'OK' if not p else p)
