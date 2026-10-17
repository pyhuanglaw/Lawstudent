"""社會科學院大樓 一樓室內（SCN-V0-01；SOCSCI_PLAN 第 3 節第③步）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2（bpy，無介面）：
  python3 tools/blender/env_second/socbldg_layout_gen.py            # 先產生配置（遊戲和 Blender 共用）
  /opt/blenv/bin/python tools/blender/env_second/socbldg_interior.py [-- --out assets/models/env/second_ai/socsci_bldg1f.glb]

座標＝配置的區域座標（原點＝大樓中心、x 往東、z 往南、y 往上；世界＝(110＋x, −50＋z)）。
美術（ART_SOP；得獎遊戲標準：不要方塊感、不要廉價拼接）：
  大廳、走廊、核心：清水混凝土（大樓外觀同一張模板貼圖 socsci_formwork：板模分割、螺栓孔）、水磨石地坪（Poly Haven terrazzo_tiles）、
    露明的混凝土天花板＋線型燈；柱子倒角；西、北兩面玻璃帷幕（直框、橫框、地檻）。
  經濟學系辦公室（對應 2D soc_office）：木作櫃台（倒角檯面、下方木板）＋上方玻璃窗口；裡面四張辦公桌、螢幕、信箱格、影印機、盆栽。
  101 教室（對應 2D soc_classroom）：米白漆牆（Poly Haven painted_plaster_wall）、淺灰塑膠地磚、礦纖天花板＋日光燈、綠色黑板（鋁框、粉筆槽、板擦）、
    講桌、兩人一桌 15 張、30 張木面鐵腳椅（每張轉一點點、有幾張拉出來）、窗台盆栽、後面的軟木公告板、置物櫃、時鐘、冷氣。
  生活痕跡：公告欄的海報斜釘、販賣機下緣的磨損、教室椅背上的外套、桌上的講義與保特瓶、粉筆灰。
  接觸陰影（ART_SOP 2-5）：牆腳的踢腳線深色、家具腳的頂點色壓暗。
  遊戲要找的節點：PLATE_FACE_dir（樓層指引，字由遊戲畫）、PLATE_FACE_101、PLATE_FACE_office；門 DOOR_*；電梯 ELEV_A／ELEV_B；
  會淡出的牆 WALL_<id>（鏡頭擋到時遊戲可以淡出）。發光：GLOW_*（燈、販賣機、電梯樓層顯示）。
沒有真實店名、商標、校徽（D77）；海報、公告是色塊（沒有字）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/socsci_bldg1f.glb')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/socsci_bldg1f.layout.json'), encoding='utf-8'))
BD = J['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']; H = J['H']; WT = J['wallT']
R = J['rooms']; CL, OF, CO, ST = R['classroom'], R['office'], R['core'], R['store']
rng = random.Random(1017)

B.reset(texres=512)
root = B.group('socsci_bldg1f', props={'kind': 'socsci_bldg1f', 'layout': 'socsci_bldg1f.layout.json', 'world_center': json.dumps(J['world_center'])})
M = {
    'conc': L.pbr('sb_concrete', 'socsci_formwork', tile=2.4, target='#b9b6af', normal=0.35, maps=('diff', 'nor'), rough_value=0.82),
    'concC': L.pbr('sb_concrete_ceiling', 'socsci_formwork', tile=2.4, target='#a9a6a0', maps=('diff',), res=256, rough_value=0.88),
    'terr': L.pbr('sb_terrazzo', 'terrazzo_tiles', tile=1.4, target='#cfccc4', normal=0.25, maps=('diff', 'nor'), rough_value=0.32),
    'plaster': L.pbr('sb_plaster', 'painted_plaster_wall', tile=1.8, target='#ece6d8', normal=0.12, maps=('diff', 'nor'), res=256, rough_value=0.86),
    'vinyl': L.pbr('sb_vinyl', 'floor_tiles_06', tile=1.2, target='#c9c8c2', normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.42),
    'acoustic': L.pbr('sb_acoustic', 'ceiling_interior', tile=1.2, target='#eeece6', maps=('diff',), res=256, rough_value=0.95),
    'wood': L.pbr('sb_wood', 'walnut_veneer', tile=0.9, target='#b98f62', normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.5),
    'woodL': L.pbr('sb_wood_light', 'fine_grained_wood', tile=0.8, target='#cfae84', maps=('diff',), res=512, rough_value=0.48),
    'cork': L.pbr('sb_cork', 'granular_concrete', tile=0.6, target='#b8895a', maps=('diff',), res=256, rough_value=0.9),
    'board': L.flat('sb_chalkboard', '#2f4a3c', rough=0.85),
    'alu': L.flat('sb_aluminium', '#9da1a5', rough=0.35, metal=0.4),
    'steel': L.flat('sb_steel', '#7d8084', rough=0.4, metal=0.45),
    'brushed': L.flat('sb_brushed_steel', '#a4a7aa', rough=0.3, metal=0.45),
    'black': L.flat('sb_black', '#26282a', rough=0.5),
    'skirt': L.flat('sb_skirting', '#3b3d3f', rough=0.6),
    'glass': L.flat('ck_glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'mull': L.flat('sb_mullion', '#5a5e62', rough=0.4, metal=0.3),
    'lamp': L.flat('GLOW_sb_lamp', '#fff8ec', rough=0.4, emit=B.srgb('#fff3dc')),
    'tube': L.flat('GLOW_sb_tube', '#ffffff', rough=0.3, emit=B.srgb('#f4f8ff')),
    'disp': L.flat('GLOW_sb_display', '#ffb648', rough=0.3, emit=B.srgb('#ffa630')),
    'vlight': L.flat('GLOW_sb_vending', '#f4f7fb', rough=0.4, emit=B.srgb('#e8f0ff')),
    'sign': L.flat('sb_sign_face', '#ffffff', rough=0.7),
    'vc': L.vc_material('sb_vc', rough=0.62),
}
FLOOR_Y = 0.0
walls = {}


def wm(key, group='static'):
    k = (group, key)
    if k not in walls: walls[k] = Mesh(f'{group}_{key}', M[key], tile=2.4 if key in ('conc', 'concC') else None)
    return walls[k]


def vbox(cm, x0, x1, y0, y1, z0, z1, col, dark=0.82):
    """頂點色的盒子；下緣的頂點壓暗（接地的接觸陰影，ART_SOP 2-5 的 2）"""
    fs = cm.cbox(x0, x1, y0, y1, z0, z1, col)
    for f in fs:
        for lp in f.loops:
            if lp.vert.co.z < y0 + 0.02 + 1e-4: lp[cm.col] = tuple(c * dark for c in lp[cm.col][:3]) + (1.0,)
    return fs


# ================= 地板、天花板 =================
fl = Mesh('sb_floor_terrazzo', M['terr'], tile=1.4)
fl.box(X0, X1, -0.02, FLOOR_Y, Z0, CL['z0'])                                  # 大廳＋走廊＋核心前（北半）
fl.box(X0, CL['x0'], -0.02, FLOOR_Y, CL['z0'], Z1)                            # 大廳南半、系辦、核心
fl.finish(root)
Mesh('sb_floor_vinyl', M['vinyl'], tile=1.2).box(CL['x0'], X1, -0.019, FLOOR_Y + 0.001, CL['z0'], Z1).finish(root)
cc = Mesh('sb_ceiling_concrete', M['concC'], tile=2.4)
for (a0, a1, b0, b1) in ((X0, CL['x0'], Z0, Z1), (CL['x0'], X1, Z0, CL['z0'])):
    cc.quad([(a0, H, b0), (a1, H, b0), (a1, H, b1), (a0, H, b1)])
def face_down(ob):
    for p in ob.data.polygons:
        if p.normal.z > 0: p.flip()
    ob.data.update()
face_down(cc.finish(root))
face_down(Mesh('sb_ceiling_class', M['acoustic'], tile=1.2).quad([(CL['x0'], 3.3, CL['z0']), (X1, 3.3, CL['z0']), (X1, 3.3, Z1), (CL['x0'], 3.3, Z1)]).finish(root))
# 混凝土天花板的梁（大廳兩道、走廊沿線）：倒角，從下面看有深度（不是一張平的天花板）
beam = wm('conc')
for x in (-7.4,):
    beam.rbox(x - 0.3, x + 0.3, H - 0.65, H, Z0, Z1, r=0.02, seg=1)
beam.rbox(X0, CL['x0'], H - 0.55, H, -0.9, -0.3, r=0.02, seg=1)
# 線型燈：大廳四條、走廊一條（燈具＝深灰鋁槽＋發光面）
lt = Mesh('GLOW_sb_lines', M['lamp']); lh = Mesh('sb_light_housing', M['black'])
for z in (-4.4, -1.8, 2.0, 5.4):
    lh.box(X0 + 0.8, -2.9, H - 0.06, H, z - 0.05, z + 0.05)
    lt.quad([(-2.9, H - 0.061, z - 0.035), (X0 + 0.8, H - 0.061, z - 0.035), (X0 + 0.8, H - 0.061, z + 0.035), (-2.9, H - 0.061, z + 0.035)])
lh.box(-1.6, X1 - 0.6, H - 0.06, H, -4.35, -4.25)
lt.quad([(X1 - 0.6, H - 0.061, -4.335), (-1.6, H - 0.061, -4.335), (-1.6, H - 0.061, -4.265), (X1 - 0.6, H - 0.061, -4.265)])
lt.finish(root, uv=False); lh.finish(root, uv=False)

# ================= 外牆：西、北玻璃帷幕；東、南牆（教室有窗） =================
gl = Mesh('sb_curtain_glass', M['glass']); mu = Mesh('sb_curtain_mullion', M['mull'])
def curtain(axis, c, a0, a1, door=None):
    n = max(1, round((a1 - a0) / 1.6)); step = (a1 - a0) / n
    for k in range(n + 1):
        a = a0 + k * step
        if door and door[0] + 0.05 < a < door[1] - 0.05: continue
        if axis == 'x': mu.box(c - 0.06, c + 0.06, 0.0, H, a - 0.04, a + 0.04)
        else: mu.box(a - 0.04, a + 0.04, 0.0, H, c - 0.06, c + 0.06)
    for (y0, y1) in ((0.0, 0.1), (2.75, 2.82), (H - 0.1, H)):
        if axis == 'x': mu.box(c - 0.06, c + 0.06, y0, y1, a0, a1)
        else: mu.box(a0, a1, y0, y1, c - 0.06, c + 0.06)
    segs = [(a0, a1)] if not door else [(a0, door[0]), (door[1], a1)]
    for (s0, s1) in segs:
        if axis == 'x': gl.quad([(c, 0.1, s1), (c, 0.1, s0), (c, H - 0.1, s0), (c, H - 0.1, s1)])
        else: gl.quad([(s0, 0.1, c), (s1, 0.1, c), (s1, H - 0.1, c), (s0, H - 0.1, c)])
    if door:   # 自動門：兩片玻璃門扇（關著；遊戲的出口互動點在門前）＋門上的感應器
        d0, d1 = door; mid = (d0 + d1) / 2
        for (s0, s1) in ((d0, mid - 0.01), (mid + 0.01, d1)):
            if axis == 'x':
                mu.box(c - 0.03, c + 0.03, 0.0, 2.6, s0, s0 + 0.05); mu.box(c - 0.03, c + 0.03, 0.0, 2.6, s1 - 0.05, s1); mu.box(c - 0.03, c + 0.03, 2.55, 2.6, s0, s1)
                gl.quad([(c - 0.015, 0.02, s1), (c - 0.015, 0.02, s0), (c - 0.015, 2.55, s0), (c - 0.015, 2.55, s1)])
            else:
                mu.box(s0, s0 + 0.05, 0.0, 2.6, c - 0.03, c + 0.03); mu.box(s1 - 0.05, s1, 0.0, 2.6, c - 0.03, c + 0.03); mu.box(s0, s1, 2.55, 2.6, c - 0.03, c + 0.03)
                gl.quad([(s0, 0.02, c + 0.015), (s1, 0.02, c + 0.015), (s1, 2.55, c + 0.015), (s0, 2.55, c + 0.015)])
        if axis == 'x': mu.box(c - 0.12, c + 0.02, 2.62, 2.75, mid - 0.25, mid + 0.25)
        else: mu.box(mid - 0.25, mid + 0.25, 2.62, 2.75, c - 0.02, c + 0.12)
E = {e['id']: e for e in J['entrances']}
curtain('x', X0, Z0, Z1, door=(E['west']['z0'], E['west']['z1']))
curtain('z', Z0, X0, X1, door=(E['north']['x0'], E['north']['x1']))
gl.finish(root, uv=False); mu.finish(root, uv=False)
# 門口的地墊（深灰、略高 1 cm）
mat_ = CMesh('sb_doormats', M['vc'])
vbox(mat_, X0 + 0.06, X0 + 1.6, 0.0, 0.012, E['west']['z0'] - 0.2, E['west']['z1'] + 0.2, '#4b4e51', dark=1.0)
vbox(mat_, E['north']['x0'] - 0.2, E['north']['x1'] + 0.2, 0.0, 0.012, Z0 + 0.06, Z0 + 1.4, '#4b4e51', dark=1.0)
mat_.finish(root, uv=False)

# 南牆（大廳、核心、儲藏：混凝土；教室：漆牆＋窗）、東牆（教室：漆牆＋窗）
WNS = J['windows']
def wall_with_windows(axis, c, a0, a1, key, wins, sill, top, inner_sign):
    """axis 'z'：牆沿 x（南牆）、c＝內面 z；'x'：牆沿 z（東牆）、c＝內面 x。wins＝[(a0,a1),...] 窗洞；inner_sign：往室內的方向"""
    m = wm(key, 'WALL_' + ('south' if axis == 'z' else 'east'))
    t0, t1 = (c, c + WT * -inner_sign) if inner_sign < 0 else (c - WT, c)
    lo, hi = min(t0, t1), max(t0, t1)
    def bx(p0, p1, y0, y1):
        if axis == 'z': m.box(p0, p1, y0, y1, lo, hi)
        else: m.box(lo, hi, y0, y1, p0, p1)
    cur = a0
    for (w0, w1) in wins:
        if w0 > cur: bx(cur, w0, 0.0, H if key == 'conc' else 3.3)
        bx(w0, w1, 0.0, sill); bx(w0, w1, top, H if key == 'conc' else 3.3); cur = w1
    if cur < a1: bx(cur, a1, 0.0, H if key == 'conc' else 3.3)
WIN_E = [(-2.6, 0.4), (1.0, 4.0), (4.6, 7.4)]; WIN_S = [(5.6, 8.4), (9.0, 11.8), (12.4, 14.4)]
wall_with_windows('z', Z1, X0, CL['x0'], 'conc', [], 0, 0, -1)
wall_with_windows('z', Z1, CL['x0'], X1, 'plaster', WIN_S, 0.9, 3.0, -1)
wall_with_windows('x', X1, CL['z0'], Z1, 'plaster', WIN_E, 0.9, 3.0, -1)
wall_with_windows('x', X1, Z0, CL['z0'], 'conc', [], 0, 0, -1)
wm('conc', 'WALL_south').box(CL['x0'], X1, 3.3, H, Z1, Z1 + WT); wm('conc', 'WALL_east').box(X1, X1 + WT, 3.3, H, CL['z0'], Z1)   # 教室天花板（3.3）以上到樓板
# 教室的窗：鋁框、橫向的中框、窗台（白色人造石）、外面一點點的戶外景色交給遊戲（窗景平面）
wg = Mesh('sb_window_glass', M['glass']); wf = Mesh('sb_window_frame', M['alu']); sill = Mesh('sb_window_sill', M['woodL'])
for (w0, w1) in WIN_S:
    zc = Z1 + WT / 2
    wf.box(w0, w1, 0.9, 0.96, zc - 0.05, zc + 0.05); wf.box(w0, w1, 2.94, 3.0, zc - 0.05, zc + 0.05); wf.box(w0, w1, 2.2, 2.24, zc - 0.03, zc + 0.03)
    for x in (w0, (w0 + w1) / 2, w1): wf.box(x - 0.03, x + 0.03, 0.9, 3.0, zc - 0.05, zc + 0.05)
    wg.quad([(w0, 0.96, zc), (w1, 0.96, zc), (w1, 2.94, zc), (w0, 2.94, zc)])
    sill.rbox(w0 - 0.05, w1 + 0.05, 0.86, 0.9, Z1 - 0.22, Z1, r=0.006, seg=1)
for (w0, w1) in WIN_E:
    xc = X1 + WT / 2
    wf.box(xc - 0.05, xc + 0.05, 0.9, 0.96, w0, w1); wf.box(xc - 0.05, xc + 0.05, 2.94, 3.0, w0, w1); wf.box(xc - 0.03, xc + 0.03, 2.2, 2.24, w0, w1)
    for z in (w0, (w0 + w1) / 2, w1): wf.box(xc - 0.05, xc + 0.05, 0.9, 3.0, z - 0.03, z + 0.03)
    wg.quad([(xc, 0.96, w1), (xc, 0.96, w0), (xc, 2.94, w0), (xc, 2.94, w1)])
    sill.rbox(X1 - 0.22, X1, 0.86, 0.9, w0 - 0.05, w1 + 0.05, r=0.006, seg=1)
wg.finish(root, uv=False); wf.finish(root, uv=False); sill.finish(root)

# ================= 隔間牆＋門 =================
WALL_BY_ID = {w['id']: w for w in J['walls']}
DOORS = J['doors']
def wall_segments(w):
    (ax, az), (bx_, bz) = w['a'], w['b']; vert = abs(ax - bx_) < 1e-6
    ds = sorted([d for d in DOORS if d['wall'] == w['id']], key=lambda d: d.get('x0', d.get('z0')))
    a0, a1 = (az, bz) if vert else (ax, bx_)
    segs, cur = [], a0
    for d in ds:
        d0, d1 = d.get('z0', d.get('x0')), d.get('z1', d.get('x1'))
        segs.append((cur, d0, 0.0)); segs.append((d0, d1, 2.25)); cur = d1     # 門洞上面 2.25 m 以上是牆
    segs.append((cur, a1, 0.0))
    return vert, (ax if vert else az), segs
CNT = J['counter']
for w in J['walls']:
    vert, c, segs = wall_segments(w)
    in_class = w['id'] in ('office_east', 'class_north') and True
    key = 'conc' if w['id'] in ('core_west', 'office_west', 'office_north', 'office_south', 'core_east') else 'plaster'
    top = H if key == 'conc' else 3.3
    m = wm(key, 'WALL_' + w['id'])
    for (s0, s1, y0) in segs:
        if s1 - s0 < 1e-3: continue
        if w['id'] == 'office_north' and y0 == 0.0 and s0 < CNT['x1'] and s1 > CNT['x0']:     # 櫃台窗口
            for (p0, p1) in ((s0, CNT['x0']), (CNT['x1'], s1)):
                if p1 - p0 > 1e-3: m.box(p0, p1, 0.0, top, c - WT / 2, c + WT / 2)
            m.box(CNT['x0'], CNT['x1'], 0.0, CNT['y0'], c - WT / 2, c + WT / 2); m.box(CNT['x0'], CNT['x1'], CNT['y1'], top, c - WT / 2, c + WT / 2)
            continue
        if vert: m.box(c - WT / 2, c + WT / 2, y0, top, s0, s1)
        else: m.box(s0, s1, y0, top, c - WT / 2, c + WT / 2)
    if key == 'conc' and top == H and w['id'] in ('office_north',):   # 系辦北牆在走廊那一面接到天花板；教室北牆在走廊那一側上面另外補到天花板
        pass
# 教室北牆、東西牆在 3.3 m 以上到天花板（走廊、大廳那一側看得到）：混凝土
for w in ('class_north', 'office_east'):
    (ax, az), (bx_, bz) = WALL_BY_ID[w]['a'], WALL_BY_ID[w]['b']
    if abs(ax - bx_) < 1e-6: wm('conc', 'WALL_' + w).box(ax - WT / 2, ax + WT / 2, 3.3, H, az, bz)
    else: wm('conc', 'WALL_' + w).box(ax, bx_, 3.3, H, az - WT / 2, az + WT / 2)
# 踢腳線（深灰，牆腳的暗）：大廳、走廊的混凝土牆；教室的漆牆
sk = Mesh('sb_skirting', M['skirt'])
sk.box(X0 + 0.1, CL['x0'], 0.0, 0.08, Z1 - 0.012, Z1); sk.box(X1 - 0.012, X1, 0.0, 0.08, Z0 + 0.1, CL['z0'])
sk.box(CL['x0'] + 0.1, X1, 0.0, 0.1, Z1 - 0.012, Z1); sk.box(X1 - 0.012, X1, 0.0, 0.1, CL['z0'] + 0.1, Z1)
sk.finish(root, uv=False)

# 門：門框（鋁）、門扇（木；開著的教室門轉 95° 靠牆）、門把、門牌（PLATE_FACE_*）
for d in DOORS:
    w = WALL_BY_ID[d['wall']]; (ax, az), (bx_, bz) = w['a'], w['b']; vert = abs(ax - bx_) < 1e-6
    d0, d1 = d.get('z0', d.get('x0')), d.get('z1', d.get('x1')); c = ax if vert else az
    g = B.group('DOOR_' + d['id'], root, {'kind': d.get('kind', 'door'), 'open': d['open']})
    fr = Mesh(f'door_{d["id"]}_frame', M['alu'])
    def fb(p0, p1, y0, y1, t=WT / 2 + 0.02):
        if vert: fr.box(c - t, c + t, y0, y1, p0, p1)
        else: fr.box(p0, p1, y0, y1, c - t, c + t)
    fb(d0 - 0.05, d0, 0.0, 2.3); fb(d1, d1 + 0.05, 0.0, 2.3); fb(d0 - 0.05, d1 + 0.05, 2.25, 2.3)
    fr.finish(g, uv=False)
    kind = d.get('kind', 'door')
    if kind == 'elevator':   # 不鏽鋼髮絲紋門兩片＋門框＋外面的呼叫按鈕盒＋上方樓層顯示
        lf = Mesh(f'ELEV_{d["id"]}', M['brushed']); mid = (d0 + d1) / 2
        lf.box(c - WT / 2 - 0.02, c - WT / 2, 0.0, 2.25, d0 - 0.12, d0) ; lf.box(c - WT / 2 - 0.02, c - WT / 2, 0.0, 2.25, d1, d1 + 0.12)
        lf.box(c - WT / 2 - 0.03, c - WT / 2, 2.25, 2.4, d0 - 0.12, d1 + 0.12)
        lf.finish(g, uv=False)
        for (s0, s1) in ((d0, mid - 0.004), (mid + 0.004, d1)):
            Mesh(f'ELEV_{d["id"]}_leaf', M['brushed']).box(c - WT / 2 + 0.02, c - WT / 2 + 0.05, 0.0, 2.2, s0, s1).finish(g, uv=False)
        Mesh(f'GLOW_elev_{d["id"]}_floor', M['disp']).box(c - WT / 2 - 0.035, c - WT / 2 - 0.03, 2.28, 2.36, mid - 0.09, mid + 0.09).finish(g, uv=False)
        bt = CMesh(f'elev_{d["id"]}_buttons', M['vc'])
        bt.crbox(c - WT / 2 - 0.03, c - WT / 2, 1.0, 1.32, d1 + 0.2, d1 + 0.32, '#8d9094', r=0.008, seg=1)
        for y in (1.1, 1.22): bt.cbox(c - WT / 2 - 0.042, c - WT / 2 - 0.03, y - 0.022, y + 0.022, d1 + 0.24, d1 + 0.28, '#e9ebec')
        bt.crbox(c - WT / 2 - 0.03, c - WT / 2, 1.35, 1.47, d1 + 0.22, d1 + 0.3, '#2b2d2f', r=0.006, seg=1)   # 刷卡機
        bt.finish(g, uv=False)
        continue
    if kind == 'stair':   # 玻璃門（鋼框）關著＋刷卡機；門後看得到樓梯第一跑往上（不能走：門關著、標示「研究室樓層・刷卡進出」）
        st = Mesh('stair_glass', M['glass']); sf = Mesh('stair_frame', M['steel'])
        st.quad([(c - 0.01, 0.05, d1 - 0.05), (c - 0.01, 0.05, d0 + 0.05), (c - 0.01, 2.2, d0 + 0.05), (c - 0.01, 2.2, d1 - 0.05)])
        for (p0, p1) in ((d0, d0 + 0.06), (d1 - 0.06, d1)): sf.box(c - 0.03, c + 0.03, 0.0, 2.25, p0, p1)
        sf.box(c - 0.03, c + 0.03, 2.19, 2.25, d0, d1); sf.box(c - 0.03, c + 0.03, 0.0, 0.12, d0, d1)
        sf.box(c - 0.07, c - 0.03, 0.95, 1.15, d1 - 0.16, d1 - 0.12)
        st.finish(g, uv=False); sf.finish(g, uv=False)
        cr = CMesh('stair_cardreader', M['vc']); cr.crbox(c - WT / 2 - 0.03, c - WT / 2, 1.3, 1.42, d0 - 0.2, d0 - 0.12, '#2b2d2f', r=0.006, seg=1); cr.finish(g, uv=False)
        sr = Mesh('stair_run', M['conc'], tile=2.4); rail = Mesh('stair_rail', M['steel'])   # 樓梯：從門後往東爬（寬 1.2、級高 0.17、級深 0.28）
        for k in range(10):
            sr.box(c + 0.6 + k * 0.28, c + 0.6 + (k + 1) * 0.28, 0.0, 0.17 * (k + 1), d0 + 0.0, d1 + 0.0)
        rail.cyl((c + 0.6, 0.9, d0 + 0.05), (c + 0.6 + 2.8, 0.9 + 1.7, d0 + 0.05), 0.022, seg=8)
        sr.finish(g); rail.finish(g, uv=False)
        continue
    lfm = Mesh(f'door_{d["id"]}_leaf', M['wood']); hd = Mesh(f'door_{d["id"]}_handle', M['steel'])
    wdt = d1 - d0
    if d['open']:   # 開著：門扇轉 95°、靠在牆邊（教室裡面那一側）
        if vert: lfm.rbox(c + WT / 2, c + WT / 2 + wdt, 0.0, 2.2, d0, d0 + 0.04, r=0.008, seg=1)
        else: lfm.rbox(d0, d0 + 0.04, 0.0, 2.2, c + WT / 2, c + WT / 2 + wdt, r=0.008, seg=1)
    else:
        if vert: lfm.rbox(c - 0.02, c + 0.02, 0.0, 2.2, d0, d1, r=0.008, seg=1); hd.box(c - 0.07, c - 0.02, 1.0, 1.03, d1 - 0.16, d1 - 0.06)
        else: lfm.rbox(d0, d1, 0.0, 2.2, c - 0.02, c + 0.02, r=0.008, seg=1); hd.box(d1 - 0.16, d1 - 0.06, 1.0, 1.03, c - 0.07, c - 0.02)
    lfm.finish(g); hd.finish(g, uv=False)
    if d.get('plate'):   # 門牌：門旁邊的牆上（走廊那一側），字由遊戲畫
        pid = 'PLATE_FACE_' + ('101' if d['plate'] == '101' else 'office')
        if not bpy.data.objects.get(pid):
            pm = Mesh(pid, M['sign']); pf = Mesh(pid + '_frame', M['black'])
            if not vert:
                px = d1 + 0.35
                pf.box(px - 0.02, px + 0.42, 1.48, 1.72, c - WT / 2 - 0.02, c - WT / 2)
                pm.quad([(px + 0.4, 1.5, c - WT / 2 - 0.021), (px, 1.5, c - WT / 2 - 0.021), (px, 1.7, c - WT / 2 - 0.021), (px + 0.4, 1.7, c - WT / 2 - 0.021)])
            pm.finish(root); pf.finish(root, uv=False)
for (g_, key), m in walls.items():
    if g_ == 'static': continue
    grp = bpy.data.objects.get(g_) or B.group(g_, root, {'kind': 'wall', 'fade': True})
    m.finish(grp)
for (g_, key), m in list(walls.items()):
    if g_ == 'static': m.finish(root)

# ================= 柱子（倒角混凝土） =================
cm = Mesh('sb_columns', M['conc'], tile=2.4)
for c_ in J['columns']:
    s = c_['s'] / 2; cm.rbox(c_['x'] - s, c_['x'] + s, 0.0, H, c_['z'] - s, c_['z'] + s, r=0.025, seg=2)
cm.finish(root)

# ================= 系辦：櫃台＋裡面 =================
c = WALL_BY_ID['office_north']['a'][1]
ct = Mesh('office_counter_top', M['woodL']); cw = Mesh('office_counter_front', M['wood'])
ct.rbox(CNT['x0'] - 0.05, CNT['x1'] + 0.05, CNT['top'] - 0.04, CNT['top'], c - WT / 2 - 0.32, c + WT / 2 + 0.25, r=0.01, seg=2)   # 檯面兩側伸出（走廊那邊 32 cm）
cw.rbox(CNT['x0'], CNT['x1'], 0.08, CNT['y0'], c - WT / 2 - 0.02, c - WT / 2, r=0.006, seg=1)
ct.finish(root); cw.finish(root)
og = Mesh('office_window', M['glass']); of = Mesh('office_window_frame', M['alu'])
og.quad([(CNT['x1'], CNT['top'] + 0.02, c), (CNT['x0'], CNT['top'] + 0.02, c), (CNT['x0'], CNT['y1'], c), (CNT['x1'], CNT['y1'], c)])
for x in (CNT['x0'], (CNT['x0'] + CNT['x1']) / 2, CNT['x1']): of.box(x - 0.025, x + 0.025, CNT['top'], CNT['y1'], c - 0.03, c + 0.03)
of.box(CNT['x0'], CNT['x1'], CNT['y1'] - 0.04, CNT['y1'], c - 0.03, c + 0.03)
og.finish(root, uv=False); of.finish(root, uv=False)
ofi = CMesh('office_items', M['vc']); ofw = Mesh('office_furniture', M['woodL']); ofs = Mesh('office_steel', M['steel'])
for it in J['office_items']:
    x, z = it['x'], it['z']
    if it['type'] == 'desk':
        ofw.rbox(x - 0.7, x + 0.7, 0.72, 0.75, z - 0.35, z + 0.35, r=0.008, seg=1)
        for (dx, dz) in ((-0.65, -0.3), (0.65, -0.3), (-0.65, 0.3), (0.65, 0.3)): ofs.box(x + dx - 0.02, x + dx + 0.02, 0.0, 0.72, z + dz - 0.02, z + dz + 0.02)
        vbox(ofi, x - 0.25, x + 0.25, 0.75, 1.07, z + 0.12, z + 0.15, '#1e1f21', dark=1.0)                  # 螢幕
        vbox(ofi, x - 0.05, x + 0.05, 0.75, 0.9, z + 0.15, z + 0.2, '#2a2b2d', dark=1.0)
        vbox(ofi, x - 0.21, x + 0.21, 0.79, 1.04, z + 0.115, z + 0.12, '#cfe0ee', dark=1.0)                 # 螢幕畫面（淺）
        vbox(ofi, x - 0.4, x - 0.12, 0.75, 0.81, z - 0.2, z + 0.05, rng.choice(['#e8e3d6', '#f1efe9', '#d9e4ea']), dark=1.0)   # 一疊公文
        vbox(ofi, x + 0.3, x + 0.38, 0.75, 0.85, z - 0.15, z - 0.07, '#b44a3a', dark=1.0)                  # 馬克杯
        ch = rng.uniform(-0.3, 0.3)
        vbox(ofi, x - 0.24 + ch * 0.2, x + 0.24 + ch * 0.2, 0.44, 0.5, z - 0.75, z - 0.3, '#3a3d42')          # 辦公椅
        vbox(ofi, x - 0.24 + ch * 0.2, x + 0.24 + ch * 0.2, 0.5, 1.0, z - 0.8, z - 0.74, '#3a3d42', dark=1.0)
    elif it['type'] == 'pigeonholes':   # 信箱格：木框 6×5、格子裡有幾張紙
        for i in range(7): ofw.box(x - 0.18, x + 0.18, 0.6, 2.0, z - 1.0 + i * 0.33 - 0.01, z - 1.0 + i * 0.33 + 0.01)
        for j in range(6): ofw.box(x - 0.18, x + 0.18, 0.6 + j * 0.28 - 0.01, 0.6 + j * 0.28 + 0.01, z - 1.0, z + 1.0)
        ofw.box(x + 0.16, x + 0.18, 0.6, 2.0, z - 1.0, z + 1.0)
        for i in range(6):
            for j in range(5):
                if rng.random() < 0.55: vbox(ofi, x - 0.12, x + 0.1, 0.61 + j * 0.28, 0.62 + j * 0.28 + rng.uniform(0.01, 0.05), z - 0.98 + i * 0.33, z - 0.72 + i * 0.33, rng.choice(['#f2efe6', '#e8dcc2', '#dfe8ef']), dark=1.0)
    elif it['type'] == 'copier':
        vbox(ofi, x - 0.3, x + 0.3, 0.0, 1.05, z - 0.3, z + 0.3, '#d9d9d4'); vbox(ofi, x - 0.3, x + 0.3, 1.05, 1.12, z - 0.3, z + 0.3, '#8d9094', dark=1.0)
    elif it['type'] == 'plant':
        vbox(ofi, x - 0.18, x + 0.18, 0.0, 0.42, z - 0.18, z + 0.18, '#e7e2d6')
for x in (-0.6, 1.6):   # 系辦的日光燈
    Mesh('GLOW_office_tube_%d' % int(x * 10), M['tube']).box(x - 0.6, x + 0.6, H - 0.06, H - 0.03, -0.2, 0.0).finish(root, uv=False)
ofi.finish(root, uv=False); ofw.finish(root); ofs.finish(root, uv=False)

# ================= 教室 =================
cx0 = CL['x0']
bd = Mesh('class_chalkboard', M['board']); bf = Mesh('class_board_frame', M['alu']); ci = CMesh('class_items', M['vc'])
bz0, bz1 = -1.8, 6.6; bx = cx0 + WT / 2
bd.quad([(bx + 0.012, 0.9, bz1), (bx + 0.012, 0.9, bz0), (bx + 0.012, 2.3, bz0), (bx + 0.012, 2.3, bz1)])
bf.box(bx, bx + 0.03, 0.86, 0.9, bz0 - 0.04, bz1 + 0.04); bf.box(bx, bx + 0.03, 2.3, 2.34, bz0 - 0.04, bz1 + 0.04)
for z in (bz0 - 0.04, (bz0 + bz1) / 2, bz1): bf.box(bx, bx + 0.03, 0.86, 2.34, z - 0.02, z + 0.02)
bf.box(bx, bx + 0.09, 0.86, 0.88, bz0, bz1)                                                              # 粉筆槽
for k in range(5): vbox(ci, bx + 0.02, bx + 0.08, 0.88, 0.895, 1.0 + k * 0.08, 1.06 + k * 0.08, ['#f5f3ec', '#f2d66a', '#e8b7c3', '#f5f3ec', '#9fc7e8'][k], dark=1.0)
vbox(ci, bx + 0.02, bx + 0.08, 0.88, 0.92, 2.0, 2.14, '#3b3d40', dark=1.0)                             # 板擦
vbox(ci, bx + 0.013, bx + 0.016, 0.95, 1.25, 2.4, 3.6, '#5d7466', dark=1.0)                            # 黑板上擦過的粉筆灰（淺一片）
bd.finish(root, uv=False); bf.finish(root, uv=False)
le = Mesh('class_lectern', M['wood'])
for f in J['furniture']:
    if f['type'] == 'lectern':
        le.rbox(f['x'] - 0.3, f['x'] + 0.3, 0.0, 1.05, f['z'] - 0.6, f['z'] + 0.6, r=0.015, seg=2)
        le.rbox(f['x'] - 0.36, f['x'] + 0.34, 1.05, 1.09, f['z'] - 0.66, f['z'] + 0.66, r=0.01, seg=1)
le.finish(root)
tb = Mesh('class_tables', M['woodL']); tl = Mesh('class_table_legs', M['steel']); chs = Mesh('class_chair_seats', M['wood']); chl = Mesh('class_chair_legs', M['steel'])
def chair(x, z, yaw, pull=0.0):
    s, c_ = math.sin(yaw), math.cos(yaw); fx, fz = s, c_; rx, rz = c_, -s       # 前＝(sin,cos)、右
    x, z = x - fx * pull, z - fz * pull
    P = lambda a, b: (x + rx * a + fx * b, z + rz * a + fz * b)
    def seg_box(a0, a1, y0, y1, b0, b1, mesh):
        pts = [P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1)]
        bm = mesh.bm; vs = [bm.verts.new(g2b(px, y, pz)) for y in (y0, y1) for (px, pz) in pts]
        for q in ((0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): bm.faces.new([vs[i] for i in q])
    seg_box(-0.21, 0.21, 0.44, 0.465, -0.2, 0.2, chs)          # 座板
    seg_box(-0.2, 0.2, 0.62, 0.86, -0.24, -0.215, chs)         # 椅背（往後）
    for (a, b) in ((-0.18, -0.17), (0.18, -0.17), (-0.18, 0.17), (0.18, 0.17)): seg_box(a - 0.012, a + 0.012, 0.0, 0.44, b - 0.012, b + 0.012, chl)
    for a in (-0.18, 0.18): seg_box(a - 0.01, a + 0.01, 0.44, 0.86, -0.235, -0.215, chl)
seats_by_xz = {}
for f in J['furniture']:
    if f['type'] != 'table2': continue
    x, z = f['x'], f['z']
    tb.rbox(x - 0.275, x + 0.275, 0.71, 0.74, z - 0.65, z + 0.65, r=0.008, seg=1)
    for dz in (-0.6, 0.6):
        tl.box(x - 0.22, x + 0.22, 0.66, 0.68, z + dz - 0.012, z + dz + 0.012); tl.box(x - 0.012, x + 0.012, 0.0, 0.71, z + dz - 0.012, z + dz + 0.012)
        tl.box(x - 0.24, x + 0.24, 0.0, 0.02, z + dz - 0.015, z + dz + 0.015)
for s_ in J['seats']:
    if s_['kind'] != 'class': continue
    pull = 0.0 if rng.random() < 0.7 else rng.uniform(0.08, 0.22)
    chair(s_['x'] - 0.05, s_['z'], s_['yaw'] + rng.uniform(-0.09, 0.09), pull)
    r_ = rng.random()
    if r_ < 0.12: vbox(ci, s_['x'] - 0.32, s_['x'] - 0.06, 0.44, 0.62, s_['z'] - 0.14, s_['z'] + 0.14, rng.choice(['#2f3a4a', '#6b4a3a', '#3c4a3e']))   # 椅子上的背包
    elif r_ < 0.2: vbox(ci, s_['x'] + 0.17, s_['x'] + 0.24, 0.56, 0.84, s_['z'] - 0.2, s_['z'] + 0.2, rng.choice(['#8a3b3b', '#d6d2c6', '#2e3640']), dark=1.0)   # 椅背上的外套
for f in J['furniture']:   # 桌上：講義、保特瓶（一部分的桌子）
    if f['type'] == 'table2' and rng.random() < 0.45:
        x, z = f['x'], f['z'] + rng.uniform(-0.4, 0.4)
        vbox(ci, x - 0.1, x + 0.12, 0.74, 0.745, z - 0.15, z + 0.13, '#f4f2ec', dark=1.0)
        if rng.random() < 0.5: ci.cbox(x + 0.12, x + 0.18, 0.74, 0.95, z + 0.2, z + 0.26, '#cfe3ee')
for m_ in (chs, chl): bmesh.ops.recalc_face_normals(m_.bm, faces=m_.bm.faces)
tb.finish(root); tl.finish(root, uv=False); chs.finish(root); chl.finish(root, uv=False)
# 後牆的軟木公告板＋紙（斜釘）、時鐘、冷氣、置物櫃、窗台盆栽、日光燈
ck = Mesh('class_cork', M['cork']); ckf = Mesh('class_cork_frame', M['woodL'])
for (a0, a1) in ((8.0, 10.6), (11.2, 13.8)):
    ck.box(a0, a1, 1.0, 2.0, Z1 - 0.025, Z1 - 0.005); ckf.box(a0 - 0.03, a1 + 0.03, 0.97, 2.03, Z1 - 0.03, Z1 - 0.004)
    for k in range(5):
        px = a0 + 0.2 + k * (a1 - a0 - 0.5) / 5 + rng.uniform(-0.05, 0.05); py = 1.15 + rng.uniform(0, 0.5)
        ang = rng.uniform(-0.12, 0.12); w_, h_ = rng.uniform(0.21, 0.3), rng.uniform(0.28, 0.4)
        col = rng.choice(['#f6f3ea', '#f2dda8', '#cfe2ea', '#f3c6b6', '#dfe9cf'])
        pts = [(px + math.cos(ang) * u - math.sin(ang) * v, py + math.sin(ang) * u + math.cos(ang) * v) for (u, v) in ((0, 0), (w_, 0), (w_, h_), (0, h_))]
        ci.poly([(p[0], p[1], Z1 - 0.027) for p in pts[::-1]], col)
ck.finish(root); ckf.finish(root)
vbox(ci, 9.4, 9.7, 2.6, 2.9, Z1 - 0.05, Z1 - 0.01, '#f4f2ec', dark=1.0)                                # 時鐘（面）
vbox(ci, X1 - 0.3, X1 - 0.01, 2.75, 3.05, 1.2, 2.3, '#ecebe7')                                       # 壁掛冷氣
for f in J['furniture']:
    if f['type'] == 'lockers':
        x, z = f['x'], f['z']
        for k in range(4):
            vbox(ci, x - 0.25, x + 0.25, 0.0, 1.6, z - 1.0 + k * 0.5 + 0.01, z - 0.5 + k * 0.5 - 0.01, rng.choice(['#8ea2b5', '#93a7b9']))
            ci.cbox(x - 0.26, x - 0.25, 1.1, 1.2, z - 0.6 + k * 0.5, z - 0.57 + k * 0.5, '#2a2b2d')
for (w0, w1) in WIN_S[:2]:   # 窗台盆栽（2D soc_classroom 窗邊的小盆栽）
    for k in range(2):
        x = w0 + 0.5 + k * 1.2; vbox(ci, x - 0.08, x + 0.08, 0.9, 1.04, Z1 - 0.16, Z1 - 0.02, '#c9a27a')
        f0 = set(ci.bm.faces); ci.ell((x, 1.12, Z1 - 0.09), 0.12, 0.1, 0.1, seg=8, rings=5); ci.paint([f for f in ci.bm.faces if f not in f0], '#4f7a45')
for x in (7.4, 10.4, 13.2):
    for z in (-1.0, 2.4, 5.8):
        Mesh('GLOW_class_tube', M['tube']).box(x - 0.6, x + 0.6, 3.25, 3.28, z - 0.12, z + 0.12).finish(root, uv=False)
ci.finish(root, uv=False)

# ================= 大廳家具 =================
lb = CMesh('lobby_items', M['vc']); lw = Mesh('lobby_wood', M['wood']); ls = Mesh('lobby_steel', M['steel'])
for f in J['furniture']:
    x, z, t = f['x'], f['z'], f['type']
    if t == 'bench':   # 木條長椅＋鋼腳
        along_z = abs(math.sin(f['yaw'])) > 0.7; Lg = 2.0
        for k in range(4):
            off = -0.18 + k * 0.12
            if along_z: lw.rbox(x + off - 0.05, x + off + 0.05, 0.42, 0.45, z - Lg / 2, z + Lg / 2, r=0.008, seg=1)
            else: lw.rbox(x - Lg / 2, x + Lg / 2, 0.42, 0.45, z + off - 0.05, z + off + 0.05, r=0.008, seg=1)
        for e in (-0.8, 0.8):
            if along_z: ls.box(x - 0.22, x + 0.22, 0.0, 0.42, z + e - 0.025, z + e + 0.025)
            else: ls.box(x + e - 0.025, x + e + 0.025, 0.0, 0.42, z - 0.22, z + 0.22)
    elif t == 'board':   # 公告欄：木框＋軟木板＋斜釘的海報（色塊，沒有字）
        w_ = f['w']; zc = Z1 - 0.01
        lw.rbox(x - w_ / 2 - 0.05, x + w_ / 2 + 0.05, 0.9, 2.1, zc - 0.05, zc, r=0.008, seg=1)
        Mesh('lobby_cork', M['cork']).box(x - w_ / 2, x + w_ / 2, 0.95, 2.05, zc - 0.06, zc - 0.05).finish(root)
        for k in range(f['posters']):
            px = x - w_ / 2 + 0.12 + (k % 5) * (w_ - 0.3) / 4 + rng.uniform(-0.04, 0.04); py = 1.05 + (k // 5) * 0.5 + rng.uniform(0, 0.08)
            ang = rng.uniform(-0.1, 0.1); w2, h2 = rng.uniform(0.2, 0.32), rng.uniform(0.28, 0.42)
            col = rng.choice(['#f6f3ea', '#f3c6b6', '#cfe2ea', '#f2dda8', '#2f4f6f', '#dfe9cf', '#e88a5a'])
            pts = [(px + math.cos(ang) * u - math.sin(ang) * v, py + math.sin(ang) * u + math.cos(ang) * v) for (u, v) in ((0, 0), (w2, 0), (w2, h2), (0, h2))]
            lb.poly([(p[0], p[1], zc - 0.062) for p in pts[::-1]], col)
            lb.cbox(px + w2 / 2 - 0.006, px + w2 / 2 + 0.006, py + h2 - 0.03, py + h2 - 0.018, zc - 0.068, zc - 0.062, '#c0392b')   # 圖釘
    elif t == 'vending':   # 兩台販賣機（白色機身、發光展示窗、按鈕列、取物口；下緣有磨損＝頂點色暗）
        for k in range(f.get('n', 1)):
            vx = x - f['w'] / 2 + 0.5 + k * 1.0
            vbox(lb, vx - 0.47, vx + 0.47, 0.0, 1.85, z - 0.38, z + 0.38, ['#e9e8e3', '#2f5f8a'][k], dark=0.7)
            Mesh('GLOW_vend_%d' % k, M['vlight']).quad([(vx + 0.36, 0.95, z - 0.385), (vx - 0.36, 0.95, z - 0.385), (vx - 0.36, 1.72, z - 0.385), (vx + 0.36, 1.72, z - 0.385)]).finish(root, uv=False)
            for r_ in range(3):
                for i in range(6):
                    lb.cbox(vx - 0.32 + i * 0.12, vx - 0.26 + i * 0.12, 1.0 + r_ * 0.24, 1.16 + r_ * 0.24, z - 0.392, z - 0.386, rng.choice(['#c0392b', '#2e86c1', '#f4d03f', '#27ae60', '#f5f5f0', '#8e44ad']))
            lb.cbox(vx - 0.3, vx + 0.3, 0.2, 0.42, z - 0.39, z - 0.382, '#1d1e20'); lb.cbox(vx + 0.2, vx + 0.4, 0.7, 0.9, z - 0.39, z - 0.382, '#5b5e62')
    elif t == 'directory':   # 樓層指引：深灰框＋白面（PLATE_FACE_dir：遊戲畫「1F 大廳・經濟學系辦公室・101 教室／2F～8F 研究室（刷卡）」）
        cx_ = J['rooms']['lobby']['x1'] - WT / 2
        lb.crbox(cx_ - 0.04, cx_, 1.0, 2.4, z - 0.72, z + 0.72, '#3a3d40', r=0.01, seg=1)
        Mesh('PLATE_FACE_dir', M['sign']).quad([(cx_ - 0.041, 1.08, z + 0.64), (cx_ - 0.041, 1.08, z - 0.64), (cx_ - 0.041, 2.32, z - 0.64), (cx_ - 0.041, 2.32, z + 0.64)]).finish(root)
    elif t == 'planter':   # 大盆栽：倒角的混凝土方盆＋大葉植物（plants.py）
        lb.crbox(x - 0.4, x + 0.4, 0.0, 0.62, z - 0.4, z + 0.4, '#8e8b85', r=0.03, seg=2)
    elif t == 'bins':   # 資源回收：三個桶（一般、紙類、塑膠）
        for k, col in enumerate(('#5b5e62', '#2e86c1', '#27ae60')):
            bx_ = x - 0.4 + k * 0.4; lb.crbox(bx_ - 0.17, bx_ + 0.17, 0.0, 0.85, z - 0.2, z + 0.2, col, r=0.02, seg=1); lb.cbox(bx_ - 0.17, bx_ + 0.17, 0.85, 0.88, z - 0.2, z + 0.2, '#2a2b2d')
lb.finish(root, uv=False); lw.finish(root); ls.finish(root, uv=False)
# 大盆栽的植物
try:
    sys.path.insert(0, os.path.join(HERE, '..'))
    import plants as PL
    PM = PL.materials('sb_')
    for k, f in enumerate([f for f in J['furniture'] if f['type'] == 'planter']):
        PL.potted(B.mesh_obj, PM, 'sb_plant%d' % k, root, f['x'], 0.62, f['z'], 0.36, 30 + k, h=1.5)
    PL.potted(B.mesh_obj, PM, 'sb_plant_office', root, -1.8, 0.42, 1.2, 0.17, 41, h=0.7)
except Exception as ex:
    print('plants skipped', ex)

# ================= 合併、匯出 =================
st = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
info = dict(st if isinstance(st, dict) else {}, tris_total=tris, layout='socsci_bldg1f.layout.json', world_center=J['world_center'])
L.write_json(OUT[:-4] + '.json', info)
print('socsci_bldg1f tris', tris, 'objects', sum(1 for o in bpy.data.objects if o.type == 'MESH'))
