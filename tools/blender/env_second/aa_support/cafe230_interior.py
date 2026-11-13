"""2:30 AM（溫州街東端路口，取代兩點半 Café）室內 → GLB（AA 2026-11-04；AA_654，使用者 11-04 04:4x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/cafe230_interior.py [-- --out assets/models/env/second_ai/aa_support/cafe230.glb]
遊戲區域照舊是 `cafe`：固定的位置照 tools/blender/env_second/cafe_layout.py（從 LAWWW2 分支拿）；新加的照 src/data/cafe230_layout.js。
參考圖 docs/story_planning/ref_images/shops/wz_230am_int.webp。美術規則 SCENE_RULES §10～12＋LAWWW2 11-04 04:45。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py a23（a23_print.png）；書背 mok_bookrows.png；窗景 mok_view.png。
深夜感：胡桃木吧台和家具、暖米色灰泥牆、外露的深色天花板管線、黃銅吊燈、燈罩檯燈、綠色皮卡座、拱門；地板淺色木地板（D112，參考圖是中深色）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
import cafe_layout as CF   # noqa: E402  （LAWWW2 的共用配置：固定位置）
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/cafe230_layout.js', 'CAFE230_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = CF.RW, CF.RD, CF.RH
sh = K.Shop('a23_', 'cafe230_interior', W, D, H, texres=512, props={'layout': LAY['version'], 'zone': 'cafe'}, seed=1109)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books', 'view'}
P = 'a23_'
sh.M.update({
    'floor': L.pbr(P + 'floor_wood', 'laminate_floor_02', tile=2.2, target='#c4a07a', maps=('diff',), res=512, rough_value=0.55),
    'wall': CL.soft_plaster(P + 'wall_warm', '#e6d6bc', 0.9, cull=True, tile=1.6, k=0.25),
    'wood': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5e3f28', maps=('diff',), res=256, rough_value=0.45, cull=True),   # v1b：單面（木頭都是封閉的盒子；天花板也用它）
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'bulb': L.flat(P + 'bulb', '#fff2d8', rough=0.3, emit=B.srgb('#ffcf8a')),
    'view': K.img_mat(P + 'window_view', 'a23_views_day.jpg', rough=0.9, emit=0.08),   # v1f：LAWWW2 f785028e6 從 2:30 AM 往外拍的窗景（上半＝正面溫州街；下半＝右窗：外面是 0.7 m 的防火巷，做成毛玻璃——巷子的圖模糊、調亮）；夜版 a23_views_night.jpg 同樣排法
    'print': K.img_mat(P + 'print', 'a23_print.png', rough=0.7),
    'books': K.img_mat(P + 'books', 'mok_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']
CC0 = '--nocc0' not in sys.argv   # SHOP-REALISM-1112（D159／D160／D161，LAWWW2-C 11-13）：CC0 材質組＋Poly Haven 掃描模型；--nocc0＝建原版（對照用）
if CC0:
    import cc0_aakit as cc0_kit   # noqa: E402（tools/blender/env_second/cc0_aakit.py：給 aa_kit 腳本用的 CC0 工具；118 巷那支 cc0_kit.py 是 AA 的，不一樣）
    K0 = cc0_kit.Kit(L, B, sh.root, g2b, prefix=P)
    sh.M.update({
        'c_fabric': K0.acg(P + 'c_fabric', 'Fabric036', target='#7f7b76', tile=0.45, rough_value=0.9, res=256),     # 灰布坐墊、沙發
        'c_leather': K0.acg(P + 'c_leather', 'Leather037', target='#3e5a46', tile=0.6, rough_value=0.5, res=256),   # 綠色皮卡座
        'c_leather_r': K0.acg(P + 'c_leather_r', 'Leather026', target='#7b2d26', tile=0.6, rough_value=0.55, res=256),
        'c_brass': K0.acg(P + 'c_brass', 'Metal009', target='#b8944a', tile=0.6, metal=0.85, rough_value=0.35, res=256),
        'c_metal_dk': K0.acg(P + 'c_metal_dk', 'Metal009', maps=('diff',), target='#34322f', tile=0.8, metal=0.4, rough_value=0.45, res=256),   # 黑鐵、天花板管線、深色梁
        'c_ceramic': K0.acg(P + 'c_ceramic', 'Plastic006', vary=0.05, target='#e8e2d6', tile=0.4, rough_value=0.25, res=256),   # 白瓷杯盤、米色燈罩、陶盆
        'c_clay': K0.acg(P + 'c_clay', 'PaintedPlaster017', maps=('diff',), target='#a85a3a', tile=0.4, rough_value=0.8, res=256),   # 赤陶盆
        'c_rug': K0.acg(P + 'c_rug', 'Carpet015', maps=('diff',), target='#6a3a2c', tile=0.8, rough_value=0.95, res=256),   # 四人桌下的舊地毯
    })
    VC_ROUTE = {   # 頂點色 → 材質組 key（cc0_kit.split_vc：找最接近的顏色，距離 < 26）
        '#5a3c26': 'wood', '#4a3120': 'wood', '#3a2418': 'wood', '#8a6a3a': 'wood', '#6a5236': 'wood',
        '#7a7672': 'c_fabric', '#8a857e': 'c_fabric', '#9a9a94': 'c_fabric', '#a8a8a4': 'c_fabric',
        '#3e5a46': 'c_leather', '#7b2d26': 'c_leather_r',
        '#b8944a': 'c_brass', '#c9b48a': 'c_brass', '#b89a6a': 'c_brass',
        '#4a4642': 'c_metal_dk', '#5c5852': 'c_metal_dk', '#3a3a38': 'c_metal_dk', '#2e2e2e': 'c_metal_dk', '#2a2a2a': 'c_metal_dk', '#2a2a28': 'c_metal_dk', '#2e2e2c': 'c_metal_dk', '#24221f': 'c_metal_dk', '#1e1e1e': 'c_metal_dk',
        '#d8d0c0': 'c_ceramic', '#d8cfc0': 'c_ceramic', '#e8e0cc': 'c_ceramic', '#e8dcc8': 'c_ceramic', '#f2efe8': 'c_ceramic', '#f4f2ea': 'c_ceramic', '#f8f6ee': 'c_ceramic', '#d8d4cc': 'c_ceramic', '#d8d8d6': 'c_ceramic', '#c9c0ae': 'c_ceramic', '#e8e2d6': 'c_ceramic',
        '#b0653e': 'c_clay', '#a85a3a': 'c_clay', '#6a5a44': 'c_clay',
    }
IT = {}
for i in LAY['added']: IT.setdefault(i['kind'], []).append(i)
xf0 = Xf(0, 0); R = random.Random(1109)
WAL = '#5a3c26'; WAL2 = '#4a3120'; GREY = '#7a7672'; GREY2 = '#8a857e'; GREEN = '#3e5a46'; BRASS = '#b8944a'; STONE = '#4a4642'; CEIL = '#5c5852'


def chair(x, z, yaw):
    """胡桃木椅：細腳、灰色布坐墊、兩根橫條的鏤空椅背"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.19, 0.18), (0.19, 0.18), (-0.19, -0.18), (0.19, -0.18)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.43, sz * 0.95), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.21, 0.21, 0.39, 0.43, -0.2, 0.2, r=0.01, seg=1, col=WAL)
    xf.rbox(m, -0.2, 0.2, 0.43, 0.49, -0.19, 0.19, r=0.025, seg=2, col=GREY)
    for sx in (-0.19, 0.19): xf.cyl(m, (sx, 0.45, -0.19), (sx, 0.86, -0.22), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.2, 0.2, 0.6, 0.655, -0.215, -0.19, r=0.01, seg=1, col=WAL)
    xf.rbox(m, -0.21, 0.21, 0.77, 0.86, -0.235, -0.205, r=0.012, seg=1, col=WAL)


def stool(x, z, h=0.75):
    """吧檯／窗邊高腳椅：圓木坐面、四支腳、黃銅腳踏"""
    xf = Xf(x, z, 0.0); m = sh.a('vc')
    xf.lathe(m, [(0.0, h - 0.04), (0.17, h - 0.04), (0.18, h - 0.01), (0.17, h + 0.005), (0.0, h + 0.01)], 0, 0, 0, seg=14, col=WAL)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        xf.cyl(m, (c * 0.2, 0.0, s_ * 0.2), (c * 0.12, h - 0.04, s_ * 0.12), 0.02, col=WAL2, seg=5, caps=False)
    xf.lathe(sh.a('vcm'), [(0.17, 0.27), (0.19, 0.27), (0.19, 0.29), (0.17, 0.29)], 0, 0, 0, seg=14, col=BRASS)


def shade_lamp(x, z, y, s=1.0):
    """燈罩檯燈：黃銅座、米白百褶燈罩（發光）"""
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcm'), [(0.0, 0.0), (0.07 * s, 0.0), (0.075 * s, 0.02), (0.02, 0.04), (0.012, 0.32 * s), (0.0, 0.33 * s)], 0, 0, 0, seg=12, col=BRASS)
    xf.lathe(sh.a('shade'), [(0.07 * s, 0.28 * s), (0.15 * s, 0.28 * s), (0.11 * s, 0.48 * s), (0.06 * s, 0.48 * s)], 0, 0, 0, seg=16)
    CL.glow(sh.root, 'tablelamp', x, y + 0.38 * s, z, color='rgba(255,200,130,1)', size=0.6, day=0.15, night=0.9)


def mushroom(x, z, y):
    """桌上的黃銅小蘑菇燈＋一顆蠟燭杯"""
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcm'), [(0.0, 0.0), (0.05, 0.0), (0.012, 0.02), (0.012, 0.2), (0.0, 0.2)], 0, 0, 0, seg=10, col=BRASS)
    xf.lathe(sh.a('vcm'), [(0.0, 0.26), (0.06, 0.24), (0.1, 0.19), (0.095, 0.185)], 0, 0, 0, seg=12, col=BRASS)
    sh.a('bulb').sphere((x, y + 0.19, z), 0.025, seg=8, rings=5)
    CL.glow(sh.root, 'tablelamp', x, y + 0.16, z, color='rgba(255,200,130,1)', size=0.4, day=0.0, night=0.7)


def candle(x, z, y):
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.032, 0.06), (0.0, 0.06)], 0, 0, 0, seg=8)
    sh.a('bulb').cyl((x, y + 0.005, z), (x, y + 0.03, z), 0.022, seg=8)


def vase(x, z, y):
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.022, 0.13)], 0, 0, 0, seg=8)
    for j in range(5):
        a = j * 1.3; tx, tz = math.cos(a) * 0.05, math.sin(a) * 0.05
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.1, 0), (tx, y + 0.24 + (j % 2) * 0.05, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.01), (0.02, -0.004), (0.021, 0.0), (0.0, 0.008)], seg=5), '#f8f6ee'), Matrix.Translation(g2b(x + tx, y + 0.24 + (j % 2) * 0.05, z + tz)))


def leafy(x, z, h=1.5):
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col='#d8d0c0')
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)


def basket(x, z, r=0.2, h=0.36, col='#b89a6a'):
    """藤編籃當花盆：旋轉體＋幾圈深一點的編織條"""
    Xf(x, z).lathe(sh.a('vc'), [(0.0, 0.0), (r * 0.85, 0.0), (r, h * 0.9), (r * 1.04, h), (0.0, h)], 0, 0, 0, seg=14, col=col)
    for k in range(4): y = 0.06 + k * h * 0.22; Xf(x, z).lathe(sh.a('vc'), [(r * (0.86 + 0.14 * y / h) + 0.004, y), (r * (0.86 + 0.14 * y / h) + 0.004, y + 0.025)], 0, 0, 0, seg=14, col='#8a6a42')


def snake_plant(x, z, y0, n=14, h=0.95, rng=None):
    """虎尾蘭：直直往上的長葉（兩面、頂端尖、深綠帶淺邊），各自往外斜一點"""
    rng = rng or random.Random(int(abs(x * 13 + z * 7)))
    for k in range(n):
        a = rng.uniform(0, 2 * math.pi); hh = h * rng.uniform(0.55, 1.0); w = rng.uniform(0.045, 0.07); lean = rng.uniform(0.04, 0.22); r0 = rng.uniform(0.0, 0.08)
        bx, bz = x + math.cos(a) * r0, z + math.sin(a) * r0; tx, tz = bx + math.cos(a) * lean * hh, bz + math.sin(a) * lean * hh
        px, pz = -math.sin(a + rng.uniform(-0.6, 0.6)), math.cos(a + rng.uniform(-0.6, 0.6))
        bm = bmesh.new(); pts = []
        prof = [(0.0, 0.6), (0.35, 1.0), (0.75, 0.75), (1.0, 0.04)]
        for side in (0, 1):                                                                                                # 正反兩面各一組頂點（同一組頂點反過來 bmesh 會當成同一面）
            pts = []
            for (t, ww) in prof:
                cx_, cz_ = bx + (tx - bx) * t, bz + (tz - bz) * t; cy = y0 + hh * t
                pts.append((bm.verts.new(g2b(cx_ - px * w * ww / 2, cy, cz_ - pz * w * ww / 2)), bm.verts.new(g2b(cx_ + px * w * ww / 2, cy, cz_ + pz * w * ww / 2))))
            for (a0, a1), (b0, b1) in zip(pts, pts[1:]):
                f1 = [a0, a1, b1, b0]; bm.faces.new(f1 if side == 0 else list(reversed(f1)))
        bm.normal_update(); K.paint_bm(bm, rng.choice(('#2f4a2a', '#3a5a2e', '#2a4226'))); sh.a('vc').add_bm(bm); bm.free()


def big_plant(x, z, kind):
    if CC0 and kind != 'snake':   # CC0：大盆栽換 Poly Haven 掃描（琴葉榕的位置放 potted_plant_02、大葉盆栽放 potted_plant_01）；虎尾蘭照舊
        K0.ph_put('potted_plant_02' if kind == 'fig' else 'potted_plant_01', x, 0.0, z, (x * 7.3) % 6.28, 1.0, share=False, height=1.6 if kind == 'fig' else 1.05, decimate=0.03, tag='_fig' if kind == 'fig' else '_big')
        return
    if kind == 'fig':                                                                                                      # 琴葉榕：高、細幹、大葉子在上半部；藤編籃
        basket(x, z, r=0.22, h=0.4); sh.plant(x, z, h=1.75, r=0.2, pot_col='#b89a6a', y0=0.0, seed=71)
        Xf(x, z).cyl(sh.a('vc'), (0, 0.4, 0), (0.04, 1.1, 0.02), 0.018, col='#6a5236', seg=5, caps=False)
    elif kind == 'snake':                                                                                                  # 虎尾蘭：黑色圓筒陶盆
        Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.19, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=14, col='#2e2e2c')
        snake_plant(x, z, 0.42, n=16, h=1.0)
    else:                                                                                                                  # 大葉盆栽：赤陶盆（兩層葉子）
        Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.14, 0.0), (0.19, 0.36), (0.21, 0.4), (0.0, 0.4)], 0, 0, 0, seg=12, col='#a85a3a')
        sh.plant(x, z, h=0.75, r=0.3, pot_col='#a85a3a', y0=0.37)


def brass_pendant(x, z, y, r=0.24):
    """v1c（BB 遊戲內截圖 G：原本看起來是黃色的碗）：深色舊黃銅的半球燈罩、裡面亮、露出燈泡＋燈罩上面的黃銅吊頭"""
    Xf(x, z).cyl(sh.a('vcm'), (0, H, 0), (0, y + 0.07, 0), 0.004, col='#2a2a2a', seg=4)                                # 自己畫（K.dome_pendant 是 24 段，這裡 6 盞改 14 段省三角形）
    prof = [(0.03, 0.0), (r * 0.5, -r * 0.14), (r * 0.85, -r * 0.48), (r, -r * 0.9), (r * 0.97, -r * 0.93)]
    Xf(x, z).lathe(sh.a('vcm'), [(a_, y + b_) for a_, b_ in prof], 0, 0, 0, seg=14, col='#6a4c26')
    Xf(x, z).lathe(sh.a('shade'), [(r * 0.95, y - r * 0.9), (r * 0.6, y - r * 0.3), (0.03, y - 0.02)], 0, 0, 0, seg=14)
    sh.a('bulb').sphere((x, y - r * 0.6, z), 0.045, seg=8, rings=5)
    CL.glow(sh.root, 'pendant', x, y - r * 0.6, z, color='rgba(255,206,150,1)', size=0.9, day=0.0, night=0.6)
    Xf(x, z).lathe(sh.a('vcm'), [(0.0, y + 0.07), (0.035, y + 0.07), (0.045, y + 0.02), (0.03, y - 0.005), (0.0, y - 0.005)], 0, 0, 0, seg=10, col='#8a6a36')


# ---------------------------------------------------------------- 地板、天花板（深色外露：管線、冷氣、軌道燈）、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=2.2).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)   # v1c（BB 遊戲內截圖 G）：參考圖是外露的淺色水泥天花板（v1b 的深色木板拿掉）
CON = '#bdb6aa'; DUCT = '#c9c9c3'; DUCT2 = '#a9a9a3'
for k in range(3): z_ = Z0 + 2.0 + k * 4.0; xf0.rbox(sh.a('vc'), X0, X1, H - 0.42, H - 0.005, z_ - 0.2, z_ + 0.2, r=0.01, seg=1, col=CON)   # 水泥大梁（深 0.42）
for x_ in (-3.5, 3.5): xf0.rbox(sh.a('vc'), x_ - 0.15, x_ + 0.15, H - 0.28, H - 0.005, Z0, Z1, r=0.01, seg=1, col=CON)              # 小梁（交叉）
xf0.rbox(sh.a('vcm'), X0 + 0.4, X1 - 0.4, H - 0.62, H - 0.3, -1.25, -0.75, r=0.02, seg=1, col=DUCT)                                      # 方形風管（鍍鋅，梁下面通過）
for k in range(9): x_ = X0 + 0.9 + k * (W - 1.8) / 8; xf0.rbox(sh.a('vcm'), x_ - 0.02, x_ + 0.02, H - 0.64, H - 0.28, -1.27, -0.73, r=0.004, seg=1, col=DUCT2)   # 風管接縫
for x_ in (-4.5, 0.5, 4.5): xf0.rbox(sh.a('vcm'), x_ - 0.16, x_ + 0.16, H - 0.7, H - 0.62, -1.16, -0.84, r=0.01, seg=1, col='#3a3a38')     # 出風口
for (zz, r_, col) in ((-3.2, 0.06, '#9a9a94'), (-3.0, 0.03, '#2a2a28'), (2.6, 0.08, DUCT), (3.6, 0.04, '#9a9a94'), (3.75, 0.02, '#2a2a28')): xf0.cyl(sh.a('vcm'), (X0, H - 0.5, zz), (X1, H - 0.5, zz), r_, col=col, seg=8, caps=False)   # 管線、電線管
for x_ in (-5.6, -3.0, 2.4, 5.8): xf0.cyl(sh.a('vcm'), (x_, H - 0.5, Z0), (x_, H - 0.5, Z1), 0.02, col='#2a2a28', seg=6, caps=False)   # v1e（BB 07:54）：x −1.6 那條會從招牌（x −2.3～−0.5）中間穿過，搬到 −3.0
xf0.rbox(sh.a('vcm'), -1.0, 0.2, H - 0.36, H - 0.32, 0.6, 1.8, r=0.02, seg=1, col='#e6e4dd'); xf0.rbox(sh.a('vcm'), -0.85, 0.05, H - 0.365, H - 0.355, 0.75, 1.65, r=0.005, seg=1, col='#a8a8a4')   # 冷氣
for zz in (3.0, -0.6):                                                                                                    # 兩條黑色軌道燈
    xf0.rbox(sh.a('vcm'), X0 + 0.6, X1 - 0.6, H - 0.36, H - 0.33, zz - 0.02, zz + 0.02, r=0.004, seg=1, col='#24221f')
    for k in range(7):
        x = X0 + 1.1 + k * (W - 2.2) / 6; sp = Xf(x, zz, 0.0); sp.cyl(sh.a('vcm'), (0, H - 0.36, 0), (0, H - 0.5, 0.04 if zz > 0 else -0.04), 0.03, col='#24221f', seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.5, 0.04 if zz > 0 else -0.04), sp.p(0, H - 0.505, 0.042 if zz > 0 else -0.042), 0.024, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.7, zz, color='rgba(255,210,150,1)', size=0.5, day=0.0, night=0.55)
ops = [(-CF.DOOR, CF.DOOR, 0.0, CF.HEAD, 'door'), (CF.SX0, -CF.DOOR - CF.POST, CF.SILL, CF.HEAD, 'win'), (CF.DOOR + CF.POST, CF.SX1, CF.SILL, CF.HEAD, 'win')]
sh.wall_with_openings('front', ops, 'wood', 'wall', 1.0, 'wood', mull=0.9)   # v1b：下半部胡桃木護牆板
xf0.rbox(sh.w('front', 'wood'), -CF.DOOR, CF.DOOR, CF.TRAN - 0.03, CF.TRAN + 0.03, Z1 - 0.14, Z1, r=0.004, seg=1)          # 門上氣窗的橫木
rops = [(zc - CF.WIN_W / 2, zc + CF.WIN_W / 2, CF.WIN_Y - CF.WIN_H / 2, CF.WIN_Y + CF.WIN_H / 2, 'win') for zc in CF.RIGHT_WINS]
sh.wall_with_openings('right', rops, 'wood', 'wall', 1.0, 'wood', mull=0.75)
for side in ('back', 'left'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wood', a0, a1, 0.0, 1.0); sh.wall_box(side, 'wall', a0, a1, 1.0, H)
for side, (a0, a1) in (('left', (Z0, Z1)), ('right', (Z0, Z1)), ('back', (X0, X1)), ('front', (X0, -CF.DOOR - CF.POST)), ('front', (CF.DOOR + CF.POST, X1))): sh.wall_box(side, 'wood', a0, a1, 0.98, 1.04, -0.03, 0.0)   # 護牆板上緣的木條（門口斷開）
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(9.0, 5.5, vz), (-9.0, 5.5, vz), (-9.0, -1.0, vz), (9.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.5))   # 圖的上半
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
vx = X1 + 2.5; vr = Mesh('WALL_right_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vr, [(vx, -1.0, -5.0), (vx, -1.0, 5.0), (vx, 5.0, 5.0), (vx, 5.0, -5.0)], uv=(0.0, 0.0, 1.0, 0.5))   # 圖的下半
vr.finish(sh.root, uv=False, props={'dir': K.DIRS['right'], 'windowView': True})
for zz in (-4.4, 4.2):                                                                                                     # 西牆的黃銅壁燈（拱門兩邊）
    wx = sh.wall_xf('left', zz, 0.0, 2.15); wx.rbox(sh.w('left', 'vcm'), -0.05, 0.05, -0.08, 0.08, 0.0, 0.03, r=0.01, seg=1, col=BRASS)
    px_, py_, pz_ = wx.p(0, 0, 0.14); sh.a('shade').sphere((px_, py_ + 0.02, pz_), 0.07, seg=10, rings=6)
    CL.glow(sh.root, 'sconce', px_, py_, pz_, color='rgba(255,200,130,1)', size=0.5, day=0.1, night=0.8)
sh.tally('shell')

# ---------------------------------------------------------------- 窗邊吧台（固定）＋燈罩檯燈、高腳椅
for sgn in (1, -1):
    a, b = sorted((sgn * CF.COUNTER_X[0], sgn * CF.COUNTER_X[1]))
    xf0.rbox(sh.a('wood'), a, b, CF.COUNTER_H - 0.05, CF.COUNTER_H, CF.COUNTER_Z - CF.COUNTER_DEP / 2, CF.COUNTER_Z + CF.COUNTER_DEP / 2, r=0.01, seg=1)
    for xx in (a + 0.05, b - 0.08): xf0.rbox(sh.a('wood'), xx, xx + 0.03, 0.0, CF.COUNTER_H - 0.05, CF.COUNTER_Z - 0.15, CF.COUNTER_Z + 0.15, r=0.004, seg=1)
    for k in range(2): shade_lamp(a + 0.6 + k * (b - a - 1.2), CF.COUNTER_Z + 0.05, CF.COUNTER_H, s=1.1)
    candle((a + b) / 2, CF.COUNTER_Z - 0.05, CF.COUNTER_H); sh.plant((a + b) / 2 + 0.6, CF.COUNTER_Z + 0.06, h=0.3, r=0.08, pot_col='#d8d0c0', y0=CF.COUNTER_H)
for x in CF.WC_STOOLS: stool(x, 4.95, h=0.75)
sh.tally('window')

# ---------------------------------------------------------------- 吧檯（固定：後牆前）、層架、2:30 AM 招牌、蛋糕櫃、咖啡機、黃銅吊燈
bx0, bx1 = CF.BAR['x'] - CF.BAR['w'] / 2, CF.BAR['x'] + CF.BAR['w'] / 2; bz0, bz1 = CF.BAR['z'] - CF.BAR['d'] / 2, CF.BAR['z'] + CF.BAR['d'] / 2; bh = CF.BAR['h']
xf0.rbox(sh.a('wood'), bx0, bx1, 0.0, bh - 0.05, bz0, bz1, r=0.01, seg=1)
for k in range(10):                                                                                                      # 胡桃木框格面板
    x = bx0 + 0.05 + k * (CF.BAR['w'] - 0.1) / 10; xf0.rbox(sh.a('vc'), x + 0.04, x + (CF.BAR['w'] - 0.1) / 10 - 0.04, 0.15, bh - 0.18, bz1, bz1 + 0.02, r=0.006, seg=1, col=WAL2)
sh.a('bulb').box(bx0 + 0.05, bx1 - 0.05, bh - 0.11, bh - 0.095, bz1 + 0.02, bz1 + 0.03)                                # 檯面下的燈條
xf0.rbox(sh.a('vcg'), bx0 - 0.03, bx1 + 0.03, bh - 0.05, bh, bz0 - 0.02, bz1 + 0.06, r=0.012, seg=1, col=STONE)       # 深色石材檯面
top = bh; m = sh.a('vcm')
RE = random.Random(2303)


def espresso(x, z, y):
    """v1e（BB 07:54：白色方盒＋三顆圓鈕＝§9-7 低品質替代物）：不鏽鋼義式咖啡機——倒角機身、黑色前面板、三個沖煮頭＋黑把手、兩根蒸氣管、兩個儀表、滴水盤；上面的溫杯架疊著杯子（照 SUNNY SIDE v1c 的做法）"""
    t = Xf(x, z, 0.0, y); m = sh.a('vcm')
    t.rbox(m, -0.5, 0.5, 0.06, 0.46, -0.22, 0.17, r=0.05, seg=2, col='#c8c8c6')
    t.rbox(m, -0.46, 0.46, 0.14, 0.4, 0.165, 0.19, r=0.02, seg=2, col='#2e2e2c')
    t.rbox(m, -0.48, 0.48, 0.0, 0.06, -0.2, 0.25, r=0.015, seg=2, col='#3a3a38')                                     # 滴水盤
    for k in range(6): t.rbox(m, -0.44 + k * 0.17, -0.36 + k * 0.17, 0.059, 0.062, 0.0, 0.24, r=0.0, seg=1, col='#9a9a96')   # 滴水盤的格柵
    for sx in (-0.26, 0.0, 0.26):
        t.cyl(m, (sx, 0.34, 0.19), (sx, 0.25, 0.22), 0.045, col='#d8d8d6', seg=12)
        t.cyl(m, (sx, 0.24, 0.22), (sx + 0.02, 0.21, 0.43), 0.014, col='#1e1e1e', seg=6)                               # 把手
        if sx != 0.0: t.lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.033, 0.05), (0.0, 0.01)], sx, 0.06, 0.22, seg=10, col='#f4f2ea')   # 接著的小杯
    for sx in (-0.43, 0.43):                                                                                          # 蒸氣管：兩段彎下來＋頂上的旋鈕
        t.cyl(m, (sx, 0.36, 0.17), (sx * 1.08, 0.32, 0.27), 0.007, col='#d8d8d6', seg=5); t.cyl(m, (sx * 1.08, 0.32, 0.27), (sx * 1.1, 0.12, 0.28), 0.006, col='#d8d8d6', seg=5)
        t.cyl(m, (sx, 0.46, 0.05), (sx, 0.5, 0.05), 0.025, col='#1e1e1e', seg=8)
    for sx in (-0.1, 0.1): Xf(x + sx, z + 0.192, 0.0, y + 0.35).rbox(m, -0.03, 0.03, -0.03, 0.03, 0.0, 0.012, r=0.012, seg=2, col='#e8e8e4')   # 兩個儀表
    t.rbox(m, -0.49, 0.49, 0.46, 0.49, -0.22, 0.17, r=0.01, seg=1, col='#a8a8a4')                                       # 上面的溫杯架
    for sx in (-0.49, 0.49): t.rbox(m, sx - 0.006, sx + 0.006, 0.49, 0.56, -0.22, 0.17, r=0.0, seg=1, col='#b8b8b4')   # 杯架的欄杆
    cx = -0.44
    while cx < 0.42:                                                                                                  # 杯子：大小不一、有的疊兩三個
        r = RE.uniform(0.028, 0.042); cx += r + RE.uniform(0.005, 0.03)
        if cx + r > 0.46: break
        n = RE.choice((1, 1, 1, 2)); hh = RE.uniform(0.05, 0.08); col = RE.choice(('#f2efe8', '#e8dcc8', '#d8d4cc')); zz = RE.uniform(-0.15, 0.08)
        for q in range(n): Xf(x + cx, z + zz, 0, y + 0.49 + q * hh * 0.82).lathe(sh.a('vcg'), [(0.0, 0.0), (r * 0.8, 0.0), (r, hh), (r * 0.9, hh)], 0, 0, 0, seg=8, col=col)
        cx += r


espresso(bx0 + 1.6, CF.BAR['z'] - 0.1, top)
for gx in (bx0 + 2.5, bx0 + 2.8):                                                                                       # 兩台磨豆機
    g = Xf(gx, CF.BAR['z'] - 0.15, 0, top); g.rbox(m, -0.09, 0.09, 0.0, 0.3, -0.09, 0.09, r=0.02, seg=1, col='#2e2e2e'); g.lathe(sh.a('glass'), [(0.03, 0.3), (0.08, 0.5), (0.07, 0.52)], 0, 0, 0, seg=10)
    Xf(gx, CF.BAR['z'] - 0.15, 0, top + 0.32).lathe(sh.a('vcg'), [(0.0, 0.0), (0.06, 0.0), (0.07, 0.14), (0.0, 0.14)], 0, 0, 0, seg=10, col='#3a2418')
for k in range(4): Xf(bx0 + 3.3 + k * 0.12, CF.BAR['z'] + 0.15, 0, top).lathe(m, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.09), (0.0, 0.09)], 0, 0, 0, seg=8, col='#c8c8c4')   # 拉花鋼杯
Xf(bx0 + 4.4, CF.BAR['z'], 0.0, top).rbox(m, -0.15, 0.15, 0.0, 0.08, -0.12, 0.12, r=0.01, seg=1, col='#2e2e2e')         # 收銀機
Xf(bx0 + 4.4, CF.BAR['z'], 0.0, top).rbox(m, -0.13, 0.13, 0.08, 0.28, -0.13, -0.11, r=0.006, seg=1, col='#2e2e2e')
vase(bx0 + 4.9, CF.BAR['z'] + 0.1, top); candle(bx0 + 5.3, CF.BAR['z'] + 0.2, top); candle(bx0 + 0.6, CF.BAR['z'] + 0.2, top)
pc = IT['pastry_case'][0]; pc0, pc1 = pc['x'] - pc['w'] / 2, pc['x'] + pc['w'] / 2                                      # 蛋糕櫃（彎玻璃的近似：三層）
xf0.rbox(sh.a('wood'), pc0, pc1, top, top + 0.06, bz0 + 0.05, bz1 - 0.02, r=0.006, seg=1)
sh.a('glass').box(pc0 + 0.01, pc1 - 0.01, top + 0.06, top + 0.5, bz0 + 0.06, bz1 - 0.03); sh.a('bulb').box(pc0 + 0.04, pc1 - 0.04, top + 0.485, top + 0.495, bz0 + 0.1, bz1 - 0.1)
for y in (top + 0.2, top + 0.34): sh.a('glass').box(pc0 + 0.02, pc1 - 0.02, y, y + 0.01, bz0 + 0.07, bz1 - 0.05)
for row, y in enumerate((top + 0.06, top + 0.21, top + 0.35)):
    for k in range(4): Xf(pc0 + 0.15 + k * 0.26, CF.BAR['z'] + 0.05, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.08, 0.0), (0.08, 0.07), (0.0, 0.075)], 0, 0, 0, seg=10, col=('#f4ecd8', '#e8c890', '#c98a5a', '#f0d0c8')[(k + row) % 4])
RB = random.Random(2301)
BOTC = ('#2e4a2e', '#4a2e1e', '#6a5a3a', '#1e2a22', '#7a3a22', '#2a2a3a', '#8a6a3a', '#3a4a2a'); LABC = ('#e8e0cc', '#d8c8a0', '#f2efe8', '#c9b48a')


def sh_bottle(x, z, y):
    shp = RB.random(); hh = RB.uniform(0.28, 0.4) if shp < 0.6 else RB.uniform(0.18, 0.26); rr = RB.uniform(0.036, 0.05) if shp < 0.85 else RB.uniform(0.05, 0.065)
    prof = [(0.0, 0.0), (rr, 0.0), (rr, hh * 0.62), (0.014, hh * 0.85), (0.013, hh), (0.0, hh)] if shp < 0.6 else ([(0.0, 0.0), (rr, 0.0), (rr * 1.05, hh * 0.45), (rr * 0.5, hh * 0.75), (0.016, hh), (0.0, hh)] if shp < 0.85 else [(0.0, 0.0), (rr, 0.0), (rr, hh * 0.8), (0.02, hh), (0.0, hh)])
    Xf(x, z, 0, y).lathe(sh.a('vcg'), prof, 0, 0, 0, seg=6, col=RB.choice(BOTC))
    if RB.random() < 0.45: Xf(x, z, 0, y).rbox(sh.a('vc'), -rr * 0.85, rr * 0.85, hh * 0.25, hh * 0.5, rr * 0.98, rr + 0.002, r=0.0, seg=1, col=RB.choice(LABC))   # 酒標


def sh_jar(x, z, y):
    h = RB.uniform(0.11, 0.24); r = RB.uniform(0.04, 0.065)
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (r, 0.0), (r, h * 0.86), (r * 0.8, h * 0.9), (r * 0.82, h), (0.0, h)], 0, 0, 0, seg=8, col=RB.choice(('#5a3a22', '#6a4a2a', '#3a2418', '#8a6a3a', '#c9a26a', '#e8dcc0')))
    Xf(x, z, 0, y + h * 0.86).lathe(sh.a('vcm'), [(r * 0.84, 0.0), (r * 0.84, h * 0.12), (0.0, h * 0.14)], 0, 0, 0, seg=6, col=RB.choice(('#b8944a', '#3a3a3a', '#8a6a3a')))


def sh_cup(x, z, y, n=1):
    col = RB.choice(('#f2efe8', '#e8dcc8', '#d8d4cc', '#3a4a5a', '#7a5a3a'))
    for q in range(n): Xf(x, z, 0, y + q * 0.07).lathe(sh.a('vcg'), [(0.0, 0.0), (0.032, 0.0), (0.04, 0.085), (0.036, 0.085)], 0, 0, 0, seg=8, col=col)


for (y, kind) in ((1.55, 'jar'), (1.95, 'mug'), (2.35, 'jar'), (2.75, 'bottle')):   # v1d（BB：不能等距排滿、也不能太空）：一群一群擠在一起（每群 3～7 件、大小顏色不同），群和群之間留空；偶爾一盆小植物
    xf0.rbox(sh.a('wood'), bx0 + 0.1, bx1 - 0.1, y - 0.035, y, Z0 + 0.012, Z0 + 0.32, r=0.004, seg=1)
    sh.a('bulb').box(bx0 + 0.15, bx1 - 0.15, y - 0.045, y - 0.035, Z0 + 0.28, Z0 + 0.3)
    xx = bx0 + 0.22 + RB.uniform(0, 0.2); sg_ = IT['sign'][0]
    while xx < bx1 - 0.22:
        if kind == 'bottle' and abs(xx - sg_['along']) < sg_['w'] / 2 + 0.12: xx = sg_['along'] + sg_['w'] / 2 + 0.15; continue   # 招牌前面不放酒瓶
        if RB.random() < 0.14:
            sh.plant(xx + 0.08, Z0 + 0.16, h=RB.uniform(0.22, 0.34), r=RB.uniform(0.06, 0.085), pot_col=RB.choice(('#d8d0c0', '#b0653e', '#3a3a38')), y0=y); xx += RB.uniform(0.35, 0.6); continue
        for q in range(RB.randint(3, 4)):
            if xx > bx1 - 0.2: break
            zz = Z0 + 0.16 + RB.uniform(-0.05, 0.06); k_ = kind if RB.random() < 0.8 else RB.choice(('jar', 'mug', 'bottle'))
            if k_ == 'bottle': sh_bottle(xx, zz, y)
            elif k_ == 'jar': sh_jar(xx, zz, y)
            else: sh_cup(xx, zz, y, n=RB.choice((1, 1, 2, 3)))
            xx += RB.uniform(0.095, 0.14)
        xx += RB.uniform(0.4, 0.75)
for xx in (bx0 + 0.5, bx0 + 2.9, bx1 - 0.6): sh.hanging_pothos('pothos', xx, 2.82, Z0 + 0.2, n=6, drop=0.9)
sg = IT['sign'][0]; sh.wall_img('back', 'print', sg['along'], sg['y'], sg['w'], sg['h'], K.cell_uv(0, 0, 4, 1), off=0.03)
xf0.rbox(sh.w('back', 'wood'), sg['along'] - sg['w'] / 2 - 0.04, sg['along'] + sg['w'] / 2 + 0.04, sg['y'] - sg['h'] / 2 - 0.04, sg['y'] + sg['h'] / 2 + 0.04, Z0, Z0 + 0.025, r=0.006, seg=1)
hr = IT['hours'][0]; sh.wall_img('back', 'print', hr['along'], hr['y'], hr['w'], hr['h'], K.cell_uv(6, 2, 2, 1), off=0.03)
sh.wall_img('back', 'print', 0.7, CF.ROSTER[1], 0.3, 0.42, K.cell_uv(4, 0, 2, 2), off=0.02)                              # 班表位置的小黑板（照舊在 x 0.7）
for k in range(6): brass_pendant(bx0 + 0.6 + k * (CF.BAR['w'] - 1.2) / 5, CF.BAR['z'] + 0.45, 2.15 + (0.08 if k % 2 else 0.0), r=0.21)   # v1b：一排 6 盞（v1c：高度一高一低）
for x, z_ in CF.STOOLS + [CF.STOOL4]: stool(x, z_, h=0.75)
sh.tally('bar')

# ---------------------------------------------------------------- 後牆書牆（固定 x 1.4～6.8）＋唱片櫃、唱盤
# v1c（BB 遊戲內截圖 H、G）：原本整面同高同寬的書背圖等距排滿，看起來是複製的。參考圖是「高書櫃＋矮唱片櫃（上面放唱盤、檯燈）＋高書櫃」，
# 書一本一本做（高低、厚薄、傾倒、平放各不同），中間穿插相框、小盆栽、立著的黑膠、空位。「看唱片」(4.1, −5.0) 正對中間的唱片櫃。
BOOKC = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#4a6c8c', '#efe6cf', '#b8462e', '#6a6a62', '#2a2a2a']
RK = random.Random(2302); bk0, bk1 = CF.BOOKCASE; wm = sh.a('wood'); BZ = Z0 + 0.2   # 書櫃中心離後牆 0.2


def book(x, y, z, t, h, d, col, lean=0.0):
    """一本書：底邊左角在 (x, y)，往 +x 厚 t、高 h、深 d（z 置中）；lean＞0 往 −x 倒（以右下角為軸）"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x = (v.co.x + 0.5) * t - t; v.co.y *= d; v.co.z = (v.co.z + 0.5) * h
    K.paint_bm(bm, col); sh.a('vcg').add_bm(bm, Matrix.Translation(g2b(x + t, y, z)) @ Matrix.Rotation(lean, 4, 'Y')); bm.free()


def fill_cell(u0, u1, y, clear, d):
    """書櫃一格（世界座標 x 從 u0 到 u1、底 y、可用高度 clear、深 d）：書一群一群放，中間穿插東西、留空位"""
    x = u0 + RK.uniform(0.0, 0.06); zc = BZ + 0.02
    while x < u1 - 0.04:
        r_ = RK.random()
        if r_ < 0.55:                                                                                                      # 一群直立的書
            n = RK.randint(3, 7); hmax = min(0.33, clear - 0.03); hb = RK.uniform(0.17, hmax)
            for q in range(n):
                t = RK.uniform(0.018, 0.048); h = min(hmax, hb * RK.uniform(0.82, 1.12))
                if x + t > u1 - 0.02: break
                book(x, y, zc + RK.uniform(-0.03, 0.01), t, h, d * RK.uniform(0.68, 0.9), RK.choice(BOOKC)); x += t + RK.uniform(0.0, 0.004)
            if RK.random() < 0.45 and x < u1 - 0.1:                                                                       # 最後一本靠著倒
                t = RK.uniform(0.02, 0.04); h = min(hmax, hb * 0.95); ang = RK.uniform(0.25, 0.5)
                book(x + h * math.sin(ang) * 0.95, y, zc, t, h, d * 0.8, RK.choice(BOOKC), lean=ang); x += h * math.sin(ang) + t + 0.02
            x += RK.uniform(0.0, 0.05)
        elif r_ < 0.66:                                                                                                    # 平放的一疊
            yy = y; w_ = RK.uniform(0.17, 0.24)
            for q in range(RK.randint(2, 5)):
                tt = RK.uniform(0.025, 0.045); Xf(x + w_ / 2, zc, RK.uniform(-0.15, 0.15), yy).rbox(sh.a('vcg'), -w_ / 2 * RK.uniform(0.85, 1), w_ / 2 * RK.uniform(0.85, 1), 0.0, tt, -d * 0.36, d * 0.36, r=0.003, seg=1, col=RK.choice(BOOKC)); yy += tt
            x += w_ + RK.uniform(0.03, 0.08)
        elif r_ < 0.74 and clear > 0.25:                                                                                   # 立著的小相框
            fw, fh = RK.choice(((0.14, 0.19), (0.18, 0.13), (0.12, 0.16)))
            fx = Xf(x + fw / 2, zc - 0.02, RK.uniform(-0.12, 0.12), y); fx.rbox(sh.a('vc'), -fw / 2, fw / 2, 0.0, fh, -0.008, 0.008, r=0.003, seg=1, col=RK.choice(('#2a2a2a', '#b8944a', '#5a3a24', '#e8e0cc')))
            sh.img_quad(sh.a('print'), fx, 0.0, 0.015, 0.0095, fw - 0.03, fh - 0.03, K.cell_uv(*RK.choice(((6, 0), (0, 1), (2, 1))), 2, 2))
            x += fw + RK.uniform(0.04, 0.1)
        elif r_ < 0.82 and clear > 0.22:                                                                                   # 小盆栽
            rr = RK.uniform(0.055, 0.08); sh.plant(x + rr, zc, h=RK.uniform(0.18, min(0.32, clear - 0.1)), r=rr, pot_col=RK.choice(('#d8d0c0', '#b0653e', '#3a3a38', '#8a9a8a')), y0=y); x += 2 * rr + RK.uniform(0.05, 0.1)
        elif r_ < 0.88 and clear > 0.33:                                                                                   # 靠著的黑膠封套
            ang = RK.uniform(0.12, 0.3); sh.img_quad(sh.a('print'), Xf(x + 0.16, zc - d * 0.2, 0.0, y), 0.0, 0.0, 0.0, 0.31, 0.31, K.cell_uv(RK.randrange(8), 3, 1, 1), tilt=ang); x += 0.36
        else: x += RK.uniform(0.12, 0.3)                                                                                   # 空位


def tall_case(x0, x1, bays, levels, d=0.36, top=2.4):
    """高書櫃：背板、側板、隔板、頂板（胡桃木）"""
    cx = (x0 + x1) / 2; xf = Xf(cx, BZ, 0.0); w = x1 - x0
    xf.rbox(wm, -w / 2, w / 2, 0.0, top, -d / 2, -d / 2 + 0.02, r=0.003, seg=1)
    for k in range(bays + 1): u = -w / 2 + k * w / bays; xf.rbox(wm, u - 0.02, u + 0.02, 0.0, top, -d / 2, d / 2, r=0.004, seg=1)
    xf.rbox(wm, -w / 2 - 0.02, w / 2 + 0.02, top, top + 0.05, -d / 2, d / 2 + 0.02, r=0.008, seg=1)
    for y in levels: xf.rbox(wm, -w / 2, w / 2, y - 0.025, y, -d / 2, d / 2, r=0.003, seg=1)
    ys = list(levels) + [top]
    for k in range(bays):
        u0, u1 = x0 + k * w / bays + 0.025, x0 + (k + 1) * w / bays - 0.025
        for q in range(len(levels)): fill_cell(u0, u1, ys[q], ys[q + 1] - ys[q] - 0.025, d - 0.05)
    return top


rp = IT['record_player'][0]; RC0, RC1 = rp['x'] - 0.85, rp['x'] + 0.85                                                  # 中間：矮唱片櫃 x 3.25～4.95
tall_case(bk0, RC0 - 0.05, 2, (0.06, 0.5, 0.94, 1.36, 1.84))
tall_case(RC1 + 0.05, bk1, 2, (0.06, 0.48, 0.92, 1.4, 1.86))
rh = 0.95; rxf = Xf(rp['x'], BZ, 0.0); rw = RC1 - RC0
rxf.rbox(wm, -rw / 2, rw / 2, 0.0, rh, -0.2, -0.18, r=0.003, seg=1); rxf.rbox(wm, -rw / 2 - 0.02, rw / 2 + 0.02, rh - 0.04, rh, -0.2, 0.22, r=0.008, seg=1)
for k in range(4): u = -rw / 2 + k * rw / 3; rxf.rbox(wm, u - 0.02, u + 0.02, 0.0, rh - 0.04, -0.2, 0.2, r=0.004, seg=1)
for y in (0.04, 0.48): rxf.rbox(wm, -rw / 2, rw / 2, y - 0.03, y, -0.2, 0.2, r=0.003, seg=1)
for q, y in enumerate((0.04, 0.48)):                                                                                     # 每格一排黑膠（封套一張一張，有的往前傾、有的抽出一半）
    for c in range(3):
        u0 = -rw / 2 + c * rw / 3 + 0.04; n = RK.randint(5, 8)
        for j in range(n):
            if RK.random() < 0.12: continue
            uu = u0 + j * (rw / 3 - 0.1) / n; pull = 0.06 if RK.random() < 0.1 else 0.0
            sh.img_quad(sh.a('print'), Xf(rp['x'] + uu, BZ + pull, -math.pi / 2), 0.0, y + 0.005, 0.0, 0.3, 0.3, K.cell_uv(RK.randrange(8), 3, 1, 1), tilt=RK.uniform(-0.08, 0.22))
rt = Xf(rp['x'] - 0.15, rp['z'] + 0.05, 0.0, rh); rt.rbox(sh.a('wood'), -0.22, 0.22, 0.0, 0.1, -0.17, 0.17, r=0.01, seg=1)   # 唱盤
rt.lathe(sh.a('vcg'), [(0.0, 0.1), (0.15, 0.1), (0.15, 0.115), (0.0, 0.115)], 0, 0, 0, seg=20, col='#1a1a1a'); rt.cyl(sh.a('vcm'), (0.17, 0.12, -0.12), (0.05, 0.13, 0.05), 0.006, col=BRASS, seg=4)
mushroom(rp['x'] + 0.45, rp['z'] + 0.05, rh); sh.img_quad(sh.a('print'), Xf(rp['x'] + 0.7, BZ - 0.05, 0.0, rh), 0.0, 0.0, 0.0, 0.3, 0.3, K.cell_uv(2, 3, 1, 1), tilt=0.2)
for q in range(4): Xf(rp['x'] + 0.25, BZ, RK.uniform(-0.2, 0.2), rh + q * 0.008).rbox(sh.a('vcg'), -0.155, 0.155, 0.0, 0.007, -0.155, 0.155, r=0.0, seg=1, col=RK.choice(('#2a2a2a', '#c9b48a', '#7b2d26', '#e8e0cc')))
for k, (along, cy, w_, cell) in enumerate(((rp['x'] - 0.45, 1.62, 0.5, (6, 0)), (rp['x'] + 0.4, 1.5, 0.34, (2, 1)))):  # 唱片櫃上方牆上兩個框
    sh.wall_img('back', 'print', along, cy, w_ - 0.06, w_ * 0.8 - 0.06, K.cell_uv(cell[0], cell[1], 2, 2), off=0.026)
    xf0.rbox(sh.w('back', 'wood'), along - w_ / 2, along + w_ / 2, cy - w_ * 0.4, cy + w_ * 0.4, Z0, Z0 + 0.02, r=0.004, seg=1)
sh.plant(bk0 + 0.35, BZ, h=0.4, r=0.1, pot_col='#d8d0c0', y0=2.45); sh.hanging_pothos('pothos', bk0 + 0.35, 2.6, BZ + 0.05, n=6, drop=1.0)
sh.hanging_pothos('pothos', bk1 - 0.4, 2.47, BZ + 0.1, n=7, drop=1.1)
for q in range(3): Xf(bk1 - 1.1, BZ, 0.1 * q, 2.45 + q * 0.04).rbox(sh.a('vcg'), -0.13, 0.13, 0.0, 0.04, -0.1, 0.1, r=0.003, seg=1, col=BOOKC[q * 3])
sh.tally('bookcase')

# ---------------------------------------------------------------- 西牆拱門卡座（新加）、照片
ar = IT['arch_alcove'][0]; az0, az1 = ar['z0'], ar['z1']; ax = X0                                                         # 拱門：兩根木框柱＋半圓拱（分段）＋玻璃格子
for zz in (az0, az1):
    xf0.rbox(sh.a('wood'), ax + 0.02, ax + 0.32, 0.0, 2.25, zz - 0.09, zz + 0.09, r=0.01, seg=1)
rc = (az1 - az0) / 2; zc = (az0 + az1) / 2
abm = bmesh.new(); N = 24; ry_ = 0.62                                                                                    # 半圓拱（扁一點）：內外兩條弧、前後兩面，一圈封起來
ring = []
for k in range(N + 1):
    t = math.pi * k / N; row = []
    for (rr, xx) in ((rc + 0.09, ax + 0.02), (rc + 0.09, ax + 0.32), (rc - 0.09, ax + 0.32), (rc - 0.09, ax + 0.02)):
        row.append(abm.verts.new(g2b(xx, 2.25 + rr * ry_ * math.sin(t), zc - rr * math.cos(t))))
    ring.append(row)
for k in range(N):
    for j in range(4): abm.faces.new((ring[k][j], ring[k][(j + 1) % 4], ring[k + 1][(j + 1) % 4], ring[k + 1][j]))
abm.normal_update(); sh.a('wood').add_bm(abm); abm.free()
for zz in (az0 + 0.09, az1 - 0.09):                                                                                      # 拱門兩側的格子玻璃
    s_ = 1 if zz < 0 else -1
    sh.a('glass').box(ax + 0.15, ax + 0.18, 0.9, 2.2, min(zz, zz + s_ * 0.35), max(zz, zz + s_ * 0.35))
    for y in (0.9, 1.33, 1.76, 2.2): xf0.rbox(sh.a('wood'), ax + 0.14, ax + 0.19, y - 0.015, y + 0.015, min(zz, zz + s_ * 0.35), max(zz, zz + s_ * 0.35), r=0.002, seg=1)
xf0.rbox(sh.w('left', 'vcg'), X0, X0 + 0.01, 0.0, 2.25, az0 + 0.1, az1 - 0.1, r=0.0, seg=1, col='#cdb894')   # 拱門裡的牆（稍暗）
bq = IT['banquette'][0]; qz0, qz1 = bq['z'] - bq['d'] / 2, bq['z'] + bq['d'] / 2
xf0.rbox(sh.a('wood'), X0 + 0.3, X0 + 0.3 + bq['w'], 0.0, 0.38, qz0, qz1, r=0.012, seg=1)
xf0.rbox(sh.a('vcg'), X0 + 0.38, X0 + 0.3 + bq['w'] + 0.02, 0.38, 0.48, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col=GREEN)
for k in range(8): xf0.rbox(sh.a('vcg'), X0 + 0.32, X0 + 0.45, 0.48, 1.05, qz0 + 0.03 + k * (bq['d'] - 0.06) / 8, qz0 + 0.03 + (k + 1) * (bq['d'] - 0.06) / 8 - 0.012, r=0.04, seg=2, col='#355040')
for (zz, col) in ((qz0 + 0.5, '#c9c0ae'), (qz1 - 0.5, '#b8ae9a')): Xf(X0 + 0.55, zz, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.84, -0.07, 0.07, r=0.06, seg=2, col=col)
bt = IT['booth_table'][0]; K.round_table(sh, bt['x'], bt['z'], r=bt['r'], h=0.72, top_key='wood', base_col='#2e2e2e'); vase(bt['x'], bt['z'], 0.72); candle(bt['x'] + 0.12, bt['z'] + 0.1, 0.72)
for s_ in LAY['seats']:
    if not s_.get('seatH'): chair(s_['x'] + math.sin(s_['yaw']) * -0.04, s_['z'] + math.cos(s_['yaw']) * -0.04, s_['yaw'])
for k, (zz, cell) in enumerate(((zc - 0.7, (6, 0)), (zc + 0.05, (0, 1)), (zc + 0.75, (2, 1)))):
    sh.wall_img('left', 'print', zz, 1.75 + (0.12 if k == 1 else 0), 0.42 if k != 1 else 0.6, 0.42 if k != 1 else 0.5, K.cell_uv(cell[0], cell[1], 2, 2), off=0.02)
brass_pendant(X0 + 1.4, zc, 2.25, r=0.2)
sh.tally('alcove')

# ---------------------------------------------------------------- 桌子（固定）、沙發角（固定）、植物
for (x, z_) in CF.TABLES:
    four = (x, z_) == CF.FOUR_TOP
    K.rect_table(sh, x, z_, 0.0, 1.3 if four else 0.7, 0.8 if four else 0.7, h=0.75, top_key='wood', leg_key='wood', leg='wood')
    for dz in (-0.8, 0.8): chair(x, z_ + dz, 0.0 if dz < 0 else math.pi)
    if four:
        for dx in (-0.85, 0.85): chair(x + dx, z_, math.pi / 2 if dx < 0 else -math.pi / 2)
    mushroom(x + 0.18, z_ - 0.1, 0.75); candle(x - 0.15, z_ + 0.12, 0.75); vase(x - 0.05, z_ - 0.15, 0.75)
so = CF.SOFA; sx = (so['x0'] + so['x1']) / 2; sz0, sz1 = so['z0'], so['z1']                                             # 沙發（面向 +x）＋矮桌＋立燈
xf0.rbox(sh.a('vc'), so['x0'], so['x1'], 0.05, 0.42, sz0, sz1, r=0.05, seg=2, col=GREY)
xf0.rbox(sh.a('vc'), so['x0'], so['x0'] + 0.22, 0.42, 0.9, sz0, sz1, r=0.06, seg=2, col=GREY)
for zz in (sz0, sz1 - 0.2): xf0.rbox(sh.a('vc'), so['x0'], so['x1'], 0.42, 0.62, zz, zz + 0.2, r=0.06, seg=2, col=GREY)
for k in range(2): xf0.rbox(sh.a('vc'), so['x0'] + 0.22, so['x1'] - 0.02, 0.42, 0.52, sz0 + 0.22 + k * (sz1 - sz0 - 0.44) / 2, sz0 + 0.22 + (k + 1) * (sz1 - sz0 - 0.44) / 2 - 0.02, r=0.05, seg=2, col=GREY2)
Xf(so['x0'] + 0.3, sz0 + 0.5, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.86, -0.07, 0.07, r=0.06, seg=2, col='#c9c0ae')
xf0.rbox(sh.a('vc'), so['x0'] + 0.05, so['x1'] - 0.05, 0.5, 0.85, sz1 - 0.45, sz1 - 0.3, r=0.03, seg=2, col='#d8cfc0')   # 搭在扶手上的毯子
K.round_table(sh, -5.3, 3.4, r=0.32, h=0.48, top_key='wood', base_col='#2e2e2e'); candle(-5.25, 3.35, 0.48); vase(-5.4, 3.45, 0.48)
fl = Xf(so['x0'] + 0.3, sz1 + 0.25); fl.lathe(sh.a('vcm'), [(0.0, 0.0), (0.14, 0.0), (0.14, 0.02), (0.02, 0.04), (0.012, 1.35), (0.0, 1.36)], 0, 0, 0, seg=12, col=BRASS)
fl.lathe(sh.a('shade'), [(0.12, 1.3), (0.22, 1.3), (0.16, 1.58), (0.1, 1.58)], 0, 0, 0, seg=16); CL.glow(sh.root, 'floorlamp', so['x0'] + 0.3, 1.45, sz1 + 0.25, color='rgba(255,205,140,1)', size=0.8, day=0.1, night=0.85)
Xf(*CF.UMBRELLA).lathe(sh.a('vcm'), [(0.0, 0.0), (0.11, 0.0), (0.11, 0.5), (0.1, 0.5), (0.1, 0.02), (0.0, 0.02)], 0, 0, 0, seg=12, col=WAL2)   # 傘桶（芷若的傘放這裡）
bp = [(p[0], p[1]) for p in CF.BIG_PLANTS]
pm = IT['plant_moved'][0]; bp = [tuple(pm['to']) if (abs(p[0] - pm['from'][0]) < 0.01 and abs(p[1] - pm['from'][1]) < 0.01) else p for p in bp]
PLANT_KIND = ['fig', 'snake', 'leafy']   # v1c（BB 遊戲內截圖 H：同一盆複製三次）：三個固定位置放三種不同的植物、三種花盆
for (x, z_), kind in zip(bp, PLANT_KIND): big_plant(x, z_, kind)
sh.tally('seating')

# ---------------------------------------------------------------- v1c 窗邊（BB 遊戲內截圖 G：參考圖的主視覺是窗邊的灰色單人沙發、桌燈、毛毯、小圓桌）
# 右牆兩扇側窗下面一條窗台桌（燈罩檯燈、小盆栽、書）；兩張灰色單人沙發斜對窗，旁邊小圓桌＋檯燈；北邊那張搭一條毛毯。位置照 cafe230_layout.js v3 的 lounge。
def armchair(x, z, yaw, col=GREY, blanket=False):
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.33, 0.3), (0.33, 0.3), (-0.33, -0.3), (0.33, -0.3)): xf.cyl(m, (sx, 0.0, sz), (sx * 0.97, 0.13, sz * 0.97), 0.022, col=WAL2, seg=5, caps=False)
    xf.rbox(m, -0.41, 0.41, 0.12, 0.42, -0.39, 0.39, r=0.04, seg=1, col=col)                                                 # 底座
    xf.rbox(m, -0.29, 0.29, 0.41, 0.53, -0.24, 0.4, r=0.05, seg=2, col=GREY2)                                              # 坐墊
    xf.rbox(m, -0.41, 0.41, 0.4, 0.95, -0.42, -0.22, r=0.06, seg=1, col=col)                                               # 靠背
    for sx in (-1, 1): xf.rbox(m, min(sx * 0.29, sx * 0.42), max(sx * 0.29, sx * 0.42), 0.4, 0.66, -0.4, 0.38, r=0.05, seg=1, col=col)   # 扶手
    Xf(*xf.p(0.14, 0, -0.27)[::2], yaw + 0.25).rbox(m, -0.18, 0.18, 0.52, 0.84, -0.06, 0.06, r=0.05, seg=2, col='#c9c0ae')     # 抱枕（靠在靠背上、偏一邊：座位中心那一點量得到坐墊高度）
    if blanket:                                                                                                            # 毛毯：搭在扶手上、垂到地上一點
        xf.rbox(m, 0.27, 0.45, 0.66, 0.69, -0.28, 0.2, r=0.01, seg=1, col='#d8cfc0'); xf.rbox(m, 0.43, 0.46, 0.18, 0.69, -0.26, 0.18, r=0.01, seg=1, col='#d8cfc0')
        for k in range(7): u = -0.24 + k * 0.065; xf.cyl(m, (0.455, 0.18, u), (0.46, 0.12, u + 0.01), 0.006, col='#cfc5b4', seg=3, caps=False)


LG = LAY['lounge']
for a_ in LG['chairs']: armchair(a_['x'], a_['z'], a_['yaw'], blanket=a_.get('blanket', False))
for t_ in LG['tables']:
    K.round_table(sh, t_['x'], t_['z'], r=0.26, h=0.56, top_key='wood', base_col='#2e2e2e')
    if t_.get('lamp'): shade_lamp(t_['x'] + 0.05, t_['z'] + 0.05, 0.56, s=0.95)
    else: mushroom(t_['x'], t_['z'], 0.56)
    candle(t_['x'] - 0.1, t_['z'] - 0.08, 0.56); K.mug(sh, t_['x'] + 0.12, t_['z'] - 0.1, 0.56, col='#f2efe8', r=0.035, h=0.08)
for cn in LG['consoles']:                                                                                                 # 窗台桌（窗下、靠右牆）
    c0, c1 = cn['z0'], cn['z1']; xf0.rbox(sh.a('wood'), X1 - 0.34, X1 - 0.02, 0.7, 0.74, c0, c1, r=0.008, seg=1)
    for zz in (c0 + 0.1, c1 - 0.1): xf0.rbox(sh.a('wood'), X1 - 0.3, X1 - 0.26, 0.0, 0.7, zz - 0.02, zz + 0.02, r=0.004, seg=1)
    shade_lamp(X1 - 0.18, c0 + 0.45, 0.74, s=1.05); sh.plant(X1 - 0.18, c1 - 0.4, h=RK.uniform(0.25, 0.35), r=0.075, pot_col=RK.choice(('#d8d0c0', '#b0653e')), y0=0.74)
    yy = 0.74
    for q in range(3): tt = 0.035; Xf(X1 - 0.18, (c0 + c1) / 2 + 0.1, 0.15 * q - 0.1, yy).rbox(sh.a('vcg'), -0.12, 0.12, 0.0, tt, -0.09, 0.09, r=0.003, seg=1, col=BOOKC[(q * 5 + 1) % len(BOOKC)]); yy += tt
    candle(X1 - 0.2, (c0 + c1) / 2 - 0.25, 0.74)
hz = 2.6; hy = H - 0.95; hx = X1 - 0.5                                                                                  # 窗邊的吊盆：三條繩掛在 z 2.6 那根管線上，黃金葛從盆口垂下來
Xf(hx, hz).lathe(sh.a('vcg'), [(0.0, hy - 0.16), (0.1, hy - 0.14), (0.13, hy - 0.02), (0.135, hy), (0.0, hy)], 0, 0, 0, seg=12, col='#e8e2d6')
for k in range(3): a = k * 2.1; xf0.cyl(sh.a('vc'), (hx + math.cos(a) * 0.12, hy, hz + math.sin(a) * 0.12), (hx, H - 0.58, hz), 0.004, col='#d8cfc0', seg=3, caps=False)
sh.hanging_pothos('pothos', hx, hy, hz, n=10, drop=1.1)
sh.tally('lounge')

# ---------------------------------------------------------------- v1b（LAWWW2 11-04 05:00）：四人桌下的舊地毯、牆上的框畫
fx, fz = CF.FOUR_TOP
if CC0: xf0.rbox(sh.a('c_rug'), fx - 1.5, fx + 1.5, 0.0, 0.011, fz - 1.3, fz + 1.3, r=0.0, seg=1)   # CC0：一張 Carpet015 地毯（原本三層頂點色）
else:
    xf0.rbox(sh.a('vc'), fx - 1.5, fx + 1.5, 0.0, 0.008, fz - 1.3, fz + 1.3, r=0.0, seg=1, col='#6a3a2c')
    xf0.rbox(sh.a('vc'), fx - 1.36, fx + 1.36, 0.008, 0.011, fz - 1.16, fz + 1.16, r=0.0, seg=1, col='#8a5a3a')
    xf0.rbox(sh.a('vc'), fx - 1.0, fx + 1.0, 0.011, 0.013, fz - 0.8, fz + 0.8, r=0.0, seg=1, col='#5a3a2a')
for side, along, cell in (('right', -0.5, (6, 0)), ('left', -3.2, (0, 1)), ('left', 3.0, (2, 1))):
    sh.wall_img(side, 'print', along, 1.85, 0.5, 0.5, K.cell_uv(cell[0], cell[1], 2, 2), off=0.03)
    wx = sh.wall_xf(side, along, 0.0, 1.85); wx.rbox(sh.w(side, 'wood'), -0.29, 0.29, -0.29, 0.29, 0.0, 0.025, r=0.0, seg=1)
sh.tally('v1b')
if CC0:   # 頂點色零件照顏色分到材質組（累積網格＋四面牆的組）；表上沒有的顏色（植物葉子、書背、蠟燭、燈泡…）照舊頂點色
    VCK = ('vc', 'vcm', 'vcg')
    mv = K0.split_vc([m for (k_, l_), m in list(sh._acc.items()) if k_ in VCK], VC_ROUTE, lambda vm, key: sh.a(key, vm.lvl))
    for side_ in list(sh.walls):
        mv2 = K0.split_vc([m for k_, m in list(sh.walls[side_].items()) if k_ in VCK], VC_ROUTE, lambda vm, key, sd=side_: sh.w(sd, key))
        for k_, n_ in mv2.items(): mv[k_] = mv.get(k_, 0) + n_
    print('CC0 split_vc', mv)
    K0.cleanup()
info = sh.finish(OUT, keep=lambda ob: 'ceiling' in ob.name, extra_info={'layout': LAY['version'], 'zone': 'cafe'})
