"""新生運動廣場室內 v3 的 Cycles 預覽（CC 帳號 A 的建模子代理，2026-11-04；和參考圖 xinsheng_sports_int 同角度比對用，不是遊戲截圖）。
用法：nice -n 15 /opt/blenv/bin/python tools/blender/env_second/bb_support/xinsheng_render.py -- <glb> <輸出資料夾> [--views views.json] [--only 名字,…] [--res 480x270] [--samples 16]
  views.json：[[名字, [眼睛 x,y,z], [看的點 x,y,z], 焦距mm, (shiftY)], …]（遊戲座標、36 mm 片幅）；ref（參考圖的角度＝layout 的 camRef）一定先渲染。
  燈：GLB 旁邊的 .json 的 lights（xinsheng_sports_interior.py 寫的）：每支日光燈一片面光（暖白）、每個軌道燈頭一盞投射燈；門口、左邊大窗進來的天光；
  天花板的補光（牆、天花板互相反射的那一層亮度；遊戲裡是烘焙／環境光）。
  環境變數：CC_BLENDER_DEVICE=GPU（PC 用）、CC_SAMPLES（覆蓋 --samples）。"""
import json, math, os, subprocess, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir = A[0], A[1]
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'xinsheng_sports_layout.js')]))
INFO = json.load(open(glb[:-4] + '.json'))
cr = LAY['camRef']
views = json.load(open(arg('--views'))) if arg('--views') else []
views = [['ref', cr['eye'], cr['look'], cr['lens'], cr.get('shiftY', 0.0)]] + [v for v in views if v[0] != 'ref']
only = arg('--only').split(',') if arg('--only') else None
rx, ry = [int(v) for v in arg('--res', '480x270').split('x')]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = int(os.environ.get('CC_SAMPLES', arg('--samples', '16')))
sc.cycles.device = os.environ.get('CC_BLENDER_DEVICE', 'CPU')
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = rx, ry; sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = arg('--look', 'AgX - Medium High Contrast')
except Exception: pass
sc.view_settings.exposure = float(arg('--exposure', '0.0'))
sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 24
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (1.0, 0.9, 0.78, 1); bg.inputs['Strength'].default_value = float(arg('--world', '0.15'))
for m in bpy.data.materials:   # 燈管、螢幕的發光強度（GLB 的 emissive 是 1）
    if not m.use_nodes: continue
    b = m.node_tree.nodes.get('Principled BSDF')
    if b and 'emit' in m.name: b.inputs['Emission Strength'].default_value = float(arg('--emit', '3.0'))


def light(kind, loc, energy, color, aim=None, sx=0.2, sy=0.2, size=0.1, spot=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy
    elif kind != 'SUN': ld.shadow_soft_size = size
    if spot: ld.spot_size = math.radians(spot); ld.spot_blend = 0.6
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (aim - loc).to_track_quat('-Z', 'Y').to_euler()
    return o


TUBE = tuple(float(v) for v in arg('--tubecol', '1.0,0.9,0.76').split(','))   # 參考圖：日光燈但整體很暖（米色牆、地磚、木頭的反射）
E_T = float(arg('--tube', '60'))
for (x, y, z) in INFO['lights']['tubes']:
    p = g2b(x, y, z); light('AREA', p, E_T * (1.0 if y > 4 else float(arg('--low', '0.6'))), TUBE, aim=p + Vector((0, 0, -1)), sx=1.2, sy=0.2)
for s in INFO['lights']['spots']:
    p = g2b(*s[:3]); d = g2b(*s[3:6]); light('SPOT', p, float(arg('--spot', '60')), (1.0, 0.82, 0.6), aim=p + d, spot=40, size=0.04)
W, D, HT = LAY['w'], LAY['d'], LAY['hTotal']
p = g2b(-1.5, 1.6, D / 2 - 0.2); light('AREA', p, float(arg('--door', '60')), (1.0, 0.92, 0.8), aim=g2b(-1.5, 1.2, 3), sx=6.0, sy=2.4)   # 門外騎樓的光（相機後面）
lw = LAY['leftWindow']
p = g2b(-W / 2 + 0.05, (lw['y0'] + lw['y1']) / 2, (lw['z0'] + lw['z1']) / 2)
light('AREA', p, float(arg('--win', '300')), (1.0, 0.95, 0.85), aim=p + Vector((1, 0, -0.2)), sx=lw['z1'] - lw['z0'], sy=lw['y1'] - lw['y0'])   # 左邊大窗的天光
p = g2b(0, HT - 0.3, 2.0); light('AREA', p, float(arg('--fill', '250')), (1.0, 0.88, 0.72), aim=p + Vector((0, 0, -1)), sx=W - 1.0, sy=10.0)    # 挑空的補光
p = g2b(0, 3.2, -4.0); light('AREA', p, float(arg('--fill1', '120')), (1.0, 0.88, 0.72), aim=p + Vector((0, 0, -1)), sx=W - 1.0, sy=7.0)     # 夾層下的補光
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36
os.makedirs(outdir, exist_ok=True)
for v in views:
    name, eye, look, lens = v[:4]; shy = v[4] if len(v) > 4 else 0.0
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.data.shift_y = shy
    cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'xinsheng_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
