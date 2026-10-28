"""室內光照烘焙（INTERIOR-AAA-REVIEW-1028 的 P1；LAWWW2-C 2026-10-28）
GLB → Blender Cycles 烘焙「光照貼圖」（只有光、不含顏色：直接光＋反彈光）→ 新的 GLB（每個網格多一套 UV＝TEXCOORD_1）＋兩張光照貼圖：
  <prefix>_day.webp（白天：窗外天光＋太陽＋日光燈）、<prefix>_night.webp（晚上：只有日光燈＋一點夜空）。
遊戲（zones3d.js 的 attachRoomGLB，見 patches/interior_lightmap_*.patch）把它接到材質的 lightMap（uv1），照時段混合白天／晚上那張，室內的半球光在這些材質上關掉。

為什麼：遊戲的室內只有一盞方向光＋半球光，沒有反彈光、接觸陰影（AO）——整間平均亮、東西像貼在地上（檢討報告第 0、3 節）。
3A 作品和手機遊戲的做法：間接光烘焙成貼圖、即時光只照會動的東西（報告第 2-1 節）。

用法（Blender 自帶的 python）：
/opt/blenv/bin/python tools/blender/env_second/lightbake/bake_room.py -- --in <房間.glb> --out <輸出.glb> --lm <輸出前綴（不含 _day.png）> --url <遊戲裡的路徑前綴>
   [--res 1024] [--samples 64] [--emit 材質名=強度,...] [--hide 材質名或物件名的正規式（烘焙時當作不存在：玻璃）]
   [--sun 方位角,仰角,強度（白天的太陽，遊戲座標的羅盤方位）] [--sky 1.0] [--nightsky 0.03] [--scale 2.0] [--keep-instances]
   [--nolm 正規式（不做光照貼圖、照舊即時光的物件：發光的燈面；烘焙時照樣看得到、照樣發光）] [--lights …（見下面）] [--smooth 像素]
物件的自訂屬性 lm（GLB extras）：光照貼圖分給它的比例（1＝照面積平均；小東西、天花板上的東西 0.2～0.5）。
之後用系統的 python3 把 _day.png／_night.png 轉成 WebP（lightbake/to_webp.py），放到 --url 指的位置。
--scale：貼圖存 (光/π)/scale（8 位元存不下太亮的地方），遊戲的 lightMapIntensity＝π×scale（寫進 <prefix>.json）。
實例化的網格（EXT_mesh_gpu_instancing，例如 201 的 48 張椅子）：每一張的光不一樣，烘焙前展開成各自的網格（同一個材質的合併成一個）。
"""
import bpy, bmesh, sys, os, json, math, re
import numpy as np
from mathutils import Vector

A = sys.argv[sys.argv.index('--') + 1:]
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
IN, OUT, LM = arg('--in'), arg('--out'), arg('--lm')
RES = int(arg('--res', '1024')); SAMPLES = int(arg('--samples', '64')); SCALE = float(arg('--scale', '2.0'))
EMIT = {}
for kv in (arg('--emit', '') or '').split(','):
    if '=' in kv: k, v = kv.split('='); EMIT[k] = float(v)
HIDE = re.compile(arg('--hide', r'glass')) if arg('--hide', 'glass') else None
NOLM = re.compile(arg('--nolm', r'ceil_light')) if arg('--nolm', 'ceil_light') else None
SKY = float(arg('--sky', '1.0')); NIGHTSKY = float(arg('--nightsky', '0.03'))
SUN = [float(v) for v in arg('--sun', '250,30,3.0').split(',')]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(IN))
sc = bpy.context.scene
print('import', len(bpy.data.objects), 'objects', flush=True)

# ---- 1. 實例展開：同一個網格被好幾個物件共用（或幾何節點的實例）→ 各自一份，再照材質合併 ----
def realize():
    if '--keep-instances' in A: return
    # 幾何節點的實例（新版匯入器可能用這個處理 EXT_mesh_gpu_instancing）：套用修改器
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and any(m.type == 'NODES' for m in o.modifiers):
            bpy.context.view_layer.objects.active = o
            for m in list(o.modifiers):
                if m.type == 'NODES':
                    try: bpy.ops.object.modifier_apply(modifier=m.name)
                    except Exception as e: print('modifier_apply', o.name, e)
    users = {}
    for o in bpy.data.objects:
        if o.type == 'MESH': users.setdefault(o.data.name, []).append(o)
    for name, objs in users.items():
        if len(objs) < 2: continue
        for o in objs: o.data = o.data.copy()
        # 照材質合併成一個（例如 48 張椅子 → 一個網格），名字用第一個的父物件名＋_baked
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        objs[0].name = (objs[0].parent.name if objs[0].parent else objs[0].name) + '_inst'
        print('realized', name, len(objs), '→', objs[0].name, flush=True)
realize()

# ---- 2. 烘焙的物件：網格、不是玻璃（HIDE）、有面 ----
def mats(o): return [s.material.name for s in o.material_slots if s.material]
def hidden(o): return bool(HIDE and (HIDE.search(o.name) or any(HIDE.search(m) for m in mats(o))))
objs = [o for o in bpy.data.objects if o.type == 'MESH' and len(o.data.polygons) and not hidden(o) and not (NOLM and NOLM.search(o.name))]
for o in bpy.data.objects:
    if o.type == 'MESH' and hidden(o): o.hide_render = True   # 玻璃：烘焙時當作不存在（窗外的光直接進來）
print('bake objects', len(objs), flush=True)

# ---- 3. 第二套 UV（LM）：智慧展開＋所有物件一起排進同一張貼圖 ----
for o in objs:
    uv = o.data.uv_layers
    if 'LM' not in uv: uv.new(name='LM')
    uv.active = uv['LM']
bpy.ops.object.select_all(action='DESELECT')
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
# 照真實面積縮放（大的牆、地板拿到比較多像素），再一起排：間隔 = 4 個像素
try: bpy.ops.uv.average_islands_scale()
except Exception as e: print('average_islands_scale', e)
bpy.ops.object.mode_set(mode='OBJECT')
for o in objs:   # 自訂屬性 lm：這個物件的島整個縮放（之後一起排，比例保留）
    k = float(o.get('lm', 1.0))
    if abs(k - 1.0) > 1e-3:
        uvd = o.data.uv_layers['LM'].data; buf = np.empty(len(uvd) * 2, dtype=np.float32); uvd.foreach_get('uv', buf); uvd.foreach_set('uv', buf * k)
# 看不到的面少分像素：牆（WALL_，自訂屬性 dir＝往室內）背對室內的面（和 dir 反方向；側面不算：窗洞的側邊、柱子的側面看得到）、地板／平台朝下的面、天花板朝上的面——島縮到 5%（照樣有 UV，只是很小）
def shrink_hidden(o):
    d = o.get('dir'); dv = Vector((d[0], -d[2], d[1])) if d is not None and len(d) == 3 else None   # 遊戲座標 → Blender
    nm = o.name.lower(); bm = bmesh.new(); bm.from_mesh(o.data); uvl = bm.loops.layers.uv['LM']; mw = o.matrix_world.to_3x3(); n_sh = 0
    for f in bm.faces:
        nrm = (mw @ f.normal).normalized(); hide = False
        if dv is not None and nrm.dot(dv) < -0.3 and not ('ceil' in nm and nrm.z < -0.5): hide = True
        if ('floor' in nm or 'plat' in nm) and nrm.z < -0.5: hide = True
        if 'ceil' in nm and nrm.z > 0.5: hide = True
        if hide:
            cu = sum((l[uvl].uv for l in f.loops), Vector((0, 0))) / len(f.loops)
            for l in f.loops: l[uvl].uv = cu + (l[uvl].uv - cu) * 0.05
            n_sh += 1
    bm.to_mesh(o.data); bm.free(); return n_sh
print('shrunk hidden faces', sum(shrink_hidden(o) for o in objs), flush=True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.pack_islands(margin=4.0 / RES, rotate=True)
bpy.ops.object.mode_set(mode='OBJECT')

# ---- 4. 貼圖＋每個材質裡一個「要寫進去」的貼圖節點（Cycles 烘焙寫到作用中的貼圖節點，用作用中的 UV）----
img = bpy.data.images.new('LM_bake', RES, RES, alpha=False, float_buffer=True)
img.colorspace_settings.name = 'Non-Color'
done = set()
for o in objs:
    for s in o.material_slots:
        m = s.material
        if not m or m.name in done: continue
        done.add(m.name); m.use_nodes = True; nt = m.node_tree
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = img; n.name = 'LM_target'
        for x in nt.nodes: x.select = False
        n.select = True; nt.nodes.active = n
        # 發光（日光燈）：烘焙時加強
        for k, v in EMIT.items():
            if k in m.name:
                bsdf = next((x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED'), None)
                if bsdf:
                    bsdf.inputs['Emission Strength'].default_value = v
                    if not any(bsdf.inputs['Emission Color'].default_value[:3]): bsdf.inputs['Emission Color'].default_value = (1.0, 0.97, 0.9, 1.0)
                    print('emit', m.name, v, flush=True)

# ---- 5. 光：天空（Nishita）＋太陽（白天）；晚上只有夜空 ----
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 4; sc.cycles.glossy_bounces = 1; sc.cycles.transparent_max_bounces = 16
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'; sky.sun_disc = False; sky.sun_elevation = math.radians(max(SUN[1], 2)); sky.sun_rotation = math.radians(SUN[0])
except Exception: pass
nt.links.new(sky.outputs['Color'], bg.inputs['Color'])
sd = bpy.data.lights.new('sun', 'SUN'); sd.angle = math.radians(1.0); so = bpy.data.objects.new('sun', sd); sc.collection.objects.link(so)
# 遊戲座標的羅盤方位（0＝北＝−z、90＝東＝+x）→ 太陽「照過來」的方向；Blender 的太陽沿自己的 −Z 照
az, el = math.radians(SUN[0]), math.radians(SUN[1])
to_sun_game = Vector((math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el)))
to_sun = Vector((to_sun_game.x, -to_sun_game.z, to_sun_game.y))
so.rotation_euler = to_sun.to_track_quat('Z', 'Y').to_euler()

# 日光燈：在燈具的位置放真的面光源（發光的網格本身也亮，但 Cycles 從很小的發光面取樣很吵：10-28 第一次烘焙牆上一塊一塊的）
# --lights x0,x1,z0,z1,y,nx,nz,W[,sx,sz]（可以重複，用 ; 分開）：x0..x1 × z0..z1 的格子中心、高 y，nx×nz 盞，每盞 W 瓦，燈的大小 sx×sz（預設 1.2×0.3 m）
AREAS = []
for spec in (arg('--lights', '') or '').split(';'):
    if not spec.strip(): continue
    v = [float(t) for t in spec.split(',')]; x0, x1, z0, z1, y, nx, nz, Wt = v[:8]; lsx, lsz = (v[8], v[9]) if len(v) >= 10 else (1.2, 0.3)
    for i in range(int(nx)):
        for j in range(int(nz)):
            x = x0 + (x1 - x0) * (i + 0.5) / nx; z = z0 + (z1 - z0) * (j + 0.5) / nz
            ld = bpy.data.lights.new(f'fx{i}_{j}', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = lsx; ld.size_y = lsz; ld.energy = Wt; ld.color = (1.0, 0.97, 0.92)
            lo = bpy.data.objects.new(ld.name, ld); sc.collection.objects.link(lo); lo.location = Vector((x, -z, y - 0.01)); AREAS.append(lo)   # 朝下（Blender 的面光源朝 −Z）
print('area lights', len(AREAS), flush=True)

def bake(tag, sky_strength, sun_energy, emit_scale):
    bg.inputs['Strength'].default_value = sky_strength; sd.energy = sun_energy
    for o in objs:
        for s in o.material_slots:
            m = s.material
            if not m: continue
            for k, v in EMIT.items():
                if k in m.name:
                    b = next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
                    if b: b.inputs['Emission Strength'].default_value = v * emit_scale
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    sc.render.bake.margin = 6; sc.render.bake.use_clear = True
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=6, use_clear=True)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(RES, RES, 4)[:, :, :3]
    print(tag, 'lm mean', float(px.mean()), 'p99', float(np.percentile(px, 99)), flush=True)
    return px

def smooth(px, r):
    """只在有用到的像素之間平滑（沒用到的像素是 0，不參加）：減少取樣不夠的斑點。r＝盒狀模糊的半徑（像素，做三次≈高斯）"""
    if r <= 0: return px
    m = (px.max(axis=2) > 1e-6).astype(np.float32)
    def box(a):
        for ax in (0, 1):
            c = np.cumsum(np.pad(a, [(r + 1, r) if k == ax else (0, 0) for k in range(a.ndim)], mode='constant'), axis=ax)
            a = (np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax) - np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax))
        return a
    num = px * m[:, :, None]; den = m.copy()
    for _ in range(3): num = np.stack([box(num[:, :, k]) for k in range(3)], axis=2); den = box(den)
    out = np.where(den[:, :, None] > 1e-6, num / np.maximum(den[:, :, None], 1e-6), 0)
    return np.where(m[:, :, None] > 0, out, px)
SMOOTH = int(arg('--smooth', '0'))

def save(px, path):
    px = smooth(px, SMOOTH)
    v = np.clip(px / SCALE, 0, 1)
    s = np.where(v <= 0.0031308, v * 12.92, 1.055 * np.power(v, 1 / 2.4) - 0.055)   # sRGB 編碼：暗部細節多一點
    out = bpy.data.images.new('LM_out', RES, RES, alpha=True)
    rgba = np.concatenate([s, np.ones((RES, RES, 1), np.float32)], axis=2)
    out.pixels[:] = rgba.ravel(); out.filepath_raw = path; out.file_format = 'PNG'; out.save(); bpy.data.images.remove(out)
    print('saved', path, flush=True)

os.makedirs(os.path.dirname(os.path.abspath(LM)), exist_ok=True)
day = bake('day', SKY, SUN[2], 1.0); save(day, LM + '_day.png')
night = bake('night', NIGHTSKY, 0.0, 1.0); save(night, LM + '_night.png')

# ---- 6. 清掉烘焙用的節點、UV：LM 排第二（TEXCOORD_1）、原本的 UV 當作用中 ----
for m in bpy.data.materials:
    if m.node_tree:
        for n in [x for x in m.node_tree.nodes if x.name == 'LM_target']: m.node_tree.nodes.remove(n)
    for k, v in EMIT.items():
        if k in m.name and m.node_tree:
            b = next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
            if b: b.inputs['Emission Strength'].default_value = 1.0
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.hide_render = False
        uv = o.data.uv_layers
        if len(uv) and uv[0].name != 'LM': uv.active = uv[0]; uv[0].active_render = True
bpy.data.objects.remove(so)
json.dump({'scale': SCALE, 'intensity': math.pi * SCALE, 'res': RES, 'samples': SAMPLES, 'emit': EMIT, 'sun': SUN, 'sky': SKY, 'nightsky': NIGHTSKY,
           'objects': [o.name for o in objs]}, open(LM + '.json', 'w'), ensure_ascii=False, indent=1)
URL = arg('--url')   # 遊戲裡光照貼圖的路徑前綴（例：assets/models/env/classroom_201_lm）→ 寫進 GLB 場景的 extras.lightmap，遊戲的 attachRoomGLB 看到就自動接
if URL: sc['lightmap'] = {'day': URL + '_day.webp', 'night': URL + '_night.webp', 'intensity': math.pi * SCALE}
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_texcoords=True, export_normals=True, export_extras=True,
                          export_yup=True, export_image_format='AUTO', export_lights=False, export_cameras=False)
print('exported', OUT, flush=True)
