"""Blender 建模共用工具（tools/blender/*.py 用）：材質（Poly Haven PBR）、遊戲座標的方塊／面／管、世界座標盒狀 UV、
同材質合併、GPU instancing 實例、GLB 匯出、EEVEE 預覽渲染。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)（glTF 匯出 +Y up 會轉回遊戲座標）。"""
import bpy, bmesh, json, math, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'textures')
_S = {'texres': 512, 'imgs': {}}


def reset(texres=512):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _S['texres'] = texres; _S['imgs'] = {}


def scene(): return bpy.context.scene
def g2b(x, y, z): return Vector((x, -z, y))


def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)


def img(path):
    if path not in _S['imgs']:
        im = bpy.data.images.load(path); r = _S['texres']
        if r and max(im.size) > r: im.scale(r, r)
        _S['imgs'][path] = im
    return _S['imgs'][path]


def img_adj(path, sat=1.0, gain=1.0):
    """顏色貼圖的調整版（降低彩度、調亮暗）：另外產生一張圖（glTF 匯出不帶 Hue/Saturation 節點，要把調整做進像素）"""
    key = (path, round(sat, 3), round(gain, 3))
    if key not in _S['imgs']:
        import numpy as np
        src = img(path); w, h = src.size; px = np.empty(w * h * 4, dtype=np.float32); src.pixels.foreach_get(px); px = px.reshape(-1, 4)
        lum = px[:, :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        px[:, :3] = (lum[:, None] + (px[:, :3] - lum[:, None]) * sat) * gain
        im = bpy.data.images.new(f'{os.path.basename(path)[:-4]}_s{sat:g}_g{gain:g}', w, h, alpha=False); im.pixels.foreach_set(np.clip(px, 0, 1).ravel())
        _S['imgs'][key] = im
    return _S['imgs'][key]


def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8, sat=None, gain=1.0, cull=False):
    """Principled BSDF：Poly Haven 的顏色（乘上 tint；sat／gain＝先降低彩度、調亮暗）、粗糙度、法線（OpenGL）；沒有 pid 就是純色材質"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = metal; m['tile'] = tile
    if pid:
        base = os.path.join(TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = img_adj(base + '_diff_1k.jpg', 1.0 if sat is None else sat, gain) if (sat is not None or gain != 1.0) else img(base + '_diff_1k.jpg')
        if tint:
            mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
            Lk.new(tc.outputs['Color'], mix.inputs[6]); mix.inputs[7].default_value = (*tint, 1.0); Lk.new(mix.outputs[2], bsdf.inputs['Base Color'])
        else: Lk.new(tc.outputs['Color'], bsdf.inputs['Base Color'])
        if os.path.exists(base + '_rough_1k.jpg'):
            tr = N.new('ShaderNodeTexImage'); tr.image = img(base + '_rough_1k.jpg'); tr.image.colorspace_settings.name = 'Non-Color'; Lk.new(tr.outputs['Color'], bsdf.inputs['Roughness'])
        if os.path.exists(base + '_nor_gl_1k.jpg'):
            tn = N.new('ShaderNodeTexImage'); tn.image = img(base + '_nor_gl_1k.jpg'); tn.image.colorspace_settings.name = 'Non-Color'
            nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal; Lk.new(tn.outputs['Color'], nm.inputs['Color']); Lk.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    else:
        bsdf.inputs['Base Color'].default_value = (*(tint or (0.8, 0.8, 0.8)), 1.0)
        if rough is not None: bsdf.inputs['Roughness'].default_value = rough
    if alpha is not None:
        bsdf.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    if emit: bsdf.inputs['Emission Color'].default_value = (*emit, 1.0); bsdf.inputs['Emission Strength'].default_value = 1.0
    m.use_backface_culling = cull   # glTF doubleSided＝not cull（外牆只從外面看：單面，少畫一半）
    return m


def box_uv(bm, tile):
    """世界座標的盒狀投影 UV（每 tile 公尺重複一次；依每個面的法線選投影平面）：磚縫、地磚和真實尺寸對得上"""
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for lp in f.loops:
            co = lp.vert.co
            u, v = (co.y, co.z) if ax == 0 else ((co.x, co.z) if ax == 1 else (co.x, co.y))
            lp[uv].uv = (u / tile, v / tile)


def mesh_obj(name, bm, mat, parent=None, props=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); scene().collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob


def group(name, parent=None, props=None):
    ob = bpy.data.objects.new(name, None); scene().collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob


def box(name, mat, x0, x1, y0, y1, z0, z1, parent=None, bevel=0.0, props=None):
    """遊戲座標的軸對齊方塊"""
    bm = bmesh.new(); a = g2b(min(x0, x1), min(y0, y1), max(z0, z1)); b = g2b(max(x0, x1), max(y0, y1), min(z0, z1))
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((a.x if v.co.x < 0 else b.x, a.y if v.co.y < 0 else b.y, a.z if v.co.z < 0 else b.z))
    if bevel > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    bm.normal_update(); box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return mesh_obj(name, bm, mat, parent, props)


def quad(name, mat, pts, parent=None, tile=None):
    """四個遊戲座標的點 → 一個面（從正面看逆時針）"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in pts]; bm.faces.new(vs); bm.normal_update(); box_uv(bm, tile or (mat['tile'] if 'tile' in mat else 1.0))
    return mesh_obj(name, bm, mat, parent)


def cyl(name, mat, a, b, r, parent=None, seg=10):
    pa, pb = g2b(*a), g2b(*b); d = pb - pa
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()); bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot.to_matrix()); bmesh.ops.translate(bm, verts=bm.verts, vec=(pa + pb) / 2)
    bm.normal_update(); box_uv(bm, 1.0)
    return mesh_obj(name, bm, mat, parent)


def _combine(objs, name):
    """多個物件（各一個材質）→ 一個網格（多個材質槽）"""
    mats = []
    for ob in objs:
        m = ob.data.materials[0]
        if m not in mats: mats.append(m)
        k = mats.index(m)
        for p in ob.data.polygons: p.material_index = k
    bm = bmesh.new()
    for ob in objs: bm.from_mesh(ob.data)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    return me


def join_children(grp, name):
    objs = [o for o in grp.children if o.type == 'MESH']; me = _combine(objs, name)
    for o in objs: bpy.data.meshes.remove(o.data)
    return me


def instance(mesh, name, x, y, z, parent=None, ry=0.0):
    """共用同一個網格的實例（匯出 GLB 時用 EXT_mesh_gpu_instancing：三角形只存一次、一次 draw call）"""
    ob = bpy.data.objects.new(name, mesh); scene().collection.objects.link(ob); ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry)
    if parent: ob.parent = parent
    return ob


def remove(ob):
    for c in list(ob.children): remove(c)
    if ob.type == 'MESH' and ob.data and ob.data.users <= 1: me = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    else: bpy.data.objects.remove(ob)


def join_by_material(parent, prefix, keep=lambda ob: False):
    """同一個父節點底下、同材質的物件合併成一個（減少 draw call）；keep(ob) 為真的不動（會淡出的牆、實例）"""
    groups = {}
    for ob in list(parent.children):
        if ob.type != 'MESH' or keep(ob) or len(ob.data.materials) != 1: continue
        groups.setdefault(ob.data.materials[0].name, []).append(ob)
    for mname, obs in groups.items():
        if len(obs) < 2: continue
        me = _combine(obs, f'{prefix}_{mname}')
        for ob in obs: bpy.data.meshes.remove(ob.data)
        ob = bpy.data.objects.new(f'{prefix}_{mname}', me); scene().collection.objects.link(ob); ob.parent = parent


def stats():
    objs = [o for o in scene().objects if o.type == 'MESH']; meshes = {o.data.name: o.data for o in objs}
    return {'objects': len(objs), 'unique_meshes': len(meshes), 'tris': sum(sum(len(p.vertices) - 2 for p in m.polygons) for m in meshes.values()),
            'tris_drawn': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in objs), 'materials': len(bpy.data.materials)}


def export(out, root_dir, gpu_instances=False):
    for ob in scene().objects:
        if ob.type == 'MESH':
            for p in ob.data.polygons: p.use_smooth = False
    os.makedirs(os.path.dirname(out), exist_ok=True)
    st = stats()
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='WEBP', export_image_quality=82, export_yup=True, export_apply=True,
                              export_extras=True, export_materials='EXPORT', export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False,
                              export_gpu_instances=gpu_instances)
    st.update({'out': os.path.relpath(out, root_dir), 'bytes': os.path.getsize(out), 'texres': _S['texres']})
    print(json.dumps(st, ensure_ascii=False)); return st


def render_views(outdir, prefix, views, lights=(), lens=18, res=(1280, 800)):
    """EEVEE 預覽渲染（給報告：Blender 模型渲染圖）：views＝[(名稱, 眼睛, 看的點)]（遊戲座標）"""
    os.makedirs(outdir, exist_ok=True); sc = scene()
    sc.render.engine = 'BLENDER_EEVEE'; sc.render.resolution_x, sc.render.resolution_y = res; sc.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True; bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.75, 0.8, 0.86, 1); bg.inputs['Strength'].default_value = 0.6
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun); sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(200))
    for (x, y, z, e) in lights:
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.location = g2b(x, y, z); sc.collection.objects.link(lt)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens
    outs = []
    for name, eye, look in views:
        cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(outdir, f'blender_{prefix}_{name}.png'); bpy.ops.render.render(write_still=True); outs.append(sc.render.filepath); print('render', sc.render.filepath)
    return outs
