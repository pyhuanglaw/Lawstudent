#!/usr/bin/env python3
"""坐下高度的側面預覽（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04）：tools/anim/sit_pose_export.js 匯出的「遊戲坐姿」OBJ（改前／改後）＋家具，Blender Workbench 拍人物右側。
家具照遊戲的尺寸（人物座標：x 左手邊、y 上、z 前；原點＝座位的地面；OBJ 匯入＝Blender (x, −z, y)）：
  chair：Z3.chair（zones3d.js：椅面 0.44×0.05×0.42、中心高 0.46＝椅面 0.485、前後 −0.20～+0.22；椅背 z −0.2）＋總圖自習桌（桌面 0.75、桌緣在座位前 0.30）
  lecture：法律系館A 201／博思的階梯教室（classroom_201.py、teach_interior.py：翻椅面 0.475（前緣往下彎 3.2 cm）、座位點前 −0.17～+0.25；椅背 −0.205～−0.275、0.53～0.91；
           長桌近緣在座位前 0.32、遠緣 0.77、桌面 0.75；擋板；桌下置物架：改前平台上 0.515～0.525（前緣擋片到 0.55）、改後 0.63～0.64（到 0.665），座位前 0.44～0.74）
用法：/opt/blenv/bin/python tools/anim/sit_height_preview.py -- --obj OBJ資料夾 --out 輸出資料夾 [--keys npc_f1,npc_m1] [--res 560]
"""
import os, sys, math
import bpy
ARGV = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, dv): return ARGV[ARGV.index(k) + 1] if k in ARGV else dv
OBJ = arg('--obj', '.'); OUT = arg('--out', '.'); KEYS = arg('--keys', 'npc_f1,npc_m1').split(','); RES = int(arg('--res', '560'))
os.makedirs(OUT, exist_ok=True)


def G(x, y, z): return (x, -z, y)                       # 遊戲（人物）座標 → Blender


def box(name, x0, x1, y0, y1, z0, z1, col):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name
    cx, cy, cz = G((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); o.location = (cx, cy, cz); o.scale = (abs(x1 - x0), abs(z1 - z0), abs(y1 - y0))
    m = bpy.data.materials.new(name + '_m'); m.diffuse_color = (*col, 1.0); o.data.materials.append(m); return o


WOOD, STEEL, SEAT, DESK, FLOOR, SHELF = (0.55, 0.36, 0.22), (0.35, 0.37, 0.4), (0.62, 0.45, 0.3), (0.3, 0.23, 0.18), (0.82, 0.82, 0.8), (0.85, 0.15, 0.15)


def furniture(mode, state):
    box('floor', -0.8, 0.8, -0.01, 0.0, -0.6, 1.2, FLOOR)
    if mode == 'chair':
        box('seat', -0.22, 0.22, 0.435, 0.485, -0.20, 0.22, SEAT)
        box('back', -0.21, 0.21, 0.67, 0.93, -0.2175, -0.1825, SEAT)
        for sx in (-0.19, 0.19):
            for sz in (-0.18, 0.18): box('leg', sx - 0.012, sx + 0.012, 0.0, 0.435, sz - 0.012, sz + 0.012, STEEL)
            box('post', sx - 0.012, sx + 0.012, 0.485, 0.92, -0.212, -0.188, STEEL)
        box('desk', -0.6, 0.6, 0.72, 0.75, 0.30, 1.30, DESK)
        for sx in (-0.55, 0.55): box('dleg', sx - 0.025, sx + 0.025, 0.0, 0.72, 1.0, 1.05, STEEL)
    else:
        box('pan', -0.24, 0.24, 0.453, 0.475, -0.17, 0.16, SEAT)
        box('pan_front', -0.24, 0.24, 0.443, 0.468, 0.16, 0.25, SEAT)          # 前緣往下彎（簡化成兩段）
        box('back', -0.25, 0.25, 0.53, 0.91, -0.275, -0.205, SEAT)
        box('column', -0.032, 0.032, 0.0, 0.41, -0.092, -0.028, STEEL)
        box('desk', -0.7, 0.7, 0.72, 0.75, 0.32, 0.77, DESK)
        box('panel', -0.7, 0.7, 0.04, 0.72, 0.746, 0.766, DESK)
        y0 = 0.515 if state == 'before' else 0.63
        box('shelf', -0.68, 0.68, y0, y0 + 0.01, 0.44, 0.74, SHELF)
        box('lip', -0.68, 0.68, y0, y0 + 0.035, 0.435, 0.445, SHELF)


def shoot(key, state, mode):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'
    sc.display.shading.show_shadows = False; sc.display.shading.show_cavity = True; sc.render.resolution_x = RES; sc.render.resolution_y = RES
    sc.render.film_transparent = False; sc.world = bpy.data.worlds.new('w'); sc.display.shading.background_type = 'WORLD'; sc.world.color = (1, 1, 1)
    p = os.path.join(OBJ, '%s_%s_%s.obj' % (key, state, mode))
    bpy.ops.wm.obj_import(filepath=p, forward_axis='NEGATIVE_Z', up_axis='Y')
    furniture(mode, state)
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = 1.55
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    co.location = G(-3.0, 0.72, 0.28); co.rotation_euler = (math.radians(90), 0, math.radians(-90))   # 從人物右側往左看（看 +X）：人物面向畫面右邊
    out = os.path.join(OUT, '%s_%s_%s.png' % (key, state, mode)); sc.render.filepath = out; bpy.ops.render.render(write_still=True); return out


for key in KEYS:
    for mode in ('chair', 'lecture'):
        for state in ('before', 'after'): print(shoot(key, state, mode))
