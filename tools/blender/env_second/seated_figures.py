"""講堂、自習區的「坐著的聽眾替身」（低成本，給遊戲用 InstancedMesh 放）→ GLB。
LAWWW 2026-10-13 20:02Z：配色用「預先烤好幾種、每種一個網格」。使用者：101 不先做 400 個完整 3D 人物；LAWWW2 做低成本坐姿人物。
  /opt/blenv/bin/python tools/blender/env_second/seated_figures.py [-- --out 輸出.glb] [--only npc_f1]

來源：遊戲的路人底模（VRoid CC0 樣本改作，tools/vroid_build.py 產生）assets/models/char/vroid_npc_{f1,f2,m1,m2}.vrm——
**只用路人底模，不用主角、女主角的模型**（不能讓重要角色的臉出現在路人群裡）。
做法（每個底模）：
  1. 匯入 VRM（glTF）→ 清掉表情（shape key）→ 拿掉遊戲也不畫的眼睛高光（EyeHighlight、EyeExtra）→ 合成一個網格（HIGH，保留骨架權重）。
  2. 減面成 LOD0（約 1,500 個三角形）＋智慧 UV；再減成 LOD1（約 350 個）。
  3. 配色：照遊戲路人的上色方式（材質名 HAIR／Tops／Bottoms 乘上「目標色÷底色」，最多 1.35 倍），每種配色把 HIGH 的顏色烤到 LOD0 的 UV（站姿，形狀一樣，烤得準）。
  4. 姿勢：聽講、抄筆記、滑手機——骨架在世界座標轉（大腿往前、小腿往下、腳掌貼地、上身前傾、頭）、手臂用兩段 IK 把手腕放到桌上／胸前；
     套到 LOD0、LOD1 → 搬到座位（屁股坐在座墊 y≈0.47、背貼椅背 z≈−0.17）→ 轉成面向 +z。
  5. 所有配色的貼圖排成一張貼圖集（每格 512×512），每個（底模×姿勢×配色×LOD）一個網格、共用一個材質。
座位約定和 furniture_study.glb 的講堂椅一樣：原點在座位的地面中心、+z 朝前（講台）、y=0 是那一排的地面；桌板（lecture_desk）在 z 0.30–0.64、高 0.75。
"""
import json, math, os, shutil, sys
import bpy, bmesh
from mathutils import Vector, Matrix, Quaternion
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/seated_figures.glb'
ONLY = ARGS[ARGS.index('--only') + 1] if '--only' in ARGS else None
TMP = os.path.join(HERE, 'textures', 'gen', 'seated')
REG = 512                       # 每種配色的貼圖格子
LOD0_TRIS, LOD1_TRIS = 1500, 350
SEAT_Y, BACK_Z = 0.47, -0.17    # 座墊（坐下陷 1 cm）、椅背前緣
BASES = ['npc_f1', 'npc_f2', 'npc_m1', 'npc_m2']
TINT_BASE = {'hair': '#8a6a52', 'top': '#e6e3de', 'bottom': '#cfcbc4'}   # src/assets3d.js 的 tintBase（四個路人底模相同）
TINT_PAT = {'hair': 'HAIR', 'top': 'Tops', 'bottom': 'Bottoms'}
COLORS = {   # 大學生常見的穿著（每個底模兩種）
    'npc_f1': [dict(hair='#3b2a22', top='#2f3d5c', bottom='#8aa0b8'), dict(hair='#1e1a1a', top='#eeeeea', bottom='#2a2a2c')],
    'npc_f2': [dict(hair='#5a3d2b', top='#d8c8a8', bottom='#4a5a78'), dict(hair='#1e1a1a', top='#e8c8c8', bottom='#a89a7a')],
    'npc_m1': [dict(hair='#1c1a1a', top='#8a8d90', bottom='#2a2a2c'), dict(hair='#3b2a22', top='#6b6f4a', bottom='#3e4f6e')],
    'npc_m2': [dict(hair='#1c1a1a', top='#e8e8e4', bottom='#2e3a50'), dict(hair='#3b2a22', top='#a8c0d8', bottom='#9a8c70')],
}
# 姿勢：上身前傾（弧度，正＝往前）、頭（正＝低頭）、兩個手腕的位置（遊戲座標，座位原點；左＝人物的左手＝遊戲 +x）
POSES = {   # slide：屁股往前坐多少（抄筆記時坐到椅子前半）
    'listen': dict(lean=0.06, head=0.0, slide=0.0, wrist_l=(0.12, 0.68, 0.22), wrist_r=(-0.12, 0.68, 0.22)),     # 手放在大腿上，看講台
    'write':  dict(lean=0.45, head=0.42, slide=0.06, wrist_l=(0.17, 0.775, 0.42), wrist_r=(-0.05, 0.775, 0.45)),  # 身體往前、手在桌上
    'phone':  dict(lean=-0.02, head=0.50, slide=0.0, wrist_l=(0.05, 0.85, 0.22), wrist_r=(-0.05, 0.85, 0.22)),   # 兩手在胸前、低頭
}


def hex2lin(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]


def tint_factor(key, target):
    """和遊戲 character3d.js 的 applyTint 一樣：目標色÷底色、每個通道最多 1.35（three.js 的 Color 是線性值，所以用線性值相除；Blender 的節點也是線性）"""
    b, t = hex2lin(TINT_BASE[key]), hex2lin(target)
    return [min(1.35, tv / max(0.05, bv)) for tv, bv in zip(t, b)]


def ctx(active, selected):
    return bpy.context.temp_override(active_object=active, object=active, selected_objects=selected, selected_editable_objects=selected)


def import_base(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    os.makedirs(TMP, exist_ok=True)
    tmp = os.path.join(TMP, f'_{name}.glb'); shutil.copy(os.path.join(ROOT, 'assets', 'models', 'char', f'vroid_{name}.vrm'), tmp)
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
    # 烤顏色用的材質：貼圖 ×（配色）→ 自發光（不受光）
    for m in high.data.materials:
        if not m or not m.use_nodes: continue
        nt = m.node_tree; tex = next((n for n in nt.nodes if n.type == 'TEX_IMAGE'), None)
        img = tex.image if tex else None
        for n in list(nt.nodes): nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1.0; mul.name = 'TINT'
        mul.inputs[7].default_value = (1, 1, 1, 1); nt.links.new(mul.outputs[2], em.inputs['Color'])
        if img:
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; nt.links.new(t.outputs['Color'], mul.inputs[6])
        else: mul.inputs[6].default_value = (0.8, 0.8, 0.8, 1)
    return arm, high


def tris_of(ob): return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def decimated(src, target, name):
    ob = src.copy(); ob.data = src.data.copy(); ob.name = name; bpy.context.scene.collection.objects.link(ob)
    for md in list(ob.modifiers): ob.modifiers.remove(md)
    d = ob.modifiers.new('dec', 'DECIMATE'); d.decimate_type = 'COLLAPSE'; d.ratio = max(0.002, min(1.0, target / max(1, tris_of(ob)))); d.use_collapse_triangulate = True
    with ctx(ob, [ob]): bpy.ops.object.modifier_apply(modifier='dec')
    return ob


def add_armature(ob, arm):
    md = ob.modifiers.new('arm', 'ARMATURE'); md.object = arm; return md


def smart_uv(ob):
    for l in list(ob.data.uv_layers): ob.data.uv_layers.remove(l)
    ob.data.uv_layers.new(name='bake'); ob.data.uv_layers.active_index = 0
    with ctx(ob, [ob]):
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(80), island_margin=0.01, area_weight=0.0, correct_aspect=True, scale_to_bounds=True)
        bpy.ops.object.mode_set(mode='OBJECT')


def bake_target(ob, img):
    for i in range(len(ob.data.materials)): ob.data.materials[i] = None
    ob.data.materials.clear()
    m = bpy.data.materials.new('bake_' + ob.name); m.use_nodes = True; nt = m.node_tree
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; nt.nodes.active = t
    ob.data.materials.append(m)


def bake(high, low, img):
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 4
    sc.render.bake.use_selected_to_active = True; sc.render.bake.cage_extrusion = 0.02; sc.render.bake.max_ray_distance = 0.08; sc.render.bake.margin = 8
    for o in sc.objects: o.select_set(False)
    high.select_set(True); low.select_set(True); bpy.context.view_layer.objects.active = low
    for m in low.data.materials: m.node_tree.nodes.active = next(n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE')
    with ctx(low, [high, low]): bpy.ops.object.bake(type='EMIT', use_selected_to_active=True, margin=8, use_clear=True)


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
    zone = [v for v in vs if abs(v.x) < 0.22 and hip.y - 0.3 < v.y < knee.y - 0.12 and v.z < hip.z + 0.05]
    bottom = min(v.z for v in zone); rear = min(v.y for v in zone if v.z < bottom + 0.12)
    T = Vector((0.0, BACK_Z + P.get('slide', 0.0) - rear, SEAT_Y - bottom))
    # 腳：鞋底不能低於地面（小腿往前伸）；離地太高就讓腳尖往下（坐高的椅子腳懸空一點點可以接受）
    for s in ('L', 'R'):
        for _ in range(12):
            ank = H(arm, S + s + '_Foot'); sole = ank.z + T.z - foot_h
            if sole >= 0.004: break
            k = H(arm, S + s + '_LowerLeg'); Ls = (ank - k).length
            want = min(1.0, (k.z + T.z - foot_h - 0.006) / Ls); cur_phi = math.acos(max(-1, min(1, (k.z - ank.z) / Ls)))
            phi = math.acos(max(0.17, want)); rot_bone(arm, S + s + '_LowerLeg', Quaternion((1, 0, 0), phi - cur_phi))   # 繞 +X 正轉：往下的小腿，下端往前（+Y）
        aim(arm, S + s + '_Foot', S + s + '_ToeBase', (0.0, 1.0, -0.59))
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
    info = {'bases': {}, 'meshes': {}, 'note': '原點＝座位的地面中心（和 furniture_study.glb 的講堂椅同一個原點）、+z 朝前（講台）。每個網格一個配色；共用一個材質 seated_fig（貼圖集 512×512 一格）。'}
    bases = [b for b in BASES if not ONLY or b == ONLY]
    store = {}
    for bi, base in enumerate(bases):
        arm, high = import_base(base)
        th = tris_of(high)
        low0 = decimated(high, LOD0_TRIS, 'LOW0'); smart_uv(low0)
        low1 = decimated(low0, LOD1_TRIS, 'LOW1')
        add_armature(low0, arm); add_armature(low1, arm)
        for ci, col in enumerate(COLORS[base]):
            for m in high.data.materials:
                if not m: continue
                fac = [1, 1, 1]
                for k, pat in TINT_PAT.items():
                    if pat.lower() in m.name.lower(): fac = tint_factor(k, col[k]); break
                m.node_tree.nodes['TINT'].inputs[7].default_value = (*fac, 1)
            img = bpy.data.images.new(f'{base}_c{ci}', REG, REG, alpha=False)
            bake_target(low0, img); bake(high, low0, img)
            img.filepath_raw = os.path.join(TMP, f'{base}_c{ci}.png'); img.file_format = 'PNG'; img.save()
        pose_reset(arm)
        for pose in POSES:
            T = apply_pose(arm, high, pose)
            for lod, low in ((0, low0), (1, low1)):
                ob = posed_copy(low, arm, T, f'fig_{base}_{pose}' + ('_lod1' if lod else ''))
                me = ob.data; uv = me.uv_layers.active
                store[(base, pose, lod)] = dict(verts=[tuple(v.co) for v in me.vertices], polys=[tuple(p.vertices) for p in me.polygons],
                                                 uvs=[tuple(uv.data[li].uv) for p in me.polygons for li in p.loop_indices] if uv else None, tris=tris_of(ob))
        info['bases'][base] = {'high_tris': th, 'lod0_tris': tris_of(low0), 'lod1_tris': tris_of(low1), 'colors': COLORS[base]}
        print('base', base, 'high', th, 'lod0', tris_of(low0), 'lod1', tris_of(low1), flush=True)
    # 貼圖集：(底模 index×2＋配色) 一格，4 欄
    from PIL import Image
    n = len(bases) * 2; cols = 4; rows = (n + cols - 1) // cols
    atlas = Image.new('RGB', (cols * REG, rows * REG), (128, 128, 128))
    for bi, base in enumerate(bases):
        for ci in range(2):
            r = bi * 2 + ci; atlas.paste(Image.open(os.path.join(TMP, f'{base}_c{ci}.png')).convert('RGB'), ((r % cols) * REG, (r // cols) * REG))
    apath = os.path.join(TMP, 'seated_atlas.png'); atlas.save(apath)
    # 輸出：新場景、每個（底模×姿勢×配色×LOD）一個物件、共用材質
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mat = bpy.data.materials.new('seated_fig'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(apath); t.image.pack()
    nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color']); bsdf.inputs['Roughness'].default_value = 0.85
    root = bpy.data.objects.new('seated_figures', None); bpy.context.scene.collection.objects.link(root)
    k = 0
    for bi, base in enumerate(bases):
        for pose in POSES:
            for ci in range(2):
                r = bi * 2 + ci; c0, r0 = r % cols, r // cols
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
    import subprocess   # 兩種配色的網格共用頂點與索引（只有 UV 不同）
    print(subprocess.check_output(['python3', os.path.join(HERE, 'glb_share_geometry.py'), out]).decode().strip())
    info['bytes'] = os.path.getsize(out); info['atlas'] = os.path.relpath(apath, ROOT)
    info['seat'] = {'origin': '座位地面中心', 'seat_y': SEAT_Y, 'back_z': BACK_Z, 'desk': 'lecture_desk：z 0.30–0.64、高 0.75'}
    info['poses'] = {k: v for k, v in POSES.items()}
    with open(out[:-4] + '.json', 'w', encoding='utf-8') as f: json.dump(info, f, ensure_ascii=False, indent=1)
    print(json.dumps({'out': OUT, 'bytes': info['bytes'], 'meshes': k}, ensure_ascii=False))


if __name__ == '__main__':
    build()
