"""ART-TUTOR1（LAWWW2-B 2026-10-16 11:01 派工）家教學生家客廳的道具組（tutor_home；BB_132 第 55b 組的提示詞當規格；BB-B 支援製作）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/tutor_props.py [-- --out assets/models/env/second_ai/bb_support/tutor_props.glb]

大一下第 3 週起，明軒介紹的家教（BB_96 3-2）：一般三房兩廳公寓的客廳，平日晚上七點多，國中生補公民。
LAWWW2-B 用 bg_home.py 組場景、打光、算 2D 背景；這裡只做道具。和「臺北的家」客廳（home_living）不能是同一間：沙發換款、換色。
每件一個頂層節點（原點＝底部中央、正面朝 +z）：
  TUTOR_TABLE     木頭矮桌 1.0 (x) × 0.6 (z) × 0.4 m：圓角桌面、有使用痕跡的深淺（中間寫字的地方磨亮、邊緣深）
  TUTOR_CUSHIONS  兩個方形坐墊（布面、中間壓扁的凹、中央一顆釘扣）
  TUTOR_STUDY     桌上一組：攤開的國中公民課本、攤開的練習簿、兩支筆、橡皮擦、半杯麥茶。**y=0 是桌面**（擺在矮桌上：y＋0.40）
  TUTOR_SOFA      舊的三人布沙發（米灰、方圓扶手、坐墊有點塌）＋右邊扶手上搭一件國中運動外套（深藍＋白條紋，沒有校名）
  TUTOR_TVSTAND   矮電視櫃 1.6 m＋關著的電視＋全家福相框（只有色塊）＋一小盆植物
  TUTOR_LAMP      沙發旁的立燈（布燈罩）；燈罩內面＋燈泡是獨立網格 TUTOR_LAMP_GLOW（LAWWW2-B 做發光）
  TUTOR_WALL      牆上小物：時鐘（沒有數字，七點二十分）、日曆（色塊）。原點＝貼牆面的底部中央，正面 +z
  TUTOR_RUG       小地毯 1.6 × 1.2 m（邊框、內框、中間菱形，頂點色）＋短邊的流蘇
GLB 裡的位置只是排開給人看（矮桌、坐墊、課本組、地毯排成一組；其他排一排）。
兩個材質：tutor_metal（頂點色＋金屬 0.40）、tutor_vc（頂點色）。不放任何字、校名、品牌（D77）。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402
from mathutils import Matrix, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/tutor_props.glb'

# 顏色（sRGB）
WOOD = '#8a6847'        # 矮桌（中等深的柚木色）
WOOD_D = '#6b4f36'      # 桌腳、邊緣
OAK = '#b4936c'         # 電視櫃（淺橡木）
OAK_D = '#8f7252'
FAB = '#b5afa4'         # 沙發布面（米灰）
FAB2 = '#aea89c'
FAB3 = '#bbb5aa'
FAB_D = '#9a9488'       # 沙發底座
LEG = '#5e4632'
NAVY = '#24345c'        # 國中運動外套
NAVY2 = '#2b3d68'
STRIPE = '#eceae4'
SAGE = '#7f8b6b'        # 坐墊
OCHRE = '#c08d5e'
PAPER = '#f1ede2'
PAPER_E = '#e2d9c6'     # 書頁的側邊
INK = '#a8a296'         # 內頁的文字行（灰）
TEAL = '#3d7c8a'        # 公民課本封面
FIG = '#e0b7a0'         # 課本的插圖色塊
FIG2 = '#9cc0a4'
YEL = '#d8a540'         # 練習簿封面
RULE = '#8fa6bd'        # 練習簿的格線
PEN_B = '#2f5597'
PEN_K = '#26282b'
SILVER = '#b9bdc3'
ERASER = '#f2f1ec'
SLEEVE = '#2f6fb3'
GLASS = '#d5dfdc'
GLASS_I = '#c3cfcc'
RIM = '#eef3f1'
TEA = '#b98a46'
TEA_S = '#a8763a'
TV = '#16181a'
SCREEN = '#0e1114'
FRAME = '#6b5440'
SKY = '#a9c4d8'
GRASS = '#7f9d6a'
SKIN = '#e2c1a4'
SHIRT1 = '#c25b4f'
SHIRT2 = '#3f5f8a'
SHIRT3 = '#e8e3d6'
HAIR = '#2a2220'
POT = '#e6e2da'
SOIL = '#4a3a2c'
LEAF = '#4f7a45'
LEAF2 = '#6a944f'
ROUTER = '#2b2d30'
LED = '#4fbf6a'
HANDLE = '#8d9095'
BRONZE = '#3b3a37'
POLE = '#8e8a82'
SHADE = '#e9dfc9'
SHADE_RIM = '#d8ccb3'
GLOWC = '#fff2d6'
CLK_F = '#f3f1ec'
CLK_R = '#5a4a3c'
CLK_H = '#1e1f21'
CAL = '#f6f4ef'
CAL_G = '#e4dfd4'
CAL_R = '#c94f45'
CAL_P1 = '#8fb1c9'
CAL_P2 = '#c9a77c'
RUG_B = '#7c5a48'       # 地毯邊框
RUG_I = '#e5d9c3'       # 細的米白帶
RUG_F = '#c9b394'       # 底色
RUG_M = '#9d6f57'       # 中間菱形
RUG_M2 = '#d9c7a6'
FRINGE = '#ece4d2'

B.reset(texres=256)
M_METAL = L.vc_metal('tutor_metal', rough=0.42, metal=0.40)
M_VC = L.vc_material('tutor_vc', rough=0.78)


def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _rgb(hexcol):
    return [int(hexcol[i:i + 2], 16) / 255 for i in (1, 3, 5)]


def b2g(co):
    """Blender 座標 → 遊戲座標"""
    return (co.x, co.z, -co.y)


class Part(L.CMesh):
    def _new(self, fn, col):
        before = set(self.bm.faces); fn(); return self.paint([f for f in self.bm.faces if f not in before], col)

    def _newf(self, fn):
        before = set(self.bm.faces); fn(); return [f for f in self.bm.faces if f not in before]

    def vpaint(self, faces, fn):
        """逐頂點上色：fn(遊戲 x, y, z) → sRGB 0..1 的三個數"""
        for f in faces:
            for lp in f.loops:
                c = fn(*b2g(lp.vert.co))
                lp[self.col] = [_lin(max(0.0, min(1.0, v))) for v in c] + [1.0]
        return faces

    def fpaint(self, faces, fn):
        """逐面上色：fn(面中心的遊戲 x, y, z, 面) → hex"""
        for f in faces:
            self.paint([f], fn(*b2g(f.calc_center_median()), f))
        return faces

    def tube(self, a, b, r, col, seg=10, caps=True, r2=None):
        return self._new(lambda: self.cyl(a, b, r, seg=seg, caps=caps, r2=r2), col)

    def rb(self, x0, x1, y0, y1, z0, z1, col, r=0.012, seg=2):
        return self.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg)

    def rb_rot(self, c, w, h, d, col, rx=0.0, ry=0.0, rz=0.0, r=0.01, seg=2):
        bm = L.rbox_bm(w, h, d, r, seg)
        m = Matrix.Translation(g2b(*c)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(-rx, 4, 'X') @ Matrix.Rotation(-rz, 4, 'Y')
        return self._new(lambda: self.add_bm(bm, m), col)

    def bmf(self, bm, m, col=None):
        """加一個 Blender 座標的 bmesh（套 m）；有 col 就整塊上色，回傳新面"""
        fs = self._newf(lambda: self.add_bm(bm, m))
        if col: self.paint(fs, col)
        return fs


def soft_box(w, h, d, e=0.28, sag=0.0, bulge=0.0, tuft=0.0, seg=20, rings=12, ez=None):
    """布面的軟方塊（超橢球）：w＝遊戲 x、h＝遊戲 y、d＝遊戲 z；底面在 y=0、中心在原點。
    e：方的程度（越小越方）；sag：頂面中間往下凹；bulge：側面往外鼓；tuft：中央釘扣的小凹"""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    ez = e if ez is None else ez
    p = lambda c, k: math.copysign(abs(c) ** k, c)
    for v in bm.verts:
        x, y, z = v.co
        X, Y, Z = p(x, e), p(y, e), p(z, ez)
        k = 1 + bulge * (1 - Z * Z)
        px, py, pz = X * k * w / 2, Y * k * d / 2, (Z + 1) * h / 2
        if Z > 0:
            s = max(0.0, 1 - X * X) * max(0.0, 1 - Y * Y)
            pz -= sag * s * Z
            if tuft: pz -= tuft * math.exp(-(X * X + Y * Y) / 0.03) * Z
        v.co = Vector((px, py, pz))
    bm.normal_update(); return bm


def lathe_open(profile, seg=16):
    """旋轉體，不封口（燈罩、杯子內壁）"""
    bm = bmesh.new(); rings = []
    for (r, h) in profile:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), h)) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.normal_update(); return bm


def strip_surface(xs, zs, yfn, t=0.0):
    """遊戲座標的曲面網格（x 方向 xs、z 方向 zs，高度 yfn(x,z)）；t>0 就往下做厚度（側面＋底面）。回傳 Blender 座標的 bmesh"""
    bm = bmesh.new()
    top = [[bm.verts.new(g2b(x, yfn(x, z), z)) for x in xs] for z in zs]
    for j in range(len(zs) - 1):
        for i in range(len(xs) - 1):
            bm.faces.new((top[j][i], top[j + 1][i], top[j + 1][i + 1], top[j][i + 1]))
    if t > 0:
        bot = [[bm.verts.new(g2b(x, yfn(x, z) - t, z)) for x in xs] for z in zs]
        ring_t = [top[0][i] for i in range(len(xs))] + [top[j][-1] for j in range(1, len(zs))] + [top[-1][i] for i in range(len(xs) - 2, -1, -1)] + [top[j][0] for j in range(len(zs) - 2, 0, -1)]
        ring_b = [bot[0][i] for i in range(len(xs))] + [bot[j][-1] for j in range(1, len(zs))] + [bot[-1][i] for i in range(len(xs) - 2, -1, -1)] + [bot[j][0] for j in range(len(zs) - 2, 0, -1)]
        n = len(ring_t)
        for i in range(n):
            k = (i + 1) % n; bm.faces.new((ring_t[i], ring_b[i], ring_b[k], ring_t[k]))
        bm.faces.new(list(reversed(ring_b)))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)   # 有厚度才是封閉的；薄片照建的方向（朝上）
    return bm


def qbm(w, h):
    """一片朝 +z（遊戲）的四邊形，中心在原點（照片、日曆格子、刻度：只看得到正面的薄片）"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(x, y, 0.0)) for (x, y) in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
    bm.faces.new(vs); bm.normal_update(); return bm


def npoly(n, r, sy=1.0):
    """正 n 邊形（朝 +z 的薄片；頭、圓點）"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(r * math.cos(2 * math.pi * i / n), r * sy * math.sin(2 * math.pi * i / n), 0.0)) for i in range(n)]
    bm.faces.new(vs); bm.normal_update(); return bm


def shoulders(w, h):
    """人的上半身剪影（肩膀圓一點的梯形，底在 y=0）"""
    pts = [(-w / 2, 0.0), (w / 2, 0.0), (w / 2, h * 0.78), (w * 0.36, h), (-w * 0.36, h), (-w / 2, h * 0.78)]
    bm = bmesh.new(); vs = [bm.verts.new(g2b(x, y, 0.0)) for (x, y) in pts]
    bm.faces.new(vs); bm.normal_update(); return bm


def lin_space(a, b, n):
    return [a + (b - a) * i / n for i in range(n + 1)]


def M(x, y, z, ry=0.0):
    """遊戲座標的位置＋繞遊戲 y 軸旋轉（弧度，從上面看逆時針）"""
    return Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(ry, 4, 'Z')


def cloth_drape(colliders, cx, cz, w, d, y0, nx=22, nz=14, frames=50, t=0.008):
    """布料模擬：一張 w（遊戲 x）× d（遊戲 z）的布，從 y0 落下，碰到 colliders（[(bmesh, matrix)]，Blender 座標）停住。
    模擬完把形狀取出來、加厚度，回傳 Blender 座標的 bmesh；暫時的物件都刪掉"""
    sc = bpy.context.scene; tmp = []
    for bm_, mt in colliders:
        me = bpy.data.meshes.new('_col'); bm_.to_mesh(me); bm_.free(); me.transform(mt)
        ob = bpy.data.objects.new('_col', me); sc.collection.objects.link(ob); ob.modifiers.new('col', 'COLLISION')
        ob.collision.thickness_outer = 0.004; ob.collision.cloth_friction = 10; tmp.append(ob)
    gb = bmesh.new(); bmesh.ops.create_grid(gb, x_segments=nx, y_segments=nz, size=0.5)
    xs = [v_.co.x for v_ in gb.verts]; ys = [v_.co.y for v_ in gb.verts]
    for v_ in gb.verts:
        v_.co = Vector(((v_.co.x - min(xs)) / (max(xs) - min(xs)) * w - w / 2 + cx, (v_.co.y - min(ys)) / (max(ys) - min(ys)) * d - d / 2 - cz, y0))
    me = bpy.data.meshes.new('_cloth'); gb.to_mesh(me); gb.free()
    cl = bpy.data.objects.new('_cloth', me); sc.collection.objects.link(cl); tmp.append(cl)
    cm = cl.modifiers.new('cloth', 'CLOTH'); st = cm.settings
    st.quality = 10; st.mass = 0.3; st.tension_stiffness = 15; st.compression_stiffness = 15; st.bending_stiffness = 0.8; st.air_damping = 1.0
    cm.collision_settings.distance_min = 0.004; cm.point_cache.frame_start = 1; cm.point_cache.frame_end = frames
    sc.frame_start, sc.frame_end = 1, frames
    for f in range(1, frames + 1): sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get(); out = bmesh.new(); out.from_object(cl, dg)
    sc.frame_set(1)
    for ob in tmp:
        m_ = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(m_)
    res = bmesh.ops.solidify(out, geom=list(out.faces), thickness=t)
    bmesh.ops.recalc_face_normals(out, faces=out.faces)
    return out


ROOT = B.group('TUTOR_PROPS')
STATS = {}


def item(name, pos, build, smooth_angle=0.6, glow=False):
    g = B.group(name, ROOT); g.location = g2b(*pos)
    key = name.lower().replace('tutor_', '', 1)
    pm, pv = Part(f'tutor_{key}_metal', M_METAL), Part(f'tutor_{key}_vc', M_VC)
    pg = Part('TUTOR_LAMP_GLOW', M_VC) if glow else None
    build(pm, pv, pg) if glow else build(pm, pv)
    tris = 0
    for p in (pm, pv, pg):
        if p is None: continue
        ob = p.finish(parent=g, uv=False, smooth=False, merge=True)
        if ob is None: continue
        L.smooth_mesh(ob, angle=smooth_angle)
        tris += sum(len(f.vertices) - 2 for f in ob.data.polygons)
    STATS[name] = tris


# ---------------- 木頭矮桌 ----------------
def table(m, v):
    W, D, H, T = 1.0, 0.6, 0.40, 0.03
    # 桌面：格子網格往下擠出厚度，四個角倒圓，頂點色做木紋、使用痕跡
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=20, y_segments=12, size=1.0)
    xs = [vv.co.x for vv in bm.verts]; ys = [vv.co.y for vv in bm.verts]
    sx, sy = (max(xs) - min(xs)) / W, (max(ys) - min(ys)) / D
    for vv in bm.verts: vv.co = Vector((vv.co.x / sx, vv.co.y / sy, H))
    ext = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces), use_keep_orig=True)
    newv = [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=newv, vec=(0, 0, -T))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bottom = [f for f in bm.faces if all(abs(vv.co.z - (H - T)) < 1e-6 for vv in f.verts)]
    bmesh.ops.dissolve_faces(bm, faces=bottom)
    corner = [e for e in bm.edges if all(abs(abs(vv.co.x) - W / 2) < 1e-6 and abs(abs(vv.co.y) - D / 2) < 1e-6 for vv in e.verts)]
    bmesh.ops.bevel(bm, geom=corner, offset=0.05, segments=4, affect='EDGES', profile=0.5, clamp_overlap=True)
    bm.normal_update()
    edge_top = [e for e in bm.edges if all(abs(vv.co.z - H) < 1e-6 for vv in e.verts) and any(abs(f.normal.z) < 0.5 for f in e.link_faces)]
    bmesh.ops.bevel(bm, geom=edge_top, offset=0.006, segments=2, affect='EDGES', profile=0.5, clamp_overlap=True)
    bm.normal_update()
    base = _rgb(WOOD)

    def wood(x, y, z):
        g = 0.055 * math.sin(x * 46 + 2.4 * math.sin(z * 9 + x * 2)) + 0.025 * math.sin(x * 131 + z * 3)
        r2 = (x / 0.32) ** 2 + ((z - 0.03) / 0.2) ** 2
        worn = 0.07 * max(0.0, 1 - r2)                                    # 中間寫字的地方磨亮
        edge = -0.10 * max(0.0, (max(abs(x) / (W / 2), abs(z) / (D / 2)) - 0.86) / 0.14)   # 邊緣深
        ring = -0.05 * math.exp(-(((math.hypot(x + 0.38, z + 0.16) - 0.036) / 0.005) ** 2))   # 杯子留下的淡淡水痕
        side = -0.06 if y < H - 0.008 else 0.0
        k = 1 + g + worn + edge + ring + side
        return [c * k for c in base]
    v.vpaint(v.bmf(bm, Matrix.Identity(4)), wood)
    # 桌腳（往下收）、牙條
    for sx_ in (-1, 1):
        for sz_ in (-1, 1):
            x, z = sx_ * (W / 2 - 0.09), sz_ * (D / 2 - 0.08)
            v.tube((x, 0.0, z), (x, H - T, z), 0.019, WOOD_D, seg=10, r2=0.024)
    for sz_ in (-1, 1):
        v.rb(-W / 2 + 0.11, W / 2 - 0.11, H - T - 0.05, H - T, sz_ * (D / 2 - 0.08) - 0.011, sz_ * (D / 2 - 0.08) + 0.011, WOOD_D, r=0.004, seg=1)
    for sx_ in (-1, 1):
        v.rb(sx_ * (W / 2 - 0.09) - 0.011, sx_ * (W / 2 - 0.09) + 0.011, H - T - 0.05, H - T, -D / 2 + 0.10, D / 2 - 0.10, WOOD_D, r=0.004, seg=1)


# ---------------- 坐墊 ----------------
def cushions(m, v):
    for (x, z, ry, col, sag) in ((-0.34, 0.0, 0.14, SAGE, 0.022), (0.34, 0.03, -0.09, OCHRE, 0.03)):
        bm = soft_box(0.50, 0.085, 0.50, e=0.30, ez=0.45, sag=sag, bulge=0.035, tuft=0.010, seg=20, rings=10)
        fs = v.bmf(bm, M(x, 0, z, ry)); bm.free()
        c0 = _rgb(col)
        v.vpaint(fs, lambda X, Y, Z, c0=c0: [c * (0.90 + 0.10 * min(1.0, Y / 0.07)) for c in c0])   # 下緣暗一點
        top = 0.085 - sag - 0.010
        v.tube((x, top - 0.004, z), (x, top + 0.005, z), 0.011, OCHRE if col == SAGE else SAGE, seg=8)        # 中央的釘扣（另一個顏色；貼在凹下去的頂面）


# ---------------- 桌上：課本、練習簿、筆、橡皮擦、麥茶 ----------------
def open_book(v, cx, cz, ry, w, d, block, cover, figs=(), rule=False):
    """攤開的書：書脊沿遊戲 z；左右兩疊頁，靠書脊往下凹、往外升起再變平。y=0 是桌面。
    頁面是折線（取樣點 TS），內頁的字行、插圖用同一組取樣點，才不會插進頁面裡"""
    rot = Matrix.Rotation(ry, 4, 'Z'); tr = Matrix.Translation(g2b(cx, 0, cz))
    v.bmf(L.rbox_bm(2 * w + 0.012, 0.004, d + 0.012, 0.0015, 1), tr @ rot @ Matrix.Translation(g2b(0, 0.002, 0)), cover)
    TS = (0.0, 0.04, 0.1, 0.18, 0.28, 0.35, 0.94, 1.0)
    yu = lambda u: 0.004 + block * (0.35 + 0.65 * math.sin(min(1.0, u / 0.35) * math.pi / 2)) - 0.0015 * max(0.0, u - 0.94) / 0.06

    def ylin(u):   # 頁面折線上的高度
        for t0, t1 in zip(TS, TS[1:]):
            if u <= t1 + 1e-9: k = (u - t0) / (t1 - t0); return yu(t0) * (1 - k) + yu(t1) * k
        return yu(1.0)

    def layer(side, u0, u1, z0, z1, col, dy=0.0008):
        us = [u0] + [t for t in TS if u0 + 1e-6 < t < u1 - 1e-6] + [u1]
        xs = [side * w * u for u in us]
        if side < 0: xs = list(reversed(xs))
        bm = strip_surface(xs, [z0, z1], lambda x, z: ylin(abs(x) / w) + dy)
        v.bmf(bm, tr @ rot, col); bm.free()

    for side in (-1, 1):
        xs = [side * w * t for t in TS]
        if side < 0: xs = list(reversed(xs))
        bm = strip_surface(xs, [-d / 2, d / 2], lambda x, z: ylin(abs(x) / w), t=block * 0.9)
        fs = v.bmf(bm, tr @ rot); bm.free()
        v.fpaint(fs, lambda x, y, z, f: PAPER if f.normal.z > 0.6 else PAPER_E)
        if rule:   # 練習簿：格線（細線）
            for k in range(9):
                zz = (-0.40 + k * 0.10) * d
                layer(side, 0.10, 0.92, zz, zz + 0.003, RULE)
            continue
        # 課本：三段文字（一行一行的灰線，段落最後一行短一點）＋插圖色塊
        for (v0, v1) in ((0.30, 0.44), (-0.02, 0.24), (-0.40, -0.10)):
            fg = [f for f in figs if f[0] == side and f[1] == (v0, v1)]
            if fg:
                layer(side, 0.22, 0.80, v0 * d, v1 * d, fg[0][2]); continue
            n = int((v1 - v0) * d / 0.0078)
            for k in range(n):
                zt = v1 * d - k * 0.0078
                layer(side, 0.16, 0.86 if k < n - 1 else 0.55, zt - 0.0034, zt, INK)


def pen(v, m, a, b, body, cap=True):
    ax, az = a; bx, bz = b; r = 0.0045
    L_ = math.hypot(bx - ax, bz - az); ux, uz = (bx - ax) / L_, (bz - az) / L_
    p = lambda t: (ax + ux * t, r, az + uz * t)
    v.tube(p(0.0), p(L_ * 0.86), r, body, seg=8)
    m.tube(p(L_ * 0.86), p(L_ * 0.95), r * 0.85, SILVER, seg=8, r2=r * 0.45)
    m.tube(p(L_ * 0.95), p(L_), r * 0.45, SILVER, seg=6, r2=0.0006)
    if cap:
        v.tube(p(-0.004), p(0.045), r * 1.15, body, seg=8)
        m.rb_rot((ax + ux * 0.02, r * 2.1, az + uz * 0.02), 0.003, 0.0016, 0.032, SILVER, ry=math.atan2(ux, uz), r=0.0006, seg=1)


def study(m, v):
    open_book(v, -0.12, 0.02, 0.09, 0.19, 0.26, 0.010, TEAL, figs=((1, (0.30, 0.44), FIG), (-1, (-0.40, -0.10), FIG2)))
    open_book(v, 0.24, 0.07, -0.14, 0.15, 0.21, 0.004, YEL, rule=True)
    pen(v, m, (0.02, 0.18), (0.15, 0.13), PEN_B)
    pen(v, m, (0.40, 0.20), (0.42, 0.06), PEN_K)
    v.rb_rot((0.37, 0.007, -0.13), 0.042, 0.014, 0.021, ERASER, ry=0.4, r=0.003, seg=2)
    v.rb_rot((0.37, 0.0072, -0.13), 0.026, 0.0148, 0.0222, SLEEVE, ry=0.4, r=0.0015, seg=1)
    # 半杯麥茶：外壁（茶的高度以下是茶色、以上是玻璃色）、杯緣、內壁、茶面
    gx, gz, TL = -0.38, -0.16, 0.055
    bm = L.lathe([(0.0, 0.0), (0.028, 0.0), (0.031, 0.003), (0.033, 0.10), (0.0305, 0.10), (0.0300, TL), (0.0, TL)], seg=20)
    fs = v.bmf(bm, Matrix.Translation(g2b(gx, 0, gz))); bm.free()
    def gcol(x, y, z, f):
        r = math.hypot(x - gx, z - gz)
        if f.normal.z > 0.9 and y < 0.09: return TEA_S          # 茶面
        if y > 0.0995: return RIM
        if r < 0.0302 and y > TL: return GLASS_I                # 茶面以上的內壁
        return TEA if y < TL else GLASS
    v.fpaint(fs, gcol)


# ---------------- 舊的三人布沙發＋國中運動外套 ----------------
def drape(v, path, zs, t, col_fn):
    """布從扶手上垂下來：path＝遊戲 (x, y) 的斷面點（由裡到外），沿 z 取 zs；垂下來的地方有一點皺"""
    bm = bmesh.new(); n = len(path)
    def norm(i):
        a = path[max(0, i - 1)]; b = path[min(n - 1, i + 1)]; dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy)
        return (-dy / l, dx / l)
    outer, inner = [], []
    for j, z in enumerate(zs):
        ro, ri = [], []
        for i, (x, y) in enumerate(path):
            nx, ny = norm(i)
            hang = max(0.0, 0.62 - y) / 0.3                      # 越往下垂，皺得越明顯
            w = 0.004 * math.sin(z * 22 + i * 0.7) * min(1.0, hang)
            if i >= n - 2 or i == 0: y -= 0.022 * (0.5 + 0.5 * math.sin(z * 11 + i))   # 下擺不是一條直線
            ro.append(bm.verts.new(g2b(x + nx * (t + w), y + ny * (t + w), z)))
            ri.append(bm.verts.new(g2b(x + nx * w, y + ny * w, z)))
        outer.append(ro); inner.append(ri)
    for j in range(len(zs) - 1):
        for i in range(n - 1):
            bm.faces.new((outer[j][i], outer[j][i + 1], outer[j + 1][i + 1], outer[j + 1][i]))
            bm.faces.new((inner[j][i], inner[j + 1][i], inner[j + 1][i + 1], inner[j][i + 1]))
    for j in range(len(zs) - 1):
        for i in (0, n - 1):
            bm.faces.new((outer[j][i], outer[j + 1][i], inner[j + 1][i], inner[j][i]))
    for jj in (0, len(zs) - 1):
        for i in range(n - 1):
            bm.faces.new((outer[jj][i], inner[jj][i], inner[jj][i + 1], outer[jj][i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    fs = v.bmf(bm, Matrix.Identity(4)); bm.free()
    v.fpaint(fs, col_fn)


def sofa(m, v):
    W, D = 1.95, 0.86
    AX = W / 2 - 0.10                      # 扶手中心 x
    # 短木腳
    for sx in (-1, 1):
        for sz in (-1, 1):
            v.tube((sx * (W / 2 - 0.07), 0.0, sz * (D / 2 - 0.07)), (sx * (W / 2 - 0.07), 0.11, sz * (D / 2 - 0.07)), 0.016, LEG, seg=8, r2=0.022)
    # 底座（座框）
    bm = soft_box(W - 0.30, 0.22, D - 0.06, e=0.18, ez=0.30, bulge=0.01, seg=12, rings=6)
    v.bmf(bm, M(0, 0.09, 0.0), FAB_D); bm.free()
    # 椅背（後面一整片）
    bm = soft_box(W - 0.06, 0.70, 0.20, e=0.22, ez=0.30, bulge=0.02, seg=16, rings=8)
    v.bmf(bm, M(0, 0.09, -D / 2 + 0.10), FAB2); bm.free()
    # 兩邊扶手（方圓）
    for sx in (-1, 1):
        bm = soft_box(0.20, 0.55, D, e=0.30, ez=0.38, bulge=0.03, sag=0.004, seg=14, rings=10)
        v.bmf(bm, M(sx * AX, 0.09, 0.0), FAB); bm.free()
    # 三個坐墊（中間的最塌：最常坐）
    cw = (W - 0.40) / 3 - 0.006
    for i, (col, sag) in enumerate(((FAB3, 0.022), (FAB, 0.040), (FAB2, 0.026))):
        x = -(W - 0.40) / 2 + cw / 2 + i * (cw + 0.009)
        bm = soft_box(cw, 0.15, 0.62, e=0.26, ez=0.40, sag=sag, bulge=0.04, seg=16, rings=10)
        v.bmf(bm, M(x, 0.30, 0.10), col); bm.free()
    # 三個靠背墊（往後倒一點）
    for i, col in enumerate((FAB, FAB3, FAB)):
        x = -(W - 0.40) / 2 + cw / 2 + i * (cw + 0.009)
        bm = soft_box(cw, 0.40, 0.17, e=0.30, ez=0.42, bulge=0.05, seg=14, rings=10)
        mt = Matrix.Translation(g2b(x, 0.44, -0.20)) @ Matrix.Rotation(math.radians(-11), 4, 'X')
        v.bmf(bm, mt, col); bm.free()
    # 國中運動外套：Blender 布料模擬，從扶手上方落下，搭在扶手和右邊的座墊上（碰撞體就是這張沙發自己的扶手、座墊、椅背）
    rx = -(W - 0.40) / 2 + cw / 2 + 2 * (cw + 0.009)
    colliders = [(soft_box(0.20, 0.55, D, e=0.30, ez=0.38, bulge=0.03, sag=0.004, seg=14, rings=10), M(AX, 0.09, 0.0)),
                 (soft_box(cw, 0.15, 0.62, e=0.26, ez=0.40, sag=0.026, bulge=0.04, seg=16, rings=10), M(rx, 0.30, 0.10)),
                 (soft_box(W - 0.06, 0.70, 0.20, e=0.22, ez=0.30, bulge=0.02, seg=16, rings=8), M(0, 0.09, -D / 2 + 0.10))]
    jb = cloth_drape(colliders, cx=AX + 0.02, cz=0.09, w=0.62, d=0.42, y0=0.665, nx=22, nz=14)
    fs = v.bmf(jb, Matrix.Identity(4)); jb.free()

    def jacket(x, y, z, f):   # 兩條白條紋（跨過扶手）：布的格子一排 3 cm，條紋就是一整排（中心 z＝0.015、0.075），中間隔一排深藍
        if abs(z - 0.015) < 0.011 or abs(z - 0.075) < 0.011: return STRIPE
        return NAVY
    v.fpaint(fs, jacket)
    # 一隻袖子從外側的肩線垂下來（白條紋沿著袖子正面）
    sx, sy, sz = AX + 0.125, 0.60, 0.22
    ex, ey, ez = AX + 0.150, 0.16, 0.29
    fs = v._newf(lambda: v.cyl((sx, sy, sz), (ex, ey, ez), 0.038, seg=10, r2=0.032, caps=True))

    def sleeve(x, y, z, f):
        n = f.normal; ang = math.atan2(n.x, -n.y)
        return STRIPE if abs(ang) < 0.36 else NAVY
    v.fpaint(fs, sleeve)
    v.tube((ex, ey, ez), (ex + 0.004, ey - 0.03, ez + 0.006), 0.034, STRIPE, seg=10)   # 袖口的白色羅紋


# ---------------- 矮電視櫃＋電視＋相框＋植物 ----------------
def tvstand(m, v):
    W, D, H = 1.6, 0.42, 0.45
    v.rb(-W / 2, W / 2, H - 0.025, H, -D / 2, D / 2, OAK, r=0.008)                 # 頂板
    v.rb(-W / 2, W / 2, 0.06, 0.085, -D / 2, D / 2, OAK, r=0.006)                  # 底板
    for (x0, x1) in ((-W / 2, -0.26), (0.26, W / 2)):                              # 左右兩個抽屜櫃
        v.rb(x0, x1, 0.085, H - 0.025, -D / 2, D / 2 - 0.002, OAK, r=0.004, seg=1)
    v.rb(-0.26, 0.26, 0.085, H - 0.025, -D / 2, -D / 2 + 0.015, OAK_D, r=0.002, seg=1)   # 中間開放層的背板
    for sx in (-1, 1):
        for sz in (-1, 1):
            m.tube((sx * (W / 2 - 0.06), 0.0, sz * (D / 2 - 0.06)), (sx * (W / 2 - 0.06), 0.06, sz * (D / 2 - 0.06)), 0.014, HANDLE, seg=8)
    # 正面：左右兩個抽屜、中間開放層（裡面一台小路由器）
    for sx in (-1, 1):
        x0, x1 = (sx * 0.26, sx * 0.785) if sx > 0 else (-0.785, -0.26)
        for (y0, y1) in ((0.09, 0.255), (0.27, 0.43)):
            v.rb(x0 + 0.004, x1 - 0.004, y0, y1, D / 2 - 0.002, D / 2 + 0.012, OAK, r=0.004, seg=1)
            m.rb((x0 + x1) / 2 - 0.06, (x0 + x1) / 2 + 0.06, (y0 + y1) / 2 - 0.006, (y0 + y1) / 2 + 0.006, D / 2 + 0.012, D / 2 + 0.026, HANDLE, r=0.003, seg=1)
    v.rb(-0.26, 0.26, 0.25, 0.262, -D / 2 + 0.015, D / 2 - 0.01, OAK, r=0.002, seg=1)       # 層板
    v.rb(-0.12, 0.10, 0.262, 0.292, -0.02, 0.12, ROUTER, r=0.006, seg=2)
    for k in range(3): v.rb(-0.07 + k * 0.03, -0.062 + k * 0.03, 0.276, 0.282, 0.12, 0.122, LED, r=0.0005, seg=1)
    # 電視（關著）：底座＋薄面板
    m.rb(-0.16, 0.16, H, H + 0.012, -0.10, 0.06, TV, r=0.006, seg=2)
    m.tube((0.0, H + 0.012, -0.03), (0.0, H + 0.10, -0.03), 0.02, TV, seg=8)
    m.rb(-0.49, 0.49, H + 0.08, H + 0.66, -0.035, -0.005, TV, r=0.006, seg=2)
    m.rb(-0.475, 0.475, H + 0.095, H + 0.645, -0.0058, -0.004, SCREEN, r=0.002, seg=1)
    m.rb(-0.30, 0.30, H + 0.18, H + 0.56, -0.07, -0.035, TV, r=0.02, seg=2)                   # 背後的機身
    # 全家福相框（立架；照片只有色塊）
    fx, fz, fry = 0.62, 0.05, -0.25
    tr = Matrix.Translation(g2b(fx, H, fz)) @ Matrix.Rotation(fry, 4, 'Z') @ Matrix.Rotation(math.radians(-10), 4, 'X')
    v.bmf(L.rbox_bm(0.20, 0.15, 0.014, 0.003, 1), tr @ Matrix.Translation(g2b(0, 0.075, 0)), FRAME)
    ph = [(-0.085, 0.085, 0.075, 0.13, SKY), (-0.085, 0.085, 0.015, 0.075, GRASS)]
    for (a, b, c, d, col) in ph:
        v.bmf(qbm(b - a, d - c), tr @ Matrix.Translation(g2b((a + b) / 2, (c + d) / 2, 0.0072)), col)
    for k, (px, ph_, sw, col) in enumerate(((-0.052, 0.052, 0.034, SHIRT2), (-0.017, 0.056, 0.032, SHIRT1), (0.02, 0.044, 0.028, SHIRT3), (0.052, 0.032, 0.024, SHIRT1))):   # 一家四口（只有色塊，看不到臉）
        y0 = 0.012
        v.bmf(shoulders(sw, ph_), tr @ Matrix.Translation(g2b(px, y0, 0.0076)), col)
        hr = sw * 0.30
        v.bmf(npoly(8, hr), tr @ Matrix.Translation(g2b(px, y0 + ph_ + hr * 0.8, 0.0076)), SKIN)
        v.bmf(npoly(8, hr * 1.02, sy=0.55), tr @ Matrix.Translation(g2b(px, y0 + ph_ + hr * 1.35, 0.0079)), HAIR)
    v.rb_rot((fx - 0.04 * math.sin(fry), H + 0.06, fz - 0.05), 0.02, 0.12, 0.006, FRAME, rx=0.5, ry=fry, r=0.002, seg=1)   # 背後的立架
    # 一小盆植物（黃金葛）
    px, pz = -0.64, 0.02
    bm = L.lathe([(0.0, 0.0), (0.055, 0.0), (0.068, 0.11), (0.072, 0.115), (0.066, 0.118), (0.064, 0.106), (0.0, 0.10)], seg=14)
    fs = v.bmf(bm, Matrix.Translation(g2b(px, H, pz))); bm.free()
    v.fpaint(fs, lambda x, y, z, f: SOIL if (y - H > 0.095 and math.hypot(x - px, z - pz) < 0.063 and f.normal.z > 0.5) else POT)
    leaves = [(0.0, 0.17, 0.0, 0.0, 0.0), (0.05, 0.15, 0.03, 0.9, 0.6), (-0.05, 0.15, 0.02, -0.8, 0.5), (0.02, 0.14, -0.05, 2.4, 0.7),
              (-0.03, 0.19, -0.03, 3.6, 0.3), (0.07, 0.12, -0.02, 1.6, 1.0), (-0.07, 0.12, -0.01, -1.9, 1.0), (0.09, 0.07, 0.04, 0.5, 1.4), (0.03, 0.21, 0.02, 0.2, 0.2)]
    for k, (lx, ly, lz, yaw, tilt) in enumerate(leaves):
        mt = Matrix.Translation(g2b(px + lx, H + ly, pz + lz)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(tilt, 4, 'X')
        fs = v._newf(lambda mt=mt: v.ell((0, 0, 0), 0.032, 0.004, 0.045, seg=8, rings=4, matrix=mt))
        v.paint(fs, LEAF if k % 2 else LEAF2)
        v.tube((px + lx * 0.3, H + 0.10, pz + lz * 0.3), (px + lx, H + ly - 0.01, pz + lz), 0.0025, LEAF, seg=5, caps=False)


# ---------------- 立燈（燈罩內面＝TUTOR_LAMP_GLOW） ----------------
def lamp(m, v, g):
    m.bmf(L.lathe([(0.0, 0.0), (0.14, 0.0), (0.14, 0.012), (0.12, 0.028), (0.03, 0.034), (0.0, 0.034)], seg=20), Matrix.Identity(4), BRONZE)
    m.tube((0.0, 0.03, 0.0), (0.0, 1.31, 0.0), 0.011, POLE, seg=10)
    m.tube((0.0, 1.31, 0.0), (0.0, 1.36, 0.0), 0.016, BRONZE, seg=10)            # 燈座
    for k in range(3):                                                              # 燈罩的支架
        a = k * 2 * math.pi / 3
        m.tube((0.0, 1.35, 0.0), (0.175 * math.cos(a), 1.50, 0.175 * math.sin(a)), 0.003, BRONZE, seg=5)
    m.bmf(L.lathe([(0.0, 1.50), (0.012, 1.50), (0.012, 1.52), (0.0, 1.52)], seg=10), Matrix.Identity(4), BRONZE)
    prof = [(0.205, 1.24), (0.195, 1.33), (0.180, 1.43), (0.172, 1.52)]
    v.bmf(lathe_open(prof, seg=24), Matrix.Identity(4), SHADE)                       # 燈罩外面（布）
    for (r, y) in (prof[0], prof[-1]):                                               # 上下兩圈收邊
        v.bmf(lathe_open([(r - 0.003, y - 0.004), (r + 0.004, y), (r - 0.003, y + 0.004), (r - 0.003, y - 0.004)], seg=24), Matrix.Identity(4), SHADE_RIM)
    inner = lathe_open([(r - 0.003, y) for (r, y) in prof], seg=24)                  # 燈罩內面：法線朝內
    bmesh.ops.reverse_faces(inner, faces=inner.faces)
    g.bmf(inner, Matrix.Identity(4), GLOWC); inner.free()
    g.bmf(L.lathe([(0.0, 1.36), (0.022, 1.37), (0.032, 1.40), (0.030, 1.43), (0.018, 1.455), (0.0, 1.46)], seg=12), Matrix.Identity(4), GLOWC)   # 燈泡


# ---------------- 牆上：時鐘、日曆（原點＝貼牆面的底部中央） ----------------
def wall(m, v):
    cx, cy = -0.26, 0.40
    face = Matrix.Translation(g2b(cx, cy, 0.0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')   # 旋轉體的軸（Blender Z）轉成朝 +z
    fs = v.bmf(L.lathe([(0.0, 0.0), (0.155, 0.0), (0.158, 0.02), (0.152, 0.042), (0.140, 0.044), (0.138, 0.032)], seg=32), face)
    v.fpaint(fs, lambda x, y, z, f: CLK_F if len(f.verts) > 4 else CLK_R)              # 最後一圈的封口＝鐘面
    for k in range(12):   # 刻度（沒有數字）：三、六、九、十二點長一點
        a = k * math.pi / 6; r = 0.118; L_ = 0.020 if k % 3 == 0 else 0.010
        mt = Matrix.Translation(g2b(cx + r * math.sin(a), cy + r * math.cos(a), 0.0326)) @ Matrix.Rotation(a, 4, 'Y')
        v.bmf(qbm(0.004 if k % 3 == 0 else 0.0025, L_), mt, CLK_H)
    for (ang, ln, wd, dz) in ((math.radians((7 + 20 / 60) * 30), 0.065, 0.007, 0.036), (math.radians(20 * 6), 0.105, 0.0045, 0.038)):   # 七點二十分
        mt = Matrix.Translation(g2b(cx, cy, dz)) @ Matrix.Rotation(ang, 4, 'Y') @ Matrix.Translation(g2b(0, ln / 2 - 0.012, 0))
        v.bmf(qbm(wd, ln), mt, CLK_H)
    m.bmf(L.lathe([(0.0, 0.0), (0.008, 0.0), (0.008, 0.004), (0.0, 0.004)], seg=10), Matrix.Translation(g2b(cx, cy, 0.037)) @ Matrix.Rotation(math.pi / 2, 4, 'X'), SILVER)
    # 日曆：上半是風景照片（色塊）、下半是格子；上面一條夾子、掛在釘子上；下緣微微翹起
    kx = 0.24
    v.rb(kx - 0.15, kx + 0.15, 0.0, 0.46, 0.0, 0.003, CAL, r=0.0008, seg=1)
    fq = lambda x0, x1, y0, y1, zz, col: v.bmf(qbm(x1 - x0, y1 - y0), Matrix.Translation(g2b((x0 + x1) / 2, (y0 + y1) / 2, zz)), col)
    fq(kx - 0.135, kx + 0.135, 0.27, 0.445, 0.0034, CAL_P1)
    fq(kx - 0.135, kx + 0.135, 0.27, 0.33, 0.0038, CAL_P2)
    for r_ in range(5):
        for c_ in range(7):
            x0 = kx - 0.13 + c_ * 0.0375; y0 = 0.205 - r_ * 0.045
            fq(x0, x0 + 0.032, y0, y0 + 0.036, 0.0034, CAL_R if (r_, c_) == (2, 3) else CAL_G)
    fq(kx - 0.13, kx + 0.13, 0.248, 0.262, 0.0034, CAL_R)          # 月份那一條（只有色塊；在格子和照片中間）
    m.rb(kx - 0.155, kx + 0.155, 0.445, 0.462, -0.001, 0.008, SILVER, r=0.003, seg=1)       # 上面的金屬夾條
    m.tube((kx, 0.475, 0.0), (kx, 0.475, 0.012), 0.0025, SILVER, seg=6)                    # 釘子
    m.tube((kx - 0.05, 0.461, 0.004), (kx, 0.475, 0.006), 0.0008, SILVER, seg=4, caps=False)
    m.tube((kx + 0.05, 0.461, 0.004), (kx, 0.475, 0.006), 0.0008, SILVER, seg=4, caps=False)


# ---------------- 小地毯 ----------------
def rug(m, v):
    W, D, T = 1.6, 1.2, 0.008
    v.rb(-W / 2, W / 2, 0.0, T, -D / 2, D / 2, RUG_F, r=0.003, seg=1)
    y1, y2, y3 = T + 0.0005, T + 0.0009, T + 0.0013
    def band(x0, x1, z0, z1, w, col, y):
        v.cbox(x0, x1, T, y, z0, z0 + w, col); v.cbox(x0, x1, T, y, z1 - w, z1, col)
        v.cbox(x0, x0 + w, T, y, z0 + w, z1 - w, col); v.cbox(x1 - w, x1, T, y, z0 + w, z1 - w, col)
    band(-W / 2 + 0.01, W / 2 - 0.01, -D / 2 + 0.01, D / 2 - 0.01, 0.10, RUG_B, y1)
    band(-W / 2 + 0.14, W / 2 - 0.14, -D / 2 + 0.14, D / 2 - 0.14, 0.02, RUG_I, y1)
    def diamond(cx, cz, rx, rz, col, y):
        v.poly([(cx, y, cz + rz), (cx + rx, y, cz), (cx, y, cz - rz), (cx - rx, y, cz)], col)
    diamond(0, 0, 0.36, 0.26, RUG_M, y1); diamond(0, 0, 0.24, 0.17, RUG_M2, y2); diamond(0, 0, 0.10, 0.07, RUG_B, y3)
    for sx in (-1, 1):
        for sz in (-1, 1):
            diamond(sx * 0.52, sz * 0.33, 0.07, 0.05, RUG_M, y1)
    for sx in (-1, 1):   # 短邊（x 兩端）的流蘇
        for k in range(18):
            z = -D / 2 + 0.06 + k * (D - 0.12) / 17
            v.cbox(sx * W / 2 + (-0.002 if sx > 0 else -0.05), sx * W / 2 + (0.05 if sx > 0 else 0.002), 0.0, 0.003, z - 0.006, z + 0.006, FRINGE)


# 排開給人看：地毯、矮桌、坐墊、課本組一組；其他排一排
SET = (-3.0, 0.0, 0.6)
SPREAD = [('TUTOR_RUG', SET, rug, 0.6, False), ('TUTOR_TABLE', SET, table, 0.5, False),
          ('TUTOR_STUDY', (SET[0], 0.40, SET[2]), study, 0.5, False), ('TUTOR_CUSHIONS', (SET[0], 0.008, SET[2] + 0.62), cushions, 1.4, False),
          ('TUTOR_SOFA', (-3.0, 0.0, -1.1), sofa, 1.2, False), ('TUTOR_LAMP', (-1.6, 0.0, -1.2), lamp, 0.8, True),
          ('TUTOR_TVSTAND', (0.6, 0.0, 0.0), tvstand, 0.6, False), ('TUTOR_WALL', (2.3, 1.20, -0.2), wall, 0.6, False)]
for nm, pos, fn, ang, glow in SPREAD: item(nm, pos, fn, smooth_angle=ang, glow=glow)

st = L.export(os.path.abspath(OUT), gpu_instances=False)
st['items_tris'] = STATS; st['tris_total'] = sum(STATS.values())
st['note'] = 'ART-TUTOR1（LAWWW2-B 派工）；每件一個頂層節點；原點底部中央、正面 +z；TUTOR_STUDY 的 y=0 是桌面；TUTOR_WALL 的原點貼牆；GLB 裡的位置只是排開給人看'
L.write_json(os.path.abspath(OUT).replace('.glb', '.json'), st)
print(json.dumps({'items_tris': STATS, 'total': st['tris_total']}, ensure_ascii=False))
assert st['tris_total'] <= 12000, st['tris_total']
