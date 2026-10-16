"""溫州街小公園（擴大版 v2，ART-WZ1；LAWWW2-B 2026-10-16）→ assets/models/env/second_ai/wz_park.glb（溫州街區域的世界座標）。
AA_164 第 5 節＋使用者 10-16「公園也要擴大」。配置讀 src/data/wz_park_layout.js（和 LAWWW-B 改導航用的是同一份；改配置只改那一份）。
（v1 是原本 11.6×10.4 的小公園：草地、步道、圓形廣場、樹圍座椅、單槓、名牌、後面的水泥牆，git 歷史裡有。）

內容：
  地面：草地（入口段＋主園區，扣掉 F1 的角）、步道（磚）、環狀步道、花崗石路緣、樹穴。
  老茄苳（street_trees.glb 的樟樹 B 換成偏暗古銅綠的葉子）＋樹圍圓形座椅（座面 0.45 m）。
  涼亭（四柱、四坡屋頂、灰黑瓦）＋圓形石桌（象棋盤）＋四張鼓形石凳。
  共融式小遊戲場：橡膠地墊（藍綠）、溜滑梯（平台＋階梯＋滑道）、搖搖馬 ×2、木框小沙坑。
  鞦韆 ×2（鋼架、鐵鍊、橡膠座）；健身器材 ×3（扭腰盤、肩關節輪、踏步機；台灣公園常見的黃藍綠）。
  土地公小廟（紅柱、燕尾脊的小屋頂、香爐、供桌、紅燈籠）；社區公布欄（玻璃櫃＋紙張，shop_notes 圖集）；直飲台；腳踏車架。
  楓香 ×2（SEASON_SWEETGUM_off＝綠、_on＝紅，遊戲依月份切換）；杜鵑花籬（SEASON_AZALEA_off＝只有葉、_on＝開花）。
  長椅 ×4、公園暖燈 ×2（GLOW 節點：遊戲加光暈）、北側與東側矮牆、入口的公園名牌（PLATE_FACE_parksign）。
用法：/opt/blenv/bin/python tools/blender/env_second/wz_park.py [-- --out assets/models/env/second_ai/wz_park.glb]
"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01, bush, card, rand_uv   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/wz_park.glb'))
GEN = os.path.join(HERE, 'textures', 'gen')
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/wz_park_layout.js')))"], cwd=L.ROOT))

random.seed(2026)
B.reset(texres=512)
root = B.group('wz_park', props={'kind': 'wz_park', 'layout': LAY['version']})
base = CL.materials()
M = {
    'grass': L.pbr('park_grass', 'leafy_grass', tile=2.4, target='#71804a', normal=0.6, maps=('diff', 'nor'), rough_value=0.95),
    'paver': L.pbr('park_paver', 'square_brick_paving', tile=1.4, target='#ada290', maps=('diff', 'nor'), rough_value=0.85),
    'granite': L.pbr('park_granite', 'concrete_wall_006', tile=1.0, target='#c3bdb2', maps=('diff',), res=256, rough_value=0.7),
    'soil': L.flat('park_soil', '#4a3b2e', rough=0.95),
    'wood': L.pbr('park_bench_wood', 'dark_wood', tile=0.8, target='#8c6a48', maps=('diff',), res=256, rough_value=0.7),
    'steel': L.flat('park_steel', '#3e4246', rough=0.45, metal=0.45),
    'stain': L.flat('park_stainless', '#c4c7ca', rough=0.3, metal=0.45),
    'wall': L.pbr('park_wall', 'concrete_wall_006', tile=2.0, target='#b5afa4', normal=0.8, maps=('diff', 'nor'), rough_value=0.9),
    'stone': L.pbr('park_stone', 'granite_tile', tile=0.8, target='#9a968e', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.6),
    'roof': L.pbr('park_roof_tile', 'grey_roof_tiles', tile=1.0, target='#4f5552', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'red': L.flat('park_red', '#a8322a', rough=0.55), 'gold': L.flat('park_gold', '#c9a03a', rough=0.35, metal=0.4),
    'pillar': L.flat('park_pillar', '#8a3a2c', rough=0.6),
    'rubber_b': L.flat('park_rubber_blue', '#3f7fa8', rough=0.95), 'rubber_g': L.flat('park_rubber_green', '#5f9a54', rough=0.95),
    'sand': L.pbr('park_sand', 'granular_concrete', tile=0.6, target='#d8c49a', maps=('diff',), res=256, rough_value=0.98),
    'yellow': L.flat('park_yellow', '#e2b934', rough=0.45, metal=0.1), 'blue': L.flat('park_blue', '#2f6fb0', rough=0.45, metal=0.1),
    'green': L.flat('park_green', '#3f8a5a', rough=0.45, metal=0.1), 'orange': L.flat('park_orange', '#e07a2a', rough=0.5),
    'chain': L.flat('park_chain', '#8a8c8e', rough=0.4, metal=0.45), 'rubber_k': L.flat('park_rubber_black', '#2a2a2c', rough=0.8),
    'board': base['board'], 'glass': base['glass'], 'cork': L.flat('park_cork', '#b8946a', rough=0.95),
    'lamp': L.flat('park_lamp_glass', '#fff1d6', rough=0.3, emit=B.srgb('#ffd9a0')), 'lamppost': L.flat('park_lamppost', '#2f4a3a', rough=0.5, metal=0.35),
    'incense': L.flat('park_incense', '#5a4a3a', rough=0.8),
}


def img_mat(name, fn, clip=False, rough=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); Lk.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if clip:
        r = N.new('ShaderNodeMath'); r.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], r.inputs[0]); Lk.new(r.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
        m.use_backface_culling = False
    m['tile'] = 1.0; return m


M['notes'] = img_mat('park_notes', 'shop_notes.png', clip=True)
M['azalea'] = img_mat('park_azalea_leaf', 'azalea_leaves.png', clip=True, rough=0.7)
M['azalea_fl'] = img_mat('park_azalea_flower', 'azalea_flower.png', clip=True, rough=0.7)
_acc = {}
def acc(key, prefix='park_'):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh(prefix + key, mat)
    return _acc[mat.name]


def disc(m, cx, cz, r, y, n=32, r0=0.0):
    bm = m.bm
    if r0 <= 0:
        c = bm.verts.new(g2b(cx, y, cz)); ring = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n): bm.faces.new((c, ring[i], ring[(i + 1) % n]))
    else:
        a = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r0, y, cz - math.sin(2 * math.pi * i / n) * r0)) for i in range(n)]
        b = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n): j = (i + 1) % n; bm.faces.new((a[i], b[i], b[j], a[j]))


def ring_wall(m, cx, cz, r0, r1, y0, y1, n=32):
    disc(m, cx, cz, r1, y1, n, r0); bm = m.bm
    for r, out in ((r1, True), (r0, False)):
        lo = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y0, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        hi = [bm.verts.new(g2b(cx + math.cos(2 * math.pi * i / n) * r, y1, cz - math.sin(2 * math.pi * i / n) * r)) for i in range(n)]
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((lo[i], lo[j], hi[j], hi[i]) if out else (lo[j], lo[i], hi[i], hi[j]))


def strip(m, a, b, w, y, ext=0.0):
    """水平的帶狀（步道）：a→b，寬 w，高 y"""
    ax, az = a; bx, bz = b; dx, dz = bx - ax, bz - az; Ln = math.hypot(dx, dz); ux, uz = dx / Ln, dz / Ln; nx, nz = -uz, ux
    ax -= ux * ext; az -= uz * ext; bx += ux * ext; bz += uz * ext
    pts = [(ax + nx * w / 2, y, az + nz * w / 2), (bx + nx * w / 2, y, bz + nz * w / 2), (bx - nx * w / 2, y, bz - nz * w / 2), (ax - nx * w / 2, y, az - nz * w / 2)]
    vs = [m.bm.verts.new(g2b(*p)) for p in pts]; f = m.bm.faces.new(vs); f.normal_update()
    if f.normal.z < 0: f.normal_flip()


class Xf:
    """物件自己的座標（x 右、z 前、y 上）→ 世界：中心 (px,pz)、轉 ry（yaw：正面朝 (sin ry, cos ry)）"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s = px, pz, math.cos(ry), math.sin(ry)
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def box(self, m, x0, x1, y0, y1, z0, z1):
        cs = [self.p(x, 0, z) for x in (x0, x1) for z in (z0, z1)]
        bm = m.bm; vs = []
        for y in (y0, y1):
            for (x, z) in ((x0, z0), (x1, z0), (x1, z1), (x0, z1)): q = self.p(x, y, z); vs.append(bm.verts.new(g2b(*q)))
        for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)): bm.faces.new([vs[i] for i in f])
        return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m


# ======================== 地面 ========================
A = LAY['area']; fr = A['front']; bk = A['back']; cut = bk['cut']
g = acc('grass')
g.box(fr['x0'], fr['x1'], 0.0, 0.01, fr['z0'], fr['z1'])
g.box(bk['x0'], bk['x1'], 0.0, 0.01, bk['z0'], cut['z0'])
g.box(cut['x1'], bk['x1'], 0.0, 0.01, cut['z0'], bk['z1'])
pv = acc('paver'); gr = acc('granite')
for p in LAY['paths']:
    if 'ring' in p:
        cx, cz = p['ring']; disc(pv, cx, cz, p['r'] + p['w'] / 2, 0.022, n=48, r0=p['r'] - p['w'] / 2)
        ring_wall(gr, cx, cz, p['r'] + p['w'] / 2, p['r'] + p['w'] / 2 + 0.1, 0.0, 0.05, n=48)
        ring_wall(gr, cx, cz, p['r'] - p['w'] / 2 - 0.1, p['r'] - p['w'] / 2, 0.0, 0.05, n=48)
    else:
        strip(pv, p['from'], p['to'], p['w'], 0.021)
ot = next(i for i in LAY['items'] if i['id'] == 'oldtree'); TX, TZ = ot['x'], ot['z']
ring_wall(gr, TX, TZ, 0.86, 1.0, 0.0, 0.16, n=28); disc(acc('soil'), TX, TZ, 0.86, 0.06, n=28)

# ======================== 樹 ========================
bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'street_trees.glb'))
SRC = {n: bpy.data.objects[n] for n in ('camphor_a_bark', 'camphor_a_leaf', 'camphor_b_bark', 'camphor_b_leaf')}
LEAF0 = SRC['camphor_a_leaf'].data.materials[0]
def leaf_variant(name, png):
    m = LEAF0.copy(); m.name = name
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and 'leaves' in n.image.name: n.image = bpy.data.images.load(os.path.join(GEN, png))
    return m
LEAFV = {'bischofia': leaf_variant('park_leaf_bischofia', 'tree_leaves_bischofia.png'), 'sg_g': leaf_variant('park_leaf_sweetgum_g', 'tree_leaves_sweetgum_g.png'),
         'sg_r': leaf_variant('park_leaf_sweetgum_r', 'tree_leaves_sweetgum_r.png')}
def tree(name, src, x, z, sx=1.0, sy=1.0, ry=0.0, leaf=None, parent=None):
    out = []
    for part in ('bark', 'leaf'):
        o = SRC[f'{src}_{part}'].copy(); o.data = SRC[f'{src}_{part}'].data.copy(); B.scene().collection.objects.link(o)
        o.parent = parent or root; o.name = f'{name}_{part}'; o.location = g2b(x, 0, z); o.rotation_euler = (0, 0, ry); o.scale = (sx, sx, sy)
        if part == 'leaf' and leaf is not None: o.data.materials[0] = leaf
        out.append(o)
    return out
for it in LAY['items']:
    k = it['kind']
    if k == 'tree_bischofia': tree('park_oldtree', 'camphor_b', it['x'], it['z'], 1.12, 1.05, 0.7, LEAFV['bischofia'])
    elif k == 'tree_camphor': tree(f'park_{it["id"]}', 'camphor_a', it['x'], it['z'], 0.72, 0.74, it['x'])
    elif k == 'tree_sweetgum':   # 楓香：細高（樹冠窄）；綠、紅兩份，遊戲依月份切換
        for tag, lv in (('off', LEAFV['sg_g']), ('on', LEAFV['sg_r'])):
            grp = B.group(f'SEASON_SWEETGUM_{tag}_{it["id"]}', root, {'season': 'sweetgum', 'state': tag})
            objs = tree(f'park_{it["id"]}_{tag}', 'camphor_a', it['x'], it['z'], 0.56, 0.86, it['z'], lv, grp)
            if tag == 'on': objs[0].name += '_dup'   # 樹幹也跟著組（切換時一起藏）
for o in SRC.values(): bpy.data.objects.remove(o)
for n in ('tree_banyan_a', 'tree_camphor_a', 'tree_camphor_b', 'tree_palm_a', 'street_trees', 'banyan_a_bark', 'banyan_a_leaf', 'palm_a_bark', 'palm_a_leaf', 'tree_card'):
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n])

# ======================== 樹圍圓形座椅（老茄苳） ========================
rb = next(i for i in LAY['items'] if i['kind'] == 'ring_bench'); wd, st = acc('wood'), acc('steel'); R1 = rb['r']; R0 = R1 - 0.38; H = 0.39
for k in range(10):
    a0, a1 = k / 10 * 2 * math.pi + math.pi / 10, (k + 1) / 10 * 2 * math.pi + math.pi / 10
    for j in range(5):
        ra, rb_ = R0 + (R1 - R0) * j / 5 + 0.012, R0 + (R1 - R0) * (j + 1) / 5 - 0.012
        p = lambda a, r, y: (TX + math.sin(a) * r, y, TZ + math.cos(a) * r)
        top = [p(a0, ra, H + 0.06), p(a1, ra, H + 0.06), p(a1, rb_, H + 0.06), p(a0, rb_, H + 0.06)]; bot = [(q[0], H, q[2]) for q in top]
        bm = wd.bm; vt = [bm.verts.new(g2b(*q)) for q in top]; vb = [bm.verts.new(g2b(*q)) for q in bot]
        bm.faces.new(vt[::-1]); bm.faces.new(vb)
        for i in range(4): bm.faces.new((vb[i], vb[(i + 1) % 4], vt[(i + 1) % 4], vt[i])[::-1])
    am = (a0 + a1) / 2
    for r in (R0 + 0.06, R1 - 0.06):
        x, z = TX + math.sin(am) * r, TZ + math.cos(am) * r; st.box(x - 0.025, x + 0.025, 0.0, H, z - 0.025, z + 0.025)

# ======================== 涼亭＋石桌石凳 ========================
pa = next(i for i in LAY['items'] if i['kind'] == 'pavilion'); px, pz, pw = pa['x'], pa['z'], pa['w']; xf = Xf(px, pz)
xf.box(acc('stone'), -pw / 2, pw / 2, 0.0, 0.12, -pw / 2, pw / 2)                                     # 石基座
for sx in (-1, 1):
    for sz in (-1, 1): xf.box(acc('pillar'), sx * (pw / 2 - 0.2) - 0.11, sx * (pw / 2 - 0.2) + 0.11, 0.12, 2.75, sz * (pw / 2 - 0.2) - 0.11, sz * (pw / 2 - 0.2) + 0.11)
xf.box(acc('pillar'), -pw / 2 + 0.05, pw / 2 - 0.05, 2.62, 2.82, -pw / 2 + 0.05, pw / 2 - 0.05)   # 樑（實心，從下面看是天花板）
eh, rh, ov = 2.82, 3.9, 0.45                                                                         # 四坡屋頂：簷 2.82、頂 3.9、出挑 0.45
bm = acc('roof').bm; c0 = [xf.p(-pw / 2 - ov, eh, -pw / 2 - ov), xf.p(pw / 2 + ov, eh, -pw / 2 - ov), xf.p(pw / 2 + ov, eh, pw / 2 + ov), xf.p(-pw / 2 - ov, eh, pw / 2 + ov)]
tp = bm.verts.new(g2b(*xf.p(0, rh, 0))); cv = [bm.verts.new(g2b(*q)) for q in c0]
for i in range(4): bm.faces.new((cv[i], cv[(i + 1) % 4], tp))
bm.faces.new(cv[::-1])
acc('gold').sphere(xf.p(0, rh + 0.08, 0), 0.1, seg=8, rings=4)
tb = acc('stone'); tb.cyl(xf.p(0, 0.12, 0), xf.p(0, 0.72, 0), 0.18, seg=12); tb.cyl(xf.p(0, 0.72, 0), xf.p(0, 0.8, 0), 0.5, seg=24)   # 圓石桌
for (sx, sz) in ((0, -0.95), (0, 0.95), (-0.95, 0), (0.95, 0)): tb.cyl(xf.p(sx, 0.12, sz), xf.p(sx, 0.55, sz), 0.2, seg=14)     # 鼓形石凳
NOTE_Q = []
def note(pts, cell): NOTE_Q.append((pts, cell))
cb = xf.p(0, 0.805, 0)   # 桌面上的象棋盤（notes 圖集沒有棋盤：用深淺兩色的小方塊）
for i in range(9):
    for j in range(10):
        if (i + j) % 2 == 0: continue
for i in range(-4, 5): acc('incense').box(cb[0] + i * 0.04 - 0.002, cb[0] + i * 0.04 + 0.002, 0.8, 0.806, cb[2] - 0.18, cb[2] + 0.18)
for j in range(-4, 5): acc('incense').box(cb[0] - 0.16, cb[0] + 0.16, 0.8, 0.806, cb[2] + j * 0.04 - 0.002, cb[2] + j * 0.04 + 0.002)

# ======================== 小遊戲場 ========================
pg = next(i for i in LAY['items'] if i['kind'] == 'playground'); gx, gz, gw, gd = pg['x'], pg['z'], pg['w'], pg['d']; xf = Xf(gx, gz)
xf.box(acc('rubber_b'), -gw / 2, gw / 2, 0.0, 0.035, -gd / 2, gd / 2)
xf.box(acc('rubber_g'), -gw / 2 + 0.3, -gw / 2 + 2.2, 0.035, 0.04, -gd / 2 + 0.3, gd / 2 - 0.3)
# 溜滑梯：平台 1.1 m（四柱＋護欄）、後面階梯、前面滑道（往 +x）
sx0 = -gw / 2 + 0.6
for ax in (sx0, sx0 + 0.9):
    for az in (-0.45, 0.45): xf.cyl(acc('yellow'), (ax, 0.0, az), (ax, 1.9, az), 0.045, seg=8)
xf.box(acc('blue'), sx0 - 0.05, sx0 + 0.95, 1.05, 1.12, -0.5, 0.5)
for az in (-0.45, 0.45): xf.box(acc('yellow'), sx0, sx0 + 0.9, 1.6, 1.65, az - 0.03, az + 0.03)
xf.box(acc('orange'), sx0 - 0.08, sx0 + 0.98, 1.9, 1.98, -0.55, 0.55)                                # 小屋頂
for k in range(5): y = 0.2 * (k + 1); xf.box(acc('blue'), sx0 - 0.55 + k * 0.1, sx0 - 0.25 + k * 0.1, y - 0.03, y, -0.3, 0.3)  # 階梯
bm = acc('green').bm; pts = []
for k in range(9):
    t = k / 8; x = sx0 + 0.95 + t * 1.9; y = 1.08 - 1.0 * (t * t * (3 - 2 * t)) * 1.0 + 0.04
    pts.append((x, y))
prev = None
for (x, y) in pts:
    a = bm.verts.new(g2b(*xf.p(x, y, -0.3))); b = bm.verts.new(g2b(*xf.p(x, y, 0.3)))
    if prev: bm.faces.new((prev[0], a, b, prev[1]))
    prev = (a, b)
for side in (-0.32, 0.32):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]): xf.box(acc('green'), x0, x1, min(y0, y1), max(y0, y1) + 0.15, side - 0.02, side + 0.02)
# 搖搖馬 ×2（彈簧＋身體）
for k, (hx, col) in enumerate(((0.9, 'orange'), (1.8, 'yellow'))):
    xf.cyl(acc('chain'), (hx, 0.04, 0.6), (hx, 0.45, 0.6), 0.09, seg=10)
    xf.box(acc(col), hx - 0.35, hx + 0.35, 0.45, 0.7, 0.45, 0.75); xf.box(acc(col), hx + 0.22, hx + 0.42, 0.7, 1.0, 0.5, 0.7)
    xf.cyl(acc('steel'), (hx + 0.2, 0.92, 0.42), (hx + 0.2, 0.92, 0.78), 0.02, seg=6)
# 小沙坑（木框）
xf.box(acc('wood'), 0.5, 2.3, 0.0, 0.25, -1.55, -1.45); xf.box(acc('wood'), 0.5, 2.3, 0.0, 0.25, -0.35, -0.25)
xf.box(acc('wood'), 0.5, 0.6, 0.0, 0.25, -1.55, -0.25); xf.box(acc('wood'), 2.2, 2.3, 0.0, 0.25, -1.55, -0.25)
xf.box(acc('sand'), 0.6, 2.2, 0.0, 0.16, -1.45, -0.35)

# ======================== 鞦韆 ×2 ========================
sw = next(i for i in LAY['items'] if i['kind'] == 'swings'); xf = Xf(sw['x'], sw['z'], sw.get('yaw', 0)); W2 = sw['w'] / 2
for sx in (-W2, W2):
    for sz in (-0.7, 0.7): xf.cyl(acc('steel'), (sx, 0.0, sz), (sx, 2.35, 0.0), 0.045, seg=8)
xf.cyl(acc('steel'), (-W2, 2.35, 0.0), (W2, 2.35, 0.0), 0.05, seg=10)
for cx in (-0.9, 0.9):
    for dx in (-0.22, 0.22): xf.cyl(acc('chain'), (cx + dx, 2.33, 0.0), (cx + dx, 0.5, 0.0), 0.008, seg=4)
    xf.box(acc('rubber_k'), cx - 0.25, cx + 0.25, 0.45, 0.5, -0.11, 0.11)

# ======================== 健身器材 ×3 ========================
for it in LAY['items']:
    if not it['kind'].startswith('fitness'): continue
    xf = Xf(it['x'], it['z'], it.get('yaw', 0)); k = it['kind']
    xf.box(acc('stone'), -0.45, 0.45, 0.0, 0.06, -0.45, 0.45)
    if k == 'fitness_waist':     # 扭腰盤：中柱＋握把＋地上的轉盤
        xf.cyl(acc('blue'), (0, 0.06, -0.25), (0, 1.25, -0.25), 0.05, seg=10); xf.cyl(acc('yellow'), (-0.3, 1.2, -0.25), (0.3, 1.2, -0.25), 0.025, seg=8)
        xf.cyl(acc('yellow'), (0, 0.06, 0.15), (0, 0.12, 0.15), 0.25, seg=16)
    elif k == 'fitness_shoulder':  # 肩關節輪：柱子＋直立的輪子
        xf.cyl(acc('green'), (0, 0.06, 0), (0, 1.75, 0), 0.06, seg=10)
        bm = acc('yellow').bm; ring = []
        for i in range(16):
            a = i / 16 * 2 * math.pi; ring.append((math.cos(a) * 0.45, 1.35 + math.sin(a) * 0.45))
        for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]): xf.cyl(acc('yellow'), (x0, y0, 0.12), (x1, y1, 0.12), 0.022, seg=5)
        xf.cyl(acc('yellow'), (0, 1.35, 0.06), (0, 1.35, 0.14), 0.05, seg=8)
    else:                          # 踏步機：兩支柱、扶手、兩個踏板
        for sx in (-0.3, 0.3): xf.cyl(acc('orange'), (sx, 0.06, -0.2), (sx, 1.2, -0.2), 0.045, seg=8)
        xf.cyl(acc('orange'), (-0.3, 1.2, -0.2), (0.3, 1.2, -0.2), 0.03, seg=8)
        for sx in (-0.15, 0.15): xf.box(acc('blue'), sx - 0.1, sx + 0.1, 0.25, 0.3, -0.05, 0.3)

# ======================== 土地公小廟 ========================
sh = next(i for i in LAY['items'] if i['kind'] == 'tudigong_shrine'); xf = Xf(sh['x'], sh['z'], sh.get('yaw', 0))
xf.box(acc('stone'), -0.6, 0.6, 0.0, 0.35, -0.45, 0.45)                                               # 台座
xf.box(acc('red'), -0.48, 0.48, 0.35, 1.25, -0.4, 0.2); xf.box(acc('soil'), -0.3, 0.3, 0.45, 1.05, 0.2, 0.22)   # 廟身＋神龕（暗）
for sx in (-0.42, 0.42): xf.box(acc('pillar'), sx - 0.05, sx + 0.05, 0.35, 1.25, 0.22, 0.32)
bm = acc('roof').bm; ry_, eh_ = 1.62, 1.28
pts = [xf.p(-0.7, eh_, -0.55), xf.p(0.7, eh_, -0.55), xf.p(0.85, ry_ + 0.08, 0.0), xf.p(0.7, eh_, 0.5), xf.p(-0.7, eh_, 0.5), xf.p(-0.85, ry_ + 0.08, 0.0)]   # 兩坡＋翹起的燕尾
vs = [bm.verts.new(g2b(*q)) for q in pts]; bm.faces.new((vs[0], vs[1], vs[2], vs[5])); bm.faces.new((vs[5], vs[2], vs[3], vs[4]))
acc('gold').cyl(xf.p(-0.85, ry_ + 0.08, 0.0), xf.p(0.85, ry_ + 0.08, 0.0), 0.03, seg=6)
xf.box(acc('red'), -0.35, 0.35, 0.35, 0.75, 0.55, 0.85)                                              # 供桌
acc('gold').cyl(xf.p(0, 0.75, 0.7), xf.p(0, 0.88, 0.7), 0.1, seg=12)                                 # 香爐
for dx in (-0.03, 0.0, 0.03): acc('incense').cyl(xf.p(dx, 0.88, 0.7), xf.p(dx, 1.08, 0.7), 0.004, seg=3)
for sx in (-0.55, 0.55): acc('red').sphere(xf.p(sx, 1.0, 0.35), 0.11, seg=10, rings=6, sy=1.3)       # 紅燈籠
for sx in (-0.55, 0.55): CL.glow(root, 'shrine', *xf.p(sx, 1.0, 0.4), color='rgba(255,90,60,1)', size=0.6, day=0.0, night=0.9)

# ======================== 公布欄、直飲台、腳踏車架、長椅、路燈 ========================
def notice_board(it):
    xf = Xf(it['x'], it['z'], it.get('yaw', 0))
    for sx in (-0.75, 0.75): xf.box(acc('lamppost'), sx - 0.04, sx + 0.04, 0.0, 2.0, -0.04, 0.04)
    xf.box(acc('lamppost'), -0.82, 0.82, 0.85, 1.95, -0.08, -0.02); xf.box(acc('cork'), -0.74, 0.74, 0.92, 1.88, -0.021, -0.015)
    xf.box(acc('lamppost'), -0.9, 0.9, 1.95, 2.02, -0.2, 0.06)                                          # 小屋簷
    xf.box(acc('glass'), -0.76, 0.76, 0.9, 1.9, 0.0, 0.01)
    for (cell, x, y, w, h) in (('poster', -0.42, 1.1, 0.5, 0.62), ('lostcat', 0.15, 1.2, 0.42, 0.46), ('tutor', 0.55, 0.98, 0.32, 0.36), ('hiring', 0.52, 1.42, 0.3, 0.32)):
        note([xf.p(x - w / 2, y, -0.01), xf.p(x + w / 2, y, -0.01), xf.p(x + w / 2, y + h, -0.01), xf.p(x - w / 2, y + h, -0.01)], cell)
def fountain(it):
    xf = Xf(it['x'], it['z'], it.get('yaw', 0)); xf.box(acc('stone'), -0.3, 0.3, 0.0, 0.05, -0.3, 0.3)
    xf.cyl(acc('stain'), (0, 0.05, 0), (0, 0.85, 0), 0.12, seg=14); xf.cyl(acc('stain'), (0, 0.85, 0), (0, 0.92, 0), 0.22, seg=18)
    xf.cyl(acc('stain'), (0.08, 0.92, 0), (0.08, 1.0, 0), 0.015, seg=6)
def bike_rack(it):
    xf = Xf(it['x'], it['z'], it.get('yaw', 0))
    for k in range(4):
        z = -1.05 + k * 0.7; xf.cyl(acc('stain'), (-0.25, 0, z), (-0.25, 0.7, z), 0.025, seg=6); xf.cyl(acc('stain'), (0.25, 0, z), (0.25, 0.7, z), 0.025, seg=6)
        xf.cyl(acc('stain'), (-0.25, 0.7, z), (0.25, 0.7, z), 0.025, seg=6)
def bench(it):
    xf = Xf(it['x'], it['z'], it.get('yaw', 0))
    for k in range(4): z = -0.22 + k * 0.1; xf.box(acc('wood'), -0.75, 0.75, 0.42, 0.46, z, z + 0.08)
    for k in range(3): y = 0.55 + k * 0.12; xf.box(acc('wood'), -0.75, 0.75, y, y + 0.08, -0.29, -0.25)
    for sx in (-0.65, 0.65): xf.box(acc('steel'), sx - 0.03, sx + 0.03, 0.0, 0.42, -0.25, 0.22); xf.box(acc('steel'), sx - 0.03, sx + 0.03, 0.42, 0.9, -0.3, -0.24)
def park_lamp(it):
    xf = Xf(it['x'], it['z']); xf.box(acc('stone'), -0.15, 0.15, 0.0, 0.08, -0.15, 0.15)
    xf.cyl(acc('lamppost'), (0, 0.08, 0), (0, 3.3, 0), 0.06, seg=10); xf.cyl(acc('lamppost'), (0, 3.3, 0), (0, 3.4, 0), 0.2, seg=12)
    xf.cyl(acc('lamp'), (0, 3.4, 0), (0, 3.85, 0), 0.17, seg=12); xf.cyl(acc('lamppost'), (0, 3.85, 0), (0, 3.95, 0), 0.24, seg=12)
    CL.glow(root, 'parklamp', *xf.p(0, 3.62, 0), color='rgba(255,214,150,1)', size=2.0, day=0.0, night=1.0)
for it in LAY['items']:
    k = it['kind']
    if k == 'notice_board': notice_board(it)
    elif k == 'drinking_fountain': fountain(it)
    elif k == 'bike_rack': bike_rack(it)
    elif k == 'bench': bench(it)
    elif k == 'park_lamp': park_lamp(it)

# ======================== 杜鵑花籬（季節：只有葉／開花） ========================
hz = next(i for i in LAY['items'] if i['kind'] == 'azalea_hedge')
random.seed(311)
hedge = {'off': Mesh('SEASON_AZALEA_off_hedge', M['azalea']), 'on': Mesh('SEASON_AZALEA_on_hedge', M['azalea_fl'])}
for (x0, z0, x1, z1) in hz['segments']:
    Ln = math.hypot(x1 - x0, z1 - z0); n = max(2, int(Ln / 0.55))
    for i in range(n + 1):
        t = i / n; x, z = x0 + (x1 - x0) * t, z0 + (z1 - z0) * t
        st_ = random.getstate()
        for tag, m in hedge.items(): random.setstate(st_); bush(m, x, 0.42, z, 0.48, n=5, span=0.5, flat_y=0.7)
for tag, m in hedge.items():
    o = m.finish(None, uv=False); grp = B.group(f'SEASON_AZALEA_{tag}', root, {'season': 'azalea', 'state': tag}); o.parent = grp

# ======================== 矮牆、名牌 ========================
for w in LAY['walls']:
    if 'x0' in w: acc('wall').box(w['x0'], w['x1'], 0.0, w['h'], w['z'] - 0.1, w['z'] + 0.1); gr.box(w['x0'] - 0.03, w['x1'] + 0.03, w['h'], w['h'] + 0.06, w['z'] - 0.13, w['z'] + 0.13)
    else: acc('wall').box(w['x'] - 0.1, w['x'] + 0.1, 0.0, w['h'], w['z0'], w['z1']); gr.box(w['x'] - 0.13, w['x'] + 0.13, w['h'], w['h'] + 0.06, w['z0'] - 0.03, w['z1'] + 0.03)
for px in (19.5, 20.9): acc('wood').box(px - 0.05, px + 0.05, 0.0, 1.66, 5.9, 6.0)
acc('wood').box(19.36, 21.04, 1.16, 1.64, 5.94, 6.0)
fm = Mesh('PLATE_FACE_parksign', M['board']); fm.quad([(21.0, 1.2, 5.935), (19.4, 1.2, 5.935), (19.4, 1.6, 5.935), (21.0, 1.6, 5.935)])

# ======================== 收尾 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
uv01(fm.finish(root, uv=True, props={'plate': 'park', 'text': '溫州公園', 'bg': '#2f4a3a', 'color': '#f4ead8'}))
if NOTE_Q:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']
    for pts, cn in NOTE_Q:
        i = NOTES.index(cn); col, row = i % 4, i // 4; u0, u1 = col / 4, (col + 1) / 4; v1 = 1 - row / 4; v0 = v1 - 0.25
        vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('park_notes'); bm.to_mesh(me); bm.free(); me.materials.append(M['notes'])
    ob = bpy.data.objects.new('park_notes', me); B.scene().collection.objects.link(ob); ob.parent = root
L.vc_consolidate(root, dict.fromkeys(('park_steel', 'park_lamppost', 'park_stainless', 'park_chain'), L.vc_metal('wz_vc_metal', rough=0.45, metal=0.35)))
L.vc_consolidate(root, dict.fromkeys(('park_red', 'park_pillar', 'park_rubber_blue', 'park_rubber_green', 'park_blue', 'park_green', 'park_orange', 'park_rubber_black', 'park_cork', 'park_incense', 'park_soil'), L.vc_material('wz_vc_matte', rough=0.85)))
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or 'SEASON' in ob.name or (ob.parent is not None and 'SEASON' in ob.parent.name) or ob.name.startswith('park_oldtree') or ob.name.startswith('park_tree'))
info = L.export(OUT, gpu_instances=True)
info['layout'] = LAY['version']
L.write_json(OUT[:-4] + '.json', info)
