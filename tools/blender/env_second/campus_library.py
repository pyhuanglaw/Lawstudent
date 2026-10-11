"""臺大總圖書館（椰林大道東端盡頭，正面朝西）的正式外觀 → 一個 GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_library.py [-- --out assets/models/env/second_ai/campus_library.glb]

取代 src/zones3d.js campus 區塊的 CK.hall 總圖的外觀（LAWWW 2026-10-10 23:26Z 分派）：位置、尺寸、朝向、樓層、開間、
拱廊柱子、門廊、塔樓都照套件（campuskit3d.js hall()；改那邊要一起改這裡）。導航阻擋、鏡頭碰撞、門口互動點都在遊戲程式裡（套件），不變。

台大校舍的語彙（ART_DIRECTION、D23／D25）：褐色面磚外牆、石材收邊（勒腳、樓層腰帶、簷口、拱窗窗框與窗台）、一樓連續拱廊、
中央入口門廊＋山牆、中央塔樓、四坡屋頂。和套件不同的地方（品質）：
  - 窗是牆上真的開出的拱形窗洞：石材窗框外凸 6 cm、窗玻璃內凹 30 cm（看得到窗洞內側），窗台外凸；套件是貼在牆面上的薄片。
  - 拱廊與門廊的拱有拱腹（拱的內側面），拱圈石材收邊；簷口是三段線腳；屋簷底下有簷底板。
  - 面磚（exterior_wall_cladding_02）、切石（sandstone_blocks_08）、屋瓦（grey_roof_tiles）、花崗石（granite_tile_03）、木門（dark_wood）都是 Poly Haven CC0 PBR。
效能（LAWWW 的條件：同一個鏡頭的三角形不能比套件多）：套件 34,503 個三角形（投影 4,612）。這裡不用 instancing：
全部合成每個材質一個網格（draw call 少）；窗框、窗台、窗洞內側用另一個材質（ck_trim_win），遊戲端不投影。
招牌「總圖書館」：PLATE_FACE_LIB（遊戲用 canvas 畫字：石材底色、深褐色襯線字，晚上不發光）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_library.glb')

# ---------------- 套件的參數（zones3d.js：CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,wall:'#9e5a44',trim:'#dcd3c2',roof:'#4a3a33',roofH:4.0,
#   arcade:true,arcDepth:3.0,porch:{bays:5,depth:4.2,pediment:true,pedH:3.0,h:9.0,ys:5.6},tower:{w:9,h:9},sign:'總圖書館'})；ckPlace(lib,100,0,-π/2)）
W, D, NF, GFH, FH = 60.0, 26.0, 4, 5.0, 4.3
H = GFH + (NF - 1) * FH                       # 17.9
AD = 3.0; BAYT = 3.8; PB = 5
NB = max(3, round(W / BAYT))
if (NB - PB) % 2: NB += (1 if W / BAYT > NB else -1)
BW = W / NB; APW = max(0.7, BW * 0.22)        # 15 開間、每間 4.0 m、柱寬 0.88
NBS = max(2, round(D / BAYT)); BWS = D / NBS  # 側面 7 開間
WW = min(1.5, BW * 0.48); WH = min(FH * 0.62, 2.7); WWS = min(1.5, BWS * 0.48); F = 0.16
AR = (BW - APW) / 2; AYS = min(GFH - AR - 0.5, 2.6); FZ = D / 2 - 0.3          # 拱廊：拱半徑 1.56、起拱 2.6、柱子中心 z
PD, PH = 4.2, 9.0; PWID = PB * BW; Z0 = D / 2; PBW = PWID / PB; PPW = 0.9; PR = (PBW - PPW) / 2; PYS = min(PH - PR - 0.6, 5.6); PEDH = 3.0
TW, TH = 9.0, 9.0; TZ = D / 2 - TW / 2 - 0.5; ROOFH = 4.0
NSEG = 6        # 窗拱的分段（套件也是 6）
NSEG_A = 8      # 拱廊、門廊的大拱
assert NB == 15 and NBS == 7 and abs(BW - 4.0) < 1e-9, (NB, NBS, BW)

B.reset(texres=512)
root = B.group('campus_library', props={'kind': 'campus_library'})
M = {
    # 面磚：實際 2 m 一張（一塊約 22×8 cm，接近二丁掛）。第一版 tile=1.0 把磚縮成一半，近看變成一片紅色雜訊、看不出磚縫
    'wall': L.pbr('ck_wall', 'exterior_wall_cladding_02', tile=2.0, target='#9e5a44', normal=0.8, maps=('diff', 'nor'), rough_value=0.88),
    # 石材：切石塊（實際 3 m 一張、一塊約 0.86×0.57 m；降低彩度＋校正到套件的石材顏色）。
    # 第一版用 concrete_wall_006（清水混凝土）：遊戲裡門廊的柱子滿是褐色水痕，比套件的切石還髒（library_after_porch 第一版）
    'trim': L.pbr('ck_trim', 'sandstone_blocks_08', tile=3.0, sat=0.45, target='#d6cebf', normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
    'trimw': L.pbr('ck_trim_win', 'sandstone_blocks_08', tile=3.0, sat=0.45, target='#d6cebf', maps=('diff',), res=512, rough_value=0.8),   # 同一張顏色貼圖（GLB 裡只存一份）
    'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#9a948a', maps=('diff',), res=256, rough_value=0.7),
    'roof': L.pbr('ck_roof', 'grey_roof_tiles', tile=3.0, target='#4a3a33', normal=0.8, maps=('diff', 'nor'), rough_value=0.82),   # 實際 3 m 一張
    'door': L.pbr('ck_door', 'dark_wood', tile=1.0, target='#4a3426', maps=('diff',), res=256, rough_value=0.6),
    'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
    'frame': L.flat('ck_frame', '#3a2e28', rough=0.55),
    'glass': L.vc_material('ck_glass', rough=0.12),
    'glass_lit': L.vc_material('ck_glass_lit', rough=0.12),
    'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = (CMesh if k.startswith('glass') else Mesh)('lib_' + k, M[k])
    return _acc[k]


class Xf:
    """總圖自己的座標（套件：中心在原點、地面 y=0、正面朝 +z）→ 校園世界座標（ckPlace(lib,100,0,-π/2)：正面朝 −x，對著椰林大道）"""
    def __init__(self, px, pz, ry): self.px, self.pz, self.c, self.s = px, pz, round(math.cos(ry)), round(math.sin(ry))
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)


XF = Xf(100.0, 0.0, -math.pi / 2)


def newell(pts):
    n = [0.0, 0.0, 0.0]
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
    return n


def face(m, pts, want=None):
    """一個平面多邊形（本地座標）；want＝想要的法線方向（本地），反了就把點的順序倒過來"""
    if want is not None:
        n = newell(pts)
        if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]
    return m.bm.faces.new([m.bm.verts.new(g2b(*XF.p(*p))) for p in pts])


def box(m, x0, x1, y0, y1, z0, z1, skip=()):
    """方塊（本地座標、軸對齊），skip：不要的面（'bottom'、'top'、'back'（−z）、'front'（+z）、'left'（−x）、'right'（+x））"""
    F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
          'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
          'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
    for k, (pts, n) in F_.items():
        if k not in skip: face(m, pts, n)


class Fr:
    """立面座標：u＝從外面看往右、v＝往上、d＝往外（法線）；原點 O（本地座標）"""
    def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
    def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
    def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])


def arc(uc, vs, r, n, a0=math.pi, a1=0.0):
    return [(uc + r * math.cos(a0 + (a1 - a0) * k / n), vs + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]


def rect(m, fr, ua, ub, va, vb, d=0.0):
    face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N)


def wall_strip(fr, u0, u1, v0, v1, holes):
    """一段牆（u0..u1 × v0..v1）挖掉窗洞：holes＝[{u, a（半寬）, vb（洞底）, vs（起拱）, arch, vt（方洞的頂）}]"""
    m = acc('wall'); cur = u0
    for h in sorted(holes, key=lambda h: h['u']):
        hl, hr = h['u'] - h['a'], h['u'] + h['a']
        if hl > cur + 1e-4: rect(m, fr, cur, hl, v0, v1)
        if h['vb'] > v0 + 1e-4: rect(m, fr, hl, hr, v0, h['vb'])
        if h['arch']:
            P = arc(h['u'], h['vs'], h['a'], NSEG)
            for k in range(NSEG):
                (ua, va), (ub, vb) = P[k], P[k + 1]
                face(m, [fr.p(ua, va), fr.p(ub, vb), fr.p(ub, v1), fr.p(ua, v1)], fr.N)
        elif v1 > h['vt'] + 1e-4: rect(m, fr, hl, hr, h['vt'], v1)
        cur = hr
    if u1 > cur + 1e-4: rect(m, fr, cur, u1, v0, v1)


GL_TOP, GL_BOT = (0.26, 0.31, 0.36), (0.06, 0.08, 0.10)   # 玻璃的上下顏色（線性；上面反射天空、下面暗）


def glass_face(fr, pts_uv, d, lit, vb, vt):
    m = acc('glass_lit' if lit else 'glass'); f = face(m, [fr.p(u, v, d) for u, v in pts_uv], fr.N)
    for lp in f.loops:
        t = max(0.0, min(1.0, ((lp.vert.co.z) - vb) / max(1e-6, vt - vb)))   # Blender z＝遊戲 y（高度）
        lp[m.col] = [GL_BOT[i] + (GL_TOP[i] - GL_BOT[i]) * t for i in range(3)] + [1.0]


def strip(m, fr, a, b, d0, d1, want):
    """沿著立面上的一條邊（a→b，(u,v)）從深度 d0 到 d1 的側面；want＝想要的法線（立面座標 du,dv,dd）"""
    face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))


def window(fr, u, vb, ww, wh, f, lit, rect_=False, dep=0.30, proud=0.06, door=False):
    """一扇窗（窗洞已經在牆上挖好，外框＝石材窗框外緣）：石材窗框（外凸 proud）＋外側面、窗洞內側（深 dep）、深色窗框、直櫺與橫櫺、玻璃、窗台。
    rect_：方窗（vs＝洞口頂）；door：門（沒有玻璃、窗台、窗洞底、下框、直櫺）"""
    r = ww / 2; ro = r + f; vs = vb + wh if rect_ else vb + wh - r; t = 0.06; tw = acc('trimw'); fm = acc('frame')
    vt = vb + wh                               # 拱頂（內側）
    # 石材窗框正面
    rect(tw, fr, u - ro, u - r, vb, vs, proud); rect(tw, fr, u + r, u + ro, vb, vs, proud)
    if rect_:
        rect(tw, fr, u - ro, u + ro, vs, vs + f, proud)
    else:
        I, O = arc(u, vs, r, NSEG), arc(u, vs, ro, NSEG)
        for k in range(NSEG): face(tw, [fr.p(*I[k], proud), fr.p(*I[k + 1], proud), fr.p(*O[k + 1], proud), fr.p(*O[k], proud)], fr.N)
    # 窗框外側面（牆面到外凸的正面）
    strip(tw, fr, (u - ro, vb), (u - ro, vs), 0, proud, (-1, 0, 0)); strip(tw, fr, (u + ro, vb), (u + ro, vs), 0, proud, (1, 0, 0))
    if rect_: strip(tw, fr, (u - ro, vs + f), (u + ro, vs + f), 0, proud, (0, 1, 0))
    else:
        for k in range(NSEG):
            a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, O[k], O[k + 1], 0, proud, (math.cos(a), math.sin(a), 0))
    # 窗洞內側（從窗框正面到玻璃後面 1 cm：玻璃的邊夾在窗洞裡。第一版剛好停在玻璃前面，斜看時玻璃和窗框之間有一條縫，
    # 看得到空的建築裡面、後面的草地（library_after_arcade 第一版：拱廊裡的窗邊一條綠線））
    de = -dep - 0.01
    strip(tw, fr, (u - r, vb), (u - r, vs), proud, de, (1, 0, 0)); strip(tw, fr, (u + r, vb), (u + r, vs), proud, de, (-1, 0, 0))
    if rect_: strip(tw, fr, (u - r, vs), (u + r, vs), proud, de, (0, -1, 0))
    else:
        for k in range(NSEG):
            a = math.pi * (1 - (k + 0.5) / NSEG); strip(tw, fr, I[k], I[k + 1], proud, de, (-math.cos(a), -math.sin(a), 0))
    if not door: strip(tw, fr, (u - r, vb), (u + r, vb), -0.06, de, (0, 1, 0))           # 窗洞底（窗台蓋住外面那一段）
    # 深色窗框（玻璃外圈）、直櫺、橫櫺
    rect(fm, fr, u - r, u - r + t, vb, vs, -dep + 0.005); rect(fm, fr, u + r - t, u + r, vb, vs, -dep + 0.005)
    if not door: rect(fm, fr, u - r + t, u + r - t, vb, vb + t, -dep + 0.005)
    if rect_: rect(fm, fr, u - r, u + r, vs - t, vs, -dep + 0.005)
    else:
        Ii, Io = arc(u, vs, r - t, NSEG), arc(u, vs, r, NSEG)
        for k in range(NSEG): face(fm, [fr.p(*Ii[k], -dep + 0.005), fr.p(*Ii[k + 1], -dep + 0.005), fr.p(*Io[k + 1], -dep + 0.005), fr.p(*Io[k], -dep + 0.005)], fr.N)
    if door: return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': False, 'vt': vs + f}
    top = vs if rect_ else vt - t
    rect(fm, fr, u - 0.03, u + 0.03, vb + t, top, -dep + 0.035)                                   # 直櫺（正面＋兩側）
    strip(fm, fr, (u - 0.03, vb + t), (u - 0.03, top), -dep + 0.035, -dep, (-1, 0, 0)); strip(fm, fr, (u + 0.03, vb + t), (u + 0.03, top), -dep + 0.035, -dep, (1, 0, 0))
    if not rect_:
        rect(fm, fr, u - r + t, u + r - t, vs - 0.03, vs + 0.03, -dep + 0.035)                    # 橫櫺（起拱線）
        strip(fm, fr, (u - r + t, vs + 0.03), (u + r - t, vs + 0.03), -dep + 0.035, -dep, (0, 1, 0))
    # 玻璃：整個窗洞（邊緣壓在深色窗框後面，斜看也沒有縫）
    if rect_: pts = [(u - r, vb), (u + r, vb), (u + r, vs), (u - r, vs)]
    else: pts = [(u - r, vb), (u + r, vb)] + arc(u, vs, r, NSEG, 0.0, math.pi)[:]
    glass_face(fr, pts, -dep - 0.005, lit, vb, vt)
    # 窗台（外凸）
    x0, x1 = u - ro - 0.09, u + ro + 0.09
    for (pts_, n) in (([fr.p(x0, vb, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 1, 0)),
                      ([fr.p(x0, vb - 0.1, 0.26), fr.p(x1, vb - 0.1, 0.26), fr.p(x1, vb, 0.26), fr.p(x0, vb, 0.26)], (0, 0, 1)),
                      ([fr.p(x0, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb - 0.1, 0.26), fr.p(x0, vb - 0.1, 0.26)], (0, -1, 0)),
                      ([fr.p(x0, vb - 0.1, -0.06), fr.p(x0, vb, -0.06), fr.p(x0, vb, 0.26), fr.p(x0, vb - 0.1, 0.26)], (-1, 0, 0)),
                      ([fr.p(x1, vb - 0.1, -0.06), fr.p(x1, vb, -0.06), fr.p(x1, vb, 0.26), fr.p(x1, vb - 0.1, 0.26)], (1, 0, 0))):
        face(tw, pts_, fr.dirv(*n))
    return {'u': u, 'a': ro, 'vb': vb, 'vs': vs, 'arch': not rect_, 'vt': vs + f}


def lit_hash(*k):
    h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
    return h - math.floor(h) > 0.3          # 約七成的窗晚上亮（套件也是）


def sill_y(fl): return 1.2 if fl == 0 else GFH + (fl - 1) * FH + 0.75
def floor_v(fl): return (0.0, GFH) if fl == 0 else (GFH + (fl - 1) * FH, GFH + fl * FH)


def facade(fr, u0, u1, centers, fl, ww, wh, sid, u_range=None):
    v0, v1 = floor_v(fl); holes = []
    for j, uc in enumerate(centers):
        holes.append(window(fr, uc, sill_y(fl), ww, wh, F, lit_hash(sid, fl, j)))
    a, b = u_range if u_range else (u0, u1)
    wall_strip(fr, a, b, v0, v1, holes)


# ---------------- 外牆＋窗 ----------------
FRONT = Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)); BACK = Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1))
RIGHT = Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)); LEFT = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0))
bay_x = [-W / 2 + BW * (i + 0.5) for i in range(NB)]
side_z = [-D / 2 + BWS * (j + 0.5) for j in range(NBS)]
for fl in range(NF):
    if fl > 0: facade(FRONT, -W / 2, W / 2, bay_x, fl, WW, WH, 1)
    facade(BACK, -W / 2, W / 2, [-x for x in bay_x], fl, WW, WH, 2)     # 背面：u＝−x
    zs = [z for z in side_z if not (fl == 0 and z > D / 2 - AD - 0.8)]
    rng = (-(D / 2 - AD), D / 2) if fl == 0 else None                    # 一樓：側牆只到拱廊後面（拱廊兩端是開的）
    facade(RIGHT, -D / 2, D / 2, sorted(-z for z in zs), fl, WWS, WH, 3, rng)
    facade(LEFT, -D / 2, D / 2, sorted(zs), fl, WWS, WH, 4, (-D / 2, D / 2 - AD) if fl == 0 else None)

# ---------------- 一樓拱廊 ----------------
ARC_BACK = Fr((0, 0, D / 2 - AD), (1, 0, 0), (0, 0, 1))      # 拱廊裡面的牆（z=10）
IWW, IWH = min(1.4, BW * 0.4), 2.5
holes = []
for i, x in enumerate(bay_x):
    if abs(i - (NB - 1) / 2) < 0.6:   # 中央：大門（雙開木門＋石材門框＋門楣）
        holes.append(window(ARC_BACK, x, 0.0, 1.8, 2.9, 0.15, False, rect_=True, dep=0.15, door=True))
        dm = acc('door'); rect(dm, ARC_BACK, x - 0.9, x + 0.9, 0.0, 2.9, -0.15)
        fm = acc('frame'); rect(fm, ARC_BACK, x - 0.025, x + 0.025, 0.0, 2.9, -0.14)
        for sx in (-1, 1): rect(fm, ARC_BACK, x + sx * 0.12 - 0.02, x + sx * 0.12 + 0.02, 1.0, 1.35, -0.12)   # 門把
        box(acc('trimw'), x - 1.2, x + 1.2, 3.05, 3.25, D / 2 - AD, D / 2 - AD + 0.18, skip=('back',))          # 門楣
    else:
        holes.append(window(ARC_BACK, x, 0.9, IWW, IWH, 0.12, lit_hash(5, i)))
wall_strip(ARC_BACK, -W / 2, W / 2, 0.0, GFH, holes)
# 拱廊兩端：天花板到樓板腰帶之間的端牆
for sx in (-1, 1): face(acc('wall'), [(sx * W / 2, GFH - 0.3, D / 2 - AD), (sx * W / 2, GFH - 0.3, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - 0.6), (sx * W / 2, GFH, D / 2 - AD)], (sx, 0, 0))
# 柱墩（面磚）＋柱頭、柱腳（石材）
wm, tm = acc('wall'), acc('trim')
for i in range(NB + 1):
    x = -W / 2 + BW * i; corner = i in (0, NB)
    # 轉角的柱墩一路到樓板腰帶（套件的轉角柱子上面是空的，從側面看像一根柱子頂著空氣）
    box(wm, x - APW / 2, x + APW / 2, 0.4, GFH if corner else AYS - 0.11, FZ - 0.3, FZ + 0.3, skip=('bottom', 'top'))
    box(tm, x - APW / 2 - 0.08, x + APW / 2 + 0.08, AYS - 0.11, AYS + 0.11, FZ - 0.39, FZ + 0.39)   # 柱頭正面比拱圈石材（外凸 6 cm）再凸一點：同一平面會閃爍
    box(tm, x - APW / 2 - 0.06, x + APW / 2 + 0.06, 0.0, 0.4, FZ - 0.35, FZ + 0.35, skip=('bottom',))


def arch_bay(m, mring, xc, bw, ys, top, r, zf, zb, n=NSEG_A, ring=0.14, clip=(-1e9, 1e9)):
    """一個開間的拱圈牆：正面（zf）、背面（zb）、拱腹；正面加石材拱圈。clip：左右兩塊不超出這個範圍（被轉角的柱子、門廊側牆蓋住的部分不做，避免同一平面重疊）"""
    for (z, nz) in ((zf, 1), (zb, -1)):
        # 左右兩塊（拱腳到開間邊緣）＋拱上面
        for (a, b) in ((max(clip[0], xc - bw / 2), xc - r), (xc + r, min(clip[1], xc + bw / 2))):
            if b - a > 1e-4: face(m, [(a, ys, z), (b, ys, z), (b, top, z), (a, top, z)], (0, 0, nz))
        P = arc(xc, ys, r, n)
        for k in range(n):
            (xa, ya), (xb, yb) = P[k], P[k + 1]
            face(m, [(xa, ya, z), (xb, yb, z), (xb, top, z), (xa, top, z)], (0, 0, nz))
    P = arc(xc, ys, r, n)
    for k in range(n):
        (xa, ya), (xb, yb) = P[k], P[k + 1]; mid = math.pi * (1 - (k + 0.5) / n)
        face(m, [(xa, ya, zb), (xb, yb, zb), (xb, yb, zf), (xa, ya, zf)], (-math.cos(mid), -math.sin(mid), 0))
    if mring:
        O = arc(xc, ys, r + ring, n)
        for k in range(n):
            face(mring, [(P[k][0], P[k][1], zf + 0.06), (P[k + 1][0], P[k + 1][1], zf + 0.06), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (0, 0, 1))
            mid = math.pi * (1 - (k + 0.5) / n)
            face(mring, [(O[k][0], O[k][1], zf), (O[k + 1][0], O[k + 1][1], zf), (O[k + 1][0], O[k + 1][1], zf + 0.06), (O[k][0], O[k][1], zf + 0.06)], (math.cos(mid), math.sin(mid), 0))


for i, x in enumerate(bay_x): arch_bay(wm, tm, x, BW, AYS, GFH, AR, FZ + 0.3, FZ - 0.3, clip=(-W / 2 + APW / 2, W / 2 - APW / 2))
face(acc('ceil'), [(-W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, D / 2 - AD), (W / 2, GFH - 0.3, FZ - 0.3), (-W / 2, GFH - 0.3, FZ - 0.3)], (0, -1, 0))   # 拱廊天花板
face(acc('base'), [(-W / 2 - 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 - AD), (W / 2 + 0.4, 0.04, D / 2 + 0.1), (-W / 2 - 0.4, 0.04, D / 2 + 0.1)], (0, 1, 0))   # 拱廊地坪

# ---------------- 勒腳（花崗石，0.7 m 高、外凸 8 cm）；拱廊裡的大門那一段留開口 ----------------
bm_ = acc('base'); e = 0.08
for (x0, x1) in ((-W / 2 - e, -1.05), (1.05, W / 2 + e)): box(bm_, x0, x1, 0, 0.7, D / 2 - AD - 0.02, D / 2 - AD + e, skip=('bottom', 'back'))
box(bm_, -W / 2 - e, W / 2 + e, 0, 0.7, -D / 2 - e, -D / 2 + 0.02, skip=('bottom', 'front'))
for sx in (-1, 1):
    x0, x1 = (W / 2 - 0.02, W / 2 + e) if sx > 0 else (-W / 2 - e, -W / 2 + 0.02)
    box(bm_, x0, x1, 0, 0.7, -D / 2 + 0.02, D / 2 - AD - 0.02, skip=('bottom', 'left' if sx > 0 else 'right', 'front', 'back'))   # 夾在背面、拱廊那兩段中間（轉角不重疊）

# ---------------- 樓層腰帶、簷口（三段線腳）----------------
def ring_box(m, y0, y1, o, w=W, d=D, zc=0.0, skip=('bottom',)):
    """沿建築四周的一圈帶子（外凸 o）：四個方塊、轉角重疊"""
    hx, hz = w / 2 + o, d / 2 + o
    box(m, -hx, hx, y0, y1, zc + d / 2 - 0.02, zc + hz, skip=skip + ('back',)); box(m, -hx, hx, y0, y1, zc - hz, zc - d / 2 + 0.02, skip=skip + ('front',))
    # 側面的兩塊夾在正面、背面那兩塊中間（轉角不重疊：重疊的面在同一平面上會閃爍）
    box(m, w / 2 - 0.02, hx, y0, y1, zc - d / 2 + 0.02, zc + d / 2 - 0.02, skip=skip + ('left', 'front', 'back')); box(m, -hx, -w / 2 + 0.02, y0, y1, zc - d / 2 + 0.02, zc + d / 2 - 0.02, skip=skip + ('right', 'front', 'back'))


for i in range(1, NF): ring_box(tm, GFH + (i - 1) * FH - 0.11, GFH + (i - 1) * FH + 0.11, 0.12, skip=())


def cornice(m, y, w, d, zc=0.0, prof=((0.0, -0.35), (0.12, -0.35), (0.12, -0.1), (0.35, 0.1), (0.35, 0.5))):
    """線腳簷口：剖面（外凸 o、相對高度 dy）一段一段沿四周繞一圈（轉角斜接）"""
    hx, hz = w / 2, d / 2
    for (o0, y0), (o1, y1) in zip(prof, prof[1:]):
        for (ax, az, bx, bz, nx, nz) in ((-1, 1, 1, 1, 0, 1), (1, -1, -1, -1, 0, -1), (1, 1, 1, -1, 1, 0), (-1, -1, -1, 1, -1, 0)):
            pa0 = (ax * (hx + o0), y + y0, zc + az * (hz + o0)); pb0 = (bx * (hx + o0), y + y0, zc + bz * (hz + o0))
            pa1 = (ax * (hx + o1), y + y1, zc + az * (hz + o1)); pb1 = (bx * (hx + o1), y + y1, zc + bz * (hz + o1))
            dy, do = y1 - y0, o1 - o0
            face(m, [pa0, pb0, pb1, pa1], (nx * dy, -do, nz * dy))   # 剖面上往外走的線段：法線＝(dy, −do)（往外、往下）


cornice(tm, H, W, D)

# ---------------- 四坡屋頂（屋瓦）＋簷底板＋屋脊 ----------------
def hip_roof(m, w, d, rh, y, zc=0.0, soffit_in=(0, 0)):
    hw, hd = w / 2, d / 2; r = max(0.0, (w - d) / 2)
    A, Bp, C, Dp = (-hw, y, zc + hd), (hw, y, zc + hd), (hw, y, zc - hd), (-hw, y, zc - hd); R1, R2 = (-r, y + rh, zc), (r, y + rh, zc)
    face(m, [A, Bp, R2, R1] if r > 0 else [A, Bp, R2], (0, 1, 1)); face(m, [C, Dp, R1, R2] if r > 0 else [C, Dp, R1], (0, 1, -1))
    face(m, [Bp, C, R2], (1, 1, 0)); face(m, [Dp, A, R1], (-1, 1, 0))
    sm = acc('ceil'); iw, idp = soffit_in
    for (p, q, pi, qi) in ((A, Bp, (-iw, y, zc + idp), (iw, y, zc + idp)), (Bp, C, (iw, y, zc + idp), (iw, y, zc - idp)), (C, Dp, (iw, y, zc - idp), (-iw, y, zc - idp)), (Dp, A, (-iw, y, zc - idp), (-iw, y, zc + idp))):
        face(sm, [p, q, qi, pi], (0, -1, 0))                                 # 屋簷底下的簷底板
    for (p, q, n) in ((A, Bp, (0, 0, 1)), (Bp, C, (1, 0, 0)), (C, Dp, (0, 0, -1)), (Dp, A, (-1, 0, 0))):
        face(m, [(p[0], y - 0.15, p[2]), (q[0], y - 0.15, q[2]), q, p], n)   # 屋簷前緣
    return R1, R2


R1, R2 = hip_roof(acc('roof'), W + 1.6, D + 1.6, ROOFH, H + 0.5, 0.0, (W / 2 + 0.35, D / 2 + 0.35))
box(acc('frame'), R1[0] - 0.15, R2[0] + 0.15, R1[1] - 0.05, R1[1] + 0.17, -0.16, 0.16, skip=('bottom',))

# ---------------- 中央塔樓（面磚、四面各兩扇拱窗、線腳簷口、四坡屋頂）----------------
TY = H
TF = Fr((0, 0, TZ + TW / 2), (1, 0, 0), (0, 0, 1)); TB = Fr((0, 0, TZ - TW / 2), (-1, 0, 0), (0, 0, -1))
TR = Fr((TW / 2, 0, TZ), (0, 0, -1), (1, 0, 0)); TL = Fr((-TW / 2, 0, TZ), (0, 0, 1), (-1, 0, 0))
for si, fr in enumerate((TF, TB, TR, TL)):
    hs = [window(fr, k * TW * 0.22, TY + TH - 4.6, 1.3, 3.2, F, lit_hash(9, si, k)) for k in (-1, 1)]
    wall_strip(fr, -TW / 2, TW / 2, TY, TY + TH, hs)
ring_box(tm, TY + 0.48, TY + 0.73, 0.15, w=TW, d=TW, zc=TZ)
cornice(tm, TY + TH, TW, TW, TZ, ((0.0, -0.3), (0.1, -0.3), (0.1, -0.08), (0.28, 0.08), (0.28, 0.42)))
hip_roof(acc('roof'), TW + 1.2, TW + 1.2, 3.2, TY + TH + 0.42, TZ, (TW / 2 + 0.28, TW / 2 + 0.28))

# ---------------- 中央入口門廊（石材；正面 5 拱、兩側實牆、檐部、三角山牆、天花板、地坪、招牌）----------------
pzf, pzb = Z0 + PD, Z0 + PD - 0.9
for i in range(1, PB):
    x = -PWID / 2 + PBW * i
    box(tm, x - PPW / 2, x + PPW / 2, 0.0, PYS - 0.12, pzb, pzf, skip=('bottom', 'top'))
    box(tm, x - PPW / 2 - 0.08, x + PPW / 2 + 0.08, PYS - 0.12, PYS + 0.1, pzb - 0.09, pzf + 0.09)
for i in range(PB): arch_bay(tm, acc('trimw'), -PWID / 2 + PBW * (i + 0.5), PBW, PYS, PH, PR, pzf, pzb, ring=0.16, clip=(-PWID / 2 + 0.45, PWID / 2 - 0.45))
for sx in (-1, 1):
    x0, x1 = sx * PWID / 2 - 0.45, sx * PWID / 2 + 0.45
    box(tm, x0, x1, 0.0, PH, Z0, pzf, skip=('bottom', 'top', 'back'))
box(tm, -PWID / 2 - 0.6, PWID / 2 + 0.6, PH, PH + 0.45, Z0 - 0.15, Z0 + PD + 0.15, skip=('back',))           # 檐部
hw = PWID / 2 + 0.6; py0 = PH + 0.45; pz1 = Z0 + PD + 0.15
face(tm, [(-hw, py0, pz1), (hw, py0, pz1), (0, py0 + PEDH, pz1)], (0, 0, 1))                                 # 山牆正面
face(tm, [(-hw, py0, Z0), (-hw, py0, pz1), (0, py0 + PEDH, pz1), (0, py0 + PEDH, Z0)], (-PEDH, hw, 0))      # 山牆兩坡
face(tm, [(hw, py0, Z0), (0, py0 + PEDH, Z0), (0, py0 + PEDH, pz1), (hw, py0, pz1)], (PEDH, hw, 0))
for sx in (-1, 1):                                                                                          # 山牆斜邊的線腳（外凸 12 cm）
    a, b = (sx * hw, py0), (0.0, py0 + PEDH); L_ = math.hypot(b[0] - a[0], b[1] - a[1]); nx, ny = -(b[1] - a[1]) / L_ * sx, abs(b[0] - a[0]) / L_
    off = 0.14
    face(tm, [(a[0], a[1], pz1 + 0.12), (b[0], b[1], pz1 + 0.12), (b[0] + nx * off, b[1] + ny * off, pz1 + 0.12), (a[0] + nx * off, a[1] + ny * off, pz1 + 0.12)], (0, 0, 1))
    face(tm, [(a[0], a[1], pz1), (b[0], b[1], pz1), (b[0], b[1], pz1 + 0.12), (a[0], a[1], pz1 + 0.12)], (-nx, -ny, 0))
face(acc('ceil'), [(-PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, Z0), (PWID / 2, PH - 0.15, pzb), (-PWID / 2, PH - 0.15, pzb)], (0, -1, 0))
box(acc('base'), -PWID / 2 - 0.3, PWID / 2 + 0.3, 0.0, 0.08, Z0 - 0.3, Z0 + PD + 0.9, skip=('bottom',))          # 門廊地坪（比地面高 8 cm）
# 招牌：中央拱上方、檐部下方
sy = PYS + PR + (PH - PYS - PR) / 2 + 0.05; sw = 5.0
box(tm, -sw / 2 - 0.15, sw / 2 + 0.15, sy - 0.58, sy + 0.58, pzf, pzf + 0.06, skip=('back',))
plate = Mesh('PLATE_FACE_LIB', M['board'])
face(plate, [(-sw / 2, sy - 0.45, pzf + 0.065), (sw / 2, sy - 0.45, pzf + 0.065), (sw / 2, sy + 0.45, pzf + 0.065), (-sw / 2, sy + 0.45, pzf + 0.065)], (0, 0, 1))

# ---------------- 完成 ----------------
for k, m in _acc.items():
    if k.startswith('glass'): m.finish(root, uv=False)
    else: m.finish(root, uv=True)
uv01(plate.finish(root, uv=True, props={'text': '總圖書館', 'bg': '#d8d0c0', 'color': '#3b2a1e', 'serif': 1}))
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', info)
