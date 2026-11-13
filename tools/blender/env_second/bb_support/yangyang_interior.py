"""洋洋鹹酥雞（公館 G05，原「滷味・鹹酥雞」，AA_650；內部 id luwei）室內 v1c → GLB。BB（帳號 A）2026-11-04。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/yangyang_interior.py [-- --out <glb>] [--preview]
  要在美術線的 worktree 跑（lib2.py、b3lib.py）；配置用 node 讀 src/data/yangyang_layout.js（Blender 和遊戲同一份數字）。
照 SCENE_RULES 第 11、12 節：參考圖 docs/story_planning/ref_images/shops/gongguan_yangyang_int.webp 就是規格；拆圖清單在
docs/story_planning/bb_models/yangyang/README.md。門窗照 LAWWW2 外觀（5550948fb，gongguan5/DOORS.md）。
做法：地磚、天花板、黃牆、木桌、不鏽鋼是 PIL＋numpy 自己畫的貼圖（yangyang_tex.py）；招牌、菜單（AA_650 第 4 節）、海報、自助區、價目牌在一張印刷圖集；
  炸物是頂點色的小橢球、小方塊（一盤一盤）；冷飲櫃裡面是發光貼圖；材質 12 個。
v2（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 11-13）：頂點色零件照顏色分族到 ambientCG 材質組（cc0kit.std_route），炸物、醬料照舊頂點色；
  暖燈改乳白塑膠紋路的發光材質（同名）；盆栽三盆、地上的油紙箱換 Poly Haven 掃描模型。位置、座位、導航都沒動。
--preview：門窗外面加一張騎樓卡片（只給渲染用，正式 GLB 裡沒有）。
D77：店名是使用者給的虛構店名、沒有真實品牌；D112：地板是淺灰磁磚；D115：沒有真實校名；金屬度 ≤ 0.45。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import yangyang_tex as TX   # noqa: E402
import cc0kit as KK   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = '--preview' in ARGS
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/yangyang_interior.glb')
GEN = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/yangyang'); os.makedirs(GEN, exist_ok=True)
LAY = os.path.join(L.ROOT, 'src/data/yangyang_layout.js')
S = json.loads(subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require({json.dumps(LAY)}).shop))"]))
PI = math.pi
W, D, H = S['w'], S['d'], S['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
R = random.Random(650)
B.reset(texres=1024)
root = B.group('yangyang_interior', props={'kind': 'yangyang_interior', 'layout': 'src/data/yangyang_layout.js', 'w': W, 'd': D, 'h': H})
G = {s: B.group(f'WALL_{s}', root, props={'dir': DIRS[s]}) for s in DIRS}
P = TX.build_all(GEN); C = TX.CELLS; SC = TX.SC


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
    floor=img_mat('yy_floor', P['floor'], rough=0.35, rough_img=P['floor'].replace('.png', '_rough.png')),
    ceil=img_mat('yy_ceiling', P['ceil'], rough=0.95, cull=True),
    wall=img_mat('yy_wall', P['wall'], rough=0.85),
    wood=img_mat('yy_wood', P['wood'], rough=0.45),
    print=img_mat('yy_print', P['prints'], rough=0.6),
    steel=img_mat('yy_steel', P['steel'], rough=0.3, metal=0.45),
    vc=L.vc_material('yy_vc', rough=0.55),
    vm=L.vc_metal('yy_vc_metal', rough=0.35, metal=0.45),
    glass=L.flat('yy_glass', '#e4ecee', rough=0.03, alpha=0.08),
    food=L.vc_material('yy_food', rough=0.35),   # 炸物（油亮：粗糙度 0.35）
    warm=L.flat('GLOW_yy_warm', '#ffe2b0', rough=0.4, emit=tuple(v * 9.0 for v in B.srgb('#ffb460'))),
    screen=img_mat('GLOW_yy_screen', P['screen'], rough=0.2, emit=1.6),
)
M['wood']['tile'] = 1.0; M['steel']['tile'] = 0.7
K = KK.Kit(root, 'yy'); KK.std_mats(K, M)
M.update(plastic_red=K.acg('plastic_red', 'Plastic006', vary=0.05, maps=('diff',), target='#c23a30', tile=0.4, rough_value=0.35, res=256))
bpy.data.materials.remove(M['warm']); M['warm'] = K.glow('GLOW_yy_warm', '#ffe2b0', tuple(v * 9.0 for v in B.srgb('#ffb460')))
RV, RM = KK.std_route(False, {'#c83a2a': 'plastic_red'}), KK.std_route(True)
TM = {}
def tm(k):
    if k == 'steel': return ST
    if k not in TM: TM[k] = Mesh(f'yy_cc_{k}', M[k])
    return TM[k]
VC = KK.RCMesh('yy_vc', M['vc'], RV, tm); VM = KK.RCMesh('yy_vm', M['vm'], RM, tm)
WD = Mesh('yy_wood', M['wood']); ST = Mesh('yy_steel', M['steel']); PR = Mesh('yy_prints', M['print'])
GLS = Mesh('yy_glass', M['glass']); FD = CMesh('yy_food', M['food']); WARM = Mesh('yy_warm', M['warm']); SCR = Mesh('yy_screens', M['screen'])
GLSF = Mesh('GLASS_front', M['glass'])   # 正面的玻璃：不放進淡出群組（玻璃規則），分開一個物件，鏡頭在店外時可以單獨藏
WG = {}


def wg(side, key):
    if (side, key) not in WG:
        rt = (lambda h: None) if (side, key) == ('front', 'vm') else (RM if key == 'vm' else RV)   # 前牆的門框金屬照舊頂點色：遊戲照節點名字 WALL_front_vm 找（tests/gg_new_lm_unit.js 第 4 項）
        WG[(side, key)] = KK.RCMesh(f'WALL_{side}_{key}', M[key], rt, lambda k, s_=side: wg(s_, k)) if key in ('vc', 'vm') else Mesh(f'WALL_{side}_{key}', M[key])
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


WALLC = '#e8d6a8'; TILEC = '#eeece4'; STEELC = '#c4c8ca'; RED = '#a82c24'

# ================= 地板、天花板、燈 =================
fl = Mesh('FLOOR', M['floor']); uvq(fl, [(X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0)], (0, 0, W / 2.4, D / 2.4)); fl.finish(root, uv=False)
ce = Mesh('CEILING', M['ceil']); uvq(ce, [(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)], (0, D / 2.4, W / 2.4, 0)); ce.finish(root, uv=False)
for x, z0_, z1_ in ((1.0, -4.6, -2.4), (1.0, -1.6, 0.6), (3.5, -3.5, -1.3), (3.5, 0.0, 2.2), (-2.2, -4.8, -2.6)):   # 日光燈管（參考圖：天花板上一排排）
    VC.cbox(x - 0.09, x + 0.09, H - 0.05, H, z0_, z1_, '#eeeae0'); face(SCR, (x, H - 0.052, (z0_ + z1_) / 2), '-y', 0.1, z1_ - z0_ - 0.1, SC['tube'], up=(0, 0, 1))
# 吊燈（琺瑯燈罩，內白外米），在桌子上面
for t in S['tables4']:
    x, z = t['x'], t['z']; ccyl(VC, (x, H, z), (x, 2.45, z), 0.005, '#2a2a2a', seg=4)
    dome = [(0.0, 2.5), (0.035, 2.5)] + [(0.04 + 0.21 * math.sin(a), 2.47 - 0.2 * (1 - math.cos(a))) for a in [k * (PI / 2) / 6 for k in range(1, 7)]] + [(0.255, 2.25), (0.0, 2.25)]
    clathe(VM, dome, x, 0, z, '#b8a27a', seg=18)   # 金屬圓頂燈罩（黃銅色）
    WARM.sphere((x, 2.29, z), 0.055, seg=10, rings=5)
# 吊扇
fx, fz = 1.0, 0.55
ccyl(VM, (fx, H, fz), (fx, H - 0.35, fz), 0.02, '#e8e4dc', seg=6); clathe(VC, [(0.0, 0.0), (0.12, 0.0), (0.12, 0.12), (0.0, 0.14)], fx, H - 0.47, fz, '#ece8e0', seg=12)
for k in range(3):
    a = k * 2 * PI / 3
    p0 = (fx + 0.1 * math.cos(a), fz + 0.1 * math.sin(a)); p1 = (fx + 0.7 * math.cos(a), fz + 0.7 * math.sin(a)); n_ = (-math.sin(a) * 0.07, math.cos(a) * 0.07)
    VC.poly([(p0[0] - n_[0], H - 0.41, p0[1] - n_[1]), (p1[0] - n_[0], H - 0.41, p1[1] - n_[1]), (p1[0] + n_[0], H - 0.41, p1[1] + n_[1]), (p0[0] + n_[0], H - 0.41, p0[1] + n_[1])], '#f2eee4')
    VC.poly([(p0[0] + n_[0], H - 0.415, p0[1] + n_[1]), (p1[0] + n_[0], H - 0.415, p1[1] + n_[1]), (p1[0] - n_[0], H - 0.415, p1[1] - n_[1]), (p0[0] - n_[0], H - 0.415, p0[1] - n_[1])], '#e2ded4')


# ================= 牆 =================
def wall_tex(side, a0, a1, y0, y1):
    """黃牆貼圖的一塊（牆面上 a 從左到右、從店裡看）：每 2 m 重複"""
    m = wg(side, 'wall')
    def pt(a, y):
        if side == 'left': return (X0, y, Z1 - a)
        if side == 'right': return (X1, y, Z0 + a)
        if side == 'back': return (X0 + a, y, Z0)
        return (X1 - a, y, Z1)
    uvq(m, [pt(a0, y0), pt(a1, y0), pt(a1, y1), pt(a0, y1)], (a0 / 2.0, y0 / 3.2, a1 / 2.0, y1 / 3.2))


lw, rw, bw, fw = wg('left', 'vc'), wg('right', 'vc'), wg('back', 'vc'), wg('front', 'vc')
for m, box in ((lw, (X0 - 0.12, X0 - 0.005, Z0, Z1)), (rw, (X1 + 0.005, X1 + 0.12, Z0, Z1)), (bw, (X0, X1, Z0 - 0.12, Z0 - 0.005))): m.cbox(box[0], box[1], 0, H, box[2], box[3], '#d8c8a0')
k_ = S['kitchen']
wall_tex('left', 0, Z1 - k_['z0'], 1.6, H); wall_tex('left', Z1 - k_['z0'], D, 0, H)          # 西牆：廚房那段下面是白磁磚（另外貼）
wall_tex('right', 0, D, 0, H); wall_tex('back', 0, W, 0, H)
for z in [k_['z0'] + k * 0.6 for k in range(int((Z1 - k_['z0']) / 0.6) + 1)]:   # 廚房裡西牆的白磁磚（0～1.6）
    if z + 0.6 <= Z1 + 1e-6: face(wg('left', 'print'), (X0 + 0.004, 0.8, z + 0.3), '+x', 0.6, 1.6, sub(C['tile'], 0, 0, 1, 1))
for m, a in ((lw, (X0, X0 + 0.01, Z0, k_['z0'])), (rw, (X1 - 0.01, X1, Z0, Z1)), (bw, (X0, X1, Z0, Z0 + 0.01))): m.cbox(a[0], a[1], 0, 0.1, a[2], a[3], '#8a7a5a')
# 正面：轉角、門、窗、炸物櫃台開口（照外觀）
fr = S['front']; OP = fr['open']; dr = fr['door']; DX0, DX1 = dr['x'] - dr['w'] / 2, dr['x'] + dr['w'] / 2; WN = fr['windows'][0]
for a, b in fr['solid']: fw.cbox(a, b, 0, H, Z1, Z1 + 0.12, WALLC)
fw.cbox(OP['x0'], OP['x1'], OP['top'], H, Z1, Z1 + 0.12, WALLC); fw.cbox(DX0, DX1, dr['h'], H, Z1, Z1 + 0.12, WALLC)
fw.cbox(WN[0], WN[1], 0, fr['sill'], Z1, Z1 + 0.12, '#c8b890'); fw.cbox(WN[0], WN[1], fr['head'], H, Z1, Z1 + 0.12, WALLC)
fm = wg('front', 'vm')
for x in (DX0, (DX0 + DX1) / 2, DX1, WN[1]): fm.cbox(x - 0.03, x + 0.03, 0, dr['h'], Z1 - 0.04, Z1 + 0.04, STEELC)
fm.cbox(DX0, WN[1], dr['h'] - 0.05, dr['h'], Z1 - 0.04, Z1 + 0.04, STEELC); fm.cbox(WN[0], WN[1], fr['sill'], fr['sill'] + 0.04, Z1 - 0.04, Z1 + 0.04, STEELC)
for (a, b, y0, y1) in ((DX0, (DX0 + DX1) / 2, 0.05, dr['h'] - 0.05), ((DX0 + DX1) / 2, DX1, 0.05, dr['h'] - 0.05), (WN[0], WN[1], fr['sill'] + 0.04, fr['head'] - 0.05)):
    face(GLSF, ((a + b) / 2, (y0 + y1) / 2, Z1), '-z', b - a - 0.05, y1 - y0, (0, 0, 1, 1))
for x in ((DX0 + DX1) / 2 - 0.08, (DX0 + DX1) / 2 + 0.08): ccyl(fm, (x, 0.85, Z1 - 0.06), (x, 1.35, Z1 - 0.06), 0.012, STEELC, seg=6)   # 門把
fm.cbox(OP['x0'], OP['x1'], OP['top'] - 0.06, OP['top'], Z1 - 0.04, Z1 + 0.04, STEELC)   # 開口上緣

# ================= 開放式廚房：臨騎樓的炸物櫃台、油鍋、抽油煙機、備料檯、層架 =================
sc = S['streetCounter']; KX1 = k_['x1']
ST.box(sc['x0'], sc['x1'], 0, sc['h'] - 0.04, sc['z0'] + 0.05, sc['z1'] - 0.02)
VC.cbox(sc['x0'], sc['x1'], sc['h'] - 0.04, sc['h'], sc['z0'], sc['z1'] + 0.06, '#d8dcde')
cy0, cy1 = sc['h'], sc['caseTop']
for x in (sc['x0'], (sc['x0'] + sc['x1']) / 2, sc['x1']): VM.cbox(x - 0.015, x + 0.015, cy0, cy1, sc['z1'] - 0.02, sc['z1'] + 0.02, STEELC); VM.cbox(x - 0.015, x + 0.015, cy0, cy1, sc['z0'] + 0.15, sc['z0'] + 0.18, STEELC)
VM.cbox(sc['x0'], sc['x1'], cy1 - 0.02, cy1 + 0.01, sc['z0'] + 0.15, sc['z1'] + 0.02, STEELC)
face(GLSF, ((sc['x0'] + sc['x1']) / 2, (cy0 + cy1) / 2, sc['z1']), '+z', sc['x1'] - sc['x0'], cy1 - cy0, (0, 0, 1, 1))   # 朝騎樓的玻璃
face(GLS, ((sc['x0'] + sc['x1']) / 2, cy1 + 0.012, (sc['z0'] + 0.15 + sc['z1']) / 2), '+y', sc['x1'] - sc['x0'], sc['z1'] - sc['z0'] - 0.15, (0, 0, 1, 1), up=(0, 0, -1))
WARM.box(sc['x0'] + 0.05, sc['x1'] - 0.05, cy1 - 0.035, cy1 - 0.025, sc['z1'] - 0.12, sc['z1'] - 0.08)   # 櫃子裡的燈條

FOODS = [('鹹酥雞', '#c8843a', 'blob'), ('甜不辣', '#e0b070', 'stick'), ('豆干', '#8a5a32', 'cube'), ('米血', '#3a2a28', 'cube'), ('杏鮑菇', '#ece0c8', 'mush'),
         ('四季豆', '#5a9a3a', 'bean'), ('雞排', '#d4a060', 'flat'), ('花枝丸', '#efe6d0', 'ball'), ('花椰菜', '#4e8a34', 'broc'), ('百頁豆腐', '#f0e4c0', 'cube'),
         ('雞皮', '#d8b080', 'blob'), ('玉米筍', '#f0d060', 'stick'), ('高麗菜', '#b8d890', 'blob'), ('魷魚', '#f0dcc0', 'stick'), ('三角骨', '#c8904a', 'blob'), ('地瓜', '#e8a040', 'cube')]
TAGI = {'鹹酥雞': 0, '甜不辣': 1, '豆干': 2, '米血': 3, '杏鮑菇': 4, '四季豆': 5, '雞排': 6, '花枝丸': 7}


def tray(x0, x1, y, z0, z1, food, axis='x', heap=1):
    """一盤生料：不鏽鋼淺盤＋一堆東西（頂點色）"""
    VM.cbox(x0, x1, y, y + 0.012, z0, z1, '#c8ccce'); VM.cbox(x0, x1, y, y + 0.035, z0, z0 + 0.008, '#c8ccce'); VM.cbox(x0, x1, y, y + 0.035, z1 - 0.008, z1, '#c8ccce')
    name, col, kind = food; n = (14 if kind in ('blob', 'ball', 'mush', 'broc') else 10) * heap
    for k in range(n):
        px, pz = R.uniform(x0 + 0.04, x1 - 0.04), R.uniform(z0 + 0.04, z1 - 0.04); py = y + 0.02 + R.uniform(0, 0.02)
        if heap > 1 and k >= n // 2:   # 堆高：中間高、旁邊低
            cx_, cz_ = (x0 + x1) / 2, (z0 + z1) / 2; px, pz = cx_ + (px - cx_) * 0.65, cz_ + (pz - cz_) * 0.7; py += 0.05 + 0.03 * R.random()
        c2 = col if R.random() < 0.6 else ('#%02x%02x%02x' % tuple(max(0, min(255, int(int(col[i:i + 2], 16) * R.uniform(0.82, 1.12)))) for i in (1, 3, 5)))
        if kind in ('blob', 'ball'): rr = R.uniform(0.026, 0.05); blob(FD, (px, py + rr * 0.6, pz), rr, c2, seg=7, rings=5, sy=R.uniform(0.7, 0.95))
        elif kind == 'mush':
            ccyl(FD, (px, py, pz), (px, py + 0.05, pz), 0.012, '#f2ead8', seg=5); blob(FD, (px, py + 0.055, pz), R.uniform(0.02, 0.03), '#c8a878', sy=0.5)
        elif kind == 'broc': blob(FD, (px, py + 0.025, pz), R.uniform(0.028, 0.04), col, sy=0.8)
        elif kind == 'cube': e_ = R.uniform(0.018, 0.03); FD.crbox(px - e_, px + e_, py, py + e_ * 1.4, pz - e_, pz + e_, c2, r=0.006, seg=1)
        elif kind == 'flat': FD.crbox(px - 0.06, px + 0.06, py, py + 0.018, pz - 0.045, pz + 0.045, c2, r=0.008, seg=1)
        elif kind in ('stick', 'bean'):
            for j in range(2 if kind == 'stick' else 4):
                a = R.uniform(0, PI); dx, dz = math.cos(a) * 0.06, math.sin(a) * 0.06; zz = pz + j * 0.012
                ccyl(FD, (px - dx, py + 0.01 + j * 0.006, zz - dz), (px + dx, py + 0.01 + j * 0.006, zz + dz), 0.011 if kind == 'stick' else 0.006, c2, seg=5)


# 臨騎樓的展示櫃：兩排盤子
nx = 8; dx_ = (sc['x1'] - sc['x0']) / nx
for i in range(nx):
    for j in range(2):
        a = sc['x0'] + i * dx_ + 0.02; za = sc['z1'] - 0.42 + j * 0.2
        tray(a, a + dx_ - 0.04, cy0 + 0.01 + (0.18 if j == 0 else 0.0), za, za + 0.18, FOODS[(i * 2 + j) % len(FOODS)])
for i in range(4):   # 朝騎樓的價目牌
    face(PR, (sc['x0'] + (i * 2 + 1) * dx_, cy0 + 0.05, sc['z1'] + 0.006), '+z', 0.18, 0.08, C[f'tag{i}'])
# 油鍋三個（靠西牆）＋抽油煙機
fx0, fx1, fz0, fz1 = X0, X0 + 0.7, 1.2, 4.6
ST.box(fx0, fx1, 0, 0.88, fz0, fz1); VC.cbox(fx0, fx1, 0.88, 0.9, fz0, fz1, '#b8bcbe')
for k in range(3):
    zc = fz0 + 0.55 + k * 1.15; VC.cbox(fx0 + 0.12, fx1 - 0.1, 0.86, 0.905, zc - 0.4, zc + 0.4, '#3a2a14'); VC.cbox(fx0 + 0.14, fx1 - 0.12, 0.905, 0.906, zc - 0.38, zc + 0.38, '#b8781c')   # 油
    for j in (-0.18, 0.18):   # 炸籃（鐵網＋把手）
        VM.cbox(fx0 + 0.2, fx1 - 0.18, 0.84, 0.86, zc + j - 0.15, zc + j + 0.15, '#7a7e80')
        for e in (-0.15, 0.15): VM.cbox(fx0 + 0.2, fx1 - 0.18, 0.84, 1.0, zc + j + e - 0.004, zc + j + e + 0.004, '#8a8e90')
        ccyl(VM, (fx1 - 0.18, 0.98, zc + j), (fx1 + 0.08, 1.05, zc + j), 0.01, '#2a2a2a', seg=5)
ST.box(X0, X0 + 1.1, 2.15, 2.6, fz0 - 0.1, fz1 + 0.1); VC.cbox(X0 + 0.3, X0 + 1.08, 2.12, 2.15, fz0, fz1, '#6a6e70')   # 抽油煙機
for k in range(9): VC.cbox(X0 + 0.32, X0 + 1.06, 2.115, 2.12, fz0 + 0.1 + k * 0.38, fz0 + 0.16 + k * 0.38, '#4a4e50')
ST.box(X0 + 0.3, X0 + 0.55, 2.6, H, 2.5, 3.0)
WARM.box(X0 + 0.5, X0 + 0.7, 2.11, 2.115, 2.0, 2.4); WARM.box(X0 + 0.5, X0 + 0.7, 2.11, 2.115, 3.4, 3.8)
# 備料檯、調味架、夾子、紙袋、鍋子
ST.box(-3.3, -2.2, 0, 0.88, 1.0, 1.8); VC.cbox(-3.3, -2.2, 0.88, 0.9, 1.0, 1.8, '#b8bcbe')
for k in range(5): clathe(VC, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.14), (0.02, 0.17), (0.0, 0.17)], -3.2 + k * 0.1, 0.9, 1.15, ['#c83a2a', '#e8c040', '#2a2a2a', '#e8e0d0', '#c83a2a'][k], seg=8)   # 胡椒粉、辣椒粉、醬
for k in range(3): clathe(VM, [(0.0, 0.0), (0.16, 0.0), (0.17, 0.16), (0.0, 0.16)], -2.85 + k * 0.33 if k < 2 else -2.5, 0.9, 1.55, '#c4c8ca', seg=14)   # 鍋盆
for k in range(4): ccyl(VM, (-2.4 + k * 0.05, 0.92, 1.05), (-2.35 + k * 0.05, 0.92, 1.35), 0.006, '#b8bcbe', seg=4)   # 夾子
for k in range(6): VC.cbox(-3.25, -2.95, 0.9 + k * 0.006, 0.905 + k * 0.006, 1.35, 1.75, '#d6b282')   # 紙袋疊
# 廚房後牆（z KZ）靠廚房那側的層架：碗、醬料瓶、紙箱、籃子
KZ = k_['z0']
for y in (1.0, 1.5, 2.0):
    ST.box(-3.8, -0.6, y - 0.025, y, KZ + 0.02, KZ + 0.38)
for x in (-3.8, -2.2, -0.6): VM.cbox(x - 0.015, x + 0.015, 0, 2.05, KZ + 0.02, KZ + 0.38, STEELC)
ST.box(-3.8, -0.6, 0.0, 0.85, KZ + 0.02, KZ + 0.5)
for y in (1.0, 1.5, 2.0):
    x = -3.7
    while x < -0.75:
        k = R.random()
        if k < 0.35:
            for j in range(R.randint(4, 8)): clathe(VC, [(0.0, 0.0), (0.06, 0.0), (0.09, 0.05), (0.0, 0.01)], x + 0.08, y + j * 0.022, KZ + 0.2, '#f2f0ea', seg=10)
            x += 0.22
        elif k < 0.7:
            for j in range(3): clathe(VC, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.14), (0.015, 0.18), (0.0, 0.18)], x + 0.04 + j * 0.07, y, KZ + 0.2, R.choice(['#c83a2a', '#e8c040', '#3a2a1a', '#e8e0d0', '#3a7a3a', '#e87a20', '#2a5aa8', '#8a3a8a']), seg=6)
            x += 0.25
        else:
            VC.cbox(x, x + 0.32, y, y + R.uniform(0.18, 0.3), KZ + 0.06, KZ + 0.34, R.choice(['#d8b888', '#c8a070', '#c83a2a', '#e8c040', '#3a7ac8', '#f0e8d0', '#5a9a3a'])); x += 0.38
# 廚房的天花板燈
face(SCR, (-2.0, H - 0.052, 2.65), '-y', 1.2, 0.1, SC['tube'], up=(0, 0, 1)); VC.cbox(-2.65, -1.35, H - 0.05, H, 2.55, 2.75, '#eeeae0')

# ================= 店內那一側的炸物櫃（面向 +x）＋上面招牌、菜單板 =================
ic = S['insideCase']; ix0, ix1, iz0, iz1 = ic['x0'], ic['x1'], ic['z0'], ic['z1']
for z in [iz0 + k * 0.3 for k in range(int((iz1 - iz0) / 0.3))]: face(PR, (ix1 + 0.003, 0.42, z + 0.15), '+x', 0.3, 0.84, sub(C['tile'], 0, 0, 0.5, 1))   # 白磁磚
VC.cbox(ix0, ix1, 0, 0.84, iz0, iz1, TILEC); VC.cbox(ix0 - 0.02, ix1 + 0.1, 0.84, 0.88, iz0, iz1, '#d0d4d6')   # 檯面（不鏽鋼前緣）
ty0 = 0.88
INSIDE = [0, 1, 6, 15, 3, 5, 2, 4, 13, 7, 14, 10, 1, 0, 8, 11]   # 店內炸物櫃的順序：鹹酥雞、甜不辣、雞排、地瓜、米血、四季豆…（參考圖）
for k, z in enumerate([iz0 + 0.05 + j * 0.46 for j in range(int((iz1 - iz0 - 0.05) / 0.46))]):   # 三排階梯盤子，堆高
    tray(ix0 + 0.03, ix0 + 0.27, ty0 + 0.2, z, z + 0.42, FOODS[INSIDE[(k * 3) % 16]], heap=2)
    tray(ix0 + 0.28, ix0 + 0.52, ty0 + 0.1, z, z + 0.42, FOODS[INSIDE[(k * 3 + 1) % 16]], heap=2)
    tray(ix0 + 0.53, ix1 - 0.02, ty0, z, z + 0.42, FOODS[INSIDE[(k * 3 + 2) % 16]], heap=2)
    name = FOODS[INSIDE[(k * 3 + 2) % 16]][0]
    if name in TAGI: face(PR, (ix1 + 0.105, 0.86, z + 0.22), '+x', 0.2, 0.085, C[f'tag{TAGI[name]}'])
for z in (iz0, iz1): VM.cbox(ix0, ix1 + 0.02, ty0, ty0 + 0.36, z - 0.012, z + 0.012, STEELC)
VM.cbox(ix0, ix1, ty0 + 0.34, ty0 + 0.37, iz0, iz1, STEELC)
GLS.quad([(ix1 + 0.02, ty0, iz1), (ix1 + 0.02, ty0, iz0), (ix0 + 0.35, ty0 + 0.36, iz0), (ix0 + 0.35, ty0 + 0.36, iz1)])   # 斜玻璃（面向 +x 上方）
WARM.box(ix0 + 0.1, ix0 + 0.3, ty0 + 0.33, ty0 + 0.335, iz0 + 0.05, iz1 - 0.05); WARM.box(ix0 + 0.45, ix0 + 0.6, ty0 + 0.25, ty0 + 0.255, iz0 + 0.05, iz1 - 0.05)
for k in range(10): VM.cbox(ix0 + 0.02, ix0 + 0.22, ty0, ty0 + 0.012, iz1 - 0.3 + k * 0.02, iz1 - 0.29 + k * 0.02, '#c8ccce')   # 一疊不鏽鋼盤（參考圖左前）
for k in range(3): clathe(VM, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.14), (0.0, 0.14)], ix1 - 0.08, ty0 + 0.37, iz1 - 0.2 - k * 0.12, STEELC, seg=8)   # 夾子筒
for k in range(5): ccyl(VM, (ix1 - 0.08, ty0 + 0.45, iz1 - 0.2), (ix1 - 0.06 + k * 0.01, ty0 + 0.62, iz1 - 0.2 + (k - 2) * 0.02), 0.005, '#b8bcbe', seg=4)
for k in range(4): VC.cbox(ix1 - 0.2, ix1 - 0.02, ty0 + 0.37 + k * 0.03, ty0 + 0.39 + k * 0.03, iz0 + 0.1, iz0 + 0.35, R.choice(['#e8a020', '#d0d4d6']))   # 炸物籃（疊）
face(PR, (ix1 - 0.05, ty0 + 0.55, iz1 - 0.6), '+x', 0.16, 0.22, C['slip'])   # 點餐單
# 招牌、菜單板（在炸物櫃上方的橫樑，面向 +x）
mb = S['menuBoard']; mx = mb['x']
VC.cbox(mx - 0.12, mx, mb['y0'], H, mb['z0'], mb['z1'], '#f2ead8')
face(PR, (mx + 0.004, 2.82, (mb['z0'] + mb['z1']) / 2), '+x', mb['z1'] - mb['z0'] - 0.1, (mb['z1'] - mb['z0'] - 0.1) * 300 / 1400, C['sign'])
face(PR, (mx + 0.004, 2.22, (mb['z0'] + mb['z1']) / 2), '+x', mb['z1'] - mb['z0'] - 0.1, 0.52, C['menu'])
VM.cbox(mx - 0.13, mx + 0.01, mb['y0'] - 0.04, mb['y0'], mb['z0'], mb['z1'], STEELC)
# 「點餐 結帳 →」牌：掛在炸物櫃靠門那一頭的柱子上
VC.cbox(mx - 0.08, mx + 0.02, 0, mb['y0'], iz1, iz1 + 0.1, STEELC)
face(PR, (mx + 0.03, 1.45, iz1 + 0.05), '+x', 0.22, 0.42, C['order'])
# ================= 廚房後段：白磁磚腰牆＋不鏽鋼框玻璃（x＝KX1 那一面、z＝KZ 那一面） =================
pt = S['partition']; dado = pt['dado']


def glazed(axis, fixed, a0, a1, n):
    """一道腰牆＋玻璃隔間：axis 'x'＝牆在 x＝fixed、沿 z；'z'＝牆在 z＝fixed、沿 x；n＝朝外的面"""
    if axis == 'x':
        VC.cbox(fixed - 0.06, fixed + 0.06, 0, dado, a0, a1, TILEC)
        for z in [a0 + k * 0.3 for k in range(int((a1 - a0) / 0.3 + 0.01))]: face(PR, (fixed + 0.064, dado / 2, z + 0.15), '+x', 0.3, dado, sub(C['tile'], 0, 0, 0.5, 1))
        VM.cbox(fixed - 0.07, fixed + 0.07, dado, dado + 0.04, a0, a1, STEELC); VM.cbox(fixed - 0.05, fixed + 0.05, H - 0.1, H, a0, a1, STEELC)
        nseg = max(1, round((a1 - a0) / 0.7))
        for k in range(nseg + 1):
            z = a0 + k * (a1 - a0) / nseg; VM.cbox(fixed - 0.03, fixed + 0.03, dado, H, z - 0.02, z + 0.02, STEELC)
        VM.cbox(fixed - 0.03, fixed + 0.03, 2.1, 2.13, a0, a1, STEELC)
        face(GLS, (fixed, (dado + H - 0.1) / 2, (a0 + a1) / 2), '+x', a1 - a0, H - 0.1 - dado, (0, 0, 1, 1))
    else:
        VC.cbox(a0, a1, 0, dado, fixed - 0.06, fixed + 0.06, TILEC)
        for x in [a0 + k * 0.3 for k in range(int((a1 - a0) / 0.3 + 0.01))]: face(PR, (x + 0.15, dado / 2, fixed - 0.064), '-z', 0.3, dado, sub(C['tile'], 0, 0, 0.5, 1))
        VM.cbox(a0, a1, dado, dado + 0.04, fixed - 0.07, fixed + 0.07, STEELC); VM.cbox(a0, a1, H - 0.1, H, fixed - 0.05, fixed + 0.05, STEELC)
        nseg = max(1, round((a1 - a0) / 0.7))
        for k in range(nseg + 1):
            x = a0 + k * (a1 - a0) / nseg; VM.cbox(x - 0.02, x + 0.02, dado, H, fixed - 0.03, fixed + 0.03, STEELC)
        VM.cbox(a0, a1, 2.1, 2.13, fixed - 0.03, fixed + 0.03, STEELC)
        face(GLS, ((a0 + a1) / 2, (dado + H - 0.1) / 2, fixed), '-z', a1 - a0, H - 0.1 - dado, (0, 0, 1, 1))


glazed('x', KX1, pt['z0'], pt['z1'] - 0.1, '+x')
glazed('z', KZ, X0, KX1 + 0.06, '-z')
face(PR, (KX1 + 0.035, 1.75, 0.2), '+x', 0.5, 0.78, C['poster1']); face(PR, (KX1 + 0.035, 1.75, -0.9), '+x', 0.5, 0.72, C['poster2'])   # 玻璃上貼的海報
face(PR, (-3.0, 1.5, KZ - 0.035), '-z', 0.5, 0.72, C['poster3'])
for k in range(14):   # 吊在隔間上面的黃金葛
    zc = 0.85 - k * 0.2; y = H - 0.08 - (k % 5) * 0.14 - (0.4 if k > 9 else 0)
    blob(VC, (KX1 + 0.08 + R.uniform(-0.05, 0.05), y, zc), 0.07, R.choice(['#4e7a34', '#6a9640', '#3e6a2c']), sy=0.5)
for k in range(7): ccyl(VC, (KX1 + 0.08, H - 0.05, 0.8 - k * 0.45), (KX1 + 0.1, H - 0.7 - (k % 3) * 0.25, 0.8 - k * 0.45), 0.004, '#3e6a2c', seg=3)
for zc in (0.6, -1.6):   # 黃金葛吊盆
    ccyl(VC, (KX1 + 0.25, H, zc), (KX1 + 0.25, 2.55, zc), 0.004, '#2a2a2a', seg=3); clathe(VC, [(0.0, 0.0), (0.1, 0.0), (0.13, 0.16), (0.0, 0.16)], KX1 + 0.25, 2.4, zc, '#c86a3a', seg=10)
    for k in range(10): blob(VC, (KX1 + 0.25 + R.uniform(-0.16, 0.16), 2.3 + R.uniform(-0.35, 0.25), zc + R.uniform(-0.16, 0.16)), 0.07, R.choice(['#4e7a34', '#6a9640', '#3e6a2c']), sy=0.5)

# ================= 桌椅 =================
for t in S['tables4']:
    x, z = t['x'], t['z']
    WD.rbox(x - 0.55, x + 0.55, 0.73, 0.76, z - 0.375, z + 0.375, r=0.012, seg=2)
    for dx in (-0.48, 0.48):
        for dz in (-0.3, 0.3): ccyl(VM, (x + dx, 0, z + dz), (x + dx, 0.73, z + dz), 0.018, '#a8acae', seg=6)
        VM.cbox(x + dx - 0.012, x + dx + 0.012, 0.15, 0.17, z - 0.3, z + 0.3, '#a8acae')
    for dx in (-0.28, 0.28):
        chair(x + dx, z - 0.6, 0.0); chair(x + dx, z + 0.6, PI)
    clathe(VM, [(0.0, 0.0), (0.04, 0.0), (0.04, 0.13), (0.0, 0.13)], x - 0.1, 0.76, z, STEELC, seg=8)   # 筷子筒
    for k in range(8): ccyl(VC, (x - 0.1 + R.uniform(-0.02, 0.02), 0.8, z + R.uniform(-0.02, 0.02)), (x - 0.1 + R.uniform(-0.035, 0.035), 0.99, z + R.uniform(-0.035, 0.035)), 0.004, '#d8b880', seg=3)
    VC.cbox(x + 0.02, x + 0.24, 0.76, 0.85, z - 0.07, z + 0.07, '#f6c8c0'); face(PR, (x + 0.13, 0.805, z + 0.0705), '+z', 0.22, 0.09, sub(C['tissue'], 0, 0, 1, 0.8))
    VM.cbox(x - 0.3, x - 0.16, 0.76, 0.77, z - 0.08, z + 0.08, STEELC)
    for k in range(3): clathe(VC, [(0.0, 0.0), (0.02, 0.0), (0.02, 0.08), (0.0, 0.09)], x - 0.27 + k * 0.045, 0.77, z, ['#c83a2a', '#f0e8d8', '#3a2a1a'][k], seg=6)
for t in S['tables2']:
    x, z = t['x'], t['z']
    WD.rbox(x - 0.35, x + 0.35, 0.73, 0.76, z - 0.35, z + 0.35, r=0.012, seg=2)
    ccyl(VM, (x, 0, z), (x, 0.73, z), 0.03, '#a8acae', seg=8); VM.cbox(x - 0.25, x + 0.25, 0, 0.03, z - 0.04, z + 0.04, '#a8acae'); VM.cbox(x - 0.04, x + 0.04, 0, 0.03, z - 0.25, z + 0.25, '#a8acae')
    chair(x, z - 0.55, 0.0); chair(x, z + 0.55, PI)
    clathe(VM, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.12), (0.0, 0.12)], x - 0.15, 0.76, z, STEELC, seg=8)
    VC.cbox(x + 0.02, x + 0.22, 0.76, 0.84, z - 0.06, z + 0.06, '#f6c8c0')

# ================= 右牆：壁燈、海報、相框、冷氣、自助區 =================
for z in (4.6, 3.3, 0.3, -1.5, -3.3):   # 黑色鵝頸壁燈
    VC.cbox(X1 - 0.02, X1, 2.25, 2.4, z - 0.05, z + 0.05, '#1e1e1e'); ccyl(VC, (X1 - 0.02, 2.33, z), (X1 - 0.3, 2.5, z), 0.012, '#1e1e1e', seg=5)
    clathe(VC, [(0.0, 0.0), (0.03, 0.0), (0.05, -0.03), (0.13, -0.12), (0.135, -0.13), (0.0, -0.13)], X1 - 0.33, 2.52, z, '#2a2a2a', seg=12)
    WARM.sphere((X1 - 0.33, 2.41, z), 0.04, seg=8, rings=4)
rp = wg('right', 'print'); rv = wg('right', 'vc')
face(rp, (X1 - 0.033, 1.75, 3.95), '-x', 0.62, 0.9, C['poster3']); rv.cbox(X1 - 0.03, X1, 1.28, 2.22, 3.62, 4.28, '#6a4a2a')
face(rp, (X1 - 0.005, 1.75, -0.6), '-x', 0.5, 0.78, C['poster1']); face(rp, (X1 - 0.005, 1.7, -2.45), '-x', 0.5, 0.72, C['poster2'])
face(rp, (X1 - 0.005, 1.8, 2.75), '-x', 0.42, 0.55, C['frame']); face(rp, (X1 - 0.005, 1.7, -4.2), '-x', 0.42, 0.55, C['frame'])
rv.crbox(X1 - 0.24, X1, 2.55, 2.85, -0.9 - 0.45, -0.9 + 0.45, '#f0ece4', r=0.02, seg=1)   # 分離式冷氣
for k in range(6): rv.cbox(X1 - 0.245, X1 - 0.24, 2.58 + k * 0.04, 2.59 + k * 0.04, -1.3, -0.5, '#c8c4bc')
ss = S['selfServe']
ST.box(ss['x0'], ss['x1'], 0, ss['h'] - 0.03, ss['z0'], ss['z1']); VC.cbox(ss['x0'] - 0.02, ss['x1'], ss['h'] - 0.03, ss['h'], ss['z0'], ss['z1'], '#d0d4d6')
bw_ = (ss['z1'] - ss['z0']) / 3
for k in range(3):   # 垃圾分類三格（不鏽鋼門＋標籤）
    za = ss['z0'] + k * bw_; VM.cbox(ss['x0'] - 0.01, ss['x0'], 0.05, ss['h'] - 0.08, za + 0.02, za + bw_ - 0.02, '#b8bcbe')
    face(PR, (ss['x0'] - 0.013, 0.5, za + bw_ / 2), '-x', 0.36, 0.5, C[f'bin{2 - k}'])
    VC.cbox(ss['x0'] - 0.015, ss['x0'] - 0.01, ss['h'] - 0.2, ss['h'] - 0.14, za + 0.1, za + bw_ - 0.1, '#2a2a2a')
uz = ss['z0'] + 0.35   # 飲用水桶（不鏽鋼保溫桶＋水龍頭）
clathe(VM, [(0.0, 0.0), (0.18, 0.0), (0.19, 0.03), (0.19, 0.48), (0.17, 0.52), (0.08, 0.55), (0.0, 0.56)], X1 - 0.3, ss['h'], uz, '#c8ccce', seg=16)
VC.cbox(X1 - 0.52, X1 - 0.47, ss['h'] + 0.08, ss['h'] + 0.14, uz - 0.02, uz + 0.02, '#1e1e1e'); face(PR, (X1 - 0.495, ss['h'] + 0.32, uz), '-x', 0.2, 0.14, C['water'])
for k in range(2):
    for j in range(5): clathe(VC, [(0.0, 0.0), (0.035, 0.0), (0.045, 0.1), (0.0, 0.1)], X1 - 0.25, ss['h'] + j * 0.03, uz + 0.4 + k * 0.1, '#f6f6f2', seg=8)   # 紙杯
for k in range(5): clathe(VC, [(0.0, 0.0), (0.028, 0.0), (0.028, 0.15), (0.015, 0.19), (0.0, 0.19)], X1 - 0.35, ss['h'], uz + 0.75 + k * 0.08, ['#c83a2a', '#e8c040', '#3a2a1a', '#c83a2a', '#f0e8d8'][k], seg=6)   # 醬料、胡椒粉
VM.cbox(X1 - 0.5, X1 - 0.15, ss['h'], ss['h'] + 0.04, ss['z1'] - 0.55, ss['z1'] - 0.1, '#c8ccce')   # 鐵盤
VC.cbox(ss['x0'] - 0.03, ss['x0'], ss['h'] - 0.4, ss['h'] - 0.03, ss['z1'] - 0.35, ss['z1'] - 0.2, '#f4f2ec')   # 掛著的毛巾
face(rp, (X1 - 0.005, 1.72, (ss['z0'] + ss['z1']) / 2), '-x', 0.86, 0.7, C['self'])
K.ph_put('potted_plant_02', X1 - 0.25, 0, ss['z0'] - 0.3, 0.4, share=False, height=0.95, decimate=0.022)   # 自助區旁的盆栽（在後面那一頭；v2：Poly Haven）

# ================= 後牆：冷飲櫃、紅色門簾、層架、紙箱、盆栽 =================
fz = S['fridge']
VC.cbox(fz['x0'], fz['x1'], 0, 0.15, fz['z0'], fz['z1'], '#e8eaea'); VC.cbox(fz['x0'], fz['x1'], fz['h'] - 0.25, fz['h'], fz['z0'], fz['z1'], '#e8eaea'); VC.cbox(fz['x0'], fz['x1'], 0, fz['h'], fz['z0'], fz['z0'] + 0.06, '#e8eaea')   # 冷飲櫃的殼（裡面空的，看得到發光的飲料） VC.cbox(fz['x0'], fz['x1'], fz['h'] - 0.22, fz['h'], fz['z1'], fz['z1'] + 0.01, '#f4f4f2')
face(PR, ((fz['x0'] + fz['x1']) / 2, fz['h'] - 0.11, fz['z1'] + 0.012), '+z', 0.6, 0.18, C['cold'])
face(SCR, ((fz['x0'] + fz['x1']) / 2, (0.15 + fz['h'] - 0.25) / 2, fz['z0'] + 0.08), '+z', fz['x1'] - fz['x0'] - 0.1, fz['h'] - 0.42, SC['fridge'])
VC.cbox(fz['x0'] + 0.03, fz['x0'] + 0.05, 0.15, fz['h'] - 0.25, fz['z0'] + 0.08, fz['z1'], '#e8eaea'); VC.cbox(fz['x1'] - 0.05, fz['x1'] - 0.03, 0.15, fz['h'] - 0.25, fz['z0'] + 0.08, fz['z1'], '#e8eaea')
face(GLS, ((fz['x0'] + fz['x1']) / 2, (0.15 + fz['h'] - 0.25) / 2, fz['z1'] - 0.01), '+z', fz['x1'] - fz['x0'] - 0.08, fz['h'] - 0.4, (0, 0, 1, 1))
VM.cbox(fz['x1'] - 0.12, fz['x1'] - 0.09, 0.7, 1.4, fz['z1'], fz['z1'] + 0.04, '#9a9ea2'); VC.cbox(fz['x0'], fz['x1'], 0, 0.15, fz['z1'] - 0.02, fz['z1'], '#3a3a3a')
cd = S['curtainDoor']; bv = wg('back', 'vc')
bv.cbox(cd['x'] - cd['w'] / 2, cd['x'] + cd['w'] / 2, 0, 2.1, Z0, Z0 + 0.01, '#2a2420'); bv.cbox(cd['x'] - cd['w'] / 2 - 0.06, cd['x'] + cd['w'] / 2 + 0.06, 2.1, 2.16, Z0, Z0 + 0.05, '#6a4a2a')
face(wg('back', 'print'), (cd['x'], 1.75, Z0 + 0.06), '+z', cd['w'], 1.26, C['noren'])
bsh = S['backShelf']
for y in (0.0, 0.6, 1.2, 1.8, 2.35): ST.box(bsh['x0'], bsh['x1'], y, y + 0.03, bsh['z0'], bsh['z1'])
for x in (bsh['x0'], bsh['x1']): VM.cbox(x - 0.015, x + 0.015, 0, 2.38, bsh['z0'], bsh['z1'], STEELC)
for y in (0.03, 0.63, 1.23, 1.83):
    x = bsh['x0'] + 0.05
    while x < bsh['x1'] - 0.25:
        if R.random() < 0.5:
            for j in range(3): clathe(VC, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.22), (0.035, 0.25), (0.0, 0.25)], x + 0.06 + j * 0.1, y, bsh['z0'] + 0.2, R.choice(['#f0e8d0', '#c83a2a', '#e8c040']), seg=8)
            x += 0.32
        else:
            VC.cbox(x, x + 0.3, y, y + 0.28, bsh['z0'] + 0.04, bsh['z1'] - 0.02, '#c8a070'); face(PR, (x + 0.15, y + 0.14, bsh['z1'] - 0.018), '+z', 0.3, 0.2, C['carton']); x += 0.34
for k in range(3): VC.cbox(bsh['x0'] + 0.05 + k * 0.38, bsh['x0'] + 0.4 + k * 0.38, 2.38, 2.38 + R.uniform(0.22, 0.32), Z0 + 0.04, Z0 + 0.38, '#c8a070')
for k, (hh, ya) in enumerate(((0.32, 0.03), (0.6, -0.05), (0.34, 0.08))): K.ph_put('cardboard_box_01', 2.575 + k * 0.42, 0, Z0 + 0.25, PI / 2 + ya, height=hh, sx=None, decimate=0.02)   # 地上的紙箱（食用油；v2：Poly Haven）
K.ph_put('cardboard_box_01', 2.995, 0.34, Z0 + 0.25, PI / 2 - 0.1, height=0.26, decimate=0.02)
K.ph_put('potted_plant_02', 4.25, 0, Z0 + 0.3, 1.1, share=False, height=1.1, decimate=0.022)   # v2：盆栽（Poly Haven）
face(wg('back', 'print'), (-3.6, 1.7, Z0 + 0.005), '+z', 0.42, 0.55, C['frame'])
bk = S['backCounter']   # 後面的木頭結帳櫃台（裝飾）：木頭正面、小雞標誌、收銀機、外帶袋、名片、零錢盤
WD.box(bk['x0'], bk['x1'], 0.08, bk['h'] - 0.05, bk['z1'] - 0.04, bk['z1']); VC.cbox(bk['x0'], bk['x1'], 0, bk['h'] - 0.05, bk['z0'], bk['z1'] - 0.04, '#8a5a30')
WD.rbox(bk['x0'] - 0.03, bk['x1'] + 0.03, bk['h'] - 0.05, bk['h'], bk['z0'] - 0.03, bk['z1'] + 0.03, r=0.01, seg=1); VC.cbox(bk['x0'], bk['x1'], 0, 0.08, bk['z1'] - 0.06, bk['z1'] - 0.02, '#5a3a20')
face(PR, ((bk['x0'] + bk['x1']) / 2 + 0.4, 0.55, bk['z1'] + 0.003), '+z', 0.34, 0.4, C['bag'])
VC.cbox(-0.9, -0.55, bk['h'], bk['h'] + 0.1, bk['z0'] + 0.1, bk['z0'] + 0.4, '#2a2c2e'); VC.cbox(-0.85, -0.6, bk['h'] + 0.1, bk['h'] + 0.32, bk['z0'] + 0.12, bk['z0'] + 0.16, '#2a2c2e')
face(SCR, (-0.725, bk['h'] + 0.21, bk['z0'] + 0.165), '+z', 0.22, 0.18, SC['pos'])
for k in range(6): VC.cbox(-1.4, -1.1, bk['h'] + k * 0.008, bk['h'] + 0.006 + k * 0.008, bk['z0'] + 0.1, bk['z0'] + 0.45, '#d6b282')   # 外帶紙袋
K.ph_put('potted_plant_02', -0.2, bk['h'], bk['z0'] + 0.25, 2.0, share=False, height=0.42, decimate=0.015)   # 櫃台上的小盆栽（v2：Poly Haven）
VC.cbox(0.0, 0.15, bk['h'], bk['h'] + 0.04, bk['z0'] + 0.3, bk['z0'] + 0.42, '#c8a040')

# ================= 窗外（只給渲染用） =================
if PREVIEW:
    om = L.flat('PREVIEW_outside', '#5a5048', rough=1.0, emit=tuple(v * 0.6 for v in B.srgb('#3a3440'))); ob_ = Mesh('PREVIEW_outside', om)
    face(ob_, (0, 2.0, Z1 + 4.0), '-z', 14, 6, (0, 0, 1, 1)); ob_.finish(root, uv=False)

# ================= 收尾 =================
for (side, key), m in list(WG.items()):
    if isinstance(m, KK.RCMesh): m.flush()
for (side, key), m in list(WG.items()): m.finish(G[side], uv=(key not in ('wall', 'print', 'floor', 'ceil', 'screen')), smooth=False)
VC.flush(); VM.flush()
for m in TM.values(): m.finish(root, uv=True, smooth=True)
K.remove_protos()
VC.finish(root, uv=False); VM.finish(root, uv=False, smooth=True)
WD.finish(root, uv=True); ST.finish(root, uv=True)
FD.finish(root, uv=False, smooth=True)
for m, pr in ((PR, None), (SCR, None), (WARM, None), (GLS, {'glass': 1}), (GLSF, {'glass': 1, 'side': 'front'})): m.finish(root, uv=(m is WARM), props=pr)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith(('WALL_', 'PREVIEW', 'GLASS_')), key=lambda ob: '')
st_ = L.export(OUT)
print('CC0_USED', K.used())
mats = sorted({ms.material.name for ob in bpy.data.objects if ob.type == 'MESH' for ms in ob.material_slots if ms.material})
print('OK', OUT, 'materials', len(mats), mats)
