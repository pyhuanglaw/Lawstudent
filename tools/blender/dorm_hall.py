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
    'fabric':  pbr('dm_fabric', 'fabric_leather_02', tile=1.0, sat=0.4, target='#6a6455'),                  # 交誼廳的沙發
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

root = group('DormHall')
L0 = group('L0_root', root); L1 = group('L1_root', root)

# ---------------- 有開口的牆：沿 x（z 固定）或沿 z（x 固定），開口＝[(a,b,ya,yb)]；外牆叫 WALL_（淡出），走廊的牆不叫 ----------------
_wk = [0]
def wall_cut(prefix, parent, axis, at, a0, a1, y0, y1, holes, mat, dirv=None, th=None):
    th = th or T; holes = sorted(holes); cur = a0
    def piece(pa, pb, ya, yb):
        if pb - pa < 0.01 or yb - ya < 0.01: return
        _wk[0] += 1; nm = f'{prefix}_{"WALL_" if dirv else "iw_"}{_wk[0]}'; pr = {'dir': dirv} if dirv else None
        if axis == 'z': box(nm, mat, at - th / 2, at + th / 2, ya, yb, pa, pb, parent, props=pr)
        else: box(nm, mat, pa, pb, ya, yb, at - th / 2, at + th / 2, parent, props=pr)
    for (ha, hb, hy0, hy1) in holes:
        if hb <= a0 or ha >= a1: continue
        piece(cur, ha, y0, y1); piece(ha, hb, y0, min(y1, max(y0, hy0))); piece(ha, hb, max(y0, min(y1, hy1)), y1); cur = hb   # 開口在這一段的上面或下面：整段照畫，不超出 y0～y1（原本會長出這一段以外的牆，和另一段疊在一起閃：樓梯井北牆的腰牆疊到白牆，BUG-COPLANAR-DEV）
    piece(cur, a1, y0, y1)

def dado_wall(prefix, parent, axis, at, a0, a1, y0, h, holes, dirv=None):
    """一道牆：下面 1.1 m 淺灰綠油漆腰牆、上面白牆（兩段各自挖洞）"""
    wall_cut(prefix + '_lo', parent, axis, at, a0, a1, y0, y0 + 1.1, holes, MAT['dado'], dirv)
    wall_cut(prefix + '_hi', parent, axis, at, a0, a1, y0 + 1.1, y0 + h, holes, MAT['plaster'], dirv)

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
box('L0_floor', MAT['floor'], CO['x0'], CO['x1'], -0.1, 0.0, CO['z0'], LB['z1'], L0)
box('L1_floor', MAT['floor'], CO['x0'], CO['x1'], Y1 - ST, Y1, CO['z0'], CO['z1'], L1)
box('L1_slab_south', MAT['plaster'], CO['x0'], CO['x1'], Y1 - ST, Y1 - 0.02, CO['z1'], LB['z1'], L1)   # 一樓門廳、交誼廳上方的樓板（二樓的寢室，看不到上面）
HC = H0 - 0.01   # 一樓天花板比樓板底面低 1 cm：原本和二樓樓板（L1_floor、L1_slab_south）的底面同高，從一樓往上看會閃（BUG-COPLANAR-DEV，tools/glb_coplanar.py）
quad('L0_ceiling', MAT['ceiling'], [(CO['x0'], HC, CO['z0']), (CO['x1'], HC, CO['z0']), (CO['x1'], HC, LB['z1']), (CO['x0'], HC, LB['z1'])], L0)
quad('L1_ceiling', MAT['ceiling'], [(CO['x0'], RY, CO['z0']), (CO['x1'], RY, CO['z0']), (CO['x1'], RY, CO['z1']), (CO['x0'], RY, CO['z1'])], L1)
quad('L1_ceiling_well', MAT['ceiling'], [(WL['x0'], RY, WL['z0']), (WL['x1'], RY, WL['z0']), (WL['x1'], RY, WL['z1']), (WL['x0'], RY, WL['z1'])], L1)
def tube(prefix, parent, x, y, z, along='x'):
    w, d = (1.25, 0.16) if along == 'x' else (0.16, 1.25)
    box(f'{prefix}_fix', MAT['fixture'], x - w / 2, x + w / 2, y - 0.06, y, z - d / 2, z + d / 2, parent)
    box(f'{prefix}_tube', MAT['tube'], x - w / 2 + 0.05, x + w / 2 - 0.05, y - 0.085, y - 0.06, z - 0.03, z + 0.03, parent) if along == 'x' else box(f'{prefix}_tube', MAT['tube'], x - 0.03, x + 0.03, y - 0.085, y - 0.06, z - d / 2 + 0.05, z + d / 2 - 0.05, parent)
for i, x in enumerate([-12, -9, -6, -3, 0, 3, 6, 9, 12]):
    tube(f'L0_t{i}', L0, x, H0, 0.0); tube(f'L1_t{i}', L1, x, RY, 0.0)
for i, (x, z) in enumerate([(0, 4.5), (5, 3.5), (9, 4.5), (12, 3.0), (5, 6.2), (9, 6.6)]): tube(f'L0_tl{i}', L0, x, H0, z)
tube('L1_tw', L1, 0.0, RY, (WL['z0'] + WL['z1']) / 2, 'z')

# ================================================================ 2. 牆（走廊兩側＝內牆；兩端、門廳正面、樓梯間北牆＝外牆，淡出）
# 一樓
dado_wall('L0_N_w', L0, 'x', CO['z0'] - T / 2, CO['x0'], WL['x0'], 0, H0, door_holes(0, 'N', 0))
dado_wall('L0_N_e', L0, 'x', CO['z0'] - T / 2, MW['x0'], CO['x1'], 0, H0, door_holes(0, 'N', 0))
dado_wall('L0_S_w', L0, 'x', CO['z1'] + T / 2, CO['x0'], LB['x0'], 0, H0, door_holes(0, 'S', 0))
dado_wall('L0_lobbyW', L0, 'z', LB['x0'] - T / 2, CO['z1'], LB['z1'], 0, H0, [(2.4, 4.0, 1.05, 2.05)])          # 門廳西牆（舍監室窗口）
dado_wall('L0_front', L0, 'x', LB['z1'] + T / 2, LB['x0'], LG['x1'], 0, H0, [(-1.0, 1.0, 0, 2.5), (7.4, 9.4, 1.0, 2.5), (10.4, 12.4, 1.0, 2.5)], dirv=[0, 0, -1])
dado_wall('L0_endW', L0, 'z', CO['x0'] - T / 2, CO['z0'], CO['z1'], 0, H0, [(-0.8, 0.8, 1.0, 2.5)], dirv=[1, 0, 0])
dado_wall('L0_endE', L0, 'z', CO['x1'] + T / 2, CO['z0'], LB['z1'], 0, H0, [(-0.5, 0.5, 0, DOOR_H + 0.05)], dirv=[-1, 0, 0])
# 樓梯間：東西兩側的牆（到屋頂）、北牆（平台的窗；外牆）
# 二樓那段停在二樓走廊北牆的背面（原本一路到 z −1.4，和二樓走廊北牆的牆頭疊在一起：上樓梯時看得到一條白牆、灰綠腰牆交替閃，BUG-COPLANAR-DEV）
for nm, x in (('wellW', WL['x0'] - T / 2), ('wellE', WL['x1'] + T / 2)):
    dado_wall('L0_' + nm, L0, 'z', x, WL['z0'], WL['z1'], 0, Y1, [])
    wall_cut('L0_' + nm + '_up', L0, 'z', x, WL['z0'], CO['z0'] - T, Y1, RY, [], MAT['plaster'])
dado_wall('L0_wellN', L0, 'x', WL['z0'] - T / 2, WL['x0'] - T, WL['x1'] + T, 0, RY, [(-0.9, 0.9, LD['y'] + 0.9, LD['y'] + 2.4)], dirv=[0, 0, 1])
# 二樓
dado_wall('L1_N_w', L1, 'x', CO['z0'] - T / 2, CO['x0'], WL['x0'], Y1, RY - Y1, door_holes(1, 'N', Y1))
dado_wall('L1_N_e', L1, 'x', CO['z0'] - T / 2, WL['x1'], CO['x1'], Y1, RY - Y1, door_holes(1, 'N', Y1))
dado_wall('L1_S', L1, 'x', CO['z1'] + T / 2, CO['x0'], CO['x1'], Y1, RY - Y1, door_holes(1, 'S', Y1))
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
        box(f'L0_gate_frame_{xa:.2f}_{ya:.1f}', MAT['frame'], xa, xb, ya, yb, zf - 0.05, zf + 0.05, L0)
    quad(f'L0_gate_glass_{a:.0f}', MAT['glass'], [(a, 0.12, zf), (b, 0.12, zf), (b, 2.43, zf), (a, 2.43, zf)], L0, tile=1.0)
    cyl(f'L0_gate_handle_{a:.0f}', MAT['steel'], (b - 0.14 if a < 0 else a + 0.14, 0.8, zf - 0.08), (b - 0.14 if a < 0 else a + 0.14, 1.3, zf - 0.08), 0.015, L0, seg=8)
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
for k in range(A['risers']):
    top = (k + 1) * R; z1 = A['z1'] - k * TR
    box(f'L0_A_step_{k}', MAT['stair'], AX0, AX1, 0.0, top, z1 - TR, z1, L0, bevel=0.008)   # A 跑：每一階實心到地面
    box(f'L0_A_nose_{k}', MAT['nosing'], AX0 + 0.05, AX1 - 0.05, top - 0.004, top + 0.004, z1 - 0.07, z1 - 0.02, L0)
box('L0_landing', MAT['stair'], AX0, BX1, 0.0, LD['y'], LD['z0'], LD['z1'], L0)
for k in range(B['risers']):
    top = LD['y'] + (k + 1) * R; z0 = B['z0'] + k * TR
    box(f'L0_B_step_{k}', MAT['stair'], BX0, BX1, top - R - 0.02, top, z0, z0 + TR, L0, bevel=0.008)
    box(f'L0_B_nose_{k}', MAT['nosing'], BX0 + 0.05, BX1 - 0.05, top - 0.004, top + 0.004, z0 + 0.02, z0 + 0.07, L0)
slab_tilted('L0_B_slab', MAT['plaster'], BX0, BX1, B['z0'], LD['y'] - 0.02, B['z1'], Y1 - 0.02, 0.24, L0)
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
    g = group(prefix, parent); g.location = g2b(x, y, z); g.rotation_euler = (0, 0, yaw)
    box(prefix + '_seat', MAT['wood'], -0.22, 0.22, 0.43, 0.47, -0.21, 0.21, g)
    box(prefix + '_back', MAT['wood'], -0.21, 0.21, 0.5, 0.85, -0.23, -0.2, g)
    for (lx, lz) in ((-0.19, -0.18), (0.19, -0.18), (-0.19, 0.18), (0.19, 0.18)): box(f'{prefix}_leg_{lx}_{lz}', MAT['frame'], lx - 0.015, lx + 0.015, 0.0, 0.43, lz - 0.015, lz + 0.015, g)
    return g

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
    elif t == 'sofa':
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_base', MAT['fabric'], -1.1, 1.1, 0.08, 0.3, -0.43, 0.43, g, bevel=0.02)
        for sx in (-0.49, 0.49): box(f'{pre}_cush_{sx}', MAT['fabric'], sx - 0.48, sx + 0.48, 0.3, 0.44, -0.25, 0.41, g, bevel=0.03)
        box(pre + '_back', MAT['fabric'], -1.0, 1.0, 0.3, 0.82, -0.43, -0.23, g, bevel=0.03)
        for sx in (-1, 1): box(f'{pre}_arm_{sx}', MAT['fabric'], sx * 1.02 - 0.08, sx * 1.02 + 0.08, 0.26, 0.6, -0.43, 0.43, g, bevel=0.02)
        for (lx, lz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): box(f'{pre}_leg_{lx}_{lz}', MAT['frame'], lx * 1.0 - 0.03, lx * 1.0 + 0.03, 0.0, 0.08, lz * 0.36 - 0.03, lz * 0.36 + 0.03, g)
    elif t == 'coffeeTable':
        box(pre + '_top', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y + 0.38, y + 0.42, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        for (lx, lz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): box(f'{pre}_leg_{lx}_{lz}', MAT['frame'], f['x'] + lx * (f['w'] / 2 - 0.06) - 0.02, f['x'] + lx * (f['w'] / 2 - 0.06) + 0.02, y, y + 0.38, f['z'] + lz * (f['d'] / 2 - 0.06) - 0.02, f['z'] + lz * (f['d'] / 2 - 0.06) + 0.02, P)
        box(pre + '_mag', MAT['paper3'], f['x'] - 0.12, f['x'] + 0.1, y + 0.42, y + 0.425, f['z'] - 0.2, f['z'] + 0.12, P)
    elif t == 'tv':   # 電視（掛牆）＋電視櫃
        box(pre + '_panel', MAT['black'], f['x'] - 0.04, f['x'] + 0.04, y + 1.15, y + 2.05, f['z'] - f['w'] / 2, f['z'] + f['w'] / 2, P)
        box(pre + '_screen', MAT['screen'], f['x'] - 0.046, f['x'] - 0.04, y + 1.19, y + 2.01, f['z'] - f['w'] / 2 + 0.04, f['z'] + f['w'] / 2 - 0.04, P)
        box(pre + '_cab', MAT['wood'], f['x'] - 0.4, f['x'] + 0.1, y, y + 0.48, f['z'] - 0.75, f['z'] + 0.75, P, bevel=0.01)
    elif t == 'vending':   # 自動販賣機：機身、展示窗（一排一排的飲料）、投幣口、取物口
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_body', MAT['vend'], -0.5, 0.5, 0.0, 1.85, -0.37, 0.37, g, bevel=0.02)
        box(pre + '_win', MAT['white'], -0.42, 0.22, 0.62, 1.75, 0.37, 0.38, g)
        cols = ['red', 'blue', 'yellow', 'green', 'white', 'red']
        for j in range(4):
            for i in range(6): box(f'{pre}_can_{i}_{j}', MAT[cols[(i + j) % 6]], -0.38 + i * 0.1, -0.31 + i * 0.1, 0.68 + j * 0.27, 0.86 + j * 0.27, 0.38, 0.4, g)
            box(f'{pre}_btnrow_{j}', MAT['frame'], -0.4, 0.2, 0.64 + j * 0.27, 0.66 + j * 0.27, 0.38, 0.4, g)
        box(pre + '_coin', MAT['frame'], 0.28, 0.42, 0.95, 1.25, 0.37, 0.39, g); box(pre + '_slot', MAT['black'], -0.35, 0.15, 0.18, 0.36, 0.37, 0.39, g)
    elif t == 'water':   # 飲水機
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_body', MAT['white'], -0.2, 0.2, 0.0, 1.25, -0.2, 0.2, g, bevel=0.02)
        box(pre + '_tray', MAT['frame'], -0.16, 0.16, 0.62, 0.66, 0.14, 0.26, g)
        for k, c in enumerate(('red', 'blue', 'white')): box(f'{pre}_tap_{k}', MAT[c], -0.12 + k * 0.1, -0.08 + k * 0.1, 0.92, 0.98, 0.2, 0.24, g)
    elif t == 'longTable':
        box(pre + '_top', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y + 0.72, y + 0.76, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        for (lx, lz) in ((-1, -1), (1, -1), (-1, 1), (1, 1)): box(f'{pre}_leg_{lx}_{lz}', MAT['frame'], f['x'] + lx * (f['w'] / 2 - 0.1) - 0.025, f['x'] + lx * (f['w'] / 2 - 0.1) + 0.025, y, y + 0.72, f['z'] + lz * (f['d'] / 2 - 0.1) - 0.025, f['z'] + lz * (f['d'] / 2 - 0.1) + 0.025, P)
        n = f.get('seats', 2)
        for k in range(n):
            sx = f['x'] - f['w'] / 2 + f['w'] * (k + 0.5) / n
            for s in (-1, 1): chair(f'{pre}_ch_{k}_{s}', P, sx, y, f['z'] + s * (f['d'] / 2 + 0.38), math.pi if s > 0 else 0.0)
        box(pre + '_book', MAT['blue'], f['x'] - 0.5, f['x'] - 0.2, y + 0.76, y + 0.79, f['z'] - 0.12, f['z'] + 0.1, P)
    elif t == 'planter':
        PL.potted(mesh_obj, PM, pre, P, f['x'], y + 0.5, f['z'], f['r'], seed=601 + i, h=1.1)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=f['r'] * 0.85, radius2=f['r'], depth=0.5)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.25, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(pre + '_pot', bm, MAT['stair'], P)
    elif t == 'bench':
        g = group(pre, P); g.location = g2b(f['x'], y, f['z']); g.rotation_euler = (0, 0, ry)
        box(pre + '_seat', MAT['wood'], -f['w'] / 2, f['w'] / 2, 0.42, 0.46, -f['d'] / 2, f['d'] / 2, g, bevel=0.01)
        for sx in (-1, 1): box(f'{pre}_leg_{sx}', MAT['steel'], sx * (f['w'] / 2 - 0.12) - 0.025, sx * (f['w'] / 2 - 0.12) + 0.025, 0.0, 0.42, -f['d'] * 0.45, f['d'] * 0.45, g)

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

def join_by_material(level_root, prefix):
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH': continue
        if 'WALL_' in ob.name:
            dv = ob.get('dir'); dv = list(dv) if dv is not None else [0, 0, 1]
            groups.setdefault(('wall' + ''.join('%+d' % round(v) for v in dv), ob.data.materials[0].name), []).append(ob); ob['fadedir'] = dv; continue
        groups.setdefault((None, ob.data.materials[0].name), []).append(ob)
    for (fg, mname), obs in groups.items():
        if len(obs) < 2 and not fg: continue
        dirv = list(obs[0]['fadedir']) if fg else None
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        mesh_obj(f'{prefix}_WALL_{fg}_{mname}' if fg else f'{prefix}_{mname}', bm, mat, level_root, props={'dir': dirv} if fg else None)
bpy.context.view_layer.update()
for r_, pre in ((L0, 'L0'), (L1, 'L1')): flatten(r_); join_by_material(r_, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        sm = ob.data.materials[0].name.startswith(('dm_leaf_dark', 'dm_leaf_mid'))
        for p in ob.data.polygons: p.use_smooth = sm
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
