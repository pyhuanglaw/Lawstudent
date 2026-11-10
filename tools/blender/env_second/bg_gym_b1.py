"""2D 背景：新體育館 B1 健身中心（AA716-GYM-BG，LAWWW2-B 2026-11-07；LAWWW-B 07:46 派）。
AA_716 子晴故事線第 3 拍以後的約「陪子晴去健身房」（src/arcinv3d.js、src/data/arc_invites.js heroine_04:3）是 2D 對話，背景原本是深色底＋「新體育館 B1・健身中心」。
從遊戲的 B1 正式模型（assets/models/env/second_ai/gym_b1.glb，tools/blender/env_second/gym_b1.py）算圖：健身中心裡面、飛輪那一區、晚上 19:00（B1 沒有窗：燈全開）、沒有人。
燈：和光照烘焙同一份（tools/blender/env_second/lightbake/gym_b1_lm.json 的 lights、points：天花板 2.4 m 燈管、走廊壁燈），所以和遊戲裡的明暗一致。
用法（cwd 放在 scratchpad：在 repo 根目錄跑 glTF 匯入會壞）：
  /opt/blenv/bin/python tools/blender/env_second/bg_gym_b1.py -- <輸出.png> [--res 1920x1080] [--samples 96] [--eye x,y,z --look x,y,z --lens mm] [--exposure 0] [--lamp 1.0]
座標＝gym_b1 區域座標（x 東、y 上、z 南；健身中心 x −24～10、z 3～14，南牆整面鏡子 z 13.9，飛輪 x −0.5～4、z 9.4 面向鏡子）。"""
import json, math, os, sys
import bpy
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
A = sys.argv[sys.argv.index('--') + 1:]
OUT = os.path.abspath(A[0])
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
def vec(s): return [float(t) for t in s.split(',')]
g2b = lambda x, y, z: Vector((x, -z, y))
RW, RH = map(int, arg('--res', '1920x1080').split('x'))
EYE = vec(arg('--eye', '8.6,1.55,4.4')); LOOK = vec(arg('--look', '-2.5,1.0,11.6')); LENS = float(arg('--lens', '20')); LAMP = float(arg('--lamp', '1.0'))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, 'assets/models/env/second_ai/gym_b1.glb'))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(arg('--samples', '96'))
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 8; sc.cycles.diffuse_bounces = 4; sc.cycles.glossy_bounces = 4; sc.cycles.transparent_max_bounces = 32
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'None'; sc.view_settings.exposure = float(arg('--exposure', '0'))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.02, 0.022, 0.025, 1); bg.inputs['Strength'].default_value = 1.0

# 燈：光照烘焙那一份（bake_room.py 的 --lights／--points 同樣的擺法）
LM = json.load(open(os.path.join(HERE, 'lightbake', 'gym_b1_lm.json')))
nl = 0
for spec in (LM.get('lights') or '').split(';'):
    if not spec.strip(): continue
    v = [float(t) for t in spec.split(',')]; x0, x1, z0, z1, y, nx, nz, Wt = v[:8]; lsx, lsz = (v[8], v[9]) if len(v) >= 10 else (1.2, 0.3); col = tuple(v[10:13]) if len(v) >= 13 else (1.0, 0.97, 0.92)
    for i in range(int(nx)):
        for j in range(int(nz)):
            x = x0 + (x1 - x0) * (i + 0.5) / nx; z = z0 + (z1 - z0) * (j + 0.5) / nz
            ld = bpy.data.lights.new('fx', 'AREA'); ld.shape = 'RECTANGLE'; ld.size = lsx; ld.size_y = lsz; ld.energy = Wt * LAMP; ld.color = col
            if len(v) >= 14: ld.spread = math.radians(v[13])
            lo = bpy.data.objects.new('fx', ld); sc.collection.objects.link(lo); lo.location = Vector((x, -z, y - 0.01)); nl += 1
for spec in (LM.get('points') or '').split(';'):
    if not spec.strip(): continue
    v = [float(t) for t in spec.split(',')]; x, y, z, Wt = v[:4]; col = tuple(v[4:7]) if len(v) >= 7 else (1.0, 0.85, 0.7)
    ld = bpy.data.lights.new('pt', 'POINT'); ld.energy = Wt * LAMP; ld.color = col; ld.shadow_soft_size = v[7] if len(v) >= 8 else 0.06
    lo = bpy.data.objects.new('pt', ld); sc.collection.objects.link(lo); lo.location = Vector((x, -z, y)); nl += 1

cd = bpy.data.cameras.new('cam'); cd.lens = LENS; cd.sensor_fit = 'HORIZONTAL'; cd.sensor_width = 36.0; cd.clip_start = 0.05; cd.clip_end = 200
co = bpy.data.objects.new('cam', cd); sc.collection.objects.link(co); sc.camera = co
co.location = g2b(*EYE); co.rotation_euler = (g2b(*LOOK) - g2b(*EYE)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True)
print('OK', OUT, 'lights', nl, flush=True)
