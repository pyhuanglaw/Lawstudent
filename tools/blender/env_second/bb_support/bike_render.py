"""慢輪單車室內的 Cycles 渲染（CC 帳號 A，2026-11-04 v1）：匯入 GLB、吊燈（每盞一個暖色點光）、日光燈（面光）、店門口的天光，相機照 layout 的 camRef（參考圖的角度）。
用法：/opt/blenv/bin/python tools/blender/env_second/bb_support/bike_render.py -- <glb> <輸出資料夾> [--views views.json] [--only 名字,名字] [--res 480x270] [--samples 16] [--show REPAIR_BIKE]
  v1b：extras.defaultVisible=false 的節點（REPAIR_BIKE）預設不渲染（和遊戲一樣）；--show 打開。
  views.json：[[名字, [眼睛 x,y,z], [看的點 x,y,z], 焦距mm], …]（遊戲座標）；沒給就只渲染 ref（參考圖的角度）。
  調光：--pend（吊燈 W）、--tube（日光燈 W）、--door（門口天光 W）、--emit（燈泡、燈管、螢幕的發光強度）、--fill（天花板往下的補光 W）、--exposure。
  環境變數：CC_BLENDER_DEVICE=GPU（PC 用）、CC_SAMPLES（覆蓋 --samples）。"""
import json, math, os, subprocess, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir = A[0], A[1]
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'bike_layout.js')]))['bike']
cr = LAY['camRef']
views = json.load(open(arg('--views'))) if arg('--views') else []
views = [['ref', cr['eye'], cr['look'], cr['lens']]] + [v for v in views if v[0] != 'ref']
only = arg('--only').split(',') if arg('--only') else None
rx, ry = [int(v) for v in arg('--res', '480x270').split('x')]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
# v1b：GLB 裡 extras.defaultVisible=false 的節點（REPAIR_BIKE：修車架上夾著的車）照遊戲的預設不顯示；--show 名字,名字 才打開
SHOW = arg('--show', '').split(',') if arg('--show') else []
for ob in list(bpy.data.objects):
    if ob.get('defaultVisible') is not None and not ob.get('defaultVisible') and ob.name not in SHOW:
        for o in [ob] + list(ob.children_recursive): o.hide_render = True
        print('hidden (defaultVisible=false):', ob.name, flush=True)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = int(os.environ.get('CC_SAMPLES', arg('--samples', '16')))
sc.cycles.device = os.environ.get('CC_BLENDER_DEVICE', 'CPU')
sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.render.resolution_x, sc.render.resolution_y = rx, ry; sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = float(arg('--exposure', '0.3'))
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 24
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.95, 0.85, 0.7, 1); bg.inputs['Strength'].default_value = float(arg('--world', '0.08'))
for m in bpy.data.materials:   # 燈泡、燈管、螢幕的發光強度（GLB 的 emissive 是 1）
    if not m.use_nodes: continue
    b = m.node_tree.nodes.get('Principled BSDF')
    if b and 'emit' in m.name: b.inputs['Emission Strength'].default_value = float(arg('--emit', '4.0'))


def light(kind, loc, energy, color, aim=None, sx=0.2, sy=0.2, size=0.1):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy
    elif kind != 'SUN': ld.shadow_soft_size = size
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (aim - loc).to_track_quat('-Z', 'Y').to_euler()
    return o


WARM = (1.0, 0.78, 0.52); TUBE = (1.0, 0.92, 0.8)
H = LAY['h']
for (x, y, z) in LAY['lights']['pendants']:
    light('SPOT', g2b(x, y - 0.12, z), float(arg('--pend', '130')), WARM, aim=g2b(x, 0, z), size=0.05).data.spot_size = math.radians(110)
    light('POINT', g2b(x, y - 0.1, z), float(arg('--pend', '130')) * 0.15, WARM, size=0.05)
for (x, z, ax) in LAY['lights']['tubes']:
    p = g2b(x, H - 0.1, z); light('AREA', p, float(arg('--tube', '45')), TUBE, aim=p + Vector((0, 0, -1)), sx=0.14 if ax == 'z' else 1.2, sy=1.2 if ax == 'z' else 0.14)
p = g2b(1.0, 1.7, 6.3); light('AREA', p, float(arg('--door', '160')), (1.0, 0.95, 0.88), aim=g2b(0.6, 1.2, 2.0), sx=4.5, sy=2.4)   # 門外騎樓的光（在相機後面）
p = g2b(0.6, H - 0.5, 0.5); light('AREA', p, float(arg('--fill', '120')), WARM, aim=p + Vector((0, 0, -1)), sx=6.0, sy=9.0)          # 天花板反射的補光
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_width = 36
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'bike_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
