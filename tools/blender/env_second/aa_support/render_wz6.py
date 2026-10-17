"""ART-WZ6 的 Blender 渲染圖（驗收用，不是遊戲截圖）。設定照 render_cycles.py（Cycles CPU、AgX、OIDN 降噪、Nishita 天空＋太陽），
差別只有場景：地面在 y=0（小道具直接放在上面，不會浮 1 公分），z=−0.30 有一面淺色牆（海報、白板影印貼在上面）。
用法：/opt/blenv/bin/python tools/blender/env_second/aa_support/render_wz6.py -- <glb> <輸出資料夾> <前綴> <views.json> [--res 960x600] [--samples 48] [--exposure -3.5] [--view Standard|AgX] [--shape 名稱=值]... [--swap 材質=材質]... [--hide 名稱片段]... [--wall -0.30]
views.json：[["名稱", [眼睛 x,y,z], [看的點 x,y,z], 鏡頭焦距mm], ...]（遊戲座標）"""
import json, math, os, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir, prefix, views = A[0], A[1], A[2], json.load(open(A[3]))
RW, RH = map(int, (A[A.index('--res') + 1] if '--res' in A else '960x600').split('x'))
samples = int(A[A.index('--samples') + 1]) if '--samples' in A else 48
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
for t in [A[i + 1] for i, x in enumerate(A) if x == '--shape']:   # --shape fat=1.0：morph target 的值（貓的胖瘦）
    nm, val = t.split('='); n_set = 0
    for ob in bpy.data.objects:
        sk = getattr(ob.data, 'shape_keys', None) if ob.data is not None else None
        if sk and nm in sk.key_blocks:
            if sk.animation_data: sk.animation_data_clear()   # glTF 匯入時可能帶 morph 權重的動畫，會蓋掉手動設定的值
            sk.key_blocks[nm].value = float(val); n_set += 1
    print('shape', nm, val, 'objects', n_set, flush=True)
for t in [A[i + 1] for i, x in enumerate(A) if x == '--swap']:   # --swap cat_fur=cat_fur_old：換材質（老貓）
    a, b_ = t.split('='); mb = bpy.data.materials.get(b_)
    for ob in bpy.data.objects:
        if ob.type == 'MESH':
            for k, sl in enumerate(ob.material_slots):
                if sl.material and sl.material.name == a and mb: ob.material_slots[k].material = mb
for pat in [A[i + 1] for i, x in enumerate(A) if x == '--hide']:   # --hide _tag：不渲染名稱有這段的物件
    for ob in bpy.data.objects:
        if pat in ob.name: ob.hide_render = True
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = A[A.index('--view') + 1] if '--view' in A else 'Standard'; sc.cycles.max_bounces = 4
sc.view_settings.exposure = float(A[A.index('--exposure') + 1]) if '--exposure' in A else -3.5   # 室內小道具：Standard＋暗 3.5 檔（AgX 會把蛋黃色、海報的藍洗白，render_cycles.py 的 --view Standard 也是這個理由）
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'
except Exception: pass
try: sky.sun_elevation = math.radians(28); sky.sun_rotation = math.radians(250)
except Exception: pass
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.6
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 3.5; sun.rotation_euler = (math.radians(55), 0, math.radians(-30)); sun.data.angle = math.radians(3)


def plane(name, size, loc, rot, col, rough):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc, rotation=rot); ob = bpy.context.active_object; ob.name = name
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; ob.data.materials.append(m)


plane('ground', 6, (0, 0, 0), (0, 0, 0), (0.30, 0.29, 0.27), 0.85)                       # 桌面／地面（y=0）
WALL_Z = float(A[A.index('--wall') + 1]) if '--wall' in A else -0.30   # --wall -0.5：牆往後移（貓走路的尾巴到 z=−0.32，會插進 −0.30 的牆）
plane('wall', 6, tuple(g2b(0, 1.0, WALL_Z)), (math.radians(90), 0, 0), (0.78, 0.76, 0.72), 0.9)   # 預設 z=−0.30 的牆
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    cam.data.lens = lens; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'{prefix}_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
