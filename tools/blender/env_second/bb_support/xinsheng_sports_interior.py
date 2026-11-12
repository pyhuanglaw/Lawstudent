"""新生運動廣場（新生南路的運動用品店，兩層）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-04 v3：照使用者的參考圖 xinsheng_sports_int 重做
（SCENE_RULES 第 12 節：參考圖就是規格）。v1／v2（9 × 16 m、方塊人台、藍色色塊欄杆、空白的牆）退回。
  python3 tools/blender/env_second/bb_support/xinsheng_tex.py                 # 先畫貼圖（→ tools/blender/env_second/textures/gen/xs_*）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/xinsheng_sports_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
配置（家具位置、大小、樓梯、夾層、導航阻擋）只寫在 src/data/xinsheng_sports_layout.js，這裡讀同一份。
座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。參考圖的鏡頭：layout 的 camRef（眼睛 (−1.5,1.55,7.55)、16 mm、水平往 −z、鏡頭位移 shiftY）。
從店門往裡看（參考圖由左到右、由前到後）：
  左前：鐵網球架（網球網籃、排球、籃球兩層、頂上日光燈）→ 斜放的護具網牆（護膝、護腕吊卡）＋背包木地台 → 人台（深藍運動 T、球褲）→ 後面一排運動 T。
  中：衣架（運動 T，最前面一套正面展示）、米色 60 cm 地磚；夾層前緣的主招牌「新生運動廣場」（字畫在貼圖上）、玻璃欄杆＋木扶手；
      二樓後牆：三件展示球衣（電機系 37、土木系 16、舊序章 88）、「系隊球衣訂做」、尺寸表、白板樣衣；欄杆後面訂做櫃台（螢幕、資料夾）、樣品桌；夾層下：獎盃櫃、貨架、後門。
  右：水壺雙面架（底層毛巾）＋端架運動襪吊卡；石材踏面的直跑樓梯（西側米白牆＋玻璃欄杆＋木扶手）；樓梯東側的牆上一塊大的樓層指示牌。
  上：挑空 7.6 m 的方格天花板、日光燈、黑色軌道燈；左牆上半一整排大窗（窗外行道樹）、窗型冷氣；二樓左牆衣架（滿滿的系隊球衣）、裁縫桌、布料捲、玻璃樣衣間。
  參考圖鏡頭看不到的：左牆球鞋牆＋試穿椅、東邊球鞋牆、收銀台、店門。
球、衣服、水壺、鞋、日光燈都是 instancing（同一個網格放很多個）。沒有任何真實品牌（D77）；店名、系名虛構。
節點：L0_*＝一樓（含樓梯）、L1_*＝二樓（樓板、欄杆、二樓的東西、挑空的天花板和燈）；牆 WALL_<side>_L0_*（一樓高度那一段）、WALL_<side>_L1_*。
尺寸（照真實）：籃球 ø0.24、排球 ø0.21、網球 ø0.066；運動 T 長 0.70、衣架肩寬 0.42；水壺 ø0.075 × 0.27；樓梯一階 0.1786 × 0.255；欄杆扶手 1.05 m（夾層）、0.92 m（樓梯）。"""
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

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'xinsheng_sports_layout.js')]))
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'xs_atlas.json')))
W, D, H1, HT = LAY['w'], LAY['d'], LAY['h'], LAY['hTotal']   # 14.4、16、一樓天花板 3.4、挑空 7.6
SL = LAY['slab']; Y1, YB = SL['top'], SL['bottom']             # 二樓樓板頂 3.75、底 3.45
HOLE = SL['hole']; ZB2 = LAY['upperBack']                      # 樓梯洞；二樓後牆 z −3.6
ST = LAY['stairs']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT      # 內面 x ±7.08、z ±7.88
FIN0, FIN1 = ST['x1'], ST['x1'] + 0.12                         # 樓梯東側的牆 x 3.7～3.82
IT = {}
for it in LAY['items']: IT.setdefault(it['kind'], []).append(it)
I1 = lambda k: IT[k][0]
random.seed(1104)
B.reset(texres=1024)
root = B.group('xinsheng_sports_interior', props={'kind': 'xinsheng_sports_interior', 'w': W, 'd': D, 'h': H1, 'hTotal': HT, 'layout': 3})
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
LIGHTS = {'tubes': [], 'spots': []}


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


P = 'xs_'
# 12 個材質（兩層共用）：地磚（自製）、牆、天花板、木頭、石材（Poly Haven CC0）＋頂點色（霧面、金屬）＋玻璃＋透明圖集、印刷圖集、會亮的、招牌
M = {
    'floor': img_mat(P + 'floor_tile', 'xs_floor.png', rough=0.32, tile=1.8),
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#c9b69c', normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'ceil': L.pbr(P + 'ceiling', 'ceiling_interior', tile=0.6, target='#c2ae92', maps=('diff',), res=512, rough_value=0.92, cull=True),
    'wood': L.pbr(P + 'wood', 'fine_grained_wood', tile=0.9, target='#b48654', normal=0.45, maps=('diff', 'nor'), res=512, rough_value=0.5),
    'stone': L.pbr(P + 'stone', 'granite_tile_03', tile=1.0, target='#9d968c', normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.45),
    'vc': L.vc_material(P + 'vc', rough=0.62), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.35, metal=0.4),
    'glass': L.flat(P + 'glass', '#dfe9e8', rough=0.04, alpha=0.12),
    'emit': img_mat(P + 'emit', 'xs_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha', 'xs_alpha.png', rough=0.5, clip=True, metal=0.2),
    'goods': img_mat(P + 'goods', 'xs_goods.png', rough=0.55),
    'sign': img_mat(P + 'sign', 'xs_sign.png', rough=0.5),
}
G3 = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))   # 遊戲 → Blender 的旋轉


def rot(axis, a): return Matrix.Rotation(a, 3, axis)   # 遊戲座標的軸（Y＝往上；+a 從 +z 轉向 +x）


def fm(o, R=None, s=None):
    R = R if R is not None else Matrix.Identity(3)
    T = Matrix.Translation(g2b(*o)) @ (G3 @ R @ G3.inverted()).to_4x4()
    return T @ Matrix.Scale(s, 4) if s else T


class UM:
    """有 UV 的網格（貼圖集）：每個面自己給 UV"""
    def __init__(self, name, mat): self.name, self.mat, self.bm = name, mat, bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def face(self, pts, uvs, smooth=False):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, t in zip(f.loops, uvs): lp[self.uv].uv = t
        f.smooth = smooth; return f

    def rect(self, c, r, up, hw, hh, uvr, both=False, rotuv=0):
        c, r, up = Vector(c), Vector(r), Vector(up); u0, v0, u1, v1 = uvr
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        if rotuv == 90: uvs = [(u1, v0), (u1, v1), (u0, v1), (u0, v0)]   # 圖集裡逆時針轉 90° 放的圖（樓層指示牌）
        f = self.face([c - r * hw - up * hh, c + r * hw - up * hh, c + r * hw + up * hh, c - r * hw + up * hh], uvs)
        if both:
            o = -r.cross(up).normalized() * 0.001
            self.face([c - r * hw + up * hh + o, c + r * hw + up * hh + o, c + r * hw - up * hh + o, c - r * hw - up * hh + o], [uvs[3], uvs[2], uvs[1], uvs[0]])
        return f

    FACES = {'+x': ((1, 0, 0), (0, 0, -1), (0, 1, 0)), '-x': ((-1, 0, 0), (0, 0, 1), (0, 1, 0)), '+z': ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
             '-z': ((0, 0, -1), (-1, 0, 0), (0, 1, 0)), '+y': ((0, 1, 0), (1, 0, 0), (0, 0, -1)), '-y': ((0, -1, 0), (1, 0, 0), (0, 0, 1))}

    def box(self, cx, cy, cz, w, h, d, cell, front='+z', side=None, skip=('-y',), cells=None):
        uvr = ATL[cell] if isinstance(cell, str) else cell; u0, v0, u1, v1 = uvr
        sid = side if side is not None else (u0, v0 + (v1 - v0) * 0.4, u0 + (u1 - u0) * 0.04, v0 + (v1 - v0) * 0.6)
        hs = (w / 2, h / 2, d / 2)
        for k, (n, r, up) in self.FACES.items():
            if k in skip: continue
            c = (cx + n[0] * hs[0], cy + n[1] * hs[1], cz + n[2] * hs[2])
            hw = sum(abs(r[i]) * hs[i] for i in range(3)); hh = sum(abs(up[i]) * hs[i] for i in range(3))
            uu = (ATL[cells[k]] if isinstance(cells[k], str) else cells[k]) if cells and k in cells else (uvr if k == front else sid)
            self.rect(c, r, up, hw, hh, uu)

    def sphere(self, ctr, r, cell, seg=10, rings=7):
        """UV 球（球面展開貼圖：u 繞一圈、v 北極→南極）"""
        u0, v0, u1, v1 = ATL[cell]; cx, cy, cz = ctr
        def P_(i, j):
            ph = math.pi * i / rings; th = 2 * math.pi * j / seg
            return (cx + r * math.sin(ph) * math.cos(th), cy + r * math.cos(ph), cz + r * math.sin(ph) * math.sin(th))
        def UV(i, j): return (u0 + (u1 - u0) * j / seg, v1 - (v1 - v0) * i / rings)
        for i in range(rings):
            for j in range(seg):
                if i == 0: self.face([P_(0, j), P_(1, j + 1), P_(1, j)], [UV(0, j + 0.5), UV(1, j + 1), UV(1, j)], smooth=True)
                elif i == rings - 1: self.face([P_(i, j), P_(i, j + 1), P_(i + 1, j)], [UV(i, j), UV(i, j + 1), UV(i + 1, j + 0.5)], smooth=True)
                else: self.face([P_(i, j), P_(i, j + 1), P_(i + 1, j + 1), P_(i + 1, j)], [UV(i, j), UV(i, j + 1), UV(i + 1, j + 1), UV(i + 1, j)], smooth=True)

    def empty(self): return len(self.bm.faces) == 0

    def finish(self, parent, weld=False):
        if self.empty(): self.bm.free(); return None
        if weld: bmesh.ops.remove_doubles(self.bm, verts=self.bm.verts, dist=1e-5)
        self.bm.normal_update(); ob = B.mesh_obj(self.name, self.bm, self.mat, parent)
        if weld:
            for p in ob.data.polygons: p.use_smooth = True
        return ob


UVK = ('goods', 'alpha', 'emit', 'sign')


def lvname(lv, side, name, key): return (f'WALL_{side}_L{lv}_' if side else f'L{lv}_') + f'{name}_{key}'


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組；lv＝哪一層"""
    def __init__(self, name, lv=0, side=None, T=None, smooth=True, weld=False):
        self.name, self.lv, self.side, self.T, self.smooth, self.weld, self.m = name, lv, side, T, smooth, weld, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = lvname(self.lv, self.side, self.name, key)
            self.m[key] = L.CMesh(nm, M[key]) if key in ('vc', 'vcm') else (UM(nm, M[key]) if key in UVK else Mesh(nm, M[key]))
        return self.m[key]

    def done(self):
        obs = []
        for key, m in self.m.items():
            if isinstance(m, UM): ob = m.finish(root, weld=self.weld)
            elif isinstance(m, L.CMesh): ob = m.finish(root, uv=False)
            else: ob = m.finish(root, uv=True)
            if ob is None: continue
            if self.T is not None: ob.matrix_basis = self.T
            if self.side: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign', 'goods', 'alpha', 'emit', 'stone'): L.smooth_mesh(ob, angle=0.6)
            obs.append(ob)
        self.m = {}; return obs


def inst(obs, name, T, lv, side=None):
    out = []
    for ob in obs:
        key = ob.name.rsplit('_', 1)[-1]
        no = bpy.data.objects.new(lvname(lv, side, name, key), ob.data); B.scene().collection.objects.link(no); no.parent = root
        no.matrix_basis = T
        if side: no['dir'] = DIRS[side]
        out.append(no)
    return out


class Proto:
    """原型：第一次 place 時建網格，之後共用（同一個原型放在兩層時，每層各一個網格：預算照層算）"""
    def __init__(self, name, build, side=None, weld=False): self.name, self.build, self.side, self.weld, self.obs, self.n = name, build, side, weld, {}, 0

    def place(self, T, lv=0):
        self.n += 1
        if lv not in self.obs:
            pt = Part(f'{self.name}_0', lv=lv, side=self.side, T=T, weld=self.weld); self.build(pt); self.obs[lv] = pt.done(); return
        inst(self.obs[lv], f'{self.name}_{self.n}', T, lv, self.side)


class _N0:
    """「這之後新加的面」：先記住原本有哪些面（bmesh 的面順序不保證新面在最後：好拍子代理發現 create_cone 之後用 index 取會塗到別的零件）"""
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


def cell_(c, rx, ry, rz, ctr, col, seg=10, rings=6, R=None):
    n0 = _N0(c); c.ell(ctr, rx, ry, rz, seg=seg, rings=rings, matrix=(G3 @ R @ G3.inverted()).to_4x4() if R is not None else None); return c.paint(_new(c, n0), col)


def loft(c, rings, seg, colf, cap0=True, cap1=True):
    """一圈一圈的橢圓接起來（人台的身體、衣服、褲管）：rings＝[(y, rx, rz, ox, oz)]；colf(帶, 角度)→色碼"""
    vs = []
    for (y, rx, rz, ox, oz) in rings:
        vs.append([c.bm.verts.new(g2b(ox + rx * math.cos(2 * math.pi * k / seg), y, oz + rz * math.sin(2 * math.pi * k / seg))) for k in range(seg)])
    for b in range(len(rings) - 1):
        for k in range(seg):
            j = (k + 1) % seg; f = c.bm.faces.new((vs[b][k], vs[b][j], vs[b + 1][j], vs[b + 1][k]))
            c.paint([f], colf(b, 2 * math.pi * (k + 0.5) / seg))
    caps = []
    if cap0: caps.append(c.bm.faces.new(list(reversed(vs[0]))))
    if cap1: caps.append(c.bm.faces.new(vs[-1]))
    for f in caps: c.paint([f], colf(0 if f is caps[0] and cap0 else len(rings) - 2, 0.0))
    new = [f for row in vs for v in row for f in v.link_faces]
    bmesh.ops.recalc_face_normals(c.bm, faces=list(set(new)))


def jit(hexcol, k=0.06):
    f = 1 + random.uniform(-k, k); return '#' + ''.join(f'{min(255, max(0, int(int(hexcol[i:i + 2], 16) * f))):02x}' for i in (1, 3, 5))


def sub(cellname, a0, b0, a1, b1):
    u0, v0, u1, v1 = ATL[cellname]; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


def lvof(y): return 1 if y >= Y1 - 0.01 else 0


# ======================================================================
# 衣服原型（自己的座標：掛勾頂端在原點、正面朝 +z）：前後兩片曲面＋側邊封起來；肩斜、袖子、領口、下襬波浪、垂下來的布紋；木頭衣架
# ======================================================================
TS_FULL = [0.0, 0.06, 0.14, 0.24, 0.27, 0.42, 0.58, 0.74, 0.88, 1.0]
TS_LITE = [0.0, 0.14, 0.27, 0.55, 0.8, 1.0]


def garment_into(c, style, col, trim=None, flat=1.0, lite=False, hanger='#b98a58', side_col=None, scale=1.0):
    trim = trim or col; TS = TS_LITE if lite else TS_FULL; NC = 3 if lite else 4
    if style == 'tee': Ln, prof = 0.70, [(0.0, 0.20), (0.06, 0.30), (0.14, 0.35), (0.24, 0.355), (0.27, 0.25), (0.42, 0.252), (0.58, 0.256), (0.74, 0.26), (0.88, 0.263), (1.0, 0.266)]
    elif style == 'jersey': Ln, prof = 0.74, [(0.0, 0.12), (0.06, 0.13), (0.14, 0.17), (0.24, 0.235), (0.27, 0.258), (0.42, 0.262), (0.58, 0.265), (0.74, 0.268), (0.88, 0.27), (1.0, 0.272)]
    elif style == 'jacket': Ln, prof = 0.72, [(0.0, 0.2), (0.06, 0.32), (0.14, 0.36), (0.24, 0.36), (0.27, 0.36), (0.42, 0.34), (0.58, 0.33), (0.74, 0.32), (0.88, 0.3), (1.0, 0.28)]
    else: Ln, prof = 0.50, [(0.0, 0.24), (0.06, 0.245), (0.14, 0.25), (0.24, 0.255), (0.27, 0.26), (0.42, 0.265), (0.58, 0.272), (0.74, 0.28), (0.88, 0.286), (1.0, 0.29)]
    hw_at = lambda t: next(v for (tt, v) in prof if abs(tt - t) < 1e-6) if any(abs(tt - t) < 1e-6 for tt, _ in prof) else \
        [prof[i][1] + (prof[i + 1][1] - prof[i][1]) * (t - prof[i][0]) / (prof[i + 1][0] - prof[i][0]) for i in range(len(prof) - 1) if prof[i][0] <= t <= prof[i + 1][0]][0]
    top = -0.075 if style == 'shorts' else -0.085; ph = {'tee': 0.4, 'jersey': 1.3, 'shorts': 2.1, 'jacket': 0.9}[style]
    S_ = scale; F, K = [], []
    for r, t in enumerate(TS):
        rf, rk = [], []; hw = hw_at(t)
        for cc in range(NC + 1):
            u = -1 + 2 * cc / NC; x = hw * u; y = top - t * Ln
            if style in ('tee', 'jacket') and t < 0.26: y -= 0.11 * max(0.0, abs(x) - 0.11) / 0.25
            if style == 'jersey' and r == 0: y -= 0.12 * max(0.0, 1 - (x / 0.105) ** 2)
            if style in ('tee', 'jacket') and r == 0: y -= 0.045 * max(0.0, 1 - (x / 0.1) ** 2)
            if style == 'shorts' and t > 0.55: y += 0.17 * max(0.0, 1 - abs(x) / 0.12) * (t - 0.55) / 0.45
            if r == len(TS) - 1: y += 0.012 * math.sin(x * 16 + ph)
            th = (0.012 + 0.032 * math.sqrt(max(0.0, 1 - u * u))) * flat * (1.25 if style == 'jacket' else 1.0)
            if style in ('tee', 'jacket') and t < 0.26 and abs(x) > 0.2: th *= 0.55
            fold = 0.011 * t * math.sin(x * 21 + ph) * flat
            rf.append(c.bm.verts.new(g2b(x * S_, y * S_, (th + fold) * S_))); rk.append(c.bm.verts.new(g2b(x * S_, y * S_, (-th + fold * 0.5) * S_)))
        F.append(rf); K.append(rk)

    def face(vs, hx_):
        f = c.bm.faces.new(vs); c.paint([f], hx_)
    NR = len(TS) - 1
    for r in range(NR):
        for cc in range(NC):
            tr = (style == 'jersey' and TS[r] < 0.27 and cc in (0, NC - 1)) or (style == 'shorts' and cc in (0, NC - 1))
            hx_ = trim if (tr or (r == 0 and style != 'tee') or (style == 'jersey' and r == NR - 1)) else col
            face([F[r][cc], F[r][cc + 1], F[r + 1][cc + 1], F[r + 1][cc]], hx_); face([K[r][cc + 1], K[r][cc], K[r + 1][cc], K[r + 1][cc + 1]], hx_)
        sc = side_col if (side_col and TS[r] >= 0.27) else (trim if style != 'tee' else col)
        face([F[r + 1][0], K[r + 1][0], K[r][0], F[r][0]], sc); face([F[r][NC], K[r][NC], K[r + 1][NC], F[r + 1][NC]], sc)
    for cc in range(NC):
        face([F[0][cc + 1], F[0][cc], K[0][cc], K[0][cc + 1]], col); face([F[NR][cc], F[NR][cc + 1], K[NR][cc + 1], K[NR][cc]], col)
    if hanger:
        parts = [((0, 0.0, 0), (0.028, -0.018, 0)), ((0.028, -0.018, 0), (0.0, -0.05, 0))]
        if style == 'shorts': parts += [((0, -0.05, 0), (0, -0.07, 0)), ((-0.23, -0.07, 0), (0.23, -0.07, 0))]
        else: parts += [((0, -0.05, 0), (-0.2, -0.1, 0)), ((0, -0.05, 0), (0.2, -0.1, 0))]
        for a, b in parts:
            a = tuple(v * S_ for v in a); b = tuple(v * S_ for v in b)
            ccyl(c, a, b, (0.004 if b[1] > -0.06 * S_ else 0.011) * S_, '#9a9ea2' if b[1] > -0.06 * S_ else hanger, seg=4, caps=False)


def garment_proto(name, style, col, trim=None, flat=1.0, lite=False, side_col=None, decal=None, scale=1.0, hanger='#b98a58'):
    def f(pt):
        garment_into(pt['vc'], style, col, trim, flat=flat, lite=lite, side_col=side_col, scale=scale, hanger=hanger)
        if decal:   # 胸前的字（系名＋號碼）：貼在前片外面 3 mm
            th = (0.012 + 0.032) * flat * scale + 0.003
            pt['goods'].rect((0, -0.33 * scale, th), (1, 0, 0), (0, 1, 0), 0.15 * scale, 0.15 * scale, ATL[decal])
    return Proto(name, f)


COL = {'navy': '#1f2d55', 'deepnavy': '#17213f', 'red': '#b8242c', 'white': '#efefea', 'royal': '#2950a8', 'maroon': '#6a1c26', 'green': '#2f6b45',
       'lightblue': '#8fb8de', 'black': '#26272b', 'grey': '#8d9196', 'heather': '#b9bcbf', 'orange': '#d8742c', 'sky': '#3a6ac0'}
TRIM = {'navy': '#efefea', 'deepnavy': '#d9b45a', 'red': '#efefea', 'white': '#1f2d55', 'royal': '#efefea', 'maroon': '#e9e2cf', 'green': '#efefea',
        'lightblue': '#1f2d55', 'black': '#d8742c', 'grey': '#26272b', 'heather': '#1f2d55', 'orange': '#26272b', 'sky': '#efefea'}
_GP = {}


def G_(style, cn, lite=False, flat=1.0):
    k = (style, cn, lite, flat)
    if k not in _GP: _GP[k] = garment_proto(f'{style}_{cn}' + ('_l' if lite else '') + ('_f' if flat < 1 else ''), style, COL[cn], TRIM[cn] if style != 'tee' else None, flat=flat, lite=lite)
    return _GP[k]


# ======================================================================
# 球、水壺、鞋、背包、日光燈的原型
# ======================================================================
def ball_proto(name, cell, r, seg, rings):
    def f(pt): pt['goods'].sphere((0, r, 0), r, cell, seg=seg, rings=rings)
    return Proto(name, f, weld=True)


BALL_B = ball_proto('bball', 'basket', 0.121, 10, 6)
BALL_V = ball_proto('vball', 'volley', 0.105, 9, 6)
BALL_T = ball_proto('tball', 'tennis', 0.033, 6, 3)
BOTTLE_COLS = [('#e8a8b0', '#f2f2ee'), ('#9cc6e4', '#2a2c30'), ('#2c3e66', '#c9ccce'), ('#e9e6df', '#2a2c30'), ('#7a9a76', '#e9e6df'), ('#b8bcc0', '#2a2c30'),
               ('#e8873a', '#f2f2ee'), ('#5d8fc8', '#e9e6df'), ('#d07a80', '#2a2c30')]


def bottle_build(body, cap):
    def f(pt):
        c = pt['vc']
        clathe(c, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.235), (0.036, 0.262), (0.026, 0.27)], 0, 0, 0, body, seg=7)
        clathe(c, [(0.028, 0.0), (0.028, 0.036), (0.0, 0.04)], 0, 0.27, 0, cap, seg=7)
        c.cbox(-0.007, 0.007, 0.29, 0.315, 0.018, 0.046, cap)
    return f


BOTTLE = [Proto(f'bottle{i}', bottle_build(*bc)) for i, bc in enumerate(BOTTLE_COLS)]
SHOE_COLS = [('#f2f0ea', '#f2f0ea', '#1f2d55'), ('#26272b', '#f2f0ea', '#26272b'), ('#2950a8', '#f2f0ea', '#f2f0ea'), ('#b8242c', '#f2f0ea', '#26272b'),
             ('#e9e6df', '#c88f5a', '#2f6b45'), ('#8d9196', '#26272b', '#d8742c'), ('#f2f0ea', '#26272b', '#c8202a')]


def shoe_build(upper, sole, accent):
    """一隻球鞋（自己的座標：鞋底中心在原點、鞋尖朝 +x）：鞋底、鞋身（橢球壓扁）、鞋跟、鞋口、側邊的線條"""
    def f(pt):
        c = pt['vc']
        c.cbox(-0.145, 0.145, 0.0, 0.03, -0.048, 0.048, sole)
        cell_(c, 0.13, 0.065, 0.044, (0.005, 0.045, 0.0), upper, seg=8, rings=4)
        cell_(c, 0.05, 0.05, 0.042, (-0.1, 0.07, 0.0), upper, seg=6, rings=3)
        c.cbox(-0.12, -0.04, 0.095, 0.105, -0.03, 0.03, '#26272b')
        c.cbox(-0.04, 0.07, 0.04, 0.075, -0.047, 0.047, accent)
    return f


SHOE = [Proto(f'shoe{i}', shoe_build(*sc)) for i, sc in enumerate(SHOE_COLS)]


def fixture_build(pt):
    """v3b：1.2 × 0.3 m 嵌入式日光燈（和輕鋼架天花板齊平：白色鋁框＋發光的面板，都只朝下）——
    從天花板上面看（遊戲鏡頭在天花板以上時）和天花板一樣看不到，不會浮在半空（v3 的吸頂燈座是方塊，從上面看會浮著）"""
    u, cf = pt['emit'], pt['ceil']
    tu = ATL['tube']; tuv = ((tu[0] + tu[2]) / 2, (tu[1] + tu[3]) / 2)
    q = lambda x0, x1, z0, z1, y: [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]
    u.face(q(-0.58, 0.58, -0.13, 0.13, -0.006), [tuv] * 4)
    for (x0, x1, z0, z1) in ((-0.62, 0.62, -0.17, -0.13), (-0.62, 0.62, 0.13, 0.17), (-0.62, -0.58, -0.13, 0.13), (0.58, 0.62, -0.13, 0.13)):
        cf.quad(q(x0, x1, z0, z1, -0.007))


FIXP = Proto('fixture', fixture_build)


def spot_build(pt):
    """軌道燈頭（黑色圓筒、往下斜照）：自己的座標掛點在原點，燈頭往 −y、往 +z 斜 35°"""
    c = pt['vcm']; R = rot('X', -0.6)
    crb(c, -0.025, 0.025, -0.06, 0.0, -0.025, 0.025, '#1c1c1e', r=0.008)
    a = Vector((0, -0.06, 0)); b = a + R @ Vector((0, -0.16, 0))
    ccyl(c, tuple(a), tuple(b), 0.042, '#1c1c1e', seg=10)
    sp = ATL['spot']; suv = ((sp[0] + sp[2]) / 2, (sp[1] + sp[3]) / 2); e = b + R @ Vector((0, -0.002, 0))
    n_ = (R @ Vector((0, -1, 0))).normalized(); t1 = Vector((1, 0, 0)); t2 = n_.cross(t1)
    pts = [tuple(e + (t1 * math.cos(2 * math.pi * k / 10) + t2 * math.sin(2 * math.pi * k / 10)) * 0.036) for k in range(10)]
    pt['emit'].face(list(reversed(pts)), [suv] * 10)


SPOTP = Proto('spot', spot_build)

# ======================================================================
# 房間殼：地、樓板、天花板、牆（淡出的組）
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
# 二樓樓板（頂面＝地磚、底面看不到：一樓有吊頂）：三塊（樓梯洞的兩邊＋洞後面）
sb = Part('slab', lv=1, smooth=False)
for (xa, xb, za, zb) in ((XI0, HOLE['x0'], ZI0, 0.0), (HOLE['x0'], HOLE['x1'], ZI0, HOLE['z0']), (HOLE['x1'], XI1, ZI0, 0.0)):
    sb['floor'].box(xa, xb, YB, Y1, za, zb)
sb.done()
# 夾層前緣（深藍的招牌帶：西段畫主招牌、東段素色）、樓梯洞的兩側樓板邊
fa = Part('fascia', lv=1, smooth=False)
FA0, FA1 = 2.85, Y1 + 0.03
crb(fa['vc'], XI0, HOLE['x0'], FA0, FA1, 0.0, 0.06, '#1f3780', r=0.004)
crb(fa['vc'], HOLE['x1'], XI1, FA0, FA1, 0.0, 0.06, '#1f3780', r=0.004)
crb(fa['vc'], HOLE['x1'] + 0.12, XI1, FA0 + 0.08, FA0 + 0.14, 0.06, 0.065, '#e8782a', r=0.0)
fa['sign'].rect(((XI0 + HOLE['x0']) / 2, (FA0 + FA1) / 2, 0.064), (1, 0, 0), (0, 1, 0), (HOLE['x0'] - XI0) / 2 - 0.01, (FA1 - FA0) / 2 - 0.01, ATL['banner_main'])
for xx in (HOLE['x0'], HOLE['x1']): fa['wall'].box(xx - 0.02, xx + 0.02, YB - 0.05, Y1, HOLE['z0'], 0.06)
fa['wall'].box(HOLE['x0'], HOLE['x1'], YB - 0.05, Y1, HOLE['z0'] - 0.02, HOLE['z0'] + 0.02)
fa.done()
# 天花板：一樓（夾層下 3.4）、挑空和二樓（7.6）；輕鋼架（60 cm 方格，只做朝下的一片）
ce = Part('ceiling', smooth=False); ce1 = Part('ceiling', lv=1, smooth=False)
UNDER = [(XI0, ST['x0'] - 0.12, ZI0, 0.0), (FIN1, XI1, ZI0, 0.0), (ST['x0'] - 0.12, FIN1, ZI0, HOLE['z0'] - 0.12)]
for (xa, xb, za, zb) in UNDER: ce['ceil'].quad([(xa, H1, za), (xb, H1, za), (xb, H1, zb), (xa, H1, zb)])
ce1['ceil'].quad([(XI0, HT, ZB2), (XI1, HT, ZB2), (XI1, HT, ZI1), (XI0, HT, ZI1)])
for (p_, y_, rects) in ((ce, H1, UNDER), (ce1, HT, [(XI0, XI1, ZB2, ZI1)])):
    for (xa, xb, za, zb) in rects:
        x = math.ceil((xa + 0.05) / 0.6) * 0.6
        while x < xb - 0.05: p_['ceil'].quad([(x - 0.012, y_ - 0.004, za), (x + 0.012, y_ - 0.004, za), (x + 0.012, y_ - 0.004, zb), (x - 0.012, y_ - 0.004, zb)]); x += 0.6
        z = math.ceil((za + 0.05) / 0.6) * 0.6
        while z < zb - 0.05: p_['ceil'].quad([(xa, y_ - 0.004, z - 0.012), (xb, y_ - 0.004, z - 0.012), (xb, y_ - 0.004, z + 0.012), (xa, y_ - 0.004, z + 0.012)]); z += 0.6
ce.done(); ce1.done()
# 一樓吊頂的邊（夾層前緣下面、樓梯旁：牆色的封板）
cb = Part('ceil_edge', smooth=False); cb['wall'].box(XI0, ST['x0'] - 0.12, H1 - 0.02, YB, -0.02, 0.0); cb['wall'].box(FIN1, XI1, H1 - 0.02, YB, -0.02, 0.0); cb.done()


def wall_band(side, lv, y0, y1, a0, a1, holes=()):
    """一面牆的一段（y0～y1、沿牆 a0～a1），挖掉 holes＝[(a0,a1,y0,y1)]：牆是好幾塊方盒拼的（single_side 的 nodup 排除牆材質，不會補反面變黑）"""
    p = Part('wall', lv=lv, side=side, smooth=False); w = p['wall']
    def bx(a, b, ya, yb):
        if b - a < 1e-3 or yb - ya < 1e-3: return
        if side == 'left': w.box(X0, XI0, ya, yb, a, b)
        elif side == 'right': w.box(XI1, X1, ya, yb, a, b)
        elif side == 'front': w.box(a, b, ya, yb, ZI1, Z1)
        else: w.box(a, b, ya, yb, Z0 if lv == 0 else ZB2 - WT, ZI0 if lv == 0 else ZB2)
    hs = sorted(holes); cur = a0
    for (ha, hb, hy0, hy1) in hs:
        bx(cur, ha, y0, y1); bx(ha, hb, y0, max(y0, hy0)); bx(ha, hb, min(y1, hy1), y1); cur = hb
    bx(cur, a1, y0, y1); return p


LW = LAY['leftWindow']; LWB = (-3.3, -0.3, 4.4, 7.2)   # 二樓左牆的窗（z −3.3～−0.3）
pw = wall_band('left', 0, 0.0, Y1, ZI0, ZI1, [(LW['z0'], LW['z1'], LW['y0'], 9)])
crb(pw['vc'], XI0, XI0 + 0.015, 0, 0.1, ZI0, ZI1, '#6e6250', r=0); pw.done()
wall_band('left', 1, Y1, HT, ZB2, ZI1, [(LW['z0'], LW['z1'], 0, LW['y1']), (LWB[0], LWB[1], LWB[2], LWB[3])]).done()
pr_ = wall_band('right', 0, 0.0, Y1, ZI0, ZI1); crb(pr_['vc'], XI1 - 0.015, XI1, 0, 0.1, ZI0, ZI1, '#6e6250', r=0); pr_.done()
wall_band('right', 1, Y1, HT, ZB2, ZI1).done()
BD = LAY['backDoor']; bdx0, bdx1 = BD['x'] - BD['w'] / 2, BD['x'] + BD['w'] / 2
pb_ = wall_band('back', 0, 0.0, YB, XI0, XI1, [(bdx0, bdx1, 0.0, BD['h'])]); crb(pb_['vc'], XI0, XI1, 0, 0.1, ZI0, ZI0 + 0.015, '#6e6250', r=0); pb_.done()
wall_band('back', 1, Y1, HT, XI0, XI1).done()
FR = LAY['front']; dx, dw = FR['door']['x'], FR['door']['w']
fh = [(dx - dw / 2, dx + dw / 2, 0.0, 2.4)] + [(a, b, FR['sill'], FR['head']) for a, b in FR['windows']]
wall_band('front', 0, 0.0, Y1, XI0, XI1, fh).done()
UP = FR['upper']; wall_band('front', 1, Y1, HT, XI0, XI1, [(UP['x0'], UP['x1'], UP['y0'], UP['y1'])]).done()
# 樓梯東側的牆（一樓：z −2.055～3.3 到樓板底；樓板以上：z 0～3.3 到天花板）
fw = Part('fin', smooth=False); fw['wall'].box(FIN0, FIN1, 0.0, YB, HOLE['z0'], ST['z1']); fw['wall'].box(FIN0, FIN1, YB, HT, 0.0, ST['z1'])
fw['stone'].box(FIN0 - 0.012, FIN0, 0.0, 0.1, ST['z1'] - 0.01, ST['z1'] + 0.6); fw.done()
for cl in IT['column']:
    pc = Part('column', smooth=False); x, z, w_ = cl['x'], cl['z'], cl['w'] / 2
    pc['wall'].box(x - w_, x + w_, 0.0, YB, z - w_, z + w_); pc['stone'].box(x - w_ - 0.01, x + w_ + 0.01, 0.0, 0.1, z - w_ - 0.01, z + w_ + 0.01); pc.done()


# ---------------- 窗（鋁框、玻璃、窗外的樹）、窗型冷氣、店門、後門 ----------------
ALU = '#a9adb0'


def window_left(lv, z0, z1, y0, y1, nz=3, transom=None):
    p = Part('window', lv=lv, side='left'); cm = p['vcm']; x = XI0
    for k in range(nz + 1):
        z = z0 + (z1 - z0) * k / nz; crb(cm, x - 0.06, x + 0.03, y0, y1, z - 0.03, z + 0.03, ALU, r=0.006)
    for y in (y0, y1) + ((transom,) if transom else ()): crb(cm, x - 0.06, x + 0.03, y - 0.03, y + 0.03, z0, z1, ALU, r=0.006)
    p['glass'].quad([(x - 0.02, y0, z1), (x - 0.02, y0, z0), (x - 0.02, y1, z0), (x - 0.02, y1, z1)])
    crb(p['vc'], x, x + 0.18, y0 - 0.04, y0, z0, z1, '#d8d0c0', r=0.01)   # 窗台
    tr = ATL['trees']; p['goods'].rect((X0 - 1.2, (y0 + y1) / 2, (z0 + z1) / 2), (0, 0, -1), (0, 1, 0), (z1 - z0) / 2 + 1.0, (y1 - y0) / 2 + 0.6, tr)   # 窗外的行道樹
    p.done()


window_left(1, LW['z0'], LW['z1'], LW['y0'], LW['y1'], nz=5, transom=4.6)
window_left(1, LWB[0], LWB[1], LWB[2], LWB[3], nz=3)
ac = Part('aircon', lv=1, side='left'); c = ac['vc']; acz0, acz1 = 0.55, 1.25   # 窗型冷氣（白、出風口的格柵、下面一條水痕）
crb(c, XI0, XI0 + 0.55, 4.6, 5.3, acz0, acz1, '#e4e0d6', r=0.02, seg=2)
for k in range(9): c.cbox(XI0 + 0.551, XI0 + 0.556, 4.7 + k * 0.06, 4.73 + k * 0.06, acz0 + 0.05, acz1 - 0.3, '#8f8a80')
crb(c, XI0 + 0.551, XI0 + 0.556, 4.7, 5.2, acz1 - 0.25, acz1 - 0.05, '#cfcac0', r=0)
c.cbox(XI0, XI0 + 0.004, 3.9, 4.6, acz0 + 0.3, acz0 + 0.36, '#b5a88f')
ccyl(c, (XI0 + 0.3, 4.6, acz0 + 0.1), (XI0 + 0.3, 3.9, acz0 + 0.1), 0.01, '#e8e4da', seg=5)
ac.done()
pf = Part('front_frames', side='front')
for a, b, k in sorted([(a, b, 'win') for a, b in FR['windows']] + [(dx - dw / 2, dx + dw / 2, 'door')]):
    top = 2.4 if k == 'door' else FR['head']; y0 = 0.0 if k == 'door' else FR['sill']
    for j in range(3):
        x = a + j * (b - a) / 2; crb(pf['vcm'], x - 0.03, x + 0.03, y0, top, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    crb(pf['vcm'], a, b, top - 0.05, top, ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
    pf['glass'].quad([(b, y0 + 0.02, Z1 - 0.07), (a, y0 + 0.02, Z1 - 0.07), (a, top - 0.03, Z1 - 0.07), (b, top - 0.03, Z1 - 0.07)])
pf.done()
pfu = Part('front_upper', lv=1, side='front')
for k in range(12):
    x = UP['x0'] + (UP['x1'] - UP['x0']) * k / 11; crb(pfu['vcm'], x - 0.03, x + 0.03, UP['y0'], UP['y1'], ZI1 - 0.04, Z1 - 0.03, ALU, r=0.006)
pfu['glass'].quad([(UP['x1'], UP['y0'], Z1 - 0.07), (UP['x0'], UP['y0'], Z1 - 0.07), (UP['x0'], UP['y1'], Z1 - 0.07), (UP['x1'], UP['y1'], Z1 - 0.07)])
pfu.done()
pbd = Part('backdoor', side='back'); cm = pbd['vcm']                                    # 後門（玻璃雙開門，外面是亮的巷子；關著）
for x in (bdx0, (bdx0 + bdx1) / 2, bdx1): crb(cm, x - 0.035, x + 0.035, 0.0, BD['h'], ZI0, ZI0 + 0.06, ALU, r=0.006)
crb(cm, bdx0, bdx1, BD['h'] - 0.05, BD['h'], ZI0, ZI0 + 0.06, ALU, r=0.006); crb(cm, bdx0, bdx1, 0.0, 0.08, ZI0, ZI0 + 0.06, ALU, r=0.006)
pbd['glass'].quad([(bdx0, 0.08, ZI0 + 0.03), (bdx1, 0.08, ZI0 + 0.03), (bdx1, BD['h'] - 0.05, ZI0 + 0.03), (bdx0, BD['h'] - 0.05, ZI0 + 0.03)])
pbd['emit'].rect((BD['x'], BD['h'] / 2, Z0 - 0.3), (1, 0, 0), (0, 1, 0), BD['w'] / 2 + 0.2, BD['h'] / 2 + 0.1, ATL['street'])
for s in (-1, 1): ccyl(cm, (BD['x'] + s * 0.1, 0.9, ZI0 + 0.08), (BD['x'] + s * 0.1, 1.3, ZI0 + 0.08), 0.012, '#c9ccce', seg=6)
pbd.done()

# ======================================================================
# 燈：挑空和二樓的天花板（7.6）、夾層下（3.4）的雙管日光燈；軌道燈
# ======================================================================
FIX = [(x, z, HT) for x in (-5.4, -2.0, 1.4, 4.8) for z in (6.2, 3.6, 1.0, -1.3, -2.9)]
FIX += [(x, z, H1) for x in (-5.4, -2.8, -0.2) for z in (-1.3, -3.3, -5.3, -7.0)] + [(x, z, H1) for x in (5.4,) for z in (-1.3, -3.3, -5.3, -7.0)] + [(2.9, z, H1) for z in (-3.3, -5.3, -7.0)]
for x, z, y in FIX:
    lv = lvof(y); FIXP.place(fm((x, y, z)), lv); LIGHTS['tubes'].append([x, y - 0.05, z])
    CL.glow(root, 'tube', x, y - 0.12, z, color='rgba(255,244,226,1)', size=1.8, day=0.35, night=1.0)
TRK = [(-6.0, 0.8, -1.75, 7), (-5.6, -2.0, 2.2, 4)]
pt_ = Part('track', lv=1)
for (xa, xb, z, n) in TRK:
    crb(pt_['vcm'], xa, xb, HT - 0.04, HT, z - 0.02, z + 0.02, '#1c1c1e', r=0.004)
    for k in range(n):
        x = xa + (xb - xa) * (k + 0.5) / n; SPOTP.place(fm((x, HT - 0.04, z), rot('Y', 0.0 if z < 0 else math.pi)), 1)
        LIGHTS['spots'].append([x, HT - 0.2, z + (0.12 if z < 0 else -0.12), 0.0, -0.8, (-0.6 if z < 0 else 0.6)])
pt_.done()

# ======================================================================
# 一樓左前：鐵網球架（網球網籃、排球、籃球兩層、頂上日光燈）
# ======================================================================
br = I1('ball_rack'); bx0, bx1 = br['x'] - br['w'] / 2, br['x'] + br['w'] / 2; bz0, bz1 = br['z'] - br['d'] / 2, br['z'] + br['d'] / 2; bh = br['h']
pr = Part('ball_rack'); cm, c, ga, gd = pr['vcm'], pr['vc'], pr['alpha'], pr['goods']
GREY = '#6f7378'
for x in (bx0 + 0.02, bx1 - 0.02):
    for z in (bz0 + 0.02, (bz0 + bz1) / 2, bz1 - 0.02): crb(cm, x - 0.018, x + 0.018, 0.0, bh, z - 0.018, z + 0.018, GREY, r=0.004)
for y in br['tiers'] + [bh - 0.03]:
    crb(cm, bx0, bx1, y - 0.025, y, bz0, bz1, '#8e9297', r=0.004)
    crb(cm, bx1 - 0.01, bx1 + 0.012, y - 0.05, y + 0.02, bz0, bz1, '#9a9ea3', r=0.004)                  # 前緣的擋條（價目卡夾在上面）
g = ATL['grid']
for (y0_, y1_) in ((0.0, bh),):                                                                      # 背板、兩側的鐵網格
    ga.rect((bx0 + 0.005, (y0_ + y1_) / 2, (bz0 + bz1) / 2), (0, 0, 1), (0, 1, 0), (bz1 - bz0) / 2, (y1_ - y0_) / 2, (g[0], g[1], g[0] + (g[2] - g[0]) * (bz1 - bz0) / 0.5, g[1] + (g[3] - g[1]) * (y1_ - y0_) / 0.5), both=True)
    for z in (bz0, bz1): ga.rect((((bx0 + bx1) / 2), (y0_ + y1_) / 2, z), (1, 0, 0), (0, 1, 0), (bx1 - bx0) / 2, (y1_ - y0_) / 2, (g[0], g[1], g[0] + (g[2] - g[0]) * (bx1 - bx0) / 0.5, g[1] + (g[3] - g[1]) * (y1_ - y0_) / 0.5), both=True)
crb(cm, bx0, bx1 + 0.08, bh - 0.03, bh + 0.05, bz0, bz1, '#e8e6e0', r=0.008)                          # 頂上的燈箱（參考圖左上：架子頂上一支亮的燈）
pr['emit'].rect((bx1 + 0.04, bh - 0.04, (bz0 + bz1) / 2), (0, 0, -1), (1, 0, 0), (bz1 - bz0) / 2 - 0.05, 0.035, ATL['tube'])
LIGHTS['tubes'].append([bx1 + 0.04, bh - 0.06, (bz0 + bz1) / 2])
for i, y in enumerate(br['tiers']):
    z = bz0 + 0.25
    while z < bz1 - 0.2:
        gd.rect((bx1 + 0.013, y - 0.016, z), (0, 0, -1), (0, 1, 0), 0.045, 0.02, ATL[f'tag{[2, 1, 0, 0][i]}']); z += 0.62
gd.rect((bx1 + 0.014, br['tiers'][2] + 0.28, bz1 - 0.12), (0, 0, -1), (0, 1, 0), 0.07, 0.07, ATL['n_ball'])
pr.done()
# 網籃（三個，裡面滿滿的網球）
ty = br['tiers'][0]
for k in range(3):
    za, zb = bz0 + 0.65 + k * 0.6, bz0 + 1.2 + k * 0.6
    if zb > bz1: break
    p = Part(f'tbasket{k}'); u = p['alpha']; bw = ATL['basket_wire']; xa, xb = bx0 + 0.04, bx1 - 0.02; hb = 0.3
    for (cc, r_, up, hw, hh) in (((xb, ty + hb / 2, (za + zb) / 2), (0, 0, -1), (0, 1, 0), (zb - za) / 2, hb / 2), ((xa, ty + hb / 2, (za + zb) / 2), (0, 0, 1), (0, 1, 0), (zb - za) / 2, hb / 2),
                                 (((xa + xb) / 2, ty + hb / 2, zb), (1, 0, 0), (0, 1, 0), (xb - xa) / 2, hb / 2), (((xa + xb) / 2, ty + hb / 2, za), (-1, 0, 0), (0, 1, 0), (xb - xa) / 2, hb / 2)):
        u.rect(cc, r_, up, hw, hh, bw, both=True)
    crb(p['vcm'], xa, xb, ty + hb - 0.008, ty + hb, za, za + 0.008, '#e8e8e4', r=0); crb(p['vcm'], xa, xb, ty + hb - 0.008, ty + hb, zb - 0.008, zb, '#e8e8e4', r=0)
    p.done()
    for j in range(26):                                                                              # 網球堆（上面一層冒出來＋側面看得到的）
        bx_ = xa + 0.04 + (j % 6) * ((xb - xa - 0.08) / 5); bz_ = za + 0.05 + (j // 6) * ((zb - za - 0.1) / 5)
        h_ = ty + hb - 0.035 + random.uniform(-0.02, 0.03) - (0.02 if (j % 6) in (0, 5) else 0)
        BALL_T.place(fm((bx_ + random.uniform(-0.01, 0.01), h_, bz_ + random.uniform(-0.01, 0.01)), rot('Y', random.uniform(0, 6.28))))
    for j in range(3): BALL_T.place(fm((xb - 0.04, ty + 0.02 + (j % 3) * 0.07, za + 0.15), rot('Y', random.uniform(0, 6.28))))
# 排球（一層：前排＋後排）、籃球（兩層）
for (proto, y, r, gap) in ((BALL_V, br['tiers'][1], 0.105, 0.222), (BALL_B, br['tiers'][2], 0.121, 0.248), (BALL_B, br['tiers'][3], 0.121, 0.248)):
    for row, xo in ((0, bx1 - r - 0.03), (1, bx0 + r + 0.04)):
        z = bz0 + r + 0.02 + (gap / 2 if row else 0)
        while z < bz1 - r:
            proto.place(fm((xo + random.uniform(-0.01, 0.01), y, z), rot('Y', random.uniform(0, 6.28)) @ rot('X', random.uniform(-0.6, 0.6)))); z += gap + (0.0 if row == 0 else 0.12)

# ======================================================================
# 護具網牆（斜放）＋背包木地台
# ======================================================================
pw_ = I1('pad_wall'); PWT = fm((pw_['x'], 0, pw_['z']), rot('Y', pw_['ry'])); hl = pw_['len'] / 2; ph = pw_['h']
pp = Part('pad_wall', T=PWT); cm, c, ga, gd = pp['vcm'], pp['vc'], pp['alpha'], pp['goods']
for s in (-1, 1):
    crb(cm, s * hl - 0.02, s * hl + 0.02, 0.0, ph + 0.05, -0.02, 0.02, '#3a3c40', r=0.004)
    crb(cm, s * hl - 0.18, s * hl + 0.18, 0.0, 0.03, -0.2, 0.2, '#3a3c40', r=0.006)                     # 腳
ga.rect((0, (0.2 + ph) / 2, 0.0), (1, 0, 0), (0, 1, 0), hl, (ph - 0.2) / 2, (g[0], g[1], g[0] + (g[2] - g[0]) * pw_['len'] / 0.5, g[1] + (g[3] - g[1]) * (ph - 0.2) / 0.5), both=True)
crb(cm, -hl, hl, ph - 0.02, ph + 0.02, -0.02, 0.02, '#3a3c40', r=0.004)


def hook(x, y, Ln=0.12):
    ccyl(cm, (x, y, 0.0), (x, y + 0.01, Ln), 0.003, '#a0a4a8', seg=3)


for (px_, py_) in ((-0.5, 1.82), (-0.27, 1.82), (-0.5, 1.2), (-0.27, 1.2)):                       # 護膝（黑色、一對一對掛著；中間一塊護墊）
    hook(px_, py_ + 0.1); crb(c, px_ - 0.09, px_ + 0.09, py_ - 0.3, py_ + 0.08, 0.025, 0.1, '#232427', r=0.035, seg=2)
    cell_(c, 0.065, 0.085, 0.025, (px_, py_ - 0.1, 0.102), '#3a3c41', seg=8, rings=4)
    for k in range(3): c.cbox(px_ - 0.085, px_ + 0.085, py_ - 0.26 + k * 0.13, py_ - 0.254 + k * 0.13, 0.099, 0.102, '#45474c')
PK = [['p_wrist', 'p_elbow', 'p_wrist', 'p_tape'], ['p_elbow', 'p_wrist', 'p_ankle', 'p_wrist'], ['p_ankle', 'p_band', 'p_wrist', 'p_tape']]
for r_, row in enumerate(PK):
    y = 1.92 - r_ * 0.42
    for k, nm in enumerate(row):
        x = 0.02 + k * 0.15; hook(x, y + 0.02)
        for j in range(3): gd.box(x, y - 0.13 - j * 0.004, 0.03 + j * 0.012, 0.13, 0.2, 0.006, nm, front='+z', skip=('-y', '-z'))
for k, x in enumerate((-0.36, 0.25)): gd.rect((x, 0.62, 0.006), (1, 0, 0), (0, 1, 0), 0.07, 0.07, ATL[['n_try', 'n_print'][k]])
for k, (x, y) in enumerate(((-0.36, 1.48), (0.25, 1.98), (0.25, 1.56))): gd.rect((x, y, 0.006), (1, 0, 0), (0, 1, 0), 0.045, 0.02, ATL[f'tag{3 + k % 2}'])
pp.done()
bp = I1('bag_platform'); px0_, px1_ = bp['x'] - bp['w'] / 2, bp['x'] + bp['w'] / 2; pz0_, pz1_ = bp['z'] - bp['d'] / 2, bp['z'] + bp['d'] / 2
pl = Part('bag_platform'); pl['wood'].rbox(px0_, px1_, 0.03, bp['h'], pz0_, pz1_, r=0.01); crb(pl['vc'], px0_ + 0.03, px1_ - 0.03, 0.0, 0.03, pz0_ + 0.03, pz1_ - 0.03, '#2a2622', r=0.004)
pl['goods'].rect((px1_ - 0.12, bp['h'] - 0.06, pz1_ + 0.004), (1, 0, 0), (0, 1, 0), 0.05, 0.025, ATL['tag5']); pl.done()


def bag_build(body, trim, pocket=None):
    """後背包（自己的座標：底面中心在原點、正面朝 +z）：主袋、前袋、拉鍊、提把、背帶、側袋"""
    pocket = pocket or body
    def f(pt):
        c = pt['vc']
        crb(c, -0.15, 0.15, 0.0, 0.45, -0.1, 0.09, body, r=0.07, seg=2)
        crb(c, -0.12, 0.12, 0.04, 0.26, 0.06, 0.14, pocket, r=0.04, seg=1)
        crb(c, -0.11, 0.11, 0.25, 0.262, 0.11, 0.128, trim, r=0.004); crb(c, -0.135, 0.135, 0.36, 0.373, 0.07, 0.092, trim, r=0.004)
        for s in (-1, 1):
            crb(c, s * 0.15 - 0.03, s * 0.15 + 0.03, 0.03, 0.2, -0.06, 0.05, jit(body, 0.1), r=0.02)      # 側袋
            crb(c, s * 0.07 - 0.025, s * 0.07 + 0.025, 0.06, 0.43, -0.13, -0.1, '#2a2b2f', r=0.008)          # 背帶
            c.cbox(s * 0.135 - 0.003, s * 0.135 + 0.003, 0.08, 0.42, 0.075, 0.09, trim)                     # 側邊的配色線
        ccyl(c, (-0.045, 0.445, 0.0), (0.0, 0.5, 0.0), 0.01, '#2a2b2f', seg=5, caps=False); ccyl(c, (0.0, 0.5, 0.0), (0.045, 0.445, 0.0), 0.01, '#2a2b2f', seg=5, caps=False)
    return f


BAGS = [Proto('bag_navy', bag_build('#1f2d55', '#e8a33a')), Proto('bag_black', bag_build('#26272b', '#6d7076', '#303135')), Proto('bag_red', bag_build('#b32a30', '#1f2d55', '#2950a8'))]
for k, (x, z, ry) in enumerate(((-0.33, 0.12, 0.25), (0.0, 0.05, 0.12), (0.31, 0.12, -0.05))):
    BAGS[k].place(fm((bp['x'] + x, bp['h'], bp['z'] + z), rot('Y', ry)))

# ======================================================================
# 人台（深藍運動 T、白色側邊、深藍球褲；黑色立桿、方形底座）——有肩、腰、手臂的弧度（不是方塊拼的）
# ======================================================================
mq = I1('mannequin'); MQT = fm((mq['x'], 0, mq['z']), rot('Y', mq['ry']))
pm = Part('mannequin', T=MQT @ Matrix.Scale(1.08, 4) @ Matrix.Diagonal((1.16, 1.16, 1.0, 1.0))); c = pm['vc']   # v3b：加粗（寬、厚 ×1.16）
NV, WH, SKIN = '#1f2d55', '#eeede8', '#e9e6e0'
crb(c, -0.2, 0.2, 0.0, 0.025, -0.2, 0.2, '#1c1c1e', r=0.008); ccyl(c, (0, 0.025, 0), (0, 0.78, 0), 0.018, '#1c1c1e', seg=8)
ccyl(c, (0, 0.025, 0), (0, 0.06, 0), 0.05, '#1c1c1e', seg=10)
# 球褲（兩條褲管＋臀部；側邊白線）
for s in (-1, 1):
    loft(c, [(0.6, 0.095, 0.1, s * 0.095, 0.0), (0.7, 0.1, 0.105, s * 0.093, 0.0), (0.82, 0.105, 0.11, s * 0.09, 0.0)], 12,
         lambda b, a, s=s: WH if abs(math.cos(a) * s - 1) < 0.15 else NV, cap0=True, cap1=False)
loft(c, [(0.8, 0.2, 0.12, 0, 0), (0.9, 0.205, 0.13, 0, 0.005), (0.97, 0.19, 0.125, 0, 0.0), (1.0, 0.185, 0.12, 0, 0.0)], 16,
     lambda b, a: WH if b == 2 else (WH if abs(math.cos(a)) > 0.93 else NV), cap0=True, cap1=False)
# 運動 T（身體：胸、腰的弧度；側邊白色片）
TOR = [(0.95, 0.205, 0.135), (1.03, 0.19, 0.125), (1.12, 0.182, 0.118), (1.22, 0.19, 0.125), (1.31, 0.205, 0.132), (1.38, 0.215, 0.128), (1.43, 0.2, 0.115), (1.47, 0.13, 0.09), (1.49, 0.075, 0.065)]
loft(c, [(y, rx, rz, 0, 0.0) for (y, rx, rz) in TOR], 18, lambda b, a: (WH if b >= 7 else (WH if abs(math.cos(a)) > 0.9 and b < 6 else NV)), cap0=False, cap1=False)
loft(c, [(1.49, 0.055, 0.05, 0, 0), (1.56, 0.05, 0.048, 0, 0), (1.58, 0.035, 0.035, 0, 0)], 10, lambda b, a: SKIN, cap0=False, cap1=True)   # 脖子
for s in (-1, 1):                                                                                  # 袖子（往外下垂）＋手臂（白色、自然垂下）
    sh = Vector((s * 0.2, 1.4, 0.0)); el = Vector((s * 0.27, 1.2, 0.01))
    ccyl(c, tuple(sh), tuple(el), 0.072, NV, seg=10, r2=0.066); ccyl(c, tuple(el - (el - sh).normalized() * 0.005), tuple(el + (el - sh).normalized() * 0.015), 0.068, WH, seg=10)
    wr = Vector((s * 0.29, 0.88, 0.04)); ccyl(c, tuple(el), tuple(wr), 0.042, SKIN, seg=8, r2=0.034)
    cell_(c, 0.026, 0.06, 0.04, (s * 0.29, 0.83, 0.045), SKIN, seg=8, rings=5)
    csph(c, (s * 0.205, 1.4, 0.0), 0.075, NV, seg=10, rings=5)
c.cbox(-0.06, 0.06, 1.24, 1.245, 0.13, 0.133, WH)   # 胸前一條細白線
pm.done()

# ======================================================================
# 衣架：中間（沿 z，最前面一套正面展示）、後面那排（沿 x，衣服轉 50°）、夾層下的外套、二樓
# ======================================================================
CHROME = '#b8bcc0'


def rack_frame(p, L_, y_rail=1.5, base='wood', two=False):
    """衣架（自己的座標：桿沿 x、長 L_；中心在原點）：兩支立柱、橫桿、木頭底板＋輪子"""
    cm = p['vcm']; hx_ = L_ / 2
    for s in (-1, 1):
        ccyl(cm, (s * hx_, 0.12, 0), (s * hx_, y_rail + 0.02, 0), 0.016, CHROME, seg=8)
        crb(cm, s * hx_ - 0.02, s * hx_ + 0.02, 0.08, 0.12, -0.28, 0.28, CHROME, r=0.008)
        for zz in (-0.25, 0.25): clathe(p['vc'], [(0, 0), (0.025, 0), (0.028, 0.03), (0.0, 0.05)], s * hx_, 0.03, zz, '#2a2a2c', seg=8)
    ccyl(cm, (-hx_ - 0.02, y_rail, 0), (hx_ + 0.02, y_rail, 0), 0.013, CHROME, seg=8)
    if two: ccyl(cm, (-hx_, y_rail - 0.42, -0.22), (hx_, y_rail - 0.42, -0.22), 0.012, CHROME, seg=6)
    if base == 'wood': p['wood'].rbox(-hx_ - 0.04, hx_ + 0.04, 0.1, 0.14, -0.3, 0.3, r=0.008)


def hang_row(lv, T, L_, y_rail, cols, style='tee', gap=0.075, yaw=0.0, lite=False, flat=1.0, start=None):
    """一支桿上掛一排（自己的座標：桿沿 x）：衣服的面和桿垂直（正面朝 +x），yaw＝每件再轉一點（後面那排：參考圖的衣服斜斜地露出正面）"""
    x = -L_ / 2 + 0.06 if start is None else start; k = 0
    while x < L_ / 2 - 0.05:
        cn = cols[k % len(cols)]
        G_(style, cn, lite=lite, flat=flat).place(T @ fm((x, y_rail, 0), rot('Y', math.pi / 2 + yaw + random.uniform(-0.08, 0.08))), lv)
        x += gap + random.uniform(-0.01, 0.015); k += 1
    return k


ra = I1('rack_a'); RAT = fm((ra['x'], 0, ra['z']), rot('Y', ra['ry']))   # 桿沿 z：自己的 +x → 世界的 +z（店門）
p = Part('rack_a', T=RAT); rack_frame(p, ra['len']); p.done()
hang_row(0, RAT, ra['len'] - 0.1, 1.5, ['navy', 'white', 'red', 'navy', 'white', 'navy', 'grey', 'white', 'red', 'navy'], gap=0.085, yaw=0.0)
# 最前面一套正面展示（深藍 T＋深藍球褲，掛在前端的伸出臂上；參考圖中間）
fo = Part('rack_a_arm', T=RAT); ccyl(fo['vcm'], (ra['len'] / 2 + 0.02, 1.52, 0), (ra['len'] / 2 + 0.3, 1.52, 0), 0.011, CHROME, seg=6); ccyl(fo['vcm'], (ra['len'] / 2 + 0.02, 0.98, 0), (ra['len'] / 2 + 0.3, 0.98, 0), 0.011, CHROME, seg=6); fo.done()
FACE_T = garment_proto('tee_face', 'tee', COL['navy'], None, side_col='#efefea'); FACE_S = garment_proto('shorts_face', 'shorts', COL['navy'], '#efefea')
FACE_T.place(RAT @ fm((ra['len'] / 2 + 0.28, 1.56, 0), rot('Y', math.pi / 2)))
FACE_S.place(RAT @ fm((ra['len'] / 2 + 0.29, 1.0, 0), rot('Y', math.pi / 2)))
rb_ = I1('rack_b'); RBT = fm((rb_['x'], 0, rb_['z']), rot('Y', rb_['ry']))
p = Part('rack_b', T=RBT); rack_frame(p, rb_['len'], y_rail=1.48); p.done()
hang_row(0, RBT, rb_['len'], 1.48, ['maroon', 'white', 'white', 'red', 'white', 'navy', 'navy', 'black'], gap=0.13, yaw=-0.95, lite=True)
rc = I1('rack_c'); RCT = fm((rc['x'], 0, rc['z']), rot('Y', rc['ry']))
p = Part('rack_c', T=RCT); rack_frame(p, rc['len'], y_rail=1.55); p.done()
hang_row(0, RCT, rc['len'], 1.55, ['black', 'navy', 'grey', 'royal', 'black', 'heather', 'green'], style='jacket', gap=0.2, lite=True)
# 摺好的運動 T（衣架 A 的底板上）、試穿鏡（柱子上）
fd_ = Part('folded', T=RAT); c = fd_['vc']
for k, cn in enumerate(['navy', 'white', 'red', 'grey']):
    for j in range(4): crb(c, -0.7 + k * 0.3, -0.45 + k * 0.3, 0.14 + j * 0.03, 0.17 + j * 0.03, -0.17, 0.15, jit(COL[cn], 0.05), r=0.01)
fd_.done()

# v3b：圓形衣架（中間地板）、店門右邊的直衣架、球鞋展示台
rr_ = I1('round_rack'); p = Part('round_rack'); cm = p['vcm']; R0 = rr_['r']
for k in range(16):
    a0, a1 = 2 * math.pi * k / 16, 2 * math.pi * (k + 1) / 16
    ccyl(cm, (rr_['x'] + R0 * math.cos(a0), 1.42, rr_['z'] + R0 * math.sin(a0)), (rr_['x'] + R0 * math.cos(a1), 1.42, rr_['z'] + R0 * math.sin(a1)), 0.012, CHROME, seg=5, caps=False)
ccyl(cm, (rr_['x'], 0.04, rr_['z']), (rr_['x'], 1.42, rr_['z']), 0.02, CHROME, seg=8)
for k in range(4): a = math.pi / 4 + k * math.pi / 2; ccyl(cm, (rr_['x'], 1.42, rr_['z']), (rr_['x'] + R0 * math.cos(a), 1.42, rr_['z'] + R0 * math.sin(a)), 0.008, CHROME, seg=4, caps=False)
clathe(cm, [(0, 0), (0.3, 0), (0.3, 0.03), (0.04, 0.045), (0, 0.045)], rr_['x'], 0, rr_['z'], '#3a3c40', seg=16)
p.done()
RCOL = ['navy', 'white', 'red', 'royal', 'white', 'grey', 'navy', 'maroon', 'white', 'sky', 'navy', 'red', 'white', 'black']
for k in range(14):   # 一圈：衣服的面和桿垂直（正面朝圓的切線方向）
    a = 2 * math.pi * k / 14; x = rr_['x'] + R0 * math.cos(a); z = rr_['z'] + R0 * math.sin(a)
    G_('tee', RCOL[k], lite=True).place(fm((x, 1.42, z), rot('Y', -a)))
re_ = I1('rack_e'); RET = fm((re_['x'], 0, re_['z']), rot('Y', re_['ry']))
p = Part('rack_e', T=RET); rack_frame(p, re_['len'], y_rail=1.35); p.done()
hang_row(0, RET, re_['len'], 1.35, ['navy', 'black', 'navy', 'grey', 'royal'], style='shorts', gap=0.1, lite=True)
st_ = I1('shoe_table'); tx0, tx1, tz0, tz1 = st_['x'] - st_['w'] / 2, st_['x'] + st_['w'] / 2, st_['z'] - st_['d'] / 2, st_['z'] + st_['d'] / 2
p = Part('shoe_table'); p['wood'].rbox(tx0, tx1, st_['h'] - 0.04, st_['h'], tz0, tz1, r=0.01)
p['wood'].rbox(tx0 + 0.05, tx1 - 0.05, 0.0, st_['h'] - 0.04, tz0 + 0.05, tz1 - 0.05, r=0.01)
crb(p['vc'], tx0 + 0.06, tx1 - 0.06, 0.0, 0.05, tz0 + 0.06, tz1 - 0.06, '#2a2622', r=0.004)
p['goods'].rect((st_['x'] + 0.3, st_['h'] + 0.002, tz1 - 0.1), (1, 0, 0), (0, 0, -1), 0.05, 0.025, ATL['tag6']); p.done()
for k, (dx_, dz_, a) in enumerate(((-0.33, -0.1, 0.4), (-0.1, 0.12, -0.3), (0.15, -0.12, 0.2), (0.35, 0.1, -0.5), (-0.38, 0.15, 2.6), (0.1, -0.05, 3.3))):
    SHOE[k % len(SHOE)].place(fm((st_['x'] + dx_, st_['h'], st_['z'] + dz_), rot('Y', a)))

# ======================================================================
# 水壺雙面架（四層木層板；最下層毛巾）＋端架（運動襪吊卡）
# ======================================================================
bgd = I1('bottle_gondola'); gx0, gx1 = bgd['x'] - bgd['w'] / 2, bgd['x'] + bgd['w'] / 2; gz0, gz1 = bgd['z'] - bgd['d'] / 2, bgd['z'] + bgd['d'] / 2; gh = bgd['h']
pg = Part('bottle_gondola'); cm, w_, gd = pg['vcm'], pg['wood'], pg['goods']
DK = '#3a3c40'
for z in (gz0, (gz0 + gz1) / 2, gz1):
    crb(cm, bgd['x'] - 0.02, bgd['x'] + 0.02, 0.0, gh, z - 0.02, z + 0.02, DK, r=0.004)
    crb(cm, gx0, gx1, 0.0, 0.03, z - 0.02, z + 0.02, DK, r=0.004)
crb(cm, bgd['x'] - 0.012, bgd['x'] + 0.012, 0.18, gh - 0.02, gz0, gz1, '#4a4d52', r=0.003)           # 中間的背板
GT = [0.2, 0.66, 1.08, 1.5]
for y in GT + [gh - 0.02]:
    w_.rbox(gx0, gx1, y - 0.025, y, gz0 + 0.02, gz1 - 0.02, r=0.006)
    for xe in (gx0, gx1): crb(cm, xe - 0.008, xe + 0.008, y - 0.045, y + 0.01, gz0 + 0.02, gz1 - 0.02, '#9a9ea3', r=0.003)
    for k in range(3):
        if y > 0.3: gd.rect((gx0 - 0.009, y - 0.018, gz0 + 0.35 + k * 0.7), (0, 0, 1), (0, 1, 0), 0.04, 0.018, ATL['tag4'])
gd.rect((gx0 - 0.01, GT[3] + 0.4, gz1 - 0.2), (0, 0, 1), (0, 1, 0), 0.07, 0.07, ATL['n_bottle'])
for k in range(5):                                                                                 # 最下層：疊好的毛巾（白、藍）
    z = gz0 + 0.25 + k * 0.42; cnm = 'towel_a' if k % 2 == 0 else 'towel_b'
    for side, xc in ((-1, gx0 + 0.15), (1, gx1 - 0.15)): gd.box(xc, GT[0] + 0.1, z, 0.26, 0.2, 0.34, cnm, front='-x' if side < 0 else '+x', cells={'+y': 'towel_a' if k % 2 == 0 else 'towel_b'})
for k in range(6):                                                                                 # 頂上：水壺的盒子
    z = gz0 + 0.18 + k * 0.36; gd.box(bgd['x'], gh + 0.09, z, 0.4, 0.16, 0.3, ['kraft3', 'sb_w', 'kraft2', 'sb_b'][k % 4], front='-x')
pg.done()
for t, y in enumerate(GT[1:]):                                                                    # 水壺（西面一整排、東面少一點）
    z = gz0 + 0.06; k = 0
    while z < gz1 - 0.05:
        BOTTLE[(k * 5 + t * 3) % len(BOTTLE)].place(fm((gx0 + 0.08 + random.uniform(-0.005, 0.01), y, z), rot('Y', random.uniform(-0.5, 0.5)))); z += 0.102; k += 1
    pb2 = Part(f'gondola_east{t}'); z = gz0 + 0.05
    while z < gz1 - 0.2:
        w2 = random.uniform(0.18, 0.3); pb2['goods'].box(gx1 - 0.13, y + 0.11, z + w2 / 2, 0.22, 0.22, w2 - 0.01, random.choice(['kraft3', 'sb_w', 'sb_b', 'kraft2']), front='+x'); z += w2
    pb2.done()
pe = Part('endcap'); cm, ga, gd = pe['vcm'], pe['alpha'], pe['goods']                            # 端架：網格＋運動襪吊卡（參考圖右邊那一片）
ez = gz1 + 0.01; crb(cm, gx0, gx1, 0.0, 0.04, gz1, gz1 + 0.12, DK, r=0.004)
for xe in (gx0 + 0.02, gx1 - 0.02): crb(cm, xe - 0.018, xe + 0.018, 0.0, gh, gz1 + 0.01, gz1 + 0.05, DK, r=0.004)
ga.rect((bgd['x'], (0.15 + gh) / 2, gz1 + 0.03), (1, 0, 0), (0, 1, 0), (gx1 - gx0) / 2 - 0.02, (gh - 0.15) / 2, (g[0], g[1], g[0] + (g[2] - g[0]) * (gx1 - gx0) / 0.5, g[1] + (g[3] - g[1]) * (gh - 0.15) / 0.5), both=True)
SK = ['p_sock', 'p_sock2', 'p_sock', 'p_band', 'p_sock2', 'p_sock']
for r_ in range(5):
    for k in range(2):
        x = gx0 + 0.2 + k * 0.22; y = 1.68 - r_ * 0.3
        ccyl(cm, (x, y + 0.03, gz1 + 0.03), (x, y + 0.04, gz1 + 0.16), 0.003, '#a0a4a8', seg=3)
        for j in range(2): gd.box(x, y - 0.1 - j * 0.003, gz1 + 0.06 + j * 0.012, 0.13, 0.2, 0.006, SK[(r_ * 3 + k) % 6], front='+z', skip=('-y', '-z'))
pe.done()

# ======================================================================
# 樓梯（石材踏面、止滑條；西側米白牆＋玻璃欄杆＋木扶手；東側牆上的木扶手）
# ======================================================================
NR_ = ST['risers']; RS, TR = ST['rise'], ST['tread']; sx0, sx1 = ST['x0'], ST['x1']; SZT, SZB = ST['z0'], ST['z1']
ps = Part('stairs', smooth=False)
for i in range(NR_):
    zb_ = SZB - i * TR; za_ = zb_ - TR; y = (i + 1) * RS
    ps['stone'].box(sx0, sx1, max(0.0, y - RS - 0.3), y, za_ if i < NR_ - 1 else SZT, zb_ + 0.02)
    crb(ps['vc'], sx0 + 0.03, sx1 - 0.03, y - 0.002, y + 0.002, zb_ - 0.04, zb_ + 0.015, '#c9a86a', r=0)   # 止滑條（銅色）
ps['wall'].box(sx0, sx1, 0.0, 0.05, SZB - 0.02, SZB)
ps.done()
ys = lambda z: RS * NR_ * (SZB - z) / (SZB - SZT)                                                   # 踏面前緣連起來的高度
def prism(mesh, zy, xa, xb, col=None):
    """沿 x 擠出的多邊形（zy＝[(z, y)…] 一圈）：封閉的殼，法線用 recalc 算（單面材質不會朝錯邊）"""
    bm = mesh.bm; n0 = set(bm.faces)
    A_ = [bm.verts.new(g2b(xa, y, z)) for z, y in zy]; B_ = [bm.verts.new(g2b(xb, y, z)) for z, y in zy]; n = len(zy)
    bm.faces.new(A_); bm.faces.new(list(reversed(B_)))
    for i in range(n): j = (i + 1) % n; bm.faces.new((A_[i], A_[j], B_[j], B_[i]))
    new = [f for f in bm.faces if f not in n0]; bmesh.ops.recalc_face_normals(bm, faces=new)
    if col: mesh.paint(new, col)
    return new


psw = Part('stair_wall', smooth=False); xw0, xw1 = sx0 - 0.12, sx0
prism(psw['wall'], [(SZB, 0.0), (SZB, 0.06), (SZT, ys(SZT) + 0.06), (SZT, 0.0)], xw0, xw1)
prism(psw['vc'], [(SZB + 0.005, 0.0), (SZB + 0.005, 0.1), (SZT, 0.1), (SZT, 0.0)], xw0 - 0.006, xw0, '#8f887e')   # 石材踢腳
psw.done()
# 斜的石材壓條（牆頂）
cap = Part('stair_cap'); c = cap['vc']
a = (sx0 - 0.06, 0.07, SZB); b = (sx0 - 0.06, ys(SZT) + 0.07, SZT); ccyl(c, a, b, 0.04, '#a39c90', seg=4)
cap.done()


def rail_run(p, pts, y0f, h, posts, glass=True, wood_r=0.028):
    """欄杆：沿著 pts（遊戲座標的點，地面高度由 y0f 給）每隔一段一支不鏽鋼立柱、中間玻璃、最上面木扶手"""
    cm = p['vcm']
    for (q0, q1) in zip(pts, pts[1:]):
        d_ = math.dist((q0[0], q0[1]), (q1[0], q1[1])); n = max(1, round(d_ / posts))
        for k in range(n + 1):
            if k == n and (q1 is not pts[-1]): continue
            t = k / n; x = q0[0] + (q1[0] - q0[0]) * t; z = q0[1] + (q1[1] - q0[1]) * t; y0 = y0f(x, z)
            ccyl(cm, (x, y0, z), (x, y0 + h - 0.03, z), 0.02, '#c0c4c8', seg=8)
            crb(cm, x - 0.04, x + 0.04, y0, y0 + 0.01, z - 0.04, z + 0.04, '#c0c4c8', r=0.003)
        ya, yb = y0f(*q0), y0f(*q1)
        if glass:
            p['glass'].quad([(q0[0], ya + 0.08, q0[1]), (q1[0], yb + 0.08, q1[1]), (q1[0], yb + h - 0.1, q1[1]), (q0[0], ya + h - 0.1, q0[1])])
            ccyl(cm, (q0[0], ya + 0.06, q0[1]), (q1[0], yb + 0.06, q1[1]), 0.012, '#c0c4c8', seg=6)
        p['wood'].cyl((q0[0], ya + h, q0[1]), (q1[0], yb + h, q1[1]), wood_r, seg=10)


prs = Part('stair_rail')
rail_run(prs, [(sx0 - 0.06, SZB + 0.05), (sx0 - 0.06, SZT)], lambda x, z: ys(min(SZB, max(SZT, z))) + 0.07, 0.92, 1.1)
prs['wood'].cyl((sx0 - 0.06, 0.07 + 0.92, SZB + 0.05), (sx0 - 0.06, 0.07 + 0.92, SZB + 0.35), 0.028, seg=10)   # 扶手下端水平伸出 30 cm
prs.done()
pre = Part('stair_rail_east'); w_ = pre['wood']; cm = pre['vcm']                                     # 東側牆上的木扶手（托架）
w_.cyl((FIN0 - 0.07, ys(SZB) + 0.9, SZB), (FIN0 - 0.07, ys(SZT) + 0.9, SZT), 0.026, seg=10)
for t in (0.1, 0.4, 0.7, 0.95):
    z = SZB + (SZT - SZB) * t; ccyl(cm, (FIN0, ys(z) + 0.84, z), (FIN0 - 0.07, ys(z) + 0.9, z), 0.008, '#c0c4c8', seg=5)
pre.done()
# 二樓：夾層前緣的玻璃欄杆＋木扶手、樓梯洞兩側
prm = Part('mezz_rail', lv=1)
rail_run(prm, [(XI0, -0.04), (HOLE['x0'] - 0.04, -0.04), (HOLE['x0'] - 0.04, HOLE['z0'])], lambda x, z: Y1, 1.05, 1.3, wood_r=0.032)
rail_run(prm, [(HOLE['x1'] + 0.04, HOLE['z0'] + 0.6), (HOLE['x1'] + 0.04, -0.04), (XI1, -0.04)], lambda x, z: Y1, 1.05, 1.3, wood_r=0.032)
prm.done()

# ======================================================================
# 樓層指示牌（樓梯東側的牆、面向西）、收銀台的吊牌、球鞋區的吊牌
# ======================================================================
psg = Part('signs', lv=1); u = psg['sign']
fgz0, fgz1, fgy0, fgy1 = 1.1, 2.35, 2.45, 5.75
crb(psg['vc'], FIN0 - 0.03, FIN0, fgy0 - 0.03, fgy1 + 0.03, fgz0 - 0.03, fgz1 + 0.03, '#1a2f6e', r=0.006)
u.rect((FIN0 - 0.032, (fgy0 + fgy1) / 2, (fgz0 + fgz1) / 2), (0, 0, 1), (0, 1, 0), (fgz1 - fgz0) / 2, (fgy1 - fgy0) / 2, ATL['floor_guide'], rotuv=90)
psg.done()
pcs = Part('sign_small')
ca = I1('cashier'); u = pcs['sign']
for (cx_, cy_, cz_, w2, h2, nm) in ((ca['x'], 2.55, ca['z'] - 0.1, 0.6, 0.2, 'sign_cashier'), (-6.3, 2.75, 4.0, 0.6, 0.2, 'sign_shoes'), (5.6, 2.9, 4.6, 0.6, 0.2, 'sign_shoes')):
    crb(pcs['vc'], cx_ - w2 - 0.02, cx_ + w2 + 0.02, cy_ - h2 - 0.02, cy_ + h2 + 0.02, cz_ - 0.015, cz_ + 0.015, '#1a2f6e', r=0.004)
    u.rect((cx_, cy_, cz_ + 0.017), (1, 0, 0), (0, 1, 0), w2, h2, ATL[nm]); u.rect((cx_, cy_, cz_ - 0.017), (-1, 0, 0), (0, 1, 0), w2, h2, ATL[nm])
    for s in (-1, 1): ccyl(pcs['vcm'], (cx_ + s * (w2 - 0.05), cy_ + h2, cz_), (cx_ + s * (w2 - 0.05), HT if cz_ > 0 else H1, cz_), 0.002, '#9a9ea2', seg=3)
pcs['goods'].rect((XI0 + 0.004, 2.0, 0.3), (0, 0, -1), (0, 1, 0), 0.25, 0.375, ATL['poster'])   # 夾層下左牆的海報
pcs.done()

# ======================================================================
# 球鞋牆（左牆、東邊）＋試穿椅
# ======================================================================


def shoe_wall(name, x_wall, sgn, za, zb, tiers, gap, side, boxes=False):
    """牆上的層板（每層一排鞋，鞋尖朝店內稍微斜著）：sgn＝往室內的方向（+1＝往 +x）"""
    p = Part(name, side=side); w_, cm, gd = p['wood'], p['vcm'], p['goods']; dep = 0.32
    xa, xb = (x_wall, x_wall + dep) if sgn > 0 else (x_wall - dep, x_wall)
    for z in (za, zb):
        crb(cm, xa, xb, 0.0, tiers[-1] + 0.35, z - 0.015, z + 0.015, '#3a3c40', r=0.003)
    for y in tiers:
        w_.rbox(xa, xb, y - 0.022, y, za, zb, r=0.005)
        z = za + 0.4
        while z < zb - 0.2: gd.rect((xb + 0.003 if sgn > 0 else xa - 0.003, y - 0.011, z), (0, 0, -sgn), (0, 1, 0), 0.035, 0.011, ATL[f'tag{random.randrange(8)}']); z += 0.9
    if boxes:   # 鞋盒一疊一疊（側面朝走道）
        for y in tiers:
            z = za + 0.08
            while z < zb - 0.35:
                for j in range(2): gd.box((xa + xb) / 2, y + 0.06 + j * 0.12, z + 0.16, 0.28, 0.12, 0.32, random.choice(['sb_w', 'sb_o', 'sb_b', 'sb_k']), front='+x' if sgn > 0 else '-x')
                z += 0.36
        p.done(); return 0
    p.done(); k = 0
    for y in tiers:
        z = za + 0.2
        while z < zb - 0.15:
            ang = -math.pi / 2 + sgn * (0.3 + random.uniform(-0.1, 0.1))   # 側面朝走道、鞋尖朝店門（往外斜一點）
            SHOE[(k * 3 + int(y * 10)) % len(SHOE)].place(fm(((xa + xb) / 2, y, z), rot('Y', ang)))
            z += gap; k += 1
    return k


ns1 = shoe_wall('shoe_left', XI0, 1, 0.75, 7.25, [0.4, 0.95, 1.5], 0.5, 'left')
ns2 = shoe_wall('shoe_right', XI1, -1, -3.0, 5.7, [0.45, 1.0, 1.55], 0.95, 'right', boxes=True)
for bn in IT['bench']:
    p = Part('bench'); x, z, bw, bd = bn['x'], bn['z'], bn['w'], bn['d']
    p['wood'].rbox(x - bw / 2, x + bw / 2, 0.38, 0.42, z - bd / 2, z + bd / 2, r=0.012)
    for sx in (-1, 1):
        for sz in (-1, 1): crb(p['vcm'], x + sx * (bw / 2 - 0.05) - 0.015, x + sx * (bw / 2 - 0.05) + 0.015, 0.0, 0.38, z + sz * (bd / 2 - 0.06) - 0.015, z + sz * (bd / 2 - 0.06) + 0.015, '#3a3c40', r=0.004)
    p.done()
# 地上的試穿鏡（左牆球鞋區）、鞋拔
pmr = Part('mirror'); crb(pmr['vc'], -6.2, -6.0, 0.0, 0.42, 1.6, 1.62, '#3a3c40', r=0.004); pmr['glass'].quad([(-6.2, 0.02, 1.625), (-6.0, 0.02, 1.625), (-6.0, 0.4, 1.625), (-6.2, 0.4, 1.625)]); pmr.done()

# ======================================================================
# 收銀台（東邊前段）
# ======================================================================
pk = Part('cashier'); c, cm, gd = pk['vc'], pk['vcm'], pk['goods']; kx0, kx1, kz0, kz1 = ca['x'] - ca['w'] / 2, ca['x'] + ca['w'] / 2, ca['z'] - ca['d'] / 2, ca['z'] + ca['d'] / 2
crb(c, kx0, kx1, 0.08, ca['h'] - 0.04, kz0, kz1, '#e6e1d6', r=0.01); crb(c, kx0 + 0.03, kx1 - 0.03, 0.0, 0.08, kz0 + 0.03, kz1, '#2a2622', r=0.004)
gd.rect((ca['x'], (0.08 + ca['h'] - 0.04) / 2, kz0 - 0.004), (-1, 0, 0), (0, 1, 0), ca['w'] / 2, (ca['h'] - 0.12) / 2, ATL['cashier'])
pk['wood'].rbox(kx0 - 0.03, kx1 + 0.03, ca['h'] - 0.04, ca['h'], kz0 - 0.04, kz1 + 0.03, r=0.008)
crb(c, ca['x'] - 0.2, ca['x'] + 0.2, ca['h'], ca['h'] + 0.12, kz1 - 0.35, kz1 - 0.1, '#2a2a2c', r=0.015)   # 收銀機
crb(c, ca['x'] - 0.15, ca['x'] + 0.15, ca['h'] + 0.12, ca['h'] + 0.32, kz1 - 0.3, kz1 - 0.28, '#1c1c1e', r=0.006)
pk['emit'].rect((ca['x'], ca['h'] + 0.22, kz1 - 0.31), (-1, 0, 0), (0, 1, 0), 0.13, 0.085, ATL['screen'])
for j in range(6): crb(c, kx0 + 0.15 + j * 0.06, kx0 + 0.2 + j * 0.06, ca['h'], ca['h'] + 0.006, kz0 + 0.12, kz0 + 0.2, ['#c8202a', '#2950a8', '#f2f0ea', '#e8a33a', '#2f6b45', '#26272b'][j], r=0)   # 櫃台上的小東西（髮帶）
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.1), (0, 0.1)], kx1 - 0.25, ca['h'], kz0 + 0.2, '#3a4f7a', seg=10)
for j in range(5): ccyl(c, (kx1 - 0.25 + 0.012 * math.cos(j), ca['h'] + 0.02, kz0 + 0.2 + 0.012 * math.sin(j)), (kx1 - 0.25 + 0.025 * math.cos(j), ca['h'] + 0.15, kz0 + 0.2 + 0.025 * math.sin(j)), 0.004, ['#d23a3a', '#2f4f8a', '#1d1d21', '#e2cc1e', '#f2f0ea'][j], seg=4)
pk.done()

# ======================================================================
# 夾層下：獎盃櫃、後牆貨架、兩座雙面貨架、左牆層架
# ======================================================================
ts = I1('trophy_shelf'); tx0, tx1 = ts['x'] - ts['w'] / 2, ts['x'] + ts['w'] / 2; tz0, tz1 = ZI0, ZI0 + ts['d']
pt = Part('trophy_shelf', side='back'); w_, gd, c, cm = pt['wood'], pt['goods'], pt['vc'], pt['vcm']
for x in (tx0, tx1): w_.rbox(x - 0.02, x + 0.02, 0.0, ts['h'], tz0, tz1, r=0.005)
for y in (0.05, 0.6, 1.15, 1.7, ts['h'] - 0.02): w_.rbox(tx0, tx1, y, y + 0.025, tz0, tz1, r=0.004)
for y0, kinds in ((0.075, ['kraft1', 'kraft4', 'kraft2']), (0.625, ['sb_o', 'sb_w', 'sb_b', 'sb_k']), (1.175, ['binders', 'kraft3']), (1.725, ['sb_w', 'kraft2', 'sb_b'])):
    x = tx0 + 0.04
    while x < tx1 - 0.3:
        kd = random.choice(kinds); w2 = 0.42 if kd == 'binders' else random.uniform(0.28, 0.4); h2 = 0.3 if kd == 'binders' else random.uniform(0.16, 0.4)
        gd.box(x + w2 / 2, y0 + h2 / 2, tz1 - 0.2, w2, h2, 0.34, kd, front='+z'); x += w2 + 0.02
pt.done()


def trophy_build(h, cup='#d9b45a'):
    def f(pt):
        c = pt['vcm']
        clathe(c, [(0, 0), (0.06, 0), (0.06, 0.05), (0.045, 0.05), (0.045, 0.07), (0.0, 0.07)], 0, 0, 0, '#2a2622', seg=8)
        clathe(c, [(0.012, 0.0), (0.012, h * 0.35), (0.03, h * 0.42), (0.07, h * 0.62), (0.075, h * 0.72), (0.0, h * 0.72)], 0, 0.07, 0, cup, seg=10)
        for s in (-1, 1): ccyl(c, (s * 0.07, 0.07 + h * 0.65, 0), (s * 0.1, 0.07 + h * 0.5, 0), 0.008, cup, seg=4)
        clathe(c, [(0, 0), (0.02, 0), (0.0, 0.05)], 0, 0.07 + h * 0.72, 0, cup, seg=6)
    return f


TROPHY = [Proto('trophy_a', trophy_build(0.28)), Proto('trophy_b', trophy_build(0.36)), Proto('trophy_c', trophy_build(0.22, '#c9a24a'))]
x = tx0 + 0.15; k = 0
while x < tx1 - 0.1: TROPHY[k % 3].place(fm((x, ts['h'] + 0.005, tz0 + 0.25 + (0.08 if k % 2 else 0)), rot('Y', random.uniform(-0.3, 0.3))), 0); x += 0.22; k += 1


def steel_shelf(name, xa, xb, za, zb, face, levels, top, side=None, kinds=None):
    p = Part(name, side=side); cm, c, g_ = p['vcm'], p['vc'], p['goods']; kinds = kinds or ['kraft1', 'kraft2', 'kraft2', 'sb_w', 'binders', 'kraft3', 'sb_o', 'kraft4', 'sb_b']
    for x in (xa, xb):
        for z in (za, zb): cm.cbox(x - 0.018, x + 0.018, 0.0, top, z - 0.018, z + 0.018, '#7c8288')
    for y in levels: c.cbox(xa + 0.01, xb - 0.01, y, y + 0.018, za + 0.01, zb - 0.01, '#bba57c')
    gaps = list(levels) + [top + 0.03]
    for li in range(len(levels)):
        y0 = levels[li] + 0.018; hmax = gaps[li + 1] - y0 - 0.03
        a, b_, dep = (xa + 0.03, xb - 0.03, zb - za) if face in ('+z', '-z') else (za + 0.03, zb - 0.03, xb - xa)
        t = a
        while t < b_ - 0.15:
            kind = random.choice(kinds); w2 = min(random.uniform(0.3, 0.5), b_ - t); h2 = min(hmax, random.uniform(0.2, hmax)); d2 = min(dep - 0.06, 0.4)
            if face == '+z': g_.box(t + w2 / 2, y0 + h2 / 2, zb - d2 / 2 - 0.02, w2, h2, d2, kind, front='+z')
            elif face in ('+x', '-x'):
                xc = (xb - d2 / 2 - 0.02) if face == '+x' else (xa + d2 / 2 + 0.02); g_.box(xc, y0 + h2 / 2, t + w2 / 2, d2, h2, w2, kind, front=face)
            t += w2 + random.uniform(0.01, 0.04)
    p.done()


bs_ = I1('back_shelf'); steel_shelf('back_shelf', bs_['x'] - bs_['w'] / 2, bs_['x'] + bs_['w'] / 2, ZI0, ZI0 + bs_['d'], '+z', (0.08, 0.6, 1.12, 1.64), bs_['h'], side='back')
ls_ = I1('left_shelf_back'); steel_shelf('left_shelf', XI0, XI0 + ls_['w'], ls_['z'] - ls_['d'] / 2, ls_['z'] + ls_['d'] / 2, '+x', (0.08, 0.6, 1.12, 1.64, 2.16), 2.6, side='left')
for k, gn in enumerate(IT['gondola']):                                                           # 夾層下兩座雙面貨架：一面球（盒）、一面護具盒
    xa, xb = gn['x'] - gn['w'] / 2, gn['x'] + gn['w'] / 2; za, zb = gn['z'] - gn['d'] / 2, gn['z'] + gn['d'] / 2
    p = Part(f'gondola{k}'); cm, w_ = p['vcm'], p['wood']
    for z in (za, (za + zb) / 2, zb): crb(cm, gn['x'] - 0.02, gn['x'] + 0.02, 0.0, gn['h'], z - 0.02, z + 0.02, DK, r=0.004)
    crb(cm, gn['x'] - 0.01, gn['x'] + 0.01, 0.15, gn['h'], za, zb, '#4a4d52', r=0.003)
    for y in (0.15, 0.55, 0.95, 1.35): w_.rbox(xa, xb, y - 0.022, y, za + 0.02, zb - 0.02, r=0.005)
    p.done()
    for y in (0.15, 0.55, 0.95, 1.35):
        z = za + 0.15
        while z < zb - 0.15:
            if False: BALL_B.place(fm((xa + 0.15, y, z), rot('Y', random.uniform(0, 6.3)))); z += 0.26
            else:
                pg_ = Part(f'gbox{k}_{int(y * 100)}_{int(z * 100)}'); kd = random.choice(['sb_o', 'sb_w', 'sb_b', 'sb_k', 'kraft3', 'kraft1'])
                pg_['goods'].box(xa + 0.15, y + 0.1, z, 0.26, 0.2, 0.3, kd, front='-x'); pg_['goods'].box(xb - 0.15, y + 0.1, z + 0.05, 0.26, 0.2, 0.3, kd, front='+x'); pg_.done(); z += 0.34

# ======================================================================
# 二樓：後牆的展示球衣、法律系 7 號、「系隊球衣訂做」、尺寸表、白板樣衣
# ======================================================================
JD = I1('jersey_display')
JCOL = {37: ('#1f2d55', '#efefea', 'j37'), 16: ('#b8242c', '#efefea', 'j16'), 88: ('#eeede6', '#1f2d55', 'j88'), 7: ('#17213f', '#d9b45a', 'j7'),
        12: ('#6a1c26', '#e9e2cf', 'j12'), 21: ('#2f6b45', '#efefea', 'j21'), 5: ('#8fb8de', '#1f2d55', 'j5'), 30: ('#26272b', '#d8742c', 'j30')}
zw = ZB2 + 0.01
for it in JD['list']:                                                                              # 三件展示球衣（大一號、衣架掛在牆上的掛勾：參考圖）
    col, tr, dc = JCOL[it['no']]
    garment_proto(f'jd{it["no"]}', 'jersey', col, tr, flat=0.5, decal=dc, scale=JD['scale']).place(fm((it['x'], JD['y'] + 1.1, zw + 0.07)), 1)
    ph_ = Part(f'jhook{it["no"]}', lv=1); ccyl(ph_['vcm'], (it['x'], JD['y'] + 1.12, zw), (it['x'], JD['y'] + 1.12, zw + 0.08), 0.006, '#a0a4a8', seg=5); ph_.done()
jl = I1('jersey_law')
garment_proto('jlaw7', 'jersey', JCOL[7][0], JCOL[7][1], flat=0.45, decal='j7', scale=1.05).place(fm((jl['x'], jl['y'] + 0.9, zw + 0.05)), 1)
bo = I1('banner_order'); ps2 = Part('wall_signs', lv=1, side='back'); u = ps2['sign']; c = ps2['vc']
crb(c, bo['x'] - bo['w'] / 2 - 0.03, bo['x'] + bo['w'] / 2 + 0.03, bo['y'] - bo['h'] / 2 - 0.03, bo['y'] + bo['h'] / 2 + 0.03, zw - 0.01, zw + 0.02, '#1a2f6e', r=0.006)
u.rect((bo['x'], bo['y'], zw + 0.022), (1, 0, 0), (0, 1, 0), bo['w'] / 2, bo['h'] / 2, ATL['banner_order'])
sc_ = I1('size_chart')
crb(c, sc_['x'] - sc_['w'] / 2 - 0.03, sc_['x'] + sc_['w'] / 2 + 0.03, sc_['y'] - sc_['h'] / 2 - 0.03, sc_['y'] + sc_['h'] / 2 + 0.03, zw - 0.01, zw + 0.02, '#c9ccd2', r=0.006)
u.rect((sc_['x'], sc_['y'], zw + 0.022), (1, 0, 0), (0, 1, 0), sc_['w'] / 2, sc_['h'] / 2, ATL['size_chart'])
sbd = I1('sample_board')
crb(c, sbd['x'] - sbd['w'] / 2, sbd['x'] + sbd['w'] / 2, sbd['y'] - sbd['h'] / 2, sbd['y'] + sbd['h'] / 2, zw - 0.01, zw + 0.025, '#f2f1ec', r=0.01)
crb(c, sbd['x'] - sbd['w'] / 2 - 0.02, sbd['x'] + sbd['w'] / 2 + 0.02, sbd['y'] - sbd['h'] / 2 - 0.02, sbd['y'] - sbd['h'] / 2 + 0.01, zw - 0.01, zw + 0.03, '#b8bcc0', r=0.004)
for nm, x, y in (('n_order', 1.0, 5.5), ('n_print', 1.75, 5.45), ('n_up', -6.6, 4.9)):
    ps2['goods'].rect((x, y, zw + 0.024), (1, 0, 0), (0, 1, 0), 0.13, 0.13, ATL[nm])
ps2.done()
SAMPLE = garment_proto('jsample', 'jersey', '#2950a8', '#efefea', flat=0.3, scale=0.8)
for x in (sbd['x'] - 0.36, sbd['x'] + 0.36): SAMPLE.place(fm((x, sbd['y'] + 0.42, zw + 0.04)), 1)
# 後牆上排的系隊球衣（小一號、平掛：牆的左半段，參考圖展示球衣兩旁）
WALLJ = [(12, -6.55), (21, -2.55), (5, -1.3)]
for no, x in WALLJ:
    col, tr, dc = JCOL[no]; garment_proto(f'jw{no}', 'jersey', col, tr, flat=0.4, decal=dc, scale=0.95).place(fm((x, 5.35 + 0.75, zw + 0.04)), 1)

# ---------------- 訂做櫃台（螢幕、資料夾、筆筒、型錄）、樣品桌＋凳子 ----------------
oc = I1('order_counter'); ox0, ox1, oz0, oz1 = oc['x'] - oc['w'] / 2, oc['x'] + oc['w'] / 2, oc['z'] - oc['d'] / 2, oc['z'] + oc['d'] / 2; oy = Y1 + oc['h']
po = Part('order_counter', lv=1); w_, c, gd = po['wood'], po['vc'], po['goods']
w_.rbox(ox0, ox1, Y1 + 0.06, oy - 0.04, oz0, oz1, r=0.008); w_.rbox(ox0 - 0.03, ox1 + 0.03, oy - 0.04, oy, oz0 - 0.03, oz1 + 0.04, r=0.008)
crb(c, ox0 + 0.03, ox1 - 0.03, Y1, Y1 + 0.06, oz0 + 0.03, oz1 - 0.03, '#2a2622', r=0.004)
for k in range(4): crb(c, ox0 + 0.1 + k * 0.64, ox0 + 0.12 + k * 0.64, Y1 + 0.1, oy - 0.08, oz1 + 0.0, oz1 + 0.008, '#8a6a46', r=0)   # 面板的接縫
mx, mz = oc['x'] + 0.55, oz0 + 0.15                                                                 # 螢幕（朝客人那邊斜放）
mon = Part('monitor', lv=1, T=fm((mx, oy, mz), rot('Y', 0.35)))
crb(mon['vc'], -0.27, 0.27, 0.12, 0.46, -0.02, 0.02, '#1c1c1e', r=0.008); clathe(mon['vc'], [(0, 0), (0.1, 0), (0.1, 0.012), (0.02, 0.02), (0, 0.02)], 0, 0, -0.04, '#2a2a2c', seg=12)
ccyl(mon['vc'], (0, 0.02, -0.04), (0, 0.2, -0.03), 0.015, '#2a2a2c', seg=6)
mon['emit'].rect((0, 0.29, 0.021), (1, 0, 0), (0, 1, 0), 0.25, 0.155, ATL['screen']); mon['goods'].rect((0, 0.29, -0.021), (-1, 0, 0), (0, 1, 0), 0.25, 0.155, ATL['monback']); mon.done()
crb(c, mx - 0.3, mx + 0.05, oy, oy + 0.02, mz + 0.12, mz + 0.27, '#e2e0d8', r=0.006)
for k in range(2):                                                                                 # 資料夾（一排立著）、型錄
    x0_ = oc['x'] - 0.25 - k * 0.5; gd.box(x0_, oy + 0.16, oz0 + 0.12, 0.45, 0.3, 0.24, 'binders', front='+z', cells={'+y': 'binders'})
for j in range(3): gd.box(oc['x'] - 1.0 + j * 0.03, oy + 0.006 + j * 0.008, oz1 - 0.15, 0.24, 0.008, 0.3, 'poster', front='+y')
clathe(c, [(0, 0), (0.04, 0), (0.042, 0.11), (0, 0.11)], ox1 - 0.2, oy, oz0 + 0.12, '#e8a33a', seg=10)
for j in range(6): ccyl(c, (ox1 - 0.2 + 0.012 * math.cos(j), oy + 0.02, oz0 + 0.12 + 0.012 * math.sin(j)), (ox1 - 0.2 + 0.026 * math.cos(j), oy + 0.16, oz0 + 0.12 + 0.026 * math.sin(j)), 0.004, ['#d23a3a', '#2f4f8a', '#1d1d21', '#e2cc1e', '#2e8a4a', '#f2f0ea'][j], seg=4)
for k, cn in enumerate(['navy', 'red', 'white', 'green', 'deepnavy']):                              # 櫃台上摺好的樣衣
    for j in range(2): crb(c, ox0 + 0.12 + k * 0.3, ox0 + 0.38 + k * 0.3, oy + j * 0.03, oy + 0.03 + j * 0.03, oz1 - 0.3, oz1 - 0.05, jit(COL[cn], 0.05), r=0.01)
po.done()
stb = I1('sample_table'); tx0, tx1, tz0, tz1 = stb['x'] - stb['w'] / 2, stb['x'] + stb['w'] / 2, stb['z'] - stb['d'] / 2, stb['z'] + stb['d'] / 2; ty_ = Y1 + stb['h']
ptb = Part('sample_table', lv=1); w_, c, cm = ptb['wood'], ptb['vc'], ptb['vcm']
w_.rbox(tx0, tx1, ty_ - 0.035, ty_, tz0, tz1, r=0.008)
for x in (tx0 + 0.05, tx1 - 0.05):
    for z in (tz0 + 0.05, tz1 - 0.05): crb(cm, x - 0.018, x + 0.018, Y1, ty_ - 0.035, z - 0.018, z + 0.018, '#2a2a2c', r=0.004)
for k, cn in enumerate(['navy', 'white', 'red', 'royal', 'black', 'maroon']):
    for j in range(3): crb(c, tx0 + 0.08 + (k % 3) * 0.42, tx0 + 0.42 + (k % 3) * 0.42, ty_ + j * 0.028, ty_ + 0.028 + j * 0.028, tz0 + 0.06 + (k // 3) * 0.3, tz0 + 0.32 + (k // 3) * 0.3, jit(COL[cn], 0.05), r=0.01)
for sx in (-0.25, 0.25):                                                                           # 兩張凳子
    clathe(c, [(0, 0), (0.17, 0), (0.17, 0.035), (0, 0.04)], stb['x'] + sx, Y1 + 0.46, tz0 - 0.42, '#2a4a8a', seg=14)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; ccyl(cm, (stb['x'] + sx + 0.15 * math.cos(a), Y1, tz0 - 0.42 + 0.15 * math.sin(a)), (stb['x'] + sx + 0.1 * math.cos(a), Y1 + 0.46, tz0 - 0.42 + 0.1 * math.sin(a)), 0.012, '#2a2a2c', seg=5)
ptb.done()
# ---------------- 二樓左牆衣架（上下兩支桿，滿滿的系隊球衣） ----------------
wr = I1('wall_rack_2f'); wz0, wz1 = wr['z'] - wr['d'] / 2, wr['z'] + wr['d'] / 2
pwr = Part('wall_rack', lv=1, side='left'); cm = pwr['vcm']
for yr in (Y1 + 2.35, Y1 + 1.25):
    ccyl(cm, (XI0 + 0.32, yr, wz0), (XI0 + 0.32, yr, wz1), 0.014, CHROME, seg=8)
    for z in (wz0 + 0.05, (wz0 + wz1) / 2, wz1 - 0.05): ccyl(cm, (XI0, yr, z), (XI0 + 0.32, yr, z), 0.012, CHROME, seg=6)
pwr['wood'].rbox(XI0, XI0 + 0.36, Y1 + 2.62, Y1 + 2.65, wz0, wz1, r=0.005)                          # 最上面一層板（摺好的衣服）
pwr.done()
for yr, cols in ((Y1 + 2.35, ['navy', 'white', 'royal', 'navy', 'white', 'navy']), (Y1 + 1.25, ['white', 'navy', 'navy', 'royal', 'white', 'sky'])):
    z = wz0 + 0.08; k = 0
    while z < wz1 - 0.06:
        G_('jersey', cols[k % len(cols)], lite=True).place(fm((XI0 + 0.32, yr, z), rot('Y', random.uniform(-0.1, 0.1))), 1); z += 0.075 + random.uniform(0, 0.02); k += 1
pfo = Part('wall_rack_top', lv=1, side='left'); c = pfo['vc']
z = wz0 + 0.05
while z < wz1 - 0.3:
    cn = random.choice(['navy', 'white', 'royal', 'red'])
    for j in range(random.randint(2, 4)): crb(c, XI0 + 0.04, XI0 + 0.32, Y1 + 2.65 + j * 0.03, Y1 + 2.68 + j * 0.03, z, z + 0.26, jit(COL[cn], 0.05), r=0.01)
    z += 0.3
pfo.done()
# ---------------- 裁縫桌＋裁縫車＋圓凳、布料捲、樣衣間、東邊衣架 ----------------
sw = I1('sewing'); sx0_, sx1_, sz0_, sz1_ = sw['x'] - sw['w'] / 2, sw['x'] + sw['w'] / 2, sw['z'] - sw['d'] / 2, sw['z'] + sw['d'] / 2; sy_ = Y1 + 0.76
psw = Part('sewing', lv=1); w_, c, cm = psw['wood'], psw['vc'], psw['vcm']
w_.rbox(sx0_, sx1_, sy_ - 0.04, sy_, sz0_, sz1_, r=0.008)
for x in (sx0_ + 0.05, sx1_ - 0.05):
    for z in (sz0_ + 0.05, sz1_ - 0.05): crb(cm, x - 0.018, x + 0.018, Y1, sy_ - 0.04, z - 0.018, z + 0.018, '#2a2a2c', r=0.004)
mx = sw['x'] - 0.15                                                                                 # 裁縫車（白：底座、立柱、橫臂、機頭、手輪）
crb(c, mx - 0.24, mx + 0.24, sy_, sy_ + 0.09, sw['z'] - 0.1, sw['z'] + 0.1, '#ecebe6', r=0.02, seg=2)
crb(c, mx + 0.12, mx + 0.24, sy_ + 0.09, sy_ + 0.3, sw['z'] - 0.08, sw['z'] + 0.08, '#ecebe6', r=0.03, seg=2)
crb(c, mx - 0.24, mx + 0.24, sy_ + 0.24, sy_ + 0.33, sw['z'] - 0.07, sw['z'] + 0.07, '#ecebe6', r=0.03, seg=2)
crb(c, mx - 0.26, mx - 0.17, sy_ + 0.1, sy_ + 0.33, sw['z'] - 0.06, sw['z'] + 0.06, '#e2e0da', r=0.02)
ccyl(c, (mx + 0.25, sy_ + 0.24, sw['z']), (mx + 0.28, sy_ + 0.24, sw['z']), 0.06, '#c8ccd0', seg=12)
ccyl(cm, (mx - 0.22, sy_ + 0.1, sw['z'] + 0.02), (mx - 0.22, sy_ + 0.24, sw['z'] + 0.02), 0.004, '#a0a4a8', seg=4)
crb(c, mx - 0.1, mx + 0.1, sy_ + 0.33, sy_ + 0.335, sw['z'] - 0.05, sw['z'] + 0.05, '#2a52a8', r=0)
clathe(c, [(0, 0), (0.018, 0), (0.018, 0.045), (0, 0.045)], mx + 0.18, sy_ + 0.33, sw['z'], '#c8202a', seg=8)   # 線軸
for k, cn in enumerate(['royal', 'white', 'navy']):
    crb(c, sx1_ - 0.55, sx1_ - 0.08, sy_ + k * 0.02, sy_ + 0.02 + k * 0.02, sz0_ + 0.08 + k * 0.03, sz1_ - 0.1, jit(COL[cn], 0.05), r=0.008)
clathe(c, [(0, 0), (0.17, 0), (0.17, 0.035), (0, 0.04)], sw['x'], Y1 + 0.5, sz1_ + 0.6 - 0.0, '#2a2a2c', seg=14)   # 圓凳
ccyl(cm, (sw['x'], Y1, sz1_ + 0.6), (sw['x'], Y1 + 0.5, sz1_ + 0.6), 0.02, '#8d9196', seg=6); clathe(cm, [(0, 0), (0.18, 0), (0.0, 0.03)], sw['x'], Y1, sz1_ + 0.6, '#3a3c40', seg=10)
psw.done()
fb = I1('fabric'); pfb = Part('fabric', lv=1); c = pfb['vc']
for k, (dx_, dz_, h_, col) in enumerate(((-0.18, 0.05, 1.7, '#d8742c'), (0.0, -0.08, 1.85, '#e08a4a'), (0.17, 0.06, 1.6, '#2950a8'), (0.06, 0.15, 1.45, '#efefea'), (-0.1, -0.15, 1.3, '#1f2d55'))):
    ccyl(c, (fb['x'] + dx_, Y1, fb['z'] + dz_), (fb['x'] + dx_ + 0.04, Y1 + h_, fb['z'] + dz_), 0.07, col, seg=10)
crb(pfb['vcm'], fb['x'] - 0.3, fb['x'] + 0.3, Y1, Y1 + 0.3, fb['z'] - 0.25, fb['z'] + 0.25, '#3a3c40', r=0.01)
pfb.done()
sr = I1('sample_room'); rx0, rx1, rz0, rz1 = sr['x'] - sr['w'] / 2, XI1, sr['z'] - sr['d'] / 2, sr['z'] + sr['d'] / 2
psr = Part('sample_room', lv=1); cm = psr['vcm']
for z in (rz0, (rz0 + rz1) / 2, rz1): crb(cm, rx0 - 0.03, rx0 + 0.03, Y1, HT - 0.4, z - 0.03, z + 0.03, ALU, r=0.006)
for y in (Y1, Y1 + 2.4, HT - 0.4): crb(cm, rx0 - 0.03, rx0 + 0.03, y, y + 0.05, rz0, rz1, ALU, r=0.006)
for z in (rz0, rz1): psr['wall'].box(rx0, XI1, Y1, HT, z - 0.06, z)
psr['glass'].quad([(rx0, Y1 + 0.05, rz1), (rx0, Y1 + 0.05, rz0), (rx0, HT - 0.4, rz0), (rx0, HT - 0.4, rz1)])
psr['wall'].box(rx0 - 0.03, XI1, HT - 0.4, HT, rz0, rz1)
psr['sign'].rect((rx0 - 0.035, HT - 0.2, (rz0 + rz1) / 2), (0, 0, 1), (0, 1, 0), 0.5, 0.15, ATL['sign_sample'])
ccyl(cm, ((rx0 + rx1) / 2, Y1 + 1.85, rz0 + 0.05), ((rx0 + rx1) / 2, Y1 + 1.85, rz1 - 0.05), 0.012, CHROME, seg=6)
psr.done()
z = rz0 + 0.12; k = 0
while z < rz1 - 0.1: G_('jersey', ['royal', 'sky', 'white', 'navy'][k % 4], lite=True).place(fm(((rx0 + rx1) / 2, Y1 + 1.85, z)), 1); z += 0.09; k += 1
rd = I1('rack_d'); RDT = fm((rd['x'], Y1, rd['z']), rot('Y', rd['ry']))
p = Part('rack_d', lv=1, T=RDT); rack_frame(p, rd['len'], y_rail=1.5); p.done()
hang_row(1, RDT, rd['len'], 1.5, ['royal', 'sky', 'royal', 'white', 'navy'], style='jersey', gap=0.1, yaw=-0.9)

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)


def mkey(ob):
    m_ = re.match(r'(WALL_(?:front|back|left|right)_L[01])_', ob.name)
    if m_: return m_.group(1)
    m_ = re.match(r'(L[01])_', ob.name); return m_.group(1) if m_ else ''


L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=mkey)
for ob in root.children:
    m_ = re.match(r'WALL_(front|back|left|right)_', ob.name)
    if ob.type == 'MESH' and m_ and 'dir' not in ob: ob['dir'] = DIRS[m_.group(1)]
ss = None if os.environ.get('XS_NOSS') else L.single_side(root, keep=r'glass', nodup=r'xs_(plaster|wood|floor_tile|ceiling|goods|sign|emit|alpha|stone)')
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出 EXT_mesh_gpu_instancing 的節點叫 xinsheng_sports_interior.N、沒有自訂屬性 → 改成網格的名字（L0_…_inst／WALL_left_L0_…_inst），
    牆上的補 extras.dir（好拍子代理的做法：遊戲用名字 /WALL_/ 認淡出的牆、用 L0_／L1_ 認層）"""
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
per_tris, per_mats = {0: 0, 1: 0}, {0: set(), 1: set()}
for ob in root.children_recursive:
    if ob.type != 'MESH': continue
    m_ = re.search(r'(?:^|_)L([01])_', ob.name); lv = int(m_.group(1)) if m_ else 0
    per_tris[lv] += sum(len(p.vertices) - 2 for p in ob.data.polygons); per_mats[lv] |= {m.name for m in ob.data.materials if m}
info.update({'shop': 'xinsheng_sports', 'layout': 3, 'drawn_tris': sum(per_tris.values()), 'per_level_tris': per_tris, 'per_level_mats': {k: sorted(v) for k, v in per_mats.items()},
             'per_level_mat_count': {k: len(v) for k, v in per_mats.items()},
             'protos': {p.name: p.n for p in [BALL_B, BALL_V, BALL_T, FIXP, SPOTP] + BOTTLE + SHOE + BAGS + TROPHY + list(_GP.values())},
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m}), 'lights': LIGHTS})
L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', per_tris, {k: len(v) for k, v in per_mats.items()}, 'bytes', info['bytes'], 'shoes', ns1, ns2)
