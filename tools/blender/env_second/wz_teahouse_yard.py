"""一盞茶屋的前院（WZ-YIZHAN-1104，AA_656，LAWWW2 11-04）→ assets/models/env/second_ai/wz_teahouse_yard.glb。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/wz_teahouse_yard.py [-- --out 路徑]

座標＝wz_teahouse 區域的座標（和 wz_teahouse_interior.glb 同一套：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6、+z 往溫州街）。
室內（房子、緣側的地板、前牆）是 AA 的模型；這個檔是前院和從前院看得到的外面：
  地面（苔地、碎石庭、踏石、玄關前的石板土間、緣側前的沓脫石）、緣側下面的裙板與束、
  臨街的冠木門（「一盞」木牌、門燈）、門左邊的灰泥紅磚柱牆、門右邊的四つ目垣（矮竹籬）、東側的建仁寺垣、
  老樟樹、春日石燈籠、景石、杜鵑、蕨、甕、竹掃把；玄關外的暖簾、提燈、木牌；
  簷（下屋）＝YARD_EAVE、主屋的寄棟瓦屋頂和屋頂下的小壁＝YARD_ROOF：遊戲只在玩家站在前院時顯示（人在屋裡時是剖面視角，屋頂會擋住）；
  牆外的人行道、馬路、對面的公寓（背景，走不到）。
參考圖：docs/story_planning/ref_images/shops/wz_yizhan_ext.webp（企劃線）；字（一盞）照 signs_approved/yizhan_lantern.webp、yizhan_front_ref.webp 切的圖（textures/src/wz_yizhan/）。
高度：室內地板 y 0；前院地面 YG＝−0.42；玄關前石板土間 −0.24；室內玄關 −0.12；緣側前沓脫石 −0.21。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import bush   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_teahouse_yard.glb'))
SRC = os.path.join(HERE, 'textures', 'src', 'wz_yizhan')
GEN = os.path.join(HERE, 'textures', 'gen')

YG = -0.42                    # 前院地面
X0, X1 = -4.2, 4.2            # 房子的寬
ZF = 5.0                      # 房子前牆
ZE = 6.2                      # 緣側邊緣（前院從這裡開始）
ZS = 9.6                      # 臨街的牆線
GX, GW = -3.0, 1.2            # 冠木門中心、寬
XW, XE = -4.45, 4.45          # 前院兩側的牆／竹垣中心線

random.seed(1104)
B.reset(texres=512)
root = B.group('wz_teahouse_yard', props={'kind': 'wz_teahouse_yard', 'note': 'YARD_ROOF／YARD_EAVE：玩家在前院時才顯示'})
g_roof = B.group('YARD_ROOF', root, {'show': 'player_in_yard'})
g_eave = B.group('YARD_EAVE', root, {'show': 'player_in_yard'})
base = CL.materials()


def img_mat(name, path, rough=0.6, emit=0.0, clip=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path, check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], r.inputs[0]); nt.links.new(r.outputs[0], bs.inputs['Alpha'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


P = 'wzy_'
M = {
    'moss': L.pbr(P + 'moss', 'grass_ground', tile=1.4, target='#56653a', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.95),
    'gravel': L.pbr(P + 'gravel', 'granular_concrete', tile=0.5, target='#8a857a', normal=0.7, maps=('diff', 'nor'), res=256, rough_value=0.95),
    'stone': L.pbr(P + 'stone', 'granite_tile', tile=0.7, target='#77736b', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.65),
    'slab': L.pbr(P + 'slab', 'japanese_stone_wall', tile=1.2, target='#706b61', normal=0.8, maps=('diff', 'nor'), res=256, rough_value=0.8),
    'rock': L.pbr(P + 'rock', 'mossy_rock', tile=1.0, target='#7a7867', normal=0.8, maps=('diff', 'nor'), res=256, rough_value=0.9),
    'plaster': L.pbr(P + 'plaster', 'white_plaster_02', tile=1.4, target='#b9af9c', contrast=1.0, normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.92),
    'brick': L.pbr(P + 'brick', 'red_brick_03', tile=1.0, target='#663a2c', contrast=0.85, normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'wood': L.pbr(P + 'wood_old', 'dark_wood', tile=0.8, target='#3a2a1e', normal=0.7, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'kawara': L.pbr(P + 'kawara', 'jp_kawara', tile=1.2, normal=1.0),
    'ridge': L.flat(P + 'ridge', '#3a3c40', rough=0.55),
    'soffit': L.flat(P + 'soffit', '#3b2c21', rough=0.8),
    'dark': L.flat(P + 'crawl', '#1d1a17', rough=1.0),
    'bamboo': L.flat(P + 'bamboo', '#b49b63', rough=0.5),
    'bamboo_dk': L.flat(P + 'bamboo_old', '#8d7a4f', rough=0.6),
    'rope': L.flat(P + 'rope', '#2a2320', rough=0.9),
    'metal': L.flat(P + 'gutter', '#6e706b', rough=0.5, metal=0.35),
    'copper': L.flat(P + 'lamp_metal', '#3a2c22', rough=0.5, metal=0.3),
    'paper': L.flat(P + 'lamp_paper', '#f3e7cf', rough=0.6, emit=B.srgb('#ffcf8a')),
    'urn': L.flat(P + 'urn', '#6a5a46', rough=0.35),
    'leaf': CL.leaf_mat(P + 'leaf_broad', 'broad_leaves.png'),
    'fern': CL.leaf_mat(P + 'leaf_fern', 'bf_fern_frond.png'),
    'hedge': L.pbr(P + 'hedge', 'leafy_grass', tile=0.6, target='#3f5a2c', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.85),
    # 灌木的葉團分三種綠（BB-C 第九批 P3「整片同一個飽和綠、葉面沒有明暗」，LAWWW2-C 11-13）：偏黃的新葉、原本的綠、偏藍的深綠，每一團隨機挑一種
    'hedge_y': L.pbr(P + 'hedge_y', 'leafy_grass', tile=0.6, target='#56693a', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'hedge_d': L.pbr(P + 'hedge_d', 'leafy_grass', tile=0.6, target='#2e4630', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'azalea': img_mat(P + 'azalea', os.path.join(GEN, 'azalea_leaves.png'), rough=0.7, clip=True),
    'plaque': img_mat(P + 'plaque', os.path.join(SRC, 'plaque.jpg'), rough=0.75),
    'chochin': img_mat(P + 'chochin', os.path.join(SRC, 'chochin.jpg'), rough=0.6, emit=0.35),
    'noren': img_mat(P + 'noren', os.path.join(SRC, 'noren.jpg'), rough=0.9),
    # 牆外的背景
    'pave': L.pbr(P + 'sidewalk', 'square_brick_paving', tile=1.2, target='#8a7266', maps=('diff',), res=256, rough_value=0.85),
    'curb': L.flat(P + 'curb', '#9c9a94', rough=0.8), 'curb_red': L.flat(P + 'curb_red', '#a8473a', rough=0.7),
    'road': L.pbr(P + 'road', 'asphalt_02', tile=3.0, target='#acacaa', maps=('diff',), res=256, rough_value=0.9),
    'apt': L.pbr(P + 'apt', 'plaster_grey_04', tile=2.5, target='#a39c8e', maps=('diff',), res=256, rough_value=0.9),
    'apt2': L.pbr(P + 'apt2', 'rectangular_facade_tiles', tile=1.5, target='#a89e8c', maps=('diff',), res=256, rough_value=0.8),
    'win': L.flat(P + 'apt_win', '#3b4246', rough=0.25),
    'vc': L.vc_material(P + 'vc', rough=0.7),
}
CC0 = '--nocc0' not in sys.argv   # SHOP-REALISM-1112（D159／D160／D161，LAWWW2-C 11-13）：純色零件換 ambientCG 材質組、景石和水桶換 Poly Haven 掃描；--nocc0＝原版
if CC0:
    import cc0_aakit as cc0_kit   # noqa: E402（tools/blender/env_second/cc0_aakit.py）
    K0 = cc0_kit.Kit(L, B, root, g2b, prefix=P)
    M.update({
        'bamboo': K0.acg(P + 'bamboo', 'Bamboo001A', target='#b49b63', tile=0.5, rough_value=0.5, res=256),        # 四つ目垣、建仁寺垣的竹
        'bamboo_dk': K0.acg(P + 'bamboo_old', 'Bamboo001A', target='#8d7a4f', tile=0.5, rough_value=0.6, res=256),
        'rope': K0.acg(P + 'rope', 'Rope001', target='#2a2320', tile=0.12, rough_value=0.9, res=256),              # 綁竹籬的棕櫚繩
        'metal': K0.acg(P + 'gutter', 'Metal032', target='#6e706b', tile=0.6, metal=0.35, rough_value=0.5, res=256),   # 雨溝、雨水管
        'copper': K0.acg(P + 'lamp_metal', 'Metal032', target='#3a2c22', tile=0.4, metal=0.3, rough_value=0.5, res=256),   # 門燈、提燈的鐵件
        'urn': K0.acg(P + 'urn', 'Plastic006', vary=0.08, target='#6a5a46', tile=0.4, rough_value=0.35, res=256),     # 上釉的甕
        'curb': K0.acg(P + 'curb', 'Concrete034', target='#9c9a94', tile=0.8, rough_value=0.8, res=256),
        'curb_red': K0.acg(P + 'curb_red', 'Concrete034', target='#a8473a', tile=0.8, rough_value=0.7, res=256),
        'ridge': K0.acg(P + 'ridge', 'Concrete034', target='#3a3c40', tile=0.6, rough_value=0.55, res=256),         # 屋脊、棟瓦
        'dark': K0.acg(P + 'crawl', 'Concrete034', maps=('diff',), target='#1d1a17', tile=1.0, rough_value=1.0, res=256),   # 緣側下面
        'soffit': L.pbr(P + 'soffit', 'dark_wood', tile=0.8, target='#3b2c21', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.8),   # 簷下的木板
    })
for k in ('bamboo', 'bamboo_dk', 'wood', 'plaque', 'noren'): M[k].use_backface_culling = False
FERN_UV = True
_acc = {}
def acc(key, group=None):
    g = group or root; mat = M[key]; k = (mat.name, g.name)
    if k not in _acc: _acc[k] = (Mesh(P + key + ('' if g is root else '_' + g.name.lower()), mat), g)
    return _acc[k][0]
VC = L.CMesh(P + 'vc_parts', M['vc'])


def uv_quad(name, mat, pts, uv=(0, 0, 1, 1), parent=None):
    """有自己 UV 的四邊形（字的貼圖）：pts 逆時針、從左下開始（遊戲座標）"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
    u0, v0, u1, v1 = uv
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    bm.normal_update(); return B.mesh_obj(name, bm, mat, parent or root)


# ======================================================================
# 地面
acc('moss').box(-4.7, 4.7, YG - 0.06, YG, ZE - 0.1, ZS + 0.1)
acc('slab').box(-16, 16, YG - 0.14, YG - 0.08, -7.0, ZS + 0.1)                      # 房子和鄰居底下（從斜的角度看不到天空）
acc('gravel').box(-2.3, 4.05, YG, YG + 0.012, 6.5, 9.3)
rk = random.Random(5)
for i in range(30):                                                       # 碎石庭的邊：一排小石
    t = i / 29; z = 6.5 + t * 2.8
    VC.crbox(-2.36, -2.24, YG, YG + 0.05 + rk.uniform(0, 0.02), z - 0.045, z + 0.045, rk.choice(('#8a877f', '#7d7a72', '#94918a')), r=0.02)
# 碎石的耙紋（v2，LAWWW2-C 11-13；BB-C 第九批 P2「白色虛線圈像路面標線」）：連續的淺色脊線＋旁邊一條暗的溝影，對比壓低；
#   景石周圍五圈同心橢圓，其他碎石面是東西向的平行直紋（枯山水的做法），直紋碰到最外圈就斷開
RCX, RCZ = 2.2, 7.6
def rake_quad(pts, col): VC.poly([(x, YG + 0.013, z) for x, z in pts], col)
RINGS = [0.5 + j * 0.13 for j in range(5)]
for r in RINGS:
    n = 56
    for i in range(n):
        a0 = 2 * math.pi * i / n; a1 = 2 * math.pi * (i + 1) / n
        Pt = lambda a, rr: (RCX + math.cos(a) * rr * 1.25, RCZ + math.sin(a) * rr)
        x0, z0 = Pt(a0, r)
        if not (-2.25 < x0 < 4.0 and 6.55 < z0 < 9.25): continue
        rake_quad([Pt(a0, r), Pt(a1, r), Pt(a1, r - 0.022), Pt(a0, r - 0.022)], '#aaa59a')          # 脊（受光）
        rake_quad([Pt(a0, r - 0.022), Pt(a1, r - 0.022), Pt(a1, r - 0.05), Pt(a0, r - 0.05)], '#76726a')   # 溝（陰影）
ROUT = RINGS[-1] + 0.06
def outside_ring(x, z): return ((x - RCX) / (ROUT * 1.25)) ** 2 + ((z - RCZ) / ROUT) ** 2 > 1.0
def near_tree(x, z): return math.hypot(x - 3.65, z - 9.0) < 0.85
zz = 6.62
while zz < 9.22:
    xs = [-2.18 + i * 0.1 for i in range(62)]; run = []
    for x in xs + [None]:
        ok = x is not None and x < 3.98 and outside_ring(x, zz) and not near_tree(x, zz)
        if ok: run.append(x); continue
        if len(run) > 1:
            xa, xb = run[0], run[-1] + 0.1
            rake_quad([(xa, zz), (xb, zz), (xb, zz + 0.022), (xa, zz + 0.022)], '#aaa59a')
            rake_quad([(xa, zz + 0.022), (xb, zz + 0.022), (xb, zz + 0.05), (xa, zz + 0.05)], '#76726a')
        run = []
    zz += 0.13


def flagstone(m, cx, cz, r, seed, top=YG + 0.035, h=0.06, ax=1.1, az=0.9, rot=0.0, jag=(0.78, 1.08), nn=(6, 8)):
    rr = random.Random(seed); n = rr.randint(*nn); a0 = rr.uniform(0, 6.28); ca, sa = math.cos(rot), math.sin(rot)
    pts = []
    for i in range(n):
        a = a0 + 2 * math.pi * i / n + rr.uniform(-0.2, 0.2); rad = r * rr.uniform(*jag)
        lx, lz = math.cos(a) * rad * ax, math.sin(a) * rad * az
        pts.append((cx + lx * ca - lz * sa, cz + lx * sa + lz * ca))
    bm = bmesh.new(); tv = [bm.verts.new(g2b(x, top, z)) for x, z in pts]; bv = [bm.verts.new(g2b(x, top - h, z)) for x, z in pts]
    bm.faces.new(tv); bm.faces.new(list(reversed(bv)))
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((bv[i], bv[j], tv[j], tv[i]))
    bmesh.ops.bevel(bm, geom=[e for e in bm.edges if all(v in tv for v in e.verts)], offset=0.012, segments=1, affect='EDGES')
    bm.normal_update(); m.add_bm(bm); bm.free()


# 踏石路：冠木門 → 玄關前的石板土間（DOORS.md 的折線），兩三塊一排、錯開
PATH = [(-3.0, 9.55), (-3.0, 9.2), (-2.7, 8.5), (-3.1, 7.8), (-3.0, 7.0), (-3.0, 6.3)]
def along(t):
    segs = [(PATH[i], PATH[i + 1], math.dist(PATH[i], PATH[i + 1])) for i in range(len(PATH) - 1)]; tot = sum(s[2] for s in segs); d = t * tot
    for a, b, l in segs:
        if d <= l: k = d / l; return a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (b[0] - a[0]) / l, (b[1] - a[1]) / l
        d -= l
    a, b, l = segs[-1]; return b[0], b[1], (b[0] - a[0]) / l, (b[1] - a[1]) / l
sm = acc('stone'); k = 0; rs = random.Random(1113)
# v2（LAWWW2-C 11-13；BB-C 第九批 P2「踏石同大小的六角形一排」，D159 同類要有變化）：每塊 8～11 邊、輪廓起伏大、長寬比和轉角各不同、大小 0.16～0.31 m、高低差幾公分、
#   一大一小錯開不對齊；路線（PATH）和走得到的地方不變
for i in range(10):
    x, z, dx, dz = along(i / 9.0 + rs.uniform(-0.015, 0.015)); nx, nz = -dz, dx
    pair = i % 2 == 0
    offs = ((-0.2 + rs.uniform(-0.05, 0.03)), (0.19 + rs.uniform(-0.03, 0.06))) if pair else (rs.uniform(-0.06, 0.06),)
    for o in offs:
        r_ = rs.uniform(0.16, 0.22) if pair else rs.uniform(0.24, 0.31)
        flagstone(sm, x + nx * o + dx * rs.uniform(-0.04, 0.04), z + nz * o + dz * rs.uniform(-0.04, 0.04), r_, 300 + k,
                  top=YG + rs.uniform(0.025, 0.05), ax=rs.uniform(0.9, 1.3), az=rs.uniform(0.75, 1.05), rot=rs.uniform(0, math.pi), jag=(0.68, 1.14), nn=(8, 11)); k += 1
# 玄關前的石板土間（−0.24）：x −4.2～−2.2、z 5.0～6.2；前緣一條整塊的花崗石
acc('slab').box(X0, -2.2, YG, -0.25, ZF, ZE)
xf_s = acc('stone'); xf_s.rbox(X0 + 0.02, -2.22, -0.27, -0.24, ZF, ZE - 0.35, r=0.01)
xf_s.rbox(X0 + 0.02, -2.22, YG, -0.235, ZE - 0.36, ZE + 0.02, r=0.025)
# 緣側前的沓脫石（−0.21）：(1.0, 6.425) 0.9×0.45（遊戲照這塊石頭做兩階）
acc('rock').rbox(0.55, 1.45, YG, -0.21, 6.2, 6.65, r=0.06, seg=3)
# 緣側下面：裙板（簷下的木條）、束（短柱）立在束石上、裡面黑的
acc('dark').box(-2.2, X1, YG, -0.03, ZF + 0.2, ZE - 0.1)
acc('wood').box(-2.2, X1 + 0.02, -0.13, -0.01, ZE - 0.1, ZE)
for x in (-1.9, -0.3, 2.2, 3.85):
    acc('wood').box(x - 0.045, x + 0.045, YG + 0.1, -0.13, ZE - 0.2, ZE - 0.11)
    acc('stone').rbox(x - 0.1, x + 0.1, YG, YG + 0.1, ZE - 0.26, ZE - 0.06, r=0.02)
# 房子兩側和前院牆之間（x 4.2～4.6、−4.6～−4.2，z 5～6.2）：房子的側面板
for (a, b) in ((X1, XE), (XW, X0)):
    acc('plaster').box(a, b, YG, 2.6, ZF - 0.1, ZE)

# ======================================================================
# 簷（下屋，YARD_EAVE）：前牆 z 5.0、y 2.92 → 簷口 z 6.75、y 2.46；柱子在 (−2.2, 6.12)、(4.12, 6.12)、(−4.12, 6.12)
EZ0, EY0, EZ1, EY1 = ZF, 2.92, 6.78, 2.46
def eave_y(z): return EY0 + (EY1 - EY0) * (z - EZ0) / (EZ1 - EZ0)
for (px, y0) in ((-2.2, 0.0), (4.12, 0.0), (-4.12, -0.24)):
    acc('wood').rbox(px - 0.06, px + 0.06, y0, eave_y(6.12) - 0.12, 6.06, 6.18, r=0.012)   # 柱子一直顯示（屋裡也看得到）
    if px != -2.2: acc('stone').rbox(px - 0.12, px + 0.12, YG, y0 + 0.02 if y0 < 0 else YG + 0.12, 6.0, 6.24, r=0.02)
acc('wood', g_eave).rbox(X0 - 0.35, X1 + 0.35, eave_y(6.12) - 0.28, eave_y(6.12) - 0.12, 6.05, 6.19, r=0.015)   # 桁
for i in range(21):                                                                                 # 垂木
    x = X0 - 0.3 + i * (X1 - X0 + 0.6) / 20
    acc('wood', g_eave).cyl((x, EY0 - 0.06, EZ0), (x, EY1 - 0.06, EZ1 - 0.03), 0.028, seg=4)
rf = acc('soffit', g_eave); rf.quad([(X0 - 0.4, EY0 - 0.02, EZ0), (X1 + 0.4, EY0 - 0.02, EZ0), (X1 + 0.4, EY1 - 0.02, EZ1), (X0 - 0.4, EY1 - 0.02, EZ1)][::-1])   # 野地板（從下面看）
kw = acc('kawara', g_eave); kw.quad([(X0 - 0.4, EY0 + 0.05, EZ0 - 0.05), (X0 - 0.4, EY1 + 0.03, EZ1 + 0.02), (X1 + 0.4, EY1 + 0.03, EZ1 + 0.02), (X1 + 0.4, EY0 + 0.05, EZ0 - 0.05)][::-1])
acc('ridge', g_eave).cyl((X0 - 0.4, EY1 + 0.04, EZ1 + 0.02), (X1 + 0.4, EY1 + 0.04, EZ1 + 0.02), 0.05, seg=8)            # 軒瓦一排
acc('ridge', g_eave).box(X0 - 0.4, X1 + 0.4, EY0 + 0.02, EY0 + 0.12, EZ0 - 0.06, EZ0 + 0.06)                              # 前牆和簷交接的水切
acc('ridge', g_eave).box(X0 - 0.42, X0 - 0.36, EY1, EY0 + 0.06, EZ0, EZ1 + 0.04); acc('ridge', g_eave).box(X1 + 0.36, X1 + 0.42, EY1, EY0 + 0.06, EZ0, EZ1 + 0.04)
gm = acc('metal', g_eave); gm.cyl((X0 - 0.4, EY1 - 0.06, EZ1 + 0.1), (X1 + 0.4, EY1 - 0.06, EZ1 + 0.1), 0.055, seg=8)  # 雨水槽
gm.cyl((X1 + 0.3, EY1 - 0.08, EZ1 + 0.1), (X1 + 0.3, EY1 - 0.3, EZ1 + 0.1), 0.03, seg=6); acc('metal').cyl((X1 + 0.3, EY1 - 0.3, EZ1 + 0.1), (X1 + 0.3, YG + 0.05, 6.2), 0.03, seg=6)   # 落水管（鎖鏈換成管）

# 主屋的寄棟瓦屋頂（YARD_ROOF）：外框 x −4.65～4.65、z −5.45～5.15、簷口 y 3.3、坡度 0.55
RX0, RX1, RZ0, RZ1, RY, PIT = -4.65, 4.65, -5.45, 5.15, 3.3, 0.55
hw = (RX1 - RX0) / 2; RTOP = RY + hw * PIT; rz0, rz1 = RZ0 + hw, RZ1 - hw
A, Bp, Cp, Dp = (RX0, RY, RZ1), (RX1, RY, RZ1), (RX1, RY, RZ0), (RX0, RY, RZ0)
T0, T1 = (0.0, RTOP, rz1), (0.0, RTOP, rz0)
kr = acc('kawara', g_roof)
kr.bm.faces.new([kr.bm.verts.new(g2b(*p)) for p in (A, Bp, T0)][::-1])                 # 前面的三角形（對著前院）
kr.bm.faces.new([kr.bm.verts.new(g2b(*p)) for p in (Cp, Dp, T1)][::-1])
kr.bm.faces.new([kr.bm.verts.new(g2b(*p)) for p in (Bp, Cp, T1, T0)][::-1])
kr.bm.faces.new([kr.bm.verts.new(g2b(*p)) for p in (Dp, A, T0, T1)][::-1])
sf = acc('soffit', g_roof); sf.quad([(RX0, RY - 0.04, RZ1), (RX1, RY - 0.04, RZ1), (X1, RY - 0.04, ZF), (X0, RY - 0.04, ZF)])
for (p, q) in ((A, T0), (Bp, T0), (Cp, T1), (Dp, T1)): acc('ridge', g_roof).cyl((p[0], p[1] + 0.06, p[2]), (q[0], q[1] + 0.06, q[2]), 0.07, seg=6)   # 隅棟
acc('ridge', g_roof).cyl((0, RTOP + 0.08, rz0 - 0.05), (0, RTOP + 0.08, rz1 + 0.05), 0.11, seg=8)                                                # 大棟
for zz in (rz1, rz0): acc('ridge', g_roof).box(-0.16, 0.16, RTOP + 0.02, RTOP + 0.36, zz - 0.09, zz + 0.09)                                        # 鬼瓦
acc('ridge', g_roof).cyl((RX0, RY - 0.02, RZ1 + 0.02), (RX1, RY - 0.02, RZ1 + 0.02), 0.05, seg=8)                                              # 前面的軒瓦
# 簷和主屋屋頂之間的小壁（前牆 z 5.0、y 2.6～3.3；兩側也圍起來，從前院看不到屋裡）
acc('plaster', g_roof).box(X0, X1, 2.6, RY, ZF - 0.02, ZF + 0.02)
acc('wood', g_roof).box(X0, X1, 2.6, 2.7, ZF + 0.02, ZF + 0.06); acc('wood', g_roof).box(X0, X1, RY - 0.12, RY - 0.04, ZF + 0.02, ZF + 0.06)
for x in (X0, -2.2, 1.0, X1): acc('wood', g_roof).box(x - 0.06, x + 0.06, 2.6, RY - 0.04, ZF + 0.02, ZF + 0.07)
for (a, b) in ((X0 - 0.02, X0 + 0.02), (X1 - 0.02, X1 + 0.02)): acc('plaster', g_roof).box(a, b, 2.6, RY, -5.0, ZF)
acc('plaster', g_roof).box(X0, X1, 2.6, RY, -5.02, -4.98)

# ======================================================================
# 臨街：冠木門
GP0, GP1 = GX - GW / 2 - 0.06, GX + GW / 2 + 0.06            # 門柱中心（−3.66、−2.34）
for x in (GP0, GP1):
    acc('wood').rbox(x - 0.09, x + 0.09, YG + 0.14, YG + 2.66, ZS - 0.09, ZS + 0.09, r=0.015)
    acc('stone').rbox(x - 0.15, x + 0.15, YG, YG + 0.15, ZS - 0.15, ZS + 0.15, r=0.03)
acc('wood').rbox(GX - 1.02, GX + 1.02, YG + 2.48, YG + 2.7, ZS - 0.085, ZS + 0.085, r=0.02)     # 冠木
acc('wood').rbox(GP0 + 0.09, GP1 - 0.09, YG + 2.2, YG + 2.3, ZS - 0.05, ZS + 0.05, r=0.01)      # 貫
acc('wood').box(GP0 - 0.1, GP1 + 0.1, YG, YG + 0.04, ZS - 0.1, ZS + 0.1)                         # 敷石
# 右柱的木牌「一盞」（街那一面＋前院那一面）、木牌上面的門燈（方形紙燈＋鐵架）
for side in (1, -1):
    zf = ZS + side * 0.093
    pts = [(GP1 - 0.11, YG + 1.02, zf), (GP1 + 0.11, YG + 1.02, zf), (GP1 + 0.11, YG + 1.64, zf), (GP1 - 0.11, YG + 1.64, zf)]
    if side < 0: pts = [pts[1], pts[0], pts[3], pts[2]]
    uv_quad(f'{P}gate_plaque_{"st" if side > 0 else "yd"}', M['plaque'], pts)
acc('wood').box(GP1 - 0.115, GP1 + 0.115, YG + 1.0, YG + 1.66, ZS + 0.088, ZS + 0.092)
lx, ly, lz = GP1, YG + 2.02, ZS + 0.3
acc('copper').box(lx - 0.012, lx + 0.012, ly + 0.18, ly + 0.21, ZS + 0.09, lz); acc('copper').cyl((lx, ly + 0.2, lz), (lx, ly + 0.15, lz), 0.006, seg=4)
for (y0, y1) in ((ly - 0.02, ly), (ly + 0.13, ly + 0.15)): acc('copper').box(lx - 0.1, lx + 0.1, y0, y1, lz - 0.1, lz + 0.1)
for sx in (-0.095, 0.095):
    for sz in (-0.095, 0.095): acc('copper').box(lx + sx - 0.008, lx + sx + 0.008, ly, ly + 0.13, lz + sz - 0.008, lz + sz + 0.008)
acc('paper').box(lx - 0.085, lx + 0.085, ly, ly + 0.13, lz - 0.085, lz + 0.085)
CL.glow(root, 'gate_lamp', lx, ly + 0.07, lz, color='rgba(255,200,130,1)', size=1.1, day=0.0, night=0.9)

# 門左邊（x −4.6～−3.75）和西側（x −4.45、z 6.2～9.6）：灰泥牆（石砌腰、瓦頂）＋紅磚柱；牆上一排小直窗（參考圖）
WH = YG + 1.72
def plaster_wall(x0, x1, z0, z1, slits=0):
    acc('slab').box(x0, x1, YG, YG + 0.32, z0, z1)
    acc('plaster').box(x0 + 0.015 * (x1 - x0 > 0.3), x1 - 0.015 * (x1 - x0 > 0.3), YG + 0.32, WH, z0 + 0.015 * (z1 - z0 > 0.3), z1 - 0.015 * (z1 - z0 > 0.3))
    acc('ridge').box(x0 - 0.04, x1 + 0.04, WH, WH + 0.06, z0 - 0.04, z1 + 0.04); acc('ridge').cyl((x0 if z1 - z0 < 0.4 else (x0 + x1) / 2, WH + 0.08, z0 if z1 - z0 > 0.4 else (z0 + z1) / 2), (x1 if z1 - z0 < 0.4 else (x0 + x1) / 2, WH + 0.08, z1 if z1 - z0 > 0.4 else (z0 + z1) / 2), 0.05, seg=6)
    for i in range(slits):
        t = (i + 0.5) / slits
        if z1 - z0 > x1 - x0: z = z0 + (z1 - z0) * t; VC.crbox(x1 - 0.005, x1 + 0.005, YG + 0.75, YG + 1.25, z - 0.05, z + 0.05, '#2a2622', r=0.003); VC.crbox(x0 - 0.005, x0 + 0.005, YG + 0.75, YG + 1.25, z - 0.05, z + 0.05, '#2a2622', r=0.003)
        else: x = x0 + (x1 - x0) * t; VC.crbox(x - 0.05, x + 0.05, YG + 0.75, YG + 1.25, z1 - 0.005, z1 + 0.005, '#2a2622', r=0.003)
def pier(x, z, h=YG + 1.95):
    acc('brick').box(x - 0.14, x + 0.14, YG, h, z - 0.14, z + 0.14); acc('slab').box(x - 0.17, x + 0.17, h, h + 0.07, z - 0.17, z + 0.17)
plaster_wall(XW - 0.08, XW + 0.08, ZE, ZS - 0.18, slits=5)
plaster_wall(XW + 0.18, GP0 - 0.15, ZS - 0.08, ZS + 0.08, slits=0)
pier(XW, ZS); pier(XW, 7.9); pier(XW, ZE + 0.1)
# 門右邊：四つ目垣（矮竹籬，x −2.2～4.6、高 1.05）
FX0, FX1, FH = GP1 + 0.15, 4.6, YG + 1.05
for i in range(int((FX1 - FX0) / 0.9) + 1):                                                         # 親柱（粗竹）
    x = FX0 + i * 0.9; acc('bamboo_dk').cyl((x, YG, ZS), (x, FH + 0.05, ZS), 0.028, seg=8)
    acc('bamboo_dk').cyl((x, FH + 0.05, ZS), (x, FH + 0.06, ZS), 0.02, seg=8)
for i in range(int((FX1 - FX0) / 0.3) + 1):                                                         # 立子
    x = FX0 + 0.15 + i * 0.3
    if x < FX1: acc('bamboo').cyl((x, YG, ZS + 0.03), (x, FH - 0.08, ZS + 0.03), 0.013, seg=6)
for y in (YG + 0.3, YG + 0.62, YG + 0.94):                                                          # 胴縁（三道）＋綁繩
    acc('bamboo').cyl((FX0, y, ZS - 0.01), (FX1, y, ZS - 0.01), 0.016, seg=6)
    for i in range(int((FX1 - FX0) / 0.3) + 1):
        x = FX0 + 0.15 + i * 0.3
        if x < FX1: acc('rope').box(x - 0.02, x + 0.02, y - 0.02, y + 0.02, ZS - 0.03, ZS + 0.05)
# 四つ目垣外側的生垣（BB 11-04 07:55「竹籬外一片白」：矮竹籬看得穿，後面就是淺色的人行道。照一般的作法，竹籬外種一排修剪過的山茶／犬黃楊，高 1.45；
# 在牆線外 z 9.72～10.22，走不到、不加導航阻擋；冠木門那一段（x < −2.05）不種）
_hr = random.Random(9)
acc('hedge').rbox(FX0 - 0.05, FX1, YG, YG + 1.45, ZS + 0.12, ZS + 0.62, r=0.12, seg=2)
for i in range(int((FX1 - FX0) / 0.32)):
    x = FX0 + 0.1 + i * 0.32 + _hr.uniform(-0.06, 0.06)
    for (yy, zz, rx) in ((YG + 1.42, ZS + 0.37, -1.2), (YG + _hr.uniform(0.6, 1.3), ZS + 0.11, 0.0)):
        CL.card(acc('azalea'), x, yy, zz, _hr.uniform(0.3, 0.42), _hr.uniform(0.26, 0.36), ry=_hr.uniform(-0.4, 0.4), rx=rx + _hr.uniform(-0.3, 0.3), uv=CL.rand_uv(0.5))
# 東側：建仁寺垣（x 4.45、z 6.2～9.6、高 1.7）
EH = YG + 1.7
for i in range(int((ZS - ZE) / 0.055)):
    z = ZE + 0.03 + i * 0.055; acc('bamboo_dk' if i % 7 == 3 else 'bamboo').box(XE - 0.012, XE + 0.012, YG + 0.08, EH, z - 0.024, z + 0.024)
for y in (YG + 0.35, YG + 0.85, YG + 1.35):
    acc('bamboo_dk').cyl((XE - 0.03, y, ZE), (XE - 0.03, y, ZS), 0.02, seg=6); acc('bamboo_dk').cyl((XE + 0.03, y, ZE), (XE + 0.03, y, ZS), 0.02, seg=6)
acc('bamboo_dk').box(XE - 0.06, XE + 0.06, EH, EH + 0.05, ZE, ZS); acc('ridge').box(XE - 0.08, XE + 0.08, EH + 0.05, EH + 0.08, ZE, ZS)
for z in (ZE + 0.05, 7.9, ZS - 0.05): acc('wood').box(XE - 0.05, XE + 0.05, YG, EH + 0.04, z - 0.05, z + 0.05)

# ======================================================================
# 擺設：春日石燈籠 (−1.5, 8.9) 高 1.4、景石 (2.2, 7.6)、甕、竹掃把
def hexlathe(m, prof, x, y, z, seg=6, ry=0.0):
    bm = L.lathe(prof, seg=seg); m.add_bm(bm, Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(ry, 4, 'Z')); bm.free()
TX, TZ = -1.5, 8.9; st = acc('stone')
hexlathe(st, [(0.0, 0.0), (0.26, 0.0), (0.26, 0.1), (0.2, 0.16), (0.0, 0.16)], TX, YG, TZ)                  # 基礎
hexlathe(st, [(0.0, 0.0), (0.085, 0.0), (0.075, 0.5), (0.0, 0.5)], TX, YG + 0.16, TZ, seg=10)              # 竿
hexlathe(st, [(0.0, 0.0), (0.1, 0.0), (0.22, 0.08), (0.22, 0.13), (0.0, 0.13)], TX, YG + 0.66, TZ)          # 中台
fb = YG + 0.79
for a in range(6):                                                                                          # 火袋：六根柱，中間空的（晚上燈光從縫透出）
    ang = a * math.pi / 3; st.box(TX + math.cos(ang) * 0.15 - 0.035, TX + math.cos(ang) * 0.15 + 0.035, fb, fb + 0.26, TZ + math.sin(ang) * 0.15 - 0.035, TZ + math.sin(ang) * 0.15 + 0.035)
acc('paper').box(TX - 0.08, TX + 0.08, fb + 0.03, fb + 0.23, TZ - 0.08, TZ + 0.08)
CL.glow(root, 'toro', TX, fb + 0.13, TZ, color='rgba(255,200,120,1)', size=0.9, day=0.0, night=0.85)
hexlathe(st, [(0.0, 0.0), (0.18, 0.0), (0.36, 0.06), (0.34, 0.1), (0.12, 0.22), (0.07, 0.27), (0.0, 0.29)], TX, fb + 0.26, TZ)   # 笠
st.sphere((TX, fb + 0.6, TZ), 0.07, seg=8, rings=5); hexlathe(st, [(0.0, 0.0), (0.05, 0.0), (0.04, 0.03), (0.0, 0.03)], TX, fb + 0.53, TZ, seg=8)
acc('moss').ell((TX + 0.05, fb + 0.34, TZ + 0.06), 0.2, 0.03, 0.16, seg=8, rings=4)                          # 笠上的苔


def rock(m, cx, cz, rx, rz, h, seed, yaw=0.0):
    rr = random.Random(seed); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    bumps = [(Vector((rr.uniform(-1, 1), rr.uniform(-1, 1), rr.uniform(-0.2, 1))).normalized(), rr.uniform(-0.2, 0.15)) for _ in range(8)]
    for v in bm.verts:
        d = v.co.normalized(); s = 1.0 + sum(k * max(0.0, d.dot(b)) ** 3 for b, k in bumps); p = d * s
        v.co = Vector((p.x * rx, p.y * rz, max(p.z, -0.15) * h))
    bm.normal_update(); m.add_bm(bm, Matrix.Translation(g2b(cx, YG + 0.15 * h - 0.02, cz)) @ Matrix.Rotation(yaw, 4, 'Z')); bm.free()
rock(acc('rock'), 2.2, 7.6, 0.52, 0.36, 0.48, 7, 0.3)
rock(acc('rock'), 2.85, 7.95, 0.22, 0.18, 0.2, 8, 1.0)
rock(acc('rock'), -1.15, 8.7, 0.2, 0.16, 0.16, 9)
if CC0:   # Poly Haven 木水桶 wooden_bucket_01：石燈籠前面碎石的邊上（打水灑庭院用）。景石不換：Poly Haven 的石頭掃描都是褐色砂岩，和這個苔庭的灰花崗岩不合（11-13 試過 rock_moss_set_01，像一堆碎磚）
    K0.ph_put('wooden_bucket_01', -0.8, YG, 8.38, 0.5, 1.0, height=0.36, decimate=0.15)
acc('moss').ell((2.0, YG + 0.4, 7.55), 0.3, 0.06, 0.2, seg=10, rings=4)
# 甕（玄關西邊，參考圖門口的甕）
acc('urn').add_bm(L.lathe([(0.0, 0.0), (0.12, 0.0), (0.2, 0.12), (0.23, 0.3), (0.18, 0.46), (0.11, 0.52), (0.13, 0.56), (0.0, 0.56)], seg=14), Matrix.Translation(g2b(-3.95, -0.24, 5.35)))
# 竹掃把靠在東側竹垣
bx, bz = XE - 0.12, 8.3
acc('bamboo_dk').cyl((bx - 0.25, YG + 0.02, bz), (bx, YG + 1.55, bz + 0.05), 0.014, seg=5)
for j in range(14):
    a = j / 13 * math.pi - math.pi / 2; acc('bamboo_dk').cyl((bx - 0.2, YG + 0.35, bz), (bx - 0.3 + math.sin(a) * 0.16, YG + 0.01, bz + math.cos(a) * 0.08), 0.006, seg=3)

# 植物：老樟樹 (3.65, 9.0)、杜鵑圓球、蕨、門內左邊的灌木、西牆前的楓
random.seed(78); lf = acc('leaf'); az = acc('azalea'); fe = acc('fern'); hd = acc('hedge'); HDS = (hd, acc('hedge_y'), acc('hedge_d'))
def shrub(x, z, r, h=None):
    """修剪過的杜鵑（v3，LAWWW2-C 11-13；BB-C 第九批 P2「平滑低面數的綠色塊、同一個形狀重複」）：一叢是 6～9 團小葉團（雲剪的樣子），
    在半球上錯開堆、每團大小高低不同，外輪廓凹凸；每叢用自己的亂數。整叢大約還是 r 寬、h 高（不擋原本的路）"""
    rr = random.Random(int(x * 100) * 7 + int(z * 100)); h = h or r * 0.75; n = rr.randint(6, 9); lobes = []
    for j in range(n):
        if j == 0: lx, lz, ly, lr = x, z, h * 0.5, r * rr.uniform(0.5, 0.6)
        else:
            a = 2 * math.pi * j / (n - 1) + rr.uniform(-0.4, 0.4); d = r * rr.uniform(0.38, 0.62); el = rr.uniform(0.0, 0.7)
            lx, lz = x + math.cos(a) * d, z + math.sin(a) * d * 0.9; ly = h * (0.32 + 0.45 * el) ; lr = r * rr.uniform(0.32, 0.48)
        HDS[(j + rr.randint(0, 2)) % 3 if j else rr.randint(0, 2)].ell((lx, YG + ly, lz), lr, lr * rr.uniform(0.7, 0.95), lr * rr.uniform(0.8, 1.05), seg=9, rings=5); lobes.append((lx, lz, ly, lr))   # 每一團挑三種綠的一種（頂上那團、外圍各團錯開）
    for i in range(3 * n + 6):
        lx, lz, ly, lr = lobes[i % n]
        a = rr.uniform(0, 2 * math.pi); e = rr.uniform(-0.2, 1.2); px = lx + math.cos(a) * lr * 0.95 * math.cos(e); pz = lz + math.sin(a) * lr * 0.9 * math.cos(e)
        CL.card(az, px, YG + ly + math.sin(e) * lr * 0.8, pz, lr * 0.55, lr * 0.55, ry=rr.uniform(0, math.pi), rx=rr.uniform(-0.9, 0.9), uv=CL.rand_uv(0.5))
FB = fe.bm; FUV = FB.loops.layers.uv.verify()
def fern(x, z, r, h=0.45, seed=0):
    """蕨：七到九片往外拱的羽狀葉（黑森林同一個做法，bf_fern_frond.png）"""
    rnd = random.Random(seed); nf = rnd.randint(7, 9); ry = rnd.uniform(0, 6.28)
    for k in range(nf):
        a = ry + 2 * math.pi * k / nf + rnd.uniform(-0.2, 0.2); ca, sa = math.cos(a), math.sin(a); px, pz = -sa, ca
        Lf = r * rnd.uniform(1.0, 1.5); wf = Lf * 0.22; up = h * rnd.uniform(0.7, 1.0)
        row = []
        for (u, yy) in ((0.0, 0.03), (0.35, up * 0.8), (0.7, up), (1.0, up * 0.55)):
            cx, cz = x + ca * Lf * u, z + sa * Lf * u; ww = wf * (1.0 - 0.6 * u)
            row.append((FB.verts.new(g2b(cx - px * ww, YG + yy, cz - pz * ww)), FB.verts.new(g2b(cx + px * ww, YG + yy, cz + pz * ww)), u))
        for (a0, b0, u0), (a1, b1, u1) in zip(row, row[1:]):
            f = FB.faces.new([a0, b0, b1, a1])
            for lp, t in zip(f.loops, ((0.0, u0), (1.0, u0), (1.0, u1), (0.0, u1))): lp[FUV].uv = t
for (x, z, r) in ((0.0, 9.2, 0.4), (0.95, 9.22, 0.44), (1.9, 9.2, 0.38), (2.75, 9.24, 0.36), (-1.95, 9.25, 0.34), (-3.9, 9.05, 0.38), (-3.92, 8.62, 0.32), (-2.05, 7.2, 0.3), (3.95, 6.8, 0.38), (3.9, 7.6, 0.34)):
    shrub(x, z, r)
FERNS = ((-1.2, 9.1), (-1.85, 8.7), (3.15, 8.7), (2.7, 7.3), (-3.95, 7.6), (-3.9, 6.95), (1.65, 7.95), (-2.1, 8.25), (3.3, 9.3), (-0.6, 9.3),
         (-3.95, 8.25), (-3.6, 9.3), (-1.1, 8.55), (-1.85, 9.3), (4.0, 8.2), (3.95, 9.0), (2.95, 9.35), (0.45, 9.35), (1.4, 9.35), (2.2, 9.35), (-3.95, 6.55), (3.7, 7.15), (2.45, 8.05), (1.75, 7.35))
for i, (x, z) in enumerate(FERNS): fern(x, z, 0.3 + 0.08 * (i % 3), h=0.38 + 0.1 * (i % 2), seed=40 + i)
for (x, z, r) in ((-3.9, 7.25, 0.3), (3.3, 9.05, 0.5), (4.0, 8.55, 0.32), (-1.7, 9.2, 0.3), (2.6, 7.85, 0.26)):   # 低矮的大葉草（玉簪一類）
    bush(lf, x, YG + r * 0.35, z, r, n=9, span=0.4, flat_y=0.35)
for (x, z, rx, rz) in ((-1.5, 8.6, 0.6, 0.4), (3.4, 8.5, 0.7, 0.5), (-3.9, 7.9, 0.35, 0.9), (2.9, 7.6, 0.4, 0.3), (0.2, 9.0, 0.9, 0.3)):   # 苔
    acc('moss').ell((x, YG + 0.005, z), rx, 0.03, rz, seg=10, rings=3)
mp = acc('wood'); mp.cyl((-3.95, YG, 8.1), (-3.8, YG + 1.4, 8.05), 0.045, seg=6); mp.cyl((-3.85, YG + 1.0, 8.07), (-3.4, YG + 1.8, 7.9), 0.028, seg=5)
bush(lf, -3.6, YG + 1.9, 7.95, 0.6, n=16, span=0.4, flat_y=0.7)

# ======================================================================
# 玄關外：暖簾（門 x −3.5～−2.5，z 5.0 前面）、左邊的提燈「一盞」、右邊柱子上的木牌
uv_quad(P + 'noren', M['noren'], [(-3.52, 1.42, ZF + 0.08), (-2.48, 1.42, ZF + 0.08), (-2.48, 2.0, ZF + 0.08), (-3.52, 2.0, ZF + 0.08)])
acc('wood').cyl((-3.6, 2.03, ZF + 0.08), (-2.4, 2.03, ZF + 0.08), 0.014, seg=6)
for x in (-3.58, -2.42): acc('copper').box(x - 0.01, x + 0.01, 1.99, 2.07, ZF, ZF + 0.09)
# 提燈：x −3.86、底 1.42～頂 1.92，從牆上的鐵架吊下來；燈籠紙用切下來的圖（前後都是「一盞」）
CX, CZ, CB, CT, CR = -3.86, ZF + 0.24, 1.42, 1.9, 0.14
bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); seg = 16; prof = [(0.11, CB), (CR, CB + 0.08), (CR * 1.03, (CB + CT) / 2), (CR, CT - 0.08), (0.11, CT)]
rings = [[bm.verts.new(g2b(CX + r * math.cos(2 * math.pi * i / seg), h, CZ + r * math.sin(2 * math.pi * i / seg))) for i in range(seg + 1)] for r, h in prof]
for a_, (ra, rb) in enumerate(zip(rings, rings[1:])):
    for i in range(seg):
        f = bm.faces.new((ra[i], rb[i], rb[i + 1], ra[i + 1]))
        for lp, (ii, jj) in zip(f.loops, ((i, a_), (i, a_ + 1), (i + 1, a_ + 1), (i + 1, a_))):
            ang = 2 * math.pi * ii / seg; u = 0.5 - 0.5 * math.cos(ang)   # 前後兩面各一次字（u 從 0 到 1 再回 0）
            lp[uvl].uv = (u, jj / (len(prof) - 1))
bm.normal_update(); ob = B.mesh_obj(P + 'chochin', bm, M['chochin'], root)
for (y0, y1) in ((CB - 0.03, CB + 0.01), (CT - 0.01, CT + 0.03)): acc('copper').add_bm(L.lathe([(0.0, 0.0), (0.115, 0.0), (0.115, y1 - y0), (0.0, y1 - y0)], seg=12), Matrix.Translation(g2b(CX, y0, CZ)))
acc('copper').box(CX - 0.01, CX + 0.01, CT + 0.03, 2.12, CZ - 0.01, CZ + 0.01); acc('copper').box(CX - 0.01, CX + 0.01, 2.1, 2.14, ZF, CZ + 0.01)
CL.glow(root, 'chochin', CX, (CB + CT) / 2, CZ, color='rgba(255,205,140,1)', size=1.2, day=0.0, night=0.95)
pts = [(-2.2 - 0.065, 1.0, 6.185), (-2.2 + 0.065, 1.0, 6.185), (-2.2 + 0.065, 1.5, 6.185), (-2.2 - 0.065, 1.5, 6.185)]
uv_quad(P + 'post_plaque', M['plaque'], pts); acc('wood').box(-2.27, -2.13, 0.98, 1.52, 6.18, 6.183)

# ======================================================================
# 牆外的背景（走不到）：人行道（紅磚）、紅線的路緣、馬路、對面的公寓、兩側的鄰居
acc('pave').box(-16, 16, YG - 0.04, YG, ZS + 0.1, 11.5)
acc('curb').box(-16, 16, YG - 0.12, YG + 0.02, 11.5, 11.68); acc('curb_red').box(-16, 16, YG + 0.02, YG + 0.025, 11.5, 11.68)
acc('road').box(-16, 16, YG - 0.2, YG - 0.12, 11.68, 18.0)
acc('curb').box(-16, 16, YG - 0.12, YG + 0.02, 18.0, 18.2); acc('pave').box(-16, 16, YG - 0.04, YG, 18.2, 19.5)
for (x0, x1, h, key) in ((-16, -6.5, 10.0, 'apt'), (-6.5, 3.2, 13.0, 'apt2'), (3.2, 16, 9.0, 'apt')):
    acc(key).box(x0, x1, YG, YG + h, 19.5, 20.5)
    for fl in range(1, int(h / 3.0)):
        for i in range(int((x1 - x0) / 2.4)):
            x = x0 + 1.2 + i * 2.4; y = YG + fl * 3.0 + 0.8
            VC.crbox(x - 0.82, x + 0.82, y - 0.08, y + 1.48, 19.46, 19.5, '#d2cfc6', r=0.005); VC.crbox(x - 0.75, x + 0.75, y, y + 1.4, 19.44, 19.47, '#2f363a', r=0.005)
            if (i + fl) % 2 == 0:                                                                                     # 鐵窗（凸出 0.25）
                for k in range(7): VC.crbox(x - 0.78 + k * 0.26, x - 0.765 + k * 0.26, y - 0.05, y + 1.45, 19.22, 19.24, '#4f514e', r=0.002)
                VC.crbox(x - 0.8, x + 0.8, y + 1.43, y + 1.47, 19.2, 19.46, '#4f514e', r=0.003); VC.crbox(x - 0.8, x + 0.8, y - 0.07, y - 0.03, 19.2, 19.46, '#4f514e', r=0.003)
            elif (i + fl) % 3 == 0: VC.crbox(x + 0.2, x + 0.75, y - 0.5, y - 0.08, 19.2, 19.46, '#dcdbd5', r=0.02)   # 冷氣
    # 一樓：一間一間的店面（BB 11-04 07:55：原本整排一片灰的鐵捲門，從前院看像一大片白牆）。每間 3～4.2 m：拉下一半的鐵捲門、亮著的玻璃門面（裡面暗的層架＋燈管）、
    # 招牌（不同顏色）、柱子；顏色、寬度用固定亂數，每次匯出一樣
    rs = random.Random(int(x0 * 10) + 7); xx = x0 + 0.25
    while xx < x1 - 1.5:
        w = min(rs.choice((3.0, 3.4, 3.8, 4.2)), x1 - 0.25 - xx); kind = rs.choice(('lit', 'lit', 'half', 'shut'))
        VC.crbox(xx, xx + 0.28, YG, YG + 2.75, 19.4, 19.5, '#c9c4b8', r=0.01)                                     # 柱子
        a0, a1 = xx + 0.28, xx + w
        if kind == 'shut': VC.crbox(a0, a1, YG, YG + 2.55, 19.45, 19.5, rs.choice(('#8b8881', '#9a968e', '#7d7a73')), r=0.005)
        else:
            VC.crbox(a0, a1, YG, YG + 2.55, 19.47, 19.5, '#2c2a27', r=0.005)                                     # 店裡（暗）
            for k in range(3): VC.crbox(a0 + 0.2, a1 - 0.2, YG + 0.5 + k * 0.55, YG + 0.56 + k * 0.55, 19.4, 19.47, rs.choice(('#b9a27a', '#8fa3a8', '#c7b9a0')), r=0.004)   # 層架
            VC.crbox(a0 + 0.1, a1 - 0.1, YG + 2.38, YG + 2.44, 19.38, 19.46, '#f4f1e6', r=0.004)                 # 燈管
            VC.crbox(a0 + 0.05, a1 - 0.05, YG, YG + 0.06, 19.3, 19.47, '#6d6a64', r=0.004)                       # 門檻
            if kind == 'half': VC.crbox(a0, a1, YG + 1.55, YG + 2.55, 19.42, 19.46, '#8f8c85', r=0.005)          # 拉下一半的鐵捲門
            for k in range(1, int((a1 - a0) / 1.1) + 1): VC.crbox(a0 + k * (a1 - a0) / (int((a1 - a0) / 1.1) + 1) - 0.025, a0 + k * (a1 - a0) / (int((a1 - a0) / 1.1) + 1) + 0.025, YG, YG + 2.55, 19.36, 19.4, '#9aa0a2', r=0.003)   # 鋁框
        VC.crbox(a0 + 0.1, a1 - 0.1, YG + 2.98, YG + 3.6, 19.15, 19.3, rs.choice(('#b8352f', '#2f5d8c', '#e2b23a', '#3d7a4f', '#e8e4da', '#5a3c2e')), r=0.02)   # 招牌
        xx += w

    VC.crbox(x0, x1, YG + 2.75, YG + 2.95, 19.3, 19.5, '#9a958a', r=0.01)                                         # 一樓的雨遮
for sx in (-1, 1):                                                                                                  # 兩側鄰居（從前院看得到上半）：兩層樓高、有窗、冷氣、鐵窗
    xa, xb = sorted((sx * 5.4, sx * 7.4)); xf = sx * 5.4 - sx * 0.02
    if sx > 0: acc('apt').box(xa, xb, YG, YG + 6.2, -6.0, 7.0); acc('apt').box(xa, xb, YG, YG + 5.0, 7.0, ZS - 0.3); acc('curb').box(xa, xb, YG + 5.0, YG + 5.12, 7.0, ZS - 0.3)   # 東鄰臨街那一段是一層半的增建（老樟樹的枝從上面伸過去；原本 6.2 m 一整棟，樹枝穿進牆裡）
    else: acc('apt').box(xa, xb, YG, YG + 6.2, -6.0, ZS - 0.3)
    for i in range(4):
        zc = -4.5 + i * 3.6
        for y in (YG + 1.2, YG + 4.0):
            VC.crbox(xf - 0.02, xf + 0.02, y - 0.06, y + 1.36, zc - 0.76, zc + 0.76, '#cfccc4', r=0.005); VC.crbox(xf - 0.03, xf + 0.03, y, y + 1.3, zc - 0.7, zc + 0.7, '#323a3f', r=0.005)
            for k in range(6): VC.crbox(xf - sx * 0.12 - 0.008, xf - sx * 0.12 + 0.008, y, y + 1.3, zc - 0.7 + k * 0.28, zc - 0.68 + k * 0.28, '#5d5f5c', r=0.002)
            VC.crbox(min(xf, xf - sx * 0.14), max(xf, xf - sx * 0.14), y - 0.02, y + 0.0, zc - 0.72, zc + 0.72, '#5d5f5c', r=0.002)
        if i % 2 == 0: VC.crbox(min(xf, xf - sx * 0.3), max(xf, xf - sx * 0.3), YG + 3.2, YG + 3.65, zc + 0.9, zc + 1.6, '#dcdbd5', r=0.03)
acc('wood').cyl((5.2, YG, 11.2), (5.2, YG + 8.5, 11.2), 0.13, seg=8, r2=0.1)                                         # 電線桿
for y in (YG + 7.6, YG + 7.9): acc('wood').cyl((-16, y, 11.2), (16, y + 0.3, 11.2), 0.012, seg=4)

# ======================================================================
# 老樟樹（和街道同一個模型）
try:
    bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'street_trees.glb'))
    for part in ('bark', 'leaf'):
        o = bpy.data.objects['camphor_a_' + part]; o.parent = root; o.location = g2b(3.65, YG - 0.02, 9.0); o.rotation_euler = (0, 0, 1.49); o.scale = (1.05, 1.05, 1.0)   # BB 11-04 07:55「樹幹頂到緣側屋簷」：原本 2.3 rad、1.25 倍，一根橫枝伸到簷下（z 5.4）。轉 1.49 rad、1.05 倍：最大的枝朝街、兩側的枝沿著前院，離簷 ≥ 0.1 m（tree_fit 掃 16 個角度×5 種大小）; o.name = 'wzy_camphor_' + part
    for o in list(bpy.data.objects):
        if o.parent is None and o != root and o.name.startswith(('tree_', 'street_trees', 'camphor_b', 'banyan', 'palm')): bpy.data.objects.remove(o)
        elif o.name.startswith(('camphor_b_', 'banyan_', 'palm_')): bpy.data.objects.remove(o)
except Exception as e: print('樟樹載入失敗', e)
acc('moss').ell((3.65, YG + 0.02, 9.0), 0.75, 0.06, 0.55, seg=10, rings=4)

for (k, g), (m, grp) in _acc.items(): m.finish(grp, uv=(m.mat != M['fern']), smooth=False)
VC.finish(root, uv=False)
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
if CC0: K0.cleanup()
L.merge_by_material(root, keep=lambda ob: ob.name.startswith(('wzy_camphor', 'YARD_')) or (ob.parent is not None and ob.parent.name.startswith('YARD_')))
info = L.export(OUT, gpu_instances=True)
info.update({'yard': True, 'YG': YG})
L.write_json(OUT[:-4] + '.json', info)
print('OK', OUT, info.get('tris'))
