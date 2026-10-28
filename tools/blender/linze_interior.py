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
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import b3lib as B   # 貼圖平均顏色校正（img_adj target）
import plants as PL   # 盆栽（模型葉子；2026-10-11 換掉多面體圓球）
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

def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8, target=None, sat=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = metal
    m['tile'] = tile
    if pid:
        base = os.path.join(TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = B.img_adj(base + '_diff_1k.jpg', sat, 1.0, target) if target else img(base + '_diff_1k.jpg')   # target：平均顏色校正（tools/blender/b3lib.py）
        if target: tint = None
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
    'floor':   pbr('stone_floor', 'large_floor_tiles_02', tile=1.2, sat=0.3, target='#bdbbb5'),        # 照片：穿堂與大廳的灰色石材地磚
    'granite': pbr('granite_panel', 'large_floor_tiles_02', tile=2.4, sat=0.3, target='#c8c6c0'),      # 牆面的花崗石板（大片）
    'step':    pbr('granite_step', 'large_floor_tiles_02', tile=0.9, sat=0.3, target='#a9a7a2'),
    'plaster': pbr('plaster', 'painted_plaster_wall', tile=2.5, target='#e9e6df'),
    'ceiling': pbr('ceiling', 'ceiling_interior', tile=2.0, sat=0.2, target='#efeeea', normal=0.3),
    'wood':    pbr('wood', 'fine_grained_wood', tile=1.6, target='#a77d57'),
    'woodD':   pbr('wood_dark', 'fine_grained_wood', tile=1.6, target='#6e5848'),
    'leather': pbr('leather', 'fabric_leather_02', tile=1.0, sat=0.15, target='#5f6a76'),             # 灰藍色皮沙發
    'steel':   pbr('steel', None, tint=srgb('#c9ccd0'), rough=0.28, metal=0.45),   # 遊戲沒有環境貼圖：金屬度太高會發黑
    'frame':   pbr('frame', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35),
    'glass':   pbr('glass', None, tint=srgb('#c4d6dc'), rough=0.05, alpha=0.22),
    'light':   pbr('light_panel', None, tint=srgb('#fff6e4'), rough=0.9, emit=srgb('#fff4dc')),
    'plant':   pbr('plant', None, tint=srgb('#4f7a46'), rough=0.85),
    'soil':    pbr('soil', None, tint=srgb('#4a3a2c'), rough=0.95),
}
MAT['nosing'] = pbr('lz_nosing', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35)   # 樓梯止滑條（顏色和 frame 一樣）
MAT['ceiling'].use_backface_culling = True   # 天花板單面（四邊形本來就朝下）：鏡頭拉遠到天花板上面時看得穿（ART-CEIL-LAWWW-ROOMS-1022，LAWWW2 10-22）
MAT['light'].use_backface_culling = True     # 嵌在天花板的燈板、崁燈也單面（四邊形本來就朝下）：鏡頭在天花板上面時不會浮著一塊塊亮的（LAWWW2 10-22 第二版）

# ---------------- 幾何 ----------------
PM = PL.materials('lz_')   # 盆栽的材質（樹皮、土、葉子）

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
box('L0_floor', MAT['floor'], -W / 2, W / 2, -0.25, 0.0, -D / 2, D / 2, L0, props={'lm': 1.6, 'lmhide': 'side'})   # lm：光照貼圖分給它的比例（lightbake/bake_room.py；地板最常看到、天花板 8.4 m 高很少看到）；lmhide 'side'：四邊的側面不分像素（東邊、南邊在玻璃外面，烘出來是天空的顏色：晚上鏡頭在門外時看到一條深藍色）
gz0, gz1 = -D / 2, G['z1']
WI0, WI1, ZI0 = -W / 2 + T / 2, W / 2 - T / 2, -D / 2 + T / 2   # 牆的內面：樓板、地板停在牆的內面（原本伸進牆裡，和牆的端面同平面）
box('L1_slab', MAT['plaster'], WI0, WI1, Y1 - G['slabT'], Y1 - 0.02, ZI0, gz1, L1, props={'lmhide': [0, 1, 0]})            # 二樓樓板（下面是一樓北側的天花板）
box('L1_floor', MAT['floor'], WI0, WI1, Y1 - 0.02, Y1, ZI0, gz1, L1, props={'lm': 1.3})
box('L1_slab_edge', MAT['granite'], WI0, WI1, Y1 - G['slabT'] - 0.05, Y1 + 0.02, gz1 - 0.02, gz1 + 0.06, L1, bevel=0.01)   # 樓板邊緣的石材收邊
# 天花板（中庭頂、二樓天花板）：單面朝下＋燈板
quad('L1_ceiling', MAT['ceiling'], [(-W / 2, RY, -D / 2), (W / 2, RY, -D / 2), (W / 2, RY, D / 2), (-W / 2, RY, D / 2)], L1)['lm'] = 0.3
for i in range(4):
    for j in range(3):
        cx, cz = -6 + i * 4, -4 + j * 4.6
        quad(f'L1_light_{i}_{j}', MAT['light'], [(cx - 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz + 0.3), (cx - 0.6, RY - 0.01, cz + 0.3)], L1)
for i in range(5):
    for z in (-6.0, -4.4):
        x = -6 + i * 3
        quad(f'L1_downlight_{i}_{z}', MAT['light'], [(x - 0.14, Y1 - G['slabT'] - 0.005, z - 0.14), (x + 0.14, Y1 - G['slabT'] - 0.005, z - 0.14), (x + 0.14, Y1 - G['slabT'] - 0.005, z + 0.14), (x - 0.14, Y1 - G['slabT'] - 0.005, z + 0.14)], L1)

# ---------------- 外牆（北：花崗石＋門洞；西：粉光牆；東：一樓玻璃門面、二樓石材；南：兩層樓玻璃帷幕）----------------
def wall_with_doors(prefix, parent, z, y0, y1, doors, lvl, ylo=None, yhi=None):
    """北牆一段（y0..y1），門洞寬 1.5 高 2.6；牆下段 1.2 m 花崗石、上面粉光。
    ylo／yhi：牆體的實際上下緣（一樓的牆停在二樓地板下 3 cm、二樓的牆往下伸 3 cm：牆頂和二樓地板不同平面，BUG-COPLANAR-DEV）"""
    wy0 = y0 if ylo is None else ylo; wy1 = y1 if yhi is None else yhi
    xs = sorted(d['x'] for d in doors if d['lv'] == lvl)
    cuts = [(-W / 2, None)]; segs = []; x = -W / 2 + T / 2          # 北牆夾在東、西牆中間（牆角不重疊）
    for dx in xs: segs.append((x, dx - 0.75)); x = dx + 0.75
    segs.append((x, W / 2 - T / 2))
    obs = []
    for k, (a, b) in enumerate(segs):
        if b - a < 0.05: continue
        obs.append(box(f'{prefix}_WALL_N_{k}', MAT['granite'], a, b, wy0, y0 + 1.2, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1]}))
        obs.append(box(f'{prefix}_WALL_Nu_{k}', MAT['plaster'], a, b, y0 + 1.2, wy1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1], 'lm': 0.7 if lvl else 1.0}))   # 二樓的上半段（高 5.4～8.4 m）光照貼圖少分一點
    for dx in xs:   # 門楣
        obs.append(box(f'{prefix}_WALL_Nd_{dx}', MAT['plaster'], dx - 0.75, dx + 0.75, y0 + 2.6, wy1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1], 'lm': 0.7 if lvl else 1.0}))
        FN = {'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]}   # 門框、門板、門把跟著北牆淡出（鏡頭在牆外時；2026-10-10 #16）
        box(f'{prefix}_doorframe_{dx}', MAT['frame'], dx - 0.8, dx + 0.8, y0, y0 + 2.7, z + T / 2 - 0.02, z + T / 2 + 0.05, parent, props=FN)
        box(f'{prefix}_door_{dx}', MAT['woodD'], dx - 0.68, dx + 0.68, y0, y0 + 2.5, z + T / 2 + 0.05, z + T / 2 + 0.09, parent, props=FN)
        h_ = cyl(f'{prefix}_doorhandle_{dx}', MAT['steel'], (dx + 0.45, y0 + 0.9, z + T / 2 + 0.14), (dx + 0.45, y0 + 1.3, z + T / 2 + 0.14), 0.018, parent)
        for k_, v_ in FN.items(): h_[k_] = v_
    return obs

YJ = Y1 - 0.03                    # 一樓、二樓的牆在這裡接（藏在二樓樓板裡）：原本一樓牆頂和二樓地板同一個平面，二樓靠牆一條會閃（BUG-COPLANAR-DEV）
wall_with_doors('L0', L0, -D / 2, 0, Y1, L['doors'], 0, yhi=YJ)
wall_with_doors('L1', L1, -D / 2, Y1, RY, L['doors'], 1, ylo=YJ)
box('L0_WALL_W', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, 0, YJ, -D / 2 - T / 2, D / 2 + T / 2, L0, props={'dir': [1, 0, 0]})
box('L1_WALL_W', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, YJ, RY, -D / 2 - T / 2, D / 2 + T / 2, L1, props={'dir': [1, 0, 0], 'lm': 0.8})
box('L0_wallbase_W', MAT['woodD'], -W / 2 + T / 2, -W / 2 + T / 2 + 0.02, 0, 0.12, -D / 2 + T / 2, D / 2 - 0.08, L0)
box('L1_WALL_E', MAT['granite'], W / 2 - T / 2, W / 2 + T / 2, YJ, RY, -D / 2 - T / 2, D / 2 + T / 2, L1, props={'dir': [-1, 0, 0], 'lm': 0.8})
# 東面一樓：玻璃門面（直櫺每 1.75 m）、入口自動門（兩扇玻璃）
gh = Y1 - 0.3
GXE = W / 2 - 0.05                # 玻璃放在直櫺深度的中間（原本和直櫺外面同一個平面，玻璃和框會閃）
quad('L0_glass_E', MAT['glass'], [(GXE, 0, D / 2), (GXE, 0, -D / 2), (GXE, gh, -D / 2), (GXE, gh, D / 2)], L0)
FE = {'fadegrp': 'Efacade', 'fadedir': [-1, 0, 0]}   # 東面（入口那一面）：鏡頭在建築外面時跟著淡出——舊版合併進 L0_frame，進門時兩扇深色自動門擋住人物（#16）
z = -D / 2
while z <= D / 2 + 1e-6:
    box(f'L0_mullion_E_{z:.2f}', MAT['frame'], W / 2 - 0.1, W / 2 + 0.01, 0, gh, z - 0.05, z + 0.05, L0, props=FE); z += 1.75   # 框比牆面凸出 1 cm（不和牆的端面同平面）
box('L0_transom_E', MAT['frame'], W / 2 - 0.09, W / 2 + 0.005, 2.85, 2.95, -D / 2 + T / 2, D / 2, L0, props=FE)   # 橫櫺比直櫺薄一點（交叉的地方不同平面）
box('L0_beam_E', MAT['granite'], W / 2 - T / 2, W / 2 + T / 2, gh, YJ, -D / 2, D / 2, L0, props={'dir': [-1, 0, 0]})
EN = L['entrance']
for k, (a, b) in enumerate(((EN['z0'] + 0.1, (EN['z0'] + EN['z1']) / 2 - 0.02), ((EN['z0'] + EN['z1']) / 2 + 0.02, EN['z1'] - 0.1))):
    # 一扇玻璃自動門：細鋁框（跟著東面淡出）＋玻璃＋直的把手（LAWWW2-B 10-24：原本整扇是框的深色材質，畫面上是兩塊黑板）
    for (za, zb, ya, yb) in ((a, a + 0.05, 0, 2.6), (b - 0.05, b, 0, 2.6), (a + 0.05, b - 0.05, 2.54, 2.6), (a + 0.05, b - 0.05, 0, 0.1)):
        box(f'L0_autodoor_{k}_{za:.2f}_{ya:.2f}', MAT['frame'], W / 2 - 0.16, W / 2 - 0.12, ya, yb, za, zb, L0, props=FE)
    quad(f'L0_autodoor_glass_{k}', MAT['glass'], [(W / 2 - 0.14, 0.1, a + 0.05), (W / 2 - 0.14, 0.1, b - 0.05), (W / 2 - 0.14, 2.54, b - 0.05), (W / 2 - 0.14, 2.54, a + 0.05)], L0)   # 玻璃不放進淡出的群組（半透明的材質淡出會變成不透明）
    hz = b - 0.12 if k == 0 else a + 0.12                                                                                                              # 把手在兩扇門相接的那一邊
    box(f'L0_autodoor_handle_{k}', MAT['steel'], W / 2 - 0.2, W / 2 - 0.17, 0.85, 1.55, hz - 0.015, hz + 0.015, L0, props=FE)
# 南面：兩層樓高的玻璃帷幕＋直櫺（W/8）＋三道橫櫺
gh2 = RY - 0.4
FS = {'fadegrp': 'Sfacade', 'fadedir': [0, 0, -1]}   # 南面帷幕的框：鏡頭在建築外面時跟著淡出
GZS = D / 2 - 0.07
quad('L0_glass_S', MAT['glass'], [(-W / 2, 0, GZS), (W / 2, 0, GZS), (W / 2, gh2, GZS), (-W / 2, gh2, GZS)], L0)
for i in range(9):
    x = -W / 2 + i * W / 8
    box(f'L0_mullion_S_{i}', MAT['frame'], x - 0.06, x + 0.06, 0, gh2, D / 2 - 0.14, D / 2 + 0.01, L0, props=FS)
for k, yy in enumerate((2.9, Y1, Y1 + 2.9)):
    box(f'L0_transom_S_{k}', MAT['frame'], -W / 2 + T / 2, W / 2 - T / 2, yy - 0.06, yy + 0.06, D / 2 - 0.13, D / 2 + 0.005, L0, props=FS)
box('L0_glass_top_S', MAT['granite'], -W / 2 + T / 2, W / 2 - T / 2, gh2, RY, D / 2 - T / 2, D / 2 + T / 2, L0)   # 夾在東西牆中間（東西牆往南多 5 cm 包住牆角）

# ---------------- 樓梯：每一階一塊石材（實心到地面）、平台、第二跑；東側玻璃欄板＋不鏽鋼扶手、西牆扶手 ----------------
# LINZE-LOBBY-V2-1028：樓梯從「每一階一個從地面長上來的方塊」改成只有看得到的面（踏面、踢面、側面的鋸齒形、第二跑的背面）。
# 原本二十五個方塊互相重疊，光照貼圖量到 294 m² 裡看得到的不到 70 m²（lightbake/uv_fill.py），地板、牆分到的像素被擠掉。外觀一樣（每一階的止滑條照舊）。
def stair_faces(prefix, zb, base, n, front_from):
    """一跑：踏面、踢面（第一階的踢面從 front_from 起：第一跑從地面、第二跑從平台面）＋兩側的鋸齒形側面（到地面；第二跑東側被木條牆擋住、西側貼著西牆，所以光照貼圖分少一點）。
    第一跑的背面貼著平台、底面貼地，不做；第二跑的背面（z＝flight2.z0，朝 −z）在二樓迴廊下面看得到"""
    R, Tr, x0, x1 = S['rise'], S['tread'], S['x0'], S['x1']
    prof = [(zb, front_from)]                          # (z, y)：前緣 → 鋸齒往上 → 最上面一階的後緣
    for k in range(n):
        z1 = zb - k * Tr; top = base + (k + 1) * R
        prof += [(z1, top), (z1 - Tr, top)]
        box(f'{prefix}_nosing_{k}', MAT['nosing'], x0, x1, top - 0.012, top + 0.003, z1 - 0.045, z1, L0)   # 止滑條（自己的材質：只有 1.5 cm 高，光照貼圖分不到一個像素，不烘、照舊即時光；和 201 一樣）
    bm = bmesh.new()
    for (za, ya), (zb_, yb) in zip(prof[:-1], prof[1:]):
        f = bm.faces.new([bm.verts.new(g2b(x, y, z)) for (x, y, z) in ((x0, ya, za), (x1, ya, za), (x1, yb, zb_), (x0, yb, zb_))]); f.normal_update()
        if abs(za - zb_) < 1e-6:                        # 踢面：朝 +遊戲 z（往下走的方向）＝Blender −y
            if f.normal.y > 0: f.normal_flip()
        elif f.normal.z < 0: f.normal_flip()           # 踏面：朝上
    zt, yt = prof[-1]
    if base > 0:                                       # 第二跑的背面（地面到二樓，朝 −遊戲 z＝Blender +y）
        f = bm.faces.new([bm.verts.new(g2b(*p)) for p in ((x0, 0, zt), (x0, yt, zt), (x1, yt, zt), (x1, 0, zt))]); f.normal_update()
        if f.normal.y < 0: f.normal_flip()
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.normal_update(); box_uv(bm, MAT['step']['tile'])
    mesh_obj(f'{prefix}_steps', bm, MAT['step'], L0)
    side = prof + [(zt, 0.0)] + ([(zb, 0.0)] if front_from > 0 else [])   # 側面：鋸齒往下接到地面（第一跑的起點本來就在地面）
    for xs, nx in ((x1, 1), (x0, -1)):
        bm = bmesh.new(); f = bm.faces.new([bm.verts.new(g2b(xs, y, z)) for (z, y) in side]); f.normal_update()
        if f.normal.x * nx < 0: f.normal_flip()
        bm.normal_update(); box_uv(bm, MAT['step']['tile'])
        mesh_obj(f'{prefix}_side_{"E" if nx > 0 else "W"}', bm, MAT['step'], L0, props=None if (nx > 0 and base == 0) else {'lm': 0.4})   # 第一跑東側從大廳看得到；其他三面幾乎看不到
stair_faces('L0_f1', S['flight1']['z1'], 0.0, S['flight1']['risers'], 0.0)
# 平台：上面（看得到）＋西側（貼西牆，光照貼圖少分）；東側在木條牆後面、南北兩面貼著兩跑，不做
_ld = S['landing']
quad('L0_landing_top', MAT['step'], [(S['x0'], _ld['y'], _ld['z1']), (S['x1'], _ld['y'], _ld['z1']), (S['x1'], _ld['y'], _ld['z0']), (S['x0'], _ld['y'], _ld['z0'])], L0)
quad('L0_landing_W', MAT['step'], [(S['x0'], 0, _ld['z1']), (S['x0'], _ld['y'], _ld['z1']), (S['x0'], _ld['y'], _ld['z0']), (S['x0'], 0, _ld['z0'])], L0)['lm'] = 0.4
stair_faces('L0_f2', S['flight2']['z1'], _ld['y'], S['flight2']['risers'], _ld['y'])
rx = S['railX'] + 0.02
pts = [(S['flight1']['z1'], 0.0), (S['flight1']['z0'], S['landing']['y']), (S['landing']['z0'], S['landing']['y']), (S['flight2']['z0'], Y1)]
for i in range(len(pts) - 1):
    (za, ya), (zb, yb) = pts[i], pts[i + 1]
    quad(f'L0_stair_glass_{i}', MAT['glass'], [(rx, ya + 0.08, za), (rx, yb + 0.08, zb), (rx, yb + 1.0, zb), (rx, ya + 1.0, za)], L0, tile=1.0)
    cyl(f'L0_stair_rail_{i}', MAT['steel'], (rx, ya + 1.02, za), (rx, yb + 1.02, zb), 0.03, L0)
    cyl(f'L0_wall_rail_{i}', MAT['steel'], (S['x0'] - 0.06, ya + 0.9, za), (S['x0'] - 0.06, yb + 0.9, zb), 0.022, L0)
# 第二跑下面（一樓）：封起來的牆（一樓看到的樓梯側面）
quad('L0_stair_side', MAT['woodD'], [(S['x1'] + 0.01, 0, S['landing']['z1']), (S['x1'] + 0.01, 0, S['flight2']['z0']), (S['x1'] + 0.01, Y1 - 0.3, S['flight2']['z0']), (S['x1'] + 0.01, S['landing']['y'] - 0.2, S['landing']['z1'])], L0)
# 大廳第二版（LINZE-LOBBY-V2-1028）：樓梯側面從一整面素牆改成木條牆（深色底板＋直的淺色木條每 12 cm、頂端照斜的樓梯底、下面踢腳板）——從入口一進來就看到的那一面
_za, _zb = S['flight2']['z0'] + 0.08, S['landing']['z1'] - 0.08
_top = lambda zz: (Y1 - 0.3) + ((S['landing']['y'] - 0.2) - (Y1 - 0.3)) * (zz - S['flight2']['z0']) / (S['landing']['z1'] - S['flight2']['z0'])
_zz = _za
while _zz <= _zb:
    box(f'L0_slat_{_zz:.2f}', MAT['wood'], S['x1'] + 0.01, S['x1'] + 0.045, 0.12, _top(_zz + 0.025) - 0.06, _zz, _zz + 0.05, L0)
    _zz += 0.12
box('L0_slat_base', MAT['frame'], S['x1'] + 0.01, S['x1'] + 0.05, 0.0, 0.12, S['flight2']['z0'], S['landing']['z1'], L0)

# ---------------- 二樓迴廊的玻璃欄杆（樓梯頂與電梯門口留開）----------------
for k, (x0, x1) in enumerate(((S['x1'] + 0.1, EL['x0'] - 0.05), (EL['x1'] + 0.05, W / 2))):
    if x1 - x0 < 0.1: continue
    quad(f'L1_gallery_glass_{k}', MAT['glass'], [(x0, Y1 + 0.05, G['railZ']), (x1, Y1 + 0.05, G['railZ']), (x1, Y1 + 1.0, G['railZ']), (x0, Y1 + 1.0, G['railZ'])], L1, tile=1.0)
    cyl(f'L1_gallery_rail_{k}', MAT['steel'], (x0, Y1 + 1.04, G['railZ']), (x1, Y1 + 1.04, G['railZ']), 0.03, L1)
    box(f'L1_gallery_shoe_{k}', MAT['steel'], x0, x1, Y1, Y1 + 0.1, G['railZ'] - 0.04, G['railZ'] + 0.04, L1)

# ---------------- 大廳第二版的擺設（LINZE-LOBBY-V2-1028，LAWWW2-C 2026-10-28；使用者 10-28「廉價手遊感」，INTERIOR_AAA_REVIEW_1028 第 5 節 P4～P6）----------------
# 每一件都有理由：法學院的展示櫃（模擬法庭、辯論的獎盃）、飲水機與回收桶（每棟系館都有）、入口的傘架與腳踏墊（台北常下雨）、
# 消防栓箱與出口燈、樓梯側面的木條牆（原本一整面素牆）、中庭吊燈。放在牆邊、劇情站位與路人路線以外（linze_layout.js 的 furniture 註解）。
for k_, h_ in (('red', '#b3261e'), ('exitg', '#1f9d55'), ('black', '#1d1f22'), ('white', '#f2f1ec'), ('mat', '#3b3d40'), ('binB', '#2f6db3'), ('binG', '#3f8f4f'), ('binK', '#6b7076'),
               ('gold', '#c9a24a'), ('brass', '#b08a4a'), ('cream', '#e6e2d6'), ('navy', '#2b3a55'), ('umbR', '#a8343a'), ('paper', '#efe9dc')):
    MAT[k_] = pbr('lz_' + k_, None, tint=srgb(h_), rough=0.35 if k_ in ('gold', 'brass') else 0.6, metal=0.4 if k_ in ('gold', 'brass') else 0.0)
MAT['exitglow'] = pbr('lz_exitglow', None, tint=srgb('#3fdc84'), rough=0.9, emit=srgb('#3fdc84'))

def lobby_prop(f, P, pre, y, i):
    kind, x, z, w, d = f['kind'], f['x'], f['z'], f['w'], f['d']
    n = f'{pre}_{kind}_{i}'
    if kind == 'display':      # 靠北牆的展示櫃（朝 +z）：下面木櫃、上面玻璃櫃＋兩層玻璃板、獎盃、獎牌、照片框、頂燈
        x0, x1, z0, z1 = x - w / 2, x + w / 2, z - d / 2, z + d / 2
        box(n + '_base', MAT['woodD'], x0, x1, y, y + 0.9, z0, z1, P, bevel=0.01)
        box(n + '_top', MAT['woodD'], x0, x1, y + 2.0, y + 2.08, z0, z1, P, bevel=0.008)
        box(n + '_back', MAT['plaster'], x0 + 0.02, x1 - 0.02, y + 0.9, y + 2.0, z0, z0 + 0.03, P)
        for px in (x0 + 0.015, x1 - 0.015):
            for pz in (z0 + 0.04, z1 - 0.015): box(f'{n}_post_{px:.2f}_{pz:.2f}', MAT['steel'], px - 0.012, px + 0.012, y + 0.9, y + 2.0, pz - 0.012, pz + 0.012, P)
        quad(n + '_glass_f', MAT['glass'], [(x0 + 0.02, y + 0.9, z1 - 0.01), (x1 - 0.02, y + 0.9, z1 - 0.01), (x1 - 0.02, y + 2.0, z1 - 0.01), (x0 + 0.02, y + 2.0, z1 - 0.01)], P, tile=1.0)
        for sx in (x0 + 0.01, x1 - 0.01): quad(f'{n}_glass_s{sx:.2f}', MAT['glass'], [(sx, y + 0.9, z0 + 0.03), (sx, y + 0.9, z1 - 0.01), (sx, y + 2.0, z1 - 0.01), (sx, y + 2.0, z0 + 0.03)], P, tile=1.0)
        for sy in (1.27, 1.63): box(f'{n}_shelf_{sy}', MAT['glass'], x0 + 0.03, x1 - 0.03, y + sy, y + sy + 0.012, z0 + 0.04, z1 - 0.03, P)
        box(n + '_lightbar', MAT['light'], x0 + 0.1, x1 - 0.1, y + 1.97, y + 1.99, z0 + 0.15, z0 + 0.2, P)
        for k, (ox, sy, kind2) in enumerate(((-0.85, 0.9, 'cup'), (-0.45, 0.9, 'plaque'), (0.0, 0.9, 'cup2'), (0.45, 0.9, 'photo'), (0.85, 0.9, 'cup'),
                                              (-0.7, 1.282, 'photo'), (-0.25, 1.282, 'plaque'), (0.25, 1.282, 'cup'), (0.7, 1.282, 'gavel'),
                                              (-0.6, 1.642, 'plaque'), (0.0, 1.642, 'cup2'), (0.6, 1.642, 'photo'))):
            cx, cy, cz = x + ox * w / 2.4, y + sy, z - 0.02
            if kind2 in ('cup', 'cup2'):     # 獎盃：底座、杯腳、杯身、兩個耳朵
                hh = 0.24 if kind2 == 'cup2' else 0.18
                box(f'{n}_tb_{k}', MAT['woodD'], cx - 0.045, cx + 0.045, cy, cy + 0.04, cz - 0.045, cz + 0.045, P)
                cyl(f'{n}_ts_{k}', MAT['gold'], (cx, cy + 0.04, cz), (cx, cy + hh * 0.55, cz), 0.012, P, seg=8)
                cyl(f'{n}_tc_{k}', MAT['gold'], (cx, cy + hh * 0.55, cz), (cx, cy + hh, cz), 0.045, P, seg=12)
                for sx in (-1, 1): cyl(f'{n}_te_{k}_{sx}', MAT['gold'], (cx + sx * 0.045, cy + hh * 0.9, cz), (cx + sx * 0.07, cy + hh * 0.7, cz), 0.007, P, seg=6)
            elif kind2 == 'plaque':          # 獎牌（木板＋銅片，斜靠）
                box(f'{n}_pq_{k}', MAT['woodD'], cx - 0.11, cx + 0.11, cy, cy + 0.28, cz - 0.03, cz - 0.01, P)
                box(f'{n}_pqb_{k}', MAT['brass'], cx - 0.08, cx + 0.08, cy + 0.06, cy + 0.22, cz - 0.01, cz - 0.005, P)
            elif kind2 == 'photo':           # 照片框（黑框、白邊、照片是深淺兩塊：合照的樣子）
                box(f'{n}_pf_{k}', MAT['black'], cx - 0.12, cx + 0.12, cy, cy + 0.2, cz - 0.02, cz, P)
                box(f'{n}_pp_{k}', MAT['white'], cx - 0.105, cx + 0.105, cy + 0.015, cy + 0.185, cz, cz + 0.002, P)
                box(f'{n}_pi_{k}', MAT['navy'], cx - 0.09, cx + 0.09, cy + 0.03, cy + 0.11, cz + 0.002, cz + 0.003, P)
            elif kind2 == 'gavel':           # 法槌（木頭）
                box(f'{n}_gb_{k}', MAT['woodD'], cx - 0.07, cx + 0.07, cy, cy + 0.025, cz - 0.05, cz + 0.05, P)
                cyl(f'{n}_gh_{k}', MAT['wood'], (cx - 0.07, cy + 0.06, cz), (cx + 0.07, cy + 0.06, cz), 0.028, P, seg=10)
                cyl(f'{n}_gs_{k}', MAT['wood'], (cx, cy + 0.06, cz), (cx + 0.02, cy + 0.03, cz + 0.16), 0.008, P, seg=6)
    elif kind == 'water':      # 飲水機（白鐵、三個出水口：紅熱水、白溫水、藍冰水；下面接水盤；旁邊紙杯架）；朝 −x
        x0, x1, z0, z1 = x - w / 2, x + w / 2, z - d / 2, z + d / 2
        box(n + '_body', MAT['steel'], x0, x1, y, y + 1.25, z0, z1, P, bevel=0.012)
        box(n + '_panel', MAT['black'], x0 - 0.005, x0, y + 0.95, y + 1.12, z0 + 0.06, z1 - 0.06, P)
        box(n + '_niche', MAT['frame'], x0 - 0.003, x0 + 0.06, y + 0.55, y + 0.9, z0 + 0.05, z1 - 0.05, P)
        box(n + '_tray', MAT['steel'], x0 - 0.08, x0 + 0.02, y + 0.55, y + 0.58, z0 + 0.06, z1 - 0.06, P)
        for k, (oz, mk) in enumerate(((-0.11, 'red'), (0.0, 'white'), (0.11, 'binB'))):
            box(f'{n}_tap_{k}', MAT[mk], x0 - 0.05, x0 + 0.01, y + 0.84, y + 0.88, z + oz - 0.02, z + oz + 0.02, P)
        cyl(n + '_cups', MAT['white'], (x0 - 0.05, y + 0.62, z1 + 0.05), (x0 - 0.05, y + 0.95, z1 + 0.05), 0.04, P, seg=10)   # 紙杯架（一疊紙杯）
        box(n + '_sign', MAT['white'], x0 - 0.006, x0 - 0.001, y + 1.15, y + 1.22, z0 + 0.08, z1 - 0.08, P)
    elif kind == 'bins':       # 三個資源回收桶（藍：一般垃圾？不寫字；綠：回收；灰：紙類）；沿 z 排、朝 −x
        z0 = z - w / 2; bw = w / 3
        for k, mk in enumerate(('binB', 'binG', 'binK')):
            za, zb = z0 + k * bw + 0.02, z0 + (k + 1) * bw - 0.02
            box(f'{n}_b{k}', MAT[mk], x - d / 2, x + d / 2, y, y + 0.72, za, zb, P, bevel=0.015)
            box(f'{n}_l{k}', MAT[mk], x - d / 2 - 0.01, x + d / 2 + 0.01, y + 0.72, y + 0.78, za - 0.01, zb + 0.01, P, bevel=0.01)
            box(f'{n}_o{k}', MAT['black'], x - d / 2 - 0.012, x - d / 2 + 0.03, y + 0.735, y + 0.765, za + 0.06, zb - 0.06, P)   # 投入口
            box(f'{n}_t{k}', MAT['white'], x - d / 2 - 0.004, x - d / 2, y + 0.45, y + 0.6, za + 0.05, zb - 0.05, P)            # 標籤（不寫字）
    elif kind == 'umbrella':   # 傘架：白鐵桶＋三把傘（深藍、紅、透明灰）
        cyl(n + '_bucket', MAT['steel'], (x, y, z), (x, y + 0.5, z), 0.2, P, seg=16)
        for k, (ox, oz, mk, tilt) in enumerate(((-0.06, -0.05, 'navy', 0.12), (0.07, 0.0, 'umbR', -0.1), (-0.02, 0.08, 'binK', 0.05))):
            cyl(f'{n}_u{k}', MAT[mk], (x + ox, y + 0.05, z + oz), (x + ox + tilt * 0.6, y + 0.82, z + oz + tilt * 0.3), 0.035, P, seg=8)
            cyl(f'{n}_h{k}', MAT['black'], (x + ox + tilt * 0.6, y + 0.82, z + oz + tilt * 0.3), (x + ox + tilt * 0.62, y + 0.92, z + oz + tilt * 0.3), 0.01, P, seg=6)
    elif kind == 'sidetable':  # 沙發中間的小圓桌：木頭桌面、白鐵腳、一盆小盆栽、兩本雜誌
        cyl(n + '_top', MAT['wood'], (x, y + 0.5, z), (x, y + 0.53, z), w / 2, P, seg=20)
        cyl(n + '_leg', MAT['steel'], (x, y, z), (x, y + 0.5, z), 0.025, P, seg=8)
        cyl(n + '_foot', MAT['steel'], (x, y, z), (x, y + 0.02, z), w / 2 * 0.7, P, seg=16)
        box(n + '_mag1', MAT['navy'], x - 0.12, x + 0.06, y + 0.53, y + 0.54, z - 0.02, z + 0.11, P)
        box(n + '_mag2', MAT['white'], x - 0.1, x + 0.08, y + 0.54, y + 0.548, z - 0.0, z + 0.13, P)
        cyl(n + '_pot', MAT['cream'], (x + 0.1, y + 0.53, z - 0.08), (x + 0.1, y + 0.65, z - 0.08), 0.05, P, seg=12)
        PL.potted(mesh_obj, PM, n + '_plant', P, x + 0.1, y + 0.65, z - 0.08, 0.07, seed=911 + i)

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
        box(f'{pre}_sofa_back_{i}', MAT['leather'], x0, x1, y + 0.38, y + 0.85, bz0, bz1, P, bevel=0.04)   # 椅背、扶手的底伸進座墊裡（原本和座墊頂同一個平面）
        for sx in (x0 - 0.005, x1 - 0.175): box(f'{pre}_sofa_arm_{i}_{sx:.1f}', MAT['leather'], sx, sx + 0.18, y + 0.37, y + 0.62, z0 + 0.006, z1 - 0.006, P, bevel=0.03)   # 扶手比座墊寬 5 mm、比椅背短 6 mm（不同平面）
        for (lx, lz) in ((x0 + 0.1, z0 + 0.1), (x1 - 0.1, z0 + 0.1), (x0 + 0.1, z1 - 0.1), (x1 - 0.1, z1 - 0.1)): box(f'{pre}_sofa_leg_{i}_{lx:.1f}{lz:.1f}', MAT['frame'], lx - 0.025, lx + 0.025, y, y + 0.06, lz - 0.025, lz + 0.025, P)
    elif f['type'] == 'planter':
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=f['r'] * 0.88, radius2=f['r'], depth=0.6)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.3, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_planter_{i}', bm, MAT['granite'], P)
        PL.potted(mesh_obj, PM, f'{pre}_plant_{i}', P, f['x'], y + 0.6, f['z'], f['r'], seed=401 + i * 7 + (100 if pre == 'L1' else 0))   # 大葉盆栽（模型葉子）；原本是多面體圓球
    elif f['type'] == 'bench':
        box(f'{pre}_bench_seat_{i}', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y + 0.42, y + 0.47, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        for sx in (-1, 1): box(f'{pre}_bench_leg_{i}_{sx}', MAT['steel'], f['x'] + sx * (f['w'] / 2 - 0.12) - 0.03, f['x'] + sx * (f['w'] / 2 - 0.12) + 0.03, y, y + 0.42, f['z'] - f['d'] * 0.45, f['z'] + f['d'] * 0.45, P)
    elif f['type'] == 'board':
        box(f'{pre}_board_frame', MAT['frame'], f['x'] - f['w'] / 2 - 0.05, f['x'] + f['w'] / 2 + 0.05, y + 1.65 - f['w'] / 4 - 0.05, y + 1.65 + f['w'] / 4 + 0.05, f['z'] - 0.05, f['z'] - 0.01, P)
    elif f['type'] == 'prop':
        lobby_prop(f, P, pre, y, i)

# ---------------- 大廳第二版：不擋路的細部（LINZE-LOBBY-V2-1028）----------------
# 入口的腳踏墊（深灰、淺一點的邊；平貼地面，不擋導航）
EN_ = L['entrance']
box('L0_doormat', MAT['mat'], 6.95, 7.85, 0.0, 0.008, EN_['z0'] + 0.1, EN_['z1'] - 0.1, L0)
for (xa, xb, za, zb) in ((6.95, 7.85, EN_['z0'] + 0.1, EN_['z0'] + 0.16), (6.95, 7.85, EN_['z1'] - 0.16, EN_['z1'] - 0.1), (6.95, 7.01, EN_['z0'] + 0.1, EN_['z1'] - 0.1)):
    box(f'L0_doormat_edge_{za:.2f}_{xa:.2f}', MAT['frame'], xa, xb, 0.0, 0.01, za, zb, L0)
# 消防栓箱（紅色，北牆、法學院辦公室門的東邊）＋上面的紅燈；滅火器（紅瓶）立在下面
_zf = -D / 2 + T / 2
box('L0_hydrant_box', MAT['red'], 2.75, 3.35, 0.75, 1.55, _zf, _zf + 0.16, L0, bevel=0.01, props={'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]})
box('L0_hydrant_door', MAT['white'], 2.83, 3.27, 0.95, 1.35, _zf + 0.16, _zf + 0.165, L0, props={'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]})
cyl('L0_hydrant_lamp', MAT['red'], (3.05, 1.6, _zf + 0.02), (3.05, 1.6, _zf + 0.1), 0.05, L0, seg=12)
cyl('L0_extinguisher', MAT['red'], (3.55, 0.0, _zf + 0.15), (3.55, 0.48, _zf + 0.15), 0.08, L0, seg=12)
cyl('L0_extinguisher_top', MAT['black'], (3.55, 0.48, _zf + 0.15), (3.55, 0.56, _zf + 0.15), 0.025, L0, seg=8)
# 緊急出口燈（綠色、會亮）：入口自動門上面（貼在橫櫺上）；北牆兩扇門上面各一盞小的
box('L0_exit_sign', MAT['exitg'], 7.74, 7.86, 2.62, 2.84, 3.6, 4.4, L0, props=FE)       # 貼在自動門上方的橫櫺（x 7.91 起）；跟著東面淡出（鏡頭在門外時不擋人）
box('L0_exit_glow', MAT['exitglow'], 7.73, 7.74, 2.65, 2.81, 3.65, 4.35, L0, props=FE)
_FN = {'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]}   # 北牆上的東西跟著北牆的門一起淡出
for x_ in (1.6, -3.0):   # 門牌（遊戲畫的，y 2.68～3.03）上面
    box(f'L0_exit_sm_{x_}', MAT['exitg'], x_ - 0.2, x_ + 0.2, 3.1, 3.26, _zf + 0.16, _zf + 0.2, L0, props=_FN)
    box(f'L0_exit_smg_{x_}', MAT['exitglow'], x_ - 0.17, x_ + 0.17, 3.12, 3.24, _zf + 0.2, _zf + 0.205, L0, props=_FN)
def open_top(ob):
    """方塊拿掉朝上的那一面：吊燈的發光條上面有燈體蓋著，朝上的面看不到；天花板、燈板不能有朝上的面（tests/room_ceiling_unit.js，LOBBY-CEIL-1028）"""
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z > 0.9], context='FACES_ONLY')
    bm.to_mesh(ob.data); bm.free(); return ob
# 中庭的吊燈：兩排細長的線型燈（深灰燈體、下面一條亮的），從屋頂吊兩條細線下來；在二樓視線（5.9 m）上面
for zr in (0.6, 3.8):
    for (xa, xb) in ((-4.6, -1.7), (-1.45, 1.45), (1.7, 4.6)):
        box(f'L1_pendant_{zr}_{xa}', MAT['frame'], xa, xb, 6.38, 6.46, zr - 0.05, zr + 0.05, L1)
        open_top(box(f'L1_pendant_glow_{zr}_{xa}', MAT['light'], xa + 0.03, xb - 0.03, 6.375, 6.38, zr - 0.035, zr + 0.035, L1))   # 發光條沒有頂面（上面有燈體蓋著）
        for xc in (xa + 0.25, xb - 0.25): cyl(f'L1_pendant_wire_{zr}_{xc:.2f}', MAT['frame'], (xc, 6.46, zr), (xc, RY, zr), 0.004, L1, seg=4)

# ---------------- 入口東牆的公布欄（LAWWW2-B 10-24；LAWWW-B 03:53：互動點搬到 (7.2, 1.2)，那裡沒有公布欄）----------------
# 一樓東面是玻璃帷幕：立在玻璃前面的獨立公布欄（白鐵框、兩根腳，淺色軟木板），面向大廳（−x）；腳在導航格的牆邊（x 7.6）外面，不用改導航。
# 跟著東面一起淡出（FE：鏡頭在建築外面時才不會擋住人）。兩張徵才單是另外的節點 L0_WALL_notice_job_cram／office（遊戲可以照 jobs3d.js 的 S.board2 開關：
# 補習班大二上、事務所大三上才貼，AA_433）。貼圖 tools/blender/linze_notice_tex.py（上面 1024×512＝軟木板 2.0 × 1.0 m，下面那一條是兩張徵才單）。
NB = dict(x=7.735, z0=0.2, z1=2.2, y0=1.0, y1=2.0)
_nm = bpy.data.materials.new('lz_notice'); _nm.use_nodes = True; _nm['tile'] = 1.0; _nt = _nm.node_tree; _nb = _nt.nodes['Principled BSDF']; _nb.inputs['Roughness'].default_value = 0.85
_tx = _nt.nodes.new('ShaderNodeTexImage'); _tx.image = bpy.data.images.load(os.path.join(ROOT, 'tools', 'blender', 'env_second', 'textures', 'gen', 'linze_notice.png')); _nt.links.new(_tx.outputs['Color'], _nb.inputs['Base Color'])   # 不經過 img()：不要縮成 512 × 512
MAT['notice'] = _nm
def uv_quad(name, mat, pts, uvs, parent, props=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in pts]; f = bm.faces.new(vs); uvl = bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    bm.normal_update(); return mesh_obj(name, bm, mat, parent, props)
X_, Z0_, Z1_, Y0_, Y1_ = NB['x'], NB['z0'], NB['z1'], NB['y0'], NB['y1']; VC = 1 - 512 / 768                   # 軟木板在貼圖的上面 512 列
uv_quad('L0_notice_cork', MAT['notice'], [(X_, Y0_, Z0_), (X_, Y0_, Z1_), (X_, Y1_, Z1_), (X_, Y1_, Z0_)], [(0, VC), (1, VC), (1, 1), (0, 1)], L0, FE)   # 朝 −x：左下在 −z
box('L0_notice_back', MAT['steel'], X_ + 0.005, X_ + 0.045, Y0_ - 0.05, Y1_ + 0.05, Z0_ - 0.05, Z1_ + 0.05, L0, props=FE)
for (ya, yb, za, zb) in ((Y1_, Y1_ + 0.05, Z0_ - 0.05, Z1_ + 0.05), (Y0_ - 0.05, Y0_, Z0_ - 0.05, Z1_ + 0.05), (Y0_, Y1_, Z0_ - 0.05, Z0_), (Y0_, Y1_, Z1_, Z1_ + 0.05)):
    box(f'L0_notice_frame_{ya:.2f}_{za:.2f}', MAT['steel'], X_ - 0.025, X_ + 0.005, ya, yb, za, zb, L0, props=FE)          # 框比軟木凸出 2.5 cm
for zl in (Z0_ + 0.18, Z1_ - 0.18):
    box(f'L0_notice_leg_{zl:.2f}', MAT['steel'], X_ + 0.005, X_ + 0.045, 0.04, Y0_ - 0.05, zl - 0.02, zl + 0.02, L0, props=FE)
    box(f'L0_notice_foot_{zl:.2f}', MAT['steel'], 7.63, 7.88, 0.0, 0.04, zl - 0.03, zl + 0.03, L0, props=FE)            # 腳在 x 7.63～7.88（導航格的牆邊 7.6 外面；直櫺從 7.9 起）
for key, (mx, my, w, h), (sx, sy, sw, sh) in (('cram', (0.62, 0.06, 0.21, 0.30), (0, 520, 128, 183)), ('office', (0.88, 0.06, 0.21, 0.30), (128, 520, 128, 183))):   # 和 linze_notice_tex.py 的 JOBS／JOB_SLOT 同一組
    za, zb, yb, ya = Z0_ + mx, Z0_ + mx + w, Y1_ - my, Y1_ - my - h; u0, u1, v0, v1 = sx / 1024, (sx + sw) / 1024, 1 - (sy + sh) / 768, 1 - sy / 768
    uv_quad(f'L0_WALL_notice_job_{key}', MAT['notice'], [(X_ - 0.004, ya, za), (X_ - 0.004, ya, zb), (X_ - 0.004, yb, zb), (X_ - 0.004, yb, za)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], L0, {'dir': [-1, 0, 0]})

# ---------------- 同一層、同材質的物件合併（減少 draw call；外牆不合併：要各自淡出）----------------
def join_by_material(level_root, prefix):
    """同材質合併；有自訂屬性 fadegrp 的（門、外牆上的框）照（群組, 材質）合併成 {prefix}_WALL_{群組}_{材質}，帶 dir（跟著牆淡出）"""
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH' or 'WALL_' in ob.name: continue
        groups.setdefault((ob.get('fadegrp'), ob.data.materials[0].name, ob.get('lm')), []).append(ob)   # lm（光照貼圖的比例）不同的分開合併，才不會丟掉
    for (fg, mname, lm), obs in groups.items():
        if len(obs) < 2 and not fg: continue
        dirv = list(obs[0]['fadedir']) if fg else None
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        pr = dict({'dir': dirv} if fg else {}, **({'lm': lm} if lm is not None else {}))
        mesh_obj((f'{prefix}_WALL_{fg}_{mname}' if fg else f'{prefix}_{mname}') + (f'_lm{lm:g}' if lm is not None else ''), bm, mat, level_root, props=pr or None)
# 大廳第二版的純色擺設合成一個頂點色材質（LOBBY-VC-1028，LAWWW2-C 10-28）：15 個純色材質每個各畫一次，大廳本身 draw call 多了 22～34%。
# 不發光、不是金屬的（粗糙度都是 0.6）換成同一個 lz_vc，顏色寫進頂點色；金、黃銅（金屬）、出口燈的發光面照舊。之後 join_by_material 照（淡出群組, 材質）合併
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'env_second'))
import lib2 as L2   # noqa: E402
_VC = L2.vc_material('lz_vc', rough=0.6)
L2.vc_consolidate(root, {MAT[k].name: _VC for k in ('red', 'exitg', 'black', 'white', 'mat', 'binB', 'binG', 'binK', 'cream', 'navy', 'umbR', 'paper')})
for r, pre in ((L0, 'L0'), (L1, 'L1')): join_by_material(r, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        sm = ob.data.materials[0].name.startswith(('lz_leaf_dark', 'lz_leaf_mid'))   # 模型葉子用平滑著色
        for p in ob.data.polygons: p.use_smooth = sm
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
