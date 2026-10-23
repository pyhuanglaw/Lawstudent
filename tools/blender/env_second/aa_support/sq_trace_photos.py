"""店員支線「痕跡」道具上的照片（AA_404／405，LAWWW2-B 2026-10-23）：用遊戲裡那間店的正式模型在 Blender 拍，不另外畫。
  SQ12 Pasta 118：吧檯後面牆上的照片——兩個人（老闆和女朋友，路人的坐姿替身 seated_figures.glb），後面是窗邊那一桌（l118_pasta.glb）。
  SQ14 一盞茶屋：櫃台（水屋）上的貓照片——照片很舊，背景是茶屋的院子（wz_teahouse_interior.glb＋公園的貓 wz_cat.glb 坐姿、還沒戴名牌）。
輸出 textures/gen/sq12_photo.png、sq14_catphoto.png（之後 sq_traces.py 做成相框；sq14 再用 PIL 做舊：褪色、偏黃、四角暗）。
用法：/opt/blenv/bin/python tools/blender/env_second/aa_support/sq_trace_photos.py [-- --only sq12|sq14] [--threads N]
"""
import math, os, sys
import bpy
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ENV = os.path.dirname(HERE); ROOT = os.path.abspath(os.path.join(ENV, '..', '..', '..'))
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
ONLY = A[A.index('--only') + 1] if '--only' in A else None
THREADS = int(A[A.index('--threads') + 1]) if '--threads' in A else 0
GEN = os.path.join(ENV, 'textures', 'gen'); M2 = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai')
g2b = lambda x, y, z: Vector((x, -z, y))   # 遊戲座標 → Blender


def scene(glbs, samples=48):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for f in glbs: bpy.ops.import_scene.gltf(filepath=f)
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
    try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    if THREADS: sc.render.threads_mode = 'FIXED'; sc.render.threads = THREADS
    sc.view_settings.view_transform = 'Standard'; sc.cycles.max_bounces = 4; sc.cycles.transparent_max_bounces = 64
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.82, 0.9, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
    return sc


def light(kind, at, energy, size=1.0, col=(1, 1, 1), aim=None):
    lt = bpy.data.objects.new('L_' + kind, bpy.data.lights.new('L', kind)); lt.data.energy = energy; lt.data.color = col
    if kind == 'AREA': lt.data.size = size
    lt.location = g2b(*at); bpy.context.scene.collection.objects.link(lt)
    if aim: lt.rotation_euler = (g2b(*aim) - lt.location).to_track_quat('-Z', 'Y').to_euler()
    return lt


def camera(eye, look, lens, w, h):
    sc = bpy.context.scene; cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); cam.data.lens = lens; sc.collection.objects.link(cam)
    cam.location = g2b(*eye); cam.rotation_euler = (g2b(*look) - cam.location).to_track_quat('-Z', 'Y').to_euler(); sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = w, h


def render(out):
    bpy.context.scene.render.filepath = out; bpy.ops.render.render(write_still=True); print('寫出', out)


def fig(name, x, z, yaw):
    """坐姿替身（原點＝座位地面中心、+z 朝前）放到 (x, z)，yaw＝面向（遊戲：0＝+z）；其他替身藏起來"""
    ob = bpy.data.objects.get(name)
    assert ob, name
    ob.hide_render = False; ob.location = g2b(x, 0, z); ob.rotation_mode = 'XYZ'; ob.rotation_euler = (0, 0, yaw)   # 匯入後物件沒有旋轉（網格已經是 Blender 的 z 朝上）；面向遊戲 +z＝Blender −y，轉 π＝面向遊戲 −z
    return ob


def sq12():
    sc = scene([os.path.join(M2, 'l118_pasta.glb'), os.path.join(M2, 'seated_figures.glb')])
    figs = [o for o in sc.objects if o.name.startswith('fig_')]
    for o in figs: o.hide_render = True
    # 窗邊那一桌（1.05, 2.6）靠玻璃那一側坐兩個人、面向店裡；老闆（男）、女朋友（女）
    for o in figs: o.rotation_mode = 'XYZ'
    a = next(o for o in figs if o.name.startswith('fig_npc_nm') and '_listen_' in o.name and not o.name.endswith('lod1'))
    b = next(o for o in figs if o.name.startswith('fig_npc_nf') and '_listen_' in o.name and not o.name.endswith('lod1'))
    for o, x in ((a, 0.8), (b, 1.32)):
        o.hide_render = False; o.parent = None; o.location = g2b(x, 0, 3.1); o.rotation_euler = (0, 0, math.pi)
    light('AREA', (1.05, 2.2, 1.2), 120, size=1.2, col=(1, 0.95, 0.88), aim=(1.05, 1.0, 3.0))   # 正面的閃光（拍照）
    camera((1.05, 1.25, 1.35), (1.05, 1.0, 3.1), 32, 480, 360); render(os.path.join(GEN, 'sq12_photo.png'))


def sq14():
    sc = scene([os.path.join(M2, 'wz_teahouse_interior.glb'), os.path.join(M2, 'aa_support', 'wz_cat.glb')])
    keep = bpy.data.objects.get('CAT_sit')
    for o in sc.objects:
        if o.name.startswith('CAT_') and o.name != 'CAT_sit' and o.parent is None: o.hide_render = True
        if o.name.endswith(('_tag', '_bandage', '_collar', '_tag_back')): o.hide_render = True   # 還沒被取名字以前：沒有項圈、名牌
        if 'fur_old_holder' in o.name: o.hide_render = True
    for o in [o for o in sc.objects if o.name.startswith('CAT_') and o.name != 'CAT_sit']:
        for q in [o] + list(o.children_recursive): q.hide_render = True
    keep.location = g2b(1.6, 0.0, 5.9); keep.rotation_mode = 'XYZ'; keep.parent = None; keep.rotation_euler = (0, 0, math.pi * 0.92)   # 坐在緣側的邊上、面向屋裡
    light("AREA", (1.6, 1.8, 4.5), 40, size=2.0, col=(1, 0.97, 0.9), aim=(1.6, 0.4, 6.0))
    camera((1.45, 0.72, 4.3), (1.7, 0.5, 6.8), 30, 480, 360); render(os.path.join(GEN, 'sq14_catphoto_raw.png'))


if ONLY in (None, 'sq12'): sq12()
if ONLY in (None, 'sq14'): sq14()
