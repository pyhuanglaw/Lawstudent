"""新體育館（綜合體育館）第二階段：3F 主球場（BB_151；LAWWW2-B 2026-10-16）→ GLB。Blender 5.2：
  python3 tools/blender/env_second/gym_tex.py           （arena_floor.jpg、arena_screen.png、arena_banner.png）
  /opt/blenv/bin/python tools/blender/env_second/gym_arena.py [-- --out assets/models/env/second_ai/gym_arena.glb]
配置：src/data/gym_layout.js 的 arena（遊戲和這裡讀同一份）。座標＝gym_arena 區域座標（中心在原點、x 往東、z 往南、場地地板 y 0）。
- 場地 44×39 m（籃球＋排球的線）、東西南三面下層看台（12 排，走道是樓梯）、上層看台（4、5F，只有畫面）、北牆大螢幕、中央吊掛記分板、屋頂桁架和燈。
- 可開關的布置（平常藏起來）：SET_STAGE（舞台＋深藍布幕，共用）、SET_CEREMONY（畢業典禮）、SET_LECTURE（演講）、SET_CONCERT（演唱會）。
- 效能：下層看台的座位是低面數的實例（一個座位約 40 個三角形，GPU instancing）；上層看台離得遠，一排一條「座位帶」（貼圖畫出一張張椅子）。
「日系加一點寫實 不要很像積木」：舞台、講台、欄杆、座位都倒角；布幕是有皺褶的曲面；植物用模型葉子（plants.py）。
參考：BB_151 第 4b 節的公開資料（樓板、挑高、看台層數、用途）；沒有室內照片——看台排數、舞台、布置是一般體育館的做法。"""
import json, math, os, random, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
import plants as PL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None): return ARGS[ARGS.index(name) + 1] if name in ARGS else default
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/gym_layout.js')))"], cwd=L.ROOT))
A = LAY['arena']; SR = A['standRows']; UP = A['upper']; FL = A['floor']; HH = A['h']
OUT = os.path.join(L.ROOT, arg('--out', A['glb']))
GEN = os.path.join(HERE, 'textures', 'gen')
random.seed(23)
B.reset(texres=512)
root = B.group('gym_arena', props={'kind': 'gym_arena', 'layout': LAY['version']})
base = CL.materials()


def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0; return m


def soft_plaster(name, target, tile, k=0.35):
    """white_plaster_02 降低對比（只留 35% 的明暗）再校正到 target：大牆在這個尺度看得出一塊一塊的斑（BB-B）"""
    W_ = 512; src = bpy.data.images.load(os.path.join(HERE, 'textures', 'white_plaster_02', 'white_plaster_02_diff_1k.jpg'), check_existing=True)
    w, h = src.size; px = np.empty(w * h * 4, dtype=np.float32); src.pixels.foreach_get(px); px = px.reshape(-1, 4)
    mu = px[:, :3].mean(axis=0); px[:, :3] = mu + (px[:, :3] - mu) * k
    t = np.array([int(target.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32) ** 2.2
    px[:, :3] *= t / np.maximum(px[:, :3].mean(axis=0), 1e-4)
    im = bpy.data.images.new(name + '_soft', w, h, alpha=False); im.pixels.foreach_set(np.clip(px, 0, 1).ravel()); im.scale(W_, W_)
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.85
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = im; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); m['tile'] = tile
    return m


def seat_strip_mat():
    """上層看台的座位帶：一格＝一張椅子（藍色椅面、深色縫、椅背上緣亮一點）；u 每 1.0＝一張"""
    import numpy as np
    W, H = 64, 64; a = np.zeros((H, W, 3), np.float32) + np.array([0.035, 0.11, 0.33], np.float32)
    a[:, :5] *= 0.25; a[:, -5:] *= 0.25; a[:6] *= 1.6; a[30:34] *= 0.5
    im = bpy.data.images.new('arena_seatstrip', W, H, alpha=False); px = np.concatenate([a, np.ones((H, W, 1), np.float32)], 2); im.pixels.foreach_set(px.ravel())
    m = bpy.data.materials.new(P + 'seat_strip'); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = 0.5
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = im; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); m['tile'] = 1.0
    return m


P = 'arena_'
M = {
    'floor': img_mat(P + 'floor', 'arena_floor.jpg', rough=0.3),
    'slab': L.pbr(P + 'slab', 'concrete_floor_painted', tile=2.0, target='#7e7c78', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.8),
    'riser': L.pbr(P + 'riser', 'concrete_floor_painted', tile=1.6, target='#9a9894', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.8),
    'plaster': soft_plaster(P + 'plaster', '#d8d5ce', 6.0),   # v5：降對比、放大（v4 的大牆看得出一塊一塊的斑）
    'fascia': L.flat(P + 'fascia', '#23395e', rough=0.6), 'nosing': L.flat(P + 'nosing', '#e8b83a', rough=0.5),
    'steel': L.flat(P + 'steel', '#8a9096', rough=0.4, metal=0.45), 'steel_dk': L.flat(P + 'steel_dark', '#3a3e42', rough=0.45, metal=0.35),
    'roof': L.flat(P + 'roof', '#4c5156', rough=0.85, cull=True), 'glass': base['glass'],
    'seat': L.flat(P + 'seat', '#1f4c97', rough=0.45), 'seat_strip': seat_strip_mat(),
    'light': L.flat(P + 'light', '#ffffff', rough=0.3, emit=B.srgb('#f4f8ff')),
    'screen': img_mat(P + 'screen', 'arena_screen.png', rough=0.3, emit=1.2), 'score': img_mat(P + 'score', 'gym_score.png', rough=0.3, emit=0.8),
    'door': L.flat(P + 'door', '#3b4652', rough=0.5, metal=0.2),
    'stage': L.pbr(P + 'stage_deck', 'dark_planks', tile=1.2, target='#3a2e26', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'skirt': L.flat(P + 'stage_skirt', '#15161a', rough=0.95), 'drape': L.flat(P + 'drape_navy', '#1b2a4d', rough=0.95),
    'banner': img_mat(P + 'banner', 'arena_banner.png', rough=0.8), 'wood': L.pbr(P + 'wood', 'walnut_veneer', tile=0.9, target='#7a5232', normal=0.4, maps=('diff', 'nor'), res=256, rough_value=0.45),
    'chair': L.flat(P + 'folding_chair', '#3c4046', rough=0.5, metal=0.2), 'proj': L.flat(P + 'projection', '#f4f6f8', rough=0.6, emit=B.srgb('#d8e2ee')),
    'speaker': L.flat(P + 'speaker', '#202226', rough=0.55), 'grille': L.flat(P + 'speaker_grille', '#2c2e33', rough=0.9),
    'lens': L.flat(P + 'lens', '#fff3d6', rough=0.2, emit=B.srgb('#ffe9b8')), 'barrier': L.flat(P + 'barrier', '#9aa0a6', rough=0.4, metal=0.45),
    'flower_w': L.flat(P + 'flower_white', '#f4f1ea', rough=0.7), 'flower_y': L.flat(P + 'flower_yellow', '#f0c040', rough=0.7),
    'flower_g': L.flat(P + 'flower_leaf', '#3f6a3a', rough=0.6), 'pot': L.flat(P + 'pot', '#e4dccb', rough=0.4),
    'cloth': L.flat(P + 'table_cloth', '#f2efe8', rough=0.9), 'acoustic': L.flat(P + 'acoustic_panel', '#5d6168', rough=0.95),
}
PLM = PL.materials(P + 'pl_')


class Xf:
    """區域裡的一個座標系：local (x, y, z) → 區域 (px + x cos + z sin, y, pz − x sin + z cos)"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def M(self, x, y, z, extra=0.0): return Matrix.Translation(g2b(*self.p(x, y, z))) @ Matrix.Rotation(self.ry + extra, 4, 'Z')
    def box(self, m, x0, x1, y0, y1, z0, z1):
        """local 的方塊（轉到區域座標：八個角）"""
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co = Vector(((x0 + x1) / 2 + v.co.x * abs(x1 - x0), (y0 + y1) / 2 + v.co.z * abs(y1 - y0), (z0 + z1) / 2 + v.co.y * abs(z1 - z0)))
        for v in bm.verts: v.co = Vector(g2b(*self.p(v.co.x, v.co.y, v.co.z)))
        m.add_bm(bm); bm.free(); return m
    def rbox(self, m, x0, x1, y0, y1, z0, z1, r=0.02, seg=2):
        bm = L.rbox_bm(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), r, seg); m.add_bm(bm, self.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); bm.free(); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m
    def quad(self, m, pts): m.quad([self.p(*q) for q in pts]); return m


_acc = {}
def acc(key):
    mat = M[key]
    if mat.name not in _acc: _acc[mat.name] = Mesh(P + key, mat)
    return _acc[mat.name]


IMGS = []
def img_quad(name, mat, pts, uv=(0, 0, 1, 1), parent=None): IMGS.append((name, mat, pts, uv, parent))


def uv_strip(name, mat, quads, parent):
    """很多個有自己 UV 的四邊形（座位帶）：quads＝[(四點, (u0, v0, u1, v1))]"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    for pts, (u0, v0, u1, v1) in quads:
        f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts])
        for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; return ob


# ======================== 場地、牆、屋頂 ========================
img_quad('floor', M['floor'], [(FL['x0'], 0.0, FL['z1']), (FL['x1'], 0.0, FL['z1']), (FL['x1'], 0.0, FL['z0']), (FL['x0'], 0.0, FL['z0'])])
DEPTH = SR['rows'] * SR['tread']                                    # 下層看台的深度 10.2
UD = UP['rows'] * UP['tread']                                       # 上層看台的深度 8.0
U0L = UP['front'] - 22                                             # 上層看台前緣（離下層看台前緣）10.6
EX = 22 + U0L + UD + 0.3                                            # 東西外牆 x ±40.9
SZ = 17 + U0L + UD + 0.3                                            # 南外牆 z 35.9
NZ = FL['z0']                                                       # 北牆 z −22
for (a, b, c, d) in ((-EX, -22, NZ, 17), (22, EX, NZ, 17), (-EX, EX, 17, SZ)):   # 看台下面看得到的地（場地以外）
    acc('slab').quad([(a, -0.01, d), (b, -0.01, d), (b, -0.01, c), (a, -0.01, c)])
TOPH = UP['h0'] + UP['rows'] * UP['rise'] + 2.0                     # 上層看台頂 14.1
pl = acc('plaster')
pl.box(-EX, EX, 0.0, HH, NZ - 0.4, NZ)                              # 北牆（大螢幕那一面）
pl.box(-EX - 0.4, -EX, 0.0, HH, NZ, SZ); pl.box(EX, EX + 0.4, 0.0, HH, NZ, SZ); pl.box(-EX, EX, 0.0, HH, SZ, SZ + 0.4)
for x in (-EX + 0.2, EX - 0.2):                                     # 東西牆上方的一排高窗（看台頂以上；天光）
    for k in range(9):
        z0 = NZ + 2.0 + k * 6.4; z1 = z0 + 4.4
        if z1 > SZ - 1: break
        sgn = 1 if x < 0 else -1
        acc('steel_dk').box(min(x, x + sgn * 0.1), max(x, x + sgn * 0.1), TOPH + 1.0, TOPH + 1.08, z0, z1); acc('steel_dk').box(min(x, x + sgn * 0.1), max(x, x + sgn * 0.1), TOPH + 4.92, TOPH + 5.0, z0, z1)
        acc('light').quad([(x + sgn * 0.12, TOPH + 1.08, z1 if sgn > 0 else z0), (x + sgn * 0.12, TOPH + 1.08, z0 if sgn > 0 else z1), (x + sgn * 0.12, TOPH + 4.92, z0 if sgn > 0 else z1), (x + sgn * 0.12, TOPH + 4.92, z1 if sgn > 0 else z0)])
# 北牆：大螢幕（待機畫面）＋外框；下面一圈深藍的牆裙
acc('fascia').box(-EX, EX, 0.0, 2.4, NZ, NZ + 0.12)
acc('steel_dk').box(-9.3, 9.3, 9.2, 17.3, NZ, NZ + 0.35)
img_quad('screen', M['screen'], [(-9.0, 9.5, NZ + 0.36), (9.0, 9.5, NZ + 0.36), (9.0, 17.0, NZ + 0.36), (-9.0, 17.0, NZ + 0.36)])
CL.glow(root, 'screen', 0.0, 13.2, NZ + 1.2, color='rgba(120,170,255,1)', size=9.0, day=0.15, night=0.4)
for sx in (-1, 1):                                                  # v3：螢幕兩側的直幅布旗（深藍＋金色色帶；沒有字、沒有校徽）——北牆原本是一整片白牆
    for k in range(3):
        bx = sx * (12.0 + k * 3.4); top = 19.5; bot = 10.5 - k * 0.6
        acc('steel_dk').cyl((bx - 0.85, top + 0.05, NZ + 0.3), (bx + 0.85, top + 0.05, NZ + 0.3), 0.03, seg=6)
        acc('fascia').quad([(bx - 0.8, bot + 0.9, NZ + 0.32), (bx + 0.8, bot + 0.9, NZ + 0.32), (bx + 0.8, top, NZ + 0.32), (bx - 0.8, top, NZ + 0.32)])
        acc('nosing').quad([(bx - 0.8, bot + 0.45, NZ + 0.32), (bx + 0.8, bot + 0.45, NZ + 0.32), (bx + 0.8, bot + 0.9, NZ + 0.32), (bx - 0.8, bot + 0.9, NZ + 0.32)])
        acc('fascia').quad([(bx - 0.8, bot, NZ + 0.32), (bx, bot - 0.35, NZ + 0.32), (bx + 0.8, bot, NZ + 0.32), (bx + 0.8, bot + 0.45, NZ + 0.32), (bx - 0.8, bot + 0.45, NZ + 0.32)])
for k in range(12):                                                  # 北牆上半部的吸音板（深灰布面，一格 3×2.4 m）
    for j in range(2):
        x0_ = -EX + 3.0 + k * 6.6; y0_ = 18.6 + j * 2.6
        if abs(x0_ + 1.5) < 10.5 and j == 0: continue
        Xf(0, 0).rbox(acc('acoustic'), x0_, x0_ + 3.0, y0_, y0_ + 2.4, NZ, NZ + 0.08, r=0.02, seg=1)
# 屋頂：鋼桁架（每 6 m 一榀，跨 x）、屋頂板、LED 燈
rf = Mesh(P + 'roof_deck', M['roof']); rf.quad([(-EX, HH + 0.8, NZ), (EX, HH + 0.8, NZ), (EX, HH + 0.8, SZ), (-EX, HH + 0.8, SZ)]); rf.finish(root, uv=False)
st = acc('steel')
z = NZ + 3.0
while z < SZ - 1:
    st.cyl((-EX, HH - 1.8, z), (EX, HH - 1.8, z), 0.12, seg=8); st.cyl((-EX, HH + 0.6, z), (EX, HH + 0.6, z), 0.13, seg=8)
    for j in range(int(2 * EX / 3.0)):
        xa = -EX + j * 3.0; xb = xa + 3.0
        st.cyl((xa, HH - 1.8, z), (xb, HH + 0.6, z), 0.05, seg=5); st.cyl((xb, HH - 1.8, z), (xb, HH + 0.6, z), 0.045, seg=5)
    for x in range(-18, 19, 6):                                     # 場地上方的 LED 燈（燈罩＋發光面）
        if abs(z - (-2)) < 30:
            bm = L.lathe([(0.08, 0.5), (0.14, 0.45), (0.42, 0.06), (0.45, 0.0), (0.0, 0.0)], seg=14); acc('steel_dk').add_bm(bm, Matrix.Translation(g2b(x, HH - 2.6, z))); bm.free()
            acc('light').cyl((x, HH - 2.606, z), (x, HH - 2.602, z), 0.41, seg=14)   # 發光面在燈罩底面下面 2～6 mm（原本 1 mm，從場地看會閃）; acc('steel_dk').cyl((x, HH - 2.1, z), (x, HH - 1.8, z), 0.012, seg=4)
            CL.glow(root, 'led', x, HH - 3.0, z, color='rgba(245,250,255,1)', size=4.0, day=0.5, night=1.0)
    z += 6.0
# 中央吊掛的記分板（四面）
sb = Xf(0.0, -2.0)
sb.rbox(acc('steel_dk'), -2.6, 2.6, 13.2, 16.4, -2.6, 2.6, r=0.06, seg=2)
for k in range(4):
    xf = Xf(0.0, -2.0, k * math.pi / 2)
    img_quad(f'score_{k}', M['score'], [xf.p(-2.4, 13.5, 2.62), xf.p(2.4, 13.5, 2.62), xf.p(2.4, 16.1, 2.62), xf.p(-2.4, 16.1, 2.62)])
for (dx, dz) in ((-2.0, -2.0), (2.0, -2.0), (-2.0, 2.0), (2.0, 2.0)): acc('steel_dk').cyl((dx, 16.4, -2.0 + dz), (dx * 1.6, HH - 1.8, -2.0 + dz * 1.6), 0.02, seg=4)
# 籃架（吊掛式，收在上面——平常是活動場地，所以吊高；比賽時放下來）
for (hx, hz) in A['court']['hoops']:
    s = 1 if hz < 0 else -1; bz = hz - s * 0.375
    acc('glass').box(hx - 0.9, hx + 0.9, 17.6, 18.65, bz - 0.025, bz + 0.025); acc('steel').box(hx - 0.92, hx + 0.92, 17.56, 17.62, bz - 0.03, bz + 0.03)   # v2：收到大螢幕上面（v1 擋在螢幕前）
    for dx in (-0.6, 0.6): acc('steel').cyl((hx + dx, 18.65, bz - s * 0.05), (hx + dx * 1.3, HH - 1.8, bz - s * 0.05), 0.05, seg=8)

# ======================== 下層看台（3F）：東、西、南 ========================
seat_m = Mesh('arena_seat_proto', M['seat']); sx_ = Xf(0, 0)
sx_.rbox(seat_m, -0.22, 0.22, 0.40, 0.46, -0.20, 0.18, r=0.0, seg=1)            # 椅面（正面＋z；兩千多張，不倒角：一張 12 個三角形）
bm = L.rbox_bm(0.44, 0.40, 0.04, 0.0, 1); seat_m.add_bm(bm, Matrix.Translation(g2b(0, 0.66, -0.24)) @ Matrix.Rotation(0.18, 4, 'X')); bm.free()   # 椅背往後仰（薄板不倒角：一張 12 個三角形；兩千多張）
leg = Mesh('arena_seat_leg', M['steel_dk']); leg.box(-0.03, 0.03, 0.0, 0.42, -0.22, -0.14)
ob_s = seat_m.finish(None, uv=False); ob_l = leg.finish(None, uv=False)
SEAT = B.join([ob_s, ob_l], 'arena_seat') if hasattr(B, 'join') else None
if SEAT is None:
    bpy.ops.object.select_all(action='DESELECT'); ob_s.select_set(True); ob_l.select_set(True); bpy.context.view_layer.objects.active = ob_s; bpy.ops.object.join(); SEAT = ob_s
SEAT_ME = SEAT.data; bpy.data.objects.remove(SEAT)
seats_lower = B.group('arena_seats_lower', root)
nseat = 0
AW = A['aisles']['w']
DOOR_HW, DOOR_H = 1.05, 2.45                                         # 入口通道盡頭的門洞（半寬、高）


def stand(sd):
    """一面看台：local z＝離開場地的方向（0＝最前排前緣）、local x＝沿著看台；y＝高度"""
    global nseat
    side = sd['side']; t0, t1 = sd['along']
    if side == 'east': xf = Xf(sd['front'], 0.0, math.pi / 2)
    elif side == 'west': xf = Xf(sd['front'], 0.0, -math.pi / 2)
    else: xf = Xf(0.0, sd['front'], 0.0)
    if side == 'east': t0, t1 = -t1, -t0                               # local x＝−z（東）
    aisles = A['aisles'][side]
    al = [(-a if side == 'east' else a) for a in aisles]
    gap = sd.get('gap')
    def cut(a, b):                                                   # [a, b] 扣掉走道、入口通道
        segs = [(a, b)]
        for c in [(q - AW / 2, q + AW / 2) for q in al] + ([tuple(gap)] if gap else []):
            nxt = []
            for (u, v) in segs:
                if c[1] <= u or c[0] >= v: nxt.append((u, v)); continue
                if c[0] > u: nxt.append((u, c[0]))
                if c[1] < v: nxt.append((c[1], v))
            segs = nxt
        return segs
    T, R, H0 = SR['tread'], SR['rise'], SR['h0']
    for r in range(SR['rows']):
        y = H0 + r * R; z0, z1 = r * T, (r + 1) * T
        for (a, b) in cut(t0, t1):
            xf.box(acc('riser'), a, b, 0.0, y, z0, z1)                                     # 一排的實心量體（前面＝踢面，上面＝平台）
            xf.box(acc('nosing'), a, b, y - 0.03, y + 0.004, z0 - 0.003, z0 + 0.04)       # 階梯前緣的黃色止滑條（往外凸 3 mm：原本正面和踢面同一個平面，會閃）
            n = int((b - a - 0.1) / SR['seatPitch'])
            for k in range(n):
                sx = a + 0.05 + (k + 0.5) * (b - a - 0.1) / n
                px, _, pz = xf.p(sx, y, z0 + 0.5); B.instance(SEAT_ME, f'arena_seat_{nseat}', px, y, pz, seats_lower, ry=xf.ry + math.pi); nseat += 1
    for c in al:                                                     # 走道：每排兩階＋最前面一階、中間扶手
        a, b = c - AW / 2, c + AW / 2
        xf.box(acc('riser'), a, b, 0.0, H0 / 2, -0.42, 0.0)
        for r in range(SR['rows']):
            y = H0 + r * R; z0 = r * T
            xf.box(acc('riser'), a, b, 0.0, y - R / 2 if r else H0 * 0.75, z0, z0 + T / 2); xf.box(acc('riser'), a, b, 0.0, y, z0 + T / 2, z0 + T)
            xf.box(acc('nosing'), a, b, (y - R / 2 if r else H0 * 0.75) - 0.03, (y - R / 2 if r else H0 * 0.75) + 0.004, z0 - 0.003, z0 + 0.04)
        # 扶手（v6，ART-GYM2-INT 2026-10-21）：原本在走道正中間，遊戲裡人走在走道中線上，扶手從身體穿過去——移到走道邊（離中線 0.55 m，貼著那一排的端面），
        # 放在不能坐的那一側：可以坐的位子在遊戲的 +u 那一側（gym3d.js 的 s.at(c+AW/2+0.25, …)）＝東看台 local −x、西南看台 local +x，坐下時不會穿過扶手
        cr = c + (0.55 if side == 'east' else -0.55)
        ya, yb_, da, db = H0 / 2 + 0.9, H0 + (SR['rows'] - 1) * R + 0.9, -0.3, DEPTH - 0.3
        xf.cyl(acc('steel'), (cr, ya, da), (cr, yb_, db), 0.025, seg=8)
        for k in range(0, SR['rows'], 3):                            # 立柱站在走道那一階上（原本從平台的高度起，比走道的前半階高 21 cm、浮在空中），頂到扶手
            d = k * T + 0.3; ys = (H0 + k * R - R / 2) if k else H0 * 0.75
            xf.cyl(acc('steel'), (cr, ys, d), (cr, ya + (yb_ - ya) * (d - da) / (db - da), d), 0.02, seg=6)
        xf.box(acc('door'), a + 0.05, b - 0.05, H0 + (SR['rows'] - 1) * R, H0 + (SR['rows'] - 1) * R + 2.2, DEPTH - 0.02, DEPTH + 0.05)   # 走道頂端通往走廊的門（這一版關著）
    # 最前排的前牆：玻璃欄杆（走道口留開）
    for (a, b) in cut(t0, t1):
        xf.box(acc('fascia'), a, b, 0.0, H0, -0.15, 0.0)
        xf.box(acc('glass'), a, b, H0, H0 + 1.0, -0.06, -0.04); xf.box(acc('steel'), a, b, H0 + 0.98, H0 + 1.04, -0.08, -0.02)
    # 看台後牆（走廊在後面，這一版不做）＋上層看台（4、5F）；頂比上層看台前面的色帶低 1 cm（原本兩個頂面同一個平面）
    if side == 'south':                                              # v6：入口通道盡頭的門洞（回 1F 的樓梯門；門片、門框在下面入口通道那一段）
        for (a_, b_, y0_) in ((t0, -DOOR_HW, 0.0), (DOOR_HW, t1, 0.0), (-DOOR_HW, DOOR_HW, DOOR_H)): xf.box(acc('plaster'), a_, b_, y0_, UP['h0'] - 0.01, DEPTH, DEPTH + 0.3)
    else: xf.box(acc('plaster'), t0, t1, 0.0, UP['h0'] - 0.01, DEPTH, DEPTH + 0.3)
    U0 = U0L
    xf.box(acc('fascia'), t0, t1, UP['h0'] - 1.2, UP['h0'], U0 - 0.2, U0)                  # 上層看台前面的深藍色帶
    xf.box(acc('glass'), t0, t1, UP['h0'], UP['h0'] + 0.9, U0 - 0.12, U0 - 0.1)
    quads = []
    for r in range(UP['rows']):
        y = UP['h0'] + r * UP['rise']; z0, z1 = U0 + r * UP['tread'], U0 + (r + 1) * UP['tread']
        xf.box(acc('riser'), t0, t1, y - UP['rise'] - (1.2 if r == 0 else 0), y, z0, z1)
        n = (t1 - t0) / SR['seatPitch']                                 # 座位帶：椅面（斜）＋椅背（直），貼圖一格一張
        quads.append(([xf.p(t0, y + 0.42, z0 + 0.15), xf.p(t1, y + 0.42, z0 + 0.15), xf.p(t1, y + 0.46, z0 + 0.55), xf.p(t0, y + 0.46, z0 + 0.55)][::-1] if side == 'west' else [xf.p(t0, y + 0.42, z0 + 0.15), xf.p(t1, y + 0.42, z0 + 0.15), xf.p(t1, y + 0.46, z0 + 0.55), xf.p(t0, y + 0.46, z0 + 0.55)], (0, 0.0, n, 0.5)))
        quads.append(([xf.p(t0, y + 0.46, z0 + 0.6), xf.p(t1, y + 0.46, z0 + 0.6), xf.p(t1, y + 0.9, z0 + 0.66), xf.p(t0, y + 0.9, z0 + 0.66)], (0, 0.5, n, 1.0)))
    uv_strip(f'arena_upper_seats_{side}', M['seat_strip'], quads, root)
    # 看台兩端的側牆（封住階梯的斷面）
    prof = [(-0.15, 0.0), (-0.15, H0 + 1.0), (U0 - 0.2, UP['h0'] + 0.9), (U0 + UD, UP['h0'] + UP['rows'] * UP['rise'] + 0.9), (U0 + UD, 0.0)]   # v2：照看台的斜度收邊（v1 是整片 12 m 高的白牆，從場地看擋住看台）
    for t in (t0 - 0.005, t1 + 0.005):                               # 往外 5 mm：原本和每一排的端面同一個平面，會閃
        acc('plaster').quad([xf.p(t, y, u) for (u, y) in prof])
        for (ua, ya), (ub, yb) in zip(prof[1:3], prof[2:4]):                                # 斜邊上一條深藍收邊
            acc('fascia').quad([xf.p(t + (0.02 if t == t1 else -0.02), ya, ua), xf.p(t + (0.02 if t == t1 else -0.02), yb, ub), xf.p(t + (0.02 if t == t1 else -0.02), yb - 0.35, ub), xf.p(t + (0.02 if t == t1 else -0.02), ya - 0.35, ua)])


for sd in A['stands']: stand(sd)
# 南看台中間的入口通道（vomitory）：兩側牆、上方的橫樑、通道盡頭的門（回 1F 的樓梯）
V = A['vomitory']
VW = Mesh(P + 'vomitory_wall', L.flat(P + 'vomitory_wall', '#8e9196', rough=0.8))   # v5：側牆照看台的斜度收邊、素面灰漆（v4 是比座位高一大截的白牆，從場地看像隔板）
ztop = 17 + DEPTH; yb, yt = SR['h0'] + 1.0, SR['h0'] + (SR['rows'] - 1) * SR['rise'] + 1.6
for x in (V['x0'], V['x1']):
    xo = x - 0.25 if x < 0 else x + 0.25
    x = x + (0.005 if x < 0 else -0.005)                             # 通道內側的牆往通道裡 5 mm：原本和看台每一排的端面同一個平面，會閃
    for xx in (x, xo): VW.quad([(xx, 0.0, V['z0']), (xx, 0.0, ztop), (xx, yt, ztop), (xx, yb, V['z0'])])
    VW.quad([(x, yb, V['z0']), (x, yt, ztop), (xo, yt, ztop), (xo, yb, V['z0'])])                      # 斜的上緣
    VW.quad([(x, 0.0, V['z0']), (x, yb, V['z0']), (xo, yb, V['z0']), (xo, 0.0, V['z0'])])              # 正面
    acc('fascia').box(min(x, xo) - 0.02, max(x, xo) + 0.02, 0.0, 1.0, V['z0'], ztop)
VW.finish(root, uv=False)
acc('fascia').box(V['x0'] - 0.25, V['x1'] + 0.25, 2.8, 3.4, V['z0'] - 0.2, V['z0'] + 0.2)
EXIT_M = L.flat(P + 'exit_sign', '#2a9a4a', rough=0.4, emit=B.srgb('#3ccf6a'))   # 通道口上方的綠色出口燈（白色小人＝亮一點的方塊，不寫字）
Xf(0, 0).rbox(acc('steel_dk'), -0.42, 0.42, 3.42, 3.78, V['z0'] - 0.24, V['z0'] - 0.16, r=0.01, seg=1)
ex = Mesh(P + 'exit_face', EXIT_M); ex.box(-0.38, 0.38, 3.46, 3.74, V['z0'] - 0.26, V['z0'] - 0.24); ex.finish(root, uv=False)
exw = Mesh(P + 'exit_figure', M['light']); exw.box(-0.22, -0.08, 3.5, 3.7, V['z0'] - 0.265, V['z0'] - 0.26); exw.box(-0.02, 0.3, 3.57, 3.63, V['z0'] - 0.265, V['z0'] - 0.26); exw.finish(root, uv=False)
CL.glow(root, 'exit', 0.0, 3.6, V['z0'] - 0.5, color='rgba(80,230,120,1)', size=1.2, day=0.3, night=0.8)
# 通道盡頭（南看台後牆 z 27.2）：回 1F 的樓梯門（v6，ART-GYM2-INT 2026-10-21）——原本是一面素牆，遊戲裡通道走到 z 24.5 就被看不見的牆擋住（離畫面上的盡頭 2.7 m，D38 第 4 條）。
# 改成整條通道都能走，盡頭的後牆開門洞（stand() 南看台那一段）＋雙開門（門框、門片、推桿）＋門上的綠色出口燈。
# 原本這裡另外疊了一塊 2.8～7.6 m 的牆，和南看台後牆同一個面（疊面、頂面又和上層看台的色帶同高）：拿掉，後牆本來就蓋住
ZB = 17 + DEPTH
for (a_, b_, y0_, y1_) in ((-DOOR_HW, -0.97, 0.0, DOOR_H), (0.97, DOOR_HW, 0.0, DOOR_H), (-DOOR_HW, DOOR_HW, 2.37, DOOR_H)): acc('steel_dk').box(a_, b_, y0_, y1_, ZB - 0.03, ZB + 0.06)   # 門框（往通道凸 3 cm）
for (a_, b_) in ((-0.97, -0.005), (0.005, 0.97)):
    acc('door').box(a_, b_, 0.005, 2.37, ZB + 0.02, ZB + 0.06)                                   # 門片（凹進門框 2 cm）
    acc('steel').box(a_ + 0.1, b_ - 0.1, 0.98, 1.04, ZB - 0.04, ZB - 0.005)                       # 推桿
    for xb_ in (a_ + 0.12, b_ - 0.12): acc('steel').box(xb_ - 0.02, xb_ + 0.02, 0.96, 1.06, ZB - 0.005, ZB + 0.02)
    acc('steel').box(a_ + 0.05, b_ - 0.05, 0.03, 0.25, ZB + 0.015, ZB + 0.02)                      # 踢腳板
Xf(0, 0).rbox(acc('steel_dk'), -0.42, 0.42, 2.92, 3.28, ZB - 0.08, ZB, r=0.01, seg=1)
ex2 = Mesh(P + 'exit_face_back', EXIT_M); ex2.box(-0.38, 0.38, 2.96, 3.24, ZB - 0.1, ZB - 0.08); ex2.finish(root, uv=False)
exw2 = Mesh(P + 'exit_figure_back', M['light']); exw2.box(-0.22, -0.08, 3.0, 3.2, ZB - 0.105, ZB - 0.1); exw2.box(-0.02, 0.3, 3.07, 3.13, ZB - 0.105, ZB - 0.1); exw2.finish(root, uv=False)
CL.glow(root, 'exit_back', 0.0, 3.1, ZB - 0.35, color='rgba(80,230,120,1)', size=1.2, day=0.3, night=0.8)
acc('slab').quad([(V['x0'], 0.002, 17 + DEPTH), (V['x1'], 0.002, 17 + DEPTH), (V['x1'], 0.002, V['z0']), (V['x0'], 0.002, V['z0'])])
for k in range(3): CL.glow(root, 'vomitory', 0.0, 2.6, V['z0'] + 1.5 + k * 2.6, color='rgba(255,240,220,1)', size=1.6, day=0.3, night=0.8)

# ======================== 可開關的布置 ========================
S = A['sets']; sg_ = S['stage']
stg = B.group('SET_STAGE', root, {'set': 'stage'})
m_deck, m_skirt, m_drape, m_steel = Mesh('SET_STAGE_deck', M['stage']), Mesh('SET_STAGE_skirt', M['skirt']), Mesh('SET_STAGE_drape', M['drape']), Mesh('SET_STAGE_steel', M['steel_dk'])
x0, x1, z0, z1, h = sg_['x0'], sg_['x1'], sg_['z0'], sg_['z1'], sg_['h']
Xf(0, 0).rbox(m_deck, x0, x1, h - 0.06, h, z0, z1, r=0.02, seg=2)
m_skirt.box(x0, x1, 0.0, h - 0.06, z1 - 0.04, z1); m_skirt.box(x0, x0 + 0.04, 0.0, h - 0.06, z0, z1); m_skirt.box(x1 - 0.04, x1, 0.0, h - 0.06, z0, z1)
for sx in (-1, 1):                                                   # 兩側上台的樓梯（4 階）＋扶手
    xs = x1 if sx > 0 else x0
    for k in range(4):
        Xf(0, 0).rbox(m_deck, min(xs, xs + sx * (1.2 - k * 0.3)), max(xs, xs + sx * (1.2 - k * 0.3)), 0.0, (k + 1) * h / 4, z1 - 2.6, z1 - 1.2, r=0.015, seg=1)
    m_steel.cyl((xs + sx * 1.2, 0.9, z1 - 1.2), (xs, h + 0.9, z1 - 1.2), 0.02, seg=6)
nd = 60                                                             # 背板布幕：有皺褶的曲面（sin 波）
for j in range(nd):
    xa, xb = -12.0 + j * 24.0 / nd, -12.0 + (j + 1) * 24.0 / nd
    za, zb = z0 - 0.12 + 0.1 * math.sin(j * 1.3), z0 - 0.12 + 0.1 * math.sin((j + 1) * 1.3)   # v3：整片在北牆的深藍牆裙前面（v2 的皺褶凹進去，牆裙從縫裡透出來）
    m_drape.quad([(xa, h, za), (xb, h, zb), (xb, 9.2, zb), (xa, 9.2, za)])   # 上緣 9.2：大螢幕從 9.5 開始，不重疊
m_steel.box(-12.3, 12.3, 9.2, 9.45, z0 - 0.35, z0 - 0.23)
for x in (-12.2, 12.2): m_steel.box(x - 0.1, x + 0.1, 0.0, 9.45, z0 - 0.35, z0 - 0.23)
m_deck.finish(stg, uv=True); m_skirt.finish(stg, uv=False); m_drape.finish(stg, uv=False, smooth=True); m_steel.finish(stg, uv=False)


def folding_chair_mesh():
    ch = Mesh('arena_chair_proto', M['chair'])                                       # 一千多張：每張 48 個三角形（椅面、椅背、兩側的 X 形椅腳）
    ch.box(-0.22, 0.22, 0.44, 0.47, -0.2, 0.22); ch.box(-0.21, 0.21, 0.6, 0.86, -0.23, -0.2)
    for sx in (-0.2, 0.2): ch.box(sx - 0.012, sx + 0.012, 0.0, 0.86, -0.235, -0.215); ch.box(sx - 0.012, sx + 0.012, 0.0, 0.45, 0.17, 0.19)
    ob = ch.finish(None, uv=False); me = ob.data; bpy.data.objects.remove(ob); return me


CHAIR = folding_chair_mesh()


def chairs(group, spec, pre):
    """整片折疊椅（面向舞台：椅背在 +z，人面向 −z）"""
    n = 0; (xa, xb), (za, zb), (px, pz) = spec['x'], spec['z'], spec['pitch']
    z = za
    while z <= zb + 1e-6:
        x = xa
        while x <= xb + 1e-6:
            if not any(a <= x <= b for (a, b) in spec['aisles']): B.instance(CHAIR, f'{pre}_chair_{n}', x, 0.0, z, group, ry=math.pi); n += 1
            x += px
        z += pz
    return n


def lectern(m, x, z, h):
    xf = Xf(x, z); xf.rbox(m, -0.32, 0.32, h, h + 1.05, -0.24, 0.24, r=0.03, seg=2); xf.rbox(m, -0.38, 0.38, h + 1.05, h + 1.12, -0.32, 0.26, r=0.02, seg=2)


def flowers(meshes, x, y, z, w, d, n, seed):
    """花（白、黃的花球＋葉子）：一盆長長的花，放在講台前、舞台前緣"""
    rnd = random.Random(seed); mw, my, mg = meshes
    for i in range(n):
        px, pz = x + rnd.uniform(-w / 2, w / 2), z + rnd.uniform(-d / 2, d / 2); py = y + rnd.uniform(0.05, 0.28)
        (mw if rnd.random() < 0.6 else my).ell((px, py, pz), 0.07, 0.06, 0.07, seg=8, rings=5)
    for i in range(n // 2):
        px, pz = x + rnd.uniform(-w / 2, w / 2), z + rnd.uniform(-d / 2, d / 2); mg.ell((px, y + 0.05, pz), 0.12, 0.03, 0.06, seg=6, rings=3)


# 典禮
cer = B.group('SET_CEREMONY', root, {'set': 'ceremony'})
cw, cy_, cg, cwood, cpot = Mesh('SET_CEREMONY_flower_w', M['flower_w']), Mesh('SET_CEREMONY_flower_y', M['flower_y']), Mesh('SET_CEREMONY_leaf', M['flower_g']), Mesh('SET_CEREMONY_wood', M['wood']), Mesh('SET_CEREMONY_pot', M['pot'])
lectern(cwood, 3.6, -17.4, h); flowers((cw, cy_, cg), 3.6, h + 0.2, -16.95, 0.6, 0.15, 18, 7)
Xf(0, 0).rbox(cwood, -4.0, 1.6, h, h + 0.74, -19.6, -18.8, r=0.02, seg=2)   # 來賓桌
Mesh_cloth = Mesh('SET_CEREMONY_cloth', M['cloth']); Mesh_cloth.box(-4.05, 1.65, h + 0.74, h + 0.76, -19.65, -18.75); Mesh_cloth.box(-4.05, 1.65, h + 0.2, h + 0.74, -18.77, -18.75)
k_ = 0
for x in [-3.6 + i * 0.8 for i in range(7)]: B.instance(CHAIR, f'SET_CEREMONY_guest_{k_}', x, h, -20.2, cer, ry=0.0); k_ += 1   # 來賓面向觀眾（+z）
for x in (-9.0, -7.0, 7.0, 9.0):                                     # 舞台前緣的盆花
    bm = L.lathe([(0.14, 0.0), (0.18, 0.02), (0.22, 0.3), (0.2, 0.3)], seg=14); cpot.add_bm(bm, Matrix.Translation(g2b(x, h, z1 - 0.3))); bm.free()
    flowers((cw, cy_, cg), x, h + 0.32, z1 - 0.3, 0.4, 0.4, 14, int(x * 10) + 50)
for x in (-11.0, 11.0): PL.potted(B.mesh_obj, PLM, f'SET_CEREMONY_plant_{x:.0f}', cer, x, 0.45, z1 + 0.6, 0.26, seed=int(abs(x)) + 71, h=1.6)
for x in (-11.0, 11.0):
    bm = L.lathe([(0.2, 0.0), (0.24, 0.03), (0.28, 0.45), (0.26, 0.45)], seg=16); cpot.add_bm(bm, Matrix.Translation(g2b(x, 0.0, z1 + 0.6))); bm.free()
img_quad('SET_CEREMONY_banner', M['banner'], [(-8.0, 7.7, z0 + 0.01), (8.0, 7.7, z0 + 0.01), (8.0, 8.95, z0 + 0.01), (-8.0, 8.95, z0 + 0.01)], parent=cer)
for m_ in (cw, cy_, cg): m_.finish(cer, uv=False, smooth=True)
cwood.finish(cer, uv=True); Mesh_cloth.finish(cer, uv=False); cpot.finish(cer, uv=False, smooth=True)
n_cer = chairs(cer, S['ceremony']['chairs'], 'SET_CEREMONY')
# 學院分區的牌子（SET-CEREMONY-1023，AA_399 第 4 節；LAWWW2-B 10-23）：每一區最後一排後面一支、雙面（南面給從入口進來找位子的人看，北面給前一區回頭看）。
#   名字照 gym_layout.js 的 sets.ceremony.sections；字畫成 arena_sections.png（文泉驛正黑點陣圖，GLB 裡沒有字型）
SECS = S['ceremony'].get('sections', [])
if SECS:
    from PIL import Image as _Im, ImageDraw as _Dr, ImageFont as _Ft
    _F = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'; NCOL, CWp, CHp = 4, 256, 128; NROW = (len(SECS) + NCOL - 1) // NCOL
    im = _Im.new('RGB', (NCOL * CWp, 4 * CHp), (36, 48, 58)); dr = _Dr.Draw(im)
    for i, sec in enumerate(SECS):
        x0, y0 = (i % NCOL) * CWp, (i // NCOL) * CHp; t = sec['name']; fs = min(62, int(224 / max(1, len(t))))
        dr.rectangle([x0 + 5, y0 + 5, x0 + CWp - 6, y0 + CHp - 6], outline=(200, 170, 90) if sec.get('law') else (150, 160, 170), width=3)
        f = _Ft.truetype(_F, fs); w = dr.textlength(t, font=f); dr.text((x0 + (CWp - w) / 2, y0 + (CHp - fs) / 2 - 4), t, font=f, fill=(246, 244, 236))
    im.save(os.path.join(GEN, 'arena_sections.png'))
    msec = img_mat(P + 'sections', 'arena_sections.png', rough=0.6)
    post = Mesh('SET_CEREMONY_signposts', M['steel_dk']); quads = []
    for i, sec in enumerate(SECS):
        cx, zs = (sec['x0'] + sec['x1']) / 2, sec['z1'] + 0.5; u0, u1 = (i % NCOL) * CWp / im.width, (i % NCOL + 1) * CWp / im.width; v1 = 1 - (i // NCOL) * CHp / im.height; v0 = v1 - CHp / im.height
        post.cyl((cx, 0.0, zs), (cx, 1.86, zs), 0.022, seg=8); post.cyl((cx, 0.0, zs), (cx, 0.02, zs), 0.16, seg=12)
        post.box(cx - 0.52, cx + 0.52, 1.84, 2.38, zs - 0.012, zs + 0.012)                     # 牌子的框（兩面的字貼在框外 1 mm）
        quads.append(([(cx - 0.5, 1.86, zs + 0.013), (cx + 0.5, 1.86, zs + 0.013), (cx + 0.5, 2.36, zs + 0.013), (cx - 0.5, 2.36, zs + 0.013)], (u0, v0, u1, v1)))   # 朝南（+z）
        quads.append(([(cx + 0.5, 1.86, zs - 0.013), (cx - 0.5, 1.86, zs - 0.013), (cx - 0.5, 2.36, zs - 0.013), (cx + 0.5, 2.36, zs - 0.013)], (u0, v0, u1, v1)))   # 朝北（−z）
    post.finish(cer, uv=False); uv_strip('SET_CEREMONY_signs', msec, quads, cer)
for ob in list(cer.children):
    if ob.type == 'MESH' and ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)

# 演講
lec = B.group('SET_LECTURE', root, {'set': 'lecture'})
lwood = Mesh('SET_LECTURE_wood', M['wood']); lectern(lwood, 5.4, -17.4, h); lwood.finish(lec, uv=True)
lpr = Mesh('SET_LECTURE_screen', M['proj']); lpr.box(-6.0, 4.0, h + 2.0, h + 7.4, z0 + 0.02, z0 + 0.06); lpr.finish(lec, uv=False)
lfr = Mesh('SET_LECTURE_frame', M['steel_dk']); lfr.box(-6.1, 4.1, h + 1.9, h + 2.0, z0 + 0.01, z0 + 0.08); lfr.box(-6.1, 4.1, h + 7.4, h + 7.5, z0 + 0.01, z0 + 0.08); lfr.finish(lec, uv=False)
n_lec = chairs(lec, S['lecture']['chairs'], 'SET_LECTURE')

# 演唱會
con = B.group('SET_CONCERT', root, {'set': 'concert'})
tr, spk, grl, lens, bar = Mesh('SET_CONCERT_truss', M['steel']), Mesh('SET_CONCERT_speaker', M['speaker']), Mesh('SET_CONCERT_grille', M['grille']), Mesh('SET_CONCERT_lens', M['lens']), Mesh('SET_CONCERT_barrier', M['barrier'])


def truss(m, a, b, w=0.4):
    """方形桁架：四根主管＋每 1 m 一圈橫桿、斜桿"""
    a, b = Vector(a), Vector(b); d = b - a; Lg = d.length; dn = d.normalized()
    up = Vector((0, 1, 0)) if abs(dn.y) < 0.9 else Vector((1, 0, 0)); s1 = dn.cross(up).normalized() * (w / 2); s2 = dn.cross(s1).normalized() * (w / 2)
    cs = [s1 + s2, s1 - s2, -s1 - s2, -s1 + s2]
    for c in cs: m.cyl(tuple(a + c), tuple(b + c), 0.024, seg=6)
    n = max(1, int(Lg / 1.0))
    for k in range(n):
        p0 = a + dn * (Lg * k / n); p1 = a + dn * (Lg * (k + 1) / n)
        for i in range(4):
            m.cyl(tuple(p0 + cs[i]), tuple(p0 + cs[(i + 1) % 4]), 0.012, seg=4); m.cyl(tuple(p0 + cs[i]), tuple(p1 + cs[(i + 1) % 4]), 0.012, seg=4)


for x in (-11.0, 11.0): truss(tr, (x, 0.0, z1 - 1.0), (x, 11.5, z1 - 1.0))
truss(tr, (-11.0, 11.5, z1 - 1.0), (11.0, 11.5, z1 - 1.0)); truss(tr, (-11.0, 11.5, z0 + 0.6), (11.0, 11.5, z0 + 0.6))
for x in (-11.0, 11.0): truss(tr, (x, 11.5, z0 + 0.6), (x, 11.5, z1 - 1.0))
for k in range(10):                                                  # 搖頭燈（掛在前後兩支桁架下）
    x = -9.0 + k * 2.0
    for zz in (z1 - 1.0, z0 + 0.6):
        xf = Xf(x, zz); xf.rbox(spk, -0.18, 0.18, 10.75, 11.2, -0.14, 0.14, r=0.03, seg=1)
        bm = L.lathe([(0.0, 0.0), (0.12, 0.0), (0.14, 0.18), (0.0, 0.18)], seg=12); spk.add_bm(bm, Matrix.Translation(g2b(x, 10.45, zz))); bm.free()
        lens.cyl((x, 10.44, zz), (x, 10.45, zz), 0.11, seg=12)
for sx in (-1, 1):                                                   # 喇叭（左右各一串吊掛＋地上兩箱）
    x = sx * 13.2
    for k in range(6):
        y = 10.6 - k * 0.55; xf = Xf(x, z1 - 0.6, -sx * 0.25); xf.rbox(spk, -0.6, 0.6, y - 0.5, y, -0.4, 0.4, r=0.03, seg=1); xf.quad(grl, [(-0.56, y - 0.47, 0.41), (0.56, y - 0.47, 0.41), (0.56, y - 0.03, 0.41), (-0.56, y - 0.03, 0.41)])
    for k in range(2):
        xf = Xf(x, z1 + 0.6, -sx * 0.2); xf.rbox(spk, -0.55, 0.55, k * 0.75, k * 0.75 + 0.74, -0.45, 0.45, r=0.03, seg=1); xf.quad(grl, [(-0.5, k * 0.75 + 0.05, 0.46), (0.5, k * 0.75 + 0.05, 0.46), (0.5, k * 0.75 + 0.69, 0.46), (-0.5, k * 0.75 + 0.69, 0.46)])
bz = S['concert']['barrier']['z']; bx0, bx1 = S['concert']['barrier']['x']
x = bx0
while x < bx1 - 1e-6:                                                 # 鐵馬（每段 2 m：上下兩根管＋直條＋腳）
    xb_ = min(bx1, x + 2.0)
    for y in (0.1, 1.1): bar.cyl((x + 0.05, y, bz), (xb_ - 0.05, y, bz), 0.022, seg=6)
    for k in range(9): xx = x + 0.15 + k * 0.21; bar.cyl((xx, 0.1, bz), (xx, 1.1, bz), 0.01, seg=4)
    for xx in (x + 0.2, xb_ - 0.2): bar.cyl((xx, 0.0, bz - 0.3), (xx, 0.1, bz), 0.02, seg=4); bar.cyl((xx, 0.0, bz + 0.3), (xx, 0.1, bz), 0.02, seg=4)
    x = xb_
fo = S['concert']['foh']; xf = Xf(fo['x'], fo['z'])                  # 控台（帳篷＋桌子＋混音台）
xf.rbox(spk, -fo['w'] / 2, fo['w'] / 2, 0.0, 0.85, -0.5, 0.5, r=0.03, seg=1); xf.rbox(grl, -1.4, 1.4, 0.85, 0.95, -0.4, 0.3, r=0.02, seg=1)
for (dx, dz) in ((-fo['w'] / 2, -fo['d'] / 2), (fo['w'] / 2, -fo['d'] / 2), (-fo['w'] / 2, fo['d'] / 2), (fo['w'] / 2, fo['d'] / 2)): tr.cyl(xf.p(dx, 0.0, dz), xf.p(dx, 2.4, dz), 0.025, seg=6)
tent = Mesh('SET_CONCERT_tent', M['skirt']); tent.quad([xf.p(-fo['w'] / 2 - 0.1, 2.4, fo['d'] / 2 + 0.1), xf.p(fo['w'] / 2 + 0.1, 2.4, fo['d'] / 2 + 0.1), xf.p(fo['w'] / 2 + 0.1, 2.4, -fo['d'] / 2 - 0.1), xf.p(-fo['w'] / 2 - 0.1, 2.4, -fo['d'] / 2 - 0.1)])
tent.quad([xf.p(-fo['w'] / 2 - 0.1, 2.4, -fo['d'] / 2 - 0.1), xf.p(fo['w'] / 2 + 0.1, 2.4, -fo['d'] / 2 - 0.1), xf.p(fo['w'] / 2 + 0.1, 2.4, fo['d'] / 2 + 0.1), xf.p(-fo['w'] / 2 - 0.1, 2.4, fo['d'] / 2 + 0.1)])
for m_ in (tr, bar): m_.finish(con, uv=False, smooth=False)
for m_ in (spk, grl, lens, tent): m_.finish(con, uv=False)
for k in range(10): CL.glow(con, 'movinghead', -9.0 + k * 2.0, 10.2, z1 - 1.0, color='rgba(255,236,200,1)', size=1.6, day=0.4, night=1.0)

# ======================== 收尾 ========================
for k_, m in _acc.items(): m.finish(root, uv=True, smooth=False)
for name, mat, pts, uv, parent in IMGS:
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap'); f = bm.faces.new([bm.verts.new(g2b(*q)) for q in pts]); u0, v0, u1, v1 = uv
    for lp, t in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = t
    nm = name if name.startswith('SET_') else P + name; me = bpy.data.meshes.new(nm); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(nm, me); B.scene().collection.objects.link(ob); ob.parent = parent or root
L.merge_by_material(root, keep=lambda ob: 'SET_' in ob.name or (ob.parent is not None and 'SET_' in ob.parent.name) or 'seat' in ob.name or (ob.parent is not None and 'seats' in ob.parent.name))
info = L.export(OUT, gpu_instances=True)
info.update({'layout': LAY['version'], 'seats_lower': nseat, 'ceremony_chairs': n_cer, 'lecture_chairs': n_lec})
L.write_json(OUT[:-4] + '.json', info)
print(json.dumps(info, ensure_ascii=False))
