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
   [--dayemit 材質名=強度,...（只在白天那一張發光、晚上不亮：天窗）] [--points x,y,z,W[,r,g,b];...（點光源）] [--nolm 正規式（不做光照貼圖、照舊即時光的物件：發光的燈面；烘焙時照樣看得到、照樣發光）] [--lights …（見下面）] [--daylights 1.0（白天那一張的燈乘多少）] [--daywb r,g,b] [--nightwb r,g,b]（白平衡） [--smooth 像素] [--uvonly（只排 UV、不烘焙）] [--shell 窗那一面（N/S/E/W，見下面）] [--drop 正規式（只在烘焙時擋光、不輸出的物件）]
物件的自訂屬性 lm（GLB extras）：光照貼圖分給它的比例（1＝照面積平均；小東西、天花板上的東西 0.2～0.5）；lmhide＝[x,y,z]：朝這個方向的面看不到、不分像素（'side'＝所有側面）。
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
DAYEMIT = {}   # 只在白天那一張發光的材質（總圖大廳的天窗 LIB-HALL-LM-1028：屋頂整片包黑殼，天光只能從天窗那一塊發光面進來；晚上天窗是暗的）
for kv in (arg('--dayemit', '') or '').split(','):
    if '=' in kv: k, v = kv.split('='); DAYEMIT[k] = float(v)
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
# 疊在一起、方向相反的面（lib2.single_side 給「開口的零件」補的反面：位置和正面一樣、繞向相反）：烘焙以前拿掉。
# 為什麼（LIB-HALL-LM-1028）：光線從正面一出發就打到疊在同一個位置的反面，整面烘成全黑——總圖大廳的二樓木地板、一樓天花板（樓板底面）、屋頂、
# 幾面牆、舊的樓梯踏面（每一階方塊互相貼著，算成開口的零件）。有光照貼圖的物件用不到反面（反面的光照貼圖一樣是黑的），
# 而且 lm_fix_hidden.py 接頂點的時候本來就把它們併掉了（GLB 的三角形數和沒補反面一樣），所以輸出的網格不變，只是烘焙對了。之前交的房間都沒有用 single_side
def drop_backfaces(o):
    bm = bmesh.new(); bm.from_mesh(o.data); seen = {}; kill = []
    for f in bm.faces:
        k = tuple(sorted((round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4)) for v in f.verts))
        g = seen.get(k)
        if g is not None and g.normal.dot(f.normal) < -0.99: kill.append(f)
        elif g is None: seen[k] = f
    if kill: bmesh.ops.delete(bm, geom=kill, context='FACES'); bm.to_mesh(o.data); o.data.update()
    bm.free(); return len(kill)
print('back faces dropped', sum(drop_backfaces(o) for o in objs), flush=True)
# 同一個材質不能一部分有光照貼圖、一部分沒有：遊戲的 roomLightmap 是照材質接 lightMap 的，沒有 uv1 的網格會整個取到貼圖 (0,0) 那一點（變暗）。
# 例：201 的鋼材 cls_steel 同時給椅子的鋼管（幾千個小島，不烘）和門框（看得到，要烘）用。
# 這種材質自動複製一份給不烘的物件用（名字後面加 _rt＝即時光）；不同物件本來就各畫一次，draw call 不會變多
OBJS = set(objs); mine = {m for o in objs for m in mats(o)}; split = {}
for o in bpy.data.objects:
    if o.type != 'MESH' or not len(o.data.polygons) or o in OBJS or hidden(o): continue
    for sl in o.material_slots:
        m = sl.material
        if m and m.name in mine:
            if m.name not in split: split[m.name] = m.copy(); split[m.name].name = m.name + '_rt'
            sl.material = split[m.name]
if split: print('split materials（不烘的物件用 _rt 的複製）', sorted(split), flush=True)

# ---- 3. 第二套 UV（LM）：智慧展開＋所有物件一起排進同一張貼圖 ----
for o in objs:
    uv = o.data.uv_layers
    # 沒有 UV 的網格（頂點色的零件：鐵腳、收邊、格柵；10-28 202 v2 查到）：先放一套空的 UVMap，LM 才會是第二套（glTF 的 TEXCOORD_1＝遊戲的 uv1）。
    # 原本 LM 變成唯一的一套、匯出成 TEXCOORD_0：遊戲裡這些零件沒有吃到光照貼圖，還白白佔了貼圖的位置
    if 'LM' not in uv and len(uv) == 0: uv.new(name='UVMap')
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
# 看不到的面不分像素：牆（WALL_，自訂屬性 dir＝往室內）背對室內的面（和 dir 反方向；側面不算：窗洞的側邊、柱子的側面看得到）、地板／平台朝下的面、天花板朝上的面。
# 10-28 改：原本每一面縮到 5%，每一面就變成一個小島，每個島都要 4 個像素的間隔（201 有幾千面，貼圖被小島擠掉一大塊）。
# 現在這些面不參加排版（排版前取消選取），排完以後都放到同一個物件最大那一面的中心（取那一點的光；面積是 0，烘焙不會寫）。整個物件都看不到的照舊參加排版。
def hidden_faces(o):
    d = o.get('dir'); dv = Vector((d[0], -d[2], d[1])) if d is not None and len(d) == 3 else None   # 遊戲座標 → Blender
    h = o.get('lmhide'); hs_side = isinstance(h, str) and 'side' in h.split(',')   # 自訂屬性 lmhide：朝這個方向（遊戲座標）的面看不到（例：樓板上面被地板蓋住 [0,1,0]；霖澤館大廳 10-28）；
    hv = Vector((h[0], -h[2], h[1])) if h is not None and not isinstance(h, str) and len(h) == 3 else None   # 'side'＝所有側面（地板方塊的四邊：埋在牆裡或在玻璃外面，烘出來是天空的顏色）
    # 字串也可以寫好幾個方向，用逗號分開：side、up、down、N（遊戲 −z）、S、E、W（例：男一舍走廊的牆 'N,up'＝背面是沒做模型的寢室、牆頂在天花板上面；DORM-HALL-LM-1028）
    hvs = [Vector(v) for t, v in (('up', (0, 0, 1)), ('down', (0, 0, -1)), ('N', (0, 1, 0)), ('S', (0, -1, 0)), ('E', (1, 0, 0)), ('W', (-1, 0, 0))) if isinstance(h, str) and t in h.split(',')]
    nm = o.name.lower(); mw = o.matrix_world.to_3x3(); hs = set()
    for f in o.data.polygons:
        nrm = (mw @ f.normal).normalized()
        if (dv is not None and nrm.dot(dv) < -0.3 and not ('ceil' in nm and nrm.z < -0.5)) or (('floor' in nm or 'plat' in nm) and nrm.z < -0.5) or ('ceil' in nm and nrm.z > 0.5) or (hv is not None and nrm.dot(hv) > 0.5) or (hs_side and abs(nrm.z) < 0.5) or any(nrm.dot(v) > 0.5 for v in hvs): hs.add(f.index)
    return hs if len(hs) < len(o.data.polygons) else set()
HID = {o.name: hidden_faces(o) for o in objs}
print('hidden faces', sum(len(v) for v in HID.values()), flush=True)
bpy.ops.object.mode_set(mode='EDIT')
for o in objs:
    bm = bmesh.from_edit_mesh(o.data); hs = HID[o.name]
    for f in bm.faces: f.select_set(f.index not in hs)
    bmesh.update_edit_mesh(o.data)
# 間隔＝貼圖的 4 個像素（FRACTION：最後輸出的比例）。原本用預設的 SCALED（間隔乘上 UV 的大小）：average_islands_scale 之後 UV 是公尺的大小，
# 間隔變成幾十個像素，島只佔整張貼圖的 6～9%（10-28 量的：202 每公尺 8～11 個像素、201 2～9 個）
def pack(px_margin):
    try: bpy.ops.uv.pack_islands(margin_method='FRACTION', margin=px_margin / RES, rotate=True)
    except TypeError: bpy.ops.uv.pack_islands(margin=px_margin / RES, rotate=True)
def packed_max():
    """排好以後看得到的面的光照座標最大值（> 1＝排不進一張貼圖）"""
    bpy.ops.object.mode_set(mode='OBJECT'); m = 0.0
    for o in objs:
        hs = HID[o.name]; d = o.data.uv_layers['LM'].data; buf = np.empty(len(d) * 2, dtype=np.float32); d.foreach_get('uv', buf); buf = buf.reshape(-1, 2)
        keep = np.ones(len(d), dtype=bool)
        for pg in o.data.polygons:
            if pg.index in hs: keep[pg.loop_start:pg.loop_start + pg.loop_total] = False
        if keep.any(): m = max(m, float(buf[keep].max()))
    bpy.ops.object.mode_set(mode='EDIT'); return m
# 排不進一張貼圖時（島很多、貼圖小：每個島 4 個像素的間隔加起來超過整張），Blender 不會報錯，排出來比 0～1 大，超出的部分烘不到、整張全黑
# （10-28 總圖大廳 512 校正烘焙、男一舍門廳 256 試烘：day lm mean 0.0）。間隔減半重排，到 1 個像素還排不下就整個縮進 0～1，並且大聲印出來
for pm in (4.0, 2.0, 1.0):
    pack(pm); mx = packed_max()
    if mx <= 1.0001: break
    print(f'WARNING UV 排不進一張貼圖（間隔 {pm:g} 像素，最大 {mx:.2f}）', flush=True)
if mx > 1.0001:
    bpy.ops.object.mode_set(mode='OBJECT')
    for o in objs:
        d = o.data.uv_layers['LM'].data; buf = np.empty(len(d) * 2, dtype=np.float32); d.foreach_get('uv', buf); d.foreach_set('uv', buf / mx)
    print(f'WARNING 間隔 1 個像素也排不下：整個縮成 1/{mx:.2f}（貼圖太小，--res 加大）', flush=True)
    bpy.ops.object.mode_set(mode='EDIT')
print('uv pack margin', pm, 'max', round(mx, 4), flush=True)
bpy.ops.object.mode_set(mode='OBJECT')
for o in objs:
    hs = HID[o.name]
    if not hs: continue
    bm = bmesh.new(); bm.from_mesh(o.data); uvl = bm.loops.layers.uv['LM']; bm.faces.ensure_lookup_table()
    big = max((f for f in bm.faces if f.index not in hs), key=lambda f: f.calc_area())
    c = sum((l[uvl].uv for l in big.loops), Vector((0, 0))) / len(big.loops)
    for i in hs:
        for l in bm.faces[i].loops: l[uvl].uv = c
    bm.to_mesh(o.data); bm.free()
if '--uvonly' in A:   # 只看 UV 排版、不烘焙（幾十秒）：輸出加了 LM 的 GLB 就結束，用 lightbake/uv_fill.py 量填滿率、每公尺幾個像素
    for o in bpy.data.objects:
        if o.type == 'MESH' and len(o.data.uv_layers) and o.data.uv_layers[0].name != 'LM': o.data.uv_layers.active = o.data.uv_layers[0]; o.data.uv_layers[0].active_render = True
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_texcoords=True, export_normals=True, export_extras=True,
                              export_yup=True, export_image_format='AUTO', export_lights=False, export_cameras=False)
    print('uvonly exported', OUT, flush=True); sys.exit(0)

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
# --lights x0,x1,z0,z1,y,nx,nz,W[,sx,sz[,r,g,b]]（可以重複，用 ; 分開）：x0..x1 × z0..z1 的格子中心、高 y，nx×nz 盞，每盞 W 瓦，燈的大小 sx×sz（預設 1.2×0.3 m），顏色（預設日光燈 1,0.97,0.92；檯燈偏暖）
# --points x,y,z,W[,r,g,b]（用 ; 分開）：點光源（壁燈、往上打的燈；總圖大廳 LIB-HALL-LM-1028）
AREAS = []
for spec in (arg('--lights', '') or '').split(';'):
    if not spec.strip(): continue
    v = [float(t) for t in spec.split(',')]; x0, x1, z0, z1, y, nx, nz, Wt = v[:8]; lsx, lsz = (v[8], v[9]) if len(v) >= 10 else (1.2, 0.3); col = tuple(v[10:13]) if len(v) >= 13 else (1.0, 0.97, 0.92)
    for i in range(int(nx)):
        for j in range(int(nz)):
            x = x0 + (x1 - x0) * (i + 0.5) / nx; z = z0 + (z1 - z0) * (j + 0.5) / nz
            ld = bpy.data.lights.new(f'fx{i}_{j}', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = lsx; ld.size_y = lsz; ld.energy = Wt; ld.color = col
            lo = bpy.data.objects.new(ld.name, ld); sc.collection.objects.link(lo); lo.location = Vector((x, -z, y - 0.01)); AREAS.append(lo)   # 朝下（Blender 的面光源朝 −Z）
for spec in (arg('--points', '') or '').split(';'):
    if not spec.strip(): continue
    v = [float(t) for t in spec.split(',')]; x, y, z, Wt = v[:4]; col = tuple(v[4:7]) if len(v) >= 7 else (1.0, 0.85, 0.7)
    ld = bpy.data.lights.new('pt', 'POINT'); ld.energy = Wt; ld.color = col; ld.shadow_soft_size = 0.06
    lo = bpy.data.objects.new(ld.name, ld); sc.collection.objects.link(lo); lo.location = Vector((x, -z, y)); AREAS.append(lo)
print('area lights', len(AREAS), flush=True)

# 房間外殼（--shell 開著的方向，用逗號分開：N＝遊戲 −z、S＝+z、E＝+x、W＝−x，例：S＝窗在 +z 那一面）：烘焙時才有、不輸出的黑色厚板，
# 把房間其他幾面（含天花板上面、地板下面）包起來。為什麼：烘焙的場景房間外面就是天空，門縫、牆角的縫會漏進天光
# （10-28 202：門板底下、門前的地板 1.4，平常的地板 0.4～0.6；牆淡出時看得到一條亮邊）。真的房間外面是走廊、隔壁教室，不是天空。窗那一面不包（天光、太陽從窗戶進來）
SHELL = []
if arg('--shell'):
    opn = set(arg('--shell').upper().split(','))
    mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        for v in o.bound_box:
            w = o.matrix_world @ Vector(v); mn = Vector([min(a, b) for a, b in zip(mn, w)]); mx = Vector([max(a, b) for a, b in zip(mx, w)])
    g, t, e = 0.05, 0.5, 1.0   # 離房間 5 cm、厚 50 cm、四邊多 1 m（角落不留縫）；Blender 座標：x＝遊戲 x、y＝−遊戲 z、z＝遊戲 y
    boxes = {'E': ((mx.x + g, mx.x + g + t), (mn.y - e, mx.y + e), (mn.z - e, mx.z + e)), 'W': ((mn.x - g - t, mn.x - g), (mn.y - e, mx.y + e), (mn.z - e, mx.z + e)),
             'N': ((mn.x - e, mx.x + e), (mx.y + g, mx.y + g + t), (mn.z - e, mx.z + e)), 'S': ((mn.x - e, mx.x + e), (mn.y - g - t, mn.y - g), (mn.z - e, mx.z + e)),
             'UP': ((mn.x - e, mx.x + e), (mn.y - e, mx.y + e), (mx.z + g, mx.z + g + t)), 'DOWN': ((mn.x - e, mx.x + e), (mn.y - e, mx.y + e), (mn.z - g - t, mn.z - g))}
    blk = bpy.data.materials.new('SHELL_black'); blk.use_nodes = True
    next(x for x in blk.node_tree.nodes if x.type == 'BSDF_PRINCIPLED').inputs['Base Color'].default_value = (0.02, 0.02, 0.02, 1.0)
    for k, (xs, ys, zs) in boxes.items():
        if k in opn: continue
        me = bpy.data.meshes.new('SHELL_' + k); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free(); me.materials.append(blk)
        ob = bpy.data.objects.new('SHELL_' + k, me); sc.collection.objects.link(ob); SHELL.append(ob)
        ob.location = ((xs[0] + xs[1]) / 2, (ys[0] + ys[1]) / 2, (zs[0] + zs[1]) / 2); ob.scale = (xs[1] - xs[0], ys[1] - ys[0], zs[1] - zs[0])
    print('shell', [o.name for o in SHELL], 'room bbox', [round(v, 2) for v in (*mn, *mx)], flush=True)

DAYL = float(arg('--daylights', '1.0'))   # 白天那一張的燈（--lights）乘多少（霖澤館大廳 10-28：玻璃中庭白天燈和天光一樣亮，整片平均、看不出陽光從哪裡來）
for lo in AREAS: lo['W0'] = lo.data.energy
def bake(tag, sky_strength, sun_energy, emit_scale, lamp_scale=1.0):
    bg.inputs['Strength'].default_value = sky_strength; sd.energy = sun_energy
    for lo in AREAS: lo.data.energy = lo['W0'] * lamp_scale
    for o in objs:
        for s in o.material_slots:
            m = s.material
            if not m: continue
            for k, v in EMIT.items():
                if k in m.name:
                    b = next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
                    if b: b.inputs['Emission Strength'].default_value = v * emit_scale
            for k, v in DAYEMIT.items():
                if k in m.name:
                    b = next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
                    if b: b.inputs['Emission Strength'].default_value = v if tag == 'day' else 0.0
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

# 白平衡（--daywb r,g,b、--nightwb r,g,b：烘焙結果每個顏色乘多少，像相機的白平衡＋曝光）。霖澤館大廳 10-28：南面整片玻璃的天光（Nishita）偏藍，
# 地板比原本的即時光冷、亮兩成；遊戲的室內白天是暖灰（engine3d.js 的室內半球光 0xf4f1ea）
WB = {k: [float(t) for t in arg('--' + k + 'wb').split(',')] if arg('--' + k + 'wb') else None for k in ('day', 'night')}
def wb(px, k): return px * np.array(WB[k], dtype=np.float32)[None, None, :] if WB[k] else px
os.makedirs(os.path.dirname(os.path.abspath(LM)), exist_ok=True)
day = bake('day', SKY, SUN[2], 1.0, DAYL); save(wb(day, 'day'), LM + '_day.png')
night = bake('night', NIGHTSKY, 0.0, 1.0); save(wb(night, 'night'), LM + '_night.png')

# ---- 5b. 夾在零件中間、烘出來全黑的面（白天、晚上兩張都 < 0.003：完全照不到光，只有被包住的面會這樣）：和看不到的面一樣，UV 收到同一個物件最大那一面的中心 ----
# 為什麼（LIB-HALL-LM-1028）：方塊拼起來的牆、台座，兩塊接在一起的那一面夾在中間烘成黑的；正面在接縫是 T 形接頭（一邊有頂點、一邊沒有），
# 畫的時候接縫露出一點一點的縫，就看得到後面黑的那一面——男一舍門廳第一次正式烘焙，門框上方一條條點狀黑線。收到最大那一面的中心以後，縫裡看到的是牆的顏色
def collapse_black(day, night, thr=0.003):
    n_all = 0
    for o in objs:
        me = o.data; hs = HID[o.name]
        bm = bmesh.new(); bm.from_mesh(me); uv = bm.loops.layers.uv['LM']; bm.faces.ensure_lookup_table()
        vis = [f for f in bm.faces if f.index not in hs]
        if len(vis) < 2: bm.free(); continue
        def val(f):
            cu = sum((l[uv].uv for l in f.loops), Vector((0, 0))) / len(f.loops)
            x = min(RES - 1, max(0, int(cu.x * RES))); y = min(RES - 1, max(0, int(cu.y * RES)))
            return max(float(day[y, x].max()), float(night[y, x].max()))
        big = max(vis, key=lambda f: f.calc_area())
        if val(big) < thr: bm.free(); continue
        c = sum((l[uv].uv for l in big.loops), Vector((0, 0))) / len(big.loops); n = 0
        for f in vis:
            if f is not big and val(f) < thr:
                for l in f.loops: l[uv].uv = c
                n += 1
        if n: bm.to_mesh(me); n_all += n
        bm.free()
    print('black faces collapsed', n_all, flush=True)
collapse_black(day, night)

# ---- 6. 清掉烘焙用的節點、UV：LM 排第二（TEXCOORD_1）、原本的 UV 當作用中 ----
for m in bpy.data.materials:
    if m.node_tree:
        for n in [x for x in m.node_tree.nodes if x.name == 'LM_target']: m.node_tree.nodes.remove(n)
    for k, v in list(EMIT.items()) + list(DAYEMIT.items()):
        if k in m.name and m.node_tree:
            b = next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
            if b: b.inputs['Emission Strength'].default_value = 1.0
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.hide_render = False
        uv = o.data.uv_layers
        if len(uv) and uv[0].name != 'LM': uv.active = uv[0]; uv[0].active_render = True
bpy.data.objects.remove(so)
for o in SHELL: bpy.data.objects.remove(o)   # 外殼只在烘焙時用
# --drop 正規式：模型裡只在烘焙時擋光、不輸出的物件（名字合這個正規式；也要放進 --nolm，不分光照貼圖）。例：男一舍門廳（DORM-HALL-LM-1028）四面都有窗、外殼不能包，
# 沒做模型的寢室、舍監室、洗衣間外面用 BAKEONLY_ 板子擋住天光（不然天光從那幾塊空間漏進門縫、舍監室窗口）
if arg('--drop'):
    _drop = re.compile(arg('--drop'))
    for o in [o for o in bpy.data.objects if _drop.search(o.name)]: bpy.data.objects.remove(o)
json.dump({'scale': SCALE, 'intensity': math.pi * SCALE, 'res': RES, 'samples': SAMPLES, 'emit': EMIT, 'dayemit': DAYEMIT, 'sun': SUN, 'sky': SKY, 'nightsky': NIGHTSKY, 'shell': arg('--shell'), 'daylights': DAYL, 'lights': arg('--lights'), 'points': arg('--points'), 'wb': WB,
           'objects': [o.name for o in objs]}, open(LM + '.json', 'w'), ensure_ascii=False, indent=1)
URL = arg('--url')   # 遊戲裡光照貼圖的路徑前綴（例：assets/models/env/classroom_201_lm）→ 寫進 GLB 場景的 extras.lightmap，遊戲的 attachRoomGLB 看到就自動接
if URL: sc['lightmap'] = {'day': URL + '_day.webp', 'night': URL + '_night.webp', 'intensity': math.pi * SCALE}
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_texcoords=True, export_normals=True, export_extras=True,
                          export_yup=True, export_image_format='AUTO', export_lights=False, export_cameras=False)
print('exported', OUT, flush=True)
