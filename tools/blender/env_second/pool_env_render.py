"""游泳池水面反射用的環境圖（POOL-SWIM-LOOK-1110，LAWWW2 帳號 A 2026-11-11）：gym_b1.glb 從池中央、水面上一點拍一張等距圓柱全景（Cycles）→ assets/models/env/second_ai/pool_env.webp。
水面（src/gym3d.js 的 poolWater）拿它當 envMap：近看是一片會晃的天花板燈、牆的倒影，遠看（斜看）反光比較強（Fresnel）。
方向對齊 three.js 的 EquirectangularReflectionMapping：圖的中間＝遊戲 +x、往右＝+z、上緣＝正上方。
用法：/opt/blenv/bin/python tools/blender/env_second/pool_env_render.py [--samples 48] [--res 1024x512]
改了 gym_b1.py（天花板、燈、牆）要重拍。"""
import math, os, sys
import bpy
from mathutils import Vector, Euler
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
GLB = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'gym_b1.glb'); OUT = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai', 'pool_env.webp')
samples = int(A[A.index('--samples') + 1]) if '--samples' in A else 48
RW, RH = map(int, (A[A.index('--res') + 1] if '--res' in A else '1024x512').split('x'))
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.max_bounces = 4
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'Standard'
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0
for ob in bpy.data.objects:   # 水面本身不拍（拍的是水面「看到的」東西）
    if 'water' in ob.name.lower(): ob.hide_render = True
for mt in bpy.data.materials:   # 天花板的燈具（b1_light，自發光）亮一點：Blender 匯入的自發光強度 1 照不亮 7 m 高的大廳
    if 'light' in mt.name and mt.node_tree and 'Principled BSDF' in mt.node_tree.nodes: mt.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 3.0
for x in (-18, -9, 0, 9, 18):   # 泳池上方補一排點光（遊戲裡是烘好的光照貼圖，Blender 沒有）
    for z in (-20, -12, -4):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = 260; lt.data.color = (1.0, 0.97, 0.92); lt.data.shadow_soft_size = 0.6
        lt.location = g2b(x, 6.2, z); sc.collection.objects.link(lt)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'PANO'
try: cam.data.panorama_type = 'EQUIRECTANGULAR'
except Exception: cam.data.cycles.panorama_type = 'EQUIRECTANGULAR'
cam.location = g2b(0.0, 0.25, -12.25)   # 池中央（gym_layout.js b1.pool.basin 的中心）、水面上 0.4 m
cam.rotation_euler = (g2b(1, 0, 0)).to_track_quat('-Z', 'Y').to_euler()   # 看遊戲 +x、鏡頭的上方（本地 Y）＝Blender +z
tmp = os.path.join(os.path.dirname(OUT), '_pool_env_tmp.png'); sc.render.filepath = tmp
bpy.ops.render.render(write_still=True)
from PIL import Image
Image.open(tmp).convert('RGB').save(OUT, quality=88, method=6); os.remove(tmp)
print('ok', OUT)
