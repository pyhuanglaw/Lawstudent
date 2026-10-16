"""室內植物（Blender bpy）：大葉盆栽（一片一片的模型葉子）、室內樹（細樹幹＋小葉葉片卡）、蕨類（葉片卡）。
萬才館室內、霖澤館室內用（2026-10-11：大廳的盆栽原本是多面體圓球，看起來像玩具；總圖大廳 library_interior.py 先換掉，同一套做法搬到這裡共用）。
座標用遊戲座標 (x 東, y 上, z 南)，內部用 g2b 轉成 Blender。
葉片貼圖：第二個 AI 的 tools/blender/env_second/gen_leaves.py 程式產生的 olive_leaves.png、fern_leaves.png（本作，不是外部素材）；透明度用 alpha clip（glTF MASK）、雙面。
用法：
  import plants as PL
  PM = PL.materials('wc_')                        # bark、leaf_dark、leaf_mid、leaf_small、leaf_fern
  PL.potted(mesh_obj, PM, f'{pre}_plant_{i}', parent, x, y_pot_top, z, r, seed)
mesh_obj(name, bm, mat, parent) 是各腳本自己的「bmesh → 物件」小工具。"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'env_second', 'textures', 'gen')


def g2b(x, y, z): return Vector((x, -z, y))


def _srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)


def _solid(name, hexcol, rough, double=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*_srgb(hexcol), 1.0); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = 0.0
    if double: m.use_backface_culling = False
    return m


def _leaf_card_mat(name, png, rough=0.7):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, png))
    Lk.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], rnd.inputs[0]); Lk.new(rnd.outputs[0], bsdf.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False
    return m


def materials(prefix):
    """材質名稱以 prefix 開頭，葉子的材質名稱含 leaf_（各腳本匯出時讓 leaf_ 的網格用平滑著色）"""
    return {'bark': _solid(prefix + 'bark', '#6a5644', 0.9),
            'soil': _solid(prefix + 'soil_pot', '#3b2d22', 0.95),
            'leaf_dark': _solid(prefix + 'leaf_dark', '#2f5130', 0.42, double=True),
            'leaf_mid': _solid(prefix + 'leaf_mid', '#3f6a3a', 0.42, double=True),
            'leaf_small': _leaf_card_mat(prefix + 'leaf_small', 'olive_leaves.png'),
            'leaf_fern': _leaf_card_mat(prefix + 'leaf_fern', 'fern_leaves.png')}


def _cyl(mesh_obj, name, mat, a, b, r, parent, seg=6, r2=None):
    pa, pb = g2b(*a), g2b(*b); d = pb - pa
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot.to_matrix()); bmesh.ops.translate(bm, verts=bm.verts, vec=(pa + pb) / 2)
    bm.normal_update(); return mesh_obj(name, bm, mat, parent)


def leaf_mesh(bm, base, yaw, pitch, Lf, Wf, droop, fold=0.18, n=6):
    """一片模型葉子：沿主脈 n 段、每段左緣／主脈／右緣三點；主脈稍微隆起、兩側往下彎、葉尖往下垂。
    base＝葉柄端（遊戲座標）；yaw＝葉子朝哪個方向（繞 y）、pitch＝往上翹（正）或往下（負）"""
    rot = Matrix.Rotation(yaw, 3, 'Y') @ Matrix.Rotation(pitch, 3, 'Z'); b = Vector(base); rows = []
    for i in range(n + 1):
        t = i / n; w = Wf * (math.sin(math.pi * min(1.0, t * 1.08)) ** 0.75) if i < n else 0.0
        y_ = -droop * t * t
        rows.append([bm.verts.new(g2b(*(b + rot @ Vector((t * Lf, y_ + (fold * Wf if s == 0 else -0.25 * w), s * w))))) for s in (-1, 0, 1)])
    for i in range(n):
        a, c = rows[i], rows[i + 1]
        if i < n - 1: bm.faces.new((a[0], a[1], c[1], c[0])); bm.faces.new((a[1], a[2], c[2], c[1]))
        else: bm.faces.new((a[0], a[1], c[1])); bm.faces.new((a[1], a[2], c[1]))


def broad_plant(mesh_obj, PM, pre, parent, x, y0, z, h, r, seed, stems=5, leaf_n=6):
    """大葉盆栽（橡膠樹、琴葉榕一類）：5 根莖（stems：遠看的可以少一點）從盆裡往上、往外，莖的上半段左右交錯長出 6–9 片模型葉子（深綠、中綠兩種）"""
    rnd = random.Random(seed); bms = [bmesh.new(), bmesh.new()]
    for k in range(stems):
        a = k * 6.283 / stems + rnd.uniform(-0.35, 0.35); lean = rnd.uniform(0.08, 0.28); hh = h * rnd.uniform(0.65, 1.0)
        tx, tz = x + math.cos(a) * hh * lean, z + math.sin(a) * hh * lean
        _cyl(mesh_obj, f'{pre}_stem_{k}', PM['bark'], (x + math.cos(a) * 0.03, y0, z + math.sin(a) * 0.03), (tx, y0 + hh, tz), 0.014, parent, seg=5, r2=0.008)
        nl = rnd.randint(6, 9)
        for j in range(nl):
            t = 0.3 + 0.7 * (j + 1) / nl; px, py, pz = x + (tx - x) * t, y0 + hh * t, z + (tz - z) * t
            ya = a + (j % 2 - 0.5) * 2.2 + rnd.uniform(-0.5, 0.5)
            Lf = r * rnd.uniform(0.42, 0.62) * (0.75 + 0.35 * (1 - t)); Wf = Lf * rnd.uniform(0.36, 0.46)
            leaf_mesh(bms[rnd.random() < 0.4], (px, py, pz), -ya, rnd.uniform(-0.1, 0.55) + (0.35 if j == nl - 1 else 0), Lf, Wf, droop=Lf * rnd.uniform(0.15, 0.4), n=leaf_n)
    for bm, mk in zip(bms, ('leaf_dark', 'leaf_mid')):
        bm.normal_update(); mesh_obj(f'{pre}_{mk}', bm, PM[mk], parent)


def potted(mesh_obj, PM, pre, parent, x, y_top, z, r, seed, h=1.35):
    """花盆上面的土＋大葉盆栽（盆本身各腳本自己做）：y_top＝盆口高度、r＝盆口半徑"""
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=r * 0.92, radius2=r * 0.92, depth=0.02)
    bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(x, y_top - 0.03, z)); bm.normal_update(); mesh_obj(f'{pre}_soil', bm, PM['soil'], parent)
    broad_plant(mesh_obj, PM, pre, parent, x, y_top - 0.02, z, h, r * 1.15, seed)
