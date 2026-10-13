"""共同教學館外觀（校園世界座標）→ assets/models/env/second_ai/campus_gongtong.glb。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_gongtong.py

**依文字描述的遊戲化設計，不是照真實建築還原**：沒有任何一張照片（沙盒打不開臺大網站、維基百科），外觀根據搜尋摘要轉述的文字
（docs/art-rebuild/second_ai/research/四棟教學館與宿舍_參考資料.md 第 1 節，確認程度多半是 B＝只有一個來源）：
  - 土黃色十三溝面磚：Poly Haven exterior_wall_cladding_02 降低彩度、校正成土黃色（十三條溝太細，遊戲的距離看不到，沒做）
  - 每層樓板的位置磚豎貼：0.33 m 的帶子、外凸 2.5 cm，同一張面磚貼圖轉 90°（直的磚）
  - 開口用洗石子收邊、模擬石材拱窗：窗框、拱廊的拱圈、門廊、南側走廊的拱都是洗石子（Poly Haven granular_concrete）
  - 山牆頂三塊青瓷花磚排成磬形（倒 V）：四面山牆、門廊的山牆
  - 一二樓在前（南）、三四樓在後逐層退縮：一二樓滿版；三樓從南牆往北退 3.5 m、四樓退 7 m → 兩段露台（紅色隔熱磚）
  - L 形：東半部（三、四樓，東西向雙坡屋頂）＋西翼（共 101 那一側，兩層樓，南北向雙坡屋頂）
  - 南側走廊多處開口：三、四樓南面是開放走廊（拱形開口＋矮牆），面向露台
  - 西邊隔著木造走廊和行政大樓相鄰：兩棟之間 5 m 做成東西向的有頂木造走廊（玩家從底下走過）
位置、佔地、一樓照 src/zones3d.js 的 CK.hall({w:24,d:14,floors:3,gfh:4.2,fh:3.6,…,arcade:true,porch:{bays:1,depth:2.4,pediment:true,pedH:1.4}})＋ckPlace(gongtong,2,33,π)：
北面一樓 7 開間拱廊（柱子位置、拱廊深 2.6 m）、中央門廊（側牆位置、深 2.4 m）、本體範圍都和套件一樣 → 導航阻擋、門口互動點（classes3d.js DOORS.common）不用改。
木造走廊的四根柱子貼著兩棟的牆、在兩棟導航阻擋的外擴（0.3 m）裡面，不用另外擋。
沒有做的：西側階梯教室的戶外樓梯（走不上去的裝飾樓梯不能做，D38 第 4 條）；南側三棵琉球松、北側蒲葵樹列（等 LAWWW 決定位置）。
材質名稱沿用校園地標的約定（zones3d.js attachWenzhouModel）：ck_glass（窗：自發光貼圖左黑右亮，晚上約七成亮燈）、ck_ceiling、ck_trim_win、ck_frame、
ck_stone_base、wz_lamp_lens（拱廊、門廊、走廊的燈，晚上亮）。招牌：PLATE_FACE_*（遊戲用 canvas 畫字）。
本地座標＝套件的座標（中心在原點、地面 y=0、正面（北）朝 +z、+x＝西）；匯出時換成校園世界座標（x＝2−本地 x、z＝33−本地 z）。
"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402
from mathutils import Vector as V3   # noqa: E402
from cafe_layout import uv01   # noqa: E402

OUT = 'assets/models/env/second_ai/campus_gongtong.glb'
PX, PZ = 2.0, 33.0                         # ckPlace(gongtong, 2, 33, π)
W, D, GFH, FH = 24.0, 14.0, 4.2, 3.6
YF = [0.0, 4.2, 7.8, 11.4, 15.0]           # 一到四樓的地板高度；YF[4]＝四樓牆頂
NB, NBS = 7, 4
BW, BWS = W / NB, D / NBS
APW = max(0.7, BW * 0.22)                  # 拱廊柱墩寬（套件）
AD = 2.6; FZ = D / 2 - 0.3; AR = (BW - APW) / 2; AYS = min(GFH - AR - 0.5, 2.6)   # 拱廊：深度、柱子中心 z、拱半徑、起拱高度
PD, PH = 2.4, GFH + 0.6; PWID = BW; Z0 = D / 2; PR = (PWID - 0.9) / 2; PYS = min(PH - PR - 0.6, 3.2); PEDH = 1.4   # 門廊（一跨）
XJ = -W / 2 + 5 * BW                       # 東半部（三、四樓）和西翼的分界：開間線上（x=5.14）
Z3, Z4 = -3.5, 0.0                         # 三樓、四樓的南牆（往北退）
LOG = 2.0                                  # 三四樓南側開放走廊的深度（從外牆面算）
TW = 0.3                                   # 外牆厚
NSEG, NSEG_A = 6, 8
F = 0.16                                   # 洗石子窗框寬
GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)
WALL, WASH, ROOF = '#ab8756', '#aaa598', '#4b433d'   # 洗石子：中灰帶米色（第一版 #cdc5b4 在太陽下幾乎是白的）
bay_x = [-W / 2 + BW * (i + 0.5) for i in range(NB)]
side_z = [-D / 2 + BWS * (j + 0.5) for j in range(NBS)]   # −5.25, −1.75, 1.75, 5.25
WING_C = (XJ + W / 2) / 2                  # 西翼屋脊的 x


def build():
    out = os.path.join(L.ROOT, OUT)
    nb = max(3, round(W / 3.8))            # 套件的開間數算法（campuskit3d.js hall()）：開間數和門廊的拱數同奇偶
    if (nb - 1) % 2: nb += (1 if W / 3.8 > nb else -1)
    assert nb == NB and max(2, round(D / 3.8)) == NBS, (nb, NB)

    B.reset(texres=512)
    root = B.group('campus_gongtong', props={'kind': 'campus_gongtong'})
    M = {
        # 面磚（實際 2 m 一張，一塊約 22×8 cm）：先降低彩度（原圖橘、褐、深色混在一起）再校正成土黃色
        'wall': L.pbr('gt_wall', 'exterior_wall_cladding_02', tile=2.0, target=WALL, sat=0.35, normal=0.8, maps=('diff', 'nor'), rough_value=0.88),
        # 洗石子：granular_concrete（細碎石子露在水泥面上）校正成淺灰米色；1.5 m 一張
        'wash': L.pbr('gt_wash', 'granular_concrete', tile=1.5, target=WASH, normal=0.7, maps=('diff', 'nor'), res=512, rough_value=0.86),
        'trimw': L.pbr('ck_trim_win', 'granular_concrete', tile=1.5, target=WASH, maps=('diff',), res=512, rough_value=0.86),   # 同一張顏色貼圖（窗框、窗台：遊戲端不投影）
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#9a948a', maps=('diff',), res=256, rough_value=0.7),
        'roof': L.pbr('gt_roof', 'grey_roof_tiles', tile=3.0, target=ROOF, normal=0.8, maps=('diff', 'nor'), rough_value=0.82),
        'terr': L.pbr('gt_terrace', 'square_brick_paving', tile=1.6, target='#a5674c', maps=('diff',), res=256, rough_value=0.9),   # 露台、走廊地板：紅色隔熱磚
        'wood': L.pbr('gt_wood', 'dark_wood', tile=1.0, target='#6a4a33', maps=('diff',), res=256, rough_value=0.62),          # 木造走廊、木門
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'plaster': L.flat('gt_plaster', '#e5dfd1', rough=0.92),                     # 走廊裡的牆（油漆）
        'frame': L.flat('ck_frame', '#3e362f', rough=0.42, metal=0.35),            # 古銅色鋁窗框、門框
        'glass': L.vc_material('ck_glass', rough=0.12),
        'cel': L.vc_material('gt_celadon', rough=0.25),                            # 青瓷花磚（頂點色：釉色、凹框、中間的花）
        'misc': L.vc_material('gt_misc', rough=0.6),                               # 冷氣室外機、落水管、公告欄、燈座
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),                      # 燈罩（晚上發光：WZ_NIGHT）
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
        'bark': L.pbr('gt_palm_bark', 'palm_tree_bark', tile=1.0, target='#8b8478', sat=0.35, maps=('diff', 'nor'), res=256, rough_value=0.88, normal=0.9),   # 蒲葵樹幹
        'palm': L.vc_material('gt_palm', rough=0.62),                              # 蒲葵的葉片、葉柄、樹冠基部（頂點色）
    }
    # 玻璃：亮燈、沒亮燈的窗同一個材質（自發光貼圖 64×64：左半黑＝沒亮燈；右半＝由上往下漸暗的室內燈光；campus_hall.py 同一套）
    lit = bpy.data.images.new('win_lit_grad', 64, 64, alpha=False); px = []
    for j in range(64):
        t = j / 63; k = [(0.50, 0.36, 0.22), (0.86, 0.70, 0.48), (1.0, 0.92, 0.76)]
        a, b, u = (k[0], k[1], t / 0.6) if t < 0.6 else (k[1], k[2], (t - 0.6) / 0.4)
        px += [0.0, 0.0, 0.0, 1.0] * 32 + ([a[i] + (b[i] - a[i]) * u for i in range(3)] + [1.0]) * 32
    lit.pixels.foreach_set(px); lit.pack()
    nt = M['glass'].node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = lit; tx.extension = 'EXTEND'
    nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color']); nt.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.0
    accs = {}
    VC = ('glass', 'cel', 'misc', 'palm')

    def acc(k):
        if k not in accs: accs[k] = (CMesh if k in VC else Mesh)('gt_' + k, M[k])
        return accs[k]
    band_m = Mesh('gt_band', M['wall'])     # 豎貼的面磚帶：自己算 UV（貼圖轉 90°），最後和面磚合成同一個網格

    def XF(x, y, z): return (PX - x, y, PZ - z)

    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n

    def face(m, pts, want=None, uvs=None):
        """一個平面多邊形（本地座標）；want＝想要的法線（本地），反了就倒過來；uvs＝每個點的 UV"""
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs
        f = m.bm.faces.new([m.bm.verts.new(g2b(*XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        return f

    def cface(m, pts, want, hexcol, k=1.0):
        f = face(m, pts, want); m.paint([f], hexcol, k); return f

    def box(m, x0, x1, y0, y1, z0, z1, skip=(), col=None):
        """軸對齊方塊（本地座標）；skip：'bottom' 'top' 'back'（−z）'front'（+z）'left'（−x）'right'（+x）；col：頂點色（CMesh）"""
        Fs = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in Fs.items():
            if k in skip: continue
            f = face(m, pts, n)
            if col: m.paint([f], col)

    class Fr:
        """立面座標：u＝從外面看往右、v＝往上、d＝往外（法線）；原點 O（本地座標）"""
        def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
        def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
        def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])

    def arc(uc, vs, r, n, a0=math.pi, a1=0.0):
        return [(uc + r * math.cos(a0 + (a1 - a0) * k / n), vs + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]

    def rect(m, fr, ua, ub, va, vb, d=0.0):
        return face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N)

    def strip(m, fr, a, b, d0, d1, want):
        face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))

    def wall_strip(fr, u0, u1, v0, v1, holes, mk='wall'):
        """一段牆（u0..u1 × v0..v1）挖掉開口：holes＝[{u, a（外框半寬）, vb（洞底）, vs（起拱）, arch, vt（方洞的頂）, nseg}]"""
        m = acc(mk); cur = u0
        for h in sorted(holes, key=lambda h: h['u']):
            hl, hr = h['u'] - h['a'], h['u'] + h['a']
            if hl > cur + 1e-4: rect(m, fr, cur, hl, v0, v1)
            if h['vb'] > v0 + 1e-4: rect(m, fr, hl, hr, v0, h['vb'])
            if h['arch']:
                P = arc(h['u'], h['vs'], h['a'], h.get('nseg', NSEG))
                for k in range(len(P) - 1):
                    (ua, va), (ub, vb) = P[k], P[k + 1]
                    face(m, [fr.p(ua, va), fr.p(ub, vb), fr.p(ub, v1), fr.p(ua, v1)], fr.N)
            elif v1 > h['vt'] + 1e-4: rect(m, fr, hl, hr, h['vt'], v1)
            cur = hr
        if u1 > cur + 1e-4: rect(m, fr, cur, u1, v0, v1)

    def glass_face(fr, pts_uv, d, lit_, vb, vt):
        uc = 0.875 if lit_ else 0.125
        uvs = [(uc, max(0.0, min(1.0, (v - vb) / max(1e-6, vt - vb)))) for u, v in pts_uv]
        m = acc('glass'); f = face(m, [fr.p(u, v, d) for u, v in pts_uv], fr.N, uvs)
        for lp in f.loops:
            t = max(0.0, min(1.0, ((lp.vert.co.z) - vb) / max(1e-6, vt - vb)))   # Blender z＝遊戲 y
            lp[m.col] = [GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t for i in range(3)] + [1.0]

    def sill(fr, x0, x1, vb):
        """窗台（外凸 0.26、厚 0.1；洗石子）"""
        tw = acc('trimw')
        for (pts_, n) in (([fr.p(x0, vb, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 1, 0)),
                          ([fr.p(x0, vb - 0.1, 0.26), fr.p(x1, vb - 0.1, 0.26), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 0, 1)),
                          ([fr.p(x0, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, 0.26), fr.p(x0, vb - 0.1, 0.26)], (0, -1, 0)),
                          ([fr.p(x0, vb - 0.1, -0.06), fr.p(x0, vb, -0.06), fr.p(x0, vb, 0.26), fr.p(x0, vb - 0.1, 0.26)], (-1, 0, 0)),
                          ([fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x1, vb - 0.1, 0.26)], (1, 0, 0))):
            face(tw, pts_, fr.dirv(*n))

    def window(fr, u, vb, ww, wh, f, lit_, rect_=False, dep=0.30, proud=0.06, door=False, has_sill=True, fmat='trimw'):
        """一扇窗（窗洞在牆上挖、外框＝窗框外緣）：窗框（外凸 proud）＋外側面、窗洞內側（深 dep）、古銅色鋁框、直櫺、橫櫺、玻璃、窗台。
        rect_：方窗；door：門（沒有玻璃、窗台、下框、直櫺）；has_sill=False：窗台另外畫（雙拱窗共用一條窗台）"""
        r = ww / 2; ro = r + f; vs = vb + wh if rect_ else vb + wh - r; t = 0.06; tw = acc(fmat); fm = acc('frame')
        vt = vb + wh
        rect(tw, fr, u - ro, u - r, vb, vs, proud); rect(tw, fr, u + r, u + ro, vb, vs, proud)
        if rect_: rect(tw, fr, u - ro, u + ro, vs, vs + f, proud)
        else:
            I, O = arc(u, vs, r, NSEG), arc(u, vs, ro, NSEG)
            for k in range(NSEG): face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
        if proud > 1e-4:
            strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
            if rect_: strip(tw, fr, (u - ro, vs + f), (u + ro, vs + f), 0, proud, (0, 1, 0))
            else:
                for k in range(NSEG):
                    a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(a), math.sin(a), 0))
        de = -dep - 0.01
        strip(tw, fr, (u - r, vb), (u - r, vs), proud, de, (1, 0, 0)); strip(tw, fr, (u + r, vb), (u + r, vs), proud, de, (-1, 0, 0))
        if rect_: strip(tw, fr, (u - r, vs), (u + r, vs), proud, de, (0, -1, 0))
        else:
            for k in range(NSEG):
                a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, I[k], I[k + 1], proud, de, (-math.cos(a), -math.sin(a), 0))
        if not door: strip(tw, fr, (u - r, vb), (u + r, vb), -0.06, de, (0, 1, 0))
        rect(fm, fr, u - r, u - r + t, vb, vs, -dep + 0.005); rect(fm, fr, u + r - t, u + r, vb, vs, -dep + 0.005)
        if not door: rect(fm, fr, u - r + t, u + r - t, vb, vb + t, -dep + 0.005)
        if rect_: rect(fm, fr, u - r, u + r, vs - t, vs, -dep + 0.005)
        else:
            Ii, Io = arc(u, vs, r - t, NSEG), arc(u, vs, r, NSEG)
            for k in range(NSEG): face(fm, [fr.p(*Ii[k], -dep + 0.005), fr.p(*Ii[k + 1], -dep + 0.005), fr.p(*Io[k + 1], -dep + 0.005), fr.p(*Io[k], -dep + 0.005)], fr.N)
        if door: return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': False, 'vt': vs + f}
        top = vs if rect_ else vt - t
        rect(fm, fr, u - 0.03, u + 0.03, vb + t, top, -dep + 0.035)
        strip(fm, fr, (u - 0.03, vb + t), (u - 0.03, top), -dep + 0.035, -dep, (-1, 0, 0)); strip(fm, fr, (u + 0.03, vb + t), (u + 0.03, top), -dep + 0.035, -dep, (1, 0, 0))
        if not rect_:
            rect(fm, fr, u - r + t, u + r - t, vs - 0.03, vs + 0.03, -dep + 0.035)
            strip(fm, fr, (u - r + t, vs + 0.03), (u + r - t, vs + 0.03), -dep + 0.035, -dep, (0, 1, 0))
        if rect_: pts = [(u - r, vb), (u + r, vb), (u + r, vs), (u - r, vs)]
        else: pts = [(u - r, vb), (u + r, vb)] + arc(u, vs, r, NSEG, 0.0, math.pi)[:]
        glass_face(fr, pts, -dep - 0.005, lit_, vb, vt)
        if has_sill: sill(fr, u - ro - 0.09, u + ro + 0.09, vb)
        return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': not rect_, 'vt': vs + f}

    def window_pair(fr, u, vb, wh, lit_a, lit_b, r=0.5):
        """雙拱窗（兩扇 1 m 寬的拱窗，洗石子窗框在中間相接）＋共用的窗台：教室的窗"""
        h1 = window(fr, u - r - F, vb, 2 * r, wh, F, lit_a, has_sill=False)
        h2 = window(fr, u + r + F, vb, 2 * r, wh, F, lit_b, has_sill=False)
        sill(fr, u - 2 * (r + F) - 0.09, u + 2 * (r + F) + 0.09, vb)
        return [h1, h2]

    def opening(fr, u, vb, a, vs, depth, f=F, proud=0.06, nseg=NSEG_A):
        """拱形開口（沒有窗：開放走廊）：洗石子拱圈（外凸）＋開口內側（穿過牆厚 depth）。回傳挖洞用的資料（外框）"""
        ro = a + f; tw = acc('wash')
        rect(tw, fr, u - ro, u - a, vb, vs, proud); rect(tw, fr, u + a, u + ro, vb, vs, proud)
        I, O = arc(u, vs, a, nseg), arc(u, vs, ro, nseg)
        for k in range(nseg): face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
        strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
        for k in range(nseg):
            am = math.pi * (1 - (k + 0.5) / nseg); strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(am), math.sin(am), 0))
        strip(tw, fr, (u - a, vb), (u - a, vs), proud, -depth, (1, 0, 0)); strip(tw, fr, (u + a, vb), (u + a, vs), proud, -depth, (-1, 0, 0))
        for k in range(nseg):
            am = math.pi * (1 - (k + 0.5) / nseg); strip(tw, fr, I[k], I[k + 1], proud, -depth, (-math.cos(am), -math.sin(am), 0))
        return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': True, 'vt': vs + ro, 'nseg': nseg}

    def lit_hash(*k):
        h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
        return h - math.floor(h) > 0.3          # 約七成的窗晚上亮

    def bandf(fr, u0, u1, yc, ext=(0.0, 0.0), h=0.33, o=0.025):
        """豎貼面磚帶（樓板的位置）：正面＋上下面（外凸 o）；ext：兩端往外延伸（轉角蓋住另一面的帶子端面）＋端面"""
        a, b = u0 - ext[0], u1 + ext[1]; y0, y1 = yc - h / 2, yc + h / 2
        rect(band_m, fr, a, b, y0, y1, o)
        strip(band_m, fr, (a, y1), (b, y1), 0, o, (0, 1, 0)); strip(band_m, fr, (a, y0), (b, y0), 0, o, (0, -1, 0))
        if ext[0] > 0: face(band_m, [fr.p(a, y0, 0), fr.p(a, y1, 0), fr.p(a, y1, o), fr.p(a, y0, o)], fr.dirv(-1, 0, 0))
        if ext[1] > 0: face(band_m, [fr.p(b, y0, 0), fr.p(b, y1, 0), fr.p(b, y1, o), fr.p(b, y0, o)], fr.dirv(1, 0, 0))

    def celadon(fr, uc, vtop, d=0.0, s=0.30):
        """三塊青瓷花磚排成磬形（倒 V；菱形擺）：vtop＝山牆頂（屋面底）的高度。每塊：釉面（外凸 3.5 cm）、深一點的凹框、中間凸起的小花"""
        m = acc('cel'); hd = s / math.sqrt(2)                       # 菱形的半對角線
        for (du, dv) in ((0.0, -0.62 - hd), (-hd * 2.1, -0.62 - hd * 2.2), (hd * 2.1, -0.62 - hd * 2.2)):
            cu, cv = uc + du, vtop + dv
            def dia(r, dd): return [fr.p(cu, cv - r, d + dd), fr.p(cu + r, cv, d + dd), fr.p(cu, cv + r, d + dd), fr.p(cu - r, cv, d + dd)]
            P0, P1 = dia(hd, 0.0), dia(hd, 0.035)
            for k in range(4):
                a_, b_ = k, (k + 1) % 4; mid = [(P0[a_][i] + P0[b_][i]) / 2 for i in range(3)]; c0 = fr.p(cu, cv, d)
                cface(m, [P0[a_], P0[b_], P1[b_], P1[a_]], [mid[i] - c0[i] for i in range(3)], '#6f9483')
            Pr = dia(hd * 0.72, 0.038); cface(m, P1, fr.N, '#93b8a4')               # 釉面
            cface(m, Pr, fr.N, '#5f8573')                                          # 凹框（深一點的釉色）；每一層差 3 mm（遠處不會互相閃爍）
            Pc = dia(hd * 0.5, 0.041); cface(m, Pc, fr.N, '#a3c4b2')
            Pf = dia(hd * 0.2, 0.056); cface(m, Pf, fr.N, '#d9e4d6')                  # 中間的小花（白釉）
            for k in range(4):
                a_, b_ = k, (k + 1) % 4; cface(m, [Pc[a_], Pc[b_], Pf[b_], Pf[a_]], fr.N, '#bfd6c7')

    def gable(fr, u0, u1, yw, apex, mk='wall'):
        """山牆（五邊形：牆頂 yw 以上到屋面底；牆線上的屋面底＝yw+0.05）"""
        uc = (u0 + u1) / 2
        face(acc(mk), [fr.p(u0, yw), fr.p(u1, yw), fr.p(u1, yw + 0.05), fr.p(uc, apex), fr.p(u0, yw + 0.05)], fr.N)

    def roof(axis, a0, a1, b0, b1, yw, rise, ov_lo, ov_hi, ov_a0, ov_a1, t=0.16, free_lo=None, ridge=True):
        """雙坡屋頂：屋脊沿 axis（'x' 或 'z'）方向，a0..a1 是沿屋脊的範圍（山牆在 a0、a1），b0..b1 是兩道簷牆；牆頂 yw。
        ov_lo／ov_hi：兩邊出簷；ov_a0／ov_a1：山牆端出挑。free_lo：低（b0）那一邊的簷口前緣只畫這一段 a 範圍（其他貼著牆）"""
        def P(a, y, b): return (a, y, b) if axis == 'x' else (b, y, a)
        def Nv(na, ny, nb): return (na, ny, nb) if axis == 'x' else (nb, ny, na)
        bc = (b0 + b1) / 2; hs = (b1 - b0) / 2; s = rise / hs; yu = yw + 0.05; tt = t * math.sqrt(1 + s * s)
        def yb(b): return yu + (hs - abs(b - bc)) * s
        A0, A1 = a0 - ov_a0, a1 + ov_a1; BL, BH = b0 - ov_lo, b1 + ov_hi; yR = yu + hs * s
        m = acc('roof'); sm = acc('ceil')
        face(m, [P(A0, yb(BL) + tt, BL), P(A1, yb(BL) + tt, BL), P(A1, yR + tt, bc), P(A0, yR + tt, bc)], Nv(0, 1, -1))
        face(m, [P(A0, yb(BH) + tt, BH), P(A1, yb(BH) + tt, BH), P(A1, yR + tt, bc), P(A0, yR + tt, bc)], Nv(0, 1, 1))
        for (bo, bw_) in ((BL, b0), (BH, b1)):                                  # 出簷底下的簷底板
            if abs(bo - bw_) > 1e-4: face(sm, [P(A0, yb(bo), bo), P(A1, yb(bo), bo), P(A1, yb(bw_), bw_), P(A0, yb(bw_), bw_)], (0, -1, 0))
        for (ao, aw) in ((A0, a0), (A1, a1)):                                   # 山牆端出挑的底面
            if abs(ao - aw) < 1e-4: continue
            for (ba, bb) in ((b0, bc), (bc, b1)): face(sm, [P(ao, yb(ba), ba), P(aw, yb(ba), ba), P(aw, yb(bb), bb), P(ao, yb(bb), bb)], (0, -1, 0))
        for (bo, nb) in ((BL, -1), (BH, 1)):                                    # 簷口前緣
            ra = free_lo if (bo == BL and free_lo) else (A0, A1)
            face(m, [P(ra[0], yb(bo), bo), P(ra[1], yb(bo), bo), P(ra[1], yb(bo) + tt, bo), P(ra[0], yb(bo) + tt, bo)], Nv(0, 0, nb))
        for (ao, na) in ((A0, -1), (A1, 1)):                                    # 山牆端的屋面側緣
            for (ba, bb) in ((BL, bc), (bc, BH)):
                face(m, [P(ao, yb(ba), ba), P(ao, yb(bb), bb), P(ao, yb(bb) + tt, bb), P(ao, yb(ba) + tt, ba)], Nv(na, 0, 0))
        if ridge:                                                               # 屋脊瓦
            x0_, x1_ = A0 - 0.04, A1 + 0.04; yy0, yy1 = yR + tt - 0.06, yR + tt + 0.15
            if axis == 'x': box(m, x0_, x1_, yy0, yy1, bc - 0.16, bc + 0.16, skip=('bottom',))
            else: box(m, bc - 0.16, bc + 0.16, yy0, yy1, x0_, x1_, skip=('bottom',))
        return yR

    def lamp(x, y, z, r=0.16):
        """吸頂燈（燈座＋燈罩；燈罩晚上發光）"""
        box(acc('misc'), x - r - 0.03, x + r + 0.03, y - 0.03, y, z - r - 0.03, z + r + 0.03, skip=('top',), col='#d8d4cc')
        n = 12; lm = acc('lamp')
        ring = [(x + r * math.cos(2 * math.pi * k / n), z + r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        face(lm, [(px_, y - 0.09, pz_) for px_, pz_ in ring], (0, -1, 0))
        for k in range(n):
            (xa, za), (xb, zb) = ring[k], ring[(k + 1) % n]
            face(lm, [(xa, y - 0.03, za), (xb, y - 0.03, zb), (xb, y - 0.09, zb), (xa, y - 0.09, za)], ((xa + xb) / 2 - x, 0, (za + zb) / 2 - z))

    def ac_unit(x, y, z, face_dir):
        """冷氣室外機（0.8×0.6×0.3）：機殼、風扇護網（深色圓）、底座；face_dir＝出風面朝 +z（1）或 −z（−1）"""
        m = acc('misc'); w_, h_, d_ = 0.8, 0.6, 0.3; zc = z
        box(m, x - 0.36, x + 0.36, y, y + 0.06, zc - 0.14, zc + 0.14, col='#6b6a66')
        box(m, x - w_ / 2, x + w_ / 2, y + 0.06, y + 0.06 + h_, zc - d_ / 2, zc + d_ / 2, col='#d9d8d2')
        fz = zc + face_dir * (d_ / 2 + 0.005); cx, cy, rr = x - 0.1, y + 0.06 + h_ / 2, 0.22; n = 12
        pts = [(cx + rr * math.cos(2 * math.pi * k / n), cy + rr * math.sin(2 * math.pi * k / n), fz) for k in range(n)]
        cface(m, pts, (0, 0, face_dir), '#3a3a38')
        box(m, x + 0.22, x + 0.36, y + 0.12, y + 0.58, zc + face_dir * (d_ / 2) - 0.004, zc + face_dir * (d_ / 2) + 0.004, col='#bdbcb6')

    def pipe(x, z, y0, y1, s=0.1, col='#8a857c'):
        """方形落水管"""
        box(acc('misc'), x - s / 2, x + s / 2, y0, y1, z - s / 2, z + s / 2, col=col)

    # ======================= 立面 =======================
    FRONT = Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)); BACK = Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1))
    EAST = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0)); WEST = Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0))
    JW = Fr((XJ, 0, 0), (0, 0, -1), (1, 0, 0))                 # 東半部三、四樓的西牆（在西翼屋頂上面）
    WH1, WH = 2.6, min(FH * 0.62, 2.7)                         # 一樓、二到四樓的窗高
    def sy(fl): return 1.2 if fl == 0 else YF[fl] + 0.75

    # --- 北面（正面）：二樓滿版（門廊山牆後面那一間不開窗），三、四樓只有東半部 ---
    for fl in (1, 2, 3):
        x1 = W / 2 if fl == 1 else XJ; hs_ = []
        for i, x in enumerate(bay_x):
            if x > x1 or (fl == 1 and i == 3): continue
            hs_ += window_pair(FRONT, x, sy(fl), WH, lit_hash(1, fl, i), lit_hash(1, fl, i, 2))
        wall_strip(FRONT, -W / 2, x1, YF[fl], YF[fl + 1], hs_)
    # --- 南面：一、二樓滿版（教室的雙拱窗）；二樓露台的女兒牆 ---
    for fl in (0, 1):
        hs_ = []
        for i, x in enumerate(bay_x): hs_ += window_pair(BACK, -x, sy(fl), WH1 if fl == 0 else WH, lit_hash(2, fl, i), lit_hash(2, fl, i, 2))
        wall_strip(BACK, -W / 2, W / 2, YF[fl], YF[fl + 1], hs_)
    PAR = 1.0                                                  # 女兒牆高
    wall_strip(BACK, -XJ, W / 2, YF[2], YF[2] + PAR, [])       # 二樓露台女兒牆（外面）
    # --- 東面（x=−12）---
    def east_west(fr, zs_by_fl, extra_by_fl=None):
        for fl, (zs, z0_, z1_) in zs_by_fl.items():
            hs_ = [window(fr, (z if fr is EAST else -z), sy(fl), 1.5, WH1 if fl == 0 else WH, F, lit_hash(3 if fr is EAST else 4, fl, j)) for j, z in enumerate(zs)]
            hs_ += (extra_by_fl or {}).get(fl, [])
            u0, u1 = (z0_, z1_) if fr is EAST else (-z1_, -z0_)
            wall_strip(fr, u0, u1, YF[fl], YF[fl + 1], hs_)
    east_west(EAST, {0: ([-5.25, -1.75, 1.75], -D / 2, D / 2 - AD), 1: (side_z, -D / 2, D / 2), 2: ([1.75, 5.25], Z3, D / 2), 3: ([5.25], Z4, D / 2)})
    wall_strip(EAST, -D / 2, Z3, YF[2], YF[2] + PAR, []); wall_strip(EAST, Z3, Z4, YF[3], YF[3] + PAR, [])   # 兩段露台的女兒牆（東端）
    # --- 西翼的西面（x=+12）：一樓中間是往木造走廊的側門，兩側的窗往外移（避開走廊屋頂）---
    SD_W, SD_H = 1.0, 2.3
    side_door = window(WEST, 0.0, 0.0, SD_W, SD_H, 0.14, False, rect_=True, dep=0.2, door=True, fmat='wash')
    east_west(WEST, {0: ([-5.25, -2.3, 2.3], -D / 2, D / 2 - AD), 1: (side_z, -D / 2, D / 2)}, {0: [side_door]})
    # --- 東半部三、四樓的西牆（x=XJ，西翼屋頂上面）---
    east_west(JW, {2: ([1.75, 5.25], Z3, D / 2), 3: ([5.25], Z4, D / 2)})
    wall_strip(JW, -Z4, -Z3, YF[3], YF[3] + PAR, [])           # 三樓露台女兒牆（西端）
    # --- 山牆 ---
    rise4, risew = 2.3, 2.1
    apex4 = YF[4] + 0.05 + rise4; apexw = YF[2] + 0.05 + risew
    gable(EAST, Z4, D / 2, YF[4], apex4); gable(JW, -D / 2, -Z4, YF[4], apex4)
    gable(FRONT, XJ, W / 2, YF[2], apexw); gable(BACK, -W / 2, -XJ, YF[2], apexw)
    celadon(EAST, (Z4 + D / 2) / 2, apex4); celadon(JW, -(Z4 + D / 2) / 2, apex4)
    celadon(FRONT, WING_C, apexw); celadon(BACK, -WING_C, apexw)
    # 四樓山牆底的洗石子腰線（山牆像山花）＋簷牆頂的洗石子簷口
    wsh = acc('wash')
    box(wsh, -W / 2 - 0.1, -W / 2 + 0.02, YF[4] - 0.22, YF[4] + 0.02, Z4 + 0.02, D / 2 - 0.02, skip=('right',))
    box(wsh, XJ - 0.02, XJ + 0.1, YF[4] - 0.22, YF[4] + 0.02, Z4 + 0.02, D / 2 - 0.02, skip=('left',))
    box(wsh, -W / 2 - 0.1, XJ + 0.1, YF[4] - 0.22, YF[4] + 0.02, D / 2 - 0.02, D / 2 + 0.1, skip=('back',))
    box(wsh, -W / 2 - 0.1, XJ + 0.1, YF[4] - 0.22, YF[4] + 0.02, Z4 - 0.1, Z4 + 0.02, skip=('front',))
    box(wsh, W / 2 - 0.02, W / 2 + 0.1, YF[2] - 0.22, YF[2] + 0.02, -D / 2 - 0.1, D / 2 + 0.1, skip=('left',))   # 西翼西面的簷口
    # --- 樓板位置的豎貼面磚帶 ---
    e2 = (0.025, 0.025)
    bandf(FRONT, -W / 2, W / 2, YF[1], e2); bandf(FRONT, -W / 2, W / 2, YF[2], e2); bandf(FRONT, -W / 2, XJ, YF[3], e2)
    bandf(BACK, -W / 2, W / 2, YF[1], e2); bandf(BACK, -W / 2, W / 2, YF[2], e2)
    Z3F = Fr((0, 0, Z3), (-1, 0, 0), (0, 0, -1)); Z4F = Fr((0, 0, Z4), (-1, 0, 0), (0, 0, -1))
    bandf(Z3F, -XJ, W / 2, YF[3], e2)
    bandf(EAST, -D / 2, D / 2, YF[1]); bandf(EAST, -D / 2, D / 2, YF[2]); bandf(EAST, Z3, D / 2, YF[3])
    bandf(WEST, -D / 2, D / 2, YF[1]); bandf(JW, -D / 2, -Z3, YF[3])

    # --- 三、四樓南側的開放走廊（拱形開口＋矮牆；走廊地板、天花板、兩端的牆、教室那一側的門窗、吸頂燈）---
    def loggia(fl, zf, outf):
        y0, y1 = YF[fl], YF[fl + 1]; zi, zbk = zf + TW, zf + LOG
        INF = Fr((0, 0, zi), (1, 0, 0), (0, 0, 1))
        a = 1.05; vs = y0 + (y1 - y0) - 0.55 - a
        ho, hi = [], []
        for i in range(5):
            x = bay_x[i]
            ho.append(opening(outf, -x, y0, a, vs, TW))
            hi.append({'u': x, 'a': a, 'vb': y0, 'vs': vs, 'arch': True, 'vt': vs + a, 'nseg': NSEG_A})
            box(acc('wall'), x - a, x + a, y0, y0 + 1.0, zf + 0.05, zf + 0.25, skip=('bottom', 'left', 'right', 'top'))   # 開口裡的矮牆
            box(wsh, x - a, x + a, y0 + 1.0, y0 + 1.08, zf + 0.01, zf + 0.29, skip=('bottom', 'left', 'right'))
        wall_strip(outf, -XJ, W / 2, y0, y1, ho)
        wall_strip(INF, -W / 2 + TW, XJ - TW, y0, y1 - 0.3, hi, mk='plaster')
        x0_, x1_ = -W / 2 + TW, XJ - TW
        face(acc('terr'), [(x0_, y0 + 0.012, zf), (x1_, y0 + 0.012, zf), (x1_, y0 + 0.012, zbk), (x0_, y0 + 0.012, zbk)], (0, 1, 0))
        face(acc('ceil'), [(x0_, y1 - 0.3, zi), (x1_, y1 - 0.3, zi), (x1_, y1 - 0.3, zbk), (x0_, y1 - 0.3, zbk)], (0, -1, 0))
        for (x, n) in ((x0_, 1), (x1_, -1)): face(acc('plaster'), [(x, y0, zi), (x, y0, zbk), (x, y1 - 0.3, zbk), (x, y1 - 0.3, zi)], (n, 0, 0))
        BKF = Fr((0, 0, zbk), (-1, 0, 0), (0, 0, -1))         # 走廊後牆（教室那一側，從走廊看）
        hb = []
        for i in range(5):
            bx = bay_x[i]
            hb.append(window(BKF, -(bx - 0.85), y0, 0.95, 2.2, 0.06, False, rect_=True, dep=0.12, proud=0.02, door=True, fmat='frame'))
            rect(acc('wood'), BKF, -(bx - 0.85) - 0.475, -(bx - 0.85) + 0.475, y0, y0 + 2.2, -0.12)       # 教室門（木門；在鋁框後面）
            hb.append(window(BKF, -(bx + 0.6), y0 + 0.95, 1.5, 1.3, 0.06, lit_hash(6, fl, i), rect_=True, dep=0.12, proud=0.02, fmat='frame'))
            lamp(bx, y1 - 0.3, (zi + zbk) / 2, 0.13)
        wall_strip(BKF, -x1_, -x0_, y0, y1 - 0.3, hb, mk='plaster')
    loggia(2, Z3, Z3F); loggia(3, Z4, Z4F)
    wall_strip(Z3F, -XJ, W / 2, YF[3], YF[3] + PAR, [])        # 三樓露台的女兒牆（南面，外面）

    # --- 露台：地板（紅色隔熱磚）、女兒牆內側、洗石子壓頂、冷氣室外機、西翼屋頂邊的矮牆 ---
    PT = 0.24
    def terrace(y, za, zb, xa, xb, walls):
        """walls：哪幾邊有女兒牆（'S' 南、'E' 東、'W' 西）"""
        face(acc('terr'), [(xa + (PT if 'E' in walls else 0), y + 0.015, za + (PT if 'S' in walls else 0)), (xb - (PT if 'W' in walls else 0), y + 0.015, za + (PT if 'S' in walls else 0)),
                           (xb - (PT if 'W' in walls else 0), y + 0.015, zb), (xa + (PT if 'E' in walls else 0), y + 0.015, zb)], (0, 1, 0))
        yt = y + PAR
        if 'S' in walls:
            face(acc('wall'), [(xa, y, za + PT), (xb, y, za + PT), (xb, yt, za + PT), (xa, yt, za + PT)], (0, 0, 1))
            box(wsh, xa - 0.04, xb + 0.04, yt, yt + 0.08, za - 0.04, za + PT + 0.04, skip=('bottom',))
        z0_ = za + (PT + 0.04 if 'S' in walls else 0)
        if 'E' in walls:
            face(acc('wall'), [(xa + PT, y, z0_), (xa + PT, y, zb), (xa + PT, yt, zb), (xa + PT, yt, z0_)], (1, 0, 0))
            box(wsh, xa - 0.04, xa + PT + 0.04, yt, yt + 0.08, z0_, zb, skip=('bottom', 'front'))
        if 'W' in walls:
            face(acc('wall'), [(xb - PT, y, z0_), (xb - PT, y, zb), (xb - PT, yt, zb), (xb - PT, yt, z0_)], (-1, 0, 0))
            box(wsh, xb - PT - 0.04, xb + 0.04, yt, yt + 0.08, z0_, zb, skip=('bottom', 'front'))
    terrace(YF[2], -D / 2, Z3, -W / 2, XJ, 'SE')
    face(acc('wall'), [(XJ, YF[2], -D / 2), (XJ, YF[2], -D / 2 + PT), (XJ, YF[2] + PAR, -D / 2 + PT), (XJ, YF[2] + PAR, -D / 2)], (1, 0, 0))   # 二樓露台南女兒牆的西端（西翼屋頂上面看得到）
    box(wsh, XJ - 0.2, XJ, YF[2], YF[2] + 0.22, -D / 2 + PT, Z3, skip=('bottom', 'right'))                   # 露台西邊：西翼屋頂低的那一邊，矮的擋水邊
    terrace(YF[3], Z3, Z4, -W / 2, XJ, 'SEW')
    for x in (-9.6, -6.1, 1.2): ac_unit(x, YF[2] + 0.015, -D / 2 + PT + 0.4, 1)
    for x in (-8.2, -3.0): ac_unit(x, YF[3] + 0.015, Z3 + PT + 0.4, 1)

    # --- 屋頂 ---
    roof('x', -W / 2, XJ, Z4, D / 2, YF[4], rise4, 0.6, 0.6, 0.45, 0.45)                       # 東半部四樓：東西向屋脊
    roof('z', -D / 2, D / 2, XJ, W / 2, YF[2], risew, 0.02, 0.55, 0.45, 0.45, free_lo=(-D / 2 - 0.45, Z3))   # 西翼：南北向屋脊；東邊（低）貼著三樓的牆，只有露台那一段是自由的簷口
    box(acc('misc'), W / 2 + 0.45, W / 2 + 0.62, YF[2] - 0.46, YF[2] - 0.34, -D / 2 - 0.45, D / 2 + 0.45, col='#7c776f')   # 西翼西簷的簷溝（在簷口底下）

    # ======================= 一樓北面拱廊（照套件：柱子位置、拱的大小）=======================
    ARC_BACK = Fr((0, 0, D / 2 - AD), (1, 0, 0), (0, 0, 1))
    IWW, IWH = min(1.4, BW * 0.4), 2.5
    holes = []
    for i, x in enumerate(bay_x):
        if i == 3:   # 中央：玻璃雙開門＋上面的氣窗（古銅色鋁框；晚上門廳的燈從玻璃透出來）
            holes.append(window(ARC_BACK, x, 0.0, 2.0, 2.9, 0.15, False, rect_=True, dep=0.15, door=True, fmat='trimw'))
            fm = acc('frame')
            for (ua, ub, va, vb_) in ((x - 1.0, x - 0.94, 0.0, 2.9), (x + 0.94, x + 1.0, 0.0, 2.9), (x - 0.03, x + 0.03, 0.0, 2.5), (x - 1.0, x + 1.0, 2.44, 2.52), (x - 1.0, x + 1.0, 2.84, 2.9)):
                rect(fm, ARC_BACK, ua, ub, va, vb_, -0.13)
            for (ua, ub) in ((x - 0.94, x - 0.03), (x + 0.03, x + 0.94)):
                for (va, vb_) in ((0.0, 0.1), (2.36, 2.44)): rect(fm, ARC_BACK, ua, ub, va, vb_, -0.13)
                rect(fm, ARC_BACK, ua, ua + 0.06, 0.1, 2.36, -0.128); rect(fm, ARC_BACK, ub - 0.06, ub, 0.1, 2.36, -0.128)
                glass_face(ARC_BACK, [(ua + 0.06, 0.1), (ub - 0.06, 0.1), (ub - 0.06, 2.36), (ua + 0.06, 2.36)], -0.135, True, 0.0, 2.9)
                hx = ub - 0.16 if ua < x else ua + 0.16
                box(acc('misc'), hx - 0.02, hx + 0.02, 0.9, 1.25, D / 2 - AD - 0.13, D / 2 - AD - 0.06, col='#c9c6bf')   # 直把手
            glass_face(ARC_BACK, [(x - 0.94, 2.52), (x + 0.94, 2.52), (x + 0.94, 2.84), (x - 0.94, 2.84)], -0.135, True, 0.0, 2.9)
            box(acc('trimw'), x - 1.3, x + 1.3, 3.05, 3.25, D / 2 - AD, D / 2 - AD + 0.18, skip=('back',))      # 門楣
        else:
            holes.append(window(ARC_BACK, x, 0.9, IWW, IWH, 0.12, lit_hash(5, i)))
    wall_strip(ARC_BACK, -W / 2, W / 2, 0.0, GFH, holes)
    for sx in (-1, 1): face(acc('wall'), [(sx * W / 2, GFH - 0.3, D / 2 - AD), (sx * W / 2, GFH - 0.3, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - AD)], (sx, 0, 0))
    wm = acc('wall')
    for i in range(NB + 1):
        x = -W / 2 + BW * i; corner = i in (0, NB)
        box(wm, x - APW / 2, x + APW / 2, 0.4, GFH if corner else AYS - 0.11, FZ - 0.3, FZ + 0.3, skip=('bottom',) if corner else ('bottom', 'top'))   # 轉角柱墩一路到二樓樓板，頂面看得到（二樓的牆比柱子窄）
        box(wsh, x - APW / 2 - 0.08, x + APW / 2 + 0.08, AYS - 0.11, AYS + 0.11, FZ - 0.39, FZ + 0.39)
        box(wsh, x - APW / 2 - 0.06, x + APW / 2 + 0.06, 0.0, 0.4, FZ - 0.35, FZ + 0.35, skip=('bottom',))

    def arch_bay(m, mring, xc, bw, ys, top, r, zf, zb, n=NSEG_A, ring=0.14, clip=(-1e9, 1e9), msoff=None):
        for (z, nz) in ((zf, 1), (zb, -1)):
            for (a, b) in ((max(clip[0], xc - bw / 2), xc - r), (xc + r, min(clip[1], xc + bw / 2))):
                if b - a > 1e-4: face(m, [(a, ys, z), (b, ys, z), (b, top, z), (a, top, z)], (0, 0, nz))
            P = arc(xc, ys, r, n)
            for k in range(n):
                (xa, ya), (xb, yb) = P[k], P[k + 1]
                face(m, [(xa, ya, z), (xb, yb, z), (xb, top, z), (xa, top, z)], (0, 0, nz))
        P = arc(xc, ys, r, n)
        for k in range(n):
            (xa, ya), (xb, yb) = P[k], P[k + 1]; mid = math.pi * (1 - (k + 0.5) / n)
            face(msoff or m, [(xa, ya, zb), (xb, yb, zb), (xb, yb, zf), (xa, ya, zf)], (-math.cos(mid), -math.sin(mid), 0))
        if mring:
            O = arc(xc, ys, r + ring, n)
            for k in range(n):
                face(mring, [(P[k][0], P[k][1], zf + 0.06), (P[k + 1][0], P[k + 1][1], zf + 0.06), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (0, 0, 1))
                mid = math.pi * (1 - (k + 0.5) / n)
                face(mring, [(O[k][0], O[k][1], zf), (O[k + 1][0], O[k + 1][1], zf), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (math.cos(mid), math.sin(mid), 0))

    for x in bay_x: arch_bay(wm, wsh, x, BW, AYS, GFH, AR, FZ + 0.3, FZ - 0.3, clip=(-W / 2 + APW / 2, W / 2 - APW / 2))
    face(acc('ceil'), [(-W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, FZ - 0.3), (-W / 2, GFH - 0.3, FZ - 0.3)], (0, -1, 0))
    face(acc('base'), [(-W / 2 - 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 + 0.1), (-W / 2 - 0.4, 0.04, D / 2 + 0.1)], (0, 1, 0))
    for x in bay_x: lamp(x, GFH - 0.3, (D / 2 - AD + FZ - 0.3) / 2)
    # 拱廊裡門的兩側：公告欄（木框、軟木板、幾張公告）
    for sx in (-1, 1):
        bx = sx * 1.89; z0_ = D / 2 - AD; m = acc('misc')
        box(m, bx - 0.55, bx + 0.55, 0.95, 2.05, z0_, z0_ + 0.05, skip=('back',), col='#5b4331')
        box(m, bx - 0.5, bx + 0.5, 1.0, 2.0, z0_, z0_ + 0.055, skip=('back', 'bottom', 'left', 'right'), col='#9a7550')
        papers = [(-0.36, 1.55, 0.26, 0.36, '#f2efe6'), (-0.05, 1.62, 0.3, 0.3, '#f6e7b8'), (0.3, 1.5, 0.24, 0.34, '#e8eef2'), (-0.3, 1.18, 0.3, 0.22, '#f4f1ea'), (0.12, 1.2, 0.36, 0.26, '#f3d9cf')]
        for (dx, cy_, pw, ph, c) in (papers if sx < 0 else [(-p[0], p[1] - 0.04, p[2], p[3], p[4]) for p in papers]):
            box(m, bx + dx - pw / 2, bx + dx + pw / 2, cy_ - ph / 2, cy_ + ph / 2, z0_, z0_ + 0.06, skip=('back', 'bottom', 'left', 'right', 'top'), col=c)

    # ======================= 勒腳（花崗石 0.7 m）=======================
    bm_ = acc('base'); e = 0.08
    for (x0_, x1_) in ((-W / 2 - e, -1.15), (1.15, W / 2 + e)): box(bm_, x0_, x1_, 0, 0.7, D / 2 - AD - 0.02, D / 2 - AD + e, skip=('bottom', 'back'))
    box(bm_, -W / 2 - e, W / 2 + e, 0, 0.7, -D / 2 - e, -D / 2 + 0.02, skip=('bottom', 'front'))
    box(bm_, -W / 2 - e, -W / 2 + 0.02, 0, 0.7, -D / 2 + 0.02, D / 2 - AD - 0.02, skip=('bottom', 'right', 'front', 'back'))
    for (z0_, z1_) in ((-D / 2 + 0.02, -SD_W / 2 - 0.14), (SD_W / 2 + 0.14, D / 2 - AD - 0.02)):
        box(bm_, W / 2 - 0.02, W / 2 + e, 0, 0.7, z0_, z1_, skip=('bottom', 'left'))

    # ======================= 中央入口門廊（洗石子；照套件：一跨、深 2.4 m、山牆）=======================
    # 側牆、拱上的牆、山牆面是面磚（和建築一體）；勒腳、起拱線的腰帶、拱圈、拱腹、檐部、山牆斜邊的線腳是洗石子；門廊頂是兩坡的屋瓦
    pzf, pzb = Z0 + PD, Z0 + PD - 0.9
    arch_bay(wm, wsh, 0.0, PWID, PYS, PH, PR, pzf, pzb, ring=0.18, clip=(-PWID / 2 + 0.45, PWID / 2 - 0.45), msoff=wsh)
    for sx in (-1, 1):
        x0_, x1_ = sx * PWID / 2 - 0.45, sx * PWID / 2 + 0.45
        box(wm, x0_, x1_, 0.45, PH, Z0, pzf, skip=('bottom', 'top', 'back'))
        box(wsh, x0_ - 0.04, x1_ + 0.04, 0.0, 0.45, Z0, pzf + 0.04, skip=('bottom', 'back'))                       # 洗石子勒腳
        box(wsh, x0_ - 0.05, x1_ + 0.05, PYS - 0.12, PYS + 0.1, Z0, pzf + 0.05, skip=('back',))                    # 起拱線的腰帶（繞側牆三面）
    hw = PWID / 2 + 0.3; py0 = PH + 0.45; pz1 = Z0 + PD + 0.15            # 檐部、山牆比套件（+0.6）窄：二樓第 2、4 開間的雙拱窗窗台才不會插進檐部
    box(wsh, -hw, hw, PH, PH + 0.45, Z0 - 0.15, Z0 + PD + 0.15, skip=('back',))
    face(wm, [(-hw, py0, pz1), (hw, py0, pz1), (0, py0 + PEDH, pz1)], (0, 0, 1))                                  # 山牆面（面磚）
    # 門廊頂：兩坡屋瓦（坡度同山牆），在山牆斜邊線腳上面（線腳外凸 0.14 → 垂直 0.17），往前出挑到 pz1+0.25、兩側出挑 0.15
    rf = acc('roof'); sp = PEDH / hw; zr0, zr1 = Z0, pz1 + 0.25; XE = hw + 0.15
    def yt(x): return py0 + PEDH + 0.28 - abs(x) * sp
    for sx in (-1, 1):
        face(rf, [(sx * XE, yt(XE), zr0), (sx * XE, yt(XE), zr1), (0, yt(0), zr1), (0, yt(0), zr0)], (sx * sp, 1, 0))                       # 屋面
        face(acc('ceil'), [(sx * XE, yt(XE) - 0.1, zr0), (sx * XE, yt(XE) - 0.1, zr1), (0, yt(0) - 0.1, zr1), (0, yt(0) - 0.1, zr0)], (0, -1, 0))   # 底面
        face(rf, [(sx * XE, yt(XE) - 0.1, zr1), (0, yt(0) - 0.1, zr1), (0, yt(0), zr1), (sx * XE, yt(XE), zr1)], (0, 0, 1))                 # 前緣
        face(rf, [(sx * XE, yt(XE) - 0.1, zr0), (sx * XE, yt(XE) - 0.1, zr1), (sx * XE, yt(XE), zr1), (sx * XE, yt(XE), zr0)], (sx, 0, 0))   # 簷口
    box(rf, -0.12, 0.12, yt(0) - 0.04, yt(0) + 0.12, zr0, zr1 + 0.02, skip=('bottom', 'back'))                                            # 屋脊
    for sx in (-1, 1):
        a, b = (sx * hw, py0), (0.0, py0 + PEDH); L_ = math.hypot(b[0] - a[0], b[1] - a[1]); nx, ny = -(b[1] - a[1]) / L_ * sx, abs(b[0] - a[0]) / L_
        off = 0.14
        face(wsh, [(a[0], a[1], pz1 + 0.12), (b[0], b[1], pz1 + 0.12), (b[0] + nx * off, b[1] + ny * off, pz1 + 0.12), (a[0] + nx * off, a[1] + ny * off, pz1 + 0.12)], (0, 0, 1))
        face(wsh, [(a[0], a[1], pz1), (b[0], b[1], pz1), (b[0], b[1], pz1 + 0.12), (a[0], a[1], pz1 + 0.12)], (-nx, -ny, 0))
    celadon(Fr((0, 0, pz1), (1, 0, 0), (0, 0, 1)), 0.0, py0 + PEDH + 0.12, s=0.2)
    face(acc('ceil'), [(-PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, pzb), (-PWID / 2, PH - 0.15, pzb)], (0, -1, 0))
    box(acc('base'), -PWID / 2 - 0.3, PWID / 2 + 0.3, 0.0, 0.08, Z0 - 0.3, Z0 + PD + 0.9, skip=('bottom',))
    lamp(0.0, PH - 0.15, (Z0 + pzb) / 2, 0.2)
    plate = Mesh('PLATE_FACE_GONGTONG', M['board'])
    sy_, zf_ = PH + 0.225, Z0 + PD + 0.15; pw_, ph_ = 3.7, 0.4
    face(plate, [(-pw_ / 2, sy_ - ph_ / 2, zf_ + 0.006), (pw_ / 2, sy_ - ph_ / 2, zf_ + 0.006), (pw_ / 2, sy_ + ph_ / 2, zf_ + 0.006), (-pw_ / 2, sy_ + ph_ / 2, zf_ + 0.006)], (0, 0, 1))

    # ======================= 西側木造走廊（共同西牆 x=12 → 行政大樓東牆 x=17；世界 x −10 → −15、z 31.8..34.2）=======================
    X0, X1 = W / 2, W / 2 + 5.0
    PZs = (-0.75, 0.75); PXs = (X0 + 0.17, X1 - 0.17)                        # 柱子貼牆：在兩棟導航阻擋的外擴（0.3 m）裡面
    wd = acc('wood'); YB0, YB1 = 2.9, 3.1; YRB = 3.65
    face(acc('base'), [(X0 + 0.08, 0.012, -1.0), (X1 - 0.08, 0.012, -1.0), (X1 - 0.08, 0.012, 1.0), (X0 + 0.08, 0.012, 1.0)], (0, 1, 0))   # 走廊地面的花崗石鋪面（和地面幾乎同高：走過去不會卡腳）
    for x in PXs:
        for z in PZs:
            box(acc('base'), x - 0.09, x + 0.09, 0.0, 0.2, z - 0.11, z + 0.11, skip=('bottom',))
            box(wd, x - 0.08, x + 0.08, 0.2, YB0, z - 0.08, z + 0.08, skip=('bottom', 'top'))
            dx = 1 if x < (X0 + X1) / 2 else -1                                # 托木（往走廊中間伸）
            face(wd, [(x, YB0 - 0.42, z - 0.05), (x + dx * 0.08, YB0 - 0.42, z - 0.05), (x + dx * 0.55, YB0, z - 0.05), (x, YB0, z - 0.05)], (0, 0, -1))
            face(wd, [(x, YB0 - 0.42, z + 0.05), (x + dx * 0.08, YB0 - 0.42, z + 0.05), (x + dx * 0.55, YB0, z + 0.05), (x, YB0, z + 0.05)], (0, 0, 1))
            face(wd, [(x + dx * 0.08, YB0 - 0.42, z - 0.05), (x + dx * 0.55, YB0, z - 0.05), (x + dx * 0.55, YB0, z + 0.05), (x + dx * 0.08, YB0 - 0.42, z + 0.05)], (dx * 0.42, -0.47, 0))
    for z in PZs: box(wd, X0, X1, YB0, YB1, z - 0.07, z + 0.07, skip=('left', 'right'))                      # 桁
    for x in (PXs[0], (X0 + X1) / 2, PXs[1]):
        box(wd, x - 0.07, x + 0.07, YB0, YB1, -0.85, 0.85)                                                    # 梁
        box(wd, x - 0.05, x + 0.05, YB1, YRB, -0.05, 0.05, skip=('bottom', 'top'))                            # 束
    box(wd, X0, X1, YRB, YRB + 0.1, -0.06, 0.06, skip=('left', 'right'))                                      # 脊桁
    # 椽（每 0.42 m）：底面從脊桁頂到桁、再出簷到 z=±1.0；上面是望板（木）＋瓦（屋瓦）
    sl = (YRB + 0.1 - YB1) / (PZs[1] - 0.07)
    def yr(z): return YRB + 0.1 - abs(z) * sl
    ZE = 1.0; RT = 0.1                                                         # 簷口、椽的高度
    for k in range(12):
        x = X0 + 0.25 + k * (5.0 - 0.5) / 11
        for sz in (-1, 1):
            face(wd, [(x - 0.03, yr(0.0), 0.0), (x - 0.03, yr(ZE), sz * ZE), (x - 0.03, yr(ZE) + RT, sz * ZE), (x - 0.03, yr(0.0) + RT, 0.0)], (-1, 0, 0))
            face(wd, [(x + 0.03, yr(0.0), 0.0), (x + 0.03, yr(ZE), sz * ZE), (x + 0.03, yr(ZE) + RT, sz * ZE), (x + 0.03, yr(0.0) + RT, 0.0)], (1, 0, 0))
            face(wd, [(x - 0.03, yr(0.0), 0.0), (x + 0.03, yr(0.0), 0.0), (x + 0.03, yr(ZE), sz * ZE), (x - 0.03, yr(ZE), sz * ZE)], (0, -1, 0))
            face(wd, [(x - 0.03, yr(ZE), sz * ZE), (x + 0.03, yr(ZE), sz * ZE), (x + 0.03, yr(ZE) + RT, sz * ZE), (x - 0.03, yr(ZE) + RT, sz * ZE)], (0, 0, sz))
    for sz in (-1, 1):
        face(wd, [(X0, yr(0.0) + RT, 0.0), (X1, yr(0.0) + RT, 0.0), (X1, yr(ZE) + RT, sz * ZE), (X0, yr(ZE) + RT, sz * ZE)], (0, -1, 0))          # 望板（從下面看）
        face(acc('roof'), [(X0, yr(0.0) + RT + 0.12, 0.0), (X1, yr(0.0) + RT + 0.12, 0.0), (X1, yr(ZE) + RT + 0.12, sz * ZE), (X0, yr(ZE) + RT + 0.12, sz * ZE)], (0, 1, sz))
        face(acc('roof'), [(X0, yr(ZE) + RT, sz * ZE), (X1, yr(ZE) + RT, sz * ZE), (X1, yr(ZE) + RT + 0.12, sz * ZE), (X0, yr(ZE) + RT + 0.12, sz * ZE)], (0, 0, sz))
    box(acc('roof'), X0, X1, yr(0.0) + RT + 0.06, yr(0.0) + RT + 0.24, -0.13, 0.13, skip=('bottom', 'left', 'right'))   # 屋脊
    # 中間吊一盞燈（木框＋燈罩）
    lx_ = (X0 + X1) / 2; m = acc('misc')
    box(m, lx_ - 0.012, lx_ + 0.012, 2.62, YB0, -0.012, 0.012, col='#2f2a25')
    box(m, lx_ - 0.13, lx_ + 0.13, 2.58, 2.62, -0.13, 0.13, col='#4a3626'); box(m, lx_ - 0.13, lx_ + 0.13, 2.28, 2.32, -0.13, 0.13, col='#4a3626')
    box(acc('lamp'), lx_ - 0.11, lx_ + 0.11, 2.32, 2.58, -0.11, 0.11)
    # 兩端的門：共同這一側是側門（木門、關著，上面的牌子「側門　請由正門出入」）；行政大樓那一側：門框＋木門貼在行政大樓的東牆上
    lfx = W / 2 - 0.19                                                          # 門板（在洗石子門框、鋁框後面）
    for (za, zb) in ((-SD_W / 2 + 0.06, -0.005), (0.005, SD_W / 2 - 0.06)):
        face(wd, [(lfx, 0.02, za), (lfx, 0.02, zb), (lfx, SD_H - 0.06, zb), (lfx, SD_H - 0.06, za)], (1, 0, 0))
        for (va, vb_) in ((0.25, 1.0), (1.2, 2.05)):                            # 門板的線板（外凸 1.5 cm）
            box(wd, lfx, lfx + 0.015, va, vb_, za + 0.07, zb - 0.07, skip=('left',))
    for zz in (-0.07, 0.07): box(acc('misc'), lfx + 0.015, lfx + 0.07, 1.0, 1.08, zz - 0.012, zz + 0.012, col='#b8b4aa')
    sp = Mesh('PLATE_FACE_GT_SIDE', M['board'])
    face(sp, [(W / 2 + 0.025, 2.5, -0.55), (W / 2 + 0.025, 2.5, 0.55), (W / 2 + 0.025, 2.72, 0.55), (W / 2 + 0.025, 2.72, -0.55)], (1, 0, 0))
    box(wsh, W / 2, W / 2 + 0.02, 2.46, 2.76, -0.6, 0.6, skip=('left',))
    ax_ = X1 - 0.002                                                            # 行政大樓東牆（面對共同）
    box(wsh, ax_ - 0.08, ax_, 0.0, SD_H + 0.14, -SD_W / 2 - 0.14, -SD_W / 2, skip=('right',)); box(wsh, ax_ - 0.08, ax_, 0.0, SD_H + 0.14, SD_W / 2, SD_W / 2 + 0.14, skip=('right',))
    box(wsh, ax_ - 0.08, ax_, SD_H, SD_H + 0.14, -SD_W / 2, SD_W / 2, skip=('right',))
    for (za, zb) in ((-SD_W / 2, -0.01), (0.01, SD_W / 2)):
        face(wd, [(ax_ - 0.04, 0.02, za), (ax_ - 0.04, 0.02, zb), (ax_ - 0.04, SD_H, zb), (ax_ - 0.04, SD_H, za)], (-1, 0, 0))
    # ======================= 落水管（南面、西翼、東面）=======================
    for x in (-W / 2 + 0.25, XJ - 0.25): pipe(x, -D / 2 - 0.08, 0.05, YF[2])
    for z in (-D / 2 + 0.3, 3.9):
        pipe(W / 2 + 0.08, z, 0.05, YF[2] - 0.4)
        box(acc('misc'), W / 2 + 0.03, W / 2 + 0.5, YF[2] - 0.5, YF[2] - 0.4, z - 0.05, z + 0.05, col='#8a857c')   # 接到簷溝
    pipe(-W / 2 - 0.08, -D / 2 + 0.3, 0.05, YF[2])


    # ======================= 北側蒲葵樹列（LAWWW 15:38Z：做在同一個 GLB；樹幹位置寫在交付文件，給 LAWWW 擋導航）=======================
    # 蒲葵（Livistona chinensis）：樹幹灰褐、直；樹冠 16 片掌狀葉——葉柄約 1 m、扇形葉片直徑約 1.4 m、張開 300°（缺口朝葉柄），
    # 外半段裂成一條一條、尖端下垂（蒲葵的特徵）、葉片有摺（脊、谷）；新葉往上、老葉往下垂，最老幾片的尖端枯黃。
    # 真的幾何（每片葉 22 條裂片），不是貼圖卡片；顏色是頂點色（一個材質＝一次 draw call）。位置照真實的「北側蒲葵樹列」（校史館資料，B 級），
    # 遊戲裡排在正門北邊 z=20.5 一排、門口那一段（x 0..4）空出來；排列、株數、樹高是遊戲化的（沒有照片）
    PALMS = [(-8.0, 20.5, 6.6), (-4.5, 20.5, 7.4), (-1.0, 20.5, 7.0), (5.0, 20.5, 7.2), (8.5, 20.5, 6.8), (12.0, 20.5, 7.6)]   # 世界座標 x、z、樹高
    def lin(h):
        return [(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))] + [1.0]
    def mix(a, b, t): return [a[i] + (b[i] - a[i]) * t for i in range(3)] + [1.0]
    pm = acc('palm'); bark_m = Mesh('gt_palm_bark', M['bark']); blay = bark_m.bm.loops.layers.uv.verify()
    def vface(pts, cols):                                 # 世界座標的點（XF 是自己的反函數：本地＝世界的同一套換算），每個角一個顏色
        f = pm.bm.faces.new([pm.bm.verts.new(g2b(*p)) for p in pts])
        for lp, c in zip(f.loops, cols): lp[pm.col] = c
        return f
    G_DARK, G_MID, G_LIGHT, G_TIP, DEAD, STALK, BOOT = lin('#3d5826'), lin('#55712f'), lin('#6c8a3b'), lin('#879650'), lin('#8b6d40'), lin('#7a8045'), lin('#5a4630')
    UP = V3((0, 1, 0))
    for pi_, (wx, wz, H) in enumerate(PALMS):
        r = random.Random(100 + pi_)
        lean = V3((r.uniform(-0.18, 0.18), 0, r.uniform(-0.18, 0.18)))
        base = V3((wx, 0.0, wz)); top = base + V3((0, H, 0)) + lean
        NS = 8; rings = []
        for k in range(5):                                # 樹幹：8 面、4 段（中段微彎），圓柱 UV（樹皮貼圖 1 m 一張）
            t = k / 4; c = base.lerp(top, t) + lean * (0.25 * math.sin(math.pi * t)); rr = 0.19 - 0.04 * t
            rings.append([c + V3((rr * math.cos(2 * math.pi * q / NS), 0, rr * math.sin(2 * math.pi * q / NS))) for q in range(NS + 1)])
        circ = 2 * math.pi * 0.18
        for k in range(4):
            for q in range(NS):
                quad = [rings[k][q], rings[k][q + 1], rings[k + 1][q + 1], rings[k + 1][q]]; uvs = [(q / NS * circ, k * H / 4), ((q + 1) / NS * circ, k * H / 4), ((q + 1) / NS * circ, (k + 1) * H / 4), (q / NS * circ, (k + 1) * H / 4)]
                f = bark_m.bm.faces.new([bark_m.bm.verts.new(g2b(*p)) for p in quad]); f.normal_update()
                ctr = base.lerp(top, (k + 0.5) / 4); outw = g2b(*((quad[0] + quad[2]) / 2 - ctr))
                for lp, uv in zip(f.loops, uvs): lp[blay].uv = uv
                if f.normal.dot(outw) < 0: f.normal_flip()
        # 樹冠基部（枯葉柄的纖維）：短的深褐色圓台
        for q in range(NS):
            a0, a1 = 2 * math.pi * q / NS, 2 * math.pi * (q + 1) / NS
            p00 = top + V3((0.17 * math.cos(a0), -0.85, 0.17 * math.sin(a0))); p01 = top + V3((0.17 * math.cos(a1), -0.85, 0.17 * math.sin(a1)))
            p10 = top + V3((0.27 * math.cos(a0), 0.0, 0.27 * math.sin(a0))); p11 = top + V3((0.27 * math.cos(a1), 0.0, 0.27 * math.sin(a1)))
            vface([p00, p01, p11, p10], [BOOT, BOOT, mix(BOOT, STALK, 0.3), mix(BOOT, STALK, 0.3)])
            vface([p10, p11, top + V3((0, 0.08, 0))], [BOOT, BOOT, BOOT])
        NL = 16; ga = math.radians(137.5); phi0 = r.uniform(0, 2 * math.pi)
        for k in range(NL):
            phi = phi0 + k * ga; age = k / (NL - 1)       # 0＝最新（往上）、1＝最老（往下垂）
            el = math.radians(66 - 98 * age + r.uniform(-7, 7))
            d = V3((math.cos(el) * math.cos(phi), math.sin(el), math.cos(el) * math.sin(phi)))
            C0 = top + V3((0, -0.1, 0)) + V3((d.x, 0, d.z)) * 0.15
            P = C0 + d * (0.95 + r.uniform(-0.12, 0.15)) + V3((0, -0.1 * age, 0))
            s_ = UP.cross(d)
            if s_.length < 1e-4: s_ = V3((1, 0, 0))
            s_.normalize(); n_ = d.cross(s_).normalized()
            if n_.y < 0: n_ = -n_
            # 葉柄：4 面細管（頂點色：黃綠帶褐）
            b_ = d.cross(s_).normalized(); pr = [(C0, 0.035), (P, 0.022)]
            for q in range(4):
                a0, a1 = math.pi / 2 * q, math.pi / 2 * (q + 1)
                pts = [pr[0][0] + (s_ * math.cos(a0) + b_ * math.sin(a0)) * pr[0][1], pr[0][0] + (s_ * math.cos(a1) + b_ * math.sin(a1)) * pr[0][1],
                       pr[1][0] + (s_ * math.cos(a1) + b_ * math.sin(a1)) * pr[1][1], pr[1][0] + (s_ * math.cos(a0) + b_ * math.sin(a0)) * pr[1][1]]
                vface(pts, [STALK] * 4)
            R = 0.7 + r.uniform(-0.06, 0.08); ri = 0.5 * R; NSG = 22; th0 = math.radians(-150); dth = math.radians(300) / NSG
            droop = (0.2 + 0.4 * age) * R
            def bp(rad, th, off, P=P, d=d, s_=s_, n_=n_, R=R, ri=ri, droop=droop):
                q = P + (d * math.cos(th) + s_ * math.sin(th)) * rad + n_ * off
                t = max(0.0, (rad - ri) / (R - ri))
                return q + V3((0, -droop * t * t, 0)) - n_ * (0.07 * (rad / R) ** 2)   # 外半段下垂、整片微微往下彎
            dead = age > 0.8
            for j in range(NSG):
                ta, tb = th0 + j * dth, th0 + (j + 1) * dth; tm = (ta + tb) / 2
                B0, B1, Mj = bp(ri, ta, -0.02), bp(ri, tb, -0.02), bp(ri, tm, 0.03)       # 摺：裂片的邊是谷、中間是脊
                cin, cmid = G_MID, mix(G_DARK, G_MID, 0.45)
                vface([P, B0, Mj], [cin, cmid, cmid]); vface([P, Mj, B1], [cin, cmid, cmid])
                w = dth * 0.3
                Ql, Qr, T = bp(0.8 * R, tm - w, 0.012), bp(0.8 * R, tm + w, 0.012), bp(R, tm, 0.0)
                cq = mix(G_DARK, G_LIGHT, 0.6); ct = mix(G_TIP, DEAD, 0.75) if dead else G_TIP
                vface([B0, Mj, Ql], [cmid, cmid, cq]); vface([Mj, B1, Qr], [cmid, cmid, cq]); vface([Mj, Qr, Ql], [cmid, cq, cq]); vface([Ql, Qr, T], [cq, cq, ct])

    # ======================= 完成 =======================
    # 豎貼面磚帶的 UV：盒狀投影但 u、v 對調（直的磚）
    lay = band_m.bm.loops.layers.uv.verify(); tl = band_m.tile; band_m.bm.normal_update()
    for f in band_m.bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for lp in f.loops:
            co = lp.vert.co
            if ax == 2: lp[lay].uv = (co.x / tl, co.y / tl)
            else: lp[lay].uv = (co.z / tl, (co.y if ax == 0 else co.x) / tl)
    band_m.finish(root, uv=False)
    bark_m.finish(root, uv=False)
    for k, m in accs.items():
        ob_ = m.finish(root, uv=(k not in VC))
        if k == 'palm': L.smooth_mesh(ob_, angle=math.pi)   # 蒲葵：全部平滑著色（摺的角度超過 43° 會被切成硬邊，相鄰裂片就不共用頂點；平面著色時 GLB 多 1 MB）
    uv01(plate.finish(root, uv=True, props={'text': '共同教學館', 'bg': '#d8d0c0', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.72}))
    uv01(sp.finish(root, uv=True, props={'text': '側門　請由正門出入', 'bg': '#d8d0c0', 'color': '#3b2a1e', 'serif': 1, 'fs': 0.6}))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    info['note'] = '依文字描述的遊戲化設計（沒有照片）；一樓佔地照 CK.hall，導航不用改'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    build()
