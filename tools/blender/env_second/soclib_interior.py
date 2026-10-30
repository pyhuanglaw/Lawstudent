"""社會科學院 辜先生紀念圖書館（⑬，一樓開架閱覽室）室內 → GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/soclib_interior.py [-- --out assets/models/env/second_ai/soclib_interior.glb] [--preview 資料夾]

配置讀 src/data/soclib_layout.js（tools/blender/env_second/soclib_layout_gen.py 產生；遊戲的導航、座位、互動點讀同一份，兩邊一定對得上）。
座標＝配置的座標：x 往東、z 往南（+z＝南牆：入口、服務台）、y 往上，地板 y=0，30×22 m、天花板 5.6 m。
參考（公開報導，不是實測）：挑高將近 6 m 的開架閱覽室，白色樹狀柱撐起屋頂、柱頂像荷葉散開，荷葉之間是大大小小的圓形天窗；竹製書架與閱覽家具。
做成：
- 樹狀柱：細白柱，上面一段像喇叭一樣張開成荷葉（柱頂高度 4.75–5.25 m 錯開，像一片片樹冠）。
- 天花板：白色；天窗是天花板上的圓形光井（白色井壁＋頂上的天光面板 soclib_skylight，自發光；遊戲可以依時段調亮度）。
- 竹色弧形矮書架（圍出「林間書房」）、東牆靠牆書架、期刊架：書是一本一本的（頂點色，一個材質）。
- 閱覽長桌（竹色桌面、中間一排小檯燈）、竹椅；北牆、西牆的玻璃帷幕前是窗邊長桌＋椅子；服務台、館員區矮隔板、入口閘門與玻璃欄杆、查詢電腦、新書展示台、還書箱、閱報區沙發。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；front＝南牆、back＝北牆、left＝西牆、right＝東牆）。字（招牌）用 canvas：SIGN_FACE_*。
貼圖：Poly Haven CC0（terrazzo_tiles、walnut_veneer：淺色直紋當竹集成材）。
2026-10-30 SOCLIB-LM-1030（LAWWW2-B；LAWWW-B 派工，INTERIOR_AAA_REVIEW_1028 第 5 節 P1 光照＋P5 燈具）：加燈具——荷葉頂面的上照燈帶、天花板小筒燈（避開天窗、荷葉、牆邊）；
  燈的位置寫進統計 JSON 的 lights（lightbake/bake_soclib.sh 讀同一份烘焙光照貼圖）。配置、座位、導航都不動。"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/soclib_interior.glb'))
src = open(os.path.join(L.ROOT, 'src/data/soclib_layout.js'), encoding='utf8').read()
J = json.loads(src[src.index('{', src.index('const SOCLIB_LAYOUT=')):src.rindex('}') + 1])

W, D, H, WT = J['W'], J['D'], J['H'], J['wallT']
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
random.seed(1313)
B.reset(texres=512)
root = B.group('soclib_interior', props={'kind': 'soclib_interior', 'w': W, 'd': D, 'h': H})

M = {
    'floor': L.pbr('soclib_floor', 'terrazzo_tiles', tile=1.6, target='#d8d5ce', normal=0.3, maps=('diff', 'nor'), rough_value=0.4),
    'wall': L.flat('soclib_wall', '#efeee9', rough=0.85),                    # 白色烤漆牆（粉光牆的貼圖在 5 m 高的大牆上一塊一塊的，像髒汙）
    'ceil': L.flat('soclib_ceiling', '#f4f4f1', rough=0.9, cull=True),
    'col': L.flat('soclib_column', '#f2f2ef', rough=0.45),
    'sky': L.flat('soclib_skylight', '#eef4fb', rough=0.5, emit=B.srgb('#f2f7ff')),
    'well': L.flat('soclib_lightwell', '#fbfbf9', rough=0.8),
    'bamboo': L.pbr('soclib_bamboo', 'walnut_veneer', tile=1.2, target='#d4b27a', maps=('diff',), res=512, rough_value=0.45),     # 竹集成材：直紋、淺蜂蜜色
    'bambooD': L.pbr('soclib_bamboo_dark', 'walnut_veneer', tile=1.2, target='#a7865a', maps=('diff',), res=256, rough_value=0.5),
    'books': L.vc_material('soclib_books', rough=0.6),
    'glass': L.flat('soclib_glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'mull': L.flat('soclib_mullion', '#e8e9e8', rough=0.4, metal=0.2),
    'steel': L.flat('soclib_steel', '#b9bdc1', rough=0.35, metal=0.35),
    'black': L.flat('soclib_black', '#232426', rough=0.45),
    'screen': L.flat('soclib_screen', '#cfe3f2', rough=0.3, emit=B.srgb('#9fc4e6')),
    'fabric': L.flat('soclib_fabric', '#6c737a', rough=0.9),
    'fabric2': L.flat('soclib_fabric_warm', '#a0765a', rough=0.9),
    'lamp': L.flat('soclib_lamp', '#fff6e2', rough=0.4, emit=B.srgb('#fff1d6')),
    'white': L.flat('soclib_white', '#f3f2ee', rough=0.4),
    'mat': L.flat('soclib_mat', '#4a4d50', rough=0.95),
    'board': L.flat('soclib_sign_face', '#ffffff', rough=0.7),
}
BOOK = ['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f', '#9a8f7a', '#2b5a55',
        '#c2a14a', '#5b3e6b', '#efe9dc', '#38424a', '#8c6d4f', '#a33c33']


def lin(h): return [(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4) for c in (int(h[1:3], 16) / 255, int(h[3:5], 16) / 255, int(h[5:7], 16) / 255)]


class CM(Mesh):
    """頂點色網格（書、雜誌）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.col = self.bm.loops.layers.float_color.new('Col')


def rbox(m, cx, cz, yaw, lx0, lx1, y0, y1, lz0, lz1, col=None, faces='all'):
    """轉過 yaw 的盒子（區域座標：右＝(cos yaw, −sin yaw)、前＝(sin yaw, cos yaw)）；col＝頂點色；faces='front'：只做前、頂、兩側"""
    s, c = math.sin(yaw), math.cos(yaw)
    P = lambda lx, y, lz: g2b(cx + lx * c + lz * s, y, cz - lx * s + lz * c)
    bm = m.bm; V = {}
    for i, lx in enumerate((lx0, lx1)):
        for j, y in enumerate((y0, y1)):
            for k, lz in enumerate((lz0, lz1)): V[(i, j, k)] = bm.verts.new(P(lx, y, lz))
    quads = {'-x': [(0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)], '+x': [(1, 0, 1), (1, 0, 0), (1, 1, 0), (1, 1, 1)],
             '-y': [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)], '+y': [(0, 1, 1), (1, 1, 1), (1, 1, 0), (0, 1, 0)],
             '-z': [(1, 0, 0), (0, 0, 0), (0, 1, 0), (1, 1, 0)], '+z': [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)]}
    use = (quads.keys() if faces == 'all' else (['+z', '+y'] if faces == 'ft' else ['+z', '+y', '-x', '+x'])) if isinstance(faces, str) else faces   # 'ft'：只做前、頂；也可以直接給面的清單
    fs = [bm.faces.new([V[q] for q in quads[k]]) for k in use]
    if col is not None:
        cc = lin(col) + [1.0]
        for f in fs:
            for lp in f.loops: lp[m.col] = cc
    return fs


def arc_strip(m, cx, cz, r, a0, a1, y0, y1, n, outward=True):
    """沿圓弧的一片曲面（區域座標的圓：點＝(cx+r cos a, cz+r sin a)）；outward：法線朝圓外"""
    bm = m.bm; lo, hi = [], []
    for k in range(n + 1):
        a = a0 + (a1 - a0) * k / n; x, z = cx + r * math.cos(a), cz + r * math.sin(a)
        lo.append(bm.verts.new(g2b(x, y0, z))); hi.append(bm.verts.new(g2b(x, y1, z)))
    for k in range(n):
        q = (lo[k], lo[k + 1], hi[k + 1], hi[k])
        bm.faces.new(q if not outward else q[::-1])


def arc_slab(m, cx, cz, r0, r1, a0, a1, y0, y1, n):
    """圓弧形的板（層板、頂板、踢腳）：r0～r1、y0～y1"""
    bm = m.bm; ring = []
    for k in range(n + 1):
        a = a0 + (a1 - a0) * k / n; ca, sa = math.cos(a), math.sin(a)
        ring.append([bm.verts.new(g2b(cx + r * ca, y, cz + r * sa)) for (r, y) in ((r0, y0), (r1, y0), (r1, y1), (r0, y1))])
    for k in range(n):
        a, b = ring[k], ring[k + 1]
        for i in range(4):
            j = (i + 1) % 4; bm.faces.new((a[i], a[j], b[j], b[i]))                     # 角度增加＝Blender 裡順時針：這個順序法線朝外
    bm.faces.new(ring[0][::-1]); bm.faces.new(ring[-1])


walls = {'front': [], 'back': [], 'left': [], 'right': []}
def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


# ---------- 地板、天花板 ----------
Mesh('soclib_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)

# ---------- 天窗：圓形光井（井壁＋天光面板），從下面看是一圈一圈亮的圓 ----------
sk = Mesh('soclib_skylights', M['sky']); wl = Mesh('soclib_lightwells', M['well'])
for s in J['skylights']:
    n = 20 if s['r'] > 0.6 else 16
    arc_strip(wl, s['x'], s['z'], s['r'], 0, 2 * math.pi, H - 0.02, H + 0.55, n, outward=False)   # 井壁（法線朝井裡）
    c = g2b(s['x'], H + 0.55, s['z']); vs = [sk.bm.verts.new(g2b(s['x'] + s['r'] * math.cos(2 * math.pi * k / n), H + 0.55, s['z'] + s['r'] * math.sin(2 * math.pi * k / n))) for k in range(n)]
    sk.bm.faces.new(vs)                                                                   # 天光面板（法線朝下）
    vr = [wl.bm.verts.new(g2b(s['x'] + (s['r'] + 0.06) * math.cos(2 * math.pi * k / n), H - 0.025, s['z'] + (s['r'] + 0.06) * math.sin(2 * math.pi * k / n))) for k in range(n)]
    vi = [wl.bm.verts.new(g2b(s['x'] + s['r'] * math.cos(2 * math.pi * k / n), H - 0.025, s['z'] + s['r'] * math.sin(2 * math.pi * k / n))) for k in range(n)]
    for k in range(n):
        j = (k + 1) % n; wl.bm.faces.new((vr[k], vr[j], vi[j], vi[k]))                   # 井口的收邊（比天花板低一點點，擋住天花板和井的接縫）
sk.finish(root, uv=False); wl.finish(root, uv=False)
# 天花板：在天窗的位置挖圓洞（外框＋每個天窗一圈邊，用 triangle_fill 三角化；裡面的圈是洞）——從下面看得到光井裡面
bm = bmesh.new(); edges = []
def loop(pts):
    vs = [bm.verts.new(g2b(x, H, z)) for (x, z) in pts]
    for k in range(len(vs)): edges.append(bm.edges.new((vs[k], vs[(k + 1) % len(vs)])))
loop([(X0, Z0), (X1, Z0), (X1, Z1), (X0, Z1)])
for s in J['skylights']:
    n = 20 if s['r'] > 0.6 else 16
    loop([(s['x'] + s['r'] * math.cos(2 * math.pi * k / n), s['z'] + s['r'] * math.sin(2 * math.pi * k / n)) for k in range(n)])
bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=edges)
bm.normal_update()
for f in bm.faces:
    if f.normal.z > 0: f.normal_flip()                                                     # 天花板朝下（從室內看）
bm.normal_update()
_holes = sum(1 for s_ in J['skylights'] for f in bm.faces if (f.calc_center_median() - g2b(s_['x'], H, s_['z'])).length < s_['r'] * 0.5)
print('天花板三角形', len(bm.faces), '落在天窗洞裡的', _holes)                             # 應該是 0（洞真的挖出來了）
B.mesh_obj('soclib_ceiling', bm, M['ceil'], root, None)

# ---------- 牆：南牆（入口）、東牆實牆；北牆、西牆玻璃帷幕 ----------
def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=WT):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)
E = J['entrance']; ex0, ex1 = E['x'] - E['w'] / 2, E['x'] + E['w'] / 2
wall_box('front', 'wall', X0, ex0, 0.0, H); wall_box('front', 'wall', ex1, X1, 0.0, H); wall_box('front', 'wall', ex0, ex1, 2.7, H)
wall_box('right', 'wall', Z0, Z1, 0.0, H)
for side in ('front', 'right'): wall_box(side, 'mat', *((X0, X1) if side == 'front' else (Z0, Z1)), 0.0, 0.1, 0.0, WT + 0.012)   # 踢腳板
# 入口：雙開玻璃門（關著；出去是遊戲的互動點）
fr = wm('front', 'mull')
for x in (ex0, E['x'], ex1): fr.box(x - 0.04, x + 0.04, 0.0, 2.7, Z1 - WT, Z1)
fr.box(ex0, ex1, 2.6, 2.7, Z1 - WT, Z1)
wm('front', 'glass').quad([(ex1, 0.02, Z1 - WT / 2), (ex0, 0.02, Z1 - WT / 2), (ex0, 2.6, Z1 - WT / 2), (ex1, 2.6, Z1 - WT / 2)])
for x in (E['x'] - 0.25, E['x'] + 0.25): wm('front', 'steel').box(x - 0.015, x + 0.015, 0.85, 1.35, Z1 - WT - 0.06, Z1 - WT - 0.02)   # 門把
Mesh('soclib_doormat', M['mat']).box(ex0 - 0.2, ex1 + 0.2, 0.0, 0.012, Z1 - 1.6, Z1 - WT).finish(root)
# 玻璃帷幕：直框每 1.5 m、橫框在 0.1、2.9、頂；玻璃
def curtain(side, a0, a1):
    n = max(1, round((a1 - a0) / 1.5)); step = (a1 - a0) / n
    for k in range(n + 1):
        a = a0 + k * step
        if side == 'back': wm(side, 'mull').box(a - 0.05, a + 0.05, 0.0, H, Z0, Z0 + WT)
        else: wm(side, 'mull').box(X0, X0 + WT, 0.0, H, a - 0.05, a + 0.05)
    for y0, y1 in ((0.0, 0.12), (2.86, 2.94), (H - 0.12, H)):
        if side == 'back': wm(side, 'mull').box(a0, a1, y0, y1, Z0, Z0 + WT)
        else: wm(side, 'mull').box(X0, X0 + WT, y0, y1, a0, a1)
    if side == 'back': wm(side, 'glass').quad([(a0, 0.12, Z0 + WT / 2), (a1, 0.12, Z0 + WT / 2), (a1, H - 0.12, Z0 + WT / 2), (a0, H - 0.12, Z0 + WT / 2)])
    else: wm(side, 'glass').quad([(X0 + WT / 2, 0.12, a1), (X0 + WT / 2, 0.12, a0), (X0 + WT / 2, H - 0.12, a0), (X0 + WT / 2, H - 0.12, a1)])
curtain('back', X0, X1); curtain('left', Z0, Z1)

# ---------- 樹狀柱：細白柱＋喇叭狀張開的荷葉柱頂 ----------
colm = Mesh('soclib_columns', M['col'])
for c in J['columns']:
    r, R, top = c['r'], c['cap'], c['capY']; flare0 = top - 1.25
    prof = [(r + 0.05, 0.0), (r + 0.05, 0.06), (r, 0.1), (r, flare0)]
    for k in range(1, 9):                                                                 # 喇叭：r → R，越上面張得越快（像荷葉的梗接到葉子）
        t = k / 8; prof.append((r + (R - r) * t ** 2.6, flare0 + (top - flare0) * (1 - (1 - t) ** 1.4)))
    prof += [(R, top + 0.07), (R - 0.05, top + 0.1), (0.0, top + 0.1)]
    bmc = L.lathe(prof, seg=36)                                                           # 36 段：荷葉的邊緣從下面看不會一折一折
    colm.add_bm(bmc, Matrix.Translation(g2b(c['x'], 0, c['z']))); bmc.free()
ob = colm.finish(root, uv=False)
L.smooth_mesh(ob, angle=1.2)

# ---------- 燈具（SOCLIB-LM-1030，LAWWW2-B 2026-10-30；INTERIOR_AAA_REVIEW_1028 第 5 節 P1 光照＋P5 燈具）----------
# 原本天花板上沒有燈具：晚上的光只有遊戲的 8 盞即時點光源，看不出光從哪裡來。加兩種（位置寫進 soclib_interior.json 的 lights，烘焙 lightbake/bake_soclib.sh 讀同一份）：
#   ①荷葉上照燈：每片荷葉頂面一圈暖色燈帶（從下面看不到燈，只看到天花板在荷葉上方亮一圈；晚上像一片片發亮的樹冠）
#   ②天花板小筒燈：3 m 一格，避開天窗、荷葉、牆邊；從下面看是一個一個小亮點，閱覽桌、書架上一圈光
M['down'] = L.flat('soclib_downlight', '#fffaf0', rough=0.4, emit=B.srgb('#fff4e2'), cull=True)
M['up'] = L.flat('soclib_uplight', '#fff1d6', rough=0.4, emit=B.srgb('#ffe2b0'), cull=True)
dl, dtrim, ul = Mesh('soclib_downlights', M['down']), Mesh('soclib_downlight_trim', M['white']), Mesh('soclib_uplights', M['up'])
def disc(m, x, z, y, r, n=12, up=False):
    vs = [m.bm.verts.new(g2b(x + r * math.cos(2 * math.pi * k / n), y, z + r * math.sin(2 * math.pi * k / n))) for k in range(n)]
    f = m.bm.faces.new(vs if up else vs[::-1]); f.normal_update()
    if (f.normal.z > 0) != up: f.normal_flip()
def ring(m, x, z, y, r0, r1, n=24, up=True):
    a = [m.bm.verts.new(g2b(x + r0 * math.cos(2 * math.pi * k / n), y, z + r0 * math.sin(2 * math.pi * k / n))) for k in range(n)]
    b = [m.bm.verts.new(g2b(x + r1 * math.cos(2 * math.pi * k / n), y, z + r1 * math.sin(2 * math.pi * k / n))) for k in range(n)]
    for k in range(n):
        j = (k + 1) % n; f = m.bm.faces.new((a[k], a[j], b[j], b[k])); f.normal_update()
        if (f.normal.z > 0) != up: f.normal_flip()
DOWN = []
for gx in [-13.5 + 3 * i for i in range(10)]:
    for gz in [-9.0 + 3 * k for k in range(7)]:
        if any(math.hypot(gx - s['x'], gz - s['z']) < s['r'] + 0.6 for s in J['skylights']): continue      # 天窗旁邊
        if any(math.hypot(gx - c['x'], gz - c['z']) < c['cap'] + 0.25 for c in J['columns']): continue    # 荷葉上方（被葉子擋住）
        if abs(gx) > W / 2 - 0.9 or abs(gz) > D / 2 - 0.9: continue                                         # 牆邊
        DOWN.append((gx, gz)); disc(dtrim, gx, gz, H - 0.004, 0.1); disc(dl, gx, gz, H - 0.008, 0.065)
UP = []
for c in J['columns']:
    top = c['capY'] + 0.1; ring(ul, c['x'], c['z'], top + 0.006, 0.5, 0.58); UP.append((c['x'], top, c['z']))
dl.finish(root, uv=False); dtrim.finish(root, uv=False); ul.finish(root, uv=False)

# ---------- 書架、書 ----------
shelf = Mesh('soclib_shelves', M['bamboo']); shelfD = Mesh('soclib_shelves_dark', M['bambooD']); books = CM('soclib_books', M['books'])
def fill_books_line(cx, cz, yaw, length, y0, y1, depth):
    """沿一條線放書：中心 (cx,cz)、方向 yaw（書脊朝 yaw 的「前」）、長度 length；y0＝層板頂、y1＝上一層底。
    每本做前面、頂面；側面只在露得出來的時候做（比旁邊那本高或深、或旁邊是空的）——夾在兩本書中間的側面看不到，省三角形"""
    bk = []; x = -length / 2 + 0.03
    while x < length / 2 - 0.05:
        if random.random() < 0.06: x += random.uniform(0.06, 0.18); continue              # 有些地方空著
        w = random.uniform(0.032, 0.07); h = min(y1 - y0 - 0.03, random.uniform(0.17, 0.3)); dd = min(depth, random.uniform(0.15, 0.22))
        bk.append([x, x + w, h, dd, random.choice(BOOK)]); x += w + random.uniform(0.0, 0.004)
    for i, (xa, xb, h, dd, col) in enumerate(bk):
        fs = ['+z', '+y']
        L_ = bk[i - 1] if i > 0 else None; R_ = bk[i + 1] if i + 1 < len(bk) else None
        if L_ is None or xa - L_[1] > 0.002 or h > L_[2] + 0.004 or dd > L_[3] + 0.004: fs.append('-x')
        if R_ is None or R_[0] - xb > 0.002 or h > R_[2] + 0.004 or dd > R_[3] + 0.004: fs.append('+x')
        rbox(books, cx, cz, yaw, xa, xb, y0, y0 + h, -depth / 2, -depth / 2 + dd, col=col, faces=fs)
LEVELS = lambda h: [0.08] + [0.08 + k * (h - 0.12) / (round(h / 0.36)) for k in range(1, round(h / 0.36))]
for f in J['furniture']:
    if f['type'] != 'arcShelf': continue
    cx, cz, r, a0, a1, d, h = f['cx'], f['cz'], f['r'], f['a0'], f['a1'], f['d'], f['h']
    n = max(6, int((a1 - a0) * r / 0.25))
    arc_strip(shelf, cx, cz, r - 0.012, a0, a1, 0.08, h - 0.03, n, outward=False)             # 中間的隔板（雙面書架：兩面都放書）
    arc_strip(shelf, cx, cz, r + 0.012, a0, a1, 0.08, h - 0.03, n, outward=True)
    arc_slab(shelfD, cx, cz, r - d / 2, r + d / 2, a0, a1, 0.0, 0.08, n)                  # 踢腳
    arc_slab(shelf, cx, cz, r - d / 2 - 0.01, r + d / 2 + 0.01, a0, a1, h - 0.03, h, n)   # 頂板
    lv = LEVELS(h)
    for y in lv[1:]: arc_slab(shelf, cx, cz, r - d / 2, r + d / 2, a0, a1, y - 0.022, y, n)
    for a in (a0, a1):                                                                    # 兩端的側板
        x, z = cx + r * math.cos(a), cz + r * math.sin(a); rbox(shelf, x, z, -a + math.pi / 2, -0.012, 0.012, 0.0, h, -d / 2 - 0.01, d / 2 + 0.01)
    seg = max(2, round((a1 - a0) * r / 0.9))                                              # 每 0.9 m 一片隔板
    for k in range(1, seg):
        a = a0 + (a1 - a0) * k / seg; x, z = cx + r * math.cos(a), cz + r * math.sin(a); rbox(shelf, x, z, -a + math.pi / 2, -0.01, 0.01, 0.08, h - 0.03, -d / 2, d / 2)
    nb = max(4, int((a1 - a0) * r / 0.45))                                               # 書：沿弧切成短直線段；內外兩面各一排，書背靠中間的隔板
    for k in range(nb):
        a = a0 + (a1 - a0) * (k + 0.5) / nb; L_ = (a1 - a0) * r / nb - 0.02
        for side in (-1, 1):                                                              # −1＝內側（書脊朝書房裡）、+1＝外側
            rr = r + side * d / 4; x, z = cx + rr * math.cos(a), cz + rr * math.sin(a)
            yaw = math.atan2(-math.cos(a), -math.sin(a)) if side < 0 else math.atan2(math.cos(a), math.sin(a))
            for y0, y1 in zip(lv, lv[1:] + [h - 0.03]): fill_books_line(x, z, yaw, L_ * (rr / r), y0, y1, d / 2 - 0.03)
# 東牆靠牆書架（2.4 m）、期刊架
for f in J['furniture']:
    if f['type'] == 'wallShelf':
        x, z0, z1, d, h = f['x'], f['z0'], f['z1'], f['d'], f['h']
        shelf.box(x + d / 2 - 0.03, x + d / 2, 0.0, h, z0, z1); shelfD.box(x - d / 2, x + d / 2, 0.0, 0.08, z0, z1); shelf.box(x - d / 2, x + d / 2, h - 0.03, h, z0, z1)
        lv = LEVELS(h)
        for y in lv[1:]: shelf.box(x - d / 2, x + d / 2, y - 0.022, y, z0, z1)
        nseg = round((z1 - z0) / 0.9)
        for k in range(nseg + 1): z = z0 + k * (z1 - z0) / nseg; shelf.box(x - d / 2, x + d / 2, 0.0, h, z - 0.012, z + 0.012)
        for k in range(nseg):
            zc = z0 + (k + 0.5) * (z1 - z0) / nseg
            for y0, y1 in zip(lv, lv[1:] + [h - 0.03]): fill_books_line(x, zc, -math.pi / 2, (z1 - z0) / nseg - 0.04, y0, y1, d - 0.06)
    elif f['type'] == 'periodicals':                                                      # 期刊架：斜的展示板＋雜誌封面（頂點色）
        x0, x1, z, d, h = f['x0'], f['x1'], f['z'], f['d'], f['h']
        shelf.box(x0, x1, 0.0, h, z + d / 2 - 0.03, z + d / 2); shelfD.box(x0, x1, 0.0, 0.08, z - d / 2, z + d / 2)
        for k in range(round((x1 - x0) / 1.0) + 1): xx = x0 + k * (x1 - x0) / round((x1 - x0) / 1.0); shelf.box(xx - 0.012, xx + 0.012, 0.0, h, z - d / 2, z + d / 2)
        for y in (0.35, 0.75, 1.15):
            for k in range(round((x1 - x0) / 0.27)):
                xx = x0 + 0.05 + k * 0.27
                if xx + 0.22 > x1: break
                rbox(books, xx + 0.11, z - 0.05, math.pi, -0.105, 0.105, y, y + 0.29, -0.006, 0.006, col=random.choice(BOOK + ['#e8e2d2', '#d9433a', '#2d6cae']))
            shelf.box(x0, x1, y - 0.02, y, z - d / 2, z + d / 2 - 0.03)

# ---------- 椅子、長桌、窗邊長桌 ----------
chairs = Mesh('soclib_chairs', M['bamboo']); seatf = Mesh('soclib_chair_seats', M['fabric'])
def chair(x, z, yaw):
    """竹椅：人物坐上去面向 yaw；座面 0.45 m、椅背在後面"""
    for lx in (-0.2, 0.2):
        for lz in (-0.19, 0.17): rbox(chairs, x, z, yaw, lx - 0.018, lx + 0.018, 0.0, 0.43, lz - 0.018, lz + 0.018)
    rbox(chairs, x, z, yaw, -0.23, 0.23, 0.41, 0.44, -0.22, 0.2); rbox(seatf, x, z, yaw, -0.21, 0.21, 0.44, 0.47, -0.2, 0.18)
    rbox(chairs, x, z, yaw, -0.23, 0.23, 0.6, 0.86, -0.24, -0.2)                         # 椅背（一片彎的竹板，近似成平板）
    for lx in (-0.2, 0.2): rbox(chairs, x, z, yaw, lx - 0.018, lx + 0.018, 0.44, 0.86, -0.23, -0.2)
LAMPS = []   # 閱覽長桌的檯燈頭（烘焙用）
tables = Mesh('soclib_tables', M['bamboo']); tabD = Mesh('soclib_tables_dark', M['bambooD']); lamps = Mesh('soclib_lamps', M['lamp']); metal = Mesh('soclib_metal', M['steel'])
for f in J['furniture']:
    if f['type'] == 'readingTable':
        x, z, w, d = f['x'], f['z'], f['w'], f['d']
        tables.box(x - w / 2, x + w / 2, 0.72, 0.76, z - d / 2, z + d / 2)
        for sx in (-1, 1): tabD.box(x + sx * (w / 2 - 0.12) - 0.04, x + sx * (w / 2 - 0.12) + 0.04, 0.0, 0.72, z - d / 2 + 0.08, z + d / 2 - 0.08)   # 板狀桌腳
        tabD.box(x - w / 2 + 0.12, x + w / 2 - 0.12, 0.5, 0.56, z - 0.03, z + 0.03)       # 橫撐
        tables.box(x - w / 2 + 0.1, x + w / 2 - 0.1, 0.76, 0.86, z - 0.04, z + 0.04)      # 中間的矮擋板（插座、檯燈）
        n = max(2, f['seats'] // 2)
        for i in range(n):
            lx = x - w / 2 + w / (2 * n) * (2 * i + 1)
            metal.cyl((lx, 0.86, z), (lx, 1.18, z), 0.012, seg=6); metal.box(lx - 0.03, lx + 0.03, 1.16, 1.2, z - 0.16, z + 0.16)   # 檯燈：細桿＋往兩邊伸的燈頭
            lamps.box(lx - 0.025, lx + 0.025, 1.155, 1.162, z - 0.15, z + 0.15); LAMPS.append((round(lx, 3), round(z, 3)))
    elif f['type'] == 'windowCounter':
        if f['side'] == 'north':
            x0, x1, z, d = f['x0'], f['x1'], f['z'], f['d']; tables.box(x0, x1, 0.72, 0.76, z - d / 2, z + d / 2)
            k = x0
            while k <= x1 + 1e-6: tabD.box(k - 0.03, k + 0.03, 0.0, 0.72, z - d / 2 + 0.05, z + d / 2 - 0.05); k += 2.4
        else:
            x, z0, z1, d = f['x'], f['z0'], f['z1'], f['d']; tables.box(x - d / 2, x + d / 2, 0.72, 0.76, z0, z1)
            k = z0
            while k <= z1 + 1e-6: tabD.box(x - d / 2 + 0.05, x + d / 2 - 0.05, 0.0, 0.72, k - 0.03, k + 0.03); k += 2.4
for s in J['seats']:
    if s['kind'] in ('table', 'window'): chair(s['x'], s['z'], s['yaw'])
# 閱報區：單人沙發＋矮桌
sofa = Mesh('soclib_sofas', M['fabric2'])
for s in J['seats']:
    if s['kind'] != 'lounge': continue
    x, z, yaw = s['x'], s['z'], s['yaw']
    rbox(sofa, x, z, yaw, -0.36, 0.36, 0.12, 0.42, -0.34, 0.32); rbox(sofa, x, z, yaw, -0.36, 0.36, 0.42, 0.85, -0.42, -0.26)
    for sx in (-1, 1): rbox(sofa, x, z, yaw, sx * 0.36 - 0.07, sx * 0.36 + 0.07, 0.12, 0.62, -0.42, 0.32)
    rbox(tabD, x, z, yaw, -0.32, 0.32, 0.0, 0.12, -0.38, 0.3)
for f in J['furniture']:
    if f['type'] == 'lounge':
        tables.cyl((f['x'], 0.38, f['z']), (f['x'], 0.42, f['z']), 0.42, seg=20); tabD.cyl((f['x'], 0.0, f['z']), (f['x'], 0.38, f['z']), 0.05, seg=8)

# ---------- 入口：閘門、玻璃欄杆、服務台、館員區、查詢電腦、新書展示台、還書箱 ----------
g = J['gates']; white = Mesh('soclib_white', M['white']); glass = Mesh('soclib_glass_parts', M['glass']); black = Mesh('soclib_black', M['black']); screen = Mesh('soclib_screens', M['screen'])
for px in g['posts']:
    white.box(px - g['postW'] / 2, px + g['postW'] / 2, 0.0, 1.0, g['z'] - g['postD'] / 2, g['z'] + g['postD'] / 2)
    black.box(px - g['postW'] / 2 + 0.03, px + g['postW'] / 2 - 0.03, 1.0, 1.012, g['z'] - g['postD'] / 2 + 0.05, g['z'] + 0.1)
for a, b in zip(g['posts'], g['posts'][1:]):                                              # 閘門的玻璃翼板（開著：往兩邊收）
    for px, sg in ((a, 1), (b, -1)): glass.quad([(px + sg * g['postW'] / 2, 0.35, g['z']), (px + sg * (g['postW'] / 2 + 0.28), 0.35, g['z']), (px + sg * (g['postW'] / 2 + 0.28), 0.95, g['z']), (px + sg * g['postW'] / 2, 0.95, g['z'])])
for a, b in g['rails']:                                                                    # 閘門兩邊的玻璃欄杆（1.0 m）
    glass.quad([(a, 0.08, g['z']), (b, 0.08, g['z']), (b, 1.0, g['z']), (a, 1.0, g['z'])])
    metal.box(a, b, 1.0, 1.04, g['z'] - 0.03, g['z'] + 0.03); metal.box(a, b, 0.0, 0.08, g['z'] - 0.03, g['z'] + 0.03)
    k = a
    while k <= b + 1e-6: metal.box(k - 0.025, k + 0.025, 0.0, 1.04, g['z'] - 0.03, g['z'] + 0.03); k += 1.2
dk = J['desk']; x0, x1, z0, z1 = dk['x0'], dk['x1'], dk['z0'], dk['z1']
tables.box(x0, x1, 0.0, 1.02, z0, z0 + 0.05); white.box(x0 - 0.04, x1 + 0.04, 1.02, 1.07, z0 - 0.06, z1); white.box(x0, x1, 0.0, 0.74, z1 - 0.05, z1)
white.box(x0, x1, 0.72, 0.76, z0 + 0.05, z1)                                               # 館員那一側的工作檯面
for xx in (x0 + 1.0, x1 - 1.4):
    black.box(xx - 0.28, xx + 0.28, 0.8, 1.15, z0 + 0.45, z0 + 0.48); screen.box(xx - 0.26, xx + 0.26, 0.82, 1.13, z0 + 0.445, z0 + 0.45); black.box(xx - 0.04, xx + 0.04, 0.76, 0.8, z0 + 0.42, z0 + 0.52)
    black.box(xx - 0.15, xx + 0.15, 1.07, 1.08, z0 - 0.04, z0 + 0.12)                     # 櫃台上的感應板（借還書）
st = dk['staff']
for (a0, a1, zz) in ((x0 - 1.0, x0, z0 + 0.4), (x1, x1 + 1.0, z0 + 0.4)): tables.box(a0, a1, 0.0, 1.2, zz - 0.04, zz + 0.04)   # 館員區兩邊的矮隔板
tables.box(x0 - 1.04, x0 - 0.96, 0.0, 1.2, z0 + 0.4, st['z1']); tables.box(x1 + 0.96, x1 + 1.04, 0.0, 1.2, z0 + 0.4, st['z1'])
for f in J['furniture']:
    t = f['type']
    if t == 'opac':
        for i in range(f['n']):
            xx = f['x'] - 0.45 * (f['n'] - 1) + 0.9 * i
            white.box(xx - 0.3, xx + 0.3, 0.0, 0.95, f['z'] - 0.25, f['z'] + 0.25); black.box(xx - 0.24, xx + 0.24, 0.98, 1.3, f['z'] - 0.1, f['z'] - 0.07)
            screen.box(xx - 0.22, xx + 0.22, 1.0, 1.28, f['z'] - 0.101, f['z'] - 0.098); black.box(xx - 0.03, xx + 0.03, 0.95, 1.0, f['z'] - 0.1, f['z'] - 0.04)
            black.box(xx - 0.2, xx + 0.2, 0.95, 0.965, f['z'] + 0.0, f['z'] + 0.16)          # 鍵盤
    elif t == 'display':
        x, z, w, d = f['x'], f['z'], f['w'], f['d']
        tables.box(x - w / 2, x + w / 2, 0.68, 0.72, z - d / 2, z + d / 2); tabD.box(x - w / 2 + 0.06, x + w / 2 - 0.06, 0.0, 0.68, z - d / 2 + 0.06, z + d / 2 - 0.06)
        for i in range(7):                                                                 # 平放的新書＋幾本立著的
            bx = x - w / 2 + 0.22 + i * (w - 0.44) / 6; bz = z + (0.18 if i % 2 else -0.18)
            rbox(books, bx, bz, random.uniform(-0.3, 0.3), -0.1, 0.1, 0.72, 0.745, -0.14, 0.14, col=random.choice(BOOK))
            if i % 3 == 1: rbox(books, bx, z, math.pi, -0.09, 0.09, 0.745, 0.99, -0.015, 0.015, col=random.choice(BOOK))
    elif t == 'returnBox':
        rbox(metal, f['x'], f['z'], f['ry'], -0.35, 0.35, 0.0, 1.05, -0.3, 0.3); rbox(black, f['x'], f['z'], f['ry'], -0.22, 0.22, 0.86, 0.92, 0.3, 0.31)
# 招牌（字由遊戲 canvas 畫：SIGN_FACE）
SIGNS = []
for s in J['signs']:
    sm = Mesh(f'WALL_front_SIGN_FACE_{len(SIGNS)}', M['board']); w = s['w']
    sm.quad([(s['x'] + w / 2, s['y'] - 0.3, s['z']), (s['x'] - w / 2, s['y'] - 0.3, s['z']), (s['x'] - w / 2, s['y'] + 0.3, s['z']), (s['x'] + w / 2, s['y'] + 0.3, s['z'])])
    SIGNS.append((sm, {'dir': DIRS['front'], 'sign': s['text']}))

for m in (shelf, shelfD, tables, tabD, chairs, seatf, sofa, lamps, metal, white, glass, black, screen):
    ob = m.finish(root)
for m in (books,): m.finish(root, uv=False)
# 會淡出的牆
for side, ms in walls.items():
    for m in ms:
        m.name = f'WALL_{m.name}'; m.finish(root, uv=True, props={'dir': DIRS[side]})
for sm, props in SIGNS: sm.finish(root, uv=False, props=props)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')

tris = {}
for ob in root.children_recursive:
    if ob.type != 'MESH': continue
    me = ob.data; me.calc_loop_triangles(); tris[ob.name] = len(me.loop_triangles)
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。
# 封閉的殼直接單面；開口的零件（牆面、葉片卡、薄板）補反面，看起來和原本一樣；玻璃照舊雙面；遊戲照名字接手的板面（*_FACE_*）不動網格
# 開口但背面看不到的不補：書（書背朝走道，後面是書架背板）、天花板（只從下面看）
_ss = L.single_side(root, keep=r'glass', nodup=r'^(soclib_books|soclib_ceiling|soclib_downlights|soclib_uplights)', skip=lambda ob: 'FACE' in ob.name)
M['board'].use_backface_culling = True   # 招牌板面照舊單面（10-25 交的就是單面：板面朝閱覽室，從室內看）——lib2 10-27 起「只有 skip 的物件在用的材質照舊雙面」，不寫這行會變雙面（跟著南牆淡出時要畫兩次）
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
st = L.export(OUT)
info = dict(st, tris_by_object=dict(sorted(tris.items(), key=lambda kv: -kv[1])), columns=len(J['columns']), skylights=len(J['skylights']), seats=len(J['seats']),
            lights={'down': DOWN, 'up': UP, 'lamps': LAMPS, 'H': H, 'note': '筒燈（天花板下 8 mm）、荷葉上照燈（荷葉頂面）、閱覽桌檯燈頭（1.155 m）；lightbake/bake_soclib.sh 讀這裡'})
L.write_json(OUT[:-4] + '.json', info)
print('tris total', sum(tris.values()))

if arg('--preview'):
    os.makedirs(arg('--preview'), exist_ok=True)
    views = [['entrance', [-9.0, 1.6, 9.0], [-2, 2.6, -6], 32], ['grove', [3.6, 1.55, -0.8], [6.0, 1.0, 1.6], 26], ['grove1', [2.2, 1.6, -5.4], [5.3, 1.1, -5.6], 26],
             ['tables', [-12.6, 1.7, 4.2], [-4, 1.3, -4], 28], ['up', [0.0, 1.5, -1.0], [2, 6, -3], 18], ['window', [8.0, 1.75, -7.6], [-4.0, 0.9, -10.2], 30]]
    json.dump(views, open(os.path.join(arg('--preview'), 'views.json'), 'w'))
