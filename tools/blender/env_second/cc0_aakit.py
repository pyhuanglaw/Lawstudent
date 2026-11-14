"""CC0 共用工具（給 aa_kit 腳本：aa_support/*_interior.py）（SHOP-REALISM-1112，D159／D160／D161；LAWWW2-C 11-13）：從 tz_shops_interior.py 的 `if CC0:` 區塊抽出來，給 aa_kit、lane118、bb_support 這些別的建模腳本共用。

用法（腳本裡材質表、root 都建好以後）：
    import cc0_aakit as cc0_kit
    K0 = cc0_kit.Kit(L, B, root, g2b, prefix='a23_')
    M['oak'] = K0.acg('a23_oak', 'Wood066', target='#8a6440', tile=0.8)          # ambientCG 材質組
    K0.ph_put('potted_plant_02', x, 0.0, z, yaw, 1.0, height=1.2, share=False, decimate=0.05)   # Poly Haven 掃描模型
    K0.split_vc(vmeshes, {'#5a3c26': M['oak'], ...}, make_mesh)                  # aa_kit 的頂點色零件照顏色分到材質組
    ...匯出前 K0.cleanup()（刪 Poly Haven 原型）；K0.used 是用到的 CC0 素材清單（LICENSES.md 要登記）
"""
import math, os
import numpy as np
from PIL import Image
import cc0_fetch
import bpy
from mathutils import Matrix, Vector

STAGE = os.path.join(cc0_fetch.CACHE, 'staged'); os.makedirs(STAGE, exist_ok=True)


def _stage(pid, diff, nor=None, rough=None):
    d = os.path.join(STAGE, pid); os.makedirs(d, exist_ok=True)
    for src_, suf in ((diff, 'diff'), (nor, 'nor_gl'), (rough, 'rough')):
        if not src_: continue
        dst = os.path.join(d, f'{pid}_{suf}_1k.jpg')
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src_): Image.open(src_).convert('RGB').save(dst, quality=92)


def _hex(c):   # 線性 RGB（0～1）→ sRGB 色碼
    f = lambda v: 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
    return '#%02x%02x%02x' % tuple(int(round(max(0.0, min(1.0, f(v))) * 255)) for v in c[:3])


def _rgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


class Kit:
    def __init__(self, L, B, root, g2b, prefix='cc0_'):
        self.L, self.B, self.root, self.g2b, self.P = L, B, root, g2b, prefix
        self.used = []; self.proto = {}; self.n = {}

    # ---- ambientCG 材質組（target＝調到這個平均色；tile＝每幾公尺重複；vary＝顏色起伏壓到平均亮度的這個比例，塑膠用 0.05）
    def acg(self, name, aid, maps=('diff', 'nor'), res=512, vary=None, **kw):
        L = self.L; f = cc0_fetch.acg_material(aid); _stage(aid, f['color'], f.get('normal'), f.get('rough')); self.used.append(('ambientCG', aid))
        pid = aid
        if vary:
            pid = f'{aid}_v{int(round(vary * 100)):02d}'; src_ = os.path.join(STAGE, aid, f'{aid}_diff_1k.jpg'); d_ = os.path.join(STAGE, pid); os.makedirs(d_, exist_ok=True)
            a_ = np.asarray(Image.open(src_).convert('RGB'), float); lum = a_.mean(-1); m_, sd_ = lum.mean(), max(1e-3, lum.std())
            out = a_.mean((0, 1))[None, None, :] * (1 + vary * (lum - m_) / sd_)[..., None]
            Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(os.path.join(d_, f'{pid}_diff_1k.jpg'), quality=92)
            for suf in ('nor_gl', 'rough'):
                q_ = os.path.join(STAGE, aid, f'{aid}_{suf}_1k.jpg')
                if os.path.exists(q_): Image.open(q_).save(os.path.join(d_, f'{pid}_{suf}_1k.jpg'), quality=92)
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(name, pid, maps=maps, res=res, **kw)
        finally: L.tex_dir = old

    # ---- 自製印花：draw(PIL.ImageDraw, size) 畫圖案，乘上 ambientCG 布料／紙（weave）的明暗紋路
    def printed(self, name, pid, draw, weave, size=512, amp=0.44, **kw):
        L = self.L; f = cc0_fetch.acg_material(weave); self.used.append(('ambientCG', weave))
        from PIL import ImageDraw, ImageOps
        im = Image.new('RGB', (size, size)); draw(ImageDraw.Draw(im), size)
        g = ImageOps.grayscale(Image.open(f['color']).convert('RGB').resize((size, size))); a = np.asarray(g, float); a = 0.78 + amp * (a - a.mean()) / max(1.0, a.std() * 3)
        out = np.clip(np.asarray(im, float) * a[..., None], 0, 255).astype('uint8'); p = os.path.join(STAGE, pid + '_src.jpg'); Image.fromarray(out).save(p, quality=92)
        _stage(pid, p, f.get('normal'))
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(name, pid, maps=('diff', 'nor'), res=size, **kw)
        finally: L.tex_dir = old

    # ---- Poly Haven 掃描模型
    def _ph_tex(self, o, res=512):
        for ms_ in o.material_slots:
            mt = ms_.material
            if not mt or not mt.use_nodes: continue
            N = mt.node_tree.nodes; bs = N.get('Principled BSDF')
            for n in list(N):
                if n.type != 'TEX_IMAGE' or not n.image: continue
                nm = n.image.name.lower(); to = {l.to_socket.name for l in n.outputs['Color'].links} | {l.to_socket.name for l in n.outputs['Alpha'].links}
                if not ({'Base Color', 'Alpha', 'Color'} & to) or '_arm' in nm or 'rough' in nm or 'metal' in nm:
                    N.remove(n); continue
                src_ = bpy.path.abspath(n.image.filepath)
                if not os.path.exists(src_): continue
                im = Image.open(src_); alpha = im.mode in ('RGBA', 'LA') and 'Alpha' in to
                im = im.convert('RGBA' if alpha else 'RGB')
                if max(im.size) > res: im = im.resize((res, res), Image.LANCZOS)
                dst = os.path.join(STAGE, os.path.splitext(os.path.basename(src_))[0] + f'_{res}' + ('.png' if alpha else '.jpg')); (im.save(dst) if alpha else im.save(dst, quality=90))
                cs = n.image.colorspace_settings.name; n.image = bpy.data.images.load(dst); n.image.colorspace_settings.name = cs
            if bs:
                for k_ in ('Roughness', 'Metallic'):
                    for l in list(bs.inputs[k_].links): mt.node_tree.links.remove(l)
                bs.inputs['Roughness'].default_value = 0.65; bs.inputs['Metallic'].default_value = 0.0

    def ph_obj(self, aid, height=None, decimate=None, tag=''):
        """Poly Haven 模型 → 一個網格原型（底部中心在原點、Blender 座標）；同一個 aid+tag 只載入一次"""
        key_ = aid + tag
        if key_ in self.proto: return self.proto[key_]
        path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); self.used.append(('Poly Haven', aid))
        new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
        bpy.ops.object.select_all(action='DESELECT')
        for o in ms: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
        for o in new:
            if o.type != 'MESH': bpy.data.objects.remove(o)
        bpy.context.view_layer.objects.active = ms[0]
        if len(ms) > 1: bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        self._ph_tex(o)
        if decimate:
            md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
        vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        k = height / (mx.z - mn.z) if height else 1.0
        o.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))))
        for ms_ in o.material_slots:
            if ms_.material: ms_.material.name = self.P + 'ph_' + aid + ('' if len(o.material_slots) < 2 else '_' + ms_.material.name[-8:])
        o.name = 'PHPROTO_' + key_; o.hide_render = True; o.hide_set(True); self.proto[key_] = o; return o

    def ph_put(self, aid, x, y, z, yaw=0.0, s=1.0, share=True, **kw):
        """原型複製一份放在遊戲座標 (x, y, z)；share=False：自己一份網格（植物要這樣，光照烘焙才認得出來不排進光照貼圖）"""
        p = self.ph_obj(aid, **kw); o = bpy.data.objects.new(f'{self.P}ph_{aid}_{self.n.setdefault(aid, 0)}', p.data if share else p.data.copy()); self.n[aid] += 1
        bpy.context.scene.collection.objects.link(o); o.parent = self.root
        o.matrix_world = Matrix.Translation(self.g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Scale(s, 4); return o

    def cleanup(self):
        for p_ in self.proto.values(): bpy.data.objects.remove(p_)
        self.proto = {}
        print('CC0_USED', sorted(set(self.used)))

    # ---- aa_kit 這類「頂點色累積網格」：每個面照它的頂點色（取第一個角）找最接近的 route 顏色（距離 < tol），搬到那個材質組的網格；找不到的留在原網格
    def split_vc(self, vmeshes, route, make_mesh, tol=26.0):
        """vmeshes：VMesh 的清單（有 .bm、float_color 'Col' 層）；route：{'#色碼': 材質}；make_mesh(vm, mat)＝回傳要把面加進去的 Mesh（有 .bm）。回傳 {色碼: 面數}"""
        import bmesh
        keys = list(route.keys()); pal = np.array([_rgb(k) for k in keys]); moved = {}
        for vm in vmeshes:
            bm = vm.bm; lay = bm.loops.layers.float_color.get('Col')
            if not lay: continue
            go = {}
            for f in bm.faces:
                c = _rgb(_hex(f.loops[0][lay])); d = np.sqrt(((pal - c) ** 2).sum(1)); i = int(d.argmin())
                if d[i] < tol: go.setdefault(i, []).append(f)
            for i, fs in go.items():
                dst = make_mesh(vm, route[keys[i]]); vmap = {}
                for f in fs:
                    vs = []
                    for v in f.verts:
                        if v not in vmap: vmap[v] = dst.bm.verts.new(v.co.copy())
                        vs.append(vmap[v])
                    try: dst.bm.faces.new(vs)
                    except ValueError: pass
                moved[keys[i]] = moved.get(keys[i], 0) + len(fs)
                bmesh.ops.delete(bm, geom=fs, context='FACES_ONLY')
            loose = [v for v in bm.verts if not v.link_faces]
            if loose: bmesh.ops.delete(bm, geom=loose, context='VERTS')
        return moved
