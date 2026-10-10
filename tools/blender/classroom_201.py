"""霖澤館 201 階梯教室 正式模型：Blender 5.2 bpy 無介面 → GLB（WebP 貼圖、椅子用 GPU instancing）。
照使用者的教室照片：深色長桌＋木翻椅、灰地磚、木講桌、投影幕、白色方格天花板＋日光燈、右側窗（學生面向講台時的右手邊＝西牆）。
配置讀 src/data/classroom_layout.js（遊戲的平台高度、座位、導航讀同一份）。貼圖：Poly Haven CC0（tools/blender/fetch_polyhaven.py）。
節點約定：名字含 WALL_ 的是會淡出的牆（自訂屬性 dir＝往室內的法線，遊戲座標）。黑板上的字、時鐘指針、窗外的景、點地面用的透明地板由遊戲畫。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)。
用法：/opt/blenv/bin/python tools/blender/classroom_201.py [--out assets/models/env/classroom_201.glb] [--tex 512] [--render 輸出資料夾]
"""
import bpy, bmesh, json, math, os, re, sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None): return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/classroom_201.glb'))
TEXRES = int(arg('--tex', '512')); RENDER = arg('--render')
import b3lib as B   # 共用：材質、方塊、UV、匯出（tools/blender/b3lib.py）
B.reset(TEXRES)

src = open(os.path.join(ROOT, 'src/data/classroom_layout.js'), encoding='utf8').read()
C = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, H = C['W'], C['D'], C['H']; T = 0.25
rowZ = lambda r: C['rowZ0'] + r * C['rowDepth']
rowH = lambda r: 0.0 if r < 0 else C['rise'] * (r + 1)
A0, A1 = C['aisleX0'], C['aisleX1']

MAT = {
    'floor':   B.pbr('cls_floor', 'large_floor_tiles_02', tile=0.6, sat=0.3, target='#c4c3be'),     # 照片：灰色地磚（60 cm）
    'plat':    B.pbr('cls_platform', 'large_floor_tiles_02', tile=0.6, sat=0.3, target='#bebcb6'),
    'riser':   B.pbr('cls_riser', 'painted_plaster_wall', tile=1.5, target='#9b968e'),
    'wall':    B.pbr('cls_wall', 'painted_plaster_wall', tile=2.5, target='#e6e3dc'),
    'deskTop': B.pbr('cls_desk', 'fine_grained_wood', tile=1.2, target='#4d3f38'),         # 照片：深色長桌
    'seat':    B.pbr('cls_seat', 'wood_table_001', tile=0.8, target='#b98a5c'),            # 照片：木翻椅
    'woodL':   B.pbr('cls_lectern', 'fine_grained_wood', tile=1.0, target='#a87d55'),      # 照片：木講桌
    'ceiling': B.pbr('cls_ceiling', 'ceiling_interior', tile=1.2, sat=0.2, target='#f2f1ee', normal=0.25),
    'grid':    B.pbr('cls_grid', None, tint=B.srgb('#e4e2dc'), rough=0.6),
    'metal':   B.pbr('cls_metal', None, tint=B.srgb('#3d4146'), rough=0.4, metal=0.7),
    'steel':   B.pbr('cls_steel', None, tint=B.srgb('#c9ccd0'), rough=0.3, metal=1.0),
    'board':   B.pbr('cls_board', None, tint=B.srgb('#25403a'), rough=0.6),
    'screen':  B.pbr('cls_screen', None, tint=B.srgb('#f4f3ef'), rough=0.9),
    'frame':   B.pbr('cls_frame', None, tint=B.srgb('#c9ccd0'), rough=0.35, metal=0.6),
    'glass':   B.pbr('cls_glass', None, tint=B.srgb('#c4d6dc'), rough=0.05, alpha=0.25),
    'light':   B.pbr('cls_light', None, tint=B.srgb('#fffaf0'), rough=0.9, emit=B.srgb('#fff8ea')),
}
root = B.group('Classroom201')

# ---------------- 地板、講台、六排平台、兩側走道台階 ----------------
B.box('floor', MAT['floor'], -W / 2, W / 2, -0.2, 0.0, -D / 2, D / 2, root)
for r in range(C['rows']):
    z0 = rowZ(r); z1 = D / 2 if r == C['rows'] - 1 else z0 + C['rowDepth']; h = rowH(r); hp = rowH(r - 1)
    B.box(f'plat_{r}', MAT['plat'], -A0, A0, 0.0, h, z0, z1, root)
    B.box(f'riser_edge_{r}', MAT['metal'], -A0, A0, h - 0.03, h + 0.002, z0, z0 + 0.04, root)          # 平台前緣的金屬收邊
    st = C['aisleStepDepth']
    for sx in (-1, 1):
        xa, xb = (-A1, -A0) if sx < 0 else (A0, A1)
        B.box(f'aisle_{r}_{sx}_a', MAT['plat'], xa, xb, 0.0, hp + 0.15, z0, z0 + st / 2, root)
        B.box(f'aisle_{r}_{sx}_b', MAT['plat'], xa, xb, 0.0, h, z0 + st / 2, z0 + st, root)
        B.box(f'aisle_{r}_{sx}_c', MAT['plat'], xa, xb, 0.0, h, z0 + st, z1, root)
        for k, zz in enumerate((z0, z0 + st / 2)):   # 階梯止滑條
            B.box(f'nosing_{r}_{sx}_{k}', MAT['metal'], xa, xb, (hp + 0.15 * (k + 1)) - 0.012, hp + 0.15 * (k + 1) + 0.002, zz, zz + 0.04, root)

# ---------------- 長桌（每排一張 12 m，深色木頭桌面＋金屬腳＋前擋板）----------------
dk = C['desk']
for r in range(C['rows']):
    z0 = rowZ(r); h = rowH(r); zc = z0 + dk['dz']; top = h + dk['top']
    B.box(f'desk_top_{r}', MAT['deskTop'], -dk['w'] / 2, dk['w'] / 2, top - 0.035, top, zc - dk['d'] / 2, zc + dk['d'] / 2, root, bevel=0.008)
    B.box(f'desk_modesty_{r}', MAT['deskTop'], -dk['w'] / 2, dk['w'] / 2, h + 0.18, top - 0.035, zc - dk['d'] / 2, zc - dk['d'] / 2 + 0.025, root)   # 前擋板（面向講台那一側）
    n = int(dk['w'] / 2.0) + 1
    for i in range(n):
        x = -dk['w'] / 2 + 0.08 + (dk['w'] - 0.16) * i / (n - 1)
        B.box(f'desk_leg_{r}_{i}', MAT['metal'], x - 0.025, x + 0.025, h, top - 0.035, zc - dk['d'] / 2 + 0.03, zc + dk['d'] / 2 - 0.03, root)

# ---------------- 木翻椅（一個模型，48 個實例：GPU instancing）----------------
chair = B.group('seat_proto_root')
B.box('seat_pan', MAT['seat'], -0.24, 0.24, 0.44, 0.48, -0.22, 0.2, chair, bevel=0.012)
B.box('seat_back', MAT['seat'], -0.24, 0.24, 0.52, 0.9, 0.2, 0.24, chair, bevel=0.012)
for sx in (-1, 1):
    B.box(f'seat_side_{sx}', MAT['metal'], sx * 0.26 - 0.015, sx * 0.26 + 0.015, 0.0, 0.62, -0.18, 0.22, chair)
seat_mesh = B.join_children(chair, 'seat_proto')        # 一個網格（兩個材質）
for r in range(C['rows']):
    for i in range(C['cols']):
        x = C['colX0'] + i * C['colDX']; z = rowZ(r) + C['seat']['dz']
        B.instance(seat_mesh, f'seat_{r}_{i}', x, rowH(r), z, root)
B.remove(chair)

# ---------------- 講台：木講桌、黑板（字由遊戲畫）、投影幕、時鐘框 ----------------
L_ = C['lectern']
B.box('lectern', MAT['woodL'], L_['x'] - L_['w'] / 2, L_['x'] + L_['w'] / 2, 0, L_['h'], L_['z'] - L_['d'] / 2, L_['z'] + L_['d'] / 2, root, bevel=0.015)
B.box('lectern_top', MAT['deskTop'], L_['x'] - L_['w'] / 2 - 0.05, L_['x'] + L_['w'] / 2 + 0.05, L_['h'], L_['h'] + 0.04, L_['z'] - L_['d'] / 2 - 0.05, L_['z'] + L_['d'] / 2 + 0.05, root, bevel=0.01)
bd = C['board']; FZ = -D / 2 + T / 2
B.box('board', MAT['board'], bd['x'] - bd['w'] / 2, bd['x'] + bd['w'] / 2, bd['y'] - bd['h'] / 2, bd['y'] + bd['h'] / 2, FZ, FZ + 0.04, root)
B.box('board_frame_b', MAT['frame'], bd['x'] - bd['w'] / 2 - 0.05, bd['x'] + bd['w'] / 2 + 0.05, bd['y'] - bd['h'] / 2 - 0.08, bd['y'] - bd['h'] / 2, FZ, FZ + 0.12, root)   # 粉筆槽
sc = C['screen']
B.box('screen', MAT['screen'], sc['x'] - sc['w'] / 2, sc['x'] + sc['w'] / 2, sc['y'] - sc['h'] / 2, sc['y'] + sc['h'] / 2, FZ, FZ + 0.02, root)
B.box('screen_roll', MAT['metal'], sc['x'] - sc['w'] / 2 - 0.1, sc['x'] + sc['w'] / 2 + 0.1, sc['y'] + sc['h'] / 2, sc['y'] + sc['h'] / 2 + 0.12, FZ, FZ + 0.14, root)

# ---------------- 牆（四面，會淡出）；西牆三扇窗（窗洞＋鋁框＋玻璃）----------------
wy0, wy1 = C['windows']['y'] - 0.8, C['windows']['y'] + 0.8; xs = sorted(C['windows']['xs'])   # 窗在西牆：牆面座標 t＝z（西牆 room() 的 winXs 是沿牆的位置）
B.box('WALL_N', MAT['wall'], -W / 2, W / 2, 0, H, -D / 2 - T / 2, -D / 2 + T / 2, root, props={'dir': [0, 0, 1]})
B.box('WALL_S', MAT['wall'], -W / 2, W / 2, 0, H, D / 2 - T / 2, D / 2 + T / 2, root, props={'dir': [0, 0, -1]})
B.box('WALL_E', MAT['wall'], W / 2 - T / 2, W / 2 + T / 2, 0, H, -D / 2, D / 2, root, props={'dir': [-1, 0, 0]})
# 西牆：窗洞之間的牆段＋窗下、窗上
zs = [-D / 2] + [v for t in xs for v in (t - 1.15, t + 1.15)] + [D / 2]
for k in range(0, len(zs), 2):
    a, b2 = zs[k], zs[k + 1]
    if b2 - a > 0.02: B.box(f'WALL_W_{k}', MAT['wall'], -W / 2 - T / 2, -W / 2 + T / 2, 0, H, a, b2, root, props={'dir': [1, 0, 0]})
for t in xs:
    B.box(f'WALL_Wlow_{t}', MAT['wall'], -W / 2 - T / 2, -W / 2 + T / 2, 0, wy0, t - 1.15, t + 1.15, root, props={'dir': [1, 0, 0]})
    B.box(f'WALL_Whigh_{t}', MAT['wall'], -W / 2 - T / 2, -W / 2 + T / 2, wy1, H, t - 1.15, t + 1.15, root, props={'dir': [1, 0, 0]})
    B.quad(f'win_glass_{t}', MAT['glass'], [(-W / 2, wy0, t + 1.15), (-W / 2, wy0, t - 1.15), (-W / 2, wy1, t - 1.15), (-W / 2, wy1, t + 1.15)], root)
    for (z0w, z1w) in ((t - 1.15, t - 1.09), (t + 1.09, t + 1.15), (t - 0.03, t + 0.03)):
        B.box(f'win_mullion_{t}_{z0w:.2f}', MAT['frame'], -W / 2 + T / 2 - 0.02, -W / 2 + T / 2 + 0.04, wy0, wy1, z0w, z1w, root)
    for yy in (wy0, wy1 - 0.06):
        B.box(f'win_rail_{t}_{yy:.2f}', MAT['frame'], -W / 2 + T / 2 - 0.02, -W / 2 + T / 2 + 0.04, yy, yy + 0.06, t - 1.15, t + 1.15, root)
    B.box(f'win_sill_{t}', MAT['frame'], -W / 2 + T / 2, -W / 2 + T / 2 + 0.2, wy0 - 0.05, wy0, t - 1.25, t + 1.25, root)
# 門（後牆中間）
# 後門的門框、門板：名字含 WALL_，跟著後牆淡出（舊版合併進 CLS_cls_*，鏡頭在後牆外時一大塊深色門擋住最上排的人物，#16）
B.box('WALL_S_doorframe', MAT['metal'], C['door']['x'] - 0.85, C['door']['x'] + 0.85, rowH(C['rows'] - 1), rowH(C['rows'] - 1) + 2.65, D / 2 - T / 2 - 0.06, D / 2 - T / 2, root, props={'dir': [0, 0, -1]})
B.box('WALL_S_doorleaf', MAT['woodL'], C['door']['x'] - 0.75, C['door']['x'] + 0.75, rowH(C['rows'] - 1), rowH(C['rows'] - 1) + 2.5, D / 2 - T / 2 - 0.1, D / 2 - T / 2 - 0.06, root, props={'dir': [0, 0, -1]})

# ---------------- 天花板：白色方格天花板（T 型骨架）＋日光燈 ----------------
B.quad('ceiling', MAT['ceiling'], [(-W / 2, H, -D / 2), (W / 2, H, -D / 2), (W / 2, H, D / 2), (-W / 2, H, D / 2)], root)
gx = -W / 2
while gx <= W / 2 + 1e-6:
    B.box(f'grid_x_{gx:.1f}', MAT['grid'], gx - 0.012, gx + 0.012, H - 0.02, H - 0.001, -D / 2, D / 2, root); gx += 0.6
gz = -D / 2
while gz <= D / 2 + 1e-6:
    B.box(f'grid_z_{gz:.1f}', MAT['grid'], -W / 2, W / 2, H - 0.02, H - 0.001, gz - 0.012, gz + 0.012, root); gz += 0.6
for i in range(4):
    for j in range(6):
        cx, cz = -5.4 + i * 3.6, -7.0 + j * 2.8
        B.box(f'light_{i}_{j}', MAT['light'], cx - 0.6, cx + 0.6, H - 0.04, H - 0.02, cz - 0.15, cz + 0.15, root)

B.join_by_material(root, 'CLS', keep=lambda ob: 'WALL_' in ob.name or ob.name.startswith('seat_'))
B.export(OUT, ROOT, gpu_instances=True)
if RENDER:
    B.render_views(RENDER, 'classroom', [('from_door', (0.0, 3.9, 7.6), (-1.5, 1.2, -6.5)), ('from_lectern', (2.5, 2.2, -7.0), (-0.5, 1.4, 4.0)), ('row2_side', (7.0, 2.8, 0.5), (-2.0, 1.0, -1.5))],
                   lights=[(0, 4.8, -4, 400), (0, 4.8, 2, 400), (0, 4.8, 6, 300)])
