"""總圖書館 3F 閱覽區（遊戲 library 區域：room() 22×16×4.0 m）正式模型 → GLB。第二 AI 工作階段（環境美術）製作，LAWWW 佇列 ⑪。
  /opt/blenv/bin/python tools/blender/env_second/library_3f.py [-- --out assets/models/env/second_ai/library_3f.glb]
座標＝遊戲 library 區域的座標（x 往東、z 往南、y 往上；房間 x −11～11、z −8～8、高 4.0；後牆 z=−8 有四扇窗，前牆 z=+8 中間是樓梯間的門）。
只換畫面：導航、座位（36 張椅子；劇情用 seats[0..2]）、互動點（坐下讀書、樓梯間 (0,7.6)、電梯）都在 src/zones3d.js 的 library 區塊與 src/library3d.js，不變。
  家具的位置和大小照 zones3d.js：長桌 desk(x ±4；z −3／0.6／4.2；5×1.2，桌面 0.77)、椅子 chair(x−1.6+1.6i, z±0.9)、
  書架 shelfWall(±9, −7.6, 長 10)（後牆：導航擋 x ±4～±11、z −7.95～−7.25）、shelfWall(−10.8, 0, 轉 90°, 長 12)（西牆：z −6～6）。
  後牆的書架做成窗下的矮書櫃（0.95 m：導航範圍一樣，四扇窗都看得到）；西牆是整面 2.4 m 高的書架。
窗：room() 的四扇窗（後牆 x −8.25、−2.75、2.75、8.25，中心高 2.1）——這裡挖 2.2×2.0 m 的窗洞（y 1.05–3.05）；窗外的景是遊戲的 library_3f 照片（attachRoomGLB 放在玻璃外面）。
不做：電梯（library3d.js 程序化、會動；東牆 x 8.6–11、z −2.2～1.4 不放東西）、窗外的景、點地面用的透明地板、桌上的水瓶／包包／杯子（遊戲的 PROP）。
材質和 LAWWW 的總圖大廳（tools/blender/library_interior.py）一致：人字拼木地板、米色粉光牆＋胡桃木牆裙、胡桃木長桌與書架、淺色實木椅、黃銅檯燈＋綠燈罩、礦纖天花板。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）；玻璃也放在 WALL_ 裡（半透明材質：attachRoomGLB 當窗的零件，固定透明）。
書：一層書櫃的一個開間做成一個「書模組」，每一格放一個（GPU instancing）；書背圖集 lib3f_atlas.py（一般的書名、索書號）。
真實性：沒有照片或平面圖，是遊戲化設計（D43）。"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/library_3f.glb'))
GEN = os.path.join(HERE, 'textures', 'gen'); ATL = json.load(open(os.path.join(GEN, 'lib3f_books.json')))

W, D, H, T = 22.0, 16.0, 4.0, 0.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
XI0, XI1, ZI0, ZI1 = X0 + T / 2, X1 - T / 2, Z0 + T / 2, Z1 - T / 2          # 牆的內面
WINX, WHW, WY0, WY1, WTR = [-8.25, -2.75, 2.75, 8.25], 1.1, 1.05, 3.05, 2.45   # 窗：中心 x、半寬、下緣、上緣、橫櫺
DX, DY = 0.95, 2.4                                                             # 樓梯間的門洞（前牆中間）：x ±0.95、高 2.4
ELEV = (8.6, XI1, -2.2, 1.4)                                                   # 電梯（程序化）和門前的空間：不放東西
TABLES = [(-4 + 8 * c, -3 + 3.6 * r) for r in range(3) for c in range(2)]     # 照 zones3d.js 的順序（r 外圈、c 內圈）
TW, TD, TOP = 5.0, 1.2, 0.77
SEATS = []
for (tx, tz) in TABLES:
    for i in range(3):
        for s in (-1, 1): SEATS.append((tx - 1.6 + i * 1.6, tz + s * 0.9, math.pi if s > 0 else 0.0))
CASES = [('back', -10.9, -4.0, 0.95, 0.45, 2, 'low'), ('back', 4.0, 10.9, 0.95, 0.45, 2, 'low'), ('left', -6.0, 6.0, 2.4, 0.4, 5, 'tall')]
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0], 'ceil': [0, -1, 0]}   # ceil：天花板的輕鋼架、燈框（往室內＝往下：鏡頭比它高時和牆一樣藏起來）
random.seed(311)
B.reset(texres=512)
root = B.group('library_3f', props={'kind': 'library_3f', 'w': W, 'd': D, 'h': H})

# ---------------- 材質 ----------------
def img_mat(name, png, rough=0.7, emit=False):
    m = L.flat(name, '#ffffff', rough=rough); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, png))
    nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    m['tile'] = 1.0; return m

M = {
    'floor': L.pbr('l3_parquet', 'herringbone_parquet', tile=1.8, target='#cdb594', sat=0.8, normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.55),   # 淺色人字拼（使用者 10-23：不要深色木地板，整個遊戲都不要；顏色同宿舍四人房 #cdb594；原本 #a07a55）
    'plaster': img_mat('l3_plaster', 'l3_plaster.png', rough=0.9),   # Poly Haven white_plaster_02 的變化只留 22%（lib3f_atlas.py 旁邊產生）：原圖在大片牆上像水漬
    'walnut': L.pbr('l3_walnut', 'walnut_veneer', tile=1.2, target='#6b4a33', maps=('diff',), res=512, rough_value=0.5),
    'top': L.pbr('l3_tabletop', 'walnut_veneer', tile=1.4, target='#7d5a3e', maps=('diff',), res=512, rough_value=0.38),
    'chairwood': L.pbr('l3_chair_wood', 'walnut_veneer', tile=0.8, target='#9c7552', maps=('diff',), res=256, rough_value=0.55),   # fine_grained_wood 在椅子上像軟木塞（第一版的渲染）
    'ceil': L.pbr('l3_ceiling', 'ceiling_interior', tile=0.6, target='#eeede9', sat=0.0, normal=0.25, maps=('diff', 'nor'), rough_value=0.9, cull=True),
    'seat': L.flat('l3_seat_fabric', '#34493d', rough=0.9),
    'tbar': L.flat('l3_ceiling_grid', '#dcdcd8', rough=0.5),   # 輕鋼架、燈框：方盒照舊，整組放在 WALL_ceil_tbar（dir 朝下）：鏡頭拉到最遠最陡、比天花板高時藏起來（LAWWW2 10-22 第二版：只留底面的話從下面平視看遠處會不見）
    'light': L.flat('l3_light_panel', '#fff6e4', rough=0.9, emit=B.srgb('#fff4dc'), cull=True),
    'cornice': L.flat('l3_cornice', '#e9e2d3', rough=0.8),
    'base': L.flat('l3_baseboard', '#3a2a1e', rough=0.6),
    'frame': L.flat('l3_window_frame', '#3a3d40', rough=0.45, metal=0.3),
    'glass': L.flat('l3_glass', '#c4d6dc', rough=0.05, alpha=0.22),
    'frost': L.flat('l3_glass_frosted', '#eef2f3', rough=0.3, alpha=0.62),
    'blind': L.flat('l3_blind', '#e8e2d4', rough=0.85),
    'brass': L.flat('l3_brass', '#b8913f', rough=0.35, metal=0.45),
    'shade': L.flat('l3_lampshade', '#2f5d50', rough=0.3),
    'glow': L.flat('l3_lamp_glow', '#fff1d6', rough=0.5, emit=B.srgb('#ffe9c4')),
    'steel': L.flat('l3_steel', '#c9ccd0', rough=0.28, metal=0.45),
    'white': L.flat('l3_white', '#f2f1ec', rough=0.4),
    'black': L.flat('l3_black', '#222428', rough=0.4),
    'red': L.flat('l3_red', '#b8312f', rough=0.4),
    'grille': L.flat('l3_ac_grille', '#e2e2de', rough=0.6),
    'signback': L.flat('l3_sign_back', '#24303a', rough=0.6),
    'bc0': L.flat('l3_bookcover_0', '#7b2e2a', rough=0.6), 'bc1': L.flat('l3_bookcover_1', '#2f4f6f', rough=0.6),
    'bc2': L.flat('l3_bookcover_2', '#d8cfb8', rough=0.6), 'bc3': L.flat('l3_bookcover_3', '#3f5d3a', rough=0.6),
    'paper': L.flat('l3_paper', '#f4f1e8', rough=0.9),
    'book': img_mat('l3_book_atlas', 'lib3f_books.png', rough=0.62),
    'sign': img_mat('l3_signs', 'lib3f_signs.png', rough=0.55),
    'exit': img_mat('l3_exit_sign', 'lib3f_signs.png', rough=0.5, emit=True),
}

M['plaster']['tile'] = 2.5   # 粉光貼圖每 2.5 m 重複一次

# ---------------- 網格累積器：同一個材質合成一個網格 ----------------
MESH, WMESH = {}, {}
def mk(key):
    if key not in MESH: MESH[key] = Mesh(f'l3_{key}', M[key])
    return MESH[key]
def wm(side, key):
    """牆、貼在牆上的東西（名字含 WALL_，自訂屬性 dir：跟著牆一起淡出）"""
    k = (side, key)
    if k not in WMESH: WMESH[k] = Mesh(f'WALL_{side}_{key}', M[key])
    return WMESH[k]
class UM(Mesh):
    """自己給 UV 的網格（書、牌子）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.uv = self.bm.loops.layers.uv.verify()
    def face(self, pts, uvs):
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(f.loops, uvs): lp[self.uv].uv = uv
        return f
WUM = {}
def wum(side, key):
    k = (side, key)
    if k not in WUM: WUM[k] = UM(f'WALL_{side}_{key}', M[key])
    return WUM[k]

def xf(cx, cy, cz, yaw=0.0, pitch=0.0):
    """區域座標 → 遊戲座標：先繞本地 x 轉 pitch，再繞 y 轉 yaw（前＝(sin yaw, cos yaw)、右＝(cos yaw, −sin yaw)）"""
    s, c, sp, cp = math.sin(yaw), math.cos(yaw), math.sin(pitch), math.cos(pitch)
    def f(lx, ly, lz):
        y_, z_ = ly * cp - lz * sp, ly * sp + lz * cp
        return (cx + lx * c + z_ * s, cy + y_, cz - lx * s + z_ * c)
    return f
QUADS = {'-x': [(0, 0, 0), (0, 0, 1), (0, 1, 1), (0, 1, 0)], '+x': [(1, 0, 1), (1, 0, 0), (1, 1, 0), (1, 1, 1)],
         '-y': [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)], '+y': [(0, 1, 1), (1, 1, 1), (1, 1, 0), (0, 1, 0)],
         '-z': [(1, 0, 0), (0, 0, 0), (0, 1, 0), (1, 1, 0)], '+z': [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)]}
def tbox(m, f, lx0, lx1, ly0, ly1, lz0, lz1, faces=None):
    bm = m.bm; V = {}
    for i, lx in enumerate((lx0, lx1)):
        for j, ly in enumerate((ly0, ly1)):
            for k, lz in enumerate((lz0, lz1)): V[(i, j, k)] = bm.verts.new(g2b(*f(lx, ly, lz)))
    return [bm.faces.new([V[q] for q in QUADS[k]]) for k in (faces or QUADS.keys())]
def hquad(m, x0, x1, z0, z1, y, down=True):
    p = [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]
    m.quad(p if down else p[::-1])

# 牆的座標：a＝沿牆、d＝從牆的內面往室內
def on_wall(m, side, a0, a1, y0, y1, d0, d1):
    if side == 'back': m.box(a0, a1, y0, y1, ZI0 + d0, ZI0 + d1)
    elif side == 'front': m.box(a0, a1, y0, y1, ZI1 - d1, ZI1 - d0)
    elif side == 'left': m.box(XI0 + d0, XI0 + d1, y0, y1, a0, a1)
    else: m.box(XI1 - d1, XI1 - d0, y0, y1, a0, a1)
def wall_quad(m, side, a0, a1, y0, y1, d):
    """貼在牆面前 d 的平面（朝室內），UV 由呼叫端給（UM）或沒有"""
    if side == 'back': return [(a0, y0, ZI0 + d), (a1, y0, ZI0 + d), (a1, y1, ZI0 + d), (a0, y1, ZI0 + d)]
    if side == 'front': return [(a1, y0, ZI1 - d), (a0, y0, ZI1 - d), (a0, y1, ZI1 - d), (a1, y1, ZI1 - d)]
    if side == 'left': return [(XI0 + d, y0, a1), (XI0 + d, y0, a0), (XI0 + d, y1, a0), (XI0 + d, y1, a1)]
    return [(XI1 - d, y0, a0), (XI1 - d, y0, a1), (XI1 - d, y1, a1), (XI1 - d, y1, a0)]

# ================= 地板、天花板 =================
mk('floor').box(XI0, XI1, -0.03, 0.0, ZI0, ZI1)
hquad(mk('ceil'), XI0, XI1, ZI0, ZI1, H)
gx = XI0 + 0.25
while gx < XI1 - 0.1:                                                          # 輕鋼架（60 cm）
    wm('ceil', 'tbar').box(gx - 0.012, gx + 0.012, H - 0.012, H, ZI0, ZI1); gx += 0.6
gz = ZI0 + 0.1
while gz < ZI1 - 0.1:
    wm('ceil', 'tbar').box(XI0, XI1, H - 0.012, H, gz - 0.012, gz + 0.012); gz += 0.6
for (tx, tz) in TABLES:                                                        # 長桌正上方一條長燈（沿桌子長邊）
    wm('ceil', 'tbar').box(tx - 2.24, tx + 2.24, H - 0.03, H - 0.006, tz - 0.16, tz + 0.16)
    hquad(mk('light'), tx - 2.2, tx + 2.2, tz - 0.12, tz + 0.12, H - 0.031)
for (cx, cz) in [(0.0, -5.4), (0.0, -1.2), (0.0, 2.4), (0.0, 6.2), (-8.6, 6.4), (8.6, 6.4), (-8.4, -5.8), (8.4, -5.8), (-8.4, 0.6), (-8.4, 3.0), (7.6, 3.6), (7.6, -4.2)]:   # 走道的方燈
    wm('ceil', 'tbar').box(cx - 0.64, cx + 0.64, H - 0.02, H - 0.004, cz - 0.34, cz + 0.34)
    hquad(mk('light'), cx - 0.6, cx + 0.6, cz - 0.3, cz + 0.3, H - 0.021)
for (cx, cz) in [(-4.0, -5.2), (4.0, -5.2), (-4.0, 6.4), (4.0, 6.4), (0.0, 0.6)]:   # 冷氣出風口（方形、四方向的格柵）
    g = mk('grille'); g.box(cx - 0.3, cx + 0.3, H - 0.025, H - 0.005, cz - 0.3, cz + 0.3)
    for k in range(1, 4): g.box(cx - 0.3 + k * 0.15 - 0.008, cx - 0.3 + k * 0.15 + 0.008, H - 0.04, H - 0.025, cz - 0.27, cz + 0.27)
for (cx, cz) in [(-6.0, -1.2), (6.0, -1.2), (-6.0, 4.0), (6.0, 4.0), (0.0, -6.6)]:   # 偵煙器
    mk('white').cyl((cx, H - 0.035, cz), (cx, H, cz), 0.055, seg=12)

# ================= 牆（窗洞、門洞）＋牆裙、壁柱、上緣線腳 =================
def wall_box(side, a0, a1, y0, y1):
    if a1 - a0 < 0.005 or y1 - y0 < 0.005: return
    m = wm(side, 'plaster')
    if side == 'back': m.box(a0, a1, y0, y1, Z0 - T / 2, Z0 + T / 2)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - T / 2, Z1 + T / 2)
    elif side == 'left': m.box(X0 - T / 2, X0 + T / 2, y0, y1, a0, a1)
    else: m.box(X1 - T / 2, X1 + T / 2, y0, y1, a0, a1)
HOLES = {'back': [(c - WHW, c + WHW, WY0, WY1) for c in WINX], 'front': [(-DX, DX, 0.0, DY)], 'left': [], 'right': []}
SPAN = {'back': (X0 - T / 2, X1 + T / 2), 'front': (X0 - T / 2, X1 + T / 2), 'left': (ZI0 - 0.1, ZI1 + 0.1), 'right': (ZI0 - 0.1, ZI1 + 0.1)}
for side in ('back', 'front', 'left', 'right'):
    a0, a1 = SPAN[side]; cur = a0
    for (ha, hb, hy0, hy1) in HOLES[side]:
        wall_box(side, cur, ha, 0.0, H); wall_box(side, ha, hb, 0.0, hy0); wall_box(side, ha, hb, hy1, H); cur = hb
    wall_box(side, cur, a1, 0.0, H)

def cut(a0, a1, gaps):
    """把 [a0,a1] 扣掉 gaps 裡的區間"""
    out = [(a0, a1)]
    for (g0, g1) in gaps:
        nxt = []
        for (p, q) in out:
            if g1 <= p or g0 >= q: nxt.append((p, q)); continue
            if g0 > p: nxt.append((p, g0))
            if g1 < q: nxt.append((g1, q))
        out = nxt
    return [(p, q) for (p, q) in out if q - p > 0.02]
INNER = {'back': (XI0, XI1), 'front': (XI0, XI1), 'left': (ZI0, ZI1), 'right': (ZI0, ZI1)}
WAINS_GAPS = {'back': [(-10.95, -3.98), (3.98, 10.95)], 'front': [(-DX - 0.1, DX + 0.1)], 'left': [(-6.02, 6.02)], 'right': []}
for side in ('back', 'front', 'left', 'right'):
    a0, a1 = INNER[side]
    for (p, q) in cut(a0, a1, WAINS_GAPS[side]):                               # 胡桃木牆裙（0.1–1.0 m）＋腰帶＋直條；深色踢腳板
        on_wall(wm(side, 'walnut'), side, p, q, 0.1, 0.98, 0.0, 0.018)
        on_wall(wm(side, 'walnut'), side, p, q, 0.98, 1.04, 0.0, 0.045)
        on_wall(wm(side, 'base'), side, p, q, 0.0, 0.1, 0.0, 0.025)
        n = max(1, round((q - p) / 1.2))
        for k in range(1, n): a = p + (q - p) * k / n; on_wall(wm(side, 'walnut'), side, a - 0.03, a + 0.03, 0.1, 0.98, 0.018, 0.03)
    on_wall(wm(side, 'cornice'), side, a0, a1, 3.84, 3.9, 0.0, 0.06); on_wall(wm(side, 'cornice'), side, a0, a1, 3.9, 3.96, 0.0, 0.11)   # 上緣線腳（兩段）
PIL = {'back': [-5.5, 5.5], 'front': [-5.5, 5.5], 'right': [-5.3, 5.3], 'left': []}     # 壁柱（牆裙以上到線腳）；後牆中間是「3F 閱覽區」的牌子，不放
for side, xs in PIL.items():
    for a in xs:
        y0 = 1.04 if not (side == 'back' and abs(a) > 3.9) else 0.97
        on_wall(wm(side, 'cornice'), side, a - 0.26, a + 0.26, y0, 3.84, 0.0, 0.06)
        on_wall(wm(side, 'cornice'), side, a - 0.3, a + 0.3, 3.7, 3.84, 0.0, 0.08)   # 柱頭

# ---- 窗：鋁框（深古銅色）、中間直櫺、上面一道橫櫺（上面是氣窗）、玻璃、木窗台、捲簾（拉下到橫櫺） ----
for c in WINX:
    a0, a1 = c - WHW, c + WHW; fr = wm('back', 'frame')
    for (p, q) in ((a0, a0 + 0.05), (a1 - 0.05, a1), (c - 0.025, c + 0.025)): fr.box(p, q, WY0, WY1, Z0 - 0.04, Z0 + 0.04)
    for (y0, y1) in ((WY0, WY0 + 0.05), (WY1 - 0.05, WY1), (WTR - 0.025, WTR + 0.025)): fr.box(a0, a1, y0, y1, Z0 - 0.04, Z0 + 0.04)
    gl = wm('back', 'glass'); gl.quad([(a0, WY0, Z0), (a1, WY0, Z0), (a1, WY1, Z0), (a0, WY1, Z0)])
    on_wall(wm('back', 'walnut'), 'back', a0 - 0.06, a1 + 0.06, WY0 - 0.05, WY0, -0.02, 0.24)          # 窗台（往室內 0.24）
    bl = wm('back', 'blind'); bl.box(a0 - 0.02, a1 + 0.02, WY1 + 0.02, WY1 + 0.1, ZI0 + 0.0, ZI0 + 0.07)   # 捲簾盒
    bl.quad([(a0 + 0.02, WTR + 0.03, ZI0 + 0.035), (a1 - 0.02, WTR + 0.03, ZI0 + 0.035), (a1 - 0.02, WY1 + 0.02, ZI0 + 0.035), (a0 + 0.02, WY1 + 0.02, ZI0 + 0.035)])
    wm('back', 'frame').box(a0 + 0.02, a1 - 0.02, WTR + 0.01, WTR + 0.04, ZI0 + 0.025, ZI0 + 0.045)    # 捲簾下緣的壓條

# ---- 樓梯間的門（前牆中間；雙開、關著：上半霧面玻璃、下半木板、推桿）＋門框 ----
dd = wm('front', 'walnut'); z0d, z1d = ZI1 - 0.01, ZI1 + 0.035
for (p, q) in ((-DX - 0.09, -DX), (DX, DX + 0.09)): on_wall(dd, 'front', p, q, 0.0, DY + 0.09, 0.0, 0.03)   # 門框（室內側）
on_wall(dd, 'front', -DX - 0.09, DX + 0.09, DY, DY + 0.09, 0.0, 0.03)
for (p, q) in ((-DX, -0.004), (0.004, DX)):
    for (a, b) in ((p, p + 0.12), (q - 0.12, q)): dd.box(a, b, 0.0, DY - 0.01, z0d, z1d)
    for (y0, y1) in ((0.0, 0.24), (1.02, 1.12), (DY - 0.13, DY - 0.01)): dd.box(p + 0.12, q - 0.12, y0, y1, z0d, z1d)
    dd.box(p + 0.12, q - 0.12, 0.24, 1.02, z0d + 0.012, z1d - 0.012)                                    # 下半木板（凹一點）
    wm('front', 'frost').quad([(q - 0.12, 1.12, ZI1 + 0.0), (p + 0.12, 1.12, ZI1 + 0.0), (p + 0.12, DY - 0.13, ZI1 + 0.0), (q - 0.12, DY - 0.13, ZI1 + 0.0)])
    st = wm('front', 'steel')
    for x_ in (p + 0.2, q - 0.2): st.box(x_ - 0.015, x_ + 0.015, 0.98, 1.06, ZI1 - 0.07, z0d)            # 推桿的支架
    st.cyl((p + 0.2, 1.02, ZI1 - 0.07), (q - 0.2, 1.02, ZI1 - 0.07), 0.018, seg=8)
    wm('front', 'steel').box(p + 0.14, q - 0.14, 0.03, 0.2, ZI1 - 0.012, z0d)                            # 踢板

# ---- 牌子（lib3f_signs.png）：出口標示燈（門上）、樓梯間、請保持安靜、3F 閱覽區（後牆中間）、閱覽須知（東牆） ----
SG = ATL['signs']; SS = ATL['signs_size']
def suv(key, inset=2.0):
    x0, y0, x1, y1 = SG[key]; return [((x0 + inset) / SS[0], 1 - (y1 - inset) / SS[1]), ((x1 - inset) / SS[0], 1 - (y1 - inset) / SS[1]),
                                     ((x1 - inset) / SS[0], 1 - (y0 + inset) / SS[1]), ((x0 + inset) / SS[0], 1 - (y0 + inset) / SS[1])]
def plaque(side, key, a, yc, w, h, dp=0.025, mat='sign', back=True):
    if back: on_wall(wm(side, 'signback'), side, a - w / 2 - 0.02, a + w / 2 + 0.02, yc - h / 2 - 0.02, yc + h / 2 + 0.02, 0.0, dp)
    pts = wall_quad(None, side, a - w / 2, a + w / 2, yc - h / 2, yc + h / 2, dp + 0.002)
    wum(side, mat).face(pts, suv(key))   # wall_quad 的頂點順序＝從室內看的左下、右下、右上、左上（四面牆都一樣）
on_wall(wm('front', 'white'), 'front', -0.3, 0.3, 2.54, 2.84, 0.0, 0.06)                                   # 出口標示燈的燈箱
plaque('front', 'exit', 0.0, 2.69, 0.5, 0.25, dp=0.06, mat='exit', back=False)
plaque('front', 'stairs', 1.62, 1.86, 0.6, 0.15)
plaque('front', 'quiet', -3.0, 1.7, 0.84, 0.21)
plaque('back', 'floor', 0.0, 3.36, 1.4, 0.35)
plaque('right', 'rules', -5.0, 1.72, 0.9, 0.45)
plaque('left', 'ref', 0.0, 2.72, 0.9, 0.225, dp=0.02)                                                      # 西牆書架上方
# 時鐘（前牆、門的東邊上方）
cx_, cy_ = 3.4, 2.95
wm('front', 'black').cyl((cx_, cy_, ZI1), (cx_, cy_, ZI1 - 0.04), 0.19, seg=24)                    # 外框
wm('front', 'white').cyl((cx_, cy_, ZI1 - 0.04), (cx_, cy_, ZI1 - 0.044), 0.17, seg=24)            # 鐘面
for k in range(12):                                                                              # 刻度
    a = 2 * math.pi * k / 12; r0, r1 = (0.13, 0.16) if k % 3 else (0.115, 0.16)
    ca, sa = math.cos(a), math.sin(a); wd_ = 0.006
    wm('front', 'black').quad([(cx_ + ca * r0 + sa * wd_, cy_ + sa * r0 - ca * wd_, ZI1 - 0.046), (cx_ + ca * r0 - sa * wd_, cy_ + sa * r0 + ca * wd_, ZI1 - 0.046),
                               (cx_ + ca * r1 - sa * wd_, cy_ + sa * r1 + ca * wd_, ZI1 - 0.046), (cx_ + ca * r1 + sa * wd_, cy_ + sa * r1 - ca * wd_, ZI1 - 0.046)])
hb = wm('front', 'black')
for (ang, ln, wd) in ((math.radians(60), 0.09, 0.012), (math.radians(-30), 0.14, 0.008)):          # 時針、分針（約兩點）
    ca, sa = math.cos(ang), math.sin(ang); px, py = -sa * wd, ca * wd
    hb.quad([(cx_ - px, cy_ - py, ZI1 - 0.05), (cx_ + px, cy_ + py, ZI1 - 0.05), (cx_ + px + ca * ln, cy_ + py + sa * ln, ZI1 - 0.05), (cx_ - px + ca * ln, cy_ - py + sa * ln, ZI1 - 0.05)][::-1])
# 滅火器箱（前牆東端，嵌在牆裡：紅框、白色面板）
on_wall(wm('front', 'red'), 'front', 9.6, 10.2, 0.3, 1.1, 0.0, 0.03); on_wall(wm('front', 'white'), 'front', 9.66, 10.14, 0.36, 1.04, 0.03, 0.035)

# ================= 書櫃、書 =================
REG = ATL['regions']; AW, AH = ATL['size']; PG = ATL['pages']; SWT = ATL['swatch']
def uvr(px, inset=1.0):
    x0, y0, x1, y1 = px; return ((x0 + inset) / AW, 1 - (y1 - inset) / AH, (x1 - inset) / AW, 1 - (y0 + inset) / AH)
LM = 0.92
def book_module(name, picks, seed, hrange, wrange, drange, fill=1.0, bookend=False):
    """一層、一個開間的書：沿本地 x 排，書背在 z=0 朝 +z，往 −z 是書的深度；只做書背、頂面、露出來的側面"""
    rnd = random.Random(seed); m = UM(name, M['book']); books = []; x = -LM / 2 + 0.006; end = -LM / 2 + LM * fill
    while x < end - 0.015:
        if rnd.random() < 0.035: x += rnd.uniform(0.02, 0.07); continue
        reg = picks(rnd); w = rnd.uniform(*wrange); h = rnd.uniform(*hrange); d = rnd.uniform(*drange)
        if x + w > end: break
        books.append([x, x + w, h, d, reg]); x += w + rnd.uniform(0.0, 0.0025)
    pg = uvr(PG, 2.0); st = uvr(SWT['steel'], 2.0)
    for i, (xa, xb, h, d, reg) in enumerate(books):
        u0, v0, u1, v1 = uvr(reg, 1.0)
        m.face([(xa, 0, 0), (xb, 0, 0), (xb, h, 0), (xa, h, 0)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
        m.face([(xa, h, 0), (xb, h, 0), (xb, h, -d), (xa, h, -d)], [(pg[0], pg[1]), (pg[2], pg[1]), (pg[2], pg[3]), (pg[0], pg[3])])
        us = (u0, u0 + 1.5 / AW)
        Lb = books[i - 1] if i > 0 else None; Rb = books[i + 1] if i + 1 < len(books) else None
        if Lb is None or xa - Lb[1] > 0.002 or h > Lb[2] + 0.003 or d > Lb[3] + 0.003:
            m.face([(xa, 0, -d), (xa, 0, 0), (xa, h, 0), (xa, h, -d)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
        if Rb is None or Rb[0] - xb > 0.002 or h > Rb[2] + 0.003 or d > Rb[3] + 0.003:
            m.face([(xb, 0, 0), (xb, 0, -d), (xb, h, -d), (xb, h, 0)], [(us[0], v0), (us[1], v0), (us[1], v1), (us[0], v1)])
    if bookend and books:
        bx = books[-1][1] + 0.002; sv = [(st[0], st[1]), (st[2], st[1]), (st[2], st[3]), (st[0], st[3])]
        m.face([(bx, 0.002, -0.17), (bx + 0.13, 0.002, -0.17), (bx + 0.13, 0.002, -0.03), (bx, 0.002, -0.03)][::-1], sv)
        for xx, sgn in ((bx, -1), (bx + 0.002, 1)):
            p = [(xx, 0.0, -0.03), (xx, 0.0, -0.17), (xx, 0.19, -0.17), (xx, 0.19, -0.03)]
            m.face(p if sgn > 0 else [p[1], p[0], p[3], p[2]], sv)
    m.bm.normal_update()
    me = bpy.data.meshes.new(name); m.bm.to_mesh(me); m.bm.free(); me.materials.append(M['book'])
    return me
pick = lambda keys, wts: (lambda rnd: rnd.choice(REG[rnd.choices(keys, wts)[0]]))
MODS = {
    'gen': [book_module(f'l3_bookmod_gen{i}', pick(['gen', 'old', 'foreign'], [78, 12, 10]), 100 + i, (0.2, 0.265), (0.024, 0.056), (0.15, 0.22),
                        fill=1.0 if i < 6 else 0.62 + 0.06 * (i - 6), bookend=i >= 6) for i in range(9)],
    'ref': [book_module(f'l3_bookmod_ref{j}', (lambda j: (lambda rnd: REG['ref'][[0, 10, 13, 16, 18][j] + rnd.randrange([10, 3, 3, 2, 7][j])]))(j), 200 + j,
                        (0.27, 0.3), (0.045, 0.065), (0.2, 0.23)) for j in range(5)],
    'journal': [book_module(f'l3_bookmod_journal{j}', (lambda j: (lambda rnd: REG['journal'][j * 5 + rnd.randrange(5)]))(j), 300 + j, (0.255, 0.268), (0.034, 0.05), (0.18, 0.2)) for j in range(5)],
}
BOOKS_G = B.group('l3_books', root)
NBOOK = {'n': 0}
def place_books(cat, cx, y, cz, yaw, bw, rnd):
    me = rnd.choice(MODS[cat]); ob = bpy.data.objects.new(f'l3_bk_{NBOOK["n"]}', me); B.scene().collection.objects.link(ob)
    ob.parent = BOOKS_G; ob.location = g2b(cx, y, cz); ob.rotation_euler = (0, 0, yaw); ob.scale = (bw / LM, 1.0, 1.0); NBOOK['n'] += 1
FACE_YAW = {'left': math.pi / 2, 'right': -math.pi / 2, 'back': 0.0, 'front': math.pi}   # 書背朝室內
def bookcase(side, a0, a1, h, dep, levels, kind, rnd):
    """靠牆的胡桃木書櫃：背板、側板、層板、凹進去的踢腳、頂板（矮書櫃多一點出簷）；書面向室內"""
    wd = mk('walnut'); yaw = FACE_YAW[side]
    def Bx(p, q, y0, y1, f0, f1, m=wd): on_wall(m, side, p, q, y0, y1, f0, f1)
    Bx(a0, a1, 0.0, 0.08, 0.0, dep - 0.04, mk('base'))                                         # 踢腳（深色、退縮 4 cm）
    Bx(a0, a1, 0.08, h - 0.03, 0.0, 0.012)                                                    # 背板
    top_over = 0.03 if kind == 'low' else 0.015
    Bx(a0 - top_over, a1 + top_over, h - 0.035, h + (0.0 if kind == 'tall' else 0.005), 0.0, dep + top_over)   # 頂板
    for (p, q) in ((a0 - 0.025, a0), (a1, a1 + 0.025)): Bx(p, q, 0.0, h - 0.035, 0.0, dep + 0.005)   # 側板
    sp = (h - 0.035 - 0.08) / levels; ys = [0.08 + k * sp for k in range(levels)]
    for yy in ys[1:]: Bx(a0, a1, yy - 0.025, yy, 0.0, dep)
    n = max(1, round((a1 - a0) / 0.95)); edges = [a0 + (a1 - a0) * i / n for i in range(n + 1)]
    for e in edges[1:-1]: Bx(e - 0.0125, e + 0.0125, 0.08, h - 0.035, 0.0, dep)
    if kind == 'tall': Bx(a0 - 0.02, a1 + 0.02, h - 0.1, h - 0.035, dep - 0.01, dep + 0.02)            # 頂上的封板（線腳）
    fp = dep - 0.008
    for a, b in zip(edges, edges[1:]):
        bw = b - a - 0.03; c = (a + b) / 2
        for k, yy in enumerate(ys):
            if kind == 'tall' and abs(c) < 2.2: cat = 'ref' if k < 3 else 'journal'                       # 西牆中間：參考書、期刊合訂本
            else: cat = 'gen'
            if side == 'back': place_books(cat, c, yy, ZI0 + fp, yaw, bw, rnd)
            elif side == 'left': place_books(cat, XI0 + fp, yy, c, yaw, bw, rnd)
rnd = random.Random(7)
for (side, a0, a1, h, dep, levels, kind) in CASES: bookcase(side, a0, a1, h, dep, levels, kind, rnd)
# 矮書櫃上面：幾疊書、一盆小植物不放（只有書，導航不變）
for (x, z, n, yaw) in [(-9.6, -7.66, 3, 0.1), (-5.2, -7.68, 2, -0.08), (6.1, -7.66, 4, 0.05), (9.9, -7.7, 2, 0.2)]:
    y = 0.955
    for k in range(n):
        w_, d_, t_ = random.uniform(0.17, 0.24), random.uniform(0.22, 0.28), random.uniform(0.025, 0.045)
        F = xf(x, y, z, yaw + random.uniform(-0.08, 0.08)); tbox(mk(f'bc{(k + int(x)) % 4}'), F, -w_ / 2, w_ / 2, 0.0, t_ - 0.004, -d_ / 2, d_ / 2)
        tbox(mk('paper'), F, -w_ / 2 + 0.004, w_ / 2 - 0.004, 0.0, t_ - 0.004, -d_ / 2 + 0.006, d_ / 2 - 0.006, faces=['+x', '-x', '+z', '-z'])
        y += t_

# ================= 長桌、檯燈、插座、椅子 =================
def banker_lamp(x, y, z):
    """綠色燈罩的閱覽桌燈（長的燈罩沿 x，兩邊的座位共用一盞）"""
    br = mk('brass'); br.cyl((x, y, z), (x, y + 0.015, z), 0.075, seg=16); br.cyl((x, y + 0.015, z), (x, y + 0.33, z), 0.011, seg=8)
    br.cyl((x - 0.04, y + 0.33, z), (x + 0.04, y + 0.33, z), 0.008, seg=6)
    sh = mk('shade'); n = 10; rr = 0.075; L_ = 0.26; cy = y + 0.36
    for i in range(n):
        a0, a1 = math.pi * i / n, math.pi * (i + 1) / n
        p = lambda xx, a: (xx, cy + rr * math.sin(a) * 0.8, z + rr * math.cos(a))
        sh.quad([p(x - L_ / 2, a0), p(x + L_ / 2, a0), p(x + L_ / 2, a1), p(x - L_ / 2, a1)])
    for xx, sg in ((x - L_ / 2, -1), (x + L_ / 2, 1)):
        pts = [(xx, cy + rr * math.sin(math.pi * i / n) * 0.8, z + rr * math.cos(math.pi * i / n)) for i in range(n + 1)]
        sh.bm.faces.new([sh.bm.verts.new(g2b(*p_)) for p_ in (pts if sg > 0 else pts[::-1])])
    hquad(mk('glow'), x - L_ / 2 + 0.01, x + L_ / 2 - 0.01, z - rr + 0.01, z + rr - 0.01, cy + 0.005)
def wood_chair(x, z, yaw):
    """閱覽椅：淺色實木框、深綠布坐墊、微彎的靠背；坐面高 0.47 m（和遊戲的椅子一樣），+z 是前面"""
    F = xf(x, 0.0, z, yaw); w = mk('chairwood'); f = mk('seat')
    for sx in (-1, 1):
        tbox(w, F, sx * 0.2 - 0.018, sx * 0.2 + 0.018, 0.0, 0.43, 0.15, 0.186)
        tbox(w, F, sx * 0.2 - 0.018, sx * 0.2 + 0.018, 0.0, 0.88, -0.215, -0.18)
    tbox(w, F, -0.22, 0.22, 0.4, 0.445, -0.2, 0.2); tbox(f, F, -0.205, 0.205, 0.445, 0.47, -0.185, 0.19)
    for sx in (-1, 1): tbox(w, F, sx * 0.2 - 0.012, sx * 0.2 + 0.012, 0.14, 0.17, -0.18, 0.15)
    Fb = xf(*F(0, 0.62, -0.2), yaw=yaw, pitch=-0.1)
    for (a, b, c) in ((-0.2, -0.07, 0.012), (-0.07, 0.07, 0.022), (0.07, 0.2, 0.012)):
        tbox(w, Fb, a, b, 0.0, 0.24, -0.01 - c, 0.012 - c)
for (tx, tz) in TABLES:
    tp, wd = mk('top'), mk('walnut')
    tp.box(tx - TW / 2, tx + TW / 2, TOP - 0.04, TOP, tz - TD / 2, tz + TD / 2)                     # 桌面
    wd.box(tx - TW / 2 - 0.006, tx + TW / 2 + 0.006, TOP - 0.05, TOP - 0.035, tz - TD / 2 - 0.006, tz + TD / 2 + 0.006)   # 封邊
    for sz in (-1, 1): wd.box(tx - TW / 2 + 0.08, tx + TW / 2 - 0.08, TOP - 0.13, TOP - 0.04, tz + sz * (TD / 2 - 0.08) - 0.012, tz + sz * (TD / 2 - 0.08) + 0.012)   # 牙板
    for sx in (-1, 1):
        ex = tx + sx * (TW / 2 - 0.3)
        wd.box(ex - 0.03, ex + 0.03, 0.06, TOP - 0.04, tz - 0.42, tz + 0.42)                         # 端板
        wd.box(ex - 0.045, ex + 0.045, 0.0, 0.06, tz - 0.52, tz + 0.52)                              # 腳座
    wd.box(tx - TW / 2 + 0.33, tx + TW / 2 - 0.33, 0.12, 0.2, tz - 0.03, tz + 0.03)                  # 下面的橫撐（桌子中線，腳碰不到）
    for i in range(3): banker_lamp(tx - 1.6 + i * 1.6, TOP, tz)
    for k in (-0.8, 0.8):                                                                       # 桌子中線的插座盒（兩邊的座位都插得到）
        mk('steel').box(tx + k - 0.07, tx + k + 0.07, TOP, TOP + 0.045, tz - 0.035, tz + 0.035)
        mk('black').box(tx + k - 0.05, tx + k + 0.05, TOP + 0.012, TOP + 0.035, tz - 0.0355, tz + 0.0355)
for (x, z, yaw) in SEATS: wood_chair(x, z, yaw)
# 桌上的幾疊書（桌子兩端，不在座位前面）
rb = random.Random(19)
for (tx, tz) in TABLES:
    for sx in ((-1,) if rb.random() < 0.5 else (1,)) if rb.random() < 0.8 else ():
        x = tx + sx * 2.18; z = tz + rb.choice([-0.28, 0.28]); y = TOP
        for k in range(rb.randint(2, 4)):
            w_, d_, t_ = rb.uniform(0.17, 0.23), rb.uniform(0.23, 0.28), rb.uniform(0.02, 0.04)
            F = xf(x, y, z, rb.uniform(-0.25, 0.25)); tbox(mk(f'bc{rb.randrange(4)}'), F, -w_ / 2, w_ / 2, 0.0, t_ - 0.004, -d_ / 2, d_ / 2)
            tbox(mk('paper'), F, -w_ / 2 + 0.004, w_ / 2 - 0.004, 0.0, t_ - 0.004, -d_ / 2 + 0.006, d_ / 2 - 0.006, faces=['+x', '-x', '+z', '-z'])
            y += t_

# ================= 輸出 =================
for key, m in MESH.items(): m.finish(root, smooth=key in ('brass', 'steel', 'shade'))
for (side, key), m in WMESH.items(): m.finish(root, props={'dir': DIRS[side]})
for (side, key), m in WUM.items(): m.finish(root, uv=False, props={'dir': DIRS[side]})
tris = {}; inst = {}
for ob in root.children_recursive:
    if ob.type != 'MESH': continue
    me = ob.data; me.calc_loop_triangles(); n = len(me.loop_triangles)
    if ob.parent is BOOKS_G: inst[me.name] = inst.get(me.name, 0) + 1; continue
    tris[ob.name] = n
mod_tris = {me.name: (len(me.polygons) * 2) for mods in MODS.values() for me in mods}
drawn_books = sum(mod_tris[k] * v for k, v in inst.items())
st = L.export(OUT, gpu_instances=True)
info = dict(st, tris_static=sum(tris.values()), book_instances=NBOOK['n'], book_modules=len(mod_tris), book_tris_drawn=drawn_books,
            tris_drawn=sum(tris.values()) + drawn_books, seats=len(SEATS),
            layout={'room': [W, D, H], 'windows_back_x': WINX, 'window_hole': {'half_w': WHW, 'y0': WY0, 'y1': WY1}, 'door_front': {'x': [-DX, DX], 'h': DY},
                    'elevator_keepout': ELEV, 'tables': TABLES, 'table': [TW, TD, TOP], 'bookcases': CASES,
                    'nav_note': '家具都在 zones3d.js 原本的導航阻擋範圍裡（desk、shelfWall）；椅子照舊不擋'},
            tris_by_object=dict(sorted(tris.items(), key=lambda kv: -kv[1])[:30]))
L.write_json(OUT[:-4] + '.json', info)
print('tris static', sum(tris.values()), 'book instances', NBOOK['n'], 'book tris drawn', drawn_books, 'bytes', st.get('bytes'))
