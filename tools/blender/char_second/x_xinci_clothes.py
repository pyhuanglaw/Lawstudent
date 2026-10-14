"""吳芯慈（classmate_xinci）的衣服（參考圖 classmate_xinci.webp）：
  開襟衫：薰衣草紫細針織、圓領、敞開穿（參考圖：前面露出整片白 T，約 15 cm 寬）、長袖、下擺在胯骨（蓋住裙頭的兩側和後面）——
          沿用沈以安的 h01_clothes.build_top（圓領、合身度、落肩、袖子、權重都是它的），身片的環在正前方 ±OPEN_PHI 以內不做（敞開），
          前襟的邊往內折 1.8 cm（貼邊：側面看得到布的厚度），左前襟（人物左邊）一排六顆白扣子。
  白 T：圓領、紮進裙子；一整圈（第二版只做 V 領口裡的一片，量身體時打到 T 字姿勢的肩膀，領口兩邊翹成白色尖角）；
          胸部以下的前面照胸前的輪廓微微垂下、往裙頭收緊。
  中長裙：深藍、A 字、裙頭在自然腰線、裙擺在膝蓋（參考圖：膝蓋上緣剛好露出來）——h01_clothes 沒有裙子，這裡自己做：
          每個高度沿 48 個方向量身體（臀部、兩條大腿）的外輪廓，取凸包（布料跨過兩腿之間）＋寬鬆量，胯部以下照 A 字斜線放寬；
          權重：裙頭、臀部用身體最近點；往下漸漸換成原本連身裙裙擺的權重（Darkness Shibu 的裙擺骨頭，前、後、側各 3 節＋彈簧骨），
          裙擺再混一點同一側大腿的權重（走路時膝蓋往前，裙擺跟著動一點，不會被膝蓋頂穿）。
  鞋：深棕樂福鞋（h01_clothes.build_shoes，沒有金屬扣）。
沈以安的 h01_clothes 是照她的身體寫的絕對高度；芯慈的基底（Darkness Shibu）和沈以安（HairSample_Female）是同一副骨架、同一個身體，
p00_clothes 的 BodyMap 幾乎是 1:1（照樣套用，頭縮小的差異在地標裡）。"""
import math, os
import numpy as np
import bpy
from mathutils import Vector
import common as C
import h01_clothes as K

LAV = np.array([184, 160, 202]) / 255.0          # 參考圖的薰衣草紫（角色資料 #b8a0c8）
NAVY = np.array([38, 44, 66]) / 255.0            # 深藍裙
WHITE = np.array([242, 240, 236]) / 255.0
STYLE = dict(KNIT_RGB=LAV, TROUSER_RGB=NAVY, LEATHER_RGB=np.array([62, 40, 30]) / 255.0, SOLE_RGB=np.array([34, 26, 22]) / 255.0,
             GOLD_RGB=np.array([62, 40, 30]) / 255.0,       # 樂福鞋沒有金屬扣（馬銜扣塗成鞋面的顏色）
             SHOE_STYLE='loafer', NECK_STYLE='crew', HEM_OVER_PANTS=True, SLIM=True, TOP_TEX='jersey',
             SLEEVE_LEN=1.0, SLEEVE_K=0.66, CUFF_EASE=0.008, EASE_K=0.62, DROP_X=0.105, TOP_FIT=0.6, HEM_LOOSE=False)
# 高度寫在芯慈身上（Darkness Shibu 樣本的單位：身高 1.632，遊戲裡 160 cm）
STYLE_M = dict(PANTS_TOP=1.050, PANTS_BAND=1.022, KNIT_HEM=0.945, KNIT_HEM_TOP=0.975, BACK_NECK_Z=1.388,
               CREW_FRONT_Z=1.322,     # 開襟衫圓領的前中心（只有敞開兩旁的領口用得到：前襟最上面在鎖骨附近）
               TEE_CREW_Z=1.345)       # 白 T 圓領的前中心（比開襟衫的領口高，參考圖看得到 T 恤的圓領；第五版從 1.358 降一點）
OPEN_PHI = 31.0      # 開襟衫敞開：身片 64 個方向的環，離正前方 31° 以內的格子不做（每格 5.625°）
SIDE_NECK_M = (0.071, 1.402)
SKIRT = dict(z_top=1.050, z_band=1.022, z_hip=0.885, z_hem=0.470, hem_rx=0.255, hem_ry=0.215, n_dir=48)


# ---------------------------------------------------------------- 裙子
def build_skirt(skin, arm, mb, S):
    hips_c = C.bone_head(arm, 'J_Bip_C_Hips')
    bv = skin.bvh(['J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_L_UpperLeg', 'J_Bip_R_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_LowerLeg'], thr=0.3)
    Kd = S['n_dir']; th = np.arange(Kd) * 2 * math.pi / Kd - math.pi / 2         # 0＝正前方（-y），往 +x（人物左邊）轉
    dirs = np.stack([np.cos(th), np.sin(th), np.zeros(Kd)], -1)
    zt, zb, zh, zm = S['z_top'], S['z_band'], S['z_hip'], S['z_hem']
    zs = list(np.linspace(zt, zb, 4)) + list(np.linspace(zb - 0.012, zh, 6)) + list(np.linspace(zh - 0.04, zm, 12))
    cy = hips_c[1]; prev = None; rows = []; cens = []
    hip_r = None
    for z in zs:
        o = np.array([0.0, cy, z])
        rb = np.array([K.Skin.outer(skin.full if z > 0.98 else bv, o, dirs[k], 0.45) for k in range(Kd)])
        if prev is not None: rb = np.where(np.isfinite(rb), rb, prev)
        rb = np.where(np.isfinite(rb), rb, 0.12); prev = rb
        pts = dirs[:, :2] * (rb + 0.009)[:, None]
        H = K.hull2(pts); r = np.array([K.ray_poly(H, dirs[k][:2]) for k in range(Kd)])     # 凸包：布料跨過兩腿之間
        if z <= zh + 1e-6:
            if hip_r is None: hip_r = r.copy()
            t = (zh - z) / (zh - zm)                                                          # 0＝臀圍線、1＝裙擺
            ell = 1.0 / np.sqrt((np.cos(th) / S['hem_rx']) ** 2 + (np.sin(th) / S['hem_ry']) ** 2)
            aline = hip_r + (ell - hip_r) * t ** 1.15                                         # A 字：從臀圍往下放寬到裙擺的橢圓
            r = np.maximum(r + 0.012, aline)
        else:
            r = r + 0.003                                                                     # 裙頭、臀部：貼身（凸包已經離身體 9 mm）
        rows.append(o + dirs * r[:, None]); cens.append(o)
    rows = np.array(rows)
    # 裙頭上緣往內折（厚度）、裙擺往內折 3 cm（貼邊）
    top_in = rows[0].copy(); top_in[:, :2] = cens[0][:2] + (top_in[:, :2] - cens[0][:2]) * 0.96; top_in[:, 2] -= 0.004
    hem_in = rows[-1].copy(); hem_in[:, :2] = cens[-1][:2] + (hem_in[:, :2] - cens[-1][:2]) * 0.985; hem_in[:, 2] += 0.03
    rows = np.concatenate([top_in[None], rows, hem_in[None]]); cens = [cens[0]] + cens + [cens[-1] + np.array([0, 0, 0.03])]
    I = np.stack([mb.add(rw, 'skirt') for rw in rows])
    U = np.arange(Kd + 1) / Kd
    Vv = np.clip((rows[:, :, 2].mean(1) - zm) / (zt - zm), 0, 1) * 0.70; Vv[0] = 0.72; Vv[-1] = 0.02   # v 0.75 以上留給布料貼圖的邊（不用）
    UV = np.zeros((len(rows), Kd + 1, 2)); UV[:, :, 0] = U[None, :] * 3.0; UV[:, :, 1] = Vv[:, None]
    mb.grid(I, UV, closed=True, mat=1, centers=np.array(cens))
    print('  skirt: rows %d dirs %d, waist z %.3f, hem z %.3f, hem radius x %.3f y %.3f' % (len(rows), Kd, zt, zm, np.abs(rows[-2][:, 0]).max(), np.abs(rows[-2][:, 1] - cy).max()))
    legs = {'L': dict(rows=rows[1:-1]), 'R': dict(rows=rows[1:-1])}       # build_top 的 pants_r（開襟衫下擺套在裙頭外面）用
    return dict(legs=legs, z_crotch=zh - 0.03, K=Kd, rows=rows, I=I)


def skirt_weights(skin, mb, wsrc, arm):
    """芯慈第九版：裙子只綁腰臀＋大腿，不用 VRoid 連身裙的裙擺骨頭（彈簧骨）——
    第八版在遊戲裡坐下（大腿往前 83°）時，裙擺骨頭被腿的碰撞體往外擠，整條裙子炸成一個圓盤。
    裙頭、臀部（髖關節以上）：身體最近點；髖關節以下：同一側的大腿（胯部 70%、裙擺 90%）＋其餘給臀部；
    兩腿之間左右平滑混合。坐下時裙子順著大腿蓋在腿上；走路時跟著大腿前後擺（兩腿之間的布會被拉開一點）。wsrc 不再使用"""
    V = np.array(mb.V); tags = np.array(mb.tag); m = tags == 'skirt'; Q = V[m]; n = len(Q)
    near = skin.nearest_weights(Q)
    bust = [skin.col(b) for b in K.BUST if skin.col(b) is not None]; near[:, bust] = 0
    zj = 0.5 * (C.bone_head(arm, 'J_Bip_L_UpperLeg')[2] + C.bone_head(arm, 'J_Bip_R_UpperLeg')[2])   # 髖關節高度
    zm = float(Q[:, 2].min())
    a = K.sstep(zj + 0.04, zj - 0.10, Q[:, 2])[:, None]                # 0＝髖關節以上、1＝胯部以下
    # 跟大腿的比例看位置：前面 0.9（坐下時蓋在腿上）、兩側 0.5（斜斜垂下）、後面 0.15（留在臀部下面）；胯部再少一點
    # （第九版整圈 0.7–0.9：A 字裙擺整圈跟著大腿往前轉 83°，坐下時前面立起一個大圓盤）
    cy = C.bone_head(arm, 'J_Bip_C_Hips')[1]
    dxy = np.stack([Q[:, 0], Q[:, 1] - cy], -1); front = -dxy[:, 1] / np.maximum(np.linalg.norm(dxy, axis=1), 1e-6)   # 1＝正前方（-y）、-1＝正後方
    k = np.where(front >= 0, 0.5 + 0.4 * front, 0.5 + 0.35 * front) * (0.8 + 0.2 * K.sstep(zj - 0.10, zm, Q[:, 2]))
    sideL = K.sstep(-0.035, 0.035, Q[:, 0])                            # +x＝人物左邊
    Wleg = K.axis_weights(skin, n, [('J_Bip_L_UpperLeg', sideL * k), ('J_Bip_R_UpperLeg', (1 - sideL) * k), ('J_Bip_C_Hips', 1 - k)])
    W = (1 - a) * near + a * Wleg
    W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
    print('  skirt weights: hips/thighs only (no skirt spring bones); hip joint z %.3f, hem z %.3f; thigh share front %.2f side %.2f back %.2f' % (zj, zm, k[front > 0.95].mean() if (front > 0.95).any() else -1, k[np.abs(front) < 0.1].mean() if (np.abs(front) < 0.1).any() else -1, k[front < -0.95].mean() if (front < -0.95).any() else -1))
    return m, W


def build_cardigan_open(skin, arm, mb, skirt):
    """h01_clothes.build_top（圓領）＋前面敞開：身片的環（64 個方向，k=0 正前方）離正前方 OPEN_PHI 以內的格子不做；
    兩條前襟的邊往內折 1.8 cm、往身體 4 mm（貼邊）。回傳 build_top 的結果＋前襟（每一列的邊緣點、往身片的方向、往外的法線）"""
    orig = mb.grid; st = {}
    def ang(k, Kc): return abs((k * 360.0 / Kc + 180.0) % 360.0 - 180.0)
    def grid(I, UV, closed=True, mat=0, centers=None, skip=None, outward=1):
        if 'I' not in st and closed and mat == 0 and I.shape[1] == 64:      # build_top 的第一個網格＝身片
            Kc = I.shape[1]; st['I'] = I
            return orig(I, UV, closed, mat, centers, lambda r, k: ang(k, Kc) < OPEN_PHI or ang((k + 1) % Kc, Kc) < OPEN_PHI, outward)
        return orig(I, UV, closed, mat, centers, skip, outward)
    mb.grid = grid
    try: top = K.build_top(skin, arm, mb, skirt)
    finally: mb.grid = orig
    I = st['I']; R, Kc = I.shape; V = np.array(mb.V)
    kL = next(k for k in range(1, Kc) if ang(k, Kc) >= OPEN_PHI); kR = Kc - kL      # +x＝人物左邊
    cen = V[I].mean(1)
    edges = {}
    for nm, ke, kn in (('L', kL, kL + 1), ('R', kR, kR - 1)):
        P = V[I[:, ke]]; t = V[I[:, kn]] - P; t /= np.linalg.norm(t, axis=1, keepdims=True) + 1e-9
        n_in = cen - P; n_in[:, 2] = 0; n_in /= np.linalg.norm(n_in, axis=1, keepdims=True) + 1e-9
        If = mb.add(P + t * 0.018 + n_in * 0.004, 'torso')
        UVf = np.zeros((R, 2, 2)); UVf[:, 1, 0] = 0.025; UVf[:, :, 1] = np.linspace(0.02, 0.70, R)[:, None]
        mb.grid(np.stack([I[:, ke], If], 1), UVf, closed=False, mat=0, centers=cen)
        edges[nm] = dict(P=P, t=t, n=-n_in)
    body = edges['L']['P'][1:-1]
    print('  cardigan: open front ±%.0f° (edge columns %d/%d); left edge x %.3f (neck z %.3f) … %.3f (hem)' % (
        OPEN_PHI, kL, kR, body[-1, 0], body[:, 2].max(), body[0, 0]))
    top['edges'] = edges
    return top


def edge_buttons(mb, e, z_lo, z_hi, n=6):
    """前襟上的扣子：直徑 1.2 cm、離邊 1.1 cm、在布面外 1.5 mm；白色（參考圖）"""
    P, t, nrm = e['P'], e['t'], e['n']; rows = np.arange(1, len(P) - 1)        # 頭尾兩列是往內折的邊
    zr = P[rows, 2]; o = np.argsort(zr)
    def at(z, A): return np.array([np.interp(z, zr[o], A[rows][o][:, j]) for j in range(3)])
    nb = 10; an = np.arange(nb) * 2 * math.pi / nb
    for z in np.linspace(z_lo, z_hi, n):
        p = at(z, P); tt = at(z, t); no = at(z, nrm)
        tt /= np.linalg.norm(tt); no = no - tt * (no @ tt); no /= np.linalg.norm(no)
        c = p + tt * 0.011 + no * 0.0015; e2 = np.cross(no, tt)
        ring = lambda off: c + no * off + (np.outer(np.cos(an), tt) + np.outer(np.sin(an), e2)) * 0.006
        ib = mb.add(np.concatenate([ring(-0.0016), ring(0.0012)]), 'button'); ic = mb.add([c + no * 0.0016], 'button')[0]
        UVb = np.zeros((2, nb + 1, 2)); UVb[:, :, 0] = 0.93 + 0.05 * np.arange(nb + 1) / nb; UVb[0, :, 1] = 0.935; UVb[1, :, 1] = 0.955
        mb.grid(np.stack([ib[:nb], ib[nb:]]), UVb, closed=True, mat=3, centers=np.array([c, c]))
        uvr = [(0.955 + 0.02 * math.cos(a_), 0.945 + 0.02 * math.sin(a_) * 0.8) for a_ in an]
        mb.fan(list(ib[nb:]), ic, uvr, (0.955, 0.945), 3, no)


def tee_full(skin, arm, mb, z_bottom, crew_front):
    """白 T（圓領、紮進裙子）：一整圈，從裙頭裡面到圓領。身體只量軀幹與脖子（不含肩膀、手臂）；每一圈取凸包（跨過胸部中間）；
    胸部以下的前面（開襟衫敞開、看得到的地方）照胸前的輪廓微微垂下、往裙頭收緊，兩側、背後貼身（在開襟衫裡面）"""
    bv = skin.bvh({'J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_C_Neck'} | set(K.BUST), thr=0.5)
    def yc_at(z):
        f = K.Skin.outer(bv, (0, 0.0, z), (0, -1, 0), 0.35); b = K.Skin.outer(bv, (0, 0.0, z), (0, 1, 0), 0.35)
        return (b - f) / 2 if (np.isfinite(f) and np.isfinite(b)) else 0.0
    zz = np.arange(z_bottom - 0.02, 1.44, 0.01); ycs = np.array([yc_at(z) for z in zz])
    ycs = np.convolve(np.pad(ycs, 3, mode='edge'), np.ones(7) / 7, mode='valid')
    def YC(z): return np.interp(z, zz, ycs)
    Kd = 48; th = np.arange(Kd) * 2 * math.pi / Kd - math.pi / 2; dirs = np.stack([np.cos(th), np.sin(th), np.zeros(Kd)], -1)
    fa = np.abs((np.degrees(th + math.pi / 2) + 180) % 360 - 180)           # 離正前方幾度
    sn = K.SIDE_NECK
    sn_z = sn[1] - 0.026; back_z = K.BACK_NECK_Z - 0.020           # 圓領在脖子根部、貼著身體（第三版照開襟衫的側頸點，正面看像高領；第四版硬撐開成橢圓，像一圈白色的盤子）
    ZN = np.array([back_z + (sn_z - back_z) * abs(math.cos(t)) ** 1.5 if math.sin(t) >= -0.05
                   else crew_front + (sn_z - crew_front) * abs(math.cos(t)) ** 1.8 for t in th])
    def ring_r(zk, ease):
        rr = np.array([K.Skin.outer(bv, (0, float(YC(zk[k])), zk[k]), dirs[k], 0.40) for k in range(Kd)], float)
        bad = ~np.isfinite(rr)
        if bad.all(): rr[:] = 0.10
        elif bad.any(): rr[bad] = np.interp(np.nonzero(bad)[0], np.nonzero(~bad)[0], rr[~bad], period=Kd)
        Hh = K.hull2(dirs[:, :2] * (rr + ease)[:, None])
        return np.array([K.ray_poly(Hh, dirs[k][:2]) for k in range(Kd)])
    zs_scan = np.arange(1.14, 1.32, 0.005)
    fr = np.array([K.Skin.outer(bv, (0, float(YC(z)), z), dirs[0], 0.40) for z in zs_scan], float)
    z_bust = float(zs_scan[int(np.nanargmax(fr))]); r_bust = ring_r(np.full(Kd, z_bust), 0.007)
    z_split = crew_front - 0.035
    front = 1 - K.sstep(24.0, 44.0, fa)
    rows, cens, vrow = [], [], []
    for z in np.linspace(z_bottom, z_split, 18):
        r = ring_r(np.full(Kd, z), 0.004 + 0.003 * float(K.sstep(1.06, z_bust, z)))
        if z < z_bust:
            w = ((z_bust - z) / (z_bust - z_bottom)) ** 1.3                     # 0＝胸口、1＝裙頭
            r = r + (np.maximum(r, r_bust * (1 - w) + r * w) - r) * front
        zk = np.full(Kd, z); rows.append(np.stack([dirs[:, 0] * r, YC(zk) + dirs[:, 1] * r, zk], -1))
        vrow.append(np.full(Kd, 0.02 + 0.66 * (z - z_bottom) / (z_split - z_bottom)))
    NT = 8
    for j in range(1, NT + 1):
        f = j / NT; zk = z_split + (ZN - z_split) * f
        r = ring_r(zk, 0.004 + 0.003 * f)
        rows.append(np.stack([dirs[:, 0] * r, YC(zk) + dirs[:, 1] * r, zk], -1))
        dz = ZN - zk; vrow.append(np.where(dz < 0.013, 0.80 + 0.15 * (1 - dz / 0.013), 0.70))   # 領口最上面 1.3 cm：羅紋
    top = rows[-1]; ctr = np.stack([np.zeros(Kd), YC(top[:, 2]), top[:, 2]], -1); dxy = top - ctr; dxy[:, 2] = 0
    dxy /= np.linalg.norm(dxy, axis=1, keepdims=True) + 1e-9
    rows.append(top - dxy * 0.004 - np.array([0, 0, 0.006])); vrow.append(np.full(Kd, 0.97))   # 領口往內折
    rows = np.array(rows); NR = len(rows)
    for i in range(NR): cens.append([0.0, float(YC(rows[i][:, 2].mean())), float(rows[i][:, 2].mean())])
    I = np.stack([mb.add(rw, 'torso') for rw in rows])
    UV = np.zeros((NR, Kd + 1, 2)); UV[:, :Kd, 0] = (np.arange(Kd) / Kd)[None, :]; UV[:, Kd, 0] = 1.0
    UV[:, :Kd, 1] = np.array(vrow); UV[:, Kd, 1] = UV[:, 0, 1]
    mb.grid(I, UV, closed=True, mat=3, centers=np.array(cens))
    print('  tee: rows %d dirs %d, bottom z %.3f, bust z %.3f, crew front z %.3f, side neck z %.3f' % (NR, Kd, z_bottom, z_bust, crew_front, sn[1]))
    return rows


def conform_under(body, cl, mat_idx, z_lo, z_hi, inset=0.003, slack=0.001, max_move=0.015):
    """白 T 底下的皮膚：從軀幹中心線往外打，軀幹的皮膚點如果在白 T 外面（或離 T 恤不到 1 mm），拉回到 T 恤裡面 3 mm。
    第五版：上胸、肩膀附近幾塊皮膚從 T 恤穿出來（正面看像兩個粉紅色的眼睛）。只動軀幹骨頭權重 ≥ 0.8 的點（手臂、肩膀不動），一次最多 1.5 cm"""
    from mathutils.bvhtree import BVHTree
    me = cl.data; Mc = np.array(cl.matrix_world)
    P = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3) @ Mc[:3, :3].T + Mc[:3, 3]
    F = [list(p.vertices) for p in me.polygons if p.material_index == mat_idx]
    T = P[np.unique(np.concatenate([np.array(f) for f in F]))]
    bv = BVHTree.FromPolygons(P.tolist(), F)
    Mb = np.array(body.matrix_world); co = C.co(body); W = co @ Mb[:3, :3].T + Mb[:3, 3]
    torso = C.vgroup_weights(body, {'J_Bip_C_Hips', 'J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_C_Neck'} | set(K.BUST))
    moved = 0
    for i in np.nonzero((W[:, 2] > z_lo) & (W[:, 2] < z_hi) & (torso >= 0.8))[0]:
        w = W[i]; band = T[np.abs(T[:, 2] - w[2]) < 0.012]
        if len(band) < 8: continue
        o = np.array([0.0, 0.5 * (band[:, 1].min() + band[:, 1].max()), w[2]])
        d = w - o; d[2] = 0.0; L = float(np.linalg.norm(d))
        if L < 1e-4: continue
        d /= L; hit = bv.ray_cast(Vector(o), Vector(d), L + 0.05)
        if hit[0] is None: continue
        dist = float((np.array(hit[0]) - o) @ d)
        if dist < L + slack and L - (dist - inset) < max_move:
            W[i] = o + d * max(0.0, dist - inset); W[i][2] = w[2]; moved += 1
    C.set_co(body, (W - Mb[:3, 3]) @ np.linalg.inv(Mb[:3, :3]).T)
    return moved


def drop_loose(obj):
    """敞開那一段沒有用到的頂點（身片的環不做的格子）拿掉；綁定之後做（bmesh 會保留頂點群組）"""
    import bmesh
    bm = bmesh.new(); bm.from_mesh(obj.data)
    loose = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=loose, context='VERTS'); bm.to_mesh(obj.data); bm.free(); obj.data.update()
    return len(loose)


def skirt_texture(S=512, seed=23):
    """深藍細斜紋（裙子）：斜紋的細線＋淡淡的布紋"""
    rng = np.random.default_rng(seed)
    v = (np.arange(S)[::-1] + 0.5)[:, None] / S; u = (np.arange(S) + 0.5)[None, :] / S
    tw = 0.5 + 0.5 * np.cos(2 * math.pi * (u * 160 + v * 160))
    lum = 0.95 + 0.05 * tw + (K._noise(rng, S, S, 8) - 0.5) * 0.04
    rgb = K.TROUSER_RGB[None, None, :] * lum[:, :, None]
    return np.concatenate([np.clip(rgb, 0, 1), np.ones((S, S, 1))], -1)


def tee_texture(S=256, seed=29):
    save = K.KNIT_RGB; K.KNIT_RGB = WHITE
    try: return K.jersey_texture(S, seed)
    finally: K.KNIT_RGB = save


def _apply(m, arm, body, wsrc_skirt):
    if K.SLIM: K.slim_body(body)
    skin = K.Skin(body)
    mb = K.MB()
    skirt = build_skirt(skin, arm, mb, SKIRT_REF)
    top = build_cardigan_open(skin, arm, mb, skirt)
    tee_full(skin, arm, mb, SKIRT_REF['z_top'] - 0.025, K.TEE_CREW_Z)
    shoes = K.build_shoes(skin, arm, mb)
    eL = top['edges']['L']; zt = float(eL['P'][1:-1, 2].max())
    edge_buttons(mb, eL, K.KNIT_HEM_TOP + 0.022, zt - 0.032, 6)      # 左前襟（人物左邊）
    os.makedirs(K.WIP, exist_ok=True)
    img_k = C.image_from_array('X01_Knit', K.jersey_texture(), os.path.join(K.WIP, 'x01_clothes_Knit.png'))
    img_s = C.image_from_array('X01_Skirt', skirt_texture(), os.path.join(K.WIP, 'x01_clothes_Skirt.png'))
    img_l = C.image_from_array('X01_Loafer', K.loafer_texture(), os.path.join(K.WIP, 'x01_clothes_Loafer.png'))
    img_t = C.image_from_array('X01_Tee', tee_texture(), os.path.join(K.WIP, 'x01_clothes_Tee.png'))
    def tmpl(pat):
        return next(mt.name for mt in bpy.data.materials if pat in mt.name and mt.name.endswith('_CLOTH') and not mt.name.startswith(('H01_', 'X01_')))
    mats = [K.make_mat(tmpl('Tops'), 'X01_Knit_CLOTH', img_k, (0.84, 0.80, 0.88)),
            K.make_mat(tmpl('Tops'), 'X01_Skirt_CLOTH', img_s, (0.72, 0.74, 0.86)),
            K.make_mat(tmpl('Shoes'), 'X01_Loafer_CLOTH', img_l, (0.62, 0.56, 0.56)),
            K.make_mat(tmpl('Tops'), 'X01_Tee_CLOTH', img_t, (0.86, 0.84, 0.86))]
    # 權重：開襟衫、白 T、扣子、鞋照 h01_clothes；裙子自己算
    fake_pants = dict(legs={}, z_crotch=skirt['z_crotch'])
    W = compute_weights_no_pants(skin, arm, mb, top, fake_pants, shoes)
    ms, Ws = skirt_weights(skin, mb, wsrc_skirt, arm)
    W[ms] = K.limit_norm(Ws, 4)
    obj, bad = mb.build('Clothes_X01', mats)
    (arm.users_collection[0] if arm.users_collection else bpy.context.scene.collection).objects.link(obj)
    C.bind(obj, arm, K.weights_dict(skin, W))
    print('  dropped loose verts (open front)', drop_loose(obj))
    print('  body pulled under the tee', conform_under(body, obj, 3, SKIRT_REF['z_top'] - 0.025, K.TEE_CREW_Z + 0.065))
    me = obj.data; tris = {}
    for p in me.polygons: tris[p.material_index] = tris.get(p.material_index, 0) + len(p.vertices) - 2
    print('  clothes: verts %d faces %d (bad %d) tris knit %d skirt %d loafer %d tee %d' % (len(me.vertices), len(me.polygons), bad, tris.get(0, 0), tris.get(1, 0), tris.get(2, 0), tris.get(3, 0)))
    n = K.cull_skin(body, obj)
    print('  culled skin faces', n)
    m['clothes'] = obj
    return obj


def compute_weights_no_pants(skin, arm, mb, top, pants, shoes):
    """h01_clothes.compute_weights：沒有 'pantsL／R' 的頂點，褲子那段迴圈是空的；裙子（'skirt'）的列留 0，另外算"""
    return K.compute_weights(skin, arm, mb, top, pants, shoes)


SKIRT_REF = None


def apply(m):
    """p00_clothes.run 的做法（BodyMap 對到沈以安的比例 → 做衣服 → 轉回來），但呼叫自己的 _apply（有裙子、沒有褲子）"""
    global SKIRT_REF
    import p00_clothes as PC
    arm, body = m['arm'], m['body']
    bm = C.BodyMap(C.landmarks(arm), PC.REF)
    for k, v in STYLE.items(): setattr(K, k, v)
    for k, v in STYLE_M.items(): setattr(K, k, float(np.interp(v, bm.zc, bm.zr)))
    zr = float(np.interp(SIDE_NECK_M[1], bm.zc, bm.zr)); K.SIDE_NECK = (SIDE_NECK_M[0] * float(bm._s(np.array([zr]))[0]), zr)
    SKIRT_REF = dict(SKIRT, **{k: float(np.interp(SKIRT[k], bm.zc, bm.zr)) for k in ('z_top', 'z_band', 'z_hip', 'z_hem')})
    print('  clothes(sim): heights in reference space', {k: round(getattr(K, k), 3) for k in STYLE_M}, 'skirt', {k: round(v, 3) for k, v in SKIRT_REF.items() if k.startswith('z_')})
    bh = C.bone_head
    C.bone_head = lambda a, n: bm.fwd(bh(a, n))
    C.warp_world(body, bm.fwd)
    ws = m.get('wsrc_top'); wsk = m.get('wsrc_skirt')
    if ws is not None: C.warp_world(ws, bm.fwd); K.WSRC = ws
    if wsk is not None: C.warp_world(wsk, bm.fwd)
    try:
        obj = _apply(m, arm, body, wsk)
    finally:
        C.bone_head = bh; K.WSRC = None
        for key in ('wsrc_top', 'wsrc_skirt'):
            if m.get(key) is not None: bpy.data.objects.remove(m[key], do_unlink=True); m[key] = None
    Mw = np.array(obj.matrix_world); P = C.co(obj) @ Mw[:3, :3].T + Mw[:3, 3]
    C.set_co(obj, (bm.inv(P) - Mw[:3, 3]) @ np.linalg.inv(Mw[:3, :3]).T)
    C.warp_world(body, bm.inv)
    return obj
