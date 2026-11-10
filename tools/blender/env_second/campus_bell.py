"""【第 2 版 NTU-REF-1110（LAWWW2 帳號 A 11-10）：照官網照片改成沒有屋頂的金屬鐘架（見「鐘架」那一段）；石柱、梁、瓦頂、柱面暖光拿掉。下面是第 1 版的說明。】
臺大傅鐘（椰林大道南側的傅鐘廣場，行政大樓正前方）的正式模型 → 一個 GLB（校園世界座標）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/campus_bell.py [-- --out assets/models/env/second_ai/campus_bell.glb]

取代 src/zones3d.js campus 區塊的 CK.bell() 的外觀（LAWWW 2026-10-10 23:26Z 分派的校園地標②）：台基、四根柱子、梁、屋頂、吊鐘、石碑、
夜間投光的位置與尺寸都照套件（campuskit3d.js bell()；改那邊要一起改這裡）。導航阻擋（userData.gate.blocks → placeBlocks）在遊戲程式裡，不變。
擺放照 zones3d.js：place(g,bell,-38,16.5,Math.PI)（石碑那一面＝套件的 +z，轉 180° 後朝北對著椰林大道）。

和套件不同的地方（品質）：
  - 台基兩階、柱子（柱腳、柱身、柱頸、柱頭）、梁、石碑都是切石（sandstone_blocks_08，和總圖同一種）；台階與柱腳的上緣倒角、柱身四個角倒角。
  - 梁上一圈線腳；四坡屋頂鋪瓦（grey_roof_tiles，真實比例），四條垂脊有脊瓦；屋簷板；寶頂。
  - 銅鐘：照套件的剖面（外擴的鐘口、裡面看得到鐘舌），加三道凸起的鐘帶（鐘口、鐘腰、鐘肩）；吊環、鐵吊件、鐘舌（桿＋錘）。
  - 石碑：倒角的碑身、碑帽；碑面「傅鐘」是 PLATE_FACE_BELL（遊戲用 canvas 畫：石材匾額樣式，和總圖同一套）。
  - 夜間：前面兩根柱子腳下的地燈（燈罩玻璃 ck_bell_lens 晚上亮）、柱面由下往上淡出的暖光（ck_bell_wash：遊戲改成加法混合、晚上發光）、
    光暈位置（GLOW_* 空節點，遊戲放 TK.glowSprite）——和套件同一個位置、同一種做法。
效能：套件的傅鐘全部投影；這裡吊環、鐘舌、地燈、匾額不投影（遊戲端 WZ_NO_SHADOW）。三角形照套件的數量控制（見 campus_bell.json）。
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_bell.glb')

# ---------------- 套件的尺寸（campuskit3d.js bell()）----------------
F, C, CW, CH = 0.4, 1.3, 0.34, 2.9          # 台基頂面、柱子中心（±C）、柱身寬、柱身高
BT = F + 0.14 + CH + 0.14                   # 3.58：梁底
BL = 2 * C + CW + 0.2                        # 3.14：梁長
RW, RH = 4.5, 1.3; RY = BT + 0.34            # 屋簷板寬、屋頂高、屋簷板底
PX, PZ = -38.0, 16.5                         # place(g,bell,-38,16.5,Math.PI)

B.reset(texres=512)
root = B.group('campus_bell', props={'kind': 'campus_bell'})
M = {
    'stone': L.pbr('ck_bell_stone', 'sandstone_blocks_08', tile=3.0, sat=0.45, target='#d8cfbd', normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.8),
    # 柱子、梁、石碑另外一個材質（CAM-BELL-1031，10-31）：名字 seethru_ 開頭，遊戲的 attachWenzhouModel 標樹幹透視（擋住玩家時網點透空）。
    #   行政大樓門廊往旁邊走 1.3 m，跟隨鏡頭在人後面 5.9 m，正好落在鐘亭裡，整個畫面是柱子、梁的石材。和總圖、行政大樓門廊石柱同一個做法（seethru_ck_col）。
    #   台基照舊 ck_bell_stone（鏡頭在台基上面，不會擋）。
    'pstone': L.pbr('seethru_bell_stone', 'sandstone_blocks_08', tile=3.0, sat=0.45, target='#d8cfbd', normal=0.5, maps=('diff', 'nor'), res=512, rough_value=0.8),
    'roof': L.pbr('ck_bell_roof', 'grey_roof_tiles', tile=3.0, target='#3f4842', normal=0.8, maps=('diff', 'nor'), res=256, rough_value=0.82),
    'dark': L.flat('ck_bell_dark', '#35302c', rough=0.75),            # 屋簷板、脊瓦、地燈燈座、吊件
    'wood': L.pbr('ck_bell_wood', 'dark_wood', tile=1.0, target='#4a3426', maps=('diff',), res=256, rough_value=0.65),
    'bronze': L.flat('ck_bell_bronze', '#5f5c43', rough=0.42, metal=0.35),
    'lens': L.flat('ck_bell_lens', '#fff1d6', rough=0.3),
    # 鐘架（NTU-REF-1110）：深古銅色的鋼（真的是紅色，D136 不照抄）；seethru_ 開頭：擋住玩家時網點透空（和原本的石柱一樣）。遊戲沒有環境貼圖：金屬度 ≤ 0.45
    'steel': L.flat('seethru_bell_steel', '#3d3428', rough=0.42, metal=0.4),
    'board': L.flat('ck_board', '#e3dccd', rough=0.8),
}
# 柱面的暖光：由下往上淡出（下面暖白、中間褐、上面黑）；遊戲裡改成加法混合＋晚上發光（黑色＝不加光）
_wash = bpy.data.images.new('bell_wash', 4, 64, alpha=False)
_px = []
for j in range(64):
    t = j / 63
    c = [(1.0, 0.843, 0.627), (0.478, 0.353, 0.220), (0.0, 0.0, 0.0)]
    a, b, u = (c[0], c[1], t / 0.55) if t < 0.55 else (c[1], c[2], (t - 0.55) / 0.45)
    col = [a[k] + (b[k] - a[k]) * u for k in range(3)]
    _px += (col + [1.0]) * 4
_wash.pixels.foreach_set(_px); _wash.pack()
M['wash'] = bpy.data.materials.new('ck_bell_wash'); M['wash'].use_nodes = True
_nt = M['wash'].node_tree; _tx = _nt.nodes.new('ShaderNodeTexImage'); _tx.image = _wash
_nt.links.new(_tx.outputs['Color'], _nt.nodes['Principled BSDF'].inputs['Base Color'])

_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('bell_' + k, M[k])
    return _acc[k]


def W(x, y, z): return (PX - x, y, PZ - z)     # 套件座標 → 校園世界座標（轉 180°）


def newell(pts):
    n = [0.0, 0.0, 0.0]
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
    return n


def face(m, pts, want):
    """平面多邊形（套件座標）；want＝想要的法線（套件座標），反了就倒過來"""
    n = newell(pts)
    if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]
    return m.bm.faces.new([m.bm.verts.new(g2b(*W(*p))) for p in pts])


def cbox(m, cx, cz, w, d, y0, y1, ch=0.0, cb=0.0, corner=0.0, skip=()):
    """方塊（套件座標，中心 cx,cz；寬 w（x）、深 d（z））。ch＝上緣倒角、cb＝下緣倒角、corner＝四根直角倒角（八角柱）。skip：'bottom'、'top'"""
    hx, hz = w / 2, d / 2
    def ring(y, ins):   # 一圈輪廓（往內縮 ins；四個角倒 corner）
        a, b = hx - ins, hz - ins; k = max(0.0, corner - ins * 0.4142) if corner else 0.0
        if k <= 1e-6: return [(cx - a, y, cz - b), (cx + a, y, cz - b), (cx + a, y, cz + b), (cx - a, y, cz + b)]
        return [(cx - a + k, y, cz - b), (cx + a - k, y, cz - b), (cx + a, y, cz - b + k), (cx + a, y, cz + b - k),
                (cx + a - k, y, cz + b), (cx - a + k, y, cz + b), (cx - a, y, cz + b - k), (cx - a, y, cz - b + k)]
    levels = []
    if cb > 0: levels += [(y0, cb), (y0 + cb, 0.0)]
    else: levels += [(y0, 0.0)]
    if ch > 0: levels += [(y1 - ch, 0.0), (y1, ch)]
    else: levels += [(y1, 0.0)]
    rings = [ring(y, ins) for (y, ins) in levels]
    for ra, rb in zip(rings, rings[1:]):
        n = len(ra)
        for i in range(n):
            j = (i + 1) % n; mx = (ra[i][0] + ra[j][0]) / 2 - cx; mz = (ra[i][2] + ra[j][2]) / 2 - cz
            face(m, [ra[i], ra[j], rb[j], rb[i]], (mx, 0.0, mz))
    if 'bottom' not in skip: face(m, rings[0], (0, -1, 0))
    if 'top' not in skip: face(m, rings[-1], (0, 1, 0))


# ---------------- 台基（兩階，上緣倒角）----------------
st = acc('stone')
cbox(st, 0, 0, 4.8, 4.8, 0.0, 0.2, ch=0.03, skip=('bottom',))
cbox(st, 0, 0, 4.0, 4.0, 0.2, F, ch=0.03, skip=('bottom',))

pst = acc('pstone')   # 石碑：seethru_bell_stone（見材質那裡）
# ---------------- 鐘架（NTU-REF-1110 ①，LAWWW2 帳號 A 11-10；X223／D136）----------------
# 官網照片（docs/story_planning/ref_images/buildings/README.md 傅鐘一列）：真的傅鐘是**紅色鋼管鐘架**（細柱＋兩道圓環、鐘吊在頂上）、**沒有屋頂**，下面石砌台座＋石碑；
# 第一版是石柱、梁、四坡瓦頂的鐘亭（照套件），和照片差最多。D136 像但不照抄：
#   保留：沒有屋頂、細的金屬柱、鐘吊在架子頂上、石砌台座、石碑；
#   不照抄：只有一道圓環（真的兩道）、頂上四道弧形拱肋交在中間吊鐘、顏色是深古銅（真的是紅色）、柱子微微往內收。
# 四根柱子的腳照舊在套件柱子的位置（±C, ±C）：遊戲的導航阻擋（套件 bell() 的 blocks）不用改。
st_ = acc('steel'); TOP = 4.3; APX = TOP + 0.95; LEAN = 0.22
def postxz(sx, sz, y):   # 柱子在高度 y 的位置（從台基往上微微往內收）
    t = (y - F) / (TOP - F); k = 1.0 - LEAN * t; return (sx * C * k, sz * C * k)
for sx in (-1, 1):
    for sz in (-1, 1):
        cbox(st_, sx * C, sz * C, 0.30, 0.30, F, F + 0.05, ch=0.01, skip=('bottom',))          # 柱腳鋼板
        x1, z1 = postxz(sx, sz, TOP)
        st_.cyl(W(sx * C, F + 0.05, sz * C), W(x1, TOP, z1), 0.07, seg=10, r2=0.05)            # 柱身（下粗上細）
        st_.sphere(W(x1, TOP, z1), 0.065, seg=8, rings=5)                                        # 柱頭的球節
# 中間一道水平圓環（真的有兩道；這裡一道）
RY_ = 2.75; rx, _ = postxz(1, 1, RY_); RR = math.hypot(rx, rx)
_tor = []; ts, tt = 32, 6
for i_ in range(ts):
    u = 2 * math.pi * i_ / ts; row = []
    for j_ in range(tt):
        v = 2 * math.pi * j_ / tt; rr = RR + 0.04 * math.cos(v)
        row.append(st_.bm.verts.new(g2b(*W(rr * math.cos(u), RY_ + 0.04 * math.sin(v), rr * math.sin(u)))))
    _tor.append(row)
for i_ in range(ts):
    for j_ in range(tt):
        a_, b_, c_, d_ = _tor[i_][j_], _tor[(i_ + 1) % ts][j_], _tor[(i_ + 1) % ts][(j_ + 1) % tt], _tor[i_][(j_ + 1) % tt]
        st_.bm.faces.new((a_, b_, c_, d_))
# 頂上四根橫桿（柱頭連成一圈）＋四道弧形拱肋（柱頭 → 中間的頂點，鐘吊在那裡）
tops = [postxz(sx, sz, TOP) for (sx, sz) in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
for k_ in range(4):
    a_, b_ = tops[k_], tops[(k_ + 1) % 4]
    st_.cyl(W(a_[0], TOP, a_[1]), W(b_[0], TOP, b_[1]), 0.04, seg=8)
    pts = []
    for q in range(6):
        t = q / 5; ang = t * math.pi / 2
        pts.append((a_[0] * (1 - math.sin(ang)), TOP + (APX - TOP) * math.sin(ang) ** 0.8, a_[1] * (1 - math.sin(ang))))
    for p0, p1 in zip(pts, pts[1:]): st_.cyl(W(*p0), W(*p1), 0.045, seg=8)
st_.sphere(W(0, APX + 0.04, 0), 0.11, seg=10, rings=6)                                          # 頂上的球
cbox(st_, 0, 0, 0.16, 0.16, APX - 0.18, APX - 0.02, skip=())                                     # 吊鐘的座

# ---------------- 吊鐘：木橫梁、鐵吊件、吊環、銅鐘（三道鐘帶）、鐘舌 ----------------
by = BT - 0.19
st_.cyl(W(0, APX - 0.18, 0), W(0, by, 0), 0.025, seg=8)   # 吊桿：從頂上的座往下吊到鐘的吊件（原本是木橫梁）
cbox(acc('dark'), 0, 0, 0.05, 0.08, by - 0.04, by, skip=('top',))
# 吊環（直立的圓環）
tm = acc('bronze'); R_, r_ = 0.07, 0.025; ts, tt = 10, 5; c0 = W(0, by - 0.11, 0); ring_v = []
for i in range(ts):
    u = 2 * math.pi * i / ts; row = []
    for j in range(tt):
        v = 2 * math.pi * j / tt; rr = R_ + r_ * math.cos(v)
        row.append(tm.bm.verts.new(g2b(c0[0] + rr * math.cos(u), c0[1] + rr * math.sin(u), c0[2] + r_ * math.sin(v))))
    ring_v.append(row)
for i in range(ts):
    for j in range(tt):
        a, b, c, d = ring_v[i][j], ring_v[(i + 1) % ts][j], ring_v[(i + 1) % ts][(j + 1) % tt], ring_v[i][(j + 1) % tt]
        tm.bm.faces.new((a, b, c, d))
# 鐘身：套件的剖面（內面從頂往下到鐘口、外面從鐘口往上到頂），加三道鐘帶（凸起 1–1.5 cm）
bh = 0.97; y0 = by - 0.12 - bh
prof = [(0.0, 0.62), (0.2, 0.58), (0.33, 0.36), (0.4, 0.12), (0.44, 0.0), (0.475, 0.02), (0.478, 0.06), (0.462, 0.115), (0.41, 0.17), (0.335, 0.38),
        (0.305, 0.58), (0.316, 0.6), (0.316, 0.64), (0.3, 0.66), (0.29, 0.76), (0.262, 0.85), (0.27, 0.86), (0.264, 0.885), (0.25, 0.89), (0.15, 0.95), (0.0, 0.97)]
bel = L.lathe([(r, y0 + h) for (r, h) in prof], seg=20)
bmesh.ops.remove_doubles(bel, verts=bel.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bel, faces=bel.faces)
cb = W(0, 0, 0); bmesh.ops.translate(bel, verts=bel.verts, vec=Vector((cb[0], -cb[2], 0)))
acc('bronze').add_bm(bel); bel.free()
# 鐘舌：桿＋錘（掛在鐘裡）
acc('dark').cyl(W(0, y0 + 0.6, 0), W(0, y0 + 0.2, 0), 0.016, seg=6)
acc('bronze').sphere(W(0, y0 + 0.16, 0), 0.065, seg=8, rings=5)

# ---------------- 石碑（正面 +z）：倒角的碑身＋碑帽＋碑面 ----------------
cbox(pst, 0, 3.05, 1.5, 0.28, 0.0, 0.85, ch=0.02, skip=('bottom', 'top'))   # 碑頂被碑帽蓋住
cbox(pst, 0, 3.05, 1.62, 0.36, 0.85, 0.95, ch=0.025, cb=0.02, skip=())
plate = Mesh('PLATE_FACE_BELL', M['board'])
pz = 3.05 + 0.14 + 0.006
face(plate, [(-0.68, 0.35, pz), (0.68, 0.35, pz), (0.68, 0.69, pz), (-0.68, 0.69, pz)], (0, 0, 1))   # 點的順序＝uv01 的 (0,0)(1,0)(1,1)(0,1)：從正面看左下開始（和總圖的匾額一樣；反了字會左右顛倒）

# ---------------- 夜間投光：前面兩根柱子腳下的地燈（燈座＋燈罩玻璃）、柱面的暖光、光暈位置 ----------------
for sx in (-1, 1):
    x = sx * C; zl = C + 0.42
    cbox(acc('dark'), x, zl, 0.18, 0.14, F, F + 0.07, skip=('bottom',))
    face(acc('lens'), [(x - 0.07, F + 0.072, zl - 0.05), (x + 0.07, F + 0.072, zl - 0.05), (x + 0.07, F + 0.072, zl + 0.05), (x - 0.07, F + 0.072, zl + 0.05)], (0, 1, 0))
    # 柱面的暖光（ck_bell_wash）：石柱拿掉了，細鋼柱不放（地燈＋光暈照舊）
    g = B.group('GLOW_bell_%s' % ('w' if sx < 0 else 'e'), root, props={'glow': 'rgba(255,214,160,1)', 'size': 0.7, 'day': 0, 'night': 0.55})
    g.location = g2b(*W(x, F + 0.14, zl))

# ---------------- 完成 ----------------
for k, m in _acc.items():
    if k == 'wash':
        ob = m.finish(root, uv=True)
        uvl = ob.data.uv_layers.active
        for poly in ob.data.polygons:   # 由下往上 v=0→1（柱腳最亮）：照頂點高度給 UV
            zs = [ob.data.vertices[ob.data.loops[li].vertex_index].co.z for li in poly.loop_indices]; z0_, z1_ = min(zs), max(zs)
            xs = sorted(set(round(ob.data.vertices[ob.data.loops[li].vertex_index].co.x, 4) for li in poly.loop_indices))
            for li in poly.loop_indices:
                co = ob.data.vertices[ob.data.loops[li].vertex_index].co
                uvl.data[li].uv = (0.0 if round(co.x, 4) == xs[0] else 1.0, (co.z - z0_) / max(1e-6, z1_ - z0_))
    elif k == 'bronze': bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces); m.finish(root, uv=True, smooth=True)   # 鐘、寶頂、吊環都是封閉的：法線一律朝外
    else: m.finish(root, uv=True)
uv01(plate.finish(root, uv=True, props={'text': '晨思鐘', 'bg': '#e3dccd', 'color': '#3a2f28', 'serif': 1}))
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
info = L.export(OUT, gpu_instances=False)
L.write_json(OUT[:-4] + '.json', info)
