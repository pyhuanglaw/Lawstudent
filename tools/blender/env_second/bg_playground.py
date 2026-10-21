"""2D 背景：老國小的操場（ART-BG-AA185 第 2 張；AA_185 3-5 A32、AA_143 2-4：大二春假 2027 清明連假，麵店團小旅行第一站——沛珊選的老國小；
「教室都鎖著」「阿哲坐在溜滑梯上」「走一次小朋友每天走的那條路」）。不寫校名（AA_143）。畫面上沒有人（人物是 ADV 立繪）。
LAWWW2-C 2026-10-17。Blender 5.2（bpy，無介面）＋Cycles（CPU），做法照 bg_scooter_shop.py（場景直接用 bpy 蓋，不輸出 GLB）。
台灣鄉下老國小的辨識點：兩層樓的長條教室（一排教室＋前面的走廊、走廊的柱子、二樓走廊的矮牆、綠色窗框、乳白／淺黃的二丁掛磁磚）、
司令台（有頂、前面兩級台階）＋旗桿、褪色的紅色跑道＋草地操場、單槓、溜滑梯（BB-B 的遊樂設施 park_play_props.glb）、
操場邊的大榕樹、樟樹、校舍後面是山。
座標＝遊戲座標（x 往右、y 往上、z 往鏡頭），g2b 轉成 Blender。
  /opt/blenv/bin/python tools/blender/env_second/bg_playground.py -- <輸出.png> [--res 1920x1080] [--samples 64] [--exposure 0] [--eye x,y,z --look x,y,z] [--lens 24]
  之後：python3 tools/blender/env_second/bg_paint.py <輸出.png> assets/bg/old_school_playground.webp"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default): return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '64'))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..')); ENV2 = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai')
rng = random.Random(2027)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 24

M = {'grass': L.pbr('pg_grass', 'grass_ground', tile=4.0, target='#6f8a4a', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
     'dirt': L.pbr('pg_dirt', 'withered_grass', tile=3.0, target='#9a8a68', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
     'tile': L.pbr('pg_tile', 'rectangular_facade_tiles', tile=1.0, target='#e3d8bd', normal=0.4, maps=('diff', 'nor'), rough_value=0.55),   # 乳白二丁掛
     'tile_lo': L.pbr('pg_tile_lo', 'rectangular_facade_tiles', tile=1.0, target='#9d8f7c', normal=0.4, maps=('diff', 'nor'), rough_value=0.55),  # 腰牆深一點
     'terrazzo': L.pbr('pg_terrazzo', 'terrazzo_tiles', tile=1.2, target='#a39d91', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
     'conc': L.pbr('pg_conc', 'concrete_wall_006', tile=2.0, target='#b5b2aa', normal=0.3, maps=('diff', 'nor'), rough_value=0.9),
     'plaster': L.pbr('pg_plaster', 'plaster_grey_04', tile=1.5, target='#d8d2c2', normal=0.3, maps=('diff', 'nor'), rough_value=0.9),
     'track': L.flat('pg_track', '#a24a3c', rough=0.9), 'line': L.flat('pg_line', '#ece8de', rough=0.8),
     'frame': L.flat('pg_frame', '#3f7a5a', rough=0.5), 'glass': L.flat('pg_glass', '#4f5e66', rough=0.08, metal=0.2),
     'curtain': L.flat('pg_curtain', '#d9c99a', rough=0.9), 'door': L.flat('pg_door', '#6c8a6e', rough=0.5),
     'steel': L.flat('pg_steel', '#c43a2e', rough=0.45, metal=0.2), 'pole': L.flat('pg_pole', '#d8d8d4', rough=0.35, metal=0.4),
     'flag': L.flat('pg_flag', '#d8d8d4', rough=0.4), 'roof': L.flat('pg_roof', '#8a8478', rough=0.85),
     'mtn_near': L.flat('pg_mtn1', '#5f7f56', rough=1.0), 'mtn_mid': L.flat('pg_mtn2', '#7f9a86', rough=1.0), 'mtn_far': L.flat('pg_mtn3', '#a9bcc4', rough=1.0), 'wall': L.flat('pg_wall', '#e8e2d2', rough=0.85)}

# ---------------- 地面：草地操場、紅跑道（直道＋彎道）、校舍前的水泥地 ----------------
m = Mesh('ground', M['grass']); m.box(-120, 120, -0.05, 0.0, -140, 60); m.finish()
m = Mesh('apron', M['terrazzo']); m.box(-46, 16, 0.0, 0.03, -33.5, -27.5); m.finish()                  # 走廊前的水泥／磨石子地
TRK = dict(cx=-6.0, cz=-10.0, half=22.0, r_in=10.5, w=4.4)                                           # 跑道：直道沿 x、兩頭半圓


def track_mesh():
    bm = bmesh.new(); pts_in, pts_out = [], []
    def ring(r):
        P = []
        for i in range(25): t = -math.pi / 2 + math.pi * i / 24; P.append((TRK['cx'] + TRK['half'] + r * math.cos(t), TRK['cz'] + r * math.sin(t)))
        for i in range(25): t = math.pi / 2 + math.pi * i / 24; P.append((TRK['cx'] - TRK['half'] + r * math.cos(t), TRK['cz'] + r * math.sin(t)))
        return P
    a = ring(TRK['r_in']); b = ring(TRK['r_in'] + TRK['w']); n = len(a)
    va = [bm.verts.new(g2b(x, 0.012, z)) for x, z in a]; vb = [bm.verts.new(g2b(x, 0.012, z)) for x, z in b]
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((va[i], vb[i], vb[j], va[j]))
    me = bpy.data.meshes.new('track'); bm.to_mesh(me); bm.free(); me.materials.append(M['track'])
    ob = bpy.data.objects.new('track', me); sc.collection.objects.link(ob)
    lm = Mesh('lanes', M['line'])
    for k in range(5):
        P = ring(TRK['r_in'] + k * TRK['w'] / 4)
        for i in range(len(P)):
            (x0, z0), (x1, z1) = P[i], P[(i + 1) % len(P)]
            dx, dz = x1 - x0, z1 - z0; L_ = math.hypot(dx, dz); nx, nz = -dz / L_ * 0.025, dx / L_ * 0.025
            lm.quad([(x0 - nx, 0.016, z0 - nz), (x0 + nx, 0.016, z0 + nz), (x1 + nx, 0.016, z1 + nz), (x1 - nx, 0.016, z1 - nz)])
    lm.finish(uv=False)


track_mesh()

# ---------------- 校舍：兩層、長條（x −46～16）、前面走廊 2.6 m、柱距 3.6 m、二樓走廊矮牆＋綠色欄杆 ----------------
BX0, BX1, BZ = -46.0, 16.0, -34.0          # BZ＝走廊外緣（朝操場）；教室在 BZ−2.6 以後
FH = 3.6
m = Mesh('bldg_wall', M['wall'])
m.box(BX0, BX1, 0, 2 * FH + 0.9, BZ - 9.6, BZ - 2.6)                                           # 教室量體（後面）
m.finish()
m = Mesh('bldg_slabs', M['plaster'])
for y in (FH - 0.18, 2 * FH - 0.18): m.box(BX0, BX1, y, y + 0.18 + 0.12, BZ - 2.6, BZ)       # 樓板（走廊的天花板）
m.box(BX0 - 0.2, BX1 + 0.2, 2 * FH + 0.6, 2 * FH + 1.1, BZ - 9.8, BZ + 0.2)                     # 屋頂的女兒牆
m.finish()
m = Mesh('bldg_cols', M['tile'])
x = BX0
while x <= BX1 + 0.01:
    m.box(x - 0.22, x + 0.22, 0, 2 * FH + 0.6, BZ - 0.45, BZ + 0.03)   # 柱子比樓板、矮牆凸出 3 cm（原本正面同一個平面，交叉的地方算出黑色方塊）
    x += 3.6
m.finish()
m = Mesh('bldg_parapet', M['tile']); m.box(BX0, BX1, FH + 0.12, FH + 0.62, BZ - 0.18, BZ); m.box(BX0, BX1, 2 * FH + 0.12, 2 * FH + 0.35, BZ - 0.18, BZ); m.finish()
m = Mesh('bldg_rail', M['frame'])                                                                 # 二樓矮牆上的綠色欄杆
for x in np.arange(BX0 + 0.2, BX1, 0.18): m.box(x, x + 0.025, FH + 0.62, FH + 1.05, BZ - 0.1, BZ - 0.075)
m.box(BX0, BX1, FH + 1.03, FH + 1.08, BZ - 0.12, BZ - 0.06); m.finish()
m = Mesh('bldg_dado', M['tile_lo'])                                                               # 教室外牆的腰牆
for y0 in (0.0, FH): m.box(BX0, BX1, y0, y0 + 0.95, BZ - 2.62, BZ - 2.58)
m.finish()
# 教室的窗（綠色窗框、玻璃、裡面的窗簾半拉）、門（每間教室兩個門）
mf = Mesh('win_frame', M['frame']); mg = Mesh('win_glass', M['glass']); mc = Mesh('win_curtain', M['curtain']); md = Mesh('doors', M['door'])
for floor in range(2):
    y0 = floor * FH
    for room in range(int((BX1 - BX0) / 7.2)):
        rx0 = BX0 + room * 7.2
        for dx in (0.3, 6.1):                                                                     # 前後兩扇門
            md.box(rx0 + dx, rx0 + dx + 0.85, y0 + 0.02, y0 + 2.2, BZ - 2.62, BZ - 2.56)
        for k in range(4):
            wx = rx0 + 1.35 + k * 1.2
            mg.box(wx, wx + 1.1, y0 + 0.95, y0 + 2.75, BZ - 2.61, BZ - 2.6)
            mf.box(wx - 0.03, wx + 1.13, y0 + 0.93, y0 + 0.97, BZ - 2.6, BZ - 2.55); mf.box(wx - 0.03, wx + 1.13, y0 + 2.73, y0 + 2.77, BZ - 2.6, BZ - 2.55)
            mf.box(wx - 0.03, wx + 0.01, y0 + 0.95, y0 + 2.75, BZ - 2.6, BZ - 2.55); mf.box(wx + 0.53, wx + 0.57, y0 + 0.95, y0 + 2.75, BZ - 2.6, BZ - 2.55)
            mf.box(wx - 0.03, wx + 1.13, y0 + 2.1, y0 + 2.13, BZ - 2.6, BZ - 2.55)
            if rng.random() < 0.6: mc.box(wx + 0.05, wx + rng.uniform(0.3, 1.0), y0 + 1.3, y0 + 2.7, BZ - 2.64, BZ - 2.63)
for ob_ in (mf, mg, mc, md): ob_.finish()
m = Mesh('class_plates', M['line'])                                                               # 每間教室門口的班級牌（白底，字不畫：遠景）
for floor in range(2):
    for room in range(int((BX1 - BX0) / 7.2)):
        x0_ = BX0 + room * 7.2 + 1.2; m.box(x0_, x0_ + 0.5, floor * FH + 2.4, floor * FH + 2.62, BZ - 2.56, BZ - 2.52)
m.finish()
# 樓梯間（右端，突出、高一點）＋屋頂水塔
m = Mesh('stair_tower', M['tile']); m.box(BX1, BX1 + 4.2, 0, 2 * FH + 2.4, BZ - 7.0, BZ + 0.6); m.finish()
m = Mesh('stair_win', M['glass'])
for k in range(4): m.box(BX1 + 1.2, BX1 + 3.0, 1.2 + k * 1.75, 2.2 + k * 1.75, BZ + 0.6, BZ + 0.62)
m.finish()
m = Mesh('tank', M['pole']); m.cyl((BX0 + 12, 2 * FH + 1.1, BZ - 6), (BX0 + 12, 2 * FH + 2.6, BZ - 6), 0.9, seg=20); m.finish()
# ---------------- 司令台（有頂、兩級台階）＋旗桿 ----------------
SX, SZ = 6.0, -27.0
m = Mesh('stage', M['tile_lo']); m.box(SX - 4, SX + 4, 0, 1.2, SZ - 3, SZ); m.finish()
m = Mesh('stage_steps', M['conc']); m.box(SX - 3, SX + 3, 0, 0.4, SZ, SZ + 0.45); m.box(SX - 3, SX + 3, 0, 0.8, SZ, SZ + 0.15); m.finish()
m = Mesh('stage_top', M['terrazzo']); m.box(SX - 4, SX + 4, 1.2, 1.25, SZ - 3, SZ); m.finish()
m = Mesh('stage_roof', M['plaster']); m.box(SX - 4.4, SX + 4.4, 4.4, 4.75, SZ - 3.4, SZ + 0.5)
for cx in (SX - 3.7, SX + 3.7):
    m.box(cx - 0.18, cx + 0.18, 1.25, 4.4, SZ - 2.9, SZ - 2.55); m.box(cx - 0.18, cx + 0.18, 1.25, 4.4, SZ - 0.35, SZ)
m.finish()
m = Mesh('stage_back', M['wall']); m.box(SX - 4, SX + 4, 1.25, 4.4, SZ - 3.0, SZ - 2.85); m.finish()
m = Mesh('flagpole', M['pole'])
for k, fx in enumerate((SX - 6.5, SX - 7.4, SX - 5.6)): m.cyl((fx, 0, SZ - 1.0), (fx, 9.5 if k == 0 else 7.5, SZ - 1.0), 0.06, seg=12, r2=0.04)
m.box(SX - 8.0, SX - 5.0, 0, 0.35, SZ - 1.8, SZ - 0.2); m.finish()
# ---------------- 單槓（三高三低）、遊樂設施 ----------------
m = Mesh('bars', M['steel'])
for k, h in enumerate((1.0, 1.25, 1.5, 1.75)):
    x0_ = -26.0 + k * 1.6; m.cyl((x0_, 0, -24.5), (x0_, h + 0.05, -24.5), 0.04, seg=10); m.cyl((x0_ + 1.6, 0, -24.5), (x0_ + 1.6, h + 0.05, -24.5), 0.04, seg=10)
    m.cyl((x0_, h, -24.5), (x0_ + 1.6, h, -24.5), 0.025, seg=10)
m.finish()
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(ENV2, 'bb_support', 'park_play_props.glb'))
play = {o.name.split('.')[0]: o for o in bpy.data.objects if o not in before}
print('play props', sorted(play))


def put(name, x, z, yaw, s=1.0):
    o = play.get(name)
    if o is None: return
    while o.parent is not None and o.parent.name.split('.')[0] != 'park_play_props': o = o.parent
    o.location = g2b(x, 0.0, z); o.rotation_euler = (0, 0, yaw); o.scale = (s, s, s)


for nm in list(play):
    if nm not in ('PARK_SLIDE', 'PARK_SPRING_A', 'PARK_SPRING_B', 'PARK_SANDBOX', 'park_play_props'): continue
root = play.get('park_play_props')
if root is not None: root.location = (0, 0, 0)
put('PARK_SLIDE', 5.5, -9.5, math.radians(-150), 1.15)
put('PARK_SPRING_A', 9.0, -12.0, math.radians(-35)); put('PARK_SPRING_B', 10.2, -11.0, math.radians(-60)); put('PARK_SANDBOX', 9.6, -7.6, math.radians(10))
# ---------------- 樹（street_trees.glb：榕樹、樟樹、椰子）、遠山、圍牆 ----------------
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ENV2, 'street_trees.glb'))
TL = {}
for o in bpy.data.objects:
    if o not in before:
        TL[o.name.split('.')[0]] = o; o.hide_render = True; o.hide_viewport = True
print('trees', sorted(k for k in TL if k.startswith('tree_')))


def tree(key, x, z, s=1.0, yaw=0.0):
    src = TL.get(key)
    if src is None: return
    root = bpy.data.objects.new(key + '_i', None); sc.collection.objects.link(root); root.location = g2b(x, 0, z); root.rotation_euler = (0, 0, yaw); root.scale = (s, s, s)
    def dup(o, parent):
        c = o.copy(); sc.collection.objects.link(c); c.hide_render = False; c.hide_viewport = False; c.parent = parent
        c.matrix_parent_inverse.identity(); c.location = o.location if o is not src else (0, 0, 0)
        if o is src: c.rotation_euler = (0, 0, 0); c.rotation_quaternion = (1, 0, 0, 0); c.scale = (1, 1, 1)
        for ch in o.children: dup(ch, c)
    dup(src, root)


tree('tree_banyan_a', 13.5, -14.0, 1.25, 0.6)                   # 溜滑梯旁的大榕樹
tree('tree_banyan_a', -34.0, -23.0, 1.1, 2.1)
for k, x in enumerate(np.arange(-44, -8, 7.5)): tree('tree_camphor_a' if k % 2 else 'tree_camphor_b', x + rng.uniform(-1, 1), 9.0 + rng.uniform(-1, 1), rng.uniform(0.9, 1.1), rng.uniform(0, 6))   # 鏡頭後面那一排（影子）
for x in (-40.0, -26.0, 20.0): tree('tree_palm_a', x, -36.5, 0.9, rng.uniform(0, 6))
for k, z in enumerate(np.arange(-30, 10, 8.0)): tree('tree_camphor_b' if k % 2 else 'tree_camphor_a', 30.0 + rng.uniform(-1, 1), z, rng.uniform(0.95, 1.15), rng.uniform(0, 6))
m = Mesh('school_wall', M['plaster']); m.box(-60, 60, 0, 1.6, -48, -47.7); m.box(28.0, 28.3, 0, 1.6, -48, 30); m.finish()


def hills(name, mat, z, base, amp, seed, x0=-260, x1=260, n=80, depth=6.0):
    r_ = random.Random(seed); bm = bmesh.new(); xs = np.linspace(x0, x1, n)
    ph = [r_.uniform(0, 6) for _ in range(4)]
    def h(x): return base + amp * (0.55 * math.sin(x / 70 + ph[0]) + 0.3 * math.sin(x / 31 + ph[1]) + 0.12 * math.sin(x / 13 + ph[2]) + 0.7)   # 第二版：緩一點（第一版有尖峰、像一棟灰藍色的大樓）
    top = [bm.verts.new(g2b(x, h(x), z)) for x in xs]; bot = [bm.verts.new(g2b(x, -1, z)) for x in xs]
    top2 = [bm.verts.new(g2b(x, h(x) * 0.96, z - depth)) for x in xs]
    for i in range(n - 1):
        bm.faces.new((bot[i], bot[i + 1], top[i + 1], top[i])); bm.faces.new((top[i], top[i + 1], top2[i + 1], top2[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob


hills('hills_near', M['mtn_near'], -130, 14, 16, 3, n=140)
hills('hills_mid', M['mtn_mid'], -200, 26, 24, 5, n=140)
hills('hills_far', M['mtn_far'], -300, 40, 38, 7, x0=-420, x1=420, n=160)   # 第三版：高一點（第二版被校舍擋住、看不到山）


def tex_cloud(path, seed, W_=512, H_=256):
    from PIL import Image as PI
    r_ = np.random.default_rng(seed); a = np.zeros((H_, W_))
    for k, sz in enumerate((4, 8, 16, 32, 64)):
        g = r_.random((H_ // (256 // sz) + 2, W_ // (256 // sz) + 2)); g = np.asarray(PI.fromarray((g * 255).astype(np.uint8)).resize((W_, H_), PI.BICUBIC), float) / 255
        a += g / (1.6 ** k)
    a = (a - a.min()) / (a.max() - a.min())
    yy, xx = np.mgrid[0:H_, 0:W_]; env = np.exp(-(((xx - W_ / 2) / (W_ * 0.36)) ** 2 + ((yy - H_ * 0.58) / (H_ * 0.30)) ** 2))
    al = np.clip((a * env - 0.18) * 3.0, 0, 1)
    rgb = np.stack([0.98 - 0.22 * (yy / H_) ** 1.5, 0.98 - 0.20 * (yy / H_) ** 1.5, 0.99 - 0.14 * (yy / H_) ** 1.5], -1)   # 下緣灰一點（雲的陰影面）
    PI.fromarray((np.concatenate([rgb, al[..., None]], -1) * 255).astype(np.uint8), 'RGBA').save(path)


def billboard(name, path, x, y, z, w, h, emit=0.6):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt_ = mt.node_tree; b_ = nt_.nodes['Principled BSDF']
    tx = nt_.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt_.links.new(tx.outputs['Color'], b_.inputs['Base Color']); nt_.links.new(tx.outputs['Alpha'], b_.inputs['Alpha'])
    nt_.links.new(tx.outputs['Color'], b_.inputs['Emission Color']); b_.inputs['Emission Strength'].default_value = emit; b_.inputs['Roughness'].default_value = 1.0
    try: mt.surface_render_method = 'BLENDED'
    except Exception: pass
    bm_ = bmesh.new(); vs = [bm_.verts.new(g2b(*p)) for p in ((x - w / 2, y - h / 2, z), (x + w / 2, y - h / 2, z), (x + w / 2, y + h / 2, z), (x - w / 2, y + h / 2, z))]; f = bm_.faces.new(vs)
    uv = bm_.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = t
    me_ = bpy.data.meshes.new(name); bm_.to_mesh(me_); bm_.free(); me_.materials.append(mt)
    ob_ = bpy.data.objects.new(name, me_); sc.collection.objects.link(ob_); ob_.visible_shadow = False; return ob_


TMPC = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_play_tex'); os.makedirs(TMPC, exist_ok=True)
for k, (x, y, z, w_, h_) in enumerate(((-260, 150, -560, 300, 110), (60, 185, -600, 260, 90), (330, 140, -540, 280, 100), (-60, 110, -520, 200, 60))):
    pth = os.path.join(TMPC, 'cloud%d.png' % k); tex_cloud(pth, 30 + k); billboard('cloud%d' % k, pth, x, y, z, w_, h_)


def tex_streak(path, seed, W_=512, H_=256):
    from PIL import Image as PI
    r_ = np.random.default_rng(seed); al = np.zeros((H_, W_))
    for _ in range(26):
        x = r_.uniform(0, W_); w = r_.uniform(4, 22); L_ = r_.uniform(0.3, 1.0) * H_; k = r_.uniform(0.25, 0.7)
        xx = np.arange(W_)[None, :]; yy = np.arange(H_)[:, None]
        al = np.maximum(al, k * np.exp(-((xx - x) / w) ** 2) * np.clip(1 - yy / L_, 0, 1) ** 1.3)
    al = np.maximum(al, 0.35 * np.clip(1 - np.arange(H_)[:, None] / (0.12 * H_), 0, 1) * np.ones((1, W_)))
    rgb = np.ones((H_, W_, 3)) * np.array([0.30, 0.28, 0.24])
    PI.fromarray((np.concatenate([rgb, al[..., None]], -1) * 255).astype(np.uint8), 'RGBA').save(path)


pth = os.path.join(TMPC, 'streak.png'); tex_streak(pth, 9)
smt = bpy.data.materials.new('pg_streak'); smt.use_nodes = True; snt = smt.node_tree; sb_ = snt.nodes['Principled BSDF']
stx = snt.nodes.new('ShaderNodeTexImage'); stx.image = bpy.data.images.load(pth); snt.links.new(stx.outputs['Color'], sb_.inputs['Base Color']); snt.links.new(stx.outputs['Alpha'], sb_.inputs['Alpha']); sb_.inputs['Roughness'].default_value = 0.9
for y_top, hh in ((FH + 0.62, 0.80), (2 * FH + 0.35, 0.53)):          # 二樓矮牆＋樓板、屋頂矮牆＋樓板（實心的部分）：雨水流下來的黑色水痕（第三版：第一、二版校舍太新）
    x = BX0
    while x < BX1:
        w_ = rng.uniform(5.0, 9.0); x1_ = min(BX1, x + w_)
        bm_ = bmesh.new(); vs = [bm_.verts.new(g2b(*p)) for p in ((x, y_top - hh, BZ + 0.004), (x1_, y_top - hh, BZ + 0.004), (x1_, y_top, BZ + 0.004), (x, y_top, BZ + 0.004))]; f = bm_.faces.new(vs)
        uv = bm_.loops.layers.uv.new(); u0_ = rng.random() * 0.5
        for lp, t in zip(f.loops, ((u0_, 0), (u0_ + 0.5, 0), (u0_ + 0.5, 1), (u0_, 1))): lp[uv].uv = t
        me_ = bpy.data.meshes.new('streak'); bm_.to_mesh(me_); bm_.free(); me_.materials.append(smt)
        ob_ = bpy.data.objects.new('streak', me_); sc.collection.objects.link(ob_)
        x = x1_ + rng.uniform(0.5, 3.0)

# ---------------- 光：春天上午（太陽在右前方、偏高）、天空 ----------------
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
for t in ('NISHITA', 'MULTIPLE_SCATTERING', 'SINGLE_SCATTERING'):
    try: sky.sky_type = t; break
    except Exception: continue
try: sky.sun_elevation = math.radians(38.0); sky.sun_rotation = math.radians(150); sky.sun_disc = False
except Exception: pass
for k_, v_ in (('air_density', 1.0), ('dust_density', 0.4), ('ozone_density', 3.0)):   # 第四版：天空藍一點（第三版太白，白雲看不出來）
    try: setattr(sky, k_, v_)
    except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = float(opt('--sky', '0.32'))
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sun', '3.4')); sun.data.color = (1.0, 0.95, 0.86); sun.data.angle = math.radians(1.0)
sun.rotation_euler = (math.radians(52), 0, math.radians(-30))
# 遠山的空氣感：一層淡藍的霧（體積太慢：用遠山的材質本身處理，這裡只加一點世界的霧）

# ---------------- 鏡頭：站在操場東南角的跑道外，往西北看：溜滑梯在右前方、司令台和校舍在後面、山在最後 ----------------
eye = tuple(map(float, opt('--eye', '13.0,1.6,-1.0').split(','))); look = tuple(map(float, opt('--look', '-6.0,3.2,-30.0').split(',')))   # 第二版：站在草地上（第一版站在跑道外，前景整片紅色）
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(opt('--lens', '26')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
cam.data.clip_end = 900
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, RW, RH, SAMPLES)
