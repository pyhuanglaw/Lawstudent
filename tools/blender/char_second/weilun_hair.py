"""邱韋綸（econ_weilun）的髮型（參考圖 weilun.webp：黑色短髮、頭頂往上翹、有點亂、兩側短、耳朵露出來、瀏海短短一撮一撮到眉毛上面）。
LAWWW2-C 2026-10-17 第一版：直接沿用阿哲的 zhe_hair（祐廷 p00_hair 改的蓬亂短髮：髮殼、層次髮片、瀏海、頭頂翹的短髮束）——
改的地方：顏色＝近黑（參考圖受光處 #2a2624，高光偏冷灰）、亂數種子不同（每一撮的位置、長短、翹的方向都不同）。
第二版（同一天）：髮尾高度整圈往上（瀏海到眉毛上方 3.5 cm、耳朵露出來）、頭頂更蓬——第一版正面看是蓋到眉毛的碗蓋頭。"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents

SEED = 20261017
POLE = (180.0, 72.0)      # 髮旋（方位角、仰角，度）：頭頂稍偏後（第九版 58°：側面看最高點在後腦上方，像一個包）
PART = -4.0               # 瀏海分線（方位角）：略偏人物的左邊
# 髮際線（方位角 → 仰角）：男生的前額髮際線略高、鬢角短、耳朵上方的髮際線貼著耳朵、後頸收高
HAIRLINE = [(0, 33), (20, 33), (35, 30), (48, 21), (57, 9), (63, -1), (69, -5), (76, -1), (86, 8), (98, 7), (108, -6),
            (120, -26), (136, -44), (152, -52), (168, -56), (180, -57)]
# 顏色（sRGB）：參考圖 02 的深黑棕（頭頂受光處偏暖棕）
DEEP = np.array([0.085, 0.075, 0.068]); BASE = np.array([0.185, 0.163, 0.145]); LIGHT = np.array([0.27, 0.24, 0.215]); SHEEN = np.array([0.36, 0.33, 0.30])   # 第十三版（BB_201 第 11 節必修：「韋綸一起改」）：很深的炭灰咖啡；舊（家豪照舊用）：BLACK_V12   # 韋綸：近黑（參考圖受光處 #2a2624），高光偏冷灰
REG = {'card': (0, 384, 0, 1024), 'cardB': (384, 640, 0, 1024), 'bang': (640, 896, 0, 1024), 'shell': (896, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'
BLACK_V12 = (np.array([0.045, 0.040, 0.040]), np.array([0.095, 0.085, 0.082]), np.array([0.165, 0.152, 0.148]), np.array([0.25, 0.24, 0.24]))   # 第十二版的近黑（家豪的頭髮用這一組：BB-C 通過的是黑色）
SIDE_TAPER = 0.65          # 第十二版：耳朵上面的頭髮貼頭的程度（0＝不變）


def make_atlas(seed=SEED):
    HB.DEEP, HB.BASE, HB.LIGHT, HB.SHEEN = DEEP, BASE, LIGHT, SHEEN
    rng = np.random.default_rng(seed); W = HB.W
    img = np.zeros((W, W, 4)); img[..., :3] = BASE
    def put(name, col, A):
        x0, x1, y0, y1 = REG[name]; img[y0:y1, x0:x1, :3] = col; img[y0:y1, x0:x1, 3] = A
    def reg(name): x0, x1, y0, y1 = REG[name]; return y1 - y0, x1 - x0
    # 層次髮片：上段一片（髮根），下段分成一撮一撮、長短不一、往中間微靠
    h, w = reg('card')
    put('card', HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.38), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 5, 0.68, 0.84, 1.0, hw_k=(0.95, 1.3), lean=0.12, power=0.65, full=2.4, minw=3.5))   # 第二版：髮尾分束從 55% 改 68%（太多透明的尖端，太陽穴看起來像剃短）
    h, w = reg('cardB')
    put('cardB', HB._strand_color(rng, h, w, 0.78, sheen=(0.28, 0.44), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 5, 0.46, 0.72, 1.0, hw_k=(0.85, 1.2), lean=0.22, power=0.6, full=2.0, minw=3.0))   # 第三版：刺刺的碎髮（早一點分束、尖端多、長短差多）
    h, w = reg('bang')
    put('bang', HB._strand_color(rng, h, w, 0.84, tip_light=0.04, base=BASE), HB._clumps(rng, h, w, 2, 0.50, 0.62, 1.0, hw_k=(1.2, 1.6), lean=0.12, power=0.9, full=3.5, minw=5.0))   # 瀏海一撮一撮寬一點（第一版像細線）；第七版每片 2 撮、長短差更多（遊戲裡一排同樣大小的尖角像鋸齒）
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    arm = m['arm']; rng = np.random.default_rng(SEED)
    HB.HAIRLINE = HAIRLINE; HB.REG_PX = dict(REG)          # h01_hair 的 hairline_beta、reg_uv 讀這兩個模組變數
    H = HB.Head(m); c = H.c
    print('  hair(weilun): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f' % (H.Rtop, H.brow_z, H.brow_top), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)

    def az(a): return abs(((a + 180) % 360) - 180)

    def side_taper(a, v):   # 第十二版（遊戲裡正面看太陽穴兩邊各一塊淡色：耳朵上面的頭髮離頭太遠，髮尖的縫看到背景）：耳朵上面（方位 45～125°）越靠髮尾越貼頭，v 0.45 → 0 時蓬的量剩 35%
        aa = az(a); s_ = float(sstep(45, 70, aa)) * (1 - float(sstep(115, 140, aa)))
        return 1 - SIDE_TAPER * s_ * (1 - float(sstep(0.0, 0.45, v)))

    def vol(a, v):          # 髮殼／髮片離頭皮的距離：頭頂（靠髮旋）最蓬、前額蓬、兩側貼、後頸收
        aa = az(a); ca = math.cos(math.radians(aa))
        top = 0.017 + 0.020 * float(sstep(0.10, 0.55, v)) - 0.006 * float(sstep(0.75, 0.97, v))   # 第三版（BB-C）：頭頂收（第二版 0.032：頭頂一撮翹起來像鳳梨頂）   # 韋綸第二版：頭頂往上翹、更蓬   # 阿哲：比祐廷蓬（蓬亂的短髮）   # 頭頂前半最蓬、髮旋附近收回來（第六版在遊戲裡髮旋堆成一個圓頂）
        side = 1 - 0.32 * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))   # 韋綸第三版：兩側、後腦厚一點（第二版 0.55：兩側太薄、看得到頭皮）   # 兩側貼一點（第三版 0.40：耳朵高度往外蓬，正面看像香菇頭）
        return (top * side * (0.6 + 0.4 * max(ca, 0.0)) + max(ca, 0.0) * (0.004 + 0.010 * float(sstep(0.2, 0.6, v)))) * side_taper(a, v)   # 第八版：後腦薄一點（遊戲裡髮旋後面鼓成一個包）；第十版：前額上方再蓬一點（側面看最高點在前半）

    def line_dir(a, v):
        b0 = HB.hairline_beta(a); d0 = sph(a, b0); g = slerp(d0, dP, v)
        if v >= 0: return g
        # 髮際線以下：漸漸改成同一個方位角往正下方（第四版沿著大圓往外延：太陽穴的髮尾往前跑到眼尾，側面看頭髮像帽簷蓋住眼睛）
        om = math.degrees(math.acos(float(np.clip(np.dot(d0, dP), -1, 1))))
        w = float(sstep(0.0, 0.12, -v))
        return _unit(g * (1 - w) + sph(a, b0 + v * om) * w)

    def surf(a, v, extra=0.0):
        d = line_dir(a, v); out = v < 0.03                     # 髮際線外面（額頭、太陽穴、耳朵）：量最外層（臉、耳朵）
        r = H.R(d, out)
        if out and az(a) >= 100:            # 後半圈往下的方向：從外面打會打到毛衣的背（髮尾被拉到背上）——改從頭的中心往外打第一個碰到的身體表面（後腦、後頸的皮膚）
            h = H.body.ray_cast(Vector(c), Vector(d), 0.4)[0]
            if h is not None: r = min(r, float(np.dot(np.array(h) - c, d)) + 0.004)
        return c + d * (r + vol(a, max(v, 0.0)) + extra + (0.006 * side_taper(a, 0.0) if out else 0.0)), d

    def v_at_z(a, z_tip, lo=-0.7, hi=0.0):                     # 沿這個方位往下，表面高度到 z_tip 的 v（二分法）
        for _ in range(26):
            mid = (lo + hi) / 2; p, _ = surf(a, mid)
            if p[2] > z_tip: hi = mid
            else: lo = mid
        return (lo + hi) / 2

    ear_top = H.brow_z + 0.023          # 耳朵上緣（第二版用 brow_top＋0.004；第三版眉毛網格放大後 brow_top 變高，改用不受影響的 brow_z）
    # 髮尾高度（方位角 → z）：瀏海到眉毛；太陽穴蓋到眼尾上方；耳朵前面的鬢角到耳朵中段；耳朵上面蓋住耳朵上緣約 1 cm
    # （第一版太陽穴的髮尾只到耳朵上緣以上、而且下半段是透明的尖端：太陽穴整片露出來，像剃短的兩側）
    # 第三版：太陽穴、鬢角再往下 2～3 cm（第二版的目標只到眉毛高度；耳朵前面的髮際線本來就在那個高度，髮尾剛好停在髮際線上，側面看是一個缺口）
    eye_z = H.brow_z - 0.025
    # 第五版：太陽穴前段（方位 36–55°）留在眉毛高度——側面看，太陽穴就在眼睛正外側，那裡的頭髮垂到眼睛高度會把眼睛整個擋住；
    # 只有耳朵前面的鬢角（60–85°，在眼睛後面）垂到眼睛高度
    TIP_A = [0, 20, 36, 50, 58, 66, 78, 92, 108, 112]
    TIP_Z = [H.brow_z + 0.022, H.brow_z + 0.024, H.brow_z + 0.020, H.brow_z + 0.016, eye_z + 0.034, eye_z + 0.030, eye_z + 0.026, ear_top + 0.012, ear_top + 0.012, ear_top + 0.010]   # 第五版（BB_201：「拖把頭、鬢角蓋住耳朵，要剪短、耳朵露出來」）：整圈再短 1.2～1.8 cm、耳朵上面露出來
    TIP_Z_V4 = [H.brow_z + 0.010, H.brow_z + 0.012, H.brow_z + 0.010, H.brow_z + 0.004, eye_z + 0.020, eye_z + 0.014, eye_z + 0.008, ear_top - 0.006, ear_top - 0.004, ear_top - 0.002]   # 韋綸第三版（BB-C）：瀏海幾撮垂到眉毛、太陽穴與耳朵上面蓋住（第二版瀏海在眉毛上方 3.5 cm、兩側露頭皮）   # 韋綸第二版：瀏海停在眉毛上方 3.5 cm、太陽穴到眼尾上方、耳朵露出來（第一版照阿哲：瀏海蓋到眉毛，正面看像碗蓋）
    def v_tip(a):           # 髮尾停在哪（v<0：超出髮際線）
        aa = az(a)
        if aa < 112: return min(-0.02 if aa > 36 else 1.0, v_at_z(a, float(np.interp(aa, TIP_A, TIP_Z))))
        # 後頸：髮際線往下 1.5～2.5 cm（第二版固定 v＝-0.06～-0.10：後面的方向幾乎朝正下方，髮尾跑到頸背 10～20 cm 下面，側面看是一條細線掛到毛衣上）
        z_hl = surf(a, 0.0)[0][2]
        return min(-0.02, v_at_z(a, z_hl - 0.015 - 0.010 * float(sstep(130, 170, aa)), lo=-0.12))   # 最多延伸 12%（正後方的方向再往下就是朝正下方，會穿進脖子）

    if os.environ.get('HAIR_DEBUG'):
        for a in (0, 20, 36, 45, 50, 56, 62, 70, 76, 84, 92, 100, 108, 116, 130, 150, 165, 175, 180):
            vt = v_tip(a); p, d = surf(a, vt); p0, _ = surf(a, 0.0)
            print('   az %4d v_tip %+.3f tip %s (target z %.3f) hairline %s' % (a, vt, np.round(p, 3), float(np.interp(min(a, 112), TIP_A, TIP_Z)), np.round(p0, 3)))
    # ---- 1. 髮殼 ----
    Nu, Nv, PAN = 128, 12, 4      # 2026-10-17 BB_201 第 7 節（頭髮鋸齒，照沛珊第十四版）：64 → 128
    A_ = np.linspace(-180, 180, Nu + 1); vs = np.linspace(0, 1.0, Nv + 1)   # 髮殼一直到髮旋（0.97 時髮旋留一個小洞，遊戲裡背面頭頂一個白點＝頭皮；BB-C 韋綸第二版「後腦一塊白色」）
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
    def card(a, vroot, vtip, off, wfac, reg, nseg=22, bulge=0.0, arch=0.1, curl=0.0):
        vv = np.linspace(vroot, vtip, nseg + 1); P = []; D = []; Wd = []; da = 360.0 / 56
        for i, v in enumerate(vv):
            t = i / nseg; e = (off + bulge * math.sin(math.pi * min(1.0, t * 1.2))) * (0.15 + 0.85 * float(sstep(0.0, 0.35, t)))   # 髮根那一段貼近：三層髮片都從髮旋出發，髮根一起往外推會在髮旋堆成圓頂；第十二版再貼平（外層髮根排成一圈，遊戲裡頭微低時後腦上方像一道台階、一個包）
            e *= side_taper(a + curl * t * t, max(v, 0.0))      # 第十二版：耳朵上面的髮片也貼頭
            p, d = surf(a + curl * t * t, v, e); q, _ = surf(a + curl * t * t + da, v, e)
            P.append(p); D.append(d); Wd.append(np.linalg.norm(q - p))
        P = np.array(P); D = np.array(D)
        P = H.push(P, np.linspace(0.003, 0.004 + off, len(P)))
        Tn = tangents(P); side = _unit(np.cross(D, Tn))
        width = np.maximum(np.array(Wd) * wfac, 0.006) * (0.65 + 0.35 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=arch, tt=np.linspace(0, 1, len(P)))

    for k in range(56):        # 內層：貼頭、短一點，蓋住髮殼的邊（兩側長到 85%：太陽穴、鬢角要蓋滿，不能只靠外層透明的髮尾）
        a = -180 + 360 * (k + 0.5) / 56 + rng.uniform(-1.5, 1.5); aa = az(a)
        card(a, 0.97, min(0.0, v_tip(a) * (0.55 + 0.30 * float(sstep(36, 58, aa)) * (1 - float(sstep(100, 120, aa))))), 0.0015, 1.7, 'card')
    for k in range(40):        # 中層：蓬一點
        a = -180 + 360 * (k + rng.uniform(0.2, 0.8)) / 40
        card(a, 0.90 - rng.uniform(0, 0.08), v_tip(a) * rng.uniform(0.8, 1.0), 0.0045 + 0.001 * rng.random(), rng.uniform(1.3, 1.6), 'cardB',
             bulge=0.002 + 0.002 * rng.random(), arch=0.12, curl=rng.uniform(-6, 6))
    for k in range(40):        # 外層：碎、長短不一（頭頂的層次）；阿哲 30 → 40 片、長短與翹的方向更亂
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / 40
        sk = (1 - 0.45 * float(sstep(50, 80, az(a))) * (1 - float(sstep(120, 150, az(a))))) * (1 - 0.4 * float(sstep(110, 150, az(a))))   # 兩側（耳朵附近）、後腦外層貼近一點
        card(a, 0.86 - rng.uniform(0, 0.18), v_tip(a) * rng.uniform(0.45, 1.08), (0.009 + 0.003 * rng.random()) * sk, rng.uniform(1.0, 1.4), 'cardB',
             bulge=(0.004 + 0.005 * rng.random()) * sk, arch=0.16, curl=rng.uniform(-14, 14))
    # （第一版在這裡加了 14 片往上翹的短髮束：遊戲裡變成頭頂一根根細的觸角，拿掉；亂的感覺靠外層的長短與方向）
    for sgn in (1.0, -1.0):    # 鬢角：太陽穴到耳朵前面，從髮際線上方往下梳（短、寬、不透明的部分多）
        for k in range(7):
            a = sgn * (44 + 40 * (k + rng.uniform(0.25, 0.75)) / 7)
            card(a, 0.30 + rng.uniform(0, 0.10), v_tip(a) - rng.uniform(0.0, 0.03), 0.003 + 0.001 * rng.random(), rng.uniform(1.8, 2.2), 'card',
                 nseg=10, bulge=0.002, arch=0.10, curl=-sgn * rng.uniform(2, 8))
    n_card = len(mb.F) - n_shell

    # ---- 3. 瀏海：分線兩邊各自往外撥，一撮一撮、長短不一 ----
    # 第二版：分兩層。底層寬、短一點（蓋住額頭，不透出皮膚）；上層一撮一撮、長短不一（有的到眼睛上緣）、離開額頭一點、從分線往兩邊撥
    # （第一版 14 片同樣長度的窄髮片：正面看像一排梳齒）
    for k in range(5):         # 阿哲：底層 10 → 5 片、窄、短（第一、二版正面看是一整片蓋住額頭的瀏海，像碗蓋）
        a = -40 + 80 * (k + rng.uniform(0.3, 0.7)) / 5
        card(a, 0.62 + rng.uniform(0, 0.08), v_tip(a) + rng.uniform(0.04, 0.08), 0.008 + 0.001 * rng.random(), rng.uniform(1.4, 1.7), 'bang',
             nseg=16, bulge=0.005, arch=0.08, curl=(1.0 if a > PART else -1.0) * rng.uniform(2, 6))
    for k in range(9):
        a = -36 + 72 * (k + rng.uniform(0.2, 0.8)) / 9
        sgn = 1.0 if a > PART else -1.0
        cu = sgn * rng.uniform(4, 12)      # 第三版：髮尾高度照撥過去之後的方位算、只會比目標短（第二版 curl 10–28° 照髮根的方位：兩側的髮束沿臉往下掉）
        card(a, 0.50 + rng.uniform(0, 0.20), v_tip(a + cu) + rng.uniform(0.0, 0.05), 0.012 + 0.003 * rng.random(), rng.uniform(1.5, 2.0), 'bang',
             nseg=16, bulge=0.007 + 0.003 * rng.random(), arch=0.10, curl=cu)
    n_bang = len(mb.F) - n_shell - n_card

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    me = bpy.data.meshes.new('Hair_Z01'); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_Z01', me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array('Z01_HairCard', make_atlas(), os.path.join(wip, 'z01_hair_atlas.png'))
    tmpl = next((mt.name for mt in bpy.data.materials if 'HAIR' in mt.name and getattr(mt, 'vrm_addon_extension', None)), None)
    mat = C.mtoon_from(tmpl, 'Z01_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=False, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.80, 0.74, 0.72)        # 第十一版：陰影面不要那麼暗（0.72／0.66）
    try:      # 第三版（BB-C：背面後腦一塊白色）：Sakurada 樣本頭髮材質的 MatCap（VRM 0.x 的 _SphereAdd）斜著看會發白，關掉
        mt.matcap_texture.index.source = None; mt.matcap_factor = (0.0, 0.0, 0.0)
    except Exception as ex: print('  matcap off failed', ex)
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    m['hair'] = obj
    print('  hair(weilun): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
