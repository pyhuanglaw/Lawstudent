"""臺大校門（整座）→ assets/models/env/second_ai/campus_gate.glb（**校門自己的座標**：和套件 CK.gate 一樣，門的中線在 z=0、校外是 +z、地面 y=0；
校園 placeGate(…,-124,0,-π/2)、公館 placeGate(…,0,-46,0) 兩邊放同一個）。LAWWW2-C 2026-10-18（ART-EXT-GATE；使用者 10-18 03:3x「四座全部改」）：
  /opt/blenv/bin/python tools/blender/env_second/campus_gate.py [-- --layout real|game] [--out 輸出.glb]

查到的真實資料（只有文字：臺大訪客中心、台北旅遊網的搜尋摘要；沙盒打不開網站、沒有照片）：
  1931 年 3 月 31 日落成（市定古蹟「臺灣大學校門」）；磚造加石材；**門房在正中間**，人、車從兩側進出；
  基礎和四座燈柱是北投唭哩岸一帶採的石材；磚的顏色和臺北帝國大學的建築一致。屋頂、尺寸、窗的樣子查不到 → 照 1930 年代台大建築的語彙推測（文件寫「推測」）。
--layout real（預設）：照真的配置——門房在中間、兩側各一條通道（約 4.5 m）、四座燈柱、兩端短的矮牆接區域的圍牆。**要改導航**（patch 附給 LAWWW-C）。
--layout game：照遊戲現在 CK.gate 的配置——中間 8.4 m 開口、兩根門柱（x=±4.9）、矮牆到 x=±10、門房在校內旁邊 (7.6, −3.4)；導航不用改。
材質名稱沿用校園地標的約定（zones3d.js attachWenzhouModel）：ck_wall（面磚）、ck_trim（切石）、ck_stone_base、ck_glass、ck_frame、wz_lamp_lens；
招牌 PLATE_FACE_*（遊戲用 canvas 畫字：石材匾額樣式）；燈的光暈 GLOW_* 空節點。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy, g2b   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
LAYOUT = arg('--layout', 'real')
OUT = arg('--out', 'assets/models/env/second_ai/campus_gate.glb' if LAYOUT == 'real' else 'assets/models/env/second_ai/campus_gate_game.glb')
BRICK, STONE, IRON = '#8a5642', '#bfb29a', '#24262a'
WALL_END = 10.0                      # 矮牆接到區域圍牆的地方（套件也是 |x|=10）

if LAYOUT == 'real':
    HOUSE = dict(x0=-1.7, x1=1.7, z0=-2.7, z1=2.1, h=3.5)           # 門房（正中間；校外那面 z=+2.1）
    PILLARS = [-8.1, -2.45, 2.45, 8.1]                               # 四座燈柱（中心 x；z=0）
    GATES = [(-7.55, -1), (-3.0, 1), (3.0, -1), (7.55, 1)]           # 鐵門：(鉸鏈 x, 往哪邊收)；往校內打開、靠在燈柱旁
    WALLS = [(-WALL_END, -8.6), (8.6, WALL_END)]
    PLATE_ON = 'house'
else:
    HOUSE = dict(x0=7.6 - 1.8, x1=7.6 + 1.8, z0=-3.4 - 1.5, z1=-3.4 + 1.5, h=2.8)
    PILLARS = [-4.9, 4.9]
    GATES = [(-4.18, 1), (4.18, -1)]
    WALLS = [(-WALL_END, -5.6), (5.6, WALL_END)]
    PLATE_ON = 'walls'
PS = 0.86                                                            # 燈柱柱身寬
PH = 3.9                                                             # 柱身頂（和 campuskit3d.js 的 GATE.PH 一樣）
GLOW = []


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('campus_gate', props={'kind': 'campus_gate', 'layout': LAYOUT})
    M = {
        'wall': L.pbr('ck_wall', 'exterior_wall_cladding_02', tile=2.0, target=BRICK, normal=0.8, maps=('diff', 'nor'), rough_value=0.88),
        'trim': L.pbr('ck_trim', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=STONE, normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#8f8a82', maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'frame': L.flat('ck_frame', '#3c2d23', rough=0.6),
        'glass': L.vc_material('ck_glass', rough=0.12),
        'misc': L.vc_material('gt_misc', rough=0.5),
        'lamp': L.flat('wz_lamp_lens', '#f3ead6', rough=0.4),
        'board': L.flat('ck_board', '#d8d0c0', rough=0.8),
    }
    M['trimw'] = M['trim']
    K.setup_glass(M['glass'])
    accs = {}; VC = ('glass', 'misc'); plates = []
    kit = K.Kit(M, accs, 'gt_', place=(0.0, 0.0, 0.0), vc=VC)

    def plate(name, fr, u0, u1, v0, v1, d, props):
        m = Mesh(name, M['board']); kit.face(m, [fr.p(u0, v0, d), fr.p(u1, v0, d), fr.p(u1, v1, d), fr.p(u0, v1, d)], fr.N); plates.append((m, props))

    # ================= 燈柱（唭哩岸石：柱礎、一段一段的石材柱身、出挑的柱帽、鑄鐵燈籠） =================
    def pillar(x):
        b = 1.12; kit.box('base', x - b / 2, x + b / 2, 0.0, 0.55, -b / 2, b / 2, skip=('bottom',))                         # 柱礎（花崗石）
        kit.box('trim', x - 0.53, x + 0.53, 0.55, 0.7, -0.53, 0.53, skip=('bottom',))                                       # 收頭
        h = PS / 2; y = 0.7; k = 0
        while y < PH - 0.01:                                                                                                  # 柱身：每段 0.55 m，段與段之間內凹 1 cm 的灰縫（不是平的一根方柱）
            y1 = min(PH, y + 0.55); e = 0.0 if k % 2 == 0 else 0.012
            kit.box('trim', x - h - e, x + h + e, y + 0.012, y1, -h - e, h + e, skip=('bottom', 'top') if y1 < PH else ('bottom',))
            kit.box('trim', x - h + 0.015, x + h - 0.015, y, y + 0.012, -h + 0.015, h - 0.015, skip=('bottom', 'top'))
            y = y1; k += 1
        for (s, t, w) in ((0.0, 0.14, 0.5), (0.14, 0.32, 0.6), (0.32, 0.42, 0.5)):                                         # 柱帽：三層出挑
            kit.box('trim', x - w, x + w, PH + s, PH + t, -w, w, skip=('bottom',) if s > 0 else ())
        yb = PH + 0.42
        kit.box('misc', x - 0.12, x + 0.12, yb, yb + 0.22, -0.12, 0.12, skip=('bottom',), col=IRON)                           # 燈座
        y0, y1 = yb + 0.22, yb + 0.86; r = 0.2
        for (a, b2) in (((-r, -r), (r, -r)), ((r, -r), (r, r)), ((r, r), (-r, r)), ((-r, r), (-r, -r))):                    # 燈籠：四面乳白玻璃＋鑄鐵框
            kit.face('lamp', [(x + a[0] * 0.9, y0 + 0.05, a[1] * 0.9), (x + b2[0] * 0.9, y0 + 0.05, b2[1] * 0.9), (x + b2[0] * 0.9, y1 - 0.05, b2[1] * 0.9), (x + a[0] * 0.9, y1 - 0.05, a[1] * 0.9)],
                     (a[0] + b2[0], 0, a[1] + b2[1]))
        for (cx, cz) in ((-r, -r), (r, -r), (r, r), (-r, r)):
            kit.box('misc', x + cx - 0.025, x + cx + 0.025, y0, y1, cz - 0.025, cz + 0.025, col=IRON)
        kit.box('misc', x - r - 0.03, x + r + 0.03, y0 - 0.03, y0 + 0.05, -r - 0.03, r + 0.03, col=IRON)
        yr = y1; R = r + 0.1
        for (a, b2) in (((-R, -R), (R, -R)), ((R, -R), (R, R)), ((R, R), (-R, R)), ((-R, R), (-R, -R))):                    # 燈籠的四坡頂＋頂上的小球
            kit.cface('misc', [(x + a[0], yr, a[1]), (x + b2[0], yr, b2[1]), (x, yr + 0.26, 0.0)], (a[0] + b2[0], 0.6, a[1] + b2[1]), IRON)
        kit.box('misc', x - 0.035, x + 0.035, yr + 0.24, yr + 0.36, -0.035, 0.035, col=IRON)
        GLOW.append((x, (y0 + y1) / 2, 0.0))

    for x in PILLARS: pillar(x)

    # ================= 矮牆（面磚、石材壓頂、花崗石勒腳；兩端接區域的圍牆） =================
    for (a, b2) in WALLS:
        kit.box('base', a, b2, 0.0, 0.4, -0.35, 0.35, skip=('bottom',) + (('left',) if a <= -WALL_END + 1e-6 else ()) + (('right',) if b2 >= WALL_END - 1e-6 else ()))
        kit.box('wall', a, b2, 0.4, 1.85, -0.3, 0.3, skip=('bottom', 'top') + (('left',) if a <= -WALL_END + 1e-6 else ()) + (('right',) if b2 >= WALL_END - 1e-6 else ()))
        kit.box('trim', a, b2, 1.85, 2.0, -0.37, 0.37, skip=('bottom',) + (('left',) if a <= -WALL_END + 1e-6 else ()) + (('right',) if b2 >= WALL_END - 1e-6 else ()))

    # ================= 門房（面磚牆、石材轉角石、腰帶、簷口、平屋頂女兒牆；窗朝兩邊的通道，門在校內那面） =================
    H = HOUSE; x0, x1, z0, z1, hh = H['x0'], H['x1'], H['z0'], H['z1'], H['h']; W_, D_ = x1 - x0, z1 - z0; cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    Fc = K.faces4(W_, D_, cx, cz)
    for k in Fc:
        fr = Fc[k]; span = D_ if k in ('left', 'right') else W_
        holes = []
        if k in ('left', 'right'):
            for u in (-span / 4, span / 4): holes.append(kit.window(fr, u, 1.0, 0.8, 1.3, 0.12, K.lit_hash(31, ord(k[0]), u), dep=0.2, proud=0.05, mull=[0.0], transom=0.95))
        elif k == 'back':                                                                                         # 校內那面：門＋小窗
            holes.append(kit.window(fr, -0.55, 0.12, 0.9, 2.15, 0.14, False, dep=0.18, proud=0.05, door=True))
            kit.rect('frame', fr, -0.55 - 0.45, -0.55 + 0.45, 0.12, 2.27, -0.17)
            holes.append(kit.window(fr, 0.85, 1.05, 0.7, 1.0, 0.12, K.lit_hash(32, 1), dep=0.2, proud=0.05, mull=[]))
        else:                                                                                                     # 校外那面：一扇小窗（名牌在上面）
            holes.append(kit.window(fr, 0.0, 1.05, 0.7, 1.0, 0.12, K.lit_hash(33, 1), dep=0.2, proud=0.05, mull=[]))
        kit.wall_strip(fr, -span / 2, span / 2, 0.55, 2.75, holes)
        kit.wall_strip(fr, -span / 2, span / 2, 2.95, hh, [])
        kit.fbox('base', fr, -span / 2 - 0.05, span / 2 + 0.05, 0.0, 0.55, 0.0, 0.06, skip=('in', 'bottom'))        # 勒腳
        kit.fbox('trim', fr, -span / 2 - 0.04, span / 2 + 0.04, 2.75, 2.95, 0.0, 0.07, skip=('in',))               # 腰帶（窗頂的高度）
        for s in (-1, 1):                                                                                          # 轉角石（大小交錯）
            y = 0.55; k2 = 0
            while y < hh - 0.05:
                y1 = min(hh, y + 0.42); w = 0.38 if k2 % 2 == 0 else 0.24
                ua, ub = (span / 2 - w, span / 2) if s > 0 else (-span / 2, -span / 2 + w)
                if not (2.75 <= y < 2.95): kit.fbox('trim', fr, ua, ub, y + 0.01, y1 - 0.01, 0.0, 0.03, skip=('in',))
                y = y1; k2 += 1
    for (y0_, y1_, ov) in ((hh, hh + 0.12, 0.12), (hh + 0.12, hh + 0.24, 0.2)):           # 簷口：兩層出挑
        kit.box('trim', x0 - ov, x1 + ov, y0_, y1_, z0 - ov, z1 + ov)
    PAR = 0.55; t = 0.2
    kit.box('wall', x0, x1, hh + 0.24, hh + 0.24 + PAR, z1 - t, z1, skip=('bottom', 'top', 'left', 'right'))       # 女兒牆
    kit.box('wall', x0, x1, hh + 0.24, hh + 0.24 + PAR, z0, z0 + t, skip=('bottom', 'top', 'left', 'right'))
    kit.box('wall', x0, x0 + t, hh + 0.24, hh + 0.24 + PAR, z0 + t, z1 - t, skip=('bottom', 'top', 'front', 'back'))
    kit.box('wall', x1 - t, x1, hh + 0.24, hh + 0.24 + PAR, z0 + t, z1 - t, skip=('bottom', 'top', 'front', 'back'))
    for (a, b2, c0, c1) in ((x0 - 0.04, x1 + 0.04, z1 - t - 0.04, z1 + 0.04), (x0 - 0.04, x1 + 0.04, z0 - 0.04, z0 + t + 0.04)):
        kit.box('trim', a, b2, hh + 0.24 + PAR, hh + 0.36 + PAR, c0, c1, skip=('bottom',))
    for (a, b2) in ((x0 - 0.04, x0 + t + 0.04), (x1 - t - 0.04, x1 + 0.04)):
        kit.box('trim', a, b2, hh + 0.24 + PAR, hh + 0.36 + PAR, z0 + t + 0.04, z1 - t - 0.04, skip=('bottom', 'front', 'back'))
    kit.box('misc', x0 + t, x1 - t, hh + 0.24, hh + 0.26, z0 + t, z1 - t, skip=('bottom',), col='#6a6660')            # 屋頂面
    kit.box('trim', x0 + W_ / 2 - 0.5, x0 + W_ / 2 + 0.5, hh + 0.26, hh + 0.5, z0 + 0.6, z0 + 1.2, skip=('bottom',))   # 屋頂上的小水箱座（石材）
    # 名牌：門房校外那面（real）／兩側矮牆（game，和套件一樣：校外在 +x 那段、校內在 −x 那段）
    if PLATE_ON == 'house':
        PF = K.Fr((cx, 0, z1), (1, 0, 0), (0, 0, 1))
        kit.fbox('trim', PF, -1.35, 1.35, 2.08, 2.66, 0.0, 0.06, skip=('in',))
        plate('PLATE_FACE_GATE_OUT', PF, -1.25, 1.25, 2.13, 2.61, 0.062, {'text': '首都帝國大學', 'bg': '#e6e0d2', 'color': '#3a2f28', 'serif': 1, 'fs': 0.72})
    else:
        for (sx, zs) in ((1, 1), (-1, -1)):
            x = sx * 7.8; PF = K.Fr((x, 0, zs * 0.3), (zs, 0, 0), (0, 0, zs))
            kit.fbox('trim', PF, -1.55, 1.55, 0.78, 1.72, 0.0, 0.06, skip=('in',))
            plate(f'PLATE_FACE_GATE_{"OUT" if zs > 0 else "IN"}', PF, -1.45, 1.45, 0.86, 1.64, 0.062, {'text': '首都帝國大學', 'bg': '#e6e0d2', 'color': '#3a2f28', 'serif': 1, 'fs': 0.72})
    # 門房門口的吸頂燈（校內那面，門上方）
    kit.box('lamp', cx - 0.55 - 0.14, cx - 0.55 + 0.14, 2.5, 2.62, z0 - 0.14, z0 - 0.02, col=None)

    # ================= 鐵門（白天開著：往校內打開、靠在燈柱旁；鑄鐵直條＋上下橫條＋頂上尖頭） =================
    for (hx, s) in GATES:
        Lg = 2.15 if LAYOUT == 'real' else 2.0; hg = 2.25; x = hx
        for y in (0.12, hg * 0.5, hg - 0.05): kit.box('misc', x - 0.03, x + 0.03, y, y + 0.06, -Lg - 0.05, -0.05, col=IRON)
        n = 13
        for k in range(n + 1):
            z = -0.05 - (Lg - 0.05) * k / n; top = hg + (0.18 if k % 2 == 0 else 0.1)
            kit.box('misc', x - 0.018, x + 0.018, 0.08, top, z - 0.018, z + 0.018, skip=('bottom',), col=IRON)
            kit.cface('misc', [(x, top, z - 0.035), (x, top, z + 0.035), (x, top + 0.09, z)], (1, 0, 0), IRON)
            kit.cface('misc', [(x, top, z + 0.035), (x, top, z - 0.035), (x, top + 0.09, z)], (-1, 0, 0), IRON)

    # ================= 完成 =================
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    for i, (x, y, z) in enumerate(GLOW):
        e = B.group(f'GLOW_gate_lamp_{i}', root, {'glow': '#ffe2a8', 'size': 1.5, 'day': 0.0, 'night': 0.9}); e.location = g2b(x, y, z)
    VCM = L.vc_material('wz_vc_gt', rough=0.55)
    L.vc_consolidate(root, {n: VCM for n in ('gt_misc', 'ck_ceiling', 'ck_frame')})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    info['note'] = f'layout={LAYOUT}；依文字資料的遊戲化設計（沒有照片；1931、門房在中間、四座唭哩岸石燈柱、磚＋石材）'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
