"""Blender 模型渲染圖（驗收用，D38 第 12.8 節的⑤；不是遊戲截圖）：匯入 GLB → Cycles（CPU、低取樣＋降噪）→ PNG。
這個沙盒的 EEVEE 要用軟體 OpenGL，一張圖十幾分鐘還出不來，所以用 Cycles。
用法：/opt/blenv/bin/python tools/blender/env_second/render_cycles.py -- <glb[,glb…]> <輸出資料夾> <前綴> <views.json> [--res 960x600] [--samples 24] [--night] [--ground] [--threads N] [--tint 材質=#色碼]... [--season summer|autumn|bare|snow] [--exposure EV] [--view Standard] [--hide 名稱]... [--noemit] [--point x,y,z,W]...
views.json：[["名稱", [眼睛 x,y,z], [看的點 x,y,z], 鏡頭焦距mm], ...]（遊戲座標）"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
res = A[A.index('--res') + 1] if '--res' in A else '960x600'; RW, RH = map(int, res.split('x'))
samples = int(A[A.index('--samples') + 1]) if '--samples' in A else 24
night = '--night' in A
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
for one in glb.split(','): bpy.ops.import_scene.gltf(filepath=os.path.abspath(one))   # 可以一次載入好幾個（同一套世界座標，例如溫州街的四個 GLB）
if '--season' in A:   # 美國篇的季節（us_season.py）：照 SEASON_MATS 換材質、照 seasons 開關季節網格
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import us_season as _SEA; _SEA.apply_preview(None, A[A.index('--season') + 1])
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = A[A.index('--view') + 1] if '--view' in A else 'AgX'   # --view Standard：顏色比較接近遊戲（AgX 在強光下把飽和的磚紅洗成粉紅）
sc.cycles.max_bounces = 4
sc.cycles.transparent_max_bounces = 128   # 透明貼圖疊很多層（樹冠的葉片卡）：預設 8 次就停、會變黑
if '--threads' in A: sc.render.threads_mode = 'FIXED'; sc.render.threads = int(A[A.index('--threads') + 1])   # 和瀏覽器測試同時跑時只用一個核心
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'
except Exception: pass
try:
    sky.sun_elevation = math.radians(4 if night else 28); sky.sun_rotation = math.radians(250)
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.05 if night else 0.6
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 0.2 if night else 3.5; sun.rotation_euler = (math.radians(62), 0, math.radians(-110))
if night:   # 夜景：燈泡位置放點光（GLB 的 GLOW_* 空節點）
    for o in list(sc.objects):
        if o.name.startswith('GLOW_'):
            lt = bpy.data.objects.new('pt_' + o.name, bpy.data.lights.new('pt', 'POINT')); lt.data.energy = 25; lt.data.color = (1.0, 0.8, 0.55); lt.location = o.matrix_world.translation; sc.collection.objects.link(lt)
for t in [A[i + 1] for i, x in enumerate(A) if x == '--tint']:   # 預覽用：--tint 材質名=#色碼（例如腳踏車架在遊戲裡才上色）
    nm, hx = t.split('='); mt = bpy.data.materials.get(nm)
    if mt and mt.use_nodes:
        c = tuple((int(hx[k:k + 2], 16) / 255) for k in (1, 3, 5)); c = tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)
        mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*c, 1.0)
for t in [A[i + 1] for i, x in enumerate(A) if x == '--point']:   # 室內預覽：--point x,y,z,瓦數（遊戲座標）
    x, y, z, e = map(float, t.split(',')); lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.data.color = (1.0, 0.95, 0.88); lt.data.shadow_soft_size = 0.4
    lt.location = g2b(x, y, z); sc.collection.objects.link(lt)
if '--exposure' in A: sc.view_settings.exposure = float(A[A.index('--exposure') + 1])
if '--noemit' in A:   # --noemit：白天的渲染不讓自發光發亮（總圖、行政大樓亮燈的窗有自發光貼圖；遊戲裡只有晚上開，Blender 會一直亮）
    for mt in bpy.data.materials:
        if mt.use_nodes and 'Principled BSDF' in mt.node_tree.nodes: mt.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0.0
for pat in [A[i + 1] for i, x in enumerate(A) if x == '--hide']:   # --hide 名稱：不渲染這個物件（例如傅鐘柱面的夜間暖光片：遊戲裡白天是加法混合的黑色＝看不到，渲染器會畫成不透明的漸層）
    for ob in bpy.data.objects:
        if pat in ob.name: ob.hide_render = True
if '--ground' in A:   # 小道具：加一塊灰色地面（看得到影子）
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -0.01)); gp = bpy.context.active_object; gm = bpy.data.materials.new('ground'); gm.use_nodes = True
    gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.32, 0.32, 0.31, 1); gm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.9; gp.data.materials.append(gm)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    cam.data.lens = lens; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'{prefix}_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
