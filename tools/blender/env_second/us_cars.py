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


def extrude_profile(mesh, pts, x0, x1, bevel=0.05, segs=3):
    """側面輪廓（[(z, y), …]，逆時針）往 x 擠出 x0～x1，輪廓邊倒圓角（bmesh bevel）：車身、車窗段的做法（不是方塊）"""
    bm = bmesh.new()
    a = [bm.verts.new(g2b(x0, y, z)) for (z, y) in pts]; b = [bm.verts.new(g2b(x1, y, z)) for (z, y) in pts]
    n = len(pts)
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(n):
        j = (i + 1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    bm.normal_update()
    edges = [e for e in bm.edges if abs(e.verts[0].co.x - e.verts[1].co.x) < 1e-6]   # 兩個側面的輪廓邊（不含沿 x 的邊）
    try: bmesh.ops.bevel(bm, geom=edges, offset=bevel, segments=segs, profile=0.5, affect='EDGES', clamp_overlap=True)
    except Exception as ex: print('bevel', ex)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh.add_bm(bm); bm.free()


def build(name, C, xoff):
    Lc, W, wb, R, clr = C['L'], C['W'], C['wb'], C['R'], C['clr']; ST = C['ST']
    g = B.group(name, root, {'kind': 'car', 'len': Lc, 'width': W})
    zr, zf = -wb / 2, wb / 2
    def zof(t): return -Lc / 2 + t * Lc
    paint = Mesh(name + '_body', M['paint']); glass = Mesh(name + '_glass', M['glass']); trim = Mesh(name + '_trim', M['trim'])
    hw = W / 2 - 0.02
    # ---- 下車身：側面輪廓＝底線（輪拱是半圓缺口）＋上緣（車頭→引擎蓋→腰線→後車廂→車尾）----
    ra = R + 0.045; yb0 = clr + 0.10
    bottom = [(zof(0.0) + 0.02, yb0 + 0.06)]
    for wz in (zr, zf):
        bottom.append((wz - ra - 0.02, yb0))
        for k in range(13):
            a = math.pi - math.pi * k / 12
            bottom.append((wz + ra * math.cos(a), R + ra * math.sin(a) * 0.95 if math.sin(a) > 0 else yb0))
        bottom.append((wz + ra + 0.02, yb0))
    bottom.append((zof(1.0) - 0.02, yb0 + 0.06))
    top = []
    ts = sorted(set([i / 40 for i in range(41)] + [st[0] for st in ST]))   # 每一站都要在（擋風玻璃的起點不能被跳過）
    for t in reversed(ts):
        top.append((zof(t), interp(ST, t, 1)))
    # 車頭、車尾的面往內收一點點（斜的保險桿）
    top[0] = (top[0][0] - 0.03, top[0][1]); top[-1] = (top[-1][0] + 0.03, top[-1][1])
    prof = bottom + top
    extrude_profile(paint, prof, -hw, hw, bevel=min(0.11, W * 0.06), segs=4)
    # 平面上車頭、車尾的角收圓：越靠兩端 x 縮越多
    for v in paint.bm.verts:
        z = -v.co.y; u = abs(z) / (Lc / 2); q = max(0.0, min(1.0, (u - 0.68) / 0.32)); f = 1.0 - 0.09 * q * q * (3 - 2 * q)
        v.co.x *= f
        t = (z + Lc / 2) / Lc; ytop = interp(ST, min(max(t, 0.0), 1.0), 1)
        if v.co.z > ytop - 0.03 and 0.06 < t < 0.94: v.co.z += 0.035 * max(0.0, 1.0 - (v.co.x / hw) ** 2)   # 引擎蓋、後車廂中間微微拱起（不是平板）
    # ---- 車窗段：腰線上的側面輪廓（擋風玻璃、車頂、後擋），擠出後上面往內收（tumblehome）----
    tr0 = min(st[0] for st in ST if st[2] is not None); tr1 = max(st[0] for st in ST if st[2] is not None)
    gts = [t for t in ts if tr0 <= t <= tr1 and interp(ST, t, 2) is not None and interp(ST, t, 2) > interp(ST, t, 1) + 0.03]   # 只在有車頂高度的站之間（之前 None 的鄰站會內插出一段平台）
    if gts:
        ta, tb = gts[0], gts[-1]
        gp = [(zof(ta) - 0.01, interp(ST, ta, 1) - 0.01), (zof(tb) + 0.01, interp(ST, tb, 1) - 0.01)]
        for t in reversed(gts): gp.append((zof(t), interp(ST, t, 2)))
        gm = Mesh(name + '_gh', M['paint'])
        hg = hw * 0.95
        extrude_profile(gm, gp, -hg, hg, bevel=0.045, segs=3)
        yb_ = min(interp(ST, t, 1) for t in gts); yr_ = max(interp(ST, t, 2) for t in gts); rw = max(st[4] for st in ST)
        for v in gm.bm.verts:
            y = v.co.z; u = max(0.0, min(1.0, (y - yb_) / max(yr_ - yb_, 1e-3))); v.co.x *= 1.0 - (1.0 - rw / 0.95) * u ** 1.4
            if u > 0.96: v.co.z += 0.03 * max(0.0, 1.0 - (v.co.x / (hg * rw / 0.95)) ** 2)   # 車頂中間拱起
        paint.add_bm(gm.bm); gm.bm.free()
        # 玻璃：側窗（前、後；中間 B 柱）、擋風玻璃、後擋——比車窗段表面外面 3 mm 的面片
        def width_at(y): u = max(0.0, min(1.0, (y - yb_) / max(yr_ - yb_, 1e-3))); return hg * (1.0 - (1.0 - rw / 0.95) * u ** 1.4)
        pil = C['pillars']; A_ = pil[-1]; Cc = pil[0]
        tw0, tw1 = Cc[1] + 0.01, A_[0] - 0.01                         # 側窗範圍（C 柱後緣 → A 柱前緣）
        mids = [p for p in pil[1:-1]]
        segs_ = []; cur = tw0
        for p in mids: segs_.append((cur, p[0])); cur = p[1]
        segs_.append((cur, tw1))
        for (s0, s1) in segs_:
            if s1 - s0 < 0.02: continue
            n = 8; lo, hi = [], []
            for k in range(n + 1):
                t = s0 + (s1 - s0) * k / n; yb = interp(ST, t, 1) + 0.06; yr = interp(ST, t, 2) - 0.07
                if yr <= yb: yr = yb + 0.01
                lo.append((t, yb)); hi.append((t, yr))
            for side in (1, -1):
                bm = glass.bm
                L1 = [bm.verts.new(g2b(side * (width_at(y) + 0.004), y, zof(t))) for (t, y) in lo]
                H1 = [bm.verts.new(g2b(side * (width_at(y) + 0.004), y, zof(t))) for (t, y) in hi]
                for k in range(n):
                    q = (L1[k], L1[k + 1], H1[k + 1], H1[k]); bm.faces.new(q if side > 0 else q[::-1])
        for p in mids:                                                     # B 柱（中間的柱子）貼黑色飾板（真車多半是黑的）
            for side in (1, -1):
                bm = glass.bm; n = 4; rows = []
                for k in range(n + 1):
                    t = p[0] + (p[1] - p[0]) * k / n
                    y0_ = interp(ST, t, 1) + 0.05; y1_ = interp(ST, t, 2) - 0.06
                    rows.append((t, y0_, y1_))
                Vb = [(trim.bm.verts.new(g2b(side * (width_at(y0_) + 0.005), y0_, zof(t))), trim.bm.verts.new(g2b(side * (width_at(y1_) + 0.005), y1_, zof(t)))) for (t, y0_, y1_) in rows]
                for k in range(n):
                    q = (Vb[k][0], Vb[k + 1][0], Vb[k + 1][1], Vb[k][1]); trim.bm.faces.new(q if side > 0 else q[::-1])
        # 車門接縫：A 柱下、B 柱下、後門後緣（細深色線，腰線到側裙）
        seams = [A_[0] + 0.01] + [(p[0] + p[1]) / 2 for p in mids] + ([Cc[1] - 0.02] if len(mids) else [])
        for t in seams:
            if not (0.12 < t < 0.9): continue
            ylo = yb0 + 0.12; yhi = interp(ST, t, 1) - 0.02
            for side in (1, -1):
                xx = side * (hw + 0.002)
                q = [g2b(xx, ylo, zof(t) - 0.004), g2b(xx, ylo, zof(t) + 0.004), g2b(xx, yhi, zof(t) + 0.004), g2b(xx, yhi, zof(t) - 0.004)]
                vs = [trim.bm.verts.new(c) for c in q]; trim.bm.faces.new(vs if side > 0 else vs[::-1])
        for (t0, t1, front) in ((A_[0], tb, True), (ta, Cc[1], False)):   # 擋風玻璃（A 柱 → 車頂前緣）、後擋（車頂後緣 → C 柱）
            n = 8; rows = []
            for k in range(n + 1):
                t = t0 + (t1 - t0) * k / n; y = interp(ST, t, 2) if interp(ST, t, 2) is not None else interp(ST, t, 1)
                y = max(y, interp(ST, t, 1) + 0.04); wv = width_at(y) - 0.07
                nz = 0.006 if front else -0.006
                rows.append([g2b(-wv, y + 0.004, zof(t) + nz), g2b(wv, y + 0.004, zof(t) + nz)])
            bm = glass.bm; V = [[bm.verts.new(p) for p in r] for r in rows]
            for k in range(n):
                q = (V[k][0], V[k][1], V[k + 1][1], V[k + 1][0]); bm.faces.new(q if front else q[::-1])
    # 皮卡的車斗：車斗段頂面的深色內襯
    if C.get('bed'):
        a, b = C['bed']; z0, z1 = zof(a) + 0.08, zof(b) - 0.06; yt = interp(ST, (a + b) / 2, 1)
        trim.box(-hw * 0.9, hw * 0.9, yt - 0.40, yt + 0.006, z0, z1)
    # ---- 保險桿下緣、水箱罩、燈、後照鏡、門把、車牌 ----
    zfr, zre = Lc / 2, -Lc / 2
    trim.rbox(-hw * 0.88, hw * 0.88, clr + 0.04, clr + 0.18, zfr - 0.20, zfr - 0.01, r=0.04, seg=2)   # 前下護板（黑）
    trim.rbox(-hw * 0.88, hw * 0.88, clr + 0.04, clr + 0.18, zre + 0.01, zre + 0.20, r=0.04, seg=2)   # 後下護板
    yh = interp(ST, 0.975, 1) - 0.04
    trim.rbox(-W * 0.22, W * 0.22, yh - 0.26, yh - 0.04, zfr - 0.05, zfr - 0.015, r=0.03, seg=2)        # 水箱罩
    for k in range(3): trim.box(-W * 0.2, W * 0.2, yh - 0.22 + k * 0.06, yh - 0.205 + k * 0.06, zfr - 0.015, zfr - 0.005)   # 水箱罩橫條
    head = Mesh(name + '_headlights', M['head']); tail = Mesh(name + '_taillights', M['tail']); chrome = Mesh(name + '_chrome', M['chrome'])
    for s_ in (1, -1):
        head.rbox(s_ * W * 0.31 - 0.16, s_ * W * 0.31 + 0.16, yh - 0.13, yh - 0.02, zfr - 0.06, zfr - 0.025, r=0.02, seg=1)
        yt_ = interp(ST, 0.02, 1) - 0.05
        tail.rbox(s_ * W * 0.35 - 0.14, s_ * W * 0.35 + 0.14, yt_ - 0.16, yt_ - 0.01, zre + 0.025, zre + 0.06, r=0.02, seg=1)
        pa = C['pillars'][-1][0]; zm = zof(pa) - 0.02; ym = interp(ST, pa, 1) + 0.04
        trim.rbox(s_ * hw - (0.0 if s_ > 0 else 0.19), s_ * hw + (0.19 if s_ > 0 else 0.0), ym, ym + 0.12, zm - 0.07, zm + 0.06, r=0.03, seg=2)
        for dz in (-0.25, -1.05):
            zz = zof(pa) + dz; yy = interp(ST, pa, 1) - 0.12
            chrome.box(s_ * (hw + 0.004) - 0.01, s_ * (hw + 0.004) + 0.01, yy, yy + 0.03, zz - 0.1, zz + 0.1)
    for z in (zfr - 0.015, zre + 0.015):
        Mesh(name + '_plate', M['plate']).box(-0.15, 0.15, clr + 0.22, clr + 0.37, z - 0.006, z + 0.006).finish(g, uv=False)
    # ---- 輪子：胎（旋轉體）、鋁圈（輪框面＋五幅＋中心蓋）、輪拱內襯 ----
    tire = Mesh(name + '_tires', M['tire']); rim = Mesh(name + '_rims', M['rim'])
    tw = 0.22 if R < 0.37 else 0.27
    pr = [(R - 0.12, -tw / 2), (R - 0.03, -tw / 2 - 0.005), (R - 0.005, -tw / 2 + 0.02), (R, -tw / 2 + 0.05), (R, tw / 2 - 0.05), (R - 0.005, tw / 2 - 0.02), (R - 0.03, tw / 2 + 0.005), (R - 0.12, tw / 2)]
    for wz in (zr, zf):
        for s_ in (1, -1):
            xc = s_ * (hw - tw / 2 - 0.02)
            bmt = L.lathe(pr, seg=24)
            for v in bmt.verts:
                r_, h_ = math.hypot(v.co.x, v.co.y), v.co.z; a = math.atan2(v.co.y, v.co.x)
                v.co = g2b(xc + s_ * h_, R + r_ * math.sin(a), wz + r_ * math.cos(a))
            tire.add_bm(bmt); bmt.free()
            xo = xc + s_ * (tw / 2 - 0.035)
            rim.cyl((xo - s_ * 0.03, R, wz), (xo, R, wz), R - 0.115, seg=24, caps=False)          # 輪圈外緣
            rim.cyl((xo - s_ * 0.06, R, wz), (xo - s_ * 0.05, R, wz), R - 0.12, seg=24)            # 輪圈底盤（深一點）
            for k in range(5):
                a = 2 * math.pi * k / 5 + 0.3; ca, sa = math.cos(a), math.sin(a)
                rim.cyl((xo - s_ * 0.01, R + 0.05 * sa, wz + 0.05 * ca), (xo - s_ * 0.02, R + (R - 0.13) * sa, wz + (R - 0.13) * ca), 0.026, seg=6)
            rim.cyl((xo - s_ * 0.03, R, wz), (xo + s_ * 0.004, R, wz), 0.06, seg=12)
            trim.cyl((s_ * (hw - 0.03), R, wz), (s_ * (hw - 0.03 - tw - 0.06), R, wz), R + 0.035, seg=24, caps=False)
    ob = paint.finish(g, uv=False); L.smooth_mesh(ob, angle=0.75)
    for m in (glass, trim, head, tail, chrome, rim):
        if not m.empty(): m.finish(g, uv=False)
    ob = tire.finish(g, uv=False); L.smooth_mesh(ob, angle=1.2)
    g.location = (xoff, 0, 0) if '--render' in ARGS else (0, 0, 0)
    return g


x = 0.0
for name, C in CARS.items():
    build(name, C, x); x += 3.2
tris = {}
for g in root.children:
    n = 0
    for ob in g.children:
        if ob.type == 'MESH': ob.data.calc_loop_triangles(); n += len(ob.data.loop_triangles)
    tris[g.name] = n
print('TRIS', tris)
info = L.export(OUT, gpu_instances=False); info['tris_per_car'] = tris; info['dims'] = {k: [C['L'], C['W'], C['wb'], 2 * C['R']] for k, C in CARS.items()}
L.write_json(OUT[:-4] + '.json', info)
