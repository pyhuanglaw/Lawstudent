"""宿舍上舖梯子的對照圖（DORM-LADDER-HEAD-GRIP-1102 ②，LAWWW2-C 2026-11-05）：dorm_room4.glb（改前／改後）＋ sleep_scene.grips 手抓的點＋祐廷的遊戲姿勢（tools/anim/climb_pose_export.js 匯出的 OBJ）。
Blender Workbench（貼圖顏色、STUDIO 光），座標＝遊戲 dorm 區域（GLB／OBJ 匯入＝Blender (x, −z, y)）。
用法：/opt/blenv/bin/python tools/blender/env_second/dorm_ladder_preview.py -- --glb dorm_room4.glb --layout dorm_room4.layout.json --out 輸出資料夾 --tag after
        [--obj OBJ資料夾 --poses up_1,up_3] [--grips up|down|none] [--views front,climbcam,close,bedside] [--res 900]
  抓的點：左手藍、右手橘（人物自己的左右）；--poses 那一階的點畫大一點。"""
import os, sys, json, math
import bpy
ARGV = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, dv=None): return ARGV[ARGV.index(k) + 1] if k in ARGV else dv
GLB, LAY, OUT, TAG = arg('--glb'), arg('--layout'), arg('--out', '.'), arg('--tag', 'after')
OBJD, POSES = arg('--obj'), [p for p in (arg('--poses', '') or '').split(',') if p]
GRIPS, VIEWS, RES = arg('--grips', 'up'), arg('--views', 'front,climbcam,close,bedside').split(','), int(arg('--res', '900'))
os.makedirs(OUT, exist_ok=True)
U = [u for u in json.load(open(LAY))['units'] if u['id'] == 'L2'][0]; SC = U['sleep_scene']
st = SC['steps']; mx, mz = (st[0][0] + st[-1][0]) / 2, (st[0][2] + st[-1][2]) / 2


def G(p): return (p[0], -p[2], p[1])                     # 遊戲 → Blender


def mat(name, col):
    m = bpy.data.materials.new(name); m.diffuse_color = (*col, 1.0); return m


def sphere(p, r, m):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=G(p), segments=16, ring_count=8); o = bpy.context.object; o.data.materials.append(m); return o


VIEW = {'front': ((0.85, 2.1, 1.55), (mx + 0.03, 1.2, mz), 55),            # 從房間中間的走道正面看梯子（右邊是床、左邊是門那一側）
        'climbcam': ((-0.83, 1.75, 2.99), (mx, 0.95, mz), 62),            # 遊戲爬梯子的鏡頭（story3d.js S.climbCam）
        'close': ((-0.35, 2.1, 1.8), (-1.48, 1.75, 1.27), 45),           # 靠床那一側的新扶手：彎進床尾板的那一頭
        'bedside': ((-1.35, 2.55, 0.15), (-1.35, 1.45, 1.45), 60)}        # 從床上（床墊上方）看階梯：床尾板、新扶手、上下床扶手


def look(cam, frm, to):
    import mathutils
    d = mathutils.Vector(G(to)) - mathutils.Vector(G(frm)); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def shoot(view, pose):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sh = sc.display.shading
    sh.light = 'STUDIO'; sh.color_type = 'TEXTURE'; sh.show_shadows = True; sh.shadow_intensity = 0.35; sh.show_cavity = True
    sc.render.resolution_x = RES; sc.render.resolution_y = int(RES * 0.75); sc.world = bpy.data.worlds.new('w'); sh.background_type = 'WORLD'; sc.world.color = (0.08, 0.08, 0.09)
    bpy.ops.import_scene.gltf(filepath=GLB)
    for o in list(bpy.data.objects):                                   # 擋鏡頭的：天花板、門那面牆（close 也拿掉左牆）
        n = o.name
        if n.startswith('BAKEONLY') or n.startswith('dorm_ceiling') or n.startswith('WALL_front') or (view == 'close' and n.startswith('WALL_right')): o.hide_render = True
    if pose and OBJD:
        bpy.ops.wm.obj_import(filepath=os.path.join(OBJD, pose + '.obj'), forward_axis='NEGATIVE_Z', up_axis='Y')
    if GRIPS != 'none':
        mL, mR = mat('gL', (0.15, 0.4, 1.0)), mat('gR', (1.0, 0.45, 0.05))
        dn = GRIPS; kk = int(pose.split('_')[1]) - 1 if pose else -1
        for k, row in enumerate(SC['grips'][dn]):
            for j, g in enumerate(row):
                if g: sphere(g['p'], 0.03 if k == kk else 0.017, mL if j == 0 else mR)
    cam = bpy.data.cameras.new('cam'); frm, to, fov = VIEW[view]; cam.angle = math.radians(fov)
    if view == 'climbcam' and pose:                                    # 遊戲的爬梯子鏡頭跟著人：看人腳下往上 1.0 m（story3d.js 的 camOn）
        s = st[int(pose.split('_')[1]) - 1]; to = (s[0], s[1] + 1.0, s[2])
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co; co.location = G(frm); look(co, frm, to)
    out = os.path.join(OUT, '%s_%s%s.png' % (TAG, view, '_' + pose if pose else '')); sc.render.filepath = out; bpy.ops.render.render(write_still=True); print(out); return out


for v in VIEWS:
    if POSES:
        for p in POSES: shoot(v, p)
    else: shoot(v, None)
