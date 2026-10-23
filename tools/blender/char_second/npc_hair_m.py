"""路人（男）髮型產生器：從明軒的 mingxuan_hair.py（它是阿哲 zhe_hair → 祐廷 p00_hair 改的）參數化。
npc.py 在 apply 之前設定 P：seed、part（分線）、col（底色 sRGB）、tip（10 個方位的髮尾高度：前 3 個相對眉毛、中 4 個相對眼睛、後 3 個相對耳朵上緣，公尺）、
nape（後頸髮尾在髮際線下幾公尺）、vol（頭頂蓬度倍數）、curl（上層瀏海往兩邊撥的角度範圍）、name（名稱前綴）。
選用：side_taper（兩側越靠髮尾越貼頭）、nape_taper（後腦、後頸越靠髮尾越貼頭；接在 side_taper 後面，0＝不變）、
  nape_c（後頸正中間比 nape 再長多少公尺，預設 0.012）、shell_root（髮殼靠髮際線那一端的明暗，預設 0.75＝暗一點）、
  v_min（髮尾至少超出髮際線多少，v 的單位，預設 -0.02）、shell_v0（髮殼從哪裡開始，預設 0＝髮際線）。
  npc_nm3 10-22 改短髮時加的後五個，其他人不給＝和原本一樣。
日劇髮型（使用者 2026-10-17：「你可以參考日劇的男女主角的髮型嗎」）：
  bang：'card'（預設：一撮一撮的髮片）、'center' 中分（センターパート：簾狀的寬髮片從中間往兩邊撥，額頭中間露出一個三角形）、
        'heavy' 蘑菇頭（マッシュ：寬髮片排滿、圓圓地蓋到眉毛）；wave：微捲燙的振幅（公尺）"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_hair as HB
from h01_hair import _unit, sph, slerp, sstep, tangents, catmull

P = dict(seed=20261200, part=8.0, col=(0.15, 0.138, 0.135), tip=(-0.004, -0.002, -0.008, 0.006, 0.002, -0.004, -0.010, -0.024, -0.020, -0.016), nape=0.028, vol=1.0, curl=(4, 14), name='NM0')
SEED = 20261016
POLE = (180.0, 72.0)      # 髮旋（方位角、仰角，度）：頭頂稍偏後（第九版 58°：側面看最高點在後腦上方，像一個包）
PART = 8.0                # 瀏海分線（方位角）：略偏人物的左邊（參考圖正面看分線在畫面右邊一點）
# 髮際線（方位角 → 仰角）：男生的前額髮際線略高、鬢角短、耳朵上方的髮際線貼著耳朵、後頸收高
HAIRLINE = [(0, 33), (20, 33), (35, 30), (48, 21), (57, 9), (63, -1), (69, -5), (76, -1), (86, 8), (98, 7), (108, -6),
            (120, -26), (136, -44), (152, -52), (168, -56), (180, -57)]
# 顏色（sRGB）：參考圖 02 的深黑棕（頭頂受光處偏暖棕）
DEEP = np.array([0.075, 0.068, 0.066]); BASE = np.array([0.15, 0.138, 0.135]); LIGHT = np.array([0.245, 0.228, 0.222]); SHEEN = np.array([0.36, 0.34, 0.33])   # 明軒：近黑、偏暖一點（參考圖 #1c1a1a～#3b3634）；亮度照柏翰在遊戲裡調過的   # 阿哲：棕色（參考圖受光處 #6b5240）；第二版的高光 (0.58, 0.46, 0.37) 在遊戲的強光下把頭頂曬成一圈白色   # 第十一版：遊戲裡（MToon）頭髮整片接近黑色、看不出髮絲，整體調亮一級   # 參考圖 02 頭髮取樣：中位數 (0.21, 0.18, 0.18)、暗部 (0.13, 0.11, 0.11)、亮部 (0.29, 0.26, 0.24)
REG = {'card': (0, 384, 0, 1024), 'cardB': (384, 640, 0, 1024), 'bang': (640, 896, 0, 1024), 'shell': (896, 1024, 0, 1024)}
HEAD = 'J_Bip_C_Head'


def _apply_P():
    global SEED, PART, DEEP, BASE, LIGHT, SHEEN
    SEED = P['seed']; PART = P['part']; b = np.array(P['col'], float)
    BASE = b; DEEP = b * 0.5; LIGHT = np.minimum(b * 1.63, 1.0); SHEEN = np.minimum(b * 2.4, 1.0)


def make_atlas(seed=SEED, regs=None, temple_col=None):
    HB.DEEP, HB.BASE, HB.LIGHT, HB.SHEEN = DEEP, BASE, LIGHT, SHEEN
    REG_ = regs or REG
    rng = np.random.default_rng(seed); W = HB.W
    img = np.zeros((W, W, 4)); img[..., :3] = BASE
    def put(name, col, A):
        x0, x1, y0, y1 = REG_[name]; img[y0:y1, x0:x1, :3] = col; img[y0:y1, x0:x1, 3] = A
    def reg(name): x0, x1, y0, y1 = REG_[name]; return y1 - y0, x1 - x0
    if temple_col is not None:      # 兩鬢灰白（魏教授）：另一格髮片貼圖，顏色淺
        h, w = reg('cardG'); tc = np.array(temple_col, float)
        # 第六版（BB-C：灰黑夾雜）：髮根深色、往髮尾漸漸變灰白，而且一束一束深淺交錯（第五版整片灰：側面看像染了半邊）
        dark = HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.38), tip_light=0.05, base=BASE)
        gray = HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.38), tip_light=0.05, base=tc)
        t_ = ((np.arange(h) + 0.5) / h)[:, None]
        pep = np.repeat(rng.random(w // 3 + 1), 3)[:w][None, :]
        mix = (HB.sstep(0.25, 0.75, t_) * (0.35 + 0.65 * (pep > 0.30)))[..., None]
        put('cardG', dark * (1 - mix) + gray * mix, HB._clumps(rng, h, w, 5, 0.68, 0.84, 1.0, hw_k=(0.95, 1.3), lean=0.12, power=0.65, full=2.4, minw=3.5))
    # 層次髮片：上段一片（髮根），下段分成一撮一撮、長短不一、往中間微靠
    h, w = reg('card')
    put('card', HB._strand_color(rng, h, w, 0.78, sheen=(0.22, 0.38), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 5, 0.68, 0.84, 1.0, hw_k=(0.95, 1.3), lean=0.12, power=0.65, full=2.4, minw=3.5))   # 第二版：髮尾分束從 55% 改 68%（太多透明的尖端，太陽穴看起來像剃短）
    h, w = reg('cardB')
    put('cardB', HB._strand_color(rng, h, w, 0.78, sheen=(0.28, 0.44), tip_light=0.05, base=BASE), HB._clumps(rng, h, w, 4, 0.58, 0.80, 1.0, hw_k=(0.95, 1.3), lean=0.2, power=0.6, full=2.2, minw=3.5))
    h, w = reg('bang')
    put('bang', HB._strand_color(rng, h, w, 0.84, tip_light=0.04, base=BASE), HB._clumps(rng, h, w, 2, 0.50, 0.62, 1.0, hw_k=(1.2, 1.6), lean=0.12, power=0.9, full=3.5, minw=5.0))   # 瀏海一撮一撮寬一點（第一版像細線）；第七版每片 2 撮、長短差更多（遊戲裡一排同樣大小的尖角像鋸齒）
    h, w = reg('shell')
    put('shell', HB._strand_color(rng, h, w, float(P.get('shell_root', 0.75)), tip_light=0.0, base=BASE * 0.85), np.ones((h, w)))   # nm3 短髮（淺棕）：髮殼下緣的深色從髮尾的空隙露出來（耳朵上方一條、太陽穴一個三角）→ 1.0
    return img


def apply(m):
    _apply_P()
    arm = m['arm']; rng = np.random.default_rng(SEED)
    TCOL = P.get('temple_col')        # 兩鬢灰白：耳朵前後（方位 55～125°）的髮片用淺色的那一格
    REGX = dict(REG, card=(0, 256, 0, 1024), cardG=(256, 384, 0, 1024)) if TCOL is not None else REG
    rc = float(P.get('recede', 0.0))   # 前額髮際線往後（年紀；魏教授）：正中 rc 度、額角（30～45°）多 40%，耳朵以後不動
    HB.HAIRLINE = [(a_, e_ + rc * (1.0 + 0.4 * math.exp(-((a_ - 38) / 14.0) ** 2)) * max(0.0, 1 - a_ / 75.0)) for a_, e_ in HAIRLINE]; HB.REG_PX = dict(REGX)          # h01_hair 的 hairline_beta、reg_uv 讀這兩個模組變數
    H = HB.Head(m); c = H.c
    print('  hair(mingxuan): head center', np.round(c, 4), 'R top %.3f brow %.3f..%.3f' % (H.Rtop, H.brow_z, H.brow_top), 'avoid clothes', H.clothes)
    mb = HB.MB(); dP = sph(*POLE)

    def az(a): return abs(((a + 180) % 360) - 180)

    STP = float(P.get('side_taper', 0.0))   # 耳朵上面越靠髮尾越貼頭（韋綸第十二版的做法；魏教授第六版：男性短髮的兩側剪短）；0＝不變
    NTP = float(P.get('nape_taper', 0.0))   # 後腦到後頸（方位 115° 以後）也一樣越靠髮尾越貼頭（nm3 10-22：耳上短髮、後頸收薄；原本後面蓬著往下，從側後方看像鮑伯頭）

    def side_taper(a, v):
        if STP <= 0 and NTP <= 0: return 1.0
        aa = az(a); s_ = float(sstep(45, 70, aa)) * (1 - float(sstep(115, 140, aa))); b_ = float(sstep(115, 140, aa))
        return 1 - (STP * s_ + NTP * b_) * (1 - float(sstep(0.0, 0.45, v)))

    def vol(a, v):          # 髮殼／髮片離頭皮的距離：頭頂（靠髮旋）最蓬、前額蓬、兩側貼、後頸收
        aa = az(a); ca = math.cos(math.radians(aa))
        top = (0.015 + 0.026 * float(sstep(0.10, 0.55, v)) - 0.010 * float(sstep(0.75, 0.97, v))) * P['vol']   # 阿哲：比祐廷蓬（蓬亂的短髮）   # 頭頂前半最蓬、髮旋附近收回來（第六版在遊戲裡髮旋堆成一個圓頂）
        side = 1 - 0.55 * float(sstep(55, 95, aa)) * (1 - 0.4 * float(sstep(120, 160, aa)))   # 兩側貼一點（第三版 0.40：耳朵高度往外蓬，正面看像香菇頭）
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
    t = P['tip']; TIP_Z = [H.brow_z + t[0], H.brow_z + t[1], H.brow_z + t[2], eye_z + t[3], eye_z + t[4], eye_z + t[5], eye_z + t[6], ear_top + t[7], ear_top + t[8], ear_top + t[9]]   # 路人：照 P['tip']   # 明軒：瀏海到眉毛下緣、兩側蓋到耳朵上緣（阿哲在眉毛上方 1.2 cm）   # 阿哲：瀏海髮尾在眉毛上方 1.2 cm（參考圖看得到眉毛）
    def v_tip(a):           # 髮尾停在哪（v<0：超出髮際線）
        aa = az(a)
        if aa < 112:
            v = min(float(P.get('v_min', -0.02)) if aa > 36 else 1.0, v_at_z(a, float(np.interp(aa, TIP_A, TIP_Z))))
            # 耳朵後面（84–112°）：往下找的髮尾會量到耳朵外緣，髮尾跑到離頭很遠的地方，遊戲裡變成一條細線或一片黑色翅膀
            # （LAWWW2-C 2026-10-17：nm5、nm10、nm12、nm14、nm15、nm20）→ 最多超出髮際線 6%
            return max(v, -0.06) if aa > 84 else v
        # 後頸：髮際線往下 1.5～2.5 cm（第二版固定 v＝-0.06～-0.10：後面的方向幾乎朝正下方，髮尾跑到頸背 10～20 cm 下面，側面看是一條細線掛到毛衣上）
        z_hl = surf(a, 0.0)[0][2]
        return min(float(P.get('v_min', -0.02)), v_at_z(a, z_hl - P['nape'] - float(P.get('nape_c', 0.012)) * float(sstep(130, 170, aa)), lo=-0.15))   # 明軒：後頸長 1.5 cm（參考圖後面看髮尾蓋住脖子上段）   # 最多延伸 12%（正後方的方向再往下就是朝正下方，會穿進脖子）

    WAVE = float(P.get('wave', 0.0))   # 微捲燙的振幅（公尺；0＝直髮）
    if os.environ.get('HAIR_DEBUG'):
        for a in (0, 20, 36, 45, 50, 56, 62, 70, 76, 84, 92, 100, 108, 116, 130, 150, 165, 175, 180):
            vt = v_tip(a); p, d = surf(a, vt); p0, _ = surf(a, 0.0)
            print('   az %4d v_tip %+.3f tip %s (target z %.3f) hairline %s' % (a, vt, np.round(p, 3), float(np.interp(min(a, 112), TIP_A, TIP_Z)), np.round(p0, 3)))
    # ---- 1. 髮殼 ----
    Nu, Nv, PAN = 64, 12, 4
    A_ = np.linspace(-180, 180, Nu + 1); vs = np.linspace(float(P.get('shell_v0', 0.0)), 1.0, Nv + 1)   # nm3 短髮：髮殼下緣停在髮際線上方一點，讓髮片蓋住（髮尾短的時候，髮殼的邊在耳朵上方露成一條深色的線）   # 到 1.0（0.97 在頭頂留一個洞，髮旋那裡露出一個白點；阿勳、品妤修過）
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
            t = i / nseg; e = (off + bulge * math.sin(math.pi * min(1.0, t * 1.2))) * (0.15 + 0.85 * float(sstep(0.0, 0.35, t))) * side_taper(a + curl * t * t, max(v, 0.0))   # 髮根那一段貼近：三層髮片都從髮旋出發，髮根一起往外推會在髮旋堆成圓頂；第十二版再貼平（外層髮根排成一圈，遊戲裡頭微低時後腦上方像一道台階、一個包）
            p, d = surf(a + curl * t * t, v, e); q, _ = surf(a + curl * t * t + da, v, e)
            # 寬度＝旁邊 6.4° 那一條的距離；耳朵後面那一條量到耳朵外緣時距離跳到 10 cm 以上，髮片變成一大片往外的翅膀
            # （nm15、nm20：髮片的中線已經被下面兩道限制拉回來，寬度沒有）→ 最多 2.4 cm（正常的地方 1.1～1.5 cm）
            P.append(p); D.append(d); Wd.append(min(float(np.linalg.norm(q - p)), 0.024))
        P = np.array(P); D = np.array(D)
        P = H.push(P, np.linspace(0.003, 0.004 + off, len(P)))
        # 安全網：髮片的點離頭的中心不超過 H.Rtop＋4 cm（LAWWW2-C 2026-10-17：耳朵後面、後頸側邊的髮尾往外下方找高度時，
        # 量到耳朵、肩膀外緣，髮尾跑到 27 cm 外，遊戲裡變成一條細線或一片黑色翅膀：nm5、nm10、nm12、nm14、nm15、nm20）
        rmax = H.Rtop + 0.04; rr = np.linalg.norm(P - c, axis=1); kk = np.minimum(1.0, rmax / np.maximum(rr, 1e-6)); P = c + (P - c) * kk[:, None]
        # 第二道：離頭皮（這個方向的頭皮半徑）不超過 4 cm——耳朵後下方往外伸的髮尾在頭中心 15 cm 以內，第一道抓不到（nm15、nm20）
        dd = P - c; rr = np.linalg.norm(dd, axis=1); du = dd / np.maximum(rr, 1e-6)[:, None]
        lim = np.array([H.R(u) for u in du]) + 0.04; P = c + dd * np.minimum(1.0, lim / np.maximum(rr, 1e-6))[:, None]
        Tn = tangents(P); side = _unit(np.cross(D, Tn))
        if WAVE > 0:                    # 微捲燙（ゆるパーマ）：髮片後半段左右、上下起伏（日劇男主角常見；使用者 2026-10-17「參考日劇的男女主角的髮型」）
            tt = np.linspace(0, 1, len(P)); ph = a * 0.37; k_ = (WAVE * np.array(sstep(0.15, 0.5, tt)))[:, None]
            P = P + side * (np.sin(2 * math.pi * 1.3 * tt + ph) * k_[:, 0])[:, None] + D * (0.5 * (1 - np.cos(2 * math.pi * 1.3 * tt + ph)) * k_[:, 0])[:, None]
            Tn = tangents(P); side = _unit(np.cross(D, Tn))
        width = np.maximum(np.array(Wd) * wfac, 0.006) * (0.65 + 0.35 * sstep(0.0, 0.3, np.linspace(0, 1, len(P))))
        if TCOL is not None and reg in ('card', 'cardB') and 50 < az(a) < 150: reg = 'cardG'   # 第六版：耳朵後面到後頸下緣也是（灰的部分只在髮尾）
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
        card(a, 0.86 - rng.uniform(0, 0.18), v_tip(a) * rng.uniform(0.45, 1.08 if az(a) < 84 or az(a) > 125 else 1.0), (0.009 + 0.003 * rng.random()) * sk, rng.uniform(1.0, 1.4), 'cardB',
             bulge=(0.004 + 0.005 * rng.random()) * sk, arch=0.16, curl=rng.uniform(-14, 14))
    # （第一版在這裡加了 14 片往上翹的短髮束：遊戲裡變成頭頂一根根細的觸角，拿掉；亂的感覺靠外層的長短與方向）
    for sgn in (1.0, -1.0):    # 鬢角：太陽穴到耳朵前面，從髮際線上方往下梳（短、寬、不透明的部分多）
        for k in range(7):
            a = sgn * (44 + 40 * (k + rng.uniform(0.25, 0.75)) / 7)
            card(a, 0.30 + rng.uniform(0, 0.10), v_tip(a) - rng.uniform(0.0, 0.03), 0.003 + 0.001 * rng.random(), rng.uniform(1.8, 2.2), 'card',
                 nseg=10, bulge=0.002, arch=0.10, curl=-sgn * rng.uniform(2, 8))
    n_card = len(mb.F) - n_shell

    # ---- 3'. 日劇髮型的瀏海：寬的簾狀髮片（做法同女生的空氣瀏海 fringe_card：頭頂前面往前越過髮際線、沿額頭往下、往兩邊撥）----
    BANG = P.get('bang', 'card')
    def curtain(a0, vroot, wfac, z_end, drift, lift=0.010, early=0.15, reg='bang'):
        a_end = a0 + drift
        ctrl = np.array([[a0 * 0.5, vroot], [a0 + early * drift, 0.02], [a0 + 0.6 * drift, v_at_z(a0 + 0.6 * drift, (H.brow_top + 0.035 + z_end) / 2)], [a_end, v_at_z(a_end, z_end)]])
        AV = catmull(ctrl, 8); Pc = []; Dc = []; n = len(AV)
        for i, (aa_, vv_) in enumerate(AV):
            tt = i / (n - 1); e = 0.005 + lift * float(sstep(0.0, 0.25, tt)) * (1 - 0.6 * float(sstep(0.30, 1.0, tt)))   # 髮根蓬起來、髮尾貼額頭
            p_, d_ = surf(aa_, vv_, e); Pc.append(p_); Dc.append(d_)
        Pc = H.push(np.array(Pc), 0.0045); Dc = np.array(Dc)
        for _ in range(2): Pc[1:-1] = Pc[1:-1] * 0.5 + (Pc[:-2] + Pc[2:]) * 0.25
        Tn = tangents(Pc); Dc = _unit(Dc - Tn * np.sum(Dc * Tn, 1)[:, None]); side = _unit(np.cross(Dc, Tn))
        if WAVE > 0:
            tt = np.linspace(0, 1, len(Pc)); Pc = Pc + side * (WAVE * 0.8 * np.sin(2 * math.pi * 1.1 * tt + a0 * 0.3) * np.array(sstep(0.2, 0.6, tt)))[:, None]
        width = wfac * 0.011 * (0.6 + 0.4 * sstep(0.0, 0.3, np.linspace(0, 1, len(Pc))))
        mb.ribbon(Pc, side, Dc, width, reg, 'head', np.zeros(len(Pc)), arch=0.12, tt=np.linspace(0, 1, len(Pc)))
    if BANG == 'center':        # 中分：兩邊各 4 片，從分線一開始就往兩側撥（髮際線的高度已經到額角），額頭中間露出一個倒 V；髮尾在太陽穴、眉尾到眼尾的高度
        # 第一版：5 片從額頭中間往下才往外撥——額頭只有 4 cm 高（男生的髮際線 33°），中間的髮片蓋住額頭，正面看還是一排刺
        for sgn in (1.0, -1.0):
            for k, t in enumerate(np.linspace(0.0, 1.0, 4)):
                # 第二版：髮根從頭頂前面（v 0.30）開始（第一版 0.42：髮根都擠在分線上，頭頂中間堆成一根尖角）；最外面的不超過 45°（太陽穴外面的髮尾往外飄）
                a0 = PART + sgn * (3.0 + 10.0 * t)
                z_end = H.brow_top + 0.012 - (H.brow_top + 0.012 - (eye_z + 0.006)) * float(t) + rng.uniform(-0.003, 0.003)
                curtain(a0 + rng.uniform(-1.0, 1.0), 0.30 + rng.uniform(0, 0.04), rng.uniform(1.9, 2.1), z_end, sgn * (26.0 + 6.0 * t), lift=0.010, early=0.7, reg='card')
    elif BANG == 'heavy':       # 蘑菇頭：9 片寬髮片排滿，蓋到眉毛，兩側往下接鬢角
        for k, a0 in enumerate(np.linspace(-34.0, 34.0, 9)):
            s_ = abs(a0) / 34.0
            z_end = H.brow_z - 0.004 - 0.014 * float(sstep(0.5, 1.0, s_)) + rng.uniform(-0.002, 0.002)
            curtain(a0 + rng.uniform(-0.8, 0.8), 0.36 + rng.uniform(0, 0.04), rng.uniform(2.0, 2.2), z_end, math.copysign(1.0 + 4.0 * s_, a0) if abs(a0) > 1 else 0.5, lift=0.013)
    # ---- 3. 瀏海：分線兩邊各自往外撥，一撮一撮、長短不一 ----
    # 第二版：分兩層。底層寬、短一點（蓋住額頭，不透出皮膚）；上層一撮一撮、長短不一（有的到眼睛上緣）、離開額頭一點、從分線往兩邊撥
    # （第一版 14 片同樣長度的窄髮片：正面看像一排梳齒）
    for k in range(6 if BANG == 'card' else 0):         # 底層：窄、短一點（明軒 6 片：額頭蓋多一點，阿哲 5 片露出額頭）；日劇髮型的瀏海另外做（上面 3'）
        a = -40 + 80 * (k + rng.uniform(0.3, 0.7)) / 6
        card(a, 0.62 + rng.uniform(0, 0.08), v_tip(a) + rng.uniform(0.03, 0.06), 0.008 + 0.001 * rng.random(), rng.uniform(1.4, 1.7), 'bang',
             nseg=16, bulge=0.005, arch=0.08, curl=(1.0 if a > PART else -1.0) * rng.uniform(2, 5))
    for k in range(10 if BANG == 'card' else 0):        # 上層：一撮一撮、長短不一、往下垂多（明軒 curl 4–14°；阿哲 10–28° 往兩邊撥開）
        a = -38 + 76 * (k + rng.uniform(0.2, 0.8)) / 10
        sgn = 1.0 if a > PART else -1.0
        card(a, 0.50 + rng.uniform(0, 0.20), v_tip(a) + rng.uniform(-0.06, 0.02), 0.012 + 0.003 * rng.random(), rng.uniform(1.5, 2.0), 'bang',
             nseg=16, bulge=0.007 + 0.003 * rng.random(), arch=0.10, curl=sgn * rng.uniform(*P['curl']))
    n_bang = len(mb.F) - n_shell - n_card

    # ---- 4. 物件、材質、權重 ----
    V = np.array(mb.V); Fc = mb.F
    me = bpy.data.meshes.new('Hair_' + P['name']); me.from_pydata(V.tolist(), [], Fc); me.validate(clean_customdata=False); me.update()
    uv = me.uv_layers.new(name='UVMap'); li = np.zeros(len(me.loops), int); me.loops.foreach_get('vertex_index', li)
    uv.data.foreach_set('uv', np.array(mb.UV)[li].reshape(-1).astype(np.float32))
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.normals_split_custom_set_from_vertices([tuple(n) for n in np.array(mb.N)])
    obj = bpy.data.objects.new('Hair_' + P['name'], me)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    wip = os.path.join(C.ROOT, 'tools', 'vroid_wip', 'bl'); os.makedirs(wip, exist_ok=True)
    img = C.image_from_array(P['name'] + '_HairCard', make_atlas(P['seed'], REGX, TCOL), os.path.join(wip, P['name'].lower() + '_hair_atlas.png'))
    tmpl = next((mt.name for mt in bpy.data.materials if 'HAIR' in mt.name and getattr(mt, 'vrm_addon_extension', None)), None)
    mat = C.mtoon_from(tmpl, P['name'] + '_HairCard_HAIR', base_img=img, alpha='MASK', cutoff=0.5, double_sided=False, outline=0.0)
    mt = mat.vrm_addon_extension.mtoon1.extensions.vrmc_materials_mtoon
    mt.shade_color_factor = (0.80, 0.74, 0.72)        # 第十一版：陰影面不要那麼暗（0.72／0.66）
    e1 = mat.vrm_addon_extension.mtoon1
    e1.emissive_texture.index.source = None; e1.normal_texture.index.source = None
    me.materials.append(mat)
    C.bind(obj, arm, {HEAD: np.ones(len(V))})
    m['hair'] = obj
    print('  hair(mingxuan): template material %s; tris shell %d cards %d bangs %d total %d; verts %d' % (tmpl, 2 * n_shell, 2 * n_card, 2 * n_bang, 2 * len(Fc), len(V)))
    return obj
