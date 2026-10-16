"""台北街上的機車：多個車型（使用者 2026-10-16 20:2x：「遊戲裡面機車和腳踏車都只是同個模板換顏色，太假了……國內外都要有，不要抄襲，但要參考」）。
LAWWW2-B（D89：美術歸 LAWWW2）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/scooters_v2.py [-- --out assets/models/env/second_ai/scooter.glb] [--only S1A,S2]

參考：docs/art-rebuild/second_ai/research/vehicles_research.md（9 種外型原型的尺寸、造型線索、配色；數字來自搜尋摘要，標「估」的是估計）。
**只參考車型的類別**（國民通勤、運動型、電動換電、復古圓弧…），外型比例自己定；不放商標、不照抄任何一款的前臉或飾條；車牌空白。

座標：和 scooter.py 一樣——車頭朝 +x、原點在兩輪中間的地面、+z＝左邊（引擎、傳動箱在左；排氣管在右 −z）。
每一款一個節點 `scooter_<代號>`（網格三個材質：scooter_paint 白色＝遊戲乘上這台的顏色、scooter_parts 頂點色、scooter_metal 頂點色＋金屬 0.45），
節點的自訂屬性（glTF extras）：`archetype`（原型）、`weight`（街上的比例，遊戲照這個挑）、`palette`（這一型常見的車殼顏色）。
舊的名稱 `scooter_a`（＝S1 新款）、`scooter_b`（＝S4 復古）也保留：遊戲還沒套新的接法之前照舊能用。
預算：溫州街三角形只剩約 3 千的餘裕 → 每台平均 ≤1,350 三角形（舊版 1,286）。
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/scooter.glb'))
ONLY = [s for s in (arg('--only', '') or '').split(',') if s]

B.reset(texres=256)
root = B.group('scooters', props={'kind': 'scooters', 'version': 2})
M = {
    'paint': L.flat('scooter_paint', '#ffffff', rough=0.32),
    'parts': L.vc_material('scooter_parts', rough=0.55),
    'metalvc': L.vc_material('scooter_metal', rough=0.32),
}
M['metalvc'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0.45
# 零件顏色（寫進頂點色）：(顏色, 金屬)
COL = {'dark': ('#2a2b2d', 0), 'black': ('#17181a', 0), 'seat': ('#1d1c1c', 0), 'tire': ('#191919', 0), 'lamp': ('#e8edf0', 0), 'lamp_warm': ('#f2e6c8', 0),
       'tail': ('#a1231b', 0), 'amber': ('#d98a1e', 0), 'plate': ('#f1f1ec', 0), 'smoke': ('#3b4148', 0), 'box': ('#2e3033', 0), 'box_grey': ('#8e9196', 0),
       'deliv': ('#31373d', 0), 'helmet_w': ('#e9e7e2', 0), 'helmet_b': ('#2a3a55', 0), 'helmet_r': ('#9b2c2c', 0), 'visor': ('#252a30', 0),
       'metal': ('#7d8186', 1), 'chrome': ('#b9bec3', 1), 'alloy': ('#5d6166', 1), 'gold': ('#a8873e', 1)}


class Part(Mesh):
    """零件：一個顏色（paint＝車殼，白色）。最後全部寫頂點色、換成三個共用材質"""
    def __init__(self, col='paint'):
        super().__init__('p_' + col, M['paint']); self.col = col


def finish_all(parts, name, loc_z):
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    obs = []
    for p in parts:
        if p.empty(): p.bm.free(); continue
        col = p.col; ob = p.finish(None, uv=False); L.smooth_mesh(ob, angle=1.0)
        hx, met = ('#ffffff', 0) if col == 'paint' else COL[col]
        c = [lin(int(hx[i:i + 2], 16) / 255) for i in (1, 3, 5)] + [1.0]
        at = ob.data.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
        for d in at.data: d.color = c
        ob.data.materials[0] = M['paint'] if col == 'paint' else (M['metalvc'] if met else M['parts'])
        obs.append(ob)
    me = combine(obs, name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root
    ob.location = (0.0, -loc_z, 0.0)                                    # 匯出時一款一款排開（遊戲照名稱取，不看位置）
    return ob


def sect(x, cy, hw, hh, p=2.6, n=8, dz=0.0):
    """橫斷面（x 處）：超橢圓，中心高 cy、半寬 hw、半高 hh；p 越大越方"""
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        pts.append((x, cy + hh * math.copysign(abs(s) ** (2 / p), s), dz + hw * math.copysign(abs(c) ** (2 / p), c)))
    return pts


def vsect(x, y, hw, hd, p=2.6, n=8):
    """沿 y 往上接的斷面（前擋）：x–z 平面的超橢圓"""
    e = 2 / p; out = []
    for i in range(n):
        t = 2 * math.pi * i / n; c, s = math.cos(t), math.sin(t)
        out.append((x + hd * math.copysign(abs(s) ** e, s), y, hw * math.copysign(abs(c) ** e, c)))
    return out


def loft(m, rings, cap=True):
    bm = m.bm; vr = [[bm.verts.new(g2b(*p)) for p in r] for r in rings]; n = len(rings[0])
    for a, b in zip(vr, vr[1:]):
        for i in range(n):
            j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    if cap:
        bm.faces.new(vr[0]); bm.faces.new(list(reversed(vr[-1])))
    return m


def wheel(parts, x, r, w, rim='disc', seg=12):
    """輪胎（車胎截面是圓弧：機車胎窄而圓）＋輪框；rim：disc（壓鑄多輻，簡化成兩面圓盤）、spoke（鋼絲輪：細的框＋輪轂）"""
    t = Part('tire'); hub = r * (0.47 if rim == 'disc' else 0.82)
    prof = [(hub + 0.012, -w / 2 * 0.8), (r - w * 0.32, -w / 2), (r - w * 0.08, -w * 0.3), (r, 0.0), (r - w * 0.08, w * 0.3), (r - w * 0.32, w / 2), (hub + 0.012, w / 2 * 0.8)]
    bm = L.lathe(prof, seg=seg); t.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free(); parts.append(t)
    if rim == 'disc':
        rm = Part('alloy'); bm = L.lathe([(0.0, -w / 2 * 0.75), (hub + 0.014, -w / 2 * 0.75), (hub + 0.014, w / 2 * 0.75), (0.0, w / 2 * 0.75)], seg=8)
        rm.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free(); parts.append(rm)
    else:   # 鋼絲輪：鍍鉻輪圈（細環）＋輪轂；輻條用 6 根細桿暗示
        rm = Part('chrome'); bm = L.lathe([(hub, -0.016), (hub + 0.016, -0.016), (hub + 0.016, 0.016), (hub, 0.016)], seg=12)
        rm.add_bm(bm, Matrix.Translation(g2b(x, r, 0)) @ Matrix.Rotation(math.pi / 2, 4, 'X')); bm.free()
        rm.cyl((x, r, -0.045), (x, r, 0.045), 0.045, seg=8)
        for k in range(6):
            a = k * math.pi / 3; rm.cyl((x, r, 0), (x + math.cos(a) * hub, r + math.sin(a) * hub, 0), 0.003, seg=3)
        parts.append(rm)


# ---------------- 車型參數 ----------------
# wb：半軸距；rf／rr：前後輪外半徑；tw：胎寬；body：後車身斷面 [(x, cy, hw, hh)]（越後越窄越高）；bp：後車身方度；
# apron：前擋斷面 [(x, y, hw, hd)]；ap：前擋方度；cover：龍頭罩 [(x, cy, hw, hh)]；lamp：頭燈位置 handle／apron／round／strip；
# floor：flat（平底）／tunnel（中央隧道）；exh：normal／big／none；tail：尾燈形狀；mirror：round／poly／chrome；
# seat：[(x, cy, hw, hh)]；two_tone：下半部黑色塑件；extras：配件；palette：常見顏色；weight：街上比例
ARCH = {
    'S1A': dict(name='國民通勤 125（舊款：頭燈在龍頭）', wb=0.61, rf=0.215, rr=0.215, tw=0.095,
                body=[(-0.93, 0.64, 0.06, 0.07), (-0.87, 0.61, 0.12, 0.13), (-0.7, 0.56, 0.16, 0.19), (-0.4, 0.54, 0.17, 0.21), (-0.15, 0.52, 0.16, 0.2), (-0.04, 0.49, 0.14, 0.16)], bp=3.0,
                apron=[(0.30, 0.3, 0.2, 0.06), (0.34, 0.5, 0.19, 0.07), (0.38, 0.7, 0.16, 0.07), (0.41, 0.86, 0.12, 0.06), (0.43, 0.95, 0.09, 0.05)], ap=2.8,
                cover=[(0.35, 0.99, 0.1, 0.05), (0.42, 1.01, 0.17, 0.065), (0.5, 0.99, 0.16, 0.055), (0.57, 0.95, 0.1, 0.04)], lamp='handle',
                seat=[(-0.83, 0.76, 0.08, 0.025), (-0.73, 0.78, 0.14, 0.04), (-0.4, 0.79, 0.155, 0.045), (-0.1, 0.78, 0.15, 0.045), (0.05, 0.755, 0.12, 0.03)],
                floor='flat', exh='normal', tail='wide', mirror='round', two_tone=False, extras=['rear_box'],
                palette=['#e9e9e6', '#1d1f22', '#8c9095', '#b8bcc0', '#22344f', '#8f1f24', '#d9cdb6'], weight=0.22),
    'S1B': dict(name='國民通勤 125（新款：頭燈在車殼）', wb=0.62, rf=0.22, rr=0.215, tw=0.1,
                body=[(-0.95, 0.66, 0.07, 0.07), (-0.88, 0.62, 0.13, 0.13), (-0.7, 0.57, 0.165, 0.2), (-0.4, 0.55, 0.17, 0.22), (-0.15, 0.53, 0.16, 0.21), (-0.04, 0.5, 0.14, 0.17)], bp=3.4,
                apron=[(0.30, 0.3, 0.21, 0.06), (0.35, 0.5, 0.2, 0.08), (0.40, 0.7, 0.18, 0.08), (0.43, 0.86, 0.14, 0.065), (0.45, 0.96, 0.1, 0.05)], ap=3.2,
                cover=[(0.36, 1.0, 0.1, 0.045), (0.42, 1.01, 0.16, 0.055), (0.5, 0.99, 0.14, 0.045), (0.55, 0.97, 0.08, 0.03)], lamp='apron',
                seat=[(-0.85, 0.77, 0.08, 0.025), (-0.74, 0.79, 0.14, 0.04), (-0.4, 0.8, 0.155, 0.045), (-0.1, 0.79, 0.15, 0.045), (0.06, 0.765, 0.12, 0.03)],
                floor='flat', exh='normal', tail='wide', mirror='round', two_tone=False, extras=['hook_bag'],
                palette=['#f1f1ee', '#141517', '#6f7378', '#a9adb2', '#334a6b', '#c9c1b3', '#5d6a5a'], weight=0.24),
    'S2': dict(name='運動型 125～158', wb=0.67, rf=0.235, rr=0.235, tw=0.12,
               body=[(-1.0, 0.74, 0.05, 0.05), (-0.92, 0.69, 0.11, 0.11), (-0.72, 0.6, 0.16, 0.19), (-0.42, 0.56, 0.175, 0.22), (-0.15, 0.53, 0.16, 0.2), (-0.03, 0.5, 0.13, 0.16)], bp=4.6,
               apron=[(0.30, 0.32, 0.17, 0.07), (0.36, 0.52, 0.18, 0.09), (0.42, 0.72, 0.16, 0.09), (0.47, 0.88, 0.11, 0.07), (0.51, 0.98, 0.06, 0.05)], ap=4.2,
               cover=[(0.36, 1.02, 0.09, 0.05), (0.44, 1.04, 0.15, 0.06), (0.53, 1.02, 0.12, 0.045), (0.6, 0.99, 0.05, 0.025)], lamp='vled',
               seat=[(-0.9, 0.84, 0.06, 0.025), (-0.78, 0.83, 0.12, 0.04), (-0.45, 0.81, 0.15, 0.045), (-0.12, 0.79, 0.15, 0.045), (0.05, 0.765, 0.11, 0.03)],
               floor='flat', exh='big', tail='sharp', mirror='poly', two_tone=True, extras=['phone'],
               palette=['#1b1c1e', '#3b3f44', '#20427a', '#e8e8e6', '#6e7276', '#7a1c22', '#2f5a3c'], weight=0.2),
    'S5': dict(name='電動換電型', wb=0.63, rf=0.225, rr=0.225, tw=0.1,
               body=[(-0.93, 0.65, 0.06, 0.06), (-0.86, 0.62, 0.12, 0.12), (-0.68, 0.58, 0.15, 0.18), (-0.4, 0.56, 0.155, 0.2), (-0.15, 0.54, 0.15, 0.19), (-0.04, 0.51, 0.13, 0.15)], bp=3.8,
               apron=[(0.30, 0.3, 0.16, 0.05), (0.35, 0.5, 0.155, 0.06), (0.39, 0.7, 0.14, 0.065), (0.42, 0.86, 0.11, 0.055), (0.44, 0.95, 0.08, 0.045)], ap=3.6,
               cover=[(0.36, 1.0, 0.09, 0.04), (0.42, 1.01, 0.14, 0.045), (0.49, 1.0, 0.12, 0.04), (0.54, 0.98, 0.07, 0.03)], lamp='strip',
               seat=[(-0.83, 0.77, 0.08, 0.022), (-0.72, 0.785, 0.13, 0.035), (-0.4, 0.79, 0.145, 0.04), (-0.1, 0.785, 0.14, 0.04), (0.05, 0.76, 0.11, 0.028)],
               floor='flat', exh='none', tail='strip', mirror='round', two_tone=False, extras=[],
               palette=['#eef0f0', '#c9cdd0', '#55595e', '#9fc4d2', '#7fb8ab', '#e3a79c', '#1e2023'], weight=0.14),
}


def build(code):
    A = ARCH[code]; P = {}
    def part(col):
        if col not in P: P[col] = Part(col)
        return P[col]
    parts_extra = []
    wb, rf, rr, tw = A['wb'], A['rf'], A['rr'], A['tw']
    wheel(parts_extra, wb, rf, tw); wheel(parts_extra, -wb, rr, tw * (1.05 if code == 'S2' else 1.0))
    paint = part('paint')
    # 後車身（側蓋＋車尾）
    body = A['body']; loft(paint, [sect(x, cy, hw, hh, p=A['bp']) for (x, cy, hw, hh) in body])
    if A['two_tone']:   # 下半部黑色塑件（運動型：側板下緣、引擎上方的黑色護板）
        loft(part('black'), [sect(x, cy - hh * 0.62, hw * 1.02, hh * 0.42, p=A['bp']) for (x, cy, hw, hh) in body[1:-1]])
    # 座墊
    loft(part('seat'), [sect(x, cy, hw, hh, p=2.8) for (x, cy, hw, hh) in A['seat']])
    # 踏板
    fl = part('dark')
    if A['floor'] == 'flat': fl.rbox(-0.06, 0.32, 0.28, 0.31, -0.17, 0.17, r=0.01, seg=1); fl.box(-0.06, 0.32, 0.16, 0.28, -0.13, 0.13)
    # 前擋
    loft(paint, [vsect(x, y, hw, hd, p=A['ap']) for (x, y, hw, hd) in A['apron']])
    # 前土除（弧）
    ff = paint; arc = []; x0 = wb
    for i in range(7):
        a = math.radians(-35 + i * 17.5); cx, cy = x0 + math.sin(a) * (rf + 0.065), rf + math.cos(a) * (rf + 0.065); rx, ry = math.sin(a), math.cos(a); ring = []
        for k in range(8):
            t = 2 * math.pi * k / 8; c, s_ = math.cos(t), math.sin(t); e = 2 / 2.4
            ring.append((cx + rx * 0.018 * math.copysign(abs(s_) ** e, s_), cy + ry * 0.018 * math.copysign(abs(s_) ** e, s_), (tw * 0.75) * math.copysign(abs(c) ** e, c)))
        arc.append(ring)
    loft(ff, arc)
    fk = part('metal')
    for z in (-0.06, 0.06): fk.cyl((wb, rf, z), (wb - 0.165, rf + 0.585, z), 0.022, seg=6)
    # 龍頭罩、把手、儀表
    loft(paint, [sect(x, cy, hw, hh, p=3.0) for (x, cy, hw, hh) in A['cover']])
    gr = part('dark'); cy_c = A['cover'][1][1]
    for s in (-1, 1): gr.cyl((0.44, cy_c, s * 0.15), (0.42, cy_c + 0.01, s * 0.33), 0.018, seg=6)
    gr.rbox(0.39, 0.46, cy_c + 0.03, cy_c + 0.06, -0.07, 0.07, r=0.008, seg=1)
    # 後照鏡
    mr = part('dark' if A['mirror'] != 'chrome' else 'chrome')
    for s in (-1, 1):
        mr.cyl((0.42, cy_c + 0.02, s * 0.22), (0.39, cy_c + (0.17 if A['mirror'] != 'poly' else 0.11), s * 0.28), 0.008, seg=4)
        if A['mirror'] == 'poly':   # 運動型：短柄、多邊形鏡面
            mr.quad([(0.38, cy_c + 0.1, s * 0.22), (0.4, cy_c + 0.1, s * 0.34), (0.4, cy_c + 0.15, s * 0.33), (0.38, cy_c + 0.15, s * 0.25)])
            mr.quad([(0.38, cy_c + 0.1, s * 0.22), (0.38, cy_c + 0.15, s * 0.25), (0.4, cy_c + 0.15, s * 0.33), (0.4, cy_c + 0.1, s * 0.34)])
        else: mr.ell((0.39, cy_c + 0.19, s * 0.285), 0.016, 0.042, 0.055, seg=8, rings=4)
    # 頭燈
    lp = part('lamp'); ap = A['apron']
    if A['lamp'] == 'handle':     # 龍頭罩前面的燈（舊款）＋前擋上的方向燈
        lp.rbox(A['cover'][2][0] + 0.03, A['cover'][2][0] + 0.07, cy_c - 0.04, cy_c + 0.01, -0.1, 0.1, r=0.012, seg=1)
    elif A['lamp'] == 'apron':    # 前擋上的一對燈（新款）
        x, y = ap[2][0] + ap[2][3] - 0.01, ap[2][1] + 0.05
        for s in (-1, 1): lp.rbox(x, x + 0.03, y, y + 0.05, s * 0.05, s * 0.13, r=0.01, seg=1)
    elif A['lamp'] == 'vled':     # 運動型：V 形 LED（前擋上兩條斜燈）＋龍頭上的小燈
        for s in (-1, 1): lp.quad([(ap[1][0] + 0.095, ap[1][1] + 0.02, s * 0.03), (ap[2][0] + 0.095, ap[2][1] + 0.06, s * 0.13), (ap[2][0] + 0.095, ap[2][1] + 0.1, s * 0.12), (ap[1][0] + 0.095, ap[1][1] + 0.06, s * 0.025)][::s])
        lp.rbox(A['cover'][2][0], A['cover'][2][0] + 0.06, cy_c - 0.03, cy_c, -0.06, 0.06, r=0.01, seg=1)
    elif A['lamp'] == 'strip':    # 電動：前擋中間一條細長 LED（不是任何一款的前臉）
        lp.rbox(ap[1][0] + ap[1][3] - 0.005, ap[1][0] + ap[1][3] + 0.012, ap[1][1] - 0.05, ap[3][1], -0.014, 0.014, r=0.006, seg=1)
        lp.rbox(A['cover'][2][0] + 0.02, A['cover'][2][0] + 0.05, cy_c - 0.025, cy_c, -0.08, 0.08, r=0.01, seg=1)
    am = part('amber')
    for s in (-1, 1):
        am.rbox(ap[1][0] + 0.04, ap[1][0] + 0.08, ap[1][1] + 0.1, ap[1][1] + 0.14, s * 0.15 - 0.03, s * 0.15 + 0.03, r=0.008, seg=1)
        am.rbox(body[0][0] + 0.04, body[0][0] + 0.08, body[0][1] - 0.01, body[0][1] + 0.03, s * 0.09 - 0.025, s * 0.09 + 0.025, r=0.008, seg=1)
    tl = part('tail'); bx, by = body[0][0], body[0][1]
    if A['tail'] == 'wide': tl.rbox(bx - 0.025, bx + 0.01, by + 0.02, by + 0.07, -0.08, 0.08, r=0.01, seg=1)
    elif A['tail'] == 'sharp':   # 運動型：上揚的尖尾，兩條斜的尾燈
        for s in (-1, 1): tl.quad([(bx - 0.01, by - 0.02, s * 0.01), (bx + 0.08, by - 0.04, s * 0.09), (bx + 0.08, by - 0.01, s * 0.1), (bx - 0.01, by + 0.02, s * 0.015)][::s])
    elif A['tail'] == 'strip': tl.rbox(bx - 0.015, bx + 0.01, by - 0.005, by + 0.02, -0.1, 0.1, r=0.006, seg=1)
    pl = part('plate'); pl.box(bx - 0.06, bx - 0.045, 0.38, 0.49, -0.1, 0.1)
    # 後土除、傳動箱（電動：細擺臂）、排氣管、中柱
    rf_ = part('dark'); rf_.rbox(bx - 0.05, bx + 0.12, 0.36, 0.5, -0.08, 0.08, r=0.02, seg=1)
    en = part('metal' if A['exh'] != 'none' else 'dark')
    if A['exh'] != 'none':
        loft(en, [sect(x, cy, hw, hh, p=2.4, n=8, dz=0.12) for (x, cy, hw, hh) in [(-wb - 0.06, 0.24, 0.03, 0.06), (-wb + 0.02, 0.25, 0.04, 0.1), (-0.3, 0.27, 0.045, 0.1), (-0.08, 0.26, 0.04, 0.09), (-0.02, 0.25, 0.025, 0.06)]])
    else:   # 輪轂馬達：後輪中間一個大的圓盤＋細的擺臂（沒有 CVT 殼、沒有排氣管）
        en.cyl((-wb, rr, 0.0), (-wb, rr, 0.07), rr * 0.5, seg=12); en.cyl((-wb, rr, 0.08), (-0.1, 0.3, 0.09), 0.025, seg=5)
    part('dark').box(-0.45, -0.04, 0.2, 0.36, -0.1, 0.06)
    if A['exh'] == 'normal': part('dark').cyl((-0.25, 0.22, -0.16), (-wb - 0.32, 0.36, -0.17), 0.05, seg=8)
    elif A['exh'] == 'big':
        part('alloy').cyl((-0.25, 0.22, -0.16), (-wb - 0.3, 0.4, -0.18), 0.065, seg=8, r2=0.075)
        part('black').quad([(-0.35, 0.36, -0.245), (-wb - 0.15, 0.44, -0.26), (-wb - 0.15, 0.37, -0.265), (-0.35, 0.29, -0.25)])
    cs = part('metal')
    for z in (-0.12, 0.12): cs.cyl((-0.15, 0.2, z), (-0.2, 0.0, z * 1.1), 0.015, seg=4)
    cs.cyl((-0.2, 0.01, -0.13), (-0.2, 0.01, 0.13), 0.015, seg=4)
    # 配件
    ex = A['extras']
    if 'rear_box' in ex:   # 後箱（約 32 L，深灰，倒角）＋支架
        part('box').rbox(bx + 0.02, bx + 0.36, by + 0.16, by + 0.46, -0.19, 0.19, r=0.05, seg=2); part('metal').box(bx + 0.1, bx + 0.3, by + 0.12, by + 0.16, -0.12, 0.12)
        part('tail').box(bx + 0.015, bx + 0.025, by + 0.26, by + 0.3, -0.1, 0.1)
    if 'hook_bag' in ex:   # 前掛勾上掛的塑膠袋（便當、飲料）
        part('helmet_w').ell((0.27, 0.56, 0.0), 0.06, 0.09, 0.09, seg=8, rings=5)
    if 'phone' in ex:      # 手機架
        part('black').rbox(0.43, 0.45, cy_c + 0.07, cy_c + 0.19, -0.04, 0.04, r=0.005, seg=1)
    parts = parts_extra + list(P.values())
    return parts


meta = {}
codes = ONLY or list(ARCH)
for i, code in enumerate(codes):
    parts = build(code); ob = finish_all(parts, f'scooter_{code}', i * 1.2)
    A = ARCH[code]; ob['archetype'] = code; ob['weight'] = A['weight']; ob['palette'] = json.dumps(A['palette']); ob['label'] = A['name']
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); meta[code] = dict(name=A['name'], tris=tris, weight=A['weight'], palette=A['palette'])
    print('scooter', code, A['name'], 'tris', tris)
# 舊名稱（遊戲還沒套新接法時用）：scooter_a＝S1 新款、scooter_b＝S4 復古（S4 還沒做時暫時用 S1 舊款）
alias = {'a': 'S1B', 'b': 'S4' if 'S4' in ARCH else 'S1A'}
for k, code in alias.items():
    src = bpy.data.objects.get(f'scooter_{code}')
    if src is None: continue
    dup = src.copy(); dup.data = src.data; dup.name = f'scooter_{k}'; bpy.context.scene.collection.objects.link(dup); dup.parent = root; dup.location = (0.0, 3.0 + len(codes) * 1.2, 0.0)
info = L.export(OUT, gpu_instances=False)
info['variants'] = meta; info['alias'] = alias
L.write_json(OUT[:-4] + '.json', info)
print('avg tris', round(sum(v['tris'] for v in meta.values()) / max(len(meta), 1)))
