"""美國交換：校園（SCN-US-02 第二階段；區域 us_campus）→ GLB。LAWWW2-C 2026-10-18；Blender 5.2：
  python3 tools/blender/env_second/us_campus_layout_gen.py
  /opt/blenv/bin/python tools/blender/env_second/us_campus.py [-- --out assets/models/env/second_ai/us_campus.glb] [--preview <png> --cam gate|walk|door|bus] [--samples 24] [--res 1280x720]
範圍（LAWWW-C 00:20）：公車站（字卡到站）→ 校門 → 紅磚步道 → 上課系館門口「進教室」（教室 2D）。配置 us_campus.layout.json（遊戲讀同一份）。
做法：系館＝us_campus_kit.gothic_hall（學院哥德式石灰岩；下層方窗、頂層尖拱、扶壁、陡石板瓦屋頂、正面方塔）；校門＝兩根大石柱（頂上鐵燈）＋兩根小石柱＋矮石牆＋鐵欄杆；
紅磚步道（Poly Haven brick_pavement_04）、草坪（grass_ground）、大樹（芯＋葉片卡，和社區同一個做法）、長椅、黑色鐵燈柱、腳踏車架、垃圾桶；
校門外：人行道、路緣、馬路（雙黃線）、公車站（玻璃候車亭、長椅、站牌）、對街的兩層磚造房子和樹（遠景）。四周一圈樹林把畫面收起來。
沒有照片：**不照任何真的建築、真的校門**（PROPOSAL）；D77 不放校名、校徽、公司名。座標＝配置的區域座標（x 東、z 南、y 上）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import us_campus_kit as UK   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
OUT = os.path.join(L.ROOT, opt('--out', 'assets/models/env/second_ai/us_campus.glb')); PREVIEW = opt('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_campus.layout.json'), encoding='utf-8'))
rng = random.Random(20261018)
B.reset(texres=512)
root = B.group('us_campus', props={'kind': 'us_campus', 'layout': 'us_campus.layout.json'})
UM = UK.materials('usu_')
M = {'grass': L.pbr('usu_grass', 'grass_ground', tile=3.0, target='#5f7444', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
     'brick': L.pbr('usu_brick_walk', 'brick_pavement_04', tile=1.4, target='#93533f', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),
     'conc': L.pbr('usu_sidewalk', 'concrete_wall_006', tile=2.0, target='#b8b3a8', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'asph': L.pbr('usu_asphalt', 'asphalt_02', tile=3.0, target='#5e5e5b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'paint': L.flat('usu_line_white', '#ecebe6', rough=0.6), 'yellow': L.flat('usu_line_yellow', '#d9a82e', rough=0.6),
     'iron': UM['iron'], 'lime': UM['lime'], 'lime_dark': UM['lime_dark'], 'trim': UM['trim'], 'lamp': UM['lamp'],
     'steel': L.flat('usu_steel', '#4a4e52', rough=0.4, metal=0.5), 'glass': L.flat('usu_shelter_glass', '#cfdde2', rough=0.05, alpha=0.25),
     'wood': L.pbr('usu_bench_wood', 'dark_wood', tile=0.6, target='#7a5638', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
     'sign': L.flat('usu_bus_sign', '#2a5a9a', rough=0.4), 'brick_house': L.pbr('usu_house_brick', 'red_brick_03', tile=1.2, target='#8a4a3a', normal=0.4, maps=('diff', 'nor'), rough_value=0.85),
     'roof_far': L.flat('usu_roof_far', '#3d3b39', rough=0.8), 'win_far': L.flat('usu_win_far', '#2e3640', rough=0.2, metal=0.3),
     'vc': L.vc_material('usu_vc', rough=0.6)}
try:
    import plants as PL
    PM = PL.materials('usu_'); LEAF = PM['leaf_small']; BARK = PM['bark']
except Exception as ex:
    print('plants', ex); LEAF = L.flat('usu_leaf', '#4a6a3a', rough=0.8); BARK = L.flat('usu_bark', '#54473b', rough=0.9)
BD = J['bounds']; FZ = J['fence_z']

# ================= 地面：草坪、紅磚步道、人行道、路緣、馬路 =================
gr = Mesh('usu_grass', M['grass'], tile=3.0); gr.box(BD['x0'] - 60, BD['x1'] + 60, -0.06, -0.02, BD['z0'] - 60, FZ + 0.3); gr.finish(root)
bw = Mesh('usu_brick_walks', M['brick'], tile=1.4)
for p in J['paths']: bw.box(p['x0'], p['x1'], -0.02, 0.02, p['z0'], p['z1'])
for h in J['halls']:                                                                    # 兩邊系館門口接到東西向步道的一小段
    if h['tower']: continue
    sgn = 1 if math.sin(h['yaw']) > 0 else -1; xf = h['cx'] + sgn * h['dep'] / 2
    bw.box(min(xf, xf + sgn * 6.6), max(xf, xf + sgn * 6.6), -0.02, 0.02, -4.6, -1.4)
bw.finish(root)
ed = Mesh('usu_walk_edges', M['lime_dark'])                                              # 步道兩邊一條石頭的邊
for p in J['paths'][:1]:
    for x in (p['x0'], p['x1']): ed.box(x - 0.08, x + 0.08, -0.02, 0.05, p['z0'], p['z1'])
ed.finish(root)
sw = Mesh('usu_sidewalk', M['conc'], tile=2.0); sw.box(BD['x0'] - 60, BD['x1'] + 60, -0.04, 0.0, FZ + 0.3, J['walk_s']['z1']); sw.finish(root)
cb = Mesh('usu_curb', M['conc'], tile=2.0); cb.box(BD['x0'] - 60, BD['x1'] + 60, -0.15, 0.05, J['walk_s']['z1'], J['walk_s']['z1'] + 0.2); cb.finish(root)
rd = Mesh('usu_road', M['asph'], tile=3.0); rd.box(BD['x0'] - 60, BD['x1'] + 60, -0.2, -0.15, J['walk_s']['z1'] + 0.2, BD['z1'] + 4); rd.finish(root)
ln = Mesh('usu_road_lines', M['yellow']); zc = (J['road']['z0'] + J['road']['z1']) / 2
for dz in (-0.08, 0.08): ln.box(BD['x0'] - 60, BD['x1'] + 60, -0.15, -0.146, zc + dz - 0.05, zc + dz + 0.05)
ln.finish(root)
lw = Mesh('usu_road_edge', M['paint']); lw.box(BD['x0'] - 60, BD['x1'] + 60, -0.15, -0.146, J['walk_s']['z1'] + 0.5, J['walk_s']['z1'] + 0.6); lw.finish(root)
ss = Mesh('usu_far_sidewalk', M['conc'], tile=2.0); ss.box(BD['x0'] - 60, BD['x1'] + 60, -0.04, 0.0, BD['z1'] + 4, BD['z1'] + 9); ss.finish(root)

# ================= 系館 =================
for h in J['halls']:
    UK.gothic_hall(root, 'hall_' + h['id'], h['cx'], h['cz'], length=h['len'], depth=h['dep'], floors=h['floors'], yaw=h['yaw'], M=UM, rng=rng, tower=h['tower'])

# ================= 校門＋矮石牆＋鐵欄杆 =================
G = J['gate']; gl = Mesh('usu_gate_stone', M['lime'], tile=1.6); gt = Mesh('usu_gate_trim', M['trim']); gi = Mesh('usu_gate_iron', M['iron']); gp = Mesh('GLOW_usu_gate_lamps', M['lamp'])
def pier(x, w, h, lamp=True):
    gl.box(x - w / 2, x + w / 2, 0.0, h, FZ - w / 2, FZ + w / 2)
    gt.box(x - w / 2 - 0.08, x + w / 2 + 0.08, 0.0, 0.45, FZ - w / 2 - 0.08, FZ + w / 2 + 0.08)                   # 柱腳
    gt.box(x - w / 2 - 0.12, x + w / 2 + 0.12, h, h + 0.22, FZ - w / 2 - 0.12, FZ + w / 2 + 0.12)                 # 柱頂的蓋石
    gt.box(x - w / 2 + 0.1, x + w / 2 - 0.1, h + 0.22, h + 0.42, FZ - w / 2 + 0.1, FZ + w / 2 - 0.1)
    for (y0, y1) in ((h * 0.55, h * 0.58),): gt.box(x - w / 2 - 0.04, x + w / 2 + 0.04, y0, y1, FZ - w / 2 - 0.04, FZ + w / 2 + 0.04)   # 腰線
    for s in (-1, 1): gt.box(x - w * 0.3, x + w * 0.3, h * 0.25, h * 0.48, FZ + s * (w / 2 + 0.005) - 0.01, FZ + s * (w / 2 + 0.005) + 0.01)   # 嵌板（凹一點的方框）
    if lamp:
        y = h + 0.42; gi.box(x - 0.08, x + 0.08, y, y + 0.35, FZ - 0.08, FZ + 0.08); gi.box(x - 0.22, x + 0.22, y + 0.35, y + 0.42, FZ - 0.22, FZ + 0.22)
        gp.box(x - 0.17, x + 0.17, y + 0.42, y + 0.92, FZ - 0.17, FZ + 0.17)
        for sx in (-1, 1):
            for sz in (-1, 1): gi.box(x + sx * 0.19 - 0.025, x + sx * 0.19 + 0.025, y + 0.42, y + 0.95, FZ + sz * 0.19 - 0.025, FZ + sz * 0.19 + 0.025)
        gi.cyl((x, y + 0.95, FZ), (x, y + 1.2, FZ), 0.22, seg=4, r2=0.02)
for sx in (-1, 1):
    pier(sx * (G['open'] / 2 + G['pier'] / 2), G['pier'], G['pier_h'])
    pier(sx * G['side_x'], G['side_pier'], G['side_h'], lamp=False)
    for (xa, xb) in ((sx * (G['open'] / 2 + G['pier']), sx * (G['side_x'] - G['side_pier'] / 2)), (sx * (G['side_x'] + G['side_pier'] / 2), sx * (BD['x1'] + 20))):
        xa, xb = min(xa, xb), max(xa, xb)
        gl.box(xa, xb, 0.0, 0.85, FZ - 0.22, FZ + 0.22); gt.box(xa - 0.02, xb + 0.02, 0.85, 0.97, FZ - 0.28, FZ + 0.28)   # 矮石牆＋壓頂
        gi.box(xa, xb, 1.75, 1.8, FZ - 0.03, FZ + 0.03); gi.box(xa, xb, 1.0, 1.04, FZ - 0.03, FZ + 0.03)
        n = int((xb - xa) / 0.14)
        for k in range(n + 1):
            x = xa + k * (xb - xa) / max(1, n); gi.box(x - 0.012, x + 0.012, 0.97, 1.8, FZ - 0.012, FZ + 0.012)
            if k % 2 == 0: gi.cyl((x, 1.8, FZ), (x, 1.92, FZ), 0.03, seg=4, r2=0.002)               # 欄杆頂的尖頭
        for k in range(int((xb - xa) / 6.0) + 1):
            x = xa + k * 6.0
            if x < xb - 0.3: gl.box(x - 0.25, x + 0.25, 0.0, 2.0, FZ - 0.28, FZ + 0.28); gt.box(x - 0.3, x + 0.3, 2.0, 2.1, FZ - 0.33, FZ + 0.33)   # 每 6 m 一根小石柱
gl.finish(root); gt.finish(root, uv=False); gi.finish(root, uv=False); gp.finish(root, uv=False)

# ================= 公車站（玻璃候車亭，開口朝馬路）=================
bs = J['bus']; st = Mesh('usu_shelter_steel', M['steel']); sg = Mesh('usu_shelter_glass', M['glass']); wd = Mesh('usu_benches_wood', M['wood'], tile=0.6)
x0, x1, zb, zf = bs['x'] - bs['w'] / 2, bs['x'] + bs['w'] / 2, bs['z'] - bs['d'] / 2, bs['z'] + bs['d'] / 2
for x in (x0, x1):
    for z in (zb, zf): st.box(x - 0.05, x + 0.05, 0.0, 2.5, z - 0.05, z + 0.05)
st.box(x0 - 0.15, x1 + 0.15, 2.5, 2.62, zb - 0.15, zf + 0.25)
sg.box(x0, x1, 0.15, 2.4, zb - 0.01, zb + 0.01)
for x in (x0, x1): sg.box(x - 0.01, x + 0.01, 0.15, 2.4, zb, zb + bs['d'] * 0.6)
wd.box(x0 + 0.4, x1 - 0.4, 0.44, 0.48, zb + 0.08, zb + 0.48); st.box(x0 + 0.5, x0 + 0.56, 0.0, 0.44, zb + 0.2, zb + 0.4); st.box(x1 - 0.56, x1 - 0.5, 0.0, 0.44, zb + 0.2, zb + 0.4)
sp = x1 + 0.9; st.cyl((sp, 0.0, zf + 0.3), (sp, 2.8, zf + 0.3), 0.04, seg=8)                   # 站牌（藍色牌子、白色的 BUS 圖示，沒有公司名）
st.finish(root, uv=False); sg.finish(root, uv=False)
sgn_ = CMesh('usu_bus_sign', M['vc']); sgn_.cbox(sp - 0.3, sp + 0.3, 2.2, 2.75, zf + 0.33, zf + 0.36, '#2a5a9a'); sgn_.cbox(sp - 0.18, sp + 0.18, 2.36, 2.62, zf + 0.36, zf + 0.37, '#f2f2ee')
sgn_.cbox(sp - 0.12, sp + 0.12, 2.42, 2.52, zf + 0.37, zf + 0.375, '#2a5a9a')
# ================= 長椅、路燈、腳踏車架、垃圾桶 =================
lp = Mesh('GLOW_usu_lamp_heads', M['lamp']); ir = Mesh('usu_iron_props', M['iron'])
for p in J['props']:
    t, x, z, yaw = p['type'], p['x'], p['z'], p['yaw']
    if t == 'lamp':   # 黑色鐵燈柱（有凹槽的柱身、燈籠燈頭）
        ir.cyl((x, 0, z), (x, 0.5, z), 0.16, seg=10, r2=0.12); ir.cyl((x, 0.5, z), (x, 3.4, z), 0.07, seg=10, r2=0.055)
        ir.box(x - 0.2, x + 0.2, 3.4, 3.48, z - 0.2, z + 0.2); lp.box(x - 0.16, x + 0.16, 3.48, 4.0, z - 0.16, z + 0.16)
        for sx in (-1, 1):
            for sz in (-1, 1): ir.box(x + sx * 0.18 - 0.02, x + sx * 0.18 + 0.02, 3.48, 4.02, z + sz * 0.18 - 0.02, z + sz * 0.18 + 0.02)
        ir.cyl((x, 4.02, z), (x, 4.3, z), 0.24, seg=4, r2=0.02)
    elif t == 'bench':   # 木條長椅＋黑色鐵腳（長邊沿 z：yaw ±π/2 時椅子朝 x）
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
        ir.cyl((x, 0, z), (x, 0.95, z), 0.3, seg=14); ir.cyl((x, 0.95, z), (x, 1.05, z), 0.33, seg=14, r2=0.2)
wd.finish(root); lp.finish(root, uv=False); ir.finish(root, uv=False); sgn_.finish(root, uv=False)

# ================= 樹（芯＋葉片卡，和社區同一個做法）=================
trunk = Mesh('usu_trunks', BARK); cards = Mesh('usu_tree_cards', LEAF); core = Mesh('usu_tree_core', L.flat('usu_tree_core', '#1c2a18', rough=0.98))
def leaf_card(m, px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
    f = m.bm.faces.new([m.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
    uvl = m.bm.loops.layers.uv.verify()
    for lp_, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp_[uvl].uv = uv
def crown(cx, cy, cz, rx, ry, rz, ncard, csz, face=None):
    v0 = set(core.bm.verts); core.ell((cx, cy, cz), rx * 0.74, ry * 0.74, rz * 0.74, seg=8, rings=5)
    for vv in core.bm.verts:
        if vv not in v0: k = rng.uniform(0.88, 1.08); c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * k
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi)
        if face is not None and math.cos(a_) * face[0] + math.sin(a_) * face[1] < -0.2: continue
        e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)
        leaf_card(cards, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
def tree(x, z, h):
    lean = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04)); rb = rng.uniform(0.28, 0.42)
    bt = L.lathe([(rb * 1.4, 0.0), (rb, 0.4), (rb * 0.82, h * 0.38), (rb * 0.55, h * 0.6)], seg=9)
    trunk.add_bm(bt, Matrix.Translation(g2b(x, 0, z)) @ Matrix(((1, 0, lean[0]), (0, 1, -lean[1]), (0, 0, 1))).to_4x4()); bt.free()
    cr = h * 0.34; cy = h * 0.64
    for k in range(rng.randint(3, 4)):
        a_ = rng.uniform(0, 2 * math.pi); y0 = h * rng.uniform(0.3, 0.45)
        trunk.cyl((x + lean[0] * y0, y0, z + lean[1] * y0), (x + math.cos(a_) * cr * 0.7, cy + rng.uniform(-0.5, 1.0), z + math.sin(a_) * cr * 0.7), rb * 0.4, seg=6, r2=rb * 0.18)
    for k in range(rng.randint(5, 7)):
        a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.65); r_ = cr * rng.uniform(0.5, 0.72)
        crown(x + lean[0] * cy + math.cos(a_) * d_, cy + rng.uniform(-0.25, 0.4) * cr, z + lean[1] * cy + math.sin(a_) * d_, r_, r_ * 0.8, r_, int(9 * r_ * r_), 1.6)
for t in J['trees']: tree(t['x'], t['z'], t['h'])
def belt(pts, face):
    for (x, z) in pts:
        h = rng.uniform(13, 19); r_ = rng.uniform(4.0, 5.6)
        trunk.cyl((x, 0, z), (x, h * 0.55, z), rng.uniform(0.22, 0.32), seg=6, r2=0.16)
        crown(x, h * 0.68, z, r_, r_ * 0.85, r_, int(5 * r_ * r_), 2.0, face=face)
step = 7.5
belt([(x + rng.uniform(-1, 1), BD['z0'] - 2 + rng.uniform(-2, 2)) for x in [BD['x0'] + k * step for k in range(int((BD['x1'] - BD['x0']) / step) + 1)]], (0, 1))   # 北（主系館後面）
belt([(BD['x0'] - 2 + rng.uniform(-2, 2), z) for z in [BD['z0'] + k * step for k in range(int((FZ - BD['z0']) / step) + 1)]], (1, 0))                            # 西
belt([(BD['x1'] + 2 + rng.uniform(-2, 2), z) for z in [BD['z0'] + k * step for k in range(int((FZ - BD['z0']) / step) + 1)]], (-1, 0))                           # 東
belt([(x + rng.uniform(-1, 1), BD['z1'] + 13 + rng.uniform(-1, 2)) for x in [BD['x0'] - 20 + k * 11 for k in range(13)]], (0, -1))                             # 對街的行道樹
trunk.finish(root, uv=False); cards.finish(root, uv=False, merge=False); core.finish(root, uv=False, smooth=True)
# 對街：兩層的磚造房子（遠景、走不到）
hb = Mesh('usu_far_houses', M['brick_house'], tile=1.2); hr = Mesh('usu_far_roofs', M['roof_far']); hw = Mesh('usu_far_windows', M['win_far']); ht = Mesh('usu_far_trim', M['trim'])
x = BD['x0'] - 30
while x < BD['x1'] + 30:
    w = rng.uniform(8, 12); d = 10.0; h = rng.choice([6.2, 6.8, 7.4]); z0 = BD['z1'] + 16
    hb.box(x, x + w, 0.0, h, z0, z0 + d)
    for s_ in (1, -1): hr.quad([(x - 0.3, h, z0 + d / 2 + s_ * (d / 2 + 0.4)), (x + w + 0.3, h, z0 + d / 2 + s_ * (d / 2 + 0.4)), (x + w + 0.3, h + 2.6, z0 + d / 2), (x - 0.3, h, z0 + d / 2 + s_ * (d / 2 + 0.4))][:3] + [(x - 0.3, h + 2.6, z0 + d / 2)])
    for f in range(2):
        for k in range(int(w / 2.6)):
            wx = x + 1.0 + k * 2.6; hw.box(wx, wx + 1.1, 1.0 + f * 3.0, 2.4 + f * 3.0, z0 - 0.02, z0); ht.box(wx - 0.08, wx + 1.18, 0.92 + f * 3.0, 1.0 + f * 3.0, z0 - 0.06, z0)
    x += w + rng.uniform(1.5, 4)
hb.finish(root); hr.finish(root, uv=False); hw.finish(root, uv=False); ht.finish(root, uv=False)

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
    try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(42); sky.sun_rotation = math.radians(200)
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.3
    lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 3.2; lt.angle = math.radians(1.5); o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(48), 0, math.radians(200 + 90))
    CAMS = {'gate': ((-3.0, 1.65, 26.0), (0.0, 4.0, 0.0), 26), 'walk': ((2.2, 1.65, 9.0), (-1.0, 6.5, -28.0), 24), 'door': ((6.0, 1.65, -10.0), (0.0, 7.0, -24.0), 22),
            'bus': ((-6.0, 1.65, 21.4), (-14.0, 1.6, 18.0), 26), 'aerial': ((30.0, 40.0, 50.0), (0.0, 0.0, -8.0), 24)}
    eye, look, lens = CAMS[opt('--cam', 'gate')]
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens; cam.data.clip_end = 2000
    e, l_ = Vector(g2b(*eye)), Vector(g2b(*look)); cam.location = e; cam.rotation_euler = (l_ - e).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.abspath(PREVIEW); bpy.ops.render.render(write_still=True); print('saved', PREVIEW)
