"""Blender 人物製作的共用工具（bpy 5.2.2＋VRM Add-on for Blender）。
人物用 Blender 做：臉的立體結構、髮型（新的髮片網格）、衣服（新的網格）、頭身比；骨架、表情（shape key）、彈簧骨沿用 VRoid 樣本，
匯出 VRM 0.x 給遊戲（three-vrm）用。座標：Blender Z 朝上、人物面向 -Y（VRM Add-on 匯入時轉好的）。

環境（一次性）：VRM Add-on for Blender（https://github.com/saturday06/VRM-Addon-for-Blender，MIT／GPL-3.0 雙授權，工具不放進 repo）
  git clone --depth 1 https://github.com/saturday06/VRM-Addon-for-Blender.git /opt/vrmaddon/src
  ln -sfn /opt/vrmaddon/src/src/io_scene_vrm ~/.config/blender/5.2/scripts/addons/io_scene_vrm
執行：/opt/blenv/bin/python tools/blender/char/<腳本>.py -- <參數>
注意：腳本檔名不要和 Python 標準模組同名（例如 inspect.py 會讓 bpy 載入兩次而當掉）。"""
import bpy, bmesh, addon_utils, math, os, sys
import numpy as np
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'tools', 'vroid_src')


def args():
    return sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def setup():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not addon_utils.enable('io_scene_vrm', default_set=True):
        raise RuntimeError('VRM Add-on for Blender 沒有安裝（見 common.py 開頭）')


def import_vrm(path):
    """匯入 VRM，回傳 {'arm','face','body','hair'}（沒有的是 None）"""
    bpy.ops.import_scene.vrm(filepath=path)
    out = {'arm': None, 'face': None, 'body': None, 'hair': None}
    for o in bpy.data.objects:
        if o.type == 'ARMATURE': out['arm'] = o
        elif o.type == 'MESH':
            n = o.name.lower()
            if n.startswith('face'): out['face'] = o
            elif n.startswith('body'): out['body'] = o
            elif n.startswith('hair'): out['hair'] = o
    return out


def ext(arm):
    return arm.data.vrm_addon_extension.vrm0


def export_vrm(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    r = bpy.ops.export_scene.vrm(filepath=path)
    if 'FINISHED' not in r: raise RuntimeError('VRM 匯出失敗 %s' % r)
    return os.path.getsize(path)


def activate(obj, mode='OBJECT'):
    if bpy.context.object and bpy.context.object.mode != 'OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
    for o in bpy.context.view_layer.objects: o.select_set(False)
    bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    if mode != 'OBJECT': bpy.ops.object.mode_set(mode=mode)


# ---------------- 頂點（含 shape key）----------------
def co(obj, key=None):
    """頂點座標（N×3）；key＝shape key 名稱（None＝目前的網格／Basis）"""
    me = obj.data
    if key is None or me.shape_keys is None:
        a = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', a); return a.reshape(-1, 3)
    kb = me.shape_keys.key_blocks[key]; a = np.empty(len(kb.data) * 3); kb.data.foreach_get('co', a); return a.reshape(-1, 3)


def set_co(obj, P, key=None):
    me = obj.data
    if key is None:
        me.vertices.foreach_set('co', P.reshape(-1).astype(np.float64))
        if me.shape_keys: me.shape_keys.reference_key.data.foreach_set('co', P.reshape(-1).astype(np.float64))
    else:
        me.shape_keys.key_blocks[key].data.foreach_set('co', P.reshape(-1).astype(np.float64))
    me.update()


def warp(obj, fn):
    """所有 shape key（含 Basis）一起套同一個空間變形 fn(P: N×3, basis: N×3) → N×3。
    fn 是平滑的空間函數時，表情的位移也跟著變形（眨眼、嘴型照樣對得上新的臉）。basis 給 fn 用來做「依 Basis 位置決定權重」的變形。"""
    me = obj.data; B = co(obj)
    if me.shape_keys is None:
        set_co(obj, fn(B.copy(), B)); return
    keys = [k.name for k in me.shape_keys.key_blocks]; ref = me.shape_keys.reference_key.name
    new = {k: fn(co(obj, k).copy(), B) for k in keys}
    for k in keys:
        if k != ref: set_co(obj, new[k], k)
    set_co(obj, new[ref])


def vgroup_weights(obj, names):
    """每個頂點在 names（vertex group 名稱集合）上的權重總和（N,）"""
    idx = {g.index for g in obj.vertex_groups if g.name in names}; w = np.zeros(len(obj.data.vertices))
    for v in obj.data.vertices:
        for g in v.groups:
            if g.group in idx: w[v.index] += g.weight
    return w


def delete_faces(obj, pred_mask):
    """刪掉 pred_mask[i] 為 True 的面（i＝polygon index）；沒有被任何面用到的頂點一起刪"""
    activate(obj, 'EDIT'); bm = bmesh.from_edit_mesh(obj.data); bm.faces.ensure_lookup_table()
    kill = [f for f in bm.faces if pred_mask[f.index]]
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bmesh.update_edit_mesh(obj.data); bpy.ops.object.mode_set(mode='OBJECT')
    return len(kill)


def delete_by_material(obj, pats):
    mats = [m.name if m else '' for m in obj.data.materials]
    mask = np.array([any(p in mats[p_.material_index] for p in pats) for p_ in obj.data.polygons])
    n = delete_faces(obj, mask) if mask.any() else 0
    # 用不到的材質槽拿掉
    activate(obj); bpy.ops.object.material_slot_remove_unused()
    return n


def extract_by_material(obj, pats, name, drop_groups_prefix=None):
    """複製一份 obj，只留材質名稱含 pats 的面（例：VRoid 原本的上衣 'Tops'），當作新衣服的權重來源；
    drop_groups_prefix：頂點權重有一半以上在這些骨頭（例 'J_Sec_'：帽兜、抽繩）上的面也拿掉"""
    o = obj.copy(); o.data = obj.data.copy(); o.name = name
    (obj.users_collection[0] if obj.users_collection else bpy.context.scene.collection).objects.link(o)
    if o.data.shape_keys is not None: o.shape_key_clear()
    mats = [m.name if m else '' for m in o.data.materials]
    keep = np.array([any(p in mats[p_.material_index] for p in pats) for p_ in o.data.polygons])
    if drop_groups_prefix:
        names = [g.name for g in o.vertex_groups]; sec = np.zeros(len(o.data.vertices))
        for v in o.data.vertices:
            sec[v.index] = sum(g.weight for g in v.groups if names[g.group].startswith(drop_groups_prefix))
        keep &= np.array([not all(sec[i] > 0.5 for i in p_.vertices) for p_ in o.data.polygons])
    delete_faces(o, ~keep)
    return o


# ---------------- 骨頭 ----------------
def descendants(arm, name):
    b = arm.data.bones[name]; out = []
    def rec(x):
        for c in x.children: out.append(c.name); rec(c)
    rec(b); return out


def remove_bones(arm, names):
    names = [n for n in names if n in arm.data.bones]
    if not names: return 0
    activate(arm, 'EDIT'); eb = arm.data.edit_bones
    for n in names:
        if n in eb: eb.remove(eb[n])
    bpy.ops.object.mode_set(mode='OBJECT')
    return len(names)


def prune_springs(arm):
    """彈簧骨群組裡指到已刪除骨頭的項目拿掉；空的群組拿掉"""
    sec = ext(arm).secondary_animation; bones = set(arm.data.bones.keys())
    for gi in range(len(sec.bone_groups) - 1, -1, -1):
        g = sec.bone_groups[gi]
        for bi in range(len(g.bones) - 1, -1, -1):
            if g.bones[bi].bone_name not in bones: g.bones.remove(bi)
        if len(g.bones) == 0: sec.bone_groups.remove(gi)


def bone_head(arm, name):
    return np.array(arm.data.bones[name].head_local)


def add_bone_chain(arm, prefix, pts, parent):
    """沿著點 pts（世界座標，人物在原點）建一條骨頭鏈 prefix1..n（最後一點是末端），掛在 parent 下。回傳骨頭名稱"""
    activate(arm, 'EDIT'); eb = arm.data.edit_bones; names = []; prev = eb[parent]
    for i in range(len(pts) - 1):
        b = eb.new('%s%d' % (prefix, i + 1)); b.head = Vector(pts[i]); b.tail = Vector(pts[i + 1]); b.parent = prev
        b.use_connect = i > 0; b.use_deform = True; prev = b; names.append(b.name)
    bpy.ops.object.mode_set(mode='OBJECT')
    return names


def add_spring_group(arm, comment, roots, stiffness=0.6, gravity=0.3, drag=0.4, hit_radius=0.02, colliders=None, gravity_dir=(0, 0, -1)):
    sec = ext(arm).secondary_animation; g = sec.bone_groups.add()
    g.comment = comment; g.stiffiness = stiffness; g.gravity_power = gravity; g.gravity_dir = gravity_dir; g.drag_force = drag; g.hit_radius = hit_radius
    for r in roots: b = g.bones.add(); b.bone_name = r
    for cg in sec.collider_groups:
        if colliders is None or cg.node.bone_name in colliders:
            c = g.collider_groups.add(); c.collider_group_uuid = cg.uuid
    return g


# ---------------- 頭身比 ----------------
def scale_head(arm, meshes, s, extra_bones=()):
    """頭（Head 骨以下的骨頭、臉、頭髮、眼睛、頭的碰撞球）以 Head 關節為中心縮放 s；
    頂點依「綁在 Head 與它子孫骨頭上的權重」漸變（脖子不會斷開）。shape key 一起縮。回傳 Head 關節位置"""
    H = bone_head(arm, 'J_Bip_C_Head'); fam = {'J_Bip_C_Head'} | set(descendants(arm, 'J_Bip_C_Head')) | set(extra_bones)
    for o in meshes:
        if o is None: continue
        w = np.clip(vgroup_weights(o, fam), 0, 1)
        warp(o, lambda P, B: H + (P - H) * (1 - (1 - s) * w)[:, None])
    activate(arm, 'EDIT'); eb = arm.data.edit_bones
    for n in fam:
        if n not in eb: continue
        b = eb[n]
        if n != 'J_Bip_C_Head': b.head = Vector(H + (np.array(b.head) - H) * s)
        b.tail = Vector(H + (np.array(b.tail) - H) * s)
    bpy.ops.object.mode_set(mode='OBJECT')
    # 碰撞球（掛在頭骨下的 empty）
    for cg in ext(arm).secondary_animation.collider_groups:
        if cg.node.bone_name in fam:
            for c in cg.colliders:
                ob = c.bpy_object
                if ob is None: continue
                ob.location = ob.location * s; ob.empty_display_size *= s
    fp = ext(arm).first_person
    fp.first_person_bone_offset = tuple(x * s for x in fp.first_person_bone_offset)
    return H



# ---------------- 不同身形共用參數（v9.4 人物生產線）----------------
LANDMARK_BONES = (('knee', 'J_Bip_L_LowerLeg'), ('hip', 'J_Bip_L_UpperLeg'), ('spine', 'J_Bip_C_Spine'), ('chest', 'J_Bip_C_Chest'),
                  ('upper', 'J_Bip_C_UpperChest'), ('neck', 'J_Bip_C_Neck'), ('head', 'J_Bip_C_Head'))


def landmarks(arm):
    """人物的高度地標（骨頭關節）與肩寬、胯寬：服裝、臉的參數是照沈以安寫的，其他人物用 BodyMap 對到沈以安的比例"""
    L = {k: float(bone_head(arm, b)[2]) for k, b in LANDMARK_BONES}
    L['sh_x'] = abs(float(bone_head(arm, 'J_Bip_L_UpperArm')[0])); L['hip_x'] = abs(float(bone_head(arm, 'J_Bip_L_UpperLeg')[0]))
    return L


class BodyMap:
    """人物空間 ↔ 參考空間（沈以安）的對應：高度照地標分段線性（地面、膝、胯、脊椎、胸、上胸、脖子、頭、頭頂），
    左右與前後照肩寬（上身）／胯寬（下身）縮放，中間內插。分段線性、可逆：在參考空間做衣服，再整件轉回人物空間"""
    KEYS = ('knee', 'hip', 'spine', 'chest', 'upper', 'neck', 'head')

    def __init__(self, cur, ref):
        self.zc = np.array([0.0] + [cur[k] for k in self.KEYS] + [cur['head'] + 0.4])
        self.zr = np.array([0.0] + [ref[k] for k in self.KEYS] + [ref['head'] + 0.4 * (ref['head'] - ref['neck']) / (cur['head'] - cur['neck'])])
        self.s_up = ref['sh_x'] / cur['sh_x']; self.s_lo = ref['hip_x'] / cur['hip_x']; self.zh = ref['hip']; self.zch = ref['chest']

    def _s(self, zr):
        t = np.clip((zr - self.zh) / (self.zch - self.zh), 0, 1); return self.s_lo + (self.s_up - self.s_lo) * t

    def fwd(self, P):
        P = np.asarray(P, float); Q = P.copy().reshape(-1, 3); Q[:, 2] = np.interp(Q[:, 2], self.zc, self.zr); s = self._s(Q[:, 2])
        Q[:, 0] *= s; Q[:, 1] *= s; return Q.reshape(P.shape)

    def inv(self, Q):
        Q = np.asarray(Q, float); P = Q.copy().reshape(-1, 3); s = self._s(P[:, 2])
        P[:, 0] /= s; P[:, 1] /= s; P[:, 2] = np.interp(P[:, 2], self.zr, self.zc); return P.reshape(Q.shape)


def warp_world(obj, fn):
    """warp，但 fn 在世界座標上算（Face／Body 物件本身有 180° 旋轉）"""
    M = np.array(obj.matrix_world); R = M[:3, :3]; t = M[:3, 3]; Ri = np.linalg.inv(R)
    warp(obj, lambda P, B: (fn(P @ R.T + t) - t) @ Ri.T)

# ---------------- 權重 ----------------
def transfer_weights(dst, src, limit=4, exclude=()):
    """dst（新做的衣服、頭髮）從 src（身體）拿骨頭權重：Blender Data Transfer（最近的面、內插），之後每個頂點最多 limit 根骨頭、正規化"""
    for g in list(dst.vertex_groups): dst.vertex_groups.remove(g)
    activate(dst); m = dst.modifiers.new('wt', 'DATA_TRANSFER'); m.object = src
    m.use_vert_data = True; m.data_types_verts = {'VGROUP_WEIGHTS'}; m.vert_mapping = 'POLYINTERP_NEAREST'
    m.layers_vgroup_select_src = 'ALL'; m.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.datalayout_transfer(modifier=m.name)
    bpy.ops.object.modifier_apply(modifier=m.name)
    for n in exclude:
        if n in dst.vertex_groups: dst.vertex_groups.remove(dst.vertex_groups[n])
    bpy.ops.object.vertex_group_limit_total(limit=limit); bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    used = {x.group for v in dst.data.vertices for x in v.groups if x.weight > 1e-5}
    for g in list(dst.vertex_groups):   # 空的群組拿掉
        if g.index not in used: dst.vertex_groups.remove(g)
    return len(dst.vertex_groups)


def bind(obj, arm, groups_weights=None):
    """新物件掛到骨架下（armature modifier）；groups_weights＝{骨頭: 權重陣列或常數}（直接指定權重時用）"""
    obj.parent = arm; obj.matrix_parent_inverse = Matrix()
    if not any(m.type == 'ARMATURE' for m in obj.modifiers):
        m = obj.modifiers.new('Armature', 'ARMATURE'); m.object = arm
    if groups_weights:
        n = len(obj.data.vertices)
        for bone, w in groups_weights.items():
            g = obj.vertex_groups.get(bone) or obj.vertex_groups.new(name=bone)
            w = np.broadcast_to(np.asarray(w, float), (n,))
            for i in np.nonzero(w > 1e-4)[0]: g.add([int(i)], float(w[i]), 'REPLACE')


# ---------------- 材質 ----------------
def mtoon_from(template_name, new_name, base_img=None, shade_img=None, alpha='OPAQUE', cutoff=0.5, double_sided=False, outline=None):
    """複製一個現有的 MToon 材質（保留陰影、描邊等設定），換貼圖。alpha：OPAQUE／MASK／BLEND"""
    src = bpy.data.materials[template_name]; m = src.copy(); m.name = new_name; e = m.vrm_addon_extension.mtoon1
    if base_img is not None: e.pbr_metallic_roughness.base_color_texture.index.source = base_img
    if shade_img is not None or base_img is not None:
        e.extensions.vrmc_materials_mtoon.shade_multiply_texture.index.source = shade_img or base_img
    e.alpha_mode = alpha; e.alpha_cutoff = cutoff; e.double_sided = double_sided
    if outline is not None: e.extensions.vrmc_materials_mtoon.outline_width_factor = outline
    return m


def image_from_array(name, rgba, path=None):
    """numpy H×W×4（0..1，第 0 列是圖片最上面）→ bpy 影像（打包進 .blend／匯出）"""
    h, w = rgba.shape[:2]; img = bpy.data.images.new(name, w, h, alpha=True)
    img.pixels.foreach_set(np.ascontiguousarray(rgba[::-1].reshape(-1).astype(np.float32)))
    if path: img.filepath_raw = path; img.file_format = 'PNG'; img.save()
    img.pack(); return img


# ---------------- 預覽算圖（Blender 驗收圖；最後驗收一律用遊戲截圖）----------------
def render_views(out_prefix, views=('face_front', 'face_q45', 'face_side', 'body_front', 'body_q45', 'body_back'), res=(480, 600), head_z=1.52, height=1.66):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.film_transparent = False
    sc.view_settings.view_transform = 'Standard'
    if sc.world is None: sc.world = bpy.data.worlds.new('w')
    sc.world.use_nodes = True; bg = sc.world.node_tree.nodes.get('Background'); bg.inputs[0].default_value = (0.79, 0.78, 0.75, 1); bg.inputs[1].default_value = 0.9
    if 'key' not in bpy.data.objects:
        L = bpy.data.lights.new('key', 'SUN'); L.energy = 3.0; ob = bpy.data.objects.new('key', L); sc.collection.objects.link(ob); ob.rotation_euler = (math.radians(50), 0, math.radians(-30))
    cam = bpy.data.objects.get('cam') or bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    if cam.name not in sc.collection.objects: sc.collection.objects.link(cam)
    sc.camera = cam
    V = {'face_front': (0, -0.9, head_z, 0), 'face_q45': (0.64, -0.64, head_z, 0), 'face_side': (0.9, 0, head_z, 0),
         'body_front': (0, -4.0, height * 0.55, 1), 'body_q45': (2.83, -2.83, height * 0.55, 1), 'body_side': (4.0, 0, height * 0.55, 1), 'body_back': (0, 4.0, height * 0.55, 1)}
    outs = []
    for vname in views:
        x, y, z, body = V[vname]; cam.location = (x, y, z); cam.data.lens = 50 if body else 85
        tgt = Vector((0, 0, height * 0.5 if body else head_z - 0.02)); d = tgt - cam.location
        cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        f = '%s_%s.png' % (out_prefix, vname); sc.render.filepath = f; bpy.ops.render.render(write_still=True); outs.append(f)
    return outs
