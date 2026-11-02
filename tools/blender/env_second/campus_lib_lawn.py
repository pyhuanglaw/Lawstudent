"""總圖前草坪（第二版，LIB-FRONT-1102；LAWWW2〔帳號 A〕2026-11-02）→ assets/models/env/second_ai/campus_lib_lawn.glb（校園世界座標）。
  /opt/blenv/bin/python tools/blender/env_second/campus_lib_lawn.py [-- --out …]
使用者 11-02 08:45 給的五張照片（「這是總圖前草坪的樣子 你修改遊戲中建築和草皮 這件事先做」）：
  - 椰影大道的盡頭（小椰林道路口以東）是一大片很長、修剪平整的草坪，從大道一路延伸到總圖前面；中間沒有步道（照片 1、5）。
  - 草坪兩邊各一排修剪整齊的龍柏籬（一棵一棵尖圓錐形的龍柏擠成一道約 3 m 高的牆）；籬笆後面是一排大王椰子（照片 1、2、4、5）。
  - 草坪靠大道那一頭是一條弧形的紅磚步道（照片 1 前景、照片 4），旁邊白色的球形路燈、白色石墩。
  - 總圖前面是淺色石板的大廣場（照片 3），接總圖的寬台階（台階、平台在 campus_library.glb）。
第一版（X133 LIB-LAWN-1030，LAWWW2-B）是 x 70～87 的小廣場＋兩塊 L 形草皮；這一版取代它，範圍改成 x 35～78（大道的柏油路在小椰林道路口以東結束，
  LAWWW 11-02 09:11 同意；總圖不搬）。
配置（北半邊；南半邊對稱）：
  - x 35～40.5：紅磚步道（從大道接過來；靠草坪那一邊是弧形，草坪最西邊在 x 39）。
  - 草坪：x 39～63.5、|z| ≤ 10（高 4.5 cm、花崗石低路緣；走得到）。
  - 龍柏籬：x 40.5～63.1、|z| 10.3～11.7，高約 3 m（一棵一棵的龍柏，間距 0.86～1.0 m）。導航擋住（只能從草坪兩頭進出）。
  - 籬笆外：|z| 11.7～15 一條草地（大王椰子種在 |z| 13.4，椰子由遊戲 TK.royalPalm 放：和大道同一套）、|z| 15～19 紅磚步道（行人、腳踏車走這裡去總圖）。
  - 廣場：x 63.5～73.75（台階前 10.25 m）、|z| ≤ 30（整個立面寬），淺色花崗石（使用者 11-02 09:4x：「台階下方還有磁磚 蠻寬的 之後才是草坪」）。
    使用者 11-02 10:4x「總圖出來還有個平台 之後才是階梯往下」：總圖的平台改成 6 m 深、台階移到 x 73.75～76（campus_library.py）→ 廣場、草坪的東端跟著往西 2.5 m
    （廣場 12 m → 10.25 m，草坪 27 m → 24.5 m）。
    老樟樹（劇情「他在樟樹下等你」「總圖前面的樟樹比總圖老」）在廣場北邊 (68.5, −25.5)、南邊一棵大樹 (68.5, 25.5)：
    樹由遊戲放（TK.tree，和第一版一樣），這裡只做樹下一圈土。長椅 4 張由遊戲放（W3.bench），位置在 info.layout。
  - 白色球形路燈 10 盞（照片 1）：步道靠籬笆那一邊每 11 m 一盞、廣場西邊兩角、台階兩旁（花台前面）；燈罩材質 wz_lamp_lens（遊戲晚上發光），GLOW_ 空節點＝光暈。
  - 白色石墩：草坪西端兩個角（照片 1）。總圖台階兩旁花台上的灌木（花台在 campus_library.glb，高 1.5 m）。
材質：Poly Haven CC0（granite_tile、brick_pavement_04、grass_ground；tools/blender/env_second/textures/）；龍柏的葉子貼圖是這支程式畫的（textures/gen/juniper_foliage.png）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_lib_lawn.glb'

XA = 35.0                      # 大道的柏油路在這裡結束（小椰林道路口東緣）
XLW, XLE = 39.0, 63.5          # 草坪西端（弧頂，z=0）、東端（使用者 11-02 09:4x：台階下面還有一大片磁磚，蠻寬的，之後才是草坪；10:4x 總圖平台改 6 m 深、台階往西移 → 廣場 10.25 m）
XARC = 40.5                    # 弧形兩端（|z| = ZL）的 x
ZL = 10.0                      # 草坪半寬
HZ0, HZ1 = 10.3, 11.7          # 龍柏籬
HX0, HX1 = 40.5, 63.1
GZ1 = 15.0                     # 籬笆外的草地到 |z| 15（大王椰子 |z| 13.4）
PZ1 = 19.0                     # 紅磚步道外緣
XP0, XP1, ZP = 63.5, 73.75, 30.0  # 廣場：整個立面寬（|z| ≤ 30），到台階第一階（campus_library.py XST0）
Y_PAVE, Y_PLAZA, Y_LAWN, Y_CURB = 0.022, 0.026, 0.045, 0.07
TREES = {'camphor': (68.5, -25.5, 1.5), 'south': (68.5, 25.5, 1.3)}   # 廣場南北兩邊的大樹（照片 3、11-02 09:4x 那張：廣場兩旁都是大樹）
LAMPS = [(x, s * 15.35) for s in (-1, 1) for x in (38.0, 49.0, 60.0)] + [(64.3, s * 20.0) for s in (-1, 1)] + [(72.8, s * 19.2) for s in (-1, 1)]   # 最後兩盞：台階兩旁、花台前面
BENCHES = [(x, s * 22.2, 0.0 if s < 0 else math.pi) for s in (-1, 1) for x in (65.3, 71.7)]   # 大樹兩旁，面向廣場中間   # 長椅正面朝 +z＝yaw 0（北邊的面向南、南邊的面向北）
CUBES = [(XARC - 0.5, s * 11.0) for s in (-1, 1)]
PALMS = [(x, s * 13.4) for s in (-1, 1) for x in (40.0, 47.5, 55.0, 62.5)]   # 遊戲放（大道椰子那一圈 x>35 的改到這裡）
PLANTERS = [(73.75, 76.0, 18.0, 30.0)]   # 總圖台階兩旁的花台（campus_library.py：x 73.75～76、|z| 18～30、高 1.5）
XMAS = (68.0, -12.0)


def juniper_tex(path, n=256, seed=7):
    """龍柏的葉子（可以四方連續的貼圖）：深綠底＋一簇一簇亮一點的鱗葉＋陰影縫"""
    import numpy as np
    from PIL import Image
    rng = np.random.default_rng(seed)
    img = np.zeros((n, n, 3), np.float32) + np.array([0.035, 0.075, 0.025])
    yy, xx = np.mgrid[0:n, 0:n]
    for _ in range(900):
        cx, cy, r = rng.uniform(0, n), rng.uniform(0, n), rng.uniform(3, 9)
        dx = (xx - cx + n / 2) % n - n / 2; dy = (yy - cy + n / 2) % n - n / 2
        d = np.sqrt(dx * dx + (dy * 1.3) ** 2) / r
        m = np.clip(1 - d, 0, 1) ** 1.5
        col = np.array([0.075, 0.15, 0.045]) * rng.uniform(0.7, 1.45) + np.array([0.01, 0.015, 0.0]) * rng.uniform(-1, 1)   # 照片：龍柏深綠（11-02 第一版太淺、像一般灌木）
        top = np.clip(1 - np.clip(dy / r + 0.4, 0, 1), 0, 1)           # 每一簇上面亮、下面暗
        img = img * (1 - m[..., None]) + (col * (0.75 + 0.45 * top[..., None])) * m[..., None]
    img = np.clip(img, 0, 1) ** (1 / 2.2)
    Image.fromarray((img * 255).astype(np.uint8)).save(path)


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('campus_lib_lawn', props={'kind': 'campus_lib_lawn'})
    gen = os.path.join(HERE, 'textures', 'gen', 'juniper_foliage.png')
    juniper_tex(gen)
    M = {'plaza': L.pbr('ll_plaza_stone', 'granite_tile', tile=1.8, target='#c9c4ba', contrast=0.7, normal=0.35, maps=('diff', 'nor'), rough_value=0.8),
         'brick': L.pbr('ll_brick_paver', 'brick_pavement_04', tile=1.6, target='#93604d', contrast=0.95, normal=0.45, maps=('diff', 'nor'), rough_value=0.86),
         'grass': L.pbr('ll_lawn', 'grass_ground', tile=2.6, target='#6f9142', contrast=1.0, normal=0.3, maps=('diff', 'nor'), rough_value=0.96),
         'grass2': L.pbr('ll_lawn_rough', 'grass_ground', tile=2.6, target='#5f7d3c', contrast=1.1, normal=0.35, maps=('diff',), rough_value=0.97),
         'curb': L.pbr('ll_curb_granite', 'granite_tile', tile=0.7, target='#aaa59b', contrast=0.9, maps=('diff',), res=256, rough_value=0.8),
         'soil': L.flat('ll_tree_soil', '#5c4c3b', rough=1.0),
         'stone': L.flat('ll_white_stone', '#e3dfd6', rough=0.75),
         'pole': L.flat('ll_lamp_white', '#ecebe6', rough=0.45, metal=0.2),
         'globe': L.flat('wz_lamp_lens', '#f4f1e8', rough=0.3),
         'jun': L.pbr('ll_juniper', None, tint=(1, 1, 1), rough=0.9)}
    B.TEX = os.path.dirname(gen)
    jm = M['jun']; nt = jm.node_tree; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(gen); nt.links.new(tx.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
    pz, br, gr, g2, cb, so, st, po, gl, ju = (Mesh('ll_plaza', M['plaza'], tile=1.8), Mesh('ll_brick', M['brick'], tile=1.6), Mesh('ll_lawn', M['grass'], tile=2.6),
                                              Mesh('ll_lawn_rough', M['grass2'], tile=2.6), Mesh('ll_curbs', M['curb'], tile=0.7), Mesh('ll_soil', M['soil']),
                                              Mesh('ll_stone', M['stone'], tile=1.0), Mesh('ll_poles', M['pole'], tile=1.0), Mesh('ll_globes', M['globe'], tile=1.0),
                                              Mesh('ll_junipers', M['jun'], tile=1.2))

    def top(m, pts, y):   # 朝上的多邊形（pts＝[(x,z)…]，逆時針從上面看都可以：quad() 之後統一翻成朝上）
        vs = [m.bm.verts.new(g2b(x, y, z)) for (x, z) in pts]; f = m.bm.faces.new(vs); f.normal_update()
        if f.normal.z < 0: f.normal_flip()

    def arc_x(z):   # 草坪西緣（弧）：z=0 在 XLW、|z|=ZL 在 XARC
        R = (ZL * ZL + (XARC - XLW) ** 2) / (2 * (XARC - XLW)); cx = XLW + R
        return cx - math.sqrt(max(0.0, R * R - z * z))

    NA = 16; arcpts = [(arc_x(-ZL + 2 * ZL * k / NA), -ZL + 2 * ZL * k / NA) for k in range(NA + 1)]
    # ---- 草坪（一整片，西緣是弧）＋路緣 ----
    top(gr, arcpts + [(XLE, ZL), (XLE, -ZL)], Y_LAWN)
    for k in range(NA):   # 弧形路緣（12 cm 寬）
        (xa, za), (xb, zb) = arcpts[k], arcpts[k + 1]
        cb.quad([(xa - 0.12, Y_CURB, za), (xb - 0.12, Y_CURB, zb), (xb, Y_CURB, zb), (xa, Y_CURB, za)])
        cb.quad([(xa - 0.12, Y_PAVE, za), (xb - 0.12, Y_PAVE, zb), (xb - 0.12, Y_CURB, zb), (xa - 0.12, Y_CURB, za)])
    cb.box(XLE, XLE + 0.12, Y_PLAZA - 0.01, Y_CURB, -ZL, ZL)        # 草坪東端（接廣場）
    # ---- 籬笆底下、籬笆外的草地（|z| 10～15）----
    for s in (-1, 1):
        za, zb = sorted((s * ZL, s * GZ1))
        top(g2, [(XARC, za), (XARC, zb), (XLE, zb), (XLE, za)], Y_LAWN - 0.004)
        cb.box(XARC, XLE, Y_PAVE - 0.01, Y_CURB, *sorted((s * GZ1, s * (GZ1 + 0.12))))     # 草地和步道之間的路緣
        cb.box(XARC - 0.12, XARC, Y_PAVE - 0.01, Y_CURB, *sorted((s * ZL, s * (GZ1 + 0.12))))
    # ---- 紅磚：大道盡頭的弧形步道（x 35～弧）＋兩側步道（|z| 15～19）----
    # 凹多邊形拆成三塊：北、中（弧的西側）、南
    top(br, [(XA, -PZ1), (XA, -ZL), (XARC, -ZL), (XARC, -PZ1)], Y_PAVE)
    top(br, [(XA, ZL), (XA, PZ1), (XARC, PZ1), (XARC, ZL)], Y_PAVE)
    for k in range(NA):
        (xa, za), (xb, zb) = arcpts[k], arcpts[k + 1]
        top(br, [(XA, za), (XA, zb), (xb - 0.12, zb), (xa - 0.12, za)], Y_PAVE)
    for s in (-1, 1):
        za, zb = sorted((s * (GZ1 + 0.12), s * PZ1))
        top(br, [(XARC, za), (XARC, zb), (XP0, zb), (XP0, za)], Y_PAVE)
    # ---- 廣場（淺色花崗石）----
    top(pz, [(XP0 + 0.12, -ZP), (XP0 + 0.12, ZP), (XP1, ZP), (XP1, -ZP)], Y_PLAZA)
    for s in (-1, 1):   # 廣場西緣那一條（x XP0～XP0+0.12、|z| 10～30：草坪路緣外到廣場角）
        za, zb = sorted((s * ZL, s * ZP)); top(pz, [(XP0, za), (XP0, zb), (XP0 + 0.12, zb), (XP0 + 0.12, za)], Y_PLAZA)
    # ---- 樹下一圈土 ----
    for name, (x, z, r) in TREES.items():
        n = 20; so.quad(list(reversed([(x + r * math.cos(2 * math.pi * k / n), Y_PLAZA + 0.004, z + r * math.sin(2 * math.pi * k / n)) for k in range(n)])))
        for k in range(n):   # 一圈花崗石收邊
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
            cb.quad([(x + r * math.cos(a0), Y_CURB, z + r * math.sin(a0)), (x + (r + 0.15) * math.cos(a0), Y_CURB, z + (r + 0.15) * math.sin(a0)),
                     (x + (r + 0.15) * math.cos(a1), Y_CURB, z + (r + 0.15) * math.sin(a1)), (x + r * math.cos(a1), Y_CURB, z + r * math.sin(a1))])
    # ---- 龍柏籬：一棵一棵的尖圓錐（旋轉體），擠在一起 ----
    rnd = random.Random(11)
    # 尖圓錐（照片：一棵一棵修成尖頂、下面胖，擠在一起成一道牆）；表面一點一點凹凸（11-02 第一版是光滑的蛋形，一顆一顆分開）
    prof = [(0.62, 0.0), (0.92, 0.35), (0.96, 0.85), (0.86, 1.45), (0.66, 2.05), (0.42, 2.6), (0.18, 3.05), (0.0, 3.3)]
    base_bm = L.lathe(prof, seg=12)
    nrnd = random.Random(5)
    for v in base_bm.verts:
        r_ = math.hypot(v.co.x, v.co.y)
        if r_ > 1e-4:
            k = 1.0 + nrnd.uniform(-0.09, 0.09); v.co.x *= k; v.co.y *= k
        v.co.z += nrnd.uniform(-0.05, 0.05) if 0.1 < v.co.z < 3.2 else 0.0
    n_j = 0
    for s in (-1, 1):
        x = HX0 + 0.45
        while x < HX1 - 0.3:
            k = rnd.uniform(0.86, 1.08); kh = rnd.uniform(0.9, 1.08)
            mtx = (L.Matrix.Translation(g2b(x, -0.05, s * (HZ0 + HZ1) / 2 + rnd.uniform(-0.12, 0.12))) @ L.Matrix.Rotation(rnd.uniform(0, 6.28), 4, 'Z')
                   @ L.Matrix.Diagonal((k, k * rnd.uniform(0.9, 1.0), kh, 1.0)))
            ju.add_bm(base_bm, mtx); n_j += 1
            x += rnd.uniform(0.86, 1.0)
    base_bm.free()
    # 籬笆兩頭各一棵比較矮的（照片 1：籬笆的頭是圓的）
    # ---- 花台上的灌木（總圖台階兩旁，花台頂 1.5）----
    for (x0, x1, a0, a1) in PLANTERS:
        for s in (-1, 1):
            za, zb = sorted((s * a0, s * a1)); z = za + 0.35
            while z < zb - 0.35:
                k = rnd.uniform(0.9, 1.1)
                ju.ell(((x0 + x1) / 2 + rnd.uniform(-0.1, 0.1), 1.5 + 0.28 * k, z), 0.95, 0.42 * k, 0.62, seg=10, rings=5); z += rnd.uniform(0.95, 1.15)
    # ---- 白色石墩（草坪西端兩角）----
    for (x, z) in CUBES: st.box(x - 0.45, x + 0.45, 0.0, 0.9, z - 0.45, z + 0.45)
    # ---- 白色球形路燈（柱 3.4 m、球形燈罩直徑 0.46）＋光暈的空節點 ----
    for i, (x, z) in enumerate(LAMPS):
        po.cyl((x, 0.0, z), (x, 0.42, z), 0.16, seg=10, r2=0.12)               # 柱座
        po.cyl((x, 0.42, z), (x, 3.25, z), 0.065, seg=10, r2=0.05)             # 燈柱
        po.cyl((x, 3.25, z), (x, 3.38, z), 0.09, seg=10, r2=0.11)              # 燈罩座
        gl.sphere((x, 3.6, z), 0.23, seg=14, rings=8)
        e = bpy.data.objects.new(f'GLOW_lib_lamp_{i}', None); e.location = g2b(x, 3.6, z); e.parent = root
        e['glow'] = 'rgba(255,236,200,0.9)'; e['size'] = 1.6; e['day'] = 0.0; e['night'] = 1.0; bpy.context.scene.collection.objects.link(e)
    for m, uv in ((pz, True), (br, True), (gr, True), (g2, True), (cb, True), (so, False), (st, True), (po, True), (gl, True), (ju, True)):
        m.finish(root, uv=uv, smooth=(m is ju or m is gl))
    e = bpy.data.objects.new('XMAS_TREE_SPOT', None); e.location = g2b(XMAS[0], 0.0, XMAS[1]); e.parent = root
    e['note'] = '十二月的聖誕樹：廣場北半邊（不擋台階、不擋草坪）。模型還沒做，劇情要的時候遊戲在這個位置放'; bpy.context.scene.collection.objects.link(e)
    info = L.export(out, gpu_instances=False)
    info['layout'] = {'avenue_end': XA, 'lawn': [XLW, XLE, -ZL, ZL], 'lawn_arc_ends_x': XARC, 'hedges': [HX0, HX1, HZ0, HZ1], 'grass_strip': [XARC, XLE, ZL, GZ1],
                      'paths': [XARC, XP0, GZ1, PZ1], 'plaza': [XP0, XP1, -ZP, ZP], 'trees': TREES, 'lamps': LAMPS, 'benches': BENCHES, 'cubes': CUBES, 'palms': PALMS,
                      'planters': PLANTERS, 'xmas': XMAS, 'junipers': n_j, 'heights': {'pave': Y_PAVE, 'plaza': Y_PLAZA, 'lawn': Y_LAWN, 'curb': Y_CURB}}
    info['note'] = '總圖前草坪第二版（LIB-FRONT-1102）：地面、草坪、路緣、龍柏籬、花台灌木、白色石墩、白色球形路燈；樹、長椅、大王椰子由遊戲放（patch）'
    L.write_json(out[:-4] + '.json', info)
    return info


build()
