"""ART-SHOP1 的驗收渲染（Blender 渲染圖，不是遊戲截圖）：傍晚（預設）／白天（--day）兩組光，＋1.75 m 參考柱、＋「背景試擺」的機車行角落。
寫法照 tools/blender/env_second/render_cycles.py（那份是共用工具，這裡不改它）：匯入 GLB → Cycles（CPU、低取樣＋降噪）→ PNG → 轉 WebP（PIL，quality 82，PNG 刪掉）。
光：
  - 傍晚：天空 Nishita（Blender 5 改名 MULTIPLE_SCATTERING，兩個都試；天空裡的太陽圓盤關掉，不然是物理亮度、整張過曝）仰角 8°、強度 0.08；
          太陽燈偏橘 (1.0, 0.72, 0.45)、4.5、從左前方斜射；店裡一盞 3000K 點光 (1.0, 0.70, 0.42) 220 W 在畫面上方；曝光 +0.2。
  - 白天（--day）：太陽仰角 50°、白光 (1.0, 0.97, 0.92)、4.0；天空 0.35；店裡的點光關掉，試擺場景的日光燈照樣開（中性白）；曝光 −0.1。
  - 色彩 Standard（AgX 會把飽和的紅、藍洗淡）。
場景（只在渲染裡，不進 GLB）：
  - 灰色地面；"wall"：一面背牆（Poly Haven painted_plaster_wall，CC0）；"ref": [x, z]：一根 1.75 m 的參考柱（祐廷的身高，SOP 2-6）。
  - "set": "bg"：背景試擺的機車行角落（SOP 3-1 第 2 點的遊戲截圖改成這個）：後牆、左右側牆、天花板、水泥地（Poly Haven granular_concrete＋程式畫的油漬、
    靠牆暗角、輪胎痕）、前面一根騎樓柱子、拉到一半的鐵捲門（＋捲門箱），升降台上一台機車的灰色量體（比例參考，不精細）。道具照 GLB 裡的位置（SPREAD）。
用法：
  /opt/blenv/bin/python tools/blender/env_second/bb_support/render_dusk.py -- <glb> <輸出資料夾> <前綴> <views.json>
        [--day] [--samples 40] [--exposure EV] [--sun W/m²] [--sky 強度] [--lamp W] [--only 名稱,名稱] [--scale 0.5] [--keep-png] [--threads N]
  交件的兩組：
  /opt/blenv/bin/python tools/blender/env_second/bb_support/render_dusk.py -- assets/models/env/second_ai/bb_support/scooter_shop_props.glb \\
        docs/art-rebuild/second_ai/test_shots/bb_support/scooter_shop shop1_dusk tools/blender/env_second/bb_support/scooter_shop_views.json
  /opt/blenv/bin/python tools/blender/env_second/bb_support/render_dusk.py -- assets/models/env/second_ai/bb_support/scooter_shop_props.glb \\
        docs/art-rebuild/second_ai/test_shots/bb_support/scooter_shop shop1_day tools/blender/env_second/bb_support/scooter_shop_views.json --day
views.json（遊戲座標：y 上、+z 朝前）：[{"name": 名稱, "eye": [x,y,z], "look": [x,y,z], "lens": 焦距mm, "res": "1280x640", "samples": 40,
  "only": 頂層節點名稱（只渲染這一件，並把它搬到原點、不轉）或 {名稱: [x, z, yaw°], ...}（只渲染這幾件、擺在指定位置）,
  "wall": 背牆的 z, "ref": [x, z], "set": "bg", "lamp": [x,y,z]（點光位置；不給就在看的點上方 2.5 m、往前 0.8 m）, "lamp_w": 點光瓦數,
  "cut": [試擺場景的物件名稱]（鏡頭看不到、但照樣擋光：遊戲的室內鏡頭會把擋住玩家的牆淡出，game_cam 用它拿掉騎樓的梁和鐵捲門）}, ...]
--only：只渲染這幾個鏡頭（名稱用逗號分開）；--scale：解析度倍率（試算用）。
"""
import json, math, os, sys
import numpy as np
import bpy
from mathutils import Vector, Matrix
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
DAY = '--day' in A
SAMPLES = int(opt('--samples', 40)); SCALE = float(opt('--scale', 1.0))
ONLY = opt('--only', None); ONLY = set(ONLY.split(',')) if ONLY else None
HERE = os.path.dirname(os.path.abspath(__file__)); TEXR = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'textures')
g2b = lambda x, y, z: Vector((x, -z, y))
SUN_ELEV, SUN_AZ = (50.0, -35.0) if DAY else (8.0, -35.0)          # 仰角；方位（rz：−35° 是從左前方照進來）
SUN_COL = (1.0, 0.97, 0.92) if DAY else (1.0, 0.72, 0.45)
LAMP_COL = (1.0, 0.70, 0.42)
LAMP_W = float(opt('--lamp', 0 if DAY else 220))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.view_settings.view_transform = opt('--view', 'Standard')
sc.view_settings.exposure = float(opt('--exposure', -0.1 if DAY else 0.2))
sc.cycles.max_bounces = 6
if '--threads' in A: sc.render.threads_mode = 'FIXED'; sc.render.threads = int(opt('--threads', 4))
# 天空
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
for t in ('NISHITA', 'MULTIPLE_SCATTERING', 'SINGLE_SCATTERING'):
    try: sky.sky_type = t; break
    except Exception: continue
try: sky.sun_elevation = math.radians(SUN_ELEV); sky.sun_rotation = math.radians((SUN_AZ + 180 + 360) % 360)
except Exception: pass
try: sky.sun_disc = False                # 太陽交給太陽燈：天空裡的太陽圓盤是物理亮度，會整片過曝
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = float(opt('--sky', 0.35 if DAY else 0.08))
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sun', 4.0 if DAY else 4.5)); sun.data.color = SUN_COL; sun.data.angle = math.radians(1.2)
sun.rotation_euler = (math.radians(90 - SUN_ELEV), 0, math.radians(SUN_AZ))
lamp = bpy.data.objects.new('lamp', bpy.data.lights.new('lamp', 'POINT')); sc.collection.objects.link(lamp)
lamp.data.energy = LAMP_W; lamp.data.color = LAMP_COL; lamp.data.shadow_soft_size = 0.3


def mat(name, col, rough=0.8, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m


def textured(name, path, scale, tint, rough=0.9, mask=None, mask_k=0.0, rough_mask=0.0):
    """Poly Haven 底色 × tint；mask（非色彩圖，0～1）：乘暗 mask_k、粗糙度減 rough_mask（油漬亮）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; N_ = m.node_tree.nodes; L_ = m.node_tree.links; b = N_['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    if not os.path.exists(path): b.inputs['Base Color'].default_value = (*tint, 1); return m
    tc = N_.new('ShaderNodeTexCoord'); mp = N_.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = scale
    ti = N_.new('ShaderNodeTexImage'); ti.image = bpy.data.images.load(path)
    L_.new(tc.outputs['UV'], mp.inputs['Vector']); L_.new(mp.outputs['Vector'], ti.inputs['Vector'])
    mx = N_.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
    mx.inputs[6].default_value = (*tint, 1); L_.new(ti.outputs['Color'], mx.inputs[7])
    out = mx.outputs[2]
    if mask is not None:
        tm = N_.new('ShaderNodeTexImage'); tm.image = mask; tm.image.colorspace_settings.name = 'Non-Color'; L_.new(tc.outputs['UV'], tm.inputs['Vector'])
        m2 = N_.new('ShaderNodeMix'); m2.data_type = 'RGBA'; m2.blend_type = 'MULTIPLY'; L_.new(tm.outputs['Color'], m2.inputs['Factor'])
        m2.inputs[7].default_value = (1 - mask_k, 1 - mask_k, 1 - mask_k, 1); L_.new(out, m2.inputs[6]); out = m2.outputs[2]
        mr = N_.new('ShaderNodeMath'); mr.operation = 'MULTIPLY_ADD'; L_.new(tm.outputs['Color'], mr.inputs[0]); mr.inputs[1].default_value = -rough_mask
        mr.inputs[2].default_value = rough; L_.new(mr.outputs[0], b.inputs['Roughness'])
    L_.new(out, b.inputs['Base Color'])
    return m


def obj_box(name, x0, x1, y0, y1, z0, z1, m, bevel=0.0):
    """遊戲座標的方塊（＋bevel 修改器）"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=g2b((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    o = bpy.context.active_object; o.name = name; o.scale = (x1 - x0, z1 - z0, y1 - y0); bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = 3
    o.data.materials.append(m); return o


def obj_cyl(name, p0, p1, r, m, verts=24):
    a, b = g2b(*p0), g2b(*p1); d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object; o.name = name; o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o


# 灰色地面、背牆、參考柱
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -0.002)); gp = bpy.context.active_object; gp.data.materials.append(mat('ground', (0.30, 0.30, 0.29), 0.88))
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0)); wall = bpy.context.active_object; wall.name = 'render_wall'
wall.scale = (14, 5, 1); wall.rotation_euler = (math.radians(90), 0, 0)
PLASTER = os.path.join(TEXR, 'painted_plaster_wall', 'painted_plaster_wall_diff_1k.jpg')
wmat = textured('wall', PLASTER, (7.0, 2.5, 1.0), (0.62, 0.58, 0.52), 0.92); wall.data.materials.append(wmat)
refc = obj_cyl('ref_175', (0, 0, 0), (0, 1.66, 0), 0.09, mat('ref', (0.55, 0.56, 0.58), 0.6), 24)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=(0, 0, 1.66)); rs = bpy.context.active_object; rs.name = 'ref_top'; rs.data.materials.append(refc.data.materials[0])
bpy.ops.object.shade_smooth()
REF = [refc, rs]                                                                   # 柱頂（半球）＝1.75 m
for yy in (0.5, 1.0, 1.5):                                                         # 每 50 cm 一道深色刻度
    REF.append(obj_cyl('ref_tick', (0, yy - 0.006, 0), (0, yy + 0.006, 0), 0.093, mat('tick', (0.08, 0.08, 0.09), 0.6), 24))
REF_BASE = [o.location.copy() for o in REF]

# ---- 背景試擺：機車行角落 ----
SET = []


def build_set():
    if SET: return SET
    X0, X1, ZB, ZF, H = -3.1, 3.4, -1.8, 2.35, 3.2
    # 水泥地（油漬、靠牆暗角、輪胎痕）：圖直接用 numpy 產生
    W_, H_ = 1024, 768; xs = np.linspace(X0, X1, W_); zs = np.linspace(ZF + 2.0, ZB, H_); XX, ZZ = np.meshgrid(xs, zs)
    rng = np.random.default_rng(5); st = np.zeros_like(XX)
    for (cx, cz, r, k) in ((-0.05, 0.1, 0.55, 0.9), (0.5, 0.55, 0.25, 0.8), (2.4, -0.45, 0.42, 0.9), (1.5, 0.75, 0.3, 0.6), (-2.2, -1.1, 0.35, 0.5),
                           (0.9, -1.2, 0.3, 0.5), (-1.2, 0.9, 0.25, 0.4)):
        st = np.maximum(st, k * np.exp(-((XX - cx) ** 2 + (ZZ - cz) ** 2) / (2 * (r * 0.6) ** 2)))
    for (cx, cz, r, k) in ((0.6, 1.35, 0.32, 0.75), (-0.9, 1.6, 0.22, 0.6), (1.2, 2.0, 0.2, 0.5), (-0.3, 2.3, 0.28, 0.55)):   # 門口到升降台之間（看得到的地方）
        st = np.maximum(st, k * np.exp(-((XX - cx) ** 2 + (ZZ - cz) ** 2) / (2 * (r * 0.6) ** 2)))
    for _ in range(40):
        cx, cz, r = rng.uniform(X0, X1), rng.uniform(ZB, ZF + 1), rng.uniform(0.03, 0.12)
        st = np.maximum(st, rng.uniform(0.3, 0.7) * np.exp(-((XX - cx) ** 2 + (ZZ - cz) ** 2) / (2 * r * r)))
    for tx in (-0.05 - 0.02, -0.05 + 0.06):                                         # 機車推進推出的輪胎痕（從門口到升降台）
        st = np.maximum(st, 0.35 * np.exp(-((XX - tx - 0.04 * np.sin(ZZ * 2)) / 0.04) ** 2) * (ZZ > 0.3))
    wallao = np.clip(1 - (ZZ - ZB) / 0.35, 0, 1) ** 1.6 + np.clip(1 - (XX - X0) / 0.35, 0, 1) ** 1.6
    st = np.clip(st + 0.5 * wallao, 0, 1)
    img = bpy.data.images.new('floor_mask', W_, H_, alpha=False); px = np.zeros((H_, W_, 4), np.float32); px[..., 0] = px[..., 1] = px[..., 2] = st; px[..., 3] = 1     # 第 0 列＝v 0＝最前面
    img.pixels.foreach_set(px.ravel())
    fl = obj_box('set_floor', X0, X1, -0.02, -0.001, ZB, ZF + 2.0, textured('floor', os.path.join(TEXR, 'granular_concrete', 'granular_concrete_diff_1k.jpg'),
                 (4.0, 3.0, 1.0), (0.62, 0.62, 0.6), 0.86, img, 0.68, 0.4))
    fl.data.uv_layers.active.name = 'UVMap'
    # 平面 UV：重新照世界座標鋪（cube 的 UV 不能用）
    me = fl.data; uv = me.uv_layers.active.data; Mw = fl.matrix_world
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = Mw @ me.vertices[me.loops[li].vertex_index].co; uv[li].uv = ((co.x - X0) / (X1 - X0), (co.y + ZF + 2.0) / (ZF + 2.0 - ZB))
    plaster = textured('set_plaster', PLASTER, (5.0, 2.5, 1.0), (0.66, 0.62, 0.55), 0.92)
    SET.append(fl)
    SET.append(obj_box('set_back', X0, X1, 0, H, ZB - 0.1, ZB - 0.001, plaster))
    SET.append(obj_box('set_side', X0 - 0.1, X0, 0, H, ZB - 0.1, ZF, plaster))
    SET.append(obj_box('set_side_r', X1 - 0.1, X1, 0, H, ZB - 0.1, ZF - 0.25, plaster))                                # 右邊和隔壁店的隔間牆（接到騎樓柱子）
    SET.append(obj_box('set_skirt', X0, X1, 0, 0.12, ZB - 0.001, ZB + 0.012, mat('skirt', (0.25, 0.24, 0.23), 0.7)))     # 後牆踢腳（磨石子色）
    SET.append(obj_box('set_ceiling', X0, X1, H, H + 0.1, ZB, ZF, mat('ceil', (0.55, 0.55, 0.53), 0.9)))
    SET.append(obj_box('set_beam', X0, X1, H - 0.4, H, ZF - 0.2, ZF + 0.25, mat('beam', (0.6, 0.58, 0.54), 0.85), 0.01))   # 騎樓的梁
    SET.append(obj_box('set_pillar', 2.75, 3.3, 0, H - 0.4, ZF - 0.25, ZF + 0.3, plaster, 0.01))                         # 騎樓柱子
    SET.append(obj_box('set_pillar_tile', 2.74, 3.31, 0, 1.0, ZF - 0.26, ZF + 0.31, mat('tile', (0.42, 0.36, 0.3), 0.5), 0.004))   # 柱子下段的磁磚
    # 鐵捲門：拉到一半（下緣離地 2.15），捲門箱在梁下
    sh = mat('shutter', (0.55, 0.56, 0.57), 0.45, 0.3); nts = sh.node_tree; wv = nts.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'
    wv.inputs['Scale'].default_value = 32.0; bm = nts.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.6
    nts.links.new(wv.outputs['Fac'], bm.inputs['Height']); nts.links.new(bm.outputs['Normal'], nts.nodes['Principled BSDF'].inputs['Normal'])
    SET.append(obj_box('set_shutter', X0, 2.75, 2.3, H - 0.4, ZF + 0.02, ZF + 0.04, sh))
    SET.append(obj_box('set_shutter_bar', X0, 2.75, 2.27, 2.32, ZF + 0.01, ZF + 0.06, mat('bar', (0.3, 0.3, 0.31), 0.5, 0.3), 0.005))
    SET.append(obj_box('set_shutter_box', X0, 2.75, H - 0.62, H - 0.4, ZF - 0.05, ZF + 0.2, mat('sbox', (0.48, 0.49, 0.5), 0.6, 0.2), 0.01))
    # 天花板的日光燈（燈管；面光在下面的鏡頭迴圈裡加，傍晚、白天都亮）
    SET.append(obj_box('set_tube', -1.4, 0.2, H - 0.06, H - 0.02, -0.4, -0.35, mat('tube_m', (0.9, 0.9, 0.88), 0.4)))
    # 升降台上一台機車的灰色量體（比例參考；升降台在 SPREAD (−0.05, 0.05)，檯面頂 0.34，前輪頂在夾座的擋板上）
    g = mat('scooter_ref', (0.13, 0.135, 0.14), 0.6); k = mat('scooter_ref_dk', (0.05, 0.05, 0.055), 0.65)   # 暗灰：看得出是量體、不搶道具
    zc, top = 0.05, 0.34
    for nm_, xw in (('rear', -0.70), ('front', 0.50)):
        SET.append(obj_cyl('set_wheel_' + nm_, (xw, top + 0.23, zc - 0.055), (xw, top + 0.23, zc + 0.055), 0.23, k, 28))
    SET.append(obj_box('set_floorboard', -0.35, 0.25, top + 0.26, top + 0.34, zc - 0.16, zc + 0.16, g, 0.02))
    SET.append(obj_box('set_body', -1.0, -0.2, top + 0.30, top + 0.72, zc - 0.18, zc + 0.18, g, 0.07))
    SET.append(obj_box('set_seat', -0.95, -0.22, top + 0.72, top + 0.80, zc - 0.15, zc + 0.15, k, 0.03))
    SET.append(obj_box('set_shield', 0.22, 0.34, top + 0.26, top + 0.86, zc - 0.21, zc + 0.21, g, 0.04))
    SET.append(obj_cyl('set_column', (0.50, top + 0.23, zc), (0.36, top + 0.95, zc), 0.035, g, 12))
    SET.append(obj_cyl('set_bar', (0.35, top + 0.96, zc - 0.34), (0.35, top + 0.96, zc + 0.34), 0.02, k, 12))
    SET.append(obj_box('set_head', 0.30, 0.42, top + 0.86, top + 1.0, zc - 0.12, zc + 0.12, g, 0.03))
    for o in SET: o.hide_render = True
    return SET


cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
meshes = [o for o in sc.objects if o.type == 'MESH' and o not in (gp, wall) and not o.name.startswith('ref')]
orig = {o.name: o.matrix_world.copy() for o in meshes}
tube_lamp = None
for v in views:
    name = v['name']
    if ONLY and name not in ONLY: continue
    for o in meshes:
        o.matrix_world = orig[o.name]; o.hide_render = False
    if v.get('only'):
        keep = v['only'] if isinstance(v['only'], dict) else {v['only']: [0.0, 0.0, 0.0]}
        for o in meshes:
            if o.name in keep:
                x, z, yaw = keep[o.name]; o.matrix_world = Matrix.Translation(g2b(x, 0.0, z)) @ Matrix.Rotation(math.radians(yaw), 4, 'Z')
            else: o.hide_render = True
    in_set = v.get('set') == 'bg'
    if in_set:
        cut = set(v.get('cut', []))                                                  # 剖面：鏡頭看不到這些（還是會擋光、有陰影），像遊戲室內鏡頭把擋住的牆淡出
        for o in build_set(): o.hide_render = False; o.visible_camera = o.name not in cut
        if tube_lamp is None:                                                      # 天花板的日光燈（營業中，白天也開）：傍晚偏暖、白天中性白
            tube_lamp = bpy.data.objects.new('tube', bpy.data.lights.new('tube', 'AREA')); tube_lamp.data.shape = 'RECTANGLE'
            tube_lamp.data.size, tube_lamp.data.size_y = 1.6, 0.08; tube_lamp.data.energy = 160
            tube_lamp.data.color = (1.0, 0.97, 0.92) if DAY else (1.0, 0.9, 0.78)
            tube_lamp.location = g2b(-0.6, 3.11, -0.375); sc.collection.objects.link(tube_lamp)
    else:
        for o in SET: o.hide_render = True
    if tube_lamp is not None: tube_lamp.hide_render = not in_set
    gp.hide_render = in_set
    wall.hide_render = in_set or 'wall' not in v
    if 'wall' in v: wall.location = g2b(0.0, 2.5, v['wall'])
    for o, b0 in zip(REF, REF_BASE):
        o.hide_render = 'ref' not in v
        if 'ref' in v: o.location = b0 + g2b(v['ref'][0], 0.0, v['ref'][1])
    look = v['look']; lp = v.get('lamp') or [look[0], look[1] + 2.5, look[2] + 0.8]
    lamp.location = g2b(*lp); lamp.data.energy = 0.0 if DAY else float(v.get('lamp_w', LAMP_W))
    rw, rh = map(int, v.get('res', '1280x640').split('x'))
    sc.render.resolution_x, sc.render.resolution_y = max(16, int(rw * SCALE)), max(16, int(rh * SCALE))
    sc.cycles.samples = int(v.get('samples', SAMPLES))
    cam.data.lens = v['lens']; cam.location = g2b(*v['eye']); d = g2b(*look) - g2b(*v['eye']); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    png = os.path.join(outdir, f'{prefix}_{name}.png'); sc.render.filepath = png
    bpy.ops.render.render(write_still=True)
    from PIL import Image
    Image.open(png).convert('RGB').save(png[:-4] + '.webp', 'WEBP', quality=82)
    if '--keep-png' not in A: os.remove(png)
    print('render', png[:-4] + '.webp', flush=True)
