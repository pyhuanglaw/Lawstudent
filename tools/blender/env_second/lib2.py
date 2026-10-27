"""第二 AI 工作階段（環境美術）的 Blender 共用工具：建在 tools/blender/b3lib.py 之上（只讀、不修改它）。
- 自己的貼圖資料夾 tools/blender/env_second/textures/<id>/（Poly Haven CC0；fetch() 下載），
  找不到時用共用的 tools/blender/textures/<id>/（霖澤館那邊已經下載的）。
- 座標同 b3lib：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)。建築模型用「建築自己的座標」：正面朝 +z、原點在正面中央地面
  （和 TK.apartment 一樣；遊戲整合時直接掛在套件建築的 group 底下，見 zones3d.js 的 attachExterior）。"""
import json, os, subprocess, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import b3lib as B   # noqa: E402
import bpy, bmesh   # noqa: E402
from mathutils import Vector, Matrix   # noqa: E402

MY_TEX = os.path.join(HERE, 'textures')
SHARED_TEX = os.path.join(os.path.dirname(HERE), 'textures')
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
MAPS = {'diff': ['Diffuse'], 'nor_gl': ['nor_gl'], 'rough': ['Rough', 'rough']}


def _curl(url, dest=None):
    cmd = ['curl', '-sSfL', '--retry', '3', '--max-time', '120', url] + (['-o', dest] if dest else [])
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0: raise RuntimeError(f'{url}: {r.stderr.decode()[:200]}')
    return r.stdout


def fetch(pid, res='1k'):
    """Poly Haven（CC0）顏色／法線／粗糙度 1k JPG → env_second/textures/<pid>/（已經有就不重抓；共用資料夾有也不抓）"""
    if os.path.isdir(os.path.join(SHARED_TEX, pid)): return 'shared'
    d = os.path.join(MY_TEX, pid); os.makedirs(d, exist_ok=True)
    info = None; got = []
    for short, keys in MAPS.items():
        dest = os.path.join(d, f'{pid}_{short}_{res}.jpg')
        if os.path.exists(dest) and os.path.getsize(dest) > 1000: got.append(short); continue
        if info is None: info = json.loads(_curl(f'https://api.polyhaven.com/files/{pid}'))
        node = next((info[k] for k in keys if k in info), None)
        if not node or res not in node or 'jpg' not in node[res]: continue
        _curl(node[res]['jpg']['url'], dest); got.append(short)
    return got


def tex_dir(pid):
    return MY_TEX if os.path.isdir(os.path.join(MY_TEX, pid)) else SHARED_TEX


def pbr(name, pid=None, maps=('diff', 'rough', 'nor'), res=None, rough_value=0.7, **kw):
    """b3lib.pbr，貼圖從自己的資料夾（或共用資料夾）讀。
    maps：要用哪幾張（diff 顏色、rough 粗糙度、nor 法線）——遠處或次要的材質只留顏色，GLB 小很多；
    res：這個材質的貼圖解析度（比全域 texres 小時另外縮一份，例如 256）"""
    if pid: B.TEX = tex_dir(pid)
    m = B.pbr(name, pid, **kw)
    if not pid: return m
    nt = m.node_tree; N = nt.nodes; bsdf = N['Principled BSDF']
    for n in list(N):
        if n.type != 'TEX_IMAGE' or not n.image: continue
        nm = n.image.name
        if '_nor_gl_' in nm and 'nor' not in maps:
            for l in list(n.outputs['Color'].links):
                nmap = l.to_node
                if nmap.type == 'NORMAL_MAP': N.remove(nmap)
            N.remove(n); continue
        if '_rough_' in nm and 'rough' not in maps:
            N.remove(n); bsdf.inputs['Roughness'].default_value = rough_value; continue
        r = res or B._S['texres']
        if max(n.image.size) > r or n.image.filepath:   # 從檔案讀的圖：匯出器會直接拿原始 1k 檔，所以一律換成記憶體裡縮好的版本
            key = (nm, r); res_ = r
            if key not in _SMALL:
                src = n.image; noncolor = src.colorspace_settings.name == 'Non-Color'
                if src.filepath:   # 檔案圖：用 PIL 讀原始 JPG（Blender 改色彩空間後會丟掉縮過的像素、重讀原檔）
                    im = _img_from_file(bpy.path.abspath(src.filepath), f'{nm}_{res_}', res_, noncolor)
                else:              # 程式產生的圖（img_adj）：copy() 會變全黑，自己搬像素再縮
                    w, h = src.size; px = [0.0] * (w * h * 4); src.pixels.foreach_get(px)
                    im = bpy.data.images.new(f'{nm}_{res_}', w, h, alpha=False); im.pixels.foreach_set(px)
                    if max(w, h) > res_: im.scale(res_, res_)
                _SMALL[key] = im
            n.image = _SMALL[key]
    return m


_SMALL = {}


def _img_from_file(path, name, res, noncolor):
    import numpy as np
    from PIL import Image as PI
    im = PI.open(path).convert('RGB')
    if max(im.size) > res: im = im.resize((res, res), PI.LANCZOS)
    a = np.asarray(im, dtype=np.float32)[::-1] / 255.0          # Blender 的像素從左下角開始
    h, w = a.shape[:2]; rgba = np.concatenate([a, np.ones((h, w, 1), np.float32)], axis=2)
    bi = bpy.data.images.new(name, w, h, alpha=False)
    if noncolor: bi.colorspace_settings.name = 'Non-Color'
    bi.pixels.foreach_set(rgba.ravel()); return bi


def flat(name, hexcol, rough=0.6, metal=0.0, emit=None, alpha=None, cull=False):
    """純色材質（hex 是 sRGB 色碼）"""
    return B.pbr(name, None, tint=B.srgb(hexcol), rough=rough, metal=metal, emit=emit, alpha=alpha, cull=cull)


# ---------- 幾何：遊戲座標 ----------
def g2b(x, y, z): return Vector((x, -z, y))


def bm_box(bm, x0, x1, y0, y1, z0, z1):
    """把一個軸對齊方塊加進 bmesh（遊戲座標）；回傳新加的面"""
    a = g2b(min(x0, x1), min(y0, y1), max(z0, z1)); b = g2b(max(x0, x1), max(y0, y1), min(z0, z1))
    r = bmesh.ops.create_cube(bm, size=1.0); vs = r['verts']
    for v in vs: v.co = Vector((a.x if v.co.x < 0 else b.x, a.y if v.co.y < 0 else b.y, a.z if v.co.z < 0 else b.z))
    return list({f for v in vs for f in v.link_faces})


def rbox_bm(w, h, d, r=0.03, seg=3):
    """倒角方塊的 bmesh（Blender 座標，中心在原點）：w＝遊戲 x、h＝遊戲 y、d＝遊戲 z 的長度；r＝倒角半徑"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    r = min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)
    if r > 1e-4: bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=r, segments=seg, affect='EDGES', profile=0.5, clamp_overlap=True)
    return bm


class Mesh:
    """同一個材質的很多零件累積成一個網格（一次 draw call）；finish() 時做盒狀 UV"""
    def __init__(self, name, mat, tile=None):
        self.name, self.mat, self.bm = name, mat, bmesh.new(); self.tile = tile or (mat['tile'] if 'tile' in mat else 1.0)

    def box(self, x0, x1, y0, y1, z0, z1): bm_box(self.bm, x0, x1, y0, y1, z0, z1); return self

    def boxc(self, cx, cy, cz, w, h, d): return self.box(cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, cz - d / 2, cz + d / 2)

    def quad(self, pts):
        vs = [self.bm.verts.new(g2b(*p)) for p in pts]; self.bm.faces.new(vs); return self

    def cyl(self, a, b, r, seg=12, r2=None, caps=True):
        pa, pb = g2b(*a), g2b(*b); d = pb - pa
        res = bmesh.ops.create_cone(self.bm, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
        bmesh.ops.rotate(self.bm, verts=res['verts'], cent=(0, 0, 0), matrix=rot); bmesh.ops.translate(self.bm, verts=res['verts'], vec=(pa + pb) / 2)
        return self

    def sphere(self, c, r, seg=10, rings=6, sy=1.0):
        res = bmesh.ops.create_uvsphere(self.bm, u_segments=seg, v_segments=rings, radius=r)
        for v in res['verts']: v.co.z *= sy
        bmesh.ops.translate(self.bm, verts=res['verts'], vec=g2b(*c)); return self

    def rbox(self, x0, x1, y0, y1, z0, z1, r=0.03, seg=3):
        """倒角方塊（近景的木條、檯面、門框：直角方塊看起來像積木）"""
        bm = rbox_bm(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0), r, seg)
        self.add_bm(bm, Matrix.Translation(g2b((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))); bm.free(); return self

    def ell(self, c, rx, ry, rz, seg=14, rings=8, matrix=None):
        """橢球（遊戲座標的三個半軸）；matrix＝再套一個旋轉（Blender 座標，繞橢球中心）"""
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
        for v in bm.verts: v.co = Vector((v.co.x * rx, v.co.y * rz, v.co.z * ry))
        m = Matrix.Translation(g2b(*c)) @ (matrix if matrix is not None else Matrix.Identity(4))
        self.add_bm(bm, m); bm.free(); return self

    def add_bm(self, other, matrix=None):
        """另一個 bmesh（Blender 座標）複製進來，可以先套 matrix"""
        me = bpy.data.meshes.new('_tmp'); other.to_mesh(me)
        if matrix is not None: me.transform(matrix)
        self.bm.from_mesh(me); bpy.data.meshes.remove(me); return self

    def empty(self): return len(self.bm.faces) == 0

    def finish(self, parent=None, props=None, uv=True, smooth=False, merge=True):
        if self.empty(): self.bm.free(); return None
        if merge: bmesh.ops.remove_doubles(self.bm, verts=self.bm.verts, dist=1e-5)
        self.bm.normal_update()
        if uv: B.box_uv(self.bm, self.tile)
        ob = B.mesh_obj(self.name, self.bm, self.mat, parent, props)
        if smooth: smooth_mesh(ob)
        return ob


def lathe(profile, seg=16):
    """旋轉體（Blender 座標的 bmesh，繞 Z 軸）：profile＝[(半徑, 高度)…] 由下往上"""
    bm = bmesh.new(); rings = []
    for (r, h) in profile:
        ring = [bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), h)) for i in range(seg)]; rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((a[i], a[j], b[j], b[i]))
    if profile[0][0] > 1e-4: bm.faces.new(list(reversed(rings[0])))
    if profile[-1][0] > 1e-4: bm.faces.new(rings[-1])
    bm.normal_update(); return bm


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, indent=1)


def smooth_mesh(ob, angle=0.75):
    """平滑著色＋依角度保留硬邊（圓的東西：花盆、燈罩、桌面）"""
    me = ob.data
    for p in me.polygons: p.use_smooth = True
    try: me.set_sharp_from_angle(angle=angle)
    except Exception: pass


def export(out, gpu_instances=True):
    """匯出 GLB（和 b3lib.export 相同設定，但保留每個物件自己的平滑設定：圓的東西不會變成一格一格）"""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    st = B.stats()
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='WEBP', export_image_quality=82, export_yup=True, export_apply=True,
                              export_extras=True, export_materials='EXPORT', export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False,
                              export_gpu_instances=gpu_instances)
    st.update({'out': os.path.relpath(out, ROOT), 'bytes': os.path.getsize(out), 'texres': B._S['texres']})
    print(json.dumps(st, ensure_ascii=False)); return st


def merge_by_material(root, keep=lambda ob: False, key=lambda ob: ''):
    """把 root 底下（任何層）單一材質、不是 instancing 的網格物件，依「材質＋key(ob)」合併成一個物件（掛在 root，世界座標烘進頂點）。
    減少 draw call：一棟建築原本幾十個零件，同材質的合成一個。keep(ob) 為真的不動（招牌板面、會淡出的牆分組…）。
    instancing 的物件（多個物件共用同一個網格）不動：匯出時是 EXT_mesh_gpu_instancing。"""
    bpy.context.view_layer.update()
    groups = {}
    for ob in [o for o in root.children_recursive if o.type == 'MESH']:
        if keep(ob) or ob.data.users > 1 or len(ob.data.materials) != 1: continue
        if ob.data.materials[0] is None: print('merge_by_material：沒有材質的物件', ob.name); continue
        groups.setdefault((ob.data.materials[0].name, key(ob)), []).append(ob)
    n_before = sum(len(v) for v in groups.values()); made = 0
    for (mname, k), obs in groups.items():
        if len(obs) < 2: continue
        bm = bmesh.new()
        for ob in obs:
            me = ob.data.copy(); me.transform(ob.matrix_world); bm.from_mesh(me); bpy.data.meshes.remove(me)
        name = (k + '_' if k else '') + mname
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(obs[0].data.materials[0])
        # 自訂屬性要先轉成一般的 Python 值：IDPropertyArray 只是參照，原物件刪掉後會變成亂碼（2026-10-10 實測：WALL_back 的 dir 變成 [687033168,0,32]）
        props = {kk: (vv.to_list() if hasattr(vv, 'to_list') else (vv.to_dict() if hasattr(vv, 'to_dict') else vv)) for kk, vv in obs[0].items()} if k else {}
        for ob in obs: old = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(old)
        nob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(nob); nob.parent = root
        for kk, vv in props.items(): nob[kk] = vv
        made += 1
    print(json.dumps({'merge_by_material': {'objects_in': n_before, 'merged_into': made}}))


def auto_vc_groups(root, matte, metal, gloss=None, protect=(), skip=lambda m: False):
    """root 底下用到的所有純色材質（不透明、不發光、沒有貼圖）照金屬度／粗糙度分到頂點色材質（給 vc_consolidate）：
    金屬 > 0.1 → metal；粗糙度 < 0.5 → gloss（沒給就 matte）；其他 → matte。protect（遊戲用材質名做事的）、字牌 *FACE* 用的材質、已經是頂點色的不動。"""
    used, face = set(), set()
    for ob in [root] + list(root.children_recursive):
        if ob.type != 'MESH': continue
        for ms in ob.material_slots:
            if ms.material: (face if 'FACE' in ob.name else used).add(ms.material)
    tg = {t.name for t in (matte, metal, gloss) if t}; out = {}
    for m in used:
        if m.name in tg or m.name in protect or m in face or skip(m): continue
        fi = flat_info(m)
        if not fi or fi['color'] is None: continue
        r = m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value
        out[m.name] = metal if fi['metal'] > 0.1 else (gloss if (gloss and r < 0.5) else matte)
    return out


def atlas_small(root, out_png, mat_name, protect=(), max_tris=600, max_rep=4, cell=256, rough=0.6, keep=lambda ob: False, skip=lambda m: False, only=None, alpha=False):
    # alpha=True：只收「透明貼圖」的葉片卡（Base Color 和 Alpha 都接同一張圖，Alpha 可以經過一個 Math 節點）；貼圖集帶 alpha、材質 DITHERED、雙面
    """小的貼圖材質（店內地板、條紋雨遮、菜單、書背…每個幾十個三角形、一個材質一次 draw call）合成一張貼圖集、一個材質。
    只收：Base Color 接一張貼圖（可以經過一個乘色的 Mix）、不透明、不發光、沒有 alpha 貼圖、三角形 ≤ max_tris、UV 範圍 ≤ max_rep 格（重複的貼圖在格子裡先鋪好）。
    法線、粗糙度貼圖不收（小東西看不出來；粗糙度用 rough）。protect（遊戲用材質名做事的）、字牌 *FACE* 的材質、keep(ob) 的物件不動。
    回傳收進去的材質名。要在 merge_by_material 之前或之後都可以；之後再 merge_by_material 一次，同一個貼圖集材質的網格會合成一個。"""
    import numpy as np
    objs, _seen = [], set()   # 同一個網格（instancing 的原型）只處理一次
    for ob in [root] + list(root.children_recursive):
        if ob.type == 'MESH' and not keep(ob) and ob.data.name not in _seen: _seen.add(ob.data.name); objs.append(ob)
    face_m = {ms.material.name for ob in [root] + list(root.children_recursive) if ob.type == 'MESH' and 'FACE' in ob.name for ms in ob.material_slots if ms.material}
    def src_of(m):
        if not (m and m.use_nodes) or m.name in protect or m.name in face_m or skip(m) or (only is not None and m.name not in only): return None
        b = m.node_tree.nodes.get('Principled BSDF')
        if b is None or not b.inputs['Base Color'].is_linked: return None
        if alpha:
            if not b.inputs['Alpha'].is_linked: return None
            an = b.inputs['Alpha'].links[0].from_node
            if an.bl_idname == 'ShaderNodeMath' and an.inputs[0].is_linked: an = an.inputs[0].links[0].from_node
            if an.bl_idname != 'ShaderNodeTexImage': return None
        elif b.inputs['Alpha'].is_linked or b.inputs['Alpha'].default_value < 0.999: return None
        es = b.inputs.get('Emission Strength')
        if b.inputs['Emission Color'].is_linked or (es is not None and es.default_value > 0 and max(b.inputs['Emission Color'].default_value[:3]) > 0): return None
        n = b.inputs['Base Color'].links[0].from_node; tint = (1.0, 1.0, 1.0)
        if n.bl_idname == 'ShaderNodeMix':
            l6 = n.inputs[6].links
            if not l6 or n.inputs[7].is_linked: return None
            tint = tuple(n.inputs[7].default_value[:3]); n = l6[0].from_node
        if n.bl_idname != 'ShaderNodeTexImage' or n.image is None or n.inputs['Vector'].is_linked: return None   # 用 Mapping 節點挑貼圖一塊的（招牌設計稿）不收
        if alpha and an.image != n.image: return None
        return n.image, tint
    cand = {}   # 材質名 → [image, tint, tris, [(ob, poly idx)…], uv bbox]
    for ob in objs:
        me = ob.data; uvl = me.uv_layers.active
        if uvl is None: continue
        for p in me.polygons:
            m = me.materials[p.material_index] if p.material_index < len(me.materials) else None
            if m is None: continue
            if m.name not in cand:
                s_ = src_of(m); cand[m.name] = None if s_ is None else [s_[0], s_[1], 0, [], [1e9, 1e9, -1e9, -1e9]]
            c = cand[m.name]
            if c is None: continue
            c[2] += len(p.vertices) - 2; c[3].append((ob, p.index))
            fu = min(uvl.data[li].uv[0] for li in p.loop_indices); fv = min(uvl.data[li].uv[1] for li in p.loop_indices)   # UV 是世界座標（box_uv）：每個面平移整數格到 0 附近（貼圖重複，看起來一樣）
            for li in p.loop_indices: uvl.data[li].uv = (uvl.data[li].uv[0] - math.floor(fu + 1e-4), uvl.data[li].uv[1] - math.floor(fv + 1e-4))
            for li in p.loop_indices:
                u, v = uvl.data[li].uv; bb = c[4]; bb[0] = min(bb[0], u); bb[1] = min(bb[1], v); bb[2] = max(bb[2], u); bb[3] = max(bb[3], v)
    sel, skipped = [], []
    for nm, c in cand.items():
        if c is None: continue
        u0, v0 = math.floor(c[4][0] + 1e-4), math.floor(c[4][1] + 1e-4); ru, rv = max(1, math.ceil(c[4][2] - 1e-4) - u0), max(1, math.ceil(c[4][3] - 1e-4) - v0)
        if c[2] > max_tris or ru > max_rep or rv > max_rep: skipped.append((nm, c[2], ru, rv)); continue
        sel.append((nm, c, u0, v0, ru, rv))
    print(json.dumps({'atlas_small_skipped': skipped}, ensure_ascii=False))
    if len(sel) < 2: print(json.dumps({'atlas_small': 0})); return []
    n = len(sel); cols = math.ceil(math.sqrt(n)); rows = math.ceil(n / cols); W, Hh = cols * cell, rows * cell; pad = 3
    atlas = np.zeros((Hh, W, 4), np.float32); atlas[..., 3] = 0.0 if alpha else 1.0
    for k, (nm, c, u0, v0, ru, rv) in enumerate(sel):
        img, tint = c[0], c[1]; w0, h0 = img.size; raw = np.array(img.pixels[:], np.float32).reshape(h0, w0, img.channels)   # Blender 的像素：第 0 列在下面
        px = raw[..., :3]; al = raw[..., 3:4] if img.channels == 4 else np.ones((h0, w0, 1), np.float32)
        if img.colorspace_settings.name == 'sRGB': px = np.where(px <= 0.04045, px / 12.92, ((px + 0.055) / 1.055) ** 2.4)
        px = np.concatenate([px * np.array(tint, np.float32), al], -1)
        tiled = np.tile(px, (rv, ru, 1)); inner = cell - 2 * pad
        yi = (np.arange(inner) + 0.5) / inner * tiled.shape[0]; xi = (np.arange(inner) + 0.5) / inner * tiled.shape[1]
        cellimg = tiled[yi.astype(int)[:, None], xi.astype(int)[None, :]]
        cellimg = np.pad(cellimg, ((pad, pad), (pad, pad), (0, 0)), mode='edge')
        cx, cy = (k % cols) * cell, (k // cols) * cell
        atlas[cy:cy + cell, cx:cx + cell, :] = cellimg
        c.append((cx, cy))
    srgb = np.where(atlas[..., :3] <= 0.0031308, atlas[..., :3] * 12.92, 1.055 * np.power(np.clip(atlas[..., :3], 0, None), 1 / 2.4) - 0.055)
    from PIL import Image as _I
    rgba = np.concatenate([srgb, atlas[..., 3:4]], -1) if alpha else srgb
    _I.fromarray((np.clip(rgba[::-1], 0, 1) * 255).astype(np.uint8)).save(out_png)
    am = bpy.data.materials.new(mat_name); am.use_nodes = True; nt = am.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(out_png); tx.interpolation = 'Linear'; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if alpha:
        rn = nt.nodes.new('ShaderNodeMath'); rn.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rn.inputs[0]); nt.links.new(rn.outputs[0], bs.inputs['Alpha'])
        try: am.surface_render_method = 'DITHERED'
        except Exception: pass
        am.use_backface_culling = False
    for (nm, c, u0, v0, ru, rv) in sel:
        cx, cy = c[5]
        for ob, pi in c[3]:
            me = ob.data; uvl = me.uv_layers.active; p = me.polygons[pi]
            if am.name not in [mm.name for mm in me.materials if mm]: me.materials.append(am)
            ai = [j for j, mm in enumerate(me.materials) if mm and mm.name == am.name][0]
            for li in p.loop_indices:
                u, v = uvl.data[li].uv
                uvl.data[li].uv = ((cx + pad + (u - u0) / ru * (cell - 2 * pad)) / W, (cy + pad + (v - v0) / rv * (cell - 2 * pad)) / Hh)
            p.material_index = ai
    for me in {ob.data for (nm, c, u0, v0, ru, rv) in sel for ob, pi in c[3]}:   # 沒有面用的材質槽拿掉（merge_by_material 只合單一材質的網格）
        used = {p.material_index for p in me.polygons}
        for i in sorted(range(len(me.materials)), reverse=True):
            if i not in used:
                for p in me.polygons:
                    if p.material_index > i: p.material_index -= 1
                me.materials.pop(index=i)
    print(json.dumps({'atlas_small': len(sel), 'materials': [s_[0] for s_ in sel], 'size': [W, Hh]}))
    return [s_[0] for s_ in sel]


def atlas_rows(root, out_jpg, mat_name, protect=(), max_tris=2500, max_rv=6, W=512, row=64, rough=0.6, keep=lambda ob: False, skip=lambda m: False, only=None, max_vloss=None):
    """atlas_small 收不進去的（沿 u 重複很多次：條紋雨遮、店內地板、木頭）：一列一個材質、每列寬＝一個 u 週期（貼圖集整張的寬），
    u 不用改（貼圖本來就沿 u 重複），v 擠進這一列（rv 個週期先鋪好）。列與列之間留邊；遠處的 mipmap 會混到隔壁列一點點（小東西看不出來）。"""
    import numpy as np
    objs, _seen = [], set()
    for ob in [root] + list(root.children_recursive):
        if ob.type == 'MESH' and not keep(ob) and ob.data.name not in _seen: _seen.add(ob.data.name); objs.append(ob)
    face_m = {ms.material.name for ob in [root] + list(root.children_recursive) if ob.type == 'MESH' and 'FACE' in ob.name for ms in ob.material_slots if ms.material}
    def src_of(m):
        if not (m and m.use_nodes) or m.name in protect or m.name in face_m or skip(m) or (only is not None and m.name not in only): return None
        b = m.node_tree.nodes.get('Principled BSDF')
        if b is None or b.inputs['Alpha'].is_linked or b.inputs['Alpha'].default_value < 0.999 or not b.inputs['Base Color'].is_linked: return None
        es = b.inputs.get('Emission Strength')
        if b.inputs['Emission Color'].is_linked or (es is not None and es.default_value > 0 and max(b.inputs['Emission Color'].default_value[:3]) > 0): return None
        n = b.inputs['Base Color'].links[0].from_node; tint = (1.0, 1.0, 1.0)
        if n.bl_idname == 'ShaderNodeMix':
            l6 = n.inputs[6].links
            if not l6 or n.inputs[7].is_linked: return None
            tint = tuple(n.inputs[7].default_value[:3]); n = l6[0].from_node
        if n.bl_idname != 'ShaderNodeTexImage' or n.image is None or n.inputs['Vector'].is_linked: return None   # 用 Mapping 節點挑貼圖一塊的（招牌設計稿）不收
        return n.image, tint
    cand = {}
    for ob in objs:
        me = ob.data; uvl = me.uv_layers.active
        if uvl is None: continue
        for p in me.polygons:
            m = me.materials[p.material_index] if p.material_index < len(me.materials) else None
            if m is None: continue
            if m.name not in cand:
                s_ = src_of(m); cand[m.name] = None if s_ is None else [s_[0], s_[1], 0, [], 0.0]
            c = cand[m.name]
            if c is None: continue
            c[2] += len(p.vertices) - 2; c[3].append((ob, p.index))
            fv = min(uvl.data[li].uv[1] for li in p.loop_indices); fu = min(uvl.data[li].uv[0] for li in p.loop_indices)
            for li in p.loop_indices: uvl.data[li].uv = (uvl.data[li].uv[0] - math.floor(fu + 1e-4), uvl.data[li].uv[1] - math.floor(fv + 1e-4))
            c[4] = max(c[4], max(uvl.data[li].uv[1] for li in p.loop_indices))
    sel = [(nm, c, max(1, math.ceil(c[4] - 1e-4))) for nm, c in cand.items() if c is not None and c[2] <= max_tris and math.ceil(c[4] - 1e-4) <= max_rv]
    # v 方向擠成一列（每個週期 row 像素）以後掉多少細節：磁磚、馬賽克、磨石子的橫向縫會不見、變成直條紋（效能第三輪：冰菓室的馬賽克牆裙變成一片咖啡色）。
    # 指標＝v 方向照貼圖集的取樣縮小再放大，和原圖差多少（除以原圖的標準差）；條紋雨遮、雜訊類的很小，磁磚類的大。max_vloss 有設就排除超過的
    # 指標用「每個週期 8 像素」量（不是 row）：遊戲裡遠一點 GPU 照 u 方向選 mipmap，v 方向只剩 row 的 1/8，木紋、磁磚、雜訊都會變成直條紋
    # （第一版用 row 量，木板牆腰 0.03 照樣收進來、遊戲裡變成一片糊）
    def _vloss(img, rr=8):
        w0, h0 = img.size
        px = np.array(img.pixels[:], np.float32).reshape(h0, w0, img.channels)[..., :3]
        if h0 <= rr: return 0.0
        small = px.reshape(rr, h0 // rr, w0, 3).mean(axis=1) if h0 % rr == 0 else px[((np.arange(rr) + 0.5) * h0 / rr).astype(int)]
        up = small[np.clip((np.arange(h0) * rr / h0).astype(int), 0, rr - 1)]
        return float(np.abs(up - px).mean() / (px.std() + 1e-4))
    vl = {nm: round(_vloss(c[0]), 3) for (nm, c, rv) in sel}
    print(json.dumps({'atlas_rows_vloss': vl}))
    if max_vloss is not None: sel = [t for t in sel if vl[t[0]] <= max_vloss]
    if len(sel) < 2: print(json.dumps({'atlas_rows': 0})); return []
    pad = 4; rows_h = [row * rv + 2 * pad for (nm, c, rv) in sel]; Hh = sum(rows_h)
    atlas = np.zeros((Hh, W, 3), np.float32); y = 0
    for (nm, c, rv), rh in zip(sel, rows_h):
        img, tint = c[0], c[1]; w0, h0 = img.size; px = np.array(img.pixels[:], np.float32).reshape(h0, w0, img.channels)[..., :3]
        if img.colorspace_settings.name == 'sRGB': px = np.where(px <= 0.04045, px / 12.92, ((px + 0.055) / 1.055) ** 2.4)
        px = px * np.array(tint, np.float32); tiled = np.tile(px, (rv, 1, 1)); inner = rh - 2 * pad
        yi = ((np.arange(inner) + 0.5) / inner * tiled.shape[0]).astype(int); xi = ((np.arange(W) + 0.5) / W * w0).astype(int)
        band = tiled[yi[:, None], xi[None, :]]; band = np.pad(band, ((pad, pad), (0, 0), (0, 0)), mode='edge')
        atlas[y:y + rh] = band; c.append((y, rh)); y += rh
    srgb = np.where(atlas <= 0.0031308, atlas * 12.92, 1.055 * np.power(np.clip(atlas, 0, None), 1 / 2.4) - 0.055)
    from PIL import Image as _I
    _I.fromarray((np.clip(srgb[::-1], 0, 1) * 255).astype(np.uint8)).save(out_jpg, quality=90)
    am = bpy.data.materials.new(mat_name); am.use_nodes = True; nt = am.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(out_jpg); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    touched = set()
    for (nm, c, rv) in sel:
        y0, rh = c[5]
        for ob, pi in c[3]:
            me = ob.data; uvl = me.uv_layers.active; p = me.polygons[pi]; touched.add(me)
            if am.name not in [mm.name for mm in me.materials if mm]: me.materials.append(am)
            ai = [j for j, mm in enumerate(me.materials) if mm and mm.name == am.name][0]
            for li in p.loop_indices:
                u, v = uvl.data[li].uv; uvl.data[li].uv = (u, (y0 + pad + v / rv * (rh - 2 * pad)) / Hh)
            p.material_index = ai
    for me in touched:
        used = {p.material_index for p in me.polygons}
        for i in sorted(range(len(me.materials)), reverse=True):
            if i not in used:
                for p in me.polygons:
                    if p.material_index > i: p.material_index -= 1
                me.materials.pop(index=i)
    print(json.dumps({'atlas_rows': len(sel), 'materials': [s_[0] for s_ in sel], 'size': [W, Hh]}))
    return [s_[0] for s_ in sel]


def _uv_clip(poly, u0, u1, v0, v1):
    """Sutherland–Hodgman：把 [(co, uv)…] 多邊形裁到 UV 的 [u0,u1]×[v0,v1]（co、uv 在邊上線性內插；平面、box UV 的面是精確的）"""
    for ax, val, ge in ((0, u0, True), (0, u1, False), (1, v0, True), (1, v1, False)):
        out = []
        for k in range(len(poly)):
            a, b = poly[k - 1], poly[k]
            ia = a[1][ax] >= val - 1e-6 if ge else a[1][ax] <= val + 1e-6
            ib = b[1][ax] >= val - 1e-6 if ge else b[1][ax] <= val + 1e-6
            if ib != ia:
                t = (val - a[1][ax]) / (b[1][ax] - a[1][ax]); out.append((a[0].lerp(b[0], t), a[1].lerp(b[1], t)))
            if ib: out.append(b)
        poly = []
        for q in out:   # 去掉重複的點（裁在角上會出現）
            if not poly or (q[0] - poly[-1][0]).length > 1e-6: poly.append(q)
        if len(poly) > 1 and (poly[0][0] - poly[-1][0]).length <= 1e-6: poly.pop()
        if len(poly) < 3: return []
    return poly


def atlas_tiles(root, out_base, mat_name, only, cell=256, pad=12, keep=lambda ob: False, reps=None):
    """磁磚、木紋、地板這類「兩個方向都有細節、會重複」的貼圖材質合成一張 2D 貼圖集，不糊（效能第四輪，2026-10-16）：
    - 每個面先沿 UV 的整數格線切開（每一塊只落在一個週期裡），UV 平移到 0～1，再對到貼圖集的一格。
    - 每一格四周用貼圖自己繞回來的像素墊邊（wrap）：遠處的 mipmap 混到的是同一張貼圖，不會混到隔壁格。
    - 底色、法線（強度烤進像素）、ORM（G 粗糙度、B 金屬度）三張圖同一個排列；一個材質。
    - 代價：大面積的面會切成好幾塊（三角形變多）。atlas_rows（一列一個材質）只適合 v 方向不變的條紋，這個給其他的。
    only：要收的材質名。reps：{材質名: k}，一格放 k×k 個週期（切線只在 k 的倍數上，三角形少；每個週期的像素變成 1/k）。
    回傳收進去的材質名。之後再 merge_by_material，同一個貼圖集材質的網格合成一個。"""
    reps = reps or {}
    import numpy as np
    from PIL import Image as _I
    objs, seen = [], set()
    for ob in [root] + list(root.children_recursive):
        if ob.type == 'MESH' and not keep(ob) and ob.data.name not in seen: seen.add(ob.data.name); objs.append(ob)
    def src(m):
        if not (m and m.use_nodes) or m.name not in only: return None
        b = m.node_tree.nodes.get('Principled BSDF')
        if b is None or not b.inputs['Base Color'].is_linked or b.inputs['Alpha'].is_linked: return None
        n = b.inputs['Base Color'].links[0].from_node; tint = (1.0, 1.0, 1.0)
        if n.bl_idname == 'ShaderNodeMix':
            l6 = n.inputs[6].links
            if not l6 or n.inputs[7].is_linked: return None
            tint = tuple(n.inputs[7].default_value[:3]); n = l6[0].from_node
        if n.bl_idname != 'ShaderNodeTexImage' or n.image is None or n.inputs['Vector'].is_linked: return None
        nimg, nstr = None, 1.0
        if b.inputs['Normal'].is_linked:
            nm_ = b.inputs['Normal'].links[0].from_node
            if nm_.bl_idname == 'ShaderNodeNormalMap' and nm_.inputs['Color'].is_linked:
                ti = nm_.inputs['Color'].links[0].from_node
                if ti.bl_idname == 'ShaderNodeTexImage' and ti.image: nimg, nstr = ti.image, nm_.inputs['Strength'].default_value
        rough = b.inputs['Roughness'].default_value
        if b.inputs['Roughness'].is_linked:
            rn = b.inputs['Roughness'].links[0].from_node
            if rn.bl_idname == 'ShaderNodeTexImage' and rn.image:
                rp = np.array(rn.image.pixels[:], np.float32).reshape(-1, rn.image.channels); rough = float(rp[:, 0].mean())
            else: rough = 0.6
        return dict(img=n.image, tint=tint, nimg=nimg, nstr=nstr, rough=rough, metal=b.inputs['Metallic'].default_value)
    srcs = {}
    for ob in objs:
        for m in ob.data.materials:
            if m and m.name in only and m.name not in srcs: srcs[m.name] = src(m)
    sel = [nm for nm in sorted(srcs) if srcs[nm]]
    if len(sel) < 2: print(json.dumps({'atlas_tiles': 0})); return []
    n = len(sel); cols = math.ceil(math.sqrt(n)); rows = math.ceil(n / cols); W, H = cols * cell, rows * cell; inner = cell - 2 * pad
    pos = {nm: ((k % cols) * cell, H - (k // cols + 1) * cell) for k, nm in enumerate(sel)}   # 每格左下角（UV 的 v 從下面算）
    def pix(img, srgb_in):   # Blender 像素（第 0 列在下面）→ 上到下、0～1 的 RGB 浮點
        a = np.array(img.pixels[:], np.float32).reshape(img.size[1], img.size[0], img.channels)[::-1, :, :3]
        return a
    base = np.zeros((H, W, 3), np.uint8); nor = np.zeros((H, W, 3), np.uint8); nor[...] = (128, 128, 255); orm = np.zeros((H, W, 3), np.uint8); orm[..., 0] = 255
    def place(arr, tile, nm):
        x0, yb = pos[nm]; top = H - (yb + cell)
        t = np.pad(tile, ((pad, pad), (pad, pad), (0, 0)), mode='wrap'); arr[top:top + cell, x0:x0 + cell] = t
    for nm in sel:
        s_ = srcs[nm]; px = pix(s_['img'], True)
        if s_['img'].colorspace_settings.name == 'sRGB': px = np.where(px <= 0.04045, px / 12.92, ((px + 0.055) / 1.055) ** 2.4)
        px = px * np.array(s_['tint'], np.float32)
        sr = np.where(px <= 0.0031308, px * 12.92, 1.055 * np.power(np.clip(px, 0, None), 1 / 2.4) - 0.055)
        kk = reps.get(nm, 1); sr = np.tile(sr, (kk, kk, 1)) if kk > 1 else sr
        im = _I.fromarray((np.clip(sr, 0, 1) * 255).astype(np.uint8)).resize((inner, inner), _I.LANCZOS); place(base, np.array(im), nm)
        if s_['nimg'] is not None:
            nx = pix(s_['nimg'], False); xy = (nx[..., :2] - 0.5) * s_['nstr']; z = np.sqrt(np.clip(0.25 - (xy ** 2).sum(-1), 0, None))   # 強度烤進像素（遊戲裡的法線強度＝1）
            nn = np.concatenate([xy + 0.5, z[..., None] + 0.5], -1); nn = np.tile(nn, (kk, kk, 1)) if kk > 1 else nn
            im = _I.fromarray((np.clip(nn, 0, 1) * 255).astype(np.uint8)).resize((inner, inner), _I.LANCZOS); place(nor, np.array(im), nm)
        t = np.zeros((inner, inner, 3), np.uint8); t[..., 0] = 255; t[..., 1] = int(np.clip(s_['rough'], 0, 1) * 255); t[..., 2] = int(np.clip(min(s_['metal'], 0.45), 0, 1) * 255); place(orm, t, nm)
    paths = {k: f'{out_base}_{k}.png' for k in ('base', 'nor', 'orm')}
    _I.fromarray(base).save(paths['base']); _I.fromarray(nor).save(paths['nor']); _I.fromarray(orm).save(paths['orm'])
    am = bpy.data.materials.new(mat_name); am.use_nodes = True; nt = am.node_tree; bs = nt.nodes['Principled BSDF']
    tb = nt.nodes.new('ShaderNodeTexImage'); tb.image = bpy.data.images.load(paths['base']); nt.links.new(tb.outputs['Color'], bs.inputs['Base Color'])
    tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(paths['nor']); tn.image.colorspace_settings.name = 'Non-Color'
    nmap = nt.nodes.new('ShaderNodeNormalMap'); nmap.inputs['Strength'].default_value = 1.0; nt.links.new(tn.outputs['Color'], nmap.inputs['Color']); nt.links.new(nmap.outputs['Normal'], bs.inputs['Normal'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(paths['orm']); to.image.colorspace_settings.name = 'Non-Color'
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color']); nt.links.new(sp.outputs['Green'], bs.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bs.inputs['Metallic'])
    tris_before = tris_after = 0; per = {}
    for ob in objs:
        me = ob.data; mats = list(me.materials)
        idx = {i: mats[i].name for i in range(len(mats)) if mats[i] and mats[i].name in pos}
        if not idx: continue
        if am.name not in [mm.name for mm in me.materials if mm]: me.materials.append(am)
        ai = [j for j, mm in enumerate(me.materials) if mm and mm.name == am.name][0]
        bm = bmesh.new(); bm.from_mesh(me); ul = bm.loops.layers.uv.active
        if ul is None: bm.free(); continue
        newv = []
        def put(face, nm, i, j):   # i、j＝這一塊所在的格（以 k 個週期為一格）
            x0, yb = pos[nm]; kk = reps.get(nm, 1)
            for l in face.loops: u, v = l[ul].uv; l[ul].uv = ((x0 + pad + (u / kk - i) * inner) / W, (yb + pad + (v / kk - j) * inner) / H)
            face.material_index = ai
        for f in [f for f in bm.faces if f.material_index in idx]:
            nm = idx[f.material_index]; tris_before += len(f.verts) - 2; pm = per.setdefault(nm, [0, 0]); pm[0] += len(f.verts) - 2
            pts = [(l.vert.co.copy(), l[ul].uv.copy()) for l in f.loops]
            kk = reps.get(nm, 1); us = [q[1].x / kk for q in pts]; vs = [q[1].y / kk for q in pts]
            i0, i1 = math.floor(min(us) + 1e-4), math.ceil(max(us) - 1e-4); j0, j1 = math.floor(min(vs) + 1e-4), math.ceil(max(vs) - 1e-4)
            i1, j1 = max(i1, i0 + 1), max(j1, j0 + 1)
            if i1 - i0 == 1 and j1 - j0 == 1: put(f, nm, i0, j0); tris_after += len(f.verts) - 2; pm[1] += len(f.verts) - 2; continue
            sm = f.smooth
            for i in range(i0, i1):
                for j in range(j0, j1):
                    poly = _uv_clip(pts, i * kk, (i + 1) * kk, j * kk, (j + 1) * kk)
                    if not poly: continue
                    vs_ = [bm.verts.new(c) for c, uv in poly]; newv += vs_
                    try: nf = bm.faces.new(vs_)
                    except ValueError: continue
                    nf.smooth = sm
                    for l, (c, uv) in zip(nf.loops, poly): l[ul].uv = uv
                    put(nf, nm, i, j); tris_after += len(poly) - 2; pm[1] += len(poly) - 2
            bm.faces.remove(f)
        bmesh.ops.delete(bm, geom=[e for e in bm.edges if not e.link_faces], context='EDGES')
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
        newv = [v for v in newv if v.is_valid]
        if newv: bmesh.ops.remove_doubles(bm, verts=newv, dist=1e-5)
        bm.normal_update(); bm.to_mesh(me); bm.free()
        used = {p.material_index for p in me.polygons}
        for i in sorted(range(len(me.materials)), reverse=True):
            if i not in used:
                for p in me.polygons:
                    if p.material_index > i: p.material_index -= 1
                me.materials.pop(index=i)
    print(json.dumps({'atlas_tiles': len(sel), 'materials': sel, 'size': [W, H], 'tris_before': tris_before, 'tris_after': tris_after, 'per': per}))
    return sel


def realize_small_instances(root, max_users=3, max_tris=2000, keep=lambda ob: False):
    """數量少或很小的 instancing（同一個網格只用 1～3 次、或全部加起來不到 max_tris 個三角形）改成各自一份網格，
    之後 split_by_material＋merge_by_material 才能合進大網格（instancing 每個原型每個材質一次 draw call，只擺一兩個的不划算）。"""
    by = {}
    for ob in root.children_recursive:
        if ob.type == 'MESH' and ob.data.users > 1 and not keep(ob): by.setdefault(ob.data.name, []).append(ob)
    n = 0
    for name, obs in by.items():
        me = obs[0].data; tris = sum(len(p.vertices) - 2 for p in me.polygons)
        if len(obs) <= max_users or tris * len(obs) <= max_tris:
            for ob in obs: ob.data = me.copy()
            n += 1
    print(json.dumps({'realize_small_instances': n}))


def split_by_material(root, keep=lambda ob: False):
    """不是 instancing、有好幾個材質的網格物件拆成一個材質一個物件（之後 merge_by_material 才合得進去）。有子物件的不拆。"""
    bpy.context.view_layer.update(); n = 0
    for ob in [o for o in root.children_recursive if o.type == 'MESH']:
        if keep(ob) or ob.data.users > 1 or len(ob.data.materials) < 2 or ob.children: continue
        me = ob.data; used = sorted({p.material_index for p in me.polygons})
        for mi in used:
            bm = bmesh.new(); bm.from_mesh(me)
            bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index != mi], context='FACES')
            nm = bpy.data.meshes.new(f'{me.name}_m{mi}'); bm.to_mesh(nm); bm.free()
            nm.materials.clear(); nm.materials.append(me.materials[mi])
            for p in nm.polygons: p.material_index = 0
            no = bpy.data.objects.new(f'{ob.name}_m{mi}', nm); B.scene().collection.objects.link(no); no.parent = ob.parent; no.matrix_world = ob.matrix_world.copy()
            for kk, vv in ob.items(): no[kk] = vv
        bpy.data.objects.remove(ob); bpy.data.meshes.remove(me); n += 1
    print(json.dumps({'split_by_material': n}))


# ---------- 頂點色（商品、曬的衣服…：一個材質、顏色放在頂點色，一次 draw call） ----------
def vc_material(name, rough=0.5, cull=False):
    """顏色全部來自頂點色（Color Attribute 'Col' → Base Color；glTF COLOR_0）"""
    m = flat(name, '#ffffff', rough=rough, cull=cull); nt = m.node_tree; vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
    nt.links.new(vc.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m


def vc_metal(name, rough=0.45, metal=0.35):
    """頂點色材質（金屬零件用：門、鋁框、鐵件…）"""
    m = vc_material(name, rough=rough); m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = min(metal, B.MAX_METAL); return m


def flat_info(m):
    """純色材質（沒有貼圖、不透明、不發光）的線性顏色、金屬度；顏色本來就在頂點色的（vc_material）color＝None；其他回傳 None"""
    if not (m and m.use_nodes): return None
    b = m.node_tree.nodes.get('Principled BSDF')
    if b is None or b.inputs['Alpha'].is_linked or b.inputs['Alpha'].default_value < 0.999: return None
    if b.inputs['Base Color'].is_linked:
        if b.inputs['Base Color'].links[0].from_node.bl_idname != 'ShaderNodeVertexColor': return None
        return {'color': None, 'metal': b.inputs['Metallic'].default_value}
    es = b.inputs.get('Emission Strength'); ec = b.inputs.get('Emission Color')
    if es is not None and es.default_value > 0 and ec is not None and max(ec.default_value[:3]) > 0: return None
    return {'color': list(b.inputs['Base Color'].default_value[:3]), 'metal': b.inputs['Metallic'].default_value}


def vc_consolidate(root, groups):
    """把純色材質換成共用的頂點色材質（同一組的零件之後由 merge_by_material 合成一個網格 → 一次 draw call）。
    groups：{原材質名: 頂點色材質（vc_material／vc_metal 建的）}。每個面原本材質的顏色寫進頂點色 Col
    （金屬度不同時補償漫射：顏色 ×(1−原金屬度)/(1−新金屬度)，最多到 1）。instancing 原型的網格也處理（原型裡的零件合成一個材質）。
    原本就有頂點色的網格（外牆的牆色、曬的衣服）保留其他面的顏色。要在 merge_by_material 之前呼叫。"""
    meshes = {ob.data for ob in [root] + list(root.children_recursive) if ob.type == 'MESH'}   # root 本身是網格的（腳踏車的車架）也算
    st = {'meshes': 0, 'faces': 0, 'materials': set()}
    for me in meshes:
        idx = [i for i, m in enumerate(me.materials) if m and m.name in groups]
        if not idx: continue
        ca = me.color_attributes.get('Col')
        if ca is None:
            ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER'); ca.data.foreach_set('color', [1.0] * (4 * len(ca.data)))
        assert ca.domain == 'CORNER' and ca.data_type == 'FLOAT_COLOR', (me.name, ca.domain, ca.data_type)
        slot = {}
        for i in idx:
            m = me.materials[i]; tgt = groups[m.name]; info = flat_info(m); assert info, ('不是純色材質', m.name)
            tm = tgt.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value; k = (1 - info['metal']) / max(1e-3, 1 - tm)
            if tgt.name not in [mm.name for mm in me.materials if mm]: me.materials.append(tgt)
            col = None if info['color'] is None else [min(1.0, v * k) for v in info['color']] + [1.0]   # None：本來就是頂點色，保留（只乘 k）
            slot[i] = ([j for j, mm in enumerate(me.materials) if mm and mm.name == tgt.name][0], col, k)
            st['materials'].add(m.name)
        cols = [0.0] * (4 * len(ca.data)); ca.data.foreach_get('color', cols)
        for p in me.polygons:
            s = slot.get(p.material_index)
            if s is None: continue
            for li in p.loop_indices:
                if s[1] is not None: cols[li * 4:li * 4 + 4] = s[1]
                else: cols[li * 4:li * 4 + 3] = [min(1.0, v * s[2]) for v in cols[li * 4:li * 4 + 3]]
            p.material_index = s[0]; st['faces'] += 1
        ca.data.foreach_set('color', cols)
        used = {p.material_index for p in me.polygons}
        for i in reversed(range(len(me.materials))):   # 用不到的材質欄位拿掉（由後往前；Blender 會把後面的面的索引往前移）
            if i not in used: me.materials.pop(index=i)
        st['meshes'] += 1
    st['materials'] = sorted(st['materials']); print(json.dumps({'vc_consolidate': st}, ensure_ascii=False)); return st


class CMesh(Mesh):
    """每個零件一個顏色的網格（頂點色 Col；hex 是 sRGB，存成線性）"""
    def __init__(self, name, mat):
        super().__init__(name, mat); self.col = self.bm.loops.layers.float_color.new('Col')

    def paint(self, faces, hexcol, k=1.0):
        lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        c = [lin(min(1.0, int(hexcol[i:i + 2], 16) / 255 * k)) for i in (1, 3, 5)] + [1.0]
        for f in faces:
            for lp in f.loops: lp[self.col] = c
        return faces

    def poly(self, pts, hexcol, k=1.0):
        """一個多邊形面（遊戲座標的點，逆時針＝正面）"""
        f = self.bm.faces.new([self.bm.verts.new(g2b(*p)) for p in pts]); return self.paint([f], hexcol, k)

    def cbox(self, x0, x1, y0, y1, z0, z1, hexcol, k=1.0):
        return self.paint(bm_box(self.bm, x0, x1, y0, y1, z0, z1), hexcol, k)

    def crbox(self, x0, x1, y0, y1, z0, z1, hexcol, k=1.0, r=0.02, seg=2):
        """倒角的頂點色方塊（櫃台、冰櫃這些近景的東西）"""
        before = set(self.bm.faces); fs = bm_box(self.bm, x0, x1, y0, y1, z0, z1)
        r = min(r, abs(x1 - x0) / 2 - 1e-4, abs(y1 - y0) / 2 - 1e-4, abs(z1 - z0) / 2 - 1e-4)
        if r > 1e-4:
            vs = list({v for f in fs for v in f.verts}); es = list({e for f in fs for e in f.edges})
            bmesh.ops.bevel(self.bm, geom=es + vs, offset=r, segments=seg, affect='EDGES', profile=0.5, clamp_overlap=True)
        return self.paint([f for f in self.bm.faces if f not in before], hexcol, k)


def single_side(root, keep=r'glass', nodup=None, skip=lambda ob: False, flip=True, dry=False):
    """材質改單面（glTF doubleSided false）＋本來靠雙面材質才看得到的零件補反面——PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）。
    雙面材質在 three.js 不剔除背面（背面也算像素），牆要淡出的（transparent）還整個網格畫兩次；改單面以前先照「零件」分兩種：
    - 封閉、方向一致的殼（方盒、圓柱、店內的殼）：單面就看得對——朝外的從外面看、朝內的（店內、房間）從裡面看；
      影子也一樣（three.js 單面材質的影子那一輪畫背面，封閉的殼形狀不變）。不動。
    - 其他（一片四邊形、十字薄片 xbar、葉片卡、蓋子朝內或方向不一致的圓柱、開口的殼…）：面複製一份反過來——兩面都看得到、
      影子兩面都畫，和原本的雙面材質一樣。只多頂點、不多像素（背面在光柵化以前就剔掉）。
    零件＝相連的面；頂點位置相同就算相連（box 每一面各自的頂點也算），每條邊剛好兩個面、方向相反才算封閉。
    原本就單面的材質（use_backface_culling，作者故意的，例如室內天花板朝下＝剖面視角）不補反面、照舊單面。
    keep（正規表示式）：材質名符合的照舊雙面、不補反面（玻璃：兩面都看得到、半透明）。
    nodup（正規表示式）：材質名符合的開口零件也不補反面——背面確定看不到的（只從外面看的立面、隔著玻璃看的店內與商品、只從上面看的地板）；
    要用同角度截圖確認過（例：公館店面先全部單面不補，十個鏡頭和原本一樣，才把這些列進來）。
    skip(ob)：這些物件的網格不補反面（遊戲照名字、照網格形狀接手的板面，例如公館的 SIGN_FACE_／INTERIOR_FACE_：補了反面遊戲的
    wzAtlasFaces 合不起來、整條店面載入失敗——第一次試的時候遊戲退回套件外觀）。只有這些物件在用的材質照舊（不改單面）：
    美國亞洲超市門外的景（usam_view）只有一片、正面朝外，第一次改單面，從店裡看整片不見（第四份）；別的零件也在用的材質照樣改單面。
    封閉、方向一致但裡外相反（體積是負的）、又有一邊小於 1 m 的零件（欄杆收邊、樓梯防滑條、門板、小盒子）翻成朝外（雙面時看不出來，單面會看到背面）；
    大的不動（可能是從裡面看的房間）。
    flip=False：不翻（體育館 B1：有 4 片 4 cm 的小鐵片在 Blender 裡算出來裡外相反、匯出的 GLB 卻是正的，翻了反而變反；B1 不翻的版本同角度截圖一樣、GLB 也沒有裡外相反的零件）。
    ——原因後來找到了：體積原本用 32 位元的向量從原點算，離原點遠的小零件正負號會錯；10-27 改成 64 位元、以零件自己的頂點當原點（B1 沒有用新算法重匯過）。
    回傳 {材質名: [封閉的三角形, 補了反面的三角形]}（翻面的另外記在「（翻面）材質名」）（instancing 的原型照網格算一次）；dry=True 只統計不改。"""
    import re as _re
    flip_ok = flip
    kre = _re.compile(keep); nre = _re.compile(nodup) if nodup else None; stats = {}
    obs = [ob for ob in [root] + list(root.children_recursive) if ob.type == 'MESH']
    skipped = {ob.data for ob in obs if skip(ob)}
    for me in {ob.data for ob in obs} - skipped:
        mats = list(me.materials)
        bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
        def mname(f): return mats[f.material_index].name if f.material_index < len(mats) and mats[f.material_index] else ''
        faces = [f for f in bm.faces if not kre.search(mname(f))]
        if not faces: bm.free(); continue
        par = {f.index: f.index for f in faces}
        def find(x):
            while par[x] != x: par[x] = par[par[x]]; x = par[x]
            return x
        ed = {}
        for f in faces:
            ks = [(round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4)) for v in f.verts]
            for i in range(len(ks)):
                a, b = ks[i], ks[(i + 1) % len(ks)]
                if a != b: ed.setdefault((a, b) if a < b else (b, a), []).append((f.index, a < b))
        bad = set()
        for lst in ed.values():
            if len(lst) == 2 and lst[0][1] != lst[1][1]:
                ra, rb = find(lst[0][0]), find(lst[1][0])
                if ra != rb: par[ra] = rb
            else: bad.update(fi for fi, _ in lst)   # 邊界、三個面以上、方向不一致
        badr = {find(fi) for fi in bad}
        openr = set(badr)   # 真的開口的零件（下面 nodup、原本單面的例外只決定補不補反面；翻面只看真的封閉的）
        if nre: badr -= {find(f.index) for f in faces if nre.search(mname(f))}   # 一個零件只有一種材質（merge_by_material 以後）；混材質的零件有一面在 nodup 就整個不補
        # 原本就單面的材質（作者故意的：室內的天花板朝下，鏡頭超過天花板高度時看得穿——剖面視角）不補；第一次試便利商店，天花板補了朝上的那一面，從高處看整片擋住
        badr -= {find(f.index) for f in faces if f.material_index < len(mats) and mats[f.material_index] and mats[f.material_index].use_backface_culling}
        dup = [f for f in faces if find(f.index) in badr]
        # 封閉、方向一致、但裡外相反的零件（體積是負的；例如體育館主球場的欄杆收邊、樓梯防滑條、門板）：雙面時看不出來，單面以後從外面看到的是背面那幾片。
        # 薄的（有一邊小於 1 m：板、條、小盒子）翻成朝外；大的不動（可能是從裡面看的房間）
        # 鏡射的物件（負的縮放）：用到這個網格的物件全部鏡射就反過來看；有的鏡射有的沒有（instancing 混在一起）就不翻——翻了一定有一半變反
        dets = {ob.matrix_world.determinant() < 0 for ob in obs if ob.data is me}
        sgn = 0.0 if len(dets) > 1 else (-1.0 if dets == {True} else 1.0)
        comp = {}
        for f in faces:
            r = find(f.index)
            if r in openr: continue
            # 體積用 Python 的浮點數（64 位元）、以零件的第一個頂點當原點算：mathutils 的向量是 32 位元，離原點 20～130 m 的幾公分小零件
            # 從原點算，誤差比零件本身的體積還大、正負號會錯（美國校園第七份：站牌上 6 cm 的小方塊被翻反、一條石材收邊該翻沒翻，LAWWW2-C 10-27）
            vs = [tuple(v.co) for v in f.verts]; c = comp.setdefault(r, [0.0, [1e9] * 3, [-1e9] * 3, [], vs[0]]); c[3].append(f)
            q = [(p[0] - c[4][0], p[1] - c[4][1], p[2] - c[4][2]) for p in vs]
            for i in range(1, len(q) - 1):
                a_, b_, d_ = q[0], q[i], q[i + 1]
                c[0] += (a_[0] * (b_[1] * d_[2] - b_[2] * d_[1]) - a_[1] * (b_[0] * d_[2] - b_[2] * d_[0]) + a_[2] * (b_[0] * d_[1] - b_[1] * d_[0])) / 6.0
            for v in vs:
                for k in range(3): c[1][k] = min(c[1][k], v[k]); c[2][k] = max(c[2][k], v[k])
        flip = [f for c in comp.values() if c[0] * sgn < -1e-6 and 1e-3 <= min(c[2][k] - c[1][k] for k in range(3)) < 1.0 for f in c[3]]   # 扁的（一邊 < 1 mm）沒有裡外，不翻
        if not flip_ok: flip = []
        if flip and not dry: bmesh.ops.reverse_faces(bm, faces=flip)
        for f in flip: stats.setdefault('（翻面）' + mname(f), [0, 0])[0] += len(f.verts) - 2
        for f in faces:
            s = stats.setdefault(mname(f), [0, 0]); s[1 if find(f.index) in badr else 0] += len(f.verts) - 2
        if dup and not dry:
            nf = [g for g in bmesh.ops.duplicate(bm, geom=dup)['geom'] if isinstance(g, bmesh.types.BMFace)]
            bmesh.ops.reverse_faces(bm, faces=nf)
        if (dup or flip) and not dry: bm.to_mesh(me); me.update()
        bm.free()
    if not dry:
        used = {s.material for ob in obs if ob.data not in skipped for s in ob.material_slots if s.material}   # 只有 skip 的物件在用的材質不動
        for m in used:
            m.use_backface_culling = not kre.search(m.name)
    return stats
