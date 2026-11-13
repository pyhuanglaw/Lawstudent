# CC0 素材的共用小工具（SHOP-CC0-HELP-1113，AA-C 2026-11-13；照 tz_shops_interior.py 裡 LAWWW2-C 的 acg／ph_obj／ph_put／_Route／_AsTex 搬出來、改成不靠全域變數）
#   給 lane118_shops.py（118 巷九間）用；做法、驗收標準：docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md
#   ambientCG 材質組：cc0_fetch 下載 → 照 Poly Haven 的檔名放到快取的 staged 資料夾 → L.pbr（target＝調成這個平均色、tile＝每幾公尺重複一次）
#   Poly Haven 掃描模型：ph_obj() 匯入、合成一個網格、減面、縮放，當原型；ph_put() 複製放到遊戲座標
#   用到的每一件記在 USED（建模最後印出來，LICENSES.md 照抄）
import os, math
import numpy as np
from PIL import Image
import lib2 as L
from lib2 import B, g2b, bpy, Vector, Matrix
import cc0_fetch

STAGE = os.path.join(cc0_fetch.CACHE, 'staged'); os.makedirs(STAGE, exist_ok=True)
USED = []


def _use(kind, aid):
    if (kind, aid) not in USED: USED.append((kind, aid))


def _stage(pid, diff, nor=None, rough=None):
    d = os.path.join(STAGE, pid); os.makedirs(d, exist_ok=True)
    for src_, suf in ((diff, 'diff'), (nor, 'nor_gl'), (rough, 'rough')):
        if not src_: continue
        dst = os.path.join(d, f'{pid}_{suf}_1k.jpg')
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src_): Image.open(src_).convert('RGB').save(dst, quality=92)


def acg(name, aid, maps=('diff', 'nor'), res=512, vary=None, **kw):
    """ambientCG 材質組 → L.pbr 材質。vary：顏色貼圖的明暗起伏壓到平均亮度的這個比例（塑膠 0.05、灰泥 0.04；不壓會有黑紋、雲斑）"""
    f = cc0_fetch.acg_material(aid); _stage(aid, f['color'], f.get('normal'), f.get('rough')); _use('ambientCG', aid)
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


class AsTex:
    """把「畫成某個顏色的頂點色零件」的呼叫轉到一個材質組網格（顏色參數不用）"""
    def __init__(self, m_): self.m = m_; self.bm = m_.bm
    def __getattr__(self, k): return getattr(self.m, k)
    def paint(self, *a, **k): pass
    def cbox(self, x0, x1, y0, y1, z0, z1, col=None, k=1.0): self.m.box(x0, x1, y0, y1, z0, z1)
    def crbox(self, x0, x1, y0, y1, z0, z1, col=None, k=1.0, r=0.02, seg=2): self.m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg)
    def poly(self, pts, col=None, k=1.0): self.m.quad(pts)


class Route:
    """CMesh 的轉接：cbox／crbox／poly 照顏色（route 表：hex → 材質組網格）分過去；表上沒有的顏色、直接用 .bm＋paint 的（ccyl、clathe）照舊頂點色"""
    def __init__(self, base, route): self.base = base; self.route = {k.lower(): v for k, v in route.items()}; self.bm = base.bm
    def __getattr__(self, k): return getattr(self.base, k)
    def _m(self, col):
        v = self.route.get((col or '').lower())
        if v is not None and not hasattr(v, 'box'): v = self.route[(col or '').lower()] = v()   # 值可以是「回傳網格的函式」：用到才建（牆的分組網格）
        return v
    def cbox(self, x0, x1, y0, y1, z0, z1, col, k=1.0):
        m_ = self._m(col); (m_.box(x0, x1, y0, y1, z0, z1) if m_ else self.base.cbox(x0, x1, y0, y1, z0, z1, col, k=k))
    def crbox(self, x0, x1, y0, y1, z0, z1, col, k=1.0, r=0.02, seg=2):
        m_ = self._m(col); (m_.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg) if m_ else self.base.crbox(x0, x1, y0, y1, z0, z1, col, k=k, r=r, seg=seg))
    def poly(self, pts, col, k=1.0):
        m_ = self._m(col); (m_.quad(pts) if m_ else self.base.poly(pts, col, k=k))


def _ph_tex(o, res=512):
    """Poly Haven 材質瘦身：粗糙度／金屬度的圖拿掉改固定值（單通道的圖匯出 WebP 會失敗、手機也不需要）；顏色、法線縮成 res"""
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


def _box_uv_obj(o, tile=0.5):
    """換成材質組以後，原本的 UV 對不上材質組的尺寸：照世界座標重做盒狀 UV（每 tile 公尺重複一次）"""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(o.data); uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for lp in f.loops:
            co = lp.vert.co; u, v = (co.y, co.z) if ax == 0 else ((co.x, co.z) if ax == 1 else (co.x, co.y)); lp[uv].uv = (u / tile, v / tile)
    bm.to_mesh(o.data); bm.free()


class PH:
    """Poly Haven 模型：一個 aid 一個原型（隱藏），put() 複製到遊戲座標、掛在 root 底下。prefix＝材質名的開頭（例：l118_cafe2_ph_）"""
    def __init__(self, root, prefix):
        self.root = root; self.prefix = prefix; self.proto = {}; self.n = {}

    def obj(self, aid, height=None, decimate=None, recolor=None, length=None, chair=False, material=None):
        if aid in self.proto: return self.proto[aid]
        path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); _use('Poly Haven', aid)
        new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
        bpy.ops.object.select_all(action='DESELECT')
        for o in ms: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
        for o in new:
            if o.type != 'MESH': bpy.data.objects.remove(o)
        bpy.context.view_layer.objects.active = ms[0]
        if len(ms) > 1: bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        _ph_tex(o)
        if decimate:
            md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
        vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        k = height / (mx.z - mn.z) if height else (length / max(mx.x - mn.x, mx.y - mn.y) if length else 1.0)
        o.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))))
        if chair:   # 椅子：靠背轉到 +y（前面＝−y＝遊戲的 +z）
            ht = max(v.co.z for v in o.data.vertices); top = [v.co.y for v in o.data.vertices if v.co.z > ht * 0.8]
            if top and sum(top) / len(top) < 0: o.data.transform(Matrix.Rotation(math.pi, 4, 'Z'))
        if recolor:
            for ms_ in o.material_slots:
                b = ms_.material.node_tree.nodes.get('Principled BSDF') if ms_.material else None
                ln = b and b.inputs['Base Color'].links
                if not ln or ln[0].from_node.type != 'TEX_IMAGE': continue
                tn = ln[0].from_node; src_ = bpy.path.abspath(tn.image.filepath)
                g = np.asarray(Image.open(src_).convert('L').resize((512, 512)), float) / 255.0; g = (g - g.min()) / max(1e-3, g.max() - g.min())
                c0, c1 = np.array(B.srgb(recolor[0])) ** (1 / 2.2), np.array(B.srgb(recolor[1])) ** (1 / 2.2)
                out = (c0[None, None, :] + (c1 - c0)[None, None, :] * g[..., None]) * 255; p = os.path.join(STAGE, f'{aid}_recolor_{recolor[0][1:]}.jpg'); Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(p, quality=92)
                tn.image = bpy.data.images.load(p)
        if material is not None:   # 形狀用掃描的、材質換成店裡的材質組（例：白烤漆的圓凳 → 不鏽鋼）
            o.data.materials.clear(); o.data.materials.append(material)
            _box_uv_obj(o)
        for i, ms_ in enumerate(o.material_slots):
            if material is not None: break
            if ms_.material: ms_.material.name = self.prefix + aid + ('' if len(o.material_slots) < 2 else f'_{i}')
        o.name = 'PHPROTO_' + aid; o.hide_render = True; o.hide_set(True); self.proto[aid] = o; return o

    def put(self, aid, x, y, z, yaw=0.0, s=1.0, share=True, wall=None, **kw):
        """原型複製一份放在遊戲座標 (x, y, z)；yaw＝繞垂直軸轉（弧度）。share＝False：自己一份網格（植物：烘焙時不會被合併改名）。
        wall＝(面, dir)：放在牆上的東西（層板上的罐子…）跟著那一面牆淡出（物件名 WALL_<面>_…＋extras dir，和牆的分組網格一樣）"""
        p = self.obj(aid, **kw); nm = f'ph_{aid}_{self.n.setdefault(aid, 0)}'; self.n[aid] += 1
        o = bpy.data.objects.new((f'WALL_{wall[0]}_' if wall else 'S_') + nm, p.data if share else p.data.copy())
        if wall: o['dir'] = list(wall[1])
        bpy.context.scene.collection.objects.link(o); o.parent = self.root
        o.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Scale(s, 4); return o

    def cleanup(self):
        """匯出前把隱藏的原型刪掉（不然會跟著匯出）"""
        for o in self.proto.values(): bpy.data.objects.remove(o)
        self.proto = {}
