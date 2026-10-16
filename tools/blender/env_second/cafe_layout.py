"""兩點半 Café 的共用配置與建模零件：外觀（cafe_exterior.py）和室內（cafe_interior.py）都從這裡建店面與店內，
所以「從街上透過玻璃看到的店內」和「走進去看到的店內」是同一套東西（ART_DIRECTION 第 7 節：門窗位置要和室內空間一致）。

座標：
- 室內座標＝遊戲 cafe 區域的座標（src/zones3d.js 的 `const cafe`）：x −7～7（右邊 +x 是有兩扇窗的牆）、z −6～6、門在 z=+6 的中間，
  天花板 3.4 m。故事程式用到的位置一律照遊戲：雙人桌 (4.5,−2.5)(4.5,1.5)(0,1.5)(−4,2.5)（椅子在桌子 z±0.8，順序＝seats[0..7]）、
  吧檯 (−2.5,−4.4) 7×0.9 m、點餐 (−2.5,−3.2)、出口 (0,5.6)、吧檯椅 3 張。
- 店面座標＝外觀建築的座標（TK.apartment：正面朝 +z、玻璃在 z=0）。室內座標 z＝店面座標 z＋6。
"""
import math, os, random
import lib2 as L
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------- 室內配置（遊戲座標，不能改：故事與存檔用到） ----------------
RW, RD, RH = 14.0, 12.0, 3.4
TABLES = [(4.5, -2.5), (4.5, 1.5), (0.0, 1.5), (-4.0, 2.5)]        # twoTop 桌心；椅子在 (x, z±0.8)
BAR = dict(x=-2.5, z=-4.4, w=7.0, d=0.9, h=1.05)
SHELF = dict(x=-2.5, z=-5.75, w=7.0)                                 # 吧檯後面的層架（遊戲導航 shelfWall 的位置）
STOOLS = [(-4.5, -3.3), (-2.9, -3.3), (-1.3, -3.3)]
RIGHT_WINS = [-2.5, 1.5]                                             # 右牆（x=+7）窗中心 z；窗 2.2×1.8，中心高 1.9（room() 的 winY）
WIN_W, WIN_H, WIN_Y = 2.2, 1.8, 1.9
BOOKCASE = (1.4, 6.8)                                                # 後牆右段的書牆（x 範圍）
COUNTER_X = (1.35, 6.2)                                              # 店面玻璃內側的窗邊吧台（兩段，左右對稱）
COUNTER_Z, COUNTER_DEP, COUNTER_H = 5.35, 0.42, 1.02
WC_STOOLS = [2.2, 3.5, 4.8, -2.2, -3.5, -4.8]                        # 窗邊吧台的高腳椅 x（z＝4.95）
BIG_PLANTS = [(-6.35, 0.4), (6.35, -0.5), (-6.3, -2.6)]

# ---------------- 店面（店面座標：玻璃在 z=0，+z 往外） ----------------
SW = 14.0                     # 店面總寬（＝建築寬）
PIL = 0.55                    # 兩側壁柱
SX0, SX1 = -SW / 2 + PIL, SW / 2 - PIL
DOOR, POST = 0.9, 0.2         # 門洞半寬、門柱寬
SILL, TRAN, HEAD = 0.58, 2.28, 3.0

_glow_n = [0]


def materials():
    """兩個 GLB 共用的材質（名稱一致：遊戲整合時照名稱登記夜間發光）"""
    M_ = L.pbr
    m = {
        'tile': M_('cafe_wall_tile', 'rectangular_facade_tiles', tile=2.0, target='#ddd0b8', normal=0.9),
        'pier': M_('cafe_pier_tile', 'exterior_wall_cladding_02', tile=1.4, target='#6e4a36', normal=0.9, maps=('diff', 'nor'), rough_value=0.75),
        'band': M_('cafe_band', 'plaster_grey_04', tile=1.5, target='#d6ccbb', maps=('diff',), res=256, rough_value=0.85),
        'base': M_('cafe_base_stone', 'terrazzo_tiles', tile=1.2, target='#8a8279', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.6),
        'wood': M_('cafe_wood_dark', 'fine_grained_wood', tile=0.9, target='#5a3f2c', normal=0.5, sat=0.6),   # 降低彩度：深胡桃木，不要偏紅的斑紋
        'wood2': M_('cafe_wood_mid', 'dark_wood', tile=1.2, target='#6b4a30', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.7),
        'board': L.pbr('cafe_sign_face', None, tint=B.srgb('#3b2a1e'), rough=0.7),
        'metal': L.flat('cafe_iron_black', '#24221f', rough=0.45, metal=0.45),
        'brass': L.flat('cafe_brass', '#9a7840', rough=0.35, metal=0.45),
        'glass': L.flat('cafe_glass', '#dfe6e6', rough=0.05, alpha=0.16),
        'lampglass': L.flat('cafe_lampglass', '#f6e2b8', rough=0.2, emit=B.srgb('#ffd49a'), alpha=0.85),
        'bulb': L.flat('cafe_bulb', '#fff4dc', rough=0.3, emit=B.srgb('#fff1d6')),
        'alu': L.flat('cafe_alu', '#b9bcbd', rough=0.35, metal=0.45),
        'win_glass': L.flat('cafe_win_glass', '#5d6b74', rough=0.08, alpha=0.55),
        'curtain_lit': L.flat('ext_glass_lit', '#e9dcc3', rough=0.9, emit=B.srgb('#ffd9a0')),
        'curtain': L.flat('cafe_curtain', '#c9c3b4', rough=0.9),
        'room_dark': L.flat('cafe_room_dark', '#2a2724', rough=0.9),
        'grille': L.flat('cafe_grille', '#3b2a1e', rough=0.55, metal=0.3),
        'ac': L.flat('cafe_ac_body', '#e6e4dd', rough=0.5),
        'ac_dark': L.flat('cafe_ac_fan', '#3a3c3e', rough=0.6),
        'pipe': L.flat('cafe_pipe', '#9aa09e', rough=0.5),
        'corr': M_('cafe_corrugated', 'corrugated_iron', tile=1.12, target='#c9cfc9', normal=1.0, maps=('diff', 'nor'), res=256, rough_value=0.55),
        'roof': L.flat('cafe_roof_slab', '#8f8b84', rough=0.95),
        'tank': L.flat('cafe_tank_steel', '#c4c8cb', rough=0.3, metal=0.45),
        # 店內
        'floor': M_('cafe_int_floor', 'herringbone_parquet', tile=1.7, target='#8a5f3e', maps=('diff',), rough_value=0.55),
        'plaster': M_('cafe_int_plaster', 'white_plaster_02', tile=1.0, target='#dcc6a4', maps=('diff',), res=256, rough_value=0.9),   # 暖米色灰泥
        'iwood': M_('cafe_int_wood', 'walnut_veneer', tile=1.2, target='#7a5536', maps=('diff',), res=256, rough_value=0.6),
        'shelf': M_('cafe_int_shelf', 'black_walnut_veneer_01', tile=1.0, target='#5a3d26', maps=('diff',), res=256, rough_value=0.65),
        'ceil': M_('cafe_int_ceiling', 'white_plaster_02', tile=1.4, target='#e6d8bf', maps=('diff',), res=256, rough_value=0.95, cull=True),   # 單面朝下（鏡頭在天花板上面時看不到）
        'beam': M_('cafe_int_beam', 'dark_wood', tile=1.6, target='#5e4330', maps=('diff',), res=256, rough_value=0.75, cull=True),
        'bar': M_('cafe_int_bar', 'walnut_veneer', tile=1.0, target='#6a4a30', maps=('diff',), res=256, rough_value=0.6),
        'bartop': L.flat('cafe_int_bartop', '#d8cfc0', rough=0.4),
        'steel': L.flat('cafe_steel', '#aeb2b4', rough=0.25, metal=0.45),
        'ceramic': L.flat('cafe_ceramic_white', '#f2efe8', rough=0.25),
        'chalk': L.flat('cafe_board_face', '#2b3530', rough=0.85),
        'leather': L.flat('cafe_seat_leather', '#5a3626', rough=0.6),
        'print': L.flat('cafe_print', '#e7dcc6', rough=0.8),
        'pot_terra': L.flat('cafe_pot_terracotta', '#a8613f', rough=0.8),
        'pot_cream': L.flat('cafe_pot_cream', '#e4dccb', rough=0.35),
        'pot_dark': L.flat('cafe_pot_dark', '#4a4744', rough=0.45),
        'soil': L.flat('cafe_soil', '#3b2f25', rough=1.0),
        'trunk': L.flat('cafe_trunk', '#6b5a48', rough=0.9),
        'cake': L.flat('cafe_cake', '#e9c46a', rough=0.6),
    }
    for k, png in (('ivy', 'ivy_leaves.png'), ('broad', 'broad_leaves.png'), ('olive', 'olive_leaves.png'), ('fern', 'fern_leaves.png')):
        m[k] = leaf_mat('cafe_leaf_' + k, png)
    # 書的色票（8 色，所有書一個網格）
    pal = bpy.data.images.new('cafe_book_palette', 8, 1, alpha=False); px = []
    for h in ['#e8dcc4', '#8c3b47', '#2f5d50', '#c9a24f', '#f4f1ea', '#4a6c8c', '#7b5a3a', '#3a3a3a']: px += [*B.srgb(h), 1.0]
    pal.pixels.foreach_set(px)
    bk = bpy.data.materials.new('cafe_int_books'); bk.use_nodes = True; nt = bk.node_tree
    ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = pal; ti.interpolation = 'Closest'; nt.links.new(ti.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
    nt.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8; bk['tile'] = 1.0; m['books'] = bk
    return m


def leaf_mat(name, png):
    """葉片卡：RGBA 貼圖（gen_leaves.py 產生），透明度用 alpha clip（Round 節點 → glTF alphaMode MASK）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 0.7
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'gen', png))
    Lk.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], rnd.inputs[0]); Lk.new(rnd.outputs[0], bsdf.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False; m['tile'] = 1.0
    return m


# ---------------- 小工具 ----------------
def glow(parent, kind, x, y, z, color='rgba(255,205,140,1)', size=1.4, day=0.25, night=1.0):
    """夜間光暈的位置（空節點；遊戲照自訂屬性 glow 生成 TK.glowSprite）"""
    _glow_n[0] += 1
    o = B.group(f'GLOW_{kind}_{_glow_n[0]}', parent, {'glow': color, 'size': size, 'day': day, 'night': night}); o.location = g2b(x, y, z); return o


def card(m, cx, cy, cz, w, h, ry=0.0, rx=0.0, uv=(0, 0, 1, 1)):
    """葉片卡（一個四邊形；中心點、寬高、繞 y 轉 ry、往前傾 rx）"""
    bm = m.bm; c = Vector((cx, cy, cz))
    rot = Matrix.Rotation(ry, 3, 'Y') @ Matrix.Rotation(rx, 3, 'X')
    loc = [Vector((-w / 2, -h / 2, 0)), Vector((w / 2, -h / 2, 0)), Vector((w / 2, h / 2, 0)), Vector((-w / 2, h / 2, 0))]
    vs = [bm.verts.new(g2b(*(c + rot @ p))) for p in loc]; f = bm.faces.new(vs)
    uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = uv
    for lp, (u, v) in zip(f.loops, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]): lp[uvl].uv = (u, v)
    return f


def rand_uv(span=0.5):
    u = random.uniform(0, 1 - span); v = random.uniform(0, 1 - span); return (u, v, u + span, v + span)


def bush(m, cx, cy, cz, r, n=10, span=0.5, flat_y=1.0):
    for i in range(n):
        a = random.uniform(0, 2 * math.pi); e = random.uniform(-0.6, 0.9)
        px = cx + math.cos(a) * r * 0.55 * math.cos(e); pz = cz + math.sin(a) * r * 0.55 * math.cos(e); py = cy + math.sin(e) * r * 0.5 * flat_y
        s = r * random.uniform(0.9, 1.3)
        card(m, px, py, pz, s, s, ry=random.uniform(0, math.pi), rx=random.uniform(-0.9, 0.9), uv=rand_uv(span))


def pot(m, cx, cz, r, h, profile='taper', y0=0.0):
    if profile == 'bowl': prof = [(r * 0.55, 0), (r * 0.85, h * 0.25), (r, h * 0.75), (r * 1.02, h), (r * 0.92, h)]
    elif profile == 'cyl': prof = [(r * 0.92, 0), (r, 0.03), (r, h), (r * 0.94, h)]
    else: prof = [(r * 0.72, 0), (r * 0.78, 0.02), (r, h * 0.92), (r * 1.06, h * 0.94), (r * 1.06, h), (r * 0.96, h)]
    bm = L.lathe(prof, seg=18); m.add_bm(bm, Matrix.Translation(g2b(cx, y0, cz))); bm.free()


def proto(ob):
    me = ob.data; bpy.data.objects.remove(ob); return me


def combine(parts, name):
    objs = [p for p in parts if p is not None]; me = B._combine(objs, name)
    for o in objs: bpy.data.meshes.remove(o.data)
    return me


def uv01(ob):
    uvl = ob.data.uv_layers.active
    for poly in ob.data.polygons:
        for li, (u, v) in zip(poly.loop_indices, [(0, 0), (1, 0), (1, 1), (0, 1)]): uvl.data[li].uv = (u, v)


def grp(name, parent, x=0.0, y=0.0, z=0.0, props=None):
    o = B.group(name, parent, props); o.location = g2b(x, y, z); return o


# ---------------- 店面：外觀與室內共用（店面座標） ----------------
def storefront(mat, parent, inside=False):
    """店面：壁柱、牆腳石、窗下木板（線板）、窗台板、直櫺、橫楣、上框、門柱、兩扇木門（黃銅長門把，內外都有）、玻璃。
    inside＝室內版（室內看得到的面；門內側也有把手）。回傳玻璃窗格清單 [(x0,x1,y0,y1)]（給窗外景用）"""
    pier = Mesh('piers', mat['pier'])
    for x0, x1 in ((-SW / 2, SX0), (SX1, SW / 2)): pier.box(x0, x1, 0.42, HEAD + 0.02, -0.3, 0.06)
    pier.finish(parent)
    base = Mesh('base_stone', mat['base'])
    for x0, x1 in ((-SW / 2, SX0), (SX1, SW / 2)): base.box(x0 - 0.01, x1 + 0.01, 0, 0.42, -0.3, 0.09)
    base.box(SX0, SX1, 0, 0.1, -0.12, 0.14)
    if not inside: base.box(-DOOR - 0.05, DOOR + 0.05, 0, 0.03, 0.14, 0.4)          # 門前石階（很薄）
    base.finish(parent)
    wd = Mesh('shop_wood', mat['wood']); bays = []
    for (a, b_) in ((SX0, -DOOR - POST), (DOOR + POST, SX1)):
        n = 4; xs = [a + (b_ - a) * k / n for k in range(n + 1)]; bays.append(xs)
        wd.box(a, b_, 0.1, SILL, -0.08, 0.06)
        for k in range(n):
            wd.box(xs[k] + 0.12, xs[k + 1] - 0.12, 0.2, SILL - 0.1, 0.06, 0.085)                 # 外側線板
            if inside: wd.box(xs[k] + 0.12, xs[k + 1] - 0.12, 0.2, SILL - 0.1, -0.105, -0.08)  # 內側線板
        wd.box(a - 0.02, b_ + 0.02, SILL, SILL + 0.06, -0.12 if inside else -0.08, 0.13)
        for x in xs: wd.box(x - 0.045, x + 0.045, SILL, HEAD, -0.06, 0.06)
        wd.box(a, b_, TRAN, TRAN + 0.08, -0.06, 0.07)
        wd.box(a, b_, HEAD - 0.1, HEAD, -0.07, 0.07)
    for s in (-1, 1):
        x0, x1 = sorted((s * DOOR, s * (DOOR + POST))); wd.box(x0, x1, 0.04, HEAD, -0.07, 0.08)
    wd.box(-DOOR, DOOR, TRAN, TRAN + 0.1, -0.07, 0.08)
    for s in (-1, 1):                                       # 兩扇門：立梃、上下冒頭、中間推手橫條
        x0, x1 = sorted((s * 0.006, s * DOOR))
        wd.box(x0, x0 + 0.1, 0.04, TRAN - 0.02, -0.04, 0.04); wd.box(x1 - 0.1, x1, 0.04, TRAN - 0.02, -0.04, 0.04)
        wd.box(x0, x1, 0.04, 0.32, -0.04, 0.04); wd.box(x0, x1, TRAN - 0.14, TRAN - 0.02, -0.04, 0.04)
        wd.box(x0, x1, 1.02, 1.08, -0.04, 0.04)
    wd.finish(parent)
    br = Mesh('shop_brass', mat['brass'])
    for s in (-1, 1):
        hx = s * 0.17
        for side in ((1,) if not inside else (1, -1)):
            br.cyl((hx, 0.78, side * 0.1), (hx, 1.52, side * 0.1), 0.017, seg=10)
            for y in (0.84, 1.46): br.cyl((hx, y, side * 0.04), (hx, y, side * 0.1), 0.012, seg=8)
    br.finish(parent, smooth=True)
    gl = Mesh('shop_glass', mat['glass']); panes = []
    for xs in bays:
        for k in range(len(xs) - 1):
            a, b_ = xs[k] + 0.045, xs[k + 1] - 0.045
            gl.quad([(a, SILL + 0.06, 0.0), (b_, SILL + 0.06, 0.0), (b_, TRAN, 0.0), (a, TRAN, 0.0)])
            gl.quad([(a, TRAN + 0.08, 0.0), (b_, TRAN + 0.08, 0.0), (b_, HEAD - 0.1, 0.0), (a, HEAD - 0.1, 0.0)])
        panes.append((xs[0], xs[-1], SILL + 0.06, HEAD - 0.1))
    gl.quad([(-DOOR, TRAN + 0.1, 0.0), (DOOR, TRAN + 0.1, 0.0), (DOOR, HEAD - 0.1, 0.0), (-DOOR, HEAD - 0.1, 0.0)])
    for s in (-1, 1):
        x0, x1 = sorted((s * 0.106, s * (DOOR - 0.1)))
        gl.quad([(x0, 0.32, 0), (x1, 0.32, 0), (x1, 1.02, 0), (x0, 1.02, 0)]); gl.quad([(x0, 1.08, 0), (x1, 1.08, 0), (x1, TRAN - 0.14, 0), (x0, TRAN - 0.14, 0)])
    panes.append((-DOOR, DOOR, 0.32, HEAD - 0.1))
    gl.finish(parent)
    return {'panes': panes, 'bays': bays}


# ---------------- 店內家具與擺設（室內座標） ----------------
def chair_mesh(mat):
    """曲木椅（正面朝 +z）：圓座面（高 0.47，和遊戲坐姿高度一致）、四支腳、彎的椅背"""
    m = Mesh('chair_proto', mat['iwood'])
    m.cyl((0, 0.44, 0), (0, 0.47, 0), 0.21, seg=16)
    for a in range(4):
        t = a * math.pi / 2 + math.pi / 4; m.cyl((math.cos(t) * 0.15, 0.0, math.sin(t) * 0.15), (math.cos(t) * 0.17, 0.45, math.sin(t) * 0.17), 0.015, seg=6)
    m.cyl((-0.17, 0.45, -0.12), (-0.15, 0.9, -0.16), 0.014, seg=6); m.cyl((0.17, 0.45, -0.12), (0.15, 0.9, -0.16), 0.014, seg=6)
    for k in range(8):
        a = math.pi * (0.15 + 0.7 * k / 8); a2 = math.pi * (0.15 + 0.7 * (k + 1) / 8)
        m.cyl((math.cos(a) * 0.17, 0.9, -math.sin(a) * 0.17), (math.cos(a2) * 0.17, 0.9, -math.sin(a2) * 0.17), 0.016, seg=6)
    m.cyl((-0.17, 0.25, 0.05), (0.17, 0.25, 0.05), 0.01, seg=5)
    return proto(m.finish(None))


def table_mesh(mat):
    """雙人圓桌：木桌面（半徑 0.45，和遊戲的桌子一樣大）、黑鐵單柱腳＋十字底座"""
    top = Mesh('table_top', mat['iwood']); top.cyl((0, 0.73, 0), (0, 0.77, 0), 0.45, seg=24)
    leg = Mesh('table_leg', mat['metal']); leg.cyl((0, 0.02, 0), (0, 0.73, 0), 0.035, seg=8)
    for a in range(4):
        t = a * math.pi / 2 + math.pi / 4; leg.cyl((0, 0.03, 0), (math.cos(t) * 0.3, 0.015, math.sin(t) * 0.3), 0.02, seg=5)
    return combine([top.finish(None), leg.finish(None)], 'cafe_table')


def stool_mesh(mat, h=0.72):
    """高腳椅：木圓坐墊、金屬立柱、腳踏環、圓底座"""
    s = Mesh('stool_seat', mat['iwood']); s.cyl((0, h - 0.04, 0), (0, h, 0), 0.19, seg=16)
    m = Mesh('stool_metal', mat['metal']); m.cyl((0, 0.02, 0), (0, h - 0.04, 0), 0.028, seg=8); m.cyl((0, 0.0, 0), (0, 0.025, 0), 0.21, seg=16)
    m.cyl((-0.16, h * 0.4, 0), (0.16, h * 0.4, 0), 0.01, seg=5); m.cyl((0, h * 0.4, -0.16), (0, h * 0.4, 0.16), 0.01, seg=5)
    return combine([s.finish(None), m.finish(None)], 'cafe_stool')


def interior(mat, parent, lite=False, walls=None, half_w=RW / 2):
    """店內（室內座標）。lite＝外觀用的簡化版（少一點小東西）；half_w＝左右牆的位置（外觀用 6.63：牆要在建築外牆裡面）。
    walls：室內版給一個 dict，牆面零件（後、左、右牆，連同掛在牆上的東西）放在 walls[side]＝[Mesh,...]，呼叫端用 finish_walls 命名 WALL_*；
    外觀版 None（直接完成）。回傳 {'glows':[...], 'menu': Mesh}"""
    out = {}; wall_list = []
    def wall_mesh(side, name, m, uv=True):
        me = Mesh(f'{side}_{name}', m); me.uv = uv; wall_list.append((side, me)); return me
    X0, X1, Z0, Z1 = -half_w, half_w, -RD / 2, RD / 2
    # 地板、天花板
    fl = Mesh('int_floor', mat['floor']); fl.box(X0, X1, -0.02, 0.0, Z0, Z1); fl.finish(parent)
    ce = Mesh('int_ceiling', mat['ceil']); ce.quad([(X0, RH, Z0), (X1, RH, Z0), (X1, RH, Z1), (X0, RH, Z1)]); ce.finish(parent)
    bm_ = Mesh('int_beams', mat['beam'])
    for k in range(6):
        z = -5.0 + k * 2.0
        bm_.quad([(X0, RH - 0.18, z - 0.08), (X1, RH - 0.18, z - 0.08), (X1, RH - 0.18, z + 0.08), (X0, RH - 0.18, z + 0.08)])          # 梁底（朝下）
        bm_.quad([(X0, RH - 0.18, z + 0.08), (X1, RH - 0.18, z + 0.08), (X1, RH, z + 0.08), (X0, RH, z + 0.08)])                      # 梁的兩側
        bm_.quad([(X0, RH - 0.18, z - 0.08), (X1, RH - 0.18, z - 0.08), (X1, RH, z - 0.08), (X0, RH, z - 0.08)][::-1])
    bm_.finish(parent)
    # 牆：白灰泥（上）＋木護牆（下 1.0 m）＋腰帶。後牆、左牆整面；右牆留兩個窗洞；前牆是店面（呼叫端建）
    T = 0.12
    for side in ('back', 'left', 'right'):
        pm = wall_mesh(side, 'plaster', mat['plaster']); wm = wall_mesh(side, 'wainscot', mat['iwood'])
        if side == 'back':
            pm.box(X0, X1, 1.0, RH, Z0 - T, Z0); wm.box(X0, X1, 0, 1.0, Z0 - T, Z0 + 0.02); wm.box(X0, X1, 0.98, 1.05, Z0, Z0 + 0.05)
        elif side == 'left':
            pm.box(X0 - T, X0, 1.0, RH, Z0, Z1); wm.box(X0 - T, X0 + 0.02, 0, 1.0, Z0, Z1); wm.box(X0, X0 + 0.05, 0.98, 1.05, Z0, Z1)
        else:
            zs = [Z0] + [v for c in sorted(RIGHT_WINS) for v in (c - WIN_W / 2, c + WIN_W / 2)] + [Z1]
            y0w, y1w = WIN_Y - WIN_H / 2, WIN_Y + WIN_H / 2
            for k in range(0, len(zs), 2): pm.box(X1, X1 + T, 1.0, RH, zs[k], zs[k + 1])
            for c in RIGHT_WINS:
                pm.box(X1, X1 + T, 1.0, y0w, c - WIN_W / 2, c + WIN_W / 2); pm.box(X1, X1 + T, y1w, RH, c - WIN_W / 2, c + WIN_W / 2)
            wm.box(X1 - 0.02, X1 + T, 0, 1.0, Z0, Z1); wm.box(X1 - 0.05, X1, 0.98, 1.05, Z0, Z1)
    # 右牆的窗：深木窗框＋窗台＋玻璃（窗外的景是遊戲 room() 的窗景平面）
    wf = wall_mesh('right', 'winframe', mat['wood']); wg = wall_mesh('right', 'winglass', mat['glass'])
    for c in RIGHT_WINS:
        y0w, y1w = WIN_Y - WIN_H / 2, WIN_Y + WIN_H / 2; za, zb = c - WIN_W / 2, c + WIN_W / 2
        wf.box(X1 - 0.06, X1 + 0.02, y0w - 0.06, y0w, za - 0.06, zb + 0.06); wf.box(X1 - 0.18, X1, y0w - 0.04, y0w, za - 0.1, zb + 0.1)   # 窗台
        wf.box(X1 - 0.06, X1 + 0.02, y1w, y1w + 0.06, za - 0.06, zb + 0.06)
        for zz in (za - 0.06, c - 0.03, zb):
            wf.box(X1 - 0.06, X1 + 0.02, y0w, y1w, zz, zz + 0.06)
        wf.box(X1 - 0.05, X1 + 0.01, y0w + WIN_H * 0.72, y0w + WIN_H * 0.72 + 0.05, za, zb)
        wg.quad([(X1 + 0.0, y0w, zb), (X1 + 0.0, y0w, za), (X1 + 0.0, y1w, za), (X1 + 0.0, y1w, zb)])

    # 吧檯（左後）：直條木紋正面、磨石檯面、黃銅腳踏桿；上面咖啡機、磨豆機、甜點櫃（檸檬塔）、收銀機、杯子
    bx, bz, bw, bd, bh = BAR['x'], BAR['z'], BAR['w'], BAR['d'], BAR['h']
    BX0, BX1, BZ0, BZ1 = bx - bw / 2, bx + bw / 2, bz - bd / 2, bz + bd / 2
    bar = Mesh('int_bar', mat['bar']); bar.box(BX0, BX1, 0, bh - 0.05, BZ0, BZ1 - 0.02)
    x = BX0 + 0.045
    while x < BX1 - 0.03: bar.box(x - 0.028, x + 0.028, 0.1, bh - 0.08, BZ1 - 0.02, BZ1 + 0.01); x += 0.09
    bar.box(BX0, BX1, 0, 0.1, BZ1 - 0.04, BZ1 - 0.01)
    bar.finish(parent)
    bt = Mesh('int_bartop', mat['bartop']); bt.box(BX0 - 0.04, BX1 + 0.04, bh - 0.05, bh, BZ0 - 0.02, BZ1 + 0.08); bt.finish(parent)
    rail = Mesh('int_bar_rail', mat['brass']); rail.cyl((BX0 + 0.1, 0.22, BZ1 + 0.16), (BX1 - 0.1, 0.22, BZ1 + 0.16), 0.022, seg=10)
    for xx in (BX0 + 0.3, bx, BX1 - 0.3): rail.cyl((xx, 0.22, BZ1 + 0.01), (xx, 0.22, BZ1 + 0.16), 0.014, seg=8)
    rail.finish(parent, smooth=True)
    stl = Mesh('int_steel', mat['steel']); ex = BX0 + 1.0
    stl.box(ex - 0.38, ex + 0.38, bh, bh + 0.45, BZ0 + 0.05, BZ0 + 0.5); stl.box(ex - 0.34, ex + 0.34, bh + 0.45, bh + 0.48, BZ0 + 0.05, BZ0 + 0.45)
    for gx in (ex - 0.18, ex + 0.18): stl.cyl((gx, bh + 0.24, BZ0 + 0.5), (gx, bh + 0.17, BZ0 + 0.58), 0.045, seg=10)
    stl.box(ex - 0.36, ex + 0.36, bh, bh + 0.04, BZ0 + 0.45, BZ0 + 0.66)
    for gx in (ex + 0.8, ex + 1.15):
        stl.cyl((gx, bh, BZ0 + 0.3), (gx, bh + 0.3, BZ0 + 0.3), 0.075, seg=12); stl.box(gx - 0.08, gx + 0.08, bh, bh + 0.03, BZ0 + 0.18, BZ0 + 0.44)
    rx = BX1 - 0.55; stl.box(rx - 0.18, rx + 0.18, bh, bh + 0.08, BZ0 + 0.3, BZ0 + 0.62)                  # 收銀機底座
    stl.finish(parent)
    hop = Mesh('int_grinder_hopper', mat['glass'])
    for gx in (ex + 0.8, ex + 1.15): hop.cyl((gx, bh + 0.3, BZ0 + 0.3), (gx, bh + 0.52, BZ0 + 0.3), 0.055, seg=12, r2=0.09)
    # 甜點玻璃櫃（吧檯右段）
    cx0, cx1 = bx + 0.6, bx + 1.9
    hop.box(cx0, cx1, bh, bh + 0.36, BZ1 - 0.42, BZ1 + 0.02)
    hop.finish(parent)
    cer = Mesh('int_cups', mat['ceramic'])
    for k in range(6): cer.cyl((ex - 0.25 + k * 0.1, bh + 0.48, BZ0 + 0.18), (ex - 0.25 + k * 0.1, bh + 0.55, BZ0 + 0.18), 0.035, seg=10, r2=0.04)
    for k in range(3): cer.cyl((cx0 + 0.25 + k * 0.4, bh + 0.02, BZ1 - 0.2), (cx0 + 0.25 + k * 0.4, bh + 0.025, BZ1 - 0.2), 0.14, seg=16)   # 甜點盤
    if not lite:
        for k in range(4): cer.cyl((BX1 - 1.2 + k * 0.14, bh, BZ1 - 0.12), (BX1 - 1.2 + k * 0.14, bh + 0.09, BZ1 - 0.12), 0.04, seg=10, r2=0.045)
    cer.finish(parent, smooth=True)
    cake = Mesh('int_cakes', mat['cake'])
    for k in range(3):
        cxk = cx0 + 0.25 + k * 0.4
        for j in range(2): cake.cyl((cxk - 0.05 + j * 0.1, bh + 0.025, BZ1 - 0.2), (cxk - 0.05 + j * 0.1, bh + 0.07, BZ1 - 0.2), 0.045, seg=12)   # 檸檬塔
    cake.finish(parent, smooth=True)
    # 吧檯後的牆面層架（遊戲導航 shelfWall 的範圍）：下櫃＋檯面、三層開放木層板、玻璃罐（咖啡豆）、杯盤；上面的黑板菜單（MENU_FACE）
    sx0, sx1 = SHELF['x'] - SHELF['w'] / 2, SHELF['x'] + SHELF['w'] / 2
    sh = wall_mesh('back', 'shelf', mat['shelf'])
    sh.box(sx0, sx1, 0, 0.88, Z0, Z0 + 0.5)
    for k in range(7): sh.box(sx0 + 0.04 + k * (sx1 - sx0) / 7, sx0 + (k + 1) * (sx1 - sx0) / 7 - 0.04, 0.12, 0.84, Z0 + 0.5, Z0 + 0.515)   # 櫃門
    for y in (1.45, 1.85, 2.25): sh.box(sx0 + 0.1, sx1 - 0.1, y, y + 0.04, Z0, Z0 + 0.3)
    for xx in (sx0 + 0.1, sx1 - 0.14): sh.box(xx, xx + 0.04, 1.2, 2.3, Z0, Z0 + 0.3)
    st2 = wall_mesh('back', 'shelftop', mat['bartop']); st2.box(sx0 - 0.02, sx1 + 0.02, 0.88, 0.92, Z0, Z0 + 0.54)
    jar = wall_mesh('back', 'jars', mat['glass']); bean = wall_mesh('back', 'beans', mat['soil']); cup2 = wall_mesh('back', 'cups', mat['ceramic'])
    for y in (1.49, 1.89, 2.29):
        x = sx0 + 0.3
        while x < sx1 - 0.3:
            r = random.uniform(0.05, 0.07); hh = random.uniform(0.15, 0.24)
            if y < 2.0 or random.random() < 0.5:
                jar.cyl((x, y, Z0 + 0.15), (x, y + hh, Z0 + 0.15), r, seg=10)
                if y < 2.0: bean.cyl((x, y + 0.005, Z0 + 0.15), (x, y + hh * 0.6, Z0 + 0.15), r * 0.85, seg=8)
            else:
                for j in range(3): cup2.cyl((x - 0.08 + j * 0.08, y, Z0 + 0.15), (x - 0.08 + j * 0.08, y + 0.08, Z0 + 0.15), 0.035, seg=8, r2=0.042)
            x += random.uniform(0.3, 0.45)
    mf = wall_mesh('back', 'menuframe', mat['shelf']); mf.box(-4.9, -0.1, 2.45, 3.27, Z0, Z0 + 0.03)
    menu = Mesh('MENU_FACE', mat['chalk']); menu.quad([(-4.82, 2.52, Z0 + 0.035), (-0.18, 2.52, Z0 + 0.035), (-0.18, 3.2, Z0 + 0.035), (-4.82, 3.2, Z0 + 0.035)])
    out['menu'] = menu
    # 書牆（後牆右段）：木格（6 欄 × 6 層）＋書（色票）＋幾個小盆栽與相框
    BK0, BK1 = BOOKCASE[0], min(BOOKCASE[1], X1 - 0.02); DP = 0.38
    bk = wall_mesh('back', 'bookcase', mat['shelf'])
    bk.box(BK0, BK1, 0, 0.12, Z0, Z0 + DP); bk.box(BK0, BK1, 3.0, 3.08, Z0, Z0 + DP); bk.box(BK0, BK1, 0, 3.08, Z0, Z0 + 0.02)
    ncol = 6; cols = [BK0 + (BK1 - BK0) * k / ncol for k in range(ncol + 1)]
    for x in cols: bk.box(x - 0.03, x + 0.03, 0, 3.08, Z0, Z0 + DP)
    rows = [0.12, 0.6, 1.08, 1.56, 2.04, 2.52, 3.0]
    for y in rows[1:-1]: bk.box(BK0, BK1, y - 0.03, y, Z0, Z0 + DP)
    books = wall_mesh('back', 'books', mat['books'], uv=False); uvl = books.bm.loops.layers.uv.verify()
    deco = []
    for ri in range(len(rows) - 1):
        y0 = rows[ri] + 0.005
        for ci in range(ncol):
            x = cols[ci] + 0.04; xe = cols[ci + 1] - 0.04
            if random.random() < 0.12: deco.append(((x + xe) / 2, y0, ri)); continue          # 這一格放小盆栽或相框
            while x < xe - 0.05:
                if random.random() < 0.1: x += random.uniform(0.08, 0.18); continue
                bw_ = random.uniform(0.025, 0.06); bh_ = random.uniform(0.22, 0.4); bd_ = random.uniform(0.18, 0.27)
                if x + bw_ > xe: break
                z1 = Z0 + 0.02 + bd_
                vs = [books.bm.verts.new(g2b(*p)) for p in ((x, y0, z1), (x + bw_, y0, z1), (x + bw_, y0 + bh_, z1), (x, y0 + bh_, z1), (x, y0 + bh_, z1 - bd_), (x + bw_, y0 + bh_, z1 - bd_))]
                fs = [books.bm.faces.new((vs[0], vs[1], vs[2], vs[3])), books.bm.faces.new((vs[3], vs[2], vs[5], vs[4]))]
                if random.random() < 0.5: v6 = books.bm.verts.new(g2b(x + bw_, y0, z1 - bd_)); fs.append(books.bm.faces.new((vs[1], v6, vs[5], vs[2])))
                else: v6 = books.bm.verts.new(g2b(x, y0, z1 - bd_)); fs.append(books.bm.faces.new((v6, vs[0], vs[3], vs[4])))
                u = (random.randrange(8) + 0.5) / 8
                for f in fs:
                    for lp in f.loops: lp[uvl].uv = (u, 0.5)
                x += bw_ + 0.003
    # 雙人桌 ×4＋曲木椅 ×8（位置與方向照遊戲的 twoTop：z+0.8 的椅子面向 −z、z−0.8 的面向 +z）
    tbm = table_mesh(mat); chm = chair_mesh(mat)
    for k, (tx, tz) in enumerate(TABLES):
        B.instance(tbm, f'table_{k}', tx, 0, tz, parent)
        B.instance(chm, f'chair_{k}a', tx, 0, tz + 0.8, parent, ry=math.pi); B.instance(chm, f'chair_{k}b', tx, 0, tz - 0.8, parent, ry=0.0)
    tw = Mesh('int_table_items', mat['ceramic'])
    for k, (tx, tz) in enumerate(TABLES):
        tw.cyl((tx - 0.12, 0.77, tz + 0.18), (tx - 0.12, 0.775, tz + 0.18), 0.07, seg=12); tw.cyl((tx - 0.12, 0.775, tz + 0.18), (tx - 0.12, 0.85, tz + 0.18), 0.04, seg=10, r2=0.045)
        if k % 2 == 0: tw.cyl((tx + 0.16, 0.77, tz - 0.15), (tx + 0.16, 0.775, tz - 0.15), 0.07, seg=12); tw.cyl((tx + 0.16, 0.775, tz - 0.15), (tx + 0.16, 0.85, tz - 0.15), 0.04, seg=10, r2=0.045)
    tw.finish(parent, smooth=True)
    # 吧檯椅 ×3、窗邊吧台的高腳椅 ×6
    stm = stool_mesh(mat)
    for k, (sx, sz) in enumerate(STOOLS): B.instance(stm, f'barstool_{k}', sx, 0, sz, parent)
    # 窗邊吧台（店面玻璃內側，兩段；遊戲導航另外擋）＋高腳椅＋小盆栽
    wc = Mesh('int_window_counter', mat['iwood'])
    for s in (-1, 1):
        a, b_ = sorted((s * COUNTER_X[0], s * COUNTER_X[1]))
        wc.box(a, b_, COUNTER_H - 0.05, COUNTER_H, COUNTER_Z, COUNTER_Z + COUNTER_DEP)
        for xx in (a + 0.1, (a + b_) / 2, b_ - 0.1): wc.box(xx - 0.025, xx + 0.025, 0, COUNTER_H - 0.05, COUNTER_Z + 0.3, COUNTER_Z + 0.35)
    wc.finish(parent)
    for k, sx in enumerate(WC_STOOLS): B.instance(stm, f'winstool_{k}', sx, 0, COUNTER_Z - 0.4, parent)
    # 吊燈：每張桌子上方一盞玻璃球、吧檯上方三盞金屬燈罩、窗邊吧台上方四盞小燈
    pm = Mesh('int_pendant_metal', mat['brass']); pg = Mesh('int_pendant_glass', mat['lampglass']); pb = Mesh('int_pendant_bulb', mat['bulb']); cord = Mesh('int_pendant_cord', mat['metal'])
    glows = []
    def pendant(x, y, z, kind='globe'):
        cord.cyl((x, RH, z), (x, y + 0.16, z), 0.006, seg=4)
        pm.cyl((x, y + 0.16, z), (x, y + 0.1, z), 0.03, seg=10, r2=0.045)
        if kind == 'globe': pg.sphere((x, y - 0.03, z), 0.14, seg=14, rings=8)
        else:
            bmx = L.lathe([(0.04, 0.12), (0.06, 0.08), (0.2, -0.08), (0.21, -0.1)], seg=16); pm.add_bm(bmx, Matrix.Translation(g2b(x, y, z))); bmx.free()
        pb.sphere((x, y - 0.03, z), 0.04, seg=8, rings=4); glows.append((x, y - 0.05, z))
    for (tx, tz) in TABLES: pendant(tx, 2.2, tz, 'globe')
    for xx in (-5.0, -2.5, 0.0): pendant(xx, 2.3, BAR['z'], 'dome')
    if not lite:
        for xx in (-4.6, -2.6, 2.6, 4.6): pendant(xx, 2.35, COUNTER_Z + 0.2, 'dome')
    for m_ in (pm, pg, pb): m_.finish(parent, smooth=True)
    cord.finish(parent)
    out['glows'] = glows
    # 植物：大盆栽（琴葉榕一類）＋書牆與窗台的小盆栽
    ipl = Mesh('int_plants', mat['broad']); ipo = Mesh('int_pots', mat['pot_cream']); itr = Mesh('int_trunks', mat['trunk']); ifern = Mesh('int_ferns', mat['fern'])
    for (px_, pz_) in BIG_PLANTS:
        pot(ipo, px_, pz_, 0.24, 0.45, 'cyl'); itr.cyl((px_, 0.42, pz_), (px_ + 0.05, 1.2, pz_), 0.025, seg=6)
        bush(ipl, px_, 1.45, pz_, 0.6, n=10, span=0.4, flat_y=1.6)
    for (dx, dy, ri) in deco:
        pot(ipo, dx, Z0 + 0.2, 0.07, 0.12, y0=dy); bush(ifern, dx, dy + 0.22, Z0 + 0.2, 0.22, n=3, span=0.45, flat_y=0.6)
    for c in RIGHT_WINS:                                    # 右窗窗台上的小盆栽
        pot(ipo, X1 - 0.1, c + 0.6, 0.07, 0.12, y0=WIN_Y - WIN_H / 2); bush(ifern, X1 - 0.1, WIN_Y - WIN_H / 2 + 0.22, c + 0.6, 0.22, n=3, span=0.45, flat_y=0.6)
    for s in (-1, 1):                                       # 窗邊吧台上的小盆栽
        for xx in (2.0, 4.2, 5.8):
            pot(ipo, s * xx, COUNTER_Z + 0.2, 0.065, 0.12, y0=COUNTER_H); bush(ifern, s * xx, COUNTER_H + 0.22, COUNTER_Z + 0.2, 0.2, n=3, span=0.45, flat_y=0.6)
    ipl.finish(parent, uv=False); ifern.finish(parent, uv=False); ipo.finish(parent, smooth=True); itr.finish(parent)
    # 左牆：三幅裱框的畫（暖色系版畫，用素色板＋木框）、一段牆上層板＋小盆栽
    if not lite:
        fr = wall_mesh('left', 'frames', mat['shelf']); pr = wall_mesh('left', 'prints', mat['print'])
        for (zc, w_, h_) in ((-1.4, 0.7, 0.9), (0.6, 1.1, 0.75), (4.1, 0.6, 0.8)):
            fr.box(X0, X0 + 0.04, 1.75 - h_ / 2, 1.75 + h_ / 2, zc - w_ / 2, zc + w_ / 2)
            pr.box(X0 + 0.04, X0 + 0.045, 1.75 - h_ / 2 + 0.06, 1.75 + h_ / 2 - 0.06, zc - w_ / 2 + 0.06, zc + w_ / 2 - 0.06)
        fr.box(X0, X0 + 0.22, 2.35, 2.39, 2.2, 3.4)
        lp = wall_mesh('left', 'shelfplants', mat['fern'], uv=False)
        for zz in (2.4, 2.8, 3.2): bush(lp, X0 + 0.12, 2.55, zz, 0.2, n=3, span=0.45, flat_y=0.6)
    if walls is None:
        for side, me in wall_list: me.finish(parent, uv=me.uv)
    else:
        for side, me in wall_list: walls.setdefault(side, []).append(me)
    return out


def finish_walls(walls, parent, dirs):
    """室內版：牆面零件命名 WALL_<side>_<part>，自訂屬性 dir＝往室內的法線（遊戲 attachRoomGLB 用來淡出牆）"""
    for side, meshes in walls.items():
        for me in meshes:
            me.name = f'WALL_{me.name}'
            me.finish(parent, uv=me.uv, props={'dir': dirs[side]})
