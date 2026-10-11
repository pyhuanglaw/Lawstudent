"""社會科學院（套件 CK.modern）的正式外觀 → GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_modern.py [-- --out 輸出.glb]

照 src/zones3d.js campus 區塊：CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85,sign:'社會科學院'})；ckPlace(soc,110,-70,-π/2)（正面朝西，對著法學院廣場）。
位置、尺寸、樓層、帶狀長窗的高度、一樓往內退的玻璃大廳、入口雨遮照套件（campuskit3d.js modern() 的算法）；導航阻擋（整個佔地）、鏡頭碰撞、互動點都在遊戲程式裡，不變。
**沒有使用者提供的社科院照片**：照套件的量體與註解（現代白色系館、帶狀長窗、玻璃大廳）做，不是照真實建築一比一重建。（國青中心也是 CK.modern，屬於 AI-1，不在這裡。）

和套件不同的地方（品質）：
  - 帶狀長窗是牆上真的開出的長條窗洞（內凹 25 cm、看得到窗洞的上下左右內側），深灰鋁框分格（每格約 1.4 m），亮燈的窗晚上由上往下漸暗（和總圖同一套做法）；
    套件是貼在牆面上的玻璃片＋框。
  - 樓板邊是外凸 15 cm 的白色水平線（上下兩面、正面），屋頂是外挑 0.6 m 的薄簷＋女兒牆；一樓玻璃大廳往內退 1.2 m，看得到大廳的天花板與兩端的實牆；入口是深灰門框的玻璃雙開門＋薄雨遮。
  - 牆面用 Poly Haven painted_plaster_wall（平整的漆面粉刷；AI-1 已下載的共用貼圖，只讀；降低彩度、校正成套件的 #eeebe4）。white_plaster_02 的斑駁太重，白牆看起來髒。
材質（draw call，越少越好：進校門鏡頭五個地標加起來已經是改之前的 1.088 倍）：ck_soc_wall（牆、樓板、簷口、雨遮、窗洞內側）、ck_glass（和總圖同名＝遊戲端同一套夜間設定）、
ck_soc_metal（鋁框、門框、屋頂防水層）、匾額（canvas 字）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
from campus_pavilion import emit_image, add_emit, GL_TOP, GL_BOT, U_DARK, U_LIT   # noqa: E402

W, D, NF, GFH, FH = 56.0, 22.0, 4, 4.4, 3.85
H = GFH + (NF - 1) * FH
PLACE = (110.0, -70.0, -math.pi / 2)
OUT = 'assets/models/env/second_ai/campus_modern.glb'
LOBBY = 1.2           # 一樓玻璃往內退
WH = 1.45             # 帶狀長窗的高度（套件）
REV = 0.25            # 窗洞深度


def build(out=None):
    out = os.path.join(L.ROOT, out or OUT)
    B.reset(texres=512)
    root = B.group('campus_modern', props={'kind': 'campus_modern'})
    M = {
        'wall': L.pbr('ck_soc_wall', 'painted_plaster_wall', tile=2.5, target='#eeebe4', sat=0.25, normal=0.35, maps=('diff', 'nor'), rough_value=0.88),
        'metal': L.flat('ck_soc_metal', '#5f656c', rough=0.42, metal=0.35),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'board': L.flat('ck_board', '#f4f2ec', rough=0.8),
    }
    add_emit(M['glass'], emit_image('win_lit_grad', True))

    pxx, pzz, ry = PLACE; cc, ss = round(math.cos(ry)), round(math.sin(ry))
    def XF(x, y, z): return (pxx + x * cc + z * ss, y, pzz - x * ss + z * cc)

    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n

    accs = {}
    def acc(k):
        if k not in accs: accs[k] = (CMesh if k == 'glass' else Mesh)('soc_' + k, M[k])
        return accs[k]

    def face(m, pts, want=None, uvs=None, col=None):
        if want is not None:
            n = newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs; col = col[::-1] if col else col
        f = m.bm.faces.new([m.bm.verts.new(g2b(*XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        if col:
            for lp, c in zip(f.loops, col): lp[m.col] = list(c) + [1.0]
        return f

    def box(m, x0, x1, y0, y1, z0, z1, skip=()):
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: face(m, pts, n)

    class Fr:
        """立面座標：u＝從外面看往右、v＝往上、d＝往外；原點 O"""
        def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
        def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
        def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])

    def rect(m, fr, ua, ub, va, vb, d=0.0, uvs=None, col=None): face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N, uvs, col)
    def strip(m, fr, a, b, d0, d1, want): face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))

    def lit_hash(*k):
        h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
        return h - math.floor(h) > 0.3

    wm, mm = acc('wall'), acc('metal')
    FRONT = Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)); BACK = Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1))
    RIGHT = Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)); LEFT = Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0))

    def ribbon(fr, half, v0, v1, sid, fl, lobby=False):
        """一層的牆（v0..v1）＋中間一條長窗（套件：窗中心在樓板上 0.95+0.72 m、高 1.45 m、兩端各留 0.8 m）；窗洞內凹 REV、鋁框分格"""
        wy = v0 + 0.95 + 0.72; wa, wb = wy - WH / 2, wy + WH / 2; ua, ub = -half + 0.8, half - 0.8
        rect(wm, fr, -half, half, v0, wa); rect(wm, fr, -half, half, wb, v1); rect(wm, fr, -half, ua, wa, wb); rect(wm, fr, ub, half, wa, wb)
        strip(wm, fr, (ua, wa), (ub, wa), 0, -REV, (0, 1, 0)); strip(wm, fr, (ua, wb), (ub, wb), 0, -REV, (0, -1, 0))   # 窗洞的上下內側
        strip(wm, fr, (ua, wa), (ua, wb), 0, -REV, (1, 0, 0)); strip(wm, fr, (ub, wa), (ub, wb), 0, -REV, (-1, 0, 0))   # 左右內側
        n = max(1, round((ub - ua) / 1.4)); sw = (ub - ua) / n; d = -REV + 0.02
        for k in range(n):
            a, b = ua + sw * k, ua + sw * (k + 1); u = U_LIT if lit_hash(sid, fl, k) else U_DARK
            rect(acc('glass'), fr, a, b, wa, wb, d - 0.01, [(u, 0), (u, 0), (u, 1), (u, 1)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
            if k: rect(mm, fr, a - 0.035, a + 0.035, wa, wb, d + 0.02)                                                    # 直框
        rect(mm, fr, ua, ub, wa, wa + 0.06, d + 0.02); rect(mm, fr, ua, ub, wb - 0.06, wb, d + 0.02)                      # 上下框
        rect(mm, fr, ua, ua + 0.06, wa, wb, d + 0.02); rect(mm, fr, ub - 0.06, ub, wa, wb, d + 0.02)

    # ---------------- 二樓以上：四面帶狀長窗 ----------------
    for fl in range(1, NF):
        v0, v1 = GFH + (fl - 1) * FH, GFH + fl * FH
        ribbon(FRONT, W / 2, v0, v1, 1, fl); ribbon(BACK, W / 2, v0, v1, 2, fl); ribbon(RIGHT, D / 2, v0, v1, 3, fl); ribbon(LEFT, D / 2, v0, v1, 4, fl)
    # ---------------- 一樓：背面、側面是實牆（側面在玻璃大廳那一段往內退）；正面玻璃大廳往內退 LOBBY ----------------
    rect(wm, BACK, -W / 2, W / 2, 0, GFH)
    for fr, sgn in ((RIGHT, 1), (LEFT, -1)):
        # 側面：u 從 −D/2 到 D/2 是「從外面看往右」；正面那一端（z=D/2）在 RIGHT 的 u=−D/2、LEFT 的 u=+D/2
        if sgn > 0: rect(wm, fr, -D / 2 + LOBBY, D / 2, 0, GFH)
        else: rect(wm, fr, -D / 2, D / 2 - LOBBY, 0, GFH)
    zl = D / 2 - LOBBY; LF = Fr((0, 0, zl), (1, 0, 0), (0, 0, 1))
    for sx in (1, -1):   # 大廳兩端的實牆（0.6 m）
        box(wm, sx * (W / 2 - 0.3) - 0.3, sx * (W / 2 - 0.3) + 0.3, 0, GFH, zl, D / 2, skip=('bottom', 'back'))
    face(wm, [(-W / 2 + 0.6, GFH - 0.001, zl), (W / 2 - 0.6, GFH - 0.001, zl), (W / 2 - 0.6, GFH - 0.001, D / 2), (-W / 2 + 0.6, GFH - 0.001, D / 2)], (0, -1, 0))   # 大廳退縮處的天花板
    face(wm, [(-W / 2, 0.06, zl), (W / 2, 0.06, zl), (W / 2, 0.06, D / 2 + 0.1), (-W / 2, 0.06, D / 2 + 0.1)], (0, 1, 0))   # 大廳前的地坪
    lw = W - 0.6; n = round(lw / 1.5); sw = lw / n; gy0, gy1 = 0.1, GFH - 0.4
    door = [k for k in range(n) if abs(-lw / 2 + sw * (k + 0.5)) < 0.8]               # 正中間那一格（1.5 m）是玻璃雙開門
    for k in range(n):
        a, b = -lw / 2 + sw * k, -lw / 2 + sw * (k + 1)
        if k in door: continue
        u = U_LIT if lit_hash(7, k) else U_DARK
        rect(acc('glass'), LF, a, b, gy0, gy1, 0.02, [(u, 0), (u, 0), (u, 1), (u, 1)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
    for k in range(n + 1):
        x = -lw / 2 + sw * k; rect(mm, LF, x - 0.04, x + 0.04, 0.06, GFH, 0.06)                                      # 大廳的直櫺
    rect(mm, LF, -lw / 2, lw / 2, gy1, GFH, 0.04); rect(mm, LF, -lw / 2, lw / 2, 0.06, gy0, 0.04)                       # 上框、踢腳
    da, db = -lw / 2 + sw * door[0], -lw / 2 + sw * (door[-1] + 1)
    rect(acc('glass'), LF, da, db, gy0, 2.9, 0.02, [(U_LIT, 0), (U_LIT, 0), (U_LIT, 0.7), (U_LIT, 0.7)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])   # 玻璃雙開門
    rect(mm, LF, da, db, 2.9, gy1, 0.03); rect(mm, LF, -0.03, 0.03, gy0, 2.9, 0.05); rect(mm, LF, da, db, 2.85, 2.95, 0.05)
    for xm in (-0.14, 0.14): box(mm, xm - 0.015, xm + 0.015, 0.95, 1.4, zl + 0.05, zl + 0.1)                             # 門把
    box(wm, -3.0, 3.0, 3.31, 3.49, D / 2 - 0.2, D / 2 + 2.3, skip=())                                                  # 入口雨遮（套件 6.0×0.18×2.6）
    # ---------------- 樓板邊（外凸 15 cm 的白色水平線）、屋頂薄簷＋女兒牆 ----------------
    for fl in range(1, NF):
        y = GFH + (fl - 1) * FH
        box(wm, -W / 2 - 0.15, W / 2 + 0.15, y - 0.14, y + 0.14, -D / 2 - 0.15, -D / 2 + 0.02)                                 # 背面
        box(wm, -W / 2 - 0.15, W / 2 + 0.15, y - 0.14, y + 0.14, D / 2 - 0.02, D / 2 + 0.15, skip=())                          # 正面
        for sx in (1, -1): box(wm, sx * W / 2 - (0.02 if sx > 0 else 0.15), sx * W / 2 + (0.15 if sx > 0 else 0.02), y - 0.14, y + 0.14, -D / 2 + 0.02, D / 2 - 0.02, skip=('front', 'back'))
    box(wm, -W / 2 - 0.6, W / 2 + 0.6, H, H + 0.2, -D / 2 - 0.6, D / 2 + 0.6, skip=())                                  # 薄簷
    for (x0, x1, z0, z1) in ((-W / 2 - 0.1, W / 2 + 0.1, D / 2 - 0.15, D / 2 + 0.1), (-W / 2 - 0.1, W / 2 + 0.1, -D / 2 - 0.1, -D / 2 + 0.15),
                             (W / 2 - 0.15, W / 2 + 0.1, -D / 2 + 0.15, D / 2 - 0.15), (-W / 2 - 0.1, -W / 2 + 0.15, -D / 2 + 0.15, D / 2 - 0.15)):
        box(wm, x0, x1, H + 0.2, H + 0.85, z0, z1, skip=('bottom',))                                                    # 女兒牆
    face(mm, [(-W / 2 + 0.15, H + 0.22, -D / 2 + 0.15), (W / 2 - 0.15, H + 0.22, -D / 2 + 0.15), (W / 2 - 0.15, H + 0.22, D / 2 - 0.15), (-W / 2 + 0.15, H + 0.22, D / 2 - 0.15)], (0, 1, 0))   # 屋頂防水層
    # ---------------- 匾額：大廳上方的樓板邊（套件：y=gfh+0.55，正面）----------------
    plate = Mesh('PLATE_FACE_SOC', M['board']); sy = GFH + 0.52                                                         # 樓板邊（到 GFH+0.14）和二樓長窗（GFH+0.945 起）之間
    box(wm, -3.3, 3.3, sy - 0.37, sy + 0.37, D / 2 - 0.02, D / 2 + 0.08, skip=('back',))
    face(plate, [(-3.0, sy - 0.28, D / 2 + 0.085), (3.0, sy - 0.28, D / 2 + 0.085), (3.0, sy + 0.28, D / 2 + 0.085), (-3.0, sy + 0.28, D / 2 + 0.085)], (0, 0, 1))

    for k, m in accs.items(): m.finish(root, uv=(k == 'wall'))
    uv01(plate.finish(root, uv=True, props={'text': '社會科學院', 'bg': '#f4f2ec', 'color': '#3b3b3b', 'fs': 0.62}))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    build(ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else None)
