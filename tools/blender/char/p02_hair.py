"""林芷若（heroine_02）的髮型：黑色及肩微捲髮＋中分偏一邊的空氣感八字瀏海（Blender 髮片網格；v9.4 人物生產線第三位，2026-10-10）。
參考圖 06：黑色（受光處偏深棕）、頭頂服貼、從耳朵下面開始自然垂落到肩膀、髮尾微微外翻、下段有一點波浪；瀏海從分線往兩邊撥、
長度到顴骨，和臉旁的頭髮連成框住臉的弧線；耳朵大部分蓋住（銀色小耳環從髮間露出來，是 props3d.js）。
做法（沿用祐廷 p00_hair 的頭皮量測、髮殼、髮片貼圖；新的是垂落的髮束）：
 1. 髮殼：髮旋為極點、髮際線為邊界的球面網格，貼著頭皮加厚。
 2. 垂落髮片：上段沿著頭皮從髮旋梳到耳下（和祐廷一樣的球面參數）；耳下以下改成往下垂（水平位置只往外移一點避開脖子與肩膀），
    下半段微微的 S 形波浪、髮尾往外翻；前面兩側短（下巴）、兩側到肩膀、後面最長。兩層（內層密、外層碎）。
 3. 瀏海：分線兩邊各自往外撥的長髮片，髮尾在顴骨，和前面兩側的髮束接起來。
 4. 全部綁在頭骨（第一版沒有彈簧骨：低頭、轉頭時髮尾跟著頭轉）。
座標：Blender Z 朝上、人物面向 -Y、+X＝人物的左手邊（同 h01_hair）。"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents, catmull, resample

SEED = 20261012
POLE = (180.0, 70.0)      # 髮旋：頭頂稍偏後
PART = -9.0               # 分線（方位角）：略偏人物的右邊
# 顏色（sRGB）：參考圖 06 的黑髮（受光處偏深棕）；比純黑亮一級：遊戲（MToon）裡太黑會看不出髮絲（祐廷第十一版的經驗）
DEEP = np.array([0.07, 0.06, 0.06]); BASE = np.array([0.14, 0.12, 0.115]); LIGHT = np.array([0.24, 0.205, 0.19]); SHEEN = np.array([0.40, 0.355, 0.33])
REG = {'card': (0, 288, 0, 1024), 'cardB': (288, 512, 0, 1024), 'bang': (512, 704, 0, 1024), 'lock': (704, 960, 0, 1024), 'shell': (960, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'


def make_atlas(seed=SEED):
    HB.DEEP, HB.BASE, HB.LIGHT, HB.SHEEN = DEEP, BASE, LIGHT, SHEEN
    rng = np.random.default_rng(seed); W = HB.W
    img = np.zeros((W, W, 4)); img[..., :3] = BASE
    def put(name, col, A):
        x0, x1, y0, y1 = REG[name]; img[y0:y1, x0:x1, :3] = col; img[y0:y1, x0:x1, 3] = A
    def reg(name): x0, x1, y0, y1 = REG[name]; return y1 - y0, x1 - x0
    h, w = reg('card')       # 頭頂的髮片：幾乎整片不透明（服貼的頭頂），最後一小段分束
    put('card', HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.36), tip_light=0.04, base=BASE), HB._clumps(rng, h, w, 5, 0.80, 0.90, 1.0, hw_k=(1.0, 1.3), lean=0.1, power=0.8, full=2.6, minw=4.0))
    h, w = reg('cardB')
    put('cardB', HB._strand_color(rng, h, w, 0.78, sheen=(0.26, 0.42), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 4, 0.72, 0.84, 1.0, hw_k=(1.0, 1.35), lean=0.15, power=0.75, full=2.4, minw=4.0))
    h, w = reg('bang')       # 瀏海：長片、髮尾分成 3 束（不是一排尖角）
    put('bang', HB._strand_color(rng, h, w, 0.84, sheen=(0.18, 0.30), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 3, 0.62, 0.80, 1.0, hw_k=(1.2, 1.6), lean=0.1, power=0.9, full=3.2, minw=5.0))
    h, w = reg('lock')       # 垂落的髮束：長、髮尾 18% 分束、彼此重疊（遠看不會變成點狀）
    put('lock', HB._strand_color(rng, h, w, 0.72, sheen=(0.10, 0.22), tip_light=0.08, base=BASE), HB._clumps(rng, h, w, 5, 0.82, 0.92, 1.0, edge_taper=0.04, hw_k=(1.2, 1.55), lean=0.08, power=1.0, full=2.4, minw=4.0))
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    arm = m['arm']; rng = np.random.default_rng(SEED)
    HB.REG_PX = dict(REG)          # 髮際線用 h01_hair 的預設（女性：圓的髮際線、鬢角低）
    H = HB.Head(m); c = H.c
    neck_z = C.landmarks(arm)['neck']
    print('  hair(p02): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f neck %.3f' % (H.Rtop, H.brow_z, H.brow_top, neck_z), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)

    def az(a): return abs(((a + 180) % 360) - 180)

    def vol(a, v):           # 頭頂服貼（比祐廷薄）、前額上方一點蓬度、兩側貼
        aa = az(a); ca = math.cos(math.radians(aa))
        top = 0.008 + 0.010 * float(sstep(0.10, 0.55, v)) - 0.004 * float(sstep(0.75, 0.97, v))
        side = 1 - 0.45 * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))
        return top * side * (0.7 + 0.3 * max(ca, 0.0)) + max(ca, 0.0) * 0.004 * float(sstep(0.2, 0.6, v))

    def line_dir(a, v):      # 髮際線以下漸漸改成同一個方位往正下方（同祐廷第五版）
        b0 = HB.hairline_beta(a); d0 = sph(a, b0); g = slerp(d0, dP, v)
        if v >= 0: return g
        om = math.degrees(math.acos(float(np.clip(np.dot(d0, dP), -1, 1))))
        w = float(sstep(0.0, 0.12, -v))
        return _unit(g * (1 - w) + sph(a, b0 + v * om) * w)

    def surf(a, v, extra=0.0):
        d = line_dir(a, v); out = v < 0.03
        r = H.R(d, out)
        if out and az(a) >= 100:            # 後半圈往下：從頭的中心往外打第一個碰到的身體表面（從外面打會打到肩膀、背）
            h = H.body.ray_cast(Vector(c), Vector(d), 0.4)[0]
            if h is not None: r = min(r, float(np.dot(np.array(h) - c, d)) + 0.004)
        elif out and az(a) >= 60:           # 兩側往下：最外層最多比頭皮外 3.5 cm（蓋得過耳朵；第一、二版從外面打到 T 字姿勢水平伸出的手臂，髮片被放到手臂上，遊戲裡兩條細髮往外斜飛）
            r = min(r, H.R(d, False) + 0.035)
        return c + d * (r + vol(a, max(v, 0.0)) + extra + (0.006 if out else 0.0)), d

    def v_at_z(a, z_tip, lo=-0.7, hi=0.0):
        for _ in range(26):
            mid = (lo + hi) / 2; p, _ = surf(a, mid)
            if p[2] > z_tip: hi = mid
            else: lo = mid
        return (lo + hi) / 2

    eye_z = H.brow_z - 0.024
    z_hang = H.brow_z - 0.052           # 耳垂附近：這個高度以下頭髮改成往下垂
    # 髮尾高度（方位角 → z）：前面兩側到下巴（框住臉）、兩側到肩膀、後面最長
    TIP_A = [36, 50, 65, 90, 130, 180]
    TIP_Z = [eye_z - 0.040, neck_z + 0.030, neck_z + 0.016, neck_z + 0.010, neck_z - 0.010, neck_z - 0.026]   # 第三版：兩側停在肩膀上方（T 字姿勢的肩膀會把髮尾往外推 5 cm）
    def z_tip(a): return float(np.interp(az(a), TIP_A, TIP_Z))

    # ---- 1. 髮殼 ----
    Nu, Nv, PAN = 64, 12, 4
    A_ = np.linspace(-180, 180, Nu + 1); vs = np.linspace(0, 0.97, Nv + 1)
    SP = np.zeros((Nu + 1, Nv + 1, 3)); SN = np.zeros_like(SP)
    for i, a in enumerate(A_):
        for j, v in enumerate(vs):
            p, d = surf(a, v, -0.002); SP[i, j] = p; SN[i, j] = d
    u0, v0, u1, v1 = HB.reg_uv('shell')
    for p in range(Nu // PAN):
        G = SP[p * PAN:p * PAN + PAN + 1].transpose(1, 0, 2); Nn = SN[p * PAN:p * PAN + PAN + 1].transpose(1, 0, 2)
        U = u0 + (u1 - u0) * np.linspace(0, 1, PAN + 1); Vv = v0 + (v1 - v0) * (vs / vs[-1])
        UV = np.stack(np.broadcast_arrays(U[None, :], Vv[:, None]), -1)
        mb.grid(G, UV, Nn, 'head', np.zeros(Nv + 1))
    n_shell = len(mb.F)

    # ---- 2. 垂落的髮片：上段沿頭皮（球面參數）、耳下以下往下垂 ----
    def hang_card(a, vroot, off, wfac, reg, nseg=12, curl=0.0, wave=0.0, wph=0.0, flip=0.010, tip_dz=0.0, short=False):
        """a：方位；vroot：髮根（髮旋附近）；short＝只到 z_hang（內層、頭頂層）"""
        vh = min(-0.02, v_at_z(a, z_hang)) if not short else min(-0.02, v_at_z(a, z_hang + 0.02))
        vv = np.linspace(vroot, vh, nseg + 1)
        P = []; D = []
        for i, v in enumerate(vv):
            t = i / nseg; e = off * (0.15 + 0.85 * float(sstep(0.0, 0.35, t)))
            p, d = surf(a + curl * t * t, v, e); P.append(p); D.append(d)
        P = np.array(P); D = np.array(D)
        if not short:
            p0 = P[-1]; rad = _unit(np.array([p0[0] - c[0], p0[1] - c[1], 0.0]))
            tan = _unit(np.cross([0, 0, 1.0], rad))
            zt = z_tip(a) + tip_dz; n2 = 12; L2 = max(p0[2] - zt, 0.02)
            low = []
            for k in range(1, n2 + 1):
                t = k / n2
                q = p0 + rad * (0.006 * t ** 1.4 + flip * float(sstep(0.70, 1.0, t))) + tan * wave * math.sin(math.pi * 1.6 * t + wph) * float(sstep(0.25, 0.6, t))
                q[2] = p0[2] - L2 * t + 0.4 * flip * float(sstep(0.80, 1.0, t))   # 髮尾外翻時微微往上
                low.append(q)
            low = np.array(low)
            P = np.vstack([P, low]); D = np.vstack([D, np.tile(rad, (len(low), 1))])
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
            for _ in range(2):
                P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
        else:
            P = H.push(P, np.linspace(0.003, 0.004 + off, len(P)))
        Tn = tangents(P)
        D = _unit(D - Tn * np.sum(D * Tn, 1)[:, None]); side = _unit(np.cross(D, Tn))
        da = 360.0 / 56; q0, _ = surf(a + da, 0.0)
        wd = max(np.linalg.norm(q0 - surf(a, 0.0)[0]), 0.008)
        width = wd * wfac * (0.55 + 0.45 * sstep(0.0, 0.25, np.linspace(0, 1, len(P))))
        if os.environ.get('HAIR_DEBUG'):
            far = np.hypot(P[:, 0] - c[0], P[:, 1] - c[1]).max()
            if far > 0.13 or P[:, 2].min() < neck_z - 0.08: print('   FAR hang a=%.1f vroot=%.2f short=%s far=%.3f zmin=%.3f pts %s' % (a, vroot, short, far, P[:, 2].min(), np.round(P[[0, len(P) // 2, -1]], 3).tolist()))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=0.10, tt=np.linspace(0, 1, len(P)))

    for k in range(56):        # 內層：頭頂到耳下（短），蓋住髮殼的邊
        a = -180 + 360 * (k + 0.5) / 56 + rng.uniform(-1.5, 1.5)
        if az(a) < 34: continue                      # 前額交給瀏海
        hang_card(a, 0.95, 0.0015, 1.7, 'card', short=True)
    for k in range(48):        # 主層：垂到肩膀
        a = -180 + 360 * (k + rng.uniform(0.25, 0.75)) / 48
        if az(a) < 36: continue
        hang_card(a, 0.90 - rng.uniform(0, 0.06), 0.0040 + 0.001 * rng.random(), rng.uniform(1.5, 1.8), 'lock',
                  curl=rng.uniform(-4, 4), wave=0.006 + 0.004 * rng.random(), wph=rng.uniform(0, 6.28), flip=0.008 + 0.006 * rng.random(), tip_dz=rng.uniform(-0.012, 0.010))
    for k in range(34):        # 外層：碎一點、長短不一
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / 34
        if az(a) < 38: continue
        hang_card(a, 0.86 - rng.uniform(0, 0.12), 0.0070 + 0.002 * rng.random(), rng.uniform(1.2, 1.5), 'cardB' if rng.random() < 0.4 else 'lock',
                  curl=rng.uniform(-6, 6), wave=0.008 + 0.005 * rng.random(), wph=rng.uniform(0, 6.28), flip=0.010 + 0.008 * rng.random(), tip_dz=rng.uniform(-0.025, 0.020))
    n_card = len(mb.F) - n_shell

    # ---- 3. 瀏海：分線兩邊往外撥，髮尾在顴骨，接到前面兩側的髮束 ----
    def bang_card(a, vroot, off, wfac, sgn, z_end):
        # 第二版：往外撥最多 14°，髮尾高度用撥過去的方位算（第一版撥 28°、高度用原本的方位算：外側幾片的髮尾跑到下顎、肩膀，像天線往外飛）
        vt = max(-0.35, v_at_z(a + sgn * 12, z_end))
        vv = np.linspace(vroot, vt, 17); P = []; D = []
        for i, v in enumerate(vv):
            t = i / 16; e = off * (0.3 + 0.7 * float(sstep(0.0, 0.3, t))) + 0.004 * math.sin(math.pi * min(1.0, t * 1.1))
            p, d = surf(a + sgn * (4 + 10 * t * t), v, e); P.append(p); D.append(d)
        P = H.push(np.array(P), 0.004); D = np.array(D); Tn = tangents(P)
        D = _unit(D - Tn * np.sum(D * Tn, 1)[:, None]); side = _unit(np.cross(D, Tn))
        width = wfac * 0.011 * (0.6 + 0.4 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        if os.environ.get('HAIR_DEBUG'):
            far = np.hypot(P[:, 0] - c[0], P[:, 1] - c[1]).max()
            if far > 0.13 or P[:, 2].min() < neck_z: print('   FAR bang a=%.1f vt=%.2f far=%.3f zmin=%.3f pts %s' % (a, vt, far, P[:, 2].min(), np.round(P[[0, 8, -1]], 3).tolist()))
        mb.ribbon(P, side, D, width, 'bang', 'head', np.zeros(len(P)), arch=0.08, tt=np.linspace(0, 1, len(P)))
    for sgn in (1.0, -1.0):
        for k in range(7):
            t = (k + rng.uniform(0.2, 0.8)) / 7
            a = PART + sgn * (2 + 30 * t)
            z_end = H.brow_z + 0.004 - (0.040 + 0.012 * rng.random()) * float(sstep(0.1, 1.0, t))    # 分線旁在眉毛上方、往外到顴骨
            bang_card(a, 0.62 + rng.uniform(0, 0.10), 0.008 + 0.002 * rng.random(), rng.uniform(1.6, 2.1), sgn, z_end)
    n_bang = len(mb.F) - n_shell - n_card

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    me = bpy.data.meshes.new('Hair_P02'); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_P02', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array('P02_HairCard', make_atlas(), os.path.join(wip, 'p02_hair_atlas.png'))
    tmpl = next((mt.name for mt in bpy.data.materials if 'HAIR' in mt.name and getattr(mt, 'vrm_addon_extension', None) and not mt.name.startswith('P02_')), None)
    mat = C.mtoon_from(tmpl, 'P02_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=True, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.80, 0.74, 0.72)
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    m['hair'] = obj
    print('  hair(p02): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
