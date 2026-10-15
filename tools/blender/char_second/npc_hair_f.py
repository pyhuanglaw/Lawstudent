"""路人（女）髮型產生器：從杜可昕的 kexin_hair.py（直長髮＋空氣瀏海，LAWWW 的 p03_hair 改的）參數化。
npc.py 在 apply 之前設定 P：seed、part（分線）、col（底色 sRGB；深、亮、高光照比例算）、tip（10 個方位的髮尾高度，相對脖子，公尺）、
n_main／n_outer（主層、外層髮片數：路人少一點，檔案小）、name（物件／材質／貼圖名稱的前綴）。其餘做法和可昕的一樣。"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents, catmull, resample

P = dict(seed=20261100, part=0.0, col=(0.155, 0.115, 0.095), tip=(-0.240, -0.250, -0.170, -0.040, -0.120, -0.230, -0.280, -0.300, -0.310, -0.320), n_main=48, n_outer=32, name='NF0')
SEED = 20261014
POLE = (180.0, 70.0)      # 髮旋：頭頂稍偏後
PART = 0.0                # 分線：中分（第一版 −4：頭頂中間、瀏海分開的地方露出一道三角形的縫）
# 顏色（sRGB）：參考圖 06 的黑髮（受光處偏深棕）；比純黑亮一級：遊戲（MToon）裡太黑會看不出髮絲（祐廷第十一版的經驗）
DEEP = np.array([0.075, 0.052, 0.044]); BASE = np.array([0.155, 0.115, 0.095]); LIGHT = np.array([0.27, 0.20, 0.165]); SHEEN = np.array([0.34, 0.255, 0.21])   # 深棕黑髮、受光處暖棕（參考圖；第九版：第八版之前偏純黑，和參考圖並排又硬又重）
REG = {'card': (0, 288, 0, 1024), 'cardB': (288, 512, 0, 1024), 'bang': (512, 704, 0, 1024), 'lock': (704, 960, 0, 1024), 'shell': (960, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'
DBG = {}                  # 除錯輸出用（HAIR_DEBUG）：目前在做哪一層


def _apply_P():
    global SEED, PART, DEEP, BASE, LIGHT, SHEEN
    SEED = P['seed']; PART = P['part']; b = np.array(P['col'], float)
    BASE = b; DEEP = b * 0.48; LIGHT = np.minimum(b * 1.75, 1.0); SHEEN = np.minimum(b * 2.2, 1.0)


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
    h, w = reg('bang')       # 空氣瀏海（同沈以安的做法）：上段一半合成一片，下段分成 5 束細髮束、長短不一、慢慢收尖，束和束之間露出額頭
    put('bang', HB._strand_color(rng, h, w, 0.82, sheen=(0.18, 0.30), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 6, 0.40, 0.80, 1.0, hw_k=(0.62, 0.88), lean=0.08, power=0.6, full=3.0, minw=2.2))   # 可昕：空氣瀏海（第四版：6 束細髮束、束和束之間 1/4 的空隙、末端才收尖；第三版 4 束像冰柱、第二版像梳子、第一版像厚重的公主切）   # 第五版：髮尾鈍一點、長短差小一點（參考圖是剪齊的空氣瀏海，第三版尖尖的像梳子）
    h, w = reg('lock')       # 垂落的髮束：長、髮尾 18% 分束、彼此重疊（遠看不會變成點狀）
    put('lock', HB._strand_color(rng, h, w, 0.72, sheen=(0.10, 0.22), tip_light=0.08, base=BASE), HB._clumps(rng, h, w, 5, 0.84, 0.94, 1.0, edge_taper=0.03, hw_k=(1.2, 1.55), lean=0.06, power=0.7, full=3.5, minw=4.0))   # 可昕第八版：髮尾鈍一點（參考圖是整齊的長直髮，背面看是平剪）
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, 0.75, tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))
    return img


def apply(m):
    _apply_P()
    arm = m['arm']; rng = np.random.default_rng(SEED); DBG.clear()
    HB.REG_PX = dict(REG)          # 髮際線用 h01_hair 的預設（女性：圓的髮際線、鬢角低）
    H = HB.Head(m); c = H.c
    neck_z = C.landmarks(arm)['neck']
    print('  hair(kexin): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f neck %.3f' % (H.Rtop, H.brow_z, H.brow_top, neck_z), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)
    SKIP = set(filter(None, os.environ.get('HAIR_SKIP', '').split(',')))     # 除錯：只看某幾組（shell、inner、main、outer、bang）

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
    TIP_A = [36, 50, 62, 72, 82, 95, 108, 120, 135, 180]
    TIP_Z = [neck_z + d for d in P['tip']]   # 路人：照 P['tip']（可昕：-0.240, -0.250, -0.170, -0.040, -0.120, -0.230, -0.280, -0.300, -0.310, -0.320）   # 第四版：正側面（82–108°）從肩膀後面繞過去、變長（第三版停在肩膀上：寬肩外套的肩膀把髮尾頂歪，耳朵旁邊一片鋸齒）   # 可昕：前面兩側垂到胸口下緣、正側面停在肩膀上（T 字姿勢）、後面一整片到背中段（第二版：第一版中間長兩邊短，背面看是 V 字）
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
        bul = 0.004 * float(sstep(45, 70, az(a)) * (1 - sstep(125, 150, az(a))))     # 可昕：4 mm（語彤 1.3 cm：她的耳朵比較凸。可昕的側面髮片在耳朵高度往外鼓 1.3 cm，正面看突出外圈、側著露出髮絲貼圖的光澤帶，一圈米灰色）
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
            F = float(np.interp(az(a), [36, 55, 70, 110, 135, 180], [0.004, 0.005, 0.004, 0.004, 0.005, 0.006]))   # 直髮：髮尾幾乎不外張
            fv = F + 0.35 * (flip - 0.013) - 0.004 * tight - 0.005 * edge
            p0 = P[-1]; rad = _unit(np.array([p0[0] - c[0], p0[1] - c[1], 0.0]))
            tan = _unit(np.cross([0, 0, 1.0], rad))
            zt = z_tip(a) + tip_dz; n2 = 12; L2 = max(p0[2] - zt, 0.02)
            low = []
            for k in range(1, n2 + 1):
                t = k / n2
                q = p0 + rad * (fv * float(sstep(0.15, 1.0, t)) ** 1.3) + tan * wave * math.sin(math.pi * 1.6 * t + wph) * float(sstep(0.25, 0.6, t))
                q[2] = p0[2] - L2 * t + 0.25 * fv * float(sstep(0.80, 1.0, t))   # 髮尾外翻時微微往上
                q[0] += math.copysign(1.0, p0[0] - c[0]) * float(np.interp(az(a), [100, 115, 140, 165, 180], [0.0, 0.030, 0.034, 0.018, 0.0])) * float(sstep(0.05, 0.7, t))   # 可昕：背後往兩邊散開（蓋住肩胛骨；第二版之前只有頭的寬度）
                q[1] += float(np.interp(az(a), [72, 82, 100, 112, 125], [0.0, 0.050, 0.060, 0.040, 0.0])) * float(sstep(0.0, 0.55, t))   # 第四版：正側面的頭髮往後、從肩膀後面垂下
                low.append(q)
            low = np.array(low)
            if az(a) < 64:      # 可昕：前面的長髮從下巴以下沿著胸前垂下——貼在衣服前面（第二版：T 字姿勢的寬肩外套把髮尾推到肩膀外側 x≈0.16，遊戲裡會浮在手臂旁）
                for j in range(len(low)):
                    q = low[j]
                    if q[2] < neck_z + 0.03:
                        xl = math.copysign(min(abs(q[0] - c[0]), abs(p0[0] - c[0]) + 0.006), q[0] - c[0]) + c[0]
                        low[j] = np.array([xl, min(q[1], H.front_y(xl, q[2]) - 0.008), q[2]])
            P = np.vstack([P, low]); D = np.vstack([D, np.tile(rad, (len(low), 1))])
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
            for _ in range(2):
                P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.008)])
            # 被肩膀（T 字姿勢）推出去的也收回來：最多比設計的外張多 4 mm（可昕：只有兩側 64–100°；前面貼胸口、背後往兩邊散開的不收）
            if 64 <= az(a) < 78:
                r0 = float(np.hypot(p0[0] - c[0], p0[1] - c[1])); rmax = r0 + fv + 0.004
                hz = np.hypot(P[nseg + 1:, 0] - c[0], P[nseg + 1:, 1] - c[1]); k = np.minimum(1.0, rmax / np.maximum(hz, 1e-6))
                P[nseg + 1:, 0] = c[0] + (P[nseg + 1:, 0] - c[0]) * k; P[nseg + 1:, 1] = c[1] + (P[nseg + 1:, 1] - c[1]) * k
            P = H.push(P, np.r_[np.full(nseg + 1, 0.003), np.full(len(low), 0.006)])     # 陳語彤的頭髮垂到鎖骨、肩胛骨：收回來之後再推出衣服一次（不穿進 T 恤）
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
    NM = P['n_main']
    for k in range(NM):        # 主層（可昕 56 片；路人 P['n_main']）
        a = -180 + 360 * (k + rng.uniform(0.25, 0.75)) / NM
        if az(a) < 36: continue
        hang_card(a, 0.90 - rng.uniform(0, 0.06), 0.0040 + 0.001 * rng.random(), rng.uniform(1.5, 1.8), 'lock',
                  curl=rng.uniform(-1.5, 1.5), wave=0.0015 * rng.random(), wph=rng.uniform(0, 6.28), flip=0.008 + 0.006 * rng.random(), tip_dz=rng.uniform(-0.008, 0.006))   # 直髮：幾乎沒有波浪
    GR.append(('main', f0, len(mb.F))); f0 = len(mb.F)
    DBG['layer'] = 'outer'
    NO = P['n_outer']
    for k in range(NO):        # 外層（可昕 40 片；路人 P['n_outer']）
        a = -180 + 360 * (k + rng.uniform(0.1, 0.9)) / NO
        if az(a) < 38: continue
        vr = 0.86 - rng.uniform(0, 0.12); of = 0.0070 + 0.002 * rng.random(); wf = rng.uniform(1.2, 1.5); rg = 'cardB' if rng.random() < 0.4 else 'lock'
        cu = rng.uniform(-6, 6); wv = 0.008 + 0.005 * rng.random(); ph = rng.uniform(0, 6.28); fl = 0.010 + 0.008 * rng.random(); td = rng.uniform(-0.025, 0.020)
        # 第八版：兩側（55–130°）的外層收進主層裡面（正面看，正側面的髮片是側著的，比主層突出就是一條往外飄的細線）
        sk = float(sstep(55, 70, az(a)) * (1 - sstep(115, 130, az(a))))
        hang_card(a, vr, of - 0.0040 * sk, wf, rg, curl=0.3 * cu * (1 - 0.7 * sk), wave=0.15 * wv, wph=ph, flip=fl, tip_dz=0.6 * td, tight=sk)
    GR.append(('outer', f0, len(mb.F)))
    n_card = len(mb.F) - n_shell

    # ---- 3. 空氣瀏海（同沈以安 h01_hair 的做法）：少數幾片寬的瀏海片（2.4–2.8 cm），貼圖下段分成 5 束細髮束；
    #      從頭頂前面往前越過髮際線（離額頭約 1.2 cm 的空氣感）、沿額頭往下，髮尾到眉毛，兩側長一點。
    #      第一版是 15 條窄髮束，近看是一排尖刺。
    def fringe_card(a0, vroot, wfac, z_end, drift):
        a_end = a0 + drift
        ctrl = np.array([[a0 * 0.6, vroot], [a0 + 0.2 * drift, 0.02], [a0 + 0.6 * drift, v_at_z(a0 + 0.6 * drift, (H.brow_top + 0.030 + z_end) / 2)], [a_end, v_at_z(a_end, z_end)]])
        AV = catmull(ctrl, 8); P = []; D = []; n = len(AV)
        for i, (a, v) in enumerate(AV):
            tt = i / (n - 1); e = 0.0045 + 0.0080 * float(sstep(0.0, 0.25, tt)) * (1 - 0.55 * float(sstep(0.30, 1.0, tt)))
            p, d = surf(a, v, e); P.append(p); D.append(d)
        P = H.push(np.array(P), 0.0040); D = np.array(D)
        for _ in range(2): P[1:-1] = P[1:-1] * 0.5 + (P[:-2] + P[2:]) * 0.25
        Tn = tangents(P); D = _unit(D - Tn * np.sum(D * Tn, 1)[:, None]); side = _unit(np.cross(D, Tn))
        width = wfac * 0.011 * (0.55 + 0.45 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        if os.environ.get('HAIR_DEBUG'): print('   fringe a0=%.1f drift=%.1f tip %s w %.3f' % (a0, drift, np.round(P[-1], 3).tolist(), wfac * 0.011))
        mb.ribbon(P, side, D, width, 'bang', 'head', np.zeros(len(P)), arch=0.10, tt=np.linspace(0, 1, len(P)))
    for k, a0 in enumerate((-30.0, -21.5, -13.0, -4.5, 4.5, 13.0, 21.5, 30.0)):     # 可昕：8 片（第六版：6 片在遊戲裡太稀，像幾根黑線）
        s_ = abs(a0) / 30.0
        z_end = H.brow_z - 0.004 - 0.010 * float(sstep(0.45, 1.0, s_)) + rng.uniform(-0.003, 0.003)     # 可昕：長到眉毛下面一點（第一版到眼睛上緣：太長）
        fringe_card(a0 + rng.uniform(-1.0, 1.0), 0.36 + rng.uniform(0, 0.06), rng.uniform(1.45, 1.65), z_end, math.copysign(1.5 + 7.0 * s_, a0))   # 細一點：更輕薄
    for sgn in (1.0, -1.0):             # 兩側的長瀏海（太陽穴前面，長到顴骨），接到臉旁的頭髮
        fringe_card(sgn * 38.0, 0.40, 2.0, eye_z - 0.022, sgn * 8.0)
    n_bang = len(mb.F) - n_shell - n_card
    GR.append(('bang', n_shell + n_card, len(mb.F)))

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    # 第八版：耳朵高度以下，正側面（78–110°）的髮片不能比「正面看得到髮面」的那一圈（55–78°）更外面。
    # 正側面的髮片在正面看是側著的一條線；比髮面那一圈突出時，中間露出背景，就是往外飄的細線（第六、七版的問題）
    zb = lambda z: np.clip(np.floor((z - (neck_z - 0.13)) / 0.008).astype(int), 0, 40)
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
        V[low[over], 0] = c[0] + sg * np.maximum(lim[over], xt[over] - 0.025)     # 可昕：最多收 2.5 cm（第五版：正側面的頭髮改從肩膀後面繞，不再被肩膀頂歪，可以收回來；收 6 mm 時正面看耳朵旁邊還是突出一條亮邊）
        print('  hair(kexin): side %+d: %d of %d side vertices pulled in (max %.1f mm)' % (sg, int(over.sum()), len(low), 1000 * float((xt - lim)[over].max()) if over.any() else 0.0))
    AZR = os.environ.get('HAIR_AZ')                 # 除錯：只留方位角 |a| 在這個範圍的垂落髮片（例：HAIR_AZ=40,70）
    if SKIP or AZR:          # 除錯：拿掉某幾組的面（不影響其他組的亂數）
        keep = np.ones(len(Fc), bool)
        for g, i0, i1 in GR:
            if g in SKIP: keep[i0:i1] = False
        if AZR:
            lo, hi = [float(t) for t in AZR.split(',')]
            for g, a, i0, i1 in DBG.get('cards', []):
                if not (lo <= az(a) <= hi): keep[i0:i1] = False
        Fc = [f for f, k in zip(Fc, keep) if k]; print('  hair(kexin): debug skip', sorted(SKIP), AZR, 'faces left', len(Fc))
    me = bpy.data.meshes.new('Hair_' + P['name']); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_' + P['name'], me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array(P['name'] + '_HairCard', make_atlas(P['seed']), os.path.join(wip, P['name'].lower() + '_hair_atlas.png'))
    tmpl = next((mt.name for mt in bpy.data.materials if 'HAIR' in mt.name and getattr(mt, 'vrm_addon_extension', None) and not mt.name.startswith('K01_')), None)
    mat = C.mtoon_from(tmpl, P['name'] + '_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=True, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.80, 0.74, 0.72)
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    wh = np.clip((V[:, 2] - (neck_z - 0.12)) / 0.15, 0.0, 1.0); wh = wh * wh * (3 - 2 * wh)   # 可昕：脖子以上綁頭，往下（12 cm）漸漸換成上胸
    C.bind(obj, arm, {HEAD: wh, 'J_Bip_C_UpperChest': 1.0 - wh})
    m['hair'] = obj
    print('  hair(kexin): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
