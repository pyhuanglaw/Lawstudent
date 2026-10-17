"""2D 背景：地方法院（AA-C AA_252：大四下「法律專題研究」第 6 週週四上午，全班去地方法院旁聽一場刑事審理）。LAWWW2-C 2026-10-17。
使用者 2026-10-17：「模擬法庭做的東西，你可以留給可能某一堂課需要去法院旁聽，你就做成真的法院」——道具是 court_props.py 的 GLB（模擬法庭道具組改的）。
兩張（畫面上沒有人，人物用 ADV 立繪疊上去；不寫法院名、案號，不放國徽和任何標誌，D77）：
  --scene room       法庭旁聽席（court_gallery）：從旁聽席最後一排往前看——三排木頭長椅、欄杆和小門、中間的應訊台、
                     左邊辯護人和被告的桌子、右邊檢察官的桌子（兩邊相對）、前面低處的書記官和通譯、後面高起的法檯和三張高背椅。
                     AA_252：「法庭比你想的小。旁聽席三排，你們坐滿了兩排。」「被告坐在前面，背對著你們」（應訊台後面那張椅子）。
  --scene corridor   法院走廊（court_corridor）：很長的走廊，左邊一間一間法庭的木門（門上「第 N 法庭」、旁邊貼庭期表），
                     右邊是大窗（上午的光）和靠牆的候審連排椅；地上是磨石子地。AA_252：「法院的走廊很長，椅子上坐滿了等開庭的人。」
  /opt/blenv/bin/python tools/blender/env_second/bg_courthouse.py -- <輸出.png> --scene room|corridor [--res 1920x1080] [--samples 96]
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。法庭的擺法照 court_props.json 的 layout。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
SCENE = opt('--scene', 'room')
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_courthouse_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rng = random.Random(626)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.3'))
try: sc.view_settings.look = opt('--look', 'AgX - Base Contrast')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
root = B.group('courthouse')


def img_mat(name, path, emit=0.0, rough=0.7):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if emit:
        nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, uv=((0, 0), (1, 0), (1, 1), (0, 1))):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, uv): lp[ul].uv = t
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.parent = root; return ob


def area_light(name, x, y, z, w, d, power, col=(1.0, 0.97, 0.92), rot=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    if rot: ob.rotation_euler = rot
    return ob


def sign_tex(path, txt, W=640, H=160, bg=(34, 52, 86), fg=(244, 244, 240), sz=84):
    im = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(im); f = ImageFont.truetype(FONT, sz)
    w = d.textlength(txt, font=f); bb = f.getbbox(txt); d.text(((W - w) / 2, (H - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=fg)
    im.save(path); return path


def outside_tex(path, W=1600, H=900, seed=7):
    """窗外（上午）：淺藍的天、對面的建築（淺灰）、近處的樹；整張模糊（焦點在室內）"""
    r = random.Random(seed); im = Image.new('RGB', (W, H), (200, 220, 236)); d = ImageDraw.Draw(im)
    for y in range(H): t = y / H; d.line([(0, y), (W, y)], fill=(int(186 + 40 * t), int(210 + 26 * t), int(234 + 10 * t)))
    x = -40
    while x < W:
        w = r.randint(180, 420); top = r.randint(160, 420); c = r.randint(188, 222); d.rectangle([x, top, x + w, H], fill=(c, c - 2, c - 6))
        for fy in range(top + 30, H, 70):
            for fx in range(x + 20, x + w - 40, 60): d.rectangle([fx, fy, fx + 34, fy + 40], fill=(c - 46, c - 40, c - 30))
        x += w + r.randint(10, 60)
    for k in range(14):                                                                # 樹幹
        x0 = r.randint(0, W); d.rectangle([x0, int(H * 0.62), x0 + r.randint(10, 18), H], fill=(84, 74, 64))
    for k in range(90):                                                                # 樹冠：小一點、多一點、深淺不一（第一版 26 個大圓：像色塊）
        cx = r.randint(-60, W + 60); cy = r.randint(int(H * 0.40), int(H * 0.85)); rr = r.randint(40, 110); g = r.randint(84, 140)
        d.ellipse([cx - rr, cy - int(rr * 0.8), cx + rr, cy + int(rr * 0.8)], fill=(int(g * 0.60), g, int(g * 0.52)))
    im = im.filter(ImageFilter.GaussianBlur(6)); im.save(path); return path


def clock_tex(path, S=512):
    im = Image.new('RGB', (S, S), (60, 60, 62)); d = ImageDraw.Draw(im); c = S / 2
    d.ellipse([8, 8, S - 8, S - 8], fill=(246, 246, 242))
    for k in range(60):
        a = 2 * math.pi * k / 60; r0 = c - 22 if k % 5 else c - 48; w = 3 if k % 5 else 9
        d.line([(c + r0 * math.sin(a), c - r0 * math.cos(a)), (c + (c - 16) * math.sin(a), c - (c - 16) * math.cos(a))], fill=(30, 30, 32), width=w)
    for a, ln, w in ((2 * math.pi * (9 + 42 / 60) / 12, c * 0.50, 14), (2 * math.pi * 42 / 60, c * 0.75, 9)):   # 09:42
        d.line([(c, c), (c + ln * math.sin(a), c - ln * math.cos(a))], fill=(24, 24, 26), width=w)
    d.ellipse([c - 12, c - 12, c + 12, c + 12], fill=(24, 24, 26)); im.save(path); return path


def roster_tex(path, seed):
    """庭期表（門邊的公告）：一張 A4，表格的線＋看不清楚的字（不寫案號、名字）"""
    r = random.Random(seed); im = Image.new('RGB', (420, 594), (250, 250, 246)); d = ImageDraw.Draw(im)
    d.rectangle([30, 34, 390, 62], fill=(60, 60, 64))
    for k in range(12):
        y = 90 + k * 40; d.line([(30, y), (390, y)], fill=(150, 150, 150), width=2)
        for x0, x1 in ((40, 100), (116, 240), (256, 380)): d.line([(x0, y + 20), (x0 + r.uniform(0.4, 1.0) * (x1 - x0), y + 20)], fill=(70, 70, 76), width=6)
    for x in (30, 108, 248, 390): d.line([(x, 90), (x, 570)], fill=(150, 150, 150), width=2)
    im = im.filter(ImageFilter.GaussianBlur(0.8)); im.save(path); return path


# ---------------- 道具（court_props.glb） ----------------
GLB = os.path.join(L.ROOT, 'assets/models/env/second_ai/court_props.glb')
LAY = json.load(open(GLB.replace('.glb', '.json'), encoding='utf-8'))['layout']
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); new = [o for o in bpy.data.objects if o not in before]
SRC = {o.name.split('.')[0]: o for o in new if o.name.startswith('CT_') and (o.parent is None or not o.parent.name.startswith('CT_')) and o.type == 'EMPTY'}
for o in new: o.hide_render = True; o.hide_viewport = True
print('props', sorted(SRC))


def _copy(src, parent):
    ob = src.copy(); sc.collection.objects.link(ob); ob.hide_render = False; ob.hide_viewport = False; ob.parent = parent
    for ch in src.children: _copy(ch, ob)
    return ob


def put(name, x, y=0.0, z=0.0, ry=0.0):
    ob = _copy(SRC[name], root); ob.matrix_parent_inverse.identity(); ob.rotation_mode = 'XYZ'
    ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry); ob.scale = (1, 1, 1); return ob


M = {
    'carpet': L.pbr('ch_carpet', 'dirty_carpet', tile=1.5, target='#4c5868', normal=0.4, maps=('diff', 'nor', 'rough')),
    'plaster': L.pbr('ch_plaster', 'painted_plaster_wall', tile=2.4, target='#e4ded2', normal=0.15, maps=('diff', 'nor')),   # 第一版 white_plaster_02：斑駁，像髒牆
    'wood': L.pbr('ch_wood', 'walnut_veneer', tile=1.2, target='#6e4b32', normal=0.25, maps=('diff', 'nor'), rough_value=0.45),
    'wood_wall': L.pbr('ch_wood_wall', 'walnut_veneer', tile=1.2, target='#94704e', normal=0.25, maps=('diff', 'nor'), rough_value=0.5),
    'wood_l': L.pbr('ch_wood_l', 'wood_table_001', tile=1.0, target='#a47a52', maps=('diff', 'rough')),
    'ceil': L.flat('ch_ceiling', '#eeece6', rough=0.9), 'grid': L.flat('ch_grid', '#d8d6d0', rough=0.5, metal=0.2),
    'lamp': L.flat('ch_lamp', '#ffffff', rough=0.3, emit=B.srgb('#f6f8ff')),
    'alu': L.flat('ch_alu', '#b9bcbd', rough=0.35, metal=0.4), 'glass': L.flat('ch_glass', '#eef2f4', rough=0.04, alpha=0.12),
    'blind': L.flat('ch_blind', '#d6d0c2', rough=0.8), 'dark': L.flat('ch_dark', '#2a2b2e', rough=0.5),
    'terrazzo': L.pbr('ch_terrazzo', 'terrazzo_tiles', tile=1.4, target='#b9b5ac', normal=0.2, maps=('diff', 'nor', 'rough')),
    'door': L.pbr('ch_door', 'walnut_veneer', tile=0.8, target='#7a5636', normal=0.3, maps=('diff', 'nor'), rough_value=0.4),
    'skirt': L.flat('ch_skirt', '#4a3a2e', rough=0.5), 'cork': L.flat('ch_cork', '#b69a72', rough=0.9),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('ch_' + k, M[k])
    return _acc[k]


def wainscot(m, axis, fixed, a0, a1, h=1.1, face=1, step=0.9):
    """牆下半的木作框板（台灣法庭常見）：axis='x' 沿 x 的牆（面向 face·z），axis='z' 沿 z 的牆（面向 face·x）"""
    n = max(1, int(round(abs(a1 - a0) / step)))
    def bx(p0, p1, y0, y1, d0, d1):
        if axis == 'x': m.box(p0, p1, y0, y1, fixed + face * d0, fixed + face * d1)
        else: m.box(fixed + face * d0, fixed + face * d1, y0, y1, p0, p1)
    bx(a0, a1, 0.0, h, 0.0, 0.02)
    for k in range(n + 1):
        p = a0 + (a1 - a0) * k / n; bx(p - 0.03, p + 0.03, 0.0, h, 0.02, 0.035)
    for y in (0.0, h - 0.06): bx(a0, a1, y, y + 0.06, 0.02, 0.035)
    bx(a0, a1, h - 0.02, h + 0.03, 0.0, 0.05)                                         # 上緣的壓條
    bx(a0, a1, 0.0, 0.10, 0.02, 0.04)                                                  # 踢腳


def ceiling_grid(x0, x1, z0, z1, H, lamps):
    """輕鋼架天花板（60 cm 一格）＋嵌燈（60 × 120 cm 的平板燈）"""
    acc('ceil').quad([(x0, H, z0), (x1, H, z0), (x1, H, z1), (x0, H, z1)][::-1])
    x = x0
    while x <= x1 + 1e-6: acc('grid').box(x - 0.012, x + 0.012, H - 0.015, H, z0, z1); x += 0.6
    z = z0
    while z <= z1 + 1e-6: acc('grid').box(x0, x1, H - 0.015, H, z - 0.012, z + 0.012); z += 0.6
    for (lx, lz) in lamps:
        acc('lamp').box(lx - 0.29, lx + 0.29, H - 0.02, H - 0.012, lz - 0.59, lz + 0.59)
        area_light('ceil_%.1f_%.1f' % (lx, lz), lx, H - 0.03, lz, 0.58, 1.18, 70, col=(1.0, 0.97, 0.93))


# ======================== 法庭 ========================
if SCENE == 'room':
    R = LAY['room']; X0, X1, Z0, Z1, H = R['x0'], R['x1'], R['z0'], R['z1'], R['h']
    acc('carpet').quad([(X0, 0.0, Z1), (X1, 0.0, Z1), (X1, 0.0, Z0), (X0, 0.0, Z0)])
    # 法檯那面牆（−z）：整面直條木作（不放國徽、不放任何標誌）
    acc('plaster').quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, H, Z0), (X0, H, Z0)])
    for k in range(int(round(7.6 / 0.12))):                                          # 牆的木作比法檯淺一點（第二版同色：法檯和後面的牆融在一起）
        x = -3.8 + 0.12 * k; acc('wood_wall').box(x + 0.006, x + 0.114, 0.0, H - 0.25, Z0, Z0 + 0.03)
    acc('wood').box(-3.85, 3.85, H - 0.25, H - 0.17, Z0, Z0 + 0.06)
    acc('door').box(3.95, 4.4, 0.0, 2.2, Z0, Z0 + 0.04)                               # 法官進出的門（法檯右後）
    acc('wood').box(3.9, 4.45, 2.2, 2.28, Z0, Z0 + 0.06)
    # 左牆（−x）：木作壁板、往候審室的門（前段）、時鐘
    acc('plaster').quad([(X0, 0.0, Z1), (X0, 0.0, Z0), (X0, H, Z0), (X0, H, Z1)])
    wainscot(acc('wood'), 'z', X0, Z0 + 1.6, Z1, face=1)
    acc('door').box(X0, X0 + 0.04, 0.0, 2.2, Z0 + 0.3, Z0 + 1.3); acc('wood').box(X0, X0 + 0.06, 2.2, 2.28, Z0 + 0.25, Z0 + 1.35)
    acc('alu').cyl((X0 + 0.05, 1.0, Z0 + 1.2), (X0 + 0.11, 1.0, Z0 + 1.2), 0.02, seg=8)
    cm = img_mat('ch_clock', clock_tex(os.path.join(TMP, 'clock.png')), rough=0.3)
    uvquad('ch_clock_face', (X0 + 0.04, 2.4, -3.4 + 0.2), (X0 + 0.04, 2.4, -3.4 - 0.2), (X0 + 0.04, 2.8, -3.4 - 0.2), (X0 + 0.04, 2.8, -3.4 + 0.2), cm)
    # 右牆（+x）：三扇窗、垂直百葉（半開）；窗台以下木作
    WINS = [(-3.6, -1.6), (-0.9, 1.1), (1.8, 3.8)]
    def wall_x1(za, zb, ya, yb): acc('plaster').quad([(X1, ya, za), (X1, ya, zb), (X1, yb, zb), (X1, yb, za)])
    wall_x1(Z0, Z1, 0.0, 1.2); wall_x1(Z0, Z1, 2.7, H)                                  # 右牆：窗的高度（1.2～2.7 m）分段，窗的位置空著
    zs = [Z0] + [v for w_ in WINS for v in w_] + [Z1]
    for za, zb in zip(zs[0::2], zs[1::2]): wall_x1(za, zb, 1.2, 2.7)
    wainscot(acc('wood'), 'z', X1, Z0 + 1.6, Z1, face=-1)
    om = img_mat('ch_outside', outside_tex(os.path.join(TMP, 'outside.png')), emit=0.9, rough=1.0)   # 第二版 3.0：窗外整片過曝，看起來像白板
    for (wz0, wz1) in WINS:
        uvquad('ch_view', (X1 + 1.5, 0.2, wz1 + 1.0), (X1 + 1.5, 0.2, wz0 - 1.0), (X1 + 1.5, 3.6, wz0 - 1.0), (X1 + 1.5, 3.6, wz1 + 1.0), om)
        acc('glass').quad([(X1 - 0.03, 1.2, wz1), (X1 - 0.03, 1.2, wz0), (X1 - 0.03, 2.7, wz0), (X1 - 0.03, 2.7, wz1)])
        for z in (wz0, wz1): acc('alu').box(X1 - 0.08, X1 + 0.01, 1.2, 2.7, z - 0.03, z + 0.03)
        for y in (1.2, 2.66): acc('alu').box(X1 - 0.08, X1 + 0.01, y, y + 0.04, wz0, wz1)
        acc('alu').box(X1 - 0.18, X1 - 0.14, 2.82, 2.86, wz0 - 0.1, wz1 + 0.1)          # 百葉的軌道
        # 垂直百葉收在窗的兩端（每端 12 片疊在一起）：從旁聽席是斜著看這面牆，百葉拉上時整片葉片疊成一面白牆（第一～三版）
        for zz0, sg in ((wz0 - 0.08, 1.0), (wz1 + 0.08, -1.0)):
            for k in range(12):
                zc = zz0 + sg * 0.018 * k; a = math.radians(84); dx, dz = 0.045 * math.sin(a), 0.045 * math.cos(a)
                acc('blind').quad([(X1 - 0.16 - dx, 1.05, zc - dz), (X1 - 0.16 + dx, 1.05, zc + dz), (X1 - 0.16 + dx, 2.82, zc + dz), (X1 - 0.16 - dx, 2.82, zc - dz)])
    ceiling_grid(X0, X1, Z0, Z1, H, [(x, z) for x in (-2.4, 0.0, 2.4) for z in (-4.8, -2.4, 0.0, 2.4)])
    # 道具
    P = LAY
    put('CT_BENCH', P['CT_BENCH']['x'], 0.0, P['CT_BENCH']['z'])
    for c in P['CT_CHAIR_HIGH']: put('CT_CHAIR_HIGH', c['x'], c['y'], c['z'], c['ry'])
    for k in ('CT_CLERK', 'CT_INTERP', 'CT_TABLE_DEF', 'CT_TABLE_PROS', 'CT_STAND', 'CT_GATE'):
        put(k, P[k]['x'], 0.0, P[k]['z'], P[k]['ry'])
    for c in P['CT_RAIL']: put('CT_RAIL', c['x'], 0.0, c['z'], c['ry'])
    for c in P['CT_PEW']: put('CT_PEW', c['x'], 0.0, c['z'], c['ry'])
    put('CT_CHAIR', P['CT_CLERK']['x'] - 0.1, 0.0, -3.75, 0.0); put('CT_CHAIR', P['CT_INTERP']['x'], 0.0, -3.7, 0.25)
    put('CT_CHAIR', -3.95, 0.0, -0.9, math.pi / 2 - 0.15); put('CT_CHAIR', -3.95, 0.0, -2.4, math.pi / 2 + 0.1)
    put('CT_CHAIR', 3.95, 0.0, -1.9, -math.pi / 2 + 0.2)
    put('CT_CHAIR', 0.05, 0.0, -0.55, math.pi - 0.12)                                   # 應訊台後面（被告、證人坐，背對旁聽席）
    # 欄杆外側、旁聽席的地（同一張地毯）；後牆（鏡頭後面）
    acc('plaster').quad([(X1, 0.0, Z1), (X0, 0.0, Z1), (X0, H, Z1), (X1, H, Z1)])
    eye, look, lens = (-0.95, 1.34, 4.05), (0.3, 0.92, -5.5), 24      # 最後一排靠走道、坐著（第一版 1.22 m：前面兩排的椅背擋住應訊台和兩造的桌子）
# ======================== 走廊 ========================
else:
    X0, X1, Z0, Z1, H = -1.7, 1.7, -34.0, 4.0, 3.1
    acc('terrazzo').quad([(X0, 0.0, Z1), (X1, 0.0, Z1), (X1, 0.0, Z0), (X0, 0.0, Z0)])
    acc('plaster').quad([(X0, 0.0, Z0), (X1, 0.0, Z0), (X1, H, Z0), (X0, H, Z0)])                 # 走廊盡頭
    uvquad('ch_end_win', (-1.0, 0.9, Z0 + 0.02), (1.0, 0.9, Z0 + 0.02), (1.0, 2.6, Z0 + 0.02), (-1.0, 2.6, Z0 + 0.02), img_mat('ch_end_view', outside_tex(os.path.join(TMP, 'outside_end.png'), seed=9), emit=2.6, rough=1.0))
    for x in (-1.0, 0.0, 1.0): acc('alu').box(x - 0.03, x + 0.03, 0.9, 2.6, Z0, Z0 + 0.05)
    for y in (0.9, 2.56): acc('alu').box(-1.0, 1.0, y, y + 0.04, Z0, Z0 + 0.05)
    # 左牆：法庭的門（每 7 m 一間）、門牌、庭期表、牆下半木作
    acc('plaster').quad([(X0, 0.0, Z1), (X0, 0.0, Z0), (X0, H, Z0), (X0, H, Z1)])
    wainscot(acc('wood'), 'z', X0, Z0, Z1, h=1.0, face=1)
    DOORS = [(-2.5, '第五法庭'), (-9.5, '第六法庭'), (-16.5, '第七法庭'), (-23.5, '第八法庭'), (-30.5, '第九法庭')]
    for k, (dz, name) in enumerate(DOORS):
        acc('dark').box(X0, X0 + 0.02, 0.0, 2.45, dz - 0.95, dz + 0.95)                      # 門洞的陰影（門往內開一點的縫）
        for s_ in (-1, 1):                                                                 # 雙開木門（兩扇各 0.85 m）
            z0, z1 = (dz - 0.86, dz - 0.01) if s_ < 0 else (dz + 0.01, dz + 0.86)
            acc('door').box(X0 + 0.02, X0 + 0.07, 0.0, 2.35, z0, z1)
            acc('wood').box(X0 + 0.07, X0 + 0.085, 0.25, 2.1, z0 + 0.08, z0 + 0.10); acc('wood').box(X0 + 0.07, X0 + 0.085, 0.25, 2.1, z1 - 0.10, z1 - 0.08)
            acc('alu').box(X0 + 0.07, X0 + 0.10, 0.95, 1.25, (z1 - 0.12) if s_ < 0 else (z0 + 0.08), (z1 - 0.08) if s_ < 0 else (z0 + 0.12))   # 推板
        acc('wood').box(X0, X0 + 0.10, 2.35, 2.45, dz - 0.95, dz + 0.95)
        for zz in (dz - 0.95, dz + 0.90): acc('wood').box(X0, X0 + 0.10, 0.0, 2.45, zz, zz + 0.05)
        sm = img_mat('ch_sign%d' % k, sign_tex(os.path.join(TMP, 'sign%d.png' % k), name), rough=0.4)   # 門上的門牌（深藍底白字）
        acc('dark').box(X0, X0 + 0.04, 2.55, 2.85, dz - 0.62, dz + 0.62)
        uvquad('ch_sign%d' % k, (X0 + 0.042, 2.57, dz + 0.6), (X0 + 0.042, 2.57, dz - 0.6), (X0 + 0.042, 2.83, dz - 0.6), (X0 + 0.042, 2.83, dz + 0.6), sm)
        acc('cork').box(X0, X0 + 0.03, 1.15, 1.85, dz + 1.25, dz + 2.05)                   # 門右邊的公告板（庭期表）
        rm = img_mat('ch_roster%d' % k, roster_tex(os.path.join(TMP, 'roster%d.png' % k), k), rough=0.8)
        for j in range(2):
            zz = dz + 1.32 + j * 0.37
            uvquad('ch_roster%d_%d' % (k, j), (X0 + 0.032, 1.25, zz + 0.33), (X0 + 0.032, 1.25, zz), (X0 + 0.032, 1.72, zz), (X0 + 0.032, 1.72, zz + 0.33), rm)
        if k < 4:                                                                          # 兩扇門中間：靠牆的候審椅（面向走廊）
            put('CT_WAIT_SEATS', X0 + 0.32, 0.0, dz - 3.5, math.pi / 2)
    # 右牆：大窗（窗台 0.9 m）＋窗下靠牆的候審椅（面向法庭的門）
    def wall_x1(za, zb, ya, yb): acc('plaster').quad([(X1, ya, za), (X1, ya, zb), (X1, yb, zb), (X1, yb, za)])
    wall_x1(Z0, Z1, 0.0, 0.9); wall_x1(Z0, Z1, 2.7, H); wall_x1(Z0, Z0 + 1.0, 0.9, 2.7); wall_x1(Z1 - 1.0, Z1, 0.9, 2.7)   # 右牆：窗帶（0.9～2.7 m）空著
    vm = img_mat('ch_side_view', outside_tex(os.path.join(TMP, 'outside_side.png'), W=2400, seed=11), emit=2.4, rough=1.0)
    uvquad('ch_side_view', (X1 + 3.0, -1.0, Z1), (X1 + 3.0, -1.0, Z0), (X1 + 3.0, 5.0, Z0), (X1 + 3.0, 5.0, Z1), vm)
    z = Z1 - 1.0
    while z > Z0 + 1.0:
        acc('alu').box(X1 - 0.06, X1 + 0.01, 0.9, 2.7, z - 0.04, z + 0.04); z -= 2.4
    for y in (0.9, 2.66): acc('alu').box(X1 - 0.06, X1 + 0.01, y, y + 0.04, Z0 + 1.0, Z1 - 1.0)
    acc('glass').quad([(X1 - 0.02, 0.92, Z1 - 1.0), (X1 - 0.02, 0.92, Z0 + 1.0), (X1 - 0.02, 2.68, Z0 + 1.0), (X1 - 0.02, 2.68, Z1 - 1.0)])
    acc('wood').box(X1 - 0.14, X1, 0.86, 0.92, Z0 + 1.0, Z1 - 1.0)                         # 窗台
    k = 0; z = 1.2
    while z > Z0 + 2.5:
        put('CT_WAIT_SEATS', X1 - 0.34, 0.0, z, -math.pi / 2); z -= 2.6; k += 1
    # 候審椅上的東西（人物不畫：座位上留一個公文袋、一杯紙杯咖啡、一個包包——有人坐過、剛起身的樣子）
    acc('cork').box(X1 - 0.52, X1 - 0.20, 0.46, 0.48, -1.55, -1.25)
    Mesh('ch_cup', L.flat('ch_cup', '#f2efe8', rough=0.7)).cyl((X1 - 0.30, 0.46, -6.35), (X1 - 0.30, 0.56, -6.35), 0.03, seg=14, r2=0.038).finish(parent=root, smooth=True)
    Mesh('ch_bag', L.flat('ch_bag', '#2f3440', rough=0.75)).rbox(X1 - 0.55, X1 - 0.22, 0.46, 0.80, -9.05, -8.85, r=0.04).finish(parent=root)
    ceiling_grid(X0, X1, Z0, Z1, H, [(0.0, z) for z in range(2, int(Z0), -4)])
    eye, look, lens = (0.55, 1.55, 3.4), (-0.35, 1.25, -30.0), 22

# ======================== 收尾、光、鏡頭 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.75, 0.82, 0.92, 1); bg.inputs[1].default_value = 0.6
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.4; sun.color = (1.0, 0.95, 0.86); sun.angle = math.radians(2)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (g2b(0, 0, 0) - g2b(1.0, 0.75, -0.35)).to_track_quat('-Z', 'Y').to_euler()     # 上午的光從東邊的窗斜射進來
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', str(lens))); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('saved', OUT)
