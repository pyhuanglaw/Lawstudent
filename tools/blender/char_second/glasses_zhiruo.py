"""林芷若的眼鏡（D59：BB 通過的參考圖 06——淺色細金屬圓框眼鏡，在 Café 工作時也戴）→ GLB。LAWWW2；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/glasses_zhiruo.py [-- --out assets/models/char/second_ai/glasses_zhiruo.glb]

現在遊戲裡的眼鏡是 src/props3d.js 的 glasses()（three.js 程式產生：深棕色 #7d6a5c、橢圓 5×3.5 cm）；這個 GLB 照參考圖改成霧面玫瑰金（淺色金屬）、圓框（直徑 4.4 cm）、
細金屬線（1.7 mm）、鼻托、鉸鏈、鏡腳（往後 10 cm、尾端往下彎掛耳朵），鏡片幾乎透明（一點點藍灰）。
第一版是淺香檳金 #d6c49c、1.5 mm：在遊戲渲染器裡比皮膚還淺，幾乎看不見（參考圖 06 的鏡框比皮膚深、比頭髮淺，偏玫瑰金／灰褐）。
座標＝props3d.js 的眼鏡座標（模型空間，three.js）：原點在兩個鏡片中心的中點、鏡片在 xy 平面、**前方是 −z**、鏡腳往 +z（後腦）。
兩個鏡片中心相距 8.4 cm（和 props3d 的 ipd 0.084 一樣：VRoid 的眼睛間距比真人寬），props3d 照眼睛骨頭的位置、骨頭縮放放上去（attach 的 eyes:true），
所以 GLB 直接取代 glasses() 回傳的 Group 就好，不用再轉 180°（舊的程式產生版本是畫成前方 +z、最後轉 π）。
網格兩個：glasses_frame（金屬）、glasses_lens（透明）。

--style wei（LAWWW2-C 2026-10-17；BB_201 第 8 節「細框眼鏡，遠景最能看出老師」）：魏教授的眼鏡——深槍灰細金屬、圓角方框（5.0 × 3.3 cm），
其他（鼻托、鉸鏈、鏡腳、鼻樑、座標）照芷若的；輸出 glasses_wei.glb。不加 --style 時輸出和原本完全一樣。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
STYLE = ARGS[ARGS.index('--style') + 1] if '--style' in ARGS else 'zhiruo'
# 鏡框形狀：超橢圓 |x/RX|^NP + |y/RY|^NP = 1（NP 2＝橢圓；越大越方）；顏色、主人
SPEC = {'zhiruo': dict(RX=0.022, RY=0.022 * 0.96, NP=2.0, col='#a68b80', owner='heroine_02'),
        'wei': dict(RX=0.025, RY=0.0165, NP=4.5, col='#3e3f44', owner='prof_wei')}[STYLE]
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/glasses_%s.glb' % STYLE)
SEP, R_RIM, WIRE = 0.084, SPEC['RX'], 0.00085      # 鏡片中心距、鏡框半寬（中心線）、金屬線半徑
RY, NP = SPEC['RY'], SPEC['NP']; RYN = RY / 0.96    # RYN：鼻托、鉸鏈的高度照原本圓框的比例（圓框時＝R_RIM）
B.reset(texres=256)
M = {'frame': L.flat('glasses_frame', SPEC['col'], rough=0.32, metal=0.45),
     'lens': L.flat('glasses_lens', '#dfe8ee', rough=0.05, alpha=0.12)}
root = B.group('glasses_' + STYLE, props={'kind': 'prop_glasses', 'owner': SPEC['owner'], 'ipd': SEP, 'front': '-z'})


def rim_pt(cx, th, k=1.0):
    """鏡框中心線上的點（th＝角度；k＝往中心縮的比例）"""
    c_, s_ = math.cos(th), math.sin(th)
    return (cx + k * R_RIM * math.copysign(abs(c_) ** (2.0 / NP), c_), k * RY * math.copysign(abs(s_) ** (2.0 / NP), s_), 0.0)
fr = Mesh('glasses_frame', M['frame']); ln = Mesh('glasses_lens', M['lens'])


def tube(mesh, pts, r, sides=6, closed=False):
    """沿折線的細管（遊戲座標＝three.js 模型座標）；closed：頭尾接起來（鏡框）"""
    P = [Vector(g2b(*p)) for p in pts]; n = len(P); rings = []
    for i in range(n):
        a = P[(i - 1) % n] if (closed or i > 0) else P[0]; b = P[(i + 1) % n] if (closed or i < n - 1) else P[-1]
        d = (b - a).normalized(); u = d.orthogonal().normalized(); v = d.cross(u).normalized()
        rings.append([mesh.bm.verts.new(P[i] + (u * math.cos(2 * math.pi * k / sides) + v * math.sin(2 * math.pi * k / sides)) * r) for k in range(sides)])
    m = n if closed else n - 1
    for i in range(m):
        A, C = rings[i], rings[(i + 1) % n]
        for k in range(sides): mesh.bm.faces.new((A[k], A[(k + 1) % sides], C[(k + 1) % sides], C[k]))
    if not closed:
        for R_, rev in ((rings[0], True), (rings[-1], False)): mesh.bm.faces.new(list(reversed(R_)) if rev else R_)


N = 40
for s in (-1, 1):
    cx = s * SEP / 2
    rim = [rim_pt(cx, 2 * math.pi * k / N) for k in range(N)]
    tube(fr, rim, WIRE, 6, closed=True)
    # 鏡片：比鏡框中心線小一點的圓片，微微往前凸
    bm = ln.bm; c = bm.verts.new(g2b(cx, 0, -0.0012)); ring = [bm.verts.new(g2b(*rim_pt(cx, 2 * math.pi * k / N, 1 - 0.0004 / R_RIM))) for k in range(N)]
    for k in range(N): bm.faces.new((c, ring[k], ring[(k + 1) % N]))
    # 鉸鏈（鏡框外側的小方塊）＋鏡腳：往後 10 cm，最後 2.5 cm 往下彎（掛在耳朵上）
    ex = cx + s * (R_RIM + 0.0006)
    fr.box(min(ex, ex + s * 0.004), max(ex, ex + s * 0.004), 0.0035, 0.0075, -0.0010, 0.0030)
    tube(fr, [(ex + s * 0.003, 0.0055, 0.0025), (ex + s * 0.006, 0.0060, 0.030), (ex + s * 0.007, 0.0050, 0.072), (ex + s * 0.0065, 0.0005, 0.092), (ex + s * 0.005, -0.012, 0.104)], WIRE * 1.1, 6)
    # 鼻托：鏡框內側下方一個小臂＋半透明的小橢圓
    nx = cx - s * (R_RIM * 0.62); ny = -RYN * 0.55
    tube(fr, [(cx - s * R_RIM * 0.80, -RYN * 0.35, 0.0), (nx, ny, 0.004), (nx - s * 0.0012, ny - 0.0015, 0.0065)], WIRE * 0.8, 5)
    bm = ln.bm; pc = Vector((nx - s * 0.0018, ny - 0.0025, 0.0072))
    pad = [bm.verts.new(g2b(pc.x, pc.y + 0.0045 * math.sin(2 * math.pi * k / 10), pc.z + 0.0025 * math.cos(2 * math.pi * k / 10))) for k in range(10)]
    bm.faces.new(pad)
# 鼻樑：兩個鏡框內側上方之間的細拱（比鏡片中心高一點）
br = [rim_pt(-SEP / 2, math.radians(32))]
for k in range(1, 8):
    t = k / 8; x = br[0][0] * (1 - 2 * t); br.append((x, br[0][1] + 0.0035 * math.sin(math.pi * t), -0.0012 * math.sin(math.pi * t)))
br.append((-br[0][0], br[0][1], 0.0))
tube(fr, br, WIRE, 6)
fo = fr.finish(root, uv=False, smooth=False); L.smooth_mesh(fo, angle=1.2)
lo = ln.finish(root, uv=False, smooth=False); L.smooth_mesh(lo, angle=1.2)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in (fo, lo)}
print('glasses tris', tris, 'total', sum(tris.values()))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st['bytes'], 'ipd': SEP, **({'rim_diameter': 2 * R_RIM} if STYLE == 'zhiruo' else {'rim_w': 2 * R_RIM, 'rim_h': 2 * RY, 'shape_power': NP}), 'wire_d': 2 * WIRE,
                                            'origin': '兩個鏡片中心的中點；前方 −z、鏡腳往 +z（three.js 模型座標）', 'replaces': 'src/props3d.js glasses()（程式產生的版本）'})
