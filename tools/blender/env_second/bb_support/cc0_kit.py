"""bb_support 店內模型的 CC0 工具（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161；第③群幫手 2026-11-13）。
從 tz_shops_interior.py 的 acg／printed／ph_obj／ph_put／_Route 原樣抽出來（同一套做法，見 docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md 第 3 節），
讓 bb_support/*_interior.py 共用：
    import cc0_kit
    K = cc0_kit.Kit(root, prefix='dabu_')          # root＝店的根物件
    m = K.acg('dabu_box', 'Cardboard004', target='#c9a878', vary=0.05)   # ambientCG 材質組 → L.pbr 材質
    K.ph_put('potted_plant_04', x, y, z, yaw, height=1.2, share=False)   # Poly Haven 掃描模型（遊戲座標）
    ...
    K.report()   # 最後印 CC0_USED（登記 LICENSES.md 用）
下載快取在 ~/.cache/lawstudent_cc0（cc0_fetch.py），不進 repo。"""
import math, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, Vector, Matrix   # noqa: E402
import cc0_fetch   # noqa: E402


class Kit:
    def __init__(self, root, prefix):
        self.root = root; self.prefix = prefix; self.used = []; self.proto = {}; self.n = {}
        self.stage_dir = os.path.join(cc0_fetch.CACHE, 'staged'); os.makedirs(self.stage_dir, exist_ok=True)

    def _stage(self, pid, diff, nor=None, rough=None):
        d = os.path.join(self.stage_dir, pid); os.makedirs(d, exist_ok=True)
        for src_, suf in ((diff, 'diff'), (nor, 'nor_gl'), (rough, 'rough')):
            if not src_: continue
            dst = os.path.join(d, f'{pid}_{suf}_1k.jpg')
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src_): Image.open(src_).convert('RGB').save(dst, quality=92)

    def _pbr(self, name, pid, **kw):
        old = L.tex_dir; L.tex_dir = lambda q: self.stage_dir if q == pid else old(q)
        try: return L.pbr(name, pid, **kw)
        finally: L.tex_dir = old

    def acg(self, name, aid, maps=('diff', 'nor'), res=512, vary=None, **kw):
        """ambientCG 材質組 → L.pbr 材質。vary：顏色貼圖的明暗起伏壓到平均亮度的這個比例（塑膠 0.05、灰泥 0.04；不壓會有黑紋、雲斑）"""
        f = cc0_fetch.acg_material(aid); self._stage(aid, f['color'], f.get('normal'), f.get('rough')); self.used.append(('ambientCG', aid))
        pid = aid
        if vary:
            pid = f'{aid}_v{int(round(vary * 100)):02d}'; src_ = os.path.join(self.stage_dir, aid, f'{aid}_diff_1k.jpg'); d_ = os.path.join(self.stage_dir, pid); os.makedirs(d_, exist_ok=True)
            a_ = np.asarray(Image.open(src_).convert('RGB'), float); lum = a_.mean(-1); m_, sd_ = lum.mean(), max(1e-3, lum.std())
            out = a_.mean((0, 1))[None, None, :] * (1 + vary * (lum - m_) / sd_)[..., None]
            Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(os.path.join(d_, f'{pid}_diff_1k.jpg'), quality=92)
            for suf in ('nor_gl', 'rough'):
                q_ = os.path.join(self.stage_dir, aid, f'{aid}_{suf}_1k.jpg')
                if os.path.exists(q_): Image.open(q_).save(os.path.join(d_, f'{pid}_{suf}_1k.jpg'), quality=92)
        return self._pbr(name, pid, maps=maps, res=res, **kw)

    def vc_tex(self, name, aid, layer='Col', metal=None, **kw):
        """ambientCG 材質組 × 頂點色（每一件自己的顏色）：給「一個網格很多種顏色」的東西（球拍框、塑膠盒）。
        貼圖校成接近白（target 預設 #f2f2f2），乘上頂點色＝那一件的顏色＋材質的細紋、法線。glTF：baseColorTexture＋COLOR_0（three.js 自動相乘）"""
        kw.setdefault('target', '#f2f2f2'); m = self.acg(name, aid, **kw); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
        ln = bs.inputs['Base Color'].links
        if not ln: return m
        src = ln[0].from_socket; vc = N.new('ShaderNodeVertexColor'); vc.layer_name = layer
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        nt.links.new(src, mx.inputs[6]); nt.links.new(vc.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], bs.inputs['Base Color'])
        if metal is not None: bs.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
        return m

    def printed(self, name, pid, draw, weave, size=512, amp=0.12, **kw):
        """自製圖案：draw(PIL.ImageDraw, size) 畫，乘上 ambientCG（weave）的明暗紋路（amp：包裝紙 0.12）"""
        f = cc0_fetch.acg_material(weave); self.used.append(('ambientCG', weave))
        from PIL import ImageDraw, ImageOps
        im = Image.new('RGB', (size, size)); draw(ImageDraw.Draw(im), size)
        g = ImageOps.grayscale(Image.open(f['color']).convert('RGB').resize((size, size))); a = np.asarray(g, float); a = 0.78 + amp * (a - a.mean()) / max(1.0, a.std() * 3)
        out = np.clip(np.asarray(im, float) * a[..., None] / 0.78, 0, 255).astype('uint8'); p = os.path.join(self.stage_dir, pid + '_src.jpg'); Image.fromarray(out).save(p, quality=92)
        self._stage(pid, p, f.get('normal'))
        return self._pbr(name, pid, maps=('diff', 'nor'), res=size, **kw)

    def _ph_tex(self, o, res=512):
        """Poly Haven 材質瘦身：粗糙度／金屬度圖拿掉改固定值；顏色、法線縮成 res"""
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
                dst = os.path.join(self.stage_dir, os.path.splitext(os.path.basename(src_))[0] + f'_{res}' + ('.png' if alpha else '.jpg')); (im.save(dst) if alpha else im.save(dst, quality=90))
                cs = n.image.colorspace_settings.name; n.image = bpy.data.images.load(dst); n.image.colorspace_settings.name = cs
            if bs:
                for k_ in ('Roughness', 'Metallic'):
                    for l in list(bs.inputs[k_].links): mt.node_tree.links.remove(l)
                bs.inputs['Roughness'].default_value = 0.65; bs.inputs['Metallic'].default_value = 0.0

    def ph_obj(self, aid, height=None, decimate=None, recolor=None, part=None, tag='', fit=None):
        """Poly Haven 模型 → 原型網格（底部中心在原點、Blender 座標）。height：縮到這個高度；fit=(寬,深,高)：三軸各自縮到這個大小（箱子）；
        recolor=(深, 亮)：顏色貼圖改成兩色之間（照原圖明暗）；part：只留第幾個網格；decimate：減面比例"""
        key_ = aid + tag
        if key_ in self.proto: return self.proto[key_]
        path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); self.used.append(('Poly Haven', aid))
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
        self._ph_tex(o)
        if decimate:
            md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
        vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        T = Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z)))
        if fit:   # 遊戲的 (寬 x, 深 z, 高 y) → Blender (x, y, z)
            S = Matrix.Diagonal((fit[0] / (mx.x - mn.x), fit[1] / (mx.y - mn.y), fit[2] / (mx.z - mn.z), 1.0))
        else:
            S = Matrix.Scale(height / (mx.z - mn.z) if height else 1.0, 4)
        o.data.transform(S @ T)
        if recolor:
            for ms_ in o.material_slots:
                b = ms_.material.node_tree.nodes.get('Principled BSDF') if ms_.material else None
                ln = b and b.inputs['Base Color'].links
                if not ln or ln[0].from_node.type != 'TEX_IMAGE': continue
                tn = ln[0].from_node; src_ = bpy.path.abspath(tn.image.filepath)
                g = np.asarray(Image.open(src_).convert('L').resize((512, 512)), float) / 255.0; g = (g - g.min()) / max(1e-3, g.max() - g.min())
                c0, c1 = np.array(B.srgb(recolor[0])) ** (1 / 2.2), np.array(B.srgb(recolor[1])) ** (1 / 2.2)
                out = (c0[None, None, :] + (c1 - c0)[None, None, :] * g[..., None]) * 255; p = os.path.join(self.stage_dir, f'{aid}{tag}_recolor.jpg'); Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(p, quality=92)
                tn.image = bpy.data.images.load(p); ms_.material.name = self.prefix + 'ph_' + aid + tag
        else:
            for ms_ in o.material_slots:
                if ms_.material: ms_.material.name = self.prefix + 'ph_' + aid + ('' if len(o.material_slots) < 2 else '_' + ms_.material.name[-8:])
        o.name = 'PHPROTO_' + key_; o.hide_render = True; o.hide_set(True); self.proto[key_] = o; return o

    def ph_put(self, aid, x, y, z, yaw=0.0, s=1.0, share=True, sxyz=None, **kw):
        """原型複製一份放在遊戲座標 (x, y, z)；yaw＝繞垂直軸（弧度）；s 整體縮放、sxyz＝(x, z, y) 遊戲軸各自縮放；
        share＝False：自己一份網格（植物：烘焙會把共用網格合併改名）"""
        p = self.ph_obj(aid, **kw); k_ = aid + kw.get('tag', '')
        o = bpy.data.objects.new(f'S_ph_{k_}_{self.n.setdefault(k_, 0)}', p.data if share else p.data.copy()); self.n[k_] += 1
        bpy.context.scene.collection.objects.link(o); o.parent = self.root
        S = Matrix.Diagonal((sxyz[0] * s, sxyz[1] * s, sxyz[2] * s, 1.0)) if sxyz else Matrix.Scale(s, 4)
        o.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ S; return o

    def report(self):
        import json
        print('CC0_USED', json.dumps(sorted(set(self.used)), ensure_ascii=False))


class AsTex:
    """把「畫成某個顏色的頂點色零件」的呼叫（cbox／crbox）轉到某個材質組網格（顏色參數不用）"""
    def __init__(self, m_): self.m = m_; self.bm = m_.bm
    def __getattr__(self, k): return getattr(self.m, k)
    def paint(self, *a, **k): pass
    def cbox(self, x0, x1, y0, y1, z0, z1, col=None): self.m.box(x0, x1, y0, y1, z0, z1)
    def crbox(self, x0, x1, y0, y1, z0, z1, col=None, r=0.03, seg=2): self.m.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg)


class Route:
    """頂點色網格的轉接：cbox／crbox／poly 照顏色（route：{'#hex': 材質組網格}）分到材質組網格；表上沒有的顏色照舊頂點色"""
    def __init__(self, base, route): self.base = base; self.route = {k.lower(): v for k, v in route.items()}; self.bm = base.bm
    def __getattr__(self, k): return getattr(self.base, k)
    def _m(self, col): return self.route.get((col or '').lower())
    def cbox(self, x0, x1, y0, y1, z0, z1, col):
        m_ = self._m(col); (m_.box(x0, x1, y0, y1, z0, z1) if m_ else self.base.cbox(x0, x1, y0, y1, z0, z1, col))
    def crbox(self, x0, x1, y0, y1, z0, z1, col, r=0.03, seg=2):
        m_ = self._m(col); (m_.rbox(x0, x1, y0, y1, z0, z1, r=r, seg=seg) if m_ else self.base.crbox(x0, x1, y0, y1, z0, z1, col, r=r, seg=seg))
    def poly(self, pts, col):
        m_ = self._m(col); (m_.quad(pts) if m_ else self.base.poly(pts, col))
