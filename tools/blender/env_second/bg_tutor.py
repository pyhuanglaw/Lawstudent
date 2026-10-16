"""2D 背景：家教學生家的客廳（tutor_home；大一下第 3 週起，明軒介紹的家教，國中生補公民，平日晚上七點多；BB_96 3-2、BB_132 55b）。
LAWWW2-B 2026-10-16。Blender 5.2（bpy，無介面）＋Cycles（CPU），1920×1080，畫面上沒有人（人物用 ADV 立繪疊上去）。
道具是 BB-B 的 ART-TUTOR1（assets/models/env/second_ai/bb_support/tutor_props.glb：矮桌、坐墊、課本一組、布沙發＋運動外套、電視櫃、立燈、時鐘＋日曆、地毯），
房間（牆、地、落地窗、窗簾、窗外對面的公寓、吸頂燈、書包）在這裡用 bpy 蓋。和臺北的家（home_living）不是同一間：一般三房兩廳的公寓。
  /opt/blenv/bin/python tools/blender/env_second/bg_tutor.py -- <輸出.png> [--res 1920x1080] [--samples 96]
構圖：沙發靠後牆、立燈在沙發旁；矮桌＋坐墊在中間偏左下（人物站中間時在腳邊）；左牆是電視櫃（電視關著）、時鐘、日曆；
右邊是通往陽台的落地窗，窗簾拉一半，外面是對面公寓亮著的窗。暖白的吸頂燈＋立燈。不放任何字、校名、品牌（D77）。
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402
from PIL import Image, ImageDraw, ImageFilter

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_tutor_tex'); os.makedirs(TMP, exist_ok=True)
rng = random.Random(3020)

B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.2'))
try: sc.view_settings.look = opt('--look', 'AgX - Punchy')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
root = B.group('tutor_home')
X0, X1, ZB, ZF, H = -3.0, 3.0, -4.0, 2.8, 2.8


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


def area_light(name, x, y, z, w, d, power, col=(1.0, 0.86, 0.68), rot=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob)
    if rot: ob.rotation_euler = rot
    return ob


def point_light(name, x, y, z, power, col=(1.0, 0.8, 0.58), r=0.08):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


M = {
    'floor': L.pbr('tut_floor', 'large_floor_tiles_02', tile=1.6, target='#d2c6b0', normal=0.3, maps=('diff', 'nor', 'rough')),
    'wall': L.pbr('tut_wall', 'painted_plaster_wall', tile=2.4, target='#e9e0cf', normal=0.2, maps=('diff', 'nor')),
    'ceil': L.flat('tut_ceiling', '#efe9dd', rough=0.9), 'skirt': L.flat('tut_skirt', '#8a6a4c', rough=0.5),
    'alu': L.flat('tut_alu', '#b9bcbd', rough=0.35, metal=0.4), 'glass': L.flat('tut_glass', '#5a6878', rough=0.04, alpha=0.18),
    'curtain': L.flat('tut_curtain', '#c9b48e', rough=0.9), 'curtain_s': L.flat('tut_sheer', '#e6dfd0', rough=0.9, alpha=0.4),
    'lamp': L.flat('tut_ceil_lamp', '#ffffff', rough=0.3, emit=B.srgb('#fff0d8')), 'white': L.flat('tut_white', '#f1eee6', rough=0.5),
    'bag': L.flat('tut_bag', '#2f3e5c', rough=0.75), 'bag2': L.flat('tut_bag_trim', '#1d2533', rough=0.6),
    'door': L.pbr('tut_door', 'walnut_veneer', tile=0.8, target='#7b5a3e', normal=0.3, maps=('diff', 'nor'), rough_value=0.45),
}
_acc = {}
def acc(k):
    if k not in _acc: _acc[k] = Mesh('tut_' + k, M[k])
    return _acc[k]


# ======================== 房間 ========================
acc('floor').quad([(X0, 0.0, ZF), (X1, 0.0, ZF), (X1, 0.0, ZB), (X0, 0.0, ZB)])
acc('wall').quad([(X0, 0.0, ZB), (X1, 0.0, ZB), (X1, H, ZB), (X0, H, ZB)])                        # 後牆
acc('wall').quad([(X0, 0.0, ZF), (X0, 0.0, ZB), (X0, H, ZB), (X0, H, ZF)])                        # 左牆
WZ0, WZ1, WY = -3.3, -0.5, 2.3                                                                     # 右牆的落地窗（z −3.3～−0.5）
for (a, b_) in ((ZB, WZ0), (WZ1, ZF)): acc('wall').quad([(X1, 0.0, b_), (X1, 0.0, a), (X1, H, a), (X1, H, b_)])
acc('wall').quad([(X1, WY, WZ1), (X1, WY, WZ0), (X1, H, WZ0), (X1, H, WZ1)])
acc('ceil').quad([(X0, H, ZB), (X1, H, ZB), (X1, H, ZF), (X0, H, ZF)])
for (p, q) in (((X0, ZB), (X1, ZB)), ((X0, ZB), (X0, ZF))):                                       # 踢腳
    if p[1] == q[1]: acc('skirt').box(p[0], q[0], 0.0, 0.08, ZB, ZB + 0.012)
    else: acc('skirt').box(X0, X0 + 0.012, 0.0, 0.08, ZB, ZF)
# 落地窗：鋁框、四扇玻璃、窗外對面的公寓（晚上，亮著的窗）
def night_view(path, W=1600, Hh=900, seed=55):
    r = random.Random(seed); im = Image.new('RGB', (W, Hh), (18, 24, 38)); d = ImageDraw.Draw(im)
    for y in range(Hh): d.line([(0, y), (W, y)], fill=(int(16 + 18 * y / Hh), int(22 + 20 * y / Hh), int(40 + 14 * y / Hh)))
    for bx0, bx1, top, col in ((-50, 700, 120, (52, 50, 54)), (700, 1180, 60, (60, 56, 58)), (1180, 1700, 160, (48, 46, 52))):
        d.rectangle([bx0, top, bx1, Hh], fill=col)
        for fy in range(top + 40, Hh - 60, 110):
            for fx in range(bx0 + 40, bx1 - 80, 140):
                lit = r.random() < 0.45; c = (255, r.randint(196, 226), r.randint(130, 170)) if lit else (34, 36, 44)
                d.rectangle([fx, fy, fx + 90, fy + 64], fill=c)
                if lit and r.random() < 0.5: d.rectangle([fx, fy, fx + 40, fy + 64], fill=(r.randint(170, 210), r.randint(150, 180), r.randint(120, 150)))   # 拉一半的窗簾
                d.rectangle([fx - 4, fy + 66, fx + 94, fy + 74], fill=(70, 70, 74))                                                                   # 窗台
                d.line([(fx, fy + 20), (fx + 90, fy + 20)], fill=(20, 20, 24), width=3)                                                               # 鐵窗
    im = im.filter(ImageFilter.GaussianBlur(2.2)); im.save(path); return path
vm = img_mat('tut_view', night_view(os.path.join(TMP, 'view.png')), emit=1.0, rough=1.0)
uvquad('tut_view', (X1 + 2.5, -0.6, WZ1 + 1.4), (X1 + 2.5, -0.6, WZ0 - 1.4), (X1 + 2.5, 3.6, WZ0 - 1.4), (X1 + 2.5, 3.6, WZ1 + 1.4), vm)
acc('floor').quad([(X1, -0.02, WZ0 - 0.3), (X1, -0.02, WZ1 + 0.3), (X1 + 1.4, -0.02, WZ1 + 0.3), (X1 + 1.4, -0.02, WZ0 - 0.3)])   # 陽台地板（暗）
fr = acc('alu')
for z in (WZ0, WZ1): fr.box(X1 - 0.06, X1 + 0.02, 0.0, WY, z - 0.03, z + 0.03)
for y in (0.0, WY - 0.05): fr.box(X1 - 0.06, X1 + 0.02, y, y + 0.05, WZ0, WZ1)
for k in range(1, 4): z = WZ0 + (WZ1 - WZ0) * k / 4; fr.box(X1 - 0.05, X1 + 0.01, 0.0, WY, z - 0.02, z + 0.02)
acc('glass').quad([(X1 - 0.02, 0.05, WZ1), (X1 - 0.02, 0.05, WZ0), (X1 - 0.02, WY - 0.05, WZ0), (X1 - 0.02, WY - 0.05, WZ1)])
# 窗簾：布簾拉一半（靠後面那一半），紗簾整片；窗簾軌
acc('alu').box(X1 - 0.2, X1 - 0.16, WY + 0.15, WY + 0.19, WZ0 - 0.3, WZ1 + 0.3)
def pleat(m, z0, z1, x, y0, y1, n, amp):
    for k in range(n):
        za, zb = z0 + (z1 - z0) * k / n, z0 + (z1 - z0) * (k + 1) / n; xa, xb = x + amp * math.sin(k * math.pi), x + amp * math.sin((k + 1) * math.pi)
        m.quad([(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)][::-1])
pleat(acc('curtain_s'), WZ1 - 0.85, WZ1 + 0.2, X1 - 0.12, 0.02, WY + 0.15, 14, 0.035)   # 紗簾只拉到靠鏡頭那一段；中間看得到外面的夜景
pleat(acc('curtain'), WZ0 - 0.25, WZ0 + 0.95, X1 - 0.2, 0.0, WY + 0.15, 12, 0.06)
# 吸頂燈（圓形）
acc('white').cyl((0.0, H, -1.4), (0.0, H - 0.08, -1.4), 0.3, seg=32); acc('lamp').cyl((0.0, H - 0.08, -1.4), (0.0, H - 0.1, -1.4), 0.26, seg=32)
area_light('ceil_lamp', 0.0, H - 0.12, -1.4, 0.5, 0.5, 260, col=(1.0, 0.9, 0.76), rot=(0, 0, 0))
# 往房間的門（後牆右邊）、門框
acc('door').box(1.75, 2.6, 0.0, 2.05, ZB, ZB + 0.04); acc('white').box(1.7, 2.65, 2.05, 2.12, ZB, ZB + 0.05)
for x in (1.7, 2.6): acc('white').box(x, x + 0.05, 0.0, 2.12, ZB, ZB + 0.05)
acc('alu').cyl((1.85, 1.0, ZB + 0.06), (1.85, 1.0, ZB + 0.12), 0.02, seg=8)
# 分離式冷氣的室內機（後牆右上）、沙發上面的畫（色塊的風景）
acc('white').rbox(0.9, 1.9, 2.25, 2.55, ZB, ZB + 0.24, r=0.04, seg=3); acc('bag2').box(0.95, 1.85, 2.27, 2.29, ZB + 0.2, ZB + 0.245)
def paint_tex(path):
    im = Image.new('RGB', (600, 400), (214, 226, 228)); d = ImageDraw.Draw(im)
    d.rectangle([0, 230, 600, 400], fill=(150, 176, 128)); d.polygon([(0, 260), (180, 140), (340, 250), (470, 170), (600, 240), (600, 400), (0, 400)], fill=(108, 140, 110))
    d.ellipse([430, 50, 500, 120], fill=(244, 222, 170)); d.rectangle([0, 330, 600, 400], fill=(186, 168, 120))
    im = im.filter(ImageFilter.GaussianBlur(1.5)); im.save(path); return path
uvquad('tut_painting', (-1.3, 1.45, ZB + 0.03), (0.5, 1.45, ZB + 0.03), (0.5, 2.05, ZB + 0.03), (-1.3, 2.05, ZB + 0.03), img_mat('tut_paint', paint_tex(os.path.join(TMP, 'paint.png')), rough=0.6))
acc('door').box(-1.35, 0.55, 1.4, 1.45, ZB, ZB + 0.04); acc('door').box(-1.35, 0.55, 2.05, 2.1, ZB, ZB + 0.04)
for x in (-1.35, 0.5): acc('door').box(x, x + 0.05, 1.4, 2.1, ZB, ZB + 0.04)
# 學生的書包（沙發旁的地上）
bag = acc('bag'); bag.rbox(1.0, 1.36, 0.0, 0.42, -3.35, -3.12, r=0.05, seg=3) if hasattr(bag, 'rbox') else bag.box(1.0, 1.36, 0.0, 0.42, -3.35, -3.12)
acc('bag2').box(1.04, 1.32, 0.12, 0.3, -3.12, -3.1)

# ======================== TUTOR1 道具（BB-B） ========================
GLB = os.path.join(L.ROOT, 'assets/models/env/second_ai/bb_support/tutor_props.glb')
before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=GLB); new = [o for o in bpy.data.objects if o not in before]
SRC = {o.name.split('.')[0]: o for o in new if o.type == 'EMPTY' and o.parent is not None and o.parent.name.split('.')[0] == 'TUTOR_PROPS'}   # 每件一個空節點、底下是網格
for o in new: o.hide_render = True
glow = L.flat('tut_lamp_glow', '#ffe2b0', rough=0.5, emit=B.srgb('#ffd59a'))
def put(name, x, y, z, ry=0.0):
    src = SRC[name]; ob = src.copy(); sc.collection.objects.link(ob); ob.hide_render = False
    ob.parent = root; ob.rotation_mode = 'XYZ'; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry); ob.scale = (1, 1, 1)
    for c in src.children:   # 子網格（TUTOR_LAMP_GLOW 之類）一起複製
        cc = c.copy(); sc.collection.objects.link(cc); cc.parent = ob; cc.hide_render = False
        if 'GLOW' in c.name and cc.data: cc.data = cc.data.copy(); cc.data.materials.clear(); cc.data.materials.append(glow)
    return ob
put('TUTOR_RUG', -0.3, 0.0, -1.25, 0.05)
put('TUTOR_TABLE', -0.3, 0.0, -1.25, 0.05)
put('TUTOR_STUDY', -0.3, 0.40, -1.25, 0.05)
put('TUTOR_CUSHIONS', -0.25, 0.0, -0.45, 0.1)
put('TUTOR_SOFA', -0.4, 0.0, -3.5, 0.0)
put('TUTOR_LAMP', -1.85, 0.0, -3.55, 0.3)
point_light('floor_lamp', -1.85, 1.45, -3.55, 45, col=(1.0, 0.78, 0.5), r=0.15)
put('TUTOR_TVSTAND', X0 + 0.25, 0.0, -2.3, math.pi / 2)
put('TUTOR_WALL', X0 + 0.005, 1.55, -2.3, math.pi / 2)

# ======================== 收尾、光、鏡頭 ========================
for k, m in _acc.items(): m.finish(root, uv=True, smooth=False)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.05, 0.07, 0.12, 1); bg.inputs[1].default_value = 0.4
area_light('fill', 0.6, 2.4, 1.8, 3.0, 1.5, 70, col=(1.0, 0.9, 0.78), rot=(math.radians(35), 0, 0))   # 鏡頭這一邊的補光（玄關、餐廳那一側的燈）
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye, look = (-0.5, 1.4, 1.7), (0.6, 1.0, -3.8)
if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', '20')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
import numpy as np   # noqa: E402
im = np.asarray(Image.open(OUT).convert('RGB')).astype(np.float32) / 255.0; h_, w_ = im.shape[:2]
yy, xx = np.mgrid[0:h_, 0:w_]; r = np.hypot((xx - w_ / 2) / (w_ / 2), (yy - h_ / 2) / (h_ / 2))
im = im * np.array([1.03, 1.0, 0.96]) * (1.0 - 0.25 * np.clip(r - 0.45, 0, 1) ** 1.5)[..., None]
Image.fromarray((np.clip(im, 0, 1) * 255).astype(np.uint8)).save(OUT)
print('saved', OUT)
