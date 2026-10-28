"""男生宿舍 室內（宿舍走廊，D44）正式模型：Blender 5.2 bpy 無介面執行 → GLB（WebP 貼圖）。
一樓：門廳（舍監室窗口、信箱、玻璃大門）、交誼廳（沙發、電視、自動販賣機、飲水機、長桌）、東西向的走廊（寢室的門、洗衣間、舍監室、側門）；
雙跑樓梯（A 跑往北上到平台、B 跑往南回到二樓；兩跑中間一道實心牆、牆上扶手、二樓 A 跑上方的欄杆）；二樓走廊（寢室的門、盥洗室、飲水機、長椅、自己的房門 203 前的鞋架）。
配置讀 src/data/dorm_layout.js（遊戲的導航、互動點讀同一份，兩邊一定對得上）。貼圖：Poly Haven CC0（tools/blender/textures/、tools/blender/env_second/textures/）。
節點命名約定和霖澤館、萬才館、總圖一樣（src/building3d.js 的 attachFormal）：
  L0_*：一樓；L1_*：二樓（玩家在一樓、鏡頭低於二樓地板時藏起來）；名字含 WALL_ 的是外牆（擋住鏡頭時淡出），自訂屬性 dir＝往室內的法線（遊戲座標）。
  走廊兩側的牆不叫 WALL_（不淡出）：鏡頭碰撞由遊戲的 src/dorm3d.js 加，鏡頭留在走廊裡。
  不做：門牌、指標的字（遊戲用 canvas 畫，中文字型）、窗外的景、點地面用的透明地板。
台灣宿舍常見的樣子：磨石子地、白牆＋淺灰綠的油漆腰牆、淺灰綠的鐵門、日光燈、樓梯踏面前緣的黑色止滑條、灰色鐵欄杆。
真實性：室內沒有照片或平面圖，是遊戲化設計（D44）。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)（glTF 匯出 +Y up 會轉回去）。
用法：/opt/blenv/bin/python tools/blender/dorm_hall.py [--out assets/models/env/dorm_hall.glb] [--tex 512] [--render 輸出資料夾] [--views a,b]
"""
import bpy, bmesh, json, math, os, re, sys, random
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEX = os.path.join(ROOT, 'tools', 'blender', 'textures')
TEX2 = os.path.join(ROOT, 'tools', 'blender', 'env_second', 'textures')   # 第二個 AI 下載的 Poly Haven CC0（只讀使用）：磨石子
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/dorm_hall.glb'))
TEXRES = int(arg('--tex', '512'))
RENDER = arg('--render')
VIEWS = arg('--views')

src = open(os.path.join(ROOT, 'src/data/dorm_layout.js'), encoding='utf8').read()
L = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, Y1, RY, T, ST = L['W'], L['D'], L['floors'][1]['y'], L['roofY'], L['wallT'], L['slabT']
S, CO, LB, LG = L['stair'], L['corridor'], L['lobby'], L['lounge']
A, B, LD, MW, WL = S['A'], S['B'], S['landing'], S['midWall'], S['well']
R = Y1 / (A['risers'] + B['risers']); TR = S['tread']
H0 = Y1 - ST                     # 一樓淨高（樓板底面）

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import b3lib as B3
import plants as PL
B3._S['texres'] = TEXRES; B3._S['imgs'] = {}

def g2b(x, y, z): return Vector((x, -z, y))

# ---------------- 材質 ----------------
_imgs = {}
def img(path):
    if path not in _imgs:
        im = bpy.data.images.load(path)
        if TEXRES and max(im.size) > TEXRES: im.scale(TEXRES, TEXRES)
        _imgs[path] = im
    return _imgs[path]

def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8, target=None, sat=1.0, base_dir=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = min(metal, B3.MAX_METAL)
    m['tile'] = tile
    if pid:
        base = os.path.join(base_dir or TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = B3.img_adj(base + '_diff_1k.jpg', sat, 1.0, target) if target else img(base + '_diff_1k.jpg')
        Lk.new(tc.outputs['Color'], bsdf.inputs['Base Color'])
        if os.path.exists(base + '_rough_1k.jpg'):
            tr = N.new('ShaderNodeTexImage'); tr.image = img(base + '_rough_1k.jpg'); tr.image.colorspace_settings.name = 'Non-Color'
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
    'floor':   pbr('dm_terrazzo', 'terrazzo_tiles', tile=1.4, sat=0.35, target='#c9c4b8', base_dir=TEX2),   # 磨石子（比總圖灰一點）
    'stair':   pbr('dm_stair', 'granite_tile_03', tile=0.9, sat=0.3, target='#b3ada3'),                     # 樓梯踏面、平台
    'plaster': pbr('dm_plaster', 'painted_plaster_wall', tile=2.5, target='#eeebe3'),
    'dado':    pbr('dm_dado', 'painted_plaster_wall', tile=2.5, sat=0.6, target='#a6b5aa', normal=0.4),       # 淺灰綠的油漆腰牆
    'ceiling': pbr('dm_ceiling', 'ceiling_interior', tile=2.0, sat=0.2, target='#efeeea', normal=0.3),
    'wood':    pbr('dm_wood', 'fine_grained_wood', tile=1.6, target='#a77d57'),                              # 長桌、椅子、公告欄框
    'door':    pbr('dm_door', None, tint=srgb('#b9c1b2'), rough=0.45, metal=0.2),                            # 淺灰綠的鐵門
    'frame':   pbr('dm_frame', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35),
    'steel':   pbr('dm_steel', None, tint=srgb('#8a9096'), rough=0.38, metal=0.4),                           # 欄杆、扶手（灰色烤漆）
    'nosing':  pbr('dm_nosing', None, tint=srgb('#2c2c2c'), rough=0.85),                                     # 止滑條
    'glass':   pbr('dm_glass', None, tint=srgb('#c4d6dc'), rough=0.05, alpha=0.22),
    'tube':    pbr('dm_tube', None, tint=srgb('#fff7ea'), rough=0.9, emit=srgb('#fff4e0')),                  # 日光燈管
    'fixture': pbr('dm_fixture', None, tint=srgb('#e6e6e2'), rough=0.5),
    'locker':  pbr('dm_locker', None, tint=srgb('#8e959b'), rough=0.4, metal=0.3),
    'cork':    pbr('dm_cork', None, tint=srgb('#b98e5a'), rough=0.95),
    'paper':   pbr('dm_paper', None, tint=srgb('#ece6d8'), rough=0.9),
    'paper2':  pbr('dm_paper2', None, tint=srgb('#f3d9a0'), rough=0.9),
    'paper3':  pbr('dm_paper3', None, tint=srgb('#cfe3ea'), rough=0.9),
    'fabric':  pbr('dm_fabric', 'fabric_leather_02', tile=0.8, sat=0.55, target='#5b4434'),                 # 交誼廳的沙發（深咖啡色人造皮，ART-DORM-LOUNGE-1021）
    'black':   pbr('dm_black', None, tint=srgb('#1d1f22'), rough=0.3),
    'screen':  pbr('dm_screen', None, tint=srgb('#1a2430'), rough=0.2, emit=srgb('#24323f')),
    'vend':    pbr('dm_vend', None, tint=srgb('#d4d8dc'), rough=0.35, metal=0.25),
    'red':     pbr('dm_red', None, tint=srgb('#b8302a'), rough=0.5),
    'blue':    pbr('dm_blue', None, tint=srgb('#2e6fb0'), rough=0.5),
    'yellow':  pbr('dm_yellow', None, tint=srgb('#e8b923'), rough=0.5),
    'green':   pbr('dm_green', None, tint=srgb('#2f8a4e'), rough=0.5),
    'white':   pbr('dm_white', None, tint=srgb('#e9e7e2'), rough=0.5),
    'rubber':  pbr('dm_rubber', None, tint=srgb('#3a3f46'), rough=0.8),
}
MAT['ceiling'].use_backface_culling = True   # 天花板單面（四邊形本來就朝下）：鏡頭拉遠到天花板上面時看得穿（ART-CEIL-LAWWW-ROOMS-1022，LAWWW2 10-22）
def imgmat(name, fn, rough=0.8, emit=0.0):
    """本作畫的圖（tools/blender/env_second/textures/gen/）：交誼廳的公告、時鐘、標籤、地毯（dorm_lounge_tex.py）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bsdf = N['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = rough; m['tile'] = 1.0
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(TEX2, 'gen', fn), check_existing=True)
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    if emit:
        nt.links.new(tx.outputs['Color'], bsdf.inputs['Emission Color']); bsdf.inputs['Emission Strength'].default_value = emit
    return m
MAT.update({   # 交誼廳（ART-DORM-LOUNGE-1021）：新加四個材質＝一樓多四個 draw call
    'atlas':   imgmat('dm_lounge_atlas', 'dorm_lounge_atlas.png', rough=0.85),              # 公告、時鐘、請自備杯子、回收桶標籤、地毯
    'vendlit': imgmat('dm_vend_panel', 'dorm_vend_panel.png', rough=0.3, emit=0.55),          # 自動販賣機亮著的展示窗
    'curtain': pbr('dm_curtain', 'rough_linen', tile=1.2, sat=0.5, target='#c7cdb2', base_dir=TEX2, normal=0.5),   # 窗簾（淺灰綠麻布）
    'shell':   pbr('dm_shell', None, tint=srgb('#7d8a96'), rough=0.55),                     # 長桌的塑膠椅（椅面、椅背）
    'rug':     pbr('dm_rug', 'dirty_carpet', tile=0.9, sat=0.45, target='#4b5361', base_dir=TEX2, normal=0.6),   # 沙發區的地毯（深灰藍；滾邊用 paper）
})
ATL = json.load(open(os.path.join(TEX2, 'gen', 'dorm_lounge_atlas.json'), encoding='utf8'))   # 圖集各區的 UV（u0, v0, u1, v1）
PM = PL.materials('dm_')

# ---------------- 幾何小工具（和總圖、萬才館室內同一套）----------------
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

def slab_tilted(name, mat, x0, x1, za, ya, zb, yb, th, parent):
    """沿 z 的斜板（樓梯板）：上表面從 (za,ya) 到 (zb,yb)，厚 th（往下）"""
    bm = bmesh.new()
    pts = [(x0, ya, za), (x1, ya, za), (x1, yb, zb), (x0, yb, zb)]
    top = [bm.verts.new(g2b(*p)) for p in pts]; bot = [bm.verts.new(g2b(p[0], p[1] - th, p[2])) for p in pts]
    bm.faces.new(top); bm.faces.new(list(reversed(bot)))
    for i in range(4): bm.faces.new([top[i], top[(i + 1) % 4], bot[(i + 1) % 4], bot[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.normal_update(); box_uv(bm, mat.get('tile', 1.0))
    return mesh_obj(name, bm, mat, parent)

def group(name, parent=None, props=None):
    ob = bpy.data.objects.new(name, None); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob

def _toB(rot):
    """遊戲座標的旋轉（繞 x、y、z，依序）→ Blender 座標的旋轉矩陣"""
    Pm = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
    Rg = Matrix.Rotation(rot[2], 3, 'Z') @ Matrix.Rotation(rot[1], 3, 'Y') @ Matrix.Rotation(rot[0], 3, 'X')
    return Pm @ Rg @ Pm.transposed()

def rbox(name, mat, c, sz, parent=None, rot=(0.0, 0.0, 0.0), bevel=0.0, seg=1, props=None):
    """中心 c、大小 sz（遊戲座標 x、y、z）、可以轉的圓角方塊（沙發坐墊、靠墊、扶手）"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, verts=bm.verts, vec=(sz[0], sz[2], sz[1]))
    if bevel > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(bevel, min(sz) * 0.45), segments=seg, affect='EDGES')
    bmesh.ops.transform(bm, verts=bm.verts, matrix=_toB(rot).to_4x4(), space=Matrix.Identity(4))
    bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(*c)); bm.normal_update(); box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def tquad(name, mat, uvr, pts, parent=None):
    """四邊形＋指定的 UV 範圍 uvr＝(u0, v0, u1, v1)；pts＝左下、右下、右上、左上（從正面看）"""
    u0, v0, u1, v1 = uvr
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in pts]; fc = bm.faces.new(vs); uv = bm.loops.layers.uv.verify()
    for lp, (u, v) in zip(fc.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uv].uv = (u, v)
    bm.normal_update(); return mesh_obj(name, bm, mat, parent)

_RIGHT = {'-z': (-1, 0, 0), '+z': (1, 0, 0), '-x': (0, 0, 1), '+x': (0, 0, -1)}   # 面向 facing 的東西，從正面看的「右邊」
def wquad(name, region, c, w, h, facing, parent=None, mat=None, uvr=None):
    """貼在牆上的圖（圖集的一區）：中心 c、寬 w、高 h、面向 facing（'-z'＝朝北…）"""
    R = _RIGHT[facing]; x, y, z = c
    pts = [(x - R[0] * w / 2, y - h / 2, z - R[2] * w / 2), (x + R[0] * w / 2, y - h / 2, z + R[2] * w / 2),
           (x + R[0] * w / 2, y + h / 2, z + R[2] * w / 2), (x - R[0] * w / 2, y + h / 2, z - R[2] * w / 2)]
    return tquad(name, mat or MAT['atlas'], uvr or ATL[region], pts, parent)

SMOOTH_MATS = ('dm_fabric', 'dm_shell', 'dm_curtain')   # 匯出時平滑（照角度分開硬邊）：沙發、塑膠椅、窗簾

root = group('DormHall')
L0 = group('L0_root', root); L1 = group('L1_root', root)

# ---------------- 有開口的牆：沿 x（z 固定）或沿 z（x 固定），開口＝[(a,b,ya,yb)]；外牆叫 WALL_（淡出），走廊的牆不叫 ----------------
_wk = [0]
def wall_cut(prefix, parent, axis, at, a0, a1, y0, y1, holes, mat, dirv=None, th=None, lmh=None):
    """lmh：看不到的面（bake_room.py 的 lmhide；例 'N,up'＝牆背面朝北：後面是沒做模型的寢室；牆頂在天花板上面）——光照貼圖不分像素（DORM-HALL-LM-1028）。
    每一段的頂面、底面、兩端（和下一段、門上那一段、轉角的牆接在一起的面）也一律不分像素：這些面夾在兩段牆中間，烘出來是黑的；
    牆段的正面在接縫處只有一邊有頂點（T 形接頭），遊戲裡畫的時候接縫會露出一點一點的縫，看到後面黑的端面——第一次正式烘焙時門框上方一條一條的點狀黑線。
    不分像素的面取同一個物件最大那一面中間的光（bake_room.py），露出來也是牆的顏色；門洞、窗洞的側面也一起用這個值（12～20 cm 寬，看不出來）"""
    th = th or T; holes = sorted(holes); cur = a0
    toks = [t for t in (lmh or '').split(',') if t]
    for t in ('up', 'down') + (('E', 'W') if axis == 'x' else ('N', 'S')):
        if t not in toks: toks.append(t)
    lmh = ','.join(toks)
    def piece(pa, pb, ya, yb):
        if pb - pa < 0.01 or yb - ya < 0.01: return
        _wk[0] += 1; nm = f'{prefix}_{"WALL_" if dirv else "iw_"}{_wk[0]}'; pr = dict({'dir': dirv} if dirv else {}, **({'lmhide': lmh} if lmh else {})) or None
        if axis == 'z': box(nm, mat, at - th / 2, at + th / 2, ya, yb, pa, pb, parent, props=pr)
        else: box(nm, mat, pa, pb, ya, yb, at - th / 2, at + th / 2, parent, props=pr)
    for (ha, hb, hy0, hy1) in holes:
        if hb <= a0 or ha >= a1: continue
        piece(cur, ha, y0, y1); piece(ha, hb, y0, min(y1, max(y0, hy0))); piece(ha, hb, max(y0, min(y1, hy1)), y1); cur = hb   # 開口在這一段的上面或下面：整段照畫，不超出 y0～y1（原本會長出這一段以外的牆，和另一段疊在一起閃：樓梯井北牆的腰牆疊到白牆，BUG-COPLANAR-DEV）
    piece(cur, a1, y0, y1)

def dado_wall(prefix, parent, axis, at, a0, a1, y0, h, holes, dirv=None, lmh=None):
    """一道牆：下面 1.1 m 淺灰綠油漆腰牆、上面白牆（兩段各自挖洞）"""
    wall_cut(prefix + '_lo', parent, axis, at, a0, a1, y0, y0 + 1.1, holes, MAT['dado'], dirv, lmh=lmh)
    wall_cut(prefix + '_hi', parent, axis, at, a0, a1, y0 + 1.1, y0 + h, holes, MAT['plaster'], dirv, lmh=lmh)

DOOR_W, DOOR_H = 0.9, 2.1
def door_holes(lv, side, y0):
    return [(d['x'] - DOOR_W / 2 - 0.05, d['x'] + DOOR_W / 2 + 0.05, y0, y0 + DOOR_H + 0.05) for d in L['doors'] if d['lv'] == lv and d['side'] == side] + \
           ([(L['home']['x'] - DOOR_W / 2 - 0.05, L['home']['x'] + DOOR_W / 2 + 0.05, y0, y0 + DOOR_H + 0.05)] if lv == L['home']['lv'] and side == 'N' else [])

def door(prefix, parent, x, z, y0, inward, along='x'):
    """門框（深灰）＋鐵門（淺灰綠，門板中間一道凹線）＋門把＋門牌的框（字由遊戲畫）＋門下的通風百葉"""
    o = inward * (T / 2 + 0.005)
    if along == 'x':
        for (xa, xb, ya, yb) in ((x - DOOR_W / 2 - 0.06, x - DOOR_W / 2, y0, y0 + DOOR_H + 0.06), (x + DOOR_W / 2, x + DOOR_W / 2 + 0.06, y0, y0 + DOOR_H + 0.06), (x - DOOR_W / 2 - 0.06, x + DOOR_W / 2 + 0.06, y0 + DOOR_H, y0 + DOOR_H + 0.06)):
            box(f'{prefix}_frame_{xa:.2f}_{ya:.1f}', MAT['frame'], xa, xb, ya, yb, z + o - 0.03, z + o + 0.03, parent)
        box(f'{prefix}_leaf', MAT['door'], x - DOOR_W / 2, x + DOOR_W / 2, y0, y0 + DOOR_H, z - 0.02, z + 0.02, parent)
        box(f'{prefix}_groove', MAT['frame'], x - DOOR_W / 2 + 0.12, x + DOOR_W / 2 - 0.12, y0 + 1.15, y0 + 1.17, z + o * 0.25 - 0.004, z + o * 0.25 + 0.004, parent)
        for k in range(5): box(f'{prefix}_louver_{k}', MAT['frame'], x - 0.3, x + 0.3, y0 + 0.12 + k * 0.05, y0 + 0.135 + k * 0.05, z + o * 0.25 - 0.004, z + o * 0.25 + 0.004, parent)
        hx = x + DOOR_W / 2 - 0.12; cyl(f'{prefix}_knob', MAT['steel'], (hx, y0 + 1.0, z + o * 0.25), (hx, y0 + 1.0, z + o * 4.0), 0.025, parent, seg=8)
        box(f'{prefix}_plate', MAT['frame'], x - 0.23, x + 0.23, y0 + 1.76, y0 + 1.94, z + o * 0.6 - 0.008, z + o * 0.6 + 0.008, parent)
    else:
        for (za, zb, ya, yb) in ((z - DOOR_W / 2 - 0.06, z - DOOR_W / 2, y0, y0 + DOOR_H + 0.06), (z + DOOR_W / 2, z + DOOR_W / 2 + 0.06, y0, y0 + DOOR_H + 0.06), (z - DOOR_W / 2 - 0.06, z + DOOR_W / 2 + 0.06, y0 + DOOR_H, y0 + DOOR_H + 0.06)):
            box(f'{prefix}_frame_{za:.2f}_{ya:.1f}', MAT['frame'], x + o - 0.03, x + o + 0.03, ya, yb, za, zb, parent)
        box(f'{prefix}_leaf', MAT['door'], x - 0.02, x + 0.02, y0, y0 + DOOR_H, z - DOOR_W / 2, z + DOOR_W / 2, parent)
        hz = z - DOOR_W / 2 + 0.12; cyl(f'{prefix}_knob', MAT['steel'], (x + o * 0.25, y0 + 1.0, hz), (x + o * 4.0, y0 + 1.0, hz), 0.025, parent, seg=8)

def window(prefix, parent, axis, at, a, b, ya, yb, inward):
    """鋁窗（深灰框＋中間一道直櫺）＋玻璃（玻璃不放進淡出群組：遊戲的 fadeWalls 會把整組設成不透明）＋窗台"""
    f = 0.06; o = inward * (T / 2 - 0.02)
    if axis == 'z':
        for (za, zb, y_a, y_b) in ((a, a + f, ya, yb), (b - f, b, ya, yb), (a, b, ya, ya + f), (a, b, yb - f, yb), ((a + b) / 2 - 0.03, (a + b) / 2 + 0.03, ya, yb)):
            box(f'{prefix}_win_{za:.2f}_{y_a:.1f}', MAT['frame'], at + o - 0.04, at + o + 0.04, y_a, y_b, za, zb, parent)
        box(f'{prefix}_sill', MAT['stair'], at + inward * T / 2 - (0.0 if inward > 0 else 0.12), at + inward * T / 2 + (0.12 if inward > 0 else 0.0), ya - 0.04, ya, a - 0.05, b + 0.05, parent)
        quad(f'{prefix}_glass', MAT['glass'], [(at, ya, a), (at, ya, b), (at, yb, b), (at, yb, a)], parent, tile=1.0)
    else:
        for (xa, xb, y_a, y_b) in ((a, a + f, ya, yb), (b - f, b, ya, yb), (a, b, ya, ya + f), (a, b, yb - f, yb), ((a + b) / 2 - 0.03, (a + b) / 2 + 0.03, ya, yb)):
            box(f'{prefix}_win_{xa:.2f}_{y_a:.1f}', MAT['frame'], xa, xb, y_a, y_b, at + o - 0.04, at + o + 0.04, parent)
        box(f'{prefix}_sill', MAT['stair'], a - 0.05, b + 0.05, ya - 0.04, ya, at + inward * T / 2 - (0.0 if inward > 0 else 0.12), at + inward * T / 2 + (0.12 if inward > 0 else 0.0), parent)
        quad(f'{prefix}_glass', MAT['glass'], [(a, ya, at), (b, ya, at), (b, yb, at), (a, yb, at)], parent, tile=1.0)

# ================================================================ 1. 地板、天花板、日光燈
box('L0_floor', MAT['floor'], CO['x0'], CO['x1'], -0.1, 0.0, CO['z0'], CO['z1'], L0, props={'lm': 1.3, 'lmhide': 'side,down'})   # 走廊。lm、lmhide：光照貼圖分給這一面的比例、看不到的面（DORM-HALL-LM-1028；地板的底面照名字自動不分）
box('L0_floor_s', MAT['floor'], LB['x0'] - 2.0, CO['x1'], -0.1, 0.0, CO['z1'], LB['z1'], L0, props={'lm': 1.3, 'lmhide': 'side,down'})   # 門廳、交誼廳＋舍監室窗口後面 2 m（從窗口看得到）；原本整片到西牆（舍監室、洗衣間沒做模型，看不到），佔了光照貼圖地板那一塊的四分之一
box('L1_floor', MAT['floor'], CO['x0'], CO['x1'], Y1 - ST, Y1, CO['z0'], CO['z1'], L1, props={'lm': 1.3, 'lmhide': 'side,down'})
box('L1_slab_south', MAT['plaster'], CO['x0'], CO['x1'], Y1 - ST, Y1 - 0.02, CO['z1'], LB['z1'], L1, props={'lm': 0.05})   # 一樓門廳、交誼廳上方的樓板（二樓的寢室，看不到上面；底面在一樓天花板上面，也看不到：光照貼圖幾乎不分）
HC = H0 - 0.01   # 一樓天花板比樓板底面低 1 cm：原本和二樓樓板（L1_floor、L1_slab_south）的底面同高，從一樓往上看會閃（BUG-COPLANAR-DEV，tools/glb_coplanar.py）
quad('L0_ceiling', MAT['ceiling'], [(CO['x0'], HC, CO['z0']), (CO['x1'], HC, CO['z0']), (CO['x1'], HC, LB['z1']), (CO['x0'], HC, LB['z1'])], L0, props={'lm': 0.35})   # 鏡頭在天花板下面往下看，很少看到：光照貼圖少分
quad('L1_ceiling', MAT['ceiling'], [(CO['x0'], RY, CO['z0']), (CO['x1'], RY, CO['z0']), (CO['x1'], RY, CO['z1']), (CO['x0'], RY, CO['z1'])], L1, props={'lm': 0.35})
quad('L1_ceiling_well', MAT['ceiling'], [(WL['x0'], RY, WL['z0']), (WL['x1'], RY, WL['z0']), (WL['x1'], RY, WL['z1']), (WL['x0'], RY, WL['z1'])], L1, props={'lm': 0.35})
def tube(prefix, parent, x, y, z, along='x'):
    w, d = (1.25, 0.16) if along == 'x' else (0.16, 1.25)
    # 吸頂日光燈（燈座 6 cm、燈管）：名字含 WALL_、dir 朝下——鏡頭雙指拉到最遠、往上拖到最陡、比燈高的時候和牆一樣藏起來（從上面看是浮著的白條）；
    # 從下面看照舊（形狀不變）。下面 join_by_material 會照 dir 把它們合成一組（LAWWW2 10-22 ART-CEIL-LAWWW-ROOMS-1022 第二版）
    box(f'{prefix}_WALL_ceilfix', MAT['fixture'], x - w / 2, x + w / 2, y - 0.06, y, z - d / 2, z + d / 2, parent, props={'dir': [0, -1, 0]})
    box(f'{prefix}_WALL_ceiltube', MAT['tube'], x - w / 2 + 0.05, x + w / 2 - 0.05, y - 0.085, y - 0.06, z - 0.03, z + 0.03, parent, props={'dir': [0, -1, 0]}) if along == 'x' else box(f'{prefix}_WALL_ceiltube', MAT['tube'], x - 0.03, x + 0.03, y - 0.085, y - 0.06, z - d / 2 + 0.05, z + d / 2 - 0.05, parent, props={'dir': [0, -1, 0]})
for i, x in enumerate([-12, -9, -6, -3, 0, 3, 6, 9, 12]):
    tube(f'L0_t{i}', L0, x, H0, 0.0); tube(f'L1_t{i}', L1, x, RY, 0.0)
for i, (x, z) in enumerate([(0, 4.5), (5, 3.5), (9, 4.5), (12, 3.0), (5, 6.2), (9, 6.6)]): tube(f'L0_tl{i}', L0, x, H0, z)
tube('L1_tw', L1, 0.0, RY, (WL['z0'] + WL['z1']) / 2, 'z')

# ================================================================ 2. 牆（走廊兩側＝內牆；兩端、門廳正面、樓梯間北牆＝外牆，淡出）
# 一樓
# 走廊北牆在樓梯間兩側牆、兩跑中間的牆那幾段斷開（DORM-HALL-LM-1028）：原本一路穿過去，和那三道牆的南端疊在同一個平面（z −1.4），
# 烘焙時互相擋住、牆上一條黑線，遊戲裡也會閃；現在那幾段就是那三道牆自己的端面
dado_wall('L0_N_w', L0, 'x', CO['z0'] - T / 2, CO['x0'], WL['x0'] - T, 0, H0, door_holes(0, 'N', 0), lmh='N,up')
dado_wall('L0_N_m', L0, 'x', CO['z0'] - T / 2, MW['x1'], WL['x1'], 0, H0, [], lmh='N,up')   # 兩跑中間的牆和樓梯間東牆之間（B 跑下面的儲藏室）
dado_wall('L0_N_e', L0, 'x', CO['z0'] - T / 2, WL['x1'] + T, CO['x1'], 0, H0, door_holes(0, 'N', 0), lmh='N,up')
dado_wall('L0_S_w', L0, 'x', CO['z1'] + T / 2, CO['x0'], LB['x0'], 0, H0, door_holes(0, 'S', 0), lmh='S,up')
dado_wall('L0_lobbyW', L0, 'z', LB['x0'] - T / 2, CO['z1'] + T, LB['z1'], 0, H0, [(2.4, 4.0, 1.05, 2.05)], lmh='W,up')   # 從走廊南牆後面開始（原本和南牆的西段疊在轉角）          # 門廳西牆（舍監室窗口）
dado_wall('L0_front', L0, 'x', LB['z1'] + T / 2, LB['x0'], LG['x1'], 0, H0, [(-1.0, 1.0, 0, 2.5), (7.4, 9.4, 1.0, 2.5), (10.4, 12.4, 1.0, 2.5)], dirv=[0, 0, -1])
dado_wall('L0_endW', L0, 'z', CO['x0'] - T / 2, CO['z0'], CO['z1'], 0, H0, [(-0.8, 0.8, 1.0, 2.5)], dirv=[1, 0, 0])
dado_wall('L0_endE', L0, 'z', CO['x1'] + T / 2, CO['z0'], LB['z1'], 0, H0, [(-0.5, 0.5, 0, DOOR_H + 0.05)], dirv=[-1, 0, 0])
# 樓梯間：東西兩側的牆（到屋頂）、北牆（平台的窗；外牆）
# 二樓那段停在二樓走廊北牆的背面（原本一路到 z −1.4，和二樓走廊北牆的牆頭疊在一起：上樓梯時看得到一條白牆、灰綠腰牆交替閃，BUG-COPLANAR-DEV）
for nm, x in (('wellW', WL['x0'] - T / 2), ('wellE', WL['x1'] + T / 2)):
    bk = 'W,up' if nm == 'wellW' else 'E,up'   # 樓梯間兩側牆的外面是寢室；牆頂在屋頂下面看不到
    dado_wall('L0_' + nm, L0, 'z', x, WL['z0'], WL['z1'], 0, Y1, [], lmh=bk)
    wall_cut('L0_' + nm + '_up', L0, 'z', x, WL['z0'], CO['z0'] - T, Y1, RY, [], MAT['plaster'], lmh=bk)
dado_wall('L0_wellN', L0, 'x', WL['z0'] - T / 2, WL['x0'] - T, WL['x1'] + T, 0, RY, [(-0.9, 0.9, LD['y'] + 0.9, LD['y'] + 2.4)], dirv=[0, 0, 1])
# 二樓
dado_wall('L1_N_w', L1, 'x', CO['z0'] - T / 2, CO['x0'], WL['x0'], Y1, RY - Y1, door_holes(1, 'N', Y1), lmh='N,up')
dado_wall('L1_N_e', L1, 'x', CO['z0'] - T / 2, WL['x1'], CO['x1'], Y1, RY - Y1, door_holes(1, 'N', Y1), lmh='N,up')
dado_wall('L1_S', L1, 'x', CO['z1'] + T / 2, CO['x0'], CO['x1'], Y1, RY - Y1, door_holes(1, 'S', Y1), lmh='S,up')
dado_wall('L1_endW', L1, 'z', CO['x0'] - T / 2, CO['z0'], CO['z1'], Y1, RY - Y1, [(-0.8, 0.8, Y1 + 1.0, Y1 + 2.5)], dirv=[1, 0, 0])
dado_wall('L1_endE', L1, 'z', CO['x1'] + T / 2, CO['z0'], CO['z1'], Y1, RY - Y1, [(-0.8, 0.8, Y1 + 1.0, Y1 + 2.5)], dirv=[-1, 0, 0])
# 二樓走廊北邊、樓梯間上方的樑（A 跑上方是欄杆）
box('L1_beam', MAT['plaster'], WL['x0'], WL['x1'], RY - 0.45, RY, CO['z0'] - T, CO['z0'], L1)

# ================================================================ 3. 窗、大門
window('L0_wW', L0, 'z', CO['x0'] - T / 2, -0.8, 0.8, 1.0, 2.5, 1)
window('L1_wW', L1, 'z', CO['x0'] - T / 2, -0.8, 0.8, Y1 + 1.0, Y1 + 2.5, 1)
window('L1_wE', L1, 'z', CO['x1'] + T / 2, -0.8, 0.8, Y1 + 1.0, Y1 + 2.5, -1)
for i, (a, b) in enumerate(((7.4, 9.4), (10.4, 12.4))): window(f'L0_wS{i}', L0, 'x', LB['z1'] + T / 2, a, b, 1.0, 2.5, -1)
window('L0_wN', L0, 'x', WL['z0'] - T / 2, -0.9, 0.9, LD['y'] + 0.9, LD['y'] + 2.4, 1)
# 大門：兩扇玻璃門（鋁框）＋上方橫窗
zf = LB['z1'] + T / 2
for (a, b) in ((-1.0, 0.0), (0.0, 1.0)):
    for (xa, xb, ya, yb) in ((a, a + 0.07, 0, 2.5), (b - 0.07, b, 0, 2.5), (a, b, 0, 0.12), (a, b, 2.1, 2.18), (a, b, 2.43, 2.5)):
        # 鋁框、門把名字含 WALL_、dir 和前牆一樣：鏡頭在大門外時（一進男宿的第一個畫面，鏡頭在人後面 3.6 m）跟著前牆淡出——
        # 原本前牆淡出了、鋁框還在，粗黑框橫在鏡頭和人中間，人只看得到頭（LAWWW2 10-22 巡場景第 3 區）。玻璃照舊（B3.attachFormal 會把 WALL_ 設成不透明）
        box(f'L0_gate_WALL_frame_{xa:.2f}_{ya:.1f}', MAT['frame'], xa, xb, ya, yb, zf - 0.05, zf + 0.05, L0, props={'dir': [0, 0, -1]})
    quad(f'L0_gate_glass_{a:.0f}', MAT['glass'], [(a, 0.12, zf), (b, 0.12, zf), (b, 2.43, zf), (a, 2.43, zf)], L0, tile=1.0)
    cyl(f'L0_gate_WALL_handle_{a:.0f}', MAT['steel'], (b - 0.14 if a < 0 else a + 0.14, 0.8, zf - 0.08), (b - 0.14 if a < 0 else a + 0.14, 1.3, zf - 0.08), 0.015, L0, seg=8, props={'dir': [0, 0, -1]})
box('L0_mat', MAT['rubber'], -1.0, 1.0, 0.0, 0.012, LB['z1'] - 1.2, LB['z1'] - 0.1, L0)   # 門口的腳踏墊

# ================================================================ 4. 門（寢室、洗衣間、舍監室、側門、自己的房門）
for d in L['doors']:
    y0 = Y1 if d['lv'] else 0.0; P = L1 if d['lv'] else L0; pre = ('L1_' if d['lv'] else 'L0_') + 'door_' + d['id']
    if d['side'] == 'N': door(pre, P, d['x'], CO['z0'] - T / 2, y0, 1)
    elif d['side'] == 'S': door(pre, P, d['x'], CO['z1'] + T / 2, y0, -1)
    elif d['side'] == 'E': door(pre, P, CO['x1'] + T / 2, 0.0, y0, -1, along='z')
H = L['home']; door('L1_door_home', L1, H['x'], CO['z0'] - T / 2, Y1, 1)
# 自己的房門前：鞋架（兩雙鞋）、拖鞋
hx, hz = H['x'] + 0.95, CO['z0'] + 0.15
box('L1_shoerack', MAT['rubber'], hx - 0.35, hx + 0.35, Y1, Y1 + 0.34, hz - 0.13, hz + 0.13, L1, bevel=0.01)
for i, (c, dx) in enumerate((('white', -0.15), ('blue', 0.15))): box(f'L1_shoe_{i}', MAT[c], hx + dx - 0.12, hx + dx + 0.12, Y1 + 0.35, Y1 + 0.43, hz - 0.05, hz + 0.06, L1, bevel=0.015)
for i, dx in enumerate((-0.42, -0.2)): box(f'L1_slipper_{i}', MAT['blue'], H['x'] + dx - 0.06, H['x'] + dx + 0.06, Y1, Y1 + 0.025, CO['z0'] + 0.3, CO['z0'] + 0.56, L1)
# 別的寢室門口也有鞋架（不是每一間）
for i, (x, lv, side) in enumerate(((-5.25, 1, 'N'), (11.05, 1, 'S'), (-10.9, 0, 'N'), (11.15, 0, 'N'))):
    y0 = Y1 if lv else 0.0; P = L1 if lv else L0; z = (CO['z0'] + 0.15) if side == 'N' else (CO['z1'] - 0.15)
    box(f'{"L1" if lv else "L0"}_rack_{i}', MAT['rubber'], x + 0.62, x + 1.22, y0, y0 + 0.34, z - 0.13, z + 0.13, P, bevel=0.01)
    box(f'{"L1" if lv else "L0"}_rackshoe_{i}', MAT['white' if i % 2 else 'rubber'], x + 0.7, x + 0.94, y0 + 0.35, y0 + 0.43, z - 0.05, z + 0.06, P, bevel=0.015)

# ================================================================ 5. 樓梯（A 跑實心、平台實心、B 跑懸在儲藏室上面、兩跑中間的牆、扶手、二樓欄杆）
AX0, AX1, BX0, BX1 = WL['x0'], MW['x0'], MW['x1'], WL['x1']   # 畫面上的踏階寬到牆邊（導航的 A、B 範圍窄一點：x 0.2 m 對齊格子）
# 樓梯只做看得到的面（DORM-HALL-LM-1028：光照烘焙）：踏面、踢面、平台的上面。原本每一階一個實心方塊（A 跑到地面、互相重疊）、B 跑下面一塊斜板——
# 兩側貼著樓梯間的牆和中間的牆，底下是封起來的空間（A 跑、平台下面；B 跑下面的儲藏室，走廊北牆擋著），看不到；留著只會佔光照貼圖、在重疊的地方烘出黑邊
def run_faces(name, zf, dirz, base, n):
    """一跑的踏面＋踢面：zf＝第一階踢面的位置、dirz＝往上爬的方向（A 跑 −1 往北、B 跑 +1 往南）、base＝起點的高度"""
    x0, x1 = (AX0, AX1) if dirz < 0 else (BX0, BX1)
    bm = bmesh.new()
    for k in range(n):
        za = zf + dirz * k * TR; zb = za + dirz * TR; ya = base + k * R; yb = base + (k + 1) * R
        f = bm.faces.new([bm.verts.new(g2b(x, y, za)) for (x, y) in ((x0, ya), (x1, ya), (x1, yb), (x0, yb))]); f.normal_update()
        if f.normal.y * dirz < 0: f.normal_flip()     # 踢面：朝往下走的方向（遊戲 −dirz＝Blender y 的 +dirz）
        f = bm.faces.new([bm.verts.new(g2b(x, yb, z)) for (x, z) in ((x0, za), (x1, za), (x1, zb), (x0, zb))]); f.normal_update()
        if f.normal.z < 0: f.normal_flip()            # 踏面：朝上
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.normal_update(); box_uv(bm, MAT['stair']['tile'] if 'tile' in MAT['stair'] else 1.0)
    return mesh_obj(name, bm, MAT['stair'], L0)
run_faces('L0_A_steps', A['z1'], -1, 0.0, A['risers'])
run_faces('L0_B_steps', B['z0'], 1, LD['y'], B['risers'])
for k in range(A['risers']):
    top = (k + 1) * R; z1 = A['z1'] - k * TR
    box(f'L0_A_nose_{k}', MAT['nosing'], AX0 + 0.05, AX1 - 0.05, top - 0.004, top + 0.004, z1 - 0.07, z1 - 0.02, L0)
quad('L0_landing_top', MAT['stair'], [(AX0, LD['y'], LD['z1']), (BX1, LD['y'], LD['z1']), (BX1, LD['y'], LD['z0']), (AX0, LD['y'], LD['z0'])], L0)
# 平台北牆、窗上面的壁燈（燈座＋日光燈管；DORM-HALL-LM-1028：6.9 m 高的樓梯間原本只靠二樓天花板一支燈，烘出來平台和 A 跑很暗）
# 名字含 WALL_、dir 朝下：和天花板的日光燈一樣，鏡頭比燈高的時候藏起來（tests/room_ceiling_unit.js：2 m 以上的燈具要單面朝下或在 WALL_ 朝下的群組裡）
box('L0_landlamp_WALL_fixture', MAT['fixture'], -0.62, 0.62, LD['y'] + 2.62, LD['y'] + 2.72, WL['z0'], WL['z0'] + 0.14, L0, props={'dir': [0, -1, 0]})
box('L0_landlamp_WALL_tube', MAT['tube'], -0.57, 0.57, LD['y'] + 2.595, LD['y'] + 2.62, WL['z0'] + 0.06, WL['z0'] + 0.1, L0, props={'dir': [0, -1, 0]})
for k in range(B['risers']):
    top = LD['y'] + (k + 1) * R; z0 = B['z0'] + k * TR
    box(f'L0_B_nose_{k}', MAT['nosing'], BX0 + 0.05, BX1 - 0.05, top - 0.004, top + 0.004, z0 + 0.02, z0 + 0.07, L0)
# 兩跑中間的實心牆（到二樓地板再高 1 m）＋牆頂收邊
mh = Y1 + 1.0
wall_cut('L0_mid_lo', L0, 'z', (MW['x0'] + MW['x1']) / 2, A['z0'], A['z1'], 0.0, 1.1, [], MAT['dado'], th=MW['x1'] - MW['x0'])
wall_cut('L0_mid_hi', L0, 'z', (MW['x0'] + MW['x1']) / 2, A['z0'], A['z1'], 1.1, mh, [], MAT['plaster'], th=MW['x1'] - MW['x0'])
box('L0_mid_cap', MAT['stair'], MW['x0'] - 0.02, MW['x1'] + 0.02, mh, mh + 0.04, A['z0'] - 0.02, A['z1'] + 0.02, L0)
# 扶手（牆上：鐵管＋固定座）：A 跑兩側、B 跑兩側；x_rail＝扶手、x_wall＝牆面（固定座從扶手接到牆）
def handrail(prefix, pts, x_rail, x_wall):
    for i in range(len(pts) - 1):
        (za, ya), (zb, yb) = pts[i], pts[i + 1]
        cyl(f'{prefix}_{i}', MAT['steel'], (x_rail, ya + 0.9, za), (x_rail, yb + 0.9, zb), 0.022, L0, seg=8)
        n = max(1, int(abs(zb - za) / 1.0))
        for k in range(n + 1):
            t = k / n; z = za + (zb - za) * t; y = ya + (yb - ya) * t + 0.9
            cyl(f'{prefix}_{i}_br{k}', MAT['steel'], (x_rail, y, z), (x_wall, y, z), 0.01, L0, seg=6)
handrail('L0_hr_Aw', [(A['z1'], 0.0), (A['z0'], LD['y'])], AX0 + 0.07, AX0)
handrail('L0_hr_Am', [(A['z1'], 0.0), (A['z0'], LD['y'])], AX1 - 0.07, AX1)
handrail('L0_hr_Bm', [(B['z0'], LD['y']), (B['z1'], Y1)], BX0 + 0.07, BX0)
handrail('L0_hr_Be', [(B['z0'], LD['y']), (B['z1'], Y1)], BX1 - 0.07, BX1)
# 二樓：A 跑上方的欄杆（走廊北邊，鐵管扶手＋直條）
zr = CO['z0'] - 0.04
cyl('L1_rail_top', MAT['steel'], (WL['x0'], Y1 + 1.05, zr), (MW['x0'], Y1 + 1.05, zr), 0.025, L1, seg=8)
box('L1_rail_bot', MAT['steel'], WL['x0'], MW['x0'], Y1 + 0.08, Y1 + 0.12, zr - 0.02, zr + 0.02, L1)
x = WL['x0'] + 0.08
while x < MW['x0'] - 0.02:
    box(f'L1_rail_bal_{x:.2f}', MAT['steel'], x - 0.012, x + 0.012, Y1 + 0.1, Y1 + 1.04, zr - 0.012, zr + 0.012, L1); x += 0.12
box('L1_rail_curb', MAT['stair'], WL['x0'], MW['x0'], Y1 - ST, Y1 + 0.08, CO['z0'] - 0.1, CO['z0'] + 0.02, L1)   # 樓板邊

# ================================================================ 6. 家具
def chair(prefix, parent, x, y, z, yaw):
    """長桌的椅子：灰藍塑膠椅面、微微後傾的椅背、鐵管腳（後腳往上接到椅背）；坐的人面向 +z（ART-DORM-LOUNGE-1021，原本是木板方塊）"""
    g = group(prefix, parent); g.location = g2b(x, y, z); g.rotation_euler = (0, 0, yaw)
    rbox(prefix + '_seat', MAT['shell'], (0, 0.45, 0.01), (0.44, 0.035, 0.42), g, bevel=0.015, seg=2)
    rbox(prefix + '_back', MAT['shell'], (0, 0.72, -0.2), (0.42, 0.28, 0.03), g, rot=(math.radians(-8), 0, 0), bevel=0.012, seg=2)
    for sx in (-0.19, 0.19):
        cyl(f'{prefix}_lf_{sx}', MAT['steel'], (sx, 0.0, 0.19), (sx, 0.44, 0.17), 0.011, g, seg=6)
        cyl(f'{prefix}_lb_{sx}', MAT['steel'], (sx, 0.0, -0.19), (sx, 0.86, -0.25), 0.011, g, seg=6)
        cyl(f'{prefix}_lr_{sx}', MAT['steel'], (sx, 0.425, 0.17), (sx, 0.425, -0.2), 0.009, g, seg=6)
    return g

# ---------------- 地上的小擺設（DORM-HALL-LM-1028，LAWWW2-C 10-28；使用者 P0「校內建築室內……廉價手遊感」）----------------
# dorm_layout.js 的 prop（遊戲那邊有導航阻擋，dorm3d.js），照 kind 做：滅火器、門廳的包裹架、傘架、洗衣間門口的洗衣籃
MAT.update({
    'navy':     pbr('dm_navy', None, tint=srgb('#24324a'), rough=0.6),                               # 傘
    'exitg':    pbr('dm_exitg', None, tint=srgb('#1f8f4a'), rough=0.5),                              # 出口燈的燈箱
    'exitglow': pbr('dm_exitglow', None, tint=srgb('#e8fff0'), rough=0.5, emit=srgb('#9dffc4')),     # 出口燈的發光面（不烘、一直亮）
    'gapglow':  pbr('dm_gapglow', None, tint=srgb('#ffd9a0'), rough=0.9, emit=srgb('#ffcf8a')),      # 101 門縫透出的檯燈光
})
def _ext(pre, f, y, P):
    """滅火器：紅色鋼瓶站在小底座上，黑色握把、壓把、皮管，正面一張檢查卡（朝走廊中間）"""
    x, z = f['x'], f['z']; s = -1 if z > 0 else 1
    box(pre + '_base', MAT['red'], x - 0.12, x + 0.12, y, y + 0.05, z - 0.1, z + 0.1, P, bevel=0.01)
    cyl(pre + '_body', MAT['red'], (x, y + 0.05, z), (x, y + 0.52, z), 0.075, P, seg=14)
    cyl(pre + '_neck', MAT['black'], (x, y + 0.52, z), (x, y + 0.58, z), 0.028, P, seg=8)
    box(pre + '_lever', MAT['black'], x - 0.07, x + 0.05, y + 0.58, y + 0.6, z - 0.015, z + 0.015, P)
    cyl(pre + '_hose', MAT['black'], (x + 0.03, y + 0.56, z + s * 0.03), (x + 0.07, y + 0.22, z + s * 0.07), 0.012, P, seg=6)
    box(pre + '_tag', MAT['white'], x - 0.04, x + 0.04, y + 0.3, y + 0.4, z + s * 0.074, z + s * 0.078, P)

def _parcels(pre, f, y, P):
    """門廳的包裹架：不鏽鋼四層架，放著大小不一的紙箱（封箱膠帶）、白色包裹袋（沒有字，D77）。w＝寬（左右）、d＝深；正面朝 +z，照 ry 轉"""
    g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, f.get('ry', 0.0))
    x, z, w, d, h = 0.0, 0.0, f['w'], f['d'], f['h']; y, P = 0.0, g
    for sx in (-1, 1):
        for sz in (-1, 1):
            px, pz = x + sx * (w / 2 - 0.02), z + sz * (d / 2 - 0.02)
            box(f'{pre}_post_{sx}{sz}', MAT['steel'], px - 0.015, px + 0.015, y, y + h, pz - 0.015, pz + 0.015, P)
    for k, yy in enumerate((0.08, 0.55, 1.02, h - 0.02)): box(f'{pre}_shelf_{k}', MAT['steel'], x - w / 2, x + w / 2, y + yy, y + yy + 0.02, z - d / 2, z + d / 2, P)
    top = (0.1, 0.57, 1.04, h)
    for k, (dx, lv_, bw, bh, bd, m, rot) in enumerate(((-0.24, 0, 0.34, 0.26, 0.3, 'cork', 0.06), (0.13, 0, 0.3, 0.2, 0.28, 'cork', -0.1), (0.36, 0, 0.14, 0.08, 0.25, 'white', 0.2),
                                                        (-0.2, 1, 0.26, 0.18, 0.24, 'cork', 0.1), (0.05, 1, 0.22, 0.06, 0.3, 'white', -0.2), (0.3, 1, 0.2, 0.24, 0.2, 'cork', 0.0),
                                                        (-0.25, 2, 0.25, 0.05, 0.32, 'white', 0.0), (0.15, 2, 0.18, 0.14, 0.18, 'cork', 0.12), (0.0, 3, 0.3, 0.2, 0.26, 'cork', -0.05))):
        yb = y + top[lv_]
        rbox(f'{pre}_box_{k}', MAT[m], (x + dx, yb + bh / 2, z), (bw, bh, bd), P, rot=(0, rot, 0), bevel=0.006 if m == 'cork' else 0.015)
        if m == 'cork': rbox(f'{pre}_tape_{k}', MAT['paper2'], (x + dx, yb + bh + 0.001, z), (0.05, 0.002, bd + 0.004), P, rot=(0, rot, 0))

def _umbrellas(pre, f, y, P):
    """傘架：不鏽鋼桶＋四把收起來的傘（顏色不一，斜斜地插著）"""
    x, z = f['x'], f['z']
    cyl(pre + '_bucket', MAT['steel'], (x, y, z), (x, y + 0.48, z), 0.16, P, seg=16)
    cyl(pre + '_rim', MAT['steel'], (x, y + 0.47, z), (x, y + 0.5, z), 0.17, P, seg=16)
    for k, (dx, dz, m, tx, tz, hh) in enumerate(((-0.06, -0.05, 'navy', -0.12, -0.06, 0.92), (0.06, -0.04, 'red', 0.1, -0.08, 0.86), (-0.04, 0.06, 'black', -0.08, 0.1, 0.95), (0.07, 0.06, 'green', 0.12, 0.07, 0.83))):
        b0 = (x + dx, y + 0.06, z + dz); b1 = (x + dx + tx, y + hh, z + dz + tz)
        cyl(f'{pre}_u_{k}', MAT[m], b0, b1, 0.03, P, seg=8, r2=0.012)                    # 收起來的傘布（往上變細）
        cyl(f'{pre}_h_{k}', MAT['black'], b1, (b1[0], b1[1] + 0.09, b1[2]), 0.012, P, seg=6)   # 握把

def _laundry(pre, f, y, P):
    """洗衣間門口的洗衣籃（藍色塑膠，裡面堆著衣服）"""
    x, z = f['x'], f['z']
    rbox(pre + '_body', MAT['blue'], (x, y + 0.15, z), (0.5, 0.3, 0.36), P, bevel=0.03, seg=2)
    rbox(pre + '_rim', MAT['blue'], (x, y + 0.31, z), (0.54, 0.03, 0.4), P, bevel=0.01)
    for k, (dx, dz, w_, h_, d_, m, r_) in enumerate(((-0.1, -0.04, 0.26, 0.1, 0.22, 'white', 0.3), (0.08, 0.05, 0.24, 0.12, 0.2, 'paper3', -0.4), (0.0, -0.02, 0.2, 0.08, 0.18, 'navy', 0.9))):
        rbox(f'{pre}_cloth_{k}', MAT[m], (x + dx, y + 0.29 + h_ / 2, z + dz), (w_, h_, d_), P, rot=(0.15, r_, 0.1), bevel=0.03, seg=2)
PROPS = {'extinguisher': _ext, 'parcels': _parcels, 'umbrellas': _umbrellas, 'laundry': _laundry}

for i, f in enumerate(L['furniture']):
    y = Y1 if f['lv'] else 0.0; P = L1 if f['lv'] else L0; pre = ('L1_' if f['lv'] else 'L0_') + f['type'] + f'_{i}'; ry = f.get('ry', 0.0)
    t = f['type']
    if t == 'wardenWindow':   # 舍監室窗口：窗框、玻璃（在牆的洞裡）、外面的小檯面、裡面的桌子與檯燈
        x0 = f['x']; z0 = f['z']
        for (za, zb, ya, yb) in ((z0 - 0.8, z0 - 0.74, 1.05, 2.05), (z0 + 0.74, z0 + 0.8, 1.05, 2.05), (z0 - 0.8, z0 + 0.8, 1.05, 1.11), (z0 - 0.8, z0 + 0.8, 1.99, 2.05), (z0 - 0.03, z0 + 0.03, 1.4, 2.05)):
            box(f'{pre}_frame_{za:.2f}_{ya:.2f}', MAT['frame'], x0 - T / 2 - 0.01, x0 - T / 2 + 0.05, ya, yb, za, zb, P)
        quad(pre + '_glass', MAT['glass'], [(x0 - T / 2 + 0.02, 1.4, z0 - 0.74), (x0 - T / 2 + 0.02, 1.4, z0 + 0.74), (x0 - T / 2 + 0.02, 1.99, z0 + 0.74), (x0 - T / 2 + 0.02, 1.99, z0 - 0.74)], P, tile=1.0)
        box(pre + '_ledge', MAT['wood'], x0 - T / 2, x0 + 0.28, 1.02, 1.07, z0 - 0.8, z0 + 0.8, P)
        box(pre + '_desk', MAT['wood'], x0 - 0.9, x0 - T / 2 - 0.02, 0.0, 0.76, z0 - 0.9, z0 + 0.9, P)   # 窗口裡面的桌子（值班的工讀生坐在後面：story3d.js）
        box(pre + '_log', MAT['paper'], x0 + 0.02, x0 + 0.25, 1.07, 1.075, z0 - 0.35, z0 - 0.05, P)
    elif t == 'mailboxes':   # 信箱：灰色鐵櫃、一格一格的小門（號碼由遊戲不畫：太小）
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_body', MAT['locker'], -f['w'] / 2, f['w'] / 2, 0.2, 1.7, -0.16, 0.16, g, bevel=0.01)
        for a in range(8):
            for b in range(5):
                xa = -f['w'] / 2 + 0.06 + a * (f['w'] - 0.12) / 8; xb = xa + (f['w'] - 0.12) / 8 - 0.02
                box(f'{pre}_d_{a}_{b}', MAT['locker'], xa, xb, 0.3 + b * 0.27, 0.53 + b * 0.27, 0.16, 0.175, g)
                box(f'{pre}_s_{a}_{b}', MAT['frame'], xa + 0.04, xb - 0.04, 0.47 + b * 0.27, 0.48 + b * 0.27, 0.175, 0.18, g)
    elif t == 'notice':   # 公告欄：木框、軟木板、幾張公告
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_frame', MAT['wood'], -1.2, 1.2, 1.0, 2.2, -0.03, 0.03, g); box(pre + '_cork', MAT['cork'], -1.13, 1.13, 1.07, 2.13, 0.03, 0.04, g)
        for k, (px, py, m) in enumerate(((-0.8, 1.75, 'paper'), (-0.25, 1.8, 'paper2'), (0.3, 1.7, 'paper'), (0.85, 1.78, 'paper3'), (-0.5, 1.3, 'paper3'), (0.5, 1.3, 'paper2'))):
            box(f'{pre}_p{k}', MAT[m], px - 0.2, px + 0.2, py - 0.26, py + 0.26, 0.04, 0.045 + (0.003 if k < 4 else 0.0), g)   # 上排比下排前面 3 mm（原本同一個平面，上下排疊到的角會閃，BUG-COPLANAR-DEV）
    elif t == 'sofa':   # 三人座人造皮沙發（ART-DORM-LOUNGE-1021）：底座、三個坐墊、三個往後傾的靠墊、圓扶手、短腳；外框照導航 2.2×0.9、坐墊面 0.45 m
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        rr = random.Random(77 + i)
        rbox(pre + '_base', MAT['fabric'], (0, 0.2, -0.02), (2.2, 0.2, 0.84), g, bevel=0.03, seg=2)
        rbox(pre + '_backframe', MAT['fabric'], (0, 0.55, -0.37), (2.2, 0.58, 0.16), g, bevel=0.06, seg=3)   # 椅背框比靠墊高：從後面看是一整片圓邊的椅背，不是一堆方塊
        for k, sx in enumerate((-0.62, 0.0, 0.62)):
            rbox(f'{pre}_cush_{k}', MAT['fabric'], (sx, 0.375 + rr.uniform(-0.01, 0.003), 0.06), (0.61, 0.15, 0.68), g, rot=(0, 0, rr.uniform(-0.012, 0.012)), bevel=0.055, seg=3)
            rbox(f'{pre}_bcush_{k}', MAT['fabric'], (sx, 0.6, -0.2), (0.6, 0.4, 0.15), g, rot=(math.radians(-8) + rr.uniform(-0.025, 0.025), 0, 0), bevel=0.06, seg=3)
        for sx in (-1, 1): rbox(f'{pre}_arm_{sx}', MAT['fabric'], (sx * 1.02, 0.45, -0.02), (0.16, 0.34, 0.86), g, bevel=0.07, seg=3)
        for (lx, lz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): cyl(f'{pre}_leg_{lx}_{lz}', MAT['frame'], (lx * 1.0, 0.0, lz * 0.36), (lx * 1.0, 0.1, lz * 0.36), 0.022, g, seg=8, r2=0.03)
    elif t == 'coffeeTable':   # 矮桌：木桌面（深色收邊）、下層層板放雜誌；桌上折起來的報紙、遙控器、面紙盒、馬克杯
        x, z, w, dd = f['x'], f['z'], f['w'], f['d']
        rbox(pre + '_top', MAT['wood'], (x, y + 0.4, z), (w, 0.04, dd), P, bevel=0.012, seg=2)
        rbox(pre + '_apron', MAT['frame'], (x, y + 0.365, z), (w - 0.06, 0.03, dd - 0.06), P)
        rbox(pre + '_shelf', MAT['wood'], (x, y + 0.12, z), (w - 0.1, 0.025, dd - 0.1), P)
        for (lx, lz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): rbox(f'{pre}_leg_{lx}_{lz}', MAT['frame'], (x + lx * (w / 2 - 0.05), y + 0.19, z + lz * (dd / 2 - 0.05)), (0.035, 0.38, 0.035), P)
        rbox(pre + '_news', MAT['paper'], (x - 0.06, y + 0.426, z - 0.28), (0.3, 0.012, 0.42), P, rot=(0, 0.2, 0))
        rbox(pre + '_remote', MAT['black'], (x + 0.14, y + 0.43, z + 0.08), (0.05, 0.02, 0.18), P, rot=(0, -0.4, 0), bevel=0.006)
        rbox(pre + '_tissue', MAT['white'], (x - 0.13, y + 0.47, z + 0.4), (0.13, 0.1, 0.24), P, bevel=0.012, seg=2)
        cyl(pre + '_mug', MAT['white'], (x + 0.17, y + 0.42, z + 0.42), (x + 0.17, y + 0.52, z + 0.42), 0.04, P, seg=14)
        for k in range(3): rbox(f'{pre}_mag_{k}', MAT[('paper3', 'paper2', 'paper')[k]], (x + 0.02 * k, y + 0.14 + 0.012 * k, z - 0.12 + 0.05 * k), (0.24, 0.01, 0.32), P, rot=(0, 0.15 * k, 0))
    elif t == 'tv':   # 掛牆的薄電視＋矮電視櫃（三格門片、把手）、機上盒、直立的遊戲機、兩支手把；櫃子在導航的 0.45×1.5 裡面
        x, z, w = f['x'], f['z'], f['w']; cx = x - 0.12
        rbox(pre + '_panel', MAT['black'], (x + 0.11, y + 1.6, z), (0.05, 0.92, w), P, bevel=0.008)
        rbox(pre + '_screen', MAT['screen'], (x + 0.084, y + 1.61, z), (0.004, 0.86, w - 0.04), P)
        rbox(pre + '_cab', MAT['wood'], (cx, y + 0.27, z), (0.42, 0.42, 1.46), P, bevel=0.01)
        rbox(pre + '_plinth', MAT['frame'], (cx + 0.02, y + 0.03, z), (0.36, 0.06, 1.4), P)
        for k in range(3):
            zz = z - 0.48 + k * 0.48
            rbox(f'{pre}_door_{k}', MAT['wood'], (cx - 0.213, y + 0.27, zz), (0.008, 0.36, 0.45), P)
            rbox(f'{pre}_handle_{k}', MAT['steel'], (cx - 0.224, y + 0.4, zz), (0.012, 0.015, 0.14), P)
        rbox(pre + '_stb', MAT['black'], (cx + 0.02, y + 0.505, z - 0.42), (0.2, 0.05, 0.3), P, bevel=0.005)
        rbox(pre + '_console', MAT['white'], (cx + 0.05, y + 0.66, z + 0.42), (0.1, 0.32, 0.26), P, bevel=0.015, seg=2)
        rbox(pre + '_console_base', MAT['black'], (cx + 0.05, y + 0.49, z + 0.42), (0.14, 0.02, 0.2), P)
        for k in range(2): rbox(f'{pre}_pad_{k}', MAT['black' if k else 'white'], (cx - 0.07, y + 0.5, z + 0.04 + k * 0.17), (0.1, 0.035, 0.15), P, rot=(0, 0.3 * (k - 0.5), 0), bevel=0.012, seg=2)
    elif t == 'vending':   # 自動販賣機（第一台淺灰、第二台紅色）：機身、亮著的展示窗（dorm_vend_panel.png：最上面一排奶茶「售完」，遊戲文字）、玻璃、投幣口、紙鈔口、退幣口、取物口
        vi = [j for j, ff in enumerate(L['furniture']) if ff['type'] == 'vending'].index(i)
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        body = MAT['vend'] if vi % 2 == 0 else MAT['red']
        rbox(pre + '_body', body, (0, 0.95, -0.03), (1.0, 1.8, 0.68), g, bevel=0.02, seg=2)
        rbox(pre + '_plinth', MAT['black'], (0, 0.03, -0.02), (0.96, 0.06, 0.66), g)
        rbox(pre + '_door', body, (0, 0.96, 0.33), (0.98, 1.74, 0.05), g, bevel=0.012, seg=2)
        u0 = 0.0 if vi % 2 == 0 else 0.5
        tquad(pre + '_panel', MAT['vendlit'], (u0, 0.0, u0 + 0.5, 1.0), [(-0.44, 0.6, 0.357), (0.2, 0.6, 0.357), (0.2, 1.8, 0.357), (-0.44, 1.8, 0.357)], g)
        quad(pre + '_glass', MAT['glass'], [(-0.44, 0.6, 0.368), (0.2, 0.6, 0.368), (0.2, 1.8, 0.368), (-0.44, 1.8, 0.368)], g, tile=1.0)
        for (xa, xb, ya, yb) in ((-0.47, -0.44, 0.57, 1.83), (0.2, 0.23, 0.57, 1.83), (-0.47, 0.23, 0.57, 0.6), (-0.47, 0.23, 1.8, 1.83)):
            box(f'{pre}_wf_{xa:.2f}_{ya:.2f}', MAT['black'], xa, xb, ya, yb, 0.355, 0.372, g)
        rbox(pre + '_coinplate', MAT['steel'], (0.34, 1.28, 0.362), (0.13, 0.22, 0.012), g, bevel=0.004)
        rbox(pre + '_coin', MAT['black'], (0.34, 1.33, 0.369), (0.012, 0.05, 0.004), g)
        rbox(pre + '_bill', MAT['black'], (0.34, 1.1, 0.366), (0.12, 0.09, 0.012), g)
        rbox(pre + '_lcd', MAT['screen'], (0.34, 1.47, 0.366), (0.1, 0.04, 0.008), g)
        rbox(pre + '_return', MAT['black'], (0.34, 0.8, 0.366), (0.08, 0.07, 0.012), g)
        rbox(pre + '_slot', MAT['black'], (-0.12, 0.27, 0.36), (0.62, 0.22, 0.02), g)
        rbox(pre + '_flap', MAT['frame'], (-0.12, 0.29, 0.37), (0.58, 0.16, 0.01), g, rot=(0.25, 0, 0))
    elif t == 'water':   # 飲水機（熱、溫、冰三個出水口；牆上「請自備杯子」，遊戲文字）：白色機身、不鏽鋼頂板、深色出水區、出水口上蓋與按鈕、滴水盤、指示燈
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        rbox(pre + '_body', MAT['white'], (0, 0.62, 0), (0.4, 1.24, 0.4), g, bevel=0.02, seg=2)
        rbox(pre + '_top', MAT['steel'], (0, 1.255, 0), (0.41, 0.03, 0.41), g, bevel=0.008)
        rbox(pre + '_alcove', MAT['frame'], (0, 0.86, 0.203), (0.32, 0.38, 0.008), g)
        rbox(pre + '_hood', MAT['white'], (0, 1.07, 0.235), (0.34, 0.06, 0.07), g, bevel=0.01)
        for k, c in enumerate(('red', 'white', 'blue')):
            tx = -0.1 + k * 0.1
            cyl(f'{pre}_tap_{k}', MAT['steel'], (tx, 0.98, 0.235), (tx, 1.04, 0.235), 0.012, g, seg=8)
            rbox(f'{pre}_btn_{k}', MAT[c], (tx, 1.07, 0.272), (0.06, 0.035, 0.008), g, bevel=0.004)
        rbox(pre + '_tray', MAT['steel'], (0, 0.68, 0.235), (0.3, 0.025, 0.08), g, bevel=0.004)
        for k in range(5): rbox(f'{pre}_grille_{k}', MAT['black'], (-0.12 + k * 0.06, 0.694, 0.235), (0.012, 0.004, 0.07), g)
        for k, c in enumerate(('red', 'green')): rbox(f'{pre}_led_{k}', MAT[c], (0.11 + k * 0.035, 1.17, 0.201), (0.015, 0.015, 0.004), g)
        dw = abs((LB['z1'] if f['lv'] == 0 else CO['z0']) - f['z'])   # 到背後那面牆的距離
        wquad(pre + '_cups', 'cups', (0, 1.52, -dw + 0.012), 0.42, 0.42 * (590 - 482) / 424, '+z', g)
    elif t == 'fridge':   # 交誼廳的公用冰箱（NPC-POOL-ART-1028，LAWWW2-C 10-28：AA_498 8-3「把箱子放進交誼廳的冰箱」、8-6 冰箱門上的紙條；互動點 pool3d.js (7.3, 6.7)）
        # 白色雙門（上冷凍、下冷藏）、門縫、右邊銀色直把手、底下黑色通風格柵、門上幾個磁鐵和一張使用登記表（字由遊戲畫，這裡只有紙）、上面一個紙箱
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        FW, FD, FH = 0.66, 0.66, 1.72; fz = FD / 2
        rbox(pre + '_body', MAT['white'], (0, 0.06 + (FH - 0.06) / 2, -0.01), (FW, FH - 0.06, FD - 0.02), g, bevel=0.02, seg=2)
        rbox(pre + '_kick', MAT['black'], (0, 0.03, -0.01), (FW - 0.04, 0.06, FD - 0.06), g)
        for k in range(6): rbox(f'{pre}_vent_{k}', MAT['frame'], (-0.2 + k * 0.08, 0.035, fz - 0.035), (0.05, 0.03, 0.004), g)
        rbox(pre + '_dfr', MAT['white'], (0, 1.375, fz + 0.012), (FW - 0.012, 0.66, 0.035), g, bevel=0.012, seg=2)   # 冷凍庫的門
        rbox(pre + '_dfz', MAT['white'], (0, 0.565, fz + 0.012), (FW - 0.012, 0.93, 0.035), g, bevel=0.012, seg=2)   # 冷藏室的門
        rbox(pre + '_gap', MAT['black'], (0, 1.035, fz + 0.002), (FW - 0.03, 0.012, 0.02), g)
        for (y0, y1) in ((1.18, 1.52), (0.66, 0.98)):
            cyl(f'{pre}_hdl_{y0}', MAT['steel'], (0.27, y0, fz + 0.06), (0.27, y1, fz + 0.06), 0.011, g, seg=8)
            for yy in (y0 + 0.02, y1 - 0.02): cyl(f'{pre}_hst_{yy:.2f}', MAT['steel'], (0.27, yy, fz + 0.03), (0.27, yy, fz + 0.062), 0.007, g, seg=6)
        rbox(pre + '_sheet', MAT['paper'], (-0.1, 0.78, fz + 0.031), (0.21, 0.297, 0.002), g, rot=(0, 0, 0.03))     # 使用登記表（「請寫名字和日期」：字由遊戲畫）
        rbox(pre + '_sheet2', MAT['paper2'], (0.05, 1.42, fz + 0.031), (0.15, 0.1, 0.002), g, rot=(0, 0, -0.08))    # 冷凍庫門上的便條
        for k, (mx, my, m) in enumerate(((-0.17, 0.925, 'red'), (-0.03, 0.925, 'blue'), (0.05, 1.47, 'yellow'), (-0.2, 1.3, 'green'), (0.13, 0.62, 'yellow'))):
            rbox(f'{pre}_mag_{k}', MAT[m], (mx, my, fz + 0.036), (0.035, 0.035, 0.012), g, bevel=0.005, seg=2)
        rbox(pre + '_box', MAT['cork'], (-0.04, FH + 0.11, -0.04), (0.44, 0.22, 0.34), g, rot=(0, 0, 0.06), bevel=0.006)   # 上面的紙箱（誰寄來的沒拆完）
        rbox(pre + '_tape', MAT['paper2'], (-0.04, FH + 0.222, -0.04), (0.06, 0.004, 0.345), g, rot=(0, 0, 0.06))
    elif t == 'longTable':   # 長桌（木桌面、鐵腳、橫桿）＋塑膠椅；桌上疊著的書、攤開的筆記本和筆、筆袋、保溫瓶（有人在這裡讀書）
        x, z, w, dd = f['x'], f['z'], f['w'], f['d']
        rbox(pre + '_top', MAT['wood'], (x, y + 0.74, z), (w, 0.04, dd), P, bevel=0.01, seg=2)
        for lx in (-1, 1):
            for lz in (-1, 1): rbox(f'{pre}_leg_{lx}_{lz}', MAT['frame'], (x + lx * (w / 2 - 0.12), y + 0.36, z + lz * (dd / 2 - 0.1)), (0.04, 0.72, 0.04), P)
            rbox(f'{pre}_brace_{lx}', MAT['frame'], (x + lx * (w / 2 - 0.12), y + 0.62, z), (0.03, 0.04, dd - 0.2), P)
        rbox(pre + '_rail', MAT['frame'], (x, y + 0.62, z - dd / 2 + 0.1), (w - 0.24, 0.03, 0.03), P)
        n = f.get('seats', 2)
        for k in range(n):
            sx = x - w / 2 + w * (k + 0.5) / n
            for s_ in (-1, 1): chair(f'{pre}_ch_{k}_{s_}', P, sx, y, z + s_ * (dd / 2 + 0.38), math.pi if s_ > 0 else 0.0)
        rbox(pre + '_book0', MAT['blue'], (x - 0.62, y + 0.775, z - 0.12), (0.2, 0.03, 0.27), P, rot=(0, 0.12, 0), bevel=0.004)
        rbox(pre + '_book1', MAT['red'], (x - 0.6, y + 0.8, z - 0.1), (0.18, 0.022, 0.25), P, rot=(0, -0.08, 0), bevel=0.004)
        rbox(pre + '_note', MAT['paper'], (x + 0.3, y + 0.765, z + 0.12), (0.42, 0.008, 0.29), P, rot=(0, 0.2, 0))
        rbox(pre + '_pen', MAT['black'], (x + 0.36, y + 0.774, z + 0.1), (0.13, 0.01, 0.01), P, rot=(0, 0.6, 0))
        rbox(pre + '_case', MAT['green'], (x - 0.1, y + 0.79, z + 0.15), (0.2, 0.06, 0.07), P, rot=(0, 0.3, 0), bevel=0.02, seg=2)
        cyl(pre + '_bottle', MAT['steel'], (x + 0.85, y + 0.76, z - 0.2), (x + 0.85, y + 0.98, z - 0.2), 0.035, P, seg=12)
    elif t == 'bins':   # 資源回收桶三個（一般垃圾、紙類、寶特瓶・鐵鋁罐；ART-DORM-LOUNGE-1021 新增）：桶身、上蓋、投入口、正面的標籤（圖集）
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        bw = (f['w'] - 0.04 * 2) / 3
        for k, m in enumerate(('rubber', 'green', 'blue')):
            bx = -f['w'] / 2 + bw / 2 + k * (bw + 0.04)
            rbox(f'{pre}_body_{k}', MAT[m], (bx, 0.38, 0), (bw, 0.76, 0.4), g, bevel=0.03, seg=2)
            rbox(f'{pre}_lid_{k}', MAT[m], (bx, 0.79, 0), (bw + 0.02, 0.06, 0.42), g, bevel=0.02, seg=2)
            rbox(f'{pre}_slot_{k}', MAT['black'], (bx, 0.821, 0.03), (bw * 0.6, 0.006, 0.13), g)
            lw = bw * 0.86; wquad(f'{pre}_label_{k}', f'bin{k}', (bx, 0.6, 0.2015), lw, lw * 68 / 424, '+z', g)
    elif t == 'planter':
        PL.potted(mesh_obj, PM, pre, P, f['x'], y + 0.5, f['z'], f['r'], seed=601 + i, h=1.1)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=f['r'] * 0.85, radius2=f['r'], depth=0.5)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.25, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(pre + '_pot', bm, MAT['stair'], P)
    elif t == 'bench':
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_seat', MAT['wood'], -f['w'] / 2, f['w'] / 2, 0.42, 0.46, -f['d'] / 2, f['d'] / 2, g, bevel=0.01)
        for sx in (-1, 1): box(f'{pre}_leg_{sx}', MAT['steel'], sx * (f['w'] / 2 - 0.12) - 0.025, sx * (f['w'] / 2 - 0.12) + 0.025, 0.0, 0.42, -f['d'] * 0.45, f['d'] * 0.45, g)
    elif t == 'prop':   # 地上的小擺設（DORM-HALL-LM-1028）：照 kind 做（上面的 PROPS）
        PROPS[f['kind']](pre, f, y, P)

# ================================================================ 6b. 交誼廳的牆上、天花板、地毯（ART-DORM-LOUNGE-1021；都不在走路的地方，不動導航）
LZ = LB['z1']; EX = CO['x1']   # 南牆（窗、販賣機那一面）、東牆（電視那一面）的牆面
# 吊扇兩支：貼天花板的款式，扇葉在 3.09～3.11 m——比宿舍鏡頭最高的 3.0 m（dorm3d.js camMaxY）高，不會擋在鏡頭和人中間
for k, (fx, fz) in enumerate(((7.0, 5.0), (11.2, 5.4))):
    cyl(f'L0_fan{k}_canopy', MAT['white'], (fx, HC - 0.04, fz), (fx, HC, fz), 0.07, L0, seg=16)
    cyl(f'L0_fan{k}_rod', MAT['white'], (fx, HC - 0.16, fz), (fx, HC - 0.04, fz), 0.018, L0, seg=8)
    cyl(f'L0_fan{k}_motor', MAT['white'], (fx, HC - 0.27, fz), (fx, HC - 0.16, fz), 0.13, L0, seg=20, r2=0.11)
    cyl(f'L0_fan{k}_cap', MAT['steel'], (fx, HC - 0.29, fz), (fx, HC - 0.27, fz), 0.06, L0, seg=12)
    for b in range(3):
        a = b * 2 * math.pi / 3 + k * 0.5
        rbox(f'L0_fan{k}_arm{b}', MAT['steel'], (fx + math.cos(a) * 0.17, HC - 0.235, fz + math.sin(a) * 0.17), (0.18, 0.012, 0.035), L0, rot=(0, -a, 0))
        rbox(f'L0_fan{k}_blade{b}', MAT['wood'], (fx + math.cos(a) * 0.5, HC - 0.235, fz + math.sin(a) * 0.5), (0.58, 0.01, 0.13), L0, rot=(0.12, -a, 0), bevel=0.004)
# 冷氣（分離式室內機，東牆靠走廊那一段）
rbox('L0_ac_body', MAT['white'], (EX - 0.11, 2.75, 2.6), (0.2, 0.28, 0.92), L0, bevel=0.03, seg=2)
rbox('L0_ac_vent', MAT['frame'], (EX - 0.205, 2.65, 2.6), (0.012, 0.035, 0.8), L0)
rbox('L0_ac_led', MAT['green'], (EX - 0.212, 2.8, 2.98), (0.004, 0.012, 0.03), L0)
cyl('L0_ac_pipe', MAT['white'], (EX - 0.04, 2.66, 3.08), (EX - 0.04, 2.0, 3.08), 0.03, L0, seg=8)
# 時鐘（南牆兩扇窗中間的上方）：黑框、白錶面（圖集）、指針指 10 點 10 分
cx, cy, cz = 9.9, 2.78, LZ - 0.02
cyl('L0_clock_rim', MAT['black'], (cx, cy, LZ - 0.005), (cx, cy, LZ - 0.045), 0.18, L0, seg=32)
wquad('L0_clock_face', 'clock', (cx, cy, LZ - 0.047), 0.33, 0.33, '-z', L0)
for nm, th, ln, wd in (('h', -math.radians(55), 0.085, 0.014), ('m', math.radians(60), 0.13, 0.009)):   # th：從 12 點順時針（從正面看）；面向 -z 時「右」是 -x
    dx, dy = -math.sin(th), math.cos(th)
    rbox(f'L0_clock_{nm}', MAT['black'], (cx + dx * ln / 2, cy + dy * ln / 2, LZ - 0.052), (ln, wd, 0.004), L0, rot=(0, 0, math.atan2(dy, dx)))
# 公告欄（東牆、電視南邊）：木框、軟木板、四張公告（圖集），每張微微歪一點
bz0, bz1, by0, by1 = 5.75, 7.15, 1.05, 2.05
rbox('L0_board_frame', MAT['wood'], (EX - 0.015, (by0 + by1) / 2, (bz0 + bz1) / 2), (0.03, by1 - by0, bz1 - bz0), L0, bevel=0.005)
rbox('L0_board_cork', MAT['cork'], (EX - 0.031, (by0 + by1) / 2, (bz0 + bz1) / 2), (0.004, by1 - by0 - 0.08, bz1 - bz0 - 0.08), L0)
for k, (rg, zc, yc, w_, h_, tilt) in enumerate((('rules', 6.02, 1.76, 0.33, 0.466, 0.02), ('club', 6.45, 1.74, 0.33, 0.466, -0.035), ('laundry', 6.88, 1.77, 0.33, 0.466, 0.015), ('lost', 6.3, 1.26, 0.3, 0.282, -0.02))):
    wquad(f'L0_board_p{k}', rg, (EX - 0.036 - k * 0.002, yc, zc), w_, h_, '-x', L0)
    ob = bpy.data.objects[f'L0_board_p{k}']; ob.data.transform(Matrix.Translation(g2b(EX, yc, zc)) @ Matrix.Rotation(tilt, 4, 'X') @ Matrix.Translation(-g2b(EX, yc, zc)))
# 窗簾（南牆兩扇窗，打開收在兩側）：橫桿＋兩片有波浪摺的麻布
def curtain(prefix, xa, xb, zc, y0, y1, folds=5, amp=0.035):
    n = folds * 8; bm = bmesh.new(); top, bot = [], []
    for k in range(n + 1):
        t = k / n; x = xa + (xb - xa) * t; z = zc - amp * math.sin(2 * math.pi * folds * t)
        top.append(bm.verts.new(g2b(x, y1, z))); bot.append(bm.verts.new(g2b(x, y0, z)))
    uv = bm.loops.layers.uv.verify()
    for k in range(n):
        fc = bm.faces.new((bot[k], bot[k + 1], top[k + 1], top[k]))
        for lp, (u, v) in zip(fc.loops, ((k / n, 0), ((k + 1) / n, 0), ((k + 1) / n, 1), (k / n, 1))): lp[uv].uv = (u * (xb - xa) * 1.6, v * (y1 - y0) / 1.2)
    bm.normal_update(); return mesh_obj(prefix, bm, MAT['curtain'], L0)
for k, (a, b) in enumerate(((7.4, 9.4), (10.4, 12.4))):   # 窗台凸出到牆面前 12 cm：窗簾在 16 cm 外，不會插進窗台
    cyl(f'L0_crod_{k}', MAT['steel'], (a - 0.2, 2.64, LZ - 0.16), (b + 0.2, 2.64, LZ - 0.16), 0.012, L0, seg=8)
    for e in (a - 0.2, b + 0.2): rbox(f'L0_crod_{k}_br_{e:.1f}', MAT['steel'], (e, 2.64, LZ - 0.08), (0.02, 0.02, 0.16), L0)
    curtain(f'L0_curtain_{k}_l', a - 0.18, a + 0.18, LZ - 0.16, 0.92, 2.62)
    curtain(f'L0_curtain_{k}_r', b - 0.18, b + 0.18, LZ - 0.16, 0.92, 2.62)
# 地毯（沙發和電視中間；深灰藍、米色滾邊；1.4 cm 厚，不擋路）
rx0, rx1, rz0, rz1, rb = 9.4, 12.6, 3.0, 6.2, 0.08
rbox('L0_rug', MAT['rug'], ((rx0 + rx1) / 2, 0.007, (rz0 + rz1) / 2), (rx1 - rx0 - 2 * rb, 0.014, rz1 - rz0 - 2 * rb), L0)
for nm, (cx_, cz_, sx_, sz_) in (('n', ((rx0 + rx1) / 2, rz0 + rb / 2, rx1 - rx0, rb)), ('s', ((rx0 + rx1) / 2, rz1 - rb / 2, rx1 - rx0, rb)),
                                 ('w', (rx0 + rb / 2, (rz0 + rz1) / 2, rb, rz1 - rz0 - 2 * rb)), ('e', (rx1 - rb / 2, (rz0 + rz1) / 2, rb, rz1 - rz0 - 2 * rb))):
    rbox(f'L0_rug_edge_{nm}', MAT['paper'], (cx_, 0.0075, cz_), (sx_, 0.015, sz_), L0)

# ================================================================ 6c. 走廊、門廳的生活感（DORM-HALL-LM-1028，LAWWW2-C 10-28；使用者 P0「校內建築室內……廉價手遊感」）
# 門上的東西照 dorm_layout.js 各扇門的旁白：101 門縫透出檯燈的光、102「期中考週，請小聲，謝謝。」的紙、103 打電動那一間的海報、104 門把上掛著還沒乾的球鞋、
# 202 社團的貼紙、206「今天不在」的牌子、207 吉他社的傳單、洗衣間的使用須知、舍監室的值班表；字由遊戲顯示（模型裡沒有字，D77）。
# 自己的房門（203）不加東西：大二起換到別的門（dorm3d.js 的 HOMES），203 變成一般關著的門
# 牆上的消防設備：內嵌的消防栓箱（門板只凸出 3 cm）、緊急照明、出口燈——都不擋路，不動導航；地上的拖鞋、球鞋、傘是扁的或靠牆，也不擋路
DOORS = {d['id']: d for d in L['doors']}
def dface(did):
    """門板朝走廊那一面：(x, 樓層高度, 門板面的 z, 朝向（+1＝朝 +z：北側的門）, 父物件)"""
    d = DOORS[did]; y0 = Y1 if d['lv'] else 0.0; P = L1 if d['lv'] else L0
    return (d['x'], y0, CO['z0'] - T / 2 + 0.02, 1, P) if d['side'] == 'N' else (d['x'], y0, CO['z1'] + T / 2 - 0.02, -1, P)
def sheet(name, m, x, y, zs, s, w, h, P, tilt=0.0, dz=0.0):
    """貼在門上的紙、貼紙（4 mm 厚；dz＝再往外疊一層）"""
    rbox(name, MAT[m], (x, y, zs + s * (0.002 + dz)), (w, h, 0.004), P, rot=(0, 0, tilt))
x, y0, zs, s, P = dface('r101')   # 101：門縫透出檯燈的光（門板最下面 1.3 cm 一條暖光，不烘、一直亮）＋淺藍的海報
sheet('L0_d101_poster', 'paper3', x - 0.08, y0 + 1.35, zs, s, 0.3, 0.42, P, 0.015)
quad('L0_d101_gap', MAT['gapglow'], [(x - 0.42, y0 + 0.003, zs + s * 0.003), (x + 0.42, y0 + 0.003, zs + s * 0.003), (x + 0.42, y0 + 0.016, zs + s * 0.003), (x - 0.42, y0 + 0.016, zs + s * 0.003)][::s], P)   # [::s]：朝 −z 的門反過來排（正面朝走廊）
x, y0, zs, s, P = dface('r102')   # 102：「期中考週，請小聲，謝謝。」（A4 白紙、上面兩條膠帶）
sheet('L0_d102_note', 'white', x - 0.05, y0 + 1.42, zs, s, 0.21, 0.297, P, 0.02)
for k, dx in enumerate((-0.09, 0.09)): sheet(f'L0_d102_tape_{k}', 'paper2', x - 0.05 + dx, y0 + 1.56, zs, s, 0.05, 0.018, P, 0.5 if k else -0.5, dz=0.004)
x, y0, zs, s, P = dface('r103')   # 103：裡面在打電動——黑底的遊戲海報（中間一塊藍、一塊紅）
sheet('L0_d103_poster', 'black', x - 0.02, y0 + 1.32, zs, s, 0.42, 0.6, P)
sheet('L0_d103_p1', 'blue', x - 0.08, y0 + 1.4, zs, s, 0.22, 0.26, P, 0.1, dz=0.004)
sheet('L0_d103_p2', 'red', x + 0.08, y0 + 1.16, zs, s, 0.16, 0.12, P, -0.05, dz=0.004)
x, y0, zs, s, P = dface('r104')   # 104：門把上掛著一雙還沒乾的球鞋（鞋帶綁在一起，鞋跟朝上）
kx, kz = x + DOOR_W / 2 - 0.12, zs + s * 0.13   # 門把（door() 的 hx）上、離門板 13 cm
for k, dx in enumerate((-0.055, 0.055)):
    cx = kx + dx; rt = (0.12 * s, 0.0, 0.15 if k else -0.15)
    rbox(f'L0_d104_shoe_{k}', MAT['white'], (cx, y0 + 0.8, kz + s * 0.02), (0.09, 0.26, 0.1), P, rot=rt, bevel=0.025)
    rbox(f'L0_d104_sole_{k}', MAT['rubber'], (cx, y0 + 0.8, kz - s * 0.035), (0.1, 0.28, 0.025), P, rot=rt, bevel=0.008)
    cyl(f'L0_d104_lace_{k}', MAT['white'], (kx, y0 + 1.0, kz), (cx, y0 + 0.93, kz), 0.004, P, seg=4)
x, y0, zs, s, P = dface('r202')   # 202：社團的貼紙（大小、顏色不一）。單獨一塊 L1_deco_r202（join_by_material 不和別的合）：大四住 409＝這一扇門（dorm3d.js 的 HOMES.y4.rep），遊戲那一年把它藏起來，自己的門上不留別人的貼紙
for k, (dx, dy, w_, h_, m, t_) in enumerate(((-0.18, 1.5, 0.1, 0.1, 'red', 0.2), (0.05, 1.62, 0.14, 0.07, 'yellow', -0.1), (0.2, 1.38, 0.08, 0.08, 'green', 0.0),
                                             (-0.05, 1.25, 0.12, 0.05, 'blue', 0.15), (0.12, 1.12, 0.07, 0.07, 'white', -0.3), (-0.22, 1.08, 0.09, 0.06, 'paper2', 0.05))):
    sheet(f'L1_deco_r202_st_{k}', m, x + dx, y0 + dy, zs, s, w_, h_, P, t_)
x, y0, zs, s, P = dface('r206')   # 206：門上掛著「今天不在」的牌子（木牌、兩條掛繩、一個掛勾）
rbox('L1_d206_board', MAT['wood'], (x, y0 + 1.42, zs + s * 0.012), (0.26, 0.12, 0.012), P, rot=(0, 0, 0.03))
for k, dx in enumerate((-0.1, 0.1)): cyl(f'L1_d206_cord_{k}', MAT['black'], (x + dx, y0 + 1.48, zs + s * 0.012), (x, y0 + 1.6, zs + s * 0.008), 0.003, P, seg=4)
rbox('L1_d206_hook', MAT['steel'], (x, y0 + 1.6, zs + s * 0.006), (0.02, 0.02, 0.012), P)
x, y0, zs, s, P = dface('r207'); sheet('L1_d207_flyer', 'paper2', x + 0.08, y0 + 1.4, zs, s, 0.148, 0.21, P, -0.04)   # 207：吉他社的傳單（A5）
x, y0, zs, s, P = dface('laundry')   # 洗衣間：使用須知（A4，上面一條藍邊）
sheet('L0_dl_note', 'paper', x, y0 + 1.45, zs, s, 0.21, 0.297, P)
sheet('L0_dl_note_h', 'blue', x, y0 + 1.57, zs, s, 0.21, 0.04, P, dz=0.004)
x, y0, zs, s, P = dface('warden'); sheet('L0_dw_note', 'paper3', x, y0 + 1.5, zs, s, 0.18, 0.12, P)   # 舍監室：值班時間

def slippers(pre, x, y0, z, P, m):
    for k, dx in enumerate((-0.065, 0.065)): rbox(f'{pre}_{k}', MAT[m], (x + dx, y0 + 0.012, z), (0.1, 0.022, 0.26), P, rot=(0, 0.12 if k else -0.12, 0), bevel=0.008)
slippers('L0_flip_102', DOORS['r102']['x'] + 0.62, 0.0, CO['z0'] + 0.22, L0, 'blue')      # 102 門口的拖鞋
slippers('L1_slip_207', DOORS['r207']['x'] - 0.62, Y1, CO['z1'] - 0.22, L1, 'green')       # 207 門口的拖鞋
for k, dx in enumerate((-0.07, 0.07)):   # 208 門口一雙球鞋
    rbox(f'L1_sneak_208_{k}', MAT['white'], (DOORS['r208']['x'] - 0.68 + dx, Y1 + 0.045, CO['z1'] - 0.2), (0.1, 0.09, 0.27), L1, rot=(0, 0.15 if k else -0.15, 0), bevel=0.025)
ux = DOORS['r205']['x'] - 0.72   # 205 門邊靠牆的一把傘（收起來、深藍）
cyl('L1_umb_205', MAT['navy'], (ux, Y1 + 0.02, CO['z1'] - 0.2), (ux + 0.04, Y1 + 0.9, CO['z1'] - 0.035), 0.035, L1, seg=8, r2=0.012)
cyl('L1_umb_205_h', MAT['black'], (ux + 0.04, Y1 + 0.9, CO['z1'] - 0.035), (ux + 0.04, Y1 + 0.99, CO['z1'] - 0.035), 0.012, L1, seg=6)

def hydrant(pre, x, y0, zw, s, P):
    """消防栓箱：內嵌在牆裡，紅色門板只凸出 3 cm（不擋路）；兩扇門的縫、白色名牌（沒有字），上面紅色警示燈、警鈴"""
    rbox(pre + '_box', MAT['red'], (x, y0 + 0.95, zw + s * 0.015), (0.75, 1.2, 0.03), P, bevel=0.006)
    rbox(pre + '_seam', MAT['black'], (x, y0 + 0.95, zw + s * 0.031), (0.006, 1.12, 0.002), P)
    rbox(pre + '_plate', MAT['white'], (x, y0 + 1.36, zw + s * 0.031), (0.34, 0.09, 0.002), P)
    cyl(pre + '_lamp', MAT['red'], (x - 0.16, y0 + 1.72, zw), (x - 0.16, y0 + 1.72, zw + s * 0.05), 0.05, P, seg=12)
    cyl(pre + '_bell', MAT['red'], (x + 0.16, y0 + 1.72, zw), (x + 0.16, y0 + 1.72, zw + s * 0.04), 0.075, P, seg=14)
hydrant('L0_hyd', -8.0, 0.0, CO['z0'], 1, L0); hydrant('L1_hyd', -8.0, Y1, CO['z0'], 1, L1)   # 101、102（201、202）兩扇門中間的北牆
def emlight(pre, x, y, zw, s, P):
    """緊急照明燈：白色燈箱、兩個圓燈頭（平常不亮）"""
    rbox(pre + '_box', MAT['white'], (x, y, zw + s * 0.04), (0.34, 0.1, 0.08), P, bevel=0.01)
    for k, dx in enumerate((-0.1, 0.1)): cyl(f'{pre}_head_{k}', MAT['white'], (x + dx, y - 0.04, zw + s * 0.06), (x + dx, y - 0.1, zw + s * 0.1), 0.032, P, seg=10)
emlight('L0_em_w', -8.0, 2.75, CO['z0'], 1, L0); emlight('L0_em_e', 8.3, 2.75, CO['z0'], 1, L0)
emlight('L1_em_w', -8.0, Y1 + 2.75, CO['z0'], 1, L1); emlight('L1_em_e', 8.3, Y1 + 2.75, CO['z1'], -1, L1)
def exitsign(pre, x, y, z, nrm, P, props=None):
    """出口標示燈（綠色燈箱＋發光面；發光面不烘、一直亮）：nrm＝朝向（'+z'、'-z'、'+x'、'-x'）"""
    sg = 1 if nrm[0] == '+' else -1
    if nrm[1] == 'z':
        box(pre + '_box', MAT['exitg'], x - 0.2, x + 0.2, y - 0.09, y + 0.09, z, z + sg * 0.07, P, props=props)
        box(pre + '_glow', MAT['exitglow'], x - 0.17, x + 0.17, y - 0.07, y + 0.07, z + sg * 0.07, z + sg * 0.075, P, props=props)
    else:
        box(pre + '_box', MAT['exitg'], x, x + sg * 0.07, y - 0.09, y + 0.09, z - 0.2, z + 0.2, P, props=props)
        box(pre + '_glow', MAT['exitglow'], x + sg * 0.07, x + sg * 0.075, y - 0.07, y + 0.07, z - 0.17, z + 0.17, P, props=props)
exitsign('L0_exit_WALL_main', 0.0, 2.72, LB['z1'], '-z', L0, props={'dir': [0, 0, -1]})   # 大門上方（名字含 WALL_、dir 和前牆一樣：跟著前牆淡出）
exitsign('L0_exit_WALL_side', CO['x1'], 2.37, 0.0, '-x', L0, props={'dir': [-1, 0, 0]})    # 東邊側門上方（跟著東牆淡出）
exitsign('L1_exit_stair', 0.0, RY - 0.24, CO['z0'], '+z', L1)                              # 二樓樓梯口的樑上

# 只在烘焙時擋光的板子（--bakeblock；bake_dorm_hall.sh 的 --nolm、--drop 都有 BAKEONLY，不分光照貼圖、輸出前刪掉）：
# 四面都有窗（走廊兩端、南面門廳和交誼廳、樓梯平台北窗），外殼不能包；舍監室、洗衣間那一塊沒做模型，南邊、西邊直接是天空——
# 天光會從舍監室窗口（玻璃烘焙時不算）照進門廳。擋住它的南邊、西邊（舍監室裡面的燈另外在 bake_dorm_hall.sh 加一盞）
if '--bakeblock' in sys.argv:
    MAT['bakeonly'] = pbr('dm_bakeonly', None, tint=srgb('#202020'), rough=1.0)
    box('BAKEONLY_wardenS', MAT['bakeonly'], CO['x0'] - 0.3, LB['x0'], -0.2, H0 + 0.1, LB['z1'] + 0.05, LB['z1'] + 0.25, root)
    box('BAKEONLY_wardenW', MAT['bakeonly'], CO['x0'] - 0.3, CO['x0'] - 0.1, -0.2, H0 + 0.1, CO['z1'] + 0.1, LB['z1'] + 0.25, root)

# ---------------- 同一層、同材質的物件合併（減少 draw call；外牆照方向分組：一起淡出）----------------
def flatten(level_root):
    for g in [o for o in level_root.children if o.type == 'EMPTY']:
        for ch in list(g.children):
            mw = ch.matrix_world.copy(); ch.parent = level_root; ch.matrix_world = mw
            if ch.type == 'MESH':
                ch.data.transform(ch.matrix_basis); ch.matrix_basis.identity()
        bpy.data.objects.remove(g)
    for ch in level_root.children:
        if ch.type == 'MESH' and (ch.location.length > 1e-6 or any(abs(v) > 1e-6 for v in ch.rotation_euler)):
            ch.data.transform(ch.matrix_basis); ch.matrix_basis.identity()

_HN = {(0, 0, -1): 'N', (0, 0, 1): 'S', (1, 0, 0): 'E', (-1, 0, 0): 'W', (0, 1, 0): 'U', (0, -1, 0): 'D'}
def join_by_material(level_root, prefix):
    """同一層、同材質合成一個網格；光照烘焙的 lm（光照貼圖分多少）、lmhide（哪個方向的面看不到）不同的分開合，合完照樣帶著（DORM-HALL-LM-1028）。
    {prefix}_deco_<門的 id>_ 開頭的（某一扇門上的東西）自己合成一塊 {prefix}_deco_<id>_<材質>：遊戲照年級藏起來（dorm3d.js）"""
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH': continue
        lm = ob.get('lm'); lh = ob.get('lmhide'); lh = None if lh is None else (lh if isinstance(lh, str) else tuple(int(round(v)) for v in lh))
        dm = re.match(prefix + r'_deco_([A-Za-z0-9]+)_', ob.name)
        if dm:
            groups.setdefault(('deco_' + dm.group(1), ob.data.materials[0].name, lm, lh), []).append(ob); continue
        if 'WALL_' in ob.name:
            dv = ob.get('dir'); dv = list(dv) if dv is not None else [0, 0, 1]
            groups.setdefault(('wall' + ''.join('%+d' % round(v) for v in dv), ob.data.materials[0].name, lm, lh), []).append(ob); ob['fadedir'] = dv; continue
        groups.setdefault((None, ob.data.materials[0].name, lm, lh), []).append(ob)
    for (fg, mname, lm, lh), obs in groups.items():
        if len(obs) < 2 and not fg: continue
        wall = bool(fg) and fg.startswith('wall')
        dirv = list(obs[0]['fadedir']) if wall else None
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        pr = dict({'dir': dirv} if wall else {}, **({'lm': lm} if lm is not None else {}), **({'lmhide': lh if isinstance(lh, str) else list(lh)} if lh is not None else {}))
        nm = (f'{prefix}_WALL_{fg}_{mname}' if wall else f'{prefix}_{fg}_{mname}' if fg else f'{prefix}_{mname}') + (f'_lm{lm:g}' if lm is not None else '') + (f'_h{lh.replace(",", "") if isinstance(lh, str) else _HN.get(lh, "x")}' if lh is not None else '')
        mesh_obj(nm, bm, mat, level_root, props=pr or None)
bpy.context.view_layer.update()
# 純色的小東西合成一個頂點色材質（和霖澤館大廳 LOBBY-VC-1028 一樣：每個材質各畫一次；發光、金屬、有貼圖的照舊）
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'env_second'))
import lib2 as L2   # noqa: E402
_VC = L2.vc_material('dm_vc', rough=0.7)
L2.vc_consolidate(root, {MAT[k].name: _VC for k in ('red', 'blue', 'yellow', 'green', 'white', 'rubber', 'paper', 'paper2', 'paper3', 'cork', 'navy', 'exitg')})
for r_, pre in ((L0, 'L0'), (L1, 'L1')): flatten(r_); join_by_material(r_, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        mn = ob.data.materials[0].name
        sm = mn.startswith(('dm_leaf_dark', 'dm_leaf_mid') + SMOOTH_MATS)
        for p in ob.data.polygons: p.use_smooth = sm
        if mn.startswith(SMOOTH_MATS): ob.data.set_sharp_from_angle(angle=math.radians(40))   # 沙發的圓角、窗簾的摺：平滑，但方塊的直角保持硬邊
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
    for (x, y, z, e) in ((-8, 2.9, 0, 250), (0, 2.9, 0, 250), (8, 2.9, 3, 300), (0, 2.9, 5, 250), (-8, 6.5, 0, 250), (0, 6.5, 0, 250), (8, 6.5, 0, 250), (0, 5.2, -4, 200)):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.location = g2b(x, y, z); scene.collection.objects.link(lt)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam; cam.data.lens = 16
    VW = (('lobby_from_door', (0.0, 1.6, 7.2), (0.0, 1.4, -3.0)), ('corridor_1f', (-12.5, 1.6, 0.6), (6.0, 1.3, -0.4)), ('lounge', (3.6, 1.7, 7.2), (12.0, 1.1, 2.4)),
          ('stair_from_corridor', (-1.2, 1.6, 1.2), (-1.2, 2.2, -5.5)), ('corridor_2f', (12.5, Y1 + 1.6, 0.5), (-4.0, Y1 + 1.2, -0.4)))
    for name, eye, look in VW:
        if VIEWS and name not in VIEWS.split(','): continue
        cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(RENDER, f'blender_dorm_{name}.png'); bpy.ops.render.render(write_still=True); print('render', scene.render.filepath)
