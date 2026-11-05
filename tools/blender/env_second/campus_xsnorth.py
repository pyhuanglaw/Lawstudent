"""校園西北角：望月台（新月台）、體育館的正式外觀 → GLB（校園世界座標）。LAWWW2-C 2026-11-05（XS-NORTH-EXT-1105）
  /opt/blenv/bin/python tools/blender/env_second/campus_xsnorth.py -- --set moon|gym [--out 輸出.glb]

使用者 11-05：「新月台…要很靠新生南路那門…新月台也貼著上方的最左邊」「體育館實際上是在新生南路辛亥路交接口 遊戲中就改到新月台法學院中間」。
位置、佔地照 src/zones3d.js 的 XSG（XS-GATE-NORTH-1105）：
  望月台 XSG.moon (−123.2, −140.4)～(−106.4, −127.2)，CK.modern 轉 π/2（正面朝東、對著側門內的小廣場）；
  體育館 XSG.gym (−90, −140.4)～(−60, −126.4)，CK.modern 不轉（正面朝南）。
  本體範圍和套件一樣 → 導航阻擋、鏡頭碰撞、門口互動點（體育館 (−75, −125)）不用改。
**像但不照抄（D136）**：v2（同日，使用者「你去台大官網找新月台照片 新體育館照片!!!!」）照官網照片重做；照片只在工作區看、不進 repo，網址寫在
  docs/art-rebuild/second_ai/wip/xs_wincard_1105/README.md。v1 是照文字猜的（白牆木簷、筒形屋頂），和照片不像，已換掉。
  望月台：紅磚兩層、東南角玻璃店面＋二樓露台、正面古銅色招牌＋樓梯間直條開口（build_moon 的說明）。
  體育館：鮭魚粉磁磚基座、二樓方窗三角格柵、銀白懸挑橢圓環＋一圈長窗、白色薄膜淺圓頂＋鋼桁架拱、藍綠色圓柱（build_gym 的說明）。
材質名稱沿用校園地標的約定（attachWenzhouModel）：ck_glass（夜間窗燈）、匾額 PLATE_FACE_*。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
from campus_pavilion import emit_image, add_emit, GL_TOP, GL_BOT, U_DARK, U_LIT   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
SET = arg('--set', 'moon')
MOON = dict(rect=(-123.2, -140.4, -106.4, -127.2), ry=math.pi / 2, out='assets/models/env/second_ai/campus_moon.glb', name='campus_moon')
GYM = dict(rect=(-90.0, -140.4, -60.0, -126.4), ry=0.0, out='assets/models/env/second_ai/campus_gymext.glb', name='campus_gymext')


class Kit:
    """和 campus_modern.py 同一套小工具：本地座標（正面 +z）→ 校園座標；面的法線照 want 翻"""
    def __init__(self, place, M, prefix):
        self.px, self.pz, ry = place; self.c, self.s = round(math.cos(ry)), round(math.sin(ry)); self.M = M; self.accs = {}; self.prefix = prefix
    def XF(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def acc(self, k):
        if k not in self.accs: self.accs[k] = (CMesh if k == 'glass' else Mesh)(self.prefix + k, self.M[k])
        return self.accs[k]
    @staticmethod
    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n
    def face(self, m, pts, want=None, uvs=None, col=None):
        if want is not None:
            n = self.newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs; col = col[::-1] if col else col
        f = m.bm.faces.new([m.bm.verts.new(g2b(*self.XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        if col:
            for lp, c in zip(f.loops, col): lp[m.col] = list(c) + [1.0]
        return f
    def box(self, m, x0, x1, y0, y1, z0, z1, skip=()):
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: self.face(m, pts, n)
    def glass(self, fr, a, b, va, vb, d, lit):
        u = U_LIT if lit else U_DARK
        self.rect(self.acc('glass'), fr, a, b, va, vb, d, [(u, 0), (u, 0), (u, 1), (u, 1)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
    def rect(self, m, fr, ua, ub, va, vb, d=0.0, uvs=None, col=None): self.face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N, uvs, col)
    def strip(self, m, fr, a, b, d0, d1, want): self.face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))


class Fr:
    """立面座標：u＝從外面看往右、v＝往上、d＝往外；原點 O"""
    def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
    def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
    def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])


def faces4(W, D):
    return (Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)), Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1)),
            Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)), Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0)))


def lit_hash(*k):
    h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
    return h - math.floor(h) > 0.35


UVK = ('brick', 'conc', 'tile', 'tile2')


def finish(root, K, plates, out):
    for k, m in K.accs.items(): m.finish(root, uv=(k in UVK))
    for plate, props in plates: uv01(plate.finish(root, uv=True, props=props))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    return info


def setup(S):
    r = S['rect']; ry = S['ry']; cx, cz = (r[0] + r[2]) / 2, (r[1] + r[3]) / 2; sx, sz = r[2] - r[0], r[3] - r[1]
    W, D = (sz, sx) if abs(math.sin(ry)) > 0.5 else (sx, sz)   # 本地 x 寬、z 深（轉 90° 時世界 x／z 對調）
    return (cx, cz, ry), W, D


def glass_mat():
    g = L.vc_material('ck_glass', rough=0.12); add_emit(g, emit_image('win_lit_grad', True)); return g


def mullions(K, m, fr, ua, ub, va, vb, step, d=0.03, w=0.05, skip=()):
    n = max(1, round((ub - ua) / step)); s = (ub - ua) / n
    for k in range(1, n):
        if k in skip: continue
        u = ua + s * k; K.rect(m, fr, u - w, u + w, va, vb, d)
    K.rect(m, fr, ua, ub, va, va + w * 1.4, d); K.rect(m, fr, ua, ub, vb - w * 1.4, vb, d)
    return n, s


def band_glass(K, fr, ua, ub, va, vb, step, sid, d=0.0, lit_all=False):
    n = max(1, round((ub - ua) / step)); s = (ub - ua) / n
    for k in range(n): K.glass(fr, ua + s * k, ua + s * (k + 1), va, vb, d, lit_all or lit_hash(sid, k))


def tube(K, m, a, b, r):
    """細桿（本地座標 a→b、方形斷面 r）：四個側面"""
    d = [b[i] - a[i] for i in range(3)]; ln = math.sqrt(sum(c * c for c in d)) or 1.0; d = [c / ln for c in d]
    up = (0, 1, 0) if abs(d[1]) < 0.9 else (1, 0, 0)
    u = (d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]); ul = math.sqrt(sum(c * c for c in u)); u = [c / ul for c in u]
    v = (d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0])
    for s0, s1 in ((u, v), (v, [-c for c in u]), ([-c for c in u], [-c for c in v]), ([-c for c in v], u)):
        p = lambda q, s, t: tuple(q[i] + r * (s[i] + t[i]) for i in range(3))
        pts = [p(a, s0, [-c for c in s1]), p(b, s0, [-c for c in s1]), p(b, s0, s1), p(a, s0, s1)]
        K.face(m, pts, tuple(s0))


# ---------------- 望月台（新月台） ----------------
def build_moon(out):
    """照臺大官網的開幕照片（README 有網址）：紅磚兩層、平屋頂灰色金屬收邊、灰色石材牆腳；
    一樓角落淡藍框玻璃店面、上面清水混凝土帶＋黑色細帶、二樓露台黑色橫條欄杆；正面大片紅磚牆＋古銅色背光招牌、招牌旁一道深色直條開口（樓梯間）。
    本地：正面 +z＝世界東（對著側門內的小廣場）、−x＝世界南（停車場）；角落店面放在東南角。"""
    place, W, D = setup(MOON); GFH, H, PL = 4.4, 8.4, 0.45; TER = GFH + 0.5   # 露台地坪
    B.reset(texres=512); root = B.group(MOON['name'], props={'kind': MOON['name']})
    M = {'brick': L.pbr('ck_moon_brick', 'red_brick', tile=1.6, target='#9e5139', sat=0.85, normal=0.45, maps=('diff', 'nor'), rough_value=0.86),
         'conc': L.pbr('ck_moon_conc', 'granular_concrete', tile=1.4, target='#a7a59f', normal=0.25, maps=('diff', 'nor'), rough_value=0.9),
         'metal': L.flat('ck_moon_metal', '#34383c', rough=0.45, metal=0.35),
         'cope': L.flat('ck_moon_cope', '#a4a8ab', rough=0.4, metal=0.3),
         'frame': L.flat('ck_moon_frame', '#7fb1d9', rough=0.5),
         'glass': glass_mat(), 'board': L.flat('ck_board', '#f4f2ec', rough=0.8)}
    K = Kit(place, M, 'moon_'); bm, cm, mm = K.acc('brick'), K.acc('conc'), K.acc('metal')
    FRONT, BACK, RIGHT, LEFT = faces4(W, D)
    CX, CZ = 4.4, 5.6; x1, z1 = -W / 2 + CX, D / 2 - CZ          # 東南角挖掉的角落（x −W/2..x1、z z1..D/2）
    # 牆腳（灰色石材）：外圈一整圈
    for fr, half in ((FRONT, W / 2), (BACK, W / 2), (RIGHT, D / 2), (LEFT, D / 2)):
        K.rect(cm, fr, -half - 0.04, half + 0.04, 0, PL, 0.04)
        K.strip(cm, fr, (-half - 0.04, PL), (half + 0.04, PL), 0, 0.04, (0, 1, 0))
    # 紅磚量體：背面（西）、北面整面；南面只到角落；正面（東）在角落以北
    K.rect(bm, BACK, -W / 2, W / 2, PL, H); K.rect(bm, RIGHT, -D / 2, D / 2, PL, H)
    K.rect(bm, LEFT, -D / 2, z1, PL, H)
    # 正面：深色直條開口（樓梯間；寬 1.5、到 7.2 m）＋清水混凝土框
    sa, sb, st = W / 2 - 3.4, W / 2 - 1.9, 7.2
    K.rect(bm, FRONT, x1, sa, PL, H); K.rect(bm, FRONT, sb, W / 2, PL, H); K.rect(bm, FRONT, sa, sb, st, H)
    for a_, b_, want in (((sa, PL), (sa, st), (1, 0, 0)), ((sb, PL), (sb, st), (-1, 0, 0)), ((sa, st), (sb, st), (0, -1, 0))): K.strip(cm, FRONT, a_, b_, 0, -0.9, want)
    K.glass(FRONT, sa, sb, PL, st, -0.9, False)
    for yb in (1.5, 2.6, 4.9, 6.0): K.rect(mm, FRONT, sa, sb, yb, yb + 0.05, -0.85)          # 樓梯欄杆
    K.rect(mm, FRONT, sa, sb, GFH + 0.2, GFH + 0.45, -0.88)                                     # 樓梯平台的板
    K.box(cm, sa - 0.22, sa, PL, st + 0.25, D / 2, D / 2 + 0.12, skip=('bottom', 'back')); K.box(cm, sb, sb + 0.22, PL, st + 0.25, D / 2, D / 2 + 0.12, skip=('bottom', 'back'))
    K.box(cm, sa, sb, st, st + 0.25, D / 2, D / 2 + 0.12, skip=('back',))
    # 招牌（古銅色底、背光）：開口左邊、一樓上半
    plate = Mesh('PLATE_FACE_MOON', M['board']); pu0, pu1, pv0, pv1 = sa - 4.2, sa - 0.8, 2.55, 3.45
    K.box(mm, pu0 - 0.06, pu1 + 0.06, pv0 - 0.06, pv1 + 0.06, D / 2, D / 2 + 0.06, skip=('back',))
    K.face(plate, [(pu0, pv0, D / 2 + 0.065), (pu1, pv0, D / 2 + 0.065), (pu1, pv1, D / 2 + 0.065), (pu0, pv1, D / 2 + 0.065)], (0, 0, 1))
    # 角落：一樓淡藍框玻璃（正面、南面兩邊轉角）
    CF = Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)); CS = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0))
    gy0, gy1 = PL, 3.55
    band_glass(K, CF, -W / 2, x1, gy0, gy1, 1.4, 11); band_glass(K, CS, z1, D / 2, gy0, gy1, 1.4, 12)
    mullions(K, K.acc('frame'), CF, -W / 2, x1, gy0, gy1, 1.4, w=0.045); mullions(K, K.acc('frame'), CS, z1, D / 2, gy0, gy1, 1.4, w=0.045)
    K.box(K.acc('frame'), -W / 2 - 0.02, -W / 2 + 0.14, gy0, gy1, D / 2 - 0.14, D / 2 + 0.02, skip=('bottom', 'top'))   # 轉角柱
    # 清水混凝土帶（3.55～TER）＋黑色細帶；露台地坪
    for fr, ua, ub in ((CF, -W / 2, x1), (CS, z1, D / 2)):
        K.rect(cm, fr, ua, ub, gy1, TER, 0.0); K.rect(mm, fr, ua, ub, gy1 + 0.18, gy1 + 0.42, 0.012)
    K.face(cm, [(-W / 2, TER, z1), (x1, TER, z1), (x1, TER, D / 2), (-W / 2, TER, D / 2)], (0, 1, 0))
    K.face(cm, [(-W / 2, gy1, z1), (x1, gy1, z1), (x1, gy1, D / 2), (-W / 2, gy1, D / 2)], (0, -1, 0))
    # 露台欄杆：黑色橫條＋立柱
    RH = 1.15
    for yb in [TER + 0.12 + 0.2 * k for k in range(5)] + [TER + RH - 0.05]:
        K.box(mm, -W / 2, x1, yb, yb + 0.04, D / 2 - 0.05, D / 2, skip=())
        K.box(mm, -W / 2, -W / 2 + 0.05, yb, yb + 0.04, z1, D / 2 - 0.05, skip=())
    for k in range(4):
        x = -W / 2 + (CX - 0.05) * k / 3; K.box(mm, x, x + 0.05, TER, TER + RH, D / 2 - 0.06, D / 2, skip=('bottom',))
        z = z1 + (CZ - 0.06) * k / 3; K.box(mm, -W / 2, -W / 2 + 0.06, TER, TER + RH, z, z + 0.05, skip=('bottom',))
    # 露台後面的兩面紅磚牆＋咖啡座長窗（淡藍框）
    IA = Fr((x1, 0, 0), (0, 0, 1), (-1, 0, 0)); IB = Fr((0, 0, z1), (1, 0, 0), (0, 0, 1))
    for fr, ua, ub, sid in ((IA, z1, D / 2, 13), (IB, -W / 2, x1, 14)):
        wa, wb, ga, gb = TER + 0.35, H - 1.0, ua + (0.5 if fr is IA else 0.35), ub - (0.35 if fr is IA else 0.5)
        K.rect(bm, fr, ua, ub, TER, wa); K.rect(bm, fr, ua, ub, wb, H); K.rect(bm, fr, ua, ga, wa, wb); K.rect(bm, fr, gb, ub, wa, wb)
        for a_, b_, want in (((ga, wa), (gb, wa), (0, 1, 0)), ((ga, wb), (gb, wb), (0, -1, 0)), ((ga, wa), (ga, wb), (1, 0, 0)), ((gb, wa), (gb, wb), (-1, 0, 0))): K.strip(cm, fr, a_, b_, 0, -0.18, want)
        band_glass(K, fr, ga, gb, wa, wb, 1.3, sid, d=-0.18); mullions(K, K.acc('frame'), fr, ga, gb, wa, wb, 1.3, d=-0.15, w=0.04)
    # 屋頂：L 形（角落是露台）＋灰色金屬收邊
    K.face(cm, [(x1, H, -D / 2), (W / 2, H, -D / 2), (W / 2, H, D / 2), (x1, H, D / 2)], (0, 1, 0))
    K.face(cm, [(-W / 2, H, -D / 2), (x1, H, -D / 2), (x1, H, z1), (-W / 2, H, z1)], (0, 1, 0))
    cp = K.acc('cope'); t, o = 0.3, 0.06
    for (xa, xb, za, zb) in ((x1 - o, W / 2 + o, D / 2 - t + o, D / 2 + o), (-W / 2 - o, W / 2 + o, -D / 2 - o, -D / 2 + t - o), (W / 2 - t + o, W / 2 + o, -D / 2 - o, D / 2 + o),
                             (-W / 2 - o, -W / 2 + t - o, -D / 2 - o, z1 + o), (-W / 2 - o, x1 + o, z1 - t + o, z1 + o), (x1 - o, x1 + t - o, z1 - o, D / 2 + o)):
        K.box(cp, xa, xb, H - 0.05, H + 0.28, za, zb, skip=())
    return finish(root, K, [(plate, {'text': '望月台', 'sub': 'CAMPUS STORE・CAFÉ', 'bg': '#4b2e1c', 'color': '#f1c07a'})], out)


# ---------------- 體育館（綜合體育館） ----------------
def sup(a, b, n, t):
    c, s = math.cos(t), math.sin(t)
    return a * math.copysign(abs(c) ** (2 / n), c), b * math.copysign(abs(s) ** (2 / n), s)


def build_gym(out):
    """照臺大校友雙月刊、Wikimedia Commons 的照片（README 有網址）：鮭魚粉磁磚基座＋二樓一排方形深窗（三角格柵）、灰色腰帶、淡粉色退縮的三樓；
    上面一圈銀白色往外懸挑的橢圓環（碗底）＋一圈水平長窗＋簷口；白色薄膜淺圓頂＋兩道白色鋼桁架拱；正面一樓玻璃大廳＋雨遮、兩根藍綠色玻璃圓柱。
    遊戲壓縮成 30 × 14 m（真的大很多）；本地正面 +z＝世界南（對著體育館門前的鋪面）。正面外牆比範圍退 0.8 m（花台），圓柱貼齊範圍。"""
    place, W, D = setup(GYM); FZ = D / 2 - 0.8; G1, G2, G3, G4 = 5.0, 9.4, 9.8, 11.4
    B.reset(texres=512); root = B.group(GYM['name'], props={'kind': GYM['name']})
    M = {'tile': L.pbr('ck_gym_tile', 'large_floor_tiles_02', tile=0.6, target='#cf8769', sat=0.7, normal=0.25, maps=('diff', 'nor'), rough_value=0.7),
         'tile2': L.pbr('ck_gym_tile2', 'large_floor_tiles_02', tile=0.6, target='#e6b6a8', sat=0.6, normal=0.2, maps=('diff', 'nor'), rough_value=0.7),
         'conc': L.pbr('ck_gym_conc', 'granular_concrete', tile=1.4, target='#8f9092', normal=0.2, maps=('diff', 'nor'), rough_value=0.9),
         'metal': L.flat('ck_gym_metal', '#8d9297', rough=0.5, metal=0.2),   # 二樓方窗的三角格柵（照片是淺灰）
         'silver': L.flat('ck_gym_silver', '#c3c8cd', rough=0.35, metal=0.4),
         'white': L.flat('ck_gym_white', '#eef0ed', rough=0.5),
         'teal': L.flat('ck_gym_teal', '#4d8e8a', rough=0.18, metal=0.25),
         'glass': glass_mat(), 'board': L.flat('ck_board', '#f4f2ec', rough=0.8)}
    K = Kit(place, M, 'gym_'); tm, t2, cm, mm, sm, wm = (K.acc(k) for k in ('tile', 'tile2', 'conc', 'metal', 'silver', 'white'))
    F1 = Fr((0, 0, FZ), (1, 0, 0), (0, 0, 1)); BK = Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1)); RT = Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)); LT = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0))
    SIDES = ((F1, W / 2, 'f'), (BK, W / 2, 'b'), (RT, None, 'r'), (LT, None, 'l'))
    def span(tag):   # 各面的 u 範圍（側面 u 照 z；正面退 FZ）
        if tag in 'fb': return -W / 2, W / 2
        return (-FZ, D / 2) if tag == 'r' else (-D / 2, FZ)
    LOBW = 6.2; LZ = FZ - 1.5
    # 一樓：兩翼橫條窗（深色玻璃＋白色直條遮陽）；正面中間玻璃大廳往內退 1.5 m
    for fr, _, tag in SIDES:
        ua, ub = span(tag); segs = [(ua, -LOBW), (LOBW, ub)] if tag == 'f' else [(ua, ub)]
        for a, b in segs:
            K.rect(tm, fr, a, b, 0, 1.3); K.rect(tm, fr, a, b, 3.7, G1)
            n = max(1, round((b - a) / 4.0)); s = (b - a) / n
            for k in range(n):
                p0, p1 = a + s * k + 0.45, a + s * (k + 1) - 0.45
                K.rect(tm, fr, a + s * k, p0, 1.3, 3.7); K.rect(tm, fr, p1, a + s * (k + 1), 1.3, 3.7)
                for a_, b_, want in (((p0, 1.3), (p1, 1.3), (0, 1, 0)), ((p0, 3.7), (p1, 3.7), (0, -1, 0)), ((p0, 1.3), (p0, 3.7), (1, 0, 0)), ((p1, 1.3), (p1, 3.7), (-1, 0, 0))): K.strip(cm, fr, a_, b_, 0, -0.25, want)
                K.glass(fr, p0, p1, 1.3, 3.7, -0.25, lit_hash(21, k, ord(tag)))
                m_ = max(2, round((p1 - p0) / 0.55))
                for j in range(1, m_): u = p0 + (p1 - p0) * j / m_; K.rect(wm, fr, u - 0.06, u + 0.06, 1.3, 3.7, -0.12)
    LF = Fr((0, 0, LZ), (1, 0, 0), (0, 0, 1))
    band_glass(K, LF, -LOBW, LOBW, 0.1, G1 - 0.4, 1.55, 22); mullions(K, wm, LF, -LOBW, LOBW, 0.1, G1 - 0.4, 1.55, w=0.05)
    K.glass(LF, -1.55, 1.55, 0.1, 2.8, 0.02, True); K.rect(wm, LF, -1.55, 1.55, 2.8, 2.9, 0.03)
    K.rect(tm, LF, -LOBW, LOBW, G1 - 0.4, G1)
    for sx in (-1, 1): K.face(tm, [(sx * LOBW, 0, LZ), (sx * LOBW, 0, FZ), (sx * LOBW, G1, FZ), (sx * LOBW, G1, LZ)], (-sx, 0, 0))
    K.face(cm, [(-LOBW, G1 - 0.001, LZ), (LOBW, G1 - 0.001, LZ), (LOBW, G1 - 0.001, FZ), (-LOBW, G1 - 0.001, FZ)], (0, -1, 0))
    K.face(cm, [(-LOBW, 0.05, LZ), (LOBW, 0.05, LZ), (LOBW, 0.05, D / 2 + 0.3), (-LOBW, 0.05, D / 2 + 0.3)], (0, 1, 0))
    for sx in (-1, 1):   # 花台（外牆到範圍邊）
        a, b = (LOBW, W / 2) if sx > 0 else (-W / 2, -LOBW); K.box(cm, a, b, 0, 0.5, FZ, D / 2, skip=('bottom', 'back'))
    # 入口雨遮＋招牌（藍底白字）
    K.box(cm, -LOBW - 0.6, LOBW + 0.6, 4.35, 4.72, LZ, FZ + 3.0, skip=())
    plate = Mesh('PLATE_FACE_GYM', M['board']); K.face(plate, [(-2.6, 4.38, FZ + 3.005), (2.6, 4.38, FZ + 3.005), (2.6, 4.69, FZ + 3.005), (-2.6, 4.69, FZ + 3.005)], (0, 0, 1))
    # 二樓：方形深窗＋三角格柵（四片三角形往外凸）
    WY0, WY1, WS = 6.3, 8.1, 1.8
    for fr, _, tag in SIDES:
        ua, ub = span(tag); n = max(1, round((ub - ua) / 3.0)); s = (ub - ua) / n
        K.rect(tm, fr, ua, ub, G1, WY0); K.rect(tm, fr, ua, ub, WY1, G2)
        for k in range(n):
            c = ua + s * (k + 0.5); p0, p1 = c - WS / 2, c + WS / 2
            K.rect(tm, fr, ua + s * k, p0, WY0, WY1); K.rect(tm, fr, p1, ua + s * (k + 1), WY0, WY1)
            for a_, b_, want in (((p0, WY0), (p1, WY0), (0, 1, 0)), ((p0, WY1), (p1, WY1), (0, -1, 0)), ((p0, WY0), (p0, WY1), (1, 0, 0)), ((p1, WY0), (p1, WY1), (-1, 0, 0))): K.strip(tm, fr, a_, b_, 0, -0.45, want)
            cc = (c, (WY0 + WY1) / 2); dd = -0.45
            for i in range(2):
                for j in range(2):
                    qa, qb = p0 + WS / 2 * i, p0 + WS / 2 * (i + 1); ra, rb = WY0 + (WY1 - WY0) / 2 * j, WY0 + (WY1 - WY0) / 2 * (j + 1); mc = (fr.p((qa + qb) / 2, (ra + rb) / 2, dd + 0.22))
                    corners = [fr.p(qa, ra, dd), fr.p(qb, ra, dd), fr.p(qb, rb, dd), fr.p(qa, rb, dd)]
                    for e in range(4): K.face(mm, [corners[e], corners[(e + 1) % 4], mc], fr.N)
    # 灰色腰帶、退縮的淡粉色三樓
    K.box(cm, -W / 2 - 0.3, W / 2 + 0.3, G2, G3, -D / 2 - 0.3, FZ + 0.3, skip=())
    R3 = 0.7; z3a, z3b = -D / 2 + R3, FZ - R3
    K.box(t2, -W / 2 + R3, W / 2 - R3, G3, G4 + 0.2, z3a, z3b, skip=('bottom', 'top'))
    for k in range(int((W - 2 * R3) / 3.0)):
        x = -W / 2 + R3 + 1.5 + 3.0 * k; K.glass(Fr((0, 0, z3b), (1, 0, 0), (0, 0, 1)), x - 0.35, x + 0.35, G3 + 0.4, G4 - 0.1, 0.01, lit_hash(31, k))
    # 藍綠色玻璃圓柱兩根（樓梯間；正面、貼範圍）
    for cx in (-9.2, 9.2):
        r, zc, nseg = 1.0, D / 2 - 1.02, 12
        for i in range(nseg):
            t0, t1 = math.pi * i / nseg, math.pi * (i + 1) / nseg
            pa = (cx + r * math.cos(t0), zc + r * math.sin(t0)); pb = (cx + r * math.cos(t1), zc + r * math.sin(t1)); nm = (math.cos((t0 + t1) / 2), 0, math.sin((t0 + t1) / 2))
            K.face(K.acc('teal'), [(pa[0], 0.5, pa[1]), (pb[0], 0.5, pb[1]), (pb[0], G4 + 0.6, pb[1]), (pa[0], G4 + 0.6, pa[1])], nm)
            for yb in (3.0, 5.6, 8.2, G4 + 0.6):
                K.face(wm, [(pa[0] + 0.03 * nm[0], yb - 0.18, pa[1] + 0.03 * nm[2]), (pb[0] + 0.03 * nm[0], yb - 0.18, pb[1] + 0.03 * nm[2]), (pb[0] + 0.03 * nm[0], yb, pb[1] + 0.03 * nm[2]), (pa[0] + 0.03 * nm[0], yb, pa[1] + 0.03 * nm[2])], nm)
            K.face(wm, [(cx, G4 + 0.6, zc), (pa[0], G4 + 0.6, pa[1]), (pb[0], G4 + 0.6, pb[1])], (0, 1, 0))
    # 銀白色懸挑橢圓環：碗底 → 立面帶 → 一圈長窗 → 簷口；中心在三樓的中心
    zc = (z3a + z3b) / 2; a0, b0 = (W / 2 - R3) * 0.86, (z3b - z3a) / 2 * 0.86; a1, b1 = W / 2 + 1.2, D / 2 + 0.6; NS, NE = 48, 2.6
    def ring(a, b): return [sup(a, b, NE, 2 * math.pi * i / NS) for i in range(NS)]
    def loft(m, A, ya, Bv, yb, want_fn):
        for i in range(NS):
            j = (i + 1) % NS; mx = (A[i][0] + A[j][0] + Bv[i][0] + Bv[j][0]) / 4; mz = (A[i][1] + A[j][1] + Bv[i][1] + Bv[j][1]) / 4
            K.face(m, [(A[i][0], ya, A[i][1] + zc), (A[j][0], ya, A[j][1] + zc), (Bv[j][0], yb, Bv[j][1] + zc), (Bv[i][0], yb, Bv[i][1] + zc)], want_fn(mx, mz))
    out_dn = lambda mx, mz: (mx / a1, -1.2, mz / b1)
    out_h = lambda mx, mz: (mx / a1, 0, mz / b1)
    up = lambda mx, mz: (0, 1, 0)
    dn = lambda mx, mz: (0, -1, 0)
    Rb0 = ring(a0, b0); Rbm = ring(a0 + (a1 - a0) * 0.62, b0 + (b1 - b0) * 0.62); Rb1 = ring(a1, b1)
    loft(sm, Rb0, G4 - 0.4, Rbm, G4 + 1.0, out_dn); loft(sm, Rbm, G4 + 1.0, Rb1, G4 + 1.9, out_dn)
    yb1, yg0, yg1, ye = G4 + 1.9, G4 + 2.7, G4 + 4.1, G4 + 4.7
    loft(sm, Rb1, yb1, Rb1, yg0, out_h)
    Rg = ring(a1 - 0.35, b1 - 0.35); loft(sm, Rb1, yg0, Rg, yg0, up)
    for i in range(NS):
        j = (i + 1) % NS; mx, mz = (Rg[i][0] + Rg[j][0]) / 2, (Rg[i][1] + Rg[j][1]) / 2; nn = (mx / a1, 0, mz / b1)
        u = U_LIT if lit_hash(41, i) else U_DARK
        K.face(K.acc('glass'), [(Rg[i][0], yg0, Rg[i][1] + zc), (Rg[j][0], yg0, Rg[j][1] + zc), (Rg[j][0], yg1, Rg[j][1] + zc), (Rg[i][0], yg1, Rg[i][1] + zc)], nn,
               uvs=[(u, 0), (u, 0), (u, 1), (u, 1)], col=[GL_BOT, GL_BOT, GL_TOP, GL_TOP])
        if i % 2 == 0: tube(K, wm, (Rg[i][0] * 1.01, yg0, Rg[i][1] * 1.01 + zc), (Rg[i][0] * 1.01, yg1, Rg[i][1] * 1.01 + zc), 0.07)
    Re = ring(a1 + 0.15, b1 + 0.15); loft(sm, Rg, yg1, Re, yg1, dn); loft(sm, Re, yg1, Re, ye, out_h)
    Rd = ring(a1 - 0.25, b1 - 0.25); loft(sm, Re, ye, Rd, ye, up)
    # 白色薄膜淺圓頂（拱高 3.4 m）
    RISE, NR = 3.4, 6; prev, py = Rd, ye
    for k in range(1, NR + 1):
        t = k / NR; sc = math.cos(t * math.pi / 2); y = ye + RISE * math.sin(t * math.pi / 2)
        if k == NR:
            for i in range(NS):
                j = (i + 1) % NS; K.face(wm, [(prev[i][0], py, prev[i][1] + zc), (prev[j][0], py, prev[j][1] + zc), (0, y, zc)], (0, 1, 0))
        else:
            cur = ring((a1 - 0.25) * sc, (b1 - 0.25) * sc); loft(wm, prev, py, cur, y, lambda mx, mz: (mx / a1, 1.5, mz / b1)); prev, py = cur, y
    # 兩道白色鋼桁架拱（沿長向，跨過圓頂）
    A_, B_ = a1 - 0.25, b1 - 0.25
    def dome_y(x, z):
        rho = (abs(x / A_) ** NE + abs(z / B_) ** NE) ** (1 / NE)
        return ye + RISE * math.sqrt(max(0.0, 1 - rho * rho))
    for zz in (-2.3, 2.3):
        NSEG = 22; xs = [-(a1 + 0.2) + 2 * (a1 + 0.2) * i / NSEG for i in range(NSEG + 1)]
        top = [(x, dome_y(x, zz) + 1.0, zz + zc) for x in xs]; bot = [(x, dome_y(x, zz) + 0.35, zz + zc) for x in xs]
        for i in range(NSEG):
            tube(K, wm, top[i], top[i + 1], 0.09); tube(K, wm, bot[i], bot[i + 1], 0.08)
            tube(K, wm, bot[i], top[i + 1], 0.05) if i % 2 == 0 else tube(K, wm, top[i], bot[i + 1], 0.05)
        for p in (0, NSEG): tube(K, wm, bot[p], top[p], 0.08)
    return finish(root, K, [(plate, {'text': '體育館', 'bg': '#2f6db5', 'color': '#ffffff'})], out)


if __name__ == '__main__':
    if SET == 'moon': info = build_moon(os.path.join(L.ROOT, arg('--out') or MOON['out']))
    else: info = build_gym(os.path.join(L.ROOT, arg('--out') or GYM['out']))
    print('OK', SET, {k: info.get(k) for k in ('tris', 'materials', 'bytes')})
