"""講堂、自習區的「坐著的聽眾替身」（低成本，給遊戲用 InstancedMesh 放）→ GLB。
LAWWW 2026-10-13 20:02Z：配色用「預先烤好幾種、每種一個網格」。使用者：101 不先做 400 個完整 3D 人物；LAWWW2 做低成本坐姿人物。
  /opt/blenv/bin/python tools/blender/env_second/seated_figures.py [-- --out 輸出.glb] [--only npc_nf1]

第三版（LAWWW2-C 2026-10-18，ART-SEATFIG-1018，使用者「博雅 101 有人禿頭」）：頭頂、後腦勺烤到衣服的顏色（白、淺藍斑點）→ hair_cleanup()。
第二版（LAWWW2-C 2026-10-17，ART-NPC-HAIR-STREAK：博雅 101 坐著的同學頭髮是黑白碎片）：
  第一版用舊的 VRoid 樣本路人（vroid_npc_f1／f2／m1／m2），直接減面成 1,500 個三角形再展 UV——頭髮的髮片減面後是很多細長的三角形，
  UV 島變成幾千個小點（貼圖集上面四分之三幾乎是黑的），遊戲裡頭髮、衣服都是碎點。
  現在：①來源換成現在的路人（assets/models/char/second_ai/bl_npc_*.vrm，男女各 6 位，髮型、髮色、穿搭都不同；每位就是自己的顏色，不再換色）；
  ②先做「外殼」：整個人加厚（Solidify）→ 體素重建（Voxel Remesh）→ 一個封閉的表面，髮片合成實心的頭髮 → 再減面、展 UV（島是整塊的）；
  ③從原本的模型把顏色烤到外殼上：射線打到最外面那一層（髮片透明的地方換成頭髮的平均色，不會露出底下的皮膚）。

來源：遊戲的路人（**只用路人，不用主角、女主角、有名字的人物**：不能讓重要角色的臉出現在路人群裡）。
做法（每個底模）：
  1. 匯入 VRM（glTF）→ 清掉表情（shape key）→ 拿掉遊戲也不畫的眼睛高光（EyeHighlight、EyeExtra）→ 合成一個網格（HIGH，烤顏色用）。
  2. 外殼（見上）→ 減面成 LOD0（約 2,400 個三角形）＋智慧 UV；再減成 LOD1（約 400 個）；骨架權重從 HIGH 轉過來（最近的面內插）。
  3. 把 HIGH 的顏色烤到 LOD0、LOD1 的 UV（站姿，烤完才擺姿勢）。
  4. 姿勢：聽講、抄筆記、滑手機——骨架在世界座標轉（大腿往前、小腿往下、腳掌貼地、上身前傾、頭）、手臂用兩段 IK 把手腕放到桌上／胸前；
     套到 LOD0、LOD1 → 搬到座位（屁股坐在座墊 y≈0.47、背貼椅背 z≈−0.17）→ 轉成面向 +z。
  5. 所有底模的貼圖排成一張貼圖集（每格 512×512：上面四分之三 LOD0、下面四分之一 LOD1），每個（底模×姿勢×LOD）一個網格、共用一個材質。
座位約定和 furniture_study.glb 的講堂椅一樣：原點在座位的地面中心、+z 朝前（講台）、y=0 是那一排的地面；桌板（lecture_desk）在 z 0.30–0.64、高 0.75。
網格名字 fig_<底模>_<姿勢>_c0（＿lod1）：遊戲端（src/classes3d.js 的 figPlace）照 /^fig_/ 收集、照 _(listen|write|phone)_ 配桌上小物、7 m 外用 _lod1——名字的格式和第一版一樣，遊戲不用改。
"""
import json, math, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix, Quaternion
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/seated_figures.glb'
ONLY = ARGS[ARGS.index('--only') + 1] if '--only' in ARGS else None
TMP = os.path.join(HERE, 'textures', 'gen', 'seated')
REG = 512                       # 每種配色的貼圖格子
LOD0_TRIS, LOD1_TRIS = 2400, 400
SHELL_T, VOXEL = 0.010, 0.010   # 外殼：加厚 1 cm（髮片變成薄板、重疊的合在一起）、體素 1 cm（7 mm 時外殼有 23 萬面，減面器減到 6,000 就停住）
SEAT_Y, BACK_Z = 0.47, -0.17    # 座墊（坐下陷 1 cm）、椅背前緣
EMIT = 0.3                      # 自發光強度（貼圖顏色×0.3）
# 男女各 6 位（docs/art-rebuild/second_ai/char_review/npc_crowd/ 的 jp_sheet_*：髮型 side／air／center／heavy、髮色黑到淺棕、穿搭都不同；不用偏紅的 nf4）。
# 女生只挑穿長褲的：裙子只綁腰臀與大腿，坐下時長裙、中長裙被大腿撐成大三角形、前面裂開（nf9 試過）
BASES = ['npc_nf1', 'npc_nf2', 'npc_nf3', 'npc_nf6', 'npc_nf13', 'npc_nf15', 'npc_nm2', 'npc_nm3', 'npc_nm8', 'npc_nm11', 'npc_nm13', 'npc_nm15']
SRC = 'assets/models/char/second_ai/bl_%s.vrm'
# 姿勢：上身前傾（弧度，正＝往前）、頭（正＝低頭）、兩個手腕的位置（遊戲座標，座位原點；左＝人物的左手＝遊戲 +x）
POSES = {   # slide：屁股往前坐多少（抄筆記時坐到椅子前半）
    'listen': dict(lean=0.06, head=0.0, slide=0.0, wrist_l=(0.12, 0.68, 0.22), wrist_r=(-0.12, 0.68, 0.22)),     # 手放在大腿上，看講台
    'write':  dict(lean=0.45, head=0.42, slide=0.06, wrist_l=(0.17, 0.775, 0.42), wrist_r=(-0.05, 0.775, 0.45)),  # 身體往前、手在桌上
    'phone':  dict(lean=-0.02, head=0.50, slide=0.0, wrist_l=(0.05, 0.85, 0.22), wrist_r=(-0.05, 0.85, 0.22)),   # 兩手在胸前、低頭
}


def ctx(active, selected):
    return bpy.context.temp_override(active_object=active, object=active, selected_objects=selected, selected_editable_objects=selected)


def import_base(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    os.makedirs(TMP, exist_ok=True)
    tmp = os.path.join(TMP, '_%s.glb' % os.path.basename(name)); shutil.copy(os.path.join(ROOT, SRC % name), tmp)
    bpy.ops.import_scene.gltf(filepath=tmp); os.remove(tmp)
    sc = bpy.context.scene
    for o in list(sc.objects):
        if o.type == 'MESH' and o.parent is None: bpy.data.objects.remove(o, do_unlink=True)   # 匯入時多出來的 Icosphere
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    meshes = [o for o in sc.objects if o.type == 'MESH']
    for o in meshes:
        if o.data.shape_keys:
            o.active_shape_key_index = 0; o.shape_key_clear()
    with ctx(meshes[0], meshes): bpy.ops.object.join()
    high = meshes[0]; high.name = 'HIGH'
    # 拿掉遊戲不畫的眼睛高光
    bm = bmesh.new(); bm.from_mesh(high.data)
    bad = {i for i, m in enumerate(high.data.materials) if m and ('EyeHighlight' in m.name or 'EyeExtra' in m.name)}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in bad], context='FACES')
    bm.to_mesh(high.data); bm.free()
    # 烤顏色用的材質：貼圖（透明的地方換成底下該有的顏色）×（配色）→ 自發光（不受光）
    import numpy as np

    def avg_opaque(img):
        if not img: return (0.6, 0.6, 0.6)
        w, h = img.size; a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a); a = a.reshape(-1, 4)
        m = a[:, 3] > 0.5; c = a[m, :3].mean(axis=0) if m.any() else a[:, :3].mean(axis=0)
        return tuple(float(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for v in c)   # sRGB → 線性（節點是線性）
    imgs = {}
    for m in high.data.materials:
        if m and m.use_nodes:
            t = next((n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE'), None); imgs[m.name] = t.image if t else None
    skin = next((imgs[k] for k in imgs if 'Face_00_SKIN' in k), None); white = next((imgs[k] for k in imgs if 'EyeWhite' in k), None)
    for m in high.data.materials:
        if not m or not m.use_nodes: continue
        nt = m.node_tree; img = imgs.get(m.name)
        under = skin if any(k in m.name for k in ('FaceEyeline', 'FaceEyelash', 'FaceBrow', 'FaceMouth')) else (white if ('EyeIris' in m.name or 'Iris_EYE' in m.name) else img)   # 臉上疊的線條、嘴：底下是皮膚；虹膜：底下是眼白；頭髮：髮片透明的地方＝頭髮的平均色（不是底下的皮膚）
        base = avg_opaque(under)
        if m.name.endswith('_HAIR'): high['hair_col'] = list(base)
        for n in list(nt.nodes): nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1.0; mul.name = 'TINT'
        mul.inputs[7].default_value = (1, 1, 1, 1); nt.links.new(mul.outputs[2], em.inputs['Color'])
        if img:
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = img
            mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MIX'; mx.inputs[6].default_value = (*base, 1)
            nt.links.new(t.outputs['Alpha'], mx.inputs['Factor']); nt.links.new(t.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], mul.inputs[6])
        else: mul.inputs[6].default_value = (0.8, 0.8, 0.8, 1)
    # 身體（皮膚）的頂點：算「屁股坐在哪」只用這些——長裙垂下來的裙襬不算（nf9 的長裙讓整個人被抬到站著的高度）
    bi_ = {i for i, m in enumerate(high.data.materials) if m and '_Body_' in m.name and 'SKIN' in m.name}
    high['body_v'] = sorted({v for p in high.data.polygons if p.material_index in bi_ for v in p.vertices})
    return arm, high


def tris_of(ob): return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def decimated(src, target, name):
    ob = src.copy(); ob.data = src.data.copy(); ob.name = name; bpy.context.scene.collection.objects.link(ob)
    for md in list(ob.modifiers): ob.modifiers.remove(md)
    for it in range(8):   # 一次減不到（外殼的面很多時一次只到 6,000 左右）：分幾次減
        n = tris_of(ob)
        if n <= target * 1.08: break
        d = ob.modifiers.new('dec', 'DECIMATE'); d.decimate_type = 'COLLAPSE'; d.ratio = max(0.002, min(1.0, target / max(1, n))); d.use_collapse_triangulate = True
        with ctx(ob, [ob]): bpy.ops.object.modifier_apply(modifier='dec')
        print('   decimate', name, n, '->', tris_of(ob), flush=True)
    return ob


def hair_fill(high, base_col):
    """頭髮的內層（烤色用）：只有頭髮做外殼（加厚 2 cm：補起 2 cm 以下的髮束間隙＋體素重建）、再往內縮 1 cm（大約回到髮片的位置），材質是頭髮的平均色。
    原本的長髮一束一束有縫，射線從縫裡穿過去打到後面的毛衣，頭髮上變成一塊一塊的衣服色（nf1）；墊了內層，穿過縫的射線打到的是頭髮色"""
    me = high.data; hm = {i for i, m in enumerate(me.materials) if m and m.name.endswith('_HAIR')}
    if not hm: return None
    ob = high.copy(); ob.data = high.data.copy(); ob.name = 'HAIR_FILL'; bpy.context.scene.collection.objects.link(ob)
    for md in list(ob.modifiers): ob.modifiers.remove(md)
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index not in hm], context='FACES'); bm.to_mesh(ob.data); bm.free()
    sd = ob.modifiers.new('sol', 'SOLIDIFY'); sd.thickness = 0.02; sd.offset = 0.0; sd.use_rim = True
    rm = ob.modifiers.new('rem', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = VOXEL; rm.adaptivity = 0.0
    with ctx(ob, [ob]):
        bpy.ops.object.modifier_apply(modifier='sol'); bpy.ops.object.modifier_apply(modifier='rem')
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.normal_update()
    for v in bm.verts: v.co -= v.normal * 0.010
    bm.to_mesh(ob.data); bm.free()
    ob.data.materials.clear()
    m = bpy.data.materials.new('hair_fill'); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*base_col, 1)
    nt.links.new(em.outputs['Emission'], out.inputs['Surface']); ob.data.materials.append(m)
    print('  hair fill tris', tris_of(ob), flush=True)
    return ob


def make_shell(high):
    """外殼：HIGH 的複本（站姿）→ 加厚 → 體素重建 → 一個封閉的表面；拿掉體素重建留下的小碎塊（眼球後面的空腔之類，看不到）"""
    ob = high.copy(); ob.data = high.data.copy(); ob.name = 'SHELL'; bpy.context.scene.collection.objects.link(ob)
    for md in list(ob.modifiers): ob.modifiers.remove(md)
    sd = ob.modifiers.new('sol', 'SOLIDIFY'); sd.thickness = SHELL_T; sd.offset = 0.0; sd.use_rim = True
    rm = ob.modifiers.new('rem', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = VOXEL; rm.adaptivity = 0.0
    with ctx(ob, [ob]):
        bpy.ops.object.modifier_apply(modifier='sol'); bpy.ops.object.modifier_apply(modifier='rem')
    bm = bmesh.new(); bm.from_mesh(ob.data); bm.verts.ensure_lookup_table()
    seen, small, sizes = set(), [], []
    for v in bm.verts:
        if v.index in seen: continue
        comp, st = [], [v]; seen.add(v.index)
        while st:
            x = st.pop(); comp.append(x)
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen: seen.add(y.index); st.append(y)
        sizes.append(len(comp))
        if len(comp) < 300: small += comp
    bmesh.ops.delete(bm, geom=small, context='VERTS'); bm.to_mesh(ob.data); bm.free()
    for p in ob.data.polygons: p.use_smooth = True
    sizes.sort(reverse=True)
    print('  shell tris', tris_of(ob), 'removed verts', len(small), 'components', len(sizes), 'largest', sizes[:12], flush=True)
    return ob


def transfer_weights(low, high):
    """骨架權重：從 HIGH 最近的面內插（垂到背上的長髮拿到的是上身的權重：坐下前傾時跟著背走，比跟著頭自然）"""
    low.vertex_groups.clear()
    for vg in high.vertex_groups: low.vertex_groups.new(name=vg.name)
    dt = low.modifiers.new('dt', 'DATA_TRANSFER'); dt.object = high; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    with ctx(low, [low]): bpy.ops.object.modifier_apply(modifier='dt')


def add_armature(ob, arm):
    md = ob.modifiers.new('arm', 'ARMATURE'); md.object = arm; return md


def part_weight(neck_z, hips_z):
    """UV 島的倍數（照島在站姿的高度）：頭和頭髮 ×2.2（講堂裡最常看到的是後腦、側臉）、上身 ×1.2、腰以下 ×0.7（大多在桌子下面）"""
    def w(faces):
        z = sum(f.calc_center_median().z for f in faces) / len(faces)
        return 2.2 if z > neck_z else (1.2 if z > hips_z else 0.7)
    return w


def smart_uv(ob, rect=(0.0, 0.0, 1.0, 1.0), weight=None):
    for l in list(ob.data.uv_layers): ob.data.uv_layers.remove(l)
    ob.data.uv_layers.new(name='bake'); ob.data.uv_layers.active_index = 0
    for o in bpy.context.scene.objects: o.select_set(False)
    ob.select_set(True); bpy.context.view_layer.objects.active = ob   # 編輯模式的運算子要的是 view layer 的 active（只靠 temp_override 時 select_all 的 poll 會失敗）
    with ctx(ob, [ob]):
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(80), island_margin=0.01, area_weight=0.0, correct_aspect=True, scale_to_bounds=True)
        bpy.ops.object.mode_set(mode='OBJECT')
    import uvpack   # 背景模式的打包只用到 1–8% 的貼圖；自己排（約三成）
    n, area = uvpack.pack(ob.data, margin=0.004, rect=rect, weight=weight); print('  uv islands', n, 'area', round(area, 3), 'rect', rect)


def bake_target(ob, img):
    for i in range(len(ob.data.materials)): ob.data.materials[i] = None
    ob.data.materials.clear()
    m = bpy.data.materials.new('bake_' + ob.name); m.use_nodes = True; nt = m.node_tree
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; nt.nodes.active = t
    ob.data.materials.append(m)


def bake(high, low, img, clear=True, extra=()):
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 4
    sc.render.bake.use_selected_to_active = True; sc.render.bake.cage_extrusion = 0.02; sc.render.bake.max_ray_distance = 0.08; sc.render.bake.margin = 2
    for o in sc.objects: o.select_set(False)
    high.select_set(True); low.select_set(True); bpy.context.view_layer.objects.active = low
    for e in extra: e.select_set(True)
    for m in low.data.materials: m.node_tree.nodes.active = next(n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE')
    with ctx(low, [high, *extra, low]): bpy.ops.object.bake(type='EMIT', use_selected_to_active=True, margin=2, use_clear=clear)


def hair_cleanup(img, lows, arm, high):
    """第三版（ART-SEATFIG-1018，使用者「博雅 101 有人禿頭」）：頭頂、後腦勺的頭髮上有白色、淺藍色的斑點——
    烤色的射線從髮束的縫穿過內層，打到後面的毛衣、衣領（nf1 的白衣、深色長髮的淺藍襯衫）；遠看像禿頭。
    做法：站姿時「頭頂（頭骨以上 7 cm）」和「臉的另一邊、離原本的頭髮 3 cm 以內」的面一定是頭髮（長髮披在背上的部分也算）；這些面在貼圖上的像素裡，
    比頭髮的平均色（樣本頭髮貼圖不透明部分的平均）亮 0.18 以上、而且差 0.22 以上的（白、淺藍的斑點）換成頭髮色。
    （試做第一次：用這一區的中位數當基準、差 0.20 就換——nf3 的那一區中位數是皮膚色，頭髮被換成皮膚色，更像禿頭）"""
    import numpy as np
    w, h = img.size; a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a); a = a.reshape(h, w, 4)
    hz = H(arm, 'J_Bip_C_Head').z; nz = H(arm, 'J_Bip_C_Neck').z; hc = H(arm, 'J_Bip_C_Head')
    fm = {i for i, m in enumerate(high.data.materials) if m and 'Face_00_SKIN' in m.name}
    fv = [high.matrix_world @ high.data.vertices[v].co for p_ in high.data.polygons if p_.material_index in fm for v in p_.vertices]
    if not fv: print('  hair cleanup: no face', flush=True); return
    fc = sum(fv, Vector()) / len(fv); fdir = Vector((fc.x - hc.x, fc.y - hc.y, 0.0)).normalized()     # 臉朝哪邊（水平）
    lin = high.get('hair_col', (0.1, 0.08, 0.07)); ref = np.array([v * 12.92 if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055 for v in lin])   # 線性 → sRGB（烤出來的貼圖是 sRGB）
    from mathutils.kdtree import KDTree
    hm = {i for i, m in enumerate(high.data.materials) if m and m.name.endswith('_HAIR')}
    hv = list({v for p_ in high.data.polygons if p_.material_index in hm for v in p_.vertices}); kd = KDTree(max(1, len(hv)))
    for i, v in enumerate(hv): kd.insert(high.matrix_world @ high.data.vertices[v].co, i)
    kd.balance()
    mask = np.zeros((h, w), bool)
    for low in lows:
        me = low.data; uv = me.uv_layers.active; mw = low.matrix_world
        for p_ in me.polygons:
            c = mw @ p_.center; off = Vector((c.x - hc.x, c.y - hc.y, 0.0))
            top = c.z > hz + 0.07; back = off.length > 0.02 and off.normalized().dot(fdir) < -0.2 and hv and kd.find(c)[2] < 0.03
            if not (top or back): continue
            T = [uv.data[li].uv for li in p_.loop_indices]
            for k in range(1, len(T) - 1):
                tri = np.array([[T[0].x * w, T[0].y * h], [T[k].x * w, T[k].y * h], [T[k + 1].x * w, T[k + 1].y * h]])
                x0, y0 = np.floor(tri.min(0)).astype(int); x1, y1 = np.ceil(tri.max(0)).astype(int)
                x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, w - 1), min(y1, h - 1)
                if x1 < x0 or y1 < y0: continue
                yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]; P = np.stack([xx + 0.5, yy + 0.5], -1)
                (ax, ay), (bx, by), (cx, cy) = tri; d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
                if abs(d) < 1e-9: continue
                l1 = ((by - cy) * (P[..., 0] - cx) + (cx - bx) * (P[..., 1] - cy)) / d; l2 = ((cy - ay) * (P[..., 0] - cx) + (ax - cx) * (P[..., 1] - cy)) / d
                mask[y0:y1 + 1, x0:x1 + 1] |= (l1 >= -0.02) & (l2 >= -0.02) & (1 - l1 - l2 >= -0.02)
    if not mask.any(): print('  hair cleanup: no head faces', flush=True); return
    rgb = a[..., :3]; lum = rgb @ np.array([0.30, 0.59, 0.11]); rl = float(ref @ np.array([0.30, 0.59, 0.11]))
    bad = mask & (lum > rl + 0.18) & (np.abs(rgb - ref).max(-1) > 0.22)
    rgb[bad] = ref; a[..., :3] = rgb; img.pixels.foreach_set(a.ravel())
    print('  hair cleanup: head px %d, replaced %d (hair %s)' % (int(mask.sum()), int(bad.sum()), np.round(ref, 3).tolist()), flush=True)


def fill_misses(img, passes=40):
    """烤色時射線沒打到東西的像素（全黑）用旁邊的顏色補：寬褲兩條褲管在站姿時貼在一起，外殼把兩腿之間連成一片，
    那一片的射線打不到東西，坐下以後膝蓋前面是一條黑帶（nf1 的白色寬褲）。島和島之間的空白也一起補（貼圖沒有 mipmap，邊緣不會滲黑）"""
    import numpy as np
    w, h = img.size; a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a); a = a.reshape(h, w, 4)
    rgb = a[..., :3]; miss = rgb.sum(-1) < 1e-5; n0 = int(miss.sum())
    for _ in range(passes):
        if not miss.any(): break
        acc = np.zeros_like(rgb); cnt = np.zeros(miss.shape, np.float32)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            m = np.roll(np.roll(~miss, dy, 0), dx, 1); acc += np.roll(np.roll(rgb, dy, 0), dx, 1) * m[..., None]; cnt += m
        f = miss & (cnt > 0); rgb[f] = acc[f] / cnt[f][:, None]; miss &= ~f
    a[..., :3] = rgb; img.pixels.foreach_set(a.ravel()); print('  fill misses', n0, '->', int(miss.sum()), flush=True)


# ---------------- 姿勢 ----------------
def pose_reset(arm):
    for pb in arm.pose.bones: pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()


def rot_bone(arm, name, q):
    """骨頭（和它底下的）繞自己的頭、在骨架座標轉 q"""
    pb = arm.pose.bones[name]; M = pb.matrix.copy(); h = M.translation.copy()
    pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ M
    bpy.context.view_layer.update()


def H(arm, name): return arm.pose.bones[name].head.copy()


def aim(arm, name, child, target_dir):
    cur = (H(arm, child) - H(arm, name)).normalized()
    rot_bone(arm, name, cur.rotation_difference(Vector(target_dir).normalized()))


def aim_point(arm, name, child, P):
    aim(arm, name, child, Vector(P) - H(arm, name))


def two_bone(S, W, a, b, pole):
    d = W - S; L = max(1e-4, min(d.length, a + b - 1e-4)); dn = d.normalized()
    cA = max(-1.0, min(1.0, (a * a + L * L - b * b) / (2 * a * L))); A = math.acos(cA)
    pn = (pole - dn * pole.dot(dn)).normalized()
    return S + dn * (a * math.cos(A)) + pn * (a * math.sin(A))


def g2a(p, T):
    """遊戲座標（座位原點、面向 +z）→ 骨架座標（面向 +Y、還沒搬到座位）：gx=−x、gy=z、gz=y，再減掉搬移量 T"""
    gx, gy, gz = p; return Vector((-gx, gz, gy)) - T


def posed_verts(ob):
    dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg); me = ev.to_mesh()
    vs = [v.co.copy() for v in me.vertices]; ev.to_mesh_clear(); return vs


def apply_pose(arm, high, pose):
    P = POSES[pose]; S = 'J_Bip_'
    pose_reset(arm)
    foot_h = H(arm, S + 'L_Foot').z - min(v.co.z for v in high.data.vertices)   # 站姿腳踝離地的高度（鞋底）
    # 腿：大腿往前（微微張開、前端略低）、小腿往下、腳掌照站姿的斜度
    for s, sx in (('L', -1), ('R', 1)):
        aim(arm, S + s + '_UpperLeg', S + s + '_LowerLeg', (sx * 0.09, 1.0, -0.07))
        aim(arm, S + s + '_LowerLeg', S + s + '_Foot', (0.0, 0.10, -1.0))
        aim(arm, S + s + '_Foot', S + s + '_ToeBase', (0.0, 1.0, -0.59))
    # 上身前傾、頭（繞左右方向的軸；骨架面向 +Y，往前＝負角）
    rot_bone(arm, S + 'C_Spine', Quaternion((1, 0, 0), -P['lean'] * 0.6))
    rot_bone(arm, S + 'C_Chest', Quaternion((1, 0, 0), -P['lean'] * 0.4))
    rot_bone(arm, S + 'C_Head', Quaternion((1, 0, 0), -P['head']))
    # 搬到座位：大腿和屁股的最低點＝座墊、屁股最後面＝椅背前緣
    vs = posed_verts(high); hip = H(arm, S + 'C_Hips'); knee = (H(arm, S + 'L_LowerLeg') + H(arm, S + 'R_LowerLeg')) / 2
    bv = high.get('body_v')
    if bv: vs = [vs[i] for i in bv]
    zone = [v for v in vs if abs(v.x) < 0.22 and hip.y - 0.3 < v.y < knee.y - 0.12 and v.z < hip.z + 0.05]
    bottom = min(v.z for v in zone); rear = min(v.y for v in zone if v.z < bottom + 0.12)
    T = Vector((0.0, BACK_Z + P.get('slide', 0.0) - rear, SEAT_Y - bottom))
    # 腳：鞋底不能低於地面。個子高的人坐矮椅子：膝蓋抬高、小腿維持原本的角度（腳在膝蓋下面）；抬到 34° 還不夠才讓小腿往前（最多離垂直 15°：再多腳會伸到前一排的桌板下）
    # 2026-10-13 修正：①原本抬大腿是負轉（大腿往下轉），個子高的三個底模（f2、m1、m2）連轉 16 次後腿直直往下、穿過地板；
    # ②原本先把小腿往前推（腳只抬高一點、卻往前 12 cm），m1 的腳伸到座位前方 0.83 m。現在先抬膝蓋。
    def sole(s): return H(arm, S + s + '_Foot').z + T.z - foot_h
    for s in ('L', 'R'):
        raised = 0.0
        for _ in range(40):
            if sole(s) >= 0.004: break
            k = H(arm, S + s + '_LowerLeg')
            if raised < 0.6:   # 1. 大腿抬高（繞 +X 正轉：往前的大腿 (0,1,0) 轉 +θ → (0, cos θ, sin θ)，前端往上）、小腿轉回原本的角度
                d = min(0.05, 0.6 - raised); raised += d
                rot_bone(arm, S + s + '_UpperLeg', Quaternion((1, 0, 0), d)); rot_bone(arm, S + s + '_LowerLeg', Quaternion((1, 0, 0), -d))
            else:              # 2. 小腿往前（繞 +X 正轉：往下的小腿 (0,0,−1) 轉 +θ → (0, sin θ, −cos θ)，下端往前），最多離垂直 15°
                ank = H(arm, S + s + '_Foot'); cur_phi = math.atan2(ank.y - k.y, k.z - ank.z)
                if cur_phi >= math.radians(15) - 1e-3: break
                rot_bone(arm, S + s + '_LowerLeg', Quaternion((1, 0, 0), min(0.05, math.radians(15) - cur_phi)))
        aim(arm, S + s + '_Foot', S + s + '_ToeBase', (0.0, 1.0, -0.59))
        # 檢查：膝蓋在屁股前面（坐著）、鞋底沒有穿過地面——不對就停下來（不要再交出站著的腿）
        hip_, kn = H(arm, S + s + '_UpperLeg'), H(arm, S + s + '_LowerLeg')
        assert kn.y - hip_.y > 0.2 and kn.z > hip_.z - 0.12, f'{pose} {s}：大腿沒有往前（膝蓋 {tuple(round(v, 3) for v in kn)}、髖 {tuple(round(v, 3) for v in hip_)}）'
        assert sole(s) > -0.012, f'{pose} {s}：鞋底在地面下 {sole(s):.3f} m'
    # 手臂：兩段 IK，手腕到指定的位置（手肘往外、往後下）
    for s, sx, key in (('L', -1, 'wrist_l'), ('R', 1, 'wrist_r')):
        Sh = H(arm, S + s + '_UpperArm'); El = H(arm, S + s + '_LowerArm'); Wr = H(arm, S + s + '_Hand')
        a, b = (El - Sh).length, (Wr - El).length
        W = g2a(P[key], T)
        E = two_bone(Sh, W, a, b, Vector((sx * 1.0, -0.6, -1.0)))
        aim_point(arm, S + s + '_UpperArm', S + s + '_LowerArm', E)
        aim_point(arm, S + s + '_LowerArm', S + s + '_Hand', W)
        f = (H(arm, S + s + '_Hand') - H(arm, S + s + '_LowerArm')).normalized()
        aim(arm, S + s + '_Hand', S + s + '_Middle1', f + Vector((0, 0, -0.15)))   # 手掌順著前臂、略往下（放在桌上）
    return T


def posed_copy(low, arm, T, name):
    ob = low.copy(); ob.data = low.data.copy(); ob.name = name; bpy.context.scene.collection.objects.link(ob)
    with ctx(ob, [ob]): bpy.ops.object.modifier_apply(modifier='arm')
    R = Matrix.Rotation(math.pi, 4, 'Z') @ Matrix.Translation(T)
    ob.data.transform(R); ob.data.update()
    ob.vertex_groups.clear()
    return ob


def build():
    os.makedirs(TMP, exist_ok=True)
    results = []   # (name, base, pose, ci, lod, mesh data copy) 存在 .blend 之外：每個底模換場景，所以存成 OBJ 頂點資料
    info = {'bases': {}, 'meshes': {}, 'note': '原點＝座位的地面中心（和 furniture_study.glb 的講堂椅同一個原點）、+z 朝前（講台）。每個底模一種顏色（路人自己的穿搭）；共用一個材質 seated_fig（貼圖集 512×512 一格）。第二版：外殼（加厚＋體素重建）再減面、烤顏色。'}
    bases = [b for b in BASES if not ONLY or b == ONLY]
    store = {}
    for bi, base in enumerate(bases):
        arm, high = import_base(base)
        th = tris_of(high)
        for md in list(high.modifiers):
            if md.type != 'ARMATURE': high.modifiers.remove(md)
        shell = make_shell(high)
        # 一格貼圖：上面四分之三給 LOD0、下面四分之一給 LOD1（LOD1 自己展 UV、自己烤）
        pw = part_weight(H(arm, 'J_Bip_C_Neck').z, H(arm, 'J_Bip_C_Hips').z)
        low0 = decimated(shell, LOD0_TRIS, 'LOW0'); smart_uv(low0, (0.0, 0.25, 1.0, 0.75), pw)
        low1 = decimated(shell, LOD1_TRIS, 'LOW1'); smart_uv(low1, (0.0, 0.0, 1.0, 0.25), pw)
        bpy.data.objects.remove(shell, do_unlink=True)
        transfer_weights(low0, high); transfer_weights(low1, high)
        add_armature(low0, arm); add_armature(low1, arm)
        pose_reset(arm)
        img = bpy.data.images.new(f'{base}_c0', REG, REG, alpha=False)
        fill = hair_fill(high, tuple(high.get('hair_col', (0.1, 0.08, 0.07)))); ex = (fill,) if fill else ()
        bake_target(low0, img); bake_target(low1, img); bake(high, low0, img, clear=True, extra=ex); bake(high, low1, img, clear=False, extra=ex)
        if fill: bpy.data.objects.remove(fill, do_unlink=True)
        fill_misses(img)
        hair_cleanup(img, (low0, low1), arm, high)
        img.filepath_raw = os.path.join(TMP, f'{base}_c0.png'); img.file_format = 'PNG'; img.save()
        for pose in POSES:
            T = apply_pose(arm, high, pose)
            for lod, low in ((0, low0), (1, low1)):
                ob = posed_copy(low, arm, T, f'fig_{base}_{pose}' + ('_lod1' if lod else ''))
                me = ob.data; uv = me.uv_layers.active
                store[(base, pose, lod)] = dict(verts=[tuple(v.co) for v in me.vertices], polys=[tuple(p.vertices) for p in me.polygons],
                                                 uvs=[tuple(uv.data[li].uv) for p in me.polygons for li in p.loop_indices] if uv else None, tris=tris_of(ob))
        info['bases'][base] = {'source': SRC % base, 'high_tris': th, 'lod0_tris': tris_of(low0), 'lod1_tris': tris_of(low1)}
        print('base', base, 'high', th, 'lod0', tris_of(low0), 'lod1', tris_of(low1), flush=True)
    # 貼圖集：(底模 index×2＋配色) 一格，4 欄
    from PIL import Image
    n = len(bases); cols = 4; rows = (n + cols - 1) // cols
    atlas = Image.new('RGB', (cols * REG, rows * REG), (128, 128, 128))
    for bi, base in enumerate(bases):
        atlas.paste(Image.open(os.path.join(TMP, f'{base}_c0.png')).convert('RGB'), ((bi % cols) * REG, (bi // cols) * REG))
    apath = os.path.join(TMP, 'seated_atlas.png'); atlas.save(apath)
    # 輸出：新場景、每個（底模×姿勢×配色×LOD）一個物件、共用材質
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mat = bpy.data.materials.new('seated_fig'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(apath); t.image.pack()
    nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.85
    nt.links.new(t.outputs['Color'], bsdf.inputs['Emission Color']); bsdf.inputs['Emission Strength'].default_value = EMIT   # 遊戲的 VRM 人物是 MToon（暗部有固定的亮度）；替身用一般材質，在暗的教室裡會比真人物暗——加一點自發光補
    root = bpy.data.objects.new('seated_figures', None); bpy.context.scene.collection.objects.link(root)
    k = 0
    for bi, base in enumerate(bases):
        for pose in POSES:
            for ci in range(1):
                r = bi; c0, r0 = r % cols, r // cols
                for lod in (0, 1):
                    d = store[(base, pose, lod)]
                    me = bpy.data.meshes.new(f'fig_{base}_{pose}_c{ci}' + ('_lod1' if lod else ''))
                    me.from_pydata(d['verts'], [], d['polys']); me.update()
                    uvl = me.uv_layers.new(name='UVMap')
                    for li, (u, v) in enumerate(d['uvs']): uvl.data[li].uv = ((c0 + u) / cols, 1 - (r0 + 1 - v) / rows)
                    for p in me.polygons: p.use_smooth = True
                    me.materials.append(mat)
                    ob = bpy.data.objects.new(me.name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root
                    ob.location = Vector(((k % 12) * 0.8 - 4.4, -(k // 12) * 1.2, 0)); k += 1   # 檢視用：排開（遊戲端用網格本身）
                    info['meshes'][me.name] = {'base': base, 'pose': pose, 'color': ci, 'lod': lod, 'tris': d['tris']}
    out = os.path.join(ROOT, OUT); os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='WEBP', export_image_quality=85, export_yup=True, export_apply=True,
                              export_extras=True, export_materials='EXPORT', export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False)
    import subprocess   # 同一個底模的三個姿勢共用 UV（三角形索引 Blender 已經共用）；法線存成 8 位元（4.9 MB → 約 3 MB）
    print(subprocess.check_output(['python3', os.path.join(HERE, 'glb_share_geometry.py'), out, '--qnormals']).decode().strip())
    info['bytes'] = os.path.getsize(out); info['atlas'] = os.path.relpath(apath, ROOT)
    info['seat'] = {'origin': '座位地面中心', 'seat_y': SEAT_Y, 'back_z': BACK_Z, 'desk': 'lecture_desk：z 0.30–0.64、高 0.75'}
    info['poses'] = {k: v for k, v in POSES.items()}
    with open(out[:-4] + '.json', 'w', encoding='utf-8') as f: json.dump(info, f, ensure_ascii=False, indent=1)
    print(json.dumps({'out': OUT, 'bytes': info['bytes'], 'meshes': k}, ensure_ascii=False))


if __name__ == '__main__':
    build()
