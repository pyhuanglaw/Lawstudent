"""程式產生的網格（遊戲座標：x 右、y 上、+z 前）＋每個面每個角各自的 UV。給 desk_props.py 以外的新腳本共用（club_fair.py…）。
同一個平滑群組的面共用頂點（Blender 平滑著色時法線平均）；不同群組不共用（邊是硬的）。面的方向用 want（想要的法線方向）自動翻正。"""
import math
import numpy as np


def newell(ps):
    n = np.zeros(3)
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    return n


class PM:
    def __init__(self): self.v = []; self.f = []; self.uv = []

    def vid(self, p): self.v.append(np.array(p, float)); return len(self.v) - 1

    def face(self, ids, uvs, want=None):
        ids, uvs = list(ids), list(uvs)
        if want is not None and np.dot(newell([self.v[i] for i in ids]), want) < 0: ids.reverse(); uvs.reverse()
        self.f.append(ids); self.uv.append(uvs)

    def poly(self, pts, uvfn, want):
        self.face([self.vid(p) for p in pts], [uvfn(p) for p in pts], want)

    def quad2(self, pts, uvfn, want, back_uvfn=None):
        """兩面都有的薄片（布條、帆布）：正面 uvfn、背面 back_uvfn（沒有就同一個）"""
        self.poly(pts, uvfn, want); self.poly(pts, back_uvfn or uvfn, tuple(-w for w in want))

    def add(self, other, M=None):
        off = len(self.v)
        for p in other.v: self.v.append(p if M is None else M[:3, :3] @ p + M[:3, 3])
        for ids, uvs in zip(other.f, other.uv): self.f.append([i + off for i in ids]); self.uv.append(list(uvs))
        return self

    def tris(self): return sum(len(f) - 2 for f in self.f)

    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M


def Ry(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M


def Rx(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c; return M


def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M


def S(x, y, z): M = np.eye(4); M[0, 0], M[1, 1], M[2, 2] = x, y, z; return M


def frame(origin, ydir, zhint):
    """局部 y → ydir、局部 z → zhint（和 y 正交化）、局部 x＝y×z"""
    y = np.array(ydir, float); y /= np.linalg.norm(y); z = np.array(zhint, float); z -= y * np.dot(z, y); z /= np.linalg.norm(z); x = np.cross(y, z)
    M = np.eye(4); M[:3, 0], M[:3, 1], M[:3, 2], M[:3, 3] = x, y, z, origin; return M


def rr_outline(w, d, r, n):
    pts = []
    for (sx, sz, a0) in ((1, 1, 0.0), (-1, 1, 90.0), (-1, -1, 180.0), (1, -1, 270.0)):
        ccx, ccz = sx * (w / 2 - r), sz * (d / 2 - r)
        for k in range(n + 1):
            a = math.radians(a0 + 90.0 * k / n); pts.append((ccx + r * math.cos(a), ccz + r * math.sin(a)))
    return pts


def prism(pm, w, d, r, n, y0, y1, top, side, bottom, cht=0.0, chb=0.0, ch_side=None, closed_bottom=True):
    """圓角長方形的板（中心在原點）：top/bottom＝(x, z) → UV；side＝(周長比例, 高度比例) → UV；cht／chb＝上／下緣的倒角"""
    outer = rr_outline(w, d, r, n)
    def ring(pts, y): return [pm.vid((x, y, z)) for x, z in pts + [pts[0]]]
    per = [0.0]
    for i in range(1, len(outer) + 1):
        a, b = outer[i - 1], outer[i % len(outer)]; per.append(per[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    per = [p / per[-1] for p in per]
    ya, yb = y0 + chb, y1 - cht
    lo, hi = ring(outer, ya), ring(outer, yb)
    for i in range(len(outer)):
        m = (pm.v[lo[i]] + pm.v[lo[i + 1]]) / 2
        pm.face([lo[i], lo[i + 1], hi[i + 1], hi[i]], [side(per[i], 0), side(per[i + 1], 0), side(per[i + 1], 1), side(per[i], 1)], (m[0], 0, m[2]))
    cs = ch_side or side
    def chamfer(y_out, y_in, inner, up):
        a, b = ring(outer, y_out), ring(inner, y_in)
        for i in range(len(outer)):
            m = (pm.v[a[i]] + pm.v[a[i + 1]]) / 2; t = 1 if up else 0
            pm.face([a[i], a[i + 1], b[i + 1], b[i]], [cs(per[i], t), cs(per[i + 1], t), cs(per[i + 1], t), cs(per[i], t)], (m[0], 1 if up else -1, m[2]))
    if cht > 0:
        inner = rr_outline(w - 2 * cht, d - 2 * cht, max(0.0005, r - cht), n); chamfer(yb, y1, inner, True); tp = inner
    else: tp = outer
    pm.poly([(x, y1, z) for x, z in tp], lambda p: top(p[0], p[2]), (0, 1, 0))
    if closed_bottom:
        if chb > 0:
            inner = rr_outline(w - 2 * chb, d - 2 * chb, max(0.0005, r - chb), n); chamfer(ya, y0, inner, False); bp = inner
        else: bp = outer
        pm.poly([(x, y0, z) for x, z in bp], lambda p: bottom(p[0], p[2]), (0, -1, 0))
    return pm


def box(pm, x0, x1, y0, y1, z0, z1, uv, faces='tbfkrl'):
    """直角的盒子；uv：{面: (x, y, z) → UV}，面＝t 上 b 下 f 前（−z）k 後（+z）r 右（−x）l 左（+x）；'*'＝其他面"""
    P = {'t': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'k': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
         'r': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'l': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
    for k in faces:
        pts, want = P[k]; fn = uv.get(k) or uv.get('*')
        pm.poly(pts, fn, want)
    return pm


def lathe(pm, bands, n, caps=(), M=None, a0=0.0):
    """繞 y 軸：bands＝[(r0, y0, r1, y1, uvfn(角度比例, 沿著比例), want)]，want＝'out'／'up'／'down'；caps＝[(r, y, uvfn(x, z), 'up'/'down')]"""
    sub = PM()
    for (r0, y0, r1, y1, fn, want) in bands:
        ang = lambda k: a0 + 2 * math.pi * k / n
        a = [sub.vid((r0 * math.cos(ang(k)), y0, r0 * math.sin(ang(k)))) for k in range(n + 1)]
        b = [sub.vid((r1 * math.cos(ang(k)), y1, r1 * math.sin(ang(k)))) for k in range(n + 1)]
        for k in range(n):
            am = ang(k + 0.5)
            w = (math.cos(am), 0, math.sin(am)) if want == 'out' else ((0, 1, 0) if want == 'up' else (0, -1, 0))
            sub.face([a[k], a[k + 1], b[k + 1], b[k]], [fn(k / n, 0), fn((k + 1) / n, 0), fn((k + 1) / n, 1), fn(k / n, 1)], w)
    for (r, y, fn, want) in caps:
        sub.poly([(r * math.cos(a0 + 2 * math.pi * k / n), y, r * math.sin(a0 + 2 * math.pi * k / n)) for k in range(n)], lambda p, fn=fn: fn(p[0], p[2]), (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def bar(pm, p0, p1, w, h, uvfn, up=(0, 1, 0)):
    """兩點之間的方管（寬 w、高 h），四個側面（兩端不封）"""
    p0, p1 = np.array(p0, float), np.array(p1, float); d = p1 - p0; L = np.linalg.norm(d)
    hint = np.array(up, float)
    if abs(np.dot(hint, d / L)) > 0.95: hint = np.array((1.0, 0, 0))
    M = frame(p0, d / L, hint)
    sub = PM(); box(sub, -w / 2, w / 2, 0, L, -h / 2, h / 2, {'*': uvfn}, faces='fkrl')
    return pm.add(sub, M)


def to_blender(pm, name, mat, parent, B, g2b, bpy):
    """PM → Blender 物件（UV、平滑、材質）"""
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    for p in me.polygons: p.use_smooth = True
    me.validate(clean_customdata=False); me.update(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    return ob
