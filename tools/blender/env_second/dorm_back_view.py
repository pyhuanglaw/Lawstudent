"""宿舍大二～大四的窗景：男一舍「背面」往南看出去（AA_208 第 7、8 節：312 三樓「看得到另一邊的樹」、409 四樓「介於中間」、507 五樓「樹梢和遠一點的屋頂」）。
SCN-V4-01／SCN-V5-01（LAWWW-C 2026-10-20 19:2x：507、409 和 312 看起來一樣，要「每一年看得出不同（窗外 5F／4F 的景）」），LAWWW-C 的美術子代理 2026-10-20。
Blender 5.2（bpy，無介面）蓋一個真的 3D 場景、Cycles 從三個樓層的窗口高度渲染 → 窗景照片（取代 tools/shots/window_views.py 在遊戲校園拍的那三組：
校園邊界外的背景是一排一排比五樓還高的方盒公寓，三個樓層看出去都是「一棵樹＋一面牆」，五樓也看不到屋頂）：
  /opt/blenv/bin/python tools/blender/env_second/dorm_back_view.py [-- --only 507,409] [--day|--night] [--samples 64] [--threads 4] [--res 1024x512] [--png 資料夾]
輸出 assets/models/env/views/dorm_room{312,409,507}_{day,night}.webp（1024×512、水平視角 90°、鏡頭水平＝照片中間是地平線；W3.windowMat 的視差照這個比例）。
--png：另外存一份 PNG（驗收用，不進 repo）。

場景（座標＝遊戲的校園座標：x 東、y 上、z 南；男一舍 x 2～38、z 61～75，背面在 z 75，往 +z 看）：
  z 75～104   宿舍後面的草地、一條水泥小路、兩盞路燈（晚上照亮樹的這一面）
  z  99       一排樟樹（street_trees.glb 的 camphor_a／b，LAWWW2-C 在遊戲裡量的位置 x −6、6.6、20.5、33.5，左右再補），高 8.6～10 m
  z 104       校園的圍牆：矮牆＋鐵欄杆、人行道
  z 106～113  巷子（淺灰柏油 D30、白色邊線、紅線）、路燈、停在對面的機車（scooter.glb）
  z 114～130  對面一排三～五層的老公寓：一樓鐵捲門、小店（店名虛構，D77）、鐵皮雨遮；樓上照公館背景的立面貼圖（gg_bd_facade.png：鐵窗、冷氣、陽台）；
              屋頂＝這張圖的重點：女兒牆、頂樓加蓋的鐵皮屋、不鏽鋼水塔、樓梯間、天線、太陽能熱水器、盆栽、曬衣架
  z 140～165  第二排六～八層的公寓大樓（屋頂機房、水塔）
  z 210～330  第三排十二～十八層的大樓
  z 1700～    遠山（蟾蜍山、更遠的山）
三個鏡頭：312（三樓 8.4 m，x 20）、409（四樓 11.5 m，x 33）、507（五樓 14.6 m，x 8）＝tools/shots/window_views.py 原本的位置（窗中心高度＝地板＋1.675 m）。
房間的窗只露出照片地平線以下的那一半（上半被捲簾蓋住）：三樓看到樹冠和對面一、二樓的店面，四樓看到樹梢和對面頂樓那一層、
五樓看到樹梢底下、對面一整片屋頂（水塔、鐵皮屋）——三年一眼看得出高度不同。
素材：樹 street_trees.glb、機車 scooter.glb、路燈 street_props.glb（都是本作的 Blender 模型）；Poly Haven CC0（草、水泥、柏油、地磚、鐵皮、鐵捲門）；
立面、店面貼圖 gg_bd_facade.png／gg_bd_shopfront.png（本作程式畫的，店名虛構）。這是渲染成照片的背景，不進遊戲的 3D 場景，三角形數不影響手機效能。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
ROOMS = {'312': (20.0, 8.4), '409': (33.0, 11.5), '507': (8.0, 14.6)}   # 鏡頭 x、高度（窗中心）；z＝75.6（背面外牆外一點點）
ONLY = [r for r in opt('--only', '312,409,507').split(',') if r]
TIMES = ['day', 'night'] if not ('--day' in ARGS or '--night' in ARGS) else (['day'] if '--day' in ARGS else ['night'])
RW, RH = map(int, opt('--res', '1024x512').split('x'))
SAMPLES = int(opt('--samples', '64')); THREADS = int(opt('--threads', '0'))
OUTDIR = os.path.join(L.ROOT, opt('--out', 'assets/models/env/views')); PNG = opt('--png')
GEN = os.path.join(HERE, 'textures', 'gen'); MODELS = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai')
CAM_Z = 75.6
SUN = tuple(map(float, opt('--sun', '105,52').split(','))); SUN_E = float(opt('--sun-e', '3.6')); SKY_S = float(opt('--sky', '1.0')); EXPO = float(opt('--expo', '0.0'))
TURB = float(opt('--turb', '4.0'))
VIEW = opt('--view', 'AgX'); LOOK = opt('--look', 'AgX - Punchy')
PITCH = float(opt('--pitch', '11'))   # 鏡頭往上抬幾度（見檔頭「為什麼往上抬」）
PI = math.pi

B.reset(texres=1024)
sc = bpy.context.scene


# ---------------- 材質 ----------------
def lin(hexcol): return B.srgb(hexcol)


def flat(name, hexcol, rough=0.7, metal=0.0, emit=None, emit_strength=1.0):
    m = L.flat(name, hexcol, rough=rough)
    bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Metallic'].default_value = metal   # 渲染用（不是遊戲的 GLB）：不鏽鋼可以用真的金屬度
    if emit: bs.inputs['Emission Color'].default_value = (*lin(emit), 1.0); bs.inputs['Emission Strength'].default_value = emit_strength
    return m


def pbr(name, pid, tile, target=None, tint=None, rough=None, normal=0.8):
    m = L.pbr(name, pid, tile=tile, target=target, tint=lin(tint) if tint else None, normal=normal)
    if rough is not None:
        bs = m.node_tree.nodes['Principled BSDF']
        for lk in list(bs.inputs['Roughness'].links): m.node_tree.links.remove(lk)
        bs.inputs['Roughness'].default_value = rough
    return m


def img_mat(name, png, rough=0.8, emit_png=None, emit=0.0, alpha=False):
    """貼圖集材質（立面、店面）：emit_png＝晚上亮的部分（gg_bd_facade_night.png：亮燈的窗）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = rough
    if alpha: tx.image.alpha_mode = 'STRAIGHT'; nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
    if emit > 0:
        te = N.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(emit_png) if emit_png else tx.image
        nt.links.new(te.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    return m


NIGHT_MATS = {}   # 晚上才亮的材質：名字 → (自發光顏色, 強度)；render() 依時段開關


def night_glow(m, hexcol, strength):
    NIGHT_MATS[m.name] = (hexcol, strength); return m


MAT = {
    'grass': pbr('bv_grass', 'leafy_grass', 2.5, target='#6f8f4e'),
    'path': pbr('bv_path', 'granular_concrete', 2.0, target='#b7b3aa'),
    'asphalt': pbr('bv_asphalt', 'granular_concrete', 3.0, target='#a9a9a7', rough=0.92),
    'sidewalk': pbr('bv_sidewalk', 'square_brick_paving', 1.2, target='#b9ab98'),
    'conc': pbr('bv_conc', 'concrete_wall_006', 2.2, target='#bdb8ae'),
    'conc_d': pbr('bv_conc_d', 'concrete_wall_006', 2.2, target='#8f8b83'),
    'roof': pbr('bv_roof', 'granular_concrete', 2.5, target='#8c8d86'),
    'roof_g': pbr('bv_roof_g', 'granular_concrete', 2.5, target='#6e8b7a'),   # 綠色防水漆
    'side_a': pbr('bv_side_a', 'plaster_grey_04', 2.0, target='#cfc8b8'),
    'side_b': pbr('bv_side_b', 'plaster_grey_04', 2.0, target='#b9b4ab'),
    'side_c': pbr('bv_side_c', 'rectangular_facade_tiles', 1.6, target='#d8d2c4'),
    'shutter': pbr('bv_shutter', 'painted_metal_shutter', 1.4, target='#9ea3a6'),
    'shutter_b': pbr('bv_shutter_b', 'painted_metal_shutter', 1.4, target='#7d8a8f'),
    'iron': flat('bv_iron', '#34383c', rough=0.45, metal=0.6),
    'steel': flat('bv_steel', '#c9cdd1', rough=0.28, metal=0.95),
    'white': flat('bv_white', '#e4e4df', rough=0.5),
    'dark': flat('bv_dark', '#26292c', rough=0.6),
    'door': flat('bv_door', '#5b4a3c', rough=0.6),
    'glass': flat('bv_glass', '#2c3a46', rough=0.08, metal=0.2),
    'frame': flat('bv_frame', '#b9bcbe', rough=0.35, metal=0.5),
    'pot': flat('bv_pot', '#9a5a3c', rough=0.8),
    'leaf': flat('bv_leaf', '#4f7a3a', rough=0.85),
    'leaf_d': flat('bv_leaf_d', '#3e6230', rough=0.85),
    'solar': flat('bv_solar', '#1f2c45', rough=0.2, metal=0.3),
    'line_w': flat('bv_line_w', '#ecebe6', rough=0.6),
    'line_r': flat('bv_line_r', '#b23a32', rough=0.6),
    'hill_a': flat('bv_hill_a', '#6f8c84', rough=1.0),
    'hill_b': flat('bv_hill_b', '#8ea4a6', rough=1.0),
    'facade': img_mat('bv_facade', os.path.join(GEN, 'gg_bd_facade.png'), rough=0.82, emit_png=os.path.join(GEN, 'gg_bd_facade_night.png'), emit=0.0),
    'shop': img_mat('bv_shop', os.path.join(GEN, 'gg_bd_shopfront.png'), rough=0.6, emit=0.0),
    'lamp_lens': flat('bv_lamp_lens', '#fff4dc', rough=0.3),
    'win_lit': flat('bv_win_lit', '#2c3a46', rough=0.1),
}
CORR = {k: pbr('bv_corr_' + k, 'corrugated_iron', 1.2, target=c) for k, c in
        {'blue': '#4a76a6', 'green': '#5f8a63', 'grey': '#9ea2a3', 'white': '#d9dad6', 'rust': '#9b5a42', 'cream': '#d8cfb4', 'teal': '#4f8f90'}.items()}
CLOTH = {k: flat('bv_cloth_' + k, c, rough=0.9) for k, c in {'w': '#ecebe4', 'b': '#4b6ea8', 'r': '#c0504a', 'y': '#e2c25a', 'g': '#6d9a6a', 'k': '#3a3c40'}.items()}
night_glow(MAT['lamp_lens'], '#ffd9a0', 9.0); night_glow(MAT['win_lit'], '#ffd8a0', 3.2)

ACC = {}


def acc(key, mat=None):
    if key not in ACC: ACC[key] = Mesh('bv_' + key, mat or MAT.get(key) or CORR.get(key[5:]) or CLOTH.get(key[6:]))
    return ACC[key]


class UVMesh(Mesh):
    """自己給 UV 的網格（貼圖集：立面、店面）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.new('UVMap')

    def rect(self, bl, R, U, w, h, uv):
        """bl＝左下角（從看的人那一邊）、R＝往右、U＝往上（法線＝R×U，朝看的人）；uv＝(u0, v0, u1, v1)"""
        P = [bl, tuple(bl[i] + R[i] * w for i in range(3)), tuple(bl[i] + R[i] * w + U[i] * h for i in range(3)), tuple(bl[i] + U[i] * h for i in range(3))]
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in P]); u0, v0, u1, v1 = uv
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[self.uv].uv = t
        return f

    def finish(self, parent=None, props=None, uv=False, smooth=False, merge=False):
        return super().finish(parent, props, uv=False, smooth=smooth, merge=False)


FACADE = UVMesh('bv_facade', MAT['facade']); SHOP = UVMesh('bv_shop', MAT['shop'])
NORTH_R, UP = (-1.0, 0.0, 0.0), (0.0, 1.0, 0.0)   # 朝北的立面（看的人往南看）：往右＝西（−x）


def cell_uv(c, r, k0=0, k1=4):
    """gg_bd_facade.png：4 欄 × 2 列，一格 512×1024 px＝寬 6 m、四層樓；k＝從上面數第幾層（0～3）"""
    u0, u1 = c / 4 + 0.002, (c + 1) / 4 - 0.002
    y0, y1 = r * 0.5 + k0 * 0.125, r * 0.5 + k1 * 0.125
    return (u0, 1 - y1, u1, 1 - y0)


def shop_uv(i):
    """gg_bd_shopfront.png：4 欄 × 2 列（一格 512×256 px）"""
    c, r = i % 4, i // 4
    return (c / 4 + 0.002, 1 - (r + 1) * 0.5 + 0.004, (c + 1) / 4 - 0.002, 1 - r * 0.5 - 0.004)


# ---------------- 小零件 ----------------
def box(key, x0, x1, y0, y1, z0, z1): acc(key).box(min(x0, x1), max(x0, x1), min(y0, y1), max(y0, y1), min(z0, z1), max(z0, z1))


def cyl(key, a, b, r, seg=12, r2=None): acc(key).cyl(a, b, r, seg=seg, r2=r2)


def water_tank(x, y, z, rng, big=False):
    """不鏽鋼水塔：圓筒＋圓頂蓋＋鋼架（四支腳）"""
    r = rng.uniform(0.55, 0.72) * (1.25 if big else 1.0); h = rng.uniform(1.15, 1.55) * (1.2 if big else 1.0); leg = rng.uniform(0.6, 1.4)
    for sx in (-1, 1):
        for sz in (-1, 1): box('iron', x + sx * r * 0.75 - 0.04, x + sx * r * 0.75 + 0.04, y, y + leg, z + sz * r * 0.75 - 0.04, z + sz * r * 0.75 + 0.04)
    box('iron', x - r * 0.85, x + r * 0.85, y + leg - 0.08, y + leg, z - r * 0.85, z + r * 0.85)
    cyl('steel', (x, y + leg, z), (x, y + leg + h, z), r, seg=20)
    cyl('steel', (x, y + leg + h, z), (x, y + leg + h + r * 0.35, z), r, seg=20, r2=r * 0.25)
    for k in range(1, 4): cyl('steel', (x, y + leg + h * k / 4 - 0.02, z), (x, y + leg + h * k / 4 + 0.02, z), r + 0.015, seg=20)   # 一圈一圈的壓紋
    cyl('iron', (x + r * 0.7, y + leg + 0.2, z), (x + r * 0.7, y, z + 0.3), 0.04, seg=6)   # 水管


def antenna(x, y, z, rng):
    h = rng.uniform(2.0, 3.4); cyl('iron', (x, y, z), (x, y + h, z), 0.03, seg=6)
    for k in range(rng.randint(3, 5)):
        yy = y + h - 0.25 - k * 0.32; w = 0.9 - k * 0.12; a = rng.uniform(0, PI)
        dx, dz = math.cos(a) * w, math.sin(a) * w; cyl('iron', (x - dx, yy, z - dz), (x + dx, yy, z + dz), 0.012, seg=4)


def ac_unit(x, y, z, face=-1):
    """冷氣室外機（白色）：face＝朝 −z（北）"""
    box('white', x - 0.4, x + 0.4, y, y + 0.55, z - 0.14, z + 0.14); cyl('dark', (x + 0.08, y + 0.27, z + face * 0.14), (x + 0.08, y + 0.27, z + face * 0.15), 0.2, seg=14)


def plant(x, y, z, rng, s=1.0):
    cyl('pot', (x, y, z), (x, y + 0.35 * s, z), 0.2 * s, seg=10, r2=0.26 * s)
    for k in range(rng.randint(2, 4)):
        acc('leaf' if rng.random() < 0.6 else 'leaf_d').ell((x + rng.uniform(-0.15, 0.15) * s, y + (0.55 + 0.2 * k) * s, z + rng.uniform(-0.15, 0.15) * s), 0.32 * s, 0.28 * s, 0.32 * s, seg=8, rings=5)


def laundry(x0, x1, y, z, rng):
    cyl('frame', (x0, y, z), (x1, y, z), 0.02, seg=5)
    for k in (x0, x1): cyl('frame', (k, y - 1.5, z), (k, y, z), 0.025, seg=5)
    x = x0 + 0.2
    while x < x1 - 0.5:
        w = rng.uniform(0.35, 0.7); h = rng.uniform(0.45, 0.9); col = rng.choice(list(CLOTH))
        acc('cloth_' + col).quad([(x, y - h, z), (x + w, y - h, z + 0.02), (x + w, y, z + 0.02), (x, y, z)]); x += w + rng.uniform(0.05, 0.25)


def solar_heater(x, y, z, rng):
    """太陽能熱水器：斜的深藍色集熱板＋上面一支橫的水桶"""
    w = 2.0; acc('solar').quad([(x - w / 2, y + 0.3, z + 0.9), (x + w / 2, y + 0.3, z + 0.9), (x + w / 2, y + 1.2, z - 0.1), (x - w / 2, y + 1.2, z - 0.1)])
    for sx in (-1, 1): box('iron', x + sx * w / 2 - 0.04, x + sx * w / 2, y, y + 1.2, z - 0.15, z + 0.9)
    cyl('steel', (x - w / 2, y + 1.45, z - 0.2), (x + w / 2, y + 1.45, z - 0.2), 0.28, seg=16)


def shed(x0, x1, y, z0, z1, rng):
    """頂樓加蓋：鐵皮牆（直條）＋斜的鐵皮屋頂（往北低）、前面一兩扇鋁窗（晚上有的亮燈）"""
    h = rng.uniform(2.5, 2.9); wall = rng.choice(['white', 'cream', 'grey', 'white', 'teal']); roof = rng.choice(['blue', 'blue', 'green', 'grey', 'rust', 'teal'])
    k = 'corr_' + wall
    acc(k).box(x0, x1, y, y + h, z0, z0 + 0.05); acc(k).box(x0, x0 + 0.05, y, y + h, z0, z1); acc(k).box(x1 - 0.05, x1, y, y + h, z0, z1)
    rk = 'corr_' + roof; drop = 0.35; ov = 0.25
    acc(rk).quad([(x1 + ov, y + h - drop, z0 - ov), (x0 - ov, y + h - drop, z0 - ov), (x0 - ov, y + h + 0.1, z1 + ov), (x1 + ov, y + h + 0.1, z1 + ov)])   # 上面（往北低）
    acc(rk).quad([(x0 - ov, y + h - drop - 0.06, z0 - ov), (x1 + ov, y + h - drop - 0.06, z0 - ov), (x1 + ov, y + h + 0.04, z1 + ov), (x0 - ov, y + h + 0.04, z1 + ov)])   # 下面
    n = rng.randint(1, 3) if x1 - x0 > 3.5 else 1; ww = min(1.4, (x1 - x0) / (n + 1))
    for i in range(n):
        cx = x0 + (x1 - x0) * (i + 1) / (n + 1); lit = rng.random() < 0.45
        box('frame', cx - ww / 2 - 0.05, cx + ww / 2 + 0.05, y + 0.95, y + 2.05, z0 - 0.03, z0 - 0.005)
        box('win_lit' if lit else 'glass', cx - ww / 2, cx + ww / 2, y + 1.0, y + 2.0, z0 - 0.04, z0 - 0.03)
        box('frame', cx - 0.02, cx + 0.02, y + 1.0, y + 2.0, z0 - 0.05, z0 - 0.04)
    if rng.random() < 0.5: ac_unit(x0 + 0.6, y + 0.1, z0 - 0.2)
    return h


# ---------------- 公寓 ----------------
GH, FH = 3.3, 3.0   # 一樓、樓上的樓層高
WALKUP_CELLS = [(0, 0), (1, 0), (2, 0), (3, 0), (0, 1), (1, 1)]   # 老公寓的立面（磁磚＋鐵窗、洗石子、陽台曬衣服、淺藍磁磚、紅磚、米色）
SIDE_KEYS = ['side_a', 'side_b', 'side_c', 'conc']


def walkup(x0, x1, zf, depth, floors, rng, row=1):
    """一棟公寓：正面朝北（z＝zf）、往南 depth；x0 < x1。回傳屋頂高度。"""
    H = GH + (floors - 1) * FH; zb = zf + depth; W = x1 - x0
    c, r = rng.choice(WALKUP_CELLS) if row == 1 else rng.choice(WALKUP_CELLS + [(3, 1)])
    side = rng.choice(SIDE_KEYS)
    # 正面：樓上每一層一條（照貼圖集的樓層順序：二樓＝最下面那一條）
    for i in range(1, floors):
        k = 3 - ((i - 1) % 4); y0 = GH + (i - 1) * FH
        FACADE.rect((x1, y0, zf - 0.006), NORTH_R, UP, W, FH, cell_uv(c, r, k, k + 1))   # 往外 6 mm：不和側牆的前緣疊在同一個平面
        box(side, x0, x1, y0 - 0.12, y0 + 0.04, zf - 0.14, zf)   # 樓板的邊（凸出一點點，立面有前後）
    # 一樓：鐵捲門、小店、住家大門（三選一，寬的分兩格）
    bays = 2 if W > 6.8 else 1; bw = W / bays
    for b in range(bays):
        bx0, bx1 = x0 + b * bw, x0 + (b + 1) * bw; t = rng.random()
        box(side, bx0, bx0 + 0.25, 0, GH, zf - 0.05, zf); box(side, bx1 - 0.25, bx1, 0, GH, zf - 0.05, zf); box(side, bx0, bx1, GH - 0.45, GH, zf - 0.05, zf)
        if t < 0.38:   # 鐵捲門（拉下來的）＋門箱
            box('shutter' if rng.random() < 0.6 else 'shutter_b', bx0 + 0.25, bx1 - 0.25, 0, GH - 0.45, zf - 0.02, zf - 0.01)
            box('conc_d', bx0 + 0.2, bx1 - 0.2, GH - 0.62, GH - 0.42, zf - 0.32, zf - 0.02)
        elif t < 0.72:   # 小店（店面貼圖；晚上亮）
            SHOP.rect((bx1 - 0.25, 0.0, zf - 0.03), NORTH_R, UP, bw - 0.5, GH - 0.45, shop_uv(rng.randint(0, 7)))
            box('conc_d', bx0 + 0.25, bx1 - 0.25, 0, 0.12, zf - 0.6, zf - 0.03)
        else:   # 住家大門：深色鐵門＋旁邊停一台腳踏車的空間
            dm = bx0 + bw / 2; box('door', dm - 0.55, dm + 0.55, 0, 2.3, zf - 0.03, zf - 0.01); box(side, bx0 + 0.25, dm - 0.55, 0, GH - 0.45, zf - 0.03, zf)
            box(side, dm + 0.55, bx1 - 0.25, 0, GH - 0.45, zf - 0.03, zf); box(side, dm - 0.55, dm + 0.55, 2.3, GH - 0.45, zf - 0.03, zf); box('frame', dm - 0.3, dm + 0.3, 2.45, 2.65, zf - 0.04, zf - 0.02)
        # 鐵皮雨遮（一樓上面）
        if rng.random() < 0.75:
            col = rng.choice(['blue', 'green', 'grey', 'white', 'teal']); d = rng.uniform(0.7, 1.1); yv = GH - 0.25
            acc('corr_' + col).quad([(bx1, yv, zf), (bx0, yv, zf), (bx0, yv - 0.25, zf - d), (bx1, yv - 0.25, zf - d)])
            acc('corr_' + col).quad([(bx0, yv - 0.04, zf), (bx1, yv - 0.04, zf), (bx1, yv - 0.29, zf - d), (bx0, yv - 0.29, zf - d)])
    # 側面、背面（相鄰的比較矮時看得到）、屋頂
    box(side, x0, x0 + 0.2, 0, H, zf, zb); box(side, x1 - 0.2, x1, 0, H, zf, zb); box(side, x0, x1, 0, H, zb - 0.2, zb)
    roofk = 'roof_g' if rng.random() < 0.3 else 'roof'; box(roofk, x0, x1, H - 0.2, H, zf, zb)
    # 女兒牆（1.0 m）：正面那一道照立面的磁磚顏色（貼圖集最上面那一條的上緣）
    pk = side; box(pk, x0, x1, H, H + 1.0, zf, zf + 0.18); box(pk, x0, x0 + 0.18, H, H + 1.0, zf, zb); box(pk, x1 - 0.18, x1, H, H + 1.0, zf, zb); box(pk, x0, x1, H, H + 1.0, zb - 0.18, zb)
    box('conc', x0 - 0.02, x1 + 0.02, H + 1.0, H + 1.08, zf - 0.04, zf + 0.22)
    # 屋頂上的東西：樓梯間、頂樓加蓋、水塔、天線、太陽能熱水器、盆栽、曬衣架
    yR = H; used = []
    if W > 4.2 and rng.random() < 0.62:   # 頂樓加蓋
        sx0, sx1 = x0 + rng.uniform(0.3, 0.7), x1 - rng.uniform(0.3, 0.7); sz0 = zf + rng.uniform(1.6, 3.4); sz1 = zb - rng.uniform(0.4, 1.4)
        h = shed(sx0, sx1, yR, sz0, sz1, rng); used.append('shed')
        if rng.random() < 0.65: water_tank(rng.uniform(sx0 + 0.9, sx1 - 0.9), yR + h + 0.1, rng.uniform(sz0 + 2.0, sz1 - 1.0), rng)   # 水塔放在鐵皮屋頂上
        if rng.random() < 0.6: plant(x0 + 0.5, yR, zf + 0.6, rng); plant(x0 + 1.15, yR, zf + 0.55, rng, 0.8)
        if rng.random() < 0.5: antenna(rng.uniform(sx0, sx1), yR + h + 0.1, sz1 - 0.6, rng)
    else:   # 沒有加蓋：樓梯間＋水塔、空的屋頂（曬衣服、盆栽、太陽能）
        sw, sd = min(2.6, W - 1.0), 3.2; sxa = x0 + 0.4 if rng.random() < 0.5 else x1 - 0.4 - sw; sza = zb - 0.4 - sd
        box('conc', sxa, sxa + sw, yR, yR + 2.7, sza, sza + sd); box('conc_d', sxa - 0.1, sxa + sw + 0.1, yR + 2.7, yR + 2.85, sza - 0.1, sza + sd + 0.1)
        box('door', sxa + 0.4, sxa + 1.3, yR, yR + 2.1, sza - 0.02, sza)
        for k in range(rng.randint(1, 2)): water_tank(sxa + sw * (0.3 + 0.4 * k), yR + 2.85, sza + sd / 2, rng)
        if rng.random() < 0.55: laundry(x0 + 0.8, min(x1 - 0.8, x0 + rng.uniform(3, 5)), yR + 1.75, zf + rng.uniform(2.2, 4.5), rng)
        if rng.random() < 0.35: solar_heater(rng.uniform(x0 + 1.4, x1 - 1.4), yR, zf + rng.uniform(4.5, 7.0), rng)
        for k in range(rng.randint(2, 5)): plant(rng.uniform(x0 + 0.5, x1 - 0.5), yR, zf + rng.uniform(0.5, 1.2), rng, rng.uniform(0.7, 1.1))
        if rng.random() < 0.5: antenna(sxa + sw * 0.5, yR + 2.85, sza + 0.5, rng)
    if rng.random() < 0.6: ac_unit(rng.uniform(x0 + 0.8, x1 - 0.8), yR + 1.1, zf + 0.3)   # 女兒牆上的冷氣
    # 立面的落水管（靠邊）
    if rng.random() < 0.6: cyl('frame', (x0 + 0.35, 0.3, zf - 0.12), (x0 + 0.35, H + 0.9, zf - 0.12), 0.05, seg=6)
    return H


def apartment_block(x0, x1, zf, depth, floors, rng, tower=False):
    """第二、三排的大樓：立面照貼圖集一格一格貼（每格 6 m、四層）；屋頂有機房、水塔"""
    H = floors * 3.1; W = x1 - x0; zb = zf + depth
    cells = [(2, 1), (3, 1), (2, 0)] if tower else WALKUP_CELLS + [(3, 1)]
    c, r = rng.choice(cells); n = max(1, round(W / 6.0)); cw = W / n
    for f in range(floors):
        k = 3 - (f % 4); y0 = f * 3.1
        for i in range(n): FACADE.rect((x1 - i * cw, y0, zf - 0.006), NORTH_R, UP, cw, 3.1, cell_uv(c, r, k, k + 1))
    side = rng.choice(SIDE_KEYS)
    box(side, x0, x0 + 0.3, 0, H, zf, zb); box(side, x1 - 0.3, x1, 0, H, zf, zb); box('roof', x0, x1, H - 0.3, H, zf, zb)
    box(side, x0, x1, H, H + 1.1, zf, zf + 0.2); box(side, x0, x0 + 0.2, H, H + 1.1, zf, zb); box(side, x1 - 0.2, x1, H, H + 1.1, zf, zb)
    mx = rng.uniform(x0 + 2, max(x0 + 2.1, x1 - 6)); mz = rng.uniform(zf + 3, max(zf + 3.1, zb - 7))
    box('conc', mx, mx + 4.0, H, H + 3.2, mz, mz + 5.0); box('conc_d', mx - 0.15, mx + 4.15, H + 3.2, H + 3.4, mz - 0.15, mz + 5.15)   # 電梯機房
    for k in range(rng.randint(1, 3)): water_tank(mx + 0.9 + k * 1.4, H + 3.4, mz + 2.5, rng, big=True)
    if rng.random() < 0.5: antenna(mx + 3.5, H + 3.4, mz + 4.2, rng)
    if tower and rng.random() < 0.5: box('frame', x0 + 1, x1 - 1, H + 1.1, H + 2.6, zf + 0.2, zf + 0.35)   # 頂上的招牌框（空的，沒有字）
    return H


# ---------------- 場景 ----------------
rng = random.Random(75)
# 地面：宿舍後面的草地、小路、圍牆、人行道、巷子、對面騎樓前的地
acc('grass').box(-140, 180, -0.02, 0.0, 75, 104)
acc('path').box(-140, 180, 0.0, 0.03, 86.0, 87.6)                         # 宿舍後面的水泥小路
acc('conc').box(-140, 180, 0, 0.55, 104.0, 104.3)                          # 圍牆（矮牆）
for x in [-140 + k * 0.16 for k in range(int(320 / 0.16))]: box('iron', x, x + 0.025, 0.55, 2.05, 104.13, 104.17)   # 鐵欄杆
for y in (0.7, 1.95): box('iron', -140, 180, y, y + 0.05, 104.11, 104.19)
for x in range(-140, 181, 3): box('conc', x - 0.15, x + 0.15, 0, 2.15, 104.0, 104.3)   # 每 3 m 一根柱子
acc('sidewalk').box(-140, 180, 0.0, 0.12, 104.3, 106.3)
box('conc_d', -140, 180, 0, 0.14, 106.2, 106.35)                          # 路緣
acc('asphalt').box(-140, 180, -0.02, 0.0, 106.35, 113.6)
box('line_r', -140, 180, 0.0, 0.006, 106.45, 106.6)                       # 紅線（不准停車）
box('line_w', -140, 180, 0.0, 0.006, 112.9, 113.02)                       # 對面的白色邊線
for x in range(-120, 180, 23): cyl('dark', (x + 0.5, 0.0, 109.8), (x + 0.5, 0.012, 109.8), 0.38, seg=16)   # 人孔蓋
acc('path').box(-140, 180, 0.0, 0.08, 113.6, 114.3)                       # 對面房子前面的地
acc('path').box(-900, 900, -0.03, 0.0, 128, 1600)                         # 遠處的地面（房子底下、巷子）
# 對面第一排公寓（x −62～108）：一棟 5～8 m，三～五層（四層最多）
def walkup_row(xa, xb, zf0, zj, wts, rng, row=1):
    x = xa; out = []
    while x < xb:
        w = rng.choice([5.2, 5.6, 6.0, 6.4, 7.0, 7.6]); fl = rng.choices([3, 4, 5, 6], wts)[0]
        gap = 0.9 if rng.random() < 0.18 else 0.0                           # 防火巷
        out.append((x, x + w, fl)); walkup(x, x + w, zf0 + rng.uniform(0, zj), rng.uniform(12.5, 16.0), fl, rng, row=row); x += w + gap
    return out
lots = walkup_row(-62.0, 108.0, 114.3, 0.0, [2, 6, 2, 0], rng)
# 再後面：一片四～六層的老公寓（五樓看出去的「遠一點的屋頂」：水塔、鐵皮屋一路排到遠處）
for zf0, xa, xb, wts in ((134.0, -95.0, 140.0, [1, 5, 3, 1]), (153.0, -125.0, 170.0, [0, 4, 4, 2]), (172.0, -160.0, 205.0, [0, 3, 4, 3]), (191.0, -200.0, 245.0, [0, 2, 4, 4])):
    walkup_row(xa, xb, zf0, 2.5, wts, rng, row=2)
# 第二排：八～十二層的公寓大樓；第三排：十四～二十層的大樓（很遠）
x = -320.0
while x < 380:
    w = rng.uniform(16, 28); fl = rng.choice([8, 9, 10, 12]); zf = rng.uniform(240, 300); apartment_block(x, x + w, zf, rng.uniform(14, 18), fl, rng); x += w + rng.uniform(6, 24)
x = -700.0
while x < 800:
    w = rng.uniform(20, 34); fl = rng.choice([14, 16, 18, 20]); zf = rng.uniform(430, 700); apartment_block(x, x + w, zf, rng.uniform(16, 22), fl, rng, tower=True); x += w + rng.uniform(30, 90)
# 遠山：兩層稜線（前面綠一點、後面藍灰）
def ridge(key, z, h0, h1, seed, x0=-3500, x1=3500, n=140):
    rr = random.Random(seed); pts = []
    for i in range(n + 1):
        t = i / n; xx = x0 + (x1 - x0) * t
        hh = h0 + (h1 - h0) * (0.5 + 0.5 * math.sin(t * 7.3 + seed)) * (0.6 + 0.4 * math.sin(t * 23.1 + seed * 2)) + rr.uniform(-12, 12)
        pts.append((xx, max(20.0, hh)))
    m = acc(key)
    for (xa, ha), (xb, hb) in zip(pts[:-1], pts[1:]): m.quad([(xb, -5, z), (xa, -5, z), (xa, ha, z + 60), (xb, hb, z + 60)])
ridge('hill_a', 1700, 90, 260, 3); ridge('hill_b', 2600, 200, 480, 7)

# 樹、機車、路燈（本作的 Blender 模型，用 collection instance 擺）
def import_glb(fn, keep):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS, fn)); new = [o for o in bpy.data.objects if o not in before]
    out = {}
    for name, parts in keep.items():
        col = bpy.data.collections.new('src_' + name); sc.collection.children.link(col)
        for o in new:
            if o.type == 'MESH' and o.name.split('.')[0] in parts:
                for c in list(o.users_collection): c.objects.unlink(o)
                col.objects.link(o); o.parent = None; o.matrix_world = Matrix.Identity(4) if fn != 'street_props.glb' else Matrix.Identity(4)
        out[name] = col
    for o in new:   # 用不到的（遠景卡片、LOD、其他款）刪掉
        if not any(o.name in col.objects for col in out.values()):
            bpy.data.objects.remove(o, do_unlink=True)
    vl = bpy.context.view_layer.layer_collection
    for col in out.values(): vl.children[col.name].exclude = True
    return out


def place(col, x, y, z, ry=0.0, s=1.0):
    e = bpy.data.objects.new('i_' + col.name, None); e.instance_type = 'COLLECTION'; e.instance_collection = col; sc.collection.objects.link(e)
    e.location = g2b(x, y, z); e.rotation_euler = (0, 0, ry); e.scale = (s, s, s); return e


TREES = import_glb('street_trees.glb', {'camphor_a': ['camphor_a_bark', 'camphor_a_leaf'], 'camphor_b': ['camphor_b_bark', 'camphor_b_leaf']})
for m in bpy.data.materials:
    if m.name.startswith('tree_'):   # 葉片貼圖的透明：渲染用 Cycles（HASHED 的設定只影響 EEVEE）
        m.use_backface_culling = False
tx_ = [-6, 6.6, 20.5, 33.5] + [x for x in range(-66, 106, 10) if all(abs(x - a) > 5 for a in (-6, 6.6, 20.5, 33.5))]   # LAWWW2-C 量的四棵＋左右、中間補（約 10 m 一棵）
trng = random.Random(99)
for i, tx in enumerate(sorted(tx_)):
    place(TREES['camphor_a' if i % 3 != 1 else 'camphor_b'], tx + trng.uniform(-1.2, 1.2), 0, 99.0 + trng.uniform(-0.9, 0.9), trng.uniform(0, 2 * PI), trng.uniform(0.8, 0.94))
SCOOT = import_glb('scooter.glb', {k: ['scooter_' + k] for k in ('S1A', 'S1B', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S9')})
for k, col in SCOOT.items():
    for o in col.objects: o.location = (0, 0, 0)
srng = random.Random(7); x = -55.0
while x < 100:
    if srng.random() < 0.7: place(SCOOT[srng.choice(list(SCOOT))], x, 0, 113.0 + srng.uniform(-0.1, 0.2), PI / 2 + srng.uniform(-0.35, 0.35))   # 斜斜地停在對面房子前面
    x += srng.uniform(0.8, 1.5) if srng.random() < 0.75 else srng.uniform(3, 7)
PROPS = import_glb('street_props.glb', {'lamp': ['lamp_post', 'lamp_post_lens']})
for o in PROPS['lamp'].objects:
    o.location = (0, 0, 0)
    for sl in o.material_slots:
        if sl.material and 'lens' in sl.material.name: sl.material = MAT['lamp_lens']
LAMPS = []
for lx in range(-50, 101, 26):   # 巷子的路燈：人行道上、燈臂往巷子（+z）
    place(PROPS['lamp'], lx, 0.12, 105.0, 0.0); LAMPS.append((lx, 3.95 + 0.12, 105.75))
for lx in (-1.0, 27.0):         # 宿舍後面小路的路燈（晚上照亮樹靠宿舍這一面）
    place(PROPS['lamp'], lx, 0.03, 88.2, PI); LAMPS.append((lx, 3.98, 87.45))

for key, m in list(ACC.items()): m.finish()
FACADE.finish(); SHOP.finish()


# ---------------- 光、天空、鏡頭 ----------------
def sun_vec(az_deg, el_deg):
    """太陽的方向（Blender 座標：x 東、y 北、z 上）；az＝羅盤方位（北 0、東 90）"""
    a, e = math.radians(az_deg), math.radians(el_deg); return Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), math.sin(e)))


world = bpy.data.worlds.new('bv_world'); sc.world = world; world.use_nodes = True; WN = world.node_tree.nodes; WL = world.node_tree.links
bg = WN['Background']; sky = WN.new('ShaderNodeTexSky'); sky.sky_type = 'HOSEK_WILKIE'; sky.turbidity = TURB; sky.ground_albedo = 0.3
# 晚上的天空：方向的 z（上）→ 漸層（地平線有城市的光、往上變深藍）
tc = WN.new('ShaderNodeTexCoord'); sep = WN.new('ShaderNodeSeparateXYZ'); WL.new(tc.outputs['Generated'], sep.inputs[0])
ramp = WN.new('ShaderNodeValToRGB'); WL.new(sep.outputs['Z'], ramp.inputs['Fac']); E_ = ramp.color_ramp.elements
E_[0].position = 0.0; E_[0].color = (*lin('#4a3f44'), 1); E_[1].position = 0.32; E_[1].color = (*lin('#0b1024'), 1); e2 = E_.new(0.08); e2.color = (*lin('#22243a'), 1)
sun = bpy.data.objects.new('bv_sun', bpy.data.lights.new('bv_sun', 'SUN')); sc.collection.objects.link(sun); sun.data.angle = math.radians(1.2)
pts = []
for i, (lx, ly, lz) in enumerate(LAMPS):
    lt = bpy.data.objects.new('bv_lamp%d' % i, bpy.data.lights.new('bv_lamp%d' % i, 'POINT')); lt.location = g2b(lx, ly - 0.15, lz); sc.collection.objects.link(lt)
    lt.data.shadow_soft_size = 0.15; lt.data.color = (1.0, 0.78, 0.5); pts.append(lt)
cam = bpy.data.objects.new('bv_cam', bpy.data.cameras.new('bv_cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.angle = math.radians(90.0); cam.data.clip_start = 0.1; cam.data.clip_end = 6000
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 64
if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
try: sc.view_settings.view_transform = VIEW
except Exception as e: print('view transform', e)
try: sc.view_settings.look = LOOK
except Exception as e: print('look', e)
tmp = os.path.join(OUTDIR if not PNG else PNG, '_tmp_render.png') if not PNG else None


def set_time(t):
    night = t == 'night'
    for lk in list(bg.inputs['Color'].links): world.node_tree.links.remove(lk)
    if night:
        WL.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.55
        sun.data.energy = 0.06; sun.data.color = (0.7, 0.78, 1.0); sun.rotation_euler = (-sun_vec(200, 40)).to_track_quat('-Z', 'Y').to_euler()   # 月光
        for lt in pts: lt.data.energy = 420
        sc.view_settings.exposure = 0.6
    else:
        WL.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = SKY_S
        sv = sun_vec(*SUN); sky.sun_direction = sv; sun.data.energy = SUN_E; sun.data.color = (1.0, 0.97, 0.92)
        sun.rotation_euler = (-sv).to_track_quat('-Z', 'Y').to_euler()
        for lt in pts: lt.data.energy = 0.0
        sc.view_settings.exposure = EXPO
    for m in bpy.data.materials:   # 晚上才亮：立面的窗、店面、路燈燈罩、鐵皮屋的窗
        bs = m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
        if not bs: continue
        if m.name == 'bv_facade': bs.inputs['Emission Strength'].default_value = 2.6 if night else 0.0
        elif m.name == 'bv_shop':
            if not bs.inputs['Emission Color'].links:
                tx = next(n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE'); m.node_tree.links.new(tx.outputs['Color'], bs.inputs['Emission Color'])
            bs.inputs['Emission Strength'].default_value = 1.5 if night else 0.0
        elif m.name in NIGHT_MATS:
            col, s = NIGHT_MATS[m.name]; bs.inputs['Emission Color'].default_value = (*lin(col), 1); bs.inputs['Emission Strength'].default_value = s if night else 0.0


os.makedirs(OUTDIR, exist_ok=True)
info = {}
for t in TIMES:
    set_time(t)
    for room in ONLY:
        cx, cy = ROOMS[room]; cam.location = g2b(cx, cy, CAM_Z); P_ = math.radians(PITCH); cam.rotation_euler = (g2b(0, math.sin(P_), math.cos(P_)) - g2b(0, 0, 0)).to_track_quat('-Z', 'Y').to_euler()   # 往南（+z）、往上 PITCH 度（見檔頭）
        png = os.path.join(PNG, 'dorm_room%s_%s.png' % (room, t)) if PNG else os.path.join(OUTDIR, '_bv_%s_%s.png' % (room, t))
        if PNG: os.makedirs(PNG, exist_ok=True)
        sc.render.filepath = png; bpy.ops.render.render(write_still=True)
        out = os.path.join(OUTDIR, 'dorm_room%s_%s.webp' % (room, t)); Image.open(png).convert('RGB').save(out, 'WEBP', quality=80, method=6)
        if not PNG: os.remove(png)
        info['%s_%s' % (room, t)] = {'webp': os.path.relpath(out, L.ROOT), 'bytes': os.path.getsize(out), 'cam': [cx, cy, CAM_Z]}
        print('wrote', os.path.relpath(out, L.ROOT), os.path.getsize(out), flush=True)
print(json.dumps({'samples': SAMPLES, 'res': [RW, RH], 'lots_row1': len(lots), 'out': info}, ensure_ascii=False))
