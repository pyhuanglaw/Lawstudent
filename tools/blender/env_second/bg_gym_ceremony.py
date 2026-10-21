"""2D 背景：新體育館 3F 主球場的典禮（ART-GYM-BG1；8/31 開學典禮，之後大四畢業典禮 CG-9 換橫幅共用）。LAWWW2-B 2026-10-16。
從遊戲的 3F 主球場模型（assets/models/env/second_ai/gym_arena.glb，tools/blender/env_second/gym_arena.py）算圖：
- 打開舞台（SET_STAGE）＋典禮布置（SET_CEREMONY），藏起演講、演唱會布置。
- 背板的米色長布換成寫「開學典禮」的版本（--text；不寫校名、不放校徽，D77）。
- 場地的折疊椅、下層看台坐滿新生；上層看台（4、5F）空著。
  人物是遊戲的學生正式人物（vroid_npc_f1／f2／m1／m2）擺坐姿（vrm_crowd.py），衣服、頭髮顏色每個人不同。
  v1（3eb86bfb）用幾何拼的公仔、上層看台放家長，使用者 2026-10-16 23:5x 退件：「開學典禮是學生要坐在座位上吧 怎麼一堆家長 而且超醜!!!」
- 舞台：七位來賓、講台致詞的人（同一批人物、深色西裝色表）；大螢幕轉播講台（另一台鏡頭先拍、模糊、壓暗）。
- 白天室內燈光：屋頂的燈（面光源）＋舞台前的暖色投射燈。
--grad（LAWWW2-C 2026-10-17，SCN-V5-02／G6 校級畢業典禮；BG-23 寫的「換橫幅、換學士服共用」）：
- 背板「畢業典禮／Commencement」，杜鵑換成六月的鳳凰花（紅橙）；
- 學生穿黑色學士服（衣服、褲子全黑）、戴方帽（帽板＋流蘇），背上的披肩顏色每個人不同（校級典禮是全校各學院；不照真實學院配色）；
- 上層看台（4、5F）坐一部分家長（便服）：畢業典禮家長會來（開學典禮被退件的是「一堆家長」，畢業典禮相反）。
用法：
  /opt/blenv/bin/python tools/blender/env_second/bg_gym_ceremony.py -- <輸出.png> [--res 1920x1080] [--samples 96] [--text 開學典禮] [--grad]
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
GRAD = '--grad' in A_
TEXT = opt('--text', '畢業典禮' if GRAD else '開學典禮'); FILL = float(opt('--fill', '0.93'))
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

# ======================== v3：照使用者給的實際開學典禮照片（2026-10-17 00:2x）佈置舞台 ========================
# 紅地毯舞台＋正面一整排台階、淡色插畫背板（校園建築＋杜鵑花＋「開學典禮」；不寫校名、不放校徽，D77）、背板外框燈架＋燈、兩側紅綠吊旗。
# 原本的深藍布幕、布幕上的米色長布、布幕鋼架藏起來。
if '--v2stage' not in A_:
    for ob in bpy.data.objects:
        if any(ob.name.startswith(k) for k in ('SET_STAGE_drape', 'SET_STAGE_steel', 'SET_CEREMONY_banner')): ob.hide_render = True
    def flatmat(name, hexc, rough=0.8, metal=0.0, emit=0.0, img=None):
        m = bpy.data.materials.new(name); nt = m.node_tree; bs = nt.nodes['Principled BSDF']
        c = tuple((int(hexc.lstrip('#')[i:i + 2], 16) / 255.0) ** 2.2 for i in (0, 2, 4)) + (1.0,)
        bs.inputs['Base Color'].default_value = c; bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
        if img:
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(img); nt.links.new(t.outputs['Color'], bs.inputs['Base Color'])
            if emit: nt.links.new(t.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
        elif emit: bs.inputs['Emission Color'].default_value = c; bs.inputs['Emission Strength'].default_value = emit
        return m
    CARPET = flatmat('v3_carpet', '#9a1f26', 0.92)
    for m in bpy.data.materials:                                       # 舞台台面＝紅地毯、裙板＝深紅
        if m.name.endswith('stage_deck'):
            m.node_tree.nodes.clear(); o_ = m.node_tree.nodes.new('ShaderNodeOutputMaterial'); b_ = m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
            b_.inputs['Base Color'].default_value = CARPET.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value; b_.inputs['Roughness'].default_value = 0.92
            m.node_tree.links.new(b_.outputs[0], o_.inputs[0])
        if m.name.endswith('stage_skirt'): m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.11, 0.012, 0.016, 1)
    sg = AR['sets']['stage']; X0s, X1s, Z0s, Z1s, Hs = sg['x0'], sg['x1'], sg['z0'], sg['z1'], sg['h']

    def box(name, mat, x0, x1, y0, y1, z0, z1):
        me = bpy.data.meshes.new(name); bm = bmesh.new()
        vs = [bm.verts.new(g2b(x, y, z)) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
        for f in ((0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)): bm.faces.new([vs[i] for i in f])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); return ob

    def cylz(name, mat, a, b_, r, seg=10):
        a, b_ = Vector(g2b(*a)), Vector(g2b(*b_)); d = b_ - a
        bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(a + b_) / 2)
        ob = bpy.context.object; ob.name = name; ob.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); ob.data.materials.append(mat); return ob

    # 正面台階：三層、每層只做自己那一層（不疊面）；整片紅地毯
    for L_ in range(3):
        box(f'v3_step{L_}', CARPET, X0s, X1s, L_ * Hs / 4, (L_ + 1) * Hs / 4, Z1s - 0.05, Z1s + (3 - L_) * 0.32)
    box('v3_step_nose', flatmat('v3_nose', '#c9a35a', 0.4, 0.6), X0s, X1s, 3 * Hs / 4 - 0.015, 3 * Hs / 4 + 0.004, Z1s + 0.32 - 0.03, Z1s + 0.32 + 0.004)
    # 背板：淡色插畫（PIL 畫：天空漸層、校園建築的剪影、杜鵑花、「開學典禮」）
    def backdrop_png(path):
        W, H = 2400, 846; im = Image.new('RGB', (W, H)); px = im.load()
        top, bot = (252, 246, 236), (248, 228, 222)
        for y in range(H):
            t = y / H; c = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3))
            for x in range(W): px[x, y] = c
        d = ImageDraw.Draw(im); rr = random.Random(77)
        for cx, cy, r, col in ((420, 600, 330, (190, 214, 182)), (1980, 610, 340, (182, 210, 176)), (650, 640, 240, (166, 198, 158)), (1760, 650, 250, (160, 196, 152))):
            d.ellipse([cx - r, cy - r * 0.8, cx + r, cy + r * 0.8], fill=col)               # 後面的樹
        bx0, bx1, gy = 690, 1710, 770; br, brd, lt = (221, 146, 112), (184, 112, 82), (246, 218, 196)
        d.rectangle([bx0, 470, bx1, gy], fill=br, outline=brd, width=4)                     # 主量體
        d.rectangle([bx0 - 12, 452, bx1 + 12, 474], fill=(200, 124, 92))                     # 簷口
        n = 12; aw = (bx1 - bx0) / n
        for k in range(n):                                                                   # 一樓拱廊、二樓窗
            ax0 = bx0 + k * aw + aw * 0.18; ax1 = bx0 + (k + 1) * aw - aw * 0.18
            d.rectangle([ax0, 650, ax1, gy], fill=lt); d.ellipse([ax0, 650 - (ax1 - ax0) / 2, ax1, 650 + (ax1 - ax0) / 2], fill=lt)
            d.rectangle([ax0 + 6, 515, ax1 - 6, 585], fill=(250, 232, 214), outline=brd, width=2)
        cx0, cx1 = 1060, 1340
        d.rectangle([cx0, 370, cx1, gy], fill=(230, 160, 124), outline=brd, width=4)         # 中央塔樓
        d.polygon([(cx0 - 18, 372), (cx1 + 18, 372), (1200, 300)], fill=(205, 128, 96), outline=brd)
        d.rectangle([1165, 250, 1235, 302], fill=(230, 160, 124), outline=brd, width=3); d.ellipse([1158, 212, 1242, 272], fill=(196, 120, 88), outline=brd, width=3)
        d.rectangle([1150, 610, 1250, gy], fill=lt); d.ellipse([1150, 560, 1250, 660], fill=lt)   # 大門的拱
        d.polygon([(1130, gy), (1270, gy), (1500, H), (900, H)], fill=(240, 224, 206))        # 門前的路
        d.rectangle([0, gy, W, gy + 6], fill=(214, 196, 176))
        for side in (0, 1):                                                                   # 杜鵑花叢
            xa, xb = (0, 640) if side == 0 else (1760, W)
            for _ in range(260):
                x = rr.uniform(xa, xb); y = rr.uniform(560 + abs((x - (xa + xb) / 2)) * -0.15, H + 20); r = rr.uniform(14, 30)
                d.ellipse([x - r * 1.4, y - r * 0.8, x + r * 1.4, y + r * 0.8], fill=rr.choice([(111, 158, 106), (134, 181, 125), (96, 140, 92)]))
            for _ in range(420 if not GRAD else 160):                                        # 畢業典禮（六月）：花叢的花少一點、換成紅橙
                x = rr.uniform(xa, xb); y = rr.uniform(590, H + 10); r = rr.uniform(9, 17)
                c = rr.choice([(244, 166, 193), (238, 143, 179), (249, 198, 214), (255, 250, 250), (233, 119, 159)] if not GRAD else [(232, 86, 52), (244, 122, 62), (214, 66, 44), (250, 164, 92)])
                for k in range(5):
                    a = k * 2 * math.pi / 5 + rr.random(); d.ellipse([x + math.cos(a) * r * 0.7 - r * 0.6, y + math.sin(a) * r * 0.7 - r * 0.6, x + math.cos(a) * r * 0.7 + r * 0.6, y + math.sin(a) * r * 0.7 + r * 0.6], fill=c)
                d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(240, 210, 120))
        if GRAD:                                                                              # 鳳凰木：後面的樹冠上一團團紅橙的花
            for cx, cy, r in ((420, 600, 330), (1980, 610, 340), (650, 640, 240), (1760, 650, 250)):
                for _ in range(int(r * 0.9)):
                    a = rr.uniform(0, 2 * math.pi); q = rr.random() ** 0.6; x = cx + math.cos(a) * r * q; y = cy + math.sin(a) * r * 0.8 * q
                    if y > 640 and (x < 700 or x > 1700): pass
                    rad = rr.uniform(8, 18); d.ellipse([x - rad, y - rad * 0.7, x + rad, y + rad * 0.7], fill=rr.choice([(226, 78, 46), (240, 108, 56), (206, 58, 40), (248, 150, 80)]))
        f1 = ImageFont.truetype(FONT, 150); f2 = ImageFont.truetype(FONT, 46)
        t1 = TEXT; sp = 40; ws = [d.textbbox((0, 0), ch, font=f1) for ch in t1]; tw = sum(b[2] - b[0] for b in ws) + sp * (len(t1) - 1); x = (W - tw) / 2
        for ch, b in zip(t1, ws): d.text((x - b[0], 40), ch, font=f1, fill=(92, 62, 45), stroke_width=3, stroke_fill=(92, 62, 45)); x += (b[2] - b[0]) + sp
        t2 = 'Commencement' if GRAD else 'Opening Ceremony'; b2 = d.textbbox((0, 0), t2, font=f2); d.text(((W - (b2[2] - b2[0])) / 2, 222), t2, font=f2, fill=(138, 104, 82))
        d.rectangle([14, 14, W - 14, H - 14], outline=(214, 182, 150), width=6)
        im.filter(ImageFilter.GaussianBlur(0.8)).save(path)
    BDP = os.path.join(TMP, 'v3_backdrop.png'); backdrop_png(BDP)
    bdm = flatmat('v3_backdrop', '#ffffff', 0.85, emit=0.12, img=BDP)
    me = bpy.data.meshes.new('v3_backdrop'); bm = bmesh.new()
    vs = [bm.verts.new(g2b(x, y, Z0s + 0.2)) for (x, y) in ((-10.5, Hs), (10.5, Hs), (10.5, Hs + 7.4), (-10.5, Hs + 7.4))]
    f = bm.faces.new(vs); uv = bm.loops.layers.uv.new()
    for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = (u, v)
    bm.to_mesh(me); bm.free(); me.materials.append(bdm); ob = bpy.data.objects.new('v3_backdrop', me); sc.collection.objects.link(ob)
    # 背板外框的鋁燈架（方形桁架）＋上面掛的燈
    AL = flatmat('v3_truss', '#c9ccd0', 0.35, 0.6); BLK = flatmat('v3_can', '#16171a', 0.5, 0.3); LENS = flatmat('v3_lens', '#fff1d6', 0.2, emit=6.0)
    def truss(a, b_, w=0.3):
        a, b_ = Vector(a), Vector(b_); d_ = (b_ - a); L__ = d_.length; u = d_.normalized()
        s1 = Vector((0, 1, 0)) if abs(u.y) < 0.9 else Vector((1, 0, 0)); s1 = (s1 - u * s1.dot(u)).normalized(); s2 = u.cross(s1)
        offs = [(s1 + s2) * w / 2, (s1 - s2) * w / 2, (-s1 - s2) * w / 2, (-s1 + s2) * w / 2]
        for o in offs: cylz('v3_truss', AL, tuple(a + o), tuple(b_ + o), 0.025, 8)
        n_ = max(1, int(L__ / 0.5))
        for k in range(n_):
            p0 = a + d_ * (k / n_); p1 = a + d_ * ((k + 1) / n_)
            for i in range(4): cylz('v3_truss_d', AL, tuple(p0 + offs[i]), tuple(p1 + offs[(i + 1) % 4]), 0.012, 6)
    TY = Hs + 8.0
    truss((-11.2, 0.0, Z0s + 0.5), (-11.2, TY, Z0s + 0.5)); truss((11.2, 0.0, Z0s + 0.5), (11.2, TY, Z0s + 0.5)); truss((-11.2, TY, Z0s + 0.5), (11.2, TY, Z0s + 0.5))
    for k in range(14):
        x = -9.75 + k * 1.5; can = cylz('v3_can', BLK, (x, TY - 0.2, Z0s + 0.5), (x, TY - 0.55, Z0s + 0.75), 0.11, 12)
        cylz('v3_lens', LENS if k % 2 == 0 else flatmat(f'v3_lens_{k}', ['#ff8fb0', '#8fd0ff', '#ffd27a'][k % 3], 0.2, emit=4.0), (x, TY - 0.55, Z0s + 0.75), (x, TY - 0.57, Z0s + 0.76), 0.095, 12)
    # 兩側紅綠吊旗（素面，不放校徽）
    for sx in (-1, 1):
        for k in range(4):
            x = sx * (12.2 + k * 1.45); col = ['#b3262a', '#2f6b3a'][k % 2]
            box(f'v3_flag_{sx}_{k}', flatmat(f'v3_flag_{sx}_{k}', col, 0.85), x - 0.55, x + 0.55, 1.4, 5.0, Z0s + 0.9, Z0s + 0.92)
            box(f'v3_flagbar_{sx}_{k}', flatmat('v3_gold', '#c9a35a', 0.4, 0.6), x - 0.62, x + 0.62, 5.0, 5.08, Z0s + 0.88, Z0s + 0.95)
            cylz('v3_flagpole', AL, (x, 0.0, Z0s + 1.0), (x, 5.3, Z0s + 1.0), 0.025, 8)

# ======================== 人群 ========================
# 遊戲的學生正式人物（vroid_npc_f1／f2／m1／m2）擺坐姿、烘成靜態網格（tools/blender/env_second/vrm_crowd.py）；
# 每個人的衣服、頭髮顏色不同（Object Info → Random）。使用者 2026-10-16 23:5x 退件後重做：原本是幾何拼的公仔（「超醜」），上層看台的家長也拿掉。
import vrm_crowd as VC   # noqa: E402
VC.TMPDIR = os.path.join(TMP, 'vrm_tmp')
CHAR = os.path.join(L.ROOT, 'assets', 'models', 'char')
SPECS = [('npc_m1', 1.72), ('npc_m2', 1.75), ('npc_f1', 1.60), ('npc_f2', 1.62)]
VARS = []
# ---- 畢業典禮（--grad）：學士服、方帽、披肩
GOWN = {'top': (['#141417'] * 6 + ['#1b1b1f'] * 3 + ['#202026'], 1.0), 'bottom': (['#141417'] * 3 + ['#1b1b1f'], 5.29),
        'shoe': (['#1c1c1e'] * 4 + ['#3a2a20', '#f1f1ee'], 11.3), 'hair': (['#0b0a09'] * 6 + ['#120e0c'] * 4 + ['#1e1611'] * 2 + ['#3a2a1e'], 7.13)}
HOOD = ['#f2efe6', '#d9b44a', '#8fb3d9', '#5f8f5a', '#e08a3a', '#7a5a9a', '#b8343a', '#9a9a9a', '#2f5d8c', '#e6c7d0']   # 披肩顏色：全校各學院混在一起（不照真實的學院配色）


def grad_mats():
    if 'grad_cap' in bpy.data.materials: return bpy.data.materials['grad_cap'], bpy.data.materials['grad_hood'], bpy.data.materials['grad_tassel']
    cap = bpy.data.materials.new('grad_cap'); b = cap.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.012, 0.012, 0.014, 1); b.inputs['Roughness'].default_value = 0.55
    hood = bpy.data.materials.new('grad_hood'); nt = hood.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = 0.6
    rp = VC.ramp_node(nt, HOOD, 3.71); nt.links.new(rp.outputs['Color'], b.inputs['Base Color'])
    ts = bpy.data.materials.new('grad_tassel'); b = ts.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.62, 0.45, 0.12, 1); b.inputs['Roughness'].default_value = 0.5
    return cap, hood, ts


def add_grad(me, pitch):
    """方帽（帽身＋帽板＋流蘇）跟著頭的低頭角度；披肩貼著背（上寬下窄的 U），每個人的顏色由材質的 Object Info → Random 決定。網格面向 +y（Blender）"""
    cap, hood, ts = grad_mats()
    ci = len(me.materials); me.materials.append(cap); me.materials.append(hood); me.materials.append(ts)
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    pts = [v.co.copy() for v in bm.verts]; top = max(p.z for p in pts)
    head = [p for p in pts if p.z > top - 0.06]; hx = sum(p.x for p in head) / len(head); hy = sum(p.y for p in head) / len(head)
    piv = Vector((hx, hy, top - 0.05)); R = Matrix.Rotation(math.radians(-pitch * 0.8), 4, 'X')
    def add_box(c, sx, sy, sz, mi, rot=None):
        r_ = bmesh.ops.create_cube(bm, size=1.0)['verts']
        for v in r_:
            v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz)) + c
            if rot is not None: v.co = piv + (rot @ (v.co - piv))
        for f in {f for v in r_ for f in v.link_faces}: f.material_index = mi
    def add_cyl(a, b_, r, mi, seg=10, rot=None):
        d = b_ - a; res = bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=d.length)
        q = d.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4(); mid = (a + b_) / 2
        for v in res['verts']:
            v.co = mid + (q @ v.co)
            if rot is not None: v.co = piv + (rot @ (v.co - piv))
        for f in {f for v in res['verts'] for f in v.link_faces}: f.material_index = mi
    add_cyl(Vector((hx, hy, top - 0.075)), Vector((hx, hy, top + 0.004)), 0.098, ci, seg=14, rot=R)          # 帽身
    add_box(Vector((hx, hy, top + 0.011)), 0.25, 0.25, 0.012, ci, rot=R)                                     # 帽板
    add_cyl(Vector((hx + 0.12, hy - 0.05, top + 0.012)), Vector((hx + 0.125, hy - 0.06, top - 0.11)), 0.006, ci + 2, seg=5, rot=R)   # 流蘇
    # 披肩（第二版）：從兩肩往背中間收成 V 形的彩色滾邊（第一版整塊填色的梯形，近看像背了一塊牌子）；V 裡面就是黑色的學士服
    body = [p for p in pts if top - 0.56 < p.z < top - 0.2]
    def onback(x, z):
        near = [p.y for p in body if abs(p.x - x) < 0.03 and abs(p.z - z) < 0.03]
        return Vector((x, (min(near) if near else hy - 0.12) - 0.007, z))
    BW, NSEG = 0.05, 6
    for sx in (-1, 1):
        a = Vector((hx + sx * 0.135, 0, top - 0.25)); b = Vector((hx, 0, top - 0.47))   # 肩上 → 背中間（x、z；y 之後貼背）
        d = (b - a); d.y = 0; d.normalize(); nrm = Vector((-d.z, 0, d.x))                 # 在背面上和帶子垂直的方向
        rows = []
        for k in range(NSEG + 1):
            c = a + (b - a) * (k / NSEG); w = BW * (1 - 0.35 * k / NSEG)
            rows.append([bm.verts.new(onback(c.x + nrm.x * w * t, c.z + nrm.z * w * t)) for t in (-0.5, 0.5)])
        for k in range(NSEG):
            f = bm.faces.new((rows[k][0], rows[k + 1][0], rows[k + 1][1], rows[k][1])); f.material_index = ci + 1
    bm.to_mesh(me); bm.free()

for i, (nm_, h_) in enumerate(SPECS):
    for j, pose in enumerate(('lap', 'look', 'down')):
        VARS.append(VC.seated_variant(os.path.join(CHAR, f'vroid_{nm_}.vrm'), f'crowd_{nm_}_{pose}', h_ * random.Random(i * 7 + j).uniform(0.98, 1.02), pose, lean=random.Random(i * 5 + j).uniform(-4, 6), pal=GOWN if GRAD else VC.FRESHMEN))
        if GRAD: add_grad(VARS[-1], VC.POSES[pose]['head'][1])
coll = bpy.data.collections.new('crowd'); sc.collection.children.link(coll)
nppl = [0]


PARENTS = []
if GRAD:
    for i, (nm_, h_) in enumerate(SPECS):
        PARENTS.append(VC.seated_variant(os.path.join(CHAR, f'vroid_{nm_}.vrm'), f'parent_{nm_}', h_ * 0.99, ('lap', 'look')[i % 2], lean=2.0))


def seat_parent(px, y, pz, ry):
    me = PARENTS[rng.randrange(len(PARENTS))]; ob = bpy.data.objects.new(f'parent_{nppl[0]}', me); coll.objects.link(ob); nppl[0] += 1
    ob.location = g2b(px, y, pz); ob.rotation_euler = (0, 0, ry + math.pi + rng.uniform(-0.15, 0.15))


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
    # 上層看台（4、5F）：開學典禮不放人（使用者「開學典禮是學生要坐在座位上吧 怎麼一堆家長」）；畢業典禮坐一部分家長（便服）
    if GRAD:
        for r in range(UP['rows']):
            y = UP['h0'] + r * UP['rise']; z0 = U0 + r * UP['tread']
            for (a, b) in cut(t0, t1):
                n = int((b - a - 0.1) / SR['seatPitch'])
                for k in range(n):
                    sx = a + 0.05 + (k + 0.5) * (b - a - 0.1) / n
                    if rng.random() < 0.5 - 0.02 * r: px, _, pz = xf.p(sx, y, z0 + 0.45); seat_parent(px, y, pz, xf.ry + math.pi)
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
