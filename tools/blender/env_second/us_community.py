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
    return img_mat('usc_siding_' + tint[1:], fn, rough=0.7)


M = {
     'brick': L.pbr('usc_brick', 'red_brick_03', tile=1.2, target='#8a4a3a', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),
     'roof': L.pbr('usc_roof', 'grey_roof_tiles', tile=1.4, target='#4d4843', normal=0.6, maps=('diff', 'nor'), rough_value=0.85),
     'trim': L.flat('usc_trim', '#f1efe9', rough=0.45),
     'rail': L.flat('usc_rail_wood', '#6a4630', rough=0.6),
     'railw': L.flat('usc_rail_white', '#eeeeea', rough=0.4, metal=0.2),
     'glass': L.flat('ck_glass', '#3b4752', rough=0.06, metal=0.35),
     'blinds': img_mat('usc_blinds', 'us_blinds.png', rough=0.6),
     'conc': L.pbr('usc_concrete', 'concrete_wall_006', tile=2.0, target='#bdb8ae', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'asph': L.pbr('usc_asphalt', 'asphalt_02', tile=3.0, target='#6f6e6b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'grass': L.pbr('usc_grass', 'grass_ground', tile=3.0, target='#6f7f4a', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
     'paint': L.flat('usc_line_paint', '#ecebe6', rough=0.6),
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
    mk = {k: Mesh(f"b{b['id']}_{k}", M[k]) for k in ('siding', 'brick', 'roof', 'trim', 'rail', 'railw', 'glass', 'blinds', 'conc', 'door', 'red', 'dark', 'lamp')}
    vc = CMesh(f"b{b['id']}_vc", M['vc'])
    # 一戶一個開間：正面扣掉樓梯間，剩下平分成 gables 個開間
    bw = 4.4; bz = [(c - bw / 2, c + bw / 2) for c in b['breezeway']]
    bays = []; nb = b['gables']; step = Lb / nb
    for k in range(nb):
        a, c = u0 + k * step, u0 + (k + 1) * step
        bays.append((a, c))
    holes_front = []
    for (a, c) in bz: holes_front.append((a - u0, c - u0, 0.0, EAVE - 0.05))
    BAL_W, BAL_H, BAL_D = 2.6, 2.45, 1.6
    win_list = []; bal_list = []
    for (a, c) in bays:
        mid = (a + c) / 2
        if any(x0 - 0.3 < mid < x1 + 0.3 for (x0, x1) in bz): mid = (a + mid) / 2 if mid > 0 else (mid + c) / 2
        for f in range(NF):
            y0 = f * FH
            bx0 = mid - 0.4 - BAL_W; bx1 = mid - 0.4                     # 陽台在開間中間偏左、兩扇窗在右邊
            if any(not (bx1 < x0 or bx0 > x1) for (x0, x1) in bz): bx0, bx1 = mid + 0.4, mid + 0.4 + BAL_W
            bal_list.append((bx0, bx1, y0 + 0.15, y0 + 0.15 + BAL_H))
            for wx in ((mid + 0.6, mid + 1.6) if bx1 < mid + 0.5 else (mid - 1.6, mid - 0.6),):
                if any(not (wx[1] < x0 - 0.2 or wx[0] > x1 + 0.2) for (x0, x1) in bz): continue
                win_list.append((wx[0], wx[1], y0 + 0.95, y0 + 2.35))
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
        mk['glass'].quad([P(0, y0, depth), P(1, y0, depth), P(1, y1, depth), P(0, y1, depth)][::(1 if (nv > 0 or nu < 0) else -1)])
        mk['blinds'].quad([P(0.02, y0 + 0.05, depth + 0.05), P(0.98, y0 + 0.05, depth + 0.05), P(0.98, y1 - 0.02, depth + 0.05), P(0.02, y1 - 0.02, depth + 0.05)][::(1 if (nv > 0 or nu < 0) else -1)])
        for (t0, t1, ya, yb) in ((-0.06, 0.0, y0 - 0.06, y1 + 0.06), (1.0, 1.06, y0 - 0.06, y1 + 0.06)):   # 左右框
            pass
        wl = math.hypot(ub - ua, vb - va); e = 0.09 / max(wl, 1e-3)
        for (t0, t1, ya, yb) in ((-e, 0.0, y0 - 0.08, y1 + 0.1), (1.0, 1.0 + e, y0 - 0.08, y1 + 0.1), (-e, 1.0 + e, y1, y1 + 0.1), (-e * 1.4, 1.0 + e * 1.4, y0 - 0.08, y0)):
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
    gab = [((x0 + x1) / 2, (x1 - x0) + 1.2) for (x0, x1) in bz]
    edges = sorted([u0 + 0.6] + [v for (x0, x1) in bz for v in (x0 - 0.6, x1 + 0.6)] + [u1 - 0.6])
    for sa, sb in zip(edges[0::2], edges[1::2]):
        n = max(1, int(round((sb - sa) / 7.5)))
        if sb - sa < 3.6: continue
        for k in range(n): gab.append((sa + (k + 0.5) * (sb - sa) / n, min((sb - sa) / n - 0.9, 6.2)))
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

# ================= 地面 =================
BD_ = J['bounds']; lot = J['lot']
gr = Mesh('usc_grass', M['grass'], tile=3.0); gr.box(BD_['x0'], BD_['x1'], -0.06, -0.02, BD_['z0'], BD_['z1']); gr.finish(root)
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
# 灌木帶（建築正面、人行道和牆之間）：一叢一叢的灌木（模型葉子的橢球團，顏色深淺不一）
sh = CMesh('usc_shrubs', M['vc'])
for b in J['buildings']:
    yaw = b['yaw']; c, s_ = math.cos(yaw), math.sin(yaw)
    k = -b['len'] / 2 + 0.8
    while k < b['len'] / 2 - 0.6:
        if not any(abs(k - bx) < 3.4 for bx in b['breezeway']):
            u, v = k, b['dep'] / 2 + 0.6; x, z = b['cx'] + u * c + v * s_, b['cz'] - u * s_ + v * c
            r = rng.uniform(0.45, 0.65); f0 = set(sh.bm.faces)
            sh.ell((x, r * 0.75, z), r, r * 0.8, r * 0.9, seg=10, rings=6)
            sh.paint([f for f in sh.bm.faces if f not in f0], rng.choice(['#3f5a33', '#4a6a3a', '#56743f', '#3b5230']))
        k += rng.uniform(1.0, 1.4)
sh.finish(root, uv=False)
# 樹：小樹（樹穴）＋南邊樹林的大樹（樹幹旋轉體＋樹冠的葉片卡團）
trunk = Mesh('usc_trunks', L.flat('usc_bark', '#5c4a3b', rough=0.9))
leaf_mat = PM['leaf_small'] if PL else L.flat('usc_leaf', '#4a6a3a', rough=0.8)
cards = Mesh('usc_tree_cards', leaf_mat)
for t in J['trees']:
    h = t['h']; x, z = t['x'], t['z']; big = t['kind'] == 'big'
    rb = 0.08 if not big else rng.uniform(0.22, 0.35)
    bt = L.lathe([(rb * 1.3, 0.0), (rb, 0.3), (rb * 0.75, h * 0.55), (rb * 0.45, h * 0.8)], seg=8 if big else 6)
    trunk.add_bm(bt, Matrix.Translation(g2b(x, 0, z))); bt.free()
    nc = 26 if big else 14; cr = (h * 0.32) if big else 1.2; cy = h * (0.68 if big else 0.72)
    for k in range(nc):
        a = rng.uniform(0, 2 * math.pi); e = rng.uniform(-0.4, 0.9); rr = cr * rng.uniform(0.35, 1.0)
        px, py, pz = x + rr * math.cos(a) * math.cos(e), cy + rr * math.sin(e) * 0.7, z + rr * math.sin(a) * math.cos(e)
        sz = (1.6 if big else 0.9) * rng.uniform(0.8, 1.2); yaw = rng.uniform(0, math.pi); tilt = rng.uniform(-0.4, 0.4)
        ca, sa = math.cos(yaw), math.sin(yaw)
        def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
        q = [P(-sz / 2, -sz / 2), P(sz / 2, -sz / 2), P(sz / 2, sz / 2), P(-sz / 2, sz / 2)]
        f = cards.bm.faces.new([cards.bm.verts.new(g2b(*p)) for p in q])
        uvl = cards.bm.loops.layers.uv.verify()
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
trunk.finish(root, uv=False); cards.finish(root, uv=False, merge=False)
# 樹林後面的剪影（走不到）：一排深綠色的起伏（遠景）
bg = CMesh('usc_forest_wall', M['vc'])
for k in range(40):
    x0 = BD_['x0'] + k * (BD_['x1'] - BD_['x0']) / 40; x1 = x0 + (BD_['x1'] - BD_['x0']) / 40
    h0 = 13 + 4 * math.sin(k * 1.7) + rng.uniform(-1, 1); h1 = 13 + 4 * math.sin((k + 1) * 1.7) + rng.uniform(-1, 1)
    bg.poly([(x0, 0, BD_['z1']), (x1, 0, BD_['z1']), (x1, h1, BD_['z1']), (x0, h0, BD_['z1'])][::-1], rng.choice(['#2f4529', '#344b2c', '#2b3f26']))
bg.finish(root, uv=False)

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

L.merge_by_material(root, keep=lambda ob: False)
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
    for o in list(src.values()): o.hide_render = True; [setattr(ch, 'hide_render', True) for ch in o.children]
    bpy.ops.export_scene.gltf(filepath=PREVIEW, export_format='GLB', use_visible=False)
    print('preview', PREVIEW)
