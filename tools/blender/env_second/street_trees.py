"""行道樹（⑦）：樟樹（兩款）、榕樹、大王椰子的 Blender 正式模型＋遠景卡片（impostor）→ assets/models/env/second_ai/street_trees.glb
（遊戲端：townkit3d.js 的 TK.tree／TK.royalPalm 在正式模型載入後改成「樹的位置」，整區的樹用 InstancedMesh 畫：近的畫模型、遠的畫卡片、看不到的不畫）。

- 樹幹、枝條：沿曲線的多邊形管（平行移動的座標系，不會扭），樹皮 Poly Haven CC0：樟樹 japanese_camphor_bark（校正成灰褐色）、
  榕樹 chinese_hackberry_bark（校正成淺灰，榕樹皮光滑）、大王椰子 palm_tree_bark（灰白、橫向環紋）。
- 樹冠：葉叢卡（tree_atlas.py 在 Blender 裡用真的葉片幾何渲染的貼圖），卡片的法線往樹冠外側（整個樹冠像一團體積，
  不會每張卡片一片亮一片暗）；正反面同一個法線（遊戲端不翻面）。
- 大王椰子：灰白樹幹（基部略寬、中段微鼓）、頂端光滑的綠色葉鞘、15 片羽狀葉（每片兩條葉片帶，成 V 字形，越往葉尖越下垂；
  下面的老葉垂得多、上面的新葉挺）、中間一支直立的新葉。
- 遠景卡片：每款樹從側面正交渲染（透明背景）拼成 tree_cards.png；遊戲裡是永遠面向鏡頭的一片（1 個 draw call 畫全部遠的樹）。
- 每款樹的 extras：h0（模型高度）、r0（樹冠半徑）、card（卡片在貼圖上的像素範圍、實際寬高）。
用法：/opt/blenv/bin/python tools/blender/env_second/street_trees.py [--cards]（重新渲染遠景卡片）[--threads N] [--preview 資料夾]"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
B = L.B
import bpy, bmesh   # noqa: E402
from mathutils import Vector, Matrix   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
THREADS = int(A[A.index('--threads') + 1]) if '--threads' in A else 0
GEN = os.path.join(HERE, 'textures', 'gen')
ATLAS = os.path.join(GEN, 'tree_leaves.png'); CARDS = os.path.join(GEN, 'tree_cards.png')
OUT = os.path.join(L.ROOT, 'assets', 'models', 'env', 'second_ai', 'street_trees.glb')
CLUSTER_M = 1.9          # 葉叢貼圖一格（512 px）的實際大小（tree_atlas.py）
INS = 2.5 / 1024         # UV 往格子裡縮 2.5 px（不會取到隔壁格）
# 葉片貼圖的格子（Blender UV：v 往上；影像左上角＝(0,1)）
CELL = {'camphor_a': (0.0, 0.5, 0.5, 1.0), 'banyan': (0.5, 0.5, 1.0, 1.0), 'camphor_b': (0.0, 0.0, 0.5, 0.5),
        'frond': (0.5, 0.0, 0.75, 0.5), 'roots': (0.75, 0.0, 0.875, 0.5), 'shaft': (0.875, 0.375, 1.0, 0.5)}
# 遠景卡片貼圖的格子（影像像素，左上角原點；1024×1024）
CARD_CELL = {'camphor_a': (0, 0, 512, 512), 'camphor_b': (512, 0, 1024, 512), 'banyan_a': (0, 512, 512, 1024), 'palm_a': (512, 512, 768, 1024)}


def cell_uv(name, u, v):
    """格子裡的相對座標 (u,v)∈[0,1]² → 整張貼圖的 UV（往內縮一點）"""
    u0, v0, u1, v1 = CELL[name]
    return (u0 + INS + (u1 - u0 - 2 * INS) * u, v0 + INS + (v1 - v0 - 2 * INS) * v)


# ---------------- 材質 ----------------
B.reset(texres=512)


def leaf_material():
    m = L.flat('tree_leaf', '#ffffff', rough=0.62); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.alpha_mode = 'STRAIGHT'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # alphaMode MASK
    m.use_backface_culling = False; return m


M = {
    'leaf': leaf_material(),
    'bark_c': L.pbr('tree_bark_camphor', 'japanese_camphor_bark', tile=1.0, target='#6b5d4f', sat=0.55, maps=('diff', 'nor'), res=512, rough_value=0.9, normal=1.0),
    'bark_b': L.pbr('tree_bark_banyan', 'chinese_hackberry_bark', tile=1.0, target='#8d8a80', sat=0.35, maps=('diff', 'nor'), res=256, rough_value=0.85, normal=0.8),
    'bark_p': L.pbr('tree_bark_palm', 'palm_tree_bark', tile=1.0, target='#bcb7aa', sat=0.35, maps=('diff', 'nor'), res=256, rough_value=0.85, normal=0.8),
}
for k in ('bark_c', 'bark_b', 'bark_p'): M[k].use_backface_culling = True


# ---------------- 幾何工具（Blender 座標，Z 往上）----------------
def new_bm():
    bm = bmesh.new(); bm.loops.layers.uv.verify(); return bm


def tube(bm, pts, rads, sides, tile=1.2, urep=None, uvfn=None):
    """沿 pts 的多邊形管（rads＝每個點的半徑）。UV：u 繞一圈 urep 次（預設照周長／tile）、v＝長度／tile；
    uvfn(u01, v01) 可以改成自訂（例如大王椰子的葉鞘貼到葉片貼圖的一格）"""
    uvl = bm.loops.layers.uv.verify(); n = len(pts)
    T = [(pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized() for i in range(n)]
    Ns = [T[0].orthogonal().normalized()]
    for i in range(1, n): Ns.append((T[i - 1].rotation_difference(T[i]) @ Ns[-1]).normalized())
    rings, acc = [], [0.0]
    for i in range(1, n): acc.append(acc[-1] + (pts[i] - pts[i - 1]).length)
    for i in range(n):
        Bv = T[i].cross(Ns[i])
        rings.append([bm.verts.new(pts[i] + (Ns[i] * math.cos(2 * math.pi * s / sides) + Bv * math.sin(2 * math.pi * s / sides)) * rads[i]) for s in range(sides)])
    ur = urep or max(1, round(2 * math.pi * max(rads) / tile)); total = acc[-1] or 1.0
    for i in range(n - 1):
        for s in range(sides):
            f = bm.faces.new((rings[i][s], rings[i][(s + 1) % sides], rings[i + 1][(s + 1) % sides], rings[i + 1][s]))
            for lp, (uu, vi) in zip(f.loops, ((s, i), (s + 1, i), (s + 1, i + 1), (s, i + 1))):
                lp[uvl].uv = uvfn(uu / sides, acc[vi] / total) if uvfn else (uu / sides * ur, acc[vi] / tile)
            f.smooth = True
    return rings


def curve(p0, d0, length, n, bend=Vector((0, 0, 0)), rng=None, wob=0.0):
    """從 p0 沿 d0 長 length 的折線（n 段）；bend＝每段往這個方向偏（往上長、往下垂）；wob＝小的隨機彎曲"""
    pts = [p0.copy()]; d = d0.normalized(); step = length / n
    for i in range(n):
        d = (d + bend * (1.0 / n) + (Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1))) * wob if rng else Vector())).normalized()
        pts.append(pts[-1] + d * step)
    return pts


def ell_n(p, C, Rh, Rv):
    """橢球樹冠在 p 的外側方向（梯度）"""
    q = p - C; return Vector((q.x / (Rh * Rh), q.y / (Rh * Rh), q.z / (Rv * Rv))).normalized()


def inside(p, C, Rh, Rv, k=1.0):
    q = p - C; return (q.x * q.x + q.y * q.y) / (Rh * Rh) + q.z * q.z / (Rv * Rv) <= k * k


def pull_in(p, C, Rh, Rv, k=0.96):
    q = p - C; e = math.sqrt((q.x * q.x + q.y * q.y) / (Rh * Rh) + q.z * q.z / (Rv * Rv))
    return p if e <= k else C + q * (k / e)


class Cards:
    """葉片卡（同一個材質）：每張卡 4 個頂點、自訂法線（往樹冠外側）"""
    def __init__(self): self.bm = new_bm(); self.normals = []

    def add(self, c, n, size, rot, cell, C, Rh, Rv, w_out=0.7, aspect=1.0):
        t1 = n.orthogonal().normalized(); t1 = Matrix.Rotation(rot, 3, n) @ t1; t2 = n.cross(t1).normalized()
        uvl = self.bm.loops.layers.uv.verify(); hw, hh = size * 0.5, size * 0.5 * aspect
        corners = [c - t1 * hw - t2 * hh, c + t1 * hw - t2 * hh, c + t1 * hw + t2 * hh, c - t1 * hw + t2 * hh]
        vs = [self.bm.verts.new(p) for p in corners]; f = self.bm.faces.new(vs); f.smooth = True
        for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = cell_uv(cell, u, v)
        for p in corners: self.normals.append(((1 - w_out) * n + w_out * ell_n(p, C, Rh, Rv)).normalized())

    def strip(self, rows, cell, nfn):
        """葉片帶：rows＝[[左, 中, 右], …]（由葉基到葉尖），貼圖 u＝列內位置、v＝沿長度；nfn(p)＝頂點法線"""
        uvl = self.bm.loops.layers.uv.verify(); m = len(rows); k = len(rows[0])
        for i in range(m - 1):
            for j in range(k - 1):
                ps = (rows[i][j], rows[i][j + 1], rows[i + 1][j + 1], rows[i + 1][j])
                f = self.bm.faces.new([self.bm.verts.new(p) for p in ps]); f.smooth = True
                for lp, (jj, ii) in zip(f.loops, ((j, i), (j + 1, i), (j + 1, i + 1), (j, i + 1))): lp[uvl].uv = cell_uv(cell, jj / (k - 1), ii / (m - 1))
                for p in ps: self.normals.append(nfn(p))

    def finish(self, name, parent):
        bm = self.bm; ob = B.mesh_obj(name, bm, M['leaf'], parent)
        ob.data.normals_split_custom_set(self.normals); return ob


def bark_obj(name, bm, mat, parent):
    ob = B.mesh_obj(name, bm, mat, parent)
    for p in ob.data.polygons: p.use_smooth = True
    return ob


def tris(ob): return sum(len(p.vertices) - 2 for p in ob.data.polygons)


# ---------------- 樟樹 ----------------
def camphor(name, seed, H=12.0, cells=('camphor_a', 'camphor_b')):
    """樟樹：粗短的灰褐色樹幹在 2.6–3.1 m 分成 4–5 根往斜上長的主枝，再分出側枝；樹冠寬圓、濃密（樹冠半徑約 0.37 H）"""
    rng = random.Random(seed); s = H / 12.0; grp = B.group('tree_' + name, root)
    bm = new_bm(); C = Vector((0, 0, H * 0.6)); Rh, Rv = H * 0.38, H * 0.36
    fork = H * rng.uniform(0.22, 0.26); lean = Vector((rng.uniform(-0.08, 0.08), rng.uniform(-0.08, 0.08), 1)).normalized()
    tp = [Vector((0, 0, -0.05)), Vector((0, 0, 0.3 * s)), lean * fork * 0.55, lean * fork]
    tube(bm, tp, [0.44 * s, 0.34 * s, 0.29 * s, 0.26 * s], 10)
    anchors = []; n = rng.choice([4, 5]); top = tp[-1] - lean * 0.25 * s
    for k in range(n):
        az = k / n * 2 * math.pi + rng.uniform(-0.35, 0.35); el = math.radians(rng.uniform(46, 64))
        d = Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el)))
        pts = curve(top, d, rng.uniform(0.36, 0.44) * H, 6, bend=Vector((0, 0, 0.5)), rng=rng, wob=0.08)
        pts = pts[:2] + [pull_in(p, C, Rh, Rv, 0.9) for p in pts[2:]]   # 起點（樹幹分岔處）在樹冠底下，不能拉
        tube(bm, pts, [(0.17 - 0.1 * i / 6) * s for i in range(7)], 6)   # 2026-10-13：7→6 邊（溫州街三角形）
        anchors.append(pts[-1])
        for f in (0.45, 0.62, 0.8):
            for _ in range(rng.randint(1, 2)):
                i0 = int(f * 6); b0 = pts[i0]
                sa = az + rng.choice([-1, 1]) * rng.uniform(0.6, 1.3); se = math.radians(rng.uniform(10, 50))
                bd = Vector((math.cos(sa) * math.cos(se), math.sin(sa) * math.cos(se), math.sin(se)))
                bp = curve(b0, bd, rng.uniform(0.16, 0.26) * H, 4, bend=Vector((0, 0, 0.35)), rng=rng, wob=0.12)
                bp = bp[:1] + [pull_in(p, C, Rh, Rv, 0.93) for p in bp[1:]]
                tube(bm, [bp[0], bp[1], bp[3], bp[4]], [(0.075 - 0.016 * i) * s for i in range(4)], 4)   # 2026-10-13：側枝的管 4 段 5 邊 → 3 段 4 邊（大多在樹冠裡面；溫州街三角形）；曲線、亂數、葉叢位置照舊（遠景卡片不用重拍）
                anchors += [bp[-1], bp[2]]
    bark = bark_obj(name + '_bark', bm, M['bark_c'], grp)
    cd = Cards()
    for a in anchors:   # 枝端附近的葉叢
        for _ in range(rng.randint(2, 3)):
            c = pull_in(a + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.6, 1))) * 0.55 * s, C, Rh, Rv, 1.0)
            n_ = (ell_n(c, C, Rh, Rv) + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.5, 1))) * 0.45 + Vector((0, 0, 0.25))).normalized()
            cd.add(c, n_, CLUSTER_M * rng.uniform(0.85, 1.15) * s, rng.uniform(0, 6.28), rng.choice(cells), C, Rh, Rv)
    for i in range(130):   # 樹冠外層（底部中間留空：樹冠下面看得到枝幹）
        while True:
            d = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized()
            if d.z > -0.45: break
        r = rng.uniform(0.74, 1.0); c = C + Vector((d.x * Rh * r, d.y * Rh * r, d.z * Rv * r))
        n_ = (ell_n(c, C, Rh, Rv) + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1))) * 0.4).normalized()
        cd.add(c, n_, CLUSTER_M * rng.uniform(0.9, 1.25) * s, rng.uniform(0, 6.28), rng.choice(cells), C, Rh, Rv)
    leaf = cd.finish(name + '_leaf', grp)
    grp['h0'] = H; grp['r0'] = Rh; grp['sp'] = 'camphor'
    return grp, bark, leaf


# ---------------- 榕樹 ----------------
def banyan(name, seed, H=10.0):
    """榕樹：光滑的淺灰樹幹，基部有板根狀的隆起、2–3 根樹幹在 1–2 m 處分開，主枝往外平伸（樹冠扁、寬，半徑約 0.6 H）、
    深綠的小葉很密；主枝下垂下細細的氣根（到 2.5 m 以上就停，不擋人走）"""
    rng = random.Random(seed); s = H / 10.0; grp = B.group('tree_' + name, root)
    bm = new_bm(); C = Vector((0, 0, H * 0.62)); Rh, Rv = H * 0.58, H * 0.33
    tube(bm, [Vector((0, 0, -0.05)), Vector((0, 0, 0.5 * s)), Vector((0, 0, 1.1 * s))], [0.62 * s, 0.42 * s, 0.36 * s], 12)
    stems = []
    for k in range(3):
        az = k / 3 * 2 * math.pi + rng.uniform(-0.3, 0.3)
        d = Vector((math.cos(az) * 0.35, math.sin(az) * 0.35, 1)).normalized()
        pts = curve(Vector((0, 0, 0.9 * s)), d, rng.uniform(1.6, 2.2) * s, 3, rng=rng, wob=0.05)
        tube(bm, pts, [0.25 * s, 0.23 * s, 0.21 * s, 0.2 * s], 8); stems.append((pts[-1], az))
    anchors = []; roots_at = []
    for (top, az0) in stems:
        for j in range(2):
            az = az0 + (j - 0.5) * rng.uniform(0.7, 1.2); el = math.radians(rng.uniform(16, 34))
            d = Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el)))
            pts = curve(top, d, rng.uniform(0.45, 0.58) * H, 6, bend=Vector((0, 0, 0.25)), rng=rng, wob=0.1)
            pts = pts[:2] + [pull_in(p, C, Rh, Rv, 0.9) for p in pts[2:]]
            tube(bm, pts, [(0.15 - 0.09 * i / 6) * s for i in range(7)], 6); anchors.append(pts[-1])   # 7→6 邊
            roots_at += [pts[2], pts[3], pts[4]]
            for f in (0.4, 0.6, 0.8):
                i0 = int(f * 6); sa = az + rng.choice([-1, 1]) * rng.uniform(0.5, 1.2); se = math.radians(rng.uniform(5, 40))
                bd = Vector((math.cos(sa) * math.cos(se), math.sin(sa) * math.cos(se), math.sin(se)))
                bp = curve(pts[i0], bd, rng.uniform(0.18, 0.28) * H, 4, bend=Vector((0, 0, 0.3)), rng=rng, wob=0.12)
                bp = bp[:1] + [pull_in(p, C, Rh, Rv, 0.93) for p in bp[1:]]
                tube(bm, [bp[0], bp[1], bp[3], bp[4]], [(0.07 - 0.016 * i) * s for i in range(4)], 4); anchors += [bp[-1], bp[2]]   # 側枝的管 4 段 5 邊 → 3 段 4 邊（曲線、亂數照舊）
    bark = bark_obj(name + '_bark', bm, M['bark_b'], grp)
    cd = Cards()
    for a in anchors:
        for _ in range(rng.randint(2, 3)):
            c = pull_in(a + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.5, 0.8))) * 0.6 * s, C, Rh, Rv, 1.0)
            n_ = (ell_n(c, C, Rh, Rv) + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-0.5, 1))) * 0.45 + Vector((0, 0, 0.3))).normalized()
            cd.add(c, n_, CLUSTER_M * rng.uniform(0.9, 1.2) * s, rng.uniform(0, 6.28), 'banyan', C, Rh, Rv)
    for i in range(170):
        while True:
            d = Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1) * 0.8)).normalized()
            if d.z > -0.4: break
        r = rng.uniform(0.74, 1.0); c = C + Vector((d.x * Rh * r, d.y * Rh * r, d.z * Rv * r))
        n_ = (ell_n(c, C, Rh, Rv) + Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1))) * 0.4).normalized()
        cd.add(c, n_, CLUSTER_M * rng.uniform(0.95, 1.3) * s, rng.uniform(0, 6.28), 'banyan', C, Rh, Rv)
    # 氣根：交叉的兩片窄卡（貼圖是細根），從主枝下面垂到離地 2.5 m 以上
    rng.shuffle(roots_at)
    for p in roots_at[:12]:
        top_z = p.z - 0.1; bot_z = max(2.5, top_z - rng.uniform(1.4, 2.6) * s); ln = top_z - bot_z
        if ln < 0.8: continue
        a0 = rng.uniform(0, math.pi); w = 0.45 * s
        for a in (a0, a0 + math.pi / 2):
            dx = Vector((math.cos(a), math.sin(a), 0)) * (w / 2)
            rows = [[Vector((p.x, p.y, bot_z)) - dx, Vector((p.x, p.y, bot_z)) + dx], [Vector((p.x, p.y, top_z)) - dx, Vector((p.x, p.y, top_z)) + dx]]
            nn = Vector((math.cos(a + math.pi / 2), math.sin(a + math.pi / 2), 0.3)).normalized()
            cd.strip([[rows[0][0], rows[0][1]], [rows[1][0], rows[1][1]]], 'roots', lambda q, nn=nn: nn)
    leaf = cd.finish(name + '_leaf', grp)
    grp['h0'] = H; grp['r0'] = Rh; grp['sp'] = 'banyan'
    return grp, bark, leaf


# ---------------- 大王椰子 ----------------
def royal_palm(name, seed, H=18.0):
    """大王椰子：灰白樹幹（基部略寬、中段微鼓、往上漸細）、光滑的綠色葉鞘、15 片拱形羽狀葉＋中間一支直立新葉"""
    rng = random.Random(seed); grp = B.group('tree_' + name, root); Ht = H * 0.8; Hs = H * 0.105
    prof = [(0, 0.44), (0.25, 0.37), (0.8, 0.32), (2.0, 0.3), (4.5, 0.315), (7.5, 0.335), (10.0, 0.32), (12.2, 0.29), (Ht, 0.26)]
    bm = new_bm(); tube(bm, [Vector((0, 0, z - (0.05 if i == 0 else 0))) for i, (z, r) in enumerate(prof)], [r for z, r in prof], 12, tile=1.6, urep=2)
    bark = bark_obj(name + '_bark', bm, M['bark_p'], grp)
    cd = Cards()
    # 葉鞘（用葉片貼圖的「葉鞘」那一格）：法線就是表面法線
    sh_prof = [(Ht - 0.15, 0.255), (Ht + 0.2, 0.29), (Ht + Hs * 0.5, 0.305), (Ht + Hs * 0.85, 0.285), (Ht + Hs, 0.2), (Ht + Hs + 0.25, 0.1)]
    sbm = new_bm(); rings = tube(sbm, [Vector((0, 0, z)) for z, r in sh_prof], [r for z, r in sh_prof], 12, uvfn=lambda u, v: cell_uv('shaft', u, v))
    # 葉鞘併進葉片網格（同一個材質）
    uvl_s = sbm.loops.layers.uv.verify(); uvl = cd.bm.loops.layers.uv.verify()
    vmap = {}
    for v in sbm.verts: vmap[v] = cd.bm.verts.new(v.co)
    for f in sbm.faces:
        nf = cd.bm.faces.new([vmap[v] for v in f.verts]); nf.smooth = True
        for lp_new, lp_old in zip(nf.loops, f.loops):
            lp_new[uvl].uv = lp_old[uvl_s].uv; d = lp_old.vert.co.copy(); d.z = 0; cd.normals.append((d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))))
    sbm.free()
    top = Vector((0, 0, Ht + Hs + 0.05)); C = top + Vector((0, 0, -0.4)); nF = 15; Lf0 = H * 0.21
    for k in range(nF + 1):
        if k < nF:
            az = k / nF * 2 * math.pi + rng.uniform(-0.18, 0.18); rank = k % 3
            el = math.radians([28, 52, 8][rank] + rng.uniform(-6, 6)); Lf = Lf0 * rng.uniform(0.92, 1.06); V = math.radians(24)
        else:   # 中間直立的新葉（還沒展開，窄）
            az = rng.uniform(0, 6.28); el = math.radians(84); Lf = Lf0 * 0.55; V = math.radians(8)
        en = (el - math.radians(-10)) / math.radians(70)   # 0＝最低的老葉、1＝最挺的新葉
        droop = 0.55 + 1.0 * (1 - max(0.0, min(1.0, en)))
        d_h = Vector((math.cos(az), math.sin(az), 0)); side = Vector((-math.sin(az), math.cos(az), 0))
        nseg = 10; rows = []; rows2 = []; p = top + d_h * 0.22
        for i in range(nseg + 1):
            t = i / nseg; pitch = el - droop * t ** 1.7
            d = d_h * math.cos(pitch) + Vector((0, 0, math.sin(pitch)))
            if i > 0: p = p + d * (Lf / nseg)
            up = side.cross(d).normalized()   # 葉面朝上的方向
            wsc = 1.0 if k < nF else 0.45
            ex = lambda sgn: p + (side * (sgn * math.cos(V)) + up * math.sin(V)) * wsc
            mid = lambda sgn: p + (side * (sgn * 0.5 * math.cos(V)) + up * (0.5 * math.sin(V))) * wsc - Vector((0, 0, 0.07 * wsc))
            rows.append([p.copy(), mid(1), ex(1)]); rows2.append([p.copy(), mid(-1), ex(-1)])
        nfn = lambda q: ((q - C).normalized() * 0.55 + Vector((0, 0, 0.6))).normalized()
        cd.strip(rows, 'frond', nfn); cd.strip(rows2, 'frond', nfn)
    leaf = cd.finish(name + '_leaf', grp)
    grp['h0'] = H; grp['r0'] = Lf0 * 0.9; grp['sp'] = 'palm'
    return grp, bark, leaf


# ---------------- 建模 ----------------
root = B.group('street_trees', props={'kind': 'street_trees'})
MODELS = {}
MODELS['camphor_a'] = camphor('camphor_a', 101)
MODELS['camphor_b'] = camphor('camphor_b', 202, cells=('camphor_b', 'camphor_a'))
MODELS['banyan_a'] = banyan('banyan_a', 303)
MODELS['palm_a'] = royal_palm('palm_a', 404)
bpy.context.view_layer.update()


def bbox(objs):
    xs, ys, zs = [], [], []
    for o in objs:
        for v in o.data.vertices:
            w = o.matrix_world @ v.co; xs.append(w.x); ys.append(w.y); zs.append(w.z)
    return min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)


# ---------------- 遠景卡片：側面正交渲染 → tree_cards.png ----------------
def render_cards():
    from PIL import Image
    import tree_atlas as TA
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 32
    try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'; sc.cycles.max_bounces = 4
    sc.cycles.transparent_max_bounces = 128   # 樹冠有幾百張透明葉片卡：預設 8 次就停、光線變黑（樹冠裡面一塊一塊黑的）
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.86, 0.9, 1.0, 1); bg.inputs['Strength'].default_value = 1.6
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
    sun.data.energy = 1.1; sun.data.angle = math.radians(35); sun.rotation_euler = (math.radians(55), 0, math.radians(-20))   # 天空光為主（遊戲裡會再依太陽打光；樹冠裡面不要黑成一片）
    # 側面對著鏡頭的葉片卡變透明（和遊戲裡的葉片材質一樣），不會拉成一條一條的；渲染完還原（匯出的材質不帶這些節點）
    nt = M['leaf'].node_tree; N = nt.nodes; rd = next(n for n in N if n.type == 'MATH' and n.operation == 'ROUND'); src = rd.inputs[0].links[0].from_socket
    geo = N.new('ShaderNodeNewGeometry'); dp = N.new('ShaderNodeVectorMath'); dp.operation = 'DOT_PRODUCT'
    nt.links.new(geo.outputs['True Normal'], dp.inputs[0]); nt.links.new(geo.outputs['Incoming'], dp.inputs[1])
    ab = N.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; nt.links.new(dp.outputs['Value'], ab.inputs[0])
    mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 0.15; mr.inputs['From Max'].default_value = 0.45; mr.clamp = True; nt.links.new(ab.outputs[0], mr.inputs['Value'])
    # 門檻：側面的卡片要 alpha ≥ 0.98 才留下（mix(0.98, 0.5, t)）→ alpha − 門檻 + 0.5 再 ROUND
    th = N.new('ShaderNodeMath'); th.operation = 'MULTIPLY_ADD'; th.inputs[1].default_value = -0.48; th.inputs[2].default_value = 0.98; nt.links.new(mr.outputs['Result'], th.inputs[0])
    sb = N.new('ShaderNodeMath'); sb.operation = 'SUBTRACT'; nt.links.new(src, sb.inputs[0]); nt.links.new(th.outputs[0], sb.inputs[1])
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; ad.inputs[1].default_value = 0.5; nt.links.new(sb.outputs[0], ad.inputs[0])
    cl = N.new('ShaderNodeMath'); cl.operation = 'MAXIMUM'; cl.inputs[1].default_value = 0.0; nt.links.new(ad.outputs[0], cl.inputs[0])
    nt.links.new(cl.outputs[0], rd.inputs[0]); tmp_nodes = [geo, dp, ab, mr, th, sb, ad, cl]
    cam = bpy.data.objects.new('cardcam', bpy.data.cameras.new('cardcam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = 'ORTHO'
    tmp = os.path.join(GEN, '_atlas_tmp'); os.makedirs(tmp, exist_ok=True)
    atlas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); info = {}
    for name, (grp, bark, leaf) in MODELS.items():
        for n2, (g2, b2, l2) in MODELS.items():
            for o in (b2, l2): o.hide_render = (n2 != name)
        x0, x1, y0, y1, z0, z1 = bbox([bark, leaf]); hx = max(abs(x0), abs(x1), abs(y0), abs(y1))
        cx0, cy0, cx1, cy1 = CARD_CELL[name]; cw, ch = cx1 - cx0, cy1 - cy0
        Hc = z1 * 1.02; Wc = Hc * cw / ch   # 卡片底邊＝地面，高度涵蓋整棵樹；寬度照格子的比例
        Wc = max(Wc, 2 * hx * 1.04)
        if Wc / cw * ch > Hc: Hc = Wc / cw * ch
        cam.data.ortho_scale = max(Wc, Hc); cam.location = Vector((0, -60, Hc / 2)); cam.rotation_euler = (math.radians(90), 0, 0)
        sc.render.resolution_x, sc.render.resolution_y = cw * 2, ch * 2
        if cw != ch: cam.data.sensor_fit = 'VERTICAL' if ch > cw else 'HORIZONTAL'
        p = os.path.join(tmp, f'card_{name}.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); print('card', p, flush=True)
        im = Image.open(p).convert('RGBA').resize((cw, ch), Image.LANCZOS); atlas.paste(im, (cx0, cy0))
        info[name] = {'px': [cx0, cy0, cx1, cy1], 'w': round(Wc, 3), 'h': round(Hc, 3)}
    for o in [o for M_ in MODELS.values() for o in M_[1:]]: o.hide_render = False
    nt.links.new(src, rd.inputs[0])
    for n in tmp_nodes: N.remove(n)
    TA.bleed(atlas).save(CARDS); json.dump(info, open(CARDS[:-4] + '.json', 'w'), indent=1)
    bpy.data.objects.remove(cam); bpy.data.objects.remove(sun); return info


if '--cards' in A or not os.path.exists(CARDS) or not os.path.exists(CARDS[:-4] + '.json'): CARD_INFO = render_cards()
else: CARD_INFO = json.load(open(CARDS[:-4] + '.json'))

# 卡片：單位方塊（x∈[-0.5,0.5]、高 0–1、面向 -Y＝遊戲 +z），貼圖整張；遊戲端依每棵樹換格子、轉向鏡頭
card_mat = L.flat('tree_card', '#ffffff', rough=0.85); nt = card_mat.node_tree; N = nt.nodes; bs = N['Principled BSDF']
tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(CARDS); tx.image.alpha_mode = 'STRAIGHT'; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha']); card_mat.use_backface_culling = False
cbm = new_bm(); uvl = cbm.loops.layers.uv.verify()
vs = [cbm.verts.new(v) for v in ((-0.5, 0, 0), (0.5, 0, 0), (0.5, 0, 1), (-0.5, 0, 1))]; f = cbm.faces.new(vs)
for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
card = B.mesh_obj('tree_card', cbm, card_mat, root)
for name, (grp, bark, leaf) in MODELS.items():
    c = CARD_INFO[name]; grp['card'] = json.dumps({'px': c['px'], 'w': c['w'], 'h': c['h'], 'size': 1024})

info = {'models': {}}
for name, (grp, bark, leaf) in MODELS.items():
    info['models'][name] = {'sp': grp['sp'], 'h0': grp['h0'], 'r0': round(grp['r0'], 3), 'tris_bark': tris(bark), 'tris_leaf': tris(leaf), 'card': CARD_INFO[name]}
st = L.export(OUT, gpu_instances=False); info.update(st)
L.write_json(OUT[:-4] + '.json', info); print(json.dumps(info['models'], ensure_ascii=False))

if '--preview' in A:   # 驗收用的 Blender 渲染（匯出之後才把四款樹並排，不影響 GLB）：--preview <資料夾>
    pdir = A[A.index('--preview') + 1]; os.makedirs(pdir, exist_ok=True)
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 32; sc.cycles.max_bounces = 4; sc.cycles.transparent_max_bounces = 128
    try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    sc.render.film_transparent = False; sc.view_settings.view_transform = 'AgX'
    w = bpy.data.worlds.new('pw'); sc.world = w; w.use_nodes = True; nt = w.node_tree; sky = nt.nodes.new('ShaderNodeTexSky')
    try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(32); sky.sun_rotation = math.radians(230)
    except Exception: pass
    nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.32; sc.view_settings.exposure = -0.35
    sun = bpy.data.objects.new('psun', bpy.data.lights.new('psun', 'SUN')); sc.collection.objects.link(sun); sun.data.energy = 3.5; sun.data.angle = math.radians(3); sun.rotation_euler = (math.radians(58), 0, math.radians(-125))
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -0.01)); gp = bpy.context.active_object; gm = bpy.data.materials.new('pground'); gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.09, 0.14, 0.05, 1); gm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.95; gp.data.materials.append(gm)
    card.hide_render = True; XS = {'camphor_a': -17.0, 'camphor_b': 0.0, 'banyan_a': 18.0, 'palm_a': 34.0}
    for name, (grp, bark, leaf) in MODELS.items(): grp.location.x = XS[name]
    cam = bpy.data.objects.new('pcam', bpy.data.cameras.new('pcam')); sc.collection.objects.link(cam); sc.camera = cam
    VIEWS = [('all', (8, -46, 6), (8, 0, 8), 30, 1600, 600),                   # 四款並排（樟樹 A、樟樹 B、榕樹、大王椰子）
             ('camphor_under', (-12.5, -7.5, 1.6), (-17, 0, 5.5), 18, 960, 600),   # 站在樟樹下往上看（人的高度）
             ('banyan', (24, -14, 1.7), (18, 0, 4.5), 22, 960, 600),          # 榕樹（氣根、板根）
             ('palm_top', (40, -12, 6), (34, 0, 15.5), 35, 960, 600)]         # 大王椰子的樹冠、葉鞘
    for vname, eye, look, lens, rw, rh in VIEWS:
        cam.data.lens = lens; cam.location = Vector(eye); d = Vector(look) - Vector(eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sc.render.resolution_x, sc.render.resolution_y = rw, rh; sc.render.filepath = os.path.join(pdir, f'trees_{vname}.png'); bpy.ops.render.render(write_still=True); print('preview', sc.render.filepath, flush=True)
