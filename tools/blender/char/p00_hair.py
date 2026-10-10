"""祐廷（玩家 player）的新髮型：自然有層次的短髮（Blender 髮片網格；v9.4 人物生產線第二位，2026-10-10）。
參考圖 02：深黑棕；頭頂蓬鬆、有層次、一撮一撮；瀏海蓋住額頭到眉毛（略偏一邊分、尖端長短不一）；兩側短、耳朵露出來；後腦往後頸收短。
player.py --stages ...,hair 時執行 apply(m)。沿用沈以安 h01_hair 的頭皮量測（Head）、網格（MB）、髮絲貼圖（_strand_color、_clumps）：
 1. 髮殼：以頭頂偏後的髮旋為極點、髮際線為邊界的球面網格，貼著頭皮往外加厚（頭頂、前額最蓬，兩側貼）。
 2. 層次髮片：從髮旋往外梳到髮際線外面——前面變成瀏海（髮尾在眉毛）、兩側到耳朵上緣、後面到後頸；三層，越外層越蓬、越碎、長短越不一。
 3. 瀏海再加一層一撮一撮的髮束（分線兩邊各自往外撥一點）。
 4. 貼圖：一張 1024 atlas，MToon alpha MASK（單面）＋自訂法線（從頭的中心往外：整頭頭髮的明暗是一個連續的體積）。
 5. 全部綁在頭骨（短髮不需要彈簧骨）。
座標：Blender Z 朝上、人物面向 -Y、+X＝人物的左手邊（同 h01_hair）。"""
import math, os
import numpy as np
import bpy
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents

SEED = 20261011
POLE = (180.0, 58.0)      # 髮旋（方位角、仰角，度）：頭頂偏後
PART = 14.0               # 瀏海分線（方位角）：略偏人物的左邊
# 髮際線（方位角 → 仰角）：男生的前額髮際線略高、鬢角短、耳朵上方的髮際線貼著耳朵、後頸收高
HAIRLINE = [(0, 33), (20, 33), (35, 30), (48, 21), (57, 9), (63, -1), (69, -5), (76, -1), (86, 8), (98, 7), (108, -6),
            (120, -26), (136, -44), (152, -52), (168, -56), (180, -57)]
# 顏色（sRGB）：參考圖 02 的深黑棕（頭頂受光處偏暖棕）
DEEP = np.array([0.11, 0.095, 0.092]); BASE = np.array([0.19, 0.165, 0.158]); LIGHT = np.array([0.29, 0.255, 0.243]); SHEEN = np.array([0.42, 0.38, 0.36])   # 參考圖 02 頭髮取樣：中位數 (0.21, 0.18, 0.18)、暗部 (0.13, 0.11, 0.11)、亮部 (0.29, 0.26, 0.24)
REG = {'card': (0, 384, 0, 1024), 'cardB': (384, 640, 0, 1024), 'bang': (640, 896, 0, 1024), 'shell': (896, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'


def make_atlas(seed=SEED):
    HB.DEEP, HB.BASE, HB.LIGHT, HB.SHEEN = DEEP, BASE, LIGHT, SHEEN
    rng = np.random.default_rng(seed); W = HB.W
    img = np.zeros((W, W, 4)); img[..., :3] = BASE
    def put(name, col, A):
        x0, x1, y0, y1 = REG[name]; img[y0:y1, x0:x1, :3] = col; img[y0:y1, x0:x1, 3] = A
    def reg(name): x0, x1, y0, y1 = REG[name]; return y1 - y0, x1 - x0
    # 層次髮片：上段一片（髮根），下段分成一撮一撮、長短不一、往中間微靠
    h, w = reg('card')
    put('card', HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.38), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 5, 0.55, 0.78, 1.0, hw_k=(0.95, 1.3), lean=0.12, power=0.65, full=2.2, minw=2.5))
    h, w = reg('cardB')
    put('cardB', HB._strand_color(rng, h, w, 0.78, sheen=(0.28, 0.44), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 4, 0.42, 0.70, 1.0, hw_k=(0.9, 1.25), lean=0.2, power=0.6, full=2.0, minw=2.5))
    h, w = reg('bang')
    put('bang', HB._strand_color(rng, h, w, 0.84, tip_light=0.04, base=BASE), HB._clumps(rng, h, w, 4, 0.40, 0.68, 1.0, hw_k=(0.9, 1.2), lean=0.15, power=0.6, full=2.0, minw=2.2))
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    arm = m['arm']; rng = np.random.default_rng(SEED)
    HB.HAIRLINE = HAIRLINE; HB.REG_PX = dict(REG)          # h01_hair 的 hairline_beta、reg_uv 讀這兩個模組變數
    H = HB.Head(m); c = H.c
    print('  hair(p00): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f' % (H.Rtop, H.brow_z, H.brow_top), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)

    def az(a): return abs(((a + 180) % 360) - 180)

    def vol(a, v):          # 髮殼／髮片離頭皮的距離：頭頂（靠髮旋）最蓬、前額蓬、兩側貼、後頸收
        aa = az(a); ca = math.cos(math.radians(aa))
        top = 0.008 + 0.014 * float(sstep(0.15, 0.75, v))
        side = 1 - 0.5 * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))
        return top * side + 0.004 * max(ca, 0.0)

    def line_dir(a, v): return slerp(sph(a, HB.hairline_beta(a)), dP, v)

    def surf(a, v, extra=0.0):
        d = line_dir(a, v); out = v < 0.03                     # 髮際線外面（額頭、太陽穴、耳朵）：量最外層（臉、耳朵）
        return c + d * (H.R(d, out) + vol(a, max(v, 0.0)) + extra + (0.006 if out else 0.0)), d

    def v_at_z(a, z_tip, lo=-0.7, hi=0.0):                     # 沿這個方位往下，表面高度到 z_tip 的 v（二分法）
        for _ in range(26):
            mid = (lo + hi) / 2; p, _ = surf(a, mid)
            if p[2] > z_tip: hi = mid
            else: lo = mid
        return (lo + hi) / 2

    ear_top = H.brow_top + 0.004
    def v_tip(a):           # 髮尾停在哪（v<0：超出髮際線）
        aa = az(a)
        if aa < 40: return v_at_z(a, H.brow_z + 0.004 + 0.010 * float(sstep(18, 40, aa)))       # 瀏海到眉毛（兩邊略高）
        if aa < 112: return min(-0.02, v_at_z(a, ear_top + 0.012 * float(1 - sstep(60, 75, aa))))   # 兩側：到耳朵上緣，耳朵露出來
        return -0.06 - 0.04 * float(sstep(130, 170, aa))                                        # 後頸

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

    # ---- 2. 層次髮片（從髮旋往外，髮根＝貼圖上緣）----
    def card(a, vroot, vtip, off, wfac, reg, nseg=14, bulge=0.0, arch=0.1, curl=0.0):
        vv = np.linspace(vroot, vtip, nseg + 1); P = []; D = []; Wd = []; da = 360.0 / 56
        for i, v in enumerate(vv):
            t = i / nseg; e = off + bulge * math.sin(math.pi * min(1.0, t * 1.2))
            p, d = surf(a + curl * t * t, v, e); q, _ = surf(a + curl * t * t + da, v, e)
            P.append(p); D.append(d); Wd.append(np.linalg.norm(q - p))
        P = np.array(P); D = np.array(D)
        P = H.push(P, np.linspace(0.003, 0.004 + off, len(P)))
        Tn = tangents(P); side = _unit(np.cross(D, Tn))
        width = np.maximum(np.array(Wd) * wfac, 0.006) * (0.65 + 0.35 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=arch, tt=np.linspace(0, 1, len(P)))

    for k in range(56):        # 內層：貼頭、短一點，蓋住髮殼的邊
        a = -180 + 360 * (k + 0.5) / 56 + rng.uniform(-1.5, 1.5)
        card(a, 0.97, min(0.0, v_tip(a) * 0.55), 0.0015, 1.7, 'card')
    for k in range(40):        # 中層：蓬一點
        a = -180 + 360 * (k + rng.uniform(0.2, 0.8)) / 40
        card(a, 0.95 - rng.uniform(0, 0.08), v_tip(a) * rng.uniform(0.8, 1.0), 0.0045 + 0.001 * rng.random(), rng.uniform(1.3, 1.6), 'cardB',
             bulge=0.002 + 0.002 * rng.random(), arch=0.12, curl=rng.uniform(-6, 6))
    for k in range(30):        # 外層：碎、長短不一（頭頂的層次）
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / 30
        card(a, 0.92 - rng.uniform(0, 0.15), v_tip(a) * rng.uniform(0.55, 1.05), 0.008 + 0.002 * rng.random(), rng.uniform(1.0, 1.35), 'cardB',
             bulge=0.003 + 0.003 * rng.random(), arch=0.16, curl=rng.uniform(-10, 10))
    n_card = len(mb.F) - n_shell

    # ---- 3. 瀏海：分線兩邊各自往外撥，一撮一撮、長短不一 ----
    for k in range(14):
        a = -38 + 76 * (k + rng.uniform(0.2, 0.8)) / 14
        sgn = 1.0 if a > PART else -1.0
        card(a, 0.55 + rng.uniform(0, 0.15), v_tip(a) + rng.uniform(-0.03, 0.04), 0.010 + 0.002 * rng.random(), rng.uniform(1.2, 1.6), 'bang',
             nseg=16, bulge=0.004, arch=0.14, curl=sgn * rng.uniform(4, 12))
    n_bang = len(mb.F) - n_shell - n_card

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    me = bpy.data.meshes.new('Hair_P00'); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_P00', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array('P00_HairCard', make_atlas(), os.path.join(wip, 'p00_hair_atlas.png'))
    tmpl = next((mt.name for mt in bpy.data.materials if 'HAIR' in mt.name and getattr(mt, 'vrm_addon_extension', None)), None)
    mat = C.mtoon_from(tmpl, 'P00_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=False, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.72, 0.66, 0.66)
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    m['hair'] = obj
    print('  hair(p00): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
