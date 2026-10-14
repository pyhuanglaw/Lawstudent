"""許柏翰的眼鏡（D59：BB 通過的參考圖 classmate_bohan.webp——深色細金屬方框，鏡框取樣約 #322c2a）→ GLB。LAWWW2；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/char_second/glasses_bohan.py [-- --out assets/models/char/second_ai/glasses_bohan.glb]
從芷若的 glasses_zhiruo.py 複製，鏡框改成圓角方框（超橢圓 n＝4：寬 5.0 cm、高 3.1 cm）、深色（近黑的深棕）、金屬線 1.6 mm；其他（鼻托、鉸鏈、鏡腳、座標）相同：
原點＝兩個鏡片中心的中點、前方 −z、鏡腳往 +z；兩個鏡片中心相距 8.4 cm（props3d 照眼睛骨頭的位置、骨頭縮放放上去）。
接法：props3d.js 的 glasses() 用 o.glb 指定 key（C.MODEL_PROPS 給 {name:'glasses', glb:'prop.glasses_bohan'}；見 patches/glasses_zhiruo_97f4abc.patch）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'env_second'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/char/second_ai/glasses_bohan.glb')
SEP, R_RIM, WIRE = 0.084, 0.025, 0.0008
HW, HH, SQ = 0.025, 0.0155, 4.0          # 圓角方框：半寬、半高、超橢圓次數（4＝圓角方）          # 鏡片中心距、鏡框半徑（中心線）、金屬線半徑
B.reset(texres=256)
M = {'frame': L.flat('glasses_frame', '#2f2a28', rough=0.30, metal=0.45),
     'lens': L.flat('glasses_lens', '#dfe8ee', rough=0.05, alpha=0.12)}
root = B.group('glasses_bohan', props={'kind': 'prop_glasses', 'owner': 'classmate_bohan', 'ipd': SEP, 'front': '-z'})
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
    def sq(t, a, b): c, s_ = math.cos(t), math.sin(t); return (a * math.copysign(abs(c) ** (2 / SQ), c), b * math.copysign(abs(s_) ** (2 / SQ), s_))
    rim = [(cx + sq(2 * math.pi * k / N, HW, HH)[0], sq(2 * math.pi * k / N, HW, HH)[1], 0.0) for k in range(N)]
    tube(fr, rim, WIRE, 6, closed=True)
    # 鏡片：比鏡框中心線小一點的圓片，微微往前凸
    bm = ln.bm; c = bm.verts.new(g2b(cx, 0, -0.0012)); ring = [bm.verts.new(g2b(cx + sq(2 * math.pi * k / N, HW - 0.0004, HH - 0.0004)[0], sq(2 * math.pi * k / N, HW - 0.0004, HH - 0.0004)[1], 0.0)) for k in range(N)]
    for k in range(N): bm.faces.new((c, ring[k], ring[(k + 1) % N]))
    # 鉸鏈（鏡框外側的小方塊）＋鏡腳：往後 10 cm，最後 2.5 cm 往下彎（掛在耳朵上）
    ex = cx + s * (HW + 0.0006)
    fr.box(min(ex, ex + s * 0.004), max(ex, ex + s * 0.004), 0.0035, 0.0075, -0.0010, 0.0030)
    tube(fr, [(ex + s * 0.003, 0.0055, 0.0025), (ex + s * 0.006, 0.0060, 0.030), (ex + s * 0.007, 0.0050, 0.072), (ex + s * 0.0065, 0.0005, 0.092), (ex + s * 0.005, -0.012, 0.104)], WIRE * 1.1, 6)
    # 鼻托：鏡框內側下方一個小臂＋半透明的小橢圓
    nx = cx - s * (HW * 0.62); ny = -HH * 0.80
    tube(fr, [(cx - s * HW * 0.86, -HH * 0.45, 0.0), (nx, ny, 0.004), (nx - s * 0.0012, ny - 0.0015, 0.0065)], WIRE * 0.8, 5)
    bm = ln.bm; pc = Vector((nx - s * 0.0018, ny - 0.0025, 0.0072))
    pad = [bm.verts.new(g2b(pc.x, pc.y + 0.0045 * math.sin(2 * math.pi * k / 10), pc.z + 0.0025 * math.cos(2 * math.pi * k / 10))) for k in range(10)]
    bm.faces.new(pad)
# 鼻樑：兩個鏡框內側上方之間的細拱（比鏡片中心高一點）
br = [(-SEP / 2 + HW * 0.97, HH * 0.55, 0.0)]
for k in range(1, 8):
    t = k / 8; x = br[0][0] * (1 - 2 * t); br.append((x, br[0][1] + 0.0035 * math.sin(math.pi * t), -0.0012 * math.sin(math.pi * t)))
br.append((-br[0][0], br[0][1], 0.0))
tube(fr, br, WIRE, 6)
fo = fr.finish(root, uv=False, smooth=False); L.smooth_mesh(fo, angle=1.2)
lo = ln.finish(root, uv=False, smooth=False); L.smooth_mesh(lo, angle=1.2)
tris = {ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in (fo, lo)}
print('glasses tris', tris, 'total', sum(tris.values()))
st = L.export(OUT, gpu_instances=False)
L.write_json(OUT.replace('.glb', '.json'), {'glb': os.path.relpath(OUT, L.ROOT), 'tris': tris, 'bytes': st['bytes'], 'ipd': SEP, 'rim_w': 2 * HW, 'rim_h': 2 * HH, 'wire_d': 2 * WIRE,
                                            'origin': '兩個鏡片中心的中點；前方 −z、鏡腳往 +z（three.js 模型座標）', 'replaces': 'src/props3d.js glasses()（程式產生的版本）'})
