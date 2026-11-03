"""同弦樂器（吉他店，新生南路二樓店面）的室內 → GLB。CC（帳號 A）的建模子代理，2026-11-03（臨時支援，SCENE_RULES 第 10 節）。
Blender 5.2（bpy，無介面）：
  nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/tongxian_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
--lib：lib2.py、cafe_layout.py、plants.py 用哪一份（SCENE_RULES 第 10 節：用 claude/second-ai-env-art 上的那一份）；
  沒給的話看環境變數 TX_LIB2，再沒有就用這個 repo 的 tools/blender/env_second。
先跑 tongxian_tex.py（系統 python3）產生自製貼圖 tools/blender/env_second/textures/gen/tongxian_*.png。
配置（家具位置、大小、座位、導航阻擋）只寫在 src/data/tongxian_layout.js，這裡讀同一份。座標＝遊戲區域座標（中心在原點、x 東、z 南、店門在 +z）。
參考圖：使用者 11-03 生成的 tongxian_int.jpg（室內）、tongxian_ext.webp（外觀）。企劃：AA_619 第 1 節、2-3 節。
D77：吉他上沒有任何字或品牌標誌；店名、「弦一個月換一次」、「不賣，老闆的」都是空白的 PLATE_FACE_*，字由遊戲畫。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LIB = arg('--lib', os.environ.get('TX_LIB2', os.path.join(REPO, 'tools', 'blender', 'env_second')))
sys.path.insert(0, LIB)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

LAYALL = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'tongxian_layout.js')]))
LAY = LAYALL['shop']
OUT = os.path.abspath(os.path.join(REPO, arg('--out', LAY['glb'])))
W, D, H = LAY['w'], LAY['d'], LAY['h']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
GEN = os.path.join(REPO, 'tools', 'blender', 'env_second', 'textures', 'gen')
AT = json.load(open(os.path.join(GEN, 'tongxian_atlas.json')))
IT = {}
for it in LAY['items']: IT.setdefault(it['kind'], []).append(it)
random.seed(619)
B.reset(texres=512)
root = B.group('tongxian_interior', props={'kind': 'tongxian_interior', 'w': W, 'd': D, 'h': H, 'layout': LAYALL['version']})
P = 'tx_'


def img_mat(name, fn, rough=0.6, emit_fn=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit_fn:
        te = N.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(os.path.join(GEN, emit_fn), check_existing=True)
        nt.links.new(te.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    m['tile'] = 1.0; return m


# ---------------- 材質（12 個） ----------------
M = {
    'floor': L.pbr(P + 'floor_oak', 'laminate_floor_02', tile=1.8, target='#cfb48c', normal=0.5, maps=('diff', 'nor'), rough_value=0.5),   # 淺色木地板（D112）
    'plaster': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#eee5d4', normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.9),
    'ceil': L.flat(P + 'ceiling', '#f2ece1', rough=0.92, cull=True),   # 單面朝下
    'slat': L.pbr(P + 'slatwall', 'fine_grained_wood', tile=1.3, target='#caa77b', normal=0.35, maps=('diff', 'nor'), rough_value=0.55),
    'wood': L.pbr(P + 'wood', 'wood_table_001', tile=1.0, target='#9c6e48', normal=0.4, maps=('diff', 'nor'), rough_value=0.5),
    'guitar': img_mat(P + 'guitars', 'tongxian_guitar.png', rough=0.3),
    'props': img_mat(P + 'props', 'tongxian_props.png', rough=0.8, emit_fn='tongxian_props_emit.png'),
    'glass': L.flat(P + 'glass', '#e2eaea', rough=0.04, alpha=0.14),
    'vc': L.vc_material(P + 'vc', rough=0.6),
    'metal': L.vc_metal(P + 'metal', rough=0.42, metal=0.4),
    'emit': L.flat(P + 'lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffdcaa')),
    'leaf': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
}


def cell(atlas, name, inset=3):
    size = AT[atlas]['size']; x, y, w, h = AT[atlas]['cells'][name]
    return ((x + inset) / size, 1 - (y + h - inset) / size, (x + w - inset) / size, 1 - (y + inset) / size)


def gc(name, inset=3): return cell('guitar', name, inset)
def pc(name, inset=3): return cell('props', name, inset)
def mid(rect, k=0.25):
    u0, v0, u1, v1 = rect; cu, cv = (u0 + u1) / 2, (v0 + v1) / 2; du, dv = (u1 - u0) * k / 2, (v1 - v0) * k / 2
    return (cu - du, cv - dv, cu + du, cv + dv)


def lerp_uv(rect, a, b):
    u0, v0, u1, v1 = rect; return (u0 + (u1 - u0) * min(1, max(0, a)), v0 + (v1 - v0) * min(1, max(0, b)))


# ---------------- 網格的累積：side=None 是一般的；'front'…是會淡出的牆組 ----------------
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
_meshes = {}
UVKEYS = ('guitar', 'props')


def G(key, side=None):
    k = (side, key)
    if k not in _meshes:
        nm = (f'WALL_{side}_' if side else P) + key
        if key in ('vc', 'metal'): m = L.CMesh(nm, M[key])
        else:
            m = Mesh(nm, M[key])
            if key in UVKEYS or key in ('glass', 'emit', 'leaf'): m.bm.loops.layers.uv.new('UVMap')
        _meshes[k] = m
    return _meshes[k]


def vpaint(cm, col, fn):
    before = set(cm.bm.faces); fn(); cm.paint([f for f in cm.bm.faces if f not in before], col); return cm


def uvquad(m, pts, rect, uvs=None):
    """一個四邊形（遊戲座標，逆時針＝正面）＋貼圖集的一格"""
    uvl = m.bm.loops.layers.uv.verify(); f = m.bm.faces.new([m.bm.verts.new(g2b(*p)) for p in pts]); u0, v0, u1, v1 = rect
    for lp, t in zip(f.loops, uvs or ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    return f


def wall_quad(side, off, a0, a1, y0, y1):
    """貼在牆內面前 off 的四邊形（正面朝室內）；a＝沿牆的座標（back/front：x；left/right：z）"""
    if side == 'back': return [(a0, y0, Z0 + off), (a1, y0, Z0 + off), (a1, y1, Z0 + off), (a0, y1, Z0 + off)]
    if side == 'front': return [(a1, y0, Z1 - off), (a0, y0, Z1 - off), (a0, y1, Z1 - off), (a1, y1, Z1 - off)]
    if side == 'left': return [(X0 + off, y0, a1), (X0 + off, y0, a0), (X0 + off, y1, a0), (X0 + off, y1, a1)]
    return [(X1 - off, y0, a0), (X1 - off, y0, a1), (X1 - off, y1, a1), (X1 - off, y1, a0)]


# ---------------- 局部座標框架（吉他、斜放的東西） ----------------
class Frame:
    """局部 (u 橫, w 面朝外, v 長度方向) → Blender。origin、wdir、vdir 是遊戲座標"""
    def __init__(self, origin, wdir, vdir):
        O = g2b(*origin); Wv = g2b(*wdir).normalized(); V = g2b(*vdir); V = (V - Wv * V.dot(Wv)).normalized(); X = Wv.cross(V)
        self.M = Matrix(((X.x, Wv.x, V.x, O.x), (X.y, Wv.y, V.y, O.y), (X.z, Wv.z, V.z, O.z), (0, 0, 0, 1)))
    def b(self, u, w, v): return self.M @ Vector((u, w, v))
    def g(self, u, w, v): b = self.b(u, w, v); return (b.x, b.z, -b.y)


class Part:
    """局部座標（X＝u、Y＝w、Z＝v）的 bmesh，帶 UV"""
    def __init__(self): self.bm = bmesh.new(); self.uv = self.bm.loops.layers.uv.new('UVMap')
    def face(self, vs, uvs):
        f = self.bm.faces.new(vs)
        for lp, t in zip(f.loops, uvs): lp[self.uv].uv = t
        return f
    def into(self, mesh, frame):
        mesh.add_bm(self.bm, frame.M); self.bm.free()


def offset_ring(pts, d):
    """平面多邊形（u,v）往內縮 d（逆時針：內＝左手邊）"""
    n = len(pts); out = []
    for i in range(n):
        a, b = pts[i - 1], pts[(i + 1) % n]; tx, ty = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, ty) or 1
        nx, ny = -ty / l, tx / l; out.append((pts[i][0] + nx * d, pts[i][1] + ny * d))
    return out


def ccw(pts):
    a = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    return pts if a > 0 else list(reversed(pts))


def cr_closed(ctrl, per=2):
    n = len(ctrl); out = []
    for i in range(n):
        p0, p1, p2, p3 = ctrl[i - 1], ctrl[i], ctrl[(i + 1) % n], ctrl[(i + 2) % n]
        for k in range(per):
            t = k / per; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3) for c in (0, 1)))
    return ccw(out)


def bbox2(pts):
    us = [p[0] for p in pts]; vs = [p[1] for p in pts]; return min(us), max(us), min(vs), max(vs)


def prism(pt, poly, w0, w1, top, side, bottom=True, tilt=None, bb=None):
    """多邊形（u,v）沿 w 擠出 w0→w1；頂面照 poly 的範圍平面投影到 top 格；側面 side 格。tilt(u,w,v)→(u,w,v) 給琴頭往後仰"""
    poly = ccw(poly); n = len(poly); umin, umax, vmin, vmax = bb or bbox2(poly)
    tf = tilt or (lambda u, w, v: (u, w, v))
    lo = [pt.bm.verts.new(tf(u, w0, v)) for u, v in poly]; hi = [pt.bm.verts.new(tf(u, w1, v)) for u, v in poly]
    tuv = lambda u, v: lerp_uv(top, (u - umin) / (umax - umin + 1e-9), (v - vmin) / (vmax - vmin + 1e-9))
    fs = [pt.face(hi, [tuv(u, v) for u, v in poly])]
    if bottom: fs.append(pt.face(list(reversed(lo)), [lerp_uv(side, 0.5, 0.5)] * n))
    per = 0.0; tot = sum(math.hypot(poly[(i + 1) % n][0] - poly[i][0], poly[(i + 1) % n][1] - poly[i][1]) for i in range(n)) or 1
    for i in range(n):
        j = (i + 1) % n; s0 = per / tot; per += math.hypot(poly[j][0] - poly[i][0], poly[j][1] - poly[i][1]); s1 = per / tot
        fs.append(pt.face([lo[i], lo[j], hi[j], hi[i]], [lerp_uv(side, s0, 0), lerp_uv(side, s1, 0), lerp_uv(side, s1, 1), lerp_uv(side, s0, 1)]))
    bmesh.ops.recalc_face_normals(pt.bm, faces=fs); return fs


def lcyl(pt, a, b, r, seg, rect, caps=True, tilt=None):
    """局部座標的圓柱（a→b），所有面 UV 放在 rect 的中間（純色格）"""
    tf = tilt or (lambda u, w, v: (u, w, v))
    A, Bv = Vector(a), Vector(b); d = (Bv - A); dn = d.normalized()
    t1 = dn.cross(Vector((0, 0, 1)) if abs(dn.z) < 0.9 else Vector((1, 0, 0))).normalized(); t2 = dn.cross(t1)
    ra = [pt.bm.verts.new(tf(*(A + (t1 * math.cos(2 * math.pi * k / seg) + t2 * math.sin(2 * math.pi * k / seg)) * r))) for k in range(seg)]
    rb = [pt.bm.verts.new(tf(*(Bv + (t1 * math.cos(2 * math.pi * k / seg) + t2 * math.sin(2 * math.pi * k / seg)) * r))) for k in range(seg)]
    c = mid(rect); uvs = lambda n: [lerp_uv(c, (k % 2), (k // 2) % 2) for k in range(n)]
    fs = [pt.face([ra[k], ra[(k + 1) % seg], rb[(k + 1) % seg], rb[k]], uvs(4)) for k in range(seg)]
    if caps: fs += [pt.face(list(reversed(ra)), uvs(seg)), pt.face(rb, uvs(seg))]
    bmesh.ops.recalc_face_normals(pt.bm, faces=fs); return fs


def disc(pt, cu, cv, w, r, seg, rect):
    vs = [pt.bm.verts.new((cu + r * math.cos(2 * math.pi * k / seg), w, cv + r * math.sin(2 * math.pi * k / seg))) for k in range(seg)]
    f = pt.face(vs, [lerp_uv(rect, 0.5 + 0.5 * math.cos(2 * math.pi * k / seg), 0.5 + 0.5 * math.sin(2 * math.pi * k / seg)) for k in range(seg)])
    f.normal_update()
    if f.normal.y < 0: f.normal_flip()
    return f


def flatpoly(pt, poly, w, rect, bb=None):
    """平貼在 w 的多邊形（護板、f 孔）：只有正面"""
    poly = ccw(poly); umin, umax, vmin, vmax = bb or bbox2(poly)
    vs = [pt.bm.verts.new((u, w, v)) for u, v in poly]
    f = pt.face(vs, [lerp_uv(rect, (u - umin) / (umax - umin + 1e-9), (v - vmin) / (vmax - vmin + 1e-9)) for u, v in poly])
    f.normal_update()
    if f.normal.y < 0: f.normal_flip()
    return f


def body_shell(pt, outline, th, r, top, side, band=None):
    """琴身：外形擠出 th（背面 w＝0 貼牆），正面邊緣兩段倒角（半徑 r；木吉他的滾邊用 band 格）"""
    o = ccw(outline); n = len(o); umin, umax, vmin, vmax = bbox2(o)
    rings = [(0.0, 0.0), (th - r, 0.0), (th, r)]
    vr = []
    for (w, ins) in rings: vr.append([pt.bm.verts.new((u, w, v)) for u, v in (offset_ring(o, ins) if ins else o)])
    tuv = lambda vt: lerp_uv(top, (vt.co.x - umin) / (umax - umin), (vt.co.z - vmin) / (vmax - vmin))
    per = [0.0]
    for i in range(n): per.append(per[-1] + math.hypot(o[(i + 1) % n][0] - o[i][0], o[(i + 1) % n][1] - o[i][1]))
    fs = []
    for ri in range(2):
        a, b = vr[ri], vr[ri + 1]
        for i in range(n):
            j = (i + 1) % n; q = [a[i], a[j], b[j], b[i]]
            if ri == 0: fs.append(pt.face(q, [lerp_uv(side, per[i] / per[-1], 0), lerp_uv(side, per[i + 1] / per[-1], 0), lerp_uv(side, per[i + 1] / per[-1], 1), lerp_uv(side, per[i] / per[-1], 1)]))
            elif ri == 1 and band: fs.append(pt.face(q, [lerp_uv(band, per[i] / per[-1], 0), lerp_uv(band, per[i + 1] / per[-1], 0), lerp_uv(band, per[i + 1] / per[-1], 1), lerp_uv(band, per[i] / per[-1], 1)]))
            else: fs.append(pt.face(q, [tuv(x) for x in q]))
    fs.append(pt.face(vr[2], [tuv(x) for x in vr[2]]))
    fs.append(pt.face(list(reversed(vr[0])), [lerp_uv(side, 0.5, 0.5)] * n))
    bmesh.ops.recalc_face_normals(pt.bm, faces=fs); return fs


def neck_shaft(pt, v0, v1, hw0, hw1, wtop, depth, rect):
    """琴頸（背面圓弧的斷面，從 v0 到 v1 漸細）"""
    sec = [(-1.0, 0.0), (-0.96, -0.42), (-0.72, -0.82), (0.0, -1.0), (0.72, -0.82), (0.96, -0.42), (1.0, 0.0)]
    rA = [pt.bm.verts.new((s * hw0, wtop + t * depth, v0)) for s, t in sec]; rB = [pt.bm.verts.new((s * hw1, wtop + t * depth, v1)) for s, t in sec]
    fs = []; n = len(sec)
    for i in range(n):
        j = (i + 1) % n
        fs.append(pt.face([rA[i], rA[j], rB[j], rB[i]], [lerp_uv(rect, i / n, 0), lerp_uv(rect, (i + 1) / n, 0), lerp_uv(rect, (i + 1) / n, 1), lerp_uv(rect, i / n, 1)]))
    fs.append(pt.face(list(reversed(rA)), [lerp_uv(rect, 0.5, 0.5)] * n)); fs.append(pt.face(rB, [lerp_uv(rect, 0.5, 0.5)] * n))
    bmesh.ops.recalc_face_normals(pt.bm, faces=fs)


# ---------------- 吉他的外形 ----------------
def acoustic_outline(kind):
    """木吉他：半寬照下段、腰、上段的比例（sin 的包絡讓兩端是圓的）"""
    if kind == 'dread': keys, Wd, Lb = [(0, 1.0), (0.24, 1.0), (0.45, 0.87), (0.58, 0.75), (0.72, 0.8), (0.86, 0.77), (1.0, 0.72)], 0.398, 0.505
    else: keys, Wd, Lb = [(0, 1.0), (0.26, 1.0), (0.48, 0.74), (0.6, 0.66), (0.75, 0.77), (0.9, 0.72), (1.0, 0.6)], 0.38, 0.49
    ts = [(1 - math.cos(math.pi * s / 16)) / 2 for s in range(17)]
    def shape(t):
        for (a, fa), (b, fb) in zip(keys, keys[1:]):
            if a <= t <= b: k = (t - a) / (b - a); k = k * k * (3 - 2 * k); return fa + (fb - fa) * k
        return keys[-1][1]
    raw = [(math.sin(math.pi * t) ** 0.42) * shape(t) for t in ts]; s = (Wd / 2) / max(raw)
    right = [(raw[i] * s, ts[i] * Lb) for i in range(len(ts))]
    pts = right + [(-u, v) for u, v in reversed(right[1:-1])]
    return pts, Lb


STRAT = [(0, 0.0), (0.11, 0.015), (0.16, 0.075), (0.155, 0.15), (0.125, 0.215), (0.135, 0.29), (0.15, 0.37), (0.122, 0.43), (0.088, 0.418), (0.062, 0.36), (0.026, 0.335),
         (-0.026, 0.335), (-0.052, 0.365), (-0.082, 0.392), (-0.11, 0.372), (-0.125, 0.3), (-0.115, 0.22), (-0.15, 0.15), (-0.16, 0.075), (-0.11, 0.015)]
TELE = [(0, 0.0), (0.12, 0.012), (0.163, 0.06), (0.165, 0.17), (0.142, 0.25), (0.146, 0.31), (0.128, 0.362), (0.085, 0.388), (0.03, 0.382),
        (-0.03, 0.336), (-0.065, 0.302), (-0.105, 0.272), (-0.142, 0.22), (-0.165, 0.15), (-0.163, 0.06), (-0.12, 0.012)]
_esr = [(0.13, 0.012), (0.195, 0.07), (0.205, 0.16), (0.176, 0.245), (0.182, 0.31), (0.172, 0.385), (0.138, 0.44), (0.098, 0.448), (0.07, 0.418), (0.046, 0.4), (0.028, 0.395)]
ES = [(0, 0.0)] + _esr + [(-u, v) for u, v in reversed(_esr)]
PG_STRAT = [(-0.115, 0.16), (-0.09, 0.09), (-0.03, 0.072), (0.03, 0.088), (0.062, 0.13), (0.078, 0.2), (0.112, 0.262), (0.097, 0.312), (0.04, 0.334), (-0.036, 0.334), (-0.072, 0.3), (-0.102, 0.232)]
PG_TELE = [(-0.024, 0.2), (0.025, 0.19), (0.065, 0.205), (0.102, 0.25), (0.12, 0.31), (0.1, 0.36), (0.03, 0.372), (-0.03, 0.338), (-0.07, 0.305), (-0.092, 0.265)]
PG_ES = [(-0.035, 0.31), (-0.06, 0.27), (-0.12, 0.25), (-0.15, 0.3), (-0.13, 0.36), (-0.07, 0.38)]
PG_AC = [(-0.05, 0.32), (-0.075, 0.27), (-0.12, 0.27), (-0.15, 0.31), (-0.145, 0.38), (-0.11, 0.43), (-0.065, 0.42)]
HEAD_AC = [(-0.026, 0.0), (0.026, 0.0), (0.04, 0.05), (0.045, 0.16), (0.036, 0.186), (0.0, 0.19), (-0.036, 0.186), (-0.045, 0.16), (-0.04, 0.05)]
HEAD_ES = [(-0.024, 0.0), (0.024, 0.0), (0.045, 0.06), (0.05, 0.15), (0.036, 0.186), (0.0, 0.172), (-0.036, 0.186), (-0.05, 0.15), (-0.045, 0.06)]
HEAD_STRAT = [(-0.021, 0.0), (0.021, 0.0), (0.03, 0.03), (0.042, 0.09), (0.047, 0.15), (0.034, 0.19), (0.008, 0.196), (-0.01, 0.18), (-0.02, 0.12), (-0.025, 0.05)]
HEAD_TELE = [(-0.021, 0.0), (0.021, 0.0), (0.024, 0.04), (0.036, 0.1), (0.04, 0.17), (0.026, 0.188), (0.004, 0.19), (-0.014, 0.17), (-0.02, 0.1), (-0.023, 0.04)]
OUTLINES = {}


def outline(name):
    if name not in OUTLINES:
        if name in ('dread', 'om'): OUTLINES[name] = acoustic_outline(name)[0]
        else: OUTLINES[name] = cr_closed({'S': STRAT, 'T': TELE, 'E': ES}[name], per=2)
    return OUTLINES[name]


FBL = 0.44   # 指板長（琴枕→末端），和貼圖的琴格位置一致


def build_guitar(pt, g):
    """g：dict（kind＝'ac'|'S'|'T'|'E'、各部位的貼圖格）。回傳 (琴枕的 v, 琴頸頂面的 w)"""
    k = g['kind']; hw_col = g.get('hw', 'chrome')
    if k == 'ac':
        o = outline(g.get('shape', 'dread')); Lb = max(v for _, v in o); th = 0.105
        body_shell(pt, o, th, 0.008, gc(g['top']), gc(g['side']), gc('binding'))
        vb, vnut = 0.21, 0.855; wfb = th + 0.006; wtop = wfb + 0.006
        disc(pt, 0.0, 0.365, th + 0.0008, 0.075, 20, gc('rosette', 1))   # 音孔＋花紋
        flatpoly(pt, cr_closed(PG_AC, 2), th + 0.0022, gc(g.get('pg', 'pg_tort')))
        prism(pt, [(-0.075, vb - 0.02), (0.075, vb - 0.02), (0.08, vb + 0.0), (0.075, vb + 0.018), (-0.075, vb + 0.018), (-0.08, vb)], th, th + 0.009, gc('ebony'), gc('ebony'))   # 琴橋
        prism(pt, [(-0.036, vb + 0.002), (0.036, vb - 0.002), (0.036, vb + 0.002), (-0.036, vb + 0.006)], th + 0.009, th + 0.013, gc('bone'), gc('bone'))   # 下弦枕
        sb, wsb = 0.0105, th + 0.013
        neck_shaft(pt, Lb - 0.03, vnut, 0.028, 0.0215, wfb, 0.026, gc(g.get('neck', 'neck_mahog')))
        prism(pt, [(-0.028, vnut - FBL), (0.028, vnut - FBL), (0.0215, vnut), (-0.0215, vnut)], wfb, wtop, gc(g.get('fb', 'fb_rose'), 1), gc('ebony'))
        head, tilt_a, hcell = HEAD_AC, math.radians(13), g.get('head', 'head_black')
    else:
        o = outline(k); th = 0.045
        body_shell(pt, o, th, 0.011 if k != 'E' else 0.006, gc(g['fin']), gc(g['fin']), gc('binding') if k == 'E' else None)
        if k == 'S':
            vb, vnut = 0.095, 0.743; flatpoly(pt, cr_closed(PG_STRAT, 2), th + 0.0015, gc(g.get('pg', 'pg_white')))
            for pv in (0.125, 0.205, 0.272): prism(pt, [(-0.036, pv - 0.009), (0.036, pv - 0.009), (0.036, pv + 0.009), (-0.036, pv + 0.009)], th + 0.0015, th + 0.011, gc(g.get('pu', 'pu_cream')), gc(g.get('pu', 'pu_cream')))
            prism(pt, [(-0.04, vb - 0.035), (0.04, vb - 0.035), (0.04, vb + 0.012), (-0.04, vb + 0.012)], th + 0.0015, th + 0.008, gc(hw_col), gc(hw_col))
            for (ku, kv) in ((-0.09, 0.13), (-0.105, 0.09), (-0.112, 0.05)): lcyl(pt, (ku, th + 0.0015, kv), (ku, th + 0.016, kv), 0.011, 7, gc(g.get('knob', 'pg_white')))
            head, tilt_a, hcell = HEAD_STRAT, 0.0, g.get('head', 'neck_maple')
        elif k == 'T':
            vb, vnut = 0.095, 0.743; flatpoly(pt, cr_closed(PG_TELE, 2), th + 0.0015, gc(g.get('pg', 'pg_black')))
            prism(pt, [(-0.045, 0.05), (0.045, 0.05), (0.045, 0.145), (-0.045, 0.145)], th, th + 0.004, gc(hw_col), gc(hw_col))   # 琴橋板
            prism(pt, [(-0.032, 0.12), (0.032, 0.11), (0.032, 0.132), (-0.032, 0.142)], th + 0.004, th + 0.014, gc('pu_black'), gc('pu_black'))
            prism(pt, [(-0.034, 0.29), (0.034, 0.29), (0.034, 0.31), (-0.034, 0.31)], th + 0.0015, th + 0.01, gc(hw_col), gc(hw_col))
            prism(pt, [(-0.12, 0.06), (-0.095, 0.06), (-0.08, 0.2), (-0.105, 0.2)], th, th + 0.003, gc(hw_col), gc(hw_col))   # 控制板
            for kv in (0.1, 0.15): lcyl(pt, (-0.1, th + 0.003, kv), (-0.1, th + 0.017, kv), 0.01, 7, gc(hw_col))
            head, tilt_a, hcell = HEAD_TELE, 0.0, g.get('head', 'neck_maple')
        else:
            vb, vnut = 0.14, 0.768
            for s in (-1, 1):   # f 孔
                fh = [(s * 0.105, 0.17), (s * 0.118, 0.21), (s * 0.112, 0.27), (s * 0.122, 0.33), (s * 0.112, 0.335), (s * 0.101, 0.27), (s * 0.107, 0.21), (s * 0.095, 0.175)]
                flatpoly(pt, fh, th + 0.0008, gc('hole'))
            flatpoly(pt, cr_closed(PG_ES, 2), th + 0.0022, gc(g.get('pg', 'pg_black')))
            for pv in (0.18, 0.3): prism(pt, [(-0.036, pv - 0.019), (0.036, pv - 0.019), (0.036, pv + 0.019), (-0.036, pv + 0.019)], th, th + 0.012, gc('pu_hb'), gc(hw_col))
            prism(pt, [(-0.04, vb - 0.006), (0.04, vb - 0.006), (0.04, vb + 0.006), (-0.04, vb + 0.006)], th, th + 0.016, gc(hw_col), gc(hw_col))
            prism(pt, [(-0.042, 0.06), (0.042, 0.06), (0.042, 0.075), (-0.042, 0.075)], th, th + 0.013, gc(hw_col), gc(hw_col))   # 尾擋
            for (ku, kv) in ((-0.1, 0.1), (-0.13, 0.13), (-0.1, 0.06), (-0.135, 0.075)): lcyl(pt, (ku, th, kv), (ku, th + 0.017, kv), 0.011, 7, gc('hw_black' if hw_col == 'chrome' else 'gold'))
            head, tilt_a, hcell = HEAD_ES, math.radians(13), g.get('head', 'head_black')
        wfb = th + 0.012; wtop = wfb + 0.006; sb, wsb = 0.0105, th + 0.012 + (0.004 if k == 'E' else 0.0)
        jv = {'S': 0.31, 'T': 0.32, 'E': 0.4}[k]
        neck_shaft(pt, jv, vnut, 0.0285, 0.021, wfb, 0.022, gc(g.get('neck', 'neck_maple')))
        prism(pt, [(-0.0285, vnut - FBL), (0.0285, vnut - FBL), (0.021, vnut), (-0.021, vnut)], wfb, wtop, gc(g.get('fb', 'fb_rose'), 1), gc(g.get('neck', 'neck_maple')))
    # 琴枕、琴頭、弦鈕
    prism(pt, [(-0.022, vnut - 0.004), (0.022, vnut - 0.004), (0.022, vnut + 0.002), (-0.022, vnut + 0.002)], wtop - 0.004, wtop + 0.003, gc('bone'), gc('bone'))
    hb = wtop - 0.003 - (0.0 if tilt_a else 0.004)
    def tilt(u, w, v):
        dv = v - vnut
        if dv <= 0 or not tilt_a: return (u, w, v)
        return (u, w - dv * math.sin(tilt_a), vnut + dv * math.cos(tilt_a))
    prism(pt, [(u, v + vnut + 0.002) for u, v in head], hb - 0.015, hb, gc(hcell), gc(hcell if hcell != 'head_black' else 'ebony'), tilt=tilt)
    if k in ('ac', 'E'):
        for side in (-1, 1):
            for j in range(3):
                tv = vnut + 0.05 + j * 0.043; uu = side * 0.026
                lcyl(pt, (uu, hb, tv), (uu, hb + 0.012, tv), 0.0045, 4, gc(hw_col), caps=True, tilt=tilt)                   # 弦柱
                e_ = edge_u(head, tv - vnut - 0.002) - 0.004; lcyl(pt, (side * e_, hb - 0.008, tv), (side * (e_ + 0.03), hb - 0.008, tv), 0.0085, 5, gc(hw_col), tilt=tilt)   # 弦鈕
    else:
        for j in range(6):
            tv = vnut + 0.035 + j * 0.026; uu = 0.018 + j * 0.0035
            lcyl(pt, (uu, hb, tv), (uu, hb + 0.011, tv), 0.0045, 4, gc(hw_col), caps=True)
            e_ = edge_u(head, tv - vnut - 0.002) - 0.004; lcyl(pt, (e_, hb - 0.008, tv), (e_ + 0.022, hb - 0.008, tv), 0.0075, 5, gc(hw_col))
    # 弦：琴橋到琴枕（六條細的面）
    srect = mid(gc('str_bronze' if k == 'ac' else 'str_nickel'))
    for i in range(6):
        ub = (i - 2.5) * sb; un = (i - 2.5) * 0.0074; hwid = 0.0006 + 0.00012 * (5 - i if k == 'ac' else 5 - i)
        q = [pt.bm.verts.new(c) for c in ((ub - hwid, wsb, vb), (ub + hwid, wsb, vb), (un + hwid, wtop + 0.0028, vnut), (un - hwid, wtop + 0.0028, vnut))]
        f = pt.face(q, [lerp_uv(srect, 0, 0), lerp_uv(srect, 1, 0), lerp_uv(srect, 1, 1), lerp_uv(srect, 0, 1)])
        f.normal_update()
        if f.normal.y < 0: f.normal_flip()
    if g.get('tag'):   # 價錢牌（空白，掛在最下面的弦鈕上）
        tv = vnut + 0.05; tu = 0.082
        q = [pt.bm.verts.new(c) for c in tilt_pts(tilt, [(tu, hb - 0.013, tv - 0.075), (tu + 0.035, hb - 0.013, tv - 0.075), (tu + 0.035, hb - 0.013, tv - 0.02), (tu, hb - 0.013, tv - 0.02)])]
        f = pt.face(q, [lerp_uv(gc('tag'), 0, 0), lerp_uv(gc('tag'), 1, 0), lerp_uv(gc('tag'), 1, 1), lerp_uv(gc('tag'), 0, 1)]); f.normal_update()
        if f.normal.y < 0: f.normal_flip()
    return vnut, wtop


def tilt_pts(tf, pts): return [tf(*p) for p in pts]


def edge_u(head, dv):
    """琴頭外形在 dv（離琴枕）那一高度的右緣 u"""
    rs = sorted([(v, u) for u, v in head if u >= 0])
    for (va, ua), (vb_, ub) in zip(rs, rs[1:]):
        if va <= dv <= vb_: return ua + (ub - ua) * (dv - va) / (vb_ - va + 1e-9)
    return rs[-1][1]


def hanger(cm, fr, vnut, wneck, head_half=0.03, wall=-0.05):
    """牆上的吉他掛勾（黑色）：牆上的底座＋手臂＋Y 形托（兩根托柱夾在琴頸兩側、頂住琴頭的肩）"""
    col, rub = '#1c1c1e', '#2e2e30'; ya = vnut - 0.03
    cs = [fr.g(u, w, v) for u in (-0.02, 0.02) for w in (wall, wall + 0.012) for v in (ya - 0.045, ya + 0.03)]
    cm.cbox(min(c[0] for c in cs), max(c[0] for c in cs), min(c[1] for c in cs), max(c[1] for c in cs), min(c[2] for c in cs), max(c[2] for c in cs), col)
    arm_end = fr.g(0, wneck, ya)
    vpaint(cm, col, lambda: cm.cyl(fr.g(0, wall + 0.012, ya), arm_end, 0.0055, seg=5))
    vpaint(cm, col, lambda: cm.cyl(fr.g(-head_half, wneck, ya), fr.g(head_half, wneck, ya), 0.005, seg=5))
    for s in (-1, 1):
        a = fr.g(s * head_half, wneck, ya); b = fr.g(s * (head_half + 0.004), wneck + 0.006, ya + 0.045)
        vpaint(cm, rub, lambda: cm.cyl(a, b, 0.0062, seg=5))


# ======================================================================
# 房子：地板、天花板、四面牆（牆在室內邊界外側 12 cm；內面＝layout 的邊界）
Mesh(P + 'floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh(P + 'ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=True)
T = 0.12
door = LAY['front']['door']; dx0, dx1, dh = door['x'] - door['w'] / 2, door['x'] + door['w'] / 2, door.get('h', 2.1)
win = LAY['back']['window']; wx0, wx1, ws, wh = win['x0'], win['x1'], win['sill'], win['head']
G('plaster', 'front').box(X0 - T, dx0, 0, H, Z1, Z1 + T).box(dx1, X1 + T, 0, H, Z1, Z1 + T).box(dx0, dx1, dh, H, Z1, Z1 + T)
G('plaster', 'back').box(X0 - T, wx0, 0, H, Z0 - T, Z0).box(wx1, X1 + T, 0, H, Z0 - T, Z0).box(wx0, wx1, 0, ws, Z0 - T, Z0).box(wx0, wx1, wh, H, Z0 - T, Z0)
G('plaster', 'left').box(X0 - T, X0, 0, H, Z0, Z1)
G('plaster', 'right').box(X1, X1 + T, 0, H, Z0, Z1)
for side in ('front', 'back', 'left', 'right'):   # 踢腳板
    w = G('wood', side)
    if side == 'back': w.rbox(X0, X1, 0, 0.08, Z0, Z0 + 0.012, r=0.003, seg=1)
    elif side == 'front': w.rbox(X0, dx0 - 0.06, 0, 0.08, Z1 - 0.012, Z1, r=0.003, seg=1); w.rbox(dx1 + 0.06, X1, 0, 0.08, Z1 - 0.012, Z1, r=0.003, seg=1)
    elif side == 'left': w.rbox(X0, X0 + 0.012, 0, 0.08, Z0, Z1, r=0.003, seg=1)
w = G('wood', 'back')   # 窗台（室內側的木窗台）
w.rbox(wx0 - 0.05, wx1 + 0.05, ws - 0.03, ws, Z0 - 0.06, Z0 + 0.07, r=0.006)

# ---------------- 店門：木框＋壓花玻璃門（開著，往內貼左牆）、門上掛的店名木牌 ----------------
fw = G('wood', 'front')
fw.rbox(dx0 - 0.06, dx0, 0, dh + 0.06, Z1 - 0.03, Z1 + 0.02, r=0.006); fw.rbox(dx1, dx1 + 0.06, 0, dh + 0.06, Z1 - 0.03, Z1 + 0.02, r=0.006); fw.rbox(dx0 - 0.06, dx1 + 0.06, dh, dh + 0.06, Z1 - 0.03, Z1 + 0.02, r=0.006)
hx_, hz_ = dx0 + 0.02, Z1 - 0.02; leaf_w = door['w'] - 0.04; ang = math.radians(97)   # 門鉸在西側；開 97°（門片朝 −z，貼著左牆）
# 門片直接用遊戲座標做（簡單、確定方向）：門片沿 −z 從門鉸往室內，厚 4 cm
dz0 = hz_ - leaf_w; lx0, lx1 = hx_ + 0.005, hx_ + 0.045
for (z0, z1, y0, y1) in ((dz0, dz0 + 0.1, 0.0, dh - 0.02), (hz_ - 0.1, hz_, 0.0, dh - 0.02), (dz0, hz_, 0.0, 0.24), (dz0, hz_, 0.93, 1.05), (dz0, hz_, dh - 0.13, dh - 0.02)):
    fw.rbox(lx0, lx1, y0, y1, z0, z1, r=0.006, seg=1)
for (y0, y1) in ((0.24, 0.93), (1.05, dh - 0.13)):   # 壓花玻璃（門片中間；單面化時補反面，兩面都看得到）
    xm_ = (lx0 + lx1) / 2; uvquad(G('props', 'front'), [(xm_, y0, hz_ - 0.1), (xm_, y0, dz0 + 0.1), (xm_, y1, dz0 + 0.1), (xm_, y1, hz_ - 0.1)], pc('frosted'))
fm = G('metal', 'front')
for x in (lx0 - 0.03, lx1 + 0.03):   # 門把（兩面）
    vpaint(fm, '#b9a27a', lambda: fm.cyl((x, 1.0, dz0 + 0.07), ((lx0 if x < hx_ + 0.02 else lx1), 1.0, dz0 + 0.07), 0.008, seg=8))
    vpaint(fm, '#b9a27a', lambda: fm.sphere((x, 1.0, dz0 + 0.07), 0.025, seg=10, rings=6))
for y in (0.3, dh - 0.3): vpaint(fm, '#8a7a60', lambda: fm.cyl((hx_ + 0.025, y - 0.05, hz_ + 0.005), (hx_ + 0.025, y + 0.05, hz_ + 0.005), 0.009, seg=6))   # 門鉸
# 店名木牌（掛在門片朝東那一面，麻繩；字由遊戲畫：PLATE_FACE_tx_door_sign）
sx_, sy0, sy1, sz0, sz1 = lx1 + 0.012, 1.25, 1.6, dz0 + 0.18, dz0 + 0.68
fw.rbox(lx1, sx_, sy0, sy1, sz0, sz1, r=0.004, seg=2)
fv = G('vc', 'front')
for zz in (sz0 + 0.06, sz1 - 0.06): vpaint(fv, '#b89a6a', lambda: fv.cyl((sx_ - 0.004, sy1 - 0.02, zz), (sx_ - 0.006, sy1 + 0.17, (sz0 + sz1) / 2), 0.004, seg=4))
PLATES = [('tx_door_sign', [(sx_ + 0.001, sy0 + 0.02, sz1 - 0.02), (sx_ + 0.001, sy0 + 0.02, sz0 + 0.02), (sx_ + 0.001, sy1 - 0.02, sz0 + 0.02), (sx_ + 0.001, sy1 - 0.02, sz1 - 0.02)],
           pc('board'), {'text': '同弦樂器', 'bg': '#c49a6a', 'color': '#2a1a10', 'serif': 1, 'wall': 'front', 'note': '門上掛的店名木牌（參考圖左邊；遊戲畫字，門牆淡出時一起藏）'})]

# ---------------- 後牆的大窗：鋁框兩扇橫拉、窗外的新生南路 ----------------
bm_ = G('metal', 'back'); alu = '#b8bbbd'
fr_t = 0.045
for (a0, a1, b0, b1) in ((wx0, wx1, ws, ws + fr_t), (wx0, wx1, wh - fr_t, wh), (wx0, wx0 + fr_t, ws, wh), (wx1 - fr_t, wx1, ws, wh)):
    bm_.crbox(a0, a1, b0, b1, Z0 - 0.09, Z0 - 0.02, alu, r=0.004, seg=1)
xm = (wx0 + wx1) / 2
for (zo, x_a, x_b) in ((-0.075, wx0 + fr_t, xm + 0.03), (-0.04, xm - 0.03, wx1 - fr_t)):   # 兩扇窗框（前後錯開）
    for (a0, a1, b0, b1) in ((x_a, x_b, ws + fr_t, ws + fr_t + 0.035), (x_a, x_b, wh - fr_t - 0.035, wh - fr_t), (x_a, x_a + 0.035, ws + fr_t, wh - fr_t), (x_b - 0.035, x_b, ws + fr_t, wh - fr_t)):
        bm_.crbox(a0, a1, b0, b1, Z0 + zo - 0.012, Z0 + zo + 0.012, alu, r=0.003, seg=1)
    gq = [(x_a + 0.03, ws + fr_t + 0.03, Z0 + zo), (x_b - 0.03, ws + fr_t + 0.03, Z0 + zo), (x_b - 0.03, wh - fr_t - 0.03, Z0 + zo), (x_a + 0.03, wh - fr_t - 0.03, Z0 + zo)]
    uvquad(G('glass', 'back'), gq, (0, 0, 1, 1))
vb_ = 1.6   # 窗外景的板：在窗外 1.6 m、比窗大（從斜角看也不會露邊）
uvquad(G('props', 'back'), [(wx0 - 2.2, ws - 1.0, Z0 - vb_), (wx1 + 2.2, ws - 1.0, Z0 - vb_), (wx1 + 2.2, wh + 1.2, Z0 - vb_), (wx0 - 2.2, wh + 1.2, Z0 - vb_)], pc('view', 1))
# 冷氣（分離式室內機）
ac = IT['aircon'][0]; av = G('vc', 'back'); ax_, ay_ = ac['x'], ac['y']
av.crbox(ax_ - 0.45, ax_ + 0.45, ay_ - 0.14, ay_ + 0.14, Z0, Z0 + 0.22, '#ecebe5', r=0.03, seg=3)
av.crbox(ax_ - 0.42, ax_ + 0.42, ay_ - 0.135, ay_ - 0.1, Z0 + 0.06, Z0 + 0.225, '#4c4e50', r=0.005, seg=1)
av.crbox(ax_ - 0.41, ax_ + 0.41, ay_ - 0.115, ay_ - 0.095, Z0 + 0.2, Z0 + 0.232, '#e0ded8', r=0.004, seg=1)
av.crbox(ax_ + 0.3, ax_ + 0.38, ay_ + 0.02, ay_ + 0.035, Z0 + 0.22, Z0 + 0.224, '#6aa06a', r=0.001, seg=1)

# ---------------- 右牆：橫條溝槽板 ----------------
gw = IT['guitar_wall'][0]
sv = G('vc', 'right'); sv.cbox(X1 - 0.012, X1, gw['y0'], gw['y1'], gw['z0'], gw['z1'], '#5e4c3a')   # 溝槽後面的暗色底板
sl = G('slat', 'right'); pitch, gap = 0.152, 0.012; y = gw['y0']
while y + pitch <= gw['y1'] + 1e-6:
    sl.rbox(X1 - 0.032, X1 - 0.012, y + gap, y + pitch, gw['z0'], gw['z1'], r=0.003, seg=1); y += pitch
G('wood', 'right').rbox(X1 - 0.04, X1 - 0.01, gw['y0'] - 0.08, gw['y0'] + 0.012, gw['z0'], gw['z1'], r=0.004, seg=1)   # 底下的收邊
G('wood', 'right').rbox(X1 - 0.04, X1 - 0.01, y + 0.0, y + 0.05, gw['z0'], gw['z1'], r=0.004, seg=1)

# ---------------- 吉他牆（上排電吉他、下排木吉他） ----------------
E_SPECS = [
    dict(kind='T', fin='e_blonde', pg='pg_black', fb='fb_maple'), dict(kind='S', fin='e_red', pg='pg_white', fb='fb_rose'), dict(kind='S', fin='e_blue', pg='pg_white', fb='fb_rose'),
    dict(kind='E', fin='e_sunburst', pg='pg_black', fb='fb_rose', neck='neck_mahog'), dict(kind='S', fin='e_seafoam', pg='pg_tort', fb='fb_rose'), dict(kind='T', fin='e_cream', pg='pg_black', fb='fb_maple'),
    dict(kind='S', fin='e_cream', pg='pg_mint', fb='fb_maple'), dict(kind='S', fin='e_black', pg='pg_white', fb='fb_maple'), dict(kind='E', fin='e_cherry', pg='pg_black', fb='fb_rose', neck='neck_mahog'),
    dict(kind='S', fin='e_sunburst', pg='pg_tort', fb='fb_rose'), dict(kind='T', fin='e_black', pg='pg_white', fb='fb_rose'), dict(kind='S', fin='e_olive', pg='pg_mint', fb='fb_rose'),
    dict(kind='S', fin='e_white', pg='pg_black', fb='fb_maple'), dict(kind='E', fin='e_black', pg='pg_black', fb='fb_rose', neck='neck_mahog', hw='gold'), dict(kind='T', fin='e_sunburst', pg='pg_black', fb='fb_maple'),
    dict(kind='S', fin='e_blue', pg='pg_tort', fb='fb_maple'), dict(kind='S', fin='e_red', pg='pg_white', fb='fb_maple'), dict(kind='T', fin='e_red', pg='pg_white', fb='fb_rose'),
    dict(kind='S', fin='e_seafoam', pg='pg_white', fb='fb_maple'), dict(kind='E', fin='e_sunburst', pg='pg_tort', fb='fb_rose', neck='neck_mahog'), dict(kind='S', fin='e_black', pg='pg_black', fb='fb_rose'),
    dict(kind='T', fin='e_blonde', pg='pg_white', fb='fb_rose'), dict(kind='S', fin='e_cream', pg='pg_tort', fb='fb_rose'), dict(kind='S', fin='e_sunburst', pg='pg_white', fb='fb_maple'),
]
A_SPECS = [
    dict(top='spruce', side='side_mahog'), dict(top='mahog_top', side='side_mahog', shape='om'), dict(top='spruce_aged', side='side_rose'), dict(top='koa_dark', side='side_rose', pg='pg_black'),
    dict(top='spruce', side='side_rose', shape='om', head='head_rose'), dict(top='sunburst_ac', side='side_mahog', pg='pg_black'), dict(top='spruce', side='side_maple', shape='om'),
    dict(top='mahog_top', side='side_mahog'), dict(top='spruce_aged', side='side_mahog', shape='om'), dict(top='spruce', side='side_rose'), dict(top='koa_dark', side='side_mahog', shape='om'),
    dict(top='spruce', side='side_mahog', pg='pg_black'),
]
gzs0, gzs1 = -6.25, 4.6
wg = G('guitar', 'right'); wm_ = G('metal', 'right'); rng = random.Random(77)
NE, NA = 22, 21
for i in range(NE):
    zc = gzs0 + (gzs1 - gzs0) * i / (NE - 1); g = E_SPECS[i % len(E_SPECS)]; yh = 3.0
    vnut = {'S': 0.743, 'T': 0.743, 'E': 0.768}[g['kind']]
    fr = Frame((X1 - 0.032 - 0.058, yh - vnut, zc), (-1, 0, math.sin(rng.uniform(-0.05, 0.05))), (0, 1, 0))
    pt = Part(); vn, wt = build_guitar(pt, g); pt.into(wg, fr); hanger(wm_, fr, vn, wt - 0.02, wall=-0.058)
for i in range(NA):
    zc = gzs0 + 0.12 + (gzs1 - gzs0 - 0.24) * i / (NA - 1); g = dict(A_SPECS[i % len(A_SPECS)], kind='ac', tag=(i % 4 == 1)); yh = 1.93
    fr = Frame((X1 - 0.032 - 0.05, yh - 0.855, zc), (-1, 0, math.sin(rng.uniform(-0.05, 0.05))), (0, 1, 0))
    pt = Part(); vn, wt = build_guitar(pt, g); pt.into(wg, fr); hanger(wm_, fr, vn, wt - 0.024, head_half=0.03, wall=-0.05)
# 櫃台後面（z 4.8 以後）：兩個掛著的琴袋、三捲導線
for zc in (5.25, 5.95):
    o = [(u * 1.12, v * 1.1) for u, v in outline('dread')]; pt = Part(); body_shell(pt, o, 0.13, 0.04, pc('gigbag'), pc('gigbag')); prism(pt, [(-0.045, 0.5), (0.045, 0.5), (0.035, 1.02), (-0.035, 1.02)], 0.03, 0.1, pc('gigbag'), pc('gigbag'))
    fr = Frame((X1 - 0.04, 1.05, zc), (-1, 0, 0), (0, 1, 0)); pt.into(G('props', 'right'), fr)
    vpaint(wm_, '#1c1c1e', lambda: wm_.cyl((X1 - 0.03, 2.08, zc), (X1 - 0.12, 2.12, zc), 0.006, seg=6))
for (zc, col) in ((6.25, '#1a1a1a'), (6.5, '#2a3a6a'), (6.75, '#8a2a22')):
    cyv = G('vc', 'right')
    for k in range(14):
        a0, a1 = 2 * math.pi * k / 14, 2 * math.pi * (k + 1) / 14; rr = 0.11; cy0 = 1.7 + (0.05 if col == '#2a3a6a' else 0)
        vpaint(cyv, col, lambda: cyv.cyl((X1 - 0.05, cy0 + rr * math.cos(a0), zc + rr * math.sin(a0)), (X1 - 0.05, cy0 + rr * math.cos(a1), zc + rr * math.sin(a1)), 0.008, seg=4, caps=False))
    vpaint(wm_, '#1c1c1e', lambda: wm_.cyl((X1 - 0.03, 1.8, zc), (X1 - 0.1, 1.83, zc), 0.006, seg=6))

# ---------------- 後牆右段：「不賣，老闆的」那一把（展示板＋專用投射燈）、告示、照片 ----------------
og = IT['owner_guitar'][0]; ox, oy = og['x'], og['y']
G('wood', 'back').rbox(ox - 0.34, ox + 0.34, oy - 0.78, oy + 0.62, Z0, Z0 + 0.03, r=0.01, seg=2)   # 展示板
G('wood', 'back').rbox(ox - 0.3, ox + 0.3, oy - 0.86, oy - 0.8, Z0, Z0 + 0.16, r=0.008, seg=2)     # 下面的小層板
pt = Part(); spec = dict(kind='E', fin='owner_burst', pg='pg_tort', fb='fb_rose', neck='neck_mahog', hw='gold', head='head_black')
ofr = Frame((ox, oy - 0.62, Z0 + 0.03 + 0.05), (0, 0, 1), (0, 1, 0)); vn, wt = build_guitar(pt, spec); pt.into(G('guitar', 'back'), ofr); hanger(G('metal', 'back'), ofr, vn, wt - 0.02, wall=-0.05)
bmv = G('metal', 'back')
for s in (-1, 1): bmv.crbox(ox + s * 0.18 - 0.02, ox + s * 0.18 + 0.02, oy - 0.62, oy - 0.58, Z0 + 0.03, Z0 + 0.09, '#9a7a3e', r=0.004, seg=1)   # 琴身下的黃銅托
tq = [(ox - 0.26, oy - 0.798, Z0 + 0.15), (ox - 0.06, oy - 0.798, Z0 + 0.15), (ox - 0.06, oy - 0.73, Z0 + 0.12), (ox - 0.26, oy - 0.73, Z0 + 0.12)]   # 斜放在層板上的標籤
PLATES.append(('tx_owner_tag', tq, pc('paper'), {'text': '不賣，老闆的', 'bg': '#f4efe2', 'color': '#3a2a20', 'wall': 'back', 'note': '老闆那把的標籤（AA_619「看看」）'}))
PLATES.append(('tx_notice', wall_quad('back', 0.004, 0.78, 1.28, 1.6, 2.0), pc('paper'), {'text': '弦一個月', 'sub': '換一次', 'bg': '#f6f2e8', 'color': '#2a2622', 'wall': 'back', 'note': '後牆的手寫紙（參考圖：弦一個月換一次）'}))
bpv = G('vc', 'back')
for (a, b) in ((0.78, 1.99), (1.28, 1.99), (0.78, 1.61), (1.28, 1.61)):   # 紙膠帶（四個角）
    bpv.poly([(a - 0.03, b - 0.012, Z0 + 0.006), (a + 0.03, b - 0.012, Z0 + 0.006), (a + 0.03, b + 0.012, Z0 + 0.006), (a - 0.03, b + 0.012, Z0 + 0.006)], '#e6d6a6')
for k, (px_, py_, rot) in enumerate(((0.62, 1.32, 0.04), (0.98, 1.2, -0.05), (0.66, 0.98, 0.02))):   # 照片（抽象色塊）＋膠帶
    c_, s_ = math.cos(rot), math.sin(rot); hw_, hh_ = 0.085, 0.1
    pts = [(px_ + (-hw_) * c_ - (-hh_) * s_, py_ + (-hw_) * s_ + (-hh_) * c_), (px_ + hw_ * c_ - (-hh_) * s_, py_ + hw_ * s_ + (-hh_) * c_), (px_ + hw_ * c_ - hh_ * s_, py_ + hw_ * s_ + hh_ * c_), (px_ + (-hw_) * c_ - hh_ * s_, py_ + (-hw_) * s_ + hh_ * c_)]
    uvquad(G('props', 'back'), [(x, y, Z0 + 0.005 + k * 0.0005) for x, y in pts], pc(f'photo{k}'))
    bpv.poly([(px_ - 0.025, py_ + hh_ - 0.01, Z0 + 0.008), (px_ + 0.025, py_ + hh_ - 0.01, Z0 + 0.008), (px_ + 0.025, py_ + hh_ + 0.012, Z0 + 0.008), (px_ - 0.025, py_ + hh_ + 0.012, Z0 + 0.008)], '#e8dcb4')
# 展示板上的小層板：老闆年輕時樂團的照片（立著的相框）
pv_ = G('vc', 'back'); pv_.crbox(ox + 0.15, ox + 0.29, oy - 0.8, oy - 0.65, Z0 + 0.1, Z0 + 0.115, '#3a2a20', r=0.004, seg=1)
uvquad(G('props', 'back'), [(ox + 0.162, oy - 0.788, Z0 + 0.1155), (ox + 0.278, oy - 0.788, Z0 + 0.1155), (ox + 0.278, oy - 0.662, Z0 + 0.1155), (ox + 0.162, oy - 0.662, Z0 + 0.1155)], pc('photo1'))

# ---------------- L 形玻璃櫃台 ----------------
CV = G('vc'); CMt = G('metal'); GL = G('glass'); WD = G('wood'); PR = G('props'); EM = G('emit')


def counter(x0, x1, z0, z1, cust, ends):
    """玻璃櫃台一段：木頭下櫃（0.06～0.44）＋玻璃展示櫃（0.47～1.0），cust＝客人那一面（'-x'、'+z'…）；ends＝要封玻璃的兩端"""
    CV.crbox(x0 + 0.03, x1 - 0.03, 0.0, 0.06, z0 + 0.03, z1 - 0.03, '#3a2c22', r=0.004, seg=1)
    WD.rbox(x0, x1, 0.06, 0.44, z0, z1, r=0.008, seg=2)
    WD.rbox(x0 - 0.01, x1 + 0.01, 0.44, 0.47, z0 - 0.01, z1 + 0.01, r=0.006, seg=2)
    uvquad(PR, [(x0 + 0.02, 0.4705, z1 - 0.02), (x1 - 0.02, 0.4705, z1 - 0.02), (x1 - 0.02, 0.4705, z0 + 0.02), (x0 + 0.02, 0.4705, z0 + 0.02)], pc('felt'))   # 絨布墊
    yt = 1.0
    for (px, pz) in ((x0, z0), (x0, z1), (x1, z0), (x1, z1)): CMt.crbox(px - 0.012, px + 0.012, 0.47, yt, pz - 0.012, pz + 0.012, '#a9acae', r=0.004, seg=1)
    for (a0, a1, isx, c) in ((x0, x1, True, z0), (x0, x1, True, z1), (z0, z1, False, x0), (z0, z1, False, x1)):   # 上緣的鋁框
        if isx: CMt.cbox(a0, a1, yt - 0.018, yt, c - 0.012, c + 0.012, '#a9acae'); CMt.cbox(a0, a1, 0.47, 0.485, c - 0.012, c + 0.012, '#a9acae')
        else: CMt.cbox(c - 0.012, c + 0.012, yt - 0.018, yt, a0, a1, '#a9acae'); CMt.cbox(c - 0.012, c + 0.012, 0.47, 0.485, a0, a1, '#a9acae')
    uvquad(GL, [(x0, yt + 0.002, z1), (x1, yt + 0.002, z1), (x1, yt + 0.002, z0), (x0, yt + 0.002, z0)], (0, 0, 1, 1))   # 頂面玻璃
    sides = {'-x': [(x0, 0.485, z1), (x0, 0.485, z0), (x0, yt - 0.018, z0), (x0, yt - 0.018, z1)], '+x': [(x1, 0.485, z0), (x1, 0.485, z1), (x1, yt - 0.018, z1), (x1, yt - 0.018, z0)],
             '-z': [(x0, 0.485, z0), (x1, 0.485, z0), (x1, yt - 0.018, z0), (x0, yt - 0.018, z0)], '+z': [(x1, 0.485, z1), (x0, 0.485, z1), (x0, yt - 0.018, z1), (x1, yt - 0.018, z1)]}
    for s in ends: uvquad(GL, sides[s], (0, 0, 1, 1))
    GL.box(x0 + 0.02, x1 - 0.02, 0.732, 0.74, z0 + 0.02, z1 - 0.02)   # 玻璃層板


cl = IT['counter_long'][0]; cs = IT['counter_short'][0]
lx0, lx1, lz0, lz1 = cl['x'] - cl['w'] / 2, cl['x'] + cl['w'] / 2, cl['z'] - cl['d'] / 2, cl['z'] + cl['d'] / 2
sx0, sx1, sz0, sz1 = cs['x'] - cs['w'] / 2, cs['x'] + cs['w'] / 2, cs['z'] - cs['d'] / 2, cs['z'] + cs['d'] / 2
counter(lx0, lx1, lz0, lz1, '-x', ('-x', '+x', '-z'))
counter(sx0, sx1, sz0, sz1, '+z', ('+z', '-z', '-x', '+x'))
for (x0_, x1_, z0_, z1_) in ((lx0, lx1, lz0, lz1), (sx0, sx1, sz0, sz1)):   # 櫃裡的燈條（頂面玻璃下面，靠老闆那一側）
    if x1_ - x0_ < 1.0: EM.box(x1_ - 0.06, x1_ - 0.035, 0.97, 0.978, z0_ + 0.04, z1_ - 0.04)
    else: EM.box(x0_ + 0.04, x1_ - 0.04, 0.97, 0.978, z0_ + 0.035, z0_ + 0.06)


def tbox(m, cx, cy, cz, w, h, d, ry, rx, front, other):
    """貼圖的小盒子（弦的紙盒）：中心、寬高厚、繞 y 轉 ry、往後仰 rx；front＝正面（局部 +z）的格，其他面用 other"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); uvl = bm.loops.layers.uv.new('UVMap')
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    bm.normal_update()
    for f in bm.faces:
        n = f.normal; rect = front if n.y < -0.5 else other
        for lp in f.loops:
            co = lp.vert.co; lp[uvl].uv = lerp_uv(rect, co.x / w + 0.5, co.z / h + 0.5)
    mtx = Matrix.Translation(g2b(cx, cy, cz)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(-rx, 4, 'X')
    m.add_bm(bm, mtx); bm.free()


def roll(m, cx, cy, cz, r, ln, axis_x, rect):
    """捲起來的背帶（圓柱的側面＝花紋格）；axis_x＝沿 x 放，否則沿 z"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); seg = 10; rings = []
    for e in (0, 1):
        ring = []
        for k in range(seg):
            a = 2 * math.pi * k / seg; p = (cx + (e - 0.5) * ln, cy + r * math.sin(a), cz + r * math.cos(a)) if axis_x else (cx + r * math.cos(a), cy + r * math.sin(a), cz + (e - 0.5) * ln)
            ring.append(bm.verts.new(g2b(*p)))
        rings.append(ring)
    for k in range(seg):
        j = (k + 1) % seg; f = bm.faces.new([rings[0][k], rings[0][j], rings[1][j], rings[1][k]])
        for lp, t in zip(f.loops, ((k / seg, 0), ((k + 1) / seg, 0), ((k + 1) / seg, 1), (k / seg, 1))): lp[uvl].uv = lerp_uv(rect, t[1], t[0])
    for e in (0, 1):
        f = bm.faces.new(rings[e] if e else list(reversed(rings[e])))
        for lp in f.loops: lp[uvl].uv = lerp_uv(rect, 0.5, 0.1)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces)); m.add_bm(bm); bm.free()


# 長邊（客人在 −x 那一面看）：上層＝弦的紙盒（一排排斜立）、移調夾、調音器；下層＝Pick 盒、背帶、清潔油
rng = random.Random(5)
zz = lz0 + 0.12
for row in range(3):
    xr = lx0 + 0.1 + row * 0.14
    for k in range(9):
        z_ = lz0 + 0.12 + k * 0.125 + (row % 2) * 0.03
        tbox(PR, xr, 0.74 + 0.06, z_, 0.115, 0.115, 0.009, -math.pi / 2, math.radians(14), pc(f'pack{(k + row * 3) % 8}'), mid(pc(f'pack{(k + row * 3) % 8}'), 0.1))
for k in range(4):   # 移調夾（夾子形：上下兩臂＋彈簧）
    cz_ = lz0 + 1.35 + k * 0.17; cx_ = lx0 + 0.22; col = ['#1c1c1e', '#b9bcbe', '#1c1c1e', '#7a5a3a'][k]
    CMt.crbox(cx_ - 0.035, cx_ + 0.035, 0.742, 0.756, cz_ - 0.011, cz_ + 0.011, col, r=0.005, seg=1)
    CMt.crbox(cx_ - 0.03, cx_ + 0.012, 0.762, 0.774, cz_ - 0.009, cz_ + 0.009, col, r=0.005, seg=1)
    vpaint(CMt, '#c9ccce', lambda: CMt.cyl((cx_ + 0.02, 0.757, cz_), (cx_ + 0.02, 0.768, cz_), 0.009, seg=8))
    CV.crbox(cx_ - 0.037, cx_ - 0.025, 0.74, 0.78, cz_ - 0.013, cz_ + 0.013, '#2a2a2a', r=0.004, seg=1)
for k in range(4):   # 夾式調音器（小螢幕）
    cz_ = lz0 + 2.15 + k * 0.13; cx_ = lx0 + 0.2
    CV.crbox(cx_ - 0.012, cx_ + 0.012, 0.74, 0.79, cz_ - 0.015, cz_ + 0.015, '#1e1e20', r=0.005, seg=1)
    CV.crbox(cx_ - 0.03, cx_ + 0.004, 0.785, 0.83, cz_ - 0.025, cz_ + 0.025, '#2a2a2c', r=0.008, seg=2)
    CV.poly([(cx_ - 0.031, 0.792, cz_ + 0.018), (cx_ - 0.031, 0.792, cz_ - 0.018), (cx_ - 0.031, 0.823, cz_ - 0.018), (cx_ - 0.031, 0.823, cz_ + 0.018)], ['#9ad0d8', '#b8e0a0', '#9ad0d8', '#e0d0a0'][k])
uvquad(PR, [(lx0 + 0.05, 0.7405, lz0 + 3.1), (lx1 - 0.05, 0.7405, lz0 + 3.1), (lx1 - 0.05, 0.7405, lz0 + 2.75), (lx0 + 0.05, 0.7405, lz0 + 2.75)], pc('felt_red'))
for k in range(4):   # 下層：Pick 盒（淺木盒＋彩色 Pick）
    cz_ = lz0 + 0.2 + k * 0.32; cx_ = lx0 + 0.25
    WD.rbox(cx_ - 0.13, cx_ + 0.13, 0.473, 0.5, cz_ - 0.12, cz_ + 0.12, r=0.004, seg=1)
    uvquad(PR, [(cx_ - 0.12, 0.501, cz_ + 0.11), (cx_ + 0.12, 0.501, cz_ + 0.11), (cx_ + 0.12, 0.501, cz_ - 0.11), (cx_ - 0.12, 0.501, cz_ - 0.11)], pc('picks_a' if k % 2 else 'picks_b'))
for k in range(6):   # 下層：捲起來的背帶（花紋）
    roll(PR, lx0 + 0.16 + (k % 2) * 0.2, 0.473 + 0.04, lz0 + 1.55 + (k // 2) * 0.33 + (k % 2) * 0.05, 0.04, 0.075, False, pc(f'strap{k}'))
for k in range(5):   # 清潔油、弦油的小瓶子
    bx_, bz_ = lx0 + 0.16 + (k % 2) * 0.12, lz0 + 2.6 + k * 0.1
    vpaint(CV, '#eeeeea', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.022, 0.0), (0.024, 0.006), (0.024, 0.085), (0.012, 0.1), (0.0, 0.1)], seg=10), Matrix.Translation(g2b(bx_, 0.47, bz_))))
    vpaint(CV, ['#2a5aa8', '#c83a2a', '#1a1a1a', '#2a8a5a', '#d0a030'][k], lambda: CV.cyl((bx_, 0.57, bz_), (bx_, 0.6, bz_), 0.011, seg=8))
# 短邊（客人在 +z 看）：上層＝弦盒、背帶；下層＝Pick 盒
for k in range(12):
    tbox(PR, sx0 + 0.15 + k * 0.15, 0.74 + 0.06, sz1 - 0.2 - (k % 2) * 0.04, 0.115, 0.115, 0.009, 0.0, math.radians(-14) * -1, pc(f'pack{(k + 3) % 8}'), mid(pc(f'pack{(k + 3) % 8}'), 0.1))
for k in range(5): roll(PR, sx0 + 0.25 + k * 0.33, 0.473 + 0.04, sz1 - 0.16, 0.04, 0.075, True, pc(f'strap{(k + 2) % 6}'))
for k in range(3):
    cx_ = sx0 + 0.32 + k * 0.6
    WD.rbox(cx_ - 0.13, cx_ + 0.13, 0.473, 0.5, sz0 + 0.06, sz0 + 0.3, r=0.004, seg=1)
    uvquad(PR, [(cx_ - 0.12, 0.501, sz0 + 0.29), (cx_ + 0.12, 0.501, sz0 + 0.29), (cx_ + 0.12, 0.501, sz0 + 0.07), (cx_ - 0.12, 0.501, sz0 + 0.07)], pc('picks_b' if k % 2 else 'picks_a'))

# 櫃台上：老闆的帳本（打開）、茶杯、筆筒、垂下來的黃金葛、一盒弦（剛賣的）
LEAVES = []   # (遊戲座標的葉基、方向、法線、長、寬、哪一種斑紋)
STEMS = []


def leaf_at(base, d, nrm, Lf, var=0):
    LEAVES.append((Vector(base), Vector(d).normalized(), Vector(nrm), Lf, var))


def vine(start, out_dir, length, seed, step=0.055, droop=1.0):
    """垂下來的藤：先往 out_dir 長出去，再往下垂；每節一片葉子（左右交錯），越往下越小"""
    rg = random.Random(seed); p = Vector(start); od = Vector(out_dir).normalized(); n = max(3, int(length / step)); pts = [p.copy()]
    for i in range(n):
        t = i / n; dirv = (od * max(0.0, 1.0 - t * 2.5 * droop) + Vector((0, -1, 0)) * min(1.0, t * 2.5 * droop + 0.1))
        dirv += Vector((rg.uniform(-0.25, 0.25), 0, rg.uniform(-0.25, 0.25))); dirv.normalize(); p = p + dirv * step; pts.append(p.copy())
        side = od.cross(Vector((0, 1, 0)));
        if side.length < 1e-3: side = Vector((1, 0, 0))
        side.normalize(); s = 1 if i % 2 else -1
        ld = (side * s * 0.8 + od * 0.5 + Vector((0, -0.6, 0))).normalized(); nr = (od + Vector((0, 0.3, 0))).normalized()
        leaf_at(p, ld, nr, 0.075 * (1 - 0.4 * t) * rg.uniform(0.85, 1.1), rg.randint(0, 1))
    STEMS.append(pts)


def pothos_mound(cx, cy, cz, r, n, seed):
    rg = random.Random(seed)
    for k in range(n):
        a = rg.uniform(0, 2 * math.pi); e = rg.uniform(0.2, 1.1)
        d = Vector((math.cos(a) * math.cos(e), math.sin(e), math.sin(a) * math.cos(e))); base = Vector((cx, cy, cz)) + Vector((math.cos(a), 0, math.sin(a))) * r * rg.uniform(0.0, 0.6)
        nr = Vector((math.cos(a) * 0.3, 1.0, math.sin(a) * 0.3)).normalized()
        leaf_at(base, d, nr, rg.uniform(0.07, 0.1), rg.randint(0, 1))


def pot(m_vc, cx, cy, cz, r, h, col, seg=16):
    vpaint(m_vc, col, lambda: m_vc.add_bm(L.lathe([(r * 0.72, 0.0), (r * 0.78, 0.01), (r, h * 0.9), (r * 1.06, h * 0.92), (r * 1.06, h), (r * 0.96, h), (r * 0.94, h * 0.9), (0.0, h * 0.88)], seg=seg), Matrix.Translation(g2b(cx, cy, cz))))
    vpaint(m_vc, '#3e3024', lambda: m_vc.add_bm(L.lathe([(r * 0.93, h * 0.88), (0.0, h * 0.89)], seg=seg), Matrix.Translation(g2b(cx, cy + 0.002, cz))))


ty = 1.002
pot(CV, lx0 + 0.18, ty, lz0 + 0.35, 0.075, 0.12, '#e9e5dc')
pothos_mound(lx0 + 0.18, ty + 0.12, lz0 + 0.35, 0.07, 14, 3)
for k, (dz, ln) in enumerate(((-0.06, 0.55), (0.05, 0.7), (0.12, 0.45))): vine((lx0 + 0.12, ty + 0.11, lz0 + 0.35 + dz), (-1, 0, dz * 2), ln, 40 + k)
vpaint(CV, '#4a4038', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.035, 0.0), (0.036, 0.11), (0.032, 0.11), (0.031, 0.008), (0.0, 0.008)], seg=12), Matrix.Translation(g2b(lx0 + 0.18, ty, lz0 + 0.75))))   # 筆筒
for k in range(4): vpaint(CV, ['#1a1a1a', '#2a4a9a', '#c83a2a', '#d0b060'][k], lambda: CV.cyl((lx0 + 0.18 + (k - 1.5) * 0.008, ty + 0.05, lz0 + 0.75 + (k % 2) * 0.01), (lx0 + 0.18 + (k - 1.5) * 0.02, ty + 0.17, lz0 + 0.75 + (k % 2) * 0.02), 0.0045, seg=6))
bk = (lx0 + 0.36, lz0 + 1.55)   # 帳本（打開、兩頁）
CV.crbox(bk[0] - 0.11, bk[0] + 0.11, ty, ty + 0.012, bk[1] - 0.15, bk[1] + 0.15, '#3a2a22', r=0.003, seg=1)
for s in (-1, 1): uvquad(PR, [(bk[0] - 0.1, ty + 0.014 + 0.004 * (1 - abs(s)), bk[1] + (0.0 if s > 0 else -0.14)), (bk[0] + 0.1, ty + 0.014, bk[1] + (0.0 if s > 0 else -0.14)), (bk[0] + 0.1, ty + 0.018, bk[1] + (0.14 if s > 0 else 0.0)), (bk[0] - 0.1, ty + 0.018, bk[1] + (0.14 if s > 0 else 0.0))] if s > 0 else
                          [(bk[0] - 0.1, ty + 0.018, bk[1] - 0.14), (bk[0] + 0.1, ty + 0.018, bk[1] - 0.14), (bk[0] + 0.1, ty + 0.014, bk[1]), (bk[0] - 0.1, ty + 0.014, bk[1])], pc('paper'))
vpaint(CV, '#1a1a1a', lambda: CV.cyl((bk[0] + 0.02, ty + 0.02, bk[1] + 0.05), (bk[0] + 0.07, ty + 0.02, bk[1] + 0.11), 0.004, seg=6))   # 筆
mx_, mz_ = lx0 + 0.42, lz0 + 2.15   # 老闆的茶（陶杯）
vpaint(CV, '#d9d4c8', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.032, 0.0), (0.04, 0.02), (0.042, 0.09), (0.038, 0.09), (0.036, 0.022), (0.0, 0.016)], seg=14), Matrix.Translation(g2b(mx_, ty, mz_))))
vpaint(CV, '#7a5a2a', lambda: CV.add_bm(L.lathe([(0.037, 0.07), (0.0, 0.07)], seg=14), Matrix.Translation(g2b(mx_, ty, mz_))))
tbox(PR, lx0 + 0.2, ty + 0.006, lz0 + 2.6, 0.115, 0.115, 0.009, 0.3, math.radians(90), pc('pack0'), mid(pc('pack0'), 0.1))   # 剛賣出去的一盒弦（平放）
CV.crbox(sx0 + 0.3, sx0 + 0.62, ty, ty + 0.11, sz0 + 0.12, sz0 + 0.38, '#2a2a2c', r=0.01, seg=2)   # 收銀的小盒（刷卡機）
CV.crbox(sx0 + 0.33, sx0 + 0.59, ty + 0.11, ty + 0.115, sz0 + 0.15, sz0 + 0.35, '#5a6a70', r=0.002, seg=1)

# 老闆的高腳椅（櫃台後面）
def stool(m_wood, cm, x, z, sh, r=0.18, legc='#1c1c1e', ring=0.24):
    Xf_ = Matrix.Translation(g2b(x, sh - 0.045, z))
    m_wood.add_bm(L.lathe([(0.0, 0.0), (r - 0.012, 0.0), (r, 0.012), (r, 0.033), (r - 0.012, 0.045), (0.0, 0.045)], seg=22), Xf_)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; ca, sa = math.cos(a), math.sin(a)
        vpaint(cm, legc, lambda: cm.cyl((x + ca * (r * 0.62), sh - 0.045, z + sa * (r * 0.62)), (x + ca * (r + 0.05), 0.0, z + sa * (r + 0.05)), 0.011, seg=6))
        vpaint(cm, '#2a2a2a', lambda: cm.cyl((x + ca * (r + 0.05), 0.0, z + sa * (r + 0.05)), (x + ca * (r + 0.05), 0.012, z + sa * (r + 0.05)), 0.014, seg=6))
    rr = r * 0.62 + (r + 0.05 - r * 0.62) * (1 - ring / (sh - 0.045))   # 腳踏圈
    for k in range(12):
        a0, a1 = 2 * math.pi * k / 12, 2 * math.pi * (k + 1) / 12
        vpaint(cm, legc, lambda: cm.cyl((x + rr * math.cos(a0), ring, z + rr * math.sin(a0)), (x + rr * math.cos(a1), ring, z + rr * math.sin(a1)), 0.008, seg=4, caps=False))
    vpaint(cm, legc, lambda: cm.add_bm(L.lathe([(r * 0.66, 0.0), (r * 0.6, 0.0), (r * 0.6, 0.03), (r * 0.66, 0.03)], seg=16), Matrix.Translation(g2b(x, sh - 0.075, z))))


stool(WD, CMt, 2.45, 4.25, 0.72)

# ---------------- 試琴角：地毯、兩張試琴椅、小音箱、譜架、琴架上的吉他、吊燈 ----------------
rg_ = IT['rug'][0]; rx0, rx1, rz0, rz1 = rg_['x'] - rg_['w'] / 2, rg_['x'] + rg_['w'] / 2, rg_['z'] - rg_['d'] / 2, rg_['z'] + rg_['d'] / 2
uvquad(PR, [(rx0, 0.006, rz1), (rx1, 0.006, rz1), (rx1, 0.006, rz0), (rx0, 0.006, rz0)], pc('rug', 1))
CV.cbox(rx0 + 0.01, rx1 - 0.01, 0.0, 0.0058, rz0 + 0.01, rz1 - 0.01, '#5a2420')   # 地毯的厚度（邊）
seat_h = LAY['seats'][0].get('seatH', 0.6)
for st in IT['trial_stool']: stool(WD, CMt, st['x'], st['z'], seat_h)
am = IT['amp'][0]; ax0, ax1, az0, az1 = am['x'] - am['w'] / 2, am['x'] + am['w'] / 2, am['z'] - am['d'] / 2, am['z'] + am['d'] / 2; ah = am['h']
CV.crbox(ax0, ax1, 0.02, ah, az0, az1, '#211f1e', r=0.018, seg=3)   # 黑色皮面箱體
for (cx_, cy_) in ((ax0, 0.02), (ax1, 0.02), (ax0, ah), (ax1, ah)):   # 護角
    CMt.crbox(cx_ - 0.018, cx_ + 0.018, cy_ - 0.018, cy_ + 0.018, az1 - 0.03, az1 + 0.004, '#8a8c8e', r=0.008, seg=1)
uvquad(PR, [(ax0 + 0.03, 0.05, az1 + 0.002), (ax1 - 0.03, 0.05, az1 + 0.002), (ax1 - 0.03, ah - 0.1, az1 + 0.002), (ax0 + 0.03, ah - 0.1, az1 + 0.002)], pc('grille_dark'))   # 面網
for (a0, a1, b0, b1) in ((ax0 + 0.03, ax1 - 0.03, 0.045, 0.052), (ax0 + 0.03, ax1 - 0.03, ah - 0.103, ah - 0.096), (ax0 + 0.026, ax0 + 0.033, 0.045, ah - 0.096), (ax1 - 0.033, ax1 - 0.026, 0.045, ah - 0.096)):
    CMt.cbox(a0, a1, b0, b1, az1, az1 + 0.005, '#c9c9c4')   # 銀色滾邊
CMt.crbox(ax0 + 0.03, ax1 - 0.03, ah - 0.09, ah - 0.02, az1 - 0.002, az1 + 0.003, '#b9bcbe', r=0.003, seg=1)   # 控制面板
for k in range(6): vpaint(CV, '#151515', lambda: CV.cyl((ax0 + 0.07 + k * 0.06, ah - 0.055, az1 + 0.003), (ax0 + 0.07 + k * 0.06, ah - 0.055, az1 + 0.02), 0.011, seg=8))
CV.poly([(ax1 - 0.06, ah - 0.06, az1 + 0.0035), (ax1 - 0.045, ah - 0.06, az1 + 0.0035), (ax1 - 0.045, ah - 0.045, az1 + 0.0035), (ax1 - 0.06, ah - 0.045, az1 + 0.0035)], '#e84a2a')   # 電源燈
CV.crbox(am['x'] - 0.1, am['x'] + 0.1, ah, ah + 0.03, am['z'] - 0.02, am['z'] + 0.02, '#151515', r=0.01, seg=2)   # 提把
for k in range(4): CV.crbox(ax0 + 0.03 + (k % 2) * (am['w'] - 0.08), ax0 + 0.05 + (k % 2) * (am['w'] - 0.08), 0.0, 0.02, az0 + 0.03 + (k // 2) * (am['d'] - 0.08), az0 + 0.05 + (k // 2) * (am['d'] - 0.08), '#111111', r=0.004, seg=1)
for k in range(16):   # 導線：從音箱繞一圈在地毯上
    a0, a1 = 2 * math.pi * k / 16, 2 * math.pi * (k + 1) / 16; c0 = (-1.3, -5.8)
    vpaint(CV, '#151515', lambda: CV.cyl((c0[0] + 0.17 * math.cos(a0), 0.013, c0[1] + 0.12 * math.sin(a0)), (c0[0] + 0.17 * math.cos(a1), 0.013, c0[1] + 0.12 * math.sin(a1)), 0.005, seg=4, caps=False))
vpaint(CV, '#151515', lambda: CV.cyl((ax1 - 0.06, 0.12, az1 + 0.01), (-1.3 + 0.17, 0.013, -5.8), 0.005, seg=4, caps=False))
# 譜架：三腳＋中柱＋斜的譜板（黑色鐵板、圓孔）＋空白的譜
ms = IT['music_stand'][0]; mx, mz = ms['x'], ms['z']; myaw = math.atan2(-1.55 - mx, -4.6 - mz)
for k in range(3):
    a = myaw + math.pi + (k - 1) * 2.1
    vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((mx, 0.32, mz), (mx + 0.26 * math.sin(a), 0.0, mz + 0.26 * math.cos(a)), 0.006, seg=6))
vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((mx, 0.25, mz), (mx, 1.02, mz), 0.009, seg=8))
mfr = Frame((mx, 1.0, mz), (math.sin(myaw), 0.3, math.cos(myaw)), (0, 1, 0))
pt = Part(); prism(pt, [(-0.24, -0.02), (0.24, -0.02), (0.24, 0.3), (-0.24, 0.3)], 0.0, 0.004, pc('mstand'), pc('mstand'), bottom=True)
prism(pt, [(-0.24, -0.02), (0.24, -0.02), (0.24, 0.0), (-0.24, 0.0)], 0.0, 0.035, pc('mstand'), pc('mstand'), bottom=True)   # 下緣的托
prism(pt, [(-0.215, 0.0), (0.0, 0.0), (0.0, 0.28), (-0.215, 0.28)], 0.0045, 0.006, pc('paper'), pc('paper'))
prism(pt, [(0.002, 0.0), (0.217, 0.0), (0.217, 0.28), (0.002, 0.28)], 0.0045, 0.0062, pc('paper'), pc('paper'))
pt.into(PR, mfr)
# 琴架上的木吉他（A 字琴架；吉他面向試琴椅，往後靠 16°）
gs = IT['guitar_on_stand'][0]; gx, gz = gs['x'], gs['z']; gyaw = math.atan2(-1.55 - gx, -4.6 - gz)
fw_ = Vector((math.sin(gyaw), 0, math.cos(gyaw))); tilt_b = math.radians(16)
vdir = Vector((0, math.cos(tilt_b), 0)) - fw_ * math.sin(tilt_b)
gfr = Frame((gx - fw_.x * 0.02, 0.09, gz - fw_.z * 0.02), tuple(fw_ * math.cos(tilt_b) + Vector((0, math.sin(tilt_b), 0))), tuple(vdir))
pt = Part(); vn, wt = build_guitar(pt, dict(kind='ac', top='spruce', side='side_mahog', shape='dread')); pt.into(G('guitar'), gfr)
for (u, w_, v) in ((-0.15, 0.06, 0.0), (0.15, 0.06, 0.0)):   # 琴架：兩隻前腳的托、後腳、頸托
    a = gfr.g(u, w_ + 0.03, -0.02); vpaint(CMt, '#1a1a1c', lambda: CMt.cyl(a, (a[0] - fw_.x * 0.25, 0.0, a[2] - fw_.z * 0.25), 0.007, seg=6))
    vpaint(CMt, '#1a1a1c', lambda: CMt.cyl(a, (a[0] + fw_.x * 0.12, 0.0, a[2] + fw_.z * 0.12), 0.007, seg=6))
    vpaint(CV, '#2e2e30', lambda: CV.cyl(gfr.g(u, w_ - 0.06, 0.0), gfr.g(u, w_ + 0.06, 0.0), 0.012, seg=6))
nk = gfr.g(0, -0.005, 0.62); vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((nk[0] - fw_.x * 0.03, 0.0, nk[2] - fw_.z * 0.03), nk, 0.008, seg=6))
vpaint(CV, '#2e2e30', lambda: CV.cyl(gfr.g(-0.03, -0.01, 0.62), gfr.g(0.03, -0.01, 0.62), 0.01, seg=6))
# 花台（細腳的木台＋黃金葛）
ps_ = IT['plant_stand'][0]
for k in range(4):
    a = math.pi / 4 + k * math.pi / 2; vpaint(CV, '#7a5434', lambda: CV.cyl((ps_['x'] + 0.1 * math.cos(a), 0.0, ps_['z'] + 0.1 * math.sin(a)), (ps_['x'] + 0.13 * math.cos(a), 0.7, ps_['z'] + 0.13 * math.sin(a)), 0.012, seg=6))
WD.add_bm(L.lathe([(0.0, 0.0), (0.17, 0.0), (0.17, 0.03), (0.0, 0.03)], seg=18), Matrix.Translation(g2b(ps_['x'], 0.7, ps_['z'])))
pot(CV, ps_['x'], 0.73, ps_['z'], 0.11, 0.17, '#b0653e')
pothos_mound(ps_['x'], 0.9, ps_['z'], 0.1, 22, 7)
for k in range(4): vine((ps_['x'] + 0.1 * math.cos(k * 1.7), 0.89, ps_['z'] + 0.1 * math.sin(k * 1.7)), (math.cos(k * 1.7), 0, math.sin(k * 1.7)), 0.4 + 0.12 * k, 60 + k)
# 吊燈（工業風搪瓷燈罩）＋光暈
pd = IT['pendant'][0]; px, py, pz = pd['x'], pd['y'], pd['z']
vpaint(CV, '#1a1a1a', lambda: CV.cyl((px, H, pz), (px, py + 0.2, pz), 0.004, seg=4))
vpaint(CMt, '#2e3a34', lambda: CMt.add_bm(L.lathe([(0.0, 0.215), (0.03, 0.215), (0.035, 0.19), (0.07, 0.16), (0.17, 0.05), (0.205, 0.01), (0.21, 0.0), (0.2, 0.0), (0.16, 0.04), (0.065, 0.15), (0.0, 0.17)], seg=20), Matrix.Translation(g2b(px, py, pz))))
vpaint(CMt, '#e8e4da', lambda: CMt.add_bm(L.lathe([(0.0, 0.168), (0.064, 0.148), (0.158, 0.038), (0.198, 0.0)], seg=20), Matrix.Translation(g2b(px, py + 0.002, pz))))   # 燈罩裡面（白搪瓷）
EM.add_bm(L.lathe([(0.0, 0.0), (0.03, 0.01), (0.04, 0.05), (0.03, 0.09), (0.0, 0.1)], seg=10), Matrix.Translation(g2b(px, py + 0.04, pz)))
CL.glow(root, 'pendant', px, py - 0.02, pz, color='rgba(255,214,160,1)', size=1.6, day=0.3, night=1.0)

# ---------------- 天花板的軌道投射燈 ----------------
for tr in IT['track']:
    x_, z0_, z1_ = tr['x'], tr['z0'], tr['z1']
    CMt.crbox(x_ - 0.018, x_ + 0.018, H - 0.03, H, z0_, z1_, '#1c1c1e', r=0.004, seg=1)
    n = max(2, int((z1_ - z0_) / 1.5) + 1)
    for k in range(n):
        z_ = z0_ + 0.25 + (z1_ - z0_ - 0.5) * k / (n - 1)
        tgt = Vector(g2b(X1 - 0.1, 2.0, z_)) if x_ > 0 else Vector(g2b(x_ + 0.6, 0.9, z_ - 1.2))
        if x_ > 0 and z_ < -5.9: tgt = Vector(g2b(IT['owner_guitar'][0]['x'], 1.5, Z0))   # 最後一盞照老闆那把
        top = Vector(g2b(x_, H - 0.03, z_)); jt = top + Vector((0, 0, -0.09)); dv = (tgt - jt).normalized()
        vpaint(CMt, '#1c1c1e', lambda: CMt.add_bm(L.lathe([(0.008, 0.0), (0.008, 0.09)], seg=6), Matrix.Translation(jt)))
        rot = Vector((0, 0, -1)).rotation_difference(dv).to_matrix().to_4x4()
        vpaint(CMt, '#1c1c1e', lambda: CMt.add_bm(L.lathe([(0.0, 0.04), (0.03, 0.04), (0.042, 0.0), (0.045, -0.13), (0.038, -0.135), (0.0, -0.12)], seg=10), Matrix.Translation(jt) @ rot))
        EM.add_bm(L.lathe([(0.036, -0.125), (0.0, -0.126)], seg=12), Matrix.Translation(jt) @ rot)

# ---------------- 左牆：書架、軟木板、邊櫃、靠牆的琴袋、吊盆 ----------------
bs = IT['bookshelf'][0]; bx0, bx1, bz0, bz1, bh = bs['x'] - bs['w'] / 2, bs['x'] + bs['w'] / 2, bs['z'] - bs['d'] / 2, bs['z'] + bs['d'] / 2, bs['h']
LW = G('wood', 'left'); LV = G('vc', 'left')
LW.rbox(bx0, bx1, 0.0, 0.06, bz0 + 0.02, bz1 - 0.02, r=0.004, seg=1)
for zz_ in (bz0, (bz0 + bz1) / 2 - 0.012, bz1 - 0.024): LW.rbox(bx0, bx1, 0.0, bh, zz_, zz_ + 0.024, r=0.004, seg=1)
for yy_ in (0.06, 0.42, 0.82, bh - 0.025): LW.rbox(bx0, bx1, yy_, yy_ + 0.025, bz0, bz1, r=0.004, seg=1)
LV.cbox(X0, X0 + 0.01, 0.06, bh, bz0, bz1, '#6a5240')
PAL = ['#8c3b47', '#2f5d50', '#c9a24f', '#e8dcc4', '#4a6c8c', '#7b5a3a', '#3a3a3a', '#a85a3a', '#5a4a7a', '#d8d0bc']
rb = random.Random(11)
for (y0_, y1_) in ((0.085, 0.42), (0.445, 0.82)):
    for (za, zb) in ((bz0 + 0.024, (bz0 + bz1) / 2 - 0.012), ((bz0 + bz1) / 2 + 0.012, bz1 - 0.024)):
        z_ = za + 0.01
        while z_ < zb - 0.04:
            t_ = rb.uniform(0.018, 0.045); h_ = rb.uniform(0.18, min(0.3, y1_ - y0_ - 0.02)); dd = rb.uniform(0.15, 0.22)
            if rb.random() < 0.08: z_ += 0.06; continue
            LV.cbox(bx1 - 0.02 - dd, bx1 - 0.02, y0_, y0_ + h_, z_, z_ + t_, rb.choice(PAL)); z_ += t_ + 0.002
        LV.crbox(bx1 - 0.2, bx1 - 0.02, y0_, y0_ + 0.06, zb - 0.035, zb - 0.002, rb.choice(PAL), r=0.002, seg=1)   # 平放的一疊
for k in range(6):   # 上層：平放的譜、樂譜本
    LV.crbox(bx1 - 0.24, bx1 - 0.02, 0.845 + k * 0.012, 0.855 + k * 0.012, bz0 + 0.2 + k * 0.005, bz0 + 0.5 + k * 0.004, rb.choice(PAL), r=0.002, seg=1)
pot(LV, bs['x'], bh, bz1 - 0.35, 0.08, 0.13, '#e9e5dc'); pothos_mound(bs['x'], bh + 0.13, bz1 - 0.35, 0.07, 14, 13)
for k in range(3): vine((bs['x'] + 0.04, bh + 0.12, bz1 - 0.35 + (k - 1) * 0.05), (1, 0, (k - 1) * 0.4), 0.55 + 0.2 * k, 80 + k)
vpaint(LV, '#c9a24f', lambda: LV.add_bm(L.lathe([(0.0, 0.0), (0.03, 0.0), (0.03, 0.16), (0.0, 0.16)], seg=10), Matrix.Translation(g2b(bs['x'], bh, bz0 + 0.4))))   # 花瓶（空的，裝了一支節拍器？）
vpaint(LV, '#2a2a2c', lambda: LV.add_bm(L.lathe([(0.0, 0.0), (0.06, 0.0), (0.03, 0.2), (0.0, 0.2)], seg=4), Matrix.Translation(g2b(bs['x'], bh, bz0 + 0.8))))   # 節拍器（四角錐）
# 軟木板（社團的傳單：空白）
cb = IT['cork_board'][0]; cy0, cy1, cz0, cz1 = cb['y'] - cb['h'] / 2, cb['y'] + cb['h'] / 2, cb['z'] - cb['w'] / 2, cb['z'] + cb['w'] / 2
LW.rbox(X0, X0 + 0.03, cy0 - 0.03, cy1 + 0.03, cz0 - 0.03, cz1 + 0.03, r=0.006, seg=2)
uvquad(G('props', 'left'), wall_quad('left', 0.031, cz0, cz1, cy0, cy1), pc('cork'))
rf = random.Random(21)
for k in range(7):
    w_ = rf.uniform(0.16, 0.24); h_ = w_ * 1.38; zc_ = cz0 + 0.14 + (k % 4) * 0.33 + rf.uniform(-0.03, 0.03); yc_ = cy1 - 0.2 - (k // 4) * 0.4 + rf.uniform(-0.03, 0.02)
    rect = pc(['flyer', 'paper', 'photo2', 'flyer', 'paper', 'photo0', 'flyer'][k])
    uvquad(G('props', 'left'), wall_quad('left', 0.033 + k * 0.0004, zc_ - w_ / 2, zc_ + w_ / 2, yc_ - h_ / 2, yc_ + h_ / 2), rect)
    vpaint(LV, ['#c83a2a', '#2a5aa8', '#e0b030'][k % 3], lambda: LV.sphere((X0 + 0.04 + k * 0.0004, yc_ + h_ / 2 - 0.02, zc_), 0.007, seg=6, rings=4))
# 邊櫃＋黃金葛
sc = IT['side_cabinet'][0]; scx0, scx1, scz0, scz1, sch = sc['x'] - sc['w'] / 2, sc['x'] + sc['w'] / 2, sc['z'] - sc['d'] / 2, sc['z'] + sc['d'] / 2, sc['h']
LW.rbox(scx0, scx1, 0.08, sch, scz0, scz1, r=0.008, seg=2); LV.crbox(scx0 + 0.03, scx1 - 0.03, 0.0, 0.08, scz0 + 0.03, scz1 - 0.03, '#3a2c22', r=0.004, seg=1)
LV.cbox(scx1 - 0.001, scx1 + 0.002, 0.12, sch - 0.04, (scz0 + scz1) / 2 - 0.003, (scz0 + scz1) / 2 + 0.003, '#3a2c22')   # 兩扇門的縫
for s in (-1, 1): G('metal', 'left').crbox(scx1, scx1 + 0.02, sch - 0.16, sch - 0.1, (scz0 + scz1) / 2 + s * 0.05 - 0.008, (scz0 + scz1) / 2 + s * 0.05 + 0.008, '#b9a27a', r=0.004, seg=1)
pot(LV, sc['x'], sch, sc['z'] - 0.2, 0.12, 0.16, '#b0653e'); pothos_mound(sc['x'], sch + 0.16, sc['z'] - 0.2, 0.1, 24, 17)
for k in range(5): vine((sc['x'] + 0.08, sch + 0.15, sc['z'] - 0.2 + (k - 2) * 0.06), (1, 0, (k - 2) * 0.35), 0.45 + 0.1 * k, 100 + k)
LV.crbox(sc['x'] - 0.1, sc['x'] + 0.1, sch, sch + 0.05, sc['z'] + 0.15, sc['z'] + 0.4, '#2a4a6a', r=0.004, seg=1)   # 一疊樂譜
# 靠牆的琴袋（裡面有一把吉他：客人寄放的）
gb = IT['gig_bag'][0]
o = [(u * 1.12, v * 1.1) for u, v in outline('dread')]; pt = Part(); body_shell(pt, o, 0.13, 0.04, pc('gigbag'), pc('gigbag')); prism(pt, [(-0.045, 0.5), (0.045, 0.5), (0.035, 1.02), (-0.035, 1.02)], 0.03, 0.1, pc('gigbag'), pc('gigbag'))
tb = math.radians(14); gfr2 = Frame((X0 + 0.32, 0.0, gb['z']), (math.cos(tb), math.sin(tb), 0), (-math.sin(tb), math.cos(tb), 0)); pt.into(G('props', 'left'), gfr2)
# 吊盆（門口上方，參考圖左上角垂下來的藤）
hx2, hz2, hy2 = -2.85, 5.2, 2.55
for k in range(3):
    a = 2 * math.pi * k / 3; vpaint(CV, '#c9b08a', lambda: CV.cyl((hx2, H, hz2), (hx2 + 0.11 * math.cos(a), hy2 + 0.12, hz2 + 0.11 * math.sin(a)), 0.003, seg=4))
pot(CV, hx2, hy2, hz2, 0.12, 0.13, '#e2ddd2'); pothos_mound(hx2, hy2 + 0.13, hz2, 0.1, 18, 23)
for k in range(6): vine((hx2 + 0.1 * math.cos(k * 1.1), hy2 + 0.12, hz2 + 0.1 * math.sin(k * 1.1)), (math.cos(k * 1.1), 0, math.sin(k * 1.1)), 0.6 + 0.2 * (k % 3), 120 + k)

# ---------------- 葉子、藤 ----------------
lf = G('leaf'); luv = lf.bm.loops.layers.uv.verify()
for (base, d, nrm, Lf, var) in LEAVES:
    side = d.cross(nrm)
    if side.length < 1e-4: side = d.cross(Vector((0, 0, 1)))
    side.normalize(); nn = side.cross(d).normalized(); Wf = Lf * 0.85
    mid_ = base + d * (Lf * 0.5) - nn * (Lf * 0.12)   # 葉片中間往下彎（兩片四邊形）
    pts = [base - side * Wf * 0.12, base + side * Wf * 0.12, mid_ + side * Wf * 0.5, mid_ - side * Wf * 0.5, base + d * Lf - nn * (Lf * 0.2)]
    u0 = 0.0 if var == 0 else 0.5
    vs = [lf.bm.verts.new(g2b(p.x, p.y, p.z)) for p in pts]
    for f_vs, uvs in (([vs[0], vs[1], vs[2], vs[3]], [(u0 + 0.21, 0.08), (u0 + 0.29, 0.08), (u0 + 0.49, 0.5), (u0 + 0.01, 0.5)]), ([vs[3], vs[2], vs[4]], [(u0 + 0.01, 0.5), (u0 + 0.49, 0.5), (u0 + 0.25, 0.98)])):
        f = lf.bm.faces.new(f_vs)
        for lp, t in zip(f.loops, uvs): lp[luv].uv = t
for pts in STEMS:   # 藤的莖：放在葉子的材質（雙面），UV 指到葉子中間的綠色
    for a, b in zip(pts, pts[1:]):
        before = set(lf.bm.faces); lf.cyl((a.x, a.y, a.z), (b.x, b.y, b.z), 0.0028, seg=3, caps=False)
        for f in lf.bm.faces:
            if f not in before:
                for lp in f.loops: lp[luv].uv = (0.25, 0.42)

# ---------------- 收尾：網格、字牌、合併、單面、匯出 ----------------
for (side, key), m in _meshes.items():
    uv = key not in UVKEYS and key not in ('vc', 'metal', 'glass', 'emit', 'leaf')
    ob = m.finish(root, uv=uv, smooth=key in ('guitar', 'metal', 'vc'), props={'dir': DIRS[side]} if side else None)
    if ob is not None and key == 'glass': ob.name = ob.name.replace('glass', 'glass')   # 名字裡有 glass（遊戲照名字當玻璃）
for name, pts, rect, props in PLATES:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = rect
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    me = bpy.data.meshes.new('PLATE_FACE_' + name); bm.to_mesh(me); bm.free(); me.materials.append(M['props'])
    ob = bpy.data.objects.new('PLATE_FACE_' + name, me); B.scene().collection.objects.link(ob); ob.parent = root
    for k_, v_ in props.items(): ob[k_] = v_
    L.uv_text(ob)
    # 遊戲沒畫字之前看起來是空白的紙／木板：UV 拉回貼圖集那一格
    uvd = me.uv_layers.active.data
    for lp in uvd: lp.uv = lerp_uv(rect, lp.uv[0], lp.uv[1])
for ob in list(root.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
ss = L.single_side(root, keep=r'glass|leaf', skip=lambda ob: 'FACE' in ob.name)
print('SINGLE_SIDE', json.dumps(ss, ensure_ascii=False))
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAYALL['version'], 'guitars': {'electric': NE, 'acoustic': NA, 'owner': 1, 'on_stand': 1}})
L.write_json(OUT[:-4] + '.json', info)
