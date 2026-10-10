"""霖澤館室內（一樓大廳、直跑樓梯、二樓迴廊）正式模型：Blender 5.2 bpy 無介面執行 → GLB（WebP 貼圖）。
配置讀 src/data/linze_layout.js（遊戲的導航、互動點讀同一份，兩邊一定對得上）。貼圖：Poly Haven CC0（tools/blender/fetch_polyhaven.py 下載）。
節點命名約定（src/building3d.js 的 attachFormal 照這個分組）：
  L0_*：一樓（玩家在一樓、鏡頭高過二樓地板時，二樓會藏起來，一樓一定顯示）；L1_*：二樓；
  名字含 WALL_ 的是外牆（擋住鏡頭時淡出），自訂屬性 dir＝往室內的法線（遊戲座標 [x,y,z]）。
  不做：電梯（遊戲裡程序化、要動）、門牌與樓層簡介的字（遊戲用 canvas 畫，中文字型）、窗外的景、點地面用的透明地板。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)（glTF 匯出 +Y up 會轉回去）。
用法：/opt/blenv/bin/python tools/blender/linze_interior.py [--out assets/models/env/linze_interior.glb] [--tex 512] [--render 輸出資料夾]
"""
import bpy, bmesh, json, math, os, re, sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEX = os.path.join(ROOT, 'tools', 'blender', 'textures')
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/linze_interior.glb'))
TEXRES = int(arg('--tex', '512'))
RENDER = arg('--render')

src = open(os.path.join(ROOT, 'src/data/linze_layout.js'), encoding='utf8').read()
L = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, Y1, RY, T = L['W'], L['D'], L['floors'][1]['y'], L['roofY'], L['wallT']
S, G, EL = L['stair'], L['gallery'], L['elevator']

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def g2b(x, y, z): return Vector((x, -z, y))

# ---------------- 材質 ----------------
_imgs = {}
def img(path):
    if path not in _imgs:
        im = bpy.data.images.load(path)
        if TEXRES and max(im.size) > TEXRES: im.scale(TEXRES, TEXRES)
        _imgs[path] = im
    return _imgs[path]

def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = metal
    m['tile'] = tile
    if pid:
        base = os.path.join(TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = img(base + '_diff_1k.jpg')
        if tint:
            mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
            Lk.new(tc.outputs['Color'], mix.inputs[6]); mix.inputs[7].default_value = (*tint, 1.0); Lk.new(mix.outputs[2], bsdf.inputs['Base Color'])
        else:
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
    'floor':   pbr('stone_floor', 'large_floor_tiles_02', tile=1.2, tint=srgb('#e9e7e2')),        # 照片：穿堂與大廳的灰色石材地磚
    'granite': pbr('granite_panel', 'large_floor_tiles_02', tile=2.4, tint=srgb('#f2f0eb')),      # 牆面的花崗石板（大片）
    'step':    pbr('granite_step', 'large_floor_tiles_02', tile=0.9, tint=srgb('#d6d4cf')),
    'plaster': pbr('plaster', 'painted_plaster_wall', tile=2.5, tint=srgb('#f6f4ef')),
    'ceiling': pbr('ceiling', 'ceiling_interior', tile=2.0, tint=srgb('#ffffff'), normal=0.3),
    'wood':    pbr('wood', 'fine_grained_wood', tile=1.6, tint=srgb('#c9a27a')),
    'woodD':   pbr('wood_dark', 'fine_grained_wood', tile=1.6, tint=srgb('#8a7060')),
    'leather': pbr('leather', 'fabric_leather_02', tile=1.0, tint=srgb('#6b7480')),             # 灰藍色皮沙發
    'steel':   pbr('steel', None, tint=srgb('#c9ccd0'), rough=0.28, metal=0.45),   # 遊戲沒有環境貼圖：金屬度太高會發黑
    'frame':   pbr('frame', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35),
    'glass':   pbr('glass', None, tint=srgb('#c4d6dc'), rough=0.05, alpha=0.22),
    'light':   pbr('light_panel', None, tint=srgb('#fff6e4'), rough=0.9, emit=srgb('#fff4dc')),
    'plant':   pbr('plant', None, tint=srgb('#4f7a46'), rough=0.85),
    'soil':    pbr('soil', None, tint=srgb('#4a3a2c'), rough=0.95),
}

# ---------------- 幾何 ----------------
def box_uv(bm, tile):
    """世界座標的盒狀投影 UV（每公尺 1/tile 個重複；每個面依法線選投影平面）"""
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
    """遊戲座標的軸對齊方塊（x0..x1, y0..y1, z0..z1）"""
    bm = bmesh.new()
    a, b = g2b(min(x0, x1), min(y0, y1), max(z0, z1)), g2b(max(x0, x1), max(y0, y1), min(z0, z1))
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((a.x if v.co.x < 0 else b.x, a.y if v.co.y < 0 else b.y, a.z if v.co.z < 0 else b.z))
    if bevel > 0: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    bm.normal_update(); box_uv(bm, mat['tile'] if 'tile' in mat else 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def quad(name, mat, pts, parent=None, tile=None):
    """四個遊戲座標的點 → 一個面（逆時針＝正面）"""
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in pts]; bm.faces.new(vs); bm.normal_update(); box_uv(bm, tile or mat.get('tile', 1.0))
    return mesh_obj(name, bm, mat, parent)

def cyl(name, mat, a, b, r, parent=None, seg=10):
    """兩個遊戲座標點之間的圓管（扶手）"""
    pa, pb = g2b(*a), g2b(*b); d = pb - pa; L_ = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=L_)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot.to_matrix()); bmesh.ops.translate(bm, verts=bm.verts, vec=(pa + pb) / 2)
    bm.normal_update(); box_uv(bm, 1.0)
    return mesh_obj(name, bm, mat, parent)

def group(name, parent=None, props=None):
    ob = bpy.data.objects.new(name, None); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob

root = group('LinzeInterior')
L0 = group('L0_root', root); L1 = group('L1_root', root)

# ---------------- 地板、樓板、天花板 ----------------
box('L0_floor', MAT['floor'], -W / 2, W / 2, -0.25, 0.0, -D / 2, D / 2, L0)
gz0, gz1 = -D / 2, G['z1']
box('L1_slab', MAT['plaster'], -W / 2, W / 2, Y1 - G['slabT'], Y1 - 0.02, gz0, gz1, L1)            # 二樓樓板（下面是一樓北側的天花板）
box('L1_floor', MAT['floor'], -W / 2, W / 2, Y1 - 0.02, Y1, gz0, gz1, L1)
box('L1_slab_edge', MAT['granite'], -W / 2, W / 2, Y1 - G['slabT'] - 0.05, Y1 + 0.02, gz1 - 0.02, gz1 + 0.06, L1, bevel=0.01)   # 樓板邊緣的石材收邊
# 天花板（中庭頂、二樓天花板）：單面朝下＋燈板
quad('L1_ceiling', MAT['ceiling'], [(-W / 2, RY, -D / 2), (W / 2, RY, -D / 2), (W / 2, RY, D / 2), (-W / 2, RY, D / 2)], L1)
for i in range(4):
    for j in range(3):
        cx, cz = -6 + i * 4, -4 + j * 4.6
        quad(f'L1_light_{i}_{j}', MAT['light'], [(cx - 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz + 0.3), (cx - 0.6, RY - 0.01, cz + 0.3)], L1)
for i in range(5):
    for z in (-6.0, -4.4):
        x = -6 + i * 3
        quad(f'L1_downlight_{i}_{z}', MAT['light'], [(x - 0.14, Y1 - G['slabT'] - 0.005, z - 0.14), (x + 0.14, Y1 - G['slabT'] - 0.005, z - 0.14), (x + 0.14, Y1 - G['slabT'] - 0.005, z + 0.14), (x - 0.14, Y1 - G['slabT'] - 0.005, z + 0.14)], L1)

# ---------------- 外牆（北：花崗石＋門洞；西：粉光牆；東：一樓玻璃門面、二樓石材；南：兩層樓玻璃帷幕）----------------
def wall_with_doors(prefix, parent, z, y0, y1, doors, lvl):
    """北牆一段（y0..y1），門洞寬 1.5 高 2.6；牆下段 1.2 m 花崗石、上面粉光"""
    xs = sorted(d['x'] for d in doors if d['lv'] == lvl)
    cuts = [(-W / 2, None)]; segs = []; x = -W / 2
    for dx in xs: segs.append((x, dx - 0.75)); x = dx + 0.75
    segs.append((x, W / 2))
    obs = []
    for k, (a, b) in enumerate(segs):
        if b - a < 0.05: continue
        obs.append(box(f'{prefix}_WALL_N_{k}', MAT['granite'], a, b, y0, y0 + 1.2, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1]}))
        obs.append(box(f'{prefix}_WALL_Nu_{k}', MAT['plaster'], a, b, y0 + 1.2, y1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1]}))
    for dx in xs:   # 門楣
        obs.append(box(f'{prefix}_WALL_Nd_{dx}', MAT['plaster'], dx - 0.75, dx + 0.75, y0 + 2.6, y1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1]}))
        box(f'{prefix}_doorframe_{dx}', MAT['frame'], dx - 0.8, dx + 0.8, y0, y0 + 2.7, z + T / 2 - 0.02, z + T / 2 + 0.05, parent)
        box(f'{prefix}_door_{dx}', MAT['woodD'], dx - 0.68, dx + 0.68, y0, y0 + 2.5, z + T / 2 + 0.05, z + T / 2 + 0.09, parent)
        cyl(f'{prefix}_doorhandle_{dx}', MAT['steel'], (dx + 0.45, y0 + 0.9, z + T / 2 + 0.14), (dx + 0.45, y0 + 1.3, z + T / 2 + 0.14), 0.018, parent)
    return obs

wall_with_doors('L0', L0, -D / 2, 0, Y1, L['doors'], 0)
wall_with_doors('L1', L1, -D / 2, Y1, RY, L['doors'], 1)
box('L0_WALL_W', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, 0, Y1, -D / 2, D / 2, L0, props={'dir': [1, 0, 0]})
box('L1_WALL_W', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, Y1, RY, -D / 2, D / 2, L1, props={'dir': [1, 0, 0]})
box('L0_wallbase_W', MAT['woodD'], -W / 2 + T / 2, -W / 2 + T / 2 + 0.02, 0, 0.12, -D / 2, D / 2, L0)
box('L1_WALL_E', MAT['granite'], W / 2 - T / 2, W / 2 + T / 2, Y1, RY, -D / 2, D / 2, L1, props={'dir': [-1, 0, 0]})
# 東面一樓：玻璃門面（直櫺每 1.75 m）、入口自動門（兩扇玻璃）
gh = Y1 - 0.3
quad('L0_glass_E', MAT['glass'], [(W / 2, 0, D / 2), (W / 2, 0, -D / 2), (W / 2, gh, -D / 2), (W / 2, gh, D / 2)], L0)
z = -D / 2
while z <= D / 2 + 1e-6:
    box(f'L0_mullion_E_{z:.2f}', MAT['frame'], W / 2 - 0.1, W / 2, 0, gh, z - 0.05, z + 0.05, L0); z += 1.75
box('L0_transom_E', MAT['frame'], W / 2 - 0.1, W / 2, 2.85, 2.95, -D / 2, D / 2, L0)
box('L0_beam_E', MAT['granite'], W / 2 - T / 2, W / 2 + T / 2, gh, Y1, -D / 2, D / 2, L0, props={'dir': [-1, 0, 0]})
EN = L['entrance']
for k, (a, b) in enumerate(((EN['z0'] + 0.1, (EN['z0'] + EN['z1']) / 2 - 0.02), ((EN['z0'] + EN['z1']) / 2 + 0.02, EN['z1'] - 0.1))):
    box(f'L0_autodoor_{k}', MAT['frame'], W / 2 - 0.16, W / 2 - 0.12, 0, 2.6, a, b, L0)
# 南面：兩層樓高的玻璃帷幕＋直櫺（W/8）＋三道橫櫺
gh2 = RY - 0.4
quad('L0_glass_S', MAT['glass'], [(-W / 2, 0, D / 2), (W / 2, 0, D / 2), (W / 2, gh2, D / 2), (-W / 2, gh2, D / 2)], L0)
for i in range(9):
    x = -W / 2 + i * W / 8
    box(f'L0_mullion_S_{i}', MAT['frame'], x - 0.06, x + 0.06, 0, gh2, D / 2 - 0.14, D / 2, L0)
for k, yy in enumerate((2.9, Y1, Y1 + 2.9)):
    box(f'L0_transom_S_{k}', MAT['frame'], -W / 2, W / 2, yy - 0.06, yy + 0.06, D / 2 - 0.14, D / 2, L0)
box('L0_glass_top_S', MAT['granite'], -W / 2, W / 2, gh2, RY, D / 2 - T / 2, D / 2 + T / 2, L0)

# ---------------- 樓梯：每一階一塊石材（實心到地面）、平台、第二跑；東側玻璃欄板＋不鏽鋼扶手、西牆扶手 ----------------
def flight(prefix, zb, base, n):
    for k in range(n):
        top = base + (k + 1) * S['rise']; z1 = zb - k * S['tread']; z0 = z1 - S['tread']
        box(f'{prefix}_step_{k}', MAT['step'], S['x0'], S['x1'], 0, top, z0, z1, L0, bevel=0.012)
        box(f'{prefix}_nosing_{k}', MAT['frame'], S['x0'], S['x1'], top - 0.012, top + 0.003, z1 - 0.045, z1, L0)   # 止滑條
flight('L0_f1', S['flight1']['z1'], 0.0, S['flight1']['risers'])
box('L0_landing', MAT['step'], S['x0'], S['x1'], 0, S['landing']['y'], S['landing']['z0'], S['landing']['z1'], L0, bevel=0.012)
flight('L0_f2', S['flight2']['z1'], S['landing']['y'], S['flight2']['risers'])
rx = S['railX'] + 0.02
pts = [(S['flight1']['z1'], 0.0), (S['flight1']['z0'], S['landing']['y']), (S['landing']['z0'], S['landing']['y']), (S['flight2']['z0'], Y1)]
for i in range(len(pts) - 1):
    (za, ya), (zb, yb) = pts[i], pts[i + 1]
    quad(f'L0_stair_glass_{i}', MAT['glass'], [(rx, ya + 0.08, za), (rx, yb + 0.08, zb), (rx, yb + 1.0, zb), (rx, ya + 1.0, za)], L0, tile=1.0)
    cyl(f'L0_stair_rail_{i}', MAT['steel'], (rx, ya + 1.02, za), (rx, yb + 1.02, zb), 0.03, L0)
    cyl(f'L0_wall_rail_{i}', MAT['steel'], (S['x0'] - 0.06, ya + 0.9, za), (S['x0'] - 0.06, yb + 0.9, zb), 0.022, L0)
# 第二跑下面（一樓）：封起來的牆（一樓看到的樓梯側面）
quad('L0_stair_side', MAT['plaster'], [(S['x1'] + 0.01, 0, S['landing']['z1']), (S['x1'] + 0.01, 0, S['flight2']['z0']), (S['x1'] + 0.01, Y1 - 0.3, S['flight2']['z0']), (S['x1'] + 0.01, S['landing']['y'] - 0.2, S['landing']['z1'])], L0)

# ---------------- 二樓迴廊的玻璃欄杆（樓梯頂與電梯門口留開）----------------
for k, (x0, x1) in enumerate(((S['x1'] + 0.1, EL['x0'] - 0.05), (EL['x1'] + 0.05, W / 2))):
    if x1 - x0 < 0.1: continue
    quad(f'L1_gallery_glass_{k}', MAT['glass'], [(x0, Y1 + 0.05, G['railZ']), (x1, Y1 + 0.05, G['railZ']), (x1, Y1 + 1.0, G['railZ']), (x0, Y1 + 1.0, G['railZ'])], L1, tile=1.0)
    cyl(f'L1_gallery_rail_{k}', MAT['steel'], (x0, Y1 + 1.04, G['railZ']), (x1, Y1 + 1.04, G['railZ']), 0.03, L1)
    box(f'L1_gallery_shoe_{k}', MAT['steel'], x0, x1, Y1, Y1 + 0.1, G['railZ'] - 0.04, G['railZ'] + 0.04, L1)

# ---------------- 家具：服務台、沙發、花台、二樓長椅 ----------------
for i, f in enumerate(L['furniture']):
    P = L1 if f['lv'] else L0; y = Y1 if f['lv'] else 0.0; pre = 'L1' if f['lv'] else 'L0'
    if f['type'] == 'counter':
        box(f'{pre}_counter_body', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y, y + 1.0, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        box(f'{pre}_counter_top', MAT['granite'], f['x'] - f['w'] / 2 - 0.05, f['x'] + f['w'] / 2 + 0.05, y + 1.0, y + 1.05, f['z'] - f['d'] / 2 - 0.05, f['z'] + f['d'] / 2 + 0.05, P, bevel=0.008)
    elif f['type'] == 'sofa':
        x0, x1, z0, z1 = f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2
        back = abs(f.get('ry', 0)) > 1   # ry=π：靠背在 +z（南）
        box(f'{pre}_sofa_base_{i}', MAT['leather'], x0, x1, y + 0.06, y + 0.42, z0, z1, P, bevel=0.04)
        bz0, bz1 = (z1 - 0.2, z1) if back else (z0, z0 + 0.2)
        box(f'{pre}_sofa_back_{i}', MAT['leather'], x0, x1, y + 0.42, y + 0.85, bz0, bz1, P, bevel=0.04)
        for sx in (x0, x1 - 0.18): box(f'{pre}_sofa_arm_{i}_{sx:.1f}', MAT['leather'], sx, sx + 0.18, y + 0.42, y + 0.62, z0, z1, P, bevel=0.03)
        for (lx, lz) in ((x0 + 0.1, z0 + 0.1), (x1 - 0.1, z0 + 0.1), (x0 + 0.1, z1 - 0.1), (x1 - 0.1, z1 - 0.1)): box(f'{pre}_sofa_leg_{i}_{lx:.1f}{lz:.1f}', MAT['frame'], lx - 0.025, lx + 0.025, y, y + 0.06, lz - 0.025, lz + 0.025, P)
    elif f['type'] == 'planter':
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=f['r'] * 0.88, radius2=f['r'], depth=0.6)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.3, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_planter_{i}', bm, MAT['granite'], P)
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=f['r'] * 1.25)
        for v in bm.verts: v.co.z *= 0.8; v.co += Vector((math.sin(v.co.x * 9) * 0.05, math.cos(v.co.y * 7) * 0.05, 0))
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 1.1, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_plant_{i}', bm, MAT['plant'], P)
    elif f['type'] == 'bench':
        box(f'{pre}_bench_seat_{i}', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y + 0.42, y + 0.47, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        for sx in (-1, 1): box(f'{pre}_bench_leg_{i}_{sx}', MAT['steel'], f['x'] + sx * (f['w'] / 2 - 0.12) - 0.03, f['x'] + sx * (f['w'] / 2 - 0.12) + 0.03, y, y + 0.42, f['z'] - f['d'] * 0.45, f['z'] + f['d'] * 0.45, P)
    elif f['type'] == 'board':
        box(f'{pre}_board_frame', MAT['frame'], f['x'] - f['w'] / 2 - 0.05, f['x'] + f['w'] / 2 + 0.05, y + 1.65 - f['w'] / 4 - 0.05, y + 1.65 + f['w'] / 4 + 0.05, f['z'] - 0.05, f['z'] - 0.01, P)

# ---------------- 同一層、同材質的物件合併（減少 draw call；外牆不合併：要各自淡出）----------------
def join_by_material(level_root, prefix):
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH' or 'WALL_' in ob.name: continue
        groups.setdefault(ob.data.materials[0].name, []).append(ob)
    for mname, obs in groups.items():
        if len(obs) < 2: continue
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        mesh_obj(f'{prefix}_{mname}', bm, mat, level_root)
for r, pre in ((L0, 'L0'), (L1, 'L1')): join_by_material(r, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        for p in ob.data.polygons: p.use_smooth = False
os.makedirs(os.path.dirname(OUT), exist_ok=True)
tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in scene.objects if ob.type == 'MESH')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='WEBP', export_image_quality=82, export_yup=True, export_apply=True,
                          export_extras=True, export_materials='EXPORT', export_texcoords=True, export_normals=True, export_lights=False, export_cameras=False)
print(json.dumps({'out': os.path.relpath(OUT, ROOT), 'bytes': os.path.getsize(OUT), 'objects': sum(1 for o in scene.objects if o.type == 'MESH'), 'tris': tris, 'materials': len(bpy.data.materials), 'texres': TEXRES}, ensure_ascii=False))

# ---------------- 渲染預覽（給報告用：Blender 的模型渲染圖）----------------
if RENDER:
    os.makedirs(RENDER, exist_ok=True)
    scene.render.engine = 'BLENDER_EEVEE'; scene.render.resolution_x, scene.render.resolution_y = 1280, 800
    scene.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True; world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.8, 0.86, 1); world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); scene.collection.objects.link(sun); sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(200))
    for (x, y, z, e) in ((0, 6.5, 1.5, 900), (0, 3.0, -5.0, 300), (4, 6.5, 4, 500)):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.location = g2b(x, y, z); scene.collection.objects.link(lt)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam; cam.data.lens = 18
    for name, eye, look in (('lobby_from_entrance', (7.2, 1.7, 6.2), (-4, 2.4, -2.0)), ('stair_and_gallery', (4.0, 2.0, 5.8), (-6.5, 3.2, -2.0)), ('gallery_2f', (6.6, 5.9, -5.6), (-4, 4.6, -3.0))):
        cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(RENDER, f'blender_linze_{name}.png'); bpy.ops.render.render(write_still=True); print('render', scene.render.filepath)
