"""萬才館 外觀 正式模型：Blender 5.2 bpy 無介面 → GLB（WebP 貼圖、同材質合併）。萬才館第二階段（D38：重要校園建築用 Blender；D31：使用者 2026-10-10 的萬才館照片＋法律學院配置圖）。
照使用者提供的照片：
  正面（遊戲朝南的法學院廣場；真實的萬才館這一面朝辛亥路，D31）由西到東：弧形兩層樓量體（混凝土、一大片兩層的格子窗、西側一道直條窄窗＋紅褐色飾條）、
  往下張開的弧形大樓梯（兩側弧形石牆＋圓牆頂＋三道不鏽鋼扶手、最下面幾階繞過牆端往外張開）＋樓梯頂端的平台、平台往東接弧形陽台（厚混凝土邊＋欄杆）、
  平台和陽台後面整面二樓玻璃（上面石材帶掛館名）、陽台下面的一樓入口（玻璃門＋嵌燈）、最東邊往前凸出的三層樓灰色量體（成對的窄窗）。
  立面：一、二樓灰色花崗石（每開間兩扇窄窗）、三樓一整排橫向長窗、四～八樓偏橘的淺紅磚（每開間兩扇窄窗、每扇窗都有凸出的混凝土窗框）、九樓石材帶、屋頂鏤空的混凝土大框架。
量體、樓梯每一階的外緣、石牆、平台、陽台的位置和 src/campuskit3d.js 的 CK.lawhall({entry:'stairs',w:30,d:20,floors:9,entryX:-1,brick:'#b06a4a',winBox:true,roofFrame:true}) 一樣——
導航（樓梯一階一階的高度、第 1 層的平台與陽台：zones3d.js 的 wancaiStairs）、鏡頭碰撞都由套件給，這個模型只換外觀。樓梯外緣在 --check 時和遊戲的 ck.wancai.outl 比對（tools/blender/wancai_ck_dump.js 匯出）。
館名（金色字）由遊戲畫（Canvas 字，不把字型做進模型）。照片沒拍到的背面、側面、屋頂、樓層數是照同一套語彙推測（D28），不是精確複製。
貼圖：Poly Haven CC0（tools/blender/fetch_polyhaven.py）。座標：遊戲 (x 東, y 上, z 南；正面朝 +z) ＝ Blender (x, -z, y)。
材質名稱約定（遊戲 zones3d.js 的 attachExterior 依名稱處理）：ext_glass_lit＝晚上會亮的窗；ext_glass_lobby＝入口玻璃（晚上亮）；ext_downlight＝陽台下的嵌燈。
用法：/opt/blenv/bin/python tools/blender/wancai_exterior.py [--out assets/models/env/wancai_exterior.glb] [--tex 512] [--render 輸出資料夾] [--check 遊戲的 ck.wancai JSON]
"""
import json, math, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None): return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/wancai_exterior.glb'))
TEXRES = int(arg('--tex', '512')); RENDER = arg('--render'); CHECK = arg('--check')
import b3lib as B   # 先載入 bpy（bmesh、mathutils 要在 bpy 之後）
import bmesh
from mathutils import Vector
B.reset(TEXRES)

# ---------------- 量體（和 CK.lawhall 一樣）----------------
w, d, nf, gfh, fh = 30.0, 20.0, 9, 4.4, 3.5
H = gfh + (nf - 1) * fh                     # 32.4
CW, lowF = 2.4, 3
PF = 3.63                                   # 樓梯頂端平台＝陽台高度（22 階 × 16.5 cm）
EX, EW, LD = -1.0, 3.6, 4.0                 # 樓梯中心線、樓梯頂端寬（兩道石牆之間）、平台深
CT = 0.52; LX0, LX1 = EX - EW / 2 - CT, EX + EW / 2 + CT
BX1, DR = 10.5, 6.5; DCX, DH, PD = LX0 - 1.2 - DR, 8.2, 2.2
SX, z0 = EX, d / 2 + LD
NS = 22; RS = PF / NS; TR = 0.34; L = NS * TR; FL = 3.6
def hwAt(s): return EW / 2 + FL / 2 * s ** 2.4
SC, CH, CR = 0.72, 0.92, CT / 2
def cheekTop(s): return max(0.62, PF * (1 - s) + CH)
EXT = [0.8, 0.7, 0.6, 0.6]
BX0 = LX1; BA = BX1 - BX0; BB = LD; BT = 0.62
def bzf(x): return d / 2 + BB * math.sqrt(max(0.0, 1 - ((x - BX0) / BA) ** 2))
yF = lambda i: 0.0 if i == 0 else gfh + (i - 1) * fh
hF = lambda i: gfh if i == 0 else fh

def lit(x, y, z):   # 晚上哪些窗亮著（和 campuskit3d.js 的 winLit 同一個雜湊）
    h = math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
    return h - math.floor(h) > 0.3

def step_outline(sk, ext, sa0):
    """campuskit3d.js stepOutline 的移植：一階的右半邊外緣 [x, z]（z 從平台前緣往前量）"""
    R = []; sa = min(sk, sa0) if ext > 0 else sk; N = 14
    for i in range(N + 1): s = sa * i / N; R.append((hwAt(s) + 0.24, s * L))
    if ext > 0:
        zf = sk * L; r = min(0.8, (zf - sa * L) * 0.6); xo = hwAt(sk) + ext; x0 = R[-1][0]; za = sa * L; zb = zf - r
        for i in range(1, 9): t = i / 8; e = t * t * (3 - 2 * t); R.append((x0 + (xo - x0) * e, za + (zb - za) * t))
        for i in range(1, 7): a = i / 6 * math.pi / 2; R.append((xo - r + r * math.cos(a), zb + r * math.sin(a)))
    return R
OUTL = [step_outline((NS - k) / NS, EXT[k] if k < len(EXT) else 0, SC - 0.08) for k in range(NS)]
if CHECK:   # 和遊戲的外緣比對（導航的高度就是用這一組）
    ck = json.load(open(CHECK)); worst = 0.0
    for k in range(NS):
        assert len(ck['outl'][k]) == len(OUTL[k]), ('外緣點數不同', k)
        for a, b in zip(ck['outl'][k], OUTL[k]): worst = max(worst, abs(a[0] - b[0]), abs(a[1] - b[1]))
    for key, v in (('PF', PF), ('z0', z0), ('L', L), ('SX', SX), ('LX0', LX0), ('LX1', LX1), ('BX1', BX1)): assert abs(ck[key] - v) < 1e-9, (key, ck[key], v)
    print(f'樓梯外緣和遊戲一致（最大差 {worst:.2e} m）'); assert worst < 1e-6

MAT = {
    'granite': B.pbr('ext_granite', 'granite_tile_03', tile=2.4, sat=0.12, target='#aeaca6', cull=True),        # 照片：淺灰花崗石（建築本體、一二樓）
    'graniteD': B.pbr('ext_granite_dark', 'granite_tile_03', tile=2.4, sat=0.12, target='#93918c', cull=True),   # 窗台、樓板線、屋頂邊
    'graniteS': B.pbr('ext_granite_stair', 'granite_tile_03', tile=1.2, sat=0.10, target='#bdb7ae', cull=True),  # 照片：大台階的踏面、平台、陽台地板（台階約 (190,182,174)）
    'riser': B.pbr('ext_granite_riser', 'granite_tile_03', tile=1.2, sat=0.10, target='#9f998f', cull=True),     # 踢面（垂直面在照片裡比踏面暗，一階一階看得出來）
    'cheek': B.pbr('ext_granite_cheek', 'granite_tile_03', tile=1.6, sat=0.08, target='#d6d3cd', cull=True),     # 兩側弧形石牆（照片：受光面約 (225,223,220)，比台階亮）
    'concrete': B.pbr('ext_concrete', 'granular_concrete', tile=2.0, sat=0.2, target='#c9c6be', cull=True),     # 凸出的混凝土窗框、弧形量體、屋頂框架
    'brick': B.pbr('ext_brick', 'red_brick', tile=1.0, sat=0.8, target='#b06a4a', cull=True),                     # 照片：偏橘的淺紅磚
    'frame': B.pbr('ext_frame', None, tint=B.srgb('#34383c'), rough=0.45, metal=0.6, cull=True),
    'steel': B.pbr('ext_steel', None, tint=B.srgb('#c9ccd0'), rough=0.3, metal=1.0, cull=True),
    'glass_lit': B.pbr('ext_glass_lit', None, tint=B.srgb('#3c4650'), rough=0.12, metal=0.4, cull=True),
    'glass_dark': B.pbr('ext_glass_dark', None, tint=B.srgb('#353d45'), rough=0.12, metal=0.4, cull=True),
    'glass_lobby': B.pbr('ext_glass_lobby', None, tint=B.srgb('#6d7c84'), rough=0.08, metal=0.3, cull=True),
    'door': B.pbr('ext_door', None, tint=B.srgb('#20262b'), rough=0.25, metal=0.3, cull=True),
    'downlight': B.pbr('ext_downlight', None, tint=B.srgb('#fff3dc'), rough=0.9, emit=B.srgb('#fff3dc'), cull=True),
    'roofEq': B.pbr('ext_roof_eq', 'granular_concrete', tile=1.5, sat=0.1, target='#8f9399', cull=True),
    'trim': B.pbr('ext_trim_red', None, tint=B.srgb('#8c4a30'), rough=0.7, cull=True),                           # 弧形量體西側的紅褐色飾條
    'hedge': B.pbr('ext_hedge', None, tint=B.srgb('#46703d'), rough=0.95, cull=True),
}
root = B.group('WancaiExterior')
_n = [0]
def nm(p): _n[0] += 1; return f'{p}_{_n[0]}'

# ---------------- 自由形狀的網格（遊戲座標）----------------
def _dedupe(pts):
    out = []
    for p in pts:
        if not out or math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) > 1e-5: out.append(p)
    if len(out) > 2 and math.hypot(out[0][0] - out[-1][0], out[0][1] - out[-1][1]) < 1e-5: out.pop()
    return out

def prism(tag, mat, pts, y0, y1, top=True, bottom=False, parent=None, side_mat=None):
    """遊戲 XZ 平面的多邊形 pts（任意方向）往上擠出 y0..y1：側面＋頂面（底面看不到就不做）；法線朝外。
    side_mat：側面用另一個材質（台階：踏面亮、踢面暗，一階一階看得出來）"""
    pts = _dedupe(pts); n = len(pts)
    area = sum(pts[i][0] * -pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * -pts[i][1] for i in range(n))   # Blender XY＝(x, -z)
    if area < 0: pts = pts[::-1]
    def build(do_top, do_sides, m):
        bm = bmesh.new(); vb = [bm.verts.new(B.g2b(x, y0, z)) for (x, z) in pts]; vt = [bm.verts.new(B.g2b(x, y1, z)) for (x, z) in pts]
        if do_top and top: bm.faces.new(vt)
        if do_sides and bottom: bm.faces.new(vb[::-1])   # 底面跟著側面的材質（陽台底下是混凝土，不是踏面的石材）
        if do_sides:
            for i in range(n): j = (i + 1) % n; bm.faces.new((vb[i], vb[j], vt[j], vt[i]))
        bm.normal_update(); B.box_uv(bm, m['tile'] if 'tile' in m else 1.0)
        return B.mesh_obj(nm(tag), bm, m, parent or root)
    if side_mat is None: return build(True, True, mat)
    build(False, True, side_mat); return build(True, False, mat)

def solid(tag, mat, quads, parent=None):
    """封閉的網格：quads＝[(四個遊戲座標點)]，法線自動朝外"""
    bm = bmesh.new(); cache = {}
    def V(p):
        k = tuple(round(c, 6) for c in p)
        if k not in cache: cache[k] = bm.verts.new(B.g2b(*p))
        return cache[k]
    for q in quads:
        vs = [V(p) for p in q]
        if len({id(v) for v in vs}) < 3: continue
        try: bm.faces.new(vs)
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.normal_update(); B.box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return B.mesh_obj(nm(tag), bm, mat, parent or root)

def cheek_wall(tag, mat, pts, th, tops):
    """弧形石牆（campuskit3d.js cheekG）：中心線 pts、厚 th、各點牆頂高 tops、底在地面"""
    n = len(pts); off = []
    for i in range(n):
        a, b = pts[max(0, i - 1)], pts[min(n - 1, i + 1)]; dx, dz = b[0] - a[0], b[1] - a[1]; Ld = math.hypot(dx, dz) or 1
        off.append((-dz / Ld * th / 2, dx / Ld * th / 2))
    S = lambda i, s, y: (pts[i][0] + s * off[i][0], y, pts[i][1] + s * off[i][1])
    q = []
    for i in range(n - 1):
        q.append((S(i, 1, 0), S(i + 1, 1, 0), S(i + 1, 1, tops[i + 1]), S(i, 1, tops[i])))
        q.append((S(i + 1, -1, 0), S(i, -1, 0), S(i, -1, tops[i]), S(i + 1, -1, tops[i + 1])))
        q.append((S(i, 1, tops[i]), S(i + 1, 1, tops[i + 1]), S(i + 1, -1, tops[i + 1]), S(i, -1, tops[i])))
        q.append((S(i, -1, 0), S(i + 1, -1, 0), S(i + 1, 1, 0), S(i, 1, 0)))
    for i in (0, n - 1): q.append((S(i, 1, 0), S(i, -1, 0), S(i, -1, tops[i]), S(i, 1, tops[i])))
    return solid(tag, mat, q)

def tube(tag, mat, pts3, r, seg=8, caps=True, parent=None):
    """沿著折線（遊戲座標的 3D 點）的圓管"""
    bm = bmesh.new(); rings = []; P = [Vector(p) for p in pts3]
    for i, p in enumerate(P):
        t = (P[min(len(P) - 1, i + 1)] - P[max(0, i - 1)]).normalized()
        side = t.cross(Vector((0, 1, 0)))
        if side.length < 1e-6: side = Vector((1, 0, 0))
        side.normalize(); up = side.cross(t).normalized()
        rings.append([bm.verts.new(B.g2b(*(p + (side * math.cos(2 * math.pi * k / seg) + up * math.sin(2 * math.pi * k / seg)) * r))) for k in range(seg)])
    for i in range(len(rings) - 1):
        for k in range(seg): k2 = (k + 1) % seg; bm.faces.new((rings[i][k], rings[i][k2], rings[i + 1][k2], rings[i + 1][k]))
    if caps: bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.normal_update(); B.box_uv(bm, 1.0)
    return B.mesh_obj(nm(tag), bm, mat, parent or root)

def rbox(tag, mat, cx, cz, sx, sz, y0, y1, ry):
    """繞 y 軸轉 ry 的方塊（中心 cx,cz；寬 sx（沿著轉過的 x）、深 sz）"""
    c, s = math.cos(ry), math.sin(ry); pts = []
    for (u, v) in ((-sx / 2, -sz / 2), (sx / 2, -sz / 2), (sx / 2, sz / 2), (-sx / 2, sz / 2)): pts.append((cx + u * c + v * s, cz - u * s + v * c))
    return prism(tag, mat, pts, y0, y1)

def arc_pts(cx, cz, r, a0, a1, n):
    """圓弧上的點（角度和 three.js CylinderGeometry 一樣：0＝+z、π/2＝+x）"""
    return [(cx + r * math.sin(a0 + (a1 - a0) * i / n), cz + r * math.cos(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def arc_band(tag, mat, cx, cz, r, a0, a1, y0, y1, n=12):
    """圓柱面的一段（朝外）"""
    pts = arc_pts(cx, cz, r, a0, a1, n); q = []
    for i in range(n):
        (xa, za), (xb, zb) = pts[i], pts[i + 1]
        q.append(((xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)))
    bm = bmesh.new(); cache = {}
    def V(p):
        k = tuple(round(v, 6) for v in p)
        if k not in cache: cache[k] = bm.verts.new(B.g2b(*p))
        return cache[k]
    for qq in q: bm.faces.new([V(p) for p in qq])
    bm.normal_update()
    for f in bm.faces:   # 法線朝外（離圓心）
        c = f.calc_center_median(); o = B.g2b(cx, (y0 + y1) / 2, cz)
        if f.normal.dot(c - o) < 0: f.normal_flip()
    B.box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return B.mesh_obj(nm(tag), bm, mat, root)

# ---------------- 立面座標（和 linze_exterior.py 一樣）：t＝沿牆（從外面看往右）、y＝高、n＝離牆面（往外為正）----------------
FACES = {'S': w, 'N': w, 'E': d, 'W': d}
def fb(f, t0, t1, n0, n1):
    t0, t1 = min(t0, t1), max(t0, t1); n0, n1 = min(n0, n1), max(n0, n1)
    if f == 'S': return (t0, t1, d / 2 + n0, d / 2 + n1)
    if f == 'N': return (-t1, -t0, -d / 2 - n1, -d / 2 - n0)
    if f == 'E': return (w / 2 + n0, w / 2 + n1, -t1, -t0)
    return (-w / 2 - n1, -w / 2 - n0, t0, t1)
def fpt(f, t, y, n):
    if f == 'S': return (t, y, d / 2 + n)
    if f == 'N': return (-t, y, -d / 2 - n)
    if f == 'E': return (w / 2 + n, y, -t)
    return (-w / 2 - n, y, t)
def BOX(mat, f, t0, t1, y0, y1, n0, n1, tag='p'):
    if t1 - t0 < 0.005 or y1 - y0 < 0.005: return None
    ax0, ax1, az0, az1 = fb(f, t0, t1, n0, n1); return B.box(nm(tag), MAT[mat], ax0, ax1, y0, y1, az0, az1, root)
def PANE(mat, f, t0, t1, y0, y1, n, tag='g'):
    return B.quad(nm(tag), MAT[mat], [fpt(f, t0, y0, n), fpt(f, t1, y0, n), fpt(f, t1, y1, n), fpt(f, t0, y1, n)], root)
ROT = {'S': 0.0, 'N': math.pi, 'E': math.pi / 2, 'W': -math.pi / 2}

WINS = {}   # (窗的種類, 部件) → [(面, t, 窗台高, 寬, 高)]：同一種窗的同一個部件只做一個網格，其他用 GPU instancing（EXT_mesh_gpu_instancing）擺上去
# 原型的大小：每一扇窗用 instance 的縮放對到實際的寬高（四～八樓：寬 0.95／1.07 m（正背面／側面）＝±7%；一二樓：高 2.9／2.0 m ＝±18%）。
# 部件分開：窗框與混凝土窗框不管亮不亮燈都是同一組；玻璃分亮燈／沒亮燈兩組（晚上發光的材質不同）。
# 第一版每一種大小 × 亮不亮燈各自一組（36 個 InstancedMesh），同一個鏡頭多 70 次 draw call（tests/wancai_glb_integration.py 量到）→ 8 個
PROTO = {'box': (1.0, 2.03), 'base': (0.58, 2.45)}
def window(f, c, ww, wh, ys, kind):
    x, _, z = fpt(f, c, ys, 0)
    WINS.setdefault((kind, 'frame'), []).append((f, c, ys, ww, wh))
    WINS.setdefault((kind, 'glass_lit' if lit(x, ys, z) else 'glass_dark'), []).append((f, c, ys, ww, wh))

def win_proto(kind, part, k):
    """一扇窗的一個部件（正面朝 +z、原點在窗洞下緣中間、z＝0 是建築本體的牆面；大小＝PROTO）。
    kind＝'box'（四～八樓：玻璃退在紅磚面後面 0.3 m，四周凸出的混凝土窗框：窗楣、窗台、兩側）；'base'（一二樓：花崗石窗台＋細鋁框）"""
    ww, wh = PROTO[kind]; grp = B.group(f'winproto_{k}')
    if part.startswith('glass'):
        B.quad('glass', MAT[part], [(-ww / 2, 0.0, 0.02), (ww / 2, 0.0, 0.02), (ww / 2, wh, 0.02), (-ww / 2, wh, 0.02)], grp)
    else:
        B.box('fr', MAT['frame'], -ww / 2, ww / 2, wh * 0.68, wh * 0.68 + 0.05, 0.02, 0.07, grp)   # 橫框
        for sx in (-1, 1): B.box('fr', MAT['frame'], sx * ww / 2 - 0.03, sx * ww / 2 + 0.03, 0.0, wh, 0.02, 0.08, grp)
        if kind == 'box':
            cm = MAT['concrete']
            B.box('hd', cm, -ww / 2 - 0.15, ww / 2 + 0.15, wh, wh + 0.13, 0.16, 0.6, grp)              # 窗楣
            B.box('sl', cm, -ww / 2 - 0.15, ww / 2 + 0.15, -0.13, 0.0, 0.16, 0.6, grp)                # 窗台
            for sx in (-1, 1): B.box('jb', cm, sx * (ww / 2 + 0.075) - 0.065, sx * (ww / 2 + 0.075) + 0.065, 0.0, wh, 0.16, 0.6, grp)   # 兩側
        else:
            B.box('sl', MAT['graniteD'], -ww / 2 - 0.12, ww / 2 + 0.12, -0.14, 0.0, 0.0, 0.2, grp)
    me = B.join_children(grp, f'win_{k}'); B.remove(grp); return me

def build_windows():
    for k, ((kind, part), items) in enumerate(sorted(WINS.items())):
        me = win_proto(kind, part, k); par = B.group(f'WINS_{k}', root); pw, ph = PROTO[kind]
        for j, (f, c, ys, ww, wh) in enumerate(items):
            x, y, z = fpt(f, c, ys, 0); ob = B.instance(me, f'w{k}_{j}', x, y, z, par, ROT[f]); ob.scale = (ww / pw, 1.0, wh / ph)   # Blender 的 z＝遊戲的高

# ---------------- 建築本體（花崗石；窗、紅磚、窗框都貼在外面，和套件一樣：鏡頭碰撞就是這個方塊）----------------
B.box('core', MAT['granite'], -w / 2, w / 2, 0, H - 0.01, -d / 2, d / 2, root)   # 頂面比石材帶低 1 cm（BUG-COPLANAR-DEV：同高的頂面疊在一起，屋頂板下面）

def front_skip(fl, t):   # 正面被弧形量體、平台／陽台／一樓入口、凸出量體擋住的開間（和套件一樣）
    return (fl < 2 and ((LX0 - 0.4 < t < BX1 + 0.4) or (DCX - DR - 0.4 < t < DCX + DR + 0.4))) or (fl < 3 and t > BX1 - 0.4)

for f in 'SNEW':
    Lf = FACES[f]; inner = Lf - 2 * CW; nb = max(2, round(inner / 2.9)); bw = inner / nb; upY = yF(lowF)
    for k in (-1, 1):   # 角上的寬花崗石（三樓以上）
        BOX('granite', f, k * (Lf / 2 - CW / 2) - CW / 2, k * (Lf / 2 - CW / 2) + CW / 2, upY - 0.4, H - 0.005, 0, 0.44, 'corner')   # 頂面低 5 mm（和石材帶的頂面錯開）
    for fl in range(nf):
        y0, fhh = yF(fl), hF(fl)
        upper = fl >= lowF and fl != nf - 1; ribbon = fl == lowF - 1
        if upper:   # 紅磚：窗下、窗上兩道磚帶（凸出 0.32）＋開間之間、兩扇窗之間的磚柱
            BOX('brick', f, -inner / 2, inner / 2, y0, y0 + 1.05, 0, 0.32, 'bk'); BOX('brick', f, -inner / 2, inner / 2, y0 + fhh - 0.42, y0 + fhh, 0, 0.32, 'bk')
        if ribbon:  # 三樓：石材與紅磚之間一整排橫向長窗（退縮的玻璃、直櫺、石材窗台）
            wh = fhh - 1.6
            for i in range(nb):
                t0, t1 = -inner / 2 + i * bw, -inner / 2 + (i + 1) * bw
                x, _, z = fpt(f, (t0 + t1) / 2, y0, 0)
                PANE('glass_lit' if lit(x, y0, z) else 'glass_dark', f, t0, t1, y0 + 1.0, y0 + 1.0 + wh, 0.02)
            for i in range(nb + 1):
                tt = -inner / 2 + i * bw; BOX('frame', f, tt - 0.06, tt + 0.06, y0 + 1.0, y0 + 1.0 + wh, 0.0, 0.12, 'mul')
            BOX('frame', f, -inner / 2, inner / 2, y0 + 1.0 + wh * 0.62, y0 + 1.0 + wh * 0.62 + 0.06, 0.0, 0.1, 'mul')
            BOX('graniteD', f, -inner / 2 - 0.1, inner / 2 + 0.1, y0 + 0.84, y0 + 1.0, 0, 0.22, 'sill')
            BOX('graniteD', f, -inner / 2 - 0.1, inner / 2 + 0.1, y0 + 1.0 + wh, y0 + 1.0 + wh + 0.12, 0, 0.14, 'sill')
            continue
        for i in range(nb):
            t = -inner / 2 + bw * (i + 0.5)
            if f == 'S' and front_skip(fl, t): continue
            if upper:
                wh = fhh - 1.47; ww = (bw - 0.62) / 2 - 0.14
                for dx in (-1, 1): window(f, t + dx * (ww / 2 + 0.14), ww, wh, y0 + 1.05, 'box')
                BOX('brick', f, t - 0.14, t + 0.14, y0 + 1.05, y0 + fhh - 0.42, 0, 0.32, 'pier')
                BOX('brick', f, max(t - bw / 2 - 0.31, -inner / 2), t - bw / 2 + 0.31, y0 + 1.05, y0 + fhh - 0.42, 0, 0.32, 'pier')   # 第一根只到角上的花崗石為止（BUG-COPLANAR-DEV：原本伸進去 31 cm）
            elif fl < lowF - 1:
                ww, wh = bw * 0.2, fhh - 1.5
                for dx in (-0.17, 0.17): window(f, t + dx * bw, ww, wh, y0 + 0.9, 'base')
        if upper: BOX('brick', f, inner / 2 - 0.31, inner / 2, y0 + 1.05, y0 + fhh - 0.42, 0, 0.32, 'pier')   # 最後一根也是

# ---------------- 頂上：灰色石材帶＋往外伸出的薄屋頂板＋屋頂設備、鏤空的混凝土大框架 ----------------
B.box('topband', MAT['granite'], -w / 2 - 0.25, w / 2 + 0.25, H - 1.4, H, -d / 2 - 0.25, d / 2 + 0.25, root)
B.box('roofslab', MAT['graniteD'], -w / 2 - 1.3, w / 2 + 1.3, H, H + 0.35, -d / 2 - 1.3, d / 2 + 1.3, root)
B.box('roofroom', MAT['concrete'], -w * 0.18 - w * 0.15, -w * 0.18 + w * 0.15, H + 0.35, H + 3.35, -d * 0.15 - d * 0.2, -d * 0.15 + d * 0.2, root)
for xx in (w * 0.22, w * 0.22 + 3.6):
    B.box(nm('eq'), MAT['roofEq'], xx - 1.6, xx + 1.6, H + 0.35, H + 2.55, -d * 0.2 - 1.6, -d * 0.2 + 1.6, root)
FY, FHt, bzr = H + 0.35, 4.6, d / 2 - 1.4; xs = [-w / 2 + 1.2, -w / 6, w / 6, w / 2 - 1.2]
for zs in (1, -1):
    B.box(nm('rf'), MAT['concrete'], -(w - 1.6) / 2, (w - 1.6) / 2, FY + FHt - 0.85, FY + FHt, zs * bzr - 0.35, zs * bzr + 0.35, root)
    for x in xs: B.box(nm('rfc'), MAT['concrete'], x - 0.35, x + 0.35, FY, FY + FHt - 0.85, zs * bzr - 0.35, zs * bzr + 0.35, root)
for x in (xs[0], xs[3]): B.box(nm('rf'), MAT['concrete'], x - 0.35, x + 0.35, FY + FHt - 0.85, FY + FHt, -bzr + 0.35, bzr - 0.35, root)

# ---------------- 正面：樓梯頂端的平台＋大台階（每一階的外緣和遊戲的導航同一組）----------------
prism('platform', MAT['graniteS'], [(LX0 + 0.02, d / 2), (LX1, d / 2), (LX1, d / 2 + LD), (LX0 + 0.02, d / 2 + LD)], 0.0, PF, side_mat=MAT['riser'])   # 西緣縮進 2 cm、藏在石牆裡（原本和西側石牆的外面同一個平面，會閃）
for k in range(NS):
    R = OUTL[k]
    poly = [(SX + x, z0 + z) for (x, z) in R] + [(SX - x, z0 + z) for (x, z) in reversed(R)]
    prism('step', MAT['graniteS'], poly, k * RS, (k + 1) * RS, side_mat=MAT['riser'])   # 每一階只做自己那一層（原本每一階都從地面做起，相鄰兩階的側面同一個平面、疊在一起會閃；外緣和導航照舊）
# 兩側石牆＋圓牆頂＋端塊＋三道扶手：西側從建築正面沿著平台一路往下；東側只沿著樓梯（平台東側接陽台）
for sx in (-1, 1):
    pts = [(SX + sx * (EW / 2 + 0.26), d / 2 + 0.02)] if sx < 0 else []; tops = [PF + CH - CR] if sx < 0 else []
    for i in range(15): s = SC * i / 14; pts.append((SX + sx * (hwAt(s) + 0.26), z0 + s * L)); tops.append(cheekTop(s) - CR)
    cheek_wall('cheek', MAT['cheek'], pts, CT, tops)
    tube('cheektop', MAT['cheek'], [(p[0], tops[i], p[1]) for i, p in enumerate(pts)], CR, seg=10)
    pe, pp = pts[-1], pts[-2]; ery = math.atan2(pe[0] - pp[0], pe[1] - pp[1]); ER = CR + 0.08; eb = cheekTop(SC) + 0.02 - ER
    rbox('cheekend', MAT['cheek'], pe[0], pe[1], 2 * ER, 0.7, 0.0, eb, ery)
    ca = (pe[0] - math.sin(ery) * 0.35, eb, pe[1] - math.cos(ery) * 0.35); cb = (pe[0] + math.sin(ery) * 0.35, eb, pe[1] + math.cos(ery) * 0.35)
    B.cyl(nm('cheekcap'), MAT['cheek'], ca, cb, ER, root, seg=12)
    def base_at(p):
        s = max(0.0, (p[2] - z0) / L); return PF + CH if p[2] < z0 else cheekTop(min(s, SC))
    for hh, post in ((0.5, True), (0.34, False), (0.17, False)):
        rp = [(p[0], tops[i] + CR + hh, p[1]) for i, p in enumerate(pts)]
        tube('rail', MAT['steel'], rp, 0.035 if post else 0.018, seg=6)
        if post:
            for j in range(0, len(rp), 3):
                p = rp[j]; b = base_at(p) - 0.05
                if p[1] - b > 0.1: B.cyl(nm('post'), MAT['steel'], (p[0], b, p[2]), (p[0], p[1], p[2]), 0.025, root, seg=6)
# 弧形陽台：前緣是四分之一橢圓（厚 0.62 的混凝土邊）＋欄杆；陽台底下是一樓入口
bal = [(BX0, d / 2)] + [(BX0 + BA * i / 28, bzf(BX0 + BA * i / 28)) for i in range(29)]
prism('balcony', MAT['graniteS'], bal, PF - BT, PF, bottom=True, side_mat=MAT['concrete'])
rp = [(BX0 + 0.1 + (BA - 0.35) * i / 16, PF + 1.05, bzf(BX0 + 0.1 + (BA - 0.35) * i / 16) - 0.18) for i in range(17)]
tube('brail', MAT['steel'], rp, 0.035, seg=6)
for hh in (0.36, 0.7): tube('brail', MAT['steel'], [(p[0], PF + hh, p[2]) for p in rp], 0.018, seg=4)
for p in rp[::2]: B.cyl(nm('bpost'), MAT['steel'], (p[0], PF, p[2]), (p[0], PF + 1.05, p[2]), 0.025, root, seg=6)
# 二樓入口：平台和陽台後面整面玻璃（直櫺、橫櫺）＋上面的石材帶（館名由遊戲畫在這裡）
gx0, gx1, gh2 = LX0 + 0.2, BX1 - 0.2, 3.5
B.quad('glass2f', MAT['glass_lobby'], [(gx0, PF, d / 2 + 0.03), (gx1, PF, d / 2 + 0.03), (gx1, PF + gh2, d / 2 + 0.03), (gx0, PF + gh2, d / 2 + 0.03)], root)
for i in range(9): xx = gx0 + (gx1 - gx0) * i / 8; B.box(nm('m2'), MAT['frame'], xx - 0.05, xx + 0.05, PF, PF + gh2, d / 2, d / 2 + 0.14, root)
B.box(nm('m2'), MAT['frame'], gx0, gx1, PF + 2.55, PF + 2.67, d / 2, d / 2 + 0.14, root)
B.box(nm('m2'), MAT['door'], SX - 1.0, SX + 1.0, PF, PF + 2.4, d / 2 + 0.02, d / 2 + 0.07, root)   # 樓梯正上方的二樓玻璃門（遊戲：「萬才館二樓入口」，這一版關著）
B.box('nameband', MAT['granite'], gx0 - 0.3, gx1 + 0.3, PF + gh2, PF + gh2 + 0.7, d / 2, d / 2 + 0.5, root)
# 一樓入口（陽台下）：玻璃門＋門框、陽台底下的嵌燈
GX0, GX1, GDH = BX0 + 1.6, BX1 - 1.8, 2.6; gcx = (GX0 + GX1) / 2
B.quad('glass1f', MAT['glass_lobby'], [(GX0, 0, d / 2 + 0.03), (GX1, 0, d / 2 + 0.03), (GX1, GDH, d / 2 + 0.03), (GX0, GDH, d / 2 + 0.03)], root)
for i in range(5): xx = GX0 + i * (GX1 - GX0) / 4; B.box(nm('m1'), MAT['frame'], xx - 0.06, xx + 0.06, 0, GDH, d / 2, d / 2 + 0.16, root)
B.box(nm('m1'), MAT['frame'], GX0 - 0.12, GX1 + 0.12, GDH, GDH + 0.16, d / 2, d / 2 + 0.16, root)
B.box('door1f', MAT['door'], gcx - 0.9, gcx + 0.9, 0, 2.3, d / 2 + 0.03, d / 2 + 0.08, root)
B.box('soffit_wall', MAT['concrete'], BX0, BX1, GDH + 0.16, PF - BT, d / 2 - 0.01, d / 2 + 0.05, root)   # 門上到陽台底的牆
for xx in (GX0 + 0.8, gcx, GX1 - 0.8):
    B.quad(nm('dl'), MAT['downlight'], [(xx - 0.12, PF - BT - 0.012, d / 2 + 1.28), (xx + 0.12, PF - BT - 0.012, d / 2 + 1.28), (xx + 0.12, PF - BT - 0.012, d / 2 + 1.52), (xx - 0.12, PF - BT - 0.012, d / 2 + 1.52)], root)

# ---------------- 弧形兩層樓量體（配置圖的半圓）----------------
half = arc_pts(DCX, d / 2, DR, -math.pi / 2, math.pi / 2, 40)
prism('drum', MAT['concrete'], half, 0.0, DH)
prism('drumroof', MAT['graniteD'], arc_pts(DCX, d / 2, DR + 0.22, -math.pi / 2, math.pi / 2, 40), DH, DH + 0.5)
WA0, WA1, WY0, WH = 0.35, 1.25, 1.0, 6.4
arc_band('drumglass', MAT['glass_lobby'], DCX, d / 2, DR + 0.03, WA0, WA1, WY0, WY0 + WH, 10)
for i in range(8):
    a2 = WA0 + (WA1 - WA0) * i / 7; r = DR + 0.08
    rbox('drumm', MAT['frame'], DCX + math.sin(a2) * r, d / 2 + math.cos(a2) * r, 0.12, 0.12, WY0, WY0 + WH, a2)
for yy in (WY0, WY0 + WH * 0.74, WY0 + WH): arc_band('drumh', MAT['frame'], DCX, d / 2, DR + 0.09, WA0, WA1, yy - 0.06, yy + 0.06, 10)
arc_band('drumslit', MAT['glass_dark'], DCX, d / 2, DR + 0.03, -0.62 - 0.032, -0.62 + 0.032, 1.2, 7.4, 1)
arc_band('drumtrim', MAT['trim'], DCX, d / 2, DR + 0.03, -0.71 - 0.017, -0.71 + 0.017, 1.2, 7.4, 1)
# 弧形量體和樓梯平台之間靠牆的那一小塊：矮花台＋修剪過的灌木（照片：樓梯腳邊的灌木；導航擋住）
pz = 2.6; xa = DCX + math.sqrt(DR * DR - pz * pz) - 0.3; xb = LX0
if xb > xa:
    B.box('planter', MAT['granite'], xa, xb, 0, 0.5, d / 2, d / 2 + pz, root)
    B.box('hedge', MAT['hedge'], xa + 0.1, xb - 0.1, 0.5, 0.95, d / 2 + 0.1, d / 2 + pz - 0.1, root)

# ---------------- 最東邊往前凸出的三層樓灰色量體（大塊混凝土板、成對的窄窗）----------------
PX0, PX1 = BX1, w / 2; PHt = gfh + 2 * fh; pcx = (PX0 + PX1) / 2
B.box('prot', MAT['concrete'], PX0, PX1, 0, PHt, d / 2, d / 2 + PD, root)
for fl in range(3):
    y0, fhh = yF(fl), hF(fl); wh = fhh - 1.5
    for dx in (-0.17, 0.17):
        x = pcx + dx * (PX1 - PX0); on = lit(x, y0, d / 2 + PD)
        B.quad(nm('pg'), MAT['glass_lit' if on else 'glass_dark'], [(x - 0.31, y0 + 0.9, d / 2 + PD + 0.02), (x + 0.31, y0 + 0.9, d / 2 + PD + 0.02), (x + 0.31, y0 + 0.9 + wh, d / 2 + PD + 0.02), (x - 0.31, y0 + 0.9 + wh, d / 2 + PD + 0.02)], root)
        B.box(nm('ps'), MAT['graniteD'], x - 0.43, x + 0.43, y0 + 0.76, y0 + 0.9, d / 2 + PD, d / 2 + PD + 0.2, root)
        for sx in (-1, 1): B.box(nm('pf'), MAT['frame'], x + sx * 0.31 - 0.03, x + sx * 0.31 + 0.03, y0 + 0.9, y0 + 0.9 + wh, d / 2 + PD, d / 2 + PD + 0.08, root)
    BOX('graniteD', 'S', PX0, PX1, y0 - 0.05, y0 + 0.05, PD, PD + 0.06, 'pfl') if fl else None

build_windows()
B.join_by_material(root, 'EXT')
st = B.export(OUT, ROOT, gpu_instances=True)
print('window parts', {str(k): len(v) for k, v in WINS.items()})
if RENDER:
    B.render_views(RENDER, 'wancai_ext', [('front', (4.0, 6.0, 58.0), (0.0, 15.0, 0.0)), ('stairs', (-1.0, 1.7, 26.0), (-1.0, 3.0, 10.0)), ('balcony', (7.0, 5.3, 12.6), (-6.0, 4.0, 15.0)), ('corner', (30.0, 3.0, 34.0), (0.0, 12.0, 0.0))],
                   lights=[(5.8, 2.6, 11.4, 300)], lens=20)
