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
  /opt/blenv/bin/python tools/blender/env_second/bg_nccu.py -- campus - <輸出.png> [--res …] [--samples …]（政大・校園裡的路：醉夢溪畔的步道）
座標＝遊戲座標（x 東、y 上、z 南），g2b 轉成 Blender。"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector, noise
from PIL import Image, ImageDraw, ImageFont

A = sys.argv[sys.argv.index('--') + 1:]
SCENE, GLB, OUT = A[0], A[1], A[2]
HAZE = {}                                                                 # haze() 的預設值（場景裡改）
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
def hills(z_near, x_span, layers, crown=0.9, lumpy=0.0):
    """山（台北盆地邊緣、長滿樹的圓緩山稜）：每一層是一片從山腳往後升到稜線的曲面；稜線＝幾個頻率的雜訊（圓緩，不是尖錐），
    表面是森林的顏色＋小尺度的雜訊（樹冠一團一團）；越遠越淡、越藍（空氣透視）"""
    for k, (dz, hmax, col, seed) in enumerate(layers):
        nx, nz = (160, 16) if not lumpy else (420, 60); V = []; F = []; depth = 140.0   # lumpy：網格細一點，表面加樹冠一團一團的起伏（近處的山才看得出是森林）
        def crest(x):
            n = 0.55 * noise.noise(Vector((x / 140.0, seed, 0.3))) + 0.3 * noise.noise(Vector((x / 55.0, seed + 7, 0.1))) + 0.15 * noise.noise(Vector((x / 22.0, seed + 3, 0.7)))
            return hmax * (0.62 + 0.55 * n)
        for j in range(nz + 1):
            t = j / nz; zz = z_near - dz - t * depth
            prof = math.sin(min(1.0, t * 1.25) * math.pi / 2) ** 1.3          # 山腳 0 → 稜線 1（前坡），稜線以後持平
            for i in range(nx + 1):
                x = -x_span + 2 * x_span * i / nx
                lump = lumpy * (1.0, 0.45, 0.15)[min(k, 2)] * noise.noise(Vector((x / 14.0, zz / 14.0, seed + 11))) * (0.4 + 0.6 * prof) if lumpy else 0.0   # 平順的小起伏（abs 的雜訊會有折痕，看起來像多邊形）
                V.append((x, crest(x) * prof - 3.0 + 2.0 * noise.noise(Vector((x / 9.0, zz / 9.0, seed))) + lump, zz))
        for j in range(nz):
            for i in range(nx):
                a = j * (nx + 1) + i; F.append((a, a + 1, a + nx + 2, a + nx + 1))
        mt = bpy.data.materials.new(f'hill{k}'); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
        tc = nt.nodes.new('ShaderNodeTexCoord')
        n1 = nt.nodes.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 0.22; n1.inputs['Detail'].default_value = 10.0; n1.inputs['Roughness'].default_value = 0.7
        nt.links.new(tc.outputs['Object'], n1.inputs['Vector'])
        vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = crown; nt.links.new(tc.outputs['Object'], vo.inputs['Vector'])   # 樹冠一團一團
        ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.3; ramp.color_ramp.elements[1].position = 0.75
        ramp.color_ramp.elements[0].color = (*[c * 0.6 for c in col], 1); ramp.color_ramp.elements[1].color = (*[min(1, c * 1.3) for c in col], 1)
        mix = nt.nodes.new('ShaderNodeMath'); mix.operation = 'MULTIPLY_ADD'; mix.inputs[1].default_value = 0.5
        nt.links.new(vo.outputs['Distance'], mix.inputs[0]); nt.links.new(n1.outputs['Fac'], mix.inputs[2])
        nt.links.new(mix.outputs[0], ramp.inputs['Fac'])
        if lumpy: nt.links.new(haze(nt, ramp.outputs['Color'], b), b.inputs['Base Color'])   # 只有校園那一張（lumpy）加空氣透視；校門、小吃街照舊
        else: nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
        bm_ = nt.nodes.new('ShaderNodeBump'); bm_.inputs['Strength'].default_value = 0.45 if not lumpy else 1.0; bm_.inputs['Distance'].default_value = 0.6 if not lumpy else 5.0   # lumpy（近的山）：樹冠一團一團的凹凸要很明顯
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


def haze(nt, col_socket, bsdf, color=(0.36, 0.44, 0.56), dist=650.0, maxk=0.5):
    """空氣透視：越遠越往天空的霧藍色混（混合比例＝maxk·(1−exp(−距離/dist))），同時把同一個比例的霧色加到自發光（背光的地方也是霧的顏色、不會黑掉）"""
    color = HAZE.get('color', color); dist = HAZE.get('dist', dist); maxk = HAZE.get('maxk', maxk)       # 場景可以整體改（校園：傍晚／夜晚）
    cd = nt.nodes.new('ShaderNodeCameraData'); dv = nt.nodes.new('ShaderNodeMath'); dv.operation = 'DIVIDE'; dv.inputs[1].default_value = -dist
    nt.links.new(cd.outputs['View Distance'], dv.inputs[0]); ex = nt.nodes.new('ShaderNodeMath'); ex.operation = 'EXPONENT'; nt.links.new(dv.outputs[0], ex.inputs[0])
    om = nt.nodes.new('ShaderNodeMath'); om.operation = 'SUBTRACT'; om.inputs[0].default_value = 1.0; nt.links.new(ex.outputs[0], om.inputs[1])
    k = nt.nodes.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = maxk; nt.links.new(om.outputs[0], k.inputs[0])
    mx = nt.nodes.new('ShaderNodeMixRGB'); mx.inputs['Color2'].default_value = (*color, 1); nt.links.new(k.outputs[0], mx.inputs['Fac']); nt.links.new(col_socket, mx.inputs['Color1'])
    try:
        em = nt.nodes.new('ShaderNodeMath'); em.operation = 'MULTIPLY'; em.inputs[1].default_value = 0.12; nt.links.new(k.outputs[0], em.inputs[0])
        bsdf.inputs['Emission Color'].default_value = (*color, 1); nt.links.new(em.outputs[0], bsdf.inputs['Emission Strength'])
    except Exception: pass
    return mx.outputs['Color']


def forest_cards(n, x0, x1, z0, z1, smin, smax, eye, seed=7, names=('hill0', 'hill1'), tint=(0.78, 0.86, 0.80)):
    """山坡上種樹：street_trees.py 的遠景卡片（側面正交渲染的樟樹、榕樹，tree_cards.png），每一片面向鏡頭、腳踩在山坡上（往下打光線找地面）。
    卡片共用三個網格（linked duplicates），幾千棵也不重；顏色乘一點偏冷的綠（遠一點、在山上）"""
    import json
    gen = os.path.join(ROOT, 'tools/blender/env_second/textures/gen'); info = json.load(open(os.path.join(gen, 'tree_cards.json')))
    mt = bpy.data.materials.get('forest_card')
    if mt is None:
        mt = bpy.data.materials.new('forest_card'); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
        tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(gen, 'tree_cards.png')); tx.image.alpha_mode = 'STRAIGHT'
        mx = nt.nodes.new('ShaderNodeMixRGB'); mx.blend_type = 'MULTIPLY'; mx.inputs['Fac'].default_value = 1.0; mx.inputs['Color2'].default_value = (*tint, 1)
        nt.links.new(tx.outputs['Color'], mx.inputs['Color1'])
        # 每棵樹不一樣：明暗 0.55～1.0、色調在黃綠與藍綠之間（Object Info 的 Random）
        oi = nt.nodes.new('ShaderNodeObjectInfo'); vr = nt.nodes.new('ShaderNodeValToRGB'); vr.color_ramp.elements[0].color = (0.5, 0.56, 0.5, 1); vr.color_ramp.elements[1].color = (1.0, 0.98, 0.86, 1)
        nt.links.new(oi.outputs['Random'], vr.inputs['Fac']); mv = nt.nodes.new('ShaderNodeMixRGB'); mv.blend_type = 'MULTIPLY'; mv.inputs['Fac'].default_value = 1.0
        nt.links.new(mx.outputs['Color'], mv.inputs['Color1']); nt.links.new(vr.outputs['Color'], mv.inputs['Color2'])
        b.inputs['Base Color'].default_value = (0, 0, 0, 1); nt.links.new(haze(nt, mv.outputs['Color'], b), b.inputs['Base Color'])
        rd = nt.nodes.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], b.inputs['Alpha'])
        b.inputs['Roughness'].default_value = 0.9
    meshes = []
    for nm, c in info.items():
        if 'palm' in nm: continue                                              # 大王椰子不會長在山上
        px0, py0, px1, py1 = c['px']; S = 1024.0; u0, u1, v0, v1 = px0 / S, px1 / S, 1 - py1 / S, 1 - py0 / S; w, h = c['w'], c['h']
        bm = bmesh.new(); vs = [bm.verts.new(v) for v in ((-w / 2, 0, 0), (w / 2, 0, 0), (w / 2, 0, h), (-w / 2, 0, h))]; f = bm.faces.new(vs)
        uvl = bm.loops.layers.uv.new()
        for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
        me = bpy.data.meshes.new('forest_card_' + nm); bm.to_mesh(me); bm.free(); me.materials.append(mt); meshes.append(me)
    deps = bpy.context.evaluated_depsgraph_get(); r = random.Random(seed); E = g2b(*eye); placed = 0
    for i in range(n):
        x, z = r.uniform(x0, x1), r.uniform(z1, z0)
        hit, loc, nrm, idx, ob, mx_ = sc.ray_cast(deps, g2b(x, 600, z), Vector((0, 0, -1)))
        if not hit or ob.name.split('.')[0] not in names: continue
        o = bpy.data.objects.new('forest_tree', r.choice(meshes)); sc.collection.objects.link(o)
        o.location = loc - Vector((0, 0, 0.8)); s_ = r.uniform(smin, smax); o.scale = (s_, s_, s_ * r.uniform(0.9, 1.15))
        d = E - o.location; o.rotation_euler = (0, 0, math.atan2(d.x, -d.y)); placed += 1
    print('forest cards', placed)


def camera(eye, look, lens):
    if '--eye' in A: eye = tuple(map(float, opt('--eye', '').split(','))); look = tuple(map(float, opt('--look', '').split(',')))   # 檢查用的鏡頭
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
    cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()


ASPH = mat_tex('asphalt', 'granular_concrete', scale=0.35, tint=(0.62, 0.64, 0.66), rough=0.9)   # 淺灰（D30）：貼圖本身偏暖，乘一點冷灰
WHITE_PAINT = mat_flat('roadpaint', (0.82, 0.82, 0.78), rough=0.6)
RED = mat_flat('stool_red', srgb('#c9463d'), rough=0.45)

# ================================================================ 山下（指南路二段 57～67 號那一段）
if SCENE == 'food':
    # 照查證（docs/art-rebuild/second_ai/research/nccu_real_shops.md）：店在路的西側（x=-4.6 的立面、朝東），窄人行道（約 1.2 m），
    # 指南路雙向約 12 m（x -3.4～8.6），對面是政大（矮牆、樹、側門「麥側」），再過去是指南山。
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
    paint_faces()
    for m in bpy.data.materials:
        if 'glass' in m.name.lower() and m.use_nodes and 'Principled BSDF' in m.node_tree.nodes:
            m.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.12
    CONC = mat_tex('walk', 'granular_concrete', scale=0.5, tint=(0.74, 0.72, 0.68), rough=0.85)
    STONE = mat_tex('curb', 'granite_tile_03', scale=0.6, tint=(0.80, 0.78, 0.74), rough=0.7)
    BRICK = mat_tex('campus_wall', 'red_brick', scale=0.9, tint=(0.85, 0.8, 0.78), rough=0.85)
    GRASS = mat_flat('grass', (0.09, 0.16, 0.06), rough=0.95)
    quad('road', (-3.4, 0, 30), (8.6, 0, 30), (8.6, 0, -90), (-3.4, 0, -90), ASPH)
    for z0 in range(-90, 30, 6): quad('center', (2.52, 0.004, z0), (2.68, 0.004, z0), (2.68, 0.004, z0 + 3), (2.52, 0.004, z0 + 3), mat_flat('yellow', (0.8, 0.6, 0.12), 0.6))
    for x in (-3.15, 8.35): quad('edge', (x - 0.06, 0.004, 30), (x + 0.06, 0.004, 30), (x + 0.06, 0.004, -90), (x - 0.06, 0.004, -90), WHITE_PAINT)
    box('walk_w', -4.6, -3.4, 0, 0.15, -90, 30, CONC); box('curb_w', -3.5, -3.4, 0, 0.16, -90, 30, STONE)
    box('walk_e', 8.6, 10.2, 0, 0.15, -90, 30, CONC); box('curb_e', 8.6, 8.7, 0, 0.16, -90, 30, STONE)
    for z0, z1 in ((-90, -12.0), (-4.0, 30)):                            # 政大的矮牆；中間（麥當勞斜對面）是側門
        box('cwall', 10.2, 10.6, 0.15, 1.3, z0, z1, BRICK); box('cwall_cap', 10.15, 10.65, 1.3, 1.42, z0, z1, STONE)
    quad('campus', (10.6, 0.12, 30), (90, 0.12, 30), (90, 0.12, -90), (10.6, 0.12, -90), GRASS)
    hills(-58, 300, [(0, 30, (0.07, 0.15, 0.06), 1.3), (60, 55, (0.12, 0.19, 0.15), 2.7), (160, 85, (0.26, 0.32, 0.36), 4.1)])
    nh = len([o for o in sc.objects if o.name.startswith('hill')])
    hills(-60, 260, [(0, 60, (0.07, 0.15, 0.06), 5.3), (55, 100, (0.12, 0.19, 0.15), 6.7)])   # 東邊（校園後面）的指南山：轉到 +x
    for o in [o for o in sc.objects if o.name.startswith('hill')][nh:]: o.rotation_euler = (0, 0, -math.pi / 2)
    load_lib('scooter.glb', {'scooter_a', 'scooter_b'}); load_lib('street_props.glb', {'lamp_post'}); vcol_fix()
    load_lib('street_trees.glb', {'tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a'})
    z = 13.5                                                              # 店門口的路邊停滿機車（斜停）
    while z > -38:
        if rng.random() > 0.12: place(rng.choice(['scooter_a', 'scooter_b']), -2.85 + rng.uniform(-0.08, 0.08), z, yaw=math.radians(90 - 70 + rng.uniform(-8, 8)))
        z -= rng.uniform(0.85, 1.05)
        if rng.random() < 0.05: z -= 2.2
    for z in (24, 14, 4, -16, -26, -36, -48, -60): place(rng.choice(['tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a']), 12.5 + rng.uniform(-0.8, 0.8), z + rng.uniform(-1.5, 1.5), yaw=rng.uniform(0, 6.28), y=0.12)
    for z in (10.0, -10.0, -30.0): place('lamp_post', 9.3, z, yaw=math.radians(-90), y=0.15); light_point('lamp', 8.55, 3.9, z, 380, (1.0, 0.86, 0.68), 0.15)
    for q in (8.5, 4.0, 0.0, -4.5, -11.0, -22.0): light_point('shop', -4.0, 2.6, q, 110, (1.0, 0.84, 0.64), 0.5)
    sky(1.5, 205, 0.45)
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 0.25; sun.color = (1.0, 0.72, 0.52); so = bpy.data.objects.new('sun', sun)
    so.rotation_euler = (math.radians(86), 0, math.radians(205)); sc.collection.objects.link(so)
    camera((8.2, 1.6, 6.0), (-4.6, 3.4, -16.0), float(opt('--lens', '24')))   # 從政大這一側的人行道（側門附近）斜看對街那一排：敏忠、迷客夏、50嵐、四川飯館、麥當勞、摩斯

# ================================================================ 圖書館（達賢圖書館，傍晚從景觀湖看）
elif SCENE == 'lib':
    # 照查證（docs/art-rebuild/second_ai/research/nccu_library.md）：清水混凝土 8 層主棟（高 31.7 m）、正面一片片木紋清水模的斜板（遮陽板）＋大片落地窗、
    # 前面一大片草坡接到 2F 主入口、旁邊的景觀湖（滯洪池）、兩層的湖濱悅讀小屋＋空橋、背後山林；傍晚館內亮燈。**沒有看到照片：比例、斜板的角度、方位是推估**；不寫館名。
    CONC = mat_tex('lib_conc', 'granular_concrete', scale=0.4, tint=(0.70, 0.72, 0.74), rough=0.85)   # 清水混凝土的灰（貼圖偏暖，乘冷灰）
    FIN = mat_tex('lib_fin', 'fine_grained_wood', scale=0.8, tint=(0.62, 0.58, 0.52), rough=0.8)   # 木紋清水模（混凝土的灰＋木紋）
    GLOW = mat_flat('lib_glass_lit', (0.55, 0.45, 0.32), 0.15, (1.0, 0.78, 0.50), 0.75)
    GLASS_D = mat_flat('lib_glass', (0.14, 0.17, 0.2), 0.05, metal=0.3)
    GRASS = mat_flat('grass', (0.10, 0.18, 0.07), rough=0.95)
    WATER = mat_flat('lake', (0.03, 0.05, 0.06), 0.02, metal=0.0)
    WALK = mat_tex('lake_walk', 'granite_tile_03', scale=0.6, tint=(0.75, 0.73, 0.70), rough=0.7)
    # 主棟：x −36～36、z −70～−46（正面朝 +z）、地面 y=0；一樓是機車停車（深色），2F 以上整面玻璃＋斜板
    X0, X1, ZF, ZB, HT, FH = -36.0, 36.0, -46.0, -70.0, 31.7, 3.6
    box('lib_core', X0, X1, 0, HT, ZB, ZF - 1.2, CONC)
    box('lib_roof', X0 - 0.6, X1 + 0.6, HT, HT + 0.8, ZB - 0.6, ZF + 0.6, CONC)
    box('lib_1f', X0, X1, 0, 3.6, ZF - 1.2, ZF - 0.2, mat_flat('lib_1f', (0.12, 0.12, 0.13), 0.6))
    for fl in range(1, 8):                                               # 2F～8F：每層的樓板外緣＋玻璃（一部分亮燈）
        y0 = 3.6 + (fl - 1) * FH
        box('slab', X0, X1, y0 - 0.35, y0, ZF - 1.2, ZF, CONC)
        for k in range(18):
            xa = X0 + k * 4.0; lit = rng.random() < (0.75 if fl < 6 else 0.45)
            quad('lib_win', (xa + 0.1, y0, ZF - 1.0), (xa + 3.9, y0, ZF - 1.0), (xa + 3.9, y0 + FH - 0.4, ZF - 1.0), (xa + 0.1, y0 + FH - 0.4, ZF - 1.0), GLOW if lit else GLASS_D)
    for k in range(37):                                                  # 斜板：直立、斜 35°，每 2 m 一片，從 2F 到屋頂
        x = X0 + 0.5 + k * 1.97; d = 1.2; t = 0.12; a = math.radians(35)
        dx, dz = math.sin(a) * d / 2, math.cos(a) * d / 2
        V = [(x - dx - t, 3.3, ZF - 0.6 + dz), (x - dx + t, 3.3, ZF - 0.6 + dz), (x + dx + t, 3.3, ZF - 0.6 - dz), (x + dx - t, 3.3, ZF - 0.6 - dz)]
        V = V + [(vx, HT, vz) for (vx, _, vz) in V]
        mesh_obj('fin', V, [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)], FIN)
    # 草坡：地面 y=0（湖邊）往後升到 2F 入口（y=3.6，主棟正面前）
    nz = 10; V = []; F = []
    for j in range(nz + 1):
        z = -14 - j * 3.2; y = 3.6 * min(1.0, (j / nz) ** 1.4)
        V += [(X0 - 10, y, z), (X1 + 10, y, z)]
    for j in range(nz): F.append((2 * j, 2 * j + 1, 2 * j + 3, 2 * j + 2))
    mesh_obj('slope', V, F, GRASS, smooth=True)
    box('entry_stair', -6, 6, 0, 3.6, -46.2, -42.0, CONC)
    # 景觀湖＋湖邊步道；湖濱悅讀小屋（兩層、玻璃、清水模框）在右邊、用空橋接主棟
    quad('lake', (-80, 0.02, 20), (80, 0.02, 20), (80, 0.02, -14), (-80, 0.02, -14), WATER)
    box('lake_edge', -80, 80, -0.2, 0.12, -14.6, -13.8, WALK); box('lake_walk_near', -80, 80, -0.2, 0.12, 20, 24, WALK)
    box('house', 20, 34, 0.0, 7.6, -10, 2, CONC)
    for fl in range(2):
        y0 = 0.6 + fl * 3.6
        quad('house_win', (20.5, y0, 2.02), (33.5, y0, 2.02), (33.5, y0 + 2.9, 2.02), (20.5, y0 + 2.9, 2.02), GLOW)
        quad('house_win_w', (19.98, y0, 1.5), (19.98, y0, -9.5), (19.98, y0 + 2.9, -9.5), (19.98, y0 + 2.9, 1.5), GLOW)
    box('house_roof', 19.4, 34.6, 7.6, 8.1, -10.6, 2.6, CONC)
    box('bridge', 24, 28, 4.2, 4.6, -46, -10, CONC); box('bridge_rail', 24, 24.1, 4.6, 5.6, -46, -10, GLASS_D); box('bridge_rail2', 27.9, 28, 4.6, 5.6, -46, -10, GLASS_D)
    for z in (-20, -32): box('bridge_col', 25.6, 26.4, 0, 4.2, z - 0.4, z + 0.4, CONC)
    hills(-80, 300, [(0, 55, (0.07, 0.15, 0.06), 7.3), (60, 95, (0.12, 0.19, 0.15), 8.1), (170, 130, (0.26, 0.32, 0.38), 9.4)])
    load_lib('street_trees.glb', {'tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a'}); load_lib('street_props.glb', {'lamp_post'}); vcol_fix()
    for x in (-62, -50, -44, 44, 52, 64): place(rng.choice(['tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a']), x + rng.uniform(-2, 2), -40 + rng.uniform(-6, 6), yaw=rng.uniform(0, 6.28))
    for x in (-34, -16, 2): place('lamp_post', x, 18.0, yaw=0.0, y=0.12); light_point('lamp', x, 3.9, 17.25, 300, (1.0, 0.86, 0.68), 0.15)
    quad('lake_walk_far', (-80, 0.12, 24), (80, 0.12, 24), (80, 0.12, 17), (-80, 0.12, 17), WALK)
    sky(1.0, 260, 0.4)
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 0.35; sun.color = (1.0, 0.62, 0.40); so = bpy.data.objects.new('sun', sun)
    so.rotation_euler = (math.radians(87), 0, math.radians(260)); sc.collection.objects.link(so)
    camera((-2.0, 1.7, 30.0), (6.0, 10.0, -45.0), float(opt('--lens', '22')))

# ================================================================ 校門口
elif SCENE == 'campus':
    # 「政大・校園裡的路」（LAWWW-B 01:0x 佇列：AA_137 7-1，K1b 散步；使用者 2026-10-16：政大只做主要校園＋宿舍）。
    # 照查證（docs/art-rebuild/second_ai/research/nccu_campus_path.md）：醉夢溪（指南溪流進校園的那一段）沿岸的濱溪步道，政大人叫「情人道」；
    # 溪上有好幾座橋（濟賢橋、渡賢橋…）、溪岸種楓香、近自然工法的護岸（石塊）、校園在指南山麓（山很近、很高）。
    # **沒有看到照片：路寬、護岸與欄杆的樣子、橋的造型、建築量體都是推估**；不放校名校徽、不寫橋名。時間：傍晚（K1b 19:30 也說得通：路燈已經亮了）。
    # AA_147：K1b 是十月平日晚上 21:30 走在校園的路上（主圖＝夜晚）；傍晚是變體。--time night|dusk
    TIME = opt('--time', 'night'); NIGHT = TIME == 'night'
    if NIGHT:                                                             # 夜晚：深藍的天（城市的光把天邊照亮一點）、很弱的月光；路燈、系館的窗、溪裡的倒影是主要的光
        w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
        gr = nt.nodes.new('ShaderNodeTexGradient'); mp = nt.nodes.new('ShaderNodeMapping'); tc = nt.nodes.new('ShaderNodeTexCoord'); vr = nt.nodes.new('ShaderNodeValToRGB')
        mp.inputs['Rotation'].default_value = (0, math.radians(-90), 0); nt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
        vr.color_ramp.elements[0].color = (0.060, 0.064, 0.085, 1); vr.color_ramp.elements[1].position = 0.55; vr.color_ramp.elements[1].color = (0.007, 0.011, 0.028, 1)   # 天邊被城市照亮（v6 太暗：山和樹黑成一片，看不出稜線）
        nt.links.new(gr.outputs['Fac'], vr.inputs['Fac']); nt.links.new(vr.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 1.0
        sun = bpy.data.lights.new('moon', 'SUN'); sun.energy = 0.09; sun.color = (0.62, 0.72, 1.0); so = bpy.data.objects.new('moon', sun)
        so.rotation_euler = (math.radians(50), 0, math.radians(140)); sc.collection.objects.link(so)
        HAZE.update(color=(0.040, 0.045, 0.062), dist=300.0, maxk=0.55); sc.view_settings.exposure = 0.7   # 夜晚整體提亮（劇情背景上面要疊人物、對話框，太暗看不出地方）
    else:                                                                 # 傍晚：太陽很低、暖色；山要有空氣透視（遠、偏藍、偏淡），不是一團亮黃綠
        sky(2.5, 235, 0.32)
        sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 0.55; sun.color = (1.0, 0.7, 0.48); so = bpy.data.objects.new('sun', sun)
        so.rotation_euler = (math.radians(86), 0, math.radians(235)); sc.collection.objects.link(so)
        HAZE.update(color=(0.48, 0.56, 0.68), dist=300.0, maxk=0.5)   # v8：v6 傍晚的山被暖光＋偏灰的樹色混成岩石的土黃色 → 霧淡一點、偏藍
    PAVE = mat_tex('path', 'granite_tile_03', scale=0.45, tint=(0.74, 0.72, 0.68), rough=0.75)
    CONC = mat_tex('rev_conc', 'granular_concrete', scale=0.5, tint=(0.70, 0.69, 0.66), rough=0.85)
    STONE = mat_tex('rev_stone', 'granite_tile_03', scale=1.4, tint=(0.46, 0.46, 0.44), rough=0.85)
    GRASS = mat_flat('grass', (0.08, 0.15, 0.05), rough=0.95)
    RAIL = mat_flat('rail', (0.55, 0.57, 0.58), 0.35, metal=0.45)
    # 溪水：深綠灰、很亮的反射、細碎的漣漪（bump）
    WATER = mat_flat('creek', (0.05, 0.075, 0.06), 0.12); nt = WATER.node_tree; b = nt.nodes['Principled BSDF']
    tn = nt.nodes.new('ShaderNodeTexNoise'); tn.inputs['Scale'].default_value = 6.0; tn.inputs['Detail'].default_value = 6.0
    bu = nt.nodes.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = 0.3; nt.links.new(tn.outputs['Fac'], bu.inputs['Height']); nt.links.new(bu.outputs['Normal'], b.inputs['Normal'])
    # 這一岸：步道沿著溪往北（−z），x −2.0～2.0；左邊（西）草帶＋樹，右邊（東）是護岸，往下 2.2 m 是溪
    quad('path', (-2.0, 0.02, 12), (2.0, 0.02, 12), (2.0, 0.02, -120), (-2.0, 0.02, -120), PAVE)
    box('curb_l', -2.15, -2.0, 0, 0.12, -120, 12, CONC)
    quad('grass_l', (-40, 0.0, 12), (-2.15, 0.0, 12), (-2.15, 0.0, -120), (-40, 0.0, -120), GRASS)
    # 護岸：步道外緣一道矮牆（0.5 m）＋金屬欄杆（1.1 m）；牆外是往下的石砌坡（近自然：坡上長草、坡腳一排大石頭）
    box('parapet', 2.0, 2.35, -0.0, 0.3, -120, 12, CONC)
    for z in range(12, -121, -2):
        box('rail_post', 2.12, 2.2, 0.3, 1.12, z - 0.04, z + 0.04, RAIL)
    box('rail_top', 2.08, 2.24, 1.08, 1.14, -120, 12, RAIL); box('rail_mid', 2.13, 2.19, 0.68, 0.72, -120, 12, RAIL)
    WL = -1.4                                                             # 水面高度（親水的濱溪步道：離水面不高）
    # 岸坡（近自然工法）：長草的土坡，草一叢一叢（雜訊混兩種綠和一點土色）
    BANK = mat_flat('bank_grass', (0.07, 0.12, 0.05), 0.95); nt = BANK.node_tree; bb = nt.nodes['Principled BSDF']; tc = nt.nodes.new('ShaderNodeTexCoord')
    nz_ = nt.nodes.new('ShaderNodeTexNoise'); nz_.inputs['Scale'].default_value = 1.6; nz_.inputs['Detail'].default_value = 8.0; nt.links.new(tc.outputs['Object'], nz_.inputs['Vector'])
    rp = nt.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].color = (0.035, 0.07, 0.025, 1); rp.color_ramp.elements[1].color = (0.13, 0.17, 0.07, 1)
    nt.links.new(nz_.outputs['Fac'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], bb.inputs['Base Color'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.9; nt.links.new(nz_.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], bb.inputs['Normal'])
    def slope(name, xa, ya, xb, yb):
        V = []; F = []; nzs = 132
        for j in range(nzs + 1):
            zz = 12 - j; 
            for t in range(5):
                u = t / 4; x = xa + (xb - xa) * u; y = ya + (yb - ya) * u + 0.12 * noise.noise(Vector((x * 1.3, zz * 0.7, 3.1))) * math.sin(u * math.pi)
                V.append((x, y, zz))
        for j in range(nzs):
            for t in range(4): a0 = j * 5 + t; F.append((a0, a0 + 1, a0 + 6, a0 + 5) if xa < xb else (a0 + 1, a0, a0 + 5, a0 + 6))
        mesh_obj(name, V, F, BANK, smooth=True)
    slope('bank_e', 2.35, 0.0, 4.4, WL); slope('bank_w', 15.6, WL, 17.6, 0.0)
    quad('creek', (4.0, WL - 0.02, 12), (16.0, WL - 0.02, 12), (16.0, WL - 0.02, -120), (4.0, WL - 0.02, -120), WATER)
    quad('bed', (3.5, WL - 0.6, 12), (16.5, WL - 0.6, 12), (16.5, WL - 0.6, -120), (3.5, WL - 0.6, -120), STONE)
    # 坡腳的大石頭（近自然工法）：不規則的石塊，一半在水裡
    ROCK = mat_tex('rock', 'granite_tile_03', scale=2.0, tint=(0.74, 0.72, 0.68), rough=0.9)
    for k in range(150):
        side = k % 2; z = 10 - (k // 2) * 1.6 + rng.uniform(-0.6, 0.6); x = (4.5 + rng.uniform(-0.2, 1.0)) if side == 0 else (15.5 - rng.uniform(-0.2, 1.0))
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
        for v in bm.verts: v.co = v.co * (1 + 0.25 * noise.noise(v.co * 1.7 + Vector((k, 0, 0))))
        me = bpy.data.meshes.new('rock'); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('rock', me); sc.collection.objects.link(ob); ob.data.materials.append(ROCK)
        r = rng.uniform(0.45, 0.9); ob.scale = (r * rng.uniform(0.9, 1.4), r * rng.uniform(0.9, 1.3), r * rng.uniform(0.55, 0.8)); ob.location = g2b(x, WL + 0.05, z); ob.rotation_euler = (0, 0, rng.uniform(0, 6.28))
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    # 對岸：同樣的步道＋草地＋樹，後面是系館（白色、方正、窗戶亮著幾格）
    quad('path_e', (17.6, 0.02, 12), (21.0, 0.02, 12), (21.0, 0.02, -120), (17.6, 0.02, -120), PAVE)
    quad('grass_e', (21.0, 0.0, 12), (70, 0.0, 12), (70, 0.0, -120), (21.0, 0.0, -120), GRASS)
    box('parapet_e', 17.6, 17.95, 0.0, 0.3, -120, 12, CONC)                  # 對岸也是矮牆＋欄杆（不是一整片牆）
    for z in range(12, -121, -2): box('rail_post_e', 17.74, 17.82, 0.3, 1.12, z - 0.04, z + 0.04, RAIL)
    box('rail_top_e', 17.7, 17.86, 1.08, 1.14, -120, 12, RAIL)
    BLD = mat_flat('bld_white', (0.84, 0.83, 0.80), 0.8); WIN_D = mat_flat('win_dark', (0.12, 0.15, 0.18), 0.15, metal=0.3); WIN_L = mat_flat('win_lit', (0.9, 0.8, 0.6), 0.3, (1.0, 0.8, 0.55), 3.0)
    def building(x0, x1, z0, z1, h, fh=3.6, face='w'):
        box('bld', x0, x1, 0, h, z0, z1, BLD); box('bld_roof', x0 - 0.3, x1 + 0.3, h, h + 0.4, z0 - 0.3, z1 + 0.3, BLD)
        for fl in range(int(h // fh)):
            for zi in range(int((z1 - z0 - 1.0) // 2.6)):
                z = z0 + 0.9 + zi * 2.6; y0 = fl * fh + 1.0; x = x0 - 0.02
                quad('win', (x, y0, z + 1.5), (x, y0, z), (x, y0 + 1.6, z), (x, y0 + 1.6, z + 1.5), WIN_L if rng.random() < (0.55 if NIGHT else 0.35) else WIN_D)
    building(40, 54, -46, -22, 13.0); building(44, 60, -88, -60, 17.0)
    # 遠處的一座橋（跨溪的平板橋，兩側欄杆），橋面和步道同高
    box('bridge', 2.35, 17.6, -0.55, 0.05, -46, -42.5, CONC)
    for x0 in (2.35, 17.5):
        pass
    for zr in (-46.0, -42.6):
        box('bridge_rail', 2.35, 17.6, 0.05, 1.05, zr, zr + 0.1, RAIL)
        for x in range(3, 18, 2): box('bridge_post', x - 0.05, x + 0.05, 0.05, 1.05, zr - 0.02, zr + 0.12, RAIL)
    box('bridge_pier', 9.4, 10.4, WL - 0.6, -0.5, -45.5, -43.0, CONC)
    # 指南山：校園就在山腳，山很近、很高
    hills(-185, 420, [(0, 105, (0.045, 0.095, 0.04), 2.4), (80, 165, (0.08, 0.13, 0.11), 4.1), (200, 230, (0.15, 0.19, 0.25), 6.3)], crown=0.2, lumpy=0.6)   # 山往後退（原本 −125 太近，像一道牆）；lumpy＝小起伏＋空氣透視
    EYE = (1.4, 1.7, 9.0)                                                    # 鏡頭（下面 camera() 用同一個）
    TINT = [(0.48, 0.58, 0.48), (0.44, 0.54, 0.56), (0.42, 0.50, 0.56)] if NIGHT else [(0.40, 0.62, 0.34), (0.38, 0.56, 0.46), (0.40, 0.52, 0.55)]   # 傍晚：綠一點、飽和一點（不然在暖光下變土黃）
    forest_cards(5600, -220, 300, -186, -300, 0.8, 1.2, EYE, seed=21, names=('hill0',), tint=TINT[0])                 # 近的山：滿滿的樹（指南山麓）；v6 顏色壓暗、偏冷（v5 太亮太黃綠，像一團近的灌木）
    forest_cards(3200, -300, 400, -265, -400, 1.3, 1.8, EYE, seed=22, names=('hill1',), tint=TINT[1])   # 第二層：樹大一點、顏色淡一點（空氣透視）
    forest_cards(1800, -420, 520, -380, -560, 1.8, 2.4, EYE, seed=23, names=('hill2',), tint=TINT[2])   # 第三層（山頂）：v5 沒種樹，山頂露出一塊光禿的地
    load_lib('street_trees.glb', {'tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a'}); load_lib('street_props.glb', {'lamp_post', 'bench_park'})
    for z in range(2, -110, -8): place(rng.choice(['tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a']), -11 + rng.uniform(-3, 3), z + rng.uniform(-3, 3), yaw=rng.uniform(0, 6.28), s=rng.uniform(1.0, 1.3))   # 步道後面第二排（校園裡樹很多）
    for z in range(-4, -110, -10): place(rng.choice(['tree_camphor_a', 'tree_camphor_b']), -19 + rng.uniform(-3, 3), z + rng.uniform(-3, 3), yaw=rng.uniform(0, 6.28), s=rng.uniform(1.1, 1.4))
    for k, z in enumerate(range(6, -110, -7)):                               # 這一岸的樹（溪邊的楓香、樟樹；用樟樹的模型）
        place(rng.choice(['tree_camphor_a', 'tree_camphor_b']), -4.2 + rng.uniform(-0.8, 0.6), z + rng.uniform(-1.5, 1.5), yaw=rng.uniform(0, 6.28), s=rng.uniform(0.9, 1.15))
    for z in range(-2, -110, -6): place(rng.choice(['tree_camphor_a', 'tree_camphor_b', 'tree_banyan_a']), 23.5 + rng.uniform(-1, 2), z + rng.uniform(-2, 2), yaw=rng.uniform(0, 6.28))
    for z in range(-8, -110, -11): place(rng.choice(['tree_camphor_a', 'tree_camphor_b']), 31 + rng.uniform(-2, 2), z + rng.uniform(-3, 3), yaw=rng.uniform(0, 6.28), s=1.2)
    for z in (-9.0, -27.0, -45.0, -63.0, -81.0):                              # 路燈（燈頭朝步道）
        place('lamp_post', -2.5, z, yaw=math.radians(90)); light_point('lamp', -1.75, 3.9, z, 420 if NIGHT else 260, (1.0, 0.86, 0.68), 0.15)
    for z in (-14.0, -36.0): place('bench_park', -2.7, z, yaw=math.radians(90))
    camera(EYE, (11.5, -0.4, -34.0), float(opt('--lens', '24')))   # 站在步道靠溪那一側，斜看溪、遠處的橋與山

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
    # 指南路二段：雙向約 12 m（查證：各約 6 m）、人行道窄（約 1.2 m）
    quad('road', (-80, 0, 6), (80, 0, 6), (80, 0, -6), (-80, 0, -6), ASPH)
    for x0 in range(-80, 80, 6): quad('lane_dash', (x0, 0.004, -0.08), (x0 + 3, 0.004, -0.08), (x0 + 3, 0.004, 0.08), (x0, 0.004, 0.08), mat_flat('yellow', (0.8, 0.6, 0.12), 0.6))
    for k in range(9):                                                   # 斑馬線（往校門口）
        x = -4.0 + k * 1.0; quad('zebra', (x, 0.005, 5.4), (x + 0.5, 0.005, 5.4), (x + 0.5, 0.005, -5.4), (x, 0.005, -5.4), WHITE_PAINT)
    box('curb_n', -80, 80, 0, 0.16, -6.3, -6.0, STONE); box('walk_n', -80, 80, 0, 0.15, -12.5, -6.3, CONC)
    box('curb_s', -80, 80, 0, 0.16, 6.0, 6.3, STONE); box('walk_s', -80, 80, 0, 0.15, 6.3, 7.5, CONC)
    # 校門（照使用者 2026-10-16 提供的實景照片）：左邊一座很高、往右傾的紅磚斜塔（上面一個圓形牌——這裡只做素面圓盤，不畫校徽）；
    # 兩座一層樓的紅磚門房＋很深的灰色平屋頂（右邊那座比較大、屋簷有白色飾帶），中間是車道和柵欄；人行道是紅磚鋪面。
    BRICK_S = mat_tex('walk_brick', 'red_brick', scale=2.2, tint=(0.82, 0.62, 0.55), rough=0.85)
    ROOF = mat_flat('gate_roof', (0.30, 0.31, 0.32), rough=0.6); FASCIA = mat_flat('gate_fascia', (0.86, 0.85, 0.82), rough=0.6)
    box('walk_n_brick', -80, 80, 0.15, 0.16, -12.5, -6.3, BRICK_S)
    for x0, x1 in ((-60, -12.5), (13.5, 60)):                            # 門房兩側：低矮的紅磚花台牆
        box('wall', x0, x1, 0.15, 0.95, -13.4, -12.8, BRICK); box('wall_cap', x0 - 0.05, x1 + 0.05, 0.95, 1.05, -13.5, -12.7, STONE)
    # 斜塔：底 2.0×1.3 m、高 16 m，越往上越細、往右（+x，往校門那一邊）傾
    def slab_tower(bx0, bx1, bz0, bz1, h, lean, taper):
        top = [(bx0 + lean + taper, h, bz0 + 0.15), (bx1 + lean, h, bz0 + 0.15), (bx1 + lean, h, bz1 - 0.15), (bx0 + lean + taper, h, bz1 - 0.15)]
        bot = [(bx0, 0.15, bz0), (bx1, 0.15, bz0), (bx1, 0.15, bz1), (bx0, 0.15, bz1)]
        V = bot + top; F = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
        return mesh_obj('pylon', V, F, BRICK)
    slab_tower(-11.6, -9.6, -10.9, -9.6, 16.0, 1.6, 0.9)
    bm2 = bmesh.new(); bmesh.ops.create_circle(bm2, cap_ends=True, segments=40, radius=0.62); dm = bpy.data.meshes.new('medal'); bm2.to_mesh(dm); bm2.free()
    md = bpy.data.objects.new('medallion', dm); sc.collection.objects.link(md); md.data.materials.append(mat_flat('medal', (0.84, 0.80, 0.72), 0.5))
    md.location = g2b(-9.0, 12.6, -9.70); md.rotation_euler = (math.radians(90), 0, 0)
    # 兩座門房
    GLASS = mat_flat('booth_glass', (0.55, 0.62, 0.66), 0.08, metal=0.2)
    def booth(x0, x1, z0, z1, h, rx, rz, rt, fascia):
        box('booth', x0, x1, 0.15, h, z0, z1, BRICK)
        quad('booth_win', (x0 + 0.6, 0.95, z1 + 0.01), (x1 - 0.6, 0.95, z1 + 0.01), (x1 - 0.6, h - 0.5, z1 + 0.01), (x0 + 0.6, h - 0.5, z1 + 0.01), GLASS)
        box('booth_roof', x0 - rx, x1 + rx, h, h + rt, z0 - rz, z1 + rz, ROOF)
        if fascia: box('booth_fascia', x0 - rx - 0.02, x1 + rx + 0.02, h + rt * 0.55, h + rt + 0.02, z1 + rz - 0.02, z1 + rz + 0.04, FASCIA)
        light_point('booth_light', (x0 + x1) / 2, h - 0.3, z1 + rz - 0.6, 90, (1.0, 0.86, 0.66), 0.3)
    booth(-7.2, -3.4, -15.6, -12.4, 3.0, 1.1, 1.0, 0.55, False)
    booth(4.4, 11.4, -16.2, -12.6, 3.2, 1.3, 1.1, 0.65, True)
    box('drive', -3.4, 4.4, 0.13, 0.16, -40, -12.4, CONC)
    BAR = mat_flat('barrier', (0.85, 0.2, 0.15), 0.5)
    for x0, x1 in ((-3.2, 0.2), (0.8, 4.2)): box('bar', x0, x1, 0.95, 1.03, -12.9, -12.82, BAR)
    for x in (-3.3, 4.3): box('bar_post', x - 0.15, x + 0.15, 0.15, 1.1, -13.0, -12.7, mat_flat('bar_post', (0.85, 0.85, 0.82), 0.5))
    # 門後：校園的草地、大樹、系館（現代的白色建築，窗戶亮著幾格），再後面是山
    quad('campus_ground', (-80, 0.12, -13.5), (80, 0.12, -13.5), (80, 0.12, -90), (-80, 0.12, -90), GRASS)
    # 門內（查證：2004 年改成石材鋪面的 T 字形行人徒步區「都會林蔭廣場」、果夫樓與志希樓之間的橢圓形噴水池、盡頭是方正的四維堂）。建築外觀沒有照片，是推估的量體
    PAVE = mat_tex('plaza', 'granite_tile_03', scale=0.35, tint=(0.78, 0.76, 0.72), rough=0.75)
    box('plaza', -7.0, 7.0, 0.12, 0.17, -62, -13.4, PAVE); box('plaza_t', -24, 24, 0.12, 0.17, -40, -32, PAVE)
    import bmesh as _bm
    bm = _bm.new(); _bm.ops.create_circle(bm, cap_ends=True, segments=48, radius=1.0); me = bpy.data.meshes.new('fountain'); bm.to_mesh(me); bm.free()
    for nm, r, y0, y1, mt in (('basin', 1.0, 0.17, 0.62, STONE), ('water', 0.94, 0.55, 0.56, mat_flat('water', (0.10, 0.16, 0.18), 0.05, metal=0.2))):
        ob = bpy.data.objects.new(nm, me.copy()); sc.collection.objects.link(ob); ob.location = g2b(0, y1, -36); ob.scale = (9.0 * r, 4.5 * r, 1); ob.data.materials.append(mt)
        if nm == 'basin':
            ob2 = bpy.data.objects.new('basin_wall', None); sol = ob.modifiers.new('s', 'SOLIDIFY'); sol.thickness = y1 - y0; sol.offset = -1
    BLD = mat_flat('bld_white', (0.86, 0.85, 0.82), 0.8); WIN_D = mat_flat('win_dark', (0.12, 0.15, 0.18), 0.15, metal=0.3); WIN_L = mat_flat('win_lit', (0.9, 0.8, 0.6), 0.3, (1.0, 0.8, 0.55), 3.0)
    def building(x0, x1, z0, z1, h, fh=3.6):
        box('bld', x0, x1, 0.12, h, z0, z1, BLD); box('bld_roof', x0 - 0.3, x1 + 0.3, h, h + 0.4, z0 - 0.3, z1 + 0.3, BLD)
        for fl in range(int(h // fh)):
            for xi in range(int((x1 - x0 - 1.0) // 2.6)):
                x = x0 + 0.9 + xi * 2.6; y0 = fl * fh + 1.0
                quad('win', (x, y0, z1 + 0.02), (x + 1.5, y0, z1 + 0.02), (x + 1.5, y0 + 1.6, z1 + 0.02), (x, y0 + 1.6, z1 + 0.02), WIN_L if rng.random() < 0.3 else WIN_D)
    building(-11, 11, -82, -62, 14.0)            # 四維堂（方正）
    building(-38, -18, -62, -44, 30.0, fh=3.4); building(-34, -22, -60, -46, 37.0, fh=3.4)    # 照片：校門左後方很高的白色大樓（上面退縮一段）
    building(16, 36, -50, -30, 13.0)
    # 公車站牌（查證：真實站名「政大」「政大一」，遊戲寫「木柵大學」；路線 236、237、282、295、530、611、1503、小10…）——鏡頭這一側的人行道
    sign = Image.new('RGB', (360, 520), '#1f4e8c'); dd = ImageDraw.Draw(sign); fbig = ImageFont.truetype(FONT, 110); fsm = ImageFont.truetype(FONT, 46)
    # D115（2026-10-30）：政大改虛構的「木柵大學」（docs/WORLD_NAMING.md）。四個字放不下 110 px：縮到站牌寬度以內。
    # 註：nccu_gate.webp 的鏡頭看不到這塊站牌（在畫面左邊外面），現有的背景圖不用重算。
    while fbig.size > 40 and dd.textlength('木柵大學', font=fbig) > 330: fbig = ImageFont.truetype(FONT, fbig.size - 4)
    dd.rectangle([0, 0, 360, 150], fill='#ffffff'); dd.text((180, 78), '木柵大學', fill='#1f4e8c', font=fbig, anchor='mm')
    for k, rt in enumerate(('236', '237', '282', '295', '530', '611', '1503', '小10')): dd.text((90 + (k % 2) * 180, 200 + (k // 2) * 78), rt, fill='#ffffff', font=fsm, anchor='mm')
    sp = os.path.join(TMP, 'bus_sign.png'); sign.save(sp)
    box('bus_pole', -6.05, -5.95, 0.15, 3.2, 6.55, 6.65, METAL)
    quad('bus_sign', (-6.45, 2.05, 6.7), (-5.55, 2.05, 6.7), (-5.55, 3.35, 6.7), (-6.45, 3.35, 6.7), mat_img('bus_sign_m', sp, 0.4))
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
    camera((-2.0, 1.6, 11.0), (2.0, 5.0, -14.0), float(opt('--lens', '21')))   # 照使用者照片的角度：從對街斜看，左邊是斜塔

sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, SCENE, RW, RH, SAMPLES)
