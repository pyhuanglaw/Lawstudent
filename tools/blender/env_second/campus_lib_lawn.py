"""總圖前草皮（X133 LIB-LAWN-1030，第一版；LAWWW2-B 2026-10-30）→ assets/models/env/second_ai/campus_lib_lawn.glb（校園世界座標）。
  /opt/blenv/bin/python tools/blender/env_second/campus_lib_lawn.py [-- --out …]
規劃稿 docs/art-rebuild/second_ai/test_shots/lib_lawn_plan_1030/（LAWWW-B 10-30 核准第一版：中軸兩邊各一塊草皮、不做台階、老樟樹在北側草皮）。
取代 src/zones3d.js campus 的「總圖前廣場」：ground(g,17,36,stoneTex('#e3d9c6'),…,78.5,0)＝x 70～87、z −18～18 一整片石板。

總圖的位置（從 campus_library.glb 量的，地面 1.2 m 以下）：正面中段 |z|<9 的門廊從 x 82.8 開始、9≤|z|≤12 的台座到 x 81.9，|z|>12 的外牆在 x 86.95。
配置（北半邊；南半邊對稱）：
  - 中軸：z −5～5，從椰林大道盡頭 x 70 直通門廊；門廊前的前庭 x 79.4～81.9（|z|≤12）、x 81.9～82.8（|z|<9）。大塊淺色砂岩鋪面，兩邊一條花崗石收邊。
  - 草皮：L 形，主塊 x 71.4～78.0、z −16.6～−6.4，東側一條 x 78.0～85.4、z −13.6～−16.6 包著總圖的轉角。花崗石低路緣（高 7 cm）。
    草皮面高 4.5 cm（導航是平的，人走上去腳只陷 4.5 cm＝草的高度）。走得到、坐得到。
  - 其他地方：紅磚步道（台大校園的步道），草皮外一圈。
  - 北側草皮中間偏西：老樟樹的樹下一圈土（樹本身是遊戲的 TK.tree 樟樹，和法律系館A 前的大樟樹同一套；patch 放）。南側草皮：中型的樹，同樣一圈土。
  - 長椅、路燈：遊戲共用的 W3.bench()（正式長椅模型）、W3.lampPost()（燈頭位置、夜間光圈已經調好），patch 放。
  - 聖誕樹：模型不做；這裡只留一個空節點 XMAS_TREE_SPOT（前庭北側），劇情要的時候遊戲在這個位置放。
材質：Poly Haven CC0（large_sandstone_blocks、brick_pavement_04、grass_ground、granite_tile；tools/blender/env_second/textures/）。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/campus_lib_lawn.glb'

X0, XW = 70.0, 86.95                       # 廣場西緣（椰林大道盡頭）、總圖外牆（|z|>12）
ZMAX = 18.0                                # 廣場南北邊（原本的石板 z ±18）
AX = 5.0                                   # 中軸半寬
FC0, FC1, FC2 = 79.4, 81.9, 82.8           # 前庭西緣、台座（9≤|z|≤12）、門廊（|z|<9）
LAWN_MAIN = (71.4, 78.0, 6.4, 16.6)        # 草皮主塊 x0, x1, |z|0, |z|1
LAWN_WING = (78.0, 85.4, 13.6, 16.6)       # 東側一條（包著總圖轉角）
CURB = 0.15
Y_PAVE, Y_AXIS, Y_LAWN, Y_CURB = 0.022, 0.027, 0.045, 0.07
TREES = {'camphor': (74.2, -11.6, 1.7), 'south': (74.7, 11.6, 1.1)}   # 樹下一圈土（x, z, 半徑）；樹由 patch 放在同一個位置
LAMPS = [(70.8, -5.75, 0.0), (70.8, 5.75, math.pi), (79.0, -5.75, 0.0), (79.0, 5.75, math.pi), (75.0, -17.3, 0.0), (75.0, 17.3, math.pi)]   # (x, z, yaw)：燈臂朝 +z（yaw 0）伸到中軸／草皮那一側
BENCHES = [(x, s * 5.75, 0.0 if s < 0 else math.pi) for s in (-1, 1) for x in (72.6, 75.0, 77.4)]   # 面向中軸（長椅正面朝 +z＝yaw 0）
XMAS = (80.6, -8.2)


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('campus_lib_lawn', props={'kind': 'campus_lib_lawn'})
    M = {'axis': L.pbr('ll_axis_stone', 'large_sandstone_blocks', tile=2.4, target='#cdc4b2', contrast=0.85, normal=0.45, maps=('diff', 'nor'), rough_value=0.82),
         'brick': L.pbr('ll_brick_paver', 'brick_pavement_04', tile=1.6, target='#9a5743', contrast=1.0, normal=0.45, maps=('diff', 'nor'), rough_value=0.86),
         'grass': L.pbr('ll_lawn', 'grass_ground', tile=2.6, target='#5f7e3d', contrast=1.05, normal=0.35, maps=('diff', 'nor'), rough_value=0.96),
         'curb': L.pbr('ll_curb_granite', 'granite_tile', tile=0.7, target='#aaa59b', contrast=0.9, maps=('diff',), res=256, rough_value=0.8),
         'soil': L.flat('ll_tree_soil', '#4d3f31', rough=1.0)}
    ax, br, gr, cb, so = (Mesh('ll_axis', M['axis'], tile=2.4), Mesh('ll_brick', M['brick'], tile=1.6), Mesh('ll_lawn', M['grass'], tile=2.6),
                          Mesh('ll_curbs', M['curb'], tile=0.7), Mesh('ll_soil', M['soil']))

    def top(m, x0, x1, z0, z1, y):   # 朝上的一片（地面只要上面那一面）
        m.quad([(x0, y, z0), (x0, y, z1), (x1, y, z1), (x1, y, z0)])

    # ---- 中軸＋前庭（砂岩）----
    top(ax, X0, FC0, -AX, AX, Y_AXIS)
    top(ax, FC0, FC1, -12.0, 12.0, Y_AXIS)
    top(ax, FC1, FC2, -9.0, 9.0, Y_AXIS)
    for s in (-1, 1):   # 中軸兩邊的花崗石收邊（12 cm 寬、高出 1 cm）
        z = s * AX
        cb.box(X0, FC0, Y_AXIS - 0.01, Y_AXIS + 0.01, min(z, z + s * 0.12), max(z, z + s * 0.12))
    # ---- 紅磚步道（中軸、前庭以外的地方）＋草皮＋路緣 ----
    for s in (-1, 1):
        def zr(a, b): return (min(s * a, s * b), max(s * a, s * b))
        za, zb = zr(AX + 0.12, ZMAX); top(br, X0, FC0, za, zb, Y_PAVE)        # 前庭西側
        za, zb = zr(12.0, ZMAX); top(br, FC0, XW, za, zb, Y_PAVE)             # 總圖轉角（|z|>12）
        for (x0, x1, a0, a1) in (LAWN_MAIN, LAWN_WING):
            z0, z1 = zr(a0, a1)
            top(gr, x0, x1, z0, z1, Y_LAWN)   # 草皮的邊被路緣（比草皮高 2.5 cm）蓋住，不用側面
        # 路緣：主塊和東側那條合起來的 L 形外框（路緣在草皮外面，壓住草皮邊）
        m0, m1, ma, mb = LAWN_MAIN; w0, w1, wa, wb = LAWN_WING
        segs = [((m0 - CURB, m1 + CURB), (ma - CURB, ma)),            # 靠中軸那邊（主塊）
                ((m0 - CURB, w1 + CURB), (mb, mb + CURB)),            # 外側（主塊＋東側那條一起）
                ((m1, w1 + CURB), (wa - CURB, wa)),                   # 東側那條靠前庭那邊
                ((w1, w1 + CURB), (wa - CURB, mb + CURB))]            # 東端
        for (xa, xb), (a0, a1) in segs:
            z0, z1 = zr(a0, a1); cb.box(xa, xb, Y_PAVE - 0.01, Y_CURB, z0, z1)
        for (xa, xb) in ((m0 - CURB, m0), (m1, m1 + CURB)):           # 主塊的西邊、東邊（東邊只到東側那條為止）
            a0, a1 = (ma - CURB, mb + CURB) if xa < m0 else (ma - CURB, wa)
            z0, z1 = zr(a0, a1); cb.box(xa, xb, Y_PAVE - 0.01, Y_CURB, z0, z1)
    # ---- 樹下一圈土（草皮上；樹由遊戲放）----
    for name, (x, z, r) in TREES.items():
        n = 20; pts = [(x + r * math.cos(2 * math.pi * k / n), Y_LAWN + 0.004, z + r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        so.quad(list(reversed(pts)))
    for m, uv in ((ax, True), (br, True), (gr, True), (cb, True), (so, False)):
        m.finish(root, uv=uv)
    # ---- 聖誕樹的位置（空節點）----
    e = bpy.data.objects.new('XMAS_TREE_SPOT', None); e.location = g2b(XMAS[0], 0.0, XMAS[1]); e.parent = root
    e['note'] = '十二月的聖誕樹：前庭北側（不擋中軸、不擋門）。模型還沒做，劇情要的時候遊戲在這個位置放'; bpy.context.scene.collection.objects.link(e)
    info = L.export(out, gpu_instances=False)
    info['layout'] = {'axis_halfwidth': AX, 'plaza': [X0, XW, -ZMAX, ZMAX], 'forecourt': [FC0, FC1, FC2], 'lawn_main': LAWN_MAIN, 'lawn_wing': LAWN_WING,
                      'trees': TREES, 'lamps': LAMPS, 'benches': BENCHES, 'xmas': XMAS,
                      'heights': {'pave': Y_PAVE, 'axis': Y_AXIS, 'lawn': Y_LAWN, 'curb': Y_CURB}}
    info['note'] = '總圖前草皮第一版（X133）：地面、草皮、路緣、樹下的土；樹、長椅、路燈由遊戲放（patch）'
    L.write_json(out[:-4] + '.json', info)
    return info


build()
