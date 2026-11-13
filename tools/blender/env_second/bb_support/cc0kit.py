"""店面 CC0 化共用工具（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；幫手 g4 2026-11-13）。
照 tz_shops_interior.py（LAWWW2-C）那一套抽出來，給 bb_support/*_interior.py、flower_notes_interior.py 用：
  K = cc0kit.Kit(root, prefix)            # prefix＝材質名前綴（例 'lin'）
  K.acg(name, aid, target=, tile=, vary=, maps=, res=, rough_value=, metal=)   ambientCG 材質組（vary：顏色起伏壓到平均亮度的這個比例，塑膠 0.05、灰泥 0.04）
  K.printed(name, pid, draw, weave, amp=)                                       自畫圖案 × ambientCG 布／紙的明暗紋路
  K.ph_put(aid, x, y, z, yaw, s, share=, height=, decimate=, recolor=, part=, tag=)   Poly Haven 掃描模型（遊戲座標）
  RCMesh(name, mat, route, getmesh)       頂點色網格的轉接：paint() 的顏色在 route 表上的零件，finish() 時搬到那個材質組網格（box UV），
                                          所以 cbox／crbox／poly／ccyl／clathe／blob 不用改呼叫，照顏色分材質。表上沒有的顏色照舊頂點色。
  K.used()                                用到的 CC0 素材（登記 LICENSES.md）
下載到 ~/.cache/lawstudent_cc0（cc0_fetch.py），不進 repo。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
import numpy as np   # noqa: E402
from PIL import Image   # noqa: E402
import cc0_fetch   # noqa: E402

STAGE = os.path.join(cc0_fetch.CACHE, 'staged'); os.makedirs(STAGE, exist_ok=True)


def _stage(pid, diff, nor=None, rough=None):
    d = os.path.join(STAGE, pid); os.makedirs(d, exist_ok=True)
    for src_, suf in ((diff, 'diff'), (nor, 'nor_gl'), (rough, 'rough')):
        if not src_: continue
        dst = os.path.join(d, f'{pid}_{suf}_1k.jpg')
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src_): Image.open(src_).convert('RGB').save(dst, quality=92)


def _up_tex(sock, depth=0):
    """往上游找第一個有圖的 Image Texture 節點"""
    if depth > 6: return None
    for l in sock.links:
        n = l.from_node
        if n.type == 'TEX_IMAGE' and n.image: return n
        for i in n.inputs:
            t = _up_tex(i, depth + 1)
            if t: return t
    return None


class Kit:
    def __init__(self, root, prefix):
        self.root, self.pre = root, prefix; self.USED = []; self.PROTO = {}; self.N = {}

    def _use(self, src, aid):
        if (src, aid) not in self.USED: self.USED.append((src, aid))

    def used(self): return list(self.USED)

    # ---------- ambientCG 材質組 ----------
    def acg(self, name, aid, maps=('diff', 'nor'), res=512, vary=None, **kw):
        f = cc0_fetch.acg_material(aid); _stage(aid, f['color'], f.get('normal'), f.get('rough')); self._use('ambientCG', aid)
        pid = aid
        if vary:
            pid = f'{aid}_v{int(round(vary * 1000)):03d}'; src_ = os.path.join(STAGE, aid, f'{aid}_diff_1k.jpg'); d_ = os.path.join(STAGE, pid); os.makedirs(d_, exist_ok=True)
            a_ = np.asarray(Image.open(src_).convert('RGB'), float); lum = a_.mean(-1); m_, sd_ = lum.mean(), max(1e-3, lum.std())
            out = a_.mean((0, 1))[None, None, :] * (1 + vary * (lum - m_) / sd_)[..., None]
            Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(os.path.join(d_, f'{pid}_diff_1k.jpg'), quality=92)
            for suf in ('nor_gl', 'rough'):
                q_ = os.path.join(STAGE, aid, f'{aid}_{suf}_1k.jpg')
                if os.path.exists(q_): Image.open(q_).save(os.path.join(d_, f'{pid}_{suf}_1k.jpg'), quality=92)
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(f'{self.pre}_cc_{name}', pid, maps=maps, res=res, **kw)
        finally: L.tex_dir = old

    def acg_as(self, fullname, aid, **kw):
        """ambientCG 材質組，名字照原本的材質（烘焙、遊戲照名字找的）"""
        m = self.acg('as_' + fullname, aid, **kw); m.name = fullname; return m

    def glow(self, fullname, hexcol, emit, aid='Plastic006'):
        """發光的燈管、燈罩（乳白塑膠燈罩的 ambientCG 紋路＋發光）：材質名照舊（GLOW_…，遊戲、烘焙照名字找）"""
        m = self.acg('glow_' + fullname.lower(), aid, maps=('diff',), vary=0.02, target=hexcol, tile=0.5, rough_value=0.4, res=128, emit=emit)
        m.name = fullname; return m

    def printed(self, name, pid, draw, weave, size=512, amp=0.44, **kw):
        """自畫圖案：draw(PIL.ImageDraw, size) × ambientCG（weave）的明暗紋路"""
        from PIL import ImageDraw, ImageOps
        f = cc0_fetch.acg_material(weave); self._use('ambientCG', weave)
        im = Image.new('RGB', (size, size)); draw(ImageDraw.Draw(im), size)
        g = ImageOps.grayscale(Image.open(f['color']).convert('RGB').resize((size, size))); a = np.asarray(g, float); a = 0.78 + amp * (a - a.mean()) / max(1.0, a.std() * 3)
        out = np.clip(np.asarray(im, float) * a[..., None], 0, 255).astype('uint8'); p = os.path.join(STAGE, pid + '_src.jpg'); Image.fromarray(out).save(p, quality=92)
        _stage(pid, p, f.get('normal'))
        old = L.tex_dir; L.tex_dir = lambda q: STAGE if q == pid else old(q)
        try: return L.pbr(f'{self.pre}_cc_{name}', pid, maps=('diff', 'nor'), res=size, **kw)
        finally: L.tex_dir = old

    # ---------- Poly Haven 掃描模型 ----------
    @staticmethod
    def _ph_tex(o, res=512):
        for ms_ in o.material_slots:
            mt = ms_.material
            if not mt or not mt.use_nodes: continue
            N = mt.node_tree.nodes; bs = N.get('Principled BSDF')
            if bs:   # 顏色貼圖中間隔著 Mix（乘 AO、頂點色）的：顏色貼圖直接接 Base Color（不然下面會被當成沒用到的圖刪掉）
                tb = _up_tex(bs.inputs['Base Color'])
                if tb and not (bs.inputs['Base Color'].links and bs.inputs['Base Color'].links[0].from_node is tb): mt.node_tree.links.new(tb.outputs['Color'], bs.inputs['Base Color'])
            for n in list(N):
                if n.type != 'TEX_IMAGE' or not n.image: continue
                lk = list(n.outputs['Color'].links) + list(n.outputs['Alpha'].links); to = {l.to_socket.name for l in lk}
                keep_ = any((l.to_node.type == 'BSDF_PRINCIPLED' and l.to_socket.name in ('Base Color', 'Alpha')) or l.to_node.type == 'NORMAL_MAP' for l in lk)
                if not keep_:   # 粗糙度／金屬度（arm、rough）這些圖拿掉（看接到哪裡，不看檔名：metal_trash_can_diff 的名字裡就有 metal）
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

    def ph_obj(self, aid, height=None, decimate=None, recolor=None, part=None, tag='', texres=512):
        """Poly Haven 模型 → 原型（底部中心在原點、Blender 座標）。recolor＝(深, 亮) 照原圖明暗改成這兩色之間；part＝只留第幾個子物件"""
        key_ = aid + tag
        if key_ in self.PROTO: return self.PROTO[key_]
        path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); self._use('Poly Haven', aid)
        new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
        if part is not None:
            ms.sort(key=lambda o: o.name); keep = ms[part % len(ms)]; drop = [o for o in ms if o is not keep]
            new = [o for o in new if o not in drop]; ms = [keep]
            for o in drop: bpy.data.objects.remove(o)
        bpy.ops.object.select_all(action='DESELECT')
        for o in ms: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
        for o in new:
            if o.type != 'MESH': bpy.data.objects.remove(o)
        bpy.context.view_layer.objects.active = ms[0]
        if len(ms) > 1: bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        self._ph_tex(o, texres)
        if decimate:
            md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
        vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        k = height / (mx.z - mn.z) if height else 1.0
        o.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))))
        o['size'] = [(mx.x - mn.x) * k, (mx.y - mn.y) * k, (mx.z - mn.z) * k]
        if recolor:
            for ms_ in o.material_slots:
                b = ms_.material.node_tree.nodes.get('Principled BSDF') if ms_.material else None
                tn = _up_tex(b.inputs['Base Color']) if b else None
                if not tn: continue
                ms_.material.node_tree.links.new(tn.outputs['Color'], b.inputs['Base Color'])   # 中間有 Mix（乘頂點色、AO）的：直接接顏色貼圖
                src_ = bpy.path.abspath(tn.image.filepath)
                g = np.asarray(Image.open(src_).convert('L').resize((512, 512)), float) / 255.0; g = (g - g.min()) / max(1e-3, g.max() - g.min())
                c0, c1 = np.array(B.srgb(recolor[0])) ** (1 / 2.2), np.array(B.srgb(recolor[1])) ** (1 / 2.2)
                out = (c0[None, None, :] + (c1 - c0)[None, None, :] * g[..., None]) * 255; p = os.path.join(STAGE, f'{aid}{tag}_recolor.jpg'); Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(p, quality=92)
                tn.image = bpy.data.images.load(p); ms_.material.name = f'{self.pre}_ph_{aid}{tag}'
        else:
            for i, ms_ in enumerate(o.material_slots):
                if ms_.material: ms_.material.name = f'{self.pre}_ph_{aid}{tag}' + ('' if len(o.material_slots) < 2 else f'_{i}')
        o.name = 'PHPROTO_' + key_; o.hide_render = True; o.hide_set(True); self.PROTO[key_] = o; return o

    def ph_put(self, aid, x, y, z, yaw=0.0, s=1.0, share=True, parent=None, sx=None, **kw):
        """原型複製一份放在遊戲座標 (x, y, z)；yaw＝繞垂直軸轉（弧度）；s＝縮放（sx＝(x,y,z) 三軸各自縮放）；share=False＝自己一份網格（植物、要烘光照貼圖的）"""
        p = self.ph_obj(aid, **kw); o = bpy.data.objects.new(f'S_ph_{aid}_{self.N.setdefault(aid, 0)}', p.data if share else p.data.copy()); self.N[aid] += 1
        bpy.context.scene.collection.objects.link(o); o.parent = parent or self.root
        S_ = Matrix.Diagonal((sx[0], sx[2], sx[1], 1.0)) if sx else Matrix.Scale(s, 4)   # sx：遊戲 (x, y, z) → Blender (x, z, y) 的縮放
        o.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ S_; return o

    def remove_protos(self):
        for o in list(self.PROTO.values()):
            me = o.data; bpy.data.objects.remove(o)
            if me.users == 0: bpy.data.meshes.remove(me)
        self.PROTO.clear()


PALETTE = {}   # (網格, 顏色, 轉到哪) → 面數；CC0_PALETTE=1 時結束前印出來（決定 route 表用）
if os.environ.get('CC0_PALETTE'):
    import atexit
    atexit.register(lambda: [print('PAL', k[0], k[1], k[2] or '-', v) for k, v in sorted(PALETTE.items(), key=lambda kv: -kv[1])])


class RCMesh(CMesh):
    """頂點色網格：paint() 的顏色在 route 上（hex 小寫 → 材質組鍵）的面，finish() 時搬到 getmesh(鍵) 的網格（之後那個網格自己 box UV）"""
    def __init__(self, name, mat, route, getmesh):
        super().__init__(name, mat); self.getmesh = getmesh
        self.route = route if callable(route) else (lambda h, d={k.lower(): v for k, v in route.items()}: d.get(h))
        self.rid = self.bm.faces.layers.int.new('rid'); self.keys = []

    def paint(self, faces, hexcol, k=1.0):
        key = self.route((hexcol or '').lower())
        pk = (self.name, (hexcol or '').lower(), key); PALETTE[pk] = PALETTE.get(pk, 0) + len(faces)
        if key:
            if key not in self.keys: self.keys.append(key)
            i = self.keys.index(key) + 1
            for f in faces: f[self.rid] = i
        return super().paint(faces, hexcol, k)

    def flush(self):
        """把有轉接的面搬走（finish 之前；也可以自己先呼叫）"""
        if not self.keys: return
        for i, key in enumerate(self.keys, 1):
            cp = self.bm.copy(); rl = cp.faces.layers.int.get('rid')
            bmesh.ops.delete(cp, geom=[f for f in cp.faces if f[rl] != i], context='FACES')
            for lay in list(cp.loops.layers.float_color.values()): cp.loops.layers.float_color.remove(lay)
            cp.faces.layers.int.remove(cp.faces.layers.int.get('rid'))
            if cp.faces: self.getmesh(key).add_bm(cp)
            cp.free()
        bmesh.ops.delete(self.bm, geom=[f for f in self.bm.faces if f[self.rid] > 0], context='FACES')
        self.keys = []

    def finish(self, *a, **k):
        self.flush()
        if self.rid is not None and self.bm.faces.layers.int.get('rid'): self.bm.faces.layers.int.remove(self.bm.faces.layers.int.get('rid')); self.rid = None
        return super().finish(*a, **k)


class AsTex:
    """把畫成某個顏色的頂點色呼叫（cbox／crbox）轉成某個材質組網格（顏色參數不用）"""
    def __init__(self, m): self.m = m; self.bm = m.bm
    def __getattr__(self, k): return getattr(self.m, k)
    def paint(self, *a, **k): return a[0] if a else None
    def cbox(self, x0, x1, y0, y1, z0, z1, col=None, k=1.0): self.m.box(x0, x1, y0, y1, z0, z1)
    def crbox(self, x0, x1, y0, y1, z0, z1, col=None, k=1.0, r=0.03, seg=2): self.m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg)


def hsv(hexcol):
    import colorsys
    r, g, b = (int(hexcol[i:i + 2], 16) / 255 for i in (1, 3, 5)); h, s_, v = colorsys.rgb_to_hsv(r, g, b); return h * 360, s_, v


def std_route(metal=False, extra=None, keep_sat=True):
    """照顏色分族（jit() 抖過的顏色也分得到）：
    頂點色（metal=False）：白／淺灰 → plastic_w、中灰 → plastic_g、深灰黑 → plastic_dk、牛皮紙色 → cardboard、深咖啡 → wood_d；
    金屬（metal=True）：亮 → metal_l、中 → metal_m、暗 → metal_dk、金色 → brass。
    extra＝{hex: 鍵} 先查（指定顏色）；keep_sat＝飽和的顏色（文具、葉子、食物）照舊頂點色"""
    ex = {k.lower(): v for k, v in (extra or {}).items()}
    def f(h):
        if h in ex: return ex[h]
        if not h or len(h) != 7: return None
        hu, s_, v = hsv(h)
        if metal:
            if s_ > 0.3 and 30 <= hu <= 60 and v > 0.5: return 'brass'
            if s_ < 0.25: return 'metal_l' if v > 0.7 else ('metal_m' if v > 0.4 else 'metal_dk')
            return None
        if s_ < 0.14: return 'plastic_w' if v > 0.8 else ('plastic_g' if v > 0.4 else 'plastic_dk')
        if 18 <= hu <= 45 and 0.2 <= s_ <= 0.6 and 0.5 <= v <= 0.85: return 'cardboard'
        if 10 <= hu <= 45 and s_ >= 0.25 and v < 0.4: return 'wood_d'
        return None if keep_sat else 'plastic_w'
    return f


def std_mats(K, M):
    """std_route 用到的材質組（ambientCG），寫進 M（已經有的鍵不蓋）"""
    add = dict(
        plastic_w=lambda: K.acg('plastic_w', 'Plastic006', vary=0.05, target='#ebeae6', tile=0.5, rough_value=0.45),
        plastic_g=lambda: K.acg('plastic_g', 'Plastic006', vary=0.05, maps=('diff',), target='#94979c', tile=0.5, rough_value=0.45, res=256),
        plastic_dk=lambda: K.acg('plastic_dk', 'Plastic006', vary=0.05, maps=('diff',), target='#2c2e32', tile=0.5, rough_value=0.45, res=256),
        cardboard=lambda: K.acg('cardboard', 'Cardboard001', tile=0.6, rough_value=0.85),
        wood_d=lambda: K.acg('wood_d', 'Wood049', maps=('diff',), target='#4a3424', tile=0.6, rough_value=0.5, res=256),
        metal_l=lambda: K.acg('metal_l', 'Metal009', target='#c4c8cc', tile=0.7, metal=0.4, rough_value=0.32),
        metal_m=lambda: K.acg('metal_m', 'Metal009', maps=('diff',), target='#8a8f97', tile=0.7, metal=0.4, rough_value=0.38, res=256),
        metal_dk=lambda: K.acg('metal_dk', 'Metal009', maps=('diff',), target='#2e3034', tile=0.7, metal=0.3, rough_value=0.45, res=256),
        brass=lambda: K.acg('brass', 'Metal009', maps=('diff',), target='#c8a24a', tile=0.5, metal=0.4, rough_value=0.35, res=256),
    )
    for k, fn in add.items():
        if k not in M: M[k] = fn()
    return M


def palette(meshes):
    """頂點色網格用到的顏色 → 面數（決定 route 表用）"""
    out = {}
    for m in meshes:
        lay = m.bm.loops.layers.float_color.get('Col')
        if not lay: continue
        for f in m.bm.faces:
            c = f.loops[0][lay]; sr = lambda v: v * 12.92 if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
            h = '#%02x%02x%02x' % tuple(int(round(max(0, min(1, sr(c[i]))) * 255)) for i in range(3))
            out[(m.name, h)] = out.get((m.name, h), 0) + 1
    return out
