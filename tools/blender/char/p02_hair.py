"""林芷若（heroine_02）的髮型：黑色及肩微捲髮＋中分偏一邊的空氣感八字瀏海（Blender 髮片網格；v9.4 人物生產線第三位，2026-10-10）。
參考圖 06：黑色（受光處偏深棕）、頭頂服貼、從耳朵下面開始自然垂落到肩膀、髮尾微微外翻、下段有一點波浪；瀏海從分線往兩邊撥、
長度到顴骨，和臉旁的頭髮連成框住臉的弧線；耳朵大部分蓋住（銀色小耳環從髮間露出來，是 props3d.js）。
做法（沿用祐廷 p00_hair 的頭皮量測、髮殼、髮片貼圖；新的是垂落的髮束）：
 1. 髮殼：髮旋為極點、髮際線為邊界的球面網格，貼著頭皮加厚。
 2. 垂落髮片：上段沿著頭皮從髮旋梳到耳下（和祐廷一樣的球面參數）；耳下以下改成往下垂（水平位置只往外移一點避開脖子與肩膀），
    下半段微微的 S 形波浪、髮尾往外翻；前面兩側短（下巴）、兩側到肩膀、後面最長。兩層（內層密、外層碎）。
 3. 瀏海：分線兩邊各自往外撥的長髮片，髮尾在顴骨，和前面兩側的髮束接起來。
 4. 全部綁在頭骨（第一版沒有彈簧骨：低頭、轉頭時髮尾跟著頭轉）。
第九版（LAWWW2 2026-10-22，使用者「林芷若3d好憨」的下一輪，ART-ZR-HAIR-1022；LAWWW 驗收：頭頂平得像頭盔、只到下巴）：
 1. 分線改到人物的左邊（PART +12°）：參考圖 06 的臉部特寫、campus 立繪，分線都在畫面右邊＝人物的左手邊，頭髮多、往外撥的那一邊在人物的右邊；
    第八版之前左右做反了（−4°＝人物的右邊）。瀏海兩邊不對稱：右邊一大片從分線往外撥、蓋住額角，左邊短、沿著太陽穴垂下。
 2. 長度到肩下：前面兩側沿著胸前垂到鎖骨下，正側面從肩膀後面繞過去，後面到肩胛骨上緣（做法同杜可昕 kexin_hair.py）；
    長髮的下段改綁上胸（脖子以上綁頭、往下漸漸換成上胸：轉頭時髮尾跟著身體，不會甩進胸口或背）。
 3. 頭頂蓬一點（第八版服貼、側面看像頭盔），分線旁頭髮多的那一邊再往上蓬。
 4. 髮色改深棕、受光處暖棕（第八版接近純黑；參考圖 06 是深棕）。characters.js 的 hair.color 照舊。
 參數可以用環境變數 HAIR_OVERRIDE（JSON）試，見下面的 HP。
座標：Blender Z 朝上、人物面向 -Y、+X＝人物的左手邊（同 h01_hair）。"""
import math, os, json
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents, catmull, resample

SEED = 20261012
POLE = (180.0, 70.0)      # 髮旋：頭頂稍偏後
# 第九版的參數（HAIR_OVERRIDE 環境變數可以覆蓋，試參數用；長度是模型單位：Victoria Rubin 身高 1.715，遊戲裡縮成 161 cm）
HP = dict(PART=12.0,                      # 分線（方位角，+＝人物的左邊）；第八版 −4（左右做反）
          TOP0=0.010, TOP1=0.014,         # 頭頂的厚度：髮際線旁 1.0 cm、頭頂最厚 2.4 cm（第八版 0.8、1.8）
          LIFT=0.007,                     # 分線旁頭髮多的那一邊（人物的右邊）再蓬多少
          LEN_F=0.090, LEN_B=0.110,       # 髮尾比脖子根部低多少：前面兩側（鎖骨下）、後面（肩胛骨上緣）
          WAVE=0.010,                     # 下段波浪的幅度（第八版 0.006–0.010）
          BIG_A1=12.0, BIG_A2=20.0, BIG_Z2=0.010,   # 右邊（大片）瀏海：越過髮際線離分線幾度、內緣在額頭外側的方位、比眉毛上緣高多少
          SMALL_A1=3.0, SMALL_A2=27.0, SMALL_Z2=0.012,  # 左邊（小片）瀏海：越過髮際線離分線幾度、內緣
          SIDE_K=0.45,                    # 兩側（55–95°）頭頂厚度打幾折（第八版 0.45：頭不要太寬）
          BANG_OFF=0.008,                 # 大片瀏海髮根的蓬度（第八版 0.005）
          BUL=0.010,                      # 兩側從髮際線往下蓬出多少（第八版 0.010）
          FLARE=1.0,                      # 髮尾往外張的倍數（第八版 1.0：前側 1.2、兩側 0.9、後面 1.4 cm）
          WAVE_R=0.0,                     # 波浪也往內外起伏（佔 WAVE 的比例；第八版只有左右）
          WAVE_LEN=0.0,                   # 波浪的波長（公尺；0＝照第八版：每片 1.1 個週期、各自隨機相位）。>0 時波峰照高度對齊，整頭的波浪一致
          WAVE_PH=0.0,                    # 波浪的起始相位（WAVE_LEN>0 時用）
          FRONT_SPREAD=0.006)             # 前面的頭髮沿胸前垂下時，最多比耳下那一點再往外幾公分（杜可昕的直髮 0.6 cm）
HP.update(json.loads(os.environ.get('HAIR_OVERRIDE') or '{}'))
PART = HP['PART']         # 第八版之前 -4.0（略偏人物的右邊：參考圖 06 看反了；第六版 -9° 的側分瀏海在近看時像一排齊瀏海）
# 顏色（sRGB）：參考圖 06 的深棕髮（受光處暖棕）；比純黑亮一級：遊戲（MToon）裡太黑會看不出髮絲（祐廷第十一版的經驗）
# 第九版：第八版是 DEEP (0.07, 0.06, 0.06)、BASE (0.14, 0.12, 0.115)、LIGHT (0.24, 0.205, 0.19)、SHEEN (0.40, 0.355, 0.33)（接近純黑）
DEEP = np.array([0.080, 0.056, 0.046]); BASE = np.array([0.168, 0.120, 0.096]); LIGHT = np.array([0.30, 0.215, 0.170]); SHEEN = np.array([0.42, 0.315, 0.250])
REG = {'card': (0, 288, 0, 1024), 'cardB': (288, 512, 0, 1024), 'bang': (512, 704, 0, 1024), 'lock': (704, 960, 0, 1024), 'shell': (960, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'
DBG = {}                  # 除錯輸出用（HAIR_DEBUG）：目前在做哪一層


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
    if HP.get('BLUNT', 0):   # 第九版：髮尾鈍一點、成束（第八版的髮尾分得細，長了以後像一根一根的細線）
        put('lock', HB._strand_color(rng, h, w, 0.72, sheen=(0.10, 0.22), tip_light=0.08, base=BASE), HB._clumps(rng, h, w, 5, 0.86, 0.95, 1.0, edge_taper=0.03, hw_k=(1.2, 1.55), lean=0.06, power=0.75, full=3.2, minw=4.0))
    else:
        put('lock', HB._strand_color(rng, h, w, 0.72, sheen=(0.10, 0.22), tip_light=0.08, base=BASE), HB._clumps(rng, h, w, 5, 0.82, 0.92, 1.0, edge_taper=0.04, hw_k=(1.2, 1.55), lean=0.08, power=1.0, full=2.4, minw=4.0))
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    arm = m['arm']; rng = np.random.default_rng(SEED); DBG.clear()
    HB.REG_PX = dict(REG)          # 髮際線用 h01_hair 的預設（女性：圓的髮際線、鬢角低）
    H = HB.Head(m); c = H.c
    neck_z = C.landmarks(arm)['neck']
    print('  hair(p02): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f neck %.3f' % (H.Rtop, H.brow_z, H.brow_top, neck_z), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)
    SKIP = set(filter(None, os.environ.get('HAIR_SKIP', '').split(',')))     # 除錯：只看某幾組（shell、inner、main、outer、bang）

    def az(a): return abs(((a + 180) % 360) - 180)

    def vol(a, v):           # 頭頂有一點蓬度（第九版；第八版服貼，側面看像頭盔）、前額上方再蓬一點、兩側貼
        aa = az(a); ca = math.cos(math.radians(aa))
        top = HP['TOP0'] + HP['TOP1'] * float(sstep(0.10, 0.55, v)) - 0.005 * float(sstep(0.78, 0.97, v))
        side = 1 - HP['SIDE_K'] * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))
        # 第九版：分線旁頭髮多的那一邊（人物的右邊，方位角 PART−5…−70°）往上蓬：正面看兩邊不對稱，像參考圖 06
        an = ((a - PART + 180) % 360) - 180
        lift = HP['LIFT'] * float(sstep(-2, -12, an) * (1 - sstep(-55, -85, an))) * float(sstep(0.05, 0.30, v) * (1 - sstep(0.70, 0.92, v)))
        return top * side * (0.7 + 0.3 * max(ca, 0.0)) + max(ca, 0.0) * 0.004 * float(sstep(0.2, 0.6, v)) + lift

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
    # 髮尾高度（方位角 → z）：第九版到肩下——前面兩側沿著胸前垂到鎖骨下、72° 停在肩膀上（T 字姿勢的手臂是水平的）、
    # 正側面從肩膀後面繞過去、後面到肩胛骨上緣（做法同杜可昕）
    # 第八版：[36, 50, 65, 90, 130, 180] → [eye_z − 0.040, neck_z + 0.032, +0.028, +0.026, −0.006, −0.026]（到下巴、兩側停在肩膀上方）
    TIP_A = [36, 50, 62, 72, 82, 95, 108, 120, 135, 180]
    kB = HP['LEN_B'] / 0.110
    TIP_Z = [neck_z - HP['LEN_F'], neck_z - HP['LEN_F'] - 0.008, neck_z - HP['LEN_F'] + 0.030, neck_z - 0.012,
             neck_z - 0.050 * kB, neck_z - 0.075 * kB, neck_z - 0.090 * kB, neck_z - HP['LEN_B'] + 0.010, neck_z - HP['LEN_B'] + 0.004, neck_z - HP['LEN_B']]
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
    n_shell = len(mb.F); GR = [('shell', 0, n_shell)]

    # ---- 2. 垂落的髮片：上段沿頭皮（球面參數）、耳下以下往下垂 ----
    def hang_card(a, vroot, off, wfac, reg, nseg=12, curl=0.0, wave=0.0, wph=0.0, flip=0.010, tip_dz=0.0, short=False, tight=0.0):
        """a：方位；vroot：髮根（髮旋附近）；short＝只到 z_hang（內層、頭頂層）"""
        vh = min(-0.02, v_at_z(a, z_hang)) if not short else min(-0.02, v_at_z(a, z_hang + 0.02))
        vv = np.linspace(vroot, vh, nseg + 1)
        # 第七版：兩側從髮際線往下漸漸蓬出 1 cm（第六版在耳朵高度貼著耳朵往內收、下面再往外張，正面看像兩束低馬尾）
        bul = HP['BUL'] * float(sstep(45, 70, az(a)) * (1 - sstep(125, 150, az(a))))
        # 第八版：正側面（80–100°）的髮片從頭最寬的地方往下收 6 mm。正面看，正側面的髮片是側著的（一條線），
        # 半徑和 70–80° 的髮片一樣時，它會比「看得到髮面」的那些多突出 r(1−sin75°)≈4 mm，中間露出背景，變成一條往外飄的細線
        edge = float(sstep(76, 86, az(a)) * (1 - sstep(94, 104, az(a))))
        P = []; D = []
        for i, v in enumerate(vv):
            t = i / nseg; e = off * (0.15 + 0.85 * float(sstep(0.0, 0.35, t))) + bul * float(sstep(0.0, 0.30, -v)) - 0.006 * edge * float(sstep(0.30, 0.0, v))
            p, d = surf(a + curl * t * t, v, e); P.append(p); D.append(d)
        P = np.array(P); D = np.array(D)
        if not short:
            # 第八版：髮尾往外張的量照方位平順變化（前側 1.2、兩側 0.9、後面 1.4 cm），每片只差 ±2 mm。
            # 第六、七版每片隨機外翻 0.8–1.8 cm：比旁邊翻得多的那一片，正面看就是一條往外飄的細線（兩側的髮片在正面看是側著的）
            F = HP['FLARE'] * float(np.interp(az(a), [36, 55, 70, 110, 135, 180], [0.010, 0.012, 0.009, 0.009, 0.013, 0.014]))
            fv = F + 0.35 * (flip - 0.013) - 0.004 * tight - 0.005 * edge
            p0 = P[-1]; rad = _unit(np.array([p0[0] - c[0], p0[1] - c[1], 0.0]))
            tan = _unit(np.cross([0, 0, 1.0], rad))
            zt = z_tip(a) + tip_dz; n2 = 12; L2 = max(p0[2] - zt, 0.02)
            low = []
            for k in range(1, n2 + 1):
                t = k / n2
                env = float(sstep(0.20, 0.5, t))
                if HP['WAVE_LEN'] > 0:      # 第九版：波峰照高度對齊（鄰近的髮束一起起伏）、內外和左右差 90°（像一圈一圈的捲）
                    ph = 2 * math.pi * L2 * t / HP['WAVE_LEN'] + wph
                    q = p0 + rad * (fv * float(sstep(0.15, 1.0, t)) ** 1.3 + HP['WAVE_R'] * wave * math.sin(ph) * env) + tan * wave * math.cos(ph) * env
                else:
                    wv_ = wave * math.sin(math.pi * 2.2 * t + wph) * env   # 長一點、波浪 1.1 個週期（第八版 0.8）
                    q = p0 + rad * (fv * float(sstep(0.15, 1.0, t)) ** 1.3 + HP['WAVE_R'] * abs(wv_)) + tan * wv_
                q[2] = p0[2] - L2 * t + 0.25 * fv * float(sstep(0.80, 1.0, t))   # 髮尾外翻時微微往上
                # 第九版（同杜可昕）：背後往兩邊散開一點（蓋住肩胛骨上緣）、正側面往後，從肩膀後面垂下
                q[0] += math.copysign(1.0, p0[0] - c[0]) * float(np.interp(az(a), [100, 115, 140, 165, 180], [0.0, 0.018, 0.020, 0.010, 0.0])) * float(sstep(0.05, 0.7, t))
                q[1] += float(np.interp(az(a), [72, 82, 100, 112, 125], [0.0, 0.045, 0.050, 0.030, 0.0])) * float(sstep(0.0, 0.55, t))
                low.append(q)
            low = np.array(low)
            if az(a) < 64:      # 第九版：前面的頭髮從下巴以下沿著胸前垂下——貼在衣服前面（同杜可昕：T 字姿勢的肩膀會把髮尾推到手臂旁）
                for j in range(len(low)):
                    q = low[j]
                    if q[2] < neck_z + 0.03:
                        xl = math.copysign(min(abs(q[0] - c[0]), abs(p0[0] - c[0]) + HP['FRONT_SPREAD']), q[0] - c[0]) + c[0]
                        low[j] = np.array([xl, min(q[1], H.front_y(xl, q[2]) - 0.008), q[2]])
            P = np.vstack([P, low]); D = np.vstack([D, np.tile(rad, (len(low), 1))])
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
            for _ in range(2):
                P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
            # 被肩膀（T 字姿勢）推出去的也收回來：最多比設計的外張多 4 mm（第九版：只有兩側 64–78°；前面貼胸口、正側面往後、背後往兩邊散開的不收）
            if 64 <= az(a) < 78:
                r0 = float(np.hypot(p0[0] - c[0], p0[1] - c[1])); rmax = r0 + fv + 0.004
                hz = np.hypot(P[nseg + 1:, 0] - c[0], P[nseg + 1:, 1] - c[1]); k = np.minimum(1.0, rmax / np.maximum(hz, 1e-6))
                P[nseg + 1:, 0] = c[0] + (P[nseg + 1:, 0] - c[0]) * k; P[nseg + 1:, 1] = c[1] + (P[nseg + 1:, 1] - c[1]) * k
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.006)])     # 收回來之後再推出衣服一次（不穿進上衣）
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
            zz = (P[:, 2] > z_hang - 0.08) & (P[:, 2] < z_hang + 0.03)
            if zz.any() and np.abs(P[zz, 0]).max() > 0.118:
                i = int(np.argmax(np.where(zz, np.abs(P[:, 0]), 0))); print('   WIDE %s a=%.1f i=%d/%d p=%s w=%.3f curl=%.1f wave=%.3f flip=%.3f' % (DBG.get('layer'), a, i, len(P), np.round(P[i], 3).tolist(), wd * wfac, curl, wave, flip))
        f0 = len(mb.F); mb.ribbon(P, side, D, width, reg, 'head', np.zeros(len(P)), arch=0.10, tt=np.linspace(0, 1, len(P)))
        DBG.setdefault('cards', []).append((DBG.get('layer'), a, f0, len(mb.F)))

    f0 = len(mb.F)
    DBG['layer'] = 'inner'
    for k in range(56):        # 內層：頭頂到耳下（短），蓋住髮殼的邊
        a = -180 + 360 * (k + 0.5) / 56 + rng.uniform(-1.5, 1.5)
        if az(a) < 34: continue                      # 前額交給瀏海
        hang_card(a, 0.95, 0.0015, 1.7, 'card', short=True)
    GR.append(('inner', f0, len(mb.F))); f0 = len(mb.F)
    DBG['layer'] = 'main'
    for k in range(54):        # 主層：垂到肩下（第九版 54 片；第八版 48 片到肩膀）
        a = -180 + 360 * (k + rng.uniform(0.25, 0.75)) / 54
        if az(a) < 36: continue
        hang_card(a, 0.90 - rng.uniform(0, 0.06), 0.0040 + 0.001 * rng.random(), rng.uniform(1.5, 1.8), 'lock',
                  curl=rng.uniform(-4, 4), wave=HP['WAVE'] * (0.8 + 0.4 * rng.random()), wph=(HP['WAVE_PH'] + rng.uniform(-0.6, 0.6)) if HP['WAVE_LEN'] > 0 else rng.uniform(0, 6.28), flip=0.008 + 0.006 * rng.random(), tip_dz=rng.uniform(-0.014, 0.010))
    GR.append(('main', f0, len(mb.F))); f0 = len(mb.F)
    DBG['layer'] = 'outer'
    for k in range(38):        # 外層：碎一點、長短不一（第九版 38 片；第八版 34）
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / 38
        if az(a) < 38: continue
        vr = 0.86 - rng.uniform(0, 0.12); of = 0.0070 + 0.002 * rng.random(); wf = rng.uniform(1.2, 1.5); rg = 'cardB' if rng.random() < 0.4 else 'lock'
        cu = rng.uniform(-6, 6); wv = HP['WAVE'] * (1.0 + 0.5 * rng.random()); ph = rng.uniform(0, 6.28); fl = 0.010 + 0.008 * rng.random(); td = rng.uniform(-0.025, 0.020)
        if HP['WAVE_LEN'] > 0: ph = HP['WAVE_PH'] + 0.8 + rng.uniform(-0.8, 0.8)     # 外層：和主層差一點（不會整片一樣）
        # 第八版：兩側（55–130°）的外層收進主層裡面（正面看，正側面的髮片是側著的，比主層突出就是一條往外飄的細線）
        sk = float(sstep(55, 70, az(a)) * (1 - sstep(115, 130, az(a))))
        hang_card(a, vr, of - 0.0040 * sk, wf, rg, curl=cu * (1 - 0.7 * sk), wave=wv, wph=ph, flip=fl, tip_dz=td, tight=sk)
    GR.append(('outer', f0, len(mb.F)))
    n_card = len(mb.F) - n_shell

    # ---- 3. 瀏海：中分偏一邊的八字瀏海（第七版）----
    # 參考圖 06 的臉部特寫：分線旁的頭髮越過髮際線後馬上往兩邊撥開，沿著額頭外側斜斜往下、經過眉尾外面，
    # 髮尾在眼睛旁（顴骨高度），和臉旁垂下來的頭髮接成框住臉的弧線；額頭中間露出一個倒 V。
    # 第六版是「分線旁到眉毛、往外越長」的側分瀏海：近看是一排橫過額頭的齊瀏海（遊戲內臉部特寫），所以改成這種走法。
    # 第九版：兩邊不對稱（參考圖 06、campus 立繪）。人物的右邊（sgn −1）一大片從分線往外撥、髮根蓬起來，越過髮際線以後斜斜蓋住右邊額角、
    # 經過眉尾外面到顴骨；左邊（sgn +1）短、沿著太陽穴垂下。額頭露出的那一塊在分線兩邊不對稱。
    # 第七、八版是對稱的八字瀏海：a1 = PART ± (3 + 13t)、a2 = ±(V_A + 11t)、V_A 23°（第七版）／16°（10-22「好憨」第一輪）
    def curtain_card(sgn, t, vroot, off, wfac, rr):
        """t：0＝最靠分線（額頭露出那一塊的邊）→ 1＝最外面；控制點用（方位角, v）：髮根 → 髮際線 → 額頭外上方 → 眼睛旁"""
        if sgn < 0:          # 大片（人物的右邊）
            a0 = PART - (1.0 + 8.0 * t); a1 = PART - (HP['BIG_A1'] + 20.0 * t)
            a2 = -(HP['BIG_A2'] + 12.0 * t) + rr * 1.5; z2 = H.brow_top + HP['BIG_Z2'] - 0.004 * t
            a3 = -(42.0 + 10.0 * t) + rr * 2.0; z3 = eye_z - 0.006 - 0.024 * t - 0.006 * abs(rr)
        else:                # 小片（人物的左邊）
            a0 = PART + (0.8 + 5.0 * t); a1 = PART + (HP['SMALL_A1'] + 9.0 * t)
            a2 = HP['SMALL_A2'] + 10.0 * t + rr * 1.5; z2 = H.brow_top + HP['SMALL_Z2'] - 0.004 * t
            a3 = 44.0 + 10.0 * t + rr * 2.0; z3 = eye_z - 0.004 - 0.022 * t - 0.006 * abs(rr)
        ctrl = np.array([[a0, vroot], [a1, 0.0], [a2, v_at_z(a2, z2)], [a3, v_at_z(a3, z3)]])
        AV = catmull(ctrl, 8)
        P = []; D = []; n = len(AV)
        for i, (a, v) in enumerate(AV):
            tt = i / (n - 1); e = off * (0.35 + 0.65 * float(sstep(0.0, 0.25, tt))) + 0.003 * math.sin(math.pi * min(1.0, tt * 1.15))
            p, d = surf(a, v, e); P.append(p); D.append(d)
        P = H.push(np.array(P), 0.004); D = np.array(D)
        for _ in range(2): P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
        Tn = tangents(P); D = _unit(D - Tn * np.sum(D * Tn, 1)[:, None]); side = _unit(np.cross(D, Tn))
        width = wfac * 0.011 * (0.55 + 0.45 * sstep(0.0, 0.25, np.linspace(0, 1, len(P)))) * (1.0 - 0.25 * sstep(0.75, 1.0, np.linspace(0, 1, len(P))))
        if os.environ.get('HAIR_DEBUG'):
            print('   bang sgn=%+d t=%.2f a %.1f→%.1f z_end %.3f pts %s' % (sgn, t, ctrl[0, 0], ctrl[-1, 0], P[-1, 2], np.round(P[[0, n // 3, 2 * n // 3, -1]], 3).tolist()))
        mb.ribbon(P, side, D, width, 'bang', 'head', np.zeros(len(P)), arch=0.08, tt=np.linspace(0, 1, len(P)))
    for sgn, nb in ((-1.0, 11), (1.0, 6)):    # 第九版：分線在人物的左邊，右邊（大片）11 片、左邊 6 片（第八版右 8、左 9）
        for k in range(nb):
            t = (k + rng.uniform(0.3, 0.7)) / nb
            off = HP['BANG_OFF'] + 0.004 * t if sgn < 0 else 0.005 + 0.003 * t
            curtain_card(sgn, t, 0.42 + rng.uniform(0, 0.12), off, rng.uniform(2.0, 2.5), rng.uniform(-1, 1))
    n_bang = len(mb.F) - n_shell - n_card
    GR.append(('bang', n_shell + n_card, len(mb.F)))

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    # 第八版：耳朵高度以下，正側面（78–110°）的髮片不能比「正面看得到髮面」的那一圈（55–78°）更外面。
    # 正側面的髮片在正面看是側著的一條線；比髮面那一圈突出時，中間露出背景，就是往外飄的細線（第六、七版的問題）
    zb = lambda z: np.clip(np.floor((z - (neck_z - 0.13)) / 0.008).astype(int), 0, 40)   # 第九版：頭髮變長，從脖子根部下 13 cm 開始量（第八版從 1.38）
    for sg in (1, -1):
        ref, tgt = [], []
        for g, a, i0, i1 in DBG.get('cards', []):
            an = ((a + 180) % 360) - 180
            if np.sign(an) != sg: continue
            vi = {v for f in Fc[i0:i1] for v in f}
            if 55 <= abs(an) < 78: ref += vi
            elif 78 <= abs(an) <= 110: tgt += vi
        if not ref or not tgt: continue
        ref = np.array(sorted(set(ref))); tgt = np.array(sorted(set(tgt)))
        xr = np.abs(V[ref, 0] - c[0]); br = zb(V[ref, 2]); xenv = np.full(41, np.inf)
        for b in range(41):
            sel = xr[br == b]
            if len(sel) > 3: xenv[b] = np.percentile(sel, 90)
        xenv = np.maximum.reduce([np.r_[xenv[1:], np.inf], xenv, np.r_[np.inf, xenv[:-1]]])   # 和上下一格取大的；沒有參考點的高度不收
        low = tgt[V[tgt, 2] < z_hang + 0.02]; lim = xenv[zb(V[low, 2])] + 0.002
        xt = np.abs(V[low, 0] - c[0]); over = xt > lim
        V[low[over], 0] = c[0] + sg * lim[over]
        print('  hair(p02): side %+d: %d of %d side vertices pulled in (max %.1f mm)' % (sg, int(over.sum()), len(low), 1000 * float((xt - lim)[over].max()) if over.any() else 0.0))
    if os.environ.get('HAIR_DEBUG'):                # 除錯：每一組最外面的點（離頭中心最遠；找頭頂翹起來的地方）
        for g, i0, i1 in GR:
            vi = np.array(sorted({v for f in Fc[i0:i1] for v in f}))
            if not len(vi): continue
            d = V[vi] - c; r = np.linalg.norm(d, axis=1); up = d[:, 2] > 0.03
            if not up.any(): continue
            k = vi[up][np.argsort(-r[up])[:4]]
            print('  hair(p02) dbg %-6s top r %s at %s' % (g, np.round(np.linalg.norm(V[k] - c, axis=1), 3).tolist(), [(round(math.degrees(math.atan2(V[j, 0] - c[0], -(V[j, 1] - c[1]))), 0), round(float(V[j, 2] - c[2]), 3)) for j in k]))
    AZR = os.environ.get('HAIR_AZ')                 # 除錯：只留方位角 |a| 在這個範圍的垂落髮片（例：HAIR_AZ=40,70）
    if SKIP or AZR:          # 除錯：拿掉某幾組的面（不影響其他組的亂數）
        keep = np.ones(len(Fc), bool)
        for g, i0, i1 in GR:
            if g in SKIP: keep[i0:i1] = False
        if AZR:
            lo, hi = [float(t) for t in AZR.split(',')]
            for g, a, i0, i1 in DBG.get('cards', []):
                if not (lo <= az(a) <= hi): keep[i0:i1] = False
        Fc = [f for f, k in zip(Fc, keep) if k]; print('  hair(p02): debug skip', sorted(SKIP), AZR, 'faces left', len(Fc))
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
    wh = np.clip((V[:, 2] - (neck_z - 0.08)) / 0.12, 0.0, 1.0); wh = wh * wh * (3 - 2 * wh)   # 第九版：脖子以上綁頭，往下（12 cm）漸漸換成上胸（同杜可昕；第八版只到肩膀，全部綁頭）
    C.bind(obj, arm, {HEAD: wh, 'J_Bip_C_UpperChest': 1.0 - wh})
    m['hair'] = obj
    print('  hair(p02): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
