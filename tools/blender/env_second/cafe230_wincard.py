"""2:30 AM 外觀的店內窗卡（WZ-FIVE-1104 v2，LAWWW2-C 2026-11-04；BB-C 19:02 第 1 點「晚上從玻璃看進去，一整間暖黃的燈、書架、檯燈」）：
用 AA 的店內模型（aa_support/cafe230.glb，遊戲裡走進去的那一間）在 Cycles 開燈拍，從街上往店裡看，拍兩張：
  front：正面那一排玻璃（窗卡在室內 z = 6 − 0.9＝外觀玻璃後面 0.9 m；x −6.7～6.7、高 0～3.05）
  side ：轉角那一面的兩扇側窗（窗卡在室內 x = 7 − 0.25 − 0.9；z −4.3～3.3、高 0.3～3.1）
鏡頭放在 8 m 外，視野剛好框住那張窗卡（從那裡看過去，窗卡上的畫和真的店內一樣；別的角度有一點視差）。
拍的時候把那一面牆（WALL_front_*／WALL_right_*）藏起來：外觀自己的牆、窗框會遮住窗卡，只露出窗洞。窗外的景卡（VIEW）也藏起來（晚上窗外是暗的）。
燈：照 lightbake/bake_cafe230.sh 的位置（吧台吊燈、壁燈、檯燈、立燈、軌道燈）。
輸出：貼圖集 1024×512（上面 front、左下 side；先拼 2048×1024 留在 --keep 資料夾）＋同名 .json（範圍，cafe_exterior.py 讀的格式），外觀 cafe_exterior.py 的窗卡用。

用法：/opt/blenv/bin/python tools/blender/env_second/cafe230_wincard.py -- <cafe230.glb> <輸出 png> [--samples 96] [--exposure EV] [--keep 暫存資料夾] [--compose-only]
  現在的檔案：--samples 64 --exposure 0.25，輸出 tools/blender/env_second/textures/gen/cafe230_wincard.png；拍完重跑 cafe_exterior.py。
  --compose-only：不拍，用 --keep 資料夾裡的 front.png、side.png 重組貼圖集
"""
import math, os, sys, json
import bpy
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
GLB, OUT = A[0], A[1]
SAMPLES = int(A[A.index('--samples') + 1]) if '--samples' in A else 96
EXPO = float(A[A.index('--exposure') + 1]) if '--exposure' in A else 0.0
KEEP = A[A.index('--keep') + 1] if '--keep' in A else os.path.join(os.path.dirname(os.path.abspath(OUT)), '_wincard_tmp')
os.makedirs(KEEP, exist_ok=True)
g2b = lambda x, y, z: Vector((x, -z, y))

# 窗卡（室內座標，遊戲的 y 上）：名稱、平面、範圍、鏡頭
CARDS = {
    'front': {'axis': 'z', 'at': 6.0 - 0.9, 'u': (-6.7, 6.7), 'v': (0.0, 3.05), 'cam': 8.0, 'px': (2048, 466), 'hide': 'WALL_front'},
    'side': {'axis': 'x', 'at': 7.0 - 0.25 - 0.9, 'u': (-4.3, 3.3), 'v': (0.3, 3.1), 'cam': 8.0, 'px': (1024, 372), 'hide': 'WALL_right'},
}
WARM = (1.0, 0.80, 0.58)
PEND = [(-5.4, 2.02, -3.95), (-4.24, 2.1, -3.95), (-3.08, 2.02, -3.95), (-1.92, 2.1, -3.95), (-0.76, 2.02, -3.95), (0.4, 2.1, -3.95), (-5.6, 2.13, 0)]
SCON = [(-6.86, 2.15, -4.4), (-6.86, 2.15, 4.2)]
TABL = [(1.95, 1.44, 5.4), (5.6, 1.44, 5.4), (-5.6, 1.44, 5.4), (-1.95, 1.44, 5.4), (4.55, 1.11, -5.6), (4.68, 0.91, -2.6), (4.68, 0.91, 1.4), (0.18, 0.91, 1.4),
        (-3.82, 0.91, 2.4), (6.5, 0.92, 3), (6.5, 0.72, -3.85), (6.82, 1.14, -3.15), (6.82, 1.14, 0.85)]
FLOOR = [(-6.5, 1.45, 4.75)]
SPOTS = [(-5.9, 3), (-1.97, 3), (1.97, 3), (5.9, 3), (-5.9, -0.6), (-1.97, -0.6), (1.97, -0.6), (5.9, -0.6)]


def scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
    try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.cycles.max_bounces = 5; sc.cycles.transparent_max_bounces = 64
    try: sc.view_settings.view_transform = 'Khronos PBR Neutral'          # 燈罩、燈泡的高光壓下來（Standard 會整片白掉），顏色照舊
    except Exception: sc.view_settings.view_transform = 'Standard'
    sc.view_settings.exposure = EXPO
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.07, 0.12, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.4   # 晚上的天光（很暗）
    def pt(p, watt, size):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = watt; lt.data.color = WARM; lt.data.shadow_soft_size = size
        lt.location = g2b(*p); sc.collection.objects.link(lt)
    for p in PEND: pt(p, 30, 0.04)
    for p in SCON: pt(p, 10, 0.05)
    for p in TABL: pt(p, 6, 0.05)
    for p in FLOOR: pt(p, 20, 0.08)
    for x, z in SPOTS:
        lt = bpy.data.objects.new('spot', bpy.data.lights.new('spot', 'SPOT')); lt.data.energy = 20; lt.data.color = WARM; lt.data.spot_size = math.radians(55); lt.data.shadow_soft_size = 0.06
        lt.location = g2b(x, 2.62, z); lt.rotation_euler = (0, 0, 0); sc.collection.objects.link(lt)   # 預設往下（Blender −Z）
    for mt in bpy.data.materials:                                       # 燈泡：亮一點（GLB 的自發光在 Cycles 裡太弱）
        if mt.use_nodes and 'bulb' in mt.name and 'Principled BSDF' in mt.node_tree.nodes:
            b = mt.node_tree.nodes['Principled BSDF']; b.inputs['Emission Color'].default_value = (1.0, 0.82, 0.6, 1); b.inputs['Emission Strength'].default_value = 12.0
    return sc


def shoot(sc, key):
    c = CARDS[key]
    for ob in bpy.data.objects:
        if ob.type != 'MESH': continue
        ob.hide_render = (c['hide'] in ob.name) or ('VIEW' in ob.name) or ('window_view' in ob.name)
    u0, u1 = c['u']; v0, v1 = c['v']; uc, vc = (u0 + u1) / 2, (v0 + v1) / 2; W_ = u1 - u0
    cam = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if cam.name not in sc.collection.objects: sc.collection.objects.link(cam)
    sc.camera = cam; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36.0
    if c['axis'] == 'z':                                                # 正面：鏡頭在 +z 外面，看 −z；畫面的右邊＝+x
        eye = (uc, vc, c['at'] + c['cam']); look = (uc, vc, c['at'])
    else:                                                               # 側面：鏡頭在 +x 外面，看 −x；畫面的右邊＝−z（從外面看，右手邊是店的後面）
        eye = (c['at'] + c['cam'], vc, uc); look = (c['at'], vc, uc)
    cam.data.lens = 36.0 * c['cam'] / W_
    cam.location = g2b(*eye); cam.rotation_euler = (g2b(*look) - g2b(*eye)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x, sc.render.resolution_y = c['px']; sc.render.film_transparent = False
    p = os.path.join(KEEP, key + '.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); print('render', p, flush=True)
    return p


if '--compose-only' in A:                                               # 不拍，用 --keep 資料夾裡已經拍好的 front.png、side.png 重組貼圖集
    shots = {k: os.path.join(KEEP, k + '.png') for k in CARDS}
else:
    sc = scene()
    shots = {k: shoot(sc, k) for k in CARDS}
# 貼圖集：先拼 2048×1024（上面 front、左下 side，留在 --keep 資料夾），再縮成 1024×512 給外觀用（cafe_exterior.py 的 uvrect 照 1024×512 算）
from PIL import Image
at = Image.new('RGB', (2048, 1024), (20, 16, 12))
f = Image.open(shots['front']).convert('RGB'); at.paste(f, (0, 0))
s = Image.open(shots['side']).convert('RGB'); at.paste(s, (0, 512))
at.save(os.path.join(KEEP, 'atlas_2048.png'))
at.resize((1024, 512), Image.LANCZOS).save(OUT)
# 範圍寫成 cafe_exterior.py 讀的格式（外觀座標：z' = 室內 z − 6；像素是 1024×512 的）
IZ = -6.0
F, Sd = CARDS['front'], CARDS['side']
fp, sp_ = (0, 0, F['px'][0] // 2, F['px'][1] // 2), (0, 256, Sd['px'][0] // 2, 256 + Sd['px'][1] // 2)
info = {
    'note': '2:30 AM 外觀的店內窗卡：tools/blender/env_second/cafe230_wincard.py 用 AA 的 aa_support/cafe230.glb 開燈拍（Cycles %d 取樣、Khronos PBR Neutral、曝光 %+.2f），縮成 1024×512' % (SAMPLES, EXPO),
    'front': {'plane': "z'=%g" % (F['at'] + IZ), 'x': list(F['u']), 'y': list(F['v']), 'px': list(fp),
              'cam': "(%g, %g, z' %g)" % ((F['u'][0] + F['u'][1]) / 2, (F['v'][0] + F['v'][1]) / 2, F['at'] + F['cam'] + IZ)},
    'side': {'plane': 'x=%g' % Sd['at'], 'z': [round(Sd['u'][0] + IZ, 4), round(Sd['u'][1] + IZ, 4)], 'y': list(Sd['v']), 'px': list(sp_),
             'cam': "(x %g, %g, z' %g)" % (Sd['at'] + Sd['cam'], (Sd['v'][0] + Sd['v'][1]) / 2, (Sd['u'][0] + Sd['u'][1]) / 2 + IZ)},
}
json.dump(info, open(OUT[:-4] + '.json', 'w'), ensure_ascii=False, indent=1)
print('atlas', OUT)
