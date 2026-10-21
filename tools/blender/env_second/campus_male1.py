"""男一舍外觀（校園世界座標）→ assets/models/env/second_ai/campus_male1.glb。LAWWW2-C 2026-10-18（ART-EXT-M1；使用者 10-18 03:3x「四座全部改」）：
  /opt/blenv/bin/python tools/blender/env_second/campus_male1.py

**依文字資料的遊戲化設計，不是照片還原**（沙盒打不開住宿組網站，只有搜尋摘要；docs/art-rebuild/second_ai/test_shots/campus_male1/README.md）：
  查證過的：長興街 50 號、1980 年落成、2006 年翻修、地上 4 層＋地下 1 層、沒有電梯、約 970 床、四人房為主（住宿組男一舍頁）。
  → 10-18 照官方資料做 4 層（套件也一起改成 4 層）；**10-21 改回 5 層**：遊戲裡祐廷的房間是 507（存檔鍵 Y507_* 等五十幾處，房號不改），
    企劃組 AA-C 10-21 裁定 J1（企劃線 d0d7407e AA_345 第 7 節）外觀加到 5 層；宿舍窗景（dorm_back_view.py）本來就照五樓的高度算。
    遊戲化設計，和真實的男一舍（4 層）不同。
外觀是台灣 1980 年前後公立大學宿舍常見的樣子（和大一女舍 campus_freshman.py 刻意不同，不是同一個模型換顏色）：
  - 外牆：米灰色小口馬賽克磚（Poly Haven rounded_square_tiled_wall，真實比例約 4 cm 一塊）
  - 露明的混凝土框架：每 4 m 一根柱子、每層樓板一條水平帶，漆成灰白色（立面是一格一格的）
  - 正面中間的樓梯間：一整面鏤空花磚（本作程式產生的 m1_breeze.png，透空的地方看得到裡面的樓梯平台），一路往上凸出屋頂成為樓梯間出口，上面一個混凝土水塔
  - 正面寢室：鋁框推拉窗（上面一格固定窗）＋混凝土窗框；有的窗下有窗型冷氣；一樓的窗有鐵窗
  - 背面寢室：每間一個小陽台（混凝土欄杆、曬衣桿和衣服、冷氣室外機），陽台之間是垂直的遮陽板
  - 兩端：走廊盡頭的窗、浴室的小窗
  - 屋頂：女兒牆、太陽能熱水器、冷氣室外機、天線
  - 門口：平頂雨遮（套件的門廊位置、寬度：側牆 x=±2、厚 0.9、深 2.0、高 3.4）、鋁框玻璃門、名牌「男一舍」、刷卡機、公告欄
位置、佔地照 src/zones3d.js：CK.hall({w:36,d:14,…,arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}})＋ckPlace(dormB,20,68,π)：
本體、門廊側牆的位置和套件一樣 → 導航阻擋、門口互動點（回宿舍 (20,59.6)）不用改。正面＝本地 +z（世界 −z，朝校園道路）。
材質名稱沿用校園地標的約定（zones3d.js attachWenzhouModel）：ck_glass、ck_frame、ck_trim_win、ck_stone_base、ck_ceiling、wz_lamp_lens、ck_board。招牌：PLATE_FACE_*。
"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter   # noqa: E402

OUT = 'assets/models/env/second_ai/campus_male1.glb'
GEN = os.path.join(HERE, 'textures', 'gen')
W, D = 36.0, 14.0
YF = [0.0, 3.6, 6.7, 9.8, 12.9, 16.0]           # 一到五樓地板；YF[5]＝屋頂（和套件 CK.hall gfh 3.6、fh 3.1、floors 5 一樣高）
TOP = YF[5]; NF = 5
PAR = 1.0                                        # 女兒牆
PD, PH, PW2 = 2.0, 3.4, 2.0                      # 門廊：深、雨遮高、半寬（側牆中心 x=±2，牆厚 0.9；和大一女舍、套件一樣）
COLS = [-18.0 + 4.0 * i for i in range(10)]     # 柱子（開間 4 m，九開間）
BAYS = [-16.0 + 4.0 * i for i in range(9)]      # 開間中心；正中間（0）是樓梯間、門口
CW = 0.45                                        # 柱寬
SHR = 4.0                                        # 樓梯間凸出屋頂的高度（出入口＋上面的水塔底座）
BAL = 1.1                                        # 背面陽台深
PLACE = (20.0, 68.0, math.pi)
WALL, PAINT, BASE = '#d3cab8', '#e6e3db', '#8f8a82'


def tex_breeze(path):
    """鏤空花磚（台灣 1970～80 年代樓梯間、陽台常見）：20 cm 一塊，一張貼圖 4×4 塊＝0.8 m。每塊：外框＋中間一個圓環，圓環和外框之間四個透空的花瓣形洞。
    透空＝alpha 0（遊戲用 alpha clip）"""
    S = 1024; n = 4; b = S // n
    im = Image.new('RGBA', (S, S), (226, 222, 212, 255)); d = ImageDraw.Draw(im)
    mk = Image.new('L', (S, S), 255); md = ImageDraw.Draw(mk)
    for j in range(n):
        for i in range(n):
            x0, y0 = i * b, j * b; cx, cy = x0 + b / 2, y0 + b / 2; fr = b * 0.09
            md.rectangle([x0 + fr, y0 + fr, x0 + b - fr, y0 + b - fr], fill=0)           # 先整個挖空
            r1, r2 = b * 0.2, b * 0.28
            md.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=255); md.ellipse([cx - r1, cy - r1, cx + r1, cy + r1], fill=0)   # 圓環
            md.ellipse([cx - b * 0.07, cy - b * 0.07, cx + b * 0.07, cy + b * 0.07], fill=255)                                   # 中心
            for a in (0, math.pi / 2, math.pi, 1.5 * math.pi):                            # 四根連到外框的肋（花瓣之間）
                ca, sa = math.cos(a + math.pi / 4), math.sin(a + math.pi / 4)
                md.line([(cx + ca * r1 * 0.9, cy + sa * r1 * 0.9), (cx + ca * b * 0.62, cy + sa * b * 0.62)], fill=255, width=int(b * 0.075))
            md.line([(cx, cy - r1), (cx, cy + r1)], fill=255, width=int(b * 0.05)); md.line([(cx - r1, cy), (cx + r1, cy)], fill=255, width=int(b * 0.05))
    rnd = random.Random(5); px = im.load()
    for _ in range(9000):                                                                  # 水泥的斑駁
        x, y = rnd.randrange(S), rnd.randrange(S); g = rnd.randint(-14, 8); c = px[x, y]
        d.rectangle([x, y, x + 2, y + 2], fill=(c[0] + g, c[1] + g, c[2] + g - 2, 255))
    for j in range(n + 1):                                                                 # 塊與塊之間的灰縫（深一點）
        d.line([(0, j * b), (S, j * b)], fill=(190, 186, 176, 255), width=4); d.line([(j * b, 0), (j * b, S)], fill=(190, 186, 176, 255), width=4)
    im = im.filter(ImageFilter.GaussianBlur(0.7)); im.putalpha(mk.filter(ImageFilter.GaussianBlur(1.0)))
    im.resize((512, 512), Image.LANCZOS).save(path)


def alpha_mat(name, png, rough=0.9):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, png))
    Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], rnd.inputs[0]); Lk.new(rnd.outputs[0], bs.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False
    return m


def build():
    out = os.path.join(L.ROOT, OUT)
    os.makedirs(GEN, exist_ok=True); tex_breeze(os.path.join(GEN, 'm1_breeze.png'))
    B.reset(texres=512)
    root = B.group('campus_male1', props={'kind': 'campus_male1'})
    M = {
        'wall': L.pbr('m1_wall', 'rounded_square_tiled_wall', tile=1.0, target=WALL, sat=0.3, normal=0.6, maps=('diff', 'nor'), rough_value=0.8),
        'paint': L.pbr('m1_paint', 'painted_plaster_wall', tile=2.5, target=PAINT, sat=0.3, maps=('diff',), res=256, rough_value=0.9),   # 混凝土框架、窗框、雨遮、女兒牆壓頂、陽台
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target=BASE, maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'frame': L.flat('ck_frame', '#9a9d9f', rough=0.4, metal=0.35),
        'roof': L.flat('m1_roof', '#a5674c', rough=0.9),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'misc': L.vc_material('m1_misc', rough=0.55),
        'cloth': L.vc_material('m1_cloth', rough=0.85),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    M['trimw'] = M['paint']
    K.setup_glass(M['glass'])
    accs = {}; VC = ('glass', 'misc', 'cloth'); plates = []
    kit = K.Kit(M, accs, 'm1_', place=PLACE, vc=VC); rnd = random.Random(1980)
    Fc = K.faces4(W, D); FRONT, BACK, LEFT, RIGHT = Fc['front'], Fc['back'], Fc['left'], Fc['right']
    def lit(*k): return K.lit_hash(19, *k)

    def plate(name, fr, u0, u1, v0, v1, d, props):
        m = Mesh(name, M['board']); kit.face(m, [fr.p(u0, v0, d), fr.p(u1, v0, d), fr.p(u1, v1, d), fr.p(u0, v1, d)], fr.N); plates.append((m, props))

    def ac(fr, u, v):
        """窗型冷氣：米白機殼外凸 0.32＋散熱格＋托架"""
        kit.fbox('misc', fr, u - 0.31, u + 0.31, v, v + 0.42, -0.05, 0.32, skip=('in',), col='#e3dfd4')
        kit.fbox('misc', fr, u - 0.27, u + 0.27, v + 0.05, v + 0.37, 0.32, 0.325, skip=('in',), col='#8f8c85')
        kit.fbox('misc', fr, u - 0.25, u + 0.25, v - 0.06, v, -0.02, 0.3, skip=('in', 'top'), col='#6e6a63')

    def grille(fr, u, vb, ww, wh):
        """一樓的鐵窗：外框＋直條（外凸 0.12）"""
        r = ww / 2 + 0.05; c = '#4b4d4c'
        for (a, b, c0, c1) in ((u - r, u + r, vb - 0.03, vb), (u - r, u + r, vb + wh, vb + wh + 0.03), (u - r, u - r + 0.03, vb, vb + wh), (u + r - 0.03, u + r, vb, vb + wh)):
            kit.fbox('misc', fr, a, b, c0, c1, 0.1, 0.13, skip=('in',), col=c)
        n = max(3, int(ww / 0.12))
        for i in range(1, n):
            x = u - r + 2 * r * i / n; kit.fbox('misc', fr, x - 0.008, x + 0.008, vb, vb + wh, 0.11, 0.125, skip=('in', 'top', 'bottom'), col=c)
        kit.fbox('misc', fr, u - r, u + r, vb + wh * 0.5 - 0.01, vb + wh * 0.5 + 0.01, 0.11, 0.125, skip=('in',), col=c)

    def clothes(x0, x1, y, z, k):
        """曬衣桿上的衣服（頂點色的布片，往外稍微傾斜）；本地座標，桿子沿 x"""
        cols = ['#f2f0ea', '#3e4a5e', '#9fb7d6', '#d9d2b8', '#5b6b52', '#f5f5f5', '#2c2c30', '#b7c9a8', '#8a4b3c', '#c8ccd2']
        x = x0 + 0.1
        while x < x1 - 0.25:
            w_ = rnd.uniform(0.3, 0.55); h_ = rnd.uniform(0.45, 0.8); c_ = rnd.choice(cols)
            if x + w_ > x1 - 0.05: break
            if rnd.random() < 0.8:
                kit.cface('cloth', [(x, y - 0.02, z), (x + w_, y - 0.02, z), (x + w_, y - 0.02 - h_, z - 0.04), (x, y - 0.02 - h_, z - 0.04)], (0, 0, -1), c_)
                kit.cface('cloth', [(x, y - 0.02, z), (x + w_, y - 0.02, z), (x + w_, y - 0.02 - h_, z - 0.04), (x, y - 0.02 - h_, z - 0.04)][::-1], (0, 0, 1), c_)
            x += w_ + rnd.uniform(0.05, 0.2)

    # ================= 正面（+z） =================
    for fl in range(NF):
        v0, v1 = YF[fl], YF[fl + 1]; sill = v0 + (1.0 if fl == 0 else 0.95)
        hs = []
        for j, u in enumerate(BAYS):
            if abs(u) < 0.1: continue                                                       # 正中間：樓梯間（上面）／門廊（一樓）
            hs.append(kit.window(FRONT, u, sill, 2.0, 1.4, 0.1, lit(1, fl, j), dep=0.2, proud=0.05, mull=[0.0], transom=1.0))
            if fl == 0: grille(FRONT, u, sill, 2.0, 1.4)
            elif (fl * 3 + j) % 4 == 1: ac(FRONT, u + 0.55, sill - 0.62)
        kit.wall_strip(FRONT, -W / 2, -PW2 - (0.45 if fl == 0 else 0.0), v0, v1, [h for h in hs if h['u'] < 0])
        kit.wall_strip(FRONT, PW2 + (0.45 if fl == 0 else 0.0), W / 2, v0, v1, [h for h in hs if h['u'] > 0])
    # 樓梯間：鏤空花磚（d=0.06，在牆面和柱子正面之間）＋後面暗的樓梯間（d=−0.6）＋樓梯平台；兩側的牆厚（從牆面到裡面）
    v_lo, v_hi = PH + 0.32, TOP + SHR - 1.2
    bz = Mesh('m1_breeze', alpha_mat('m1_breeze', 'm1_breeze.png'))
    u0b, u1b = -PW2 + CW / 2, PW2 - CW / 2
    kit.face(bz, [FRONT.p(u0b, v_lo, 0.06), FRONT.p(u1b, v_lo, 0.06), FRONT.p(u1b, v_hi, 0.06), FRONT.p(u0b, v_hi, 0.06)], FRONT.N,
             uvs=[(u0b / 0.8, v_lo / 0.8), (u1b / 0.8, v_lo / 0.8), (u1b / 0.8, v_hi / 0.8), (u0b / 0.8, v_hi / 0.8)])
    kit.fbox('misc', FRONT, -PW2, PW2, PH, v_hi, -0.62, -0.6, skip=('out', 'top', 'bottom', 'l', 'r'), col='#57534c')       # 樓梯間裡面（暗；遊戲內第一版 #3d3b37 從花磚看進去像一片黑網）
    for s_ in (-1, 1): kit.fbox('paint', FRONT, s_ * PW2 - 0.01, s_ * PW2 + 0.01, PH, TOP, -0.6, 0.0, skip=('l',) if s_ < 0 else ('r',))   # 側牆的厚度
    for k in range(NF):                                                                      # 樓梯平台（樓層、半層交錯）
        for (yy, side) in ((YF[k] + 1.55, -1), (YF[k + 1] if k + 1 < NF else TOP, 1)):
            if yy < PH + 0.3 or yy > TOP + 0.01: continue
            a, b_ = (-PW2 + 0.01, 0.0) if side < 0 else (0.0, PW2 - 0.01)
            kit.fbox('misc', FRONT, a, b_, yy - 0.15, yy, -0.6, -0.08, skip=('in',), col='#6f6c66')
            kit.fbox('misc', FRONT, a, b_, yy, yy + 0.9, -0.3, -0.28, skip=('in',), col='#5e5b56')            # 平台的矮牆（暗一點：從花磚的洞看進去是樓梯間的陰影，不是一片白）
    # 露明的混凝土框架：柱子（外凸 0.12，到女兒牆頂）、每層的水平帶（外凸 0.09）
    for u in COLS:
        kit.fbox('paint', FRONT, u - CW / 2, u + CW / 2, 0.0 if abs(abs(u) - PW2) > 0.1 else PH, TOP + PAR + 0.08, 0.0, 0.12, skip=('in', 'bottom'))
    for k in range(1, NF):
        for (a, b_) in ((-W / 2 - 0.1, -PW2), (PW2, W / 2 + 0.1)):
            kit.fbox('paint', FRONT, a, b_, YF[k] - 0.15, YF[k] + 0.15, 0.0, 0.09, skip=('in',))
    for (a, b_) in ((-W / 2 - 0.1, -PW2), (PW2, W / 2 + 0.1)):
        kit.fbox('paint', FRONT, a, b_, TOP - 0.2, TOP + 0.1, 0.0, 0.09, skip=('in',))

    # ================= 背面（−z）：一樓窗＋鐵窗；二樓以上每間一個陽台 =================
    for fl in range(NF):
        v0, v1 = YF[fl], YF[fl + 1]; sill = v0 + (1.0 if fl == 0 else 0.95); hb = []
        for j, u in enumerate(BAYS):
            if abs(u) < 0.1:                                                                   # 正中間：交誼廳（一樓）／走廊盡頭的大窗
                hb.append(kit.window(BACK, u, sill - (0.3 if fl == 0 else 0.0), 2.6, 1.7 if fl == 0 else 1.4, 0.1, lit(2, fl), dep=0.2, proud=0.05, mull=[-0.65, 0.65]))
                continue
            if fl == 0:
                hb.append(kit.window(BACK, u, sill, 2.0, 1.4, 0.1, lit(3, fl, j), dep=0.2, proud=0.05, mull=[0.0], transom=1.0)); grille(BACK, u, sill, 2.0, 1.4)
            else:   # 陽台：落地的鋁門（偏一邊）＋窗
                hb.append(kit.window(BACK, u - 1.05, v0 + 0.02, 0.8, 2.15, 0.0, False, dep=0.15, door=True))
                kit.rect('frame', BACK, u - 1.05 - 0.4, u - 1.05 + 0.4, v0 + 0.02, v0 + 2.17, -0.14)
                kit.glass_face(BACK, [(u - 1.4, v0 + 0.9), (u - 0.7, v0 + 0.9), (u - 0.7, v0 + 2.05), (u - 1.4, v0 + 2.05)], -0.135, lit(4, fl, j), v0 + 0.02, v0 + 2.17)
                hb.append(kit.window(BACK, u + 0.6, sill, 1.6, 1.4, 0.0, lit(5, fl, j), dep=0.2, proud=0.0, mull=[0.0]))
        kit.wall_strip(BACK, -W / 2, W / 2, v0, v1, hb)
    z_b = -D / 2
    for fl in range(1, NF):
        y0 = YF[fl]
        for j, c in enumerate(BAYS):
            if abs(c) < 0.1: continue
            a, b_ = c - 2.0 + 0.1, c + 2.0 - 0.1
            kit.box('paint', a, b_, y0 - 0.15, y0, z_b - BAL, z_b, skip=('front', 'left', 'right'))                       # 陽台樓板
            kit.box('paint', a, b_, y0, y0 + 1.0, z_b - BAL, z_b - BAL + 0.12, skip=('bottom', 'left', 'right'))          # 欄杆（實心的矮牆）
            kit.box('paint', a, b_, y0 + 1.0, y0 + 1.06, z_b - BAL - 0.02, z_b - BAL + 0.14, skip=('left', 'right'))      # 欄杆壓頂
            kit.box('ceil', a, b_, YF[fl + 1] - 0.16 if fl + 1 < NF else TOP - 0.16, YF[fl + 1] - 0.15 if fl + 1 < NF else TOP - 0.15, z_b - BAL, z_b, skip=('top', 'front', 'back', 'left', 'right'))   # 上一層陽台的底（頂層：屋簷的底）
            yb = (YF[fl + 1] if fl + 1 < NF else TOP) - 0.45
            for zz in (z_b - 0.35, z_b - 0.75):                                                                         # 曬衣桿
                kit.box('misc', a + 0.05, b_ - 0.05, yb - 0.02, yb, zz - 0.012, zz + 0.012, col='#8a8d8c')
                if (fl + j) % 3 != 1: clothes(a + 0.1, b_ - 0.1, yb - 0.01, zz, j)
            if (fl * 2 + j) % 3 == 0:                                                                                     # 冷氣室外機
                kit.box('misc', b_ - 0.95, b_ - 0.15, y0, y0 + 0.6, z_b - 0.45, z_b - 0.1, skip=('bottom',), col='#d6d5cf')
                kit.box('misc', b_ - 0.85, b_ - 0.25, y0 + 0.08, y0 + 0.52, z_b - 0.455, z_b - 0.45, col='#5a5c5c')
    for u in COLS:                                                                                                            # 陽台之間的遮陽板（垂直的混凝土板）＋背面的柱子
        x = u
        kit.box('paint', x - 0.1, x + 0.1, YF[1] - 0.15, TOP + 0.1, z_b - BAL - 0.05, z_b, skip=('front', 'bottom'))
        kit.box('paint', x - CW / 2, x + CW / 2, 0.0, YF[1] - 0.15, z_b - 0.12, z_b, skip=('front', 'top'))
    for (a, b_) in ((-W / 2 - 0.1, -PW2 - 0.1), (PW2 + 0.1, W / 2 + 0.1)):
        kit.box('paint', a, b_, TOP - 0.2, TOP + 0.1, z_b - BAL - 0.05, z_b, skip=('front',))                                # 頂層陽台的屋簷
    kit.box('paint', -PW2 - 0.1, PW2 + 0.1, TOP - 0.2, TOP + 0.1, z_b - 0.09, z_b, skip=('front',))
    for k in range(1, NF): kit.box('paint', -PW2 + 0.1, PW2 - 0.1, YF[k] - 0.15, YF[k] + 0.15, z_b - 0.09, z_b, skip=('front', 'left', 'right'))

    # ================= 兩端：走廊盡頭的窗、浴室的小窗 =================
    for side, fr in ((-1, LEFT), (1, RIGHT)):
        for fl in range(NF):
            v0, v1 = YF[fl], YF[fl + 1]; hsd = []
            hsd.append(kit.window(fr, 0.0, v0 + 0.9, 1.2, 1.6, 0.1, lit(6, fl, side), dep=0.2, proud=0.05, mull=[0.0]))
            for uu in (-3.6, 3.6): hsd.append(kit.window(fr, uu, v0 + 1.85, 0.9, 0.55, 0.06, lit(7, fl, side, uu), dep=0.18, proud=0.04, mull=[]))
            if fl == 0: grille(fr, 0.0, v0 + 0.9, 1.2, 1.6)
            kit.wall_strip(fr, -D / 2, D / 2, v0, v1, hsd)
        for k in range(1, NF): kit.fbox('paint', fr, -D / 2 - 0.09, D / 2 + 0.09, YF[k] - 0.15, YF[k] + 0.15, 0.0, 0.09, skip=('in',))
        kit.fbox('paint', fr, -D / 2 - 0.09, D / 2 + 0.09, TOP - 0.2, TOP + 0.1, 0.0, 0.09, skip=('in',))
    # 一樓勒腳（花崗石 0.9 m）
    e = 0.06
    kit.box('base', -W / 2 - e, -PW2 - 0.45, 0, 0.9, D / 2 - 0.02, D / 2 + e, skip=('bottom', 'back')); kit.box('base', PW2 + 0.45, W / 2 + e, 0, 0.9, D / 2 - 0.02, D / 2 + e, skip=('bottom', 'back'))
    kit.box('base', -W / 2 - e, W / 2 + e, 0, 0.9, -D / 2 - e, -D / 2 + 0.02, skip=('bottom', 'front'))
    for s_ in (-1, 1): kit.box('base', s_ * W / 2 - (0.02 if s_ > 0 else e), s_ * W / 2 + (e if s_ > 0 else 0.02), 0, 0.9, -D / 2 + 0.02, D / 2 - 0.02, skip=('bottom', 'left' if s_ > 0 else 'right', 'front', 'back'))

    # ================= 屋頂：女兒牆、樓梯間出口＋水塔、太陽能熱水器、冷氣室外機、天線 =================
    for fr, segs in ((FRONT, ((-W / 2, -PW2), (PW2, W / 2))), (BACK, ((-W / 2, W / 2),)), (LEFT, ((-D / 2, D / 2),)), (RIGHT, ((-D / 2, D / 2),))):
        for (u0, u1) in segs: kit.wall_strip(fr, u0, u1, TOP, TOP + PAR, [])
    kit.face('wall', [(-W / 2 + 0.2, TOP, D / 2 - 0.2), (-PW2, TOP, D / 2 - 0.2), (-PW2, TOP + PAR, D / 2 - 0.2), (-W / 2 + 0.2, TOP + PAR, D / 2 - 0.2)], (0, 0, -1))
    kit.face('wall', [(PW2, TOP, D / 2 - 0.2), (W / 2 - 0.2, TOP, D / 2 - 0.2), (W / 2 - 0.2, TOP + PAR, D / 2 - 0.2), (PW2, TOP + PAR, D / 2 - 0.2)], (0, 0, -1))
    kit.face('wall', [(-W / 2 + 0.2, TOP, -D / 2 + 0.2), (W / 2 - 0.2, TOP, -D / 2 + 0.2), (W / 2 - 0.2, TOP + PAR, -D / 2 + 0.2), (-W / 2 + 0.2, TOP + PAR, -D / 2 + 0.2)], (0, 0, 1))
    for s_ in (-1, 1): kit.face('wall', [(s_ * (W / 2 - 0.2), TOP, -D / 2 + 0.2), (s_ * (W / 2 - 0.2), TOP, D / 2 - 0.2), (s_ * (W / 2 - 0.2), TOP + PAR, D / 2 - 0.2), (s_ * (W / 2 - 0.2), TOP + PAR, -D / 2 + 0.2)], (-s_, 0, 0))
    for (a, b_) in ((-W / 2 - 0.05, -PW2), (PW2, W / 2 + 0.05)):
        kit.box('paint', a, b_, TOP + PAR, TOP + PAR + 0.08, D / 2 - 0.25, D / 2 + 0.05, skip=('bottom',))
    kit.box('paint', -W / 2 - 0.05, W / 2 + 0.05, TOP + PAR, TOP + PAR + 0.08, -D / 2 - 0.05, -D / 2 + 0.25, skip=('bottom',))
    for s_ in (-1, 1): kit.box('paint', s_ * W / 2 - (0.25 if s_ > 0 else 0.05), s_ * W / 2 + (0.05 if s_ > 0 else 0.25), TOP + PAR, TOP + PAR + 0.08, -D / 2 + 0.25, D / 2 - 0.25, skip=('bottom', 'front', 'back'))
    kit.face('roof', [(-W / 2 + 0.2, TOP + 0.02, -D / 2 + 0.2), (W / 2 - 0.2, TOP + 0.02, -D / 2 + 0.2), (W / 2 - 0.2, TOP + 0.02, D / 2 - 0.2), (-W / 2 + 0.2, TOP + 0.02, D / 2 - 0.2)], (0, 1, 0))
    # 樓梯間出口（正面是花磚、凸出屋頂 SHR）：兩側、背面磚牆，平屋頂；上面的混凝土水塔（四根短柱上的方箱）
    zs0 = D / 2 - 4.6; yt = TOP + SHR
    for s_ in (-1, 1): kit.box('wall', s_ * PW2 - 0.01, s_ * PW2 + 0.01, TOP, yt, zs0, D / 2, skip=('bottom', 'top', 'front', 'back') + (('right',) if s_ < 0 else ('left',)))
    kit.face('wall', [(-PW2, TOP, zs0), (PW2, TOP, zs0), (PW2, yt, zs0), (-PW2, yt, zs0)], (0, 0, -1))
    kit.box('paint', -PW2 - 0.12, PW2 + 0.12, yt - 1.2, yt - 1.05, zs0 - 0.12, D / 2 + 0.12)                                  # 花磚上面的樓板
    kit.box('wall', -PW2, PW2, yt - 1.05, yt, D / 2 - 0.01, D / 2 + 0.0, skip=('back', 'left', 'right', 'bottom', 'top'))   # 花磚頂上的一段實牆（樓梯間屋頂的高度）
    kit.box('paint', -PW2 - 0.1, PW2 + 0.1, yt, yt + 0.12, zs0 - 0.1, D / 2 + 0.1)
    rf = K.Fr((0, 0, zs0), (-1, 0, 0), (0, 0, -1)); kit.rect('frame', rf, -0.45, 0.45, TOP + 0.05, TOP + 2.1, 0.01)            # 屋頂出入口的鐵門（背面）
    for (x, z) in ((-1.5, zs0 + 0.7), (1.5, zs0 + 0.7), (-1.5, D / 2 - 0.7), (1.5, D / 2 - 0.7)):
        kit.box('paint', x - 0.15, x + 0.15, yt + 0.12, yt + 0.62, z - 0.15, z + 0.15, skip=('bottom',))
    kit.box('paint', -1.8, 1.8, yt + 0.62, yt + 2.1, zs0 + 0.3, D / 2 - 0.3, skip=())                                      # 水塔
    kit.box('misc', -0.35, 0.35, yt + 2.1, yt + 2.3, zs0 + 1.0, zs0 + 1.7, skip=('bottom',), col='#6d6f6e')                # 水塔的人孔蓋
    m = 'misc'; yr = TOP + 0.02
    for i in range(8):                                                                                                      # 太陽能熱水器（朝南＝本地 −z）
        x = -15.0 + i * 1.4
        if abs(x) < 3.0: continue
        z0_, z1_ = -D / 2 + 0.8, -D / 2 + 2.4
        kit.cface(m, [(x - 0.62, yr + 0.5, z0_), (x + 0.62, yr + 0.5, z0_), (x + 0.62, yr + 1.4, z1_), (x - 0.62, yr + 1.4, z1_)], (0, 1, -1), '#2b3442')
        kit.box(m, x - 0.64, x + 0.64, yr + 1.3, yr + 1.75, z1_ - 0.05, z1_ + 0.35, col='#c7c9c9')
        for xx in (x - 0.5, x + 0.5): kit.box(m, xx - 0.03, xx + 0.03, yr, yr + 1.4, z1_ - 0.03, z1_ + 0.03, skip=('bottom',), col='#6b6d6c')
    for (x, z) in ((6.5, 2.0), (7.6, 2.0), (12.0, 1.6), (-9.0, 2.2), (-10.1, 2.2), (14.5, -1.5)):
        kit.box(m, x - 0.4, x + 0.4, yr, yr + 0.62, z - 0.15, z + 0.15, skip=('bottom',), col='#d8d7d1')
    kit.box(m, 15.4, 15.46, yr, yr + 3.2, -3.0, -2.94, skip=('bottom',), col='#7b7d7c')                                    # 天線桿
    for h_ in (2.4, 2.8, 3.1): kit.box(m, 14.9, 15.95, yr + h_, yr + h_ + 0.03, -2.985, -2.955, col='#7b7d7c')

    # ================= 門口：平頂雨遮、玻璃門、名牌、刷卡機、公告欄 =================
    z0, z1 = D / 2, D / 2 + PD
    for s_ in (-1, 1):
        kit.box('wall', s_ * PW2 - 0.45, s_ * PW2 + 0.45, 0.0, PH, z0, z1, skip=('bottom', 'top', 'back'))
        kit.box('base', s_ * PW2 - 0.49, s_ * PW2 + 0.49, 0.0, 0.6, z0, z1 + 0.04, skip=('bottom', 'back'))
    kit.box('paint', -PW2 - 0.65, PW2 + 0.65, PH, PH + 0.3, z0 - 0.1, z1 + 0.25, skip=())
    kit.face('ceil', [(-PW2 + 0.45, PH - 0.001, z0), (PW2 - 0.45, PH - 0.001, z0), (PW2 - 0.45, PH - 0.001, z1), (-PW2 + 0.45, PH - 0.001, z1)], (0, -1, 0))
    kit.box('base', -PW2 + 0.45, PW2 - 0.45, 0.0, 0.1, z0, z1 + 0.6, skip=('bottom',))
    DOORF = K.Fr((0, 0, z0), (1, 0, 0), (0, 0, 1))
    dh = kit.window(DOORF, 0.0, 0.1, 2.0, 2.5, 0.0, False, dep=0.12, door=True)
    kit.wall_strip(DOORF, -PW2 + 0.45, PW2 - 0.45, 0.0, PH, [dh])
    fm = kit.acc('frame')
    for (ua, ub, va, vb_) in ((-1.0, -0.95, 0.1, 2.6), (0.95, 1.0, 0.1, 2.6), (-0.025, 0.025, 0.1, 2.15), (-1.0, 1.0, 2.1, 2.16), (-1.0, 1.0, 2.55, 2.6), (-0.95, -0.025, 0.1, 0.2), (0.025, 0.95, 0.1, 0.2)):
        kit.rect(fm, DOORF, ua, ub, va, vb_, -0.1)
    for (ua, ub) in ((-0.95, -0.025), (0.025, 0.95)): kit.glass_face(DOORF, [(ua, 0.2), (ub, 0.2), (ub, 2.1), (ua, 2.1)], -0.105, True, 0.1, 2.6)
    kit.glass_face(DOORF, [(-0.95, 2.16), (0.95, 2.16), (0.95, 2.55), (-0.95, 2.55)], -0.105, True, 0.1, 2.6)
    for x in (-0.12, 0.12): kit.box('misc', x - 0.015, x + 0.015, 0.9, 1.3, z0 - 0.1, z0 - 0.05, col='#c9c6bf')
    lens, zc = kit.acc('lamp'), (z0 + z1) / 2
    kit.box(fm, -0.3, 0.3, PH - 0.025, PH - 0.001, zc - 0.3, zc + 0.3, skip=('top',))
    kit.box(lens, -0.27, 0.27, PH - 0.115, PH - 0.025, zc - 0.27, zc + 0.27, skip=('top',))
    SIGNF = K.Fr((0, 0, z1 + 0.25), (1, 0, 0), (0, 0, 1))
    plate('PLATE_FACE_M1', SIGNF, -1.6, 1.6, PH + 0.04, PH + 0.26, 0.006, {'text': '男一舍', 'bg': '#e8e5de', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.78})
    RF_ = K.Fr((PW2 - 0.45, 0, (z0 + z1) / 2), (0, 0, -1), (-1, 0, 0))     # 門廊右側牆的內面（朝 −x）：刷卡機
    kit.fbox('misc', RF_, -0.08, 0.08, 1.1, 1.38, 0.0, 0.05, skip=('in',), col='#2e3134')
    kit.fbox('misc', RF_, -0.05, 0.05, 1.27, 1.33, 0.05, 0.052, skip=('in',), col='#4fb36a')
    LF_ = K.Fr((-PW2 + 0.45, 0, (z0 + z1) / 2), (0, 0, 1), (1, 0, 0))      # 左側牆的內面（朝 +x）：住宿公告
    kit.fbox('misc', LF_, -0.55, 0.55, 1.0, 1.9, 0.0, 0.04, skip=('in',), col='#5b4331')
    for (du, dv, c) in ((-0.3, 0.18, '#f2efe6'), (0.08, 0.22, '#f6e7b8'), (0.34, 0.1, '#e8eef2'), (-0.18, -0.24, '#f3d9cf'), (0.22, -0.2, '#f2efe6')):
        kit.fbox('misc', LF_, du - 0.14, du + 0.14, 1.45 + dv - 0.17, 1.45 + dv + 0.17, 0.04, 0.045, skip=('in',), col=c)
    # 正面門口左邊：信箱（一排一排的鐵信箱）
    for i in range(4):
        for j in range(4):
            kit.fbox('misc', FRONT, -PW2 - 2.2 + i * 0.42, -PW2 - 1.82 + i * 0.42, 1.1 + j * 0.3, 1.36 + j * 0.3, 0.0, 0.18, skip=('in',), col='#b4b8b6')

    # ================= 完成 =================
    K.finish(accs, root, VC)
    bz.finish(root, uv=False)
    for (m_, props) in plates: uv01(m_.finish(root, uv=True, props=props))
    VCM = L.vc_material('wz_vc_m1', rough=0.6)
    L.vc_consolidate(root, {n: VCM for n in ('m1_misc', 'm1_cloth', 'ck_ceiling', 'ck_frame', 'm1_roof')})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    info['note'] = '依文字資料的遊戲化設計（沒有照片）；地上 5 層（AA-C 10-21 裁定 J1：房號 507；真實的男一舍是 4 層）；本體、門廊位置照 CK.hall，導航不用改'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
