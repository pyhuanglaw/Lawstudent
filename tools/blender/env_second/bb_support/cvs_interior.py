"""日和便利店（cvs 區域：原「日日便利」，AA_647 G03）室內 v2 → GLB。BB（帳號 A）2026-11-04。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/cvs_interior.py [-- --out <glb>] [--preview]
  要在美術線的 worktree 跑（lib2.py、b3lib.py）；配置用 node 讀 src/data/cvs_layout.js（Blender 和遊戲同一份數字）。
照 SCENE_RULES 第 11、12 節：參考圖 docs/story_planning/ref_images/shops/gongguan_cvs_int.webp 就是規格；拆圖清單在
docs/story_planning/bb_models/cvs/README.md。房間中心在原點、x 東、z 南、y 上；店門在 +z（自動門 x 0.6～2.6）；西牆（−x）前段整排落地窗。
做法：地磚、天花板、橡木是 PIL＋numpy 自己畫的貼圖（cvs_tex.py）；字、標誌、海報在一張印刷圖集；貨架上的商品是「商品圖集」一排一排的正面
（每一格＝貨架一層 1.2 m），貼在有深度的方塊上（側面是暗的貨架裡面）；端架的泡麵碗是真的模型；冷藏櫃裡面是發光貼圖（GLOW_）；材質 12 個。
--preview：窗外加一張街景卡片（只給渲染用，正式 GLB 裡沒有）。
D77：店名是使用者給的虛構店名、商品沒有真實品牌；D112：地板是淺灰地磚；D115：沒有真實校名；金屬度 ≤ 0.45（遊戲沒有環境貼圖）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import cvs_tex as TX   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = '--preview' in ARGS
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/cvs_interior.glb')
GEN = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/cvs'); os.makedirs(GEN, exist_ok=True)
LAY = os.path.join(L.ROOT, 'src/data/cvs_layout.js')
S = json.loads(subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require({json.dumps(LAY)}).shop))"]))
PI = math.pi
W, D, H = S['w'], S['d'], S['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
R = random.Random(647)
B.reset(texres=1024)
root = B.group('cvs_interior', props={'kind': 'cvs_interior', 'layout': 'src/data/cvs_layout.js', 'w': W, 'd': D, 'h': H})
G = {s: B.group(f'WALL_{s}', root, props={'dir': DIRS[s]}) for s in DIRS}
P = TX.build_all(GEN); C = TX.CELLS; GC = TX.GCELLS; CC = TX.CCELLS; SC = TX.SCELLS; DC = TX.DCELLS


# ================= 材質（12 個） =================
def img_mat(name, path, rough=0.6, metal=0.0, emit=0.0, rough_img=None, cull=False, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    if rough_img:
        tr = nt.nodes.new('ShaderNodeTexImage'); tr.image = bpy.data.images.load(rough_img, check_existing=True); tr.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(tr.outputs['Color'], b.inputs['Roughness'])
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    if alpha:
        nt.links.new(tx.outputs['Alpha'], b.inputs['Alpha'])
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m.use_backface_culling = cull; m['tile'] = 1.0
    return m


M = dict(
    floor=img_mat('cvs_floor', P['floor'], rough=0.3, rough_img=P['floor'].replace('.png', '_rough.png')),
    ceil=img_mat('cvs_ceiling', P['ceil'], rough=0.95, cull=True),
    wood=img_mat('cvs_wood', P['wood'], rough=0.55),
    print=img_mat('cvs_print', P['prints'], rough=0.6),
    goods=img_mat('cvs_goods', P['goods'], rough=0.5),
    vc=L.vc_material('cvs_vc', rough=0.55),
    vm=L.vc_metal('cvs_vc_metal', rough=0.35, metal=0.45),
    glass=L.flat('cvs_glass', '#e4eef0', rough=0.03, alpha=0.08),
    decal=img_mat('cvs_decal', P['decal'], rough=0.4, alpha=True),
    led=L.flat('GLOW_cvs_led', '#ffffff', rough=0.3, emit=tuple(v * 7.0 for v in B.srgb('#ffe8c8'))),
    cooler=img_mat('GLOW_cvs_cooler', P['cooler'], rough=0.3, emit=2.0),
    screen=img_mat('GLOW_cvs_screen', P['screen'], rough=0.2, emit=1.2),
)
M['wood']['tile'] = 1.0
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件（貨架、商品、櫃子、冷藏櫃框…）改成「頂點色 × ambientCG 材質組」——每個零件原本的顏色照舊，
#      加上 CC0 的紋路、法線（霧面＝Plastic006、金屬＝Metal009）；牆照舊乾淨的平塗（cvs_wall）；貨架頂上的庫存紙箱換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
import cc0_kit   # noqa: E402
CK = cc0_kit.Kit(root, 'cvs')
M['wall'] = L.vc_material('cvs_wall', rough=0.55)
M['vc'] = CK.vc_tex('cvs_vc', 'Plastic006', vary=0.05, tile=0.35, rough_value=0.55)
M['vm'] = CK.vc_tex('cvs_vc_metal', 'Metal009', vary=0.12, tile=0.3, rough_value=0.35, metal=0.45)
VC = CMesh('cvs_vc', M['vc']); VM = CMesh('cvs_vm', M['vm'])
WD = Mesh('cvs_wood', M['wood']); PR = Mesh('cvs_prints', M['print']); GD = Mesh('cvs_goods', M['goods'])
GLS = Mesh('cvs_glass', M['glass']); DEC = Mesh('cvs_decals', M['decal']); LED = Mesh('cvs_led', M['led'])
COOL = Mesh('cvs_cooler', M['cooler']); SCR = Mesh('cvs_screens', M['screen'])
GLSF = Mesh('GLASS_front', M['glass']); DECF = Mesh('DECAL_front', M['decal'])   # 正面的玻璃、貼紙：不放進淡出群組（玻璃規則），但分開一個物件，鏡頭在店外時可以單獨藏
WG = {}


def wg(side, key):
    if (side, key) not in WG: WG[(side, key)] = (CMesh if key in ('vc', 'vm') else Mesh)(f'WALL_{side}_{key}', M['wall' if key == 'vc' else key])   # 牆：平塗（cvs_wall）
    return WG[(side, key)]


def nf(m, before): return [f for f in m.bm.faces if f not in before]


def uvq(mesh, pts, rect):
    """貼圖四邊形：pts＝左下、右下、右上、左上（從正面看逆時針，遊戲座標）；rect＝(u0, v0, u1, v1)"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = rect
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return f


NV = {'+x': (1, 0, 0), '-x': (-1, 0, 0), '+z': (0, 0, 1), '-z': (0, 0, -1), '+y': (0, 1, 0), '-y': (0, -1, 0)}


def face(mesh, c, n, w, h, rect, up=(0, 1, 0), two=False):
    """中心 c、朝向 n（'+x'…）、寬 w、高 h 的貼圖面；two＝背面也貼一張（吊牌）"""
    nv = Vector(NV[n]); u = Vector(up); r = u.cross(nv); cx = Vector(c)
    pts = [cx - r * w / 2 - u * h / 2, cx + r * w / 2 - u * h / 2, cx + r * w / 2 + u * h / 2, cx - r * w / 2 + u * h / 2]
    f = uvq(mesh, [tuple(p) for p in pts], rect)
    if two:
        pts2 = [cx + r * w / 2 - u * h / 2, cx - r * w / 2 - u * h / 2, cx - r * w / 2 + u * h / 2, cx + r * w / 2 + u * h / 2]
        uvq(mesh, [tuple(p - nv * 0.004) for p in pts2], rect)
    return f


def sub(rect, a0, b0, a1, b1):
    u0, v0, u1, v1 = rect; return (u0 + (u1 - u0) * a0, v0 + (v1 - v0) * b0, u0 + (u1 - u0) * a1, v0 + (v1 - v0) * b1)


SIDE = (0.001, 0.001, 0.004, 0.004)   # 商品圖集左下角的深灰（貨架裡面）


def gbox(m, x0, x1, y0, y1, z0, z1, n, rect, side=SIDE):
    """方塊：朝 n 的那一面貼 rect，其他面貼 side"""
    cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2; dx, dy, dz = x1 - x0, y1 - y0, z1 - z0
    for k, (w_, h_, off, up) in {'+x': (dz, dy, dx / 2, (0, 1, 0)), '-x': (dz, dy, dx / 2, (0, 1, 0)), '+z': (dx, dy, dz / 2, (0, 1, 0)), '-z': (dx, dy, dz / 2, (0, 1, 0)),
                                 '+y': (dx, dz, dy / 2, (0, 0, -1)), '-y': (dx, dz, dy / 2, (0, 0, 1))}.items():
        nv = NV[k]; face(m, (cx + nv[0] * off, cy + nv[1] * off, cz + nv[2] * off), k, w_, h_, rect if k == n else side, up=up)


def ccyl(m, a, b, r, col, seg=8, r2=None, caps=True):
    f0 = set(m.bm.faces); m.cyl(a, b, r, seg=seg, r2=r2, caps=caps); return m.paint(nf(m, f0), col)


def clathe(m, prof, x, y, z, col, seg=12):
    f0 = set(m.bm.faces); m.add_bm(L.lathe(prof, seg=seg), Matrix.Translation(g2b(x, y, z))); fs = nf(m, f0)
    if col: m.paint(fs, col)
    return fs


def cell_u(rect, length, per=1.2, rng=R):
    """商品圖集的一格（1.2 m）裡面取 length 公尺那一段（隨機起點）"""
    f = min(1.0, length / per); a = rng.uniform(0, 1 - f); return sub(rect, a, 0, a + f, 1)


WALLC = '#ece3d2'; GREEN = '#708a3a'; DKG = '#4e6428'; ALU = '#c6cacc'; WHITE = '#f2f1ec'

# ================= 地板、天花板 =================
fl = Mesh('FLOOR', M['floor']); uvq(fl, [(X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0)], (0, 0, W / 2.4, D / 2.4)); fl.finish(root, uv=False)
ce = Mesh('CEILING', M['ceil']); uvq(ce, [(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)], (0, D / 2.4, W / 2.4, 0)); ce.finish(root, uv=False)
# LED 燈條（沿 z，一段 2.4 m）
LEDX = [X0 + 1.6 + k * (W - 2.4) / 5 for k in range(6)]
for x in LEDX:
    z = Z0 + 0.5
    while z < Z1 - 0.6:
        z1 = min(z + 2.3, Z1 - 0.5)
        if True:
            VC.cbox(x - 0.07, x + 0.07, H - 0.045, H, z, z1, '#e8e8e4'); LED.box(x - 0.05, x + 0.05, H - 0.055, H - 0.045, z + 0.03, z1 - 0.03)
        z = z1 + 0.2
# 橫向的燈條（參考圖：靠前面有幾條橫的）
for z in (4.4, 2.0):
    VC.cbox(X0 + 2.8, X1 - 1.8, H - 0.045, H, z - 0.07, z + 0.07, '#e8e8e4'); LED.box(X0 + 2.85, X1 - 1.85, H - 0.055, H - 0.045, z - 0.05, z + 0.05)
# 嵌入式冷氣（兩台）、監視器
for (x, z) in ((0.4, -0.5), (1.8, -3.0)):
    VC.cbox(x - 0.45, x + 0.45, H - 0.05, H, z - 0.45, z + 0.45, '#f4f4f2')
    for k in range(4):
        a = [(x - 0.4, x + 0.4, z - 0.4, z - 0.32), (x - 0.4, x + 0.4, z + 0.32, z + 0.4), (x - 0.4, x - 0.32, z - 0.3, z + 0.3), (x + 0.32, x + 0.4, z - 0.3, z + 0.3)][k]
        VC.cbox(a[0], a[1], H - 0.055, H - 0.05, a[2], a[3], '#9a9c9c')
    VC.cbox(x - 0.25, x + 0.25, H - 0.056, H - 0.05, z - 0.25, z + 0.25, '#e0e0dc')
for (x, z) in ((X0 + 0.6, Z1 - 0.6), (X1 - 0.6, Z0 + 0.8), (2.8, Z1 - 0.5)):
    VC.cbox(x - 0.06, x + 0.06, H - 0.03, H, z - 0.06, z + 0.06, '#f4f4f2'); f0 = set(VC.bm.faces); VC.sphere((x, H - 0.06, z), 0.06, seg=10, rings=5); VC.paint(nf(VC, f0), '#2a2c2e')

# ================= 牆 =================
lw = wg('left', 'vc'); rw = wg('right', 'vc'); bw = wg('back', 'vc'); fw = wg('front', 'vc')
lw.cbox(X0 - 0.12, X0, 0, H, Z0, Z1, WALLC)   # 西牆是實牆（隔壁是頁間書屋）
rw.cbox(X1, X1 + 0.12, 0, H, Z0, Z1, WALLC); bw.cbox(X0, X1, 0, H, Z0 - 0.12, Z0, WALLC)
dr = S['front']['door']; DX0, DX1 = dr['x'] - dr['w'] / 2, dr['x'] + dr['w'] / 2; FW = S['front']['windows']; FSILL, FHEAD = S['front']['sill'], S['front']['head']
fw.cbox(X0 - 0.12, X1 + 0.12, FHEAD, H, Z1, Z1 + 0.12, WALLC)
for a, b in FW: fw.cbox(a, b, 0, FSILL, Z1, Z1 + 0.12, '#d8d4ca')
fw.cbox(X0 - 0.12, FW[0][0], 0, FHEAD, Z1, Z1 + 0.12, WALLC)                 # 轉角柱
fw.cbox(FW[1][1], X1 + 0.12, 0, FHEAD, Z1, Z1 + 0.12, WALLC)                 # 右段白牆（外面是置物櫃、回收桶、販賣機）
fw.cbox(FW[0][1], DX0, 0, FHEAD, Z1 - 0.04, Z1 + 0.12, ALU); fw.cbox(DX1, FW[1][0], 0, FHEAD, Z1 - 0.04, Z1 + 0.12, ALU)
# 踢腳（淺灰）
for m, a in ((lw, (X0, X0 + 0.01, Z0, Z1)), (rw, (X1 - 0.01, X1, Z0, Z1)), (bw, (X0, X1, Z0, Z0 + 0.01))): m.cbox(a[0], a[1], 0, 0.1, a[2], a[3], '#b8b6ae')
fw.cbox(FW[1][1], X1, 0, 0.1, Z1 - 0.01, Z1, '#b8b6ae')
# 窗框（鋁）、玻璃、貼紙
lm = wg('left', 'vm'); fm = wg('front', 'vm')
for a, b in FW:
    n_ = max(1, round((b - a) / 0.9))
    for x in [a + k * (b - a) / n_ for k in range(n_ + 1)]: fm.cbox(x - 0.02, x + 0.02, FSILL, FHEAD, Z1 - 0.035, Z1 + 0.02, ALU)
    for y in (FSILL, FHEAD - 0.035): fm.cbox(a, b, y, y + 0.035, Z1 - 0.035, Z1 + 0.02, ALU)
    face(GLSF, ((a + b) / 2, (FSILL + FHEAD) / 2, Z1 - 0.01), '-z', b - a, FHEAD - FSILL, (0, 0, 1, 1))
# 自動門（外觀 v1：門高 2.13、上面橫框到 2.73）：兩扇玻璃門往兩邊開，上面是固定玻璃、感應器；門上的綠條與營業時間貼紙
DH = dr['h']; fm.cbox(DX0, DX1, DH, DH + 0.06, Z1 - 0.06, Z1 + 0.02, ALU); fm.cbox(DX0, DX1, FHEAD - 0.06, FHEAD, Z1 - 0.06, Z1 + 0.02, ALU)
face(GLSF, ((DX0 + DX1) / 2, (DH + 0.06 + FHEAD - 0.06) / 2, Z1 - 0.02), '-z', DX1 - DX0, FHEAD - DH - 0.12, (0, 0, 1, 1))
VC.cbox(dr['x'] - 0.15, dr['x'] + 0.15, FHEAD + 0.02, FHEAD + 0.1, Z1 - 0.12, Z1 - 0.02, '#2a2c2e')
for (x0, x1) in ((DX0 - 0.92, DX0 + 0.08), (DX1 - 0.08, DX1 + 0.92)):   # 門扇（開著，滑到固定窗後面）
    z = Z1 - 0.09; fm.cbox(x0, x1, 0.0, 0.06, z - 0.02, z + 0.02, ALU); fm.cbox(x0, x1, DH - 0.06, DH, z - 0.02, z + 0.02, ALU)
    for x in (x0, x1 - 0.05): fm.cbox(x, x + 0.05, 0.0, DH, z - 0.02, z + 0.02, ALU)
    face(GLSF, ((x0 + x1) / 2, DH / 2, z - 0.022), '-z', x1 - x0, DH - 0.08, (0, 0, 1, 1))
    face(DECF, ((x0 + x1) / 2, 0.98, z - 0.026), '-z', x1 - x0 - 0.1, 0.06, DC['stripe'])
face(DECF, (DX1 + 0.45, 1.45, Z1 - 0.115), '-z', 0.6, 0.66, DC['door'])
face(DECF, ((FW[0][0] + FW[0][1]) / 2 - 0.6, 1.62, Z1 - 0.016), '-z', 2.4, 0.94, DC['win'])   # 窗邊的玻璃貼紙（內用座位｜輕食飲品｜便當新鮮）
face(DECF, ((FW[0][0] + FW[0][1]) / 2, 1.0, Z1 - 0.016), '-z', FW[0][1] - FW[0][0] - 0.1, 0.05, DC['stripe'])

# ================= 窗邊吧台、高腳椅、綠色吊燈、盆栽 =================
def rot(x, z, yaw):
    """遊戲座標的旋轉：面向 yaw（(sin, cos)）的本地 (lx 右手, lz 前方) → 世界 (x, z)"""
    f = (math.sin(yaw), math.cos(yaw)); r = (math.cos(yaw), -math.sin(yaw))
    return lambda lx, lz: (x + lx * r[0] + lz * f[0], z + lx * r[1] + lz * f[1])


def curved_back(m, x, z, yaw, y0, y1, rb, ang=50, t=0.018, seg=8, off=0.0):
    """彎的椅背：以座位中心為圓心、半徑 rb 的一段弧（−ang～ang 度），在座位後方；厚 t"""
    T = rot(x, z, yaw); bm = m.bm
    def P(a, r, y):
        lx, lz = r * math.sin(a), -r * math.cos(a) - off; wx, wz = T(lx, lz); return bm.verts.new(g2b(wx, y, wz))
    A = [math.radians(-ang + 2 * ang * k / seg) for k in range(seg + 1)]
    O0 = [P(a, rb, y0) for a in A]; O1 = [P(a, rb, y1) for a in A]; I0 = [P(a, rb - t, y0) for a in A]; I1 = [P(a, rb - t, y1) for a in A]
    for k in range(seg):
        bm.faces.new((O0[k], O1[k], O1[k + 1], O0[k + 1])); bm.faces.new((I0[k + 1], I1[k + 1], I1[k], I0[k]))
        bm.faces.new((O1[k], I1[k], I1[k + 1], O1[k + 1])); bm.faces.new((O0[k + 1], I0[k + 1], I0[k], O0[k]))
    bm.faces.new((O0[0], I0[0], I1[0], O1[0])); bm.faces.new((O1[-1], I1[-1], I0[-1], O0[-1]))


def stool(x, z, yaw, sy=0.74):
    """高腳椅：圓木座、彎的矮椅背、銀色鋼腳、腳踏環"""
    T = rot(x, z, yaw)
    WD.add_bm(L.lathe([(0.0, 0.0), (0.19, 0.0), (0.2, 0.025), (0.19, 0.045), (0.0, 0.045)], seg=14), Matrix.Translation(g2b(x, sy, z)))
    curved_back(WD, x, z, yaw, sy + 0.17, sy + 0.32, 0.19, ang=55)
    for lx in (-0.12, 0.12):
        bx, bz = T(lx, -0.17); ccyl(VM, (bx, sy, bz), (bx, sy + 0.2, bz), 0.01, '#9a9ea2', seg=5)
    for dx, dz in ((-0.13, -0.13), (-0.13, 0.13), (0.13, -0.13), (0.13, 0.13)): ccyl(VM, (x + dx * 0.75, sy, z + dz * 0.75), (x + dx * 1.15, 0.0, z + dz * 1.15), 0.012, '#9a9ea2', seg=5)
    for (a, b) in (((-1, -1), (-1, 1)), ((-1, 1), (1, 1)), ((1, 1), (1, -1)), ((1, -1), (-1, -1))):
        ccyl(VM, (x + a[0] * 0.135, 0.28, z + a[1] * 0.135), (x + b[0] * 0.135, 0.28, z + b[1] * 0.135), 0.008, '#9a9ea2', seg=4, caps=False)


def chair(x, z, yaw):
    """內用椅：淺色木座（前緣倒圓）、彎的木椅背（兩片）、銀色鋼腳"""
    T = rot(x, z, yaw)
    WD.rbox(x - 0.2, x + 0.2, 0.44, 0.47, z - 0.2, z + 0.2, r=0.015, seg=2)
    curved_back(WD, x, z, yaw, 0.7, 0.86, 0.26, ang=42, t=0.02, off=-0.05)
    curved_back(WD, x, z, yaw, 0.6, 0.65, 0.255, ang=40, t=0.016, off=-0.05)
    for lx, lz in ((-0.17, -0.17), (0.17, -0.17), (-0.17, 0.17), (0.17, 0.17)):
        a_ = T(lx, lz); ccyl(VM, (a_[0], 0.0, a_[1]), (a_[0], 0.44, a_[1]), 0.012, '#a8acae', seg=5)
    for lx in (-0.16, 0.16):
        a_ = T(lx, -0.2); ccyl(VM, (a_[0], 0.47, a_[1]), (a_[0], 0.86, a_[1]), 0.011, '#a8acae', seg=5)


fb = S['frontBar']; bh = fb['h']   # 正面左段落地窗前的吧台＋三盞綠色吊燈
WD.rbox(fb['x0'], fb['x1'], bh - 0.05, bh, fb['z0'], fb['z1'], r=0.012, seg=2)
for x in (fb['x0'] + 0.25, (fb['x0'] + fb['x1']) / 2, fb['x1'] - 0.25):
    VM.cbox(x - 0.02, x + 0.02, 0, bh - 0.05, fb['z0'] + 0.1, fb['z0'] + 0.14, '#3a3c3e'); VM.cbox(x - 0.02, x + 0.02, bh - 0.09, bh - 0.05, fb['z0'] + 0.1, Z1, '#3a3c3e')
ccyl(VM, (fb['x0'], 0.25, fb['z0'] + 0.12), (fb['x1'], 0.25, fb['z0'] + 0.12), 0.015, '#3a3c3e', seg=6)
for x in fb['stools']: stool(x, fb['stoolZ'], 0.0)
for x, z in S['pendants']:
    ccyl(VC, (x, H, z), (x, 2.62, z), 0.004, '#2a2a2a', seg=4)
    clathe(VC, [(0.0, 2.6), (0.03, 2.6), (0.05, 2.56), (0.16, 2.44), (0.22, 2.36), (0.225, 2.35), (0.0, 2.35)], x, 0, z, GREEN, seg=16)
    LED.sphere((x, 2.37, z), 0.05, seg=10, rings=5)
for x in (fb['x0'] + 0.3, fb['x1'] - 0.3):   # 吧台上的盆栽（靠窗）
    clathe(VC, [(0.0, 0.0), (0.08, 0.0), (0.1, 0.16), (0.0, 0.16)], x, bh, Z1 - 0.22, '#f2f0ea', seg=12)
    for k in range(7):
        a_ = k * 2 * PI / 7; f0 = set(VC.bm.faces); VC.ell((x + 0.08 * math.cos(a_), bh + 0.26 + 0.05 * (k % 2), Z1 - 0.22 + 0.08 * math.sin(a_)), 0.09, 0.05, 0.09, seg=6, rings=4); VC.paint(nf(VC, f0), ['#4e7a34', '#6a9640', '#3e6a2c'][k % 3])
for x in (-3.4, -2.5):   # 面紙盒、立牌
    VC.cbox(x - 0.06, x + 0.06, bh, bh + 0.1, Z1 - 0.3, Z1 - 0.14, WHITE); face(PR, (x + 0.25, bh + 0.08, Z1 - 0.3), '-z', 0.1, 0.14, C['tent'])

# ================= 內用小方桌 =================
for t in S['tables']:
    x, z = t['x'], t['z']; hw = t['w'] / 2
    WD.rbox(x - hw, x + hw, 0.73, 0.76, z - hw, z + hw, r=0.01, seg=2)
    ccyl(VM, (x, 0.02, z), (x, 0.73, z), 0.035, '#a8acae', seg=8); VM.cbox(x - 0.28, x + 0.28, 0, 0.03, z - 0.04, z + 0.04, '#a8acae'); VM.cbox(x - 0.04, x + 0.04, 0, 0.03, z - 0.28, z + 0.28, '#a8acae')
    VC.cbox(x - 0.07, x + 0.07, 0.76, 0.86, z - 0.05, z + 0.05, WHITE); face(PR, (x + 0.12, 0.84, z), '+z', 0.1, 0.15, C['tent']); face(PR, (x + 0.12, 0.84, z - 0.002), '-z', 0.1, 0.15, C['tent'])
    for s_ in (-1, 1): chair(x, z + s_ * 0.55, 0.0 if s_ < 0 else PI)   # 椅子：在 z−0.55 的面向 +z

# ================= 後牆左半：微波爐、熱水瓶、餐具、咖啡、環保袋的層架；三色回收桶 =================
st_ = S['backStation']; sx0, sx1, sz0, sz1, shh = st_['x0'], st_['x1'], st_['z0'], st_['z1'], st_['h']
VC.crbox(sx0, sx1, 0, shh - 0.04, sz0, sz1, WHITE, r=0.008, seg=1); WD.rbox(sx0 - 0.02, sx1 + 0.02, shh - 0.04, shh, sz0, sz1 + 0.03, r=0.008, seg=1)
for x in [sx0 + k * 0.6 for k in range(1, int((sx1 - sx0) / 0.6) + 1)]: VC.cbox(x - 0.004, x + 0.004, 0.08, shh - 0.06, sz1, sz1 + 0.003, '#c8c6c0')
FZ = sz1 - 0.03   # 檯面上東西的正面
for x0 in (-3.75, -3.1):   # 微波爐兩台
    VC.cbox(x0, x0 + 0.55, shh, shh + 0.32, sz0 + 0.05, FZ, '#e6e6e2'); face(PR, (x0 + 0.275, shh + 0.16, FZ + 0.002), '+z', 0.55, 0.3, C['micro'])
clathe(VM, [(0.0, 0.0), (0.14, 0.0), (0.15, 0.02), (0.15, 0.36), (0.12, 0.42), (0.05, 0.44), (0.0, 0.44)], -2.2, shh, sz1 - 0.2, '#c4c8ca', seg=14)   # 熱水瓶
face(PR, (-2.2, shh + 0.2, sz1 - 0.048), '+z', 0.12, 0.18, C['kettle'])
for k in range(3): clathe(VC, [(0.0, 0.0), (0.04, 0.0), (0.05, 0.3), (0.0, 0.3)], -1.75 + k * 0.11, shh, sz1 - 0.15, '#f4f2ec', seg=10)   # 紙杯疊
for k in range(3): clathe(VM, [(0.0, 0.0), (0.045, 0.0), (0.045, 0.14), (0.0, 0.14)], -1.3 + k * 0.12, shh, sz1 - 0.15, '#b8bcbe', seg=10)   # 湯匙、筷子、吸管筒
for k in range(3):
    for j in range(6): ccyl(VC, (-1.3 + k * 0.12 + R.uniform(-0.02, 0.02), shh + 0.08, sz1 - 0.15 + R.uniform(-0.02, 0.02)), (-1.3 + k * 0.12 + R.uniform(-0.04, 0.04), shh + 0.26, sz1 - 0.15 + R.uniform(-0.04, 0.04)), 0.004, ['#e8e4dc', '#c8a878', '#3a8a4a'][k], seg=3)
VC.cbox(-0.95, -0.65, shh, shh + 0.1, sz1 - 0.25, sz1 - 0.08, WHITE)   # 餐巾紙
gbox(GD, -4.9, -4.0, shh, shh + 0.22, sz0 + 0.05, FZ, '+z', cell_u(GC['box'][0], 0.9))   # 咖啡、沖泡包
for y in st_['shelves']:   # 上面的木層板
    WD.rbox(sx0, sx1, y - 0.03, y, sz0, sz0 + 0.32, r=0.006, seg=1)
    for x in [sx0 + 0.15 + k * (sx1 - sx0 - 0.3) / 4 for k in range(5)]: VM.cbox(x - 0.01, x + 0.01, y - 0.16, y - 0.03, sz0, sz0 + 0.22, '#8a8c8e')
y1, y2 = st_['shelves']
for k, x in enumerate([sx0 + 0.25 + k * 0.34 for k in range(4)]):   # 環保袋（太陽標誌）
    face(PR, (x, y1 + 0.17, sz0 + 0.3), '+z', 0.28, 0.34, C['tote']); VC.cbox(x - 0.14, x + 0.14, y1, y1 + 0.34, sz0 + 0.08, sz0 + 0.295, '#e8e2d2')
gbox(GD, -3.9, -2.4, y1, y1 + 0.26, sz0 + 0.02, sz0 + 0.3, '+z', cell_u(GC['box'][1], 1.5))   # 咖啡豆、即溶咖啡
for k in range(8): clathe(VC, [(0.0, 0.0), (0.045, 0.0), (0.05, 0.12), (0.0, 0.12)], -2.2 + k * 0.2, y1, sz0 + 0.16, R.choice(['#f4f2ec', '#2a2a2a', '#c8a878', '#e8e0cc']), seg=8)   # 馬克杯、保溫杯
for k in range(4): clathe(GLS, [(0.0, 0.0), (0.06, 0.0), (0.06, 0.2), (0.04, 0.22), (0.0, 0.22)], -4.9 + k * 0.18, y2, sz0 + 0.16, None, seg=10)   # 咖啡豆罐
for k in range(4): clathe(VC, [(0.0, 0.0), (0.055, 0.0), (0.055, 0.12), (0.0, 0.12)], -4.9 + k * 0.18, y2, sz0 + 0.16, '#5a3820', seg=10)
for k in range(3): gbox(PR, -4.0 + k * 0.4, -3.65 + k * 0.4, y2, y2 + 0.22, sz0 + 0.03, sz0 + 0.3, '+z', C['carton'], side=sub(C['carton'], 0, 0, 0.1, 0.1))
for x in (-2.4, -1.0):   # 盆栽
    clathe(VC, [(0.0, 0.0), (0.1, 0.0), (0.12, 0.18), (0.0, 0.18)], x, y2, sz0 + 0.17, '#f2f0ea', seg=12)
    for k in range(9):
        a_ = k * 2 * PI / 9; f0 = set(VC.bm.faces); VC.ell((x + 0.11 * math.cos(a_), y2 + 0.3 + 0.08 * (k % 3) - 0.04, sz0 + 0.17 + 0.11 * math.sin(a_)), 0.1, 0.06, 0.1, seg=6, rings=4); VC.paint(nf(VC, f0), ['#4e7a34', '#6a9640', '#3e6a2c'][k % 3])
bn = S['bins']; bwid = (bn['x1'] - bn['x0']) / 3
for k, col in enumerate(('#46784a', '#34527f', '#7a5438')):
    x0 = bn['x0'] + k * bwid; VC.crbox(x0 + 0.01, x0 + bwid - 0.01, 0, 0.82, bn['z0'], bn['z1'], col, r=0.012, seg=1)
    VC.cbox(x0 + 0.1, x0 + bwid - 0.1, 0.6, 0.66, bn['z1'], bn['z1'] + 0.004, '#1e1e1e'); face(PR, (x0 + bwid / 2, 0.35, bn['z1'] + 0.006), '+z', 0.3, 0.38, C[f'bin{k}'])

# ================= 中間三排貨架 =================
LEV = [0.12, 0.42, 0.72, 1.02, 1.32]
KINDS = {1: ['bottle', 'paper', 'mix_daily', 'bottle', 'paper'], 2: ['chips', 'box', 'mix_snack', 'chips', 'box'], 3: ['noodle', 'noodle', 'can', 'stat', 'stat']}


SHAPE = {'bottle': 'bottle', 'paper': 'bag', 'mix_daily': 'bottle', 'chips': 'bag', 'box': 'bag', 'noodle': 'cup', 'mix_snack': 'bag', 'stat': 'bag', 'can': 'can', 'drink': 'bottle'}
BAGC = ['#e8b830', '#d83a2c', '#3a7ac8', '#4ea050', '#e87a30', '#8a4ab0', '#f0e0c0', '#e85a8a']


def real_item(shape, x, y, z, hmax, sgn):
    """近景一個包裝（中心 x、z，放在 y）：回傳沿 z 佔多少"""
    if shape == 'bottle':
        hb = min(hmax - 0.01, R.uniform(0.17, 0.25)); col = R.choice(['#f2f2ee', '#5a8ac8', '#e890b0', '#f0c040', '#70b070', '#e8e4dc', '#c8302a'])
        clathe(VC, [(0.0, 0.0), (0.038, 0.0), (0.04, hb * 0.72), (0.018, hb * 0.88), (0.013, hb), (0.0, hb)], x, y, z, col, seg=8)
        VC.cbox(x - 0.041 if sgn < 0 else x + 0.036, x - 0.036 if sgn < 0 else x + 0.041, y + hb * 0.3, y + hb * 0.55, z - 0.03, z + 0.03, R.choice(['#ffffff', '#2a2a2a', '#f0d060']))
        return 0.088
    if shape == 'can':
        clathe(VC, [(0.0, 0.0), (0.033, 0.0), (0.033, 0.12), (0.028, 0.125), (0.0, 0.125)], x, y, z, R.choice(['#c8302a', '#2a5aa8', '#e8e4dc', '#3a8a4a', '#e8a030']), seg=8)
        return 0.072
    if shape == 'cup':
        col = R.choice(['#d83a2c', '#e8e4dc', '#e8a030', '#c8302a', '#3a6ab0'])
        clathe(VC, [(0.0, 0.0), (0.045, 0.0), (0.06, 0.105), (0.063, 0.11), (0.0, 0.11)], x, y, z, col, seg=10)
        if hmax > 0.24: clathe(VC, [(0.0, 0.0), (0.045, 0.0), (0.06, 0.105), (0.063, 0.11), (0.0, 0.11)], x, y + 0.112, z, col, seg=10)
        return 0.13
    hb = min(hmax - 0.02, R.uniform(0.18, 0.26)); col = R.choice(BAGC)   # 袋裝：枕頭形（倒角方塊）＋上緣封口
    VC.crbox(x - 0.03, x + 0.03, y, y + hb, z - 0.06, z + 0.06, col, r=0.025, seg=2)
    VC.cbox(x - 0.012, x + 0.012, y + hb - 0.005, y + hb + 0.012, z - 0.058, z + 0.058, col, k=0.8)
    f0 = set(VC.bm.faces); VC.ell((x + sgn * 0.03, y + hb * 0.45, z), 0.008, 0.045, 0.04, seg=6, rings=3); VC.paint(nf(VC, f0), R.choice(['#f6d270', '#ffffff', '#f0a050']))
    return 0.13


def shelf_run(xb, sgn, z0, z1, levels, top, kinds, dep=0.38, real=None):
    """沿 z 的一段貨架（一面）：xb＝背板、sgn＝商品朝向（+1＝+x）；每 1.2 m 一格"""
    nseg = max(1, round((z1 - z0) / 1.2)); sl = (z1 - z0) / nseg; n = '+x' if sgn > 0 else '-x'
    for i, y in enumerate(levels):
        ytop = levels[i + 1] if i + 1 < len(levels) else top
        xa, xc = xb, xb + sgn * dep
        VC.cbox(min(xa, xc), max(xa, xc), y - 0.025, y, z0, z1, '#d6d6d2')
        face(GD, (xc + sgn * 0.002, y - 0.022, (z0 + z1) / 2), n, z1 - z0, 0.045, cell_u(GC['price'][R.randrange(2)], z1 - z0, per=1.2 * 3))
        for s in range(nseg):
            za, zb = z0 + s * sl + 0.008, z0 + (s + 1) * sl - 0.008
            rect = cell_u(GC[kinds[i % len(kinds)]][R.randrange(2)], zb - za)
            d = dep * R.uniform(0.86, 0.96); hh = (ytop - y) - R.uniform(0.015, 0.035)
            if real and s == nseg - 1:   # 近景那一段（靠店門）：最前面一排是真的包裝（瓶裝、杯麵、袋裝、罐裝），後面是貼圖方塊
                xf = xb + sgn * (dep - 0.1); gbox(GD, min(xb, xf), max(xb, xf), y, y + hh, za, zb, n, rect)
                shape = SHAPE.get(kinds[i % len(kinds)], 'bag'); xc_ = xb + sgn * (dep - 0.05); z = za + 0.06
                while z < zb - 0.05: z += real_item(shape, xc_, y, z, hh, sgn)
                continue
            xf = xb + sgn * d
            gbox(GD, min(xb, xf), max(xb, xf), y, y + hh, za, zb, n, rect)


for g in S['gondolas']:
    gx, z0, z1, gh = g['x'], g['z0'], g['z1'], g['h']; hw = g['w'] / 2
    VC.cbox(gx - hw, gx + hw, 0, 0.1, z0, z1, '#e4e2dc'); VC.cbox(gx - 0.02, gx + 0.02, 0.1, gh + 0.05, z0, z1, '#ecebe6')
    for z in (z0, z1): VC.cbox(gx - hw, gx + hw, 0, gh, z - 0.015 if z == z0 else z - 0.03, z + 0.03 if z == z0 else z + 0.015, '#f0efea')
    kinds = KINDS[g['n']]
    for sgn in (1, -1): shelf_run(gx + sgn * 0.02, sgn, z0 + 0.03, z1 - 0.03, LEV, gh, kinds[::sgn] if sgn < 0 else kinds, dep=hw - 0.03, real=True)
    # 兩頭的端面也擺商品（淺的，0.22 m）：+z 那頭（端架的除外）、−z 那頭
    for zend, n in ((z1, '+z'), (z0, '-z')):
        if n == '+z' and 'endcap' in g: continue
        sg = 1 if n == '+z' else -1
        for i, y in enumerate(LEV[:4]):
            VC.cbox(gx - hw + 0.03, gx + hw - 0.03, y - 0.025, y, min(zend, zend + sg * 0.25), max(zend, zend + sg * 0.25), '#d6d6d2')
            gbox(GD, gx - hw + 0.04, gx + hw - 0.04, y, LEV[i + 1] - 0.04, min(zend, zend + sg * 0.22), max(zend, zend + sg * 0.22), n, cell_u(GC[kinds[(i + 2) % len(kinds)]][R.randrange(2)], g['w'] - 0.08))
        VC.cbox(gx - hw, gx + hw, 0, 0.1, min(zend, zend + sg * 0.27), max(zend, zend + sg * 0.27), '#e4e2dc')
    # 吊牌（朝店門，雙面）
    zc = S['signZ']
    face(PR, (gx, 2.5, zc), '+z', 1.05, 0.31, C[f'hangG{g["n"] - 1}'], two=True)
    for dx in (-0.45, 0.45): ccyl(VM, (gx + dx, H, zc), (gx + dx, 2.68, zc), 0.003, '#8a8c8e', seg=4)
    if 'endcap' in g:   # 端架：下兩層泡麵碗、上兩層零食；頂上綠色招牌
        e = g['endcap']; ez0, ez1, eh = e['z0'], e['z1'], e['h']; ehw = e['w'] / 2
        VC.cbox(gx - ehw, gx + ehw, 0, 0.1, ez0, ez1, '#e4e2dc'); VC.cbox(gx - ehw, gx + ehw, 0.1, eh, ez0 - 0.02, ez0 + 0.02, '#ecebe6')
        for x in (gx - ehw, gx + ehw): VC.cbox(x - 0.015 if x < gx else x - 0.03, x + 0.03 if x < gx else x + 0.015, 0, eh, ez0, ez1, '#f0efea')
        VC.cbox(gx - ehw, gx + ehw, eh - 0.03, eh, ez0, ez1, '#f0efea')
        lv = [0.1, 0.4, 0.72, 1.04, 1.36, eh - 0.04]
        for i, y in enumerate(lv[:-1]):
            VC.cbox(gx - ehw + 0.03, gx + ehw - 0.03, y - 0.025, y, ez0, ez1 - 0.02, '#d6d6d2')
            face(GD, (gx, y - 0.022, ez1 - 0.018), '+z', e['w'] - 0.06, 0.045, cell_u(GC['price'][0], 1.14, per=3.6))
            if i < 2:   # 泡麵碗（真的模型，一層兩排、前排疊兩個）
                for row in range(2):
                    for k in range(7):
                        cx = gx - 0.45 + k * 0.15; cz = ez1 - 0.12 - row * 0.2; col = R.choice(['#d83a2c', '#e8e4dc', '#e8a030', '#c8302a'])
                        clathe(VC, [(0.0, 0.0), (0.05, 0.0), (0.065, 0.11), (0.068, 0.115), (0.0, 0.115)], cx, y, cz, col, seg=10)
                        VC.cbox(cx - 0.06, cx + 0.06, y + 0.115, y + 0.12, cz - 0.06, cz + 0.06, R.choice(['#f2f0ea', '#e8c060', '#d8d4cc']))
                        if row == 0: clathe(VC, [(0.0, 0.0), (0.05, 0.0), (0.065, 0.11), (0.068, 0.115), (0.0, 0.115)], cx, y + 0.12, cz, col, seg=10)
            else:   # 零食：前面一排斜放的袋子（貼圖），後面塞滿
                gbox(GD, gx - ehw + 0.04, gx + ehw - 0.04, y, lv[i + 1] - 0.03, ez0 + 0.03, ez1 - 0.12, '+z', cell_u(GC['chips'][i % 2], 1.12))
                for k in range(8):
                    bx = gx - ehw + 0.1 + k * 0.143; hb = (lv[i + 1] - y) - 0.05
                    gbox(GD, bx - 0.065, bx + 0.065, y, y + hb, ez1 - 0.12, ez1 - 0.03, '+z', sub(GC[['chips', 'box', 'chips'][i - 2]][k % 2], (k * 0.11) % 0.9, 0, (k * 0.11) % 0.9 + 0.085, 1))
        for dx in (-0.35, 0.35): VM.cbox(gx + dx - 0.015, gx + dx + 0.015, eh, eh + 0.14, (ez0 + ez1) / 2 - 0.015, (ez0 + ez1) / 2 + 0.015, '#8a8c8e')
        face(PR, (gx, eh + 0.3, (ez0 + ez1) / 2 + 0.01), '+z', 1.15, 0.29, C['endsign'], two=True)

# ================= 西牆壁架（實牆上，面向 +x） =================
wsh = S['westShelf']
VC.cbox(X0, wsh['x1'], 0, 0.1, wsh['z0'], wsh['z1'], '#e4e2dc'); VC.cbox(X0, X0 + 0.03, 0.1, wsh['h'], wsh['z0'], wsh['z1'], '#ecebe6')
for z in (wsh['z0'], wsh['z1']): VC.cbox(X0, wsh['x1'], 0, wsh['h'], z - 0.015, z + 0.015, '#f0efea')
shelf_run(X0 + 0.03, 1, wsh['z0'] + 0.02, wsh['z1'] - 0.02, [0.12, 0.44, 0.76, 1.08, 1.4], wsh['h'], ['drink', 'paper', 'box', 'chips', 'bottle'], dep=wsh['x1'] - wsh['x0'] - 0.05, real=True)
face(PR, (X0 + 0.005, 2.1, (wsh['z0'] + wsh['z1']) / 2), '+x', wsh['z1'] - wsh['z0'], 0.12, C['greenband'])
for k in range(int((wsh['z1'] - wsh['z0']) / 1.2)):   # 頂上的庫存紙箱
    z = wsh['z0'] + 0.2 + k * 1.2
    CK.ph_put('cardboard_box_01', X0 + 0.22, wsh['h'], z + 0.25, yaw=PI / 2 + R.uniform(-0.12, 0.12), height=0.26 + R.uniform(-0.03, 0.03), decimate=0.012)   # 庫存紙箱：Poly Haven 掃描

# ================= 後牆右段冷藏櫃（綠色頂框，面向店門 +z）、右牆壁架、平台冷凍櫃 =================
co = S['coolers']; cz1 = co['z1']; ch = co['h']   # 櫃子 z co.z0（後牆）～co.z1（門）；沿 x 排
VC.cbox(co['x0'], co['x1'], 0, 0.12, co['z0'], cz1, '#5a5c5c'); VC.cbox(co['x0'], co['x1'], ch - 0.2, ch, co['z0'], cz1, GREEN); VC.cbox(co['x0'], co['x1'], ch, H, co['z0'], cz1, WALLC)
VC.cbox(co['x0'] - 0.04, co['x0'], 0, ch, co['z0'], cz1, WHITE)
cells = {'drink': ['drink0', 'drink1'], 'fresh': ['fresh2', 'fresh2'], 'frozen': ['frozen3']}
for pi_, p in enumerate(co['parts']):
    face(PR, ((p['x0'] + p['x1']) / 2, ch - 0.1, cz1 + 0.004), '+z', p['x1'] - p['x0'] - 0.06, 0.17, C[f'cool{pi_}'])
    dw = (p['x1'] - p['x0']) / p['doors']
    for k in range(p['doors']):
        xa, xb = p['x0'] + k * dw, p['x0'] + (k + 1) * dw
        face(COOL, ((xa + xb) / 2, (0.12 + ch - 0.2) / 2, co['z0'] + 0.04), '+z', xb - xa - 0.04, ch - 0.32, CC[cells[p['kind']][k % len(cells[p['kind']])]])
        VC.cbox(xa - 0.02, xa + 0.02, 0.12, ch - 0.2, co['z0'], cz1 - 0.04, '#e6e8e8')
        VM.cbox(xa - 0.025, xa + 0.025, 0.12, ch - 0.2, cz1 - 0.03, cz1 + 0.02, '#d0d4d6'); VM.cbox(xb - 0.025, xb + 0.025, 0.12, ch - 0.2, cz1 - 0.03, cz1 + 0.02, '#d0d4d6')
        VM.cbox(xa, xb, 0.12, 0.17, cz1 - 0.03, cz1 + 0.02, '#d0d4d6'); VM.cbox(xa, xb, ch - 0.25, ch - 0.2, cz1 - 0.03, cz1 + 0.02, '#d0d4d6')
        face(GLS, ((xa + xb) / 2, (0.12 + ch - 0.2) / 2, cz1 - 0.005), '+z', xb - xa - 0.05, ch - 0.32, (0, 0, 1, 1))
        ccyl(VM, (xb - 0.09, 0.7, cz1 + 0.045), (xb - 0.09, 1.6, cz1 + 0.045), 0.012, '#b8bcbe', seg=6)
ws = S['wallShelf']   # 右牆壁架（冷藏櫃和倉庫之間，面向 −x）
VC.cbox(ws['x0'], X1, 0, 0.1, ws['z0'], ws['z1'], '#e4e2dc'); VC.cbox(X1 - 0.03, X1, 0.1, ws['h'], ws['z0'], ws['z1'], '#ecebe6')
for z in (ws['z0'], ws['z1']): VC.cbox(ws['x0'], X1, 0, ws['h'], z - 0.015, z + 0.015, '#f0efea')
shelf_run(X1 - 0.03, -1, ws['z0'] + 0.02, ws['z1'] - 0.02, [0.12, 0.44, 0.76, 1.08, 1.4], ws['h'], ['drink', 'can', 'box', 'chips', 'drink'], dep=ws['x1'] - ws['x0'] - 0.05)
cf = S['chestFreezer']
VC.crbox(cf['x0'], cf['x1'], 0, cf['h'], cf['z0'], cf['z1'], WHITE, r=0.02, seg=1)
face(COOL, ((cf['x0'] + cf['x1']) / 2, cf['h'] + 0.002, (cf['z0'] + cf['z1']) / 2), '+y', cf['x1'] - cf['x0'] - 0.1, cf['z1'] - cf['z0'] - 0.1, sub(CC['frozen3'], 0, 0.4, 1, 0.75), up=(0, 0, -1))
face(GLS, ((cf['x0'] + cf['x1']) / 2, cf['h'] + 0.06, (cf['z0'] + cf['z1']) / 2), '+y', cf['x1'] - cf['x0'] - 0.04, cf['z1'] - cf['z0'] - 0.04, (0, 0, 1, 1), up=(0, 0, -1))
VM.cbox(cf['x0'], cf['x1'], cf['h'], cf['h'] + 0.06, cf['z0'], cf['z0'] + 0.03, '#c0c4c6'); VM.cbox(cf['x0'], cf['x1'], cf['h'], cf['h'] + 0.06, cf['z1'] - 0.03, cf['z1'], '#c0c4c6')
face(PR, (cf['x0'] - 0.003, cf['h'] - 0.12, (cf['z0'] + cf['z1']) / 2), '-x', 0.9, 0.12, C['cool2'])

# ================= 櫃台（收銀、熱食櫃、咖啡）、櫃台後面 =================
ct = S['counter']; ch_ = ct['h']; cx0, cx1 = ct['x0'], ct['x1']; CX0 = cx0
for (za, zb) in ((ct['z0'], ct['z1']), (ct['flap']['z0'], ct['flap']['z1'])):
    WD.box(cx0 + 0.02, cx1, 0.12, ch_ - 0.04, za, zb); VC.cbox(cx0 + 0.06, cx1, 0, 0.12, za, zb, GREEN)
    VC.crbox(cx0 - 0.06, cx1 + 0.05, ch_ - 0.04, ch_, za, zb, '#f6f6f2', r=0.008, seg=1)
WD.box(cx0 + 0.02, cx1, 0.12, ch_ - 0.04, ct['z1'], ct['flap']['z1'])
for z in (0.2, 1.3, 2.0): VC.cbox(cx0 + 0.015, cx0 + 0.025, 0.12, ch_ - 0.04, z - 0.01, z + 0.01, '#c8b08a')
face(PR, (cx0 + 0.01, 0.55, 2.2), '-x', 0.5, 0.73, C['poster_student']); face(PR, (cx0 + 0.01, 0.55, 2.85), '-x', 0.5, 0.73, C['poster_night'])
# 收銀機（客人那面、店員那面）、刷卡機、行動支付牌
VC.cbox((CX0 + 0.380), (CX0 + 0.680), ch_, ch_ + 0.08, 0.55, 0.95, '#2c2e30'); VC.cbox((CX0 + 0.460), (CX0 + 0.500), ch_ + 0.08, ch_ + 0.18, 0.72, 0.78, '#2c2e30')
VC.cbox((CX0 + 0.420), (CX0 + 0.560), ch_ + 0.18, ch_ + 0.42, 0.54, 0.96, '#2c2e30'); face(SCR, ((CX0 + 0.415), ch_ + 0.3, 0.75), '-x', 0.36, 0.2, SC['pos2']); face(SCR, ((CX0 + 0.565), ch_ + 0.3, 0.75), '+x', 0.36, 0.2, SC['pos'])
VC.cbox((CX0 + 0.150), (CX0 + 0.260), ch_, ch_ + 0.12, 1.1, 1.18, '#2c2e30'); face(SCR, ((CX0 + 0.148), ch_ + 0.08, 1.14), '-x', 0.06, 0.06, SC['reader'])
VC.cbox((CX0 + 0.100), (CX0 + 0.120), ch_, ch_ + 0.16, 0.15, 0.42, '#e8e8e4'); face(PR, ((CX0 + 0.097), ch_ + 0.09, 0.285), '-x', 0.26, 0.13, C['pay'])
# 小商品架（口香糖、糖果）
gbox(GD, (CX0 + 0.080), (CX0 + 0.350), ch_, ch_ + 0.28, 1.35, 1.95, '-x', cell_u(GC['box'][1], 0.6))
gbox(GD, (CX0 + 0.150), (CX0 + 0.350), ch_ + 0.28, ch_ + 0.44, 1.4, 1.9, '-x', cell_u(GC['can'][0], 0.5))
face(PR, ((CX0 + 0.075), ch_ + 0.36, 1.65), '-x', 0.2, 0.16, C['pop'])
# 熱食櫃（玻璃、燈、熱狗、茶葉蛋、包子）
hz0, hz1 = 2.05, 3.15; hx0, hx1 = (CX0 + 0.080), (CX0 + 0.720); hy0, hy1 = ch_ + 0.08, ch_ + 0.56
VM.cbox(hx0, hx1, ch_, hy0, hz0, hz1, '#b8bcbe')
for (x, z) in ((hx0, hz0), (hx0, hz1), (hx1, hz0), (hx1, hz1)): VM.cbox(x - 0.015, x + 0.015, hy0, hy1, z - 0.015, z + 0.015, '#b8bcbe')
VM.cbox(hx0, hx1, hy1, hy1 + 0.04, hz0, hz1, '#b8bcbe'); face(SCR, ((hx0 + hx1) / 2, hy1 - 0.002, (hz0 + hz1) / 2), '-y', hx1 - hx0 - 0.04, hz1 - hz0 - 0.04, SC['lamp'], up=(0, 0, 1))
face(GLS, (hx0 - 0.005, (hy0 + hy1) / 2, (hz0 + hz1) / 2), '-x', hz1 - hz0, hy1 - hy0, (0, 0, 1, 1))
for z in (hz0 - 0.005, hz1 + 0.005): face(GLS, ((hx0 + hx1) / 2, (hy0 + hy1) / 2, z), '-z' if z < 2.5 else '+z', hx1 - hx0, hy1 - hy0, (0, 0, 1, 1))
for k in range(8):   # 熱狗（滾輪上）
    z = hz0 + 0.08 + k * 0.06; ccyl(VC, (hx0 + 0.08, hy0 + 0.03, z), (hx0 + 0.36, hy0 + 0.03, z), 0.014, '#b05a2a', seg=6)
for k in range(18):   # 炸物（雞塊、炸雞、可樂餅）：下層右半、上層兩排
    f0 = set(VC.bm.faces); VC.ell((hx0 + 0.42 + (k % 3) * 0.075 + R.uniform(-0.01, 0.01), hy0 + 0.035, hz0 + 0.08 + (k // 3) * 0.17), 0.04, 0.028, 0.035, seg=7, rings=4); VC.paint(nf(VC, f0), R.choice(['#d49440', '#c8802e', '#e0a850', '#b87028']))
VM.cbox(hx0 + 0.02, hx1 - 0.02, hy0 + 0.22, hy0 + 0.23, hz0 + 0.02, hz1 - 0.02, '#c8ccce')
for k in range(14):
    f0 = set(VC.bm.faces); VC.ell((hx0 + 0.12 + (k % 4) * 0.13, hy0 + 0.27, hz0 + 0.12 + (k // 4) * 0.26), 0.055, 0.04, 0.045, seg=8, rings=4); VC.paint(nf(VC, f0), R.choice(['#c88a3a', '#d49440', '#b8742a']))
face(PR, (hx0 - 0.006, hy1 + 0.09, (hz0 + hz1) / 2), '-x', 0.6, 0.2, C['hotsign']); VC.cbox(hx0 + 0.02, hx0 + 0.04, hy1 + 0.04, hy1 + 0.19, 2.35, 2.85, '#e8e8e4')
# 咖啡那一側：杯架、吸管、糖包
for k in range(3): clathe(VC, [(0.0, 0.0), (0.04, 0.0), (0.05, 0.3), (0.0, 0.3)], (CX0 + 0.250) + k * 0.12, ch_, -0.65, '#f4f2ec', seg=10)
clathe(VM, [(0.0, 0.0), (0.05, 0.0), (0.05, 0.16), (0.0, 0.16)], (CX0 + 0.220), ch_, -0.2, '#b8bcbe', seg=10)
for k in range(8): ccyl(VC, ((CX0 + 0.220) + R.uniform(-0.03, 0.03), ch_ + 0.1, -0.2 + R.uniform(-0.03, 0.03)), ((CX0 + 0.220) + R.uniform(-0.05, 0.05), ch_ + 0.32, -0.2 + R.uniform(-0.05, 0.05)), 0.004, R.choice(['#3a8a4a', '#e8e4dc', '#d84030']), seg=3)
VC.cbox((CX0 + 0.150), (CX0 + 0.400), ch_, ch_ + 0.08, -0.05, 0.1, '#d8c8a0')
# 櫃台後面：矮櫃、咖啡機兩台、杯子、上方層板；右牆標誌、咖啡價目黑板
bc = S['backCounter']; BX1 = bc['x1']; cw = S['counterWall']
VC.cbox(cw['x0'], X1, 0, H, cw['z0'] - 0.12, cw['z0'], WALLC); VC.cbox(cw['x0'], X1, 0, H, cw['z1'], cw['z1'] + 0.12, WALLC)   # 倉庫的北牆、南牆
VC.cbox(4.4, 5.2, 0, 2.1, cw['z1'] + 0.12, cw['z1'] + 0.15, '#d6d2c8'); face(PR, (4.8, 1.6, cw['z1'] + 0.155), '+z', 0.5, 0.19, C['staff'])   # 倉庫門
VC.cbox(cw['x0'], cw['x1'], 0, H, cw['z0'], cw['z1'], WALLC); VC.cbox(cw['x0'] - 0.005, cw['x0'], 0, 0.1, cw['z0'], cw['z1'], '#b8b6ae')   # 標誌牆（牆後是倉庫）
VC.crbox(bc['x0'], bc['x1'], 0, bc['h'] - 0.04, bc['z0'], bc['z1'], WHITE, r=0.006, seg=1); VC.crbox(bc['x0'] - 0.03, bc['x1'], bc['h'] - 0.04, bc['h'], bc['z0'], bc['z1'], '#f6f6f2', r=0.006, seg=1)
for z in [bc['z0'] + k * 0.65 for k in range(1, 8)]: VC.cbox(bc['x0'] - 0.004, bc['x0'], 0.1, bc['h'] - 0.08, z - 0.004, z + 0.004, '#c8c6c0')
for zc in (-0.45, 0.25):
    VC.cbox((BX1 - 0.480), (BX1 - 0.040), bc['h'], bc['h'] + 0.62, zc - 0.2, zc + 0.2, '#2a2c2e'); VM.cbox((BX1 - 0.500), (BX1 - 0.480), bc['h'] + 0.1, bc['h'] + 0.58, zc - 0.18, zc + 0.18, '#b8bcbe')
    face(SCR, ((BX1 - 0.505), bc['h'] + 0.46, zc), '-x', 0.18, 0.13, SC['coffee']); VM.cbox((BX1 - 0.550), (BX1 - 0.400), bc['h'] + 0.02, bc['h'] + 0.04, zc - 0.1, zc + 0.1, '#8a8e90')
    clathe(GLS, [(0.0, 0.0), (0.07, 0.0), (0.08, 0.2), (0.0, 0.2)], (BX1 - 0.250), bc['h'] + 0.62, zc, None, seg=10); clathe(VC, [(0.0, 0.0), (0.065, 0.0), (0.07, 0.12), (0.0, 0.12)], (BX1 - 0.250), bc['h'] + 0.63, zc, '#4a2c18', seg=10)
for k in range(5): clathe(VC, [(0.0, 0.0), (0.045, 0.0), (0.055, 0.34), (0.0, 0.34)], (BX1 - 0.280), bc['h'], 0.55 + k * 0.13, '#f4f2ec', seg=10)
for k in range(0): VC.cbox((BX1 - 0.450), (BX1 - 0.050), bc['h'], bc['h'] + R.uniform(0.15, 0.3), 1.8 + k * 0.45, 2.2 + k * 0.45, R.choice(['#e8dcc0', '#d0b890', '#f0ece2']))
for y in (1.65, 1.95):
    WD.rbox((BX1 - 0.400), BX1, y - 0.03, y, -0.85, 0.7, r=0.006, seg=1)
    for k in range(6): clathe(VC, [(0.0, 0.0), (0.04, 0.0), (0.045, 0.11), (0.0, 0.11)], (BX1 - 0.180), y, -0.7 + k * 0.24, R.choice(['#f4f2ec', '#e8e0cc', '#2a2a2a']), seg=8)
clathe(VC, [(0.0, 0.0), (0.09, 0.0), (0.1, 0.15), (0.0, 0.15)], (BX1 - 0.200), 1.95, 0.55, '#f2f0ea', seg=10)
for k in range(8):
    a = k * 2 * PI / 8; f0 = set(VC.bm.faces); VC.ell(((BX1 - 0.200) + 0.1 * math.cos(a), 2.18 + 0.07 * (k % 2), 0.55 + 0.12 * math.sin(a)), 0.09, 0.05, 0.1, seg=6, rings=4); VC.paint(nf(VC, f0), ['#4e7a34', '#6a9640', '#3e6a2c'][k % 3])
VC.cbox(cw['x0'] - 0.03, cw['x0'], 2.2, 3.0, -1.0, 1.25, '#f6f1e2'); face(PR, (cw['x0'] - 0.032, 2.6, 0.125), '-x', 2.2, 0.645, C['logo'])
VC.cbox(cw['x0'] - 0.04, cw['x0'], 2.22, 3.18, 1.48, 2.22, '#3a3a36'); face(PR, (cw['x0'] - 0.042, 2.7, 1.85), '-x', 0.68, 0.9, C['coffee'])
face(PR, (cw['x0'] - 0.004, 1.85, 1.4), '-x', 4.8, 0.1, C['greenband'])
VC.cbox(cw['x0'] - 0.05, cw['x0'], 0, H, 1.3, 1.42, GREEN)   # 綠色的柱子（參考圖標誌和黑板中間）
VC.cbox(cx1, S['counterWall']['x0'], 0, 1.1, S['endPanel']['z0'], S['endPanel']['z1'], WHITE)

# ================= 包裹暫取區櫃 =================
lk = S['lockers']
VC.crbox(lk['x0'], lk['x1'], 0, lk['h'], lk['z0'], lk['z1'], '#ecebe6', r=0.01, seg=1)
rows_ = [0.1, 0.5, 0.9, 1.3, 1.65, 2.0]
for y in rows_[1:-1]: VC.cbox(lk['x0'] - 0.004, lk['x0'], y - 0.005, y + 0.005, lk['z0'] + 0.02, lk['z1'] - 0.02, '#b8b6ae')
for z in (lk['z0'] + 0.38, lk['z0'] + 0.77): VC.cbox(lk['x0'] - 0.004, lk['x0'], 0.05, lk['h'] - 0.02, z - 0.005, z + 0.005, '#b8b6ae')
for y in rows_[:-1]:
    for z in (lk['z0'] + 0.33, lk['z0'] + 0.72, lk['z0'] + 1.1): VM.cbox(lk['x0'] - 0.02, lk['x0'], y + 0.17, y + 0.2, z - 0.05, z, '#8a8c8e')
face(SCR, (lk['x0'] - 0.006, 1.15, lk['z0'] + 0.57), '-x', 0.26, 0.2, SC['kiosk'])
fr = S['frontRack']   # 右前角壁架
VC.cbox(fr['x0'], X1, 0, 0.1, fr['z0'], fr['z1'], '#e4e2dc'); VC.cbox(X1 - 0.03, X1, 0.1, fr['h'], fr['z0'], fr['z1'], '#ecebe6')
for z in (fr['z0'], fr['z1']): VC.cbox(fr['x0'], X1, 0, fr['h'], z - 0.015, z + 0.015, '#f0efea')
shelf_run(X1 - 0.03, -1, fr['z0'] + 0.02, fr['z1'] - 0.02, [0.12, 0.44, 0.76, 1.08], fr['h'], ['paper', 'stat', 'box', 'stat'], dep=fr['x1'] - fr['x0'] - 0.05)
face(PR, (lk['x0'] - 0.006, lk['h'] - 0.18, (lk['z0'] + lk['z1']) / 2), '-x', 0.54, 0.36, C['parcel'])

# ================= 門口：地墊、傘架 =================
dm = S['doormat']
VC.cbox(dm['x0'], dm['x1'], 0, 0.008, dm['z0'], dm['z1'], '#3e4e34')
face(PR, ((dm['x0'] + dm['x1']) / 2, 0.0095, (dm['z0'] + dm['z1']) / 2), '+y', dm['x1'] - dm['x0'], dm['z1'] - dm['z0'], C['mat'], up=(0, 0, -1))
ub = S['umbrella']; VM.cbox(ub['x0'], ub['x1'], 0.0, 0.5, ub['z0'], ub['z1'], '#c8ccce')
for k in range(4): ccyl(VC, (ub['x0'] + 0.1 + k * 0.1, 0.05, (ub['z0'] + ub['z1']) / 2), (ub['x0'] + 0.07 + k * 0.11, 0.95, (ub['z0'] + ub['z1']) / 2 + 0.02), 0.03, R.choice(['#1e2a3a', '#e8e8e4', '#3a5a3a']), seg=6, r2=0.012)

# ================= 窗外（只給渲染用） =================
if PREVIEW:
    om = img_mat('PREVIEW_outside', P['outside'], rough=1.0, emit=0.75); ob_ = Mesh('PREVIEW_outside', om)
    face(ob_, (-2.0, 2.6, Z1 + 6.0), '-z', 22, 8.2, (0, 0, 1, 1)); ob_.finish(root, uv=False)

# ================= 收尾：牆分組、合併、匯出 =================
for (side, key), m in list(WG.items()): m.finish(G[side], uv=(key == 'vm'), smooth=False)
VC.finish(root, uv=True); VM.finish(root, uv=True, smooth=True)   # 頂點色 × 材質組：要盒狀 UV
WD.finish(root, uv=True)
for m, pr in ((PR, None), (GD, None), (DEC, None), (COOL, None), (SCR, None), (LED, None), (GLS, {'glass': 1}), (GLSF, {'glass': 1, 'side': 'front'}), (DECF, {'side': 'front'})): m.finish(root, uv=(m is LED), props=pr)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
CK.drop_protos()
L.merge_by_material(root, keep=lambda ob: ob.name.startswith(('WALL_', 'PREVIEW', 'GLASS_', 'DECAL_', 'S_ph_')), key=lambda ob: '')
st_ = L.export(OUT)
mats = sorted({ms.material.name for ob in bpy.data.objects if ob.type == 'MESH' for ms in ob.material_slots if ms.material})
print('OK', OUT, 'materials', len(mats), mats); print('CC0_USED', CK.used())
