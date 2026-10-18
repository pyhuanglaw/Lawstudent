"""街道道具（第二 AI 工作階段：後備 A，docs/SECOND_AI_HANDOFF.md 第三項）→ 一個 GLB，每樣道具一個網格（多個材質）：
  bike_city：淑女車（台灣學生最常騎的低跨車）——彎下管、前面的鐵絲籃、擋泥板、後貨架、鍊條蓋、36 根鋼絲（貼圖）、環形鎖、雙腳中柱、車鈴。
     座標照 W3.bike 的約定：沿 z 建模（車頭 +z）、輪子在 z=±0.47、輪心高 0.30（外徑 0.30）、座墊頂約 0.86、把手 0.9；遊戲端外層再轉 π/2。
     車架顏色：材質 bike_frame 是白色，遊戲用頂點色乘上每台的顏色（所有顏色共用一個材質，停車架整排可以合併）。
  lamp_post：路燈。燈頭位置和 W3.lampPost 一樣：燈罩中心 (0, 3.99, 0.8)、發光面 (0, 3.985, 0.8) 朝下、光源 (0, 3.9, 0.75)。
     發光面另外一個物件 lamp_post_lens（遊戲端換成套件原本的發光材質，入夜的光暈照舊）。
  bench_park：公園長椅（鑄鐵椅腳＋扶手、木條座面與椅背），寬 1.35 m、座面高 0.45 m（和 prop.bench 縮放後一樣）；正面朝 +z。
  ⑥（2026-10-11，LAWWW 佇列）法學院廣場等地的近景小物，尺寸照 W3 的程序化版本（導航阻擋在 zones3d.js，不變）：
  planter_box：花台（水泥花槽 1.2×0.48×0.5＋壓頂、土、交叉葉片卡的灌木、五瓣小花）；bulletin_board：公告欄（木柱、木框、軟木板、小雨遮、九張公告紙＋字行）；
  vending_machine：飲料販賣機（紅色烤漆機身、展示窗裡四層罐裝與寶特瓶、背光、頂上燈條、價格牌與按鈕、灰色投幣面板＋金額顯示、紙鈔與投幣口、找零口、廣告面板、取物口；1.1×1.9×0.8、正面朝 +z）。
用法：/opt/blenv/bin/python tools/blender/env_second/street_props.py [-- --out assets/models/env/second_ai/street_props.glb]
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/street_props.glb'))
TEXD = os.path.join(HERE, 'textures', 'gen')

B.reset(texres=256)
root = B.group('street_props', props={'kind': 'street_props'})


def alpha_atlas():
    """透明背景的 512×256 PNG（本作程式產生）：左半＝輪圈鋼絲（36 根交叉）＋花鼓，右半＝前籃的鐵絲網（直 9 條、橫 6 條）。
    鋼絲和鐵絲網共用一個材質（停車架整排合併時少一次 draw call）"""
    from PIL import Image, ImageDraw
    os.makedirs(TEXD, exist_ok=True); p = os.path.join(TEXD, 'bike_alpha.png')
    S = 1024; im = Image.new('RGBA', (S * 2, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = S / 2; wire = (200, 204, 209, 255)
    for k in range(36):
        a = k * 2 * math.pi / 36; side = 1 if k % 2 else -1; a2 = a + side * 0.42
        d.line([(c + math.cos(a) * 44, c + math.sin(a) * 44), (c + math.cos(a2) * (c - 12), c + math.sin(a2) * (c - 12))], fill=wire, width=7)
    d.ellipse([c - 52, c - 52, c + 52, c + 52], fill=(150, 154, 160, 255)); d.ellipse([c - 18, c - 18, c + 18, c + 18], fill=(90, 92, 96, 255))
    for i in range(10):
        x = S + 8 + (S - 16) * i / 9; d.line([(x, 0), (x, S)], fill=wire, width=12)
    for i in range(7):
        y = 8 + (S - 16) * i / 6; d.line([(S, y), (2 * S, y)], fill=wire, width=12)
    im = im.resize((512, 256), Image.LANCZOS); im.save(p); return p


def tex_material(name, path, rough=0.4, metal=0.4):
    m = L.flat(name, '#ffffff', rough=rough, metal=metal); nt = m.node_tree; N = nt.nodes
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.image.alpha_mode = 'STRAIGHT'
    bs = N['Principled BSDF']; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # 匯出成 alphaMode MASK（cutoff 0.5）
    return m


M = {
    'frame': L.flat('bike_frame', '#ffffff', rough=0.35, metal=0.15),       # 遊戲端乘上每台的顏色（頂點色）
    'dark': L.flat('bike_dark', '#1e1f21', rough=0.8),
    'metal': L.flat('bike_metal', '#a9adb3', rough=0.32, metal=0.45),     # 金屬度上限 0.45（ART_SOP 2-3；原本 0.55）
    'oldm': L.vc_material('bike_oldmetal', rough=0.75),                      # 老鐵馬的擋泥板、後貨架：烤漆＋鏽（頂點色，下緣、接地那一端鏽得多）
    'red': L.flat('bike_reflector', '#b3261e', rough=0.25),
    'alpha': tex_material('bike_alpha', alpha_atlas()),
    'lamp': L.flat('lamp_paint', '#2e3532', rough=0.55, metal=0.3),
    'lens': L.flat('lamp_lens', '#fff2c8', rough=0.2, emit=B.srgb('#fff2c8')),
    'wood': L.pbr('bench_wood', 'dark_wood', tile=1.0, target='#74482a', maps=('diff',), res=256, rough_value=0.6),
    'iron': L.flat('bench_iron', '#24282a', rough=0.5, metal=0.4),
    # ⑥ 法學院廣場的近景小物（2026-10-11）：花台、公告欄、販賣機
    'pconc': L.pbr('planter_conc', 'concrete_wall_006', tile=1.0, target='#a39a8c', sat=0.4, maps=('diff',), res=256, rough_value=0.85),
    'soil': L.flat('planter_soil', '#3f3226', rough=0.95),
    'leaf': tex_material('planter_leaf', os.path.join(TEXD, 'ivy_leaves.png'), rough=0.7, metal=0.0),   # 小葉子比較密（像校園花台的杜鵑、月橘）
    'vc': L.vc_material('prop_vc', rough=0.6),                               # 花、公告紙、飲料瓶、按鈕：頂點色（一個材質）
    'cork': L.flat('board_cork', '#b58a58', rough=0.9),
    'vbody': L.flat('vend_body', '#d23a32', rough=0.5),                     # 烤漆鋼板（不用金屬度：遊戲沒有環境貼圖，金屬會整台變黑）
    'vlight': L.flat('vend_light', '#f4f7fb', rough=0.4, emit=B.srgb('#e8f0ff')),   # 販賣機展示窗的背光（日夜都亮）
}


# ---------- 幾何小工具（遊戲座標） ----------
def frames(P):
    T = []
    for i in range(len(P)):
        t = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]); T.append(t.normalized())
    ref = Vector((0, 0, 1)) if abs(T[0].z) < 0.9 else Vector((1, 0, 0))
    N = [T[0].cross(ref).normalized()]
    for t in T[1:]:
        n = N[-1] - t * N[-1].dot(t)
        N.append(n.normalized() if n.length > 1e-6 else t.cross(ref).normalized())
    return T, N


def sweep(m, pts, r, seg=6, caps=True, r1=None):
    """沿折線（遊戲座標的點）掃一根管子（平行移動座標系，彎的地方不會扭）；r1＝末端半徑（錐形）"""
    P = [g2b(*p) for p in pts]; T, N = frames(P); bm = m.bm; rings = []
    for i, (p, t, n) in enumerate(zip(P, T, N)):
        b = t.cross(n); rr = r if r1 is None else r + (r1 - r) * i / (len(P) - 1)
        rings.append([bm.verts.new(p + (n * math.cos(2 * math.pi * k / seg) + b * math.sin(2 * math.pi * k / seg)) * rr) for k in range(seg)])
    for a, b_ in zip(rings, rings[1:]):
        for k in range(seg):
            j = (k + 1) % seg; bm.faces.new((a[k], a[j], b_[j], b_[k]))
    if caps: bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return m


def bez(p0, p1, p2, n=8):
    return [tuple(p0[k] * (1 - t) ** 2 + 2 * p1[k] * (1 - t) * t + p2[k] * t * t for k in range(3)) for t in [i / n for i in range(n + 1)]]


def ring_x(m, c, R, r, seg=24, rseg=6, a0=None, a1=None, prof=None, prof_closed=True):
    """繞 x 軸的環（輪胎、輪圈、擋泥板）：中心 c、半徑 R；斷面是半徑 r 的圓（rseg 點）或 prof＝[(徑向, x)…]。
    a0/a1：只做一段弧（角度從 +y 往 +z 量）"""
    bm = m.bm; closed = a0 is None
    prof = prof or [(r * math.cos(2 * math.pi * k / rseg), r * math.sin(2 * math.pi * k / rseg)) for k in range(rseg)]
    n = seg if closed else seg + 1; rings = []
    for i in range(n):
        t = (2 * math.pi * i / seg) if closed else a0 + (a1 - a0) * i / seg
        dy, dz = math.cos(t), math.sin(t)
        rings.append([bm.verts.new(g2b(c[0] + ox, c[1] + (R + dr) * dy, c[2] + (R + dr) * dz)) for (dr, ox) in prof])
    pairs = list(zip(rings, rings[1:])) + ([(rings[-1], rings[0])] if closed else [])
    k_n = len(prof)
    for a, b_ in pairs:
        for k in range(k_n if prof_closed else k_n - 1):
            j = (k + 1) % k_n; bm.faces.new((a[k], a[j], b_[j], b_[k]))
    return m


def disc_x(m, c, r, seg=16):
    """繞 x 軸的圓片（兩面；鋼絲貼圖用）：UV 是 0–1 的正方形對到圓"""
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); ctr = bm.verts.new(g2b(*c)); vs = []
    for i in range(seg):
        t = 2 * math.pi * i / seg; vs.append((bm.verts.new(g2b(c[0], c[1] + r * math.cos(t), c[2] + r * math.sin(t))), math.cos(t), math.sin(t)))
    for i in range(seg):
        a, b_ = vs[i], vs[(i + 1) % seg]; f = bm.faces.new((ctr, a[0], b_[0]))
        for lp, (u, v) in zip(f.loops, [(0.25, 0.5), (0.25 + a[2] * 0.25, 0.5 + a[1] * 0.5), (0.25 + b_[2] * 0.25, 0.5 + b_[1] * 0.5)]): lp[uvl].uv = (u, v)
    return m


def fin(m, parts, smooth=None, uv=False):
    if m.empty(): return None
    bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces)
    ob = m.finish(None, uv=uv)
    if smooth: L.smooth_mesh(ob, angle=smooth)
    parts.append(ob); return ob


RENDER_I = [0]


def place(ob, x, y=0.0):
    ob.location = (x, y, 0.0)   # 匯出時分開放（遊戲照名稱取，不看位置）
    if '--render' in ARGS and ob.name.startswith('bike'):   # 渲染用：腳踏車沿車身方向一台接一台排（從側面看得到每一台的輪廓）
        ob.location = (0.0, -2.3 * RENDER_I[0], 0.0); RENDER_I[0] += 1


# ---------- 淑女車 ----------
def quad_uv(m, pts, uvs):
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def bike(name='bike_city', child=False, x=0.0, basket='wire', load=False):
    """淑女車；child＝後貨架上加兒童座椅（接小孩的媽媽車）。
    basket：wire＝鐵絲籃（原本）、none＝沒有籃子（拆掉了，只剩前燈）、plastic＝塑膠籃（深灰、開口朝上、側面有長孔）；
    load＝籃子裡有東西（塑膠袋、摺疊傘、飲料杯；頂點色 prop_vc）——ART-BIKES2-F（使用者 2026-10-16「不要只改顏色」的後續：淑女車再分款＋生活痕跡）"""
    parts = []; RZ, FZ, WY = -0.47, 0.47, 0.30
    # 輪胎（略胖的城市車胎）、輪圈、花鼓；鋼絲和前籃鐵絲網是透明貼圖（同一個材質）
    tire = Mesh('tire', M['dark']); rim = Mesh('rim', M['metal']); hub = Mesh('hub', M['metal']); al = Mesh('alpha', M['alpha'])
    tprof = [(-0.014, -0.013), (0.008, -0.016), (0.018, 0.0), (0.008, 0.016), (-0.014, 0.013)]
    for wz in (RZ, FZ):
        ring_x(tire, (0, WY, wz), 0.282, 0, seg=16, prof=tprof)
        ring_x(rim, (0, WY, wz), 0.262, 0, seg=16, prof=[(-0.008, -0.011), (0.006, 0.0), (-0.008, 0.011)])
        hub.cyl((-0.045, WY, wz), (0.045, WY, wz), 0.02, seg=6)
        disc_x(al, (0, WY, wz), 0.258, seg=12)
    fin(tire, parts, smooth=1.2); fin(rim, parts, smooth=1.2); fin(hub, parts)
    # 前籃（上緣、底框是實體鐵條；四面＋底是鐵絲網貼圖）
    bx0, bx1, by0, by1, bz0, bz1 = -0.17, 0.17, 0.71, 0.94, 0.37, 0.63
    U = [(0.5, 0.0), (1.0, 0.0), (1.0, 1.0), (0.5, 1.0)]
    quad_uv(al, [(bx0, by0, bz1), (bx1, by0, bz1), (bx1, by1, bz1), (bx0, by1, bz1)], U)
    quad_uv(al, [(bx1, by0, bz0), (bx0, by0, bz0), (bx0, by1, bz0), (bx1, by1, bz0)], U)
    quad_uv(al, [(bx0, by0, bz0), (bx0, by0, bz1), (bx0, by1, bz1), (bx0, by1, bz0)], U)
    quad_uv(al, [(bx1, by0, bz1), (bx1, by0, bz0), (bx1, by1, bz0), (bx1, by1, bz1)], U)
    quad_uv(al, [(bx0, by0, bz0), (bx1, by0, bz0), (bx1, by0, bz1), (bx0, by0, bz1)], U)
    if basket == 'wire':
        al.bm.normal_update(); parts.append(al.finish(None, uv=False, merge=False))
    else:   # 只留鋼絲（把籃子的五片鐵絲網拿掉：重做一個只有鋼絲的 alpha 網格）
        al = Mesh('alpha', M['alpha'])
        for wz in (RZ, FZ): disc_x(al, (0, WY, wz), 0.258, seg=12)
        al.bm.normal_update(); parts.append(al.finish(None, uv=False, merge=False))
    # 車架（車架顏色）：低跨彎下管、座管、頭管、第二根細下管、後下叉、後上叉、前叉
    fr = Mesh('frame', M['frame'])
    Bb, S, Hb, H = (0, 0.27, -0.06), (0, 0.71, -0.17), (0, 0.6, 0.335), (0, 0.8, 0.295)
    sweep(fr, [Bb, S], 0.019, seg=6)
    sweep(fr, bez(Hb, (0, 0.2, 0.22), Bb, n=6), 0.025, seg=5)
    sweep(fr, [(0, 0.58, 0.34), H], 0.027, seg=8)
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.03, 0.27, -0.08), (sx * 0.045, WY, RZ + 0.02)], 0.011, seg=4)
        sweep(fr, [(sx * 0.022, 0.67, -0.18), (sx * 0.045, WY + 0.01, RZ + 0.02)], 0.01, seg=4)
        sweep(fr, bez((sx * 0.026, 0.6, 0.34), (sx * 0.047, 0.45, 0.42), (sx * 0.047, WY, FZ), n=3), 0.012, seg=4)
    fr.boxc(0, 0.6, 0.34, 0.11, 0.025, 0.05)                                                     # 前叉肩
    fprof = [(0.0, -0.036), (0.014, 0.0), (0.0, 0.036)]                                          # 擋泥板（淺 V 形斷面）
    ring_x(fr, (0, WY, FZ), 0.318, 0, seg=8, a0=math.radians(-40), a1=math.radians(112), prof=fprof, prof_closed=False)
    ring_x(fr, (0, WY, RZ), 0.318, 0, seg=9, a0=math.radians(-150), a1=math.radians(25), prof=fprof, prof_closed=False)
    cg = [(math.cos(math.pi * i / 4), math.sin(math.pi * i / 4)) for i in range(5)]               # 鍊條蓋（右邊）：齒盤上半圈＋後齒輪後半圈
    pts = [(-0.06 + 0.09 * c, 0.27 + 0.09 * s_) for (c, s_) in cg] + [(RZ + 0.02 - 0.055 * s_, WY + 0.055 * c) for (c, s_) in cg]
    vs = [fr.bm.verts.new(g2b(-0.078, y, z)) for (z, y) in pts]; vs2 = [fr.bm.verts.new(g2b(-0.06, y, z)) for (z, y) in pts]
    fr.bm.faces.new(vs); fr.bm.faces.new(list(reversed(vs2)))
    for i in range(len(vs)):
        j = (i + 1) % len(vs); fr.bm.faces.new((vs[i], vs[j], vs2[j], vs2[i]))
    fin(fr, parts, smooth=0.9)
    # 黑色零件：座墊、握把、踏板、鍊條
    dk = Mesh('dark_parts', M['dark']); rings = []
    for (z, y, hw, hh) in [(-0.31, 0.845, 0.075, 0.028), (-0.26, 0.862, 0.11, 0.037), (-0.17, 0.864, 0.095, 0.036), (-0.08, 0.855, 0.045, 0.028), (-0.02, 0.846, 0.018, 0.012)]:
        ring = []
        for k in range(6):
            t = 2 * math.pi * k / 6; c, s_ = math.cos(t), math.sin(t); e = 2 / 2.8
            ring.append(dk.bm.verts.new(g2b(hw * math.copysign(abs(c) ** e, c), y + hh * math.copysign(abs(s_) ** e, s_), z)))
        rings.append(ring)
    for a, b_ in zip(rings, rings[1:]):
        for k in range(6):
            j = (k + 1) % 6; dk.bm.faces.new((a[k], a[j], b_[j], b_[k]))
    dk.bm.faces.new(rings[0]); dk.bm.faces.new(list(reversed(rings[-1])))
    for sx in (-1, 1): sweep(dk, [(sx * 0.215, 0.905, 0.17), (sx * 0.3, 0.9, 0.115)], 0.018, seg=5)
    dk.box(-0.17, -0.095, 0.138, 0.162, 0.0, 0.08); dk.box(0.095, 0.17, 0.378, 0.402, -0.2, -0.12)   # 踏板（右前下、左後上）
    sweep(dk, [(-0.066, 0.356, -0.06), (-0.066, 0.345, RZ)], 0.006, seg=3); sweep(dk, [(-0.066, 0.184, -0.06), (-0.066, 0.255, RZ)], 0.006, seg=3)
    if child:   # 兒童座椅（深灰塑膠殼：座、椅背、兩側扶手、腳踏）＋安全帶扣
        for (y0, y1, z0, z1, x0, x1) in ((0.69, 0.75, -0.72, -0.40, -0.15, 0.15), (0.74, 1.02, -0.74, -0.68, -0.15, 0.15), (0.74, 0.86, -0.70, -0.42, -0.165, -0.14), (0.74, 0.86, -0.70, -0.42, 0.14, 0.165)):
            dk.rbox(x0, x1, y0, y1, z0, z1, r=0.02, seg=1)
        for sx in (-1, 1): dk.rbox(sx * 0.13 - 0.03, sx * 0.13 + 0.03, 0.42, 0.45, -0.46, -0.36, r=0.008, seg=1); sweep(dk, [(sx * 0.13, 0.69, -0.42), (sx * 0.13, 0.45, -0.41)], 0.008, seg=4)
    fin(dk, parts, smooth=1.0)
    # 銀色零件：座管、把手（後掠）、龍頭、煞車把、車鈴、後貨架、前籃的鐵條、齒盤、曲柄、環形鎖、中柱、前燈
    mt = Mesh('metal_parts', M['metal'])
    sweep(mt, [(0, 0.7, -0.172), (0, 0.835, -0.2)], 0.013, seg=5)
    sweep(mt, bez((-0.3, 0.9, 0.115), (-0.14, 0.935, 0.38), (0, 0.935, 0.33), n=3) + bez((0, 0.935, 0.33), (0.14, 0.935, 0.38), (0.3, 0.9, 0.115), n=3)[1:], 0.011, seg=4)
    sweep(mt, [H, (0, 0.935, 0.33)], 0.014, seg=5)
    mt.sphere((0.13, 0.952, 0.255), 0.022, seg=6, rings=3, sy=0.7)
    for sx in (-0.06, 0.06):
        sweep(mt, [(sx, 0.665, -0.27), (sx, 0.665, -0.69)], 0.007, seg=4); sweep(mt, [(sx, 0.665, -0.66), (sx * 0.8, WY, RZ)], 0.006, seg=4)
        sweep(mt, [(sx, 0.665, -0.3), (sx * 0.4, 0.68, -0.2)], 0.005, seg=3)
    for z in (-0.4, -0.6): sweep(mt, [(-0.06, 0.665, z), (0.06, 0.665, z)], 0.005, seg=3)
    if basket == 'wire':
        for y, r in ((by1, 0.007), (by0, 0.005)):
            sweep(mt, [(bx0, y, bz0), (bx1, y, bz0), (bx1, y, bz1), (bx0, y, bz1), (bx0, y, bz0)], r, seg=3, caps=False)
        for x in (bx0, bx1):
            for z in (bz0, bz1): sweep(mt, [(x, by0, z), (x, by1, z)], 0.004, seg=3, caps=False)
    if basket != 'none':   # 籃子的支架（龍頭一根、前叉兩根）
        sweep(mt, [(0, 0.71, 0.4), (0, 0.6, 0.37)], 0.008, seg=4)
        for sx in (-1, 1): sweep(mt, [(sx * 0.05, 0.71, 0.6), (sx * 0.035, 0.42, 0.455)], 0.005, seg=3)
    mt.cyl((-0.058, 0.27, -0.06), (-0.052, 0.27, -0.06), 0.088, seg=10)
    sweep(mt, [(-0.085, 0.27, -0.06), (-0.09, 0.15, 0.04)], 0.009, seg=4); sweep(mt, [(0.085, 0.27, -0.06), (0.09, 0.39, -0.16)], 0.009, seg=4)
    sweep(mt, [(-0.085, 0.27, -0.06), (0.085, 0.27, -0.06)], 0.012, seg=5)
    mt.box(-0.035, 0.035, 0.33, 0.39, -0.39, -0.36)
    for sx in (-1, 1): sweep(mt, [(sx * 0.055, WY, RZ), (sx * 0.1, 0.012, RZ - 0.13)], 0.008, seg=3)
    sweep(mt, [(-0.1, 0.012, RZ - 0.13), (0.1, 0.012, RZ - 0.13)], 0.008, seg=3)
    mt.cyl((0, 0.66, 0.455), (0, 0.66, 0.52), 0.032, seg=7, r2=0.036)
    fin(mt, parts, smooth=1.0)
    rd = Mesh('reflector', M['red']); rd.box(-0.04, 0.04, 0.625, 0.66, -0.705, -0.69); fin(rd, parts)
    if basket == 'plastic':   # 塑膠籃：四面＋底各一片倒角板（開口朝上，不是一個實心盒子）；側面三道長孔＝深色凹槽
        pk = L.CMesh('plastic_basket', M['vc']); t = 0.012; pc = '#3b3e42'
        for (x0, x1, y0, y1, z0, z1) in ((bx0, bx1, by0, by0 + t, bz0, bz1), (bx0, bx0 + t, by0, by1, bz0, bz1), (bx1 - t, bx1, by0, by1, bz0, bz1),
                                          (bx0, bx1, by0, by1, bz0, bz0 + t), (bx0, bx1, by0, by1, bz1 - t, bz1)):
            pk.crbox(x0, x1, y0, y1, z0, z1, pc, r=0.005, seg=1)
        L_ = '#2e3134'; e = 0.006; lw = 0.016   # 上緣加厚的唇：四條框（第一版是一整片＝蓋子）
        pk.crbox(bx0 - e, bx1 + e, by1 - 0.018, by1, bz1 - lw, bz1 + e, L_, r=0.005, seg=1); pk.crbox(bx0 - e, bx1 + e, by1 - 0.018, by1, bz0 - e, bz0 + lw, L_, r=0.005, seg=1)
        pk.crbox(bx0 - e, bx0 + lw, by1 - 0.018, by1, bz0 + lw, bz1 - lw, L_, r=0.005, seg=1); pk.crbox(bx1 - lw, bx1 + e, by1 - 0.018, by1, bz0 + lw, bz1 - lw, L_, r=0.005, seg=1)
        # 四面的格孔（台灣菜籃車式塑膠籃：一排一排的長方孔；第一版只有前面三道長孔，側面看是一個灰色實心盒子＝方塊感，退件）：
        # 深色的孔是比板面凸 1 mm 的薄片（不和板面同一平面，不閃）；孔和孔之間留 1.2 cm 的肋
        hole = '#17181a'; rows = [by0 + 0.035 + k * 0.042 for k in range(4)]; hh = 0.026
        def grid_x(xa, xb, z0f, z1f, n):       # 前後面（沿 x 排 n 個孔）
            step = (xb - xa) / n
            for yy in rows:
                for i in range(n):
                    x0 = xa + i * step + 0.006; pk.cbox(x0, x0 + step - 0.012, yy, yy + hh, z0f, z1f, hole)
        def grid_z(za, zb, x0f, x1f, n):       # 左右面（沿 z 排 n 個孔）
            step = (zb - za) / n
            for yy in rows:
                for i in range(n):
                    z0 = za + i * step + 0.006; pk.cbox(x0f, x1f, yy, yy + hh, z0, z0 + step - 0.012, hole)
        grid_x(bx0 + 0.03, bx1 - 0.03, bz1, bz1 + 0.001, 6); grid_x(bx0 + 0.03, bx1 - 0.03, bz0 - 0.001, bz0, 6)
        grid_z(bz0 + 0.03, bz1 - 0.03, bx0 - 0.001, bx0, 4); grid_z(bz0 + 0.03, bz1 - 0.03, bx1, bx1 + 0.001, 4)
        fin(pk, parts, smooth=0.6)
    if load and basket != 'none':   # 籃子裡的東西（生活痕跡）：鼓起來的白色塑膠袋、斜放的摺疊傘、手搖飲杯
        ld = L.CMesh('basket_load', M['vc'])
        f0 = set(ld.bm.faces); ld.ell((-0.03, by0 + 0.1, (bz0 + bz1) / 2 - 0.02), 0.12, 0.1, 0.09, seg=10, rings=6)
        ld.paint([f for f in ld.bm.faces if f not in f0], '#efeee8')
        for v in ld.bm.verts:   # 塑膠袋不是正橢球：上半往一邊塌、提把那一側高一點
            if v.co.z > by0 + 0.12: v.co.x += 0.025 * math.sin(v.co.y * 31.0); v.co.z += 0.012 * math.cos(v.co.x * 27.0)
        f0 = set(ld.bm.faces); ld.cyl((-0.13, by0 + 0.06, bz0 + 0.03), (0.12, by1 + 0.05, bz1 - 0.05), 0.022, seg=7)   # 摺疊傘（深藍）
        ld.paint([f for f in ld.bm.faces if f not in f0], '#2b3a5c')
        f0 = set(ld.bm.faces); ld.cyl((0.1, by0 + 0.02, bz1 - 0.07), (0.1, by0 + 0.17, bz1 - 0.07), 0.035, seg=10, r2=0.042)   # 手搖飲杯（半透明感用淺奶茶色）
        ld.paint([f for f in ld.bm.faces if f not in f0], '#d9c3a0')
        f0 = set(ld.bm.faces); ld.cyl((0.1, by0 + 0.17, bz1 - 0.07), (0.1, by0 + 0.185, bz1 - 0.07), 0.044, seg=10)
        ld.paint([f for f in ld.bm.faces if f not in f0], '#f2f1ec')
        fin(ld, parts, smooth=1.0)
    me = combine(parts, name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, x)
    return ob


# ---------- 路燈 ----------
def disc_down(m, c, rx, rz, seg=16):
    """朝下的橢圓發光面（扇形三角形）"""
    bm = m.bm; ctr = bm.verts.new(g2b(*c)); vs = [bm.verts.new(g2b(c[0] + rx * math.cos(2 * math.pi * i / seg), c[1], c[2] + rz * math.sin(2 * math.pi * i / seg))) for i in range(seg)]
    for i in range(seg):
        a, b_ = vs[i], vs[(i + 1) % seg]; f = bm.faces.new((ctr, a, b_)); f.normal_update()
        if f.normal.z > 0: f.normal_flip()
    return m


def lamp_post():
    parts = []; lp = Mesh('lamp_body', M['lamp'])
    prof = [(0.23, 0.0), (0.23, 0.07), (0.17, 0.15), (0.15, 0.32), (0.12, 0.46), (0.09, 0.56), (0.11, 0.62), (0.077, 0.7)]
    bm = L.lathe(prof, seg=12)
    for v in bm.verts:                                                                          # 柱座的直條紋（8 條凹槽）
        if 0.16 < v.co.z < 0.44:
            a = math.atan2(v.co.y, v.co.x); k = 0.5 + 0.5 * math.cos(a * 6)
            v.co.x *= 1 - 0.07 * k; v.co.y *= 1 - 0.07 * k
    lp.add_bm(bm); bm.free()
    bm = L.lathe([(0.077, 0.7), (0.05, 3.9), (0.062, 3.93), (0.045, 4.0), (0.03, 4.08), (0.046, 4.11), (0.0, 4.23)], seg=8)
    lp.add_bm(bm); bm.free()
    for (y, r) in ((1.4, 0.075),):
        bm = L.lathe([(r - 0.012, y - 0.03), (r, y), (r - 0.012, y + 0.03)], seg=8); lp.add_bm(bm); bm.free()
    sweep(lp, bez((0, 3.95, 0.03), (0, 4.24, 0.12), (0, 4.07, 0.63), n=6), 0.03, seg=5)          # 燈臂
    sp = bez((0, 3.62, 0.05), (0, 3.78, 0.42), (0, 4.02, 0.5), n=4)                             # 燈臂下的裝飾曲線＋小捲曲
    for i in range(1, 5):
        t = i / 4 * math.pi * 1.4; sp.append((0.0, 4.02 - 0.05 * math.sin(t) - 0.02 * t / 4.4, 0.5 - 0.05 * (1 - math.cos(t))))
    sweep(lp, sp, 0.01, seg=3)
    bm = L.lathe([(0.0, 4.1), (0.11, 4.08), (0.18, 4.035), (0.214, 3.985), (0.19, 3.975), (0.19, 3.99)], seg=12)   # 燈罩（扁圓頂、前後拉長）；內側頂面在發光面上方
    for v in bm.verts: v.co.y *= 1.55
    lp.add_bm(bm, Matrix.Translation(g2b(0, 0, 0.8))); bm.free()
    lp.box(-0.012, 0.012, 4.0, 4.07, 0.6, 0.68)
    lp.box(-0.045, 0.045, 0.2, 0.42, 0.125, 0.15)                                               # 柱座上的檢修門
    fin(lp, parts, smooth=0.8)
    me = combine(parts, 'lamp_post'); body = bpy.data.objects.new('lamp_post', me); bpy.context.scene.collection.objects.link(body); body.parent = root; place(body, 3.0)
    ln = Mesh('lamp_post_lens', M['lens']); disc_down(ln, (0, 3.985, 0.8), 0.19, 0.19 * 1.55, seg=12)
    lob = ln.finish(None, uv=False); lob.parent = body                                          # 掛在燈桿底下（遊戲端照名稱找）
    return body


# ---------- 公園長椅 ----------
def bench_park():
    parts = []; W = 1.35; SY = 0.45
    wd = Mesh('bench_slats', M['wood'], tile=1.0)
    for z in (0.172, 0.08, -0.012, -0.104): wd.box(-W / 2, W / 2, SY - 0.032, SY, z - 0.038, z + 0.038)          # 座面四條
    for i in range(3):                                                                          # 椅背三條（往後傾）
        y = 0.6 + i * 0.13; z = -0.17 - (y - 0.5) * 0.25
        bm = bmesh.new(); L.bm_box(bm, -W / 2, W / 2, -0.045, 0.045, -0.014, 0.014)
        wd.add_bm(bm, Matrix.Translation(g2b(0, y, z)) @ Matrix.Rotation(-0.25, 4, 'X')); bm.free()
    fin(wd, parts, uv=True)
    ir = Mesh('bench_frame', M['iron'])
    for sx in (-0.6, 0.6):                                                                      # 兩側鑄鐵：前腳、後腳連椅背、座面橫撐、扶手
        sweep(ir, [(sx, 0.0, 0.2), (sx, 0.18, 0.2), (sx, 0.42, 0.19)], 0.022, seg=6)
        sweep(ir, bez((sx, 0.0, -0.2), (sx, 0.3, -0.16), (sx, 0.42, -0.15), n=3) + [(sx, 0.92, -0.28)], 0.022, seg=6)
        sweep(ir, [(sx, 0.415, 0.22), (sx, 0.415, -0.16)], 0.018, seg=6)
        sweep(ir, bez((sx, 0.42, 0.2), (sx, 0.64, 0.24), (sx, 0.64, 0.05), n=5) + [(sx, 0.66, -0.2)], 0.016, seg=6)
        ir.box(sx - 0.035, sx + 0.035, 0.0, 0.02, 0.15, 0.25); ir.box(sx - 0.035, sx + 0.035, 0.0, 0.02, -0.25, -0.15)
    sweep(ir, [(-0.6, 0.12, 0.0), (0.6, 0.12, 0.0)], 0.012, seg=5)
    fin(ir, parts, smooth=1.0)
    me = combine(parts, 'bench_park'); ob = bpy.data.objects.new('bench_park', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 6.0)
    return ob


# ---------- 花台（W3.planter：1.2×0.5×0.5，底在 y=0、置中）----------
def vcbox(m, x0, x1, y0, y1, z0, z1, col):
    """頂點色方塊（prop_vc）：一個顏色"""
    f = L.bm_box(m.bm, x0, x1, y0, y1, z0, z1)
    for fc in f:
        for lp in fc.loops: lp[m.col] = list(B.srgb(col)) + [1.0]


def planter_box():
    parts = []; W, Dp, Hh, t = 1.2, 0.5, 0.48, 0.06
    pc = Mesh('planter_shell', M['pconc'], tile=1.0)
    pc.box(-W / 2, W / 2, 0.0, Hh - 0.04, Dp / 2 - t, Dp / 2); pc.box(-W / 2, W / 2, 0.0, Hh - 0.04, -Dp / 2, -Dp / 2 + t)           # 前後牆
    pc.box(-W / 2, -W / 2 + t, 0.0, Hh - 0.04, -Dp / 2 + t, Dp / 2 - t); pc.box(W / 2 - t, W / 2, 0.0, Hh - 0.04, -Dp / 2 + t, Dp / 2 - t)
    for (x0, x1, z0, z1) in ((-W / 2 - 0.02, W / 2 + 0.02, Dp / 2 - t, Dp / 2 + 0.02), (-W / 2 - 0.02, W / 2 + 0.02, -Dp / 2 - 0.02, -Dp / 2 + t),
                             (-W / 2 - 0.02, -W / 2 + t, -Dp / 2 + t, Dp / 2 - t), (W / 2 - t, W / 2 + 0.02, -Dp / 2 + t, Dp / 2 - t)):
        pc.box(x0, x1, Hh - 0.04, Hh, z0, z1)                                                    # 壓頂（外凸 2 cm）
    fin(pc, parts, uv=True)
    so = Mesh('planter_soil', M['soil']); so.box(-W / 2 + t, W / 2 - t, 0.3, 0.4, -Dp / 2 + t, Dp / 2 - t); fin(so, parts)
    lf = Mesh('planter_leaf', M['leaf'])                                                         # 灌木：兩排交叉的葉片卡＋頂上一層（ivy_leaves.png，本作程式產生的葉片貼圖）
    lay = lf.bm.loops.layers.uv.verify()   # 和其他零件的盒狀 UV 同一層（預設名稱）：用 new('UVMap') 的話合併時變成第二層，匯出的葉片 UV 全是 0
    def card(pts, uvs=((0, 0), (1, 0), (1, 1), (0, 1))):
        fc = lf.bm.faces.new([lf.bm.verts.new(g2b(*p)) for p in pts])
        for lp, uv in zip(fc.loops, uvs): lp[lay].uv = uv
    for row, zr in enumerate((-0.09, 0.09)):
        for i in range(5):
            x = (-0.4 + i * 0.2) if row == 0 else (-0.36 + i * 0.18); h = 0.36 + ((i + row) % 3) * 0.04; w_ = 0.24   # 葉片卡最外到 |x|≤0.64（花台 1.2 m、導航阻擋同寬；原本後排往右偏 8 cm，葉子超出 0.14 m）
            for a in (0.5 + i * 0.7 + row, 0.5 + i * 0.7 + row + math.pi / 2):
                ca, sa = math.cos(a) * w_, math.sin(a) * w_ * 0.6
                card([(x - ca, 0.37, zr - sa), (x + ca, 0.37, zr + sa), (x + ca, 0.37 + h, zr + sa), (x - ca, 0.37 + h, zr - sa)])
    for i in range(3):                                                                           # 頂上一層（從上面看是滿的）
        x0, x1 = -0.56 + i * 0.37, -0.56 + (i + 1) * 0.37 + 0.02; y = 0.7 + (i % 2) * 0.03
        card([(x0, y, -0.22), (x1, y, -0.22), (x1, y + 0.02, 0.22), (x0, y + 0.02, 0.22)])
    fin(lf, parts)
    fl = L.CMesh('planter_flower', M['vc']); cols = ['#e07a7a', '#f2c14e', '#f7f7f4', '#c46a9a']
    for i in range(16):                                                                          # 花：五瓣的小花，開在葉叢表面（朝上、稍微往外）
        x = -0.5 + (i % 8) * 0.14 + (0.06 if i >= 8 else 0); z = (0.12 if i % 2 else -0.1) * (1 if i < 8 else -0.6); y = 0.73 + ((i * 7) % 5) * 0.012
        c = list(B.srgb(cols[i % 4])) + [1.0]; ctr = fl.bm.verts.new(g2b(x, y + 0.012, z)); ring = []
        for k in range(10):
            r = 0.045 if k % 2 == 0 else 0.02; a = 2 * math.pi * k / 10
            ring.append(fl.bm.verts.new(g2b(x + r * math.cos(a), y, z + r * math.sin(a))))
        for k in range(10):
            fc = fl.bm.faces.new([ctr, ring[k], ring[(k + 1) % 10]])
            for lp in fc.loops: lp[fl.col] = c
    fin(fl, parts)
    me = combine(parts, 'planter_box'); ob = bpy.data.objects.new('planter_box', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 8.0)
    return ob


# ---------- 公告欄（W3.bulletin：兩根柱子在 x=±1.1、板子 2.4×1.5 中心 y=1.65、正面朝 +z）----------
def bulletin_board():
    parts = []
    wd = Mesh('board_wood', M['wood'], tile=1.0)
    for sx in (-1.1, 1.1): wd.box(sx - 0.06, sx + 0.06, 0.0, 2.45, -0.06, 0.06)                 # 柱子
    wd.box(-1.2, 1.2, 2.33, 2.43, -0.06, 0.06); wd.box(-1.2, 1.2, 0.87, 0.95, -0.06, 0.06)       # 上下框
    wd.box(-1.2, -1.12, 0.87, 2.43, -0.06, 0.06); wd.box(1.12, 1.2, 0.87, 2.43, -0.06, 0.06)    # 左右框
    fin(wd, parts, uv=True)
    ck = Mesh('board_cork', M['cork']); ck.box(-1.12, 1.12, 0.95, 2.33, -0.03, 0.02); fin(ck, parts)
    rf = Mesh('board_roof', M['iron'])                                                           # 小雨遮（往前斜）
    bm = bmesh.new(); L.bm_box(bm, -1.32, 1.32, -0.015, 0.015, -0.12, 0.3); rf.add_bm(bm, Matrix.Translation(g2b(0, 2.52, 0.0)) @ Matrix.Rotation(-0.22, 4, 'X')); bm.free()
    fin(rf, parts)
    pp = L.CMesh('board_paper', M['vc']); papers = ['#fbfaf4', '#f6dfa8', '#cfe3ea', '#f4b8a8', '#d7e3ce', '#fbfaf4', '#f2f0ea']
    for i in range(9):                                                                           # 公告：A4／A3 的紙（稍微歪），上面幾條灰色的「字行」
        w_, h_ = (0.3, 0.42) if i % 3 == 0 else (0.21, 0.3)
        cx = -0.88 + (i % 5) * 0.44 + (0.06 if i >= 5 else 0); cy = 1.95 - (0 if i < 5 else 0.62) + ((i * 3) % 4) * 0.03; rot = ((i * 37) % 11 - 5) * 0.012
        c, s_ = math.cos(rot), math.sin(rot)
        def P(u, v, d=0.0): return g2b(cx + u * c - v * s_, cy + u * s_ + v * c, 0.024 + d)
        col = list(B.srgb(papers[i % len(papers)])) + [1.0]
        fc = pp.bm.faces.new([pp.bm.verts.new(P(-w_ / 2, -h_ / 2)), pp.bm.verts.new(P(w_ / 2, -h_ / 2)), pp.bm.verts.new(P(w_ / 2, h_ / 2)), pp.bm.verts.new(P(-w_ / 2, h_ / 2))])
        for lp in fc.loops: lp[pp.col] = col
        ink = list(B.srgb('#7d7a74')) + [1.0]; ttl = list(B.srgb('#b03a32' if i % 2 else '#2f4f7a')) + [1.0]
        for k in range(5):                                                                       # 標題一條（紅／藍）＋內文四條（灰）
            y0 = h_ / 2 - 0.05 - k * (h_ - 0.1) / 5; ln = (w_ - 0.06) * (0.9 if k else 0.7) * (1 - 0.15 * (k % 2))
            fc = pp.bm.faces.new([pp.bm.verts.new(P(-w_ / 2 + 0.03, y0 - (0.018 if k == 0 else 0.008), 0.001)), pp.bm.verts.new(P(-w_ / 2 + 0.03 + ln, y0 - (0.018 if k == 0 else 0.008), 0.001)),
                                  pp.bm.verts.new(P(-w_ / 2 + 0.03 + ln, y0, 0.001)), pp.bm.verts.new(P(-w_ / 2 + 0.03, y0, 0.001))])
            for lp in fc.loops: lp[pp.col] = ttl if k == 0 else ink
    fin(pp, parts)
    me = combine(parts, 'bulletin_board'); ob = bpy.data.objects.new('bulletin_board', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 10.0)
    return ob


# ---------- 飲料販賣機（W3.vending：1.1×1.9×0.8、底在 y=0、置中、正面朝 +z）----------
def vending_machine():
    parts = []; W, H, Dv = 1.1, 1.9, 0.8; zf = Dv / 2
    vb = Mesh('vend_cab', M['vbody'])
    DX0, DX1, DY0, DY1, ZB = -W / 2 + 0.05, 0.18, 0.72, 1.82, zf - 0.34                          # 展示窗（往內 34 cm 的凹槽：背光、層板、飲料都在裡面）
    vb.box(-W / 2, W / 2, 0.08, H, -Dv / 2, ZB)                                                   # 機身後半
    vb.box(-W / 2, DX0, 0.08, H, ZB, zf); vb.box(DX1, W / 2, 0.08, H, ZB, zf)                    # 展示窗左右（右邊是投幣面板那一側）
    vb.box(DX0, DX1, DY1, H, ZB, zf); vb.box(DX0, DX1, 0.08, DY0, ZB, zf)                        # 展示窗上下
    fin(vb, parts)
    dk = Mesh('vend_dark', M['dark'])
    dk.box(-W / 2 + 0.02, W / 2 - 0.02, 0.0, 0.08, -Dv / 2 + 0.02, zf - 0.02)                    # 底座
    dk.box(-0.4, 0.05, 0.16, 0.38, zf - 0.03, zf + 0.005)                                         # 取物口的門（下面是紅色機身，只有門是深色）
    dk.box(0.3, 0.5, 1.05, 1.28, zf + 0.01, zf + 0.02); dk.box(0.33, 0.47, 0.86, 0.9, zf + 0.01, zf + 0.022)  # 紙鈔口、投幣口
    dk.box(0.31, 0.49, 0.24, 0.4, zf + 0.01, zf + 0.025)                                          # 找零口
    fin(dk, parts)
    lt = Mesh('vend_light', M['vlight']); lt.box(DX0, DX1, DY0, DY1, ZB, ZB + 0.02)               # 展示窗的背光板（凹槽的底）
    lt.box(-W / 2 + 0.05, W / 2 - 0.05, 1.835, 1.885, zf - 0.005, zf + 0.004)                     # 頂上的燈條（晚上也亮）
    lt.box(0.31, 0.49, 1.36, 1.44, zf + 0.01, zf + 0.016); fin(lt, parts)                          # 投幣面板的金額顯示
    it = L.CMesh('vend_items', M['vc'])
    cols = ['#d23b33', '#2a7ac0', '#f2c230', '#3d9a5a', '#f4f4f0', '#e5762a', '#6a3d8f', '#24282a']
    for r in range(4):                                                                           # 四層、每層五種飲料（罐裝、寶特瓶）＋價格牌＋按鈕
        y0 = 0.76 + r * 0.265
        for c in range(5):
            x = -0.43 + c * 0.13; col = cols[(r * 3 + c * 5) % len(cols)]; can = (r + c) % 2 == 0
            hh, rr = (0.13, 0.034) if can else (0.18, 0.03)
            for k in range(8):                                                                   # 瓶身（八角柱，只做前半圈＋頂）
                a0, a1 = math.pi * k / 8, math.pi * (k + 1) / 8
                P = lambda a, y: g2b(x + rr * math.cos(a), y, zf - 0.2 + rr * math.sin(a))
                fc = it.bm.faces.new([it.bm.verts.new(P(a0, y0 + 0.02)), it.bm.verts.new(P(a1, y0 + 0.02)), it.bm.verts.new(P(a1, y0 + 0.02 + hh)), it.bm.verts.new(P(a0, y0 + 0.02 + hh))])
                for lp in fc.loops: lp[it.col] = list(B.srgb(col)) + [1.0]
            vcbox(it, x - 0.03, x + 0.03, y0 - 0.04, y0 - 0.016, zf - 0.02, zf - 0.005, '#2b2b2b' if (r + c) % 3 else '#c23b36')   # 按鈕（在層板前緣的白條上）
        vcbox(it, DX0, DX1, y0 - 0.002, y0 + 0.012, ZB, zf - 0.03, '#eeeeee')                     # 層板
        vcbox(it, DX0, DX1, y0 - 0.05, y0 - 0.002, zf - 0.04, zf - 0.02, '#e9e9e6')               # 層板前緣的白條（價格、按鈕）
    vcbox(it, 0.24, W / 2 - 0.04, 0.12, 1.8, zf, zf + 0.01, '#565a60')                             # 投幣面板（深灰烤漆）
    vcbox(it, DX0 + 0.02, DX1 - 0.02, 0.46, 0.66, zf, zf + 0.006, '#f2f2ee')                       # 取物口上面的廣告面板（白底藍帶）
    vcbox(it, DX0 + 0.02, DX1 - 0.02, 0.53, 0.59, zf + 0.006, zf + 0.008, '#2a6fb8')
    fin(it, parts)
    gl = Mesh('vend_glass', M['metal'])                                                         # 展示窗玻璃的鋁框（玻璃本身不做：看得到裡面的飲料）
    gl.box(-W / 2 + 0.05, 0.18, 1.8, 1.82, zf - 0.04, zf); gl.box(-W / 2 + 0.05, 0.18, 0.72, 0.74, zf - 0.04, zf)
    fin(gl, parts)
    me = combine(parts, 'vending_machine'); ob = bpy.data.objects.new('vending_machine', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 12.0)
    return ob


# ---------- 腳踏車多款式（使用者 2026-10-16 20:2x：「腳踏車機車都只是同個模板換顏色……路上不會全部都一樣」） ----------
# 參考 docs/art-rebuild/second_ai/research/vehicles_research.md（台灣校園常見：淑女車、公共單車、公路車、登山車、小折、老鐵馬、接小孩的媽媽車）。
# 約定和淑女車一樣：沿 z 建模（車頭 +z）、地面 y＝0、車架是 bike_frame（白色、遊戲乘上每台的顏色）、其他四個材質共用（停車架整排合併不加 draw call）。
# 不放品牌、商標、字。
def bk_begin():
    return {'frame': Mesh('frame', M['frame']), 'dark': Mesh('dark_parts', M['dark']), 'metal': Mesh('metal_parts', M['metal']),
            'red': Mesh('reflector', M['red']), 'alpha': Mesh('alpha', M['alpha']), 'tire': Mesh('tire', M['dark']), 'rim': Mesh('rim', M['metal'])}


def bk_end(P, name, x):
    parts = []
    fin(P['tire'], parts, smooth=1.2); fin(P['rim'], parts, smooth=1.2)
    if not P['alpha'].empty(): P['alpha'].bm.normal_update(); parts.append(P['alpha'].finish(None, uv=False, merge=False))
    fin(P['frame'], parts, smooth=0.9); fin(P['dark'], parts, smooth=1.0); fin(P['metal'], parts, smooth=1.0); fin(P['red'], parts)
    for ex in P.get('extra', []): fin(ex, parts, smooth=1.0)
    me = combine(parts, name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, x)
    print('bike', name, 'tris', sum(len(q.vertices) - 2 for q in me.polygons))
    return ob


def bk_wheel(P, z, R, tw, hubr=0.02, spokes=True, sq=False, seg=18):
    """輪子：外徑 R、胎寬 tw（車胎截面：一般是圓的，sq＝登山車那種寬而方的胎）；輪圈、花鼓；鋼絲是透明貼圖"""
    y = R
    prof = ([(-0.4 * tw, -0.42 * tw), (0.3 * tw, -0.5 * tw), (0.5 * tw, -0.25 * tw), (0.5 * tw, 0.25 * tw), (0.3 * tw, 0.5 * tw), (-0.4 * tw, 0.42 * tw)] if sq
            else [(-0.45 * tw, -0.4 * tw), (0.25 * tw, -0.5 * tw), (0.5 * tw, 0.0), (0.25 * tw, 0.5 * tw), (-0.45 * tw, 0.4 * tw)])
    Rc = R - 0.5 * tw; ring_x(P['tire'], (0, y, z), Rc, 0, seg=seg, prof=prof)
    Rr = Rc - 0.42 * tw - 0.004; ring_x(P['rim'], (0, y, z), Rr, 0, seg=seg, prof=[(-0.009, -0.011), (0.006, 0.0), (-0.009, 0.011)])
    P['metal'].cyl((-0.045, y, z), (0.045, y, z), hubr, seg=6)
    if spokes: disc_x(P['alpha'], (0, y, z), Rr - 0.004, seg=12)
    return Rr


def bk_drive(P, bb, zr, yr, ring=0.09, guard=False):
    """傳動（右邊 −x）：齒盤、曲柄、踏板、鍊條；guard＝全包鍊條蓋（車架顏色）"""
    x0, y0, z0 = bb
    P['metal'].cyl((-0.058, y0, z0), (-0.052, y0, z0), ring, seg=12)
    sweep(P['metal'], [(-0.085, y0, z0), (-0.09, y0 - 0.12, z0 + 0.1)], 0.009, seg=4); sweep(P['metal'], [(0.085, y0, z0), (0.09, y0 + 0.12, z0 - 0.1)], 0.009, seg=4)
    sweep(P['metal'], [(-0.085, y0, z0), (0.085, y0, z0)], 0.012, seg=5)
    P['dark'].box(-0.17, -0.095, y0 - 0.132, y0 - 0.108, z0 + 0.06, z0 + 0.14); P['dark'].box(0.095, 0.17, y0 + 0.108, y0 + 0.132, z0 - 0.14, z0 - 0.06)
    sweep(P['dark'], [(-0.066, y0 + ring - 0.004, z0), (-0.066, yr + 0.045, zr)], 0.005, seg=3); sweep(P['dark'], [(-0.066, y0 - ring + 0.004, z0), (-0.066, yr - 0.045, zr)], 0.005, seg=3)
    P['metal'].cyl((-0.062, yr, zr), (-0.056, yr, zr), 0.05, seg=8)
    if guard:   # 全包鍊條蓋：齒盤到後輪的長圓殼（右邊）
        cg = [(math.cos(math.pi * i / 6), math.sin(math.pi * i / 6)) for i in range(7)]
        pts = [(z0 + (ring + 0.03) * s_, y0 + (ring + 0.03) * c) for (c, s_) in cg] + [(zr - 0.075 * s_, yr - 0.075 * c) for (c, s_) in cg]
        fr = P['frame']; vs = [fr.bm.verts.new(g2b(-0.085, y, z)) for (z, y) in pts]; vs2 = [fr.bm.verts.new(g2b(-0.05, y, z)) for (z, y) in pts]
        fr.bm.faces.new(vs); fr.bm.faces.new(list(reversed(vs2)))
        for i in range(len(vs)):
            j = (i + 1) % len(vs); fr.bm.faces.new((vs[i], vs[j], vs2[j], vs2[i]))


def bk_saddle(P, c, L=0.27, W=0.075, H=0.03, wide=1.0):
    """座墊（窄長；wide＞1 是寬的淑女車、公共單車座墊）：斷面放樣，車頭 +z"""
    x, y, z = c; dk = P['dark']; rings = []
    for (dz, hw, hh) in [(-0.5, 0.75, 0.8), (-0.32, 1.0, 1.0), (-0.05, 0.75, 0.95), (0.22, 0.36, 0.8), (0.5, 0.18, 0.55)]:
        ring = []
        for k in range(6):
            t = 2 * math.pi * k / 6; cc, ss = math.cos(t), math.sin(t); e = 2 / 2.8
            ring.append(dk.bm.verts.new(g2b(x + W * wide * hw * math.copysign(abs(cc) ** e, cc), y + H * hh * math.copysign(abs(ss) ** e, ss), z + dz * L)))
        rings.append(ring)
    for a, b_ in zip(rings, rings[1:]):
        for k in range(6):
            j = (k + 1) % 6; dk.bm.faces.new((a[k], a[j], b_[j], b_[k]))
    dk.bm.faces.new(rings[0]); dk.bm.faces.new(list(reversed(rings[-1])))


def bike_road(x):
    """公路車：700C 細胎、菱形車架（細管、上管幾乎水平）、彎把（纏把帶）、窄座墊；沒有擋泥板、籃子、腳架"""
    P = bk_begin(); R, zr, zf = 0.335, -0.49, 0.49; BB = (0, 0.27, -0.085); S = (0, 0.80, -0.245); Hb, Ht = (0, 0.66, 0.355), (0, 0.80, 0.315)
    for z in (zr, zf): bk_wheel(P, z, R, 0.026, hubr=0.016, seg=20)
    fr = P['frame']
    sweep(fr, [BB, S], 0.016, seg=8); sweep(fr, [BB, Hb], 0.021, seg=8); sweep(fr, [(0, 0.785, -0.235), (0, 0.79, 0.322)], 0.015, seg=8); sweep(fr, [Hb, (0, 0.82, 0.31)], 0.019, seg=8)
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.03, 0.27, -0.1), (sx * 0.06, R, zr + 0.01)], 0.009, seg=5); sweep(fr, [(sx * 0.02, 0.775, -0.24), (sx * 0.06, R + 0.01, zr + 0.01)], 0.008, seg=5)
        sweep(fr, bez((sx * 0.028, 0.66, 0.355), (sx * 0.045, 0.47, 0.42), (sx * 0.05, R, zf), n=4), 0.011, seg=5)
    dk = P['dark']; sweep(dk, [(0, 0.83, 0.31), (0, 0.855, 0.42)], 0.016, seg=6)   # 龍頭
    for s in (-1, 1):   # 彎把：上把 → 往前 → 往下彎 → 下把（纏把帶）；變把手（煞車拉桿）
        sweep(dk, [(0, 0.855, 0.42), (s * 0.2, 0.855, 0.42), (s * 0.21, 0.853, 0.49)] + bez((s * 0.21, 0.853, 0.49), (s * 0.215, 0.85, 0.585), (s * 0.21, 0.765, 0.565), n=4)[1:] + [(s * 0.21, 0.74, 0.49)], 0.013, seg=5)
        dk.rbox(s * 0.21 - 0.016, s * 0.21 + 0.016, 0.85, 0.89, 0.49, 0.53, r=0.01, seg=1)
    sweep(P['metal'], [S, (0, 0.92, -0.295)], 0.0135, seg=6); bk_saddle(P, (0, 0.945, -0.30), L=0.27, W=0.07, H=0.026)
    for z, y in ((zf - 0.07, 0.66), (zr + 0.11, 0.66)): P['metal'].rbox(-0.03, 0.03, y - 0.02, y + 0.02, z - 0.02, z + 0.02, r=0.008, seg=1)   # 夾器
    bk_drive(P, BB, zr, R, ring=0.1)
    P['red'].box(-0.025, 0.025, 0.86, 0.885, -0.33, -0.32)
    return bk_end(P, 'bike_road', x)


def bike_mtb(x):
    """登山車：27.5 吋寬胎（方的胎面）、粗下管、斜上管、前避震（上管銀、下管黑）、碟煞、寬平把"""
    P = bk_begin(); R, zr, zf = 0.36, -0.555, 0.555; BB = (0, 0.33, -0.12); S = (0, 0.76, -0.30); Hb, Ht = (0, 0.72, 0.40), (0, 0.84, 0.36)
    for z in (zr, zf): bk_wheel(P, z, R, 0.058, hubr=0.024, sq=True, seg=20)
    fr = P['frame']
    sweep(fr, [BB, S], 0.018, seg=8); sweep(fr, [BB, Hb], 0.027, seg=8); sweep(fr, [(0, 0.735, -0.285), (0, 0.825, 0.365)], 0.02, seg=8); sweep(fr, [Hb, Ht], 0.024, seg=8)
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.035, 0.33, -0.14), (sx * 0.07, R, zr + 0.01)], 0.012, seg=5); sweep(fr, [(sx * 0.022, 0.72, -0.29), (sx * 0.07, R + 0.01, zr + 0.01)], 0.01, seg=5)
    mt, dk = P['metal'], P['dark']
    dk.rbox(-0.07, 0.07, 0.69, 0.73, 0.38, 0.44, r=0.012, seg=1)   # 避震前叉的肩
    for sx in (-1, 1):
        mt.cyl((sx * 0.055, 0.70, 0.415), (sx * 0.055, 0.57, 0.47), 0.016, seg=8)   # 內管（銀）
        sweep(dk, [(sx * 0.057, 0.60, 0.46), (sx * 0.058, R, zf)], 0.021, seg=8)    # 外管（黑）
    sweep(dk, [(-0.057, 0.56, 0.475), (0, 0.585, 0.49), (0.057, 0.56, 0.475)], 0.012, seg=4)   # 前叉拱
    for z in (zr, zf): mt.cyl((0.062, R, z), (0.066, R, z), 0.08, seg=12)          # 碟盤（左邊）
    sweep(dk, [(0, 0.86, 0.36), (0, 0.9, 0.43)], 0.018, seg=6)
    sweep(dk, [(-0.36, 0.915, 0.43), (-0.1, 0.905, 0.435), (0.1, 0.905, 0.435), (0.36, 0.915, 0.43)], 0.0125, seg=6)
    for s in (-1, 1): sweep(dk, [(s * 0.26, 0.915, 0.43), (s * 0.36, 0.917, 0.43)], 0.018, seg=6)   # 握把
    sweep(mt, [S, (0, 0.88, -0.335)], 0.016, seg=6); bk_saddle(P, (0, 0.905, -0.34), L=0.27, W=0.075, H=0.03)
    bk_drive(P, BB, zr, R, ring=0.08)
    sweep(dk, [(0.07, R, zr + 0.06), (0.12, 0.01, zr + 0.26)], 0.008, seg=3)   # 側腳架（左）
    return bk_end(P, 'bike_mtb', x)


def bike_fold(x):
    """小折：20 吋小輪、一根粗主管（中間折疊鉸鏈）、很長的座管和龍頭立管、窄平把、小後架"""
    P = bk_begin(); R, zr, zf = 0.25, -0.47, 0.50; BB = (0, 0.26, -0.10); Hb, Ht = (0, 0.50, 0.37), (0, 0.62, 0.345)
    for z in (zr, zf): bk_wheel(P, z, R, 0.042, hubr=0.018, seg=16)
    fr, mt, dk = P['frame'], P['metal'], P['dark']
    sweep(fr, bez(Hb, (0, 0.40, 0.12), (0, 0.33, -0.06), n=5), 0.027, seg=8)   # 主管
    sweep(fr, [BB, (0, 0.62, -0.17)], 0.021, seg=8); sweep(fr, [(0, 0.33, -0.06), BB], 0.024, seg=8); sweep(fr, [Hb, Ht], 0.022, seg=8)
    mt.rbox(-0.035, 0.035, 0.38, 0.45, 0.13, 0.2, r=0.012, seg=1)   # 折疊鉸鏈
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.03, 0.26, -0.12), (sx * 0.05, R, zr + 0.01)], 0.011, seg=5); sweep(fr, [(sx * 0.02, 0.58, -0.165), (sx * 0.05, R + 0.01, zr + 0.01)], 0.009, seg=5)
        sweep(fr, [(sx * 0.026, 0.50, 0.37), (sx * 0.04, R, zf)], 0.012, seg=5)
    sweep(mt, [Ht, (0, 1.0, 0.28)], 0.017, seg=6); mt.rbox(-0.03, 0.03, 0.70, 0.76, 0.30, 0.34, r=0.01, seg=1)   # 龍頭立管＋折疊扣
    sweep(dk, [(-0.27, 1.0, 0.28), (0.27, 1.0, 0.28)], 0.012, seg=5)
    for s in (-1, 1): sweep(dk, [(s * 0.18, 1.0, 0.28), (s * 0.27, 1.0, 0.28)], 0.017, seg=6)
    sweep(mt, [(0, 0.62, -0.17), (0, 0.92, -0.245)], 0.017, seg=6); bk_saddle(P, (0, 0.945, -0.255), L=0.26, W=0.08, H=0.032, wide=1.15)
    for sx in (-0.06, 0.06): sweep(mt, [(sx, 0.56, -0.22), (sx, 0.56, -0.62)], 0.006, seg=4); sweep(mt, [(sx, 0.56, -0.6), (sx * 0.8, R, zr)], 0.006, seg=4)
    for z in (-0.32, -0.52): sweep(mt, [(-0.06, 0.56, z), (0.06, 0.56, z)], 0.005, seg=3)
    fprof = [(0.0, -0.03), (0.012, 0.0), (0.0, 0.03)]
    ring_x(fr, (0, R, zf), R + 0.018, 0, seg=7, a0=math.radians(-30), a1=math.radians(105), prof=fprof, prof_closed=False)
    ring_x(fr, (0, R, zr), R + 0.018, 0, seg=7, a0=math.radians(-140), a1=math.radians(20), prof=fprof, prof_closed=False)
    bk_drive(P, BB, zr, R, ring=0.1)
    sweep(mt, [(0.05, R, zr + 0.05), (0.11, 0.01, zr + 0.2)], 0.008, seg=3)
    P['red'].box(-0.03, 0.03, 0.52, 0.55, -0.635, -0.62)
    return bk_end(P, 'bike_fold', x)


def bike_old(x):
    """老鐵馬：28 吋大輪、黑色菱形車架（上管水平）、全包擋泥板、大後貨架、全包鍊條蓋、彈簧座墊、往後彎的把手、桿式煞車、車頭燈"""
    P = bk_begin(); R, zr, zf = 0.35, -0.58, 0.58; BB = (0, 0.28, -0.08); S = (0, 0.80, -0.27); Hb, Ht = (0, 0.64, 0.41), (0, 0.83, 0.36)
    for z in (zr, zf): bk_wheel(P, z, R, 0.04, hubr=0.024, seg=20)
    fr, mt, dk = P['frame'], P['metal'], P['dark']
    sweep(fr, [BB, S], 0.017, seg=8); sweep(fr, [BB, Hb], 0.019, seg=8); sweep(fr, [(0, 0.79, -0.26), (0, 0.80, 0.37)], 0.017, seg=8); sweep(fr, [Hb, Ht], 0.02, seg=8)
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.03, 0.28, -0.1), (sx * 0.055, R, zr + 0.01)], 0.01, seg=5); sweep(fr, [(sx * 0.02, 0.775, -0.27), (sx * 0.055, R + 0.01, zr + 0.01)], 0.009, seg=5)
        sweep(fr, bez((sx * 0.028, 0.64, 0.41), (sx * 0.05, 0.47, 0.5), (sx * 0.055, R, zf), n=4), 0.012, seg=5)
    fprof = [(0.0, -0.04), (0.016, 0.0), (0.0, 0.04)]
    # 擋泥板、大後貨架：黑烤漆＋鏽（ART-BIKES2-F：老鐵馬要鏽和褪色）。頂點色：越低、越靠末端鏽得越多；不是均勻撒
    ru = L.CMesh('old_rust', M['oldm'])
    ring_x(ru, (0, R, zf), R + 0.025, 0, seg=9, a0=math.radians(-45), a1=math.radians(120), prof=fprof, prof_closed=False)
    ring_x(ru, (0, R, zr), R + 0.025, 0, seg=10, a0=math.radians(-160), a1=math.radians(30), prof=fprof, prof_closed=False)
    for sx in (-0.075, 0.075):
        sweep(ru, [(sx, 0.74, -0.28), (sx, 0.74, -0.86)], 0.009, seg=4); sweep(ru, [(sx, 0.74, -0.82), (sx * 0.75, R, zr)], 0.009, seg=4)
    for z in (-0.42, -0.58, -0.74): sweep(ru, [(-0.075, 0.74, z), (0.075, 0.74, z)], 0.007, seg=3)
    paint_c = (0.032, 0.033, 0.034); rust_c = (0.20, 0.075, 0.03); rust_d = (0.09, 0.035, 0.016)
    for f in ru.bm.faces:
        for lp in f.loops:
            co = lp.vert.co; y = co.z; zg = -co.y                      # Blender → 遊戲座標（y 高度、z 車身方向）
            t = max(0.0, min(1.0, (0.62 - y) / 0.5)) ** 1.3             # 低的地方（擋泥板下緣）鏽多
            t = max(t, max(0.0, min(1.0, (abs(zg) - 0.78) / 0.12)))     # 貨架、擋泥板的末端
            n = 0.5 + 0.5 * math.sin(co.x * 91.0 + co.y * 53.0 + co.z * 37.0)   # 斑駁（同一處有深有淺）
            sp = max(0.0, min(1.0, (n - 0.55) / 0.25))                   # 鏽是一塊一塊的（第一版整個下緣都是鏽＝廢棄車；目標「用了三到五年」）
            k = t * (0.10 + 0.80 * sp); rc = rust_c if n > 0.7 else rust_d
            lp[ru.col] = tuple(paint_c[i] * (1 - k) + rc[i] * k for i in range(3)) + (1.0,)
    sweep(mt, [S, (0, 0.88, -0.30)], 0.014, seg=6); bk_saddle(P, (0, 0.93, -0.31), L=0.26, W=0.095, H=0.035, wide=1.1)
    for sx in (-0.05, 0.05): mt.cyl((sx, 0.86, -0.39), (sx, 0.905, -0.39), 0.014, seg=6)   # 座墊彈簧
    sweep(mt, [Ht, (0, 0.95, 0.35)], 0.014, seg=6)
    for s in (-1, 1):
        sweep(mt, [(0, 0.95, 0.35), (s * 0.18, 0.955, 0.36), (s * 0.27, 0.95, 0.30), (s * 0.30, 0.935, 0.17)], 0.011, seg=5)
        sweep(dk, [(s * 0.30, 0.936, 0.21), (s * 0.30, 0.932, 0.11)], 0.017, seg=6)
        sweep(mt, [(s * 0.25, 0.94, 0.28), (s * 0.04, 0.80, 0.39), (s * 0.06, R + 0.32, zf - 0.02)], 0.004, seg=3)   # 桿式煞車
    mt.cyl((0, 0.74, 0.45), (0, 0.74, 0.52), 0.045, seg=10, r2=0.05); P['metal'].cyl((0, 0.74, 0.52), (0, 0.74, 0.525), 0.042, seg=10)   # 車頭燈
    bk_drive(P, BB, zr, R, ring=0.1, guard=True)
    for sx in (-1, 1): sweep(mt, [(sx * 0.055, R, zr), (sx * 0.1, 0.012, zr - 0.13)], 0.008, seg=3)
    sweep(mt, [(-0.1, 0.012, zr - 0.13), (0.1, 0.012, zr - 0.13)], 0.008, seg=3)
    P['red'].box(-0.04, 0.04, 0.70, 0.73, -0.885, -0.87)
    P['extra'] = [ru]
    return bk_end(P, 'bike_old', x)


def bike_share(x):
    """公共單車形式（不做任何系統的標誌、字、配色細節）：粗的單一彎下管、24 吋輪、車架上的方形塑膠籃、全包鍊條蓋、擋泥板、寬座墊、中柱、輪轂發電燈"""
    P = bk_begin(); R, zr, zf = 0.31, -0.50, 0.50; BB = (0, 0.27, -0.07); Hb, Ht = (0, 0.60, 0.37), (0, 0.76, 0.34)
    for z in (zr, zf): bk_wheel(P, z, R, 0.042, hubr=0.03, seg=18)
    fr, mt, dk = P['frame'], P['metal'], P['dark']
    sweep(fr, bez(Hb, (0, 0.20, 0.24), BB, n=7), 0.032, seg=8); sweep(fr, [BB, (0, 0.72, -0.20)], 0.027, seg=8); sweep(fr, [Hb, Ht], 0.027, seg=8)
    for sx in (-1, 1):
        sweep(fr, [(sx * 0.035, 0.27, -0.09), (sx * 0.055, R, zr + 0.01)], 0.013, seg=5); sweep(fr, [(sx * 0.025, 0.68, -0.20), (sx * 0.055, R + 0.01, zr + 0.01)], 0.012, seg=5)
        sweep(fr, bez((sx * 0.03, 0.60, 0.37), (sx * 0.05, 0.45, 0.44), (sx * 0.055, R, zf), n=4), 0.014, seg=5)
    fprof = [(0.0, -0.04), (0.016, 0.0), (0.0, 0.04)]
    ring_x(fr, (0, R, zf), R + 0.022, 0, seg=8, a0=math.radians(-40), a1=math.radians(112), prof=fprof, prof_closed=False)
    ring_x(fr, (0, R, zr), R + 0.022, 0, seg=9, a0=math.radians(-150), a1=math.radians(25), prof=fprof, prof_closed=False)
    dk.rbox(-0.19, 0.19, 0.68, 0.92, 0.36, 0.66, r=0.025, seg=1)   # 方形塑膠籃（深灰）
    for sx in (-1, 1): sweep(mt, [(sx * 0.12, 0.68, 0.40), (sx * 0.04, 0.62, 0.38)], 0.009, seg=4); sweep(mt, [(sx * 0.12, 0.68, 0.60), (sx * 0.045, R + 0.03, zf)], 0.007, seg=4)
    mt.cyl((0, 0.80, 0.665), (0, 0.80, 0.69), 0.04, seg=10)   # 籃子前面的燈
    sweep(dk, [(0, 0.79, 0.34), (0, 0.86, 0.30)], 0.02, seg=6)
    for s in (-1, 1): sweep(mt, bez((0, 0.86, 0.30), (s * 0.2, 0.88, 0.33), (s * 0.29, 0.87, 0.14), n=3), 0.012, seg=5); sweep(dk, [(s * 0.29, 0.872, 0.19), (s * 0.29, 0.866, 0.09)], 0.019, seg=6)
    sweep(mt, [(0, 0.72, -0.20), (0, 0.87, -0.245)], 0.019, seg=6); bk_saddle(P, (0, 0.895, -0.255), L=0.27, W=0.09, H=0.04, wide=1.25)
    bk_drive(P, BB, zr, R, ring=0.09, guard=True)
    for sx in (-1, 1): sweep(mt, [(sx * 0.06, 0.25, -0.12), (sx * 0.12, 0.012, -0.2)], 0.01, seg=4)   # 中柱
    sweep(mt, [(-0.12, 0.012, -0.2), (0.12, 0.012, -0.2)], 0.009, seg=3)
    P['red'].box(-0.04, 0.04, 0.50, 0.535, -0.845, -0.83)
    return bk_end(P, 'bike_share', x)


bike(); lamp_post(); bench_park(); planter_box(); bulletin_board(); vending_machine()
bike('bike_city_child', child=True, x=14.0)
bike('bike_city_open', x=26.0, basket='none'); bike('bike_city_pbask', x=28.0, basket='plastic'); bike('bike_city_load', x=30.0, load=True)   # ART-BIKES2-F 淑女車再分款
bike_road(16.0); bike_mtb(18.0); bike_fold(20.0); bike_old(22.0); bike_share(24.0)
tris = {}
for ob in root.children:
    if ob.type != 'MESH': continue
    me = ob.data; me.calc_loop_triangles(); tris[ob.name] = len(me.loop_triangles)
    for ch in ob.children:
        if ch.type == 'MESH': ch.data.calc_loop_triangles(); tris[ch.name] = len(ch.data.loop_triangles)
print('TRIS', tris)
info = L.export(OUT, gpu_instances=False); info['tris_per_prop'] = tris
L.write_json(OUT[:-4] + '.json', info)
