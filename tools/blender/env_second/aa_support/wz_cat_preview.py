"""溫州街的貓 v3：讀匯出的 wz_cat.glb（遊戲拿到的那一份），把 CAT_walk 的四段動畫每段拍幾格（側面＋斜前方），拼成一張圖給人看。
  /opt/blenv/bin/python tools/blender/env_second/aa_support/wz_cat_preview.py -- --glb assets/models/env/second_ai/aa_support/wz_cat.glb --out 輸出.png
Workbench 算圖（快、看形狀和變形用；毛色是貼圖）。"""
import math, os, sys
import bpy
from mathutils import Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
arg = lambda k, d=None: ARGS[ARGS.index(k) + 1] if k in ARGS else d
GLB, OUT = arg('--glb', 'assets/models/env/second_ai/aa_support/wz_cat.glb'), arg('--out', 'cat_preview.png')
FRAMES = {'cat_walk': [0, 3, 6, 9, 12, 15, 18, 21], 'cat_idle': [0, 24, 48, 72], 'cat_sit': [0, 6, 12, 19], 'cat_sit_idle': [0, 24, 48, 72]}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
sc = bpy.context.scene
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
for o in sc.objects:   # 只留 CAT_walk（骨架、身體；項圈、繃帶藏起來）
    keep = o == arm or (o.parent == arm and o.name.startswith('CAT_walk_mesh'))
    o.hide_render = not keep
arm.location = (0, 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'TEXTURE'
sc.display.shading.show_shadows = True
sc.render.resolution_x, sc.render.resolution_y = 360, 300; sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 50; cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
gp = bpy.data.meshes.new('ground'); gp.from_pydata([(-2, -2, 0), (2, -2, 0), (2, 2, 0), (-2, 2, 0)], [], [(0, 1, 2, 3)]); g = bpy.data.objects.new('ground', gp); sc.collection.objects.link(g)


def aim(pos, tgt):
    cam.location = Vector(pos); d = Vector(tgt) - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


VIEWS = {'side': ((1.25, 0.0, 0.32), (0, 0, 0.17)), 'front3q': ((0.75, -0.95, 0.42), (0, 0, 0.16))}   # 頭朝遊戲 +z＝Blender −Y
acts = {a.name: a for a in bpy.data.actions}
print('actions', sorted(acts))
tiles = []
tmp = os.path.join(os.path.dirname(os.path.abspath(OUT)), '_catprev')
os.makedirs(tmp, exist_ok=True)
arm.animation_data_create()
for an, frs in FRAMES.items():
    a = next((v for k, v in acts.items() if k.startswith(an) and (k == an or not k[len(an):len(an) + 1].isalpha())), None)
    if a is None: print('MISSING', an); continue
    arm.animation_data.action = a
    try:
        slots = list(a.slots); arm.animation_data.action_slot = slots[0] if slots else None
    except Exception: pass
    for vn, (p, t) in VIEWS.items():
        aim(p, t)
        for f in frs:
            sc.frame_set(f); fp = os.path.join(tmp, f'{an}_{vn}_{f:03d}.png'); sc.render.filepath = fp; bpy.ops.render.render(write_still=True); tiles.append((an, vn, f, fp))
print('tiles', len(tiles))
try:
    from PIL import Image, ImageDraw
    rows = {}
    for an, vn, f, fp in tiles: rows.setdefault((an, vn), []).append((f, fp))
    W = max(len(v) for v in rows.values()) * 360; H = len(rows) * 320
    sheet = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(sheet)
    for r, ((an, vn), lst) in enumerate(rows.items()):
        for c, (f, fp) in enumerate(lst):
            sheet.paste(Image.open(fp).convert('RGB'), (c * 360, r * 320 + 20)); d.text((c * 360 + 4, r * 320 + 4), f'{an} {vn} f{f}', fill='black')
    sheet.save(OUT); print('wrote', OUT, sheet.size)
except ImportError:
    print('PIL 沒有：單張在', tmp)
