"""⑫ 騎車用的腳踏車（台灣校園常見的淑女車／通勤車，26 吋）→ assets/models/env/bike_ride.glb（＋bike_ride.json 尺寸表）。
第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/bike_ride.py [-- --out assets/models/env/bike_ride.glb] [--preview 資料夾]

造型和街上停的淑女車（street_props.py 的 bike_city）同一款：低跨的彎下管、前面的鐵絲籃、擋泥板、後貨架、鍊條蓋、環形鎖、車鈴、前燈；
這台是給玩家騎的近景版本：放大成成人騎的 26 吋、細節多一點，零件分開、樞紐點正確，讓遊戲（LAWWW）做騎乘動作。

座標（遊戲座標，公尺）：車頭朝 +z、地面 y=0、車子的中心線 x=0；騎士面向 +z 時，**左手邊是 +x、右手邊是 −x**（鍊條、齒盤在右邊 −x）。
節點（glTF，名稱固定）與怎麼動：
  frame（根）：車架、座管＋座墊、後貨架、後擋泥板、鍊條蓋、鍊條、環形鎖、中柱（收起）；原點在地面 (0,0,0)。
  ├ fork：前叉＋龍頭＋把手（握把、煞車把、車鈴）＋前籃＋前擋泥板＋前燈；原點在轉向軸和頭管下緣的交點；
  │        本地 +Y＝轉向軸（往上、往後傾 20°）——轉把手＝繞本地 Y 轉（右轉＝從上往下看順時針）。
  │  └ wheel_f：前輪（輪胎、輪圈、花鼓、鋼絲）；原點在前輪軸心，繞本地 X 轉（往前滾＝從 +x 看逆時針……照遊戲的速度換算角度）。
  ├ wheel_r：後輪；原點在後輪軸心，繞本地 X 轉。
  └ crank：齒盤＋兩根曲柄；原點在五通中心，繞本地 X 轉（靜止姿勢：右曲柄（−x）朝前、左曲柄（+x）朝後，都是水平）。
     ├ pedal_r：右踏板，原點在踏板軸（右曲柄末端），繞本地 X 轉——遊戲每格轉「負的曲柄角度」讓踏板保持水平。
     └ pedal_l：左踏板，同上。
尺寸表（座墊頂、把手握點左右、五通、曲柄長、踏板中心、輪徑、軸距、轉向軸）寫在 bike_ride.json（從模型量出來的，不是另外抄的）。
材質：車架 ride_frame（顏色可以在遊戲改）、黑色零件、金屬、反光片；鋼絲與鐵絲籃是透明貼圖（textures/gen/bike_alpha.png，本作程式產生，和停著的淑女車同一張）。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/bike_ride.glb'))
ALPHA = os.path.join(HERE, 'textures', 'gen', 'bike_alpha.png')

# ---------------- 尺寸（26 吋城市車；成人騎） ----------------
TIRE_R = 0.333              # 輪胎外半徑（26×1-3/8，外徑約 0.666 m）
WY = TIRE_R                 # 輪軸高
RZ, FZ = -0.50, 0.56        # 後輪軸、前輪軸的 z（軸距 1.06 m）
BB = (0.0, 0.285, -0.045)   # 五通中心（比輪軸低 4.8 cm）
CRANK = 0.165               # 曲柄長
Q = 0.075                   # 曲柄外側到中心線的距離（左右各一）
PEDAL_X = 0.115             # 踏板中心的 x（左 +、右 −）
HEAD_ANG = math.radians(70) # 頭管角（和水平面的夾角）
RAKE = 0.05                 # 前叉偏移（輪軸在轉向軸前面的距離，垂直於轉向軸量）
SEAT_ANG = math.radians(70) # 座管角
SADDLE_TOP = 0.935          # 座墊頂高（照 175 cm 左右的大學生調的高度）
# 轉向軸：通過前輪軸往後 RAKE 的直線；方向（往上）＝(0, sin, −cos)
AX = Vector((0.0, math.sin(HEAD_ANG), -math.cos(HEAD_ANG)))
FA = Vector((0.0, WY, FZ))
_perp = Vector((0.0, math.cos(HEAD_ANG), math.sin(HEAD_ANG)))       # 垂直於轉向軸、朝前上
AXP = FA - _perp * RAKE                                             # 轉向軸上離前輪軸最近的點
def on_axis(y):                                                     # 轉向軸上高度 y 的點（遊戲座標）
    t = (y - AXP.y) / AX.y; return AXP + AX * t
HT_BOT, HT_TOP = on_axis(0.70), on_axis(0.88)                       # 頭管下緣、上緣
STEM_TOP = on_axis(1.03)
ST_DIR = Vector((0.0, math.sin(SEAT_ANG), -math.cos(SEAT_ANG)))     # 座管方向（往上、往後）
def seat_at(y):
    t = (y - BB[1]) / ST_DIR.y; return Vector(BB) + ST_DIR * t
ST_TOP = seat_at(0.78)                                              # 座管上緣（座管束）
SADDLE = seat_at(SADDLE_TOP - 0.06)                                 # 座墊夾的位置（座墊頂往下 6 cm）

B.reset(texres=512)
M = {
    'frame': L.flat('ride_frame', '#4f7f74', rough=0.35, metal=0.1),          # 霧面的灰綠色烤漆（常見的淑女車顏色）；遊戲可以改色
    'dark': L.flat('ride_dark', '#1d1e20', rough=0.75),
    'rubber': L.flat('ride_rubber', '#262728', rough=0.9),
    'metal': L.flat('ride_metal', '#c3c7cc', rough=0.28, metal=0.45),
    'saddle': L.flat('ride_saddle', '#2a2420', rough=0.55),
    'cushion': L.flat('ride_cushion', '#2c3140', rough=0.5),            # 後座軟墊（載妹墊）：深藍灰的合成皮
    'strap': L.flat('ride_strap', '#151618', rough=0.8),
    'red': L.flat('ride_reflector', '#b3261e', rough=0.25),
    'amber': L.flat('ride_reflector_amber', '#e39a2a', rough=0.25),
    'lens': L.flat('ride_lamp_lens', '#fff4d6', rough=0.2, emit=B.srgb('#fff1cf')),
}
def tex_material(name, path, rough=0.4, metal=0.4):
    m = L.flat(name, '#ffffff', rough=rough, metal=metal); nt = m.node_tree; N = nt.nodes
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); tx.image.alpha_mode = 'STRAIGHT'
    bs = N['Principled BSDF']; nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    rd = N.new('ShaderNodeMath'); rd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rd.inputs[0]); nt.links.new(rd.outputs[0], bs.inputs['Alpha'])   # alphaMode MASK
    return m
M['alpha'] = tex_material('ride_alpha', ALPHA)


# ---------------- 幾何小工具（遊戲座標） ----------------
def V(p): return Vector(p) if not isinstance(p, Vector) else p
def frames(P):
    T = [(P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized() for i in range(len(P))]
    ref = Vector((0, 0, 1)) if abs(T[0].z) < 0.9 else Vector((1, 0, 0))
    N = [T[0].cross(ref).normalized()]
    for t in T[1:]:
        n = N[-1] - t * N[-1].dot(t); N.append(n.normalized() if n.length > 1e-6 else t.cross(ref).normalized())
    return T, N
def sweep(m, pts, r, seg=8, caps=True, r1=None):
    P = [g2b(*V(p)) for p in pts]; T, N = frames(P); bm = m.bm; rings = []
    for i, (p, t, n) in enumerate(zip(P, T, N)):
        b = t.cross(n); rr = r if r1 is None else r + (r1 - r) * i / (len(P) - 1)
        rings.append([bm.verts.new(p + (n * math.cos(2 * math.pi * k / seg) + b * math.sin(2 * math.pi * k / seg)) * rr) for k in range(seg)])
    for a, b_ in zip(rings, rings[1:]):
        for k in range(seg):
            j = (k + 1) % seg; bm.faces.new((a[k], a[j], b_[j], b_[k]))
    if caps: bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return m
def bez(p0, p1, p2, n=8):
    p0, p1, p2 = V(p0), V(p1), V(p2)
    return [p0 * (1 - t) ** 2 + p1 * 2 * (1 - t) * t + p2 * t * t for t in [i / n for i in range(n + 1)]]
def ring_x(m, c, R, seg=32, a0=None, a1=None, prof=None, prof_closed=True):
    """繞 x 軸的環（輪胎、輪圈、擋泥板）：中心 c、半徑 R、斷面 prof＝[(徑向, x)…]；a0/a1：只做一段弧（角度從 +y 往 +z 量）"""
    bm = m.bm; closed = a0 is None; c = V(c)
    n = seg if closed else seg + 1; rings = []
    for i in range(n):
        t = (2 * math.pi * i / seg) if closed else a0 + (a1 - a0) * i / seg
        dy, dz = math.cos(t), math.sin(t)
        rings.append([bm.verts.new(g2b(c.x + ox, c.y + (R + dr) * dy, c.z + (R + dr) * dz)) for (dr, ox) in prof])
    pairs = list(zip(rings, rings[1:])) + ([(rings[-1], rings[0])] if closed else [])
    for a, b_ in pairs:
        for k in range(len(prof) if prof_closed else len(prof) - 1):
            j = (k + 1) % len(prof); bm.faces.new((a[k], a[j], b_[j], b_[k]))
    return m
def disc_x(m, c, r, seg=24, u0=0.0, u1=0.5):
    """繞 x 軸的圓片（鋼絲貼圖：UV 對到貼圖左半的圓）"""
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); c = V(c); ctr = bm.verts.new(g2b(*c)); vs = []
    for i in range(seg):
        t = 2 * math.pi * i / seg; vs.append((bm.verts.new(g2b(c.x, c.y + r * math.cos(t), c.z + r * math.sin(t))), math.cos(t), math.sin(t)))
    um = (u0 + u1) / 2; uh = (u1 - u0) / 2
    for i in range(seg):
        a, b_ = vs[i], vs[(i + 1) % seg]; f = bm.faces.new((ctr, a[0], b_[0]))
        for lp, (u, v) in zip(f.loops, [(um, 0.5), (um + a[2] * uh, 0.5 + a[1] * 0.5), (um + b_[2] * uh, 0.5 + b_[1] * 0.5)]): lp[uvl].uv = (u, v)
    return m
def quad_uv(m, pts, uvs):
    bm = m.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*V(p))) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f
def rounded_box(m, c, sx, sy, sz, seg=6, e=2.8):
    """圓角盒（座墊、握把末端、踏板）：超橢圓斷面沿 z 掃"""
    c = V(c); bm = m.bm; rings = []
    for zz in (-sz, -sz * 0.7, sz * 0.7, sz):
        k = 0.82 if abs(zz) == sz else 1.0; ring = []
        for i in range(seg * 2):
            t = 2 * math.pi * i / (seg * 2); cc, ss = math.cos(t), math.sin(t); ee = 2 / e
            ring.append(bm.verts.new(g2b(c.x + sx * k * math.copysign(abs(cc) ** ee, cc), c.y + sy * k * math.copysign(abs(ss) ** ee, ss), c.z + zz)))
        rings.append(ring)
    for a, b_ in zip(rings, rings[1:]):
        for i in range(len(a)):
            j = (i + 1) % len(a); bm.faces.new((a[i], a[j], b_[j], b_[i]))
    bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1]); return m


# ---------------- 零件：每個零件一個物件（多材質），之後設樞紐 ----------------
PARTS = {}
def part(name):
    if name not in PARTS: PARTS[name] = {}
    return PARTS[name]
def pm(name, key):
    d = part(name)
    if key not in d: d[key] = Mesh(f'{name}_{key}', M[key])
    return d[key]

# ---- 輪子（前後同一款）
def wheel(name, c):
    tprof = [(-0.016, -0.016), (0.008, -0.019), (0.02, -0.008), (0.022, 0.0), (0.02, 0.008), (0.008, 0.019), (-0.016, 0.016)]
    ring_x(pm(name, 'rubber'), c, TIRE_R - 0.022, seg=40, prof=tprof)
    ring_x(pm(name, 'metal'), c, TIRE_R - 0.038, seg=40, prof=[(-0.01, -0.012), (0.007, -0.01), (0.007, 0.01), (-0.01, 0.012)])
    c = V(c)
    pm(name, 'metal').cyl((c.x - 0.05, c.y, c.z), (c.x + 0.05, c.y, c.z), 0.022, seg=10)                # 花鼓
    pm(name, 'metal').cyl((c.x - 0.09, c.y, c.z), (c.x + 0.09, c.y, c.z), 0.006, seg=6)                 # 輪軸
    disc_x(pm(name, 'alpha'), c, TIRE_R - 0.045, seg=28)                                                 # 鋼絲（透明貼圖）
    a = 0.4; pm(name, 'dark').cyl((c.x, c.y + (TIRE_R - 0.05) * math.cos(a), c.z + (TIRE_R - 0.05) * math.sin(a)), (c.x, c.y + (TIRE_R - 0.075) * math.cos(a), c.z + (TIRE_R - 0.075) * math.sin(a)), 0.004, seg=6)   # 氣嘴
wheel('wheel_f', (0, WY, FZ)); wheel('wheel_r', (0, WY, RZ))

# ---- 車架（frame）：低跨彎下管（頭管 → 五通）、座管、第二根細下管、後下叉、後上叉、頭管
fr = pm('frame', 'frame')
sweep(fr, [HT_BOT + AX * 0.0, HT_TOP], 0.03, seg=12)                                                   # 頭管
mid = Vector((0, 0.32, 0.22))
sweep(fr, bez(HT_BOT + AX * 0.03, mid, Vector(BB) + Vector((0, 0.02, 0.06)), n=10), 0.027, seg=10)     # 主下管（往下彎到五通）
sweep(fr, bez(HT_BOT + AX * 0.12, Vector((0, 0.5, 0.15)), Vector(BB) + ST_DIR * 0.2, n=8), 0.017, seg=8)   # 第二根細下管（接到座管）
sweep(fr, [Vector(BB) - ST_DIR * 0.02, ST_TOP], 0.022, seg=10)                                         # 座管
fr.cyl(Vector(BB) + Vector((-0.045, 0, 0)), Vector(BB) + Vector((0.045, 0, 0)), 0.026, seg=12)          # 五通
for sx in (-1, 1):
    sweep(fr, [Vector(BB) + Vector((sx * 0.03, 0, -0.02)), Vector((sx * 0.055, WY, RZ + 0.02))], 0.011, seg=6)          # 後下叉
    sweep(fr, [ST_TOP + Vector((sx * 0.022, -0.05, -0.01)), Vector((sx * 0.055, WY + 0.012, RZ + 0.02))], 0.01, seg=6)  # 後上叉
    fr.box(sx * 0.055 - 0.008, sx * 0.055 + 0.008, WY - 0.02, WY + 0.02, RZ - 0.01, RZ + 0.045)       # 後勾爪
fprof = [(0.0, -0.04), (0.016, 0.0), (0.0, 0.04)]
ring_x(fr, (0, WY, RZ), TIRE_R + 0.03, seg=14, a0=math.radians(-155), a1=math.radians(20), prof=fprof, prof_closed=False)   # 後擋泥板
# 鍊條蓋（右邊 −x）：齒盤上半圈＋後齒輪後半圈
cg = [(math.cos(math.pi * i / 6), math.sin(math.pi * i / 6)) for i in range(7)]
pts = [(BB[2] + 0.1 * c_, BB[1] + 0.1 * s_) for (c_, s_) in cg] + [(RZ + 0.02 - 0.06 * s_, WY + 0.06 * c_) for (c_, s_) in cg]
vs = [fr.bm.verts.new(g2b(-0.088, y, z)) for (z, y) in pts]; vs2 = [fr.bm.verts.new(g2b(-0.07, y, z)) for (z, y) in pts]
fr.bm.faces.new(vs); fr.bm.faces.new(list(reversed(vs2)))
for i in range(len(vs)):
    j = (i + 1) % len(vs); fr.bm.faces.new((vs[i], vs[j], vs2[j], vs2[i]))
mt = pm('frame', 'metal')
sweep(mt, [ST_TOP - ST_DIR * 0.02, SADDLE], 0.0135, seg=8)                                             # 座管（可調高度的那一段）
mt.box(-0.03, 0.03, ST_TOP.y - 0.01, ST_TOP.y + 0.035, ST_TOP.z - 0.02, ST_TOP.z + 0.03)                # 座管束
# 座墊（城市車的寬座墊：前窄後寬，底下兩根彈簧）
sd = pm('frame', 'saddle'); sb = Vector((0, SADDLE_TOP - 0.035, SADDLE.z - 0.02))
for (z, hw, hh) in [(-0.12, 0.115, 0.035), (-0.06, 0.12, 0.036), (0.0, 0.095, 0.033), (0.07, 0.05, 0.028), (0.13, 0.024, 0.022)]:
    pass
rings = []
for (z, hw, hh) in [(-0.13, 0.10, 0.03), (-0.1, 0.122, 0.036), (-0.03, 0.115, 0.036), (0.04, 0.07, 0.03), (0.1, 0.035, 0.026), (0.14, 0.022, 0.02)]:
    ring = []
    for k in range(10):
        t = 2 * math.pi * k / 10; c_, s_ = math.cos(t), math.sin(t); e = 2 / 2.6
        ring.append(sd.bm.verts.new(g2b(hw * math.copysign(abs(c_) ** e, c_), sb.y + hh * math.copysign(abs(s_) ** e, s_), sb.z + z)))
    rings.append(ring)
for a, b_ in zip(rings, rings[1:]):
    for k in range(10):
        j = (k + 1) % 10; sd.bm.faces.new((a[k], a[j], b_[j], b_[k]))
sd.bm.faces.new(list(reversed(rings[0]))); sd.bm.faces.new(rings[-1])
for sx in (-0.06, 0.06):
    for k in range(5):                                                                                 # 彈簧（一圈一圈的小環）
        y = sb.y - 0.04 - k * 0.012; mt.cyl((sx - 0.012, y, sb.z - 0.09), (sx + 0.012, y, sb.z - 0.09), 0.012, seg=6, caps=False)
    sweep(mt, [(sx, sb.y - 0.03, sb.z - 0.09), (sx * 0.5, SADDLE.y + 0.01, SADDLE.z - 0.02)], 0.005, seg=4)
# 後貨架（平台＋支架）
for sx in (-0.065, 0.065):
    sweep(mt, [(sx, 0.72, ST_TOP.z - 0.06), (sx, 0.72, RZ - 0.22)], 0.008, seg=5)
    sweep(mt, [(sx, 0.72, RZ - 0.18), (sx * 0.85, WY + 0.01, RZ + 0.01)], 0.007, seg=5)
    sweep(mt, [(sx, 0.72, ST_TOP.z - 0.05), (sx * 0.5, ST_TOP.y - 0.06, ST_TOP.z + 0.01)], 0.006, seg=4)
for z in (RZ - 0.0, RZ - 0.12, RZ + 0.12): sweep(mt, [(-0.065, 0.72, z), (0.065, 0.72, z)], 0.006, seg=4)
pm('frame', 'red').box(-0.045, 0.045, 0.68, 0.715, RZ - 0.235, RZ - 0.22)                               # 後反光片
# 後座軟墊（「載妹墊」，LAWWW-B 2026-10-15 分派；台灣學生淑女車常見的那種：綁在後貨架上的長方形軟墊、兩條黑色綁帶）。
# 遊戲：同行的人側坐在上面（engine3d.js E.PASSENGER）；墊子頂面的高度、前後位置寫進 bike_ride.json 的「後座軟墊頂」
CUSH = dict(cx=0.0, cy=0.72 + 0.006 + 0.032, cz=RZ, hx=0.105, hy=0.032, hz=0.165)
rounded_box(pm('rear_cushion', 'cushion'), (CUSH['cx'], CUSH['cy'], CUSH['cz']), CUSH['hx'], CUSH['hy'], CUSH['hz'], seg=6, e=3.2)
for dz in (-0.09, 0.09):                                                                                   # 綁帶：繞過墊子上面、往下綁在貨架
    st_ = pm('rear_cushion', 'strap'); z0 = CUSH['cz'] + dz
    st_.box(-CUSH['hx'] - 0.004, CUSH['hx'] + 0.004, CUSH['cy'] + CUSH['hy'] - 0.002, CUSH['cy'] + CUSH['hy'] + 0.003, z0 - 0.012, z0 + 0.012)
    for sx in (-1, 1): st_.box(sx * (CUSH['hx'] + 0.001) - 0.003, sx * (CUSH['hx'] + 0.001) + 0.003, 0.70, CUSH['cy'] + CUSH['hy'], z0 - 0.012, z0 + 0.012)
# 環形鎖（後上叉之間）
mt.cyl((-0.05, WY + 0.09, RZ + 0.1), (0.05, WY + 0.09, RZ + 0.1), 0.045, seg=10)
# 中柱（收起：貼在後下叉下面）
for sx in (-1, 1): sweep(mt, [(sx * 0.05, WY - 0.02, RZ + 0.03), (sx * 0.09, WY - 0.06, RZ - 0.22)], 0.008, seg=5)
# 鍊條（右邊，靜態）：上下兩段＋兩端的半圈
dk = pm('frame', 'dark'); cz0, cy0, r0 = BB[2], BB[1], 0.095; cz1, cy1, r1 = RZ, WY, 0.04
ch = [(cz0 + r0 * math.sin(a), cy0 + r0 * math.cos(a)) for a in [math.pi * i / 8 for i in range(9)]] + [(cz1 - r1 * math.sin(a), cy1 - r1 * math.cos(a)) for a in [math.pi * i / 8 for i in range(9)]]
sweep(dk, [(-0.06, y, z) for (z, y) in ch] + [(-0.06, ch[0][1], ch[0][0])], 0.0045, seg=4, caps=False)

# ---- 前叉＋龍頭＋把手＋前籃＋前擋泥板＋前燈（fork）
fk = pm('fork', 'frame')
crown = HT_BOT - AX * 0.02
sweep(fk, [HT_BOT - AX * 0.005, HT_TOP + AX * 0.005], 0.019, seg=8)                                    # 叉管（在頭管裡，露出上下一點點）
fk.boxc(crown.x, crown.y, crown.z, 0.13, 0.03, 0.055)                                                   # 叉肩
for sx in (-1, 1):
    a = crown + Vector((sx * 0.05, -0.01, 0.0)); b = Vector((sx * 0.052, WY, FZ))
    sweep(fk, bez(a, (a + b) / 2 + _perp * 0.035, b, n=6), 0.0125, seg=6, r1=0.009)                     # 叉腳（下段往前彎）
    fk.box(sx * 0.052 - 0.008, sx * 0.052 + 0.008, WY - 0.02, WY + 0.02, FZ - 0.02, FZ + 0.02)
ring_x(fk, (0, WY, FZ), TIRE_R + 0.03, seg=12, a0=math.radians(-35), a1=math.radians(115), prof=fprof, prof_closed=False)   # 前擋泥板
fm = pm('fork', 'metal')
sweep(fm, [HT_TOP, STEM_TOP], 0.014, seg=8)                                                            # 龍頭立管
bar_c = STEM_TOP + Vector((0, 0.01, 0.0))
GRIP_Y, GRIP_Z, GRIP_X = bar_c.y + 0.02, bar_c.z - 0.17, 0.29                                           # 後掠把手：握把在龍頭後面 17 cm
pts = bez((-GRIP_X - 0.06, GRIP_Y, GRIP_Z + 0.02), (-0.16, bar_c.y + 0.03, bar_c.z + 0.12), (0, bar_c.y, bar_c.z + 0.05), n=6) + \
      bez((0, bar_c.y, bar_c.z + 0.05), (0.16, bar_c.y + 0.03, bar_c.z + 0.12), (GRIP_X + 0.06, GRIP_Y, GRIP_Z + 0.02), n=6)[1:]
sweep(fm, pts, 0.011, seg=8)
sweep(fm, [bar_c, bar_c + Vector((0, 0.0, 0.05))], 0.018, seg=8)                                       # 把手夾
GL = Vector((GRIP_X, GRIP_Y, GRIP_Z)); GR = Vector((-GRIP_X, GRIP_Y, GRIP_Z))                            # 握把中心（左 +x、右 −x）
gr = pm('fork', 'rubber')
for g in (GL, GR):
    sd_ = 1 if g.x > 0 else -1
    gr.cyl(g + Vector((-sd_ * 0.055, 0, 0.004)), g + Vector((sd_ * 0.065, 0, 0.012)), 0.017, seg=10)      # 握把（沿把手末端方向，近似成橫的）
    fm.cyl(g + Vector((-sd_ * 0.07, 0.02, 0.03)), g + Vector((sd_ * 0.03, 0.025, 0.1)), 0.006, seg=5)     # 煞車把
fm.sphere((0.13, bar_c.y + 0.035, bar_c.z + 0.07), 0.024, seg=10, rings=5, sy=0.7)                      # 車鈴
# 前籃（固定在把手和前叉上，跟著轉）
bx0, bx1 = -0.17, 0.17; by0, by1 = HT_TOP.y - 0.06, HT_TOP.y + 0.18; bz0, bz1 = HT_TOP.z + 0.1, HT_TOP.z + 0.38
U = [(0.5, 0.0), (1.0, 0.0), (1.0, 1.0), (0.5, 1.0)]; al = pm('fork', 'alpha')
quad_uv(al, [(bx0, by0, bz1), (bx1, by0, bz1), (bx1, by1, bz1), (bx0, by1, bz1)], U)
quad_uv(al, [(bx1, by0, bz0), (bx0, by0, bz0), (bx0, by1, bz0), (bx1, by1, bz0)], U)
quad_uv(al, [(bx0, by0, bz0), (bx0, by0, bz1), (bx0, by1, bz1), (bx0, by1, bz0)], U)
quad_uv(al, [(bx1, by0, bz1), (bx1, by0, bz0), (bx1, by1, bz0), (bx1, by1, bz1)], U)
quad_uv(al, [(bx0, by0, bz0), (bx1, by0, bz0), (bx1, by0, bz1), (bx0, by0, bz1)], U)
for y, r in ((by1, 0.007), (by0, 0.005)): sweep(fm, [(bx0, y, bz0), (bx1, y, bz0), (bx1, y, bz1), (bx0, y, bz1), (bx0, y, bz0)], r, seg=4, caps=False)
for x in (bx0, bx1):
    for z in (bz0, bz1): sweep(fm, [(x, by0, z), (x, by1, z)], 0.004, seg=4, caps=False)
sweep(fm, [(0, by0 + 0.02, bz0 + 0.02), HT_TOP + Vector((0, 0.0, 0.03))], 0.008, seg=5)                 # 籃子的支架（接到頭管）
for sx in (-1, 1): sweep(fm, [(sx * 0.06, by0, bz1 - 0.02), (sx * 0.045, WY + 0.1, FZ - 0.02)], 0.005, seg=4)   # 籃子的下支架（接到叉腳）
lamp_c = Vector((0, by0 - 0.05, bz1 + 0.035))
fm.cyl(lamp_c - Vector((0, 0, 0.04)), lamp_c + Vector((0, 0, 0.02)), 0.035, seg=10, r2=0.04)           # 前燈
pm('fork', 'lens').cyl(lamp_c + Vector((0, 0, 0.02)), lamp_c + Vector((0, 0, 0.026)), 0.036, seg=10)
pm('fork', 'amber').box(-0.03, 0.03, WY + 0.25, WY + 0.28, FZ + 0.05, FZ + 0.06)                        # 前反光片（籃子下面）

# ---- 齒盤＋曲柄（crank）：靜止姿勢：右曲柄（−x）朝前（+z）、左曲柄（+x）朝後；都是水平
ck = pm('crank', 'metal'); bbv = Vector(BB)
ck.cyl(bbv + Vector((-0.07, 0, 0)), bbv + Vector((-0.064, 0, 0)), 0.098, seg=28)                      # 齒盤（右邊）
ck.cyl(bbv + Vector((-0.076, 0, 0)), bbv + Vector((0.076, 0, 0)), 0.011, seg=8)                        # 五通軸
for sx, dz in ((-1, 1), (1, -1)):
    a = bbv + Vector((sx * Q, 0, 0)); b = bbv + Vector((sx * Q, 0, dz * CRANK))
    sweep(ck, [a, b], 0.011, seg=8, r1=0.009)
    ck.cyl(b + Vector((sx * -0.005, 0, 0)), b + Vector((sx * 0.02, 0, 0)), 0.014, seg=8)                # 曲柄末端（踏板螺牙）
PED = {'pedal_r': bbv + Vector((-PEDAL_X, 0, CRANK)), 'pedal_l': bbv + Vector((PEDAL_X, 0, -CRANK))}
for nm, pc in PED.items():
    rounded_box(pm(nm, 'dark'), pc, 0.05, 0.012, 0.045)                                                 # 踏板（x 寬 10 cm、z 9 cm、厚 2.4 cm）
    sx = 1 if pc.x > 0 else -1
    pm(nm, 'metal').cyl(pc - Vector((sx * 0.06, 0, 0)), pc - Vector((sx * 0.035, 0, 0)), 0.007, seg=6)  # 踏板軸
    for dz in (-0.047, 0.047): pm(nm, 'amber').box(pc.x - 0.035, pc.x + 0.035, pc.y - 0.008, pc.y + 0.008, pc.z + dz - 0.002, pc.z + dz + 0.002)   # 踏板前後的反光片

# ---------------- 物件、樞紐（glTF 節點） ----------------
def make(name):
    """這個零件的所有網格合成一個物件（多材質），頂點是遊戲座標的位置（Blender 座標）"""
    obs = []
    for key, m in PARTS[name].items():
        ob = m.finish(None, uv=(key == 'frame' or key == 'saddle'), merge=True)
        if ob is None: continue
        if key in ('rubber', 'metal', 'frame', 'saddle', 'dark'): L.smooth_mesh(ob, angle=0.9)
        obs.append(ob)
    for o in obs: o.select_set(False)
    bpy.context.view_layer.objects.active = obs[0]
    for o in obs: o.select_set(True)
    bpy.ops.object.join(); ob = bpy.context.view_layer.objects.active; ob.name = name; ob.data.name = name
    for o in bpy.context.selected_objects: o.select_set(False)
    return ob
def set_pivot(ob, pivot_game, rot=None, parent=None):
    """原點搬到樞紐（遊戲座標），rot＝節點的方向（Blender 的旋轉矩陣 3×3）；頂點留在原來的世界位置"""
    W = Matrix.Translation(g2b(*pivot_game)) @ (rot.to_4x4() if rot is not None else Matrix())
    ob.data.transform(W.inverted()); ob.matrix_world = W
    if parent is not None:
        bpy.context.view_layer.update(); mw = ob.matrix_world.copy(); ob.parent = parent; ob.matrix_parent_inverse = Matrix(); ob.matrix_world = mw
root = make('frame')
fork = make('fork'); wf = make('wheel_f'); wr = make('wheel_r'); ck = make('crank'); pr = make('pedal_r'); pl = make('pedal_l')
STEER = Matrix.Rotation(-(math.pi / 2 - HEAD_ANG), 3, 'X')                                                # Blender +Z 轉到轉向軸（往後傾）
set_pivot(fork, HT_BOT, STEER, parent=root)
set_pivot(wf, FA, None, parent=fork)
set_pivot(wr, Vector((0, WY, RZ)), None, parent=root)
set_pivot(ck, bbv, None, parent=root)
set_pivot(pr, PED['pedal_r'], None, parent=ck); set_pivot(pl, PED['pedal_l'], None, parent=ck)
# 載妹墊（軟墊＋兩條綁帶）是 frame 底下獨立的網格節點：開局的車沒有，公館車行加裝後才有（AA_137 §5）→ 遊戲用 rear_cushion.visible 切換（LAWWW-B 01:09Z）
rc = make('rear_cushion'); set_pivot(rc, Vector((CUSH['cx'], CUSH['cy'], CUSH['cz'])), None, parent=root)
# 載妹墊的定位節點（空節點，frame 的子節點；遊戲照它們放乘客、手、上下車的位置——動作在遊戲端做）
CY_TOP = CUSH['cy'] + CUSH['hy'] * 0.82
LOC = {'passenger_side': ((0.03, CY_TOP, CUSH['cz'] - 0.02), '側坐（女生）：坐骨點；身體朝 +x（車的左邊），兩腿垂在左邊'),
       'passenger_astride': ((0.0, CY_TOP, CUSH['cz'] - 0.04), '跨坐（男生）：坐骨點；身體朝 +z（車頭），兩腳在後輪軸兩旁、雙手放膝'),
       'grip_cushion_L': ((CUSH['hx'], CY_TOP - 0.01, CUSH['cz'] + 0.10), '手扶座墊邊緣（左）'),
       'grip_cushion_R': ((-CUSH['hx'], CY_TOP - 0.01, CUSH['cz'] + 0.10), '手扶座墊邊緣（右）'),
       'rider_waist': ((0.0, 1.02, SADDLE.z - 0.12), '扶腰的參考點：騎士腰的中心（座墊頂上方約 9 cm、坐骨後方）；手放在它左右各約 15 cm'),
       'mount_point': ((0.55, 0.0, CUSH['cz'] - 0.25), '上車前站的位置：車的左後方（地面）')}
for nm, (pp, _) in LOC.items():
    e = bpy.data.objects.new(nm, None); B.scene().collection.objects.link(e); e.empty_display_size = 0.05
    e.parent = root; e.matrix_parent_inverse = Matrix(); e.location = g2b(*pp)
bpy.context.view_layer.update()
# 自我檢查：轉向軸方向、節點的世界位置
ax_b = (fork.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized(); want = g2b(*AX).normalized()
assert (ax_b - want).length < 1e-4, (ax_b, want)
for ob, p in ((wf, FA), (wr, Vector((0, WY, RZ))), (ck, bbv), (pr, PED['pedal_r']), (pl, PED['pedal_l'])):
    assert (ob.matrix_world.translation - g2b(*p)).length < 1e-4, (ob.name, ob.matrix_world.translation, p)

# 減量（2026-10-16，溫州街效能）：純色材質（鍍鉻、黑色零件、輪胎、反光片、軟墊、綁帶）合成一個頂點色材質 ride_vc——
# 每個節點（車架、前叉、輪子、曲柄、踏板、軟墊）的 draw call 從 2～6 次變 1～4 次（陰影那一輪也少一樣多）。
# 車架烤漆 ride_frame（遊戲改色）、座墊、輻條（透明貼圖）、車燈（發光）不動；節點、樞軸、定位點都不變。
RIDE_VC = L.vc_metal('ride_vc', rough=0.45, metal=0.3)
L.vc_consolidate(root, L.auto_vc_groups(root, RIDE_VC, RIDE_VC, protect={'ride_frame', 'ride_saddle', 'ride_alpha', 'ride_lamp_lens'}))
for ob in [o for o in [root] + list(root.children_recursive) if o.type == 'MESH']:   # 換掉的材質槽拿掉（沒有面用的槽不匯出，但留著不乾淨）
    me = ob.data; used = {p.material_index for p in me.polygons}
    for i in sorted(range(len(me.materials)), reverse=True):
        if i not in used:
            for p in me.polygons:
                if p.material_index > i: p.material_index -= 1
            me.materials.pop(index=i)
tris = {}
for ob in [o for o in [root] + list(root.children_recursive) if o.type == "MESH"]:
    me = ob.data; me.calc_loop_triangles(); tris[ob.name] = len(me.loop_triangles)
st = L.export(OUT, gpu_instances=False)
r3 = lambda v: [round(v.x, 4), round(v.y, 4), round(v.z, 4)]
sizes = {
    '座標': '遊戲座標（公尺）：車頭朝 +z、地面 y=0、中心線 x=0；騎士的左手邊＝+x、右手邊＝−x（鍊條在右邊）',
    '座墊頂': r3(Vector((0.0, SADDLE_TOP, sb.z - 0.03))), '座墊頂說明': '座墊最高的那一點（坐骨的位置在它後面約 3–5 cm）',
    '把手握點_左': r3(GL), '把手握點_右': r3(GR), '五通': r3(bbv), '曲柄長': CRANK,
    '踏板中心_靜止姿勢': {'右': r3(PED['pedal_r']), '左': r3(PED['pedal_l'])}, '靜止姿勢': '右曲柄朝前（+z）、左曲柄朝後，都是水平',
    '後座軟墊頂': r3(Vector((CUSH['cx'], CUSH['cy'] + CUSH['hy'] * 0.82, CUSH['cz']))), '後座軟墊': {'長_前後': round(2 * CUSH['hz'], 3), '寬_左右': round(2 * CUSH['hx'], 3), '前緣z': round(CUSH['cz'] + CUSH['hz'], 3), '後緣z': round(CUSH['cz'] - CUSH['hz'], 3), '說明': '頂面中心（墊子頂端圓角收 18%，坐的面就是這個高度）；同行的人側坐在這裡'},
    '載妹墊定位節點': {k: {'位置': [round(v, 4) for v in pp], '說明': d} for k, (pp, d) in LOC.items()},
    '輪徑': round(TIRE_R * 2, 4), '前輪軸': r3(FA), '後輪軸': r3(Vector((0, WY, RZ))), '軸距': round(FZ - RZ, 4),
    '轉向軸': {'通過': r3(HT_BOT), '方向_往上': r3(AX), '頭管角_度': round(math.degrees(HEAD_ANG), 2)},
    '節點': {'frame': '根；原點 (0,0,0)', 'fork': 'frame 的子節點；原點＝轉向軸與頭管下緣交點；本地 +Y＝轉向軸（往上）', 'wheel_f': 'fork 的子節點；原點＝前輪軸心；繞本地 X 轉',
             'wheel_r': 'frame 的子節點；原點＝後輪軸心；繞本地 X 轉', 'crank': 'frame 的子節點；原點＝五通；繞本地 X 轉',
             'pedal_r': 'crank 的子節點；原點＝右踏板軸；繞本地 X 轉（轉負的曲柄角度保持水平）', 'pedal_l': 'crank 的子節點；原點＝左踏板軸；同上',
             'rear_cushion': 'frame 的子節點（網格：後座軟墊＋兩條綁帶）；原點＝軟墊中心；沒有裝載妹墊時 visible=false（定位節點照舊在 frame 底下）'},
    'tris': tris, 'bytes': st['bytes'],
}
L.write_json(OUT[:-4] + '.json', sizes)
print(json.dumps(sizes, ensure_ascii=False, indent=1))

if arg('--preview'):
    d = arg('--preview'); os.makedirs(d, exist_ok=True)
    views = [['side', [2.6, 0.75, 0.0], [0, 0.6, 0.0], 50], ['q45', [1.9, 1.3, 1.9], [0, 0.55, 0.0], 45], ['front', [0.4, 1.0, 2.4], [0, 0.7, 0.2], 45],
             ['top_cockpit', [0.0, 2.0, -0.6], [0, 0.9, 0.3], 40]]
    json.dump(views, open(os.path.join(d, 'views.json'), 'w'))
