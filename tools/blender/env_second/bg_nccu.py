"""2D 背景：政大（outings3d.js 的 OUT.BG.nccu_gate「政大・校門口」、nccu_food「政大・山下的小吃街」）。
LAWWW2-B 2026-10-15；使用者試玩 v9.7 回報第 11 項「去政大找可昕完全沒有畫面」（現在 image:null＝深色底）。LAWWW-B 23:34Z 分派 B。
Blender 5.2（bpy，無介面）＋Cycles（CPU），1920×1080，畫面上沒有人（人物用 ADV 立繪疊上去），做法照 bg_noodle_table.py。
**政大是真實的學校**：這兩張是「參考政大山下生活圈」的原創場景——不放校徽、校名、真實店名；小吃店名全部虛構（wz_street.py 的 NCCU_FOOD）。
  校門口：指南路（雙向、斑馬線）對面的校門——低矮的石材牆、兩根門柱、中間寬的入口、門後的大樹與系館，後面是山（「法學院。山。也是山。」）。
  山下的小吃街：兩側老公寓、一樓小吃店（招牌亮著、店裡暖色的燈），停滿機車的窄巷，巷底看得到山。
時間：傍晚（天空還有一點亮、店和路燈已經亮了）——事件有下午出發（K1 導遊）也有晚上 19:30（K1b），一張圖兩種都說得通。
用法：
  /opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --set nccu_food --out <暫存>/nccu_food_street.glb
  /opt/blenv/bin/python tools/blender/env_second/bg_nccu.py -- food <暫存>/nccu_food_street.glb <輸出.png> [--res 1920x1080] [--samples 64]
  /opt/blenv/bin/python tools/blender/env_second/bg_nccu.py -- gate - <輸出.png> [--res …] [--samples …]
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector, noise
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
SCENE, GLB, OUT = A[0], A[1], A[2]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '64'))
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ENV2 = os.path.join(ROOT, 'assets/models/env/second_ai')
TEXD = os.path.join(ROOT, 'tools/blender/textures')
TMP = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'bg_nccu_tex'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
g2b = lambda x, y, z: Vector((x, -z, y))
rng = random.Random(1015)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
sc.view_settings.exposure = float(opt('--exposure', '0.3'))
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 64


# ---------------------------------------------------------------- 材質小工具
def mat_flat(name, col, rough=0.7, emit=None, estr=0.0, metal=0.0):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; b = mt.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit is not None:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return mt


def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


def mat_tex(name, folder, scale=1.0, tint=None, rough=0.8):
    """Poly Haven CC0 貼圖（tools/blender/textures/<folder>/：*_diff*、*_nor_gl*）＋物件座標投影"""
    d = os.path.join(TEXD, folder); fs = os.listdir(d)
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    dif = next((f for f in fs if 'diff' in f), None)
    if dif:
        tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(d, dif)); tx.projection = 'BOX'; tx.projection_blend = 0.2
        nt.links.new(mp.outputs['Vector'], tx.inputs['Vector'])
        if tint:
            mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs['Fac'].default_value = 1.0; mx.inputs['Color2'].default_value = (*tint, 1)
            nt.links.new(tx.outputs['Color'], mx.inputs['Color1']); nt.links.new(mx.outputs['Color'], b.inputs['Base Color'])
        else: nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    nor = next((f for f in fs if 'nor_gl' in f), None)
    if nor:
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(os.path.join(d, nor)); tn.image.colorspace_settings.name = 'Non-Color'; tn.projection = 'BOX'
        nt.links.new(mp.outputs['Vector'], tn.inputs['Vector']); nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 0.6
        nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = rough
    return mt


def mat_img(name, path, estr=0.0, rough=0.75):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path)
    nt.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if estr > 0: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = estr
    return mt


def mesh_obj(name, verts, faces, mat, uvs=None, smooth=False):
    me = bpy.data.meshes.new(name); me.from_pydata([g2b(*v) for v in verts], [], faces)
    if uvs is not None:
        me.uv_layers.new(); ul = me.uv_layers[0].data; k = 0
        for f in faces:
            for vi in f: ul[k].uv = uvs[vi]; k += 1
    if smooth: me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me); ob.data.materials.append(mat); sc.collection.objects.link(ob); return ob


def box(name, x0, x1, y0, y1, z0, z1, mat):
    V = [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), (x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]
    F = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    return mesh_obj(name, V, F, mat)


def quad(name, p0, p1, p2, p3, mat):
    return mesh_obj(name, [p0, p1, p2, p3], [(0, 1, 2, 3)], mat, uvs=[(0, 0), (1, 0), (1, 1), (0, 1)])


# ---------------------------------------------------------------- 山（巷底、校門後面）
def hills(z_near, x_span, layers):
    """山（台北盆地邊緣、長滿樹的圓緩山稜）：每一層是一片從山腳往後升到稜線的曲面；稜線＝幾個頻率的雜訊（圓緩，不是尖錐），
    表面是森林的顏色＋小尺度的雜訊（樹冠一團一團）；越遠越淡、越藍（空氣透視）"""
    for k, (dz, hmax, col, seed) in enumerate(layers):
        nx, nz = 160, 16; V = []; F = []; depth = 140.0
        def crest(x):
            n = 0.55 * noise.noise(Vector((x / 140.0, seed, 0.3))) + 0.3 * noise.noise(Vector((x / 55.0, seed + 7, 0.1))) + 0.15 * noise.noise(Vector((x / 22.0, seed + 3, 0.7)))
            return hmax * (0.62 + 0.55 * n)
        for j in range(nz + 1):
            t = j / nz; zz = z_near - dz - t * depth
            prof = math.sin(min(1.0, t * 1.25) * math.pi / 2) ** 1.3          # 山腳 0 → 稜線 1（前坡），稜線以後持平
            for i in range(nx + 1):
                x = -x_span + 2 * x_span * i / nx
                V.append((x, crest(x) * prof - 3.0 + 2.0 * noise.noise(Vector((x / 9.0, zz / 9.0, seed))), zz))
        for j in range(nz):
            for i in range(nx):
                a = j * (nx + 1) + i; F.append((a, a + 1, a + nx + 2, a + nx + 1))
        mt = bpy.data.materials.new(f'hill{k}'); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
        tc = nt.nodes.new('ShaderNodeTexCoord')
        n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 0.22; n1.inputs['Detail'].default_value = 10.0; n1.inputs['Roughness'].default_value = 0.7
        nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
        vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 0.9; nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])   # 樹冠一團一團
        ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.3; ramp.color_ramp.elements[1].position = 0.75
        ramp.color_ramp.elements[0].color = (*[c * 0.6 for c in col], 1); ramp.color_ramp.elements[1].color = (*[min(1, c * 1.3) for c in col], 1)
        mix = nt.nodes.new('ShaderNodeMath'); mix.operation = 'MULTIPLY_ADD'; mix.inputs[1].default_value = 0.5
        nt.links.new(vo.outputs['Distance'], mix.inputs[0]); nt.links.new(n1.outputs['Fac'], mix.inputs[2])
        nt.links.new(mix.outputs[0], ramp.inputs['Fac']); nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
        bm_ = nt.nodes.new('ShaderNodeBump'); bm_.inputs['Strength'].default_value = 0.45; bm_.inputs['Distance'].default_value = 0.6
        nt.links.new(vo.outputs['Distance'], bm_.inputs['Height']); nt.links.new(bm_.outputs['Normal'], b.inputs['Normal'])
        b.inputs['Roughness'].default_value = 0.95
        mesh_obj(f'hill{k}', V, F, mt, smooth=True)


# ---------------------------------------------------------------- 招牌、店內景深卡的字（GLB 的 SIGN_FACE_* 是空白板面）
def sign_img(p, w_m, h_m):
    W = 1024; H = max(64, round(W * h_m / max(w_m, 0.05)))
    im = Image.new('RGB', (W, H), p.get('bg', '#3b2a1e')); d = ImageDraw.Draw(im); fg = p.get('color', '#f4ead8')
    if p.get('band'): d.rectangle([0, H - round(H * 0.14), W, H], fill=p['band'])
    d.rectangle([6, 6, W - 7, H - 7], outline=fg, width=4)
    name, sub = p.get('sign', ''), p.get('sub', '')
    fs = round(H * (0.52 if sub else 0.62)); f = ImageFont.truetype(FONT, fs)
    while fs > 12 and d.textlength(name, font=f) > W * 0.8: fs -= 2; f = ImageFont.truetype(FONT, fs)
    d.text((W / 2, H * (0.42 if sub else 0.5)), name, fill=fg, font=f, anchor='mm', stroke_width=2, stroke_fill=fg)
    if sub:
        f2 = ImageFont.truetype(FONT, max(12, round(H * 0.2)))
        d.text((W / 2, H * 0.78), sub, fill=fg, font=f2, anchor='mm')
    return im


def vsign_img(p, w_m, h_m):
    H = 768; W = max(64, round(H * w_m / max(h_m, 0.05)))
    im = Image.new('RGB', (W, H), p.get('vBg', '#ffffff')); d = ImageDraw.Draw(im); col = p.get('vColor', '#b0332a')
    d.rectangle([0, 0, W, round(H * 0.05)], fill=p.get('vBand', col)); d.rectangle([0, H - round(H * 0.05), W, H], fill=p.get('vBand', col))
    ch = list(p.get('vertical', '')); n = max(1, len(ch)); fs = round(min(W * 0.78, H * 0.85 / n)); f = ImageFont.truetype(FONT, fs)
    for i, c in enumerate(ch): d.text((W / 2, H * 0.08 + fs * 0.55 + i * fs * 1.04), c, fill=col, font=f, anchor='mm', stroke_width=1, stroke_fill=col)
    return im


INTERIOR = {'noodle': ('#f3d9a8', '#8a3b2e'), 'teishoku': ('#f1dcb0', '#6b4a2e'), 'tea': ('#eef2e6', '#2f7d5b'), 'cafe': ('#e9cfa6', '#4a3424')}


def interior_img(kind, w_m, h_m):
    """店內景深卡：暖色的燈、牆上的菜單板、櫃台、幾張桌椅的剪影（沒有人）"""
    W = 1024; H = max(64, round(W * h_m / max(w_m, 0.05))); wall, acc = INTERIOR.get(kind, ('#f1dcb0', '#6b4a2e'))
    im = Image.new('RGB', (W, H), wall); d = ImageDraw.Draw(im)
    for y in range(H):                                                       # 上亮下暗
        t = y / H; c = tuple(int(v * (1.05 - 0.35 * t)) for v in Image.new('RGB', (1, 1), wall).getpixel((0, 0)))
        d.line([(0, y), (W, y)], fill=tuple(min(255, v) for v in c))
    mx = rng.uniform(0.15, 0.45) * W
    d.rectangle([mx, H * 0.12, mx + W * 0.36, H * 0.34], fill=acc)        # 菜單板
    for i in range(4): d.rectangle([mx + W * 0.03, H * (0.16 + i * 0.045), mx + W * 0.33, H * (0.16 + i * 0.045) + H * 0.018], fill='#f4ead8')
    for k in range(5):                                                       # 吊燈
        x = W * (0.1 + 0.2 * k); d.ellipse([x - 14, H * 0.05, x + 14, H * 0.05 + 22], fill='#fff4d8')
    d.rectangle([W * 0.55, H * 0.55, W * 0.97, H * 0.72], fill='#b9b2a6'); d.rectangle([W * 0.55, H * 0.52, W * 0.97, H * 0.56], fill='#e6e1d8')   # 櫃台（不鏽鋼）
    for k in range(3):                                                       # 桌子＋圓凳
        x = W * (0.08 + 0.15 * k); d.rectangle([x, H * 0.66, x + W * 0.11, H * 0.69], fill='#7a5a3a'); d.rectangle([x + W * 0.05, H * 0.69, x + W * 0.06, H * 0.86], fill='#4a3a2a')
        for s in (-1, 1): d.ellipse([x + W * 0.055 + s * W * 0.07 - 16, H * 0.78, x + W * 0.055 + s * W * 0.07 + 16, H * 0.8], fill='#c9463d')
    d.rectangle([0, H * 0.86, W, H], fill='#8a8276')
    return im


def paint_faces():
    for o in list(sc.objects):
        if o.type != 'MESH' or 'FACE' not in o.name: continue
        vs = [o.matrix_world @ v.co for v in o.data.vertices]
        xs, ys, zs = [v.x for v in vs], [v.y for v in vs], [v.z for v in vs]
        w_m = math.hypot(max(xs) - min(xs), max(ys) - min(ys)); h_m = max(zs) - min(zs)
        p = {k: o[k] for k in o.keys() if isinstance(o[k], (str, int, float))}
        if o.name.startswith('SIGN_FACE') and p.get('sign'): im, es = sign_img(p, w_m, h_m), 1.6
        elif o.name.startswith('VSIGN_FACE') and p.get('vertical'): im, es = vsign_img(p, w_m, h_m), 1.6
        elif o.name.startswith('INTERIOR_FACE'): im, es = interior_img(p.get('interior', 'teishoku'), w_m, h_m), 1.1
        else: continue
        path = os.path.join(TMP, o.name + '.png'); im.save(path)
        o.data.materials.clear(); o.data.materials.append(mat_img('m_' + o.name, path, es))


# ---------------------------------------------------------------- 機車、路燈、樹（LAWWW2 的正式 GLB）
LIB = {}
def load_lib(fn, names):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ENV2, fn)); new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        if o.name in names or o.name.split('.')[0] in names: LIB[o.name.split('.')[0]] = o
    for o in new: o.hide_render = True; o.hide_viewport = True


SCOOTER_COLS = ['#f2f0ea', '#f2f0ea', '#c9ccd0', '#2a2c30', '#8e9296', '#b8312a', '#7fb4d6', '#25355a', '#a9d3c0', '#efe2c4', '#e8c23a', '#5a6b4a']
_paint_cache = {}


def vcol_fix():
    """scooter_parts 的顏色在頂點色（Color）裡：匯入後的材質沒有接上，這裡把頂點色乘到底色（輪胎、坐墊才是黑的）"""
    for m in bpy.data.materials:
        if not m.name.startswith('scooter_') or not m.use_nodes: continue
        nt = m.node_tree; b = nt.nodes.get('Principled BSDF')
        for n in nt.nodes:
            if n.bl_idname == 'ShaderNodeVertexColor': n.layer_name = 'Color'      # 匯入器建的節點名稱對不到這個屬性（輪胎變成米色）
        if b is not None and not b.inputs['Base Color'].is_linked:
            ca = nt.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Color'; nt.links.new(ca.outputs['Color'], b.inputs['Base Color'])


def paint_mat(hexcol):
    """烤漆＝頂點色（輪胎、坐墊等部分本來就是深色）×這台的顏色（和遊戲的 instanceColor 一樣是乘上去）"""
    if hexcol not in _paint_cache:
        mt = mat_flat('scooter_paint_' + hexcol, (1, 1, 1), rough=0.35); nt = mt.node_tree; b = nt.nodes['Principled BSDF']
        vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Color'
        mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs['Fac'].default_value = 1.0; mx.inputs['Color2'].default_value = (*srgb(hexcol), 1)
        nt.links.new(vc.outputs['Color'], mx.inputs['Color1']); nt.links.new(mx.outputs['Color'], b.inputs['Base Color']); _paint_cache[hexcol] = mt
    return _paint_cache[hexcol]


def place(key, x, z, yaw=0.0, y=0.0, s=1.0):
    src = LIB[key]; root = bpy.data.objects.new(f'{key}_i', None); sc.collection.objects.link(root)
    root.location = g2b(x, y, z); root.rotation_euler = (0, 0, yaw); root.scale = (s, s, s)
    def dup(o, parent):
        c = o.copy(); sc.collection.objects.link(c); c.hide_render = False; c.hide_viewport = False; c.parent = parent
        if c.type == 'MESH' and key.startswith('scooter'):                # 每台機車自己的烤漆顏色（遊戲是 instanceColor）
            col = rng.choice(SCOOTER_COLS)
            for slot in c.material_slots:
                if slot.material and slot.material.name.startswith('scooter_paint'): slot.link = 'OBJECT'; slot.material = paint_mat(col)
        c.matrix_parent_inverse.identity(); c.location = o.location if o is not src else (0, 0, 0)
        if o is src: c.rotation_euler = (0, 0, 0); c.rotation_quaternion = (1, 0, 0, 0); c.scale = (1, 1, 1)
        for ch in o.children: dup(ch, c)
    dup(src, root); return root


def light_point(name, x, y, z, w, col, r=0.3):
    L = bpy.data.lights.new(name, 'POINT'); L.energy = w; L.color = col; L.shadow_soft_size = r
    ob = bpy.data.objects.new(name, L); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def stool(x, z, col):
    """紅色塑膠圓凳（小吃店門口）：上大下小的圓台＋凳面"""
    bm = bmesh.new(); seg = 14
    for y, r in ((0.0, 0.15), (0.43, 0.13), (0.45, 0.145)):
        pass
    me = bpy.data.meshes.new('stool'); ob = bpy.data.objects.new('stool', me); sc.collection.objects.link(ob)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=0.155, radius2=0.12, depth=0.44)
    bm.to_mesh(me); bm.free(); ob.location = g2b(x, 0.22, z); ob.data.materials.append(col); me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    return ob


def sky(sun_elev, sun_rot, strength):
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
    sk = nt.nodes.new('ShaderNodeTexSky')
    try: sk.sky_type = 'NISHITA'
    except Exception: pass
    try: sk.sun_elevation = math.radians(sun_elev); sk.sun_rotation = math.radians(sun_rot)
    except Exception: pass
    nt.links.new(sk.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = strength


def camera(eye, look, lens):
    if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))   # 檢查用的鏡頭
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
    cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()


ASPH = mat_tex('asphalt', 'granular_concrete', scale=0.35, tint=(0.62, 0.64, 0.66), rough=0.9)   # 淺灰（D30）：貼圖本身偏暖，乘一點冷灰
WHITE_PAINT = mat_flat('roadpaint', (0.82, 0.82, 0.78), rough=0.6)
RED = mat_flat('stool_red', srgb('#c9463d'), rough=0.45)

# ================================================================ 山下的小吃街
if SCENE == 'food':
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
    paint_faces()
    # 店面玻璃：傍晚從外面看要看得到店裡（玻璃很透）
    for m in bpy.data.materials:
        if 'glass' in m.name.lower() and m.use_nodes and 'Principled BSDF' in m.node_tree.nodes:
            m.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.12
    # 地面：巷子的柏油（淺灰，D30）＋兩側水溝蓋的線
    quad('lane', (-4.6, 0, 16), (4.6, 0, 16), (4.6, 0, -50), (-4.6, 0, -50), ASPH)
    for x in (-3.2, 3.2): quad('line', (x - 0.06, 0.005, 16), (x + 0.06, 0.005, 16), (x + 0.06, 0.005, -50), (x - 0.06, 0.005, -50), WHITE_PAINT)
    quad('far_ground', (-60, -0.02, -50), (60, -0.02, -50), (60, -0.02, -120), (-60, -0.02, -120), ASPH)
    hills(-58, 300, [(0, 30, (0.07, 0.15, 0.06), 1.3), (60, 55, (0.12, 0.19, 0.15), 2.7), (160, 85, (0.26, 0.32, 0.36), 4.1)])
    # 機車：兩側騎樓前停一排（斜停），偶爾空一格
    load_lib('scooter.glb', {'scooter_a', 'scooter_b'}); load_lib('street_props.glb', {'lamp_post', 'planter_box', 'bike_city'}); vcol_fix()
    for side, x in ((-1, -3.75), (1, 3.75)):
        z = 9.5
        while z > -40:
            if rng.random() > 0.15: place(rng.choice(['scooter_a', 'scooter_b']), x + rng.uniform(-0.1, 0.1), z, yaw=math.radians(90 + side * 70 + rng.uniform(-8, 8)))
            z -= rng.uniform(0.85, 1.1)
            if rng.random() < 0.06: z -= 2.5
    # 店門口的紅色圓凳、小桌（湯餃、滷味門口）
    tbl = mat_flat('table_steel', (0.62, 0.62, 0.6), rough=0.35, metal=0.5)
    for cz in (3.0, -3.5):
        box('tbl', -3.05, -2.45, 0.72, 0.75, cz - 0.4, cz + 0.4, tbl)
        for dz in (-0.45, 0.45): stool(-2.75, cz + dz, RED)
    # 店門口的暖色燈、路燈
    for q, x in ((('dump', 2.7), ('luwei', -3.7), ('bento', -10.7), ('tofu', -17.0), ('pan', -24.2)), -4.0), ((('tea', 4.7), ('noodle', -1.2), ('fried', -8.5), ('curry', -15.0), ('cafe', -25.0)), 4.0):
        for _, z in q: light_point('shop', x, 2.6, z, 110, (1.0, 0.84, 0.64), 0.5)   # 第二版 220 W 偏橘：整條巷子連機車都被染成橘色
    for z in (6.0, -14.0, -34.0):
        place('lamp_post', 3.9, z, yaw=math.radians(90))
        light_point('lamp', 3.15, 3.9, z, 380, (1.0, 0.86, 0.68), 0.15)
    sky(1.5, 205, 0.45)
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 0.25; sun.color = (1.0, 0.72, 0.52); so = bpy.data.objects.new('sun', sun)
    so.rotation_euler = (math.radians(86), 0, math.radians(205)); sc.collection.objects.link(so)
    camera((0.2, 1.6, 14.5), (-0.4, 3.2, -40.0), float(opt('--lens', '28')))

# ================================================================ 校門口
else:
    sky(4.0, 235, 0.55)
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 1.4; sun.color = (1.0, 0.66, 0.42); so = bpy.data.objects.new('sun', sun)
    so.rotation_euler = (math.radians(84), 0, math.radians(235)); sc.collection.objects.link(so)
    STONE = mat_tex('gate_stone', 'granite_tile_03', scale=0.6, tint=(0.80, 0.78, 0.74), rough=0.7)
    BRICK = mat_tex('gate_brick', 'red_brick', scale=0.9, tint=(0.85, 0.8, 0.78), rough=0.85)
    CONC = mat_tex('walk', 'granular_concrete', scale=0.5, tint=(0.72, 0.7, 0.66), rough=0.85)
    GRASS = mat_flat('grass', (0.09, 0.16, 0.06), rough=0.95)
    METAL = mat_flat('metal_dark', (0.06, 0.06, 0.065), rough=0.4, metal=0.6)
    # 指南路：東西向，路中心 z=0；北側（−z）是校門
    quad('road', (-80, 0, 8), (80, 0, 8), (80, 0, -8), (-80, 0, -8), ASPH)
    for x0 in range(-80, 80, 6): quad('lane_dash', (x0, 0.004, -0.08), (x0 + 3, 0.004, -0.08), (x0 + 3, 0.004, 0.08), (x0, 0.004, 0.08), mat_flat('yellow', (0.8, 0.6, 0.12), 0.6))
    for k in range(9):                                                   # 斑馬線（往校門口）
        x = -4.0 + k * 1.0; quad('zebra', (x, 0.005, 7.2), (x + 0.5, 0.005, 7.2), (x + 0.5, 0.005, -7.2), (x, 0.005, -7.2), WHITE_PAINT)
    box('curb_n', -80, 80, 0, 0.16, -8.3, -8.0, STONE); box('walk_n', -80, 80, 0, 0.15, -12.5, -8.3, CONC)
    box('curb_s', -80, 80, 0, 0.16, 8.0, 8.3, STONE); box('walk_s', -80, 80, 0, 0.15, 8.3, 14, CONC)
    # 校門：中間 12 m 寬的入口（兩根石柱＋上方一道鋼構雨遮）、兩側低矮的紅磚牆＋石材壓頂（沒有校名、校徽）
    for x0, x1 in ((-40, -6.4), (6.4, 40)):
        box('wall', x0, x1, 0.15, 1.35, -13.4, -12.9, BRICK); box('wall_cap', x0 - 0.05, x1 + 0.05, 1.35, 1.48, -13.5, -12.8, STONE)
        for x in range(int(x0) + 3, int(x1), 4): box('wall_pier', x - 0.3, x + 0.3, 0.15, 1.7, -13.55, -12.75, STONE)
    for sx in (-1, 1):
        box('gate_pillar', sx * 6.4 - 0.7, sx * 6.4 + 0.7, 0.15, 4.6, -13.9, -12.4, STONE)
        box('gate_pillar_cap', sx * 6.4 - 0.82, sx * 6.4 + 0.82, 4.6, 4.8, -14.0, -12.3, STONE)
        light_point('gate_light', sx * 6.4, 3.6, -12.0, 120, (1.0, 0.85, 0.65), 0.3)
    box('gate_beam', -7.3, 7.3, 4.8, 5.15, -13.6, -12.7, METAL)
    box('gate_fin', -6.0, 6.0, 5.15, 5.25, -13.4, -12.9, mat_flat('beam_top', (0.55, 0.55, 0.53), 0.5))
    box('guard', 8.2, 11.2, 0.15, 2.9, -18.5, -15.0, mat_flat('guard_wall', (0.86, 0.84, 0.78), 0.8))       # 門後右邊的警衛亭
    box('guard_roof', 8.0, 11.4, 2.9, 3.1, -18.7, -14.8, METAL)
    quad('guard_win', (8.2 - 0.01, 1.1, -15.4), (8.2 - 0.01, 1.1, -18.1), (8.2 - 0.01, 2.3, -18.1), (8.2 - 0.01, 2.3, -15.4), mat_flat('guard_glow', (0.9, 0.85, 0.7), 0.3, (1.0, 0.85, 0.6), 2.0))
    box('bar', 6.6, 9.5, 0.95, 1.05, -14.1, -14.0, mat_flat('barrier', (0.85, 0.2, 0.15), 0.5))           # 汽車的柵欄（舉起來的那一段不做）
    # 門後：校園的草地、大樹、系館（現代的白色建築，窗戶亮著幾格），再後面是山
    quad('campus_ground', (-80, 0.12, -13.5), (80, 0.12, -13.5), (80, 0.12, -90), (-80, 0.12, -90), GRASS)
    box('campus_road', -6.0, 6.0, 0.13, 0.16, -60, -13.4, CONC)
    BLD = mat_flat('bld_white', (0.80, 0.79, 0.75), 0.8)
    for (x0, x1, z0, z1, h) in ((-34, -12, -52, -36, 13.0), (16, 40, -58, -40, 16.0), (-8, 10, -82, -66, 19.0)):
        box('bld', x0, x1, 0.12, h, z0, z1, BLD)
        for fl in range(1, int(h // 3.4)):
            for xi in range(int((x1 - x0) // 3)):
                x = x0 + 1.2 + xi * 3; lit = rng.random() < 0.35
                quad('win', (x, fl * 3.4 - 1.7, z1 + 0.02), (x + 1.6, fl * 3.4 - 1.7, z1 + 0.02), (x + 1.6, fl * 3.4 - 0.4, z1 + 0.02), (x, fl * 3.4 - 0.4, z1 + 0.02),
                     mat_flat('win_lit', (0.9, 0.8, 0.6), 0.3, (1.0, 0.8, 0.55), 3.0) if lit else mat_flat('win_dark', (0.12, 0.15, 0.18), 0.15, metal=0.3))
    hills(-92, 380, [(0, 70, (0.07, 0.15, 0.06), 1.9), (60, 125, (0.12, 0.19, 0.15), 3.3), (170, 170, (0.26, 0.32, 0.38), 5.2)])   # 「法學院。山。也是山。」：山要比系館高很多
    load_lib('street_trees.glb', {'tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a'}); load_lib('scooter.glb', {'scooter_a', 'scooter_b'}); load_lib('street_props.glb', {'lamp_post'}); vcol_fix()
    for x in (-30, -21, -13, 13, 21, 30): place(rng.choice(['tree_camphor_a', 'tree_camphor_b']), x + rng.uniform(-1, 1), -17.5 + rng.uniform(-1.5, 1), yaw=rng.uniform(0, 6.28), y=0.12)
    for x in (-24, 24): place('tree_banyan_a', x, -27, yaw=rng.uniform(0, 6.28), y=0.12)
    for x in (-36, -16, 16, 36): place(rng.choice(['tree_camphor_a', 'tree_camphor_b']), x, 11.8, yaw=rng.uniform(0, 6.28), y=0.15)   # 這一側（鏡頭這邊）的行道樹
    for x in (-27, -9, 9, 27): place('lamp_post', x, -8.9, yaw=math.radians(180), y=0.15); light_point('lamp', x, 3.9, -8.15, 350, (1.0, 0.86, 0.68), 0.15)
    x = -30.0                                                             # 對面人行道邊停的一排機車
    while x < -8.5:
        if rng.random() > 0.18: place(rng.choice(['scooter_a', 'scooter_b']), x, -9.2, yaw=math.radians(rng.uniform(-10, 10)), y=0.15)
        x += rng.uniform(0.85, 1.05)
    x = 9.0
    while x < 30:
        if rng.random() > 0.18: place(rng.choice(['scooter_a', 'scooter_b']), x, -9.2, yaw=math.radians(rng.uniform(-10, 10)), y=0.15)
        x += rng.uniform(0.85, 1.05)
    camera((-2.5, 1.6, 11.0), (1.0, 4.2, -20.0), float(opt('--lens', '24')))

sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, SCENE, RW, RH, SAMPLES)
