"""萬才館室內（一樓大廳＋二樓走廊、迴廊、門廳；直跑樓梯）正式模型：Blender 5.2 bpy 無介面執行 → GLB（WebP 貼圖）。萬才館第三階段（D42）。
配置讀 src/data/wancai_layout.js（遊戲的導航、互動點讀同一份，兩邊一定對得上）。貼圖：Poly Haven CC0（tools/blender/textures/、tools/blender/env_second/textures/）。
節點命名約定和霖澤館室內一樣（src/building3d.js 的 attachFormal）：
  L0_*：一樓；L1_*：二樓（玩家在一樓、鏡頭高過二樓地板時藏起來）；名字含 WALL_ 的是外牆（擋住鏡頭時淡出），自訂屬性 dir＝往室內的法線（遊戲座標）。
  不做：電梯（遊戲裡程序化、要動）、門牌／樓層簡介／演講廳指標的字與公告欄（遊戲用 canvas 畫，中文字型）、窗外的景、點地面用的透明地板。
真實性：室內沒有照片或平面圖，是遊戲化設計（D42）；材質方向：台灣大學系館常見的磨石子地、米色粉光牆、花崗石牆腳與樓梯、木門。
座標：遊戲 (x 東, y 上, z 南) ＝ Blender (x, -z, y)（glTF 匯出 +Y up 會轉回去）。
用法：/opt/blenv/bin/python tools/blender/wancai_interior.py [--out assets/models/env/wancai_interior.glb] [--tex 512] [--render 輸出資料夾]
"""
import bpy, bmesh, json, math, os, re, sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEX = os.path.join(ROOT, 'tools', 'blender', 'textures')
TEX2 = os.path.join(ROOT, 'tools', 'blender', 'env_second', 'textures')   # 第二個 AI 下載的 Poly Haven CC0（只讀使用）：磨石子
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = os.path.join(ROOT, arg('--out', 'assets/models/env/wancai_interior.glb'))
TEXRES = int(arg('--tex', '512'))
RENDER = arg('--render')

src = open(os.path.join(ROOT, 'src/data/wancai_layout.js'), encoding='utf8').read()
L = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src, re.S).group(1))
W, D, Y1, RY, T = L['W'], L['D'], L['floors'][1]['y'], L['roofY'], L['wallT']
S, U, EL, FG = L['stair'], L['upper'], L['elevator'], L['frontGlass']
F1, LD, F2 = S['flight1'], S['landing'], S['flight2']

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

def pbr(name, pid=None, tile=1.0, tint=None, rough=None, metal=0.0, alpha=None, emit=None, normal=0.8, target=None, sat=1.0, base_dir=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Metallic'].default_value = metal
    m['tile'] = tile
    if pid:
        base = os.path.join(base_dir or TEX, pid, pid)
        tc = N.new('ShaderNodeTexImage'); tc.image = B.img_adj(base + '_diff_1k.jpg', sat, 1.0, target) if target else img(base + '_diff_1k.jpg')
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
    'floor':   pbr('wc_terrazzo', 'terrazzo_tiles', tile=1.6, sat=0.55, target='#d8d0c2', base_dir=TEX2),       # 一二樓：米色磨石子地（v9.3 大廳的米色石材地板 #e6dccb，稍微暗一點：室內燈光下會亮）
    'granite': pbr('wc_granite', 'granite_tile_03', tile=1.8, sat=0.4, target='#b9b2a6'),                     # 牆腳 1.2 m、柱子、樓板邊收邊
    'step':    pbr('wc_step', 'granite_tile_03', tile=0.9, sat=0.35, target='#a8a39b'),                       # 樓梯踏面與平台（深一點的花崗石）
    'plaster': pbr('wc_plaster', 'painted_plaster_wall', tile=2.5, target='#eae1d3'),                          # v9.3 大廳的牆色（米色粉光）
    'slab':    pbr('wc_slab', 'painted_plaster_wall', tile=2.5, target='#efebe4'),                             # 二樓樓板底面（一樓的天花板）
    'ceiling': pbr('wc_ceiling', 'ceiling_interior', tile=2.0, sat=0.2, target='#efeeea', normal=0.3),
    'woodD':   pbr('wc_wood_dark', 'fine_grained_wood', tile=1.6, target='#6e5848'),                           # 門
    'wood':    pbr('wc_wood', 'fine_grained_wood', tile=1.6, target='#a77d57'),                                # 長椅
    'table':   pbr('wc_table', 'wood_table_001', tile=1.0, target='#c9a57a'),                                  # 圓桌（v9.3 #c9a57a）
    'sofa':    pbr('wc_sofa', 'fabric_leather_02', tile=1.0, sat=0.4, target='#36574a'),                       # 深綠色沙發（v9.3 #2f5d50／#3e5a48）
    'steel':   pbr('wc_steel', None, tint=srgb('#c9ccd0'), rough=0.28, metal=0.45),   # 遊戲沒有環境貼圖：金屬度上限 0.45（b3lib.MAX_METAL）
    'frame':   pbr('wc_frame', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35),
    'glass':   pbr('wc_glass', None, tint=srgb('#c4d6dc'), rough=0.05, alpha=0.22),
    'light':   pbr('wc_light_panel', None, tint=srgb('#fff6e4'), rough=0.9, emit=srgb('#fff4dc')),
    'plant':   pbr('wc_plant', None, tint=srgb('#4f7a46'), rough=0.85),
    'plaque':  pbr('wc_plaque', 'fine_grained_wood', tile=1.6, target='#c9a77a'),                          # 法律學院圖書館的名牌（淺色木板：遊戲畫的字是深咖啡色）
    'llfloor': pbr('wc_lawlib_floor', None, tint=srgb('#c4bdb1'), rough=0.45),               # 門後看得到的一小段圖書館：和 lawlib_interior.glb 一樓地磚同色（只從玻璃門看得到，用純色：GLB 少 0.2 MB）
    'llwhite': pbr('wc_lawlib_white', None, tint=srgb('#f2f1ec'), rough=0.4),
    'llglow':  pbr('wc_lawlib_glow', None, tint=srgb('#f6f1e6'), rough=0.9, emit=srgb('#efe6d4')),
}
MAT['nosing'] = pbr('wc_nosing', None, tint=srgb('#3a3d40'), rough=0.45, metal=0.35)   # 樓梯止滑條（顏色和 frame 一樣；WANCAI-LM-1028：不烘）
MAT['ceiling'].use_backface_culling = True   # 天花板單面（四邊形本來就朝下）：鏡頭拉遠到天花板上面時看得穿（ART-CEIL-LAWWW-ROOMS-1022，LAWWW2 10-22）
MAT['light'].use_backface_culling = True     # 嵌在天花板的燈板、崁燈也單面（四邊形本來就朝下）：鏡頭在天花板上面時不會浮著一塊塊亮的（LAWWW2 10-22 第二版）

# ---------------- 幾何（和霖澤館室內同一套小工具）----------------
PM = PL.materials('wc_')   # 盆栽的材質（樹皮、土、葉子）

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

def cyl(name, mat, a, b, r, parent=None, seg=10, props=None):
    pa, pb = g2b(*a), g2b(*b); d = pb - pa; L_ = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=L_)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=rot.to_matrix()); bmesh.ops.translate(bm, verts=bm.verts, vec=(pa + pb) / 2)
    bm.normal_update(); box_uv(bm, 1.0)
    return mesh_obj(name, bm, mat, parent, props)

def group(name, parent=None, props=None):
    ob = bpy.data.objects.new(name, None); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    for k, v in (props or {}).items(): ob[k] = v
    return ob

root = group('WancaiInterior')
L0 = group('L0_root', root); L1 = group('L1_root', root)
SE, RZ, RXU = U['slabEdge'], U['railZ'], U['railX']

# ---------------- 地板、二樓樓板、天花板 ----------------
box('L0_floor', MAT['floor'], -W / 2, W / 2, -0.25, 0.0, -D / 2, D / 2, L0, props={'lm': 1.6, 'lmhide': 'side'})   # lm／lmhide：光照貼圖（lightbake/bake_room.py；WANCAI-LM-1028）——地板最常看到；四邊的側面埋在牆裡或在玻璃外面
WI0, WI1, ZI0, ZI1 = -W / 2 + T / 2, W / 2 - T / 2, -D / 2 + T / 2, D / 2 - T / 2   # 樓板、地板停在牆的內面（原本伸進牆裡）
SLABS = (('corr', WI0, WI1, ZI0, SE), ('gall', S['railX'], RXU, SE, F2['z1']), ('foyer', WI0, RXU, F2['z1'], ZI1))
for nm, x0, x1, z0, z1 in SLABS:
    box(f'L1_slab_{nm}', MAT['slab'], x0, x1, Y1 - U['slabT'], Y1 - 0.02, z0, z1, L1, props={'lmhide': [0, 1, 0]})   # 樓板上面被地板蓋住
    box(f'L1_floor_{nm}', MAT['floor'], x0, x1, Y1 - 0.02, Y1, z0, z1, L1, props={'lm': 1.3})
# 樓板邊的石材收邊（面向中庭、樓梯井的邊）
box('L1_edge_corr', MAT['granite'], WI0, WI1, Y1 - U['slabT'] - 0.06, Y1 + 0.02, SE - 0.02, SE + 0.06, L1, bevel=0.01)
box('L1_edge_gall_E', MAT['granite'], RXU - 0.06, RXU + 0.02, Y1 - U['slabT'] - 0.06, Y1 + 0.02, SE, D / 2 - 0.145, L1, bevel=0.01)   # 停在帷幕直櫺前面（原本和最西邊的直櫺側面同一個平面）
box('L1_edge_gall_W', MAT['granite'], S['railX'] - 0.02, S['railX'] + 0.06, Y1 - U['slabT'] - 0.06, Y1 + 0.02, SE, F2['z1'], L1, bevel=0.01)
# 天花板（中庭頂、二樓天花板）：單面朝下＋燈板；一樓樓板底下的嵌燈
quad('L1_ceiling', MAT['ceiling'], [(-W / 2, RY, -D / 2), (W / 2, RY, -D / 2), (W / 2, RY, D / 2), (-W / 2, RY, D / 2)], L1)['lm'] = 0.3   # 8.4 m 高，很少看到
for i in range(4):
    for j in range(3):
        cx, cz = -6 + i * 4, -4.5 + j * 4.6
        quad(f'L1_light_{i}_{j}', MAT['light'], [(cx - 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz - 0.3), (cx + 0.6, RY - 0.01, cz + 0.3), (cx - 0.6, RY - 0.01, cz + 0.3)], L1)
yb = Y1 - U['slabT'] - 0.005
for i in range(6):
    for z in (-5.6, -3.4):
        x = -7.5 + i * 3
        quad(f'L0_downlight_{i}_{z}', MAT['light'], [(x - 0.14, yb, z - 0.14), (x + 0.14, yb, z - 0.14), (x + 0.14, yb, z + 0.14), (x - 0.14, yb, z + 0.14)], L0)
for z in (0.0, 2.6):   # 迴廊底下
    x = (S['railX'] + RXU) / 2
    quad(f'L0_downlight_g_{z}', MAT['light'], [(x - 0.14, yb, z - 0.14), (x + 0.14, yb, z - 0.14), (x + 0.14, yb, z + 0.14), (x - 0.14, yb, z + 0.14)], L0)

# ---------------- 柱子（一樓，撐著二樓樓板）：花崗石方柱＋柱頭 ----------------
for k, (x, z, r) in enumerate(L['columns']):
    h = Y1 - U['slabT']
    box(f'L0_column_{k}', MAT['granite'], x - r, x + r, 0, h, z - r, z + r, L0, bevel=0.02)
    box(f'L0_column_base_{k}', MAT['step'], x - r - 0.03, x + r + 0.03, 0, 0.12, z - r - 0.03, z + r + 0.03, L0, bevel=0.01)

# ---------------- 外牆：北（門洞）、西、東、南（西段實牆＋二樓的門，東段兩層樓高的玻璃帷幕）----------------
def wall_with_doors(prefix, parent, z, y0, y1, doors, lvl, ylo=None, yhi=None):
    """北牆一段（y0..y1），門洞寬 1.5 高 2.6；牆下段 1.2 m 花崗石、上面粉光。
    ylo／yhi：牆體的實際上下緣（一樓的牆停在二樓地板下 3 cm、二樓的牆往下接：牆頂和二樓地板不同平面，BUG-COPLANAR-DEV）"""
    wy0 = y0 if ylo is None else ylo; wy1 = y1 if yhi is None else yhi
    xs = sorted(d['x'] for d in doors if d['lv'] == lvl)
    segs = []; x = -W / 2 + T / 2                 # 北牆夾在東西牆中間（牆角不重疊）
    for dx in xs: segs.append((x, dx - 0.75)); x = dx + 0.75
    segs.append((x, W / 2 - T / 2))
    for k, (a, b) in enumerate(segs):
        if b - a < 0.05: continue
        box(f'{prefix}_WALL_N_{k}', MAT['granite'], a, b, wy0, y0 + 1.2, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1]})
        box(f'{prefix}_WALL_Nu_{k}', MAT['plaster'], a, b, y0 + 1.2, wy1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1], 'lm': 0.7 if lvl else 1.0})   # 二樓的上半段（5.4～8.4 m）光照貼圖少分一點
    for dx in xs:   # 門楣、門框、門板、門把（跟著北牆淡出）
        box(f'{prefix}_WALL_Nd_{dx}', MAT['plaster'], dx - 0.75, dx + 0.75, y0 + 2.6, wy1, z - T / 2, z + T / 2, parent, props={'dir': [0, 0, 1], 'lm': 0.7 if lvl else 1.0})
        FN = {'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]}
        box(f'{prefix}_doorframe_{dx}', MAT['frame'], dx - 0.8, dx + 0.8, y0, y0 + 2.7, z + T / 2 - 0.02, z + T / 2 + 0.05, parent, props=FN)
        box(f'{prefix}_door_{dx}', MAT['woodD'], dx - 0.68, dx + 0.68, y0, y0 + 2.5, z + T / 2 + 0.05, z + T / 2 + 0.09, parent, props=FN)
        h_ = cyl(f'{prefix}_doorhandle_{dx}', MAT['steel'], (dx + 0.45, y0 + 0.9, z + T / 2 + 0.14), (dx + 0.45, y0 + 1.3, z + T / 2 + 0.14), 0.018, parent)
        for k_, v_ in FN.items(): h_[k_] = v_

YJ = Y1 - 0.03                    # 一樓、二樓的牆在這裡接（藏在二樓樓板裡）
wall_with_doors('L0', L0, -D / 2, 0, Y1, L['doors'], 0, yhi=YJ)
wall_with_doors('L1', L1, -D / 2, Y1, RY, L['doors'], 1, ylo=YJ)
LLD = L['lawlibDoor']; LZ0, LZ1 = LLD['z'] - LLD['w'] / 2, LLD['z'] + LLD['w'] / 2   # 法律學院圖書館的門洞（一樓西牆南段）
ZO0, ZO1 = -D / 2 - T / 2, D / 2 + T / 2   # 東西牆往南北多半個牆厚，包住牆角
for pre, P, y0, y1 in (('L0', L0, 0, YJ), ('L1', L1, YJ, RY)):
    if pre == 'L0':   # 門洞兩側、門楣上面三塊（第二 AI 2026-10-13，LAWWW 授權只改門洞、門、名牌）
        for k, (za, zb, ya, yb) in enumerate(((ZO0, LZ0, y0, y1), (LZ1, ZO1, y0, y1), (LZ0, LZ1, LLD['h'], y1))):
            box(f'{pre}_WALL_W_{k}', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, ya, yb, za, zb, P, props={'dir': [1, 0, 0]})
    else: box(f'{pre}_WALL_W', MAT['plaster'], -W / 2 - T / 2, -W / 2 + T / 2, y0, y1, ZO0, ZO1, P, props={'dir': [1, 0, 0], 'lm': 0.8})
    yb_ = 1.2 if pre == 'L0' else Y1 + 1.2
    box(f'{pre}_WALL_E', MAT['plaster'], W / 2 - T / 2, W / 2 + T / 2, yb_, y1, ZO0, ZO1, P, props={'dir': [-1, 0, 0], 'lm': 0.8 if pre == 'L1' else 1.0})
    box(f'{pre}_WALL_Eb', MAT['granite'], W / 2 - T / 2, W / 2 + T / 2, y0, yb_, ZO0, ZO1, P, props={'dir': [-1, 0, 0]})
    for k, (za, zb) in enumerate(((ZI0, LZ0), (LZ1, ZI1)) if pre == 'L0' else ((ZI0, ZI1),)):   # 踢腳板停在南北牆的內面
        fy = 0.0 if pre == 'L0' else Y1   # 踢腳板從那一層的地板算（y0 是牆接縫的高度）
        box(f'{pre}_wallbase_W_{k}', MAT['woodD'], -W / 2 + T / 2, -W / 2 + T / 2 + 0.02, fy, fy + 0.12, za, zb, P)
# ---------------- 法律學院圖書館的門（一樓西牆南段；第二 AI 2026-10-13 做，LAWWW 授權只改門洞、門、名牌、盆栽位置）----------------
# 鋁框、兩扇玻璃門（關著：進去是遊戲的互動點，lawlib 區域）、直把手；門上的木作名牌（淺色木板＋胡桃木框；字是遊戲畫的 W3.signPlane，深咖啡色）。
# 門後補一小段圖書館（地磚、白牆、天花板、防盜感應門柱、亮的牆）：從大廳看進玻璃門不是空的。門框、名牌跟著西牆淡出（fadegrp）；玻璃不放進淡出群組（會被設成不透明）。
xw = -W / 2; FP = {'fadegrp': 'Wdoor', 'fadedir': [1, 0, 0]}; zc = LLD['z']; hD = LLD['h']
for k, (za, zb) in enumerate(((LZ0, LZ0 + 0.05), (LZ1 - 0.05, LZ1))): box(f'L0_lldoor_jamb_{k}', MAT['frame'], xw - T / 2, xw + T / 2 + 0.02, 0, hD, za, zb, L0, props=FP)
box('L0_lldoor_head', MAT['frame'], xw - T / 2, xw + T / 2 + 0.02, hD - 0.05, hD, LZ0, LZ1, L0, props=FP)
for k, (za, zb) in enumerate(((LZ0 + 0.05, zc - 0.004), (zc + 0.004, LZ1 - 0.05))):
    for (a, b) in ((za, za + 0.05), (zb - 0.05, zb)): box(f'L0_lldoor_stile_{k}_{a:.2f}', MAT['frame'], xw - 0.025, xw + 0.025, 0.0, hD - 0.06, a, b, L0, props=FP)
    box(f'L0_lldoor_rail_t_{k}', MAT['frame'], xw - 0.025, xw + 0.025, hD - 0.11, hD - 0.06, za, zb, L0, props=FP)
    box(f'L0_lldoor_rail_b_{k}', MAT['frame'], xw - 0.025, xw + 0.025, 0.0, 0.14, za, zb, L0, props=FP)
    quad(f'L0_lldoor_glass_{k}', MAT['glass'], [(xw, 0.14, za + 0.05), (xw, 0.14, zb - 0.05), (xw, hD - 0.11, zb - 0.05), (xw, hD - 0.11, za + 0.05)], L0, tile=1.0)
for k, zz in enumerate((zc - 0.08, zc + 0.08)):   # 直把手（大廳那一側）
    h_ = cyl(f'L0_lldoor_handle_{k}', MAT['steel'], (xw + 0.075, 0.8, zz), (xw + 0.075, 1.4, zz), 0.014, L0)
    for k_, v_ in FP.items(): h_[k_] = v_
    for yy in (0.85, 1.35):
        h_ = cyl(f'L0_lldoor_standoff_{k}_{yy}', MAT['steel'], (xw + 0.025, yy, zz), (xw + 0.075, yy, zz), 0.008, L0)
        for k_, v_ in FP.items(): h_[k_] = v_
pw = LLD['w'] + 0.9; xi = xw + T / 2                                                    # 名牌：中心 y＝門高＋0.42（遊戲的字在 x＝−W/2＋0.17）
box('L0_lldoor_plaque', MAT['plaque'], xi, xi + 0.05, hD + 0.21, hD + 0.63, zc - pw / 2, zc + pw / 2, L0, props=FP)
for k, (ya, yb, za, zb) in enumerate(((hD + 0.18, hD + 0.21, zc - pw / 2 - 0.03, zc + pw / 2 + 0.03), (hD + 0.63, hD + 0.66, zc - pw / 2 - 0.03, zc + pw / 2 + 0.03),
                                       (hD + 0.21, hD + 0.63, zc - pw / 2 - 0.03, zc - pw / 2), (hD + 0.21, hD + 0.63, zc + pw / 2, zc + pw / 2 + 0.03))):
    box(f'L0_lldoor_plaque_frame_{k}', MAT['woodD'], xi, xi + 0.06, ya, yb, za, zb, L0, props=FP)
# 門後：圖書館入口的一小段（x −9.1 往西 2.8 m）
bx0, bx1, bz0, bz1 = xw - 2.9, xw - T / 2, LZ0 - 1.2, LZ1 + 1.2
box('L0_lldoor_beyond_floor', MAT['llfloor'], bx0, bx1, -0.05, 0.0, bz0, bz1, L0)
quad('L0_lldoor_beyond_ceiling', MAT['llwhite'], [(bx0, 3.6, bz0), (bx1, 3.6, bz0), (bx1, 3.6, bz1), (bx0, 3.6, bz1)], L0, tile=1.0)
quad('L0_lldoor_beyond_wallN', MAT['llwhite'], [(bx1, 0, bz0), (bx0, 0, bz0), (bx0, 3.6, bz0), (bx1, 3.6, bz0)], L0, tile=1.0)
quad('L0_lldoor_beyond_wallS', MAT['llwhite'], [(bx0, 0, bz1), (bx1, 0, bz1), (bx1, 3.6, bz1), (bx0, 3.6, bz1)], L0, tile=1.0)
quad('L0_lldoor_beyond_glow', MAT['llglow'], [(bx0, 0, bz0), (bx0, 0, bz1), (bx0, 3.6, bz1), (bx0, 3.6, bz0)], L0, tile=1.0)
for k, zz in enumerate((LZ0 - 0.25, LZ1 + 0.25)):   # 防盜感應門柱（圖書館裡面那一對，和 lawlib_interior.glb 一樣）
    box(f'L0_lldoor_gate_{k}', MAT['llwhite'], xw - 1.25, xw - 1.2, 0.06, 1.5, zz - 0.25, zz + 0.25, L0)
    box(f'L0_lldoor_gatebase_{k}', MAT['frame'], xw - 1.29, xw - 1.16, 0.0, 0.06, zz - 0.28, zz + 0.28, L0)

# 南面西段（x -9 ~ 玻璃帷幕的西端）：一樓實牆；二樓實牆＋通到外面平台的玻璃門（門洞寬 1.7 高 2.6）
UD = L['upperDoor']; ux0, ux1 = UD['x'] - 0.85, UD['x'] + 0.85
box('L0_WALL_S', MAT['plaster'], WI0, FG['x0'], 1.2, YJ, D / 2 - T / 2, D / 2 + T / 2, L0, props={'dir': [0, 0, -1]})
box('L0_WALL_Sb', MAT['granite'], WI0, FG['x0'], 0, 1.2, D / 2 - T / 2, D / 2 + T / 2, L0, props={'dir': [0, 0, -1]})
for k, (a, b) in enumerate(((WI0, ux0), (ux1, FG['x0']))):
    box(f'L1_WALL_S_{k}', MAT['plaster'], a, b, YJ, RY, D / 2 - T / 2, D / 2 + T / 2, L1, props={'dir': [0, 0, -1]})
box('L1_WALL_Sd', MAT['plaster'], ux0, ux1, Y1 + 2.6, RY, D / 2 - T / 2, D / 2 + T / 2, L1, props={'dir': [0, 0, -1]})
FD = {'fadegrp': 'Sdoor', 'fadedir': [0, 0, -1]}
box('L1_updoor_frame_t', MAT['frame'], ux0, ux1, Y1 + 2.52, Y1 + 2.62, D / 2 - T / 2 - 0.04, D / 2 + T / 2 + 0.005, L1, props=FD)   # 門框比牆外面凸出 5 mm
for k, x in enumerate((ux0, UD['x'] - 0.02, ux1 - 0.08)):
    box(f'L1_updoor_frame_{k}', MAT['frame'], x, x + 0.1 if k != 1 else x + 0.04, Y1, Y1 + 2.52, D / 2 - T / 2 - 0.04, D / 2 + T / 2 + 0.005, L1, props=FD)   # 直框停在上框下面（原本在轉角重疊）
quad('L1_updoor_glass', MAT['glass'], [(ux1, Y1, D / 2), (ux0, Y1, D / 2), (ux0, Y1 + 2.52, D / 2), (ux1, Y1 + 2.52, D / 2)], L1, tile=1.0)
cyl('L1_updoor_handle_a', MAT['steel'], (UD['x'] - 0.12, Y1 + 0.8, D / 2 - T / 2 - 0.1), (UD['x'] - 0.12, Y1 + 1.5, D / 2 - T / 2 - 0.1), 0.02, L1, props=FD)
cyl('L1_updoor_handle_b', MAT['steel'], (UD['x'] + 0.12, Y1 + 0.8, D / 2 - T / 2 - 0.1), (UD['x'] + 0.12, Y1 + 1.5, D / 2 - T / 2 - 0.1), 0.02, L1, props=FD)
# 南面東段：兩層樓高的玻璃帷幕＋直櫺＋三道橫櫺；一樓入口兩扇玻璃自動門的框（x 0 ± 1.2）
gh2 = RY - 0.4; gx0, gx1 = FG['x0'], FG['x1']
FS = {'fadegrp': 'Sfacade', 'fadedir': [0, 0, -1]}
GZS = D / 2 - 0.07                # 玻璃放在直櫺深度的中間（原本和框外面同一個平面）
quad('L0_glass_S', MAT['glass'], [(gx0, 0, GZS), (gx1, 0, GZS), (gx1, gh2, GZS), (gx0, gh2, GZS)], L0)
n = 7
for i in range(n + 1):
    x = gx0 + i * (gx1 - gx0) / n
    box(f'L0_mullion_S_{i}', MAT['frame'], x - 0.06, x + 0.06, 0, gh2, D / 2 - 0.14, D / 2 + 0.01, L0, props=FS)   # 框凸出 1 cm
for k, yy in enumerate((2.9, Y1, Y1 + 2.9)):
    box(f'L0_transom_S_{k}', MAT['frame'], gx0, min(gx1, WI1), yy - 0.06, yy + 0.06, D / 2 - 0.13, D / 2 + 0.005, L0, props=FS)   # 橫櫺比直櫺薄一點
box('L0_glass_top_S', MAT['granite'], gx0, min(gx1, WI1), gh2, RY, D / 2 - T / 2, D / 2 + T / 2, L0, props={'dir': [0, 0, -1]})
EX = L['entrance']['x']
for k, (a, b) in enumerate(((EX - 1.2, EX - 0.02), (EX + 0.02, EX + 1.2))):
    box(f'L0_autodoor_{k}', MAT['frame'], a, b, 2.55, 2.62, D / 2 - 0.2, D / 2 - 0.14, L0, props=FS)
    box(f'L0_autodoor_side_{k}', MAT['frame'], a if k == 0 else b - 0.05, a + 0.05 if k == 0 else b, 0, 2.6, D / 2 - 0.2, D / 2 - 0.14, L0, props=FS)
box('L0_entrance_mat', MAT['frame'], EX - 1.3, EX + 1.3, 0.0, 0.012, D / 2 - 1.6, D / 2 - 0.2, L0)   # 入口地墊

# ---------------- 樓梯（往南爬）：每一階一塊石材（實心到地面）＋止滑條、平台；東側玻璃欄板＋不鏽鋼扶手、西牆扶手 ----------------
# WANCAI-LM-1028（LAWWW2-C 10-28）：樓梯從「每一階一個從地面長上來的方塊」改成只有看得到的面（和霖澤館大廳 LINZE-LOBBY-V2-1028 一樣）：
# 原本方塊互相重疊，光照貼圖大半分給看不到的面。外觀一樣（止滑條照舊，自己的材質：1.5 cm 高，光照貼圖分不到一個像素，不烘）。
# 往南爬（+z）：踢面朝北（−z）。西側面貼著西牆的內面（x0＝牆面），看不到，不做；東側面從大廳看得到。第一跑的背面貼著平台、底面貼地，不做；第二跑的背面（z＝flight2.z1，朝南）在二樓門廳下面看得到
def stair_faces(prefix, z0, base, n, front_from):
    R, Tr, x0, x1 = S['rise'], S['tread'], S['x0'], S['x1']
    prof = [(z0, front_from)]                          # (z, y)：前緣（北）→ 鋸齒往上 → 最上面一階的後緣（南）
    for k in range(n):
        za = z0 + k * Tr; top = base + (k + 1) * R
        prof += [(za, top), (za + Tr, top)]
        box(f'{prefix}_nosing_{k}', MAT['nosing'], x0, x1, top - 0.012, top + 0.003, za, za + 0.045, L0)   # 止滑條（踏面前緣＝北邊）
    bm = bmesh.new()
    for (za, ya), (zb_, yb) in zip(prof[:-1], prof[1:]):
        f = bm.faces.new([bm.verts.new(g2b(x, y, z)) for (x, y, z) in ((x0, ya, za), (x1, ya, za), (x1, yb, zb_), (x0, yb, zb_))]); f.normal_update()
        if abs(za - zb_) < 1e-6:                        # 踢面：朝北（−遊戲 z）＝Blender +y
            if f.normal.y < 0: f.normal_flip()
        elif f.normal.z < 0: f.normal_flip()           # 踏面：朝上
    zt, yt = prof[-1]
    if base > 0:                                       # 第二跑的背面（地面到二樓，朝南＝Blender −y）
        f = bm.faces.new([bm.verts.new(g2b(*p)) for p in ((x0, 0, zt), (x0, yt, zt), (x1, yt, zt), (x1, 0, zt))]); f.normal_update()
        if f.normal.y > 0: f.normal_flip()
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.normal_update(); box_uv(bm, MAT['step']['tile'])
    mesh_obj(f'{prefix}_steps', bm, MAT['step'], L0)
    side = prof + [(zt, 0.0)] + ([(z0, 0.0)] if front_from > 0 else [])   # 東側面：鋸齒往下接到地面
    bm = bmesh.new(); f = bm.faces.new([bm.verts.new(g2b(x1, y, z)) for (z, y) in side]); f.normal_update()
    if f.normal.x < 0: f.normal_flip()
    bm.normal_update(); box_uv(bm, MAT['step']['tile']); mesh_obj(f'{prefix}_side_E', bm, MAT['step'], L0)
stair_faces('L0_f1', F1['z0'], 0.0, F1['risers'], 0.0)
# 平台：上面＋東側面（從大廳看得到）；西側貼牆、南北兩面貼著兩跑，不做
quad('L0_landing_top', MAT['step'], [(S['x0'], LD['y'], LD['z1']), (S['x1'], LD['y'], LD['z1']), (S['x1'], LD['y'], LD['z0']), (S['x0'], LD['y'], LD['z0'])], L0)
quad('L0_landing_E', MAT['step'], [(S['x1'], 0, LD['z0']), (S['x1'], LD['y'], LD['z0']), (S['x1'], LD['y'], LD['z1']), (S['x1'], 0, LD['z1'])], L0)
stair_faces('L0_f2', F2['z0'], LD['y'], F2['risers'], LD['y'])
rx = S['railX'] + 0.02
pts = [(S['railZ0'], 0.0), (F1['z1'], LD['y']), (LD['z1'], LD['y']), (F2['z1'], Y1)]
for i in range(len(pts) - 1):
    (za, ya), (zb, yb2) = pts[i], pts[i + 1]
    quad(f'L0_stair_glass_{i}', MAT['glass'], [(rx, ya + 0.08, za), (rx, yb2 + 0.08, zb), (rx, yb2 + 1.0, zb), (rx, ya + 1.0, za)], L0, tile=1.0)
    cyl(f'L0_stair_rail_{i}', MAT['steel'], (rx, ya + 1.02, za), (rx, yb2 + 1.02, zb), 0.03, L0)
    cyl(f'L0_wall_rail_{i}', MAT['steel'], (S['x0'] + 0.06, ya + 0.9, za), (S['x0'] + 0.06, yb2 + 0.9, zb), 0.022, L0)
box('L0_stair_post', MAT['steel'], rx - 0.03, rx + 0.03, 0, 1.05, S['railZ0'] - 0.03, S['railZ0'] + 0.03, L0)

# ---------------- 二樓的玻璃欄杆：樓梯井北邊、迴廊兩側、走廊南邊（電梯門口留開口）----------------
def glass_rail(name, a, b, y, parent):
    (x0, z0), (x1, z1) = a, b
    quad(f'{name}_glass', MAT['glass'], [(x0, y + 0.05, z0), (x1, y + 0.05, z1), (x1, y + 1.0, z1), (x0, y + 1.0, z0)], parent, tile=1.0)
    cyl(f'{name}_rail', MAT['steel'], (x0, y + 1.04, z0), (x1, y + 1.04, z1), 0.03, parent)
    if abs(x1 - x0) > abs(z1 - z0): box(f'{name}_shoe', MAT['steel'], min(x0, x1), max(x0, x1), y, y + 0.1, z0 - 0.04, z0 + 0.04, parent)
    else: box(f'{name}_shoe', MAT['steel'], x0 - 0.04, x0 + 0.04, y, y + 0.1, min(z0, z1), max(z0, z1), parent)
glass_rail('L1_rail_well_N', (-W / 2 + T / 2, RZ), (S['railX'], RZ), Y1, L1)
glass_rail('L1_rail_gall_W', (S['railX'], SE), (S['railX'], F2['z1']), Y1, L1)
glass_rail('L1_rail_gall_E', (RXU, SE), (RXU, D / 2 - T / 2), Y1, L1)
glass_rail('L1_rail_corr_0', (RXU, RZ), (EL['doorX0'] - 0.1, RZ), Y1, L1)
glass_rail('L1_rail_corr_1', (EL['doorX1'] + 0.1, RZ), (W / 2 - T / 2, RZ), Y1, L1)

# ---------------- 家具：沙發（v9.3 的深綠色兩人座）、圓桌、樓層簡介的框、花台、二樓長椅 ----------------
for i, f in enumerate(L['furniture']):
    P = L1 if f['lv'] else L0; y = Y1 if f['lv'] else 0.0; pre = 'L1' if f['lv'] else 'L0'
    if f['type'] == 'sofa':   # ry=0：坐的那一面朝南（+z），靠背在北邊
        x0, x1, z0, z1 = f['x'] - 1.1, f['x'] + 1.1, f['z'] - 0.43, f['z'] + 0.43
        box(f'{pre}_sofa_base_{i}', MAT['sofa'], x0, x1, y + 0.08, y + 0.30, z0, z1, P, bevel=0.03)
        for sx in (-0.49, 0.49):
            box(f'{pre}_sofa_cushion_{i}_{sx}', MAT['sofa'], f['x'] + sx - 0.48, f['x'] + sx + 0.48, y + 0.30, y + 0.44, z0 + 0.12, z1, P, bevel=0.04)
        box(f'{pre}_sofa_back_{i}', MAT['sofa'], f['x'] - 1.0, f['x'] + 1.0, y + 0.30, y + 0.84, z0, z0 + 0.2, P, bevel=0.05)
        for sx in (-1, 1): box(f'{pre}_sofa_arm_{i}_{sx}', MAT['sofa'], f['x'] + sx * 1.02 - 0.08, f['x'] + sx * 1.02 + 0.08, y + 0.26, y + 0.60, z0, z1, P, bevel=0.03)
        for (lx, lz) in ((x0 + 0.1, z0 + 0.08), (x1 - 0.1, z0 + 0.08), (x0 + 0.1, z1 - 0.08), (x1 - 0.1, z1 - 0.08)):
            box(f'{pre}_sofa_leg_{i}_{lx:.1f}{lz:.1f}', MAT['woodD'], lx - 0.03, lx + 0.03, y, y + 0.08, lz - 0.03, lz + 0.03, P)
    elif f['type'] == 'table':
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=f['r'], radius2=f['r'], depth=0.05)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.505, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_table_top_{i}', bm, MAT['table'], P)
        cyl(f'{pre}_table_stem_{i}', MAT['frame'], (f['x'], y + 0.03, f['z']), (f['x'], y + 0.48, f['z']), 0.05, P)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.32, radius2=0.28, depth=0.03)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.015, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_table_base_{i}', bm, MAT['frame'], P)
    elif f['type'] == 'board':
        box(f'{pre}_board_frame', MAT['frame'], f['x'] - f['w'] / 2 - 0.05, f['x'] + f['w'] / 2 + 0.05, y + 1.65 - f['w'] / 4 - 0.05, y + 1.65 + f['w'] / 4 + 0.05, f['z'] - 0.05, f['z'] - 0.01, P)
    elif f['type'] == 'planter':
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=f['r'] * 0.88, radius2=f['r'], depth=0.6)
        bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(f['x'], y + 0.3, f['z'])); bm.normal_update(); box_uv(bm, 1.0); mesh_obj(f'{pre}_planter_{i}', bm, MAT['granite'], P)
        PL.potted(mesh_obj, PM, f'{pre}_plant_{i}', P, f['x'], y + 0.6, f['z'], f['r'], seed=501 + i * 7 + (100 if pre == 'L1' else 0))   # 大葉盆栽（模型葉子）；原本是多面體圓球
    elif f['type'] == 'bench':
        box(f'{pre}_bench_seat_{i}', MAT['wood'], f['x'] - f['w'] / 2, f['x'] + f['w'] / 2, y + 0.42, y + 0.47, f['z'] - f['d'] / 2, f['z'] + f['d'] / 2, P, bevel=0.01)
        for sx in (-1, 1): box(f'{pre}_bench_leg_{i}_{sx}', MAT['steel'], f['x'] + sx * (f['w'] / 2 - 0.12) - 0.03, f['x'] + sx * (f['w'] / 2 - 0.12) + 0.03, y, y + 0.42, f['z'] - f['d'] * 0.45, f['z'] + f['d'] * 0.45, P)
    # bulletin（公告欄）：遊戲裡的 W3.bulletin()（canvas 的招募海報），不在模型裡

# ---------------- 大廳的擺設（WANCAI-DRESS-1028，LAWWW2-C 10-28；使用者 P0「校內建築室內……廉價手遊感」，霖澤館大廳第二版的做法）----------------
# 都在牆邊：東牆（電梯南邊）飲水機＋回收桶、北牆兩扇門中間的展示櫃（法服社、模擬法庭的獎盃獎牌照片）、消防栓箱與滅火器、出口燈、
# 南面玻璃前長椅、入口傘架、沙發旁的小圓桌、中庭吊燈；離劇情、社團站位（story3d.js 的 CLUB_SPOTS、TA_SPOT、吉他社成發 (0,4.6)、出生點 (0,5)）1.2 m 以上。
for k_, h_ in (('red', '#b3261e'), ('exitg', '#1f9d55'), ('black', '#1d1f22'), ('white', '#f2f1ec'), ('binB', '#2f6db3'), ('binG', '#3f8f4f'), ('binK', '#6b7076'),
               ('gold', '#c9a24a'), ('brass', '#b08a4a'), ('cream', '#e6e2d6'), ('navy', '#2b3a55'), ('umbR', '#a8343a')):
    MAT[k_] = pbr('wc_' + k_, None, tint=srgb(h_), rough=0.35 if k_ in ('gold', 'brass') else 0.6, metal=0.4 if k_ in ('gold', 'brass') else 0.0)
MAT['exitglow'] = pbr('wc_exitglow', None, tint=srgb('#3fdc84'), rough=0.9, emit=srgb('#3fdc84'))
def lobby_prop(f, P, pre, y, i):
    kind, x, z, w, d = f['kind'], f['x'], f['z'], f['w'], f['d']
    n = f'{pre}_{kind}_{i}'
    if kind == 'display':      # 靠北牆的展示櫃（朝 +z）：下面木櫃、上面玻璃櫃＋兩層玻璃板、獎盃、獎牌、照片框、法槌、頂燈（和霖澤館大廳同一款）
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
        for k, (ox, sy, kind2) in enumerate(((-0.85, 0.9, 'photo'), (-0.45, 0.9, 'cup'), (0.0, 0.9, 'plaque'), (0.45, 0.9, 'cup2'), (0.85, 0.9, 'photo'),
                                              (-0.7, 1.282, 'plaque'), (-0.25, 1.282, 'gavel'), (0.25, 1.282, 'photo'), (0.7, 1.282, 'cup'),
                                              (-0.6, 1.642, 'cup2'), (0.0, 1.642, 'photo'), (0.6, 1.642, 'plaque'))):
            cx, cy, cz = x + ox * w / 2.4, y + sy, z - 0.02
            if kind2 in ('cup', 'cup2'):
                hh = 0.24 if kind2 == 'cup2' else 0.18
                box(f'{n}_tb_{k}', MAT['woodD'], cx - 0.045, cx + 0.045, cy, cy + 0.04, cz - 0.045, cz + 0.045, P)
                cyl(f'{n}_ts_{k}', MAT['gold'], (cx, cy + 0.04, cz), (cx, cy + hh * 0.55, cz), 0.012, P, seg=8)
                cyl(f'{n}_tc_{k}', MAT['gold'], (cx, cy + hh * 0.55, cz), (cx, cy + hh, cz), 0.045, P, seg=12)
                for sx in (-1, 1): cyl(f'{n}_te_{k}_{sx}', MAT['gold'], (cx + sx * 0.045, cy + hh * 0.9, cz), (cx + sx * 0.07, cy + hh * 0.7, cz), 0.007, P, seg=6)
            elif kind2 == 'plaque':
                box(f'{n}_pq_{k}', MAT['woodD'], cx - 0.11, cx + 0.11, cy, cy + 0.28, cz - 0.03, cz - 0.01, P)
                box(f'{n}_pqb_{k}', MAT['brass'], cx - 0.08, cx + 0.08, cy + 0.06, cy + 0.22, cz - 0.01, cz - 0.005, P)
            elif kind2 == 'photo':
                box(f'{n}_pf_{k}', MAT['black'], cx - 0.12, cx + 0.12, cy, cy + 0.2, cz - 0.02, cz, P)
                box(f'{n}_pp_{k}', MAT['white'], cx - 0.105, cx + 0.105, cy + 0.015, cy + 0.185, cz, cz + 0.002, P)
                box(f'{n}_pi_{k}', MAT['navy'], cx - 0.09, cx + 0.09, cy + 0.03, cy + 0.11, cz + 0.002, cz + 0.003, P)
            elif kind2 == 'gavel':
                box(f'{n}_gb_{k}', MAT['woodD'], cx - 0.07, cx + 0.07, cy, cy + 0.025, cz - 0.05, cz + 0.05, P)
                cyl(f'{n}_gh_{k}', MAT['wood'], (cx - 0.07, cy + 0.06, cz), (cx + 0.07, cy + 0.06, cz), 0.028, P, seg=10)
                cyl(f'{n}_gs_{k}', MAT['wood'], (cx, cy + 0.06, cz), (cx + 0.02, cy + 0.03, cz + 0.16), 0.008, P, seg=6)
    elif kind == 'water':      # 飲水機（白鐵、三個出水口：紅熱水、白溫水、藍冰水；接水盤；紙杯架）；朝 −x（東牆）
        x0, x1, z0, z1 = x - w / 2, x + w / 2, z - d / 2, z + d / 2
        box(n + '_body', MAT['steel'], x0, x1, y, y + 1.25, z0, z1, P, bevel=0.012)
        box(n + '_panel', MAT['black'], x0 - 0.005, x0, y + 0.95, y + 1.12, z0 + 0.06, z1 - 0.06, P)
        box(n + '_niche', MAT['frame'], x0 - 0.003, x0 + 0.06, y + 0.55, y + 0.9, z0 + 0.05, z1 - 0.05, P)
        box(n + '_tray', MAT['steel'], x0 - 0.08, x0 + 0.02, y + 0.55, y + 0.58, z0 + 0.06, z1 - 0.06, P)
        for k, (oz, mk) in enumerate(((-0.11, 'red'), (0.0, 'white'), (0.11, 'binB'))):
            box(f'{n}_tap_{k}', MAT[mk], x0 - 0.05, x0 + 0.01, y + 0.84, y + 0.88, z + oz - 0.02, z + oz + 0.02, P)
        cyl(n + '_cups', MAT['white'], (x0 - 0.05, y + 0.62, z1 + 0.05), (x0 - 0.05, y + 0.95, z1 + 0.05), 0.04, P, seg=10)
        box(n + '_sign', MAT['white'], x0 - 0.006, x0 - 0.001, y + 1.15, y + 1.22, z0 + 0.08, z1 - 0.08, P)
    elif kind == 'bins':       # 三個資源回收桶（藍、綠、灰；不寫字）；沿 z 排、朝 −x
        z0 = z - w / 2; bw = w / 3
        for k, mk in enumerate(('binB', 'binG', 'binK')):
            za, zb = z0 + k * bw + 0.02, z0 + (k + 1) * bw - 0.02
            box(f'{n}_b{k}', MAT[mk], x - d / 2, x + d / 2, y, y + 0.72, za, zb, P, bevel=0.015)
            box(f'{n}_l{k}', MAT[mk], x - d / 2 - 0.01, x + d / 2 + 0.01, y + 0.72, y + 0.78, za - 0.01, zb + 0.01, P, bevel=0.01)
            box(f'{n}_o{k}', MAT['black'], x - d / 2 - 0.012, x - d / 2 + 0.03, y + 0.735, y + 0.765, za + 0.06, zb - 0.06, P)
            box(f'{n}_t{k}', MAT['white'], x - d / 2 - 0.004, x - d / 2, y + 0.45, y + 0.6, za + 0.05, zb - 0.05, P)
    elif kind == 'umbrella':   # 傘架：白鐵桶＋三把傘
        cyl(n + '_bucket', MAT['steel'], (x, y, z), (x, y + 0.5, z), 0.2, P, seg=16)
        for k, (ox, oz, mk, tilt) in enumerate(((-0.06, -0.05, 'navy', 0.12), (0.07, 0.0, 'umbR', -0.1), (-0.02, 0.08, 'binK', 0.05))):
            cyl(f'{n}_u{k}', MAT[mk], (x + ox, y + 0.05, z + oz), (x + ox + tilt * 0.6, y + 0.82, z + oz + tilt * 0.3), 0.035, P, seg=8)
            cyl(f'{n}_h{k}', MAT['black'], (x + ox + tilt * 0.6, y + 0.82, z + oz + tilt * 0.3), (x + ox + tilt * 0.62, y + 0.92, z + oz + tilt * 0.3), 0.01, P, seg=6)
    elif kind == 'sidetable':  # 沙發旁的小圓桌：木頭桌面、白鐵腳、一盆小盆栽、兩本雜誌
        cyl(n + '_top', MAT['table'], (x, y + 0.5, z), (x, y + 0.53, z), w / 2, P, seg=20)
        cyl(n + '_leg', MAT['steel'], (x, y, z), (x, y + 0.5, z), 0.025, P, seg=8)
        cyl(n + '_foot', MAT['steel'], (x, y, z), (x, y + 0.02, z), w / 2 * 0.7, P, seg=16)
        box(n + '_mag1', MAT['navy'], x - 0.12, x + 0.06, y + 0.53, y + 0.54, z - 0.02, z + 0.11, P)
        box(n + '_mag2', MAT['white'], x - 0.1, x + 0.08, y + 0.54, y + 0.548, z - 0.0, z + 0.13, P)
        cyl(n + '_pot', MAT['cream'], (x + 0.1, y + 0.53, z - 0.08), (x + 0.1, y + 0.65, z - 0.08), 0.05, P, seg=12)
        PL.potted(mesh_obj, PM, n + '_plant', P, x + 0.1, y + 0.65, z - 0.08, 0.07, seed=931 + i)
for i, f in enumerate(L['furniture']):
    if f['type'] == 'prop': lobby_prop(f, L1 if f['lv'] else L0, 'L1' if f['lv'] else 'L0', Y1 if f['lv'] else 0.0, i)
# 北牆：消防栓箱（紅色、白色窗）＋滅火器；兩扇門上方的出口燈（綠色發光，跟著北牆淡出）
_FN = {'fadegrp': 'Ndoor', 'fadedir': [0, 0, 1]}; _zf = -D / 2 + T / 2
box('L0_hydrant', MAT['red'], 3.65, 4.25, 0.75, 1.55, _zf, _zf + 0.16, L0, props=_FN)
box('L0_hydrant_win', MAT['white'], 3.73, 4.17, 0.95, 1.35, _zf + 0.16, _zf + 0.17, L0, props=_FN)
for k_, xx in enumerate((3.8, 4.1)):
    cyl(f'L0_extinguisher_{k_}', MAT['red'], (xx, 0.0, _zf + 0.3), (xx, 0.5, _zf + 0.3), 0.075, L0, seg=12)
    cyl(f'L0_extinguisher_top_{k_}', MAT['black'], (xx, 0.5, _zf + 0.3), (xx, 0.58, _zf + 0.3), 0.03, L0, seg=8)
for x_ in (d_['x'] for d_ in L['doors'] if d_['lv'] == 0):
    box(f'L0_exit_sm_{x_}', MAT['exitg'], x_ - 0.2, x_ + 0.2, 3.1, 3.26, _zf, _zf + 0.04, L0, props=_FN)
    box(f'L0_exit_smg_{x_}', MAT['exitglow'], x_ - 0.17, x_ + 0.17, 3.12, 3.24, _zf + 0.04, _zf + 0.045, L0, props=_FN)
# 南面入口上方的出口燈（玻璃帷幕的橫櫺下面，跟著南面淡出）
_EX = L['entrance']['x']
box('L0_exit_entr', MAT['exitg'], _EX - 0.3, _EX + 0.3, 2.68, 2.86, D / 2 - 0.3, D / 2 - 0.22, L0, props=FS)
box('L0_exit_entr_g', MAT['exitglow'], _EX - 0.27, _EX + 0.27, 2.70, 2.84, D / 2 - 0.305, D / 2 - 0.3, L0, props=FS)
# 中庭兩排線型吊燈（6.4 m 高，三段一排；吊線到天花板）
for zr in (1.2, 4.4):
    for (xa, xb) in ((-3.4, -0.6), (-0.2, 2.6), (3.0, 5.8)):
        box(f'L1_pendant_{zr}_{xa}', MAT['frame'], xa, xb, 6.38, 6.46, zr - 0.05, zr + 0.05, L1)
        box(f'L1_pendant_glow_{zr}_{xa}', MAT['light'], xa + 0.03, xb - 0.03, 6.375, 6.38, zr - 0.035, zr + 0.035, L1)
        for xc in (xa + 0.25, xb - 0.25): cyl(f'L1_pendant_wire_{zr}_{xc:.2f}', MAT['frame'], (xc, 6.46, zr), (xc, RY, zr), 0.004, L1, seg=4)

# 純色擺設合成一個頂點色材質（和霖澤館大廳 LOBBY-VC-1028 一樣：每個純色材質各畫一次；金、黃銅、出口燈的發光面照舊）
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'env_second'))
import lib2 as L2   # noqa: E402
_VC = L2.vc_material('wc_vc', rough=0.6)
L2.vc_consolidate(root, {MAT[k].name: _VC for k in ('red', 'exitg', 'black', 'white', 'binB', 'binG', 'binK', 'cream', 'navy', 'umbR')})

# ---------------- 同一層、同材質的物件合併（減少 draw call；外牆不合併：要各自淡出）----------------
def join_by_material(level_root, prefix):
    groups = {}
    for ob in list(level_root.children):
        if ob.type != 'MESH' or 'WALL_' in ob.name: continue
        groups.setdefault((ob.get('fadegrp'), ob.data.materials[0].name, ob.get('lm')), []).append(ob)   # lm（光照貼圖的比例）不同的分開合併，才不會丟掉（WANCAI-LM-1028）
    for (fg, mname, lm), obs in groups.items():
        if len(obs) < 2 and not fg: continue
        dirv = list(obs[0]['fadedir']) if fg else None
        bm = bmesh.new()
        for ob in obs: bm.from_mesh(ob.data)
        mat = obs[0].data.materials[0]
        for ob in obs: bpy.data.meshes.remove(ob.data)
        pr = dict({'dir': dirv} if fg else {}, **({'lm': lm} if lm is not None else {}))
        mesh_obj((f'{prefix}_WALL_{fg}_{mname}' if fg else f'{prefix}_{mname}') + (f'_lm{lm:g}' if lm is not None else ''), bm, mat, level_root, props=pr or None)
for r, pre in ((L0, 'L0'), (L1, 'L1')): join_by_material(r, pre)

# ---------------- 匯出 ----------------
for ob in scene.objects:
    if ob.type == 'MESH':
        sm = ob.data.materials[0].name.startswith(('wc_leaf_dark', 'wc_leaf_mid'))   # 模型葉子用平滑著色
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
    scene.view_settings.view_transform = 'AgX'
    world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True; world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.8, 0.86, 1); world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); scene.collection.objects.link(sun); sun.data.energy = 3.0; sun.rotation_euler = (math.radians(50), 0, math.radians(20))
    for (x, y, z, e) in ((0, 6.4, 0.5, 1100), (0, 3.2, -4.5, 350), (-6, 6.5, 3, 400)):
        lt = bpy.data.objects.new('pt', bpy.data.lights.new('pt', 'POINT')); lt.data.energy = e; lt.location = g2b(x, y, z); scene.collection.objects.link(lt)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam; cam.data.lens = 18
    for name, eye, look in (('lobby_from_entrance', (2.5, 1.7, 6.2), (-5, 2.6, -3.0)), ('stair_from_north', (-3.0, 1.8, -6.0), (-8.0, 2.2, 2.0)),
                            ('gallery_2f', (6.0, 5.9, -5.8), (-6.0, 4.6, 3.0)), ('foyer_2f', (-5.6, 5.9, -1.0), (-7.0, 4.8, 6.6))):
        cam.location = g2b(*eye); d = g2b(*look) - g2b(*eye); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(RENDER, f'blender_wancai_{name}.png'); bpy.ops.render.render(write_still=True); print('render', scene.render.filepath)
