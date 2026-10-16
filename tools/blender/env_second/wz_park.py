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
PARK3 = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/park3_props.glb'); HAS3 = os.path.exists(PARK3)   # BB-B 的 ART-PARK3（象棋桌凳、直飲台、腳踏車架）：有檔就不建程序化的那幾件

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
    # 遊戲場的橡膠地墊：granular_concrete 的顆粒當 EPDM 橡膠粒（原本整片純色，近看像塑膠板）。rubber_g＝溜滑梯下那一塊，改成磚紅（原本綠，和 ART-PARK1 滑道的綠太接近）
    'rubber_b': L.pbr('park_rubber_blue', 'granular_concrete', tile=1.4, target='#47789a', maps=('diff',), res=256, rough_value=0.95),
    'rubber_g': L.pbr('park_rubber_red', 'granular_concrete', tile=1.4, target='#a3523f', maps=('diff',), res=256, rough_value=0.95),
    'sand': L.pbr('park_sand', 'granular_concrete', tile=0.6, target='#d8c49a', maps=('diff',), res=256, rough_value=0.98),
    'yellow': L.flat('park_yellow', '#e2b934', rough=0.45, metal=0.1), 'blue': L.flat('park_blue', '#2f6fb0', rough=0.45, metal=0.1),
    'green': L.flat('park_green', '#3f8a5a', rough=0.45, metal=0.1), 'orange': L.flat('park_orange', '#e07a2a', rough=0.5),
    'chain': L.flat('park_chain', '#8a8c8e', rough=0.4, metal=0.45), 'rubber_k': L.flat('park_rubber_black', '#2a2a2c', rough=0.8),
    'board': base['board'], 'glass': base['glass'], 'cork': L.flat('park_cork', '#b8946a', rough=0.95),
    'lamp': L.flat('park_lamp_glass', '#fff1d6', rough=0.3, emit=B.srgb('#ffd9a0')), 'lamppost': L.flat('park_lamppost', '#2f4a3a', rough=0.5, metal=0.35),
    'incense': L.flat('park_incense', '#5a4a3a', rough=0.8),
    'roof_red': L.pbr('park_roof_red', 'grey_roof_tiles', tile=0.45, target='#9a4a32', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.6),
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
def _shrine_text(path):   # 土地公廟的匾（福德祠）和對聯（福而有德千家敬／正則為神萬世尊；常見的對聯，不是店名）：紅底金字，畫成一張 512×512
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new('RGB', (512, 512), (142, 28, 24)); d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 96); f2 = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 40)
    gold = (226, 188, 92)
    d.rectangle([4, 4, 507, 155], outline=gold, width=8); d.rectangle([18, 18, 493, 141], outline=gold, width=2)   # 匾：上面 512×160
    for k, ch in enumerate('福德祠'): d.text((70 + k * 136, 80), ch, font=f1, fill=gold, anchor='mm')
    for col, txt in ((0, '福而有德千家敬'), (1, '正則為神萬世尊')):   # 對聯：下面兩條 64×336（x 0～64、80～144）
        x0 = col * 80; d.rectangle([x0 + 2, 172, x0 + 61, 509], fill=(176, 36, 30)); d.rectangle([x0 + 5, 175, x0 + 58, 506], outline=gold, width=2)
        for k, ch in enumerate(txt): d.text((x0 + 32, 200 + k * 44), ch, font=f2, fill=(30, 22, 18), anchor='mm')
    im.save(path)
_shrine_text(os.path.join(GEN, 'shrine_text.png'))
M['shrine_text'] = img_mat('park_shrine_text', 'shrine_text.png', rough=0.6)
M['beard'] = L.flat('park_beard', '#e9e4da', rough=0.8); M['hat'] = L.flat('park_hat', '#1f1f22', rough=0.5); M['table_wood'] = L.flat('park_table_wood', '#5a3424', rough=0.55)
M['skin_gold'] = L.flat('park_statue_face', '#d9b06a', rough=0.4, metal=0.3)
M['niche'] = L.flat('park_niche', '#6e2a22', rough=0.8)
SHRINE_Q = []   # (四點, (u0, v0, u1, v1))：匾、對聯
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
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def M(self, x, y, z, extra=None):
        m = Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z'); return m @ extra if extra is not None else m
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.03, seg=3):
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def ell(self, m, c, rx, ry_, rz, tilt=0.0, seg=10, rings=6):
        """橢球；tilt＝在 x–y 平面往前（+x 往上）傾斜的角度"""
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
        for v in bm.verts: v.co = Vector((v.co.x * rx, v.co.y * rz, v.co.z * ry_))
        m.add_bm(bm, self.M(*c, Matrix.Rotation(-tilt, 4, 'Y'))); bm.free(); return m
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def box(self, m, x0, x1, y0, y1, z0, z1):
        cs = [self.p(x, 0, z) for x in (x0, x1) for z in (z0, z1)]
        bm = m.bm; vs = []
        for y in (y0, y1):
            for (x, z) in ((x0, z0), (x1, z0), (x1, z1), (x0, z1)): q = self.p(x, y, z); vs.append(bm.verts.new(g2b(*q)))
        for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)): bm.faces.new([vs[i] for i in f])
        return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m


def roof_field(m, xf, hx, hz, eh, rh, kind='hip', lift=0.14, thick=0.07, n=14, y_off=0.0):
    """有厚度、微微內凹、簷角起翹的屋頂（高度場）：hip＝四坡（涼亭）、gable＝兩坡（土地公廟，兩端燕尾起翹）。
    hx、hz＝半寬（含出挑）；eh＝簷口高、rh＝屋脊高"""
    bm = m.bm; top, bot = {}, {}
    for i in range(n + 1):
        for j in range(n + 1):
            u, v = -1 + 2 * i / n, -1 + 2 * j / n
            if kind == 'hip': t = max(abs(u), abs(v)); y = eh + (rh - eh) * (1 - t) ** 1.35 + lift * (abs(u) * abs(v)) ** 3
            else: t = abs(v); y = eh + (rh - eh) * (1 - t) ** 1.2 + lift * abs(u) ** 6
            q = xf.p(u * hx, y + y_off, v * hz)
            top[i, j] = bm.verts.new(g2b(*q)); bot[i, j] = bm.verts.new(g2b(q[0], q[1] - thick, q[2]))
    for i in range(n):
        for j in range(n):
            a, b_, c, d = (i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)
            bm.faces.new((top[a], top[d], top[c], top[b_])); bm.faces.new((bot[a], bot[b_], bot[c], bot[d]))
    edge = [(i, 0) for i in range(n)] + [(n, j) for j in range(n)] + [(i, n) for i in range(n, 0, -1)] + [(0, j) for j in range(n, 0, -1)]
    for k in range(len(edge)):
        a, b_ = edge[k], edge[(k + 1) % len(edge)]
        try: bm.faces.new((top[a], bot[a], bot[b_], top[b_]))
        except ValueError: pass
    return lambda u, v: (eh + (rh - eh) * (1 - (max(abs(u), abs(v)) if kind == 'hip' else abs(v))) ** (1.35 if kind == 'hip' else 1.2) + (lift * (abs(u) * abs(v)) ** 3 if kind == 'hip' else lift * abs(u) ** 6))


def coil(m, xf, x, z, y0, y1, r=0.07, turns=5, wire=0.012):
    """彈簧（搖搖馬）"""
    n = turns * 10; prev = None
    for k in range(n + 1):
        a = k / 10 * 2 * math.pi; q = (x + math.cos(a) * r, y0 + (y1 - y0) * k / n, z + math.sin(a) * r)
        if prev: xf.cyl(m, prev, q, wire, seg=5, caps=False)
        prev = q


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
for it in LAY['items']:                                                   # 其他樹的樹穴：花崗石緣＋泥土
    if it['kind'] in ('tree_camphor', 'tree_sweetgum'):
        rp = 0.62 if it['kind'] == 'tree_camphor' else 0.52
        ring_wall(gr, it['x'], it['z'], rp, rp + 0.1, 0.0, 0.1, n=20); disc(acc('soil'), it['x'], it['z'], rp, 0.04, n=20)
RINGS = [p for p in LAY['paths'] if 'ring' in p]
for p in LAY['paths']:                                                     # 直的步道兩側：花崗石收邊
    if 'ring' in p: continue
    (ax, az), (bx, bz) = p['from'], p['to']; Ln = math.hypot(bx - ax, bz - az); nx, nz = -(bz - az) / Ln, (bx - ax) / Ln
    for sd in (-1, 1):
        o = sd * (p['w'] / 2 + 0.05); a_ = [ax + nx * o, az + nz * o]; b_ = [bx + nx * o, bz + nz * o]
        for e0, e1 in ((a_, b_), (b_, a_)):                              # 收邊不穿過環狀步道：端點往外退到環的外緣
            for _ in range(200):
                if all(math.hypot(e0[0] - rp_['ring'][0], e0[1] - rp_['ring'][1]) > rp_['r'] + rp_['w'] / 2 + 0.1 for rp_ in RINGS): break
                d_ = math.hypot(e1[0] - e0[0], e1[1] - e0[1]); e0[0] += (e1[0] - e0[0]) / d_ * 0.05; e0[1] += (e1[1] - e0[1]) / d_ * 0.05
        strip(gr, tuple(a_), tuple(b_), 0.1, 0.03)

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
    if k == 'tree_bischofia': tree('park_oldtree', 'camphor_b', it['x'], it['z'], 1.38, 1.2, 0.7, LEAFV['bischofia'])
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
xf.rbox(acc('stone'), -pw / 2, pw / 2, 0.0, 0.14, -pw / 2, pw / 2, r=0.04)                               # 石基座（倒角）
for sx in (-1, 1):
    for sz in (-1, 1):
        cx_, cz_ = sx * (pw / 2 - 0.2), sz * (pw / 2 - 0.2)
        xf.rbox(acc('stone'), cx_ - 0.17, cx_ + 0.17, 0.14, 0.34, cz_ - 0.17, cz_ + 0.17, r=0.03, seg=2)          # 柱珠（石）
        xf.rbox(acc('pillar'), cx_ - 0.1, cx_ + 0.1, 0.34, 2.62, cz_ - 0.1, cz_ + 0.1, r=0.025, seg=2)            # 柱子
for sd in (-1, 1):                                                                                       # 四邊的樑（中間空）＋掛落
    xf.rbox(acc('pillar'), -pw / 2 + 0.05, pw / 2 - 0.05, 2.6, 2.84, sd * (pw / 2 - 0.2) - 0.1, sd * (pw / 2 - 0.2) + 0.1, r=0.02, seg=1)
    xf.rbox(acc('pillar'), sd * (pw / 2 - 0.2) - 0.1, sd * (pw / 2 - 0.2) + 0.1, 2.6, 2.84, -pw / 2 + 0.05, pw / 2 - 0.05, r=0.02, seg=1)
    for k in range(1, 6):
        t = -pw / 2 + 0.2 + k * (pw - 0.4) / 6
        xf.cyl(acc('pillar'), (t, 2.42, sd * (pw / 2 - 0.2)), (t, 2.6, sd * (pw / 2 - 0.2)), 0.015, seg=4, caps=False)
        xf.cyl(acc('pillar'), (sd * (pw / 2 - 0.2), 2.42, t), (sd * (pw / 2 - 0.2), 2.6, t), 0.015, seg=4, caps=False)
    xf.rbox(acc('pillar'), -pw / 2 + 0.2, pw / 2 - 0.2, 2.38, 2.43, sd * (pw / 2 - 0.2) - 0.03, sd * (pw / 2 - 0.2) + 0.03, r=0.01, seg=1)
    xf.rbox(acc('pillar'), sd * (pw / 2 - 0.2) - 0.03, sd * (pw / 2 - 0.2) + 0.03, 2.38, 2.43, -pw / 2 + 0.2, pw / 2 - 0.2, r=0.01, seg=1)
eh, rh, ov = 2.9, 3.95, 0.55                                                                             # 四坡攢尖頂：簷 2.9、頂 3.95、出挑 0.55，四角起翹
hgt = roof_field(acc('roof'), xf, pw / 2 + ov, pw / 2 + ov, eh, rh, 'hip', lift=0.22, thick=0.09)
roof_field(acc('pillar'), xf, pw / 2 + ov - 0.04, pw / 2 + ov - 0.04, eh - 0.1, rh - 0.12, 'hip', lift=0.2, thick=0.02, n=8)   # 屋頂底下的木天花（深色）
for sx in (-1, 1):                                                                                       # 四條垂脊（沿著屋頂的對角線）
    for sz in (-1, 1):
        pts = [(sx * t * (pw / 2 + ov), hgt(sx * t, sz * t) + 0.05, sz * t * (pw / 2 + ov)) for t in [k / 6 for k in range(7)]]
        for q0, q1 in zip(pts, pts[1:]): xf.cyl(acc('roof'), q0, q1, 0.045, seg=6)
acc('gold').cyl(xf.p(0, rh, 0), xf.p(0, rh + 0.16, 0), 0.07, seg=10); acc('gold').sphere(xf.p(0, rh + 0.26, 0), 0.1, seg=10, rings=6)   # 寶頂
NOTE_Q = []
def note(pts, cell): NOTE_Q.append((pts, cell))
if not HAS3:   # 舊的程序化圓石桌、石凳、棋盤（缺 ART-PARK3 時）
    tb = acc('stone'); tb.cyl(xf.p(0, 0.12, 0), xf.p(0, 0.72, 0), 0.18, seg=12); tb.cyl(xf.p(0, 0.72, 0), xf.p(0, 0.8, 0), 0.5, seg=24)   # 圓石桌
    for (sx, sz) in ((0, -0.95), (0, 0.95), (-0.95, 0), (0.95, 0)): tb.cyl(xf.p(sx, 0.12, sz), xf.p(sx, 0.55, sz), 0.2, seg=14)     # 鼓形石凳
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
# 溜滑梯、搖搖馬、搖搖小鴨、沙坑：BB-B 的 ART-PARK1（bb_support/park_play_props.glb，6.7k 三角形、一個貼圖材質 park_play；LAWWW2-B 驗收 2026-10-16）。
# GLB 裡四件已經擺在遊戲場的本地座標（平台中心 (−1.55, 0)、馬 (0.9, 0.6)、鴨 (1.85, 0.6)、沙坑 (1.4, −0.9)），這裡整組搬到遊戲場：本地 (lx, lz) → xf。
# 沙坑往南挪 0.1 m（−0.9 → −1.0）：滑道出口的邊（z ±0.265）和沙坑北邊的木框（z −0.245）重疊 2 cm。缺檔時用舊的程序化版本（v3）。
PLAY = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/park_play_props.glb')
if os.path.exists(PLAY):
    _before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=PLAY); _new = [o for o in bpy.data.objects if o not in _before]
    _tops = {o.name.split('.')[0]: o for o in _new if o.type == 'MESH' and o.name.startswith('PARK_')}
    _gp = B.group('park_play', root)
    for nd, dz in (('PARK_SLIDE', 0.0), ('PARK_SPRING_A', 0.0), ('PARK_SPRING_B', 0.0), ('PARK_SANDBOX', -0.1)):
        src = _tops.get(nd)
        if src is None: print('ART-PARK1 沒有', nd); continue
        lw = src.matrix_world.copy(); lx, lz = lw.translation.x, -lw.translation.y + dz
        ob = src.copy(); bpy.context.scene.collection.objects.link(ob); ob.parent = _gp; ob.matrix_parent_inverse.identity()
        ob.rotation_mode = 'XYZ'; ob.location = g2b(*xf.p(lx, 0.0, lz)); ob.rotation_euler = (0, 0, lw.to_euler().z + xf.ry); ob.scale = (1, 1, 1)
    for _o in _new:
        if _o.name in bpy.data.objects: bpy.data.objects.remove(_o)
else:   # 舊的程序化版本（v3）
    # 溜滑梯：平台 1.1 m（四根圓柱、圓角平台、兩側護板）、後面階梯＋扶手、前面 U 形滑道（往 +x），平台上一個小四坡頂
    sx0 = -gw / 2 + 0.6
    for ax in (sx0, sx0 + 0.9):
        for az in (-0.45, 0.45): xf.cyl(acc('yellow'), (ax, 0.0, az), (ax, 1.9, az), 0.045, seg=10); acc('yellow').sphere(xf.p(ax, 1.9, az), 0.05, seg=8, rings=4)
    xf.rbox(acc('blue'), sx0 - 0.05, sx0 + 0.95, 1.02, 1.1, -0.5, 0.5, r=0.025)
    for az in (-0.47, 0.47):
        xf.rbox(acc('blue'), sx0 + 0.05, sx0 + 0.85, 1.12, 1.56, az - 0.018, az + 0.018, r=0.015)
        xf.cyl(acc('yellow'), (sx0, 1.62, az), (sx0 + 0.9, 1.62, az), 0.028, seg=8)
    _c = xf.p(sx0 + 0.45, 0, 0); roof_field(acc('orange'), Xf(_c[0], _c[2], xf.ry), 0.62, 0.62, 1.93, 2.32, 'hip', lift=0.05, thick=0.035, n=8)
    for k in range(5):                                                                                      # 階梯（圓角踏板）＋扶手
        y = 0.2 * (k + 1); xf.rbox(acc('blue'), sx0 - 0.58 + k * 0.105, sx0 - 0.3 + k * 0.105, y - 0.035, y, -0.28, 0.28, r=0.012)
    for az in (-0.31, 0.31):
        xf.cyl(acc('yellow'), (sx0 - 0.62, 0.0, az), (sx0 - 0.08, 1.06, az), 0.03, seg=8)
        xf.cyl(acc('yellow'), (sx0 - 0.62, 0.62, az), (sx0 - 0.02, 1.62, az), 0.022, seg=8)
    pts = []
    for k in range(13):
        t = k / 12; pts.append((sx0 + 0.95 + t * 1.95, 1.08 - (t * t * (3 - 2 * t)) * 0.94 + 0.04))
    PIN = [(-0.27, 0.2), (-0.27, 0.02), (-0.22, -0.04), (0.0, -0.06), (0.22, -0.04), (0.27, 0.02), (0.27, 0.2)]
    POUT = [(-0.3, 0.2), (-0.3, 0.0), (-0.24, -0.07), (0.0, -0.09), (0.24, -0.07), (0.3, 0.0), (0.3, 0.2)]
    bm = acc('green').bm; rin, rout = [], []
    for (x, y) in pts:
        rin.append([bm.verts.new(g2b(*xf.p(x, y + py, pz_))) for (pz_, py) in PIN]); rout.append([bm.verts.new(g2b(*xf.p(x, y + py, pz_))) for (pz_, py) in POUT])
    for r0, r1, o0, o1 in zip(rin, rin[1:], rout, rout[1:]):
        for k in range(len(PIN) - 1):
            bm.faces.new((r0[k], r1[k], r1[k + 1], r0[k + 1])); bm.faces.new((o0[k + 1], o1[k + 1], o1[k], o0[k]))
        for k in (0, len(PIN) - 1): bm.faces.new((r0[k], o0[k], o1[k], r1[k]) if k == 0 else (r1[k], o1[k], o0[k], r0[k]))
    # 搖搖馬 ×2：彈簧＋橢球的身體、脖子、頭、耳朵、尾巴，握把、腳踏
    for k, (hx, col) in enumerate(((0.9, 'orange'), (1.85, 'yellow'))):
        hz = 0.6; m = acc(col)
        xf.cyl(acc('steel'), (hx, 0.0, hz), (hx, 0.04, hz), 0.17, seg=16); coil(acc('chain'), xf, hx, hz, 0.04, 0.44, r=0.065, turns=6, wire=0.011)
        xf.ell(m, (hx, 0.6, hz), 0.3, 0.13, 0.12)
        xf.ell(m, (hx + 0.22, 0.78, hz), 0.08, 0.17, 0.075, tilt=0.45)
        xf.ell(m, (hx + 0.32, 0.92, hz), 0.11, 0.07, 0.068, tilt=-0.25)
        for ez in (-0.04, 0.04): xf.ell(m, (hx + 0.25, 1.02, hz + ez), 0.02, 0.05, 0.015)
        xf.ell(acc('rubber_k'), (hx + 0.36, 0.95, hz - 0.055), 0.016, 0.016, 0.01); xf.ell(acc('rubber_k'), (hx + 0.36, 0.95, hz + 0.055), 0.016, 0.016, 0.01)
        xf.ell(acc('rubber_k'), (hx + 0.2, 0.92, hz), 0.1, 0.03, 0.025, tilt=0.6)                                  # 鬃毛
        xf.ell(m, (hx - 0.32, 0.62, hz), 0.08, 0.04, 0.035, tilt=-0.7)                                            # 尾巴
        xf.cyl(acc('steel'), (hx + 0.24, 0.86, hz - 0.15), (hx + 0.24, 0.86, hz + 0.15), 0.018, seg=8)            # 握把
        xf.cyl(acc('steel'), (hx + 0.08, 0.44, hz - 0.2), (hx + 0.08, 0.44, hz + 0.2), 0.018, seg=8)              # 腳踏
    # 小沙坑（木框）
    xf.rbox(acc('wood'), 0.5, 2.3, 0.0, 0.25, -1.55, -1.45, r=0.02, seg=2); xf.rbox(acc('wood'), 0.5, 2.3, 0.0, 0.25, -0.35, -0.25, r=0.02, seg=2)   # 木框（不重疊：v2 第一版四個角重疊閃黑）
    xf.rbox(acc('wood'), 0.5, 0.6, 0.0, 0.25, -1.45, -0.35, r=0.02, seg=2); xf.rbox(acc('wood'), 2.2, 2.3, 0.0, 0.25, -1.45, -0.35, r=0.02, seg=2)
    xf.box(acc('sand'), 0.6, 2.2, 0.0, 0.16, -1.45, -0.35)


# ======================== 鞦韆 ×2、健身器材 ×3 ========================
def place_support(path, plan, group):
    """支援組的 GLB（每件一個頂層節點，GLB 裡照自己的原點排開）→ 照 layout 擺：plan＝[(節點, layout 項目, 錨點節點)]。
    節點相對錨點節點的位置與旋轉（例如鞦韆座位掛在框架的吊點、毛巾和扭腰盤同一個原點）照 GLB 保留，整組轉到 layout 的位置和 yaw。回傳擺了幾件。"""
    if not os.path.exists(path): return 0
    _before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); _new = [o for o in bpy.data.objects if o not in _before]
    tops = {o.name.split('.')[0]: o for o in _new if o.type == 'MESH'}; gp = B.group(group, root); n = 0
    for row in plan:
        nd, it, anchor = row[:3]; ox, oy, oz, oyaw = row[3] if len(row) > 3 else (0.0, 0.0, 0.0, 0.0)   # 第 4 項：在 layout 項目自己的座標裡再位移、轉（例：石凳四個方向、桌子放在涼亭基座上）
        src, anc = tops.get(nd), tops.get(anchor)
        if src is None or anc is None: print(group, '沒有', nd); continue
        rel = anc.matrix_world.inverted() @ src.matrix_world; t = rel.to_translation(); e = rel.to_euler('XYZ')
        xf = Xf(it['x'], it['z'], it.get('yaw', 0))
        ob = src.copy(); bpy.context.scene.collection.objects.link(ob); ob.parent = gp; ob.matrix_parent_inverse.identity()
        ob.rotation_mode = 'XYZ'; ob.location = g2b(*xf.p(t.x + ox, t.z + oy, -t.y + oz)); ob.rotation_euler = (e.x, e.y, e.z + xf.ry + oyaw); ob.scale = (1, 1, 1); n += 1
    for _o in _new:
        if _o.name in bpy.data.objects: bpy.data.objects.remove(_o)
    return n


# AA-B 的 ART-PARK2（aa_support/park2_props.glb，8.8k 三角形、一個貼圖材質 park2；LAWWW2-B 驗收 2026-10-16：綠漆調亮、毛巾改淺藍）。
# 鞦韆框架、兩個座位（原點＝吊點，SEAT_B 停在 7°）；扭腰盤＋毛巾、肩部大轉輪、漫步機＋水瓶。器材自己有混凝土小基座，舊的 0.9 m 石板拿掉。缺檔時用舊的程序化版本（v3）
_IT = {i['id']: i for i in LAY['items']}
_n2 = place_support(os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/park2_props.glb'), [
    ('PARK_SWINGS', _IT['swings'], 'PARK_SWINGS'), ('PARK_SWING_SEAT_A', _IT['swings'], 'PARK_SWINGS'), ('PARK_SWING_SEAT_B', _IT['swings'], 'PARK_SWINGS'),
    ('PARK_FIT_WAIST', _IT['fit1'], 'PARK_FIT_WAIST'), ('PARK_FIT_TOWEL', _IT['fit1'], 'PARK_FIT_WAIST'),
    ('PARK_FIT_SHOULDER', _IT['fit2'], 'PARK_FIT_SHOULDER'),
    ('PARK_FIT_LEG', _IT['fit3'], 'PARK_FIT_LEG'), ('PARK_FIT_BOTTLE', _IT['fit3'], 'PARK_FIT_LEG')], 'park2')
print('ART-PARK2 擺了', _n2, '件')
if not _n2:   # 舊的程序化版本（v3）
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
xf.rbox(acc('stone'), -0.66, 0.66, 0.0, 0.32, -0.5, 0.42, r=0.03)                                     # 台座＋前面一階
xf.rbox(acc('stone'), -0.5, 0.5, 0.0, 0.14, 0.42, 0.72, r=0.02)
xf.rbox(acc('stone'), -0.51, 0.51, 0.32, 0.62, -0.43, -0.31, r=0.015)                                     # 後牆、兩側牆：下段石材（勒腳），上段紅牆（v4：原本整面紅方塊）
xf.rbox(acc('red'), -0.5, 0.5, 0.62, 1.28, -0.42, -0.32, r=0.02)
for sx in (-1, 1): xf.rbox(acc('stone'), sx * 0.5 - 0.06, sx * 0.5 + 0.06, 0.32, 0.62, -0.43, 0.19, r=0.015); xf.rbox(acc('red'), sx * 0.5 - 0.05, sx * 0.5 + 0.05, 0.62, 1.28, -0.42, 0.18, r=0.02)
for sx in (-1, 1): xf.rbox(acc('gold'), sx * 0.5 - 0.055, sx * 0.5 + 0.055, 0.6, 0.63, -0.425, 0.185, r=0.005)   # 石材和紅牆之間一條金色收邊
xf.box(acc('niche'), -0.45, 0.45, 0.32, 1.25, -0.32, -0.3)                                               # 神龕裡面的背板：暗紅（v4：原本是整塊實心的土色方塊，把神桌和金身整個包在裡面，從來看不到）
xf.rbox(acc('table_wood'), -0.36, 0.36, 0.47, 0.5, -0.3, -0.05, r=0.01)                                  # 神桌：桌面＋紅桌裙（金邊）
xf.box(acc('red'), -0.34, 0.34, 0.33, 0.47, -0.065, -0.055); xf.box(acc('gold'), -0.34, 0.34, 0.44, 0.465, -0.068, -0.054)
xf.rbox(acc('table_wood'), -0.1, 0.1, 0.5, 0.54, -0.25, -0.1, r=0.008)                                 # 土地公像（v4：原本兩顆金色橢球）：台座、坐姿的長袍、臉、白鬍子、黑官帽
xf.ell(acc('gold'), (0, 0.6, -0.17), 0.085, 0.07, 0.065); xf.ell(acc('gold'), (0, 0.7, -0.18), 0.07, 0.09, 0.055)   # 坐著的下半身、上身
xf.ell(acc('skin_gold'), (0, 0.815, -0.17), 0.04, 0.045, 0.04); xf.ell(acc('beard'), (0, 0.775, -0.145), 0.032, 0.045, 0.02)
xf.cyl(acc('hat'), (0, 0.85, -0.17), (0, 0.885, -0.17), 0.042, seg=10); xf.box(acc('hat'), -0.075, 0.075, 0.855, 0.866, -0.175, -0.165)   # 官帽＋兩側的帽翅
for sx in (-1, 1): xf.cyl(acc('pillar'), (sx * 0.47, 0.32, 0.24), (sx * 0.47, 1.26, 0.24), 0.045, seg=12)   # 前面兩根圓柱
xf.rbox(acc('red'), -0.56, 0.56, 1.22, 1.33, -0.46, 0.3, r=0.02)                                          # 樑
roof_field(acc('roof_red'), xf, 0.8, 0.62, 1.32, 1.62, 'gable', lift=0.15, thick=0.05, n=12, y_off=0.0)
for k in range(12):                                                                                       # 屋脊：兩端翹起（燕尾）
    u0, u1 = -1 + 2 * k / 12, -1 + 2 * (k + 1) / 12
    q0 = (u0 * 0.86, 1.65 + 0.2 * abs(u0) ** 5, 0.0); q1 = (u1 * 0.86, 1.65 + 0.2 * abs(u1) ** 5, 0.0); xf.cyl(acc('roof_red'), q0, q1, 0.035, seg=6)
for sx in (-1, 1):
    for sz in (-0.03, 0.03): xf.cyl(acc('roof_red'), (sx * 0.86, 1.85, 0.0), (sx * 0.98, 1.95, sz * 2.5), 0.018, r2=0.004, seg=5)
acc('gold').sphere(xf.p(0, 1.75, 0), 0.06, seg=10, rings=6)                                               # 屋脊中間的寶珠
xf.rbox(acc('table_wood'), -0.36, 0.36, 0.68, 0.72, 0.48, 0.84, r=0.012)                                 # 供桌（v4：原本一個紅方塊）：木桌面、四隻腳、前面紅桌裙＋金邊
for sx in (-1, 1):
    for sz in (0.52, 0.8): xf.box(acc('table_wood'), sx * 0.32 - 0.025, sx * 0.32 + 0.025, 0.32, 0.68, sz - 0.025, sz + 0.025)
xf.box(acc('red'), -0.34, 0.34, 0.38, 0.68, 0.845, 0.852); xf.box(acc('gold'), -0.34, 0.34, 0.62, 0.65, 0.848, 0.856)
SHRINE_Q.append(([xf.p(-0.25, 1.235, 0.306), xf.p(0.25, 1.235, 0.306), xf.p(0.25, 1.325, 0.306), xf.p(-0.25, 1.325, 0.306)], (0.0, 1 - 160 / 512, 1.0, 1.0)))   # 匾（樑的正面）
for k, sx in enumerate((0.47, -0.47)):   # 對聯：貼在兩根柱子正面（上聯在右＝面向廟時的右手邊）
    x0 = k * 80 / 512; SHRINE_Q.append(([xf.p(sx - 0.035, 0.42, 0.29), xf.p(sx + 0.035, 0.42, 0.29), xf.p(sx + 0.035, 1.14, 0.29), xf.p(sx - 0.035, 1.14, 0.29)], (x0 + 2 / 512, 3 / 512, x0 + 61 / 512, 1 - 172 / 512)))
xf.cyl(acc('gold'), (0, 0.72, 0.66), (0, 0.84, 0.66), 0.07, r2=0.1, seg=14)                              # 香爐
for dx in (-0.03, 0.0, 0.03): acc('incense').cyl(xf.p(dx, 0.84, 0.66), xf.p(dx, 1.06, 0.66), 0.004, seg=3)
for sx in (-0.42, 0.42):                                                                                  # 紅燈籠（金色上下蓋）
    xf.ell(acc('red'), (sx, 1.02, 0.34), 0.1, 0.13, 0.1); xf.cyl(acc('gold'), (sx, 1.14, 0.34), (sx, 1.17, 0.34), 0.05, seg=10); xf.cyl(acc('gold'), (sx, 0.87, 0.34), (sx, 0.9, 0.34), 0.05, seg=10)
    xf.cyl(acc('chain'), (sx, 1.17, 0.34), (sx, 1.24, 0.34), 0.005, seg=4)
for sx in (-0.42, 0.42): CL.glow(root, 'shrine', *xf.p(sx, 1.02, 0.4), color='rgba(255,90,60,1)', size=0.6, day=0.0, night=0.9)

# ======================== 公布欄、直飲台、腳踏車架、長椅、路燈 ========================
def notice_board(it):
    xf = Xf(it['x'], it['z'], it.get('yaw', 0))
    # v8（2026-10-16）：公園名牌搬到公布欄頂上的橫板（原本另立在入口西邊 x 20.5～22.1，從巷子看剛好擋住公布欄的左半邊）；柱子、屋簷加高到 2.42
    for sx in (-0.75, 0.75): xf.rbox(acc('lamppost'), sx - 0.045, sx + 0.045, 0.0, 2.42, -0.045, 0.045, r=0.012)
    xf.rbox(acc('lamppost'), -0.84, 0.84, 0.84, 1.96, -0.085, -0.02, r=0.02); xf.box(acc('cork'), -0.74, 0.74, 0.92, 1.88, -0.021, -0.015)
    xf.rbox(acc('lamppost'), -0.86, 0.86, 1.99, 2.38, -0.06, 0.004, r=0.015)   # 名牌橫板（字是遊戲畫的 PLATE_FACE_parksign，貼在前面）
    roof_field(acc('lamppost'), Xf(*xf.p(0, 0, -0.07)[0::2], xf.ry), 0.95, 0.24, 2.42, 2.52, 'gable', lift=0.0, thick=0.025, n=4)   # 小屋簷
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
    """公園長椅：圓角木條（座面四條、椅背三條，椅背微微往後仰）、鑄鐵側架（曲線：前腳、座面下、扶手）"""
    xf = Xf(it['x'], it['z'], it.get('yaw', 0))
    for k in range(4): z = -0.2 + k * 0.105; xf.rbox(acc('wood'), -0.78, 0.78, 0.42 - k * 0.006, 0.455 - k * 0.006, z, z + 0.085, r=0.012, seg=1)
    for k in range(3):
        y = 0.56 + k * 0.13; z = -0.27 - k * 0.03; xf.rbox(acc('wood'), -0.78, 0.78, y, y + 0.08, z - 0.02, z + 0.02, r=0.012, seg=1)
    for sx in (-0.66, 0.66):
        pts = [(sx, 0.0, 0.2), (sx, 0.4, 0.18), (sx, 0.4, -0.24), (sx, 0.0, -0.26)]                         # 前腳→座面下→後腳
        for q0, q1 in zip(pts, pts[1:]): xf.cyl(acc('steel'), q0, q1, 0.025, seg=6)
        back = [(sx, 0.4, -0.24), (sx, 0.62, -0.29), (sx, 0.88, -0.34)]
        for q0, q1 in zip(back, back[1:]): xf.cyl(acc('steel'), q0, q1, 0.022, seg=6)
        arm = [(sx * 1.08, 0.62, 0.16), (sx * 1.08, 0.66, -0.05), (sx * 1.05, 0.62, -0.26)]
        for q0, q1 in zip(arm, arm[1:]): xf.cyl(acc('steel'), q0, q1, 0.022, seg=6)
        xf.cyl(acc('steel'), (sx * 1.08, 0.4, 0.16), (sx * 1.08, 0.62, 0.16), 0.02, seg=6)
def park_lamp(it):
    xf = Xf(it['x'], it['z']); xf.box(acc('stone'), -0.15, 0.15, 0.0, 0.08, -0.15, 0.15)
    xf.cyl(acc('lamppost'), (0, 0.08, 0), (0, 3.3, 0), 0.06, seg=10); xf.cyl(acc('lamppost'), (0, 3.3, 0), (0, 3.4, 0), 0.2, seg=12)
    xf.cyl(acc('lamp'), (0, 3.4, 0), (0, 3.85, 0), 0.17, seg=12); xf.cyl(acc('lamppost'), (0, 3.85, 0), (0, 3.95, 0), 0.24, seg=12)
    CL.glow(root, 'parklamp', *xf.p(0, 3.62, 0), color='rgba(255,214,150,1)', size=2.0, day=0.0, night=1.0)
for it in LAY['items']:
    k = it['kind']
    if k == 'notice_board': notice_board(it)
    elif k == 'drinking_fountain' and not HAS3: fountain(it)
    elif k == 'bike_rack' and not HAS3: bike_rack(it)
    elif k == 'bench': bench(it)
    elif k == 'park_lamp': park_lamp(it)

# BB-B 的 ART-PARK3（bb_support/park3_props.glb，5.4k 三角形、一個貼圖材質 park3；LAWWW2-B 驗收 2026-10-16）：
# 涼亭的花崗岩象棋桌（桌面刻棋盤，楚河漢界和本地 x 平行）＋四個鼓形石凳（同一個網格，各轉一點角度），放在涼亭石基座上（y 0.14）；不鏽鋼直飲台；四格鍍鋅腳踏車架（沿 layout 的 z）
if HAS3:
    _IT3 = {i['id']: i for i in LAY['items']}; _pv = next(i for i in LAY['items'] if i['kind'] == 'pavilion')
    _n3 = place_support(PARK3, [('PARK_CHESS_TABLE', _pv, 'PARK_CHESS_TABLE', (0.0, 0.14, 0.0, 0.0))]
                        + [('PARK_STOOL', _pv, 'PARK_STOOL', (sx, 0.14, sz, a)) for (sx, sz, a) in ((0.0, -0.95, 0.3), (0.0, 0.95, 1.9), (-0.95, 0.0, 3.4), (0.95, 0.0, 5.0))]
                        + [('PARK_FOUNTAIN', _IT3['fountain'], 'PARK_FOUNTAIN'), ('PARK_BIKE_RACK', _IT3['bikes'], 'PARK_BIKE_RACK')], 'park3')
    print('ART-PARK3 擺了', _n3, '件')

# ======================== 杜鵑花籬（季節：只有葉／開花） ========================
# 修剪過的花籬＝實心的圓頂長條（不透明的葉子貼圖，葉縫是深綠）＋表面一層葉片卡（打破輪廓）。只用葉片卡會像散開的羽毛（v2 第一版）。
hz = next(i for i in LAY['items'] if i['kind'] == 'azalea_hedge')
def core_mat(name, fn):
    m = img_mat(name, fn, clip=False, rough=0.75); m['tile'] = 0.8; return m
CORE = {'off': core_mat('park_azalea_core', 'azalea_leaves.png'), 'on': core_mat('park_azalea_core_fl', 'azalea_flower.png')}
PROF = [(-0.30, 0.0), (-0.36, 0.30), (-0.34, 0.56), (-0.24, 0.72), (0.0, 0.78), (0.24, 0.72), (0.34, 0.56), (0.36, 0.30), (0.30, 0.0)]
def hedge_core(bm, x0, z0, x1, z1, seed):
    rr = random.Random(seed); Ln = math.hypot(x1 - x0, z1 - z0); ux, uz = (x1 - x0) / Ln, (z1 - z0) / Ln; nx, nz = -uz, ux
    n = max(2, int(Ln / 0.45)); rings = []
    for i in range(n + 1):
        t = i / n; cx, cz = x0 + (x1 - x0) * t, z0 + (z1 - z0) * t
        end = 0.82 if i in (0, n) else 1.0                                      # 兩端收圓一點
        ring = []
        for (d, y) in PROF:
            j = 1.0 + rr.uniform(-0.07, 0.07) if 0 < y < 0.78 else 1.0
            ring.append(bm.verts.new(g2b(cx + nx * d * end * j, y * (end if y > 0 else 1) * (1 + rr.uniform(-0.04, 0.04) if y > 0 else 1), cz + nz * d * end * j)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(len(PROF) - 1): bm.faces.new((a[k], b[k], b[k + 1], a[k + 1]))
    for ring, rev in ((rings[0], True), (rings[-1], False)): bm.faces.new(list(reversed(ring)) if rev else ring)
random.seed(311)
hedge = {'off': Mesh('SEASON_AZALEA_off_hedge', M['azalea']), 'on': Mesh('SEASON_AZALEA_on_hedge', M['azalea_fl'])}
cores = {tag: Mesh(f'SEASON_AZALEA_{tag}_core', CORE[tag]) for tag in CORE}
_shr = next(i for i in LAY['items'] if i['kind'] == 'tudigong_shrine')
for si, (x0, z0, x1, z1) in enumerate(hz['segments']):
    if abs(z1 - z0) < 1e-6 and abs(z0 - _shr['z']) < 1.0 and min(x0, x1) < _shr['x'] + 0.7 < max(x0, x1):   # 南邊那一段花籬穿過土地公廟的背牆：畫面從廟的東邊開始（導航照 layout，不變）
        x0, x1 = _shr['x'] + 0.75, max(x0, x1)
    for tag in cores: hedge_core(cores[tag].bm, x0, z0, x1, z1, 50 + si)
    Ln = math.hypot(x1 - x0, z1 - z0); n = max(2, int(Ln / 0.4))
    for i in range(n + 1):
        t = i / n; x, z = x0 + (x1 - x0) * t, z0 + (z1 - z0) * t
        st_ = random.getstate()
        for tag, m in hedge.items(): random.setstate(st_); bush(m, x, 0.5, z, 0.42, n=4, span=0.35, flat_y=0.8)
for tag, m in hedge.items():
    grp = B.group(f'SEASON_AZALEA_{tag}', root, {'season': 'azalea', 'state': tag})
    o = m.finish(None, uv=False); o.parent = grp
    oc = cores[tag].finish(None, uv=True, smooth=True); oc.parent = grp

# ======================== 矮牆、名牌 ========================
for w in LAY['walls']:
    if 'x0' in w: acc('wall').box(w['x0'], w['x1'], 0.0, w['h'], w['z'] - 0.1, w['z'] + 0.1); gr.box(w['x0'] - 0.03, w['x1'] + 0.03, w['h'], w['h'] + 0.06, w['z'] - 0.13, w['z'] + 0.13)
    else: acc('wall').box(w['x'] - 0.1, w['x'] + 0.1, 0.0, w['h'], w['z0'], w['z1']); gr.box(w['x'] - 0.13, w['x'] + 0.13, w['h'], w['h'] + 0.06, w['z0'] - 0.03, w['z1'] + 0.03)
# 公園名牌：公布欄頂上的橫板（v8）。v2 另立在入口西邊、v3 挪到 x 20.5～22.1，從巷子看擋住公布欄（x 21.2～22.8）的左半邊
_nb = next(i for i in LAY['items'] if i['kind'] == 'notice_board'); _xn = Xf(_nb['x'], _nb['z'], _nb.get('yaw', 0))
fm = Mesh('PLATE_FACE_parksign', M['board']); fm.quad([_xn.p(-0.8, 2.03, 0.012), _xn.p(0.8, 2.03, 0.012), _xn.p(0.8, 2.34, 0.012), _xn.p(-0.8, 2.34, 0.012)])   # 第一個點＝看的人的左下（yaw π：本地 −x＝世界 +x＝從巷子看的左邊），面朝巷子

# ======================== 收尾 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=k not in ('park_grass', 'park_paver', 'park_granite'))
uv01(fm.finish(root, uv=True, props={'plate': 'park', 'text': '溫州公園', 'bg': '#2f4a3a', 'color': '#f4ead8'}))
if SHRINE_Q:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, (u0, v0, u1, v1) in SHRINE_Q:
        vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('park_shrine_text'); bm.to_mesh(me); bm.free(); me.materials.append(M['shrine_text'])
    ob = bpy.data.objects.new('park_shrine_text', me); B.scene().collection.objects.link(ob); ob.parent = root
if NOTE_Q:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); NOTES = ['hiring', 'hours', 'pay', 'rent', 'winter', 'copyprice', 'copyprice2', 'nobook', 'chalk', 'menu', 'closed', 'poster', 'lostcat', 'tutor', 'hours2', 'blank']
    for pts, cn in NOTE_Q:
        i = NOTES.index(cn); col, row = i % 4, i // 4; u0, u1 = col / 4, (col + 1) / 4; v1 = 1 - row / 4; v0 = v1 - 0.25
        vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs)
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    me = bpy.data.meshes.new('park_notes'); bm.to_mesh(me); bm.free(); me.materials.append(M['notes'])
    ob = bpy.data.objects.new('park_notes', me); B.scene().collection.objects.link(ob); ob.parent = root
L.vc_consolidate(root, dict.fromkeys(('park_steel', 'park_lamppost', 'park_stainless', 'park_chain'), L.vc_metal('wz_vc_metal', rough=0.45, metal=0.35)))
L.vc_consolidate(root, dict.fromkeys(('park_red', 'park_pillar', 'park_blue', 'park_green', 'park_orange', 'park_rubber_black', 'park_cork', 'park_incense', 'park_soil'), L.vc_material('wz_vc_matte', rough=0.85)))
# 第三輪減量（2026-10-16）：其他純色材質也進頂點色；公園的樹（樟樹、老茄苳）不再一棵一個網格——同材質合成一個（楓香有季節切換，照舊分開）；
# 只擺幾個的 instancing 合進大網格、多材質的零件拆開再合。發光的燈、字牌不動。
import re   # noqa: E402
_keep = lambda ob: 'FACE' in ob.name or ob.name.startswith('SEASON')   # 杜鵑（網格本身叫 SEASON_AZALEA_*）
def _season_key(ob):   # 楓香兩棵：同一個季節狀態、同材質的合成一個網格，名字 SEASON_SWEETGUM_<on|off>_<材質>（遊戲照名字切換）
    m = re.match(r'(SEASON_[A-Z]+_(?:on|off))', ob.parent.name) if ob.parent is not None else None
    return m.group(1) if m else ''
L.vc_consolidate(root, L.auto_vc_groups(root, bpy.data.materials['wz_vc_matte'], bpy.data.materials['wz_vc_metal'], protect={'wz_lamp_lens', 'jp_lamp', 'cafe_bulb'}))
L.realize_small_instances(root, keep=_keep)
L.split_by_material(root, keep=_keep)
L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', 'wz_park_small_atlas.png'), 'wz_park_small_atlas', protect={'wz_lamp_lens', 'park_lamp_glass', 'cafe_bulb', 'park_shrine_text'}, max_tris=1600, keep=_keep)   # 效能第二輪：小貼圖材質合一張
L.atlas_rows(root, os.path.join(HERE, 'textures', 'gen', 'wz_park_rows.jpg'), 'wz_park_rows', protect={'wz_lamp_lens', 'park_lamp_glass', 'cafe_bulb', 'park_grass', 'park_stone'}, max_vloss=0.06, keep=_keep, skip=lambda m: m.name.startswith('wz_park_small_atlas'))
L.merge_by_material(root, keep=_keep, key=_season_key)
info = L.export(OUT, gpu_instances=True)
info['layout'] = LAY['version']
L.write_json(OUT[:-4] + '.json', info)
