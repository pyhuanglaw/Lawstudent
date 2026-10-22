"""行道樹（⑦）的葉片貼圖：在 Blender 裡用真的葉片幾何（樟樹、榕樹的葉形，一片一片沿著小枝排）擺出葉叢，
正上方正交鏡頭、透明背景、Cycles 渲染（天空光為主，葉片互相遮擋的明暗、光澤留在貼圖裡），再拼成一張 1024×1024 的貼圖：
  左上 512²：樟樹葉叢 A（卵形、先端漸尖、亮綠，有光澤）     右上 512²：榕樹葉叢（倒卵形、深綠、比較密）
  左下 512²：樟樹葉叢 B（另一組亂數、混一點黃綠的新葉）     右下：大王椰子的羽片（256×512：一側的小葉，葉軸在左邊）、
  氣根（128×512：榕樹垂下來的細根）、葉鞘（128×128：大王椰子頂端光滑的綠色葉鞘）
透明的像素先把顏色往外擴（避免縮圖、mipmap 時葉緣出現黑邊）。輸出 textures/gen/tree_leaves.png（本作程式產生，固定亂數種子）。
用法：/opt/blenv/bin/python tools/blender/env_second/tree_atlas.py [--threads N] [--samples 24]
      /opt/blenv/bin/python tools/blender/env_second/tree_atlas.py --lift-roots（只把現有貼圖的氣根那一格調亮，不重新渲染；之後要重建 street_trees.glb）"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy, bmesh   # noqa: E402
from mathutils import Vector, Matrix   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
THREADS = int(A[A.index('--threads') + 1]) if '--threads' in A else 0
SAMPLES = int(A[A.index('--samples') + 1]) if '--samples' in A else 24
OUT = os.path.join(HERE, 'textures', 'gen', 'tree_leaves.png')
TMP = os.path.join(HERE, 'textures', 'gen', '_atlas_tmp'); os.makedirs(TMP, exist_ok=True)
CLUSTER_M = 1.9   # 葉叢貼圖（512²）對應的實際大小（公尺）：street_trees.py 的葉片卡照這個比例


def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
    try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'; sc.cycles.max_bounces = 4; sc.cycles.transparent_max_bounces = 64
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.86, 0.9, 1.0, 1); bg.inputs['Strength'].default_value = 1.15
    # 柔和的頂光（偏前上方）：葉子正面亮、被上面的葉子擋住的暗一點；不要強烈的方向光（遊戲裡會再依太陽打光）
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
    sun.data.energy = 1.6; sun.data.angle = math.radians(25); sun.rotation_euler = (math.radians(18), math.radians(-12), 0)
    return sc


def vc_mat(name, rough, spec=0.5, sss=0.0):
    """頂點色（每片葉子不同的綠）＋光澤；正反面同色"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    bs = N['Principled BSDF']; at = N.new('ShaderNodeVertexColor'); at.layer_name = 'Col'
    nt.links.new(at.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = rough
    try: bs.inputs['Specular IOR Level'].default_value = spec
    except Exception: pass
    return m


def obj(name, bm, mat):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); return o


def leaf(bm, col, base, axis, side, L, W, kind, fold=0.25, curl=0.12, rot=0.0):
    """一片葉子：葉柄端在 base，沿 axis（單位向量）長 L、最寬處半寬 W；side＝葉面的側向；
    kind＝'camphor'（卵形、先端漸尖）／'banyan'（倒卵形、先端鈍）／'leaflet'（大王椰子的線形小葉）。
    fold＝沿中肋對折（邊緣抬高的比例）、curl＝沿長度往下彎、rot＝繞葉軸扭轉"""
    n = axis.cross(side).normalized(); side = n.cross(axis).normalized()
    if rot:
        q = Matrix.Rotation(rot, 3, axis); side = q @ side; n = q @ n
    NT = 7 if kind != 'leaflet' else 9
    rows = []
    for i in range(NT + 1):
        t = i / NT
        if kind == 'camphor': w = W * (math.sin(math.pi * min(1.0, t ** 0.78)) ** 0.85) * (1 - 0.25 * t ** 3)
        elif kind == 'banyan': w = W * (math.sin(math.pi * min(1.0, t ** 1.25)) ** 0.75)
        else: w = W * (math.sin(math.pi * min(1.0, 0.04 + t * 0.98)) ** 0.6)
        p = base + axis * (t * L) - n * (curl * L * t * t)
        rows.append([p - side * w + n * (fold * w), p + n * (0.02 * W), p + side * w + n * (fold * w)])
    vs = [[bm.verts.new(v) for v in r] for r in rows]
    for i in range(NT):
        for j in range(2):
            f = bm.faces.new((vs[i][j], vs[i][j + 1], vs[i + 1][j + 1], vs[i + 1][j]))
            for lp in f.loops: lp[bm.loops.layers.float_color['Col']] = (*col, 1.0)


def stem(bm, col, pts, r0, r1, sides=5):
    """細枝（多邊形管）：pts 由粗到細"""
    cl = bm.loops.layers.float_color['Col']; rings = []
    for k, p in enumerate(pts):
        t = k / (len(pts) - 1); r = r0 + (r1 - r0) * t
        d = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
        a = d.orthogonal().normalized(); b = d.cross(a)
        rings.append([bm.verts.new(p + (a * math.cos(2 * math.pi * s / sides) + b * math.sin(2 * math.pi * s / sides)) * r) for s in range(sides)])
    for ra, rb in zip(rings, rings[1:]):
        for s in range(sides):
            f = bm.faces.new((ra[s], ra[(s + 1) % sides], rb[(s + 1) % sides], rb[s]))
            for lp in f.loops: lp[cl] = (*col, 1.0)


def new_bm():
    bm = bmesh.new(); bm.loops.layers.float_color.new('Col'); return bm


def jitter_col(rng, base, dv=0.12, dh=0.04):
    k = 1 + rng.uniform(-dv, dv); y = rng.uniform(-dh, dh)
    return (base[0] * k * (1 + y * 2), base[1] * k * (1 + y), base[2] * k)


def cluster(seed, kind, size, n_twigs, leaves_per, L, W, cols, young=0.0):
    """一叢葉子（約 size×size 公尺、中心在原點、葉面大致朝 +Z）：n_twigs 根短的小枝（約 0.2–0.45 m、略彎）均勻散在圓形範圍裡、
    方向各不相同，葉片互生、枝端一小簇；整體像樹冠外層的一團枝葉（邊緣不整齊、中間不空）。貼圖可以任意旋轉使用。
    young＝新葉（黃綠）的比例"""
    rng = random.Random(seed); bm = new_bm(); R = size * 0.5
    twig_col = srgb('#6b5a3e') if kind == 'camphor' else srgb('#6f6a5c')
    for k in range(n_twigs):
        rr = math.sqrt(rng.uniform(0, 1)) * 0.72 * R; a0 = rng.uniform(0, 2 * math.pi)
        c = Vector((math.cos(a0) * rr, math.sin(a0) * rr, rng.uniform(-0.04, 0.04)))
        a = rng.uniform(0, 2 * math.pi); tl = rng.uniform(0.22, 0.42); bend = rng.uniform(-0.8, 0.8)
        start = c - Vector((math.cos(a), math.sin(a), 0)) * (tl * 0.5); pts = []
        for i in range(6):
            t = i / 5; aa = a + bend * t * 0.6
            pts.append(start + Vector((math.cos(aa), math.sin(aa), 0)) * (tl * t) + Vector((0, 0, 0.04 * math.sin(math.pi * t))))
        stem(bm, twig_col, pts, 0.006, 0.0025)
        nl = leaves_per + rng.randint(-2, 2)
        for j in range(nl):
            t = 0.08 + 0.92 * (j / max(1, nl - 1)) ** 0.85
            i0 = min(4, int(t * 5)); f = t * 5 - i0; p = pts[i0].lerp(pts[i0 + 1], f); d = (pts[i0 + 1] - pts[i0]).normalized()
            sgn = 1 if j % 2 == 0 else -1
            ang = sgn * rng.uniform(0.5, 1.3) * (1.0 - 0.35 * t)
            ax2 = (Matrix.Rotation(ang, 3, Vector((0, 0, 1))) @ d + Vector((0, 0, rng.uniform(0.05, 0.5)))).normalized()
            sd = Vector((0, 0, 1)).cross(ax2).normalized()
            ll = L * rng.uniform(0.75, 1.2) * (0.85 + 0.25 * t); ww = W * rng.uniform(0.85, 1.12) * ll / L
            cc = srgb('#a4b84a') if rng.random() < young else rng.choice(cols)
            leaf(bm, jitter_col(rng, cc), p + ax2 * 0.008, ax2, sd, ll, ww, kind, fold=rng.uniform(0.12, 0.35), curl=rng.uniform(0.05, 0.2), rot=rng.uniform(-0.7, 0.7))
        for j in range(3):   # 枝端的一小簇
            d = (pts[-1] - pts[-2]).normalized(); ax2 = (Matrix.Rotation(rng.uniform(-0.8, 0.8), 3, Vector((0, 0, 1))) @ d + Vector((0, 0, 0.3))).normalized()
            sd = Vector((0, 0, 1)).cross(ax2).normalized(); ll = L * rng.uniform(0.6, 0.9)
            cc = srgb('#a4b84a') if rng.random() < young * 2 else rng.choice(cols)
            leaf(bm, jitter_col(rng, cc), pts[-1], ax2, sd, ll, W * ll / L, kind, fold=0.25, curl=0.1, rot=rng.uniform(-0.5, 0.5))
    return bm


def palm_strip(seed):
    """大王椰子羽片的一側（長 3.6 m、寬 1.0 m 的區域；葉軸在 x=0、沿 +Y 從葉基到葉尖）：小葉線形、從葉軸斜向葉尖方向長出，
    羽狀排列在不同的平面（有的往上翹、有的平伸），長度中段最長；葉軸本身是一條黃綠色的細條"""
    rng = random.Random(seed); bm = new_bm(); Ltot = 3.6
    stem(bm, srgb('#9aa05a'), [Vector((0.012, y, 0)) for y in (0.0, 1.2, 2.4, 3.6)], 0.022, 0.008, sides=6)
    n = 96
    for i in range(n):
        t = (i + rng.uniform(-0.3, 0.3)) / n; y = 0.05 + t * (Ltot - 0.15)
        ll = 0.98 * (0.3 + 0.7 * math.sin(math.pi * min(1.0, 0.08 + t * 1.0)) ** 0.8) * rng.uniform(0.9, 1.05)
        rank = i % 3   # 三列：平伸、往上、往下（從上面看角度不同）
        ang = math.radians([52, 38, 64][rank] + rng.uniform(-5, 5))   # 和葉軸（往葉尖）的夾角
        ax = Vector((math.sin(ang), math.cos(ang), [0.0, 0.35, -0.2][rank])).normalized()
        sd = Vector((0, 0, 1)).cross(ax).normalized()
        c = rng.choice([srgb('#5f8a3c'), srgb('#6b9442'), srgb('#557f36'), srgb('#68903e')])
        leaf(bm, jitter_col(rng, c, 0.1), Vector((0.02, y, 0.01 * rank)), ax, sd, ll, 0.022, 'leaflet', fold=0.35, curl=0.18 + 0.1 * rank, rot=rng.uniform(-0.3, 0.3))
    return bm


def roots_strip(seed):
    """榕樹的氣根（寬 0.45 m、長 3 m 的區域，從上面 y=3 垂到 y=0）：細根略彎、有的分岔、末端變細"""
    rng = random.Random(seed); bm = new_bm()
    for k in range(9):
        x0 = -0.18 + 0.36 * k / 8 + rng.uniform(-0.02, 0.02); y_end = rng.uniform(0.0, 1.1); pts = []
        for i in range(12):
            t = i / 11; y = 3.0 - (3.0 - y_end) * t
            pts.append(Vector((x0 + 0.025 * math.sin(t * 7 + k) + rng.uniform(-0.004, 0.004), y, 0)))
        r0 = rng.uniform(0.006, 0.014); c = jitter_col(rng, srgb('#6e6458'), 0.15)
        stem(bm, c, pts, r0, r0 * 0.35, sides=5)
        if rng.random() < 0.5:   # 分岔
            j = rng.randint(3, 7); b0 = pts[j]; pb = [b0 + Vector((rng.uniform(-0.06, 0.06) * t, -t * rng.uniform(0.6, 1.2), 0)) for t in (0, 0.33, 0.66, 1.0)]
            stem(bm, c, pb, r0 * 0.6, r0 * 0.2, sides=4)
    return bm


def crownshaft_png(px=128):
    """葉鞘：光滑的蠟質綠色、縱向細紋（Blender 的雜訊貼圖拉長成縱紋，不是亂數斑點）"""
    sc = reset(); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=2.0)
    me = bpy.data.meshes.new('cs'); bm.to_mesh(me); bm.free()
    m = bpy.data.materials.new('cs'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (60.0, 2.0, 1.0)
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.5; nz.inputs['Detail'].default_value = 4.0
    ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].color = (*srgb('#557a38'), 1); ramp.color_ramp.elements[1].color = (*srgb('#7aa04c'), 1)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector']); nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = 0.4; me.materials.append(m)
    o = bpy.data.objects.new('cs', me); sc.collection.objects.link(o); sc.render.film_transparent = False
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 1.0; cam.location = (0, 0, 3)
    sc.render.resolution_x = sc.render.resolution_y = px * 2
    p = os.path.join(TMP, 'crownshaft.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); return p


def bleed(im, it=12):
    """透明像素的顏色往外擴（相鄰不透明像素的平均），alpha 不動：縮圖、mipmap 時葉緣不會混到黑色"""
    import numpy as np
    a = np.asarray(im).astype(np.float32); rgb = a[..., :3].copy(); al = a[..., 3] > 8; known = al.copy()
    for _ in range(it):
        acc = np.zeros_like(rgb); cnt = np.zeros(al.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            sh = np.roll(np.roll(known, dy, 0), dx, 1); acc += np.roll(np.roll(rgb, dy, 0), dx, 1) * sh[..., None]; cnt += sh
        new = (~known) & (cnt > 0); rgb[new] = acc[new] / cnt[new][:, None]; known = known | new
    rest = ~known
    if rest.any(): rgb[rest] = rgb[known].mean(axis=0)
    a[..., :3] = rgb; from PIL import Image; return Image.fromarray(a.clip(0, 255).astype('uint8'), 'RGBA')


ROOTS_BOX = (768, 512, 896, 1024)   # 氣根那一格（x0, y0, x1, y1）
ROOTS_TARGET = (212, 200, 184)       # 氣根的平均顏色（sRGB）


def lift_roots(atlas):
    """氣根那一格調亮到平均 ROOTS_TARGET（每個像素照同一個比例，明暗、分岔照舊；透明像素一起乘，擴出去的顏色跟著變）。
    原因（ART-ECON-3D-GAP-1021，巡場景 P2「榕樹氣根是黑線」）：氣根垂在樹冠下面，遊戲裡在陰影中只吃到環境光，
    原本 #6e6458 渲染出來平均約 (130,123,115)，乘上光以後畫面上是一條條黑線；真的榕樹氣根在樹蔭下是灰褐色。
    照平均色縮放：已經是目標就不變（可以重複執行）"""
    import numpy as np
    from PIL import Image
    reg = np.asarray(atlas.crop(ROOTS_BOX)).astype(np.float32); op = reg[..., 3] > 8
    if not op.any(): return atlas
    k = np.array(ROOTS_TARGET, np.float32) / np.maximum(reg[op][:, :3].mean(axis=0), 1.0)
    reg[..., :3] = np.clip(reg[..., :3] * k, 0, 255)
    atlas.paste(Image.fromarray(reg.round().astype('uint8'), 'RGBA'), ROOTS_BOX[:2]); return atlas


def main():
    from PIL import Image
    cam_cols = [srgb('#5e8a36'), srgb('#6a9640'), srgb('#557f30'), srgb('#4f772e'), srgb('#729c44')]
    ban_cols = [srgb('#3f6a2c'), srgb('#36602a'), srgb('#4a7432'), srgb('#2f5626'), srgb('#456e30')]
    jobs = [
        ('camphor_a', lambda: cluster(11, 'camphor', 1.6, 30, 10, 0.10, 0.028, cam_cols, young=0.04), 'leaf_c', 1.6, 1.6, 512, 512),
        ('banyan', lambda: cluster(23, 'banyan', 1.6, 42, 13, 0.07, 0.022, ban_cols, young=0.0), 'leaf_b', 1.6, 1.6, 512, 512),
        ('camphor_b', lambda: cluster(37, 'camphor', 1.6, 30, 10, 0.095, 0.027, cam_cols, young=0.12), 'leaf_c', 1.6, 1.6, 512, 512),
    ]
    paths = {}
    for name, fn, mname, wm, hm, pw, ph in jobs:
        sc = reset(); m = vc_mat(mname, 0.38 if 'c' in mname else 0.32); o = obj(name, fn(), m)
        cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
        cam.data.type = 'ORTHO'; cam.data.ortho_scale = CLUSTER_M; cam.location = (0, 0, 5)   # 葉叢的範圍 ±0.95 m（卡片在遊戲裡的大小以這個為準）
        sc.render.resolution_x, sc.render.resolution_y = pw * 2, ph * 2
        p = os.path.join(TMP, name + '.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); print('render', p, flush=True); paths[name] = p
    # 羽片：區域 x∈[0,1.0]、y∈[0,3.6]（鏡頭中心 (0.5,1.8)，正交寬 3.6 → 輸出 256×512 要的是 1.0×3.6 的範圍：渲染 1024×1024 再裁切）
    sc = reset(); m = vc_mat('frond', 0.45); obj('frond', palm_strip(5), m)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 3.6; cam.location = (1.8 - 0.0, 1.8, 5)   # 視野 x∈[0,3.6]、y∈[0,3.6]
    sc.render.resolution_x = sc.render.resolution_y = 2048; p = os.path.join(TMP, 'frond.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); paths['frond'] = p
    sc = reset(); m = vc_mat('roots', 0.8); obj('roots', roots_strip(9), m)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 3.0; cam.location = (0, 1.5, 5)   # 視野 x∈[-1.5,1.5]、y∈[0,3]
    sc.render.resolution_x = sc.render.resolution_y = 2048; p = os.path.join(TMP, 'roots.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); paths['roots'] = p
    paths['crownshaft'] = crownshaft_png()
    # ---- 拼貼圖 ----
    S = 1024; atlas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    def put(name, box, crop=None):
        im = Image.open(paths[name]).convert('RGBA')
        if crop: im = im.crop(crop)
        im = im.resize((box[2] - box[0], box[3] - box[1]), Image.LANCZOS); atlas.paste(im, box[:2])
    put('camphor_a', (0, 0, 512, 512)); put('banyan', (512, 0, 1024, 512)); put('camphor_b', (0, 512, 512, 1024))
    # 羽片：渲染圖 2048² 對應 x∈[0,3.6]、y∈[0,3.6]（影像上方＝y 大）；要 x∈[0,1.0]（寬 1.0/3.6）、y∈[0,3.6] 全部，葉尖朝上
    put('frond', (512, 512, 768, 1024), crop=(0, 0, int(2048 * 1.0 / 3.6), 2048))
    # 氣根：渲染圖 x∈[-1.5,1.5] 要中間 x∈[-0.225,0.225]
    c0 = int(2048 * (1.5 - 0.225) / 3.0); c1 = int(2048 * (1.5 + 0.225) / 3.0)
    put('roots', ROOTS_BOX, crop=(c0, 0, c1, 2048)); lift_roots(atlas)
    put('crownshaft', (896, 512, 1024, 640))
    atlas = bleed(atlas); atlas.save(OUT); print('atlas', OUT, flush=True)


if __name__ == '__main__':
    if '--lift-roots' in A:
        from PIL import Image
        im = Image.open(OUT).convert('RGBA'); lift_roots(im).save(OUT); print('lift roots', OUT, flush=True)
    else: main()
