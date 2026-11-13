"""阿德影印輸出（溫州街 A1，區域 wz_print）的室內 → GLB。CC（帳號 A 的建模子代理）2026-11-04 v1：照使用者的參考圖 wz_ade_int 做（SCENE_RULES 第 12 節：參考圖就是規格）。
  python3 tools/blender/env_second/bb_support/ade_tex.py            # 先畫貼圖（→ tools/blender/env_second/textures/gen/ade_*）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/ade_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
配置（家具位置、大小、座位、互動點、導航阻擋）只寫在 src/data/ade_layout.js（ADE_LAYOUT.print，對應遊戲的 wz_print），這裡讀同一份。做法、命名、共用的工具函式照轉角唱片（corner_interior.py）。
座標＝遊戲區域座標：中心在原點、x 往東、z 往南、店門在 +z。參考圖的鏡頭：layout 的 camRef。
從店門往裡看（參考圖由左到右、由前到後）：
  左：兩台自助影印機（觸控面板、紙匣、送稿機）、牆上藍色「影印・輸出價目表」、左前角的盆栽；後面大圖輸出機、紙樣櫃、軟木公告板、時鐘、月曆。
  中：兩張淺木色長桌（灰色鐵腳）、三台自助電腦、筆筒、文件籃、隔板、深藍色椅子五張。
  右：灰色鐵層架（彩色資料夾、筆記本、筆、便利貼、口紅膠、紙包、A4／A3 紙箱、黃金葛）；牆上「裝訂樣式」「學生報告範例」展示板；
      長工作檯（雷射印表機、膠裝機、線圈裝訂機、裁紙刀、紙疊、紙箱）；阿芃的小桌（習作、鉛筆盒、檯燈）、圓凳。
  後：木櫃台（白色檯面、電腦、掃碼付款小牌、叫人鈴、待取件的牛皮紙袋）、辦公椅；後牆木格櫃（一格一格的紙）、藍色招牌「阿德影印輸出」；右後兩台生產用影印機。
  天花板：輕鋼架天花板（單面、法線朝下）、LED 平板燈 10 盞、吸頂冷氣、灑水頭、偵煙器。
影印機、電腦、紙箱都沒有任何真實品牌（D77；型號寫虛構的 AD-xxxx）。"""
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
sys.path.insert(0, HERE)
import cc0kit as KK   # noqa: E402

LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'ade_layout.js')]))['print']
OUT = os.path.abspath(arg('--out', os.path.join(REPO, LAY['glb'])))
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
ATL = json.load(open(os.path.join(GEN, 'ade_atlas.json')))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
WT = 0.12
XI0, XI1, ZI0, ZI1 = X0 + WT, X1 - WT, Z0 + WT, Z1 - WT      # 內面 x ±2.08、z ±4.48
ITL = LAY['items']
IT = {}
for i in ITL: IT.setdefault(i['kind'], i)
random.seed(654)
B.reset(texres=1024)
L.Mesh.rbox.__defaults__ = (0.03, 1)   # 倒角一段就好
root = B.group('ade_interior', props={'kind': 'ade_interior', 'zone': LAY['zone'], 'w': W, 'd': D, 'h': H, 'layout': 1})
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

bm_box = L.bm_box


P = 'ad_'
# 11 個材質：地板（Poly Haven 大地磚，調成參考圖的淺灰）、牆（白漆）、天花板（自製輕鋼架）、淺木（桌面、櫃台、格櫃）＋頂點色（霧面、金屬）＋玻璃＋透明圖集、印刷圖集、會亮的、招牌
M = {
    'floor': L.pbr(P + 'floor_tile', 'large_floor_tiles_02', tile=1.8, target='#b3b1ad', normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.35),   # 一片 60 cm（貼圖 3×3 片＝1.8 m）
    'wall': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#eceeeb', normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.9),
    'ceil': img_mat(P + 'ceil', 'ade_ceil.png', rough=0.9, tile=1.2, cull=True),
    'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=1.0, target='#d8bf96', normal=0.25, maps=('diff', 'nor'), res=512, rough_value=0.55),   # 參考圖的桌面、櫃台：淺色木（D112）
    'vc': L.vc_material(P + 'vc', rough=0.55), 'vcm': L.vc_metal(P + 'vc_metal', rough=0.38, metal=0.4),
    'glass': L.flat(P + 'glass', '#dfe8ea', rough=0.05, alpha=0.14),
    'emit': img_mat(P + 'emit', 'ade_emit.png', rough=0.4, emit=1.0),
    'alpha': img_mat(P + 'alpha', 'ade_alpha.png', rough=0.5, clip=True),
    'goods': img_mat(P + 'goods', 'ade_goods.png', rough=0.6),
    'sign': img_mat(P + 'sign', 'ade_sign.png', rough=0.5),
}
# v2（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 11-13）：頂點色零件照顏色分族到 ambientCG 材質組（白／灰／黑塑膠、紙箱、深色木、亮／中／暗金屬、黃銅；
#   cc0kit.std_route），飽和的小東西（文具、葉子）照舊頂點色；前面的盆栽、阿芃的檯燈、櫃台的釘書機換 Poly Haven 掃描模型。位置、互動點、導航都沒動
K = KK.Kit(root, 'ad'); KK.std_mats(K, M)
ROUTE_VC, ROUTE_VM = KK.std_route(False), KK.std_route(True)
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


class Part:
    """一件東西（可以有好幾種材質）：在自己的座標建好，最後套一個變換；side＝放進哪一面牆的淡出組"""
    def __init__(self, name, side=None, T=None, smooth=True): self.name, self.side, self.T, self.smooth, self.m = name, side, T, smooth, {}

    def __getitem__(self, key):
        if key not in self.m:
            nm = (f'WALL_{self.side}_' if self.side else P) + f'{self.name}_{key}'
            rt = ROUTE_VM if key == 'vcm' else ROUTE_VC
            if self.name.startswith('chair_'): rt = (lambda h: 'metal_m') if key == 'vcm' else (lambda h: None)   # 電腦椅：遊戲照 instancing 挪椅子（chairShift），一張椅子維持兩組（頂點色＋金屬）
            self.m[key] = KK.RCMesh(nm, M[key], rt, lambda k: self[k]) if key in ('vc', 'vcm') else (UM(nm, M[key]) if key in UVK else Mesh(nm, M[key]))
        return self.m[key]

    def done(self):
        obs = []
        for m in list(self.m.values()):
            if isinstance(m, KK.RCMesh): m.flush()
        for key, m in list(self.m.items()):
            if isinstance(m, UM): ob = m.finish(root)
            elif isinstance(m, L.CMesh): ob = m.finish(root, uv=False)
            else: ob = m.finish(root, uv=True)
            if ob is None: continue
            if self.T is not None: ob.matrix_basis = self.T
            if self.side: ob['dir'] = DIRS[self.side]
            if self.smooth and key not in ('floor', 'wall', 'ceil', 'glass', 'sign', 'goods', 'alpha', 'emit'): L.smooth_mesh(ob, angle=0.6)
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



def leafy(name, x, y, z, cells, n=14, rad=0.35, hgt=(0.5, 1.2), size=(0.12, 0.16), pot=None, potcol='#e8e3d6', side=None, droop=0.5, seed=1):
    """盆栽：盆子（旋轉體）＋一根一根的莖（管子）＋葉片卡（兩面）"""
    p = Part(name, side=side); c = p['vc']; u = p['alpha']; rr = random.Random(seed)
    if pot:
        pr, ph = pot; clathe(c, [(0.0, 0.0), (pr * 0.78, 0.0), (pr, ph * 0.92), (pr * 1.04, ph), (pr * 0.96, ph), (0.0, ph * 0.9)], x, y, z, potcol, seg=16)
        clathe(c, [(0.0, ph * 0.88), (pr * 0.93, ph * 0.88), (0.0, ph * 0.9)], x, y, z, '#4a3424', seg=12); y0 = y + ph * 0.88
    else: y0 = y
    for k in range(n):
        a = rr.uniform(0, 2 * math.pi); r_ = rr.uniform(0.3, 1.0) * rad; hh = rr.uniform(*hgt)
        tip = (x + r_ * math.cos(a), y0 + hh, z + r_ * math.sin(a)); mid = (x + r_ * 0.4 * math.cos(a), y0 + hh * 0.7, z + r_ * 0.4 * math.sin(a))
        cpath(c, [(x, y0, z), mid, tip], 0.006, '#4a6a32', seg=4)
        s_ = rr.uniform(*size); ya = a + rr.uniform(-0.5, 0.5); tl = rr.uniform(0.2, droop + 0.3)
        r3 = (math.cos(ya + math.pi / 2), 0, math.sin(ya + math.pi / 2)); up3 = (math.cos(ya) * math.sin(tl), math.cos(tl), math.sin(ya) * math.sin(tl))
        u.rect((tip[0] + up3[0] * s_ * 0.5, tip[1] + up3[1] * s_ * 0.5, tip[2] + up3[2] * s_ * 0.5), r3, up3, s_ * 0.5, s_ * 0.62, ATL[rr.choice(cells)], both=True)
    p.done()


sys.path.insert(0, os.path.join(REPO, 'tools', 'blender'))
import plants as PLN   # noqa: E402


def broad_leaf(name, x, z, seed, pot='#ecebe6', hmax=1.2, nst=6, y=0.0, potr=0.2, side=None):
    """大葉盆栽（白盆）：幾根莖，莖上交錯長模型葉子（tools/blender/plants.py 的 leaf_mesh；頂點色，不加材質）"""
    pfp = Part(name, side=side); c = pfp['vc']; ph = potr * 2.1
    clathe(c, [(0.0, 0.0), (potr * 0.8, 0.0), (potr, ph), (potr * 1.06, ph * 1.05), (potr * 0.97, ph * 1.05), (0.0, ph)], x, y, z, pot, seg=16)
    clathe(c, [(0.0, ph * 0.97), (potr * 0.95, ph * 0.97), (0.0, ph * 0.99)], x, y, z, '#4a3424', seg=12)
    rnd = random.Random(seed); y0 = y + ph
    for k in range(nst):
        a = k * 6.283 / nst + rnd.uniform(-0.3, 0.3); hh = rnd.uniform(0.55, 1.0) * hmax; lean = rnd.uniform(0.1, 0.25)
        tx, tz = x + math.cos(a) * hh * lean, z + math.sin(a) * hh * lean
        ccyl(c, (x, y0, z), (tx, y0 + hh, tz), 0.01, '#5a4a30', seg=5, r2=0.006)
        for j in range(rnd.randint(4, 6)):
            t = 0.35 + 0.65 * (j + 1) / 6; base = (x + (tx - x) * t, y0 + hh * t, z + (tz - z) * t)
            n0 = _N0(c); Lf = rnd.uniform(0.16, 0.26); PLN.leaf_mesh(c.bm, base, -(a + (j % 2 - 0.5) * 2.2 + rnd.uniform(-0.4, 0.4)), rnd.uniform(-0.1, 0.5), Lf, Lf * 0.42, droop=Lf * 0.3)
            c.paint(_new(c, n0), rnd.choice(['#3a6a30', '#4a7a36', '#335c2a']))
    pfp.done()


def pothos(name, x, y, z, side=None, nv=7, spread=0.55, drop=1.0, pot='#f0efea', dirx=1, dirz=0):
    """黃金葛（盆子＋從盆邊垂下來的藤、心形葉片卡）"""
    p = Part(name, side=side); c = p['vc']; u = p['alpha']
    clathe(c, [(0.0, 0.0), (0.08, 0.0), (0.11, 0.15), (0.115, 0.17), (0.0, 0.17)], x, y, z, pot, seg=14)
    clathe(c, [(0.0, 0.16), (0.1, 0.16), (0.0, 0.165)], x, y, z, '#4a3424', seg=10)
    rr = random.Random(hash(name) % 9999)
    for v in range(nv):
        a = rr.uniform(-1.3, 1.3) + math.atan2(dirz, dirx); L_ = rr.uniform(0.35, 1.0) * drop; pts = []
        for k in range(7):
            t = k / 6; r_ = 0.09 + spread * 0.35 * t
            pts.append((x + r_ * math.cos(a), y + 0.16 + 0.06 * math.sin(t * 3) - L_ * t ** 1.6, z - r_ * math.sin(a) * 0.7))
        cpath(c, pts, 0.004, '#5a7a3a', seg=3)
        for k in range(1, 7):
            px_, py_, pz_ = pts[k]; ya = rr.uniform(0, math.pi * 2); s_ = rr.uniform(0.75, 1.15)
            u.rect((px_, py_ - 0.03, pz_), (math.cos(ya), 0, math.sin(ya)), (0.25 * math.sin(ya), 0.9, -0.25 * math.cos(ya)), 0.035 * s_, 0.045 * s_, ATL[f'leaf{rr.randrange(4)}'], both=True)
    for k in range(12):   # 盆上面的一叢
        ya = rr.uniform(0, math.pi * 2); r_ = rr.uniform(0.0, 0.1)
        u.rect((x + r_ * math.cos(ya), y + 0.23 + rr.uniform(0, 0.08), z + r_ * math.sin(ya)), (math.cos(ya), 0, math.sin(ya)), (0.3 * math.sin(ya), 0.85, -0.3 * math.cos(ya)), 0.04, 0.05, ATL[f'leaf{rr.randrange(4)}'], both=True)
    p.done()


def tex_box(u, x0, x1, y0, y1, z0, z1, front, fcell, side_cell=None, top_cell=None):
    """有貼圖的方盒（紙箱、紙包、資料夾一排）：front＝正面朝哪（'+x' '-x' '+z' '-z'）、正面整格貼 fcell；其他面用 side_cell（沒給就用正面那一格左邊 4% 的窄條）"""
    cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
    cells = {}
    if side_cell: cells.update({k: side_cell for k in ('+x', '-x', '+z', '-z') if k != front})
    if top_cell: cells['+y'] = top_cell
    u.box(cx, cy, cz, abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), fcell, front=front, cells=cells or None)


WHITE_PAPER = sub('paper_edge', 0.0, 0.0, 0.02, 0.02)   # 紙疊的頂面（白）
PAPER_SIDE = sub('paper_edge', 0, 0, 1, 0.6)


def ubox(u, ctr, w, h, d, R, cells, skip=('-y',)):
    """v1c：可以轉的貼圖方盒（UM）：ctr＝中心、w/h/d＝自己座標 x/y/z 的長度、R＝遊戲座標的 3×3 旋轉；cells＝{面: uv 範圍}，沒寫的面用 cells['*']"""
    hs = (w / 2, h / 2, d / 2); C = Vector(ctr)
    for k, (n, r, up) in UM.FACES.items():
        if k in skip: continue
        hw = sum(abs(r[i]) * hs[i] for i in range(3)); hh = sum(abs(up[i]) * hs[i] for i in range(3))
        c = C + R @ Vector((n[0] * hs[0], n[1] * hs[1], n[2] * hs[2]))
        u.rect(tuple(c), tuple(R @ Vector(r)), tuple(R @ Vector(up)), hw, hh, cells.get(k, cells['*']))


def obox(c, ctr, w, h, d, R, col):
    """v1c：可以轉的頂點色方盒（不倒角）"""
    n0 = _N0(c); bm = L.rbox_bm(w, h, d, r=0.0, seg=1); c.add_bm(bm, fm(ctr, R)); bm.free(); return c.paint(_new(c, n0), col)


def lifted(y0, h, t, a):
    """厚 t、高 h 的東西繞 x 軸轉 a 以後：底貼在 y0 時的中心 y、沿 z 佔多寬"""
    return y0 + (h * math.cos(abs(a)) + t * math.sin(abs(a))) / 2, h * math.sin(abs(a)) + t * math.cos(abs(a))


NSP = 20   # ade_tex.SPINE_COLS 的欄數


def spine_cells(k):
    a0, a1 = k / NSP, (k + 1) / NSP; m0, m1 = a0 + (a1 - a0) * 0.3, a0 + (a1 - a0) * 0.6
    return {'-x': sub('spines1', a0, 0, a1, 1), '*': sub('spines1', m0, 0.42, m1, 0.58)}


def book_row(u, O, R0, s0, s1, y0, depth, rr, kinds, hgt=(0.25, 0.32), thk=(0.02, 0.06), gap=0.1, lean=0.16, pull=0.12, dep=(0.2, 0.27)):
    """v1c（BB_257 §7-2）：一本一本的資料夾、筆記本（厚 2～6 cm、高 25～32 cm 不等；有的倒向一邊、有的抽出來一半，中間留空位）。
    自己的座標：書沿 +z 從 s0 排到 s1、書背朝 −x（x＝0 是層板前緣，往 +x 是裡面）、底在 y0；O、R0 把自己的座標轉到遊戲座標。kinds＝可以用的書背欄。回傳排了幾本"""
    z = s0 + rr.uniform(0.0, 0.03); n = 0; prev_gap = False
    while True:
        t = rr.uniform(*thk); h = rr.uniform(*hgt); dp = min(depth - 0.02, rr.uniform(*dep))
        r_ = rr.random()
        if n and r_ < gap and not prev_gap:   # 空位（被買走、被抽走）
            z += rr.uniform(0.06, 0.14); prev_gap = True; continue
        a = 0.0
        if prev_gap and rr.random() < 0.75: a = -rr.uniform(0.25, 0.5)       # 空位後面那一本倒向空位
        elif rr.random() < lean: a = rr.uniform(0.05, 0.12) * rr.choice((-1, 1))   # 稍微歪
        yc, wz = lifted(y0, h, t, a)
        if z + wz > s1: break
        px = -rr.uniform(0.06, 0.12) if rr.random() < pull else rr.uniform(0.0, 0.02)   # 抽出來一半
        ctr = Vector(O) + R0 @ Vector((px + dp / 2, yc, z + wz / 2))
        ubox(u, tuple(ctr), dp, h, t, R0 @ rot('X', a), spine_cells(rr.choice(kinds)))
        z += wz + rr.uniform(0.0, 0.004); n += 1; prev_gap = False
    return n


RE_A4 = (0.21, 0.297); RE_A3 = (0.297, 0.42)   # 紙包的大小（x 深、z 寬）


def ream_stack(u, x, y0, z, rr, spec, R0=None, yaw=0.05):
    """v1c（BB_257 §7-3）：一疊紙包——spec＝[(種類, 厚度), …] 由下往上：種類 'a4'、'a3'、'c'（色紙 A4）、'open'（拆開的 A4：包裝紙只剩下半、上面散的白紙）。
    每一包的位置、角度都歪一點；回傳頂端的 y"""
    R0 = R0 if R0 is not None else Matrix.Identity(3); y = y0
    for kind, th in spec:
        fw, fd = RE_A3 if kind == 'a3' else RE_A4; R = R0 @ rot('Y', rr.uniform(-yaw, yaw)); off = R0 @ Vector((rr.uniform(-0.012, 0.012), 0, rr.uniform(-0.012, 0.012)))
        cell = {'a4': 'ream_a4', 'a3': 'ream_a3', 'c': 'ream_c', 'open': 'ream_a4'}[kind]
        if kind == 'open':
            wh = th * 0.55; ubox(u, (x + off.x, y + wh / 2, z + off.z), fw, wh, fd, R, {'-x': sub(cell, 0, 0, 1, 0.55), '+x': sub(cell, 0, 0, 1, 0.55), '+z': sub(cell, 0, 0, 1, 0.55), '-z': sub(cell, 0, 0, 1, 0.55), '*': WHITE_PAPER})
            for j in range(3):   # 散在上面的白紙（一小疊、每疊歪一點）
                hh_ = (th - wh) / 3; R2 = R @ rot('Y', rr.uniform(-0.12, 0.12))
                ubox(u, (x + off.x + rr.uniform(-0.01, 0.01), y + wh + hh_ * (j + 0.5), z + off.z + rr.uniform(-0.01, 0.01)), fw - 0.004, hh_ * 0.96, fd - 0.004, R2, {'*': PAPER_SIDE, '+y': WHITE_PAPER})
        else:
            ubox(u, (x + off.x, y + th / 2, z + off.z), fw, th, fd, R, {'+y': WHITE_PAPER, '+x': sub(cell, 0, 0, 1, 1), '-x': sub(cell, 0, 0, 1, 1), '+z': sub(cell, 0, 0, 1, 1), '-z': sub(cell, 0, 0, 1, 1), '*': WHITE_PAPER})
        y += th
    return y


def paper_box_(u, x, y0, z, w, h, d, cell, R=None, front='-x'):
    """v1c：紙箱（A4、A3 各有自己的大小）；R＝轉一點"""
    R = R if R is not None else Matrix.Identity(3); sc = sub(cell, 0.6, 0.0, 1.0, 0.55)
    cells = {'*': sc, '+y': sub(cell, 0.6, 0.0, 1.0, 0.3), front: ATL[cell]}
    ubox(u, (x, y0 + h / 2, z), w, h, d, R, cells)


def kraft_box(c, x, y0, z, w, h, d, yaw, col='#b88a5a', tape=True, flaps=False):
    """v1c（BB_257 §7-5）：牛皮紙箱（大小、角度各不同）：封箱膠帶、有的開著蓋子"""
    R = rot('Y', yaw); obox(c, (x, y0 + h / 2, z), w, h, d, R, col)
    if tape and not flaps: obox(c, tuple(Vector((x, y0 + h + 0.0015, z))), 0.05, 0.003, d + 0.004, R, '#c8b48a')
    if flaps:   # 開著的四片蓋子（往外翻）
        for sgn, ax in ((1, 'x'), (-1, 'x'), (1, 'z'), (-1, 'z')):
            if ax == 'x': loc = Vector((sgn * w / 2, h, 0)); R2 = R @ rot('Z', -sgn * 1.9); fw, fd = 0.004, d * 0.98; fl = h * 0 + w * 0.48
            else: loc = Vector((0, h, sgn * d / 2)); R2 = R @ rot('X', sgn * 1.9); fw, fd = w * 0.98, 0.004; fl = d * 0.48
            mid = R2 @ Vector((0, fl / 2, 0)); cc = Vector((x, y0, z)) + R @ loc + mid
            obox(c, tuple(cc), fw, fl, fd, R2, '#c49a64')




# ======================================================================
# 房間：地、輕鋼架天花板（單面朝下）、牆（淡出的組）、店面（鋁框玻璃、雙開玻璃門）
# ======================================================================
fl = Part('floor', smooth=False); fl['floor'].box(X0, X1, -0.02, 0.0, Z0, Z1); fl.done()
ce = Part('ceiling', smooth=False); ce['ceil'].quad([(XI0, H, ZI0), (XI1, H, ZI0), (XI1, H, ZI1), (XI0, H, ZI1)]); ce.done()   # 法線朝下（遊戲鏡頭在天花板上面時看不到）
for side in ('left', 'right', 'back'):
    p = Part('wall', side=side, smooth=False)
    if side == 'left': p['wall'].box(X0, XI0, 0, H, Z0, Z1); p['vc'].cbox(XI0, XI0 + 0.012, 0, 0.09, ZI0, ZI1, '#b8bab8')
    elif side == 'right': p['wall'].box(XI1, X1, 0, H, Z0, Z1); p['vc'].cbox(XI1 - 0.012, XI1, 0, 0.09, ZI0, ZI1, '#b8bab8')
    else: p['wall'].box(X0, X1, 0, H, Z0, ZI0); p['vc'].cbox(XI0, XI1, 0, 0.09, ZI0, ZI0 + 0.012, '#b8bab8')
    p.done()
# 天花板和牆的接縫：一圈白色收邊（L 形鋁條）


def down_rect(c, x0, x1, z0, z1, y, col):
    """朝下的一片（天花板上的東西只做朝下的面：遊戲鏡頭在天花板上面往下看時看不到，和天花板一樣單面）"""
    return c.poly([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], col)


cm = Part('ceilfx_trim', smooth=False)
for (a, b, c0, c1) in ((XI0, XI0 + 0.03, ZI0, ZI1), (XI1 - 0.03, XI1, ZI0, ZI1), (XI0, XI1, ZI0, ZI0 + 0.03), (XI0, XI1, ZI1 - 0.03, ZI1)): down_rect(cm['vc'], a, b, c0, c1, H - 0.003, '#f6f6f4')
cm.done()

fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
pf = Part('front', side='front', smooth=False)
da, db = dx - dw / 2, dx + dw / 2
ops = sorted([(a, b, sl, hd) for a, b, sl, hd in fr['windows']] + [(da, db, 0.0, dh)])
xs_ = XI0
for a, b, sl, hd in ops:
    pf['wall'].box(xs_, a, 0, H, ZI1, Z1); pf['wall'].box(a, b, hd, H, ZI1, Z1)
    if sl > 0: pf['wall'].box(a, b, 0, sl, ZI1, Z1)
    xs_ = b
pf['wall'].box(xs_, XI1, 0, H, ZI1, Z1)
AL = '#c4c8cc'   # 銀色鋁框（外觀圖）
for a, b, sl, hd in ops:
    c = pf['vcm']; zf0, zf1 = ZI1 - 0.04, Z1 - 0.02
    c.cbox(a, b, hd - 0.05, hd, zf0, zf1, AL)
    for x in (a, b): c.cbox(x - 0.03, x + 0.03, sl, hd, zf0, zf1, AL)
    if sl > 0:
        c.cbox(a, b, sl, sl + 0.04, zf0 - 0.04, zf1, AL)   # 窗台（鋁）
        xm = (a + b) / 2; c.cbox(xm - 0.02, xm + 0.02, sl, hd, zf0 + 0.01, zf1 - 0.01, AL)   # 中間一支直框
        pf['glass'].quad([(b, sl + 0.04, ZI1 + 0.03), (a, sl + 0.04, ZI1 + 0.03), (a, hd - 0.05, ZI1 + 0.03), (b, hd - 0.05, ZI1 + 0.03)])
        pf['vc'].cbox(a, b, 0.86, 0.9, ZI1 + 0.025, ZI1 + 0.028, '#2b56a8')   # 玻璃上的藍色線條（外觀圖）
pf.done()
# 雙開玻璃門（關著；鋁框、直的把手）——外觀那一側如果也做了門扇，這一組可以刪
dp = Part('door_leaf', side='front', smooth=False); zd = ZI1 + 0.03
for (xa_, xb_) in ((da + 0.03, dx - 0.005), (dx + 0.005, db - 0.03)):
    c = dp['vcm']; c.cbox(xa_, xb_, 0.0, 0.12, zd - 0.02, zd + 0.02, AL); c.cbox(xa_, xb_, dh - 0.1, dh - 0.05, zd - 0.02, zd + 0.02, AL)
    for x in (xa_, xb_): c.cbox(x - 0.025, x + 0.025, 0.0, dh - 0.05, zd - 0.02, zd + 0.02, AL)
    dp['glass'].quad([(xb_, 0.12, zd), (xa_, 0.12, zd), (xa_, dh - 0.1, zd), (xb_, dh - 0.1, zd)])
    hx_ = (dx - 0.09) if xb_ < dx + 0.1 else (dx + 0.09)
    ccyl(c, (hx_, 0.8, zd - 0.07), (hx_, 1.4, zd - 0.07), 0.012, '#d8dadc', seg=8)
    for yy in (0.85, 1.35): ccyl(c, (hx_, yy, zd - 0.07), (hx_, yy, zd - 0.015), 0.008, '#d8dadc', seg=6)
dp['vc'].cbox(dx - 0.68, dx + 0.68, 0.88, 0.92, zd - 0.005, zd - 0.002, '#2b56a8')
hu = ATL['hours']; dp['alpha'].rect((dx - 0.36, 1.45, zd - 0.006), (-1, 0, 0), (0, 1, 0), 0.15, 0.1, hu)   # 門內側玻璃上的營業時間（從店裡看）
dp.done()
# 左窗玻璃上的白色貼字（外觀圖：影印・複印、掃描建檔……；從店裡看是反的：UV 左右翻）
wd_ = fr['windows'][0]; u0, v0, u1, v1 = ATL['decal']; dcp = Part('decal', side='front', smooth=False)
dcp['alpha'].face([((wd_[0] + wd_[1]) / 2 + 0.3, 1.0, ZI1 + 0.026), ((wd_[0] + wd_[1]) / 2 - 0.3, 1.0, ZI1 + 0.026), ((wd_[0] + wd_[1]) / 2 - 0.3, 1.6, ZI1 + 0.026), ((wd_[0] + wd_[1]) / 2 + 0.3, 1.6, ZI1 + 0.026)], [(u1, v0), (u0, v0), (u0, v1), (u1, v1)])
dcp.done()
mat_ = Part('doormat'); crb(mat_['vc'], da + 0.05, db - 0.05, 0.0, 0.01, ZI1 - 0.75, ZI1 - 0.08, '#3a3e46', r=0.004); mat_.done()

# ======================================================================
# 天花板：LED 平板燈、吸頂冷氣、灑水頭、偵煙器、出口燈
# ======================================================================
LT = LAY['lights']


def panel_build(pt):
    """嵌在輕鋼架裡的 LED 平板燈（1.2 × 0.3 m；燈面會亮、白色鋁框）：原點在燈面中心，長邊沿 z"""
    c = pt['vc']; hw, hl = 0.15, 0.6; y = -0.004
    down_rect(c, -hw - 0.025, hw + 0.025, -hl - 0.025, -hl, y, '#f4f4f2'); down_rect(c, -hw - 0.025, hw + 0.025, hl, hl + 0.025, y, '#f4f4f2')
    down_rect(c, -hw - 0.025, -hw, -hl, hl, y, '#f4f4f2'); down_rect(c, hw, hw + 0.025, -hl, hl, y, '#f4f4f2')
    pt['emit'].rect((0, -0.006, 0), (1, 0, 0), (0, 0, 1), hw, hl, ATL['panel'])   # 朝下


PANEL = Proto('ceilfx_panel', panel_build)
for (x, z) in LT['panels']:
    PANEL.place(fm((x, H, z)))
    CL.glow(root, 'panel', x, H - 0.1, z, color='rgba(240,246,255,1)', size=1.3, day=0.25, night=1.0)
ac = IT['ac']; pa = Part('ceilfx_ac'); aw = ac['w']
for (a, b, c0, c1) in ((-aw / 2, aw / 2, -aw / 2, -aw / 2 + 0.03), (-aw / 2, aw / 2, aw / 2 - 0.03, aw / 2), (-aw / 2, -aw / 2 + 0.03, -aw / 2 + 0.03, aw / 2 - 0.03), (aw / 2 - 0.03, aw / 2, -aw / 2 + 0.03, aw / 2 - 0.03)):
    down_rect(pa['vc'], ac['x'] + a, ac['x'] + b, ac['z'] + c0, ac['z'] + c1, H - 0.004, '#ecebe6')   # 冷氣面板的外框（只做朝下的面）
pa['goods'].rect((ac['x'], H - 0.006, ac['z']), (1, 0, 0), (0, 0, 1), aw / 2 - 0.03, aw / 2 - 0.03, ATL['ac_grille'])
for (x, z) in ((-1.0, 0.6), (1.0, 2.4), (-1.0, -3.0), (1.0, -1.2), (0.0, 3.9)):   # 灑水頭
    ccyl(pa['vcm'], (x, H, z), (x, H - 0.05, z), 0.012, '#d8d8d4', seg=6); ccyl(pa['vcm'], (x, H - 0.05, z), (x, H - 0.06, z), 0.03, '#c9a24a', seg=8)
for (x, z) in ((0.0, -1.2), (0.0, 2.4)):   # 偵煙器
    clathe(pa['vc'], [(0.0, 0.0), (0.06, 0.0), (0.055, -0.03), (0.0, -0.035)], x, H, z, '#f4f4f0', seg=12)
pa.done()
pex = Part('exit_sign', side='front')   # 店門上面的出口燈（綠色面板）：放進店面那面牆的淡出組
crb(pex['vc'], -0.18, 0.18, H - 0.33, H - 0.2, ZI1 - 0.06, ZI1, '#f0f0ec', r=0.005)
pex['emit'].rect((0, H - 0.265, ZI1 - 0.061), (-1, 0, 0), (0, 1, 0), 0.16, 0.055, sub('led_g', 0.2, 0.2, 0.8, 0.8))
pex.done()

# ======================================================================
# 左：自助影印機兩台、價目表、盆栽、大圖輸出機、紙樣櫃、公告板、時鐘、月曆
# ======================================================================


def mfp_build(pt, model='a'):
    """自助影印機（多功能事務機）：原點在地上、正面 +z；寬 0.62（x）、深 0.58（z）。
    v1c（BB_257 §7-4：兩台不能是同一顆）：
      a＝AD-3020（店門那一台）：高 1.22、送稿機（上面放著一疊要掃的稿子）、四層紙匣、斜的觸控面板、左側手送紙盤、右側小出紙盤
      b＝AD-2510（後面那一台）：矮（高 1.03）、沒有送稿機（平板蓋，開了一點）、三層紙匣＋深灰大容量紙匣、平的橫條操作面板、側邊出紙盤（有印好的紙）、上面一疊紙"""
    c, cm, u, e = pt['vc'], pt['vcm'], pt['goods'], pt['emit']; w2, d2 = 0.31, 0.29
    if model == 'a':
        crb(c, -w2, w2, 0.04, 0.96, -d2, d2, '#ecedeb', r=0.012)                              # 機身（紙匣四層）
        u.rect((0, 0.39, d2 + 0.002), (1, 0, 0), (0, 1, 0), w2 - 0.01, 0.345, ATL['copier_self'])
        crb(c, -w2 + 0.01, w2 - 0.01, 0.0, 0.04, -d2 + 0.02, d2 - 0.02, '#3a3d42', r=0.0)        # 底座（輪子那一圈）
        crb(c, -w2 - 0.01, w2 + 0.01, 0.96, 1.08, -d2 - 0.01, d2 + 0.01, '#3c3f44', r=0.01)      # 掃描器（深灰，參考圖）
        crb(c, -w2 + 0.03, w2 - 0.03, 1.08, 1.17, -d2 + 0.03, d2 - 0.12, '#e6e7e5', r=0.012)     # 送稿機（白蓋）
        c.paint(bm_box(c.bm, -w2 + 0.06, w2 - 0.12, 1.17, 1.19, -d2 + 0.06, d2 - 0.2), '#c8c9c7')  # 送稿機的進紙盤
        rr = random.Random(11)
        for k in range(4): u.box(-0.06 + rr.uniform(-0.01, 0.01), 1.196 + k * 0.006, -0.06 + rr.uniform(-0.01, 0.01), 0.21, 0.005, 0.28, PAPER_SIDE, cells={'+y': WHITE_PAPER})   # 送稿機上一疊要掃的稿子
        crb(c, -w2 - 0.003, w2 + 0.003, 0.74, 0.86, -d2 - 0.003, d2 + 0.003, '#2e3034', r=0.004)   # 出紙口那一段（深灰、往裡凹）
        u.rect((-0.12, 0.93, d2 + 0.004), (1, 0, 0), (0, 1, 0), 0.08, 0.052, ATL['self_copy'])        # 「自助影印」貼紙
        T = (0.13, 1.02, d2 + 0.09)   # 觸控面板：右前方伸出來的斜面板（深灰框、亮的螢幕）
        c.paint(bm_box(c.bm, 0.02, 0.24, 0.97, 1.0, d2 - 0.02, d2 + 0.06), '#4a4d52')
        n0 = _N0(c); bm = L.rbox_bm(0.27, 0.018, 0.17, r=0.006, seg=1); c.add_bm(bm, fm(T, rot('X', -0.75))); bm.free(); c.paint(_new(c, n0), '#2c2e32')
        Rm = rot('X', -0.75); up = Rm @ Vector((0, 0, -1)); nrm = Rm @ Vector((0, 1, 0)); ctr = Vector(T) + nrm * 0.0095
        e.rect(tuple(ctr), (1, 0, 0), tuple(up), 0.11, 0.065, ATL['scr_ui'])
        c.paint(bm_box(c.bm, -w2 - 0.12, -w2, 0.6, 0.62, -0.18, 0.16), '#d8d9d7')                # 側邊手送紙盤
        for k in range(3): c.paint(bm_box(c.bm, -0.18, 0.12, 0.861 + k * 0.004, 0.864 + k * 0.004, -0.15, 0.13), '#fbfbf8')   # 出紙口裡的一疊紙
    else:
        crb(c, -w2, w2, 0.04, 0.84, -d2, d2, '#e4e5e2', r=0.01)                                # 機身（比較矮、顏色偏灰一點）
        u.rect((0, 0.44, d2 + 0.002), (1, 0, 0), (0, 1, 0), w2 - 0.01, 0.395, ATL['copier_self_b'])
        crb(c, -w2 + 0.01, w2 - 0.01, 0.0, 0.04, -d2 + 0.02, d2 - 0.02, '#3a3d42', r=0.0)
        crb(c, -w2 - 0.005, w2 + 0.005, 0.84, 0.95, -d2 - 0.005, d2 + 0.005, '#f0f0ee', r=0.01)   # 掃描器（白，和 a 的深灰不同）
        crb(c, -w2 + 0.0, w2 - 0.0, 0.95, 0.975, -d2 + 0.0, d2 - 0.0, '#2e3034', r=0.004)       # 平板蓋的底（深灰玻璃框）
        n0 = _N0(c); bm = L.rbox_bm(w2 * 2 - 0.02, 0.025, d2 * 2 - 0.06, r=0.006, seg=1); c.add_bm(bm, fm((0, 0.985, -0.02 + 0.0), rot('X', -0.12))); bm.free(); c.paint(_new(c, n0), '#e8e9e6')   # 平板蓋（開了一點）
        crb(c, -w2 + 0.02, w2 - 0.02, 0.9, 0.95, d2 - 0.005, d2 + 0.07, '#3a3d42', r=0.006)        # 橫條操作面板（前緣，平的）
        e.rect((0.12, 0.951, d2 + 0.035), (1, 0, 0), (0, 0, -1), 0.1, 0.028, ATL['scr_ui'])
        for k in range(5): ccyl(c, (-0.2 + k * 0.035, 0.95, d2 + 0.035), (-0.2 + k * 0.035, 0.956, d2 + 0.035), 0.009, '#8a8e96' if k else '#3a9a5a', seg=6)
        u.rect((0.08, 0.6, d2 + 0.004), (1, 0, 0), (0, 1, 0), 0.07, 0.047, ATL['self_copy'])          # 「自助影印」貼紙（位置和 a 不同）
        crb(c, w2, w2 + 0.13, 0.62, 0.64, -0.2, 0.16, '#d0d1cf', r=0.0)                             # 側邊出紙盤（往右伸出、斜一點）
        crb(c, w2 + 0.11, w2 + 0.13, 0.64, 0.68, -0.2, 0.16, '#d0d1cf', r=0.0)
        for k in range(5): c.paint(bm_box(c.bm, w2 + 0.005, w2 + 0.11, 0.641 + k * 0.004, 0.6435 + k * 0.004, -0.15 + k * 0.004, 0.12 + k * 0.004), '#fbfbf8')
        rr = random.Random(12)
        for k in range(7): u.box(-0.08 + rr.uniform(-0.015, 0.015), 0.991 + 0.0 + k * 0.0055, 0.0 + rr.uniform(-0.015, 0.015), 0.22, 0.005, 0.3, PAPER_SIDE, cells={'+y': WHITE_PAPER})   # 蓋子上一疊紙（有人印完放著）
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(cm, (sx * (w2 - 0.05), 0.04, sz * (d2 - 0.05)), (sx * (w2 - 0.05), 0.0, sz * (d2 - 0.05)), 0.02, '#2a2a2c', seg=6)


_cps = [it for it in ITL if it['kind'] == 'copier_self']
for k, it in enumerate(_cps):
    _p = Part(f'mfp_{"ab"[k]}', T=fm((it['x'], 0, it['z']), rot('Y', it['ry']))); mfp_build(_p, 'ab'[k]); _p.done()
pb = IT['price_board']; plw = Part('leftwall_deco', side='left')
xw = XI0 + 0.004
crb(plw['vc'], XI0, XI0 + 0.02, pb['y'] - pb['h'] / 2 - 0.01, pb['y'] + pb['h'] / 2 + 0.01, pb['z'] - pb['w'] / 2 - 0.01, pb['z'] + pb['w'] / 2 + 0.01, '#1f3a78', r=0.004)
plw['goods'].rect((XI0 + 0.021, pb['y'], pb['z']), (0, 0, -1), (0, 1, 0), pb['w'] / 2, pb['h'] / 2, ATL['price_board'])
# 軟木公告板（家教、租屋、讀書會的傳單）、時鐘、月曆
plw['wood'].rbox(XI0, XI0 + 0.025, 1.24, 1.98, -1.75, -1.15, r=0.004)
plw['goods'].rect((XI0 + 0.026, 1.61, -1.45), (0, 0, -1), (0, 1, 0), 0.29, 0.36, ATL['cork'])
clathe(plw['vc'], [(0.0, 0.0), (0.16, 0.0), (0.165, 0.03), (0.0, 0.035)], XI0 + 0.002, 2.45, -0.35, '#2a2a2a', seg=20, R=rot('Z', -math.pi / 2))
plw['goods'].rect((XI0 + 0.038, 2.45, -0.35), (0, 0, -1), (0, 1, 0), 0.15, 0.15, ATL['clock'])
plw['goods'].rect((XI0 + 0.003, 1.75, -2.25), (0, 0, -1), (0, 1, 0), 0.16, 0.24, ATL['calendar'])
plw.done()
rb_ = IT['recycle_bin']; prb = Part('recycle_bin')   # 廢紙回收桶（藍色、上面一圈白、丟進去的紙）
clathe(prb['vc'], [(0.0, 0.0), (rb_['r'] * 0.85, 0.0), (rb_['r'], 0.52), (rb_['r'] * 0.93, 0.52), (rb_['r'] * 0.8, 0.03), (0.0, 0.03)], rb_['x'], 0, rb_['z'], '#2b56a8', seg=16)
clathe(prb['vc'], [(rb_['r'] * 0.98, 0.5), (rb_['r'] * 1.02, 0.5), (rb_['r'] * 1.02, 0.54), (rb_['r'] * 0.92, 0.54)], rb_['x'], 0, rb_['z'], '#f2f2ee', seg=16)
for k in range(5):
    a_ = k * 1.3; prb['goods'].rect((rb_['x'] + 0.05 * math.cos(a_), 0.46 + k * 0.012, rb_['z'] + 0.05 * math.sin(a_)), (math.cos(a_), 0, math.sin(a_)), (0.2 * math.sin(a_), 0.6, -0.2 * math.cos(a_)), 0.08, 0.06, WHITE_PAPER, both=True)
prb.done()
fp_ = IT['front_plant']; K.ph_put('potted_plant_01', fp_['x'], 0.0, fp_['z'], 0.6, share=False, height=1.2, decimate=0.03)   # v2：Poly Haven 盆栽（原本程式拼的大葉盆栽）

pl_ = IT['plotter']; ppl = Part('plotter', T=fm((pl_['x'], 0, pl_['z']), rot('Y', math.pi / 2)))   # 自己的座標：長邊沿 x（1.5）、正面 +z（轉了以後朝 +x）
c, cm = ppl['vc'], ppl['vcm']; Lh = pl_['d'] / 2
for sx in (-1, 1):   # 兩側的腳架（T 字腳、輪子）
    crb(c, sx * (Lh - 0.08) - 0.03, sx * (Lh - 0.08) + 0.03, 0.06, 0.78, -0.04, 0.04, '#2e3034', r=0.004)
    crb(c, sx * (Lh - 0.08) - 0.035, sx * (Lh - 0.08) + 0.035, 0.03, 0.07, -0.26, 0.26, '#2e3034', r=0.006)
    for sz in (-1, 1): ccyl(cm, (sx * (Lh - 0.08), 0.03, sz * 0.23), (sx * (Lh - 0.08), 0.0, sz * 0.23), 0.025, '#1a1a1c', seg=6)
crb(c, -Lh + 0.08, Lh - 0.08, 0.34, 0.37, -0.03, 0.03, '#2e3034', r=0.003)                 # 腳架中間的橫桿
crb(c, -Lh, Lh, 0.78, 1.1, -0.24, 0.2, '#e8e8e6', r=0.015)                                 # 機身
ppl['goods'].rect((0, 0.94, 0.202), (1, 0, 0), (0, 1, 0), Lh - 0.02, 0.155, ATL['plotter_face'])
crb(c, -Lh - 0.01, -Lh + 0.12, 0.78, 1.15, -0.25, 0.21, '#2c2e32', r=0.01); crb(c, Lh - 0.12, Lh + 0.01, 0.78, 1.15, -0.25, 0.21, '#2c2e32', r=0.01)   # 兩端的黑蓋子
ccyl(c, (-Lh + 0.12, 0.92, -0.12), (Lh - 0.12, 0.92, -0.12), 0.075, '#f6f6f2', seg=12)       # 捲筒紙（機身裡面露出來）
u = ppl['goods']; sh_ = sub('board_report', 0.04, 0.05, 0.96, 0.78)                           # 剛印出來的海報（從出紙口垂下來）
u.face([(-0.42, 0.42, 0.26), (0.42, 0.42, 0.26), (0.42, 0.8, 0.205), (-0.42, 0.8, 0.205)], [(sh_[0], sh_[1]), (sh_[2], sh_[1]), (sh_[2], sh_[3]), (sh_[0], sh_[3])])
for k in range(7):   # 出紙籃（布：斜的一條一條）
    t = k / 6; c.paint(bm_box(c.bm, -Lh + 0.1, Lh - 0.1, 0.42 - 0.2 * math.sin(t * math.pi), 0.425 - 0.2 * math.sin(t * math.pi), 0.12 - t * 0.3, 0.16 - t * 0.3), '#3a3c40')
ppl.done()

sc_ = IT['sample_cab']; psc = Part('sample_cab', T=fm((sc_['x'], 0, sc_['z']), rot('Y', math.pi / 2)))   # 正面朝 +x
c = psc['vc']; Lh, dh_ = sc_['d'] / 2, sc_['w'] / 2
psc['wood'].rbox(-Lh, Lh, 0.0, sc_['h'], -dh_, dh_ - 0.02, r=0.01)
for k, xx in enumerate((-Lh / 2, Lh / 2)):   # 兩扇淺灰門、把手
    crb(c, xx - Lh / 2 + 0.01, xx + Lh / 2 - 0.01, 0.06, sc_['h'] - 0.05, dh_ - 0.02, dh_ - 0.005, '#e4e4e0', r=0.004)
    crb(psc['vcm'], xx + (0.18 if k == 0 else -0.18) - 0.008, xx + (0.18 if k == 0 else -0.18) + 0.008, 0.6, 0.78, dh_ - 0.005, dh_ + 0.01, '#9a9ea6', r=0.002)
g = psc['goods']; y0 = sc_['h']
for k, (xx, n, cell) in enumerate(((-0.4, 6, 'ream_c'), (-0.12, 4, 'ream_a4'), (0.2, 3, 'ream_a3'))):   # 紙樣本、色紙
    for j in range(n): tex_box(g, xx - 0.14, xx + 0.14, y0 + j * 0.03, y0 + j * 0.03 + 0.028, -0.18, 0.12, '+z', cell, side_cell=sub('paper_edge', 0, 0, 1, 0.5), top_cell=WHITE_PAPER)
crb(c, 0.36, 0.54, y0, y0 + 0.2, -0.17, 0.13, '#3a6aa8', r=0.006); crb(c, 0.37, 0.53, y0 + 0.2, y0 + 0.205, -0.16, 0.12, '#2a2c30', r=0.0)   # 資源回收盒（藍）
crb(c, 0.1, 0.26, y0, y0 + 0.05, 0.14, 0.2, '#2a2c30', r=0.005); crb(c, 0.1, 0.26, y0 + 0.05, y0 + 0.075, 0.14, 0.2, '#c03a3a', r=0.008)   # 釘書機
psc.done()

# ======================================================================
# 中：兩張長桌、自助電腦、椅子
# ======================================================================


def table_build(pt):
    """淺木色長桌（灰色方管鐵腳＋桌下的框）：原點在地上中心；寬 0.65（x）、長 1.6（z）"""
    w2, l2, h = TB['w'] / 2, TB['d'] / 2, TB['h']; c = pt['vcm']
    pt['wood'].rbox(-w2, w2, h - 0.03, h, -l2, l2, r=0.004)
    for sx in (-1, 1):
        for sz in (-1, 1): crb(c, sx * (w2 - 0.04) - 0.02, sx * (w2 - 0.04) + 0.02, 0.0, h - 0.03, sz * (l2 - 0.05) - 0.02, sz * (l2 - 0.05) + 0.02, '#9a9ea6', r=0.0)
        crb(c, sx * (w2 - 0.04) - 0.015, sx * (w2 - 0.04) + 0.015, h - 0.09, h - 0.03, -l2 + 0.05, l2 - 0.05, '#9a9ea6', r=0.0)
    for sz in (-1, 1): crb(c, -w2 + 0.04, w2 - 0.04, h - 0.09, h - 0.03, sz * (l2 - 0.05) - 0.015, sz * (l2 - 0.05) + 0.015, '#9a9ea6', r=0.0)


TB = IT['table']; TABLE = Proto('table', table_build)


PCS = []


def pc_place(x, z, scr):
    p = Part(f'pc_{len(PCS)}', T=fm((x, 0.75, z)))
    c, e, u = p['vc'], p['emit'], p['goods']
    clathe(c, [(0.0, 0.0), (0.1, 0.0), (0.09, 0.012), (0.0, 0.015)], 0.12, 0.0, 0.0, '#2a2b2e', seg=12)
    crb(c, 0.11, 0.13, 0.0, 0.3, -0.02, 0.02, '#2a2b2e', r=0.0)
    crb(c, 0.075, 0.105, 0.1, 0.42, -0.27, 0.27, '#1c1d20', r=0.006)
    e.rect((0.074, 0.26, 0.0), (0, 0, 1), (0, 1, 0), 0.255, 0.15, ATL[scr])
    tex_box(u, -0.25, -0.09, 0.0, 0.018, -0.21, 0.21, '+y', 'keyboard', side_cell=sub('keyboard', 0, 0, 0.05, 0.05))
    cell_(c, (-0.19, 0.012, 0.3), 0.025, 0.012, 0.04, '#2a2b2e', seg=8, rings=4)
    PCS.append(p.done())


def chair_build(pt):
    """深藍色椅子（布面座墊、靠背，灰色鐵腳四支）：原點在地上、坐的人面向 +z"""
    c, cm = pt['vc'], pt['vcm']; col = '#24345f'
    def rb(cx, cy, cz, w, h, d, colr, R=None, r=0.03):
        n0 = _N0(c); bm = L.rbox_bm(w, h, d, r=r, seg=2); c.add_bm(bm, fm((cx, cy, cz), R)); bm.free(); c.paint(_new(c, n0), colr)
    rb(0, 0.46, 0.01, 0.44, 0.05, 0.42, col, r=0.02)                                    # 座墊
    rb(0, 0.42, 0.01, 0.4, 0.03, 0.38, '#3a3c40', r=0.008)                               # 座墊底板
    rb(0, 0.74, -0.2, 0.42, 0.3, 0.035, col, R=rot('X', -0.12), r=0.015)               # 靠背
    for sx in (-1, 1):
        ccyl(cm, (sx * 0.19, 0.42, 0.17), (sx * 0.2, 0.0, 0.2), 0.011, '#9aa0a8', seg=6)
        ccyl(cm, (sx * 0.19, 0.42, -0.17), (sx * 0.2, 0.0, -0.21), 0.011, '#9aa0a8', seg=6)
        ccyl(cm, (sx * 0.19, 0.44, -0.18), (sx * 0.19, 0.64, -0.21), 0.01, '#9aa0a8', seg=6)   # 靠背的支架
    ccyl(cm, (-0.2, 0.16, 0.19), (0.2, 0.16, 0.19), 0.008, '#9aa0a8', seg=5)


CHAIR = Proto('chair', chair_build)
for it in ITL:
    if it['kind'] == 'table': TABLE.place(fm((it['x'], 0, it['z'])))
    elif it['kind'] == 'chair': CHAIR.place(fm((it['x'], 0, it['z']), rot('Y', it['yaw'] + random.uniform(-0.04, 0.04))))   # v1c：yaw 在配置裡就打散了（±5°、一張沒推進去轉 18°）
tb0, tb1 = [i for i in ITL if i['kind'] == 'table']
TX = tb0['x']; TY = 0.75
pc_place(TX + 0.03, 2.6, 'scr_doc'); pc_place(TX + 0.03, 0.85, 'scr_pdf'); pc_place(TX + 0.03, 0.25, 'scr_doc2')   # v1c：椅子換位置（印東西放回 (−0.6, 1.75)）
pdk = Part('desk_items'); c, cm, g = pdk['vc'], pdk['vcm'], pdk['goods']


def pen_cup(c, x, z, y=TY, n=9, seed=1, col='#c8ccd2'):
    rr = random.Random(seed); clathe(c, [(0.0, 0.0), (0.04, 0.0), (0.042, 0.11), (0.0, 0.11)], x, y, z, col, seg=10)
    for k in range(n):
        a = rr.uniform(0, 6.28); r_ = rr.uniform(0, 0.025); tl = rr.uniform(0.05, 0.25); ya = rr.uniform(0, 6.28)
        b = (x + r_ * math.cos(a), y + 0.03, z + r_ * math.sin(a)); t = (b[0] + 0.14 * math.sin(tl) * math.cos(ya), b[1] + 0.14 * math.cos(tl), b[2] + 0.14 * math.sin(tl) * math.sin(ya))
        ccyl(c, b, t, 0.005, rr.choice(['#2a5ad0', '#d02a2a', '#2a2a2a', '#30a050', '#e0b020', '#a040c0']), seg=4)


pen_cup(c, TX + 0.17, 2.15, seed=3, col='#dfe6ec'); pen_cup(c, TX + 0.17, 1.05, seed=4, col='#3a3c40'); pen_cup(c, TX + 0.17, -0.5, seed=5)
# 前面那張桌子：鐵絲文件籃（紙）、隔板（毛玻璃）、自助電腦的小立牌
for k in range(6): cm.paint(bm_box(cm.bm, TX - 0.1, TX + 0.18, TY + 0.005 + k * 0.022, TY + 0.009 + k * 0.022, 1.3, 1.65), '#b8bcc2')
for x_ in (TX - 0.1, TX + 0.18): cm.paint(bm_box(cm.bm, x_ - 0.004, x_ + 0.004, TY, TY + 0.12, 1.3, 1.65), '#b8bcc2')
for k in range(4): tex_box(g, TX - 0.08, TX + 0.16, TY + 0.01 + k * 0.012, TY + 0.02 + k * 0.012, 1.33, 1.62, '+z', sub('paper_edge', 0, 0, 1, 0.4), top_cell=WHITE_PAPER)
pdk['glass'].quad([(TX - 0.24, TY, 1.22), (TX + 0.24, TY, 1.22), (TX + 0.24, TY + 0.48, 1.22), (TX - 0.24, TY + 0.48, 1.22)])
cm.cbox(TX - 0.25, TX + 0.25, TY + 0.46, TY + 0.49, 1.21, 1.23, '#c8ccd2'); cm.cbox(TX - 0.25, TX - 0.22, TY, TY + 0.49, 1.21, 1.23, '#c8ccd2'); cm.cbox(TX + 0.22, TX + 0.25, TY, TY + 0.49, 1.21, 1.23, '#c8ccd2')
crb(c, TX - 0.12, TX + 0.16, TY + 0.45, TY + 0.5, 1.235, 1.255, '#f0f0ee', r=0.0)
g.rect((TX + 0.02, TY + 0.55, 1.256), (1, 0, 0), (0, 1, 0), 0.13, 0.065, ATL['note_pay'])        # 隔板上面的「列印請至櫃台付款」
_r = random.Random(21)
for k in range(3): ubox(g, (TX + 0.07 + _r.uniform(-0.01, 0.01), TY + 0.006 + k * 0.012, 1.86), 0.21, 0.011, 0.297, rot('Y', _r.uniform(-0.1, 0.1)), {'*': PAPER_SIDE, '+y': WHITE_PAPER})   # 桌上一疊紙（v1c：每張歪一點）
for k in range(5): ubox(g, (TX + 0.05 + _r.uniform(-0.012, 0.012), TY + 0.006 + k * 0.012, -0.05), 0.21, 0.011, 0.297, rot('Y', _r.uniform(-0.12, 0.12)), {'*': PAPER_SIDE, '+y': WHITE_PAPER})
crb(c, TX - 0.02, TX + 0.12, TY, TY + 0.012, -0.45, -0.3, '#2a2c30', r=0.002)   # 手機（有人放著）
pdk.done()

# ======================================================================
# 右：鐵層架（文具）、兩塊展示板、長工作檯、阿芃的小桌
# ======================================================================
sr = IT['stat_rack']; prk = Part('stat_rack', side='right'); c, cm, g = prk['vc'], prk['vcm'], prk['goods']
rx0, rx1 = XI1 - sr['w'], XI1 - 0.01; rz0, rz1 = sr['z'] - sr['d'] / 2, sr['z'] + sr['d'] / 2
SHY = [0.06, 0.4, 0.74, 1.06, 1.38, 1.72, 2.08]
for xx in (rx0, rx1 - 0.03):
    for zz in (rz0, rz1 - 0.035): cm.cbox(xx, xx + 0.03, 0.0, sr['h'], zz, zz + 0.035, '#6e737b')   # 角鐵
for y in SHY:
    cm.cbox(rx0, rx1, y - 0.02, y, rz0, rz1, '#8e939b'); cm.cbox(rx0 - 0.005, rx0 + 0.005, y - 0.045, y, rz0, rz1, '#767b83')   # 層板＋前緣
for k in range(3):   # 層架標籤（前緣貼著）
    g.rect((rx0 - 0.006, SHY[k + 2] - 0.022, sr['z']), (0, 0, 1), (0, 1, 0), 0.5, 0.012, sub('shelf_label', k / 3, 0, (k + 1) / 3, 1))
yb = SHY[0]   # 最下層：紙箱三種大小（v1c，BB_257 §7-3：A4 箱、A3 箱、半箱的小箱各不同；歪一點）
_r = random.Random(81)
paper_box_(g, rx0 + 0.02 + 0.155, yb, rz1 - 0.27, 0.31, 0.27, 0.43, 'box_a4', R=rot('Y', 0.03))
paper_box_(g, rx0 + 0.02 + 0.16, yb, rz1 - 0.78, 0.32, 0.2, 0.46, 'box_a3', R=rot('Y', -0.05))
paper_box_(g, rx0 + 0.06 + 0.13, yb, rz0 + 0.27, 0.26, 0.17, 0.36, 'box_a4', R=rot('Y', 0.09))   # 半箱（小的那一箱）
kraft_box(c, rx0 + 0.19, yb + 0.17, rz0 + 0.27, 0.24, 0.1, 0.3, -0.06, col='#c49a64')            # 小箱上面一個扁的牛皮紙盒
yb = SHY[1]   # 紙包：A4 包、A3 包、半包、拆開的；每疊高度不同、每包歪一點（v1c）
for zz, spec in ((rz1 - 0.19, [('a4', 0.05)] * 4 + [('open', 0.045)]), (rz1 - 0.55, [('a4', 0.05), ('a4', 0.05), ('a4', 0.025)]),
                 (rz1 - 0.95, [('a3', 0.05), ('a3', 0.05), ('a3', 0.05)]), (rz0 + 0.48, [('c', 0.05), ('c', 0.025), ('c', 0.05), ('c', 0.05), ('c', 0.025)]),
                 (rz0 + 0.17, [('a4', 0.025), ('a4', 0.025)])):
    fw = (RE_A3 if spec[0][0] == 'a3' else RE_A4)[0]; ream_stack(g, rx0 + 0.04 + fw / 2, yb, zz, _r, spec)
yb = SHY[2]   # 便利貼、口紅膠、筆記本小疊、修正帶
for k in range(5):
    zz = rz1 - 0.15 - k * 0.32; tex_box(g, rx0 + 0.04, rx0 + 0.16, yb, yb + 0.09 + 0.03 * (k % 2), zz - 0.13, zz + 0.13, '-x', 'sticky', top_cell=sub('sticky', k / 6, 0.1, (k + 1) / 6, 0.9))
    for j in range(4): ccyl(c, (rx0 + 0.22 + (j % 2) * 0.05, yb, zz - 0.06 + (j // 2) * 0.12), (rx0 + 0.2 + (j % 2) * 0.05, yb + 0.1, zz - 0.06 + (j // 2) * 0.12), 0.012, ['#f0f0ec', '#e0b020', '#3a8ad0', '#d03a3a'][j], seg=6)
yb = SHY[3]   # 透明收納盒裡的筆、麥克筆
for k in range(4):
    zz = rz1 - 0.22 - k * 0.43; z0_, z1_ = zz - 0.19, zz + 0.19; xa_, xb_ = rx0 + 0.03, rx0 + 0.2
    prk['glass'].quad([(xa_, yb, z1_), (xa_, yb, z0_), (xa_, yb + 0.12, z0_), (xa_, yb + 0.12, z1_)])
    cm.paint(bm_box(cm.bm, xa_, xb_, yb, yb + 0.005, z0_, z1_), '#c8ccd2')
    rr = random.Random(40 + k)
    for j in range(30):
        px_, pz_ = rr.uniform(xa_ + 0.02, xb_ - 0.02), rr.uniform(z0_ + 0.02, z1_ - 0.02); tl = rr.uniform(-0.25, 0.25)
        ccyl(c, (px_, yb + 0.005, pz_), (px_ + 0.04 * tl, yb + 0.16 + rr.uniform(-0.02, 0.02), pz_ + 0.05 * tl), 0.006, rr.choice(['#2a5ad0', '#d02a2a', '#2a2a2a', '#30a050', '#e0b020', '#e06aa0', '#40b8d0', '#f08030']), seg=4)
# v1c（BB_257 §7-2）：筆記本、活頁本、資料夾一本一本做：厚 2～6 cm、高 25～32 cm 不等，有的倒向空位、有的抽出來一半
_r = random.Random(52); I3 = Matrix.Identity(3); NB = list(range(12, 20)); BD = list(range(0, 12))
nbk = book_row(g, (rx0 + 0.01, 0, 0), I3, rz0 + 0.02, rz1 - 0.02, SHY[4], sr['w'], _r, NB, hgt=(0.21, 0.3), thk=(0.012, 0.035), gap=0.09, pull=0.1)
nbd = book_row(g, (rx0 + 0.02, 0, 0), I3, rz0 + 0.02, rz1 - 0.02, SHY[5], sr['w'], _r, BD, hgt=(0.25, 0.32), thk=(0.02, 0.06), gap=0.12, pull=0.12)
print('rack books', nbk, nbd)
prk.done()
pothos('rack_pothos', XI1 - 0.2, SHY[-1], sr['z'] - 0.3, side='right', nv=10, drop=0.8, spread=0.7, dirx=-1)
# 鐵層架前面地上（店門那一側）兩箱 A4 紙
pbx = Part('floor_boxes'); g = pbx['goods']
# v1c：下面一箱 A3（大、扁）、上面一箱 A4（小一號、轉了一個角度、開著蓋子露出裡面的紙包）
paper_box_(g, XI1 - 0.27, 0.0, rz1 + 0.21, 0.41, 0.24, 0.29, 'box_a3', R=rot('Y', 0.04))
_fb = pbx['vc']; kraft_box(_fb, XI1 - 0.28, 0.24, rz1 + 0.2, 0.34, 0.22, 0.26, -0.16, col='#c8a070', flaps=True)
_rf = random.Random(5)
for k in range(3): ubox(g, (XI1 - 0.28 + 0.0, 0.25 + 0.05 * k + 0.025, rz1 + 0.2), 0.297, 0.05, 0.21, rot('Y', -0.16 + _rf.uniform(-0.03, 0.03)), {'+y': WHITE_PAPER, '*': ATL['ream_a4']})
pbx.done()

prw = Part('rightwall_deco', side='right'); c, g = prw['vc'], prw['goods']
for kind in ('board_binding', 'board_report'):
    bd_ = IT[kind]; crb(c, XI1 - 0.02, XI1, bd_['y'] - bd_['h'] / 2 - 0.012, bd_['y'] + bd_['h'] / 2 + 0.012, bd_['z'] - bd_['w'] / 2 - 0.012, bd_['z'] + bd_['w'] / 2 + 0.012, '#b8bcc4', r=0.004)
    g.rect((XI1 - 0.021, bd_['y'], bd_['z']), (0, 0, 1), (0, 1, 0), bd_['w'] / 2, bd_['h'] / 2, ATL[kind])
    # 樣本是真的一本一本貼上去的（薄板，比板面凸 1.2 cm）：照 ade_tex.sample_board 的排法
    pw, ph = (384, 560) if kind == 'board_binding' else (512, 652); cw, chh = (pw - 70) / 3, (ph - 150) / 2
    for k in range(6):
        px0, py0 = 22 + (k % 3) * (cw + 12), 118 + (k // 3) * (chh + 16); a0, a1 = px0 / pw, (px0 + cw) / pw; b1, b0 = 1 - py0 / ph, 1 - (py0 + chh) / ph
        zc = bd_['z'] + bd_['w'] / 2 - (a0 + a1) / 2 * bd_['w']; yc = bd_['y'] - bd_['h'] / 2 + (b0 + b1) / 2 * bd_['h']; hw_, hh_ = (a1 - a0) / 2 * bd_['w'], (b1 - b0) / 2 * bd_['h']
        tex_box(g, XI1 - 0.034, XI1 - 0.022, yc - hh_, yc + hh_, zc - hw_, zc + hw_, '-x', sub(kind, a0, b0, a1, b1), side_cell=WHITE_PAPER)
prw.done()

wt = IT['worktable']; pwt = Part('worktable'); c, cm, g = pwt['vc'], pwt['vcm'], pwt['goods']
wx0, wx1 = XI1 - wt['w'], XI1 - 0.01; wz0, wz1 = wt['z'] - wt['d'] / 2, wt['z'] + wt['d'] / 2; wy = wt['h']
pwt['wood'].rbox(wx0, wx1, wy - 0.035, wy, wz0, wz1, r=0.005)
for zz in (wz0 + 0.05, wt['z'], wz1 - 0.05):
    for xx in (wx0 + 0.05, wx1 - 0.05): cm.cbox(xx - 0.02, xx + 0.02, 0.0, wy - 0.035, zz - 0.02, zz + 0.02, '#9a9ea6')
cm.cbox(wx0 + 0.03, wx1 - 0.03, 0.14, 0.17, wz0 + 0.03, wz1 - 0.03, '#a0a4ac')   # 下層板
# 下層（v1c：大小、高度、角度都不同：A4 箱、牛皮紙箱、A3 箱、一疊散的紙包、空著一段）
paper_box_(g, wx0 + 0.2, 0.17, wz1 - 0.35, 0.3, 0.27, 0.43, 'box_a4', R=rot('Y', -0.04))
kraft_box(c, wx0 + 0.21, 0.17, wz1 - 0.98, 0.3, 0.2, 0.5, 0.07)
paper_box_(g, wx0 + 0.2, 0.17, wt['z'] - 0.42, 0.32, 0.2, 0.46, 'box_a3', R=rot('Y', 0.05))
ream_stack(g, wx0 + 0.17, 0.17, wz0 + 0.55, random.Random(9), [('a4', 0.05), ('a4', 0.05), ('open', 0.04)], yaw=0.12)
xm = (wx0 + wx1) / 2
# 雷射印表機（z 0.4）
zz = wz1 - 0.42; crb(c, xm - 0.2, xm + 0.2, wy, wy + 0.27, zz - 0.21, zz + 0.21, '#e6e7e5', r=0.015)
crb(c, xm - 0.17, xm + 0.15, wy + 0.27, wy + 0.29, zz - 0.17, zz + 0.17, '#4a4d52', r=0.004); crb(c, xm - 0.205, xm - 0.19, wy + 0.04, wy + 0.12, zz - 0.17, zz + 0.17, '#cfd0ce', r=0.0)
for k in range(3): c.paint(bm_box(c.bm, xm - 0.14, xm + 0.08, wy + 0.29 + k * 0.004, wy + 0.292 + k * 0.004, zz - 0.13, zz + 0.13), '#fbfbf8')
pwt['emit'].rect((xm - 0.201, wy + 0.22, zz + 0.13), (0, 0, 1), (0, 1, 0), 0.012, 0.012, ATL['led_g'])
# 紙疊（裁好的報告、印好的講義）＋膠裝好的報告
zz = wz1 - 0.95
for j, (dx_, n) in enumerate(((-0.1, 9), (0.12, 6))):
    for k in range(n): tex_box(g, xm + dx_ - 0.1, xm + dx_ + 0.1, wy + k * 0.014, wy + k * 0.014 + 0.013, zz - 0.15, zz + 0.15, '-x', sub('paper_edge', 0, 0, 1, 0.4), top_cell=WHITE_PAPER)
for k in range(4): crb(c, xm - 0.12, xm + 0.12, wy + k * 0.022, wy + k * 0.022 + 0.02, zz - 0.46, zz - 0.2, ['#2a2c30', '#f0f0ec', '#3a5a8a', '#8a2a2a'][k], r=0.002)
# 線圈裝訂機（白底、灰色打孔把手）
zz = wt['z'] - 0.05; crb(c, xm - 0.2, xm + 0.18, wy, wy + 0.12, zz - 0.22, zz + 0.22, '#e8e4d8', r=0.015)
crb(c, xm - 0.16, xm + 0.06, wy + 0.12, wy + 0.2, zz - 0.18, zz + 0.18, '#d8d4c8', r=0.01)
for k in range(12): crb(c, xm - 0.04, xm + 0.04, wy + 0.2, wy + 0.24, zz - 0.17 + k * 0.03, zz - 0.155 + k * 0.03, '#5a5d62', r=0.0)   # 線圈的齒
ccyl(cm, (xm + 0.05, wy + 0.16, zz + 0.22), (xm + 0.05, wy + 0.32, zz + 0.4), 0.012, '#9aa0a8', seg=6); csph(c, (xm + 0.05, wy + 0.33, zz + 0.41), 0.025, '#2a2a2c', seg=8, rings=4)
# 膠裝機（灰黑、亮的數字）
zz = wt['z'] - 0.62; crb(c, xm - 0.19, xm + 0.17, wy, wy + 0.26, zz - 0.16, zz + 0.16, '#4a4d52', r=0.012)
crb(c, xm - 0.17, xm + 0.15, wy + 0.26, wy + 0.29, zz - 0.13, zz + 0.13, '#2c2e32', r=0.004); crb(c, xm - 0.15, xm + 0.13, wy + 0.29, wy + 0.3, zz - 0.11, zz + 0.11, '#1a1a1c', r=0.0)
pwt['emit'].rect((xm - 0.191, wy + 0.18, zz), (0, 0, 1), (0, 1, 0), 0.05, 0.02, ATL['led_o'])
# 裁紙刀（刻度底板、斜舉的刀臂、紅色把手）
zz = wz0 + 0.38; tex_box(g, xm - 0.22, xm + 0.18, wy, wy + 0.025, zz - 0.27, zz + 0.27, '+y', 'cutter_top', side_cell=sub('cutter_top', 0, 0, 0.1, 0.1))
crb(cm, xm + 0.15, xm + 0.19, wy + 0.025, wy + 0.06, zz - 0.27, zz - 0.2, '#6a6e76', r=0.0)
n0 = _N0(cm); bm = L.rbox_bm(0.03, 0.05, 0.6, r=0.004, seg=1); cm.add_bm(bm, fm((xm + 0.17, wy + 0.2, zz + 0.0), rot('X', 0.55))); bm.free(); cm.paint(_new(cm, n0), '#b8bcc2')
ccyl(c, (xm + 0.17, wy + 0.34, zz + 0.22), (xm + 0.04, wy + 0.36, zz + 0.25), 0.018, '#c0302a', seg=8)
crb(c, xm - 0.2, xm - 0.17, wy, wy + 0.008, zz - 0.25, zz + 0.25, '#e0d8c0', r=0.0)   # 尺
# 工作檯的檯燈（夾燈）、膠帶台
ccyl(cm, (wx1 - 0.05, wy, wz0 + 0.08), (wx1 - 0.05, wy + 0.45, wz0 + 0.08), 0.01, '#3a3c40', seg=6); ccyl(cm, (wx1 - 0.05, wy + 0.45, wz0 + 0.08), (xm - 0.05, wy + 0.55, wz0 + 0.15), 0.01, '#3a3c40', seg=6)
clathe(c, [(0.0, 0.06), (0.03, 0.06), (0.07, 0.0), (0.0, 0.005)], xm - 0.05, wy + 0.49, wz0 + 0.15, '#2c2e32', seg=12)
crb(c, xm - 0.1, xm + 0.0, wy, wy + 0.06, wt['z'] + 0.25, wt['z'] + 0.37, '#3a3c40', r=0.008)
pwt.done()

kd = IT['kid_desk']; pkd = Part('kid_desk'); c, cm, g = pkd['vc'], pkd['vcm'], pkd['goods']
kx0, kx1 = kd['x'] - kd['w'] / 2, kd['x'] + kd['w'] / 2; kz0, kz1 = kd['z'] - kd['d'] / 2, kd['z'] + kd['d'] / 2; ky = kd['h']
pkd['wood'].rbox(kx0, kx1, ky - 0.025, ky, kz0, kz1, r=0.004)
for xx in (kx0 + 0.03, kx1 - 0.03):
    for zz in (kz0 + 0.03, kz1 - 0.03): crb(c, xx - 0.018, xx + 0.018, 0.0, ky - 0.025, zz - 0.018, zz + 0.018, '#f0f0ec', r=0.0)
tex_box(g, kx0 + 0.08, kx0 + 0.3, ky, ky + 0.01, kd['z'] - 0.15, kd['z'] + 0.01, '+y', 'workbook', side_cell=WHITE_PAPER)   # 習作（打開的那本當成闔著的封面朝上）
for k in range(3): crb(c, kx0 + 0.1, kx0 + 0.32, ky + 0.01 + k * 0.012, ky + 0.021 + k * 0.012, kd['z'] + 0.08, kd['z'] + 0.3, ['#e07050', '#60a0e0', '#f0c040'][k], r=0.002)
crb(c, kx0 + 0.05, kx0 + 0.25, ky, ky + 0.035, kd['z'] - 0.33, kd['z'] - 0.23, '#f0a8c0', r=0.012)   # 鉛筆盒
ccyl(c, (kx0 + 0.18, ky + 0.003, kd['z'] - 0.05), (kx0 + 0.32, ky + 0.003, kd['z'] - 0.1), 0.004, '#e0b020', seg=5)
K.ph_put('desk_lamp_arm_01', kx1 - 0.1, ky, kz0 + 0.14, -math.pi / 2, height=0.46, decimate=0.08)   # v2：小檯燈（Poly Haven 摺臂檯燈）
ks = IT['kid_stool']; clathe(c, [(0.0, 0.43), (0.16, 0.43), (0.165, 0.45), (0.15, 0.47), (0.0, 0.47)], ks['x'], 0, ks['z'], '#f0c048', seg=16)
for k in range(4): a = k * math.pi / 2 + 0.4; ccyl(cm, (ks['x'] + 0.1 * math.cos(a), 0.43, ks['z'] + 0.1 * math.sin(a)), (ks['x'] + 0.15 * math.cos(a), 0.0, ks['z'] + 0.15 * math.sin(a)), 0.012, '#9aa0a8', seg=5)
pkd.done()
# 阿芃的書包掛在小桌旁（粉紅色）
pbag = Part('kid_bag'); cell_(pbag['vc'], (kd['x'], 0.5, kz1 + 0.06), 0.14, 0.18, 0.07, '#e88aa8', seg=10, rings=6); pbag.done()

# ======================================================================
# 後：櫃台、辦公椅、木格櫃、招牌、生產用影印機
# ======================================================================
ct = IT['counter']; pct = Part('counter'); c, cm, g = pct['vc'], pct['vcm'], pct['goods']
cx0, cx1 = ct['x'] - ct['w'] / 2, ct['x'] + ct['w'] / 2; cz0, cz1 = ct['z'] - ct['d'] / 2, ct['z'] + ct['d'] / 2; cy = ct['h']
pct['wood'].box(cx0, cx1, 0.08, cy - 0.04, cz1 - 0.03, cz1)                                 # 客人那一面：淺木
for k in range(1, 8): x_ = cx0 + k * (cx1 - cx0) / 8; c.cbox(x_ - 0.002, x_ + 0.002, 0.08, cy - 0.04, cz1, cz1 + 0.002, '#b89c74')   # 木板的直縫
c.cbox(cx0, cx1, 0.0, 0.08, cz1 - 0.05, cz1 - 0.01, '#5a5d62')                                    # 踢腳（深灰）
pct['wood'].box(cx1 - 0.03, cx1, 0.0, cy - 0.04, cz0, cz1); pct['wood'].box(cx0, cx0 + 0.03, 0.0, cy - 0.04, cz0, cz1)   # 兩端
crb(c, cx0 - 0.02, cx1 + 0.02, cy - 0.04, cy, cz0 - 0.02, cz1 + 0.04, '#f2f2ee', r=0.008)          # 白色檯面
c.cbox(cx0 + 0.03, cx1 - 0.03, 0.72, 0.74, cz0 + 0.02, cz1 - 0.04, '#e8e8e4')                     # 店員那一側的工作面
c.cbox(cx0 + 0.03, cx1 - 0.03, 0.15, 0.17, cz0 + 0.02, cz1 - 0.04, '#e8e8e4')
# 檯面上：電腦（面向店員、斜一點）、掃碼付款小牌、筆筒、叫人鈴、待取件的牛皮紙袋、小盆花、告示
mx, mz = ct['x'] - 0.35, ct['z'] - 0.05
clathe(c, [(0.0, 0.0), (0.09, 0.0), (0.08, 0.012), (0.0, 0.015)], mx, 0.74, mz - 0.1, '#2a2b2e', seg=12)
mon = Part('counter_monitor', T=fm((mx, 0.74, mz - 0.1), rot('Y', math.pi - 0.5))); mc = mon['vc']
crb(mc, -0.02, 0.02, 0.0, 0.42, -0.02, 0.02, '#2a2b2e', r=0.0); crb(mc, -0.25, 0.25, 0.3, 0.6, 0.02, 0.05, '#1c1d20', r=0.006)
mon['emit'].rect((0, 0.45, 0.051), (1, 0, 0), (0, 1, 0), 0.235, 0.135, ATL['scr_pos']); mon.done()
tex_box(g, ct['x'] - 0.3, ct['x'] - 0.04, cy - 0.04, cy - 0.025, mz - 0.25, mz - 0.05, '+y', 'keyboard', side_cell=sub('keyboard', 0, 0, 0.05, 0.05))
qx = ct['x'] - 0.05; crb(c, qx - 0.06, qx + 0.06, cy, cy + 0.01, cz1 - 0.12, cz1 - 0.05, '#2a2c30', r=0.002)   # 掃碼付款小牌（壓克力立牌）
c.paint(bm_box(c.bm, qx - 0.055, qx + 0.055, cy + 0.01, cy + 0.175, cz1 - 0.09, cz1 - 0.084), '#f4f4f2')
g.rect((qx, cy + 0.0925, cz1 - 0.083), (1, 0, 0), (0, 1, 0), 0.052, 0.08, ATL['qr_stand'])
pen_cup(c, ct['x'] + 0.15, cz1 - 0.12, y=cy, n=7, seed=8)
clathe(cm, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.01), (0.035, 0.012), (0.03, 0.05), (0.0, 0.058)], ct['x'] + 0.52, cy, cz1 - 0.12, '#c8b070', seg=14)   # 叫人鈴
K.ph_put('vintage_stapler', ct['x'] + 0.33, cy, cz1 - 0.08, 0.25, height=0.075, decimate=0.25)   # v2：釘書機（Poly Haven）
ccyl(cm, (ct['x'] + 0.52, cy + 0.058, cz1 - 0.12), (ct['x'] + 0.52, cy + 0.07, cz1 - 0.12), 0.006, '#d8d8d4', seg=5)
c.paint(bm_box(c.bm, ct['x'] + 0.23, ct['x'] + 0.47, cy, cy + 0.11, cz1 - 0.03, cz1 - 0.025), '#f4f4f2')   # 「有事請按鈴」小立牌
g.rect((ct['x'] + 0.35, cy + 0.055, cz1 - 0.0245), (1, 0, 0), (0, 1, 0), 0.115, 0.048, ATL['note_bell'])
for k in range(5): tex_box(g, cx1 - 0.34, cx1 - 0.08, cy + k * 0.016, cy + 0.015 + k * 0.016, cz0 + 0.05, cz0 + 0.4, '+z', 'kraft_env', side_cell=sub('kraft_env', 0, 0, 0.05, 0.05), top_cell=sub('kraft_env', 0, 0.45, 1, 1))   # 待取件
c.paint(bm_box(c.bm, cx0 + 0.2, cx0 + 0.43, cy, cy + 0.13, cz1 - 0.05, cz1 - 0.045), '#f4f4f2'); g.rect((cx0 + 0.315, cy + 0.066, cz1 - 0.044), (1, 0, 0), (0, 1, 0), 0.11, 0.055, ATL['note_pickup'])   # 「取件處」小立牌
clathe(c, [(0.0, 0.0), (0.05, 0.0), (0.06, 0.08), (0.0, 0.08)], cx0 + 0.12, cy, cz1 - 0.1, '#f4f4f0', seg=12)
for k in range(2): a = k * 1.6 + 0.3; pct['alpha'].rect((cx0 + 0.12, cy + 0.15, cz1 - 0.1), (math.cos(a), 0, math.sin(a)), (0, 1, 0), 0.08, 0.08, ATL['flowers_w'], both=True)
for k in range(3): tex_box(g, ct['x'] - 0.05, ct['x'] + 0.25, 0.74 + k * 0.012, 0.751 + k * 0.012, cz0 + 0.05, cz0 + 0.27, '+z', sub('paper_edge', 0, 0, 1, 0.4), top_cell=WHITE_PAPER)   # 店員那一側：一疊紙
g.rect((cx1 + 0.001, 0.75, ct['z']), (0, 0, -1), (0, 1, 0), 0.12, 0.08, ATL['note_kid'])   # 櫃台東端：「員工區 請勿進入」
pct.done()


def office_chair(pt):
    """辦公椅（五爪腳、輪子、氣壓桿、黑色座墊、靠背）：原點在地上、面向 +z"""
    c, cm = pt['vc'], pt['vcm']
    for k in range(5):
        a = k * 2 * math.pi / 5; ex, ez = 0.28 * math.cos(a), 0.28 * math.sin(a)
        ccyl(cm, (0, 0.08, 0), (ex, 0.06, ez), 0.015, '#2a2a2c', seg=5); csph(c, (ex, 0.03, ez), 0.03, '#1a1a1c', seg=6, rings=3)
    ccyl(cm, (0, 0.08, 0), (0, 0.42, 0), 0.025, '#8a8e96', seg=8)
    n0 = _N0(c); bm = L.rbox_bm(0.48, 0.07, 0.46, r=0.03, seg=2); c.add_bm(bm, fm((0, 0.46, 0.02))); bm.free(); c.paint(_new(c, n0), '#2a2b2e')
    n0 = _N0(c); bm = L.rbox_bm(0.44, 0.5, 0.06, r=0.03, seg=2); c.add_bm(bm, fm((0, 0.82, -0.24), rot('X', -0.1))); bm.free(); c.paint(_new(c, n0), '#2a2b2e')
    ccyl(cm, (0, 0.45, -0.18), (0, 0.62, -0.24), 0.02, '#3a3c40', seg=6)


oc = IT['office_chair']; Proto('ochair', office_chair).place(fm((oc['x'], 0, oc['z']), rot('Y', oc['yaw'])))

cb = IT['cubby']; pcb = Part('cubby', side='back'); c, g = pcb['vc'], pcb['goods']
bx0, bx1 = cb['x'] - cb['w'] / 2, cb['x'] + cb['w'] / 2; bz0, bz1 = ZI0, ZI0 + cb['d']; NC, NR = 5, 4; th = 0.022
pcb['wood'].box(bx0, bx1, 0.0, cb['h'], bz0, bz0 + 0.012)
for k in range(NC + 1): x_ = bx0 + k * (cb['w'] - th) / NC; pcb['wood'].box(x_, x_ + th, 0.0, cb['h'], bz0, bz1)
for k in range(NR + 1): y_ = 0.04 + k * (cb['h'] - 0.04 - th) / NR; pcb['wood'].box(bx0, bx1, y_, y_ + th, bz0, bz1)
c.cbox(bx0, bx1, 0.0, 0.04, bz1 - 0.02, bz1, '#a08868')
# v1c（BB_257 §7-3）：每一格放的東西、高度都不同——白紙疊（兩三疊、高度不同、歪一點）、紙包、牛皮紙袋（直立、斜靠）、完成的裝訂本、空格
rr = random.Random(77); CUB = ['white'] * 6 + ['ream'] * 3 + ['env'] * 3 + ['bound'] * 3 + ['empty'] * 2 + ['color', 'mixed', 'white']; rr.shuffle(CUB)
BOUND = ['#2a2c30', '#f0f0ec', '#3a5a8a', '#8a2a2a', '#4a6a4a', '#d8c8a0']
for i in range(NC):
    for j in range(NR):
        xa_ = bx0 + i * (cb['w'] - th) / NC + th + 0.01; xb_ = bx0 + (i + 1) * (cb['w'] - th) / NC - 0.01; ya_ = 0.04 + j * (cb['h'] - 0.04 - th) / NR + th; yt_ = 0.04 + (j + 1) * (cb['h'] - 0.04 - th) / NR
        kind = CUB[i * NR + j]; xc = (xa_ + xb_) / 2; cw_ = xb_ - xa_; ch_ = yt_ - ya_; zc = bz1 - 0.2
        if kind == 'empty': continue
        if kind in ('white', 'mixed'):
            nst = rr.randint(1, 3) if kind == 'white' else 2
            for q in range(nst):
                hh = ch_ * rr.uniform(0.12, 0.7) / (1 if nst == 1 else 1.3); fx = min(0.21, cw_ / nst - 0.01)
                x_ = xa_ + (q + 0.5) * cw_ / nst + rr.uniform(-0.01, 0.01)
                ubox(g, (x_, ya_ + hh / 2, zc + rr.uniform(-0.03, 0.02)), fx, hh, 0.297, rot('Y', rr.uniform(-0.08, 0.08)), {'*': sub('paper_edge', 0, 0, 1, min(1, hh / 0.3)), '+y': WHITE_PAPER})
            if kind == 'mixed': ubox(g, (xc, ya_ + 0.003, zc), cw_ - 0.04, 0.006, 0.3, rot('Y', 0.05), {'*': ATL['kraft_env']})   # 最下面墊一個牛皮紙袋
        elif kind == 'ream':
            ys = ya_; spec = [('a4', 0.05)] * rr.randint(1, 4)
            if rr.random() < 0.5: spec[-1] = ('open', 0.045)
            ream_stack(g, xc, ya_, zc, rr, spec, R0=rot('Y', math.pi / 2), yaw=0.07)
        elif kind == 'color':
            ream_stack(g, xc, ya_, zc, rr, [('c', 0.05), ('c', 0.025), ('a4', 0.025), ('c', 0.05)], R0=rot('Y', math.pi / 2), yaw=0.1)
        elif kind == 'env':   # 牛皮紙袋：幾個直立、最後一個斜靠
            x_ = xa_ + 0.01; nenv = rr.randint(3, 6)
            for q in range(nenv):
                t_ = rr.uniform(0.008, 0.025); h_ = min(ch_ - 0.02, rr.uniform(0.26, 0.33)); a_ = 0.0 if q < nenv - 1 else rr.uniform(0.25, 0.45)
                yc_ = ya_ + (h_ * math.cos(a_) + t_ * math.sin(a_)) / 2; wx_ = h_ * math.sin(a_) + t_ * math.cos(a_)
                ubox(g, (x_ + wx_ / 2, yc_, zc + rr.uniform(-0.02, 0.02)), t_, h_, 0.3, rot('Z', -a_), {'*': sub('kraft_env', 0.02, 0.02, 0.08, 0.08), '+z': sub('kraft_env', 0.0, 0.0, 0.08, 1), '+x': ATL['kraft_env'], '-x': ATL['kraft_env']})
                x_ += wx_ + 0.003
        elif kind == 'bound':   # 完成的裝訂本：躺著一疊（顏色、厚度不同）或直立幾本
            if rr.random() < 0.5:
                y_ = ya_
                for q in range(rr.randint(2, 5)):
                    t_ = rr.uniform(0.008, 0.02); obox(c, (xc + rr.uniform(-0.015, 0.015), y_ + t_ / 2, zc), 0.21, t_, 0.297, rot('Y', rr.uniform(-0.12, 0.12)), rr.choice(BOUND)); y_ += t_
            else:
                x_ = xa_ + 0.02
                for q in range(rr.randint(3, 6)):
                    t_ = rr.uniform(0.01, 0.025); a_ = 0.0 if q else rr.uniform(-0.3, -0.15); yc_, wx_ = lifted(ya_, 0.297, t_, a_)
                    obox(c, (x_ + wx_ / 2, yc_, zc), t_, 0.297, 0.21, rot('Z', a_), rr.choice(BOUND)); x_ += wx_ + 0.002
pcb.done()
leafy('cubby_plant', bx0 + 0.25, cb['h'], ZI0 + 0.2, ['leaf0', 'leaf1', 'leaf2', 'leaf3'], n=16, rad=0.22, hgt=(0.18, 0.42), size=(0.08, 0.11), pot=(0.11, 0.18), potcol='#f0efea', side='back', droop=0.9, seed=5)
pcb2 = Part('cubby_top', side='back'); g = pcb2['goods']
# v1c（BB_257 §7-5）：格櫃上面的箱子：大小、角度都不同（A4 箱、大的牛皮紙箱、上面疊一個小的、斜放）
paper_box_(g, bx0 + 0.78, cb['h'], ZI0 + 0.2, 0.43, 0.27, 0.31, 'box_a4', R=rot('Y', 0.06), front='+z')
kraft_box(pcb2['vc'], bx0 + 1.42, cb['h'], ZI0 + 0.2, 0.52, 0.3, 0.34, -0.08)
kraft_box(pcb2['vc'], bx0 + 1.38, cb['h'] + 0.3, ZI0 + 0.19, 0.3, 0.16, 0.24, 0.22, col='#c8a070')
kraft_box(pcb2['vc'], bx0 + 1.84, cb['h'], ZI0 + 0.17, 0.2, 0.12, 0.26, 0.35, col='#a87a4a', tape=False)
pcb2.done()
bs = IT['back_sign']; psg = Part('back_sign', side='back')
crb(psg['vc'], bs['x'] - bs['w'] / 2, bs['x'] + bs['w'] / 2, bs['y'] - bs['h'] / 2, bs['y'] + bs['h'] / 2, ZI0, ZI0 + 0.02, '#1f3a78', r=0.004)
psg['sign'].rect((bs['x'], bs['y'], ZI0 + 0.021), (1, 0, 0), (0, 1, 0), bs['w'] / 2, bs['h'] / 2, ATL['back_sign'])
psg.done()


def prod_build(pt, model='a'):
    """生產用大型影印機：原點在地上、正面 +z；寬 0.9（x）、深 0.78（z）。v1c（BB_257 §7-4：兩台不能是同一顆）：
      a＝AD-7500（左邊那台，在用）：高 1.25＋送稿機（上面一疊稿子）、三層紙匣、右前方支架上的操作螢幕、左側伸出的出紙盤（印好的一疊）
      b＝AD-7800（右邊那台，維修中）：平板蓋（沒有送稿機，高 1.14）、兩層紙匣＋深灰大容量紙匣、操作面板在左前方、
         上半部的前蓋打開（裡面深灰、綠色的卡紙把手、碳粉匣）、蓋子上貼「維修中 請用左邊那台」"""
    c, cm, u, e = pt['vc'], pt['vcm'], pt['goods'], pt['emit']; w2, d2 = 0.45, 0.36
    crb(c, -w2 + 0.01, w2 - 0.01, 0.0, 0.05, -d2 + 0.02, d2 - 0.02, '#3a3d42', r=0.0)
    if model == 'a':
        crb(c, -w2, w2, 0.05, 1.0, -d2, d2, '#eaebe9', r=0.015)
        u.rect((0, 0.52, d2 + 0.002), (1, 0, 0), (0, 1, 0), w2 - 0.01, 0.46, ATL['copier_prod'])
        crb(c, -w2 - 0.01, w2 + 0.01, 1.0, 1.12, -d2 - 0.01, d2 + 0.01, '#f2f2f0', r=0.012)
        crb(c, -w2 + 0.05, w2 - 0.15, 1.12, 1.24, -d2 + 0.04, d2 - 0.1, '#d8d9d7', r=0.015)
        c.paint(bm_box(c.bm, -w2 + 0.09, w2 - 0.2, 1.24, 1.26, -d2 + 0.08, d2 - 0.18), '#c4c5c3')
        rr = random.Random(31)
        for k in range(6): u.box(-0.08 + rr.uniform(-0.012, 0.012), 1.263 + k * 0.006, -0.05 + rr.uniform(-0.012, 0.012), 0.3, 0.005, 0.21, PAPER_SIDE, cells={'+y': WHITE_PAPER})   # 送稿機上一疊論文原稿
        crb(c, -w2 - 0.02, w2 + 0.02, 0.98, 1.0, -d2 - 0.02, d2 + 0.02, '#3a3d42', r=0.0)          # 機身和掃描器中間的深灰線
        crb(c, -w2 + 0.04, w2 - 0.25, 0.82, 0.84, -d2 + 0.05, d2 - 0.12, '#5a5d62', r=0.0)          # 內出紙口
        for k in range(4): c.paint(bm_box(c.bm, -w2 + 0.08, w2 - 0.32, 0.84 + k * 0.004, 0.843 + k * 0.004, -d2 + 0.08, d2 - 0.16), '#fbfbf8')
        ccyl(cm, (w2 - 0.08, 1.12, d2 - 0.05), (w2 - 0.08, 1.38, d2 + 0.02), 0.015, '#8a8e96', seg=6)   # 操作螢幕的支架
        T = (w2 - 0.12, 1.42, d2 + 0.05); n0 = _N0(c); bm = L.rbox_bm(0.32, 0.02, 0.22, r=0.006, seg=1); c.add_bm(bm, fm(T, rot('X', -0.95))); bm.free(); c.paint(_new(c, n0), '#2c2e32')
        Rm = rot('X', -0.95); up = Rm @ Vector((0, 0, -1)); nrm = Rm @ Vector((0, 1, 0)); ctr = Vector(T) + nrm * 0.0105
        e.rect(tuple(ctr), (1, 0, 0), tuple(up), 0.14, 0.095, ATL['scr_ui2'])
        e.rect((-w2 + 0.06, 1.06, d2 + 0.012), (1, 0, 0), (0, 1, 0), 0.012, 0.012, ATL['led_g'])
        crb(c, -w2 - 0.2, -w2, 0.66, 0.68, -0.25, 0.05, '#d0d1cf', r=0.0); crb(c, -w2 - 0.2, -w2 - 0.18, 0.68, 0.72, -0.25, 0.05, '#d0d1cf', r=0.0)   # 左側的出紙盤
        for k in range(8): c.paint(bm_box(c.bm, -w2 - 0.175 + k * 0.002, -w2 - 0.01, 0.681 + k * 0.004, 0.6835 + k * 0.004, -0.23, 0.03), '#fbfbf8')
    else:
        dx0, dx1, dy0, dy1 = -w2 + 0.04, w2 - 0.04, 0.54, 0.96
        crb(c, -w2, w2, 0.05, dy0, -d2, d2, '#e2e3e0', r=0.012)                                     # 下半部（紙匣）
        crb(c, -w2, w2, dy0, 1.0, -d2, d2 - 0.05, '#e2e3e0', r=0.0)                                  # 上半部往裡縮 5 cm（前蓋打開，看得到裡面）
        for (xa_, xb_) in ((-w2, dx0), (dx1, w2)): crb(c, xa_, xb_, dy0, 1.0, d2 - 0.05, d2, '#e2e3e0', r=0.0)
        u.rect((0, 0.29, d2 + 0.002), (1, 0, 0), (0, 1, 0), w2 - 0.01, 0.23, sub('copier_prod_b', 0, 0, 1, 0.5))   # 下半部：紙匣（貼圖的下半）
        crb(c, dx0, dx1, dy0, 1.0, d2 - 0.052, d2 - 0.048, '#26282c', r=0.0)                        # 前蓋打開：裡面（深灰）
        for (xx, col) in ((-0.22, '#3a9a5a'), (0.0, '#3a9a5a'), (0.2, '#3a9a5a')): crb(c, xx - 0.025, xx + 0.025, 0.62, 0.72, d2 - 0.045, d2 - 0.02, col, r=0.0)   # 綠色的卡紙把手
        ccyl(c, (-0.3, 0.84, d2 - 0.04), (0.3, 0.84, d2 - 0.04), 0.035, '#1a1a1c', seg=10)          # 碳粉匣
        ccyl(c, (-0.3, 0.84, d2 - 0.04), (-0.26, 0.84, d2 - 0.04), 0.038, '#3a5aa8', seg=10)
        for y_ in (dy0, dy1): crb(c, -w2, w2, y_ - 0.005, y_ + 0.005, d2 - 0.05, d2, '#cfd0ce', r=0.0)
        hx = w2 - 0.01; dw = dx1 - dx0; a_ = 1.25   # 前蓋（右邊鉸鏈，打開約 72°）
        Rd = rot('Y', a_); mid = Vector((hx, (dy0 + dy1) / 2, d2)) + Rd @ Vector((-dw / 2, 0, 0.012))
        obox(c, tuple(mid), dw, dy1 - dy0, 0.024, Rd, '#e4e5e2')
        crb(c, -w2 - 0.01, w2 + 0.01, 1.0, 1.1, -d2 - 0.01, d2 + 0.01, '#f2f2f0', r=0.012)           # 掃描器
        n0 = _N0(c); bm = L.rbox_bm(w2 * 2 - 0.06, 0.035, d2 * 2 - 0.08, r=0.008, seg=1); c.add_bm(bm, fm((0, 1.12, -0.02))); bm.free(); c.paint(_new(c, n0), '#dcddda')   # 平板蓋
        crb(c, -w2 + 0.02, -w2 + 0.36, 1.0, 1.06, d2, d2 + 0.09, '#3a3d42', r=0.006)                 # 左前方的操作面板（平的）
        e.rect((-w2 + 0.13, 1.061, d2 + 0.045), (1, 0, 0), (0, 0, -1), 0.08, 0.035, ATL['scr_ui2'])
        e.rect((-w2 + 0.3, 1.061, d2 + 0.045), (1, 0, 0), (0, 0, -1), 0.012, 0.012, ATL['led_o'])
        u.rect((0.12, 1.05, d2 + 0.0115), (1, 0, 0), (0, 1, 0), 0.11, 0.073, ATL['note_repair'])        # 「維修中」（貼在掃描器正面）
        u.rect((0.2, 1.139, 0.12), (1, 0, 0), (0, 0, -1), 0.11, 0.073, ATL['note_repair'])           # 蓋子上也一張
        for zz in (0.04, 0.19): c.paint(bm_box(c.bm, 0.17, 0.23, 1.139, 1.1405, zz, zz + 0.015), '#e2dec4')   # 膠帶
        rr = random.Random(32)
        for k in range(3): ubox(u, (-0.35 + 0.0, 0.003 + 0.004 * k, d2 + 0.25 + rr.uniform(-0.03, 0.03)), 0.297, 0.004, 0.21, rot('Y', rr.uniform(-0.6, 0.6)), {'*': PAPER_SIDE, '+y': WHITE_PAPER})   # 地上：抽出來的卡紙
    for sx in (-1, 1):
        for sz in (-1, 1): ccyl(cm, (sx * (w2 - 0.06), 0.05, sz * (d2 - 0.06)), (sx * (w2 - 0.06), 0.0, sz * (d2 - 0.06)), 0.022, '#2a2a2c', seg=6)


for k, it in enumerate([i for i in ITL if i['kind'] == 'copier_prod']):
    _p = Part(f'prod_{"ab"[k]}', T=fm((it['x'], 0, it['z']))); prod_build(_p, 'ab'[k]); _p.done()
# 影印機上面的牆：兩層鐵層板（碳粉盒、資料夾、紙箱）——參考圖右後是一座放滿東西的灰色鐵架
pws = Part('back_wallshelf', side='back'); c, cm, g = pws['vc'], pws['vcm'], pws['goods']; sx0, sx1 = 0.3, 2.02
for y in (1.82, 2.22):
    cm.cbox(sx0, sx1, y - 0.02, y, ZI0, ZI0 + 0.32, '#8e939b')
    for x_ in (sx0 + 0.08, (sx0 + sx1) / 2, sx1 - 0.08): cm.cbox(x_ - 0.012, x_ + 0.012, y - 0.2, y - 0.02, ZI0, ZI0 + 0.02, '#6e737b'); cm.cbox(x_ - 0.006, x_ + 0.006, y - 0.15, y - 0.02, ZI0 + 0.02, ZI0 + 0.28, '#6e737b')
for x_ in (sx0 + 0.08, (sx0 + sx1) / 2, sx1 - 0.08): cm.cbox(x_ - 0.012, x_ + 0.012, 1.55, 2.4, ZI0, ZI0 + 0.015, '#6e737b')   # 牆上的軌道
_r = random.Random(64); RW = rot('Y', math.pi / 2)   # v1c：資料夾一本一本（書背朝 +z、沿 +x 排）
book_row(g, (0, 0, ZI0 + 0.31), RW, sx0 + 0.04, sx0 + 0.72, 1.82, 0.3, _r, list(range(0, 12)), hgt=(0.24, 0.3), dep=(0.22, 0.27))
for k in range(4): crb(c, sx0 + 0.78 + k * 0.13, sx0 + 0.89 + k * 0.13, 1.82, 2.02, ZI0 + 0.04, ZI0 + 0.3, ['#2a2b2e', '#2a2b2e', '#d8d9d7', '#2b56a8'][k], r=0.004)   # 碳粉盒
tex_box(g, sx1 - 0.48, sx1 - 0.04, 1.82, 2.1, ZI0 + 0.02, ZI0 + 0.31, '+z', 'box_a4', side_cell=sub('box_a4', 0.6, 0.0, 1.0, 0.55), top_cell=sub('box_a4', 0.6, 0.0, 1.0, 0.3))
for (x_, w_, h_, d_, ya, col) in ((sx0 + 0.25, 0.42, 0.24, 0.27, 0.05, '#b88a5a'), (sx0 + 0.72, 0.34, 0.17, 0.25, -0.14, '#c49a64'), (sx1 - 0.3, 0.5, 0.3, 0.28, 0.08, '#a87a4a')): kraft_box(c, x_, 2.22, ZI0 + 0.17, w_, h_, d_, ya, col=col)   # v1c：三個牛皮紙箱大小、角度不同
book_row(g, (0, 0, ZI0 + 0.31), RW, sx0 + 0.94, sx1 - 0.58, 2.22, 0.3, _r, list(range(12, 20)), hgt=(0.2, 0.28), thk=(0.012, 0.035), dep=(0.2, 0.26))
pws.done()
# 生產用影印機 B 上面一台小螢幕（參考圖）
p2 = [i for i in ITL if i['kind'] == 'copier_prod'][1]; ptop = Part('prod_top', T=fm((p2['x'] - 0.18, 1.1375, p2['z'] - 0.08), rot('Y', 0.2)))   # v1c：B 換成平板蓋（比較矮）
crb(ptop['vc'], -0.08, 0.08, 0.0, 0.012, -0.06, 0.06, '#2a2b2e', r=0.0); crb(ptop['vc'], -0.015, 0.015, 0.0, 0.2, -0.015, 0.015, '#2a2b2e', r=0.0)
crb(ptop['vc'], -0.21, 0.21, 0.12, 0.38, 0.015, 0.04, '#1c1d20', r=0.005); ptop['emit'].rect((0, 0.25, 0.041), (1, 0, 0), (0, 1, 0), 0.195, 0.115, ATL['scr_doc']); ptop.done()

# ======================================================================
for ob in list(root.children):
    if ob.type == 'MESH' and len(ob.data.polygons) == 0: bpy.data.objects.remove(ob)
K.remove_protos()
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or 'ceilfx' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
ss = None if os.environ.get('AD_NOSS') else L.single_side(root, keep=r'glass', nodup=r'ad_(plaster|wood|floor_tile|ceil|goods|sign|alpha)', skip=lambda ob: 'ceilfx' in ob.name)   # 天花板上的東西（ad_ceilfx_*）只做朝下的面、不補反面：遊戲鏡頭從天花板上面看時看不到
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出 EXT_mesh_gpu_instancing 的節點叫 ade_interior.N、沒有自訂屬性 → 遊戲的 /WALL_/ 認不到。
    改成網格的名字（…_inst），牆上的補 extras.dir（往室內的法線）。照 corner_interior.py。"""
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
protos = {p.name: p.n for p in (PANEL, TABLE, CHAIR)}
info.update({'shop': 'ade', 'zone': LAY['zone'], 'layout': 1, 'drawn_tris': drawn, 'protos': protos, 'single_side': ss,
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m})})
L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', drawn, 'MATS', len(info['materials']), 'BYTES', info['bytes'])
print('CC0_USED', K.used())
