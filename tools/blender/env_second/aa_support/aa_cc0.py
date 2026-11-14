"""AA 做的溫州街店內（小路、SUNNY SIDE、一盞、木曜日、日常失速）改用 CC0 素材（SHOP-REALISM-1112／SHOP-CC0-HELP-1113，D159、D160、D161）。
做法照 docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md（LAWWW2-C）；這支是給 aa_kit.Shop 用的版本（tz_shops_interior.py 的 acg／ph_put 搬過來）：
  1. 頂點色零件（vc 霧面、vcm 金屬、vcg 亮面）整群換成 CC0 材質組：顏色照舊用頂點色（設計的顏色不變），
     乘上 ambientCG 材質組的明暗紋路（顏色貼圖校成中性灰、起伏壓到 vary）＋法線貼圖——glTF 的 baseColorTexture × COLOR_0，three.js 照規格相乘。
     ROUTE 表（色碼 → 種類）把某些顏色分到別的材質組（木頭的木紋、皮革、布、陶、竹……），表上沒有的照 vc／vcm／vcg 的預設組。
  2. Poly Haven 掃描模型：ph_put（原型＋複製；減面；植物 share=False）。
用法（在店的腳本裡、sh.finish 之前）：
    import aa_cc0 as C
    C.enable(sh, route={'#5b3b27': 'wood', ...})     # 換掉頂點色材質，finish 時照顏色分
    C.ph_put(sh, 'ceramic_vase_01', x, y, z, yaw, height=0.2, decimate=0.1)
    ... sh.finish(OUT) ...（enable 已經包好 finish）；C.used() 印出用到的 CC0 素材（LICENSES.md 登記）
"""
import math, os
import numpy as np
from PIL import Image
import aa_kit as K
from aa_kit import L, B, bpy, bmesh, Matrix, Vector, g2b
import cc0_fetch   # noqa: E402（env_second，aa_kit 已經加進 sys.path）

STAGE = os.path.join(cc0_fetch.CACHE, 'staged_aa'); os.makedirs(STAGE, exist_ok=True)
USED = []

# 種類 → (ambientCG id, vary＝明暗起伏, tile＝幾公尺重複一次, 法線強度, 粗糙度, 金屬度)
# vc／vcg／vcm 的 vary 0.015／0.02／0.025、法線 0.08～0.12（一盞的壁櫥用 0.03 還看得到雲狀斑；一盞的壁櫥、SUNNY SIDE 的冰箱大面積有雲狀斑；第一版 0.05／0.05／0.10：SUNNY SIDE 的冰箱、咖啡機、白檯面大面積看起來髒、有條紋）
KINDS = {
    'vc':      ('Plaster001',  0.015, 0.6, 0.08, 0.72, 0.0),    # 霧面漆、紙、布以外的小東西：細的霧面顆粒
    'vcg':     ('Plastic006',  0.02, 0.5, 0.10, 0.30, 0.0),    # 亮面：陶、瓷、玻璃瓶、塑膠（vary 0.05：白塑膠不會有黑紋）
    'vcm':     ('Metal009',    0.025, 0.6, 0.12, 0.40, 0.35),   # 金屬：髮絲紋
    'wood':    ('Wood049',     0.22, 0.9, 0.35, 0.55, 0.0),    # 木頭：木紋
    'leather': ('Leather037',  0.18, 0.5, 0.55, 0.50, 0.0),    # 皮革
    'fabric':  ('Fabric030',   0.16, 0.25, 0.60, 0.85, 0.0),   # 布：織紋
    'ceramic': ('Plaster001',  0.08, 0.35, 0.30, 0.35, 0.0),   # 陶（粗陶、土鍋）：比亮面粗
    'bamboo':  ('Bamboo001A',  0.18, 0.5, 0.40, 0.55, 0.0),   # 竹
    'paper':   ('Paper001',    0.10, 0.4, 0.25, 0.85, 0.0),    # 紙、和紙
    'stone':   ('Concrete034', 0.10, 0.8, 0.40, 0.70, 0.0),    # 石、水泥
    'wicker':  ('Wicker010A',  0.35, 0.25, 0.70, 0.70, 0.0),   # 藤編（曲木椅的坐墊）
}
LEVEL = 242   # 中性紋路的平均亮度（sRGB 0～255）；頂點色乘 1／(線性值) 補回來，整體顏色不變


def _lin1(v): v = v / 255.0; return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


COMP = 1.0 / _lin1(LEVEL)


def _neutral(aid, vary):
    """ambientCG 顏色貼圖 → 中性灰的明暗紋路（平均 LEVEL、起伏 vary×平均亮度）"""
    pid = f'{aid}_n{int(round(vary * 100)):02d}'; dst = os.path.join(STAGE, pid + '.jpg')
    f = cc0_fetch.acg_material(aid)
    if not os.path.exists(dst):
        a = np.asarray(Image.open(f['color']).convert('L').resize((512, 512), Image.LANCZOS), float)
        out = LEVEL * (1 + vary * (a - a.mean()) / max(1e-3, a.std()))
        Image.fromarray(np.clip(out, 0, 255).astype('uint8')).convert('RGB').save(dst, quality=92)
    if ('ambientCG', aid) not in USED: USED.append(('ambientCG', aid))
    return dst, f.get('normal')


def _img(path, name, res, noncolor=False):
    return L._img_from_file(path, name, res, noncolor)


def detail_mat(name, kind, res=256):
    """頂點色 × CC0 紋路（＋法線）的材質"""
    aid, vary, tile, nstr, rough, metal = KINDS[kind]
    m = L.vc_material(name, rough=rough)
    if metal: m.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    col, nor = _neutral(aid, vary); nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    vc = [n for n in N if n.type == 'VERTEX_COLOR'][0]
    tx = N.new('ShaderNodeTexImage'); tx.image = _img(col, f'{aid}_n{int(round(vary * 100)):02d}_{res}', res)
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs[0].default_value = 1.0
    nt.links.new(tx.outputs['Color'], mx.inputs[6]); nt.links.new(vc.outputs['Color'], mx.inputs[7]); nt.links.new(mx.outputs[2], bs.inputs['Base Color'])
    if nor and nstr > 0:
        tn = N.new('ShaderNodeTexImage'); tn.image = _img(nor, f'{aid}_nor_{res}', res, noncolor=True)
        nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstr
        nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    m['tile'] = tile; return m


def _face_col(f, lay):
    c = f.loops[0][lay]; return (c[0], c[1], c[2])


def enable(sh, route=None, tol=2e-3):
    """sh：aa_kit.Shop。換掉 vc／vcm／vcg 三個材質，並包好 sh.finish（finish 時照 route 分顏色、做盒狀 UV、補亮度）"""
    # route 的鍵：'#色碼'（只分霧面 vc 的零件）或 'vcg:#色碼'／'vcm:#色碼'（分亮面、金屬的零件）
    RT = {'vc': {}, 'vcg': {}, 'vcm': {}}
    for k_, v_ in (route or {}).items():
        src, h_ = (k_.split(':', 1) if ':' in k_ else ('vc', k_)); RT[src][h_.lower()] = v_
    route = {h: v for d in RT.values() for h, v in d.items()}
    for key in ('vc', 'vcm', 'vcg'):
        old = sh.M[key]; nm = old.name; old.name = nm + '_old'
        sh.M[key] = detail_mat(nm, key)
    kinds = sorted(k for k in set(route.values()) if k not in sh.M)   # 新的頂點色材質組（材質名 <前綴>vc_<種類>）；sh.M 已經有的（wood…）直接併進那個材質
    for k in kinds: sh.M[k] = detail_mat(sh.P + 'vc_' + k, k)
    orig = sh.finish

    def split(vm, mk_target, src):
        """一個頂點色網格 → 照顏色分到 route 的種類（mk_target(kind) 給那個種類的累積網格）"""
        bm = vm.bm; lay = bm.loops.layers.float_color.get('Col'); rt = RT[src]; lin = {h: K._lin(h)[:3] for h in rt}
        if lay is None or not bm.faces or not rt: return
        groups = {}; bm.faces.index_update(); bm.faces.ensure_lookup_table()
        for f in bm.faces:
            c = _face_col(f, lay)
            for h, lc in lin.items():
                if max(abs(c[i] - lc[i]) for i in range(3)) < tol: groups.setdefault(rt[h], []).append(f.index); break
        bm.faces.ensure_lookup_table()
        for kind, idx in groups.items():
            tgt = mk_target(kind); keep = set(idx)
            cp = bm.copy(); cp.faces.index_update()
            bmesh.ops.delete(cp, geom=[f for f in cp.faces if f.index not in keep], context='FACES')
            if not isinstance(tgt, K.VMesh): cp.loops.layers.float_color.remove(cp.loops.layers.float_color['Col'])
            tgt.add_bm(cp); cp.free()
        dead = [bm.faces[i] for idx in groups.values() for i in idx]
        if dead: bmesh.ops.delete(bm, geom=dead, context='FACES')

    def prep(vm):
        bm = vm.bm; lay = bm.loops.layers.float_color.get('Col')
        if lay is None or not bm.faces: return
        for f in bm.faces:
            for lp in f.loops:
                c = lp[lay]; lp[lay] = (min(1.0, c[0] * COMP), min(1.0, c[1] * COMP), min(1.0, c[2] * COMP), 1.0)
        B.box_uv(bm, vm.mat['tile'] if 'tile' in vm.mat else 1.0)

    def finish(out, keep=lambda ob: False, extra_info=None):
        cleanup()
        for (key, lvl), vm in list(sh._acc.items()):
            if key in RT: split(vm, lambda kind, lvl=lvl: sh.a(kind, lvl), key)
        for side, ms in sh.walls.items():
            for key, vm in list(ms.items()):
                if key in RT: split(vm, lambda kind, side=side: _wall_vm(sh, side, kind) if kind in kinds else sh.w(side, kind), key)
        for (key, lvl), vm in sh._acc.items():
            if isinstance(vm, K.VMesh): prep(vm); vm.uv_auto = False
        for side, ms in sh.walls.items():
            for key, vm in ms.items():
                if isinstance(vm, K.VMesh): prep(vm)
        return orig(out, keep=keep, extra_info=extra_info)
    sh.finish = finish
    sh.a_orig = sh.a

    def a(key, lvl=''):   # 新種類的累積網格也要是頂點色網格
        k = (key, lvl)
        if k not in sh._acc and key in kinds:
            v = K.VMesh((lvl + '_' if lvl else '') + sh.P + 'vc_' + key, sh.M[key]); v.lvl = lvl; v.uv_auto = False; sh._acc[k] = v
        return sh.a_orig(key, lvl)
    sh.a = a
    return sh


def _wall_vm(sh, side, kind):
    ms = sh.walls[side]
    if kind not in ms: ms[kind] = K.VMesh(f'{side}_vc_{kind}', sh.M[kind])
    return ms[kind]


# ---------------------------------------------------------------- Poly Haven 掃描模型
PROTO = {}; NPUT = {}


def _ph_tex(o, res=512):
    """Poly Haven 材質瘦身（tz_shops_interior.py 同名函式）：粗糙度／金屬度的圖拿掉改固定值；顏色、法線縮成 res"""
    for ms_ in o.material_slots:
        mt = ms_.material
        if not mt or not mt.use_nodes: continue
        N = mt.node_tree.nodes; bs = N.get('Principled BSDF')
        for n in list(N):
            if n.type != 'TEX_IMAGE' or not n.image: continue
            nm = n.image.name.lower(); to = {l.to_socket.name for l in n.outputs['Color'].links} | {l.to_socket.name for l in n.outputs['Alpha'].links}
            if not ({'Base Color', 'Alpha', 'Color'} & to) or '_arm' in nm or 'rough' in nm or 'metal' in nm:
                N.remove(n); continue
            src = bpy.path.abspath(n.image.filepath)
            if not os.path.exists(src): continue
            im = Image.open(src); alpha = im.mode in ('RGBA', 'LA') and 'Alpha' in to
            im = im.convert('RGBA' if alpha else 'RGB')
            if max(im.size) > res: im = im.resize((res, res), Image.LANCZOS)
            dst = os.path.join(STAGE, os.path.splitext(os.path.basename(src))[0] + f'_{res}' + ('.png' if alpha else '.jpg')); (im.save(dst) if alpha else im.save(dst, quality=90))
            cs = n.image.colorspace_settings.name; n.image = bpy.data.images.load(dst); n.image.colorspace_settings.name = cs
        if bs:
            for k_ in ('Roughness', 'Metallic'):
                for l in list(bs.inputs[k_].links): mt.node_tree.links.remove(l)
            bs.inputs['Roughness'].default_value = 0.6; bs.inputs['Metallic'].default_value = 0.0


def ph_obj(sh, aid, height=None, decimate=None, recolor=None, part=None, tag='', res=512):
    """Poly Haven 模型 → 原型網格（底部中心在原點；height＝縮放到這個高度；decimate＝減面比例；recolor＝(深, 亮) 改顏色保留紋理；part＝只留第幾個物件）"""
    key = aid + tag
    if key in PROTO: return PROTO[key]
    path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path)
    if ('Poly Haven', aid) not in USED: USED.append(('Poly Haven', aid))
    new = [o for o in bpy.data.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
    if part is not None:
        ms.sort(key=lambda o: o.name); kp = ms[part % len(ms)]; drop = [o for o in ms if o is not kp]
        new = [o for o in new if o not in drop]; ms = [kp]
        for o in drop: bpy.data.objects.remove(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in ms: mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
    for o in new:
        if o.type != 'MESH': bpy.data.objects.remove(o)
    bpy.context.view_layer.objects.active = ms[0]
    if len(ms) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    _ph_tex(o, res)
    if decimate:
        md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate; bpy.ops.object.modifier_apply(modifier=md.name)
    vs = [v.co for v in o.data.vertices]
    mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    k = height / (mx.z - mn.z) if height else 1.0
    o.data.transform(Matrix.Scale(k, 4) @ Matrix.Translation(-Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))))
    if recolor:
        for ms_ in o.material_slots:
            b = ms_.material.node_tree.nodes.get('Principled BSDF') if ms_.material else None
            ln = b and b.inputs['Base Color'].links
            if not ln or ln[0].from_node.type != 'TEX_IMAGE': continue
            tn = ln[0].from_node; src = bpy.path.abspath(tn.image.filepath)
            g = np.asarray(Image.open(src).convert('L').resize((512, 512)), float) / 255.0; g = (g - g.min()) / max(1e-3, g.max() - g.min())
            c0, c1 = np.array(B.srgb(recolor[0])) ** (1 / 2.2), np.array(B.srgb(recolor[1])) ** (1 / 2.2)
            out = (c0[None, None, :] + (c1 - c0)[None, None, :] * g[..., None]) * 255; p = os.path.join(STAGE, f'{aid}{tag}_recolor.jpg')
            Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(p, quality=92); tn.image = bpy.data.images.load(p)
    for i, ms_ in enumerate(o.material_slots):
        if ms_.material: ms_.material.name = f'{sh.P}ph_{key}' + ('' if len(o.material_slots) < 2 else f'_{i}')
    o.name = 'PHPROTO_' + key; o.hide_render = True; o.hide_set(True); PROTO[key] = o
    print('PH', key, 'tris', sum(len(p.vertices) - 2 for p in o.data.polygons), 'size', [round(v, 3) for v in (mx - mn) * k], flush=True)
    return o


def ph_put(sh, aid, x, y, z, yaw=0.0, s=1.0, share=True, lvl='', **kw):
    """原型複製一份放在遊戲座標 (x, y, z)；yaw＝繞垂直軸（弧度）；s＝這一份再縮放；share=False＝自己一份網格（植物）"""
    p = ph_obj(sh, aid, **kw); key = aid + kw.get('tag', ''); n = NPUT.setdefault(key, 0); NPUT[key] += 1
    o = bpy.data.objects.new(f'{(lvl + "_") if lvl else ""}{sh.P}ph_{key}_{n}', p.data if share else p.data.copy())
    bpy.context.scene.collection.objects.link(o); o.parent = sh.root
    o.matrix_world = Matrix.Translation(g2b(x, y, z)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Scale(s, 4)
    if lvl: o['level'] = 1
    return o


def cleanup():
    """原型（藏起來的）刪掉，不匯出"""
    for o in PROTO.values():
        if o.name in bpy.data.objects: bpy.data.objects.remove(o)
    PROTO.clear()


def used():
    print('CC0_USED', USED, flush=True); return USED


def fern_plants(sh, small=0.7):
    """這間店的小盆栽（sh.plant 高度 < small，aa_kit 會畫成黃金葛葉片卡）、垂吊黃金葛（sh.hanging_pothos）
    一律改成 Poly Haven 掃描：planter_pot_clay＋fern_02 單株（a／d 輪流）；大落地盆栽（plants.py 的模型葉子）照舊。
    蕨類減面到 0.45（木曜日畫出三角形要 ≤ 8 萬）。木曜日 v2.2（LAWWW2-C 11-14：「小盆栽一律用 planter_pot_clay＋fern_02 單株；垂吊的就用 fern_02 掛在盆上，不要葉片卡」）"""
    orig = sh.plant; n = [0]

    def plant(x, z, h=1.0, r=0.2, pot_col='#b0653e', y0=0.0, lvl='', seed=0):
        if h >= small: return orig(x, z, h=h, r=r, pot_col=pot_col, y0=y0, lvl=lvl, seed=seed)
        k = n[0]; n[0] += 1; ph = max(0.09, r * 1.6)
        ph_put(sh, 'planter_pot_clay', x, y0, z, yaw=k * 1.3, s=ph / 0.12, height=0.12, decimate=0.25, lvl=lvl)
        p = (k % 2) * 3; ph_put(sh, 'fern_02', x, y0 + ph * 0.65, z, yaw=k * 2.1 + 0.4, s=max(0.45, h * 1.7), part=p, tag=f'_p{p}', decimate=0.45, lvl=lvl)

    def hanging(leaf_mat_key, x, y, z, n_=9, drop=0.6, lvl='', size=0.16, n=None):
        k = plant_n[0]; plant_n[0] += 1; p = (k % 2) * 3
        ph_put(sh, 'fern_02', x, y - 0.03, z, yaw=k * 1.7 + 0.9, s=0.65 + 0.35 * min(drop, 1.0), part=p, tag=f'_p{p}', decimate=0.45, lvl=lvl)
    plant_n = [0]
    sh.plant = plant; sh.hanging_pothos = lambda leaf_mat_key, x, y, z, n=9, drop=0.6, lvl='', size=0.16: hanging(leaf_mat_key, x, y, z, drop=drop, lvl=lvl, size=size)
    return sh
