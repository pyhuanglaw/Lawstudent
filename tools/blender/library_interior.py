"""總圖書館大廳（一樓大廳＋中央大樓梯＋二樓自習區）正式模型：Blender 5.2 bpy 無介面執行 → GLB（WebP 貼圖）。總圖第一階段（D43）。
配置讀 src/data/library_layout.js（遊戲的導航、互動點讀同一份，兩邊一定對得上）。貼圖：Poly Haven CC0（tools/blender/textures/、tools/blender/env_second/textures/）。
節點命名約定和霖澤館、萬才館室內一樣（src/building3d.js 的 attachFormal）：
  L0_*：一樓；L1_*：二樓（玩家在一樓、鏡頭高過二樓地板時藏起來）；名字含 WALL_ 的是外牆（擋住鏡頭時淡出），自訂屬性 dir＝往室內的法線（遊戲座標）。
  不做：電梯（遊戲裡程序化、要動）、門牌／指標／樓層簡介的字與公告欄（遊戲用 canvas 畫，中文字型）、窗外的景、點地面用的透明地板。
真實性：室內沒有照片或平面圖，是遊戲化設計（D43）；材質方向：大廳磨石子地、花崗石樓梯、米色粉光牆＋胡桃木牆裙、二樓自習區人字拼木地板、胡桃木長桌與書架、黃銅檯燈。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)（glTF 匯出 +Y up 會轉回去）。
用法：/opt/blenv/bin/python tools/blender/library_interior.py [--out assets/models/env/library_interior.glb] [--tex 512] [--render 輸出資料夾] [--views a,b]
"""
import bpy, bmesh, json, math, os, re, sys, random
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEX = os.path.join(ROOT, 'tools', 'blender', 'textures')
TEX2 = os.path.join(ROOT, 'tools', 'blender', 'env_second', 'textures')   # 第二個 AI 下載的 Poly Haven CC0（只讀使用）：磨石子、人字拼木地板、胡桃木
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/library_interior.glb'))
TEXRES = int(arg('--tex', '512'))
RENDER = arg('--render')
VIEWS = arg('--views')

src = open(os.path.join(ROOT, 'src/data/library_layout.js'), encoding='utf8').read()
L = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, Y1, RY, T, ST = L['W'], L['D'], L['floors'][1]['y'], L['roofY'], L['wallT'], L['slabT']
S, CO, U, V, GT = L['stair'], L['core'], L['upper'], L['vestibule'], L['gates']
C, LD, SD = S['center'], S['landing'], S['side']
R = Y1 / (C['risers'] + SD['risers']); TR = S['tread']

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import b3lib as B
B._S['texres'] = TEXRES; B._S['imgs'] = {}

def g2b(x, y, z): return Vector((x, -z, y))

# ---------------- 材質 ----------------
_imgs = {}
def img(path):
    if path not in _imgs:
        im = bpy.data.images.load(path)
        if TEXRES and max(im.size) > TEXRES: im.scale(TEXRES, TEXRES)
        _imgs[path] = im
    return _imgs[path]

def rough_img(path, rmin):
    """粗糙度貼圖整體調粗：r' = rmin + (1−rmin)·r（遊戲裡點光源照在亮面木地板上的反光太亮、像打蠟）"""
    import numpy as np
    key = (path, 'rmin', rmin)
    if key not in _imgs:
        src = img(path); w, h = src.size; px = np.empty(w * h * 4, dtype=np.float32); src.pixels.foreach_get(px); px = px.reshape(-1, 4)
        px[:, :3] = rmin + (1 - rmin) * px[:, :3]
        im = bpy.data.images.new(os.path.basename(path)[:-4] + f'_rmin{rmin:g}', w, h, alpha=False); im.pixels.foreach_set(np.clip(px, 0, 1).ravel()); im.colorspace_settings.name = 'Non-Color'
        _imgs[key] = im
    return _imgs[key]

def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8, target=None, sat=1.0, base_dir=None, rough_min=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = min(metal, B.MAX_METAL)
    m['tile'] = tile
    if pid:
        base = os.path.join(base_dir or TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = B.img_adj(base + '_diff_1k.jpg', sat, 1.0, target) if target else img(base + '_diff_1k.jpg')
        Lk.new(tc.outputs['Color'], bsdf.inputs['Base Color'])
        if os.path.exists(base + '_rough_1k.jpg'):
            tr = N.new('ShaderNodeTexImage'); tr.image = rough_img(base + '_rough_1k.jpg', rough_min) if rough_min else img(base + '_rough_1k.jpg'); tr.image.colorspace_settings.name = 'Non-Color'
            Lk.new(tr.outputs['Color'], bsdf.inputs['Roughness'])
        if os.path.exists(base + '_nor_gl_1k.jpg'):
            tn = N.new('ShaderNodeTexImage'); tn.image = img(base + '_nor_gl_1k.jpg'); tn.image.colorspace_settings.name = 'Non-Color'
            nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal
            Lk.new(tn.outputs['Color'], nm.inputs['Color']); Lk.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    else:
        bsdf.inputs['Base Color'].default_value = (*(tint or (0.8, 0.8, 0.8)), 1.0)
    if rough is not None and not pid: bsdf.inputs['Roughness'].default_value = rough
    if alpha is not None:
        bsdf.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*emit, 1.0); bsdf.inputs['Emission Strength'].default_value = 1.0
    return m

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c)

MAT = {
    'floor':   pbr('lb_terrazzo', 'terrazzo_tiles', tile=1.6, sat=0.5, target='#d6cdbd', base_dir=TEX2),          # 一樓大廳、連廊：米色磨石子
    'parquet': pbr('lb_parquet', 'herringbone_parquet', tile=1.8, sat=0.8, target='#cdb594', base_dir=TEX2, rough_min=0.7),     # 二樓兩翼（自習區）：淺色人字拼木地板（使用者 10-23：不要深色木地板；同宿舍四人房 #cdb594；原本 #a07a55）
    'granite': pbr('lb_granite', 'granite_tile_03', tile=1.8, sat=0.4, target='#b9b2a6'),                        # 柱子、樓板邊收邊、閘門台座
    'step':    pbr('lb_step', 'granite_tile_03', tile=0.9, sat=0.35, target='#aaa49b'),                          # 樓梯踏面、平台
    'plaster': pbr('lb_plaster', 'painted_plaster_wall', tile=2.5, target='#ece4d6'),
    'slab':    pbr('lb_slab', 'painted_plaster_wall', tile=2.5, target='#efebe4'),                               # 樓板底面（一樓天花板）、樓梯中間的矮牆
    'ceiling': pbr('lb_ceiling', 'ceiling_interior', tile=2.0, sat=0.2, target='#efeeea', normal=0.3),
    'walnut':  pbr('lb_walnut', 'walnut_veneer', tile=1.2, sat=0.85, target='#6b4a33', base_dir=TEX2),           # 牆裙、服務台、書架、長桌
    'woodL':   pbr('lb_wood_light', 'fine_grained_wood', tile=1.6, target='#a77d57'),                             # 椅子、展示桌
    'leather': pbr('lb_leather', 'fabric_leather_02', tile=1.0, sat=0.5, target='#5a3c2c'),                       # 沙發、單人沙發（深棕皮）
    'steel':   pbr('lb_steel', None, tint=srgb('#c9ccd0'), rough=0.28, metal=0.45),
    'frame':   pbr('lb_frame', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35),
    'locker':  pbr('lb_locker', None, tint=srgb('#8e959b'), rough=0.4, metal=0.3),
    'brass':   pbr('lb_brass', None, tint=srgb('#b8913f'), rough=0.35, metal=0.45),
    'shade':   pbr('lb_lampshade', None, tint=srgb('#2f5d50'), rough=0.45),
    'glass':   pbr('lb_glass', None, tint=srgb('#c4d6dc'), rough=0.05, alpha=0.22),
    'light':   pbr('lb_light_panel', None, tint=srgb('#fff6e4'), rough=0.9, emit=srgb('#fff4dc')),
    'sky':     pbr('lb_skylight', None, tint=srgb('#e6f0f6'), rough=0.9, emit=srgb('#e8f2f8')),
    'soil':    pbr('lb_soil', None, tint=srgb('#3b2d22'), rough=0.95),
    'paper':   pbr('lb_paper', None, tint=srgb('#ece6d8'), rough=0.9),
}
BOOKC = ['#2f5d50', '#8c3b47', '#c9a24f', '#4a6c8c', '#7b6a5a', '#b5643f', '#d9d3c6', '#3e4a5c', '#6e2f2f', '#5d7a4a']
for i, c in enumerate(BOOKC): MAT[f'book{i}'] = pbr(f'lb_book_{i}', None, tint=srgb(c), rough=0.75)

# 植物的葉片卡：葉片貼圖是第二個 AI 的 tools/blender/env_second/gen_leaves.py 程式產生的（本作，不是外部素材；兩點半 Café、溫州街小公園用同一套）。
# 透明度用 alpha clip（Round 節點 → glTF alphaMode MASK）、雙面。第一版是多面體圓球（看起來像玩具），2026-10-11 換掉
GEN = os.path.join(TEX2, 'gen')
def leaf_mat(name, png, rough=0.7):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = img(os.path.join(GEN, png))
    Lk.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], rnd.inputs[0]); Lk.new(rnd.outputs[0], bsdf.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False; m['tile'] = 1.0
    return m
MAT['leaf_small'] = leaf_mat('lb_leaf_small', 'olive_leaves.png')    # 室內樹（垂榕一類的小葉）
MAT['leaf_fern'] = leaf_mat('lb_leaf_fern', 'fern_leaves.png')       # 花台前緣的低矮植栽（蕨類）
MAT['bark'] = pbr('lb_bark', None, tint=srgb('#6a5644'), rough=0.9)
for k_, c_ in (('leaf_dark', '#2f5130'), ('leaf_mid', '#3f6a3a')):   # 模型葉子（大葉盆栽）：深綠、帶一點光澤、雙面
    MAT[k_] = pbr('lb_' + k_, None, tint=srgb(c_), rough=0.42); MAT[k_].use_backface_culling = False

# ---------------- 幾何（和萬才館室內同一套小工具）----------------
def box_uv(bm, tile):
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for lp in f.loops:
            co = lp.vert.co
            if ax == 0: u, v = co.y, co.z
            elif ax == 1: u, v = co.x, co.z
            else: u, v = co.x, co.y
            lp[uv].uv = (u / tile, v / tile)

def mesh_obj(name, bm, mat, parent=None, props=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob

def box(name, mat, x0, x1, y0, y1, z0, z1, parent=None, bevel=0.0, props=None):
    bm = bmesh.new()
    a, b = g2b(min(x0, x1), min(y0, y1), max(z0, z1)), g2b(max(x0, x1), max(y0, y1), min(z0, z1))
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((a.x if v.co.x < 0 else b.x, a.y if v.co.y < 0 else b.y, a.z if v.co.z < 0 else b.z))
    if bevel > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    bm.normal_update(); box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def quad(name, mat, pts, parent=None, tile=None, props=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in pts]; bm.faces.new(vs); bm.normal_update(); box_uv(bm, tile or mat.get('tile', 1.0))
    return mesh_obj(name, bm, mat, parent, props)

def cyl(name, mat, a, b, r, parent=None, seg=10, props=None, r2=None):
    pa, pb = g2b(*a), g2b(*b); d = pb - pa; L_ = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=L_)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot.to_matrix()); bmesh.ops.translate(bm, verts=bm.verts, vec=(pa + pb) / 2)
    bm.normal_update(); box_uv(bm, 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def prism(name, mat, pts, x0, x1, parent=None):
    """沿 x 擠出的多邊形（輪廓 pts＝[(z,y),…]，遊戲座標）：樓梯中間的斜頂矮牆"""
    bm = bmesh.new(); a = [bm.verts.new(g2b(x0, y, z)) for (z, y) in pts]; b = [bm.verts.new(g2b(x1, y, z)) for (z, y) in pts]
    bm.faces.new(a); bm.faces.new(list(reversed(b)))
    n = len(pts)
    for i in range(n): bm.faces.new([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.normal_update(); box_uv(bm, mat.get('tile', 1.0))
    return mesh_obj(name, bm, mat, parent)

# ---------------- 植物（葉片卡）----------------
def leaf_cards(name, mat, cards, parent):
    """一組葉片卡（一張＝一個四邊形）：cards＝[(cx,cy,cz,寬,高,繞 y 轉,往前傾,(u0,v0,u1,v1))]，遊戲座標"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.verify()
    for (cx, cy, cz, w, h, ry, rx, uv) in cards:
        rot = Matrix.Rotation(ry, 3, 'Y') @ Matrix.Rotation(rx, 3, 'X'); c = Vector((cx, cy, cz))
        vs = [bm.verts.new(g2b(*(c + rot @ Vector(q)))) for q in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
        f = bm.faces.new(vs); u0, v0, u1, v1 = uv
        for lp, (u, v) in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = (u, v)
    bm.normal_update()
    return mesh_obj(name, bm, mat, parent)

def _uv(rnd, span):
    u = rnd.uniform(0, 1 - span); v = rnd.uniform(0, 1 - span); return (u, v, u + span, v + span)

def indoor_tree(pre, parent, x, y0, z, h, r, seed):
    """室內樹（垂榕一類）：三根細樹幹扭在一起往上、頂端分出幾根枝條，樹冠是一團小葉的葉片卡（橢球殼上隨機擺放、隨機朝向）"""
    rnd = random.Random(seed); top = y0 + h - r * 1.35
    for k in range(3):
        a = k * 2.09 + rnd.uniform(-0.3, 0.3); dx, dz = math.cos(a) * 0.045, math.sin(a) * 0.045
        mid = (x - dz * 0.8, (y0 + top) / 2, z + dx * 0.8)   # 中段往旁邊扭一點（三根交纏的樣子）
        cyl(f'{pre}_trunk_{k}a', MAT['bark'], (x + dx, y0, z + dz), mid, 0.03, parent, seg=6, r2=0.025)
        cyl(f'{pre}_trunk_{k}b', MAT['bark'], mid, (x - dx * 0.4, top, z - dz * 0.4), 0.025, parent, seg=6, r2=0.018)
    cy = top + r * 0.75
    for k in range(5):
        a = k * 1.256 + rnd.uniform(-0.3, 0.3); L_ = r * rnd.uniform(0.55, 0.8)
        cyl(f'{pre}_branch_{k}', MAT['bark'], (x, top - 0.05, z), (x + math.cos(a) * L_, cy + rnd.uniform(-0.1, 0.3), z + math.sin(a) * L_), 0.014, parent, seg=5, r2=0.008)
    cards = []
    n = int(52 * (r / 0.75) ** 2) + 14
    for i in range(n):
        a = rnd.uniform(0, 2 * math.pi); e = math.asin(rnd.uniform(-0.7, 1.0)); rr = r * rnd.uniform(0.6, 1.0)
        px, pz, py = x + math.cos(a) * rr * math.cos(e), z + math.sin(a) * rr * math.cos(e), cy + math.sin(e) * rr * 0.85
        s_ = r * rnd.uniform(0.6, 0.85)
        cards.append((px, py, pz, s_, s_, a + rnd.uniform(-0.6, 0.6), rnd.uniform(-1.0, 1.0), _uv(rnd, 0.5)))
    leaf_cards(f'{pre}_leaves', MAT['leaf_small'], cards, parent)

def leaf_mesh(bm, base, yaw, pitch, Lf, Wf, droop, fold=0.18, n=6):
    """一片模型葉子（不是葉片卡）：沿主脈 n 段、每段左緣／主脈／右緣三點，主脈稍微隆起、兩側往下彎、葉尖往下垂。
    base＝葉柄端（遊戲座標）；yaw＝葉子朝哪個方向（繞 y）、pitch＝往上翹（正）或往下（負）"""
    rot = Matrix.Rotation(yaw, 3, 'Y') @ Matrix.Rotation(pitch, 3, 'Z'); b = Vector(base); rows = []
    for i in range(n + 1):
        t = i / n; w = Wf * (math.sin(math.pi * min(1.0, t * 1.08)) ** 0.75) if i < n else 0.0
        y_ = -droop * t * t                         # 葉尖往下垂
        row = []
        for side in (-1, 0, 1):
            q = Vector((t * Lf, y_ + (fold * Wf if side == 0 else -0.25 * w * abs(side)), side * w))
            row.append(bm.verts.new(g2b(*(b + rot @ q))))
        rows.append(row)
    for i in range(n):
        a, c = rows[i], rows[i + 1]
        if i < n - 1:
            bm.faces.new((a[0], a[1], c[1], c[0])); bm.faces.new((a[1], a[2], c[2], c[1]))
        else:
            bm.faces.new((a[0], a[1], c[1])); bm.faces.new((a[1], a[2], c[1]))

def broad_plant(pre, parent, x, y0, z, h, r, seed):
    """大葉盆栽（橡膠樹、琴葉榕一類）：幾根莖從盆裡往上、往外，莖的上半段交錯長出一片一片的模型葉子（深綠、帶一點光澤）。
    第一版是大葉貼圖的葉片卡：方形卡把葉子切出直邊，近看像剪紙（2026-10-11 換成模型葉子）"""
    rnd = random.Random(seed); bms = [bmesh.new(), bmesh.new()]
    for k in range(5):
        a = k * 1.256 + rnd.uniform(-0.35, 0.35); lean = rnd.uniform(0.08, 0.28); hh = h * rnd.uniform(0.65, 1.0)
        tx, tz = x + math.cos(a) * hh * lean, z + math.sin(a) * hh * lean
        cyl(f'{pre}_stem_{k}', MAT['bark'], (x + math.cos(a) * 0.03, y0, z + math.sin(a) * 0.03), (tx, y0 + hh, tz), 0.014, parent, seg=5, r2=0.008)
        nl = rnd.randint(6, 9)
        for j in range(nl):
            t = 0.3 + 0.7 * (j + 1) / nl; px, py, pz = x + (tx - x) * t, y0 + hh * t, z + (tz - z) * t
            ya = a + (j % 2 - 0.5) * 2.2 + rnd.uniform(-0.5, 0.5)          # 互生：左右交錯
            Lf = r * rnd.uniform(0.42, 0.62) * (0.75 + 0.35 * (1 - t)); Wf = Lf * rnd.uniform(0.36, 0.46)
            leaf_mesh(bms[rnd.random() < 0.4], (px, py, pz), -ya, rnd.uniform(-0.1, 0.55) + (0.35 if j == nl - 1 else 0), Lf, Wf, droop=Lf * rnd.uniform(0.15, 0.4))
    for bm, mk in zip(bms, ('leaf_dark', 'leaf_mid')):
        bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_{mk}', bm, MAT[mk], parent)

def fern_bush(pre, parent, x, y0, z, r, seed, n=7):
    """低矮的蕨類：一叢葉片卡，往外傾、往下垂"""
    rnd = random.Random(seed); cards = []
    for i in range(n):
        a = rnd.uniform(0, 2 * math.pi); s_ = r * rnd.uniform(1.0, 1.4)
        cards.append((x + math.cos(a) * r * 0.35, y0 + s_ * 0.3, z + math.sin(a) * r * 0.35, s_, s_, a + math.pi / 2, rnd.uniform(-1.2, -0.4), _uv(rnd, 0.5)))
    leaf_cards(f'{pre}_leaves', MAT['leaf_fern'], cards, parent)

def group(name, parent=None, props=None):
    ob = bpy.data.objects.new(name, None); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob

root = group('LibraryHall')
L0 = group('L0_root', root); L1 = group('L1_root', root)

# ---------------- 有開口的牆（門、窗）：沿 z（x 固定）或沿 x（z 固定）的一道牆，開口＝[(a,b,ya,yb)] ----------------
def wall_cut(prefix, parent, axis, at, a0, a1, y0, y1, holes, dirv, mat):
    holes = sorted(holes); cur = a0; k = 0
    def piece(pa, pb, ya, yb):
        nonlocal k
        if pb - pa < 0.01 or yb - ya < 0.01: return
        pr = {'dir': dirv, 'lmhide': 'up,down'}   # 光照烘焙（LIB-HALL-LM-1028）：牆頂、牆底（上下樓層的牆段接在一起、窗台蓋住）不分像素
        if axis == 'z': box(f'{prefix}_WALL_{k}', mat, at - T / 2, at + T / 2, ya, yb, pa, pb, parent, props=pr)
        else: box(f'{prefix}_WALL_{k}', mat, pa, pb, ya, yb, at - T / 2, at + T / 2, parent, props=pr)
        k += 1
    for (ha, hb, hy0, hy1) in holes:
        piece(cur, ha, y0, y1); piece(ha, hb, y0, min(y1, max(y0, hy0))); piece(ha, hb, max(y0, min(y1, hy1)), y1); cur = hb   # 開口在這一段的上面或下面：不超出 y0～y1（同 dorm_hall.py，BUG-COPLANAR-DEV）
    piece(cur, a1, y0, y1)

def window(prefix, parent, axis, at, a, b, ya, yb, inward, fade=None):
    """窗框（深灰鋁框＋中間一道直櫺）＋玻璃；inward＝往室內的方向（+1／−1）；fade＝(群組, 方向)：跟著那一面牆一起淡出"""
    f = 0.06; o = inward * (T / 2 - 0.02); FP = {'fadegrp': fade[0], 'fadedir': fade[1]} if fade else None
    if axis == 'z':
        for (za, zb, y_a, y_b) in ((a, a + f, ya, yb), (b - f, b, ya, yb), (a, b, ya, ya + f), (a, b, yb - f, yb), ((a + b) / 2 - 0.03, (a + b) / 2 + 0.03, ya, yb)):
            box(f'{prefix}_win_{a:.1f}_{za:.2f}_{y_a:.1f}', MAT['frame'], at + o - 0.04, at + o + 0.04, y_a, y_b, za, zb, parent, props=FP)
        box(f'{prefix}_sill_{a:.1f}_{ya:.1f}', MAT['walnut'], at + inward * T / 2 - (0.0 if inward > 0 else 0.16), at + inward * T / 2 + (0.16 if inward > 0 else 0.0), ya - 0.05, ya, a - 0.05, b + 0.05, parent, props=FP)
        quad(f'{prefix}_wglass_{a:.1f}_{ya:.1f}', MAT['glass'], [(at, ya, a), (at, ya, b), (at, yb, b), (at, yb, a)], parent, tile=1.0)   # 玻璃不放進淡出群組：遊戲的 fadeWalls 把整組的不透明度設成 1，玻璃會變成一片不透明的灰藍色、看不到窗外（2026-10-11 截圖）
    else:
        for (xa, xb, y_a, y_b) in ((a, a + f, ya, yb), (b - f, b, ya, yb), (a, b, ya, ya + f), (a, b, yb - f, yb)):
            box(f'{prefix}_win_{a:.1f}_{xa:.2f}_{y_a:.1f}', MAT['frame'], xa, xb, y_a, y_b, at + o - 0.04, at + o + 0.04, parent, props=FP)
        n = max(1, round((b - a) / 1.4))
        for i in range(1, n): xm = a + (b - a) * i / n; box(f'{prefix}_wm_{a:.1f}_{i}_{ya:.1f}', MAT['frame'], xm - 0.04, xm + 0.04, ya, yb, at + o - 0.04, at + o + 0.04, parent, props=FP)
        quad(f'{prefix}_wglass_{a:.1f}_{ya:.1f}', MAT['glass'], [(a, ya, at), (b, ya, at), (b, yb, at), (a, yb, at)], parent, tile=1.0)   # 同上

def door(prefix, parent, axis, at, c, y0, inward, w=1.5, h=2.5, mat=None, fade=None):
    """門框＋門板＋門把（門關著：遊戲裡是看得懂的說明）"""
    props = {'fadegrp': fade[0], 'fadedir': fade[1]} if fade else None; o = inward * (T / 2 + 0.03)
    if axis == 'z':
        box(f'{prefix}_doorframe_{c:.1f}', MAT['frame'], at + o - 0.05, at + o + 0.05, y0, y0 + h + 0.1, c - w / 2 - 0.05, c + w / 2 + 0.05, parent, props=props)
        box(f'{prefix}_door_{c:.1f}', mat or MAT['walnut'], at + o + inward * 0.04 - 0.03, at + o + inward * 0.04 + 0.03, y0, y0 + h - 0.05, c - w / 2 + 0.08, c + w / 2 - 0.08, parent, props=props)
        hh = cyl(f'{prefix}_doorhandle_{c:.1f}', MAT['steel'], (at + o + inward * 0.12, y0 + 0.9, c + w / 2 - 0.35), (at + o + inward * 0.12, y0 + 1.3, c + w / 2 - 0.35), 0.018, parent)
    else:
        box(f'{prefix}_doorframe_{c:.1f}', MAT['frame'], c - w / 2 - 0.05, c + w / 2 + 0.05, y0, y0 + h + 0.1, at + o - 0.05, at + o + 0.05, parent, props=props)
        box(f'{prefix}_door_{c:.1f}', mat or MAT['walnut'], c - w / 2 + 0.08, c + w / 2 - 0.08, y0, y0 + h - 0.05, at + o + inward * 0.04 - 0.03, at + o + inward * 0.04 + 0.03, parent, props=props)
        hh = cyl(f'{prefix}_doorhandle_{c:.1f}', MAT['steel'], (c + w / 2 - 0.35, y0 + 0.9, at + o + inward * 0.12), (c + w / 2 - 0.35, y0 + 1.3, at + o + inward * 0.12), 0.018, parent)
    if props:
        for k_, v_ in props.items(): hh[k_] = v_

# ---------------- 地板、樓板、天花板 ----------------
# 光照烘焙（LIB-HALL-LM-1028）的自訂屬性：lm＝光照貼圖分多少（地板 1.3、屋頂 0.3）；lmhide＝看不到、不分像素的面（地板的四邊和底面、樓板被地板蓋住的頂面）
FLP = {'lm': 1.3, 'lmhide': 'side,down'}
box('L0_floor', MAT['floor'], -W / 2, W / 2, -0.25, 0.0, -D / 2, D / 2, L0, props=FLP)
box('L1_band_slab', MAT['slab'], U['band']['x0'], U['band']['x1'], Y1 - ST, Y1 - 0.02, U['band']['z0'], U['band']['z1'], L1, props={'lmhide': 'up'})
box('L1_band_floor', MAT['floor'], U['band']['x0'], U['band']['x1'], Y1 - 0.02, Y1, U['band']['z0'], U['band']['z1'], L1, props=FLP)
# 東翼的樓板讓出電梯井（玻璃井道，車廂上下穿過二樓；遊戲 src/library3d.js 的 slab()／src/building3d.js 的 slabPieces 用同一個規則）。
# 2026-10-11 v9.5 審查：原本樓板整塊蓋住井口——車廂上下時被樓板擋住、車廂不在二樓時井口像一片走不過去的地板
def slab_pieces(a, h):
    if h['x1'] <= a['x0'] or h['x0'] >= a['x1'] or h['z1'] <= a['z0'] or h['z0'] >= a['z1']:
        return [(a['x0'], a['x1'], a['z0'], a['z1'])]
    out = []
    if h['z0'] > a['z0']: out.append((a['x0'], a['x1'], a['z0'], h['z0']))
    if h['z1'] < a['z1']: out.append((a['x0'], a['x1'], h['z1'], a['z1']))
    z0, z1 = max(a['z0'], h['z0']), min(a['z1'], h['z1'])
    if h['x0'] > a['x0']: out.append((a['x0'], h['x0'], z0, z1))
    if h['x1'] < a['x1']: out.append((h['x1'], a['x1'], z0, z1))
    return out
for k, a in enumerate(U['wings']):
    for j, (x0, x1, z0, z1) in enumerate(slab_pieces(a, L['elevator'])):
        sfx = f'{k}' if j == 0 else f'{k}_{j}'
        box(f'L1_wing_slab_{sfx}', MAT['slab'], x0, x1, Y1 - ST, Y1 - 0.02, z0, z1, L1, props={'lmhide': 'up'})
        box(f'L1_wing_floor_{sfx}', MAT['parquet'], x0, x1, Y1 - 0.02, Y1, z0, z1, L1, props=FLP)
# 樓板邊的石材收邊（面向中庭、樓梯的邊）
EDGE = [('x', -S['railX'], CO['z0'], SD['z1']), ('x', S['railX'], CO['z0'], SD['z1']), ('x', -U['band']['x1'], U['band']['z1'], D / 2), ('x', U['band']['x1'], U['band']['z1'], D / 2),
        ('z', U['band']['z1'], -U['band']['x1'], U['band']['x1']), ('z', SD['z1'], -S['sides'][1]['x0'], S['sides'][1]['x0'])]
for k, (ax, at, a, b) in enumerate(EDGE):
    if ax == 'x': box(f'L1_edge_{k}', MAT['granite'], at - 0.05, at + 0.05, Y1 - ST - 0.06, Y1 + 0.02, a, b, L1, bevel=0.01)
    else: box(f'L1_edge_{k}', MAT['granite'], a, b, Y1 - ST - 0.06, Y1 + 0.02, at - 0.05, at + 0.05, L1, bevel=0.01)
# 天花板：屋頂（中庭上方天窗）＋燈板；一樓樓板底下的嵌燈
quad('L1_ceiling', MAT['ceiling'], [(-W / 2, RY, -D / 2), (W / 2, RY, -D / 2), (W / 2, RY, D / 2), (-W / 2, RY, D / 2)], L1, props={'lm': 0.3})
sx0, sx1, sz0, sz1 = V['x0'] + 0.3, V['x1'] - 0.3, U['band']['z1'] + 0.4, D / 2 - 0.4
quad('L1_skylight', MAT['sky'], [(sx0, RY - 0.03, sz0), (sx1, RY - 0.03, sz0), (sx1, RY - 0.03, sz1), (sx0, RY - 0.03, sz1)], L1)
for i in range(1, 6): xm = sx0 + (sx1 - sx0) * i / 6; box(f'L1_skybeam_{i}', MAT['frame'], xm - 0.05, xm + 0.05, RY - 0.12, RY - 0.02, sz0, sz1, L1)
for sx in (-1, 1):
    for i in range(2):
        for j in range(4):
            cx, cz = sx * (7.2 + i * 3.2), -6.4 + j * 4.2
            quad(f'L1_light_{sx}_{i}_{j}', MAT['light'], [(cx - 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz + 0.3), (cx - 0.6, RY - 0.01, cz + 0.3)], L1)
    for i in range(2):
        for j in range(5):
            x, z = sx * (7.0 + i * 3.2), -7.2 + j * 3.6; yb = Y1 - ST - 0.005
            quad(f'L0_downlight_{sx}_{i}_{j}', MAT['light'], [(x - 0.14, yb, z - 0.14), (x + 0.14, yb, z - 0.14), (x + 0.14, yb, z + 0.14), (x - 0.14, yb, z + 0.14)], L0)

# ---------------- 柱子（中庭四角）：一樓花崗石圓柱、二樓粉光圓柱到屋頂 ----------------
for k, (x, z) in enumerate(((-CO['x1'], U['band']['z1']), (CO['x1'], U['band']['z1']), (-CO['x1'], GT['z']), (CO['x1'], GT['z']))):
    cyl(f'L0_column_{k}', MAT['granite'], (x, 0, z), (x, Y1 - ST, z), 0.3, L0, seg=20)
    cyl(f'L0_column_base_{k}', MAT['step'], (x, 0, z), (x, 0.14, z), 0.36, L0, seg=20)
    cyl(f'L1_column_{k}', MAT['plaster'], (x, Y1, z), (x, RY, z), 0.26, L1, seg=20)

# ---------------- 外牆：北（平台上方的大窗、二樓多媒體中心的門）、西（窗）、東（二樓樓梯間、研究小間的門）、南面兩翼；正面中間挑高的玻璃帷幕 ----------------
def wins_w(y0, skip=()):   # 西牆的窗：每 2.4 m 一扇 1.6 × 2.4（skip：一樓 z −2.4 那一扇換成往 B1 的樓梯間門）
    return [(z - 0.8, z + 0.8, y0, y0 + 2.4) for z in (-7.2, -4.8, -2.4, 0.0, 2.4, 4.8, 7.2) if z not in skip]
def spans(a0, a1, holes):
    """a0..a1 扣掉 holes（門洞）剩下的段"""
    out = [(a0, a1)]
    for (h0, h1) in holes:
        nxt = []
        for (u, v) in out:
            if h1 <= u or h0 >= v: nxt.append((u, v)); continue
            if h0 > u: nxt.append((u, h0))
            if h1 < v: nxt.append((h1, v))
        out = nxt
    return [(u, v) for (u, v) in out if v - u > 0.05]


NW = (LD['x0'] + 0.3, LD['x1'] - 0.3, LD['y'] + 1.0, RY - 0.4)   # 北牆平台上方的大窗（跨兩層：一樓那段到 5.0、二樓那段從 5.0）
DOORS = {d['id']: d for d in L['doors']}; SDR = L['stairDoor']; md, cr, sf = DOORS['media'], DOORS['carrels'], DOORS['staff']
B1D = L.get('b1Door')   # 一樓西牆往 B1 的樓梯間門（CLOSED-SPACES-1023 第 2 項，LAWWW2-B 10-23）：換掉 z −2.4 那一扇窗
B1SKIP = (B1D['z'],) if B1D else ()
for pre, P, y0, y1 in (('L0', L0, 0.0, Y1), ('L1', L1, Y1, RY)):
    nh = [(NW[0], NW[1], max(y0, NW[2]), min(y1, NW[3]))] if NW[2] < y1 and NW[3] > y0 else []
    if pre == 'L1': nh.append((md['x'] - 0.75, md['x'] + 0.75, Y1, Y1 + 2.6))
    wall_cut(f'{pre}_N', P, 'x', -D / 2, -W / 2, W / 2, y0, y1, nh, [0, 0, 1], MAT['plaster'])
    wh = wins_w(y0 + 1.1, B1SKIP) + ([(B1D['z'] - B1D['w'] / 2 - 0.05, B1D['z'] + B1D['w'] / 2 + 0.05, 0.0, 2.4)] if B1D else []) if pre == 'L0' else wins_w(y0 + 1.0)
    wall_cut(f'{pre}_W', P, 'z', -W / 2, -D / 2, D / 2, y0, y1, wh, [1, 0, 0], MAT['plaster'])
    eh = [(SDR['z'] - 0.8, SDR['z'] + 0.8, Y1, Y1 + 2.7), (cr['z'] - 0.75, cr['z'] + 0.75, Y1, Y1 + 2.6)] if pre == 'L1' else []
    wall_cut(f'{pre}_E', P, 'z', W / 2, -D / 2, D / 2, y0, y1, eh, [-1, 0, 0], MAT['plaster'])
    for sx in (-1, 1):
        a, b = sorted((sx * V['x1'], sx * W / 2))
        wall_cut(f'{pre}_S{sx}', P, 'x', D / 2, a, b, y0, y1, [], [0, 0, -1], MAT['plaster'])
    for (z0w, z1w, wy0, wy1) in (wins_w(y0 + 1.1, B1SKIP) if pre == 'L0' else wins_w(y0 + 1.0)): window(f'{pre}_W', P, 'z', -W / 2, z0w, z1w, wy0, wy1, 1, fade=('Wwin', [1, 0, 0]))
    if nh: window(f'{pre}_N', P, 'x', -D / 2, NW[0], NW[1], nh[0][2], nh[0][3], 1, fade=('Nwin', [0, 0, 1]))
    # 牆裙（胡桃木 1.0 m，一樓）／踢腳板（二樓）
    hb = 1.0 if pre == 'L0' else 0.12
    for k, (a, b) in enumerate(spans(-D / 2 + T / 2 + 0.03, D / 2 - T / 2, [(B1D['z'] - B1D['w'] / 2 - 0.1, B1D['z'] + B1D['w'] / 2 + 0.1)] if (B1D and pre == 'L0') else [])):   # 牆裙在 B1 的門口斷開
        box(f'{pre}_wainscot_W' + (f'_{k}' if k else ''), MAT['walnut'], -W / 2 + T / 2, -W / 2 + T / 2 + 0.03, y0, y0 + hb, a, b, P)
    # 二樓的踢腳板在門口斷開（原本整條穿過多媒體中心、研究小間、樓梯間的門，門下有一條木條，還和門框疊在一起，BUG-COPLANAR-DEV）
    for k, (a, b) in enumerate(spans(-W / 2 + T / 2, W / 2 - T / 2, [(md['x'] - 0.85, md['x'] + 0.85), (NW[0] - 0.08, NW[1] + 0.08)] if pre == 'L1' else [])):
        box(f'{pre}_wainscot_N_{k}', MAT['walnut'], a, b, y0, y0 + hb, -D / 2 + T / 2, -D / 2 + T / 2 + 0.03, P)
for k, (a, b) in enumerate(spans(-D / 2 + T / 2 + 0.03, D / 2 - T / 2, [(cr['z'] - 0.85, cr['z'] + 0.85), (SDR['z'] - 0.9, SDR['z'] + 0.9)])):
    box(f'L1_wainscot_E_{k}', MAT['walnut'], W / 2 - T / 2 - 0.03, W / 2 - T / 2, Y1, Y1 + 0.12, a, b, L1)
# 門：二樓多媒體中心（北牆）、研究小間（東牆）、樓梯間（東牆，灰色鋼門）
door('L1_media', L1, 'x', -D / 2, md['x'], Y1, 1, fade=('Ndoor', [0, 0, 1]))
door('L1_carrels', L1, 'z', W / 2, cr['z'], Y1, -1, fade=('Edoor', [-1, 0, 0]))
door('L1_stairs', L1, 'z', W / 2, SDR['z'], Y1, -1, w=1.6, h=2.6, mat=MAT['locker'], fade=('Edoor', [-1, 0, 0]))
if B1D: door('L0_b1stairs', L0, 'z', -W / 2, B1D['z'], 0.0, 1, w=B1D['w'] + 0.1, h=2.3, mat=MAT['locker'], fade=('Wdoor', [1, 0, 0]))   # 往 B1 的樓梯間（灰色鋼門，和二樓往 3F 的一樣；門上的字是遊戲畫的 signs）
# 正面：門廳的挑高玻璃帷幕（直櫺、橫櫺、兩扇自動門），一樓那段在 L0、二樓那段在 L1
FS = {'fadegrp': 'Sfacade', 'fadedir': [0, 0, -1]}; gx0, gx1 = V['x0'], V['x1']
for pre, P, y0, y1 in (('L0', L0, 0.0, Y1), ('L1', L1, Y1, RY - 0.2)):
    GZS = D / 2 - 0.07   # 玻璃放在直櫺深度的中間（原本和框外面同一個平面）
    quad(f'{pre}_glass_S', MAT['glass'], [(gx0, y0, GZS), (gx1, y0, GZS), (gx1, y1, GZS), (gx0, y1, GZS)], P)
    for i in range(7):
        x = gx0 + i * (gx1 - gx0) / 6
        box(f'{pre}_mullion_S_{i}', MAT['frame'], x - 0.06, x + 0.06, y0, y1, D / 2 - 0.14, D / 2 + 0.01, P, props=FS)   # 框凸出 1 cm
    for k, yy in enumerate([v for v in (3.0, Y1, Y1 + 2.4, RY - 0.2) if (y0 <= v <= y1 if pre == 'L0' else y0 < v <= y1)]):   # 4.2 m 那道只放在一樓（原本兩層各放一道、疊在一起）
        box(f'{pre}_transom_S_{k}', MAT['frame'], gx0, gx1, yy - 0.06, yy + 0.06, D / 2 - 0.13, D / 2 + 0.005, P, props=FS)   # 橫櫺比直櫺薄一點
box('L1_glass_top_S', MAT['plaster'], gx0, gx1, RY - 0.2, RY, D / 2 - T / 2, D / 2 + T / 2, L1, props={'dir': [0, 0, -1]})
EX = L['entrance']['x']
for k, (a, b) in enumerate(((EX - 1.4, EX - 0.02), (EX + 0.02, EX + 1.4))):
    box(f'L0_autodoor_{k}', MAT['frame'], a, b, 2.55, 2.62, D / 2 - 0.2, D / 2 - 0.14, L0, props=FS)
    box(f'L0_autodoor_side_{k}', MAT['frame'], a if k == 0 else b - 0.05, a + 0.05 if k == 0 else b, 0, 2.6, D / 2 - 0.2, D / 2 - 0.14, L0, props=FS)
MAT['mat'] = pbr('lb_mat', None, tint=srgb('#3a3d40'), rough=0.9)   # 門口的腳踏墊（原本用門框的材質：細的鋁框不烘，腳踏墊是一大片地上的東西，要烘：LIB-HALL-LM-1028）
box('L0_entrance_mat', MAT['mat'], EX - 1.5, EX + 1.5, 0.0, 0.012, D / 2 - 1.8, D / 2 - 0.2, L0, props={'lmhide': 'side,down'})

# ---------------- 門廳：兩側木作牆（3 m）、置物櫃、還書箱；入口閘門 ----------------
for sx in (-1, 1):
    box(f'L0_vest_wall_{sx}', MAT['walnut'], sx * V['x1'] - 0.1, sx * V['x1'] + 0.1, 0, 3.0, V['z0'], V['z1'] - 0.15, L0, bevel=0.01)
    box(f'L0_vest_cap_{sx}', MAT['granite'], sx * V['x1'] - 0.13, sx * V['x1'] + 0.13, 3.0, 3.06, V['z0'], V['z1'] - 0.15, L0)
for i, px in enumerate(GT['posts']):
    w, d = GT['postW'], GT['postD']
    box(f'L0_gate_post_{i}', MAT['steel'], px - w / 2, px + w / 2, 0, 1.0, GT['z'] - d / 2, GT['z'] + d / 2, L0, bevel=0.02)
    box(f'L0_gate_top_{i}', MAT['frame'], px - w / 2 + 0.02, px + w / 2 - 0.02, 1.0, 1.02, GT['z'] - d / 2 + 0.05, GT['z'] + d / 2 - 0.05, L0)
    box(f'L0_gate_reader_{i}', MAT['light'], px - 0.07, px + 0.07, 1.021, 1.025, GT['z'] + 0.2, GT['z'] + 0.34, L0)
    for sgn in (-1, 1):   # 玻璃翼門（開著，貼著台座）
        if (px == GT['posts'][0] and sgn < 0) or (px == GT['posts'][-1] and sgn > 0): continue
        xg = px + sgn * (w / 2 + 0.02)
        quad(f'L0_gate_flap_{i}_{sgn}', MAT['glass'], [(xg, 0.35, GT['z'] - 0.3), (xg, 0.35, GT['z'] + 0.3), (xg, 0.95, GT['z'] + 0.3), (xg, 0.95, GT['z'] - 0.3)], L0, tile=1.0)
ep = GT['posts'][-1]
for sx in (-1, 1):
    a, b = sorted((sx * (ep + GT['postW'] / 2), sx * V['x1']))
    box(f'L0_gate_barrier_{sx}', MAT['steel'], a, b, 0.0, 0.1, GT['z'] - 0.05, GT['z'] + 0.05, L0)
    quad(f'L0_gate_barrier_glass_{sx}', MAT['glass'], [(a, 0.1, GT['z']), (b, 0.1, GT['z']), (b, 1.0, GT['z']), (a, 1.0, GT['z'])], L0, tile=1.0)
    cyl(f'L0_gate_barrier_rail_{sx}', MAT['steel'], (a, 1.02, GT['z']), (b, 1.02, GT['z']), 0.025, L0)

# ---------------- 中央大樓梯（帝國式）：中間那一跑往北、平台、兩側往南；每一階一塊石材＋止滑條；中間的斜頂矮牆、外側玻璃欄板 ----------------
for k in range(C['risers']):
    top = (k + 1) * R; zb = C['z1'] - k * TR; za = zb - TR
    box(f'L0_c_step_{k}', MAT['step'], C['x0'], C['x1'], 0, top, za, zb, L0, bevel=0.012, props={'lmhide': 'down,N'})   # 北面被上一階蓋住
    box(f'L0_c_nosing_{k}', MAT['frame'], C['x0'], C['x1'], top - 0.012, top + 0.003, zb - 0.045, zb, L0)   # 踏面前緣＝南邊
box('L0_landing', MAT['step'], LD['x0'], LD['x1'], 0, LD['y'], LD['z0'], LD['z1'], L0, bevel=0.012, props={'lmhide': 'down,N,E,W'})   # 北面貼著北牆、東西兩面貼著核心
# 兩側那一跑：懸空的樓梯（踏階＋斜的樓梯板，底下看得到），一樓那一側用矮花台圍起來（樓梯底下是室內植栽，走不進去：導航上那裡是樓梯的格子，高度接不上）
SLOPE = (Y1 - LD['y']) / (SD['z1'] - SD['z0'])
for si, sd in enumerate(S['sides']):
    for k in range(SD['risers']):
        top = LD['y'] + (k + 1) * R; za = SD['z0'] + k * TR; zb = za + TR
        box(f'L0_s{si}_step_{k}', MAT['step'], sd['x0'], sd['x1'], top - R - 0.02, top, za, zb, L0, bevel=0.01, props={'lmhide': 'down,S'})   # 底面、南面埋在樓梯板裡
        box(f'L0_s{si}_nosing_{k}', MAT['frame'], sd['x0'], sd['x1'], top - 0.012, top + 0.003, za, za + 0.045, L0)   # 踏面前緣＝北邊
    prism(f'L0_s{si}_slab', MAT['slab'], [(SD['z0'], LD['y'] - 0.32), (SD['z0'], LD['y']), (SD['z1'], Y1), (SD['z1'], Y1 - 0.32)], sd['x0'] + 0.003, sd['x1'] - 0.003, L0)   # 樓梯板（底面粉光）；兩側比踏階內縮 3 mm（原本側面和踏階側面同一個平面）
    xo = sd['x1'] if sd['x0'] < 0 else sd['x0']; xi = sd['x0'] if sd['x0'] < 0 else sd['x1']   # xo：靠中間那一側（矮牆那一側）；xi：靠外側（核心牆）
    # 底下：花台（前緣 0.8 m 高的石材矮牆＋整片植栽）＋兩棵室內樹
    xa, xb = sorted((sd['x0'] + 0.05, sd['x1'] - 0.05))
    box(f'L0_s{si}_planter_front', MAT['granite'], xa, xb, 0, 0.8, SD['z1'] - 0.75, SD['z1'] - 0.05, L0, bevel=0.015)
    box(f'L0_s{si}_planter_bed', MAT['granite'], xa, xb, 0, 0.45, SD['z0'] + 0.05, SD['z1'] - 0.75, L0)
    box(f'L0_s{si}_soil', MAT['soil'], xa + 0.05, xb - 0.05, 0.45, 0.47, SD['z0'] + 0.1, SD['z1'] - 0.8, L0)
    for ti, (pz, ph, pr) in enumerate(((SD['z1'] - 1.4, 2.85, 0.72), (SD['z0'] + 1.6, 1.85, 0.5))):   # 兩棵室內樹：樹頂在樓梯板底下（樓梯板底面 z=-2.0 處約 3.85 m、z=-3.2 處約 3.1 m）
        indoor_tree(f'L0_s{si}_tree{ti}', L0, (xa + xb) / 2 + (0.12 if ti else -0.1) * (1 if si else -1), 0.45, pz, ph, pr, seed=17 + si * 7 + ti)
    for j in range(6):   # 前緣花台裡的低矮植栽（蕨類），沿著花台排、垂到石材前緣外面一點
        px = xa + 0.22 + j * (xb - xa - 0.44) / 5
        fern_bush(f'L0_s{si}_fern{j}', L0, px, 0.8, SD['z1'] - 0.42, 0.3, seed=101 + si * 13 + j)
    for j in range(3):   # 花台裡、樹底下的大葉植栽
        broad_plant(f'L0_s{si}_bed{j}', L0, xa + 0.4 + j * (xb - xa - 0.8) / 2, 0.47, SD['z0'] + 0.9 + j * 1.1, 0.55, 0.32, seed=211 + si * 11 + j)
# 中間那一跑和兩側那一跑之間：兩道玻璃欄板（中間那一跑的兩側、兩側那一跑靠中間那一側），中間空著（看得到樓梯底下的植栽）
for sx in (-1, 1):
    xc = sx * (C['x1'] + 0.03); xs = sx * (S['sides'][1]['x0'] - 0.03)
    quad(f'L0_c_glass_{sx}', MAT['glass'], [(xc, 0.05, C['z1']), (xc, LD['y'] + 0.05, C['z0']), (xc, LD['y'] + 1.0, C['z0']), (xc, 1.0, C['z1'])], L0, tile=1.0)
    quad(f'L0_s_glass_{sx}', MAT['glass'], [(xs, LD['y'] + 0.05, SD['z0']), (xs, Y1 + 0.05, SD['z1']), (xs, Y1 + 1.0, SD['z1']), (xs, LD['y'] + 1.0, SD['z0'])], L0, tile=1.0)
    cyl(f'L0_c_rail_{sx}', MAT['brass'], (xc, 1.02, C['z1']), (xc, LD['y'] + 1.02, C['z0']), 0.024, L0)
    cyl(f'L0_s_rail_{sx}', MAT['brass'], (xs, LD['y'] + 1.02, SD['z0']), (xs, Y1 + 1.02, SD['z1']), 0.024, L0)
    box(f'L0_c_shoe_{sx}', MAT['steel'], xc - 0.03, xc + 0.03, 0, 0.12, C['z1'] - 0.3, C['z1'], L0)
    for k in range(0, C['risers'], 3):   # 中間那一跑的欄杆柱
        zz = C['z1'] - (k + 0.5) * TR; yy = (k + 1) * R
        box(f'L0_c_post_{sx}_{k}', MAT['steel'], xc - 0.02, xc + 0.02, yy, yy + 1.0, zz - 0.02, zz + 0.02, L0)
    for k in range(0, SD['risers'], 3):
        zz = SD['z0'] + (k + 0.5) * TR; yy = LD['y'] + (k + 1) * R
        box(f'L0_s_post_{sx}_{k}', MAT['steel'], xs - 0.02, xs + 0.02, yy, yy + 1.0, zz - 0.02, zz + 0.02, L0)
# 外側玻璃欄板（平台兩側 → 兩側那一跑）＋不鏽鋼扶手
def glass_run(name, x, pts, parent):
    for i in range(len(pts) - 1):
        (za, ya), (zb, yb) = pts[i], pts[i + 1]
        quad(f'{name}_glass_{i}', MAT['glass'], [(x, ya + 0.08, za), (x, yb + 0.08, zb), (x, yb + 1.0, zb), (x, ya + 1.0, za)], parent, tile=1.0)
        cyl(f'{name}_rail_{i}', MAT['steel'], (x, ya + 1.02, za), (x, yb + 1.02, zb), 0.03, parent)
        box(f'{name}_shoe_{i}', MAT['steel'], x - 0.035, x + 0.035, min(ya, yb), min(ya, yb) + 0.08, min(za, zb), max(za, zb), parent) if abs(ya - yb) < 1e-6 else None
for sx in (-1, 1):
    glass_run(f'L0_stair_out_{sx}', sx * (S['railX'] - 0.06), [(LD['z0'], LD['y']), (SD['z0'], LD['y']), (SD['z1'], Y1)], L0)
# 平台下面、兩側那一跑下面（核心）：一樓是實心的，外面是書架牆（家具那一段）；核心的粉光牆
for sx in (-1, 1):
    xa, xb = sorted((sx * (S['railX'] - 0.1), sx * CO['x1']))
    box(f'L0_core_{sx}', MAT['plaster'], xa, xb, 0, Y1 - ST, CO['z0'], CO['z1'], L0, props={'lmhide': 'up,N'})
    box(f'L0_core_base_{sx}', MAT['walnut'], xa - 0.02, xb + 0.02, 0, 0.12, CO['z1'] - 0.02, CO['z1'] + 0.01, L0)

# ---------------- 二樓的玻璃欄杆：兩翼靠樓梯、靠中庭的邊；連廊南北兩邊 ----------------
def glass_rail(name, a, b, y, parent):
    (x0, z0), (x1, z1) = a, b
    quad(f'{name}_glass', MAT['glass'], [(x0, y + 0.05, z0), (x1, y + 0.05, z1), (x1, y + 1.0, z1), (x0, y + 1.0, z0)], parent, tile=1.0)
    cyl(f'{name}_rail', MAT['steel'], (x0, y + 1.04, z0), (x1, y + 1.04, z1), 0.03, parent)
    if abs(x1 - x0) > abs(z1 - z0): box(f'{name}_shoe', MAT['steel'], min(x0, x1), max(x0, x1), y, y + 0.1, z0 - 0.04, z0 + 0.04, parent)
    else: box(f'{name}_shoe', MAT['steel'], x0 - 0.04, x0 + 0.04, y, y + 0.1, min(z0, z1), max(z0, z1), parent)
for sx in (-1, 1):
    glass_rail(f'L1_rail_stair_{sx}', (sx * S['railX'], CO['z0'] + T / 2), (sx * S['railX'], SD['z1'] - 0.3), Y1, L1)
    glass_rail(f'L1_rail_atrium_{sx}', (sx * U['band']['x1'], U['band']['z1']), (sx * U['band']['x1'], D / 2 - T / 2), Y1, L1)
glass_rail('L1_rail_band_N', (-S['sides'][1]['x0'], SD['z1']), (S['sides'][1]['x0'], SD['z1']), Y1, L1)
glass_rail('L1_rail_band_S', (U['band']['x0'], U['band']['z1']), (U['band']['x1'], U['band']['z1']), Y1, L1)

# ---------------- 家具 ----------------
random.seed(7)
def books(prefix, parent, x0, x1, y, z, depth, facing, height=0.36):
    """一排書（一本一個方塊，高矮、厚薄、顏色不一；面向 facing＝+1（+z）或 −1，沿 x 排）"""
    x = x0 + 0.02
    while x < x1 - 0.05:
        if random.random() < 0.05: x += 0.06 + random.random() * 0.1; continue
        bw = 0.025 + random.random() * 0.035; bh = height * (0.7 + random.random() * 0.3); bd = depth * (0.75 + random.random() * 0.2)
        c = random.randrange(len(BOOKC)); zf = z + facing * (depth / 2 - 0.01)
        box(f'{prefix}_bk_{x:.3f}_{y:.2f}', MAT[f'book{c}'], x, min(x + bw, x1), y, y + bh, zf - facing * bd, zf, parent)
        x += bw + 0.003

def bookshelf(prefix, parent, cx, cz, w, ry, y0, H=2.2, Dp=0.4):
    """書架（胡桃木側板、層板、背板＋書），ry＝面向（0：+z、π：−z、±π/2：±x）。用區域座標建好再轉"""
    grp = group(f'{prefix}_shelf_{cx:.1f}_{cz:.1f}', parent)
    # 零件不共面（BUG-COPLANAR-DEV）：底座內縮、頂板外凸 5 mm、直隔板和層板從背板前面開始、層板比直隔板退 6 mm、直隔板夾在底座和頂板之間
    for (x0, x1, ya, yb, z0, z1, mat) in (((-w / 2 + 0.005, w / 2 - 0.005, 0, 0.1, -Dp / 2 + 0.02, Dp / 2 - 0.01, MAT['walnut'])), ((-w / 2 - 0.005, w / 2 + 0.005, H - 0.04, H, -Dp / 2 + 0.02, Dp / 2 + 0.005, MAT['walnut'])), ((-w / 2, w / 2, 0, H, -Dp / 2, -Dp / 2 + 0.02, MAT['walnut']))):
        box(f'{prefix}_sb_{cx:.1f}_{ya:.1f}_{z0:.2f}', mat, x0, x1, ya, yb, z0, z1, grp)
    nb = max(1, round(w / 0.95))
    for i in range(nb + 1):
        xx = -w / 2 + 0.015 + (w - 0.03) * i / nb
        box(f'{prefix}_sv_{cx:.1f}_{i}', MAT['walnut'], xx - 0.015, xx + 0.015, 0.125, H - 0.04, -Dp / 2 + 0.02, Dp / 2, grp)
    for yy in (0.1, 0.62, 1.14, 1.66):
        box(f'{prefix}_sh_{cx:.1f}_{yy:.2f}', MAT['walnut'], -w / 2 + 0.03, w / 2 - 0.03, yy, yy + 0.025, -Dp / 2 + 0.02, Dp / 2 - 0.006, grp)
        books(f'{prefix}_{cx:.1f}_{cz:.1f}', grp, -w / 2 + 0.03, w / 2 - 0.03, yy + 0.025, 0.0, Dp - 0.06, 1)   # 書排在兩側板中間（原本最後一本的側面和外側板同一個平面）
    grp.location = g2b(cx, y0, cz); grp.rotation_euler = (0, 0, ry)   # Blender 的 z 軸＝遊戲的 y 軸（往上）；遊戲的 ry 轉 +z→(sin,cos) ＝ Blender 繞 z 轉 ry
    return grp

def study_table(prefix, parent, f, y):
    x0, x1, z0, z1 = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - 0.5, f['z'] + 0.5
    box(f'{prefix}_top', MAT['walnut'], x0, x1, y + 0.72, y + 0.77, z0, z1, parent, bevel=0.01)
    for (lx, lz) in ((x0 + 0.08, z0 + 0.08), (x1 - 0.08, z0 + 0.08), (x0 + 0.08, z1 - 0.08), (x1 - 0.08, z1 - 0.08)):
        box(f'{prefix}_leg_{lx:.1f}_{lz:.1f}', MAT['walnut'], lx - 0.035, lx + 0.035, y, y + 0.72, lz - 0.035, lz + 0.035, parent)
    box(f'{prefix}_divider', MAT['walnut'], x0 + 0.1, x1 - 0.1, y + 0.77, y + 1.07, f['z'] - 0.015, f['z'] + 0.015, parent)   # 長桌中間的隔板
    n = f.get('seats', 4)
    for i in range(n):
        sx = x0 + f['w'] * (i + 0.5) / n
        cyl(f'{prefix}_lamp_stem_{i}', MAT['brass'], (sx, y + 0.77, f['z']), (sx, y + 1.18, f['z']), 0.012, parent, seg=8)
        cyl(f'{prefix}_lamp_shade_{i}', MAT['shade'], (sx, y + 1.12, f['z']), (sx, y + 1.24, f['z']), 0.16, parent, seg=14, r2=0.07)
        for s in (-1, 1):   # 椅子（木頭）：椅面、靠背、四腳；s=−1 在 −z 那一側面向 +z
            cz = f['z'] + s * 0.8; bz = cz + s * 0.2
            box(f'{prefix}_chair_seat_{i}_{s}', MAT['woodL'], sx - 0.22, sx + 0.22, y + 0.44, y + 0.49, cz - 0.21, cz + 0.21, parent, bevel=0.01)
            box(f'{prefix}_chair_back_{i}_{s}', MAT['woodL'], sx - 0.21, sx + 0.21, y + 0.66, y + 0.92, bz - 0.02, bz + 0.02, parent, bevel=0.008)
            for (lx, lz) in ((-0.19, -0.18), (0.19, -0.18), (-0.19, 0.18), (0.19, 0.18)):
                box(f'{prefix}_chair_leg_{i}_{s}_{lx}_{lz}', MAT['woodL'], sx + lx - 0.018, sx + lx + 0.018, y, y + (0.92 if lz * s > 0 else 0.44), cz + lz - 0.018, cz + lz + 0.018, parent)

def sofa(prefix, parent, f, y, w=2.2):
    """皮沙發（ry＝坐的那一面朝哪裡）：用區域座標建在原點，再轉"""
    grp = group(f'{prefix}_sofa', parent); hw = w / 2
    box(f'{prefix}_base', MAT['leather'], -hw, hw, 0.08, 0.30, -0.43, 0.43, grp, bevel=0.03)
    for sx in (-0.49, 0.49) if w > 1.5 else (0.0,):
        box(f'{prefix}_cush_{sx}', MAT['leather'], sx - (0.48 if w > 1.5 else 0.3), sx + (0.48 if w > 1.5 else 0.3), 0.30, 0.44, -0.31, 0.43, grp, bevel=0.04)
    box(f'{prefix}_back', MAT['leather'], -hw + 0.1, hw - 0.1, 0.30, 0.84, -0.43, -0.23, grp, bevel=0.05)
    for sx in (-1, 1): box(f'{prefix}_arm_{sx}', MAT['leather'], sx * (hw - 0.08) - 0.08, sx * (hw - 0.08) + 0.08, 0.26, 0.60, -0.43, 0.43, grp, bevel=0.03)
    for (lx, lz) in ((-hw + 0.1, -0.35), (hw - 0.1, -0.35), (-hw + 0.1, 0.35), (hw - 0.1, 0.35)):
        box(f'{prefix}_leg_{lx:.1f}_{lz:.1f}', MAT['walnut'], lx - 0.03, lx + 0.03, 0, 0.08, lz - 0.03, lz + 0.03, grp)
    grp.location = g2b(f['x'], y, f['z']); grp.rotation_euler = (0, 0, f.get('ry', 0))
    return grp

for i, f in enumerate(L['furniture']):
    P = L1 if f['lv'] else L0; y = Y1 if f['lv'] else 0.0; pre = 'L1' if f['lv'] else 'L0'; ry = f.get('ry', 0); t = f['type']
    if t == 'lockers':
        grp = group(f'{pre}_lockers_{i}', P); w, d = f['w'], f['d']
        box(f'{pre}_lk_body_{i}', MAT['locker'], -w / 2, w / 2, 0, 1.9, -d / 2, d / 2, grp, bevel=0.01)
        for a in range(8):
            for b_ in range(4):
                xa = -w / 2 + 0.02 + a * (w - 0.04) / 8
                box(f'{pre}_lk_door_{i}_{a}_{b_}', MAT['frame'], xa + 0.01, xa + (w - 0.04) / 8 - 0.01, 0.08 + b_ * 0.45, 0.08 + b_ * 0.45 + 0.42, d / 2, d / 2 + 0.01, grp)
                box(f'{pre}_lk_key_{i}_{a}_{b_}', MAT['brass'], xa + 0.05, xa + 0.09, 0.4 + b_ * 0.45, 0.44 + b_ * 0.45, d / 2 + 0.01, d / 2 + 0.025, grp)
        grp.location = g2b(f['x'], y, f['z']); grp.rotation_euler = (0, 0, ry)
    elif t == 'returnBox':
        grp = group(f'{pre}_return_{i}', P)
        box(f'{pre}_rb_body_{i}', MAT['shade'], -0.35, 0.35, 0, 1.1, -0.3, 0.3, grp, bevel=0.02)
        box(f'{pre}_rb_slot_{i}', MAT['frame'], -0.25, 0.25, 0.85, 0.92, 0.3, 0.31, grp)
        grp.location = g2b(f['x'], y, f['z']); grp.rotation_euler = (0, 0, ry)
    elif t == 'notice': pass   # 公告欄：遊戲裡的 W3.bulletin()（canvas），不在模型裡
    elif t == 'desk':   # 服務台：胡桃木櫃檯＋花崗石檯面、後面的工作櫃、兩側隔板
        x0, x1, z0, z1 = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2
        box(f'{pre}_desk_body', MAT['walnut'], x0, x1, y, y + 1.05, z0, z1, P, bevel=0.01)
        box(f'{pre}_desk_top', MAT['granite'], x0 - 0.05, x1 + 0.05, y + 1.05, y + 1.1, z0 - 0.08, z1 + 0.05, P, bevel=0.01)
        box(f'{pre}_desk_work', MAT['walnut'], x0, x1, y, y + 0.78, z1 + 0.2, z1 + 0.7, P)
        box(f'{pre}_desk_monitor', MAT['frame'], f['x'] - 0.3, f['x'] + 0.2, y + 1.12, y + 1.45, z1 - 0.15, z1 - 0.1, P)
        for k in range(3): box(f'{pre}_desk_books_{k}', MAT[f'book{k * 3}'], x0 + 0.3 + k * 0.25, x0 + 0.5 + k * 0.25, y + 1.1, y + 1.16 + 0.04 * k, z0 + 0.05, z0 + 0.3, P)
    elif t == 'partition':
        box(f'{pre}_partition_{i}', MAT['walnut'], f['x'] - 0.05, f['x'] + 0.05, y, y + 1.2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P)
    elif t == 'officeWall':
        sx_ = sf['x']; a, b = f['x0'], f['x1']
        for k, (pa, pb) in enumerate(((a, sx_ - 0.75), (sx_ + 0.75, b))):
            box(f'{pre}_office_WALL_{k}', MAT['plaster'], pa, pb, y, Y1 - ST, f['z'] - 0.1, f['z'] + 0.1, P, props={'dir': [0, 0, -1]})
        box(f'{pre}_office_WALL_top', MAT['plaster'], sx_ - 0.75, sx_ + 0.75, y + 2.6, Y1 - ST, f['z'] - 0.1, f['z'] + 0.1, P, props={'dir': [0, 0, -1]})
        box(f'{pre}_office_wainscot', MAT['walnut'], a, b, y, y + 1.0, f['z'] - 0.13, f['z'] - 0.1, P)
        door(f'{pre}_staff', P, 'x', f['z'], sx_, y, -1, fade=None)
    elif t == 'display':
        x0, x1, z0, z1 = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2
        box(f'{pre}_disp_{i}', MAT['woodL'], x0, x1, y, y + 0.8, z0, z1, P, bevel=0.02)
        for k in range(6):
            bx = x0 + 0.25 + k * (f['w'] - 0.5) / 5; bz = f['z'] + (0.18 if k % 2 else -0.18)
            box(f'{pre}_disp_book_{i}_{k}', MAT[f'book{(k * 3 + i) % len(BOOKC)}'], bx - 0.11, bx + 0.11, y + 0.8, y + 0.83, bz - 0.15, bz + 0.15, P)
            box(f'{pre}_disp_stand_{i}_{k}', MAT[f'book{(k * 7 + i) % len(BOOKC)}'], bx - 0.08, bx + 0.08, y + 0.83, y + 1.05, bz - 0.01, bz + 0.01, P) if k % 3 == 0 else None
    elif t == 'sofa': sofa(f'{pre}_sofa_{i}', P, f, y)
    elif t == 'armchair': sofa(f'{pre}_arm_{i}', P, f, y, w=0.82)
    elif t == 'racks':   # 期刊報紙架：斜的層板＋報紙、雜誌
        grp = group(f'{pre}_racks_{i}', P); w, d = f['w'], f['d']
        box(f'{pre}_rk_back_{i}', MAT['walnut'], -w / 2 + 0.02, w / 2 - 0.02, 0, 1.6, -d / 2, -d / 2 + 0.04, grp)   # 背板、層板夾在兩側板中間，層板比側板退 6 mm
        for sx in (-1, 1): box(f'{pre}_rk_side_{i}_{sx}', MAT['walnut'], sx * w / 2 - 0.02, sx * w / 2 + 0.02, 0, 1.6, -d / 2, d / 2, grp)
        for k in range(3):
            yy = 0.3 + k * 0.48
            box(f'{pre}_rk_shelf_{i}_{k}', MAT['walnut'], -w / 2 + 0.02, w / 2 - 0.02, yy, yy + 0.03, -d / 2 + 0.04, d / 2 - 0.006, grp)
            for m in range(6):
                xm = -w / 2 + 0.35 + m * (w - 0.7) / 5
                box(f'{pre}_rk_mag_{i}_{k}_{m}', MAT['paper'] if (m + k) % 3 else MAT[f'book{(m + 2 * k) % len(BOOKC)}'], xm - 0.24, xm + 0.24, yy + 0.03, yy + 0.38, d / 2 - 0.12, d / 2 - 0.1, grp)
        grp.location = g2b(f['x'], y, f['z']); grp.rotation_euler = (0, 0, ry)
    elif t in ('coreShelf', 'shelf'): bookshelf(f'{pre}_{t}_{i}', P, f['x'], f['z'], f['w'], ry, y)
    elif t == 'planter':
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=f['r'] * 0.88, radius2=f['r'], depth=0.6)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.3, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_planter_{i}', bm, MAT['granite'], P)
        box(f'{pre}_planter_soil_{i}', MAT['soil'], f['x'] - f['r'] * 0.66, f['x'] + f['r'] * 0.66, y + 0.56, y + 0.58, f['z'] - f['r'] * 0.66, f['z'] + f['r'] * 0.66, P)
        broad_plant(f'{pre}_plant_{i}', P, f['x'], y + 0.57, f['z'], 1.35, f['r'] * 1.15, seed=307 + i * 5 + (100 if pre == 'L1' else 0))   # 大葉盆栽（琴葉榕一類）
    elif t == 'studyTable': study_table(f'{pre}_st_{i}', P, f, y)
# ================================================================ 生活感擺設（LIB-HALL-LM-1028，LAWWW2-C 10-28；使用者 P0「校內建築室內……廉價手遊感」）
# 每一區先想「誰在用、剛發生什麼」（INTERIOR_AAA_REVIEW_1028.md 第 2-2、5 節）：
#   門廳：下雨天的傘架、雨傘套袋機；大廳：查詢電腦、自助借書機（出閘門前借書）、館員推著還書車整理要上架的書、服務台上剛還回來的書；
#   東側電梯旁的飲水機；消防栓箱、滅火器、出口燈、緊急照明；二樓自習區：有人去上廁所，東西留在桌上（筆電、課本、水壺、筆袋、便利貼）；
#   二樓東側：還書車、兩張單人沙發中間的小茶几（雜誌）。字、螢幕畫面由遊戲畫或不畫（模型裡沒有字，D77）。
# 地上的擺設在 library_layout.js 有一筆 prop（導航擋住、備用方塊；library3d.js）；桌上、牆上的不擋路。
# 劇情的座位不放東西：小安「總圖的下午」那一桌（z>0 的第一張長桌）最西邊面對面兩個位子（library3d.js 的 seats[0]、seats[1]）；只放在玩家不能坐的那一半座位前面（library3d.js：每張桌子一半的座位有「坐下讀書」）
for k_, c_, r_ in (('red', '#b8302a', 0.5), ('white', '#e9e7e2', 0.6), ('blue', '#2e6fb0', 0.55), ('yellow', '#e0b23a', 0.6), ('green', '#2f8a4e', 0.6), ('navy', '#24324a', 0.6),
                   ('rubber', '#3a3f46', 0.8), ('black', '#202224', 0.6), ('exitg', '#1f8f4a', 0.5), ('paper2', '#f2eee4', 0.9), ('paper3', '#cfe3ea', 0.9), ('cork', '#b98e5a', 0.95),
                   ('silver', '#b9bcc0', 0.45), ('teal', '#3f8f8a', 0.55), ('pink', '#d98a9a', 0.6), ('cream', '#e8dcc0', 0.7)):
    MAT[k_] = pbr('lb_' + k_, None, tint=srgb(c_), rough=r_)
MAT['exitglow'] = pbr('lb_exitglow', None, tint=srgb('#e8fff0'), rough=0.5, emit=srgb('#9dffc4'))   # 出口燈的發光面（不烘、一直亮）
MAT['lampglow'] = pbr('lb_lampglow', None, tint=srgb('#fff3d6'), rough=0.9, emit=srgb('#ffe2b0'))   # 檯燈、壁燈的發光面
MAT['screen'] = pbr('lb_screen', None, tint=srgb('#1d2733'), rough=0.25, emit=srgb('#22364a'))      # 查詢電腦、自助借書機、筆電的螢幕（暗暗亮著，沒有畫面）

def _toB(rot):
    """遊戲座標的旋轉（繞 x、y、z，依序）→ Blender 座標的旋轉矩陣"""
    Pm = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
    Rg = Matrix.Rotation(rot[2], 3, 'Z') @ Matrix.Rotation(rot[1], 3, 'Y') @ Matrix.Rotation(rot[0], 3, 'X')
    return Pm @ Rg @ Pm.transposed()

def rbox(name, mat, c, sz, parent=None, rot=(0.0, 0.0, 0.0), bevel=0.0, seg=1, props=None):
    """中心 c、大小 sz（遊戲座標 x、y、z）、可以轉的（圓角）方塊"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, verts=bm.verts, vec=(sz[0], sz[2], sz[1]))
    if bevel > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(bevel, min(sz) * 0.45), segments=seg, affect='EDGES')
    bmesh.ops.transform(bm, verts=bm.verts, matrix=_toB(rot).to_4x4(), space=Matrix.Identity(4))
    bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(*c)); bm.normal_update(); box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def _rot2(dx, dz, ry):
    """區域座標（擺設自己的 x、z）轉 ry 以後的位移：+z 轉到 (sin ry, cos ry)"""
    c, s = math.cos(ry), math.sin(ry)
    return dx * c + dz * s, -dx * s + dz * c

def _umbrellas(pre, f, y, P):
    """傘架：不鏽鋼桶＋五把收起來的傘（顏色不一，斜斜地插著；下雨天的門口）"""
    x, z = f['x'], f['z']
    cyl(pre + '_bucket', MAT['steel'], (x, y, z), (x, y + 0.48, z), 0.16, P, seg=16)
    cyl(pre + '_rim', MAT['steel'], (x, y + 0.47, z), (x, y + 0.5, z), 0.17, P, seg=16)
    for k, (dx, dz, m, tx, tz, hh) in enumerate(((-0.06, -0.05, 'navy', -0.12, -0.06, 0.92), (0.06, -0.04, 'red', 0.1, -0.08, 0.86), (-0.04, 0.06, 'black', -0.08, 0.1, 0.95),
                                                 (0.07, 0.06, 'green', 0.12, 0.07, 0.83), (0.0, 0.0, 'yellow', 0.02, -0.12, 0.8))):
        b0 = (x + dx, y + 0.06, z + dz); b1 = (x + dx + tx, y + hh, z + dz + tz)
        cyl(f'{pre}_u_{k}', MAT[m], b0, b1, 0.03, P, seg=8, r2=0.012)
        cyl(f'{pre}_h_{k}', MAT['black'], b1, (b1[0], b1[1] + 0.09, b1[2]), 0.012, P, seg=6)

def _bagger(pre, f, y, P):
    """雨傘套袋機：不鏽鋼立架、上面一卷塑膠套（白）、插傘的開口（黑），下面的回收桶接用過的套子"""
    x, z, ry = f['x'], f['z'], f.get('ry', 0.0)
    rbox(pre + '_body', MAT['steel'], (x, y + 0.55, z), (0.38, 1.1, 0.26), P, rot=(0, ry, 0), bevel=0.02)
    ox, oz = _rot2(0.0, 0.135, ry)
    rbox(pre + '_slot', MAT['black'], (x + ox, y + 0.98, z + oz), (0.16, 0.06, 0.01), P, rot=(0, ry, 0))
    rbox(pre + '_roll', MAT['white'], (x, y + 1.13, z), (0.3, 0.06, 0.2), P, rot=(0, ry, 0), bevel=0.02)
    ox, oz = _rot2(0.0, 0.14, ry)
    rbox(pre + '_bin', MAT['rubber'], (x + ox, y + 0.25, z + oz), (0.3, 0.42, 0.03), P, rot=(0, ry, 0), bevel=0.005)

def _opac(pre, f, y, P):
    """館藏查詢電腦（站著用）：深灰的立柱、斜的螢幕、鍵盤；正面朝 ry"""
    x, z, ry = f['x'], f['z'], f.get('ry', 0.0)
    rbox(pre + '_base', MAT['rubber'], (x, y + 0.02, z), (0.46, 0.04, 0.4), P, rot=(0, ry, 0), bevel=0.01)
    rbox(pre + '_post', MAT['rubber'], (x, y + 0.5, z), (0.12, 0.96, 0.1), P, rot=(0, ry, 0))
    ox, oz = _rot2(0.0, 0.06, ry)
    rbox(pre + '_shelf', MAT['rubber'], (x + ox, y + 1.0, z + oz), (0.46, 0.03, 0.26), P, rot=(0, ry, 0), bevel=0.008)
    rbox(pre + '_kb', MAT['black'], (x + ox, y + 1.025, z + oz), (0.36, 0.02, 0.12), P, rot=(0, ry, 0), bevel=0.004)
    ox, oz = _rot2(0.0, -0.07, ry)
    rbox(pre + '_mon', MAT['black'], (x + ox, y + 1.3, z + oz), (0.44, 0.3, 0.04), P, rot=(-0.25, ry, 0), bevel=0.006)
    ox, oz = _rot2(0.0, -0.047, ry)
    rbox(pre + '_scr', MAT['screen'], (x + ox, y + 1.3, z + oz), (0.4, 0.26, 0.004), P, rot=(-0.25, ry, 0))

def _selfcheck(pre, f, y, P):
    """自助借書機：米白色櫃子、斜的觸控螢幕、放書的感應台（深灰）、出單口；正面朝 ry"""
    x, z, ry = f['x'], f['z'], f.get('ry', 0.0)
    rbox(pre + '_body', MAT['cream'], (x, y + 0.5, z), (0.62, 1.0, 0.5), P, rot=(0, ry, 0), bevel=0.02)
    ox, oz = _rot2(0.0, 0.06, ry)
    rbox(pre + '_pad', MAT['rubber'], (x + ox, y + 1.01, z + oz), (0.5, 0.02, 0.34), P, rot=(0, ry, 0), bevel=0.006)
    ox, oz = _rot2(0.0, -0.17, ry)
    rbox(pre + '_head', MAT['cream'], (x + ox, y + 1.32, z + oz), (0.56, 0.42, 0.12), P, rot=(-0.22, ry, 0), bevel=0.015)
    ox, oz = _rot2(0.0, -0.105, ry)
    rbox(pre + '_scr', MAT['screen'], (x + ox, y + 1.33, z + oz), (0.44, 0.3, 0.004), P, rot=(-0.22, ry, 0))
    ox, oz = _rot2(0.18, 0.252, ry)
    rbox(pre + '_slip', MAT['black'], (x + ox, y + 0.82, z + oz), (0.1, 0.012, 0.004), P, rot=(0, ry, 0))
    ox, oz = _rot2(0.18, 0.256, ry)
    rbox(pre + '_paper', MAT['white'], (x + ox, y + 0.79, z + oz), (0.07, 0.05, 0.002), P, rot=(0, ry, 0))   # 吐出一半的借書單

def _bookcart(pre, f, y, P):
    """還書車：灰色鐵架三層、四個輪子；書斜斜地靠著、上層有幾本平放（館員整理到一半，還沒上架）；長邊沿 x，照 ry 轉"""
    g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, f.get('ry', 0.0))
    w, d = f['w'], f['d']
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(f'{pre}_post_{sx}{sz}', MAT['locker'], sx * (w / 2 - 0.02) - 0.015, sx * (w / 2 - 0.02) + 0.015, 0.09, 0.98, sz * (d / 2 - 0.02) - 0.015, sz * (d / 2 - 0.02) + 0.015, g)
            cyl(f'{pre}_wheel_{sx}{sz}', MAT['black'], (sx * (w / 2 - 0.05), 0.045, sz * (d / 2 - 0.04) - 0.02), (sx * (w / 2 - 0.05), 0.045, sz * (d / 2 - 0.04) + 0.02), 0.045, g, seg=10)
    for k, yy in enumerate((0.12, 0.5, 0.88)):
        box(f'{pre}_shelf_{k}', MAT['locker'], -w / 2, w / 2, yy, yy + 0.02, -d / 2, d / 2, g)
        x_ = -w / 2 + 0.04; j = 0
        while x_ < w / 2 - 0.1:
            if k == 2 and j > 4: break
            bw = 0.03 + ((j * 37 + k * 11) % 5) * 0.008; bh = 0.2 + ((j * 13 + k) % 4) * 0.025; c = (j * 3 + k * 5) % len(BOOKC)
            tilt = 0.18 if (j % 6 == 5) else 0.0
            rbox(f'{pre}_bk_{k}_{j}', MAT[f'book{c}'], (x_ + bw / 2 + (0.04 if tilt else 0.0), yy + 0.02 + bh / 2 * math.cos(tilt), 0.0), (bw, bh, d * 0.7), g, rot=(0, 0, -tilt))
            x_ += bw + (0.06 if tilt else 0.004); j += 1
    for k, (dx, m) in enumerate(((0.12, 'book3'), (0.15, 'book6'), (0.11, 'book1'))):   # 上層平放的三本（剛從還書箱拿出來）
        rbox(f'{pre}_flat_{k}', MAT[m], (0.22, 0.9 + 0.012 + k * 0.027, 0.0), (0.2 - k * 0.02, 0.025, 0.27 - k * 0.02), g, rot=(0, dx * (k - 1) * 2, 0))
    box(f'{pre}_handle', MAT['locker'], -w / 2 - 0.04, -w / 2 - 0.02, 0.9, 1.05, -d / 2 + 0.05, d / 2 - 0.05, g)

def _water(pre, f, y, P):
    """飲水機（熱水、溫水、冰水三個出水口）＋上面的紙杯架；正面朝 ry"""
    x, z, ry = f['x'], f['z'], f.get('ry', 0.0)
    rbox(pre + '_body', MAT['white'], (x, y + 0.62, z), (0.4, 1.24, 0.4), P, rot=(0, ry, 0), bevel=0.015)
    ox, oz = _rot2(0.0, 0.2, ry)
    rbox(pre + '_panel', MAT['silver'], (x + ox, y + 0.98, z + oz), (0.34, 0.2, 0.012), P, rot=(0, ry, 0))
    for k, (dx, m) in enumerate(((-0.1, 'red'), (0.0, 'white'), (0.1, 'blue'))):
        ox, oz = _rot2(dx, 0.215, ry); rbox(f'{pre}_btn_{k}', MAT[m], (x + ox, y + 1.04, z + oz), (0.05, 0.03, 0.01), P, rot=(0, ry, 0))
    ox, oz = _rot2(0.0, 0.17, ry)
    rbox(pre + '_tray', MAT['silver'], (x + ox, y + 0.66, z + oz), (0.32, 0.02, 0.1), P, rot=(0, ry, 0))
    ox, oz = _rot2(0.24, 0.05, ry)
    cyl(pre + '_cups', MAT['white'], (x + ox, y + 0.9, z + oz), (x + ox, y + 1.18, z + oz), 0.04, P, seg=10)

def _ext(pre, f, y, P):
    """滅火器（紅色鋼瓶、黑色握把和噴管）：靠牆放地上"""
    x, z = f['x'], f['z']; s = -1 if z > 0 else 1
    box(pre + '_base', MAT['red'], x - 0.12, x + 0.12, y, y + 0.05, z - 0.1, z + 0.1, P, bevel=0.01)
    cyl(pre + '_body', MAT['red'], (x, y + 0.05, z), (x, y + 0.52, z), 0.075, P, seg=14)
    cyl(pre + '_neck', MAT['black'], (x, y + 0.52, z), (x, y + 0.58, z), 0.028, P, seg=8)
    box(pre + '_lever', MAT['black'], x - 0.07, x + 0.05, y + 0.58, y + 0.6, z - 0.015, z + 0.015, P)
    cyl(pre + '_hose', MAT['black'], (x + 0.03, y + 0.56, z + s * 0.03), (x + 0.07, y + 0.22, z + s * 0.07), 0.012, P, seg=6)
    box(pre + '_tag', MAT['white'], x - 0.04, x + 0.04, y + 0.3, y + 0.4, z + s * 0.074, z + s * 0.078, P)

def _sidetable(pre, f, y, P):
    """單人沙發中間的小茶几（胡桃木）：上面兩本雜誌、一份摺起來的報紙"""
    x, z = f['x'], f['z']
    cyl(pre + '_top', MAT['walnut'], (x, y + 0.47, z), (x, y + 0.5, z), 0.26, P, seg=20)
    cyl(pre + '_leg', MAT['walnut'], (x, y + 0.02, z), (x, y + 0.47, z), 0.035, P, seg=10)
    cyl(pre + '_foot', MAT['walnut'], (x, y, z), (x, y + 0.025, z), 0.18, P, seg=16)
    for k, (m, rt, dx) in enumerate((('paper3', 0.3, -0.04), ('book2', -0.2, 0.03), ('paper', 0.9, 0.0))):
        rbox(f'{pre}_mag_{k}', MAT[m], (x + dx, y + 0.505 + 0.006 + k * 0.009, z + 0.02 * k), (0.21, 0.006, 0.28), P, rot=(0, rt, 0))
PROPS = {'umbrellas': _umbrellas, 'bagger': _bagger, 'opac': _opac, 'selfcheck': _selfcheck, 'bookcart': _bookcart, 'water': _water, 'extinguisher': _ext, 'sidetable': _sidetable}
for i, f in enumerate(L['furniture']):
    if f['type'] == 'prop': PROPS[f['kind']](('L1' if f['lv'] else 'L0') + f'_prop_{f["kind"]}_{i}', f, Y1 if f['lv'] else 0.0, L1 if f['lv'] else L0)

# 服務台上剛還回來的書（一疊，最上面夾著還書單）、感應器、筆筒
_dk = next(f for f in L['furniture'] if f['type'] == 'desk'); _dx0, _dz0, _dzc = _dk['x'] - _dk['w'] / 2, _dk['z'] - _dk['d'] / 2, _dk['z']
for k, (m, rt) in enumerate((('book4', 0.05), ('book7', -0.08), ('book1', 0.12), ('book9', -0.02))):
    rbox(f'L0_desk_ret_{k}', MAT[m], (_dx0 + 2.6, 1.1 + 0.014 + k * 0.03, _dzc - 0.12), (0.2 - 0.01 * k, 0.028, 0.28 - 0.01 * k), L0, rot=(0, rt, 0))
rbox('L0_desk_slip', MAT['white'], (_dx0 + 2.62, 1.1 + 0.135, _dzc - 0.2), (0.08, 0.002, 0.16), L0, rot=(0, 0.15, 0))
rbox('L0_desk_reader', MAT['black'], (_dx0 + 2.2, 1.1 + 0.015, _dzc - 0.15), (0.24, 0.03, 0.18), L0, bevel=0.006)
cyl('L0_desk_pens', MAT['rubber'], (_dx0 + 3.25, 1.1, _dzc + 0.1), (_dx0 + 3.25, 1.2, _dzc + 0.1), 0.04, L0, seg=10)
for k, (dx, dz, m) in enumerate(((-0.01, 0.0, 'blue'), (0.012, 0.01, 'red'), (0.0, -0.012, 'black'))):
    cyl(f'L0_desk_pen_{k}', MAT[m], (_dx0 + 3.25 + dx, 1.15, _dzc + 0.1 + dz), (_dx0 + 3.25 + dx * 3, 1.27, _dzc + 0.1 + dz * 3), 0.005, L0, seg=5)

# 二樓自習區：有人去上廁所、東西留在桌上（只放在玩家不能坐的那一半座位前面；小安那一桌最西邊不放）
def laptop(pre, x, y, z, s, open_=True, rot=0.0):
    """筆電：s＝坐的人在哪一邊（−1：人在 −z 那一側，螢幕朝 −z）"""
    rbox(pre + '_base', MAT['silver'], (x, y + 0.008, z), (0.32, 0.016, 0.22), L1, rot=(0, rot, 0), bevel=0.004)
    if open_:
        hz = z - s * 0.11; a = 1.85   # 螢幕往後仰（從桌面量 105°）
        cy, cz = y + 0.016 + 0.105 * math.sin(a), hz + s * 0.105 * math.cos(a)
        rbox(pre + '_lid', MAT['silver'], (x, cy, cz), (0.32, 0.21, 0.006), L1, rot=(-s * (a - math.pi / 2), rot, 0), bevel=0.003)
        rbox(pre + '_scr', MAT['screen'], (x, cy, cz + s * 0.0035 * math.sin(a)), (0.29, 0.18, 0.002), L1, rot=(-s * (a - math.pi / 2), rot, 0))
def bookstack(pre, x, y, z, cols, rot=0.0):
    yy = y
    for k, m in enumerate(cols):
        th = 0.025 + 0.012 * (k % 2); rbox(f'{pre}_{k}', MAT[m], (x + 0.006 * k, yy + th / 2, z - 0.005 * k), (0.2 - 0.008 * k, th, 0.27 - 0.01 * k), L1, rot=(0, rot + 0.07 * (k - 1), 0)); yy += th
def openbook(pre, x, y, z, rot=0.0, cover='book0', notes=True):
    rbox(pre + '_cover', MAT[cover], (x, y + 0.003, z), (0.36, 0.006, 0.25), L1, rot=(0, rot, 0))
    for k, sg in enumerate((-1, 1)):
        ox, oz = _rot2(sg * 0.087, 0.0, rot)
        rbox(f'{pre}_pages_{k}', MAT['paper2'], (x + ox, y + 0.012, z + oz), (0.17, 0.014, 0.23), L1, rot=(0, rot, sg * 0.05))
    if notes:
        for k, (dx, dz, m) in enumerate(((0.05, -0.08, 'yellow'), (0.12, -0.05, 'pink'), (-0.13, 0.09, 'yellow'))):
            ox, oz = _rot2(dx, dz, rot); rbox(f'{pre}_note_{k}', MAT[m], (x + ox, y + 0.021, z + oz), (0.05, 0.002, 0.05), L1, rot=(0, rot + 0.2 * k, 0))
def bottle(pre, x, y, z, m='silver', h=0.22):
    cyl(pre + '_body', MAT[m], (x, y, z), (x, y + h, z), 0.035, L1, seg=12)
    cyl(pre + '_cap', MAT['black'], (x, y + h, z), (x, y + h + 0.035, z), 0.03, L1, seg=12)
def pencilcase(pre, x, y, z, m, rot=0.0):
    rbox(pre, MAT[m], (x, y + 0.03, z), (0.2, 0.06, 0.07), L1, rot=(0, rot, 0), bevel=0.025, seg=2)
def phone(pre, x, y, z, rot=0.0):
    rbox(pre, MAT['black'], (x, y + 0.005, z), (0.075, 0.009, 0.155), L1, rot=(0, rot, 0), bevel=0.004)
def hilite(pre, x, y, z, m, rot=0.0):
    a = _rot2(0.07, 0.0, rot); cyl(pre, MAT[m], (x - a[0], y + 0.008, z - a[1]), (x + a[0], y + 0.008, z + a[1]), 0.008, L1, seg=6)
_tables = [f for f in L['furniture'] if f['type'] == 'studyTable']
def seat_at(f, i, s):
    """第 i 個座位（0 在西邊）、s 那一側（−1：−z）前面的桌面中心"""
    n = f.get('seats', 4); return f['x'] - f['w'] / 2 + f['w'] * (i + 0.5) / n, f['z'] + s * 0.24
_TY = Y1 + 0.77
STUFF = [   # (第幾張長桌, 第幾個座位, 哪一側)：都是玩家不能坐的那一半（library3d.js：(i＋(s>0?1:0)) 是奇數的不能坐）
    (0, 1, -1, 'laptop_bottle'), (0, 2, 1, 'books_open'),
    (1, 3, -1, 'open_case'), (1, 0, 1, 'closed_phone'),
    (2, 2, 1, 'law_notes'), (2, 1, -1, 'bottle_case'),
    (3, 3, -1, 'laptop_books'), (3, 0, 1, 'books_thermos'),
]
for ti, i, s, kind in STUFF:
    f = _tables[ti]; x, z = seat_at(f, i, s); pre = f'L1_desk{ti}_{i}{"n" if s < 0 else "s"}'
    if kind == 'laptop_bottle': laptop(pre + '_lt', x - 0.03, _TY, z, s); bottle(pre + '_bt', x + 0.24, _TY, z + s * 0.05, 'teal'); phone(pre + '_ph', x - 0.25, _TY, z - s * 0.02, 0.3)
    elif kind == 'books_open': openbook(pre + '_ob', x, _TY, z - s * 0.02, 0.05, 'book3'); bookstack(pre + '_bs', x + 0.3, _TY, z + s * 0.02, ['book7', 'book1']); hilite(pre + '_hl', x - 0.2, _TY + 0.0, z - s * 0.05, 'yellow', 0.6)
    elif kind == 'open_case': openbook(pre + '_ob', x - 0.04, _TY, z, -0.08, 'book5'); pencilcase(pre + '_pc', x + 0.26, _TY, z + s * 0.04, 'navy', 0.2)
    elif kind == 'closed_phone': laptop(pre + '_lt', x, _TY, z + s * 0.01, s, open_=False, rot=0.1); phone(pre + '_ph', x + 0.25, _TY, z, -0.2)
    elif kind == 'law_notes': bookstack(pre + '_bs', x - 0.2, _TY, z, ['book8', 'book8', 'book0']); openbook(pre + '_ob', x + 0.14, _TY, z - s * 0.02, 0.12, 'book6'); hilite(pre + '_hl', x + 0.36, _TY, z, 'pink', -0.4)
    elif kind == 'bottle_case': bottle(pre + '_bt', x + 0.15, _TY, z, 'pink', 0.2); pencilcase(pre + '_pc', x - 0.12, _TY, z, 'green', -0.15)
    elif kind == 'laptop_books': laptop(pre + '_lt', x + 0.05, _TY, z, s, rot=-0.08); bookstack(pre + '_bs', x - 0.3, _TY, z, ['book2', 'book4'])
    elif kind == 'books_thermos': bookstack(pre + '_bs', x - 0.05, _TY, z, ['book9', 'book3', 'book5']); bottle(pre + '_bt', x + 0.26, _TY, z - s * 0.03, 'silver', 0.24)

# 消防：內嵌的消防栓箱（門板只凸出 3 cm）、滅火器（地上，layout 的 prop）、出口燈、緊急照明——不擋路
def hydrant(pre, x, y0, zw, s, P):
    """消防栓箱（北牆，s＝往室內的方向）：紅色門板、兩扇門的縫、白色名牌（沒有字），上面紅色警示燈、警鈴"""
    rbox(pre + '_box', MAT['red'], (x, y0 + 0.95, zw + s * 0.015), (0.75, 1.2, 0.03), P, bevel=0.006)
    rbox(pre + '_seam', MAT['black'], (x, y0 + 0.95, zw + s * 0.031), (0.006, 1.12, 0.002), P)
    rbox(pre + '_plate', MAT['white'], (x, y0 + 1.36, zw + s * 0.031), (0.34, 0.09, 0.002), P)
    cyl(pre + '_lamp', MAT['red'], (x - 0.16, y0 + 1.72, zw), (x - 0.16, y0 + 1.72, zw + s * 0.05), 0.05, P, seg=12)
    cyl(pre + '_bell', MAT['red'], (x + 0.16, y0 + 1.72, zw), (x + 0.16, y0 + 1.72, zw + s * 0.04), 0.075, P, seg=14)
_ZN = -D / 2 + T / 2   # 北牆室內那一面
hydrant('L0_hyd', 7.4, 0.0, _ZN, 1, L0); hydrant('L1_hyd', -9.6, Y1, _ZN, 1, L1)
def emlight(pre, x, y, zw, s, P):
    """緊急照明燈：白色燈箱、兩個圓燈頭（平常不亮）"""
    rbox(pre + '_box', MAT['white'], (x, y, zw + s * 0.04), (0.34, 0.1, 0.08), P, bevel=0.01)
    for k, dx in enumerate((-0.1, 0.1)): cyl(f'{pre}_head_{k}', MAT['white'], (x + dx, y - 0.04, zw + s * 0.06), (x + dx, y - 0.1, zw + s * 0.1), 0.032, P, seg=10)
emlight('L0_em_n', 9.6, 3.2, _ZN, 1, L0); emlight('L1_em_n', -6.2, Y1 + 3.0, _ZN, 1, L1)
def exitsign(pre, x, y, z, nrm, P, props=None):
    """出口標示燈（綠色燈箱＋發光面；發光面不烘、一直亮）：nrm＝朝向（'+z'、'-z'、'+x'、'-x'）"""
    sg = 1 if nrm[0] == '+' else -1
    if nrm[1] == 'z':
        box(pre + '_box', MAT['exitg'], x - 0.2, x + 0.2, y - 0.09, y + 0.09, z, z + sg * 0.07, P, props=props)
        box(pre + '_glow', MAT['exitglow'], x - 0.17, x + 0.17, y - 0.07, y + 0.07, z + sg * 0.07, z + sg * 0.075, P, props=props)
    else:
        box(pre + '_box', MAT['exitg'], x, x + sg * 0.07, y - 0.09, y + 0.09, z - 0.2, z + 0.2, P, props=props)
        box(pre + '_glow', MAT['exitglow'], x + sg * 0.07, x + sg * 0.075, y - 0.07, y + 0.07, z - 0.17, z + 0.17, P, props=props)
exitsign('L0_exit_main', EX, 2.8, D / 2 - 0.15, '-z', L0, props=FS)                                                       # 大門上面（跟著玻璃帷幕的框淡出）
if B1D: exitsign('L0_exit_b1', -W / 2 + T / 2, 3.25, B1D['z'], '+x', L0, props={'fadegrp': 'Wdoor', 'fadedir': [1, 0, 0]})   # 往 B1 的樓梯間門上面（遊戲畫的指標在 2.52～3.04 m，出口燈放在它上面）
exitsign('L1_exit_stair', W / 2 - T / 2, Y1 + 2.88, SDR['z'], '-x', L1, props={'fadegrp': 'Edoor', 'fadedir': [-1, 0, 0]})       # 二樓往 3F 的樓梯間門上面

# 晚上的燈（LIB-HALL-LM-1028）：中庭四根柱子二樓那一段的黃銅壁燈（往上打，照亮屋頂和天窗那一圈）、大樓梯平台北牆窗戶兩邊的壁燈、連廊樓板底下的崁燈
# 原本中庭（門廳到大樓梯）晚上只有兩翼的燈漏過來；吊燈會擋住二樓連廊上的跟隨鏡頭，所以用壁燈和崁燈
for k, (x, z) in enumerate(((-CO['x1'], U['band']['z1']), (CO['x1'], U['band']['z1']), (-CO['x1'], GT['z']), (CO['x1'], GT['z']))):
    sx = 1 if x < 0 else -1   # 往中庭那一邊
    cyl(f'L1_sconce_arm_{k}', MAT['brass'], (x + sx * 0.24, Y1 + 2.3, z), (x + sx * 0.4, Y1 + 2.3, z), 0.015, L1, seg=8)
    cyl(f'L1_sconce_cup_{k}', MAT['brass'], (x + sx * 0.45, Y1 + 2.2, z), (x + sx * 0.45, Y1 + 2.42, z), 0.07, L1, seg=14, r2=0.13)
    cyl(f'L1_sconce_glow_{k}', MAT['lampglow'], (x + sx * 0.45, Y1 + 2.42, z), (x + sx * 0.45, Y1 + 2.425, z), 0.12, L1, seg=14)
for k, x in enumerate((NW[0] - 0.15, NW[1] + 0.15)):   # 平台北牆、大窗兩邊（窗框和兩側核心牆中間 30 cm 寬的那一條牆）
    zw = -D / 2 + T / 2
    rbox(f'L0_landlamp_WALL_back_{k}', MAT['brass'], (x, LD['y'] + 2.0, zw + 0.01), (0.12, 0.28, 0.02), L0, props={'dir': [0, 0, 1]})
    cyl(f'L0_landlamp_WALL_cup_{k}', MAT['brass'], (x, LD['y'] + 1.9, zw + 0.13), (x, LD['y'] + 2.12, zw + 0.13), 0.055, L0, seg=14, r2=0.1, props={'dir': [0, 0, 1]})
    cyl(f'L0_landlamp_WALL_glow_{k}', MAT['lampglow'], (x, LD['y'] + 2.12, zw + 0.13), (x, LD['y'] + 2.125, zw + 0.13), 0.09, L0, seg=14, props={'dir': [0, 0, 1]})
    cyl(f'L0_landlamp_WALL_arm_{k}', MAT['brass'], (x, LD['y'] + 2.0, zw + 0.02), (x, LD['y'] + 2.0, zw + 0.11), 0.012, L0, seg=8, props={'dir': [0, 0, 1]})
for i in range(4):   # 連廊樓板底下（一樓大廳、閘門到大樓梯中間）的崁燈
    x = -3.6 + i * 2.4; zc = (U['band']['z0'] + U['band']['z1']) / 2; yb = Y1 - ST - 0.005
    quad(f'L0_banddown_{i}', MAT['light'], [(x - 0.14, yb, zc - 0.14), (x + 0.14, yb, zc - 0.14), (x + 0.14, yb, zc + 0.14), (x - 0.14, yb, zc + 0.14)], L0)

# 樓層簡介的框（字是遊戲的 canvas）
box('L0_board_frame', MAT['frame'], -3.2 - 0.95, -3.2 + 0.95, 1.6 - 0.5, 1.6 + 0.5, -0.56, -0.5, L0)

# ---------------- 同一層、同材質的物件合併（減少 draw call；外牆不合併：要各自淡出）----------------
def flatten(level_root):
    """家具群組（有旋轉的空物件）底下的物件套用變換後搬到樓層根節點，才能合併"""
    for g in [o for o in level_root.children if o.type == 'EMPTY']:
        for ch in list(g.children):
            mw = ch.matrix_world.copy(); ch.parent = level_root; ch.matrix_world = mw
            if ch.type == 'MESH':
                ch.data.transform(ch.matrix_basis); ch.matrix_basis.identity()
        bpy.data.objects.remove(g)
    for ch in level_root.children:
        if ch.type == 'MESH' and (ch.location.length > 1e-6 or any(abs(v) > 1e-6 for v in ch.rotation_euler)):
            ch.data.transform(ch.matrix_basis); ch.matrix_basis.identity()

def join_by_material(level_root, prefix):
    """同一層、同材質的物件合成一個網格；光照烘焙的 lm（光照貼圖分多少）、lmhide（哪幾個方向的面看不到）不同的分開合，合完照樣帶著（LIB-HALL-LM-1028，同 dorm_hall.py）"""
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH': continue
        lm = ob.get('lm'); lh = ob.get('lmhide'); lh = None if lh is None else str(lh)
        if 'WALL_' in ob.name:   # 同一面牆（同方向、同材質）的牆段合併成一個（還是叫 WALL_、帶 dir：一起淡出），減少 draw call
            dv = ob.get('dir'); dv = list(dv) if dv is not None else [0, 0, 1]
            groups.setdefault(('wall' + ''.join('%+d' % round(v) for v in dv), ob.data.materials[0].name, lm, lh), []).append(ob); ob['fadedir'] = dv; continue
        groups.setdefault((ob.get('fadegrp'), ob.data.materials[0].name, lm, lh), []).append(ob)
    for (fg, mname, lm, lh), obs in groups.items():
        if len(obs) < 2 and not fg: continue
        dirv = list(obs[0]['fadedir']) if fg else None
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        pr = dict({'dir': dirv} if fg else {}, **({'lm': lm} if lm is not None else {}), **({'lmhide': lh} if lh is not None else {}))
        nm = (f'{prefix}_WALL_{fg}_{mname}' if fg else f'{prefix}_{mname}') + (f'_lm{lm:g}' if lm is not None else '') + (f'_h{lh.replace(",", "")}' if lh is not None else '')
        mesh_obj(nm, bm, mat, level_root, props=pr or None)
bpy.context.view_layer.update()   # 家具群組的旋轉要先算進 matrix_world
# 純色的小東西合成一個頂點色材質（LIB-HALL-LM-1028，和霖澤館大廳 LOBBY-VC-1028、男一舍門廳一樣）：書（十種顏色）、雜誌、新的擺設——每個材質各畫一次，合成以後一次
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'env_second'))
import lib2 as L2   # noqa: E402
_VC = L2.vc_material('lb_vc', rough=0.7)
L2.vc_consolidate(root, {MAT[k].name: _VC for k in ['paper', 'red', 'white', 'blue', 'yellow', 'green', 'navy', 'rubber', 'black', 'exitg', 'paper2', 'paper3', 'cork', 'silver', 'teal', 'pink', 'cream'] + [f'book{i}' for i in range(len(BOOKC))]})
for r, pre in ((L0, 'L0'), (L1, 'L1')): flatten(r); join_by_material(r, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        sm = ob.data.materials[0].name.startswith('lb_leaf_')   # 模型葉子用平滑著色（看起來是彎的葉面，匯出的頂點也少一半以上）；其他維持平面著色
        for p in ob.data.polygons: p.use_smooth = sm
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。
# 封閉的殼直接單面；開口的零件（牆面、葉片卡、薄板）補反面，看起來和原本一樣；玻璃照舊雙面；遊戲照名字接手的板面（*_FACE_*）不動網格
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'env_second'))
import lib2 as L2   # noqa: E402
_ss = {}
for _r in [o for o in scene.objects if o.parent is None]:
    for _k, _v in L2.single_side(_r, keep=r'glass', skip=lambda ob: 'FACE' in ob.name).items(): _s = _ss.setdefault(_k, [0, 0]); _s[0] += _v[0]; _s[1] += _v[1]
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in scene.objects if ob.type == 'MESH')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='WEBP', export_image_quality=82, export_yup=True, export_apply=True,
                          export_extras=True, export_materials='EXPORT', export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False)
print(json.dumps({'out': os.path.relpath(OUT, ROOT), 'bytes': os.path.getsize(OUT), 'objects': sum(1 for o in scene.objects if o.type == 'MESH'), 'tris': tris, 'materials': len(bpy.data.materials), 'texres': TEXRES}, ensure_ascii=False))

# ---------------- 渲染預覽（Blender 的模型渲染圖，給驗收報告用）----------------
if RENDER:
    os.makedirs(RENDER, exist_ok=True)
    scene.render.engine = 'BLENDER_EEVEE'; scene.render.resolution_x, scene.render.resolution_y = 1280, 800
    try: scene.eevee.taa_render_samples = 16
    except Exception: pass
    scene.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True; world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.8, 0.86, 1); world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); scene.collection.objects.link(sun); sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(20))
    for (x, y, z, e) in ((0, 8.6, 4.6, 1800), (0, 6.6, -4.0, 900), (-8.6, 8.6, 0, 900), (8.6, 8.6, 0, 900), (-8.6, 3.8, 0, 500), (8.6, 3.8, 0, 500)):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.location = g2b(x, y, z); scene.collection.objects.link(lt)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam; cam.data.lens = 18
    VW = (('hall_from_entrance', (0.0, 1.7, 8.0), (0.0, 3.6, -6.0)), ('stair_from_lobby', (4.6, 2.2, 3.6), (-1.0, 3.2, -6.0)),
          ('study_2f', (-4.6, 6.7, 5.6), (-10.0, 5.4, -4.0)), ('atrium_from_2f', (8.6, 6.8, 7.4), (-2.0, 2.0, -3.0)))
    for name, eye, look in VW:
        if VIEWS and name not in VIEWS.split(','): continue
        cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(RENDER, f'blender_library_{name}.png'); bpy.ops.render.render(write_still=True); print('render', scene.render.filepath)
