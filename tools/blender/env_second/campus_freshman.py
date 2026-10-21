"""大一女舍 A、B 兩棟外觀＋二樓天橋＋門口（校園世界座標）→ assets/models/env/second_ai/campus_freshman.glb。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_freshman.py

**依文字資料的遊戲化設計，不是照真實建築還原**：沒有照片（沙盒打不開臺大住宿組網站）。查證過的只有（住宿組大一女舍頁、暑期營隊租用宿舍簡介的搜尋摘要；
docs/art-rebuild/second_ai/research/四棟教學館與宿舍_參考資料.md 第 4 節）：A、B 兩棟、地上 5 層（B 棟另有地下 1 層）、沒有電梯、二樓天橋連通、
A 棟一樓入口有服務台／24 小時傳達室、1991 年落成、2008 年整修、四人房；在舟山路一帶（臺大訪客中心地圖）。
外觀（面磚顏色、窗型、樓梯間、屋頂設備、曬衣）是台灣 1990 年代大學宿舍常見的樣子，**不是**照片還原：
  - 米色二丁掛面磚（Poly Haven exterior_wall_cladding_02 降低彩度）、一樓深色花崗石勒腳、每層樓板的位置一條灰白的混凝土線
  - 寢室：鋁框推拉窗（上面一格固定窗）、部分窗下有窗型冷氣；一樓的窗有鐵窗
  - 正面中間是樓梯間（沒有電梯）：白色粉刷的直條、每個樓梯平台一扇窗，往上凸出屋頂（樓梯間出屋頂）；兩側是浴室、洗衣間的小窗
  - 門口：平頂雨遮（套件的門廊位置、寬度）、鋁框玻璃門、名牌「大一女舍 A／B」、「男賓止步」；A 棟有傳達室的小窗與名牌，B 棟門邊有刷卡機
  - 屋頂：女兒牆、不鏽鋼水塔、太陽能熱水器、冷氣室外機；背面（南）寢室窗外的曬衣架與衣服
  - 二樓天橋：A 棟東牆（x=−96）到 B 棟西牆（x=−90）、z 65.4..68.6；面磚矮牆＋帶狀鋁窗＋平屋頂，下面可以走（離地 3.3 m）
位置、佔地照 src/zones3d.js 的 CK.hall({w:24,d:12,floors:5,gfh:3.6,fh:3.1,…,arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}})＋
ckPlace(fdA,-108,68,π)、ckPlace(fdB,-78,66,π)：本體、門廊側牆的位置和套件一樣 → 導航阻擋、門口互動點不用改。
材質名稱沿用校園地標的約定（zones3d.js attachWenzhouModel）：ck_glass、ck_frame、ck_trim_win、ck_stone_base、ck_ceiling、wz_lamp_lens。招牌：PLATE_FACE_*。
"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

OUT = 'assets/models/env/second_ai/campus_freshman.glb'
W, D = 24.0, 12.0
YF = [0.0, 3.6, 6.7, 9.8, 12.9, 16.0]          # 一到五樓地板；YF[5]＝屋頂
BW = 4.0                                        # 套件：6 開間
PD, PH, PW2 = 2.0, 3.4, 2.0                     # 門廊：深、雨遮高、半寬（側牆中心 x=±2，牆厚 0.9）
SC = 1.6                                        # 樓梯間半寬（正面中間的直條）
BUILDINGS = [dict(key='A', place=(-108.0, 68.0, math.pi), bridge=-1, office=True),    # A 棟：傳達室；天橋在本地 −x（世界的東邊）
             dict(key='B', place=(-78.0, 66.0, math.pi), bridge=1, office=False)]     # B 棟：刷卡機；天橋在本地 +x（世界的西邊）
BR = dict(x0=-96.0, x1=-90.0, z0=65.4, z1=68.6, y0=3.25, yf=3.65)                    # 天橋（世界座標）
WALL, WALL1, PAINT = '#dcd0bb', '#9a948a', '#ebe7df'   # 第二版：遊戲裡比 Cycles 暗，面磚調亮；粉刷改平整的漆面（plaster_grey_04 的污漬在遊戲裡像髒的混凝土）


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('campus_freshman', props={'kind': 'campus_freshman'})
    M = {
        'wall': L.pbr('fd_wall', 'exterior_wall_cladding_02', tile=2.0, target=WALL, sat=0.25, normal=0.7, maps=('diff', 'nor'), rough_value=0.88),
        'paint': L.pbr('fd_paint', 'painted_plaster_wall', tile=2.5, target=PAINT, sat=0.3, maps=('diff',), res=256, rough_value=0.9),     # 樓梯間、樓板線、雨遮、女兒牆壓頂（平整的漆面）
        'trimw': None,   # v9.7 合併材質：窗台、窗洞內側直接用 paint（原本是同一張貼圖、顏色稍暗的另一個材質 ck_trim_win）
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target=WALL1, maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'frame': L.flat('ck_frame', '#9a9d9f', rough=0.4, metal=0.35),            # 銀色鋁框
        'roof': L.flat('fd_roof', '#a5674c', rough=0.9),    # 屋頂隔熱磚（v9.7 合併材質：改純色，併進 wz_vc_fd；從地面看不到屋頂）
        'glass': L.vc_material('ck_glass', rough=0.12),
        'misc': L.vc_material('fd_misc', rough=0.55),                             # 冷氣、水塔、太陽能板、鐵窗、刷卡機、信箱…（頂點色）
        'cloth': L.vc_material('fd_cloth', rough=0.85),                           # 曬的衣服（頂點色）
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    M['trimw'] = M['paint']
    K.setup_glass(M['glass'])
    accs = {}
    VC = ('glass', 'misc', 'cloth')
    plates = []

    def plate(kit, name, fr, u0, u1, v0, v1, d, props):
        m = Mesh(name, M['board']); kit.face(m, [fr.p(u0, v0, d), fr.p(u1, v0, d), fr.p(u1, v1, d), fr.p(u0, v1, d)], fr.N); plates.append((m, props))

    for bd in BUILDINGS:
        kit = K.Kit(M, accs, 'fd_', place=bd['place'], vc=VC); rnd = random.Random(7 if bd['key'] == 'A' else 11)
        Fc = K.faces4(W, D); FRONT, BACK, LEFT, RIGHT = Fc['front'], Fc['back'], Fc['left'], Fc['right']
        def lit(*k): return K.lit_hash(ord(bd['key']), *k)

        def ac(fr, u, v, d0=0.0):
            """窗型冷氣：牆上的開口（0.62×0.42）＋米白機殼（外凸 0.32）＋側面的散熱格（深色）"""
            kit.fbox('misc', fr, u - 0.31, u + 0.31, v, v + 0.42, d0 - 0.05, d0 + 0.32, skip=('in',), col='#e3dfd4')
            kit.fbox('misc', fr, u - 0.27, u + 0.27, v + 0.05, v + 0.37, d0 + 0.32, d0 + 0.325, skip=('in',), col='#8f8c85')
            kit.fbox('misc', fr, u - 0.25, u + 0.25, v - 0.06, v, d0 - 0.02, d0 + 0.3, skip=('in', 'top'), col='#6e6a63')   # 托架

        def grille(fr, u, vb, ww, wh):
            """鐵窗（一樓）：外框＋直條，外凸 0.12"""
            r = ww / 2 + 0.05; c = '#4b4d4c'; m = 'misc'
            for (a, b, c0, c1) in ((u - r, u + r, vb - 0.03, vb), (u - r, u + r, vb + wh, vb + wh + 0.03), (u - r, u - r + 0.03, vb, vb + wh), (u + r - 0.03, u + r, vb, vb + wh)):
                kit.fbox(m, fr, a, b, c0, c1, 0.1, 0.13, skip=('in',), col=c)
            n = max(3, int(ww / 0.12))
            for i in range(1, n):
                x = u - r + 2 * r * i / n; kit.fbox(m, fr, x - 0.008, x + 0.008, vb, vb + wh, 0.11, 0.125, skip=('in', 'top', 'bottom'), col=c)
            kit.fbox(m, fr, u - r, u + r, vb + wh * 0.5 - 0.01, vb + wh * 0.5 + 0.01, 0.11, 0.125, skip=('in',), col=c)

        def hood(fr, u, vb, ww, wh):
            """窗上的混凝土遮陽板（外挑 0.32 m、厚 0.08）：立面上多一條影子"""
            kit.fbox('paint', fr, u - ww / 2 - 0.25, u + ww / 2 + 0.25, vb + wh + 0.12, vb + wh + 0.2, 0.0, 0.32, skip=('in',))

        def laundry(fr, u, vb, ww):
            """曬衣架（從窗外伸出來的兩支鐵架＋兩根曬衣桿）＋衣服（頂點色的布片，稍微傾斜）"""
            r = ww / 2; y = vb + 1.55; c = '#777a78'
            for s_ in (-1, 1): kit.fbox('misc', fr, u + s_ * r - 0.02, u + s_ * r + 0.02, y - 0.03, y, 0.0, 0.62, skip=('in',), col=c)
            for d_ in (0.3, 0.58): kit.fbox('misc', fr, u - r, u + r, y - 0.02, y, d_ - 0.012, d_ + 0.012, col=c)
            cols = ['#f2f0ea', '#9fb7d6', '#e8c7cf', '#3e4a5e', '#d9d2b8', '#b7c9a8', '#f5f5f5', '#c46f6a']
            x = u - r + 0.12
            while x < u + r - 0.2:
                w_ = rnd.uniform(0.28, 0.5); h_ = rnd.uniform(0.45, 0.75); d_ = 0.3 if rnd.random() < 0.5 else 0.58; c_ = rnd.choice(cols)
                if x + w_ > u + r - 0.05: break
                pts = [fr.p(x, y - 0.02, d_), fr.p(x + w_, y - 0.02, d_), fr.p(x + w_, y - 0.02 - h_, d_ + 0.04), fr.p(x, y - 0.02 - h_, d_ + 0.04)]
                kit.cface('cloth', pts, fr.N, c_); x += w_ + rnd.uniform(0.05, 0.16)

        # ---------------- 外牆＋窗 ----------------
        room_us = [-10.0, -6.0, 6.0, 10.0]        # 寢室（正面、背面）
        for fl in range(5):
            v0, v1 = YF[fl], YF[fl + 1]; sill = v0 + (1.0 if fl == 0 else 0.9)
            # 正面：寢室窗、樓梯間兩側的小窗（浴室、洗衣間）；一樓中間是門廊（另外做）
            hs = []
            for j, u in enumerate(room_us):
                hs.append(kit.window(FRONT, u, sill, 2.2, 1.5, 0.0, lit(1, fl, j), dep=0.2, mull=[0.0], transom=1.12)); hood(FRONT, u, sill, 2.2, 1.5)
                if fl == 0: grille(FRONT, u, sill, 2.2, 1.5)
                elif (fl * 3 + j) % 4 == 1: ac(FRONT, u + 0.7, sill - 0.62)
            if fl > 0:
                for s_ in (-1, 1):
                    hs.append(kit.window(FRONT, s_ * 2.8, v0 + 1.5, 0.8, 0.9, 0.0, lit(2, fl, s_), dep=0.18, mull=[]))
            if fl == 0:
                kit.wall_strip(FRONT, -W / 2, -PW2 - 0.45, v0, v1, [h for h in hs if h['u'] < 0]); kit.wall_strip(FRONT, PW2 + 0.45, W / 2, v0, v1, [h for h in hs if h['u'] > 0])
            else:
                kit.wall_strip(FRONT, -W / 2, -SC, v0, v1, [h for h in hs if h['u'] < 0]); kit.wall_strip(FRONT, SC, W / 2, v0, v1, [h for h in hs if h['u'] > 0])
            # 背面：寢室窗（曬衣架）、中間走廊盡頭的窗
            hb = []
            for j, u in enumerate(room_us):
                hb.append(kit.window(BACK, u, sill, 2.2, 1.5, 0.0, lit(3, fl, j), dep=0.2, mull=[0.0], transom=1.12)); hood(BACK, u, sill, 2.2, 1.5)
                if fl == 0: grille(BACK, u, sill, 2.2, 1.5)
                elif (fl + j) % 3 != 0: laundry(BACK, u, sill, 2.2)
                if fl > 0 and (fl * 5 + j) % 4 == 0: ac(BACK, u - 0.7, sill - 0.62)
            for u in (-2.0, 2.0): hb.append(kit.window(BACK, u, sill, 1.2, 1.5, 0.0, lit(4, fl, u), dep=0.2, mull=[0.0], transom=1.12))
            kit.wall_strip(BACK, -W / 2, W / 2, v0, v1, hb)
            # 兩端：每層三扇（中間那扇在天橋那一面的二樓換成天橋的門）
            for side, fr in ((-1, LEFT), (1, RIGHT)):
                hsd = []
                for j, z in enumerate((-4.0, 0.0, 4.0)):
                    u = z if side < 0 else -z
                    if fl == 1 and j == 1 and side == bd['bridge']:   # 天橋的門：天橋中心在本地 z=+1（A）／−1（B）→ 兩棟的立面座標都是 u=1.0
                        hsd.append(kit.window(fr, 1.0, v0 + 0.05, 1.6, 2.4, 0.0, False, dep=0.2, door=True))
                        kit.rect('frame', fr, 1.0 - 0.8, 1.0 + 0.8, v0 + 0.05, v0 + 2.45, -0.19)             # 關著的鋁門（從天橋的窗看得到）
                        continue
                    hsd.append(kit.window(fr, u, sill, 1.4, 1.5, 0.0, lit(5, fl, j, side), dep=0.2, mull=[0.0], transom=1.12))
                    if fl == 0: grille(fr, u, sill, 1.4, 1.5)
                kit.wall_strip(fr, -D / 2, D / 2, v0, v1, hsd)
        # 樓梯間（正面中間的白色直條，往外凸 0.15；每個樓梯平台一扇窗；出屋頂）
        STF = K.Fr((0, 0, D / 2 + 0.15), (1, 0, 0), (0, 0, 1))
        st_holes = [kit.window(STF, 0.0, YF[k] + 1.55 + 0.35, 1.0, 1.4, 0.0, lit(6, k), dep=0.25, mull=[0.0]) for k in range(1, 5)]
        # 上下疊的窗：wall_strip 只處理左右排的開口 → 一扇窗一段（分界在兩扇窗中間）。第一版整條一起挖，開口互相蓋住、重疊的面閃成一條黑縫
        bnds = [PH + 0.3] + [(st_holes[k]['vt'] + st_holes[k + 1]['vb']) / 2 for k in range(len(st_holes) - 1)] + [YF[5] + 2.6]
        for k, h in enumerate(st_holes): kit.wall_strip(STF, -SC, SC, bnds[k], bnds[k + 1], [h], mk='paint')
        for s_ in (-1, 1): kit.face('paint', [(s_ * SC, PH + 0.3, D / 2), (s_ * SC, PH + 0.3, D / 2 + 0.15), (s_ * SC, YF[5] + 2.6, D / 2 + 0.15), (s_ * SC, YF[5] + 2.6, D / 2)], (s_, 0, 0))
        # 屋頂上的樓梯間（出入口）：從正面的直條往後 4 m
        kit.box('paint', -SC, SC, YF[5], YF[5] + 2.6, D / 2 - 4.0, D / 2 + 0.15, skip=('bottom', 'front'))
        kit.box('paint', -SC - 0.1, SC + 0.1, YF[5] + 2.6, YF[5] + 2.75, D / 2 - 4.1, D / 2 + 0.25, skip=())
        rf = K.Fr((0, 0, D / 2 - 4.0), (-1, 0, 0), (0, 0, -1))
        kit.rect('frame', rf, -0.45, 0.45, YF[5] + 0.05, YF[5] + 2.1, 0.01)    # 屋頂出入口的鐵門
        # 樓板線（灰白混凝土，外凸 4 cm）＋一樓勒腳（花崗石 1.0 m）＋女兒牆＋壓頂
        for fl in range(1, 5):
            y = YF[fl]
            kit.box('paint', -W / 2 - 0.04, W / 2 + 0.04, y - 0.12, y + 0.08, D / 2 - 0.02, D / 2 + 0.04, skip=('back',))
            kit.box('paint', -W / 2 - 0.04, W / 2 + 0.04, y - 0.12, y + 0.08, -D / 2 - 0.04, -D / 2 + 0.02, skip=('front',))
            for s_ in (-1, 1): kit.box('paint', s_ * W / 2 - (0.02 if s_ > 0 else 0.04), s_ * W / 2 + (0.04 if s_ > 0 else 0.02), y - 0.12, y + 0.08, -D / 2 + 0.02, D / 2 - 0.02, skip=('left' if s_ > 0 else 'right', 'front', 'back'))
        e = 0.06
        kit.box('base', -W / 2 - e, -PW2 - 0.45, 0, 1.0, D / 2 - 0.02, D / 2 + e, skip=('bottom', 'back')); kit.box('base', PW2 + 0.45, W / 2 + e, 0, 1.0, D / 2 - 0.02, D / 2 + e, skip=('bottom', 'back'))
        kit.box('base', -W / 2 - e, W / 2 + e, 0, 1.0, -D / 2 - e, -D / 2 + 0.02, skip=('bottom', 'front'))
        for s_ in (-1, 1): kit.box('base', s_ * W / 2 - (0.02 if s_ > 0 else e), s_ * W / 2 + (e if s_ > 0 else 0.02), 0, 1.0, -D / 2 + 0.02, D / 2 - 0.02, skip=('bottom', 'left' if s_ > 0 else 'right', 'front', 'back'))
        PAR = 1.0
        for fr, (u0, u1) in ((FRONT, (-W / 2, W / 2)), (BACK, (-W / 2, W / 2)), (LEFT, (-D / 2, D / 2)), (RIGHT, (-D / 2, D / 2))):
            kit.wall_strip(fr, u0, u1, YF[5], YF[5] + PAR, [])
        kit.face('wall', [(-W / 2 + 0.2, YF[5], D / 2 - 0.2), (W / 2 - 0.2, YF[5], D / 2 - 0.2), (W / 2 - 0.2, YF[5] + PAR, D / 2 - 0.2), (-W / 2 + 0.2, YF[5] + PAR, D / 2 - 0.2)], (0, 0, -1))
        kit.face('wall', [(-W / 2 + 0.2, YF[5], -D / 2 + 0.2), (W / 2 - 0.2, YF[5], -D / 2 + 0.2), (W / 2 - 0.2, YF[5] + PAR, -D / 2 + 0.2), (-W / 2 + 0.2, YF[5] + PAR, -D / 2 + 0.2)], (0, 0, 1))
        for s_ in (-1, 1): kit.face('wall', [(s_ * (W / 2 - 0.2), YF[5], -D / 2 + 0.2), (s_ * (W / 2 - 0.2), YF[5], D / 2 - 0.2), (s_ * (W / 2 - 0.2), YF[5] + PAR, D / 2 - 0.2), (s_ * (W / 2 - 0.2), YF[5] + PAR, -D / 2 + 0.2)], (-s_, 0, 0))
        kit.box('paint', -W / 2 - 0.05, W / 2 + 0.05, YF[5] + PAR, YF[5] + PAR + 0.08, D / 2 - 0.25, D / 2 + 0.05, skip=('bottom',))
        kit.box('paint', -W / 2 - 0.05, W / 2 + 0.05, YF[5] + PAR, YF[5] + PAR + 0.08, -D / 2 - 0.05, -D / 2 + 0.25, skip=('bottom',))
        for s_ in (-1, 1): kit.box('paint', s_ * W / 2 - (0.25 if s_ > 0 else 0.05), s_ * W / 2 + (0.05 if s_ > 0 else 0.25), YF[5] + PAR, YF[5] + PAR + 0.08, -D / 2 + 0.25, D / 2 - 0.25, skip=('bottom', 'front', 'back'))
        kit.face('roof', [(-W / 2 + 0.2, YF[5] + 0.02, -D / 2 + 0.2), (W / 2 - 0.2, YF[5] + 0.02, -D / 2 + 0.2), (W / 2 - 0.2, YF[5] + 0.02, D / 2 - 0.2), (-W / 2 + 0.2, YF[5] + 0.02, D / 2 - 0.2)], (0, 1, 0))
        # 屋頂設備：不鏽鋼水塔兩個（鋼架上）、太陽能熱水器一排、冷氣室外機
        m = 'misc'; yr = YF[5] + 0.02
        for x in (-7.5, -5.4):
            kit.box(m, x - 0.9, x + 0.9, yr, yr + 0.8, -2.9, -1.1, skip=('bottom',), col='#5f6160')
            n = 12; cz = -2.0; rr = 0.8
            for q in range(n):
                a0, a1 = 2 * math.pi * q / n, 2 * math.pi * (q + 1) / n; am = (a0 + a1) / 2
                kit.cface(m, [(x + rr * math.cos(a0), yr + 0.8, cz + rr * math.sin(a0)), (x + rr * math.cos(a1), yr + 0.8, cz + rr * math.sin(a1)), (x + rr * math.cos(a1), yr + 2.4, cz + rr * math.sin(a1)), (x + rr * math.cos(a0), yr + 2.4, cz + rr * math.sin(a0))], (math.cos(am), 0, math.sin(am)), '#c9ccce')
            kit.cface(m, [(x + rr * math.cos(2 * math.pi * q / n), yr + 2.4, cz + rr * math.sin(2 * math.pi * q / n)) for q in range(n)], (0, 1, 0), '#b9bcbe')
        for i in range(6):
            x = 3.0 + i * 1.3; z0, z1 = -4.6, -2.8
            kit.cface(m, [(x - 0.6, yr + 0.5, z0), (x + 0.6, yr + 0.5, z0), (x + 0.6, yr + 1.4, z1), (x - 0.6, yr + 1.4, z1)], (0, 1, -1), '#2b3442')   # 集熱板（朝南）
            kit.box(m, x - 0.62, x + 0.62, yr + 1.3, yr + 1.75, z1 - 0.05, z1 + 0.35, col='#c7c9c9')                                                    # 水箱
            for xx in (x - 0.5, x + 0.5): kit.box(m, xx - 0.03, xx + 0.03, yr, yr + 1.4, z1 - 0.03, z1 + 0.03, skip=('bottom',), col='#6b6d6c')
        for (x, z) in ((-9.8, 3.2), (-8.6, 3.2), (8.6, 3.0)):
            kit.box(m, x - 0.4, x + 0.4, yr, yr + 0.62, z - 0.15, z + 0.15, skip=('bottom',), col='#d8d7d1')
        # ---------------- 門口：平頂雨遮（套件的門廊：側牆 x=±2、厚 0.9、深 2.0）、玻璃門、名牌 ----------------
        z0, z1 = D / 2, D / 2 + PD
        for s_ in (-1, 1):
            kit.box('wall', s_ * PW2 - 0.45, s_ * PW2 + 0.45, 0.0, PH, z0, z1, skip=('bottom', 'top', 'back') + (('left',) if (s_ > 0 and bd['office']) else ()))
            kit.box('base', s_ * PW2 - 0.49, s_ * PW2 + 0.49, 0.0, 0.6, z0, z1 + 0.04, skip=('bottom', 'back'))
        kit.box('paint', -PW2 - 0.65, PW2 + 0.65, PH, PH + 0.3, z0 - 0.1, z1 + 0.25, skip=())                 # 雨遮
        kit.face('ceil', [(-PW2 + 0.45, PH - 0.001, z0), (PW2 - 0.45, PH - 0.001, z0), (PW2 - 0.45, PH - 0.001, z1), (-PW2 + 0.45, PH - 0.001, z1)], (0, -1, 0))
        kit.box('base', -PW2 + 0.45, PW2 - 0.45, 0.0, 0.1, z0, z1 + 0.6, skip=('bottom',))                   # 門口的地坪（高 10 cm）
        DOORF = K.Fr((0, 0, z0), (1, 0, 0), (0, 0, 1))
        dh = kit.window(DOORF, 0.0, 0.1, 2.0, 2.5, 0.0, False, dep=0.12, door=True)
        kit.wall_strip(DOORF, -PW2 + 0.45, PW2 - 0.45, 0.0, PH, [dh])
        fm = kit.acc('frame')
        for (ua, ub, va, vb_) in ((-1.0, -0.95, 0.1, 2.6), (0.95, 1.0, 0.1, 2.6), (-0.025, 0.025, 0.1, 2.15), (-1.0, 1.0, 2.1, 2.16), (-1.0, 1.0, 2.55, 2.6), (-0.95, -0.025, 0.1, 0.2), (0.025, 0.95, 0.1, 0.2)):
            kit.rect(fm, DOORF, ua, ub, va, vb_, -0.1)
        for (ua, ub) in ((-0.95, -0.025), (0.025, 0.95)): kit.glass_face(DOORF, [(ua, 0.2), (ub, 0.2), (ub, 2.1), (ua, 2.1)], -0.105, True, 0.1, 2.6)
        kit.glass_face(DOORF, [(-0.95, 2.16), (0.95, 2.16), (0.95, 2.55), (-0.95, 2.55)], -0.105, True, 0.1, 2.6)
        for x in (-0.12, 0.12): kit.box('misc', x - 0.015, x + 0.015, 0.9, 1.3, z0 - 0.1, z0 - 0.05, col='#c9c6bf')
        # 門廊吸頂燈（2026-10-15 LAWWW2-B：原本 0.36 m 的燈罩在晚上看不出在發光，C13 截圖 B）：0.6 m 金屬框＋0.54 m 乳白燈罩、往下凸 9 cm，側面也看得到亮
        lens, zc = kit.acc('lamp'), (z0 + z1) / 2
        kit.box(fm, -0.3, 0.3, PH - 0.025, PH - 0.001, zc - 0.3, zc + 0.3, skip=('top',))
        kit.box(lens, -0.27, 0.27, PH - 0.115, PH - 0.025, zc - 0.27, zc + 0.27, skip=('top',))
        SIGNF = K.Fr((0, 0, z1 + 0.25), (1, 0, 0), (0, 0, 1))
        plate(kit, f'PLATE_FACE_FD_{bd["key"]}', SIGNF, -2.0, 2.0, PH + 0.04, PH + 0.26, 0.006, {'text': f'大一女舍　{bd["key"]} 棟', 'bg': '#e8e5de', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.75})
        WF = K.Fr((-PW2 + 0.45, 0, (z0 + z1) / 2), (0, 0, 1), (1, 0, 0))     # 門廊左側牆的內面（朝 +x）
        plate(kit, f'PLATE_FACE_FD_{bd["key"]}_NO', WF, -0.35, 0.35, 1.45, 1.75, 0.006, {'text': '男賓止步', 'bg': '#f2efe8', 'color': '#8a2b22', 'serif': 0, 'fs': 0.62})
        if bd['office']:
            OF = K.Fr((PW2 - 0.45, 0, (z0 + z1) / 2), (0, 0, -1), (-1, 0, 0))   # 門廊右側牆的內面（朝 −x）：傳達室的小窗＋名牌
            oh = kit.window(OF, 0.0, 1.0, 0.9, 0.7, 0.05, True, dep=0.3, mull=[], fmat='frame')
            kit.wall_strip(OF, -PD / 2, PD / 2, 0.0, PH, [oh])
            kit.box('trimw', PW2 - 0.45 - 0.25, PW2 - 0.45, 0.94, 1.0, (z0 + z1) / 2 - 0.5, (z0 + z1) / 2 + 0.5, skip=('right',))   # 小窗的檯面
            plate(kit, 'PLATE_FACE_FD_A_OFFICE', OF, -0.3, 0.3, 1.85, 2.05, -0.006 + 0.012, {'text': '傳達室', 'bg': '#e8e5de', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.7})
        else:
            kit.fbox('misc', K.Fr((PW2 - 0.45, 0, (z0 + z1) / 2), (0, 0, -1), (-1, 0, 0)), -0.08, 0.08, 1.1, 1.38, 0.0, 0.05, skip=('in',), col='#2e3134')   # 刷卡機
            kit.fbox('misc', K.Fr((PW2 - 0.45, 0, (z0 + z1) / 2), (0, 0, -1), (-1, 0, 0)), -0.05, 0.05, 1.27, 1.33, 0.05, 0.052, skip=('in',), col='#4fb36a')
        # 門口兩側的信箱（A）／告示板（B）、盆栽
        if bd['office']:
            for i in range(3):
                for j in range(4):
                    kit.fbox('misc', FRONT, -PW2 - 1.95 + i * 0.42, -PW2 - 1.57 + i * 0.42, 1.1 + j * 0.3, 1.36 + j * 0.3, 0.0, 0.18, skip=('in',), col='#b4b8b6')
        else:
            kit.fbox('misc', FRONT, -PW2 - 2.3, -PW2 - 0.9, 1.0, 2.0, 0.0, 0.05, skip=('in',), col='#5b4331')
            for (du, dv, c) in ((-0.35, 0.2, '#f2efe6'), (0.05, 0.25, '#f6e7b8'), (0.4, 0.15, '#e8eef2'), (-0.2, -0.25, '#f3d9cf')):
                kit.fbox('misc', FRONT, -PW2 - 1.6 + du - 0.15, -PW2 - 1.6 + du + 0.15, 1.5 + dv - 0.18, 1.5 + dv + 0.18, 0.05, 0.055, skip=('in',), col=c)
        # （門口的盆栽沒有做：放在門廊外面會在導航阻擋外面，玩家會穿過去——要的話請 LAWWW 加阻擋再放）

    # ---------------- 二樓天橋（世界座標）：地板、面磚矮牆、帶狀鋁窗、平屋頂、天花板 ----------------
    kit = K.Kit(M, accs, 'fd_', place=(0.0, 0.0, 0.0), vc=VC)
    x0, x1, z0, z1, y0, yf = BR['x0'], BR['x1'], BR['z0'], BR['z1'], BR['y0'], BR['yf']
    kit.box('paint', x0, x1, y0, yf, z0, z1, skip=('left', 'right', 'top'))
    yw0, yw1, yr0 = yf + 0.9, yf + 2.55, yf + 2.75
    for (zz, n) in ((z0, -1), (z1, 1)):
        fr = K.Fr((0, 0, zz), (-1 if n < 0 else 1, 0, 0), (0, 0, n))       # 朝 −z 的那一面：從外面看右手邊是 −x
        u0, u1 = (-x1, -x0) if n < 0 else (x0, x1)
        kit.wall_strip(fr, u0, u1, yf, yw0, [])
        kit.box('paint', x0, x1, yw0 - 0.04, yw0 + 0.04, zz - (0.06 if n < 0 else 0.0), zz + (0.0 if n < 0 else 0.06), skip=('left', 'right'))
        k = 5; step = (x1 - x0) / k
        for i in range(k + 1):
            xm = x0 + i * step; a = max(x0, xm - 0.03); b = min(x1, xm + 0.03)
            kit.box('frame', a, b, yw0, yw1, zz - 0.04, zz + 0.04, skip=())
        kit.glass_face(fr, [(u0, yw0), (u1, yw0), (u1, yw1), (u0, yw1)], -0.0, True, yw0, yw1)
        kit.box('frame', x0, x1, yw1, yw1 + 0.05, zz - 0.04, zz + 0.04)
        kit.wall_strip(fr, u0, u1, yw1 + 0.05, yr0, [], mk='paint')
    kit.box('paint', x0, x1, yr0, yr0 + 0.3, z0 - 0.15, z1 + 0.15, skip=('left', 'right'))
    kit.face('ceil', [(x0, yr0 - 0.001, z0 + 0.01), (x1, yr0 - 0.001, z0 + 0.01), (x1, yr0 - 0.001, z1 - 0.01), (x0, yr0 - 0.001, z1 - 0.01)], (0, -1, 0))
    kit.face('roof', [(x0, yf + 0.005, z0 + 0.01), (x1, yf + 0.005, z0 + 0.01), (x1, yf + 0.005, z1 - 0.01), (x0, yf + 0.005, z1 - 0.01)], (0, 1, 0))
    for zz in (z0 + 0.6, z1 - 0.6):
        kit.box(kit.acc('lamp'), -93.2, -92.8, yr0 - 0.04, yr0 - 0.001, zz - 0.2, zz + 0.2, skip=('top',))

    # ---------------- 完成 ----------------
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    # v9.7 合併材質（LAWWW 2026-10-14 04:52Z）：純色、頂點色的零件併成一個頂點色材質 wz_vc_fd（遊戲端整個網格投影、陰影一次 draw call）。
    # 留下：面磚、漆面（含窗台）、石材勒腳、玻璃、燈罩、匾額
    VCM = L.vc_material('wz_vc_fd', rough=0.6)
    L.vc_consolidate(root, {n: VCM for n in ('fd_misc', 'fd_cloth', 'ck_ceiling', 'ck_frame', 'fd_roof')})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    info['note'] = '依文字資料的遊戲化設計（沒有照片）；本體、門廊位置照 CK.hall，導航不用改；v9.7 合併材質（12 → 7）'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    build()
