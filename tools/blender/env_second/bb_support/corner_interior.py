"""轉角唱片（公館店面街 G12，取代「二手唱片」）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-04 v1：照使用者的參考圖 gongguan_corner_int 做（SCENE_RULES 第 12 節：參考圖就是規格）。
  python3 tools/blender/env_second/bb_support/corner_tex.py            # 先畫貼圖（→ tools/blender/env_second/textures/gen/corner_*）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/corner_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
配置（家具位置、大小、座位、互動點、導航阻擋）只寫在 src/data/corner_layout.js，這裡讀同一份。做法、命名照慢輪單車（bike_interior.py）。
座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。參考圖的鏡頭：layout 的 camRef。
從店門往裡看（參考圖由左到右、由前到後）：
  左：休息區（波斯地毯、兩張深綠單人沙發、圓邊几、龜背芋）、低唱片櫃、低音響櫃（唱盤、喇叭、擴大機）、海報「台北的午後」、黃金葛、
      上半段飾板「轉角唱片 Corner Records」、後面一整面唱片牆。
  中：三座木頭唱片箱（分類牌、黑膠一排一排；最前面那座貼「公館聲響祭」海報和手寫紙卡）；後面木櫃台（螢幕、蘑菇檯燈、噴瓶、小盆花、一疊唱片）；
      天花板：外露的樑、管線、兩條軌道燈、吸頂冷氣、兩盞白色吊燈。
  右：試聽區（長桌、耳機兩組＋耳機架、小擴大機、喇叭、檯燈、牌子、兩張高腳椅）；黑色鐵架上的音響；白盆大盆栽；牆上一整面海報、畫框；布旗。
  後：後牆唱片架＋紙箱、橡膠樹、綠色布簾（倉庫）、亮燈的小展示龕。
唱片：每張是一片薄板（封面＝自製印刷圖集），一整排做成原型、用 instancing 重複；沒有任何真實品牌（D77）。
CORNER-IN-1107（LAWWW2-B 2026-11-07 改；MODEL_READY 第一輪，LAWWW-B 15:00「改，照 (a)」；CC〔帳號 A〕休班）：
  牆邊家具上的音響、唱盤要跟著那面牆淡出。原本的原型（Proto 'speaker'／'amp'／'receiver'／'deck'／'turntable'）沒有 side：
  匯出的 GPU instancing 節點掛在根節點、網格名字不是 WALL_ 開頭，fix_instanced_names 不補 extras.dir——鐵架（WALL_right）、音響櫃（WALL_left）、
  展示龕（WALL_back）、試聽吧台（WALL_right）淡出時，上面的機器留在空中。改成照放的地方分原型：擴大機、收音機、卡座 side right（只在鐵架）；
  喇叭 SPK＝right（鐵架、吧台）、SPK_L＝left（音響櫃）；唱盤 TT＝right（鐵架）、TT_L＝left（音響櫃）、TT_B＝back（展示龕）。幾何、位置、材質都沒動。
CORNER-CEIL-1107／CORNER-FADE-1107（LAWWW2-B 2026-11-07 第二次改；BB-B 16:04 判 e66781d1f：P2 天花板切掉時樑、白色燈盒〔冷氣〕、店名飾板從上面擋住畫面；
  P3 鏡頭在東側時右牆的 instancing 音響一起淡出、黃金葛架沒跟著）——幾何、位置、材質都沒動，只改分組、名字、extras：
  - 樑、管線、軌道、投射燈、吸頂冷氣＝side 'ceil'（網格名字 CEIL_ 開頭，合併成自己一組）；左牆上半段的店名飾板自己一組 WALL_left_TOP_…、extras.ceilHide。
    遊戲（zones3d.js attachRoomGLB，patch 給 LAWWW-B）：鏡頭高過天花板時藏起來。吊燈、吊繩照舊（和其他店一樣）。
  - 每一面牆的零件（含 instancing 節點）都給同一個淡出判斷點 extras.at：那一面最靠店裡的東西那條線（右牆＝鐵架前緣 x 2.71）。"""
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

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'corner_layout.js')]))['corner']
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'corner_atlas.json')))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT      # 內面 x ±3.88、z ±5.88
ITL = LAY['items']
IT = {}
for i in ITL: IT.setdefault(i['kind'], i)
random.seed(650)
B.reset(texres=1024)
L.Mesh.rbox.__defaults__ = (0.03, 1)   # 倒角一段就好（木條、門框：三段的倒角在這個距離看不出來，三角形多三倍）
root = B.group('corner_interior', props={'kind': 'corner_interior', 'w': W, 'd': D, 'h': H, 'layout': 1})
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


P = 'cr_'
# 11 個材質：地板（自製磨石子）、牆、天花板（外露的水泥）、木頭（胡桃木；Poly Haven CC0）＋頂點色（霧面、金屬）＋玻璃＋透明圖集、印刷圖集、會亮的、招牌
M = {
    'floor': img_mat(P + 'floor_terrazzo', 'corner_floor.png', rough=0.3, tile=1.0),
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#dcc3a0', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'ceil': L.pbr(P + 'concrete', 'granular_concrete', tile=1.6, target='#7c6a58', normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.92),
    'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=1.0, target='#5f4330', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.5),   # 參考圖的唱片箱、唱片牆是中間色的胡桃木
    'vc': L.vc_material(P + 'vc', rough=0.6), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.4),
    'glass': L.flat(P + 'glass', '#d4e2e0', rough=0.05, alpha=0.14),
    'emit': img_mat(P + 'emit', 'corner_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha', 'corner_alpha.png', rough=0.5, clip=True),
    'goods': img_mat(P + 'goods', 'corner_goods.png', rough=0.62),
    'sign': img_mat(P + 'sign', 'corner_sign.png', rough=0.7),
}
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件（音響、唱盤、沙發、櫃子…）改成「頂點色 × ambientCG 材質組」——每個零件原本的顏色照舊，
#      加上 CC0 的紋路、法線（霧面＝Fabric030 布紋／皮面看起來比較像布、木作；金屬＝Metal009）（做法 SHOP_CC0_HOWTO.md）
sys.path.insert(0, os.path.dirname(HERE)); import cc0_kit   # noqa: E402,E401
CK = cc0_kit.Kit(root, P[:-1])
M['vc'] = CK.vc_tex(P + 'vc', 'Plastic006', vary=0.015, tile=0.35, rough_value=0.6, normal=0.25)   # vary 0.015、法線 0.25：淺色包裝不能有灰黑刮痕（HOWTO 第 1 節第 5 點）
M['vcm'] = CK.vc_tex(P + 'vc_metal', 'Metal009', vary=0.12, tile=0.3, rough_value=0.38, metal=0.4)
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


UVK = ('goods', 'alpha', 'emit', 'sign')


def pre(side):
    """網格名字的開頭：side＝left／right／back／front → WALL_<面>_（那面牆的淡出組）；'ceil' → CEIL_（貼著天花板的東西：鏡頭高過天花板時遊戲把它藏起來）；沒有 → cr_"""
    return 'CEIL_' if side == 'ceil' else (f'WALL_{side}_' if side else P)


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組"""
    def __init__(self, name, side=None, T=None, smooth=True): self.name, self.side, self.T, self.smooth, self.m = name, side, T, smooth, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = pre(self.side) + f'{self.name}_{key}'
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
            if self.side in DIRS: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign', 'goods', 'alpha', 'emit'): L.smooth_mesh(ob, angle=0.6)
            obs.append(ob)
        self.m = {}; return obs


def inst(obs, name, T, side=None):
    out = []
    for ob in obs:
        key = ob.name.rsplit('_', 1)[-1]
        no = bpy.data.objects.new(pre(side) + f'{name}_{key}', ob.data); B.scene().collection.objects.link(no); no.parent = root
        no.matrix_basis = T
        if side in DIRS: no['dir'] = DIRS[side]
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



def frame_on_wall(p, x, y, z, w, h, cell, axis='x', sgn=1, fcol='#6b4a30', depth=0.025):
    """有木框的海報、照片（貼在牆上）：axis＝牆的法線軸（x：左右牆；z：前後牆、隔間牆）"""
    if axis == 'x':
        p['wood'].rbox(x - (depth if sgn < 0 else 0), x + (depth if sgn > 0 else 0), y - h / 2 - 0.025, y + h / 2 + 0.025, z - w / 2 - 0.025, z + w / 2 + 0.025, r=0.005)
        p['goods'].rect((x + sgn * (depth + 0.001), y, z), (0, 0, -sgn), (0, 1, 0), w / 2, h / 2, ATL[cell] if isinstance(cell, str) else cell)
    else:
        p['wood'].rbox(x - w / 2 - 0.025, x + w / 2 + 0.025, y - h / 2 - 0.025, y + h / 2 + 0.025, z - (depth if sgn < 0 else 0), z + (depth if sgn > 0 else 0), r=0.005)
        p['goods'].rect((x, y, z + sgn * (depth + 0.001)), (sgn, 0, 0), (0, 1, 0), w / 2, h / 2, ATL[cell] if isinstance(cell, str) else cell)



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


def quad_uv(u, pts, uvr):
    """四邊形（左下、右下、右上、左上）貼一格圖"""
    u0, v0, u1, v1 = uvr; return u.face(pts, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])


def V(*a): return Vector(a)


def lp_rec(u, x, y0, z, cell, back, tilt=0.2, s=0.305, th=0.004, yaw=0.0):
    """一張黑膠（封面朝 +z，往後〔−z〕靠 tilt 弧度）：前面封面、後面另一張封面、上緣書背"""
    cy, sy = math.cos(yaw), math.sin(yaw)
    r = V(cy, 0, -sy); n0 = V(sy * math.cos(tilt), math.sin(tilt), cy * math.cos(tilt)); up = V(-sy * math.sin(tilt), math.cos(tilt), -cy * math.sin(tilt))
    b = V(x, y0, z); bf, bb = b + n0 * (th / 2), b - n0 * (th / 2); hs = r * (s / 2)
    quad_uv(u, [tuple(bf - hs), tuple(bf + hs), tuple(bf + hs + up * s), tuple(bf - hs + up * s)], ATL[cell])
    quad_uv(u, [tuple(bb + hs), tuple(bb - hs), tuple(bb - hs + up * s), tuple(bb + hs + up * s)], ATL[back])
    sp = sub('spines_lp', random.uniform(0, 0.9), 0.3, 0, 0.7); sp = (sp[0], sp[1], sp[0] + 0.004, sp[3])
    quad_uv(u, [tuple(bf - hs + up * s), tuple(bf + hs + up * s), tuple(bb + hs + up * s), tuple(bb - hs + up * s)], sp)


NCOV = sum(1 for k in ATL if k.startswith('cover'))


def stack_build(n, seed, sp=0.03):
    """唱片箱裡的一排（n 張，從 +z〔前〕往 −z 排）：原點在這一排的前緣中間、箱子內底"""
    def f(pt):
        rr = random.Random(seed); u = pt['goods']
        lp_rec(u, 0.0, 0.0, -0.012, f'hero{seed % 12}', f'cover{rr.randrange(NCOV)}', tilt=0.07, yaw=0.0)   # v1b：最前面那張幾乎直立、封面正對前面（參考圖每一欄看得到一張封面）
        for k in range(1, n):
            c = f'cover{rr.randrange(NCOV)}' if rr.random() < 0.7 else f'hero{rr.randrange(12)}'; b = f'cover{rr.randrange(NCOV)}'
            lp_rec(u, rr.uniform(-0.004, 0.004), 0.0, -0.05 - (k - 1) * sp, c, b, tilt=0.2 + rr.uniform(-0.05, 0.05), yaw=rr.uniform(-0.025, 0.025))
    return f


STACKS = {}


def stack_proto(n, variant):
    key = (n, variant)
    if key not in STACKS: STACKS[key] = Proto(f'lpstack{n}_{variant}', stack_build(n, 100 + variant * 5 + n))
    return STACKS[key]


# ======================================================================
# 房間：地、外露的天花板（樑、管線）、牆（淡出的組）、店面（櫥窗、木門）
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
ce = Part('ceiling', smooth=False); ce['ceil'].quad([(XI0, H, ZI0), (XI1, H, ZI0), (XI1, H, ZI1), (XI0, H, ZI1)]); ce.done()
bm_ = Part('beams', side='ceil', smooth=False)   # CORNER-CEIL-1107：樑、管線、軌道、投射燈、冷氣＝CEIL_（BB-B 16:04：天花板切掉時，樑、燈盒從上面擋住畫面）
for zb in (3.1, -1.0, -4.1):   # 外露的樑（沿 x）
    bm_['ceil'].box(XI0 + 0.46, XI1, H - 0.36, H, zb - 0.15, zb + 0.15)   # 左端停在唱片牆、飾板前面
bm_.done()
pp = Part('pipes', side='ceil')   # 管線（沿 z）：消防水管、電線導管
for (x, y, r, col) in ((-3.2, H - 0.12, 0.045, '#c9c2b4'), (-0.95, H - 0.09, 0.025, '#b9b4aa'), (0.75, H - 0.1, 0.018, '#d0cbc0'), (3.05, H - 0.13, 0.05, '#c0b9ad')):
    ccyl(pp['vcm'], (x, y, ZI1), (x, y, ZI0), r, col, seg=8)
    zz = ZI1 - 0.6
    while zz > ZI0:
        crb(pp['vcm'], x - r - 0.01, x + r + 0.01, y - r - 0.01, H, zz - 0.012, zz + 0.012, '#6f6b64', r=0.002); zz -= 1.5
for zz in (4.4, 1.0, -3.0): ccyl(pp['vcm'], (XI0 + 0.3, H - 0.2, zz), (XI1 - 0.3, H - 0.2, zz), 0.016, '#b9b4aa', seg=6)
# v1b：老房子改的店——鍍鋅風管（方管沿 z、吊架）、一根軟風管接到冷氣、更多電線導管、灑水頭、線槽
pp.done()
pp = Part('duct', side='right')   # 靠右牆（鐵架上面），放進右牆的淡出組：遊戲鏡頭從上面看時不會在店中間擋一條
dx_ = 2.95; zf0, zf1 = ZI1 - 0.3, ZI0 + 0.4
crb(pp['vcm'], dx_ - 0.22, dx_ + 0.22, H - 0.62, H - 0.4, zf1, zf0, '#a8aaa8', r=0.01)
zz = zf0 - 0.2
while zz > zf1:
    crb(pp['vcm'], dx_ - 0.235, dx_ + 0.235, H - 0.635, H - 0.62, zz - 0.02, zz + 0.02, '#7d7f80', r=0.002)   # 接縫
    for sx_ in (-1, 1): ccyl(pp['vcm'], (dx_ + sx_ * 0.2, H - 0.62, zz), (dx_ + sx_ * 0.2, H, zz), 0.005, '#6f6b64', seg=4)
    zz -= 1.2
for zg in (3.4, 0.6, -2.2): crb(pp['vcm'], dx_ - 0.2, dx_ + 0.2, H - 0.64, H - 0.62, zg - 0.12, zg + 0.12, '#5a5c5e', r=0.004)   # 出風口
pp.done()
pp = Part('pipes2', side='ceil')
for (x, col) in ((-2.3, '#3a3a3a'), (-2.2, '#d8d2c4'), (2.2, '#3a3a3a'), (2.55, '#c9c4b8'), (-1.35, '#b9b4aa')):
    ccyl(pp['vcm'], (x, H - 0.05, ZI1), (x, H - 0.05, ZI0), 0.012, col, seg=5)
for zz in (4.0, 1.4, -1.6, -4.4):
    for x in (-2.0, 0.2, 2.4): ccyl(pp['vcm'], (x, H - 0.1, zz), (x, H - 0.16, zz), 0.012, '#c9a24a', seg=6)   # 灑水頭
crb(pp['vcm'], -2.95, -2.75, H - 0.08, H - 0.04, ZI0 + 0.3, ZI1 - 0.2, '#8d8a84', r=0.003)   # 線槽
pp.done()
for side in ('left', 'right', 'back'):
    p = Part('wall', side=side, smooth=False)
    if side == 'left': p['wall'].box(X0, XI0, 0, H, Z0, Z1); p['wood'].box(XI0, XI0 + 0.015, 0, 0.1, ZI0, ZI1)
    elif side == 'right': p['wall'].box(XI1, X1, 0, H, Z0, Z1); p['wood'].box(XI1 - 0.015, XI1, 0, 0.1, ZI0, ZI1)
    else: p['wall'].box(X0, X1, 0, H, Z0, ZI0); p['wood'].box(XI0, XI1, 0, 0.1, ZI0, ZI0 + 0.015)
    p.done()

# 店面：左邊櫥窗（上面一排小氣窗）、右邊木門（上面一道氣窗；營業中，門扇往裡開、貼在門框東側）
fr = LAY['front']; dx, dw, dh, dtr = fr['door']['x'], fr['door']['w'], fr['door']['h'], fr['door']['transom']; TRY = fr['transomY']
pf = Part('front', side='front', smooth=False)
da, db = dx - dw / 2, dx + dw / 2
ops = sorted([(a, b, sl, hd) for a, b, sl, hd in fr['windows']] + [(da, db, 0.0, dtr)])
xs_ = XI0
for a, b, sl, hd in ops:
    pf['wall'].box(xs_, a, 0, H, ZI1, Z1); pf['wall'].box(a, b, hd, H, ZI1, Z1)
    if sl > 0: pf['wall'].box(a, b, 0, sl, ZI1, Z1)
    xs_ = b
pf['wall'].box(xs_, XI1, 0, H, ZI1, Z1)
for a, b, sl, hd in ops:   # 木框（深色木：外觀圖的門窗是深咖啡色）
    pf['wood'].rbox(a, b, hd - 0.07, hd, ZI1 - 0.06, Z1 - 0.02, r=0.006)
    for x in (a, b): pf['wood'].rbox(x - 0.045, x + 0.045, sl, hd, ZI1 - 0.06, Z1 - 0.02, r=0.006)
    ty = TRY if sl > 0 else dh
    pf['wood'].rbox(a, b, ty - 0.03, ty + 0.03, ZI1 - 0.05, Z1 - 0.03, r=0.005)   # 氣窗下的橫框
    nt_ = max(2, int(round((b - a) / 0.55)))
    for k in range(1, nt_): x = a + k * (b - a) / nt_; pf['wood'].rbox(x - 0.02, x + 0.02, ty, hd, ZI1 - 0.05, Z1 - 0.03, r=0.004)   # 一排小氣窗的直框
    pf['glass'].quad([(b, ty + 0.03, Z1 - 0.06), (a, ty + 0.03, Z1 - 0.06), (a, hd - 0.07, Z1 - 0.06), (b, hd - 0.07, Z1 - 0.06)])
    if sl > 0:
        pf['wood'].rbox(a, b, sl - 0.02, sl + 0.05, ZI1 - 0.16, Z1 - 0.02, r=0.006)   # 窗台
        for x in (a + (b - a) / 3, a + 2 * (b - a) / 3): pf['wood'].rbox(x - 0.03, x + 0.03, sl, TRY, ZI1 - 0.05, Z1 - 0.04, r=0.005)
        pf['glass'].quad([(b, sl + 0.04, Z1 - 0.06), (a, sl + 0.04, Z1 - 0.06), (a, TRY - 0.03, Z1 - 0.06), (b, TRY - 0.03, Z1 - 0.06)])
pf.done()
# 門扇：門軸在東邊（x db），往裡開 90°（貼著門框東側、沿 −z）
LW = dw - 0.06; dp = Part('door_leaf', side='front', T=fm((db - 0.03, 0, ZI1 - 0.02), rot('Y', math.pi / 2)), smooth=False)   # 門扇自己的座標：x 0→LW 是門寬（轉了以後沿 −z）、z 是厚度（−z＝朝店裡）
for (xa_, xb_, ya_, yb_) in ((0.0, 0.08, 0.0, dh - 0.02), (LW - 0.08, LW, 0.0, dh - 0.02), (0.0, LW, 0.0, 0.22), (0.0, LW, dh - 0.12, dh - 0.02), (0.0, LW, 0.95, 1.02)):
    dp['wood'].rbox(xa_, xb_, ya_, yb_, -0.025, 0.025, r=0.006)
dp['glass'].quad([(0.07, 0.22, 0.0), (LW - 0.07, 0.22, 0.0), (LW - 0.07, dh - 0.12, 0.0), (0.07, dh - 0.12, 0.0)])
for zs in (-1, 1): csph(dp['vcm'], (LW - 0.12, 1.02, zs * 0.05), 0.03, '#b8923a', seg=10, rings=5); ccyl(dp['vcm'], (LW - 0.12, 1.02, 0), (LW - 0.12, 1.02, zs * 0.05), 0.008, '#b8923a', seg=6)
dp['goods'].rect((LW * 0.5, 1.4, -0.03), (-1, 0, 0), (0, 1, 0), 0.11, 0.082, ATL['hours'])   # 門內側玻璃上的營業時間（從店裡看得到）
dp.done()
mat_ = Part('doormat'); crb(mat_['vc'], da + 0.1, db - 0.1, 0.0, 0.012, ZI1 - 0.8, ZI1 - 0.1, '#4a3e34', r=0.005); mat_.done()

# ======================================================================
# 天花板：軌道燈（暖色投射燈）、白色吊燈、吸頂冷氣
# ======================================================================
LT = LAY['lights']
trk = Part('tracks', side='ceil')
for (x, za, zb) in LT['tracks']: crb(trk['vcm'], x - 0.018, x + 0.018, H - 0.07, H - 0.035, zb, za, '#1d1d1f', r=0.004); [crb(trk['vcm'], x - 0.01, x + 0.01, H - 0.04, H, zz - 0.01, zz + 0.01, '#1d1d1f', r=0.002) for zz in (za - 0.3, (za + zb) / 2, zb + 0.3)]
trk.done()


def spot_build(pt):
    """軌道投射燈：轉接頭、U 形架、圓筒燈頭（燈面會亮）；原點在燈頭中心，燈頭朝 +z（再轉向打的地方）"""
    c, cm = pt['vc'], pt['vcm']
    clathe(c, [(0.0, -0.07), (0.034, -0.07), (0.036, -0.06), (0.036, 0.06), (0.03, 0.075), (0.0, 0.075)], 0, 0, 0, '#1f1f21', seg=14, R=rot('X', math.pi / 2))
    clathe(c, [(0.0, 0.075), (0.031, 0.075), (0.031, 0.08), (0.0, 0.08)], 0, 0, 0, '#2a2a2c', seg=12, R=rot('X', math.pi / 2))
    tu = ATL['spot']; uv = ((tu[0] + tu[2]) / 2, (tu[1] + tu[3]) / 2); n = 12
    pt['emit'].face([(0.028 * math.cos(2 * math.pi * i / n), 0.028 * math.sin(2 * math.pi * i / n), 0.074) for i in range(n)], [uv] * n)


SPOT = Proto('spot', spot_build, side='ceil')
ARM = Part('spot_arms', side='ceil')
for (x, z, tx_, ty_) in LT['spots']:
    y = H - 0.25; aim = V(tx_ - x, ty_ - y, 0.0 if abs(tx_ - x) > 0.5 else -0.8)
    yaw = math.atan2(aim.x, aim.z); pit = math.atan2(-aim.y, math.hypot(aim.x, aim.z))
    SPOT.place(fm((x, y, z), rot('Y', yaw) @ rot('X', pit)))
    ccyl(ARM['vcm'], (x, H - 0.07, z), (x, y + 0.05, z), 0.006, '#1d1d1f', seg=5); crb(ARM['vcm'], x - 0.02, x + 0.02, y + 0.04, y + 0.06, z - 0.045, z + 0.045, '#1d1d1f', r=0.003)
    CL.glow(root, 'spot', x, y - 0.05, z, color='rgba(255,214,160,1)', size=0.9, day=0.3, night=1.0)
ARM.done()


def pendant_build(pt):
    """白色圓罩吊燈（琺瑯白、裡面燈泡）"""
    c = pt['vc']
    clathe(c, [(0.2, -0.14), (0.196, -0.125), (0.17, -0.07), (0.11, -0.02), (0.045, 0.0), (0.03, 0.04), (0.0, 0.045)], 0, 0, 0, '#ece6d8', seg=16)
    clathe(c, [(0.0, -0.01), (0.045, -0.02), (0.11, -0.03), (0.17, -0.075), (0.19, -0.13)], 0, 0, 0, '#f6f0e2', seg=16)
    u = pt['emit']; bu = ATL['bulb']; uv = ((bu[0] + bu[2]) / 2, (bu[1] + bu[3]) / 2)
    prof = [(0.0, -0.02), (0.03, -0.035), (0.04, -0.065), (0.026, -0.09), (0.0, -0.095)]; n = 10; rings = []
    for (r, h) in prof: rings.append([(r * math.cos(2 * math.pi * i / n), h, r * math.sin(2 * math.pi * i / n)) for i in range(n)])
    for ra_, rb_ in zip(rings, rings[1:]):
        for i in range(n): j = (i + 1) % n; u.face([rb_[i], rb_[j], ra_[j], ra_[i]], [uv] * 4, smooth=True)


PEND = Proto('pendant', pendant_build)
cords = Part('cords')
for (x, y, z) in LT['pendants']:
    PEND.place(fm((x, y, z)))
    ccyl(cords['vc'], (x, y + 0.04, z), (x, H, z), 0.004, '#1f1f1f', seg=4); crb(cords['vc'], x - 0.045, x + 0.045, H - 0.025, H, z - 0.045, z + 0.045, '#ece6d8', r=0.006)
    CL.glow(root, 'pendant', x, y - 0.15, z, color='rgba(255,220,170,1)', size=1.5, day=0.3, night=1.0)
cords.done()
ac = IT['ac']; pa = Part('ac', side='ceil'); aw = ac['w']
crb(pa['vc'], ac['x'] - aw / 2, ac['x'] + aw / 2, H - 0.06, H, ac['z'] - aw / 2, ac['z'] + aw / 2, '#e6e4dc', r=0.01)
pa['goods'].rect((ac['x'], H - 0.061, ac['z']), (1, 0, 0), (0, 0, 1), aw / 2 - 0.01, aw / 2 - 0.01, ATL['ac_grille'])
pa.done()

# ======================================================================
# 左邊：休息區、低唱片櫃、音響櫃、海報、黃金葛、飾板、唱片牆
# ======================================================================
rg = IT['rug']; prg = Part('rug', smooth=False)
prg['goods'].rect((rg['x'], 0.006, rg['z']), (1, 0, 0), (0, 0, -1), rg['w'] / 2, rg['d'] / 2, ATL['rug'])
crb(prg['vc'], rg['x'] - rg['w'] / 2, rg['x'] + rg['w'] / 2, 0.0, 0.005, rg['z'] - rg['d'] / 2, rg['z'] + rg['d'] / 2, '#5a2a22', r=0.0)
prg.done()


def armchair_build(col):
    """深綠單人沙發（布面，圓角的座墊、靠背、扶手；木腳）：原點在地上、正面 +z"""
    def f(pt):
        c, w_ = pt['vc'], pt['wood']
        def rb(cx, cy, cz, w, h, d, colr, R=None, r=0.05):
            n0 = _N0(c); bm = L.rbox_bm(w, h, d, r=r, seg=2); c.add_bm(bm, fm((cx, cy, cz), R)); bm.free(); c.paint(_new(c, n0), colr)
        rb(0, 0.24, 0.0, 0.74, 0.16, 0.7, col, r=0.04)                                    # 底座
        rb(0, 0.37, 0.06, 0.56, 0.12, 0.56, jit(col, 0.05), r=0.05)                       # 座墊
        rb(0, 0.62, -0.27, 0.66, 0.56, 0.16, col, R=rot('X', -0.16), r=0.06)             # 靠背（往後傾）
        rb(0, 0.6, -0.2, 0.5, 0.3, 0.1, jit(col, 0.05), R=rot('X', -0.18), r=0.045)       # 靠墊
        for s in (-1, 1): rb(s * 0.32, 0.43, 0.02, 0.12, 0.26, 0.7, col, r=0.05)          # 扶手
        for sx in (-1, 1):
            for sz in (-1, 1): ccyl(c, (sx * 0.3, 0.16, sz * 0.28), (sx * 0.32, 0.0, sz * 0.31), 0.022, '#5a3a24', seg=8, r2=0.014)
    return f


ARMC = None
for it in ITL:
    if it['kind'] != 'armchair': continue
    if ARMC is None: ARMC = Proto('armchair', armchair_build(it['color']))
    ARMC.place(fm((it['x'], 0, it['z']), rot('Y', it['yaw'])))
st_ = IT['side_table']; pst = Part('side_table')
clathe(pst['vc'], [(0.0, st_['h'] - 0.03), (st_['r'], st_['h'] - 0.03), (st_['r'] + 0.005, st_['h'] - 0.01), (st_['r'], st_['h']), (0.0, st_['h'])], st_['x'], 0, st_['z'], '#c99a64', seg=22)
for k in range(3):
    a = 2 * math.pi * k / 3 + 0.3; ccyl(pst['vc'], (st_['x'] + 0.1 * math.cos(a), st_['h'] - 0.03, st_['z'] + 0.1 * math.sin(a)), (st_['x'] + 0.2 * math.cos(a), 0.0, st_['z'] + 0.2 * math.sin(a)), 0.016, '#a87a4a', seg=6, r2=0.011)
clathe(pst['vcm'], [(0.0, 0.0), (0.035, 0.0), (0.04, 0.06), (0.022, 0.13), (0.02, 0.16), (0.0, 0.16)], st_['x'] + 0.05, st_['h'], st_['z'] - 0.02, '#c8d8d4', seg=12)   # 玻璃小花瓶（實心、淡綠灰）
for k in range(2):
    a = k * math.pi / 2 + 0.4; pst['alpha'].rect((st_['x'] + 0.05, st_['h'] + 0.21, st_['z'] - 0.02), (math.cos(a), 0, math.sin(a)), (0, 1, 0), 0.08, 0.09, ATL['flowers_y'], both=True)
pst.done()


def leafy(name, x, y, z, cells, n=14, rad=0.35, hgt=(0.5, 1.2), size=(0.12, 0.16), pot=None, potcol='#e8e3d6', side=None, droop=0.5, seed=1):
    """盆栽：盆子（旋轉體）＋一根一根的莖（管子）＋葉片卡（兩面）"""
    if name == 'big_plant':   # SHOP-CC0-HELP-1113：右前的大盆栽（白盆）換 Poly Haven potted_plant_02（掃描）
        o_ = CK.ph_put('potted_plant_02', x, y, z, yaw=1.1, share=False, height=hgt[1] + (pot[1] if pot else 0.0), decimate=0.03)
        # 盆子那個材質換成店裡的 cr_vc（頂點色×Plastic006；盆子沒有頂點色＝白色塑膠盆，參考圖也是白盆）：材質數維持 12（tests/corner_glb_unit.js 第 1 項）
        zs = {}
        for pg in o_.data.polygons: zs.setdefault(pg.material_index, []).append(pg.center.z)
        pot_i = min(zs, key=lambda i: sum(zs[i]) / len(zs[i]))
        o_.data.materials[pot_i] = M['vc']
        return
    p = Part(name, side=side); c = p['vc']; u = p['alpha']; rr = random.Random(seed)
    if pot:
        pr, ph = pot; clathe(c, [(0.0, 0.0), (pr * 0.78, 0.0), (pr, ph * 0.92), (pr * 1.04, ph), (pr * 0.96, ph), (0.0, ph * 0.9)], x, y, z, potcol, seg=18)
        clathe(c, [(0.0, ph * 0.88), (pr * 0.93, ph * 0.88), (0.0, ph * 0.9)], x, y, z, '#4a3424', seg=14); y0 = y + ph * 0.88
    else: y0 = y
    for k in range(n):
        a = rr.uniform(0, 2 * math.pi); r_ = rr.uniform(0.3, 1.0) * rad; hh = rr.uniform(*hgt)
        tip = (x + r_ * math.cos(a), y0 + hh, z + r_ * math.sin(a)); mid = (x + r_ * 0.4 * math.cos(a), y0 + hh * 0.7, z + r_ * 0.4 * math.sin(a))
        cpath(c, [(x, y0, z), mid, tip], 0.006, '#4a6a32', seg=4)
        s_ = rr.uniform(*size); ya = a + rr.uniform(-0.5, 0.5); tl = rr.uniform(0.2, droop + 0.3)
        r3 = (math.cos(ya + math.pi / 2), 0, math.sin(ya + math.pi / 2)); up3 = (math.cos(ya) * math.sin(tl), math.cos(tl), math.sin(ya) * math.sin(tl))
        u.rect((tip[0] + up3[0] * s_ * 0.5, tip[1] + up3[1] * s_ * 0.5, tip[2] + up3[2] * s_ * 0.5), r3, up3, s_ * 0.5, s_ * 0.62, ATL[rr.choice(cells)], both=True)
    p.done()


leafy('monstera', IT['monstera']['x'], 0, IT['monstera']['z'], ['monstera'], n=9, rad=0.4, hgt=(0.45, 0.95), size=(0.3, 0.42), pot=(0.2, 0.36), potcol='#d8d2c4', seed=3)
# 低唱片櫃、音響櫃（靠左牆，正面朝 +x：自己的座標正面 +z、轉 π/2）


def record_shelf(p, Lx, dep, Ht, rows, cw=0.4, doors=None, tops=False, seed=1, face_out=0.18, spines_cd=0.25):
    """唱片櫃（自己的座標：x 是長度方向〔−Lx/2～Lx/2〕、正面朝 +z〔z＝dep/2〕、背板在 z＝−dep/2、y 0～Ht）
    rows：層板高度（由下往上）；doors：最下面那一格做木門（到第一片層板）；tops：最上一層放封面朝外的唱片。"""
    w_, g = p['wood'], p['goods']; rr = random.Random(seed); zf, zb = dep / 2, -dep / 2
    w_.box(-Lx / 2, Lx / 2, 0.0, Ht, zb, zb + 0.015)                                   # 背板
    n = max(1, int(round(Lx / cw))); cw = Lx / n
    for k in range(n + 1): x = -Lx / 2 + k * cw; w_.rbox(x - 0.013, x + 0.013, 0.0, Ht, zb, zf, r=0.004)   # 直的隔板
    ys = [0.0] + list(rows) + [Ht - 0.03]
    for y in ys[1:] + [0.06]: w_.rbox(-Lx / 2, Lx / 2, y, y + 0.026, zb, zf, r=0.004)  # 層板、頂板、底板
    w_.box(-Lx / 2, Lx / 2, 0.0, 0.06, zf - 0.02, zf)                                  # 踢腳
    for j in range(len(ys) - 1):
        y0, y1 = ys[j] + 0.026, ys[j + 1]
        if j == 0 and doors:
            for k in range(n): g.rect((-Lx / 2 + (k + 0.5) * cw, (0.06 + y1) / 2, zf + 0.002), (1, 0, 0), (0, 1, 0), cw / 2 - 0.016, (y1 - 0.06) / 2 - 0.005, ATL['cab_door'])
            continue
        if j == 0: y0 = 0.086
        for k in range(n):
            xc = -Lx / 2 + (k + 0.5) * cw; hw = cw / 2 - 0.016
            if tops and j == len(ys) - 2:   # 最上一層：封面朝外（往後靠）
                lp_rec(g, xc, y0, zb + 0.12, f'cover{rr.randrange(NCOV)}', f'cover{rr.randrange(NCOV)}', tilt=0.16, s=min(0.305, 2 * hw), yaw=0.0); continue
            cd = rr.random() < spines_cd; hh = min(y1 - y0 - 0.01, 0.142 if cd else 0.315)
            ysp = y0
            while ysp + hh <= y1 - 0.005:   # CD 疊兩層
                base = ATL['spines_cd' if cd else 'spines_lp']; uu = rr.uniform(0, 0.55)
                g.rect((xc, ysp + hh / 2, zf - 0.05), (1, 0, 0), (0, 1, 0), hw, hh / 2, (base[0] + (base[2] - base[0]) * uu, base[1], base[0] + (base[2] - base[0]) * (uu + 0.45), base[3]))
                ysp += hh + 0.004
                if not cd: break
            if rr.random() < face_out:   # 有幾張封面朝外擺在書背前面
                lp_rec(g, xc + rr.uniform(-0.03, 0.03), y0, zf - 0.035, f'cover{rr.randrange(NCOV)}', f'cover{rr.randrange(NCOV)}', tilt=0.14, s=min(0.3, 2 * hw), yaw=0.0)


LPL = IT['lp_low']; pll = Part('lp_low', side='left', T=fm((XI0 + LPL['w'] / 2, 0, LPL['z']), rot('Y', math.pi / 2)))
record_shelf(pll, LPL['d'], LPL['w'], LPL['h'], [0.4], cw=0.48, seed=4, face_out=0.3); pll.done()
AC_ = IT['audio_cab']; ATT = fm((XI0 + AC_['w'] / 2, 0, AC_['z']), rot('Y', math.pi / 2))
pac = Part('audio_cab', side='left', T=ATT); w_, g = pac['wood'], pac['goods']; Lc, dc, hc = AC_['d'], AC_['w'], AC_['h']
w_.rbox(-Lc / 2, Lc / 2, hc - 0.03, hc, -dc / 2, dc / 2, r=0.006); w_.box(-Lc / 2, Lc / 2, 0, hc - 0.03, -dc / 2, -dc / 2 + 0.015)
for x in (-Lc / 2, -0.05, Lc / 2): w_.rbox(x - 0.015, x + 0.015, 0.04, hc - 0.03, -dc / 2, dc / 2, r=0.004)
w_.rbox(-Lc / 2, Lc / 2, 0.04, 0.065, -dc / 2, dc / 2, r=0.004); w_.rbox(-Lc / 2, -0.05, 0.36, 0.385, -dc / 2, dc / 2, r=0.004)
for k in range(2): g.rect((0.05 + (k + 0.5) * (Lc / 2 - 0.05) / 2 - 0.0, (0.065 + hc - 0.03) / 2, dc / 2 + 0.002), (1, 0, 0), (0, 1, 0), (Lc / 2 - 0.05) / 4 - 0.012, (hc - 0.095) / 2 - 0.01, ATL['cab_door'])
g.box(-0.35, 0.455, 0.02, 0.48, 0.13, 0.32, 'amp', front='+z', cells={'+z': 'amp'})   # 下層：銀色擴大機
g.rect((-0.35, 0.065 + 0.15, dc / 2 - 0.06), (1, 0, 0), (0, 1, 0), 0.25, 0.14, sub('spines_lp', 0.1, 0, 0.6, 1))   # 最下面一格的黑膠
pac.done()


def tt_build(pt):
    """唱盤（木頭底座、黑轉盤、唱片、唱臂、打開的防塵蓋）：原點在底座底面中心、正面 +z"""
    c, cm, w_, g = pt['vc'], pt['vcm'], pt['wood'], pt['goods']
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(c, (sx * 0.19, 0.0, sz * 0.15), (sx * 0.19, 0.018, sz * 0.15), 0.02, '#1d1d1d', seg=8)
    w_.rbox(-0.225, 0.225, 0.018, 0.1, -0.18, 0.18, r=0.008)
    g.rect((0, 0.1005, 0), (1, 0, 0), (0, 0, -1), 0.215, 0.17, ATL['tt_top'])
    clathe(c, [(0.0, 0.1), (0.152, 0.1), (0.152, 0.116), (0.0, 0.116)], -0.045, 0, 0.0, '#1a1a1a', seg=24)
    clathe(c, [(0.0, 0.116), (0.148, 0.116), (0.148, 0.119), (0.0, 0.119)], -0.045, 0, 0.0, '#202022', seg=24)
    clathe(c, [(0.0, 0.119), (0.045, 0.119), (0.045, 0.1205), (0.0, 0.1205)], -0.045, 0, 0.0, '#d07a3a', seg=14)
    clathe(cm, [(0.0, 0.1), (0.022, 0.1), (0.018, 0.14), (0.0, 0.14)], 0.165, 0, -0.1, '#b9bcbf', seg=10)
    cpath(cm, [(0.165, 0.135, -0.1), (0.15, 0.13, 0.02), (0.08, 0.126, 0.08)], 0.004, '#c9ccce', seg=5)
    crb(c, 0.07, 0.095, 0.115, 0.128, 0.07, 0.095, '#1d1d1d', r=0.002)
    # 防塵蓋（打開，往後立起約 70°）：玻璃 5 面
    gl = pt['glass']; hz = -0.18; R_ = rot('X', -1.2)
    def P_(x, y, z):
        v = R_ @ Vector((x, y, z - hz)); return (v.x, v.y + 0.105, v.z + hz)
    cw_, ch_, cd_ = 0.222, 0.075, 0.36
    pts = {k: P_(*v) for k, v in {'a': (-cw_, 0, 0.18), 'b': (cw_, 0, 0.18), 'c': (cw_, 0, -0.18), 'd': (-cw_, 0, -0.18), 'A': (-cw_, ch_, 0.18), 'B': (cw_, ch_, 0.18), 'C': (cw_, ch_, -0.18), 'D': (-cw_, ch_, -0.18)}.items()}
    for q in ('ABCD', 'abBA', 'bcCB', 'daAD'): gl.quad([pts[ch] for ch in q])
    for q in ('AB', 'BC', 'CD', 'DA'): ccyl(c, pts[q[0]], pts[q[1]], 0.003, '#3a3a3c', seg=4, caps=False)


TT = Proto('turntable', tt_build, side='right'); TT_L = Proto('turntable', tt_build, side='left'); TT_B = Proto('turntable', tt_build, side='back')   # LAWWW2-B 11-07：照放的地方分（見檔案開頭 CORNER-IN-1107）


def speaker_build(pt):
    """書架喇叭（胡桃木箱、黑色面板）：原點底面中心、正面 +z"""
    c, g = pt['vc'], pt['goods']
    crb(c, -0.11, 0.11, 0.0, 0.34, -0.12, 0.12, '#6a4428', r=0.008)
    g.rect((0, 0.17, 0.1205), (1, 0, 0), (0, 1, 0), 0.105, 0.165, ATL['speaker'])


SPK = Proto('speaker', speaker_build, side='right'); SPK_L = Proto('speaker', speaker_build, side='left')   # LAWWW2-B 11-07：右＝鐵架、試聽吧台；左＝音響櫃


def gear_build(cell, w=0.43, h=0.12, d=0.32, col='#b8b6b0'):
    """音響（擴大機、收音機、卡帶座）：金屬箱＋正面板（印刷）＋兩個旋鈕"""
    def f(pt):
        cm, g = pt['vcm'], pt['goods']
        crb(cm, -w / 2, w / 2, 0.012, h, -d / 2, d / 2, col, r=0.006)
        for sx in (-1, 1): ccyl(pt['vc'], (sx * (w / 2 - 0.03), 0.0, d / 2 - 0.04), (sx * (w / 2 - 0.03), 0.012, d / 2 - 0.04), 0.014, '#1d1d1d', seg=6)
        g.rect((0, h / 2 + 0.006, d / 2 + 0.001), (1, 0, 0), (0, 1, 0), w / 2 - 0.004, h / 2 - 0.008, ATL[cell])
        for kx in (-0.33, 0.33): clathe(cm, [(0.0, 0.0), (0.018, 0.0), (0.017, 0.022), (0.0, 0.024)], kx * w, h * 0.45, d / 2, '#d0d0cc' if col != '#2a2a2c' else '#8a8a88', seg=12, R=rot('X', math.pi / 2))
    return f


AMP = Proto('amp', gear_build('amp'), side='right'); RCV = Proto('receiver', gear_build('receiver', col='#2a2a2c'), side='right'); DECK = Proto('deck', gear_build('deck', h=0.13), side='right')   # LAWWW2-B 11-07：只放在右牆鐵架上
TT_L.place(ATT @ fm((-0.32, hc, 0.0)))
SPK_L.place(ATT @ fm((0.42, hc, 0.02), rot('Y', -0.25)))
pw = Part('leftwall_deco', side='left'); xw = XI0 + 0.012
pt_ = IT['poster_taipei']; frame_on_wall(pw, xw, pt_['y'], pt_['z'], pt_['w'], pt_['h'], 'poster_taipei', fcol='#2a2622', depth=0.02)
ps_ = IT['plant_shelf']; pw['wood'].rbox(XI0, XI0 + 0.24, ps_['y'] - 0.03, ps_['y'], ps_['z'] - ps_['d'] / 2, ps_['z'] + ps_['d'] / 2, r=0.004)
for zz in (ps_['z'] - ps_['d'] / 2 + 0.1, ps_['z'] + ps_['d'] / 2 - 0.1): ccyl(pw['vcm'], (XI0, ps_['y'] - 0.12, zz), (XI0 + 0.2, ps_['y'] - 0.03, zz), 0.006, '#2a2b2d', seg=4)
pw.done(); pw = Part('TOP_logo', side='left')   # CORNER-CEIL-1107：店名飾板自己一組（WALL_left_TOP_…、extras.ceilHide）：BB-B 16:04 坐沙發時鏡頭在天花板上面，飾板在畫面上方擋一大塊
lpn = IT['logo_panel']   # 上半段的飾板（深灰綠漆面＋字：從店門那一端開始寫）
pw['vc'].crbox(XI0, XI0 + 0.02, lpn['y'] - lpn['h'] / 2, lpn['y'] + lpn['h'] / 2, lpn['z'] - lpn['d'] / 2, lpn['z'] + lpn['d'] / 2, '#43504d', r=0.004)
pw['sign'].rect((XI0 + 0.0215, lpn['y'], lpn['z']), (0, 0, -1), (0, 1, 0), lpn['d'] / 2, lpn['h'] / 2, ATL['logo_panel'])
pw.done()
RW_TOP = IT['record_wall']['hBack']
pothos('pothos_l1', XI0 + 0.12, ps_['y'], ps_['z'] - 0.3, side='left', nv=14, drop=1.3, dirx=1)
pothos('pothos_l2', XI0 + 0.12, ps_['y'], ps_['z'] + 0.3, side='left', nv=12, drop=1.0, dirx=1, dirz=0.5)
pothos('pothos_l3', XI0 + 0.2, RW_TOP, -1.9, side='left', nv=10, drop=1.1, dirx=1)   # 唱片牆上面兩盆（參考圖：後段的唱片架上面有植物）
pothos('pothos_l4', XI0 + 0.2, RW_TOP, -4.1, side='left', nv=8, drop=0.8, dirx=1)
psl = IT['plant_stool']; pss = Part('plant_stool')
pss['wood'].rbox(psl['x'] - 0.15, psl['x'] + 0.15, 0.42, 0.45, psl['z'] - 0.15, psl['z'] + 0.15, r=0.006)
for sx in (-1, 1):
    for sz in (-1, 1): pss['wood'].rbox(psl['x'] + sx * 0.12 - 0.015, psl['x'] + sx * 0.12 + 0.015, 0.0, 0.42, psl['z'] + sz * 0.12 - 0.015, psl['z'] + sz * 0.12 + 0.015, r=0.004)
pss.done()
leafy('stool_plant', psl['x'], 0.45, psl['z'], ['small0', 'small1'], n=22, rad=0.2, hgt=(0.15, 0.45), size=(0.08, 0.12), pot=(0.1, 0.17), potcol='#e8e3d6', seed=5)
RW = IT['record_wall']; rz0, rz1, sz_ = RW['z'] + RW['d'] / 2, RW['z'] - RW['d'] / 2, RW['splitZ']   # v1b：飾板下面那一段 2.3 m、飾板後面加高到 2.95（快到天花板）
prw = Part('record_wall', side='left', T=fm((XI0 + RW['w'] / 2, 0, (rz0 + sz_) / 2), rot('Y', math.pi / 2)))
record_shelf(prw, rz0 - sz_, RW['w'], RW['h'], [0.7, 1.08, 1.46, 1.86], cw=0.4, doors=True, tops=True, seed=7)
prw.done()
prw = Part('record_wall_hi', side='left', T=fm((XI0 + RW['w'] / 2, 0, (sz_ + rz1) / 2), rot('Y', math.pi / 2)))
record_shelf(prw, sz_ - rz1, RW['w'], RW['hBack'], [0.7, 1.08, 1.46, 1.86, 2.24, 2.6], cw=0.4, doors=True, tops=True, seed=8)
RW = dict(RW, d=rz0 - rz1)
for k in range(5): prw['goods'].rect((-RW['d'] / 2 + 0.6 + k * 1.35, 1.32 if k % 2 else 0.94, RW['w'] / 2 + 0.004), (1, 0, 0), (0, 1, 0), 0.05, 0.035, ATL['note_new' if k % 2 else 'note_price'])
prw.done()

# ======================================================================
# 中間：三座唱片箱、櫃台
# ======================================================================
def bin_box(it, k):
    x, z, w, d, h = it['x'], it['z'], it['w'], it['d'], it['h']; xa, xb, za, zb = x - w / 2, x + w / 2, z - d / 2, z + d / 2
    p = Part(f'bin{k}'); w_, c, g = p['wood'], p['vc'], p['goods']
    t = 0.035
    w_.rbox(xa + 0.03, xb - 0.03, 0.0, 0.08, za + 0.03, zb - 0.03, r=0.006)                   # 底座（往裡縮）
    for (a0, a1, b0, b1) in ((xa, xb, zb - t, zb), (xa, xb, za, za + t), (xa, xa + t, za, zb), (xb - t, xb, za, zb)): w_.rbox(a0, a1, 0.08, h, b0, b1, r=0.005)
    for (a0, a1, b0, b1) in ((xa - 0.01, xb + 0.01, zb - t - 0.005, zb + 0.012), (xa - 0.01, xb + 0.01, za - 0.012, za + t + 0.005), (xa - 0.012, xa + t + 0.005, za, zb), (xb - t - 0.005, xb + 0.012, za, zb)):
        w_.rbox(a0, a1, h - 0.035, h, b0, b1, r=0.006)                                       # 上緣一圈
    for (a0, a1) in ((xa + 0.02, xa + 0.06), (xb - 0.06, xb - 0.02)): w_.rbox(a0, a1, 0.08, h - 0.035, zb, zb + 0.014, r=0.004)   # 正面的框
    w_.rbox(xa + 0.02, xb - 0.02, 0.08, 0.12, zb, zb + 0.014, r=0.004)
    IB = 0.14   # v1b：內底墊高（v1 是 0.22，唱片只露出上緣）：唱片露出一半左右，和參考圖一樣
    c.cbox(xa + t, xb - t, h - IB - 0.02, h - IB, za + t, zb - t, '#3a2a1e')                    # 內底（暗）
    n4 = max(2, int((w - 2 * t) / 0.33)); cw = (w - 2 * t) / n4   # 一欄 0.33 m 左右（v1c：箱子 1.1～1.2 m 寬 → 3 欄）
    for j in range(1, n4): xx = xa + t + j * cw; c.cbox(xx - 0.006, xx + 0.006, h - IB, h - 0.05, za + t, zb - t, '#5a4030')   # 隔板
    if it.get('poster'):
        g.rect((xa + 0.5, h * 0.5 + 0.02, zb + 0.0155), (1, 0, 0), (0, 1, 0), 0.42, 0.29, ATL['poster_gg'])
        g.rect((xb - 0.25, h * 0.5 + 0.02, zb + 0.0157), (1, 0, 0), (0, 1, 0), 0.15, 0.214, ATL['note_bin'])
    else:
        g.rect((x, h * 0.55, zb + 0.0155), (1, 0, 0), (0, 1, 0), 0.07, 0.058, ATL['note_price' if k == 1 else 'note_new'])
    # 分類牌（細木架子、立在箱子後緣；兩塊的話一塊在中間）
    sg = it.get('signs', [])
    for i, nm in enumerate(sg):
        zz = za + 0.05 if i == len(sg) - 1 else z + 0.05; cell = f'sign_{nm}'; ww = {'electronic': 0.43, 'citypop': 0.46}.get(nm, 0.36)
        crb(c, x - ww / 2 - 0.01, x + ww / 2 + 0.01, h + 0.14, h + 0.25, zz - 0.012, zz + 0.012, '#2e3533', r=0.004)
        g.rect((x, h + 0.195, zz + 0.0125), (1, 0, 0), (0, 1, 0), ww / 2 - 0.005, 0.05, ATL[cell])
        for sx in (-1, 1): ccyl(c, (x + sx * ww * 0.35, h - IB, zz), (x + sx * ww * 0.35, h + 0.14, zz), 0.005, '#2a2b2d', seg=4)
    p.done()
    # 唱片：每一格一排（instancing）；箱子深的分前後兩排
    nrow = 1 if d < 1.4 else 2; rl = (d - 2 * t - 0.04) / nrow; n = int((rl - 0.03) / 0.03) + 1
    for j in range(n4):
        for rw in range(nrow):
            stack_proto(n, (k * 3 + j + rw) % 6).place(fm((xa + t + (j + 0.5) * cw, h - IB, zb - t - 0.02 - rw * rl)))


for k, it in enumerate([i for i in ITL if i['kind'] == 'bin']): bin_box(it, k)
ct = IT['counter']; cx, cz, cw, cd, ch = ct['x'], ct['z'], ct['w'], ct['d'], ct['h']
ca, cb, za, zb = cx - cw / 2, cx + cw / 2, cz - cd / 2, cz + cd / 2
pc = Part('counter'); w_, c, cm, g = pc['wood'], pc['vc'], pc['vcm'], pc['goods']
w_.rbox(ca - 0.03, cb + 0.03, ch - 0.04, ch, za - 0.03, zb + 0.03, r=0.008)
cf = ATL['counter_face']
for (cc_, r_, hw) in (((cx, (ch - 0.04) / 2, zb + 0.001), (1, 0, 0), cw / 2), ((cb + 0.001, (ch - 0.04) / 2, cz), (0, 0, -1), cd / 2), ((ca - 0.001, (ch - 0.04) / 2, cz), (0, 0, 1), cd / 2)):
    g.rect(cc_, r_, (0, 1, 0), hw, (ch - 0.04) / 2, cf)
w_.box(ca, cb, 0.0, ch - 0.04, za, zb)
c.cbox(ca + 0.02, cb - 0.02, 0.0, 0.08, zb - 0.001, zb + 0.003, '#3a2a1e')
y0 = ch
MON = fm((cx - 0.55, y0, cz - 0.05), rot('Y', 0.2))
pm = Part('monitor', T=MON); crb(pm['vc'], -0.12, 0.12, 0.0, 0.015, -0.09, 0.05, '#1e1e20', r=0.006); ccyl(pm['vc'], (0, 0.01, -0.04), (0, 0.17, -0.04), 0.018, '#1e1e20', seg=6)
crb(pm['vc'], -0.27, 0.27, 0.12, 0.45, -0.065, -0.03, '#1e1e20', r=0.008); pm['emit'].rect((0, 0.285, -0.029), (1, 0, 0), (0, 1, 0), 0.25, 0.15, ATL['screen'])
crb(pm['vc'], -0.22, 0.22, 0.0, 0.02, 0.12, 0.28, '#2a2b2d', r=0.005); pm.done()


def mushroom_lamp(p, x, y, z, s=1.0):
    """蘑菇檯燈（白色半圓燈罩、黃銅燈桿；燈罩下緣會亮）"""
    c, cm = p['vc'], p['vcm']
    clathe(cm, [(0.0, 0.0), (0.075 * s, 0.0), (0.075 * s, 0.015 * s), (0.02 * s, 0.025 * s), (0.0, 0.025 * s)], x, y, z, '#b8923a', seg=16)
    ccyl(cm, (x, y + 0.02 * s, z), (x, y + 0.3 * s, z), 0.008 * s, '#b8923a', seg=6)
    clathe(c, [(0.0, 0.42 * s), (0.06 * s, 0.415 * s), (0.11 * s, 0.39 * s), (0.14 * s, 0.35 * s), (0.15 * s, 0.31 * s), (0.142 * s, 0.305 * s)], x, y, z, '#f2ead8', seg=18)
    u = p['emit']; sh = ATL['shade']; uv = ((sh[0] + sh[2]) / 2, (sh[1] + sh[3]) / 2); n = 14
    u.face([(x + 0.14 * s * math.cos(-2 * math.pi * i / n), y + 0.306 * s, z + 0.14 * s * math.sin(-2 * math.pi * i / n)) for i in range(n)], [uv] * n)


mushroom_lamp(pc, cx - 0.05, y0, cz - 0.18)
clathe(c, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.16), (0.018, 0.2), (0.014, 0.25), (0.0, 0.25)], cx + 0.28, y0, cz - 0.12, '#7ab0a0', seg=12)   # 噴瓶（綠色）
crb(c, cx + 0.265, cx + 0.31, y0 + 0.25, y0 + 0.29, cz - 0.135, cz - 0.08, '#e8e4da', r=0.004)
clathe(c, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.09), (0.0, 0.09)], cx - 1.05, y0, cz + 0.08, '#d8cfc0', seg=14)   # 小盆花（粉紅）
for k in range(2): a = k * math.pi / 2 + 0.3; pc['alpha'].rect((cx - 1.05, y0 + 0.17, cz + 0.08), (math.cos(a), 0, math.sin(a)), (0, 1, 0), 0.1, 0.1, ATL['flowers_p'], both=True)
for k in range(9): lp_rec(g, cx + 0.7 + random.uniform(-0.005, 0.005), y0 + 0.004 + k * 0.006, cz + 0.02, f'cover{(k * 5) % NCOV}', f'cover{(k * 3) % NCOV}', tilt=math.pi / 2, s=0.305)   # 一疊黑膠（平放）
for k in range(3): lp_rec(g, cx + 1.05, y0, cz - 0.2 + k * 0.02, f'cover{(k * 11 + 4) % NCOV}', f'cover{k}', tilt=0.25, s=0.305, yaw=-0.3)   # 立在櫃台東端的三張（新進貨）
hs_ = IT['hours_sign']; crb(c, hs_['x'] - 0.13, hs_['x'] + 0.13, y0, y0 + 0.012, hs_['z'] - 0.05, hs_['z'] + 0.05, '#3a2a1e', r=0.003)
g.rect((hs_['x'], y0 + 0.11, hs_['z'] + 0.02), (1, 0, 0), (0.0, 0.97, -0.24), 0.125, 0.094, ATL['hours'], both=True)
crb(c, cx + 0.95, cx + 1.25, y0, y0 + 0.06, cz + 0.05, cz + 0.28, '#2a2b2d', r=0.008); crb(c, cx + 1.0, cx + 1.2, y0 + 0.06, y0 + 0.08, cz + 0.08, cz + 0.2, '#4a4a4c', r=0.004)   # 收銀小機
pc.done()

# ======================================================================
# 後牆：唱片架（紙箱）、橡膠樹、布簾、小展示龕
# ======================================================================
for k, it in enumerate([i for i in ITL if i['kind'] == 'back_shelf']):
    pbs = Part(f'back_shelf{k}', side='back', T=fm((it['x'], 0, ZI0 + it['d'] / 2)))
    record_shelf(pbs, it['w'], it['d'], it['h'], [0.42, 0.82, 1.22, 1.62], cw=0.42, seed=20 + k, face_out=0.22)
    t = -it['w'] / 2 + 0.04; rr = random.Random(30 + k)
    while t < it['w'] / 2 - 0.3:
        w2 = rr.uniform(0.38, 0.5); h2 = rr.uniform(0.26, 0.34); pbs['goods'].box(t + w2 / 2, it['h'] + h2 / 2, 0.0, w2, h2, 0.36, f'kraft{rr.randrange(4)}', front='+z'); t += w2 + 0.03
    pbs.done()
bp = IT['back_plant']
leafy('back_plant', bp['x'], 0, bp['z'], ['rubber0', 'rubber1'], n=26, rad=0.28, hgt=(0.6, 1.9), size=(0.14, 0.2), pot=(0.18, 0.34), potcol='#cfc6b6', seed=9, droop=0.4)
cu = IT['curtain']; pcu = Part('curtain', side='back'); x0c, x1c = cu['x'] - cu['w'] / 2, cu['x'] + cu['w'] / 2; zc = ZI0 + 0.02
pcu['wood'].rbox(x0c - 0.08, x0c, 0, cu['h'] + 0.08, ZI0, ZI0 + 0.12, r=0.005); pcu['wood'].rbox(x1c, x1c + 0.08, 0, cu['h'] + 0.08, ZI0, ZI0 + 0.12, r=0.005)
pcu['wood'].rbox(x0c - 0.08, x1c + 0.08, cu['h'], cu['h'] + 0.08, ZI0, ZI0 + 0.12, r=0.005)
pcu['vc'].cbox(x0c, x1c, 0, cu['h'], ZI0, ZI0 + 0.004, '#1e1a16')                      # 簾子後面（暗：倉庫）
ccyl(pcu['vcm'], (x0c - 0.03, cu['h'] - 0.04, zc + 0.09), (x1c + 0.03, cu['h'] - 0.04, zc + 0.09), 0.01, '#b8923a', seg=6)
nseg = 10; u0, v0, u1, v1 = ATL['curtain']
for i in range(nseg):   # 皺褶（鋸齒）
    xa_, xb_ = x0c + i * (x1c - x0c) / nseg, x0c + (i + 1) * (x1c - x0c) / nseg; za_, zb_ = zc + 0.09 + (0.03 if i % 2 else -0.0), zc + 0.09 + (0.0 if i % 2 else 0.03)
    ua, ub = u0 + (u1 - u0) * i / nseg, u0 + (u1 - u0) * (i + 1) / nseg
    pcu['goods'].face([(xa_, 0.03, za_), (xb_, 0.03, zb_), (xb_, cu['h'] - 0.05, zb_), (xa_, cu['h'] - 0.05, za_)], [(ua, v0), (ub, v0), (ub, v1), (ua, v1)])
pcu['goods'].rect((cu['x'], cu['h'] + 0.16, ZI0 + 0.002), (1, 0, 0), (0, 1, 0), 0.12, 0.07, ATL['note_staff'])
pcu.done()
ni = IT['niche']; pni = Part('niche', side='back'); xa_, xb_ = ni['x'] - ni['w'] / 2, ni['x'] + ni['w'] / 2; zf_ = ZI0 + ni['depth']
w_ = pni['wood']
w_.rbox(xa_ - 0.1, xa_, 0, ni['h'], ZI0, zf_, r=0.005); w_.rbox(xb_, xb_ + 0.1, 0, ni['h'], ZI0, zf_, r=0.005); w_.rbox(xa_ - 0.1, xb_ + 0.1, ni['h'], ni['h'] + 0.1, ZI0, zf_, r=0.005)
w_.rbox(xa_, xb_, 0, 0.1, ZI0, zf_, r=0.005)
pni['emit'].rect(((xa_ + xb_) / 2, (0.1 + ni['h']) / 2, ZI0 + 0.002), (1, 0, 0), (0, 1, 0), ni['w'] / 2, (ni['h'] - 0.1) / 2, ATL['niche'])   # 暖白的背板（燈）
for y in (0.55, 1.05, 1.55): w_.rbox(xa_, xb_, y, y + 0.025, ZI0, zf_ - 0.05, r=0.004)
rr = random.Random(41)
for y in (0.1, 0.575, 1.075, 1.575):
    for kx in range(2): lp_rec(pni['goods'], xa_ + 0.22 + kx * 0.4, y + 0.002, ZI0 + 0.12 + kx * 0.03, f'cover{rr.randrange(NCOV)}', 'cover0', tilt=0.14, s=0.3)
pni.done()
TT_B.place(fm((ni['x'] + 0.05, 1.075, ZI0 + 0.28), rot('Y', 0.15)))   # 展示龕裡一台唱盤
BL = IT['back_low_right']; pbl = Part('back_low_right', side='right', T=fm((XI1 - BL['w'] / 2, 0, BL['z']), rot('Y', -math.pi / 2)))
record_shelf(pbl, BL['d'], BL['w'], BL['h'], [0.48], cw=0.5, seed=50, face_out=0.25)
for k in range(5): lp_rec(pbl['goods'], -0.8 + k * 0.38, BL['h'], -0.02, f'cover{(k * 7 + 2) % NCOV}', 'cover1', tilt=0.18, s=0.3)   # 櫃子上面立著幾張
pbl.done()

# ======================================================================
# 右邊：鐵架上的音響、大盆栽、試聽區、牆上的海報、布旗
# ======================================================================
ar = IT['audio_rack']; RT = fm((XI1 - ar['w'] / 2, 0, ar['z']), rot('Y', -math.pi / 2))   # 自己的座標：x 沿牆（−d/2～d/2）、正面 +z（朝店裡）
par = Part('audio_rack', side='right', T=RT); cm, w_, g = par['vcm'], par['wood'], par['goods']; Lr, dr = ar['d'], ar['w']
SH = (0.12, 0.6, 1.08, 1.53, 1.97)
for x in (-Lr / 2, -Lr / 6, Lr / 6, Lr / 2):
    for zz in (-dr / 2 + 0.03, dr / 2 - 0.03): crb(cm, x - 0.018, x + 0.018, 0.0, ar['h'], zz - 0.018, zz + 0.018, '#1f1f21', r=0.003)
for y in SH:
    w_.rbox(-Lr / 2, Lr / 2, y - 0.025, y, -dr / 2 + 0.02, dr / 2 - 0.02, r=0.004)
    for zz in (-dr / 2 + 0.03, dr / 2 - 0.03): crb(cm, -Lr / 2, Lr / 2, y - 0.045, y - 0.025, zz - 0.012, zz + 0.012, '#1f1f21', r=0.002)
pbx = 0
for i, x in enumerate((-1.45, -0.95, -0.4, 0.15, 0.7, 1.25)):   # 最下層：紙箱、收納籃
    if i % 3 == 2: crb(par['vc'], x - 0.2, x + 0.2, SH[0], SH[0] + 0.3, -0.18, 0.2, '#b89a6a', r=0.02)
    else: g.box(x, SH[0] + 0.17, 0.0, 0.42, 0.34, 0.4, f'kraft{(i + pbx) % 4}', front='+z')
par.done()
RACK = [(SH[1], [('spk', -1.5), ('amp', -0.95), ('rcv', -0.35), ('spk', 0.25), ('deck', 0.8), ('spk', 1.45)]),
        (SH[2], [('deck', -1.3), ('amp', -0.7), ('spk', -0.15), ('rcv', 0.45), ('amp', 1.15)]),
        (SH[3], [('tt', -1.2), ('spk', -0.6), ('amp', -0.05), ('tt', 0.65), ('spk', 1.35)]),
        (SH[4], [('spk', -1.45), ('spk', -1.05), ('tt', -0.3), ('rcv', 0.45), ('spk', 1.1), ('spk', 1.5)])]
for y, row in RACK:
    for kind, x in row:
        x *= 0.92   # v1b：鐵架改成 3.1 m 長
        pr_ = {'spk': SPK, 'amp': AMP, 'rcv': RCV, 'deck': DECK, 'tt': TT}[kind]
        pr_.place(RT @ fm((x, y, 0.04 if kind != 'tt' else 0.0), rot('Y', random.uniform(-0.06, 0.06))))
bpl = IT['big_plant']
pbp = Part('big_plant_pole'); ccyl(pbp['vc'], (bpl['x'], 0.3, bpl['z']), (bpl['x'], 1.9, bpl['z']), 0.035, '#6a5a3a', seg=8); pbp.done()   # 水苔柱
pothos('pothos_rack', XI1 - 0.25, IT['audio_rack']['h'], IT['audio_rack']['z'] + IT['audio_rack']['d'] / 2 - 0.2, side='right', nv=11, drop=1.0, dirx=-1)   # 鐵架上面一盆（參考圖）
leafy('big_plant', bpl['x'], 0, bpl['z'], ['leaf0', 'leaf1', 'leaf2', 'leaf3'], n=46, rad=0.32, hgt=(0.35, 1.65), size=(0.13, 0.19), pot=(0.24, 0.45), potcol='#ecebe6', seed=11, droop=0.7)
ld = IT['listen_desk']; xd0, xd1, zd0, zd1, hd = XI1 - ld['w'], XI1, ld['z'] - ld['d'] / 2, ld['z'] + ld['d'] / 2, ld['h']
pld = Part('listen_desk', side='right'); w_, c, cm, g = pld['wood'], pld['vc'], pld['vcm'], pld['goods']
w_.rbox(xd0, xd1, hd - 0.045, hd, zd0, zd1, r=0.008)
w_.rbox(xd0 + 0.08, xd1, 0.28, 0.3, zd0 + 0.05, zd1 - 0.05, r=0.004)                     # 下面一層板
w_.rbox(xd0 + 0.005, xd0 + 0.03, hd - 0.16, hd - 0.045, zd0 + 0.02, zd1 - 0.02, r=0.004)   # v1b：桌面下的前裙板（參考圖的吧台比較厚實）
for zz in (zd0 + 0.06, (zd0 + zd1) / 2, zd1 - 0.06):
    crb(cm, xd0 + 0.04, xd0 + 0.08, 0.0, hd - 0.045, zz - 0.02, zz + 0.02, '#1f1f21', r=0.004)   # 黑鐵腳
    crb(cm, xd0 + 0.04, xd1, hd - 0.075, hd - 0.045, zz - 0.015, zz + 0.015, '#1f1f21', r=0.003)
for k in range(4): lp_rec(g, xd0 + 0.22 + 0.01 * k, 0.3, zd0 + 0.6 + k * 0.32, f'cover{(k * 9 + 5) % NCOV}', 'cover2', tilt=0.12, s=0.3, yaw=-math.pi / 2)   # 下層靠牆的幾張
mushroom_lamp(pld, xd1 - 0.2, hd, zd1 - 0.25, s=1.15)
SPK.place(fm((xd1 - 0.17, hd, zd0 + 0.2), rot('Y', -math.pi / 2 - 0.3)))
for k, zz in enumerate([i['z'] for i in ITL if i['kind'] == 'stool']):   # 兩組（每張高腳椅前面一組）：耳機架＋耳機、小擴大機、遙控器
    hx_ = xd1 - 0.16
    clathe(cm, [(0.0, 0.0), (0.065, 0.0), (0.065, 0.012), (0.015, 0.02), (0.0, 0.02)], hx_, hd, zz + 0.25, '#b8923a', seg=16)
    ccyl(cm, (hx_, hd + 0.015, zz + 0.25), (hx_, hd + 0.3, zz + 0.25), 0.007, '#b8923a', seg=6); crb(cm, hx_ - 0.012, hx_ + 0.012, hd + 0.29, hd + 0.31, zz + 0.2, zz + 0.3, '#b8923a', r=0.004)
    for s_ in (-1, 1):
        clathe(c, [(0.0, -0.022), (0.045, -0.022), (0.048, 0.0), (0.045, 0.02), (0.0, 0.022)], hx_, hd + 0.22, zz + 0.25 + s_ * 0.09, '#2a2a2c', seg=14, R=rot('X', math.pi / 2))
        clathe(c, [(0.0, 0.0), (0.042, 0.0), (0.04, 0.012), (0.0, 0.013)], hx_, hd + 0.22, zz + 0.25 + s_ * 0.068, '#5a4a40', seg=12, R=rot('X', -s_ * math.pi / 2))
    cpath(c, [(hx_, hd + 0.25, zz + 0.16), (hx_, hd + 0.31, zz + 0.19), (hx_, hd + 0.332, zz + 0.25), (hx_, hd + 0.31, zz + 0.31), (hx_, hd + 0.25, zz + 0.34)], 0.011, '#2a2a2c', seg=6)   # 頭帶（掛在耳機架的鉤子上）
    cpath(c, [(hx_, hd + 0.2, zz + 0.34), (hx_ - 0.05, hd + 0.08, zz + 0.3), (hx_ - 0.12, hd + 0.005, zz + 0.05), (hx_ - 0.15, hd + 0.005, zz - 0.05)], 0.003, '#1d1d1d', seg=3)   # 線
    gx = xd1 - 0.22; crb(cm, gx - 0.1, gx + 0.1, hd, hd + 0.06, zz - 0.18, zz - 0.04, '#9a9894', r=0.006)
    g.rect((gx - 0.1005, hd + 0.03, zz - 0.11), (0, 0, 1), (0, 1, 0), 0.068, 0.025, sub('amp', 0.0, 0.0, 0.6, 1.0))
    pld['emit'].rect((gx - 0.1012, hd + 0.04, zz - 0.13), (0, 0, 1), (0, 1, 0), 0.018, 0.008, ATL['vu'])
    crb(c, xd0 + 0.12, xd0 + 0.16, hd, hd + 0.015, zz - 0.05, zz + 0.06, '#1d1d1d', r=0.004)
g.rect((xd0 + 0.2, hd + 0.002, ld['z'] - 0.1), (0, 0, 1), (1, 0, 0), 0.06, 0.05, ATL['note_listen'])   # 桌上的手寫紙條
pld.done()


def stool_build(pt):
    """高腳椅（木頭圓座面、黑鐵四腳＋腳踏環、矮靠背）：原點地面、靠背在 −z（人面向 +z 坐；layout yaw 照人面向的方向）"""
    c, w_ = pt['vc'], pt['wood']; hs = 0.74
    bm = L.lathe([(0.0, hs - 0.04), (0.175, hs - 0.04), (0.185, hs - 0.02), (0.18, hs), (0.0, hs + 0.005)], seg=20); w_.add_bm(bm, fm((0, 0, 0))); bm.free()
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; ccyl(c, (0.12 * math.cos(a), hs - 0.04, 0.12 * math.sin(a)), (0.2 * math.cos(a), 0.0, 0.2 * math.sin(a)), 0.012, '#1f1f21', seg=6)
    n0 = _N0(c); bm = L.lathe([(0.168, 0.29), (0.176, 0.29), (0.176, 0.304), (0.168, 0.304)], seg=16); c.add_bm(bm, fm((0, 0, 0))); bm.free(); c.paint(_new(c, n0), '#1f1f21')
    for sx in (-1, 1): ccyl(c, (sx * 0.12, hs, -0.13), (sx * 0.13, hs + 0.26, -0.17), 0.01, '#1f1f21', seg=6)
    bm = L.rbox_bm(0.34, 0.08, 0.025, r=0.01, seg=1); w_.add_bm(bm, fm((0, hs + 0.24, -0.17), rot('X', 0.15))); bm.free()


STOOL = Proto('stool', stool_build)
for it in ITL:
    if it['kind'] == 'stool': STOOL.place(fm((it['x'], 0, it['z']), rot('Y', math.pi / 2)))   # 人面向 +x（試聽桌）
sc_ = IT['sale_crate']; scx, scz, scw, scd, sch = sc_['x'], sc_['z'], sc_['w'], sc_['d'], sc_['h']   # 門邊的特價唱片箱（矮木箱、兩排黑膠、價錢紙卡）
psc = Part('sale_crate'); w_ = psc['wood']; xa_, xb_, za_, zb_ = scx - scw / 2, scx + scw / 2, scz - scd / 2, scz + scd / 2
for (a0, a1, b0, b1) in ((xa_, xb_, zb_ - 0.025, zb_), (xa_, xb_, za_, za_ + 0.025), (xa_, xa_ + 0.025, za_, zb_), (xb_ - 0.025, xb_, za_, zb_)): w_.rbox(a0, a1, 0.05, sch, b0, b1, r=0.005)
w_.rbox(xa_, xb_, 0.0, 0.05, za_, zb_, r=0.005); psc['vc'].cbox(xa_ + 0.025, xb_ - 0.025, sch - 0.22, sch - 0.2, za_ + 0.025, zb_ - 0.025, '#3a2a1e')
psc['goods'].rect((scx - 0.2, sch * 0.5, zb_ + 0.001), (1, 0, 0), (0, 1, 0), 0.1, 0.083, ATL['note_price'])
psc['goods'].rect((xa_ - 0.001, sch * 0.55, scz), (0, 0, 1), (0, 1, 0), 0.12, 0.1, ATL['note_price'])
psc.done()
for j in range(2): stack_proto(int((scd - 0.09) / 0.03), j + 1).place(fm((scx - scw / 4 + j * scw / 2, sch - 0.2, zb_ - 0.045), rot('Y', 0.0)))
pwr = Part('rightwall_deco', side='right'); xw = XI1 - 0.012
POSTERS = [(4.05, 2.3, 0.74, 1.3, 'poster_river', '#2a2622'), (3.2, 2.45, 0.56, 0.8, 'poster_crowd', '#2a2622'), (2.5, 2.3, 0.56, 0.76, 'poster_girl', '#d8d0c0'),
           (1.92, 2.7, 0.4, 0.4, 'frame_vinyl', '#2a2622'), (1.9, 2.12, 0.38, 0.38, 'cover12', '#2a2622'), (1.38, 2.42, 0.46, 0.6, 'poster_sea', '#6b4a30'),
           (0.78, 2.6, 0.56, 0.44, 'poster_mtn', '#2a2622'), (0.18, 2.6, 0.4, 0.52, 'portrait', '#2a2622'), (-0.4, 2.62, 0.56, 0.44, 'poster_city', '#6b4a30'),
           (-0.98, 2.6, 0.36, 0.46, 'lineart_tt', '#2a2622'), (-1.48, 2.75, 0.36, 0.36, 'cover21', '#2a2622'), (-1.52, 2.32, 0.34, 0.34, 'cover5', '#2a2622'),
           (-1.98, 2.55, 0.4, 0.4, 'hero4', '#2a2622'), (-2.5, 2.7, 0.36, 0.36, 'cover8', '#2a2622'), (-2.95, 2.45, 0.44, 0.44, 'frame_vinyl', '#6b4a30'),
           (-3.45, 2.65, 0.36, 0.46, 'portrait', '#2a2622'), (-4.0, 1.85, 0.56, 0.42, 'poster_mtn', '#2a2622'), (-4.55, 2.0, 0.36, 0.36, 'cover17', '#6b4a30'), (-4.95, 1.8, 0.36, 0.46, 'lineart_tt', '#6b4a30'),
           (3.4, 1.62, 0.34, 0.34, 'hero2', '#2a2622'), (4.7, 1.55, 0.32, 0.32, 'hero6', '#6b4a30'), (0.95, 2.05, 0.3, 0.3, 'hero9', '#2a2622'), (-0.95, 2.05, 0.32, 0.32, 'hero1', '#2a2622'),
           (2.95, 3.0, 0.3, 0.3, 'hero7', '#2a2622'), (-0.3, 3.0, 0.3, 0.3, 'hero11', '#6b4a30'), (-3.9, 2.55, 0.4, 0.4, 'poster_city', '#2a2622'), (-4.6, 2.6, 0.34, 0.34, 'hero5', '#2a2622')]   # v1b：右牆補滿
for (z, y, w, h, cell, fc) in POSTERS: frame_on_wall(pwr, xw, y, z, w, h, cell, sgn=-1, fcol=fc, depth=0.022)
ls_ = IT['listen_sign']; crb(pwr['vcm'], XI1 - 0.01, XI1, ls_['y'] - 0.07, ls_['y'] + 0.07, ls_['z'] - 0.14, ls_['z'] + 0.14, '#b9b6ae', r=0.003)
pwr['goods'].rect((XI1 - 0.0105, ls_['y'], ls_['z']), (0, 0, 1), (0, 1, 0), 0.135, 0.06, ATL['sign_listen'])
bn = IT['banner']; ccyl(pwr['vcm'], (XI1, bn['y'] + bn['h'] / 2 + 0.03, bn['z'] - bn['w'] / 2 - 0.04), (XI1, bn['y'] + bn['h'] / 2 + 0.03, bn['z'] + bn['w'] / 2 + 0.04), 0.008, '#b8923a', seg=6)
u0, v0, u1, v1 = ATL['banner']; xb_ = XI1 - 0.03; za_, zb_ = bn['z'] - bn['w'] / 2, bn['z'] + bn['w'] / 2; yt, yb = bn['y'] + bn['h'] / 2, bn['y'] - bn['h'] / 2
pwr['sign'].face([(xb_, yb, za_), (xb_, yb, zb_), (xb_, yt, zb_), (xb_, yt, za_)], [(u1, v0), (u1, v1), (u0, v1), (u0, v0)])   # 畫的方向往右＝布旗往下（從店裡看，左＝店門那一側〔+z〕）
pwr.done()

# ======================================================================
# v1b：植物補到 9 盆以上——吊掛的黃金葛 3 盆、右前角的大葉盆栽（模型葉子：tools/blender/plants.py 的 leaf_mesh，材質用頂點色，不加材質）
# ======================================================================
sys.path.insert(0, os.path.join(REPO, 'tools', 'blender'))
import plants as PLN   # noqa: E402
for k, it in enumerate([i for i in ITL if i['kind'] == 'hanging']):
    hx_, hy_, hz_ = it['x'], it['y'], it['z']; ph = Part(f'hang_cords{k}')
    for a in (0.3, 2.4, 4.5): ccyl(ph['vc'], (hx_ + 0.11 * math.cos(a), hy_ + 0.16, hz_ + 0.11 * math.sin(a)), (hx_, H - 0.02, hz_), 0.003, '#c8b48a', seg=3)   # 麻繩
    crb(ph['vcm'], hx_ - 0.02, hx_ + 0.02, H - 0.03, H, hz_ - 0.02, hz_ + 0.02, '#2a2b2d', r=0.003); ph.done()
    pothos(f'hanging{k}', hx_, hy_, hz_, nv=14, drop=0.85, spread=0.8, pot='#d9cbb4', dirx=1 if hx_ < 0 else -1)
def broad_leaf(name, x, z, seed, pot='#3a3a38', hmax=1.35, nst=6):
    """大葉盆栽：深灰陶盆＋幾根莖，莖上交錯長模型葉子（tools/blender/plants.py 的 leaf_mesh；頂點色，不加材質）"""
    pfp = Part(name); c = pfp['vc']
    clathe(c, [(0.0, 0.0), (0.18, 0.0), (0.23, 0.42), (0.245, 0.45), (0.225, 0.45), (0.0, 0.43)], x, 0, z, pot, seg=18)
    clathe(c, [(0.0, 0.41), (0.215, 0.41), (0.0, 0.42)], x, 0, z, '#4a3424', seg=14)
    rnd = random.Random(seed)
    for k in range(nst):
        a = k * 6.283 / nst + rnd.uniform(-0.3, 0.3); hh = rnd.uniform(0.55, 1.0) * hmax; lean = rnd.uniform(0.1, 0.25)
        tx, tz = x + math.cos(a) * hh * lean, z + math.sin(a) * hh * lean
        ccyl(c, (x, 0.42, z), (tx, 0.42 + hh, tz), 0.012, '#5a4a30', seg=5, r2=0.007)
        for j in range(rnd.randint(4, 6)):
            t = 0.35 + 0.65 * (j + 1) / 6; base = (x + (tx - x) * t, 0.42 + hh * t, z + (tz - z) * t)
            n0 = _N0(c); Lf = rnd.uniform(0.2, 0.3); PLN.leaf_mesh(c.bm, base, -(a + (j % 2 - 0.5) * 2.2 + rnd.uniform(-0.4, 0.4)), rnd.uniform(-0.1, 0.5), Lf, Lf * 0.42, droop=Lf * 0.3)
            c.paint(_new(c, n0), rnd.choice(['#2f4c28', '#3a5a30', '#2a4424']))
    pfp.done()


broad_leaf('front_plant', IT['front_plant']['x'], IT['front_plant']['z'], 77)
broad_leaf('lounge_plant', IT['lounge_plant']['x'], IT['lounge_plant']['z'], 91, pot='#c9bfae', hmax=1.5, nst=7)   # v1c：休息區前面（左下角）
fs_ = IT['floor_speaker']; pfs = Part('floor_speaker', side='right', T=fm((fs_['x'], 0, fs_['z']), rot('Y', -math.pi / 2)))   # v1c：大落地喇叭（正面朝店裡）
crb(pfs['vc'], -fs_['d'] / 2, fs_['d'] / 2, 0.06, fs_['h'], -fs_['w'] / 2, fs_['w'] / 2, '#5a3a22', r=0.012)
pfs['goods'].rect((0, (0.06 + fs_['h']) / 2 + 0.02, fs_['w'] / 2 + 0.002), (1, 0, 0), (0, 1, 0), fs_['d'] / 2 - 0.03, (fs_['h'] - 0.06) / 2 - 0.04, ATL['speaker'])
for sx in (-1, 1):
    for sz in (-1, 1): ccyl(pfs['vc'], (sx * (fs_['d'] / 2 - 0.04), 0.0, sz * (fs_['w'] / 2 - 0.04)), (sx * (fs_['d'] / 2 - 0.04), 0.06, sz * (fs_['w'] / 2 - 0.04)), 0.02, '#1d1d1d', seg=6)
pfs.done()

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)
CK.drop_protos()
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or ob.name.startswith('S_ph_'), key=lambda ob: 'CEIL' if ob.name.startswith('CEIL_') else (('WALL_' + ob.name.split('_')[1] + ('_TOP' if '_TOP_' in ob.name else '')) if ob.name.startswith('WALL_') else ''))
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
    if ob.type == 'MESH' and '_TOP_' in ob.name: ob['ceilHide'] = 1
# CORNER-FADE-1107（BB-B 16:04 P3：鏡頭在東側時右牆的 instancing 音響一起淡出、黃金葛架沒有）：遊戲照每個網格自己的外框中心判斷要不要淡出，
#   同一面牆的零件中心不一樣（牆 3.94、鐵架 3.3、黃金葛架 3.53；instancing 的網格在原點附近＝鏡頭過 x 0 就淡出）→ 同一面牆的東西不一起淡出。
#   改成每一面牆一個淡出判斷點（extras.at，attachRoomGLB 支援）：放在那一面「最靠店裡的東西」那條線上（右牆＝鐵架前緣），鏡頭一到那些東西上面整組一起淡出
AT_IN = {}
for ob in root.children:
    if ob.type != 'MESH' or not ob.name.startswith('WALL_') or 'glass' in ob.name: continue
    sd = ob.name.split('_')[1]; bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]   # Blender 座標（x, −z, y）
    gx = [c.x for c in bb]; gz = [-c.y for c in bb]
    v = {'right': min(gx), 'left': max(gx), 'back': max(gz), 'front': min(gz)}[sd]
    AT_IN[sd] = v if sd not in AT_IN else ({'right': min, 'left': max, 'back': max, 'front': min}[sd])(AT_IN[sd], v)
def at_of(sd): return [round(AT_IN[sd], 3), 1.6, 0.0] if sd in ('left', 'right') else [0.0, 1.6, round(AT_IN[sd], 3)]
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_'): ob['at'] = at_of(ob.name.split('_')[1])
print('wall fade points', {k: round(v, 3) for k, v in AT_IN.items()})
ss = None if os.environ.get('CR_NOSS') else L.single_side(root, keep=r'glass', nodup=r'cr_(plaster|wood|floor_terrazzo|concrete|goods|sign|alpha)')
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出 EXT_mesh_gpu_instancing 的節點叫 corner_interior.N、沒有自訂屬性 → 遊戲的 /WALL_/ 認不到。
    改成網格的名字（WALL_right_…_inst），牆上的補 extras.dir（往室內的法線），掛在牆上的音響、唱盤才會跟著那面牆淡出。"""
    import struct
    b = open(path, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]; k = 0
    for nd in j['nodes']:
        if 'EXT_mesh_gpu_instancing' not in nd.get('extensions', {}): continue
        mn = j['meshes'][nd['mesh']]['name']; nd['name'] = mn + '_inst'; k += 1
        m_ = re.match(r'WALL_(front|back|left|right)_', mn)
        if m_: nd.setdefault('extras', {})['dir'] = DIRS[m_.group(1)]; nd['extras']['at'] = at_of(m_.group(1))   # 淡出判斷點和那面牆一樣（CORNER-FADE-1107）
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out = out[:8] + struct.pack('<I', len(out)) + out[12:]; open(path, 'wb').write(out); print('instanced nodes renamed', k)


fix_instanced_names(OUT); info['bytes'] = os.path.getsize(OUT); info['out'] = os.path.relpath(OUT, REPO)
drawn = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in root.children_recursive if ob.type == 'MESH')
protos = {p.name + ('_' + p.side if p.side else ''): p.n for p in list(STACKS.values()) + [SPOT, PEND, ARMC, TT, TT_L, TT_B, SPK, SPK_L, AMP, RCV, DECK, STOOL]}   # 名字加 side：唱盤、喇叭分了好幾組（CORNER-IN-1107）
n_lp = sum(int(k.split('_')[0][7:]) * p.n for k, p in ((p.name, p) for p in STACKS.values()))
info.update({'shop': 'corner', 'layout': 1, 'drawn_tris': drawn, 'protos': protos, 'records_in_bins': n_lp, 'single_side': ss,
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m})})
L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', drawn, 'MATS', len(info['materials']), 'BYTES', info['bytes']); print('CC0_USED', CK.used())
