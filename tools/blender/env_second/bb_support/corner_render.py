"""轉角唱片室內的 Cycles 渲染（CC 帳號 A，2026-11-04 v1；照 bike_render.py）：匯入 GLB、軌道投射燈（每盞一個暖色聚光）、白色吊燈、櫥窗和店門的天光，相機照 layout 的 camRef（參考圖的角度）。
用法：/opt/blenv/bin/python tools/blender/env_second/bb_support/corner_render.py -- <glb> <輸出資料夾> [--views views.json] [--only 名字,名字] [--res 480x270] [--samples 16]
  extras.defaultVisible=false 的節點預設不渲染（和遊戲一樣；這間目前沒有）；--show 打開。
  views.json：[[名字, [眼睛 x,y,z], [看的點 x,y,z], 焦距mm], …]（遊戲座標）；沒給就只渲染 ref（參考圖的角度）。
  調光：--spot（投射燈 W）、--pend（吊燈 W）、--win（櫥窗天光 W）、--door（門口天光 W）、--emit（燈泡、燈面、螢幕的發光強度）、--fill（天花板往下的補光 W）、--exposure。
  環境變數：CC_BLENDER_DEVICE=GPU（PC 用）、CC_SAMPLES（覆蓋 --samples）。"""
import json, math, os, subprocess, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir = A[0], A[1]
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'corner_layout.js')]))['corner']
cr = LAY['camRef']
views = json.load(open(arg('--views'))) if arg('--views') else []
views = [['ref', cr['eye'], cr['look'], cr['lens']]] + [v for v in views if v[0] != 'ref']
only = arg('--only').split(',') if arg('--only') else None
rx, ry = [int(v) for v in arg('--res', '480x270').split('x')]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
# GLB 裡 extras.defaultVisible=false 的節點照遊戲的預設不顯示；--show 名字,名字 才打開（照 bike_render.py；這間目前沒有這種節點）
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


WARM = (1.0, 0.76, 0.5); SPOTC = (1.0, 0.8, 0.58)
H = LAY['h']; LT = LAY['lights']
for (x, z, tx, ty) in LT['spots']:   # 軌道投射燈（照 corner_interior 的打光方向）
    y = H - 0.25; aim = g2b(tx, ty, z if abs(tx - x) > 0.5 else z - 0.8)
    o = light('SPOT', g2b(x, y, z), float(arg('--spot', '90')), SPOTC, aim=aim, size=0.03); o.data.spot_size = math.radians(55); o.data.spot_blend = 0.6
for (x, y, z) in LT['pendants']:
    light('SPOT', g2b(x, y - 0.1, z), float(arg('--pend', '90')), WARM, aim=g2b(x, 0, z), size=0.05).data.spot_size = math.radians(115)
    light('POINT', g2b(x, y - 0.06, z), float(arg('--pend', '90')) * 0.2, WARM, size=0.05)
fr = LAY['front']; wx0, wx1 = fr['windows'][0][0], fr['windows'][0][1]
p = g2b((wx0 + wx1) / 2, 1.6, LAY['d'] / 2 + 0.6); light('AREA', p, float(arg('--win', '420')), (1.0, 0.9, 0.76), aim=g2b((wx0 + wx1) / 2, 1.0, 1.0), sx=4.2, sy=2.2)   # 櫥窗外騎樓的光（下午）
p = g2b(fr['door']['x'], 1.4, LAY['d'] / 2 + 0.6); light('AREA', p, float(arg('--door', '160')), (1.0, 0.92, 0.8), aim=g2b(fr['door']['x'], 1.0, 2.0), sx=1.6, sy=2.4)
p = g2b(0.0, H - 0.45, 0.0); light('AREA', p, float(arg('--fill', '110')), WARM, aim=p + Vector((0, 0, -1)), sx=6.5, sy=10.0)          # 天花板反射的補光
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_width = 36
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'corner_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
