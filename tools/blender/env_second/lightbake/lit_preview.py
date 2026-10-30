"""INTERIOR-AAA-REVIEW-1028 實驗：同一個室內 GLB，用「真的光」（Cycles：天空從窗戶進來＋天花板的燈＋反彈光）算一張，和遊戲同一個鏡頭比——看「模型本身」和「遊戲裡的光」各占多少。
不是遊戲截圖，是 Blender 渲染（驗收用）。用法：
/opt/blenv/bin/python lit_preview.py -- <glb> <out.png> --eye x,y,z --look x,y,z [--fovy 46] [--res 844x390] [--samples 48] [--lights x0,x1,z0,z1,y,nx,nz,W] [--sun]
--lights：天花板燈的網格（x0..x1 × z0..z1，高 y，nx×nz 盞，每盞 W 瓦，4000K 日光燈）；--sun：加午後的太陽（從窗戶照進來）。座標都是遊戲座標（x 東、y 上、z 南）。"""
import sys, os, math
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, out = A[0], A[1]
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
g2b = lambda x, y, z: Vector((x, -z, y))
eye = [float(v) for v in arg('--eye').split(',')]; look = [float(v) for v in arg('--look').split(',')]
RW, RH = map(int, arg('--res', '844x390').split('x')); fovy = float(arg('--fovy', '46'))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
for nm in (arg('--hide', '') or '').split(','):   # 鏡頭看不到、但還擋光的牆（遊戲裡淡出的那一面）：房間照樣是封閉的
    for o in bpy.data.objects:
        if nm and o.name.startswith(nm): o.visible_camera = False
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(arg('--samples', '48'))
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 4; sc.cycles.transparent_max_bounces = 64
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = arg('--view', 'AgX'); sc.view_settings.look = 'None'
sc.view_settings.exposure = float(arg('--exposure', '0'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
sky = nt.nodes.new('ShaderNodeTexSky')
try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(32); sky.sun_rotation = math.radians(235); sky.sun_disc = False
except Exception: pass
nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = float(arg('--sky', '1.0'))
if '--sun' in A:
    sd = bpy.data.lights.new('sun', 'SUN'); sd.energy = float(arg('--sunE', '3.0')); sd.angle = math.radians(1.5); so = bpy.data.objects.new('sun', sd); sc.collection.objects.link(so)
    so.rotation_euler = (math.radians(58), 0, math.radians(235 - 180))
if arg('--lights'):
    x0, x1, z0, z1, y, nx, nz, W = [float(v) for v in arg('--lights').split(',')]
    for i in range(int(nx)):
        for j in range(int(nz)):
            x = x0 + (x1 - x0) * (i + 0.5) / nx; z = z0 + (z1 - z0) * (j + 0.5) / nz
            ld = bpy.data.lights.new(f'l{i}_{j}', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = 1.2; ld.size_y = 0.3; ld.energy = W; ld.color = (1.0, 0.96, 0.9)
            lo = bpy.data.objects.new(f'l{i}_{j}', ld); sc.collection.objects.link(lo); lo.location = g2b(x, y, z); lo.rotation_euler = (0, 0, 0)   # 朝下（Blender 的 area light 預設朝 −Z）
cd = bpy.data.cameras.new('cam'); cd.sensor_fit = 'VERTICAL'; cd.angle_y = math.radians(fovy); cd.clip_start = 0.05
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
e, l = g2b(*eye), g2b(*look); co.location = e; co.rotation_euler = (l - e).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = os.path.abspath(out); bpy.ops.render.render(write_still=True); print('wrote', out)
