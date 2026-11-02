"""總圖 3F 閱覽區第二版的正式模型（LIB-3F-1102，LAWWW2 帳號 A 2026-11-02；WIP）→ assets/models/env/second_ai/library_3f_v2.glb
  /opt/blenv/bin/python tools/blender/env_second/library_3f_v2.py -- [--layout <library_3f_layout.js 或 .json>] [--out 輸出.glb]
配置：src/data/library_3f_layout.js（tools/blender/env_second/library_3f_v2_layout.py 產生）；遊戲 src/library_3f_v2.js 讀同一份。
依據：使用者 11-02 08:58 的 3F 平面圖（docs/art-rebuild/second_ai/ref/lib1102_user/0858_plan_3f.jpg），見 library_3f_v2_layout.py 開頭。
接法：外牆 WALL_*（extras dir＝朝室內，遊戲淡出；人文庫的弧牆分三組，朝圓心），其他同材質合併；src/library_3f_v2.js 的 attach() 接手。
  電梯（車廂、門、井道玻璃）是遊戲畫的；字（指標）是遊戲畫的（layout 的 signs）；窗外的景是遊戲畫的。
材質：Poly Haven CC0（dirty_carpet、herringbone_parquet、painted_plaster_wall、fine_grained_wood、walnut_veneer、ceiling_interior、granite_tile_03）；書、小東西是頂點色。
零件做法照大廳第二版（tools/blender/env_second/library_hall_v2.py）：窗框、雙面書架、綠色銀行燈、instancing 的椅子。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, Matrix   # noqa: E402
from lane118_shops import rot, rbox, ccyl, chair   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/library_3f_v2.glb'))
LP = arg('--layout', os.path.join(L.ROOT, 'src', 'data', 'library_3f_layout.js'))
src = open(LP, encoding='utf-8').read()
LAY = json.loads(src[src.index('{'):src.rindex('}') + 1]) if LP.endswith('.js') else json.loads(src)
assert LAY.get('version') == 2, '要 3F 第二版的配置（library_3f_v2_layout.py）'
PI = math.pi
H = LAY['h']; T = 0.2
BD = LAY['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']
XI0, XI1, ZI0, ZI1 = X0 + T / 2, X1 - T / 2, Z0 + T / 2, Z1 - T / 2
R = LAY['rotunda']; SD = LAY['stairDoor']; EL = LAY['elevator']
ROT_LAMPS = (PI / 6, PI * 7 / 18, PI * 11 / 18, PI * 5 / 6)   # 人文庫的四片小燈：30°、70°、110°、150°（烘焙腳本的 ROTL 同一組）
rng = random.Random(1103)
BOOKC = ['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6', '#3e4a5c', '#5e6b45']

B.reset(texres=512)
root = B.group('library_3f_v2', props={'kind': 'library_3f_v2'})
M = {
    'carpet': L.pbr('l3_carpet', 'dirty_carpet', tile=2.0, target='#5d6670', contrast=0.55, normal=0.35, maps=('diff', 'nor'), rough_value=0.97),
    'parquet': L.pbr('l3_parquet', 'herringbone_parquet', tile=2.2, target='#c7a77e', normal=0.35, maps=('diff', 'nor'), rough_value=0.42),
    'plaster': L.pbr('l3_plaster', 'painted_plaster_wall', tile=3.0, target='#ece8e0', normal=0.25, maps=('diff', 'nor'), rough_value=0.9),
    'wood': L.pbr('l3_wood', 'fine_grained_wood', tile=1.2, target='#c49862', contrast=0.45, normal=0.2, maps=('diff', 'nor'), rough_value=0.45),
    'walnut': L.pbr('l3_walnut', 'walnut_veneer', tile=1.2, target='#6b4a32', normal=0.25, maps=('diff', 'nor'), rough_value=0.55),
    'ceil': L.pbr('l3_ceiling', 'ceiling_interior', tile=2.4, target='#efece6', maps=('diff',), rough_value=0.95),
    'stone': L.pbr('l3_stone_dark', 'granite_tile_03', tile=1.4, target='#4b4d50', normal=0.3, maps=('diff', 'nor'), rough_value=0.35),
    'trim': L.flat('l3_trim', '#e6e1d6', rough=0.6),
    'frame': L.flat('l3_frame', '#3a3d41', rough=0.45, metal=0.3),
    'glass': L.flat('l3_glass', '#cfe0e6', rough=0.05, alpha=0.22),
    'light': L.flat('l3_lightpanel', '#fffaf0', rough=0.5, emit=B.srgb('#fff4e0')),
    'vc': L.vc_material('l3_vc', rough=0.6),
    'vcm': L.vc_material('l3_vcm', rough=0.35),
    'books': L.vc_material('l3_books', rough=0.75),
}


class Lv:
    """網格：材質一個一個累積，最後合併"""
    def __init__(self, parent):
        self.parent, self.m = parent, {}
        self.vc = self.get('vc', cm=True); self.vm = self.get('vcm', cm=True)
    def get(self, key, cm=False, tile=None):
        if key not in self.m: self.m[key] = CMesh(f'L3_{key}', M[key]) if cm else Mesh(f'L3_{key}', M[key], tile=tile)
        return self.m[key]
    def finish(self):
        for key, mm in self.m.items(): mm.finish(self.parent, uv=key not in ('vc', 'vcm', 'books', 'light', 'glass'))


C = Lv(root)
WALLS = {}
def wallmesh(wid, dirv, key='plaster'):
    if wid not in WALLS: WALLS[wid] = (Mesh(f'WALL_{wid}', M[key]), dirv)
    return WALLS[wid][0]


def wall_holes(m, axis, at, a0, a1, y0, y1, holes, t=T):
    """一道牆（axis 'x'：沿 x、z＝at；'z'：沿 z、x＝at），開口 holes＝[(a, b, ya, yb)]（大廳第二版同一套）"""
    def bx(a, b, ya, yb):
        if b - a < 1e-3 or yb - ya < 1e-3: return
        if axis == 'x': m.box(a, b, ya, yb, at - t / 2, at + t / 2)
        else: m.box(at - t / 2, at + t / 2, ya, yb, a, b)
    x = a0
    for (a, b, ya, yb) in sorted(holes):
        bx(x, a, y0, y1); bx(a, b, y0, ya); bx(a, b, yb, y1); x = b
    bx(x, a1, y0, y1)


def win_frame(axis, at, a, b, ya, yb, inward, mull=2):
    d = at + inward * (T / 2 - 0.04); fr = C.get('frame')
    def bx(p0, p1, q0, q1):
        if axis == 'x': fr.box(p0, p1, q0, q1, d - 0.04, d + 0.04)
        else: fr.box(d - 0.04, d + 0.04, q0, q1, p0, p1)
    bx(a, a + 0.06, ya, yb); bx(b - 0.06, b, ya, yb); bx(a, b, ya, ya + 0.06); bx(a, b, yb - 0.06, yb)
    for k in range(1, mull + 1):
        u = a + (b - a) * k / (mull + 1); bx(u - 0.025, u + 0.025, ya, yb)
    sill = C.get('trim')
    if axis == 'x': sill.box(a - 0.05, b + 0.05, ya - 0.04, ya, min(at + inward * T / 2, at + inward * (T / 2 + 0.12)), max(at + inward * T / 2, at + inward * (T / 2 + 0.12)))
    else: sill.box(min(at + inward * T / 2, at + inward * (T / 2 + 0.12)), max(at + inward * T / 2, at + inward * (T / 2 + 0.12)), ya - 0.04, ya, a - 0.05, b + 0.05)
    gl = C.get('glass')
    if axis == 'x': gl.box(a, b, ya, yb, at - 0.01, at + 0.01)
    else: gl.box(at - 0.01, at + 0.01, ya, yb, a, b)


# =====================================================================
# 一、地板、天花板（地毯；人文庫是人字拼木地板）
# =====================================================================
cp = C.get('carpet', tile=2.0)
cp.quad([(XI0, 0, ZI1), (XI1, 0, ZI1), (XI1, 0, ZI0), (XI0, 0, ZI0)])                  # 順序照大廳第二版的地板（朝上）
pq = C.get('parquet', tile=2.2); NR = 36
for i in range(NR):                                                                         # 扇形：圓心 → a0 → a1（朝上；大廳第二版 11-02 修過的順序）
    a0, a1 = PI * i / NR, PI * (i + 1) / NR
    pq.quad([(R['cx'], 0.002, R['cz']), (R['cx'] + R['r'] * math.cos(a0), 0.002, R['cz'] - R['r'] * math.sin(a0)), (R['cx'] + R['r'] * math.cos(a1), 0.002, R['cz'] - R['r'] * math.sin(a1))])
pq.quad([(R['open']['x0'], 0.002, ZI0 + 0.001), (R['open']['x1'], 0.002, ZI0 + 0.001), (R['open']['x1'], 0.002, Z0 - 0.001), (R['open']['x0'], 0.002, Z0 - 0.001)])
ce = C.get('ceil', tile=2.4)
ce.quad([(XI0, H, ZI0), (XI1, H, ZI0), (XI1, H, ZI1), (XI0, H, ZI1)])                   # 朝下（單面：鏡頭在上面時看不到）
for i in range(NR):
    a0, a1 = PI * i / NR, PI * (i + 1) / NR
    ce.quad([(R['cx'], H, R['cz']), (R['cx'] + R['r'] * math.cos(a1), H, R['cz'] - R['r'] * math.sin(a1)), (R['cx'] + R['r'] * math.cos(a0), H, R['cz'] - R['r'] * math.sin(a0))])
lp = C.get('light')                                                                         # 方格天花板的燈（每 2.4 m 一片）
for gx in [x + 1.2 for x in range(int(X0), int(X1) - 1, 3)]:
    for gz in [z + 1.2 for z in range(int(Z0) + 1, int(Z1) - 1, 3)]:
        lp.box(gx - 0.6, gx + 0.6, H - 0.012, H - 0.004, gz - 0.3, gz + 0.3)
lp.box(R['cx'] - 1.0, R['cx'] + 1.0, H - 0.012, H - 0.004, R['cz'] - 2.6, R['cz'] - 1.6)
# 人文庫再加四片小燈（11-02 第一次烘：人文庫地板白天只有 0.155，主閱覽區約 0.42——半圓約 46 m² 只有中間一片燈，
#   每平方公尺約 0.5 W，主閱覽區約 1.4 W）。位置：圓心半徑 3.6 m、30°／70°／110°／150°（書牆內面在半徑 4.75）。
#   改這裡要一起改 lightbake/bake_library_3f_v2.sh 的 ROTL（同一組位置）
for a in ROT_LAMPS:
    lx, lz = R['cx'] + 3.6 * math.cos(a), R['cz'] - 3.6 * math.sin(a)
    lp.box(lx - 0.3, lx + 0.3, H - 0.012, H - 0.004, lz - 0.3, lz + 0.3)

# =====================================================================
# 二、外牆（窗：西、東、南；東牆有樓梯間的門）、北牆（人文庫的玻璃門）
# =====================================================================
WN = LAY['windows']; WY0, WY1, HW = WN['y0'], WN['y1'], WN['hw']   # 窗的位置在配置檔（遊戲在窗外放景，要對得上）
w_holes = [(z - HW, z + HW, WY0, WY1) for z in WN['west']]
wall_holes(wallmesh('W', [1, 0, 0]), 'z', X0, Z0 - T / 2, Z1 + T / 2, 0.0, H, w_holes)
for (a, b, ya, yb) in w_holes: win_frame('z', X0, a, b, ya, yb, 1)
e_holes = [(z - HW, z + HW, WY0, WY1) for z in WN['east']] + [(SD['z'] - SD['w'] / 2, SD['z'] + SD['w'] / 2, 0.0, 2.35)]
wall_holes(wallmesh('E', [-1, 0, 0]), 'z', X1, Z0 - T / 2, Z1 + T / 2, 0.0, H, e_holes)
for (a, b, ya, yb) in e_holes:
    if ya > 0.1: win_frame('z', X1, a, b, ya, yb, -1)
s_holes = [(x - HW, x + HW, WY0, WY1) for x in WN['south']]
wall_holes(wallmesh('S', [0, 0, -1]), 'x', Z1, X0, X1, 0.0, H, s_holes)
for (a, b, ya, yb) in s_holes: win_frame('x', Z1, a, b, ya, yb, -1)
wall_holes(wallmesh('N', [0, 0, 1]), 'x', Z0, X0, X1, 0.0, H, [(R['open']['x0'], R['open']['x1'], 0.0, 2.6)])
fr = C.get('frame'); gl = C.get('glass')                                                    # 人文庫的玻璃門（兩扇，開著的那一半是空的）
fr.box(R['open']['x0'], R['open']['x1'], 2.55, 2.6, Z0 - 0.05, Z0 + 0.05)
for xx in (R['open']['x0'], 0.0, R['open']['x1']): fr.box(xx - 0.03, xx + 0.03, 0.0, 2.6, Z0 - 0.05, Z0 + 0.05)
gl.box(R['open']['x0'] + 0.03, -0.03, 0.0, 2.55, Z0 - 0.01, Z0 + 0.01)
fr = C.get('frame')                                                                         # 樓梯間的門框（門是開著的、往外推：只畫框）
fr.box(X1 - T / 2 - 0.02, X1 - T / 2 + 0.02, 2.35, 2.45, SD['z'] - SD['w'] / 2 - 0.08, SD['z'] + SD['w'] / 2 + 0.08)
for zz in (SD['z'] - SD['w'] / 2, SD['z'] + SD['w'] / 2): fr.box(X1 - T / 2 - 0.02, X1 - T / 2 + 0.02, 0.0, 2.45, zz - 0.06, zz + 0.06)
for (wid, x0_, x1_, z0_, z1_) in (('base_w', XI0, XI0 + 0.012, ZI0, ZI1), ('base_e', XI1 - 0.012, XI1, ZI0, ZI1)):   # 踢腳板
    C.get('walnut').box(x0_, x1_, 0.0, 0.12, z0_, z1_)
C.get('walnut').box(XI0, XI1, 0.0, 0.12, ZI1 - 0.012, ZI1)

# 人文庫的弧牆（分三組：東、北、西；WALL_ 的 dir 朝圓心，鏡頭在弧牆外面時淡出）
NF = 15
def facet(i):
    a0, a1 = PI * i / NF, PI * (i + 1) / NF
    return (R['cx'] + (R['r'] + 0.1) * math.cos(a0), R['cz'] - (R['r'] + 0.1) * math.sin(a0)), (R['cx'] + (R['r'] + 0.1) * math.cos(a1), R['cz'] - (R['r'] + 0.1) * math.sin(a1))
def rot_group(i): return 'RE' if i < 5 else ('RN' if i < 10 else 'RW')
RDIR = {'RW': [0.7, 0, 0.5], 'RN': [0, 0, 1], 'RE': [-0.7, 0, 0.5]}
for i in range(NF):
    (xa, za), (xb, zb) = facet(i)
    m = wallmesh(rot_group(i), RDIR[rot_group(i)])
    # 朝室內（圓心）那一面。11-02 第二次改：原本頂點順序反了（法線朝外：烘焙把它當成背對室內、收成一點），
    #   第二面（同一組頂點、反過來）匯出時就沒有了（雙面材質，一面就夠）
    m.quad([(xb, 0.0, zb), (xa, 0.0, za), (xa, H, za), (xb, H, zb)])

# =====================================================================
# 三、家具
# =====================================================================
def bookrow(c, T_, x0, x1, y, z0, z1, h=0.28):
    """一排書：一叢一叢畫（寬 6～14 cm 一塊、顏色不同；大廳第二版的雙面書架同一個做法）。11-02 第一次一本一本畫（2～5 cm），整個 3F 14 萬個三角形、GLB 12 MB"""
    x = x0
    while x < x1 - 0.05:
        bw = rng.uniform(0.06, 0.14)
        if rng.random() < 0.9: rbox(c.get('books', cm=True), T_, x, min(x + bw, x1 - 0.02), y, y + rng.uniform(h * 0.7, h), z0, z1, rng.choice(BOOKC))
        x += bw + 0.003


def stack(c, f):
    """雙面書架（平面圖的顏色＝端板）：長邊沿 x 或沿 z"""
    along_x = f['w'] >= f['d']; Lg = max(f['w'], f['d']); Dp = min(f['w'], f['d']); Hh = f['h']
    T_ = rot(f['x'], f['z'], 0.0 if along_x else PI / 2)
    rbox(c.vm, T_, -Lg / 2, Lg / 2, 0.0, 0.08, -Dp / 2 + 0.02, Dp / 2 - 0.02, '#4a4e52')
    rbox(c.vm, T_, -Lg / 2, Lg / 2, 0.08, Hh, -0.012, 0.012, '#c3c7cb')
    rbox(c.vm, T_, -Lg / 2, Lg / 2, Hh - 0.03, Hh, -Dp / 2, Dp / 2, '#c3c7cb')
    n = max(2, int(round(Lg / 1.0)))
    for i in range(n + 1):
        xx = -Lg / 2 + i * Lg / n; rbox(c.vm, T_, xx - 0.015, xx + 0.015, 0.08, Hh - 0.03, -Dp / 2, Dp / 2, '#b5b9bd')
    nsh = 5 if Hh > 1.8 else 4
    for k in range(nsh):
        yy = 0.08 + k * (Hh - 0.16) / (nsh - 0.6); rbox(c.vm, T_, -Lg / 2, Lg / 2, yy, yy + 0.02, -Dp / 2, Dp / 2, '#c9cdd1')
        if k == nsh - 1: continue
        for s in (-1, 1):
            za, zb = (0.02, Dp / 2 - 0.03) if s > 0 else (-Dp / 2 + 0.03, -0.02)
            bookrow(c, T_, -Lg / 2 + 0.03, Lg / 2 - 0.03, yy + 0.02, za, zb)
    for e in (-1, 1):
        xe = e * (Lg / 2 + 0.015); rbox(c.vc, T_, xe - 0.015, xe + 0.015, 0.0, Hh, -Dp / 2 - 0.01, Dp / 2 + 0.01, f.get('cap', '#888888'))


def display(c, f):
    """現期期刊的展示架（紅色端板）：兩面斜放的雜誌格"""
    Lg, Dp, Hh = f['w'], f['d'], f['h']; T_ = rot(f['x'], f['z'], 0.0)
    rbox(c.vm, T_, -Lg / 2, Lg / 2, 0.0, 0.1, -Dp / 2, Dp / 2, '#4a4e52')
    rbox(c.vm, T_, -Lg / 2, Lg / 2, 0.1, Hh, -0.02, 0.02, '#d7d2c8')
    for k in range(3):
        y = 0.25 + k * 0.38
        for s in (-1, 1):
            rbox(c.vm, T_, -Lg / 2 + 0.03, Lg / 2 - 0.03, y, y + 0.02, s * 0.02 if s > 0 else -Dp / 2 + 0.02, Dp / 2 - 0.02 if s > 0 else -0.02, '#c9c3b6')
            x = -Lg / 2 + 0.08
            while x < Lg / 2 - 0.3:                                                         # 雜誌（封面朝外、斜靠）
                w = 0.22; z0_ = s * 0.06; z1_ = s * 0.1
                rbox(c.vc, T_, x, x + w, y + 0.02, y + 0.32, min(z0_, z1_), max(z0_, z1_), rng.choice(['#c23b3b', '#2f5d8c', '#e0b84a', '#3a7a5a', '#d9d3c6', '#8c3b6a', '#333333']))
                x += w + 0.06
    for e in (-1, 1): rbox(c.vc, T_, e * (Lg / 2 + 0.015) - 0.015, e * (Lg / 2 + 0.015) + 0.015, 0.0, Hh, -Dp / 2 - 0.01, Dp / 2 + 0.01, f.get('cap', '#b3283a'))


def wall_shelf(c, f):
    """靠牆的單面書架（考古題、指定參考書、四庫全書、參考書）：w、d 是世界座標的寬深，ry 朝外"""
    along_x = f['w'] >= f['d']; Lg = max(f['w'], f['d']); Dp = min(f['w'], f['d']); Hh = f['h']
    T_ = rot(f['x'], f['z'], f.get('ry', 0.0))
    rbox(c.get('walnut'), T_, -Lg / 2, Lg / 2, 0.0, Hh, -Dp / 2, -Dp / 2 + 0.03)
    for lx in (-Lg / 2, Lg / 2): rbox(c.get('walnut'), T_, lx - 0.02, lx + 0.02, 0.0, Hh, -Dp / 2, Dp / 2)
    for k in range(6):
        yy = 0.06 + k * (Hh - 0.1) / 5.4; rbox(c.get('walnut'), T_, -Lg / 2, Lg / 2, yy, yy + 0.025, -Dp / 2, Dp / 2)
        if k < 5: bookrow(c, T_, -Lg / 2 + 0.04, Lg / 2 - 0.04, yy + 0.025, -Dp / 2 + 0.05, Dp / 2 - 0.04, h=0.3)


def desk(c, f):
    """閱覽桌：木頭桌面、桌腳；雙面的中間有矮隔板"""
    wd = c.get('wood'); x0, x1, z0, z1, h = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, f['h']
    wd.box(x0, x1, h - 0.04, h, z0, z1)
    for (lx, lz) in ((x0 + 0.06, z0 + 0.06), (x1 - 0.06, z0 + 0.06), (x0 + 0.06, z1 - 0.06), (x1 - 0.06, z1 - 0.06)): C.vm.cbox(lx - 0.025, lx + 0.025, 0.0, h - 0.04, lz - 0.025, lz + 0.025, '#3a3d41')
    if f.get('side') == 'both':
        if f['w'] >= f['d']: wd.box(x0 + 0.05, x1 - 0.05, h, h + 0.3, f['z'] - 0.012, f['z'] + 0.012)
        else: wd.box(f['x'] - 0.012, f['x'] + 0.012, h, h + 0.3, z0 + 0.05, z1 - 0.05)


def carrel(c, f):
    """研究小間：木頭隔間＋玻璃門（關著）、裡面一張桌子"""
    x0, x1, z0, z1 = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2
    for xx in (x0, x1): c.get('walnut').box(xx - 0.04, xx + 0.04, 0.0, 2.4, z0, z1)
    c.get('walnut').box(x0, x1, 2.36, 2.4, z0, z1)
    c.get('frame').box(x0 + 0.04, x1 - 0.04, 0.0, 2.36, z0 - 0.03, z0 + 0.0)
    c.get('glass').box(x0 + 0.2, x1 - 0.2, 0.9, 2.1, z0 - 0.035, z0 - 0.025)
    c.get('wood').box(x0 + 0.1, x1 - 0.1, 0.72, 0.76, z1 - 0.6, z1 - 0.1)


def room(c, f):
    """討論室 344／346：南面玻璃隔間＋門（關著）、裡面一張桌子、白板"""
    x0, x1, z0, z1 = f['x0'], f['x1'], f['z0'], f['z1']
    c.get('frame').box(x0, x1, 2.6, 2.66, z1 - 0.04, z1 + 0.04)
    for xx in (x0, x1): c.get('plaster').box(xx - 0.06, xx + 0.06, 0.0, H, z0, z1)
    c.get('glass').box(x0 + 0.06, x1 - 0.06, 0.0, 2.6, z1 - 0.01, z1 + 0.01)
    for xx in [x0 + (x1 - x0) * k / 3 for k in (1, 2)]: c.get('frame').box(xx - 0.025, xx + 0.025, 0.0, 2.6, z1 - 0.04, z1 + 0.04)
    c.get('plaster').box(x0, x1, 2.66, H, z1 - 0.06, z1 + 0.06)
    cx = (x0 + x1) / 2; c.get('wood').box(cx - 0.9, cx + 0.9, 0.72, 0.76, z0 + 0.7, z0 + 1.6)
    c.vm.cbox(cx - 0.8, cx + 0.8, 1.0, 1.9, z0 + 0.11, z0 + 0.14, '#f6f6f2')


def round_table(c, f):
    ccyl(c.get('wood'), (f['x'], 0.7, f['z']), (f['x'], 0.74, f['z']), f['r'], seg=24) if False else ccyl(c.vc, (f['x'], 0.7, f['z']), (f['x'], 0.74, f['z']), f['r'], '#c49862', seg=24)
    ccyl(c.vm, (f['x'], 0.0, f['z']), (f['x'], 0.7, f['z']), 0.04, '#3a3d41', seg=8)
    ccyl(c.vm, (f['x'], 0.0, f['z']), (f['x'], 0.03, f['z']), 0.25, '#3a3d41', seg=16)


for f in LAY['furniture']:
    t = f['type']
    if t == 'stack': stack(C, f)
    elif t == 'display': display(C, f)
    elif t == 'wallShelf': wall_shelf(C, f)
    elif t == 'desk': desk(C, f)
    elif t == 'carrel': carrel(C, f)
    elif t == 'room': room(C, f)
    elif t == 'roundTable': round_table(C, f)

# 人文庫：沿弧牆的書牆、中間的展示桌、兩張長椅
RS = R['r'] - 0.75
for i in range(NF):
    if i in (0, NF - 1): continue                                                           # 靠北牆那兩段留空（門的兩邊）
    a0, a1 = PI * i / NF + 0.01, PI * (i + 1) / NF - 0.01
    am = (a0 + a1) / 2; cx_, cz_ = R['cx'] + (RS + 0.3) * math.cos(am), R['cz'] - (RS + 0.3) * math.sin(am)
    w_ = 2 * (RS + 0.3) * math.sin((a1 - a0) / 2)
    T_ = rot(cx_, cz_, PI / 2 - am)
    rbox(C.get('walnut'), T_, -w_ / 2, w_ / 2, 0.0, 2.6, 0.18, 0.21)
    for k in range(7):
        yy = 0.06 + k * 0.4; rbox(C.get('walnut'), T_, -w_ / 2, w_ / 2, yy, yy + 0.025, -0.2, 0.2)
        if k < 6: bookrow(C, T_, -w_ / 2 + 0.03, w_ / 2 - 0.03, yy + 0.025, -0.15, 0.16)
dt = rot(R['cx'], R['cz'] - 2.2, 0.0)
rbox(C.get('walnut'), dt, -0.8, 0.8, 0.0, 0.85, -0.45, 0.45)
rbox(C.get('glass'), dt, -0.78, 0.78, 0.85, 1.05, -0.43, 0.43)
for k in range(5): rbox(C.vc, dt, -0.7 + k * 0.3, -0.5 + k * 0.3, 0.86, 0.9, -0.15, 0.15, rng.choice(['#8c3b47', '#2f5d50', '#c9a24f', '#4a6c8c']))

# =====================================================================
# 四、椅子、檯燈（instancing）
# =====================================================================
def inst(key, spots, draw):
    if not spots: return
    tmp = type('T', (), {})(); tmp.vc = CMesh(f'INST_{key}_vc', M['vc']); tmp.vm = CMesh(f'INST_{key}_vm', M['vcm'])
    draw(tmp)
    for m in (tmp.vc, tmp.vm):
        ob = m.finish(root, uv=False)
        if ob is None: continue
        for i, (x, z, yaw) in enumerate(spots):
            o = ob if i == 0 else bpy.data.objects.new(f'{ob.name}_{i}', ob.data)
            if i: bpy.context.scene.collection.objects.link(o); o.parent = root
            o.matrix_world = Matrix.Translation(g2b(x, 0.0, z)) @ Matrix.Rotation(yaw, 4, 'Z')


def banker_lamp_parts(t):
    ccyl(t.vm, (0, 0.76, 0), (0, 0.775, 0), 0.06, '#b08a3a', seg=10)
    ccyl(t.vm, (0, 0.775, 0), (0, 0.99, 0), 0.008, '#b08a3a', seg=6)
    y0, r, n = 0.99, 0.06, 8
    arc = [(r * math.cos(PI * k / n), r * math.sin(PI * k / n)) for k in range(n + 1)]
    for (u0, v0), (u1, v1) in zip(arc, arc[1:]):
        t.vm.poly([(-0.14, y0 + v0, u0), (0.14, y0 + v0, u0), (0.14, y0 + v1, u1), (-0.14, y0 + v1, u1)], '#2f5d43')
        t.vm.poly([(-0.14, y0 + v1, u1), (0.14, y0 + v1, u1), (0.14, y0 + v0, u0), (-0.14, y0 + v0, u0)], '#2f5d43')
    for xe in (-0.14, 0.14): t.vm.poly([(xe, y0 + v, u) for (u, v) in arc], '#2f5d43'); t.vm.poly([(xe, y0 + v, u) for (u, v) in reversed(arc)], '#2f5d43')


def lounge_parts(t):
    """休息區的扶手椅（布面、木腳）：原點＝坐的位置、面向 +z"""
    rbox(t.vc, rot(0, 0, 0), -0.36, 0.36, 0.22, 0.42, -0.34, 0.34, '#7a8b8f', r=0.04, seg=1)
    rbox(t.vc, rot(0, 0, 0), -0.36, 0.36, 0.42, 0.85, -0.38, -0.24, '#7a8b8f', r=0.04, seg=1)
    for sx in (-1, 1): rbox(t.vc, rot(0, 0, 0), sx * 0.36 - 0.07, sx * 0.36 + 0.07, 0.22, 0.6, -0.36, 0.3, '#6f8084', r=0.03, seg=1)
    for (lx, lz) in ((-0.3, -0.3), (0.3, -0.3), (-0.3, 0.28), (0.3, 0.28)): ccyl(t.vm, (lx, 0.0, lz), (lx, 0.22, lz), 0.022, '#5a3e2a', seg=6)


SE = LAY['seats']
chairs = [(s['x'], s['z'], s['yaw']) for s in SE if s['label'] != '現期期刊休息區']
lounges = [(s['x'], s['z'], s['yaw']) for s in SE if s['label'] == '現期期刊休息區']
inst('chair', chairs, lambda t: chair(t, 0.0, 0.0, 0.0, 'wood', '#a8743e'))
inst('lounge', lounges, lounge_parts)
lamps = []
for f in LAY['furniture']:
    if f['type'] == 'desk' and f.get('lamp'):
        if f['w'] >= f['d']:
            for k in range(-1, 2): lamps.append((f['x'] + k * 1.05, f['z'], 0.0))
        else:
            for k in range(-1, 2): lamps.append((f['x'] - 0.2 * (1 if f.get('side') == 'west' else -1), f['z'] + k * 1.0, PI / 2))
inst('lamp', lamps, banker_lamp_parts)

# =====================================================================
# 完成
# =====================================================================
for wid, (m, d) in WALLS.items():
    m.finish(root, props={'dir': d})
C.finish()
L.merge_by_material(root, keep=lambda ob: 'WALL_' in ob.name or ob.name.startswith('INST_') or (ob.data.users > 1))
info = L.export(OUT, gpu_instances=True)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(info if isinstance(info, dict) else {}, tris_total=tris))
print(json.dumps({'LIBRARY_3F_V2': 'OK', 'tris': tris, 'walls': len(WALLS), 'chairs': len(chairs), 'lounges': len(lounges), 'lamps': len(lamps)}, ensure_ascii=False))
