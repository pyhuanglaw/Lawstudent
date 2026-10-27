"""桃園機場第二航廈（VAC-A2）：出境大廳＋航廈外下車處（airport_dep）、入境大廳（airport_arr）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2：
  python3 tools/blender/env_second/airport_layout_gen.py && python3 tools/blender/env_second/airport_tex.py
  /opt/blenv/bin/python tools/blender/env_second/airport_t2.py -- --area dep   → assets/models/env/second_ai/airport_dep.glb
  /opt/blenv/bin/python tools/blender/env_second/airport_t2.py -- --area arr   → assets/models/env/second_ai/airport_arr.glb
配置 assets/models/env/second_ai/airport_t2.layout.json（規格：AA-C 2026-10-17 的 VAC-A2 回覆）；座標＝各區域的區域座標（x 東、z 南、y 上）。
做法：
  出境：挑高弧形天花板（鋁格柵貼圖＋法線、兩條天窗發光帶、一排一排的筒燈）；正面整面玻璃帷幕（豎框、橫框）＋自動門；
    四座報到島：中間深灰背牆＋行李輸送帶、兩側一格一格的報到櫃台（白色櫃身、石材檯面、螢幕、磅秤輸送帶）、上方吊著發光的航空公司燈箱（虛構）、島尾的小航班看板；
    櫃台前的伸縮帶排隊欄；北牆正中的出境安檢入口（深灰門框、上面發光的「證照查驗」指標、門後毛玻璃隔間）；兩塊大航班看板；圓弧服務台；
    東西兩側牆上的店面（便利商店、咖啡、書店、外幣兌換：玻璃櫥窗、招牌、裡面發光的層架）；候機椅（鋼樑連座）；大盆栽；行李推車；吊掛的中英指標。
    航廈外：人行道（下車處）、路緣、兩線車道、大雨遮（鋼柱、白色底板、燈）、「第二航廈 出境」指標、矮護欄、遠景（停車大樓、高架道路、樹）。
  入境：平頂（5.6 m）鋁格柵天花板＋燈帶；北牆出關門（毛玻璃自動門＋上方指標）、兩塊抵達看板；不鏽鋼接機欄杆夾出走道；候機椅；外幣兌換、旅客服務、電信門市櫃台；咖啡店；南牆玻璃出口。
航空公司、店名全部虛構（D77）；看板的城市是真的地名。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
AREA = arg('--area', 'dep')
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/airport_%s.glb' % AREA))
LAY = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/airport_t2.layout.json'), encoding='utf-8'))
J = LAY[AREA]
GEN = os.path.join(HERE, 'textures', 'gen')
rng = random.Random(20261019 + (0 if AREA == 'dep' else 7))
B.reset(texres=512)
root = B.group('airport_' + AREA, props={'kind': 'airport_' + AREA, 'layout': 'airport_t2.layout.json'})


def img_mat(name, fn, rough=0.6, emit=0.0, nor=None, clip=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if nor:
        tn = N.new('ShaderNodeTexImage'); tn.image = bpy.data.images.load(os.path.join(GEN, nor), check_existing=True); tn.image.colorspace_settings.name = 'Non-Color'
        nm = N.new('ShaderNodeNormalMap'); nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    if clip:
        rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rnd.inputs[0]); nt.links.new(rnd.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    m['tile'] = 1.0
    return m


def uv_quad(mesh, pts, uvs):
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def outside_night(x0, x1, y0, y1, z, eye=(0.0, 4.0, 0.0), back=0.5):
    """窗外遠景的夜景平面（airport_backdrop.py --night：停車場樓層、路燈、窗戶亮著）：放在白天那塊後面 back 公尺，從大廳中間 eye 看出去和白天那塊蓋住同一個範圍
    （照距離比例放大）；遊戲晚上才藏起白天那塊、露出這塊（us3d.js apOutside）。沒有接 us3d.js 的版本，白天那塊在前面擋住，看不到這塊"""
    k = (z + back - eye[2]) / (z - eye[2]); X = lambda x: eye[0] + (x - eye[0]) * k; Y = lambda y: eye[1] + (y - eye[1]) * k
    on = Mesh('GLOW_ap_outside_night', img_mat('GLOW_ap_outside_night_m', 'ap_outside_night.png', rough=0.9, emit=1.0))
    uv_quad(on, [(X(x0), Y(y0), z + back), (X(x1), Y(y0), z + back), (X(x1), Y(y1), z + back), (X(x0), Y(y1), z + back)][::-1], [(1, 0), (0, 0), (0, 1), (1, 1)][::-1])
    on.finish(root, uv=False)


def sign_board(mesh, frame, cx, cy, cz, w, h, face, uvr, depth=0.12, back=None):
    """招牌燈箱：深灰外框盒＋正面（face：'S'＝朝 +z、'N'＝朝 −z、'E'＝朝 +x、'W'＝朝 −x）貼圖集的 uvr＝(u0, v0, u1, v1)；back＝背面也貼（兩面招牌）"""
    u0, v0, u1, v1 = uvr; hw, hh = w / 2, h / 2
    if face in ('S', 'N'):
        frame.box(cx - hw - 0.03, cx + hw + 0.03, cy - hh - 0.03, cy + hh + 0.03, cz - depth / 2, cz + depth / 2)
        if face == 'S' or back: z = cz + depth / 2 + 0.003; uv_quad(mesh, [(cx - hw, cy - hh, z), (cx + hw, cy - hh, z), (cx + hw, cy + hh, z), (cx - hw, cy + hh, z)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
        if face == 'N' or back:
            ub = back or uvr; z = cz - depth / 2 - 0.003
            uv_quad(mesh, [(cx + hw, cy - hh, z), (cx - hw, cy - hh, z), (cx - hw, cy + hh, z), (cx + hw, cy + hh, z)], [(ub[0], ub[1]), (ub[2], ub[1]), (ub[2], ub[3]), (ub[0], ub[3])])
    else:
        frame.box(cx - depth / 2, cx + depth / 2, cy - hh - 0.03, cy + hh + 0.03, cz - hw - 0.03, cz + hw + 0.03)
        if face == 'E' or back: x = cx + depth / 2 + 0.003; uv_quad(mesh, [(x, cy - hh, cz + hw), (x, cy - hh, cz - hw), (x, cy + hh, cz - hw), (x, cy + hh, cz + hw)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
        if face == 'W' or back:
            ub = back or uvr; x = cx - depth / 2 - 0.003
            uv_quad(mesh, [(x, cy - hh, cz - hw), (x, cy - hh, cz + hw), (x, cy + hh, cz + hw), (x, cy + hh, cz - hw)], [(ub[0], ub[1]), (ub[2], ub[1]), (ub[2], ub[3]), (ub[0], ub[3])])


def row_uv(i, n, u0=0.0, u1=1.0):
    """n 列的圖集第 i 列（由上往下）"""
    return (u0, 1.0 - (i + 1) / n + 0.002, u1, 1.0 - i / n - 0.002)


SIGN = {'dep': 0, 'checkin': 1, 'passport': 2, 'arr': 3, 'exit': 4, 'transport': 5, 'carts': 6, 't2dep': 7}
SHOP = {'mart': 0, 'cafe': 1, 'books': 2, 'fx': 3, 'sim': 4, 'info': 5}
AIRL = {'lumen': (0.0, 0.5, 0.5, 1.0), 'kite': (0.5, 0.5, 1.0, 1.0), 'nanfeng': (0.0, 0.0, 0.5, 0.5), 'harbor': (0.5, 0.0, 1.0, 0.5)}

M = {'floor': L.pbr('ap_floor', 'granite_tile', tile=1.6, target='#cfcdc7', contrast=0.5, normal=0.12, maps=('diff', 'nor'), res=512, rough_value=0.2),
     'floorD': L.pbr('ap_floor_band', 'granite_tile', tile=1.6, target='#5d5e60', contrast=0.6, maps=('diff',), res=256, rough_value=0.22),
     'wall': L.pbr('ap_wall', 'white_plaster_02', tile=2.4, target='#e8e6e0', contrast=0.2, normal=0.06, maps=('diff', 'nor'), res=256, rough_value=0.8),
     'panel': L.flat('ap_wall_panel', '#575c61', rough=0.55),   # 報到島背牆、燈箱框：烤漆深灰（ART-VAC-AIRPORT-1021：原本 #3a3e42＋金屬 0.2，遊戲沒有環境貼圖，看起來是一片黑洞）
     'ceil': img_mat('ap_ceiling', 'ap_ceiling.png', rough=0.4, nor='ap_ceiling_nor.png'),
     'white': L.flat('ap_white', '#ecebe7', rough=0.4),
     'col': L.flat('ap_column', '#eeeeea', rough=0.35),
     'steel': L.flat('ap_steel', '#b9bcc0', rough=0.3, metal=0.45),
     'mull': L.flat('ap_mullion', '#8a8f94', rough=0.35, metal=0.3),   # 帷幕、門的框：陽極鋁灰（原本 #4a4e52＋金屬 0.35，近看一根黑柱）
     'glass': L.flat('ck_glass', '#dfe9ec', rough=0.05, alpha=0.16),
     'frost': L.flat('GLOW_ap_frosted', '#eef2f2', rough=0.3, emit=B.srgb('#c8d2d6'), alpha=0.85),
     'top': L.pbr('ap_counter_top', 'granite_tile_03', tile=0.8, target='#4a4a4c', normal=0.15, maps=('diff', 'nor'), res=256, rough_value=0.25),
     'rubber': L.flat('ap_belt', '#2c2e31', rough=0.85),   # 輸送帶：深橡膠灰（原本 #1c1d1f，看起來是挖空的黑方塊）
     'seat': L.flat('ap_seat', '#26282b', rough=0.5),
     'belt': L.flat('ap_queue_belt', '#24427a', rough=0.6),
     'down': L.flat('GLOW_ap_downlight', '#ffffff', rough=0.3, emit=B.srgb('#fff6e6')),
     'sky': L.flat('GLOW_ap_skylight', '#ffffff', rough=0.3, emit=B.srgb('#eef6ff')),
     'signs': img_mat('GLOW_ap_signs', 'ap_signs.png', rough=0.4, emit=0.5),
     'shops': img_mat('GLOW_ap_shops', 'ap_shops.png', rough=0.4, emit=0.5),
     'airl': img_mat('GLOW_ap_airlines', 'ap_airlines.png', rough=0.4, emit=0.7),
     'fidsD': img_mat('GLOW_ap_fids_dep', 'ap_fids_dep.png', rough=0.3, emit=1.0),
     'fidsA': img_mat('GLOW_ap_fids_arr', 'ap_fids_arr.png', rough=0.3, emit=1.0),
     'prod': img_mat('ap_products', 'us_mk_products.png', rough=0.45),
     'shelfL': L.flat('GLOW_ap_shelf_light', '#ffffff', rough=0.3, emit=B.srgb('#fff4e0')),
     'asph': L.pbr('ap_asphalt', 'asphalt_02', tile=3.0, target='#5e5f61', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'conc': L.pbr('ap_concrete', 'concrete_wall_006', tile=2.0, target='#b3b1ab', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'paint': L.flat('ap_road_paint', '#ecebe6', rough=0.6),
     'wood': L.pbr('ap_wood', 'walnut_veneer', tile=0.8, target='#9a7450', normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.45),
     'vc': L.vc_material('ap_vc', rough=0.5)}
M['ceil'].use_backface_culling = True   # 10-22：天花板單面（出境的弧形格柵、入境的平頂都朝下）
try:
    import plants as PL
    PM = PL.materials('ap_')
except Exception as ex:
    PL = None; PM = {}; print('plants', ex)
pv = CMesh('ap_props', M['vc'])
st = Mesh('ap_steel_parts', M['steel']); mu = Mesh('ap_mullions', M['mull']); gl = Mesh('ap_glass', M['glass']); wt = Mesh('ap_white_parts', M['white'])
pn = Mesh('ap_panels', M['panel']); tp = Mesh('ap_tops', M['top']); rb = Mesh('ap_rubber', M['rubber']); se = Mesh('ap_seats', M['seat'])
sg = Mesh('GLOW_ap_signs', M['signs']); sh_ = Mesh('GLOW_ap_shops', M['shops']); al = Mesh('GLOW_ap_airlines', M['airl'])
dl = Mesh('GLOW_ap_downlights', M['down']); co = Mesh('ap_columns', M['col']); bl = Mesh('ap_queue_belts', M['belt']); fr = Mesh('GLOW_ap_frosted', M['frost'])
fdD = Mesh('GLOW_ap_fids_dep', M['fidsD']); fdA = Mesh('GLOW_ap_fids_arr', M['fidsA'])


def bench(x, z, yaw, n):
    """鋼樑連座：一支橫樑＋每三個座位一組腳；座位＝座墊＋椅背（深灰皮革感），扶手鋁色"""
    c, s_ = math.cos(yaw), math.sin(yaw)
    def P(u, y, v): return (x + u * c + v * s_, y, z - u * s_ + v * c)
    L_ = n * 3 * 0.62
    st.cyl(P(-L_ / 2, 0.36, -0.05), P(L_ / 2, 0.36, -0.05), 0.04, seg=8)
    for k in range(n + 1):
        u = -L_ / 2 + k * (L_ / n)
        st.cyl(P(u, 0.0, -0.05), P(u, 0.36, -0.05), 0.03, seg=6); st.cyl(P(u, 0.01, -0.3), P(u, 0.01, 0.2), 0.025, seg=6)
    for k in range(n * 3):
        u = -L_ / 2 + 0.31 + k * 0.62
        a, b_ = P(u - 0.26, 0.4, -0.22), P(u + 0.26, 0.47, 0.22)
        xs = sorted((a[0], b_[0], P(u - 0.26, 0, 0.22)[0], P(u + 0.26, 0, -0.22)[0])); zs = sorted((a[2], b_[2], P(u - 0.26, 0, 0.22)[2], P(u + 0.26, 0, -0.22)[2]))
        se.rbox(xs[0], xs[-1], 0.4, 0.47, zs[0], zs[-1], r=0.03, seg=2) if abs(s_) < 0.01 or abs(c) < 0.01 else None
        q0, q1 = P(u - 0.26, 0.47, -0.24), P(u + 0.26, 0.9, -0.2)
        xs2 = sorted((q0[0], q1[0])); zs2 = sorted((q0[2], q1[2]))
        if abs(s_) < 0.01 or abs(c) < 0.01:
            if abs(s_) < 0.01: se.rbox(xs2[0], xs2[1], 0.47, 0.9, min(zs2[0], zs2[1]) - 0.02, min(zs2[0], zs2[1]) + 0.04, r=0.02, seg=1)
            else: se.rbox(min(xs2[0], xs2[1]) - 0.02, min(xs2[0], xs2[1]) + 0.04, 0.47, 0.9, zs2[0], zs2[1], r=0.02, seg=1)
        if k % 3 == 0 or k == n * 3 - 1:
            uu = u - 0.31 if k % 3 == 0 else u + 0.31
            st.cyl(P(uu, 0.47, -0.2), P(uu, 0.62, -0.2), 0.012, seg=5); st.cyl(P(uu, 0.62, -0.2), P(uu, 0.62, 0.15), 0.015, seg=5)


def potted_plant(x, z, h=2.4):
    """大盆栽：灰色水泥圓盆＋細樹幹＋幾團葉片卡（和社區的樹同一種葉子）"""
    f0 = set(pv.bm.faces); pv.cyl((x, 0.0, z), (x, 0.55, z), 0.38, seg=14, r2=0.42); pv.paint([f for f in pv.bm.faces if f not in f0], '#8c8a86')
    f0 = set(pv.bm.faces); pv.cyl((x, 0.53, z), (x, 0.56, z), 0.39, seg=14); pv.paint([f for f in pv.bm.faces if f not in f0], '#3a2e24')
    f0 = set(pv.bm.faces); pv.cyl((x, 0.55, z), (x, h * 0.65, z), 0.035, seg=6, r2=0.025); pv.paint([f for f in pv.bm.faces if f not in f0], '#5c4a3b')
    if not PL: return
    lm = PM.get('leaf_small')
    if lm is None: return
    for k in range(70):
        a_ = rng.uniform(0, 2 * math.pi); e_ = math.asin(rng.uniform(-0.6, 1.0)); rr = rng.uniform(0.25, 0.6)
        px, py, pz = x + rr * math.cos(a_) * math.cos(e_), h * 0.72 + rr * 0.8 * math.sin(e_), z + rr * math.sin(a_) * math.cos(e_)
        sz = rng.uniform(0.28, 0.42); yaw = rng.uniform(0, math.pi); ca, sa = math.cos(yaw), math.sin(yaw); tilt = rng.uniform(-0.5, 0.5)
        uv_quad(LEAF, [(px - ca * sz / 2, py - sz / 2 - tilt * sz / 2, pz - sa * sz / 2), (px + ca * sz / 2, py - sz / 2 + tilt * sz / 2, pz + sa * sz / 2),
                       (px + ca * sz / 2, py + sz / 2 + tilt * sz / 2, pz + sa * sz / 2), (px - ca * sz / 2, py + sz / 2 - tilt * sz / 2, pz - sa * sz / 2)], [(0, 0), (1, 0), (1, 1), (0, 1)])


LEAF = Mesh('ap_leaves', PM['leaf_small']) if PL and 'leaf_small' in PM else None


def trolley_row(x, z, n, yaw=0.0):
    """行李推車一排（套在一起）：鋁框、底板、把手（深灰）、小輪子"""
    for k in range(n):
        zz = z - k * 0.12
        st.box(x - 0.3, x + 0.3, 0.12, 0.15, zz - 0.45, zz + 0.25)                                  # 底板
        for s in (-1, 1): st.cyl((x + s * 0.28, 0.15, zz + 0.25), (x + s * 0.26, 1.0, zz + 0.32), 0.016, seg=5)
        f0 = set(pv.bm.faces); pv.cyl((x - 0.29, 1.0, zz + 0.33), (x + 0.29, 1.0, zz + 0.33), 0.022, seg=6); pv.paint([f for f in pv.bm.faces if f not in f0], '#2b2d30')
        st.box(x - 0.27, x + 0.27, 0.45, 0.48, zz + 0.2, zz + 0.3)
        if k == 0:
            for (wx, wz) in ((-0.22, -0.4), (0.22, -0.4), (-0.22, 0.2), (0.22, 0.2)):
                f0 = set(pv.bm.faces); pv.cyl((x + wx - 0.02, 0.06, zz + wz), (x + wx + 0.02, 0.06, zz + wz), 0.06, seg=8); pv.paint([f for f in pv.bm.faces if f not in f0], '#1e1f21')


def stanchion_line(x, z0, z1, gaps=()):
    """伸縮帶排隊欄：不鏽鋼立柱（底座）每 2 m 一支，中間藍色織帶；gaps＝留空的 z 區間"""
    n = max(1, int(round((z1 - z0) / 2.0))); pts = [z0 + k * (z1 - z0) / n for k in range(n + 1)]
    for z in pts:
        st.cyl((x, 0.0, z), (x, 0.02, z), 0.17, seg=12); st.cyl((x, 0.02, z), (x, 0.97, z), 0.03, seg=8); st.cyl((x, 0.95, z), (x, 1.0, z), 0.04, seg=8)
    for a, b in zip(pts, pts[1:]):
        if any(g0 <= (a + b) / 2 <= g1 for (g0, g1) in gaps): continue
        bl.quad([(x, 0.86, a + 0.04), (x, 0.86, b - 0.04), (x, 0.93, b - 0.04), (x, 0.93, a + 0.04)])


def shopfront(side, z0, z1, kind, xwall, h=4.2):
    """牆上的店面：玻璃櫥窗（兩側豎框）、門口、上面的招牌燈箱、裡面發光的層架與商品（或咖啡店的吧台）"""
    s = 1 if side == 'W' else -1          # 店面朝的方向（W 牆的店朝 +x）
    xf = xwall + s * 1.6; xb = xwall
    pn.box(min(xb, xf), max(xb, xf), h, h + 0.9, z0, z1)                                            # 招牌上方的牆
    sign_board(sh_, pn, xf + s * 0.06, h + 0.45, (z0 + z1) / 2, (z1 - z0) - 0.4, 0.62, 'E' if s > 0 else 'W', row_uv(SHOP[kind], 6))
    for zz in (z0, z1): mu.box(min(xb, xf), max(xb, xf), 0.0, h, zz - 0.06, zz + 0.06)
    zd0, zd1 = (z0 + z1) / 2 - 0.9, (z0 + z1) / 2 + 0.9                                              # 門口（開著）
    for (a, b) in ((z0 + 0.06, zd0), (zd1, z1 - 0.06)):
        gl.quad([(xf, 0.0, a), (xf, 0.0, b), (xf, h, b), (xf, h, a)]); mu.box(xf - 0.04, xf + 0.04, 0.0, 0.08, a, b); mu.box(xf - 0.04, xf + 0.04, h - 0.06, h, a, b)
    for zz in (zd0, zd1): mu.box(xf - 0.05, xf + 0.05, 0.0, h, zz - 0.05, zz + 0.05)
    wt.box(min(xb, xf), max(xb, xf), h - 0.02, h, z0, z1)                                           # 店內天花板
    if kind == 'cafe':
        tp.box(xb + s * 0.2, xb + s * 0.85, 1.0, 1.05, z0 + 0.6, z1 - 0.6); M2 = Mesh('ap_cafe_body', M['wood']); M2.box(min(xb + s * 0.25, xb + s * 0.8), max(xb + s * 0.25, xb + s * 0.8), 0.0, 1.0, z0 + 0.6, z1 - 0.6); M2.finish(root)
        for k in range(3): pv.crbox(min(xb + s * 0.3, xb + s * 0.5), max(xb + s * 0.3, xb + s * 0.5), 1.05, 1.45, z0 + 1.2 + k * 1.6, z0 + 1.6 + k * 1.6, '#3a3c3e', r=0.02, seg=1)   # 咖啡機
        sl = Mesh('GLOW_ap_shelf_%s' % kind, M['shelfL']); sl.box(min(xb, xb + s * 0.05), max(xb, xb + s * 0.05), 1.8, 2.6, z0 + 0.5, z1 - 0.5); sl.finish(root, uv=False)   # 菜單燈箱
    else:
        for k in range(2):
            xs_ = xb + s * (0.05 + k * 0.0)
            for ys in (0.2, 0.6, 1.0, 1.4, 1.8):
                st.box(min(xs_, xs_ + s * 0.45), max(xs_, xs_ + s * 0.45), ys - 0.02, ys, z0 + 0.3, z1 - 0.3)
                bmp = PROD.bm
                for zz in range(int((z1 - z0 - 0.6) / 0.8)):
                    za = z0 + 0.3 + zz * 0.8; u0 = rng.uniform(0, 0.6); row = rng.choice([2, 3, 4, 11, 6, 9]) if kind == 'mart' else rng.choice([0, 1, 8, 10])
                    vt = 1 - row / 16; vb = 1 - (row + 1) / 16
                    xfr = xs_ + s * 0.42
                    uv_quad(PROD, [(xfr, ys, za), (xfr, ys, za + 0.78), (xfr, ys + 0.3, za + 0.78), (xfr, ys + 0.3, za)][::(1 if s > 0 else -1)],
                            [(u0, vb), (u0 + 0.3, vb), (u0 + 0.3, vt), (u0, vt)][::(1 if s > 0 else -1)])
            break
        sl = Mesh('GLOW_ap_shelf_%s' % kind, M['shelfL']); sl.box(min(xb, xb + s * 0.5), max(xb, xb + s * 0.5), 2.2, 2.24, z0 + 0.3, z1 - 0.3); sl.finish(root, uv=False)
    if kind == 'fx':
        tp.box(min(xf, xf - s * 0.6), max(xf, xf - s * 0.6), 1.05, 1.1, z0 + 0.5, z1 - 0.5)
        fx_ = Mesh('GLOW_ap_fx_board', M['fidsA']); uv_quad(fx_, [(xb + s * 0.02, 1.6, z1 - 0.5), (xb + s * 0.02, 1.6, z0 + 0.5), (xb + s * 0.02, 2.6, z0 + 0.5), (xb + s * 0.02, 2.6, z1 - 0.5)][::(1 if s > 0 else -1)],
                                         [(0.6, 0.1), (0.95, 0.1), (0.95, 0.6), (0.6, 0.6)][::(1 if s > 0 else -1)] if s > 0 else [(0.95, 0.6), (0.6, 0.6), (0.6, 0.1), (0.95, 0.1)]); fx_.finish(root, uv=False)
        # ↑ 2026-10-25 招牌稽核：E 牆（s < 0，看板朝 −x）那一間原本字左右相反（頂點和 UV 一起反轉，配對沒變）——那一間的 UV 左右對調


PROD = Mesh('ap_products', M['prod'])
ADS = Mesh('GLOW_ap_ads', img_mat('GLOW_ap_ads_m', 'ap_ads.png', rough=0.4, emit=0.6))


def ad_box(x, z, face, k, y=2.5, w=1.5, h=3.0):
    """燈箱廣告（四張之一）：深灰外框＋發光畫面"""
    sign_board(ADS, pn, x, y, z, w, h, face, (k / 4 + 0.002, 0.002, (k + 1) / 4 - 0.002, 0.998), depth=0.16)


def recycle_bin(x, z, yaw=0.0):
    """分類回收桶（三格）：不鏽鋼桶身、三個不同顏色的投入口"""
    c, s_ = math.cos(yaw), math.sin(yaw)
    for k, col in enumerate(('#2f6db5', '#3a8a4a', '#d8a32a')):
        u = (k - 1) * 0.36; cx, cz = x + u * c, z - u * s_
        st.rbox(cx - 0.17, cx + 0.17, 0.0, 0.85, cz - 0.17, cz + 0.17, r=0.03, seg=2)
        f0 = set(pv.bm.faces); pv.crbox(cx - 0.17, cx + 0.17, 0.85, 0.9, cz - 0.17, cz + 0.17, col, r=0.015, seg=1)


def wall_cladding(axis, fixed, a0, a1, skip=(), inward=1):
    """牆下半部的深灰金屬板（0～3.2 m，每 1.8 m 一片、片與片之間 2 cm 的縫）；skip＝不貼的區間（店面、入口）"""
    a = a0
    while a < a1 - 0.1:
        b_ = min(a1, a + 1.8)
        if not any(not (b_ <= s0 or a >= s1) for (s0, s1) in skip):
            if axis == 'x': pn.box(a + 0.01, b_ - 0.01, 0.0, 3.2, min(fixed, fixed + inward * 0.04), max(fixed, fixed + inward * 0.04))
            else: pn.box(min(fixed, fixed + inward * 0.04), max(fixed, fixed + inward * 0.04), 0.0, 3.2, a + 0.01, b_ - 0.01)
        a = b_

# =====================================================================================
if AREA == 'dep':
    H = J['hall']; X0, X1, Z0, Z1 = H['x0'], H['x1'], H['z0'], H['z1']; R = J['roof']; EAVE, PEAK, PZ = R['eave'], R['peak'], R['peak_z']
    half = max(Z1 - PZ, PZ - Z0)
    def roof_y(z): return EAVE + (PEAK - EAVE) * max(0.0, 1.0 - ((z - PZ) / half) ** 2)
    # ---- 地板：大塊淺色石材＋深色分隔帶（每 9 m）----
    fl = Mesh('ap_floor', M['floor'], tile=1.6); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(root)
    fb = Mesh('ap_floor_bands', M['floorD'], tile=1.6)
    for x in range(-36, 37, 9): fb.box(x - 0.15, x + 0.15, 0.0, 0.002, Z0, Z1)
    fb.box(X0, X1, 0.0, 0.002, Z1 - 1.2, Z1 - 0.9); fb.finish(root)
    # ---- 天花板：弧形鋁格柵（格柵沿 x）＋兩條天窗＋筒燈 ----
    ce = Mesh('ap_ceiling', M['ceil']); bm = ce.bm; uvl = bm.loops.layers.uv.verify()
    NZ = 30; zs = [Z0 + (Z1 - Z0) * k / NZ for k in range(NZ + 1)]
    for xa in range(int(X0), int(X1), 6):
        xb = xa + 6
        for za, zb in zip(zs, zs[1:]):
            q = [(xb, roof_y(za), za), (xb, roof_y(zb), zb), (xa, roof_y(zb), zb), (xa, roof_y(za), za)]   # 朝下（10-22：天花板單面，鏡頭拉到上面時看得穿）
            f = bm.faces.new([bm.verts.new(g2b(*p)) for p in q])
            for lp, (px, py, pz) in zip(f.loops, q): lp[uvl].uv = (pz / 2.0, px / 2.0)
    ce.finish(root, uv=False)
    sk = Mesh('GLOW_ap_skylights', M['sky'])
    for zc in (-7.0, 1.0):
        for za, zb in ((zc - 0.8, zc + 0.8),):
            sk.quad([(X0 + 2, roof_y(za) - 0.05, za), (X1 - 2, roof_y(za) - 0.05, za), (X1 - 2, roof_y(zb) - 0.05, zb), (X0 + 2, roof_y(zb) - 0.05, zb)][::-1])
            for x in range(-34, 35, 6): mu.box(x - 0.06, x + 0.06, roof_y(zc) - 0.2, roof_y(zc) - 0.05, za, zb)
    sk.finish(root, uv=False)
    for x in range(-33, 34, 3):
        for z in (-15.0, -11.0, -3.0, 5.0, 9.0):
            y = roof_y(z) - 0.06; dl.cyl((x, y - 0.03, z), (x, y, z), 0.12, seg=8)
    # ---- 牆：北牆（中間留安檢入口）、東西兩面（弧形的頂）、正面玻璃帷幕 ----
    wl = Mesh('WALL_ap_walls', M['wall'], tile=2.4)
    S = J['security']
    for (xa, xb) in ((X0, S['x0']), (S['x1'], X1)): wl.quad([(xa, 0, Z0), (xb, 0, Z0), (xb, EAVE, Z0), (xa, EAVE, Z0)])
    wl.quad([(S['x0'], 4.6, Z0), (S['x1'], 4.6, Z0), (S['x1'], EAVE, Z0), (S['x0'], EAVE, Z0)])
    for xw, sgn in ((X0, 1), (X1, -1)):
        bm = wl.bm; pts = [(xw, 0.0, Z0)] + [(xw, roof_y(z), z) for z in zs] + [(xw, 0.0, Z1)]
        f = bm.faces.new([bm.verts.new(g2b(*p)) for p in (pts if sgn > 0 else pts[::-1])])
    wl.finish(root)
    for x in range(int(X0), int(X1) + 1, 9):                                                       # 正面的鋼柱（帷幕的主框）
        st.box(x - 0.18, x + 0.18, 0.0, EAVE, Z1 - 0.25, Z1 + 0.05)
    ents = sorted([(e['x'] - e['w'] / 2, e['x'] + e['w'] / 2) for e in J['entrances']])
    xs = [X0 + k * 1.8 for k in range(int((X1 - X0) / 1.8) + 1)]
    for xa, xb in zip(xs, xs[1:]):
        door = next(((a, b) for (a, b) in ents if not (xb <= a or xa >= b)), None)
        y0 = 3.0 if door else 0.0
        gl.quad([(xa, y0, Z1), (xb, y0, Z1), (xb, EAVE, Z1), (xa, EAVE, Z1)])
        mu.box(xa - 0.04, xa + 0.04, 0.0 if not door else 3.0, EAVE, Z1 - 0.08, Z1 + 0.04)
    for y in (3.0, 5.6, 8.2, EAVE - 0.1): mu.box(X0, X1, y - 0.04, y + 0.04, Z1 - 0.08, Z1 + 0.04)
    for (a, b) in ents:                                                                              # 自動門：兩扇滑門＋門框＋上方的機構
        for (p0, p1) in ((a, (a + b) / 2 - 0.02), ((a + b) / 2 + 0.02, b)):
            gl.quad([(p0, 0.02, Z1 - 0.15), (p1, 0.02, Z1 - 0.15), (p1, 2.6, Z1 - 0.15), (p0, 2.6, Z1 - 0.15)])
            for xx in (p0, p1): mu.box(xx - 0.03, xx + 0.03, 0.02, 2.62, Z1 - 0.18, Z1 - 0.12)
            mu.box(p0, p1, 0.02, 0.09, Z1 - 0.18, Z1 - 0.12); mu.box(p0, p1, 2.55, 2.62, Z1 - 0.18, Z1 - 0.12)
        mu.box(a - 0.12, b + 0.12, 2.62, 3.0, Z1 - 0.3, Z1 + 0.02)
        for xx in (a - 0.12, b + 0.12): mu.box(xx - 0.06, xx + 0.06, 0.0, 3.0, Z1 - 0.3, Z1 + 0.02)
    # ---- 柱子（在報到島的背牆裡，往上到天花板）----
    for isl in J['islands']:
        for zc in (-7.0, 1.0): co.cyl((isl['x'], 0.0, zc), (isl['x'], roof_y(zc), zc), 0.45, seg=20)
    # ---- 報到島 ----
    for isl in J['islands']:
        x, z0, z1, w, sp = isl['x'], isl['z0'], isl['z1'], isl['w'], isl['spine']
        pn.box(x - sp / 2, x + sp / 2, 0.0, 3.2, z0, z1)                                             # 背牆
        for s in (-1, 1):                                                                            # 背牆的鋁收邊：每 1.2 m 一道直的、頂邊一道（板材的分割，看得出尺度）
            xf = x + s * sp / 2; zz = z0 + 0.6
            while zz < z1 - 0.3: mu.box(min(xf, xf + s * 0.012), max(xf, xf + s * 0.012), 0.1, 3.2, zz - 0.02, zz + 0.02); zz += 1.2
        mu.box(x - sp / 2 - 0.015, x + sp / 2 + 0.015, 3.17, 3.22, z0 - 0.015, z1 + 0.015)
        for s in (-1, 1):
            xb0 = x + s * sp / 2
            st.box(min(xb0, xb0 + s * 0.75), max(xb0, xb0 + s * 0.75), 0.0, 0.45, z0, z1)          # 行李輸送帶（送進背牆）
            rb.box(min(xb0, xb0 + s * 0.7), max(xb0, xb0 + s * 0.7), 0.45, 0.47, z0 + 0.05, z1 - 0.05)
            n = int((z1 - z0) / isl['pitch'])
            for k in range(n):
                za = z0 + k * isl['pitch'] + 0.05; zb = za + isl['pitch'] - 0.1
                xc0, xc1 = xb0 + s * 0.8, xb0 + s * 1.7                                             # 櫃台：員工那側的工作檯（0.76）、客人那側高起來的檯面（1.08）、內縮的踢腳
                lo_, hi_ = min(xc0, xc1), max(xc0, xc1)
                wt.rbox(lo_, hi_, 0.1, 0.76, za, za + 1.05, r=0.03, seg=2)
                pn.box(lo_ + 0.05, hi_ - 0.05, 0.0, 0.1, za + 0.05, za + 1.0)                           # 踢腳（深灰、內縮）
                tp.rbox(lo_ - 0.02, hi_ + 0.02, 0.76, 0.8, za - 0.02, za + 1.07, r=0.01, seg=1)          # 工作檯面
                xf0 = xc1 - s * 0.32
                wt.rbox(min(xf0, xc1), max(xf0, xc1), 0.8, 1.06, za, za + 1.05, r=0.02, seg=1)           # 客人那側的高檯
                tp.rbox(min(xf0, xc1 + s * 0.06), max(xf0, xc1 + s * 0.06), 1.06, 1.1, za - 0.03, za + 1.08, r=0.015, seg=2)
                f0 = set(pv.bm.faces); pv.crbox(min(xc0 + s * 0.25, xc0 + s * 0.28), max(xc0 + s * 0.25, xc0 + s * 0.28), 0.8, 1.2, za + 0.3, za + 0.75, '#1d1f22', r=0.01, seg=1)   # 員工螢幕（背面）
                f0 = set(pv.bm.faces); pv.crbox(min(xc0 + s * 0.45, xc0 + s * 0.6), max(xc0 + s * 0.45, xc0 + s * 0.6), 0.8, 0.84, za + 0.35, za + 0.75, '#2a2c2e', r=0.01, seg=1)   # 鍵盤
                pv.crbox(min(xc0 + s * 0.3, xc0 + s * 0.5), max(xc0 + s * 0.3, xc0 + s * 0.5), 0.8, 0.95, za + 0.82, za + 0.98, '#e8e8e4', r=0.02, seg=1)   # 標籤印表機
                px_ = xc1 + s * 0.05; pz_ = za + 0.08                                                  # 櫃台號碼燈（不鏽鋼細桿＋小螢幕）
                st.cyl((px_, 1.1, pz_), (px_, 1.75, pz_), 0.02, seg=6)
                f0 = set(pv.bm.faces); pv.crbox(min(px_ - s * 0.02, px_ + s * 0.02), max(px_ - s * 0.02, px_ + s * 0.02), 1.62, 1.84, pz_ - 0.2, pz_ + 0.2, '#1a1c1e', r=0.01, seg=1)
                dl.box(min(px_ + s * 0.021, px_ + s * 0.024), max(px_ + s * 0.021, px_ + s * 0.024), 1.65, 1.81, pz_ - 0.17, pz_ + 0.17)
                xs0, xs1 = xc1, xc1 + s * 0.9                                                      # 磅秤輸送帶：不鏽鋼底座、黑色輸送帶、兩側低擋板、前緣斜坡
                st.box(min(xs0, xs1), max(xs0, xs1), 0.0, 0.26, za + 1.1, zb); rb.box(min(xs0, xs1) + 0.02, max(xs0, xs1) - 0.02, 0.26, 0.29, za + 1.14, zb - 0.04)
                for zz in (za + 1.1, zb - 0.03): st.box(min(xs0, xs1), max(xs0, xs1), 0.26, 0.42, zz, zz + 0.03)
                st.box(min(xs1, xs1 + s * 0.12), max(xs1, xs1 + s * 0.12), 0.0, 0.06, za + 1.1, zb)
            # 上方吊的航空公司燈箱（兩面、每 4 m 一塊）＋燈箱下的小號碼燈
            k = 0; zz = z0 + 2.0
            while zz < z1 - 1.0:
                sign_board(al, pn, x + s * (sp / 2 + 1.3), 2.85, zz, 3.6, 0.9, 'E' if s > 0 else 'W', AIRL[isl['airline']], depth=0.2)
                zz += 4.0; k += 1
        for zz in (z0 + 2.0, z1 - 2.0): st.cyl((x, 3.2, zz), (x, roof_y(zz), zz), 0.02, seg=4)
        f = next(ff for ff in J['fids'] if abs(ff['x'] - x) < 0.01)                                 # 島尾的小航班看板（立柱）
        st.cyl((x, 0.0, z1 + 0.25), (x, f['y'] - f['h'] / 2, z1 + 0.25), 0.06, seg=8)
        pn.box(x - f['w'] / 2 - 0.05, x + f['w'] / 2 + 0.05, f['y'] - f['h'] / 2 - 0.05, f['y'] + f['h'] / 2 + 0.05, z1 + 0.15, z1 + 0.3)
        uv_quad(fdD, [(x - f['w'] / 2, f['y'] - f['h'] / 2, z1 + 0.305), (x + f['w'] / 2, f['y'] - f['h'] / 2, z1 + 0.305), (x + f['w'] / 2, f['y'] + f['h'] / 2, z1 + 0.305), (x - f['w'] / 2, f['y'] + f['h'] / 2, z1 + 0.305)], [(0, 0), (1, 0), (1, 1), (0, 1)])
        for s in (-1, 1):                                                                            # 排隊欄
            stanchion_line(x + s * (w / 2 + 1.6), z0 + 1.6, z1 - 2.0, gaps=((z0 + 5.5, z0 + 7.5),))
    # ---- 出境安檢入口：深灰門框、上方大指標、門後毛玻璃隔間、查驗台 ----
    sx0, sx1 = S['x0'], S['x1']
    pn.box(sx0 - 0.6, sx0, 0.0, 4.6, Z0 - 0.3, Z0 + 0.3); pn.box(sx1, sx1 + 0.6, 0.0, 4.6, Z0 - 0.3, Z0 + 0.3); pn.box(sx0 - 0.6, sx1 + 0.6, 4.0, 4.6, Z0 - 0.3, Z0 + 0.3)
    wl2 = Mesh('ap_security_inside', M['wall']); wl2.box(sx0, sx1, 0.0, 0.02, Z0 - S['depth'], Z0); wl2.box(sx0 - 0.05, sx0, 0.0, 4.0, Z0 - S['depth'], Z0); wl2.box(sx1, sx1 + 0.05, 0.0, 4.0, Z0 - S['depth'], Z0); wl2.box(sx0, sx1, 4.0, 4.05, Z0 - S['depth'], Z0); wl2.finish(root)
    fr.quad([(sx0, 0.0, Z0 - S['depth']), (sx1, 0.0, Z0 - S['depth']), (sx1, 4.0, Z0 - S['depth']), (sx0, 4.0, Z0 - S['depth'])])
    sign_board(sg, pn, 0.0, 5.6, Z0 + 0.25, 8.2, 1.28, 'S', row_uv(SIGN['passport'], 8, 0.0, 0.40), depth=0.16)
    wt.rbox(sx0 + 0.6, sx0 + 1.8, 0.0, 1.1, Z0 - 1.2, Z0 - 0.6, r=0.03, seg=1); wt.rbox(sx1 - 1.8, sx1 - 0.6, 0.0, 1.1, Z0 - 1.2, Z0 - 0.6, r=0.03, seg=1)   # 查驗台
    stanchion_line(-1.2, Z0 - 0.3, Z0 + 3.0); stanchion_line(1.2, Z0 - 0.3, Z0 + 3.0)
    # ---- 大航班看板、服務台、吊掛指標 ----
    for f in J['fids'][:2]:
        x, y, z = f['x'], f['y'], f['z']
        pn.box(x - f['w'] / 2 - 0.12, x + f['w'] / 2 + 0.12, y - f['h'] / 2 - 0.12, y + f['h'] / 2 + 0.12, Z0 + 0.02, Z0 + 0.25)
        uv_quad(fdD, [(x - f['w'] / 2, y - f['h'] / 2, Z0 + 0.255), (x + f['w'] / 2, y - f['h'] / 2, Z0 + 0.255), (x + f['w'] / 2, y + f['h'] / 2, Z0 + 0.255), (x - f['w'] / 2, y + f['h'] / 2, Z0 + 0.255)], [(0, 0), (1, 0), (1, 1), (0, 1)])
    idk = J['info_desk']; ix, iz = idk['x'], idk['z']
    bm_ = L.lathe([(1.15, 0.0), (1.6, 0.0), (1.6, 1.05), (1.15, 1.05), (1.15, 0.0)], seg=28)   # 圓環形服務台（裡面站服務人員）
    wt.add_bm(bm_, Matrix.Translation(g2b(ix, 0, iz))); bm_.free()
    bm_ = L.lathe([(1.1, 1.05), (1.66, 1.05), (1.66, 1.09), (1.1, 1.09), (1.1, 1.05)], seg=28); tp.add_bm(bm_, Matrix.Translation(g2b(ix, 0, iz))); bm_.free()
    sign_board(sh_, pn, ix, 2.7, iz, 3.0, 0.375, 'S', row_uv(SHOP['info'], 6, 0.25, 0.75), depth=0.1, back=row_uv(SHOP['info'], 6, 0.25, 0.75))
    st.cyl((ix - 1.2, 2.9, iz), (ix - 1.2, roof_y(iz), iz), 0.01, seg=3); st.cyl((ix + 1.2, 2.9, iz), (ix + 1.2, roof_y(iz), iz), 0.01, seg=3)
    # 指標朝向：往北走（進來）的人看到的是朝南那一面（'S'）；往南走（出去）的人看朝北那一面（'N'）
    for (sx, sz, key, face, w) in ((0.0, 8.0, 'dep', 'S', 6.0), (-18.0, 8.0, 'checkin', 'S', 6.0), (18.0, 8.0, 'checkin', 'S', 6.0), (0.0, 2.0, 'exit', 'N', 3.0),
                                   (-27.0, -14.0, 'exit', 'N', 3.0), (27.0, -14.0, 'carts', 'S', 3.0)):
        sign_board(sg, pn, sx, 4.2, sz, w, 0.375 * w / 6.0 * 2.0 if w < 6 else 0.375, face, row_uv(SIGN[key], 8, 0.0, 1.0 if w >= 6 else 0.55), depth=0.12)
        for e in (-w / 2 + 0.3, w / 2 - 0.3): st.cyl((sx + e, 4.45, sz), (sx + e, roof_y(sz), sz), 0.01, seg=3)
    # ---- 牆面：下半部金屬板、燈箱廣告、回收桶 ----
    wall_cladding('x', Z0, X0, X1, skip=((S['x0'] - 0.7, S['x1'] + 0.7),), inward=1)
    shop_sk = {'W': [(sp['z0'], sp['z1']) for sp in J['shops'] if sp['side'] == 'W'], 'E': [(sp['z0'], sp['z1']) for sp in J['shops'] if sp['side'] == 'E']}
    wall_cladding('z', X0, Z0, Z1 - 0.3, skip=shop_sk['W'], inward=1); wall_cladding('z', X1, Z0, Z1 - 0.3, skip=shop_sk['E'], inward=-1)
    for k, x in enumerate((-31.0, -23.0, 23.0, 31.0)): ad_box(x, Z0 + 0.12, 'S', k)
    ad_box(X0 + 0.12, 8.0, 'E', 1); ad_box(X1 - 0.12, -8.5, 'W', 3); ad_box(X1 - 0.12, 7.0, 'W', 0)
    for (bx, bz, yw) in ((-22.5, -16.9, 0.0), (22.5, -16.9, 0.0), (-6.5, 9.6, 0.0), (6.5, 9.6, 0.0), (-34.9, -1.0, math.pi / 2), (34.9, 4.0, math.pi / 2)): recycle_bin(bx, bz, yw)
    # ---- 店面（東西牆）、候機椅、盆栽、推車 ----
    for shp in J['shops']: shopfront(shp['side'], shp['z0'], shp['z1'], shp['id'], X0 if shp['side'] == 'W' else X1)
    for b in J['benches']: bench(b['x'], b['z'], b['yaw'], b['n'])
    for (px, pz) in ((-14.0, 10.6), (14.0, 10.6), (-4.0, 10.6), (4.0, 10.6), (-34.6, -6.0), (34.6, -9.0)): potted_plant(px, pz)
    for t in J['trolleys']: trolley_row(t['x'], t['z'], t['n'])
    # ---- 航廈外：人行道、路緣、車道、大雨遮 ----
    C = J['curb']
    sw = Mesh('ap_sidewalk', M['floor'], tile=1.6); sw.box(X0, X1, -0.05, 0.15, Z1, C['walk_z1']); sw.finish(root)
    cb = Mesh('ap_curb', M['conc'], tile=2.0); cb.box(X0, X1, -0.05, 0.15, C['walk_z1'] - 0.25, C['walk_z1']); cb.box(X0, X1, 0.0, 0.9, C['road_z1'], C['road_z1'] + 0.4); cb.finish(root)
    ra = Mesh('ap_road', M['asph'], tile=3.0); ra.box(X0 - 20, X1 + 20, -0.08, -0.02, C['road_z0'], C['road_z1'] + 8); ra.finish(root)
    rp = Mesh('ap_road_lines', M['paint'])
    zl = (C['road_z0'] + C['road_z1']) / 2
    for x in range(-50, 51, 6): rp.box(x, x + 3.0, -0.02, -0.015, zl - 0.06, zl + 0.06)
    rp.box(X0 - 20, X1 + 20, -0.02, -0.015, C['road_z0'] + 0.25, C['road_z0'] + 0.35); rp.finish(root, uv=False)
    cy_ = C['canopy_h']
    wt.box(X0 - 2, X1 + 2, cy_, cy_ + 0.5, Z1, C['canopy_z1'])                                     # 雨遮（白色底板、深灰外緣）
    pn.box(X0 - 2, X1 + 2, cy_ - 0.2, cy_ + 0.6, C['canopy_z1'] - 0.3, C['canopy_z1'])
    for x in (-24.0, -8.0, 8.0, 24.0):
        st.cyl((x, 0.15, 18.5), (x, cy_, 18.5), 0.4, seg=16)
    for x in range(-33, 34, 6):
        for z in (14.5, 18.5, 22.5): dl.box(x - 1.0, x + 1.0, cy_ - 0.02, cy_, z - 0.08, z + 0.08)
    for (x, key) in ((-12.0, 't2dep'), (12.0, 't2dep')):
        sign_board(sg, pn, x, cy_ - 0.75, C['canopy_z1'] - 0.15, 8.0, 0.8, 'S', row_uv(SIGN[key], 8, 0.0, 0.62), depth=0.16, back=row_uv(SIGN[key], 8, 0.0, 0.62))
    for x in range(-34, 35, 2): st.cyl((x, 0.15, C['walk_z1'] - 0.4), (x, 0.95, C['walk_z1'] - 0.4), 0.07, seg=10)   # 人行道邊的不鏽鋼護樁
    ov = Mesh('GLOW_ap_outside', img_mat('GLOW_ap_outside_m', 'ap_outside.png', rough=0.9, emit=1.0))
    uv_quad(ov, [(-90, -2.0, 60), (90, -2.0, 60), (90, 34, 60), (-90, 34, 60)][::-1], [(1, 0), (0, 0), (0, 1), (1, 1)][::-1])
    ov.finish(root, uv=False)
    outside_night(-90, 90, -2.0, 34.0, 60.0)
    sg_t = Mesh('GLOW_ap_signs_out', M['signs'])
    sign_board(sg_t, pn, 0.0, EAVE + 1.3, Z1 + 0.3, 14.0, 1.4, 'S', row_uv(SIGN['t2dep'], 8, 0.0, 0.62), depth=0.2)   # 帷幕上方的大字
    sg_t.finish(root, uv=False)
    pv.cbox(X0, X1, EAVE, EAVE + 2.6, Z1 - 0.3, Z1 + 0.25, '#d9d9d5')                               # 帷幕上方的外牆

# =====================================================================================
else:
    BD = J['bounds']; X0, X1, Z0, Z1, HH = BD['x0'], BD['x1'], BD['z0'], BD['z1'], J['h']
    fl = Mesh('ap_floor', M['floor'], tile=1.6); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(root)
    fb = Mesh('ap_floor_bands', M['floorD'], tile=1.6)
    for x in range(-27, 28, 9): fb.box(x - 0.15, x + 0.15, 0.0, 0.002, Z0, Z1)
    fb.finish(root)
    ce = Mesh('ap_ceiling', M['ceil']); bm = ce.bm; uvl = bm.loops.layers.uv.verify()
    q = [(X0, HH, Z0), (X1, HH, Z0), (X1, HH, Z1), (X0, HH, Z1)]   # 朝下（10-22：入境 5.6 m，鏡頭拉遠最高 6.85 m；原本雙面朝上＝畫面整片格柵）
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in q])
    for lp, (px, py, pz) in zip(f.loops, q): lp[uvl].uv = (pz / 2.0, px / 2.0)
    ce.finish(root, uv=False)
    for z in range(-10, 11, 4): dl.box(X0 + 1, X1 - 1, HH - 0.04, HH - 0.01, z - 0.07, z + 0.07)     # 燈帶
    wl = Mesh('WALL_ap_walls', M['wall'], tile=2.4)
    cd = J['customs_door']; cx0, cx1 = cd['x'] - cd['w'] / 2 - 1.0, cd['x'] + cd['w'] / 2 + 1.0
    wl.quad([(X0, 0, Z0), (cx0, 0, Z0), (cx0, HH, Z0), (X0, HH, Z0)]); wl.quad([(cx1, 0, Z0), (X1, 0, Z0), (X1, HH, Z0), (cx1, HH, Z0)]); wl.quad([(cx0, 3.4, Z0), (cx1, 3.4, Z0), (cx1, HH, Z0), (cx0, HH, Z0)])
    wl.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, HH, Z0), (X0, HH, Z1)]); wl.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, HH, Z1), (X1, HH, Z0)])
    wl.finish(root)
    # 出關門：深灰門框＋毛玻璃自動門（兩扇）＋門旁毛玻璃牆＋上方「入境」「出口」指標
    pn.box(cx0, cx1, 3.0, 3.4, Z0, Z0 + 0.3); pn.box(cx0, cx0 + 0.4, 0.0, 3.4, Z0, Z0 + 0.3); pn.box(cx1 - 0.4, cx1, 0.0, 3.4, Z0, Z0 + 0.3)
    for (a, b) in ((cx0 + 0.4, cd['x'] - 0.02), (cd['x'] + 0.02, cx1 - 0.4)):
        fr.quad([(a, 0.02, Z0 + 0.15), (b, 0.02, Z0 + 0.15), (b, 3.0, Z0 + 0.15), (a, 3.0, Z0 + 0.15)])
    for xx in (cd['x'],): mu.box(xx - 0.03, xx + 0.03, 0.0, 3.0, Z0 + 0.12, Z0 + 0.18)
    sign_board(sg, pn, cd['x'], 3.9, Z0 + 0.2, 5.0, 0.3125, 'S', row_uv(SIGN['arr'], 8, 0.0, 1.0), depth=0.12)
    for f_ in J['fids']:
        x, y = f_['x'], f_['y']
        pn.box(x - f_['w'] / 2 - 0.1, x + f_['w'] / 2 + 0.1, y - f_['h'] / 2 - 0.1, y + f_['h'] / 2 + 0.1, Z0, Z0 + 0.2)
        uv_quad(fdA, [(x - f_['w'] / 2, y - f_['h'] / 2, Z0 + 0.205), (x + f_['w'] / 2, y - f_['h'] / 2, Z0 + 0.205), (x + f_['w'] / 2, y + f_['h'] / 2, Z0 + 0.205), (x - f_['w'] / 2, y + f_['h'] / 2, Z0 + 0.205)], [(0, 0), (1, 0), (1, 1), (0, 1)])
    # 接機欄杆：不鏽鋼立柱＋扶手＋玻璃欄板（走道兩側）、到 z1 往兩側打開
    rl = J['rail']
    def rail(p0, p1):
        (xa, za), (xb, zb) = p0, p1; n = max(1, int(math.hypot(xb - xa, zb - za) / 1.5))
        for k in range(n + 1):
            x = xa + (xb - xa) * k / n; z = za + (zb - za) * k / n; st.cyl((x, 0.0, z), (x, 1.05, z), 0.035, seg=8)
        st.cyl((xa, 1.05, za), (xb, 1.05, zb), 0.03, seg=8)
        gl.quad([(xa, 0.12, za), (xb, 0.12, zb), (xb, 0.98, zb), (xa, 0.98, za)])
    for s in (-1, 1):
        x = rl['x1'] if s > 0 else rl['x0']
        rail((x, rl['z0'] + 0.4), (x, rl['z1'])); rail((x, rl['z1']), (x + s * rl['flare'], rl['z1']))
    wall_cladding('x', Z0, X0, X1, skip=((cx0 - 0.2, cx1 + 0.2),), inward=1)
    wall_cladding('z', X0, Z0, Z1, skip=[(c['z0'] - 1.5, c['z1']) for c in J['counters'] if c['x0'] < 0], inward=1)
    wall_cladding('z', X1, Z0, Z1, skip=[(c['z0'] - 1.5, c['z1']) for c in J['counters'] if c['x0'] > 0] + [(J['cafe']['z0'] - 0.3, Z1)], inward=-1)
    for k, x in enumerate((-21.0, -15.0, 15.0, 21.0)): ad_box(x, Z0 + 0.12, 'S', k, y=2.6, w=1.3, h=2.6)
    for (bx, bz, yw) in ((-9.2, -11.4, 0.0), (9.2, -11.4, 0.0), (-6.0, 11.4, 0.0), (6.0, 11.4, 0.0)): recycle_bin(bx, bz, yw)
    # 等候椅、櫃台、咖啡店、南牆玻璃出口
    for b in J['benches']: bench(b['x'], b['z'], b['yaw'], b['n'])
    for c in J['counters']:
        wt.rbox(c['x0'], c['x1'], 0.0, 1.05, c['z0'], c['z1'], r=0.02, seg=1); tp.box(c['x0'] - 0.03, c['x1'] + 0.03, 1.05, 1.09, c['z0'] - 0.03, c['z1'] + 0.03)
        pn.box(c['x0'], c['x1'], 0.0, 3.4, c['z0'] - 1.45, c['z0'] - 1.35)
        sign_board(sh_, pn, (c['x0'] + c['x1']) / 2, 2.9, c['z0'] - 1.3, (c['x1'] - c['x0']) - 0.4, 0.5, 'S', row_uv(SHOP[c['id']], 6), depth=0.08)
        if c['id'] == 'fx': uv_quad(fdA, [(c['x0'] + 0.5, 1.5, c['z0'] - 1.34), (c['x1'] - 0.5, 1.5, c['z0'] - 1.34), (c['x1'] - 0.5, 2.5, c['z0'] - 1.34), (c['x0'] + 0.5, 2.5, c['z0'] - 1.34)], [(0.6, 0.1), (0.95, 0.1), (0.95, 0.6), (0.6, 0.6)])
    cf = J['cafe']
    wd = Mesh('ap_cafe_wood', M['wood']); wd.rbox(cf['x0'], cf['x1'], 0.0, 1.05, cf['z0'], cf['z0'] + 0.8, r=0.02, seg=1); tp.box(cf['x0'] - 0.03, cf['x1'] + 0.03, 1.05, 1.09, cf['z0'] - 0.03, cf['z0'] + 0.83)
    pn.box(cf['x0'], cf['x1'], 3.6, 4.4, cf['z0'] - 0.2, cf['z0'])
    sign_board(sh_, pn, (cf['x0'] + cf['x1']) / 2, 4.0, cf['z0'] - 0.25, (cf['x1'] - cf['x0']) - 1.0, 0.6, 'N', row_uv(SHOP['cafe'], 6), depth=0.06)
    for k in range(3):
        x = cf['x0'] + 2.5 + k * 2.4; z = cf['z0'] + 3.4
        wd.rbox(x - 0.4, x + 0.4, 0.72, 0.75, z - 0.4, z + 0.4, r=0.01, seg=1); st.cyl((x, 0.0, z), (x, 0.72, z), 0.04, seg=8)
        for (dx, dz) in ((-0.6, 0), (0.6, 0)):
            f0 = set(pv.bm.faces); pv.crbox(x + dx - 0.2, x + dx + 0.2, 0.44, 0.48, z + dz - 0.2, z + dz + 0.2, '#3a3c3e', r=0.02, seg=1); pv.crbox(x + dx - 0.2, x + dx + 0.2, 0.48, 0.85, z + dz + (0.18 if dx < 0 else -0.22), z + dz + (0.22 if dx < 0 else -0.18), '#3a3c3e', r=0.02, seg=1)
            for (ex, ez) in ((-0.17, -0.17), (0.17, -0.17), (-0.17, 0.17), (0.17, 0.17)): st.cyl((x + dx + ex, 0.0, z + dz + ez), (x + dx + ex, 0.44, z + dz + ez), 0.012, seg=5)
    wd.finish(root)
    ex_ = sorted([(e['x'] - e['w'] / 2, e['x'] + e['w'] / 2) for e in J['exits']])
    xs = [X0 + k * 2.0 for k in range(int((X1 - X0) / 2.0) + 1)]
    for xa, xb in zip(xs, xs[1:]):
        door = any(not (xb <= a or xa >= b) for (a, b) in ex_)
        gl.quad([(xb, 3.0 if door else 0.0, Z1), (xa, 3.0 if door else 0.0, Z1), (xa, HH, Z1), (xb, HH, Z1)])
        mu.box(xa - 0.04, xa + 0.04, 0.0, HH, Z1 - 0.04, Z1 + 0.06)
    for y in (3.0, HH - 0.05): mu.box(X0, X1, y - 0.04, y + 0.04, Z1 - 0.04, Z1 + 0.06)
    for (a, b) in ex_:
        for (p0, p1) in ((a, (a + b) / 2 - 0.02), ((a + b) / 2 + 0.02, b)):
            gl.quad([(p1, 0.02, Z1 - 0.1), (p0, 0.02, Z1 - 0.1), (p0, 2.6, Z1 - 0.1), (p1, 2.6, Z1 - 0.1)])
            for xx in (p0, p1): mu.box(xx - 0.03, xx + 0.03, 0.02, 2.62, Z1 - 0.13, Z1 - 0.07)
        mu.box(a - 0.1, b + 0.1, 2.62, 3.0, Z1 - 0.2, Z1 + 0.06)
        sign_board(sg, pn, (a + b) / 2, 3.5, Z1 - 0.4, 3.0, 0.1875 * 2, 'N', row_uv(SIGN['exit'], 8, 0.0, 0.55), depth=0.1)
    ov = Mesh('GLOW_ap_outside', img_mat('GLOW_ap_outside_m', 'ap_outside.png', rough=0.9, emit=1.0))
    uv_quad(ov, [(-70, -2.0, Z1 + 30), (70, -2.0, Z1 + 30), (70, 26, Z1 + 30), (-70, 26, Z1 + 30)][::-1], [(1, 0), (0, 0), (0, 1), (1, 1)][::-1]); ov.finish(root, uv=False)
    outside_night(-70, 70, -2.0, 26.0, Z1 + 30)
    og = Mesh('ap_outside_walk', M['conc'], tile=2.0); og.box(-70, 70, -0.06, -0.02, Z1, Z1 + 30); og.finish(root)
    for (px, pz) in ((-8.0, 10.6), (8.0, 10.6), (-26.6, -10.6), (26.6, -10.6)): potted_plant(px, pz)
    for (cx, cz) in ((-18.0, -6.0), (18.0, -6.0), (-18.0, 6.0), (18.0, 6.0)): co.cyl((cx, 0.0, cz), (cx, HH, cz), 0.4, seg=18)
    trolley_row(-4.5, 10.6, 8)

for m_ in (pv, st, mu, gl, wt, pn, tp, rb, se, sg, sh_, al, dl, co, bl, fr, fdD, fdA, PROD, ADS):
    if not m_.empty(): m_.finish(root, uv=(m_ in (tp,)), merge=not (m_ in (sg, sh_, al, fdD, fdA, PROD, ADS)))
if LEAF is not None and not LEAF.empty(): LEAF.finish(root, uv=False, merge=False)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_') or ob.name.startswith('DOOR_'))
# PERF-SINGLESIDE-GLB-1025 第六份（LAWWW2-C 2026-10-27）：材質改單面（lib2.single_side）——上限（同一頁全部改單面）出境大廳 +53～61%（test_shots/singleside_glb_1025/README.md）。
# 玻璃、霧面玻璃（半透明）照舊雙面；窗外的景（GLOW_ap_outside*，一片）和盆栽葉子是開口零件，補反面。
_ss = L.single_side(root, keep=r'glass|frosted', skip=lambda ob: 'FACE' in ob.name)
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='airport_t2.layout.json', area=AREA))
print('airport', AREA, 'tris', tris)
