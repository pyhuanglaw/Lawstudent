"""118 巷店家室內：店門外騎樓兩側的鄰居店面卡（10-22 LAWWW2）→ textures/gen/l118_nb_<店>_<W|E>.jpg（lane118_shops.py 的 neighbors() 貼在店面那一條線上）。
起因：進門時鏡頭在騎樓（店面外 2 m 多），門靠側牆的店（蛋包飯研究所、好家自助餐、巷口家常菜、慢讀咖啡）畫面一側三分之一是店外的空白（天空的下半）。
做法：載入 118 巷街景（lane118_street.glb＋lane118_props.glb＋lane118_ground.glb，遊戲座標和 src/data/lane118_layout.js 一樣），
  每間店左右各拍一張「鄰居店面的正面」，寬 NB_W＝4.6 m、高 NB_H＝4.2 m（lane118_shops.py 的常數）、552×504：
  鏡頭站在遊戲裡進門時跟隨鏡頭的位置（店面外 VD＝2.4 m、高 3.2 m、離那一側的側牆 1 m），正對店面（畫面和店面平行），用鏡頭平移（shift）框住卡的範圍：
  店面那一層和正投影一樣、沒有歪斜；隔壁是小巷的（蛋包飯南邊、家常菜南邊、茶飲北邊），從那個位置看得到巷子往裡的深度（正投影只會拍到巷底的天空＝一片白）。
  只拍店面線前面 0.45 m 以內的東西（停在人行道上的機車、店自己的直立招牌不進來）；什麼都沒拍到的地方（巷底）是暗的藍灰，不是天空的白。
  光：只有天光、沒有太陽（騎樓下的陰影；遊戲讓這張圖自己發光、晚上調暗，和門外那張巷子一樣：l118_shops3d.js 的 viewMats）；招牌的自發光關掉（白天）。
  左右：從騎樓往店裡看，左手邊＝室內的 −x（W 那一張）。店在巷子東側（E）：人面向東，左手邊是北（z 小）→ W＝z0 往北 4.6 m、E＝z1 往南 4.6 m；
  店在西側（W）：人面向西，左手邊是南（z 大）→ W＝z1 往南、E＝z0 往北。圖的左邊＝從騎樓看的左邊。
用法（repo 根目錄）：/opt/blenv/bin/python tools/blender/env_second/lane118_neighbors.py [-- --shop omu,self] [--samples 16] [--threads 2]"""
import json, math, os, sys
import bpy
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GEN = os.path.join(HERE, 'textures', 'gen'); ENV = os.path.join(ROOT, 'assets', 'models', 'env', 'second_ai')
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return A[A.index(n) + 1] if n in A else d
NB_W, NB_H = 4.6, 4.2          # 和 lane118_shops.py 一樣
RW, RH = 552, 504              # 4.6:4.2
VD, CAM_Y, SIDE_IN, FRONT = 2.4, 3.2, 1.0, 0.45   # 鏡頭：店面外 2.4 m、高 3.2 m、離側牆 1 m（進門時的跟隨鏡頭）；只拍店面線前面 0.45 m 以內（0.7 會拍到店自己的直立招牌一角）
EDGE = 0.45                    # 卡靠店的那一邊往外移 0.45 m：不拍到店自己的壁柱、遮雨棚的側面（三角形）
src = open(os.path.join(ROOT, 'src/data/lane118_layout.js'), encoding='utf-8').read()
LAY = json.loads(src[src.index('{', src.index('const LANE118_LAYOUT=')):src.rindex('}') + 1])
g2b = lambda x, y, z: Vector((x, -z, y))

bpy.ops.wm.read_factory_settings(use_empty=True)
for f in ('lane118_ground.glb', 'lane118_street.glb', 'lane118_props.glb'): bpy.ops.import_scene.gltf(filepath=os.path.join(ENV, f))
for mt in bpy.data.materials:   # 白天：招牌、窗的自發光關掉（遊戲裡晚上才亮）
    if mt.use_nodes and 'Principled BSDF' in mt.node_tree.nodes: mt.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0.0
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(arg('--samples', 16)); sc.cycles.max_bounces = 4
sc.cycles.transparent_max_bounces = 64
try: sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
if arg('--threads'): sc.render.threads_mode = 'FIXED'; sc.render.threads = int(arg('--threads'))
sc.render.resolution_x, sc.render.resolution_y = RW, RH; sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = float(arg('--exposure', 0.35))
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 88
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; wn = w.node_tree.nodes; wl = w.node_tree.links
bg = wn['Background']; bg.inputs['Color'].default_value = (0.78, 0.82, 0.88, 1.0); bg.inputs['Strength'].default_value = 1.0   # 陰天、騎樓下：只有天光
bgc = wn.new('ShaderNodeBackground'); bgc.inputs['Color'].default_value = (0.09, 0.1, 0.115, 1.0); bgc.inputs['Strength'].default_value = 1.0   # 鏡頭直接看到的「什麼都沒有」：暗的藍灰（巷底）
lp = wn.new('ShaderNodeLightPath'); mix = wn.new('ShaderNodeMixShader'); wl.new(lp.outputs['Is Camera Ray'], mix.inputs['Fac']); wl.new(bg.outputs['Background'], mix.inputs[1]); wl.new(bgc.outputs['Background'], mix.inputs[2])
wl.new(mix.outputs['Shader'], wn['World Output'].inputs['Surface'])
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'PERSP'; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36.0; cam.data.lens = 36.0 * VD / NB_W   # 店面那一層剛好 NB_W 寬
cam.data.clip_start = VD - FRONT; cam.data.clip_end = 80.0

only = set(arg('--shop', '').split(',')) - {''}
for sh in LAY['shops']:
    if only and sh['id'] not in only: continue
    lj = json.load(open(os.path.join(ENV, f'l118_{sh["id"]}.layout.json'), encoding='utf-8')); X0, X1 = lj['bounds']['x0'], lj['bounds']['x1']
    west = sh['side'] == 'W'; fx = LAY['facade']['west'] if west else LAY['facade']['east']; cz = (sh['z0'] + sh['z1']) / 2
    lane_z = (lambda xl: cz - xl) if west else (lambda xl: cz + xl)   # 室內的 x → 巷子的 z（店在西側：人面向西，左手邊是南）
    sgn = 1.0 if west else -1.0; look = Vector((-sgn, 0.0, 0.0))     # 遊戲座標：從巷子看店面
    for side, xv, xc in (('W', X0 + SIDE_IN, X0 - NB_W / 2 - EDGE), ('E', X1 - SIDE_IN, X1 + NB_W / 2 + EDGE)):
        cam.location = g2b(fx + sgn * VD, CAM_Y, lane_z(xv)); cam.rotation_euler = g2b(*look).to_track_quat('-Z', 'Y').to_euler()
        cam.data.shift_x = (xc - xv) / NB_W; cam.data.shift_y = (NB_H / 2 - CAM_Y) / NB_W   # 畫面的右邊＝室內的 +x（兩側的店都一樣）；卡貼在室內 X0 往外（X1 往外），拍的是再往外 EDGE 的那一段
        out = os.path.join(GEN, f'l118_nb_{sh["id"]}_{side}.jpg'); sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print(json.dumps({'shop': sh['id'], 'side': side, 'eye_z': round(lane_z(xv), 2), 'card_z': [round(lane_z(xc - NB_W / 2), 2), round(lane_z(xc + NB_W / 2), 2)], 'out': os.path.relpath(out, ROOT)}, ensure_ascii=False), flush=True)
