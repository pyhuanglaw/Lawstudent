"""同弦樂器（吉他店，新生南路二樓店面）的室內 → GLB。CC（帳號 A）的建模子代理。v4（2026-11-04）：照使用者的參考圖 tongxian_int 重做（SCENE_RULES 第 12 節：參考圖就是規格）。
Blender 5.2（bpy，無介面）：
  python3 tools/blender/env_second/bb_support/tongxian_tex.py      # 先畫貼圖（→ tools/blender/env_second/textures/gen/tongxian_*）
  nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/tongxian_interior.py -- [--out 路徑] [--lib <env_second 資料夾>]
--lib：lib2.py、cafe_layout.py 用哪一份（claude/second-ai-env-art 上的那一份）；沒給的話看環境變數 TX_LIB2，再沒有就用這個 repo 的 tools/blender/env_second。
配置（家具位置、大小、座位、導航阻擋、參考圖的鏡頭 camRef）只寫在 src/data/tongxian_layout.js，這裡讀同一份。座標＝遊戲區域座標（中心在原點、x 東、z 南）。
v1～v3（7 × 14 m，吉他變得很小）被 LAWWW2 退回；v4：6.4 × 10.4 × 3.2 m，參考圖的鏡頭在店門進來的地方（camRef），往東北看：
  右：東牆整面米色溝槽板，從 0.82 m 掛到 3.12 m（上排電吉他、下排木吉他，真實尺寸；轉 30～35° 朝店裡，一把壓一把）＋軌道投射燈；
      前面一座長櫃台（北段玻璃展示櫃：弦的包裝四排、移調夾、調音器、Pick 盒、背帶；南段木頭檯面：收銀機、帳本、名片）。
  中：臨街的窗（新生南路的路樹、對面的公寓、路牌）、冷氣、「弦一個月換一次」紙條＋照片；窗前的試琴角（地毯、兩張試琴椅、小音箱、譜架、吊燈、花台）。
  左：開著的店門（壓花玻璃、「同弦樂器」木牌）、矮書架（隔間，上面黃金葛）、門口上方吊的黃金葛。
  參考圖鏡頭看不到的地方：西牆的烏克麗麗、古典吉他、音箱、琴架上的兩把吉他、第二扇窗；裡面的修琴工作桌、洞洞板、硬盒、長椅、軟木板、「不賣，老闆的」那一把。
吉他、掛勾是 instancing（同一個網格放很多個；牆上的叫 WALL_<side>_*，跟著牆淡出——匯出後把 instancing 節點改名、補 extras.dir）。
字（店名、紙條、價錢、包裝）印在 tongxian_props.png 上；沒有任何真實品牌或標誌（琴頭形狀也不用真實品牌的；D77）。
v4e（LAWWW2-C 11-05，TONGXIAN-REF-1105；BB-C 02:08 照 D132 代驗：「店內和參考圖差太多」，D133）：CC 的 v4d 由 LAWWW2 接手改（BB 同意）——
  木地板 #d6bc96（D112）；書架從店中間搬到西牆（烏克麗麗牆和樓梯間中間）、轉 90° 書背朝東（配置的 ry，_rot_new）：原本從門口看過去正好擋住試琴角；
  吊盆搬到往試琴角的走道上方 (−1.2, −1.6)、藤短一點（配置的 vine；最低的葉子離地 1.8 m 左右）；參考圖的鏡頭 camRef 重選（收銀檯前往北看）。樓梯間的地板另外用 glb_floor_hole.py 挖（x −3.2～−1.14、z 1.0～5.2）。"""
import json, math, os, random, re, subprocess, sys
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


# CC0 化（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；第③群幫手 2026-11-13）：工具 cc0_kit.py（tz_shops_interior.py 同一套）。
#   天花板＝ambientCG Plaster001（vary 0.04，不起雲斑）；金屬零件（掛勾、檯燈、軌道、窗框）＝ambientCG Metal009 × 每一件的顏色（vc_tex）；
#   後面硬盒架上疊的紙箱（原本六個一樣大的純色方塊，D159）＝Poly Haven cardboard_box_01（大小、方向各不同）；等人的長木椅上放一把烏克麗麗＝Poly Haven Ukulele_01。
sys.path.insert(0, HERE)
import cc0_kit   # noqa: E402
K = cc0_kit.Kit(root, P)
# ---------------- 材質（12 個） ----------------
M = {
    'floor': L.pbr(P + 'floor_oak', 'laminate_floor_02', tile=1.8, target='#d6bc96', normal=0.5, maps=('diff', 'nor'), rough_value=0.72),   # 淺色木地板（D112；參考圖：淺橡木）。v4e（LAWWW2-C）：#c49c70（L* 67）→ #d6bc96（L* 78），BB-C 11-05「中間偏深的咖啡色」
    'plaster': L.pbr(P + 'plaster', 'painted_plaster_wall', tile=2.2, target='#e8d5b6', normal=0.25, maps=('diff', 'nor'), res=256, rough_value=0.9),   # 米色（參考圖），不是純白
    'ceil': K.acg(P + 'ceiling', 'Plaster001', maps=('diff',), vary=0.04, target='#ecdcc2', tile=2.0, rough_value=0.92, res=256, cull=True),   # 單面朝下；暖白（CC0 灰泥）
    'slat': L.pbr(P + 'slatwall', 'fine_grained_wood', tile=1.3, target='#ecdcc0', normal=0.25, maps=('diff', 'nor'), rough_value=0.6, contrast=0.3),   # v4：米色烤漆的木條（參考圖），溝是深色
    'wood': L.pbr(P + 'wood', 'wood_table_001', tile=1.0, target='#9c6e48', normal=0.4, maps=('diff', 'nor'), rough_value=0.5),
    'guitar': img_mat(P + 'guitars', 'tongxian_guitar.png', rough=0.3),
    'props': img_mat(P + 'props', 'tongxian_props.png', rough=0.8, emit_fn='tongxian_props_emit.png'),
    'glass': L.flat(P + 'glass', '#eef2ee', rough=0.04, alpha=0.1),   # v2：櫃台玻璃再淡一點（CC_40 缺點 4：太暗）
    'vc': L.vc_material(P + 'vc', rough=0.6),
    'metal': K.vc_tex(P + 'metal', 'Metal009', maps=('diff',), metal=0.4, rough_value=0.42, tile=1.0, res=256),   # CC0 金屬紋 × 頂點色
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
# v4（11-04）：照參考圖重做的店（6.4 × 10.4 × 3.2 m）
# ======================================================================
CV = G('vc'); CMt = G('metal'); GL = G('glass'); WD = G('wood'); PR = G('props'); EM = G('emit')
IDF = Frame((0, 0, 0), (0, 0, -1), (0, 1, 0))   # 局部座標＝Blender 座標（instancing 的原型在這個框架裡建）
ST = LAY['stair']; SX, SZ0 = ST['x1'], ST['z0']   # 樓梯間的室內面：東 x −1.14、北 z −0.3
T = 0.12


def obj_inst(ob, name, M4, side=None):
    """instancing：再放一份（共用網格）"""
    no = bpy.data.objects.new((f'WALL_{side}_' if side else P) + name, ob.data); B.scene().collection.objects.link(no); no.parent = root
    no.matrix_basis = M4
    if side: no['dir'] = DIRS[side]
    return no


class GProto:
    """一把吉他的原型（吉他材質一個網格）：第一次 place 時建，之後共用"""
    def __init__(self, name, spec, side=None, scale=1.0): self.name, self.spec, self.side, self.scale, self.ob, self.n = name, spec, side, scale, None, 0

    def build(self):
        pt = Part(); self.vn, self.wt = build_guitar(pt, self.spec)
        if self.scale != 1.0:
            for v in pt.bm.verts: v.co *= self.scale
        nm = (f'WALL_{self.side}_' if self.side else P) + f'gtr_{self.name}'
        gm = Mesh(nm, M['guitar']); gm.bm.loops.layers.uv.new('UVMap'); pt.into(gm, IDF)
        self.ob = gm.finish(root, uv=False, smooth=True, props={'dir': DIRS[self.side]} if self.side else None)

    def place(self, M4):
        if self.ob is None: self.build()
        if self.n == 0: self.ob.matrix_basis = M4
        else: obj_inst(self.ob, f'gtr_{self.name}_{self.n}', M4, self.side)
        self.n += 1


def proto_part(name, side, fn):
    """其他 instancing 的原型（頂點色＋金屬）：fn(cv, cm) 用遊戲座標在原點附近建"""
    cv = L.CMesh((f'WALL_{side}_' if side else P) + f'{name}_vc', M['vc']); cm = L.CMesh((f'WALL_{side}_' if side else P) + f'{name}_metal', M['metal'])
    fn(cv, cm); obs = [m.finish(root, uv=m is cm, smooth=True, props={'dir': DIRS[side]} if side else None) for m in (cv, cm)]   # 金屬（材質組貼圖）要 UV
    return [o for o in obs if o is not None]


class PProto:
    def __init__(self, name, side, fn): self.name, self.side, self.fn, self.obs, self.n = name, side, fn, None, 0

    def place(self, M4):
        if self.obs is None:
            self.obs = proto_part(self.name, self.side, self.fn)
            for o in self.obs: o.matrix_basis = M4
        else:
            for o in self.obs: obj_inst(o, f'{self.name}_{self.n}_{o.name.rsplit("_", 1)[-1]}', M4, self.side)
        self.n += 1


def T4(x, y, z): return Matrix.Translation(g2b(x, y, z))


# ---------------- 房子 ----------------
Mesh(P + 'floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh(P + 'ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=True)
WINS = sorted(LAY['windows'], key=lambda w_: w_['x0'])
bw = G('plaster', 'back'); xa = X0 - T
for wn in WINS:
    bw.box(xa, wn['x0'], 0, H, Z0 - T, Z0); bw.box(wn['x0'], wn['x1'], 0, wn['sill'], Z0 - T, Z0); bw.box(wn['x0'], wn['x1'], wn['head'], H, Z0 - T, Z0); xa = wn['x1']
bw.box(xa, X1 + T, 0, H, Z0 - T, Z0)
G('plaster', 'front').box(X0 - T, X1 + T, 0, H, Z1, Z1 + T)
G('plaster', 'left').box(X0 - T, X0, 0, H, Z0, SZ0)
G('plaster', 'right').box(X1, X1 + T, 0, H, Z0, Z1)
dr = LAY['door']; dz0, dz1, dh = dr['z0'], dr['z1'], dr['h']
sw = G('plaster', 'left')   # 樓梯間的東牆（門的那一面）＋北牆
sw.box(SX - T, SX, 0, H, SZ0 - T, dz0).box(SX - T, SX, 0, H, dz1, Z1).box(SX - T, SX, dh, H, dz0, dz1)
G('plaster', 'front').box(X0, SX - T, 0, H, SZ0 - T, SZ0)
for side, boxes in (('back', [(X0, X1, Z0, Z0 + 0.012)]), ('front', [(SX, X1, Z1 - 0.012, Z1), (X0, SX, SZ0 - 0.012, SZ0)]),
                    ('left', [('x', X0, X0 + 0.012, Z0, SZ0), ('x', SX, SX + 0.012, SZ0, dz0 - 0.06), ('x', SX, SX + 0.012, min(dz1 + 0.06, Z1 - 0.01), Z1)])):   # 踢腳板
    w = G('wood', side)
    for bxs in boxes:
        if bxs[0] == 'x': w.rbox(bxs[1], bxs[2], 0, 0.08, bxs[3], bxs[4], r=0.003, seg=1)
        else: w.rbox(bxs[0], bxs[1], 0, 0.08, bxs[2], bxs[3], r=0.003, seg=1)
# 牆腳的髒（踢腳板上面一條淡淡的灰）：歲月感
for side, a in (('back', (X0, X1, 0.08, 0.13, Z0, Z0 + 0.002)), ('left', (SX, SX + 0.002, 0.08, 0.12, SZ0, dz0 - 0.06))):
    G('vc', side).cbox(*a, '#d2c4aa')

# ---------------- 臨街的窗（鋁框兩扇橫拉、窗台、窗外的新生南路） ----------------
bm_ = G('metal', 'back'); alu = '#b8bbbd'; fr_t = 0.045
for wn in WINS:
    wx0, wx1, ws, wh, xm = wn['x0'], wn['x1'], wn['sill'], wn['head'], wn['mullion']
    for (a0, a1, b0, b1) in ((wx0, wx1, ws, ws + fr_t), (wx0, wx1, wh - fr_t, wh), (wx0, wx0 + fr_t, ws, wh), (wx1 - fr_t, wx1, ws, wh)):
        bm_.cbox(a0, a1, b0, b1, Z0 - 0.09, Z0 - 0.02, '#3a3c3e')   # 參考圖：深灰的鋁框
    for (zo, x_a, x_b) in ((-0.075, wx0 + fr_t, xm + 0.03), (-0.04, xm - 0.03, wx1 - fr_t)):
        for (a0, a1, b0, b1) in ((x_a, x_b, ws + fr_t, ws + fr_t + 0.035), (x_a, x_b, wh - fr_t - 0.035, wh - fr_t), (x_a, x_a + 0.035, ws + fr_t, wh - fr_t), (x_b - 0.035, x_b, ws + fr_t, wh - fr_t)):
            bm_.cbox(a0, a1, b0, b1, Z0 + zo - 0.012, Z0 + zo + 0.012, '#45484a')
        uvquad(G('glass', 'back'), [(x_a + 0.03, ws + fr_t + 0.03, Z0 + zo), (x_b - 0.03, ws + fr_t + 0.03, Z0 + zo), (x_b - 0.03, wh - fr_t - 0.03, Z0 + zo), (x_a + 0.03, wh - fr_t - 0.03, Z0 + zo)], (0, 0, 1, 1))
    G('wood', 'back').rbox(wx0 - 0.05, wx1 + 0.05, ws - 0.03, ws, Z0 - 0.06, Z0 + 0.08, r=0.006)
for k, wn in enumerate(WINS):   # 窗外景的板（窗外 1.6 m；每扇窗一片、比窗大：斜看也不露邊；整張圖＝從窗口看出去的那一段街）
    VZ = Z0 - 1.6 - 0.05 * k; vx0, vx1, vy0 = wn['x0'] - 0.8, wn['x1'] + 1.0, wn['sill'] - 0.5; vy1 = vy0 + (vx1 - vx0) / 1.6
    uvquad(G('props', 'back'), [(vx0, vy0, VZ), (vx1, vy0, VZ), (vx1, vy1, VZ), (vx0, vy1, VZ)], pc('view', 1))
# 冷氣（窗的上面）
ac = IT['aircon'][0]; av = G('vc', 'back'); ax_, ay_ = ac['x'], ac['y']
av.crbox(ax_ - 0.5, ax_ + 0.5, ay_ - 0.15, ay_ + 0.15, Z0, Z0 + 0.23, '#efeee8', r=0.03, seg=3)
av.crbox(ax_ - 0.47, ax_ + 0.47, ay_ - 0.145, ay_ - 0.11, Z0 + 0.06, Z0 + 0.235, '#5a5c5e', r=0.005, seg=1)
for k in range(12): av.cbox(ax_ - 0.45 + k * 0.077, ax_ - 0.43 + k * 0.077, ay_ - 0.142, ay_ - 0.112, Z0 + 0.2, Z0 + 0.24, '#e2e0da')
av.crbox(ax_ + 0.33, ax_ + 0.42, ay_ + 0.02, ay_ + 0.035, Z0 + 0.23, Z0 + 0.234, '#6aa06a', r=0.001, seg=1)
# 冷氣的配管壓條（冷媒管＋排水管）：v4f（BB-C 11-05 03:21 問「窗右邊那條細白線」）——原本從冷氣右端直直往下（x ax+0.46），
# v4c 窗照外觀搬到冷氣下面以後剛好穿過窗玻璃；改成從冷氣底下沿著窗的上緣走到窗的右邊，再沿著牆往下到牆腳（壓條寬 6 cm、厚 3.5 cm，一般配管槽的大小）
_pw = max(w_['x1'] for w_ in WINS if w_['x0'] < ax_ + 0.5 and w_['x1'] > ax_ - 0.5) + 0.1   # 窗框右緣再過 10 cm
av.cbox(ax_ + 0.38, _pw + 0.06, ay_ - 0.26, ay_ - 0.2, Z0, Z0 + 0.035, '#ecebe5')   # 橫的一段：冷氣下緣和窗頂之間
av.cbox(_pw, _pw + 0.06, 0.12, ay_ - 0.2, Z0, Z0 + 0.035, '#ecebe5')                 # 直的一段：窗的右邊，到牆腳上面
# 「弦一個月換一次」＋三張照片（紙膠帶）
ns = IT['note_string'][0]; nx_, ny_, nw_, nh_ = ns['x'], ns['y'], ns['w'], ns['h']
uvquad(G('props', 'back'), wall_quad('back', 0.004, nx_ - nw_ / 2, nx_ + nw_ / 2, ny_ - nh_ / 2, ny_ + nh_ / 2), pc('note_string'))
for (a, b) in ((nx_ - nw_ / 2, ny_ + nh_ / 2), (nx_ + nw_ / 2, ny_ + nh_ / 2), (nx_ - nw_ / 2, ny_ - nh_ / 2), (nx_ + nw_ / 2, ny_ - nh_ / 2)):
    rr = random.uniform(-0.7, 0.7); c_, s_ = math.cos(rr), math.sin(rr)
    uvquad(G('props', 'back'), [(a + c_ * dx - s_ * dy, b + s_ * dx + c_ * dy, Z0 + 0.006) for dx, dy in ((-0.04, -0.012), (0.04, -0.012), (0.04, 0.012), (-0.04, 0.012))], pc('tape'))
for k, (px_, py_, rt) in enumerate(((nx_ - 0.14, 1.5, 0.03), (nx_ + 0.13, 1.47, -0.04), (nx_ - 0.1, 1.22, 0.02))):
    c_, s_ = math.cos(rt), math.sin(rt); hw_, hh_ = 0.1, 0.075
    pts = [(px_ + dx * c_ - dy * s_, py_ + dx * s_ + dy * c_, Z0 + 0.005 + k * 0.0005) for dx, dy in ((-hw_, -hh_), (hw_, -hh_), (hw_, hh_), (-hw_, hh_))]
    uvquad(G('props', 'back'), pts, pc(f'photo{(k + 1) % 3}'))
    uvquad(G('props', 'back'), [(px_ - 0.03, py_ + hh_ - 0.012, Z0 + 0.007), (px_ + 0.03, py_ + hh_ - 0.012, Z0 + 0.007), (px_ + 0.03, py_ + hh_ + 0.012, Z0 + 0.007), (px_ - 0.03, py_ + hh_ + 0.012, Z0 + 0.007)], pc('tape'))
uvquad(G('props', 'back'), wall_quad('back', 0.003, 2.3, 2.55, 1.0, 1.05), pc('tape_old'))   # 撕掉的海報留下的膠帶痕
for k, (nm, cx_, cy_, w_, h_) in enumerate((('note_lesson', 1.0, 1.75, 0.34, 0.34), ('flyer', 1.55, 1.85, 0.36, 0.5), ('note_used', 2.1, 1.7, 0.3, 0.3), ('photo1', 1.3, 1.3, 0.24, 0.18), ('score', 2.55, 1.8, 0.3, 0.38))):   # v4c：窗牆東段（外觀的招牌那一段，實牆）：公告、傳單、照片
    uvquad(G('props', 'back'), wall_quad('back', 0.004 + k * 0.0004, cx_ - w_ / 2, cx_ + w_ / 2, cy_ - h_ / 2, cy_ + h_ / 2), pc(nm))
    uvquad(G('props', 'back'), wall_quad('back', 0.0062 + k * 0.0004, cx_ - 0.035, cx_ + 0.035, cy_ + h_ / 2 - 0.014, cy_ + h_ / 2 + 0.01), pc('tape'))

# ---------------- 東牆：米色溝槽板（參考圖：淺色木條、細的深色溝） ----------------
gw = IT['guitar_wall'][0]; GZ0, GZ1, GY0, GY1 = gw['z0'], gw['z1'], gw['y0'], gw['y1']


def slatwall(side, a0, a1, y0, y1):
    """side：right（x＝X1，面向 −x）或 left（x＝X0，面向 +x）；a＝沿牆的 z"""
    xw = X1 if side == 'right' else X0; s = -1 if side == 'right' else 1
    G('vc', side).cbox(*sorted((xw, xw + s * 0.012)), y0, y1, a0, a1, '#5e4532')                # 溝後面的暗色底板
    sl = G('slat', side); pitch, gap = 0.152, 0.012; y = y0
    while y + pitch <= y1 + 1e-6:
        sl.rbox(*sorted((xw + s * 0.012, xw + s * 0.032)), y + gap, y + pitch, a0, a1, r=0.003, seg=1); y += pitch
    for yy_ in (y0 - 0.06, y):   # 上下收邊（木條）
        G('wood', side).rbox(*sorted((xw + s * 0.008, xw + s * 0.04)), yy_, yy_ + 0.06, a0 - 0.02, a1 + 0.02, r=0.004, seg=1)
    return y


slatwall('right', GZ0, GZ1, GY0, GY1)
G('vc', 'right').cbox(X1 - 0.004, X1, 0.1, GY0 - 0.06, GZ0, GZ1, '#d8c8ae')   # 溝槽板下面的牆（櫃台後面，有點髒）

# ---------------- 吉他：原型（instancing）＋掛勾 ----------------
E_SPECS = [dict(kind='T', fin='e_blonde', pg='pg_black', fb='fb_maple'), dict(kind='S', fin='e_black', pg='pg_white', fb='fb_rose'), dict(kind='T', fin='e_cream', pg='pg_black', fb='fb_maple'),
           dict(kind='S', fin='e_red', pg='pg_white', fb='fb_rose'), dict(kind='S', fin='e_blue', pg='pg_white', fb='fb_rose'), dict(kind='E', fin='e_sunburst', pg='pg_black', fb='fb_rose', neck='neck_mahog'),
           dict(kind='S', fin='e_sage', pg='pg_white', fb='fb_maple'), dict(kind='T', fin='e_blonde', pg='pg_white', fb='fb_rose'), dict(kind='S', fin='e_seafoam', pg='pg_white', fb='fb_maple'),
           dict(kind='T', fin='e_black', pg='pg_white', fb='fb_maple'), dict(kind='S', fin='e_navy', pg='pg_mint', fb='fb_rose'), dict(kind='S', fin='e_sunburst', pg='pg_tort', fb='fb_rose'),
           dict(kind='E', fin='e_cherry', pg='pg_black', fb='fb_rose', neck='neck_mahog'), dict(kind='S', fin='e_white', pg='pg_black', fb='fb_maple')]
A_SPECS = [dict(top='spruce', side='side_mahog', shape='om'), dict(top='sunburst_ac', side='side_mahog', pg='pg_black'), dict(top='spruce', side='side_rose'),
           dict(top='mahog_top', side='side_mahog', shape='om'), dict(top='spruce_aged', side='side_mahog'), dict(top='spruce', side='side_maple', shape='om'),
           dict(top='spruce_aged', side='side_rose', pg='pg_black'), dict(top='koa_dark', side='side_rose', shape='om'), dict(top='spruce', side='side_mahog', pg='pg_black'),
           dict(top='mahog_top', side='side_mahog'), dict(top='spruce', side='side_rose', shape='om', head='head_rose')]
EP = [GProto(f'e{i}', s, 'right') for i, s in enumerate(E_SPECS)]
AP = [GProto(f'a{i}', dict(s, kind='ac'), 'right') for i, s in enumerate(A_SPECS)]


def hook_fn(arm):
    def f(cv, cm):   # 原點＝托（Y 形）的中心；手臂往 +x 到牆（arm 長）
        col = '#1c1c1e'
        sg = 1 if arm > 0 else -1   # v4b：整個縮小一半（LAWWW2 P2：掛勾太搶眼）；手臂長度只縮到吉他轉 30～35° 不碰牆的最短
        cv.cbox(min(arm - sg * 0.006, arm + sg * 0.002), max(arm - sg * 0.006, arm + sg * 0.002), -0.03, 0.015, -0.011, 0.011, col)   # 牆上的底座（卡在溝槽裡）
        n0 = set(cm.bm.faces); cm.cyl((arm, 0, 0), (0.0, 0.0, 0), 0.003, seg=4, caps=False); cm.paint([f_ for f_ in cm.bm.faces if f_ not in n0], col)
        n0 = set(cm.bm.faces); cm.cyl((0, 0, -0.028), (0, 0, 0.028), 0.003, seg=4, caps=False); cm.paint([f_ for f_ in cm.bm.faces if f_ not in n0], col)
        for s in (-1, 1):
            n0 = set(cv.bm.faces); cv.cyl((0, 0, s * 0.028), (-sg * 0.004, 0.022, s * 0.03), 0.0035, seg=4); cv.paint([f_ for f_ in cv.bm.faces if f_ not in n0], '#2e2e30')
    return f


HOOK = {k: PProto(f'hook{k}', 'right', hook_fn(a)) for k, a in (('E', 0.135), ('A', 0.195))}
XS = X1 - 0.032   # 溝槽板的表面
TAGS = []


def wall_row(protos, kind, yh, z0, z1, pitch, ang, arm, order, tag_every=0):
    n = int((z1 - z0) / pitch) + 1; out = []
    for i in range(n):
        zc = z0 + i * pitch; pr = protos[order[i % len(order)]]
        a = ang + random.uniform(-0.05, 0.05); wdir = Vector((-math.cos(a), 0, math.sin(a)))
        if pr.ob is None: pr.build()
        wy, vy = pr.wt - 0.02, pr.vn - 0.03
        Pk = Vector((XS - arm, yh, zc)); o = Pk - wdir * wy - Vector((0, vy, 0))
        fr = Frame(tuple(o), tuple(wdir), (0, 1, 0)); pr.place(fr.M)
        HOOK[kind].place(T4(XS - arm, yh, zc))
        if tag_every and i % tag_every == 1: TAGS.append((Pk, wdir, len(TAGS)))
        out.append(zc)
    return n


NE = wall_row(EP, 'E', 2.80, GZ0 + 0.17, GZ1 - 0.17, 0.33, math.radians(33), 0.135, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
NA = wall_row(AP, 'A', 1.78, GZ0 + 0.22, GZ1 - 0.2, 0.36, math.radians(30), 0.195, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], tag_every=3)
for (Pk, wdir, k) in TAGS:   # 價錢牌（掛在琴頭下面的弦鈕上，正面朝店裡）
    c = Pk + Vector((0, -0.11, 0)) + wdir * 0.03; r = Vector((wdir.z, 0, -wdir.x)) * -1
    q = [c - r * 0.04 - Vector((0, 0.03, 0)), c + r * 0.04 - Vector((0, 0.03, 0)), c + r * 0.04 + Vector((0, 0.03, 0)), c - r * 0.04 + Vector((0, 0.03, 0))]
    uvquad(G('props', 'right'), [tuple(p) for p in q], pc(f'ptag{k % 8}'))

# ---------------- 櫃台：北段玻璃展示櫃、南段木頭檯面 ----------------
co = IT['counter'][0]; cx0, cx1 = co['x'] - co['w'] / 2, co['x'] + co['w'] / 2; cz0, cz1 = co['z'] - co['d'] / 2, co['z'] + co['d'] / 2
GZB = 1.75; YB, YT = 0.52, 1.0   # 玻璃段的南端、木頭底座的頂、玻璃頂
CV.crbox(cx0 + 0.03, cx1 - 0.03, 0.0, 0.06, cz0 + 0.03, cz1 - 0.03, '#33281f', r=0.004, seg=1)
WD.rbox(cx0, cx1, 0.06, YB, cz0, GZB, r=0.008, seg=2)                                          # 玻璃櫃的木頭底座
WD.rbox(cx0 - 0.012, cx1 + 0.012, YB, YB + 0.03, cz0 - 0.012, GZB, r=0.006, seg=2)
for k in range(5): CV.cbox(cx0 - 0.004, cx0 - 0.001, 0.09, YB - 0.04, cz0 + 0.06 + k * 0.36, cz0 + 0.066 + k * 0.36, '#6a4a32')   # 木板的縫
CV.cbox(cx0 - 0.005, cx0 - 0.001, 0.06, 0.15, cz0 + 0.05, cz1 - 0.05, '#4a3626')                   # 踢腳的髒（客人的鞋）
uvquad(PR, [(cx0 + 0.02, YB + 0.0305, GZB - 0.02), (cx1 - 0.02, YB + 0.0305, GZB - 0.02), (cx1 - 0.02, YB + 0.0305, cz0 + 0.02), (cx0 + 0.02, YB + 0.0305, cz0 + 0.02)], pc('felt'))
yb2 = YB + 0.03
for (px, pz) in ((cx0, cz0), (cx0, GZB), (cx1, cz0), (cx1, GZB)): CMt.crbox(px - 0.012, px + 0.012, yb2, YT, pz - 0.012, pz + 0.012, '#c9a86a', r=0.004, seg=1)   # 參考圖：金色（黃銅）框
for y_ in (yb2, YT - 0.018):
    CMt.cbox(cx0, cx1, y_, y_ + 0.018, cz0 - 0.012, cz0 + 0.012, '#c9a86a'); CMt.cbox(cx0, cx1, y_, y_ + 0.018, GZB - 0.012, GZB + 0.012, '#c9a86a')
    CMt.cbox(cx0 - 0.012, cx0 + 0.012, y_, y_ + 0.018, cz0, GZB, '#c9a86a'); CMt.cbox(cx1 - 0.012, cx1 + 0.012, y_, y_ + 0.018, cz0, GZB, '#c9a86a')
uvquad(GL, [(cx0, YT + 0.002, GZB), (cx1, YT + 0.002, GZB), (cx1, YT + 0.002, cz0), (cx0, YT + 0.002, cz0)], (0, 0, 1, 1))
for q in ([(cx0, yb2, GZB), (cx0, yb2, cz0), (cx0, YT - 0.018, cz0), (cx0, YT - 0.018, GZB)], [(cx1, yb2, cz0), (cx1, yb2, GZB), (cx1, YT - 0.018, GZB), (cx1, YT - 0.018, cz0)],
          [(cx0, yb2, cz0), (cx1, yb2, cz0), (cx1, YT - 0.018, cz0), (cx0, YT - 0.018, cz0)]): uvquad(GL, q, (0, 0, 1, 1))
GL.box(cx0 + 0.02, cx1 - 0.02, 0.78, 0.788, cz0 + 0.9, GZB - 0.02)                                  # 南半的玻璃層板
# 木頭段（收銀）
WD.rbox(cx0, cx1, 0.06, 0.96, GZB, cz1, r=0.008, seg=2); WD.rbox(cx0 - 0.03, cx1 + 0.01, 0.96, 1.0, GZB - 0.01, cz1 + 0.03, r=0.008, seg=2)
for k in range(4): CV.cbox(cx0 - 0.004, cx0 - 0.001, 0.09, 0.93, GZB + 0.2 + k * 0.28, GZB + 0.206 + k * 0.28, '#6a4a32')
CV.cbox(cx0 - 0.034, cx0 - 0.03, 0.985, 0.999, GZB + 0.05, cz1 - 0.05, '#d8b88a')                    # 檯面邊緣磨白
uvquad(PR, [(cx0 - 0.0045, 0.62, GZB + 0.7), (cx0 - 0.0045, 0.62, GZB + 0.45), (cx0 - 0.0045, 0.82, GZB + 0.45), (cx0 - 0.0045, 0.82, GZB + 0.7)], pc('note_setup'))   # 櫃台正面的價目紙
for (zz_, yy_) in ((GZB + 0.45, 0.82), (GZB + 0.7, 0.82)):
    uvquad(PR, [(cx0 - 0.005, yy_ - 0.012, zz_ + 0.03), (cx0 - 0.005, yy_ - 0.012, zz_ - 0.03), (cx0 - 0.005, yy_ + 0.012, zz_ - 0.03), (cx0 - 0.005, yy_ + 0.012, zz_ + 0.03)], pc('tape'))
uvquad(PR, [(cx0 - 0.0042, 0.4, GZB + 1.1), (cx0 - 0.0042, 0.4, GZB + 0.95), (cx0 - 0.0042, 0.43, GZB + 0.95), (cx0 - 0.0042, 0.43, GZB + 1.1)], pc('tape_old'))   # 舊膠帶痕


def tbox(m, cx, cy, cz, w, h, d, ry, rx, front, other):
    """貼圖的小盒子：中心、寬高厚、繞 y 轉 ry、往後仰 rx；front＝正面（局部 −y＝Blender）"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); uvl = bm.loops.layers.uv.new('UVMap')
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    bm.normal_update()
    for f in bm.faces:
        n = f.normal; rect = front if n.y < -0.5 else other
        for lp in f.loops:
            co_ = lp.vert.co; lp[uvl].uv = lerp_uv(rect, co_.x / w + 0.5, co_.z / h + 0.5)
    mtx = Matrix.Translation(g2b(cx, cy, cz)) @ Matrix.Rotation(ry, 4, 'Z') @ Matrix.Rotation(-rx, 4, 'X')
    m.add_bm(bm, mtx); bm.free()


def roll(m, cx, cy, cz, r, ln, axis_x, rect):
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


# 櫃裡：北半＝弦的包裝（四排階梯，一排 8 包，斜立朝客人）；南半＝移調夾、調音器（黑色台子）、Pick 盒、背帶、清潔油
yf = YB + 0.031
for row in range(4):
    xr = cx0 + 0.1 + row * 0.115; yr = yf + row * 0.045
    if row: WD.rbox(xr - 0.055, cx1 - 0.03, yf, yr, cz0 + 0.04, cz0 + 0.98, r=0.004, seg=1)   # 階梯
    for k in range(8):
        z_ = cz0 + 0.1 + k * 0.115 + (row % 2) * 0.02; nm_ = f'spack{(k * 3 + row * 5) % 8}'
        tbox(PR, xr, yr + 0.065, z_, 0.112, 0.112, 0.01, -math.pi / 2, math.radians(16), pc(nm_), mid(pc(nm_), 0.08))
cr_x0 = cx0 + 0.3
CV.crbox(cr_x0, cx1 - 0.04, yf, yf + 0.07, cz0 + 1.02, cz0 + 1.62, '#1c1c1e', r=0.006, seg=1)   # 黑色台子
for k in range(4):   # 移調夾（夾子形：上下兩臂＋彈簧），站在台子上
    cz_ = cz0 + 1.08 + k * 0.12; cx_ = cr_x0 + 0.09; yy0 = yf + 0.07; col = ['#1c1c1e', '#c9ccce', '#1c1c1e', '#8a6a3a'][k]
    CMt.crbox(cx_ - 0.012, cx_ + 0.012, yy0, yy0 + 0.075, cz_ - 0.011, cz_ + 0.011, col, r=0.005, seg=1)
    CMt.crbox(cx_ - 0.05, cx_ + 0.012, yy0 + 0.06, yy0 + 0.075, cz_ - 0.009, cz_ + 0.009, col, r=0.005, seg=1)
    CMt.crbox(cx_ - 0.05, cx_ - 0.034, yy0 + 0.02, yy0 + 0.075, cz_ - 0.011, cz_ + 0.011, col, r=0.004, seg=1)
    vpaint(CMt, '#d9dcde', lambda: CMt.cyl((cx_ + 0.004, yy0 + 0.05, cz_ - 0.012), (cx_ + 0.004, yy0 + 0.05, cz_ + 0.012), 0.008, seg=8))
for k in range(3):   # 夾式調音器
    cz_ = cz0 + 1.52 + k * 0.0; cx_ = cr_x0 + 0.05 + k * 0.07; yy0 = yf + 0.07
    CV.crbox(cx_ - 0.012, cx_ + 0.012, yy0, yy0 + 0.05, cz_ - 0.015, cz_ + 0.015, '#1e1e20', r=0.005, seg=1)
    CV.crbox(cx_ - 0.03, cx_ + 0.004, yy0 + 0.045, yy0 + 0.09, cz_ - 0.025, cz_ + 0.025, '#2a2a2c', r=0.008, seg=2)
    CV.poly([(cx_ - 0.031, yy0 + 0.052, cz_ + 0.018), (cx_ - 0.031, yy0 + 0.052, cz_ - 0.018), (cx_ - 0.031, yy0 + 0.083, cz_ - 0.018), (cx_ - 0.031, yy0 + 0.083, cz_ + 0.018)], ['#9ad0d8', '#b8e0a0', '#9ad0d8'][k])
tbox(PR, cr_x0 + 0.06, 0.79 + 0.05, cz0 + 1.0, 0.16, 0.1, 0.03, -math.pi / 2, 0.0, pc('capobox'), mid(pc('capobox'), 0.1))   # 層板上：盒裝的移調夾、調音器
tbox(PR, cr_x0 + 0.06, 0.79 + 0.05, cz0 + 1.2, 0.16, 0.1, 0.03, -math.pi / 2, 0.0, pc('tunerbox'), mid(pc('tunerbox'), 0.1))
for k in range(3):   # Pick 盒（淺木盒＋彩色 Pick；前排）
    cz_ = cz0 + 1.08 + k * 0.2; cx_ = cx0 + 0.13
    WD.rbox(cx_ - 0.08, cx_ + 0.08, yf, yf + 0.03, cz_ - 0.085, cz_ + 0.085, r=0.004, seg=1)
    uvquad(PR, [(cx_ - 0.07, yf + 0.031, cz_ + 0.075), (cx_ + 0.07, yf + 0.031, cz_ + 0.075), (cx_ + 0.07, yf + 0.031, cz_ - 0.075), (cx_ - 0.07, yf + 0.031, cz_ - 0.075)], pc('picks_a' if k % 2 else 'picks_b'))
for k in range(4):   # 背帶（捲起來，前排靠南端）
    roll(PR, cx0 + 0.1 + (k % 2) * 0.09, yf + 0.04, GZB - 0.07 - (k // 2) * 0.09, 0.037, 0.07, False, pc(f'strap{k}'))
for k in range(4):   # 南半的玻璃層板上：背帶（掛起來展示，參考圖右下）
    roll(PR, cx0 + 0.14 + k * 0.1, 0.788 + 0.04, GZB - 0.2, 0.036, 0.1, False, pc(f'strap{(k + 2) % 6}'))
for k in range(3):   # 清潔油、弦油
    bx_, bz_ = cx1 - 0.12, GZB - 0.28 - k * 0.09
    vpaint(CV, '#eeeeea', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.02, 0.0), (0.022, 0.006), (0.022, 0.085), (0.011, 0.1), (0.0, 0.1)], seg=10), Matrix.Translation(g2b(bx_, 0.789, bz_))))
    vpaint(CV, ['#2a5aa8', '#c83a2a', '#1a1a1a'][k], lambda: CV.cyl((bx_, 0.889, bz_), (bx_, 0.915, bz_), 0.01, seg=8))
uvquad(PR, [(cx0 - 0.003, 0.88, cz0 + 0.55), (cx0 - 0.003, 0.88, cz0 + 0.35), (cx0 - 0.003, 0.96, cz0 + 0.35), (cx0 - 0.003, 0.96, cz0 + 0.55)], pc('ptag4'))   # 玻璃上貼的價錢

# ---------------- 葉子（黃金葛）：先收集，最後一起建 ----------------
LEAVES = []; STEMS = []


def leaf_at(base, d, nrm, Lf, var=0): LEAVES.append((Vector(base), Vector(d).normalized(), Vector(nrm), Lf, var))


def vine(start, out_dir, length, seed, step=0.07, droop=1.0, size=0.075):
    rg = random.Random(seed); p = Vector(start); od = Vector(out_dir).normalized(); n = max(3, int(length / step)); pts = [p.copy()]
    for i in range(n):
        t = i / n; dirv = (od * max(0.0, 1.0 - t * 2.5 * droop) + Vector((0, -1, 0)) * min(1.0, t * 2.5 * droop + 0.1))
        dirv += Vector((rg.uniform(-0.25, 0.25), 0, rg.uniform(-0.25, 0.25))); dirv.normalize(); p = p + dirv * step; pts.append(p.copy())
        side = od.cross(Vector((0, 1, 0)))
        if side.length < 1e-3: side = Vector((1, 0, 0))
        side.normalize(); s = 1 if i % 2 else -1
        ld = (side * s * 0.8 + od * 0.5 + Vector((0, -0.6, 0))).normalized(); nr = (od + Vector((0, 0.3, 0))).normalized()
        leaf_at(p, ld, nr, size * (1 - 0.4 * t) * rg.uniform(0.85, 1.1), rg.randint(0, 1))
    STEMS.append(pts)


def pothos_mound(cx, cy, cz, r, n, seed, size=(0.07, 0.1)):
    rg = random.Random(seed)
    for k in range(n):
        a = rg.uniform(0, 2 * math.pi); e = rg.uniform(0.2, 1.1)
        d = Vector((math.cos(a) * math.cos(e), math.sin(e), math.sin(a) * math.cos(e))); base = Vector((cx, cy, cz)) + Vector((math.cos(a), 0, math.sin(a))) * r * rg.uniform(0.0, 0.6)
        nr = Vector((math.cos(a) * 0.3, 1.0, math.sin(a) * 0.3)).normalized(); leaf_at(base, d, nr, rg.uniform(*size), rg.randint(0, 1))


def pot(m_vc, cx, cy, cz, r, h, col, seg=14):
    vpaint(m_vc, col, lambda: m_vc.add_bm(L.lathe([(r * 0.72, 0.0), (r * 0.78, 0.01), (r, h * 0.9), (r * 1.06, h * 0.92), (r * 1.06, h), (r * 0.96, h), (r * 0.94, h * 0.9), (0.0, h * 0.88)], seg=seg), Matrix.Translation(g2b(cx, cy, cz))))
    vpaint(m_vc, '#3e3024', lambda: m_vc.add_bm(L.lathe([(r * 0.93, h * 0.88), (0.0, h * 0.89)], seg=seg), Matrix.Translation(g2b(cx, cy + 0.002, cz))))


# 櫃台上：北端一盆黃金葛（藤垂到櫃台前面）、筆筒、帳本、名片、收銀機
ty = YT + 0.004
pot(CV, cx0 + 0.18, ty, cz0 + 0.12, 0.085, 0.13, '#e9e5dc'); pothos_mound(cx0 + 0.18, ty + 0.13, cz0 + 0.12, 0.08, 18, 3)
for k, (dz, ln) in enumerate(((-0.06, 0.55), (0.05, 0.75), (0.12, 0.5), (-0.1, 0.4))): vine((cx0 + 0.11, ty + 0.12, cz0 + 0.12 + dz), (-1, 0, dz * 2 - 0.4), ln, 40 + k)
vpaint(CV, '#3a3632', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.035, 0.0), (0.036, 0.11), (0.032, 0.11), (0.031, 0.008), (0.0, 0.008)], seg=12), Matrix.Translation(g2b(cx0 + 0.2, ty, cz0 + 0.4))))   # 筆筒（參考圖：深色）
for k in range(5): vpaint(CV, ['#1a1a1a', '#2a4a9a', '#c83a2a', '#d0b060', '#2a8a5a'][k], lambda: CV.cyl((cx0 + 0.2 + (k - 2) * 0.008, ty + 0.05, cz0 + 0.4 + (k % 2) * 0.01), (cx0 + 0.2 + (k - 2) * 0.018, ty + 0.17, cz0 + 0.4 + (k % 2) * 0.02), 0.0045, seg=6))
bk = (cx0 + 0.32, cz0 + 0.62)   # 帳本（闔著，放在一疊譜上）
CV.crbox(bk[0] - 0.12, bk[0] + 0.12, ty, ty + 0.02, bk[1] - 0.16, bk[1] + 0.16, '#e8e2d2', r=0.003, seg=1); CV.crbox(bk[0] - 0.11, bk[0] + 0.11, ty + 0.02, ty + 0.045, bk[1] - 0.15, bk[1] + 0.15, '#7a3a2a', r=0.004, seg=1)
tbox(PR, cx0 + 0.15, ty + 0.002, GZB + 0.25, 0.09, 0.06, 0.004, -math.pi / 2, math.radians(90), pc('bizcard'), pc('bizcard'))
tbox(PR, cx0 + 0.25, ty + 0.012, cz0 + 0.95, 0.112, 0.112, 0.01, 0.4, math.radians(90), pc('spack0'), mid(pc('spack0'), 0.1))   # 剛賣出去的一盒弦（平放）
rx_, rz_ = cx0 + 0.32, GZB + 0.65   # 收銀機（螢幕朝老闆）＋刷卡機
CV.crbox(rx_ - 0.17, rx_ + 0.17, ty, ty + 0.09, rz_ - 0.2, rz_ + 0.2, '#2a2a2c', r=0.012, seg=2)
CV.crbox(rx_ + 0.02, rx_ + 0.05, ty + 0.09, ty + 0.3, rz_ - 0.15, rz_ + 0.15, '#1e1e20', r=0.008, seg=1)
CV.poly([(rx_ + 0.051, ty + 0.11, rz_ - 0.13), (rx_ + 0.051, ty + 0.11, rz_ + 0.13), (rx_ + 0.051, ty + 0.28, rz_ + 0.13), (rx_ + 0.051, ty + 0.28, rz_ - 0.13)], '#8ab0c0')
CV.crbox(cx0 + 0.08, cx0 + 0.18, ty, ty + 0.05, GZB + 1.05, GZB + 1.18, '#2a2a2c', r=0.01, seg=2)
pot(CV, cx0 + 0.15, ty, cz1 - 0.15, 0.05, 0.07, '#9a6a4a'); pothos_mound(cx0 + 0.15, ty + 0.07, cz1 - 0.15, 0.04, 8, 5, size=(0.05, 0.07))   # 收銀旁的小盆栽
vpaint(CV, '#f1ece0', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.05, 0.0), (0.055, 0.12), (0.0, 0.12)], seg=12), Matrix.Translation(g2b(cx0 + 0.42, ty, GZB + 1.12))))   # 裝 Pick 的玻璃罐（乳白）
for k in range(8): vpaint(CV, ['#d94a3a', '#e9b03a', '#3a7ad9', '#2a2a2a'][k % 4], lambda: CV.poly([(cx0 + 0.4 + (k % 3) * 0.02, ty + 0.121, GZB + 1.1 + (k // 3) * 0.02), (cx0 + 0.415 + (k % 3) * 0.02, ty + 0.121, GZB + 1.1 + (k // 3) * 0.02), (cx0 + 0.408 + (k % 3) * 0.02, ty + 0.121, GZB + 1.12 + (k // 3) * 0.02)], ['#d94a3a', '#e9b03a', '#3a7ad9', '#2a2a2a'][k % 4]))


def stool(m_wood, cm, x, z, sh, r=0.17, legc='#1c1c1e', ring=0.24):
    Xf_ = Matrix.Translation(g2b(x, sh - 0.045, z))
    m_wood.add_bm(L.lathe([(0.0, 0.0), (r - 0.012, 0.0), (r, 0.012), (r, 0.033), (r - 0.012, 0.045), (0.0, 0.045)], seg=16), Xf_)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; ca, sa = math.cos(a), math.sin(a)
        vpaint(cm, legc, lambda: cm.cyl((x + ca * (r * 0.62), sh - 0.045, z + sa * (r * 0.62)), (x + ca * (r + 0.05), 0.0, z + sa * (r + 0.05)), 0.011, seg=5, caps=False))
        vpaint(cm, '#2a2a2a', lambda: cm.cyl((x + ca * (r + 0.05), 0.0, z + sa * (r + 0.05)), (x + ca * (r + 0.05), 0.012, z + sa * (r + 0.05)), 0.014, seg=5))
    rr = r * 0.62 + (r + 0.05 - r * 0.62) * (1 - ring / (sh - 0.045))
    vpaint(cm, legc, lambda: cm.add_bm(L.lathe([(rr + 0.007, -0.007), (rr + 0.007, 0.007), (rr - 0.007, 0.007), (rr - 0.007, -0.007), (rr + 0.007, -0.007)], seg=12), Matrix.Translation(g2b(x, ring, z))))   # 腳踏圈
    vpaint(cm, legc, lambda: cm.add_bm(L.lathe([(r * 0.66, 0.0), (r * 0.6, 0.0), (r * 0.6, 0.03), (r * 0.66, 0.03)], seg=12), Matrix.Translation(g2b(x, sh - 0.075, z))))


sc_ = IT['stool_counter'][0]; stool(WD, CMt, sc_['x'], sc_['z'], sc_['seatH'], r=0.17)
so_ = IT['stool_owner'][0]; stool(WD, CMt, so_['x'], so_['z'], so_['seatH'], r=0.16)

# ---------------- 試琴角 ----------------
rg_ = IT['rug'][0]; rx0, rx1, rz0, rz1 = rg_['x'] - rg_['w'] / 2, rg_['x'] + rg_['w'] / 2, rg_['z'] - rg_['d'] / 2, rg_['z'] + rg_['d'] / 2
uvquad(PR, [(rx0, 0.006, rz1), (rx1, 0.006, rz1), (rx1, 0.006, rz0), (rx0, 0.006, rz0)], pc('rug', 1))
CV.cbox(rx0 + 0.01, rx1 - 0.01, 0.0, 0.0058, rz0 + 0.01, rz1 - 0.01, '#5a2420')
for st in IT['trial_stool']: stool(WD, CMt, st['x'], st['z'], LAY['seats'][0]['seatH'])
am = IT['amp'][0]; ax0, ax1, az0, az1 = am['x'] - am['w'] / 2, am['x'] + am['w'] / 2, am['z'] - am['d'] / 2, am['z'] + am['d'] / 2; ah = am['h']
CV.crbox(ax0, ax1, 0.02, ah, az0, az1, '#2a2826', r=0.018, seg=3)
for (cx_, cy_) in ((ax0, 0.02), (ax1, 0.02), (ax0, ah), (ax1, ah)): CMt.crbox(cx_ - 0.018, cx_ + 0.018, cy_ - 0.018, cy_ + 0.018, az1 - 0.03, az1 + 0.004, '#8a8c8e', r=0.008, seg=1)
uvquad(PR, [(ax0 + 0.03, 0.05, az1 + 0.002), (ax1 - 0.03, 0.05, az1 + 0.002), (ax1 - 0.03, ah - 0.1, az1 + 0.002), (ax0 + 0.03, ah - 0.1, az1 + 0.002)], pc('grille'))   # 參考圖：米色斜紋面網
for (a0, a1, b0, b1) in ((ax0 + 0.03, ax1 - 0.03, 0.045, 0.052), (ax0 + 0.03, ax1 - 0.03, ah - 0.103, ah - 0.096), (ax0 + 0.026, ax0 + 0.033, 0.045, ah - 0.096), (ax1 - 0.033, ax1 - 0.026, 0.045, ah - 0.096)):
    CMt.cbox(a0, a1, b0, b1, az1, az1 + 0.005, '#c9c9c4')
CMt.crbox(ax0 + 0.03, ax1 - 0.03, ah - 0.09, ah - 0.02, az1 - 0.002, az1 + 0.003, '#b9bcbe', r=0.003, seg=1)
for k in range(6): vpaint(CV, '#151515', lambda: CV.cyl((ax0 + 0.07 + k * 0.06, ah - 0.055, az1 + 0.003), (ax0 + 0.07 + k * 0.06, ah - 0.055, az1 + 0.02), 0.011, seg=6))
CV.poly([(ax1 - 0.06, ah - 0.06, az1 + 0.0035), (ax1 - 0.045, ah - 0.06, az1 + 0.0035), (ax1 - 0.045, ah - 0.045, az1 + 0.0035), (ax1 - 0.06, ah - 0.045, az1 + 0.0035)], '#e84a2a')
CV.crbox(am['x'] - 0.1, am['x'] + 0.1, ah, ah + 0.03, am['z'] - 0.02, am['z'] + 0.02, '#151515', r=0.01, seg=2)
c0 = (am['x'] - 0.1, am['z'] + 0.45)
for k in range(14):   # 導線：從音箱繞一圈在地毯上
    a0, a1 = 2 * math.pi * k / 14, 2 * math.pi * (k + 1) / 14
    vpaint(CV, '#151515', lambda: CV.cyl((c0[0] + 0.17 * math.cos(a0), 0.013, c0[1] + 0.12 * math.sin(a0)), (c0[0] + 0.17 * math.cos(a1), 0.013, c0[1] + 0.12 * math.sin(a1)), 0.005, seg=4, caps=False))
vpaint(CV, '#151515', lambda: CV.cyl((ax1 - 0.06, 0.12, az1 + 0.01), (c0[0] + 0.17, 0.013, c0[1]), 0.005, seg=4, caps=False))
ms = IT['music_stand'][0]; mx, mz = ms['x'], ms['z']; ts = IT['trial_stool'][0]; myaw = math.atan2(ts['x'] - mx, ts['z'] - mz)
for k in range(3):
    a = myaw + math.pi + (k - 1) * 2.1
    vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((mx, 0.32, mz), (mx + 0.26 * math.sin(a), 0.0, mz + 0.26 * math.cos(a)), 0.006, seg=6))
vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((mx, 0.25, mz), (mx, 1.1, mz), 0.009, seg=8))
mfr = Frame((mx, 1.08, mz), (math.sin(myaw), 0.45, math.cos(myaw)), (0, 1, 0))
pt = Part(); prism(pt, [(-0.25, -0.02), (0.25, -0.02), (0.25, 0.32), (-0.25, 0.32)], 0.0, 0.004, pc('mstand'), pc('mstand'), bottom=True)
prism(pt, [(-0.25, -0.02), (0.25, -0.02), (0.25, 0.0), (-0.25, 0.0)], 0.0, 0.035, pc('mstand'), pc('mstand'), bottom=True)
prism(pt, [(-0.22, 0.0), (0.0, 0.0), (0.0, 0.28), (-0.22, 0.28)], 0.0045, 0.006, pc('score'), pc('paper'))
prism(pt, [(0.002, 0.0), (0.222, 0.0), (0.222, 0.28), (0.002, 0.28)], 0.0045, 0.0062, pc('score'), pc('paper'))
pt.into(PR, mfr)
ps_ = IT['plant_stand'][0]   # 窗邊的花台＋黃金葛（參考圖：窗的右下）
for k in range(4):
    a = math.pi / 4 + k * math.pi / 2; vpaint(CV, '#5a3c26', lambda: CV.cyl((ps_['x'] + 0.1 * math.cos(a), 0.0, ps_['z'] + 0.1 * math.sin(a)), (ps_['x'] + 0.12 * math.cos(a), 0.72, ps_['z'] + 0.12 * math.sin(a)), 0.012, seg=6))
WD.add_bm(L.lathe([(0.0, 0.0), (0.16, 0.0), (0.16, 0.03), (0.0, 0.03)], seg=16), Matrix.Translation(g2b(ps_['x'], 0.72, ps_['z'])))
pot(CV, ps_['x'], 0.75, ps_['z'], 0.1, 0.16, '#e2ddd2'); pothos_mound(ps_['x'], 0.91, ps_['z'], 0.1, 22, 7)
for k in range(4): vine((ps_['x'] + 0.1 * math.cos(k * 1.7), 0.9, ps_['z'] + 0.1 * math.sin(k * 1.7)), (math.cos(k * 1.7), 0, math.sin(k * 1.7)), 0.35 + 0.1 * k, 60 + k)
pd = IT['pendant'][0]; px, py, pz = pd['x'], pd['y'], pd['z']   # 吊燈（深色搪瓷燈罩、白的內面）
vpaint(CV, '#1a1a1a', lambda: CV.cyl((px, H, pz), (px, py + 0.2, pz), 0.004, seg=4))
vpaint(CMt, '#2e3134', lambda: CMt.add_bm(L.lathe([(0.0, 0.215), (0.03, 0.215), (0.035, 0.19), (0.07, 0.16), (0.17, 0.05), (0.205, 0.01), (0.21, 0.0), (0.2, 0.0), (0.16, 0.04), (0.065, 0.15), (0.0, 0.17)], seg=16), Matrix.Translation(g2b(px, py, pz))))
vpaint(CMt, '#f0ece2', lambda: CMt.add_bm(L.lathe([(0.0, 0.168), (0.064, 0.148), (0.158, 0.038), (0.198, 0.0)], seg=16), Matrix.Translation(g2b(px, py + 0.002, pz))))
EM.add_bm(L.lathe([(0.0, 0.0), (0.03, 0.01), (0.04, 0.05), (0.03, 0.09), (0.0, 0.1)], seg=10), Matrix.Translation(g2b(px, py + 0.04, pz)))
CL.glow(root, 'pendant', px, py - 0.02, pz, color='rgba(255,214,160,1)', size=1.6, day=0.3, night=1.0)

# ---------------- 書架（隔間）＋上面的黃金葛；門口上方的吊盆 ----------------
def _mark_old():
    """v4e：書架之前已經有的頂點都標 1（整數層 _old）。不能用「頂點數」分新舊：bmesh 刪掉頂點（倒角方塊）以後，新頂點會補進空出來的位置，
    排在舊頂點前面——v4e 第一版這樣做，吊燈的電線被轉到牆外（從天花板拉出一大片黑色三角形）、書架有幾塊沒轉到"""
    for m in _meshes.values():
        lay = m.bm.verts.layers.int.get('_old') or m.bm.verts.layers.int.new('_old')
        for v in m.bm.verts: v[lay] = 1
    return dict(_leaves=len(LEAVES), _stems=len(STEMS))


_bs_mark = _mark_old()   # v4e：書架那一段新加的頂點（照原本「沿著 x、書背朝南」建好以後整組轉 ry、放到配置的位置）
bs = IT['bookshelf'][0]; bx0, bx1, bz0, bz1, bh = bs['x'] - bs['w'] / 2, bs['x'] + bs['w'] / 2, bs['z'] - bs['d'] / 2, bs['z'] + bs['d'] / 2, bs['h']   # 沿著 x、書背朝南（+z，朝店門）
WD.rbox(bx0 + 0.02, bx1 - 0.02, 0.0, 0.06, bz0, bz1, r=0.004, seg=1); WD.rbox(bx0, bx1, 0.06, bh, bz0, bz0 + 0.02, r=0.004, seg=1)   # 底座、背板
XM_ = (bx0 + bx1) / 2
for xx_ in (bx0, XM_ - 0.012, bx1 - 0.024): WD.rbox(xx_, xx_ + 0.024, 0.0, bh, bz0, bz1, r=0.004, seg=1)
for yy_ in (0.06, 0.38, 0.71, bh - 0.025): WD.rbox(bx0, bx1, yy_, yy_ + 0.025, bz0, bz1, r=0.004, seg=1)
PAL = ['#8c3b47', '#2f5d50', '#c9a24f', '#e8dcc4', '#4a6c8c', '#7b5a3a', '#3a3a3a', '#a85a3a', '#5a4a7a', '#d8d0bc', '#efe9da', '#1f2a44']
rb = random.Random(11)
for (y0_, y1_) in ((0.085, 0.38), (0.405, 0.71), (0.735, bh - 0.03)):
    for (xa_, xb_) in ((bx0 + 0.024, XM_ - 0.012), (XM_ + 0.012, bx1 - 0.024)):
        x_ = xa_ + 0.01
        while x_ < xb_ - 0.04:
            t_ = rb.uniform(0.025, 0.06); h_ = rb.uniform(0.2, min(0.3, y1_ - y0_ - 0.02)); dd = rb.uniform(0.18, 0.24)   # 樂譜本、教本
            if rb.random() < 0.06: x_ += 0.05; continue
            CV.cbox(x_, x_ + t_, y0_, y0_ + h_, bz1 - 0.02 - dd, bz1 - 0.02, rb.choice(PAL)); x_ += t_ + 0.002
        CV.crbox(xb_ - 0.035, xb_ - 0.002, y0_, y0_ + 0.06, bz1 - 0.26, bz1 - 0.04, rb.choice(PAL), r=0.002, seg=1)
for (px__, sd) in ((bx0 + 0.25, 13), (bx1 - 0.22, 17)):
    pot(CV, px__, bh, bs['z'], 0.09, 0.14, '#ece8de'); pothos_mound(px__, bh + 0.14, bs['z'], 0.08, 16, sd)
    for k in range(3): vine((px__ + (k - 1) * 0.05, bh + 0.13, bs['z'] + 0.06), ((k - 1) * 0.4, 0, 1), 0.45 + 0.18 * k, sd * 10 + k)
vpaint(CV, '#2a2a2c', lambda: CV.add_bm(L.lathe([(0.0, 0.0), (0.06, 0.0), (0.03, 0.2), (0.0, 0.2)], seg=4), Matrix.Translation(g2b(XM_, bh, bs['z']))))   # 節拍器
def _rot_new(mark, cx, cz, ry):
    """v4e（LAWWW2-C 11-05，TONGXIAN-REF-1105）：mark 以後新加的頂點繞 (cx, cz) 轉 ry（遊戲的 yaw：0＝朝 +z，π/2＝朝 +x）。
    書架的程式照「沿著 x、書背朝南」寫：先照原樣建好，再整組轉向——頂點色、葉子卡片的 UV 都跟著頂點，不用重寫那一段；轉的是正的旋轉，面的方向不會反"""
    c, s_ = math.cos(ry), math.sin(ry)
    for k, m in _meshes.items():
        bm = m.bm; lay = bm.verts.layers.int.get('_old')   # 沒有這一層＝書架那一段才建的網格，全部是新的
        if ry:
            for v in bm.verts:
                if lay is not None and v[lay]: continue
                gx, gz = v.co.x - cx, -v.co.y - cz   # Blender (x, y, z)＝遊戲 (x, −z, y)
                v.co.x = cx + gx * c + gz * s_; v.co.y = -(cz - gx * s_ + gz * c)
            bm.normal_update()
        if lay is not None: bm.verts.layers.int.remove(lay)
    if not ry: return
    def rp(p):   # 遊戲座標的點（葉子、藤：LEAVES、STEMS 最後才做成網格）
        gx, gz = p.x - cx, p.z - cz; return Vector((cx + gx * c + gz * s_, p.y, cz - gx * s_ + gz * c))
    def rd(d): return Vector((d.x * c + d.z * s_, d.y, -d.x * s_ + d.z * c))
    for i in range(mark['_leaves'], len(LEAVES)):
        b0, d0, n0_, Lf, var = LEAVES[i]; LEAVES[i] = (rp(b0), rd(d0), rd(n0_), Lf, var)
    for i in range(mark['_stems'], len(STEMS)): STEMS[i] = [rp(q) for q in STEMS[i]]
_rot_new(_bs_mark, bs['x'], bs['z'], bs.get('ry', 0.0))
hp = IT['hanging_plant'][0]; hx2, hy2, hz2 = hp['x'], hp['y'], hp['z']; HV = hp.get('vine', 1.0)   # v4e：藤的長度倍數（吊在走道上方：0.5＝最低的葉子離地 1.8 m 左右）
for k in range(3):
    a = 2 * math.pi * k / 3; vpaint(CV, '#c9b08a', lambda: CV.cyl((hx2, H, hz2), (hx2 + 0.12 * math.cos(a), hy2 + 0.13, hz2 + 0.12 * math.sin(a)), 0.003, seg=4))
pot(CV, hx2, hy2, hz2, 0.13, 0.14, '#e2ddd2'); pothos_mound(hx2, hy2 + 0.14, hz2, 0.11, 22, 23, size=(0.08, 0.11))
for k in range(13):   # 參考圖：左上一大叢，藤幾乎直直垂下來（一點點往外）
    a_ = 1.6 + k * 0.26; vine((hx2 + 0.1 * math.cos(a_), hy2 + 0.12, hz2 + 0.1 * math.sin(a_)), (math.cos(a_), 0, math.sin(a_)), (0.9 + 0.22 * (k % 4)) * HV, 120 + k, step=0.07, droop=1.6, size=0.11)   # 參考圖：左上一大叢（大葉子、先往外長再垂下）

# ---------------- 店門：門框＋開著的門片（壓花玻璃）＋「同弦樂器」木牌 ----------------
fw = G('wood', 'left')
for (z0, z1, y0, y1) in ((dz0 - 0.06, dz0, 0.0, dh + 0.06), (dz1, dz1 + 0.06, 0.0, dh + 0.06), (dz0 - 0.06, dz1 + 0.06, dh, dh + 0.06)):
    fw.rbox(SX - 0.03, SX + 0.02, y0, y1, z0, z1, r=0.006)
lw = G('wood'); lz0, lz1 = dz0 + 0.002, dz0 + 0.042; lx0, lx1 = SX + 0.01, SX + (dz1 - dz0) - 0.01   # 門片：沿著 z 0.02～0.06、x −1.13～−0.25
for (x0, x1, y0, y1) in ((lx0, lx0 + 0.1, 0.0, dh - 0.02), (lx1 - 0.11, lx1, 0.0, dh - 0.02), (lx0, lx1, 0.0, 0.24), (lx0, lx1, 0.93, 1.05), (lx0, lx1, dh - 0.13, dh - 0.02)):
    lw.rbox(x0, x1, y0, y1, lz0, lz1, r=0.006, seg=1)
for (y0, y1) in ((0.24, 0.93), (1.05, dh - 0.13)):   # 壓花玻璃
    zm_ = (lz0 + lz1) / 2; uvquad(PR, [(lx0 + 0.1, y0, zm_), (lx1 - 0.11, y0, zm_), (lx1 - 0.11, y1, zm_), (lx0 + 0.1, y1, zm_)], pc('frosted'))
for z in (lz0 - 0.03, lz1 + 0.03):   # 圓門把（兩面）
    vpaint(CMt, '#b9a27a', lambda: CMt.cyl((lx1 - 0.07, 0.95, z), (lx1 - 0.07, 0.95, (lz0 if z < lz0 else lz1)), 0.008, seg=8))
    vpaint(CMt, '#c9b28a', lambda: CMt.sphere((lx1 - 0.07, 0.95, z), 0.027, seg=10, rings=6))
for y in (0.3, dh - 0.3): vpaint(CMt, '#8a7a60', lambda: CMt.cyl((SX + 0.005, y - 0.05, dz0 - 0.005), (SX + 0.005, y + 0.05, dz0 - 0.005), 0.009, seg=6))
sgx0, sgx1, sgy0, sgy1, sgz = -0.62, -0.31, 1.27, 1.72, lz1 + 0.014   # 木牌（朝南，參考圖左上）
lw.rbox(sgx0, sgx1, sgy0, sgy1, lz1 + 0.004, sgz, r=0.004, seg=2)
uvquad(PR, [(sgx0 + 0.012, sgy0 + 0.012, sgz + 0.0008), (sgx1 - 0.012, sgy0 + 0.012, sgz + 0.0008), (sgx1 - 0.012, sgy1 - 0.012, sgz + 0.0008), (sgx0 + 0.012, sgy1 - 0.012, sgz + 0.0008)], pc('sign'))
for xx_ in (sgx0 + 0.05, sgx1 - 0.05): vpaint(CV, '#b89a6a', lambda: CV.cyl((xx_, sgy1 - 0.02, sgz - 0.004), ((sgx0 + sgx1) / 2, sgy1 + 0.2, lz1 + 0.006), 0.004, seg=4))
vpaint(CMt, '#8a7a60', lambda: CMt.cyl(((sgx0 + sgx1) / 2, sgy1 + 0.2, lz1), ((sgx0 + sgx1) / 2, sgy1 + 0.2, lz1 + 0.02), 0.004, seg=5))

# ---------------- 西半邊：烏克麗麗＋古典吉他的牆、音箱、琴架上的吉他、第二扇窗 ----------------
uw = IT['uke_wall'][0]; UZ0, UZ1 = uw['z0'], uw['z1']
slatwall('left', UZ0, UZ1, 1.45, 2.75)
UKE = [GProto(f'u{i}', dict(kind='ac', top=t, side=sd, shape='om', pg=None if i % 2 else 'pg_tort'), 'left', scale=0.6) for i, (t, sd) in enumerate((('koa_dark', 'side_rose'), ('mahog_top', 'side_mahog'), ('spruce', 'side_maple'), ('sunburst_ac', 'side_mahog')))]
CLS = [GProto(f'c{i}', dict(kind='ac', top=t, side='side_rose', shape='om'), 'left', scale=0.97) for i, t in enumerate(('spruce_aged', 'mahog_top'))]
for p_ in UKE + CLS:
    if p_.spec.get('pg') is None: p_.spec.pop('pg', None)
HOOK['U'] = PProto('hookU', 'left', hook_fn(-0.13)); HOOK['C'] = PProto('hookC', 'left', hook_fn(-0.19))
XL = X0 + 0.032


def wall_row_left(protos, yh, z0, z1, pitch, ang, arm, scl, hk='U'):
    n = int((z1 - z0) / pitch) + 1
    for i in range(n):
        zc = z0 + i * pitch; pr = protos[i % len(protos)]; a = ang + random.uniform(-0.05, 0.05); wdir = Vector((math.cos(a), 0, -math.sin(a)))
        if pr.ob is None: pr.build()
        wy, vy = (pr.wt - 0.02) * scl, (pr.vn - 0.03) * scl
        Pk = Vector((XL + arm, yh, zc)); o = Pk - wdir * wy - Vector((0, vy, 0))
        pr.place(Frame(tuple(o), tuple(wdir), (0, 1, 0)).M); HOOK[hk].place(T4(XL + arm, yh, zc))
    return n


NU = wall_row_left(UKE, 2.35, UZ0 + 0.2, UZ0 + 1.9, 0.3, math.radians(25), 0.13, 0.6)
NC = wall_row_left(CLS, 2.35, UZ0 + 2.4, UZ1 - 0.2, 0.42, math.radians(25), 0.19, 0.97, hk='C')
ak = IT['amp_shelf'][0]


def amp_box(x0, x1, y0, y1, z0, z1, cell='grille_dark', body='#211f1e'):
    CV.crbox(x0, x1, y0, y1, z0, z1, body, r=0.015, seg=1); fx = x1 + 0.002
    uvquad(PR, [(fx, y0 + 0.04, z1 - 0.03), (fx, y0 + 0.04, z0 + 0.03), (fx, y1 - 0.09, z0 + 0.03), (fx, y1 - 0.09, z1 - 0.03)], pc(cell))
    CMt.cbox(fx - 0.003, fx + 0.003, y1 - 0.08, y1 - 0.02, z0 + 0.03, z1 - 0.03, '#b9bcbe')
    for k in range(5): vpaint(CV, '#151515', lambda: CV.cyl((fx, y1 - 0.05, z0 + 0.07 + k * (z1 - z0 - 0.14) / 4), (fx + 0.018, y1 - 0.05, z0 + 0.07 + k * (z1 - z0 - 0.14) / 4), 0.01, seg=6))


axb = X0 + 0.05
amp_box(axb, axb + 0.3, 0.0, 0.62, ak['z'] - 1.05, ak['z'] - 0.4); amp_box(axb, axb + 0.28, 0.0, 0.48, ak['z'] - 0.3, ak['z'] + 0.22, 'grille', '#2a2826')
amp_box(axb, axb + 0.26, 0.0, 0.4, ak['z'] + 0.35, ak['z'] + 0.75, 'grille_dark', '#6a2a22'); amp_box(axb + 0.02, axb + 0.24, 0.4, 0.66, ak['z'] + 0.4, ak['z'] + 0.7, 'grille', '#d8c8a8')


def stand_guitar(gx, gz, gyaw, pr, y0=0.0, tilt_deg=16):
    fw_ = Vector((math.sin(gyaw), 0, math.cos(gyaw))); tb_ = math.radians(tilt_deg)
    vdir = Vector((0, math.cos(tb_), 0)) - fw_ * math.sin(tb_)
    gfr = Frame((gx - fw_.x * 0.02, y0 + 0.09, gz - fw_.z * 0.02), tuple(fw_ * math.cos(tb_) + Vector((0, math.sin(tb_), 0))), tuple(vdir)); pr.place(gfr.M)
    for (u, w_, v) in ((-0.15, 0.06, 0.0), (0.15, 0.06, 0.0)):
        a = gfr.g(u, w_ + 0.03, -0.02); vpaint(CMt, '#1a1a1c', lambda: CMt.cyl(a, (a[0] - fw_.x * 0.25, y0, a[2] - fw_.z * 0.25), 0.007, seg=6))
        vpaint(CMt, '#1a1a1c', lambda: CMt.cyl(a, (a[0] + fw_.x * 0.12, y0, a[2] + fw_.z * 0.12), 0.007, seg=6))
        vpaint(CV, '#2e2e30', lambda: CV.cyl(gfr.g(u, w_ - 0.06, 0.0), gfr.g(u, w_ + 0.06, 0.0), 0.012, seg=6))
    nk = gfr.g(0, -0.005, 0.62); vpaint(CMt, '#1a1a1c', lambda: CMt.cyl((nk[0] - fw_.x * 0.03, y0, nk[2] - fw_.z * 0.03), nk, 0.008, seg=6))


FREE = [GProto('s0', dict(A_SPECS[1], kind='ac')), GProto('s1', E_SPECS[5]), GProto('bench', E_SPECS[3])]   # 不在牆上的（不跟著牆淡出）
for k, gs in enumerate(IT['guitar_on_stand']): stand_guitar(gs['x'], gs['z'], [0.6, -0.3][k], FREE[k])

# ---------------- 裡面：修琴的工作桌、洞洞板、檯燈、硬盒、長椅、軟木板、老闆的那把 ----------------
wb = IT['workbench'][0]; wx0, wx1, wz0, wz1, whh = wb['x'] - wb['w'] / 2, wb['x'] + wb['w'] / 2, wb['z'] - wb['d'] / 2, wb['z'] + wb['d'] / 2, wb['h']
WD.rbox(wx0, wx1, whh - 0.05, whh, wz0, wz1, r=0.008, seg=2)
for (lx_, lz_) in ((wx0 + 0.05, wz0 + 0.05), (wx1 - 0.05, wz0 + 0.05), (wx0 + 0.05, wz1 - 0.05), (wx1 - 0.05, wz1 - 0.05)): CV.cbox(lx_ - 0.03, lx_ + 0.03, 0.0, whh - 0.05, lz_ - 0.03, lz_ + 0.03, '#3a3632')
WD.rbox(wx0 + 0.05, wx1 - 0.05, 0.12, 0.14, wz0 + 0.05, wz1 - 0.05, r=0.004, seg=1)
CV.crbox(wx0 + 0.3, wx1 - 0.4, whh, whh + 0.012, wz0 + 0.08, wz1 - 0.08, '#2e5a3e', r=0.004, seg=1)   # 綠色切割墊
G('vc', 'front').cbox(wx0, wx1, 1.05, 1.95, Z1 - 0.02, Z1, '#c9b08a')   # 洞洞板
for i in range(18):
    for j in range(9): G('vc', 'front').poly([(wx0 + 0.065 + i * 0.105, 1.1 + j * 0.1, Z1 - 0.021), (wx0 + 0.05 + i * 0.105, 1.1 + j * 0.1, Z1 - 0.021), (wx0 + 0.05 + i * 0.105, 1.115 + j * 0.1, Z1 - 0.021), (wx0 + 0.065 + i * 0.105, 1.115 + j * 0.1, Z1 - 0.021)], '#6a5a44')
for k, (tx_, ty_, tl, col) in enumerate(((0.95, 1.7, 0.22, '#c83a2a'), (1.12, 1.7, 0.18, '#1a1a1a'), (1.3, 1.72, 0.2, '#e0b030'), (1.5, 1.68, 0.25, '#2a4a9a'), (1.75, 1.7, 0.16, '#1a1a1a'), (2.0, 1.66, 0.28, '#8a8c8e'), (2.25, 1.7, 0.2, '#c83a2a'))):   # 掛著的工具（起子、銼刀、鉗子）
    CMt.cbox(tx_ - 0.012, tx_ + 0.012, ty_ - tl, ty_ - tl * 0.45, Z1 - 0.06, Z1 - 0.035, '#9a9ea2')
    CV.crbox(tx_ - 0.016, tx_ + 0.016, ty_ - tl * 0.45, ty_, Z1 - 0.065, Z1 - 0.03, col, r=0.008, seg=1)
lmp = (wx1 - 0.25, wz1 - 0.15)   # 檯燈（彈簧臂）
CMt.crbox(lmp[0] - 0.07, lmp[0] + 0.07, whh, whh + 0.03, lmp[1] - 0.07, lmp[1] + 0.07, '#2a2a2c', r=0.01, seg=2)
vpaint(CMt, '#2a2a2c', lambda: CMt.cyl((lmp[0], whh + 0.03, lmp[1]), (lmp[0] - 0.1, whh + 0.4, lmp[1] - 0.05), 0.008, seg=6))
vpaint(CMt, '#2a2a2c', lambda: CMt.cyl((lmp[0] - 0.1, whh + 0.4, lmp[1] - 0.05), (lmp[0] - 0.4, whh + 0.45, lmp[1] - 0.15), 0.008, seg=6))
vpaint(CMt, '#2a2a2c', lambda: CMt.add_bm(L.lathe([(0.0, 0.1), (0.02, 0.1), (0.07, 0.02), (0.075, 0.0), (0.065, 0.0), (0.0, 0.07)], seg=14), Matrix.Translation(g2b(lmp[0] - 0.42, whh + 0.36, lmp[1] - 0.16))))
EM.add_bm(L.lathe([(0.0, 0.0), (0.03, 0.01), (0.0, 0.03)], seg=8), Matrix.Translation(g2b(lmp[0] - 0.42, whh + 0.37, lmp[1] - 0.16)))
lay = Frame((wb['x'] - 0.15, whh + 0.012, wz0 + 0.3), (0, 1, 0), (-1, 0, 0.12)); FREE[2].place(lay.M)   # 桌上拆了弦的電吉他（平放）
for k in range(5): vpaint(CMt, ['#c9ccce', '#e0b030', '#1a1a1a', '#c83a2a', '#c9ccce'][k], lambda: CMt.cyl((wb['x'] + 0.4 + k * 0.05, whh + 0.012, wz0 + 0.15), (wb['x'] + 0.42 + k * 0.05, whh + 0.012, wz0 + 0.35), 0.006, seg=5))
csh = IT['case_shelf'][0]; csx0, csx1, csz0, csz1 = csh['x'] - csh['w'] / 2, csh['x'] + csh['w'] / 2, csh['z'] - csh['d'] / 2, csh['z'] + csh['d'] / 2
for k in range(4):   # 立著的硬盒（黑、咖啡）
    z_ = csz0 + 0.12 + k * 0.17; CV.crbox(csx0 + 0.05, csx1, 0.0, 1.08 - (k % 2) * 0.06, z_, z_ + 0.13, ['#1c1c1e', '#3a2a20', '#1c1c1e', '#2a2a2a'][k], r=0.03, seg=2)
    CMt.cbox(csx0 + 0.04, csx0 + 0.05, 0.5, 0.56, z_ + 0.04, z_ + 0.09, '#b9a27a')
rbx = random.Random(77)
for k in range(6):   # 紙箱（疊起來）：Poly Haven cardboard_box_01，每一箱大小、方向、位置都有一點不同（原本是六個一樣大的方塊，D159）
    z_ = csz0 + 0.85 + (k % 3) * 0.45; y_ = (k // 3) * 0.42; sc_ = rbx.uniform(0.82, 1.0) if k < 3 else rbx.uniform(0.7, 0.92)
    if k == 5: continue   # 上面那一排少一箱（拿去用了）
    K.ph_put('cardboard_box_01', (csx0 + csx1) / 2 + rbx.uniform(-0.03, 0.02), y_ - (1 - sc_) * 0.42 * (k // 3), z_ + 0.21, rbx.uniform(-0.12, 0.12) + (math.pi / 2 if k % 2 else 0), sc_,
             fit=(0.42, csx1 - csx0, 0.4), decimate=0.03)
bn = IT['bench'][0]; bnx0, bnx1, bnz0, bnz1 = bn['x'] - bn['w'] / 2, bn['x'] + bn['w'] / 2, bn['z'] - bn['d'] / 2, bn['z'] + bn['d'] / 2
WD.rbox(bnx0, bnx1, 0.42, 0.46, bnz0, bnz1, r=0.008, seg=2)
_uk = K.ph_put('Ukulele_01', bn['x'] + 0.02, 0.46, bn['z'] + 0.25, 0.0, height=0.527, decimate=0.15)   # 長木椅上平放一把烏克麗麗（等人的時候彈的）
_uk.matrix_world = Matrix.Translation(g2b(bn['x'] + 0.02, 0.46 + 0.0255, bn['z'] + 0.25)) @ Matrix.Rotation(0.15, 4, 'Z') @ Matrix.Translation((0, -0.26, 0)) @ Matrix.Rotation(-math.pi / 2, 4, 'X')   # 躺平（面板朝上）、沿著長椅
for (lx_, lz_) in ((bnx0 + 0.05, bnz0 + 0.06), (bnx1 - 0.05, bnz0 + 0.06), (bnx0 + 0.05, bnz1 - 0.06), (bnx1 - 0.05, bnz1 - 0.06)): WD.rbox(lx_ - 0.022, lx_ + 0.022, 0.0, 0.42, lz_ - 0.022, lz_ + 0.022, r=0.004, seg=1)
cb = IT['cork_board'][0]; cy0, cy1, cz0b, cz1b = cb['y'] - cb['h'] / 2, cb['y'] + cb['h'] / 2, cb['z'] - cb['w'] / 2, cb['z'] + cb['w'] / 2
G('wood', 'left').rbox(SX, SX + 0.03, cy0 - 0.03, cy1 + 0.03, cz0b - 0.03, cz1b + 0.03, r=0.006, seg=2)
uvquad(G('props', 'left'), [(SX + 0.031, cy0, cz1b), (SX + 0.031, cy0, cz0b), (SX + 0.031, cy1, cz0b), (SX + 0.031, cy1, cz1b)], pc('cork'))
for k, (nm, zc_, yc_, w_, h_) in enumerate((('note_lesson', cz0b + 0.18, cy1 - 0.17, 0.2, 0.2), ('note_used', cz0b + 0.45, cy1 - 0.2, 0.2, 0.2), ('note_wash', cz0b + 0.72, cy1 - 0.16, 0.2, 0.2), ('bizcard', cz0b + 0.95, cy1 - 0.14, 0.13, 0.085),
                                              ('flyer', cz0b + 0.3, cy0 + 0.17, 0.2, 0.26), ('photo1', cz0b + 0.6, cy0 + 0.16, 0.18, 0.13), ('score', cz0b + 0.88, cy0 + 0.2, 0.16, 0.22))):
    xx_ = SX + 0.033 + k * 0.0004
    uvquad(G('props', 'left'), [(xx_, yc_ - h_ / 2, zc_ + w_ / 2), (xx_, yc_ - h_ / 2, zc_ - w_ / 2), (xx_, yc_ + h_ / 2, zc_ - w_ / 2), (xx_, yc_ + h_ / 2, zc_ + w_ / 2)], pc(nm))
    vpaint(G('vc', 'left'), ['#c83a2a', '#2a5aa8', '#e0b030'][k % 3], lambda: G('vc', 'left').sphere((xx_ + 0.005, yc_ + h_ / 2 - 0.02, zc_), 0.007, seg=6, rings=4))
ogx, ogy = 0.05, 1.62   # 「不賣，老闆的」：後牆的展示板＋自己的一盞投射燈
G('wood', 'front').rbox(ogx - 0.34, ogx + 0.34, ogy - 0.82, ogy + 0.6, Z1 - 0.03, Z1, r=0.01, seg=2)
G('wood', 'front').rbox(ogx - 0.3, ogx + 0.3, ogy - 0.9, ogy - 0.84, Z1 - 0.16, Z1, r=0.008, seg=2)
OWN = GProto('owner', dict(kind='E', fin='owner_burst', pg='pg_tort', fb='fb_rose', neck='neck_mahog', hw='gold', head='head_black'), 'front')
ofr = Frame((ogx, ogy - 0.72, Z1 - 0.03 - 0.05), (0, 0, -1), (0, 1, 0)); OWN.place(ofr.M)
tq = [(ogx + 0.26, ogy - 0.838, Z1 - 0.15), (ogx + 0.04, ogy - 0.838, Z1 - 0.15), (ogx + 0.04, ogy - 0.77, Z1 - 0.12), (ogx + 0.26, ogy - 0.77, Z1 - 0.12)]
uvquad(G('props', 'front'), tq, pc('note_owner'))

# ---------------- 天花板的軌道投射燈 ----------------
SPOTS = []
for tr in IT['track']:
    x_, z0_, z1_ = tr['x'], tr['z0'], tr['z1']
    CMt.crbox(x_ - 0.018, x_ + 0.018, H - 0.03, H, z0_, z1_, '#1c1c1e', r=0.004, seg=1)
    n = max(2, int((z1_ - z0_) / 1.0) + 1)
    for k in range(n):
        z_ = z0_ + 0.2 + (z1_ - z0_ - 0.4) * k / (n - 1)
        tgt = Vector(g2b(X1 - 0.1, 2.1 - 0.5 * (k % 2), z_ - 0.5)) if x_ > 0 else Vector(g2b(X0 + 0.1, 1.9, z_ - 0.4))
        top = Vector(g2b(x_, H - 0.03, z_)); jt = top + Vector((0, 0, -0.09)); dv = (tgt - jt).normalized()
        vpaint(CMt, '#1c1c1e', lambda: CMt.add_bm(L.lathe([(0.008, 0.0), (0.008, 0.09)], seg=6), Matrix.Translation(jt)))
        rot = Vector((0, 0, -1)).rotation_difference(dv).to_matrix().to_4x4()
        vpaint(CMt, '#1c1c1e', lambda: CMt.add_bm(L.lathe([(0.0, 0.04), (0.03, 0.04), (0.042, 0.0), (0.045, -0.13), (0.038, -0.135), (0.0, -0.12)], seg=7), Matrix.Translation(jt) @ rot))
        EM.add_bm(L.lathe([(0.036, -0.125), (0.0, -0.126)], seg=7), Matrix.Translation(jt) @ rot)
        SPOTS.append([list(jt + dv * 0.14), list(tgt)])
ot = Vector(g2b(ogx, H - 0.12, Z1 - 1.0)); SPOTS.append([list(ot), list(g2b(ogx, ogy - 0.2, Z1))])   # 老闆那把的燈
vpaint(CMt, '#1c1c1e', lambda: CMt.add_bm(L.lathe([(0.0, 0.04), (0.03, 0.04), (0.042, 0.0), (0.045, -0.13), (0.0, -0.12)], seg=8), Matrix.Translation(ot) @ Vector((0, 0, -1)).rotation_difference((Vector(g2b(ogx, ogy - 0.2, Z1)) - ot).normalized()).to_matrix().to_4x4()))

# ---------------- 葉子、藤 ----------------
lf = G('leaf'); luv = lf.bm.loops.layers.uv.verify()
for (base, d, nrm, Lf, var) in LEAVES:
    side = d.cross(nrm)
    if side.length < 1e-4: side = d.cross(Vector((0, 0, 1)))
    side.normalize(); nn = side.cross(d).normalized(); Wf = Lf * 0.85
    mid_ = base + d * (Lf * 0.5) - nn * (Lf * 0.12)
    pts = [base - side * Wf * 0.12, base + side * Wf * 0.12, mid_ + side * Wf * 0.5, mid_ - side * Wf * 0.5, base + d * Lf - nn * (Lf * 0.2)]
    u0 = 0.0 if var == 0 else 0.5
    vs = [lf.bm.verts.new(g2b(p.x, p.y, p.z)) for p in pts]
    for f_vs, uvs in (([vs[0], vs[1], vs[2], vs[3]], [(u0 + 0.21, 0.08), (u0 + 0.29, 0.08), (u0 + 0.49, 0.5), (u0 + 0.01, 0.5)]), ([vs[3], vs[2], vs[4]], [(u0 + 0.01, 0.5), (u0 + 0.49, 0.5), (u0 + 0.25, 0.98)])):
        f = lf.bm.faces.new(f_vs)
        for lp, t in zip(f.loops, uvs): lp[luv].uv = t
for pts in STEMS:
    pts = pts[::2] + ([pts[-1]] if len(pts) % 2 == 0 else [])   # 莖每兩節一段（三角形預算）
    for a, b in zip(pts, pts[1:]):
        before = set(lf.bm.faces); lf.cyl((a.x, a.y, a.z), (b.x, b.y, b.z), 0.0028, seg=3, caps=False)
        for f in lf.bm.faces:
            if f not in before:
                for lp in f.loops: lp[luv].uv = (0.25, 0.42)

# ---------------- 收尾：網格、合併、單面、匯出、instancing 節點改名 ----------------
for (side, key), m in _meshes.items():
    uv = key not in UVKEYS and key not in ('vc', 'glass', 'emit', 'leaf')   # metal：CC0 材質組貼圖要 UV
    m.finish(root, uv=uv, smooth=key in ('metal', 'vc'), props={'dir': DIRS[side]} if side else None)
for ob in list(root.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
for ob in root.children:
    if ob.type == 'MESH' and ob.name.startswith('WALL_') and 'dir' not in ob: ob['dir'] = DIRS[ob.name.split('_')[1]]
ss = L.single_side(root, keep=r'glass|leaf', nodup=r'plaster|wood|slat|floor|guitars')
print('SINGLE_SIDE', json.dumps(ss, ensure_ascii=False))
K.report()
info = L.export(OUT, gpu_instances=True)


def fix_instanced_names(path):
    """Blender 匯出的 EXT_mesh_gpu_instancing 節點叫 tongxian_interior.N、沒有自訂屬性 → 遊戲的 /WALL_/ 認不到吉他牆。
    改成網格的名字（WALL_right_gtr_e0_inst…），牆上的補 extras.dir（和牆一樣往室內的法線），吉他才會跟著牆淡出（好拍 v2 的做法）。"""
    import struct
    b = open(path, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); rest = b[20 + n:]; k = 0
    for nd in j['nodes']:
        if 'EXT_mesh_gpu_instancing' not in nd.get('extensions', {}): continue
        mn = j['meshes'][nd['mesh']]['name']; nd['name'] = mn + '_inst'; k += 1
        m_ = re.match(r'WALL_(front|back|left|right)_', mn)
        if m_: nd.setdefault('extras', {})['dir'] = DIRS[m_.group(1)]
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
    out = out[:8] + struct.pack('<I', len(out)) + out[12:]; open(path, 'wb').write(out); print('instanced nodes renamed', k)


fix_instanced_names(OUT); info['bytes'] = os.path.getsize(OUT); info['out'] = os.path.relpath(OUT, REPO)
drawn = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in root.children_recursive if ob.type == 'MESH')
info.update({'shop': 'tongxian', 'layout': LAYALL['version'], 'drawn_tris': drawn, 'guitars': {'electric_wall': NE, 'acoustic_wall': NA, 'ukulele': NU, 'classical': NC, 'on_stand': 2, 'owner': 1, 'bench': 1},
             'protos': {p.name: p.n for p in EP + AP + UKE + CLS + FREE + [OWN]},
             'materials': sorted({m.name for ob in root.children_recursive if ob.type == 'MESH' for m in ob.data.materials if m}), 'spots': SPOTS})
L.write_json(OUT[:-4] + '.json', info)
print('DRAWN', drawn, 'E', NE, 'A', NA, 'U', NU, 'C', NC)
