"""慢輪單車（公館店面街 G06，原名輪轉單車；正對校門）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-04 v1：照使用者的參考圖 gongguan_bike_int 做（SCENE_RULES 第 12 節：參考圖就是規格）。
  python3 tools/blender/env_second/bb_support/bike_tex.py            # 先畫貼圖（→ tools/blender/env_second/textures/gen/bike_*）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/bike_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
配置（家具位置、大小、座位、互動點、導航阻擋）只寫在 src/data/bike_layout.js，這裡讀同一份。
座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。參考圖的鏡頭：layout 的 camRef（眼睛 (1.15,1.6,5.6)、24 mm、往店裡看）。
從店門往裡看（參考圖由左到右、由前到後）：
  左：木頭展示台＋兩台淑女車（米白、薄荷綠，車籃）；左牆三台掛車、構造海報、黑白照、植物層板；低櫃；木櫃台（小招牌、螢幕、檯燈、書、抽屜、黃金葛）、長凳；
      隔間牆的黑板價目表、路線圖。
  中：灰色水泥磚走道；外露的樑、管線、深綠吊燈、日光燈；吊著的大招牌「慢輪單車」（字畫在貼圖上）；後面的修車區：兩支藍色修車架、洞洞板＋扳手、工作台、工具車、吊扇。
  右：展示台＋小折、公路車；右牆層架（安全帽、燈、鈴、鎖、零件）、相框；打氣筒、空壓機；輪胎架、綠色抽屜櫃。
單車：每台是一個網格（車架、前叉、坐墊、把手、曲柄、鏈條、擋泥板、車籃、貨架）＋輪子（instancing：外胎、輪框、輻條卡〔alpha〕、花鼓）。不是方塊；沒有任何品牌（D77）。
尺寸（照真實）：700C 輪徑 0.68 m、26 吋 0.66、20 吋小折 0.50；軸距 0.95～1.12；把手高 1.0～1.1；坐墊高 0.85～0.95；打氣筒 0.65；修車架夾頭 1.25。"""
import json, math, os, random, re, subprocess, sys
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

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'bike_layout.js')]))['bike']
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'bike_atlas.json')))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT      # 內面 x ±3.88、z ±5.88
ITL = LAY['items']
IT = {}
for i in ITL: IT.setdefault(i['kind'], i)
PT = LAY['partition']
random.seed(646)
B.reset(texres=1024)
L.Mesh.rbox.__defaults__ = (0.03, 1)   # 倒角一段就好（木條、門框：三段的倒角在這個距離看不出來，三角形多三倍）
root = B.group('bike_interior', props={'kind': 'bike_interior', 'w': W, 'd': D, 'h': H, 'layout': 2})
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False, metal=0.0, tile=1.0, cull=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m.use_backface_culling = cull; m['tile'] = tile; return m


P = 'bk_'
# 11 個材質：地板（自製）、牆、天花板（外露的水泥）、木頭（Poly Haven CC0）＋頂點色（霧面、金屬）＋玻璃＋透明圖集、印刷圖集、會亮的、招牌
M = {
    'floor': img_mat(P + 'floor_tile', 'bike_floor.png', rough=0.26, tile=1.2),
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#d2c2a4', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'ceil': L.pbr(P + 'concrete', 'granular_concrete', tile=1.6, target='#a39482', normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.92),
    'wood': L.pbr(P + 'wood', 'fine_grained_wood', tile=0.9, target='#c29a6c', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.55),
    'vc': L.vc_material(P + 'vc', rough=0.58), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.4),
    'glass': L.flat(P + 'glass', '#d4e2e0', rough=0.05, alpha=0.14),
    'emit': img_mat(P + 'emit', 'bike_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha', 'bike_alpha.png', rough=0.45, clip=True, metal=0.2),
    'goods': img_mat(P + 'goods', 'bike_goods.png', rough=0.62),
    'sign': img_mat(P + 'sign', 'bike_sign.png', rough=0.55),
}
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件（車架、零件、櫃子…）改成「頂點色 × ambientCG 材質組」——每個零件原本的顏色照舊，
#      加上 CC0 的紋路、法線（霧面＝Plastic006、金屬＝Metal009）；收銀機換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
sys.path.insert(0, os.path.dirname(HERE)); import cc0_kit   # noqa: E402,E401
CK = cc0_kit.Kit(root, P[:-1])
M['vc'] = CK.vc_tex(P + 'vc', 'Plastic006', vary=0.015, tile=0.35, rough_value=0.58, normal=0.25)   # vary 0.015、法線 0.25：淺色包裝不能有灰黑刮痕（HOWTO 第 1 節第 5 點）
M['vcm'] = CK.vc_tex(P + 'vc_metal', 'Metal009', vary=0.12, tile=0.3, rough_value=0.38, metal=0.4)
# v2（LAWWW2-C 11-14：右牆層架是一排排純色方盒）：包裝盒圖集＝自己畫的 4×4 種包裝（牛皮紙／白卡底、品牌色帶、白色側標、條紋；沒有字，D77）× ambientCG Cardboard001 的紙紋
PKG_COLS = ['#c8462e', '#2f6fb8', '#e2a63a', '#3a7a4a', '#7a3a8a', '#1d1d1d', '#d85a8a', '#2a8a8a']


def _pkg_draw(d, S):
    rr_ = random.Random(1114); n = 4; c = S // n
    for i in range(n):
        for j in range(n):
            x0, y0 = i * c, j * c; base = rr_.choice(['#c9a36e', '#d4b07a', '#efe9dc', '#e8e2d2', '#bf9a66'])
            d.rectangle([x0, y0, x0 + c - 1, y0 + c - 1], fill=base)
            col = PKG_COLS[(i * n + j) % len(PKG_COLS)]; bh = int(c * rr_.uniform(0.18, 0.32)); by = y0 + int(c * rr_.uniform(0.08, 0.2))
            d.rectangle([x0, by, x0 + c - 1, by + bh], fill=col)                                                       # 品牌色帶
            lw, lh = int(c * rr_.uniform(0.35, 0.55)), int(c * rr_.uniform(0.2, 0.3)); lx, ly = x0 + int(c * 0.12), by + bh + int(c * 0.1)
            d.rectangle([lx, ly, lx + lw, ly + lh], fill='#f6f4ee', outline=col, width=3)                               # 白色側標
            for k in range(3): d.rectangle([lx + 6, ly + 8 + k * (lh // 4), lx + lw - 6 - k * 14, ly + 12 + k * (lh // 4)], fill='#8a8a86')   # 標籤上的「字」（灰條）
            if rr_.random() < 0.6: d.ellipse([x0 + c - int(c * 0.32), y0 + c - int(c * 0.32), x0 + c - int(c * 0.08), y0 + c - int(c * 0.08)], fill=col)   # 角落的圓標
            d.rectangle([x0, y0 + c - 6, x0 + c - 1, y0 + c - 1], fill=col)                                             # 底邊色條


M['pkg'] = CK.printed(P + 'pkg', 'bk_pkg_atlas', _pkg_draw, 'Cardboard001', size=1024, amp=0.12, rough_value=0.7)
M['pkg']['tile'] = 1.0
PKG_CELLS = [(i / 4 + 0.004, j / 4 + 0.004, (i + 1) / 4 - 0.004, (j + 1) / 4 - 0.004) for i in range(4) for j in range(4)]
G3 = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))   # 遊戲 → Blender 的旋轉


def rot(axis, a): return Matrix.Rotation(a, 3, axis)   # 遊戲座標的軸（Y＝往上；rot('Y', a) 把 +x 轉到 (cos a, 0, −sin a)）


def fm(o, R=None):
    R = R if R is not None else Matrix.Identity(3)
    return Matrix.Translation(g2b(*o)) @ (G3 @ R @ G3.inverted()).to_4x4()


class UM:
    """有 UV 的網格（貼圖集）：每個面自己給 UV"""
    def __init__(self, name, mat): self.name, self.mat, self.bm = name, mat, bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def face(self, pts, uvs, smooth=False):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, t in zip(f.loops, uvs): lp[self.uv].uv = t
        f.smooth = smooth; return f

    def rect(self, c, r, up, hw, hh, uvr, both=False):
        c, r, up = Vector(c), Vector(r), Vector(up); u0, v0, u1, v1 = uvr
        f = self.face([c - r * hw - up * hh, c + r * hw - up * hh, c + r * hw + up * hh, c - r * hw + up * hh], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
        if both:   # 反面往後退 1 mm（兩面疊在同一個平面，Cycles 會打架變黑）
            o = -r.cross(up).normalized() * 0.001
            self.face([c - r * hw + up * hh + o, c + r * hw + up * hh + o, c + r * hw - up * hh + o, c - r * hw - up * hh + o], [(u0, v1), (u1, v1), (u1, v0), (u0, v0)])
        return f

    FACES = {'+x': ((1, 0, 0), (0, 0, -1), (0, 1, 0)), '-x': ((-1, 0, 0), (0, 0, 1), (0, 1, 0)), '+z': ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
             '-z': ((0, 0, -1), (-1, 0, 0), (0, 1, 0)), '+y': ((0, 1, 0), (1, 0, 0), (0, 0, -1)), '-y': ((0, -1, 0), (1, 0, 0), (0, 0, 1))}

    def box(self, cx, cy, cz, w, h, d, cell, front='+z', side=None, skip=('-y',), cells=None):
        """方盒：正面整格貼圖，其他面用同一格左邊 4% 的窄條；cells＝{面: 格} 指定別的面"""
        uvr = ATL[cell] if isinstance(cell, str) else cell; u0, v0, u1, v1 = uvr
        sid = side if side is not None else (u0, v0 + (v1 - v0) * 0.4, u0 + (u1 - u0) * 0.04, v0 + (v1 - v0) * 0.6)
        hs = (w / 2, h / 2, d / 2)
        for k, (n, r, up) in self.FACES.items():
            if k in skip: continue
            c = (cx + n[0] * hs[0], cy + n[1] * hs[1], cz + n[2] * hs[2])
            hw = sum(abs(r[i]) * hs[i] for i in range(3)); hh = sum(abs(up[i]) * hs[i] for i in range(3))
            uu = (ATL[cells[k]] if isinstance(cells[k], str) else cells[k]) if cells and k in cells else (uvr if k == front else sid)
            self.rect(c, r, up, hw, hh, uu)

    def disk(self, ctr, r, cell, n=24, z_off=0.0):
        """圓片（中心、半徑；面在 x-y 平面、法線 +z；兩面）：輻條卡"""
        u0, v0, u1, v1 = ATL[cell]; pts, uvs = [], []
        for i in range(n):
            t = 2 * math.pi * i / n; pts.append((ctr[0] + r * math.cos(t), ctr[1] + r * math.sin(t), ctr[2] + z_off))
            uvs.append((u0 + (u1 - u0) * (0.5 + 0.5 * math.cos(t)), v0 + (v1 - v0) * (0.5 + 0.5 * math.sin(t))))
        self.face(pts, uvs); self.face([(p[0], p[1], p[2] - 2 * z_off) for p in reversed(pts)], list(reversed(uvs)))

    def empty(self): return len(self.bm.faces) == 0

    def finish(self, parent):
        if self.empty(): self.bm.free(); return None
        self.bm.normal_update(); return B.mesh_obj(self.name, self.bm, self.mat, parent)


UVK = ('goods', 'alpha', 'emit', 'sign', 'pkg')


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組"""
    def __init__(self, name, side=None, T=None, smooth=True): self.name, self.side, self.T, self.smooth, self.m = name, side, T, smooth, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = (f'WALL_{self.side}_' if self.side else P) + f'{self.name}_{key}'
            self.m[key] = L.CMesh(nm, M[key]) if key in ('vc', 'vcm') else (UM(nm, M[key]) if key in UVK else Mesh(nm, M[key]))
        return self.m[key]

    def done(self):
        obs = []
        for key, m in self.m.items():
            if isinstance(m, UM): ob = m.finish(root)
            elif isinstance(m, L.CMesh): ob = m.finish(root, uv=bool(M[key].get('vc_tex')))   # 頂點色 × 材質組：要盒狀 UV
            else: ob = m.finish(root, uv=True)
            if ob is None: continue
            if self.T is not None: ob.matrix_basis = self.T
            if self.side: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign', 'goods', 'alpha', 'emit', 'pkg'): L.smooth_mesh(ob, angle=0.6)
            obs.append(ob)
        self.m = {}; return obs


def inst(obs, name, T, side=None):
    out = []
    for ob in obs:
        key = ob.name.rsplit('_', 1)[-1]
        no = bpy.data.objects.new((f'WALL_{side}_' if side else P) + f'{name}_{key}', ob.data); B.scene().collection.objects.link(no); no.parent = root
        no.matrix_basis = T
        if side: no['dir'] = DIRS[side]
        out.append(no)
    return out


class Proto:
    """原型：第一次 place 時建網格，之後共用（instancing）"""
    def __init__(self, name, build, side=None): self.name, self.build, self.side, self.obs, self.n = name, build, side, None, 0

    def place(self, T):
        self.n += 1
        if self.obs is None:
            pt = Part(f'{self.name}_0', side=self.side, T=T); self.build(pt); self.obs = pt.done(); return
        inst(self.obs, f'{self.name}_{self.n}', T, self.side)


class _N0:
    """「這之後新加的面」：記住當時有哪些面（bmesh 的面順序不保證新面在最後）"""
    def __init__(self, c): self.before = set(c.bm.faces)


def _new(c, n0): return [f for f in c.bm.faces if f not in n0.before]


def ccyl(c, a, b, r, col, seg=8, r2=None, caps=True):
    n0 = _N0(c); c.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return c.paint(_new(c, n0), col)


def cpath(c, pts, r, col, seg=6):
    """一串點連成的管子（彎的車架、把手、水管）"""
    for a, b in zip(pts, pts[1:]): ccyl(c, a, b, r, col, seg=seg, caps=False)
    if r >= 0.01:
        for p in pts[1:-1]: csph(c, p, r * 1.02, col, seg=seg, rings=3)


def clathe(c, prof, x, y, z, col, seg=16, R=None):
    n0 = _N0(c); bm = L.lathe(prof, seg=seg); c.add_bm(bm, fm((x, y, z), R)); bm.free(); return c.paint(_new(c, n0), col)


def crb(c, x0, x1, y0, y1, z0, z1, col, r=0.01, seg=1):
    if r <= 0.0005 or max(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)) < 0.13: return c.cbox(x0, x1, y0, y1, z0, z1, col)   # 小東西不倒角（看不出來，省三角形）
    return c.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)


def csph(c, ctr, r, col, seg=8, rings=5, sy=1.0):
    n0 = _N0(c); c.sphere(ctr, r, seg=seg, rings=rings, sy=sy); return c.paint(_new(c, n0), col)


def cell_(c, ctr, rx, ry, rz, col, seg=10, rings=5):
    n0 = _N0(c); c.ell(ctr, rx, ry, rz, seg=seg, rings=rings); return c.paint(_new(c, n0), col)


def torus(c, R0, t, col, su=24, sv=5, ctr=(0, 0, 0), tz=None, a0=0.0, a1=2 * math.pi):
    """圓環（軸沿 z）：外胎、輪框、輪胎架上的胎、管線捲；tz＝z 方向的厚度半徑（扁的環）；a0～a1 只做一段弧（擋泥板）"""
    n0 = _N0(c); tz = t if tz is None else tz; full = abs(a1 - a0 - 2 * math.pi) < 1e-6; nU = su if full else su + 1; rings = []
    for i in range(nU):
        th = a0 + (a1 - a0) * i / su; ring = []
        for j in range(sv):
            ph = 2 * math.pi * j / sv + math.pi / sv; r = R0 + t * math.cos(ph)
            ring.append(c.bm.verts.new(g2b(ctr[0] + r * math.cos(th), ctr[1] + r * math.sin(th), ctr[2] + tz * math.sin(ph))))
        rings.append(ring)
    for i in range(su):
        a, b = rings[i], rings[(i + 1) % nU]
        for j in range(sv): c.bm.faces.new((a[j], a[(j + 1) % sv], b[(j + 1) % sv], b[j]))
    new = _new(c, n0); bmesh.ops.recalc_face_normals(c.bm, faces=new); return c.paint(new, col)


def ribbon(c, R0, w, col, a0, a1, su=12, ctr=(0, 0, 0)):
    """弧形的帶子（擋泥板；軸沿 z、寬 w）"""
    n0 = _N0(c); vs = []
    for i in range(su + 1):
        th = a0 + (a1 - a0) * i / su; x, y = ctr[0] + R0 * math.cos(th), ctr[1] + R0 * math.sin(th)
        vs.append((c.bm.verts.new(g2b(x, y, ctr[2] - w / 2)), c.bm.verts.new(g2b(x, y, ctr[2] + w / 2))))
    for (a, b), (cc, dd) in zip(vs, vs[1:]): c.bm.faces.new((a, b, dd, cc))
    return c.paint(_new(c, n0), col)


def jit(hexcol, k=0.06):
    f = 1 + random.uniform(-k, k); return '#' + ''.join(f'{min(255, max(0, int(int(hexcol[i:i + 2], 16) * f))):02x}' for i in (1, 3, 5))


def sub(cellname, a0, b0, a1, b1):
    u0, v0, u1, v1 = ATL[cellname]; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


def add(a, b, k=1.0): return (a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k)


# ======================================================================
# 單車（自己的座標：車頭 +x、上 +y、車寬 z；原點在地上、前後輪接地點的中間）
# ======================================================================
SPEC = {
    'lady': dict(R=0.33, t=0.019, wb=1.08, frame='lady', bar='swept', basket=True, rack=True, fender=True, guard=True, saddle='#6e4428', grip='#7a4a2a', rim='#b9bcbf', spokes=36, Ls=0.42, post=0.2, stem=0.16),
    'city': dict(R=0.34, t=0.017, wb=1.06, frame='lady', bar='swept', basket=True, rack=True, fender=True, guard=True, saddle='#6e4428', grip='#7a4a2a', rim='#b9bcbf', spokes=36, Ls=0.44, post=0.18, stem=0.14, lamp=True),
    'road': dict(R=0.345, t=0.012, wb=0.99, frame='diamond', bar='drop', saddle='#1e1e20', grip='#1e1e20', rim='#2a2b2d', spokes=20, Ls=0.53, post=0.16, stem=0.05),
    'road_flat': dict(R=0.345, t=0.014, wb=1.02, frame='diamond', bar='flat', saddle='#1e1e20', grip='#1e1e20', rim='#2a2b2d', spokes=20, Ls=0.5, post=0.15, stem=0.06),
    'city_diamond': dict(R=0.34, t=0.016, wb=1.04, frame='diamond', bar='swept', fender=True, saddle='#6e4428', grip='#7a4a2a', rim='#b9bcbf', spokes=36, Ls=0.5, post=0.14, stem=0.1),
    'mtb': dict(R=0.355, t=0.028, wb=1.12, frame='mtb', bar='riser', saddle='#1e1e20', grip='#1e1e20', rim='#2a2b2d', spokes=36, Ls=0.42, post=0.17, stem=0.05, susp=True),
    'fold': dict(R=0.25, t=0.017, wb=0.96, frame='fold', bar='flat', fender=True, saddle='#1e1e20', grip='#1e1e20', rim='#b9bcbf', spokes=20, Ls=0.3, post=0.42, stem=0.55),
}
WHEELS = {}


def wheel_proto(R, t, rim, spokes, side):
    key = (round(R, 3), round(t, 3), rim, spokes, side)
    if key in WHEELS: return WHEELS[key]

    def build(pt):
        c, cm = pt['vc'], pt['vcm']
        torus(c, R - t, t, '#1f1e1d', su=24, sv=4, tz=t * 1.05)                                   # 外胎（胎面）
        torus(cm if rim != '#2a2b2d' else c, R - 2 * t - 0.009, 0.009, rim, su=24, sv=3, tz=0.011)   # 輪框
        pt['alpha'].disk((0, 0, 0), R - 2 * t - 0.012, f'spokes{spokes}', n=20, z_off=0.004)       # 輻條（卡片，兩面）
        ccyl(cm, (0, 0, -0.05), (0, 0, 0.05), 0.016, '#a9adb0', seg=8)                              # 花鼓
        ccyl(cm, (0, 0, -0.065), (0, 0, 0.065), 0.005, '#8d9196', seg=4)                            # 軸
    pr = Proto(f'wheel{len(WHEELS)}', build, side=side); WHEELS[key] = pr; return pr


def bike(name, model, col, T, side=None, kick=True, tag=None):
    """一台單車（車架一個網格＋兩個輪子 instancing）；T＝擺放的變換（遊戲座標）"""
    s = SPEC[model]; R, t, wb = s['R'], s['t'], s['wb']
    p = Part(name, side=side, T=T); c, cm = p['vc'], p['vcm']
    ra, fa = (-wb / 2, R, 0.0), (wb / 2, R, 0.0)
    bb = (-wb / 2 + 0.43 * wb / 1.05, 0.27 if s['frame'] != 'fold' else 0.24, 0.0)
    if s['frame'] == 'fold': bb = (-0.04, 0.24, 0.0)
    sdir = (-0.292, 0.956, 0.0); hdir = (-0.309, 0.951, 0.0)
    st = add(bb, sdir, s['Ls'])
    hb = add(fa, hdir, R + 0.06 if s['frame'] != 'fold' else 0.3)
    ht = add(hb, hdir, 0.15 if s['frame'] in ('diamond', 'mtb') else 0.2)
    tr = 0.016 if s['frame'] != 'mtb' else 0.022
    ccyl(c, hb, ht, 0.021, col, seg=8)                                                              # 頭管
    if s['frame'] == 'diamond':
        ccyl(c, add(ht, hdir, -0.03), add(st, sdir, -0.03), tr * 0.9, col, seg=8)                   # 上管
        ccyl(c, add(hb, hdir, 0.02), bb, tr * 1.15, col, seg=8)                                     # 下管
    elif s['frame'] == 'mtb':
        ccyl(c, add(ht, hdir, -0.03), add(st, sdir, -0.12), tr, col, seg=8)                         # 斜的上管
        ccyl(c, add(hb, hdir, 0.02), bb, tr * 1.2, col, seg=8)
    elif s['frame'] == 'lady':   # 低跨點：彎的下管兩支（上面一支到座管中段）
        mid = (bb[0] + 0.18, bb[1] + 0.06, 0.0)
        cpath(c, [add(hb, hdir, 0.04), (hb[0] - 0.06, hb[1] - 0.12, 0.0), (hb[0] - 0.14, hb[1] - 0.22, 0.0), mid, bb], tr * 1.15, col, seg=8)
        cpath(c, [add(hb, hdir, 0.14), (hb[0] - 0.1, hb[1] - 0.04, 0.0), (hb[0] - 0.2, hb[1] - 0.12, 0.0), (bb[0] + 0.12, bb[1] + 0.2, 0.0), add(bb, sdir, 0.2)], tr * 0.85, col, seg=8)
    else:   # 小折：一支粗的主管（中間有折疊關節）
        cpath(c, [add(hb, hdir, 0.04), (0.18, 0.4, 0.0), bb], 0.027, col)
        crb(c, 0.13, 0.23, 0.36, 0.45, -0.032, 0.032, '#2a2b2d', r=0.008)
    ccyl(c, bb, st, tr * 0.95, col, seg=8)                                                          # 座管
    for zs in (-1, 1):
        ccyl(c, (bb[0], bb[1], zs * 0.02), (ra[0], ra[1], zs * 0.055), 0.009, col, seg=5)         # 後下叉
        ccyl(c, add(st, sdir, -0.03 if s['frame'] != 'fold' else -0.05), (ra[0], ra[1], zs * 0.055), 0.0085, col, seg=5)   # 後上叉
        if s.get('susp'):
            ccyl(cm, (hb[0], hb[1] - 0.02, zs * 0.052), add((fa[0], fa[1], zs * 0.052), hdir, 0.2), 0.016, '#c9ccce', seg=6)   # 避震前叉：上管（亮）
            ccyl(c, add((fa[0], fa[1], zs * 0.052), hdir, 0.24), (fa[0], fa[1], zs * 0.052), 0.022, '#232426', seg=6)          # 下管（黑）
        else:
            ccyl(c, (hb[0], hb[1] - 0.01, zs * 0.04), (fa[0], fa[1], zs * 0.05), 0.0105, col, seg=5)  # 前叉
    crb(c, hb[0] - 0.03, hb[0] + 0.03, hb[1] - 0.035, hb[1] + 0.005, -0.055, 0.055, col if not s.get('susp') else '#232426', r=0.008)   # 前叉肩
    if s.get('susp'): ccyl(c, (fa[0] + 0.02, fa[1] + 0.2, -0.06), (fa[0] + 0.02, fa[1] + 0.2, 0.06), 0.012, '#232426', seg=6)
    # 坐墊＋座桿
    top = add(st, sdir, s['post'])
    ccyl(cm, add(st, sdir, -0.04), top, 0.0135, '#9a9ea2', seg=6)
    sc = (top[0] - 0.025, top[1] + 0.03, 0.0)
    if s['saddle'] == '#6e4428':   # 淑女車、城市車：寬的咖啡色坐墊＋兩個彈簧
        cell_(c, sc, 0.125, 0.035, 0.1, s['saddle'], seg=12, rings=5); cell_(c, (sc[0] + 0.1, sc[1] - 0.005, 0), 0.06, 0.025, 0.04, s['saddle'], seg=8, rings=4)
        for zs in (-1, 1): ccyl(cm, (sc[0] - 0.07, sc[1] - 0.075, zs * 0.06), (sc[0] - 0.07, sc[1] - 0.025, zs * 0.06), 0.012, '#9a9ea2', seg=6)
    else:
        cell_(c, sc, 0.13, 0.025, 0.065, s['saddle'], seg=12, rings=4); cell_(c, (sc[0] + 0.11, sc[1], 0), 0.07, 0.02, 0.025, s['saddle'], seg=8, rings=3)
    # 龍頭＋把手
    sp = add(ht, hdir, s['stem'] * (0.6 if s['frame'] != 'fold' else 1.0))
    ccyl(cm if s['frame'] != 'fold' else c, ht, sp, 0.014 if s['frame'] != 'fold' else 0.019, '#9a9ea2' if s['frame'] != 'fold' else col, seg=6)
    gcol = s['grip']
    if s['bar'] == 'swept':
        bc = (sp[0] + 0.07, sp[1] + 0.03, 0.0); ccyl(cm, sp, bc, 0.012, '#a9adb0', seg=6)
        for zs in (-1, 1):
            pts = [bc, (bc[0] - 0.01, bc[1] + 0.01, zs * 0.12), (bc[0] - 0.08, bc[1] + 0.03, zs * 0.25), (bc[0] - 0.17, bc[1] + 0.03, zs * 0.28)]
            cpath(cm, pts, 0.0115, '#b9bcbf', seg=6); ccyl(c, pts[-1], (bc[0] - 0.28, bc[1] + 0.02, zs * 0.29), 0.0165, gcol, seg=8)
            ccyl(cm, (bc[0] - 0.09, bc[1] + 0.035, zs * 0.24), (bc[0] - 0.03, bc[1] + 0.02, zs * 0.3), 0.005, '#9a9ea2', seg=4)   # 煞車把
        csph(cm, (bc[0] - 0.02, bc[1] + 0.025, 0.12), 0.028, '#c9ccce', seg=8, rings=4)                                   # 車鈴
    elif s['bar'] in ('flat', 'riser'):
        hw_ = 0.29 if s['bar'] == 'flat' else 0.36; rise = 0.0 if s['bar'] == 'flat' else 0.04
        bc = (sp[0] + 0.07, sp[1] + 0.01, 0.0); ccyl(cm if s['frame'] != 'fold' else c, sp, bc, 0.013, '#2a2b2d' if s['frame'] != 'fold' else col, seg=6)
        cpath(c, [(bc[0], bc[1], -hw_ + 0.1), (bc[0], bc[1] + rise, -0.12), (bc[0], bc[1] + rise, 0.12), (bc[0], bc[1], hw_ - 0.1)][::1], 0.011, '#2a2b2d', seg=6)
        for zs in (-1, 1):
            ccyl(c, (bc[0], bc[1], zs * (hw_ - 0.1)), (bc[0] - 0.01, bc[1], zs * hw_), 0.016, gcol, seg=8)
            ccyl(c, (bc[0] + 0.01, bc[1], zs * (hw_ - 0.13)), (bc[0] + 0.09, bc[1] - 0.02, zs * (hw_ - 0.05)), 0.005, '#2a2b2d', seg=4)
    else:   # 彎把（公路車）：上把、往前往下彎一圈、煞車手把
        bc = (sp[0] + 0.08, sp[1] + 0.0, 0.0); ccyl(c, sp, bc, 0.013, '#2a2b2d', seg=6)
        for zs in (-1, 1):
            pts = [(bc[0], bc[1], 0.0), (bc[0], bc[1], zs * 0.2), (bc[0] + 0.06, bc[1] - 0.01, zs * 0.21), (bc[0] + 0.1, bc[1] - 0.06, zs * 0.21),
                   (bc[0] + 0.07, bc[1] - 0.13, zs * 0.21), (bc[0] - 0.04, bc[1] - 0.14, zs * 0.21)]
            cpath(c, pts, 0.012, '#1f1f21', seg=6)
            crb(c, bc[0] + 0.05, bc[0] + 0.1, bc[1] - 0.005, bc[1] + 0.035, zs * 0.21 - 0.015, zs * 0.21 + 0.015, '#2a2b2d', r=0.008)
    # 曲柄、齒盤、鏈條、踏板
    crk = s.get('crank', 0.17)
    ccyl(cm, (bb[0], bb[1], -0.07), (bb[0], bb[1], 0.07), 0.022, '#9a9ea2', seg=8)
    ccyl(cm, (bb[0], bb[1], 0.064), (bb[0], bb[1], 0.07), 0.1 if s['frame'] != 'fold' else 0.085, '#6f7377', seg=16)
    a_ = 0.5
    for zs, aa in ((1, a_), (-1, a_ + math.pi)):
        pe = (bb[0] + crk * math.cos(aa), bb[1] + crk * math.sin(aa), zs * 0.085)
        ccyl(cm, (bb[0], bb[1], zs * 0.078), pe, 0.009, '#a9adb0', seg=5)
        crb(c, pe[0] - 0.05, pe[0] + 0.05, pe[1] - 0.012, pe[1] + 0.012, zs * 0.095 - 0.035, zs * 0.095 + 0.035, '#232426', r=0.006)
    rc = 0.04
    ccyl(cm, (ra[0], ra[1], 0.055), (ra[0], ra[1], 0.068), rc, '#6f7377', seg=10)
    rr_ = 0.1 if s['frame'] != 'fold' else 0.085
    for sgn in (1, -1): ccyl(c, (bb[0], bb[1] + sgn * rr_, 0.067), (ra[0], ra[1] + sgn * rc, 0.062), 0.0045, '#3a3b3d', seg=3)
    if s.get('guard'):   # 鏈條護蓋（蓋住上面那段鏈條的細長板，前端包住齒盤上緣）
        c.poly([(bb[0] + 0.11, bb[1] + 0.03, 0.082), (ra[0] + 0.03, ra[1] + 0.012, 0.075), (ra[0] + 0.03, ra[1] + 0.07, 0.075), (bb[0] + 0.02, bb[1] + 0.135, 0.082), (bb[0] + 0.1, bb[1] + 0.1, 0.082)], col)
    if s.get('fender'):
        fc = col if model != 'fold' else '#2a2b2d'
        ribbon(c, R + 0.022, 0.06, fc, math.radians(-10), math.radians(150), su=14, ctr=ra)
        ribbon(c, R + 0.022, 0.06, fc, math.radians(10), math.radians(140), su=12, ctr=fa)
        for zs in (-1, 1): ccyl(cm, (ra[0] - R * 0.85, ra[1] + 0.05, zs * 0.03), (ra[0], ra[1], zs * 0.055), 0.003, '#9a9ea2', seg=3)
    if s.get('rack'):   # 後貨架＋載人墊（D78：開局的車就有）
        ry_ = 2 * R + 0.035; xa_, xb_ = ra[0] - 0.17, ra[0] + 0.2
        for zs in (-1, 1):
            ccyl(cm, (xa_, ry_, zs * 0.07), (xb_, ry_, zs * 0.07), 0.006, '#9a9ea2', seg=4)
            ccyl(cm, (ra[0] - 0.05, ry_, zs * 0.07), (ra[0], ra[1], zs * 0.06), 0.006, '#9a9ea2', seg=4)
            ccyl(cm, (xb_, ry_, zs * 0.07), add(st, sdir, -0.08), 0.005, '#9a9ea2', seg=4)
        crb(c, xa_ + 0.02, xb_ - 0.02, ry_ + 0.005, ry_ + 0.06, -0.1, 0.1, '#3a2a20', r=0.02, seg=2)
        crb(cm, xa_ - 0.015, xa_ + 0.01, ra[1] + 0.12, ra[1] + 0.16, -0.035, 0.035, '#c8202a', r=0.006)   # 尾燈（反光片）
    if s.get('basket'):   # 前車籃（鐵絲網）
        bx_, by_ = fa[0] + 0.06, ht[1] - 0.02; bw_, bh_, bd_ = 0.32, 0.25, 0.37
        u = p['alpha']
        for (cc_, r_, up_, hw, hh) in (((bx_ + bw_ / 2, by_, 0), (0, 0, -1), (0, 1, 0), bd_ / 2, bh_ / 2), ((bx_ - bw_ / 2, by_, 0), (0, 0, 1), (0, 1, 0), bd_ / 2, bh_ / 2),
                                        ((bx_, by_, bd_ / 2), (1, 0, 0), (0, 1, 0), bw_ / 2, bh_ / 2), ((bx_, by_, -bd_ / 2), (-1, 0, 0), (0, 1, 0), bw_ / 2, bh_ / 2),
                                        ((bx_, by_ - bh_ / 2, 0), (1, 0, 0), (0, 0, 1), bw_ / 2, bd_ / 2)):
            u.rect(cc_, r_, up_, hw, hh, ATL['basket'], both=True)
        for (x0_, z0_, x1_, z1_) in ((-1, -1, 1, -1), (1, -1, 1, 1), (1, 1, -1, 1), (-1, 1, -1, -1)):
            ccyl(cm, (bx_ + x0_ * bw_ / 2, by_ + bh_ / 2, z0_ * bd_ / 2), (bx_ + x1_ * bw_ / 2, by_ + bh_ / 2, z1_ * bd_ / 2), 0.005, '#d2d2cd', seg=4)
        for zs in (-1, 1): ccyl(cm, (bx_ + 0.06, by_ - bh_ / 2, zs * 0.08), (fa[0] + 0.01, fa[1] + 0.02, zs * 0.05), 0.005, '#9a9ea2', seg=4)
    if s.get('lamp'): clathe(c, [(0.0, 0.0), (0.035, 0.0), (0.04, 0.06), (0.0, 0.065)], hb[0] + 0.05, hb[1] - 0.03, 0.0, '#2a2b2d', seg=10, R=rot('Z', -math.pi / 2))
    if kick: ccyl(cm, (bb[0] - 0.1, bb[1] - 0.01, -0.06), (bb[0] - 0.24, 0.0, -0.2), 0.008, '#8d9196', seg=5)   # 側柱
    if tag: p['goods'].rect((ht[0] - 0.03, ht[1] - 0.12, 0.0), (1, 0, 0), (0, 1, 0), 0.07, 0.044, ATL[tag], both=True)   # 掛在頭管上的車價卡
    obs = p.done()
    wp = wheel_proto(R, t, s['rim'], s['spokes'], side)
    for ax_, sp_ in ((ra, 0.1), (fa, 0.7)): wp.place(T @ fm(ax_, rot('Z', sp_)))
    return dict(ra=ra, fa=fa, bb=bb, st=st, ht=ht, R=R, obs=obs, wp=wp, model=model, side=side)


def bike_clone(g, name, T, parent=None, side=None, skip=('goods',)):
    """v1b：同一台車再放一次（linked duplicate：同一個網格、同一組材質，不新增材質）。skip＝不複製的網格（車價卡）。
    parent＝掛在哪個節點底下（REPAIR_BIKE：遊戲要能整台開關）。回傳新物件。"""
    par = parent if parent is not None else root; out = []
    for ob in g['obs']:
        key = ob.name.rsplit('_', 1)[-1]
        if key in skip: continue
        no = bpy.data.objects.new((f'WALL_{side}_' if side else P) + f'{name}_{key}', ob.data); B.scene().collection.objects.link(no); no.parent = par
        no.matrix_basis = T
        if side: no['dir'] = DIRS[side]
        out.append(no)
    wp = g['wp']
    for ax_, sp_ in ((g['ra'], 0.4), (g['fa'], 1.1)):
        Tw = T @ fm(ax_, rot('Z', sp_))
        if parent is None: wp.place(Tw); continue
        wp.n += 1
        for ob in wp.obs:
            key = ob.name.rsplit('_', 1)[-1]
            no = bpy.data.objects.new(f'{name}_wheel{wp.n}_{key}', ob.data); B.scene().collection.objects.link(no); no.parent = par; no.matrix_basis = Tw; out.append(no)
    return out


def stand_rear(x, z, yaw, y0=0.3):
    """展示台上的後輪立架（參考圖：米白淑女車的後輪下面一個黑色三腳架）"""
    p = Part('rstand', T=fm((x, y0, z), rot('Y', yaw))); c = p['vc']
    for zs in (-1, 1):
        ccyl(c, (-0.5, 0.0, zs * 0.16), (-0.5, 0.3, zs * 0.07), 0.009, '#1f2022', seg=5)
        ccyl(c, (-0.75, 0.0, zs * 0.12), (-0.5, 0.3, zs * 0.07), 0.009, '#1f2022', seg=5)
    ccyl(c, (-0.5, 0.3, -0.07), (-0.5, 0.3, 0.07), 0.008, '#1f2022', seg=5)
    p.done()


# ======================================================================
# 房間：地、外露的天花板（樑、管線）、牆（淡出的組）、隔間牆
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
ce = Part('ceiling', smooth=False); ce['ceil'].quad([(XI0, H, ZI0), (XI1, H, ZI0), (XI1, H, ZI1), (XI0, H, ZI1)]); ce.done()
bm_ = Part('beams', smooth=False)
for zb in (3.0, 0.2, -2.8):   # 外露的樑（沿 x）
    bm_['ceil'].box(XI0, XI1, H - 0.42, H, zb - 0.17, zb + 0.17)
bm_['ceil'].box(XI0, XI0 + 0.3, H - 0.42, H, ZI0, ZI1); bm_['ceil'].box(XI1 - 0.3, XI1, H - 0.42, H, ZI0, ZI1)
bm_.done()
pp = Part('pipes')   # 管線（沿 z）：消防水管、電線導管、一支往下接到日光燈
for (x, y, r, col) in ((-2.6, H - 0.12, 0.045, '#b9b2a6'), (-0.9, H - 0.1, 0.03, '#a9a49a'), (0.55, H - 0.1, 0.018, '#c9c4b8'), (2.9, H - 0.13, 0.055, '#b0aaa0'), (3.6, H - 0.08, 0.02, '#8d8a84')):
    ccyl(pp['vcm'], (x, y, ZI1), (x, y, ZI0), r, col, seg=8)
    zz = ZI1 - 0.6
    while zz > ZI0:
        crb(pp['vcm'], x - r - 0.01, x + r + 0.01, y - r - 0.01, H, zz - 0.012, zz + 0.012, '#6f6b64', r=0.002); zz -= 1.5   # 吊架
for zz in (4.2, 1.6, -1.6, -4.2): ccyl(pp['vcm'], (XI0 + 0.32, H - 0.2, zz), (XI1 - 0.32, H - 0.2, zz), 0.016, '#a9a49a', seg=6)   # 橫的導管
for xt in (-2.0, 2.6):   # 電纜線槽（沿 z、掛在天花板下；參考圖兩側上方一條一條的線槽）
    crb(pp['vcm'], xt - 0.12, xt + 0.12, H - 0.3, H - 0.26, ZI0 + 0.2, ZI1 - 0.1, '#8d8a84', r=0.003)
    for sx_ in (-1, 1): crb(pp['vcm'], xt + sx_ * 0.12 - 0.006, xt + sx_ * 0.12 + 0.006, H - 0.3, H - 0.22, ZI0 + 0.2, ZI1 - 0.1, '#8d8a84', r=0.002)
    for k in range(3): ccyl(pp['vc'], (xt - 0.06 + k * 0.05, H - 0.245, ZI1 - 0.1), (xt - 0.06 + k * 0.05, H - 0.245, ZI0 + 0.2), 0.008, ['#2a2b2d', '#d8d2c4', '#2a2b2d'][k], seg=4)
    zz = ZI1 - 0.6
    while zz > ZI0 + 0.2: ccyl(pp['vcm'], (xt, H - 0.26, zz), (xt, H, zz), 0.005, '#6f6b64', seg=4); zz -= 1.8
pp.done()
for side in ('left', 'right', 'back'):
    p = Part('wall', side=side, smooth=False)
    if side == 'left': p['wall'].box(X0, XI0, 0, H, Z0, Z1); p['wood'].box(XI0, XI0 + 0.015, 0, 0.1, ZI0, ZI1)
    elif side == 'right': p['wall'].box(XI1, X1, 0, H, Z0, Z1); p['wood'].box(XI1 - 0.015, XI1, 0, 0.1, ZI0, ZI1)
    else: p['wall'].box(X0, X1, 0, H, Z0, ZI0); p['wood'].box(XI0, XI1, 0, 0.1, ZI0, ZI0 + 0.015)
    p.done()
pw_ = Part('partition', smooth=False)   # 隔間牆（前段櫃台後面＋修車區左邊）：後面是倉庫（不開放）
pz, pt_, px = PT['z'], PT['t'], PT['wallX']
pw_['wall'].box(XI0, px, 0, H, pz - pt_, pz); pw_['wall'].box(px - pt_, px, 0, H, ZI0, pz - pt_)
pw_['wood'].box(XI0, px, 0, 0.1, pz, pz + 0.015); pw_['wood'].box(px, px + 0.015, 0, 0.1, ZI0, pz)
pw_.done()

# 店面：左邊大片櫥窗、右邊木框玻璃折門（打開：四扇折到兩側）
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']; head = dh
pf = Part('front', side='front', smooth=False)
da, db = dx - dw / 2, dx + dw / 2
ops = sorted([(a, b, sl, hd) for a, b, sl, hd in fr['windows']] + [(da, db, 0.0, dh)])
xs_ = XI0
for a, b, sl, hd in ops:   # 開口之間的實牆＋開口上下的牆
    pf['wall'].box(xs_, a, 0, H, ZI1, Z1); pf['wall'].box(a, b, hd, H, ZI1, Z1)
    if sl > 0: pf['wall'].box(a, b, 0, sl, ZI1, Z1)
    xs_ = b
pf['wall'].box(xs_, XI1, 0, H, ZI1, Z1)
for a, b, sl, hd in ops:   # 木框
    pf['wood'].rbox(a, b, hd - 0.07, hd, ZI1 - 0.06, Z1 - 0.02, r=0.006)
    for x in (a, b): pf['wood'].rbox(x - 0.04, x + 0.04, sl, hd, ZI1 - 0.06, Z1 - 0.02, r=0.006)
    if sl > 0:
        pf['wood'].rbox(a, b, sl - 0.02, sl + 0.04, ZI1 - 0.14, Z1 - 0.02, r=0.006)
        nm_ = max(1, int(round((b - a) / 1.0)))
        for k in range(1, nm_): x = a + k * (b - a) / nm_; pf['wood'].rbox(x - 0.03, x + 0.03, sl, hd, ZI1 - 0.05, Z1 - 0.04, r=0.005)
        pf['glass'].quad([(b, sl + 0.02, Z1 - 0.06), (a, sl + 0.02, Z1 - 0.06), (a, hd - 0.03, Z1 - 0.06), (b, hd - 0.03, Z1 - 0.06)])
for side_x, sgn in ((da, 1), (db, -1)):   # 折門：兩扇一組，營業時往外折開、貼在門框外側（外觀參考圖：門打開在騎樓那一側）
    for k in range(2):
        Lw = 0.58; x0_ = side_x + sgn * (0.06 + k * 0.06); cz_ = Z1 + 0.04 + Lw / 2 + k * 0.0
        dp = Part(f'door{sgn}{k}', side='front', T=fm((x0_, 0, cz_), rot('Y', math.pi / 2 + sgn * 0.12 * k)), smooth=False)
        for (xa_, xb_, ya_, yb_) in ((-Lw / 2, -Lw / 2 + 0.07, 0.0, head - 0.08), (Lw / 2 - 0.07, Lw / 2, 0.0, head - 0.08), (-Lw / 2, Lw / 2, 0.0, 0.14), (-Lw / 2, Lw / 2, head - 0.18, head - 0.08), (-Lw / 2, Lw / 2, 0.98, 1.04)):
            dp['wood'].rbox(xa_, xb_, ya_, yb_, -0.022, 0.022, r=0.005)
        dp['glass'].quad([(-Lw / 2 + 0.06, 0.14, 0.0), (Lw / 2 - 0.06, 0.14, 0.0), (Lw / 2 - 0.06, head - 0.18, 0.0), (-Lw / 2 + 0.06, head - 0.18, 0.0)])
        dp.done()
pf['goods'].rect((da - 0.3, 1.55, ZI1 - 0.065), (-1, 0, 0), (0, 1, 0), 0.09, 0.09, ATL['note_hours'])   # 營業時間紙條（貼在左櫥窗玻璃上，從店裡看）
pf.done()
mat_ = Part('doormat'); crb(mat_['vc'], da + 0.1, db - 0.1, 0.0, 0.012, ZI1 - 0.75, ZI1 - 0.1, '#3f4a40', r=0.005); mat_.done()


# ======================================================================
# 燈：深綠琺瑯吊燈、日光燈、吊扇
# ======================================================================
def pendant_build2(pt):
    c = pt['vc']
    clathe(c, [(0.205, -0.17), (0.2, -0.16), (0.17, -0.1), (0.1, -0.05), (0.05, -0.02), (0.03, 0.0), (0.02, 0.04), (0.0, 0.045)], 0, 0, 0, '#2f4a3a', seg=14)
    clathe(c, [(0.0, -0.015), (0.045, -0.03), (0.095, -0.06), (0.165, -0.105), (0.193, -0.162)], 0, 0, 0, '#efe6d2', seg=14)
    ccyl(pt['vcm'], (0, -0.03, 0), (0, -0.07, 0), 0.025, '#b49a5a', seg=8)
    u = pt['emit']; bu = ATL['bulb']; uv = ((bu[0] + bu[2]) / 2, (bu[1] + bu[3]) / 2)
    prof = [(0.0, -0.07), (0.035, -0.085), (0.046, -0.115), (0.03, -0.142), (0.0, -0.148)]; n = 10; rings = []
    for (r, h) in prof: rings.append([(r * math.cos(2 * math.pi * i / n), h, r * math.sin(2 * math.pi * i / n)) for i in range(n)])
    for ra_, rb_ in zip(rings, rings[1:]):
        for i in range(n):
            j = (i + 1) % n; u.face([rb_[i], rb_[j], ra_[j], ra_[i]], [uv] * 4, smooth=True)


PEND = Proto('pendant', pendant_build2)
PENDS = [tuple(p) for p in LAY['lights']['pendants']]
cords = Part('cords')
for (x, y, z) in PENDS:
    PEND.place(fm((x, y, z)))
    ccyl(cords['vc'], (x, y + 0.04, z), (x, H, z), 0.004, '#1f1f1f', seg=4); crb(cords['vcm'], x - 0.04, x + 0.04, H - 0.025, H, z - 0.04, z + 0.04, '#2f4a3a', r=0.006)
    CL.glow(root, 'pendant', x, y - 0.2, z, color='rgba(255,214,160,1)', size=1.6, day=0.3, night=1.0)
cords.done()
tu = ATL['tube']; tuv = ((tu[0] + tu[2]) / 2, (tu[1] + tu[3]) / 2)


def fixture_build(pt):
    cm, u = pt['vcm'], pt['emit']
    crb(cm, -0.06, 0.06, -0.05, -0.01, -0.64, 0.64, '#e6e4de', r=0.008)
    for zz in (-0.61, 0.61): crb(cm, -0.016, 0.016, -0.085, -0.05, zz - 0.02, zz + 0.02, '#d2d0ca', r=0.004)
    for k in range(8):
        a0, a1 = 2 * math.pi * k / 8, 2 * math.pi * (k + 1) / 8; rr = 0.014; yc = -0.07
        u.face([(rr * math.cos(a0), yc + rr * math.sin(a0), -0.6), (rr * math.cos(a1), yc + rr * math.sin(a1), -0.6),
                (rr * math.cos(a1), yc + rr * math.sin(a1), 0.6), (rr * math.cos(a0), yc + rr * math.sin(a0), 0.6)], [tuv] * 4, smooth=True)


FIXP = Proto('fixture', fixture_build)
FIX = [(x, z, ax, H) for x, z, ax in LAY['lights']['tubes']]
for x, z, ax, yc in FIX:
    FIXP.place(fm((x, yc, z), rot('Y', math.pi / 2) if ax == 'x' else None))
    CL.glow(root, 'tube', x, yc - 0.12, z, color='rgba(255,246,228,1)', size=1.8, day=0.3, night=1.0)
fn_ = IT['ceiling_fan']; fx, fy, fz = fn_['x'], fn_['y'], fn_['z']
pf_ = Part('fan', T=fm((fx, fy, fz), rot('Y', 0.3)))
ccyl(pf_['vcm'], (0, 0.0, 0), (0, H - fy, 0), 0.012, '#3a2a20', seg=6); clathe(pf_['vc'], [(0.0, -0.08), (0.09, -0.07), (0.11, -0.03), (0.09, 0.02), (0.03, 0.04), (0.0, 0.05)], 0, 0, 0, '#3a2a20', seg=14)
bl = ATL['blade']
for k in range(4):
    a = k * math.pi / 2; r_ = (math.cos(a), 0, -math.sin(a)); up_ = (math.sin(a) * 0.12, 0.99, math.cos(a) * 0.12)
    pf_['alpha'].rect((0.38 * math.cos(a), -0.03, -0.38 * math.sin(a)), r_, (math.sin(a), 0.0, math.cos(a)), 0.33, 0.07, bl, both=True)
pf_.done()


# ======================================================================
# 左邊：展示台＋兩台淑女車、牆上三台、海報、植物層板、低櫃
# ======================================================================
def platform(it, front_x, face):
    """木頭展示台：檯面木板（板縫）、朝走道那一面一格一格放綠色收納箱"""
    x, z, w, d, h = it['x'], it['z'], it['w'], it['d'], it['h']; xa, xb, za, zb = x - w / 2, x + w / 2, z - d / 2, z + d / 2
    p = Part('platform_' + face); wd_ = p['wood']; c = p['vc']
    wd_.rbox(xa, xb, h - 0.035, h, za, zb, r=0.006)
    for k in range(1, int(w / 0.16)):
        xx = xa + k * w / int(w / 0.16); c.cbox(xx - 0.003, xx + 0.003, h - 0.001, h + 0.0006, za + 0.01, zb - 0.01, '#8a6a48')   # 板縫
    wd_.rbox(xa, xb, 0.0, 0.04, za, zb, r=0.004)
    fx = xb if face == 'L' else xa; sg = 1 if face == 'L' else -1
    n = int(d / 0.48); cw = d / n
    for k in range(n + 1):
        zz = za + k * cw; wd_.rbox(fx - sg * 0.04, fx, 0.04, h - 0.035, zz - 0.02, zz + 0.02, r=0.004)   # 格子的隔板
    wd_.rbox(min(fx, fx - sg * 0.04), max(fx, fx - sg * 0.04), 0.04, 0.06, za, zb, r=0.003)
    c.cbox(min(fx - sg * 0.36, fx - sg * 0.34), max(fx - sg * 0.36, fx - sg * 0.34), 0.04, h - 0.035, za, zb, '#4a3a2c')   # 格子的背板（暗）
    for k in range(n):
        zc = za + (k + 0.5) * cw
        if (k * 7 + (1 if face == 'L' else 3)) % 5 == 2: continue
        bx0, bx1 = (fx - sg * 0.33, fx - sg * 0.065)
        crb(c, min(bx0, bx1), max(bx0, bx1), 0.06, h - 0.06, zc - cw / 2 + 0.05, zc + cw / 2 - 0.05, jit('#4f6248', 0.04), r=0.015)   # 綠色收納箱
        crb(c, min(fx - sg * 0.051, fx - sg * 0.049), max(fx - sg * 0.051, fx - sg * 0.049), 0.16, 0.19, zc - 0.07, zc + 0.07, '#2c3a2a', r=0.004)
    p.done()


platform(IT['platform_left'], None, 'L'); platform(IT['platform_right'], None, 'R')
BIKES = {}
for it in ITL:
    if it['kind'] in ('bike_lady', 'bike_city', 'bike_fold', 'bike_road'):
        tag = {'lady': 'price0', 'city': 'price1', 'fold': 'price2', 'road': 'price4'}[it['model']]
        BIKES[it['model']] = bike(it['kind'], it['model'], it['color'], fm((it['x'], it['y'], it['z']), rot('Y', it['yaw'])), tag=tag)
        if it['model'] in ('lady', 'road'): stand_rear(it['x'], it['z'], it['yaw'])
WALLB = [it for it in ITL if it['kind'] in ('bike_wall', 'bike_mtb')]
hk = Part('wallhooks', side='left')
for k, it in enumerate(WALLB):
    tilt = (0.16, 0.1, 0.13)[k]; T_ = fm((it['x'], it['y'] - 0.6, it['z']), rot('Y', math.pi / 2) @ rot('Z', tilt))
    g = bike(f'wallbike{k}', it['model'], it['color'], T_, side='left', kick=False, tag='price3' if it['model'] == 'mtb' else None); BIKES['wall_' + it['model']] = g
    for lx in (-0.22, 0.2):   # 兩支掛勾（從牆伸出來、勾住上管）
        wp = T_ @ Vector(g2b(lx, g['ht'][1] - 0.1 + lx * 0.25, 0)); gp = Vector((wp.x, -wp.y, wp.z))   # Blender → 遊戲
        ccyl(hk['vcm'], (XI0, gp.z - 0.02, gp.y), (gp.x - 0.04, gp.z - 0.03, gp.y), 0.006, '#2a2b2d', seg=5)
        ccyl(hk['vcm'], (gp.x - 0.04, gp.z - 0.03, gp.y), (gp.x - 0.03, gp.z + 0.04, gp.y), 0.006, '#2a2b2d', seg=5)
        crb(hk['vcm'], XI0, XI0 + 0.01, gp.z - 0.06, gp.z + 0.02, gp.y - 0.03, gp.y + 0.03, '#2a2b2d', r=0.003)
# v1b（LAWWW2 驗收意見：左牆掛四台車）：第四台直掛在左牆最前面（前輪朝上、掛勾勾住前輪框）；重用左牆中間那台米白城市車的網格（linked duplicate）
VB = LAY['wallVertical']; gv = BIKES['wall_' + VB['model']]; sv_ = SPEC[VB['model']]
T_v = fm((VB['x'], 0.0, 0.0), rot('Y', math.pi / 2) @ rot('Z', math.pi / 2))   # 車的 +x（車頭）朝上、車的 +y（坐墊、把手）朝 +z（店門那一邊）
lo_ = T_v @ Vector(g2b(gv['ra'][0] - sv_['R'], 0.0, 0.0)); lo_g = (lo_.x, lo_.z, -lo_.y)   # 後輪最下緣（遊戲座標）
T_v = fm((0.0, VB['y0'] - lo_g[1], VB['z0'] - lo_g[2]), Matrix.Identity(3)) @ T_v   # 後輪最下緣 y＝y0；車的 y＝0 那條線（輪子下緣）z＝z0
bike_clone(gv, 'wallbike_v', T_v, side='left')
RIN = gv['R'] - 2 * sv_['t'] - 0.018   # 輪框內緣的半徑（wheel_proto：輪框中心 R−2t−0.009、粗 0.009）
fw_ = T_v @ Vector(g2b(gv['fa'][0] + RIN, gv['fa'][1], 0.0)); fwg = (fw_.x, fw_.z, -fw_.y)   # 前輪框內緣的頂點（遊戲座標）
HKR = 0.007; hy_ = fwg[1] - HKR - 0.003   # （輪框斷面是三角形，再低 3 mm 才不插進輪框） 掛勾的橫桿頂面＝輪框內緣（輪框壓在掛勾上：不懸空）
ccyl(hk['vcm'], (XI0, hy_, fwg[2]), (fwg[0] + 0.045, hy_, fwg[2]), HKR, '#2a2b2d', seg=5)   # 直掛的掛勾：從牆伸出來、穿過輻條、從輪框裡面勾住
ccyl(hk['vcm'], (fwg[0] + 0.045, hy_, fwg[2]), (fwg[0] + 0.045, hy_ + 0.06, fwg[2]), HKR, '#2a2b2d', seg=5)
crb(hk['vcm'], XI0, XI0 + 0.012, hy_ - 0.05, hy_ + 0.05, fwg[2] - 0.035, fwg[2] + 0.035, '#2a2b2d', r=0.003)
hk.done()
VB_INFO = dict(rear_bottom_y=round(VB['y0'], 3), front_rim_top=[round(v, 3) for v in fwg])
# 左牆：構造海報＋黑白照（最前面）、植物層板
pl = Part('leftwall_deco', side='left'); xw = XI0 + 0.012


def frame_on_wall(p, x, y, z, w, h, cell, axis='x', sgn=1, fcol='#6b4a30', depth=0.025):
    """有木框的海報、照片（貼在牆上）：axis＝牆的法線軸（x：左右牆；z：前後牆、隔間牆）"""
    if axis == 'x':
        p['wood'].rbox(x - (depth if sgn < 0 else 0), x + (depth if sgn > 0 else 0), y - h / 2 - 0.025, y + h / 2 + 0.025, z - w / 2 - 0.025, z + w / 2 + 0.025, r=0.005)
        p['goods'].rect((x + sgn * (depth + 0.001), y, z), (0, 0, -sgn), (0, 1, 0), w / 2, h / 2, ATL[cell] if isinstance(cell, str) else cell)
    else:
        p['wood'].rbox(x - w / 2 - 0.025, x + w / 2 + 0.025, y - h / 2 - 0.025, y + h / 2 + 0.025, z - (depth if sgn < 0 else 0), z + (depth if sgn > 0 else 0), r=0.005)
        p['goods'].rect((x, y, z + sgn * (depth + 0.001)), (sgn, 0, 0), (0, 1, 0), w / 2, h / 2, ATL[cell] if isinstance(cell, str) else cell)


PZ = LAY['wallVertical']['posterZ']   # v1b：直掛的車佔了 z 4.1～5.3，海報、黑白照往店門那邊挪
frame_on_wall(pl, xw, 2.2, PZ, 0.5, 0.73, 'anatomy')
frame_on_wall(pl, xw, 1.43, PZ, 0.5, 0.35, 'photo_street')
for (fz_, cell_n) in ((4.32, 'photo_rider'), (4.9, 'lineart')):   # v1b：再兩個小相框（直掛那台車上面、植物層板下面；牆角的樑底 3.18）
    frame_on_wall(pl, xw, 2.36, fz_, 0.24, 0.3, cell_n)
pl['wood'].rbox(XI0, XI0 + 0.26, 2.92, 2.95, 4.4, 5.2, r=0.004)
for zz in (4.5, 5.1): ccyl(pl['vcm'], (XI0, 2.82, zz), (XI0 + 0.22, 2.92, zz), 0.006, '#2a2b2d', seg=4)
pl.done()


def pothos(name, x, y, z, side=None, nv=7, spread=0.55, drop=1.0, pot='#e8e3d6', dirx=1, dirz=0):
    """黃金葛（盆子＋從盆邊垂下來的藤、心形葉片卡）"""
    p = Part(name, side=side); c = p['vc']; u = p['alpha']
    clathe(c, [(0.0, 0.0), (0.09, 0.0), (0.12, 0.16), (0.125, 0.18), (0.0, 0.18)], x, y, z, pot, seg=14)
    clathe(c, [(0.0, 0.17), (0.11, 0.17), (0.0, 0.175)], x, y, z, '#4a3424', seg=12)
    rr = random.Random(hash(name) % 9999)
    for v in range(nv):
        a = rr.uniform(-1.3, 1.3) + math.atan2(dirz, dirx); L_ = rr.uniform(0.4, 1.0) * drop; pts = []
        for k in range(8):
            t = k / 7; r_ = 0.1 + spread * 0.35 * t
            pts.append((x + r_ * math.cos(a) + rr.uniform(-0.02, 0.02), y + 0.17 + 0.06 * math.sin(t * 3) - L_ * t ** 1.6, z - r_ * math.sin(a) * 0.6 + rr.uniform(-0.02, 0.02)))
        cpath(c, pts, 0.004, '#5a7a3a', seg=3)
        for k in range(1, 8):
            px_, py_, pz_ = pts[k]; ya = rr.uniform(0, math.pi * 2); s_ = rr.uniform(0.75, 1.15)
            u.rect((px_, py_ - 0.03, pz_), (math.cos(ya), 0, math.sin(ya)), (0.25 * math.sin(ya), 0.9, -0.25 * math.cos(ya)), 0.035 * s_, 0.045 * s_, ATL[f'leaf{rr.randrange(4)}'], both=True)
    for k in range(10):   # 盆上面的一叢
        ya = rr.uniform(0, math.pi * 2); r_ = rr.uniform(0.0, 0.1)
        u.rect((x + r_ * math.cos(ya), y + 0.24 + rr.uniform(0, 0.06), z + r_ * math.sin(ya)), (math.cos(ya), 0, math.sin(ya)), (0.3 * math.sin(ya), 0.85, -0.3 * math.cos(ya)), 0.04, 0.05, ATL[f'leaf{rr.randrange(4)}'], both=True)
    p.done()


pothos('pothos_tl', XI0 + 0.14, 2.95, 4.8, side='left', nv=10, drop=1.0, dirx=1)
# 低櫃（櫃台後面靠左牆）：三層木板、資料夾、書、紙箱；下面綠色鐵櫃
ls = IT['low_shelf_left']; lx0, lx1, lz0, lz1, lh = XI0, XI0 + ls['w'], ls['z'] - ls['d'] / 2, ls['z'] + ls['d'] / 2, ls['h']
pl2 = Part('low_shelf', side='left'); w_, c, g = pl2['wood'], pl2['vc'], pl2['goods']
for y in (0.08, 0.55, 1.0, lh - 0.03): w_.rbox(lx0, lx1, y, y + 0.03, lz0, lz1, r=0.004)
for k in range(5): zz = lz0 + k * (lz1 - lz0) / 4; w_.rbox(lx0, lx1, 0.0 if k else 0.55, lh, zz - 0.015, zz + 0.015, r=0.004)
crb(c, lx0, lx1, 0.0, 0.55, lz0 + 0.02, lz0 + 1.2, '#4c5d4a', r=0.01)   # 綠色鐵櫃（下層一段）
for k in range(2): c.cbox(lx1, lx1 + 0.004, 0.06, 0.5, lz0 + 0.04 + k * 0.58, lz0 + 0.6 + k * 0.58, '#56685a'); crb(c, lx1, lx1 + 0.02, 0.4, 0.44, lz0 + 0.5 + k * 0.58, lz0 + 0.56 + k * 0.58, '#c9ccce', r=0.004)
rr = random.Random(21); z = lz0 + 1.25
while z < lz1 - 0.15:   # 上兩層：資料夾、書背、紙箱、零件盒（參考圖：低櫃塞滿）
    for y in (0.58, 1.03):
        w2 = rr.uniform(0.3, 0.5); kind = rr.choice(['spines', 'spines', 'kraft0', 'kraft3', 'pack1', 'pack5', 'kraft4'])
        h2 = 0.38 if kind == 'spines' else rr.uniform(0.18, 0.36)
        cell = sub('spines', *( (0, 0, 0.5, 1) if rr.random() < 0.5 else (0.5, 0, 1, 1))) if kind == 'spines' else kind
        g.box(lx0 + 0.15, y + h2 / 2, min(z + w2 / 2, lz1 - 0.02 - w2 / 2), 0.26, h2, min(w2, lz1 - z - 0.04), cell, front='+x', cells={'+x': cell})
    z += rr.uniform(0.38, 0.56)
z = lz0 + 0.1
while z < lz1 - 0.3:   # 櫃子上面也擺紙箱
    w2 = rr.uniform(0.35, 0.55); g.box(lx0 + 0.16, lh + 0.12, z + w2 / 2, 0.28, 0.22, w2, rr.choice(['kraft4', 'pack5', 'kraft1', 'pack0']), front='+x'); z += w2 + rr.uniform(0.3, 0.7)
pl2.done()

# ---------------- 櫃台（木頭、正面小招牌；上面的東西） ----------------
ct = IT['counter']; cx, cz, cw, cd, ch = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
ca, cb, za, zb = cx - cw / 2, cx + cw / 2, cz - cd / 2, cz + cd / 2
pc = Part('counter'); w_, c, cm, g = pc['wood'], pc['vc'], pc['vcm'], pc['goods']
w_.rbox(ca - 0.03, cb + 0.03, ch - 0.04, ch, za - 0.03, zb + 0.03, r=0.008)
cf = ATL['counter_face']
g.rect((cx, (ch - 0.04) / 2, zb + 0.001), (1, 0, 0), (0, 1, 0), cw / 2, (ch - 0.04) / 2, cf)                    # 客人那一面（朝店門）
g.rect((cb + 0.001, (ch - 0.04) / 2, cz), (0, 0, -1), (0, 1, 0), cd / 2, (ch - 0.04) / 2, cf)                   # 朝走道那一面
w_.box(ca, cb, 0.0, ch - 0.04, za, zb)
c.cbox(ca + 0.02, cb - 0.02, 0.0, 0.08, zb - 0.001, zb + 0.002, '#4a3828'); c.cbox(cb - 0.001, cb + 0.002, 0.0, 0.08, za + 0.02, zb - 0.02, '#4a3828')   # 踢腳（踢黑）
pc['sign'].rect((cx + 0.1, 0.6, zb + 0.022), (1, 0, 0), (0, 1, 0), 0.55, 0.172, ATL['sign_counter'])
w_.rbox(cx + 0.1 - 0.58, cx + 0.1 + 0.58, 0.6 - 0.2, 0.6 + 0.2, zb, zb + 0.02, r=0.004)
y0 = ch
# 螢幕（朝客人斜一點）
MON = fm((cx - 0.3, y0, cz - 0.15), rot('Y', 0.45))
pm = Part('monitor', T=MON); crb(pm['vc'], -0.12, 0.12, 0.0, 0.015, -0.09, 0.05, '#1e1e20', r=0.006); ccyl(pm['vc'], (0, 0.01, -0.04), (0, 0.17, -0.04), 0.018, '#1e1e20', seg=6)
crb(pm['vc'], -0.27, 0.27, 0.12, 0.45, -0.065, -0.03, '#1e1e20', r=0.008); pm['emit'].rect((0, 0.285, -0.029), (1, 0, 0), (0, 1, 0), 0.25, 0.15, ATL['screen'])
crb(pm['vc'], -0.22, 0.22, 0.0, 0.02, 0.12, 0.28, '#2a2b2d', r=0.005); pm.done()
# 檯燈（深綠，彎的燈臂）
pd = Part('desklamp', T=fm((ca + 0.25, y0, cz - 0.55), rot('Y', -0.6)))
clathe(pd['vc'], [(0.0, 0.0), (0.08, 0.0), (0.08, 0.02), (0.03, 0.035), (0.0, 0.035)], 0, 0, 0, '#2f4a3a', seg=14)
cpath(pd['vcm'], [(0, 0.03, 0), (0.02, 0.3, 0), (0.18, 0.42, 0)], 0.008, '#2f4a3a', seg=5)
clathe(pd['vc'], [(0.0, 0.07), (0.03, 0.06), (0.075, 0.0), (0.08, -0.01)], 0.2, 0.4, 0, '#2f4a3a', seg=14, R=rot('Z', -0.5))
pd['emit'].rect((0.215, 0.37, 0), (1, 0, 0), (0, 0, 1), 0.04, 0.04, ATL['lamp']); pd.done()
# 攤開的書、型錄一疊、筆筒、收銀機、小零件抽屜、車鈴車燈的小玻璃櫃
g.rect((cx + 0.15, y0 + 0.022, zb - 0.32), (1, 0, 0), (0, 0, -1), 0.2, 0.1, ATL['openbook'])
crb(c, cx + 0.15 - 0.205, cx + 0.15 + 0.205, y0, y0 + 0.02, zb - 0.43, zb - 0.21, '#e8e2d4', r=0.004)
for k in range(4): g.box(cb - 0.25 + k * 0.004, y0 + 0.008 + k * 0.012, zb - 0.22 + k * 0.006, 0.19, 0.012, 0.25, 'catalog', front='+y', cells={'+y': 'catalog'})
clathe(c, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.11), (0.0, 0.11)], cx + 0.55, y0, zb - 0.5, '#3a5a48', seg=10)
for k in range(5): ccyl(c, (cx + 0.55 + 0.012 * math.cos(k), y0 + 0.05, zb - 0.5 + 0.012 * math.sin(k)), (cx + 0.55 + 0.02 * math.cos(k), y0 + 0.17, zb - 0.5 + 0.02 * math.sin(k)), 0.0035, ['#1d1d1d', '#c8202a', '#2f6fb8', '#1d1d1d', '#e0a030'][k], seg=4)
cr = (cb - 0.3, y0, za + 0.35)   # 收銀機（米白、小螢幕、抽屜）
CK.ph_put('CashRegister_01', cr[0], y0, cr[2], yaw=0.0, height=0.3, decimate=0.018)   # 收銀機：Poly Haven 掃描（取代原本 18 個方塊拼的；SHOP-CC0-HELP-1113）
dr = (cx - 0.05, y0, za + 0.2)   # 小零件抽屜（參考圖：螢幕右邊一個灰色多格抽屜）
g.box(dr[0], y0 + 0.14, dr[2], 0.42, 0.28, 0.22, 'drawers', front='+z', side=sub('drawers', 0, 0, 0.05, 0.05))
gc = (cb - 0.32, y0, cz + 0.05)   # 小玻璃櫃：車鈴、車燈（AA_646「車鈴車燈的小玻璃櫃」）
crb(cm, gc[0] - 0.2, gc[0] + 0.2, y0, y0 + 0.03, gc[2] - 0.14, gc[2] + 0.14, '#8d6a48', r=0.006)
crb(cm, gc[0] - 0.2, gc[0] + 0.2, y0 + 0.25, y0 + 0.27, gc[2] - 0.14, gc[2] + 0.14, '#8d6a48', r=0.006)
for (sx_, sz_) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): ccyl(cm, (gc[0] + sx_ * 0.195, y0 + 0.03, gc[2] + sz_ * 0.135), (gc[0] + sx_ * 0.195, y0 + 0.25, gc[2] + sz_ * 0.135), 0.006, '#b49a5a', seg=4)
pc['glass'].quad([(gc[0] - 0.19, y0 + 0.03, gc[2] + 0.14), (gc[0] + 0.19, y0 + 0.03, gc[2] + 0.14), (gc[0] + 0.19, y0 + 0.25, gc[2] + 0.14), (gc[0] - 0.19, y0 + 0.25, gc[2] + 0.14)])
pc['glass'].quad([(gc[0] + 0.2, y0 + 0.03, gc[2] + 0.13), (gc[0] + 0.2, y0 + 0.03, gc[2] - 0.13), (gc[0] + 0.2, y0 + 0.25, gc[2] - 0.13), (gc[0] + 0.2, y0 + 0.25, gc[2] + 0.13)])
for k in range(3): csph(cm, (gc[0] - 0.12 + k * 0.1, y0 + 0.06, gc[2]), 0.028, '#c9ccce', seg=8, rings=4, sy=0.7)
for k in range(3): crb(c, gc[0] - 0.14 + k * 0.1, gc[0] - 0.08 + k * 0.1, y0 + 0.03, y0 + 0.07, gc[2] + 0.03, gc[2] + 0.09, ['#1d1d1d', '#c8202a', '#1d1d1d'][k], r=0.008)
crb(c, cx - 0.65, cx - 0.45, y0, y0 + 0.012, cz + 0.4, cz + 0.62, '#f2efe6', r=0.002)   # 收據
clathe(c, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.09), (0.0, 0.09)], cx - 0.75, y0, cz + 0.15, '#c8beac', seg=10)   # 馬克杯
pc.done()
pothos('pothos_counter', cx - 0.45, y0, zb - 0.13, nv=11, drop=0.95, spread=0.7, dirx=0.2, dirz=-1)
# 長凳（木條）
bn = IT['bench']; bx, bz, bw, bd2, bh = bn['x'], bn['z'], bn['w'], bn['d'], bn['h']
pb = Part('bench'); w_ = pb['wood']
for k in range(4): zz = bz - bd2 / 2 + 0.02 + k * (bd2 - 0.04) / 3; w_.rbox(bx - bw / 2, bx + bw / 2, bh - 0.035, bh, zz - 0.04, zz + 0.04, r=0.008)
for sx_ in (-1, 1):
    for sz_ in (-1, 1): w_.rbox(bx + sx_ * (bw / 2 - 0.08) - 0.025, bx + sx_ * (bw / 2 - 0.08) + 0.025, 0.0, bh - 0.035, bz + sz_ * (bd2 / 2 - 0.06) - 0.025, bz + sz_ * (bd2 / 2 - 0.06) + 0.025, r=0.006)
    w_.rbox(bx + sx_ * (bw / 2 - 0.08) - 0.02, bx + sx_ * (bw / 2 - 0.08) + 0.02, 0.12, 0.17, bz - bd2 / 2 + 0.05, bz + bd2 / 2 - 0.05, r=0.005)
w_.rbox(bx - bw / 2 + 0.08, bx + bw / 2 - 0.08, 0.12, 0.16, bz - 0.02, bz + 0.02, r=0.005)
pb.done()
# 隔間牆的黑板、路線圖、拍立得
pk = Part('partition_deco'); zw = pz + 0.002
cb_ = IT['chalkboard']; frame_on_wall(pk, cb_['x'], cb_['y'], zw, cb_['w'], cb_['h'], 'chalk', axis='z', sgn=1, depth=0.03)
rm = IT['route_map']; frame_on_wall(pk, rm['x'], rm['y'], zw, rm['w'], rm['h'], 'routemap', axis='z', sgn=1, fcol='#e0d6c0', depth=0.015)
pk['goods'].rect((cb_['x'] + 0.66, 1.1, zw + 0.004), (1, 0, 0), (0, 1, 0), 0.19, 0.14, ATL['snaps'])
pk['goods'].rect((rm['x'] + 0.48, 1.55, zw + 0.004), (1, 0, 0), (0, 1, 0), 0.07, 0.07, ATL['note_used'])
pk['goods'].rect((cb_['x'] - 0.55, 1.65, zw + 0.004), (1, 0, 0), (0, 1, 0), 0.08, 0.08, ATL['note_test'])
for (xx, yy) in ((cb_['x'] + 0.55, 1.22), (cb_['x'] + 0.77, 1.22), (rm['x'] + 0.48, 1.62)): csph(pk['vc'], (xx, yy, zw + 0.01), 0.008, '#c8202a', seg=6, rings=3)
pk.done()


# ======================================================================
# 天花板吊的大招牌「慢輪單車」
# ======================================================================
hs = IT['hang_sign']; hx_, hy_, hz_, hw_, hh_ = hs['x'], hs['y'], hs['z'], hs['w'], hs['h']
ps = Part('hang_sign')
ps['vc'].crbox(hx_ - hw_ / 2 - 0.035, hx_ + hw_ / 2 + 0.035, hy_ - hh_ / 2 - 0.035, hy_ + hh_ / 2 + 0.035, hz_ - 0.03, hz_ + 0.015, '#3a2a1e', r=0.01)
ps['sign'].rect((hx_, hy_, hz_ + 0.017), (1, 0, 0), (0, 1, 0), hw_ / 2, hh_ / 2, ATL['sign_big'])
ps['sign'].rect((hx_, hy_, hz_ - 0.032), (-1, 0, 0), (0, 1, 0), hw_ / 2, hh_ / 2, ATL['sign_big'])
for sx_ in (-1, 1): ccyl(ps['vcm'], (hx_ + sx_ * (hw_ / 2 - 0.15), hy_ + hh_ / 2 + 0.03, hz_ - 0.008), (hx_ + sx_ * (hw_ / 2 - 0.15), H, hz_ - 0.008), 0.006, '#2a2b2d', seg=5)
ps.done()


# ======================================================================
# 右邊：層架（安全帽、燈、鈴、鎖、零件盒、吊卡）、相框、打氣筒、空壓機
# ======================================================================
def helmet_build(col, vent):
    def f(pt):
        c = pt['vc']; n0 = _N0(c)
        bm = L.lathe([(0.125, 0.0), (0.13, 0.03), (0.122, 0.08), (0.1, 0.12), (0.06, 0.15), (0.0, 0.16)], seg=12)
        c.add_bm(bm, fm((0, 0, 0))); bm.free(); c.paint(_new(c, n0), col)
        for k in range(3): crb(c, -0.11 + k * 0.08, -0.07 + k * 0.08, 0.135 - abs(k - 1) * 0.02, 0.152 - abs(k - 1) * 0.02, -0.03, 0.03, vent, r=0.006)
        crb(c, -0.13, 0.13, 0.0, 0.012, -0.004, 0.004, '#2a2b2d', r=0.002)   # 帽沿的黑邊
    return f


HEL = [Proto(f'helmet{k}', helmet_build(col, vent)) for k, (col, vent) in enumerate((('#ecebe6', '#2a2b2d'), ('#d9dbdc', '#2a2b2d'), ('#9fa3a6', '#1d1d1d'), ('#3a3d40', '#1d1d1d')))]


def lock_build(col):
    def f(pt):
        c, cm = pt['vc'], pt['vcm']
        torus(c, 0.075, 0.009, col, su=10, sv=4, a0=0.0, a1=math.pi)
        for s_ in (-1, 1): ccyl(c, (s_ * 0.075, 0.0, 0), (s_ * 0.075, -0.08, 0), 0.009, col, seg=5)
        crb(cm, -0.1, 0.1, -0.1, -0.06, -0.02, 0.02, '#8d9196', r=0.008)
    return f


LOCK = [Proto('lock_b', lock_build('#1d1d1d')), Proto('lock_r', lock_build('#7a1f22'))]


def pump_build(col):
    def f(pt):
        c, cm = pt['vc'], pt['vcm']
        crb(c, -0.12, 0.12, 0.0, 0.025, -0.05, 0.05, '#1d1d1d', r=0.008)
        clathe(c, [(0.0, 0.02), (0.032, 0.02), (0.034, 0.06), (0.03, 0.56), (0.02, 0.58), (0.0, 0.58)], 0, 0, 0, col, seg=12)
        ccyl(cm, (0, 0.58, 0), (0, 0.66, 0), 0.006, '#c9ccce', seg=5); crb(c, -0.13, 0.13, 0.65, 0.685, -0.017, 0.017, '#1d1d1d', r=0.012)
        clathe(cm, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.02), (0.0, 0.02)], 0.0, 0.12, 0.04, '#ecebe6', seg=12, R=rot('X', math.pi / 2))
        cpath(c, [(0.0, 0.1, 0.03), (0.06, 0.06, 0.05), (0.08, 0.3, 0.04), (0.04, 0.5, 0.035)], 0.005, '#1d1d1d', seg=4)
    return f


PUMP = [Proto('pump_y', pump_build('#d8b42a')), Proto('pump_k', pump_build('#2a2b2d'))]
sr = IT['shelf_right']; sx0, sx1, sz0, sz1 = XI1 - sr['w'], XI1, sr['z'] - sr['d'] / 2, sr['z'] + sr['d'] / 2
psr = Part('shelf_right', side='right'); w_, c, cm, g = psr['wood'], psr['vc'], psr['vcm'], psr['goods']
BOARDS = (0.9, 1.35, 1.8, 2.25)
nz = 5
for k in range(nz + 1):   # 深色鐵架立柱＋斜撐
    zz = sz0 + k * (sz1 - sz0) / nz
    for xx in (sx0 + 0.02, sx1 - 0.03): crb(cm, xx - 0.016, xx + 0.016, 0.0, 2.45, zz - 0.016, zz + 0.016, '#2c3a30', r=0.003)
    for y in BOARDS: crb(cm, sx0, sx1, y - 0.04, y - 0.02, zz - 0.012, zz + 0.012, '#2c3a30', r=0.002)
for y in BOARDS: w_.rbox(sx0 - 0.02, sx1, y - 0.02, y + 0.01, sz0, sz1, r=0.005)
rr = random.Random(7)
for bi, y in enumerate(BOARDS):
    z = sz1 - 0.12
    while z > sz0 + 0.1:
        kind = rr.choice(['pack', 'pack', 'blister', 'light', 'bottle', 'lock'] if bi < 3 else ['helmet'])
        if kind == 'lock':   # v2：U 型鎖照原本三組（間距加大以後抽到的次數變多，鎖的模型面數高）
            N_LOCKG = globals().get('N_LOCKG', 0)
            if N_LOCKG >= 3: kind = 'pack'
            else: globals()['N_LOCKG'] = N_LOCKG + 1
        if bi == 3 and kind == 'helmet':
            HEL[rr.randrange(4)].place(fm((sx0 + 0.2, y + 0.01, z), rot('Y', rr.uniform(-0.4, 0.4) - math.pi / 2) @ Matrix.Scale(1.0, 3))); z -= 0.34; continue
        if kind == 'pack':   # v2：印刷包裝盒（一格一種包裝），大小不一；三成歪放、兩成開蓋；後面留空（數量約原本一半）
            w2 = rr.uniform(0.14, 0.3); h2 = rr.uniform(0.1, 0.3); d2 = rr.uniform(0.16, 0.26); cel = rr.choice(PKG_CELLS); sid = rr.choice(PKG_CELLS)
            pk_ = psr['pkg'] if rr.random() > 0.3 else None
            if pk_ is not None:
                pk_.box(sx0 + 0.04 + d2 / 2, y + 0.01 + h2 / 2, z - w2 / 2, d2, h2, w2, cel, front='-x', side=(sid[0], sid[1], sid[0] + 0.03, sid[3]))
            else:   # 歪放：自己一個 Part，轉一點角度
                pt_ = Part(f'pkgtilt{bi}_{int(z * 100)}', side='right', T=fm((sx0 + 0.04 + d2 / 2, y + 0.01, z - w2 / 2), rot('Y', rr.uniform(-0.35, 0.35)) @ rot('X', rr.choice([0.0, 0.0, 0.12]))))
                pt_['pkg'].box(0, h2 / 2, 0, d2, h2, w2, cel, front='-x', side=(sid[0], sid[1], sid[0] + 0.03, sid[3])); pt_.done()
            if rr.random() < 0.2 and pk_ is not None:   # 開蓋：上蓋翻開、靠在後面
                pk_.rect((sx0 + 0.04 + d2, y + 0.01 + h2 + w2 * 0.0 + 0.06, z - w2 / 2), (0, 0, 1), (0.35, 0.94, 0), w2 / 2, 0.06, cel, both=True)
            z -= w2 + rr.uniform(0.1, 0.22)
        elif kind == 'blister':   # 吊卡（掛在上一層板下面的掛勾）
            for j in range(2):
                bz_ = z - j * 0.17; nm = f'blister{rr.randrange(4)}'
                ccyl(cm, (sx1 - 0.03, y + 0.38, bz_), (sx0 + 0.03, y + 0.38, bz_), 0.003, '#9a9ea2', seg=3)
                for q in range(3): g.rect((sx0 + 0.05 + q * 0.04, y + 0.27, bz_), (0, 0, 1), (0, 1, 0), 0.07, 0.09, ATL[nm], both=True)
            z -= 0.36
        elif kind == 'light':
            for j in range(2):   # v2：四個減成兩個
                col = ['#1d1d1d', '#c8202a', '#e8e6e0', '#1d1d1d'][j * 2 + rr.randrange(2)]
                crb(c, sx0 + 0.04, sx0 + 0.1, y + 0.01, y + 0.08, z - 0.05 - j * 0.09, z - 0.0 - j * 0.09, col, r=0.01)
                crb(c, sx0 + 0.035, sx0 + 0.042, y + 0.025, y + 0.065, z - 0.045 - j * 0.09, z - 0.005 - j * 0.09, '#f4f0d0' if j != 1 else '#e04040', r=0.004)
            z -= 0.32
        elif kind == 'bottle':
            for j in range(2):   # v2：水壺兩支，有弧度的瓶身＋瓶蓋（黑）＋吸嘴
                bx_, bz_ = sx0 + 0.12, z - 0.05 - j * 0.1; col = rr.choice(['#2f6fb8', '#e8e6e0', '#3a7a4a', '#c8462e'])
                clathe(c, [(0.0, 0.0), (0.033, 0.0), (0.034, 0.07), (0.027, 0.1), (0.035, 0.15), (0.025, 0.185), (0.0, 0.19)], bx_, y + 0.01, bz_, col, seg=8)
                clathe(c, [(0.0, 0.185), (0.024, 0.185), (0.022, 0.215), (0.0, 0.225)], bx_, y + 0.01, bz_, '#1d1d1d', seg=6)
            z -= 0.28
        else:
            for j in range(2): LOCK[j % 2].place(fm((sx0 + 0.1, y + 0.11, z - 0.07 - j * 0.15), rot('Y', math.pi / 2)))
            z -= 0.32
# v1b（LAWWW2：右牆層架擺滿）：最下面加一層板（0.12）：零件盒、安全帽；兩疊外胎在後面（TIREP 定義以後）
w_.rbox(sx0 - 0.02, sx1, 0.1, 0.13, sz0, sz1, r=0.005)
rr2 = random.Random(46); z = 2.32; N_LOW = 0
while z > 0.3:
    w2 = rr2.uniform(0.2, 0.3); h2 = rr2.uniform(0.2, 0.42)
    g.box(sx0 + 0.18, 0.13 + h2 / 2, z - w2 / 2, 0.26, h2, w2, rr2.choice(['kraft0', 'kraft1', 'kraft3', 'pack0', 'pack2', 'pack4', 'pack6']), front='-x'); z -= w2 + rr2.uniform(0.25, 0.4); N_LOW += 1   # v2：間距加大（數量約一半）
z = 0.2
while z > sz0 + 0.25:   # 最下層靠走道那一頭：再一排小零件盒（預算：安全帽太貴，用印刷圖集的盒子）
    w2 = rr2.uniform(0.18, 0.26); h2 = rr2.uniform(0.15, 0.3)
    g.box(sx0 + 0.18, 0.13 + h2 / 2, z - w2 / 2, 0.26, h2, w2, f'pack{rr2.randrange(8)}', front='-x'); z -= w2 + 0.03; N_LOW += 1
for k, nm in enumerate(('note_lock', 'note_pump')): g.rect((sx0 - 0.023, BOARDS[k] - 0.005, sz0 + 1.3 + k * 2.4), (0, 0, 1), (0, 1, 0), 0.06, 0.028, sub(nm, 0, 0.3, 1, 0.75))   # 層板前緣的手寫紙條
frame_on_wall(psr, XI1 - 0.012, 2.95, 0.55, 0.42, 0.53, 'lineart', axis='x', sgn=-1)
frame_on_wall(psr, XI1 - 0.012, 2.95, -0.35, 0.4, 0.5, 'photo_rider', axis='x', sgn=-1, fcol='#2a2a2a')
psr.done()
pothos('pothos_tr', sx0 + 0.2, BOARDS[-1] + 0.01, sz1 - 0.22, side='right', nv=10, drop=0.8, dirx=-1)
pu = IT['pumps']
for k, (dxp, dzp) in enumerate(((-0.25, 0.04), (0.0, -0.03), (0.26, 0.05))):
    if k == 1: CK.ph_put('tire_pump', pu['x'] + dxp, 0.0, pu['z'] + dzp, yaw=0.5, height=0.6, decimate=0.05); continue   # v2：Poly Haven 掃描的打氣筒
    PUMP[0 if k == 0 else 1].place(fm((pu['x'] + dxp, 0, pu['z'] + dzp), rot('Y', -0.4 + k * 0.3)))
# 空壓機（綠色儲氣筒橫躺、兩個輪子、馬達、壓力錶；黃色風管捲在層架柱子上）
cp = IT['compressor']; pcp = Part('compressor', T=fm((cp['x'], 0, cp['z']), rot('Y', 0.15))); c, cm = pcp['vc'], pcp['vcm']
clathe(c, [(0.0, -0.3), (0.1, -0.29), (0.15, -0.25), (0.16, -0.2), (0.16, 0.2), (0.15, 0.25), (0.1, 0.29), (0.0, 0.3)], 0, 0.22, 0, '#3e5a44', seg=16, R=rot('Z', math.pi / 2))
for s_ in (-1, 1):
    torus(c, 0.055, 0.025, '#1d1d1d', su=12, sv=4, ctr=(-0.22, 0.08, s_ * 0.17)); ccyl(cm, (-0.22, 0.08, -0.17), (-0.22, 0.08, 0.17), 0.008, '#8d9196', seg=5)
crb(c, 0.2, 0.3, 0.0, 0.1, -0.12, 0.12, '#2a2b2d', r=0.01)
clathe(c, [(0.0, 0.0), (0.09, 0.0), (0.1, 0.05), (0.09, 0.18), (0.0, 0.19)], -0.05, 0.37, 0, '#2a2b2d', seg=12)
clathe(cm, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.02), (0.0, 0.02)], 0.14, 0.42, 0.06, '#ecebe6', seg=10, R=rot('X', math.pi / 2))
cpath(cm, [(-0.3, 0.3, 0), (-0.38, 0.55, 0), (-0.3, 0.75, 0), (-0.2, 0.78, 0)], 0.01, '#9a9ea2', seg=5)
pcp.done()
hose = Part('hose', side='right')
for k in range(4): torus(hose['vc'], 0.12 + k * 0.004, 0.007, '#d8b42a', su=16, sv=3, ctr=(sx0 - 0.04, 1.45 - k * 0.02, sz0 + 0.02 + k * 0.012))
hose.done()

# ---------------- 修車區：輪胎架、綠色抽屜櫃、右牆高層架、左邊鐵架、修車架、洞洞板、工作台、工具車 ----------------
tr_ = IT['tire_rack']; tz0, tz1 = tr_['z'] - tr_['d'] / 2, tr_['z'] + tr_['d'] / 2
ptr = Part('tire_rack', side='right'); cm = ptr['vcm']
for yb in (tr_['y'] + 0.02, ):
    ccyl(cm, (tr_['x'], yb, tz0), (tr_['x'], yb, tz1), 0.014, '#2c3a30', seg=6)
    for zz in (tz0, tz1): ccyl(cm, (XI1, yb, zz), (tr_['x'], yb, zz), 0.012, '#2c3a30', seg=5)
ptr.done()


def tire_build(R, t, col):
    def f(pt): torus(pt['vc'], R - t, t, col, su=20, sv=4, tz=t * 1.1)
    return f


TIREP = [Proto('tire_a', tire_build(0.34, 0.02, '#1f1e1d'), side='right'), Proto('tire_b', tire_build(0.33, 0.028, '#262422'), side='right')]
z = tz1 - 0.08; k = 0
while z > tz0 + 0.05:
    TIREP[k % 2].place(fm((tr_['x'] + 0.02 * (k % 2), tr_['y'] + 0.02 - 0.29, z), rot('Y', 0.06 * (k % 3 - 1))))
    z -= 0.14; k += 1
# v1b：右牆層架最下面兩疊外胎（同一組外胎原型，貼著牆立著、一疊三條）
for zc in (3.85, 2.81):
    for j in range(2):
        tp = TIREP[j % 2]; Ro, tt = ((0.34, 0.02), (0.33, 0.028))[j % 2]
        tp.place(fm((sx0 + 0.1 + j * 0.07, 0.13 + Ro - tt * (1 - math.cos(math.pi / 4)) + 0.0005, zc), rot('Y', math.pi / 2)))   # 外胎是四邊形斷面（最低的頂點在 R−0.29t）：貼著層板
# v1b：右牆上面一整排掛著的內胎（每條一支掛釘；內胎＝一個原型 instancing）
def tube_build(pt):
    """掛著的內胎：橢圓的環（在 y-z 平面、頂點在原點、往下垂 2b），封閉的管子（不用補反面）"""
    c = pt['vc']; n0 = _N0(c); a_, b_, r_, su, sv = 0.075, 0.31, 0.0095, 12, 3; rings = []
    for i in range(su):
        th = 2 * math.pi * i / su
        cy, cz = -b_ * (1 - math.cos(th)), a_ * math.sin(th)
        ty, tz_ = -b_ * math.sin(th), a_ * math.cos(th); ln = math.hypot(ty, tz_); ny, nz = -tz_ / ln, ty / ln   # 平面內、垂直於切線
        if ny * (cy + b_) + nz * cz < 0: ny, nz = -ny, -nz   # 朝外
        rings.append([c.bm.verts.new(g2b(r_ * math.sin(2 * math.pi * j / sv), cy + r_ * math.cos(2 * math.pi * j / sv) * ny, cz + r_ * math.cos(2 * math.pi * j / sv) * nz)) for j in range(sv)])
    for i in range(su):
        a, b = rings[i], rings[(i + 1) % su]
        for j in range(sv): c.bm.faces.new((a[j], a[(j + 1) % sv], b[(j + 1) % sv], b[j]))
    new = _new(c, n0); bmesh.ops.recalc_face_normals(c.bm, faces=new); c.paint(new, '#1f1e1d')
TUBE = Proto('innertube', tube_build, side='right')
ptb = Part('tube_pegs', side='right'); cm = ptb['vcm']; PEG_Y, PEG_R, TX = 3.1, 0.006, XI1 - 0.16   # 牆邊的樑底在 3.18（v1b 第一版 3.3 插進樑裡）
crb(cm, XI1 - 0.012, XI1, PEG_Y - 0.03, PEG_Y + 0.03, 1.05, 3.95, '#2c3a30', r=0.003)   # 牆上的掛條
N_TUBE = 0
for k in range(16):
    zt = 3.85 - k * 0.18
    ccyl(cm, (XI1 - 0.012, PEG_Y, zt), (TX - 0.05, PEG_Y, zt), PEG_R, '#2a2b2d', seg=4)
    TUBE.place(fm((TX, PEG_Y + PEG_R + 0.0095, zt), rot('X', 0.0))); N_TUBE += 1   # 內胎的頂端壓在掛釘上
ptb.done()
dc = IT['drawer_cab']; pdc = Part('drawer_cab', side='right'); c, g = pdc['vc'], pdc['goods']
dx0, dz0, dz1 = XI1 - dc['w'], dc['z'] - dc['d'] / 2, dc['z'] + dc['d'] / 2
crb(c, dx0, XI1, 0.0, dc['h'], dz0, dz1, '#4a5e4a', r=0.01)
for k in range(2): g.rect((dx0 - 0.002, dc['h'] / 2, dz0 + 0.35 + k * 0.7), (0, 0, 1), (0, 1, 0), 0.33, dc['h'] / 2 - 0.04, ATL['drawers'])
pdc.done()


def steel_shelf(name, x0, x1, z0, z1, face, hgt, side=None, levels=(0.1, 0.65, 1.2, 1.75, 2.3), seed=1):
    """深色角鋼鐵架（四根立柱、層板）＋紙箱、零件盒"""
    p = Part(name, side=side); cm, w_, g = p['vcm'], p['wood'], p['goods']; rr = random.Random(seed)
    for xx in (x0 + 0.02, x1 - 0.02):
        zz = z0
        while zz <= z1 + 1e-3:
            crb(cm, xx - 0.018, xx + 0.018, 0.0, hgt, zz - 0.018, zz + 0.018, '#2c3a30', r=0.002); zz += max(0.9, (z1 - z0) / 3)
    for y in levels:
        crb(cm, x0, x1, y - 0.025, y, z0, z1, '#3a4a3c', r=0.002)
        if y > hgt - 0.3: continue
        t = z0 + 0.03; top = min(0.5, hgt - y - 0.05)
        while t < z1 - 0.12:
            w2 = rr.uniform(0.22, 0.42); h2 = rr.uniform(0.15, top); d2 = min(x1 - x0 - 0.04, rr.uniform(0.28, 0.36)); nm = rr.choice(['kraft0', 'kraft1', 'kraft2', 'kraft3', 'kraft6', 'kraft7', 'pack0', 'pack2', 'pack4', 'pack6', 'pack7'])
            if t + w2 > z1 - 0.02: break
            xc = (x1 - d2 / 2 - 0.02) if face == '-x' else (x0 + d2 / 2 + 0.02)
            g.box(xc, y + h2 / 2, t + w2 / 2, d2, h2, w2, nm, front=face); t += w2 + rr.uniform(0.02, 0.06)
    p.done()


sb = IT['shelf_back_right']; steel_shelf('shelf_back_right', XI1 - sb['w'], XI1, sb['z'] - sb['d'] / 2, sb['z'] + sb['d'] / 2, '-x', sb['h'], side='right', seed=3)
sw = IT['shelf_ws_left']; steel_shelf('shelf_ws_left', sw['x'] - sw['w'] / 2, sw['x'] + sw['w'] / 2, sw['z'] - sw['d'] / 2, sw['z'] + sw['d'] / 2, '+x', sw['h'], seed=5)


def stand_build(pt):
    """藍色立式修車架：三腳底座、伸縮立柱、轉軸、夾頭、工具盤"""
    c, cm = pt['vc'], pt['vcm']; BL = '#1f4a8a'
    for k in range(3):
        a = 2 * math.pi * k / 3 + 0.3; ccyl(c, (0, 0.06, 0), (0.42 * math.cos(a), 0.02, 0.42 * math.sin(a)), 0.016, BL, seg=6)
        crb(c, 0.42 * math.cos(a) - 0.03, 0.42 * math.cos(a) + 0.03, 0.0, 0.025, 0.42 * math.sin(a) - 0.03, 0.42 * math.sin(a) + 0.03, '#1d1d1d', r=0.008)
    crb(c, -0.05, 0.05, 0.04, 0.12, -0.05, 0.05, BL, r=0.01)
    ccyl(c, (0, 0.1, 0), (0, 0.85, 0), 0.026, BL, seg=10); ccyl(cm, (0, 0.85, 0), (0, 1.12, 0), 0.02, '#c9ccce', seg=10)
    crb(c, -0.04, 0.04, 0.8, 0.88, -0.04, 0.04, '#1d1d1d', r=0.01); ccyl(c, (0.04, 0.84, 0), (0.12, 0.84, 0), 0.008, '#1d1d1d', seg=5)
    crb(c, -0.045, 0.045, 1.1, 1.2, -0.045, 0.045, BL, r=0.012)
    ccyl(c, (0, 1.16, 0), (0.25, 1.2, 0), 0.02, BL, seg=8)
    crb(c, 0.24, 0.32, 1.13, 1.27, -0.045, 0.045, '#1d1d1d', r=0.015)                                           # 夾頭
    # v1b：夾口改成左右兩片（往 ±x 夾；中間 x 0.329～0.361 夾座管，CLAMP）＋上下兩條連接（z ±0.04～0.05，座管從中間穿過）
    for (xa_, xb_) in ((0.316, 0.329), (0.361, 0.374)): crb(c, xa_, xb_, 1.15, 1.25, -0.05, 0.05, '#2a2b2d', r=0.004)
    for s_ in (-1, 1): crb(c, 0.316, 0.374, 1.17, 1.23, s_ * 0.045 - 0.006, s_ * 0.045 + 0.006, '#2a2b2d', r=0.003)
    # 快拆把手（紅）：v1 在夾頭上面（會頂到夾著的車的坐墊），v1b 移到夾頭後面、轉軸下方
    ccyl(c, (0.25, 1.15, 0), (0.17, 1.07, 0), 0.006, '#c8202a', seg=5); csph(c, (0.165, 1.065, 0), 0.016, '#c8202a', seg=6, rings=3)
    clathe(c, [(0.0, 0.0), (0.15, 0.0), (0.16, 0.025), (0.15, 0.03), (0.14, 0.012), (0.0, 0.012)], 0, 0.68, 0, BL, seg=14)   # 工具盤
    for k, col in enumerate(('#c8202a', '#e8e6e0', '#1d1d1d')): crb(c, -0.08 + k * 0.06, -0.05 + k * 0.06, 0.692, 0.71, -0.06, 0.06, col, r=0.004)


STAND = Proto('stand', stand_build)
STANDS = [i for i in ITL if i['kind'] == 'repair_stand']
for k, it in enumerate(STANDS): STAND.place(fm((it['x'], 0, it['z']), rot('Y', it.get('yaw', (2.6, 3.4)[k]))))
# v1b：AA_646「立式修車架上夾著一台車」（BB 11-04）：夾在 bike_repair 互動點旁那一支（layout repairBike.stand）；重用左展示台的淑女車網格（linked duplicate，不加材質、不帶車價卡）。
# 獨立節點 REPAIR_BIKE、預設關（extras.defaultVisible=false）：遊戲載入時藏起來，AA_646 那一幕再打開（BB 定案）。
RB = LAY['repairBike']; sti = STANDS[RB['stand']]; gr = BIKES[RB['model']]; sr_ = SPEC[RB['model']]
CLX, CLY = 0.345, 1.2   # 夾口中心（修車架自己的座標：轉軸往 +x、夾口 x 0.329～0.361、y 1.15～1.25）
stT = fm((sti['x'], 0, sti['z']), rot('Y', sti['yaw']))
sd_ = (-0.292, 0.956); top_y = gr['st'][1] + sd_[1] * sr_['post']
yb_ = gr['st'][1] + 0.055   # 夾在座管露出來那一段的下面（夾口下緣 0.005 以上是座管、不是車架）：坐墊離夾頭越遠越好
pb_x = gr['st'][0] + sd_[0] * (yb_ - gr['st'][1]) / sd_[1]
# 車的座標（x＝車頭、y＝上、z＝右手邊）→ 修車架的座標：車頭朝修車架的 −z、車的右手邊朝 +x（轉軸伸出去的方向）；車身平面和轉軸垂直
Rb = Matrix(((0, 0, 1), (0, 1, 0), (-1, 0, 0)))
tb = Vector((CLX, CLY, 0)) - Rb @ Vector((pb_x, yb_, 0))
TB = stT @ fm(tuple(tb), Rb)
rb_root = bpy.data.objects.new('REPAIR_BIKE', None); B.scene().collection.objects.link(rb_root); rb_root.parent = root
rb_root['defaultVisible'] = False; rb_root['show'] = 'AA_646 劇情'; rb_root['note'] = '修車架上夾著的車：遊戲載入時 visible=false，劇情時再打開'
RB_OBS = bike_clone(gr, 'repair_bike', TB, parent=rb_root)
RB_INFO = dict(stand=[sti['x'], sti['z']], model=RB['model'], lift=round(CLY - yb_, 3), saddle_bottom=round(CLY + (top_y + 0.03 - 0.035) - yb_, 3), clamp_head_top=1.27,
               wheel_bottom=round(CLY - yb_, 3))
pg = IT['pegboard']; ppg = Part('pegboard', side='back'); g, w_ = ppg['goods'], ppg['wood']
zw = ZI0 + 0.015
PEG_EXTRA = [(0.32, 0.72, 0.0, 0.26), (3.92, 4.3, 0.7, 0.96)]   # v1b（LAWWW2：工具牆補滿）：工作台左邊、工具車上面再各一片洞洞板（同一張貼圖的一段）
for (x0_, x1_, u0, u1) in [(pg['x'] - pg['w'] / 2, pg['x'] + 0.15, 0.0, 0.64), (pg['x'] + 0.25, pg['x'] + pg['w'] / 2, 0.36, 1.0)] + PEG_EXTRA:
    w_.rbox(x0_ - 0.03, x1_ + 0.03, pg['y'] - pg['h'] / 2 - 0.03, pg['y'] + pg['h'] / 2 + 0.03, ZI0, zw, r=0.004)
    g.rect(((x0_ + x1_) / 2, pg['y'], zw + 0.001), (1, 0, 0), (0, 1, 0), (x1_ - x0_) / 2, pg['h'] / 2, sub('pegboard', u0, 0.0, u1, 1.0))
w_.rbox(pg['x'] - pg['w'] / 2, pg['x'] + pg['w'] / 2, pg['y'] + pg['h'] / 2 + 0.12, pg['y'] + pg['h'] / 2 + 0.15, ZI0, ZI0 + 0.32, r=0.005)   # 上面一層板
t = pg['x'] - pg['w'] / 2 + 0.05; rr = random.Random(12)
while t < pg['x'] + pg['w'] / 2 - 0.3:
    w2 = rr.uniform(0.25, 0.4); h2 = rr.uniform(0.15, 0.3); g.box(t + w2 / 2, pg['y'] + pg['h'] / 2 + 0.15 + h2 / 2, ZI0 + 0.17, w2, h2, 0.28, rr.choice(['kraft0', 'kraft1', 'kraft3', 'pack3', 'pack5']), front='+z'); t += w2 + 0.04
ppg.done()
wbI = IT['workbench']; bx, bz, bw, bd2, bh = wbI['x'], wbI['z'], wbI['w'], wbI['d'], wbI['h']
xa, xb, za, zb = bx - bw / 2, bx + bw / 2, bz - bd2 / 2, bz + bd2 / 2
CK.ph_put('old_tyre', bx + bw / 2 + 0.25, 0.0, bz + 0.15, yaw=1.45, height=0.6, decimate=0.1)   # v2：工作台東端地上靠著一條舊外胎（Poly Haven 掃描）
pwb = Part('workbench'); w_, c, cm, g = pwb['wood'], pwb['vc'], pwb['vcm'], pwb['goods']
w_.rbox(xa, xb, bh - 0.05, bh, za, zb, r=0.008)
for x in (xa + 0.04, xb - 0.04):
    for zz in (za + 0.04, zb - 0.04): crb(cm, x - 0.022, x + 0.022, 0.0, bh - 0.05, zz - 0.022, zz + 0.022, '#3a4a3c', r=0.004)
crb(cm, xa, xb, 0.12, 0.145, za + 0.02, zb - 0.02, '#3a4a3c', r=0.003)
for k, (x_, col) in enumerate(((xa + 0.35, '#c8962e'), (xa + 0.85, '#c8962e'), (xa + 1.4, '#4f6a4a'), (xa + 1.95, '#c8962e'))):   # 收納箱（黃、綠）
    crb(c, x_ - 0.22, x_ + 0.22, 0.145, 0.42, za + 0.06, zb - 0.06, col, r=0.02, seg=2); crb(c, x_ - 0.08, x_ + 0.08, 0.34, 0.38, zb - 0.061, zb - 0.055, '#3a3a3a', r=0.004)
    if k == 1: crb(c, x_ - 0.22, x_ + 0.22, 0.42, 0.66, za + 0.06, zb - 0.06, '#c8962e', r=0.02, seg=2)
vx = xb - 0.35   # 虎鉗
crb(cm, vx - 0.08, vx + 0.08, bh, bh + 0.06, zb - 0.2, zb - 0.02, '#3a5a8a', r=0.01); crb(cm, vx - 0.07, vx + 0.07, bh + 0.06, bh + 0.14, zb - 0.06, zb - 0.02, '#3a5a8a', r=0.01)
crb(cm, vx - 0.07, vx + 0.07, bh + 0.06, bh + 0.14, zb - 0.2, zb - 0.15, '#3a5a8a', r=0.01); ccyl(cm, (vx, bh + 0.09, zb), (vx, bh + 0.09, zb + 0.15), 0.008, '#c9ccce', seg=5)
for k in range(5): crb(cm, xa + 0.3 + k * 0.14, xa + 0.4 + k * 0.14, bh, bh + 0.01, zb - 0.3, zb - 0.25 + 0.04 * (k % 2), '#a9adb0', r=0.003)   # 散在桌上的扳手
clathe(c, [(0.0, 0.0), (0.06, 0.0), (0.062, 0.025), (0.0, 0.027)], xa + 1.3, bh, zb - 0.2, '#2a2b2d', seg=12)   # 一卷膠帶
crb(c, xa + 1.6, xa + 1.78, bh, bh + 0.03, zb - 0.3, zb - 0.18, '#d8b42a', r=0.01); crb(c, xa + 1.62, xa + 1.76, bh + 0.03, bh + 0.035, zb - 0.28, zb - 0.2, '#2a2b2d', r=0.002)   # 手套
g.rect((xa + 0.9, pg['y'] + pg['h'] / 2 + 0.06, ZI0 + 0.017), (1, 0, 0), (0, 1, 0), 0.07, 0.07, ATL['note_patch'])   # 後牆：補胎的手寫紙條
pwb.done()
tc = IT['tool_chest']; ptc = Part('tool_chest', T=fm((tc['x'], 0, tc['z']), rot('Y', -0.25))); c, cm, g = ptc['vc'], ptc['vcm'], ptc['goods']
crb(c, -tc['w'] / 2, tc['w'] / 2, 0.1, tc['h'], -tc['d'] / 2, tc['d'] / 2, '#5d6266', r=0.012, seg=2)
g.rect((0, (0.1 + tc['h']) / 2, tc['d'] / 2 + 0.002), (1, 0, 0), (0, 1, 0), tc['w'] / 2 - 0.03, (tc['h'] - 0.1) / 2 - 0.03, ATL['toolchest'])
for sx_ in (-1, 1):
    for sz_ in (-1, 1): torus(c, 0.035, 0.018, '#1d1d1d', su=10, sv=4, ctr=(sx_ * (tc['w'] / 2 - 0.07), 0.055, sz_ * (tc['d'] / 2 - 0.07)))
ccyl(cm, (-tc['w'] / 2 - 0.04, tc['h'] - 0.1, -0.15), (-tc['w'] / 2 - 0.04, tc['h'] - 0.1, 0.15), 0.012, '#c9ccce', seg=6)
for (a, b) in ((-0.15, -0.15), (0.15, 0.15)): ccyl(cm, (-tc['w'] / 2 - 0.04, tc['h'] - 0.1, a), (-tc['w'] / 2, tc['h'] - 0.1, b), 0.01, '#c9ccce', seg=5)
crb(c, -tc['w'] / 2 + 0.05, tc['w'] / 2 - 0.05, tc['h'], tc['h'] + 0.02, -tc['d'] / 2 + 0.05, tc['d'] / 2 - 0.05, '#2a2b2d', r=0.005)
# v1b：工具車上面：托盤、三罐噴罐（潤滑油、清潔劑）、一盒零件、一支扳手
crb(cm, -0.3, 0.05, tc['h'] + 0.02, tc['h'] + 0.035, -0.2, 0.2, '#8d9196', r=0.004)
for k, col in enumerate(('#2f6fb8', '#c8202a', '#e0a030')): clathe(c, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.17), (0.02, 0.19), (0.008, 0.2), (0.0, 0.2)], -0.22 + k * 0.075, tc['h'] + 0.035, -0.08 + 0.05 * (k % 2), col, seg=10)
g.box(0.17, tc['h'] + 0.02 + 0.06, 0.02, 0.22, 0.12, 0.3, 'pack2', front='+z')
crb(cm, -0.08, 0.04, tc['h'] + 0.035, tc['h'] + 0.045, 0.08, 0.1, '#a9adb0', r=0.003)
ptc.done()
# 地上：一顆拆下來的輪子靠在工作台腳、紙箱
LOOSE = wheel_proto(0.34, 0.016, '#b9bcbf', 36, None)
LOOSE.place(fm((IT['loose_wheel']['x'] - 0.1, 0.35, IT['loose_wheel']['z']), rot('Y', math.pi / 2 + 0.12)))   # 拆下來的輪子靠在鐵架尾端
fbI = IT['floor_boxes']; fb_ = Part('floor_boxes'); fbx = fbI['x'] - 0.1   # v1b：往西 0.1（v1 的下面那箱插進右牆高層架的最下層板 x 4.35～4.45）
G_ = fb_['goods']
G_.box(fbx, 0.17, fbI['z'], 0.5, 0.34, 0.4, 'kraft2', front='-x'); G_.box(fbx + 0.03, 0.47, fbI['z'] - 0.03, 0.42, 0.26, 0.36, 'kraft6', front='-x')
# v1b（LAWWW2：紙箱補滿）：上面再一箱、旁邊一疊兩箱、左後角（拆下來的輪子後面）一疊三箱
BOXES_V1B = [(fbx + 0.02, 0.7, fbI['z'] - 0.02, 0.34, 0.2, 0.3, 'kraft4', '-x'),
             (fbI['x'] - 0.12, 0.2, fbI['z'] - 0.46, 0.46, 0.4, 0.42, 'kraft1', '-x'), (fbI['x'] - 0.12, 0.5, fbI['z'] - 0.48, 0.36, 0.2, 0.32, 'pack5', '-x')]
for (bx_, by_, bz_, bw_, bh_, bd_, nm_, fr_) in BOXES_V1B: G_.box(bx_, by_, bz_, bw_, bh_, bd_, nm_, front=fr_)
CB = LAY['cornerBoxes']
for (dx_, by_, dz_, bw_, bh_, bd_, nm_) in ((0.0, 0.2, 0.0, 0.52, 0.4, 0.44, 'kraft3'), (-0.02, 0.53, -0.02, 0.44, 0.26, 0.38, 'kraft0'), (0.0, 0.76, 0.02, 0.34, 0.2, 0.3, 'pack3')):
    G_.box(CB['x'] + dx_, by_, CB['z'] + dz_, bw_, bh_, bd_, nm_, front='+z')
N_BOX_V1B = len(BOXES_V1B) + 3
fb_.done()

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)
CK.drop_protos()
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or ob.name.startswith('S_ph_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
ss = None if os.environ.get('BK_NOSS') else L.single_side(root, keep=r'glass', nodup=r'bk_(plaster|wood|floor_tile|concrete|goods|sign|alpha)')
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出 EXT_mesh_gpu_instancing 的節點叫 bike_interior.N、沒有自訂屬性 → 遊戲的 /WALL_/ 認不到。
    改成網格的名字（WALL_left_…_inst），牆上的補 extras.dir（往室內的法線），掛在牆上的輪子、輪胎才會跟著那面牆淡出。"""
    import struct
    b = open(path, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]; k = 0
    for nd in j['nodes']:
        if 'EXT_mesh_gpu_instancing' not in nd.get('extensions', {}): continue
        mn = j['meshes'][nd['mesh']]['name']; nd['name'] = mn + '_inst'; k += 1
        m_ = re.match(r'WALL_(front|back|left|right)_', mn)
        if m_: nd.setdefault('extras', {})['dir'] = DIRS[m_.group(1)]
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out = out[:8] + struct.pack('<I', len(out)) + out[12:]; open(path, 'wb').write(out); print('instanced nodes renamed', k)


fix_instanced_names(OUT); info['bytes'] = os.path.getsize(OUT); info['out'] = os.path.relpath(OUT, REPO)
drawn = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in root.children_recursive if ob.type == 'MESH')
protos = {p.name: p.n for p in list(WHEELS.values()) + HEL + LOCK + PUMP + TIREP + [STAND, PEND, FIXP, TUBE]}
rb_tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in rb_root.children_recursive if ob.type == 'MESH')
info['v1b'] = {'repair_bike': dict(RB_INFO, node='REPAIR_BIKE', defaultVisible=False, tris=rb_tris), 'wall_vertical': VB_INFO,
               'right_low_boxes': N_LOW, 'right_low_tires': 4, 'inner_tubes': N_TUBE, 'pegboard_panels_added': len(PEG_EXTRA), 'boxes_added': N_BOX_V1B}
info.update({'shop': 'bike', 'layout': 2, 'drawn_tris': drawn, 'protos': protos,
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m})})
L.write_json(OUT[:-4] + '.json', info)
info['cc0'] = [list(u) for u in CK.used()]; L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', drawn, 'MATS', len(info['materials'])); print('CC0_USED', CK.used())
