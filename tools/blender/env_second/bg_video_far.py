"""2D 背景：「遠方」視訊——祐廷在國外的房間（ART-BG-AA185 第 3 張；AA_185 1-2、第 8 節）。LAWWW2-C 2026-10-17。
劇情：台灣 2028-03-16（四）19:30 麵店長桌，大家打視訊給在國外交換的祐廷；麵店那一邊的手機螢幕上是他的房間（祐廷的立繪疊在中間）。
  jp：日本那邊 20:30（晚上）。交換學校的國際學生宿舍、單人房（AA_145 3-6：「小小的單人房、書桌、窗外是大學城的屋頂；冬天」——三月中還冷）。
  us：美國那邊 07:30（三月中，天剛亮、外面還有雪）。房間直接用 LAWWW2-B 的 us_apartment.glb（客廳；他坐在吧台吃麥片，筆電在吧台上）。
鏡頭＝他桌上筆電的鏡頭（高 1.1 m、看著坐在書桌前的人）：人物站的位置（畫面中間）留空、背景比人物暗一點，立繪疊上去才看得清楚。
日本宿舍單人房的辨識點：白色的牆、木地板、天花板的圓形吸頂燈（冷白）、牆上的冷氣（白色、日本的樣子）、鋁窗＋米色窗簾半拉、
窗外夜裡的大學城（兩層的木造／瓦屋頂房子、亮著的窗、電線桿和電線、遠處公寓的燈）、書架（語言課的課本：書背只有色塊）、
軟木板上的課表（格子、色塊，沒有字）、掛著的大衣、床的一角（被子）。沒有任何真實的品牌或文字。
做法照 bg_video.py（LAWWW2-B）：場景直接用 bpy 蓋。座標＝遊戲座標（x 東、y 上、z 南）；後牆在 z＝0、鏡頭在 +z 往 −z 看。
  /opt/blenv/bin/python tools/blender/env_second/bg_video_far.py -- jp|us <輸出.png> [--res 1920x1080] [--samples 64]
  之後：python3 tools/blender/env_second/bg_paint.py <輸出.png> assets/bg/video_far_jp.webp"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

A = sys.argv[sys.argv.index('--') + 1:]
VAR, OUT = A[0], A[1]
def opt(name, default): return A[A.index(name) + 1] if name in A else default
RW, RH = map(int, opt('--res', '1920x1080').split('x')); SAMPLES = int(opt('--samples', '64'))
rng = random.Random(316)
B.reset(texres=1024)
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = float(opt('--exposure', '0.2'))
try: sc.view_settings.look = 'AgX - Punchy'
except Exception: pass

def shoot(eye, look, lens):
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = lens; cam.data.sensor_width = 36; cam.location = g2b(*eye)
    cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler(); cam.data.clip_end = 200
    sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    print('rendered', OUT, VAR, RW, RH, SAMPLES)



def lathe_obj(name, profile, mat, at, seg=32):
    bm = L.lathe(profile, seg); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob); ob.location = g2b(*at); me.polygons.foreach_set('use_smooth', [True] * len(me.polygons)); return ob


def point_light(name, x, y, z, power, col, r=0.05):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = power; l.color = col; l.shadow_soft_size = r
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); sc.collection.objects.link(ob); return ob


def area_light(name, x, y, z, w, d, power, col, rot=(math.radians(90), 0, 0)):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = power; l.color = col; l.shape = 'RECTANGLE'; l.size = w; l.size_y = d
    ob = bpy.data.objects.new(name, l); ob.location = g2b(x, y, z); ob.rotation_euler = rot; sc.collection.objects.link(ob); return ob


def emit(name, hexcol, k):
    m = L.flat(name, hexcol, rough=1.0, emit=B.srgb(hexcol)); m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = k; return m


# ================= us：美國那邊 07:30（三月中，天剛亮、外面還有雪）。房間＝LAWWW2-B 的 us_apartment.glb（照使用者的三張照片蓋的客廳）=================
# 他端著一碗麥片坐在吧台的高腳椅上，筆電放在吧台上：鏡頭往北看客廳——黑色皮沙發、橘紅地毯、窗（百葉＋黑白圓圈窗簾）、陽台玻璃門、吊扇。
# 窗外：GLB 的雪景（SEASON_SNOW_on）調暗、偏藍（天剛亮）；屋裡開著吊扇的燈和桌燈（暖色），和窗外的冷色對比。
if VAR == 'us':
    bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets/models/env/second_ai/us_apartment.glb'))
    for nm in ('SEASON_SNOW_off', 'usa_view_off'):
        ob = bpy.data.objects.get(nm)
        if ob is None: continue
        for c in [o.name for o in ob.children_recursive]:
            if c in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[c], do_unlink=True)
        bpy.data.objects.remove(ob, do_unlink=True)
    for m in bpy.data.materials:
        bs = m.node_tree.nodes.get('Principled BSDF') if m.node_tree else None
        if bs is None: continue
        if m.name.startswith('usa_view'): bs.inputs['Emission Strength'].default_value = float(opt('--view', '1.0'))
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (*B.srgb('#9fb4d4')[:3], 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = float(opt('--sky', '0.8'))
    for k, (dx, dz) in enumerate(((0.28, 0), (-0.28, 0), (0, 0.28), (0, -0.28))):              # 吊扇的四個燈罩（(-1.6, -1.0)、天花板 2.6）
        point_light('us_fan_%d' % k, -1.6 + dx, 2.25, -1.0 + dz, float(opt('--fan', '14')), (1.0, 0.8, 0.58), 0.06)
    point_light('us_lamp', -4.25, 1.05, -2.55, float(opt('--lamp', '28')), (1.0, 0.76, 0.5), 0.08)   # 沙發旁的桌燈
    point_light('us_kitchen', -3.1, 2.3, 2.0, float(opt('--kitchen', '30')), (1.0, 0.86, 0.7), 0.1)    # 背後廚房的燈（照到吧台和高腳椅）
    # 天剛亮的冷光從北窗、陽台玻璃門進來（第一版只有暖色燈，看起來像晚上）
    area_light('us_dawn_win', -3.2, 1.45, -2.85, 1.2, 1.2, float(opt('--dawn', '60')), (0.62, 0.74, 1.0), rot=(math.radians(-90), 0, 0))
    area_light('us_dawn_door', -1.0, 1.0, -2.85, 0.8, 2.0, float(opt('--dawn', '60')) * 0.6, (0.62, 0.74, 1.0), rot=(math.radians(-90), 0, 0))
    sc.view_settings.exposure = float(opt('--exposure', '0.0'))
    shoot(tuple(map(float, opt('--eye', '-3.0,1.32,0.72').split(','))), tuple(map(float, opt('--look', '-2.3,1.32,-3.0').split(','))), float(opt('--lens', '20')))
    raise SystemExit

M = {'wall': L.flat('vf_wall', '#e4e1da', rough=0.9), 'floor': L.pbr('vf_floor', 'laminate_floor_02', tile=1.0, target='#b08a62', maps=('diff', 'nor'), rough_value=0.5),
     'ceil': L.flat('vf_ceil', '#eeece6', rough=0.9), 'alu': L.flat('vf_alu', '#b9bcbf', rough=0.35, metal=0.4), 'glass': L.flat('vf_glass', '#eef2f4', rough=0.02, metal=0.0),
     'curtain': L.flat('vf_curtain', '#cfc2a4', rough=0.95), 'ac': L.flat('vf_ac', '#f2f2ef', rough=0.4), 'ac_dk': L.flat('vf_ac_dk', '#9a9c9e', rough=0.5),
     'shelf': L.pbr('vf_shelf', 'fine_grained_wood', tile=0.6, target='#c9a77e', maps=('diff',), rough_value=0.5) if os.path.isdir(L.tex_dir('fine_grained_wood')) else L.flat('vf_shelf', '#c9a77e', rough=0.5),
     'desk': L.flat('vf_desk', '#d8c3a0', rough=0.4), 'cork': L.pbr('vf_cork', 'dirty_carpet', tile=0.25, target='#a7835a', maps=('diff',), rough_value=0.9),
     'coat': L.flat('vf_coat', '#3c4552', rough=0.9), 'hanger': L.flat('vf_hanger', '#7a5a3a', rough=0.5), 'duvet': L.flat('vf_duvet', '#8ea2b8', rough=0.95),
     'sheet': L.flat('vf_sheet', '#eceae4', rough=0.95), 'bedframe': L.flat('vf_bed', '#b8976e', rough=0.6), 'kettle': L.flat('vf_kettle', '#e8e6e0', rough=0.3),
     'lamp': L.flat('vf_lamp', '#f4f3ef', rough=0.3), 'lamp_in': emit('vf_lamp_in', '#fff6e6', 4.0), 'ceil_lamp': emit('vf_ceil_lamp', '#f4f8ff', 6.0),
     # 窗外：夜空、房子剪影、亮著的窗、電線桿
     'sky_n': emit('vf_sky', '#1c2a4a', 1.0), 'house': L.flat('vf_house', '#141a26', rough=1.0), 'roof': L.flat('vf_roof', '#0f131c', rough=1.0),
     'win_lit': emit('vf_win', '#ffcf8a', 5.0), 'win_cool': emit('vf_win2', '#d9e6ff', 3.0), 'pole': L.flat('vf_pole', '#0b0d12', rough=1.0)}
if VAR != 'jp': raise SystemExit('只有 jp（us 之後做）')

# ---------------- 房間：後牆 z＝0（x −2.2～1.4）、右邊的牆 x＝1.4、地板、天花板 2.4 ----------------
WX0, WX1 = -1.25, 0.15                            # 窗（後牆、偏左）
Mesh('vf_wall_lo', M['wall']).box(-2.2, 1.4, 0, 0.85, -0.1, 0.0).finish()
Mesh('vf_wall_hi', M['wall']).box(-2.2, 1.4, 2.05, 2.4, -0.1, 0.0).finish()
Mesh('vf_wall_l', M['wall']).box(-2.2, WX0, 0.85, 2.05, -0.1, 0.0).finish()
Mesh('vf_wall_r', M['wall']).box(WX1, 1.4, 0.85, 2.05, -0.1, 0.0).finish()
Mesh('vf_wall_side', M['wall']).box(1.4, 1.5, 0.0, 2.4, -0.1, 2.6).finish()
Mesh('vf_wall_left', M['wall']).box(-2.3, -2.2, 0.0, 2.4, -0.1, 2.6).finish()               # 左邊的牆（第一版沒有，畫面左邊露出夜空的底色）
Mesh('vf_floor', M['floor']).box(-2.2, 1.5, -0.02, 0.0, -0.1, 2.6).finish()
Mesh('vf_ceil', M['ceil']).box(-2.2, 1.5, 2.4, 2.45, -0.1, 2.6).finish()
Mesh('vf_skirt', M['shelf']).box(-2.2, 1.4, 0, 0.06, 0.0, 0.012).box(1.388, 1.4, 0, 0.06, 0.0, 2.6).finish()
# 鋁窗：外框、中間的直框、窗台
fr = Mesh('vf_win_frame', M['alu'])
fr.box(WX0 - 0.04, WX1 + 0.04, 0.81, 0.85, -0.1, 0.03); fr.box(WX0 - 0.04, WX1 + 0.04, 2.05, 2.09, -0.1, 0.0)
fr.box(WX0 - 0.04, WX0, 0.85, 2.05, -0.1, 0.0); fr.box(WX1, WX1 + 0.04, 0.85, 2.05, -0.1, 0.0)
xm = (WX0 + WX1) / 2; fr.box(xm - 0.02, xm + 0.02, 0.85, 2.05, -0.07, -0.03)
fr.finish()
Mesh('vf_glass', M['glass']).box(WX0, WX1, 0.85, 2.05, -0.055, -0.05).finish()
for g in bpy.data.objects['vf_glass'].material_slots:
    b_ = g.material.node_tree.nodes['Principled BSDF']
    try: b_.inputs['Transmission Weight'].default_value = 1.0   # 玻璃的底色要接近白：透射會乘上底色（第一版深藍色，窗外整片黑）
    except Exception: pass
    b_.inputs['IOR'].default_value = 1.45
# 窗簾（左右兩片、半拉：左邊拉到窗框外、右邊拉到窗的三分之一）：一條一條的直皺褶
# 窗簾（左右兩片、半拉）：一片連續的布，沿 x 正弦波的皺褶（上面掛鉤處皺褶小、下襬比較開），下襬微微不齊
def curtain_panel(m, x0, x1, y0, y1, folds, seed):
    r_ = random.Random(seed); NX, NY = folds * 8, 10
    ph = [r_.uniform(-0.25, 0.25) for _ in range(folds + 1)]
    def P(i, j):
        u = i / NX; v = j / NY; x = x0 + (x1 - x0) * u
        amp = 0.022 + 0.018 * (1 - v)                                                         # v＝0 是下襬
        f = u * folds; k = int(min(folds - 1, f)); z = 0.06 + amp * math.sin(2 * math.pi * (f + ph[k] * (1 - v)))
        y = y0 + (y1 - y0) * v - (0.012 * math.sin(7.3 * u + seed) if j == 0 else 0)
        return (x, y, z)
    for i in range(NX):
        for j in range(NY):
            m.quad([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)])
cu = Mesh('vf_curtain', M['curtain'])
curtain_panel(cu, WX0 - 0.42, WX0 + 0.08, 0.5, 2.2, 5, 1); curtain_panel(cu, WX1 - 0.3, WX1 + 0.22, 0.5, 2.2, 5, 2)
cu.finish(smooth=True)
Mesh('vf_rail', M['alu']).box(WX0 - 0.5, WX1 + 0.28, 2.2, 2.23, 0.03, 0.08).finish()          # 窗簾軌道
# 冷氣（窗的右上方，白色長方、下面的出風口）
ac = Mesh('vf_ac', M['ac']); ac.rbox(0.25, 1.15, 2.07, 2.33, 0.0, 0.24, r=0.04); ac.finish()
Mesh('vf_ac_vent', M['ac_dk']).box(0.3, 1.1, 2.08, 2.1, 0.12, 0.23).finish()
Mesh('vf_ac_led', emit('vf_ac_led', '#7fd0ff', 3.0)).box(1.02, 1.05, 2.15, 2.16, 0.241, 0.243).finish()
# 書架（右邊靠牆，三層，語言課課本＝色塊）
sh = Mesh('vf_shelf', M['shelf'])
for y in (0.0, 0.42, 0.84, 1.26): sh.box(0.55, 1.35, y, y + 0.025, 0.02, 0.32)
sh.box(0.55, 0.575, 0.0, 1.29, 0.02, 0.32); sh.box(1.325, 1.35, 0.0, 1.29, 0.02, 0.32); sh.box(0.55, 1.35, 0.0, 1.29, 0.0, 0.02)
sh.finish()
cols = ['#c84a3a', '#3d6fa8', '#f0c64a', '#4c8a5a', '#e8e4da', '#7a4a8a', '#2f3a44', '#e8875a', '#9ab8d8']
for y in (0.025, 0.445, 0.865):
    x = 0.59
    while x < 1.3:
        w_ = rng.uniform(0.018, 0.045); h_ = rng.uniform(0.2, 0.3)
        if rng.random() < 0.12: x += 0.05; continue
        Mesh('vf_book', L.flat('vf_book_%d' % rng.randint(0, 99999), rng.choice(cols), rough=0.7)).box(x, min(1.31, x + w_), y, y + h_, 0.04, 0.28).finish(); x += w_ + 0.003
Mesh('vf_kettle', M['kettle']).cyl((0.75, 1.285, 0.17), (0.75, 1.47, 0.17), 0.08, seg=20, r2=0.07).finish(smooth=True)       # 書架上：電熱水壺、杯麵（沒有字）
lathe_obj('vf_cup', [(0.0, 0.0), (0.05, 0.0), (0.06, 0.1), (0.0, 0.1)], L.flat('vf_cupnoodle', '#f2efe6', rough=0.6), (1.05, 1.285, 0.16), seg=20)
# 軟木板＋課表（格子色塊）、月曆（左邊的牆）
Mesh('vf_cork', M['cork']).box(-2.05, -1.45, 1.25, 1.75, 0.0, 0.015).finish()
tt = Mesh('vf_timetable', L.flat('vf_tt', '#f6f4ee', rough=0.8)); tt.box(-1.98, -1.6, 1.33, 1.65, 0.015, 0.018); tt.finish()
for r_ in range(4):
    for c_ in range(5):
        if rng.random() < 0.55:
            Mesh('vf_ttc', L.flat('vf_ttc_%d' % rng.randint(0, 99999), rng.choice(['#9fc4e8', '#f2c4a0', '#b8dcb0', '#e8d48a']), rough=0.8)).box(-1.97 + c_ * 0.073, -1.97 + c_ * 0.073 + 0.065, 1.6 - r_ * 0.065, 1.6 - r_ * 0.065 + 0.055, 0.018, 0.0195).finish()
for k, (x0, y0, col) in enumerate(((-1.55, 1.42, '#f2d77a'), (-1.53, 1.3, '#d9a0a0'))):
    Mesh('vf_note%d' % k, L.flat('vf_note%d' % k, col, rough=0.8)).box(x0, x0 + 0.07, y0, y0 + 0.07, 0.015, 0.017).finish()
# 掛著的大衣（左邊牆上的掛鉤）
# 左邊的牆：月曆（白紙、紅色的月份條、日期格）——第一版的大衣側面看起來像一塊軟墊，拿掉
Mesh('vf_cal', L.flat('vf_cal', '#f6f4ee', rough=0.8)).box(-2.2, -2.195, 1.05, 1.62, 0.45, 0.85).finish()
Mesh('vf_cal_head', L.flat('vf_cal_head', '#b8473c', rough=0.8)).box(-2.195, -2.193, 1.5, 1.6, 0.47, 0.83).finish()
cg = Mesh('vf_cal_grid', L.flat('vf_cal_grid', '#c9c4ba', rough=0.8))
for r_ in range(5):
    for c_ in range(7):
        if r_ * 7 + c_ < 33: cg.box(-2.195, -2.193, 1.42 - r_ * 0.07, 1.42 - r_ * 0.07 + 0.05, 0.48 + c_ * 0.05, 0.48 + c_ * 0.05 + 0.04)
cg.finish()
Mesh('vf_cal_mark', L.flat('vf_cal_mark', '#d23c3c', rough=0.8)).box(-2.193, -2.191, 1.22, 1.27, 0.68, 0.72).finish()   # 圈起來的一天
# 床的一角（左前方、低）：床架、床墊、被子
Mesh('vf_bedframe', M['bedframe']).box(-2.2, -1.1, 0.0, 0.32, 0.1, 2.4).finish()
Mesh('vf_mattress', M['sheet']).rbox(-2.18, -1.12, 0.32, 0.46, 0.12, 2.38, r=0.04).finish()
dv = Mesh('vf_duvet', M['duvet']); dv.rbox(-2.15, -1.05, 0.44, 0.58, 0.5, 2.3, r=0.07); dv.rbox(-1.95, -1.25, 0.56, 0.62, 0.9, 1.8, r=0.05); dv.finish()
Mesh('vf_pillow', M['sheet']).rbox(-2.1, -1.4, 0.46, 0.6, 0.15, 0.5, r=0.06).finish()
# 書桌（鏡頭在桌上，桌緣在畫面下方）：桌面、檯燈
Mesh('vf_desk', M['desk']).box(-1.0, 1.3, 0.71, 0.74, 1.6, 2.4).finish()
LX, LZ = 0.95, 1.75
lathe_obj('vf_lamp_base', [(0.0, 0.0), (0.08, 0.0), (0.08, 0.02), (0.0, 0.03)], M['lamp'], (LX, 0.74, LZ))
arm = Mesh('vf_lamp_arm', M['alu']); arm.cyl((LX, 0.76, LZ), (LX - 0.05, 1.1, LZ - 0.1), 0.008, seg=8); arm.cyl((LX - 0.05, 1.1, LZ - 0.1), (LX - 0.25, 1.16, LZ - 0.05), 0.008, seg=8); arm.finish(smooth=True)
lathe_obj('vf_lamp_shade', [(0.02, 0.0), (0.03, 0.0), (0.08, -0.1), (0.075, -0.105), (0.025, -0.005)], M['lamp'], (LX - 0.25, 1.16, LZ - 0.05), seg=24)
lathe_obj('vf_lamp_bulb', [(0.0, -0.03), (0.03, -0.05), (0.025, -0.085), (0.0, -0.09)], M['lamp_in'], (LX - 0.25, 1.16, LZ - 0.05), seg=16)
point_light('vf_lamp_light', LX - 0.25, 1.07, LZ - 0.05, 22, (1.0, 0.82, 0.6), 0.04)
# 天花板的圓形吸頂燈（冷白，房間的主光）
lathe_obj('vf_ceil_lamp', [(0.0, 0.0), (0.26, 0.0), (0.25, -0.05), (0.18, -0.08), (0.0, -0.085)], M['ceil_lamp'], (-0.4, 2.4, 1.2), seg=40)
area_light('vf_ceil_light', -0.4, 2.3, 1.2, 0.45, 0.45, float(opt('--ceil', '120')), (0.92, 0.95, 1.0), rot=(0, 0, 0))

# ---------------- 窗外：大學城的夜（兩層的房子剪影、瓦屋頂、亮著的窗、電線桿＋電線、遠處公寓的燈） ----------------
def sky_grad(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    tc = nt.nodes.new('ShaderNodeTexCoord'); sp = nt.nodes.new('ShaderNodeSeparateXYZ'); cr = nt.nodes.new('ShaderNodeValToRGB')
    em = nt.nodes.new('ShaderNodeEmission'); out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(tc.outputs['Generated'], sp.inputs[0]); nt.links.new(sp.outputs['Z'], cr.inputs[0]); nt.links.new(cr.outputs[0], em.inputs[0]); nt.links.new(em.outputs[0], out.inputs[0])
    els = cr.color_ramp.elements; els[0].position = 0.2; els[0].color = (*B.srgb('#6a5468')[:3], 1); els[1].position = 0.72; els[1].color = (*B.srgb('#0f1730')[:3], 1)
    e3 = els.new(0.36); e3.color = (*B.srgb('#2e3a5c')[:3], 1)
    em.inputs['Strength'].default_value = float(opt('--sky', '3.0')); return m
Mesh('vf_sky', sky_grad('vf_sky_grad')).box(-40, 40, -10, 40, -60, -59.9).finish(uv=False)
hs = Mesh('vf_houses', M['house']); rf = Mesh('vf_roofs', M['roof']); wl = Mesh('vf_wins', M['win_lit']); wc = Mesh('vf_wins2', M['win_cool'])
for row, (zz, yb) in enumerate(((-9.0, -0.8), (-17.0, 1.6), (-30.0, 3.4), (-46.0, 3.0))):          # 近的那排壓低（原本屋頂擋住後面所有亮著的窗，窗外只剩黑色剪影）          # 宿舍在三樓：近的房子屋頂在窗台下面一點、遠的往上（平視看出去是一片屋頂和亮著的窗）
    x = -18.0
    while x < 14.0:
        w_ = rng.uniform(5.5, 9.0); h_ = (rng.uniform(5.0, 6.5) if (row == 0 or rng.random() < 0.5) else rng.uniform(7.6, 9.4)) if row < 3 else rng.uniform(8.0, 15.0)
        if row == 3 and rng.random() < 0.45: x += w_; continue                                  # 遠處的公寓之間留空（看得到天空）
        hs.box(x, x + w_ - 0.6, yb - 6, yb - 6 + h_, zz - 6, zz)
        if h_ < 8: rf.quad([(x - 0.3, yb - 6 + h_, zz + 0.4), (x + w_ - 0.3, yb - 6 + h_, zz + 0.4), (x + w_ / 2 - 0.3, yb - 6 + h_ + 1.6, zz - 3), (x + w_ / 2 - 0.3, yb - 6 + h_ + 1.6, zz - 3)])
        for k in range(int(w_ / 2.2)):
            for fl in range(int(h_ / 2.9)):
                if rng.random() < (0.72 if row < 3 else 0.5):
                    wx = x + 0.8 + k * 2.2; wy = yb - 6 + 1.2 + fl * 2.9
                    (wl if rng.random() < 0.7 else wc).box(wx, wx + 1.0, wy, wy + 0.9, zz + 0.01, zz + 0.03)
        x += w_
for ob_ in (hs, rf, wl, wc): ob_.finish(uv=False)
pl = Mesh('vf_pole', M['pole']); pl.cyl((-6.0, -9.0, -6.0), (-6.0, 4.5, -6.0), 0.15, seg=10); pl.box(-7.0, -5.0, 3.6, 3.75, -6.1, -5.9)
for k in range(3):                                                                         # 電線（下垂的弧）
    pts = [(-6.0 + t * 16, 3.7 - 0.15 * k - 0.9 * (1 - (2 * t - 1) ** 2), -6.0 - t * 2) for t in np.linspace(0, 1, 16)]
    pts2 = [(-6.0 - t * 14, 3.7 - 0.15 * k - 0.7 * (1 - (2 * t - 1) ** 2), -6.0 + t * 1) for t in np.linspace(0, 1, 16)]
    for P in (pts, pts2):
        for a_, b_ in zip(P[:-1], P[1:]): pl.cyl(a_, b_, 0.012, seg=5)
pl.finish(uv=False)
point_light('vf_street', -4.5, -3.5, -7.0, 600, (1.0, 0.8, 0.55), 0.3)                  # 窗外下面的路燈（照亮一點房子的牆）
moon = bpy.data.objects.new('vf_moon', bpy.data.lights.new('vf_moon', 'SUN')); sc.collection.objects.link(moon)          # 月光：瓦屋頂、牆面有一點形狀（不然只是黑色剪影）
moon.data.energy = float(opt('--moon', '0.35')); moon.data.color = (0.62, 0.72, 1.0); moon.data.angle = math.radians(1.0)
moon.rotation_euler = (math.radians(55), 0, math.radians(20))   # 從鏡頭這一側斜照過去：照到房子的正面和屋頂

w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.025, 0.045, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
# ---------------- 鏡頭：桌上筆電的鏡頭（高 1.05 m）、往後牆看、略往上 ----------------
eye = tuple(map(float, opt('--eye', '0.05,1.05,2.25').split(','))); look = tuple(map(float, opt('--look', '-0.35,1.32,0.0').split(',')))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = float(opt('--lens', '20')); cam.data.sensor_width = 36; cam.location = g2b(*eye)
cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler(); cam.data.clip_end = 200
sc.render.filepath = os.path.abspath(OUT); sc.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
print('rendered', OUT, VAR, RW, RH, SAMPLES)
