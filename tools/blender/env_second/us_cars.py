"""美式汽車五款（SCN-US-01 社區停車場、SCN-US-02 校園街道共用；LAWWW2-C 2026-10-17）→ GLB，每款一個節點：
  car_sedan（中型轎車）、car_suv（休旅車）、car_pickup（全尺寸皮卡）、car_hatch（掀背車）、car_minivan（廂型車）。
  /opt/blenv/bin/python tools/blender/env_second/us_cars.py [-- --out assets/models/env/second_ai/us_cars.glb] [--render]

使用者 2026-10-16（對 LAWWW2-B）：「不要同一個款式只換顏色」→ 五款的車身輪廓、比例、輪子大小、車窗線都不同；顏色由遊戲上色（車身材質 car_paint 是白色，
遊戲用頂點色乘上每台的顏色，和腳踏車 bike_frame 同一套做法：停車場整排合併不加 draw call）。不放品牌、標誌、車牌號碼（D77）。
尺寸（一般車款的數字，m）：轎車 4.88×1.84×1.44（軸距 2.82、輪徑 0.68）、休旅車 4.60×1.85×1.70（2.69、0.72）、皮卡 5.90×2.03×1.95（3.67、0.80）、
掀背車 4.40×1.80×1.45（2.70、0.66）、廂型車 5.15×2.00×1.78（3.03、0.70）。
做法（不用方塊拼）：
  車身＝沿車長取站點、每個站點一個超橢圓斷面（下車身：底到腰線／引擎蓋／後車廂面；車窗段：腰線到車頂，往上收＝tumblehome），站點之間放樣；
  輪拱＝站點的車身下緣照輪子的位置抬成半圓（輪子真的在輪拱裡）；車窗段的面分成車頂、柱子（A／B／C／D 柱，車身色）和玻璃（深色）；
  輪子＝胎（旋轉體、胎壁圓角）＋鋁圈（五幅）＋輪拱裡的黑色內襯；保險桿、水箱罩、後照鏡、門把、車牌（空白）是黑色塑膠／鍍鉻；頭燈、尾燈發光（GLOW_*）。
座標：遊戲座標，車頭朝 +z、地面 y=0、車寬沿 x；原點在車的中心。"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/us_cars.glb')
B.reset(texres=256)
root = B.group('us_cars', props={'kind': 'us_cars'})
M = {'paint': L.flat('car_paint', '#ffffff', rough=0.28, metal=0.25),        # 遊戲乘上每台的顏色
     'glass': L.flat('car_glass', '#1d2329', rough=0.08, metal=0.4),
     'trim': L.flat('car_trim', '#1c1d1f', rough=0.55),
     'chrome': L.flat('car_chrome', '#b7bbbf', rough=0.25, metal=0.45),
     'tire': L.flat('car_tire', '#18191a', rough=0.85),
     'rim': L.flat('car_rim', '#9ea3a8', rough=0.32, metal=0.45),
     'head': L.flat('GLOW_car_head', '#f2f4f6', rough=0.2, emit=B.srgb('#fff6e6')),
     'tail': L.flat('GLOW_car_tail', '#a5141c', rough=0.3, emit=B.srgb('#c4121c')),
     'plate': L.flat('car_plate', '#eceae4', rough=0.6)}

# 每款：L 長、W 寬、wb 軸距、R 輪半徑、clr 離地、站點表 ST（t＝0 車尾 → 1 車頭；belt＝下車身頂；roof＝車頂（None＝沒有車窗段）；hw＝下車身半寬比例；
# rw＝車頂半寬比例）、柱子的 t 範圍、窗戶下緣（belt）
CARS = {
 'car_sedan': dict(L=4.88, W=1.84, wb=2.82, R=0.34, clr=0.15, fo=0.98,
   ST=[(0.00, 0.62, None, 0.80, 0), (0.03, 0.88, None, 0.94, 0), (0.12, 0.98, None, 1.00, 0), (0.24, 1.00, 1.04, 1.00, 0.0), (0.30, 1.00, 1.36, 1.00, 0.74),
       (0.40, 1.00, 1.44, 1.00, 0.78), (0.55, 1.00, 1.44, 1.00, 0.78), (0.64, 1.00, 1.30, 1.00, 0.74), (0.70, 0.96, 1.00, 0.99, 0.0),
       (0.84, 0.90, None, 0.98, 0), (0.95, 0.82, None, 0.93, 0), (1.00, 0.62, None, 0.80, 0)],
   pillars=[(0.24, 0.31), (0.46, 0.49), (0.63, 0.70)]),
 'car_suv': dict(L=4.60, W=1.85, wb=2.69, R=0.36, clr=0.20, fo=0.92,
   ST=[(0.00, 0.80, None, 0.86, 0), (0.03, 1.02, None, 0.96, 0), (0.08, 1.08, 1.20, 1.00, 0.0), (0.10, 1.08, 1.62, 1.00, 0.80), (0.30, 1.08, 1.70, 1.00, 0.84),
       (0.58, 1.08, 1.70, 1.00, 0.84), (0.68, 1.08, 1.56, 1.00, 0.80), (0.74, 1.06, 1.12, 1.00, 0.0), (0.88, 1.02, None, 0.98, 0), (0.96, 0.94, None, 0.94, 0), (1.00, 0.70, None, 0.84, 0)],
   pillars=[(0.08, 0.12), (0.33, 0.36), (0.50, 0.53), (0.67, 0.74)]),
 'car_pickup': dict(L=5.90, W=2.03, wb=3.67, R=0.40, clr=0.24, fo=0.90, bed=(0.0, 0.40),
   ST=[(0.00, 1.06, None, 0.96, 0), (0.02, 1.16, None, 1.00, 0), (0.40, 1.16, None, 1.00, 0), (0.41, 1.20, 1.30, 1.00, 0.0), (0.43, 1.20, 1.88, 1.00, 0.84),
       (0.60, 1.20, 1.95, 1.00, 0.86), (0.66, 1.20, 1.80, 1.00, 0.84), (0.71, 1.18, 1.26, 1.00, 0.0), (0.86, 1.16, None, 1.00, 0), (0.97, 1.10, None, 0.98, 0), (1.00, 0.86, None, 0.92, 0)],
   pillars=[(0.41, 0.44), (0.52, 0.55), (0.65, 0.71)]),
 'car_hatch': dict(L=4.40, W=1.80, wb=2.70, R=0.33, clr=0.14, fo=0.98,
   ST=[(0.00, 0.78, None, 0.86, 0), (0.03, 0.92, 1.06, 0.96, 0.0), (0.07, 0.92, 1.34, 0.98, 0.72), (0.20, 0.94, 1.45, 1.00, 0.78), (0.52, 0.94, 1.45, 1.00, 0.78),
       (0.62, 0.94, 1.30, 1.00, 0.74), (0.69, 0.92, 0.98, 0.99, 0.0), (0.84, 0.86, None, 0.98, 0), (0.95, 0.78, None, 0.93, 0), (1.00, 0.60, None, 0.80, 0)],
   pillars=[(0.03, 0.12), (0.40, 0.43), (0.61, 0.69)]),
 'car_minivan': dict(L=5.15, W=2.00, wb=3.03, R=0.35, clr=0.16, fo=0.95,
   ST=[(0.00, 0.80, None, 0.88, 0), (0.02, 1.00, 1.12, 0.96, 0.0), (0.05, 1.00, 1.70, 0.99, 0.86), (0.30, 1.00, 1.78, 1.00, 0.88), (0.66, 1.00, 1.78, 1.00, 0.88),
       (0.74, 1.00, 1.58, 1.00, 0.84), (0.80, 0.98, 1.08, 0.99, 0.0), (0.90, 0.92, None, 0.97, 0), (0.97, 0.84, None, 0.92, 0), (1.00, 0.66, None, 0.84, 0)],
   pillars=[(0.05, 0.10), (0.36, 0.39), (0.56, 0.59), (0.73, 0.80)]),
}


def interp(ST, t, k):
    for a, b in zip(ST, ST[1:]):
        if a[0] <= t <= b[0]:
            u = (t - a[0]) / max(b[0] - a[0], 1e-9); va, vb = a[k], b[k]
            if va is None or vb is None: return va if u < 0.5 else vb
            return va + (vb - va) * (0.5 - 0.5 * math.cos(math.pi * u))
    return ST[-1][k]


def se(theta, n):   # 超橢圓：(cos, sin) → 方圓
    c, s = math.cos(theta), math.sin(theta)
    return math.copysign(abs(c) ** (2 / n), c), math.copysign(abs(s) ** (2 / n), s)


def build(name, C, xoff):
    Lc, W, wb, R, clr = C['L'], C['W'], C['wb'], C['R'], C['clr']; ST = C['ST']
    g = B.group(name, root, {'kind': 'car', 'len': Lc, 'width': W})
    zr, zf = -wb / 2, wb / 2                                       # 後輪、前輪的 z
    NT = 44; ts = [i / NT for i in range(NT + 1)]
    for st in ST: ts.append(st[0])
    ts = sorted(set(round(t, 4) for t in ts)); K = 28                 # 斷面每圈 K 點
    paint = Mesh(name + '_body', M['paint']); glass = Mesh(name + '_glass', M['glass']); trim = Mesh(name + '_trim', M['trim'])
    def zof(t): return -Lc / 2 + t * Lc
    def ybot(t):                                                   # 車身下緣：離地，輪拱處抬成半圓
        z = zof(t); y = clr + 0.08
        for wz in (zr, zf):
            d = abs(z - wz); ra = R + 0.05
            if d < ra: y = max(y, R + math.sqrt(max(0.0, ra * ra - d * d)) * 0.92)
        return y
    rings = []
    for t in ts:
        yt = interp(ST, t, 1); hw = W / 2 * interp(ST, t, 3); yb = ybot(t)
        if t in (0.0, 1.0): yb = max(yb, clr + 0.18)
        yc, hh = (yt + yb) / 2, (yt - yb) / 2; ring = []
        for k in range(K):
            th = 2 * math.pi * k / K; cx, cy = se(th, 3.2)
            ring.append((cx * hw, yc + cy * hh, zof(t)))
        rings.append(ring)
    bm = paint.bm
    V = [[bm.verts.new(g2b(*p)) for p in r] for r in rings]
    for i in range(len(V) - 1):
        for k in range(K):
            k2 = (k + 1) % K; bm.faces.new((V[i][k], V[i][k2], V[i + 1][k2], V[i + 1][k]))
    bm.faces.new(V[0][::-1]); bm.faces.new(V[-1])
    # 車窗段：有 roof 的站點連續一段
    gts = [t for t in ts if interp(ST, t, 2) is not None and (interp(ST, t, 2) or 0) > interp(ST, t, 1) + 0.02]
    if gts:
        G = []
        for t in gts:
            yb_ = interp(ST, t, 1) - 0.01; yr = interp(ST, t, 2); hb = W / 2 * interp(ST, t, 3) * 0.96; hr = W / 2 * max(interp(ST, t, 4), 0.5)
            row = []
            for k in range(9):          # 一邊：腰線 → 側窗往上往內收（tumblehome）→ 車頂圓弧到中心（左右對稱，另一邊鏡射）
                u = k / 8
                if u <= 0.625:
                    v = u / 0.625; x = hb + (hr - hb) * v; y = yb_ + (yr - 0.05 - yb_) * v
                else:
                    v = (u - 0.625) / 0.375; x = hr * math.cos(v * math.pi / 2) ** 0.7; y = yr - 0.05 + 0.05 * math.sin(v * math.pi / 2) ** 0.7
                row.append((x, y, zof(t)))
            G.append(row)
        pil = C['pillars']
        def is_pillar(t): return any(a <= t <= b for a, b in pil)
        for side in (1, -1):
            Vg = [[(x * side, y, z) for (x, y, z) in row] for row in G]
            for i in range(len(Vg) - 1):
                tmid = (gts[i] + gts[i + 1]) / 2
                for k in range(8):
                    q = [Vg[i][k], Vg[i][k + 1], Vg[i + 1][k + 1], Vg[i + 1][k]]
                    roof = k >= 5; edge_end = i == 0 or i == len(Vg) - 2
                    tgt = paint if (roof or is_pillar(tmid) or edge_end) else glass
                    if side < 0: q = q[::-1]
                    tgt.bm.faces.new([tgt.bm.verts.new(g2b(*p)) for p in (q if side > 0 else q)])
        # 擋風玻璃、後擋：車窗段頭尾的斷面封起來（深色玻璃）
        for (t, rev) in ((gts[-1], False), (gts[0], True)):
            row = G[gts.index(t)]; pts = [(x, y, zof(t)) for (x, y, _) in row] + [(-x, y, zof(t)) for (x, y, _) in row[::-1]]
            f = glass.bm.faces.new([glass.bm.verts.new(g2b(*p)) for p in (pts[::-1] if rev else pts)])
    # 皮卡的車斗：車斗段的頂面挖成深色（車斗內襯）＋後擋板上緣
    if C.get('bed'):
        a, b = C['bed']; z0, z1 = zof(a) + 0.05, zof(b) - 0.04; yt = interp(ST, (a + b) / 2, 1)
        trim.box(-W / 2 * 0.9, W / 2 * 0.9, yt - 0.42, yt + 0.004, z0, z1)
    # 保險桿、水箱罩、下護板、後照鏡、門把、車牌
    zfr, zre = Lc / 2, -Lc / 2; yb0 = clr + 0.18
    trim.rbox(-W / 2 * 0.86, W / 2 * 0.86, clr + 0.05, yb0 + 0.16, zfr - 0.12, zfr + 0.02, r=0.04, seg=2)
    trim.rbox(-W / 2 * 0.86, W / 2 * 0.86, clr + 0.05, yb0 + 0.14, zre - 0.02, zre + 0.12, r=0.04, seg=2)
    yh = interp(ST, 0.985, 1) - 0.05
    trim.rbox(-W * 0.22, W * 0.22, yh - 0.22, yh - 0.02, zfr - 0.03, zfr + 0.005, r=0.015, seg=1)          # 水箱罩
    head = Mesh(name + '_headlights', M['head']); tail = Mesh(name + '_taillights', M['tail']); chrome = Mesh(name + '_chrome', M['chrome'])
    for s in (1, -1):
        head.rbox(s * W * 0.27 - 0.17, s * W * 0.27 + 0.17, yh - 0.12, yh, zfr - 0.035, zfr + 0.002, r=0.02, seg=1)
        yt_ = interp(ST, 0.015, 1) - 0.06
        tail.rbox(s * W * 0.34 - 0.13, s * W * 0.34 + 0.13, yt_ - 0.15, yt_, zre - 0.002, zre + 0.035, r=0.02, seg=1)
        # 後照鏡（A 柱下緣、門的前上角）
        pa = C['pillars'][-1][0]; zm = zof(pa) + 0.05; ym = interp(ST, pa, 1) + 0.05
        trim.rbox(s * W / 2 - (0.0 if s > 0 else 0.2), s * W / 2 + (0.2 if s > 0 else 0.0), ym, ym + 0.13, zm - 0.06, zm + 0.08, r=0.03, seg=2)
        for dz in (0.1, -0.85):   # 門把（前門、後門）
            zz = zof(C['pillars'][-1][0]) - 0.35 + dz; yy = interp(ST, C['pillars'][-1][0], 1) - 0.12
            chrome.box(s * (W / 2 * 0.985) - 0.01, s * (W / 2 * 0.985) + 0.01, yy, yy + 0.03, zz - 0.11, zz + 0.11)
    for z, sgn in ((zfr + 0.01, 1), (zre - 0.01, -1)):
        Mesh(name + '_plate', M['plate']).box(-0.15, 0.15, yb0 + 0.02, yb0 + 0.17, z - 0.006, z + 0.006).finish(g, uv=False)
    # 輪子：胎（旋轉體）、鋁圈（五幅＋輪框）、輪拱內襯
    tire = Mesh(name + '_tires', M['tire']); rim = Mesh(name + '_rims', M['rim'])
    tw = 0.22 if R < 0.37 else 0.27
    prof = [(R - 0.11, -tw / 2), (R - 0.03, -tw / 2 - 0.005), (R - 0.005, -tw / 2 + 0.02), (R, -tw / 2 + 0.05), (R, tw / 2 - 0.05), (R - 0.005, tw / 2 - 0.02), (R - 0.03, tw / 2 + 0.005), (R - 0.11, tw / 2)]
    for wz in (zr, zf):
        for s in (1, -1):
            xc = s * (W / 2 - tw / 2 - 0.03)
            bmt = L.lathe([(r_, y_) for (r_, y_) in prof], seg=20)
            mat = (Vector((xc, -wz, R)), )
            for v in bmt.verts:
                r_, h_ = math.hypot(v.co.x, v.co.y), v.co.z; a = math.atan2(v.co.y, v.co.x)
                v.co = g2b(xc + h_, R + r_ * math.sin(a), wz + r_ * math.cos(a))
            tire.add_bm(bmt); bmt.free()
            xo = xc + s * (tw / 2 - 0.03)
            rim.cyl((xo, R, wz), (xo - s * 0.02, R, wz), R - 0.11, seg=18)                      # 輪框面
            for k in range(5):                                                                 # 五幅
                a = 2 * math.pi * k / 5 + 0.3; ca, sa = math.cos(a), math.sin(a)
                rim.cyl((xo + s * 0.006, R + 0.03 * sa, wz + 0.03 * ca), (xo + s * 0.006, R + (R - 0.13) * sa, wz + (R - 0.13) * ca), 0.022, seg=5)
            rim.cyl((xo + s * 0.01, R, wz), (xo, R, wz), 0.055, seg=10)
            trim.cyl((s * (W / 2 - 0.02), R, wz), (s * (W / 2 - 0.02 - tw - 0.05), R, wz), R + 0.035, seg=20, caps=False)   # 輪拱內襯（黑）
    for m in (paint, glass, trim, head, tail, chrome, tire, rim):
        if not m.empty(): bmesh.ops.recalc_face_normals(m.bm, faces=m.bm.faces) if m not in (glass,) else None
    ob = paint.finish(g, uv=False); L.smooth_mesh(ob, angle=0.9)
    for m in (glass, trim, head, tail, chrome, rim): m.finish(g, uv=False)
    ob = tire.finish(g, uv=False); L.smooth_mesh(ob, angle=1.2)
    g.location = (xoff, 0, 0) if '--render' in ARGS else (0, 0, 0)
    return g


x = 0.0
for name, C in CARS.items():
    build(name, C, x); x += 2.6
tris = {}
for g in root.children:
    n = 0
    for ob in g.children:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); n += len(ob.data.loop_triangles)
    tris[g.name] = n
print('TRIS', tris)
info = L.export(OUT, gpu_instances=False); info['tris_per_car'] = tris; info['dims'] = {k: [C['L'], C['W'], C['wb'], 2 * C['R']] for k, C in CARS.items()}
L.write_json(OUT[:-4] + '.json', info)
