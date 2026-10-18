"""美國交換：校園（SCN-US-02；區域 us_campus）→ GLB。LAWWW2-C 2026-10-18；Blender 5.2：
  python3 tools/blender/env_second/us_campus_layout_gen.py
  /opt/blenv/bin/python tools/blender/env_second/us_campus.py [-- --out assets/models/env/second_ai/us_campus.glb] [--preview <png> --cam law|door|gate|walk|bus|aerial] [--samples 24] [--res 1280x720]
第二版：照使用者 2026-10-18 01:0x 給的法學院、校門照片（照片不進 repo；文字描述在 docs/art-rebuild/second_ai/HANDOFF.md）：
- 法學院＝us_law_kit.law_school（石灰岩方塔＋三層凸窗＋圓弧拱門＋七階台階、東翼兩層、西翼三層）；塔的正面朝街（南）。
- 人行道邊一道亂石矮擋土牆（Poly Haven japanese_stone_wall），後面是高 0.5 m 的草坪和大樹（走不上去）；走道穿過矮牆接到台階前的小廣場。
- 校門＝us_law_kit.campus_gate（兩座門樓、八角小亭）在法學院西邊（左邊），門前紅磚廣場＋石灰岩矮花台；門後是老校區（us_campus_kit.gothic_hall 的陡屋頂老系館、
  大樹、紅磚步道）——背景，走不到（往活動中心＝區域出口）。
- 馬路（雙黃線）、對街的兩層磚造房子、東西兩個路口（斑馬線），四周一圈樹。公車站（玻璃候車亭、站牌只有 BUS 圖示）。
D77：不放校名、校徽、銅牌文字、公司名。配置 us_campus.layout.json（遊戲讀同一份）。座標＝配置的區域座標（x 東、z 南、y 上）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Vector, Matrix   # noqa: E402
import us_campus_kit as UK   # noqa: E402
import us_law_kit as LK   # noqa: E402
import us_oldcampus_kit as OK   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
OUT = os.path.join(L.ROOT, opt('--out', 'assets/models/env/second_ai/us_campus.glb')); PREVIEW = opt('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_campus.layout.json'), encoding='utf-8'))
assert J.get('version') == 3, '先跑 us_campus_layout_gen.py（第三版配置）'
rng = random.Random(20261018)
B.reset(texres=512)
root = B.group('us_campus', props={'kind': 'us_campus', 'layout': 'us_campus.layout.json'})
UM = UK.materials('usu_'); LM = LK.materials('usl_')
M = {'grass': L.pbr('usu_grass', 'grass_ground', tile=3.0, target='#5f7444', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
     'grass_far': L.flat('usu_grass_far', '#5a6b42', rough=0.95),
     'brick': L.pbr('usu_brick_paving', 'brick_pavement_04', tile=3.2, target='#9c4b35', contrast=1.2, normal=0.5, maps=('diff', 'nor'), rough_value=0.85),   # 紅磚（磚 20×10 cm：貼圖一張約 16 塊寬）
     'conc': L.pbr('usu_sidewalk', 'granular_concrete', tile=2.0, target='#b3aea3', contrast=0.8, normal=0.3, maps=('diff', 'nor'), rough_value=0.85),   # 人行道（第一版 concrete_wall_006 是牆的貼圖：地上一條條流痕，遊戲裡很髒）
     'pavers': L.pbr('usu_pavers', 'granular_concrete', tile=1.6, target='#bfb8a8', contrast=0.8, normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'joint': L.flat('usu_paving_joints', '#858076', rough=0.9),
     'asph': L.pbr('usu_asphalt', 'asphalt_02', tile=3.0, target='#5e5e5b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'soil': L.flat('usu_soil', '#3e3227', rough=0.95),
     'paint': L.flat('usu_line_white', '#ecebe6', rough=0.6), 'yellow': L.flat('usu_line_yellow', '#d9a82e', rough=0.6),
     'steel': L.flat('usu_steel', '#4a4e52', rough=0.4, metal=0.5), 'glass': L.flat('usu_shelter_glass', '#cfdde2', rough=0.05, alpha=0.25),
     'green': L.flat('usu_lamp_green', '#26392e', rough=0.45, metal=0.4),
     'wood': L.pbr('usu_bench_wood', 'dark_wood', tile=0.6, target='#7a5638', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
     'brick_house': L.pbr('usu_house_brick', 'red_brick_03', tile=1.2, target='#8a4a3a', normal=0.4, maps=('diff', 'nor'), rough_value=0.85),
     'roof_far': L.flat('usu_roof_far', '#3d3b39', rough=0.8), 'win_far': L.flat('usu_win_far', '#2e3640', rough=0.2, metal=0.3),
     'vc': L.vc_material('usu_vc', rough=0.6)}
try:
    import plants as PL
    PM = PL.materials('usu_'); LEAF = PM['leaf_small']; BARK = PM['bark']
except Exception as ex:
    print('plants', ex); LEAF = L.flat('usu_leaf', '#4a6a3a', rough=0.8); BARK = L.flat('usu_bark', '#54473b', rough=0.9)
BD = J['bounds']; RZ = J['retaining_wall_z']; LH = J['lawn_h']; WS = J['walk_s']; FO = J['forecourt']; WK = J['walk']; PZ = J['plaza']; CR = J['cross_streets']
XW, XE = CR[1]['x1'], CR[0]['x0']                      # 主人行道的兩端（路口的路緣）

# ================= 地面 =================
gf = Mesh('usu_ground_far', M['grass_far']); gf.box(-320, 320, -0.3, -0.25, -320, 320); gf.finish(root, uv=False)          # 地平線（看不到盡頭的空白）
gr = Mesh('usu_grass', M['grass'], tile=3.0)
# 草坪和亂石矮牆不重疊（牆在草坪外面、背靠背）：第一版牆埋在草坪裡、外面那一面和草坪的側面疊在一起 → 算圖變黑
WX, FX, CX = WK['x1'] + 0.4, FO['x1'] + 0.4, 4.4                        # 走道牆外緣、小廣場側牆外緣、台階側牆外緣（us_law_kit 的 CW）
LAWNS = [(FX, XE - 0.8, -14.0, RZ), (WX, FX, FO['z1'] + 0.4, RZ), (CX, FO['x1'], J['law']['cz'], FO['z0']),
         (PZ['x1'] + 0.4, -FX, -14.0, RZ), (-FX, -WX, FO['z1'] + 0.4, RZ), (-FO['x1'], -CX, J['law']['cz'], FO['z0']),
         (XW + 0.8, PZ['x0'] - 0.4, -14.0, RZ)]
for (x0, x1, z0, z1) in LAWNS: gr.box(x0, x1, -0.05, LH, z0, z1)                                                              # 高起來的草坪
gr.box(PZ['x0'] - 0.4, PZ['x1'] + 0.4, -0.06, -0.02, BD['z0'], J['gate']['cz'] - 1.4)                                          # 校門後面（老校區，平的）
gr.box(XW + 0.2, -10.0, -0.07, -0.03, BD['z0'] - 40.0, -14.0)                                                                     # 第三版：老校區（樹林、石材老建築、迴車道）
gr.box(-200.0, CR[1]['x0'] - 4.2, -0.07, -0.03, -120.0, RZ + 0.4)                                                              # 第三版：西邊路口對面（紅瓦大建築、方塔大廳）
gr.box(XW + 0.4, XE - 0.4, -0.06, -0.02, BD['z0'], -14.0)
gr.finish(root)
rb = Mesh('usu_rubble_walls', LM['rubble'], tile=2.2)                                                                          # 亂石矮擋土牆（比草坪高一點點）
def rwall(x0, x1, z0, z1): rb.box(x0, x1, 0.0, LH + 0.12, z0, z1)
for (x0, x1) in ((XW + 0.4, PZ['x0']), (PZ['x1'], WK['x0']), (WK['x1'], XE - 0.4)): rwall(x0, x1, RZ, RZ + 0.4)
for s in (-1, 1):
    rwall(*sorted((s * WK['x1'], s * WX)), FO['z1'], RZ)                                                                     # 走道兩邊
    rwall(*sorted((s * WX, s * FO['x1'])), FO['z1'], FO['z1'] + 0.4)                                                         # 小廣場的南邊
    rwall(*sorted((s * FO['x1'], s * FX)), J['law']['cz'], FO['z1'] + 0.4)                                                   # 小廣場的兩側
    rwall(*sorted((s * CX, s * FO['x1'])), FO['z0'], FO['z0'] + 0.3)                                                        # 台階旁邊那一小塊草坪的前緣
for (x0, x1) in ((PZ['x1'], PZ['x1'] + 0.4), (PZ['x0'] - 0.4, PZ['x0'])): rwall(x0, x1, -14.0, RZ)                             # 校門廣場兩側
for (x0, x1) in ((XW + 0.4, XW + 0.8), (XE - 0.8, XE - 0.4)): rwall(x0, x1, -14.0, RZ)
rb.finish(root)
pv = Mesh('usu_pavers', M['pavers'], tile=1.2)                                                                                 # 台階前的小廣場、走道：石板
pv.box(FO['x0'], FO['x1'], -0.03, 0.015, FO['z0'] - 0.3, FO['z1']); pv.box(WK['x0'], WK['x1'], -0.03, 0.015, WK['z0'], WK['z1'])
pv.finish(root)
bw = Mesh('usu_brick_paving', M['brick'], tile=3.2)                                                                            # 校門廣場、門後的步道：紅磚
bw.box(PZ['x0'], PZ['x1'], -0.03, 0.015, J['gate']['cz'] - 1.4, PZ['z1'])
bw.box(J['gate']['cx'] - 3.6, J['gate']['cx'] + 3.6, -0.03, 0.012, BD['z0'], J['gate']['cz'] - 1.4)
bw.finish(root)
sw = Mesh('usu_sidewalk', M['conc'], tile=2.0)
sw.box(XW, XE, -0.04, 0.0, RZ + 0.4, WS['z1']); sw.box(-320, XW - 10.0, -0.04, 0.0, RZ + 0.4, WS['z1']); sw.box(XE + 10.0, 320, -0.04, 0.0, RZ + 0.4, WS['z1'])
sw.box(-320, 320, -0.04, 0.0, J['road']['z1'] + 0.2, J['road']['z1'] + 4.5)                                                   # 對街的人行道
for c in CR:                                                                                                                   # 路口兩邊的人行道
    for (x0, x1) in ((c['x0'] - 4.0, c['x0'] - 0.2), (c['x1'] + 0.2, c['x1'] + 4.0)): sw.box(x0, x1, -0.04, 0.0, -320, RZ + 0.4)
sw.finish(root)
jt = Mesh('usu_paving_joints', M['joint'])                                                                                    # 水泥板的伸縮縫（每 1.5 m 一條、人行道中間兩條縱的）
def joints(x0, x1, z0, z1, step=1.5, long=0):
    x = x0 + step
    while x < x1 - 0.1: jt.quad([(x - 0.012, 0.003, z1), (x + 0.012, 0.003, z1), (x + 0.012, 0.003, z0), (x - 0.012, 0.003, z0)]); x += step
    for k in range(1, long + 1): zz = z0 + k * (z1 - z0) / (long + 1); jt.quad([(x0, 0.003, zz + 0.012), (x1, 0.003, zz + 0.012), (x1, 0.003, zz - 0.012), (x0, 0.003, zz - 0.012)])
joints(XW, XE, RZ + 0.4, WS['z1'], 1.5, 2); joints(-160, 140, J['road']['z1'] + 0.2, J['road']['z1'] + 4.5, 1.5, 1)
for c in CR:
    for (x0, x1) in ((c['x0'] - 4.0, c['x0'] - 0.2), (c['x1'] + 0.2, c['x1'] + 4.0)):
        z = RZ + 0.4 - 1.5
        while z > -60: jt.quad([(x0, 0.003, z + 0.012), (x1, 0.003, z + 0.012), (x1, 0.003, z - 0.012), (x0, 0.003, z - 0.012)]); z -= 1.5
for z in [WK['z0'] + k * 1.2 for k in range(1, int((WK['z1'] - WK['z0']) / 1.2) + 1)]: jt.quad([(WK['x0'], 0.018, z + 0.01), (WK['x1'], 0.018, z + 0.01), (WK['x1'], 0.018, z - 0.01), (WK['x0'], 0.018, z - 0.01)])
for z in [FO['z0'] + k * 1.2 for k in range(1, int((FO['z1'] - FO['z0']) / 1.2) + 1)]: jt.quad([(FO['x0'], 0.018, z + 0.01), (FO['x1'], 0.018, z + 0.01), (FO['x1'], 0.018, z - 0.01), (FO['x0'], 0.018, z - 0.01)])
for x in [FO['x0'] + k * 1.2 for k in range(1, int((FO['x1'] - FO['x0']) / 1.2) + 1)]: jt.quad([(x - 0.01, 0.018, FO['z1']), (x + 0.01, 0.018, FO['z1']), (x + 0.01, 0.018, FO['z0'] - 0.3), (x - 0.01, 0.018, FO['z0'] - 0.3)])
jt.finish(root, uv=False)
cb = Mesh('usu_curb', M['conc'], tile=2.0)
for (x0, x1) in ((-320, XW - 10.0), (XW, XE), (XE + 10.0, 320)): cb.box(x0, x1, -0.15, 0.05, WS['z1'], WS['z1'] + 0.2); cb.box(x0, x1, -0.15, 0.05, J['road']['z1'], J['road']['z1'] + 0.2)
for c in CR:
    for x in (c['x0'] - 0.2, c['x1']): cb.box(x, x + 0.2, -0.15, 0.05, -320, WS['z1'] + 0.2)
cb.finish(root)
rd = Mesh('usu_road', M['asph'], tile=3.0)
rd.box(-320, 320, -0.2, -0.15, WS['z1'] + 0.2, J['road']['z1'])
for c in CR: rd.box(c['x0'], c['x1'], -0.2, -0.15, -320, WS['z1'] + 0.2)
rd.finish(root)
ln = Mesh('usu_road_lines', M['yellow']); zc = (J['road']['z0'] + J['road']['z1']) / 2
for dz in (-0.08, 0.08): ln.box(-320, 320, -0.15, -0.146, zc + dz - 0.05, zc + dz + 0.05)
ln.finish(root)
lw = Mesh('usu_road_paint', M['paint'])
for (x0, x1) in ((-320, CR[1]['x0'] - 0.5), (CR[1]['x1'] + 0.5, CR[0]['x0'] - 0.5), (CR[0]['x1'] + 0.5, 320)):
    for z in (WS['z1'] + 0.5, J['road']['z1'] - 0.6): lw.box(x0, x1, -0.15, -0.146, z, z + 0.1)
for c in CR:                                                                                                                   # 斑馬線（橫過路口）
    for k in range(9): z = WS['z0'] + 0.3 + k * 0.55; lw.box(c['x0'] + 0.6, c['x1'] - 0.6, -0.15, -0.146, z, z + 0.3)
lw.finish(root)

# ================= 建築：法學院、校門、門後的老系館 =================
law = LK.law_school(root, 'law_school', J['law']['cx'], J['law']['cz'], yaw=J['law']['yaw'], M=LM)
gate = LK.campus_gate(root, 'campus_gate', J['gate']['cx'], J['gate']['cz'], yaw=J['gate']['yaw'], M=LM)
if abs(J['law']['cz'] + law['steps_foot_v'] - J['steps_foot_z']) > 0.02: print('WARNING 台階前緣和配置不一致', law['steps_foot_v'], J['steps_foot_z'])
for h in J['halls']:
    UK.gothic_hall(root, 'hall_' + h['id'], h['cx'], h['cz'], length=h['len'], depth=h['dep'], floors=h['floors'], yaw=h['yaw'], M=UM, rng=rng, tower=h['tower'], detail=0)   # 背景：不做花窗、鉛條
# 第三版：校門西邊、後面的老校區（照空拍圖；背景、走不到）
OM = OK.materials('uso_', base=UM)
for h in J['oldcampus']:
    kw = dict(W=h['W'], D=h['D'], floors=h['floors'], yaw=h['yaw'], M=OM)
    if h['kind'] == 'castle_hall': kw['turret'] = h.get('turret', 'NE')
    getattr(OK, h['kind'])(root, h['id'], h['cx'], h['cz'], **kw)
# 樹林裡的紅磚小路（校門後面原本的紅磚步道之外）
bp = Mesh('usu_brick_paths', M['brick'], tile=3.2)
G0, G1 = J['gate']['cx'] - 3.6, J['gate']['cx'] + 3.6
for pth in J['paths']:
    hw_ = pth['w'] / 2; pts = pth['pts']
    for (a, b) in zip(pts, pts[1:]):
        if G0 <= min(a[0], b[0]) and max(a[0], b[0]) <= G1: continue                       # 已經在門後的紅磚步道上
        dx, dz = b[0] - a[0], b[1] - a[1]; ln_ = math.hypot(dx, dz); nx, nz = -dz / ln_ * hw_, dx / ln_ * hw_
        ex, ez = dx / ln_ * hw_, dz / ln_ * hw_                                               # 兩端多鋪半個路寬，轉角不留缺口
        q = [(a[0] - ex + nx, 0.008, a[1] - ez + nz), (b[0] + ex + nx, 0.008, b[1] + ez + nz), (b[0] + ex - nx, 0.008, b[1] + ez - nz), (a[0] - ex - nx, 0.008, a[1] - ez - nz)]
        if (q[1][0] - q[0][0]) * (q[2][2] - q[0][2]) - (q[1][2] - q[0][2]) * (q[2][0] - q[0][0]) > 0: q = q[::-1]   # 朝上
        bp.quad(q)
bp.finish(root)
# 石材老建築東邊的圓形迴車道：柏油圈＋中間的草地、一棵樹
dv = J['drive']; ra = Mesh('usu_drive', M['asph'], tile=3.0); ri = Mesh('usu_drive_island', M['grass'], tile=3.0); rc = Mesh('usu_drive_curb', M['conc'], tile=2.0)
r0_, r1_ = dv['r'] * 0.45, dv['r']
for k in range(32):
    a0_, a1_ = 2 * math.pi * k / 32, 2 * math.pi * (k + 1) / 32
    P = lambda a, r, y: (dv['x'] + r * math.cos(a), y, dv['z'] + r * math.sin(a))
    ra.quad([P(a0_, r0_, 0.006), P(a0_, r1_, 0.006), P(a1_, r1_, 0.006), P(a1_, r0_, 0.006)][::-1])
    ri.quad([(dv['x'], 0.15, dv['z']), P(a1_, r0_ - 0.15, 0.15), P(a0_, r0_ - 0.15, 0.15)])
    rc.quad([P(a1_, r0_, 0.006), P(a0_, r0_, 0.006), P(a0_, r0_, 0.15), P(a1_, r0_, 0.15)][::-1]); rc.quad([P(a0_, r0_, 0.15), P(a1_, r0_, 0.15), P(a1_, r0_ - 0.15, 0.15), P(a0_, r0_ - 0.15, 0.15)][::-1])
ra.box(dv['x'] - 2.6, dv['x'] + 2.6, 0.0, 0.006, BD['z0'] - 30.0, dv['z'] - r1_ + 0.5)                                      # 往北接出去的車道
ra.finish(root); ri.finish(root); rc.finish(root)

# ================= 樹（芯＋葉片卡，和社區同一個做法）=================
trunk = Mesh('usu_trunks', BARK); cards = Mesh('usu_tree_cards', LEAF); core = Mesh('usu_tree_core', L.flat('usu_tree_core', '#33472a', rough=0.98))   # 芯淺一點（近看第一版像黑色的碗）
def leaf_card(m, px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
    f = m.bm.faces.new([m.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
    uvl = m.bm.loops.layers.uv.verify()
    for lp_, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp_[uvl].uv = uv
def crown(cx, cy, cz, rx, ry, rz, ncard, csz, face=None):
    v0 = set(core.bm.verts); core.ell((cx, cy, cz), rx * 0.62, ry * 0.62, rz * 0.62, seg=7, rings=4)
    for vv in core.bm.verts:
        if vv not in v0: k = rng.uniform(0.88, 1.08); c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * k
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi)
        if face is not None and math.cos(a_) * face[0] + math.sin(a_) * face[1] < -0.2: continue
        e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)
        leaf_card(cards, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
# ================= 花台（石灰岩矮花台＋土＋灌木和花）=================
pt = Mesh('usu_planter_stone', LM['lime'], tile=1.9); ptc = Mesh('usu_planter_cap', LM['trim']); so = Mesh('usu_planter_soil', M['soil'])
shrub = CMesh('usu_shrubs', M['vc'])
def outline(p, inset=0.0):
    w, d = p['w'] / 2 - inset, p['d'] / 2 - inset
    if not p['round']: return [(p['x'] - w, p['z'] - d), (p['x'] + w, p['z'] - d), (p['x'] + w, p['z'] + d), (p['x'] - w, p['z'] + d)]
    r = d; pts = []
    for k in range(9): t = -math.pi / 2 + k * math.pi / 8; pts.append((p['x'] + (w - r) + r * math.cos(t), p['z'] + r * math.sin(t)))
    for k in range(9): t = math.pi / 2 + k * math.pi / 8; pts.append((p['x'] - (w - r) + r * math.cos(t), p['z'] + r * math.sin(t)))
    return pts
def ring(m, outer, inner, y0, y1):
    for (a, b), (c, d) in zip(zip(outer, outer[1:] + outer[:1]), zip(inner, inner[1:] + inner[:1])):
        m.quad([(b[0], y1, b[1]), (a[0], y1, a[1]), (c[0], y1, c[1]), (d[0], y1, d[1])])
    for (a, b) in zip(outer, outer[1:] + outer[:1]): m.quad([(a[0], y0, a[1]), (b[0], y0, b[1]), (b[0], y1, b[1]), (a[0], y1, a[1])][::-1])
    for (a, b) in zip(inner, inner[1:] + inner[:1]): m.quad([(a[0], y0, a[1]), (b[0], y0, b[1]), (b[0], y1, b[1]), (a[0], y1, a[1])])
FLOWERS = ['#c8384a', '#e8e2d8', '#d8a02a', '#8a4fb0', '#e07a3a']
def flower(x, y, z, h, col):   # 一朵花＝朝上的一片小方塊（2 個三角形）
    shrub.poly([(x - h, y, z - h), (x + h, y, z - h), (x + h, y, z + h), (x - h, y, z + h)][::-1], col)
def bush(x, y, z, r, col):   # 小灌木＝和樹同一個做法（芯＋葉片卡）；第一版是有稜角的綠色球，近看像玩具
    crown(x, y, z, r, r * 0.8, r, max(6, int(70 * r * r)), 0.22)
for p in J['planters']:
    o, i = outline(p), outline(p, 0.22)
    ring(pt, o, i, 0.0, 0.44); ring(ptc, outline(p, -0.04), outline(p, 0.24), 0.44, 0.52)
    so.bm.faces.new([so.bm.verts.new(g2b(x, 0.4, z)) for (x, z) in i])
    n = int(p['w'] * p['d'] * 6)                                              # 小一點、多一點（第一版一顆顆像玩具）
    for k in range(n):
        x = p['x'] + rng.uniform(-p['w'] / 2 + 0.35, p['w'] / 2 - 0.35); z = p['z'] + rng.uniform(-p['d'] / 2 + 0.35, p['d'] / 2 - 0.35)
        if p['round'] and abs(x - p['x']) > p['w'] / 2 - p['d'] / 2 and math.hypot(abs(x - p['x']) - (p['w'] / 2 - p['d'] / 2), z - p['z']) > p['d'] / 2 - 0.35: continue
        r = rng.uniform(0.11, 0.19); bush(x, 0.42 + r * 0.6, z, r, rng.choice(['#3f5a2e', '#4a6634', '#38522a', '#55703a']))
        if rng.random() < 0.75:
            c = rng.choice(FLOWERS)
            for j in range(rng.randint(5, 9)):
                a_ = rng.uniform(0, 2 * math.pi); rr = r * rng.uniform(0.2, 0.8)
                flower(x + math.cos(a_) * rr, 0.42 + r * 1.15, z + math.sin(a_) * rr, 0.034, c)
pt.finish(root); ptc.finish(root, uv=False)

# ================= 公車站（玻璃候車亭，開口朝馬路）=================
bs = J['bus']; st = Mesh('usu_shelter_steel', M['steel']); sg = Mesh('usu_shelter_glass', M['glass']); wd = Mesh('usu_benches_wood', M['wood'], tile=0.6)
x0, x1, zb, zf = bs['x'] - bs['w'] / 2, bs['x'] + bs['w'] / 2, bs['z'] - bs['d'] / 2, bs['z'] + bs['d'] / 2
for x in (x0, x1):
    for z in (zb, zf): st.box(x - 0.05, x + 0.05, 0.0, 2.5, z - 0.05, z + 0.05)
st.box(x0 - 0.15, x1 + 0.15, 2.5, 2.62, zb - 0.15, zf + 0.25)
sg.box(x0, x1, 0.15, 2.4, zb - 0.01, zb + 0.01)
for x in (x0, x1): sg.box(x - 0.01, x + 0.01, 0.15, 2.4, zb, zb + bs['d'] * 0.6)
wd.box(x0 + 0.4, x1 - 0.4, 0.44, 0.48, zb + 0.08, zb + 0.48); st.box(x0 + 0.5, x0 + 0.56, 0.0, 0.44, zb + 0.2, zb + 0.4); st.box(x1 - 0.56, x1 - 0.5, 0.0, 0.44, zb + 0.2, zb + 0.4)
sp = x1 + 0.9; st.cyl((sp, 0.0, zf + 0.3), (sp, 2.8, zf + 0.3), 0.04, seg=8)
sgn_ = CMesh('usu_bus_sign', M['vc'])                                                                     # 站牌：藍底、白色公車圖示（不寫公司名、路線名）
sgn_.cbox(sp - 0.3, sp + 0.3, 2.2, 2.75, zf + 0.33, zf + 0.36, '#2a5a9a')
sgn_.cbox(sp - 0.17, sp + 0.17, 2.4, 2.6, zf + 0.36, zf + 0.37, '#f2f2ee'); sgn_.cbox(sp - 0.13, sp + 0.13, 2.47, 2.56, zf + 0.37, zf + 0.375, '#2a5a9a')
for dx in (-0.1, 0.1): sgn_.cbox(sp + dx - 0.03, sp + dx + 0.03, 2.36, 2.41, zf + 0.36, zf + 0.375, '#f2f2ee')
# ================= 路燈、長椅、腳踏車架、垃圾桶、行人標誌、木桶花盆 =================
lp = Mesh('GLOW_usu_lamp_heads', LM['lamp']); ir = Mesh('usu_iron_props', LM['iron']); gn = Mesh('usu_green_poles', M['green'])
for p in J['props']:
    t, x, z, yaw = p['type'], p['x'], p['z'], p['yaw']
    if t == 'lamp_green':   # 深綠色的高路燈柱（照片）：細長的柱子、上面一個方的燈頭
        gn.cyl((x, 0, z), (x, 0.6, z), 0.13, seg=10, r2=0.1); gn.cyl((x, 0.6, z), (x, 5.6, z), 0.065, seg=10, r2=0.05)
        gn.box(x - 0.22, x + 0.22, 5.6, 5.68, z - 0.22, z + 0.22); lp.box(x - 0.17, x + 0.17, 5.68, 6.2, z - 0.17, z + 0.17)
        for sx in (-1, 1):
            for sz in (-1, 1): gn.box(x + sx * 0.19 - 0.02, x + sx * 0.19 + 0.02, 5.68, 6.22, z + sz * 0.19 - 0.02, z + sz * 0.19 + 0.02)
        gn.cyl((x, 6.22, z), (x, 6.5, z), 0.26, seg=4, r2=0.02)
    elif t == 'lamp':     # 黑色鐵燈柱（校門廣場）
        ir.cyl((x, 0, z), (x, 0.5, z), 0.16, seg=10, r2=0.12); ir.cyl((x, 0.5, z), (x, 3.4, z), 0.07, seg=10, r2=0.055)
        ir.box(x - 0.2, x + 0.2, 3.4, 3.48, z - 0.2, z + 0.2); lp.box(x - 0.16, x + 0.16, 3.48, 4.0, z - 0.16, z + 0.16)
        for sx in (-1, 1):
            for sz in (-1, 1): ir.box(x + sx * 0.18 - 0.02, x + sx * 0.18 + 0.02, 3.48, 4.02, z + sz * 0.18 - 0.02, z + sz * 0.18 + 0.02)
        ir.cyl((x, 4.02, z), (x, 4.3, z), 0.24, seg=4, r2=0.02)
    elif t == 'bench':
        c, s_ = math.cos(yaw), math.sin(yaw)
        def P(u, v): return (x + u * c + v * s_, z - u * s_ + v * c)
        for k in range(4):
            a0, a1 = P(-0.9, -0.22 + k * 0.12), P(0.9, -0.22 + k * 0.12 + 0.09); wd.box(min(a0[0], a1[0]), max(a0[0], a1[0]), 0.44, 0.47, min(a0[1], a1[1]), max(a0[1], a1[1]))
        for k in range(3):
            a0, a1 = P(-0.9, -0.3), P(0.9, -0.27); wd.box(min(a0[0], a1[0]), max(a0[0], a1[0]), 0.55 + k * 0.13, 0.64 + k * 0.13, min(a0[1], a1[1]), max(a0[1], a1[1]))
        for u in (-0.75, 0.75):
            a0, a1 = P(u - 0.03, -0.3), P(u + 0.03, 0.22); ir.box(min(a0[0], a1[0]), max(a0[0], a1[0]), 0.0, 0.86, min(a0[1], a1[1]), max(a0[1], a1[1]))
    elif t == 'bikerack':
        for k in range(6): ir.cyl((x - 1.2 + k * 0.48, 0, z - 0.3), (x - 1.2 + k * 0.48, 0.8, z - 0.3), 0.025, seg=6); ir.cyl((x - 1.2 + k * 0.48, 0.8, z - 0.3), (x - 1.2 + k * 0.48, 0.8, z + 0.3), 0.025, seg=6); ir.cyl((x - 1.2 + k * 0.48, 0, z + 0.3), (x - 1.2 + k * 0.48, 0.8, z + 0.3), 0.025, seg=6)
    elif t == 'trash':
        gn.cyl((x, 0, z), (x, 0.95, z), 0.3, seg=14); gn.cyl((x, 0.95, z), (x, 1.05, z), 0.33, seg=14, r2=0.2)
    elif t == 'ped_sign':   # 黃色菱形的行人標誌（只有圖形）
        st.cyl((x, 0, z), (x, 2.5, z), 0.035, seg=8)
        d = 0.38; sgn_.poly([(x, 2.6 - d, z + 0.05), (x + d, 2.6, z + 0.05), (x, 2.6 + d, z + 0.05), (x - d, 2.6, z + 0.05)], '#e8c22a')
        sgn_.cbox(x - 0.03, x + 0.03, 2.48, 2.72, z + 0.051, z + 0.06, '#1e1e1e'); sgn_.cbox(x - 0.05, x + 0.05, 2.73, 2.83, z + 0.051, z + 0.06, '#1e1e1e')
        sgn_.cbox(x - 0.11, x + 0.11, 2.6, 2.64, z + 0.051, z + 0.06, '#1e1e1e')
    elif t == 'barrel':     # 木桶花盆（台階兩側，照片）
        wd.cyl((x, 0, z), (x, 0.55, z), 0.36, seg=14, r2=0.4)
        for y in (0.08, 0.45): ir.cyl((x, y, z), (x, y + 0.04, z), 0.37 + y * 0.07, seg=14)
        so.bm.faces.new([so.bm.verts.new(g2b(x + 0.37 * math.cos(t * math.pi / 7), 0.5, z + 0.37 * math.sin(t * math.pi / 7))) for t in range(14)])
        for j in range(9):                                                   # 一叢一叢的小灌木＋花（第一版一整顆綠色的球）
            a_ = j * 2.4 + rng.uniform(-0.3, 0.3); rr = 0.0 if j == 0 else rng.uniform(0.12, 0.27); r = rng.uniform(0.1, 0.16)
            bush(x + math.cos(a_) * rr, 0.56 + r * 0.7 + (0.08 if j == 0 else 0.0), z + math.sin(a_) * rr, r, rng.choice(['#3f5a2e', '#4a6634', '#55703a']))
            c = rng.choice(FLOWERS)
            for k in range(4):
                b_ = rng.uniform(0, 2 * math.pi); q = r * rng.uniform(0.2, 0.7); cx_, cz_ = x + math.cos(a_) * rr + math.cos(b_) * q, z + math.sin(a_) * rr + math.sin(b_) * q
                flower(cx_, 0.56 + r * 1.45 + (0.08 if j == 0 else 0.0), cz_, 0.03, c)
st.finish(root, uv=False); sg.finish(root, uv=False); wd.finish(root); lp.finish(root, uv=False); ir.finish(root, uv=False); gn.finish(root, uv=False); sgn_.finish(root, uv=False); shrub.finish(root, uv=False); so.finish(root, uv=False)

def tree(x, z, h, y0=0.0, far=False):
    lean = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04)); rb = rng.uniform(0.28, 0.42)
    bt = L.lathe([(rb * 1.4, 0.0), (rb, 0.4), (rb * 0.82, h * 0.38), (rb * 0.55, h * 0.6)], seg=9)
    trunk.add_bm(bt, Matrix.Translation(g2b(x, y0, z)) @ Matrix(((1, 0, lean[0]), (0, 1, -lean[1]), (0, 0, 1))).to_4x4()); bt.free()
    cr = h * 0.33; cy = y0 + h * 0.66                                                                            # 樹冠高一點（第一版樹冠壓得太低，整片樹林擋住建築）
    for k in range(rng.randint(3, 4)):
        a_ = rng.uniform(0, 2 * math.pi); yb = y0 + h * rng.uniform(0.36, 0.48)
        trunk.cyl((x + lean[0] * yb, yb, z + lean[1] * yb), (x + math.cos(a_) * cr * 0.7, cy + rng.uniform(-0.5, 1.0), z + math.sin(a_) * cr * 0.7), rb * 0.4, seg=6, r2=rb * 0.18)
    for k in range(rng.randint(4, 6)):
        a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.6); r_ = cr * rng.uniform(0.48, 0.68)
        crown(x + lean[0] * cy + math.cos(a_) * d_, cy + rng.uniform(-0.2, 0.4) * cr, z + lean[1] * cy + math.sin(a_) * d_, r_, r_ * 0.78, r_, int((3.2 if far else 8) * r_ * r_), 2.4 if far else 1.7)
for t in J['trees']:
    on_lawn = any(x0 <= t['x'] <= x1 and z0 <= t['z'] <= z1 for (x0, x1, z0, z1) in LAWNS)
    tree(t['x'], t['z'], t['h'], LH if on_lawn else 0.0, far=t.get('far'))
tree(J['drive']['x'], J['drive']['z'], 9.0, 0.15)
OCF = [(h['cx'] - h['W'] / 2, h['cx'] + h['W'] / 2, h['cz'] - h['D'] / 2, h['cz'] + h['D'] / 2) for h in J['oldcampus']]
def belt(pts, face, hr=(13, 19)):
    for (x, z) in pts:
        if any(x0 - 5.5 < x < x1 + 5.5 and z0 - 5.5 < z < z1 + 5.5 for (x0, x1, z0, z1) in OCF): continue   # 第三版：老校區的建築旁邊不種（樹冠會插進牆）
        h = rng.uniform(*hr); r_ = rng.uniform(4.0, 5.6)
        trunk.cyl((x, 0, z), (x, h * 0.55, z), rng.uniform(0.22, 0.32), seg=6, r2=0.16)
        crown(x, h * 0.68, z, r_, r_ * 0.85, r_, int(3 * r_ * r_), 2.6, face=face)
belt([(x + rng.uniform(-1.5, 1.5), -26.0 + rng.uniform(-3, 3)) for x in range(-48, 50, 9)], (0, 1))                      # 法學院後面
belt([(x + rng.uniform(-1, 1), -44.0 + rng.uniform(-2, 2)) for x in range(-96, -40, 9)], (0, 1))                         # 老校區後面
belt([(x + rng.uniform(-1, 1), J['road']['z1'] + 3.6 + rng.uniform(-0.3, 0.3)) for x in range(-150, 120, 11)], (0, -1), (11, 15))   # 對街的行道樹
for c in CR: belt([(c['x0'] - 2.2 if k % 2 else c['x1'] + 2.2, z + rng.uniform(-1, 1)) for k, z in enumerate(range(-40, 12, 8))], None, (12, 16))
trunk.finish(root, uv=False); cards.finish(root, uv=False, merge=False); core.finish(root, uv=False, smooth=True)
# 對街：兩層的磚造房子（遠景、走不到）
hb = Mesh('usu_far_houses', M['brick_house'], tile=1.2); hr = Mesh('usu_far_roofs', M['roof_far']); hw = Mesh('usu_far_windows', M['win_far']); ht = Mesh('usu_far_trim', LM['trim'])
def house_row(x, x_end, z0):
    while x < x_end:
        w = rng.uniform(8, 12); d = 10.0; h = rng.choice([6.2, 6.8, 7.4]); zc_ = z0 + d / 2
        hb.box(x, x + w, 0.0, h, z0, z0 + d)
        for s_ in (1, -1): hr.quad([(x - 0.3, h, zc_ + s_ * (d / 2 + 0.4)), (x + w + 0.3, h, zc_ + s_ * (d / 2 + 0.4)), (x + w + 0.3, h + 2.6, zc_), (x - 0.3, h + 2.6, zc_)][::(1 if s_ > 0 else -1)])
        for f in range(2):
            for k in range(int(w / 2.6)):
                wx = x + 1.0 + k * 2.6; hw.box(wx, wx + 1.1, 1.0 + f * 3.0, 2.4 + f * 3.0, z0 - 0.02, z0 + 0.01); ht.box(wx - 0.08, wx + 1.18, 0.92 + f * 3.0, 1.0 + f * 3.0, z0 - 0.06, z0 + 0.01)
        x += w + rng.uniform(1.5, 4)
house_row(-160.0, 140.0, J['road']['z1'] + 8.0)
hb.finish(root); hr.finish(root, uv=False); hw.finish(root, uv=False); ht.finish(root, uv=False)

if '--stats' in A:   # 每個物件的三角形數（找最重的）
    rows = []
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); rows.append((len(ob.data.loop_triangles), ob.name))
    for n, nm in sorted(rows, reverse=True)[:30]: print('STATS', n, nm)
if not PREVIEW:
    L.merge_by_material(root, keep=lambda ob: False)
    st_ = L.export(OUT, gpu_instances=False)
    tris = 0
    for ob in bpy.data.objects:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_campus.layout.json'))
    print('us_campus tris', tris)
else:
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '24'))
    try: sc.cycles.use_denoising = True
    except Exception: pass
    rw, rh = map(int, opt('--res', '1280x720').split('x')); sc.render.resolution_x, sc.render.resolution_y = rw, rh; sc.view_settings.view_transform = 'AgX'
    sc.view_settings.exposure = float(opt('--exposure', '-0.2'))
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
    sky = nt.nodes.new('ShaderNodeTexSky')
    try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(40); sky.sun_rotation = math.radians(200)
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.3
    lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 3.2; lt.angle = math.radians(1.5); o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o)
    o.rotation_euler = (math.radians(50), 0, math.radians(float(opt('--sun', '35'))))
    CAMS = {'law': ((-19.0, 1.65, 21.0), (-1.0, 12.0, 0.0), 24),          # 照片一：人行道上斜看方塔
            'door': ((2.0, 1.65, 16.5), (0.0, 6.5, 0.0), 22),             # 照片三：走道上正看入口
            'gate': ((-61.0, 1.65, 20.5), (-66.0, 5.5, 8.0), 24),         # 照片五：廣場上看校門
            'walk': ((-30.0, 1.65, 20.0), (-55.0, 4.0, 10.0), 26),        # 公車站往西看校門
            'bus': ((-12.0, 1.65, 21.4), (-24.0, 2.0, 18.0), 26),
            'aerial': ((40.0, 45.0, 62.0), (-20.0, 0.0, 2.0), 22),
            'oc': ((-30.0, 55.0, 45.0), (-85.0, 0.0, -18.0), 20),        # 第三版：老校區鳥瞰（校門在右下角，對照空拍圖）
            'gatein': ((-66.0, 1.65, 13.5), (-66.0, 7.0, -30.0), 24)}     # 校門廣場往北看
    eye, look, lens = CAMS[opt('--cam', 'law')]
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens; cam.data.clip_end = 2000
    e, l_ = Vector(g2b(*eye)), Vector(g2b(*look)); cam.location = e; cam.rotation_euler = (l_ - e).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.abspath(PREVIEW); bpy.ops.render.render(write_still=True); print('saved', PREVIEW)
