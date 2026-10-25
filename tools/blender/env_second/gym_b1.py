"""新體育館（綜合體育館）第三階段：B1（大廳、健身中心、游泳池；BB_151；LAWWW2-B 2026-10-16）→ GLB。Blender 5.2：
  python3 tools/blender/env_second/gym_tex.py           （b1_rubber.jpg、pool_floor.jpg）
  /opt/blenv/bin/python tools/blender/env_second/gym_b1.py [-- --out assets/models/env/second_ai/gym_b1.glb]
配置：src/data/gym_layout.js 的 b1。座標＝gym_b1 區域座標（中心在原點、x 往東、z 往南、y＝B1 地板 0）。
- 大廳（樓梯從 1F 下來、閘門三道、服務櫃台的位置）、走廊（北邊游泳池的牆＋更衣室的門、南邊健身中心的玻璃牆）。
- 健身中心：黑色橡膠地墊（v7：自由重量區黑、有氧區灰、一條草皮道）、南牆整面鏡子（v7：一片一片的鏡片＋接縫）；
  v7 牆面：西牆深藍主題牆＋間歇計時器、南牆鏡子上方深藍色帶＋兩台公告螢幕、東牆使用須知＋時鐘、輕鋼架天花板（gym_tex.py b1 產生貼圖）；器材是 BB-B 的 bb_support/gym_b1_props.glb（GYM-P1），照 layout 的 equipment 擺（GPU instancing）；
  服務櫃台、置物櫃、體重計、毛巾回收籃是 bb_support/gym_b1_entry.glb（GYM-P2），照 entryProps 擺。
- 游泳池：25 m × 7 水道、池底馬賽克＋水道線、水面（半透明）、水道繩、出發台、扶梯、仰泳旗；只到池邊（池子不能走）。
- 關著的門：更衣室、壁球室・桌球室（PLATE_FACE_door_*：門牌字由遊戲畫）。
會淡出的牆：WALL_<side>_*（dir）。「日系加一點寫實 不要很像積木」：出發台、扶梯、欄杆、閘門都倒角／圓管。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
import plants as PL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/gym_layout.js')))"], cwd=L.ROOT))
G = LAY['b1']; OUT = os.path.join(L.ROOT, arg('--out', G['glb'])); GEN = os.path.join(HERE, 'textures', 'gen')
X0, X1, Z0, Z1 = -24.0, 24.0, -24.0, 14.0; H, PH = G['h'], G['poolH']
random.seed(151)
B.reset(texres=512)
root = B.group('gym_b1', props={'kind': 'gym_b1', 'layout': LAY['version']})
base = CL.materials()


def img_mat(name, fn, rough=0.6, emit=0.0, tile=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = tile; return m


P = 'b1_'
M = {
    'granite': L.pbr(P + 'granite', 'granite_tile', tile=1.2, target='#a9a7a2', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.35),
    'rubber': img_mat(P + 'rubber', 'b1_rubber.jpg', rough=0.85),
    'deck': L.pbr(P + 'pool_deck', 'rounded_square_tiled_wall', tile=0.5, target='#d9e2e4', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'mosaic': L.pbr(P + 'pool_mosaic', 'rounded_square_tiled_wall', tile=0.35, target='#8fc3d6', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.3),
    'pool_floor': img_mat(P + 'pool_floor', 'pool_floor.jpg', rough=0.3),
    'water': L.flat(P + 'water', '#3f9fc8', rough=0.04, alpha=0.42),
    'plaster': L.pbr(P + 'plaster', 'white_plaster_02', tile=3.0, target='#e2dfd8', normal=0.3, maps=('diff',), res=256, rough_value=0.85, contrast=0.3),   # v7：對比 0.3（原本的斑駁在遊戲裡像髒的水泥牆）
    'tile_wall': L.pbr(P + 'wall_tile', 'long_white_tiles', tile=1.2, target='#d6dcdc', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.35),
    'ceil': L.flat(P + 'ceiling', '#eceae4', rough=0.9, cull=True), 'ceil_pool': L.flat(P + 'ceiling_pool', '#d8dde0', rough=0.9, cull=True),
    'steel': L.flat(P + 'steel', '#b9bec2', rough=0.25, metal=0.45), 'steel_dk': L.flat(P + 'steel_dark', '#3a3e42', rough=0.45, metal=0.35),
    'glass': base['glass'], 'mirror': L.flat(P + 'mirror', '#c9ced2', rough=0.05, metal=0.45),
    'light': L.flat(P + 'light', '#ffffff', rough=0.3, emit=B.srgb('#f4f8ff')), 'door': L.flat(P + 'door', '#5d6a72', rough=0.5),
    'white': L.flat(P + 'white', '#f2f3f3', rough=0.35), 'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=0.9, target='#b48a5e', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'rope_r': L.flat(P + 'rope_red', '#c8352c', rough=0.45), 'rope_b': L.flat(P + 'rope_blue', '#2a5fb0', rough=0.45), 'rope_w': L.flat(P + 'rope_white', '#f2f2ee', rough=0.45),
    'flag': L.flat(P + 'flags', '#e8c53a', rough=0.7), 'fascia': L.flat(P + 'fascia', '#23395e', rough=0.6),
    'hours': img_mat(P + 'hours', 'gym_hours.png', rough=0.5), 'notice': img_mat(P + 'notice', 'gym_notice.png', rough=0.8),
    'desk_sign': img_mat(P + 'desk_sign', 'b1_desk_sign.png', rough=0.5),
    # v7（2026-10-24，巡查 P3「B1 健身房單調：白天花板、灰牆、黑地板、牆上沒有東西」）
    'rubber_grey': img_mat(P + 'rubber_grey', 'b1_rubber_grey.jpg', rough=0.85), 'turf': img_mat(P + 'turf', 'b1_turf.jpg', rough=0.95),
    'wall_free': img_mat(P + 'wall_free', 'b1_wall_free.png', rough=0.7), 'rules': img_mat(P + 'rules', 'b1_rules.png', rough=0.6),
    'tv': img_mat(P + 'tv', 'b1_tv.png', rough=0.2, emit=0.55), 'timer': img_mat(P + 'timer', 'b1_timer.png', rough=0.3, emit=1.0),
    'ceil_tile': img_mat(P + 'ceiling_tile', 'b1_ceiling.jpg', rough=0.9), 'mirror_img': img_mat(P + 'mirror_panel', 'b1_mirror.jpg', rough=0.06),
    'accent_y': L.flat(P + 'accent_yellow', '#e8b03c', rough=0.5),
}
M['ceil_tile'].use_backface_culling = True   # 天花板單面、法線朝下（同 ceil：跟隨鏡頭在天花板上面時看得穿）


class Xf:
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z): return Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry, 4, 'Z')
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=2):
        bm = L.rbox_bm(x1 - x0, y1 - y0, z1 - z0, r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m


X0_ = Xf(0, 0)
_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh(P + key, mat)
    return _acc[mat.name]


walls = {'front': [], 'back': [], 'left': [], 'right': [], 'poolN': [], 'fitN': [], 'fitE': [], 'stairL': [], 'stairR': []}
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0],
        'poolN': [0, 0, 1], 'fitN': [0, 0, -1], 'fitE': [-1, 0, 0], 'stairL': [-1, 0, 0], 'stairR': [1, 0, 0]}
# 隔間牆（v6，LAWWW-B 2026-10-16：原本不是 WALL_，鏡頭跑到牆的另一邊整個畫面被擋住）：走廊北牆＝泳池那一面（poolN）、健身中心的玻璃牆（fitN）、
# 健身中心東牆（fitE）、樓梯兩側的牆（stairL／R）。props partition＝1：鏡頭和玩家在牆的不同邊才淡出（遊戲端的規則）；
# dir＝遊戲端還沒支援 partition 時的備用（照一般外牆：鏡頭在 dir 那一邊才不透明）——選最常見的情況：人在走廊。
PARTS = {'poolN', 'fitN', 'fitE', 'stairL', 'stairR'}
def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m
IMGS = []; PLATE = []
def img_quad(name, mat, pts, uv=(0, 0, 1, 1), wall=None): IMGS.append((name, mat, pts, uv, wall))   # wall：貼在那一面會淡出的牆上（WALL_<side>_*，跟牆一起淡出）

# ======================== 地板 ========================
LB, CO, FI, PO = G['lobby'], G['corridor'], G['fitness'], G['pool']; BA = PO['basin']; DEP = BA['depth']
img_quad('lobby_floor', M['granite'], [(CO['x1'], 0.002, Z1), (X1, 0.002, Z1), (X1, 0.002, CO['z0']), (CO['x1'], 0.002, CO['z0'])], (0, 0, (X1 - CO['x1']) / 1.2, (Z1 - CO['z0']) / 1.2))
img_quad('corridor_floor', M['granite'], [(X0, 0.002, CO['z1']), (CO['x1'], 0.002, CO['z1']), (CO['x1'], 0.002, CO['z0']), (X0, 0.002, CO['z0'])], (0, 0, (CO['x1'] - X0) / 1.2, (CO['z1'] - CO['z0']) / 1.2))
# 健身中心（v7）：西半部自由重量區＝黑色橡膠墊、東半部有氧區＝中灰的運動地墊（x −5.6 有一條鋁壓條）、自由重量區中間一條人工草皮道（推雪橇）；
# 貼圖一張 2 m（2×2 塊墊子），UV 照世界座標算（切成幾塊也接得起來）；草皮道和黑墊切開、不重疊（同一個高度，不會疊面）
XW, TF = -5.6, (-23.4, -12.4, 6.6, 8.6)
def floor_rect(name, mat, x0, x1, z0, z1, s=2.0):
    img_quad(name, mat, [(x0, 0.002, z1), (x1, 0.002, z1), (x1, 0.002, z0), (x0, 0.002, z0)], ((x0 - X0) / s, (Z1 - z1) / s, (x1 - X0) / s, (Z1 - z0) / s))
floor_rect('fitness_floor_a', M['rubber'], FI['x0'], XW, FI['z0'], TF[2]); floor_rect('fitness_floor_b', M['rubber'], FI['x0'], XW, TF[3], FI['z1'])
floor_rect('fitness_floor_c', M['rubber'], FI['x0'], TF[0], TF[2], TF[3]); floor_rect('fitness_floor_d', M['rubber'], TF[1], XW, TF[2], TF[3])
floor_rect('fitness_floor_cardio', M['rubber_grey'], XW, FI['x1'], FI['z0'], FI['z1'])
img_quad('fitness_turf', M['turf'], [(TF[0], 0.002, TF[3]), (TF[1], 0.002, TF[3]), (TF[1], 0.002, TF[2]), (TF[0], 0.002, TF[2])])
img_quad('fitness_east_floor', M['granite'], [(FI['x1'], 0.002, Z1), (CO['x1'], 0.002, Z1), (CO['x1'], 0.002, FI['z0']), (FI['x1'], 0.002, FI['z0'])], (0, 0, 1.6, 9))
for (a, b, c, d) in ((X0, X1, Z0, BA['z0']), (X0, X1, BA['z1'], PO['z1']), (X0, BA['x0'], BA['z0'], BA['z1']), (BA['x1'], X1, BA['z0'], BA['z1'])):   # 池邊（池子挖掉）
    img_quad(f'deck_{a:.0f}_{c:.0f}', M['deck'], [(a, 0.002, d), (b, 0.002, d), (b, 0.002, c), (a, 0.002, c)], ((a - X0) / 0.5, (Z1 - d) / 0.5, (b - X0) / 0.5, (Z1 - c) / 0.5))
img_quad('pool_bottom', M['pool_floor'], [(BA['x0'], -DEP, BA['z1']), (BA['x1'], -DEP, BA['z1']), (BA['x1'], -DEP, BA['z0']), (BA['x0'], -DEP, BA['z0'])], (0, 0, 1, 1))
mo = acc('mosaic')                                                   # 池壁（朝池子裡；上緣停在池緣磚下面 2 cm，原本和池緣磚的內側疊面）
for (pts) in ([(BA['x0'], -DEP, BA['z0']), (BA['x1'], -DEP, BA['z0']), (BA['x1'], -0.02, BA['z0']), (BA['x0'], -0.02, BA['z0'])],
              [(BA['x1'], -DEP, BA['z1']), (BA['x0'], -DEP, BA['z1']), (BA['x0'], -0.02, BA['z1']), (BA['x1'], -0.02, BA['z1'])],
              [(BA['x0'], -DEP, BA['z1']), (BA['x0'], -DEP, BA['z0']), (BA['x0'], -0.02, BA['z0']), (BA['x0'], -0.02, BA['z1'])],
              [(BA['x1'], -DEP, BA['z0']), (BA['x1'], -DEP, BA['z1']), (BA['x1'], -0.02, BA['z1']), (BA['x1'], -0.02, BA['z0'])]):
    mo.quad(pts)
for (a, b, c, d) in ((BA['x0'] - 0.3, BA['x1'] + 0.3, BA['z0'] - 0.3, BA['z0']), (BA['x0'] - 0.3, BA['x1'] + 0.3, BA['z1'], BA['z1'] + 0.3),   # 池緣（白色倒角磚＋溢水溝的格柵）
                     (BA['x0'] - 0.3, BA['x0'], BA['z0'], BA['z1']), (BA['x1'], BA['x1'] + 0.3, BA['z0'], BA['z1'])):
    X0_.rbox(acc('white'), a, b, -0.02, 0.03, c, d, r=0.015, seg=2)
wa = Mesh(P + 'water', M['water']); wa.quad([(BA['x0'], -0.14, BA['z1']), (BA['x1'], -0.14, BA['z1']), (BA['x1'], -0.14, BA['z0']), (BA['x0'], -0.14, BA['z0'])]); wa.finish(root, uv=False)
# 水道繩（6 條＋兩邊的池壁不用）：每 0.5 m 一顆浮球（兩端 5 m 紅色、中間藍白相間）
LW = (BA['z1'] - BA['z0']) / BA['lanes']
for k in range(1, BA['lanes']):
    z = BA['z0'] + k * LW; x = BA['x0'] + 0.25
    while x < BA['x1'] - 0.2:
        key = 'rope_r' if (x < BA['x0'] + 5 or x > BA['x1'] - 5) else ('rope_b' if int((x - BA['x0']) / 0.5) % 2 else 'rope_w')
        bm = L.lathe([(0.0, -0.06), (0.05, -0.05), (0.065, 0.0), (0.05, 0.05), (0.0, 0.06)], seg=8); bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'Y'))
        acc(key).add_bm(bm, Matrix.Translation(g2b(x, -0.13, z))); bm.free(); x += 0.5
# 出發台（西端，7 個）、扶梯（四個角）、仰泳旗（離兩端 5 m）
for k in range(BA['lanes']):
    z = BA['z0'] + (k + 0.5) * LW; xf = Xf(BA['x0'] - 0.45, z)
    xf.rbox(acc('white'), -0.3, 0.3, 0.55, 0.72, -0.25, 0.25, r=0.03, seg=2); xf.rbox(acc('steel_dk'), -0.24, 0.24, 0.0, 0.55, -0.2, 0.2, r=0.02, seg=1)
    for sz in (-0.27, 0.27): acc('steel').cyl(xf.p(0.25, 0.72, sz), xf.p(0.25, 0.95, sz), 0.015, seg=6)
for (x, z, s) in ((BA['x1'] - 1.0, BA['z0'], 1), (BA['x1'] - 1.0, BA['z1'], -1), (BA['x0'] + 1.6, BA['z0'], 1), (BA['x0'] + 1.6, BA['z1'], -1)):
    for dx in (-0.25, 0.25):
        pts = [(x + dx, -1.0, z + s * 0.12), (x + dx, 0.05, z + s * 0.12), (x + dx, 0.85, z - s * 0.05), (x + dx, 0.85, z - s * 0.35), (x + dx, 0.0, z - s * 0.45)]
        for a, b in zip(pts, pts[1:]): acc('steel').cyl(a, b, 0.021, seg=8)
    for k in range(3): acc('steel').box(x - 0.25, x + 0.25, -0.3 - k * 0.28, -0.27 - k * 0.28, z + s * 0.05, z + s * 0.17)
for xe in (BA['x0'] + 5.0, BA['x1'] - 5.0):
    for z in (BA['z0'] - 0.6, BA['z1'] + 0.6): acc('steel').cyl((xe, 0.0, z), (xe, 1.9, z), 0.025, seg=8)
    acc('rope_w').cyl((xe, 1.85, BA['z0'] - 0.6), (xe, 1.85, BA['z1'] + 0.6), 0.006, seg=4)
    n = int((BA['z1'] - BA['z0'] + 1.2) / 0.35)
    for k in range(n):
        z = BA['z0'] - 0.6 + (k + 0.5) * 0.35; acc('flag').quad([(xe, 1.85, z - 0.12), (xe, 1.85, z + 0.12), (xe, 1.6, z)])

# ======================== 牆、天花板 ========================
# 外牆：北（游泳池那一面，back）、南（健身中心鏡牆後面，front）、東（right）、西（left）
wm('back', 'tile_wall').box(X0, X1, 0.0, 2.2, Z0 - 0.25, Z0); wm('back', 'plaster').box(X0, X1, 2.2, PH, Z0 - 0.25, Z0)
wm('front', 'plaster').box(X0, X1, 0.0, H, Z1, Z1 + 0.25)
for side, x, s in (('left', X0, -1), ('right', X1, 1)):
    xa, xb = (x - 0.25, x) if s < 0 else (x, x + 0.25)
    wm(side, 'tile_wall').box(xa, xb, 0.0, 2.2, Z0, PO['z1']); wm(side, 'plaster').box(xa, xb, 2.2, PH, Z0, PO['z1'])
    wm(side, 'plaster').box(xa, xb, 0.0, H, PO['z1'], Z1)
# 走廊北牆（游泳池那一側）：泳池的門（玻璃）、兩個更衣室的門；走廊天花板以上到泳池天花板
zw = CO['z0']; dx0, dx1 = PO['door']['x0'], PO['door']['x1']
doors = [(d['x'] - 0.5, d['x'] + 0.5) for d in G['closedDoors'] if abs(d['z'] - zw) < 0.1]
cuts = sorted([(dx0, dx1)] + doors); xs = [X0] + [v for c in cuts for v in c] + [CO['x1'] + 12]
for i in range(0, len(xs), 2):
    wm('poolN', 'tile_wall').box(xs[i], xs[i + 1], 0.0, 2.2, zw - 0.15, zw); wm('poolN', 'plaster').box(xs[i], xs[i + 1], 2.2, 3.0, zw - 0.15, zw)
wm('poolN', 'plaster').box(X0, X1, 3.0, PH, zw - 0.15, zw)
for (a, b) in cuts: wm('poolN', 'plaster').box(a, b, 2.2, 3.0, zw - 0.15, zw)
wm('poolN', 'glass').box(dx0 + 0.05, dx1 - 0.05, 0.0, 2.15, zw - 0.09, zw - 0.06)
for x in (dx0, dx1): wm('poolN', 'steel_dk').box(x - 0.04, x + 0.04, 0.0, 2.2, zw - 0.16, zw + 0.01)
wm('poolN', 'steel_dk').box(dx0, dx1, 2.15, 2.22, zw - 0.16, zw + 0.01); wm('poolN', 'steel').cyl(((dx0 + dx1) / 2 + 0.1, 1.0, zw + 0.03), ((dx0 + dx1) / 2 + 0.1, 1.4, zw + 0.03), 0.015, seg=8)
for d in G['closedDoors']:                                            # 關著的門：門板、門框、門把、門牌（PLATE_FACE_door_*）
    if abs(d['z'] - zw) < 0.1:
        xf = Xf(d['x'], zw); xf.rbox(wm('poolN', 'door'), -0.46, 0.46, 0.0, 2.1, -0.1, -0.05, r=0.01, seg=1)
        wm('poolN', 'steel').cyl(xf.p(0.32, 1.0, -0.03), xf.p(0.32, 1.0, 0.03), 0.02, seg=8)
        PLATE.append((f"PLATE_FACE_door_b1_{d['label']}", [xf.p(-0.25, 1.62, -0.035), xf.p(0.25, 1.62, -0.035), xf.p(0.25, 1.82, -0.035), xf.p(-0.25, 1.82, -0.035)][::-1], {'plate': 'door', 'text': d['label']}))
    else:                                                             # 走廊西端（面向東）
        xf = Xf(d['x'] + 0.02, d['z'], math.pi / 2); xf.rbox(acc('door'), -0.6, 0.6, 0.0, 2.1, -0.02, 0.03, r=0.01, seg=1)
        PLATE.append((f"PLATE_FACE_door_b1_{d['label']}", [xf.p(-0.35, 1.62, 0.04), xf.p(0.35, 1.62, 0.04), xf.p(0.35, 1.82, 0.04), xf.p(-0.35, 1.82, 0.04)], {'plate': 'door', 'text': d['label']}))
# 走廊南牆＝健身中心的玻璃牆（門開著）；健身中心東牆
zf = FI['z0']; fx0, fx1 = FI['door']['x0'], FI['door']['x1']
for (a, b) in ((FI['x0'], fx0), (fx1, FI['x1'])):
    wm('fitN', 'glass').box(a, b, 0.0, 2.6, zf - 0.03, zf + 0.03)
    n = max(1, round((b - a) / 1.8))
    for j in range(n + 1): x = a + j * (b - a) / n; wm('fitN', 'steel_dk').box(x - 0.035, x + 0.035, 0.0, 2.6, zf - 0.05, zf + 0.05)
wm('fitN', 'steel_dk').box(FI['x0'], FI['x1'], 2.6, 2.68, zf - 0.05, zf + 0.05); wm('fitN', 'plaster').box(FI['x0'], FI['x1'], 2.68, H, zf - 0.08, zf + 0.08)
wm('fitN', 'steel_dk').box(FI['x0'], FI['x1'], 0.0, 0.08, zf - 0.05, zf + 0.05)
wm('fitE', 'plaster').box(FI['x1'], FI['x1'] + 0.15, 0.0, H, zf + 0.08, Z1)   # 從北牆（fitN）後面開始：原本兩道牆重疊，牆角的面疊在一起
wm('fitN', 'plaster').box(FI['x1'], CO['x1'], 0.0, H, zf - 0.08, zf + 0.08)
# 鏡牆（南牆、整面）：鏡面＋上下框
mr = FI['mirror']
# v7：鏡子原本是一整片灰（遊戲沒有環境貼圖，金屬度上限 0.45，看起來像灰牆）→ 一片 1.2 m 左右的鏡片，整面一張貼圖畫出「上亮下暗、中間一條亮帶、淡淡的器材倒影」的反射感；
# 片和片之間一條 8 mm 的深色接縫（離鏡面 2 mm，不疊面）
nmr = round((mr['x1'] - mr['x0']) / 1.2); wmr = (mr['x1'] - mr['x0']) / nmr
for k in range(nmr):
    xa = mr['x0'] + k * wmr; xb = xa + wmr
    img_quad(f'mirror_{k}', M['mirror_img'], [(xb, 0.3, mr['z']), (xa, 0.3, mr['z']), (xa, 2.4, mr['z']), (xb, 2.4, mr['z'])], ((nmr - 1 - k) / nmr, 0, (nmr - k) / nmr, 1))   # 整面一張貼圖，每片取自己那一段（人面向鏡子，左手邊＝x 大）
    if k: acc('steel_dk').box(xa - 0.004, xa + 0.004, 0.3, 2.4, mr['z'] - 0.006, mr['z'] - 0.002)
for y in (0.24, 2.4): acc('steel').box(mr['x0'], mr['x1'], y, y + 0.06, mr['z'] - 0.02, mr['z'] + 0.05)
acc('fascia').box(FI['x0'], FI['x1'], 0.0, 0.24, mr['z'] - 0.03, Z1)
# v7 牆面（貼在會淡出的牆上的東西都放進那一面牆的 WALL_ 群組，牆淡出時一起淡出）
# 南牆鏡子上面：深藍色帶＋黃線（和泳池、大廳的深藍色帶同一套），有氧區上方吊兩台螢幕（公告輪播）
zb = Z1 - 0.004
wm('front', 'fascia').quad([(mr['x1'], 2.56, zb), (mr['x0'], 2.56, zb), (mr['x0'], 2.98, zb), (mr['x1'], 2.98, zb)])
wm('front', 'accent_y').quad([(mr['x1'], 2.5, zb), (mr['x0'], 2.5, zb), (mr['x0'], 2.535, zb), (mr['x1'], 2.535, zb)])
for k, xt in enumerate((1.2, 4.6)):
    Xf(xt, 13.6).rbox(acc('steel_dk'), -0.56, 0.56, 2.53, 3.19, -0.03, 0.03, r=0.012, seg=1)
    for sx in (-0.3, 0.3): acc('steel').cyl((xt + sx, 3.19, 13.6), (xt + sx, H, 13.6), 0.012, seg=6)
    img_quad(f'tv_{k}', M['tv'], [(xt + 0.52, 2.568, 13.567), (xt - 0.52, 2.568, 13.567), (xt - 0.52, 3.152, 13.567), (xt + 0.52, 3.152, 13.567)], (k * 0.5, 0, k * 0.5 + 0.5, 1))
# 西牆（自由重量區）：整面深藍主題牆（自由重量區、啞鈴圖示、黃線、安全提醒）＋深色踢腳＋間歇計時器
xw = X0 + 0.004; zs_, zn_ = FI['z1'] - 0.16, FI['z0'] + 0.12
img_quad('wall_free', M['wall_free'], [(xw, 0.1, zs_), (xw, 0.1, zn_), (xw, 2.98, zn_), (xw, 2.98, zs_)], wall='left')
wm('left', 'steel_dk').quad([(xw, 0.0, zs_), (xw, 0.0, zn_), (xw, 0.1, zn_), (xw, 0.1, zs_)])
wm('left', 'steel_dk').box(X0 + 0.01, X0 + 0.07, 2.27, 2.63, 6.1, 7.1)
img_quad('timer', M['timer'], [(X0 + 0.075, 2.31, 7.05), (X0 + 0.075, 2.31, 6.15), (X0 + 0.075, 2.59, 6.15), (X0 + 0.075, 2.59, 7.05)], wall='left')
# 東牆（置物櫃北邊）：使用須知（深色底板）、時鐘
xe = FI['x1']
wm('fitE', 'steel_dk').box(xe - 0.025, xe - 0.005, 1.12, 2.43, 8.87, 9.88)
img_quad('rules', M['rules'], [(xe - 0.028, 1.15, 8.9), (xe - 0.028, 1.15, 9.85), (xe - 0.028, 2.4, 9.85), (xe - 0.028, 2.4, 8.9)], wall='fitE')
cz_, cy_ = 12.3, 2.55
wm('fitE', 'steel_dk').cyl((xe - 0.005, cy_, cz_), (xe - 0.06, cy_, cz_), 0.34, seg=32)
wm('fitE', 'white').cyl((xe - 0.062, cy_, cz_), (xe - 0.066, cy_, cz_), 0.3, seg=32)
for k in range(12):
    a = k / 12 * 2 * math.pi; py, pz = cy_ + 0.25 * math.cos(a), cz_ + 0.25 * math.sin(a)
    wm('fitE', 'steel_dk').box(xe - 0.07, xe - 0.068, py - 0.018, py + 0.018, pz - 0.018, pz + 0.018)
wm('fitE', 'steel_dk').box(xe - 0.074, xe - 0.071, cy_, cy_ + 0.2, cz_ - 0.01, cz_ + 0.01); wm('fitE', 'steel_dk').box(xe - 0.074, xe - 0.071, cy_ - 0.01, cy_ + 0.01, cz_, cz_ + 0.15)
# 自由重量區和有氧區的地墊之間：鋁壓條
acc('steel').box(XW - 0.02, XW + 0.02, 0.0, 0.007, FI['z0'] + 0.06, mr['z'] - 0.03)
# 閘門（x 12，三道；樣式同 1F）
GT = G['gates']; lw = (GT['z1'] - GT['z0'] - 0.12) / GT['lanes']
for j in range(GT['lanes'] + 1):
    z = GT['z0'] + 0.06 + j * lw; xf = Xf(GT['x'], z)
    xf.rbox(acc('steel'), -0.45, 0.45, 0.0, 1.0, -0.06, 0.06, r=0.04, seg=2)
    if j < GT['lanes']: acc('steel').cyl((GT['x'], 0.85, z + 0.06), (GT['x'], 0.85, z + lw * 0.55), 0.015, seg=6)
# 樓梯（從 1F 下來：往 +z 上去，一路到天花板的開口）＋扶手
ST = LB['stairs']; n = 22; run = (ST['z1'] - ST['z0']) / n
for j in range(n): z = ST['z0'] + j * run; X0_.rbox(acc('granite'), ST['x0'], ST['x1'], 0.0, (j + 1) * H / n, z, z + run + 0.01, r=0.008, seg=1)
for x in (ST['x0'] + 0.08, ST['x1'] - 0.08):
    acc('steel').cyl((x, 0.95, ST['z0']), (x, H + 0.95, ST['z1']), 0.022, seg=8)
    for j in range(0, n, 4): z = ST['z0'] + j * run; acc('steel').cyl((x, (j + 1) * H / n, z + run / 2), (x, (j + 1) * H / n + 0.95, z + run / 2), 0.015, seg=6)
for x, sd in ((ST['x0'] - 0.1, 'stairL'), (ST['x1'] + 0.1, 'stairR')): wm(sd, 'plaster').box(x - 0.1, x + 0.1, 0.0, H, ST['z0'] + 3.0, Z1)
for x in (ST['x0'] - 0.005, ST['x1'] + 0.005):                     # 樓梯側面的斜板（蓋住一階一階的方塊斷面）
    for xx in (x, x + (-0.06 if x < ST['x0'] else 0.06)): acc('white').quad([(xx, 0.0, ST['z0']), (xx, 0.0, ST['z1']), (xx, H, ST['z1']), (xx, H / n, ST['z0'])])
    acc('steel_dk').quad([(x, H / n, ST['z0']), (x, H, ST['z1']), (x + (-0.06 if x < ST['x0'] else 0.06), H, ST['z1']), (x + (-0.06 if x < ST['x0'] else 0.06), H / n, ST['z0'])])
# 大廳：開館時間、公告欄、長椅、盆栽；服務櫃台是 BB-B 的 GYM2_COUNTER（下面跟器材一起擺）
DK = G['desk']                                                       # 服務台後面：靠北牆的矮櫃（文件、鑰匙）＋牆上的牌子；櫃台本身是 BB-B 的 GYM2_COUNTER
xf = Xf(DK['x'], CO['z0'] + 0.15); xf.rbox(acc('white'), -1.4, 1.4, 0.0, 0.86, -0.15, 0.15, r=0.02, seg=2); xf.rbox(acc('wood'), -1.42, 1.42, 0.86, 0.9, -0.16, 0.16, r=0.01, seg=1)
for sx in (-0.7, 0.0, 0.7): xf.rbox(acc('steel_dk'), sx - 0.12, sx + 0.12, 0.62, 0.64, 0.15, 0.17, r=0.005, seg=1)   # 抽屜把手
img_quad('desk_sign', M['desk_sign'], [(DK['x'] - 1.2, 2.0, CO['z0'] + 0.03), (DK['x'] + 1.2, 2.0, CO['z0'] + 0.03), (DK['x'] + 1.2, 2.6, CO['z0'] + 0.03), (DK['x'] - 1.2, 2.6, CO['z0'] + 0.03)])
acc('steel_dk').box(DK['x'] - 1.24, DK['x'] + 1.24, 1.96, 2.64, CO['z0'], CO['z0'] + 0.02)
# v7 修正：開館時間牌、公告欄的圖原本貼在框（x X1−0.05～−0.02）、木板（X1−0.08～−0.02）的後面（X1−0.03），遊戲裡只看到一塊黑板、一塊空木板；
# 而且頂點從 z 大的那一邊開始＝字左右相反（人面向東牆時 +z 在右手邊）。改成貼在框的前面 3 mm、u＝0 在 z 小的那一邊
img_quad('hours', M['hours'], [(X1 - 0.053, 1.4, 2.2), (X1 - 0.053, 1.4, 3.6), (X1 - 0.053, 2.44, 3.6), (X1 - 0.053, 2.44, 2.2)])
acc('steel_dk').box(X1 - 0.05, X1 - 0.02, 1.35, 2.49, 2.15, 3.65)
img_quad('notice', M['notice'], [(X1 - 0.083, 1.3, 4.4), (X1 - 0.083, 1.3, 7.6), (X1 - 0.083, 2.5, 7.6), (X1 - 0.083, 2.5, 4.4)])
Xf(X1 - 0.05, 6.0).rbox(acc('wood'), -0.03, 0.03, 1.24, 2.56, -1.68, 1.68, r=0.01, seg=1)
for z in (9.5, 11.5):
    xf = Xf(22.8, z, math.pi / 2); xf.rbox(acc('wood'), -0.9, 0.9, 0.42, 0.47, -0.22, 0.22, r=0.015, seg=2)
    for sx in (-0.7, 0.7): xf.rbox(acc('steel_dk'), sx - 0.03, sx + 0.03, 0.0, 0.42, -0.2, 0.2, r=0.008, seg=1)
PLM = PL.materials(P + 'pl_')
for (x, z, sd) in ((13.0, 13.2, 7), (23.2, 13.2, 9)):
    bm = L.lathe([(0.2, 0.0), (0.24, 0.03), (0.28, 0.5), (0.26, 0.5)], seg=16); acc('white').add_bm(bm, Matrix.Translation(g2b(x, 0.0, z))); bm.free()
    PL.potted(B.mesh_obj, PLM, f'b1_plant_{sd}', root, x, 0.5, z, 0.26, seed=sd, h=0.4)
    PL.broad_plant(B.mesh_obj, PLM, f'b1_plant_{sd}b', root, x, 0.48, z, 1.4, 0.6, seed=sd + 3)
# 天花板：大廳、走廊、健身中心 3.6（走廊 3.0）；游泳池 7.0（吸音板＋燈）
c1 = Mesh(P + 'ceiling', M['ceil'])
for (a, b, c, d, h) in ((CO['x1'], X1, CO['z0'], ST['z0'] + 3.0, H), (CO['x1'], ST['x0'] - 0.2, ST['z0'] + 3.0, Z1, H), (ST['x1'] + 0.2, X1, ST['z0'] + 3.0, Z1, H),
                        (X0, CO['x1'], CO['z0'], CO['z1'], 3.0), (FI['x1'], CO['x1'], FI['z0'], Z1, H)):
    c1.quad([(a, h, c), (b, h, c), (b, h, d), (a, h, d)])
c1.finish(root, uv=False)
# v7：健身中心的天花板＝60 cm 輕鋼架礦纖板（原本整片平的白；單面朝下，頂點順序和 c1 一樣）
a, b, c, d = FI['x0'], FI['x1'], FI['z0'], Z1
img_quad('ceiling_tile', M['ceil_tile'], [(a, H, c), (b, H, c), (b, H, d), (a, H, d)], ((a - X0) / 1.2, (c - Z0) / 1.2, (b - X0) / 1.2, (d - Z0) / 1.2))
c2 = Mesh(P + 'ceiling_pool', M['ceil_pool']); c2.quad([(X0, PH, Z0), (X1, PH, Z0), (X1, PH, CO['z0']), (X0, PH, CO['z0'])]); c2.finish(root, uv=False)
for x in range(-21, 22, 6):                                           # 泳池上方：吸音板（橫向長條）＋燈
    for z in (-21.0, -15.0, -9.0, -3.5):
        X0_.rbox(acc('white'), x - 2.2, x + 2.2, PH - 0.5, PH - 0.42, z - 0.5, z + 0.5, r=0.02, seg=1)
        acc('light').cyl((x + 2.6, PH - 0.3, z), (x + 2.6, PH - 0.29, z), 0.3, seg=14); CL.glow(root, 'pool', x + 2.6, PH - 0.6, z, color='rgba(240,248,255,1)', size=2.4, day=0.35, night=0.8)   # 2026-10-21 光暈接進遊戲以後：白天花板上 3.0 m 太亮
for x in range(-21, 10, 4):                                           # 健身中心：線型燈（沿 x）
    for z in (5.5, 9.0, 12.2):
        acc('light').box(x - 1.2, x + 1.2, H - 0.04, H - 0.01, z - 0.06, z + 0.06)
        # 線型燈不放光暈（2026-10-21 光暈接進遊戲以後看：圓的光暈和一條燈管不搭，3.6 m 的白天花板上一團一團過曝；燈管本身會發光）
for x in range(-21, 12, 5): acc('light').cyl((x, 2.99, 1.4), (x, 3.0, 1.4), 0.12, seg=12); CL.glow(root, 'corridor', x, 2.8, 1.4, color='rgba(255,244,226,1)', size=0.8, day=0.2, night=0.6)
for x in (14, 18, 22):
    for z in (2.0, 6.0): acc('light').cyl((x, H - 0.01, z), (x, H, z), 0.15, seg=12); CL.glow(root, 'downlight', x, H - 0.2, z, color='rgba(255,244,226,1)', size=0.9, day=0.2, night=0.6)

# 顏色：泳池四周牆上一圈深藍色帶、北牆的大時鐘、池邊長椅；大廳的深藍牆裙（v1 整片白，像醫院）
for (a_, b_, c_, d_) in ((X0, X1, Z0, Z0 + 0.04), (X0, X0 + 0.04, Z0, CO['z0'] - 0.15), (X1 - 0.04, X1, Z0, CO['z0'] - 0.15)):
    acc('fascia').box(a_, b_, 2.2, 2.5, c_, d_)
acc('fascia').box(X0, X1, 2.2, 2.5, CO['z0'] - 0.19, CO['z0'] - 0.15)
cl = Xf(0.0, Z0 + 0.05)
bm = L.lathe([(0.0, 0.0), (0.62, 0.0), (0.66, 0.03), (0.66, 0.08), (0.0, 0.08)], seg=40); bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'))
acc('steel_dk').add_bm(bm, Matrix.Translation(g2b(0.0, 4.6, Z0 + 0.02))); bm.free()
acc('white').quad([(-0.6, 4.0, Z0 + 0.11), (0.6, 4.0, Z0 + 0.11), (0.6, 5.2, Z0 + 0.11), (-0.6, 5.2, Z0 + 0.11)])
for k in range(12): a = k / 12 * 2 * math.pi; acc('steel_dk').box(0.52 * math.sin(a) - 0.02, 0.52 * math.sin(a) + 0.02, 4.6 + 0.52 * math.cos(a) - 0.05, 4.6 + 0.52 * math.cos(a) + 0.05, Z0 + 0.11, Z0 + 0.12)
acc('steel_dk').box(-0.02, 0.02, 4.6, 4.98, Z0 + 0.12, Z0 + 0.13); acc('steel_dk').box(0.0, 0.3, 4.58, 4.62, Z0 + 0.12, Z0 + 0.13)
for x in (-21.0, -18.6, 18.6, 21.0):
    xf = Xf(x, CO['z0'] - 0.8); xf.rbox(acc('white'), -1.0, 1.0, 0.42, 0.48, -0.2, 0.2, r=0.02, seg=2)
    for sx in (-0.8, 0.8): xf.rbox(acc('steel'), sx - 0.025, sx + 0.025, 0.0, 0.42, -0.18, 0.18, r=0.01, seg=1)
for (a_, b_, c_, d_) in ((CO['x1'], X1, CO['z0'] + 0.0, CO['z0'] + 0.03), (X1 - 0.03, X1, CO['z0'], Z1)):
    acc('fascia').box(a_, b_, 0.0, 1.1, c_ + 0.004, d_ - 0.004 if d_ - c_ > 0.1 else d_)   # 離牆 4 mm（原本貼在牆面上，疊面）

# ======================== 健身器材（BB-B 的 gym_b1_props.glb，照 layout 擺；GPU instancing）========================
eq_g = B.group('b1_equipment', root, {'kind': 'equipment'})
EQ = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/gym_b1_props.glb'); n_eq = 0
if os.path.exists(EQ):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=EQ); new = [o for o in bpy.data.objects if o not in before]
    protos = {}
    for o in new:
        if o.type == 'MESH' and o.parent is not None and o.parent.name.split('.')[0].startswith('GYM_'): protos.setdefault(o.parent.name.split('.')[0], []).append(o.data)
    for e in G['equipment']:
        for (x, z) in e['at']:
            for k, me in enumerate(protos.get(e['node'], [])): B.instance(me, f"{e['node']}_{n_eq}_{k}", x, 0.0, z, eq_g, ry=e['ry'])
            n_eq += 1
    for o in new: bpy.data.objects.remove(o)
# 大廳的服務櫃台、健身中心的置物櫃、體重計、毛巾回收籃（BB-B 的 gym_b1_entry.glb，GYM-P2；照 layout 的 entryProps）
EN = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/gym_b1_entry.glb'); n_en = 0
if os.path.exists(EN):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=EN); new = [o for o in bpy.data.objects if o not in before]
    protos = {}
    for o in new:
        top = o.parent
        while top is not None and not top.name.startswith('GYM2_'): top = top.parent
        if o.type == 'MESH' and top is not None: protos.setdefault(top.name.split('.')[0], []).append(o.data)
    for e in G['entryProps']:
        for (x, z) in e['at']:
            for k, me in enumerate(protos.get(e['node'], [])): B.instance(me, f"{e['node']}_{n_en}_{k}", x, 0.0, z, eq_g, ry=e['ry'])
            n_en += 1
    for o in new: bpy.data.objects.remove(o)

# ======================== 收尾 ========================
for k_, m in _acc.items(): m.finish(root, uv=True, smooth=(k_.startswith(P + 'rope') or k_ == P + 'steel'))
for side, ms in walls.items():
    for m in ms: m.name = f'WALL_{side}_{m.name}'; m.finish(root, uv=True, props={'dir': DIRS[side], **({'partition': 1} if side in PARTS else {})})
for name, mat, pts, uv, wall in IMGS:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = uv
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    nm = (f'WALL_{wall}_' if wall else '') + P + name
    me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = root
    if wall:
        ob['dir'] = DIRS[wall]
        if wall in PARTS: ob['partition'] = 1
for name, pts, props in PLATE:
    pm = Mesh(name, base['board']); pm.quad(pts); CL.uv01(pm.finish(root, uv=True, props=props))
for ob in list(root.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or (ob.parent is not None and ob.parent.name == 'b1_equipment'),
                    key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAY['version'], 'equipment': n_eq, 'entryProps': n_en})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(info, ensure_ascii=False))
