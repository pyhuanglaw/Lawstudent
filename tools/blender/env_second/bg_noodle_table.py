"""2D 背景 noodle_table（阿鳳麵店・長桌，晚上；交接包 v2 C11／C21「考完的晚餐」，src/outings3d.js 的 OUT.BG.noodle_table）。
LAWWW2 製作；Blender 5.2（bpy，無介面）＋Cycles（CPU）。畫面上沒有人：人物用 ADV 立繪疊上去。
  1. 長桌版的麵店：/opt/blenv/bin/python tools/blender/env_second/noodle_interior.py -- --layout longtable --out <暫存>/noodle_long.glb
  2. 算圖：/opt/blenv/bin/python tools/blender/env_second/bg_noodle_table.py -- <noodle_long.glb> <輸出.png> [--view main|wide] [--res 1920x1080] [--samples 96]
座標＝遊戲 noodle 區域的座標（x 往東、y 往上、z 往南；店面在 z=+4.5、煮麵台在 z=−3.8）。
燈光：天花板六支日光燈管（套件的位置 x＝±2.5、z＝−2.6／0.5／3.0）各放一盞面光；煮麵台上方一盞暖色的燈；店外是晚上（窗景 assets/models/env/views/noodle_night.webp，
和遊戲晚上的窗景同一張）。菜單、價目板的字照遊戲 zones3d.js attachNoodleInterior 的畫法（紅紙直式黑字、白底深咖啡字），字型文泉驛正黑。"""
import math, os, sys
import bpy
from mathutils import Vector
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
GLB, OUT = A[0], A[1]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
VIEW = opt('--view', 'main'); RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_noodle_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
g2b = lambda x, y, z: Vector((x, -z, y))
# 鏡頭：[眼睛 (x,y,z)、看的點、焦距 mm]——main＝從店門口右邊往裡看：長桌橫在畫面下半、後面是煮麵台和紅紙菜單；wide＝更寬、看得到左邊那張桌子和窗
VIEWS = {'main': ((2.9, 1.42, 3.55), (0.15, 0.95, -1.6), 24), 'wide': ((3.9, 1.5, 3.9), (-0.6, 0.95, -1.4), 20),
         'night': ((4.3, 1.45, -2.9), (-1.3, 0.95, 2.4), 22)}   # night＝從右後角往店門口看：長桌、門口和窗外的夜景、左牆的紅紙菜單、角落的電視

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = opt('--look', 'AgX - Medium High Contrast')
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 32


def emit_mat(name, img_path, strength, base_mix=0.6):
    """貼圖材質：底色＋一點自發光（遊戲裡招牌是 emissiveIntensity 0.25）"""
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(img_path)
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.75
    try:
        nt.links.new(tx.outputs['Color'], bsdf.inputs['Emission Color']); bsdf.inputs['Emission Strength'].default_value = strength
    except Exception: pass
    return mt


def sign_image(text, style, w_m, h_m):
    """照遊戲的畫法（zones3d.js attachNoodleInterior）"""
    if style == 'price':
        W = 1024; H = max(64, round(W * h_m / w_m)); im = Image.new('RGB', (W, H), '#fbf7ee'); d = ImageDraw.Draw(im)
        d.rectangle([4, 4, W - 5, H - 5], outline='#8a3b2e', width=8)
        fs = round(H * 0.42); f = ImageFont.truetype(FONT, fs)
        while fs > 12 and d.textlength(text, font=f) > W * 0.9: fs -= 2; f = ImageFont.truetype(FONT, fs)   # 整句放得進板子（遊戲的 canvas 沒有縮，字會被切掉：見交付說明）
        d.text((W / 2, H * 0.52), text, fill='#3b2a1e', font=f, anchor='mm', stroke_width=1, stroke_fill='#3b2a1e')
    else:
        W = 192; H = max(64, round(W * h_m / w_m)); im = Image.new('RGB', (W, H), '#c8332a'); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, W, round(H * 0.04)], fill='#d75e56')
        ch = list(text); fs = min(W * 0.62, H * 0.8 / max(1, len(ch))); f = ImageFont.truetype(FONT, round(fs))
        for i, c in enumerate(ch): d.text((W / 2, H * 0.1 + fs * 0.6 + i * fs * 1.05), c, fill='#1d1a18', font=f, anchor='mm', stroke_width=1, stroke_fill='#1d1a18')
    return im


# ---- 菜單、價目板的字（GLB 的 SIGN_FACE_* 是空白板面，自訂屬性帶文字）
for o in list(sc.objects):
    if o.type != 'MESH' or 'SIGN_FACE' not in o.name: continue
    txt, style = o.get('sign', ''), o.get('style', 'redpaper')
    vs = [o.matrix_world @ v.co for v in o.data.vertices]
    xs, ys, zs = [v.x for v in vs], [v.y for v in vs], [v.z for v in vs]
    w_m = max(max(xs) - min(xs), max(ys) - min(ys)); h_m = max(zs) - min(zs)
    p = os.path.join(TMP, o.name + '.png'); sign_image(txt, style, w_m, h_m).save(p)
    o.data.materials.clear(); o.data.materials.append(emit_mat('sign_' + o.name, p, 0.35))

# ---- 店外：晚上的窗景（遊戲晚上的窗景同一張），放在店面玻璃外 0.35 m（門、兩扇窗）
view_img = os.path.join(ROOT, 'assets/models/env/views/noodle_night.webp')
vm = bpy.data.materials.new('night_view'); vm.use_nodes = True; nt = vm.node_tree; nt.nodes.clear()   # 只發光、不受店裡的燈影響（不然窗外會被照成灰白）
tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(view_img); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 0.9
out = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(tx.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
gm = bpy.data.materials.get('ndl_glass')
if gm and gm.use_nodes and 'Principled BSDF' in gm.node_tree.nodes: gm.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.07   # 玻璃：晚上從店裡看幾乎是透明的、帶一點反光
for cx, w, y0, y1 in ((0.0, 2.6, 0.0, 2.7), (-3.0, 2.8, 0.9, 3.1), (3.0, 2.8, 0.9, 3.1)):
    me = bpy.data.meshes.new('view'); z = 4.5 + 0.35
    me.from_pydata([g2b(cx + w / 2, y0, z), g2b(cx - w / 2, y0, z), g2b(cx - w / 2, y1, z), g2b(cx + w / 2, y1, z)], [], [(0, 1, 2, 3)])
    me.uv_layers.new(); uv = me.uv_layers[0].data
    for k, (u, v) in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))): uv[k].uv = (u, v)
    ob = bpy.data.objects.new('night_view', me); ob.data.materials.append(vm); sc.collection.objects.link(ob)

# ---- 燈：日光燈管六支（面光）、煮麵台上方暖色燈；外面是晚上（天空很暗）
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.025, 0.045, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4
for z in (-2.6, 0.5, 3.0):
    for x in (-2.5, 2.5):
        L = bpy.data.lights.new('tube', 'AREA'); L.shape = 'RECTANGLE'; L.size = 1.2; L.size_y = 0.12; L.energy = 70; L.color = (1.0, 0.96, 0.9)
        ob = bpy.data.objects.new('tube', L); ob.location = g2b(x, 3.2 - 0.16, z); ob.rotation_euler = (0, 0, 0); sc.collection.objects.link(ob)
L = bpy.data.lights.new('kitchen', 'POINT'); L.energy = 90; L.color = (1.0, 0.82, 0.6); L.shadow_soft_size = 0.4
ob = bpy.data.objects.new('kitchen', L); ob.location = g2b(-1.0, 2.5, -3.5); sc.collection.objects.link(ob)
L = bpy.data.lights.new('fill', 'AREA'); L.size = 3.0; L.energy = 18; L.color = (1.0, 0.95, 0.88)
ob = bpy.data.objects.new('fill', L); ob.location = g2b(VIEWS[VIEW][0][0], 2.6, VIEWS[VIEW][0][2]); sc.collection.objects.link(ob)
ob.rotation_euler = (g2b(0.7, 0.8, 0.5) - ob.location).to_track_quat('-Z', 'Y').to_euler()

# ---- 鏡頭
eye, look, lens = VIEWS[VIEW]
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, VIEW, RW, RH, SAMPLES)
