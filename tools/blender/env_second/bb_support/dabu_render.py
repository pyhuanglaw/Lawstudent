"""大步球鞋室內 v2 的 Cycles 預覽（CC 建模子代理 2026-11-03；和參考圖 dabu_int 同角度比對用，不是遊戲截圖）。
用法：nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/dabu_render.py -- <glb> <輸出資料夾> <views.json|ref>（視角：docs/story_planning/CC/shots/model/dabu/dabu_views.json；投射燈：同資料夾 dabu_spots.json，dabu_interior.py --spots 產生） [--spots spots.json] [--res 480x270] [--samples 16] [--exposure EV] [--only 名稱,…]
  views.json：[["名稱", [眼睛 x,y,z], [看的點 x,y,z], 焦距mm], ...]（遊戲座標、36 mm 片幅）；寫 ref＝只渲染 dabu_layout.js 的 refView（參考圖的鏡頭）
燈光（照參考圖：暖色 3000K 左右的軌道投射燈打在鞋牆、層板下燈條、吊燈、櫃台燈條；門口那一側進來的午後陽光；環境光很低）：
  - 投射燈：spots.json（dabu_interior.py --spots 輸出：每個燈頭的位置、方向）→ SPOT 燈
  - 燈條：GLB 的 dabu_led 材質（發光）＋每一層層板底下一條細長面光
  - 太陽：從店門（+z）斜照進來，暖色；世界光 0.25"""
import json, math, os, subprocess, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
glb, outdir, vsrc = A[0], A[1], A[2]
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./src/data/dabu_layout.js')))"], cwd=REPO))
if vsrc == 'ref': views = [['ref', LAY['refView']['eye'], LAY['refView']['look'], LAY['refView']['lens']]]
else: views = json.load(open(vsrc))
only = opt('--only'); only = only.split(',') if only else None
RW, RH = map(int, opt('--res', '480x270').split('x'))
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '16'))
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = opt('--view', 'AgX'); sc.view_settings.exposure = float(opt('--exposure', '0'))
try: sc.view_settings.look = opt('--look', 'AgX - Medium High Contrast') if sc.view_settings.view_transform == 'AgX' else 'None'
except Exception: pass
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 32
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1.0, 0.86, 0.7, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = float(opt('--world', '0.25'))
WARM = (1.0, 0.74, 0.5)        # 約 3000K
H = LAY['h']; K = float(opt('--lamp', '1.0'))
def light(kind, loc, energy, color=WARM, size=0.05, aim=None, spot=None, sx=None, sy=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy
    elif kind != 'SUN': ld.shadow_soft_size = size
    if spot: ld.spot_size = math.radians(spot); ld.spot_blend = 0.5
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (aim - loc).to_track_quat('-Z', 'Y').to_euler()
    return o
spots = json.load(open(opt('--spots'))) if opt('--spots') else []
for s in spots:
    p = g2b(*s[:3]); d = g2b(*s[3:6]); light('SPOT', p, 95 * K, aim=p + d, spot=38, size=0.03)
# 層板下的燈條：每一層一條面光（朝下），兩面鞋牆
for sw in LAY['shoeWalls']:
    sgn = -1 if sw['side'] == 'left' else 1; fx = (-LAY['w'] / 2 + sw['depth']) if sgn < 0 else (LAY['w'] / 2 - sw['depth'])
    for t in [0.60, 1.01, 1.42, 1.83, 2.24]:
        y = t + 0.37; zc = (sw['z0'] + sw['z1']) / 2; ln = sw['z1'] - sw['z0']
        o = light('AREA', g2b(fx - sgn * 0.06, y, zc), 26 * ln * K * float(opt('--led', '1.0')), color=(1.0, 0.8, 0.56), sx=0.06, sy=ln - 0.1)
        o.rotation_euler = (0, 0, 0)   # 朝下（-Z）
pd = [i for i in LAY['items'] if i['kind'] == 'pendant'][0]
light('POINT', g2b(pd['x'], pd['y'] - 0.02, pd['z']), 40 * K, color=(1, 0.8, 0.58), size=0.06)
ct = [i for i in LAY['items'] if i['kind'] == 'counter'][0]
o = light('AREA', g2b(ct['x'], 0.83, ct['z'] + ct['d'] / 2 + 0.03), 30 * K, color=(1, 0.8, 0.56), sx=ct['w'] - 0.1, sy=0.04); o.rotation_euler = (0, 0, 0)
# 天花板的補光（牆、天花板互相反射的那一層亮度；遊戲裡是烘焙）
o = light('AREA', g2b(0, H - 0.08, -0.5), float(opt('--fill', '120')), color=(1, 0.86, 0.7), sx=LAY['w'] - 0.6, sy=LAY['d'] - 1.0); o.rotation_euler = (0, 0, 0)
# 午後的太陽：從店門那一側（+z、偏東）斜照進來
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = float(opt('--sunE', '3.0')); sun.data.color = (1.0, 0.78, 0.55); sun.data.angle = math.radians(2)
el, az = math.radians(float(opt('--sunEl', '15'))), math.radians(float(opt('--sunAz', '20')))
dvec = Vector((-math.sin(az) * math.cos(el), -math.sin(el), -math.cos(az) * math.cos(el)))   # 遊戲座標的照射方向（往 −z、往下）
sun.rotation_euler = g2b(*dvec).to_track_quat('-Z', 'Y').to_euler()
for mt in bpy.data.materials:   # 燈條、燈頭的發光強度（遊戲裡照材質；Cycles 預覽調亮一點才看得到）
    if mt.use_nodes and 'led' in mt.name and 'Principled BSDF' in mt.node_tree.nodes:
        mt.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = float(opt('--emit', '4.0'))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'dabu_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
