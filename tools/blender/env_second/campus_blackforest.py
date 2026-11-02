"""黑森林的地面（CAMPUS-BLACKFOREST-1102；LAWWW2〔帳號 A〕2026-11-02）→ assets/models/env/second_ai/campus_blackforest.glb（校園世界座標）。
  python3 tools/blender/env_second/campus_blackforest_layout.py --write .   （先產生 src/data/blackforest_layout.js）
  /opt/blenv/bin/python tools/blender/env_second/campus_blackforest.py [-- --out …]
使用者 11-02 20:3x：「你的黑森林超奇怪的，而且裡面怎麼還會有草皮中的磁磚啊，而且你這一小塊根本就不能叫做黑森林」。
這個模型只有地面和林下（樹由遊戲放：TK.tree → street_trees.glb 的正式榕樹、樟樹，InstancedMesh）：
  - 落葉泥土地（Poly Haven CC0 forest_leaves_02，調暗、偏褐）：兩塊範圍整片，邊緣不規則（不是一刀切的長方形）；水池那一圈留空（池子、石砌池邊在遊戲裡）。
  - 土徑（Poly Haven CC0 forest_ground_04）：配置的五條；沒有地磚。
  - 榕樹的板根：每棵榕樹 5～6 片、樟樹 3 片，從樹幹往外鋪在地上（樹皮和 street_trees 的榕樹同一張）。
  - 林下：蕨類（一叢 7～9 片羽狀葉，本作畫的葉片貼圖）、矮灌木（三張交叉的葉叢卡，本作畫的 bf_shrub_card 貼圖：透明背景上的不規則葉叢；11-02 第一版用 azalea_leaves 鋪滿整張卡＝方形綠箱子）。
不擋導航（板根、灌木都很矮）；導航在遊戲那邊照配置的樹幹擋。"""
import json, math, os, random, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_blackforest.glb'
LAYOUT = ARGS[ARGS.index('--layout') + 1] if '--layout' in ARGS else os.path.join(L.ROOT, 'src', 'data', 'blackforest_layout.js')
GEN = os.path.join(HERE, 'textures', 'gen')
Y_FLOOR, Y_PATH = 0.03, 0.045


def read_layout(p):
    s = open(p, encoding='utf-8').read(); return json.loads(s[s.index('{'):s.rindex('}') + 1])


def frond_tex(path, w=128, h=512, seed=3):
    """一片羽狀葉（蕨類）：中間的葉軸、兩邊一對一對的小羽片，往葉尖越來越小；透明背景"""
    from PIL import Image, ImageDraw
    rnd = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx = w / 2; n = 26
    for i in range(n):
        t = i / (n - 1); y = h * 0.96 - t * h * 0.92; L_ = (w * 0.46) * (math.sin(math.pi * min(1.0, 0.15 + t * 0.95)) * (1 - 0.55 * t))
        for s in (-1, 1):
            g = int(rnd.uniform(70, 110)); col = (int(g * 0.42), g, int(g * 0.3), 255)
            pts = [(cx, y), (cx + s * L_ * 0.5, y - 9 - L_ * 0.12), (cx + s * L_, y - 6 - L_ * 0.2), (cx + s * L_ * 0.55, y + 2)]
            d.polygon(pts, fill=col)
    d.line([(cx, h * 0.98), (cx, h * 0.03)], fill=(70, 88, 40, 255), width=3)
    im.save(path)


def shrub_tex(path, w=256, h=256, seed=11):
    """一叢矮灌木的葉片卡（11-02 第一版用 azalea_leaves 鋪滿整張卡＝遊戲裡看起來是方形綠箱子）：
    透明背景上一個不規則的半圓形葉叢——幾百片小葉子（深綠、上緣幾片亮的），下面露幾根細枝，輪廓是一片一片葉子"""
    from PIL import Image, ImageDraw
    rnd = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(7):   # 細枝
        x0 = w * rnd.uniform(0.35, 0.65); d.line([(x0, h * 0.99), (x0 + rnd.uniform(-40, 40), h * rnd.uniform(0.55, 0.7))], fill=(58, 46, 32, 255), width=2)
    blobs = [(w * rnd.uniform(0.22, 0.78), h * rnd.uniform(0.38, 0.62), w * rnd.uniform(0.17, 0.27)) for _ in range(6)]   # 幾團葉子組成的不規則輪廓
    n = 0
    while n < 1100:
        x = rnd.uniform(0, w); y = rnd.uniform(h * 0.12, h * 0.9)
        if not any((x - bx) ** 2 + ((y - by) * 1.15) ** 2 < br * br for bx, by, br in blobs): continue
        top = 1.0 - y / h; g = rnd.uniform(48, 92) * (0.85 + 0.45 * top)
        if rnd.random() < 0.07 * (0.5 + top): g *= 1.45
        col = (int(g * 0.45), int(g), int(g * 0.32), 255)
        a = rnd.uniform(0, math.pi); L_ = rnd.uniform(5, 9); W_ = L_ * 0.42; ca, sa = math.cos(a), math.sin(a)
        d.polygon([(x - ca * L_, y - sa * L_), (x - sa * W_, y + ca * W_), (x + ca * L_, y + sa * L_), (x + sa * W_, y - ca * W_)], fill=col); n += 1
    im.save(path)


def leaf_mat(name, png, rough=0.75):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(png); tx.image.alpha_mode = 'STRAIGHT'
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # alphaMode MASK
    m.use_backface_culling = False; return m


def build():
    Lay = read_layout(LAYOUT); out = os.path.join(L.ROOT, OUT)
    for pid in ('forest_leaves_02', 'forest_ground_04', 'chinese_hackberry_bark'): L.fetch(pid)
    B.reset(texres=512)
    root = B.group('campus_blackforest', props={'kind': 'campus_blackforest'})
    fpng = os.path.join(GEN, 'bf_fern_frond.png'); frond_tex(fpng)
    spng = os.path.join(GEN, 'bf_shrub_card.png'); shrub_tex(spng)
    M = {'floor': L.pbr('bf_forest_floor', 'forest_leaves_02', tile=3.2, target='#4c4334', contrast=1.05, sat=0.8, normal=0.6, maps=('diff', 'nor'), rough_value=0.96),
         'path': L.pbr('bf_dirt_path', 'forest_ground_04', tile=2.2, target='#6a5845', contrast=0.95, sat=0.75, normal=0.5, maps=('diff', 'nor'), rough_value=0.95),
         'roots': L.pbr('bf_roots', 'chinese_hackberry_bark', tile=1.0, target='#7f7b70', sat=0.35, maps=('diff', 'nor'), res=256, rough_value=0.85, normal=0.8),
         'fern': leaf_mat('bf_fern', fpng), 'shrub': leaf_mat('bf_shrub', spng)}
    fl, pa, rt, fe, sh = (Mesh('bf_floor', M['floor'], tile=3.2), Mesh('bf_paths', M['path'], tile=2.2), Mesh('bf_roots', M['roots'], tile=1.0),
                          Mesh('bf_ferns', M['fern']), Mesh('bf_shrubs', M['shrub']))
    rnd = random.Random(1102)
    P = Lay['pond']

    def in_pond(x, z, pad):
        return ((x - P['x']) / (P['rx'] + pad)) ** 2 + ((z - P['z']) / (P['rz'] + pad)) ** 2 < 1.0

    # ---- 落葉泥土地：1 m 格；外框的頂點往外、往內亂移 0～0.5 m（邊緣不規則）；地面輕微起伏 ----
    for A in Lay['areas']:
        nx = int(round(A['x1'] - A['x0'])); nz = int(round(A['z1'] - A['z0'])); V = {}
        for i in range(nx + 1):
            for j in range(nz + 1):
                x = A['x0'] + (A['x1'] - A['x0']) * i / nx; z = A['z0'] + (A['z1'] - A['z0']) * j / nz
                edge = i in (0, nx) or j in (0, nz)
                if edge:   # 邊界往外推一點、亂一點（看起來是落葉蓋到草地上，不是一塊長方形的地毯）
                    k = rnd.uniform(-0.15, 0.55)
                    x += (-k if i == 0 else (k if i == nx else 0)); z += (-k if j == 0 else (k if j == nz else 0))
                y = Y_FLOOR + (0.0 if edge else rnd.uniform(-0.012, 0.018))
                V[(i, j)] = (x, y, z)
        for i in range(nx):
            for j in range(nz):
                cx = A['x0'] + (i + 0.5) * (A['x1'] - A['x0']) / nx; cz = A['z0'] + (j + 0.5) * (A['z1'] - A['z0']) / nz
                if in_pond(cx, cz, 0.35): continue
                q = [V[(i, j)], V[(i, j + 1)], V[(i + 1, j + 1)], V[(i + 1, j)]]
                vs = [fl.bm.verts.new(g2b(*p)) for p in q]; f = fl.bm.faces.new(vs); f.normal_update()
                if f.normal.z < 0: f.normal_flip()
    # ---- 土徑：每一段一條（寬 w），接頭補一個圓；邊緣亂一點 ----
    for p in Lay['paths']:
        w = p['w'] / 2; pts = p['pts']
        for (ax, az), (bx, bz) in zip(pts, pts[1:]):
            dx, dz = bx - ax, bz - az; ln = math.hypot(dx, dz) or 1; nx_, nz_ = -dz / ln, dx / ln; n = max(1, int(ln / 0.8))
            for k in range(n):
                t0, t1 = k / n, (k + 1) / n; w0 = w * rnd.uniform(0.92, 1.08); w1 = w * rnd.uniform(0.92, 1.08)
                x0, z0 = ax + dx * t0, az + dz * t0; x1, z1 = ax + dx * t1, az + dz * t1
                q = [(x0 - nx_ * w0, Y_PATH, z0 - nz_ * w0), (x1 - nx_ * w1, Y_PATH, z1 - nz_ * w1), (x1 + nx_ * w1, Y_PATH, z1 + nz_ * w1), (x0 + nx_ * w0, Y_PATH, z0 + nz_ * w0)]
                vs = [pa.bm.verts.new(g2b(*c)) for c in q]; f = pa.bm.faces.new(vs); f.normal_update()
                if f.normal.z < 0: f.normal_flip()
        for (jx, jz) in pts[1:-1]:
            ring = [pa.bm.verts.new(g2b(jx + w * math.cos(2 * math.pi * a / 12), Y_PATH + 0.002, jz + w * math.sin(2 * math.pi * a / 12))) for a in range(12)]
            f = pa.bm.faces.new(ring); f.normal_update()
            if f.normal.z < 0: f.normal_flip()
    # ---- 板根：從樹幹往外的楔形（高 0.3～0.45、長 0.9～1.6 m）----
    n_root = 0
    for t in Lay['trees']:
        nfin = rnd.randint(5, 6) if t['sp'] == 'banyan' else 3; r0 = t['trunk'] * 0.55
        for k in range(nfin):
            a = t['ry'] + 2 * math.pi * k / nfin + rnd.uniform(-0.25, 0.25); ln = rnd.uniform(0.9, 1.6) * (1.0 if t['sp'] == 'banyan' else 0.7)
            hh = rnd.uniform(0.3, 0.45) * (1.0 if t['sp'] == 'banyan' else 0.7); wd = rnd.uniform(0.12, 0.2)
            ca, sa = math.cos(a), math.sin(a); px, pz = -sa, ca
            x0, z0 = t['x'] + ca * r0, t['z'] + sa * r0; x1, z1 = t['x'] + ca * (r0 + ln), t['z'] + sa * (r0 + ln)
            b0 = [(x0 + px * wd, 0.0, z0 + pz * wd), (x0 - px * wd, 0.0, z0 - pz * wd)]; top0 = (x0, hh, z0); tip = (x1, 0.0, z1)
            for qd in ([b0[0], top0, tip], [top0, b0[1], tip]):
                vs = [rt.bm.verts.new(g2b(*c)) for c in qd]; rt.bm.faces.new(vs)
            n_root += 1
    # ---- 林下：蕨類一叢 7～9 片羽狀葉（彎下來的三段帶子）；矮灌木三張交叉的葉片卡 ----
    n_fern = n_shrub = 0
    for s in Lay['shrubs']:
        x, z, h, r = s['x'], s['z'], s['h'], s['r']
        if s['kind'] == 'fern':
            nf = rnd.randint(7, 9)
            for k in range(nf):
                a = s['ry'] + 2 * math.pi * k / nf + rnd.uniform(-0.2, 0.2); ca, sa = math.cos(a), math.sin(a); px, pz = -sa, ca
                Lf = r * rnd.uniform(1.0, 1.5); wf = Lf * 0.22; up = h * rnd.uniform(0.7, 1.0)
                prof = [(0.0, 0.05), (0.35, up * 0.8), (0.7, up), (1.0, up * 0.55)]   # 沿著葉子往外的 (比例, 高度)：先往上再彎下來
                vrow = []
                for (u, yy) in prof:
                    cxp, czp = x + ca * Lf * u, z + sa * Lf * u; ww = wf * (1.0 - 0.6 * u)
                    vrow.append((fe.bm.verts.new(g2b(cxp - px * ww, yy, czp - pz * ww)), fe.bm.verts.new(g2b(cxp + px * ww, yy, czp + pz * ww)), u))
                for (a0, b0_, u0), (a1, b1, u1) in zip(vrow, vrow[1:]):
                    f = fe.bm.faces.new([a0, b0_, b1, a1])
                uvl = fe.bm.loops.layers.uv.verify()
                for (va, vb, u) in vrow:
                    for f in va.link_faces:
                        for lp in f.loops:
                            if lp.vert is va: lp[uvl].uv = (0.0, u)
                            elif lp.vert is vb: lp[uvl].uv = (1.0, u)
            n_fern += 1
        else:
            for k in range(3):
                a = s['ry'] + math.pi * k / 3; ca, sa = math.cos(a), math.sin(a)
                q = [(x - ca * r, -0.02, z - sa * r), (x + ca * r, -0.02, z + sa * r), (x + ca * r, h, z + sa * r), (x - ca * r, h, z - sa * r)]
                vs = [sh.bm.verts.new(g2b(*c)) for c in q]; f = sh.bm.faces.new(vs)
                uvl = sh.bm.loops.layers.uv.verify(); fl_ = rnd.random() < 0.5   # 整張葉叢卡（bf_shrub_card），一半左右翻
                for lp, uv in zip(f.loops, [(1.0 if fl_ else 0.0, 0.0), (0.0 if fl_ else 1.0, 0.0), (0.0 if fl_ else 1.0, 1.0), (1.0 if fl_ else 0.0, 1.0)]): lp[uvl].uv = uv
            n_shrub += 1
    fl.finish(root, uv=True); pa.finish(root, uv=True); rt.finish(root, uv=True, smooth=True)
    fe.finish(root, uv=False, merge=False); sh.finish(root, uv=False, merge=False)
    info = L.export(out, gpu_instances=False)
    info['layout'] = {'stats': Lay['stats'], 'roots': n_root, 'ferns': n_fern, 'shrubs': n_shrub}
    info['note'] = '黑森林地面（CAMPUS-BLACKFOREST-1102）：落葉泥土地、土徑、板根、蕨類、矮灌木；樹由遊戲放（src/data/blackforest_layout.js）'
    L.write_json(out[:-4] + '.json', info); return info


build()
