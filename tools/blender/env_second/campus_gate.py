"""臺大校門（整座）→ assets/models/env/second_ai/campus_gate.glb（**校門自己的座標**：和套件 CK.gate 一樣，門的中線在 z=0、校外是 +z、地面 y=0；
校園 placeGate(…,-124,0,-π/2)、公館 placeGate(…,0,-46,0) 兩邊放同一個）。LAWWW2-C 2026-10-18（ART-EXT-GATE；使用者 10-18 03:3x「四座全部改」）：
  /opt/blenv/bin/python tools/blender/env_second/campus_gate.py [-- --layout real|game] [--out 輸出.glb]

查到的真實資料（只有文字：臺大訪客中心、台北旅遊網的搜尋摘要；沙盒打不開網站、沒有照片）：
  1931 年 3 月 31 日落成（市定古蹟「臺灣大學校門」）；磚造加石材；**門房在正中間**，人、車從兩側進出；
  基礎和四座燈柱是北投唭哩岸一帶採的石材；磚的顏色和臺北帝國大學的建築一致。屋頂、尺寸、窗的樣子查不到 → 照 1930 年代台大建築的語彙推測（文件寫「推測」）。
--layout real（預設）：照真的配置——門房在中間、兩側各一條通道（約 4.5 m）、四座燈柱、兩端短的矮牆接區域的圍牆。**要改導航**（patch 附給 LAWWW-C）。
--layout game：照遊戲現在 CK.gate 的配置——中間 8.4 m 開口、兩根門柱（x=±4.9）、矮牆到 x=±10、門房在校內旁邊 (7.6, −3.4)；導航不用改。
材質名稱沿用校園地標的約定（zones3d.js attachWenzhouModel）：ck_wall（面磚）、ck_trim（切石）、ck_stone_base、ck_glass、ck_frame、wz_lamp_lens；
招牌 PLATE_FACE_*（遊戲用 canvas 畫字：石材匾額樣式）；燈的光暈 GLOW_* 空節點。

**v2（GATE-REF-1114，LAWWW2-B 2026-11-14；使用者 11-14 給參考圖「學校裡的校門，請依照我的參考圖改」，圖在 docs/art-rebuild/second_ai/ref/gate_ref_1114.md 的描述）**：
  門房：切角（八角）的紅磚亭，石材勒腳、轉角石、石框木窗，上緣一圈石材簷帶＋正面階梯形匾額「首都帝國大學」，平屋頂、旗桿；
  門房前半圓花圃（石材緣石、紅花、修剪的綠籬，兩側往校內收）；只留外側兩座大石柱＋方燈，鐵門掛在外側石柱、往校內打開；
  兩端紅磚矮牆＋石材壓頂＋鑄鐵欄杆。門房加寬到 6 m（x ±3.0）、花圃到 x ±3.6、z 5.3：**要改導航**（campuskit3d.js GATE，patch 附給 LAWWW）。
  --layout game 這一版拿掉（沒有在用：manifest 只有 campus_gate.glb）。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, bpy, g2b   # noqa: E402
from cafe_layout import uv01   # noqa: E402
import archkit as K   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = arg('--out', 'assets/models/env/second_ai/campus_gate.glb')
BRICK, STONE, IRON = '#8a5642', '#bfb29a', '#24262a'
WALL_END = 10.0                      # 矮牆接到區域圍牆的地方（套件也是 |x|=10）

import random
from mathutils import Vector   # noqa: E402
HOUSE = dict(x0=-3.0, x1=3.0, z0=-2.6, z1=2.0, h=3.3, c=0.9)      # 門房（正中間，切角 c；校外那面 z=+2.0）
PILLARS = [-8.1, 8.1]                                              # 兩座大石柱（中心 x；z=0）
GATES = [(-7.5, -1), (7.5, 1)]                                      # 鐵門：鉸鏈 x；往校內打開
PIERS = [-8.95, 8.95]                                              # 石柱外側的小石墩（中心 x；0.6 m 見方、高 2.2 m；接矮牆）
WALLS = [(-WALL_END, -9.25), (9.25, WALL_END)]
HEDGE_BLOCKS = [(-3.9, -3.08), (3.08, 3.9)]                         # 門房兩側的方形綠籬塊（x 範圍；z −0.75～0.2、高 0.9）
PLANTER = dict(r=3.6, zc=1.7, zb=0.3, h=0.3)                       # 半圓花圃：圓心 (0, zc)、半徑 r，兩側直的往校內到 zb
PS, PH = 1.0, 3.3                                                  # 石柱柱身寬、柱身頂
RED = '#9c4a36'
GLOW = []
GEN = os.path.join(HERE, 'textures', 'gen')


def img_mat(name, fn, rough=0.8):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn)); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    m.use_backface_culling = True; m['tile'] = 0.8; return m


def sweep(mesh, path, prof, y0, seed, wob=0.05):
    """沿 path（[(x,z)…]）掃一個剖面 prof（[(往左的偏移, 高)…]）：修剪過的綠籬、花帶。兩端封口。"""
    rr = random.Random(seed); bm = mesh.bm; rings = []; n = len(path)
    for i, (x, z) in enumerate(path):
        a = path[max(0, i - 1)]; b = path[min(n - 1, i + 1)]; tx, tz = b[0] - a[0], b[1] - a[1]; tl = math.hypot(tx, tz) or 1.0; nx, nz = -tz / tl, tx / tl   # 往左的法線
        end = 0.8 if i in (0, n - 1) else 1.0; ring = []
        for (d, y) in prof:
            j = (1.0 + rr.uniform(-wob, wob)) if y > 0 else 1.0
            ring.append(bm.verts.new(g2b(x + nx * d * end, y0 + y * j * (end if y > 0 else 1), z + nz * d * end)))
        rings.append(ring)
    for p_, q_ in zip(rings, rings[1:]):
        for k in range(len(prof) - 1): bm.faces.new((p_[k], q_[k], q_[k + 1], p_[k + 1]))
    bm.faces.new(rings[0]); bm.faces.new(list(reversed(rings[-1])))


def build():
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=512)
    root = B.group('campus_gate', props={'kind': 'campus_gate', 'layout': 'real', 'version': 2, 'house': HOUSE, 'planter': PLANTER})
    M = {
        'wall': L.pbr('ck_wall', 'red_brick', tile=1.6, target=RED, normal=0.9, maps=('diff', 'nor'), rough_value=0.9),
        'trim': L.pbr('ck_trim', 'sandstone_blocks_08', tile=3.0, sat=0.45, target=STONE, normal=0.6, maps=('diff', 'nor'), res=512, rough_value=0.8),
        'base': L.pbr('ck_stone_base', 'granite_tile_03', tile=1.2, target='#a8a297', maps=('diff',), res=256, rough_value=0.7),
        'ceil': L.flat('ck_ceiling', '#e2dccf', rough=0.95),
        'frame': L.flat('ck_frame', '#4a2f22', rough=0.6),
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

    # ================= 大石柱（參考圖：米色大塊切石、出挑的柱帽、鑄鐵方燈） =================
    def pillar(x):
        b = PS + 0.24; kit.box('trim', x - b / 2, x + b / 2, 0.0, 0.45, -b / 2, b / 2, skip=('bottom',))                    # 柱礎（寬一圈）
        h = PS / 2; y = 0.45; k = 0
        while y < PH - 0.01:                                                                                                  # 柱身：一段 0.62 m 的大石塊，段與段之間內凹的石縫
            y1 = min(PH, y + 0.62)
            kit.box('trim', x - h, x + h, y + 0.015, y1, -h, h, skip=('bottom', 'top') if y1 < PH else ('bottom',))
            kit.box('trim', x - h + 0.02, x + h - 0.02, y, y + 0.015, -h + 0.02, h - 0.02, skip=('bottom', 'top'))
            y = y1; k += 1
        for (s, t, w) in ((0.0, 0.12, h + 0.06), (0.12, 0.3, h + 0.16), (0.3, 0.4, h + 0.06)):                              # 柱帽：三層出挑
            kit.box('trim', x - w, x + w, PH + s, PH + t, -w, w, skip=('bottom',) if s > 0 else ())
        yb = PH + 0.4
        kit.box('misc', x - 0.16, x + 0.16, yb, yb + 0.16, -0.16, 0.16, skip=('bottom',), col=IRON)                           # 燈座
        y0, y1 = yb + 0.16, yb + 0.86; r = 0.26
        for (a, b2) in (((-r, -r), (r, -r)), ((r, -r), (r, r)), ((r, r), (-r, r)), ((-r, r), (-r, -r))):                    # 方燈：四面乳白玻璃＋鑄鐵框
            kit.face('lamp', [(x + a[0] * 0.92, y0 + 0.05, a[1] * 0.92), (x + b2[0] * 0.92, y0 + 0.05, b2[1] * 0.92), (x + b2[0] * 0.92, y1 - 0.05, b2[1] * 0.92), (x + a[0] * 0.92, y1 - 0.05, a[1] * 0.92)],
                     (a[0] + b2[0], 0, a[1] + b2[1]))
            mx, mz = (a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2                                                                  # 每一面中間一根細直條
            kit.box('misc', x + mx - 0.012, x + mx + 0.012, y0, y1, mz - 0.012, mz + 0.012, col=IRON)
        for (cx_, cz_) in ((-r, -r), (r, -r), (r, r), (-r, r)):
            kit.box('misc', x + cx_ - 0.03, x + cx_ + 0.03, y0, y1, cz_ - 0.03, cz_ + 0.03, col=IRON)
        kit.box('misc', x - r - 0.04, x + r + 0.04, y0 - 0.03, y0 + 0.05, -r - 0.04, r + 0.04, col=IRON)
        yr = y1; R = r + 0.12
        kit.box('misc', x - R, x + R, yr, yr + 0.05, -R, R, col=IRON)
        for (a, b2) in (((-R, -R), (R, -R)), ((R, -R), (R, R)), ((R, R), (-R, R)), ((-R, R), (-R, -R))):                    # 燈的四坡頂＋頂上的小尖
            kit.cface('misc', [(x + a[0], yr + 0.05, a[1]), (x + b2[0], yr + 0.05, b2[1]), (x, yr + 0.34, 0.0)], (a[0] + b2[0], 0.6, a[1] + b2[1]), IRON)
        kit.box('misc', x - 0.035, x + 0.035, yr + 0.32, yr + 0.46, -0.035, 0.035, col=IRON)
        GLOW.append((x, (y0 + y1) / 2, 0.0))

    for x in PILLARS: pillar(x)

    # 石柱外側的小石墩（參考圖：比石柱矮一截、同樣一段一段的切石、平的石帽；矮牆接在它上面）
    for x in PIERS:
        h = 0.3; y = 0.0
        kit.box('trim', x - h - 0.05, x + h + 0.05, 0.0, 0.3, -h - 0.05, h + 0.05, skip=('bottom',))
        y = 0.3
        while y < 2.05 - 0.01:
            y1 = min(2.05, y + 0.58)
            kit.box('trim', x - h, x + h, y + 0.015, y1, -h, h, skip=('bottom', 'top'))
            kit.box('trim', x - h + 0.02, x + h - 0.02, y, y + 0.015, -h + 0.02, h - 0.02, skip=('bottom', 'top'))
            y = y1
        kit.box('trim', x - h - 0.06, x + h + 0.06, 2.05, 2.2, -h - 0.06, h + 0.06)

    # ================= 兩端：紅磚矮牆＋石材壓頂＋鑄鐵欄杆（接區域的圍牆） =================
    for (a, b2) in WALLS:
        ends = (('left',) if a <= -WALL_END + 1e-6 else ()) + (('right',) if b2 >= WALL_END - 1e-6 else ())
        kit.box('base', a, b2, 0.0, 0.22, -0.34, 0.34, skip=('bottom',) + ends)
        kit.box('wall', a, b2, 0.22, 0.95, -0.28, 0.28, skip=('bottom', 'top') + ends)
        kit.box('trim', a, b2, 0.95, 1.08, -0.34, 0.34, skip=('bottom',) + ends)
        for y in (1.2, 2.05): kit.box('misc', a, b2, y, y + 0.05, -0.025, 0.025, col=IRON)                                  # 欄杆：上下橫條＋直條＋尖頭
        n = max(2, int(round((b2 - a) / 0.15)))
        for k in range(1, n):
            x = a + (b2 - a) * k / n; top = 2.22 if k % 2 == 0 else 2.14
            kit.box('misc', x - 0.014, x + 0.014, 1.08, top, -0.014, 0.014, skip=('bottom',), col=IRON)

    # ================= 門房：切角的紅磚亭（石材勒腳、轉角石、石框木窗、石材簷帶、正面階梯形匾額、旗桿） =================
    H = HOUSE; x0, x1, z0, z1, hh, c = H['x0'], H['x1'], H['z0'], H['z1'], H['h'], H['c']
    P8 = [(x0 + c, z1), (x1 - c, z1), (x1, z1 - c), (x1, z0 + c), (x1 - c, z0), (x0 + c, z0), (x0, z0 + c), (x0, z1 - c)]   # 從正面左端順著走一圈（往外的法線在右手邊）
    BASE_H, BELT0, BELT1 = 0.5, 2.6, 3.12                                                                                  # 勒腳頂、簷帶底、簷帶頂
    T8 = math.tan(math.pi / 8)
    for i in range(8):
        p, q = P8[i], P8[(i + 1) % 8]; span = math.hypot(q[0] - p[0], q[1] - p[1]); R = ((q[0] - p[0]) / span, 0.0, (q[1] - p[1]) / span); N = (-R[2], 0.0, R[0])
        fr = K.Fr(((p[0] + q[0]) / 2, 0.0, (p[1] + q[1]) / 2), R, N); hs = span / 2; holes = []
        if i == 0:                                                                                                # 正面：兩扇石框木窗
            for u in (-1.15, 1.15):
                holes.append(kit.window(fr, u, 0.95, 0.9, 1.3, 0.14, K.lit_hash(41, u), dep=0.2, proud=0.06, mull=[0.0], transom=0.95))
                for (ua, ub) in ((u - 0.43, u - 0.13), (u + 0.13, u + 0.43)): kit.rect('ceil', fr, ua, ub, 0.97, 2.23, -0.19)   # 白窗簾：往兩邊拉開
        elif i in (2, 6):                                                                                         # 兩側（朝通道）：各一扇
            holes.append(kit.window(fr, 0.0, 0.95, 0.9, 1.3, 0.14, K.lit_hash(42, i), dep=0.2, proud=0.06, mull=[0.0], transom=0.95))
        elif i == 4:                                                                                              # 校內那面：門＋小窗
            holes.append(kit.window(fr, -0.75, 0.1, 0.9, 2.15, 0.14, False, dep=0.18, proud=0.05, door=True))
            kit.rect('frame', fr, -0.75 - 0.45, -0.75 + 0.45, 0.1, 2.25, -0.17)
            holes.append(kit.window(fr, 0.8, 1.05, 0.7, 1.1, 0.12, K.lit_hash(43, 1), dep=0.2, proud=0.05, mull=[]))
        kit.wall_strip(fr, -hs, hs, BASE_H, BELT0, holes)
        if i == 4: kit.wall_strip(fr, -0.75 - 0.59, -0.75 + 0.59, 0.0, BASE_H, [h_ for h_ in holes[:1]])           # 門下面那段勒腳挖掉門洞
        for (v0, v1, d, mk) in ((0.0, BASE_H, 0.07, 'base'), (BELT0, BELT1, 0.07, 'trim'), (BELT1, BELT1 + 0.16, 0.2, 'trim')):   # 勒腳、簷帶、簷口（出挑）
            e = d * T8
            if mk == 'base' and i == 4:
                kit.fbox(mk, fr, -hs - e, -0.75 - 0.59, v0, v1, 0.0, d, skip=('in', 'bottom')); kit.fbox(mk, fr, -0.75 + 0.59, hs + e, v0, v1, 0.0, d, skip=('in', 'bottom'))
            else: kit.fbox(mk, fr, -hs - e, hs + e, v0, v1, 0.0, d, skip=('in', 'bottom') if v0 == 0.0 else ('in',))
        kit.fbox('trim', fr, -hs - 0.02, hs + 0.02, BELT1 + 0.16, hh + 0.02, -0.26, 0.04, skip=('bottom',))             # 簷口上面一圈矮的石材女兒牆
        y = BASE_H; k2 = 0                                                                                        # 轉角石（大小交錯；每個面的兩端）
        while y < BELT0 - 0.05:
            y1 = min(BELT0, y + 0.41); w = 0.34 if k2 % 2 == 0 else 0.2
            if i % 2 == 0:
                for (ua, ub) in ((-hs, -hs + w), (hs - w, hs)): kit.fbox('trim', fr, ua, ub, y + 0.012, y1 - 0.012, 0.0, 0.035, skip=('in',))
            else:
                w2 = min(hs, w)
                for (ua, ub) in ((-hs, -hs + w2), (hs - w2, hs)): kit.fbox('trim', fr, ua, ub, y + 0.012, y1 - 0.012, 0.0, 0.035, skip=('in',))
            y = y1; k2 += 1
        if i in (1, 7):                                                                                           # 正面兩個切角上：監視器（小白盒）
            kit.fbox('misc', fr, -0.07, 0.07, 2.36, 2.48, 0.0, 0.2, skip=('in',), col='#e8e8e4'); kit.fbox('misc', fr, -0.05, 0.05, 2.29, 2.36, 0.14, 0.3, col='#d8d8d4')
    kit.cface('misc', [(px, BELT1 + 0.2, pz) for (px, pz) in reversed(P8)], (0, 1, 0), '#77726a')                           # 屋頂面
    # 正面的階梯形匾額（簷帶上面凸起一塊，再疊一塊小的）＋校名
    PF = K.Fr((0.0, 0.0, z1), (1, 0, 0), (0, 0, 1))
    kit.fbox('trim', PF, -1.95, 1.95, BELT0 + 0.02, hh + 0.42, -0.3, 0.11, skip=('bottom',))
    kit.fbox('trim', PF, -1.15, 1.15, hh + 0.42, hh + 0.6, -0.26, 0.09, skip=('bottom',))
    kit.fbox('trim', PF, -1.8, 1.8, BELT0 + 0.1, BELT0 + 0.16, 0.11, 0.14, skip=('in',)); kit.fbox('trim', PF, -1.8, 1.8, hh + 0.26, hh + 0.32, 0.11, 0.14, skip=('in',))   # 匾額上下的線腳
    plate('PLATE_FACE_GATE_OUT', PF, -1.7, 1.7, BELT0 + 0.2, hh + 0.22, 0.112, {'text': '首都帝國大學', 'bg': '#e6dfcf', 'color': '#3a2f28', 'serif': 1, 'fs': 0.7})
    for sx in (-1, 1):                                                                                            # 簷帶四個正角上凸起的石塊（參考圖：轉角比較高）
        for (ux, uz) in ((sx * (x1 - c * 0.5), z1 - c * 0.5), (sx * (x1 - c * 0.5), z0 + c * 0.5)):
            kit.box('trim', ux - 0.34, ux + 0.34, BELT1 + 0.16, hh + 0.22, uz - 0.34, uz + 0.34, skip=('bottom',))
    # 旗桿（屋頂正中間）
    kit.box('trim', -0.3, 0.3, BELT1 + 0.2, BELT1 + 0.5, -0.6, 0.0, skip=('bottom',))
    for k in range(6):
        a0, a1 = math.pi / 3 * k, math.pi / 3 * (k + 1); r = 0.045
        kit.cface('misc', [(r * math.cos(a0), BELT1 + 0.5, -0.3 + r * math.sin(a0)), (r * math.cos(a1), BELT1 + 0.5, -0.3 + r * math.sin(a1)), (r * 0.6 * math.cos(a1), 9.6, -0.3 + r * 0.6 * math.sin(a1)), (r * 0.6 * math.cos(a0), 9.6, -0.3 + r * 0.6 * math.sin(a0))],
                  (math.cos((a0 + a1) / 2), 0, math.sin((a0 + a1) / 2)), '#d6d6d2')
    kit.box('misc', -0.06, 0.06, 9.6, 9.72, -0.36, -0.24, col='#c9a24f')
    kit.box('lamp', -0.75 - 0.14, -0.75 + 0.14, 2.36, 2.48, z0 - 0.14, z0 - 0.02)                                           # 門房門口的吸頂燈（校內那面）

    # ================= 鐵門（白天開著：掛在外側石柱、往校內打開；下半實心鐵板、上半直條＋尖頭） =================
    for (hx, s) in GATES:
        Lg = 2.6; hg = 2.3; x = hx
        for y in (0.1, 0.92, hg - 0.05): kit.box('misc', x - 0.03, x + 0.03, y, y + 0.06, -Lg - 0.05, -0.05, col=IRON)
        kit.box('misc', x - 0.012, x + 0.012, 0.16, 0.92, -Lg - 0.02, -0.08, col='#2c2f33')                                    # 下半的鐵板
        for z in (-0.05, -Lg - 0.05): kit.box('misc', x - 0.035, x + 0.035, 0.05, hg + 0.12, z - 0.035, z + 0.035, col=IRON)  # 兩端的立框
        n = 15
        for k in range(1, n):
            z = -0.05 - Lg * k / n; top = hg + (0.2 if k % 2 == 0 else 0.1)
            kit.box('misc', x - 0.016, x + 0.016, 0.98, top, z - 0.016, z + 0.016, skip=('bottom',), col=IRON)
            kit.cface('misc', [(x, top, z - 0.032), (x, top, z + 0.032), (x, top + 0.09, z)], (1, 0, 0), IRON)
            kit.cface('misc', [(x, top, z + 0.032), (x, top, z - 0.032), (x, top + 0.09, z)], (-1, 0, 0), IRON)

    # ================= 門房前的半圓花圃（石材緣石；外圈紅花、裡圈修剪的綠籬；兩側直的往校內收） =================
    PL = PLANTER; r, zc, zb, ph = PL['r'], PL['zc'], PL['zb'], PL['h']; NA = 20

    def ring_path(rad):
        pts = [(rad, zb)] + [(rad * math.cos(math.pi * k / NA), zc + rad * math.sin(math.pi * k / NA)) for k in range(NA + 1)] + [(-rad, zb)]
        return pts
    out_p, in_p = ring_path(r), ring_path(r - 0.24)
    for k in range(len(out_p) - 1):                                                                              # 緣石：外側面、頂面、內側面
        a, b2, ai, bi = out_p[k], out_p[k + 1], in_p[k], in_p[k + 1]; nx, nz = (a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 - zc
        kit.face('base', [(a[0], 0.0, a[1]), (b2[0], 0.0, b2[1]), (b2[0], ph, b2[1]), (a[0], ph, a[1])], (nx, 0, nz))
        kit.face('base', [(a[0], ph, a[1]), (b2[0], ph, b2[1]), (bi[0], ph, bi[1]), (ai[0], ph, ai[1])], (0, 1, 0))
        kit.face('base', [(ai[0], ph - 0.08, ai[1]), (bi[0], ph - 0.08, bi[1]), (bi[0], ph, bi[1]), (ai[0], ph, ai[1])], (-nx, 0, -nz))
    for sx in (-1, 1):                                                                                            # 兩端封口（朝校內）
        kit.face('base', [(sx * r, 0.0, zb), (sx * (r - 0.24), 0.0, zb), (sx * (r - 0.24), ph, zb), (sx * r, ph, zb)], (0, 0, -1))
    kit.cface('misc', [(px, ph - 0.08, pz) for (px, pz) in in_p], (0, 1, 0), '#4a3b2c')                                     # 土
    hedge = Mesh('gt_hedge', img_mat('gt_hedge_leaf', 'azalea_leaves.png')); flow = Mesh('gt_flower', img_mat('gt_hedge_flower', 'ixora_flower.png'))
    HP = [(-0.5, 0.0), (-0.56, 0.24), (-0.52, 0.46), (-0.36, 0.6), (0.0, 0.65), (0.36, 0.6), (0.52, 0.46), (0.56, 0.24), (0.5, 0.0)]
    FP = [(-0.3, 0.0), (-0.34, 0.16), (-0.24, 0.34), (0.0, 0.4), (0.24, 0.34), (0.34, 0.16), (0.3, 0.0)]
    hpath = ring_path(r - 1.35); fpath = ring_path(r - 0.6)
    sweep(hedge, hpath, HP, ph - 0.08, 1114); sweep(flow, fpath, FP, ph - 0.08, 1115, wob=0.1)
    BP = [(-0.41, 0.0), (-0.41, 0.82), (-0.33, 0.9), (0.33, 0.9), (0.41, 0.82), (0.41, 0.0)]                     # 門房兩側的方形綠籬塊（修成方的、稜角略圓）
    for k, (xa, xb) in enumerate(HEDGE_BLOCKS):
        xm = (xa + xb) / 2
        sweep(hedge, [(xm, -0.75), (xm, -0.5), (xm, -0.05), (xm, 0.2)], BP, 0.0, 1120 + k, wob=0.03)

    # ================= 完成 =================
    K.finish(accs, root, VC)
    for (m, props) in plates: uv01(m.finish(root, uv=True, props=props))
    hedge.finish(root, uv=True, smooth=True); flow.finish(root, uv=True, smooth=True)
    for i, (x, y, z) in enumerate(GLOW):
        e = B.group(f'GLOW_gate_lamp_{i}', root, {'glow': '#ffe2a8', 'size': 1.8, 'day': 0.0, 'night': 0.9}); e.location = g2b(x, y, z)
    VCM = L.vc_material('wz_vc_gt', rough=0.55)
    L.vc_consolidate(root, {n: VCM for n in ('gt_misc', 'ck_ceiling', 'ck_frame')})
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    info['note'] = 'v2（GATE-REF-1114）：照使用者 11-14 的參考圖——切角紅磚門房、石材匾額「首都帝國大學」、旗桿、半圓花圃、兩座大石柱＋方燈、紅磚矮牆＋鐵欄杆'
    info['house'] = HOUSE; info['planter'] = PLANTER; info['pillars'] = PILLARS; info['piers'] = PIERS; info['hedge_blocks'] = HEDGE_BLOCKS
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    print(build())
