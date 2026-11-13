"""林家乾麵（溫州街 A4，zone id wz_lin；AA_654）室內 v1c → GLB。BB（帳號 A）2026-11-04。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/lin_interior.py [-- --out <glb>] [--preview]
  要在美術線的 worktree 跑（lib2.py、b3lib.py）；配置用 node 讀 src/data/lin_layout.js（Blender 和遊戲同一份數字）。
照 SCENE_RULES 第 11、12 節：參考圖 docs/story_planning/ref_images/shops/wz_lin_int.webp 就是規格；拆圖清單在 docs/story_planning/bb_models/lin/README.md。
房間、門窗、出口、出生點照 claude/confident-ritchie-8rwh7t 的 wz_shops_layout.js 的 lin（LAWWW2：不動）。外觀（雨遮、招牌、攤車朝街那一面）是 LAWWW2 的。
做法：磨石子地、天花板、米白牆、木頭、不鏽鋼是 PIL＋numpy 自己畫的貼圖（lin_tex.py）；招牌、紅紙菜單（照室內圖，AA_654 第 4 節）、月曆、時鐘、
  玻璃磚窗、白磁磚在一張印刷圖集；碗、凳子、醬料瓶用亮面頂點色；材質 12 個以內。
v2（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 11-13）：木頭、塑膠、陶碗、紙箱、灰泥、磁磚改用 ambientCG CC0 材質組，
  頂點色零件照顏色分到材質組（cc0kit.RCMesh：route 表）；盆栽、塑膠籃、紙箱、清潔劑、時鐘換 Poly Haven 掃描模型（cc0kit.Kit.ph_put）。互動點、座位、導航都沒動。
--preview：正面開口外面加一張街景卡片（只給渲染用，正式 GLB 裡沒有）。
D77：沒有真實品牌；D112：地板是淺色磨石子，不是深色木頭；金屬度 ≤ 0.45；天花板單面朝下。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import lin_tex as TX   # noqa: E402
import cc0kit as KK   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = '--preview' in ARGS
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/lin_interior.glb')
GEN = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/lin'); os.makedirs(GEN, exist_ok=True)
LAY = os.path.join(L.ROOT, 'src/data/lin_layout.js')
S = json.loads(subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require({json.dumps(LAY)})))"]))
PI = math.pi
W, D, H = S['w'], S['d'], S['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
R = random.Random(654)
B.reset(texres=1024)
root = B.group('lin_interior', props={'kind': 'lin_interior', 'layout': 'src/data/lin_layout.js', 'w': W, 'd': D, 'h': H})
G = {s: B.group(f'WALL_{s}', root, props={'dir': DIRS[s]}) for s in DIRS}
P = TX.build_all(GEN, S['menu']['items']); C = TX.CELLS; SC = TX.SC


# ================= 材質（12 個） =================
def img_mat(name, path, rough=0.6, metal=0.0, emit=0.0, rough_img=None, cull=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    if rough_img:
        tr = nt.nodes.new('ShaderNodeTexImage'); tr.image = bpy.data.images.load(rough_img, check_existing=True); tr.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(tr.outputs['Color'], b.inputs['Roughness'])
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    m.use_backface_culling = cull; m['tile'] = 1.0
    return m


M = dict(
    floor=img_mat('lin_floor', P['floor'], rough=0.35, rough_img=P['floor'].replace('.png', '_rough.png')),
    ceil=img_mat('lin_ceiling', P['ceil'], rough=0.95, cull=True),
    wall=img_mat('lin_wall', P['wall'], rough=0.85),
    wood=img_mat('lin_wood', P['wood'], rough=0.45),
    print=img_mat('lin_print', P['prints'], rough=0.6),
    steel=img_mat('lin_steel', P['steel'], rough=0.3, metal=0.45),
    vc=L.vc_material('lin_vc', rough=0.55),
    vm=L.vc_metal('lin_vc_metal', rough=0.35, metal=0.45),
    glass=L.flat('lin_glass', '#e4ecee', rough=0.03, alpha=0.08),
    gloss=L.vc_material('lin_vc_gloss', rough=0.28),   # 瓷碗、塑膠凳、醬料瓶（亮面）
    warm=L.flat('GLOW_lin_warm', '#ffe2b0', rough=0.4, emit=tuple(v * 9.0 for v in B.srgb('#ffb460'))),
    screen=img_mat('GLOW_lin_screen', P['screen'], rough=0.2, emit=1.6),
    steam=img_mat('lin_steam', P['steam'], rough=1.0),
)
M['steam'].node_tree.links.new(M['steam'].node_tree.nodes['Image Texture'].outputs['Alpha'], M['steam'].node_tree.nodes['Principled BSDF'].inputs['Alpha'])
try: M['steam'].surface_render_method = 'BLENDED'
except Exception: pass
K = KK.Kit(root, 'lin')
M.update(   # v2：CC0 材質組（ambientCG；target＝原本的顏色）
    wood=K.acg('woodgrain', 'Wood049', target='#a97b4f', tile=1.0, rough_value=0.45),
    blackmetal=K.acg('blackmetal', 'Metal009', maps=('diff',), target='#3c3e40', tile=0.7, metal=0.3, rough_value=0.45, res=256),
    wood_d=K.acg('wood_d', 'Wood049', maps=('diff',), target='#4a3424', tile=0.6, rough_value=0.5, res=256),
    wood_l=K.acg('wood_l', 'Bamboo001C', maps=('diff',), target='#d8b880', tile=0.3, rough_value=0.6, res=256),
    plaster=K.acg('plaster', 'Plaster001', maps=('diff',), vary=0.04, target='#e8dfc8', tile=2.0, rough_value=0.9, res=256),
    tile=K.acg('tile', 'Tiles036', target='#efede5', tile=0.6, rough_value=0.3),
    plastic_w=K.acg('plastic_w', 'Plastic006', vary=0.05, target='#ecebe6', tile=0.5, rough_value=0.45),
    plastic_dk=K.acg('plastic_dk', 'Plastic006', vary=0.05, maps=('diff',), target='#2a2c2e', tile=0.5, rough_value=0.45, res=256),
    plastic_red=K.acg('plastic_red', 'Plastic006', vary=0.05, maps=('diff',), target='#c23a30', tile=0.5, rough_value=0.4, res=256),
    plastic_blue=K.acg('plastic_blue', 'Plastic006', vary=0.05, maps=('diff',), target='#2a5aa8', tile=0.5, rough_value=0.4, res=256),
    plastic_yel=K.acg('plastic_yel', 'Plastic006', vary=0.05, maps=('diff',), target='#e8c030', tile=0.5, rough_value=0.4, res=256),
    stool=K.acg('stool', 'Plastic006', vary=0.05, target='#b8424a', tile=0.4, rough_value=0.3),
    ceramic=K.acg('ceramic', 'Plastic006', vary=0.03, target='#f3f1ea', tile=0.3, rough_value=0.22),
    ceramic_b=K.acg('ceramic_b', 'Plastic006', vary=0.03, maps=('diff',), target='#3a6ab0', tile=0.3, rough_value=0.22, res=256),
    cardboard=K.acg('cardboard', 'Cardboard001', tile=0.6, rough_value=0.85),
    paper=K.acg('paper', 'Paper001', maps=('diff',), vary=0.05, target='#f6f5f0', tile=0.3, rough_value=0.8, res=256),
    wicker=K.acg('wicker', 'Wicker010A', target='#c9a060', tile=0.3, rough_value=0.7),
)
M['wall_b'] = M['wall']   # 牆的外殼、正面牆：和貼圖牆同一個材質，但要 box UV（另一個網格）
# 頂點色零件照顏色分到材質組（表上沒有的：食物、醬料瓶這些小東西照舊頂點色）
ROUTE = {'#eeeae2': 'plastic_w', '#e6dcc4': 'plaster', '#3a3a38': 'blackmetal', '#c8c4b0': 'steel', '#e8e4dc': 'plastic_w', '#c8a060': 'wicker',
         '#5a5e60': 'blackmetal', '#3a3e40': 'blackmetal', '#f2e8d0': 'plaster', '#efede5': 'tile', '#6a6e70': 'blackmetal', '#2a5aa8': 'plastic_blue',
         '#e8c030': 'plastic_yel', '#c83a2a': 'plastic_red', '#c83a3a': 'plastic_red', '#c8a070': 'cardboard', '#f8f8f4': 'paper', '#3a2a1e': 'wood_d',
         '#2a2c2e': 'plastic_dk', '#1e2022': 'plastic_dk', '#f2f0ea': 'ceramic', '#f4f2ec': 'ceramic', '#eef2f6': 'ceramic', '#e8eef4': 'ceramic', '#f0ece0': 'ceramic',
         '#3a6ab0': 'ceramic_b', '#b8424a': 'stool', '#d8b880': 'wood_l', '#e8e6e0': 'plastic_w', '#d8dcdf': 'plastic_w', '#cfd4d8': 'plastic_w',
         '#ece2cc': 'wall_b', '#d8ccb0': 'wall_b', '#8a8e90': 'steel', '#6a4428': 'wood_d'}
ROUTE_M = {'#c8ccce': 'steel', '#9a9ea2': 'steel', '#b8bcbe': 'steel', '#a8acae': 'steel', '#c8c8c0': 'steel', '#c4c8ca': 'steel', '#9a9ea0': 'steel',
           '#5a5e5a': 'blackmetal', '#6a4a2a': 'wood_d', '#7a5a3a': 'wood_d'}
TM = {}
def tm(k):
    if k == 'steel': return ST
    if k == 'wood': return WD
    if k not in TM: TM[k] = Mesh(f'lin_{k}', M[k])
    return TM[k]
STM = Mesh('lin_steam', M['steam'])
M['wood']['tile'] = 1.0; M['steel']['tile'] = 0.7
VC = KK.RCMesh('lin_vc', M['vc'], ROUTE, tm); VM = KK.RCMesh('lin_vm', M['vm'], dict(ROUTE, **ROUTE_M), tm)
WD = Mesh('lin_wood', M['wood']); ST = Mesh('lin_steel', M['steel']); PR = Mesh('lin_prints', M['print'])
GLS = Mesh('lin_glass', M['glass']); GL = KK.RCMesh('lin_gloss', M['gloss'], ROUTE, tm); WARM = Mesh('lin_warm', M['warm']); SCR = Mesh('lin_screens', M['screen'])
GLSF = Mesh('GLASS_front', M['glass'])   # 正面的玻璃：不放進淡出群組（玻璃規則），分開一個物件，鏡頭在店外時可以單獨藏
WG = {}
WARMM = WARM


def wg(side, key):
    if (side, key) not in WG: WG[(side, key)] = (KK.RCMesh(f'WALL_{side}_{key}', M[key], dict(ROUTE, **ROUTE_M), lambda k, s_=side: wg(s_, k)) if key in ('vc', 'vm') else Mesh(f'WALL_{side}_{key}', M[key]))
    return WG[(side, key)]


def nf(m, before): return [f for f in m.bm.faces if f not in before]


def uvq(mesh, pts, rect):
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


NV = {'+x': (1, 0, 0), '-x': (-1, 0, 0), '+z': (0, 0, 1), '-z': (0, 0, -1), '+y': (0, 1, 0), '-y': (0, -1, 0)}


def face(mesh, c, n, w, h, rect, up=(0, 1, 0), two=False):
    nv = Vector(NV[n]); u = Vector(up); r = u.cross(nv); cx = Vector(c)
    pts = [cx - r * w / 2 - u * h / 2, cx + r * w / 2 - u * h / 2, cx + r * w / 2 + u * h / 2, cx - r * w / 2 + u * h / 2]
    f = uvq(mesh, [tuple(p) for p in pts], rect)
    if two:
        pts2 = [cx + r * w / 2 - u * h / 2, cx - r * w / 2 - u * h / 2, cx - r * w / 2 + u * h / 2, cx + r * w / 2 + u * h / 2]
        uvq(mesh, [tuple(p - nv * 0.004) for p in pts2], rect)
    return f


def sub(rect, a0, b0, a1, b1):
    u0, v0, u1, v1 = rect; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


def ccyl(m, a, b, r, col, seg=8, r2=None, caps=True):
    f0 = set(m.bm.faces); m.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return m.paint(nf(m, f0), col)


def clathe(m, prof, x, y, z, col, seg=12):
    f0 = set(m.bm.faces); m.add_bm(L.lathe(prof, seg=seg), Matrix.Translation(g2b(x, y, z))); fs = nf(m, f0)
    if col: m.paint(fs, col)
    return fs


def blob(m, c, r, col, seg=6, rings=4, sy=0.75):
    """隨機大小的小橢球"""
    f0 = set(m.bm.faces); m.ell(c, r, r * sy, r * R.uniform(0.8, 1.15), seg=seg, rings=rings); return m.paint(nf(m, f0), col)


def rot(x, z, yaw):
    f = (math.sin(yaw), math.cos(yaw)); r = (math.cos(yaw), -math.sin(yaw))
    return lambda lx, lz: (x + lx * r[0] + lz * f[0], z + lx * r[1] + lz * f[1])


def curved_back(m, x, z, yaw, y0, y1, rb, ang=50, t=0.018, seg=8, off=0.0):
    T = rot(x, z, yaw); bm = m.bm
    def P_(a, r, y):
        lx, lz = r * math.sin(a), -r * math.cos(a) - off; wx, wz = T(lx, lz); return bm.verts.new(g2b(wx, y, wz))
    A = [math.radians(-ang + 2 * ang * k / seg) for k in range(seg + 1)]
    O0 = [P_(a, rb, y0) for a in A]; O1 = [P_(a, rb, y1) for a in A]; I0 = [P_(a, rb - t, y0) for a in A]; I1 = [P_(a, rb - t, y1) for a in A]
    for k in range(seg):
        bm.faces.new((O0[k], O1[k], O1[k + 1], O0[k + 1])); bm.faces.new((I0[k + 1], I1[k + 1], I1[k], I0[k]))
        bm.faces.new((O1[k], I1[k], I1[k + 1], O1[k + 1])); bm.faces.new((O0[k + 1], I0[k + 1], I0[k], O0[k]))
    bm.faces.new((O0[0], I0[0], I1[0], O1[0])); bm.faces.new((O1[-1], I1[-1], I0[-1], O0[-1]))


def chair(x, z, yaw):
    """學生餐廳那種椅子：木座、彎的木椅背、銀色鋼管腳（參考圖）"""
    T = rot(x, z, yaw)
    WD.rbox(x - 0.2, x + 0.2, 0.44, 0.47, z - 0.2, z + 0.2, r=0.015, seg=2)
    curved_back(WD, x, z, yaw, 0.66, 0.86, 0.26, ang=40, t=0.02, off=-0.05)
    for lx, lz in ((-0.17, -0.17), (0.17, -0.17), (-0.17, 0.17), (0.17, 0.17)):
        a_ = T(lx, lz); ccyl(VM, (a_[0], 0.0, a_[1]), (a_[0], 0.44, a_[1]), 0.012, '#a8acae', seg=5)
    for lx in (-0.16, 0.16):
        a_ = T(lx, -0.2); ccyl(VM, (a_[0], 0.47, a_[1]), (a_[0], 0.86, a_[1]), 0.011, '#a8acae', seg=5)



WALLC = '#ece2cc'; TILEC = '#efede5'; STEELC = '#c4c8ca'; RED = '#b0281e'


def chair_wood(x, z, yaw):
    """木頭椅（參考圖：直條椅背、四根木腳、橫檔）"""
    T = rot(x, z, yaw)
    WD.rbox(x - 0.2, x + 0.2, 0.44, 0.47, z - 0.2, z + 0.2, r=0.01, seg=1)
    for lx, lz in ((-0.17, -0.17), (0.17, -0.17), (-0.17, 0.17), (0.17, 0.17)):
        a_ = T(lx, lz); WD.box(a_[0] - 0.018, a_[0] + 0.018, 0, 0.44, a_[1] - 0.018, a_[1] + 0.018)
    bx0, bz0 = T(-0.17, -0.19); bx1, bz1 = T(0.17, -0.19)
    for (px, pz) in ((bx0, bz0), (bx1, bz1)): WD.box(px - 0.018, px + 0.018, 0.47, 0.9, pz - 0.018, pz + 0.018)
    for y in (0.84, 0.62):   # 椅背的兩條橫木
        a0, a1 = T(-0.17, -0.19), T(0.17, -0.19); WD.box(min(a0[0], a1[0]) - 0.015, max(a0[0], a1[0]) + 0.015, y, y + 0.05, min(a0[1], a1[1]) - 0.012, max(a0[1], a1[1]) + 0.012)
    for k in range(3):   # 直條
        p_ = T(-0.09 + k * 0.09, -0.19); WD.box(p_[0] - 0.012, p_[0] + 0.012, 0.67, 0.84, p_[1] - 0.008, p_[1] + 0.008)
    for lz in (-0.17, 0.17):   # 橫檔
        a0, a1 = T(-0.17, lz), T(0.17, lz); WD.box(min(a0[0], a1[0]), max(a0[0], a1[0]), 0.16, 0.19, min(a0[1], a1[1]) - 0.01, max(a0[1], a1[1]) + 0.01)


def red_stool(x, z):
    """紅色塑膠凳（上窄下寬的方殼，台灣小吃店）"""
    clathe(GL, [(0.0, 0.03), (0.19, 0.0), (0.185, 0.02), (0.145, 0.42), (0.16, 0.43), (0.162, 0.45), (0.0, 0.46)], x, 0, z, '#b8424a', seg=14)   # 圓的紅色塑膠凳（上窄下寬）
    clathe(GL, [(0.0, 0.461), (0.03, 0.461), (0.03, 0.462), (0.0, 0.462)], x, 0, z, '#6a1418', seg=8)


# ================= 地板、天花板、燈、管線 =================
fl = Mesh('FLOOR', M['floor']); uvq(fl, [(X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0)], (0, 0, W / 2.0, D / 2.0)); fl.finish(root, uv=False)
ce = Mesh('CEILING', M['ceil']); uvq(ce, [(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)], (0, D / 2.4, W / 2.4, 0)); ce.finish(root, uv=False)   # 單面朝下
for z in (2.4, 0.5, -1.4):   # 日光燈管（沿 x，參考圖是橫的）
    for x0_, x1_ in ((-1.9, -0.2), (0.4, 2.1)):
        VC.cbox(x0_, x1_, H - 0.06, H, z - 0.08, z + 0.08, '#eeeae2'); face(SCR, ((x0_ + x1_) / 2, H - 0.062, z), '-y', x1_ - x0_ - 0.06, 0.06, SC['tube'], up=(0, 0, 1))
VC.cbox(X0, X1, H - 0.28, H, 1.45, 1.75, '#e6dcc4')   # 天花板下的大樑
for (a, b, y, z) in ((X0 + 0.1, X1 - 0.1, H - 0.08, Z0 + 0.12), (X0 + 0.1, X1 - 0.1, H - 0.14, Z0 + 0.18)):   # 後牆上緣的管線
    ccyl(VM, (a, y, z), (b, y, z), 0.025, '#c8c8c0', seg=6)
ccyl(VM, (X1 - 0.12, H - 0.1, Z0 + 0.2), (X1 - 0.12, H - 0.1, 1.4), 0.025, '#c8c8c0', seg=6); ccyl(VM, (X1 - 0.12, 0.2, -2.5), (X1 - 0.12, H - 0.1, -2.5), 0.02, '#c8c8c0', seg=6)

# ================= 牆 =================
def wall_tex(side, a0, a1, y0, y1):
    m = wg(side, 'wall')
    def pt(a, y):
        if side == 'left': return (X0, y, Z1 - a)
        if side == 'right': return (X1, y, Z0 + a)
        if side == 'back': return (X0 + a, y, Z0)
        return (X1 - a, y, Z1)
    uvq(m, [pt(a0, y0), pt(a1, y0), pt(a1, y1), pt(a0, y1)], (a0 / 2.0, y0 / 3.0, a1 / 2.0, y1 / 3.0))


def tiles(side, a0, a1, y1, d=0.004):
    """白磁磚腰牆：每塊 0.6 × y1 的印刷格"""
    m = wg(side, 'print'); a = a0
    while a < a1 - 1e-6:
        b = min(a + 0.6, a1); f = (b - a) / 0.6
        if side == 'left': face(m, (X0 + d, y1 / 2, Z1 - (a + b) / 2), '+x', b - a, y1, sub(C['tile'], 0, 0, f, min(1, y1 / 0.6)))
        elif side == 'right': face(m, (X1 - d, y1 / 2, Z0 + (a + b) / 2), '-x', b - a, y1, sub(C['tile'], 0, 0, f, min(1, y1 / 0.6)))
        else: face(m, (X0 + (a + b) / 2, y1 / 2, Z0 + d), '+z', b - a, y1, sub(C['tile'], 0, 0, f, min(1, y1 / 0.6)))
        a = b


for m, box in ((wg('left', 'vc'), (X0 - 0.12, X0 - 0.005, Z0, Z1)), (wg('right', 'vc'), (X1 + 0.005, X1 + 0.12, Z0, Z1)), (wg('back', 'vc'), (X0, X1, Z0 - 0.12, Z0 - 0.005))): m.cbox(box[0], box[1], 0, H, box[2], box[3], '#d8ccb0')
wall_tex('left', 0, D, 1.6, H); wall_tex('right', 0, D, 1.25, H); wall_tex('back', 0, W, 1.25, H)
tiles('left', 0, D, 1.6); tiles('right', 0, D, 1.25); tiles('back', 0, W, 1.25)
FO = S['front']['open']; fr = wg('front', 'vc')
fr.cbox(X0 - 0.12, FO[0], 0, H, Z1, Z1 + 0.12, WALLC); fr.cbox(FO[1], X1 + 0.12, 0, H, Z1, Z1 + 0.12, WALLC); fr.cbox(FO[0], FO[1], 2.6, H, Z1, Z1 + 0.12, WALLC)
fr.cbox(FO[0], FO[1], 2.45, 2.6, Z1 - 0.12, Z1, '#8a8e90')   # 捲起來的鐵捲門
fm = wg('front', 'vm'); fm.cbox(FO[0] - 0.05, FO[0], 0, 2.6, Z1 - 0.08, Z1, '#9a9ea0'); fm.cbox(FO[1], FO[1] + 0.05, 0, 2.6, Z1 - 0.08, Z1, '#9a9ea0')   # 鐵捲門的軌道
gw = S['backWall']   # 後牆的玻璃磚窗（在矮牆後面）
face(wg('back', 'print'), (-0.1, 1.85, Z0 + 0.006), '+z', 1.8, 1.12, C['glassblock'])
for x in (-1.02, 0.82): wg('back', 'vm').cbox(x - 0.025, x + 0.025, 1.27, 2.43, Z0, Z0 + 0.05, '#5a5e5a')
for y in (1.27, 2.41): wg('back', 'vm').cbox(-1.02, 0.82, y - 0.02, y + 0.02, Z0, Z0 + 0.05, '#5a5e5a')
# 左牆：福、月曆（煮麵台後面那一段牆）
lp = wg('left', 'print')
face(wg('back', 'print'), (X0 + 0.32, 2.3, Z0 + 0.007), '+z', 0.46, 0.46, C['fu']); face(wg('back', 'print'), (X0 + 0.32, 1.62, Z0 + 0.007), '+z', 0.4, 0.56, C['calendar'])   # 福字斗方、月曆（後牆左邊，冰箱旁邊）
face(lp, (X0 + 0.006, 2.25, -2.6), '+x', 0.5, 0.5, C['fu'])

# ================= 左邊：不鏽鋼煮麵台＋抽油煙機＋招牌 =================
cl = S['cookLine']; cx1 = cl['x1']; ch_ = cl['h']
ST.box(cl['x0'], cx1, 0.08, ch_ - 0.03, cl['z0'], cl['z1']); VC.cbox(cl['x0'], cx1, 0, 0.08, cl['z0'], cl['z1'], '#3a3a38'); VM.cbox(cl['x0'], cx1 + 0.03, ch_ - 0.03, ch_, cl['z0'], cl['z1'], '#c8ccce')
for z in [cl['z0'] + k * 0.6 for k in range(1, 6)]: VM.cbox(cx1, cx1 + 0.01, 0.12, ch_ - 0.08, z - 0.005, z + 0.005, '#9a9ea2')   # 櫃門縫
for z in (cl['z0'] + 0.3, cl['z0'] + 1.5): VM.cbox(cx1 + 0.01, cx1 + 0.03, 0.55, 0.58, z - 0.15, z + 0.15, '#b8bcbe')   # 把手
VC.cbox(cx1 + 0.03, cx1 + 0.035, 0.3, 0.75, cl['z0'] + 1.0, cl['z0'] + 1.12, '#f4f2ec'); VC.cbox(cx1 + 0.031, cx1 + 0.036, 0.3, 0.75, cl['z0'] + 1.03, cl['z0'] + 1.05, '#c83a2a')   # 掛著的毛巾（紅線）
# 煮麵機（三格，熱水冒蒸氣）、大湯鍋、小鍋、麵杓
mz0, mz1 = 0.6, 1.9; ST.box(cl['x0'] + 0.05, cx1 - 0.02, ch_, ch_ + 0.16, mz0, mz1); VC.cbox(cl['x0'] + 0.1, cx1 - 0.06, ch_ + 0.16, ch_ + 0.165, mz0 + 0.05, mz1 - 0.05, '#c8c4b0')
for k in range(3):
    zc = mz0 + 0.22 + k * 0.42; clathe(VM, [(0.0, 0.0), (0.14, 0.0), (0.15, 0.06), (0.0, 0.06)], -2.82, ch_ + 0.16, zc, '#9a9ea2', seg=10)
    ccyl(VM, (-2.82, ch_ + 0.2, zc), (-2.45, ch_ + 0.42, zc), 0.01, '#6a4a2a', seg=5)   # 麵杓的木把手
clathe(VM, [(0.0, 0.0), (0.25, 0.0), (0.26, 0.02), (0.26, 0.42), (0.28, 0.43), (0.0, 0.43)], -2.82, ch_, 2.05, '#c8ccce', seg=16)   # 大湯鍋
ccyl(VM, (-3.1, ch_ + 0.38, 2.05), (-2.54, ch_ + 0.38, 2.05), 0.012, '#b8bcbe', seg=5)
clathe(VC, [(0.0, 0.0), (0.24, 0.0), (0.24, 0.02), (0.0, 0.02)], -2.82, ch_ + 0.425, 2.05, '#e8d8a8', seg=16)   # 湯（上面）
for z in (0.0, 0.3):   # 小鍋、滷味盤
    clathe(VM, [(0.0, 0.0), (0.12, 0.0), (0.13, 0.1), (0.0, 0.1)], -2.75, ch_, z, '#c8ccce', seg=12)
VM.cbox(-3.1, -2.5, ch_, ch_ + 0.04, -1.3, -0.4, '#c8ccce')
for k in range(12): blob(GL, (R.uniform(-3.0, -2.6), ch_ + 0.05, R.uniform(-1.25, -0.45)), 0.04, R.choice(['#8a5a2a', '#c8a060', '#6a3a1a']), seg=6, rings=4)   # 滷味（豆干、海帶、滷蛋）
# 上面兩層層架：碗疊、青菜籃、豆芽、生麵
for y in (1.35, 1.8):
    ST.box(X0, X0 + 0.42, y - 0.025, y, cl['z0'] + 0.2, cl['z1'] - 0.3)
    for z in (cl['z0'] + 0.25, cl['z1'] - 0.35): VM.cbox(X0 + 0.38, X0 + 0.4, y - 0.3, y, z - 0.01, z + 0.01, '#9a9ea2')
for k in range(9):
    z = cl['z0'] + 0.4 + k * 0.38; n = R.randint(5, 9); col = R.choice(['#f4f2ec', '#e8eef4', '#f0ece0'])
    for j in range(n): clathe(GL, [(0.0, 0.0), (0.05, 0.0), (0.085, 0.06), (0.0, 0.012)], X0 + 0.2, 1.8 + j * 0.028, z, col if j % 3 else '#3a6ab0', seg=10)
for k, (z, col) in enumerate(((-0.6, '#4e9a3a'), (0.2, '#f2eed8'), (1.0, '#e8d890'), (1.7, '#5a9a3a'))):   # 青菜籃、豆芽、生麵、蔥
    VC.cbox(X0 + 0.03, X0 + 0.38, 1.35, 1.47, z - 0.25, z + 0.25, '#e8e4dc')
    for j in range(10): blob(VC, (X0 + 0.2 + R.uniform(-0.12, 0.12), 1.5, z + R.uniform(-0.2, 0.2)), 0.05, col, seg=5, rings=3, sy=0.6)
for z in [cl['z0'] + 0.35 + k * 0.32 for k in range(10)]:   # 下層架子再擺：醬料瓶、罐子
    for j in range(2): clathe(GL, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.12), (0.018, 0.15), (0.0, 0.15)], X0 + 0.33, 1.35, z + j * 0.07, R.choice(['#c83a2a', '#e8c040', '#3a2a1a', '#e8e0d0', '#3a8a3a']), seg=6)
# 抽油煙機（往前傾）＋招牌
ST.box(X0, X0 + 0.95, 2.1, 2.55, cl['z0'] + 0.1, cl['z1'])
VC.cbox(X0 + 0.25, X0 + 0.93, 2.07, 2.1, cl['z0'] + 0.15, cl['z1'] - 0.05, '#5a5e60')
for k in range(10): VC.cbox(X0 + 0.28, X0 + 0.9, 2.065, 2.07, cl['z0'] + 0.25 + k * 0.33, cl['z0'] + 0.31 + k * 0.33, '#3a3e40')
WARM.box(X0 + 0.35, X0 + 0.85, 2.06, 2.065, 0.2, 1.0); WARM.box(X0 + 0.35, X0 + 0.85, 2.06, 2.065, 1.2, 2.0)   # 抽油煙機下的暖燈（加大）
VC.cbox(X0 + 0.95, X0 + 1.0, 2.55, 3.0, cl['z0'] + 0.3, cl['z1'] - 0.1, '#f2e8d0')
face(PR, (X0 + 1.002, 2.77, (cl['z0'] + cl['z1']) / 2 + 0.1), '+x', 1.7, 0.43, C['sign'])
# 攤車（店裡這一側）：檯面、湯鍋三格、碗疊；朝街上那一面是外觀
ca = S['cart']
ST.box(ca['x0'], ca['x1'], 0.1, ca['h'] - 0.03, ca['z0'], ca['z1']); VM.cbox(ca['x0'], ca['x1'], ca['h'] - 0.03, ca['h'], ca['z0'], ca['z1'], '#c8ccce')
CZ = ca['z0'] + 0.25   # 湯鍋往裡放，前緣留一條擺碗疊、麵杓架、調味罐
for k, (x, r_) in enumerate(((ca['x1'] - 0.3, 0.2), (ca['x1'] - 0.78, 0.19), (ca['x1'] - 1.22, 0.175))):   # 湯鍋三個（直徑含鍋緣 0.45／0.43／0.40 m、高 0.38）：鍋蓋、湯勺、湯
    clathe(VM, [(0.0, 0.0), (r_ - 0.01, 0.0), (r_, 0.02), (r_, 0.36), (r_ + 0.015, 0.37), (r_ + 0.01, 0.38), (0.0, 0.38)], x, ca['h'], CZ, '#c8ccce', seg=16)
    for sx in (-1, 1): ccyl(VM, (x + sx * r_, ca['h'] + 0.31, CZ), (x + sx * (r_ + 0.045), ca['h'] + 0.31, CZ), 0.01, '#9a9ea2', seg=5)
    if k == 1:   # 中間那鍋打開：湯、湯勺
        clathe(VC, [(0.0, 0.0), (r_ - 0.005, 0.0), (r_ - 0.005, 0.005), (0.0, 0.005)], x, ca['h'] + 0.35, CZ, '#e0c890', seg=16)
        ccyl(VM, (x + 0.05, ca['h'] + 0.28, CZ), (x + 0.2, ca['h'] + 0.62, CZ - 0.1), 0.01, '#b8bcbe', seg=5); clathe(VM, [(0.0, 0.0), (0.05, 0.0), (0.055, 0.04), (0.0, 0.01)], x + 0.04, ca['h'] + 0.28, CZ, '#b8bcbe', seg=10)
    else:   # 鍋蓋（把手）
        clathe(VM, [(0.0, 0.0), (r_ + 0.015, 0.0), (r_ * 0.6, 0.035), (0.03, 0.05), (0.03, 0.08), (0.0, 0.08)], x, ca['h'] + 0.38, CZ, '#b8bcbe', seg=16)
for k in range(3): ccyl(VM, (ca['x1'] - 1.45 + k * 0.08, ca['h'] + 0.02, ca['z0'] + 0.1), (ca['x1'] - 1.4 + k * 0.08, ca['h'] + 0.42, ca['z0'] + 0.25), 0.01, '#6a4a2a', seg=5)   # 麵杓（掛在鍋邊）
for k in range(3):   # 碗疊（白、藍邊）
    for j in range(R.randint(6, 10)): clathe(GL, [(0.0, 0.0), (0.05, 0.0), (0.085, 0.06), (0.0, 0.012)], ca['x0'] + 0.15 + k * 0.19, ca['h'] + j * 0.028, ca['z1'] - 0.16, '#f4f2ec' if j % 4 else '#3a6ab0', seg=10)
for k, col in enumerate(('#4e9a3a', '#f2eed8', '#e8d890')):   # 青菜籃、豆芽籃、麵條籃
    x = ca['x0'] + 0.75 + k * 0.28; z = ca['z1'] - 0.2
    VC.cbox(x - 0.12, x + 0.12, ca['h'], ca['h'] + 0.1, z - 0.12, z + 0.12, '#e8e4dc' if k < 2 else '#c8a060')
    for j in range(8): blob(VC, (x + R.uniform(-0.08, 0.08), ca['h'] + 0.12, z + R.uniform(-0.08, 0.08)), 0.045, col, seg=5, rings=3, sy=0.6)
for k in range(5): clathe(GL, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.12), (0.018, 0.15), (0.0, 0.15)], ca['x1'] - 1.35 + k * 0.07, ca['h'], ca['z1'] - 0.08, ['#c83a2a', '#e8c040', '#3a2a1a', '#e8e0d0', '#5a3a1a'][k], seg=8)   # 調味罐
# 前緣（靠鏡頭）擠滿：碗疊、麵杓架、調味罐、小碗、湯匙杯（「很多東西擠在一起」）
FZ_ = ca['z1'] - 0.11
x = ca['x1'] - 1.38
while x < ca['x1'] - 0.08:
    k = R.random()
    if k < 0.45:
        for j in range(R.randint(4, 8)): clathe(GL, [(0.0, 0.0), (0.04, 0.0), (0.07, 0.05), (0.0, 0.01)], x + 0.07, ca['h'] + j * 0.024, FZ_, '#f4f2ec' if j % 3 else '#3a6ab0', seg=10)
        x += 0.15
    elif k < 0.75:
        for j in range(3): clathe(GL, [(0.0, 0.0), (0.025, 0.0), (0.025, 0.1), (0.015, 0.13), (0.0, 0.13)], x + 0.03 + j * 0.055, ca['h'], FZ_ + (j % 2) * 0.04 - 0.02, R.choice(['#c83a2a', '#e8c040', '#3a2a1a', '#e8e0d0', '#5a3a1a']), seg=7)
        x += 0.18
    else:
        clathe(VM, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.12), (0.0, 0.12)], x + 0.05, ca['h'], FZ_, '#b8bcbe', seg=8)   # 湯匙杯
        for j in range(5): ccyl(VM, (x + 0.05, ca['h'] + 0.05, FZ_), (x + 0.03 + j * 0.01, ca['h'] + 0.2, FZ_ + (j - 2) * 0.012), 0.004, '#c8ccce', seg=3)
        x += 0.12
VM.cbox(ca['x1'] - 1.4, ca['x1'] - 0.1, ca['h'] + 0.48, ca['h'] + 0.5, ca['z1'] - 0.03, ca['z1'] - 0.01, '#9a9ea2')   # 麵杓架（橫桿＋掛著的麵杓、漏杓）
for x in (ca['x1'] - 1.4, ca['x1'] - 0.1): VM.cbox(x - 0.01, x + 0.01, ca['h'], ca['h'] + 0.5, ca['z1'] - 0.03, ca['z1'] - 0.01, '#9a9ea2')
for k in range(7):
    x = ca['x1'] - 1.3 + k * 0.18; ccyl(VM, (x, ca['h'] + 0.48, ca['z1'] - 0.02), (x, ca['h'] + 0.3, ca['z1'] - 0.02), 0.005, '#b8bcbe', seg=4)
    clathe(VM, [(0.0, 0.0), (0.04, 0.0), (0.045, 0.05), (0.0, 0.012)], x, ca['h'] + 0.25, ca['z1'] - 0.02, '#9a9ea2' if k % 2 else '#7a5a3a', seg=8)
# 攤車上的兩層不鏽鋼架（靠店裡那一邊），擺滿
for y in (ca['h'] + 0.6, ca['h'] + 1.0):
    ST.box(ca['x0'], ca['x0'] + 1.3, y - 0.02, y, ca['z0'], ca['z0'] + 0.32)
for x in (ca['x0'] + 0.02, ca['x0'] + 1.28):
    VM.cbox(x - 0.012, x + 0.012, ca['h'], ca['h'] + 1.0, ca['z0'] + 0.01, ca['z0'] + 0.04, '#9a9ea2')
for y in (ca['h'] + 0.6, ca['h'] + 1.0):
    x = ca['x0'] + 0.1
    while x < ca['x0'] + 1.2:
        k = R.random()
        if k < 0.5:
            for j in range(R.randint(5, 9)): clathe(GL, [(0.0, 0.0), (0.05, 0.0), (0.085, 0.06), (0.0, 0.012)], x + 0.04, y + j * 0.026, ca['z0'] + 0.16, R.choice(['#f4f2ec', '#eef2f6']), seg=10)
            x += 0.2
        else:
            for j in range(3): clathe(GL, [(0.0, 0.0), (0.025, 0.0), (0.025, 0.1), (0.015, 0.13), (0.0, 0.13)], x + j * 0.06, y, ca['z0'] + 0.16, R.choice(['#c83a2a', '#e8c040', '#3a2a1a', '#3a8a3a']), seg=6)
            x += 0.2
# 蒸氣卡（半透明，往上飄；兩面都貼）
for (x, w_, h_) in ((ca['x1'] - 0.78, 0.5, 0.85), (-2.82, 0.45, 0.8)):
    zc = CZ if x > -2.8 else 1.25
    face(STM, (x, ca['h'] + 0.36 + h_ / 2 if x > -2.8 else ch_ + 0.2 + h_ / 2, zc), '+z', w_, h_, (0, 0, 1, 1), two=True)
# ================= 桌椅、凳子、桌上 =================
for t in S['tables']:
    x, z = t['x'], t['z']
    WD.rbox(x - 0.4, x + 0.4, 0.73, 0.77, z - 0.375, z + 0.375, r=0.012, seg=2)
    for dx, dz in ((-0.34, -0.31), (0.34, -0.31), (-0.34, 0.31), (0.34, 0.31)): WD.box(x + dx - 0.025, x + dx + 0.025, 0, 0.73, z + dz - 0.025, z + dz + 0.025)
    for dz in (-0.31, 0.31): WD.box(x - 0.34, x + 0.34, 0.62, 0.68, z + dz - 0.012, z + dz + 0.012)
    chair_wood(x, z - 0.5, 0.0); chair_wood(x, z + 0.5, PI)
    sd = -0.6 if x < 0 else 0.6; red_stool(x + sd, z)
    clathe(VM, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.13), (0.0, 0.13)], x - 0.1, 0.77, z - 0.05, STEELC, seg=8)   # 筷子筒
    for k in range(8): ccyl(VC, (x - 0.1 + R.uniform(-0.02, 0.02), 0.8, z - 0.05 + R.uniform(-0.02, 0.02)), (x - 0.1 + R.uniform(-0.03, 0.03), 0.99, z - 0.05 + R.uniform(-0.03, 0.03)), 0.004, '#d8b880', seg=3)
    VC.cbox(x + 0.04, x + 0.24, 0.77, 0.85, z - 0.07, z + 0.07, '#f8f8f4'); face(PR, (x + 0.14, 0.81, z + 0.0705), '+z', 0.2, 0.08, sub(C['tissue'], 0, 0, 1, 0.8))
    for k, col in enumerate(('#b0281e', '#3a2a1a')): clathe(GL, [(0.0, 0.0), (0.025, 0.0), (0.025, 0.1), (0.015, 0.12), (0.0, 0.12)], x - 0.25 + k * 0.06, 0.77, z + 0.12, col, seg=8)

# ================= 後面：白磁磚矮牆、洗碗區、冰箱、碗盤架、箱子 =================
bw_ = S['backWall']
VC.cbox(bw_['x0'], bw_['x1'], 0, bw_['h'] - 0.04, bw_['z0'], bw_['z1'], TILEC); VM.cbox(bw_['x0'] - 0.03, bw_['x1'] + 0.03, bw_['h'] - 0.04, bw_['h'], bw_['z0'] - 0.03, bw_['z1'] + 0.03, '#c8ccce')
x = bw_['x0']
while x < bw_['x1'] - 1e-6:
    b = min(x + 0.6, bw_['x1']); face(PR, ((x + b) / 2, (bw_['h'] - 0.04) / 2, bw_['z1'] + 0.004), '+z', b - x, bw_['h'] - 0.04, sub(C['tile'], 0, 0, (b - x) / 0.6, 1)); x = b
ST.box(-1.2, 1.0, 0, 0.88, Z0 + 0.05, Z0 + 0.7)   # 洗碗槽檯
VC.cbox(-0.9, -0.2, 0.86, 0.885, Z0 + 0.15, Z0 + 0.6, '#5a5e60'); ccyl(VM, (-0.55, 0.88, Z0 + 0.12), (-0.55, 1.25, Z0 + 0.12), 0.015, '#c8ccce', seg=6); ccyl(VM, (-0.55, 1.25, Z0 + 0.12), (-0.55, 1.2, Z0 + 0.35), 0.012, '#c8ccce', seg=6)
for k in range(4): clathe(VM, [(0.0, 0.0), (0.13, 0.0), (0.14, 0.14), (0.0, 0.14)], 0.1 + k * 0.22, 0.88, Z0 + 0.35, '#c4c8ca', seg=10)
for k in range(3): clathe(GL, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.16), (0.015, 0.2), (0.0, 0.2)], -1.1 + k * 0.08, 0.88, Z0 + 0.25, R.choice(['#e8c040', '#3a8a3a', '#f0f0ea', '#c83a2a']), seg=6)   # 醬料
K.ph_put('multi_cleaner_bottle', -0.82, 0.88, Z0 + 0.26, 0.4, height=0.22, decimate=0.25); K.ph_put('bleach_bottle', -0.72, 0.88, Z0 + 0.22, -0.3, height=0.26, decimate=0.3)   # v2：洗碗精、漂白水（Poly Haven）
fz = S['fridge']   # 不鏽鋼冰箱（兩門）
ST.box(fz['x0'], fz['x1'], 0, fz['h'], fz['z0'] + 0.05, fz['z1']); VC.cbox(fz['x0'] + 0.01, fz['x1'] - 0.01, 1.2, 1.205, fz['z1'], fz['z1'] + 0.004, '#6a6e70')
for y0, y1 in ((0.5, 1.0), (1.35, 1.75)): VM.cbox(fz['x1'] - 0.1, fz['x1'] - 0.08, y0, y1, fz['z1'], fz['z1'] + 0.05, '#9a9ea2')
for k in range(3): VC.cbox(fz['x0'] + 0.05, fz['x1'] - 0.05, fz['h'] + k * 0.16, fz['h'] + 0.14 + k * 0.16, fz['z0'] + 0.1, fz['z1'] - 0.05, ['#2a5aa8', '#e8c030', '#2a5aa8'][k])   # 冰箱上的塑膠籃
for k in range(2): K.ph_put('plastic_crate_02', X0 + 0.3, k * 0.26, Z0 + 0.25, 0.0 if k == 0 else 0.06, height=0.26, decimate=0.3, recolor=(['#6a1410', '#1a3a78'][k], ['#d8483a', '#4a7ad0'][k]), tag=['_r', '_b'][k])   # 冰箱左邊地上的籃子（v2：Poly Haven 塑膠籃，紅、藍）
dr_ = S['dishRack']
for y in (0.3, 0.75, 1.2, 1.65): ST.box(dr_['x0'], dr_['x1'], y - 0.02, y, dr_['z0'], dr_['z1'])
for x in (dr_['x0'], dr_['x1']): VM.cbox(x - 0.015, x + 0.015, 0, dr_['h'], dr_['z0'], dr_['z1'], '#b8bcbe')
for y in (0.3, 0.75, 1.2, 1.65):
    for k in range(5):
        for j in range(R.randint(4, 9)): clathe(GL, [(0.0, 0.0), (0.05, 0.0), (0.085, 0.06), (0.0, 0.012)], dr_['x0'] + 0.15 + k * 0.25, y + j * 0.028, (dr_['z0'] + dr_['z1']) / 2, R.choice(['#f4f2ec', '#eef2f6']), seg=10)
for k in range(2): K.ph_put('cardboard_box_01', dr_['x0'] + 0.35 + k * 0.6, dr_['h'], (dr_['z0'] + dr_['z1']) / 2 - 0.02, PI / 2 + (0.05 if k else -0.04), height=0.3 - 0.04 * k, decimate=0.08)   # v2：紙箱（Poly Haven）

# ================= 右牆：紅紙菜單、時鐘、壁扇、相框、自助調味區、收銀台 =================
mn = S['menu']; rp = wg('right', 'print'); rv = wg('right', 'vc')
n_ = len(mn['items']); step = (mn['z1'] - mn['z0']) / n_
for k in range(n_):
    z = mn['z0'] + (k + 0.5) * step; face(rp, (X1 - 0.005, (mn['y0'] + mn['y1']) / 2, z), '-x', step - 0.03, mn['y1'] - mn['y0'], C[f'menu{k}'])
K.ph_put('wall_clock', X1 - 0.03, 2.1, 1.15, -PI / 2, height=0.4, decimate=0.5)   # v2：時鐘（Poly Haven）
face(rp, (X1 - 0.005, 1.65, 1.15), '-x', 0.42, 0.52, C['photo'])
face(rp, (X1 - 0.005, 1.5, -1.2), '-x', 0.8, 0.25, C['selfsauce'])


def wall_fan(x, y, z, yaw):
    """壁扇（灰白底座、網罩、三片扇葉）"""
    T = rot(x, z, yaw)
    VC.crbox(x - 0.07, x + 0.07, y - 0.12, y + 0.12, z - 0.07, z + 0.07, '#e8e6e0', r=0.02, seg=1)
    hx, hz = T(0, 0.22); ccyl(VC, (x, y, z), (hx, y - 0.05, hz), 0.025, '#e8e6e0', seg=6)
    cx_, cz_ = T(0, 0.3)
    f0 = set(VC.bm.faces); VC.sphere((cx_, y - 0.08, cz_), 0.05, seg=8, rings=5); VC.paint(nf(VC, f0), '#d8dcdf')
    for k in range(3):   # 扇葉：三片在網罩裡（扁的小方塊）
        a = k * 2 * PI / 3 + 0.3; e0 = T(0.0, 0.3); e1 = T(0.16 * math.cos(a), 0.3)
        f0 = set(VC.bm.faces); VC.ell(((e0[0] + e1[0]) / 2, y - 0.08 + 0.08 * math.sin(a), (e0[1] + e1[1]) / 2), 0.07 if abs(math.cos(a)) > 0.3 else 0.02, 0.04 + 0.05 * abs(math.sin(a)), 0.02 if abs(math.cos(a)) > 0.3 else 0.07, seg=6, rings=3); VC.paint(nf(VC, f0), '#cfd4d8')
    for k in range(10):
        a = k * PI / 5; p0 = T(0.21 * math.cos(a), 0.26); p1 = T(0.21 * math.cos(a + PI / 5), 0.26)
        ccyl(VM, (p0[0], y - 0.08 + 0.21 * math.sin(a), p0[1]), (p1[0], y - 0.08 + 0.21 * math.sin(a + PI / 5), p1[1]), 0.004, '#9a9ea2', seg=3, caps=False)


wall_fan(X1 - 0.05, 2.55, 2.2, -PI / 2); wall_fan(2.6, 2.5, Z0 + 0.05, 0.0)   # 右牆前段、後牆右邊牆角
cd = S['condiments']   # 自助調味區：不鏽鋼兩層架
for y in (0.3, cd['h']): ST.box(cd['x0'], cd['x1'], y - 0.03, y, cd['z0'], cd['z1'])
for z in (cd['z0'] + 0.03, cd['z1'] - 0.03): VM.cbox(cd['x0'], cd['x0'] + 0.03, 0, cd['h'], z - 0.015, z + 0.015, '#b8bcbe')
for k in range(5):   # 下層的塑膠籃（有格子的邊）
    za = cd['z0'] + 0.1 + k * 0.46; col = ['#c83a3a', '#c83a3a', '#f4f2ec', '#c83a3a', '#c83a3a'][k]
    VC.cbox(cd['x0'] + 0.08, cd['x1'] - 0.05, 0.3, 0.32, za, za + 0.38, col)
    for zz in (za, za + 0.37): VC.cbox(cd['x0'] + 0.08, cd['x1'] - 0.05, 0.32, 0.46, zz, zz + 0.012, col)
    for xx in (cd['x0'] + 0.08, cd['x1'] - 0.062): VC.cbox(xx, xx + 0.012, 0.32, 0.46, za, za + 0.38, col)
    for j in range(4): VC.cbox(cd['x0'] + 0.1, cd['x1'] - 0.07, 0.32, 0.35, za + 0.03 + j * 0.09, za + 0.08 + j * 0.09, '#f2f0ea')
for k in range(14): clathe(GL, [(0.0, 0.0), (0.038, 0.0), (0.038, 0.18), (0.022, 0.23), (0.0, 0.23)], cd['x0'] + 0.15 + (k % 2) * 0.12, cd['h'], cd['z0'] + 0.15 + k * 0.155, ['#3a2a1a', '#b0281e', '#e8d8b0', '#3a2a1a', '#c83a2a'][k % 5], seg=8)
for k in range(3): clathe(VM, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.16), (0.0, 0.16)], cd['x0'] + 0.25, cd['h'], cd['z0'] + 0.5 + k * 0.7, STEELC, seg=8)   # 筷子、湯匙筒
for k in range(3):
    for j in range(8): ccyl(VC, (cd['x0'] + 0.25 + R.uniform(-0.02, 0.02), cd['h'] + 0.05, cd['z0'] + 0.5 + k * 0.7 + R.uniform(-0.02, 0.02)), (cd['x0'] + 0.25 + R.uniform(-0.03, 0.03), cd['h'] + 0.32, cd['z0'] + 0.5 + k * 0.7 + R.uniform(-0.03, 0.03)), 0.004, '#d8b880', seg=3)
clathe(GL, [(0.0, 0.0), (0.06, 0.0), (0.065, 0.16), (0.05, 0.2), (0.0, 0.2)], cd['x0'] + 0.25, cd['h'], cd['z1'] - 0.35, '#c83a2a', seg=10)   # 辣椒醬罐
VC.cbox(cd['x0'] + 0.1, cd['x0'] + 0.32, cd['h'], cd['h'] + 0.1, cd['z1'] - 0.2, cd['z1'] - 0.06, '#f8f8f4')
ca2 = S['cashier']   # 收銀台：木頭、正面有燈的小招牌、收銀機、叫人鈴、名片、小盆栽
WD.box(ca2['x0'], ca2['x1'], 0.06, ca2['h'] - 0.05, ca2['z0'], ca2['z1']); VC.cbox(ca2['x0'] + 0.02, ca2['x1'], 0, 0.06, ca2['z0'], ca2['z1'], '#3a2a1e')
WD.rbox(ca2['x0'] - 0.05, ca2['x1'], ca2['h'] - 0.05, ca2['h'], ca2['z0'] - 0.04, ca2['z1'] + 0.04, r=0.01, seg=1)
face(PR, (ca2['x0'] - 0.004, 0.55, (ca2['z0'] + ca2['z1']) / 2), '-x', 1.4, 0.65, C['cashsign']); WARM.box(ca2['x0'] - 0.05, ca2['x0'] - 0.02, 0.9, 0.92, ca2['z0'] + 0.1, ca2['z1'] - 0.1)
VC.cbox(ca2['x0'] + 0.2, ca2['x0'] + 0.5, ca2['h'], ca2['h'] + 0.09, 2.2, 2.6, '#2a2c2e'); VC.cbox(ca2['x0'] + 0.3, ca2['x0'] + 0.36, ca2['h'] + 0.09, ca2['h'] + 0.36, 2.35, 2.45, '#2a2c2e')
VC.cbox(ca2['x0'] + 0.24, ca2['x0'] + 0.3, ca2['h'] + 0.2, ca2['h'] + 0.44, 2.2, 2.6, '#1e2022'); face(SCR, (ca2['x0'] + 0.235, ca2['h'] + 0.32, 2.4), '-x', 0.36, 0.22, SC['pos'])
clathe(VM, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.02), (0.03, 0.05), (0.0, 0.06)], ca2['x0'] + 0.12, ca2['h'], 1.95, '#c8a040', seg=10)   # 叫人鈴
face(PR, (ca2['x0'] + 0.15, ca2['h'] + 0.002, 2.9), '+y', 0.18, 0.12, C['card'], up=(0, 0, -1)); face(PR, (ca2['x0'] + 0.15, ca2['h'] + 0.002, 3.12), '+y', 0.18, 0.12, C['price'], up=(0, 0, -1))
for k in range(5): ccyl(VC, (ca2['x0'] + 0.3, ca2['h'], 1.75 + k * 0.01), (ca2['x0'] + 0.32, ca2['h'] + 0.14, 1.74 + k * 0.015), 0.005, R.choice(['#2a2a2a', '#c83a2a', '#2a5aa8']), seg=3)   # 筆
K.ph_put('potted_plant_02', ca2['x1'] - 0.2, ca2['h'], 3.05, 0.7, share=False, height=0.48, decimate=0.06)   # v2：小盆栽（Poly Haven）

# ================= 窗外（只給渲染用） =================
if PREVIEW:
    om = L.flat('PREVIEW_outside', '#8a8a7a', rough=1.0, emit=tuple(v * 1.2 for v in B.srgb('#c8c4b0'))); ob_ = Mesh('PREVIEW_outside', om)
    face(ob_, (0, 2.0, Z1 + 3.5), '-z', 14, 6, (0, 0, 1, 1)); ob_.finish(root, uv=False)

# ================= 收尾 =================
for (side, key), m in list(WG.items()):
    if isinstance(m, KK.RCMesh): m.flush()
for (side, key), m in list(WG.items()): m.finish(G[side], uv=(key not in ('wall', 'print')), smooth=False)
VC.finish(root, uv=False); VM.finish(root, uv=False, smooth=True); GL.finish(root, uv=False, smooth=True)
WD.finish(root, uv=True); ST.finish(root, uv=True)
for m in TM.values(): m.finish(root, uv=True, smooth=True)
K.remove_protos()
STM.finish(root, uv=False, props={'steam': 1})
for m, pr in ((PR, None), (SCR, None), (WARM, None), (GLS, {'glass': 1}), (GLSF, {'glass': 1, 'side': 'front'})): m.finish(root, uv=(m is WARM), props=pr)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith(('WALL_', 'PREVIEW', 'GLASS_', 'lin_steam')), key=lambda ob: '')
st_ = L.export(OUT)
mats = sorted({ms.material.name for ob in bpy.data.objects if ob.type == 'MESH' for ms in ob.material_slots if ms.material})
print('OK', OUT, 'materials', len(mats), mats)
print('CC0_USED', K.used())
