"""美國交換：法學院圖書館（SCN-US-LIB；區域 us_lawlib）→ GLB。LAWWW2-C 2026-10-18；Blender 5.2：
  python3 tools/blender/env_second/us_lawlib_layout_gen.py && python3 tools/blender/env_second/us_lawlib_tex.py
  /opt/blenv/bin/python tools/blender/env_second/us_lawlib.py [-- --out assets/models/env/second_ai/us_lawlib.glb] [--preview <png> --cam entry|atrium|window|up|stair|top] [--samples 24] [--res 1280x720] [--stats]
照使用者 2026-10-18 01:0x 的兩張照片（不放 repo；文字描述在 docs/art-rebuild/second_ai/HANDOFF.md）：
- 挑高中庭（一樓到 18.4 m 的天窗），四周三層迴廊書庫：樓板邊一條米白色飾帶＋淺木色條、玻璃欄杆＋淺木扶手＋細鋼柱；迴廊上一排排書架（側板朝中庭）。
- 樓梯斜著穿過中庭（一樓 → 二樓在東邊、二樓 → 三樓在西邊、三樓 → 四樓在東邊）：白色鋼骨樓梯、玻璃欄杆、樓梯邊一排小燈。一樓樓梯口拉紅絨繩（樓上這一版關著）。
- 中庭吊著七顆大小不一的鐵絲球（照片一的裝置藝術：細鋼條的多面球）。
- 一樓北牆五組藍綠色的彩色鉛條玻璃窗（照片二）；藍色地毯；米白色方柱；淺木色長閱覽桌、圓桌、藍綠色軟椅；服務台、查詢電腦、還書車。
- 四面牆各自一個節點（WALL_<面>_*，props dir＝往室內的法線）：鏡頭退到牆外時那一面淡出（Z3.attachRoomGLB）。
D77：沒有校名、校徽、書名、出版社（書背只有燙金線和空白的黑標籤）。座標＝配置的區域座標（x 東、z 南、y 上；原點＝圖書館中心）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
OUT = os.path.join(L.ROOT, opt('--out', 'assets/models/env/second_ai/us_lawlib.glb')); PREVIEW = opt('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_lawlib.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
rng = random.Random(20261018)
B.reset(texres=512)
root = B.group('us_lawlib', props={'kind': 'us_lawlib', 'layout': 'us_lawlib.layout.json'})


def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0
    return m


M = {'carpet': L.pbr('usll_carpet', 'dirty_carpet', tile=1.6, target='#36617a', contrast=0.7, normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.95),   # 藍色地毯（照片二）
     'plaster': L.pbr('usll_wall', 'white_plaster_02', tile=2.5, target='#ebe5d6', contrast=0.25, normal=0.08, maps=('diff', 'nor'), res=256, rough_value=0.85),
     'oak': L.pbr('usll_oak', 'walnut_veneer', tile=1.0, target='#c9a77a', contrast=1.0, normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.5),   # 淺木色直紋（第一版 fine_grained_wood 看起來像粒片板）   # 淺木色（桌面、扶手、書架側板）
     'cream': L.flat('usll_cream', '#e8e1d0', rough=0.8), 'ceiling': L.flat('usll_ceiling', '#efebe2', rough=0.9),
     'stone': L.flat('usll_stone_floor', '#cfc8b6', rough=0.6),
     'glass': L.flat('usll_rail_glass', '#d4e6e8', rough=0.05, alpha=0.2), 'steel': L.flat('usll_steel', '#9aa0a4', rough=0.35, metal=0.45),
     'white_steel': L.flat('usll_stair_white', '#eeeeea', rough=0.45, metal=0.1), 'dark': L.flat('usll_dark', '#2a2b2d', rough=0.5, metal=0.2),
     'fabric': L.flat('usll_fabric_teal', '#2f6c76', rough=0.9), 'fabric2': L.flat('usll_fabric_blue', '#2f4f7a', rough=0.9),
     'brass': L.flat('usll_brass', '#b08a3e', rough=0.35, metal=0.5), 'rope': L.flat('usll_velvet_rope', '#7e1c22', rough=0.8),
     'skylight': L.flat('usll_skylight', '#e4eef2', rough=0.2, emit=B.srgb('#dfe9ee')),
     'down': L.flat('GLOW_usll_downlight', '#fffaf0', rough=0.3, emit=B.srgb('#fff2d8')),
     'stairlight': L.flat('GLOW_usll_stair_lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffe2a8')),
     'screen': L.flat('GLOW_usll_screen', '#9fc3e0', rough=0.2, emit=B.srgb('#6f9fc8')),
     'wire': L.flat('usll_wire_sculpture', '#3b3e42', rough=0.4, metal=0.6),
     'shelf': img_mat('usll_shelf_face', 'usll_shelf_face.png', rough=0.75),
     'stained': img_mat('usll_stained_glass', 'usll_stained.png', rough=0.2, emit=0.9),   # 白天的光透進來（遊戲可以照時段調 emissive）
     'sign': img_mat('usll_sign', 'usll_sign.png', rough=0.6),
     'exit': img_mat('GLOW_usll_exit', 'lawlib_exit.png', rough=0.4, emit=1.2)}
BD = J['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']; LV = J['levels']; TOP = J['top']; SL = J['slab']; V = J['void']

# ================= 地板 =================
fl = Mesh('usll_floor_carpet', M['carpet'], tile=1.6); fl.box(X0, X1, -0.05, 0.0, Z0, Z1 - 1.6); fl.finish(root)
st_ = Mesh('usll_floor_stone', M['stone']); st_.box(X0, X1, -0.05, 0.0, Z1 - 1.6, Z1); st_.finish(root, uv=False)          # 門口一條石材地板

# ================= 四面牆（各自淡出）=================
WD = {'N': [0, 0, 1], 'S': [0, 0, -1], 'W': [1, 0, 0], 'E': [-1, 0, 0]}
def facade_rects(w, h, holes):
    xs = sorted(set([0.0, w] + [v for (a, b, _, _) in holes for v in (a, b)])); out = []
    for xa, xb in zip(xs, xs[1:]):
        if xb - xa < 1e-4: continue
        xm = (xa + xb) / 2; cuts = sorted([(y0, y1) for (a, b, y0, y1) in holes if a <= xm <= b]); cur = 0.0
        for (y0, y1) in cuts:
            if y0 > cur: out.append((xa, xb, cur, y0))
            cur = max(cur, y1)
        if cur < h: out.append((xa, xb, cur, h))
    return out
# 每面牆：起點、沿牆方向、往室內的法線、長度；洞（a0, a1, y0, y1）
WALLS = {'S': ((X1, Z1), (-1, 0), (0, -1), X1 - X0), 'N': ((X0, Z0), (1, 0), (0, 1), X1 - X0), 'W': ((X0, Z1), (0, -1), (1, 0), Z1 - Z0), 'E': ((X1, Z0), (0, 1), (-1, 0), Z1 - Z0)}
def P(side, a, y, d=0.0):
    (ox, oz), (tx, tz), (nx, nz), _ = WALLS[side]; return (ox + tx * a + nx * d, y, oz + tz * a + nz * d)
DOOR = J['door']; WIN = J['windows']
HOLES = {'S': [(X1 - (DOOR['x'] + DOOR['w'] / 2), X1 - (DOOR['x'] - DOOR['w'] / 2), 0.0, DOOR['h'])],
         'N': [(g['x0'] - X0, g['x1'] - X0, WIN['y0'], WIN['y1']) for g in WIN['groups']], 'W': [], 'E': []}
for side in 'NSWE':
    wm = Mesh('WALL_%s_wall' % side, M['plaster'], tile=2.5); wd = Mesh('WALL_%s_wainscot' % side, M['oak'], tile=1.2); wt = Mesh('WALL_%s_trim' % side, M['cream'])
    ln = WALLS[side][3]
    for (xa, xb, ya, yb) in facade_rects(ln, TOP, HOLES[side]):
        wm.quad([P(side, xa, ya), P(side, xb, ya), P(side, xb, yb), P(side, xa, yb)][::-1])
    # 一樓的木頭護牆板（0～1.0 m，往室內 2 cm；門、窗的地方斷開）
    segs = [(0.0, ln)]
    for (a, b, y0, y1) in HOLES[side]:
        if y0 < 1.0: segs = [s for seg in segs for s in ((seg[0], min(seg[1], a)), (max(seg[0], b), seg[1])) if s[1] - s[0] > 0.05]
    for (a, b) in segs:
        wd.quad([P(side, a, 0.0, 0.02), P(side, b, 0.0, 0.02), P(side, b, 1.0, 0.02), P(side, a, 1.0, 0.02)][::-1])
        wd.quad([P(side, a, 1.0, 0.02), P(side, b, 1.0, 0.02), P(side, b, 1.0, 0.0), P(side, a, 1.0, 0.0)][::-1])
    # 窗：深木框、直櫺、彩色玻璃（北牆）；門：木框玻璃雙開門（南牆）
    for (a, b, y0, y1) in HOLES[side]:
        for (p, q) in (((a, y0), (a, y1)), ((b, y0), (b, y1)), ((a, y1), (b, y1)), ((a, y0), (b, y0))):
            pts = [P(side, p[0], p[1], 0.0), P(side, q[0], q[1], 0.0), P(side, q[0], q[1], -0.35), P(side, p[0], p[1], -0.35)]
            wt.quad(pts)
        if side == 'N':
            gm = Mesh('WALL_N_stained_%d' % int(a), M['stained']); f = gm.bm.faces.new([gm.bm.verts.new(g2b(*P(side, x, y, -0.25))) for (x, y) in ((a, y0), (b, y0), (b, y1), (a, y1))][::-1])
            uvl = gm.bm.loops.layers.uv.verify()
            for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))[::-1]): lp[uvl].uv = uv
            gm.finish(root, props={'dir': WD[side]}, uv=False)
            for k in range(1, 4):                                                                          # 三根直櫺＋一根橫檔（木頭）
                x = a + k * (b - a) / 4; wd.box(*sorted((P(side, x - 0.05, 0, -0.3)[0], P(side, x + 0.05, 0, -0.2)[0])), y0, y1, *sorted((P(side, x - 0.05, 0, -0.3)[2], P(side, x + 0.05, 0, -0.2)[2])))
            ym = y0 + (y1 - y0) * 0.72; wd.box(*sorted((P(side, a, 0, -0.3)[0], P(side, b, 0, -0.2)[0])), ym - 0.05, ym + 0.05, *sorted((P(side, a, 0, -0.3)[2], P(side, b, 0, -0.2)[2])))
            wd.box(*sorted((P(side, a - 0.12, 0, 0.0)[0], P(side, b + 0.12, 0, 0.12)[0])), y0 - 0.1, y0, *sorted((P(side, a - 0.12, 0, 0.0)[2], P(side, b + 0.12, 0, 0.12)[2])))   # 窗台
        else:   # 南牆的門：木框玻璃雙開門＋上面一條氣窗（門在牆厚裡、往外 0.2 m）；室內那一側的不鏽鋼拉把；門上的出口標示燈（綠底白人，沒有字）
            dm = Mesh('WALL_S_door', M['oak'], tile=1.2); dg = Mesh('WALL_S_door_glass', M['glass']); dp = Mesh('WALL_S_door_pulls', M['steel'])
            xa, xb = DOOR['x'] - DOOR['w'] / 2, DOOR['x'] + DOOR['w'] / 2; xm = DOOR['x']; zd = Z1 + 0.2; th = y1 - 0.4
            for (l0, l1) in ((xa, xm), (xm, xb)):
                for (b0, b1, c0, c1) in ((l0, l0 + 0.09, 0.0, th), (l1 - 0.09, l1, 0.0, th), (l0, l1, 0.0, 0.22), (l0, l1, th - 0.1, th)): dm.box(b0, b1, c0, c1, zd - 0.05, zd + 0.05)
                dg.quad([(l0 + 0.09, 0.22, zd), (l1 - 0.09, 0.22, zd), (l1 - 0.09, th - 0.1, zd), (l0 + 0.09, th - 0.1, zd)])
            dm.box(xa, xb, th, th + 0.08, zd - 0.05, zd + 0.05)
            dg.quad([(xa + 0.06, th + 0.08, zd), (xb - 0.06, th + 0.08, zd), (xb - 0.06, y1 - 0.04, zd), (xa + 0.06, y1 - 0.04, zd)])
            for sx in (-1, 1): dp.cyl((xm + sx * 0.2, 0.85, zd - 0.12), (xm + sx * 0.2, 1.45, zd - 0.12), 0.02, seg=8)
            dm.finish(root, props={'dir': WD['S']}); dg.finish(root, props={'dir': WD['S']}, uv=False); dp.finish(root, props={'dir': WD['S']}, uv=False)
            ex = Mesh('WALL_S_exit_sign', M['exit']); f = ex.bm.faces.new([ex.bm.verts.new(g2b(x, y, Z1 - 0.05)) for (x, y) in ((0.36, y1 + 0.25), (-0.36, y1 + 0.25), (-0.36, y1 + 0.61), (0.36, y1 + 0.61))])
            uvl = ex.bm.loops.layers.uv.verify()
            for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
            ex.finish(root, props={'dir': WD['S']}, uv=False)
    for nm, m_ in ((side, wm), (side, wd), (side, wt)): m_.finish(root, props={'dir': WD[side]}, uv=(m_ is not wt))

# ================= 迴廊樓板、飾帶、欄杆、天花板的嵌燈 =================
sl = Mesh('usll_slabs', M['ceiling']); ct = Mesh('usll_upper_carpet', M['carpet'], tile=1.6); fs = Mesh('usll_fascia', M['cream']); fo = Mesh('usll_fascia_oak', M['oak'], tile=1.2)
rg = Mesh('usll_rail_glass', M['glass']); rc = Mesh('usll_rail_cap', M['oak'], tile=1.2); rp = Mesh('usll_rail_posts', M['steel']); dl = Mesh('GLOW_usll_downlights', M['down'])
BANDS = [(X0, X1, Z0, V['z0']), (X0, X1, V['z1'], Z1), (X0, V['x0'], V['z0'], V['z1']), (V['x1'], X1, V['z0'], V['z1'])]
STAIRS = [J['stair']] + J['stairs_up']
for y in LV[1:]:
    for (x0, x1, z0, z1) in BANDS:
        sl.box(x0, x1, y - SL, y, z0, z1); ct.box(x0, x1, y, y + 0.01, z0, z1)
        for gx in [x0 + 1.6 + k * 3.2 for k in range(int((x1 - x0 - 0.6) / 3.2))]:                      # 嵌燈（每 3.2 m 一格）
            for gz in [z0 + 1.4 + k * 3.0 for k in range(int((z1 - z0 - 0.6) / 3.0))]:
                if V['x0'] - 0.4 < gx < V['x1'] + 0.4 and V['z0'] - 0.4 < gz < V['z1'] + 0.4: continue
                dl.cyl((gx, y - SL - 0.012, gz), (gx, y - SL - 0.002, gz), 0.12, seg=10)
    # 中庭邊：飾帶（米白＋一條淺木）、玻璃欄杆＋淺木扶手＋細鋼柱；樓梯接上來的地方留缺口
    edges = [((V['x0'], V['z0']), (V['x1'], V['z0']), (0, -1)), ((V['x1'], V['z1']), (V['x0'], V['z1']), (0, 1)), ((V['x0'], V['z1']), (V['x0'], V['z0']), (-1, 0)), ((V['x1'], V['z0']), (V['x1'], V['z1']), (1, 0))]
    gaps = []
    for s_ in STAIRS:
        if abs(s_['y1'] - y) < 0.01: gaps.append(('top', s_))
        if abs(s_['y0'] - y) < 0.01: gaps.append(('foot', s_))
    for (p, q, n) in edges:
        ln = math.hypot(q[0] - p[0], q[1] - p[1]); t = ((q[0] - p[0]) / ln, (q[1] - p[1]) / ln)
        def E(a, yy, d=0.0): return (p[0] + t[0] * a + n[0] * d, yy, p[1] + t[1] * a + n[1] * d)
        # d：正＝往迴廊裡、負＝往中庭；飾帶比樓板的側面往中庭多 2 cm（第一版疊在一起，算圖變一條黑帶）
        fs.quad([E(0, y - SL - 0.12, -0.02), E(ln, y - SL - 0.12, -0.02), E(ln, y + 0.1, -0.02), E(0, y + 0.1, -0.02)][::-1])
        fs.quad([E(0, y - SL - 0.12, -0.02), E(ln, y - SL - 0.12, -0.02), E(ln, y - SL - 0.12, 0.25), E(0, y - SL - 0.12, 0.25)])
        fs.quad([E(0, y + 0.1, -0.02), E(ln, y + 0.1, -0.02), E(ln, y + 0.1, 0.02), E(0, y + 0.1, 0.02)])
        fo.quad([E(0, y - 0.2, -0.035), E(ln, y - 0.2, -0.035), E(ln, y - 0.06, -0.035), E(0, y - 0.06, -0.035)][::-1])
        # 欄杆的段（扣掉樓梯口：樓梯從北邊上到這一層、或從這一層往南／往北出發的地方）
        cuts = []
        for s_ in STAIRS:
            north_here = (abs(s_['y1'] - y) < 0.01 and s_['up'] == 'N') or (abs(s_['y0'] - y) < 0.01 and s_['up'] == 'S')
            south_here = (abs(s_['y1'] - y) < 0.01 and s_['up'] == 'S') or (abs(s_['y0'] - y) < 0.01 and s_['up'] == 'N')
            if (n == (0, -1) and north_here) or (n == (0, 1) and south_here):
                a0, a1 = sorted(((s_['x0'] - p[0]) * t[0], (s_['x1'] - p[0]) * t[0])); cuts.append((a0 - 0.05, a1 + 0.05))
        segs = [(0.15, ln - 0.15)]
        for (c0, c1) in cuts: segs = [s for seg in segs for s in ((seg[0], min(seg[1], c0)), (max(seg[0], c1), seg[1])) if s[1] - s[0] > 0.2]
        for (a0, a1) in segs:
            rg.quad([E(a0, y + 0.12, 0.12), E(a1, y + 0.12, 0.12), E(a1, y + 1.0, 0.12), E(a0, y + 1.0, 0.12)])
            c0, c1 = E(a0, y + 1.0, 0.05), E(a1, y + 1.06, 0.19); rc.box(min(c0[0], c1[0]), max(c0[0], c1[0]), y + 1.0, y + 1.07, min(c0[2], c1[2]), max(c0[2], c1[2]))
            npost = max(1, int((a1 - a0) / 1.5))
            for k in range(npost + 1):
                pp = E(a0 + k * (a1 - a0) / npost, y, 0.12); rp.box(pp[0] - 0.02, pp[0] + 0.02, y + 0.1, y + 1.0, pp[2] - 0.02, pp[2] + 0.02)
sl.finish(root, uv=False); ct.finish(root); fs.finish(root, uv=False); fo.finish(root); rg.finish(root, uv=False); rc.finish(root); rp.finish(root, uv=False)
# 屋頂：天花板＋中庭上面的天窗（鋼格子）
cl = Mesh('usll_roof_ceiling', M['ceiling'])
for (x0, x1, z0, z1) in BANDS: cl.quad([(x0, TOP, z0), (x1, TOP, z0), (x1, TOP, z1), (x0, TOP, z1)])
cl.finish(root, uv=False)
sk = Mesh('usll_skylight', M['skylight']); sk.quad([(V['x0'], TOP + 0.6, V['z0']), (V['x1'], TOP + 0.6, V['z0']), (V['x1'], TOP + 0.6, V['z1']), (V['x0'], TOP + 0.6, V['z1'])]); sk.finish(root, uv=False)
skg = Mesh('usll_skylight_frame', M['white_steel'])
for (x0, x1, z0, z1) in ((V['x0'], V['x1'], V['z0'] - 0.1, V['z0']), (V['x0'], V['x1'], V['z1'], V['z1'] + 0.1), (V['x0'] - 0.1, V['x0'], V['z0'], V['z1']), (V['x1'], V['x1'] + 0.1, V['z0'], V['z1'])): skg.box(x0, x1, TOP - 0.3, TOP + 0.6, z0, z1)
for x in [V['x0'] + k * (V['x1'] - V['x0']) / 6 for k in range(1, 6)]: skg.box(x - 0.05, x + 0.05, TOP + 0.4, TOP + 0.55, V['z0'], V['z1'])
for z in [V['z0'] + k * (V['z1'] - V['z0']) / 4 for k in range(1, 4)]: skg.box(V['x0'], V['x1'], TOP + 0.4, TOP + 0.55, z - 0.05, z + 0.05)
skg.finish(root, uv=False)
# 方柱（一樓到屋頂）
co = Mesh('usll_columns', M['cream'])
for c in J['columns']: co.box(c['x'] - 0.3, c['x'] + 0.3, 0.0, TOP, c['z'] - 0.3, c['z'] + 0.3)
co.finish(root, uv=False)

# ================= 樓梯（白色鋼骨、玻璃欄杆、淺木扶手、樓梯邊一排小燈）＋平台 =================
sw = Mesh('usll_stairs', M['white_steel']); tr = Mesh('usll_stair_treads', M['oak'], tile=1.2); sl2 = Mesh('GLOW_usll_stair_lamps', M['stairlight'])
for s_ in STAIRS:
    x0, x1, z0, z1, y0, y1 = s_['x0'], s_['x1'], s_['z0'], s_['z1'], s_['y0'], s_['y1']; n = 26; rise = (y1 - y0) / n
    north = s_['up'] == 'N'; run = (z1 - z0) / n
    for k in range(n):
        za = (z1 - (k + 1) * run) if north else (z0 + k * run); zb = za + run; yy = y0 + (k + 1) * rise
        tr.box(x0 + 0.08, x1 - 0.08, yy - 0.05, yy, za, zb)
    for xs in (x0, x1 - 0.08):                                                                              # 兩側的斜樑（白）＋玻璃＋扶手＋小燈
        zl, zh = (z1, z0) if north else (z0, z1)
        sw.quad([(xs, y0 - 0.35, zl), (xs, y1 - 0.35, zh), (xs, y1, zh), (xs, y0, zl)]); sw.quad([(xs + 0.08, y0, zl), (xs + 0.08, y1, zh), (xs + 0.08, y1 - 0.35, zh), (xs + 0.08, y0 - 0.35, zl)])
        sw.quad([(xs, y0 - 0.35, zl), (xs + 0.08, y0 - 0.35, zl), (xs + 0.08, y1 - 0.35, zh), (xs, y1 - 0.35, zh)])
        g_ = Mesh('usll_stair_glass_%d_%d' % (int(y0), int(xs * 10)), M['glass']); g_.quad([(xs + 0.04, y0 + 0.05, zl), (xs + 0.04, y1 + 0.05, zh), (xs + 0.04, y1 + 1.0, zh), (xs + 0.04, y0 + 1.0, zl)]); g_.finish(root, uv=False)
        tr.cyl((xs + 0.04, y0 + 1.02, zl), (xs + 0.04, y1 + 1.02, zh), 0.035, seg=8)
        for k in range(1, 18):
            f = k / 18; sl2.box(xs + 0.02, xs + 0.06, y0 + (y1 - y0) * f - 0.02, y0 + (y1 - y0) * f + 0.02, zl + (zh - zl) * f - 0.03, zl + (zh - zl) * f + 0.03)
    # 平台：二樓 → 三樓的樓梯頂接到三樓南邊迴廊（z 4.0～5.5）；三樓 → 四樓的樓梯腳從三樓南邊迴廊下來
    if s_ is J['stairs_up'][0]: sw.box(x0, x1, y1 - SL, y1, z1, V['z1']); tr.box(x0, x1, y1, y1 + 0.02, z1, V['z1'])
    if s_ is J['stairs_up'][1]: sw.box(x0, x1, y0 - SL, y0, z1, V['z1']); tr.box(x0, x1, y0, y0 + 0.02, z1, V['z1'])
sw.finish(root, uv=False); tr.finish(root); sl2.finish(root, uv=False)
# 一樓樓梯口：紅絨繩＋兩根黃銅柱＋小立牌（圖示，沒有字）
S0 = J['stair']; rz = S0['rope_z']; br = Mesh('usll_stanchions', M['brass']); ro = Mesh('usll_rope', M['rope'])
for x in (S0['x0'] + 0.05, S0['x1'] - 0.05):
    br.cyl((x, 0.0, rz), (x, 0.03, rz), 0.17, seg=14); br.cyl((x, 0.03, rz), (x, 0.95, rz), 0.03, seg=10); br.sphere((x, 0.98, rz), 0.05, seg=10, rings=6)
pts = [(S0['x0'] + 0.05 + (S0['x1'] - S0['x0'] - 0.1) * k / 10, 0.92 - 0.18 * math.sin(math.pi * k / 10)) for k in range(11)]
for (xa, ya), (xb, yb) in zip(pts, pts[1:]): ro.cyl((xa, ya, rz), (xb, yb, rz), 0.03, seg=8)
br.cyl((S0['x0'] - 0.5, 0.0, rz + 0.3), (S0['x0'] - 0.5, 1.0, rz + 0.3), 0.02, seg=8); br.cyl((S0['x0'] - 0.5, 0.0, rz + 0.3), (S0['x0'] - 0.5, 0.02, rz + 0.3), 0.14, seg=12)
sg = Mesh('usll_rope_sign', M['sign']); f = sg.bm.faces.new([sg.bm.verts.new(g2b(*p_)) for p_ in ((S0['x0'] - 0.75, 1.0, rz + 0.32), (S0['x0'] - 0.25, 1.0, rz + 0.32), (S0['x0'] - 0.25, 1.25, rz + 0.32), (S0['x0'] - 0.75, 1.25, rz + 0.32))])
uvl = sg.bm.loops.layers.uv.verify()
for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
sg.finish(root, uv=False); br.finish(root, uv=False); ro.finish(root, uv=False)

# ================= 鐵絲球（中庭吊著的裝置藝術）=================
import bmesh   # noqa: E402
wr = Mesh('usll_wire_spheres', M['wire'])
SPH = [(-3.5, 7.0, -2.0, 1.3), (2.6, 9.5, 1.2, 1.7), (-1.0, 12.5, 2.6, 1.1), (4.6, 6.2, -3.4, 0.9), (-5.2, 10.5, 3.0, 1.4), (0.6, 14.8, -2.8, 1.5), (-2.4, 5.4, 4.0, 0.8)]
for (cx, cy, cz, r) in SPH:
    tb = bmesh.new(); bmesh.ops.create_icosphere(tb, subdivisions=2 if r >= 1.3 else 1, radius=r)   # 大的球多一點面（照片的球比較圓）
    rot = rng.uniform(0, math.pi)
    for e in tb.edges:
        a, b = e.verts[0].co, e.verts[1].co
        ca, sa = math.cos(rot), math.sin(rot)
        pa = (cx + a.x * ca - a.y * sa, cy + a.z, cz + a.x * sa + a.y * ca); pb = (cx + b.x * ca - b.y * sa, cy + b.z, cz + b.x * sa + b.y * ca)
        wr.cyl(pa, pb, 0.012 + r * 0.004, seg=3, caps=False)
    tb.free()
    wr.cyl((cx, cy + r, cz), (cx, TOP, cz), 0.004, seg=3, caps=False)                                      # 吊線
wr.finish(root, uv=False)

# ================= 一樓家具 =================
ok = Mesh('usll_furniture_oak', M['oak'], tile=1.2); dk = Mesh('usll_furniture_dark', M['dark']); fb = Mesh('usll_upholstery', M['fabric']); fb2 = Mesh('usll_upholstery_blue', M['fabric2'])
def chair(x, z, yaw):
    c, s = math.cos(yaw), math.sin(yaw)
    def Q(u, v): return (x + u * c + v * s, z - u * s + v * c)
    def bx(m, u0, u1, y0, y1, v0, v1):
        p0, p1 = Q(u0, v0), Q(u1, v1); m.box(min(p0[0], p1[0]), max(p0[0], p1[0]), y0, y1, min(p0[1], p1[1]), max(p0[1], p1[1]))
    for (u, v) in ((-0.2, -0.18), (0.2, -0.18), (-0.2, 0.2), (0.2, 0.2)): bx(ok, u - 0.02, u + 0.02, 0.0, 0.45, v - 0.02, v + 0.02)
    bx(ok, -0.23, 0.23, 0.42, 0.45, -0.21, 0.23); bx(fb, -0.21, 0.21, 0.45, 0.49, -0.19, 0.21)
    bx(ok, -0.22, -0.18, 0.45, 0.92, -0.23, -0.19); bx(ok, 0.18, 0.22, 0.45, 0.92, -0.23, -0.19); bx(fb, -0.19, 0.19, 0.6, 0.88, -0.235, -0.2)
for t in J['tables']:                                                                                       # 長閱覽桌（淺木桌面、兩端板腳、中間一條電源槽）
    hw, hd = t['w'] / 2, t['d'] / 2
    ok.box(t['x'] - hw, t['x'] + hw, 0.72, 0.76, t['z'] - hd, t['z'] + hd)
    for s in (-1, 1): ok.box(t['x'] - hw + 0.08, t['x'] + hw - 0.08, 0.0, 0.72, t['z'] + s * (hd - 0.12) - 0.03, t['z'] + s * (hd - 0.12) + 0.03)
    dk.box(t['x'] - 0.08, t['x'] + 0.08, 0.76, 0.79, t['z'] - hd + 0.4, t['z'] + hd - 0.4)
for s_ in J['seats']:
    if s_['kind'] != 'study': continue
    tx, tz = s_['table']; chair(s_['x'], s_['z'], math.atan2(tx - s_['x'], tz - s_['z']))                 # 椅子面向桌子（局部 +v＝前面）
for r in J['round_tables']:
    ok.cyl((r['x'], 0.72, r['z']), (r['x'], 0.76, r['z']), r['r'], seg=20); dk.cyl((r['x'], 0.0, r['z']), (r['x'], 0.72, r['z']), 0.05, seg=10); dk.cyl((r['x'], 0.0, r['z']), (r['x'], 0.03, r['z']), 0.3, seg=14)
lt = J['lounge_table']; ok.cyl((lt['x'], 0.4, lt['z']), (lt['x'], 0.44, lt['z']), lt['r'], seg=20); dk.cyl((lt['x'], 0.0, lt['z']), (lt['x'], 0.4, lt['z']), 0.04, seg=8)
for c in J['lounge']:                                                                                       # 軟椅（藍綠色、低椅背、扶手）
    x, z, yaw = c['x'], c['z'], c['yaw']; cs, sn = math.cos(yaw), math.sin(yaw)
    def Q(u, v): return (x + u * cs + v * sn, z - u * sn + v * cs)
    def bx(m, u0, u1, y0, y1, v0, v1):
        p0, p1 = Q(u0, v0), Q(u1, v1); m.box(min(p0[0], p1[0]), max(p0[0], p1[0]), y0, y1, min(p0[1], p1[1]), max(p0[1], p1[1]))
    bx(fb, -0.42, 0.42, 0.12, 0.42, -0.4, 0.38); bx(fb, -0.42, 0.42, 0.42, 0.85, -0.4, -0.22); bx(fb, -0.42, -0.3, 0.42, 0.62, -0.4, 0.38); bx(fb, 0.3, 0.42, 0.42, 0.62, -0.4, 0.38)
    bx(dk, -0.38, 0.38, 0.0, 0.12, -0.36, 0.34)
# 服務台（淺木、正面一塊木板＋檯面）、還書車；查詢電腦
D_ = J['desk']; ok.box(D_['x0'], D_['x1'], 0.0, 1.05, D_['z0'] + 0.1, D_['z1']); ok.box(D_['x0'] - 0.03, D_['x1'] + 0.03, 1.05, 1.09, D_['z0'], D_['z1'] + 0.05)
dk.box(D_['x0'] + 0.2, D_['x1'] - 0.2, 0.74, 0.78, D_['z0'] - 0.5, D_['z0'] + 0.1)
for xm in (D_['x0'] + 0.9, D_['x1'] - 0.9):
    dk.box(xm - 0.25, xm + 0.25, 1.09, 1.13, D_['z0'] + 0.3, D_['z0'] + 0.55); dk.box(xm - 0.02, xm + 0.02, 1.13, 1.32, D_['z0'] + 0.42, D_['z0'] + 0.46)
    dk.box(xm - 0.28, xm + 0.28, 1.32, 1.66, D_['z0'] + 0.40, D_['z0'] + 0.44)
for k in range(3):
    x = D_['x0'] + 0.5 + k * 1.2; z = D_['z0'] - 0.8
    dk.box(x - 0.4, x + 0.4, 0.15, 0.18, z - 0.2, z + 0.2); dk.box(x - 0.4, x + 0.4, 0.55, 0.58, z - 0.2, z + 0.2)
    for sx in (-1, 1): dk.box(x + sx * 0.38 - 0.02, x + sx * 0.38 + 0.02, 0.0, 0.9, z - 0.02, z + 0.02)
scr = Mesh('GLOW_usll_screens', M['screen'])
for xm in (D_['x0'] + 0.9, D_['x1'] - 0.9): scr.quad([(xm - 0.25, 1.35, D_['z0'] + 0.45), (xm + 0.25, 1.35, D_['z0'] + 0.45), (xm + 0.25, 1.63, D_['z0'] + 0.45), (xm - 0.25, 1.63, D_['z0'] + 0.45)])
for c in J['catalog']:
    ok.box(c['x'] - 0.32, c['x'] + 0.32, 1.0, 1.04, c['z'] - 0.25, c['z'] + 0.25); dk.box(c['x'] - 0.05, c['x'] + 0.05, 0.0, 1.0, c['z'] - 0.05, c['z'] + 0.05); dk.box(c['x'] - 0.25, c['x'] + 0.25, 0.0, 0.03, c['z'] - 0.2, c['z'] + 0.2)
    dk.box(c['x'] - 0.24, c['x'] + 0.24, 1.08, 1.4, c['z'] - 0.06, c['z'] - 0.02); dk.box(c['x'] - 0.02, c['x'] + 0.02, 1.04, 1.1, c['z'] - 0.06, c['z'] - 0.02)
    scr.quad([(c['x'] - 0.22, 1.1, c['z'] - 0.015), (c['x'] + 0.22, 1.1, c['z'] - 0.015), (c['x'] + 0.22, 1.38, c['z'] - 0.015), (c['x'] - 0.22, 1.38, c['z'] - 0.015)][::-1])
scr.finish(root, uv=False)

# ================= 書架（一樓東邊＋二～四樓迴廊）：側板淺木、兩面貼書架貼圖 =================
sh = Mesh('usll_shelf_faces', M['shelf']); sk_ = Mesh('usll_shelf_frames', M['oak'], tile=1.2)
def shelf_row(x0, x1, z0, z1, y, h=2.2):
    """一排兩面書架（沿 x 或 z 的長邊），書架貼圖每 1.2 m 重複一次"""
    sk_.box(x0, x1, y, y + 0.05, z0, z1); sk_.box(x0, x1, y + h - 0.04, y + h, z0, z1)
    along_x = (x1 - x0) >= (z1 - z0); ln = (x1 - x0) if along_x else (z1 - z0); d = 0.02
    for end in (0, 1):
        if along_x: e = x0 if end == 0 else x1 - 0.05; sk_.box(e, e + 0.05, y, y + h, z0, z1)
        else: e = z0 if end == 0 else z1 - 0.05; sk_.box(x0, x1, y, y + h, e, e + 0.05)
    for side in (0, 1):
        if along_x:
            zz = (z0 + d) if side == 0 else (z1 - d); pts = [(x0 + 0.05, y, zz), (x1 - 0.05, y, zz), (x1 - 0.05, y + h, zz), (x0 + 0.05, y + h, zz)]
        else:
            xx = (x0 + d) if side == 0 else (x1 - d); pts = [(xx, y, z1 - 0.05), (xx, y, z0 + 0.05), (xx, y + h, z0 + 0.05), (xx, y + h, z1 - 0.05)]
        f = sh.bm.faces.new([sh.bm.verts.new(g2b(*p_)) for p_ in pts]); uvl = sh.bm.loops.layers.uv.verify(); u1 = (ln - 0.1) / 1.2   # 雙面材質：哪一面都看得到；書背沒有字，左右鏡像看不出來
        for lp, uv in zip(f.loops, ((0, 0), (u1, 0), (u1, 1), (0, 1))): lp[uvl].uv = uv
for s in J['stacks']: shelf_row(s['x0'], s['x1'], s['z'] - s['d'] / 2, s['z'] + s['d'] / 2, 0.0, s['h'])
for y in LV[1:]:
    for z in [Z0 + 1.0 + k * 1.8 for k in range(11)]:                                                     # 東西兩邊的迴廊：書架垂直牆
        if z > Z1 - 1.0: break
        shelf_row(V['x1'] + 1.6, X1 - 0.6, z - 0.3, z + 0.3, y); shelf_row(X0 + 0.6, V['x0'] - 1.6, z - 0.3, z + 0.3, y)
    for x in [V['x0'] + 0.9 + k * 1.8 for k in range(9)]:                                                  # 南北兩邊的迴廊
        if x > V['x1'] - 0.6: break
        shelf_row(x - 0.3, x + 0.3, Z0 + 0.6, V['z0'] - 1.4, y); shelf_row(x - 0.3, x + 0.3, V['z1'] + 1.4, Z1 - 0.6, y)
sh.finish(root, uv=False); sk_.finish(root)
ok.finish(root); dk.finish(root, uv=False); fb.finish(root, uv=False); fb2.finish(root, uv=False); dl.finish(root, uv=False)

if '--stats' in A:
    rows = []
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); rows.append((len(ob.data.loop_triangles), ob.name))
    for n, nm in sorted(rows, reverse=True)[:20]: print('STATS', n, nm)
if not PREVIEW:
    L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'))
    st2 = L.export(OUT, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    L.write_json(OUT[:-4] + '.json', dict(st2 if isinstance(st2, dict) else {}, tris_total=tris, layout='us_lawlib.layout.json'))
    print('us_lawlib tris', tris)
else:
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '24'))
    try: sc.cycles.use_denoising = True
    except Exception: pass
    rw, rh = map(int, opt('--res', '1280x720').split('x')); sc.render.resolution_x, sc.render.resolution_y = rw, rh; sc.view_settings.view_transform = 'AgX'
    sc.view_settings.exposure = float(opt('--exposure', '0.3'))
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bgn = w.node_tree.nodes['Background']; bgn.inputs['Color'].default_value = (0.75, 0.82, 0.9, 1); bgn.inputs['Strength'].default_value = 0.6
    lt_ = bpy.data.lights.new('sun', 'SUN'); lt_.energy = 2.5; lt_.angle = math.radians(3); o = bpy.data.objects.new('sun', lt_); sc.collection.objects.link(o); o.rotation_euler = (math.radians(25), 0, math.radians(20))
    for (x, y, z) in ((0, TOP - 1.0, 0), (-4, 3.4, 0), (4, 3.4, 0), (-10, 3.6, -7), (10, 3.6, -7), (-10, 3.6, 7), (10, 3.6, 7), (0, 3.6, 7.5), (0, 3.6, -7.5)):
        pl = bpy.data.lights.new('p', 'POINT'); pl.energy = 900 if y > 10 else 260; pl.shadow_soft_size = 1.0; po = bpy.data.objects.new('p', pl); sc.collection.objects.link(po); po.location = g2b(x, y, z)
    CAMS = {'entry': ((0.0, 1.65, 8.6), (0.0, 3.0, -4.0), 20), 'atrium': ((-9.5, 1.65, 6.5), (2.0, 5.0, -3.0), 18), 'window': ((3.0, 1.65, -2.0), (-3.0, 2.4, -10.0), 20),
            'up': ((0.0, 1.6, 3.5), (0.0, 12.0, -3.0), 14), 'stair': ((2.0, 1.65, 7.0), (7.0, 3.0, -2.0), 20), 'top': ((-11.0, 10.2, 8.5), (3.0, 3.0, -3.0), 18),
            'game': ((0.0, 3.2, 12.6), (0.0, 1.0, 5.5), 26)}
    eye, look, lens = CAMS[opt('--cam', 'entry')]
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens; cam.data.clip_end = 300
    e, l_ = Vector(g2b(*eye)), Vector(g2b(*look)); cam.location = e; cam.rotation_euler = (l_ - e).to_track_quat('-Z', 'Y').to_euler()
    if opt('--cam', 'entry') == 'game':   # 遊戲鏡頭在南牆外：南牆整面藏起來（遊戲淡出）
        for ob in list(bpy.data.objects):
            if ob.name.startswith('WALL_S'): ob.hide_render = True
    sc.render.filepath = os.path.abspath(PREVIEW); bpy.ops.render.render(write_still=True); print('saved', PREVIEW)
