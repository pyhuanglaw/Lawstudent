"""唐睿（econ_tangrui）的髮型（參考圖 tangrui.webp：黑色蓬鬆捲髮，一圈一圈、整顆頭比較大、瀏海捲捲的蓋到眉毛、兩側也蓬、耳朵上半蓋住）。
LAWWW2-C 2026-10-17 第一版：沿用阿哲的 zhe_hair（蓬亂短髮的髮殼、層次髮片、瀏海、頭頂翹的短髮束），改：
顏色＝黑（受光處 #2c2826）、亂數種子不同、整體更蓬（頭頂 +6 mm、兩側不貼頭：側邊收的比例 0.55 → 0.30）。
第二版：加螺旋的捲髮束（curl_card：沿頭皮往下一小段、繞著轉 1～1.6 圈；整顆頭 150 撮＋前額 16 撮），外層直髮片 40 → 14、上層直瀏海拿掉——第一版正面看是直髮的碗蓋頭。
第三版：捲髮束 220＋26 撮、半徑 9～13 mm、離頭皮遠一點（量感）；底層直瀏海也拿掉、前額內層變短（第二版前額還是一排直的髮尾）。
第四版（2026-10-17）：螺旋髮束拿掉——遊戲裡螺旋的帶子常常側面朝鏡頭，看起來是一根根黑色鐵絲，整顆頭稀稀疏疏、額頭空。
改成「波浪髮束」（wave_lock）：一片 2.2～3.2 cm 寬、貼著頭皮往下、左右 S 形擺動、離頭皮越來越遠（蓬）、髮尾往外勾成 C 形；
貼圖 'curl'：每片 3 撮、每一撮的中心線和邊緣都是波浪（不是直的尖端）。參考圖：整顆蓬鬆的捲髮、捲的瀏海蓋到眉毛、耳朵上半蓋住。"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents

SEED = 20261018
POLE = (180.0, 72.0)      # 髮旋（方位角、仰角，度）：頭頂稍偏後（第九版 58°：側面看最高點在後腦上方，像一個包）
PART = -4.0               # 瀏海分線（方位角）：略偏人物的左邊
# 髮際線（方位角 → 仰角）：男生的前額髮際線略高、鬢角短、耳朵上方的髮際線貼著耳朵、後頸收高
# 第十八版（BB_201 第 10 節「太陽穴的淡色點」＝額角露出的皮膚，洋紅背景確認）：額角 35～57° 往下 3～8°（M 字的額角被不透明的髮殼蓋住；瀏海短 2 cm 以後額角整塊露出來）
HAIRLINE = [(0, 33), (20, 33), (35, 27), (48, 13), (57, 4), (63, -1), (69, -5), (76, -1), (86, 8), (98, 7), (108, -6),
            (120, -26), (136, -44), (152, -52), (168, -56), (180, -57)]
# 顏色（sRGB）：參考圖 02 的深黑棕（頭頂受光處偏暖棕）
DEEP = np.array([0.085, 0.075, 0.068]); BASE = np.array([0.185, 0.163, 0.145]); LIGHT = np.array([0.27, 0.24, 0.215]); SHEEN = np.array([0.36, 0.33, 0.30])   # 第二十版（BB_201 第 11 節必修）：底色從純黑改成很深的炭灰咖啡（髮殼約 #28231f）——純黑吃掉亮面；舊：0.055／0.118／0.200／0.30   # 唐睿：黑（受光處 #2c2826）；第十一版亮一點點（遊戲裡整顆頭是一塊黑，看不出一團一團的捲）
REG = {'card': (0, 256, 0, 1024), 'cardB': (256, 448, 0, 1024), 'curl': (448, 896, 0, 1024), 'bang': (896, 960, 0, 1024), 'shell': (960, 1024, 0, 1024)}   # 第四版：大部分給波浪髮束 'curl'
HEAD = 'J_Bip_C_Head'
HL = np.array([0.40, 0.28, 0.20])   # 第十六版：深咖啡的亮面（BB_201 第 10 節）；第十七版亮一點（#664733：0.29 在遊戲的卡通明暗下幾乎看不出來）
SIDE_TAPER = 0.75                   # 第十九版 0.40 → 0.75（洋紅背景放大：太陽穴的淡色是臉的側邊和垂在外面的頭髮之間 1 cm 的縫）；第十六版：太陽穴的淡色（耳朵上面的髮尾離頭太遠，從縫看到背景）——照韋綸的做法，只收一半（唐睿兩側要蓬）
SHELL_OFF = 0.006        # 第十一版：髮殼離頭皮再遠 8 mm（原本 −2 mm）——外形（剪影）交給不透明、圓的髮殼，波浪髮束貼在上面，不再是一根根伸出去的黑線


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
    put('cardB', HB._strand_color(rng, h, w, 0.78, sheen=(0.28, 0.44), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 4, 0.58, 0.80, 1.0, hw_k=(0.95, 1.3), lean=0.2, power=0.6, full=2.2, minw=3.5))
    # 第十六版（BB_201 第 10 節「加一層深咖啡的亮面，頭頂和右前方各一塊」）：原本直瀏海那一格（已經沒有用）改成「有亮面的整片」——
    # 和髮殼同樣的髮絲，髮片的 18%～45% 那一段混進深咖啡（#4a3226），邊緣跟著髮絲深淺不齊；頭頂、右前方的整片髮束用這一格
    h, w = reg('bang')
    base_ = HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85)
    t_ = ((np.arange(h) + 0.5) / h)[:, None]; jag = HB._streaks(rng, h, w, 3, 120, 0.5) * 0.10
    band = (HB.sstep(0.14, 0.22, t_ + jag) * (1 - HB.sstep(0.38, 0.48, t_ + jag)))[..., None]
    put('bang', base_ * (1 - 0.85 * band) + HL * 0.85 * band, np.ones((h, w)))
    # 第四版：波浪髮束——先做 3 撮的髮束（上段合成一片），再把每一列往左右錯開（正弦，越往髮尾擺越大），中心線和邊緣都變成波浪
    h, w = reg('curl'); M = int(0.11 * w) + 2; MR = int(0.39 * w) + 2; wi = w - M - MR   # 在中間 wi 寬畫髮束，每一列往左右錯開（不繞回另一邊；右邊留給勾起來的髮尾）
    # 第六版：一整撮（不是分成尖尖的細束）——寬度到 80% 才開始收、尾端是半圓（圓的勾）；中間一條暗一點的分界（兩小撮）；邊緣有細細的毛邊
    # （第四、五版用 _clumps 的尖端：遊戲裡每一撮都是尖刺，整顆頭像刺蝟，不像捲髮）
    ci = HB._strand_color(rng, h, wi, 0.80, sheen=(0.18, 0.34), tip_light=0.06, base=BASE)
    t = (np.arange(h) + 0.5) / h
    sh = (0.10 * w * np.sin(2 * np.pi * (1.2 * t + 0.10)) * (0.3 + 0.7 * t) + 0.28 * w * np.clip((t - 0.68) / 0.32, 0, 1) ** 1.6).astype(int)
    hw0 = 0.5 * wi * (1 - 0.18 * t); end = np.clip((t - 0.80) / 0.20, 0, 1); hw = hw0 * np.sqrt(np.clip(1 - end ** 2, 0, 1))
    xs = np.arange(wi)[None, :] - wi / 2; fuzz = rng.normal(0, 1.2, (h, wi)).cumsum(0) * 0.0 + rng.uniform(-1.5, 1.5, (h, 1))
    Ai = (np.abs(xs) < (hw[:, None] + fuzz)).astype(float)
    Ai *= 1 - 0.0 * (np.abs(xs) < 1.5)                                    # （保留：中間不挖空）
    ci = ci * (1 - 0.18 * np.exp(-(xs / (0.06 * wi)) ** 2) * (t[:, None] > 0.3))[..., None]   # 中間一條暗一點：兩小撮
    A = np.zeros((h, w)); col = np.zeros((h, w, 3)) + BASE
    for i in range(h):
        A[i, M + sh[i]:M + sh[i] + wi] = Ai[i]; col[i, M + sh[i]:M + sh[i] + wi] = ci[i]
    put('curl', col, A)   # 瀏海一撮一撮寬一點（第一版像細線）；第七版每片 2 撮、長短差更多（遊戲裡一排同樣大小的尖角像鋸齒）
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    arm = m['arm']; rng = np.random.default_rng(SEED)
    HB.HAIRLINE = HAIRLINE; HB.REG_PX = dict(REG)          # h01_hair 的 hairline_beta、reg_uv 讀這兩個模組變數
    H = HB.Head(m); c = H.c
    print('  hair(tangrui): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f' % (H.Rtop, H.brow_z, H.brow_top), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)

    def az(a): return abs(((a + 180) % 360) - 180)

    def vol(a, v):          # 髮殼／髮片離頭皮的距離：頭頂（靠髮旋）最蓬、前額蓬、兩側貼、後頸收
        aa = az(a); ca = math.cos(math.radians(aa))
        top = 0.021 + 0.030 * float(sstep(0.10, 0.55, v)) - 0.008 * float(sstep(0.75, 0.97, v))   # 唐睿：捲髮，比阿哲更蓬   # 阿哲：比祐廷蓬（蓬亂的短髮）   # 頭頂前半最蓬、髮旋附近收回來（第六版在遊戲裡髮旋堆成一個圓頂）
        side = 1 - 0.30 * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))   # 唐睿：兩側也蓬（阿哲 0.55）   # 兩側貼一點（第三版 0.40：耳朵高度往外蓬，正面看像香菇頭）
        bump = 0.0055 * (0.5 + 0.5 * math.cos(math.radians(a) * 9 + 1.3 * math.sin(v * 7.0))) * (0.5 + 0.5 * math.cos(v * 13.0 + math.radians(a) * 2)) * float(sstep(0.05, 0.25, v))   # 第五版：捲髮一團一團的起伏
        tp = 1 - SIDE_TAPER * float(sstep(45, 70, aa)) * (1 - float(sstep(115, 140, aa))) * (1 - float(sstep(0.0, 0.45, v)))
        return (top * side * (0.6 + 0.4 * max(ca, 0.0)) + max(ca, 0.0) * (0.004 + 0.010 * float(sstep(0.2, 0.6, v))) + bump) * tp   # 第八版：後腦薄一點（遊戲裡髮旋後面鼓成一個包）；第十版：前額上方再蓬一點（側面看最高點在前半）

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
        return c + d * (r + vol(a, max(v, 0.0)) + extra + (0.006 if out else 0.0)), d

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
    TIP_Z = [H.brow_z + 0.044, H.brow_z + 0.042, H.brow_z + 0.032, H.brow_z + 0.020, eye_z + 0.022, eye_z + 0.014, eye_z + 0.008, ear_top - 0.004, ear_top - 0.002, ear_top + 0.000]   # 第十六版（BB_201 第 10 節「瀏海短 2 cm、往上翻，露出眉毛和一半額頭」）：前面四個 +2 cm、太陽穴 +1.4～1.8 cm；第七版（BB_201：「圓、蓬、往上，現在是往前刺的瀏海」）：瀏海、兩側短一點（往上收）
    TIP_Z_V6 = [H.brow_z + 0.012, H.brow_z + 0.012, H.brow_z + 0.002, H.brow_z - 0.004, eye_z + 0.010, eye_z, eye_z - 0.004, ear_top - 0.016, ear_top - 0.010, ear_top - 0.006]   # 阿哲：瀏海髮尾在眉毛上方 1.2 cm（參考圖看得到眉毛）
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
        aa_ = az(a); wt_ = float(sstep(38, 55, aa_)) * (1 - float(sstep(100, 118, aa_)))
        vlo = min(0.0, v_tip(a) * 0.85) * wt_ if wt_ > 0 else 0.0     # 第十七版：太陽穴那一段髮殼往下延伸到髮尾的六成（髮際線以下只有半透明的髮片，正面看太陽穴一塊淡色＝看穿到背景）
        for j, v in enumerate(vs):
            p, d = surf(a, vlo + (1 - vlo) * v, SHELL_OFF); SP[i, j] = p; SN[i, j] = d
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
            p, d = surf(a + curl * t * t, v, e); q, _ = surf(a + curl * t * t + da, v, e)
            P.append(p); D.append(d); Wd.append(np.linalg.norm(q - p))
        P = np.array(P); D = np.array(D)
        P = H.push(P, np.linspace(0.003, 0.004 + off, len(P)))
        Tn = tangents(P); side = _unit(np.cross(D, Tn))
        width = np.maximum(np.array(Wd) * wfac, 0.006) * (0.65 + 0.35 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=arch, tt=np.linspace(0, 1, len(P)))

    for k in range(56):        # 內層：貼頭、短一點，蓋住髮殼的邊（兩側長到 85%：太陽穴、鬢角要蓋滿，不能只靠外層透明的髮尾）
        a = -180 + 360 * (k + 0.5) / 56 + rng.uniform(-1.5, 1.5); aa = az(a)
        card(a, 0.97, min(0.0, v_tip(a) * (0.55 + 0.30 * float(sstep(36, 58, aa)) * (1 - float(sstep(100, 120, aa)))) * (0.80 + 0.20 * float(sstep(30, 60, aa)))), 0.0015, 1.7, 'card')   # 第十五版：前額 0.35 → 0.80（墊在瀏海後面：第十四版中層縮短以後，瀏海中間露出一條額頭）   # 唐睿第三版：前額的內層短一點（直的髮尾會從捲髮下面露出來）
    for k in range(40):        # 中層：蓬一點
        a = -180 + 360 * (k + rng.uniform(0.2, 0.8)) / 40
        card(a, 0.90 - rng.uniform(0, 0.08), v_tip(a) * rng.uniform(0.6, 0.8) if az(a) > 60 else 0.02, 0.0045 + 0.001 * rng.random(), rng.uniform(1.3, 1.6), 'cardB',   # 第十四版：前面（方位 60° 以內）只到髮際線——直髮片的尖端從往內收的瀏海下面露出來，第十二、十三版看起來還是一排尖角
             bulge=0.002 + 0.002 * rng.random(), arch=0.12, curl=rng.uniform(-6, 6))   # 第四版：短一點（直的髮尾不要從波浪髮束下面露出來）
    for k in range(0):         # 第四版：外層直髮片全部拿掉        # 外層：唐睿只留 14 片（直的髮片多了看起來是直髮；捲的量感由下面的捲髮束做）
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / 40
        sk = (1 - 0.45 * float(sstep(50, 80, az(a))) * (1 - float(sstep(120, 150, az(a))))) * (1 - 0.4 * float(sstep(110, 150, az(a))))   # 兩側（耳朵附近）、後腦外層貼近一點
        card(a, 0.86 - rng.uniform(0, 0.18), v_tip(a) * rng.uniform(0.45, 1.08), (0.009 + 0.003 * rng.random()) * sk, rng.uniform(1.0, 1.4), 'cardB',
             bulge=(0.004 + 0.005 * rng.random()) * sk, arch=0.16, curl=rng.uniform(-14, 14))
    # （第一版在這裡加了 14 片往上翹的短髮束：遊戲裡變成頭頂一根根細的觸角，拿掉；亂的感覺靠外層的長短與方向）
    for sgn in (1.0, -1.0):    # 鬢角：太陽穴到耳朵前面，從髮際線上方往下梳（短、寬、不透明的部分多）
        for k in range(7):
            a = sgn * (60 + 26 * (k + rng.uniform(0.25, 0.75)) / 7)      # 第六版：只在耳朵前面（第五版從 44° 起：太陽穴前段的髮尾在眼角旁邊浮著）
            card(a, 0.30 + rng.uniform(0, 0.10), v_tip(a) - rng.uniform(0.0, 0.03), 0.003 + 0.001 * rng.random(), rng.uniform(1.8, 2.2), 'card',
                 nseg=10, bulge=0.002, arch=0.10, curl=-sgn * rng.uniform(2, 8))
    n_card = len(mb.F) - n_shell

    # ---- 3. 瀏海：分線兩邊各自往外撥，一撮一撮、長短不一 ----
    # 第二版：分兩層。底層寬、短一點（蓋住額頭，不透出皮膚）；上層一撮一撮、長短不一（有的到眼睛上緣）、離開額頭一點、從分線往兩邊撥
    # （第一版 14 片同樣長度的窄髮片：正面看像一排梳齒）
    for k in range(0):         # 唐睿第三版：底層直瀏海也拿掉（前額全部用捲髮束）
        a = -40 + 80 * (k + rng.uniform(0.3, 0.7)) / 5
        card(a, 0.62 + rng.uniform(0, 0.08), v_tip(a) + rng.uniform(0.04, 0.08), 0.008 + 0.001 * rng.random(), rng.uniform(1.4, 1.7), 'bang',
             nseg=16, bulge=0.005, arch=0.08, curl=(1.0 if a > PART else -1.0) * rng.uniform(2, 6))
    for k in range(0):         # 唐睿：上層的直瀏海拿掉，改成捲髮束（第一版正面看是一排直的髮絲垂到眉毛）
        a = -36 + 72 * (k + rng.uniform(0.2, 0.8)) / 9
        sgn = 1.0 if a > PART else -1.0
        card(a, 0.50 + rng.uniform(0, 0.20), v_tip(a) + rng.uniform(-0.08, 0.02), 0.012 + 0.003 * rng.random(), rng.uniform(1.5, 2.0), 'bang',
             nseg=16, bulge=0.007 + 0.003 * rng.random(), arch=0.10, curl=sgn * rng.uniform(10, 28))   # 阿哲：有的到眼睛上緣、往兩邊撥得更開（露出額頭）
    n_bang = len(mb.F) - n_shell - n_card

    # ---- 3b. 波浪髮束（唐睿第四版）----
    # 一片寬髮束：沿頭皮從 v0 往下到 v1；方位角左右 S 形擺動（amp°、waves 個波）；離頭皮 off（髮根貼、中段最蓬）；
    # 最後 30% 往外、往回勾（C 形的髮尾，半徑 cr）；髮片的正面朝外（法線＝頭皮的法線），從外面看是一整撮，不是側面的一條線
    def wave_lock(a, v0, v1, width, amp, waves, off, cr, phase, reg='curl', n=18, tuck=False, solid=False, flip=False, hl=False):
        if solid: n = 24
        t = np.linspace(0, 1, n + 1); P = []; Dn = []
        for ti in t:
            aa_ = a + amp * math.sin(2 * math.pi * waves * ti + phase); v = v0 + (v1 - v0) * ti
            e = off * (0.25 + 0.75 * float(sstep(0.0, 0.35, ti))) + 0.006 * math.sin(math.pi * ti)
            p, d = surf(aa_, v, e); P.append(p); Dn.append(d)
        P = np.array(P); Dn = np.array(Dn); T = tangents(P)
        th = np.pi * 1.05 * np.clip((t - 0.66) / 0.34, 0, 1)            # 髮尾勾起來（第五版：勾多一點）
        out_k = 0.85 if flip else (-0.55 if tuck else (0.25 if az(a) < 110 else 0.35))   # flip（第十六版瀏海）：髮尾往外、往上翻      # tuck（第十二版瀏海）：髮尾往內收（勾向額頭），不是往外翹；臉附近（前額、兩側）：主要往上勾、不往外翹（第四版有髮尾浮在眼睛前面）；第十一版後面也是（1.0：往外翹的髮尾側面朝鏡頭，正面看頭頂兩邊一根根飛出去的黑線）
        P = P + Dn * (cr * out_k * (1 - np.cos(th)))[:, None] - T * (cr * np.sin(th) * 0.8)[:, None]
        P = H.push(P, np.full(len(P), 0.004))
        Tn = tangents(P); side = _unit(np.cross(Dn, Tn)); nrm = _unit(Dn - Tn * np.sum(Dn * Tn, 1)[:, None])
        if solid:   # 第十三版（BB_201 第 9 節「幾大片圓弧、末端不要尖」）：不透明的整片（髮殼那一格貼圖），尾端的半圓用網格做——
            # 貼圖的透明邊緣做出來的圓頭，遠看或斜看時被 alpha 門檻切成尖角（第十二版還是一排尖角）
            reg = 'bang' if hl else 'shell'; end = np.clip((t - 0.85) / 0.15, 0, 1)   # hl：有深咖啡亮面的那一格        # 第十五版：只在最後 15% 收成半圓（第十四版 30%：圓頭拉得太長，看起來還是尖的）
            wd = width * 0.70 * (0.80 + 0.20 * sstep(0.0, 0.2, t)) * np.maximum(np.sqrt(np.clip(1 - end ** 2, 0, 1)), 0.06)   # 0.70：寬一點、片和片重疊（第十四版 0.55，兩片中間露出一條額頭）
        else:
            wd = width * (0.70 + 0.30 * sstep(0.0, 0.2, t)) * (1 - 0.25 * sstep(0.60, 1.0, t))   # 第五版：尾端不收那麼細
        mb.ribbon(P, side, nrm, wd, reg, 'head', np.zeros(len(P)), arch=0.18, tt=t)
    n0 = len(mb.F); nlock = 0
    for layer, (cnt, off0, vr0, vr1) in enumerate(((64, 0.008, (0.45, 0.80), (0.10, 0.20)), (60, 0.011, (0.55, 0.95), (0.16, 0.28)), (36, 0.014, (0.70, 0.98), (0.18, 0.30)))):   # 第十六版：最外層 44 → 36（片和片之間留縫，看得到底下的層次）   # 第十一版：內層在髮殼外面、外層多一點（蓋滿，少一點縫）；第十二版（BB_201 第 9 節「頭頂很多飛出去的細線」）：都貼近髮殼、外層少一點
        for k in range(cnt):          # 三層：內層貼頭、外層最蓬（頭頂、兩側、後腦）
            a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / cnt; aa = az(a)
            if aa < 34 and layer < 2: continue                          # 前額交給瀏海
            v0 = rng.uniform(*vr0); vt = v_tip(a); v1 = max(vt * (0.95 if aa > 40 else 0.7), v0 - rng.uniform(*vr1))
            wave_lock(a, v0, v1, (rng.uniform(0.022, 0.048) * 1.25) if layer == 2 else rng.uniform(0.026, 0.036), rng.uniform(5, 11) * (0.5 if layer == 2 else 1.0), rng.uniform(0.9, 1.4), off0 + 0.004 * rng.random(),   # 第十六版：最外層大小不一（「一圈一樣的半圓像蕾絲」）
                      rng.uniform(0.004, 0.007), rng.uniform(0, 2 * math.pi), solid=(layer == 2), hl=(layer == 2 and v0 > 0.84 and aa < 75)); nlock += 1   # 頭頂那一塊亮面   # 第十一版：勾小一點（1.0～1.6 cm）；第十二版再小；第十三版最外層是不透明的整片（頭頂飛出去的細線＝透明邊緣）
    for row in range(2):           # 捲的瀏海（第五版：兩排 2×16 片、寬一點，蓋住額頭到眉毛；第四版 22 片細的，額頭露很多）
        nb = 7 if row == 0 else 6  # 第十六版：9＋8 → 7＋6、大小不一、髮尾往上翻、右前方的有亮面；第十二版（BB_201 第 9 節：「不用捲，要圓、蓬、柔：改成幾大片圓弧，末端往內收、不要尖」）：
        for k in range(nb):        # 2×20 片窄的 → 9＋8 片寬的（5～6 cm）、左右擺動小（大的弧）、髮尾往內收（tuck）；第十一版 20 片窄的尖端像一排黑色尖角
            a = -52 + 104 * (k + rng.uniform(0.35, 0.65) + 0.5 * row) / (nb + 0.5)
            a += rng.uniform(-3, 3)
            wave_lock(a, rng.uniform(0.50, 0.70), v_tip(a) - 0.03 + (0.0 if row == 0 else 0.02) + rng.uniform(-0.01, 0.02), rng.uniform(0.042, 0.075), rng.uniform(2, 4), rng.uniform(0.5, 0.8),
                      0.010 + 0.004 * row + 0.003 * rng.random(), rng.uniform(0.010, 0.016), rng.uniform(0, 2 * math.pi), flip=abs(a) < 28, solid=True, hl=(12 <= a <= 52)); nlock += 1   # 第十七版：只有中間的往上翻（兩側也翻時太陽穴旁邊像翅膀）   # 第六版：再長一點、勾小一點（第五版勾起來的髮尾把瀏海往上翻 3 cm，額頭露出來）
    print('  hair(tangrui): wave locks %d faces %d' % (nlock, len(mb.F) - n0))

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
    try:      # 第四版：樣本頭髮材質的 MatCap 關掉（遊戲裡頭頂斜著看一圈白邊）
        mt.matcap_texture.index.source = None; mt.matcap_factor = (0.0, 0.0, 0.0)
    except Exception as ex: print('  matcap off failed', ex)
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    m['hair'] = obj
    print('  hair(tangrui): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
