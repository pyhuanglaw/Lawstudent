"""同弦樂器室內的 Cycles 渲染（CC 帳號 A，2026-11-04 v4）：匯入 GLB、軌道投射燈（照 GLB 旁邊 json 的 spots，每盞一個聚光燈）、吊燈、
臨街窗的天光＋午後的太陽（窗外一片「樹影」板，地上有斑駁的光，參考圖有），相機照 layout 的 camRef（參考圖的角度）。
用法：/opt/blenv/bin/python tools/blender/env_second/bb_support/tongxian_render.py -- <glb> <輸出資料夾> [--views views.json] [--only 名字,名字] [--res 836x470] [--samples 16]
  views.json：[[名字, [眼睛 x,y,z], [看的點 x,y,z], 焦距mm], …]（遊戲座標）；ref（參考圖的角度）一定會先渲染。
  調光：--spot 60（每盞投射燈 W）--sun 3.5 --sky 120（窗的面光 W）--pendant 25 --fill 60 --emit 1.0（窗外景、燈泡的發光倍數）--exposure 0
  環境變數：CC_BLENDER_DEVICE=GPU（PC 用）、CC_SAMPLES（覆蓋 --samples）。"""
import json, math, os, subprocess, sys
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
glb, outdir = A[0], A[1]
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LAY = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require(process.argv[1])))", os.path.join(REPO, 'src', 'data', 'tongxian_layout.js')]))['shop']
INFO = json.load(open(glb[:-4] + '.json'))
cr = LAY['camRef']
views = json.load(open(arg('--views'))) if arg('--views') else []
views = [['ref', cr['eye'], cr['look'], cr['lens']]] + [v for v in views if v[0] != 'ref']
only = arg('--only').split(',') if arg('--only') else None
rx, ry = [int(v) for v in arg('--res', '836x470').split('x')]
g2b = lambda x, y, z: Vector((x, -z, y))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = int(os.environ.get('CC_SAMPLES', arg('--samples', '16')))
sc.cycles.device = os.environ.get('CC_BLENDER_DEVICE', 'CPU')
sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.render.resolution_x, sc.render.resolution_y = rx, ry; sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = float(arg('--exposure', '0.0'))
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 24
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (1.0, 0.92, 0.8, 1); bg.inputs['Strength'].default_value = 0.08
EM = float(arg('--emit', '1.0'))
for m in bpy.data.materials:
    if not m.use_nodes: continue
    b = m.node_tree.nodes.get('Principled BSDF')
    if b and ('props' in m.name or 'lamp' in m.name): b.inputs['Emission Strength'].default_value = EM * (6.0 if 'lamp' in m.name else 1.0)
import bmesh   # 只給 Cycles 預覽用：single_side 補的反面和正面疊在同一個平面，Cycles 會打架變黑 → 渲染前把反面那一片刪掉（Cycles 不剔除背面，一片就兩面都看得到）；three.js 的 GLB 不動
_seen = set()
for ob in bpy.data.objects:
    if ob.type != 'MESH' or ob.data in _seen: continue
    _seen.add(ob.data); bm = bmesh.new(); bm.from_mesh(ob.data); keys = {}; kill = []
    for f in bm.faces:
        k = tuple(sorted((round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4)) for v in f.verts))
        if k in keys: kill.append(f)
        else: keys[k] = f
    if kill: bmesh.ops.delete(bm, geom=kill, context='FACES_ONLY'); bm.to_mesh(ob.data)
    bm.free()
for ob in bpy.data.objects:   # 窗外景的板（和牆上的紙條同一個物件）不擋太陽
    if ob.type == 'MESH' and ob.name.startswith('WALL_back') and any(s.material and 'props' in s.material.name for s in ob.material_slots):
        ob.visible_shadow = False


def light(kind, loc, energy, color, aim=None, sx=0.2, sy=0.2, size=0.1, spot=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy
    elif kind == 'SPOT': ld.spot_size = spot or math.radians(42); ld.spot_blend = 0.5; ld.shadow_soft_size = size
    elif kind != 'SUN': ld.shadow_soft_size = size
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (aim - loc).to_track_quat('-Z', 'Y').to_euler()
    return o


WARM = (1.0, 0.8, 0.58)
for p, t in INFO['spots']: light('SPOT', Vector(p), float(arg('--spot', '60')), WARM, aim=Vector(t), size=0.04)
pd = [i for i in LAY['items'] if i['kind'] == 'pendant'][0]
light('POINT', g2b(pd['x'], pd['y'] - 0.06, pd['z']), float(arg('--pendant', '25')), (1.0, 0.78, 0.52), size=0.05)
Z0, H = -LAY['d'] / 2, LAY['h']
for wn in LAY['windows']:   # 窗的天光（面光，往店裡）
    cx = (wn['x0'] + wn['x1']) / 2; cy = (wn['sill'] + wn['head']) / 2; p = g2b(cx, cy, Z0 - 0.1)
    light('AREA', p, float(arg('--sky', '120')), (1.0, 0.96, 0.9), aim=p + Vector((0, -1, 0)), sx=wn['x1'] - wn['x0'], sy=wn['head'] - wn['sill'])
p = g2b(0.3, H - 0.05, 0.0); fl_ = light('AREA', p, float(arg('--fill', '60')), (1.0, 0.86, 0.68), aim=p + Vector((0, 0, -1)), sx=5.0, sy=8.0)   # 天花板反射的補光
fl_.visible_glossy = False; fl_.visible_camera = False   # 不要在木地板上反射出一大片白
sd = Vector(g2b(-0.22, -0.68, 0.72)).normalized()   # 午後的太陽：從窗外斜斜照進來（往南、往下）
sun = light('SUN', Vector((0, 0, 10)), float(arg('--sun', '3.5')), (1.0, 0.86, 0.66)); sun.rotation_euler = (-sd).to_track_quat('Z', 'Y').to_euler(); sun.data.angle = math.radians(1.5)
# 窗外的樹影板（程式的雜訊當透明度）：在窗外 0.8 m
gm = bpy.data.materials.new('gobo'); gm.use_nodes = True; nt = gm.node_tree; N = nt.nodes
for n in list(N): N.remove(n)
out = N.new('ShaderNodeOutputMaterial'); mix = N.new('ShaderNodeMixShader'); tr = N.new('ShaderNodeBsdfTransparent'); df = N.new('ShaderNodeBsdfDiffuse')
nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.2; nz.inputs['Detail'].default_value = 4.0
cr_ = N.new('ShaderNodeValToRGB'); cr_.color_ramp.elements[0].position = 0.47; cr_.color_ramp.elements[1].position = 0.53
nt.links.new(nz.outputs['Fac'], cr_.inputs['Fac']); nt.links.new(cr_.outputs['Color'], mix.inputs['Fac'])
nt.links.new(df.outputs['BSDF'], mix.inputs[1]); nt.links.new(tr.outputs['BSDF'], mix.inputs[2]); nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=1.0); gp = bpy.context.active_object; gp.scale = (12, 6, 1); gp.location = g2b(0.6, 2.4, Z0 - 0.8)
gp.rotation_euler = (-sd).to_track_quat('Z', 'Y').to_euler(); gp.data.materials.append(gm); gp.visible_camera = False; gp.visible_diffuse = False; gp.visible_glossy = False
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_width = 36
os.makedirs(outdir, exist_ok=True)
for name, eye, look, lens in views:
    if only and name not in only: continue
    cam.data.lens = lens; cam.data.clip_start = 0.05; cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(outdir, f'tongxian_{name}.png'); bpy.ops.render.render(write_still=True); print('render', sc.render.filepath, flush=True)
