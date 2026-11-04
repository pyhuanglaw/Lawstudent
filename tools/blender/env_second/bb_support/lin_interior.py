"""林家乾麵（溫州街 A4，zone id wz_lin；AA_654）室內 v1 → GLB。BB（帳號 A）2026-11-04。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/lin_interior.py [-- --out <glb>] [--preview]
  要在美術線的 worktree 跑（lib2.py、b3lib.py）；配置用 node 讀 src/data/lin_layout.js（Blender 和遊戲同一份數字）。
照 SCENE_RULES 第 11、12 節：參考圖 docs/story_planning/ref_images/shops/wz_lin_int.webp 就是規格；拆圖清單在 docs/story_planning/bb_models/lin/README.md。
房間、門窗、出口、出生點照 claude/confident-ritchie-8rwh7t 的 wz_shops_layout.js 的 lin（LAWWW2：不動）。外觀（雨遮、招牌、攤車朝街那一面）是 LAWWW2 的。
做法：磨石子地、天花板、米白牆、木頭、不鏽鋼是 PIL＋numpy 自己畫的貼圖（lin_tex.py）；招牌、紅紙菜單（照室內圖，AA_654 第 4 節）、月曆、時鐘、
  玻璃磚窗、白磁磚在一張印刷圖集；碗、凳子、醬料瓶用亮面頂點色；材質 12 個以內。
--preview：正面開口外面加一張街景卡片（只給渲染用，正式 GLB 裡沒有）。
D77：沒有真實品牌；D112：地板是淺色磨石子，不是深色木頭；金屬度 ≤ 0.45；天花板單面朝下。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import lin_tex as TX   # noqa: E402

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
)
M['wood']['tile'] = 1.0; M['steel']['tile'] = 0.7
VC = CMesh('lin_vc', M['vc']); VM = CMesh('lin_vm', M['vm'])
WD = Mesh('lin_wood', M['wood']); ST = Mesh('lin_steel', M['steel']); PR = Mesh('lin_prints', M['print'])
GLS = Mesh('lin_glass', M['glass']); GL = CMesh('lin_gloss', M['gloss']); WARM = Mesh('lin_warm', M['warm']); SCR = Mesh('lin_screens', M['screen'])
GLSF = Mesh('GLASS_front', M['glass'])   # 正面的玻璃：不放進淡出群組（玻璃規則），分開一個物件，鏡頭在店外時可以單獨藏
WG = {}
WARMM = WARM


def wg(side, key):
    if (side, key) not in WG: WG[(side, key)] = (CMesh if key in ('vc', 'vm') else Mesh)(f'WALL_{side}_{key}', M[key])
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



