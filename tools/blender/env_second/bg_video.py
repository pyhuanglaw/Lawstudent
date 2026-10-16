"""2D 背景：視訊・可昕那一端（outings3d.js 的 S.BG.video；BG-18／ART-BG18）。LAWWW2-B 2026-10-16。
劇情（AA_147）：K4 視訊讀書（第 16 週二 12/16 21:00）、期末成績（寒假 1/5 21:00）、情人節 2/14 20:00、出遊的視訊版。
畫面是祐廷的手機，螢幕上是可昕（立繪疊在中間）。**她那一端＝書桌一角、檯燈；看不出是宿舍還是家**（宿舍和寒假在家用同一張）。
→ 從她手機的鏡頭看出去：面前是書桌的一角（桌緣在畫面下方）、她身後的牆（米白、沒有特徵）、左邊一盞檯燈（暖光，這一張的主光）、
  牆上一塊小軟木板（貼幾張沒有字的便利貼、明信片——只有色塊）、右邊一小段書架（書背沒有字）、桌上馬克杯、筆筒、一盆小多肉、耳機；
  右邊窗簾拉著（縫隙是夜晚的深藍）。人物站的位置（畫面中間）留空、背景比較暗，立繪疊上去才看得清楚。
  /opt/blenv/bin/python tools/blender/env_second/bg_video.py -- <輸出.png> [--res 1920x1080] [--samples 96]
座標＝遊戲座標（x 東、y 上、z 南）；牆在 z=0、鏡頭在 +z 往 −z 看。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]
def opt(name, default):
    return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '96'))
rng = random.Random(1216)
B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.3'))
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass


def lathe_obj(name, profile, mat, at, seg=32):
    bm = L.lathe(profile, seg); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = g2b(*at); me.polygons.foreach_set('use_smooth', [True] * len(me.polygons)); return ob


def point_light(name, x, y, z, power, col, r=0.05):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


M = {
    'wall': L.flat('vid_wall', '#d6ccbd', rough=0.92),   # 乳膠漆的米白牆（v1 用灰泥貼圖，太粗、像水泥）
    'desk': L.pbr('vid_desk', 'fine_grained_wood', tile=0.6, target='#b48a62', maps=('diff', 'nor'), rough_value=0.4) if os.path.isdir(L.tex_dir('fine_grained_wood')) else L.flat('vid_desk', '#b48a62', rough=0.4),
    'shelf': L.flat('vid_shelf', '#efeae2', rough=0.6),
    'cork': L.pbr('vid_cork', 'dirty_carpet', tile=0.25, target='#a7835a', maps=('diff',), rough_value=0.9),
    'frame': L.flat('vid_frame', '#8a6a48', rough=0.6),
    'lamp': L.flat('vid_lamp', '#e9e4da', rough=0.35), 'lamp_in': L.flat('vid_lamp_in', '#fff4dc', rough=0.3, emit=B.srgb('#ffd9a0')),
    'metal': L.flat('vid_metal', '#3a3c3f', rough=0.4, metal=0.5),
    'mug': L.flat('vid_mug', '#5b7d9a', rough=0.3), 'pot': L.flat('vid_pot', '#d9cbb6', rough=0.6), 'succ': L.flat('vid_succ', '#6f9a6a', rough=0.6),
    'curtain': L.pbr('vid_curtain', 'fabric_leather_02', tile=0.5, target='#9fb0b8', maps=('diff',), rough_value=0.95) if os.path.isdir(L.tex_dir('fabric_leather_02')) else L.flat('vid_curtain', '#9fb0b8', rough=0.95),
    'night': L.flat('vid_night', '#0e1830', rough=1.0, emit=B.srgb('#141e3a')),
    'head': L.flat('vid_headphone', '#2a2a2c', rough=0.5),
}
M['lamp_in'].node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 6.0
# 牆（z=0）、右邊轉角的牆（x=1.6）、天花板外；書桌（桌面 0.74，桌緣在 z=0.62）
Mesh('vid_wall', M['wall']).box(-3.0, 1.6, -0.2, 2.6, -0.1, 0.0).finish()
Mesh('vid_skirt', M['shelf']).box(-3.0, 1.6, -0.2, 0.08, 0.0, 0.012).finish()
Mesh('vid_wall_r', M['wall']).box(1.6, 1.7, 0.0, 2.6, -0.1, 2.0).finish()
Mesh('vid_desk', M['desk']).box(-1.4, 1.6, 0.71, 0.74, 0.0, 0.62).finish()
# 牆上：軟木板（左上）＋色塊便利貼、明信片（沒有字）
Mesh('vid_cork', M['cork']).box(-1.25, -0.55, 1.18, 1.68, -0.005, 0.012).finish()
Mesh('vid_cork_frame', M['frame']).box(-1.27, -0.53, 1.16, 1.18, -0.005, 0.02).box(-1.27, -0.53, 1.68, 1.70, -0.005, 0.02).box(-1.27, -1.25, 1.16, 1.70, -0.005, 0.02).box(-0.55, -0.53, 1.16, 1.70, -0.005, 0.02).finish()
for k, (x0, y0, w_, h_, col) in enumerate(((-1.18, 1.46, 0.12, 0.16, '#d9a0a0'), (-1.0, 1.5, 0.08, 0.08, '#f2d77a'), (-0.88, 1.32, 0.16, 0.11, '#a9c6d8'), (-0.7, 1.45, 0.1, 0.14, '#b9d6a8'), (-1.12, 1.25, 0.09, 0.09, '#f2d77a'))):
    Mesh(f'vid_note{k}', L.flat(f'vid_note{k}', col, rough=0.8)).box(x0, x0 + w_, y0, y0 + h_, 0.012, 0.014 + k * 0.0005).finish()
# 右邊的書架（牆上的兩層板＋書）
sh = Mesh('vid_shelf', M['shelf'])
for y in (1.25, 1.62): sh.box(0.55, 1.58, y, y + 0.025, 0.0, 0.24)
sh.finish()
cols = ['#7a4a3a', '#3f5a6e', '#c9b38a', '#5a6e4a', '#8a3b47', '#e0d6c4', '#2f3a44', '#b07a4a']
for y in (1.275, 1.645):
    x = 0.6
    while x < 1.5:
        w_ = rng.uniform(0.025, 0.05); h_ = rng.uniform(0.17, 0.27)
        Mesh('vid_book', L.flat('vid_book_' + str(rng.randint(0, 999)), rng.choice(cols), rough=0.7)).box(x, x + w_, y, y + h_, 0.02, 0.2).finish(); x += w_ + 0.004
# 檯燈（左邊桌上）：底座、兩節燈臂、燈罩，燈罩朝下照桌面
LX, LZ = -1.05, 0.25
lathe_obj('vid_lamp_base', [(0.0, 0.0), (0.09, 0.0), (0.09, 0.02), (0.05, 0.03), (0.0, 0.03)], M['lamp'], (LX, 0.74, LZ))
arm = Mesh('vid_lamp_arm', M['metal']); arm.cyl((LX, 0.77, LZ), (LX + 0.05, 1.12, LZ - 0.05), 0.008, seg=8); arm.cyl((LX + 0.05, 1.12, LZ - 0.05), (LX + 0.3, 1.2, LZ), 0.008, seg=8); arm.finish(smooth=True)
sh_ = lathe_obj('vid_lamp_shade', [(0.02, 0.0), (0.03, 0.0), (0.09, -0.11), (0.085, -0.115), (0.025, -0.005)], M['lamp'], (LX + 0.3, 1.2, LZ), seg=28)
lathe_obj('vid_lamp_bulb', [(0.0, -0.03), (0.035, -0.06), (0.03, -0.095), (0.0, -0.1)], M['lamp_in'], (LX + 0.3, 1.2, LZ), seg=20)
point_light('vid_lamp_light', LX + 0.3, 1.11, LZ, 28, (1.0, 0.8, 0.55), 0.04)
# 桌上：馬克杯、筆筒、多肉、耳機、一疊講義（沒有字）
lathe_obj('vid_mug', [(0.0, 0.0), (0.04, 0.0), (0.042, 0.095), (0.036, 0.095), (0.034, 0.01), (0.0, 0.01)], M['mug'], (-0.62, 0.74, 0.32), seg=24)
lathe_obj('vid_pencup', [(0.0, 0.0), (0.035, 0.0), (0.035, 0.11), (0.031, 0.11), (0.031, 0.005), (0.0, 0.005)], M['frame'], (1.15, 0.74, 0.2), seg=20)
pens = Mesh('vid_pens', M['metal'])
for dx, dz, c in ((-0.01, 0.0, 0), (0.012, 0.01, 1), (0.0, -0.012, 2)): pens.cyl((1.15 + dx, 0.75, 0.2 + dz), (1.15 + dx * 3, 0.95, 0.2 + dz * 3), 0.004, seg=6)
pens.finish(smooth=True)
lathe_obj('vid_pot', [(0.0, 0.0), (0.04, 0.0), (0.05, 0.07), (0.045, 0.07), (0.0, 0.06)], M['pot'], (0.85, 0.74, 0.12), seg=20)
Mesh('vid_succ', M['succ']).sphere((0.85, 0.83, 0.12), 0.045, seg=10, rings=6, sy=0.7).finish(smooth=True)
Mesh('vid_papers', L.flat('vid_paper', '#f3f0e8', rough=0.8)).box(0.2, 0.5, 0.74, 0.752, 0.3, 0.52).finish()
hp = Mesh('vid_headphone', M['head']); hp.cyl((-0.35, 0.76, 0.45), (-0.22, 0.76, 0.45), 0.045, seg=16); hp.finish(smooth=True)
# 右邊窗簾（拉著，縫隙是夜色）
cu = Mesh('vid_curtain', M['curtain'])
for k in range(7): x = 1.45 + 0.0; z = 0.15 + k * 0.24; cu.box(1.52 - 0.04 * (k % 2), 1.6, 0.6, 2.5, z, z + 0.24)
cu.finish()
Mesh('vid_window_gap', M['night']).box(1.59, 1.6, 0.9, 2.3, 0.05, 0.12).finish()
# 房間的環境光（很暗，晚上）：天花板的燈關著，只有一點從房門外來的冷光
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.022, 0.03, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
fill = bpy.data.lights.new('room_fill', 'AREA'); fill.energy = 10; fill.color = (0.8, 0.85, 1.0); fill.size = 1.5
fo = bpy.data.objects.new('room_fill', fill); fo.location = g2b(0.2, 1.6, 2.4); fo.rotation_euler = (math.radians(90), 0, 0); sc.collection.objects.link(fo)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(opt('--lens', '22')); cam.data.sensor_width = 36; eye = (0.05, 0.98, 1.95); look = (0.05, 1.12, 0.0)
cam.location = g2b(*eye); cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('rendered', OUT, RW, RH, SAMPLES)
