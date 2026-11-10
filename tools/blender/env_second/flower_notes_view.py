"""花序 Flower Notes 室內的預覽圖（EEVEE；不是遊戲截圖，D131）：一樓入口往內（對 flower_notes_ref/interior_1f.png）、二樓教室（對 interior_2f.png）、樓梯口、櫃檯。
雲端容器沒有顯示卡，一張要 4 分鐘以上：排到使用者的電腦跑（ROLE_LAWWW2 1.0；cc_local 佇列 kind blender）。
  blender -b -P tools/blender/env_second/flower_notes_view.py -- --out <資料夾> [--glb <glb>] [--views f1,f2,...] [--res 1600x900]"""
import bpy, sys, os
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
opt = {A[i]: A[i + 1] for i in range(0, len(A) - 1) if A[i].startswith('--')}
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
OUT = opt.get('--out', os.path.join(ROOT, 'shots')); GLB = opt.get('--glb', os.path.join(ROOT, 'assets/models/env/second_ai/flower_notes_interior.glb'))
RES = tuple(int(v) for v in opt.get('--res', '1600x900').split('x'))
VIEWS = {   # 名字：(眼睛, 看哪裡, 焦距)；座標＝遊戲座標（x 往東、y 往上、z 往南）
    'f1_entrance': ((0.0, 1.7, 6.6), (-0.2, 1.9, -2.0), 18),      # 一樓入口往內（參考圖 interior_1f 的構圖）
    'f1_counter': ((-2.0, 1.6, 1.0), (4.6, 1.5, 4.6), 20),        # 包裝收銀櫃檯、樓梯口
    'f1_left': ((2.4, 1.6, 1.2), (-4.6, 1.3, 4.0), 18),           # 左牆：永生花、鮮花花束
    'f2_class': ((3.0, 5.5, -6.0), (-2.5, 4.6, -1.5), 18),        # 二樓教室（從樓梯平台看）
    'f2_demo': ((-3.5, 5.5, 0.0), (0.5, 5.0, -6.5), 18),          # 二樓：示範桌、後牆的字和黑板（參考圖 interior_2f 的構圖）
    'stair': ((1.0, 1.6, 3.0), (4.2, 2.6, -3.0), 20),             # 樓梯
}
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=GLB)
SC = bpy.context.scene; SC.render.engine = 'BLENDER_EEVEE'; SC.render.resolution_x, SC.render.resolution_y = RES; SC.eevee.taa_render_samples = int(opt.get('--samples', 32))
w = bpy.data.worlds.new('w'); SC.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.95, 0.92, 0.86, 1); bg.inputs[1].default_value = 0.55
g2b = lambda x, y, z: Vector((x, -z, y))
for (x, y, z, e) in ((-0.4, 5.6, 3.4, 600), (0, 3.2, -3, 350), (-1, 7.0, -3, 400), (0, 3.0, 5.5, 280)):   # 預覽自己的燈（遊戲裡是一盞點光＋環境光；亮度不能拿來比）
    l = bpy.data.lights.new('l', 'POINT'); l.energy = e; l.shadow_soft_size = 1.0; o = bpy.data.objects.new('l', l); SC.collection.objects.link(o); o.location = g2b(x, y, z)
for m in bpy.data.materials:   # 玻璃：GLB 匯入後在 EEVEE 是不透明的
    if 'glass' in m.name and m.use_nodes:
        b = m.node_tree.nodes.get('Principled BSDF'); b.inputs['Alpha'].default_value = 0.1
        if hasattr(m, 'surface_render_method'): m.surface_render_method = 'BLENDED'
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); SC.collection.objects.link(cam); SC.camera = cam
for n in opt.get('--views', ','.join(VIEWS)).split(','):
    eye, look, lens = VIEWS[n]; cam.data.lens = lens; cam.location = g2b(*eye); d = g2b(*look) - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    SC.render.filepath = os.path.join(OUT, 'fn_' + n + '.png'); bpy.ops.render.render(write_still=True); print('render', SC.render.filepath)
