"""美國交換：校外學生公寓社區的戶外（SCN-US-01「社區外觀」；區域 us_outside）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2：
  python3 tools/blender/env_second/us_community_layout_gen.py
  /opt/blenv/bin/python tools/blender/env_second/us_community.py [-- --out assets/models/env/second_ai/us_community.glb] [--preview <out.glb>]
  （--preview：另外輸出一份把 us_cars.glb 的車照配置停進停車場、每台上色的版本，只給驗收渲染用；遊戲的車由遊戲照 layout 的 cars 放、上色）

照使用者 2026-10-16 的社區外觀照片（research/us_apartment_photos.md 照片二）；配置 assets/models/env/second_ai/us_community.layout.json。
建築（A、B、C 三棟同一套做法，長度、山牆數、方向不同；真實的社區就是同一款建築一棟接一棟）：
  三層樓（每層 2.9 m）、灰褐色橫向壁板（us_apartment 的 us_siding.png，和公寓的樓梯平台同一張）、一樓轉角與樓梯間兩側紅磚（Poly Haven red_brick_03）、
  每戶兩扇白框窗（裡面白色百葉 us_blinds.png）＋內凹陽台（咖啡色木欄杆、落地玻璃門）；開放式樓梯間（看得到水泥樓梯、白鐵欄杆、白柱子、上面有屋頂、門口兩戶的白色六格門）；
  主屋頂＋每一戶朝前的山牆（深色瓦）、山牆上白色圓形通風口、白色封簷板、簷溝、落水管；牆上電錶、冷氣室外機。
地面：柏油停車場（Poly Haven asphalt_02，中性灰）、白色車位線、水泥路緣與人行道（concrete_wall_006）、草地（grass_ground）、灌木帶、樹穴的小樹、南邊的樹林。
小東西：集中信箱、垃圾子母車＋木圍籬、腳踏車架、美式路燈（深古銅色桿＋鞋盒燈頭）、長椅。
不放社區名、門牌號碼、車牌（D77）。座標＝配置的區域座標（x 東、z 南、y 上）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_community.glb')); PREVIEW = arg('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_community.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
FH, NF = J['floorH'], J['floors']; EAVE = FH * NF + 0.2
rng = random.Random(20261017)
B.reset(texres=512)
root = B.group('us_community', props={'kind': 'us_community', 'layout': 'us_community.layout.json'})


def img_mat(name, fn, rough=0.6, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if alpha:
        nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m['tile'] = 1.0
    return m


def siding_mat(tint):
    """壁板：us_siding.png 的平均色換成這棟的顏色（照片：橄欖灰褐、有幾棟淺米色）；烤成另一張圖，不用節點相乘（GLB 帶不過去）"""
    fn = 'us_siding_' + tint[1:] + '.png'; fp = os.path.join(GEN, fn)
    if not os.path.exists(fp):
        from PIL import Image
        im = Image.open(os.path.join(GEN, 'us_siding.png')).convert('RGB'); avg = (137, 126, 113)
        t = tuple(int(tint[i:i + 2], 16) for i in (1, 3, 5))
        im = Image.merge('RGB', [ch.point(lambda v, k=t[i] / avg[i]: min(255, int(v * k))) for i, ch in enumerate(im.split())]); im.save(fp)
    m = img_mat('usc_siding_' + tint[1:], fn, rough=0.7)
    # 法線貼圖：每片板子下緣比上緣凸（面稍微朝下）、下緣一條朝下的唇（陽光下一條一條的陰影；照片）；和 us_siding.png 同一個週期（一公尺六片）
    fpn = os.path.join(GEN, 'us_siding_nor.png')
    if not os.path.exists(fpn):
        from PIL import Image
        W = 512; bh = W // 6; im = Image.new('RGB', (W, W))
        for y in range(W):
            t = (y % bh) / bh
            ny = -0.72 if t > 1 - 4 / bh else -0.11
            nz = math.sqrt(1 - ny * ny)
            for x in range(W): im.putpixel((x, y), (128, int(128 + 127 * ny), int(128 + 127 * nz)))
        im.save(fpn)
    nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(fpn, check_existing=True); tx.image.colorspace_settings.name = 'Non-Color'
    nm = N.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 1.0
    nt.links.new(tx.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    return m


M = {
     'brick': L.pbr('usc_brick', 'red_brick_03', tile=1.2, target='#8a4a3a', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),
     'roof': L.pbr('usc_roof', 'grey_roof_tiles', tile=1.4, target='#353433', sat=0.15, normal=0.6, maps=('diff', 'nor'), rough_value=0.85),
     'trim': L.flat('usc_trim', '#f1efe9', rough=0.45),
     'rail': L.flat('usc_rail_wood', '#6a4630', rough=0.6),
     'railw': L.flat('usc_rail_white', '#eeeeea', rough=0.4, metal=0.2),
     'glass': L.flat('ck_glass', '#3b4752', rough=0.06, metal=0.35),
     'glassw': L.flat('usc_win_glass', '#2e3842', rough=0.05, metal=0.3, alpha=0.38),   # 窗：看得到裡面的白色百葉（照片）
     'blinds': img_mat('usc_blinds', 'us_blinds.png', rough=0.6),
     'conc': L.pbr('usc_concrete', 'concrete_wall_006', tile=2.0, target='#bdb8ae', normal=0.3, maps=('diff', 'nor'), rough_value=0.85, cull=True),   # 地面、路緣、地基、台階都是封閉的盒子：單面
     'asph': L.pbr('usc_asphalt', 'asphalt_02', tile=3.0, target='#6f6e6b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9, cull=True),
     'grass': L.pbr('usc_grass', 'grass_ground', tile=3.0, target='#5d6a44', normal=0.4, maps=('diff', 'nor'), rough_value=0.95, cull=True),
     'paint': L.flat('usc_line_paint', '#ecebe6', rough=0.6, cull=True),
     'door': L.flat('usc_door', '#f2f0ea', rough=0.35),
     'red': L.flat('usc_unit_plate', '#9b2a24', rough=0.5),
     'dark': L.flat('usc_dark', '#2a2b2d', rough=0.5),
     'bronze': L.flat('usc_bronze', '#3b3530', rough=0.45, metal=0.4),
     'lamp': L.flat('GLOW_usc_lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffe8c0')),
     'vc': L.vc_material('usc_vc', rough=0.6)}
try:
    import plants as PL
    PM = PL.materials('usc_')
except Exception as ex:
    PL = None; print('plants', ex)

# ================= 季節（ART-US-SEASON，us_season.py）=================
# 8/2 到、12/23 回來：夏末 → 秋天紅葉 → 初冬落光 → 12 月初下雪。同一個 GLB：遊戲照日期換材質（SEASON_MATS）、開關季節網格（SEASON_GEO_*）
import us_season as SEA   # noqa: E402
CAR = SEA.carrier(root)
# 樹的葉片卡分三組（每棵樹一組）：夏天都是深綠的闊葉；秋天各自轉紅、轉橙、轉黃（社區的樹不會同一天、同一個顏色）；初冬和雪天換成落光的細枝
LEAF_T = []
for k_, png in zip('abc', ('us_leaves_red.png', 'us_leaves_orange.png', 'us_leaves_yellow.png')):
    m_ = SEA.leaf_mat(f'usc_leaf_tree_{k_}', 'us_leaves_summer.png'); LEAF_T.append(m_)
    SEA.swap(CAR, m_, 'autumn', SEA.leaf_mat('t', png))
    SEA.swap(CAR, m_, 'bare', SEA.leaf_mat('t', 'us_twigs.png'))
    SEA.swap(CAR, m_, 'snow', SEA.leaf_mat('t', 'us_twigs_snow.png'))
TWIG_IN = SEA.leaf_mat('usc_twig_inner', 'us_twigs.png'); SEA.swap(CAR, TWIG_IN, 'snow', SEA.leaf_mat('t', 'us_twigs_snow.png'))   # 落光以後樹冠裡面的細枝（只有初冬、雪天）
LITTER = SEA.leaf_mat('usc_leaf_litter', 'us_leaf_litter.png', rough=0.85)                                                         # 樹下的落葉（秋天、初冬）
SEA.swap(CAR, M['grass'], 'autumn', L.pbr('t', 'grass_ground', tile=3.0, target='#646b43', normal=0.4, maps=('diff', 'nor'), rough_value=0.95, cull=True))   # 秋天：草稍微轉黃
SEA.swap(CAR, M['grass'], 'bare', L.pbr('t', 'withered_grass', tile=3.0, target='#857a58', normal=0.4, maps=('diff', 'nor'), rough_value=0.95, cull=True))  # 初冬：枯黃的草
SEA.swap(CAR, M['grass'], 'snow', L.pbr('t', 'snow_02', tile=3.0, target='#e6eaee', normal=0.5, maps=('diff', 'nor'), rough_value=0.75, cull=True))       # 雪
SEA.swap(CAR, M['roof'], 'snow', L.pbr('t', 'snow_02', tile=1.4, target='#e2e6ea', normal=0.4, maps=('diff', 'nor'), rough_value=0.8))          # 屋頂積雪
SEA.swap(CAR, M['asph'], 'snow', L.pbr('t', 'asphalt_02', tile=3.0, target='#56565a', normal=0.4, maps=('diff', 'nor'), rough_value=0.55, cull=True))      # 雪天：剷過雪、濕的柏油（深一點、比較亮）


def facade_rects(w, h, holes):
    """立面 0～w × 0～h 扣掉洞（[(x0,x1,y0,y1)]）剩下的長方形：照洞的 x 邊界切成直條，每條再扣掉洞的 y 範圍"""
    xs = sorted(set([0.0, w] + [v for (a, b, _, _) in holes for v in (a, b)]))
    out = []
    for xa, xb in zip(xs, xs[1:]):
        if xb - xa < 1e-4: continue
        xm = (xa + xb) / 2; cuts = sorted([(y0, y1) for (a, b, y0, y1) in holes if a <= xm <= b])
        cur = 0.0
        for (y0, y1) in cuts:
            if y0 > cur: out.append((xa, xb, cur, y0))
            cur = max(cur, y1)
        if cur < h: out.append((xa, xb, cur, h))
    return out


def building(b):
    """一棟（區域座標的局部：u 沿正面、v 往正面外、原點＝建築中心）→ 群組（位置、yaw 放在群組上）"""
    g = B.group('BLDG_' + b['id'], root, {'kind': 'us_building', 'id': b['id']})
    g.location = (b['cx'], -b['cz'], 0.0); g.rotation_euler = (0.0, 0.0, b['yaw'])
    Lb, Db = b['len'], b['dep']; u0, u1, vF, vB = -Lb / 2, Lb / 2, Db / 2, -Db / 2
    M['siding'] = siding_mat(b.get('tint', '#8a8670'))
    mk = {k: Mesh(f"b{b['id']}_{k}", M[k]) for k in ('siding', 'brick', 'roof', 'trim', 'rail', 'railw', 'glass', 'glassw', 'blinds', 'conc', 'door', 'red', 'dark', 'lamp')}
    vc = CMesh(f"b{b['id']}_vc", M['vc'])
    # 一戶一個開間：正面扣掉樓梯間（兩側各留 0.6 m 紅磚柱），剩下的牆段各切成寬 6～8 m 的開間；相鄰兩戶左右鏡射（陽台＋一扇窗）
    bw = 4.4; bz = [(c - bw / 2, c + bw / 2) for c in b['breezeway']]
    edges = sorted([u0 + 0.5] + [v for (x0, x1) in bz for v in (x0 - 0.7, x1 + 0.7)] + [u1 - 0.5])
    bays = []
    for sa, sb in zip(edges[0::2], edges[1::2]):
        if sb - sa < 4.4: continue
        n = max(1, int(round((sb - sa) / 7.0)))
        bays += [(sa + k * (sb - sa) / n, sa + (k + 1) * (sb - sa) / n) for k in range(n)]
    holes_front = []
    for (a, c) in bz: holes_front.append((a - u0, c - u0, 0.0, EAVE - 0.05))
    BAL_W, BAL_H, BAL_D = 2.6, 2.45, 1.6
    win_list = []; bal_list = []
    for i, (a, c) in enumerate(bays):
        mid = (a + c) / 2; mir = (i % 2 == 1)
        bx0, bx1 = (mid - 1.9, mid + 0.7) if not mir else (mid - 0.7, mid + 1.9)
        wx0, wx1 = (mid + 1.0, mid + 2.0) if not mir else (mid - 2.0, mid - 1.0)
        for f in range(NF):
            y0 = f * FH
            bal_list.append((bx0, bx1, y0 + 0.15, y0 + 0.15 + BAL_H))
            win_list.append((wx0, wx1, y0 + 0.95, y0 + 2.35))
    for (x0, x1, y0, y1) in bal_list + win_list: holes_front.append((x0 - u0, x1 - u0, y0, y1))
    # ---- 牆：正面（有洞）、背面（窗）、兩端 ----
    def wall_quads(rects, plane):
        for (xa, xb, ya, yb) in rects:
            if plane == 'F': mk['siding'].quad([(u0 + xa, ya, vF), (u0 + xb, ya, vF), (u0 + xb, yb, vF), (u0 + xa, yb, vF)])
            elif plane == 'B': mk['siding'].quad([(u1 - xa, ya, vB), (u1 - xb, ya, vB), (u1 - xb, yb, vB), (u1 - xa, yb, vB)])
            elif plane == 'L': mk['siding'].quad([(u0, ya, vB + xa), (u0, ya, vB + xb), (u0, yb, vB + xb), (u0, yb, vB + xa)])
            else: mk['siding'].quad([(u1, ya, vF - xa), (u1, ya, vF - xb), (u1, yb, vF - xb), (u1, yb, vF - xa)])
    wall_quads(facade_rects(Lb, EAVE, holes_front), 'F')
    back_w = [(x0 - u0, x1 - u0, y0, y1) for (x0, x1, y0, y1) in win_list] + [((x0 + x1) / 2 - 0.5 - u0, (x0 + x1) / 2 + 0.5 - u0, y0 + 0.8, y0 + 2.2) for (x0, x1, y0, y1) in bal_list]
    back_rects = facade_rects(Lb, EAVE, [(Lb - b_, Lb - a_, y0, y1) for (a_, b_, y0, y1) in back_w])
    wall_quads(back_rects, 'B')
    for side in ('L', 'R'):
        holes = [((Db / 2 - 2.6), (Db / 2 - 1.6), f * FH + 0.95, f * FH + 2.35) for f in range(NF)] + [((Db / 2 + 1.6), (Db / 2 + 2.6), f * FH + 0.95, f * FH + 2.35) for f in range(NF)]
        wall_quads(facade_rects(Db, EAVE, holes), side)
    # 背面的窗（同正面的窗做法）
    def window(p0, p1, y0, y1, n, depth=0.12):
        """窗：p0→p1 是牆面上的兩個點（局部 (u, v)）、n＝牆的外法線 (nu, nv)；白色窗框＋窗台、往內 depth 的玻璃、玻璃後面的百葉"""
        (ua, va), (ub, vb) = p0, p1; nu, nv = n
        def P(t, y, d): return (ua + (ub - ua) * t - nu * d, y, va + (vb - va) * t - nv * d)
        mk['glassw'].quad([P(0, y0, depth), P(1, y0, depth), P(1, y1, depth), P(0, y1, depth)][::(1 if (nv > 0 or nu < 0) else -1)])
        mk['blinds'].quad([P(0.02, y0 + 0.05, depth + 0.05), P(0.98, y0 + 0.05, depth + 0.05), P(0.98, y1 - 0.02, depth + 0.05), P(0.02, y1 - 0.02, depth + 0.05)][::(1 if (nv > 0 or nu < 0) else -1)])
        for (t0, t1, ya, yb) in ((-0.06, 0.0, y0 - 0.06, y1 + 0.06), (1.0, 1.06, y0 - 0.06, y1 + 0.06)):   # 左右框
            pass
        wl = math.hypot(ub - ua, vb - va); e = 0.09 / max(wl, 1e-3)
        for (t0, t1, ya, yb) in ((-e, 0.0, y0, y1), (1.0, 1.0 + e, y0, y1), (-e, 1.0 + e, y1, y1 + 0.1), (-e * 1.4, 1.0 + e * 1.4, y0 - 0.08, y0)):   # 四片不重疊（重疊會在角落出黑點）
            q0, q1 = P(t0, ya, -0.035), P(t1, ya, -0.035); q2, q3 = P(t1, yb, -0.035), P(t0, yb, -0.035)
            lo, hi = P(t0, ya, depth), P(t1, ya, depth)
            xs = [q0[0], q1[0], lo[0], hi[0]]; zs = [q0[2], q1[2], lo[2], hi[2]]
            mk['trim'].box(min(xs), max(xs), ya, yb, min(zs), max(zs))
    for (x0, x1, y0, y1) in win_list:
        window((x0, vF), (x1, vF), y0, y1, (0, 1))
        window((-x0, vB), (-x1, vB), y0, y1, (0, -1))   # 背面（鏡射位置）
    for (x0, x1, y0, y1) in bal_list:
        xm = (x0 + x1) / 2; window((-(xm - 0.5), vB), (-(xm + 0.5), vB), y0 + 0.8, y0 + 2.2, (0, -1))
    for side, uu, nu in (('L', u0, -1), ('R', u1, 1)):
        for f in range(NF):
            for (va_, vb_) in ((Db / 2 - 2.6, Db / 2 - 1.6), (Db / 2 + 1.6, Db / 2 + 2.6)):
                v0_, v1_ = (vB + va_, vB + vb_) if side == 'L' else (vF - va_, vF - vb_)
                window((uu, v0_), (uu, v1_), f * FH + 0.95, f * FH + 2.35, (nu, 0))
    # ---- 陽台（內凹）：地板、天花板、兩側牆、後牆（落地玻璃門）、咖啡色木欄杆 ----
    for (x0, x1, y0, y1) in bal_list:
        vb_ = vF - BAL_D
        mk['conc'].box(x0, x1, y0 - 0.15, y0, vb_, vF + 0.02)
        mk['siding'].quad([(x0, y0, vb_), (x0, y0, vF), (x0, y1, vF), (x0, y1, vb_)]); mk['siding'].quad([(x1, y0, vF), (x1, y0, vb_), (x1, y1, vb_), (x1, y1, vF)])
        mk['siding'].quad([(x0, y1, vb_), (x1, y1, vb_), (x1, y1, vF), (x0, y1, vF)][::-1])
        mk['siding'].quad([(x0, y0, vb_), (x1, y0, vb_), (x1, y1, vb_), (x0, y1, vb_)])
        dx0, dx1 = x0 + 0.5, x0 + 1.9
        mk['glass'].quad([(dx0, y0 + 0.02, vb_ + 0.02), (dx1, y0 + 0.02, vb_ + 0.02), (dx1, y0 + 2.1, vb_ + 0.02), (dx0, y0 + 2.1, vb_ + 0.02)])
        for xx in (dx0, (dx0 + dx1) / 2, dx1): mk['trim'].box(xx - 0.035, xx + 0.035, y0, y0 + 2.14, vb_, vb_ + 0.06)
        mk['trim'].box(dx0, dx1, y0 + 2.1, y0 + 2.16, vb_, vb_ + 0.06)
        rail_y = y0 + 1.05; rz = vF - 0.06
        mk['rail'].rbox(x0 + 0.02, x1 - 0.02, rail_y - 0.05, rail_y + 0.02, rz - 0.07, rz + 0.07, r=0.01, seg=1)
        mk['rail'].box(x0 + 0.02, x1 - 0.02, y0 + 0.08, y0 + 0.14, rz - 0.04, rz + 0.04)
        n = int((x1 - x0) / 0.13)
        for k in range(1, n):
            xx = x0 + k * (x1 - x0) / n; mk['rail'].box(xx - 0.02, xx + 0.02, y0 + 0.14, rail_y - 0.05, rz - 0.02, rz + 0.02)
        for xx in (x0 + 0.06, x1 - 0.06): mk['rail'].box(xx - 0.05, xx + 0.05, y0, rail_y + 0.02, rz - 0.05, rz + 0.05)
        # 生活痕跡：一部分的陽台有椅子、盆栽、腳踏車
        r_ = rng.random()
        if r_ < 0.35:
            vc.crbox(x0 + 0.3, x0 + 0.75, y0, y0 + 0.45, vb_ + 0.3, vb_ + 0.75, rng.choice(['#2b2d30', '#6a4630', '#d9d4c7']), r=0.03, seg=1)
        elif r_ < 0.6:
            vc.crbox(x1 - 0.55, x1 - 0.25, y0, y0 + 0.32, vb_ + 0.3, vb_ + 0.6, '#9a6a4a', r=0.03, seg=1)
            f0 = set(vc.bm.faces); vc.ell((x1 - 0.4, y0 + 0.55, vb_ + 0.45), 0.24, 0.28, 0.24, seg=10, rings=6); vc.paint([f for f in vc.bm.faces if f not in f0], '#4f6f3e')
    # ---- 開放式樓梯間：凹進去 6 m；中間一跑直上二樓（18 階，級高 0.161、級深 0.25，水泥踏板＋深色鋼梯梁＋白鐵扶手）；
    #      二樓後段是平台（兩戶的門在後牆）、一樓兩戶的門在兩側牆的後段（照片：入口兩側紅磚柱、上面是山牆）----
    BD = 6.0
    for (x0, x1) in bz:
        vb_ = vF - BD; xm = (x0 + x1) / 2
        for xx in (x0, x1): mk['siding'].quad(([(xx, 0, vb_), (xx, 0, vF), (xx, EAVE, vF), (xx, EAVE, vb_)] if xx == x0 else [(xx, 0, vF), (xx, 0, vb_), (xx, EAVE, vb_), (xx, EAVE, vF)]))
        mk['siding'].quad([(x0, 0, vb_), (x1, 0, vb_), (x1, EAVE, vb_), (x0, EAVE, vb_)])
        mk['conc'].box(x0, x1, -0.05, 0.02, vb_, vF + 1.2)
        mk['siding'].quad([(x0, EAVE - 0.05, vb_), (x1, EAVE - 0.05, vb_), (x1, EAVE - 0.05, vF), (x0, EAVE - 0.05, vF)][::-1])
        nst, tread = int(round(FH / 0.161)), 0.25; rise = FH / nst; vs0 = vF - 0.2; vtop = vs0 - nst * tread; sw0, sw1 = xm - 0.7, xm + 0.7
        for f in range(1, NF):
            y = f * FH
            mk['conc'].box(x0, x1, y - 0.22, y, vb_, vtop)                                       # 二樓平台
            for (dd0, dd1) in ((x0 + 0.35, x0 + 1.25), (x1 - 1.25, x1 - 0.35)):                  # 後牆兩戶的門
                mk['door'].rbox(dd0, dd1, y, y + 2.03, vb_, vb_ + 0.04, r=0.008, seg=1)
                mk['trim'].box(dd0 - 0.08, dd1 + 0.08, y + 2.03, y + 2.12, vb_, vb_ + 0.05)
                mk['red'].box((dd0 + dd1) / 2 - 0.09, (dd0 + dd1) / 2 + 0.09, y + 2.18, y + 2.3, vb_, vb_ + 0.02)   # 紅色門牌（空白，不放號碼）
                vc.cbox(dd1 - 0.12, dd1 - 0.06, y + 0.95, y + 1.0, vb_ + 0.04, vb_ + 0.07, '#c9cbcd')
                vc.cbox(dd0 - 0.05, dd1 + 0.05, y, y + 0.01, vb_ + 0.05, vb_ + 0.65, rng.choice(['#5a4a3a', '#3e4a52', '#6b5a4a']))   # 門口腳踏墊
            for (ra, rb_) in ((x0 + 0.05, sw0), (sw1, x1 - 0.05)):                                # 平台前緣的白鐵欄杆（樓梯口留空）
                mk['railw'].box(ra, rb_, y + 0.98, y + 1.03, vtop - 0.03, vtop + 0.03)
                n = max(2, int((rb_ - ra) / 0.12))
                for k in range(n + 1):
                    xx = ra + k * (rb_ - ra) / n; mk['railw'].box(xx - 0.012, xx + 0.012, y, y + 0.98, vtop - 0.012, vtop + 0.012)
        for f in range(NF):                                                                      # 一樓兩側牆後段的門（往兩側開）
            if f > 0: continue
            for xx, sgn in ((x0, 1), (x1, -1)):
                v0d, v1d = vb_ + 0.35, vb_ + 1.25
                mk['door'].rbox(min(xx, xx + sgn * 0.04), max(xx, xx + sgn * 0.04), 0.0, 2.03, v0d, v1d, r=0.008, seg=1)
                mk['trim'].box(min(xx, xx + sgn * 0.05), max(xx, xx + sgn * 0.05), 2.03, 2.12, v0d - 0.08, v1d + 0.08)
                mk['red'].box(min(xx, xx + sgn * 0.02), max(xx, xx + sgn * 0.02), 2.18, 2.3, (v0d + v1d) / 2 - 0.09, (v0d + v1d) / 2 + 0.09)
                vc.cbox(min(xx, xx + sgn * 0.6), max(xx, xx + sgn * 0.6), 0.02, 0.03, v0d - 0.05, v1d + 0.05, rng.choice(['#5a4a3a', '#3e4a52']))
        for f in range(NF - 1):                                                                  # 樓梯
            yb = f * FH
            for k in range(nst):
                vv = vs0 - k * tread; y1 = yb + (k + 1) * rise
                mk['conc'].rbox(sw0 + 0.06, sw1 - 0.06, y1 - 0.06, y1, vv - tread - 0.03, vv, r=0.01, seg=1)
            for xx in (sw0, sw1):                                                                # 鋼梯梁（斜的槽鋼）
                for d_ in (-0.03, 0.03):
                    q = [(xx + d_, yb - 0.25, vs0 + 0.05), (xx + d_, yb + 0.05, vs0 + 0.05), (xx + d_, yb + FH + 0.0, vtop), (xx + d_, yb + FH - 0.3, vtop)]
                    mk['dark'].quad(q if (d_ > 0) == (xx > xm) else q[::-1])
                mk['dark'].quad([(xx - 0.03, yb + 0.05, vs0 + 0.05), (xx + 0.03, yb + 0.05, vs0 + 0.05), (xx + 0.03, yb + FH, vtop), (xx - 0.03, yb + FH, vtop)][::-1])
                mk['railw'].cyl((xx, yb + 0.92, vs0 + 0.1), (xx, yb + FH + 0.92, vtop), 0.022, seg=8)   # 扶手
                n = int((vs0 - vtop) / 0.45)
                for k in range(n + 1):
                    vv = vs0 - k * (vs0 - vtop) / n; yy = yb + (vs0 - vv) / (vs0 - vtop) * FH
                    mk['railw'].box(xx - 0.012, xx + 0.012, yy, yy + 0.92, vv - 0.012, vv + 0.012)
        for xx in (x0 + 0.12, x1 - 0.12): mk['trim'].rbox(xx - 0.11, xx + 0.11, 0.0, EAVE - 0.05, vF - 0.11, vF + 0.11, r=0.015, seg=1)   # 白柱子
        for f in range(NF):
            for xx, sgn in ((x0, 1), (x1, -1)):
                mk['lamp'].box(min(xx, xx + sgn * 0.12), max(xx, xx + sgn * 0.12), f * FH + 2.25, f * FH + 2.45, vb_ + 2.3, vb_ + 2.45)
        # 入口：兩側紅磚柱上掛的紅色社區牌（空白、白邊；D77 不放名字號碼）＋走道兩側的白鐵欄杆
        mk['red'].box(x0 - 0.85, x0 - 0.15, 1.55, 2.25, vF + 0.04, vF + 0.07)
        for (ya, yb_, xa, xb) in ((1.6, 1.63, x0 - 0.8, x0 - 0.2), (2.17, 2.2, x0 - 0.8, x0 - 0.2)): mk['trim'].box(xa, xb, ya, yb_, vF + 0.07, vF + 0.08)
        for xx in (xm - 1.25, xm + 1.25):
            for vv in (vF + 0.25, vF + 1.15): mk['railw'].cyl((xx, 0.1, vv), (xx, 0.92, vv), 0.024, seg=8)
            mk['railw'].cyl((xx, 0.92, vF + 0.2), (xx, 0.92, vF + 1.2), 0.024, seg=8); mk['railw'].cyl((xx, 0.5, vF + 0.25), (xx, 0.5, vF + 1.15), 0.016, seg=6)
    # ---- 紅磚：一樓轉角、樓梯間兩側（比壁板凸 4 cm）----
    for (a_, c_) in [(u0 - 0.04, u0 + 1.4), (u1 - 1.4, u1 + 0.04)] + [(x0 - 1.0, x0) for (x0, x1) in bz] + [(x1, x1 + 1.0) for (x0, x1) in bz]:
        mk['brick'].box(a_, c_, 0.0, FH - 0.1, vF - 0.02, vF + 0.04)
    for uu in (u0, u1):
        mk['brick'].box(uu - 0.04 if uu < 0 else uu - 0.02, uu + 0.02 if uu < 0 else uu + 0.04, 0.0, FH - 0.1, vF - 1.4, vF + 0.04)
    mk['trim'].box(u0 - 0.05, u1 + 0.05, FH - 0.12, FH - 0.04, vF, vF + 0.06)                     # 一樓上緣的白色腰帶
    mk['conc'].box(u0 - 0.03, u1 + 0.03, -0.05, 0.25, vB - 0.03, vF + 0.03)                         # 基礎
    for uu in (u0, u1):                                                                             # 轉角白飾條
        for vv in (vF, vB): mk['trim'].box(uu - 0.07, uu + 0.07, 0.25, EAVE, vv - 0.07, vv + 0.07)
    # ---- 屋頂：主屋頂（脊沿 u）＋正面每一戶的山牆 ----
    PITCH = math.radians(28); ov = 0.5
    rv = Db / 2 + ov; ry = EAVE + rv * math.tan(PITCH)
    for s_ in (1, -1):
        mk['roof'].quad([(u0 - ov, EAVE, s_ * rv), (u1 + ov, EAVE, s_ * rv), (u1 + ov, ry, 0.0), (u0 - ov, ry, 0.0)][::(1 if s_ > 0 else -1)])
        mk['trim'].box(u0 - ov, u1 + ov, EAVE - 0.2, EAVE, s_ * rv - 0.04, s_ * rv + 0.04)            # 封簷板
        mk['trim'].cyl((u0 - ov, EAVE - 0.05, s_ * (rv + 0.08)), (u1 + ov, EAVE - 0.05, s_ * (rv + 0.08)), 0.06, seg=8)   # 簷溝
    for uu in (u0, u1):   # 兩端的山牆（三角形壁板）
        mk['siding'].bm.faces.new([mk['siding'].bm.verts.new(g2b(uu, EAVE, s_ * Db / 2)) for s_ in ((1, -1) if uu == u0 else (-1, 1))] + [mk['siding'].bm.verts.new(g2b(uu, EAVE + Db / 2 * math.tan(PITCH), 0.0))])
    # 朝前的山牆：每個樓梯間入口上面一個（照片）＋樓梯間之間、兩端剩下的牆段各放一到兩個（一戶一個）
    gab = [((x0 + x1) / 2, (x1 - x0) + 1.2) for (x0, x1) in bz] + [((a + c) / 2, min(c - a - 0.8, 6.2)) for (a, c) in bays]
    for (mid, wg) in gab:
        ay = EAVE + wg / 2 * math.tan(math.radians(38))
        vf = vF + 0.02
        mk['siding'].bm.faces.new([mk['siding'].bm.verts.new(g2b(*p)) for p in ((mid - wg / 2, EAVE, vf), (mid + wg / 2, EAVE, vf), (mid, ay, vf))])
        for s_ in (1, -1):
            e0 = (mid + s_ * (wg / 2 + 0.35), EAVE - 0.18, vf + 0.45); e1 = (mid, ay + 0.12, vf + 0.45)
            mk['roof'].quad([e0, (e0[0], e0[1], 0.0), (mid, ay + 0.12, 0.0), e1][::(1 if s_ > 0 else -1)])
            mk['trim'].cyl(e0, e1, 0.07, seg=6)                                                     # 山牆邊的封簷板
        f0 = set(mk['trim'].bm.faces); mk['trim'].cyl((mid, ay - 0.9, vf), (mid, ay - 0.9, vf + 0.06), 0.28, seg=20)   # 白色圓形通風口
        mk['dark'].cyl((mid, ay - 0.9, vf + 0.061), (mid, ay - 0.9, vf + 0.065), 0.21, seg=20)
    # 落水管（轉角）
    for uu in (u0 + 0.12, u1 - 0.12):
        mk['trim'].cyl((uu, 0.1, vF + 0.12), (uu, EAVE - 0.1, vF + 0.12), 0.045, seg=8)
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('siding', 'brick', 'roof', 'conc', 'blinds')))
    vc.finish(g, uv=False)
    return g


for b in J['buildings']: building(b)


def clubhouse(h):
    """會所（社區辦公室＋交誼廳；BB_215「走到會所門口」）：一層樓（簷高 eave）、淺米色壁板＋一圈紅磚腰牆、正面中間的玻璃門（雙開＋兩側側窗）、
    左右兩扇大窗（裡面亮著：暖色的室內＋沙發、桌子、盆栽的剪影）、門廊（兩根白方柱、小山牆、空白招牌——D77 不放名字）、門口兩盞壁燈、兩個花台。
    局部座標同 building()：u 沿正面、v 往正面外（yaw π＝朝北）"""
    g = B.group('BLDG_' + h['id'], root, {'kind': 'us_clubhouse', 'id': h['id']})
    g.location = (h['cx'], -h['cz'], 0.0); g.rotation_euler = (0.0, 0.0, h['yaw'])
    Lb, Db, EH = h['len'], h['dep'], h['eave']; u0, u1, vF, vB = -Lb / 2, Lb / 2, Db / 2, -Db / 2
    M['siding_h'] = siding_mat(h.get('tint', '#b8ad95'))
    M['club_in'] = L.flat('GLOW_usc_club_interior', '#f3dcb8', rough=0.8, emit=B.srgb('#ffd9a8'))   # 室內（亮著）：遊戲照 GLOW_.*interior 依時段調亮度
    mk = {k: Mesh('bH_' + k, M[k]) for k in ('siding_h', 'brick', 'roof', 'trim', 'glassw', 'conc', 'dark', 'lamp', 'club_in')}
    vc = CMesh('bH_vc', M['vc'])
    def dq(m, q): m.quad(q); m.quad(q[::-1])
    DOOR = (-1.5, 1.5, 0.0, 2.6); WINS_F = [(-5.4, -3.0, 0.75, 2.85), (3.0, 5.4, 0.75, 2.85)]
    WINS_B = [(-4.0, -2.4, 1.0, 2.5), (2.4, 4.0, 1.0, 2.5)]; WINS_S = [(-1.0, 1.0, 1.0, 2.5)]
    def wq(rects, plane):
        m = mk['siding_h']
        for (xa, xb, ya, yb) in rects:
            if plane == 'F': m.quad([(u0 + xa, ya, vF), (u0 + xb, ya, vF), (u0 + xb, yb, vF), (u0 + xa, yb, vF)])
            elif plane == 'B': m.quad([(u1 - xa, ya, vB), (u1 - xb, ya, vB), (u1 - xb, yb, vB), (u1 - xa, yb, vB)])
            elif plane == 'L': m.quad([(u0, ya, vB + xa), (u0, ya, vB + xb), (u0, yb, vB + xb), (u0, yb, vB + xa)])
            else: m.quad([(u1, ya, vF - xa), (u1, ya, vF - xb), (u1, yb, vF - xb), (u1, yb, vF - xa)])
    wq(facade_rects(Lb, EH, [(a - u0, b_ - u0, y0, y1) for (a, b_, y0, y1) in [DOOR] + WINS_F]), 'F')
    wq(facade_rects(Lb, EH, [(Lb / 2 - b_, Lb / 2 - a, y0, y1) for (a, b_, y0, y1) in WINS_B]), 'B')
    for sd in ('L', 'R'): wq(facade_rects(Db, EH, [(Db / 2 + a, Db / 2 + b_, y0, y1) for (a, b_, y0, y1) in WINS_S]), sd)
    # 紅磚腰牆（比壁板凸 4 cm，開口處不做）＋白色壓頂
    for (a, b_) in ((u0 - 0.04, DOOR[0]), (DOOR[1], u1 + 0.04)):
        segs = [(a, b_)]
        for (wa, wb, _, _) in WINS_F: segs = [p for (x0, x1) in segs for p in ([(x0, x1)] if wb <= x0 or wa >= x1 else [(x0, wa), (wb, x1)]) if p[1] - p[0] > 0.01]
        for (x0, x1) in segs: mk['brick'].box(x0, x1, 0.0, 1.0, vF - 0.02, vF + 0.04)
    for (wa, wb, _, _) in WINS_F: mk['brick'].box(wa, wb, 0.0, 0.7, vF - 0.02, vF + 0.04)
    mk['brick'].box(u0 - 0.04, u1 + 0.04, 0.0, 1.0, vB - 0.04, vB + 0.02)
    for uu in (u0, u1): mk['brick'].box(uu - 0.04, uu + 0.04, 0.0, 1.0, vB, vF)
    mk['trim'].box(u0 - 0.06, DOOR[0], 1.0, 1.06, vF, vF + 0.07); mk['trim'].box(DOOR[1], u1 + 0.06, 1.0, 1.06, vF, vF + 0.07)
    mk['conc'].box(u0 - 0.03, u1 + 0.03, -0.05, 0.12, vB - 0.03, vF + 0.03)
    for uu in (u0, u1):
        for vv in (vF, vB): mk['trim'].box(uu - 0.07, uu + 0.07, 0.12, EH, vv - 0.07, vv + 0.07)
    # 窗：白框＋玻璃，玻璃後面 1.2 m 是亮著的室內（暖色面）＋剪影
    def win(a, b_, y0, y1, plane):
        P = (lambda u, y, d: (u, y, vF - d)) if plane == 'F' else ((lambda u, y, d: (-u, y, vB + d)) if plane == 'B' else None)
        if plane in ('L', 'R'):
            uu = u0 if plane == 'L' else u1; sg = 1 if plane == 'L' else -1
            P = lambda u, y, d: (uu + sg * d, y, u if plane == 'R' else -u)
        q = [P(a, y0, 0.1), P(b_, y0, 0.1), P(b_, y1, 0.1), P(a, y1, 0.1)]; dq(mk['glassw'], q)   # 兩面（方向不用算）
        dq(mk['club_in'], [P(a - 0.4, y0 - 0.6, 1.2), P(b_ + 0.4, y0 - 0.6, 1.2), P(b_ + 0.4, y1 + 0.5, 1.2), P(a - 0.4, y1 + 0.5, 1.2)])
        for (pa, pb, ya, yb) in ((a - 0.09, a, y0, y1), (b_, b_ + 0.09, y0, y1), (a - 0.09, b_ + 0.09, y1, y1 + 0.1), (a - 0.12, b_ + 0.12, y0 - 0.08, y0)):
            c0, c1 = P(pa, ya, -0.035), P(pb, yb, 0.1)
            mk['trim'].box(min(c0[0], c1[0]), max(c0[0], c1[0]), ya, yb, min(c0[2], c1[2]), max(c0[2], c1[2]))
    for w in WINS_F: win(*w, 'F')
    for w in WINS_B: win(*w, 'B')
    for w in WINS_S: win(*w, 'L'); win(*w, 'R')
    # 室內的剪影（從正面的窗看得到）：沙發、矮桌、落地燈、大盆栽、交誼廳的長桌
    for (cxu, kind) in ((-4.6, 'sofa'), (-3.6, 'plant'), (4.4, 'table'), (3.4, 'lamp')):
        v_ = vF - 0.9
        if kind == 'sofa': vc.crbox(cxu - 0.9, cxu + 0.9, 0.0, 0.85, v_ - 0.45, v_ + 0.1, '#5a4a40', r=0.05, seg=1)
        elif kind == 'plant':
            vc.crbox(cxu - 0.18, cxu + 0.18, 0.0, 0.4, v_ - 0.18, v_ + 0.18, '#7a5a44', r=0.02, seg=1)
            f0 = set(vc.bm.faces); vc.ell((cxu, 1.05, v_), 0.4, 0.65, 0.4, seg=10, rings=6); vc.paint([f for f in vc.bm.faces if f not in f0], '#3e5a34')
        elif kind == 'table':
            vc.crbox(cxu - 1.0, cxu + 1.0, 0.72, 0.78, v_ - 0.45, v_ + 0.45, '#6a4a34', r=0.01, seg=1)
            for du in (-0.9, 0.9): vc.cbox(cxu + du - 0.04, cxu + du + 0.04, 0.0, 0.72, v_ - 0.04, v_ + 0.04, '#3a2a20')
        else: vc.cbox(cxu - 0.02, cxu + 0.02, 0.0, 1.5, v_ - 0.02, v_ + 0.02, '#2a2a2a'); mk['lamp'].box(cxu - 0.18, cxu + 0.18, 1.45, 1.75, v_ - 0.18, v_ + 0.18)
    # 入口：雙開玻璃門＋兩側側窗＋上面的氣窗（白框）、門把、腳踏墊
    a, b_, y0, y1 = DOOR
    dq(mk['glassw'], [(a, y0, vF - 0.08), (b_, y0, vF - 0.08), (b_, y1, vF - 0.08), (a, y1, vF - 0.08)])
    dq(mk['club_in'], [(a - 0.6, 0.0, vF - 1.6), (b_ + 0.6, 0.0, vF - 1.6), (b_ + 0.6, EH - 0.3, vF - 1.6), (a - 0.6, EH - 0.3, vF - 1.6)])
    for uu in (a, a + 0.55, 0.0, b_ - 0.55, b_): mk['trim'].box(uu - 0.05, uu + 0.05, y0, y1, vF - 0.1, vF + 0.03)
    for yy in (2.15, y1): mk['trim'].box(a - 0.05, b_ + 0.05, yy - 0.05, yy + 0.05, vF - 0.1, vF + 0.03)
    for uu in (-0.12, 0.12): mk['dark'].box(uu - 0.015, uu + 0.015, 0.9, 1.3, vF + 0.03, vF + 0.07)   # 直的門把
    vc.cbox(-1.0, 1.0, 0.12, 0.13, vF + 0.1, vF + 0.9, '#3e3a36')
    # 門廊：水泥地坪、兩根白方柱、橫樑、小山牆屋頂、山牆上空白招牌（深綠底白框）
    pw, pd = h['porch']['w'], h['porch']['d']; pv0, pv1 = vF, vF + pd
    mk['conc'].box(-pw / 2, pw / 2, -0.05, 0.12, pv0, pv1)
    for su in (-1, 1):
        uu = su * (pw / 2 - 0.3); mk['trim'].rbox(uu - 0.14, uu + 0.14, 0.12, 3.1, pv1 - 0.34, pv1 - 0.06, r=0.015, seg=1)
        mk['trim'].box(uu - 0.2, uu + 0.2, 0.12, 0.42, pv1 - 0.4, pv1)
    mk['trim'].box(-pw / 2, pw / 2, 3.1, 3.35, pv1 - 0.36, pv1 - 0.04)
    for su in (-1, 1): mk['trim'].box(su * pw / 2 - (0.12 if su > 0 else 0), su * pw / 2 + (0.0 if su > 0 else 0.12), 3.1, 3.35, pv0, pv1 - 0.04)
    pp = math.radians(32); ay = 3.35 + (pw / 2 + 0.3) * math.tan(pp)
    for su in (-1, 1):
        mk['roof'].quad([(su * (pw / 2 + 0.3), 3.3, pv1 + 0.3), (su * (pw / 2 + 0.3), 3.3, pv0 - 0.4), (0.0, ay, pv0 - 0.4), (0.0, ay, pv1 + 0.3)][::(1 if su < 0 else -1)])
        mk['trim'].cyl((su * (pw / 2 + 0.3), 3.28, pv1 + 0.32), (0.0, ay + 0.02, pv1 + 0.32), 0.06, seg=6)
    gf = mk['siding_h'].bm; tri = [(-pw / 2, 3.35, pv1 - 0.02), (pw / 2, 3.35, pv1 - 0.02), (0.0, 3.35 + pw / 2 * math.tan(pp), pv1 - 0.02)]
    for t_ in (tri, tri[::-1]): gf.faces.new([gf.verts.new(g2b(*p)) for p in t_])   # 門廊的山牆（兩面）
    dq(mk['siding_h'], [(-pw / 2, 3.35, pv1 - 0.02), (-pw / 2, 3.35, pv0), (pw / 2, 3.35, pv0), (pw / 2, 3.35, pv1 - 0.02)])   # 門廊天花板
    vc.crbox(-1.1, 1.1, 3.55, 4.05, pv1 + 0.0, pv1 + 0.04, '#24453a', r=0.01, seg=1)                                     # 空白招牌（D77）
    for (ya, yb_) in ((3.58, 3.61), (3.99, 4.02)): mk['trim'].box(-1.05, 1.05, ya, yb_, pv1 + 0.04, pv1 + 0.05)
    mk['lamp'].box(-0.15, 0.15, 3.2, 3.24, pv0 + 0.6, pv0 + 1.0)                                                         # 門廊頂燈
    for su in (-1, 1):                                                                                                    # 門口兩側壁燈（黑框燈籠）
        uu = su * 1.9; mk['dark'].box(uu - 0.11, uu + 0.11, 1.95, 2.4, vF + 0.04, vF + 0.22); mk['lamp'].box(uu - 0.08, uu + 0.08, 2.0, 2.35, vF + 0.06, vF + 0.2)
    for su in (-1, 1):                                                                                                    # 花台（磚）＋灌木
        uu = su * (pw / 2 + 0.9); mk['brick'].box(uu - 0.6, uu + 0.6, 0.0, 0.45, vF + 0.15, vF + 0.95)
        f0 = set(vc.bm.faces); vc.ell((uu, 0.75, vF + 0.55), 0.6, 0.38, 0.4, seg=10, rings=6); vc.paint([f for f in vc.bm.faces if f not in f0], '#2f4a2a')
    mk['conc'].box(-1.6, 1.6, -0.03, 0.1, pv1, vF + 2.85)                                                                # 接到停車場路緣的走道
    # 主屋頂（脊沿 u）＋兩端山牆
    PITCH = math.radians(25); ov = 0.5; rv = Db / 2 + ov; ry = EH + rv * math.tan(PITCH)
    for s_ in (1, -1):
        mk['roof'].quad([(u0 - ov, EH - ov * math.tan(PITCH) + 0.0, s_ * rv), (u1 + ov, EH - ov * math.tan(PITCH), s_ * rv), (u1 + ov, ry - ov * math.tan(PITCH), 0.0), (u0 - ov, ry - ov * math.tan(PITCH), 0.0)][::(1 if s_ > 0 else -1)])
        mk['trim'].box(u0 - ov, u1 + ov, EH - ov * math.tan(PITCH) - 0.2, EH - ov * math.tan(PITCH), s_ * rv - 0.04, s_ * rv + 0.04)
    for uu in (u0, u1):
        gf = mk['siding_h'].bm; gf.faces.new([gf.verts.new(g2b(uu, EH, s_ * Db / 2)) for s_ in ((1, -1) if uu == u0 else (-1, 1))] + [gf.verts.new(g2b(uu, EH + Db / 2 * math.tan(PITCH), 0.0))])
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('siding_h', 'brick', 'roof', 'conc')))
    vc.finish(g, uv=False)
    return g


if J.get('clubhouse'): clubhouse(J['clubhouse'])

# ================= 地面 =================
BD_ = J['bounds']; lot = J['lot']
gr = Mesh('usc_grass', M['grass'], tile=3.0)   # 草地不墊在停車場、出口車道的柏油底下（同一個地方畫兩層，LAWWW2-B 10-25 US-COMMUNITY-WEST-PERF）
gr.box(BD_['x0'], BD_['x1'], -0.06, -0.02, BD_['z0'], lot['z0']); gr.box(BD_['x0'], BD_['x1'], -0.06, -0.02, lot['z1'], BD_['z1'])   # 停車場北、南
gr.box(lot['x1'], BD_['x1'], -0.06, -0.02, lot['z0'], lot['z1'])                                                                      # 東
for (z0_, z1_) in ((lot['z0'], -3.6), (3.6, lot['z1'])): gr.box(BD_['x0'], lot['x0'], -0.06, -0.02, z0_, z1_)                        # 西（出口車道兩旁）
gr.finish(root)
asp = Mesh('usc_asphalt', M['asph'], tile=3.0)
asp.box(lot['x0'], lot['x1'], -0.02, 0.0, lot['z0'], lot['z1'])
asp.box(BD_['x0'], lot['x0'], -0.02, 0.0, -3.6, 3.6)                                       # 往西的出口車道
asp.finish(root)
pl = Mesh('usc_lines', M['paint'])
st = J['stall']
for s_ in J['stalls']:
    x, z, f = s_['x'], s_['z'], s_['face']
    for dx in (-st['w'] / 2, st['w'] / 2):
        pl.box(x + dx - 0.05, x + dx + 0.05, 0.0, 0.004, z - st['d'] / 2 + 0.3, z + st['d'] / 2)
pl.box(lot['x0'] + 1.0, lot['x1'] - 1.0, 0.0, 0.004, -0.06, 0.06)                          # 車道中線
pl.finish(root, uv=False)
cb = Mesh('usc_curbs', M['conc'], tile=2.0)
for (x0, x1, z0, z1) in ((lot['x0'], lot['x1'], lot['z0'] - 0.18, lot['z0']), (lot['x0'], lot['x1'], lot['z1'], lot['z1'] + 0.18), (lot['x1'], lot['x1'] + 0.18, lot['z0'], lot['z1'])):
    cb.rbox(x0, x1, 0.0, 0.15, z0, z1, r=0.02, seg=1)
for b in J['buildings']:   # 建築前的人行道（正面）＋接到停車場的小路
    yaw = b['yaw']; c, s_ = math.cos(yaw), math.sin(yaw)
    def W_(u, v): return (b['cx'] + u * c + v * s_, b['cz'] - u * s_ + v * c)
    for (ua, ub, va, vb) in ((-b['len'] / 2 - 1.0, b['len'] / 2 + 1.0, b['dep'] / 2 + 1.2, b['dep'] / 2 + 3.0),) + tuple((bx - 1.2, bx + 1.2, b['dep'] / 2, b['dep'] / 2 + 1.2) for bx in b['breezeway']):
        pts = [W_(ua, va), W_(ub, va), W_(ub, vb), W_(ua, vb)]
        xs = [p[0] for p in pts]; zs = [p[1] for p in pts]
        cb.box(min(xs), max(xs), 0.0, 0.1, min(zs), max(zs))
cb.finish(root)
# 灌木帶（建築正面、人行道和牆之間）：每叢＝深綠色的芯（填洞）＋外面一圈葉片卡（和樹冠同一張葉子貼圖），大小、顏色深淺不一
sh = Mesh('usc_shrub_core', L.flat('usc_shrub_core', '#1e2d19', rough=0.98))
leaf_mat0 = PM['leaf_small'] if PL else L.flat('usc_leaf', '#4a6a3a', rough=0.8)
shc = Mesh('usc_shrub_cards', leaf_mat0)
SEA.swap(CAR, leaf_mat0, 'snow', SEA.leaf_mat('t', 'us_shrub_snow.png'))   # 灌木是常綠的：只有雪天葉子上面積雪
SEA.swap(CAR, sh.mat if hasattr(sh, 'mat') else bpy.data.materials['usc_shrub_core'], 'snow', L.flat('t', '#b9c0c4', rough=0.9))
def leaf_card(m, px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
    f = m.bm.faces.new([m.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
    uvl = m.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
for b in J['buildings']:
    yaw = b['yaw']; c, s_ = math.cos(yaw), math.sin(yaw)
    k = -b['len'] / 2 + 0.8
    while k < b['len'] / 2 - 0.6:
        if not any(abs(k - bx) < 3.4 for bx in b['breezeway']):
            u, v = k, b['dep'] / 2 + 0.6; x, z = b['cx'] + u * c + v * s_, b['cz'] - u * s_ + v * c
            r = rng.uniform(0.42, 0.62); v0 = set(sh.bm.verts)
            sh.ell((x, r * 0.62, z), r * 0.7, r * 0.56, r * 0.66, seg=8, rings=5)
            for vv in sh.bm.verts:
                if vv not in v0: vv.co *= 1.0; vv.co.x += rng.uniform(-0.05, 0.05); vv.co.y += rng.uniform(-0.05, 0.05); vv.co.z += rng.uniform(-0.04, 0.04)
            for j in range(30):
                a_ = rng.uniform(0, 2 * math.pi); e_ = rng.uniform(-0.1, 1.2); rr = r * rng.uniform(0.75, 1.05)
                leaf_card(shc, x + rr * math.cos(a_) * math.cos(e_), r * 0.7 + rr * 0.7 * math.sin(e_), z + rr * math.sin(a_) * math.cos(e_), 0.55 * rng.uniform(0.8, 1.2) * (r / 0.5), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
        k += rng.uniform(0.9, 1.3)
sh.finish(root, uv=False, smooth=True); shc.finish(root, uv=False, merge=False)
# 樹：小樹（樹穴，細樹幹＋小樹冠）＋南邊樹林前緣的大樹＋外圍一整圈樹林（走不到）
#   樹冠＝幾團深綠色的芯（填洞、遠看是樹冠的體積）＋芯的表面一片一片的葉片卡（和灌木同一張葉子貼圖）；樹幹旋轉體、微微傾斜，大樹有兩三根主枝伸進樹冠
trunk = Mesh('usc_trunks', L.flat('usc_bark', '#54473b', rough=0.9))
CARDS = [Mesh(f'usc_tree_cards_{k_}', m_) for k_, m_ in zip('abc', LEAF_T)]; cards = CARDS[0]
core = Mesh('usc_tree_core', L.flat('usc_tree_core', '#1c2a18', rough=0.98))   # 芯：很暗、不反光、平滑著色（從葉片卡的縫看進去是樹冠裡面的陰影）
SEA.swap(CAR, core.mat if hasattr(core, 'mat') else bpy.data.materials['usc_tree_core'], 'autumn', L.flat('t', '#6a3422', rough=0.98))   # 秋天：芯偏紅褐（從紅葉的縫看進去不是綠的）；第一版 #2e2015 遊戲裡是一塊塊黑的
twin = Mesh('usc_twig_inner', TWIG_IN)      # 初冬、雪天：樹冠裡面也有細枝（芯藏起來以後，樹冠不是一個空殼）
litm = Mesh('usc_leaf_litter', LITTER)      # 秋天、初冬：樹下的落葉
def litter(x, z, r, n):
    uvl = litm.bm.loops.layers.uv.verify()
    for k in range(n):
        a_ = rng.uniform(0, 2 * math.pi); d_ = r * math.sqrt(rng.uniform(0, 1)); sz = rng.uniform(1.0, 1.7); yaw = rng.uniform(0, math.pi)
        cx, cz = x + math.cos(a_) * d_, z + math.sin(a_) * d_; ca, sa = math.cos(yaw) * sz / 2, math.sin(yaw) * sz / 2
        f = litm.bm.faces.new([litm.bm.verts.new(g2b(cx + du * ca - dv * sa, -0.012, cz + du * sa + dv * ca)) for (du, dv) in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
CORE_C = ['#24361f', '#283b22', '#2d4126', '#223320']
def crown(cx, cy, cz, rx, ry, rz, ncard, csz, face=None):
    global cards
    """一團樹冠：芯（抖動過的橢球）＋表面的葉片卡；face＝(fx, fz) 時只在朝那邊的半邊放葉片卡（外圍樹林只做看得到的那一面）"""
    v0 = set(core.bm.verts)
    core.ell((cx, cy, cz), rx * 0.74, ry * 0.74, rz * 0.74, seg=8, rings=5)
    for vv in core.bm.verts:
        if vv not in v0:
            k = rng.uniform(0.88, 1.08); c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * k
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi)
        if face is not None and math.cos(a_) * face[0] + math.sin(a_) * face[1] < -0.2: continue
        e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)   # 下半部也要有葉子（從樹下往上看不能是一塊深色的芯）
        px, py, pz = cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_)
        leaf_card(cards, px, py, pz, csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
    for j in range(int(ncard * 0.3)):                                                         # 裡面的細枝（只有落葉以後看得到）
        a_ = rng.uniform(0, 2 * math.pi); e_ = math.asin(rng.uniform(-0.6, 1.0)); rr = rng.uniform(0.2, 0.7)
        leaf_card(twin, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(1.0, 1.5), rng.uniform(0, math.pi), rng.uniform(-0.6, 0.6))
def tree(x, z, h, big):
    global cards
    cards = CARDS[rng.randrange(3)]
    lean = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04)) if big else (0.0, 0.0)
    rb = rng.uniform(0.2, 0.32) if big else 0.07
    bt = L.lathe([(rb * 1.35, 0.0), (rb, 0.35), (rb * 0.8, h * 0.4), (rb * 0.55, h * 0.62)], seg=9 if big else 6)
    sh_ = Matrix(((1, 0, lean[0]), (0, 1, -lean[1]), (0, 0, 1))).to_4x4()
    trunk.add_bm(bt, Matrix.Translation(g2b(x, 0, z)) @ sh_); bt.free()
    if big:
        cr = h * 0.3; cy = h * 0.66
        for k in range(rng.randint(2, 3)):                                                       # 主枝
            a_ = rng.uniform(0, 2 * math.pi); y0 = h * rng.uniform(0.38, 0.5)
            trunk.cyl((x + lean[0] * y0, y0, z + lean[1] * y0), (x + math.cos(a_) * cr * 0.6, cy + rng.uniform(-0.5, 1.0), z + math.sin(a_) * cr * 0.6), rb * 0.35, seg=6, r2=rb * 0.18)
        for k in range(rng.randint(4, 6)):                                                       # 幾團樹冠
            a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.62)
            r_ = cr * rng.uniform(0.5, 0.72)
            crown(x + lean[0] * cy + math.cos(a_) * d_, cy + rng.uniform(-0.25, 0.4) * cr, z + lean[1] * cy + math.sin(a_) * d_, r_, r_ * 0.78, r_, int(9 * r_ * r_), 1.5)
    else:
        for k in range(3):
            a_ = k * 2.1 + rng.uniform(0, 0.6)
            crown(x + math.cos(a_) * 0.35, h * 0.74 + rng.uniform(-0.15, 0.25), z + math.sin(a_) * 0.35, 0.8, 0.7, 0.8, 26, 0.6)
for t in J['trees']:
    tree(t['x'], t['z'], t['h'], t['kind'] == 'big')
    litter(t['x'], t['z'], t['h'] * (0.3 if t['kind'] == 'big' else 0.22) + 0.6, 9 if t['kind'] == 'big' else 4)
# 外圍樹林（走不到）：區域四周一圈連續的樹冠（芯＋朝內那一面的葉片卡）；西邊出口車道留缺口；北邊在建築背後（從停車場看得到屋頂後面的樹，照片）
BD_ = J['bounds']
def belt(pts, face):
    global cards
    for (x, z) in pts:
        cards = CARDS[rng.randrange(3)]
        h = rng.uniform(11, 17); r_ = rng.uniform(3.6, 5.0)
        trunk.cyl((x, 0, z), (x, h * 0.55, z), rng.uniform(0.18, 0.28), seg=6, r2=0.14)
        crown(x, h * 0.62, z, r_, h * 0.36, r_, int(5.5 * r_ * r_), 2.1, face)
        crown(x + rng.uniform(-1.5, 1.5), h * 0.85, z + rng.uniform(-1, 1), r_ * 0.65, h * 0.2, r_ * 0.65, int(2.5 * r_ * r_), 1.8, face)
        litter(x + face[0] * r_ * 0.9, z + face[1] * r_ * 0.9, r_ * 0.8, 3)
        if rng.random() < 0.8:   # 樹林邊緣的灌叢（下層），樹幹之間不會直接看穿到外面
            ry_ = rng.uniform(1.0, 1.4)
            crown(x + rng.uniform(-2.0, 2.0) + face[0] * 1.2, ry_ * 0.8, z + face[1] * 1.2, rng.uniform(1.6, 2.4), ry_, rng.uniform(1.4, 2.0), 46, 1.0, face)
step = 5.2
belt([(BD_['x0'] + 2 + k * step + rng.uniform(-0.8, 0.8), BD_['z1'] - 1.5 + rng.uniform(-1, 1)) for k in range(int((BD_['x1'] - BD_['x0'] - 4) / step) + 1)], (0, -1))      # 南
belt([(BD_['x0'] + 2 + k * step + rng.uniform(-0.8, 0.8), BD_['z0'] - 0.5 + rng.uniform(-0.6, 0.6)) for k in range(int((BD_['x1'] - BD_['x0'] - 4) / step) + 1)], (0, 1))      # 北（建築背後）
belt([(BD_['x0'] + 4.6 + k * step + rng.uniform(-0.8, 0.8), BD_['z1'] + 3.5 + rng.uniform(-1, 1)) for k in range(int((BD_['x1'] - BD_['x0'] - 6) / step) + 1)], (0, -1))    # 南邊第二排（樹幹之間不會看到地平線）
belt([(BD_['x1'] + 0.5, BD_['z0'] + 4 + k * step + rng.uniform(-0.8, 0.8)) for k in range(int((BD_['z1'] - BD_['z0'] - 8) / step) + 1)], (-1, 0))                             # 東
belt([(BD_['x0'] - 0.5, z) for z in [BD_['z0'] + 4 + k * step + rng.uniform(-0.8, 0.8) for k in range(int((BD_['z1'] - BD_['z0'] - 8) / step) + 1)] if abs(z) > 7.0], (1, 0))   # 西（出口車道留缺口）

# ================= 社區西邊出口外面（走不到的背景；LAWWW2-B 美國路線巡查② 2026-10-24）=================
# 原本：西邊樹林在出口車道留了缺口，缺口外面什麼都沒有——草地到 x0 就斷了、後面是一片天空（搭公車去學校、走去超市，每次站在公車站都看得到）。
# 現在：出口車道接到社區外面的南北向雙向兩線道（雙黃線、白邊線、路緣、兩邊人行道）、這一側的公車站牌（超市街同一張 BUS 牌）＋長椅、
# 對面一排平房（壁板、山牆屋頂、亮著的窗、白門、門廊燈、車道、信箱、前院的樹）、房子後面一排大樹擋住地平線。
# 全部在 bounds 外面、走不到：社區的導航格到 x0 為止，配置不用改。
OX = BD_['x0']; ZR = 60.0
RX0, RX1 = OX - 13.0, OX - 5.0          # 路面（8 m）
SN0, SN1 = OX - 5.0, OX - 3.2           # 這一側的人行道
SF0, SF1 = OX - 14.8, OX - 13.0         # 對面的人行道
og = Mesh('usc_grass_out', M['grass'], tile=3.0)                                                         # 草地不墊在路、人行道底下（同一個地方畫兩層：西邊出口往西 fps 3.8，LAWWW2-B 10-25 US-COMMUNITY-WEST-PERF）
og.box(OX - 60.0, SF0, -0.06, -0.02, -ZR, ZR)                                                              # 對面人行道以西（前院、房子、後面的樹林）
for (z0_, z1_) in ((-ZR, -3.6), (3.6, ZR)): og.box(SN1, OX, -0.06, -0.02, z0_, z1_)                        # 這一側人行道和社區之間（出口車道那一段是柏油）
og.finish(root)
oa = Mesh('usc_asphalt_out', M['asph'], tile=3.0); oa.box(RX0, RX1, -0.02, 0.0, -ZR, ZR); oa.box(SN1, OX, -0.02, 0.0, -3.6, 3.6); oa.finish(root)
ow = Mesh('usc_walk_out', M['conc'], tile=2.0)
ow.box(SN0, SN1, 0.0, 0.1, -ZR, ZR); ow.box(SF0, SF1, 0.0, 0.1, -ZR, ZR)                                   # 人行道（車道口照樣連過去：美國住宅區的人行道不斷）
for (z0_, z1_) in ((-ZR, -3.8), (3.8, ZR)): ow.rbox(RX1 - 0.15, RX1, 0.0, 0.15, z0_, z1_, r=0.02, seg=1)   # 這一側的路緣（車道口壓低）
ow.box(RX1 - 0.15, RX1, 0.0, 0.04, -3.8, 3.8)
ow.rbox(RX0, RX0 + 0.15, 0.0, 0.15, -ZR, ZR, r=0.02, seg=1)                                                 # 對面的路緣
ow.finish(root)
op = Mesh('usc_line_paint_out', M['paint']); oy = Mesh('usc_line_yellow', L.flat('usc_line_yellow', '#d9b23c', rough=0.6, cull=True))
xm = (RX0 + RX1) / 2
for dx in (-0.12, 0.12): oy.box(xm + dx - 0.05, xm + dx + 0.05, 0.0, 0.004, -ZR, ZR)                        # 雙黃線
for xx in (RX0 + 0.35, RX1 - 0.35): op.box(xx - 0.06, xx + 0.06, 0.0, 0.004, -ZR, ZR)                       # 白邊線
op.finish(root, uv=False); oy.finish(root, uv=False)
# 公車站牌（「搭公車（去學校）」在出口車道北邊）＋長椅：BUS 牌照超市街（us_ms_signs.png 的 bus 那一格）
SGJ = json.load(open(os.path.join(GEN, 'us_ms_signs.json'), encoding='utf-8'))
def sg_uv_(name, inset=2):
    x0_, y0_, x1_, y1_ = SGJ['rects'][name]; S_ = SGJ['size']
    u0_, u1_ = (x0_ + inset) / S_, (x1_ - inset) / S_; v0_, v1_ = 1 - (y1_ - inset) / S_, 1 - (y0_ + inset) / S_
    return ((u0_, v0_), (u1_, v0_), (u1_, v1_), (u0_, v1_))
obs = Mesh('usc_bus_sign', img_mat('usc_bus_sign', 'us_ms_signs.png', rough=0.5)); obm = Mesh('usc_bus_pole', M['bronze'])
bx_, bz_ = SN0 + 0.45, -6.2
obm.cyl((bx_, 0.0, bz_), (bx_, 3.0, bz_), 0.04, seg=8); obm.box(bx_ - 0.02, bx_ + 0.02, 2.13, 2.77, bz_ - 0.24, bz_ + 0.24)
uvb = obs.bm.loops.layers.uv.verify()
for sx_ in (1, -1):                                                                                          # 兩面（朝路、朝社區）
    xx = bx_ + sx_ * 0.03; pts = [(xx, 2.15, bz_ - sx_ * 0.225), (xx, 2.15, bz_ + sx_ * 0.225), (xx, 2.75, bz_ + sx_ * 0.225), (xx, 2.75, bz_ - sx_ * 0.225)]
    f_ = obs.bm.faces.new([obs.bm.verts.new(g2b(*p)) for p in pts])
    u_ = sg_uv_('bus'); u_ = (u_[1], u_[0], u_[3], u_[2])   # 2026-10-25 招牌稽核：原本兩面的「BUS」「ROUTE 4」都左右相反（站在那一面看，u 往左手邊變大）——UV 左右對調，幾何不動
    for lp, uv in zip(f_.loops, u_): lp[uvb].uv = uv
obs.finish(root, uv=False); obm.finish(root, uv=False)
ovc = CMesh('usc_out_vc', M['vc'])
for k in range(4): ovc.crbox(SN1 - 0.65 + k * 0.13, SN1 - 0.55 + k * 0.13, 0.53, 0.56, bz_ - 2.9, bz_ - 1.1, '#8a6040', r=0.01, seg=1)   # 長椅（面向路）
for e in (-2.7, -1.3): ovc.cbox(SN1 - 0.65, SN1 - 0.15, 0.1, 0.53, bz_ + e - 0.03, bz_ + e + 0.03, '#3b3530')


def house(hid, cx, cz, Lh, Dh, tint, mirror=False):
    """對面的平房（走不到）：正面朝東（yaw π/2，對著路）。局部座標同 clubhouse：u 沿正面、v 往正面外。
    壁板（社區同一套顏色）、白色轉角板、山牆屋頂（雪天積雪，和社區的屋頂同一個材質）、白門＋門廊燈、窗（白框、玻璃；正面中間、背面一扇是亮著的房間，其他拉下白色百葉）、水泥地基與門前台階"""
    g = B.group('BLDG_' + hid, root, {'kind': 'us_house_bg', 'id': hid})
    g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, math.pi / 2)
    u0, u1, vF, vB, EH = -Lh / 2, Lh / 2, Dh / 2, -Dh / 2, 3.0
    M['siding_x'] = bpy.data.materials.get('usc_siding_' + tint[1:]) or siding_mat(tint)   # 和社區的公寓、會所同色就用同一個材質（少一個 draw call）
    mk = {k: Mesh('bX_' + k, M[k]) for k in ('siding_x', 'roof', 'trim', 'glassw', 'blinds', 'conc', 'door', 'lamp', 'house_in')}
    def dq(m, q): m.quad(q); m.quad(q[::-1])
    sd = -1 if mirror else 1
    DOOR = (sd * 1.6 - 0.48, sd * 1.6 + 0.48, 0.15, 2.25)
    WINS_F = [(sd * -3.4 - 0.75, sd * -3.4 + 0.75, 0.9, 2.3), (sd * -0.9 - 0.65, sd * -0.9 + 0.65, 0.9, 2.3), (sd * 4.0 - 0.65, sd * 4.0 + 0.65, 0.9, 2.3)]
    WINS_B = [(-2.5, -1.3, 1.0, 2.2), (1.3, 2.5, 1.0, 2.2)]; WINS_S = [(-0.6, 0.6, 1.0, 2.2)]
    def wq(rects, plane):
        m = mk['siding_x']
        for (xa, xb, ya, yb) in rects:
            if plane == 'F': m.quad([(u0 + xa, ya, vF), (u0 + xb, ya, vF), (u0 + xb, yb, vF), (u0 + xa, yb, vF)])
            elif plane == 'B': m.quad([(u1 - xa, ya, vB), (u1 - xb, ya, vB), (u1 - xb, yb, vB), (u1 - xa, yb, vB)])
            elif plane == 'L': m.quad([(u0, ya, vB + xa), (u0, ya, vB + xb), (u0, yb, vB + xb), (u0, yb, vB + xa)])
            else: m.quad([(u1, ya, vF - xa), (u1, ya, vF - xb), (u1, yb, vF - xb), (u1, yb, vF - xa)])
    wq(facade_rects(Lh, EH, [(a - u0, b_ - u0, y0, y1) for (a, b_, y0, y1) in [DOOR] + WINS_F]), 'F')
    wq(facade_rects(Lh, EH, [(Lh / 2 - b_, Lh / 2 - a, y0, y1) for (a, b_, y0, y1) in WINS_B]), 'B')
    for s_ in ('L', 'R'): wq(facade_rects(Dh, EH, [(Dh / 2 + a, Dh / 2 + b_, y0, y1) for (a, b_, y0, y1) in WINS_S]), s_)
    mk['conc'].box(u0 - 0.03, u1 + 0.03, -0.05, 0.15, vB - 0.03, vF + 0.03)                                   # 地基
    for uu in (u0, u1):
        for vv in (vF, vB): mk['trim'].box(uu - 0.06, uu + 0.06, 0.15, EH, vv - 0.06, vv + 0.06)              # 白色轉角板
    def win(a, b_, y0, y1, plane, lit=False):
        if plane == 'F': P = lambda u, y, d: (u, y, vF - d)
        elif plane == 'B': P = lambda u, y, d: (-u, y, vB + d)
        else:
            uu = u0 if plane == 'L' else u1; sg = 1 if plane == 'L' else -1
            P = lambda u, y, d: (uu + sg * d, y, u if plane == 'R' else -u)
        dq(mk['glassw'], [P(a, y0, 0.08), P(b_, y0, 0.08), P(b_, y1, 0.08), P(a, y1, 0.08)])
        if lit: dq(mk['house_in'], [P(a - 0.3, y0 - 0.5, 0.9), P(b_ + 0.3, y0 - 0.5, 0.9), P(b_ + 0.3, y1 + 0.4, 0.9), P(a - 0.3, y1 + 0.4, 0.9)])   # 亮著的房間（晚上看得到有人在家）
        else: dq(mk['blinds'], [P(a + 0.02, y0 + 0.05, 0.14), P(b_ - 0.02, y0 + 0.05, 0.14), P(b_ - 0.02, y1 - 0.03, 0.14), P(a + 0.02, y1 - 0.03, 0.14)])   # 其他拉下白色百葉（白天不會是一片片褐色的方塊）
        for (pa, pb, ya, yb) in ((a - 0.08, a, y0, y1), (b_, b_ + 0.08, y0, y1), (a - 0.08, b_ + 0.08, y1, y1 + 0.09), (a - 0.11, b_ + 0.11, y0 - 0.07, y0), ((a + b_) / 2 - 0.025, (a + b_) / 2 + 0.025, y0, y1)):
            c0, c1 = P(pa, ya, -0.03), P(pb, yb, 0.11)   # 框比玻璃（0.08）深 3 cm：框的背面不和玻璃同一個平面（疊面會閃）
            mk['trim'].box(min(c0[0], c1[0]), max(c0[0], c1[0]), ya, yb, min(c0[2], c1[2]), max(c0[2], c1[2]))
    for i_, w in enumerate(WINS_F): win(*w, 'F', lit=(i_ == 1))
    for i_, w in enumerate(WINS_B): win(*w, 'B', lit=(i_ == 0))
    for w in WINS_S: win(*w, 'L'); win(*w, 'R')
    a, b_, y0, y1 = DOOR                                                                                      # 白門＋門框＋台階＋門廊燈
    mk['door'].box(a, b_, y0, y1, vF - 0.06, vF - 0.02)
    for (pa, pb, ya, yb) in ((a - 0.09, a, y0, y1 + 0.09), (b_, b_ + 0.09, y0, y1 + 0.09), (a - 0.09, b_ + 0.09, y1, y1 + 0.09)): mk['trim'].box(pa, pb, ya, yb, vF - 0.02, vF + 0.04)
    mk['conc'].box(a - 0.5, b_ + 0.5, 0.0, 0.13, vF + 0.03, vF + 1.1)   # 台階比地基低 2 cm、從地基外緣開始（頂面不疊）
    mk['lamp'].box(b_ + 0.22, b_ + 0.36, 1.85, 2.1, vF, vF + 0.12)
    PITCH = math.radians(28); ov = 0.45; rv = Dh / 2 + ov; ry = EH + rv * math.tan(PITCH)                    # 山牆屋頂（脊沿 u）
    for s_ in (1, -1):
        mk['roof'].quad([(u0 - ov, EH - ov * math.tan(PITCH), s_ * rv), (u1 + ov, EH - ov * math.tan(PITCH), s_ * rv), (u1 + ov, ry - ov * math.tan(PITCH), 0.0), (u0 - ov, ry - ov * math.tan(PITCH), 0.0)][::(1 if s_ > 0 else -1)])
        mk['trim'].box(u0 - ov, u1 + ov, EH - ov * math.tan(PITCH) - 0.18, EH - ov * math.tan(PITCH), s_ * rv - 0.04, s_ * rv + 0.04)
    for uu in (u0, u1):
        gf = mk['siding_x'].bm; gf.faces.new([gf.verts.new(g2b(uu, EH, s_ * Dh / 2)) for s_ in ((1, -1) if uu == u0 else (-1, 1))] + [gf.verts.new(g2b(uu, EH + Dh / 2 * math.tan(PITCH), 0.0))])
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('siding_x', 'roof', 'conc', 'blinds')))
    return g


M['house_in'] = L.flat('GLOW_usc_house_interior', '#f1d6ae', rough=0.8, emit=B.srgb('#ffd29a'))   # 窗後面的室內（亮著）：遊戲照 GLOW_.*interior 依時段調亮度
HX = SF0 - 7.0 - 4.5                    # 前院 7 m、房子深 9 m
TINTS = ['#8c8572', '#7f8f9f', '#b8ad95', '#8f9a8a', '#777566', '#6d6c5f']
odr = Mesh('usc_drive_out', M['conc'], tile=2.0)
for i, zc in enumerate((-44.0, -24.0, -4.0, 16.0, 36.0)):
    Lh = rng.uniform(12.0, 14.0); mir = i % 2 == 1
    house('X%d' % (i + 1), HX, zc, Lh, 9.0, TINTS[i % len(TINTS)], mirror=mir)
    dz = zc + (Lh / 2 + 1.6) * (1 if mir else -1)                                                            # 車道（房子旁邊、接到路）
    odr.box(HX - 3.0, SF0, 0.0, 0.03, dz - 1.6, dz + 1.6)                                                     # 人行道照樣連過去
    ovc.cbox(SF1 - 0.35, SF1 - 0.3, 0.0, 1.05, dz - 2.1, dz - 2.05, '#3a3632')                                 # 信箱（柱子＋黑色箱子）
    ovc.crbox(SF1 - 0.5, SF1 - 0.15, 1.05, 1.3, dz - 2.35, dz - 1.8, '#1f2224', r=0.03, seg=1)
    tree(SF0 - 3.0, zc + (-3.5 if mir else 3.5), rng.uniform(6.5, 8.5), False)                              # 前院的樹
odr.finish(root); ovc.finish(root, uv=False)
belt([(HX - 9.0 + rng.uniform(-1.0, 1.0), z) for z in [-52 + k * 5.6 + rng.uniform(-0.8, 0.8) for k in range(int(104 / 5.6) + 1)]], (1, 0))   # 房子後面一排大樹（擋地平線）
trunk.finish(root, uv=False)
for cm in CARDS: cm.finish(root, uv=False, merge=False)
SEA.geo(root, 'tree_core', 'summer,autumn', core, uv=False, smooth=True)   # 芯：落葉以後藏起來
SEA.geo(root, 'twig_inner', 'bare,snow', twin, uv=False, merge=False)
SEA.geo(root, 'leaf_litter', 'autumn,bare', litm, uv=False, merge=False)

# ================= 小東西 =================
pv = CMesh('usc_props', M['vc']); br = Mesh('usc_bronze_parts', M['bronze']); lp_ = Mesh('GLOW_usc_lamps', M['lamp'])
bmap = {b['id']: b for b in J['buildings']}
for p in J['props']:
    t = p['type']; x, z, yaw = p['x'], p['z'], p['yaw']
    if 'building' in p:
        b = bmap[p['building']]; u, v = p['local']; c, s_ = math.cos(b['yaw']), math.sin(b['yaw'])
        x, z = b['cx'] + u * c + v * s_, b['cz'] - u * s_ + v * c
    if t == 'lamp':
        br.cyl((x, 0.0, z), (x, 6.2, z), 0.08, seg=10, r2=0.06); br.box(x - 0.04, x + 0.04, 6.1, 6.2, z - 0.05, z + 0.75)
        br.rbox(x - 0.25, x + 0.25, 6.0, 6.18, z + 0.6, z + 1.2, r=0.02, seg=1); lp_.box(x - 0.2, x + 0.2, 5.995, 6.0, z + 0.65, z + 1.15)
        pv.crbox(x - 0.25, x + 0.25, 0.0, 0.5, z - 0.25, z + 0.25, '#9a9690', r=0.03, seg=1)
    elif t == 'mailboxes':   # 集中信箱：米色金屬櫃、門的格子、底座
        pv.crbox(x - 1.2, x + 1.2, 0.3, 1.9, z - 0.3, z + 0.3, '#d6cfbf', r=0.02, seg=1); pv.cbox(x - 1.1, x + 1.1, 0.0, 0.3, z - 0.22, z + 0.22, '#7d7a74')
        for i in range(8):
            for j in range(5): pv.cbox(x - 1.1 + i * 0.275 + 0.01, x - 0.835 + i * 0.275, 0.4 + j * 0.29, 0.66 + j * 0.29, z + 0.3, z + 0.31, '#c9c1b0')
        pv.crbox(x - 1.3, x + 1.3, 1.9, 2.05, z - 0.4, z + 0.4, '#6b5f52', r=0.02, seg=1)
    elif t == 'dumpster':
        pv.crbox(x - 0.9, x + 0.9, 0.15, 1.3, z - 0.75, z + 0.75, '#2f4a3a', r=0.03, seg=1); pv.crbox(x - 0.92, x + 0.92, 1.3, 1.4, z - 0.78, z + 0.6, '#1f2b24', r=0.02, seg=1)
        for (a, b2, c2, d2) in ((x - 1.4, x - 1.3, z - 1.2, z + 1.2), (x + 1.3, x + 1.4, z - 1.2, z + 1.2), (x - 1.4, x + 1.4, z - 1.3, z - 1.2)):
            for k in range(int((max(b2 - a, d2 - c2)) / 0.15)):
                if b2 - a > d2 - c2: pv.cbox(a + k * 0.15, a + k * 0.15 + 0.13, 0.0, 1.8, c2, d2, '#7a5a3e')
                else: pv.cbox(a, b2, 0.0, 1.8, c2 + k * 0.15, c2 + k * 0.15 + 0.13, '#7a5a3e')
    elif t == 'bikerack':
        for k in range(5): br.cyl((x - 1.0 + k * 0.5, 0.0, z - 0.3), (x - 1.0 + k * 0.5, 0.8, z - 0.3), 0.025, seg=6); br.cyl((x - 1.0 + k * 0.5, 0.8, z - 0.3), (x - 1.0 + k * 0.5, 0.8, z + 0.3), 0.025, seg=6); br.cyl((x - 1.0 + k * 0.5, 0.0, z + 0.3), (x - 1.0 + k * 0.5, 0.8, z + 0.3), 0.025, seg=6)
    elif t == 'bench':
        for k in range(4): pv.crbox(x - 0.25 + k * 0.13, x - 0.15 + k * 0.13, 0.43, 0.46, z - 0.9, z + 0.9, '#8a6040', r=0.01, seg=1)
        for e in (-0.7, 0.7): br.box(x - 0.25, x + 0.25, 0.0, 0.43, z + e - 0.03, z + e + 0.03)
    elif t == 'ac_unit':
        pv.crbox(x - 0.4, x + 0.4, 0.0, 0.75, z - 0.4, z + 0.4, '#c9c8c3', r=0.02, seg=1); pv.cbox(x - 0.32, x + 0.32, 0.75, 0.76, z - 0.32, z + 0.32, '#3a3b3d')
        pv.cbox(x - 0.5, x + 0.5, 0.0, 0.05, z - 0.5, z + 0.5, '#9a968f')
    elif t == 'meters':   # 一排電錶（灰色盒子＋圓形錶面）
        for k in range(6):
            pv.crbox(x - 0.9 + k * 0.3, x - 0.66 + k * 0.3, 1.2, 1.55, z, z + 0.12, '#a6a7a5', r=0.01, seg=1)
            f0 = set(pv.bm.faces); pv.cyl((x - 0.78 + k * 0.3, 1.42, z + 0.12), (x - 0.78 + k * 0.3, 1.42, z + 0.15), 0.07, seg=12); pv.paint([f for f in pv.bm.faces if f not in f0], '#dfe3e3')
        pv.cbox(x - 1.0, x + 0.9, 1.15, 1.6, z - 0.01, z, '#8a8b89')
pv.finish(root, uv=False); br.finish(root, uv=False); lp_.finish(root, uv=False)

L.merge_by_material(root, keep=SEA.keep)
st = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st if isinstance(st, dict) else {}, tris_total=tris, layout='us_community.layout.json'))
print('us_community tris', tris)

if PREVIEW:   # 驗收渲染用：把車停進去（每台一個顏色的材質副本）
    bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets/models/env/second_ai/us_cars.glb'))
    src = {o.name: o for o in bpy.data.objects if o.name.startswith('car_') and o.type == 'EMPTY'}
    cols = {}
    for c_ in J['cars']:
        s0 = src.get(c_['kind'])
        if s0 is None: continue
        e = bpy.data.objects.new('prev_' + c_['kind'], None); bpy.context.scene.collection.objects.link(e)
        e.location = (c_['x'], -c_['z'], 0.0); e.rotation_euler = (0, 0, c_['yaw'])
        for ch in s0.children:
            o = ch.copy(); bpy.context.scene.collection.objects.link(o); o.parent = e; o.matrix_parent_inverse.identity(); o.location = ch.location; o.rotation_euler = ch.rotation_euler
            if o.type == 'MESH' and o.data.materials and o.data.materials[0].name.startswith('car_paint'):
                k = c_['color']
                if k not in cols:
                    mt = o.data.materials[0].copy(); mt.name = 'car_paint_' + k[1:]
                    bs = mt.node_tree.nodes.get('Principled BSDF')
                    if bs: bs.inputs['Base Color'].default_value = tuple(B.srgb(k)) + (1.0,) if len(B.srgb(k)) == 3 else B.srgb(k)
                    cols[k] = mt
                o.data = o.data.copy(); o.data.materials[0] = cols[k]
    for o in list(src.values()):                       # 原本並排的那一組（沒上色）整組刪掉
        for ch in list(o.children_recursive): bpy.data.objects.remove(ch, do_unlink=True)
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=PREVIEW, export_format='GLB', use_visible=False, export_extras=True)   # extras：季節網格的 seasons 屬性（render_cycles.py --season 照這個開關）
    print('preview', PREVIEW)
