"""2D 背景的人群：遊戲的學生正式人物（assets/models/char/vroid_npc_*.vrm，VRoid CC0 樣本改作）擺坐姿／站姿，套用骨架烘成靜態網格。LAWWW2-B 2026-10-17。
- 衣服、頭髮：貼圖的明暗（去色）× 每個人隨機的顏色（Cycles 的 Object Info → Random 查色表）；皮膚、臉、眼睛照原貼圖。
  遊戲裡這些顏色是程式另外上的，Blender 只讀得到原貼圖（衣服是白的、後腦的頭髮底是紫的），所以這裡自己上色。
- 給 bg_gym_ceremony.py 用（開學典禮，使用者 2026-10-16 23:5x 退件後重做：原本的幾何公仔「超醜」）。"""
import bpy, math, os
from mathutils import Vector, Matrix
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
TMPDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'textures', 'gen', 'vrm_tmp')   # 呼叫端可以改（.vrm 複製成 .glb 的地方）

def srgb(h):
    h = h.lstrip('#'); return tuple((int(h[i:i + 2], 16) / 255.0) ** 2.2 for i in (0, 2, 4)) + (1.0,)

def ramp_node(nt, cols, k):
    N = nt.nodes; oi = N.new('ShaderNodeObjectInfo'); mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = k
    fr = N.new('ShaderNodeMath'); fr.operation = 'FRACT'; rp = N.new('ShaderNodeValToRGB'); cr = rp.color_ramp; cr.interpolation = 'CONSTANT'
    nt.links.new(oi.outputs['Random'], mu.inputs[0]); nt.links.new(mu.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], rp.inputs['Fac'])
    while len(cr.elements) < len(cols): cr.elements.new(0.5)
    for i, c in enumerate(cols): cr.elements[i].position = i / len(cols); cr.elements[i].color = srgb(c)
    return rp

PAL = {
    'top': (['#f2f1ec'] * 4 + ['#1e2026'] * 3 + ['#8f9298', '#c6c8cb', '#27324b', '#3b4c6b', '#9db4ca', '#d8cab0', '#e7dccb', '#7b8a6a', '#b44b3d', '#e2b6b6', '#efe2a9', '#5e6f86', '#a6c2af', '#c9d8e8'], 1.0),
    'bottom': (['#2f3d57'] * 3 + ['#1d1e22'] * 3 + ['#4d6487', '#8a7f6c', '#c6bba5', '#5a5c60', '#e8e5de', '#6f5844'], 5.29),
    'shoe': (['#f1f1ee'] * 4 + ['#1c1c1e'] * 3 + ['#8b8f96', '#c8b79c'], 11.3),
    'hair': (['#151110'] * 6 + ['#211813'] * 4 + ['#2e2119'] * 3 + ['#4a3427', '#5e4431'], 7.13),
}
# 開學典禮（使用者 00:2x 給的實際典禮照片）：新生幾乎都穿白色 T 恤、黑頭髮
FRESHMEN = {
    'top': (['#f5f5f2'] * 14 + ['#eceae4', '#dfe3e8', '#2a2d33'], 1.0),
    'hair': (['#0b0a09'] * 7 + ['#120e0c'] * 4 + ['#1e1611'] * 2, 7.13),
}

def kind_of(name):
    n = name.upper()
    if 'HAIR' in n: return 'hair'
    if 'TOPS' in n: return 'top'
    if 'BOTTOMS' in n: return 'bottom'
    if 'SHOES' in n: return 'shoe'
    return None

def remat(m, cache, pal=None):
    """換成 Principled：衣服、頭髮＝貼圖的明暗（去色）× 每個人隨機的顏色；皮膚、臉、眼睛照原貼圖"""
    if m.name in cache: return cache[m.name]
    P_ = dict(PAL, **(pal or {}))
    tx = [n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE']
    img = tx[0].image if tx else None; k = kind_of(m.name)
    nm = bpy.data.materials.new('crowd_' + m.name); nt = nm.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    bs.inputs['Roughness'].default_value = 0.72 if k == 'hair' else (0.8 if k else 0.55)
    if k == 'hair':   # 黑髮、霧面：反光很弱（使用者 00:2x「他們頭髮為什麼看起來很灰」——原本 0.45 的光澤把屋頂整排白燈反成一片灰）
        try: bs.inputs['Specular IOR Level'].default_value = 0.18
        except Exception: pass
    if img:
        t = N.new('ShaderNodeTexImage'); t.image = img
        if k:
            bw = N.new('ShaderNodeRGBToBW'); nt.links.new(t.outputs['Color'], bw.inputs['Color'])
            gm = N.new('ShaderNodeMath'); gm.operation = 'POWER'; gm.inputs[1].default_value = 1.4 if k == 'hair' else 0.6; nt.links.new(bw.outputs['Val'], gm.inputs[0])   # 頭髮：貼圖的明暗壓深（不要淡淡的灰）
            mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
            rp = ramp_node(nt, *P_[k])
            nt.links.new(rp.outputs['Color'], mx.inputs[6]); 
            cv = N.new('ShaderNodeCombineColor'); [nt.links.new(gm.outputs[0], cv.inputs[i]) for i in range(3)]
            nt.links.new(cv.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], bs.inputs['Base Color'])
        else:
            nt.links.new(t.outputs['Color'], bs.inputs['Base Color'])
            if 'SKIN' in m.name.upper():
                try: bs.inputs['Subsurface Weight'].default_value = 0.08
                except Exception: pass
        if m.blend_method in ('BLEND', 'HASHED', 'CLIP') or k == 'hair':
            nt.links.new(t.outputs['Alpha'], bs.inputs['Alpha'])
    nm.blend_method = 'HASHED' if m.blend_method != 'OPAQUE' else 'OPAQUE'
    cache[m.name] = nm; return nm

POSES = {
    'thigh': dict(arm=78, armfwd=18, fore=62, inward=24, head=(0, 0)),
    'lap': dict(arm=80, armfwd=24, fore=70, inward=40, head=(0, 6)),
    'look': dict(arm=78, armfwd=16, fore=60, inward=22, head=(22, 2)),
    'down': dict(arm=79, armfwd=22, fore=72, inward=36, head=(-4, 20)),
    'stand': dict(arm=74, armfwd=30, fore=48, inward=20, head=(0, 4)),   # 站著（講台致詞）：腿不動
}

def seated_variant(path, name, height, pose, lean=0.0, decimate=0.45, pal=None):
    """匯入一個 VRM（glTF）→ 坐姿 → 套用骨架 → 合成一個靜態網格（原點＝椅面中心正下方的地面、面向 +y（Blender））"""
    before = set(bpy.data.objects)
    if not path.endswith('.glb'):                                    # .vrm 也是 glTF：複製成 .glb 再匯入
        import shutil
        os.makedirs(TMPDIR, exist_ok=True); tmp = os.path.join(TMPDIR, os.path.basename(path) + '.glb'); shutil.copyfile(path, tmp); path = tmp
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    arm = [o for o in new if o.type == 'ARMATURE'][0]
    for o in new:
        if o.type == 'MESH' and o.name.startswith('Icosphere'): bpy.data.objects.remove(o)
    new = [o for o in bpy.data.objects if o not in before]
    vl = bpy.context.view_layer; P = arm.pose.bones
    top = max((o.matrix_world @ Vector(c)).z for o in new if o.type == 'MESH' for c in o.bound_box)
    s = height / top; arm.scale = (s, s, s); vl.update()
    def rw(n, axis, deg):
        if n not in P: return
        pb = P[n]; pv = pb.head.copy()
        pb.matrix = Matrix.Translation(pv) @ Matrix.Rotation(math.radians(deg), 4, axis) @ Matrix.Translation(-pv) @ pb.matrix; vl.update()
    sg = -1 if (arm.matrix_world @ P['J_Bip_L_UpperArm'].head).x < 0 else 1
    q = POSES[pose]
    rw('J_Bip_C_Spine', X, lean)
    for side in ('L', 'R'):
        if pose != 'stand': rw(f'J_Bip_{side}_UpperLeg', X, 86); rw(f'J_Bip_{side}_LowerLeg', X, -86)
        d = -1 if (side == 'L') == (sg < 0) else 1
        rw(f'J_Bip_{side}_UpperArm', Y, q['arm'] * d); rw(f'J_Bip_{side}_UpperArm', X, q['armfwd'])
        rw(f'J_Bip_{side}_LowerArm', X, q['fore']); rw(f'J_Bip_{side}_LowerArm', Z, -q['inward'] * d * sg)
    yaw, pitch = q['head']; rw('J_Bip_C_Head', Z, yaw); rw('J_Bip_C_Head', X, -pitch)
    if pose != 'stand':
        ul = (arm.matrix_world @ P['J_Bip_L_UpperLeg'].head).z
        arm.location.z -= ul - (0.47 + 0.085); vl.update()
    meshes = [o for o in new if o.type == 'MESH']
    dg = bpy.context.evaluated_depsgraph_get(); parts = []
    for o in meshes:
        ev = o.evaluated_get(dg); me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=False, depsgraph=dg)
        me.transform(o.matrix_world); parts.append((me, [s_.material for s_ in o.material_slots]))
    for o in new: bpy.data.objects.remove(o)
    import bmesh
    bm = bmesh.new(); mats = []
    for me, ms in parts:
        off = len(mats); mats += ms
        for p in me.polygons: p.material_index += off
        bm.from_mesh(me); bpy.data.meshes.remove(me)
    out = bpy.data.meshes.new(name); bm.to_mesh(out); bm.free()
    cache = {}
    for m in mats: out.materials.append(remat(m, cache, pal) if m else None)
    if decimate < 1.0:
        tmp = bpy.data.objects.new('tmp', out); bpy.context.scene.collection.objects.link(tmp)
        md = tmp.modifiers.new('d', 'DECIMATE'); md.ratio = decimate; md.use_collapse_triangulate = True
        dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg)); me2.name = name
        bpy.data.objects.remove(tmp); bpy.data.meshes.remove(out); out = me2
    for p in out.polygons: p.use_smooth = True
    return out
