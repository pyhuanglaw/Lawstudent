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
        groups.setdefault((ob.data.materials[0].name, key(ob)), []).append(ob)
    n_before = sum(len(v) for v in groups.values()); made = 0
    for (mname, k), obs in groups.items():
        if len(obs) < 2: continue
        bm = bmesh.new()
        for ob in obs:
            me = ob.data.copy(); me.transform(ob.matrix_world); bm.from_mesh(me); bpy.data.meshes.remove(me)
        name = (k + '_' if k else '') + mname
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(obs[0].data.materials[0])
        props = dict(obs[0].items()) if k else {}
        for ob in obs: old = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(old)
        nob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(nob); nob.parent = root
        for kk, vv in props.items(): nob[kk] = vv
        made += 1
    print(json.dumps({'merge_by_material': {'objects_in': n_before, 'merged_into': made}}))
