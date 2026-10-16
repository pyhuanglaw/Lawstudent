"""2D 背景：新體育館 3F 主球場的典禮（ART-GYM-BG1；8/31 開學典禮，之後大四畢業典禮 CG-9 換橫幅共用）。LAWWW2-B 2026-10-16。
從遊戲的 3F 主球場模型（assets/models/env/second_ai/gym_arena.glb，tools/blender/env_second/gym_arena.py）算圖：
- 打開舞台（SET_STAGE）＋典禮布置（SET_CEREMONY），藏起演講、演唱會布置。
- 背板的米色長布換成寫「開學典禮」的版本（--text；不寫校名、不放校徽，D77）。
- 場地的折疊椅、下層看台坐滿新生；上層看台（4、5F）空著。
  人物是遊戲的學生正式人物（vroid_npc_f1／f2／m1／m2）擺坐姿（vrm_crowd.py），衣服、頭髮顏色每個人不同。
  v1（3eb86bfb）用幾何拼的公仔、上層看台放家長，使用者 2026-10-16 23:5x 退件：「開學典禮是學生要坐在座位上吧 怎麼一堆家長 而且超醜!!!」
- 舞台：七位來賓、講台致詞的人（同一批人物、深色西裝色表）；大螢幕轉播講台（另一台鏡頭先拍、模糊、壓暗）。
- 白天室內燈光：屋頂的燈（面光源）＋舞台前的暖色投射燈。
用法：
  /opt/blenv/bin/python tools/blender/env_second/bg_gym_ceremony.py -- <輸出.png> [--res 1920x1080] [--samples 96] [--text 開學典禮]
       [--eye x,y,z --look x,y,z --lens mm] [--dof 焦距m] [--fstop 4] [--fill 0.92] [--exposure 0]
座標＝gym_arena 區域座標（x 東、y 上、z 南；舞台在北邊 z −21.6～−15.6）。"""
import json, math, os, random, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import bpy, bmesh, Vector, Matrix, g2b   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image, ImageDraw, ImageFont, ImageFilter   # noqa: E402

A_ = sys.argv[sys.argv.index('--') + 1:]
OUT = os.path.abspath(A_[0])
def opt(name, default):
    return A_[A_.index(name) + 1] if name in A_ else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
TEXT = opt('--text', '開學典禮'); FILL = float(opt('--fill', '0.93'))
TMP = os.path.join(os.path.dirname(OUT), 'bg_gym_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/gym_layout.js')))"], cwd=L.ROOT))
AR = LAY['arena']; SR = AR['standRows']; UP = AR['upper']
rng = random.Random(831)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, AR['glb']))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.0'))
try: sc.view_settings.look = 'AgX - Base Contrast'
except Exception: pass
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 24

# ======================== 布置：留舞台＋典禮 ========================
def under(ob, key):
    while ob is not None:
        if ob.name.startswith(key): return True
        ob = ob.parent
    return False
for ob in list(bpy.data.objects):
    if under(ob, 'SET_LECTURE') or under(ob, 'SET_CONCERT'): ob.hide_render = True; ob.hide_viewport = True


def banner_png(path, text):
    """背板長布 16×1.25 m（貼圖照同一個比例）：米色底、金色雙框、兩側月桂葉的線條，中間深藍大字（不寫校名、不放校徽）"""
    W, H = 3200, 250; im = Image.new('RGB', (W, H), (238, 230, 210)); d = ImageDraw.Draw(im)
    for k, c in ((10, (176, 140, 60)), (22, (206, 176, 96))): d.rectangle([k, k, W - k, H - k], outline=c, width=5)
    f = ImageFont.truetype(FONT, 186); sp = 80
    ws = [d.textbbox((0, 0), ch, font=f) for ch in text]; tw = sum(b[2] - b[0] for b in ws) + sp * (len(text) - 1)
    x = (W - tw) / 2
    for ch, b in zip(text, ws):
        d.text((x - b[0], (H - 186) / 2 - 22), ch, font=f, fill=(28, 40, 74), stroke_width=4, stroke_fill=(28, 40, 74)); x += (b[2] - b[0]) + sp
    cx = W / 2
    for s in (-1, 1):                                                   # 文字兩側的月桂枝（線條）
        bx = cx + s * (tw / 2 + 120)
        d.line([(bx, H * 0.78), (bx + s * 300, H * 0.5)], fill=(176, 140, 60), width=5)
        for i in range(8):
            t = i / 7.0; px = bx + s * 300 * t; py = H * 0.78 - (H * 0.28) * t
            for u in (-1, 1): d.ellipse([px + s * 10 - 22, py + u * 18 - 9, px + s * 10 + 22, py + u * 18 + 9], outline=(176, 140, 60), width=4)
    im.save(path)


BAN = os.path.join(TMP, 'ceremony_banner.png'); banner_png(BAN, TEXT)
for m in bpy.data.materials:
    if 'banner' in m.name and m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == 'TEX_IMAGE': n.image = bpy.data.images.load(BAN)

# ======================== 人群 ========================
# 遊戲的學生正式人物（vroid_npc_f1／f2／m1／m2）擺坐姿、烘成靜態網格（tools/blender/env_second/vrm_crowd.py）；
# 每個人的衣服、頭髮顏色不同（Object Info → Random）。使用者 2026-10-16 23:5x 退件後重做：原本是幾何拼的公仔（「超醜」），上層看台的家長也拿掉。
import vrm_crowd as VC   # noqa: E402
VC.TMPDIR = os.path.join(TMP, 'vrm_tmp')
CHAR = os.path.join(L.ROOT, 'assets', 'models', 'char')
SPECS = [('npc_m1', 1.72), ('npc_m2', 1.75), ('npc_f1', 1.60), ('npc_f2', 1.62)]
VARS = []
for i, (nm_, h_) in enumerate(SPECS):
    for j, pose in enumerate(('lap', 'look', 'down')):
        VARS.append(VC.seated_variant(os.path.join(CHAR, f'vroid_{nm_}.vrm'), f'crowd_{nm_}_{pose}', h_ * random.Random(i * 7 + j).uniform(0.98, 1.02), pose, lean=random.Random(i * 5 + j).uniform(-4, 6)))
coll = bpy.data.collections.new('crowd'); sc.collection.children.link(coll)
nppl = [0]


def seat_person(px, y, pz, ry, tag):
    me = VARS[rng.randrange(len(VARS))]; ob = bpy.data.objects.new(f'crowd_{tag}_{nppl[0]}', me); coll.objects.link(ob); nppl[0] += 1
    s = rng.uniform(0.97, 1.03); ob.location = g2b(px, y, pz); ob.rotation_euler = (0, 0, ry + math.pi + rng.uniform(-0.1, 0.1)); ob.scale = (s, s, s)   # VRM 面向 −z：多轉 180°


class Xf:
    """和 gym_arena.py 相同：local (x, y, z) → 區域 (px + x cos + z sin, y, pz − x sin + z cos)"""
    def __init__(self, px, pz, ry=0.0): self.px, self.pz, self.c, self.s, self.ry = px, pz, math.cos(ry), math.sin(ry), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)


# 場地的折疊椅（gym_arena.py 的 chairs()：ry π，人面向 −z）
ch = AR['sets']['ceremony']['chairs']; (xa, xb), (za, zb), (ppx, ppz) = ch['x'], ch['z'], ch['pitch']
z = za
while z <= zb + 1e-6:
    x = xa
    while x <= xb + 1e-6:
        if not any(a <= x <= b for (a, b) in ch['aisles']) and rng.random() < FILL: seat_person(x, 0.0, z, math.pi, 'floor')
        x += ppx
    z += ppz
# 下層看台（gym_arena.py 的 stand()）＋上層看台（家長，坐一部分）
AW = AR['aisles']['w']; T_, R_, H0 = SR['tread'], SR['rise'], SR['h0']; U0 = UP['front'] - 22
for sd in AR['stands']:
    side = sd['side']; t0, t1 = sd['along']
    xf = Xf(sd['front'], 0.0, math.pi / 2) if side == 'east' else Xf(sd['front'], 0.0, -math.pi / 2) if side == 'west' else Xf(0.0, sd['front'], 0.0)
    if side == 'east': t0, t1 = -t1, -t0
    al = [(-a if side == 'east' else a) for a in AR['aisles'][side]]; gap = sd.get('gap')
    def cut(a, b):
        segs = [(a, b)]
        for c in [(q - AW / 2, q + AW / 2) for q in al] + ([tuple(gap)] if gap else []):
            nxt = []
            for (u, v) in segs:
                if c[1] <= u or c[0] >= v: nxt.append((u, v)); continue
                if c[0] > u: nxt.append((u, c[0]))
                if c[1] < v: nxt.append((c[1], v))
            segs = nxt
        return segs
    for r in range(SR['rows']):
        y = H0 + r * R_; z0 = r * T_
        for (a, b) in cut(t0, t1):
            n = int((b - a - 0.1) / SR['seatPitch'])
            for k in range(n):
                sx = a + 0.05 + (k + 0.5) * (b - a - 0.1) / n
                if rng.random() < FILL * (0.97 - 0.02 * r): px, _, pz = xf.p(sx, y, z0 + 0.5); seat_person(px, y, pz, xf.ry + math.pi, side)
    # 上層看台（4、5F）不放人：使用者「開學典禮是學生要坐在座位上吧 怎麼一堆家長」
# 舞台上：七位來賓坐在來賓桌後面（面向觀眾）、一位在講台致詞——同一批人物，衣服換成深色西裝的色表
SUIT = {'top': (['#22252b', '#1e2533', '#2b2b2e', '#3a3d44'], 1.0), 'bottom': (['#22252b', '#1e2533', '#2b2b2e'], 1.0), 'shoe': (['#141414'], 1.0)}
sh = AR['sets']['stage']['h']
GUEST = [VC.seated_variant(os.path.join(CHAR, f'vroid_{nm_}.vrm'), f'guest_{nm_}', h_, 'lap', pal=SUIT) for nm_, h_ in SPECS]
for k, x in enumerate([-3.6 + i * 0.8 for i in range(7)]):
    ob = bpy.data.objects.new(f'guest_{k}', GUEST[k % 4]); coll.objects.link(ob); ob.location = g2b(x, sh, -20.15); ob.rotation_euler = (0, 0, math.pi + rng.uniform(-0.08, 0.08))
SPK = VC.seated_variant(os.path.join(CHAR, 'vroid_npc_m2.vrm'), 'speaker', 1.74, 'stand', pal=SUIT)
ob = bpy.data.objects.new('speaker', SPK); coll.objects.link(ob); ob.location = g2b(3.6, sh, -17.86); ob.rotation_euler = (0, 0, math.pi)
print('crowd', nppl[0], 'people,', len(VARS), 'variants,', sum(len(m.polygons) for m in VARS) // len(VARS), 'faces avg')

# ======================== 燈、鏡頭 ========================
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.58, 0.62, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.08
E = float(opt('--roof', '2600'))
for i, x in enumerate((-15, -5, 5, 15)):
    for j, zz in enumerate((-16, -6, 4, 14)):
        l = bpy.data.lights.new(f'roof_{i}_{j}', 'AREA'); l.energy = E; l.size = 5.0; l.color = (1.0, 0.97, 0.92)
        ob = bpy.data.objects.new(f'roof_{i}_{j}', l); ob.location = g2b(x, 19.5, zz); sc.collection.objects.link(ob)
for (x, zz) in ((-18, -4), (18, -4), (-28, 12), (28, 12)):          # 看台上方
    l = bpy.data.lights.new('stand', 'AREA'); l.energy = E * 0.7; l.size = 6.0; l.color = (1.0, 0.97, 0.92)
    ob = bpy.data.objects.new('stand', l); ob.location = g2b(x, 17.0, zz); sc.collection.objects.link(ob)
for sx in (-1, 1):                                                  # 舞台前的投射燈（暖色）
    l = bpy.data.lights.new('stage', 'SPOT'); l.energy = float(opt('--stage', '9000')); l.color = (1.0, 0.88, 0.72); l.spot_size = math.radians(48); l.spot_blend = 0.6; l.shadow_soft_size = 0.4
    ob = bpy.data.objects.new('stage', l); ob.location = g2b(sx * 9.0, 13.0, -4.0); sc.collection.objects.link(ob)
    ob.rotation_euler = (g2b(sx * 1.0, 2.5, -19.0) - g2b(sx * 9.0, 13.0, -4.0)).to_track_quat('-Z', 'Y').to_euler()
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
eye, look = (0.35, 1.62, 15.2), (0.0, 4.6, -21.0)
if '--eye' in A_: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))
cam.data.lens = float(opt('--lens', '28')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
if '--nodof' not in A_:                                             # 景深：對焦在舞台，前面幾排的頭稍微糊（像相機拍的）
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = float(opt('--dof', str(round((Vector(eye) - Vector((0.0, 3.0, -18.0))).length, 1)))); cam.data.dof.aperture_fstop = float(opt('--fstop', '5.6'))
# 大螢幕：轉播講台（BB-B 23:43：待機的藍色波紋太亮、比舞台搶眼；真的典禮大螢幕放的是講台的畫面）。
# 另一台鏡頭先拍講台和致詞的人（中景），稍微模糊、看不出臉，亮度壓到和舞台差不多，再貼回螢幕
if '--noscreenfeed' not in A_:
    cam2 = bpy.data.objects.new('feedcam', bpy.data.cameras.new('feedcam')); sc.collection.objects.link(cam2)
    sh_ = AR['sets']['stage']['h']; cam2.data.lens = 70; cam2.location = g2b(2.2, sh_ + 1.75, -11.5)
    cam2.rotation_euler = (g2b(3.6, sh_ + 1.35, -17.9) - g2b(2.2, sh_ + 1.75, -11.5)).to_track_quat('-Z', 'Y').to_euler()
    keep = (sc.camera, sc.render.resolution_x, sc.render.resolution_y, sc.cycles.samples, sc.render.filepath)
    sc.camera = cam2; sc.render.resolution_x, sc.render.resolution_y = 960, 400; sc.cycles.samples = min(SAMPLES, 32)
    FEED = os.path.join(TMP, 'screen_feed.png'); sc.render.filepath = FEED; sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    sc.camera, sc.render.resolution_x, sc.render.resolution_y, sc.cycles.samples, sc.render.filepath = keep
    im_ = Image.open(FEED).convert('RGB').filter(ImageFilter.GaussianBlur(3.0)); im_ = Image.eval(im_, lambda v: int(v * 0.8)); im_.save(FEED)
    for m in bpy.data.materials:
        if 'screen' in m.name and m.use_nodes and 'SET_' not in m.name:
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE': n.image = bpy.data.images.load(FEED)
                if n.type == 'BSDF_PRINCIPLED': n.inputs['Emission Strength'].default_value = 0.55
    for ob in bpy.data.objects:
        if 'glow' in ob.name and 'screen' in ob.name: ob.hide_render = True   # 螢幕前面的藍色光暈卡
sc.render.filepath = OUT; sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('saved', OUT)
