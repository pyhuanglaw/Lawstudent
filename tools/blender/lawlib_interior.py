"""萬才館 法律學院圖書館（兩層：一樓櫃台、自習區、影印室、兩間討論室；U 形樓梯；二樓藏書）正式模型 → GLB。
第二 AI 工作階段（環境美術）製作，LAWWW 2026-10-13 分派（使用者指定）。Blender 5.2 bpy 無介面：
  /opt/blenv/bin/python tools/blender/lawlib_interior.py [-- --out assets/models/env/lawlib_interior.glb] [--preview 資料夾]
配置讀 src/data/lawlib_layout.js（遊戲 src/lawlib3d.js 的導航、座位、互動點讀同一份，兩邊的牆、樓梯、家具位置一定一致）。
座標＝配置的座標：x 往東、z 往南（+z＝南牆：窗朝法學院前的廣場）、y 往上；一樓地板 y=0、二樓 4.2 m、屋頂 7.8 m。
節點命名（src/building3d.js 的 attachFormal）：L0_root（一樓＋整座樓梯）、L1_root（二樓：玩家在一樓、鏡頭高過二樓地板時藏起來）；
  名字含 WALL_ 的是外牆和貼在外牆上的東西（窗框、窗台、踢腳板、安全梯的門…；擋住鏡頭時一起淡出），自訂屬性 dir＝往室內的法線。玻璃不放進 WALL_（會被設成不透明）。
書：一層書架的一個開間做成一個「書模組」（一本一本的書，只做看得到的面），每一格放一個（GPU instancing，glTF EXT_mesh_gpu_instancing）；
  書背、封面是程式畫的圖集（tools/blender/env_second/lawlib_atlas.py → textures/gen/lawlib_books.png、lawlib_covers.png；書名只寫科目）。
擋住鏡頭時網點透空的材質（lawlib3d.js）：ll_shelf*（書架鐵件）、ll_book*（書）、ll_endpanel*（書架端板、頂板）、ll_journal*（期刊封面）。
材質：Poly Haven CC0（一樓 granite_tile、二樓 dirty_carpet 調成灰藍、樓梯 granite_tile_03、木作 walnut_veneer、天花板 ceiling_interior）；金屬度 ≤ 0.45（遊戲沒有環境貼圖）。
不做：字（櫃台、房間、書架、樓層的標示牌、名牌：遊戲用 canvas 畫；這裡只做吊牌的背板和吊線）、公告欄（遊戲的 W3.bulletin）、窗外的景（遊戲的 outView）、點地面用的透明地板。
真實性：使用者描述的樓層用途；平面、家具、材質是遊戲化設計（D46），不宣稱還原真實館舍。"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'env_second')); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import plants as PL   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/lawlib_interior.glb'))
src = open(os.path.join(L.ROOT, 'src/data/lawlib_layout.js'), encoding='utf8').read()
J = json.loads(src[src.index('{', src.index('const LAWLIB_LAYOUT=')):src.rindex('}') + 1])
GEN = os.path.join(HERE, 'env_second', 'textures', 'gen'); ATL = json.load(open(os.path.join(GEN, 'lawlib_books.json')))

W, D, T = J['W'], J['D'], J['wallT']; Y1 = J['floors'][1]['y']; RY = J['roofY']; ST = J['slabT']; C0 = J['ceil0']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
XI0, XI1, ZI0, ZI1 = X0 + T / 2, X1 - T / 2, Z0 + T / 2, Z1 - T / 2          # 牆的內面
S = J['stair']; SA, SB, LD, MW, WL = S['A'], S['B'], S['landing'], S['midWall'], S['well']; RS, TR = S['rise'], S['tread']
FZ, EN = J['frontZ'], J['entrance']
FWX = -3.395                                                                    # B 跑東側木作牆的東面（「法律學院圖書館」牌子在 x=−3.38）
FWC0, FWC1 = -3.47, -3.43                                                       # 那道牆的結構（西面是 B 跑的牆）
random.seed(46)
B.reset(texres=512)
root = B.group('LawLibrary', props={'kind': 'lawlib_interior', 'w': W, 'd': D})
G = [B.group('L0_root', root), B.group('L1_root', root)]
DIRS = {'N': [0, 0, 1], 'S': [0, 0, -1], 'W': [1, 0, 0], 'E': [-1, 0, 0]}

# ---------------- 材質 ----------------
def img_mat(name, png, rough=0.7, emit=False):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, png))
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    m['tile'] = 1.0; return m

M = {
    'stone': L.pbr('ll_floor_stone', 'granite_tile', tile=3.0, target='#c4bdb1', sat=0.5, normal=0.35, maps=('diff', 'nor'), rough_value=0.42),   # 一樓：60 cm 見方的淺色石材地磚
    'carpet': L.pbr('ll_carpet', 'dirty_carpet', tile=1.0, target='#6c7680', sat=0.15, normal=0.5, maps=('diff', 'nor'), rough_value=0.95),     # 二樓、討論室：灰藍地毯
    'slab': L.flat('ll_slab', '#e9e7e1', rough=0.9),
    'wall': L.flat('ll_wall', '#ebe8e1', rough=0.9),
    'ceil': L.pbr('ll_ceiling', 'ceiling_interior', tile=0.6, target='#eeede9', sat=0.0, normal=0.25, maps=('diff', 'nor'), rough_value=0.9, cull=True),   # 礦纖天花板（輕鋼架 60 cm 一格）
    'tbar': L.flat('ll_ceiling_grid', '#dcdcd8', rough=0.5, cull=True),   # 輕鋼架、燈框只做底面、單面朝下（LAWWW2 10-22：鏡頭拉到最遠最陡、在天花板上面時看不到）
    'light': L.flat('ll_light_panel', '#fff6e4', rough=0.9, emit=B.srgb('#fff4dc'), cull=True),
    'walnut': L.pbr('ll_walnut', 'walnut_veneer', tile=1.2, target='#6b4a33', maps=('diff',), res=512, rough_value=0.5),
    'endpanel': L.pbr('ll_endpanel', 'walnut_veneer', tile=1.2, target='#6e4c34', maps=('diff',), res=512, rough_value=0.45),
    'top': L.pbr('ll_tabletop', 'walnut_veneer', tile=1.4, target='#b08a62', maps=('diff',), res=512, rough_value=0.42),
    'chairwood': L.pbr('ll_chair_wood', 'walnut_veneer', tile=0.8, target='#8a6a4a', maps=('diff',), res=256, rough_value=0.55),
    'shelf': L.flat('ll_shelf_steel', '#a8adb2', rough=0.45, metal=0.2),
    'book': img_mat('ll_book_atlas', 'lawlib_books.png', rough=0.62),
    'cover': img_mat('ll_journal_covers', 'lawlib_covers.png', rough=0.4),
    'granite': L.pbr('ll_stair_granite', 'granite_tile_03', tile=1.2, target='#8f8b85', sat=0.4, normal=0.4, maps=('diff', 'nor'), rough_value=0.4),
    'nosing': L.flat('ll_nosing', '#34363a', rough=0.7),
    'steel': L.flat('ll_steel', '#c9ccd0', rough=0.28, metal=0.45),
    'frame': L.flat('ll_frame', '#3a3d40', rough=0.45, metal=0.3),
    'glass': L.flat('ll_glass', '#c4d6dc', rough=0.05, alpha=0.2),
    'frost': L.flat('ll_glass_frosted', '#eef2f3', rough=0.3, alpha=0.62),
    'seat': L.flat('ll_seat_fabric', '#4e5a66', rough=0.9),
    'fabric': L.flat('ll_fabric_navy', '#3e4a5c', rough=0.9),
    'laminate': L.flat('ll_laminate', '#d8d2c4', rough=0.45),
    'brass': L.flat('ll_brass', '#b8913f', rough=0.35, metal=0.45),
    'shade': L.flat('ll_lampshade_green', '#1d6a45', rough=0.25),
    'glow': L.flat('ll_lamp_glow', '#fff1d6', rough=0.5, emit=B.srgb('#ffe9c4')),
    'white': L.flat('ll_white', '#f2f1ec', rough=0.4),
    'black': L.flat('ll_black', '#222428', rough=0.4),
    'tv': L.flat('ll_tv_glass', '#15171a', rough=0.15),
    'screen': L.flat('ll_screen', '#bcd4ea', rough=0.3, emit=B.srgb('#8fb4d8')),
    'grey': L.flat('ll_grey', '#7a8288', rough=0.4, metal=0.2),
    'mat': L.flat('ll_doormat', '#4a4d50', rough=0.95),
    'paper': L.flat('ll_paper', '#f4f1e8', rough=0.9),
    'red': L.flat('ll_red', '#b8312f', rough=0.4),
    'pot': L.flat('ll_planter', '#5d6064', rough=0.6),
    'ledblue': L.flat('ll_gate_led', '#cfe6ff', rough=0.5, emit=B.srgb('#9cc8ff')),
    'exit': img_mat('ll_exit_sign', 'lawlib_exit.png', rough=0.5, emit=True),
    'lobbyfloor': L.pbr('ll_lobby_floor', 'terrazzo_tiles', tile=1.6, target='#d6cdbd', sat=0.5, maps=('diff',), res=256, rough_value=0.45),
    'lobbylight': L.flat('ll_lobby_glow', '#f6efe2', rough=0.9, emit=B.srgb('#e9dfcc')),
    'signback': L.flat('ll_sign_back', '#24303a', rough=0.6),
}
PM = PL.materials('ll_')

# ---------------- 網格累積器：同一層、同一個材質合成一個網格 ----------------
MESH, WMESH = {}, {}
def mk(lv, key):
    k = (lv, key)
    if k not in MESH: MESH[k] = Mesh(f'L{lv}_{key}', M[key])
    return MESH[k]
def wm(lv, side, key):
    """貼在外牆上、要跟著牆一起淡出的東西（名字含 WALL_，自訂屬性 dir）"""
    k = (lv, side, key)
    if k not in WMESH: WMESH[k] = Mesh(f'L{lv}_WALL_{side}_{key}', M[key])
    return WMESH[k]

class UM(Mesh):
    """自己給 UV 的網格（書、封面、標示燈）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.verify()
    def face(self, pts, uvs):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f
UMESH, WUM = {}, {}
def wum(lv, side, key):
    k = (lv, side, key)
    if k not in WUM: WUM[k] = UM(f'L{lv}_WALL_{side}_{key}', M[key])
    return WUM[k]
def um(lv, key):
    k = (lv, key)
    if k not in UMESH: UMESH[k] = UM(f'L{lv}_{key}', M[key])
    return UMESH[k]

def xf(cx, cy, cz, yaw=0.0, pitch=0.0):
    """區域座標 → 遊戲座標：先繞本地 x 轉 pitch（正的＝上面往前傾），再繞 y 轉 yaw（前＝(sin yaw, cos yaw)、右＝(cos yaw, −sin yaw)）"""
    s, c, sp, cp = math.sin(yaw), math.cos(yaw), math.sin(pitch), math.cos(pitch)
    def f(lx, ly, lz):
        y_, z_ = ly * cp - lz * sp, ly * sp + lz * cp
        return (cx + lx * c + z_ * s, cy + y_, cz - lx * s + z_ * c)
    return f

QUADS = {'-x': [(0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)], '+x': [(1, 0, 1), (1, 0, 0), (1, 1, 0), (1, 1, 1)],
         '-y': [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)], '+y': [(0, 1, 1), (1, 1, 1), (1, 1, 0), (0, 1, 0)],
         '-z': [(1, 0, 0), (0, 0, 0), (0, 1, 0), (1, 1, 0)], '+z': [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)]}
def tbox(m, f, lx0, lx1, ly0, ly1, lz0, lz1, faces=None):
    """轉過的盒子（f＝xf(...)）；faces＝要做的面（預設六面）"""
    bm = m.bm; V = {}
    for i, lx in enumerate((lx0, lx1)):
        for j, ly in enumerate((ly0, ly1)):
            for k, lz in enumerate((lz0, lz1)): V[(i, j, k)] = bm.verts.new(g2b(*f(lx, ly, lz)))
    return [bm.faces.new([V[q] for q in QUADS[k]]) for k in (faces or QUADS.keys())]
def rbox(m, cx, cz, yaw, lx0, lx1, y0, y1, lz0, lz1, faces=None):
    return tbox(m, xf(cx, 0, cz, yaw), lx0, lx1, y0, y1, lz0, lz1, faces)
def hquad(m, x0, x1, z0, z1, y, down=True):
    p = [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]
    m.quad(p if down else p[::-1])
def vquad_x(m, x, z0, z1, y0, y1, facing):
    """x 固定的直立面（facing＝+1 面向 +x）"""
    p = [(x, y0, z1), (x, y0, z0), (x, y1, z0), (x, y1, z1)]
    m.quad(p if facing > 0 else p[::-1])
def vquad_z(m, z, x0, x1, y0, y1, facing):
    p = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    m.quad(p if facing > 0 else p[::-1])
def rail(m, pts, r=0.02, seg=8):
    """一條圓管（扶手）沿折線 pts（遊戲座標）"""
    for a, b in zip(pts, pts[1:]): m.cyl(a, b, r, seg=seg)
def prism_x(m, poly, x0, x1):
    """沿 x 擠出的多邊形（poly＝[(z,y)…]；從 +x 看的順逆時針自動校正）"""
    area = sum((-poly[i][0]) * poly[(i + 1) % len(poly)][1] - (-poly[(i + 1) % len(poly)][0]) * poly[i][1] for i in range(len(poly)))
    if area < 0: poly = poly[::-1]
    bm = m.bm; a = [bm.verts.new(g2b(x0, y, z)) for (z, y) in poly]; b = [bm.verts.new(g2b(x1, y, z)) for (z, y) in poly]
    bm.faces.new(a[::-1]); bm.faces.new(b); n = len(poly)
    for i in range(n): bm.faces.new([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])

# ================= 地板、樓板、天花板 =================
mk(0, 'stone').box(X0, X1, -0.05, 0.0, Z0, Z1)
for rm in J['rooms']:
    if rm['kind'] == 'discussion': mk(0, 'carpet').box(rm['x0'], rm['x1'], 0.0, 0.006, ZI0, FZ - 0.1)
mk(0, 'mat').box(6.25, XI1, 0.0, 0.012, EN['z0'] + 0.1, EN['z1'] - 0.1)
SLABS = [(X0, X1, Z0, WL['z0']), (WL['x1'], X1, WL['z0'], Z1), (MW['x0'], WL['x1'], WL['z0'], SB['z0'])]   # 第三塊：B 跑最上面一階和樓板邊之間
for (a, b, c, d) in SLABS:
    mk(1, 'slab').box(a, b, Y1 - ST, Y1 - 0.012, c, d)
    mk(1, 'carpet').box(max(a, XI0), min(b, XI1), Y1 - 0.012, Y1, max(c, ZI0), min(d, ZI1))
mk(0, 'wall').box(XI0, MW['x0'], C0, Y1 - ST, WL['z0'] - 0.02, WL['z0'] + 0.02)          # 樓梯井北邊：一樓天花板到樓板之間的封板

def ceiling(lv, y, rects, grid0, troffers, smoke):
    """天花板（朝下）＋輕鋼架（60 cm）＋燈＋偵煙器；rects＝[(x0,x1,z0,z1)]"""
    for (x0, x1, z0, z1) in rects:
        hquad(mk(lv, 'ceil'), x0, x1, z0, z1, y)
        gx, gz = grid0
        k = math.ceil((x0 - gx) / 0.6 + 1e-6)
        while gx + k * 0.6 < x1 - 0.05:
            x = gx + k * 0.6; hquad(mk(lv, 'tbar'), x - 0.012, x + 0.012, z0, z1, y - 0.012); k += 1   # 只做底面（原本 1.2 cm 高的方盒，從上面看是浮著的白線）
        k = math.ceil((z0 - gz) / 0.6 + 1e-6)
        while gz + k * 0.6 < z1 - 0.05:
            z = gz + k * 0.6; hquad(mk(lv, 'tbar'), x0, x1, z - 0.012, z + 0.012, y - 0.0125); k += 1   # 低 0.5 mm：交叉的地方不疊面
    for (cx, cz, w, d) in troffers:
        hquad(mk(lv, 'tbar'), cx - w / 2 - 0.02, cx + w / 2 + 0.02, cz - d / 2 - 0.02, cz + d / 2 + 0.02, y - 0.02)   # 燈框：只做底面
        hquad(mk(lv, 'light'), cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2, y - 0.021)
    for (cx, cz) in smoke:
        mk(lv, 'white').cyl((cx, y - 0.035, cz), (cx, y, cz), 0.055, seg=12)
snap = lambda v, o: o + 0.6 * round((v - o) / 0.6)
TROF0 = [(-1.4, -2.0), (1.0, -2.0), (-1.4, 2.0), (1.0, 2.0), (4.6, -1.0), (4.6, 5.8), (-5.4, -1.4), (0.8, 5.6), (-1.4, 5.6), (4.6, 2.6), (-5.4, 1.4), (4.6, -3.2), (1.0, -3.4), (-1.4, -3.4),
         (-5.4, -6.2), (-1.8, -6.2), (1.6, -6.2), (5.2, -6.2)]
ceiling(0, C0, [(XI0, XI1, ZI0, WL['z0']), (FWX, XI1, WL['z0'], ZI1), (MW['x1'], FWX, WL['z0'], SB['z0'] - 0.03)], (XI0, ZI0),
        [(snap(x, XI0), snap(z, ZI0 + 0.3), 1.2, 0.6) for (x, z) in TROF0], [(-3.0, 0.0), (2.4, 0.0), (5.6, 6.4), (-0.6, 6.4), (-5.4, -5.6), (1.6, -5.4), (4.0, 3.0)])
# 二樓：整片（樓梯井上面也是屋頂）；長條燈在書架之間的走道上方、閱覽區、樓梯井
LIN = [(x, z, 0.16, 3.2) for x in (-1.6, 0.0, 1.6, 3.2, 5.4) for z in (-4.4, -0.2)] + [(-4.8, -4.6, 0.16, 2.4), (-4.8, -0.8, 0.16, 2.4)] + \
      [(x, z, 2.4, 0.16) for x in (-0.6, 2.4, 5.4) for z in (4.8, 6.6)] + [(-5.2, 5.0, 0.16, 3.0)]
ceiling(1, RY, [(XI0, XI1, ZI0, ZI1)], (XI0, ZI0), LIN, [(-3.0, -3.0), (2.4, -3.0), (2.4, 4.0), (-5.2, 2.0), (5.6, -6.0)])

# ================= 外牆（兩層，一層一塊；窗洞、入口）＋窗框、窗台、玻璃 =================
def holes_for(lv, side):
    y0, y1 = (0.0, Y1) if lv == 0 else (Y1, RY); out = []
    for w in J['windows']:
        if w['wall'] != side: continue
        a, b = max(w['y0'], y0), min(w['y1'], y1)
        if b - a > 0.02: out.append((w['a0'], w['a1'], a, b, w))
    if lv == 0 and side == 'E': out.append((EN['z0'], EN['z1'], 0.0, 2.5, None))
    return sorted(out, key=lambda h: h[0])
def wall_piece(lv, side, a0, a1, y0, y1):
    if a1 - a0 < 0.01 or y1 - y0 < 0.01: return
    m = wm(lv, side, 'wall')
    if side == 'N': m.box(a0, a1, y0, y1, Z0 - T / 2, Z0 + T / 2)
    elif side == 'S': m.box(a0, a1, y0, y1, Z1 - T / 2, Z1 + T / 2)
    elif side == 'W': m.box(X0 - T / 2, X0 + T / 2, y0, y1, a0, a1)
    else: m.box(X1 - T / 2, X1 + T / 2, y0, y1, a0, a1)
def on_wall(m, side, a0, a1, y0, y1, d0, d1):
    """貼在牆上的盒子：a＝沿牆的座標、d＝從牆的內面往室內的距離"""
    if side == 'N': m.box(a0, a1, y0, y1, ZI0 + d0, ZI0 + d1)
    elif side == 'S': m.box(a0, a1, y0, y1, ZI1 - d1, ZI1 - d0)
    elif side == 'W': m.box(XI0 + d0, XI0 + d1, y0, y1, a0, a1)
    else: m.box(XI1 - d1, XI1 - d0, y0, y1, a0, a1)
SPAN = {'N': (X0, X1), 'S': (X0, X1), 'W': (ZI0, ZI1), 'E': (ZI0, ZI1)}
for lv in (0, 1):
    y0, y1 = (0.0, Y1) if lv == 0 else (Y1, RY)
    for side in 'NSWE':
        a0, a1 = SPAN[side]; cur = a0
        for (ha, hb, hy0, hy1, w) in holes_for(lv, side):
            wall_piece(lv, side, cur, ha, y0, y1); wall_piece(lv, side, ha, hb, y0, hy0); wall_piece(lv, side, ha, hb, hy1, y1); cur = hb
            if w is None: continue
            fr = wm(lv, side, 'frame'); n = w['n']; ln = hb - ha
            for i in range(n + 1):                                                      # 直櫺
                a = ha + ln * i / n; e = 0.03 if 0 < i < n else 0.04
                on_wall(fr, side, max(ha, a - e), min(hb, a + e), hy0, hy1, -T / 2 - 0.04, -T / 2 + 0.04)
            for yy, top in ((hy0, False), (hy1, True)):                                  # 上下框（跨兩層的窗：樓板那一條也有）
                on_wall(fr, side, ha, hb, yy - (0.05 if top else 0.0), yy + (0.0 if top else 0.05), -T / 2 - 0.05, -T / 2 + 0.05)
            if w['y1'] - w['y0'] > 3.0 and hy0 < 5.6 < hy1:                                  # 樓梯的高窗：中間一道橫櫺
                on_wall(fr, side, ha, hb, 5.57, 5.63, -T / 2 - 0.05, -T / 2 + 0.05)
            if hy0 < 1.5 and hy0 == w['y0']: on_wall(wm(lv, side, 'walnut'), side, ha - 0.04, hb + 0.04, hy0 - 0.04, hy0, -0.02, 0.14)   # 低窗的木窗台
            gl = mk(lv, 'glass')
            if side == 'N': vquad_z(gl, Z0, ha, hb, hy0, hy1, 1)
            elif side == 'S': vquad_z(gl, Z1, ha, hb, hy0, hy1, -1)
            elif side == 'W': vquad_x(gl, X0, ha, hb, hy0, hy1, 1)
            else: vquad_x(gl, X1, ha, hb, hy0, hy1, -1)
        wall_piece(lv, side, cur, a1, y0, y1)
        # 踢腳板（深灰，10 cm）
        rngs = {(1, 'W'): [(ZI0, WL['z0'])], (1, 'S'): [(WL['x1'], XI1)], (0, 'E'): [(ZI0, EN['z0']), (EN['z1'], ZI1)]}.get((lv, side), [(XI0, XI1) if side in 'NS' else (ZI0, ZI1)])
        for (a0i, a1i) in rngs: on_wall(wm(lv, side, 'nosing'), side, a0i, a1i, y0, y0 + 0.1, 0.0, 0.012)   # 二樓：樓梯井那一段沒有地板，不做

# ---- 入口（東牆一樓）：鋁框、雙開玻璃門（關著；出去是遊戲的互動點）、把手、霧面腰帶；門外一小段萬才館大廳 ----
ez0, ez1, ezc = EN['z0'], EN['z1'], (EN['z0'] + EN['z1']) / 2
fr = wm(0, 'E', 'frame')
fr.box(X1 - 0.08, X1 + 0.08, 0.0, 2.5, ez0, ez0 + 0.05); fr.box(X1 - 0.08, X1 + 0.08, 0.0, 2.5, ez1 - 0.05, ez1)
fr.box(X1 - 0.08, X1 + 0.08, 2.44, 2.5, ez0, ez1)
for (za, zb) in ((ez0 + 0.05, ezc - 0.004), (ezc + 0.004, ez1 - 0.05)):              # 門扇的鋁框（左右、上、下踢板）
    fr.box(X1 - 0.03, X1 + 0.03, 0.0, 2.43, za, za + 0.06); fr.box(X1 - 0.03, X1 + 0.03, 0.0, 2.43, zb - 0.06, zb)
    fr.box(X1 - 0.03, X1 + 0.03, 2.37, 2.43, za, zb); fr.box(X1 - 0.03, X1 + 0.03, 0.0, 0.16, za, zb)
    vquad_x(mk(0, 'glass'), X1, za + 0.06, zb - 0.06, 0.16, 2.37, -1)
    vquad_x(mk(0, 'frost'), X1 - 0.032, za + 0.06, zb - 0.06, 1.15, 1.3, -1)
for zz in (ezc - 0.09, ezc + 0.09):                                                      # 直把手（室內那一面）
    wm(0, 'E', 'steel').box(X1 - 0.09, X1 - 0.07, 0.75, 1.45, zz - 0.012, zz + 0.012)
    for yy in (0.8, 1.4): wm(0, 'E', 'steel').box(X1 - 0.07, X1 - 0.03, yy - 0.01, yy + 0.01, zz - 0.008, zz + 0.008)
mk(0, 'lobbyfloor').box(X1 + T / 2, X1 + 3.2, -0.05, 0.0, ez0 - 1.2, ez1 + 0.6)          # 門外：萬才館大廳西南角（二樓門廳底下）
hquad(mk(0, 'wall'), X1 + T / 2, X1 + 3.2, ez0 - 1.2, ez1 + 0.6, 3.6)
vquad_x(mk(0, 'lobbylight'), X1 + 3.2, ez0 - 1.2, ez1 + 0.6, 0.0, 3.6, -1)
vquad_z(mk(0, 'wall'), ez0 - 1.2, X1 + T / 2, X1 + 3.2, 0.0, 3.6, 1); vquad_z(mk(0, 'wall'), ez1 + 0.6, X1 + T / 2, X1 + 3.2, 0.0, 3.6, -1)
EXITS = [(0, ezc, 2.72)]                                                                     # 出口標示燈（門上；做在最後，見 exit_sign）

# ================= 一樓北側的房間：前牆（討論室、影印室＝玻璃；辦公室＝實牆＋木門）、隔間牆 =================
fz0, fz1 = FZ - 0.1, FZ + 0.1
for rm in J['rooms']:
    x0, x1 = rm['x0'], rm['x1']; d0, d1 = rm['door']
    if rm['kind'] == 'office':
        mk(0, 'wall').box(x0, d0, 0.0, C0, fz0, fz1); mk(0, 'wall').box(d1, x1, 0.0, C0, fz0, fz1); mk(0, 'wall').box(d0, d1, 2.35, C0, fz0, fz1)
        mk(0, 'frame').box(d0, d0 + 0.05, 0.0, 2.35, fz1 - 0.02, fz1 + 0.02); mk(0, 'frame').box(d1 - 0.05, d1, 0.0, 2.35, fz1 - 0.02, fz1 + 0.02); mk(0, 'frame').box(d0, d1, 2.3, 2.35, fz1 - 0.02, fz1 + 0.02)
        mk(0, 'walnut').box(d0 + 0.05, d1 - 0.05, 0.0, 2.3, FZ - 0.02, FZ + 0.02)                  # 木門（關著）
        mk(0, 'steel').box(d1 - 0.22, d1 - 0.08, 1.02, 1.05, FZ + 0.05, FZ + 0.075); mk(0, 'steel').box(d1 - 0.1, d1 - 0.08, 1.0, 1.07, FZ + 0.02, FZ + 0.05)
        mk(0, 'paper').box(d0 + 0.45, d0 + 0.66, 1.42, 1.72, FZ + 0.02, FZ + 0.024)              # 門上的告示（字不畫）
        continue
    for (a, b) in ((x0, d0), (d1, x1)):                                                   # 玻璃隔間：鋁框、霧面腰帶
        if b - a < 0.05: continue
        mk(0, 'frame').box(a, b, 0.0, 0.08, fz0 + 0.04, fz1 - 0.04)
        vquad_z(mk(0, 'glass'), FZ, a, b, 0.08, 2.7, 1); vquad_z(mk(0, 'frost'), FZ + 0.012, a, b, 1.1, 1.38, 1)
        n = max(1, round((b - a) / 1.3))
        for i in range(n + 1):
            xm = a + (b - a) * i / n; mk(0, 'frame').box(max(a, xm - 0.025), min(b, xm + 0.025), 0.0, 2.7, FZ - 0.03, FZ + 0.03)
    vquad_z(mk(0, 'glass'), FZ, d0, d1, 2.43, 2.7, 1)                                     # 門上的玻璃氣窗
    mk(0, 'frame').box(x0, x1, 2.4, 2.45, FZ - 0.03, FZ + 0.03); mk(0, 'frame').box(x0, x1, 2.68, 2.72, FZ - 0.05, FZ + 0.05)
    mk(0, 'wall').box(x0, x1, 2.72, C0, fz0, fz1)                                         # 玻璃上面的牆
    mk(0, 'frame').box(d0, d0 + 0.05, 0.0, 2.4, FZ - 0.05, FZ + 0.05); mk(0, 'frame').box(d1 - 0.05, d1, 0.0, 2.4, FZ - 0.05, FZ + 0.05)
    # 拉門：推到門東邊的固定玻璃後面（房間那一側），門口是開的
    sx0, sx1 = d1 - 0.02, d1 + (d1 - d0) - 0.02; zz = FZ - 0.07
    vquad_z(mk(0, 'glass'), zz, sx0 + 0.04, sx1 - 0.04, 0.06, 2.36, 1)
    for (a, b) in ((sx0, sx0 + 0.04), (sx1 - 0.04, sx1)): mk(0, 'frame').box(a, b, 0.02, 2.4, zz - 0.02, zz + 0.02)
    mk(0, 'frame').box(sx0, sx1, 2.36, 2.4, zz - 0.02, zz + 0.02); mk(0, 'frame').box(sx0, sx1, 0.02, 0.06, zz - 0.02, zz + 0.02)
    mk(0, 'steel').box(sx0 + 0.06, sx0 + 0.09, 0.85, 1.35, zz - 0.045, zz - 0.02)
    mk(0, 'frame').box(d0 - 0.05, sx1 + 0.05, 2.4, 2.46, FZ - 0.1, FZ - 0.04)              # 拉門的上軌道
for px in J['partitions']: mk(0, 'wall').box(px - 0.1, px + 0.1, 0.0, C0, ZI0, fz1)

# ================= 樓梯（U 形雙跑）：A 跑往南、平台、B 跑往北；兩跑中間的牆、B 跑東側的木作牆、扶手、二樓的玻璃欄杆 =================
gran, nos = mk(0, 'granite'), mk(0, 'nosing')
for k in range(SA['risers']):
    za, top = SA['z0'] + k * TR, (k + 1) * RS
    vquad_z(gran, za, SA['x0'], SA['x1'], top - RS, top - 0.03, -1)                        # 踢面（朝北）
    gran.box(SA['x0'], SA['x1'], top - 0.03, top, za - 0.02, za + TR)                        # 踏面（往前凸 2 cm）
    nos.box(SA['x0'] + 0.06, SA['x1'] - 0.06, top, top + 0.003, za - 0.005, za + 0.035)        # 止滑條
gran.box(LD['x0'], FWC0, LD['y'] - 0.03, LD['y'], LD['z0'], ZI1)                            # 平台
for j in range(SB['risers']):
    zh, top = SB['z1'] - j * TR, LD['y'] + (j + 1) * RS
    vquad_z(gran, zh, SB['x0'], FWC0, top - RS, top - 0.03, 1)                               # 踢面（朝南）
    gran.box(SB['x0'], FWC0, top - 0.03, top, zh - TR, zh + 0.02)
    nos.box(SB['x0'] + 0.06, FWC0 - 0.06, top, top + 0.003, zh - 0.035, zh + 0.005)
mk(0, 'wall').box(SB['x0'], FWC1, 0.0, C0 + 0.02, SB['z0'] - 0.06, SB['z0'])               # B 跑北端（一樓大廳看得到的那一面）
nose_b = lambda z: LD['y'] + RS * (1 + (SB['z1'] - z) / TR)                                  # B 跑踏面前緣連線的高度
ztop = SB['z1'] - (SB['risers'] - 1) * TR                                                  # 最上面一階的前緣
prism_x(mk(0, 'wall'), [(WL['z0'], 0.0), (SA['z1'], 0.0), (SA['z1'], nose_b(SB['z1']) + 0.9), (ztop, Y1 + 0.9), (WL['z0'], Y1 + 0.9)], MW['x0'], MW['x1'])   # 兩跑中間的牆（頂＝B 跑的扶手高度）
prism_x(mk(0, 'walnut'), [(WL['z0'], Y1 + 0.9), (ztop, Y1 + 0.9), (SA['z1'], nose_b(SB['z1']) + 0.9), (SA['z1'], nose_b(SB['z1']) + 0.95), (ztop, Y1 + 0.95), (WL['z0'], Y1 + 0.95)], MW['x0'] - 0.02, MW['x1'] + 0.02)   # 牆頂的木扶手
mk(0, 'wall').box(FWC0, FWC1, 0.0, Y1, SB['z0'] - 0.06, ZI1)                                # B 跑東側的牆（西面是 B 跑那一側）
mk(0, 'slab').box(FWC0, WL['x1'], Y1 - ST, Y1 - 0.012, SB['z0'] - 0.06, ZI1)             # 牆頂到二樓樓板邊的縫
fwb = mk(0, 'black'); fws = mk(0, 'walnut')
fws.box(FWC1, FWX, 0.1, C0, SB['z0'] - 0.06, SB['z0'] + 0.02)                                 # 北端的收邊
fwb.box(FWC1, FWC1 + 0.012, 0.0, C0, SB['z0'] - 0.06, ZI1)
z = SB['z0'] + 0.02
while z < ZI1 - 0.03:                                                                       # 東面：直條木格柵（大廳看到的那一面）
    fws.box(FWC1 + 0.012, FWX, 0.1, C0, z, min(z + 0.045, ZI1 - 0.005)); z += 0.065
mk(0, 'nosing').box(FWC1, FWX + 0.004, 0.0, 0.1, SB['z0'] - 0.06, ZI1)
# 扶手（不鏽鋼圓管＋托架）：A 跑兩側、平台、B 跑兩側
nose_a = lambda z: RS * (1 + (z - SA['z0']) / TR)
za_end = SA['z0'] + (SA['risers'] - 1) * TR
def wall_rail(m, x, pts, side):
    rail(m, [(x, y, z) for (z, y) in pts])
    for (za_, ya), (zb_, yb) in zip(pts, pts[1:]):
        n = max(1, int(abs(zb_ - za_) / 1.2))
        for i in range(n + 1):
            zz = za_ + (zb_ - za_) * i / n; yy = ya + (yb - ya) * i / n
            m.box(min(x, x - side * 0.06), max(x, x - side * 0.06), yy - 0.012, yy + 0.012, zz - 0.01, zz + 0.01)
stl = mk(0, 'steel')
pa = [(SA['z0'] - 0.3, RS + 0.9), (SA['z0'], RS + 0.9), (za_end, LD['y'] + 0.9), (ZI1 - 0.08, LD['y'] + 0.9)]
wall_rail(stl, XI0 + 0.06, pa, 1)
wall_rail(stl, MW['x0'] - 0.06, pa[:3] + [(SA['z1'] - 0.05, LD['y'] + 0.9)], -1)
rail(stl, [(XI0 + 0.06, LD['y'] + 0.9, ZI1 - 0.08), (FWC0 - 0.06, LD['y'] + 0.9, ZI1 - 0.08)])
for xx in (-6.0, -4.6): stl.box(xx - 0.01, xx + 0.01, LD['y'] + 0.888, LD['y'] + 0.912, ZI1 - 0.08, ZI1)
zb_end = SB['z1'] - (3.2 - nose_b(SB['z1'])) / RS * TR                                      # B 跑東側的牆扶手：牆頂（4.2 m）比扶手高的那一段；再上去是二樓的玻璃欄杆
pb = [(ZI1 - 0.08, LD['y'] + 0.9), (SB['z1'] + 0.25, LD['y'] + 0.9), (SB['z1'], nose_b(SB['z1']) + 0.9), (zb_end, nose_b(zb_end) + 0.9)]
wall_rail(stl, FWC0 - 0.06, pb, -1)
def glass_rail(lv, pts):
    """二樓樓板邊的玻璃欄杆：玻璃＋不鏽鋼扶手＋底座（沿 x 或 z 的直線）"""
    (xa, za), (xb, zb) = pts; y = Y1
    q = [(xa, y + 0.06, za), (xb, y + 0.06, zb), (xb, y + 1.0, zb), (xa, y + 1.0, za)]; mk(lv, 'glass').quad(q)
    mk(lv, 'steel').cyl((xa, y + 1.04, za), (xb, y + 1.04, zb), 0.025, seg=10)
    if abs(xb - xa) > abs(zb - za): mk(lv, 'frame').box(min(xa, xb), max(xa, xb), y, y + 0.08, za - 0.03, za + 0.03)
    else: mk(lv, 'frame').box(xa - 0.03, xa + 0.03, y, y + 0.08, min(za, zb), max(za, zb))
    for t in (0.0, 1.0): x_, z_ = xa + (xb - xa) * t, za + (zb - za) * t; mk(lv, 'steel').box(x_ - 0.02, x_ + 0.02, y, y + 1.04, z_ - 0.02, z_ + 0.02)
glass_rail(1, [(XI0 + 0.02, WL['z0'] - 0.03), (MW['x0'], WL['z0'] - 0.03)])
glass_rail(1, [(S['rail2X'], SB['z0']), (S['rail2X'], ZI1 - 0.02)])

# ================= 書架、書 =================
REG = ATL['regions']; AW, AH = ATL['size']; PG = ATL['pages']; SWT = ATL['swatch']
def uvr(px, inset=1.0):
    x0, y0, x1, y1 = px; return ((x0 + inset) / AW, 1 - (y1 - inset) / AH, (x1 - inset) / AW, 1 - (y0 + inset) / AH)
LM = 0.92                                                                                   # 書模組的長度（每格照開間寬度縮放）
def book_module(name, picks, seed, hrange, wrange, drange, fill=1.0, bookend=False, lean=False):
    """一層、一個開間的書：沿本地 x 排，書背在 z=0 朝 +z，往 −z 是書的深度；只做書背、頂面、露出來的側面"""
    rnd = random.Random(seed); m = UM(name, M['book']); books = []; x = -LM / 2 + 0.006; end = -LM / 2 + LM * fill
    run = None
    while x < end - 0.015:
        if rnd.random() < 0.035: x += rnd.uniform(0.02, 0.07); continue
        reg = picks(rnd); w = rnd.uniform(*wrange); h = rnd.uniform(*hrange); d = rnd.uniform(*drange)
        if x + w > end: break
        books.append([x, x + w, h, d, reg]); x += w + rnd.uniform(0.0, 0.0025)
    pg = uvr(PG, 2.0); st = uvr(SWT['steel'], 2.0)
    for i, (xa, xb, h, d, reg) in enumerate(books):
        u0, v0, u1, v1 = uvr(reg, 1.0)
        m.face([(xa, 0, 0), (xb, 0, 0), (xb, h, 0), (xa, h, 0)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])                                 # 書背
        m.face([(xa, h, 0), (xb, h, 0), (xb, h, -d), (xa, h, -d)], [(pg[0], pg[1]), (pg[2], pg[1]), (pg[2], pg[3]), (pg[0], pg[3])])        # 書口
        us = (u0, u0 + 1.5 / AW)
        Lb = books[i - 1] if i > 0 else None; Rb = books[i + 1] if i + 1 < len(books) else None
        if Lb is None or xa - Lb[1] > 0.002 or h > Lb[2] + 0.003 or d > Lb[3] + 0.003:
            m.face([(xa, 0, -d), (xa, 0, 0), (xa, h, 0), (xa, h, -d)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
        if Rb is None or Rb[0] - xb > 0.002 or h > Rb[2] + 0.003 or d > Rb[3] + 0.003:
            m.face([(xb, 0, 0), (xb, 0, -d), (xb, h, -d), (xb, h, 0)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
    if bookend and books:                                                                   # 書擋（鐵灰 L 形）
        bx = books[-1][1] + 0.002; sv = [(st[0], st[1]), (st[2], st[1]), (st[2], st[3]), (st[0], st[3])]
        m.face([(bx, 0.002, -0.17), (bx + 0.13, 0.002, -0.17), (bx + 0.13, 0.002, -0.03), (bx, 0.002, -0.03)][::-1], sv)
        for xx, sgn in ((bx, -1), (bx + 0.002, 1)):
            p = [(xx, 0.0, -0.03), (xx, 0.0, -0.17), (xx, 0.19, -0.17), (xx, 0.19, -0.03)]
            m.face(p if sgn > 0 else [p[1], p[0], p[3], p[2]], sv)
    m.bm.normal_update()
    me = bpy.data.meshes.new(name); m.bm.to_mesh(me); m.bm.free(); me.materials.append(M['book'])
    return me
pick = lambda keys, wts: (lambda rnd: rnd.choice(REG[rnd.choices(keys, wts)[0]]))
MODS = {
    'law': [book_module(f'll_bookmod_law{i}', pick(['law', 'old'], [85, 15]), 100 + i, (0.2, 0.265), (0.024, 0.056), (0.15, 0.22),
                        fill=1.0 if i < 6 else 0.72 + 0.04 * i - 0.24, bookend=i >= 6) for i in range(8)],
    'foreign': [book_module(f'll_bookmod_foreign{i}', pick(['foreign', 'old', 'law'], [70, 20, 10]), 200 + i, (0.21, 0.27), (0.025, 0.06), (0.16, 0.22),
                            fill=1.0 if i < 2 else 0.8, bookend=i >= 2) for i in range(3)],
    'thesis': [book_module(f'll_bookmod_thesis{i}', pick(['thesis'], [1]), 300 + i, (0.272, 0.284), (0.011, 0.026), (0.2, 0.215)) for i in range(3)],
    'journal': [book_module(f'll_bookmod_journal{j}', (lambda j: (lambda rnd: REG['journal'][j * 5 + rnd.randrange(5)]))(j), 400 + j, (0.255, 0.268), (0.034, 0.05), (0.18, 0.2)) for j in range(5)],
}
BOOKS_G = [B.group('L0_books', G[0]), B.group('L1_books', G[1])]
NBOOK = {'n': 0}
def place_books(lv, cat, cx, y, cz, yaw, bw, rnd):
    me = rnd.choice(MODS[cat]); ob = bpy.data.objects.new(f'L{lv}_bk_{NBOOK["n"]}', me); B.scene().collection.objects.link(ob)
    ob.parent = BOOKS_G[lv]; ob.location = g2b(cx, y, cz); ob.rotation_euler = (0, 0, yaw); ob.scale = (bw / LM, 1.0, 1.0); NBOOK['n'] += 1
FACE_YAW = {'E': math.pi / 2, 'W': -math.pi / 2, 'S': 0.0, 'N': math.pi}
def shelf_levels(h, levels, base=0.08):
    sp = (h - 0.03 - base) / levels; return [base + k * sp for k in range(levels)], sp
def bays(a0, a1, target=0.95):
    n = max(1, round((a1 - a0) / target)); return [a0 + (a1 - a0) * i / n for i in range(n + 1)]

def range_shelf(s, rnd):
    """雙面書架（中間一道鐵板）：鐵灰色的柱、層板、底座，兩端胡桃木端板＋頂板"""
    lv = s['lv']; y = Y1 if lv else 0.0; x, z0, z1, h = s['x'], s['z0'], s['z1'], s['h']; hd = 0.25
    sh, ep = mk(lv, 'shelf'), mk(lv, 'endpanel')
    sh.box(x - hd + 0.03, x + hd - 0.03, y, y + 0.08, z0, z1)                                # 底座（踢腳退縮 3 cm）
    sh.box(x - 0.006, x + 0.006, y + 0.08, y + h - 0.03, z0, z1)                             # 中間的鐵板
    ys, sp = shelf_levels(h, s['levels'])
    for yy in ys[1:]: sh.box(x - hd + 0.004, x + hd - 0.004, y + yy - 0.02, y + yy, z0, z1)   # 層板比直隔板退 4 mm（原本正面同一個平面，交叉的地方會閃，BUG-COPLANAR-DEV）
    bz = bays(z0, z1)
    for zz in bz[1:-1]: sh.box(x - hd, x + hd, y + 0.08, y + h - 0.03, zz - 0.0125, zz + 0.0125)
    ep.box(x - hd - 0.015, x + hd + 0.015, y + h - 0.035, y + h + 0.01, z0 - 0.025, z1 + 0.025)  # 頂板
    for zz, sg in ((z0, -1), (z1, 1)):
        ep.box(x - hd - 0.015, x + hd + 0.015, y, y + h - 0.035, min(zz, zz + sg * 0.025), max(zz, zz + sg * 0.025))   # 端板
        mk(lv, 'black').box(x - 0.09, x + 0.09, y + 1.38, y + 1.5, min(zz + sg * 0.025, zz + sg * 0.03), max(zz + sg * 0.025, zz + sg * 0.03))   # 端板上的索書號卡座
        mk(lv, 'paper').box(x - 0.08, x + 0.08, y + 1.39, y + 1.49, min(zz + sg * 0.03, zz + sg * 0.032), max(zz + sg * 0.03, zz + sg * 0.032))
    for a, b in zip(bz, bz[1:]):
        bw = b - a - 0.03; cz = (a + b) / 2
        for side, yaw in ((-1, -math.pi / 2), (1, math.pi / 2)):
            for yy in ys: place_books(lv, s['books'] if s['books'] in MODS else 'law', x + side * (hd - 0.008), y + yy, cz, yaw, bw, rnd)

def wall_shelf(s, rnd, z0_clip=None):
    """靠牆的單面書架：背板貼牆、柱、層板、底座、兩端端板＋頂板；書面向 face"""
    lv = s['lv']; y = Y1 if lv else 0.0; h = s['h']; face = s['face']; yaw = FACE_YAW[face]
    x0, x1, z0, z1 = s['x0'], s['x1'], s['z0'], s['z1']
    if z0_clip is not None: z0 = max(z0, z0_clip)
    along_x = face in 'NS'; a0, a1 = (x0, x1) if along_x else (z0, z1); d0, d1 = (z0, z1) if along_x else (x0, x1)
    front = {'E': x1, 'W': x0, 'S': z1, 'N': z0}[face]; back = {'E': x0, 'W': x1, 'S': z0, 'N': z1}[face]; sg = 1 if face in 'ES' else -1
    sh, ep = mk(lv, 'shelf'), mk(lv, 'endpanel')
    def B_(a_lo, a_hi, y_lo, y_hi, f_lo, f_hi, m):
        """沿牆 a、從背面往前 f（0＝背板、正＝往前）"""
        p_lo, p_hi = sorted((back + sg * f_lo, back + sg * f_hi))
        if along_x: m.box(a_lo, a_hi, y_lo, y_hi, p_lo, p_hi)
        else: m.box(p_lo, p_hi, y_lo, y_hi, a_lo, a_hi)
    dep = abs(front - back)
    B_(a0, a1, y, y + 0.08, 0.0, dep - 0.03, sh); B_(a0, a1, y + 0.08, y + h - 0.03, 0.013, 0.025, sh)   # 背板放在踢腳板前面（原本和踢腳板同厚、正面同一個平面）
    ys, sp = shelf_levels(h, s['levels'])
    for yy in ys[1:]: B_(a0, a1, y + yy - 0.02, y + yy, 0.025, dep - 0.004, sh)
    bz = bays(a0, a1)
    for aa in bz[1:-1]: B_(aa - 0.0125, aa + 0.0125, y + 0.08, y + h - 0.03, 0.025, dep, sh)
    B_(a0 - 0.02, a1 + 0.02, y + h - 0.035, y + h + 0.01, 0.0, dep + 0.015, ep)
    for aa, sg2 in ((a0, -1), (a1, 1)): B_(min(aa, aa + sg2 * 0.025), max(aa, aa + sg2 * 0.025), y, y + h - 0.035, 0.0, dep + 0.015, ep)
    for a, b in zip(bz, bz[1:]):
        bw = b - a - 0.03; c = (a + b) / 2; fp = front - sg * 0.008
        for yy in ys:
            if along_x: place_books(lv, s['books'], c, y + yy, fp, yaw, bw, rnd)
            else: place_books(lv, s['books'], fp, y + yy, c, yaw, bw, rnd)
    return a0, a1

CV = ATL['covers']; CWH = ATL['covers_size']
def cuv(i, inset=1.0):
    x0, y0, x1, y1 = CV[i]; return ((x0 + inset) / CWH[0], 1 - (y1 - inset) / CWH[1], (x1 - inset) / CWH[0], 1 - (y0 + inset) / CWH[1])
def cover_quad(m, f, lx0, lx1, ly0, ly1, lz, ci):
    u0, v0, u1, v1 = cuv(ci); m.face([f(lx0, ly0, lz), f(lx1, ly0, lz), f(lx1, ly1, lz), f(lx0, ly1, lz)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
def display_rack(s, rnd):
    """現期期刊架：每層一塊往後斜的展示板（下緣有擋條）、板上擺當期期刊（封面朝外）；鐵灰色骨架、胡桃木端板"""
    lv = s['lv']; y = Y1 if lv else 0.0; h = s['h']; face = s['face']; yaw = FACE_YAW[face]
    x0, x1, z0, z1 = s['x0'], s['x1'], s['z0'], s['z1']; along_x = face in 'NS'
    a0, a1 = (x0, x1) if along_x else (z0, z1); front = {'E': x1, 'W': x0, 'S': z1, 'N': z0}[face]; back = {'E': x0, 'W': x1, 'S': z0, 'N': z1}[face]
    dep = abs(front - back); sh, ep, cv = mk(lv, 'shelf'), mk(lv, 'endpanel'), um(lv, 'cover')
    for bi, (a, b) in enumerate(zip(bays(a0, a1, 0.9), bays(a0, a1, 0.9)[1:])):
        c = (a + b) / 2; bw = b - a
        bc = (c, back) if along_x else (back, c)                                            # 背面中點
        F0 = xf(bc[0] if along_x else back, y, bc[1] if along_x else c, yaw)                 # 本地：x 沿牆、z 從背面往前
        tbox(sh, F0, -bw / 2, bw / 2, 0.0, h - 0.03, 0.0, 0.012); tbox(sh, F0, -bw / 2, bw / 2, 0.0, 0.08, 0.0, dep - 0.04)
        for sx in ((-1, 1) if bi == 0 else (1,)): tbox(sh, F0, sx * bw / 2 - 0.0125, sx * bw / 2 + 0.0125, 0.0, h - 0.03, 0.0, dep)   # 相鄰兩格共用一片側板（原本各放一片、完全重疊）
        for k in range(4):
            yb = 0.12 + k * (h - 0.2) / 4; tilt = -0.32                                       # 板子上緣往後傾
            Fk = xf(*F0(0, yb, dep - 0.12), yaw=yaw, pitch=tilt)
            tbox(sh, Fk, -bw / 2 + 0.02, bw / 2 - 0.02, 0.0, 0.34, -0.012, 0.0)
            tbox(sh, Fk, -bw / 2 + 0.02, bw / 2 - 0.02, -0.005, 0.03, 0.0, 0.03)              # 擋條
            nm = 3
            for i in range(nm):
                lx = -bw / 2 + 0.045 + i * (bw - 0.09) / nm; ci = rnd.randrange(8)
                cover_quad(cv, Fk, lx + 0.01, lx + 0.01 + 0.205, 0.02, 0.02 + 0.28, 0.006, ci)
        tbox(ep, F0, -bw / 2, bw / 2, h - 0.035, h + 0.01, 0.0, dep + 0.015)
    for aa, sg2 in ((a0, -1), (a1, 1)):
        p0, p1 = sorted((back, front + (0.015 if front > back else -0.015)))
        if along_x: ep.box(min(aa, aa + sg2 * 0.025), max(aa, aa + sg2 * 0.025), y, y + h - 0.035, p0, p1)
        else: ep.box(p0, p1, y, y + h - 0.035, min(aa, aa + sg2 * 0.025), max(aa, aa + sg2 * 0.025))

def shelf_sign_holder(s):
    """書架標示牌的背板（字是遊戲畫的平面，位置照 lawlib3d.js：書架頂上 0.16 m；range 在南端 z1+0.03、朝南；靠牆／期刊架在正面前 0.02 m）。
    背板在字的平面後面 0.5～2.5 cm，下緣坐在書架頂板上——從背面看是一塊深色的牌子，不是浮在空中的字"""
    if not s.get('sign'): return
    lv = s['lv']; y = Y1 if lv else 0.0; h = s['h']
    sw = s.get('signW') or max(1.0, len(s['sign']) * 0.17); sh = (sw / 4) if s.get('signW') else 0.22; cy = y + h + 0.16
    yb, yt = y + h + 0.0, cy + sh / 2 + 0.02; m = mk(lv, 'signback')
    if s['kind'] == 'range':
        m.box(s['x'] - sw / 2 - 0.02, s['x'] + sw / 2 + 0.02, yb, yt, s['z1'] + 0.005, s['z1'] + 0.025); return
    f = s['face']; off = ((s['x1'] - s['x0']) if f in 'EW' else (s['z1'] - s['z0'])) / 2 + 0.02; cx, cz = (s['x0'] + s['x1']) / 2, (s['z0'] + s['z1']) / 2
    if f in 'EW':
        sg = 1 if f == 'E' else -1; a_, b_ = sorted((cx + sg * (off - 0.025), cx + sg * (off - 0.005))); m.box(a_, b_, yb, yt, cz - sw / 2 - 0.02, cz + sw / 2 + 0.02)
    else:
        sg = 1 if f == 'S' else -1; a_, b_ = sorted((cz + sg * (off - 0.025), cz + sg * (off - 0.005))); m.box(cx - sw / 2 - 0.02, cx + sw / 2 + 0.02, yb, yt, a_, b_)

rnd = random.Random(7)
JN = next(s for s in J['shelves'] if s['id'] == 'jn')
for s in J['shelves']:
    if s['kind'] == 'range': range_shelf(s, rnd)
    elif s['kind'] == 'wall': wall_shelf(s, rnd, z0_clip=(JN['z1'] if s['id'] == 'jw' else None))
    elif s['kind'] == 'display': display_rack(s, rnd)
    shelf_sign_holder(s)

# ================= 桌子、椅子 =================
def seats_of():
    out = []
    for tb in J['tables']:
        for i in range(tb['n']):
            x = tb['x'] - tb['w'] / 2 + tb['w'] * (i + 0.5) / tb['n']
            for sgn in (-1, 1): out.append({'x': x, 'z': tb['z'] + sgn * (tb['d'] / 2 + 0.35), 'yaw': 0.0 if sgn < 0 else math.pi, 'lv': tb['lv'], 'kind': 'table'})
    for rm in J['rooms']:
        if rm['kind'] != 'discussion': continue
        T_ = rm['table']
        for z in rm['seatZ']:
            for sgn in (-1, 1): out.append({'x': T_['x'] + sgn * (T_['w'] / 2 + 0.35), 'z': z, 'yaw': math.pi / 2 if sgn < 0 else -math.pi / 2, 'lv': 0, 'kind': 'disc'})
    C = J['carrels']; cw = (C['x1'] - C['x0']) / C['n']
    for i in range(C['n']): out.append({'x': C['x0'] + cw * (i + 0.5), 'z': C['chairZ'], 'yaw': 0.0, 'lv': C['lv'], 'kind': 'carrel'})
    return out
SEATS = seats_of()

def wood_chair(lv, x, z, yaw):
    """閱覽椅：實木框、坐墊（灰藍布）、微彎的靠背；坐面高 0.47 m（人物坐下的高度和遊戲的椅子一樣），+z 是前面"""
    y = Y1 if lv else 0.0; F = xf(x, y, z, yaw); w = mk(lv, 'chairwood'); f = mk(lv, 'seat')
    for sx in (-1, 1):
        tbox(w, F, sx * 0.2 - 0.018, sx * 0.2 + 0.018, 0.0, 0.43, 0.15, 0.186)               # 前腳
        tbox(w, F, sx * 0.2 - 0.018, sx * 0.2 + 0.018, 0.0, 0.88, -0.215, -0.18)              # 後腳＋背柱
    tbox(w, F, -0.22, 0.22, 0.4, 0.445, -0.2, 0.2); tbox(f, F, -0.205, 0.205, 0.445, 0.47, -0.185, 0.19)
    for sx in (-1, 1): tbox(w, F, sx * 0.2 - 0.012, sx * 0.2 + 0.012, 0.14, 0.17, -0.18, 0.15)   # 側撐
    Fb = xf(*F(0, 0.62, -0.2), yaw=yaw, pitch=-0.1)
    for (a, b, c) in ((-0.2, -0.07, 0.012), (-0.07, 0.07, 0.022), (0.07, 0.2, 0.012)):        # 靠背（中間往後凹）
        tbox(w, Fb, a, b, 0.0, 0.24, -0.01 - c, 0.012 - c)
def task_chair(lv, x, z, yaw, mat='fabric'):
    """會議椅：鍍鉻弓形腳、布面坐墊與靠背"""
    y = Y1 if lv else 0.0; F = xf(x, y, z, yaw); st = mk(lv, 'steel'); f = mk(lv, mat)
    for sx in (-1, 1):
        a, b = F(sx * 0.21, 0.01, 0.22), F(sx * 0.21, 0.01, -0.2); st.cyl(a, b, 0.011, seg=6)
        st.cyl(a, F(sx * 0.21, 0.44, 0.17), 0.011, seg=6); st.cyl(b, F(sx * 0.21, 0.44, -0.17), 0.011, seg=6)
    tbox(f, F, -0.23, 0.23, 0.42, 0.48, -0.21, 0.22)
    Fb = xf(*F(0, 0.5, -0.22), yaw=yaw, pitch=-0.14); tbox(f, Fb, -0.22, 0.22, 0.0, 0.42, -0.05, 0.0)
for st_ in SEATS:
    (task_chair if st_['kind'] == 'disc' else wood_chair)(st_['lv'], st_['x'], st_['z'], st_['yaw'])

def banker_lamp(lv, x, y, z):
    """綠色玻璃燈罩的閱覽桌燈（長的燈罩沿 x，兩邊的座位共用一盞）"""
    br = mk(lv, 'brass'); br.cyl((x, y, z), (x, y + 0.015, z), 0.075, seg=16); br.cyl((x, y + 0.015, z), (x, y + 0.33, z), 0.011, seg=8)
    br.cyl((x - 0.04, y + 0.33, z), (x + 0.04, y + 0.33, z), 0.008, seg=6)
    sh = mk(lv, 'shade'); n = 10; rr = 0.075; L_ = 0.26; cy = y + 0.36
    for i in range(n):                                                                       # 半圓柱燈罩（開口朝下）
        a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
        p = lambda xx, a: (xx, cy + rr * math.sin(a) * 0.8, z + rr * math.cos(a))
        sh.quad([p(x - L_ / 2, a0), p(x + L_ / 2, a0), p(x + L_ / 2, a1), p(x - L_ / 2, a1)])
    for xx, sg in ((x - L_ / 2, -1), (x + L_ / 2, 1)):
        pts = [(xx, cy + rr * math.sin(math.pi * i / n) * 0.8, z + rr * math.cos(math.pi * i / n)) for i in range(n + 1)]
        sh.bm.faces.new([sh.bm.verts.new(g2b(*p_)) for p_ in (pts if sg > 0 else pts[::-1])])
    hquad(mk(lv, 'glow'), x - L_ / 2 + 0.01, x + L_ / 2 - 0.01, z - rr + 0.01, z + rr - 0.01, cy + 0.005)
for tb in J['tables']:
    lv = tb['lv']; y = Y1 if lv else 0.0; x, z, w, d = tb['x'], tb['z'], tb['w'], tb['d']
    tp, wd = mk(lv, 'top'), mk(lv, 'walnut')
    tp.box(x - w / 2, x + w / 2, y + 0.73, y + 0.77, z - d / 2, z + d / 2)
    wd.box(x - w / 2 + 0.05, x + w / 2 - 0.05, y + 0.66, y + 0.73, z - d / 2 + 0.05, z - d / 2 + 0.075); wd.box(x - w / 2 + 0.05, x + w / 2 - 0.05, y + 0.66, y + 0.73, z + d / 2 - 0.075, z + d / 2 - 0.05)
    if tb.get('lamps'):                                                                     # 一樓的長閱覽桌：兩端板狀桌腳＋中間一對、桌面中線的矮木條（插座）、綠色桌燈
        for xx in (x - w / 2 + 0.12, x + w / 2 - 0.12): wd.box(xx - 0.035, xx + 0.035, y, y + 0.73, z - d / 2 + 0.1, z + d / 2 - 0.1)
        wd.box(x - 0.035, x + 0.035, y, y + 0.73, z - d / 2 + 0.1, z + d / 2 - 0.1)
        wd.box(x - w / 2 + 0.12, x + w / 2 - 0.12, y + 0.12, y + 0.2, z - 0.03, z + 0.03)
        wd.box(x - w / 2 + 0.15, x + w / 2 - 0.15, y + 0.77, y + 0.83, z - 0.05, z + 0.05)
        for i in range(tb['n']):
            sx = x - w / 2 + w * (i + 0.5) / tb['n']
            banker_lamp(lv, sx, y + 0.83, z)
            for sg in (-1, 1): mk(lv, 'black').box(sx + 0.25, sx + 0.33, y + 0.785, y + 0.815, z + sg * 0.05, z + sg * 0.052)   # 插座面板
    else:
        for (sx, sz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): wd.box(x + sx * (w / 2 - 0.07) - 0.03, x + sx * (w / 2 - 0.07) + 0.03, y, y + 0.73, z + sz * (d / 2 - 0.07) - 0.03, z + sz * (d / 2 - 0.07) + 0.03)
# 討論室的桌子（淺灰美耐板、鍍鉻腳、中間一個電源盒）
for rm in J['rooms']:
    if not rm.get('table'): continue
    T_ = rm['table']; x, z, w, d = T_['x'], T_['z'], T_['w'], T_['d']
    mk(0, 'laminate').box(x - w / 2, x + w / 2, 0.72, 0.75, z - d / 2, z + d / 2)
    for (sx, sz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): mk(0, 'steel').cyl((x + sx * (w / 2 - 0.08), 0.0, z + sz * (d / 2 - 0.1)), (x + sx * (w / 2 - 0.08), 0.72, z + sz * (d / 2 - 0.1)), 0.022, seg=8)
    mk(0, 'black').box(x - 0.09, x + 0.09, 0.75, 0.77, z - 0.06, z + 0.06)
# 閱覽隔間：桌面、隔板、桌上的插座
C = J['carrels']; cw = (C['x1'] - C['x0']) / C['n']
for i in range(C['n']):
    cx = C['x0'] + cw * (i + 0.5); mk(0, 'top').box(cx - cw / 2 + 0.02, cx + cw / 2 - 0.02, 0.72, 0.75, C['z0'], C['z1'] - 0.02)
    mk(0, 'black').box(cx - 0.12, cx + 0.12, 0.75, 0.78, C['z1'] - 0.08, C['z1'] - 0.03)
for i in range(C['n'] + 1):
    xx = C['x0'] + cw * i; mk(0, 'walnut').box(xx - 0.0125, xx + 0.0125, 0.0, 1.15, C['z0'] - 0.02, C['z1'] - 0.02)

# ================= 櫃台、館員工作區 =================
CT, SAR = J['counter'], J['staffArea']
cx0, cx1, cz0, cz1 = CT['x0'], CT['x1'], CT['z0'], CT['z1']
wd = mk(0, 'walnut')
wd.box(cx0, cx1, 0.08, 1.05, cz1 - 0.05, cz1); mk(0, 'nosing').box(cx0 + 0.04, cx1, 0.0, 0.08, cz1 - 0.09, cz1 - 0.05)   # 前面板（讀者那一側）
for i in range(1, int((cx1 - cx0) / 0.6)): xx = cx0 + i * 0.6; mk(0, 'black').box(xx - 0.004, xx + 0.004, 0.1, 1.03, cz1 - 0.002, cz1 + 0.001)   # 面板分割線
wd.box(cx0, cx0 + 0.05, 0.0, 1.05, cz0, cz1)                                                 # 西端
mk(0, 'granite').box(cx0 - 0.03, cx1, 1.05, 1.09, cz1 - 0.32, cz1 + 0.06)                     # 讀者那一側的花崗石檯面
wd.box(cx0 + 0.05, cx1, 0.74, 0.77, cz0, cz1 - 0.32); wd.box(cx0 + 0.05, cx1, 0.77, 1.05, cz1 - 0.34, cz1 - 0.3)   # 館員的工作檯面、隔板
mk(0, 'brass').box(CT['returnX0'] + 0.22, CT['returnX0'] + 0.68, 0.77, 0.93, cz1, cz1 + 0.003)     # 還書口
mk(0, 'black').box(CT['returnX0'] + 0.25, CT['returnX0'] + 0.65, 0.8, 0.9, cz1 + 0.003, cz1 + 0.006)
for mx in (cx0 + 1.4, cx0 + 2.6):                                                            # 螢幕（朝館員）、鍵盤、條碼掃描器
    F = xf(mx, 0.77, cz0 + 0.25, math.pi); bk = mk(0, 'black')
    tbox(bk, F, -0.04, 0.04, 0.0, 0.18, -0.03, 0.03); tbox(bk, F, -0.12, 0.12, 0.0, 0.015, -0.08, 0.06)
    tbox(bk, F, -0.27, 0.27, 0.16, 0.5, -0.02, 0.02); tbox(mk(0, 'screen'), F, -0.25, 0.25, 0.18, 0.48, 0.02, 0.025)
    tbox(bk, xf(mx, 0.77, cz0 + 0.12, 0.0), -0.22, 0.22, 0.0, 0.02, -0.07, 0.07)
mk(0, 'black').box(cx0 + 2.0, cx0 + 2.1, 1.09, 1.2, cz1 - 0.2, cz1 - 0.1)
mk(0, 'grey').box(CT['returnX0'] + 0.1, cx1 - 0.05, 0.0, 0.62, cz0 + 0.05, cz1 - 0.4)           # 還書箱（櫃台裡面）
# 館員工作區：分類書架（南面朝櫃台）、西側矮隔板、辦公椅、書車
sa = {'lv': 0, 'kind': 'wall', 'x0': SAR['x0'] + 0.2, 'x1': SAR['x1'], 'z0': SAR['sortZ0'], 'z1': SAR['sortZ1'], 'face': 'S', 'levels': 3, 'h': 1.2, 'books': 'law'}
wall_shelf(sa, rnd)
mk(0, 'walnut').box(SAR['x0'], SAR['x0'] + 0.2, 0.0, 1.1, SAR['sortZ0'], SAR['z1']); mk(0, 'granite').box(SAR['x0'] - 0.02, SAR['x0'] + 0.22, 1.1, 1.13, SAR['sortZ0'], SAR['z1'])
for (x, z, yaw) in ((3.7, 3.35, 0.3), (6.3, 3.3, -0.2)):
    F = xf(x, 0.0, z, yaw); bk, f = mk(0, 'black'), mk(0, 'fabric')
    for k in range(5):
        a = k * 2 * math.pi / 5; bk.cyl(F(0, 0.06, 0), F(0.28 * math.cos(a), 0.04, 0.28 * math.sin(a)), 0.015, seg=6)
    bk.cyl(F(0, 0.06, 0), F(0, 0.42, 0), 0.025, seg=8); tbox(f, F, -0.24, 0.24, 0.42, 0.5, -0.22, 0.22)
    tbox(f, xf(*F(0, 0.52, -0.24), yaw=yaw, pitch=-0.12), -0.22, 0.22, 0.0, 0.5, -0.06, 0.0)
def book_cart(lv, x, z, yaw, rnd):
    """書車：鐵灰色、三層往中間斜的層板、四個輪子；兩面都放書（書模組）"""
    y = Y1 if lv else 0.0; F = xf(x, y, z, yaw); g = mk(lv, 'shelf'); bk = mk(lv, 'black')
    for sx in (-1, 1):
        for sz in (-1, 1): bk.cyl(F(sx * 0.4, 0.0, sz * 0.18), F(sx * 0.4, 0.08, sz * 0.18), 0.04, seg=8); g.cyl(F(sx * 0.42, 0.08, sz * 0.2), F(sx * 0.42, 0.98, sz * 0.2), 0.012, seg=6)
    for yy in (0.12, 0.45, 0.78):
        for sz in (-1, 1): tbox(g, xf(*F(0, yy, sz * 0.11), yaw=yaw, pitch=sz * 0.12), -0.43, 0.43, -0.01, 0.0, -0.11, 0.11)
        for sz in (-1, 1):
            p = F(0, yy + 0.01, sz * 0.2); place_books(lv, 'law', p[0], p[1], p[2], yaw + (0 if sz > 0 else math.pi), 0.82, rnd)
    g.cyl(F(-0.44, 1.0, -0.2), F(-0.44, 1.0, 0.2), 0.015, seg=6)
book_cart(0, 6.55, 3.05, math.pi / 2 + 0.1, rnd)

# ================= 入口的防盜感應門柱 =================
for (x, z) in J['gates']:                                                                  # 半透明的壓克力感應板＋鋁框、底座、頂上的燈條
    mk(0, 'black').box(x - 0.07, x + 0.07, 0.0, 0.06, z - 0.28, z + 0.28)
    vquad_x(mk(0, 'frost'), x, z - 0.24, z + 0.24, 0.06, 1.5, 1)
    mk(0, 'grey').box(x - 0.03, x + 0.03, 0.06, 1.5, z - 0.27, z - 0.24); mk(0, 'grey').box(x - 0.03, x + 0.03, 0.06, 1.5, z + 0.24, z + 0.27)
    mk(0, 'grey').box(x - 0.03, x + 0.03, 0.06, 0.16, z - 0.24, z + 0.24); mk(0, 'grey').box(x - 0.03, x + 0.03, 1.44, 1.5, z - 0.24, z + 0.24)
    mk(0, 'ledblue').box(x - 0.035, x + 0.035, 1.5, 1.53, z - 0.27, z + 0.27)

# ================= 房間裡：討論室（白板、牆上的螢幕）、影印室（兩台影印機、加值機、紙箱）=================
for rm in J['rooms']:
    if rm['kind'] == 'discussion':
        # 白板照配置（LAWWW 20301c3：側牆、face＝白板朝哪個方向，寬 w、中心高 1.5、高 1.0）；look 文字說的「牆上一台螢幕」放在對面的牆
        wb = next((f for f in J['furniture'] if f['type'] == 'whiteboard' and f.get('room') == rm['id']), None)
        if wb is None: continue
        sg = 1 if wb.get('face', 'E') == 'E' else -1; bz, hw = wb['z'], wb['w'] / 2
        wall_x = rm['x0'] if sg > 0 else rm['x1']                                           # 白板貼的那一面牆（房間的內面）
        onext = lambda x_: abs(x_ - XI0) < 0.01 or abs(x_ - XI1) < 0.01
        mkw = (lambda k, s_='W' if sg > 0 else 'E': wm(0, s_, k)) if onext(wall_x) else (lambda k: mk(0, k))   # 貼在外牆上的跟著牆淡出
        X = lambda d: wall_x + sg * d                                                        # 從牆面往房間裡 d 公尺
        bx = lambda d0, d1: (min(X(d0), X(d1)), max(X(d0), X(d1)))
        mkw('white').box(*bx(0.0, 0.03), 1.0, 2.0, bz - hw, bz + hw)
        mkw('steel').box(*bx(0.0, 0.04), 0.98, 1.0, bz - hw, bz + hw); mkw('steel').box(*bx(0.0, 0.035), 2.0, 2.02, bz - hw, bz + hw)
        for zz in (bz - hw, bz + hw): mkw('steel').box(*bx(0.0, 0.035), 0.98, 2.02, zz - 0.012, zz + 0.012)
        mkw('grey').box(*bx(0.03, 0.1), 0.98, 1.01, bz - hw / 2, bz + hw / 2)                # 板擦、筆槽
        for k, c in enumerate(('black', 'red', 'fabric')): mkw(c).cyl((X(0.06), 1.02, bz - 0.2 + k * 0.08), (X(0.06), 1.02, bz - 0.08 + k * 0.08), 0.01, seg=6)
        tv_x = rm['x1'] if sg > 0 else rm['x0']; tz = rm['table']['z']                      # 螢幕：對面的牆
        mkt = (lambda k, s_='E' if sg > 0 else 'W': wm(0, s_, k)) if onext(tv_x) else (lambda k: mk(0, k))
        T_ = lambda d: tv_x - sg * d
        mkt('black').box(min(T_(0.0), T_(0.06)), max(T_(0.0), T_(0.06)), 1.2, 1.85, tz - 0.55, tz + 0.55)
        mkt('tv').box(min(T_(0.06), T_(0.062)), max(T_(0.06), T_(0.062)), 1.23, 1.82, tz - 0.52, tz + 0.52)
    elif rm['kind'] == 'copy':
        for cx in rm['copiers']:
            cz = Z0 + 0.45 + 0.0; F = xf(cx, 0.0, cz, 0.0); wt, bk, gy = mk(0, 'white'), mk(0, 'black'), mk(0, 'grey')
            tbox(gy, F, -0.31, 0.31, 0.0, 0.08, -0.27, 0.27); tbox(wt, F, -0.32, 0.32, 0.08, 0.92, -0.29, 0.29)
            for k in range(3): tbox(gy, F, -0.3, 0.3, 0.14 + k * 0.24, 0.16 + k * 0.24, 0.29, 0.3)   # 紙匣的縫
            tbox(bk, F, -0.32, 0.32, 0.92, 0.98, -0.29, 0.29); tbox(wt, F, -0.3, 0.26, 0.98, 1.1, -0.27, 0.25)   # 掃描器＋自動送稿
            tbox(bk, xf(*F(0.18, 1.0, 0.3), yaw=0.0, pitch=0.5), -0.14, 0.14, 0.0, 0.1, -0.01, 0.01); tbox(mk(0, 'screen'), xf(*F(0.18, 1.0, 0.3), yaw=0.0, pitch=0.5), -0.1, 0.1, 0.015, 0.085, 0.01, 0.012)
            mk(0, 'paper').box(cx - 0.2, cx + 0.1, 0.92, 0.94, cz + 0.3, cz + 0.42)              # 出紙
        F = xf(rm['x0'] + 0.25, 0.0, -5.6, math.pi / 2)                                     # 加值機
        tbox(mk(0, 'grey'), F, -0.38, 0.38, 0.0, 1.35, -0.18, 0.18); tbox(mk(0, 'screen'), F, -0.2, 0.2, 1.0, 1.25, 0.18, 0.19); tbox(mk(0, 'black'), F, -0.08, 0.08, 0.8, 0.84, 0.18, 0.2)
        mk(0, 'grey').box(2.75, 3.05, 0.0, 0.62, -7.88, -7.6); mk(0, 'paper').box(2.78, 3.02, 0.62, 0.64, -7.85, -7.63)   # 回收紙箱（牆角）

# ================= 其他家具：新書展示台、館藏查詢、書車、踏凳、盆栽 =================
cvm = um(0, 'cover')
for f in J['furniture']:
    lv = f.get('lv', 0); y = Y1 if lv else 0.0; t = f['type']
    if t == 'newbooks':
        x, z, w, d = f['x'], f['z'], f['w'], f['d']; wd = mk(lv, 'walnut')
        wd.box(x - w / 2, x + w / 2, y + 0.7, y + 0.75, z - d / 2, z + d / 2); wd.box(x - w / 2 + 0.06, x + w / 2 - 0.06, y, y + 0.7, z - d / 2 + 0.06, z + d / 2 - 0.06)
        wd.box(x - w / 2 + 0.25, x + w / 2 - 0.25, y + 0.75, y + 0.87, z - 0.16, z + 0.16); wd.box(x - w / 2 + 0.45, x + w / 2 - 0.45, y + 0.87, y + 0.98, z - 0.06, z + 0.06)
        cvx = um(lv, 'cover')
        for side in (-1, 1):                                                                # 兩側各四本立著（封面朝外）
            for i in range(4):
                bx = x - 0.6 + i * 0.4; ci = 8 + (i + (side > 0)) % 4 if i % 2 == 0 else rnd.randrange(8)
                Fb = xf(bx, y + 0.75, z + side * 0.24, 0.0 if side > 0 else math.pi, pitch=-0.22)
                cover_quad(cvx, Fb, -0.085, 0.085, 0.0, 0.235, 0.012, ci)
                tbox(mk(lv, 'paper'), Fb, -0.085, 0.085, 0.0, 0.235, -0.012, 0.011, faces=['+y', '-x', '+x', '-z'])
                tbox(mk(lv, 'steel'), xf(bx, y + 0.75, z + side * 0.2, 0.0), -0.04, 0.04, 0.0, 0.1, -0.005, 0.005)
        for i in range(3):                                                                  # 平放的一疊
            ci = 8 + i; F = xf(x + (0.75 if i < 2 else -0.75), y + 0.75 + (0.035 * i if i < 2 else 0), z + 0.05, 0.2 * i)
            tbox(mk(lv, 'paper'), F, -0.085, 0.085, 0.0, 0.03, -0.12, 0.12, faces=['-x', '+x', '-z', '+z'])
            cvx.face([F(-0.085, 0.031, 0.12), F(0.085, 0.031, 0.12), F(0.085, 0.031, -0.12), F(-0.085, 0.031, -0.12)], [(u, v) for (u, v) in ((cuv(ci)[0], cuv(ci)[1]), (cuv(ci)[2], cuv(ci)[1]), (cuv(ci)[2], cuv(ci)[3]), (cuv(ci)[0], cuv(ci)[3]))])
    elif t == 'opac':
        F = xf(f['x'], y, f['z'], f.get('ry', 0.0)); g, bk = mk(lv, 'grey'), mk(lv, 'black')
        tbox(g, F, -0.25, 0.25, 0.0, 0.02, -0.22, 0.22); tbox(g, F, -0.08, 0.08, 0.02, 0.92, -0.12, 0.02)
        tbox(bk, xf(*F(0, 0.92, 0.0), yaw=f.get('ry', 0.0), pitch=0.25), -0.24, 0.24, 0.0, 0.025, -0.02, 0.24)   # 鍵盤架
        Fs = xf(*F(0, 1.02, -0.08), yaw=f.get('ry', 0.0), pitch=-0.3)
        tbox(bk, Fs, -0.23, 0.23, 0.0, 0.32, -0.04, 0.0); tbox(mk(lv, 'screen'), Fs, -0.21, 0.21, 0.02, 0.3, 0.0, 0.004)
    elif t == 'cart': book_cart(lv, f['x'], f['z'], f.get('ry', 0.0), rnd)
    elif t == 'stool':
        bm_ = L.lathe([(0.24, 0.0), (0.24, 0.03), (0.215, 0.05), (0.19, 0.4), (0.2, 0.41), (0.2, 0.42), (0.0, 0.42)], seg=24)
        sm = Mesh(f'L{lv}_stool', L.flat('ll_stool', '#4a6c8c', rough=0.5)); sm.add_bm(bm_, Matrix.Translation(g2b(f['x'], y, f['z']))); bm_.free()
        MESH[(lv, 'stool')] = sm; mk(lv, 'black').cyl((f['x'], y + 0.42, f['z']), (f['x'], y + 0.425, f['z']), 0.17, seg=20)
    elif t == 'plant':
        r = f['r']; bm_ = L.lathe([(r * 0.82, 0.0), (r, 0.48), (r * 0.94, 0.48), (r * 0.9, 0.46), (0.0, 0.46)], seg=24)
        pm = mk(lv, 'pot'); pm.add_bm(bm_, Matrix.Translation(g2b(f['x'], y, f['z']))); bm_.free()
        PL.potted(B.mesh_obj, PM, f'L{lv}_plant_{f["x"]:.1f}_{f["z"]:.1f}', G[lv], f['x'], y + 0.46, f['z'], r * 0.9, seed=int(abs(f['x'] * 10 + f['z'])), h=1.15)

# ---- 安全梯的門（二樓東牆，關著）＋出口標示燈 ----
EM = J['emergency']; ez = EM['z']
wm(1, 'E', 'frame').box(XI1 - 0.05, XI1, Y1, Y1 + 2.3, ez - 0.55, ez + 0.55)
wm(1, 'E', 'grey').box(XI1 - 0.07, XI1 - 0.05, Y1 + 0.01, Y1 + 2.2, ez - 0.48, ez + 0.48)
wm(1, 'E', 'steel').box(XI1 - 0.13, XI1 - 0.1, Y1 + 0.98, Y1 + 1.04, ez - 0.4, ez + 0.4)
for zz in (ez - 0.38, ez + 0.38): wm(1, 'E', 'steel').box(XI1 - 0.1, XI1 - 0.07, Y1 + 0.97, Y1 + 1.05, zz - 0.02, zz + 0.02)
EXITS.append((1, ez, Y1 + 2.5))
# ---- 消防：一樓樓梯口旁的滅火器箱（嵌在牆裡）、火警鈴 ----
mk(0, 'red').box(-4.9, -4.1, 0.3, 1.9, SB['z0'] - 0.08, SB['z0'] - 0.06); mk(0, 'grey').box(-4.8, -4.2, 1.3, 1.8, SB['z0'] - 0.085, SB['z0'] - 0.08)   # 消防栓箱（B 跑北端的牆上）

# ================= 吊牌（字是遊戲畫的）：背板＋吊線；貼牆的牌子不用 =================
for s in J['signs']:
    lv = s['lv']; y0 = Y1 if lv else 0.0; ceil_y = (RY if lv else C0); w = s['w']; h = w * 0.16; cy = y0 + s['y']   # 和遊戲同一個算法（lawlib3d.js：(lv?Y1:0)+y）
    ry = s.get('ry', 0.0); fx, fz = math.sin(ry), math.cos(ry)
    near_wall = abs(s['z'] - (FZ + 0.12)) < 0.05 or abs(s['x'] - FWX) < 0.03
    if near_wall or cy + h / 2 > ceil_y: continue   # 貼牆的不用；在天花板上面的（配置的 y 寫錯時）也不做，免得出現一塊沒有字的黑板
    bx, bz = s['x'] - fx * 0.012, s['z'] - fz * 0.012
    F = xf(bx, cy, bz, ry); tbox(mk(lv, 'signback'), F, -w / 2 - 0.03, w / 2 + 0.03, -h / 2 - 0.03, h / 2 + 0.03, -0.02, 0.0)
    for sx in (-1, 1):
        p = F(sx * (w / 2 - 0.1), h / 2 + 0.03, -0.01); mk(lv, 'steel').cyl(p, (p[0], ceil_y, p[2]), 0.004, seg=4)

def exit_sign(lv, a, yc):
    """出口標示燈（東牆的內面）：白色燈箱＋正面貼圖（綠底、人往門跑）"""
    w, h, dp = 0.36, 0.17, 0.06
    on_wall(wm(lv, 'E', 'white'), 'E', a - w / 2, a + w / 2, yc - h / 2, yc + h / 2, 0.0, dp)
    xf_ = XI1 - dp - 0.002; yb, yt = yc - h / 2 + 0.01, yc + h / 2 - 0.01
    wum(lv, 'E', 'exit').face([(xf_, yb, a - w / 2 + 0.01), (xf_, yb, a + w / 2 - 0.01), (xf_, yt, a + w / 2 - 0.01), (xf_, yt, a - w / 2 + 0.01)], [(0, 0), (1, 0), (1, 1), (0, 1)])
for (lv, a, yc) in EXITS: exit_sign(lv, a, yc)

# ================= 輸出 =================
for (lv, key), m in MESH.items():
    smooth = key in ('stool', 'pot', 'shade', 'brass', 'steel')
    m.finish(G[lv], smooth=smooth)
for (lv, key), m in UMESH.items(): m.finish(G[lv], uv=False)
for (lv, side, key), m in WMESH.items(): m.finish(G[lv], props={'dir': DIRS[side]})
for (lv, side, key), m in WUM.items(): m.finish(G[lv], uv=False, props={'dir': DIRS[side]})
# 植物的葉子、莖：平滑著色
for ob in root.children_recursive:
    if ob.type == 'MESH' and any(k in ob.data.materials[0].name for k in ('leaf_', 'bark')): L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(G[0], keep=lambda ob: ob.parent is not G[0] or 'WALL_' in ob.name or ob.name.startswith('L0_') and not 'plant' in ob.name, key=lambda ob: 'L0')
L.merge_by_material(G[1], keep=lambda ob: ob.parent is not G[1] or 'WALL_' in ob.name or ob.name.startswith('L1_') and not 'plant' in ob.name, key=lambda ob: 'L1')

tris = {}; inst = {}
for ob in root.children_recursive:
    if ob.type != 'MESH': continue
    me = ob.data; me.calc_loop_triangles(); n = len(me.loop_triangles)
    if ob.parent in BOOKS_G: inst[me.name] = inst.get(me.name, 0) + 1; continue
    tris[ob.name] = n
mod_tris = {me.name: (len(me.polygons) * 2) for mods in MODS.values() for me in mods}
drawn_books = sum(mod_tris[k] * v for k, v in inst.items())
st = L.export(OUT, gpu_instances=True)
info = dict(st, tris_unique=sum(tris.values()) + sum(mod_tris.values()), tris_static=sum(tris.values()), book_instances=NBOOK['n'], book_modules=len(mod_tris),
            book_tris_drawn=drawn_books, tris_drawn=sum(tris.values()) + drawn_books, seats=len(SEATS), tris_by_object=dict(sorted(tris.items(), key=lambda kv: -kv[1])[:40]))
L.write_json(OUT[:-4] + '.json', info)
print('tris static', sum(tris.values()), 'book instances', NBOOK['n'], 'book tris drawn', drawn_books)

if arg('--preview'):
    os.makedirs(arg('--preview'), exist_ok=True)
    views = [['landing', [-6.3, 3.75, 7.4], [-4.2, 3.6, 2.6], 20], ['well', [-2.95, 6.3, 2.3], [-5.8, 2.6, 6.2], 18], ['disc', [-4.3, 1.55, -4.9], [-6.6, 1.1, -7.2], 18],
             ['door', [3.4, 1.6, 6.4], [7.2, 1.3, 6.6], 20], ['journals', [-2.8, 5.85, -2.0], [-7.0, 5.0, -6.6], 20], ['thesis', [0.0, 5.85, -4.6], [3.0, 5.0, -7.9], 22]] if arg('--views') == 'more' else \
            [['entrance', [6.4, 1.6, 6.6], [-2.0, 1.4, 0.5], 22], ['reading', [3.0, 1.6, 5.6], [-2.0, 0.9, -2.0], 24], ['stairs', [-1.6, 1.6, -0.6], [-6.0, 2.4, 4.6], 22],
             ['rooms', [1.8, 1.6, -0.8], [-2.0, 1.4, -6.0], 24], ['counter', [3.6, 1.55, 7.0], [5.2, 1.0, 3.6], 26],
             ['stacks', [-1.6, 5.8, 3.2], [-1.6, 5.0, -6.0], 24], ['stacks2', [5.6, 5.8, -6.8], [-3.0, 5.0, -1.0], 22], ['upper', [-2.0, 5.9, -1.6], [4.0, 5.2, 6.8], 22]]
    json.dump(views, open(os.path.join(arg('--preview'), 'views.json'), 'w'))
