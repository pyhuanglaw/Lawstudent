"""美國交換：校門前的主街（SCN-US-02 第一階段）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2：
  python3 tools/blender/env_second/us_street_layout_gen.py && python3 tools/blender/env_second/us_street_tex.py
  /opt/blenv/bin/python tools/blender/env_second/us_street.py [-- --out assets/models/env/second_ai/us_street.glb] [--preview <out.glb>]
配置 assets/models/env/second_ai/us_street.layout.json；座標＝區域座標（x 往東＝往校門、z 往南、y 上）。研究筆記 docs/art-rebuild/second_ai/research/us_campus_street.md。
做法：
  磚造店面（每棟一個開間）：磚牆（Poly Haven red_brick_03 調成紅磚、淺黃磚、深褐磚、漆白的磚）、一樓店面（兩側磚柱、深色框、大櫥窗＋踢腳板、內凹的門、上方氣窗、招牌帶）、
    帆布雨遮（斜面＋垂邊）、櫥窗後面暖光的店內（層架、桌子剪影）、樓上的上下拉窗（白框、石材窗台與過梁；淺黃磚那幾棟是拱形窗楣）、頂上的出挑簷口（三層線腳＋托架）、女兒牆。
  民宅改的店：兩層木造（橫向壁板，同社區的壁板做法）、山牆朝街、前廊（柱子、欄杆、階梯）、前院草地；一樓窗改成櫥窗、前廊上掛招牌。
  街道：柏油（中間黃色雙線、路邊停車格線）、水泥路緣、紅磚人行道（Poly Haven brick_pavement_04）、樹穴的行道樹（芯＋葉片卡）、黑色古典路燈（球形燈罩發光）、
    停車收費柱、腳踏車架、長椅、垃圾桶、消防栓、路口的紅綠燈與路名牌（真的路名）、斑馬線。路口東邊是校門前的紅磚廣場（校門本體等照片，不放假的）。
店名全部虛構（D77）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_street.glb')); PREVIEW = arg('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_street.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
rng = random.Random(20261020)
B.reset(texres=512)
root = B.group('us_street', props={'kind': 'us_street', 'layout': 'us_street.layout.json'})
BD = J['bounds']; X0, X1, Z0, Z1 = BD['x0'], BD['x1'], BD['z0'], BD['z1']; RD = J['road']; CR = J['cross']


def img_mat(name, fn, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    m['tile'] = 1.0
    return m


def siding_mat(tint):
    """橫向壁板（社區那張 us_siding.png 換顏色＋同一張法線貼圖）"""
    fn = 'us_siding_' + tint[1:] + '.png'; fp = os.path.join(GEN, fn)
    if not os.path.exists(fp):
        from PIL import Image
        im = Image.open(os.path.join(GEN, 'us_siding.png')).convert('RGB'); avg = (137, 126, 113); t = tuple(int(tint[i:i + 2], 16) for i in (1, 3, 5))
        im = Image.merge('RGB', [ch.point(lambda v, k=t[i] / avg[i]: min(255, int(v * k))) for i, ch in enumerate(im.split())]); im.save(fp)
    m = img_mat('ust_siding_' + tint[1:], fn, rough=0.7)
    nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, 'us_siding_nor.png'), check_existing=True); tx.image.colorspace_settings.name = 'Non-Color'
    nm = N.new('ShaderNodeNormalMap'); nt.links.new(tx.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    return m


def uv_quad(mesh, pts, uvs):
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def facade_rects(w, h, holes):
    xs = sorted(set([0.0, w] + [v for (a, b, _, _) in holes for v in (a, b)])); out = []
    for xa, xb in zip(xs, xs[1:]):
        if xb - xa < 1e-4: continue
        xm = (xa + xb) / 2; cuts = sorted([(y0, y1) for (a, b, y0, y1) in holes if a <= xm <= b]); cur = 0.0
        for (y0, y1) in cuts:
            if y0 > cur: out.append((xa, xb, cur, y0))
            cur = max(cur, y1)
        if cur < h: out.append((xa, xb, cur, h))
    return out


BRICK = {'brick_red': '#8a4a3a', 'brick_buff': '#b39a76', 'brick_brown': '#6a4232', 'painted': '#e4e0d6'}
M = {k: L.pbr('ust_' + k, 'red_brick_03', tile=1.2, target=v, normal=0.5, contrast=(0.35 if k == 'painted' else 1.0), maps=('diff', 'nor'), rough_value=0.85) for k, v in BRICK.items()}
M.update({'stone': L.pbr('ust_stone', 'sandstone_blocks_08', tile=1.0, target='#d4ccbb', normal=0.3, contrast=0.4, maps=('diff', 'nor'), rough_value=0.8),
          'frame': L.flat('ust_frame', '#25282b', rough=0.45, metal=0.2),
          'wframe': L.flat('ust_window_frame', '#eceae2', rough=0.45),
          'glass': L.flat('ck_glass', '#dfe9ec', rough=0.05, alpha=0.16),
          'glassD': L.flat('ust_upper_glass', '#2e3842', rough=0.06, metal=0.3),
          'interior': L.flat('GLOW_ust_interior', '#fff0d8', rough=0.6, emit=B.srgb('#ffdcaa')),
          'signs': img_mat('ust_signs', 'ust_signs.png', rough=0.5),
          'roof': L.flat('ust_roof_tar', '#3a3a3c', rough=0.9),
          'shingle': L.pbr('ust_shingle', 'grey_roof_tiles', tile=1.4, target='#3c3a38', normal=0.6, sat=0.15, maps=('diff', 'nor'), rough_value=0.85),
          'walk': L.pbr('ust_brick_walk', 'brick_pavement_04', tile=1.6, target='#93594a', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),
          'asph': L.pbr('ust_asphalt', 'asphalt_02', tile=3.0, target='#626261', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
          'conc': L.pbr('ust_concrete', 'concrete_wall_006', tile=2.0, target='#b9b6ae', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
          'grass': L.pbr('ust_grass', 'grass_ground', tile=3.0, target='#5d6a44', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
          'white': L.flat('ust_paint_white', '#ecebe6', rough=0.6), 'yellow': L.flat('ust_paint_yellow', '#e2b52a', rough=0.6),
          'black': L.flat('ust_black_metal', '#1e2022', rough=0.4, metal=0.35),
          'lampg': L.flat('GLOW_ust_lamp', '#fff6e4', rough=0.3, emit=B.srgb('#ffe8c0')),
          'vc': L.vc_material('ust_vc', rough=0.55)})
AWN = {}
def awning_mat(hexc):
    if hexc not in AWN: AWN[hexc] = L.flat('ust_awning_' + hexc[1:], hexc, rough=0.8)
    return AWN[hexc]
try:
    import plants as PL
    PM = PL.materials('ust_')
except Exception as ex:
    PL = None; PM = {}; print('plants', ex)
pv = CMesh('ust_props', M['vc'])
MS = {k: Mesh('ust_' + k, M[k]) for k in ('stone', 'frame', 'wframe', 'glass', 'glassD', 'interior', 'roof', 'shingle', 'black', 'lampg', 'white', 'yellow')}
SG = Mesh('ust_signs', M['signs'])
NROW = 16
def sign_uv(i, u0=0.0, u1=1.0): return (u0, 1 - (i + 1) / NROW + 0.002, u1, 1 - i / NROW - 0.002)


# ================= 建築 =================
GH, UH = 4.2, 3.6     # 一樓、樓上的樓高
def shop_building(b, idx):
    """磚造店面一棟：局部座標 u＝沿街（x0→x1）、v＝往街外（正面 0、往後是負的）；群組放在 (0, 0, front)、往外的方向決定是否鏡射"""
    out = 1 if b['front'] < 0 else -1          # 往街的方向（+z 或 −z）
    f = b['front']; w = b['x1'] - b['x0']; xa = b['x0']; nf = b['floors']; H = GH + UH * (nf - 1); top = H + 1.0
    brick = Mesh('ust_b%d_brick' % idx, M[b['style']], tile=1.2)
    def P(u, y, v): return (xa + u, y, f + out * v)        # v>0 往街外、v<0 往建築裡面
    def Q(m, pts): m.quad([P(*p) for p in (pts if out > 0 else pts[::-1])])
    def BX(m, u0, u1, y0, y1, v0, v1):
        z0, z1 = f + out * v0, f + out * v1; m.box(xa + u0, xa + u1, y0, y1, min(z0, z1), max(z0, z1))
    # 正面的洞：店面、樓上的窗
    holes = [(0.45, w - 0.45, 0.0, GH - 0.55)]
    nwin = max(2, int((w - 1.2) / 2.3)); wins = []
    for k_ in range(1, nf):
        y0 = GH + (k_ - 1) * UH + 0.95
        for i in range(nwin):
            uc = 0.6 + (w - 1.2) * (i + 0.5) / nwin; wins.append((uc - 0.55, uc + 0.55, y0, y0 + 1.75)); holes.append(wins[-1])
    for (u0, u1, y0, y1) in facade_rects(w, top, holes): Q(brick, [(u0, y0, 0), (u1, y0, 0), (u1, y1, 0), (u0, y1, 0)])
    D = b['depth']
    corner = b['x1'] > CR['x0'] - 3.0                                                          # 路口的轉角那棟：朝路口的側牆也有窗
    for (uu, sgn_) in ((0.0, -1), (w, 1)):                                                    # 兩側牆（鄰棟矮的時候看得到）
        sh_holes = []
        if corner and sgn_ > 0:
            for k_ in range(nf):
                y0 = (0.9 if k_ == 0 else GH + (k_ - 1) * UH + 0.95); y1 = y0 + (1.9 if k_ == 0 else 1.75)
                vv = 1.6
                while vv < D - 1.2: sh_holes.append((vv - 0.55, vv + 0.55, y0, y1)); vv += 2.6
        for (v0_, v1_, y0, y1) in facade_rects(D, top, sh_holes):
            pts = [(uu, y0, -v0_), (uu, y0, -v1_), (uu, y1, -v1_), (uu, y1, -v0_)]; Q(brick, pts if sgn_ < 0 else pts[::-1])
        for (v0_, v1_, y0, y1) in sh_holes:
            Q(MS['glassD'], [(uu - 0.12, y0, -v0_), (uu - 0.12, y0, -v1_), (uu - 0.12, y1, -v1_), (uu - 0.12, y1, -v0_)][::-1])
            BX(MS['wframe'], uu - 0.12, uu - 0.06, y0, y1, -v1_ - 0.06, -v1_); BX(MS['wframe'], uu - 0.12, uu - 0.06, y0, y1, -v0_, -v0_ + 0.06)
            BX(MS['wframe'], uu - 0.12, uu - 0.06, (y0 + y1) / 2 - 0.03, (y0 + y1) / 2 + 0.03, -v1_, -v0_); BX(MS['wframe'], uu - 0.12, uu - 0.06, y1, y1 + 0.06, -v1_ - 0.06, -v0_ + 0.06)
            BX(MS['stone'], uu - 0.12, uu + 0.1, y0 - 0.1, y0, -v1_ - 0.12, -v0_ + 0.12)
    Q(MS['roof'], [(0, H, -D), (w, H, -D), (w, H, 0), (0, H, 0)])
    BX(MS['roof'], 0.0, w, top - 0.02, top, -D, 0.0) if False else None
    BX(brick, 0.25, w - 0.25, H, top, -D + 0.01, -D + 0.25)   # 後面的女兒牆（兩側的女兒牆就是側牆往上延伸，不另外疊一層，避免同平面閃爍）
    # 一樓店面：深色框、櫥窗（踢腳板＋玻璃）、內凹的門、上方氣窗、招牌帶
    fr, gl = MS['frame'], MS['glass']
    sx0, sx1 = 0.45, w - 0.45; door_u = sx0 + (w - 0.9) * (0.25 if idx % 2 else 0.72); dw = 1.0
    BX(fr, sx0, sx1, GH - 0.62, GH - 0.55, -0.05, 0.08)                                        # 招牌帶下緣
    BX(fr, sx0, sx1, 2.9, 2.98, -0.05, 0.05)                                                   # 氣窗橫框
    for (a, c) in ((sx0, door_u - dw / 2 - 0.6), (door_u + dw / 2 + 0.6, sx1)):                # 兩段櫥窗
        if c - a < 0.4: continue
        BX(fr, a, c, 0.0, 0.55, -0.12, 0.02)                                                   # 踢腳板
        Q(gl, [(a, 0.55, -0.08), (c, 0.55, -0.08), (c, 2.9, -0.08), (a, 2.9, -0.08)])
        nm = max(1, int((c - a) / 1.6))
        for k_ in range(nm + 1): uu = a + (c - a) * k_ / nm; BX(fr, uu - 0.04, uu + 0.04, 0.55, GH - 0.62, -0.1, 0.0)
    Q(gl, [(sx0, 2.98, -0.08), (sx1, 2.98, -0.08), (sx1, GH - 0.62, -0.08), (sx0, GH - 0.62, -0.08)])   # 氣窗
    rec = 1.2; d0, d1 = door_u - dw / 2 - 0.6, door_u + dw / 2 + 0.6                            # 內凹的門口：斜的側面玻璃、地上的瓷磚
    Q(gl, [(d0, 0.55, -0.08), (door_u - dw / 2, 0.55, -rec), (door_u - dw / 2, 2.9, -rec), (d0, 2.9, -0.08)][::-1])
    Q(gl, [(door_u + dw / 2, 0.55, -rec), (d1, 0.55, -0.08), (d1, 2.9, -0.08), (door_u + dw / 2, 2.9, -rec)][::-1])
    BX(fr, door_u - dw / 2, door_u + dw / 2, 0.0, 2.9, -rec - 0.06, -rec)                    # 門（深色框＋玻璃）
    Q(gl, [(door_u - dw / 2 + 0.1, 0.2, -rec + 0.005), (door_u + dw / 2 - 0.1, 0.2, -rec + 0.005), (door_u + dw / 2 - 0.1, 2.6, -rec + 0.005), (door_u - dw / 2 + 0.1, 2.6, -rec + 0.005)])
    BX(MS['black'], door_u + dw / 2 - 0.2, door_u + dw / 2 - 0.16, 0.9, 1.3, -rec + 0.005, -rec + 0.05)   # 門把
    BX(MS['stone'], d0, d1, 0.0, 0.02, -rec, 0.0)
    # 招牌（招牌帶上）
    i = J['buildings'].index(b); sw = min(w - 1.4, 7.0); sh_ = sw / 16.0 * 1.0 * 2
    uc = w / 2; yv = GH - 0.3
    a_, c_ = (uc - sw / 2, uc + sw / 2) if out > 0 else (uc + sw / 2, uc - sw / 2)       # 字從看的人的左邊寫到右邊（南側的店面朝北，u 要反過來）
    pts = [(a_, yv - 0.28, 0.07), (c_, yv - 0.28, 0.07), (c_, yv + 0.28, 0.07), (a_, yv + 0.28, 0.07)]
    u0_, v0_, u1_, v1_ = sign_uv(i)
    uv_quad(SG, [P(*p) for p in pts], [(u0_, v0_), (u1_, v0_), (u1_, v1_), (u0_, v1_)])
    BX(fr, uc - sw / 2 - 0.05, uc + sw / 2 + 0.05, yv - 0.33, yv + 0.33, 0.0, 0.065)
    # 帆布雨遮
    if b.get('awning'):
        am = Mesh('ust_awn_%d' % idx, awning_mat(b['awning']))
        a0, a1 = sx0 + 0.1, sx1 - 0.1; yh, yl, d = GH - 0.62, 2.75, 1.5
        Q(am, [(a0, yh, 0.02), (a1, yh, 0.02), (a1, yl, d), (a0, yl, d)][::-1])
        Q(am, [(a0, yl, d), (a1, yl, d), (a1, yl - 0.28, d), (a0, yl - 0.28, d)])            # 垂邊
        for uu in (a0, a1): Q(am, [(uu, yh, 0.02), (uu, yl, d), (uu, yl - 0.28, d), (uu, yl - 0.05, 0.02)])
        for k_ in range(int((a1 - a0) / 0.9) + 1): uu = a0 + k_ * (a1 - a0) / max(1, int((a1 - a0) / 0.9)); BX(MS['black'], uu - 0.01, uu + 0.01, yl - 0.02, yh, 0.02, d) if False else None
        am.finish(root, uv=False)
    # 店內（暖光）：後牆發光、層架與桌子的剪影
    BX(MS['interior'], sx0, sx1, 0.0, GH - 0.6, -4.0, -3.98)
    BX(MS['interior'], sx0, sx1, GH - 0.62, GH - 0.6, -4.0, -0.1)
    for k_ in range(int((sx1 - sx0) / 1.5)):
        uu = sx0 + 0.6 + k_ * 1.5; kind = b['kind']
        if kind in ('books', 'records', 'thrift', 'hardware', 'print', 'bike'):
            f0 = set(pv.bm.faces); BXc = (lambda u0, u1, y0, y1, v0, v1, col: pv.cbox(xa + u0, xa + u1, y0, y1, min(f + out * v0, f + out * v1), max(f + out * v0, f + out * v1), col))
            BXc(uu - 0.5, uu + 0.5, 0.0, 1.9, -3.9, -3.5, '#6a4a32')
            for yy in (0.5, 1.0, 1.5): BXc(uu - 0.48, uu + 0.48, yy, yy + 0.32, -3.88, -3.6, rng.choice(['#8a3a2a', '#2a4a6a', '#c8a050', '#3a6a3a', '#e8e0d0']))
        else:
            BXc = (lambda u0, u1, y0, y1, v0, v1, col: pv.cbox(xa + u0, xa + u1, y0, y1, min(f + out * v0, f + out * v1), max(f + out * v0, f + out * v1), col))
            BXc(uu - 0.35, uu + 0.35, 0.72, 0.76, -2.4, -1.7, '#7a5236'); BXc(uu - 0.04, uu + 0.04, 0.0, 0.72, -2.08, -2.0, '#2a2a2a')
    # 樓上的窗：白框上下拉窗（中間橫框）、石材窗台＋過梁（淺黃磚是拱形窗楣）、玻璃後面的窗簾
    for (u0, u1, y0, y1) in wins:
        Q(MS['glassD'], [(u0, y0, -0.12), (u1, y0, -0.12), (u1, y1, -0.12), (u0, y1, -0.12)])
        for (a, c, ya, yb) in ((u0 - 0.06, u0, y0, y1), (u1, u1 + 0.06, y0, y1), (u0 - 0.06, u1 + 0.06, y1, y1 + 0.06), (u0, u1, (y0 + y1) / 2 - 0.03, (y0 + y1) / 2 + 0.03)):
            BX(MS['wframe'], a, c, ya, yb, -0.12, -0.06)
        BX(MS['stone'], u0 - 0.12, u1 + 0.12, y0 - 0.1, y0, -0.12, 0.08)                       # 窗台
        if b['style'] == 'brick_buff':                                                          # 拱形窗楣（分段）
            n = 7
            for k_ in range(n):
                a0, a1 = math.pi * k_ / n, math.pi * (k_ + 1) / n; r_ = (u1 - u0) / 2 + 0.12; uc_ = (u0 + u1) / 2
                q = [(uc_ - r_ * math.cos(a0), y1 + 0.06 + 0.35 * math.sin(a0), 0.04), (uc_ - r_ * math.cos(a1), y1 + 0.06 + 0.35 * math.sin(a1), 0.04),
                     (uc_ - (r_ + 0.14) * math.cos(a1), y1 + 0.06 + 0.5 * math.sin(a1), 0.04), (uc_ - (r_ + 0.14) * math.cos(a0), y1 + 0.06 + 0.5 * math.sin(a0), 0.04)]
                Q(MS['stone'], q)
        else:
            BX(MS['stone'], u0 - 0.14, u1 + 0.14, y1 + 0.06, y1 + 0.3, -0.02, 0.05)              # 過梁
        if rng.random() < 0.7:
            col = rng.choice(['#e8e0cc', '#d8d0c0', '#c8b898', '#a8b8c0'])
            pv.paint([], col)
            zz0, zz1 = f + out * -0.2, f + out * -0.21
            pv.cbox(xa + u0 + 0.02, xa + u1 - 0.02, y0 + 0.02, y1 - rng.uniform(0.1, 0.8), min(zz0, zz1), max(zz0, zz1), col)
    # 頂上的簷口（三層線腳＋托架）
    cm = MS['stone'] if b['style'] in ('brick_red', 'brick_brown') else MS['frame']
    BX(cm, -0.05, w + 0.05, H + 0.35, H + 0.45, -0.05, 0.25); BX(cm, -0.02, w + 0.02, H + 0.25, H + 0.35, -0.05, 0.16); BX(cm, 0.0, w, H + 0.15, H + 0.25, -0.05, 0.08)
    for k_ in range(int(w / 0.6) + 1): uu = 0.1 + k_ * (w - 0.2) / max(1, int(w / 0.6)); BX(cm, uu - 0.05, uu + 0.05, H + 0.05, H + 0.35, -0.02, 0.2)
    BX(MS['stone'], 0.0, w, GH - 0.15, GH - 0.05, -0.02, 0.1)                                   # 一樓和二樓之間的石材腰帶
    for uu in (0.0, w - 0.45): BX(brick, uu, uu + 0.45, 0.0, GH - 0.55, -0.05, 0.08)              # 店面兩側的磚柱（凸一點）
    brick.finish(root)


def house_shop(b, idx):
    """民宅改的店：兩層木造、山牆朝街、前廊、前院"""
    out = 1 if b['front'] < 0 else -1; f = b['front'] + (-out) * b['setback']; w = b['x1'] - b['x0']; xa = b['x0']; D = b['depth']
    sid = Mesh('ust_h%d_siding' % idx, siding_mat(rng.choice(['#8f9a8a', '#b9a98a', '#7f8f9f', '#c8c0aa'])))
    def P(u, y, v): return (xa + u, y, f + out * v)
    def Q(m, pts): m.quad([P(*p) for p in (pts if out > 0 else pts[::-1])])
    def BX(m, u0, u1, y0, y1, v0, v1):
        z0, z1 = f + out * v0, f + out * v1; m.box(xa + u0, xa + u1, y0, y1, min(z0, z1), max(z0, z1))
    Hh = 6.2; pitch = math.radians(40); ridge = Hh + (w / 2) * math.tan(pitch)
    holes = [(1.0, w / 2 - 0.8, 0.8, 2.6), (w / 2 + 0.6, w / 2 + 1.6, 0.0, 2.3), (w / 2 + 1.9, w - 1.0, 0.8, 2.6)]
    up = [(1.4, 2.4, 3.9, 5.5), (w - 2.4, w - 1.4, 3.9, 5.5)]
    for (u0, u1, y0, y1) in facade_rects(w, Hh, holes + up): Q(sid, [(u0, y0, 0), (u1, y0, 0), (u1, y1, 0), (u0, y1, 0)])
    sid.bm.faces.new([sid.bm.verts.new(g2b(*P(*p))) for p in (((0, Hh, 0), (w, Hh, 0), (w / 2, ridge, 0)) if out > 0 else ((w, Hh, 0), (0, Hh, 0), (w / 2, ridge, 0)))])
    for (uu, sg_) in ((0.0, -1), (w, 1)):
        pts = [(uu, 0, 0), (uu, 0, -D), (uu, Hh, -D), (uu, Hh, 0)]; Q(sid, pts if sg_ < 0 else pts[::-1])
    for s_ in (-1, 1):                                                                          # 屋頂（瓦）
        e0 = (w / 2 + s_ * (w / 2 + 0.4), Hh - 0.3); r0 = (w / 2, ridge + 0.05)
        Q(MS['shingle'], ([(e0[0], e0[1], 0.4), (r0[0], r0[1], 0.4), (r0[0], r0[1], -D - 0.3), (e0[0], e0[1], -D - 0.3)] if s_ < 0 else [(r0[0], r0[1], 0.4), (e0[0], e0[1], 0.4), (e0[0], e0[1], -D - 0.3), (r0[0], r0[1], -D - 0.3)]))
        BX(MS['wframe'], min(e0[0], r0[0]), max(e0[0], r0[0]), 0, 0, 0, 0) if False else None
    for (u0, u1, y0, y1) in [h for h in holes if h[2] > 0.1] + up:                              # 窗（白框、玻璃、窗簾）
        Q(MS['glass'] if y0 < 3 else MS['glassD'], [(u0, y0, -0.1), (u1, y0, -0.1), (u1, y1, -0.1), (u0, y1, -0.1)])
        for (a, c, ya, yb) in ((u0 - 0.08, u0, y0, y1), (u1, u1 + 0.08, y0, y1), (u0 - 0.08, u1 + 0.08, y1, y1 + 0.1), (u0 - 0.1, u1 + 0.1, y0 - 0.08, y0)): BX(MS['wframe'], a, c, ya, yb, -0.1, 0.03)
        if y0 < 3: BX(MS['interior'], u0, u1, 0.0, 3.0, -2.5, -2.48)
    u0, u1 = w / 2 + 0.6, w / 2 + 1.6                                                           # 門
    BX(MS['frame'], u0, u1, 0.0, 2.3, -0.08, -0.04); BX(MS['wframe'], u0 - 0.08, u1 + 0.08, 2.3, 2.4, -0.08, 0.03)
    # 前廊：地板、柱子、欄杆、屋頂、階梯；前廊上方掛招牌
    pd = 2.4; BX(MS['wframe'], 0.3, w - 0.3, 0.0, 0.5, 0.0, pd); BX(MS['wframe'], 0.3, w - 0.3, 2.85, 3.0, -0.05, pd + 0.2)
    Q(MS['shingle'], [(0.1, 3.0, pd + 0.3), (w - 0.1, 3.0, pd + 0.3), (w - 0.1, 3.5, -0.02), (0.1, 3.5, -0.02)][::-1])
    for uu in (0.45, w / 2 - 0.3, w / 2 + 2.2 if w / 2 + 2.2 < w - 0.6 else w - 0.6, w - 0.45): BX(MS['wframe'], uu - 0.09, uu + 0.09, 0.5, 2.85, pd - 0.18, pd)
    for (a, c) in ((0.45, w / 2 + 0.3), (w / 2 + 1.9, w - 0.45)):
        BX(MS['wframe'], a, c, 1.35, 1.42, pd - 0.12, pd - 0.06); BX(MS['wframe'], a, c, 0.6, 0.66, pd - 0.12, pd - 0.06)
        for k_ in range(int((c - a) / 0.14)): uu = a + k_ * 0.14 + 0.05; BX(MS['wframe'], uu - 0.018, uu + 0.018, 0.66, 1.35, pd - 0.1, pd - 0.08)
    for k_ in range(3): BX(MS['wframe'], w / 2 + 0.4, w / 2 + 1.8, 0.0, 0.5 - k_ * 0.16, pd + k_ * 0.3, pd + (k_ + 1) * 0.3)
    i = J['buildings'].index(b); sw = min(w - 2.0, 5.5); yv = 2.6
    a_, c_ = (w / 2 - sw / 2, w / 2 + sw / 2) if out > 0 else (w / 2 + sw / 2, w / 2 - sw / 2)
    pts = [(a_, yv - 0.2, pd + 0.21), (c_, yv - 0.2, pd + 0.21), (c_, yv + 0.2, pd + 0.21), (a_, yv + 0.2, pd + 0.21)]
    u0_, v0_, u1_, v1_ = sign_uv(i)
    uv_quad(SG, [P(*p) for p in pts], [(u0_, v0_), (u1_, v0_), (u1_, v1_), (u0_, v1_)])
    # 前院：草地（人行道和前廊之間）
    gz0, gz1 = b['front'], f
    gr.box(xa + 0.2, xa + w - 0.2, -0.02, 0.03, min(gz0, gz1), max(gz0, gz1))
    sid.finish(root)


gr = Mesh('ust_yard_grass', M['grass'], tile=3.0)
for idx, b in enumerate(J['buildings']):
    (house_shop if b['style'] == 'house' else shop_building)(b, idx)
gr.finish(root)
# 建築後面的遠景：一排矮房子與樹的剪影（走不到）
bg = CMesh('ust_backdrop', M['vc'])
for sgn in (-1, 1):
    zb = sgn * 26.0
    for k in range(30):
        x0 = X0 + k * (X1 - X0) / 30; x1 = x0 + (X1 - X0) / 30; h0 = rng.uniform(8, 14)
        bg.poly([(x0, 0, zb), (x1, 0, zb), (x1, h0, zb), (x0, h0, zb)][::(1 if sgn > 0 else -1)], rng.choice(['#4a5a44', '#56664c', '#6a5a4a', '#5a5450']))
bg.finish(root, uv=False)

# ================= 街道 =================
rz0, rz1 = RD['z0'], RD['z1']; FR = J['front']
asp = Mesh('ust_asphalt', M['asph'], tile=3.0); asp.box(X0, CR['x0'], -0.06, -0.02, rz0, rz1); asp.box(CR['x0'], CR['x1'], -0.06, -0.02, Z0, Z1); asp.finish(root)   # Kirkwood 到校門前就停（校門那邊是步行廣場）
gb = Mesh('ust_ground_lawn', M['grass'], tile=3.0); gb.box(X0, X1, -0.09, -0.07, Z0, Z1); gb.box(J['gates_plaza']['x0'], X1, -0.06, -0.03, Z0, Z1); gb.finish(root)   # 底下整片草地（建築之間、校門那一側的草坪），不會看到黑色的洞
wk = Mesh('ust_walk', M['walk'], tile=1.6)
for sgn in (-1, 1):
    a, c = (rz1, FR) if sgn > 0 else (-FR, rz0)
    wk.box(X0, CR['x0'], -0.05, 0.12, a, c)
    wk.box(CR['x1'], X1, -0.05, 0.12, a, c)
for (a, c) in ((-FR - 18, -FR), (FR, FR + 18)): wk.box(CR['x0'] - 2.5, CR['x0'], -0.05, 0.12, a, c); wk.box(CR['x1'], CR['x1'] + 2.5, -0.05, 0.12, a, c)
gp = J['gates_plaza']; wk.box(gp['x0'] + 0.2, gp['x1'], -0.05, 0.12, gp['z0'], gp['z1'])
wk.finish(root)
cb = Mesh('ust_curbs', M['conc'], tile=2.0)
for sgn in (-1, 1):
    zc = rz1 if sgn > 0 else rz0
    cb.box(X0, CR['x0'], -0.05, 0.13, min(zc, zc + sgn * 0.2), max(zc, zc + sgn * 0.2)); cb.box(CR['x1'], X1, -0.05, 0.13, min(zc, zc + sgn * 0.2), max(zc, zc + sgn * 0.2))
for xx in (CR['x0'], CR['x1']):
    s_ = -1 if xx == CR['x0'] else 1
    for (a, c) in ((Z0, rz0), (rz1, Z1)): cb.box(min(xx, xx + s_ * 0.2), max(xx, xx + s_ * 0.2), -0.05, 0.13, a, c)
cb.finish(root)
ln = Mesh('ust_lines_white', M['white']); ly = Mesh('ust_lines_yellow', M['yellow'])
for dz in (-0.12, 0.12): ly.box(X0, CR['x0'] - 3.5, -0.02, -0.015, dz - 0.05, dz + 0.05)
for sgn in (-1, 1):
    zl = sgn * (rz1 - RD['park_w'])
    ln.box(X0, CR['x0'] - 3.5, -0.02, -0.015, zl - 0.05, zl + 0.05)
    for x in range(int(X0) + 4, int(CR['x0']) - 5, 7): ln.box(x - 0.05, x + 0.05, -0.02, -0.015, min(zl, sgn * rz1), max(zl, sgn * rz1))
for k in range(9):                                                                             # 斑馬線（路口的四邊；Kirkwood 那邊兩條）
    z = rz0 + 0.7 + k * (rz1 - rz0 - 1.4) / 8
    ln.box(CR['x0'] - 3.0, CR['x0'] - 0.6, -0.02, -0.015, z - 0.25, z + 0.25); ln.box(CR['x1'] + 0.6, CR['x1'] + 3.0, -0.02, -0.015, z - 0.25, z + 0.25)
for k in range(6):
    x = CR['x0'] + 0.9 + k * (CR['x1'] - CR['x0'] - 1.8) / 5
    for (a, c) in ((rz1 + 0.6, rz1 + 3.0), (rz0 - 3.0, rz0 - 0.6)): ln.box(x - 0.3, x + 0.3, -0.02, -0.015, a, c)
ln.box(CR['x0'] - 3.6, CR['x0'] - 3.3, -0.02, -0.015, 0.0, rz1); ln.box(CR['x1'] + 3.3, CR['x1'] + 3.6, -0.02, -0.015, rz0, 0.0)   # 停止線
ln.finish(root, uv=False); ly.finish(root, uv=False)

# ================= 街道家具 =================
bk = MS['black']; lg = MS['lampg']
cards = Mesh('ust_tree_cards', PM['leaf_small']) if PL and 'leaf_small' in PM else None
core = Mesh('ust_tree_core', L.flat('ust_tree_core', '#1c2a18', rough=0.98)); trunk = Mesh('ust_trunks', L.flat('ust_bark', '#54473b', rough=0.9))
def leaf_card(px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    uv_quad(cards, [(px - ca * sz / 2, py - sz / 2 - tilt * sz / 2, pz - sa * sz / 2), (px + ca * sz / 2, py - sz / 2 + tilt * sz / 2, pz + sa * sz / 2),
                    (px + ca * sz / 2, py + sz / 2 + tilt * sz / 2, pz + sa * sz / 2), (px - ca * sz / 2, py + sz / 2 - tilt * sz / 2, pz - sa * sz / 2)], [(0, 0), (1, 0), (1, 1), (0, 1)])
def crown(cx, cy, cz, rx, ry, rz, ncard, csz):
    v0 = set(core.bm.verts); core.ell((cx, cy, cz), rx * 0.62, ry * 0.62, rz * 0.62, seg=8, rings=5)
    for vv in core.bm.verts:
        if vv not in v0: c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * rng.uniform(0.88, 1.08)
    if cards is None: return
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi); e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)
        leaf_card(cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
for p in J['props']:
    t, x, z = p['type'], p['x'], p['z']
    if t == 'tree':
        h = p['h']; bk.box(x - 0.6, x + 0.6, 0.11, 0.13, z - 0.6, z + 0.6)                     # 樹穴的鐵蓋
        bt = L.lathe([(0.22, 0.0), (0.16, 0.3), (0.12, h * 0.45), (0.08, h * 0.6)], seg=8); trunk.add_bm(bt, Matrix.Translation(g2b(x, 0.1, z))); bt.free()
        cr = h * 0.28
        for k in range(4):
            a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.15, 0.55); r_ = cr * rng.uniform(0.55, 0.75)
            crown(x + math.cos(a_) * d_, h * 0.66 + rng.uniform(-0.3, 0.6), z + math.sin(a_) * d_, r_, r_ * 0.8, r_, int(24 * r_ * r_), 1.25)
    elif t == 'lamp':                                                                           # 古典路燈：凹槽燈桿＋球形燈罩
        bk.cyl((x, 0.1, z), (x, 0.6, z), 0.16, seg=12, r2=0.11); bk.cyl((x, 0.6, z), (x, 3.6, z), 0.065, seg=10, r2=0.05)
        bk.cyl((x, 3.6, z), (x, 3.75, z), 0.1, seg=10); lg.sphere((x, 4.0, z), 0.24, seg=12, rings=8, sy=1.15); bk.cyl((x, 4.24, z), (x, 4.32, z), 0.06, seg=8)
    elif t == 'meter':
        bk.cyl((x, 0.1, z), (x, 1.15, z), 0.035, seg=8); pv.crbox(x - 0.1, x + 0.1, 1.15, 1.45, z - 0.07, z + 0.07, '#5a6066', r=0.02, seg=1)
    elif t == 'bikerack':
        for k in range(4): xx = x - 1.2 + k * 0.8; bk.cyl((xx - 0.3, 0.1, z), (xx - 0.3, 0.8, z), 0.025, seg=6); bk.cyl((xx + 0.3, 0.1, z), (xx + 0.3, 0.8, z), 0.025, seg=6); bk.cyl((xx - 0.3, 0.8, z), (xx + 0.3, 0.8, z), 0.025, seg=6)
    elif t == 'bench':
        for k in range(4): pv.crbox(x - 0.9, x + 0.9, 0.45, 0.48, z - 0.22 + k * 0.12, z - 0.12 + k * 0.12, '#6a4a32', r=0.01, seg=1)
        for e in (-0.75, 0.75): bk.box(x + e - 0.03, x + e + 0.03, 0.1, 0.45, z - 0.25, z + 0.25)
    elif t == 'trash':
        bk.cyl((x, 0.1, z), (x, 1.0, z), 0.28, seg=14); bk.cyl((x, 1.0, z), (x, 1.1, z), 0.3, seg=14, r2=0.22)
    elif t == 'hydrant':
        f0 = set(pv.bm.faces); pv.cyl((x, 0.1, z), (x, 0.75, z), 0.13, seg=10); pv.cyl((x, 0.75, z), (x, 0.9, z), 0.1, seg=10, r2=0.06); pv.cyl((x - 0.2, 0.55, z), (x + 0.2, 0.55, z), 0.05, seg=8)
        pv.paint([f for f in pv.bm.faces if f not in f0], '#b8262e')
    elif t == 'traffic_light':
        bk.cyl((x, 0.1, z), (x, 5.6, z), 0.11, seg=10); dirz = 1 if z < 0 else -1
        bk.cyl((x, 5.5, z), (x + 4.0, 5.5, z), 0.06, seg=8)
        for xx in (x + 2.2, x + 3.8):
            bk.box(xx - 0.2, xx + 0.2, 4.6, 5.5, z - 0.14, z + 0.14)
            for k, col in enumerate(('#c8302b', '#e0a21b', '#2f9a4a')):
                f0 = set(pv.bm.faces); pv.cyl((xx, 5.3 - k * 0.3, z - dirz * 0.0 + dirz * 0.14), (xx, 5.3 - k * 0.3, z + dirz * 0.16), 0.1, seg=10); pv.paint([f for f in pv.bm.faces if f not in f0], col if k != 2 else '#4ac86a')
    elif t == 'street_sign':
        bk.cyl((x, 0.1, z), (x, 3.0, z), 0.04, seg=8)
        k = 0 if 'Kirkwood' in p['text'] else 1
        for face in (1, -1):
            zz = z + face * 0.02; pts = [(x - 0.8, 2.75, zz), (x + 0.8, 2.75, zz), (x + 0.8, 2.95, zz), (x - 0.8, 2.95, zz)]
            u0_, u1_ = k * 0.5, k * 0.5 + 0.5; v0_, v1_ = 1 - 16 / 16 + 0.002, 1 - 15 / 16 - 0.002
            uv_quad(SG, pts if face > 0 else pts[::-1], [(u0_, v0_), (u1_, v0_), (u1_, v1_), (u0_, v1_)] if face > 0 else [(u1_, v0_), (u0_, v0_), (u0_, v1_), (u1_, v1_)][::-1])
for (x, z, h) in ((16.0, -15.0, 15.0), (24.0, -20.0, 17.0), (18.0, 16.0, 14.0), (27.0, 21.0, 16.0), (28.0, -12.0, 13.0), (15.0, 22.0, 15.5)):   # 校門那一側草坪上的大樹（Old Crescent 的感覺）
    bt = L.lathe([(0.45, 0.0), (0.32, 0.4), (0.26, h * 0.4), (0.16, h * 0.6)], seg=10); trunk.add_bm(bt, Matrix.Translation(g2b(x, 0.0, z))); bt.free()
    cr = h * 0.3
    for k in range(6):
        a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.6); r_ = cr * rng.uniform(0.5, 0.7)
        crown(x + math.cos(a_) * d_, h * 0.66 + rng.uniform(-0.4, 0.5) * cr, z + math.sin(a_) * d_, r_, r_ * 0.8, r_, int(14 * r_ * r_), 1.6)
trunk.finish(root, uv=False); core.finish(root, uv=False, smooth=True)
if cards is not None: cards.finish(root, uv=False, merge=False)
for k_, m_ in MS.items():
    if not m_.empty(): m_.finish(root, uv=(k_ in ('stone', 'shingle')))
SG.finish(root, uv=False, merge=False); pv.finish(root, uv=False)
L.merge_by_material(root, keep=lambda ob: False)
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_street.layout.json'))
print('us_street tris', tris)

if PREVIEW:   # 驗收渲染用：把車停進路邊停車格
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
                    mt = o.data.materials[0].copy(); mt.name = 'car_paint_' + k[1:]; bs = mt.node_tree.nodes.get('Principled BSDF')
                    if bs: bs.inputs['Base Color'].default_value = tuple(B.srgb(k)) + (1.0,) if len(B.srgb(k)) == 3 else B.srgb(k)
                    cols[k] = mt
                o.data = o.data.copy(); o.data.materials[0] = cols[k]
    for o in list(src.values()):
        for ch in list(o.children_recursive): bpy.data.objects.remove(ch, do_unlink=True)
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=PREVIEW, export_format='GLB', use_visible=False)
    print('preview', PREVIEW)
