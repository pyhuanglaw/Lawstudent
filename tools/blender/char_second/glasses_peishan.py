"""郭沛珊的眼鏡（D59：BB 通過的參考圖 classmate_peishan.webp、BB_109 第 2 節「圓框眼鏡（一直戴著）」、
「芷若是淺色細金屬圓框、看情境戴；沛珊是深色細圓框、一直戴著」）→ GLB。LAWWW2-B 2026-10-15；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/glasses_peishan.py [-- --out assets/models/char/second_ai/glasses_peishan.glb]
做法、座標和 glasses_zhiruo.py 完全相同（原點在兩個鏡片中心的中點、前方 −z、鏡腳往 +z；兩個鏡片中心相距 8.4 cm，給 props3d 的 attach eyes:true）；
只換：深色（近黑的深棕灰）細金屬框、圓框直徑 4.6 cm（參考圖的框比芷若的大一點、圓一點）。
網格兩個：glasses_frame（金屬）、glasses_lens（透明）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/glasses_peishan.glb')
SEP, R_RIM, WIRE = 0.084, 0.023, 0.00085          # 鏡片中心距、鏡框半徑（中心線）、金屬線半徑
SEP = float(os.environ.get('GLASSES_SEP') or SEP); R_RIM = float(os.environ.get('GLASSES_R') or R_RIM)   # 使用者 10-22「好憨」：臉的眼距改了，鏡片中心距跟著改（環境變數試尺寸，不改檔）
B.reset(texres=256)
M = {'frame': L.flat('glasses_frame', '#2e2826', rough=0.35, metal=0.30),
     'lens': L.flat('glasses_lens', '#dfe8ee', rough=0.05, alpha=0.12)}
root = B.group('glasses_peishan', props={'kind': 'prop_glasses', 'owner': 'classmate_peishan', 'ipd': SEP, 'front': '-z'})
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
    rim = [(cx + R_RIM * math.cos(2 * math.pi * k / N), R_RIM * 0.98 * math.sin(2 * math.pi * k / N), 0.0) for k in range(N)]
    tube(fr, rim, WIRE, 6, closed=True)
    # 鏡片：比鏡框中心線小一點的圓片，微微往前凸
    bm = ln.bm; c = bm.verts.new(g2b(cx, 0, -0.0012)); ring = [bm.verts.new(g2b(cx + (R_RIM - 0.0004) * math.cos(2 * math.pi * k / N), (R_RIM - 0.0004) * 0.96 * math.sin(2 * math.pi * k / N), 0.0)) for k in range(N)]
    for k in range(N): bm.faces.new((c, ring[k], ring[(k + 1) % N]))
    # 鉸鏈（鏡框外側的小方塊）＋鏡腳：往後 10 cm，最後 2.5 cm 往下彎（掛在耳朵上）
    ex = cx + s * (R_RIM + 0.0006)
    fr.box(min(ex, ex + s * 0.004), max(ex, ex + s * 0.004), 0.0035, 0.0075, -0.0010, 0.0030)
    tube(fr, [(ex + s * 0.003, 0.0055, 0.0025), (ex + s * 0.006, 0.0060, 0.030), (ex + s * 0.007, 0.0050, 0.072), (ex + s * 0.0065, 0.0005, 0.092), (ex + s * 0.005, -0.012, 0.104)], WIRE * 1.1, 6)
    # 鼻托：鏡框內側下方一個小臂＋半透明的小橢圓
    nx = cx - s * (R_RIM * 0.62); ny = -R_RIM * 0.55
    tube(fr, [(cx - s * R_RIM * 0.80, -R_RIM * 0.35, 0.0), (nx, ny, 0.004), (nx - s * 0.0012, ny - 0.0015, 0.0065)], WIRE * 0.8, 5)
    bm = ln.bm; pc = Vector((nx - s * 0.0018, ny - 0.0025, 0.0072))
    pad = [bm.verts.new(g2b(pc.x, pc.y + 0.0045 * math.sin(2 * math.pi * k / 10), pc.z + 0.0025 * math.cos(2 * math.pi * k / 10))) for k in range(10)]
    bm.faces.new(pad)
# 鼻樑：兩個鏡框內側上方之間的細拱（比鏡片中心高一點）
br = [(-SEP / 2 + R_RIM * math.cos(math.radians(32)), R_RIM * 0.98 * math.sin(math.radians(32)), 0.0)]
for k in range(1, 8):
    t = k / 8; x = br[0][0] * (1 - 2 * t); br.append((x, br[0][1] + 0.0035 * math.sin(math.pi * t), -0.0012 * math.sin(math.pi * t)))
br.append((-br[0][0], br[0][1], 0.0))
tube(fr, br, WIRE, 6)
fo = fr.finish(root, uv=False, smooth=False); L.smooth_mesh(fo, angle=1.2)
lo = ln.finish(root, uv=False, smooth=False); L.smooth_mesh(lo, angle=1.2)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in (fo, lo)}
print('glasses tris', tris, 'total', sum(tris.values()))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st['bytes'], 'ipd': SEP, 'rim_diameter': 2 * R_RIM, 'wire_d': 2 * WIRE,
                                            'origin': '兩個鏡片中心的中點；前方 −z、鏡腳往 +z（three.js 模型座標）', 'replaces': 'src/props3d.js glasses()（程式產生的版本）'})
