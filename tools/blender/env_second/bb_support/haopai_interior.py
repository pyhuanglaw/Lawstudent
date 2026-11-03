"""好拍運動（羽球、桌球、網球用品店；新生南路那一側）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-03 v1，給 BB 驗收。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/bb_support/haopai_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
先跑一次貼圖：python3 tools/blender/env_second/bb_support/haopai_tex.py（→ tools/blender/env_second/textures/gen/haopai_*）。
參考：使用者 11-03 生成的室內圖 haopai_int（從店門往裡看）、外觀 haopai_ext（雙開玻璃門在中間偏左）。規格：AA_620 第 1、2 節、3-3、3-4；SCENE_RULES 第 10 節。
配置（家具位置、大小、座位、互動點、導航阻擋）只寫在 src/data/haopai_layout.js，這裡讀同一份。座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir）；掛在牆上的球拍、網格、握把布、電視、布簾都放進牆的組。天花板單面朝下（剖面視角）。
招牌「好拍運動」只做空白底板 PLATE_FACE_HAOPAI（字由遊戲用 canvas 畫）；球拍、膠皮、包裝都沒有任何字或標誌（D77）；電視畫面是抽象的綠色球場色塊。
尺寸（照真實）：羽球拍全長 0.675 m、拍框 0.236 × 0.196；網球拍 0.685 m、拍面 0.33 × 0.256；桌球拍 0.16 × 0.15＋握把 0.10；羽球筒 ø0.09 × 0.40；
櫃台 1.0 m、高腳凳座面 0.70、小板凳 0.32；穿線機轉盤高 1.02。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LIB = arg('--lib', '/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/wt_l2/tools/blender/env_second')
if not os.path.exists(os.path.join(LIB, 'lib2.py')): LIB = os.path.dirname(HERE)   # PC（工作樹＝second-ai-env-art）用工作樹裡的 lib2
sys.path.insert(0, LIB)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'haopai_layout.js')]))['haopai']
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'haopai_atlas.json')))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12                      # 牆厚：內面 x ±4.38、z −7.88／7.88
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT
IT = {i['kind']: i for i in LAY['items']}
random.seed(620)
B.reset(texres=512)
root = B.group('haopai_interior', props={'kind': 'haopai_interior', 'w': W, 'd': D, 'h': H, 'layout': 1})
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
        m.use_backface_culling = False
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


P = 'hp_'
# 11 個材質：地磚、牆、天花板、木頭（Poly Haven CC0）＋頂點色（霧面、金屬）＋玻璃＋三張自製貼圖集＋招牌底板
M = {
    'floor': L.pbr(P + 'floor_tile', 'large_floor_tiles_02', tile=1.2, target='#ddd3c0', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.32),
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#e6dfcf', normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.88),
    'ceil': L.pbr(P + 'ceiling', 'ceiling_interior', tile=0.6, target='#ebe8e1', maps=('diff',), res=256, rough_value=0.92, cull=True),
    'wood': L.pbr(P + 'wood', 'fine_grained_wood', tile=0.9, target='#a87d52', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.5),
    'vc': L.vc_material(P + 'vc', rough=0.62), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.35),
    'glass': L.flat(P + 'glass', '#d4e2e0', rough=0.05, alpha=0.16),
    'emit': img_mat(P + 'emit', 'haopai_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha_mesh', 'haopai_alpha.png', rough=0.45, clip=True, metal=0.2),
    'goods': img_mat(P + 'goods', 'haopai_goods.png', rough=0.55),
    'sign': L.flat(P + 'signboard', '#efe7d4', rough=0.6),
}
G3 = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))   # 遊戲 → Blender 的旋轉


def rot(axis, a): return Matrix.Rotation(a, 3, axis)   # 遊戲座標的軸（Y＝往上；+a 從 +z 轉向 +x）


def fm(o, R=None):
    """物件的變換：遊戲座標的位置 o、遊戲座標的旋轉 R → Blender 的 4×4"""
    R = R if R is not None else Matrix.Identity(3)
    return Matrix.Translation(g2b(*o)) @ (G3 @ R @ G3.inverted()).to_4x4()


class UM:
    """有 UV 的網格（貼圖集）：每個面自己給 UV"""
    def __init__(self, name, mat): self.name, self.mat, self.bm = name, mat, bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def face(self, pts, uvs, smooth=False):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, t in zip(f.loops, uvs): lp[self.uv].uv = t
        f.smooth = smooth; return f

    def rect(self, c, r, up, hw, hh, uvr):
        c, r, up = Vector(c), Vector(r), Vector(up); u0, v0, u1, v1 = uvr
        return self.face([c - r * hw - up * hh, c + r * hw - up * hh, c + r * hw + up * hh, c - r * hw + up * hh], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])

    FACES = {'+x': ((1, 0, 0), (0, 0, -1), (0, 1, 0)), '-x': ((-1, 0, 0), (0, 0, 1), (0, 1, 0)), '+z': ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
             '-z': ((0, 0, -1), (-1, 0, 0), (0, 1, 0)), '+y': ((0, 1, 0), (1, 0, 0), (0, 0, -1)), '-y': ((0, -1, 0), (1, 0, 0), (0, 0, 1))}

    def box(self, cx, cy, cz, w, h, d, cell, front='+z', side=None, skip=('-y',)):
        """方盒：正面整格貼圖，其他面用同一格左邊 4% 的窄條（格子的邊色）；cell＝ATL 的名字或 (u0,v0,u1,v1)"""
        uvr = ATL[cell] if isinstance(cell, str) else cell; u0, v0, u1, v1 = uvr
        sid = side if side is not None else (u0, v0 + (v1 - v0) * 0.4, u0 + (u1 - u0) * 0.04, v0 + (v1 - v0) * 0.6)
        hs = (w / 2, h / 2, d / 2)
        for k, (n, r, up) in self.FACES.items():
            if k in skip: continue
            c = (cx + n[0] * hs[0], cy + n[1] * hs[1], cz + n[2] * hs[2])
            hw = sum(abs(r[i]) * hs[i] for i in range(3)); hh = sum(abs(up[i]) * hs[i] for i in range(3))
            self.rect(c, r, up, hw, hh, uvr if k == front else sid)

    def tube(self, x, z, y0, y1, r, cell, seg=10, u_rep=1.0):
        """直立的圓筒側面（羽球筒標籤：u 繞一圈、v 由下往上）"""
        u0, v0, u1, v1 = ATL[cell]; vs = []
        for i in range(seg + 1):
            a = 2 * math.pi * i / seg; vs.append(((x + r * math.sin(a), z + r * math.cos(a)), u0 + (u1 - u0) * (i / seg)))
        for i in range(seg):
            (pa, ua), (pb, ub) = vs[i], vs[i + 1]
            self.face([(pa[0], y0, pa[1]), (pb[0], y0, pb[1]), (pb[0], y1, pb[1]), (pa[0], y1, pa[1])], [(ua, v0), (ub, v0), (ub, v1), (ua, v1)], smooth=True)

    def empty(self): return len(self.bm.faces) == 0

    def finish(self, parent):
        if self.empty(): self.bm.free(); return None
        self.bm.normal_update(); return B.mesh_obj(self.name, self.bm, self.mat, parent)


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組"""
    def __init__(self, name, side=None, T=None, smooth=True): self.name, self.side, self.T, self.smooth, self.m = name, side, T, smooth, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = (f'WALL_{self.side}_' if self.side else P) + f'{self.name}_{key}'
            self.m[key] = L.CMesh(nm, M[key]) if key in ('vc', 'vcm') else (UM(nm, M[key]) if key in ('goods', 'alpha', 'emit') else Mesh(nm, M[key]))
        return self.m[key]

    def done(self):
        for key, m in self.m.items():
            if isinstance(m, UM): ob = m.finish(root)
            elif isinstance(m, L.CMesh): ob = m.finish(root, uv=False)
            else: ob = m.finish(root, uv=True)
            if ob is None: continue
            if self.T is not None: ob.matrix_basis = self.T
            if self.side: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign'): L.smooth_mesh(ob, angle=0.6)
        self.m = {}


# ---------------- 頂點色的小工具（都畫在 CMesh 裡，回傳新加的面）----------------
def _new(c, n0): c.bm.faces.ensure_lookup_table(); return [c.bm.faces[i] for i in range(n0, len(c.bm.faces))]


def ccyl(c, a, b, r, col, seg=8, r2=None, caps=True):
    n0 = len(c.bm.faces); c.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return c.paint(_new(c, n0), col)


def clathe(c, prof, x, y, z, col, seg=16, R=None):
    n0 = len(c.bm.faces); bm = L.lathe(prof, seg=seg); c.add_bm(bm, fm((x, y, z), R)); bm.free(); return c.paint(_new(c, n0), col)


def crb(c, x0, x1, y0, y1, z0, z1, col, r=0.01, seg=2):
    if r <= 0.0005: return c.cbox(x0, x1, y0, y1, z0, z1, col)
    return c.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)


def csph(c, ctr, r, col, seg=8, rings=5, sy=1.0):
    n0 = len(c.bm.faces); c.sphere(ctr, r, seg=seg, rings=rings, sy=sy); return c.paint(_new(c, n0), col)


def cell(cx, cy, cz, w, h, d): return (cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, cz - d / 2, cz + d / 2)


def jit(hexcol, k=0.06):
    f = 1 + random.uniform(-k, k); return '#' + ''.join(f'{min(255, max(0, int(int(hexcol[i:i + 2], 16) * f))):02x}' for i in (1, 3, 5))


# ======================================================================
# 球拍（自己的座標：拍面在 y-z 平面、法線 x；握把底在原點、拍頭往 +y）
# ======================================================================
def frame_ring(c, cy, ay, az, rr, tx, col, n):
    n0 = len(c.bm.faces); rings = []
    for i in range(n):
        t = 2 * math.pi * i / n; y = cy + ay * math.sin(t); z = az * math.cos(t)
        ny, nz = math.sin(t) / ay, math.cos(t) / az; l = math.hypot(ny, nz); ny, nz = ny / l, nz / l
        pts = [(-tx, y - ny * rr, z - nz * rr), (tx, y - ny * rr, z - nz * rr), (tx, y + ny * rr, z + nz * rr), (-tx, y + ny * rr, z + nz * rr)]
        rings.append([c.bm.verts.new(g2b(*p)) for p in pts])
    for i in range(n):
        a, b = rings[i], rings[(i + 1) % n]
        for k in range(4): c.bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
    new = _new(c, n0); bmesh.ops.recalc_face_normals(c.bm, faces=new); return c.paint(new, col)


def string_bed(u, cy, ay, az, cellname, n):
    u0, v0, u1, v1 = ATL[cellname]; pts, uvs = [], []
    for i in range(n):
        t = 2 * math.pi * i / n; y = cy + ay * math.sin(t); z = az * math.cos(t)
        pts.append((0.0, y, z)); uvs.append((u0 + (u1 - u0) * (0.5 + 0.5 * math.cos(t)), v0 + (v1 - v0) * (0.5 + 0.5 * math.sin(t))))
    u.face(pts, uvs)


BAD_FRAME = ['#1f4fa0', '#c8202a', '#e2cc1e', '#1d1d21', '#e8e6e0', '#d9579a', '#2e8a4a', '#ee7a1e', '#5a2f8a', '#3a9ad0']
GRIPS = ['#f2f0ea', '#1e1e20', '#e2cc1e', '#d2303a', '#2f6fb8', '#f2f0ea']


def badminton(pt, frame, grip, shaft='#34363a', n=14, strings=True):
    c = pt['vc']; cy, ay, az = 0.567, 0.118, 0.098
    frame_ring(c, cy, ay, az, 0.0036, 0.0052, frame, n)
    ccyl(c, (0, 0.205, 0), (0, 0.452, 0), 0.0034, shaft, seg=6, caps=False)
    ccyl(c, (0, 0.424, 0), (0, 0.452, 0), 0.0068, frame, seg=6, r2=0.0042, caps=False)   # T 字接頭
    ccyl(c, (0, 0.013, 0), (0, 0.196, 0), 0.0136, grip, seg=7)                            # 握把（纏握把布）
    ccyl(c, (0, 0.0, 0), (0, 0.014, 0), 0.0148, '#202022', seg=7, caps=False)            # 尾蓋
    ccyl(c, (0, 0.192, 0), (0, 0.218, 0), 0.0105, frame, seg=7, r2=0.0048, caps=False)   # 握把頭的塑膠套
    if strings: string_bed(pt['alpha'], cy, ay - 0.003, az - 0.003, 'bad_str', n)


def tennis(pt, frame, grip, accent, n=16):
    c = pt['vc']; cy, ay, az = 0.515, 0.162, 0.127
    frame_ring(c, cy, ay, az, 0.0095, 0.011, frame, n)
    yb = cy - ay * math.sqrt(1 - (0.082 / az) ** 2)
    for s in (-1, 1): ccyl(c, (0, 0.226, s * 0.012), (0, yb + 0.004, s * 0.082), 0.009, accent, seg=6, caps=False)   # 開放式拍喉
    ccyl(c, (0, 0.19, 0), (0, 0.232, 0), 0.0155, frame, seg=8, r2=0.012, caps=False)
    ccyl(c, (0, 0.013, 0), (0, 0.192, 0), 0.0168, grip, seg=8)
    ccyl(c, (0, 0.0, 0), (0, 0.014, 0), 0.018, '#1e1e20', seg=8, caps=False)
    string_bed(pt['alpha'], cy, ay - 0.008, az - 0.008, 'ten_str', n)


def tt_paddle(pt, face_a, face_b, n=16):
    """桌球拍（拍面朝 ±x：+x 那面 face_a、−x 那面 face_b；握把往 −y，拍面中心在 (0,0.18,0)）"""
    c = pt['vc']; cy, ay, az = 0.18, 0.079, 0.075
    ring = [(cy + ay * math.sin(2 * math.pi * i / n) * (1.0 if math.sin(2 * math.pi * i / n) > 0 else 0.94), az * math.cos(2 * math.pi * i / n)) for i in range(n)]
    for xs, col in ((0.0058, face_a), (-0.0058, face_b)):
        vs = [c.bm.verts.new(g2b(xs, y, z)) for y, z in ring]; f = c.bm.faces.new(vs if xs > 0 else list(reversed(vs))); c.paint([f], col)
    n0 = len(c.bm.faces); top = [c.bm.verts.new(g2b(0.0058, y, z)) for y, z in ring]; bot = [c.bm.verts.new(g2b(-0.0058, y, z)) for y, z in ring]
    for i in range(n): j = (i + 1) % n; c.bm.faces.new((top[i], top[j], bot[j], bot[i]))
    c.paint(_new(c, n0), '#c39a68')
    crb(c, -0.012, 0.012, 0.0, 0.105, -0.0135, 0.0135, '#b98756', r=0.006)          # 握把（木頭）
    crb(c, -0.0128, 0.0128, 0.085, 0.112, -0.016, 0.016, '#7a1f22', r=0.004)         # 握把上緣的飾片


# ======================================================================
# 房間：地、天花板、牆（淡出的組）、招牌樑
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
ce = Part('ceiling', smooth=False); ce['ceil'].quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.done()
tb = Part('tbar', smooth=False)                                                               # 輕鋼架（60 cm 方格）
for k in range(1, int(W / 0.6) + 1):
    x = X0 + k * 0.6 - 0.3 + 0.0
    if XI0 < x < XI1: tb['vcm'].cbox(x - 0.012, x + 0.012, H - 0.012, H - 0.001, ZI0, ZI1, '#e4e3de')
for k in range(1, int(D / 0.6) + 1):
    z = Z0 + k * 0.6
    if ZI0 < z < ZI1: tb['vcm'].cbox(XI0, XI1, H - 0.012, H - 0.001, z - 0.012, z + 0.012, '#e4e3de')
tb.done()

for side in ('left', 'right', 'back'):
    p = Part('wall', side=side, smooth=False)
    if side == 'left': p['wall'].box(X0, XI0, 0, H, Z0, Z1); p['vc'].cbox(XI0, XI0 + 0.015, 0, 0.1, ZI0, ZI1, '#b8b0a0')
    elif side == 'right': p['wall'].box(XI1, X1, 0, H, Z0, Z1); p['vc'].cbox(XI1 - 0.015, XI1, 0, 0.1, ZI0, ZI1, '#b8b0a0')
    else: p['wall'].box(X0, X1, 0, H, Z0, ZI0); p['vc'].cbox(XI0, XI1, 0, 0.1, ZI0, ZI0 + 0.015, '#b8b0a0')
    p.done()
# 店面那一面：門、落地窗（layout.front）、鋁框、玻璃
fr = LAY['front']; dx, dw = fr['door']['x'], fr['door']['w']; sill, head, dh = fr['sill'], fr['head'], 2.2
pf = Part('front', side='front', smooth=False)
ops = sorted([(a, b, 'win') for a, b in fr['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
edges = [X0] + [v for a, b, k in ops for v in (a, b)] + [X1]
for i in range(0, len(edges), 2):
    if edges[i + 1] - edges[i] > 1e-3: pf['wall'].box(edges[i], edges[i + 1], 0, H, ZI1, Z1)
ALU = '#a9adb0'
for a, b, k in ops:
    top = dh if k == 'door' else head; y0 = 0.0 if k == 'door' else sill
    pf['wall'].box(a, b, top, H, ZI1, Z1)
    if k == 'win': pf['wall'].box(a, b, 0.0, sill, ZI1, Z1); crb(pf['vcm'], a, b, sill - 0.01, sill + 0.035, ZI1 - 0.05, Z1 - 0.02, ALU, r=0.006)
    crb(pf['vcm'], a, b, top - 0.05, top + 0.0, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    nseg = 2 if k == 'door' else max(1, round((b - a) / 1.3))
    for j in range(nseg + 1):
        x = a + j * (b - a) / nseg; crb(pf['vcm'], x - 0.03, x + 0.03, y0, top, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    pf['glass'].quad([(b, y0 + 0.02, Z1 - 0.07), (a, y0 + 0.02, Z1 - 0.07), (a, top - 0.03, Z1 - 0.07), (b, top - 0.03, Z1 - 0.07)])
    if k == 'door':
        for s in (-1, 1):
            hx_ = dx + s * 0.09; ccyl(pf['vcm'], (hx_, 0.85, ZI1 - 0.08), (hx_, 1.35, ZI1 - 0.08), 0.012, '#c9ccce', seg=8)   # 長把手
            for yy in (0.88, 1.32): ccyl(pf['vcm'], (hx_, yy, ZI1 - 0.08), (hx_, yy, ZI1 - 0.04), 0.008, '#c9ccce', seg=6)
        crb(pf['vcm'], a, b, 0.0, 0.1, ZI1 - 0.045, Z1 - 0.03, ALU, r=0.006)       # 門的下框
pf.done()
mat_ = Part('doormat'); crb(mat_['vc'], dx - 0.6, dx + 0.6, 0.0, 0.012, ZI1 - 0.75, ZI1 - 0.1, '#55524d', r=0.005); mat_.done()

# 招牌樑（下垂的樑，底 2.55 m）＋空白招牌底板（PLATE_FACE_HAOPAI：字由遊戲畫）
SZ = LAY['soffit']['z']; SY = LAY['soffit']['y']
so = Part('soffit', smooth=False); so['wall'].box(XI0, XI1, SY, H, SZ - 0.3, SZ); so['wood'].rbox(XI0, XI1, SY - 0.03, SY, SZ - 0.32, SZ + 0.02, r=0.008)
crb(so['vc'], -1.68, 1.68, 2.61, 3.43, SZ + 0.0, SZ + 0.035, '#6d5236', r=0.008)                      # 招牌木框
so.done()
sg = Mesh('PLATE_FACE_HAOPAI', M['sign']); sz_ = SZ + 0.037
sg.quad([(-1.6, 2.66, sz_), (1.6, 2.66, sz_), (1.6, 3.38, sz_), (-1.6, 3.38, sz_)])
sob = sg.finish(root, uv=False, props={'text': '好拍運動', 'bg': '#efe7d4', 'color': '#1f3a6e', 'serif': 1, 'fs': 0.62, 'note': '空白底板；參考圖上的羽球、球拍小圖案也不畫（遊戲畫字）'}); L.uv_text(sob)

# 日光燈（前段兩排、後段一排）＋夜間光暈位置
FIX = [(x, z) for x in (-1.3, 1.6) for z in (6.3, 4.3, 2.3, 0.3)] + [(0.0, z) for z in (-2.9, -4.9, -6.9)]
tu = ATL['tube']; tuv = ((tu[0] + tu[2]) / 2, (tu[1] + tu[3]) / 2)
for i, (x, z) in enumerate(FIX):
    fx = Part(f'fixture{i}')
    crb(fx['vcm'], x - 0.11, x + 0.11, H - 0.07, H - 0.012, z - 0.64, z + 0.64, '#e9e8e3', r=0.012)
    for s in (-0.05, 0.05):
        for zz in (z - 0.61, z + 0.61): crb(fx['vcm'], x + s - 0.018, x + s + 0.018, H - 0.105, H - 0.07, zz - 0.02, zz + 0.02, '#d9d8d2', r=0.004)   # 燈座
        u = fx['emit']; seg = 8; rr = 0.013; yc = H - 0.09
        for k in range(seg):
            a0, a1 = 2 * math.pi * k / seg, 2 * math.pi * (k + 1) / seg
            q = [(x + s + rr * math.cos(a0), yc + rr * math.sin(a0), z - 0.6), (x + s + rr * math.cos(a1), yc + rr * math.sin(a1), z - 0.6),
                 (x + s + rr * math.cos(a1), yc + rr * math.sin(a1), z + 0.6), (x + s + rr * math.cos(a0), yc + rr * math.sin(a0), z + 0.6)]
            u.face(q, [tuv] * 4, smooth=True)
    fx.done(); CL.glow(root, 'tube', x, H - 0.15, z, color='rgba(236,244,255,1)', size=1.8, day=0.3, night=1.0)
ac = Part('aircon')                                                                           # 天花板的冷氣出風口
crb(ac['vcm'], 0.2, 0.8, H - 0.035, H - 0.001, 5.2, 5.8, '#dedcd6', r=0.008)
for k in range(7): ac['vc'].cbox(0.26 + k * 0.08, 0.3 + k * 0.08, H - 0.04, H - 0.035, 5.27, 5.73, '#9a9892')
ac.done()


# ======================================================================
# 牆上的鐵網格（透明貼圖：每 0.5 m 一片，邊緣一圈鐵管）
# ======================================================================
def wall_grid(side, z0, z1, y0, y1):
    p = Part('grid', side=side); u = p['alpha']; g = ATL['grid']; x = XI1 - 0.04 if side == 'right' else XI0 + 0.04
    z = z0
    while z < z1 - 1e-4:
        zz = min(z + 0.5, z1); y = y0
        while y < y1 - 1e-4:
            yy = min(y + 0.5, y1); fu = (zz - z) / 0.5; fv = (yy - y) / 0.5
            uv = [(g[0], g[1]), (g[0] + (g[2] - g[0]) * fu, g[1]), (g[0] + (g[2] - g[0]) * fu, g[1] + (g[3] - g[1]) * fv), (g[0], g[1] + (g[3] - g[1]) * fv)]
            u.face([(x, y, z), (x, y, zz), (x, yy, zz), (x, yy, z)], uv); y = yy
        z = zz
    c = p['vcm']; col = '#8b9094'
    for (a, b) in (((x, y0, z0), (x, y0, z1)), ((x, y1, z0), (x, y1, z1)), ((x, y0, z0), (x, y1, z0)), ((x, y0, z1), (x, y1, z1))): ccyl(c, a, b, 0.006, col, seg=6)
    for zz in (z0 + 0.3, (z0 + z1) / 2, z1 - 0.3):   # 固定在牆上的支架
        for yy in (y0 + 0.1, y1 - 0.1):
            xw = XI1 if side == 'right' else XI0; ccyl(c, (xw, yy, zz), (x, yy, zz), 0.008, '#6f7377', seg=6)
    p.done()


# ---------------- 右牆：球拍牆 ----------------
RZ0, RZ1 = -1.45, 7.4
wall_grid('right', RZ0, RZ1, 0.25, 3.45)
hooks = Part('hooks', side='right')
XR = XI1 - 0.04
def hook(y, z, L_=0.09):
    ccyl(hooks['vcm'], (XR, y, z), (XR - L_, y + 0.012, z), 0.0028, '#9ba0a4', seg=5, caps=False)


def hang_badminton(z, y_bot, i, tilt):
    fc = BAD_FRAME[(i * 7 + int(z * 13)) % len(BAD_FRAME)]; gc = GRIPS[(i * 5 + 3) % len(GRIPS)]
    xo = XR - 0.03 - (0.012 if i % 2 else 0.0)
    pt = Part(f'bad_{i}', side='right', T=fm((xo, y_bot, z), rot('X', tilt))); badminton(pt, fc, gc, strings=True); pt.done()
    hook(y_bot + 0.43, z)


n_b = 0
for row, (yb, za, zb, step) in enumerate(((2.74, -1.38, 7.32, 0.17), (2.02, -0.32, 7.32, 0.17))):
    z = za + (0.085 if row else 0.0)
    while z <= zb:
        hang_badminton(z, yb + random.uniform(-0.02, 0.02), n_b, random.uniform(-0.05, 0.05)); n_b += 1; z += step
TEN = [('#1d1d21', '#f2f0ea', '#e2cc1e'), ('#c8202a', '#1e1e20', '#e8e6e0'), ('#e2cc1e', '#1e1e20', '#1d1d21'), ('#1f4fa0', '#f2f0ea', '#e8e6e0'), ('#e8e6e0', '#d2303a', '#c8202a')]
for i, z in enumerate([2.3 - k * 0.29 for k in range(9)]):
    fc, gc, ac_ = TEN[i % len(TEN)]
    pt = Part(f'ten_{i}', side='right', T=fm((XR - 0.035 - (0.016 if i % 2 else 0), 1.16, z), rot('X', random.uniform(-0.04, 0.04)))); tennis(pt, fc, gc, ac_); pt.done()
    hook(1.16 + 0.24, z, 0.1)
# 穿線機上方的拍線（一捲一捲掛在網格上）
for i, z in enumerate((7.05, 6.75, 6.45, 6.15, 5.85, 4.35, 4.05, 3.75)):
    pt = Part(f'reel_{i}', side='right', T=fm((XR - 0.035, 1.72 if i % 2 else 1.5, z), rot('Z', math.pi / 2)))
    col = ['#f2f0ea', '#e2cc1e', '#d9579a', '#2f6fb8', '#ee7a1e', '#2e8a4a', '#f2f0ea', '#c8202a'][i]
    clathe(pt['vc'], [(0.006, -0.012), (0.055, -0.012), (0.055, -0.008), (0.04, -0.007), (0.04, 0.007), (0.055, 0.008), (0.055, 0.012), (0.006, 0.012)], 0, 0, 0, '#2a2c30', seg=14)
    clathe(pt['vc'], [(0.041, -0.0068), (0.052, -0.006), (0.052, 0.006), (0.041, 0.0068)], 0, 0, 0, col, seg=14)
    pt.done(); hook(1.72 if i % 2 else 1.5, z, 0.06)
# 價目卡（夾在網格上）
for i, (y, z) in enumerate(((2.66, 6.4), (2.66, 3.1), (1.95, 1.3), (2.66, 0.2), (1.95, 4.9), (1.1, 2.4))):
    pt = Part(f'tag_{i}', side='right'); pt['goods'].box(XR - 0.012, y, z, 0.004, 0.07, 0.1, 'tags', front='-x'); pt.done()
hooks.done()
# 桌球拍洞洞板（右牆中段）
tt = IT['tt_board']; tz, ty, tw, th = tt['z'], tt['y'], tt['w'], tt['h']
pb = Part('ttboard', side='right'); xb = XI1 - 0.07
pb['alpha'].rect((xb, ty, tz), (0, 0, 1), (0, 1, 0), tw / 2, th / 2, ATL['peg'])
for (a0, a1, b0, b1) in ((tz - tw / 2 - 0.03, tz - tw / 2, ty - th / 2 - 0.03, ty + th / 2 + 0.03), (tz + tw / 2, tz + tw / 2 + 0.03, ty - th / 2 - 0.03, ty + th / 2 + 0.03),
                         (tz - tw / 2, tz + tw / 2, ty - th / 2 - 0.03, ty - th / 2), (tz - tw / 2, tz + tw / 2, ty + th / 2, ty + th / 2 + 0.03)):
    pb['wood'].rbox(xb - 0.015, XI1 - 0.04, b0, b1, a0, a1, r=0.005)
pb.done()
pi = 0
for r_ in range(4):
    for cz in range(3):
        y = ty + th / 2 - 0.36 - r_ * 0.34; z = tz - 0.34 + cz * 0.34
        red_first = (cz + r_) % 2 == 0
        pt = Part(f'tt_{pi}', side='right', T=fm((xb - 0.03, y, z), rot('X', random.uniform(-0.06, 0.06)))); tt_paddle(pt, '#1b1b1d', '#c0262a' if red_first else '#1b1b1d'); pt.done()
        ccyl(hooks['vcm'], (xb, y + 0.07, z), (xb - 0.05, y + 0.08, z), 0.0025, '#9ba0a4', seg=5, caps=False); pi += 1
hooks.done()
# 右牆下的矮櫃：球拍袋、羽球筒紙箱
rb = IT['racket_bench']; bx, bz, bw, bd, bh = rb['x'], rb['z'], rb['w'], rb['d'], rb['h']
pr = Part('bench'); pr['wood'].rbox(bx - bw / 2, bx + bw / 2, 0.06, bh, bz - bd / 2, bz + bd / 2, r=0.012)
crb(pr['vc'], bx - bw / 2 + 0.02, bx + bw / 2 - 0.02, 0.0, 0.06, bz - bd / 2 + 0.02, bz + bd / 2 - 0.02, '#3e3a36', r=0.004)
for k in range(3): crb(pr['vc'], bx - bw / 2 - 0.004, bx - bw / 2 + 0.002, 0.12, bh - 0.06, bz - bd / 2 + 0.05 + k * bd / 3, bz - bd / 2 + bd / 3 - 0.03 + k * bd / 3, '#8c6a46', r=0.004)   # 三個櫃門的縫
for k, (zc, col) in enumerate(((bz - 0.75, '#23304f'), (bz + 0.2, '#1d1d21'))):            # 兩個球拍袋（長條、圓角）
    crb(pr['vc'], bx - 0.17, bx + 0.15, bh, bh + 0.2, zc - 0.38, zc + 0.38, col, r=0.07, seg=3)
    crb(pr['vc'], bx - 0.175, bx + 0.155, bh + 0.08, bh + 0.11, zc - 0.385, zc + 0.385, '#c23b3b', r=0.012)
    ccyl(pr['vc'], (bx - 0.17, bh + 0.2, zc - 0.25), (bx - 0.17, bh + 0.2, zc + 0.25), 0.008, '#111111', seg=5)
pr['goods'].box(bx - 0.02, bh + 0.15, bz + 0.92, 0.32, 0.3, 0.4, 'kraft', front='-x'); pr['goods'].box(bx - 0.04, bh + 0.43, bz + 0.92, 0.26, 0.26, 0.34, 'kraft2', front='-x')
pr.done()


# ---------------- 穿線機 ----------------
st = IT['stringer']; sx, sz = st['x'], st['z']
NAVY, GREYM, LG = '#2b3f6e', '#8d9196', '#c9ccd0'
ps = Part('stringer', T=fm((sx, 0, sz)))
c, cm = ps['vc'], ps['vcm']
clathe(c, [(0.0, 0.0), (0.33, 0.0), (0.34, 0.015), (0.31, 0.045), (0.12, 0.075), (0.09, 0.1), (0.0, 0.1)], 0, 0, 0, NAVY, seg=24)   # 底座
for k in range(4): a = math.pi / 4 + k * math.pi / 2; clathe(cm, [(0, 0), (0.022, 0), (0.022, 0.012), (0, 0.012)], 0.3 * math.cos(a), -0.008, 0.3 * math.sin(a), '#3a3c40', seg=8)
clathe(c, [(0.058, 0.0), (0.058, 0.8), (0.07, 0.82), (0.07, 0.86), (0.0, 0.86)], 0, 0.1, 0, NAVY, seg=16)          # 立柱
clathe(cm, [(0.0, 0.0), (0.09, 0.0), (0.095, 0.02), (0.08, 0.05), (0.0, 0.05)], 0, 0.96, 0, GREYM, seg=18)          # 轉盤軸心
crb(c, -0.045, 0.045, 1.0, 1.045, -0.44, 0.44, NAVY, r=0.012)                                                         # 轉盤（沿 z）
for s in (-1, 1):
    crb(c, -0.16, 0.16, 1.005, 1.035, s * 0.14 - 0.025, s * 0.14 + 0.025, NAVY, r=0.008)                              # 側邊支撐臂
    for xx in (-0.14, 0.14): ccyl(cm, (xx, 1.035, s * 0.14), (xx, 1.09, s * 0.14), 0.011, GREYM, seg=8)
    ccyl(cm, (0, 1.045, s * 0.4), (0, 1.1, s * 0.4), 0.016, GREYM, seg=10)                                            # 兩端的頂柱
    crb(cm, -0.02, 0.02, 1.095, 1.125, s * 0.4 - 0.025, s * 0.4 + 0.025, '#5e6266', r=0.004)
for s in (-1, 1):                                                                                                     # 兩個浮動夾頭（在拍面上）
    crb(cm, -0.05, 0.05, 1.12, 1.15, s * 0.05 - 0.03, s * 0.05 + 0.03, '#6f7377', r=0.006); ccyl(cm, (0, 1.15, s * 0.05), (0, 1.2, s * 0.05), 0.006, '#a0a4a8', seg=6)
    crb(c, -0.012, 0.012, 1.195, 1.215, s * 0.05 - 0.012, s * 0.05 + 0.012, '#c8202a', r=0.005)
crb(c, -0.06, 0.06, 0.9, 0.95, 0.42, 0.9, NAVY, r=0.015)                                                              # 拉線頭的軌道
ccyl(cm, (0, 0.62, 0.0), (0, 0.9, 0.86), 0.025, NAVY, seg=8)                                                          # 斜撐
crb(c, -0.12, 0.12, 0.95, 1.16, 0.62, 0.95, LG, r=0.03, seg=3)                                                        # 拉線頭本體
crb(c, -0.125, -0.06, 1.1, 1.18, 0.65, 0.92, '#3d5384', r=0.02, seg=2)                                                # 控制面板（朝操作的人：−x）
ccyl(cm, (0, 1.1, 0.62), (0, 1.1, 0.5), 0.016, GREYM, seg=10); crb(cm, -0.02, 0.02, 1.085, 1.115, 0.46, 0.5, '#4a4d52', r=0.004)   # 夾線嘴
for j in range(3):
    for k in range(4): crb(c, -0.129, -0.12, 1.112 + j * 0.018, 1.126 + j * 0.018, 0.66 + k * 0.022, 0.676 + k * 0.022, '#e8e8e4' if (j + k) % 3 else '#d23a3a', r=0.002, seg=1)
lc = ATL['lcd']; ps['emit'].rect((-0.1265, 1.155, 0.83), (0, 0, 1), (0, 1, 0), 0.07, 0.018, lc)                     # 小螢幕
clathe(c, [(0.0, 0.0), (0.14, 0.0), (0.15, 0.02), (0.15, 0.035), (0.13, 0.035), (0.13, 0.02), (0.0, 0.02)], 0, 0.72, 0, NAVY, seg=18)   # 工具盤
for k, col in enumerate(('#c8202a', '#1d1d21', '#e2cc1e')): crb(c, -0.1 + k * 0.05, -0.07 + k * 0.05, 0.74, 0.755, -0.06, 0.06, col, r=0.004)   # 鉗子、錐子的柄
clathe(c, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.17), (0.03, 0.18), (0.0, 0.18)], 0.07, 0.74, 0.07, '#7a8a96', seg=10)  # 老闆的保溫杯
# 線軸（掛在立柱右側的軸上）
ps.done()
sp = Part('spool', T=fm((sx + 0.12, 0.5, sz + 0.05), rot('Z', math.pi / 2)))
clathe(sp['vc'], [(0.012, -0.05), (0.07, -0.05), (0.07, -0.042), (0.045, -0.04), (0.045, 0.04), (0.07, 0.042), (0.07, 0.05), (0.012, 0.05)], 0, 0, 0, '#1d1d21', seg=18)
clathe(sp['vc'], [(0.046, -0.039), (0.063, -0.037), (0.064, 0.0), (0.063, 0.037), (0.046, 0.039)], 0, 0, 0, '#f2f0ea', seg=18)
ccyl(sp['vcm'], (0, -0.08, 0), (0, 0.06, 0), 0.008, GREYM, seg=6); sp.done()
ar = Part('spool_arm'); ccyl(ar['vcm'], (sx + 0.05, 0.5, sz + 0.05), (sx + 0.2, 0.5, sz + 0.05), 0.01, GREYM, seg=6); ar.done()
# 夾在轉盤上的羽球拍（平放、穿到一半）＋一條從線軸拉上來的線
pk = Part('stringer_racket', T=fm((sx, 1.215, sz - 0.567), Matrix(((0, 0, 1), (1, 0, 0), (0, 1, 0))))); badminton(pk, '#1f4fa0', '#f2f0ea'); pk.done()
ln = Part('loose_string')
pts = [(sx + 0.12, 0.56, sz + 0.05), (sx + 0.05, 0.85, sz + 0.12), (sx + 0.02, 1.1, sz + 0.2), (sx, 1.21, sz + 0.1)]
for a, b in zip(pts, pts[1:]): ccyl(ln['vc'], a, b, 0.0012, '#f2f0ea', seg=3, caps=False)
ln.done()
# 地上剪下來的線頭（生活痕跡）
cut = Part('string_bits')
for k in range(5):
    x0_ = sx - 0.5 + random.uniform(-0.3, 0.2); z0_ = sz + random.uniform(-0.5, 0.6); a = random.uniform(0, math.pi)
    p0 = (x0_, 0.002, z0_)
    for j in range(3):
        a += random.uniform(-0.8, 0.8); p1 = (p0[0] + 0.05 * math.cos(a), 0.002, p0[2] + 0.05 * math.sin(a)); ccyl(cut['vc'], p0, p1, 0.0012, ['#f2f0ea', '#e2cc1e', '#d9579a'][k % 3], seg=3, caps=False); p0 = p1
cut.done()

# ---------------- 工作推車（有抽屜） ----------------
ct = IT['cart']; cx, cz, cw, cd, ch = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
pc = Part('cart'); c, cm = pc['vc'], pc['vcm']
for sx_ in (-1, 1):
    for sz_ in (-1, 1):
        px, pz = cx + sx_ * (cw / 2 - 0.02), cz + sz_ * (cd / 2 - 0.02)
        ccyl(cm, (px, 0.1, pz), (px, ch, pz), 0.012, '#b3b7ba', seg=8)
        clathe(c, [(0.0, -0.035), (0.035, -0.035), (0.04, 0.0), (0.035, 0.035), (0.0, 0.035)], px, 0.045, pz, '#2a2a2c', seg=10, R=rot('Z', math.pi / 2))   # 腳輪
        crb(cm, px - 0.02, px + 0.02, 0.07, 0.1, pz - 0.02, pz + 0.02, '#8d9196', r=0.004)
for y in (0.16, 0.5, ch - 0.02):
    crb(cm, cx - cw / 2, cx + cw / 2, y, y + 0.02, cz - cd / 2, cz + cd / 2, '#b9bdc0', r=0.005)
    for s in (-1, 1): crb(cm, cx - cw / 2, cx + cw / 2, y + 0.02, y + 0.05, cz + s * (cd / 2 - 0.006) - 0.006, cz + s * (cd / 2 - 0.006) + 0.006, '#b9bdc0', r=0.003)
for k in range(3):                                                                                                     # 中層的塑膠抽屜櫃（三格）
    y = 0.52 + k * 0.11; crb(c, cx - 0.2, cx + 0.2, y, y + 0.1, cz - 0.34, cz + 0.34, '#e3e5e6', r=0.012)
    crb(c, cx - 0.21, cx - 0.2, y + 0.035, y + 0.06, cz - 0.08, cz + 0.08, '#9aa0a6', r=0.004)
# 上層：剪刀、鉗子、噴瓶、裝線頭的小盒、掛在前緣的毛巾
top = ch + 0.0
clathe(c, [(0.0, 0.0), (0.032, 0.0), (0.034, 0.13), (0.022, 0.16), (0.012, 0.17), (0.012, 0.2), (0.0, 0.2)], cx + 0.1, top, cz + 0.22, '#dfe8ef', seg=12)   # 噴瓶
crb(c, cx + 0.095, cx + 0.135, top + 0.19, top + 0.22, cz + 0.2, cz + 0.27, '#2f6fb8', r=0.006)
crb(c, cx - 0.12, cx + 0.04, top, top + 0.05, cz - 0.3, cz - 0.12, '#c8202a', r=0.008)                               # 小盒
for j in range(4): ccyl(c, (cx - 0.1 + j * 0.03, top + 0.05, cz - 0.28), (cx - 0.08 + j * 0.03, top + 0.052, cz - 0.15), 0.0015, '#f2f0ea', seg=3, caps=False)
for j, col in enumerate(('#1d1d21', '#d2303a')):
    crb(c, cx - 0.1 + j * 0.08, cx - 0.085 + j * 0.08, top, top + 0.012, cz - 0.05, cz + 0.1, col, r=0.003)
    crb(cm, cx - 0.098 + j * 0.08, cx - 0.087 + j * 0.08, top, top + 0.008, cz + 0.1, cz + 0.18, '#c9ccce', r=0.002)
n0 = len(c.bm.faces); vs = []
for k in range(7):                                                                                                     # 毛巾：從上層前緣垂下來（彎一下）
    t = k / 6; xx = cx - cw / 2 + 0.12 * (1 - t) ** 2 - 0.02 * t; yy = top + 0.03 - 0.34 * t ** 1.3 + 0.03 * (1 - t); vs.append((xx, yy))
cols = []
rows = [[c.bm.verts.new(g2b(xx, yy, cz + 0.02 + 0.07 * math.sin(k * 0.7) * 0.1)), c.bm.verts.new(g2b(xx - 0.005, yy, cz + 0.28))] for k, (xx, yy) in enumerate(vs)]
for a, b in zip(rows, rows[1:]): c.bm.faces.new((a[0], a[1], b[1], b[0]))
c.paint(_new(c, n0), '#e8ece6')
pc.done()

# ---------------- 鐵網特價桶（插著幾支球拍）----------------
wb = IT['wire_bin']; wx, wz, ww, wd, wh = wb['x'], wb['z'], wb['w'], wb['d'], wb['h']
pw = Part('wirebin'); cm = pw['vcm']; WC = '#9aa0a5'
for y in (0.08, wh * 0.5, wh):
    for (a, b) in (((wx - ww / 2, y, wz - wd / 2), (wx + ww / 2, y, wz - wd / 2)), ((wx + ww / 2, y, wz - wd / 2), (wx + ww / 2, y, wz + wd / 2)),
                   ((wx + ww / 2, y, wz + wd / 2), (wx - ww / 2, y, wz + wd / 2)), ((wx - ww / 2, y, wz + wd / 2), (wx - ww / 2, y, wz - wd / 2))):
        ccyl(cm, a, b, 0.006 if y == wh else 0.0035, WC, seg=6)
for k in range(11):
    x = wx - ww / 2 + k * ww / 10
    for zz in (wz - wd / 2, wz + wd / 2): ccyl(cm, (x, 0.08, zz), (x, wh, zz), 0.003, WC, seg=4, caps=False)
    ccyl(cm, (x, 0.08, wz - wd / 2), (x, 0.08, wz + wd / 2), 0.003, WC, seg=4, caps=False)
for k in range(8):
    z = wz - wd / 2 + k * wd / 7
    for xx in (wx - ww / 2, wx + ww / 2): ccyl(cm, (xx, 0.08, z), (xx, wh, z), 0.003, WC, seg=4, caps=False)
for sx_ in (-1, 1):
    for sz_ in (-1, 1): ccyl(cm, (wx + sx_ * ww / 2, 0.0, wz + sz_ * wd / 2), (wx + sx_ * ww / 2, 0.08, wz + sz_ * wd / 2), 0.008, '#5a5e62', seg=6)
pw.done()
for k in range(7):
    px = wx - ww / 2 + 0.12 + (k % 4) * 0.18; pz = wz - 0.12 + (k // 4) * 0.22
    R = rot('Y', random.uniform(-1.6, -1.4) + (k % 2) * 0.25) @ rot('Z', random.uniform(-0.12, 0.12)) @ rot('X', random.uniform(-0.1, 0.1))
    pt = Part(f'bin_rk_{k}', T=fm((px, 0.09, pz), R))
    if k in (2, 5): tennis(pt, TEN[k % 5][0], TEN[k % 5][1], TEN[k % 5][2])
    else: badminton(pt, BAD_FRAME[(k * 3) % 10], GRIPS[k % 6])
    pt.done()
tg = Part('bin_tag'); tg['goods'].box(wx, wh + 0.09, wz + wd / 2 + 0.005, 0.2, 0.15, 0.004, 'tags', front='+z'); ccyl(tg['vcm'], (wx, wh, wz + wd / 2), (wx, wh + 0.02, wz + wd / 2), 0.002, WC, seg=4); tg.done()


# ---------------- 凳子 ----------------
def stool_high(x, z):
    p = Part('stool_high'); w_ = p['wood']; y = 0.7
    bm = L.lathe([(0.0, 0.0), (0.155, 0.0), (0.172, 0.012), (0.175, 0.03), (0.165, 0.042), (0.0, 0.045)], seg=20); w_.add_bm(bm, fm((x, y - 0.045, z))); bm.free()
    feet = [(x + 0.17 * math.cos(a), z + 0.17 * math.sin(a)) for a in (math.pi / 4 + k * math.pi / 2 for k in range(4))]
    tops = [(x + 0.11 * math.cos(a), z + 0.11 * math.sin(a)) for a in (math.pi / 4 + k * math.pi / 2 for k in range(4))]
    for (fx_, fz_), (tx_, tz_) in zip(feet, tops): w_.cyl((fx_, 0.0, fz_), (tx_, y - 0.045, tz_), 0.018, seg=8)
    for hh in (0.22, 0.45):
        t = hh / (y - 0.045); ring = [(f[0] + (tp[0] - f[0]) * t, hh, f[1] + (tp[1] - f[1]) * t) for f, tp in zip(feet, tops)]
        for a, b in zip(ring, ring[1:] + ring[:1]): w_.cyl(a, b, 0.011, seg=6)
    p.done()


def stool_low(x, z, ry):
    p = Part('stool_low', T=fm((x, 0, z), rot('Y', ry))); w_ = p['wood']; y = 0.32
    w_.rbox(-0.16, 0.16, y - 0.03, y, -0.12, 0.12, r=0.012)
    for sx_ in (-1, 1):
        for sz_ in (-1, 1): w_.cyl((sx_ * 0.14, 0.0, sz_ * 0.1), (sx_ * 0.11, y - 0.03, sz_ * 0.08), 0.016, seg=8)
        w_.cyl((sx_ * 0.128, 0.12, -0.092), (sx_ * 0.128, 0.12, 0.092), 0.01, seg=6)
    crb(p['vc'], -0.1, 0.1, y, y + 0.002, -0.07, 0.07, '#7a5a3c', r=0.0)   # 座面磨亮的地方（深一點）
    p.done()


stool_high(IT['stool_high']['x'], IT['stool_high']['z'])
stool_low(IT['stool_low']['x'], IT['stool_low']['z'], 2.35)


# ======================================================================
# 左牆：網格（握把布、拍線、桌球）、下層籃子、上層木板、電視、黃金葛
# ======================================================================
LZ0, LZ1 = -1.4, 7.4
wall_grid('left', LZ0, LZ1, 1.15, 2.7)
XL = XI0 + 0.04
lh = Part('lhooks', side='left')
items = Part('lgoods', side='left')
cells_ = ['grip_y', 'grip_p', 'grip_b', 'str_pack', 'grip_y', 'str_pack', 'grip_b', 'box_org']
k = 0
for row, y in enumerate((2.5, 2.1, 1.7, 1.33)):
    z = LZ1 - 0.15 - (0.06 if row % 2 else 0)
    while z > LZ0 + 0.1:
        if 5.55 < z < 6.85 and y > 2.0: z -= 0.16; continue          # 電視後面
        cn = cells_[(k * 3 + row) % len(cells_)]
        big = cn in ('str_pack', 'box_org'); hgt = 0.2 if not big else 0.18; wid = 0.1 if not big else 0.14
        ccyl(lh['vcm'], (XI0, y, z), (XL + 0.08, y + 0.01, z), 0.0026, '#9ba0a4', seg=5, caps=False)
        for j in range(2 if big else 3):
            items['goods'].box(XL + 0.012 + j * 0.007, y - hgt / 2 - 0.01 - j * 0.004, z, 0.004, hgt, wid, cn, front='+x', skip=('-y', '+y'))
        z -= wid + 0.06; k += 1
lh.done(); items.done()
# 上層木板（z 4.8～−1.4）：桌球盒、球拍盒、紙箱
us = Part('upper_shelf', side='left'); yS = 2.75
us['wood'].rbox(XI0, XI0 + 0.36, yS - 0.03, yS, -1.4, 4.85, r=0.006)
for z in (-1.1, 0.9, 2.9, 4.6): ccyl(us['vcm'], (XI0, yS - 0.2, z), (XI0 + 0.3, yS - 0.035, z), 0.008, '#6f7377', seg=6)
z = -1.3
while z < 4.0:
    kind = random.choice(['box_org', 'shoebox', 'kraft', 'kraft2', 'box_org', 'tube_a'])
    if kind == 'tube_a':
        us['goods'].tube(XI0 + 0.18, z + 0.05, yS, yS + 0.4, 0.045, 'tube_a', seg=10)
        clathe(us['vc'], [(0, 0), (0.047, 0), (0.047, 0.02), (0, 0.02)], XI0 + 0.18, yS + 0.4, z + 0.05, '#22396a', seg=10); z += 0.12; continue
    w_ = random.uniform(0.2, 0.32); h_ = random.uniform(0.12, 0.3) if kind != 'box_org' else 0.09
    nst = 1 if kind in ('kraft', 'kraft2') else random.randint(1, 3)
    for j in range(nst): us['goods'].box(XI0 + 0.17, yS + h_ / 2 + j * h_, z + w_ / 2, 0.3, h_, w_, kind, front='+x')
    z += w_ + random.uniform(0.02, 0.08)
us.done()
# 下層木板＋籃子（y 0.85）
ls = Part('lower_shelf', side='left'); yL = 0.85
ls['wood'].rbox(XI0, XI0 + 0.36, yL - 0.03, yL, LZ0, LZ1, r=0.006)
for z in (-1.2, 1.0, 3.2, 5.4, 7.2): ccyl(ls['vcm'], (XI0, yL - 0.2, z), (XI0 + 0.3, yL - 0.035, z), 0.008, '#6f7377', seg=6)
z = LZ1 - 0.25
while z > LZ0 + 0.25:
    bc = random.choice(['#f2f2ee', '#3a78c0', '#f2f2ee', '#d8c35a']); c = ls['vc']; bx0, bx1, z0_, z1_ = XI0 + 0.04, XI0 + 0.33, z - 0.2, z + 0.2
    c.cbox(bx0, bx1, yL, yL + 0.008, z0_, z1_, bc)
    for (a0, a1, b0, b1) in ((bx0, bx1, z0_, z0_ + 0.006), (bx0, bx1, z1_ - 0.006, z1_), (bx0, bx0 + 0.006, z0_, z1_), (bx1 - 0.006, bx1, z0_, z1_)): c.cbox(a0, a1, yL, yL + 0.11, b0, b1, bc)
    for j in range(4):
        gc = random.choice(GRIPS + ['#d9579a', '#2e8a4a']); ccyl(c, (bx0 + 0.03, yL + 0.035 + (j % 2) * 0.03, z0_ + 0.06 + j * 0.08), (bx1 - 0.03, yL + 0.035 + (j % 2) * 0.03, z0_ + 0.06 + j * 0.08), 0.017, gc, seg=8)
    z -= 0.46
for z in (6.6, 5.6, 1.9, 0.5, -0.7):                                                     # 木板下的紙箱
    ls['goods'].box(XI0 + 0.2, 0.17, z, 0.36, 0.34, 0.5, random.choice(['kraft', 'kraft2']), front='+x')
ls.done()
# 電視（老闆看比賽：抽象的綠色球場色塊）
tv = IT['tv']; tvx, tvy, tvz, tvr = tv['x'] + 0.2, tv['y'], tv['z'], tv['ry']
pt = Part('tv', side='left', T=fm((tvx, tvy, tvz), rot('Y', tvr)))
crb(pt['vc'], -0.56, 0.56, -0.33, 0.33, -0.035, 0.0, '#18181a', r=0.01); crb(pt['vc'], -0.3, 0.3, -0.2, 0.2, -0.07, -0.035, '#222224', r=0.02)
crb(pt['vc'], -0.05, 0.05, -0.33, -0.315, 0.0, 0.004, '#3a3a3c', r=0.0)
pt['emit'].rect((0, 0.0, 0.002), (1, 0, 0), (0, 1, 0), 0.535, 0.3, ATL['tv']); pt.done()
bk = Part('tv_arm', side='left')
back = Vector((tvx, tvy, tvz)) + rot('Y', tvr) @ Vector((0, 0, -0.07))
ccyl(bk['vcm'], (XI0, tvy, back.z), (back.x, back.y, back.z), 0.018, '#2a2a2c', seg=8); crb(bk['vcm'], XI0, XI0 + 0.02, tvy - 0.12, tvy + 0.12, back.z - 0.08, back.z + 0.08, '#2a2a2c', r=0.004)
for a, b in (((XI0 + 0.01, tvy - 0.33, back.z), (XI0 + 0.01, 0.3, back.z)),): ccyl(bk['vc'], a, b, 0.006, '#e8e4da', seg=5)   # 電線沿牆往下
bk.done()
# 黃金葛（上層木板上的盆栽，藤垂到網格前）
hp = IT['hanging_plant']; px, pz = XI0 + 0.17, 4.55
pp = Part('pothos', side='left')
clathe(pp['vc'], [(0.0, 0.0), (0.08, 0.0), (0.1, 0.02), (0.13, 0.16), (0.14, 0.17), (0.12, 0.17), (0.0, 0.15)], px, yS, pz, '#9a5a36', seg=16)   # 陶盆
clathe(pp['vc'], [(0.0, 0.0), (0.122, 0.0), (0.0, 0.01)], px, yS + 0.15, pz, '#3e3024', seg=12)
rk = random.Random(9)
def leaf(c, base, yaw, pitch, s, col):
    fwd = rot('Y', yaw) @ rot('X', -pitch) @ Vector((0, 0, 1)); side_ = rot('Y', yaw) @ Vector((1, 0, 0)); b = Vector(base)
    tip = b + fwd * s; mid = b + fwd * s * 0.42; lft = mid + side_ * s * 0.38 + Vector((0, 0.012, 0)); rgt = mid - side_ * s * 0.38 + Vector((0, 0.012, 0))
    vs = [c.bm.verts.new(g2b(*p)) for p in (b, rgt, tip, lft)]; mv = c.bm.verts.new(g2b(*(mid + Vector((0, -0.006, 0)))))
    fs = [c.bm.faces.new((vs[0], vs[1], mv)), c.bm.faces.new((vs[1], vs[2], mv)), c.bm.faces.new((vs[2], vs[3], mv)), c.bm.faces.new((vs[3], vs[0], mv))]; c.paint(fs, col)
for v in range(9):
    a = rk.uniform(-0.6, 2.6); r0 = 0.11; cur = Vector((px + r0 * math.cos(a), yS + 0.16, pz + r0 * math.sin(a)))
    drop = rk.uniform(0.15, 1.25) if v > 2 else rk.uniform(0.05, 0.3); n = int(6 + drop * 14)
    dirv = Vector((math.cos(a) * 0.6 + 0.4, 0, math.sin(a) * 0.9))
    for j in range(n):
        t = j / max(1, n - 1)
        nxt = cur + Vector((dirv.x * 0.035 * (1 - t) + 0.004, -drop / n * (0.3 + 1.4 * t), dirv.z * 0.03 + 0.012 * math.sin(j * 0.9 + v)))
        nxt.x = max(nxt.x, XL + 0.03); ccyl(pp['vc'], tuple(cur), tuple(nxt), 0.0028, '#5f7a3a', seg=3, caps=False)
        if j % 1 == 0:
            g = rk.choice(['#3f6a32', '#4f7d3a', '#5d8a3e', '#6d9a45', '#3a5e2e']); leaf(pp['vc'], tuple(nxt), rk.uniform(0, 2 * math.pi), rk.uniform(0.3, 1.2), rk.uniform(0.045, 0.075), g)
        cur = nxt
for j in range(14): leaf(pp['vc'], (px + rk.uniform(-0.09, 0.09), yS + 0.16 + rk.uniform(0, 0.08), pz + rk.uniform(-0.09, 0.09)), rk.uniform(0, 6.3), rk.uniform(-0.3, 0.6), rk.uniform(0.05, 0.08), rk.choice(['#3f6a32', '#5d8a3e', '#4f7d3a']))
pp.done()


# ======================================================================
# 玻璃展示櫃、木櫃台
# ======================================================================
gc_ = IT['glass_case']; gx, gz, gw, gd, gh = gc_['x'], gc_['z'], gc_['w'], gc_['d'], gc_['h']
xa, xb_, za, zb = gx - gw / 2, gx + gw / 2, gz - gd / 2, gz + gd / 2
pg = Part('glasscase'); c, cm = pg['vc'], pg['vcm']
crb(c, xa, xb_, 0.0, 0.26, za, zb, '#d8d4ca', r=0.01); crb(c, xa + 0.02, xb_ - 0.02, 0.0, 0.05, za + 0.02, zb - 0.02, '#4a4744', r=0.004)
crb(c, xb_ - 0.005, xb_ + 0.002, 0.08, 0.22, za + 0.05, zb - 0.05, '#c9c4b8', r=0.003)                                   # 底櫃的面板縫
for x in (xa, xb_):
    for z in (za, zb, gz): crb(cm, x - 0.012, x + 0.012, 0.26, gh, z - 0.012, z + 0.012, ALU, r=0.004)
for y in (0.26, gh - 0.02):
    for (a0, a1, b0, b1) in ((xa, xb_, za - 0.012, za + 0.012), (xa, xb_, zb - 0.012, zb + 0.012), (xa - 0.012, xa + 0.012, za, zb), (xb_ - 0.012, xb_ + 0.012, za, zb)): crb(cm, a0, a1, y, y + 0.022, b0, b1, ALU, r=0.004)
gl = pg['glass']
gl.quad([(xb_, 0.28, zb), (xb_, 0.28, za), (xb_, gh - 0.02, za), (xb_, gh - 0.02, zb)]); gl.quad([(xa, 0.28, za), (xa, 0.28, zb), (xa, gh - 0.02, zb), (xa, gh - 0.02, za)])
gl.quad([(xa, gh, zb), (xb_, gh, zb), (xb_, gh, za), (xa, gh, za)]); gl.quad([(xa, 0.28, zb), (xb_, 0.28, zb), (xb_, gh - 0.02, zb), (xa, gh - 0.02, zb)]); gl.quad([(xb_, 0.28, za), (xa, 0.28, za), (xa, gh - 0.02, za), (xb_, gh - 0.02, za)])
gl.box(xa + 0.02, xb_ - 0.02, 0.62, 0.628, za + 0.02, zb - 0.02)                                                     # 玻璃層板
for z in (za + 0.6, zb - 0.6): ccyl(cm, (xa + 0.03, 0.28, z), (xa + 0.03, 0.62, z), 0.006, ALU, seg=6)
gd_ = pg['goods']
z = zb - 0.16
while z > za + 0.15:                                                                                                    # 下層：膠皮（斜靠著，朝客人）
    for j in range(2):
        gd_.box(xa + 0.32 + j * 0.16, 0.27 + 0.12, z, 0.01, 0.22, 0.18, random.choice(['rub_red', 'rub_blk', 'rub_red']), front='+x')
    z -= 0.24
pg.done()
for j in range(5):    # 中層：拍線捲（平放）、桌球盒
    z = zb - 0.35 - j * 0.6; col = random.choice(['#f2f0ea', '#e2cc1e', '#d9579a', '#2f6fb8', '#ee7a1e'])
    pt = Part(f'case_reel_{j}'); clathe(pt['vc'], [(0.0, 0.0), (0.075, 0.0), (0.08, 0.008), (0.08, 0.02), (0.075, 0.028), (0.0, 0.028)], xa + 0.25, 0.628, z, col, seg=16)
    clathe(pt['vc'], [(0.0, 0.0), (0.03, 0.0), (0.03, 0.03), (0.0, 0.03)], xa + 0.25, 0.63, z, '#1d1d21', seg=10)
    pt['goods'].box(xa + 0.5, 0.628 + 0.045, z - 0.05, 0.12, 0.09, 0.2, 'box_org', front='+x'); pt.done()
for j in range(6):    # 下層前面：散放的桌球（橘、白）
    pt = Part(f'case_balls_{j}'); z = za + 0.3 + j * 0.5
    for q in range(4): csph(pt['vc'], (xb_ - 0.08 - (q % 2) * 0.045, 0.28 + 0.02, z + (q // 2) * 0.045), 0.02, '#f08a24' if (q + j) % 3 else '#f4f2ec', seg=8, rings=5)
    pt.done()

ko = IT['counter']; kx, kz, kw, kd, kh = ko['x'], ko['z'], ko['w'], ko['d'], ko['h']
xa, xb_, za, zb = kx - kw / 2, kx + kw / 2, kz - kd / 2, kz + kd / 2
pk = Part('counter'); w_ = pk['wood']; c = pk['vc']
w_.rbox(xa + 0.02, xb_, 0.08, kh - 0.04, za, zb, r=0.008)                                                                # 櫃身
w_.rbox(xa - 0.02, xb_ + 0.03, kh - 0.04, kh, za - 0.03, zb + 0.03, r=0.008)                                             # 檯面（出挑）
crb(c, xa + 0.05, xb_ - 0.04, 0.0, 0.08, za + 0.03, zb - 0.03, '#3d3530', r=0.004)                                      # 踢腳
n_p = 5
for k in range(n_p + 1):                                                                                               # 客人那一面：直條飾板＋上下橫條（老櫃台）
    z = za + 0.03 + k * (kd - 0.06) / n_p; w_.rbox(xb_, xb_ + 0.018, 0.1, kh - 0.05, z - 0.025, z + 0.025, r=0.005)
w_.rbox(xb_, xb_ + 0.02, 0.1, 0.16, za, zb, r=0.006); w_.rbox(xb_, xb_ + 0.02, kh - 0.12, kh - 0.05, za, zb, r=0.006)
crb(c, xb_ + 0.0, xb_ + 0.021, 0.08, 0.14, za + 0.2, za + 0.9, '#6f5236', r=0.004)                                      # 踢到的磨痕
for k in range(3):                                                                                                     # 老闆那一面：開放格（紙箱、塑膠袋捲）
    z0_ = za + 0.15 + k * 1.1; pk['goods'].box(xa + 0.25, 0.3, z0_ + 0.4, 0.3, 0.38, 0.6, 'kraft2', front='-x')
crb(c, xa + 0.02, xa + 0.04, 0.55, 0.57, za + 0.05, zb - 0.05, '#6f5236', r=0.004)
pk.done()
# 檯面上的東西
T_ = kh
pt = Part('counter_top'); c, cm, gd_ = pt['vc'], pt['vcm'], pt['goods']
mx, mz = kx - 0.05, kz + 0.55                                                                                          # 螢幕（朝老闆）
crb(c, mx - 0.02, mx + 0.02, T_ + 0.12, T_ + 0.45, mz - 0.25, mz + 0.25, '#1c1c1e', r=0.008)
clathe(c, [(0, 0), (0.1, 0), (0.1, 0.012), (0.02, 0.02), (0, 0.02)], mx + 0.03, T_, mz, '#2a2a2c', seg=12); ccyl(c, (mx + 0.03, T_ + 0.02, mz), (mx + 0.01, T_ + 0.2, mz), 0.015, '#2a2a2c', seg=8)
pt['emit'].rect((mx - 0.021, T_ + 0.285, mz), (0, 0, 1), (0, 1, 0), 0.23, 0.15, ATL['pos'])
crb(c, kx - 0.25, kx + 0.05, T_, T_ + 0.02, mz - 0.2, mz + 0.2, '#e6e4de', r=0.006)                                    # 鍵盤
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.11), (0.038, 0.11), (0.0, 0.005)], kx + 0.12, T_, kz + 1.1, '#3a4f7a', seg=12)  # 筆筒
for j in range(6):
    a = j * 1.05; ccyl(c, (kx + 0.12 + 0.015 * math.cos(a), T_ + 0.02, kz + 1.1 + 0.015 * math.sin(a)), (kx + 0.12 + 0.03 * math.cos(a), T_ + 0.16, kz + 1.1 + 0.03 * math.sin(a)), 0.004, ['#d23a3a', '#2f4f8a', '#1d1d21', '#e2cc1e', '#2e8a4a', '#f2f0ea'][j], seg=5)
crb(c, kx + 0.0, kx + 0.12, T_, T_ + 0.018, kz + 0.85, kz + 0.94, '#3a3a3c', r=0.006)                                  # 計算機
for j in range(3):
    for q in range(3): c.cbox(kx + 0.012 + j * 0.035, kx + 0.035 + j * 0.035, T_ + 0.018, T_ + 0.022, kz + 0.865 + q * 0.025, kz + 0.882 + q * 0.025, '#d8d8d4')
gd_.box(kx + 0.05, T_ + 0.004, kz + 0.25, 0.16, 0.008, 0.22, 'tags', front='+y', skip=('-y',))                          # 收據本
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.09), (0.046, 0.095), (0.0, 0.095)], kx - 0.18, T_, kz + 0.1, '#f2efe6', seg=12)  # 老闆的馬克杯
ccyl(c, (kx - 0.14, T_ + 0.07, kz + 0.1), (kx - 0.125, T_ + 0.03, kz + 0.1), 0.007, '#f2efe6', seg=5)
# 羽球筒（三疊直立，參考圖櫃台前段）＋一盒桌球
TB = ['tube_a', 'tube_b']
for gi, (gz0, nx, nz) in enumerate(((zb - 0.2, 2, 3), (zb - 0.55, 2, 2), (za + 0.35, 2, 2))):
    for i in range(nx):
        for j in range(nz):
            tx_, tz_ = kx + 0.08 - i * 0.1, gz0 - j * 0.1; tier = 2 if (gi == 0 and i == 0) else 1
            for t in range(tier):
                y0 = T_ + t * 0.41; gd_.tube(tx_, tz_, y0, y0 + 0.4, 0.044, TB[(i + j + gi) % 2], seg=10)
                clathe(c, [(0, 0), (0.046, 0), (0.046, 0.022), (0.0, 0.024)], tx_, y0 + 0.4, tz_, '#22396a' if (i + j + gi) % 2 == 0 else '#2f6a3a', seg=10)
gd_.box(kx + 0.02, T_ + 0.07, za + 0.85, 0.28, 0.14, 0.24, 'box_org', front='+x')
for q in range(9): csph(c, (kx - 0.06 + (q % 3) * 0.06, T_ + 0.16, za + 0.79 + (q // 3) * 0.06), 0.02, '#f08a24' if q % 4 else '#f4f2ec', seg=8, rings=5)
for j in range(4): gd_.box(kx - 0.2 + j * 0.0, T_ + 0.012 + j * 0.022, za + 0.5, 0.2, 0.02, 0.17, random.choice(['rub_red', 'rub_blk']), front='+y')  # 一疊膠皮
pt.done()


# ======================================================================
# 後段：走道兩側的鐵架＋紙箱、倉庫、布簾、電風扇
# ======================================================================
def steel_shelf(name, xa, xb_, za, zb, face, levels=(0.08, 0.55, 1.02, 1.49, 1.96), top=2.3, fill=0.8):
    """輕型角鋼架：四根角柱、每層一片板（顆粒板）＋前後橫樑；face＝東西朝哪一面（'+x'、'-x'、'+z'）"""
    p = Part(name); cm, c, g = p['vcm'], p['vc'], p['goods']
    for x in (xa, xb_):
        for z in (za, zb, (za + zb) / 2 if abs(zb - za) > 1.6 else None):
            if z is None: continue
            cm.cbox(x - 0.018, x + 0.018, 0.0, top, z - 0.018, z + 0.018, '#7c8288')
    for y in levels:
        c.cbox(xa + 0.01, xb_ - 0.01, y, y + 0.018, za + 0.01, zb - 0.01, '#c9b48a')
        for (a0, a1, b0, b1) in ((xa, xb_, za - 0.012, za + 0.012), (xa, xb_, zb - 0.012, zb + 0.012)) if face == '+z' else ((xa - 0.012, xa + 0.012, za, zb), (xb_ - 0.012, xb_ + 0.012, za, zb)):
            cm.cbox(a0, a1, y - 0.03, y + 0.005, b0, b1, '#6f757b')
    gaps = [l for l in levels] + [top]
    for li in range(len(levels)):
        y0 = levels[li] + 0.018; hmax = gaps[li + 1] - y0 - 0.04
        if face == '+z': a, b_, dep = xa + 0.03, xb_ - 0.03, zb - za
        else: a, b_, dep = za + 0.03, zb - 0.03, xb_ - xa
        t = a
        while t < b_ - 0.15:
            kind = random.choice(['kraft', 'kraft2', 'kraft', 'shoebox', 'binders', 'tube_a', 'box_org', 'kraft2'])
            if random.random() > fill: t += random.uniform(0.15, 0.35); continue
            if kind == 'binders': w_, h_, d_ = random.uniform(0.25, 0.45), min(hmax, 0.32), 0.28
            elif kind == 'box_org': w_, h_, d_ = 0.2, 0.09, 0.12
            elif kind == 'tube_a': w_, h_, d_ = 0.4, 0.28, min(dep - 0.06, 0.4)
            elif kind == 'shoebox': w_, h_, d_ = 0.34, 0.12, min(dep - 0.06, 0.24)
            else: w_, h_, d_ = random.uniform(0.3, 0.55), random.uniform(0.22, hmax), min(dep - 0.06, random.uniform(0.3, 0.45))
            w_ = min(w_, b_ - t); h_ = min(h_, hmax); nst = int(hmax // h_) if kind in ('shoebox', 'box_org') else 1
            for s in range(max(1, min(nst, 3))):
                if face == '+z': g.box(t + w_ / 2, y0 + h_ / 2 + s * h_, zb - d_ / 2 - 0.02, w_, h_, d_, 'kraft' if kind == 'tube_a' else kind, front='+z')
                else:
                    xc = (xb_ - d_ / 2 - 0.02) if face == '+x' else (xa + d_ / 2 + 0.02)
                    g.box(xc, y0 + h_ / 2 + s * h_, t + w_ / 2, d_, h_, w_, 'kraft' if kind == 'tube_a' else kind, front=face)
            t += w_ + random.uniform(0.01, 0.06)
    p.done()


steel_shelf('aisle_L1', -1.3, -0.82, -4.55, -2.2, '+x'); steel_shelf('aisle_L2', -1.3, -0.82, -7.1, -4.65, '+x')
steel_shelf('aisle_R1', 0.82, 1.3, -4.55, -2.2, '-x'); steel_shelf('aisle_R2', 0.82, 1.3, -7.1, -4.65, '-x')
steel_shelf('front_L', XI0 + 0.02, -1.35, -2.25, -1.8, '+z', fill=0.9); steel_shelf('front_R', 1.35, XI1 - 0.02, -2.25, -1.8, '+z', fill=0.9)
st_ = Part('storage')                                                                                                   # 架子後面的倉庫：一疊一疊的紙箱（從上面看得到）
for s in (-1, 1):
    for (x, z) in ((2.0, -3.0), (2.7, -3.1), (3.5, -2.9), (2.2, -4.2), (3.3, -4.4), (2.1, -5.6), (2.9, -5.8), (3.7, -5.4), (2.4, -7.0), (3.4, -7.1)):
        n = random.randint(1, 4); w_ = random.uniform(0.45, 0.65); d_ = random.uniform(0.4, 0.6)
        for j in range(n):
            h_ = random.uniform(0.3, 0.45); st_['goods'].box(s * x + random.uniform(-0.05, 0.05), 0.0 + h_ / 2 + j * 0.42, z + random.uniform(-0.05, 0.05), w_, h_, d_, random.choice(['kraft', 'kraft2']), front='+z')
st_.done()
# 最裡面的布簾（後門）＋電風扇
cu = IT['curtain']; cux, cuw, cuh = cu['x'], cu['w'], cu['h']
pcu = Part('curtain', side='back')
pcu['vc'].cbox(cux - cuw / 2 - 0.06, cux + cuw / 2 + 0.06, 0.0, cuh + 0.06, ZI0, ZI0 + 0.008, '#2e2a26')            # 門洞（暗）
for (a0, a1, b0, b1) in ((cux - cuw / 2 - 0.08, cux - cuw / 2 - 0.02, 0.0, cuh + 0.08), (cux + cuw / 2 + 0.02, cux + cuw / 2 + 0.08, 0.0, cuh + 0.08), (cux - cuw / 2 - 0.08, cux + cuw / 2 + 0.08, cuh + 0.02, cuh + 0.08)):
    pcu['wood'].rbox(a0, a1, b0, b1, ZI0, ZI0 + 0.05, r=0.006)
ccyl(pcu['vcm'], (cux - cuw / 2 - 0.02, cuh - 0.02, ZI0 + 0.08), (cux + cuw / 2 + 0.02, cuh - 0.02, ZI0 + 0.08), 0.008, '#8d9196', seg=6)
u = pcu['goods']; cg = ATL['curtain']; N_ = 22; zc0 = ZI0 + 0.09
cols = [(cux - cuw / 2 + cuw * i / N_, zc0 + 0.025 * math.sin(i * 1.4)) for i in range(N_ + 1)]
for i in range(N_):
    (xa_, za_), (xb2, zb2) = cols[i], cols[i + 1]; ua, ub = cg[0] + (cg[2] - cg[0]) * i / N_, cg[0] + (cg[2] - cg[0]) * (i + 1) / N_
    sw = 0.018 * math.sin(i * 0.5)
    u.face([(xa_ + sw, 0.12, za_ + 0.01), (xb2 + sw, 0.12, zb2 + 0.01), (xb2, cuh - 0.03, zb2), (xa_, cuh - 0.03, za_)], [(ua, cg[1]), (ub, cg[1]), (ub, cg[3]), (ua, cg[3])], smooth=True)
pcu.done()
fn = IT['fan']; fx_, fz_ = fn['x'], fn['z']
pf_ = Part('fan', T=fm((fx_, 0, fz_), rot('Y', 0.5))); c = pf_['vc']
clathe(c, [(0, 0), (0.17, 0), (0.17, 0.02), (0.06, 0.05), (0.025, 0.06), (0, 0.06)], 0, 0, 0, '#e8e8e4', seg=18)
ccyl(c, (0, 0.06, 0), (0, 1.0, 0), 0.014, '#d8d8d4', seg=8); ccyl(c, (0, 0.5, 0), (0, 1.02, 0), 0.019, '#e8e8e4', seg=8)
n0 = len(c.bm.faces); c.ell((0, 1.1, -0.06), 0.07, 0.07, 0.1, seg=12, rings=6); c.paint(_new(c, n0), '#e8e8e4')
for ring_z, rr in ((0.04, 0.2), (0.1, 0.2)):
    pts_ = [(rr * math.cos(2 * math.pi * k / 16), 1.1 + rr * math.sin(2 * math.pi * k / 16), ring_z) for k in range(16)]
    for a, b in zip(pts_, pts_[1:] + pts_[:1]): ccyl(c, a, b, 0.003, '#d0d4d8', seg=4, caps=False)
for k in range(12):
    a_ = 2 * math.pi * k / 12; ccyl(c, (0, 1.1, 0.12), (0.2 * math.cos(a_), 1.1 + 0.2 * math.sin(a_), 0.1), 0.002, '#d0d4d8', seg=3, caps=False)
    ccyl(c, (0.2 * math.cos(a_), 1.1 + 0.2 * math.sin(a_), 0.1), (0.2 * math.cos(a_), 1.1 + 0.2 * math.sin(a_), 0.04), 0.002, '#d0d4d8', seg=3, caps=False)
for k in range(3):
    a_ = 2 * math.pi * k / 3 + 0.3; n0 = len(c.bm.faces)
    c.ell((0.1 * math.cos(a_), 1.1 + 0.1 * math.sin(a_), 0.07), 0.075, 0.045, 0.006, seg=10, rings=4, matrix=Matrix.Rotation(a_, 4, 'Y')); c.paint(_new(c, n0), '#9fc4d8')
csph(c, (0, 1.1, 0.075), 0.03, '#e8e8e4', seg=10, rings=5)
pf_.done()

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
for ob in root.children:   # 合併以後：牆的組的名字照 WALL_<side>_<材質>
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
info = L.export(OUT, gpu_instances=True)
info.update({'shop': 'haopai', 'layout': 1, 'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m})})
L.write_json(OUT[:-4] + '.json', info)
