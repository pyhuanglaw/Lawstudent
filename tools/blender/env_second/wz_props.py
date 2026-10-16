"""溫州街的街道細節：電線桿（台電水泥桿）、轉角反光鏡、路名牌、Café 門前的紅磚人行道 → 一個 GLB（溫州街區域的世界座標）。
第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/wz_props.py [-- --out assets/models/env/second_ai/wz_props.glb]

取代 src/zones3d.js buildWenzhou 裡這些套件物件的外觀（位置、方向、高度照套件；導航阻擋、電線、路燈的光暈與地面光圈在遊戲程式裡，不變）：
  TK.utilityPole：主巷 A 側 5 根（x＝−26.5、−9.2、12.2、34.2、45.5，z＝4.65，轉 π/2；都有路燈臂、第 3 根有變壓器、第 5 根有路牌）、
                  路口往北 1 根（47.55, 14.2，沒有路燈臂）。電線接點（礙子 x＝±0.75、0，高 8.52）、路燈燈頭（臂端 1.9 m、高 6.08）不變。
  TK.trafficMirror：3 支（8.7,4.5）（−9.4,−4.5）（−30.4,4.6）。
  路名牌：路口 (47.7, 7.6)。紅磚人行道：Café 門前 1.9×13.4 m（54.3, 0）＋路緣。
電線桿是同一個網格（instancing），路燈臂、變壓器、路牌是另外的零件；字（桿號牌、路牌）用 canvas 畫（PLATE_FACE_*）。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine, uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_props.glb'))

random.seed(4650)
B.reset(texres=512)
root = B.group('wz_props', props={'kind': 'wz_props'})
base = CL.materials()
M = {
    'pole': L.pbr('wz_pole_concrete', 'concrete_wall_006', tile=1.2, target='#b7b3aa', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'galv': L.flat('wz_galv', '#9aa0a3', rough=0.4, metal=0.45),
    'porc': L.flat('wz_porcelain', '#e9e7e1', rough=0.25),
    'sy': L.flat('wz_stripe_y', '#e2b934', rough=0.45), 'sk': L.flat('wz_stripe_k', '#262626', rough=0.5),
    'tr': L.flat('wz_transformer', '#8d969b', rough=0.45, metal=0.35),
    'lamp': L.flat('wz_lamp_body', '#5b6064', rough=0.45, metal=0.4),
    'lens': L.flat('wz_lamp_lens', '#f4f1e8', rough=0.3, emit=B.srgb('#ffe0a0')),
    'paper': L.flat('wz_poster', '#ece6d6', rough=0.9), 'paper2': L.flat('wz_poster_y', '#e8d06a', rough=0.9),
    'orange': L.flat('wz_mirror_orange', '#e0782a', rough=0.45), 'mirror': L.flat('wz_mirror_glass', '#dfe8ee', rough=0.08, metal=0.3),
    'black': base['metal'], 'board': base['board'], 'signpole': L.flat('wz_signpole', '#6f747a', rough=0.45, metal=0.4),
    'brick': L.pbr('wz_brick_walk', 'brick_pavement_04', tile=1.4, target='#94584a', normal=0.7, maps=('diff', 'nor'), rough_value=0.85),
    'curb': L.pbr('wz_curb', 'concrete_wall_006', tile=1.0, target='#b9b2a6', maps=('diff',), res=256, rough_value=0.85),
}


class Xf:
    def __init__(self, px, pz, ry): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)


def pole_proto():
    """水泥電桿本體（原點＝桿底中央，桿的 +x＝路燈臂的方向）：錐形水泥桿、兩支橫擔、三個礙子、腳踏釘、黃黑反光帶、桿號牌底板、兩張小廣告"""
    h = 9.0; parts = []
    body = Mesh('pole_body', M['pole']); bm = L.lathe([(0.0, 0.0), (0.17, 0.0), (0.12, h), (0.0, h)], seg=12); body.add_bm(bm); bm.free()
    ob = body.finish(None); L.smooth_mesh(ob, angle=1.2); parts.append(ob)
    ga = Mesh('pole_galv', M['galv'])
    ga.box(-0.9, 0.9, h - 0.66, h - 0.54, -0.06, 0.06); ga.box(-0.7, 0.7, h - 1.25, h - 1.15, -0.05, 0.05)       # 橫擔
    for s in (-1, 1): ga.cyl((s * 0.6, h - 0.6, 0.0), (0.0, h - 1.1, 0.0), 0.02, seg=4)                             # 斜撐
    ga.box(-0.15, 0.15, h - 0.7, h - 0.5, -0.13, 0.13)
    for k in range(12):                                                                                                # 腳踏釘
        y = 2.6 + k * 0.42; s = 1 if k % 2 else -1; r_ = 0.17 - 0.05 * y / h
        ga.cyl((0.0, y, s * r_), (0.0, y, s * (r_ + 0.18)), 0.012, seg=4)
    parts.append(ga.finish(None))
    po = Mesh('pole_porc', M['porc'])
    for x in (-0.75, 0.0, 0.75):
        for j, (r, y0) in enumerate(((0.06, 0.0), (0.075, 0.06), (0.06, 0.12))):
            bm = L.lathe([(0.0, 0.0), (r, 0.0), (r, 0.035), (0.0, 0.035)], seg=8); po.add_bm(bm, Matrix.Translation(g2b(x, h - 0.54 + y0, 0.0))); bm.free()
    parts.append(po.finish(None))
    for k in range(8):                                                                                                 # 黃黑反光帶（0–1.2 m）
        m = Mesh('pole_stripe', M['sy'] if k % 2 == 0 else M['sk']); r = 0.17 - 0.05 * (k * 0.15) / h + 0.006
        bm = L.lathe([(r, k * 0.15), (r, (k + 1) * 0.15)], seg=12); m.add_bm(bm); bm.free(); parts.append(m.finish(None, uv=False))
    pp = Mesh('pole_posters', M['paper']); r = 0.166
    for (a, y0, hh, wd) in ((0.4, 1.55, 0.3, 0.2), (2.6, 1.7, 0.22, 0.16)):                                            # 貼在桿上的小廣告（彎的紙）
        n = 3; vs = []
        for i in range(n + 1):
            ang = a - wd / r / 2 + wd / r * i / n; vs.append((math.cos(ang) * r, math.sin(ang) * r))
        for i in range(n):
            (x0, z0), (x1, z1) = vs[i], vs[i + 1]; pp.quad([(x0, y0, z0), (x0, y0 + hh, z0), (x1, y0 + hh, z1), (x1, y0, z1)])
    parts.append(pp.finish(None))
    return combine(parts, 'utility_pole')


def arm_proto():
    """路燈臂（原點＝桿底中央；燈頭在 x＝1.9、高 6.08，和套件相同）：往上翹的鋼管＋抱箍＋眼鏡蛇頭燈具（下方發光）"""
    a = Mesh('arm_pipe', M['lamp'])
    a.cyl((0.12, 5.75, 0.0), (0.9, 6.2, 0.0), 0.035, seg=6); a.cyl((0.9, 6.2, 0.0), (1.75, 6.24, 0.0), 0.035, seg=6)
    a.box(-0.14, 0.14, 5.68, 5.82, -0.14, 0.14); a.cyl((0.12, 6.35, 0.0), (0.9, 6.2, 0.0), 0.02, seg=4)
    a.box(1.62, 2.21, 6.12, 6.22, -0.13, 0.13); a.box(1.7, 2.15, 6.22, 6.27, -0.1, 0.1)
    ln = Mesh('arm_lens', M['lens']); ln.box(1.67, 2.17, 6.07, 6.12, -0.1, 0.1)
    return combine([a.finish(None), ln.finish(None)], 'pole_lamp_arm')


def transformer_proto():
    """柱上變壓器（原點＝桿底中央，掛在 +x 那一側，高 6.6）"""
    t = Mesh('tr_tank', M['tr']); bm = L.lathe([(0.0, 0.0), (0.3, 0.0), (0.32, 0.05), (0.32, 0.88), (0.3, 0.95), (0.0, 0.97)], seg=14)
    t.add_bm(bm, Matrix.Translation(g2b(0.45, 6.15, 0.0))); bm.free()
    for k in range(8):
        ang = k / 8 * 2 * math.pi; cx, cz = 0.45 + math.cos(ang) * 0.33, math.sin(ang) * 0.33; t.box(cx - 0.02, cx + 0.02, 6.25, 6.95, cz - 0.02, cz + 0.02)
    ob = t.finish(None); L.smooth_mesh(ob)
    br = Mesh('tr_bracket', M['galv']); br.box(0.1, 0.5, 6.95, 7.02, -0.08, 0.08); br.box(0.1, 0.5, 6.25, 6.32, -0.08, 0.08); br.box(-0.15, 0.15, 6.2, 7.05, -0.15, 0.15)
    bu = Mesh('tr_bush', M['porc'])
    for dz in (-0.12, 0.12): bu.cyl((0.45, 7.12, dz), (0.45, 7.35, dz), 0.035, seg=6)
    return combine([ob, br.finish(None), bu.finish(None)], 'pole_transformer')


def mirror_proto():
    """轉角反光鏡（原點＝柱底；鏡面朝 +z，中心高 3.3，和套件相同）：橘色柱、凸面鏡（淺球面）、橘框、黑色背板、上緣遮雨罩"""
    o = Mesh('mir_orange', M['orange']); o.cyl((0, 0, 0), (0, 3.0, 0), 0.05, seg=8); o.cyl((0, 2.95, 0), (0, 3.05, 0.12), 0.04, seg=6)
    n = 20; R = 0.42
    for i in range(n):                                                                                                 # 框（環）
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
        o.cyl((math.cos(a0) * R, 3.3 + math.sin(a0) * R, 0.13), (math.cos(a1) * R, 3.3 + math.sin(a1) * R, 0.13), 0.04, seg=5, caps=False)
    for i in range(10):                                                                                                # 上緣遮雨罩（半圈）
        a0, a1 = math.pi * i / 10, math.pi * (i + 1) / 10
        o.quad([(math.cos(a0) * 0.46, 3.3 + math.sin(a0) * 0.46, 0.13), (math.cos(a1) * 0.46, 3.3 + math.sin(a1) * 0.46, 0.13), (math.cos(a1) * 0.46, 3.3 + math.sin(a1) * 0.46, 0.3), (math.cos(a0) * 0.46, 3.3 + math.sin(a0) * 0.46, 0.3)])
    mi = Mesh('mir_glass', M['mirror']); bm = bmesh.new()
    c = bm.verts.new(g2b(0, 3.3, 0.2)); ring = [bm.verts.new(g2b(math.cos(2 * math.pi * i / n) * 0.4, 3.3 + math.sin(2 * math.pi * i / n) * 0.4, 0.13)) for i in range(n)]
    for i in range(n): bm.faces.new((c, ring[i], ring[(i + 1) % n]))
    mi.add_bm(bm); bm.free(); mob = mi.finish(None, uv=False); L.smooth_mesh(mob, angle=3.0)
    bk = Mesh('mir_back', M['black']); bm = L.lathe([(0.0, 0.0), (0.42, 0.0), (0.42, 0.06), (0.0, 0.06)], seg=n)
    bk.add_bm(bm, Matrix.Translation(g2b(0, 3.3, 0.06)) @ Matrix.Rotation(math.pi / 2, 4, 'X') @ Matrix.Rotation(math.pi, 4, 'Z')); bm.free()
    return combine([o.finish(None), mob, bk.finish(None)], 'traffic_mirror')


faces = []
def face(name, mat, pts, props):
    m = Mesh(name, mat); m.quad(pts); faces.append((m, props))


POLE, ARM, TRANS, MIRROR = pole_proto(), arm_proto(), transformer_proto(), mirror_proto()
_n = [0]
def inst(mesh, x, z, ry, tag):
    B.instance(mesh, f'{tag}_{_n[0]}', x, 0.0, z, root, ry=ry); _n[0] += 1


# ---- 電線桿：主巷 A 側 5 根＋路口往北 1 根
POLES = [(-26.5, 4.65, True, False, None), (-9.2, 4.65, True, False, None), (12.2, 4.65, True, True, None), (34.2, 4.65, True, False, None), (45.5, 4.65, True, False, '溫州街'), (47.55, 14.2, False, False, None)]
for i, (px, pz, arm, tr, sign) in enumerate(POLES):
    ry = math.pi / 2; xf = Xf(px, pz, ry)
    inst(POLE, px, pz, ry, 'pole')
    if arm: inst(ARM, px, pz, ry, 'pole_arm')
    if tr: inst(TRANS, px, pz, ry, 'pole_tr')
    # 桿號牌（白底黑字，朝巷子）：桿的 −z 那一面（桿座標）＝世界 −x……照桿的方向換算
    r = 0.17 - 0.05 * 2.25 / 9.0 + 0.006; a, b = xf.p(-0.11, 0, r), xf.p(0.11, 0, r)                         # 桿在 2.25 m 高的半徑＋6 mm
    face(f'PLATE_FACE_pole{i}', M['board'], [(a[0], 2.1, a[2]), (b[0], 2.1, b[2]), (b[0], 2.4, b[2]), (a[0], 2.4, a[2])][::1], {'plate': 'pole', 'text': '溫州', 'sub': f'{31 + i * 7}', 'bg': '#f2f0ea', 'color': '#1d1d1d'})
    if sign:                                                                                                            # 藍底白字的路牌（兩面）
        sp = Mesh('pole_signframe', M['signpole']); y0, y1 = 3.14, 3.46
        q = [xf.p(0.0, 0, 0.0), xf.p(1.28, 0, 0.0)]
        sp.box(min(q[0][0], q[1][0]) - 0.02, max(q[0][0], q[1][0]) + 0.02, y0 - 0.03, y1 + 0.03, min(q[0][2], q[1][2]) - 0.025, max(q[0][2], q[1][2]) + 0.025)   # 這根桿轉 π/2：框是軸對齊的
        sp.finish(root)
        for sd in (1, -1):
            p0, p1 = xf.p(0.03, 0, sd * 0.03), xf.p(1.25, 0, sd * 0.03)
            pts = [(p0[0], y0, p0[2]), (p1[0], y0, p1[2]), (p1[0], y1, p1[2]), (p0[0], y1, p0[2])]
            face(f'PLATE_FACE_roadsign_{"a" if sd > 0 else "b"}', M['board'], pts if sd > 0 else [pts[1], pts[0], pts[3], pts[2]], {'plate': 'road', 'text': sign, 'bg': '#1f4e8c', 'color': '#ffffff'})

# ---- 轉角反光鏡
for (mx, mz, ry) in ((8.7, 4.5, -2.4), (-9.4, -4.5, 0.7), (-30.4, 4.6, -2.3)): inst(MIRROR, mx, mz, ry, 'mirror')

# ---- 路名牌（路口 (47.7,7.6)，轉 π×0.08）：灰色柱＋圓頂、綠底白字「溫州街 Wenzhou St.」兩面
xf = Xf(47.7, 7.6, math.pi * 0.08)
sp = Mesh('roadname_pole', M['signpole']); sp.cyl(xf.p(0, 0, 0), xf.p(0, 3.0, 0), 0.05, seg=10); sp.sphere(xf.p(0, 3.02, 0), 0.06, seg=10, rings=5)
for (ax, ay), (bx, by) in (((0.02, 2.6), (0.98, 2.6)), ((0.02, 2.9), (0.98, 2.9)), ((0.98, 2.6), (0.98, 2.9))):    # 牌子的框（這支轉 0.08π：用細管，不用軸對齊的方塊）
    sp.cyl(xf.p(ax, ay, 0), xf.p(bx, by, 0), 0.016, seg=5)
sp.finish(root)
for sd in (1, -1):
    p0, p1 = xf.p(0.03, 0, sd * 0.012), xf.p(0.97, 0, sd * 0.012); pts = [(p0[0], 2.6, p0[2]), (p1[0], 2.6, p1[2]), (p1[0], 2.9, p1[2]), (p0[0], 2.9, p0[2])]
    face(f'PLATE_FACE_roadname_{"a" if sd > 0 else "b"}', M['board'], pts if sd > 0 else [pts[1], pts[0], pts[3], pts[2]], {'plate': 'roadname', 'text': '溫州街', 'sub': 'Wenzhou St.', 'bg': '#1f6448', 'color': '#f4f6f2'})

# ---- 路面（精修第 3 批，LAWWW2-B 2026-10-16）：wz_road_tex.py 畫好的整條路貼圖（補丁、灌縫、輪跡、油漬、水溝蓋、白線紅線、人孔、慢字、牆腳暗角）
#      蓋在套件的路面（TK.road，y 0～0.013 的柏油、白線、鐵柵、人孔、慢字）上面：y 0.016。套件的斑馬線（y 0.012，polygonOffset −2）照舊疊在上面。
GEN = os.path.join(HERE, 'textures', 'gen')
def road_mat(name, fn):
    m = L.flat(name, '#ffffff', rough=0.93); nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); tx.interpolation = 'Linear'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); return m
RY = 0.016
rd = Mesh('wz_road_main', road_mat('wz_road_main', 'wz_road_main.jpg'))
rd.quad([(-37.0, RY, 5.0), (47.3, RY, 5.0), (47.3, RY, -5.0), (-37.0, RY, -5.0)])
uv01(rd.finish(root, uv=True))
rn = Mesh('wz_road_ns', road_mat('wz_road_ns', 'wz_road_ns.jpg'))
rn.quad([(47.3, RY, -46.0), (47.3, RY, 49.5), (55.3, RY, 49.5), (55.3, RY, -46.0)])
uv01(rn.finish(root, uv=True))
# 三條側巷（北巷、南巷、西端巷子的兩段）：一張貼圖集 wz_road_side.jpg，每塊的世界範圍和 UV 在 wz_road_side.json（wz_road_tex.py 寫的）
SR = json.load(open(os.path.join(GEN, 'wz_road_side.json')))
rs = Mesh('wz_road_side', road_mat('wz_road_side', 'wz_road_side.jpg'))
for r in SR.values(): rs.quad([(r['x0'], RY, r['z1']), (r['x1'], RY, r['z1']), (r['x1'], RY, r['z0']), (r['x0'], RY, r['z0'])])
ob = rs.finish(root, uv=True, merge=False); uvl = ob.data.uv_layers.active
for poly in ob.data.polygons:
    cx, cz = poly.center.x, -poly.center.y
    r = next(r for r in SR.values() if r['x0'] < cx < r['x1'] and r['z0'] < cz < r['z1'])
    for li in poly.loop_indices:
        co = ob.data.vertices[ob.data.loops[li].vertex_index].co; x, z = co.x, -co.y
        uvl.data[li].uv = (r['u0'] + (x - r['x0']) / (r['x1'] - r['x0']) * (r['u1'] - r['u0']), r['v0'] + (z - r['z0']) / (r['z1'] - r['z0']) * (r['v1'] - r['v0']))

# ---- Café 門前的紅磚人行道（平的，不改導航）＋低路緣
bw = Mesh('cafe_brick_walk', M['brick']); bw.box(53.35, 55.25, 0.0, 0.03, -6.7, 6.7); bw.finish(root)   # 頂面 0.016 → 0.03：比新路面（0.016）高一點，不會 z-fighting
cb = Mesh('cafe_brick_curb', M['curb']); cb.box(53.26, 53.4, 0.0, 0.045, -6.7, 6.7); cb.finish(root)

for m, props in faces: uv01(m.finish(root, uv=True, props=props))
# 純色材質改成頂點色材質（第二輪減量，2026-10-10；lib2.vc_consolidate）：同一組的零件合成一個網格、一次 draw call
L.vc_consolidate(root, {**dict.fromkeys(('wz_porcelain', 'wz_stripe_y', 'wz_stripe_k', 'wz_poster', 'wz_poster_y', 'wz_mirror_orange'), L.vc_material('wz_vc_matte', rough=0.85)),
                        **dict.fromkeys(('wz_galv', 'wz_transformer', 'wz_signpole', 'cafe_iron_black', 'wz_lamp_body'), L.vc_metal('wz_vc_metal', rough=0.45, metal=0.35))})
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
