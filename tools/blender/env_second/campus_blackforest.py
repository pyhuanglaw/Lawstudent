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
SHADE = 0.85   # 第二版（使用者 21:3x 實景照片）：林下適度遮蔭、不是全黑（BB_248 第 1 點「暗 40～50%」BB 21:35 撤回）
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
            g = int(rnd.uniform(70, 110) * SHADE); col = (int(g * 0.42), g, int(g * 0.3), 255)
            pts = [(cx, y), (cx + s * L_ * 0.5, y - 9 - L_ * 0.12), (cx + s * L_, y - 6 - L_ * 0.2), (cx + s * L_ * 0.55, y + 2)]
            d.polygon(pts, fill=col)
    d.line([(cx, h * 0.98), (cx, h * 0.03)], fill=(70, 88, 40, 255), width=3)
    im.save(path)


def shrub_tex(path, w=256, h=256, seed=11):
    """一叢矮灌木的葉片卡（11-02 第一版用 azalea_leaves 鋪滿整張卡＝方形綠箱子；第二版幾團葉子撐滿卡片寬度，交叉起來還是有幾叢看起來方方的（BB_248 第 2 點））：
    第三版：透明背景上一個「圓頂」——外輪廓是下寬上窄的半橢圓，邊緣用幾十個小圓團咬出不規則的缺口，左右兩邊不碰到卡片邊（離邊 ≥ 12%），
    上緣中間高、兩邊低；幾百片小葉子（深綠、上緣幾片亮的；林下整體壓暗 SHADE），下面露幾根細枝"""
    from PIL import Image, ImageDraw
    rnd = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(6):   # 細枝
        x0 = w * rnd.uniform(0.4, 0.6); d.line([(x0, h * 0.99), (x0 + rnd.uniform(-30, 30), h * rnd.uniform(0.6, 0.72))], fill=(40, 32, 22, 255), width=2)
    cx, base = w * 0.5, h * 0.86
    def inside(x, y):
        rx, ry = w * 0.38, h * 0.62; u = (x - cx) / rx; v = (base - y) / ry
        if v < 0 or u * u + v * v > 1.0: return False
        return True
    bites = [(cx + rnd.uniform(-0.45, 0.45) * w, base - rnd.uniform(0.2, 0.65) * h, rnd.uniform(0.04, 0.09) * w) for _ in range(14)]   # 輪廓上咬掉的缺口
    n = 0; tries = 0
    while n < 1000 and tries < 40000:
        tries += 1; x = rnd.uniform(0, w); y = rnd.uniform(0, h)
        if not inside(x, y): continue
        rr = math.hypot((x - cx) / (w * 0.38), (base - y) / (h * 0.62))
        if rr > 0.78 and any((x - bx) ** 2 + (y - by) ** 2 < br * br for bx, by, br in bites): continue
        top = 1.0 - y / h; g = rnd.uniform(48, 92) * (0.85 + 0.45 * top) * SHADE
        if rnd.random() < 0.07 * (0.5 + top): g *= 1.45
        col = (int(g * 0.45), int(g), int(g * 0.32), 255)
        a = rnd.uniform(0, math.pi); L_ = rnd.uniform(5, 9); W_ = L_ * 0.42; ca, sa = math.cos(a), math.sin(a)
        d.polygon([(x - ca * L_, y - sa * L_), (x - sa * W_, y + ca * W_), (x + ca * L_, y + sa * L_), (x + sa * W_, y - ca * W_)], fill=col); n += 1
    im.save(path)


def litter_tex(path, w=512, seed=21):
    """樹下的落葉、泥土（第二版：照片 1、3 樹冠下落葉多、樹之間是草）：Poly Haven forest_leaves_02 的顏色圖（調亮一點、偏褐）
    ＋不規則的透明洞（雜訊斑塊：洞裡露出下面的草地），邊界由模型的鋸齒圓盤決定"""
    from PIL import Image, ImageFilter, ImageEnhance
    import numpy as np
    src = os.path.join(L.tex_dir('forest_leaves_02'), 'forest_leaves_02', 'forest_leaves_02_diff_1k.jpg')
    im = Image.open(src).convert('RGB').resize((w, w)); im = ImageEnhance.Brightness(im).enhance(0.95)
    rnd = np.random.RandomState(seed); n = rnd.rand(w // 16, w // 16).astype(np.float32)
    a = Image.fromarray((n * 255).astype(np.uint8)).resize((w, w), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6))
    a = np.asarray(a).astype(np.float32) / 255.0; a = np.where(a > 0.38, 255, 0).astype(np.uint8)
    rgba = np.dstack([np.asarray(im), a]); Image.fromarray(rgba, 'RGBA').save(path)


def willow_tex(path, w=64, h=512, seed=5):
    """垂柳的一條枝（照片 4）：細的枝條從上往下，兩邊一片片細長的柳葉（淺黃綠），透明背景"""
    from PIL import Image, ImageDraw
    rnd = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); cx = w / 2
    d.line([(cx, 0), (cx + 3, h)], fill=(96, 92, 58, 255), width=2)
    for i in range(70):
        y = rnd.uniform(4, h - 6); x = cx + 3 * y / h; sgn = rnd.choice((-1, 1)); L_ = rnd.uniform(14, 24); ang = math.radians(rnd.uniform(55, 80))
        g = rnd.uniform(140, 190); col = (int(g * 0.72), int(g), int(g * 0.42), 255)
        tx, ty = x + sgn * math.sin(ang) * L_, y + math.cos(ang) * L_
        d.polygon([(x, y), (x + sgn * 2.2 + (tx - x) * 0.5, y + (ty - y) * 0.5 - 1.5), (tx, ty), (x + (tx - x) * 0.5, y + (ty - y) * 0.5 + 1.5)], fill=col)
    im.save(path)


def papyrus_tex(path, w=256, h=512, seed=8):
    """水邊的輪傘莎草（照片 5 池邊那一叢）：細長的綠莖，頂端一圈放射狀的細葉，透明背景"""
    from PIL import Image, ImageDraw
    rnd = random.Random(seed); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(9):
        bx = w * rnd.uniform(0.35, 0.65); tx = w * rnd.uniform(0.15, 0.85); ty = h * rnd.uniform(0.12, 0.45)
        d.line([(bx, h), (tx, ty)], fill=(78, 112, 52, 255), width=3)
        for j in range(14):
            a = math.radians(rnd.uniform(-170, -10)); L_ = rnd.uniform(28, 52); g = rnd.uniform(110, 160)
            d.line([(tx, ty), (tx + math.cos(a) * L_, ty + math.sin(a) * L_ * 0.6 + L_ * 0.35)], fill=(int(g * 0.55), int(g), int(g * 0.35), 255), width=2)
    im.save(path)


def pond_r(a):
    """小湖的輪廓（照片 4、5：水泥池邊彎彎的，不是正橢圓）：半徑倍數"""
    return 1.0 + 0.10 * math.sin(2 * a + 0.6) + 0.05 * math.cos(3 * a)


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
    for pid in ('leafy_grass', 'mossy_rock', 'concrete_wall_006'): L.fetch(pid)
    lpng = os.path.join(GEN, 'bf_litter_patch.png'); litter_tex(lpng)
    wpng = os.path.join(GEN, 'bf_willow_strand.png'); willow_tex(wpng)
    ppng = os.path.join(GEN, 'bf_papyrus.png'); papyrus_tex(ppng)
    M = {'floor': L.pbr('bf_grass_floor', 'leafy_grass', tile=3.0, target='#5c6340', contrast=1.05, sat=0.85, normal=0.5, maps=('diff', 'nor'), rough_value=0.95),   # 第二版：草地夾落葉（照片 1、3）
         'litter': leaf_mat('bf_litter', lpng, rough=0.95),   # 樹下的落葉、泥土（照片：樹冠下落葉多、樹之間是草）
         'path': L.pbr('bf_dirt_path', 'forest_ground_04', tile=2.2, target='#6e5c47', contrast=0.95, sat=0.75, normal=0.5, maps=('diff', 'nor'), rough_value=0.95),
         'roots': L.pbr('bf_roots', 'chinese_hackberry_bark', tile=1.0, target='#77736a', sat=0.35, maps=('diff', 'nor'), res=256, rough_value=0.85, normal=0.8),
         'rim': L.pbr('bf_pond_rim', 'concrete_wall_006', tile=1.6, target='#a9a79f', sat=0.3, maps=('diff', 'nor'), res=256, rough_value=0.85, normal=0.5),   # 小湖的水泥弧形池邊（照片 4、5）
         'water': L.flat('bf_pond_water', '#24302a', rough=0.06),
         'rock': L.pbr('bf_rock', 'mossy_rock', tile=1.0, target='#7d7a6c', maps=('diff', 'nor'), res=256, rough_value=0.9, normal=0.8),
         'wbark': L.pbr('bf_willow_bark', 'chinese_hackberry_bark', tile=1.0, target='#5d5246', sat=0.4, maps=('diff', 'nor'), res=256, rough_value=0.9, normal=0.8),
         'willow': leaf_mat('bf_willow', wpng), 'papyrus': leaf_mat('bf_papyrus', ppng),
         'fern': leaf_mat('bf_fern', fpng), 'shrub': leaf_mat('bf_shrub', spng)}
    fl, pa, rt, fe, sh = (Mesh('bf_floor', M['floor'], tile=3.0), Mesh('bf_paths', M['path'], tile=2.2), Mesh('bf_roots', M['roots'], tile=1.0),
                          Mesh('bf_ferns', M['fern']), Mesh('bf_shrubs', M['shrub']))
    li, rim, wat, rk, wb, wl, pp = (Mesh('bf_litter', M['litter']), Mesh('bf_pond_rim', M['rim'], tile=1.6), Mesh('bf_pond_water', M['water']), Mesh('bf_rocks', M['rock'], tile=1.0),
                                    Mesh('bf_willow_trunk', M['wbark'], tile=1.0), Mesh('bf_willow_leaves', M['willow']), Mesh('bf_papyrus', M['papyrus']))
    PAVED = [p for p in Lay['paths'] if p.get('kind') == 'paved']

    def on_paved(x, z, pad=0.0):
        for p in PAVED:
            for a_, b_ in zip(p['pts'], p['pts'][1:]):
                ax, az = a_; bx, bz = b_; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1e-9
                t = max(0.0, min(1.0, ((x - ax) * dx + (z - az) * dz) / L2))
                if math.hypot(x - ax - t * dx, z - az - t * dz) < p['w'] / 2 + pad: return True
        return False
    rnd = random.Random(1102)
    P = Lay['pond']

    def in_pond(x, z, pad):
        dx, dz = x - P['x'], z - P['z']; a_ = math.atan2(dz / P['rz'], dx / P['rx']); k = pond_r(a_)
        return (dx / (P['rx'] * k + pad)) ** 2 + (dz / (P['rz'] * k + pad)) ** 2 < 1.0

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
                if in_pond(cx, cz, 0.35) or on_paved(cx, cz, 0.1): continue
                q = [V[(i, j)], V[(i, j + 1)], V[(i + 1, j + 1)], V[(i + 1, j)]]
                vs = [fl.bm.verts.new(g2b(*p)) for p in q]; f = fl.bm.faces.new(vs); f.normal_update()
                if f.normal.z < 0: f.normal_flip()
    # ---- 土徑：每一段一條（寬 w），接頭補一個圓；邊緣亂一點 ----
    for p in Lay['paths']:
        if p.get('kind') == 'paved': continue   # 鋪面（兩館之間的走道、往萬才館的路）遊戲 zones3d 畫
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
            for k in range(4):
                a = s['ry'] + math.pi * k / 4 + rnd.uniform(-0.25, 0.25); ca, sa = math.cos(a), math.sin(a); r = s['r'] * rnd.uniform(0.85, 1.15)
                q = [(x - ca * r, -0.02, z - sa * r), (x + ca * r, -0.02, z + sa * r), (x + ca * r, h, z + sa * r), (x - ca * r, h, z - sa * r)]
                vs = [sh.bm.verts.new(g2b(*c)) for c in q]; f = sh.bm.faces.new(vs)
                uvl = sh.bm.loops.layers.uv.verify(); fl_ = rnd.random() < 0.5   # 整張葉叢卡（bf_shrub_card），一半左右翻
                for lp, uv in zip(f.loops, [(1.0 if fl_ else 0.0, 0.0), (0.0 if fl_ else 1.0, 0.0), (0.0 if fl_ else 1.0, 1.0), (1.0 if fl_ else 0.0, 1.0)]): lp[uvl].uv = uv
            n_shrub += 1
    # ---- 樹下的落葉、泥土（第二版）：每棵樹一個鋸齒圓盤（半徑 2.2～3.4 m），貼圖有洞、露出草地；圓盤之間是草 ----
    import bmesh
    from mathutils import Matrix
    uvl_li = li.bm.loops.layers.uv.verify(); n_lit = 0
    for i, t in enumerate(Lay['trees']):
        R = rnd.uniform(2.6, 3.4) if t['sp'] == 'banyan' else rnd.uniform(2.2, 2.8); yy = Y_FLOOR + 0.004 + 0.0006 * (i % 7); N = 18
        ring = []
        for k in range(N):
            a_ = 2 * math.pi * k / N; rr = R * rnd.uniform(0.7, 1.15); x = t['x'] + math.cos(a_) * rr; z = t['z'] + math.sin(a_) * rr
            if in_pond(x, z, 0.4) or on_paved(x, z, 0.0):   # 落葉不蓋到池子、鋪面上
                rr *= 0.45; x = t['x'] + math.cos(a_) * rr; z = t['z'] + math.sin(a_) * rr
            ring.append(li.bm.verts.new(g2b(x, yy, z)))
        f = li.bm.faces.new(ring); f.normal_update()
        if f.normal.z < 0: f.normal_flip()
        for lp in f.loops:
            co = lp.vert.co; lp[uvl_li].uv = (co.x / 4.0, co.y / 4.0)
        n_lit += 1
    # ---- 小湖（第二版，照片 4、5）：水泥弧形池邊（高出地面 0.3 m、寬 0.4 m）、深綠的水、岸邊和水裡的石頭、輪傘莎草、垂柳 ----
    N = 72; inner = []; outer = []
    for k in range(N):
        a_ = 2 * math.pi * k / N; kk = pond_r(a_); ca, sa = math.cos(a_), math.sin(a_)
        ix, iz = P['x'] + ca * P['rx'] * kk, P['z'] + sa * P['rz'] * kk
        nx_, nz_ = ca / P['rx'], sa / P['rz']; nl = math.hypot(nx_, nz_); nx_, nz_ = nx_ / nl, nz_ / nl
        inner.append((ix, iz)); outer.append((ix + nx_ * 0.4, iz + nz_ * 0.4))
    YT, YW = 0.3, 0.14
    for k in range(N):
        k2 = (k + 1) % N; (ix0, iz0), (ix1, iz1) = inner[k], inner[k2]; (ox0, oz0), (ox1, oz1) = outer[k], outer[k2]
        for q in ([(ix0, YT, iz0), (ix1, YT, iz1), (ox1, YT, oz1), (ox0, YT, oz0)],      # 池邊頂面
                  [(ox0, YT, oz0), (ox1, YT, oz1), (ox1, 0.0, oz1), (ox0, 0.0, oz0)],    # 外側（朝草地）
                  [(ix1, YT, iz1), (ix0, YT, iz0), (ix0, YW - 0.05, iz0), (ix1, YW - 0.05, iz1)]):   # 內側（朝水）
            vs = [rim.bm.verts.new(g2b(*c)) for c in q]; f = rim.bm.faces.new(vs); f.normal_update()
    wv = [wat.bm.verts.new(g2b(x, YW, z)) for (x, z) in inner]; f = wat.bm.faces.new(wv); f.normal_update()
    if f.normal.z < 0: f.normal_flip()
    def rock(x, z, r, y0=0.0):
        res = bmesh.ops.create_icosphere(rk.bm, subdivisions=1, radius=r, matrix=Matrix.Translation(g2b(x, y0 + r * 0.35, z)))
        for v in res['verts']:
            v.co.x += rnd.uniform(-0.25, 0.25) * r; v.co.y += rnd.uniform(-0.25, 0.25) * r; v.co.z = max(y0, y0 + (v.co.z - y0) * rnd.uniform(0.55, 0.8))   # Blender z＝遊戲高度：壓扁、不陷到地下
    n_rock = 0
    for k in range(9):   # 東岸、南岸的大石頭（照片 5）
        a_ = rnd.uniform(-1.4, 1.1); kk = pond_r(a_); rr = rnd.uniform(0.35, 0.7)
        rock(P['x'] + math.cos(a_) * (P['rx'] * kk + 0.6 + rr), P['z'] + math.sin(a_) * (P['rz'] * kk + 0.6 + rr), rr); n_rock += 1
    for k in range(5):   # 水裡露出來的石頭
        a_ = rnd.uniform(-1.2, 1.4); f_ = rnd.uniform(0.55, 0.85); rr = rnd.uniform(0.25, 0.45)
        rock(P['x'] + math.cos(a_) * P['rx'] * f_, P['z'] + math.sin(a_) * P['rz'] * f_, rr, YW - 0.1); n_rock += 1
    uvl_pp = pp.bm.loops.layers.uv.verify(); n_pap = 0
    for k in range(7):   # 輪傘莎草：池邊內側、東半邊
        a_ = rnd.uniform(-1.3, 1.6); f_ = rnd.uniform(0.72, 0.9); x = P['x'] + math.cos(a_) * P['rx'] * f_; z = P['z'] + math.sin(a_) * P['rz'] * f_; hh = rnd.uniform(1.1, 1.6); ww = hh * 0.55
        for j in range(3):
            b_ = rnd.uniform(0, math.pi) + j * math.pi / 3; cb, sb = math.cos(b_), math.sin(b_)
            q = [(x - cb * ww / 2, YW, z - sb * ww / 2), (x + cb * ww / 2, YW, z + sb * ww / 2), (x + cb * ww / 2, YW + hh, z + sb * ww / 2), (x - cb * ww / 2, YW + hh, z - sb * ww / 2)]
            vs = [pp.bm.verts.new(g2b(*c)) for c in q]; f = pp.bm.faces.new(vs)
            for lp, uv in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): lp[uvl_pp].uv = uv
        n_pap += 1
    # 垂柳（照片 4：池邊、走道旁）：彎一點的樹幹＋往下垂的枝條（細長的葉片卡）
    WX, WZ = P['willow']; lean = (0.7, -0.25); segs = 8; tr = []
    for k in range(segs + 1):
        t_ = k / segs; cx = WX + lean[0] * t_ * t_; cz = WZ + lean[1] * t_ * t_; y = 4.2 * t_; r = 0.22 * (1 - 0.6 * t_)
        tr.append([wb.bm.verts.new(g2b(cx + math.cos(2 * math.pi * j / 8) * r, y, cz + math.sin(2 * math.pi * j / 8) * r)) for j in range(8)])
    for k in range(segs):
        for j in range(8):
            j2 = (j + 1) % 8; wb.bm.faces.new([tr[k][j], tr[k][j2], tr[k + 1][j2], tr[k + 1][j]])
    uvl_wl = wl.bm.loops.layers.uv.verify(); n_str = 0
    CX, CZ = WX + lean[0], WZ + lean[1]
    for k in range(80):
        a_ = rnd.uniform(0, 2 * math.pi); rr = 2.6 * math.sqrt(rnd.uniform(0.05, 1.0)); top = 5.2 - 1.3 * (rr / 2.6) ** 2 + rnd.uniform(-0.2, 0.2)
        x = CX + math.cos(a_) * rr; z = CZ + math.sin(a_) * rr; ln = rnd.uniform(2.2, 3.6); bot = max(0.6, top - ln); ww = rnd.uniform(0.3, 0.45)
        b_ = rnd.uniform(0, math.pi); cb, sb = math.cos(b_), math.sin(b_); dx_, dz_ = math.cos(a_) * 0.25, math.sin(a_) * 0.25   # 下端往外飄一點
        q = [(x - cb * ww / 2 + dx_, bot, z - sb * ww / 2 + dz_), (x + cb * ww / 2 + dx_, bot, z + sb * ww / 2 + dz_), (x + cb * ww / 2, top, z + sb * ww / 2), (x - cb * ww / 2, top, z - sb * ww / 2)]
        vs = [wl.bm.verts.new(g2b(*c)) for c in q]; f = wl.bm.faces.new(vs)
        for lp, uv in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): lp[uvl_wl].uv = uv
        n_str += 1
    li.finish(root, uv=False, merge=False); rim.finish(root, uv=True); wat.finish(root, uv=False); rk.finish(root, uv=True, smooth=False)
    wb.finish(root, uv=True, smooth=True); wl.finish(root, uv=False, merge=False); pp.finish(root, uv=False, merge=False)
    fl.finish(root, uv=True); pa.finish(root, uv=True); rt.finish(root, uv=True, smooth=True)
    fe.finish(root, uv=False, merge=False); sh.finish(root, uv=False, merge=False)
    info = L.export(out, gpu_instances=False)
    info['layout'] = {'stats': Lay['stats'], 'roots': n_root, 'ferns': n_fern, 'shrubs': n_shrub, 'litter': n_lit, 'rocks': n_rock, 'papyrus': n_pap, 'willow_strands': n_str}
    info['note'] = '黑森林地面（CAMPUS-BLACKFOREST-1102）：落葉泥土地、土徑、板根、蕨類、矮灌木；樹由遊戲放（src/data/blackforest_layout.js）'
    L.write_json(out[:-4] + '.json', info); return info


build()
