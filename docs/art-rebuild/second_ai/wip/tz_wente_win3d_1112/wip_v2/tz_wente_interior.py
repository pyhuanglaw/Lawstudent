"""汀州路溫特寶邸（古著・二手服飾）店內 v2（SHOP-WINDOW-3D-1112；LAWWW2-C 2026-11-12）
使用者 11-12 19:5x 對 v1（街景模型裡用同一種方塊拼、平塗顏色）：「醜到爆又沒質感 跟2d差太多了 可以停止複製貼上一樣大小的方塊嗎」。
這一版照概念圖 docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/shop_wentebaodi.webp：
  · 衣服是衣服的形狀（肩線、袖子、下擺；長短寬窄、厚薄、角度每一件不一樣），布料有紋理（格子、丹寧、亞麻、燈芯絨），木衣架；
  · 假人是平滑的人台（不是方塊），穿皮夾克（開襟、翻領、袖子）、米白襯衫、牛仔褲、皮帶；
  · 木頭用 Poly Haven 胡桃木貼圖（CC0），地板淺色木（D112），天花板米白灰泥；
  · 燈光：三盞黃銅吊燈、軌道投射燈打在衣服上、彩色玻璃檯燈；Cycles 把光、影、反彈光一起烘進一張貼圖（遊戲裡不用即時光）。
輸出：一顆 GLB（房間中心在原點；遊戲座標 x 從街上看左→右、z 往街（正面 z=+D/2）、y 往上），一個材質、一張烘好的貼圖。
遊戲：tingzhou3d.js 用 Z3.shopInsideReal 擺在玻璃後面（和汀州路另外七間一樣），打烊整間變暗＋鐵捲門。以後開放走進去也用這一顆。
用法：/opt/blenv/bin/python tools/blender/env_second/tz_wente_interior.py -- --out assets/models/env/second_ai/tz_wente_interior.glb
      [--preview <png 前綴>（不烘、直接渲染三個鏡頭看樣子）] [--res 2048] [--samples 96]
"""
import bpy, bmesh, sys, os, math, random
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
OUT = arg('--out'); PREVIEW = arg('--preview'); RES = int(arg('--res', '2048')); SAMPLES = int(arg('--samples', '96'))
HERE = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(HERE, 'textures')
sys.path.insert(0, HERE); import cc0_fetch   # SHOP-REALISM-1112：Poly Haven 掃描模型、ambientCG 材質組（CC0，下載到快取）
W, D, H = 4.96, 3.6, 3.1         # 寬（沿街）、深、高——寬原本 5.2：隔壁汀州聯通的店內東牆伸進來 5 cm、白牆擋住這間的側牆；改成和玻璃兩側的牆（±2.48～2.5）對齊
rr = random.Random(11)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
# Blender 座標：X＝遊戲 x、Y＝−遊戲 z（Blender −Y＝往街）、Z＝遊戲 y
FRONT, BACK = -D / 2, D / 2

# ---------------- 材質 ----------------
MATS = {}
def img(name):
    p = os.path.join(TEX, name)
    return bpy.data.images.load(p, check_existing=True)

def mat_tex(name, diff, scale=1.0, tint=None, rough=0.6, nor=None, rot=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale); mp.inputs['Rotation'].default_value[2] = rot
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = img(diff); ti.projection = 'BOX'; ti.projection_blend = 0.3
    nt.links.new(mp.outputs['Vector'], ti.inputs['Vector'])
    col = ti.outputs['Color']
    if tint:
        mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        mx.inputs[7].default_value = (*tint, 1); nt.links.new(col, mx.inputs[6]); col = mx.outputs[2]
    nt.links.new(col, b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if nor:
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = img(nor); tn.image.colorspace_settings.name = 'Non-Color'; tn.projection = 'BOX'; tn.projection_blend = 0.3
        nt.links.new(mp.outputs['Vector'], tn.inputs['Vector']); nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 0.8
        nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    MATS[name] = m; return m

def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

def mat_col(name, hx, rough=0.7, metal=0.0, emit=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*hexc(hx), 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*hexc(hx), 1); b.inputs['Emission Strength'].default_value = emit
    MATS[name] = m; return m

def mat_fabric(name, hx, kind='plain', hx2=None, scale=22.0):
    """布料：plain＝素色＋亞麻紋；plaid＝格子（兩個方向的條紋疊起來）；denim＝丹寧（斜紋雜訊）；cord＝燈芯絨（細直條）"""
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = 0.85
    tc = nt.nodes.new('ShaderNodeTexCoord'); c1 = (*hexc(hx), 1); c2 = (*hexc(hx2 or '#e8e0cc'), 1)
    lin = nt.nodes.new('ShaderNodeTexImage'); lin.image = img('rough_linen/rough_linen_diff_1k.jpg'); lin.projection = 'BOX'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (3, 3, 3); nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], lin.inputs['Vector'])
    base = nt.nodes.new('ShaderNodeMix'); base.data_type = 'RGBA'
    if kind == 'plaid':
        sx = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sx.inputs['Vector'])
        def stripe(axis):
            mt = nt.nodes.new('ShaderNodeMath'); mt.operation = 'MULTIPLY'; mt.inputs[1].default_value = scale; nt.links.new(sx.outputs[axis], mt.inputs[0])
            sn = nt.nodes.new('ShaderNodeMath'); sn.operation = 'SINE'; nt.links.new(mt.outputs[0], sn.inputs[0])
            gt = nt.nodes.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.35; nt.links.new(sn.outputs[0], gt.inputs[0]); return gt
        a, bz = stripe('Z'), stripe('X'); mx = nt.nodes.new('ShaderNodeMath'); mx.operation = 'ADD'; nt.links.new(a.outputs[0], mx.inputs[0]); nt.links.new(bz.outputs[0], mx.inputs[1])
        mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = 0.5; nt.links.new(mx.outputs[0], mul.inputs[0])
        nt.links.new(mul.outputs[0], base.inputs['Factor'])
    elif kind == 'denim':
        nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 90; nz.inputs['Detail'].default_value = 6
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector']); rm = nt.nodes.new('ShaderNodeMapRange'); rm.inputs['From Min'].default_value = 0.35; rm.inputs['From Max'].default_value = 0.75
        nt.links.new(nz.outputs['Fac'], rm.inputs['Value']); nt.links.new(rm.outputs['Result'], base.inputs['Factor'])
    elif kind == 'cord':
        wv = nt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 60; wv.bands_direction = 'Z'
        nt.links.new(tc.outputs['Object'], wv.inputs['Vector']); rm = nt.nodes.new('ShaderNodeMapRange'); rm.inputs['To Max'].default_value = 0.35
        nt.links.new(wv.outputs['Fac'], rm.inputs['Value']); nt.links.new(rm.outputs['Result'], base.inputs['Factor'])
    else:
        base.inputs['Factor'].default_value = 0.0
    base.inputs[6].default_value = c1; base.inputs[7].default_value = c2
    mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 0.55
    nt.links.new(base.outputs[2], mul.inputs[6]); nt.links.new(lin.outputs['Color'], mul.inputs[7])
    # 亞麻貼圖偏灰，乘完補亮
    br = nt.nodes.new('ShaderNodeBrightContrast'); br.inputs['Bright'].default_value = 0.06; nt.links.new(mul.outputs[2], br.inputs['Color'])
    nt.links.new(br.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m; return m

def mat_leather(name, hx):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = 0.45
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 14; nz.inputs['Detail'].default_value = 8
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*[c * 0.55 for c in hexc(hx)], 1); cr.color_ramp.elements[1].color = (*hexc(hx), 1)
    nt.links.new(nz.outputs['Fac'], cr.inputs['Fac']); nt.links.new(cr.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m; return m

def mat_tiffany(name):
    """彩色玻璃燈罩：Voronoi 一格一格不同顏色、會發光"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    vo = nt.nodes.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 26
    cr = nt.nodes.new('ShaderNodeValToRGB'); e = cr.color_ramp.elements
    e[0].position = 0.0; e[0].color = (*hexc('#c8781e'), 1); e[1].position = 1.0; e[1].color = (*hexc('#e8c060'), 1)
    for p, h in ((0.3, '#7a3a18'), (0.55, '#d89a38'), (0.8, '#5a7a3a')): el = e.new(p); el.color = (*hexc(h), 1)
    nt.links.new(vo.outputs['Color'], cr.inputs['Fac'])
    nt.links.new(cr.outputs['Color'], b.inputs['Base Color']); nt.links.new(cr.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 2.2
    MATS[name] = m; return m


def mat_acg(name, aid, scale=4.0, tint=None, rough_mul=1.0, nstr=1.0):
    """ambientCG 材質組（顏色＋法線＋粗糙度＋AO）：不是一個純色；tint 乘在顏色上（同一塊布做不同顏色）"""
    if name in MATS: return MATS[name]
    t = cc0_fetch.acg_material(aid); m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale); nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    def tex(path, data=False):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(path, check_existing=True); n.projection = 'BOX'; n.projection_blend = 0.35
        if data: n.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector']); return n
    col = tex(t['color']).outputs['Color']
    if 'ao' in t:
        ao = tex(t['ao'], True); mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        nt.links.new(col, mx.inputs[6]); nt.links.new(ao.outputs['Color'], mx.inputs[7]); col = mx.outputs[2]
    if tint:
        mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        mx.inputs[7].default_value = (*(hexc(tint) if isinstance(tint, str) else tint), 1); nt.links.new(col, mx.inputs[6]); col = mx.outputs[2]
    nt.links.new(col, b.inputs['Base Color'])
    if 'rough' in t:
        r = tex(t['rough'], True); mm = nt.nodes.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; mm.inputs[1].default_value = rough_mul
        nt.links.new(r.outputs['Color'], mm.inputs[0]); nt.links.new(mm.outputs[0], b.inputs['Roughness'])
    if 'normal' in t:
        nn = tex(t['normal'], True); nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstr
        nt.links.new(nn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    MATS[name] = m; return m

PH_USED = []
def ph_place(aid, loc, rz=0.0, size=None, axis=2, decimate=None):
    """Poly Haven 掃描模型：匯入 glTF（或 .blend）→ 合成一個物件 → 減面 → 縮放到 size（axis 那一邊的長度，公尺）→ 底部放在 loc"""
    path = cc0_fetch.ph_model(aid); before = set(bpy.data.objects)
    if path.endswith('.blend'):
        with bpy.data.libraries.load(path) as (src, dst): dst.objects = list(src.objects)
        for o in dst.objects:
            if o is not None and o.type == 'MESH': sc.collection.objects.link(o)
    else:
        bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    for o in [o for o in bpy.data.objects if o not in before and o.type != 'MESH']:
        for c in list(o.children): c.matrix_parent_inverse = Matrix(); 
    bpy.ops.object.select_all(action='DESELECT')
    for o in new:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw; o.select_set(True)
    for o in [o for o in bpy.data.objects if o not in before and o.type != 'MESH']: bpy.data.objects.remove(o)
    bpy.context.view_layer.objects.active = new[0]
    if len(new) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); o.name = 'ph_' + aid
    if decimate:
        md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = decimate
    vs = [v.co for v in o.data.vertices]; mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    k = (size / (mx - mn)[axis]) if size else 1.0; c = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))
    o.data.transform(Matrix.Translation(-c)); o.data.transform(Matrix.Scale(k, 4))
    o.matrix_world = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rz, 4, 'Z')
    OBJS.append(o); PH_USED.append(aid); return o


# ---- SHOP-REALISM-1112：布料、皮革改用 ambientCG 材質組（CC0）；原本的程式紋理只留給用不到的地方 ----
TARTANS = ['Fabric050', 'Fabric051', 'Fabric052', 'Fabric053', 'Fabric054', 'Fabric080']
def _light(hx, k=1.7):
    c = hexc(hx); return tuple(min(1.0, x * k) for x in c)
def mat_fabric(name, hx, kind='plain', hx2=None, scale=22.0):
    if name in MATS: return MATS[name]
    h = sum(ord(ch) for ch in name)
    if name == 'rug': m = mat_acg(name, 'Carpet015', scale=1.2)
    elif kind == 'plaid': m = mat_acg(name, TARTANS[h % len(TARTANS)], scale=3.0)
    elif kind == 'denim': m = mat_acg(name, ('Fabric069', 'Fabric003')[h % 2], scale=6.0, tint=_light(hx, 1.6))
    elif kind == 'cord': m = mat_acg(name, 'Fabric013', scale=5.0, tint=_light(hx, 2.4))
    else: m = mat_acg(name, ('Fabric036', 'Fabric036', 'Fabric031', 'Fabric061')[h % 4], scale=5.0, tint=_light(hx, 1.25 if h % 4 < 2 else 1.6))
    MATS[name] = m; return m
def mat_leather(name, hx):
    if name in MATS: return MATS[name]
    m = mat_acg(name, 'Leather037', scale=4.0, tint=_light(hx, 2.3), rough_mul=0.8); MATS[name] = m; return m

WOOD = mat_tex('wood_walnut', 'walnut_veneer/walnut_veneer_diff_1k.jpg', 1.6, tint=(0.62, 0.42, 0.28), rough=0.5, nor='walnut_veneer/walnut_veneer_nor_gl_1k.jpg')
WOOD_D = mat_tex('wood_dark', 'walnut_veneer/walnut_veneer_diff_1k.jpg', 1.6, tint=(0.34, 0.22, 0.15), rough=0.5, nor='walnut_veneer/walnut_veneer_nor_gl_1k.jpg', rot=1.5708)
FLOOR = mat_tex('floor_oak', 'laminate_floor_02/laminate_floor_02_diff_1k.jpg', 0.5, tint=(1.0, 0.92, 0.8), rough=0.45, nor='laminate_floor_02/laminate_floor_02_nor_gl_1k.jpg')
PLASTER = mat_tex('plaster', 'white_plaster_02/white_plaster_02_diff_1k.jpg', 0.6, tint=(0.85, 0.74, 0.6), rough=0.9)
WALLP = mat_tex('wall_green', 'white_plaster_02/white_plaster_02_diff_1k.jpg', 0.6, tint=(0.2, 0.24, 0.18), rough=0.9)   # 上半牆：深橄欖綠灰泥（概念圖深色牆、暖光）
BRASS = mat_col('brass', '#b8893e', rough=0.35, metal=1.0)
IRON = mat_col('iron', '#2a2826', rough=0.5, metal=0.8)
BULB = mat_col('bulb', '#ffd9a0', emit=18.0)
SKIN = mat_col('mannequin', '#a99d8a', rough=0.8)   # 原本 #e9e2d6 在聚光燈下過曝成一顆白球

# ---------------- 工具 ----------------
OBJS = []
def new_obj(name, bm, mat):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.data.materials.append(mat); OBJS.append(o); return o

def box(name, x0, x1, y0, y1, z0, z1, mat, bev=0.006):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector(((x0 + x1) / 2 + v.co.x * (x1 - x0), (y0 + y1) / 2 + v.co.y * (y1 - y0), (z0 + z1) / 2 + v.co.z * (z1 - z0)))
    o = new_obj(name, bm, mat)
    if bev > 0:
        md = o.modifiers.new('bev', 'BEVEL'); md.width = bev; md.segments = 2; md.limit_method = 'ANGLE'
    return o

def lathe(name, prof, cx, cy, cz, mat, seg=24, sx=1.0, sy=1.0, smooth=True):
    """prof＝[(半徑, 高度)…]，從下往上；繞 Z 軸轉一圈，sx、sy 把圓壓成橢圓"""
    bm = bmesh.new(); rings = []
    for r, z in prof:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg; ring.append(bm.verts.new((cx + r * math.cos(a) * sx, cy + r * math.sin(a) * sy, cz + z)))
        rings.append(ring)
    for k in range(len(rings) - 1):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
    for ring, top in ((rings[0], False), (rings[-1], True)):
        if prof[0 if not top else -1][0] > 1e-4:
            f = bm.faces.new(ring if top else list(reversed(ring)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = new_obj(name, bm, mat)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def tube(name, pts, radii, mat, seg=12, smooth=True):
    """沿著一串點的管子（每一點自己的半徑）"""
    bm = bmesh.new(); rings = []
    for k, (p, r) in enumerate(zip(pts, radii)):
        p = Vector(p); t = (Vector(pts[min(k + 1, len(pts) - 1)]) - Vector(pts[max(k - 1, 0)])).normalized()
        up = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0)); u = t.cross(up).normalized(); v = t.cross(u)
        rx, ry = (r if isinstance(r, tuple) else (r, r))
        rings.append([bm.verts.new(p + u * math.cos(2 * math.pi * i / seg) * rx + v * math.sin(2 * math.pi * i / seg) * ry) for i in range(seg)])
    for k in range(len(rings) - 1):
        for i in range(seg):
            j = (i + 1) % seg; bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = new_obj(name, bm, mat)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def garment(name, outline, thick, mat, loc, rot_z=0.0, tilt=0.0, folds=0.012, sub=2):
    """衣服：outline＝在 (寬 u, 高 v) 平面上的外形（逆時針），擠出厚度（布料兩面＋鼓起來），Catmull-Clark 磨圓、雜訊做皺摺。
    衣服掛在桿子上時面向桿子的垂直方向：u 沿 Blender 的 Y（深度）還是 X 由 rot_z 決定。"""
    bm = bmesh.new(); vs = [bm.verts.new((u, 0.0, v)) for u, v in outline]; f = bm.faces.new(vs)
    bmesh.ops.triangulate(bm, faces=[f]) if False else None
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); ev = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    for v in ev: v.co.y += thick
    for v in bm.verts: v.co.y -= thick / 2
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = new_obj(name, bm, mat)
    md = o.modifiers.new('sub', 'SUBSURF'); md.levels = sub; md.render_levels = sub
    if folds > 0:
        tx = bpy.data.textures.new(name + '_n', 'CLOUDS'); tx.noise_scale = 0.09; tx.noise_depth = 1
        dm = o.modifiers.new('fold', 'DISPLACE'); dm.texture = tx; dm.strength = folds; dm.texture_coords = 'GLOBAL'
    for p in o.data.polygons: p.use_smooth = True
    o.matrix_world = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot_z, 4, 'Z') @ Matrix.Rotation(tilt, 4, 'X')
    return o


def garment2(name, w, L, thick, mat, loc, rot_z=0.0, coat=False, seed=0):
    """立體衣服（SHOP-REALISM-1112；取代平板的 garment）：前、後兩片有弧度（胸口鼓、兩側薄），往下愈來愈多的直向皺摺，
    肩線斜下接衣架；袖子是兩支從肩膀垂下來、稍微往前的圓管（外套比較粗、有袖口）；領子一圈。原點＝衣架鉤下面；衣服的寬沿本地 X、厚沿 Y。"""
    R = random.Random(seed); bm = bmesh.new(); NU, NV = 9, 12
    freqs = [(R.uniform(1.5, 4.5), R.uniform(0, 6.28), R.uniform(0.4, 1.0)) for _ in range(3)]
    def P(su, tv, side):
        top = -0.075 * abs(2 * su - 1) ** 1.3 - (0.02 if coat else 0.0)
        hw = w / 2 * (1.0 + 0.06 * tv * (1 if coat else 0.5))   # 下襬微微張開
        x = (su - 0.5) * 2 * hw; z = top + (-L - top) * tv - 0.012 * math.sin(math.pi * su) * (tv ** 6)   # 下襬中間微彎
        bul = thick * 0.5 * max(0.0, 1 - (2 * su - 1) ** 2) ** 0.5 * (1.0 - 0.35 * tv)
        fold = sum(a * math.sin(2 * math.pi * f * su * 2 + ph) for f, ph, a in freqs) * 0.011 * (tv ** 1.4) * (1.6 if coat else 1.0)
        y = side * (bul + 0.004) + fold
        return Vector((x, y, z))
    grids = []
    for side in (1, -1):
        g = [[bm.verts.new(P(i / NU, j / NV, side)) for i in range(NU + 1)] for j in range(NV + 1)]; grids.append(g)
        for j in range(NV):
            for i in range(NU):
                q = (g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]); bm.faces.new(q if side < 0 else q[::-1])
    F, B = grids
    for j in range(NV):   # 兩側縫起來
        for i in (0, NU): bm.faces.new((F[j][i], F[j + 1][i], B[j + 1][i], B[j][i]))
    for i in range(NU): bm.faces.new((F[NV][i], F[NV][i + 1], B[NV][i + 1], B[NV][i])); bm.faces.new((F[0][i], B[0][i], B[0][i + 1], F[0][i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = new_obj(name, bm, mat)
    for p_ in o.data.polygons: p_.use_smooth = True
    M = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot_z, 4, 'Z') @ Matrix.Rotation(R.uniform(-0.04, 0.04), 4, 'X')
    o.matrix_world = M
    sl = (0.62 if coat else 0.56) * L / 0.75; r0 = (0.065 if coat else 0.05) * (w / 0.45)
    for sx in (-1, 1):   # 袖子
        x0 = sx * w / 2 * 0.92; fw = R.uniform(0.01, 0.04)
        pts = [(x0, 0.0, -0.075), (x0 + sx * 0.03, fw * 0.5, -0.075 - sl * 0.35), (x0 + sx * 0.035, fw, -0.075 - sl * 0.75), (x0 + sx * 0.03, fw * 1.1, -0.075 - sl)]
        rad = [(r0, r0 * 0.7), (r0 * 0.92, r0 * 0.62), (r0 * 0.82, r0 * 0.55), (r0 * 0.78, r0 * 0.52)]
        t = tube(name + '_sl%d' % sx, [tuple(M @ Vector(q)) for q in pts], rad, mat, seg=10)
    cpts = [M @ Vector((0.075 * math.cos(a), 0.035 * math.sin(a) + 0.002, -0.012 + 0.012 * math.cos(a) ** 2)) for a in [math.pi * (0.05 + 0.9 * k / 6) for k in range(7)]]
    tube(name + '_col', [tuple(q) for q in cpts], [0.012] * 7, mat, seg=6)   # 領子
    return o

def shirt_outline(w, L, sleeve=True, coat=False):
    """襯衫／外套從正面看的外形（肩線斜下、袖子貼著身體垂下、下擺微彎）；原點＝衣架鉤下面、領口"""
    hw = w / 2; sh = 0.07 if not coat else 0.06; sl = (0.58 if not coat else 0.62) * (L / 0.75)
    sl = min(sl, L * 0.95); cuff = hw + (0.07 if sleeve else 0.0)
    pts = [(-0.06, 0.0), (-hw * 0.55, -0.025), (-hw, -sh)]
    if sleeve: pts += [(-cuff, -sh - 0.06), (-cuff - 0.01, -sl), (-hw - 0.005, -sl - 0.01), (-hw + 0.01, -sh - 0.16)]
    pts += [(-hw * 0.98, -L * 0.6), (-hw * 1.02, -L + 0.02), (-hw * 0.5, -L - 0.012), (0.0, -L), (hw * 0.5, -L - 0.012), (hw * 1.02, -L + 0.02), (hw * 0.98, -L * 0.6)]
    if sleeve: pts += [(hw - 0.01, -sh - 0.16), (hw + 0.005, -sl - 0.01), (cuff + 0.01, -sl), (cuff, -sh - 0.06)]
    pts += [(hw, -sh), (hw * 0.55, -0.025), (0.06, 0.0), (0.0, -0.05)]
    return pts

def hanger(name, loc, rot_z, w):
    """木衣架：弧形的肩＋金屬鉤"""
    hw = w / 2 - 0.02; pts = []; n = 9
    for i in range(n):
        t = -1 + 2 * i / (n - 1); pts.append((t * hw, 0.0, -0.06 * abs(t) ** 1.4))
    o = tube(name, pts, [0.012] * n, WOOD, seg=6)
    hk = tube(name + '_hook', [(0, 0, 0.0), (0, 0, 0.05), (0.012, 0, 0.075), (0.03, 0, 0.065)], [0.003] * 4, IRON, seg=5)
    for ob in (o, hk): ob.matrix_world = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot_z, 4, 'Z')

# 衣服調色盤（古著：低彩度、暖色、丹寧、格子）
SOLIDS = ['#3e5a7a', '#8c6a4a', '#5a6a4a', '#a8a090', '#2f3f5a', '#7a3a32', '#c8b89a', '#4a4a52', '#6a7a8a', '#9a7a5a', '#3a4a3a', '#b07a5a', '#d8cdb8', '#5a4a6a', '#7a5a3a', '#a85a3a']
PLAIDS = [('#3a5a8c', '#c8b896'), ('#8c2f2a', '#2a2a2a'), ('#2f5a3e', '#c9a46a'), ('#c9a46a', '#5a3a2a'), ('#5a3a2a', '#c8b896'), ('#3a3a5a', '#a83a2a')]
def fabric_for(i):
    k = rr.random()
    if k < 0.3: a, b = PLAIDS[i % len(PLAIDS)]; return mat_fabric('plaid_%d' % (i % len(PLAIDS)), a, 'plaid', b, scale=rr.choice((18, 26, 34)))
    if k < 0.45: return mat_fabric('denim_%d' % (i % 2), ('#3f5c80', '#556f8e')[i % 2], 'denim', '#8aa0b8')
    if k < 0.55: c = SOLIDS[i % len(SOLIDS)]; return mat_fabric('cord_' + c, c, 'cord', '#000000')
    c = SOLIDS[(i * 7) % len(SOLIDS)]; return mat_fabric('solid_' + c, c, 'plain')

def rail_of_clothes(name, x0, x1, y, z, along='X', density=0.07, face_y=True, lmin=0.6, lmax=0.95, seed=0):
    """一整排掛在桿子上的衣服：桿子沿 X（背牆）或沿 Y（側牆）；每件寬、長、厚、角度、間距都不一樣"""
    rr.seed(seed); n = 0; t = x0 + 0.06; i = 0
    while t < x1 - 0.08:
        coat = rr.random() < 0.25; w = rr.uniform(0.40, 0.50) if not coat else rr.uniform(0.48, 0.56); L = rr.uniform(lmin, lmax) * (1.08 if coat else 1.0)
        th = rr.uniform(0.018, 0.03) if not coat else rr.uniform(0.04, 0.06)
        ang = rr.uniform(-0.25, 0.25) + (0.55 if along == 'X' else -0.5); m = fabric_for(i + seed * 13)
        if along == 'X': loc = (t, y, z - 0.07); rz = math.pi / 2 + ang
        else: loc = (y, t, z - 0.07); rz = ang
        garment2('%s_%d' % (name, i), w, L, th * 2.2, m, loc, rot_z=rz, coat=coat, seed=seed * 1000 + i)
        if rr.random() < 0.85: hanger('%s_h%d' % (name, i), (loc[0], loc[1], z - 0.06), rz, w)
        step = density + th + rr.uniform(0.0, 0.05)
        if rr.random() < 0.08: step += rr.uniform(0.06, 0.14)   # 偶爾空一點
        t += step; i += 1
    if along == 'X': tube(name + '_rail', [(x0, y, z), (x1, y, z)], [0.013, 0.013], BRASS, seg=10)
    else: tube(name + '_rail', [(y, x0, z), (y, x1, z)], [0.013, 0.013], BRASS, seg=10)
    return i

def folded(name, x, y, z, w, d, h, mat, rz=0.0):
    """折好的衣服一疊：圓角、上面微鼓"""
    o = box(name, x - w / 2, x + w / 2, y - d / 2, y + d / 2, z, z + h, mat, bev=min(h * 0.45, 0.03))
    o.modifiers['bev'].segments = 4
    cs = o.modifiers.new('soft', 'CAST'); cs.cast_type = 'SPHERE'; cs.factor = 0.12; cs.use_z = True   # BB 11-13「書架上的書還是一色薄板」：折衣整件微微鼓起，不是四角方正的板子
    o.rotation_euler[2] = rz; o.location = (0, 0, 0)
    if rz:
        o.data.transform(Matrix.Translation((x, y, 0)) @ Matrix.Rotation(rz, 4, 'Z') @ Matrix.Translation((-x, -y, 0)))
    return o

# ---------------- 房間 ----------------
def quad(name, pts, mat):
    """一片朝室內的面（四個點照逆時針、從室內看）：房間外殼不用方塊——方塊朝外、朝上那幾面永遠看不到，烘焙時白佔圖"""
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs); return new_obj(name, bm, mat)
X0, X1 = -W / 2, W / 2
quad('floor', [(X0, FRONT, 0), (X1, FRONT, 0), (X1, BACK, 0), (X0, BACK, 0)], FLOOR)
quad('ceil', [(X0, BACK, H), (X1, BACK, H), (X1, FRONT, H), (X0, FRONT, H)], PLASTER)
for lo, hi, mat_ in ((0.0, 1.05, WOOD_D), (1.05, H, WALLP)):
    quad('wall_B_%d' % int(lo * 10), [(X0, BACK, lo), (X1, BACK, lo), (X1, BACK, hi), (X0, BACK, hi)], mat_)
    quad('wall_L_%d' % int(lo * 10), [(X0, FRONT, lo), (X0, BACK, lo), (X0, BACK, hi), (X0, FRONT, hi)], mat_)
    quad('wall_R_%d' % int(lo * 10), [(X1, BACK, lo), (X1, FRONT, lo), (X1, FRONT, hi), (X1, BACK, hi)], mat_)
# 牆板：下半木作的直條（每 0.3 m 一條細縫）、上緣壓條
for x in [i * 0.3 - W / 2 + 0.15 for i in range(int(W / 0.3))]: box('bead_B%d' % int(x * 100), x - 0.006, x + 0.006, BACK - 0.012, BACK, 0.08, 1.02, WOOD_D, bev=0.002)
box('rail_B', -W / 2, W / 2, BACK - 0.03, BACK, 1.02, 1.08, WOOD, bev=0.008)
for sx in (-1, 1): box('rail_S%d' % sx, sx * W / 2 - (0.03 if sx > 0 else 0), sx * W / 2 + (0.03 if sx < 0 else 0), FRONT, BACK, 1.02, 1.08, WOOD, bev=0.008)
# 踢腳板、天花板線板
box('skirt_B', -W / 2, W / 2, BACK - 0.02, BACK, 0.0, 0.1, WOOD_D, bev=0.004)
box('crown_B', -W / 2, W / 2, BACK - 0.06, BACK, H - 0.08, H, WOOD, bev=0.01)
for sx in (-1, 1): box('crown_S%d' % sx, min(sx * W / 2, sx * (W / 2 - 0.06)), max(sx * W / 2, sx * (W / 2 - 0.06)), FRONT, BACK, H - 0.08, H, WOOD, bev=0.01)
# 古董地毯（中間）
rug = mat_fabric('rug', '#7a2e24', 'plaid', '#c89a5a', scale=9)
box('rug', -0.9, 1.3, -0.7, 1.0, 0.0, 0.008, rug, bev=0.004)

# ---------------- 後牆：一整排衣服＋上面兩層木層板 ----------------
rail_of_clothes('back', -W / 2 + 0.25, W / 2 - 0.55, BACK - 0.32, 1.88, along='X', seed=1)
for k in range(2):   # 兩支鐵支架
    x = (-W / 2 + 0.25) if k == 0 else (W / 2 - 0.55)
    tube('back_post%d' % k, [(x, BACK - 0.32, 1.88), (x, BACK - 0.02, 1.88)], [0.01, 0.01], BRASS, seg=8)
for sy in (2.18, 2.55):
    box('shelf_%d' % int(sy * 100), -W / 2 + 0.1, W / 2 - 0.1, BACK - 0.34, BACK, sy - 0.035, sy, WOOD, bev=0.006)
    for x in (-W / 2 + 0.4, 0.0, W / 2 - 0.4): box('brk_%d_%d' % (int(sy * 100), int(x * 100)), x - 0.015, x + 0.015, BACK - 0.25, BACK, sy - 0.17, sy - 0.035, IRON, bev=0.003)
rr.seed(5)
x = -W / 2 + 0.25
while x < -0.15:   # 上層（左半邊）：一疊疊毛衣、帽子、木盒、舊皮箱、書——大小每一樣不一樣
    k = rr.random()
    if k < 0.45:
        stack_h = 0.0; c = rr.choice(SOLIDS); w = rr.uniform(0.26, 0.34)
        for j in range(rr.randint(2, 5)):
            hh = rr.uniform(0.035, 0.06); folded('top_f%d_%d' % (int(x * 100), j), x + w / 2, BACK - 0.2, 2.18 + stack_h, w + rr.uniform(-0.02, 0.02), 0.22, hh, mat_fabric('solid_' + (c if j % 2 == 0 else rr.choice(SOLIDS)), c if j % 2 == 0 else rr.choice(SOLIDS)), rz=rr.uniform(-0.05, 0.05)); stack_h += hh
        x += w + rr.uniform(0.06, 0.14)
    elif k < 0.6:
        lathe('hat_%d' % int(x * 100), [(0.0, 0.0), (0.17, 0.0), (0.17, 0.008), (0.11, 0.015), (0.105, 0.1), (0.09, 0.125), (0.0, 0.13)], x + 0.17, BACK - 0.17, 2.18, mat_fabric('felt_' + str(int(x * 10) % 3), ('#4a3a2e', '#2e2a26', '#6a5a46')[int(x * 10) % 3]), seg=20, sx=1.0, sy=0.85)
        x += 0.4
    elif k < 0.0:
        w = rr.uniform(0.3, 0.45); hh = rr.uniform(0.14, 0.22); box('case_%d' % int(x * 100), x, x + w, BACK - 0.3, BACK - 0.05, 2.18, 2.18 + hh, mat_leather('case_' + str(int(w * 100) % 3), ('#7a4a2a', '#5a3a26', '#8a6a4a')[int(w * 100) % 3]), bev=0.02)
        x += w + 0.08
    elif False:
        for j in range(rr.randint(4, 8)):
            bw = rr.uniform(0.025, 0.045); bh = rr.uniform(0.18, 0.26); box('book_%d_%d' % (int(x * 100), j), x, x + bw, BACK - 0.26, BACK - 0.06, 2.18, 2.18 + bh, mat_col('book' + str(j % 5), ('#6a2a22', '#2a3a5a', '#3a4a2a', '#8a7a5a', '#4a2a3a')[j % 5], rough=0.6), bev=0.003); x += bw + 0.003
        x += 0.12
ph_place('decorative_book_set_01', (1.05, BACK - 0.17, 2.18), size=0.24, axis=2, decimate=0.06)   # Poly Haven 舊書一整排（CC0）——0.02 減成一片片薄板（BB 11-13），改 0.06
ph_place('vintage_suitcase', (-1.2, BACK - 0.17, 2.55), size=0.32, axis=2, decimate=0.15)   # Poly Haven 古董皮箱一組（CC0）
ph_place('mantel_clock_01', (1.6, BACK - 0.2, 2.55), size=0.42, axis=0, decimate=0.05)
x = -0.2
while x < 1.2:   # 第二層（右半邊：木盒、相框）：皮箱、木盒、相框（小一點、靠後）
    k = rr.random()
    if k < 0.5:
        w = rr.uniform(0.35, 0.55); hh = rr.uniform(0.12, 0.3); box('box2_%d' % int(x * 100), x, x + w, BACK - 0.32, BACK - 0.04, 2.55, 2.55 + hh, mat_leather('case_' + str(int(w * 100) % 3), ('#7a4a2a', '#5a3a26', '#8a6a4a')[int(w * 100) % 3]) if rr.random() < 0.6 else WOOD, bev=0.015); x += w + rr.uniform(0.05, 0.15)
    else:
        fw = rr.uniform(0.2, 0.32); fh = fw * rr.uniform(0.7, 1.25); o = box('frame_%d' % int(x * 100), x, x + fw, BACK - 0.06, BACK - 0.03, 2.55, 2.55 + fh, WOOD, bev=0.004)
        box('pic_%d' % int(x * 100), x + 0.025, x + fw - 0.025, BACK - 0.065, BACK - 0.059, 2.575, 2.55 + fh - 0.025, mat_col('pic' + str(int(x * 10) % 4), ('#8a7a5a', '#5a6a6a', '#a89070', '#6a5040')[int(x * 10) % 4], rough=0.8), bev=0)
        x += fw + 0.12

# ---------------- 左牆：木層架（折好的衣服、靴子） ----------------
LX = -W / 2
for i, sy in enumerate((0.12, 0.55, 0.98, 1.41, 1.84)):
    box('lsh_%d' % i, LX, LX + 0.42, -0.2, 1.55, sy - 0.03, sy, WOOD, bev=0.005)
for y in (-0.2, 0.67, 1.55): box('lsh_side_%d' % int(y * 100), LX, LX + 0.42, y - 0.015, y + 0.015, 0.0, 1.86, WOOD, bev=0.004)
rr.seed(9)
for i, sy in enumerate((0.55, 0.98, 1.41, 1.84)):
    y = -0.15
    while y < 1.48:
        w = rr.uniform(0.22, 0.32); n = rr.randint(2, 5) if sy < 1.8 else rr.randint(1, 3); hz = 0.0; c = rr.choice(SOLIDS)
        for j in range(n):
            hh = rr.uniform(0.04, 0.07); cc = c if rr.random() < 0.6 else rr.choice(SOLIDS)
            folded('lf_%d_%d_%d' % (i, int(y * 100), j), LX + 0.22 + rr.uniform(-0.025, 0.02), y + w / 2 + rr.uniform(-0.015, 0.015), sy + hz, rr.uniform(0.26, 0.32), w * rr.uniform(0.9, 1.0), hh, mat_fabric('solid_' + cc, cc), rz=rr.uniform(-0.08, 0.08)); hz += hh * 0.92   # 每件深淺、位置、角度錯開；疊起來互相壓一點
        y += w + rr.uniform(0.03, 0.09)
# 最下層：三雙靴子（車削的靴筒＋鞋頭）
for k, y in enumerate((0.0, 0.42, 0.84)):
    m = mat_leather('boot_%d' % (k % 2), ('#5a3420', '#2e2420')[k % 2])
    for s in (-1, 1):
        yy = y + s * 0.065
        tube('boot_%d_%d' % (k, s), [(LX + 0.28, yy, 0.14), (LX + 0.26, yy, 0.25), (LX + 0.25, yy, 0.4)], [(0.045, 0.04), (0.05, 0.045), (0.052, 0.047)], m, seg=10)
        tube('boot_toe_%d_%d' % (k, s), [(LX + 0.30, yy, 0.165), (LX + 0.18, yy, 0.16), (LX + 0.1, yy, 0.155)], [(0.05, 0.035), (0.045, 0.03), (0.03, 0.02)], m, seg=10)

# ---------------- 右邊（門後）：靠牆一排外套、穿衣鏡、後面的木櫃台 ----------------
RX = W / 2
rail_of_clothes('right', -0.55, 1.05, RX - 0.3, 1.75, along='Y', seed=3, lmin=0.7, lmax=1.05)
for y in (-0.55, 1.05): tube('right_post_%d' % int(y * 100), [(RX - 0.3, y, 1.75), (RX, y, 1.75)], [0.01, 0.01], BRASS, seg=8)
ph_place('ornate_mirror_01', (RX - 0.03, 1.3, 0.5), rz=math.pi / 2, size=1.25, axis=2, decimate=0.15)   # Poly Haven 雕花鏡（CC0）
# 櫃台：木頭前面板、檯面、收銀機、舊收音機、小盆栽
box('counter', 0.95, 2.35, BACK - 0.95, BACK - 0.45, 0.0, 0.92, WOOD_D, bev=0.012)
box('counter_top', 0.92, 2.38, BACK - 0.98, BACK - 0.42, 0.92, 0.96, WOOD, bev=0.01)
for k in range(4): box('counter_panel_%d' % k, 1.0 + k * 0.34, 1.28 + k * 0.34, BACK - 0.955, BACK - 0.95, 0.12, 0.8, WOOD, bev=0.008)
ph_place('CashRegister_01', (1.85, BACK - 0.7, 0.96), size=0.36, axis=2, decimate=0.25)   # Poly Haven 古董收銀機（CC0）
ph_place('potted_plant_02', (1.15, BACK - 0.68, 0.96), rz=0.6, size=0.5, axis=2, decimate=0.1)
ph_place('potted_plant_02', (0.35, FRONT + 0.52, 0.0), rz=2.0, size=0.95, axis=2, decimate=0.18)   # 櫥窗和門中間落地一盆（概念圖門口的盆栽）

# ---------------- 櫥窗（左前）：木台、假人、彩色玻璃檯燈、皮公事包、牛仔褲一疊 ----------------
PX0, PX1, PY0, PY1, PH = -W / 2 + 0.1, 0.35, FRONT + 0.08, FRONT + 0.95, 0.42
box('plinth', PX0, PX1, PY0, PY1, 0.0, PH, WOOD_D, bev=0.012)
box('plinth_top', PX0 - 0.02, PX1 + 0.02, PY0 - 0.02, PY1 + 0.02, PH, PH + 0.035, WOOD, bev=0.01)
for k in range(5): box('plinth_panel_%d' % k, PX0 + 0.08 + k * 0.5, PX0 + 0.5 + k * 0.5, PY0 - 0.005, PY0, 0.06, PH - 0.06, WOOD, bev=0.006)
MX, MY, B0 = -1.15, FRONT + 0.52, PH + 0.035
# 底座＋支柱
lathe('m_base', [(0.0, 0.0), (0.17, 0.0), (0.17, 0.02), (0.03, 0.03), (0.0, 0.03)], MX, MY, B0, IRON, seg=20)
tube('m_pole', [(MX, MY, B0), (MX, MY, B0 + 0.3)], [0.012, 0.012], BRASS, seg=8)
# 牛仔褲兩隻腳（上粗下細、膝蓋微彎）
JEAN = mat_fabric('jeans', '#2f4a6e', 'denim', '#5a7090')
for s in (-1, 1):
    tube('m_leg%d' % s, [(MX + s * 0.09, MY, B0 + 0.06), (MX + s * 0.088, MY - 0.01, B0 + 0.45), (MX + s * 0.095, MY, B0 + 0.86), (MX + s * 0.1, MY, B0 + 0.98)], [(0.06, 0.06), (0.058, 0.058), (0.075, 0.07), (0.095, 0.08)], JEAN, seg=14)
# 皮帶＋黃銅扣
lathe('m_belt', [(0.155, 0.0), (0.155, 0.045)], MX, MY, B0 + 0.96, mat_leather('belt', '#3a2618'), seg=24, sx=1.0, sy=0.68)
box('m_buckle', MX - 0.03, MX + 0.03, MY - 0.11, MY - 0.1, B0 + 0.962, B0 + 1.0, BRASS, bev=0.004)
# 人台軀幹（米白襯衫）：腰細、胸寬、肩膀圓
SHIRT = mat_fabric('shirt_cream', '#e6dcc4', 'plain')
lathe('m_torso', [(0.15, 0.0), (0.142, 0.1), (0.15, 0.2), (0.165, 0.32), (0.172, 0.42), (0.168, 0.5), (0.15, 0.56), (0.09, 0.6), (0.05, 0.62), (0.0, 0.625)], MX, MY, B0 + 0.99, SHIRT, seg=28, sx=1.0, sy=0.66)
# 脖子＋沒有五官的頭
lathe('m_neck', [(0.045, 0.0), (0.04, 0.09), (0.0, 0.1)], MX, MY, B0 + 1.6, SKIN, seg=14)
lathe('m_head', [(0.0, 0.0), (0.055, 0.01), (0.08, 0.06), (0.088, 0.12), (0.08, 0.18), (0.05, 0.225), (0.0, 0.24)], MX, MY + 0.005, B0 + 1.66, SKIN, seg=20, sx=0.9, sy=1.0)
# 皮夾克：軀幹外面一層、前面開襟（把正前方那一段拿掉）、翻領、兩隻袖子
JK = mat_leather('jacket', '#6e4028')
bm = bmesh.new(); seg = 32; prof = [(0.168, -0.08), (0.163, 0.05), (0.17, 0.2), (0.182, 0.32), (0.19, 0.42), (0.186, 0.5), (0.168, 0.56), (0.11, 0.6), (0.075, 0.615)]
rings = []
for r, z in prof:
    rings.append([bm.verts.new((MX + r * math.cos(2 * math.pi * i / seg), MY + r * math.sin(2 * math.pi * i / seg) * 0.68, B0 + 0.99 + z)) for i in range(seg)])
OPEN = lambda i, k: abs(((2 * math.pi * i / seg) - (3 * math.pi / 2) + math.pi) % (2 * math.pi) - math.pi) < (0.42 if k < 7 else 0.75)   # 正前方（−Y）開口，上面領口開大一點
for k in range(len(rings) - 1):
    for i in range(seg):
        j = (i + 1) % seg
        if OPEN(i, k) and OPEN(j, k): continue
        bm.faces.new((rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
jo = new_obj('m_jacket', bm, JK); sm = jo.modifiers.new('sol', 'SOLIDIFY'); sm.thickness = 0.012; sm.offset = 1.0
sb = jo.modifiers.new('sub', 'SUBSURF'); sb.levels = 1; sb.render_levels = 1
for p in jo.data.polygons: p.use_smooth = True
for s in (-1, 1):   # 翻領：兩片斜的三角形
    garment('m_lapel%d' % s, [(0, 0), (0.06, -0.02), (0.035, -0.2), (0.0, -0.24)], 0.01, mat_leather('lapel', '#5e3420'), (MX + s * 0.05, MY - 0.12, B0 + 1.57), rot_z=0.0 if s > 0 else 0.0, folds=0, sub=1)
    bpy.context.view_layer.update()
    OBJS[-1].matrix_world = Matrix.Translation(Vector((MX + s * 0.045, MY - 0.115, B0 + 1.58))) @ Matrix.Scale(1, 4) @ Matrix.Diagonal((s, 1, 1, 1))
    tube('m_sleeve%d' % s, [(MX + s * 0.19, MY, B0 + 1.52), (MX + s * 0.22, MY - 0.005, B0 + 1.3), (MX + s * 0.225, MY - 0.03, B0 + 1.08), (MX + s * 0.215, MY - 0.045, B0 + 0.98)], [(0.06, 0.055), (0.055, 0.05), (0.05, 0.046), (0.046, 0.042)], JK, seg=14)
# 彩色玻璃檯燈（櫥窗左邊）
LX_, LY_ = PX0 + 0.28, FRONT + 0.32
lathe('lamp_base', [(0.0, 0.0), (0.09, 0.0), (0.095, 0.02), (0.05, 0.04), (0.02, 0.07), (0.015, 0.33), (0.0, 0.34)], LX_, LY_, B0, BRASS, seg=18)
lathe('lamp_shade', [(0.03, 0.17), (0.08, 0.15), (0.13, 0.09), (0.165, 0.02), (0.17, 0.0), (0.155, 0.0)], LX_, LY_, B0 + 0.24, mat_tiffany('tiffany'), seg=24)
lathe('lamp_bulb', [(0.0, 0.0), (0.035, 0.02), (0.035, 0.06), (0.0, 0.08)], LX_, LY_, B0 + 0.25, BULB, seg=10)
# 皮公事包（假人右邊）：圓角盒子、蓋子、提把、黃銅扣
BAG = mat_leather('bag', '#7a4a2a'); BX, BY = MX + 0.62, FRONT + 0.4
box('bag', BX - 0.22, BX + 0.22, BY - 0.07, BY + 0.07, B0, B0 + 0.3, BAG, bev=0.03)
box('bag_flap', BX - 0.225, BX + 0.225, BY - 0.075, BY + 0.06, B0 + 0.2, B0 + 0.305, mat_leather('bagflap', '#6a3e22'), bev=0.025)
tube('bag_handle', [(BX - 0.08, BY, B0 + 0.3), (BX - 0.07, BY, B0 + 0.38), (BX, BY, B0 + 0.4), (BX + 0.07, BY, B0 + 0.38), (BX + 0.08, BY, B0 + 0.3)], [0.012] * 5, mat_leather('bagflap', '#6a3e22'), seg=8)
for s in (-1, 1): box('bag_clasp%d' % s, BX + s * 0.12 - 0.015, BX + s * 0.12 + 0.015, BY - 0.08, BY - 0.074, B0 + 0.22, B0 + 0.26, BRASS, bev=0.003)
# 一疊牛仔褲、兩本舊書
hz = 0.0
for j in range(4):
    hh = rr.uniform(0.04, 0.055); folded('jstack_%d' % j, PX1 - 0.25, FRONT + 0.6, B0 + hz, 0.34, 0.26, hh, mat_fabric('denim_%d' % (j % 2), ('#3f5c80', '#556f8e')[j % 2], 'denim', '#8aa0b8'), rz=rr.uniform(-0.06, 0.06)); hz += hh
# 吊盆（櫥窗左上，黃金葛垂下來）
POT = (PX0 + 0.25, FRONT + 0.25, 2.35)
lathe('hpot', [(0.0, 0.0), (0.07, 0.0), (0.11, 0.14), (0.115, 0.15), (0.0, 0.15)], POT[0], POT[1], POT[2], mat_col('terracotta', '#b8673e', rough=0.8), seg=16)
for k in range(3): tube('hpot_str%d' % k, [(POT[0] + 0.1 * math.cos(k * 2.1), POT[1] + 0.1 * math.sin(k * 2.1), POT[2] + 0.14), (POT[0], POT[1], H)], [0.002, 0.002], IRON, seg=4)
LEAF = mat_col('leaf', '#3f6a32', rough=0.6)
for k in range(7):
    a = k * 0.9 + 0.3; L = rr.uniform(0.35, 0.8); pts = []
    for t in range(6):
        f = t / 5; pts.append((POT[0] + math.cos(a) * (0.1 + 0.08 * f), POT[1] + math.sin(a) * (0.1 + 0.08 * f), POT[2] + 0.13 - L * f ** 1.3))
    tube('vine%d' % k, pts, [0.004] * 6, LEAF, seg=4)
    for t in range(1, 6):
        p = pts[t]; aa = rr.uniform(0, 6.28)
        tube('vleaf%d_%d' % (k, t), [p, (p[0] + math.cos(aa) * 0.035, p[1] + math.sin(aa) * 0.035, p[2] - 0.01), (p[0] + math.cos(aa) * 0.07, p[1] + math.sin(aa) * 0.07, p[2] - 0.03)], [(0.004, 0.002), (0.028, 0.004), (0.004, 0.002)], LEAF, seg=6)

# ---------------- 中間：木頭移動衣架（丹寧外套、格子襯衫） ----------------
GX0, GX1, GY = 0.55, 1.75, FRONT + 0.75
for x in (GX0, GX1):
    tube('rack_leg_%d' % int(x * 100), [(x, GY - 0.25, 0.0), (x, GY, 1.62)], [0.02, 0.018], WOOD, seg=8)
    tube('rack_leg2_%d' % int(x * 100), [(x, GY + 0.25, 0.0), (x, GY, 1.62)], [0.02, 0.018], WOOD, seg=8)
tube('rack_bar', [(GX0 - 0.05, GY, 1.6), (GX1 + 0.05, GY, 1.6)], [0.016, 0.016], WOOD, seg=10)
tube('rack_low', [(GX0, GY, 0.25), (GX1, GY, 0.25)], [0.012, 0.012], WOOD, seg=8)
rr.seed(21); t = GX0 + 0.12; i = 0
while t < GX1 - 0.1:
    m = mat_fabric('denim_0', '#3f5c80', 'denim', '#8aa0b8') if i == 0 else mat_fabric('plaid_%d' % (i % len(PLAIDS)), PLAIDS[i % len(PLAIDS)][0], 'plaid', PLAIDS[i % len(PLAIDS)][1], scale=26)
    coat = i == 0; w = 0.5 if coat else rr.uniform(0.42, 0.48); L = 0.66 if coat else rr.uniform(0.68, 0.8); th = 0.05 if coat else 0.024
    rz = math.pi / 2 + rr.uniform(-0.35, 0.35)
    garment2('rk_%d' % i, w, L, th * 2.2, m, (t, GY, 1.53), rot_z=rz, coat=coat, seed=500 + i)
    hanger('rk_h%d' % i, (t, GY, 1.54), rz, w)
    t += 0.1 + th + rr.uniform(0, 0.04); i += 1

# ---------------- 天花板：三盞黃銅吊燈、軌道投射燈 ----------------
for k, x in enumerate((-1.6, 0.0, 1.6)):
    y = 0.15
    tube('pend_cord%d' % k, [(x, y, H), (x, y, 2.55)], [0.004, 0.004], IRON, seg=5)
    lathe('pend_shade%d' % k, [(0.02, 0.2), (0.04, 0.19), (0.12, 0.08), (0.16, 0.0), (0.15, 0.0), (0.11, 0.075), (0.035, 0.18)], x, y, 2.35, BRASS, seg=24)
    lathe('pend_bulb%d' % k, [(0.0, 0.0), (0.04, 0.03), (0.04, 0.08), (0.0, 0.1)], x, y, 2.33, BULB, seg=12)
box('track', -W / 2 + 0.4, W / 2 - 0.4, BACK - 1.2, BACK - 1.17, H - 0.03, H, IRON, bev=0.004)
SPOTS = []
for k, x in enumerate((-1.8, -0.6, 0.6, 1.8)):
    p = (x, BACK - 1.185, H - 0.12)
    tube('spot%d' % k, [(x, BACK - 1.185, H - 0.03), (x, BACK - 1.185, H - 0.08)], [0.008, 0.008], IRON, seg=6)
    tube('spot_can%d' % k, [(x, BACK - 1.2, H - 0.1), (x, BACK - 1.1, H - 0.16)], [0.035, 0.04], IRON, seg=12)
    SPOTS.append(p)

# ---------------- 修改器套用、燈 ----------------
def apply_all():
    for o in OBJS:
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers):
            try:
                with bpy.context.temp_override(object=o, active_object=o): bpy.ops.object.modifier_apply(modifier=m.name)
            except Exception as e: print('apply', o.name, m.name, e)

WARM = (1.0, 0.72, 0.45)
def light(kind, loc, energy, color=WARM, size=0.05, aim=None, spot=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == 'AREA': ld.size = size
    else: ld.shadow_soft_size = size
    if spot: ld.spot_size = math.radians(spot); ld.spot_blend = 0.6
    o = bpy.data.objects.new(kind, ld); sc.collection.objects.link(o); o.location = loc
    if aim is not None: o.rotation_euler = (Vector(aim) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o
for x in (-1.6, 0.0, 1.6): light('POINT', (x, 0.15, 2.3), 80, size=0.06)
for p in SPOTS: light('SPOT', p, 140, aim=(p[0], BACK - 0.3, 1.4), spot=45, size=0.03)
light('SPOT', (-1.15, FRONT + 0.2, H - 0.1), 60, aim=(MX, MY, 1.5), spot=40, size=0.03)   # 打在假人身上的那一盞
light('POINT', (LX_, LY_, B0 + 0.3), 12, color=(1.0, 0.62, 0.3), size=0.04)
light('AREA', (0.0, 0.2, H - 0.05), 45, color=(1.0, 0.8, 0.6), size=3.0)   # 天花板反射的柔光
light('AREA', (0.0, FRONT - 1.5, 1.6), 50, color=(0.95, 0.97, 1.0), size=4.0, aim=(0.0, 0.5, 1.2))   # 街上進來的天光（窗外）

def setup_cycles(samples):
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
    try: sc.cycles.use_denoising = True
    except Exception: pass
    sc.cycles.max_bounces = 3
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.02
    sc.view_settings.view_transform = 'Standard'

if PREVIEW:
    setup_cycles(SAMPLES)
    sc.render.resolution_x, sc.render.resolution_y = 960, 540
    cd = bpy.data.cameras.new('c'); cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    for n, eye, look, lens in (('front', (0.0, FRONT - 3.2, 1.6), (0.0, 0.4, 1.35), 24), ('left', (2.2, FRONT - 2.5, 1.6), (-0.8, 0.5, 1.3), 24), ('right', (-2.4, FRONT - 2.5, 1.6), (0.9, 0.5, 1.3), 24)):
        cd.lens = lens; cam.location = eye; cam.rotation_euler = (Vector(look) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = PREVIEW + '_' + n + '.png'; bpy.ops.render.render(write_still=True)
    print('preview done'); sys.exit(0)

# ---------------- 烘焙（第 2 版）：先合成一個物件再烘（一個物件一次，原本 566 個物件一個一個烘要 41 分鐘）----------------
# 材質原本用「物件座標」投影貼圖；合成以後物件座標會變，所以合成前把每一點原本的物件座標存成屬性 opos，材質改讀這個屬性。
# 烘焙 UV 用 lightmap pack（每個面照面積平均分到圖上；原本 smart project 把牆、地板擠成一小塊）。
setup_cycles(SAMPLES)
apply_all()
meshes = [o for o in sc.objects if o.type == 'MESH']
for o in meshes:
    me = o.data
    a_ = me.attributes.new('opos', 'FLOAT_VECTOR', 'POINT')
    for i, v in enumerate(me.vertices): a_.data[i].vector = v.co
    if not me.uv_layers: me.uv_layers.new(name='UVMap')
    else: me.uv_layers[0].name = 'UVMap'
    while len(me.uv_layers) > 1: me.uv_layers.remove(me.uv_layers[1])
    # 布料、皮革（ambientCG Fabric／Leather 材質）的面：烘焙圖上放大兩倍（≈4 倍像素）——v2 衣架近照衣服糊、斑駁（BB 11-13）
    fw = me.attributes.new('uvw', 'FLOAT', 'FACE')
    cloth = [any(n.type == 'TEX_IMAGE' and n.image and any(t in n.image.filepath for t in ('Fabric', 'Leather')) for n in (m_.node_tree.nodes if m_ and m_.use_nodes else [])) for m_ in me.materials]
    for i, pg in enumerate(me.polygons): fw.data[i].value = 2.0 if (cloth and pg.material_index < len(cloth) and cloth[pg.material_index]) else 1.0
for m in bpy.data.materials:
    if not m.use_nodes: continue
    nt = m.node_tree
    for bs in [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED']:   # 烘的是漫射光：金屬（黃銅、鐵）的漫射是 0 會變黑——改成非金屬、顏色照舊
        for l in [l for l in nt.links if l.to_socket == bs.inputs['Metallic']]: nt.links.remove(l)
        bs.inputs['Metallic'].default_value = 0.0
    for tcn in [n for n in nt.nodes if n.type == 'TEX_COORD']:
        links = [l for l in nt.links if l.from_node == tcn and l.from_socket.name == 'Object']
        if not links: continue
        at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'opos'; at.attribute_type = 'GEOMETRY'
        for l in links: nt.links.new(at.outputs['Vector'], l.to_socket)
import collections
_cnt = collections.Counter()
for o in meshes: _cnt[o.name.split('.')[0].rstrip('0123456789_')] += sum(len(p_.vertices) - 2 for p_ in o.data.polygons)
print('TRI BREAKDOWN', _cnt.most_common(25), flush=True)
if os.environ.get('COUNT_ONLY'):
    for o in meshes:
        wv = [o.matrix_world @ v.co for v in o.data.vertices]; ys = [v.y for v in wv]; xs = [v.x for v in wv]
        if ys and (min(ys) < FRONT - 0.01 or max(ys) > BACK + 0.01 or min(xs) < -W / 2 - 0.01 or max(xs) > W / 2 + 0.01): print('OUTSIDE', o.name, round(min(xs), 2), round(max(xs), 2), round(min(ys), 2), round(max(ys), 2))
    sys.exit(0)
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]; bpy.ops.object.join()
J = bpy.context.view_layer.objects.active; J.name = 'wente_interior'
TRI = sum(len(p_.vertices) - 2 for p_ in J.data.polygons)
print('tris before', TRI, flush=True)
if TRI > 80000:
    dm = J.modifiers.new('dec', 'DECIMATE'); dm.ratio = 78000 / TRI; dm.use_collapse_triangulate = True
    with bpy.context.temp_override(object=J, active_object=J): bpy.ops.object.modifier_apply(modifier=dm.name)
print('joined', len(J.data.polygons), 'faces', flush=True)
J.data.uv_layers['UVMap'].active_render = True
bu = J.data.uv_layers.new(name='bake'); J.data.uv_layers.active = bu
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0015, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)   # 一個物件：每一塊照實際面積縮放（同樣的像素密度）
bpy.ops.object.mode_set(mode='OBJECT')
if 'uvw' in J.data.attributes:   # 布料的面整組放大（對原點縮放，島的形狀不變；重疊的部分 pack_islands 會重新排）
    _fw = J.data.attributes['uvw'].data; _uv = J.data.uv_layers['bake'].data; _n = 0
    for pg in J.data.polygons:
        k_ = _fw[pg.index].value
        if k_ > 1.0:
            _n += 1
            for li in pg.loop_indices: _uv[li].uv = (_uv[li].uv[0] * k_, _uv[li].uv[1] * k_)
    print('cloth faces scaled', _n, flush=True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
try: bpy.ops.uv.pack_islands(rotate=True, margin=0.0015)
except Exception as e: print('pack', e)
bpy.ops.object.mode_set(mode='OBJECT')
J.data.uv_layers['UVMap'].active_render = True; J.data.uv_layers.active = J.data.uv_layers['bake']
BIMG = bpy.data.images.new('wente_bake', RES, RES, alpha=False, float_buffer=False)
for m in J.data.materials:
    if not m or not m.use_nodes: continue
    n = m.node_tree.nodes.new('ShaderNodeTexImage'); n.image = BIMG; n.name = 'BAKE'
    for x in m.node_tree.nodes: x.select = False
    n.select = True; m.node_tree.nodes.active = n
bk = sc.render.bake; bk.use_pass_direct = True; bk.use_pass_indirect = True; bk.use_pass_diffuse = True; bk.use_pass_emit = True
bk.use_pass_glossy = False; bk.use_pass_transmission = False; bk.margin = 4; bk.margin_type = 'EXTEND'
bpy.ops.object.select_all(action='DESELECT'); J.select_set(True); bpy.context.view_layer.objects.active = J
print('bake start', len(J.data.polygons), 'faces', RES, SAMPLES, flush=True)
bpy.ops.object.bake(type='COMBINED')
print('bake done', flush=True)
import numpy as np
px = np.array(BIMG.pixels[:], dtype=np.float32).reshape(RES, RES, 4)
st = np.stack([np.roll(np.roll(px, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1)], 0); BIMG.pixels[:] = np.median(st, 0).ravel()   # 3×3 中值去雜點
out_png = os.path.splitext(OUT)[0] + '_bake.png'
BIMG.filepath_raw = out_png; BIMG.file_format = 'PNG'; BIMG.save()
# 一個材質（底色＝烘好的圖，用 bake 那一套 UV）；別的 UV 拿掉
J.data.materials.clear()
fm = bpy.data.materials.new('wente_baked'); fm.use_nodes = True; nb = fm.node_tree.nodes['Principled BSDF']
it = fm.node_tree.nodes.new('ShaderNodeTexImage'); it.image = bpy.data.images.load(out_png); fm.node_tree.links.new(it.outputs['Color'], nb.inputs['Base Color'])
nb.inputs['Roughness'].default_value = 1.0
try: nb.inputs['Specular IOR Level'].default_value = 0.0
except Exception: pass
J.data.materials.append(fm)
for p_ in J.data.polygons: p_.material_index = 0
J.data.uv_layers.remove(J.data.uv_layers['UVMap']); J.data.uv_layers['bake'].active_render = True
if 'opos' in J.data.attributes: J.data.attributes.remove(J.data.attributes['opos'])
for o in list(sc.objects):
    if o.type != 'MESH': bpy.data.objects.remove(o)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', use_selection=False, export_lights=False, export_cameras=False,
                          export_image_format='WEBP', export_image_quality=88, export_normals=False, export_apply=True, export_attributes=False)
print('export', OUT, len(J.data.polygons), 'faces', flush=True)
