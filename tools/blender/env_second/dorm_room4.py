"""宿舍房間 v2：台大四人房（上舖床＋下面書桌的床桌組四組，進門右邊洗手間）→ GLB。LAWWW2-B，ART-DORM-LOFT。
  /opt/blenv/bin/python tools/blender/env_second/dorm_room4.py [-- --out assets/models/env/second_ai/dorm_interior.glb] [--layout 輸出配置.json]

使用者 2026-10-17 01:0x（附實際宿舍照片）：「台大宿舍是這樣 床在上面 書桌在下面 一個房間有四組這個／門口進來右邊是洗手間 再進來是四組這個」
- 照片：白色床架（實心床欄、天花板吊桿、床尾一根立柱）、床下是淺木紋書桌（抽屜櫃、白色開放層架）、高衣櫃；
  床頭那一端是木踏板的階梯收納櫃＋白色彎扶手；白色塑膠椅；淺木紋地板；捲簾；分離式冷氣；圓形吸頂燈。
- 取代 dorm_interior.py 的雙人房（舊腳本保留）。房間大小、門、出口照舊：6×7×3.0 m，門在前牆 z=+3.5 中間（x −0.48..0.48）。
- 座標＝遊戲 dorm 區域座標（x 右、y 上、z 往門）。牆內面 x ±2.9、z ±3.4。
- 配置（--layout 輸出 JSON，給 LAWWW-B 改 zones3d.js 的 dorm 區塊）：
  - 洗手間：進門右邊（+x）x 0.65..2.9、z 1.45..3.4，門開向入口走道（x=0.65 那一面）。
  - 床桌組：右牆兩組（R1 後、R2 前）、左牆兩組（L1 後、L2 前），每組沿牆 2.4 m、離牆 0.95 m；階梯在每組靠門那一端。
    誰用哪一組照 AA_208 第 4 節：203＝R1 柏翰（靠窗、先到）、R2 阿凱、L1 阿哲、L2 祐廷（門口那組）；412（經濟系那年，同一個模型換東西）＝R1 唐睿、R2 阿勳、L1 韋綸、L2 祐廷。
  - 窗移到後牆中間（x −1.1..1.1、y 0.95..2.4），冷氣在窗的右上方。
- 節點：WALL_<front|back|left|right|bath_n|bath_w>_*（會淡出的牆，dir＝往室內）；LOFT_<組>_TOP（床板、床欄、床墊、吊桿、扶手上段：材質 seethru_*）＋子節點 BEDDING_<組>（被子、枕頭）；
  每個人的東西一組一個節點（可以整組藏起來）：Y203_YUTING、ROOMMATE_KAI、Y203_ZHE、Y203_BOHAN、Y412_YUTING、Y412_TANGRUI、Y412_WEILUN；經濟系第一晚的名牌 NAMETAG_TANGRUI／NAMETAG_WEILUN。
  大二～大四（LAWWW2-C 2026-10-17，AA_208 第 7、8 節；SCN-V3-01／V4-01／V5-01）：Y312_YUTING／Y312_ZHE／Y312_BOHAN／Y312_FRESH、Y507_YUTING／Y507_BOHAN／Y507_SOPH／Y507_PEER、
  Y409_YUTING／Y409_BOHAN／Y409_SOPH／Y409_FRESH（遊戲端：zones3d.js 的 DORM_SETS 要多 312／507／409 三組，舊的 203、412 也要藏 Y312_／Y507_／Y409_——GLB 和 patch 要一起換）。
  阿勳的書桌、保齡球袋、E01 紙箱照舊用 v0_dorm_props（位置在 layout 的 v0_props）。其他照材質合併。
"""
import json, math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/dorm_interior.glb'))
LAYOUT_OUT = arg('--layout')
ONLY = arg('--only')                               # --only 205：只做那一間的東西（方奕廷的 205，AA_399 第 11 節；遊戲端 rooms_glb3d.js 的 dorm_205），輸出另一個 GLB；不給＝玩家的房間（203／412／312／507／409），和原本一樣
ROOM_LAYOUT_OUT = arg('--room-layout')             # --only 時：rooms_glb3d.js 格式的配置（bounds、blocks、seats、spots、open…）
EXTRA_SETS = ('205',)                              # 只在 --only 時做的那幾間（玩家的房間不能有：zones3d.js 的 DORM_SETS 不會藏 Y205_）

W, D, H = 6.0, 7.0, 3.0
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
T = 0.1
IX0, IX1, IZ0, IZ1 = X0 + T, X1 - T, Z0 + T, Z1 - T          # 牆的內面
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0], 'bath_n': [0, 0, -1], 'bath_w': [-1, 0, 0]}
WIN = (-1.1, 1.1, 0.95, 2.4)                       # 後牆的窗洞 x0,x1,y0,y1（窗景平面：中心 (0, 1.675)、2.2×1.45，往外放）
DOOR = (-0.48, 0.48, 2.1)                          # 前牆的門洞（照舊）
BATH = dict(x0=0.65, x1=IX1, z0=1.45, z1=IZ1, t=0.1, door=(2.2, 3.0), door_h=2.05)
# 床桌組：沿牆座標 u（＝z）、離牆距離 v；階梯在 ub 那一端（靠門）
VD, STW = 0.95, 0.40                               # 床桌組的深度、階梯寬（10-30 DORM203-LM-1030：0.45→0.40，床長多 5 cm）
STW0 = 0.45                                        # 原本的階梯寬：書桌、衣櫃的位置照舊用這個算（座位、走近點、導航不動），衣櫃往階梯那邊寬 5 cm 補縫
DECK0, DECK1, GUARD = 1.56, 1.60, 2.02             # 床板底、床板頂、床欄頂
RISE, NST = 0.32, 4                                # 階梯：四階、每階 32 cm（頂 1.28），再一步上床
# 誰用哪一組（AA_208 第 4 節，AA 分支 65978067）：柏翰先到、用靠窗那組；「門口那張床是你的」＝祐廷在左前；阿凱的書桌在祐廷對面（遙控器放在兩張書桌中間）
# 大二～大四（AA_208 第 7、8 節）：312＝祐廷 L2、阿哲 L1、柏翰 R1、大一學弟 R2（背景）；507＝祐廷、柏翰、大二學弟 L1、別系的同屆 R2；409＝祐廷、柏翰、大二學弟 L1、大一學弟 R2
# 205（方奕廷的房間，AA_399 第 11 節；只在 --only 205）：方奕廷 R1（靠窗：盆栽要光）、其他三個是沒有名字的室友（背景）
UNITS = [('R1', 'R', IZ0 + 0.005, -1.0, {'203': 'bohan', '412': 'tangrui', '312': 'bohan', '507': 'bohan', '409': 'bohan', '205': 'fang'}),
         ('R2', 'R', -0.98, 1.39, {'203': 'kai', '412': 'xun', '312': 'fresh', '507': 'peer', '409': 'fresh', '205': 'fresh'}),
         ('L1', 'L', IZ0 + 0.005, -1.0, {'203': 'zhe', '412': 'weilun', '312': 'zhe', '507': 'soph', '409': 'soph', '205': 'soph'}),
         ('L2', 'L', -0.98, 1.39, {'203': 'yuting', '412': 'yuting', '312': 'yuting', '507': 'yuting', '409': 'yuting', '205': 'peer'})]
DUVET = {'R1': '#e2ddd2', 'R2': '#6b6f75', 'L1': '#3f6fa0', 'L2': '#4d6f8f'}   # 每一組的被子（柏翰淺灰、阿凱深灰、阿哲藍、祐廷灰藍）
random.seed(23)
TEXGEN = os.path.join(HERE, 'textures', 'gen')
B.reset(texres=512)
root = B.group('dorm_interior', props={'kind': 'dorm_interior', 'w': W, 'd': D, 'h': H, 'version': 'loft4'})
M = {
    'floor': L.pbr('dorm_floor', 'laminate_floor_02', tile=1.6, target='#cdb594', normal=0.35, maps=('diff', 'nor'), res=512, rough_value=0.45),
    'wall': L.pbr('dorm_wall', 'painted_plaster_wall', tile=1.6, target='#efeee9', contrast=0.3, normal=0.12, maps=('diff', 'nor'), res=256, rough_value=0.88),
    'skirt': L.flat('dorm_skirting', '#d9d6cf', rough=0.5),
    'ceil': L.flat('dorm_ceiling', '#f4f3ef', rough=0.92, cull=True),
    'tube': L.flat('dorm_tube', '#ffffff', rough=0.3, emit=B.srgb('#fff7ea')), 'fixture': L.flat('dorm_fixture', '#ecece8', rough=0.35, metal=0.1),
    'alu': L.flat('dorm_alu', '#c5c8ca', rough=0.32, metal=0.45), 'glass': L.flat('dorm_glass', '#dfe8ec', rough=0.05, alpha=0.16),
    'sill': L.flat('dorm_sill', '#e6e3dc', rough=0.4),
    'blind': L.flat('dorm_curtain', '#d8d2c2', rough=0.95), 'trim': L.flat('dorm_trim', '#ebe8e1', rough=0.5),
    'white': L.flat('dorm_frame_white', '#f1f0eb', rough=0.42),                               # 床架、床欄、層架、階梯側板（白色烤漆）
    'wood': L.pbr('dorm_wood', 'walnut_veneer', tile=0.8, target='#d2b893', contrast=0.85, maps=('diff',), res=512, rough_value=0.5),   # 書桌、衣櫃、踏板（淺木紋）
    'door': L.pbr('dorm_door', 'walnut_veneer', tile=1.4, target='#9b7756', maps=('diff',), res=256, rough_value=0.45),
    'metal': L.flat('dorm_metal', '#a7acb1', rough=0.35, metal=0.45), 'chrome': L.flat('dorm_chrome', '#c9ced2', rough=0.18, metal=0.45),
    'rod': L.flat('dorm_rod', '#e9e9e6', rough=0.3, metal=0.2),
    'black': L.flat('dorm_black', '#202225', rough=0.45), 'chair': L.flat('dorm_chair_white', '#f2f2ef', rough=0.32),
    # 上舖（1.5 m 以上）的材質名稱加 seethru_：遊戲載入時標成 userData.seeThrough，鏡頭被擋時走樹幹透視（LAWWW-B 00:58）
    'pillow': L.flat('dorm_pillow', '#fbfaf6', rough=0.95),
    'tframe': L.flat('seethru_dorm_frame_white', '#f1f0eb', rough=0.42), 'trod': L.flat('seethru_dorm_rod', '#e9e9e6', rough=0.3, metal=0.2),
    'tsheet': L.flat('seethru_dorm_sheet', '#eef0f0', rough=0.9), 'tpillow': L.flat('seethru_dorm_pillow', '#fbfaf6', rough=0.95),
    'ac': L.flat('dorm_ac', '#f3f3f0', rough=0.35),
    'lcd': L.flat('dorm_lcd', '#7fa8c9', rough=0.2, emit=B.srgb('#5f86a8')), 'led': L.flat('dorm_lamp_bulb', '#fff4d8', rough=0.3, emit=B.srgb('#ffe9b8')),
    'items': L.vc_material('dorm_items', rough=0.6),
    'tile_w': L.pbr('dorm_bath_tile', 'long_white_tiles', tile=1.2, target='#eeeeea', maps=('diff', 'nor'), res=256, rough_value=0.25),
    'tile_f': L.pbr('dorm_bath_floor', 'floor_tiles_06', tile=0.8, target='#bfc0bd', maps=('diff',), res=256, rough_value=0.4),
    'ceramic': L.flat('dorm_ceramic', '#f7f7f5', rough=0.12), 'mirror': L.flat('dorm_mirror', '#d4dadd', rough=0.04, metal=0.45),
    'shower': L.flat('dorm_shower_curtain', '#cfe0e6', rough=0.6, alpha=0.85), 'bdoor': L.flat('dorm_bath_door', '#ecebe6', rough=0.4),
}
walls = {k: [] for k in DIRS}


def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=T):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


def soft_box(m, x0, x1, y0, y1, z0, z1, r=0.03, seg=2):
    bm = bmesh.new(); L.bm_box(bm, x0, x1, y0, y1, z0, z1)
    r = min(r, abs(x1 - x0) / 2.2, abs(y1 - y0) / 2.2, abs(z1 - z0) / 2.2)
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=r, segments=seg, affect='EDGES', profile=0.5)
    m.add_bm(bm); bm.free(); return m


def sweep(m, pts, r, seg=6, caps=True):
    P = [g2b(*p) for p in pts]; bm = m.bm; rings = []
    T_ = [(P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized() for i in range(len(P))]
    ref = Vector((0, 0, 1)) if abs(T_[0].z) < 0.9 else Vector((1, 0, 0)); N = [T_[0].cross(ref).normalized()]
    for t in T_[1:]:
        n = N[-1] - t * N[-1].dot(t); N.append(n.normalized() if n.length > 1e-6 else t.cross(ref).normalized())
    for p, t, n in zip(P, T_, N):
        b = t.cross(n); rings.append([bm.verts.new(p + (n * math.cos(2 * math.pi * k / seg) + b * math.sin(2 * math.pi * k / seg)) * r) for k in range(seg)])
    for a, b_ in zip(rings, rings[1:]):
        for k in range(seg):
            j = (k + 1) % seg; bm.faces.new((a[k], a[j], b_[j], b_[k]))
    if caps: bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return m


def bend(pts, r=0.06, n=4):
    """折線的轉角改成圓弧（扶手、吊桿的彎）"""
    out = [pts[0]]
    for a, b, c in zip(pts, pts[1:], pts[2:]):
        A_, B_, C_ = Vector(a), Vector(b), Vector(c); d1 = (A_ - B_); d2 = (C_ - B_); l1, l2 = d1.length, d2.length
        rr = min(r, l1 / 2, l2 / 2); p1 = B_ + d1.normalized() * rr; p2 = B_ + d2.normalized() * rr
        for k in range(n + 1):
            t = k / n; q = (1 - t) ** 2 * p1 + 2 * (1 - t) * t * B_ + t ** 2 * p2; out.append(tuple(q))
    out.append(pts[-1]); return out


def fin(m, parent=None, smooth=None, uv=True, props=None):
    if m.empty(): return None
    bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
    ob = m.finish(parent or root, uv=uv, props=props)
    if smooth: L.smooth_mesh(ob, angle=smooth)
    return ob


# 床桌組用的「沿牆座標」：u＝z、v＝離牆距離；右牆往 −x、左牆往 +x
def wx(side, v): return IX1 - v if side == 'R' else IX0 + v
def W3(side, u, y, v): return (wx(side, v), y, u)
def lbox(m, side, u0, u1, y0, y1, v0, v1, fn='box', **kw):
    xa, xb = sorted((wx(side, v0), wx(side, v1)))
    if fn == 'box': return m.box(xa, xb, y0, y1, u0, u1)
    if fn == 'rbox': return m.rbox(xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'soft': return soft_box(m, xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'cbox': return m.cbox(xa, xb, y0, y1, u0, u1, **kw)
    if fn == 'crbox': return m.crbox(xa, xb, y0, y1, u0, u1, **kw)


# ======================================================================= 房間：地板、天花板、燈
Mesh('dorm_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root, props={'lm': 1.3, 'lmhide': 'side,down'})   # lm、lmhide：光照烘焙（DORM203-LM-1030，bake_dorm_room4.sh）分給地板多一點；地板方塊的四邊埋在牆裡、底面看不到
ce = Mesh('dorm_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False, props={'lm': 0.35})   # 天花板：玩家鏡頭往下看，幾乎看不到
tb = Mesh('dorm_tubes', M['tube']); fx = Mesh('dorm_fixtures', M['fixture'])
for (cx, cz, r) in ((0.0, -1.7, 0.24), (0.0, 0.7, 0.24), (1.8, 2.45, 0.13)):     # 圓形吸頂燈（照片）：外殼＋乳白燈罩；最後一盞在洗手間
    fx.add_bm(L.lathe([(r, 0.0), (r, -0.035), (r - 0.02, -0.045), (0.0, -0.045)], seg=24), Matrix.Translation(g2b(cx, H - 0.002, cz)))
    tb.add_bm(L.lathe([(r - 0.03, 0.0), (r - 0.04, -0.012), (0.0, -0.016)], seg=24), Matrix.Translation(g2b(cx, H - 0.046, cz)))
fx.cyl((-1.4, H - 0.002, -0.4), (-1.4, H - 0.035, -0.4), 0.055, seg=14)        # 偵煙器
tb.finish(root, uv=False); fin(fx, smooth=0.8, uv=False)

# ======================================================================= 牆：白漆＋淺灰踢腳板；後牆有窗、前牆有門
for side in ('left', 'right'):
    wall_box(side, 'wall', Z0, Z1, 0.0, H)
x0w, x1w, y0w, y1w = WIN
for a0, a1 in ((X0 + T, x0w), (x1w, X1 - T)): wall_box('back', 'wall', a0, a1, 0.0, H)   # 前後牆夾在左右牆中間（牆角不重疊：牆淡出時從外面看不會閃）
wall_box('back', 'wall', x0w, x1w, 0.0, y0w); wall_box('back', 'wall', x0w, x1w, y1w, H)
dx0, dx1, dh = DOOR
for a0, a1 in ((X0 + T, dx0), (dx1, X1 - T)): wall_box('front', 'wall', a0, a1, 0.0, H)
wall_box('front', 'wall', dx0, dx1, dh, H)
# 踢腳板：只放在露出來的牆腳（床桌組底下、洗手間裡面不放）
sk = lambda side, a0, a1: wall_box(side, 'skirt', a0, a1, 0.0, 0.08, T, T + 0.012)
sk('back', -1.94, 1.94)
sk('front', -1.9, dx0 - 0.07); sk('front', dx1 + 0.07, BATH['x0'] - 0.005)
sk('left', 1.41, IZ1 - 0.012)

# 窗：鋁框推拉窗（兩扇）、窗台、窗洞側面、捲簾（拉下三分之一）
fr = wm('back', 'alu'); zf = Z0 + 0.05
for y in (y0w, y1w - 0.05): fr.box(x0w, x1w, y, y + 0.05, zf - 0.03, zf + 0.04)
for x in (x0w, x1w - 0.05): fr.box(x, x + 0.05, y0w + 0.05, y1w - 0.05, zf - 0.03, zf + 0.04)
xm = (x0w + x1w) / 2
for dx, dz in ((-0.025, -0.015), (0.025, 0.015)): fr.box(xm + dx - 0.022, xm + dx + 0.022, y0w + 0.05, y1w - 0.05, zf + dz - 0.012, zf + dz + 0.012)
for x0s, x1s, dz in ((x0w + 0.05, xm + 0.003, -0.015), (xm - 0.003, x1w - 0.05, 0.015)):
    for y in (y0w + 0.05, y1w - 0.09): fr.box(x0s, x1s, y, y + 0.04, zf + dz - 0.012, zf + dz + 0.012)
fr.box(x1w - 0.09, x1w - 0.07, 1.55, 1.8, zf + 0.03, zf + 0.05)                                     # 把手
gl = wm('back', 'glass')
for x0s, x1s, dz in ((x0w + 0.05, xm, -0.006), (xm, x1w - 0.05, 0.006)):
    gl.quad([(x0s, y0w + 0.09, zf + dz), (x1s, y0w + 0.09, zf + dz), (x1s, y1w - 0.09, zf + dz), (x0s, y1w - 0.09, zf + dz)])
wm('back', 'sill').box(x0w - 0.06, x1w + 0.06, y0w - 0.03, y0w + 0.012, Z0 + 0.04, IZ0 + 0.07)   # 窗台頂高過窗下的牆 1.2 cm（不同平面）
for x0t, x1t in ((x0w - 0.05, x0w), (x1w, x1w + 0.05)): wm('back', 'trim').box(x0t, x1t, y0w - 0.002, y1w + 0.05, IZ0 - 0.004, IZ0 + 0.008)
wm('back', 'trim').box(x0w - 0.05, x1w + 0.05, y1w, y1w + 0.05, IZ0 - 0.004, IZ0 + 0.008)
bl = wm('back', 'blind'); zb_ = IZ0 + 0.05; ybot = y1w - 0.52                                      # 捲簾：捲軸盒、布、下襬桿、拉繩
wm('back', 'trim').rbox(x0w - 0.04, x1w + 0.04, y1w + 0.055, y1w + 0.14, IZ0 + 0.008, IZ0 + 0.1, r=0.012, seg=2)
bl.box(x0w + 0.02, x1w - 0.02, ybot, y1w + 0.06, zb_ - 0.002, zb_ + 0.002)
wm('back', 'alu').box(x0w + 0.01, x1w - 0.01, ybot - 0.025, ybot, zb_ - 0.01, zb_ + 0.01)
wm('back', 'rod').cyl((x1w - 0.12, ybot, zb_ + 0.012), (x1w - 0.12, ybot - 0.45, zb_ + 0.012), 0.003, seg=4)

# 門：木門（關著）、白色門框、壓把、門檔、門下的通風百葉、電燈開關
tr = wm('front', 'trim'); zi = IZ1
for xa, xb in ((dx0 - 0.07, dx0 + 0.003), (dx1 - 0.003, dx1 + 0.07)): tr.box(xa, xb, 0.0, dh + 0.07, zi - 0.015, zi + 0.01)   # 門框往門洞裡多 3 mm（和門洞側面不同平面）
tr.box(dx0 - 0.07, dx1 + 0.07, dh - 0.003, dh + 0.07, zi - 0.015, zi + 0.01)
wm('front', 'door').box(dx0 + 0.01, dx1 - 0.01, 0.01, dh - 0.01, zi + 0.02, zi + 0.06)
for y0, y1 in ((0.25, 0.95), (1.15, 1.85)): wm('front', 'door').box(dx0 + 0.12, dx1 - 0.12, y0, y1, zi + 0.012, zi + 0.02)
lv = wm('front', 'black')
for i in range(5): lv.box(dx0 + 0.25, dx1 - 0.25, 0.08 + i * 0.028, 0.095 + i * 0.028, zi + 0.012, zi + 0.02)
ch_ = wm('front', 'chrome'); ch_.cyl((dx1 - 0.12, 1.0, zi + 0.02), (dx1 - 0.12, 1.0, zi - 0.03), 0.028, seg=10); ch_.cyl((dx1 - 0.12, 1.0, zi - 0.03), (dx1 - 0.25, 1.0, zi - 0.045), 0.012, seg=6)
ch_.cyl((dx0 + 0.15, 0.0, zi - 0.12), (dx0 + 0.15, 0.04, zi - 0.12), 0.025, seg=8)
sw = wm('front', 'trim'); sw.box(dx0 - 0.3, dx0 - 0.22, 1.22, 1.34, zi - 0.012, zi)
wm('front', 'black').box(dx0 - 0.275, dx0 - 0.245, 1.255, 1.305, zi - 0.016, zi - 0.012)
hk = wm('front', 'chrome')                                                                           # 門左邊的掛勾＋毛巾、帆布袋
for i in range(4):
    x = -2.3 + i * 0.22; hk.box(x - 0.012, x + 0.012, 1.68, 1.74, zi - 0.02, zi); hk.cyl((x, 1.7, zi - 0.02), (x, 1.75, zi - 0.07), 0.008, seg=5)
hk.box(-2.42, -1.56, 1.66, 1.76, zi - 0.012, zi)
soft_box(wm('front', 'blind'), -2.24, -1.94, 1.12, 1.71, zi - 0.06, zi - 0.03, r=0.012, seg=1)
soft_box(wm('front', 'pillow'), -1.88, -1.56, 1.22, 1.62, zi - 0.1, zi - 0.04, r=0.02, seg=1)

# 冷氣（後牆、窗的右上方）＋冷媒管蓋板
ac = wm('back', 'ac'); soft_box(ac, 0.25, 1.15, 2.55, 2.84, IZ0, IZ0 + 0.22, r=0.03, seg=2)
wm('back', 'black').box(0.3, 1.1, 2.555, 2.575, IZ0 + 0.12, IZ0 + 0.225)
wm('back', 'trim').box(1.14, 1.4, 2.6, 2.66, IZ0, IZ0 + 0.06); wm('back', 'trim').box(1.34, 1.4, 2.66, 2.97, IZ0, IZ0 + 0.06)

# ======================================================================= 洗手間（進門右邊）：隔間牆＋門；裡面：馬桶、洗手台、鏡子、淋浴間
bx0, bx1, bz0, bz1, bt = BATH['x0'], BATH['x1'], BATH['z0'], BATH['z1'], BATH['t']
d0, d1 = BATH['door']; bdh = BATH['door_h']
wm('bath_n', 'wall').box(bx0 - bt / 2, X1 - 0.05, -0.01, H + 0.01, bz0 - bt / 2, bz0 + bt / 2)         # 北面隔間（伸進右牆裡）
bw = wm('bath_w', 'wall')
bw.box(bx0 - bt / 2, bx0 + bt / 2, -0.01, H + 0.01, bz0 + bt / 2, d0)
bw.box(bx0 - bt / 2, bx0 + bt / 2, -0.01, H + 0.01, d1, Z1 - 0.05)
bw.box(bx0 - bt / 2, bx0 + bt / 2, bdh, H + 0.01, d0, d1)
xo = bx0 - bt / 2                                                                                     # 隔間牆在房間那一面
wm('bath_n', 'skirt').box(bx0 - bt / 2 - 0.012, IX1 - 0.95 - 0.02, 0.0, 0.08, bz0 - bt / 2 - 0.012, bz0 - bt / 2)
wm('bath_w', 'skirt').box(xo - 0.012, xo, 0.0, 0.08, bz0 - bt / 2 - 0.012, d0 - 0.06)
wm('bath_w', 'skirt').box(xo - 0.012, xo, 0.0, 0.08, d1 + 0.06, IZ1 - 0.012)
bt_ = wm('bath_w', 'trim')
for za, zb in ((d0 - 0.06, d0 + 0.003), (d1 - 0.003, d1 + 0.06)): bt_.box(xo - 0.015, xo + 0.01, 0.0, bdh + 0.06, za, zb)
bt_.box(xo - 0.015, xo + 0.01, bdh - 0.003, bdh + 0.06, d0 - 0.06, d1 + 0.06)
bd = wm('bath_w', 'bdoor'); bd.box(bx0 - 0.02, bx0 + 0.02, 0.01, bdh - 0.01, d0 + 0.01, d1 - 0.01)
for y0, y1 in ((0.3, 0.95), (1.15, 1.85)): bd.box(xo - 0.008, bx0 - 0.02, y0, y1, d0 + 0.12, d1 - 0.12)
for i in range(6): wm('bath_w', 'black').box(xo - 0.008, bx0 - 0.02, 0.06 + i * 0.03, 0.075 + i * 0.03, d0 + 0.2, d1 - 0.2)
bch = wm('bath_w', 'chrome'); bch.cyl((bx0 - 0.02, 1.0, d0 + 0.1), (xo - 0.05, 1.0, d0 + 0.1), 0.025, seg=10); bch.cyl((xo - 0.05, 1.0, d0 + 0.1), (xo - 0.065, 1.0, d0 + 0.23), 0.011, seg=6)
# 裡面（鏡頭進到洗手間時看得到）
bi0, bi1, bj0, bj1 = bx0 + bt / 2, IX1, bz0 + bt / 2, IZ1
Mesh('dorm_bath_floor', M['tile_f']).box(bi0, bi1, 0.0, 0.015, bj0, bj1).finish(root)
tw = Mesh('dorm_bath_tile', M['tile_w'])
tw.box(bi0, bi1 - 0.003, 0.015, 2.2, bj0, bj0 + 0.008); tw.box(bi0, bi1 - 0.003, 0.015, 2.2, bj1 - 0.008, bj1 - 0.004)
tw.box(bi0, bi0 + 0.008, 0.015, 2.2, bj0 + 0.008, d0); tw.box(bi0, bi0 + 0.008, 0.015, 2.2, d1, bj1 - 0.008); tw.box(bi0, bi0 + 0.008, bdh + 0.004, 2.2, d0, d1)
tw.box(bi1 - 0.008, bi1 - 0.004, 0.015, 2.2, bj0 + 0.008, bj1 - 0.008)
fin(tw)
# 貼著前牆、右牆（房間的外牆）的那兩片：朝外那一面是油漆牆（LAWWW2-B 10-24 巡查 P3）。原本整片是磁磚方塊，鏡頭在門外、前牆淡出時，
# 房間右邊露出一整片浴室磁磚，像浴室翻到外面（每天早上起床的鏡頭）。磁磚只留在洗手間裡面那一面；兩層中間空 0.5 mm，不疊面
po = Mesh('dorm_bath_outer', M['wall'])
po.box(bi0, bi1 - 0.003, 0.015, 2.2, bj1 - 0.0035, bj1); po.box(bi1 - 0.0035, bi1, 0.015, 2.2, bj0 + 0.008, bj1 - 0.008)
fin(po)
cer = Mesh('dorm_ceramic', M['ceramic'])
tx, tz = bi1 - 0.36, bj1 - 0.42                                                                      # 馬桶（面向 −x）
cer.add_bm(L.lathe([(0.0, 0.0), (0.12, 0.0), (0.16, 0.2), (0.19, 0.38), (0.17, 0.4), (0.0, 0.4)], seg=16), Matrix.Translation(g2b(tx, 0.015, tz)) @ Matrix.Scale(1.0, 4))
cer.rbox(tx + 0.12, tx + 0.3, 0.38, 0.78, tz - 0.2, tz + 0.2, r=0.03, seg=2)
cer.add_bm(L.lathe([(0.0, 0.0), (0.2, 0.0), (0.2, 0.025), (0.0, 0.025)], seg=16), Matrix.Translation(g2b(tx - 0.02, 0.4, tz)))
sx_, sz_ = bi0 + 0.62, bj0 + 0.3                                                                      # 洗手台（靠北面隔間）＋鏡子
cer.rbox(sx_ - 0.28, sx_ + 0.28, 0.72, 0.86, bj0 + 0.008, bj0 + 0.47, r=0.04, seg=2)
cer.cyl((sx_, 0.0, bj0 + 0.15), (sx_, 0.72, bj0 + 0.15), 0.07, seg=12)
fin(cer, smooth=0.7, uv=False)
mr = Mesh('dorm_mirror', M['mirror']); mr.box(sx_ - 0.3, sx_ + 0.3, 1.1, 1.8, bj0 + 0.008, bj0 + 0.02); fin(mr, uv=False)
bch2 = Mesh('dorm_chrome', M['chrome']); bch2.cyl((sx_, 0.86, bj0 + 0.06), (sx_, 1.0, bj0 + 0.06), 0.015, seg=8); bch2.cyl((sx_, 1.0, bj0 + 0.06), (sx_, 0.97, bj0 + 0.17), 0.012, seg=6)
bch2.cyl((bi1 - 0.9, 2.05, bj0 + 0.008), (bi1 - 0.9, 2.05, bj0 + 0.95), 0.012, seg=8)                # 淋浴間的浴簾桿（東北角）
bch2.cyl((bi1 - 0.008, 1.9, bj0 + 0.45), (bi1 - 0.2, 1.9, bj0 + 0.45), 0.02, seg=8); bch2.sphere((bi1 - 0.2, 1.88, bj0 + 0.45), 0.05, seg=10, rings=6)
fin(bch2, smooth=0.8, uv=False)
shc = Mesh('dorm_shower_curtain', M['shower']); n = 12
rows = []
for yy in (2.03, 1.1, 0.12):
    row = [shc.bm.verts.new(g2b(bi1 - 0.9 + 0.035 * (1 if k % 2 else -1), yy, bj0 + 0.03 + k * 0.035)) for k in range(n + 1)]; rows.append(row)
for a, b_ in zip(rows, rows[1:]):
    for k in range(n): shc.bm.faces.new((a[k], a[k + 1], b_[k + 1], b_[k]))
fin(shc, uv=False)

# ======================================================================= 標示：洗手間門牌、經濟系第一晚的床位名牌（一張貼圖、PIL 寫字）
def make_labels(path):
    from PIL import Image as PI, ImageDraw as PD, ImageFont as PF
    font = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
    im = PI.new('RGB', (512, 256), (236, 236, 232)); d = PD.Draw(im)
    d.rounded_rectangle([4, 4, 507, 123], radius=14, fill=(240, 240, 236), outline=(120, 124, 128), width=4)   # 洗手間門牌（上半）
    for cx, col in ((70, (52, 86, 140)), (138, (176, 60, 58))):                                              # 男女圖示
        d.ellipse([cx - 13, 22, cx + 13, 48], fill=col)
        if cx < 100: d.rounded_rectangle([cx - 18, 52, cx + 18, 104], radius=8, fill=col)
        else: d.polygon([(cx, 50), (cx - 24, 104), (cx + 24, 104)], fill=col)
    d.line([104, 22, 104, 104], fill=(140, 140, 140), width=3)
    d.text((182, 28), '洗手間', fill=(60, 62, 66), font=PF.truetype(font, 62))
    for x0, name in ((0, '唐睿'), (256, '韋綸')):                                                            # 名牌（下半，各 256×128）
        d.rectangle([x0 + 6, 134, x0 + 249, 249], fill=(250, 250, 246), outline=(70, 110, 170), width=6)
        d.text((x0 + 22, 140), '412', fill=(70, 110, 170), font=PF.truetype(font, 28))
        d.text((x0 + 58, 170), name, fill=(40, 40, 44), font=PF.truetype(font, 66))
    os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path)
    return path


def img_mat(name, path, rough=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = rough; m.use_backface_culling = True; return m


LABEL_MAT = img_mat('dorm_labels', make_labels(os.path.join(TEXGEN, 'dorm_labels.png')))


def label_quad(name, parent, pts, uvr):
    """貼圖的一塊（uvr＝u0,v0,u1,v1；v 從圖的下面算）貼在一個四邊形上；pts＝左下、右下、右上、左上（從正面看）"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    u0, v0, u1, v1 = uvr
    for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
    return B.mesh_obj(name, bm, LABEL_MAT, parent)


# ======================================================================= 床桌組
wood = Mesh('dorm_wood', M['wood'], tile=1.0); wht = Mesh('dorm_frame_white', M['white']); met = Mesh('dorm_metal', M['metal'])
chair = Mesh('dorm_chair_white', M['chair']); led = Mesh('dorm_led', M['led']); it = CMesh('dorm_items', M['items'])
BOOK = ['#7a1f24', '#2f4f6b', '#e3d9c2', '#3e5a48', '#b88a3a', '#5a4a6a', '#c9c3b5', '#1f3b57', '#8c3b47', '#d6cdb8', '#4a6c8c', '#a35a2a']
IG = {}


def ig(name, props=None):
    """一組可以整組藏起來的東西（誰的桌上、哪一年）：頂點色雜物、黑色、螢幕、金屬、燈泡各一個網格"""
    if name not in IG:
        IG[name] = {'g': B.group(name, root, dict({'kind': 'room_items'}, **(props or {}))), 'it': CMesh(f'{name}_items', M['items']), 'blk': Mesh(f'{name}_black', M['black']),
                    'lcd': Mesh(f'{name}_screen', M['lcd']), 'met': Mesh(f'{name}_metal', M['metal']), 'led': Mesh(f'{name}_bulb', M['led']), 'fab': Mesh(f'{name}_fabric', M['blind'])}
    return IG[name]


def painted(cm, fn, hexcol):
    """在頂點色網格上加一個形狀（fn 往 cm 裡加面），新加的面塗色"""
    n0 = len(cm.bm.faces); fn(); cm.bm.faces.ensure_lookup_table(); cm.paint([cm.bm.faces[i] for i in range(n0, len(cm.bm.faces))], hexcol)


def books_row(im, side, ua, ub, y, v0, tall=0.28, neat=False, cols=None, rng=None):
    R = rng or random   # 大二～大四的東西用自己的亂數（rng）：不改到 203／412 那些書的樣子
    u = ua
    while u < ub - 0.04:
        if not neat and R.random() < 0.08: u += R.uniform(0.04, 0.1); continue
        w = R.uniform(0.022, 0.05) if not neat else 0.034; h = tall * (R.uniform(0.72, 1.0) if not neat else 0.96); d = R.uniform(0.17, 0.22) if not neat else 0.2
        if u + w > ub: break
        lbox(im, side, u, u + w, y, y + h, v0, v0 + d, fn='cbox', hexcol=R.choice(cols or BOOK), k=R.uniform(0.85, 1.05) if not neat else 1.0); u += w + (0.002 if not neat else 0.001)


LAYOUT = {'version': 'loft4-v2',
          'room': {'w': W, 'd': D, 'h': H, 'door': {'x0': dx0, 'x1': dx1}, 'exit': [0, 3.3], 'spawn': [0, 2.4]},
          'window': {'x0': x0w, 'x1': x1w, 'y0': y0w, 'y1': y1w, 'view_center': [0.0, round((y0w + y1w) / 2, 3)], 'view_size': [x1w - x0w, y1w - y0w], 'winXs': [0]},
          'bath': {'block': {'x': [round(bx0 - bt / 2, 3), IX1], 'z': [round(bz0 - bt / 2, 3), IZ1]}, 'door_z': [d0, d1], 'door_face_x': round(xo, 3),
                   'look_point': [round(xo - 0.45, 3), round((d0 + d1) / 2, 3)], 'label': '洗手間（門關著）'},
          'calendar_spot': {'x': 1.25, 'y': 1.75, 'z': round(bz0 - bt / 2 - 0.006, 3), 'ry': math.pi, 'note': '洗手間北面隔間朝房間那一面（空牆），面向 −z'},
          'units': [], 'blocks': [],
          'sets': {'203': '藏 Y412_*、NAMETAG_*；其他照常', '412': '藏 Y203_*、ROOMMATE_KAI；阿勳的書桌、保齡球袋、紙箱用 v0_dorm_props（位置見 units 的 412）',
                   '412_first_night': '412 再藏 Y412_TANGRUI、Y412_WEILUN、BEDDING_R1、BEDDING_L1，顯示 NAMETAG_TANGRUI、NAMETAG_WEILUN（AA_208 第 3 節）',
                   '312': '大二（AA_208 第 7 節）：只顯示 Y312_*；藏 Y203_*、ROOMMATE_KAI、Y412_*、Y507_*、Y409_*、NAMETAG_*',
                   '507': '大三（第 8 節）：只顯示 Y507_*；其他年份的都藏', '409': '大四（第 8 節）：只顯示 Y409_*；其他年份的都藏',
                   'note': '203、412 那幾組也要藏 Y312_／Y507_／Y409_（2026-10-17 加的三年）'}}


def plastic_chair(side, u, v):
    """白色塑膠椅（照片）：座面、彎的椅背、四支金屬腳；面向牆"""
    lbox(chair, side, u - 0.22, u + 0.22, 0.42, 0.455, v - 0.2, v + 0.21, fn='soft', r=0.02, seg=2)
    bmB = bmesh.new(); L.bm_box(bmB, -0.21, 0.21, 0.0, 0.34, -0.012, 0.012)
    for vv in bmB.verts: vv.co.y += 0.05 * (vv.co.x / 0.21) ** 2
    x_, _, z_ = W3(side, u, 0, v + 0.24)
    chair.add_bm(bmB, Matrix.Translation(g2b(x_, 0.58, z_)) @ Matrix.Rotation(math.pi / 2 if side == 'R' else -math.pi / 2, 4, 'Z') @ Matrix.Rotation(0.12, 4, 'X')); bmB.free()
    for du, dv in ((-0.18, -0.16), (0.18, -0.16), (-0.18, 0.17), (0.18, 0.17)):
        met.cyl(W3(side, u + du, 0.42, v + dv), W3(side, u + du * 1.12, 0.0, v + dv * 1.15), 0.011, seg=6)
    for du in (-0.16, 0.16): met.cyl(W3(side, u + du, 0.44, v + 0.2), W3(side, u + du * 0.9, 0.6, v + 0.235), 0.009, seg=5)


def make_jacket_tex(path):
    """椅背外套的貼圖（X140 SK02-LINE-JACKET-1030）：左半＝外套身體（衣領 → 背後 → 下襬，1024 px／m），右半＝兩隻袖子。
    和祐廷 VRM 的 JACKET_ECON 同一件（tools/jacket_econ.py）：深藍、羅紋＋兩條米白細線、背後「CIU」「ECON」（不能有臺大、NTU、真實校徽）。"""
    from PIL import Image as PI, ImageDraw as PD, ImageFont as PF
    S = 1024; im = PI.new('RGB', (S, S), JK_NAVY); d = PD.Draw(im); R = random.Random(140)
    for _ in range(9000):                                                          # 布紋：很淡的雜點
        x, y = R.randrange(S), R.randrange(S); c = R.choice((-6, -4, 4, 6)); d.point((x, y), fill=tuple(max(0, min(255, k + c)) for k in JK_NAVY))
    def rib(x0, x1, y0, y1, lines):
        d.rectangle([x0, y0, x1, y1], fill=JK_RIB)
        for x in range(x0, x1, 4): d.line([x, y0, x, y1], fill=tuple(k - 6 for k in JK_RIB))
        for ly in lines: d.rectangle([x0, ly - 2, x1, ly + 2], fill=JK_LINE)
    L_ = JK_PATH_LEN
    rib(0, 511, 0, int(0.05 * S), [])                                              # 衣領（座位那一側往下摺的那一段）
    rib(0, 511, int((L_ - 0.05) * S), int(L_ * S), [int((L_ - 0.022) * S), int((L_ - 0.030) * S)])   # 下襬
    for xs in (512, 768): rib(xs, xs + 255, int((JK_SLEEVE_LEN - 0.05) * S), int(JK_SLEEVE_LEN * S), [int((JK_SLEEVE_LEN - 0.022) * S), int((JK_SLEEVE_LEN - 0.030) * S)])   # 袖口
    serif = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
    for s, px, cy in (('CIU', 34, JK_TEXT_T - 0.035), ('ECON', 60, JK_TEXT_T + 0.025)):   # 背後的字（從背後看：u 往右）
        f = PF.truetype(serif, px); x0, y0, x1, y1 = f.getbbox(s); d.text((256 - (x1 - x0) / 2 - x0, cy * S - (y1 - y0) / 2 - y0), s, fill=JK_TEXT, font=f)
    os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path)
    return path


JK_NAVY, JK_RIB, JK_LINE, JK_TEXT = (46, 58, 88), (35, 44, 68), (232, 227, 214), (236, 232, 220)
JK_PATH_LEN, JK_SLEEVE_LEN, JK_TEXT_T = 0.74, 0.5, 0.25   # 外套身體沿著垂掛路線的長度（m）、袖子長、背後的字中心離衣領多遠


def jacket_chair(side, cu, v, parent):
    """椅背上的系外套 JACKET_CHAIR（X140；AA 定：回宿舍掛椅背、大二起一直掛）：衣領跨過椅背上緣往座位那一側摺下來一點，
    背面（印「CIU ECON」）朝走道垂到椅背下面，兩隻袖子從肩膀垂在背面兩側。遊戲預設藏起來（zones3d 照劇情顯示）；烘焙時不算（--hide ^JACKET_）。"""
    mat = img_mat('dorm_jacket_chair', make_jacket_tex(os.path.join(TEXGEN, 'dorm_jacket_chair.png')), rough=0.9); mat.use_backface_culling = False
    g = B.group('JACKET_CHAIR', parent, {'kind': 'jacket_chair', 'unit': 'L2', 'note': '祐廷的經濟系系外套（掛在椅背）'})
    sgn = 1 if side == 'L' else -1                                                   # v（離牆）往走道 → 世界 x 的方向
    # 椅背（plastic_chair 匯出後量的）：0.024 厚的板子，下緣 0.585 m、上緣 0.925 m；中心 v＝v+0.29（下）→ v+0.249（上）——往座位那邊斜
    yb0, yt = 0.585, 0.925
    vout = lambda h: v + 0.302 - (h - yb0) * 0.1206                                  # 椅背朝走道那一面
    vin = lambda h: vout(h) - 0.024
    # 垂掛路線（v＝離牆、h＝高度），從座位那一側的衣領 → 跨過上緣 → 沿椅背背面 → 椅背下面垂直掛著
    path = [(vin(yt) - 0.025, yt - 0.075), (vin(yt) - 0.022, yt - 0.03), (vin(yt) - 0.012, yt + 0.01), ((vin(yt) + vout(yt)) / 2, yt + 0.02),
            (vout(yt) + 0.012, yt + 0.01), (vout(yt) + 0.022, yt - 0.025)]
    for k in range(1, 7):
        h = yt - 0.025 - (yt - 0.025 - yb0) * k / 6; path.append((vout(h) + 0.022, h))
    for h in (0.5, 0.42, 0.35): path.append((path[-1][0] + 0.004, h))
    tl = [0.0]
    for a, b in zip(path, path[1:]): tl.append(tl[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    sc = JK_PATH_LEN / tl[-1]
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); NA = 14; rows = []
    for (d0, h0), t in zip(path, tl):
        row = []
        for i in range(NA + 1):
            s = i / NA; a = (s - 0.5) * (0.5 if h0 > yt - 0.06 else 0.52)
            sag = max(0.0, abs(a) - 0.2) * 0.55 if h0 > yt - 0.1 else 0.0          # 肩膀超出椅背寬度的地方往下垂
            wav = 0.006 * math.sin(a * 31 + h0 * 7) * (1 if h0 < yb0 + 0.05 else 0.4)   # 下面那段有皺褶
            dd = d0 + wav + (0.012 if abs(a) > 0.2 else 0.0)
            row.append((bm.verts.new(g2b(*W3(side, cu + a, h0 - sag, dd))), s, t * sc))
        rows.append(row)
    for r0, r1 in zip(rows, rows[1:]):
        for i in range(NA):
            f = bm.faces.new((r0[i][0], r0[i + 1][0], r1[i + 1][0], r1[i][0]))
            for lp, (_, s, t) in zip(f.loops, (r0[i], r0[i + 1], r1[i + 1], r1[i])): lp[uvl].uv = (0.5 - s * 0.5 if sgn > 0 else s * 0.5, 1 - t)   # 從走道看背面：L 側看的人的右手邊是 −u
    # 袖子：肩膀（背面、比上緣低 6 cm）垂到 0.40 m，扁的管子（貼著背面那一層）
    for k, sa in enumerate((-1, 1)):
        N_, M_ = 8, 10; ring = []
        for j in range(M_ + 1):
            q = j / M_; h = (yt - 0.06) * (1 - q) + 0.40 * q; a = sa * (0.225 + 0.03 * q - 0.02 * math.sin(math.pi * q))
            dd = vout(max(h, yb0)) + 0.022 + 0.035 + 0.01 * q; r = 0.052 - 0.01 * q
            rr = []
            for i in range(N_ + 1):
                ph = 2 * math.pi * i / N_
                rr.append((bm.verts.new(g2b(*W3(side, cu + a + r * math.cos(ph), h, dd + 0.45 * r * math.sin(ph)))), i / N_, q * JK_SLEEVE_LEN))
            ring.append(rr)
        for r0, r1 in zip(ring, ring[1:]):
            for i in range(N_):
                f = bm.faces.new((r0[i][0], r0[i + 1][0], r1[i + 1][0], r1[i][0]))
                for lp, (_, s, t) in zip(f.loops, (r0[i], r0[i + 1], r1[i + 1], r1[i])): lp[uvl].uv = (0.5 + 0.25 * k + 0.25 * s, 1 - t)
    bm.normal_update()
    ob = B.mesh_obj('JACKET_CHAIR_cloth', bm, mat, g); L.smooth_mesh(ob, angle=1.2)
    c = W3(side, cu, (yt + 0.35) / 2, vout(0.64))
    LAYOUT['jacket_chair'] = {'node': 'JACKET_CHAIR', 'unit': 'L2', 'x': round(c[0], 3), 'y': round(c[1], 3), 'z': round(c[2], 3),
                              'note': '祐廷（L2）書桌椅的椅背；每一年都是 L2 同一張椅子。遊戲預設藏起來，劇情決定顯示（X140；AA：回宿舍掛椅背、大二起一直掛）'}


def laptop(G, side, lu, Y, vb=0.17):
    lbox(G['blk'], side, lu - 0.17, lu + 0.17, Y, Y + 0.015, vb + 0.03, vb + 0.27)
    lbox(G['blk'], side, lu - 0.17, lu + 0.17, Y + 0.015, Y + 0.215, vb, vb + 0.02)   # 螢幕上緣 0.975 m：層架底板在 1.00 m（10-30 以前 1.00，剛好頂到；使用者「書桌上東西不要重疊」）
    lbox(G['lcd'], side, lu - 0.16, lu + 0.16, Y + 0.03, Y + 0.205, vb + 0.02, vb + 0.026)


def desk_lamp(G, side, u, Y, v=0.12, du=1.0):
    """檯燈：底座、兩節臂、燈罩、燈泡（燈泡材質 dorm_lamp_bulb 一直亮）；du＝手臂往 +u（1）或 −u（−1）彎"""
    G['met'].cyl(W3(side, u, Y, v), W3(side, u, Y + 0.02, v), 0.07, seg=14)
    sweep(G['met'], [W3(side, u, Y + 0.02, v), W3(side, u + 0.03 * du, Y + 0.32, v + 0.05), W3(side, u + 0.1 * du, Y + 0.42, v + 0.22)], 0.009, seg=5)
    G['blk'].cyl(W3(side, u + 0.1 * du, Y + 0.44, v + 0.22), W3(side, u + 0.1 * du, Y + 0.35, v + 0.26), 0.03, seg=12, r2=0.08)
    G['led'].sphere(W3(side, u + 0.1 * du, Y + 0.37, v + 0.25), 0.026, seg=10, rings=6)


def loft(uid, side, ua, ub, sets):
    ust = ub - STW
    TOPG = B.group(f'LOFT_{uid}_TOP', root, {'kind': 'loft_top', 'unit': uid})          # 1.5 m 以上：鏡頭擋到時遊戲可以整組淡出
    BED = B.group(f'BEDDING_{uid}', TOPG, {'kind': 'bedding', 'unit': uid})              # 被子、枕頭（經濟系第一晚空床時藏起來）
    tf = Mesh(f'LOFT_{uid}_frame', M['tframe']); tr = Mesh(f'LOFT_{uid}_rod', M['trod']); ts = Mesh(f'LOFT_{uid}_sheet', M['tsheet'])
    tdv = Mesh(f'BEDDING_{uid}_duvet', L.flat(f'seethru_dorm_duvet_{uid}', DUVET[uid], rough=0.95)); tpw = Mesh(f'BEDDING_{uid}_pillow', M['tpillow'])
    # ---- 床板、床欄、吊桿、上下床的扶手、床墊
    lbox(tf, side, ua, ust, DECK0, DECK1, 0.005, VD - 0.025)
    lbox(tf, side, ua, ust, DECK0 - 0.08, GUARD, VD - 0.025, VD, fn='rbox', r=0.008, seg=1)
    lbox(tf, side, ua + 0.001, ua + 0.026, DECK1, GUARD, 0.005, VD - 0.025)
    lbox(tf, side, ust - 0.025, ust, DECK1, GUARD, 0.47, VD - 0.025)   # 床尾（階梯那一端）的擋板在走道那一半；靠牆那一半是上床的開口（階梯從走道往牆邊爬，最上面一階靠牆；10-30 以前擋板在靠牆那一半，人從最上面一階上不了床——DORM-SLEEP-VISUAL-1030）
    for uu in (ua + 0.1, ust - 0.12):
        tr.cyl(W3(side, uu, GUARD - 0.02, VD - 0.012), W3(side, uu, H, VD - 0.012), 0.009, seg=8); tr.cyl(W3(side, uu, H - 0.004, VD - 0.012), W3(side, uu, H - 0.012, VD - 0.012), 0.03, seg=12)
    sweep(tf, bend([W3(side, ust - 0.035, DECK1 + 0.05, 0.55), W3(side, ust - 0.035, 2.32, 0.55), W3(side, ust - 0.035, 2.32, 0.88), W3(side, ust - 0.035, GUARD - 0.03, 0.88)], r=0.07), 0.016, seg=8)
    lbox(ts, side, ua + 0.025, ust - 0.025, DECK1, DECK1 + 0.16, 0.03, VD - 0.05, fn='soft', r=0.04, seg=2)   # 床墊 1.92～1.95 m（使用者 10-30「床的比例也要注意」：原本 1.85～1.875，祐廷 1.75 m 躺下只剩 10 cm；標準單人床約 1.9 m）
    neat = sets.get('203') == 'bohan'
    lbox(tdv, side, ua + 0.5, ust - 0.06, DECK1 + 0.1, DECK1 + 0.24, 0.02, VD - 0.04, fn='soft', r=0.05, seg=2)
    if not neat: lbox(tdv, side, ust - 0.5, ust - 0.08, DECK1 + 0.22, DECK1 + 0.3, 0.1, VD - 0.1, fn='soft', r=0.03, seg=2)
    if not neat:
        for v in tdv.bm.verts: v.co.z += 0.012 * math.sin(v.co.x * 9.0 + v.co.y * 5.0)
    lbox(tpw, side, ua + 0.08, ua + 0.46, DECK1 + 0.14, DECK1 + 0.26, 0.15, 0.75, fn='soft', r=0.05, seg=2)
    # ---- 床尾立柱、衣櫃、書桌、層架、LED 燈條
    lbox(wht, side, ua + 0.002, ua + 0.052, 0.0, GUARD, VD, VD + 0.05, fn='rbox', r=0.008, seg=1)
    w0, w1 = ub - STW0 - 0.6, ust - 0.005   # 衣櫃左邊照舊（書桌不動）、右邊貼到新的階梯（寬 0.65）
    lbox(wood, side, w0, w1, 0.0, DECK0 - 0.01, 0.005, 0.585); lbox(wood, side, w0 + 0.008, w1 - 0.008, 0.055, DECK0 - 0.022, 0.585, 0.6)
    lbox(wht, side, w0, w1, 0.0, 0.05, 0.585, 0.6); met.cyl(W3(side, w0 + 0.06, 0.7, 0.615), W3(side, w0 + 0.06, 1.15, 0.615), 0.008, seg=6)
    k0, k1 = ua + 0.02, w0 - 0.025
    lbox(wood, side, k0, k1 + 0.025, 0.73, 0.76, 0.005, 0.62, fn='rbox', r=0.006, seg=1); lbox(wht, side, k1, k1 + 0.022, 0.0, 0.73, 0.005, 0.6)
    lbox(wood, side, k0, k0 + 0.42, 0.0, 0.725, 0.005, 0.56)
    for (y0, y1) in ((0.04, 0.26), (0.28, 0.5), (0.52, 0.72)):
        lbox(wood, side, k0 + 0.008, k0 + 0.412, y0, y1, 0.56, 0.575, fn='rbox', r=0.004, seg=1); lbox(met, side, k0 + 0.16, k0 + 0.26, (y0 + y1) / 2 - 0.007, (y0 + y1) / 2 + 0.007, 0.575, 0.59)
    lbox(wht, side, k0 + 0.42, k1, 0.32, 0.72, 0.005, 0.02)
    s0, s1 = k0 + 0.45, min(k1 - 0.1, k0 + 1.15); sy0, sy1 = 1.0, 1.42; sm = (s0 + s1) / 2
    lbox(wht, side, s0, s1, sy0, sy0 + 0.018, 0.005, 0.27); lbox(wht, side, s0, s1, sy1 - 0.018, sy1, 0.005, 0.27)
    for uu in (s0, sm - 0.009, s1 - 0.018): lbox(wht, side, uu, uu + 0.018, sy0 + 0.018, sy1 - 0.018, 0.005, 0.27)
    lbox(wood, side, s0 + 0.018, s1 - 0.018, sy0 + 0.018, sy1 - 0.018, 0.005, 0.012)
    lbox(led, side, k0 + 0.45, k1 - 0.05, DECK0 - 0.015, DECK0 - 0.005, 0.3, 0.33)
    # ---- 階梯收納櫃＋直扶手
    dd = VD / NST
    for k in range(NST):
        v1 = VD - k * dd; v0 = v1 - dd; top = RISE * (k + 1); bot = RISE * k
        lbox(wood, side, ust + 0.002, ub, top - 0.025, top, v0, v1 + (0.012 if k == 0 else 0.0), fn='rbox', r=0.006, seg=1)
        for (a, b) in ((ust + 0.002, ust + 0.02), (ub - 0.018, ub)): lbox(wht, side, a, b, 0.0, top - 0.025, v0, v1)
        lbox(wht, side, ust + 0.02, ub - 0.018, bot, top - 0.025, v0 + 0.002, v0 + 0.017)
        if k > 0: lbox(wht, side, ust + 0.02, ub - 0.018, bot - 0.018, bot, v0 + 0.017, v1)
    ur = ub - 0.04
    sweep(tf, bend([W3(side, ur, 1.5, VD - dd * 1.6), W3(side, ur, 2.05, dd * 0.6), W3(side, ur, 2.2, dd * 0.6)], r=0.08), 0.016, seg=8)   # 扶手 1.5 m 以上的那段（透視群組）
    sweep(wht, [W3(side, ur, RISE - 0.025, VD - dd / 2), W3(side, ur, 1.12, VD - dd / 2), W3(side, ur, 1.5, VD - dd * 1.6)], 0.016, seg=8)
    wht.cyl(W3(side, ur, RISE * NST, dd * 0.6), W3(side, ur, 1.5, dd * 0.6), 0.014, seg=8); tf.cyl(W3(side, ur, 1.5, dd * 0.6), W3(side, ur, 2.05, dd * 0.6), 0.014, seg=8)
    cu_ = (k0 + 0.45 + k1) / 2
    plastic_chair(side, cu_, 0.86)
    if uid == 'L2' and not ONLY: jacket_chair(side, cu_, 0.86, root)   # 祐廷的椅子：系外套（預設藏）
    lbox(it, side, ust + 0.03, ub - 0.03, 0.0, 0.12, VD - dd + 0.03, VD - 0.02, fn='cbox', hexcol='#e8e2d4')                      # 最下面一格：鞋盒
    for j in range(2): lbox(it, side, ub - 0.38 + j * 0.13, ub - 0.27 + j * 0.13, 0.0, 0.03, VD + 0.1, VD + 0.36, fn='cbox', hexcol={'R1': '#5a5f66', 'R2': '#202225', 'L1': '#3e5a48', 'L2': '#2f4f6b'}[uid])   # 拖鞋
    for m in (tf, tr, ts):
        bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces); ob = m.finish(TOPG, uv=m is tf); L.smooth_mesh(ob, angle=0.6 if m is tf else 0.8)
    for m in (tdv, tpw):
        bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces); ob = m.finish(BED, uv=False); L.smooth_mesh(ob, angle=0.9)
    # ---- 每個人的東西（AA_208 第 4 節）
    Y = 0.76; ctx = dict(side=side, k0=k0, k1=k1, s0=s0, s1=s1, sm=sm, sy0=sy0, ust=ust, ub=ub, ua=ua, cu=cu_, Y=Y)
    for year, who in sets.items():
        fn = ITEMS.get((year, who))
        if fn: fn(**ctx)
    if sets.get('412') in ('tangrui', 'weilun'):                                                       # 經濟系第一晚：床欄上的名牌
        nm = sets['412']; g = B.group(f'NAMETAG_{nm.upper()}', root, {'kind': 'nametag', 'unit': uid}); uc = (ua + ust) / 2; xg = wx(side, VD + 0.003)
        a, b = (uc - 0.11, uc + 0.11) if side == 'R' else (uc + 0.11, uc - 0.11)
        label_quad(f'NAMETAG_{nm.upper()}_card', g, [(xg, 1.78, a), (xg, 1.78, b), (xg, 1.89, b), (xg, 1.89, a)], (0.0, 0.0, 0.5, 0.5) if nm == 'tangrui' else (0.5, 0.0, 1.0, 0.5))
    # ---- 配置資料
    yaw = math.pi / 2 if side == 'R' else -math.pi / 2
    LAYOUT['units'].append({'id': uid, 'side': side, 'sets': sets, 'u': [round(ua, 3), round(ub, 3)], 'stair_u': [round(ust, 3), round(ub, 3)],
                            'block': {'x': sorted((round(wx(side, 0), 3), round(wx(side, VD + 0.05), 3))), 'z': [round(ua, 3), round(ub, 3)]},
                            'seat': {'x': round(wx(side, 0.86), 3), 'z': round(cu_, 3), 'yaw': round(yaw, 4)}, 'seat_approach': [round(wx(side, 1.35), 3), round(cu_, 3)],
                            'desk_center': [round(wx(side, 0.31), 3), round((k0 + k1) / 2, 3)], 'desk_top_y': Y, 'desk_u': [round(k0, 3), round(k1, 3)],
                            'sleep': [round(wx(side, VD + 0.4), 3), round((ust + ub) / 2, 3)], 'bed_top_y': DECK1 + 0.16,
                            'floor_under_bed_spot': [round(wx(side, 0.3), 3), round(w0 - 0.35, 3)],
                            'wall_spot_by_desk': {'x': round(wx(side, 0.004), 3), 'y': 1.2, 'z': round((k0 + s0) / 2, 3), 'ry': -math.pi / 2 if side == 'R' else math.pi / 2, 'note': '書桌前、層架旁邊的空牆（社團傳單）'}})
    LAYOUT['blocks'].append({'id': uid, 'x': sorted((round(wx(side, 0), 3), round(wx(side, VD + 0.05), 3))), 'z': [round(ua, 3), round(ub, 3)]})
    # 睡覺的畫面（DORM-SLEEP-VISUAL-1030，使用者 10-30「睡覺要真的有畫面」）：遊戲端（LAWWW-B）照這些點做「走到梯子前 → 爬上去 → 躺下 → 熄燈」。座標＝遊戲 dorm 區域座標
    #   approach＝梯子前的地上（＝sleep）；steps＝四階的踏點（從走道往牆邊爬）；bed_entry＝最上面一階旁邊、上床的那一點（床墊上）；
    #   lie.head／feet＝躺著的時候頭、腳的位置（枕頭在 ua 那一端；頭朝 −z＝yaw π）；cam＝睡覺時的鏡頭（走道上方，視線越過 2.02 m 的床欄）
    sx = 1 if side == 'L' else -1; mv = (0.03 + VD - 0.05) / 2; mtop = DECK1 + 0.16; uc_ = (ust + ub) / 2; zc_ = (ua + ust) / 2; r3 = lambda v: round(v, 3)
    LAYOUT['units'][-1]['sleep_scene'] = {
        'approach': [r3(wx(side, VD + 0.4)), r3(uc_)],
        'steps': [[r3(wx(side, VD - (k + 0.5) * (VD / NST))), r3(RISE * (k + 1)), r3(uc_)] for k in range(NST)],
        'bed_entry': [r3(wx(side, 0.25)), r3(mtop), r3(ust - 0.25)],
        'lie': {'head': [r3(wx(side, mv)), r3(mtop + 0.1), r3(ua + 0.155)], 'feet': [r3(wx(side, mv)), r3(mtop + 0.05), r3(ua + 1.775)], 'head_dir_yaw': 3.1416, 'mattress_top_y': r3(mtop),
                'mattress': {'x': sorted([r3(wx(side, 0.03)), r3(wx(side, VD - 0.05))]), 'z': [r3(ua + 0.025), r3(ust - 0.025)]}},
        'cam': {'eye': [r3(wx(side, mv) + sx * 1.6), 2.75, r3(zc_ + 0.7)], 'look': [r3(wx(side, mv)), 1.85, r3(zc_)]}}


# ---- 每個人的東西
def yuting203(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y203_YUTING', {'year': '203', 'who': 'yuting'}); im = G['it']
    lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.018, sy0 + 0.31, 0.03, 0.25, fn='cbox', hexcol='#e9e2cf')           # 《經濟學原理》（白底紅帶）
    lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.24, sy0 + 0.265, 0.25, 0.252, fn='cbox', hexcol='#b0332a')
    lbox(im, side, s0 + 0.1, s0 + 0.14, sy0 + 0.018, sy0 + 0.26, 0.04, 0.23, fn='cbox', hexcol='#6b4f35')             # 舊《民法》（褪色的咖啡色）
    books_row(im, side, s0 + 0.15, sm - 0.02, sy0 + 0.018, 0.04, tall=0.28)
    for j, c in enumerate(['#2f6db0', '#f2f0ea', '#c23f35']): lbox(im, side, sm + 0.02 + j * 0.06, sm + 0.07 + j * 0.06, sy0 + 0.018, sy0 + 0.3, 0.03, 0.27, fn='cbox', hexcol=c)   # 講義夾
    lbox(im, side, k1 - 0.36, k1 - 0.1, Y, Y + 0.06, 0.08, 0.36, fn='cbox', hexcol='#8e1d1d')                        # 六法
    laptop(G, side, k0 + 0.66, Y)
    lbox(im, side, k0 + 0.02, k0 + 0.2, Y, Y + 0.01, 0.35, 0.52, fn='cbox', hexcol='#f4f1e8')                        # 攤開的筆記本（書桌左前；10-30 以前在 k0+0.9，和黃金葛的盆子疊在一起）
    lbox(im, side, k1 - 0.06, k1 + 0.0, Y, Y + 0.1, 0.21, 0.27, fn='cbox', hexcol='#2f6d8a')                        # 馬克杯（右後、計時器旁邊；10-30 以前在前緣，和黃金葛的藤疊在一起）
    lbox(im, side, k1 - 0.55, k1 - 0.12, 0.0, 0.62, 0.06, 0.3, fn='crbox', hexcol='#24324a', r=0.03)                 # 行李箱（立在書桌下）
    lbox(G['met'], side, k1 - 0.4, k1 - 0.27, 0.62, 0.66, 0.15, 0.2)


def yuting412(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y412_YUTING', {'year': '412', 'who': 'yuting'}); im = G['it']
    lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.018, sy0 + 0.31, 0.03, 0.25, fn='cbox', hexcol='#e9e2cf'); lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.24, sy0 + 0.265, 0.25, 0.252, fn='cbox', hexcol='#b0332a')
    for j, c in enumerate(['#2f5d8c', '#3e7a52', '#d6cdb8']): lbox(im, side, s0 + 0.1 + j * 0.06, s0 + 0.15 + j * 0.06, sy0 + 0.018, sy0 + 0.29, 0.04, 0.24, fn='cbox', hexcol=c)   # 微積分、統計、筆記
    laptop(G, side, k0 + 0.66, Y)


def kai203(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('ROOMMATE_KAI', {'year': '203', 'who': 'kai'}); im, bk = G['it'], G['blk']
    for (du, w_, dv) in ((0.5, 0.5, 0.2), (1.0, 0.48, 0.23)):                                                         # 雙螢幕（右邊那台往前 3 cm、不重疊）；整組在層架（深 0.27 m）前面——10-30 以前貼牆放，螢幕上緣 1.18 m 穿過 1.00 m 的層架底板
        lbox(bk, side, k0 + du - w_ / 2, k0 + du + w_ / 2, Y + 0.1, Y + 0.42, 0.1 + dv, 0.125 + dv); lbox(G['lcd'], side, k0 + du - w_ / 2 + 0.012, k0 + du + w_ / 2 - 0.012, Y + 0.112, Y + 0.408, 0.125 + dv, 0.131 + dv)
        lbox(bk, side, k0 + du - 0.02, k0 + du + 0.02, Y + 0.012, Y + 0.12, 0.08 + dv, 0.1 + dv); lbox(bk, side, k0 + du - 0.1, k0 + du + 0.1, Y, Y + 0.012, 0.04 + dv, 0.2 + dv)
    lbox(bk, side, k0 + 0.5, k0 + 0.95, Y, Y + 0.02, 0.45, 0.58); lbox(im, side, k0 + 1.02, k0 + 1.08, Y, Y + 0.02, 0.47, 0.57, fn='cbox', hexcol='#d9d6cf')   # 鍵盤、滑鼠（螢幕往前以後跟著往前）
    lbox(bk, side, k1 - 0.3, k1 - 0.08, 0.0, 0.46, 0.04, 0.5, fn='rbox', r=0.01, seg=1)                                # 電腦主機（書桌下）
    lbox(G['led'], side, k1 - 0.29, k1 - 0.09, 0.4, 0.405, 0.5, 0.503)                                                  # 主機前面的燈條
    sweep(bk, [W3(side, k0 + 1.02 + 0.2, Y + 0.44, 0.32), W3(side, k0 + 1.02 + 0.2, Y + 0.56, 0.315), W3(side, k0 + 1.02 + 0.2, Y + 0.44, 0.31)], 0.014, seg=6)   # 掛在螢幕上的耳機
    lbox(im, side, k0 + 0.05, k0 + 0.25, Y, Y + 0.05, 0.4, 0.58, fn='cbox', hexcol='#d65a3a'); lbox(im, side, k1 - 0.06, k1, Y, Y + 0.12, 0.45, 0.51, fn='cbox', hexcol='#2f6db0')   # 零食、飲料


def zhe203(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y203_ZHE', {'year': '203', 'who': 'zhe'}); im = G['it']
    painted(im, lambda: im.sphere(W3(side, k1 - 0.3, 0.12, 0.32), 0.12, seg=14, rings=9), '#c4692e')                   # 籃球（書桌下）
    lbox(im, side, k0 + 0.45, k0 + 0.8, Y, Y + 0.16, 0.06, 0.32, fn='cbox', hexcol='#b9a37f')                           # 一箱零食（開著，上面露出包裝）；矮一點：包裝頂在 0.98 m，不穿過 1.00 m 的層架底板（10-30）
    for j, c in enumerate(['#e0b95b', '#c23f35', '#2f6db0', '#3e7a52']): lbox(im, side, k0 + 0.48 + j * 0.075, k0 + 0.54 + j * 0.075, Y + 0.16, Y + 0.22, 0.1 + j * 0.03, 0.2 + j * 0.03, fn='cbox', hexcol=c)
    fx_, fv = k1 - 0.2, 0.4   # 層架（深 0.27 m）前面；10-30 以前 0.25，扇罩貼著層架的前緣                                                                                           # 桌上型電風扇（從高雄帶來的）：底座、立柱、圓形扇罩
    G['met'].cyl(W3(side, fx_, Y, fv), W3(side, fx_, Y + 0.03, fv), 0.1, seg=14); G['met'].cyl(W3(side, fx_, Y + 0.03, fv), W3(side, fx_, Y + 0.25, fv), 0.015, seg=8)
    painted(im, lambda: im.cyl(W3(side, fx_, Y + 0.38, fv + 0.02), W3(side, fx_, Y + 0.38, fv + 0.1), 0.17, seg=20), '#e8eef0')
    painted(im, lambda: im.cyl(W3(side, fx_, Y + 0.38, fv + 0.1), W3(side, fx_, Y + 0.38, fv + 0.102), 0.15, seg=20), '#9aa5ad')
    books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.26)
    lbox(im, side, k0 + 0.05, k0 + 0.35, Y, Y + 0.012, 0.3, 0.52, fn='cbox', hexcol='#f4f1e8')


def bohan203(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y203_BOHAN', {'year': '203', 'who': 'bohan'}); im = G['it']
    books_row(im, side, s0 + 0.025, sm - 0.015, sy0 + 0.018, 0.04, tall=0.28, neat=True, cols=['#2f4f6b', '#1f3b57', '#e3d9c2', '#d6cdb8'])   # 排得很整齊的書
    books_row(im, side, sm + 0.02, s1 - 0.025, sy0 + 0.018, 0.04, tall=0.28, neat=True, cols=['#8e1d1d', '#e3d9c2'])
    for j, c in enumerate(['#2f6db0', '#3e7a52', '#c23f35', '#e0b95b', '#5a4a6a']):                                     # 一疊考古題資料夾（平放）
        lbox(im, side, k0 + 0.05, k0 + 0.36, Y + j * 0.025, Y + (j + 1) * 0.025 - 0.002, 0.08, 0.32, fn='cbox', hexcol=c)
    desk_lamp(G, side, k1 - 0.06, Y, v=0.16, du=-1.0)   # 層架右邊、書桌最右端，手臂往書桌那邊彎、燈罩在層架前面（10-30 以前在 k1−0.18：在層架下面，手臂穿過層架的側板）
    lbox(im, side, k0 + 0.5, k0 + 0.78, Y, Y + 0.035, 0.3, 0.5, fn='cbox', hexcol='#2f4f6b')                             # 攤開的課本
    for j in range(3): lbox(im, side, k0 + 0.82 + j * 0.02, k0 + 0.83 + j * 0.02, Y, Y + 0.01, 0.32, 0.47, fn='cbox', hexcol=['#202225', '#2f6db0', '#c23f35'][j])   # 排好的筆
    lbox(im, side, k1 - 0.32, k1 - 0.26, Y, Y + 0.02, 0.45, 0.49, fn='cbox', hexcol='#e8873a')                           # 耳塞盒


def tangrui412(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y412_TANGRUI', {'year': '412', 'who': 'tangrui'}); im = G['it']
    for j, c in enumerate(['#d9c27a', '#9fc3d6', '#e7a8a0']):                                                           # 劇社的劇本（A4、釘起來）
        lbox(im, side, k0 + 0.05 + j * 0.02, k0 + 0.35 + j * 0.02, Y + j * 0.012, Y + (j + 1) * 0.012, 0.1 + j * 0.03, 0.31 + j * 0.03, fn='cbox', hexcol=c)
    lbox(im, side, k0 + 0.5, k0 + 0.92, Y, Y + 0.008, 0.28, 0.5, fn='cbox', hexcol='#f6f3ea')                            # 攤開的那本
    uc = (ua + ust) / 2                                                                                                 # 掛在床欄外面的戲服（衣架勾在床欄上）
    sweep(G['met'], [W3(side, uc, GUARD - 0.03, VD - 0.045), W3(side, uc, GUARD + 0.035, VD - 0.035), W3(side, uc, GUARD + 0.035, VD + 0.02), W3(side, uc, GUARD - 0.08, VD + 0.03)], 0.006, seg=5)   # 勾在床欄板後面先往上、越過板頂（2.02）再勾出來（10-30 以前斜著穿過板頂）
    lbox(im, side, uc - 0.26, uc + 0.26, GUARD - 0.12, GUARD - 0.1, VD + 0.012, VD + 0.03, fn='cbox', hexcol='#6b6f75')
    lbox(im, side, uc - 0.24, uc + 0.24, 1.05, GUARD - 0.12, VD + 0.01, VD + 0.045, fn='crbox', hexcol='#7a2f3a', r=0.012)


def weilun412(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    G = ig('Y412_WEILUN', {'year': '412', 'who': 'weilun'}); im = G['it']
    hx = k1 - 0.3                                                                                                        # 腳踏車安全帽（桌上）
    painted(im, lambda: im.ell(W3(side, hx, Y + 0.09, 0.32), 0.15, 0.11, 0.13, seg=16, rings=8), '#2b6cb0')   # 球心 Y+0.09、高 0.11：底在桌板裡 2 cm（桌板 3 cm 厚），10-30 以前球心 Y+0.02，下面 10 cm 從書桌底下露出來
    lbox(im, side, hx - 0.15, hx + 0.15, Y, Y + 0.02, 0.2, 0.44, fn='cbox', hexcol='#202225')
    for j, (c, h) in enumerate((('#3a3f46', 0.06), ('#d6cdb8', 0.05), ('#5d7f9f', 0.07), ('#8c3b47', 0.05))):            # 椅子上堆的衣服
        lbox(im, side, cu - 0.2 + j * 0.02, cu + 0.18 - j * 0.03, 0.455 + j * 0.05, 0.455 + j * 0.05 + h, 0.7 + j * 0.02, 1.02 - j * 0.03, fn='crbox', hexcol=c, r=0.02)
    lbox(im, side, cu - 0.2, cu + 0.2, 0.62, 0.95, 1.1, 1.13, fn='crbox', hexcol='#e6e0d2', r=0.01)                         # 搭在椅背上的一件
    books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.26)


# ---- 大二～大四（AA_208 第 7、8 節）
def yuting_y(year):
    """祐廷（L2，四年都在門口那組）：架上的書和大一一樣（經濟學原理、舊《民法》、講義夾），越高年級書越多；桌面留空給主線的物件（dorm_y2_items 等）"""
    def fn(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
        R = random.Random('yuting' + year); G = ig(f'Y{year}_YUTING', {'year': year, 'who': 'yuting'}); im = G['it']
        lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.018, sy0 + 0.31, 0.03, 0.25, fn='cbox', hexcol='#e9e2cf'); lbox(im, side, s0 + 0.03, s0 + 0.095, sy0 + 0.24, sy0 + 0.265, 0.25, 0.252, fn='cbox', hexcol='#b0332a')
        lbox(im, side, s0 + 0.1, s0 + 0.14, sy0 + 0.018, sy0 + 0.26, 0.04, 0.23, fn='cbox', hexcol='#6b4f35')
        books_row(im, side, s0 + 0.15, sm - 0.02, sy0 + 0.018, 0.04, tall=0.28, rng=R)
        n = {'312': 3, '507': 4, '409': 5}[year]                                                                       # 講義夾：一年多一本
        for j in range(n): lbox(im, side, sm + 0.02 + j * 0.055, sm + 0.065 + j * 0.055, sy0 + 0.018, sy0 + 0.3, 0.03, 0.27, fn='cbox', hexcol=['#2f6db0', '#f2f0ea', '#c23f35', '#3e7a52', '#e0b95b'][j])
        lbox(im, side, k1 - 0.36, k1 - 0.1, Y, Y + 0.06 + (0.03 if year != '312' else 0.0), 0.08, 0.36, fn='cbox', hexcol='#8e1d1d')   # 六法（大三起換成比較厚的版本）
        laptop(G, side, k0 + 0.66, Y)
    return fn


def zhe312(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    """阿哲（L1）：籃球已經滾到門口（AA_208 7-1「阿哲的籃球已經滾到門口了」）、一箱零食、從高雄帶來的電風扇"""
    R = random.Random('zhe312'); G = ig('Y312_ZHE', {'year': '312', 'who': 'zhe'}); im = G['it']
    painted(im, lambda: im.sphere((-0.66, 0.12, 3.14), 0.12, seg=14, rings=9), '#c4692e')                            # 門口左邊（垃圾桶和門框中間，不擋路）
    lbox(im, side, k0 + 0.45, k0 + 0.8, Y, Y + 0.16, 0.06, 0.32, fn='cbox', hexcol='#b9a37f')   # 矮一點（同 203）
    for j, c in enumerate(['#e0b95b', '#2f6db0', '#c23f35']): lbox(im, side, k0 + 0.48 + j * 0.09, k0 + 0.55 + j * 0.09, Y + 0.16, Y + 0.22, 0.12 + j * 0.03, 0.22 + j * 0.03, fn='cbox', hexcol=c)
    fx_, fv = k1 - 0.2, 0.4   # 層架（深 0.27 m）前面；10-30 以前 0.25，扇罩貼著層架的前緣
    G['met'].cyl(W3(side, fx_, Y, fv), W3(side, fx_, Y + 0.03, fv), 0.1, seg=14); G['met'].cyl(W3(side, fx_, Y + 0.03, fv), W3(side, fx_, Y + 0.25, fv), 0.015, seg=8)
    painted(im, lambda: im.cyl(W3(side, fx_, Y + 0.38, fv + 0.02), W3(side, fx_, Y + 0.38, fv + 0.1), 0.17, seg=20), '#e8eef0')
    painted(im, lambda: im.cyl(W3(side, fx_, Y + 0.38, fv + 0.1), W3(side, fx_, Y + 0.38, fv + 0.102), 0.15, seg=20), '#9aa5ad')
    books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.26, rng=R)
    lbox(im, side, k0 + 0.05, k0 + 0.35, Y, Y + 0.012, 0.3, 0.52, fn='cbox', hexcol='#f4f1e8')


def bohan_y(year):
    """柏翰（R1，靠窗那組，四年同寢）：東西照 203 跟著搬（排整齊的書、考古題資料夾、檯燈、耳塞）；409「耳塞已經放在枕頭旁邊」"""
    def fn(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
        R = random.Random('bohan' + year); G = ig(f'Y{year}_BOHAN', {'year': year, 'who': 'bohan'}); im = G['it']
        books_row(im, side, s0 + 0.025, sm - 0.015, sy0 + 0.018, 0.04, tall=0.28, neat=True, cols=['#2f4f6b', '#1f3b57', '#e3d9c2', '#d6cdb8'], rng=R)
        books_row(im, side, sm + 0.02, s1 - 0.025, sy0 + 0.018, 0.04, tall=0.28, neat=True, cols=['#8e1d1d', '#e3d9c2'], rng=R)
        nf = {'312': 5, '507': 6, '409': 7}[year]                                                                      # 考古題資料夾一年比一年多
        for j in range(nf): lbox(im, side, k0 + 0.05, k0 + 0.36, Y + j * 0.025, Y + (j + 1) * 0.025 - 0.002, 0.08, 0.32, fn='cbox', hexcol=['#2f6db0', '#3e7a52', '#c23f35', '#e0b95b', '#5a4a6a', '#2f4f6b', '#d6cdb8'][j])
        desk_lamp(G, side, k1 - 0.06, Y, v=0.16, du=-1.0)   # 層架右邊、書桌最右端，手臂往書桌那邊彎、燈罩在層架前面（10-30 以前在 k1−0.18：在層架下面，手臂穿過層架的側板）
        lbox(im, side, k0 + 0.5, k0 + 0.78, Y, Y + 0.035, 0.3, 0.5, fn='cbox', hexcol='#2f4f6b')
        for j in range(3): lbox(im, side, k0 + 0.82 + j * 0.02, k0 + 0.83 + j * 0.02, Y, Y + 0.01, 0.32, 0.47, fn='cbox', hexcol=['#202225', '#2f6db0', '#c23f35'][j])
        if year == '409': lbox(im, side, ua + 0.5, ua + 0.56, DECK1 + 0.24, DECK1 + 0.26, 0.24, 0.28, fn='cbox', hexcol='#e8873a')   # 枕頭旁邊（被子上）的耳塞盒
        else: lbox(im, side, k1 - 0.32, k1 - 0.26, Y, Y + 0.02, 0.45, 0.49, fn='cbox', hexcol='#e8873a')
    return fn


def handbook(G, side, ua, ust):
    """宿舍發的新生手冊：貼在床欄外面（從房間看得到；封面淺藍＋白色帶子，沒有字）"""
    uc = (ua + ust) / 2 + 0.3; a, b = uc - 0.075, uc + 0.075
    lbox(G['it'], side, a, b, 1.6, 1.81, VD + 0.002, VD + 0.009, fn='cbox', hexcol='#9cc0d8'); lbox(G['it'], side, a, b, 1.74, 1.77, VD + 0.009, VD + 0.011, fn='cbox', hexcol='#f4f2ec')
    for t in (1.8, 1.61): lbox(G['it'], side, uc - 0.03, uc + 0.03, t - 0.005, t + 0.012, VD + 0.009, VD + 0.012, fn='cbox', hexcol='#e9e4d2')   # 膠帶


def carton(G, side, u0, u1, y0, y1, v0, v1):
    """還沒拆的紙箱：上面一條膠帶"""
    lbox(G['it'], side, u0, u1, y0, y1, v0, v1, fn='cbox', hexcol='#b88a5a'); um = (u0 + u1) / 2
    lbox(G['it'], side, um - 0.025, um + 0.025, y1, y1 + 0.003, v0 - 0.002, v1 + 0.002, fn='cbox', hexcol='#c9a77a')


def fresh_y(year):
    """大一學弟（R2，背景，沒有名字）：床上貼著新生手冊；312 兩個還沒拆的紙箱（AA_208 7-1）、409 一個（第 8 節：新生手冊只放大四的大一學弟）"""
    def fn(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
        G = ig(f'Y{year}_FRESH', {'year': year, 'who': 'fresh'})
        handbook(G, side, ua, ust)
        carton(G, side, k1 - 0.5, k1 - 0.08, 0.0, 0.38, 0.1, 0.48)                                                    # 書桌下
        if year == '312': carton(G, side, k0 + 0.5, k0 + 0.92, Y, Y + 0.22, 0.08, 0.42)                                # 書桌上（高 0.22：頂在 0.98 m，不穿過 1.00 m 的層架底板；10-30 以前 0.3）
        laptop(G, side, k0 + 1.1, Y) if year == '409' else None
        lbox(G['it'], side, s0 + 0.03, s0 + 0.2, sy0 + 0.018, sy0 + 0.25, 0.04, 0.24, fn='cbox', hexcol='#d6cdb8')       # 架上只有一疊新課本
    return fn


def soph_y(year):
    """大二學弟（L1，背景）：筆電、幾本課本、水壺、掛在椅背的後背包"""
    def fn(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
        R = random.Random('soph' + year); G = ig(f'Y{year}_SOPH', {'year': year, 'who': 'soph'}); im = G['it']
        laptop(G, side, k0 + 0.62, Y)
        books_row(im, side, s0 + 0.03, s0 + 0.35, sy0 + 0.018, 0.04, tall=0.26, rng=R)
        painted(im, lambda: im.cyl(W3(side, k1 - 0.12, Y, 0.42), W3(side, k1 - 0.12, Y + 0.22, 0.42), 0.035, seg=12), '#3e7a8a' if year == '507' else '#c9c3b5')   # 水壺
        lbox(im, side, cu - 0.16, cu + 0.16, 0.5, 0.9, 1.12, 1.26, fn='crbox', hexcol='#2a2f38' if year == '507' else '#5a6a52', r=0.04)   # 椅背上的後背包
    return fn


def peer507(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    """別系的同屆（R2，背景）：一台螢幕＋鍵盤、一疊 A4 影印、掛在椅背的外套"""
    R = random.Random('peer507'); G = ig('Y507_PEER', {'year': '507', 'who': 'peer'}); im, bk = G['it'], G['blk']
    lbox(bk, side, k0 + 0.55, k0 + 1.05, Y + 0.1, Y + 0.4, 0.3, 0.325); lbox(G['lcd'], side, k0 + 0.562, k0 + 1.038, Y + 0.112, Y + 0.388, 0.325, 0.331)   # 螢幕在層架前面（同阿凱，10-30）
    lbox(bk, side, k0 + 0.78, k0 + 0.82, Y + 0.012, Y + 0.12, 0.28, 0.3); lbox(bk, side, k0 + 0.7, k0 + 0.9, Y, Y + 0.012, 0.24, 0.4)
    lbox(bk, side, k0 + 0.58, k0 + 1.0, Y, Y + 0.02, 0.45, 0.59)
    for j in range(4): lbox(im, side, k0 + 0.06 + j * 0.004, k0 + 0.27 + j * 0.004, Y + j * 0.006, Y + (j + 1) * 0.006, 0.1 + j * 0.01, 0.4 + j * 0.01, fn='cbox', hexcol='#f6f3ea')
    books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.27, rng=R)
    lbox(im, side, cu - 0.21, cu + 0.21, 0.55, 0.95, 1.1, 1.14, fn='crbox', hexcol='#4a4f57', r=0.015)                 # 外套



def painted2(cm, fn, hexcol):
    """同 painted()，但用「新加的面」的集合來塗（painted() 照面的編號：同一個網格前面做過倒角方塊 crbox 以後，編號會亂，塗到別的東西——205 第一輪：登山包的口袋變成陶盆的顏色）"""
    f0 = set(cm.bm.faces); fn(); cm.paint([f for f in cm.bm.faces if f not in f0], hexcol)

def pot(G, x, y, z, r, h, col='#b5653a'):
    """花盆（車床，遊戲座標）：上寬下窄、口緣一圈、土；回傳土面的高度"""
    prof = [(0.0, 0.0), (r * 0.72, 0.0), (r, h * 0.9), (r * 1.08, h * 0.92), (r * 1.08, h), (r * 0.92, h), (r * 0.9, h * 0.84), (0.0, h * 0.84)]
    painted2(G['it'], lambda: G['it'].add_bm(L.lathe(prof, seg=12), Matrix.Translation(g2b(x, y, z))), col)
    painted2(G['it'], lambda: G['it'].cyl((x, y + h * 0.84, z), (x, y + h * 0.86, z), r * 0.88, seg=12), '#4a3626')
    return y + h * 0.86


def leaves(G, x, y, z, n, length, tilt, col, rng, width=0.4, thick=0.12, rise=0.0, a0=0.0):
    """一圈葉子（扁的橢球），從 (x, y, z) 往外長；tilt＞0 往下垂、＜0 往上翹"""
    for k in range(n):
        a = a0 + k * 2 * math.pi / n + rng.uniform(-0.25, 0.25); ln = length * rng.uniform(0.8, 1.15); d = ln * 0.55
        c = (x + d * math.cos(a), y + rise + d * math.sin(-tilt) * 0.5, z + d * math.sin(a))
        m = Matrix.Rotation(-a, 4, 'Z') @ Matrix.Rotation(tilt + rng.uniform(-0.15, 0.15), 4, 'Y')
        painted2(G['it'], lambda: G['it'].ell(c, ln * 0.55, ln * 0.55 * thick, ln * 0.55 * width, seg=6, rings=4, matrix=m), col)


def rosette(G, x, y, z, r, col, rng, n=9):
    """多肉：一圈一圈的肥葉子（往上翹）"""
    for ring, (rr, ty) in enumerate(((r, -0.5), (r * 0.65, -0.9), (r * 0.3, -1.2))):
        leaves(G, x, y + ring * r * 0.25, z, max(4, n - ring * 2), rr * 1.6, ty, col, rng, width=0.55, thick=0.35, a0=ring * 0.5)


def fang205(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
    """方奕廷（森林系大一，R1 靠窗）：「滿桌的盆栽」（AA_399 第 11 節）——育苗盤、幾盆多肉、一盆大葉子、層架上垂下來的黃金葛、植物燈；
    田野筆記、放大鏡、噴水瓶、植物圖鑑；書桌下登山鞋、衣櫃前一個大登山包；窗台三盆（和祐廷房間窗台那三盆是同一種，他送的）"""
    R = random.Random('fang205'); G = ig('Y205_FANG', {'year': '205', 'who': 'fang'}); im, bk = G['it'], G['blk']
    W = lambda u, y, v: W3(side, u, y, v)
    # 育苗盤（黑色）：6×4 格，每格一株小苗
    lbox(bk, side, k0 + 0.04, k0 + 0.4, Y, Y + 0.05, 0.05, 0.31)
    for i in range(6):
        for j in range(4):
            u_, v_ = k0 + 0.07 + i * 0.056, 0.08 + j * 0.06; x_, _, z_ = W(u_, 0, v_)
            painted2(im, lambda: im.cyl((x_, Y + 0.05, z_), (x_, Y + 0.05 + R.uniform(0.03, 0.06), z_), 0.003, seg=4), '#6a9a3a')
            leaves(G, x_, Y + 0.075 + R.uniform(-0.01, 0.01), z_, 2, 0.022, -0.3, '#7ab84a', R, width=0.6, thick=0.2)
    # 三盆多肉（陶盆）沿著牆
    for k, (du, col, pc) in enumerate(((0.47, '#8ab08a', '#b5653a'), (0.62, '#a9c48a', '#c98a5a'), (0.76, '#7a9a8a', '#b5653a'))):
        x_, _, z_ = W(k0 + du, 0, 0.12); ys = pot(G, x_, Y, z_, 0.05, 0.07, pc); rosette(G, x_, ys, z_, 0.035, col, R)
    # 大葉子的那一盆（書桌靠衣櫃那一端）
    x_, _, z_ = W(k1 - 0.17, 0, 0.18); ys = pot(G, x_, Y, z_, 0.09, 0.15, '#f1efe8')
    for k in range(3): painted2(im, lambda: im.cyl((x_, ys, z_), (x_ + R.uniform(-0.04, 0.04), ys + 0.22 + k * 0.06, z_ + R.uniform(-0.04, 0.04)), 0.006, seg=5), '#4f7a3a')
    leaves(G, x_, ys + 0.22, z_, 6, 0.16, 0.35, '#3f7a3a', R, width=0.7, thick=0.08)
    leaves(G, x_, ys + 0.3, z_, 4, 0.13, 0.0, '#4a8a42', R, width=0.7, thick=0.08, a0=0.6)
    # 前面一排小黑盆（剛換盆的苗）
    for k in range(4):
        x_, _, z_ = W(k0 + 0.95 + k * 0.075, 0, 0.47); ys = pot(G, x_, Y, z_, 0.028, 0.06, '#2a2a2a'); leaves(G, x_, ys + 0.03, z_, 3, 0.04, -0.4, '#6aaa4a', R, width=0.6, thick=0.15)
    # 田野筆記（攤開）、鉛筆、放大鏡、噴水瓶
    lbox(im, side, k0 + 0.47, k0 + 0.72, Y, Y + 0.008, 0.32, 0.5, fn='cbox', hexcol='#f3efe2'); lbox(im, side, k0 + 0.595, k0 + 0.6, Y + 0.008, Y + 0.01, 0.32, 0.5, fn='cbox', hexcol='#c9c3b0')
    lbox(im, side, k0 + 0.5, k0 + 0.69, Y + 0.008, Y + 0.012, 0.52, 0.53, fn='cbox', hexcol='#e0b030')
    x_, _, z_ = W(k0 + 0.8, 0, 0.42); G['met'].cyl((x_, Y, z_), (x_, Y + 0.012, z_), 0.03, seg=12)   # 放大鏡
    x_, _, z_ = W(k0 + 0.88, 0, 0.5)
    painted2(im, lambda: im.cyl((x_, Y, z_), (x_, Y + 0.17, z_), 0.03, seg=10), '#cfe6f0'); painted2(im, lambda: im.cyl((x_, Y + 0.17, z_), (x_, Y + 0.21, z_), 0.015, seg=8), '#2a8a5a')
    lbox(im, side, k0 + 0.865, k0 + 0.895, Y + 0.19, Y + 0.215, 0.5, 0.56, fn='cbox', hexcol='#2a8a5a')
    # 層架：植物圖鑑、課本（綠、咖啡的書背）、一盆黃金葛往下垂；架子下面一支植物燈
    books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.27, cols=['#3e6a3a', '#7a5a3a', '#5a7a4a', '#d6cdb8', '#8a6a3a', '#2f5a4a'], rng=R)
    lbox(im, side, sm + 0.03, sm + 0.11, sy0 + 0.018, sy0 + 0.3, 0.03, 0.25, fn='cbox', hexcol='#e8e0c8'); lbox(im, side, sm + 0.03, sm + 0.11, sy0 + 0.2, sy0 + 0.23, 0.25, 0.252, fn='cbox', hexcol='#3e6a3a')
    x_, _, z_ = W(s1 - 0.1, 0, 0.14); ys = pot(G, x_, sy0 + 0.42, z_, 0.06, 0.09, '#d8cfc0')   # 層架頂板上
    leaves(G, x_, ys + 0.02, z_, 5, 0.06, -0.2, '#4f8a3a', R, width=0.75, thick=0.1)
    for j in range(2):                                                                                  # 垂下來的藤（沿著架子前緣）
        ux = s1 - 0.16 + j * 0.1
        for t in range(6):
            x2, _, z2 = W(ux + R.uniform(-0.02, 0.02), 0, 0.28 + t * 0.004); y2 = sy0 + 0.4 - t * 0.075
            leaves(G, x2, y2, z2, 2, 0.05, 0.5, '#4f8a3a' if t % 2 else '#6a9a3a', R, width=0.75, thick=0.1, a0=R.uniform(0, 3))
    lbox(G['met'], side, s0 + 0.05, s1 - 0.05, sy0 - 0.03, sy0 - 0.005, 0.12, 0.16); lbox(G['led'], side, s0 + 0.06, s1 - 0.06, sy0 - 0.036, sy0 - 0.03, 0.125, 0.155)
    # 書桌下：登山鞋；衣櫃前：大登山包（深綠）
    for j in range(2): lbox(im, side, k1 - 0.42 + j * 0.13, k1 - 0.31 + j * 0.13, 0.0, 0.12, 0.25, 0.53, fn='crbox', hexcol='#5a4a3a', r=0.03)
    w0 = ub - STW0 - 0.6
    lbox(im, side, w0 + 0.1, w0 + 0.46, 0.0, 0.72, 0.6, 0.86, fn='crbox', hexcol='#2f4a3a', r=0.06); lbox(im, side, w0 + 0.16, w0 + 0.4, 0.42, 0.62, 0.86, 0.9, fn='crbox', hexcol='#3a5a46', r=0.03)
    lbox(im, side, w0 + 0.13, w0 + 0.43, 0.66, 0.76, 0.63, 0.83, fn='crbox', hexcol='#24382c', r=0.03)                       # 背包的頂蓋（第一輪是黑色方塊，太重）
    # 窗台三盆（後牆，和他送給祐廷的那三盆同一種）
    for k, xw in enumerate((-0.62, -0.05, 0.55)):
        ys = pot(G, xw, 0.962, IZ0 + 0.005, 0.05, 0.07, '#b5653a'); rosette(G, xw, ys, IZ0 + 0.005, 0.032, ['#8ab08a', '#a9c48a', '#7a9a8a'][k], R)


def peer_y(year):
    """別系的室友（背景）：螢幕＋鍵盤、一疊 A4、掛在椅背的外套（和 peer507 一樣，自己的亂數）"""
    def fn(side, k0, k1, s0, s1, sm, sy0, ust, ub, ua, cu, Y):
        R = random.Random('peer' + year); G = ig(f'Y{year}_PEER', {'year': year, 'who': 'peer'}); im, bk = G['it'], G['blk']
        lbox(bk, side, k0 + 0.55, k0 + 1.05, Y + 0.1, Y + 0.4, 0.1, 0.125); lbox(G['lcd'], side, k0 + 0.562, k0 + 1.038, Y + 0.112, Y + 0.388, 0.125, 0.131)
        lbox(bk, side, k0 + 0.78, k0 + 0.82, Y + 0.012, Y + 0.12, 0.08, 0.1); lbox(bk, side, k0 + 0.7, k0 + 0.9, Y, Y + 0.012, 0.04, 0.2)
        lbox(bk, side, k0 + 0.58, k0 + 1.0, Y, Y + 0.02, 0.32, 0.46)
        for j in range(4): lbox(im, side, k0 + 0.06 + j * 0.004, k0 + 0.27 + j * 0.004, Y + j * 0.006, Y + (j + 1) * 0.006, 0.1 + j * 0.01, 0.4 + j * 0.01, fn='cbox', hexcol='#f6f3ea')
        books_row(im, side, s0 + 0.03, sm - 0.02, sy0 + 0.018, 0.04, tall=0.27, rng=R)
        lbox(im, side, cu - 0.21, cu + 0.21, 0.55, 0.95, 1.1, 1.14, fn='crbox', hexcol='#6a5a4a', r=0.015)
    return fn


ITEMS = {('203', 'yuting'): yuting203, ('412', 'yuting'): yuting412, ('203', 'kai'): kai203, ('203', 'zhe'): zhe203, ('203', 'bohan'): bohan203,
         ('412', 'tangrui'): tangrui412, ('412', 'weilun'): weilun412,   # 阿勳（412、R2）：遊戲的 v0_dorm_props（XUN_DESK、XUN_BOWLING）
         ('312', 'yuting'): yuting_y('312'), ('312', 'zhe'): zhe312, ('312', 'bohan'): bohan_y('312'), ('312', 'fresh'): fresh_y('312'),
         ('507', 'yuting'): yuting_y('507'), ('507', 'bohan'): bohan_y('507'), ('507', 'soph'): soph_y('507'), ('507', 'peer'): peer507,
         ('409', 'yuting'): yuting_y('409'), ('409', 'bohan'): bohan_y('409'), ('409', 'soph'): soph_y('409'), ('409', 'fresh'): fresh_y('409'),
         ('205', 'fang'): fang205, ('205', 'fresh'): fresh_y('205'), ('205', 'soph'): soph_y('205'), ('205', 'peer'): peer_y('205')}   # 205 只在 --only 205
for uid, side, ua, ub, sets in UNITS: loft(uid, side, ua, ub, {k: v for k, v in sets.items() if (k == ONLY if ONLY else k not in EXTRA_SETS)})
r2 = next(u for u in LAYOUT['units'] if u['id'] == 'R2'); l2 = next(u for u in LAYOUT['units'] if u['id'] == 'L2')
LAYOUT['v0_props'] = {'XUN_DESK': {'x': r2['desk_center'][0], 'y': 0.76, 'z': r2['desk_center'][1], 'ry': math.pi / 2, 'note': '阿勳的書桌（R2）'},
                      'XUN_BOWLING': {'x': r2['floor_under_bed_spot'][0], 'y': 0.0, 'z': r2['floor_under_bed_spot'][1], 'ry': 0.0, 'note': '書桌下靠衣櫃那一端的地上'},
                      'BOXES_DESK': {'x': round(wx('L', 0.47), 3), 'y': 0.76, 'z': l2['desk_center'][1], 'note': 'E01 紙箱疊在祐廷的書桌上（AA_208 第 6 節）；箱子深 0.36 m、中心離牆 0.47 m：整疊在層架（深 0.27 m）前面——10-30 以前放在書桌正中間，穿過層架和床板（使用者「書桌上東西不要重疊」）'},
                      'BOXES_FLOOR': {'x': round(l2['seat_approach'][0] + 0.1, 3), 'y': 0.0, 'z': round(l2['desk_u'][0] + 0.35, 3), 'note': '隔天剩的箱子在書桌旁邊的地上'}}
LAYOUT['player_unit'] = 'L2'

# ======================================================================= 洗手間門牌
label_quad('WALL_bath_w_sign', root, [(xo - 0.012, 1.48, d0 + 0.26), (xo - 0.012, 1.48, d1 - 0.26), (xo - 0.012, 1.6, d1 - 0.26), (xo - 0.012, 1.6, d0 + 0.26)], (0.0, 0.5, 1.0, 1.0))['dir'] = DIRS['bath_w']

# ======================================================================= 前左角：鞋櫃、垃圾桶、資源回收、曬衣架
lbox(wht, 'L', 1.62, 2.82, 0.0, 0.95, 0.005, 0.34, fn='rbox', r=0.008, seg=1)
for j in range(3): lbox(wood, 'L', 1.63 + j * 0.4, 2.01 + j * 0.4, 0.06, 0.92, 0.34, 0.352)
for j, c in enumerate(['#202225', '#e8e2d4', '#2f4f6b', '#7a1f24']): lbox(it, 'L', 1.7 + j * 0.27, 1.92 + j * 0.27, 0.95, 1.05, 0.06, 0.3, fn='cbox', hexcol=c)
for (x_, c) in ((-1.25, '#5f6a73'), (-0.95, '#3a6ea5')):
    painted(it, lambda: it.add_bm(L.lathe([(0.0, 0.0), (0.12, 0.0), (0.14, 0.42), (0.0, 0.42)], seg=14), Matrix.Translation(g2b(x_, 0.0, IZ1 - 0.2))), c)
RX0, RX1, RZ = -2.42, -1.72, 2.62                                                                                        # 折疊曬衣架
for x_ in (RX0, RX1):
    met.cyl((x_, 0.0, RZ - 0.27), (x_, 1.1, RZ), 0.008, seg=5); met.cyl((x_, 0.0, RZ + 0.27), (x_, 1.1, RZ), 0.008, seg=5)
for (y_, dz) in ((1.1, 0.0), (0.85, -0.1), (0.85, 0.1)): met.cyl((RX0, y_, RZ + dz), (RX1, y_, RZ + dz), 0.006, seg=5)
it.cbox(-2.3, -2.0, 0.62, 1.1, RZ - 0.015, RZ + 0.015, '#e6e0d2'); it.cbox(-1.95, -1.8, 0.7, 1.1, RZ - 0.115, RZ - 0.085, '#4a6c8c')
# 大家共用的東西（DORM203-LM-1030；四個年級、經濟系那年都一樣）：洗手間門口的吸水腳踏墊（走道上、平的，不擋路）；門左邊角落靠牆的掃把和畚箕
bmat = Mesh('dorm_bathmat', L.flat('dorm_bathmat', '#7f8b92', rough=0.97)); soft_box(bmat, 0.1, 0.58, 0.0, 0.012, 2.33, 2.87, r=0.005, seg=1); fin(bmat, uv=False, props={'lm': 0.6})
met.cyl((-2.79, 0.06, 3.12), (-2.84, 1.22, 3.27), 0.011, seg=6)                                                                      # 掃把：鋁管＋塑膠頭＋刷毛
it.cbox(-2.86, -2.72, 0.02, 0.1, 3.05, 3.19, '#2f6f8f'); it.cbox(-2.85, -2.73, 0.0, 0.03, 3.06, 3.18, '#c9b98a')
it.cbox(-2.86, -2.62, 0.0, 0.015, 3.24, 3.36, '#2f6f8f'); it.cbox(-2.86, -2.84, 0.015, 0.2, 3.24, 3.36, '#2f6f8f')                    # 畚箕（立在牆角）
LAYOUT['blocks'] += [{'id': 'shoe_cabinet', 'x': [IX0, round(IX0 + 0.36, 3)], 'z': [1.62, 2.82]}, {'id': 'bins', 'x': [-1.4, -0.8], 'z': [3.05, IZ1]},
                     {'id': 'drying_rack', 'x': [RX0 - 0.05, RX1 + 0.05], 'z': [RZ - 0.3, RZ + 0.3]}, {'id': 'bath', 'x': [round(bx0 - bt / 2, 3), IX1], 'z': [round(bz0 - bt / 2, 3), IZ1]}]

# ======================================================================= 只在烘焙時擋光的東西（--bakeblock；bake_dorm_room4.sh 的 --nolm、--drop 都有 BAKEONLY：不分光照貼圖、輸出前刪掉）
# 窗外的對面大樓＋街道（DORM203-LM-1030）：烘焙場景窗外原本只有天空，接近地平線的天光從北窗直直照進來，落在 5 m 外的門口地上（第二次試烘門口地上整片 1.0、
# 窗邊才 0.63）。真的 203 在二樓、對面隔著舟山路是一排樓（遊戲的窗景也是紅磚大樓）：對面樓 12～14 m 外、比窗高 7 m（擋住仰角 28° 以下的天空），下面是街道（反光）
if '--bakeblock' in ARGS:
    bo = Mesh('BAKEONLY_opposite', L.flat('BAKEONLY_brick', '#8a6b5c', rough=0.9)); bo.box(-16.0, 16.0, -4.0, 9.0, Z0 - 14.0, Z0 - 12.0); bo.finish(root, uv=False)
    bg_ = Mesh('BAKEONLY_street', L.flat('BAKEONLY_road', '#8c8c88', rough=0.95)); bg_.box(-16.0, 16.0, -4.2, -4.0, Z0 - 12.0, Z0 - 0.1); bg_.finish(root, uv=False)

# ======================================================================= 收尾
for k, ob in (('wood', wood), ('white', wht), ('metal', met), ('chair', chair), ('led', led)):
    fin(ob, smooth=0.8 if k in ('metal', 'chair') else None, uv=k in ('wood', 'white'))
it.bm.normal_update(); it.finish(root, uv=False)
for name, G in IG.items():
    for key, m in G.items():
        if key == 'g' or m.empty(): continue
        m.bm.normal_update(); ob = m.finish(G['g'], uv=False)
        if key in ('met', 'blk'): L.smooth_mesh(ob, angle=0.8)
WALL_SMOOTH = {'ac': 0.6, 'blind': 0.8, 'pillow': 0.6, 'rod': 0.9, 'chrome': 0.6}
for side, ms in walls.items():
    for m in ms:
        key = m.name.split('_', 1)[1] if not m.name.startswith('bath_') else m.name.split('_', 2)[2]
        m.name = f'WALL_{m.name}'; bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
        ob = m.finish(root, uv=True, props={'dir': DIRS[side]})
        if key in WALL_SMOOTH: L.smooth_mesh(ob, angle=WALL_SMOOTH[key])


def keep(ob):
    p = ob
    while p is not None:
        if p.name.startswith(('ROOMMATE_', 'LOFT_', 'BEDDING_', 'Y203_', 'Y412_', 'Y312_', 'Y507_', 'Y409_', 'Y205_', 'NAMETAG_', 'JACKET_')) or p.name == 'WALL_bath_w_sign': return True
        p = p.parent
    return False


L.merge_by_material(root, keep=keep, key=lambda ob: ('WALL_' + ob.name.split('_')[1] + ('_' + ob.name.split('_')[2] if ob.name.startswith('WALL_bath_') else '')) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
if LAYOUT_OUT: L.write_json(os.path.abspath(LAYOUT_OUT), LAYOUT)
print(json.dumps({'units': [(u['id'], u['sets']) for u in LAYOUT['units']], 'groups': sorted(IG), 'out': OUT}, ensure_ascii=False))

# ======================================================================= --only 205：rooms_glb3d.js 格式的配置（方奕廷的 205，AA_399 第 11 節）
if ONLY == '205' and ROOM_LAYOUT_OUT:
    RM, U = LAYOUT['room'], {u['id']: u for u in LAYOUT['units']}; f2 = lambda v: round(v, 3)
    blocks = [dict(x0=b['x'][0], x1=b['x'][1], z0=b['z'][0], z1=b['z'][1], why=b['id']) for b in LAYOUT['blocks']]
    l2, r1 = U['L2'], U['R1']
    # 走近點往走道多 10 cm：rooms_glb3d.js 的導航格是 0.4 m（祐廷房間的 dorm 區域是 0.5 m），原本的點旁邊那一格碰到床桌組的阻擋、站不住（tests/dorm_205_unit.js 第 5 項）
    seats = [dict(x=l2['seat']['x'], z=l2['seat']['z'], yaw=l2['seat']['yaw'], kind='sit', table=l2['desk_center'], ap=[f2(l2['seat_approach'][0] + 0.1), l2['seat_approach'][1]], label='坐下（借室友的椅子）', uses=['和方奕廷說話'])]
    inter = [dict(id='fang_desk', x=r1['seat_approach'][0], z=r1['seat_approach'][1], r=0.8, label='方奕廷的書桌', note='', dev='滿桌的盆栽（育苗盤、多肉、大葉子、垂下來的黃金葛、植物燈）、田野筆記；遊戲裡顯示的字等 AA 寫'),
             dict(id='sill', x=0.0, z=f2(IZ0 + 0.75), r=0.7, label='窗台的盆栽', note='', dev='三盆多肉，和祐廷房間窗台那三盆同一種；遊戲裡顯示的字等 AA 寫'),
             ]   # 洗手間不放「看」：它的點離進門的位置 0.25 m，一進門就跳出「洗手間（門關著）」（第一輪截圖）
    spots = {'fang': dict(x=r1['seat']['x'], z=r1['seat']['z'], yaw=r1['seat']['yaw'], act='sit', note='方奕廷坐在自己的書桌前（R1，靠窗）'),
             'fang_stand': dict(x=0.55, z=f2(IZ0 + 0.55), yaw=round(math.pi, 4), act='stand', note='方奕廷站在窗台前（拿噴水瓶）'),
             'player': dict(x=1.15, z=f2(r1['seat']['z'] + 0.75), yaw=round(math.pi / 2 + 0.6, 4), act='stand', note='玩家（站在他的書桌旁邊）')}
    ROOMLAY = dict(version=1, zone='dorm_205', name='205 寢室（方奕廷的房間）', type='寢室', src='AA_399 第 11 節（企劃線 5d09bb725）；LAWWW-B 10-24 03:53 任務 #82；dorm_room4.py --only 205',
                   bounds=dict(x0=X0, x1=X1, z0=Z0, z1=Z1), h=H, cam_dist=3.6, door=dict(x=0.0, w=round(DOOR[1] - DOOR[0], 3), z=Z1, note='+z 那一面中間（和祐廷的房間同一型）'),
                   spawn=dict(x=RM['spawn'][0], z=RM['spawn'][1], yaw=round(math.pi, 4), note='進門、面向房間裡（−z）'),
                   exits=[dict(x=RM['exit'][0], z=RM['exit'][1], r=0.7, label='離開 205', to='dorm_hall', spawn_note='回到宿舍 2F 走廊、205 門前面（back_spawn）')],
                   windows=dict(side='N', wall='back', z=Z0, xs=LAYOUT['window']['winXs'], y=LAYOUT['window']['view_center'][1], w=LAYOUT['window']['view_size'][0], h=LAYOUT['window']['view_size'][1], note='後牆中間一扇窗（和祐廷的房間同一型）；窗景借 dorm_room'),
                   view='dorm_room', counter=None, clerk=None, teacherSpot=None, order=None, seats=seats, interact=inter, blocks=blocks, spots=spots,
                   cam_box=dict(x=[-1.6, 1.6]), see_thru=True, dorm_interior=True,
                   open=dict(range=['2025-09-01', '2026-06-30'], h0=21, h1=23, who='npc_fangyt', note='AA_399 第 11 節：大一（2025-09～2026-06）21～23 他在的時候可以敲門進去；他不在（characters.js 的 absentDates：寒假回台中）就照舊關著。大二起他搬走了，門關著'),
                   back_spawn=dict(x=-5.55, z=0.53, lv=1, yaw=round(math.pi, 4), note='宿舍 2F 走廊、205 門前面＝dorm3d.js 門的互動點'),
                   host_door=dict(zone='dorm_hall', id='r205', lv=1, label='敲門（205）', note='dorm3d.js 的門：時段內是「敲門（205）」、時段外照舊「205 寢室。門關著。」'))
    L.write_json(os.path.abspath(ROOM_LAYOUT_OUT), ROOMLAY)
    print('ROOM_LAYOUT', ROOM_LAYOUT_OUT)
