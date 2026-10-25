"""教學館的家具模組（LAWWW 2026-10-13 18:05Z 分派；使用者同意的博雅自習區、101 大講堂做法）→ GLB，給遊戲用 InstancedMesh 放。
  /opt/blenv/bin/python tools/blender/env_second/furniture_study.py [-- --out 輸出.glb]

模組（每一個＝一個網格、一個材質 study_furn）：
  study_table2      自習雙人桌 0.9×0.6×0.75（圓角桌面、封邊、圓管桌腳與橫撐、桌面中間的插座盒）
  study_chair       自習椅（座高 0.45；圓管椅架、有弧度與厚度的夾板座面與椅背）
  study_chair_lod1  自習椅的簡化版（遠處）
  round_table       圓桌 Ø1.0×0.75（圓邊桌面、中柱、圓盤底座）
  lecture_seat      講堂椅（座位寬 0.52；圓邊布面座墊與椅背、胡桃木椅背殼、右側板＋扶手）
  lecture_seat_up   講堂椅、座面收起（空位）
  lecture_seat_lod1 講堂椅的簡化版（遠處的排）
  lecture_standard  排尾側板（最左邊座位的左邊）
  lecture_desk      前方連續桌板的一段（一個座位寬）
  door_frame        教室的門框（門洞 1.2×2.4、牆厚 0.2）
  door_leaf_open    門片：開著、貼在走廊那一面的牆上（上課時）
  door_leaf_closed  門片：關著
  door_plate        門牌（字由遊戲畫）
約定（照 LAWWW）：原點在地面中心、+z 朝前（椅子：坐的人面向 +z）、地面 y=0、公尺。尺寸表在 GLB 旁邊的 .json（modules）。
造型：Blender 的倒角（Bevel）、厚度（Solidify）、曲線圓管（Curve bevel），烤成網格；貼圖集 textures/gen/study_furn_atlas.png（木紋：Poly Haven walnut_veneer CC0 改色；金屬、布面、塑膠：程式畫的雜訊）。
"""
import json, math, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402
from mathutils import Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/furniture_study.glb'
ATLAS = os.path.join(HERE, 'textures', 'gen', 'study_furn_atlas.png')
ATLAS_NOR = os.path.join(HERE, 'textures', 'gen', 'study_furn_nor.png')
ATLAS_ORM = os.path.join(HERE, 'textures', 'gen', 'study_furn_orm.png')
N = 1024
REG = {'oak': (0.0, 0.5, 0.5, 1.0), 'walnut': (0.5, 0.5, 1.0, 1.0), 'metal': (0.0, 0.0, 0.5, 0.5), 'fabric': (0.5, 0.125, 1.0, 0.5), 'plastic': (0.5, 0.0, 1.0, 0.125)}


def make_atlas():
    src = Image.open(os.path.join(HERE, 'textures', 'walnut_veneer', 'walnut_veneer_diff_1k.jpg')).convert('RGB').resize((512, 512), Image.LANCZOS)
    a = np.asarray(src, dtype=np.float32) / 255.0

    def recolor(arr, target, contrast):
        g = arr.mean(axis=2, keepdims=True); arr = g + (arr - g) * 0.5
        arr = (arr - arr.mean(axis=(0, 1))) * contrast + np.array(target)
        return np.clip(arr, 0, 1)
    oak = recolor(a, (0.80, 0.66, 0.47), 1.1)
    wal = recolor(a, (0.42, 0.29, 0.19), 1.2)
    rng = np.random.default_rng(5)
    met = np.full((512, 512, 3), (0.24, 0.25, 0.27), np.float32) + (rng.normal(0, 1, (512, 1, 1)) * 0.012).astype(np.float32)
    met = np.clip(met + rng.normal(0, 0.008, (512, 512, 1)).astype(np.float32), 0, 1)
    y, x = np.mgrid[0:384, 0:512].astype(np.float32)
    weave = 0.5 + 0.5 * np.sin(x * 1.6) * np.sin(y * 1.6)
    fab = np.stack([0.24 + 0.025 * weave, 0.30 + 0.025 * weave, 0.44 + 0.03 * weave], axis=2) + rng.normal(0, 0.012, (384, 512, 1))   # 藍灰布（遊戲的光線下比 Blender 暗，底色調亮一點）
    pla = np.full((128, 512, 3), (0.90, 0.89, 0.87), np.float32) + rng.normal(0, 0.006, (128, 512, 1))
    img = np.zeros((N, N, 3), np.float32)
    img[0:512, 0:512] = oak; img[0:512, 512:1024] = wal
    img[512:1024, 0:512] = met
    img[512:896, 512:1024] = np.clip(fab, 0, 1)
    img[896:1024, 512:1024] = np.clip(pla, 0, 1)
    os.makedirs(os.path.dirname(ATLAS), exist_ok=True)
    Image.fromarray((img * 255).astype(np.uint8)).save(ATLAS)
    # 法線（512）：木紋區用 walnut_veneer 的法線（OpenGL），其他區域平的
    nor = np.zeros((512, 512, 3), np.uint8); nor[:] = (128, 128, 255)
    wn = np.asarray(Image.open(os.path.join(HERE, 'textures', 'walnut_veneer', 'walnut_veneer_nor_gl_1k.jpg')).convert('RGB').resize((256, 256), Image.LANCZOS))
    nor[0:256, 0:256] = wn; nor[0:256, 256:512] = wn
    Image.fromarray(nor).save(ATLAS_NOR)
    # 粗糙度（G）／金屬度（B）（128）：上漆木皮 0.5、胡桃木 0.45、烤漆鋼管 0.38／0.25（遊戲沒有環境貼圖，金屬度不能高）、布 0.92、塑膠 0.5
    orm = np.zeros((128, 128, 3), np.uint8); orm[..., 0] = 255
    for key, rough, metal in (('oak', 0.5, 0.0), ('walnut', 0.45, 0.0), ('metal', 0.38, 0.25), ('fabric', 0.92, 0.0), ('plastic', 0.5, 0.0)):
        u0, v0, u1, v1 = REG[key]; r0, r1 = int(round((1 - v1) * 128)), int(round((1 - v0) * 128)); c0, c1 = int(round(u0 * 128)), int(round(u1 * 128))
        orm[r0:r1, c0:c1, 1] = int(rough * 255); orm[r0:r1, c0:c1, 2] = int(metal * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ---------------- 造型：先做 Blender 物件（加修改器），最後烤成網格、照區域給 UV、合成一件 ----------------
def _link(ob): B.scene().collection.objects.link(ob); return ob


def mesh_ob(name, verts_g, faces):
    """遊戲座標的頂點 → Blender 物件"""
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*v)) for v in verts_g], [], faces); me.update()
    return _link(bpy.data.objects.new(name, me))


def rbox(name, x0, x1, y0, y1, z0, z1, bevel=0.0, seg=2, along_x=False):
    """方塊＋倒角。along_x：只倒 x 方向的邊（連續的桌板：左右兩端平的，一段接一段看不到縫）"""
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), (x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    ob = mesh_ob(name, v, f)
    if bevel > 0:
        m = ob.modifiers.new('bv', 'BEVEL'); m.width = bevel; m.segments = seg; m.limit_method = 'NONE'
        if along_x:
            me = ob.data; at = me.attributes.get('bevel_weight_edge') or me.attributes.new('bevel_weight_edge', 'FLOAT', 'EDGE')
            for e in me.edges:
                a, b = me.vertices[e.vertices[0]].co, me.vertices[e.vertices[1]].co
                at.data[e.index].value = 1.0 if abs(a.x - b.x) > 1e-6 else 0.0
            m.limit_method = 'WEIGHT'
    return ob


def rounded_slab(name, w, d, y0, y1, r, nseg=5, bevel=0.004, cx=0.0, cz=0.0):
    """圓角長方形的板（桌面）：四個角半徑 r，上下兩面＋側面；邊緣倒角"""
    pts = []
    for (sx, sz, a0) in ((1, 1, 0.0), (-1, 1, math.pi / 2), (-1, -1, math.pi), (1, -1, 1.5 * math.pi)):
        ccx, ccz = cx + sx * (w / 2 - r), cz + sz * (d / 2 - r)
        for k in range(nseg + 1):
            a = a0 + (math.pi / 2) * k / nseg; pts.append((ccx + r * math.cos(a), ccz + r * math.sin(a)))
    n = len(pts); v = [(x, y0, z) for x, z in pts] + [(x, y1, z) for x, z in pts]
    f = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    ob = mesh_ob(name, v, f)
    if bevel > 0:
        m = ob.modifiers.new('bv', 'BEVEL'); m.width = bevel; m.segments = 2; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(50)
    return ob


def disc_slab(name, r, y0, y1, n=32, bevel=0.005, cx=0.0, cz=0.0):
    pts = [(cx + r * math.cos(2 * math.pi * k / n), cz + r * math.sin(2 * math.pi * k / n)) for k in range(n)]
    v = [(x, y0, z) for x, z in pts] + [(x, y1, z) for x, z in pts]
    f = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    ob = mesh_ob(name, v, f)
    if bevel > 0:
        m = ob.modifiers.new('bv', 'BEVEL'); m.width = bevel; m.segments = 2; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(50)
    return ob


def tube(name, pts_g, r, res=2, nsides=None):
    """曲線圓管（遊戲座標的折線，轉角用小圓弧）"""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = res; cu.use_fill_caps = True
    cu.resolution_u = 4
    sp = cu.splines.new('POLY'); sp.points.add(len(pts_g) - 1)
    for p, q in zip(sp.points, pts_g): b = g2b(*q); p.co = (b.x, b.y, b.z, 1.0)
    return _link(bpy.data.objects.new(name, cu))


def bent(pts, rad=0.03, n=3):
    """折線的每個轉角換成小圓弧（看起來像彎管）"""
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = map(np.array, (pts[i - 1], pts[i], pts[i + 1]))
        u1 = (a - b) / (np.linalg.norm(a - b) + 1e-9); u2 = (c - b) / (np.linalg.norm(c - b) + 1e-9)
        p0, p1 = b + u1 * rad, b + u2 * rad
        for k in range(n + 1):
            t = k / n; q = (1 - t) ** 2 * p0 + 2 * (1 - t) * t * b + t ** 2 * p1; out.append(tuple(q))
    out.append(pts[-1]); return out


def shell(name, w, h, thick, bend_r, curve_axis, origin, tilt=0.0, nx=8, ny=5, dish=0.0, roll=0.0):
    """有弧度的夾板（座面、椅背）：w×h 的格子，彎曲＋厚度（Solidify）＋倒角。
    curve_axis='h'：水平方向彎（椅背）；'seat'：座面（中間微凹 dish、前緣往下捲 roll）。origin＝中心（遊戲座標）；tilt＝往後仰（弧度）"""
    ox, oy, oz = origin; v = []; f = []
    for j in range(ny + 1):
        for i in range(nx + 1):
            u = -w / 2 + w * i / nx; t = -h / 2 + h * j / ny
            if curve_axis == 'h':   # 椅背：水平彎（圓心在前方 bend_r）、往後仰 tilt
                ang = u / bend_r; x = bend_r * math.sin(ang); zc = -(bend_r - bend_r * math.cos(ang))
                y = t * math.cos(tilt); z = zc - t * math.sin(tilt)
                v.append((ox + x, oy + y, oz + z))
            else:                   # 座面：x＝左右、t＝前後（+ 往前）；中間微凹、前緣往下捲
                rr = (u / (w / 2)) ** 2 + (t / (h / 2)) ** 2; y = -dish * (1 - min(1, rr))
                if t > h / 2 - 0.05: y -= roll * ((t - (h / 2 - 0.05)) / 0.05) ** 2
                v.append((ox + u, oy + y, oz + t))
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i; f.append((a, a + 1, a + nx + 2, a + nx + 1))
    ob = mesh_ob(name, v, f)
    s = ob.modifiers.new('sd', 'SOLIDIFY'); s.thickness = thick; s.offset = -1.0
    b = ob.modifiers.new('bv', 'BEVEL'); b.width = min(0.004, thick * 0.4); b.segments = 1; b.limit_method = 'ANGLE'; b.angle_limit = math.radians(60)
    return ob


def cushion(name, x0, x1, y0, y1, z0, z1, round_=0.03, tilt=0.0, pivot=None):
    """軟墊：方塊＋大倒角（3 段）"""
    ob = rbox(name, x0, x1, y0, y1, z0, z1, bevel=round_, seg=3)
    if tilt:
        px, py, pz = pivot; me = ob.data
        for vv in me.vertices:
            gx, gy, gz = vv.co.x, vv.co.z, -vv.co.y
            dy, dz = gy - py, gz - pz; ny_ = py + dy * math.cos(tilt) + dz * math.sin(tilt); nz_ = pz - dy * math.sin(tilt) + dz * math.cos(tilt)
            vv.co = g2b(gx, ny_, nz_)
    return ob


def bake(parts, name):
    """修改器烤進網格、每一個零件照區域給 UV（依面的主要方向投影，1 個區域＝1 m；木紋沿著零件最長的方向）、合成一件"""
    dg = bpy.context.evaluated_depsgraph_get(); bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
    for ob, reg in parts:
        ev = ob.evaluated_get(dg); me = bpy.data.meshes.new_from_object(ev)
        tmp = bmesh.new(); tmp.from_mesh(me); r = REG[reg]
        xs = [vv.co for vv in tmp.verts]
        mn = [min(c[i] for c in xs) for i in range(3)] if xs else [0, 0, 0]
        ext = [max(c[i] for c in xs) - mn[i] for i in range(3)] if xs else [1, 1, 1]
        long_ax = int(np.argmax(ext))
        tuv = tmp.loops.layers.uv.get('UVMap') or tmp.loops.layers.uv.new('UVMap')
        for fc in tmp.faces:
            n = fc.normal; ax = int(np.argmax([abs(n.x), abs(n.y), abs(n.z)]))
            others = [i for i in range(3) if i != ax]
            if long_ax in others: others = [i for i in others if i != long_ax] + [long_ax]   # 最長的方向放在 v（木紋）
            for lp in fc.loops:   # 零件自己的最小角＝區域的角（同一個零件的 UV 連續、不會跨過區域邊界）；1 m＝整個區域（超過 1 m 的零件縮進去）
                c = lp.vert.co; u0 = (c[others[0]] - mn[others[0]]) / max(1.0, ext[others[0]]); v0 = (c[others[1]] - mn[others[1]]) / max(1.0, ext[others[1]])
                lp[tuv].uv = (r[0] + (0.03 + u0 * 0.94) * (r[2] - r[0]), r[1] + (0.03 + v0 * 0.94) * (r[3] - r[1]))
        if os.environ.get('FURN_DEBUG'): print('  part', name, ob.name, reg, len(tmp.faces), 'faces', sum(len(f.verts) - 2 for f in tmp.faces), 'tris')
        tmp.to_mesh(me); tmp.free()
        bm.from_mesh(me); bpy.data.meshes.remove(me)
        bpy.data.objects.remove(ob, do_unlink=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return me


# ---------------- 各件家具 ----------------
def study_table2():
    W, D, H = 0.9, 0.6, 0.75; P = []
    P.append((rounded_slab('top', W, D, H - 0.026, H, 0.04, nseg=5, bevel=0.004), 'oak'))
    for sx in (-1, 1):   # 兩側的 ㄇ 形圓管桌腳（腳＋底部橫桿＋上面的橫撐）
        x = sx * (W / 2 - 0.06)
        P.append((tube('leg', bent([(x, 0.0, -D / 2 + 0.06), (x, H - 0.03, -D / 2 + 0.06), (x, H - 0.03, D / 2 - 0.06), (x, 0.0, D / 2 - 0.06)], 0.03), 0.014), 'metal'))
    P.append((tube('rail', [(-W / 2 + 0.06, H - 0.07, 0.0), (W / 2 - 0.06, H - 0.07, 0.0)], 0.012), 'metal'))
    P.append((rbox('outlet', -0.07, 0.07, H, H + 0.034, -0.045, 0.045, bevel=0.008, seg=2), 'plastic'))
    for z in (-0.046, 0.046): P.append((rbox('sock', -0.028, 0.028, H + 0.008, H + 0.026, z - 0.002, z + 0.002), 'metal'))
    return P, {'size': [W, H, D], 'seats': [{'x': 0, 'y': 0.45, 'z': 0.55, 'yaw': round(math.pi, 4), 'note': '+z 那一側的椅子（面向 −z）'}, {'x': 0, 'y': 0.45, 'z': -0.55, 'yaw': 0, 'note': '−z 那一側（面向 +z）'}],
               'nav': '桌子 0.9×0.6；兩張椅子各 0.46×0.46，中心離桌子中心 0.55 m（照 LAWWW 博雅自習區第二版 4e2db1f：桌子長邊南北向、椅子在東西兩側——放的時候整組轉 90°）'}


def study_chair(lod=0):
    SH = 0.45; P = []
    if lod == 0:
        for sx in (-1, 1):
            x = sx * 0.2
            P.append((tube('front', [(x, 0.0, 0.2), (x, SH - 0.03, 0.19)], 0.011), 'metal'))
            P.append((tube('rear', bent([(x, 0.0, -0.22), (x, SH - 0.03, -0.19), (x, 0.84, -0.245)], 0.04), 0.011), 'metal'))
            P.append((tube('side', [(x, SH - 0.035, 0.19), (x, SH - 0.035, -0.19)], 0.009), 'metal'))
        P.append((tube('frail', [(-0.2, SH - 0.035, 0.19), (0.2, SH - 0.035, 0.19)], 0.009), 'metal'))
        P.append((tube('brail', [(-0.2, SH - 0.035, -0.19), (0.2, SH - 0.035, -0.19)], 0.009), 'metal'))
        P.append((shell('seat', 0.44, 0.42, 0.012, 1.0, 'seat', (0.0, SH, 0.0), nx=8, ny=6, dish=0.012, roll=0.022), 'oak'))
        P.append((shell('back', 0.42, 0.21, 0.012, 0.55, 'h', (0.0, 0.73, -0.215), tilt=0.14, nx=10, ny=3), 'oak'))
    else:
        for sx in (-1, 1):
            P.append((rbox('l', sx * 0.2 - 0.011, sx * 0.2 + 0.011, 0.0, SH, 0.18, 0.2), 'metal'))
            P.append((rbox('r', sx * 0.2 - 0.011, sx * 0.2 + 0.011, 0.0, 0.84, -0.23, -0.21), 'metal'))
        P.append((rbox('s', -0.22, 0.22, SH - 0.015, SH, -0.21, 0.21), 'oak'))
        P.append((rbox('b', -0.21, 0.21, 0.63, 0.83, -0.24, -0.225), 'oak'))
    return P, {'size': [0.45, 0.85, 0.46], 'seat': {'x': 0, 'y': SH, 'z': 0.0, 'yaw': 0}, 'nav': '0.46×0.46'}


def round_table():
    R, H = 0.5, 0.75; P = []
    P.append((disc_slab('top', R, H - 0.028, H, n=40, bevel=0.005), 'oak'))
    P.append((tube('col', [(0.0, 0.03, 0.0), (0.0, H - 0.028, 0.0)], 0.035, res=2), 'metal'))
    P.append((disc_slab('base', 0.25, 0.0, 0.025, n=28, bevel=0.008), 'metal'))
    P.append((disc_slab('plate', 0.12, H - 0.05, H - 0.028, n=20, bevel=0.0), 'metal'))
    return P, {'size': [1.0, H, 1.0], 'seats': [{'x': round(0.8 * math.sin(a), 3), 'y': 0.45, 'z': round(0.8 * math.cos(a), 3), 'yaw': round((a + math.pi) % (2 * math.pi), 4)} for a in (0.0, math.pi / 2, math.pi, 1.5 * math.pi)],
               'nav': '圓：半徑 0.5（椅子 4 張在東南西北、中心離桌心 0.8 m、面向桌心：照 LAWWW 4e2db1f）'}


def rot_x(ob, ang, pivot):
    """零件繞著通過 pivot（遊戲座標）、平行 x 軸的軸轉 ang（正的：前緣往上）"""
    py, pz = pivot
    for vv in ob.data.vertices:
        gx, gy, gz = vv.co.x, vv.co.z, -vv.co.y; dy, dz = gy - py, gz - pz
        vv.co = g2b(gx, py + dy * math.cos(ang) + dz * math.sin(ang), pz - dy * math.sin(ang) + dz * math.cos(ang))
    return ob


def lecture_seat(lod=0, up=False):
    """講堂椅：兩側的側板支撐（右側板在這一件、左邊用隔壁座位的右側板；排尾另外放 lecture_standard），沒有中柱。
    up＝座面收起（空位；真實的講堂椅沒人坐時彈起來）"""
    SH = 0.47; P = []
    if lod == 0:
        P.append((rbox('std', 0.243, 0.262, 0.0, 0.655, -0.27, 0.27, bevel=0.006, seg=2), 'walnut'))          # 右側板
        P.append((rbox('arm', 0.232, 0.273, 0.655, 0.69, -0.2, 0.31, bevel=0.012, seg=2), 'walnut'))        # 扶手（圓邊）
        seat = [(rbox('pan', -0.236, 0.236, SH - 0.085, SH - 0.06, -0.17, 0.24), 'walnut'),   # 座面底板：木（收起時看得到這一面；金屬色在遊戲裡幾乎是黑的）
                (cushion('seatc', -0.232, 0.232, SH - 0.06, SH + 0.012, -0.17, 0.245, round_=0.028), 'fabric'),
                (rbox('hinge', -0.243, 0.243, SH - 0.075, SH - 0.045, -0.15, -0.11), 'metal')]   # 轉軸（左右接到側板）
        if up:
            for ob, _ in seat[:2]: rot_x(ob, math.radians(83), (SH - 0.04, -0.13))
        P += seat
        P.append((cushion('backc', -0.232, 0.232, SH + 0.05, 0.97, -0.255, -0.19, round_=0.028, tilt=0.16, pivot=(0.0, SH + 0.05, -0.22)), 'fabric'))
        P.append((shell('backshell', 0.48, 0.5, 0.012, 1.2, 'h', (0.0, SH + 0.3, -0.27), tilt=0.16, nx=6, ny=2), 'walnut'))
        P.append((rbox('bstrut', -0.012, 0.012, SH - 0.07, SH + 0.07, -0.27, -0.2), 'metal'))   # 椅背下緣接轉軸
    else:
        P.append((rbox('std', 0.243, 0.262, 0.0, 0.69, -0.27, 0.3), 'walnut'))
        P.append((rbox('seatc', -0.232, 0.232, SH - 0.06, SH + 0.01, -0.17, 0.245), 'fabric'))
        P.append((cushion('backc', -0.232, 0.232, SH + 0.05, 0.97, -0.255, -0.19, round_=0.0, tilt=0.16, pivot=(0.0, SH + 0.05, -0.22)), 'fabric'))
    info = {'size': [0.52, 1.0, 0.6], 'pitch': 0.52, 'seat': {'x': 0, 'y': SH, 'z': 0.03, 'yaw': 0}, 'nav': '整排不能走（從走道側身進去）'}
    if up: info['note'] = '空位：座面收起（約 83°）；有人坐的位子換成 lecture_seat'
    return P, info


def lecture_standard():
    P = [(rbox('std', -0.0095, 0.0095, 0.0, 0.655, -0.27, 0.27, bevel=0.006, seg=2), 'walnut'),
         (rbox('arm', -0.0205, 0.0205, 0.655, 0.69, -0.2, 0.31, bevel=0.012, seg=2), 'walnut')]
    return P, {'size': [0.041, 0.69, 0.58], 'note': '排尾（最左邊座位的左邊）：放在 x＝座位中心 −0.2525'}


def lecture_desk():
    """前方連續桌板的一段（坐在這個位子的人用的；裝在後一排的地面上、緊貼前一排的椅背後面）"""
    P = [(rbox('top', -0.26, 0.26, 0.72, 0.75, 0.30, 0.64, bevel=0.008, seg=2, along_x=True), 'walnut'),
         (rbox('panel', -0.26, 0.26, 0.30, 0.72, 0.615, 0.635, bevel=0.004, seg=1, along_x=True), 'walnut'),
         (rbox('bracket', -0.012, 0.012, 0.0, 0.72, 0.55, 0.615), 'metal')]
    return P, {'size': [0.52, 0.75, 0.34], 'offset': '和講堂椅同一個 x、同一個原點（桌板在 z 0.30–0.64）；排距 1.0 m、每排升高 0.16 m 時，桌板前緣離前一排的椅背約 3 cm（排距小於 0.98 m 會碰到）'}


# ---------------- 教室的門（LAWWW 20:02Z：門框、上課時開著靠牆的門片、門牌；門片不擋門口的導航和鏡頭）----------------
# 約定：原點＝門洞中心的地面；x 沿著牆、z＝0 是牆的中心面、+z＝走廊那一側；牆厚 0.2（教學館模板 wallT）、門洞 1.2×2.4（模板 gaps 1.2、2.4 m 以上是門楣）
DW, DH, WT = 1.2, 2.4, 0.2


def door_frame():
    """門框：門洞裡的框（三面）＋兩面的門框飾條（深灰鋁）"""
    P = []
    hw = DW / 2
    P.append((rbox('jl', -hw, -hw + 0.03, 0.0, DH, -WT / 2, WT / 2, bevel=0.003, seg=1), 'metal'))
    P.append((rbox('jr', hw - 0.03, hw, 0.0, DH, -WT / 2, WT / 2, bevel=0.003, seg=1), 'metal'))
    P.append((rbox('jh', -hw, hw, DH - 0.03, DH, -WT / 2, WT / 2, bevel=0.003, seg=1), 'metal'))
    for sz in (-1, 1):
        z0, z1 = sorted((sz * WT / 2, sz * (WT / 2 + 0.015)))
        P.append((rbox('cl', -hw - 0.065, -hw + 0.015, 0.0, DH + 0.065, z0, z1, bevel=0.004, seg=1), 'metal'))
        P.append((rbox('cr', hw - 0.015, hw + 0.065, 0.0, DH + 0.065, z0, z1, bevel=0.004, seg=1), 'metal'))
        P.append((rbox('ch', -hw - 0.065, hw + 0.065, DH - 0.015, DH + 0.065, z0, z1, bevel=0.004, seg=1), 'metal'))
    return P, {'size': [DW + 0.13, DH + 0.065, WT + 0.03], 'note': '門洞 1.2×2.4、牆厚 0.2；放在門洞中心的地面，z 軸垂直於牆；不擋導航（全部在牆的範圍裡＋兩面各凸 1.5 cm）'}


def _leaf(x0, x1, z0, z1, latch_x, closed):
    """門片（淺橡木）＋直條觀景窗（深色玻璃）＋拉桿把手＋踢腳板；x0..x1、z0..z1 是門片的範圍（遊戲座標）"""
    P = [(rbox('leaf', x0, x1, 0.012, DH - 0.06, z0, z1, bevel=0.004, seg=1), 'oak')]
    wx0, wx1 = sorted((latch_x - 0.2 * (1 if latch_x > (x0 + x1) / 2 else -1), latch_x - 0.08 * (1 if latch_x > (x0 + x1) / 2 else -1)))
    for zz, sgn in ((z0, -1), (z1, 1)):   # 兩面
        P.append((rbox('vis', wx0, wx1, 1.05, 1.85, min(zz, zz + sgn * 0.002), max(zz, zz + sgn * 0.002)), 'metal'))
        P.append((rbox('kick', x0 + 0.02, x1 - 0.02, 0.02, 0.24, min(zz, zz + sgn * 0.0015), max(zz, zz + sgn * 0.0015)), 'metal'))
        hx = latch_x - 0.07 * (1 if latch_x > (x0 + x1) / 2 else -1); hz = zz + sgn * 0.06
        P.append((tube('rose', [(hx, 1.0, zz), (hx, 1.0, zz + sgn * 0.012)], 0.03, res=1), 'metal'))
        P.append((tube('lever', bent([(hx, 1.0, zz), (hx, 1.0, hz), (hx + (-0.12 if latch_x > (x0 + x1) / 2 else 0.12), 1.0, hz)], 0.02), 0.009), 'metal'))
    return P


def door_leaf_open():
    """開著、整片貼在走廊那一面的牆上（鉸鏈在左邊的門框、轉 180°）——上課時的樣子；不擋門口、不擋鏡頭"""
    hw = DW / 2; z0 = WT / 2 + 0.017; z1 = z0 + 0.045
    P = _leaf(-hw - 1.12, -hw - 0.02, z0, z1, latch_x=-hw - 1.12 + 0.02, closed=False)
    P.append((tube('stop', [(-hw - 1.0, 0.0, WT / 2), (-hw - 1.0, 0.0, z1 + 0.01)], 0.015, res=1), 'metal'))   # 地上的門檔（擋住門片）
    return P, {'size': [1.1, DH - 0.06, 0.045], 'note': '門片在門洞左邊（x −1.72～−0.62）貼著走廊那一面的牆（z 0.117～0.162）；凸出牆面 6 cm'}


def door_leaf_closed():
    """關著（關著的房間、還沒開放的教室）：門片在門洞中間"""
    hw = DW / 2
    P = _leaf(-hw + 0.035, hw - 0.035, -0.0225, 0.0225, latch_x=hw - 0.035, closed=True)
    return P, {'size': [DW - 0.07, DH - 0.06, 0.045], 'note': '門洞裡、牆的中心面'}


def door_plate():
    """門牌：走廊那一面、門的右邊，白底＋深灰框；字由遊戲畫（text 中心與大小見 note）"""
    x0, x1, y0, y1, z = 0.74, 1.04, 1.55, 1.70, WT / 2
    P = [(rbox('pframe', x0, x1, y0, y1, z, z + 0.012, bevel=0.003, seg=1), 'metal'),
         (rbox('pface', x0 + 0.012, x1 - 0.012, y0 + 0.012, y1 - 0.012, z + 0.012, z + 0.014), 'plastic')]
    return P, {'size': [0.3, 0.15, 0.014], 'note': '字：中心 (0.89, 1.625, 0.115)、寬 0.25、高 0.11、面向 +z（走廊）；例如「博雅 101」'}


def build():
    make_atlas()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('furniture_study', props={'kind': 'furniture_study'})
    mat = bpy.data.materials.new('study_furn'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    mat.use_backface_culling = True   # 單面（PERF-PATROL-ECON-1025）：倒角方盒、Solidify 的夾板、有蓋的圓管都是封閉的，背面看不到；博雅大廳 32 張自習椅＋桌子雙面時多畫一倍
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack()
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(ATLAS_NOR); tn.image.colorspace_settings.name = 'Non-Color'; tn.image.pack()
    nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 0.6
    nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    mods = {}
    for name, fn in (('study_table2', study_table2), ('study_chair', study_chair), ('study_chair_lod1', lambda: study_chair(1)), ('round_table', round_table),
                     ('lecture_seat', lecture_seat), ('lecture_seat_up', lambda: lecture_seat(0, True)), ('lecture_seat_lod1', lambda: lecture_seat(1)), ('lecture_standard', lecture_standard), ('lecture_desk', lecture_desk),
                     ('door_frame', door_frame), ('door_leaf_open', door_leaf_open), ('door_leaf_closed', door_leaf_closed), ('door_plate', door_plate)):
        parts, info = fn()
        me = bake(parts, name); me.materials.append(mat)
        for p in me.polygons: p.use_smooth = True
        try: me.set_sharp_from_angle(angle=math.radians(50))
        except Exception: pass
        ob = _link(bpy.data.objects.new(name, me)); ob.parent = root; ob['module'] = name
        info['tris'] = sum(len(p.vertices) - 2 for p in me.polygons)
        mods[name] = info
    for i, ob in enumerate(sorted(root.children, key=lambda o: o.name)):   # 檢視用：排開（遊戲端用網格本身，不管這個位置）
        ob.location = g2b(i * 1.3 - 4.5, 0, 0)
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = os.path.relpath(ATLAS, L.ROOT)
    info['note'] = '每件家具一個網格、一個材質（study_furn，共用貼圖集）；原點在地面中心、+z 朝前；GLB 裡的物件位置只是排開給人看，遊戲端用網格本身'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False))
    return info


if __name__ == '__main__':
    build()
