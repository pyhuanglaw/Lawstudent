"""好拍運動（羽球、桌球、網球用品店；新生南路那一側）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-03 v2：照使用者的參考圖 haopai_int 重做（SCENE_RULES 第 12 節：參考圖就是規格）。
  python3 tools/blender/env_second/bb_support/haopai_tex.py            # 先畫貼圖（→ tools/blender/env_second/textures/gen/haopai_*）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/haopai_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
v1（9 × 16 m 的空倉庫）退回；v2 照騎樓開間：4.4 × 14 × 3.4 m。配置（家具位置、大小、座位、互動點、導航阻擋）只寫在 src/data/haopai_layout.js，這裡讀同一份。
座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。參考圖的鏡頭：layout 的 camRef（眼睛 (0.25,1.55,6.55)、24 mm、往店裡看）。
從店門往裡看（參考圖由左到右、由前到後）：
  左：玻璃展示櫃（膠皮、拍線、桌球盒）→ 木櫃台（羽球筒、桌球盒、螢幕、筆筒；掉漆）；左牆網格掛握把布、拍線、桌球盒，下層木板放籃子，上層木板放黃金葛，電視（羽球賽）。
  中：米色 30 cm 地磚走道、高腳木凳；z −0.95 的下垂樑掛招牌「好拍運動」（字畫在貼圖上）；後段倉庫：兩側鐵架紙箱到頂、布簾、立扇。
  右：整面鐵網格掛羽球拍（四排，頭朝上）、前段網球拍；穿線機（深藍）、工作桌（抽屜、毛巾、噴瓶）、小推車；後段鐵架正面的桌球拍洞洞板。
  天花板：前段輕鋼架 3.4 m＋兩排日光燈管、出風口；後段 2.6 m＋橫向燈管。
球拍、羽球筒是 instancing（同一個網格放很多個；右牆的叫 WALL_right_*，跟著右牆淡出）。沒有任何真實品牌（D77）。
尺寸（照真實）：羽球拍全長 0.70 m、拍框 0.236 × 0.196；網球拍 0.685 m；桌球拍 0.16 × 0.15＋握把 0.10；羽球筒 ø0.09 × 0.40；櫃台 1.0 m、高腳凳座面 0.72；穿線機轉盤 1.02 m。"""
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

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'haopai_layout.js')]))['haopai']
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'haopai_atlas.json')))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT      # 內面 x ±2.08、z ±6.88
IT = {i['kind']: i for i in LAY['items']}
SO = LAY['soffit']; SZ, SD, SY, HB = SO['z'], SO['depth'], SO['y'], SO['backCeil']   # 樑 z −0.95～−1.25、後段天花板 2.6
random.seed(620)
B.reset(texres=1024)
root = B.group('haopai_interior', props={'kind': 'haopai_interior', 'w': W, 'd': D, 'h': H, 'layout': 2})
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


P = 'hp_'
# 11 個材質：地磚（自製）、牆、天花板、木頭（Poly Haven CC0）＋頂點色（霧面、金屬）＋玻璃＋透明圖集、印刷圖集、會亮的、招牌
M = {
    'floor': img_mat(P + 'floor_tile', 'haopai_floor.png', rough=0.38, tile=1.2),
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#c8bfaa', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'ceil': L.pbr(P + 'ceiling', 'ceiling_interior', tile=0.6, target='#c4b8a2', maps=('diff',), res=512, rough_value=0.92, cull=True),
    'wood': L.pbr(P + 'wood', 'fine_grained_wood', tile=0.9, target='#94714b', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.55),
    'vc': L.vc_material(P + 'vc', rough=0.62), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.4, metal=0.35),
    'glass': L.flat(P + 'glass', '#d4e2e0', rough=0.05, alpha=0.14),
    'emit': img_mat(P + 'emit', 'haopai_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha', 'haopai_alpha.png', rough=0.5, clip=True, metal=0.15),
    'goods': img_mat(P + 'goods', 'haopai_goods.png', rough=0.55),
    'sign': img_mat(P + 'sign', 'haopai_sign.png', rough=0.6),
}
# CC0 化（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；第③群幫手 2026-11-13）：工具 cc0_kit.py（tz_shops_interior.py 同一套）。
#   球拍框、羽球筒、桌球拍（instancing 的原型）：ambientCG Plastic006 × 每一支自己的顏色（vc_tex：頂點色乘上材質組的細紋、法線）；
#   地上剛到的兩箱貨、後段鐵架上的紙箱：Poly Haven cardboard_box_01；鐵網桶、鐵件：ambientCG Metal009。
sys.path.insert(0, HERE)
import cc0_kit   # noqa: E402
K = cc0_kit.Kit(root, P)
M['vct'] = K.vc_tex(P + 'vc_plastic', 'Plastic006', vary=0.05, tile=0.25, rough_value=0.45)
VCT_PARTS = re.compile(r'^(bad\d+|badf\d+|ten\d+|tube_[ab]|tt_[rb]b)_0$')   # 這些原型的頂點色零件改用 vct
G3 = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))   # 遊戲 → Blender 的旋轉


def rot(axis, a): return Matrix.Rotation(a, 3, axis)   # 遊戲座標的軸（Y＝往上；+a 從 +z 轉向 +x）


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

    def tube(self, x, z, y0, y1, r, cell, seg=10):
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


UVK = ('goods', 'alpha', 'emit', 'sign')


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組"""
    def __init__(self, name, side=None, T=None, smooth=True): self.name, self.side, self.T, self.smooth, self.m = name, side, T, smooth, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = (f'WALL_{self.side}_' if self.side else P) + f'{self.name}_{key}'
            if key == 'vc' and VCT_PARTS.match(self.name): self.m[key] = L.CMesh(nm, M['vct']); self.m[key].vct = True
            else: self.m[key] = L.CMesh(nm, M[key]) if key in ('vc', 'vcm') else (UM(nm, M[key]) if key in UVK else Mesh(nm, M[key]))
        return self.m[key]

    def done(self):
        obs = []
        for key, m in self.m.items():
            if isinstance(m, UM): ob = m.finish(root)
            elif isinstance(m, L.CMesh): ob = m.finish(root, uv=getattr(m, 'vct', False))
            else: ob = m.finish(root, uv=True)
            if ob is None: continue
            if self.T is not None: ob.matrix_basis = self.T
            if self.side: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign', 'goods', 'alpha', 'emit'): L.smooth_mesh(ob, angle=0.6)
            obs.append(ob)
        self.m = {}; return obs


def inst(obs, name, T, side=None):
    """instancing：再放一份（共用同一個網格）"""
    out = []
    for ob in obs:
        key = ob.name.rsplit('_', 1)[-1]
        no = bpy.data.objects.new((f'WALL_{side}_' if side else P) + f'{name}_{key}', ob.data); B.scene().collection.objects.link(no); no.parent = root
        no.matrix_basis = T
        if side: no['dir'] = DIRS[side]
        out.append(no)
    return out


class Proto:
    """原型：第一次 place 時建網格，之後共用"""
    def __init__(self, name, build, side=None): self.name, self.build, self.side, self.obs, self.n = name, build, side, None, 0

    def place(self, T):
        self.n += 1
        if self.obs is None:
            pt = Part(f'{self.name}_0', side=self.side, T=T); self.build(pt); self.obs = pt.done(); return
        inst(self.obs, f'{self.name}_{self.n}', T, self.side)


# ---------------- 頂點色的小工具 ----------------
class _N0:
    """「這之後新加的面」：記住當時有哪些面（bmesh 的面順序不保證新面在最後：create_cone 之後用 index 取，會塗到別的零件——v2 第一版的球拍中管變白）"""
    def __init__(self, c): self.before = set(c.bm.faces)


def _new(c, n0): return [f for f in c.bm.faces if f not in n0.before]


def ccyl(c, a, b, r, col, seg=8, r2=None, caps=True):
    n0 = _N0(c); c.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return c.paint(_new(c, n0), col)


def clathe(c, prof, x, y, z, col, seg=16, R=None):
    n0 = _N0(c); bm = L.lathe(prof, seg=seg); c.add_bm(bm, fm((x, y, z), R)); bm.free(); return c.paint(_new(c, n0), col)


def crb(c, x0, x1, y0, y1, z0, z1, col, r=0.01, seg=1):
    if r <= 0.0005: return c.cbox(x0, x1, y0, y1, z0, z1, col)
    return c.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)


def csph(c, ctr, r, col, seg=8, rings=5, sy=1.0):
    n0 = _N0(c); c.sphere(ctr, r, seg=seg, rings=rings, sy=sy); return c.paint(_new(c, n0), col)


def jit(hexcol, k=0.06):
    f = 1 + random.uniform(-k, k); return '#' + ''.join(f'{min(255, max(0, int(int(hexcol[i:i + 2], 16) * f))):02x}' for i in (1, 3, 5))


def sub(cellname, a0, b0, a1, b1):
    """一格裡的一部分（比例 0～1，左下原點）"""
    u0, v0, u1, v1 = ATL[cellname]; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


# ======================================================================
# 球拍原型（自己的座標：拍面在 y-z 平面、正面朝 +x；握把底在原點、拍頭往 +y）
# ======================================================================
def bad_build(k, grip):
    def f(pt):
        c = pt['vc']
        ccyl(c, (0, 0.0, 0), (0, 0.2, 0), 0.0135, grip, seg=6)                      # 握把（纏握把布；v2b 拿掉尾蓋省三角形，給更多拍子）
        ccyl(c, (0, 0.198, 0), (0, 0.43, 0), 0.0036, '#26272a', seg=3)             # 中管
        pt['alpha'].rect((0.0, 0.5585, 0.0), (0, 0, -1), (0, 1, 0), 0.11, 0.1465, ATL[f'head{k}'])   # 拍頭（框＋線＋拍喉）
    return f


def frame_ring(c, cy, ay, az, rr, tx, col, n):
    n0 = _N0(c); rings = []
    for i in range(n):
        t = 2 * math.pi * i / n; y = cy + ay * math.sin(t); z = az * math.cos(t)
        ny, nz = math.sin(t) / ay, math.cos(t) / az; l = math.hypot(ny, nz); ny, nz = ny / l, nz / l
        pts = [(-tx, y - ny * rr, z - nz * rr), (tx, y - ny * rr, z - nz * rr), (tx, y + ny * rr, z + nz * rr), (-tx, y + ny * rr, z + nz * rr)]
        rings.append([c.bm.verts.new(g2b(*p)) for p in pts])
    for i in range(n):
        a, b = rings[i], rings[(i + 1) % n]
        for k in range(4): c.bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
    new = _new(c, n0); bmesh.ops.recalc_face_normals(c.bm, faces=new); return c.paint(new, col)


def tennis_build(frame, grip, accent):
    def f(pt):
        c = pt['vc']; cy, ay, az, n = 0.515, 0.162, 0.127, 12
        frame_ring(c, cy, ay, az, 0.009, 0.011, frame, n)
        yb = cy - ay * math.sqrt(1 - (0.082 / az) ** 2)
        for s in (-1, 1): ccyl(c, (0, 0.226, s * 0.012), (0, yb + 0.004, s * 0.082), 0.009, accent, seg=5)
        ccyl(c, (0, 0.19, 0), (0, 0.232, 0), 0.0155, frame, seg=6, r2=0.012)
        ccyl(c, (0, 0.013, 0), (0, 0.192, 0), 0.0168, grip, seg=8)
        ccyl(c, (0, 0.0, 0), (0, 0.014, 0), 0.018, '#1e1e20', seg=8)
        u0, v0, u1, v1 = ATL['ten_str']; pts, uvs = [], []
        for i in range(n):
            t = 2 * math.pi * i / n; pts.append((0.0, cy + (ay - 0.008) * math.sin(t), (az - 0.008) * math.cos(t)))
            uvs.append((u0 + (u1 - u0) * (0.5 + 0.5 * math.cos(t)), v0 + (v1 - v0) * (0.5 + 0.5 * math.sin(t))))
        pt['alpha'].face(pts, uvs); pt['alpha'].face(list(reversed(pts)), list(reversed(uvs)))
    return f


def tt_build(face_a, face_b):
    """桌球拍（拍面朝 ±x、握把往 −y，拍面中心在 (0,0.18,0)）"""
    def f(pt):
        c = pt['vc']; cy, ay, az, n = 0.18, 0.079, 0.075, 12
        ring = [(cy + ay * math.sin(2 * math.pi * i / n) * (1.0 if math.sin(2 * math.pi * i / n) > 0 else 0.94), az * math.cos(2 * math.pi * i / n)) for i in range(n)]
        for xs, col in ((0.0058, face_a), (-0.0058, face_b)):
            vs = [c.bm.verts.new(g2b(xs, y, z)) for y, z in ring]; fc = c.bm.faces.new(vs if xs > 0 else list(reversed(vs))); c.paint([fc], col)
        n0 = _N0(c); top = [c.bm.verts.new(g2b(0.0058, y, z)) for y, z in ring]; bot = [c.bm.verts.new(g2b(-0.0058, y, z)) for y, z in ring]
        for i in range(n): j = (i + 1) % n; c.bm.faces.new((top[i], top[j], bot[j], bot[i]))
        c.paint(_new(c, n0), '#c39a68')
        crb(c, -0.012, 0.012, 0.0, 0.105, -0.0135, 0.0135, '#b98756', r=0.006)
        crb(c, -0.0128, 0.0128, 0.085, 0.112, -0.016, 0.016, '#7a1f22', r=0.004)
    return f


def tube_build(cell, cap):
    def f(pt):
        pt['goods'].tube(0, 0, 0.0, 0.4, 0.044, cell, seg=10)
        clathe(pt['vc'], [(0, 0), (0.046, 0), (0.046, 0.022), (0.0, 0.025)], 0, 0.4, 0, cap, seg=10)
        clathe(pt['vc'], [(0, -0.003), (0.045, -0.003), (0.045, 0.004), (0.0, 0.004)], 0, 0.0, 0, '#d8d4c8', seg=10)
    return f


GRIPS = ['#f2f0ea', '#1e1e20', '#1e1e20', '#f0d23a', '#1e1e20', '#f2f0ea', '#2f6fb8', '#1e1e20']
BAD = [Proto(f'bad{k:02d}{g}', bad_build(k, GRIPS[(k * 3 + g * 5) % len(GRIPS)]), side='right') for k in range(12) for g in range(2)]   # v2b：12 色框 × 2 種握把
BAD_FREE = [Proto(f'badf{k}', bad_build(k, GRIPS[k % len(GRIPS)])) for k in range(3)]
TEN = [Proto(f'ten{i}', tennis_build(*c), side='right') for i, c in enumerate((('#1d1d21', '#f2f0ea', '#e6d020'), ('#c8202a', '#1e1e20', '#e8e6e0'), ('#e6d020', '#1e1e20', '#1d1d21'),
                                                                              ('#2048a8', '#f2f0ea', '#e8e6e0'), ('#e8e6e0', '#d2303a', '#c8202a')))]
TUBE = [Proto('tube_a', tube_build('tube_a', '#1f2f5e')), Proto('tube_b', tube_build('tube_b', '#2f5f3a'))]
TO_MX = rot('Y', math.pi)   # 原型正面 +x → 朝 −x（右牆，往室內）

# ======================================================================
# 房間：地、天花板（前段 3.4、後段 2.6）、牆（淡出的組）、樑＋招牌
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
ce = Part('ceiling', smooth=False)
ce['ceil'].quad([(XI0, H, SZ), (XI1, H, SZ), (XI1, H, ZI1), (XI0, H, ZI1)])
ce['ceil'].quad([(XI0, HB, ZI0), (XI1, HB, ZI0), (XI1, HB, SZ - SD), (XI0, HB, SZ - SD)]); ce.done()
tb = Part('tbar', smooth=False)   # 輕鋼架（60 cm 方格）：只做朝下的一片（鏡頭在天花板上面的遊戲視角看不到，和天花板一樣是剖面）
for y_, za, zb in ((H, SZ, ZI1), (HB, ZI0, SZ - SD)):
    for k in range(1, 7):
        x = XI0 + k * 0.6
        if x < XI1 - 0.05: tb['ceil'].quad([(x - 0.012, y_ - 0.004, za), (x + 0.012, y_ - 0.004, za), (x + 0.012, y_ - 0.004, zb), (x - 0.012, y_ - 0.004, zb)])
    z = ZI1 - 0.6
    while z > za + 0.05: tb['ceil'].quad([(XI0, y_ - 0.004, z - 0.012), (XI1, y_ - 0.004, z - 0.012), (XI1, y_ - 0.004, z + 0.012), (XI0, y_ - 0.004, z + 0.012)]); z -= 0.6
tb.done()
for side in ('left', 'right', 'back'):
    p = Part('wall', side=side, smooth=False)
    if side == 'left': p['wall'].box(X0, XI0, 0, H, Z0, Z1); p['vc'].cbox(XI0, XI0 + 0.015, 0, 0.1, ZI0, ZI1, '#6e6250')
    elif side == 'right': p['wall'].box(XI1, X1, 0, H, Z0, Z1); p['vc'].cbox(XI1 - 0.015, XI1, 0, 0.1, ZI0, ZI1, '#6e6250')
    else: p['wall'].box(X0, X1, 0, H, Z0, ZI0); p['vc'].cbox(XI0, XI1, 0, 0.1, ZI0, ZI0 + 0.015, '#6e6250')
    p.done()
# 牆腳的髒（踢腳板上緣一條暗的、壓條走線）
dt = Part('wall_dirt', side='right'); dt['vc'].cbox(XI1 - 0.004, XI1, 0.1, 0.16, ZI0, ZI1, '#a49478'); dt.done()
cw = Part('wire_duct', side='left')                                                         # 白色壓條（電線沿牆往上到電視）
crb(cw['vc'], XI0, XI0 + 0.015, 0.1, 2.4, 2.2, 2.24, '#e8e3d6', r=0.003); crb(cw['vc'], XI0, XI0 + 0.015, 0.1, 0.13, 2.24, 6.6, '#e8e3d6', r=0.003); cw.done()

# 店面：門、落地窗
fr = LAY['front']; dx, dw = fr['door']['x'], fr['door']['w']; sill, head, dh = fr['sill'], fr['head'], 2.25
pf = Part('front', side='front', smooth=False)
ops = sorted([(a, b, 'win') for a, b in fr['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')])
ALU = '#a9adb0'
for a, b, k in ops:
    top = dh if k == 'door' else head; y0 = 0.0 if k == 'door' else sill
    pf['wall'].box(a, b, top, H, ZI1, Z1)
    if k == 'win': pf['wall'].box(a, b, 0.0, sill, ZI1, Z1); crb(pf['vcm'], a, b, sill - 0.01, sill + 0.035, ZI1 - 0.05, Z1 - 0.02, ALU, r=0.006)
    crb(pf['vcm'], a, b, top - 0.05, top, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    nseg = 2 if k == 'door' else 1
    for j in range(nseg + 1):
        x = a + j * (b - a) / nseg; crb(pf['vcm'], x - 0.03, x + 0.03, y0, top, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    pf['glass'].quad([(b, y0 + 0.02, Z1 - 0.07), (a, y0 + 0.02, Z1 - 0.07), (a, top - 0.03, Z1 - 0.07), (b, top - 0.03, Z1 - 0.07)])
    if k == 'door':
        for s in (-1, 1):
            hx_ = dx + s * 0.09; ccyl(pf['vcm'], (hx_, 0.85, ZI1 - 0.08), (hx_, 1.35, ZI1 - 0.08), 0.012, '#c9ccce', seg=8)
            for yy in (0.88, 1.32): ccyl(pf['vcm'], (hx_, yy, ZI1 - 0.08), (hx_, yy, ZI1 - 0.04), 0.008, '#c9ccce', seg=6)
pf['goods'].rect((0.42, 1.45, ZI1 - 0.075), (-1, 0, 0), (0, 1, 0), 0.09, 0.09, ATL['note_hours'])   # 門上的營業時間紙條（朝店內是背面：貼在玻璃上）
pf.done()
mat_ = Part('doormat'); crb(mat_['vc'], dx - 0.6, dx + 0.6, 0.0, 0.012, ZI1 - 0.75, ZI1 - 0.1, '#4f4a44', r=0.005); mat_.done()

# 下垂的樑＋招牌（米白底、深藍字、紅弧線：haopai_sign.png）
so = Part('soffit', smooth=False); so['wall'].box(XI0, XI1, SY, H, SZ - SD, SZ); so['vc'].cbox(XI0, XI1, SY - 0.02, SY, SZ - SD - 0.01, SZ + 0.01, '#8a7a62')
sx0, sx1 = IT['soffit_sign']['x'] - IT['soffit_sign']['w'] / 2, IT['soffit_sign']['x'] + IT['soffit_sign']['w'] / 2
crb(so['vc'], sx0 - 0.04, sx1 + 0.04, 2.62, 3.38, SZ, SZ + 0.03, '#7a6448', r=0.008)                  # 招牌的框
so['sign'].rect(((sx0 + sx1) / 2, 3.0, SZ + 0.032), (1, 0, 0), (0, 1, 0), (sx1 - sx0) / 2, 0.34, (0, 0, 1, 1))
so.done()

# 日光燈（前段沿 z 兩排、後段橫向）＋夜間光暈
tu = ATL['tube']; tuv = ((tu[0] + tu[2]) / 2, (tu[1] + tu[3]) / 2)
FIX = [(x, z, 'z', H) for x in (-0.82, 0.98) for z in (5.4, 3.6, 1.8, 0.0)] + [(-0.1, z, 'x', HB) for z in (-2.4, -4.3, -6.1)]
FIXP = Proto('fixture', None)


def fixture_build(pt):
    cm, u = pt['vcm'], pt['emit']
    crb(cm, -0.09, 0.09, -0.055, -0.012, -0.64, 0.64, '#e6e4de', r=0.01)
    for s in (-0.045, 0.045):
        for zz in (-0.61, 0.61): crb(cm, s - 0.016, s + 0.016, -0.09, -0.055, zz - 0.02, zz + 0.02, '#d2d0ca', r=0.004)
        for k in range(8):
            a0, a1 = 2 * math.pi * k / 8, 2 * math.pi * (k + 1) / 8; rr = 0.013; yc = -0.075
            u.face([(s + rr * math.cos(a0), yc + rr * math.sin(a0), -0.6), (s + rr * math.cos(a1), yc + rr * math.sin(a1), -0.6),
                    (s + rr * math.cos(a1), yc + rr * math.sin(a1), 0.6), (s + rr * math.cos(a0), yc + rr * math.sin(a0), 0.6)], [tuv] * 4, smooth=True)


FIXP.build = fixture_build
for x, z, ax, yc in FIX:
    FIXP.place(fm((x, yc, z), rot('Y', math.pi / 2) if ax == 'x' else None))
    CL.glow(root, 'tube', x, yc - 0.12, z, color='rgba(255,246,228,1)', size=1.8, day=0.35, night=1.0)
ac = Part('aircon')                                                                           # 出風口（下面一圈灰）
crb(ac['vcm'], -0.3, 0.25, H - 0.03, H - 0.001, 0.95, 1.45, '#d8d4ca', r=0.008)
for k in range(8): ac['vc'].cbox(-0.26 + k * 0.064, -0.23 + k * 0.064, H - 0.036, H - 0.03, 1.0, 1.4, '#7f7a70')
ac['vc'].cbox(-0.36, 0.31, H - 0.0012, H - 0.0006, 0.89, 1.51, '#a39a88')
ac.done()


# ======================================================================
# 牆上的鐵網格（透明貼圖：每 0.5 m 一片，邊緣一圈鐵管、固定支架）
# ======================================================================
def wall_grid(side, z0, z1, y0, y1):
    p = Part('grid', side=side); u = p['alpha']; g = ATL['grid']; x = XI1 - 0.035 if side == 'right' else XI0 + 0.035
    z = z0
    while z < z1 - 1e-4:
        zz = min(z + 0.5, z1); y = y0
        while y < y1 - 1e-4:
            yy = min(y + 0.5, y1); fu = (zz - z) / 0.5; fv = (yy - y) / 0.5
            uv = [(g[0], g[1]), (g[0] + (g[2] - g[0]) * fu, g[1]), (g[0] + (g[2] - g[0]) * fu, g[1] + (g[3] - g[1]) * fv), (g[0], g[1] + (g[3] - g[1]) * fv)]
            pts = [(x, y, z), (x, y, zz), (x, yy, zz), (x, yy, z)]
            u.face(pts if side == 'left' else list(reversed(pts)), uv if side == 'left' else list(reversed(uv))); y = yy
        z = zz
    c = p['vcm']; col = '#7f8388'
    for (a, b) in (((x, y0, z0), (x, y0, z1)), ((x, y1, z0), (x, y1, z1)), ((x, y0, z0), (x, y1, z0)), ((x, y0, z1), (x, y1, z1))): ccyl(c, a, b, 0.006, col, seg=5)
    zz = z0 + 0.25
    while zz < z1:
        for yy in (y0 + 0.1, y1 - 0.1):
            xw = XI1 if side == 'right' else XI0; ccyl(c, (xw, yy, zz), (x, yy, zz), 0.007, '#6f7377', seg=5)
        zz += 1.6
    p.done()


# ---------------- 右牆：球拍牆（羽球拍四排、前段網球拍） ----------------
RZ0, RZ1 = -1.25, 6.62
def peg_wall(z0, z1, y0, y1):
    """v2b：右牆整面洞洞板（灰褐色烤漆纖維板，每 0.5 m 一片、木條收邊）——取代網格＋白牆（LAWWW2：「牆面換成洞洞板，不要白磁磚」）"""
    p = Part('pegwall', side='right'); u = p['alpha']; g = ATL['peg']; x = XI1 - 0.01
    z = z0
    while z < z1 - 1e-4:
        zz = min(z + 0.5, z1); y = y0
        while y < y1 - 1e-4:
            yy = min(y + 0.5, y1); fu = (zz - z) / 0.5; fv = (yy - y) / 0.5
            uv = [(g[0], g[1]), (g[0] + (g[2] - g[0]) * fu, g[1]), (g[0] + (g[2] - g[0]) * fu, g[1] + (g[3] - g[1]) * fv), (g[0], g[1] + (g[3] - g[1]) * fv)]
            u.face(list(reversed([(x, y, z), (x, y, zz), (x, yy, zz), (x, yy, z)])), list(reversed(uv))); y = yy
        z = zz
    for (b0, b1) in ((y0 - 0.04, y0), (y1, y1 + 0.03)): p['wood'].rbox(x - 0.015, XI1, b0, b1, z0, z1, r=0.004)
    for zc in (z0, z1): p['wood'].rbox(x - 0.015, XI1, y0, y1, zc - 0.02, zc + 0.02, r=0.004)
    p.done()


peg_wall(RZ0, RZ1, 0.35, H - 0.04)
hooks = Part('hooks', side='right')
XR = XI1 - 0.035


def hook(y, z, L_=0.08):
    ccyl(hooks['vcm'], (XI1 - 0.01, y, z), (XR - L_, y + 0.01, z), 0.0026, '#9ba0a4', seg=3)   # 插在洞洞板上的掛勾


n_b = 0
ROWS = [(2.6, 6.55, -0.85), (1.84, 6.55, -0.85), (1.08, 2.15, RZ0 + 0.05), (0.36, 1.35, RZ0 + 0.05), (1.22, 4.6, 3.45)]   # (握把底, z 起, z 止)
for ri, (yb, za, zb) in enumerate(ROWS):
    z = za - (0.045 if ri % 2 else 0.0)
    while z >= zb:
        pr = BAD[(n_b * 7 + ri * 3 + int(z * 11)) % len(BAD)]
        sw = 0.6 + random.uniform(-0.12, 0.12)                                               # 掛勾上的拍子會轉：拍面朝店門轉 30～40°（參考圖：從門口看得到拍面）
        xo = XR - 0.012 - 0.11 * math.sin(sw) - (0.012 if n_b % 2 else 0.0)
        R_ = rot('Y', sw) @ TO_MX @ rot('X', random.uniform(-0.05, 0.05))
        pr.place(fm((xo, yb + random.uniform(-0.015, 0.015), z), R_)); hook(yb + 0.42, z)
        n_b += 1; z -= 0.062   # v2b：0.082 → 0.062（參考圖幾乎看不到牆）
n_t = 0
for za, zb in ((6.5, 4.7), (3.35, 2.25)):                                                   # 網球拍（第三排的前段，參考圖右前）
    z = za
    while z >= zb:
        TEN[n_t % len(TEN)].place(fm((XR - 0.04 - (0.018 if n_t % 2 else 0), 1.1, z), TO_MX @ rot('X', random.uniform(-0.04, 0.04)))); hook(1.1 + 0.24, z, 0.1)
        n_t += 1; z -= 0.2
# 價目卡（夾在每排球拍底下的網格上）、手寫紙條
for i, (y, z) in enumerate(((2.56, 6.1), (2.56, 4.3), (2.56, 2.2), (2.56, 0.3), (1.8, 5.4), (1.8, 3.1), (1.8, 1.0), (1.8, -0.6), (1.04, 0.8), (1.04, -0.4))):
    hooks['goods'].rect((XR - 0.012, y, z), (0, 0, 1), (0, 1, 0), 0.05, 0.034, ATL[f'tag{i % 6}'])
for nm, y, z, s in (('note_sale', 2.3, 5.0, 0.11), ('note_swing', 1.6, 2.7, 0.1), ('note_tennis', 0.9, 5.6, 0.1), ('note_string', 0.98, 3.95, 0.12)):
    hooks['goods'].rect((XR - 0.014, y, z), (0, 0, 1), (0, 1, 0), s, s, ATL[nm])
hooks.done()


# ---------------- 穿線機（深藍：轉盤沿 x，拉線頭在靠牆那一端） ----------------
st = IT['stringer']; sx, sz = st['x'], st['z']
NAVY, NAVY2, GREYM, LG = '#25335a', '#34467a', '#8d9196', '#c9ccd0'
ST_T = fm((sx, 0, sz), rot('Y', st['ry']))   # 自己的 +z（拉線頭）→ 朝 +x（牆）、稍微朝店門
ps = Part('stringer', T=ST_T); c, cm = ps['vc'], ps['vcm']
clathe(c, [(0.0, 0.0), (0.31, 0.0), (0.32, 0.015), (0.29, 0.045), (0.12, 0.075), (0.09, 0.1), (0.0, 0.1)], 0, 0, 0, NAVY, seg=20)
for k in range(4): a = math.pi / 4 + k * math.pi / 2; clathe(cm, [(0, 0), (0.022, 0), (0.022, 0.012), (0, 0.012)], 0.28 * math.cos(a), -0.008, 0.28 * math.sin(a), '#3a3c40', seg=8)
clathe(c, [(0.06, 0.0), (0.06, 0.8), (0.072, 0.82), (0.072, 0.86), (0.0, 0.86)], 0, 0.1, 0, NAVY, seg=14)
clathe(cm, [(0.0, 0.0), (0.09, 0.0), (0.095, 0.02), (0.08, 0.05), (0.0, 0.05)], 0, 0.96, 0, GREYM, seg=16)
crb(c, -0.05, 0.05, 1.0, 1.045, -0.44, 0.44, NAVY2, r=0.012)
for s in (-1, 1):
    crb(c, -0.16, 0.16, 1.005, 1.035, s * 0.14 - 0.025, s * 0.14 + 0.025, NAVY2, r=0.008)
    for xx in (-0.14, 0.14): ccyl(cm, (xx, 1.035, s * 0.14), (xx, 1.09, s * 0.14), 0.011, GREYM, seg=6)
    ccyl(cm, (0, 1.045, s * 0.4), (0, 1.1, s * 0.4), 0.016, GREYM, seg=8)
    crb(cm, -0.02, 0.02, 1.095, 1.125, s * 0.4 - 0.025, s * 0.4 + 0.025, '#5e6266', r=0.004)
    crb(cm, -0.05, 0.05, 1.12, 1.15, s * 0.05 - 0.03, s * 0.05 + 0.03, '#6f7377', r=0.006); ccyl(cm, (0, 1.15, s * 0.05), (0, 1.2, s * 0.05), 0.006, '#a0a4a8', seg=6)
    crb(c, -0.012, 0.012, 1.195, 1.215, s * 0.05 - 0.012, s * 0.05 + 0.012, '#c8202a', r=0.005)
crb(c, -0.06, 0.06, 0.88, 0.93, 0.38, 0.74, NAVY, r=0.015)                                    # 拉線頭的軌道
ccyl(cm, (0, 0.62, 0.0), (0, 0.9, 0.55), 0.025, NAVY, seg=8)
crb(c, -0.2, 0.2, 0.93, 1.16, 0.42, 0.8, '#59607a', r=0.03, seg=2)                          # 拉線頭本體（深灰藍）
crb(c, -0.12, 0.12, 0.62, 0.93, 0.55, 0.75, NAVY, r=0.02, seg=1)                               # 拉線頭下面的箱體
crb(c, -0.205, -0.1, 1.1, 1.22, 0.45, 0.76, '#8a91a8', r=0.02, seg=2)                          # 控制面板（朝操作的人）
for j in range(3):
    for k in range(4): c.cbox(-0.209, -0.203, 1.135 + j * 0.022, 1.151 + j * 0.022, 0.48 + k * 0.03, 0.5 + k * 0.03, '#e8e8e4' if (j + k) % 3 else '#d23a3a')
ps['emit'].rect((-0.21, 1.19, 0.7), (0, 0, -1), (0, 1, 0), 0.04, 0.015, ATL['lcd'])
ccyl(cm, (0, 1.1, 0.42), (0, 1.1, 0.32), 0.016, GREYM, seg=8); crb(cm, -0.02, 0.02, 1.085, 1.115, 0.28, 0.32, '#4a4d52', r=0.004)
clathe(c, [(0.0, 0.0), (0.14, 0.0), (0.15, 0.02), (0.15, 0.035), (0.13, 0.035), (0.13, 0.02), (0.0, 0.02)], 0, 0.72, 0, NAVY, seg=16)   # 工具盤
for k, col in enumerate(('#c8202a', '#1d1d21', '#e2cc1e')): crb(c, -0.1 + k * 0.05, -0.07 + k * 0.05, 0.74, 0.755, -0.06, 0.06, col, r=0.004)
clathe(c, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.17), (0.03, 0.18), (0.0, 0.18)], 0.07, 0.74, 0.07, '#7a8a96', seg=10)   # 保溫杯
for s, yy in ((0.16, 0.5),):                                                                  # 線軸（立柱側邊的軸上）
    ccyl(cm, (0.05, yy, 0.05), (0.22, yy, 0.05), 0.01, GREYM, seg=6)
    clathe(c, [(0.012, -0.05), (0.07, -0.05), (0.07, -0.042), (0.045, -0.04), (0.045, 0.04), (0.07, 0.042), (0.07, 0.05), (0.012, 0.05)], 0.18, yy, 0.05, '#1d1d21', seg=14, R=rot('Z', math.pi / 2))
    clathe(c, [(0.046, -0.039), (0.063, -0.037), (0.064, 0.0), (0.063, 0.037), (0.046, 0.039)], 0.18, yy, 0.05, '#f2f0ea', seg=14, R=rot('Z', math.pi / 2))
pts = [(0.18, 0.56, 0.05), (0.1, 0.85, 0.12), (0.04, 1.1, 0.2), (0.0, 1.21, 0.1)]
for a, b in zip(pts, pts[1:]): ccyl(c, a, b, 0.0012, '#f2f0ea', seg=3)
ps.done()
# 轉盤上夾著穿到一半的羽球拍（平放：拍頭往走道）
RK = Matrix(((0, 0, -1), (1, 0, 0), (0, -1, 0)))   # 原型 x→上、y→自己的 −z、z→自己的 −x
BAD_FREE[0].place(ST_T @ fm((0, 1.215, 0.35), RK))
cut = Part('string_bits')                                                                   # 地上剪下來的線頭
for k in range(6):
    p0 = (sx - 0.5 + random.uniform(-0.3, 0.1), 0.002, sz + random.uniform(-0.4, 0.5)); a = random.uniform(0, math.pi)
    for j in range(3):
        a += random.uniform(-0.8, 0.8); p1 = (p0[0] + 0.05 * math.cos(a), 0.002, p0[2] + 0.05 * math.sin(a)); ccyl(cut['vc'], p0, p1, 0.0012, ['#f2f0ea', '#e2cc1e', '#d9579a'][k % 3], seg=3); p0 = p1
cut.done()

# ---------------- 工作桌（抽屜櫃、毛巾、噴瓶、工具） ----------------
wb = IT['workbench']; bx, bz, bw, bd, bh = wb['x'], wb['z'], wb['w'], wb['d'], wb['h']
xa, xb_, za, zb = bx - bw / 2, bx + bw / 2, bz - bd / 2, bz + bd / 2
pw = Part('workbench'); c, cm, w_, g_ = pw['vc'], pw['vcm'], pw['wood'], pw['goods']
w_.rbox(xa, xb_, bh - 0.035, bh, za, zb, r=0.006)
for x in (xa + 0.025, xb_ - 0.025):
    for z in (za + 0.025, zb - 0.025): crb(cm, x - 0.018, x + 0.018, 0.0, bh - 0.035, z - 0.018, z + 0.018, '#9a9ea2', r=0.004)
crb(cm, xa, xb_, 0.12, 0.14, za + 0.01, zb - 0.01, '#9a9ea2', r=0.003)
for k, z0_ in enumerate((za + 0.05, za + 0.57)):                                             # 兩組塑膠抽屜櫃（四層）
    crb(c, xa + 0.06, xb_ - 0.08, 0.14, 0.72, z0_, z0_ + 0.48, '#e2e3e0', r=0.01)
    for j in range(4):
        y = 0.16 + j * 0.14; g_.rect((xa + 0.055, y + 0.06, z0_ + 0.24), (0, 0, 1), (0, 1, 0), 0.22, 0.062, ATL['drawer'])
g_.rect((xa - 0.002, bh - 0.12, bz + 0.3), (0, 0, 1), (0, 1, 0), 0.08, 0.08, ATL['note_line'])
for k, (y_off, col) in enumerate(((0, '#c8202a'), (0, '#2f6fb8'))): crb(c, xa + 0.1 + k * 0.16, xa + 0.24 + k * 0.16, bh, bh + 0.05, za + 0.1, za + 0.32, col, r=0.008)   # 工具盤
clathe(c, [(0.0, 0.0), (0.032, 0.0), (0.034, 0.13), (0.022, 0.16), (0.012, 0.17), (0.012, 0.2), (0.0, 0.2)], xa + 0.2, bh, zb - 0.15, '#dfe8ef', seg=10)   # 噴瓶
crb(c, xa + 0.195, xa + 0.235, bh + 0.19, bh + 0.22, zb - 0.17, zb - 0.1, '#2f6fb8', r=0.006)
clathe(c, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.05), (0.03, 0.05), (0.03, 0.045), (0.0, 0.045)], xa + 0.5, bh, zb - 0.25, '#e8dcb0', seg=12)   # 膠帶
for j, col in enumerate(('#1d1d21', '#d2303a')):
    crb(c, xa + 0.3 + j * 0.08, xa + 0.315 + j * 0.08, bh, bh + 0.012, bz - 0.1, bz + 0.05, col, r=0.003)
    crb(cm, xa + 0.302 + j * 0.08, xa + 0.313 + j * 0.08, bh, bh + 0.008, bz + 0.05, bz + 0.13, '#c9ccce', r=0.002)
clathe(c, [(0.0, 0.0), (0.06, 0.0), (0.062, 0.018), (0.0, 0.02)], xa + 0.55, bh, za + 0.2, '#f2f0ea', seg=12)   # 一卷拍線
n0 = _N0(c); rows = []                                                              # 毛巾：從桌子前緣垂下來
for k in range(7):
    t = k / 6; xx = xa + 0.1 * (1 - t) - 0.015 * t; yy = bh + 0.01 - 0.36 * t ** 1.2
    rows.append([c.bm.verts.new(g2b(xx, yy, zb - 0.06 + 0.01 * math.sin(k))), c.bm.verts.new(g2b(xx - 0.004, yy, zb - 0.36))])
for a, b in zip(rows, rows[1:]): c.bm.faces.new((a[0], a[1], b[1], b[0]))   # 反面由 single_side 補
c.paint(_new(c, n0), '#cfd4cc')
pw.done()

# ---------------- 小推車（輪子、兩層、工具箱、噴瓶） ----------------
ct = IT['cart']; cx, cz, cw, cd, ch = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
pc = Part('cart'); c, cm = pc['vc'], pc['vcm']
for sx_ in (-1, 1):
    for sz_ in (-1, 1):
        px, pz = cx + sx_ * (cw / 2 - 0.02), cz + sz_ * (cd / 2 - 0.02)
        ccyl(cm, (px, 0.1, pz), (px, ch, pz), 0.011, '#b3b7ba', seg=6)
        clathe(c, [(0.0, -0.025), (0.035, -0.025), (0.04, 0.0), (0.035, 0.025), (0.0, 0.025)], px, 0.045, pz, '#2a2a2c', seg=10, R=rot('Z', math.pi / 2))
for y in (0.16, 0.48, ch - 0.02):
    crb(cm, cx - cw / 2, cx + cw / 2, y, y + 0.02, cz - cd / 2, cz + cd / 2, '#b9bdc0', r=0.005)
crb(c, cx - 0.17, cx + 0.12, ch, ch + 0.14, cz - 0.2, cz + 0.05, '#b8302c', r=0.012, seg=2)   # 工具箱（紅）
crb(cm, cx - 0.08, cx + 0.03, ch + 0.14, ch + 0.17, cz - 0.1, cz - 0.05, '#4a4d52', r=0.006)
clathe(c, [(0.0, 0.0), (0.032, 0.0), (0.034, 0.13), (0.022, 0.16), (0.012, 0.17), (0.012, 0.2), (0.0, 0.2)], cx + 0.1, ch, cz + 0.15, '#dfe8ef', seg=10)
crb(c, cx + 0.095, cx + 0.135, ch + 0.19, ch + 0.22, cz + 0.13, cz + 0.2, '#2f6fb8', r=0.006)
for j in range(3): clathe(c, [(0.0, 0.0), (0.06, 0.0), (0.062, 0.02), (0.0, 0.022)], cx - 0.1 + j * 0.1, 0.5, cz + 0.1, ['#f0d23a', '#3f7fd0', '#f2f0ea'][j], seg=12)
pc['goods'].box(cx, 0.26, cz, 0.36, 0.2, 0.4, 'kraft2', front='-x')
pc.done()


# ---------------- 高腳凳 ----------------
def stool_high(x, z, y=0.72):
    p = Part('stool_high'); w_ = p['wood']
    bm = L.lathe([(0.0, 0.0), (0.155, 0.0), (0.172, 0.012), (0.175, 0.03), (0.165, 0.042), (0.0, 0.045)], seg=18); w_.add_bm(bm, fm((x, y - 0.045, z))); bm.free()
    feet = [(x + 0.17 * math.cos(a), z + 0.17 * math.sin(a)) for a in (math.pi / 4 + k * math.pi / 2 for k in range(4))]
    tops = [(x + 0.11 * math.cos(a), z + 0.11 * math.sin(a)) for a in (math.pi / 4 + k * math.pi / 2 for k in range(4))]
    for (fx_, fz_), (tx_, tz_) in zip(feet, tops): w_.cyl((fx_, 0.0, fz_), (tx_, y - 0.045, tz_), 0.018, seg=8)
    for hh in (0.24, 0.48):
        t = hh / (y - 0.045); ring = [(f[0] + (tp[0] - f[0]) * t, hh, f[1] + (tp[1] - f[1]) * t) for f, tp in zip(feet, tops)]
        for a, b in zip(ring, ring[1:] + ring[:1]): w_.cyl(a, b, 0.011, seg=6)
    for (fx_, fz_) in feet: ccyl(p['vc'], (fx_, 0.0, fz_), (fx_, 0.012, fz_), 0.02, '#2a2622', seg=8)   # 腳套
    p.done()


stool_high(IT['stool_high']['x'], IT['stool_high']['z'], IT['stool_high']['h'])


# ---------------- v2b：走道上的東西（LAWWW2：「中間走道太乾淨」）——圓凳、一桶球、地上兩箱貨 ----------------
def stool_round(x, z, y=0.45):
    """紅色塑膠圓凳（台灣老店的那種：座面一圈、四隻腳往外斜）"""
    p = Part('stool_round', T=fm((x, 0, z), rot('Y', 0.4))); c = p['vc']
    clathe(c, [(0.0, y - 0.03), (0.15, y - 0.03), (0.165, y - 0.015), (0.165, y), (0.0, y + 0.004)], 0, 0, 0, '#b8302c', seg=16)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        ccyl(c, (0.17 * math.cos(a), 0.0, 0.17 * math.sin(a)), (0.11 * math.cos(a), y - 0.03, 0.11 * math.sin(a)), 0.018, '#a82a26', seg=6)
    clathe(c, [(0.0, y + 0.004), (0.05, y + 0.004), (0.0, y + 0.006)], 0, 0, 0, '#8a221f', seg=8)    # 座面中間的洞（磨亮、深一點）
    p.done()


def ball_bin(x, z):
    """鐵網桶（特價區）：桶裡滿滿的桌球＋幾卷握把布，桶上插一張手寫紙條"""
    p = Part('ball_bin'); cm, c = p['vcm'], p['vc']; r0, h0 = 0.22, 0.48
    for y in (0.02, h0 * 0.5, h0): 
        pts = [(x + r0 * math.cos(2 * math.pi * k / 14), y, z + r0 * math.sin(2 * math.pi * k / 14)) for k in range(14)]
        for a_, b_ in zip(pts, pts[1:] + pts[:1]): ccyl(cm, a_, b_, 0.005 if y == h0 else 0.003, '#8d9196', seg=3)
    for k in range(14):
        a = 2 * math.pi * k / 14; ccyl(cm, (x + r0 * math.cos(a), 0.0, z + r0 * math.sin(a)), (x + r0 * math.cos(a), h0, z + r0 * math.sin(a)), 0.003, '#8d9196', seg=3)
    clathe(c, [(0.0, 0.03), (r0 - 0.01, 0.03), (r0 - 0.01, h0 - 0.06), (0.0, h0 - 0.05)], x, 0, z, '#e07a22', seg=14)   # 桶裡的球（看不到的部分用一塊）
    rb = random.Random(4)
    for k in range(22):                                                                   # 最上面一層的球
        a = rb.uniform(0, 2 * math.pi); rr = math.sqrt(rb.uniform(0, 1)) * (r0 - 0.03)
        csph(c, (x + rr * math.cos(a), h0 - 0.045 + rb.uniform(0, 0.02), z + rr * math.sin(a)), 0.02, '#f08a24' if k % 4 else '#f4f2ec', seg=6, rings=4)
    for k, col in enumerate(('#f2f0ea', '#1e1e20', '#e98fa8')):                            # 斜插的握把布
        a = k * 2.1; px, pz = x + 0.1 * math.cos(a), z + 0.1 * math.sin(a); ccyl(c, (px, h0 - 0.06, pz), (px + 0.03, h0 + 0.12, pz + 0.02), 0.017, col, seg=6)
    p['goods'].rect((x, h0 + 0.12, z - r0 - 0.005), (-1, 0, 0), (0, 1, 0), 0.09, 0.09, ATL['note_sale'])
    ccyl(cm, (x, h0, z - r0), (x, h0 + 0.05, z - r0 - 0.003), 0.002, '#8d9196', seg=3)
    p.done()


def floor_boxes(x, z):
    """地上兩箱剛到的貨（一箱開著、上面一疊羽球筒）"""
    p = Part('floor_boxes', T=fm((x, 0, z), rot('Y', 0.15))); g = p['goods']
    # 封好的兩箱：Poly Haven cardboard_box_01（掃描的紙箱，膠帶、壓痕、摺角都在）；大小照原本的（0.5×0.4×0.42、0.42×0.3×0.36）
    a_ = 0.15; ca_, sa_ = math.cos(a_), math.sin(a_); wp = lambda lx, lz: (x + lx * ca_ + lz * sa_, z - lx * sa_ + lz * ca_)
    px_, pz_ = wp(0.0, 0.0); K.ph_put('cardboard_box_01', px_, 0.0, pz_, a_ + math.pi / 2, fit=(0.42, 0.5, 0.4), decimate=0.03)
    px_, pz_ = wp(0.02, -0.02); K.ph_put('cardboard_box_01', px_, 0.4, pz_, a_ + math.pi / 2 + 0.12, sxyz=(0.36 / 0.42, 0.42 / 0.5, 0.75), fit=(0.42, 0.5, 0.4), decimate=0.03)
    g.box(-0.05, 0.16, -0.46, 0.44, 0.32, 0.36, 'kraft3', front='+x', skip=('-y', '+y'), cells={'+z': 'kraft2'})   # 開著的那一箱（沒有蓋）
    c = p['vc']
    for k in range(3): crb(c, -0.27 + k * 0.01, -0.26 + k * 0.01, 0.32 - k * 0.04, 0.34 - k * 0.04, -0.64, -0.28, '#b08a5c', r=0.0)   # 翻開的紙箱蓋
    p.done()
    for k in range(4): TUBE[0].place(fm((x - 0.05 + (k % 2) * 0.1, 0.02, z - 0.51 + (k // 2) * 0.1)))   # 開著的箱子裡站著四筒


for it in LAY['items']:
    if it['kind'] == 'stool_round': stool_round(it['x'], it['z'], it['h'])
    elif it['kind'] == 'ball_bin': ball_bin(it['x'], it['z'])
    elif it['kind'] == 'floor_boxes': floor_boxes(it['x'], it['z'])


# ======================================================================
# 左牆：網格（握把布、拍線、桌球盒）、下層木板＋籃子、上層木板、電視、黃金葛、木柱
# ======================================================================
LZ0, LZ1 = -0.85, 6.6
wall_grid('left', LZ0, LZ1, 1.12, 2.26)
XL = XI0 + 0.035
lh = Part('lhooks', side='left'); lg = Part('lgoods', side='left')
GR = ['grip_w', 'grip_p', 'grip_y', 'grip_b', 'grip_k', 'grip_w', 'grip_g', 'grip_o', 'grip_v', 'grip_p']
STR = ['str_b', 'str_y', 'str_w', 'str_r', 'str_g', 'str_p', 'str_o', 'str_k']
k = 0
for row, (y, kinds, wid, hgt) in enumerate(((2.22, GR, 0.11, 0.22), (1.86, STR + GR[:4], 0.11, 0.22), (1.5, ['ball_org', 'ball_wht', 'ball_org', 'rub_red', 'ball_wht', 'rub_blk'], 0.17, 0.15))):
    z = LZ1 - 0.12 - (0.05 if row % 2 else 0)
    while z > LZ0 + 0.08:
        cn = kinds[(k * 3 + row) % len(kinds)]
        ccyl(lh['vcm'], (XI0, y, z), (XL + 0.08, y + 0.01, z), 0.0026, '#9ba0a4', seg=3)
        th = 0.05 if cn.startswith('ball') else 0.005
        for j in range(1 if cn.startswith('ball') else 4):   # 一支掛勾掛好幾包（參考圖：一包疊一包）
            cj = cn if j < 3 else kinds[(k * 5 + 1) % len(kinds)]
            lg['goods'].box(XL + 0.01 + th / 2 + j * 0.016, y - hgt / 2 - 0.015 - j * 0.004, z + random.uniform(-0.006, 0.006), th, hgt, wid, cj, front='+x', skip=('-y', '-x'))
        z -= wid + 0.022; k += 1
lg['goods'].rect((XL + 0.06, 2.0, 0.2), (0, 0, -1), (0, 1, 0), 0.11, 0.11, ATL['note_grip'])
lg['goods'].rect((XL + 0.06, 1.3, -0.4), (0, 0, -1), (0, 1, 0), 0.06, 0.04, ATL['tag1'])
lh.done(); lg.done()
# 木柱（左牆的木架：參考圖櫃台尾端那根）
po = Part('lposts', side='left')
for z in (0.4, -0.88): po['wood'].rbox(XI0 + 0.26, XI0 + 0.32, 0.0, 2.3, z - 0.03, z + 0.03, r=0.006)
po.done()
# 上層木板（2.3 m）：黃金葛、紙箱、羽球筒盒
us = Part('upper_shelf', side='left'); yS = 2.3
us['wood'].rbox(XI0, XI0 + 0.32, yS - 0.03, yS, -0.9, 6.62, r=0.006)
for z in (-0.6, 1.4, 3.6, 5.6): ccyl(us['vcm'], (XI0, yS - 0.2, z), (XI0 + 0.28, yS - 0.035, z), 0.008, '#6f7377', seg=5)
z = -0.85
while z < 6.5:
    if 2.2 < z < 3.7: z = 3.7; continue                                                        # 電視、黃金葛的位置空著
    kind = random.choice(['kraft1', 'kraft2', 'whitebox', 'kraft3', 'ttbox', 'kraft4'])
    w_ = random.uniform(0.25, 0.42); h_ = random.uniform(0.18, 0.34); nst = random.randint(1, 2)
    for j in range(nst): us['goods'].box(XI0 + 0.16, yS + h_ / 2 + j * h_, z + w_ / 2, 0.3, h_, w_, kind, front='+x')
    z += w_ + random.uniform(0.02, 0.06)
us['goods'].rect((XI0 + 0.004, 2.82, 5.3), (0, 0, -1), (0, 1, 0), 0.24, 0.36, ATL['poster'])    # 褪色的海報（前段左牆上面）
us.done()
# 下層木板（1.05 m）＋籃子（藤籃、藍色、白色塑膠籃，裡面一卷一卷握把布）
ls = Part('lower_shelf', side='left'); yL = 1.05
ls['wood'].rbox(XI0, XI0 + 0.32, yL - 0.03, yL, -0.9, 6.62, r=0.006)
for z in (-0.6, 1.4, 3.6, 5.6): ccyl(ls['vcm'], (XI0, yL - 0.2, z), (XI0 + 0.28, yL - 0.035, z), 0.008, '#6f7377', seg=5)
z = 6.45
while z > -0.6:
    bc = random.choice(['#9e8368', '#3a78c0', '#ecebe6', '#9e8368', '#3a78c0']); c = ls['vc']; bx0, bx1, z0_, z1_ = XI0 + 0.03, XI0 + 0.3, z - 0.19, z + 0.19
    c.cbox(bx0, bx1, yL, yL + 0.008, z0_, z1_, bc)
    for (a0, a1, b0, b1) in ((bx0, bx1, z0_, z0_ + 0.008), (bx0, bx1, z1_ - 0.008, z1_), (bx0, bx0 + 0.008, z0_, z1_), (bx1 - 0.008, bx1, z0_, z1_)): c.cbox(a0, a1, yL, yL + 0.1, b0, b1, bc)
    c.cbox(bx1 - 0.012, bx1 + 0.002, yL + 0.085, yL + 0.105, z0_, z1_, jit(bc, 0.15))
    for j in range(5):
        gc = random.choice(['#f2f0ea', '#e98fa8', '#f0d23a', '#2f6fb8', '#1e1e20', '#5fb35a']); yy = yL + 0.04 + (j % 2) * 0.028
        ccyl(c, (bx0 + 0.03, yy, z0_ + 0.05 + j * 0.07), (bx1 - 0.03, yy + 0.02, z0_ + 0.05 + j * 0.07), 0.017, gc, seg=6)
    z -= 0.42
ls.done()
# 櫃台後面那一段的高架（z 0.4～−0.9：紙箱、資料夾堆到天花板）
hs = Part('tall_left', side='left')
for y in (0.08, 0.6, 1.12, 1.64): hs['wood'].rbox(XI0, XI0 + 0.32, y, y + 0.025, -0.9, 0.38, r=0.004)
for y0, nm in ((0.105, 'kraft1'), (0.625, 'binders'), (1.145, 'kraft4'), (1.665, 'kraft2')):
    z = -0.86
    while z < 0.3:
        w_ = 0.36 if nm != 'binders' else 0.42; h_ = 0.45 if nm != 'binders' else 0.32
        hs['goods'].box(XI0 + 0.16, y0 + h_ / 2, z + w_ / 2, 0.28, h_, w_ - 0.02, nm if random.random() > 0.3 else 'kraft3', front='+x'); z += w_
hs['goods'].rect((XI0 + 0.33, 1.45, -0.25), (0, 0, -1), (0, 1, 0), 0.12, 0.15, ATL['calendar'])
hs.done()
# 電視（左牆伸出來的支架；朝店門、稍微朝走道）
tv = IT['tv']; tvx, tvy, tvz, tvr = tv['x'], tv['y'], tv['z'], tv['ry']
pt = Part('tv', side='left', T=fm((tvx, tvy, tvz), rot('Y', tvr)))
crb(pt['vc'], -0.585, 0.585, -0.345, 0.345, -0.035, 0.0, '#18181a', r=0.01); crb(pt['vc'], -0.28, 0.28, -0.18, 0.18, -0.07, -0.035, '#222224', r=0.02)
pt['emit'].rect((0, 0.0, 0.002), (1, 0, 0), (0, 1, 0), 0.565, 0.318, ATL['tv']); pt.done()
bk = Part('tv_arm', side='left'); back = Vector((tvx, tvy, tvz)) + rot('Y', tvr) @ Vector((0, 0, -0.07))
ccyl(bk['vcm'], (XI0, tvy, back.z), (back.x, back.y, back.z), 0.018, '#2a2a2c', seg=8); crb(bk['vcm'], XI0, XI0 + 0.02, tvy - 0.12, tvy + 0.12, back.z - 0.08, back.z + 0.08, '#2a2a2c', r=0.004)
bk.done()
# 黃金葛（陶盆＋葉片卡，藤垂到網格前）
ppx, ppz = XI0 + 0.16, IT['pothos']['z']
pp = Part('pothos', side='left')
clathe(pp['vc'], [(0.0, 0.0), (0.08, 0.0), (0.1, 0.02), (0.13, 0.17), (0.14, 0.18), (0.12, 0.18), (0.0, 0.16)], ppx, yS, ppz, '#8a4e34', seg=16)
clathe(pp['vc'], [(0.0, 0.0), (0.122, 0.0), (0.0, 0.01)], ppx, yS + 0.16, ppz, '#3e3024', seg=10)
rk = random.Random(9)


def leaf(u, base, yaw, pitch, s, k):
    R_ = rot('Y', yaw) @ rot('X', -pitch); b = Vector(base); fwd = R_ @ Vector((0, 0, 1)); side_ = R_ @ Vector((1, 0, 0))
    c_ = b + fwd * s * 0.5; up = fwd; u.rect(tuple(c_), tuple(side_), tuple(up), s * 0.38, s * 0.5, ATL[f'leaf{k}'], both=True)


for v in range(11):
    a = rk.uniform(-0.6, 2.6); cur = Vector((ppx + 0.1 * math.cos(a), yS + 0.17, ppz + 0.1 * math.sin(a)))
    drop = rk.uniform(0.3, 1.2) if v > 2 else rk.uniform(0.05, 0.3); n = int(5 + drop * 10)
    dirv = Vector((math.cos(a) * 0.6 + 0.5, 0, math.sin(a) * 0.9))
    for j in range(n):
        t = j / max(1, n - 1)
        nxt = cur + Vector((dirv.x * 0.035 * (1 - t) + 0.004, -drop / n * (0.3 + 1.4 * t), dirv.z * 0.03 + 0.012 * math.sin(j * 0.9 + v)))
        nxt.x = max(nxt.x, XL + 0.04); ccyl(pp['vc'], tuple(cur), tuple(nxt), 0.003, '#5f7a3a', seg=3)
        leaf(pp['alpha'], tuple(nxt), rk.uniform(0, 2 * math.pi), rk.uniform(0.6, 1.4), rk.uniform(0.06, 0.09), rk.randrange(4))
        cur = nxt
for j in range(16): leaf(pp['alpha'], (ppx + rk.uniform(-0.09, 0.09), yS + 0.17 + rk.uniform(0, 0.08), ppz + rk.uniform(-0.09, 0.09)), rk.uniform(0, 6.3), rk.uniform(-0.6, 0.5), rk.uniform(0.07, 0.1), rk.randrange(4))
pp.done()


# ======================================================================
# 玻璃展示櫃、木櫃台
# ======================================================================
gc_ = IT['glass_case']; gx, gz, gw, gd, gh = gc_['x'], gc_['z'], gc_['w'], gc_['d'], gc_['h']
xa, xb_, za, zb = gx - gw / 2, gx + gw / 2, gz - gd / 2, gz + gd / 2
pg = Part('glasscase'); c, cm = pg['vc'], pg['vcm']
crb(c, xa, xb_, 0.0, 0.25, za, zb, '#d6d0c2', r=0.01); crb(c, xa + 0.02, xb_ - 0.02, 0.0, 0.05, za + 0.02, zb - 0.02, '#3f3a35', r=0.004)
crb(c, xb_ - 0.004, xb_ + 0.002, 0.03, 0.06, za + 0.05, zb - 0.05, '#8a8070', r=0.002)        # 被踢髒的下緣
for x in (xa, xb_):
    for z in (za, zb, gz): crb(cm, x - 0.012, x + 0.012, 0.25, gh, z - 0.012, z + 0.012, ALU, r=0.004)
for y in (0.25, gh - 0.02):
    for (a0, a1, b0, b1) in ((xa, xb_, za - 0.012, za + 0.012), (xa, xb_, zb - 0.012, zb + 0.012), (xa - 0.012, xa + 0.012, za, zb), (xb_ - 0.012, xb_ + 0.012, za, zb)): crb(cm, a0, a1, y, y + 0.022, b0, b1, ALU, r=0.004)
gl = pg['glass']
gl.quad([(xb_, 0.27, zb), (xb_, 0.27, za), (xb_, gh - 0.02, za), (xb_, gh - 0.02, zb)]); gl.quad([(xa, 0.27, za), (xa, 0.27, zb), (xa, gh - 0.02, zb), (xa, gh - 0.02, za)])
gl.quad([(xa, gh, zb), (xb_, gh, zb), (xb_, gh, za), (xa, gh, za)]); gl.quad([(xa, 0.27, zb), (xb_, 0.27, zb), (xb_, gh - 0.02, zb), (xa, gh - 0.02, zb)]); gl.quad([(xb_, 0.27, za), (xa, 0.27, za), (xa, gh - 0.02, za), (xb_, gh - 0.02, za)])
gl.box(xa + 0.02, xb_ - 0.02, 0.6, 0.608, za + 0.02, zb - 0.02)
gd_ = pg['goods']
z = zb - 0.12
while z > za + 0.12:                                                                           # 上層：膠皮（斜靠，朝客人、朝上）
    for j in range(3):
        cn = random.choice(['rub_red', 'rub_blk', 'rub_red', 'rub_tt'])
        R_ = rot('Z', 0.75 + random.uniform(-0.1, 0.1))
        ctr = Vector((xa + 0.16 + j * 0.24, 0.608 + 0.1, z)); r_, up = Vector((0, 0, -1)), R_ @ Vector((0, 1, 0))
        gd_.rect(tuple(ctr), tuple(r_), tuple(up), 0.085, 0.11, ATL[cn])
    z -= 0.2
for j in range(6):                                                                             # 下層：桌球盒、拍線包
    z = zb - 0.3 - j * 0.5; gd_.box(xa + 0.2, 0.27 + 0.05, z, 0.2, 0.1, 0.28, random.choice(['ball_org', 'ball_wht']), front='+x', cells={'+y': random.choice(['ball_org', 'ball_wht'])})
    gd_.box(xa + 0.5, 0.27 + 0.04, z + 0.05, 0.22, 0.08, 0.2, random.choice(['ttbox', 'str_b', 'str_y']), front='+x', cells={'+y': 'ttbox'})
pg.done()
for j in range(5):                                                                             # 上層的拍線捲（平放）
    z = zb - 0.25 - j * 0.65; col = random.choice(['#f2f0ea', '#e2cc1e', '#3f7fd0', '#f2f0ea', '#d23a3a'])
    pt = Part(f'case_reel_{j}'); clathe(pt['vc'], [(0.03, 0.0), (0.075, 0.0), (0.08, 0.008), (0.08, 0.022), (0.075, 0.03), (0.03, 0.03), (0.03, 0.0)], xb_ - 0.12, 0.608, z, col, seg=14)
    clathe(pt['vc'], [(0.0, 0.0), (0.03, 0.0), (0.03, 0.03), (0.0, 0.03)], xb_ - 0.12, 0.608, z, '#1d1d21', seg=8); pt.done()
gcn = Part('case_note'); gcn['goods'].rect((xb_ + 0.003, 0.45, zb - 0.5), (0, 0, -1), (0, 1, 0), 0.07, 0.07, ATL['note_tt']); gcn.done()

ko = IT['counter']; kx, kz, kw, kd, kh = ko['x'], ko['z'], ko['w'], ko['d'], ko['h']
xa, xb_, za, zb = kx - kw / 2, kx + kw / 2, kz - kd / 2, kz + kd / 2
pk = Part('counter', smooth=False); w_ = pk['wood']; c = pk['vc']; u = pk['goods']
w_.rbox(xa + 0.02, xb_, 0.08, kh - 0.04, za, zb, r=0.006)                                     # 櫃身（老闆那一面的開放格在下面）
crb(c, xa + 0.05, xb_ - 0.03, 0.0, 0.08, za + 0.03, zb - 0.03, '#2f2a25', r=0.004)            # 踢腳（暗）
cf = ATL['counter_face']
u.rect((xb_ + 0.004, (0.08 + kh - 0.04) / 2, kz), (0, 0, -1), (0, 1, 0), kd / 2, (kh - 0.12) / 2, cf)            # 客人那一面（掉漆、邊框）
u.rect((kx, (0.08 + kh - 0.04) / 2, zb + 0.004), (1, 0, 0), (0, 1, 0), kw / 2, (kh - 0.12) / 2, sub('counter_face', 0.0, 0.0, 0.3, 1.0))   # 前端面
u.box(kx + 0.005, kh - 0.02, kz, kw + 0.05, 0.04, kd + 0.05, 'counter_top', front='+y', cells={'+x': sub('counter_face', 0, 0.9, 1, 1), '+z': sub('counter_face', 0, 0.9, 0.3, 1), '-x': sub('counter_face', 0, 0.9, 1, 1), '-z': sub('counter_face', 0, 0.9, 0.3, 1)})
u.rect((xb_ + 0.006, 0.55, kz - 0.5), (0, 0, -1), (0, 1, 0), 0.2, 0.1, ATL['note_wide'])
for k in range(3): u.box(xa + 0.22, 0.32, za + 0.45 + k * 0.82, 0.3, 0.38, 0.6, random.choice(['kraft2', 'kraft1']), front='-x')   # 老闆那一面：開放格的紙箱
pk.done()
# 檯面上的東西
T_ = kh
pt = Part('counter_top'); c, cm, gd_ = pt['vc'], pt['vcm'], pt['goods']
mx, mz = kx - 0.12, kz - 0.35                                                                  # 螢幕（朝老闆、稍微朝店門）
MT = fm((mx, T_, mz), rot('Y', -2.1))
mon = Part('monitor', T=MT); crb(mon['vc'], -0.25, 0.25, 0.12, 0.44, -0.02, 0.02, '#1c1c1e', r=0.008)
clathe(mon['vc'], [(0, 0), (0.1, 0), (0.1, 0.012), (0.02, 0.02), (0, 0.02)], 0, 0, -0.04, '#2a2a2c', seg=12); ccyl(mon['vc'], (0, 0.02, -0.04), (0, 0.2, -0.03), 0.015, '#2a2a2c', seg=6)
mon['emit'].rect((0, 0.28, 0.021), (1, 0, 0), (0, 1, 0), 0.23, 0.15, ATL['pos']); mon['goods'].rect((0, 0.28, -0.021), (-1, 0, 0), (0, 1, 0), 0.23, 0.15, ATL['monback']); mon.done()
crb(c, kx - 0.3, kx - 0.0, T_, T_ + 0.02, mz - 0.2, mz + 0.2, '#e2e0d8', r=0.006)              # 鍵盤
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.11), (0.038, 0.11), (0.0, 0.005)], kx + 0.2, T_, kz + 0.05, '#3a4f7a', seg=10)  # 筆筒
for j in range(7):
    a = j * 0.9; ccyl(c, (kx + 0.2 + 0.015 * math.cos(a), T_ + 0.02, kz + 0.05 + 0.015 * math.sin(a)), (kx + 0.2 + 0.03 * math.cos(a), T_ + 0.16, kz + 0.05 + 0.03 * math.sin(a)), 0.004, ['#d23a3a', '#2f4f8a', '#1d1d21', '#e2cc1e', '#2e8a4a', '#f2f0ea', '#d23a3a'][j], seg=4)
crb(c, kx + 0.05, kx + 0.17, T_, T_ + 0.018, kz - 0.25, kz - 0.16, '#3a3a3c', r=0.006)          # 計算機
for j in range(3):
    for q in range(3): c.cbox(kx + 0.062 + j * 0.035, kx + 0.085 + j * 0.035, T_ + 0.018, T_ + 0.022, kz - 0.235 + q * 0.025, kz - 0.218 + q * 0.025, '#d8d8d4')
gd_.box(kx + 0.1, T_ + 0.004, kz + 0.35, 0.16, 0.008, 0.22, 'tags', front='+y', skip=('-y',))
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.09), (0.046, 0.095), (0.0, 0.095)], kx - 0.25, T_, kz + 0.45, '#f2efe6', seg=10)   # 馬克杯
ccyl(c, (kx - 0.21, T_ + 0.07, kz + 0.45), (kx - 0.195, T_ + 0.03, kz + 0.45), 0.007, '#f2efe6', seg=4)
gd_.box(kx + 0.18, T_ + 0.1, kz + 0.75, 0.26, 0.2, 0.26, 'ball_org', front='+x', cells={'+z': 'ball_wht', '+y': 'ball_org'})   # 桌球盒（參考圖：羽球筒旁邊）
for q in range(9): csph(c, (kx + 0.1 + (q % 3) * 0.06, T_ + 0.22, kz + 0.68 + (q // 3) * 0.06), 0.02, '#f08a24' if q % 4 else '#f4f2ec', seg=6, rings=4)
for j in range(4): gd_.box(kx - 0.2, T_ + 0.012 + j * 0.022, kz - 0.75, 0.2, 0.02, 0.17, random.choice(['rub_red', 'rub_blk']), front='+y')
pt.done()
for i in range(5):                                                                             # 羽球筒（參考圖櫃台前段：一排一排直立）
    for j in range(3):
        TUBE[0].place(fm((xb_ - 0.07 - i * 0.095, T_, zb - 0.08 - j * 0.095), rot('Y', random.uniform(0, 6.3))))


# ======================================================================
# 後段：走道兩側的鐵架＋紙箱（到天花板）、洞洞板、布簾、電風扇
# ======================================================================
def steel_shelf(name, xa, xb_, za, zb, face, levels=(0.08, 0.6, 1.12, 1.64, 2.12), top=2.55, fill=0.92):
    p = Part(name); cm, c, g = p['vcm'], p['vc'], p['goods']
    for x in (xa, xb_):
        z = za
        while z <= zb + 1e-3:
            cm.cbox(x - 0.018, x + 0.018, 0.0, top, z - 0.018, z + 0.018, '#7c8288'); z += max(0.9, (zb - za) / max(1, round((zb - za) / 1.2)))
    for y in levels:
        c.cbox(xa + 0.01, xb_ - 0.01, y, y + 0.018, za + 0.01, zb - 0.01, '#bba57c')
        for (a0, a1, b0, b1) in ((xa, xb_, za - 0.012, za + 0.012), (xa, xb_, zb - 0.012, zb + 0.012)) if face == '+z' else ((xa - 0.012, xa + 0.012, za, zb), (xb_ - 0.012, xb_ + 0.012, za, zb)):
            cm.cbox(a0, a1, y - 0.03, y + 0.005, b0, b1, '#6f757b')
    gaps = list(levels) + [top + 0.03]
    for li in range(len(levels)):
        y0 = levels[li] + 0.018; hmax = gaps[li + 1] - y0 - 0.03
        if face == '+z': a, b_, dep = xa + 0.03, xb_ - 0.03, zb - za
        else: a, b_, dep = za + 0.03, zb - 0.03, xb_ - xa
        t = a
        while t < b_ - 0.15:
            kind = random.choice(['kraft1', 'kraft2', 'kraft2', 'whitebox', 'binders', 'kraft3', 'ball_org', 'kraft4', 'ttbox', 'bag'])
            if random.random() > fill: t += random.uniform(0.15, 0.3); continue
            if kind == 'binders': w_, h_, d_ = random.uniform(0.3, 0.5), min(hmax, 0.32), 0.28
            elif kind in ('ball_org', 'ttbox'): w_, h_, d_ = 0.24, 0.12, 0.2
            elif kind == 'bag': w_, h_, d_ = 0.75, 0.22, min(dep - 0.06, 0.3)
            else: w_, h_, d_ = random.uniform(0.3, 0.55), random.uniform(0.25, hmax), min(dep - 0.06, random.uniform(0.32, 0.45))
            w_ = min(w_, b_ - t); h_ = min(h_, hmax); nst = int(hmax // h_) if kind in ('ball_org', 'ttbox') else 1
            if kind in ('kraft1', 'kraft2', 'kraft4'):   # v2（LAWWW2 11-14：貨箱不要程式拼的方塊加標籤）：Poly Haven cardboard_box_01，大小照這一格、角度偏一點
                yaw_ = random.uniform(-0.08, 0.08); sc_ = (w_ / 0.4, d_ / 0.38, h_ / 0.3)
                if face == '+z': K.ph_put('cardboard_box_01', t + w_ / 2, y0, zb - d_ / 2 - 0.02, yaw_, sxyz=sc_, fit=(0.4, 0.38, 0.3), decimate=0.012, tag='_shelf')
                else: K.ph_put('cardboard_box_01', (xb_ - d_ / 2 - 0.02) if face == '+x' else (xa + d_ / 2 + 0.02), y0, t + w_ / 2, math.pi / 2 + yaw_, sxyz=sc_, fit=(0.4, 0.38, 0.3), decimate=0.012, tag='_shelf')
                t += w_ + random.uniform(0.01, 0.04); continue
            for s in range(max(1, min(nst, 3))):
                if face == '+z': g.box(t + w_ / 2, y0 + h_ / 2 + s * h_, zb - d_ / 2 - 0.02, w_, h_, d_, kind, front='+z')
                else:
                    xc = (xb_ - d_ / 2 - 0.02) if face == '+x' else (xa + d_ / 2 + 0.02)
                    g.box(xc, y0 + h_ / 2 + s * h_, t + w_ / 2, d_, h_, w_, kind, front=face)
            t += w_ + random.uniform(0.01, 0.04)
    p.done()


BZ0, BZ1 = -6.6, -1.35
steel_shelf('back_L', -1.0, -0.52, BZ0, BZ1 - 0.5, '+x'); steel_shelf('back_L_front', XI0 + 0.02, -0.52, BZ1 - 0.48, BZ1, '+z')
steel_shelf('back_R', 0.92, 1.4, BZ0 + 0.6, BZ1 - 0.25, '-x')
st_ = Part('storage')                                                                          # 鐵架後面堆到天花板的紙箱
for (x0_, x1_) in ((XI0 + 0.02, -1.04), (1.44, XI1 - 0.02)):
    z = BZ1 - 0.5
    while z > BZ0:
        y = 0.0; d_ = random.uniform(0.45, 0.6)
        while y < HB - 0.35:
            h_ = random.uniform(0.3, 0.45); st_['goods'].box((x0_ + x1_) / 2 + random.uniform(-0.03, 0.03), y + h_ / 2, z - d_ / 2, x1_ - x0_ - 0.04, h_, d_ - 0.03, random.choice(['kraft1', 'kraft2', 'kraft2', 'kraft4']), front='+z'); y += h_ + 0.005
        z -= d_
st_.done()
# 桌球拍洞洞板（右邊鐵架的正面，面向店門；紅黑膠皮的成品拍 2 × 4）
pbx0, pbx1, pby0, pby1, pbz = 1.2, 1.9, 0.8, 2.4, BZ1 + 0.02
pb = Part('ttboard'); pb['wood'].rbox(pbx0, pbx1, pby0, pby1, pbz - 0.02, pbz, r=0.004)   # 參考圖：深色木板（不是洞洞板的白鐵）
for r_ in range(3): ccyl(pb['vcm'], (pbx0 + 0.04, pby1 - 0.12 - r_ * 0.5, pbz + 0.005), (pbx1 - 0.04, pby1 - 0.12 - r_ * 0.5, pbz + 0.005), 0.005, '#8d9196', seg=4)
for (a0, a1, b0, b1) in ((pbx0 - 0.03, pbx0, pby0 - 0.03, pby1 + 0.03), (pbx1, pbx1 + 0.03, pby0 - 0.03, pby1 + 0.03), (pbx0, pbx1, pby0 - 0.03, pby0), (pbx0, pbx1, pby1, pby1 + 0.03)):
    pb['wood'].rbox(a0, a1, b0, b1, pbz - 0.02, pbz + 0.015, r=0.005)
pb['goods'].rect(((pbx0 + pbx1) / 2, pby1 + 0.12, pbz + 0.017), (1, 0, 0), (0, 1, 0), 0.12, 0.08, sub('note_tt', 0, 0.2, 1, 0.8))
pb.done()
TT = [Proto('tt_rb', tt_build('#c0262a', '#1b1b1d')), Proto('tt_bb', tt_build('#1b1b1d', '#c0262a'))]
for r_ in range(3):                                                                            # 參考圖：兩排大的紅黑成品拍、每排三支，掛在橫桿上
    for cz_ in range(2):
        x = pbx0 + 0.19 + cz_ * 0.32; y = pby1 - 0.5 - r_ * 0.5
        TT[(cz_ + r_) % 2].place(fm((x, y, pbz + 0.03), rot('Y', -math.pi / 2) @ rot('X', random.uniform(-0.05, 0.05))) @ Matrix.Scale(1.35, 4))
# 布簾（後門）＋電風扇
cu = IT['curtain']; cux, cuw, cuh = cu['x'], cu['w'], cu['h']
pcu = Part('curtain', side='back')
pcu['vc'].cbox(cux - cuw / 2 - 0.06, cux + cuw / 2 + 0.06, 0.0, cuh + 0.06, ZI0, ZI0 + 0.008, '#1e1b18')
for (a0, a1, b0, b1) in ((cux - cuw / 2 - 0.08, cux - cuw / 2 - 0.02, 0.0, cuh + 0.08), (cux + cuw / 2 + 0.02, cux + cuw / 2 + 0.08, 0.0, cuh + 0.08), (cux - cuw / 2 - 0.08, cux + cuw / 2 + 0.08, cuh + 0.02, cuh + 0.08)):
    pcu['wood'].rbox(a0, a1, b0, b1, ZI0, ZI0 + 0.05, r=0.006)
ccyl(pcu['vcm'], (cux - cuw / 2 - 0.02, cuh - 0.02, ZI0 + 0.08), (cux + cuw / 2 + 0.02, cuh - 0.02, ZI0 + 0.08), 0.008, '#8d9196', seg=6)
u = pcu['goods']; cg = ATL['curtain']; N_ = 16; zc0 = ZI0 + 0.09
cols = [(cux - cuw / 2 + cuw * i / N_, zc0 + 0.025 * math.sin(i * 1.4)) for i in range(N_ + 1)]
for i in range(N_):
    (xa_, za_), (xb2, zb2) = cols[i], cols[i + 1]; ua, ub = cg[0] + (cg[2] - cg[0]) * i / N_, cg[0] + (cg[2] - cg[0]) * (i + 1) / N_
    u.face([(xa_, 0.1, za_ + 0.01), (xb2, 0.1, zb2 + 0.01), (xb2, cuh - 0.03, zb2), (xa_, cuh - 0.03, za_)], [(ua, cg[1]), (ub, cg[1]), (ub, cg[3]), (ua, cg[3])], smooth=True)
pcu.done()
fn = IT['fan']; fx_, fz_ = fn['x'], fn['z']
pf_ = Part('fan', T=fm((fx_, 0, fz_), rot('Y', -0.4))); c = pf_['vc']
clathe(c, [(0, 0), (0.17, 0), (0.17, 0.02), (0.06, 0.05), (0.025, 0.06), (0, 0.06)], 0, 0, 0, '#e2e0da', seg=16)
ccyl(c, (0, 0.06, 0), (0, 0.95, 0), 0.014, '#d2d0ca', seg=6); ccyl(c, (0, 0.5, 0), (0, 0.97, 0), 0.019, '#e2e0da', seg=6)
n0 = _N0(c); c.ell((0, 1.05, -0.06), 0.07, 0.07, 0.1, seg=10, rings=5); c.paint(_new(c, n0), '#e2e0da')
for ring_z in (0.04, 0.1):
    pts_ = [(0.2 * math.cos(2 * math.pi * k / 14), 1.05 + 0.2 * math.sin(2 * math.pi * k / 14), ring_z) for k in range(14)]
    for a, b in zip(pts_, pts_[1:] + pts_[:1]): ccyl(c, a, b, 0.003, '#c8ccd0', seg=3)
for k in range(10):
    a_ = 2 * math.pi * k / 10; ccyl(c, (0, 1.05, 0.12), (0.2 * math.cos(a_), 1.05 + 0.2 * math.sin(a_), 0.1), 0.002, '#c8ccd0', seg=3)
for k in range(3):
    a_ = 2 * math.pi * k / 3 + 0.3; n0 = _N0(c)
    c.ell((0.1 * math.cos(a_), 1.05 + 0.1 * math.sin(a_), 0.07), 0.075, 0.045, 0.006, seg=8, rings=3); c.paint(_new(c, n0), '#9fc4d8')
csph(c, (0, 1.05, 0.075), 0.03, '#e2e0da', seg=8, rings=4)
pf_.done()
ex = Part('ext_cord')                                                                          # 延長線（後段地上，沿著鐵架腳）
crb(ex['vc'], 0.7, 0.76, 0.0, 0.04, -3.2, -2.9, '#ecebe6', r=0.008)
for a, b in (((0.73, 0.01, -2.9), (0.8, 0.01, -2.2)), ((0.8, 0.01, -2.2), (0.88, 0.01, -1.5))): ccyl(ex['vc'], a, b, 0.004, '#ecebe6', seg=4)
ex.done()

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
ss = None if os.environ.get('HP_NOSS') else L.single_side(root, keep=r'glass', nodup=r'hp_(plaster|wood|floor_tile|ceiling|goods|sign|emit|alpha)')
K.report()
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出 EXT_mesh_gpu_instancing 的節點叫 haopai_interior.N、沒有自訂屬性 → 遊戲的 /WALL_/ 認不到右牆的球拍。
    改成網格的名字（WALL_right_…_inst），右牆的補 extras.dir（和牆一樣往室內的法線），球拍才會跟著右牆淡出。"""
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
info.update({'shop': 'haopai', 'layout': 2, 'drawn_tris': drawn, 'protos': {p.name: p.n for p in BAD + BAD_FREE + TEN + TUBE + TT + [FIXP]},
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m})})
L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', drawn, 'racketsB', n_b, 'tennis', n_t)
