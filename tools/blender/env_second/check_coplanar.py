"""找 GLB 裡「疊在同一個平面上」的面（遊戲裡會閃爍：z-fighting）。
用法：/opt/blenv/bin/python tools/blender/env_second/check_coplanar.py -- <glb> [--min-area 0.01] [--tol 0.002] [--only 名稱片段] [--json out.json]

做法：
- 每個面（世界座標）算平面：法線取到 0.02 的精度、到原點的距離取到 tol。
- 同一個平面（法線相同或相反）裡的面兩兩比，在平面上的投影外接矩形重疊 ≥ min-area 平方公尺，就算疊面。
- 跳過共用頂點的相鄰面。
- 輸出每一對：兩個物件、材質、位置、重疊面積。最多列 200 對，依面積排序。
- 先用外接矩形篩，再算凸多邊形真正的交集面積（Sutherland–Hodgman）；facing：same＝同一面朝外（一定閃），back-to-back＝背對背（雙面材質時從兩邊看都會閃，單面材質看不到另一面就不閃）。
"""
import json, math, sys
import bpy
from mathutils import Vector

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GLB = A[0]
def opt(k, d):
    return type(d)(A[A.index(k) + 1]) if k in A else d
MIN_AREA = opt('--min-area', 0.01); TOL = opt('--tol', 0.002); ONLY = opt('--only', ''); OUT = opt('--json', '')

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
faces = []   # (key, obj, mat, verts(ws), center, normal)
for ob in bpy.context.scene.objects:
    if ob.type != 'MESH' or (ONLY and ONLY not in ob.name): continue
    me = ob.data; M = ob.matrix_world; NM = M.to_3x3().inverted().transposed()
    vs = [M @ v.co for v in me.vertices]
    for p in me.polygons:
        if p.area * (M.to_3x3().determinant() ** (2 / 3)) < MIN_AREA * 0.5: continue
        n = (NM @ p.normal).normalized()
        if n.length < 0.5: continue
        # 正規化方向（n 與 −n 視為同一個平面）
        s = 1
        for c in (n.x, n.y, n.z):
            if abs(c) > 1e-6: s = 1 if c > 0 else -1; break
        nn = n * s; P = [vs[i] for i in p.vertices]; d = nn.dot(P[0])
        key = (round(nn.x / 0.02), round(nn.y / 0.02), round(nn.z / 0.02), round(d / TOL))
        mat = me.materials[p.material_index].name if me.materials and p.material_index < len(me.materials) and me.materials[p.material_index] else ''
        faces.append((key, ob.name, mat, P, set(p.vertices), nn, d, n))
buckets = {}
for f in faces:
    k = f[0]
    for dk in (0, -1, 1):   # 距離剛好在格子邊界上的也要比到
        buckets.setdefault((k[0], k[1], k[2], k[3] + dk), []).append(f)
def clip(subj, clipper):
    """凸多邊形交集（Sutherland–Hodgman；2D 點列）"""
    def inside(p, a, b): return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= -1e-9
    def inter(p, q, a, b):
        x1, y1, x2, y2, x3, y3, x4, y4 = p[0], p[1], q[0], q[1], a[0], a[1], b[0], b[1]
        den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if abs(den) < 1e-12: return q
        t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
        return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    out = subj
    for i in range(len(clipper)):
        a, b = clipper[i], clipper[(i + 1) % len(clipper)]; inp = out; out = []
        if not inp: break
        s_ = inp[-1]
        for e in inp:
            if inside(e, a, b):
                if not inside(s_, a, b): out.append(inter(s_, e, a, b))
                out.append(e)
            elif inside(s_, a, b): out.append(inter(s_, e, a, b))
            s_ = e
    return out


def area2(P):
    return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2


def ccw(P):
    a = sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))
    return P if a > 0 else P[::-1]


pairs = {}
for k, L in buckets.items():
    if len(L) < 2: continue
    n = L[0][5]; u = n.orthogonal().normalized(); v = n.cross(u)
    box = []
    for f in L:
        xs = [u.dot(p) for p in f[3]]; ys = [v.dot(p) for p in f[3]]
        box.append((min(xs), max(xs), min(ys), max(ys)))
    for i in range(len(L)):
        for j in range(i + 1, len(L)):
            fi, fj = L[i], L[j]
            if abs(fi[6] - fj[6]) > TOL: continue
            if fi[1] == fj[1] and fi[4] & fj[4]: continue   # 同一個物件的相鄰面
            bi, bj = box[i], box[j]
            ox = min(bi[1], bj[1]) - max(bi[0], bj[0]); oy = min(bi[3], bj[3]) - max(bi[2], bj[2])
            if ox <= 0 or oy <= 0 or ox * oy < MIN_AREA: continue
            Pi = ccw([(u.dot(p), v.dot(p)) for p in fi[3]]); Pj = ccw([(u.dot(p), v.dot(p)) for p in fj[3]])
            ar = area2(clip(Pi, Pj)) if len(Pi) >= 3 and len(Pj) >= 3 else 0.0   # 真正的交集面積（面是凸的：三角形、四邊形）
            if ar < MIN_AREA: continue
            c = sum(fi[3], Vector()) / len(fi[3])
            kk = tuple(sorted([(fi[1], fi[2]), (fj[1], fj[2])])) + (round(c.x, 1), round(c.y, 1), round(c.z, 1))
            if kk not in pairs or pairs[kk]['area'] < ox * oy:
                pairs[kk] = dict(a=fi[1], amat=fi[2], b=fj[1], bmat=fj[2], at=[round(c.x, 2), round(-c.y, 2), round(c.z, 2)], area=round(ar, 3), facing='same' if fi[7].dot(fj[7]) > 0 else 'back-to-back')
res = sorted(pairs.values(), key=lambda r: -r['area'])
print('faces', len(faces), 'overlap pairs', len(res))
for r in res[:60]:
    print('  %(a)s[%(amat)s] × %(b)s[%(bmat)s]  遊戲座標≈(%(x)s)  %(area)s m²  %(facing)s' % dict(r, x='%.2f, %.2f, %.2f' % (r['at'][0], r['at'][2], r['at'][1])))
if OUT: json.dump(res[:200], open(OUT, 'w'), ensure_ascii=False, indent=1)
