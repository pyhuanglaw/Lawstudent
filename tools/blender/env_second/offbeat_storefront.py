"""日常失速的店面立體店內（SHOP-WINDOW-2D-1105 試做，LAWWW2-B 2026-11-07；使用者 11-05 06:5x「店外看店裡很 2D」、08:2x「只拿日常失速試做，不比現在的櫥窗漂亮就照舊」）。
原本：溫州街外觀（wz_street.py W2、wz_shopkit.xs_front）的落地窗後面 0.8 m 是一張景深卡（AA 室內從街上渲染的圖 offbeat_int／offbeat_side）＋淺淺的地板、側牆。
  從街上走過，窗裡的桌椅、吧檯不會跟著角度變，看起來是貼在玻璃上的一張圖。
這支：把 AA 的室內正式模型（aa_support/daily_offbeat.glb，11×10×3.4 m）做成「從街上看的店內」——
  1. 拿掉臨街的兩面牆（WALL_front、WALL_right：窗、玻璃、窗景卡；外觀那邊有自己的窗框和玻璃）、玻璃、窗景卡；
  2. 在 GLOW_* 的位置放燈（吊燈、軌道燈、吧檯 LED、桌燈：暖光），天空一點點（窗外的天光）；
  3. 整間合成一個網格，Cycles 把燈光、陰影、反射光烘成一張貼圖（COMBINED），換成一個只有自發光的材質：遊戲裡不吃街上的光，白天晚上都是「店裡開著燈」的樣子；
  4. 減面（Decimate，平面不動），匯出 assets/models/env/second_ai/offbeat_storefront.glb（座標＝室內座標；wz_street.py 照 W2 擺進溫州街）。
用法：/opt/blenv/bin/python tools/blender/env_second/offbeat_storefront.py -- [--src daily_offbeat.glb] [--samples 96] [--res 2048] [--ratio 0.5] [--out 路徑]"""
import math, os, sys
import bpy, bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
SRC = opt('--src', os.path.join(ROOT, 'assets/models/env/second_ai/aa_support/daily_offbeat.glb'))   # --src：室內模型在開發分支（我的分支沒有時：git show <開發>:<路徑> 存出來）
OUT = os.path.join(ROOT, opt('--out', 'assets/models/env/second_ai/offbeat_storefront.glb'))
SAMPLES, RES, RATIO = int(opt('--samples', '96')), int(opt('--res', '2048')), float(opt('--ratio', '0.5'))
LAMP_W = float(opt('--lamp-w', '90')); SKY = float(opt('--sky', '1.0'))   # 第一次 28／0.25：烘出來中位數只有 36／255（店裡偏暗）

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=SRC)
DROP = ('WALL_front', 'WALL_right', 'VIEW', 'dof_glass')
glows = []
for ob in list(bpy.data.objects):
    if ob.name.startswith('GLOW_'):
        glows.append((ob.matrix_world.translation.copy(), ob.get('glow', ''), float(ob.get('size', 0.5)))); continue
    if ob.type == 'MESH' and (any(k in ob.name for k in DROP) or any(s.material and s.material.name == 'dof_glass' for s in ob.material_slots)):
        bpy.data.objects.remove(ob, do_unlink=True)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
LEAF = [o for o in meshes if any(s.material and 'leaf' in s.material.name for s in o.material_slots)]   # 葉子（透明貼圖剪形狀）：不烘、照原本的材質另外留著（烘成一張圖會變方塊）
meshes = [o for o in meshes if o not in LEAF]
print('meshes kept', len(meshes), [o.name for o in meshes][:40], flush=True)

# 燈：GLOW_* 的位置放點光源（暖光，大小照 size）
def rgba(s):
    try:
        v = [float(t) for t in s[s.index('(') + 1:s.index(')')].split(',')][:3]
        return tuple((c / 255.0) ** 2.2 for c in v)
    except Exception: return (1.0, 0.8, 0.6)
for (p, col, sz) in glows:
    ld = bpy.data.lights.new('L', 'POINT'); ld.color = rgba(col) if col else (1.0, 0.8, 0.6); ld.energy = LAMP_W * (0.6 + sz); ld.shadow_soft_size = 0.12
    lo = bpy.data.objects.new('L', ld); lo.location = p + Vector((0, 0, -0.08)); sc.collection.objects.link(lo)
print('lights', len(glows), flush=True)
wd = bpy.data.worlds.new('W'); sc.world = wd; wd.use_nodes = True; bg = wd.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.75, 0.82, 0.95, 1); bg.inputs['Strength'].default_value = SKY

# 合成一個網格（套用變換），烘焙用的 UV（Smart UV Project，島之間留邊）
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.join(); J = bpy.context.view_layer.objects.active; J.name = 'offbeat_storefront'
me = J.data
# 切掉伸出大樓的部分（第一次試拍：室內的左牆外面那一層比大樓側面多 0.2 m，從巷子斜看是一條淺綠色的直條）：
#   正面玻璃在外觀本地 z −0.3＝室內 z 4.7；北面玻璃在本地 x 5.2；大樓南側面在 x −5.5。Blender：x＝x、y＝−z
CUT = [((0, -4.72, 0), (0, 1, 0)), ((5.22, 0, 0), (-1, 0, 0)), ((-5.5, 0, 0), (1, 0, 0))]   # (平面上一點, 留下來那一邊的法線)
bm_ = bmesh.new(); bm_.from_mesh(me)
for co, no in CUT:
    g_ = bm_.verts[:] + bm_.edges[:] + bm_.faces[:]
    bmesh.ops.bisect_plane(bm_, geom=g_, plane_co=co, plane_no=[-v for v in no], clear_outer=True, clear_inner=False)
bm_.to_mesh(me); bm_.free(); me.update()
print('cut', len(me.polygons), 'faces', flush=True)
for o in LEAF:   # 葉子也切（窗邊的吊盆有一點伸出玻璃）
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.make_single_user(object=True, obdata=True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    b2 = bmesh.new(); b2.from_mesh(o.data)
    for co, no in CUT: bmesh.ops.bisect_plane(b2, geom=b2.verts[:] + b2.edges[:] + b2.faces[:], plane_co=co, plane_no=[-v for v in no], clear_outer=True, clear_inner=False)
    b2.to_mesh(o.data); b2.free(); o.data.update()
bpy.ops.object.select_all(action='DESELECT'); J.select_set(True); bpy.context.view_layer.objects.active = J
bk = me.uv_layers.new(name='bake'); me.uv_layers.active = bk
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.002, area_weight=0.0)
bpy.ops.uv.pack_islands(rotate=True, margin=0.002)   # 第一次只用到 19.5% 的貼圖面積：重新排緊
bpy.ops.object.mode_set(mode='OBJECT')
hdr = bpy.data.images.new('offbeat_storefront_hdr', RES, RES, alpha=False, float_buffer=True)   # 先烘成浮點（線性），再壓成 8 位元（下面）
img = hdr
for m in me.materials:
    if not m or not m.use_nodes: continue
    n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = img; n.name = 'BAKE'; m.node_tree.nodes.active = n
    uvn = m.node_tree.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'bake'; m.node_tree.links.new(uvn.outputs['UV'], n.inputs['Vector'])
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.device = 'CPU'
sc.render.bake.use_pass_direct = True; sc.render.bake.use_pass_indirect = True; sc.render.bake.margin = 6
print('bake start', len(me.polygons), 'faces', flush=True)
bpy.ops.object.bake(type='COMBINED', uv_layer='bake')
print('bake done', flush=True)
# 色調：亮度中位數拉到 TARGET（線性）、亮處用 Reinhard（白點 WHITE）壓，不過曝；保持色相（用亮度的比例縮放三個通道）。轉 sRGB 存進 8 位元的圖
# 第一次直接烘 8 位元：燈開到 160 W 中位數才 81／255，燈旁邊的天花板已經 17% 過曝（吊燈離天花板近、點光源）
import numpy as np
TARGET, WHITE = float(opt('--target', '0.18')), float(opt('--white', '10.0'))   # 試過 0.2／3.0：中位數 128 但 26% 過曝（暖光的紅色通道）
px = np.array(hdr.pixels[:], dtype=np.float32).reshape(-1, 4); lum = 0.2126 * px[:, 0] + 0.7152 * px[:, 1] + 0.0722 * px[:, 2]; m = lum > 1e-5
E = TARGET / float(np.median(lum[m])); L0 = lum * E; L1 = L0 * (1 + L0 / (WHITE * WHITE)) / (1 + L0)
k = np.where(lum > 1e-8, L1 / np.maximum(lum, 1e-8), 0.0); rgb = np.clip(px[:, :3] * k[:, None], 0, 1)
srgb = np.where(rgb <= 0.0031308, rgb * 12.92, 1.055 * np.power(rgb, 1 / 2.4) - 0.055)
img = bpy.data.images.new('offbeat_storefront_bake', RES, RES, alpha=False); img.colorspace_settings.name = 'sRGB'
out = np.ones((RES * RES, 4), dtype=np.float32); out[:, :3] = srgb; img.pixels[:] = out.ravel()
print('tone: median lum %.4f  exposure %.2f  white %.1f' % (float(np.median(lum[m])), E, WHITE), flush=True)

# 換成一個自發光材質（底色黑、自發光＝烘好的圖），只留烘焙的 UV
mt = bpy.data.materials.new('offbeat_storefront'); mt.use_nodes = True; nt = mt.node_tree; bs = nt.nodes['Principled BSDF']
bs.inputs['Base Color'].default_value = (0, 0, 0, 1); bs.inputs['Roughness'].default_value = 1.0
tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img; nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
mt.use_backface_culling = False
me.materials.clear(); me.materials.append(mt)
for uv in [u for u in me.uv_layers if u.name != 'bake']: me.uv_layers.remove(uv)
me.uv_layers['bake'].name = 'UVMap'
for ca in list(me.color_attributes): me.color_attributes.remove(ca)
# 減面（平面不動：Decimate planar 先、再 collapse 到 RATIO）
f0 = len(me.polygons)
d1 = J.modifiers.new('dp', 'DECIMATE'); d1.decimate_type = 'DISSOLVE'; d1.angle_limit = math.radians(1.0); d1.delimit = {'UV'}
bpy.ops.object.modifier_apply(modifier='dp')
if RATIO < 1.0:
    d2 = J.modifiers.new('dc', 'DECIMATE'); d2.ratio = RATIO; d2.use_collapse_triangulate = True; d2.delimit = {'UV'}
    bpy.ops.object.modifier_apply(modifier='dc')
print('faces', f0, '->', len(J.data.polygons), flush=True)
J['storefront'] = {'src': 'aa_support/daily_offbeat.glb', 'coords': 'interior', 'drop': list(DROP)}
for o in LEAF: o.name = 'offbeat_storefront_leaf'
for o in list(bpy.data.objects):
    if o.type != 'MESH': bpy.data.objects.remove(o, do_unlink=True)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='WEBP', export_image_quality=86, export_extras=True, export_apply=True, use_selection=False)
tris = sum(len(p.vertices) - 2 for p in J.data.polygons)
print('OK', OUT, 'tris', tris, 'bytes', os.path.getsize(OUT), flush=True)
