"""街道道具（第二 AI 工作階段：後備 A，docs/SECOND_AI_HANDOFF.md 第三項）→ 一個 GLB，每樣道具一個網格（多個材質）：
  bike_city：淑女車（台灣學生最常騎的低跨車）——彎下管、前面的鐵絲籃、擋泥板、後貨架、鍊條蓋、36 根鋼絲（貼圖）、環形鎖、雙腳中柱、車鈴。
     座標照 W3.bike 的約定：沿 z 建模（車頭 +z）、輪子在 z=±0.47、輪心高 0.30（外徑 0.30）、座墊頂約 0.86、把手 0.9；遊戲端外層再轉 π/2。
     車架顏色：材質 bike_frame 是白色，遊戲用頂點色乘上每台的顏色（所有顏色共用一個材質，停車架整排可以合併）。
  lamp_post：路燈。燈頭位置和 W3.lampPost 一樣：燈罩中心 (0, 3.99, 0.8)、發光面 (0, 3.985, 0.8) 朝下、光源 (0, 3.9, 0.75)。
     發光面另外一個物件 lamp_post_lens（遊戲端換成套件原本的發光材質，入夜的光暈照舊）。
  bench_park：公園長椅（鑄鐵椅腳＋扶手、木條座面與椅背），寬 1.35 m、座面高 0.45 m（和 prop.bench 縮放後一樣）；正面朝 +z。
  ⑥（2026-10-11，LAWWW 佇列）法學院廣場等地的近景小物，尺寸照 W3 的程序化版本（導航阻擋在 zones3d.js，不變）：
  planter_box：花台（水泥花槽 1.2×0.48×0.5＋壓頂、土、交叉葉片卡的灌木、五瓣小花）；bulletin_board：公告欄（木柱、木框、軟木板、小雨遮、九張公告紙＋字行）；
  vending_machine：飲料販賣機（紅色機身、展示窗裡四層罐裝與寶特瓶、背光、價格牌與按鈕、投幣與紙鈔口、取物口；1.1×1.9×0.8、正面朝 +z）。
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
    'metal': L.flat('bike_metal', '#b9bdc3', rough=0.3, metal=0.55),
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
    'vbody': L.flat('vend_body', '#c23b36', rough=0.35, metal=0.3),
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


def place(ob, x, y=0.0):
    ob.location = (x, y, 0.0)   # 匯出時分開放（遊戲照名稱取，不看位置）


# ---------- 淑女車 ----------
def quad_uv(m, pts, uvs):
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def bike():
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
    for y, r in ((by1, 0.007), (by0, 0.005)):
        sweep(mt, [(bx0, y, bz0), (bx1, y, bz0), (bx1, y, bz1), (bx0, y, bz1), (bx0, y, bz0)], r, seg=3, caps=False)
    for x in (bx0, bx1):
        for z in (bz0, bz1): sweep(mt, [(x, by0, z), (x, by1, z)], 0.004, seg=3, caps=False)
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
    me = combine(parts, 'bike_city'); ob = bpy.data.objects.new('bike_city', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 0.0)
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
            x = -0.44 + i * 0.22 + row * 0.08; h = 0.36 + ((i + row) % 3) * 0.04; w_ = 0.24
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
    dk.box(-W / 2 + 0.05, 0.18, 0.12, 0.62, zf, zf + 0.01)                                        # 下面整塊深色（取物口那一區）
    dk.box(-0.4, 0.05, 0.2, 0.4, zf - 0.03, zf + 0.005)                                           # 取物口的門
    dk.box(0.26, W / 2 - 0.05, 0.12, 1.82, zf, zf + 0.01)                                         # 投幣面板
    dk.box(0.3, 0.5, 1.05, 1.3, zf - 0.01, zf + 0.01); dk.box(0.32, 0.48, 0.85, 0.9, zf - 0.01, zf + 0.012)   # 紙鈔口、投幣口
    dk.box(0.3, 0.5, 0.25, 0.42, zf - 0.01, zf + 0.02)                                            # 找零口
    fin(dk, parts)
    lt = Mesh('vend_light', M['vlight']); lt.box(DX0, DX1, DY0, DY1, ZB, ZB + 0.02); fin(lt, parts)   # 展示窗的背光板（凹槽的底）
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
    vcbox(it, -W / 2 + 0.05, 0.18, 1.83, 1.88, zf - 0.005, zf + 0.002, '#f4f4f0')                 # 頂上的白色燈條
    fin(it, parts)
    gl = Mesh('vend_glass', M['metal'])                                                         # 展示窗玻璃的鋁框（玻璃本身不做：看得到裡面的飲料）
    gl.box(-W / 2 + 0.05, 0.18, 1.8, 1.82, zf - 0.04, zf); gl.box(-W / 2 + 0.05, 0.18, 0.72, 0.74, zf - 0.04, zf)
    fin(gl, parts)
    me = combine(parts, 'vending_machine'); ob = bpy.data.objects.new('vending_machine', me); bpy.context.scene.collection.objects.link(ob); ob.parent = root; place(ob, 12.0)
    return ob


bike(); lamp_post(); bench_park(); planter_box(); bulletin_board(); vending_machine()
tris = {}
for ob in root.children:
    if ob.type != 'MESH': continue
    me = ob.data; me.calc_loop_triangles(); tris[ob.name] = len(me.loop_triangles)
    for ch in ob.children:
        if ch.type == 'MESH': ch.data.calc_loop_triangles(); tris[ch.name] = len(ch.data.loop_triangles)
print('TRIS', tris)
info = L.export(OUT, gpu_instances=False); info['tris_per_prop'] = tris
L.write_json(OUT[:-4] + '.json', info)
