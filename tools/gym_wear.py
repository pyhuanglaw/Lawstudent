#!/usr/bin/env python3
"""祐廷的健身短袖運動服（GYM-FIT-1107，LAWWW2-B 2026-11-07；LAWWW-B 05:46 決定（人物外觀 LAWWW 定案，D128）：
「在健身中心換一套短袖運動服（只在 B1 健身中心／體育課時穿，出來換回原本的）……和 fit morph 一起做（短袖要一樣吃 fit 形狀）」。
起因：使用者 11-07「肌肉線條更明顯」——祐廷平常穿長袖毛衣，體態的 fit 形狀只看得到輪廓；露出手臂、小腿才看得到線條。

做法（在 vroid_yuting.vrm 上加，不重建人物；和系外套 tools/jacket_econ.py 同一套）：
  1. 從**身體皮膚**的網格選出上衣、短褲的範圍（照頂點綁的主要骨頭＋位置），三角形只要有一個點在範圍裡就留；
     範圍外的點拉回切口（袖口沿上臂量、下襬／腰頭照高度、圓領照離脖子軸的水平距離），拉回來的點用最近的範圍內頂點的骨頭權重。
  2. 沿皮膚的法向往外推：上衣 1.1 cm（袖口放寬到 2.1 cm），短褲腰 1.1 cm → 褲管外側 4.6 cm、內側 2.2 cm；
     Taubin 平滑（腹肌、肋骨、臀部的凹凸不印在衣服上）；上衣從胸口往下垂；領口那一圈擬合成平順的曲線（後領口在脖子根部）。
     同一組骨頭權重：動起來和身體一起變形，不會穿模（tests/gym_wear_unit.js ④）。
  3. 貼圖（皮膚的 UV，另外一張圖）：上衣深藍灰、領口／袖口／下襬羅紋；短褲深灰黑、兩側白線、腰頭羅紋。沒有字、沒有品牌。
  4. 新節點 GYM_TOP、GYM_SHORTS（網格名稱一樣），材質 G00_Tops_GymTee_CLOTH、G00_Bottoms_GymShorts_CLOTH（複製原本上衣、褲子的 MToon 設定）。
     遊戲預設藏起來（manifest hide），C.setGymWear(h,on) 換穿：藏毛衣、褲子、系外套，顯示運動服。鞋子照舊。
  5. 之後跑 tools/anim/fit_body_morph.py：運動服一起吃 fit 形狀。
用法：python3 tools/gym_wear.py --in <沒有運動服的 vroid_yuting.vrm> --out <輸出.vrm> [--tex 貼圖資料夾]
"""
import os, sys, json, argparse
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vroid_build as VB

# weld、raster：原本從 tools/jacket_econ.py import（那支 CANON-NO-ECON-1112 第三批拿掉），兩個函式原樣搬到這裡
def weld(P, eps=2e-4):
    _, wid = np.unique(np.round(P / eps).astype(np.int64), axis=0, return_inverse=True)
    return wid.reshape(-1)


def raster(UVt, At, size):
    """三角形畫到貼圖空間，每個像素內插頂點的屬性 At（三角形數×3×K：3D 位置、法向、離開口的距離）；後畫的蓋前面的。邊緣多畫一點點，接縫不露底色。"""
    W, H = size; K = At.shape[2]; AA = np.zeros((H, W, K)); M = np.zeros((H, W), bool)
    for uv, A in zip(UVt, At):
        uv = uv * [W, H]; x0, y0 = np.floor(uv.min(0)).astype(int) - 1; x1, y1 = np.ceil(uv.max(0)).astype(int) + 1
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W - 1), min(y1, H - 1)
        if x1 < x0 or y1 < y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        (ax, ay), (bx, by), (cx, cy) = uv; d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(d) < 1e-12: continue
        l0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / d; l1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / d; l2 = 1 - l0 - l1
        ins = (l0 >= -0.04) & (l1 >= -0.04) & (l2 >= -0.04)
        if not ins.any(): continue
        L = np.stack([l0[ins], l1[ins], l2[ins]], 1)
        yy, xx = (gy[ins] - 0.5).astype(int), (gx[ins] - 0.5).astype(int)
        AA[yy, xx] = L @ A; M[yy, xx] = True
    return AA, M


class JE:
    weld = staticmethod(weld)
    raster = staticmethod(raster)

TOP, SHORTS = 'GYM_TOP', 'GYM_SHORTS'
MAT_TOP, MAT_SHORTS = 'G00_Tops_GymTee_CLOTH', 'G00_Bottoms_GymShorts_CLOTH'
T_SLEEVE = 0.42          # 袖口：上臂從肩關節往手肘的 42%
HEM_UP = 0.07            # 上衣下襬：大腿根（UpperLeg 關節）往上 7 cm
HEM_OVER = 0.07          # 下襬往上這一段蓋在短褲腰頭外面（腰頭在骨盆上 WAIST_UP）
WAIST_UP = 0.06          # 短褲腰頭：骨盆關節往上 6 cm（第一版 9 cm：和上衣下襬重疊 6.4 cm，髖骨那兩點短褲穿出上衣——LAWWW-B 11-07 CC 截圖「衣襬前面兩個小黑點」）
T_SHORT = 0.58           # 褲管：大腿從髖關節往膝蓋的 58%
COLLAR_R, COLLAR_FRONT = 0.062, 0.018
NECK_BACK_DROP = 0.022  # 後領口最低在脖子關節下面多少   # 圓領：離脖子軸的水平距離（脖子約 4.3 cm）；前面再放寬多少（往胸口低）
HANG = 0.75             # 上衣從胸口往下垂的程度（0＝貼身、1＝下襬和胸口一樣寬）
TEE, TEE_RIB, SH, SH_RIB, SH_LINE = '#2d3a52', '#243045', '#22252b', '#1a1c21', '#e4e2da'


def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float64) / 255


def skin_prim(v):
    for m in v.j['meshes']:
        if not m['name'].startswith('Body'): continue
        for p in m['primitives']:
            if 'Body_00_SKIN' in v.j['materials'][p['material']]['name']: return p
    raise KeyError('Body_00_SKIN')


def prim_of(v, key):
    for m in v.j['meshes']:
        if not m['name'].startswith('Body'): continue
        for p in m['primitives']:
            if key in v.j['materials'][p['material']]['name']: return p
    raise KeyError(key)


def smooth_relax(X, Tn, wid, s, iters, lam=0.5, mu=-0.53):
    """Taubin 平滑（焊接後的點一起動）：s＝每個點平滑的強度 0～1。去掉皮膚上的腹肌、肋骨凹凸，衣服是平順地蓋過去。"""
    nw = wid.max() + 1; Xw = np.zeros((nw, 3)); cnt = np.zeros(nw); np.add.at(Xw, wid, X); np.add.at(cnt, wid, 1); Xw /= cnt[:, None]
    sw = np.zeros(nw); np.maximum.at(sw, wid, s)
    e = np.concatenate([Tn[:, [0, 1]], Tn[:, [1, 2]], Tn[:, [2, 0]]]); e = wid[e]; e = e[e[:, 0] != e[:, 1]]; e = np.unique(np.sort(e, 1), axis=0)
    deg = np.zeros(nw); np.add.at(deg, e[:, 0], 1); np.add.at(deg, e[:, 1], 1); deg = np.maximum(deg, 1)
    bnd = np.zeros(nw, bool)   # 開口（只屬於一個三角形的邊）不平滑：袖口、領口、下襬照切口
    ef = np.concatenate([Tn[:, [0, 1]], Tn[:, [1, 2]], Tn[:, [2, 0]]]); ef = np.sort(wid[ef], 1); ef = ef[ef[:, 0] != ef[:, 1]]
    u, c = np.unique(ef, axis=0, return_counts=True); bnd[u[c == 1].reshape(-1)] = True
    sw[bnd] *= 0.25
    for _ in range(iters):
        for f in (lam, mu):
            acc = np.zeros((nw, 3)); np.add.at(acc, e[:, 0], Xw[e[:, 1]]); np.add.at(acc, e[:, 1], Xw[e[:, 0]])
            Xw = Xw + f * sw[:, None] * (acc / deg[:, None] - Xw)
    return Xw[wid]


def vnormals(X, Tn, wid):
    fn = np.cross(X[Tn[:, 1]] - X[Tn[:, 0]], X[Tn[:, 2]] - X[Tn[:, 0]]); nw = wid.max() + 1; acc = np.zeros((nw, 3))
    for k in range(3): np.add.at(acc, wid[Tn[:, k]], fn)
    N = acc[wid]; return N / np.maximum(1e-9, np.linalg.norm(N, axis=1, keepdims=True))


def build_piece(v, P, N, UV, Jn, Wt, T, names, kind):
    """kind 'top'／'shorts'：選範圍、拉切口、往外推、平滑、上衣從胸口往下垂；回傳 (新位置, 法向, UV, 骨頭, 權重, 三角形, 每點的屬性給貼圖, 選到幾個點)"""
    J = lambda k: VB.joint_world(v, k)[:3, 3]
    dom = np.array([names[Jn[i, np.argmax(Wt[i])]] for i in range(len(P))])
    sel = np.zeros(len(P), bool); cut = P.copy(); off = np.zeros(len(P)); sm = np.zeros(len(P)); attr = np.zeros((len(P), 3))   # attr：羅紋（離切口多近）、側邊白線（cos、sin）
    if kind == 'top':
        neck = J('C_Neck'); hy = J('L_UpperLeg')[1] + HEM_UP
        for sd in 'LR':
            a0, a1 = J(sd + '_UpperArm'), J(sd + '_LowerArm'); ax = a1 - a0; L = np.linalg.norm(ax); ax /= L
            m = np.isin(dom, ['J_Bip_%s_UpperArm' % sd, 'J_Bip_%s_LowerArm' % sd, 'J_Bip_%s_Hand' % sd])
            t = ((P[m] - a0) @ ax) / L
            sel[np.where(m)[0][t <= T_SLEEVE]] = True
            over = np.clip(t - T_SLEEVE, 0, None); cut[m] = P[m] - np.outer(over * L, ax)
            off[m] = 0.011 + 0.010 * np.clip(t / T_SLEEVE, 0, 1) ** 1.5; sm[m] = 0.6
            attr[np.where(m)[0], 0] = np.clip(1 - (T_SLEEVE - np.minimum(t, T_SLEEVE)) * L / 0.02, 0, 1)
        m = np.isin(dom, ['J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest', 'J_Bip_L_Shoulder', 'J_Bip_R_Shoulder', 'J_Bip_C_Hips', 'J_Bip_C_Neck', 'J_Bip_L_UpperLeg', 'J_Bip_R_UpperLeg'])
        cm = m & ~np.isin(dom, ['J_Bip_L_UpperArm', 'J_Bip_R_UpperArm'])
        # 圓領：繞著脖子一圈（水平距離脖子軸 COLLAR_R，前面放寬 COLLAR_FRONT＝往胸口低一點）；肩膀、斜方肌照樣蓋到
        dx, dz = P[:, 0] - neck[0], P[:, 2] - neck[2]; dh = np.hypot(dx, dz); th = np.arctan2(dx, dz)
        fr = np.clip(-dz / np.maximum(dh, 1e-6), 0, 1)          # 前面（VRM 0.x 面向 −z）1、側面和後面 0
        bk = np.clip(dz / np.maximum(dh, 1e-6), 0, 1) ** 2      # 後面 1：上背貼近脖子軸，領口只能在脖子根部（不然背後會開一道縫）
        R = COLLAR_R + COLLAR_FRONT * fr
        in_neck = (dh < R) & (P[:, 1] > neck[1] - 0.10 + 0.08 * bk)
        ok = cm & (P[:, 1] >= hy) & ~in_neck & (dom != 'J_Bip_C_Neck')
        sel |= ok
        # 領口那一圈的高度：照選到的點裡、領口外 2.5 cm 以內的最高點（每 15° 一格）
        NB = 24; bi = ((th + np.pi) / (2 * np.pi) * NB).astype(int) % NB
        ring = ok & (dh < R + 0.025); rh = np.full(NB, -1.0); np.maximum.at(rh, bi[ring], P[ring, 1])
        for _ in range(NB):
            e = rh < 0
            if not e.any(): break
            rh[e] = np.maximum(np.roll(rh, 1), np.roll(rh, -1))[e]
        rh = 0.25 * np.roll(rh, 1) + 0.5 * rh + 0.25 * np.roll(rh, -1)
        cut[cm, 1] = np.maximum(P[cm, 1], hy)
        nk = cm & in_neck                                         # 領口裡面的點（三角形跨在切口上）：拉到領口那一圈
        Rr = R[nk] / np.maximum(dh[nk], 1e-6)
        cut[nk, 0] = neck[0] + dx[nk] * Rr; cut[nk, 2] = neck[2] + dz[nk] * Rr; cut[nk, 1] = np.minimum(P[nk, 1], rh[bi[nk]])
        off[cm] = 0.011; sm[cm] = 1.0
        dh2 = np.hypot(cut[:, 0] - neck[0], cut[:, 2] - neck[2])
        rib = np.maximum(np.clip(1 - (cut[:, 1] - hy) / 0.025, 0, 1), np.clip(1 - (dh2 - R) / 0.018, 0, 1) * (cut[:, 1] > neck[1] - 0.12))
        attr[cm, 0] = np.maximum(attr[cm, 0], rib[cm])
    else:
        wy = J('C_Hips')[1] + WAIST_UP
        for sd in 'LR':
            a0, a1 = J(sd + '_UpperLeg'), J(sd + '_LowerLeg'); ax = a1 - a0; L = np.linalg.norm(ax); ax /= L
            m = np.isin(dom, ['J_Bip_%s_UpperLeg' % sd, 'J_Bip_%s_LowerLeg' % sd])
            t = ((P[m] - a0) @ ax) / L
            sel[np.where(m)[0][t <= T_SHORT]] = True
            over = np.clip(t - T_SHORT, 0, None); cut[m] = P[m] - np.outer(over * L, ax)
            perp = (P[m] - a0) - np.outer((P[m] - a0) @ ax, ax); pn = perp / np.maximum(np.linalg.norm(perp, axis=1, keepdims=True), 1e-6)
            sgn = np.sign(a0[0] - J('C_Hips')[0])                    # 這條腿的外側（離身體中線）
            outer = np.clip(pn[:, 0] * sgn, 0, 1)                   # 外側 1、內側 0：褲管外側寬鬆、內側（兩腿中間）收一點
            k = np.clip(t / T_SHORT, 0, 1)
            off[m] = 0.011 + k * (0.011 + 0.024 * outer); sm[m] = 0.8
            attr[np.where(m)[0], 0] = np.clip(1 - (T_SHORT - np.minimum(t, T_SHORT)) * L / 0.015, 0, 1) * 0.6
            attr[np.where(m)[0], 1] = pn[:, 0] * sgn; attr[np.where(m)[0], 2] = pn[:, 2]
        m = np.isin(dom, ['J_Bip_C_Hips', 'J_Bip_C_Spine'])
        ok = m & (P[:, 1] <= wy); sel |= ok
        cut[m, 1] = np.minimum(P[m, 1], wy); off[m] = 0.007; sm[m] = 0.8   # 腰頭在上衣下面：推少一點（第一版 1.1 cm，和上衣一樣）
        attr[m, 0] = np.clip(1 - (wy - P[m, 1]) / 0.035, 0, 1)
        attr[m, 1] = -1
    # 三角形：有一個點在範圍裡就留
    keep = sel[T].any(1); Tk = T[keep]; used, inv = np.unique(Tk, return_inverse=True); Tn = inv.reshape(-1, 3)
    # 拉回來的點：權重用最近的範圍內頂點
    Jo, Wo = Jn[used].copy(), Wt[used].copy(); ins = np.where(sel)[0]
    for k, i in enumerate(used):
        if sel[i]: continue
        d = np.linalg.norm(P[ins] - cut[i], axis=1); j = ins[np.argmin(d)]; Jo[k], Wo[k] = Jn[j], Wt[j]
    # 往外推（同一個位置的點一起動：法向照焊接後的平均）
    Pu, Nu = cut[used], N[used]; wid = JE.weld(Pu); nw = wid.max() + 1
    acc = np.zeros((nw, 3)); np.add.at(acc, wid, Nu); Dn = acc[wid]; Dn /= np.maximum(1e-8, np.linalg.norm(Dn, axis=1, keepdims=True))
    ou = off[used]; X = Pu + Dn * ou[:, None]
    # 平滑：腹肌、肋骨、臀部的凹凸不要印在衣服上
    X = smooth_relax(X, Tn, wid, sm[used], 10)
    if kind == 'top':
        # 從胸口往下垂：腰比胸窄的地方（前面肚子、側腰），衣服照胸口那一圈的寬度往下掛，下襬放鬆一點
        cy = J('C_UpperChest')[1]; cz = J('C_Chest')[2]; hy = J('L_UpperLeg')[1] + HEM_UP
        torso = sm[used] > 0.9
        ang = np.arctan2(X[:, 0], X[:, 2] - cz); r = np.hypot(X[:, 0], X[:, 2] - cz)
        NB = 36; b = ((ang + np.pi) / (2 * np.pi) * NB).astype(int) % NB
        band = torso & (np.abs(X[:, 1] - (cy - 0.02)) < 0.07)
        rc = np.zeros(NB); np.maximum.at(rc, b[band], r[band])
        for _ in range(2): rc = np.maximum(rc, 0.5 * (np.roll(rc, 1) + np.roll(rc, -1)) * (rc > 0) + rc * (rc == 0))
        rc = 0.25 * np.roll(rc, 1) + 0.5 * rc + 0.25 * np.roll(rc, -1)
        w = np.clip((cy - 0.04 - X[:, 1]) / max(0.05, cy - 0.04 - hy), 0, 1) ** 0.8 * HANG
        tgt = np.maximum(r, (1 - w) * r + w * rc[b] * 0.985)
        g = torso & (X[:, 1] < cy - 0.04)
        d = np.stack([np.sin(ang), np.zeros_like(ang), np.cos(ang)], 1)
        X[g] += d[g] * (tgt[g] - r[g])[:, None]
    # 不能比皮膚低：沿皮膚法向至少推出原本的七成（短褲八成五）
    dd = np.sum((X - Pu) * Dn, 1); lo = (0.7 if kind == 'top' else 0.85) * ou   # 短褲：坐下時大腿後面、臀部的皺摺壓得比較緊，多留一點
    if kind == 'top':   # 下襬蓋在短褲腰頭外面的那一段（下襬往上 HEM_OVER）：至少推出 2.0 cm——平滑會把髖骨的凸起往內拉，第一版短褲在這裡穿出來（兩個小黑點）
        hyy = J('L_UpperLeg')[1] + HEM_UP; lo = np.where((Pu[:, 1] < hyy + HEM_OVER) & (sm[used] > 0.9), np.maximum(lo, 0.020), lo)
    X += Dn * np.maximum(0, lo - dd)[:, None]
    if kind == 'top':
        # 領口那一圈貼到平順的曲線：邊上的點（只屬於一個三角形的邊）照角度擬合高度、半徑（到 2 次的圓周函數），切口不再鋸齒；旁邊兩圈的點再平滑
        neck = J('C_Neck'); nw = wid.max() + 1
        ef = np.concatenate([Tn[:, [0, 1]], Tn[:, [1, 2]], Tn[:, [2, 0]]]); ef = np.sort(wid[ef], 1); ef = ef[ef[:, 0] != ef[:, 1]]
        u_, c_ = np.unique(ef, axis=0, return_counts=True); bw = np.zeros(nw, bool); bw[u_[c_ == 1].reshape(-1)] = True
        Xw = np.zeros((nw, 3)); Xw[wid] = X
        dxw, dzw = Xw[:, 0] - neck[0], Xw[:, 2] - neck[2]; dhw = np.hypot(dxw, dzw); thw = np.arctan2(dxw, dzw)
        col = bw & (dhw < COLLAR_R + COLLAR_FRONT + 0.04) & (Xw[:, 1] > neck[1] - 0.13)
        if col.sum() >= 8:
            B = lambda t: np.stack([np.ones_like(t), np.cos(t), np.sin(t), np.cos(2 * t), np.sin(2 * t)], 1)
            bkw = np.clip(np.cos(thw[col]), 0, 1)                     # 後面（VRM 0.x 的 +z）1、側面 0
            yd = np.maximum(Xw[col, 1], neck[1] - NECK_BACK_DROP - (1 - bkw) * 0.06)   # 後領口：在脖子根部，往兩側平緩地接到肩膀（擬合前墊高，不然背後也會和前面一樣低、開一個 V）
            cy_, *_ = np.linalg.lstsq(B(thw[col]), yd, rcond=None); cr_, *_ = np.linalg.lstsq(B(thw[col]), dhw[col], rcond=None)
            Xw[col, 1] = np.maximum(B(thw[col]) @ cy_, neck[1] - NECK_BACK_DROP - (1 - bkw) * 0.06); rr = B(thw[col]) @ cr_   # 擬合以後再墊一次（背後的點少，最小平方會被兩側拉低）
            Xw[col, 0] = neck[0] + np.sin(thw[col]) * rr; Xw[col, 2] = neck[2] + np.cos(thw[col]) * rr
            X = Xw[wid]
            # 旁邊兩圈：鄰居平均（邊上的點固定）
            e = np.unique(np.sort(ef, 1), axis=0); near = col.copy()
            for _ in range(2): nb = near.copy(); nb[e[near[e[:, 0]], 1]] = True; nb[e[near[e[:, 1]], 0]] = True; near = nb
            mv = near & ~col
            for _ in range(4):
                acc = np.zeros((nw, 3)); dg = np.zeros(nw); np.add.at(acc, e[:, 0], Xw[e[:, 1]]); np.add.at(acc, e[:, 1], Xw[e[:, 0]]); np.add.at(dg, e[:, 0], 1); np.add.at(dg, e[:, 1], 1)
                Xw[mv] = 0.5 * Xw[mv] + 0.5 * acc[mv] / np.maximum(dg[mv], 1)[:, None]
            X = Xw[wid]
    Nn = vnormals(X, Tn, wid)
    return X, Nn, UV[used], Jo, Wo, Tn, attr[used], int(sel.sum())


SOCK_TOP = 0.135         # 白色短襪上緣（鞋口約 0.105 m）
SOCK = '#eeede8'


def skin_fix(v, P, UV, T, names, Jn, Wt):
    """皮膚貼圖（VRoid 原本畫了貼身內衣：胸口、上背、肩膀的灰色背心，腰部的深色內褲，腳和小腿下段的深色襪子；平常被毛衣、長褲蓋住）。
    運動服露出來的地方（LAWWW-B 11-07 CC 截圖：「領口裡面露一塊灰色」「深咖啡色長襪」）：
      - 灰色背心 → 皮膚色（同一欄往下找第一個皮膚顏色接上去，接上原本畫的胸口明暗）；
      - 小腿的深色襪子 → 鞋口往上到 SOCK_TOP 是白色短襪（上緣一圈羅紋），再上去是皮膚色（同一欄往上接）。
    這些地方平常都被衣服蓋住：原本的外觀不變（坐下時長褲下面露出來的是白襪，和白球鞋一樣）。內褲照舊（短褲蓋住）。"""
    p = skin_prim(v); mi = p['material']; ti = v.j['materials'][mi]['pbrMetallicRoughness']['baseColorTexture']['index']; ii = v.image_of_tex(ti)
    img = v.get_image(ii); A = np.asarray(img).astype(np.float64) / 255; H, W = A.shape[:2]
    dom = np.array([names[Jn[i, np.argmax(Wt[i])]] for i in range(len(P))])
    leg = np.isin(dom, ['J_Bip_L_UpperLeg', 'J_Bip_R_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_LowerLeg', 'J_Bip_L_Foot', 'J_Bip_R_Foot', 'J_Bip_L_ToeBase', 'J_Bip_R_ToeBase']).astype(float)
    att = np.stack([P[:, 1], leg, np.ones(len(P))], 1)
    AA, M = JE.raster(UV[T], att[T], (W, H))
    yh, isleg = AA[..., 0], AA[..., 1] > 0.5
    rgb = A[..., :3]; mx, mn = rgb.max(2), rgb.min(2)
    skinlike = M & (rgb[..., 0] > rgb[..., 2] + 0.15) & (mx > 0.7)   # 皮膚：紅比藍多 0.15 以上（交界的混色只有 0.09，不算）
    DEEP = 6   # 取色往皮膚裡面再走 6 px（避開交界的混色）
    gray = M & ~isleg & (mx - mn < 0.11) & (mx > 0.45) & (mx < 0.92)   # 灰色背心 (192,184,173)、(165,158,149)：色差 ≤ 0.08；皮膚 ≥ 0.18
    dark = M & isleg & (mx < 0.4) & (yh > 0.05) & (yh < 0.6)
    def grow(m, n=4):   # 往外擴 n px（襪子上緣的過渡帶 3～4 px）（交界的混色：既不是灰也不是皮膚，不擴會留一條線）
        g = m.copy()
        for _ in range(n):
            h = g.copy(); h[1:] |= g[:-1]; h[:-1] |= g[1:]; h[:, 1:] |= g[:, :-1]; h[:, :-1] |= g[:, 1:]; g = h
        return g
    gray = gray | (grow(gray) & M & ~isleg & ~skinlike & (mx > 0.4))
    dark = dark | (grow(dark) & M & isleg & ~skinlike & (yh > 0.05) & (yh < 0.6))
    out = rgb.copy(); n_gray = int(gray.sum()); n_dark = int(dark.sum())
    for x in range(W):
        col = gray[:, x]
        if col.any():   # 灰色：往下（v 變大）找第一個皮膚色
            rows = np.where(col)[0]; ok = np.where(skinlike[:, x])[0]
            for r in rows:
                below = ok[ok > r]; above = ok[ok < r]
                src = below[min(DEEP, len(below) - 1)] if len(below) else (above[max(-DEEP - 1, -len(above))] if len(above) else None)
                if src is not None: out[r, x] = rgb[src, x]
        col = dark[:, x]
        if col.any():
            rows = np.where(col)[0]; ok = np.where(skinlike[:, x])[0]
            for r in rows:
                if yh[r, x] < SOCK_TOP:
                    rib = 0.92 + 0.08 * (0.5 + 0.5 * np.cos(x * 0.9)) if yh[r, x] > SOCK_TOP - 0.012 else 1.0
                    out[r, x] = hexrgb(SOCK) * rib; continue
                if not len(ok): continue
                k = int(np.argmin(np.abs(ok - r))); step = 1 if ok[k] > r else -1   # 皮膚：同一欄最近的皮膚色，再往皮膚裡面走 DEEP px
                k = min(max(k + step * DEEP, 0), len(ok) - 1); out[r, x] = rgb[ok[k], x]
    A2 = A.copy(); A2[..., :3] = out
    v.set_image(ii, Image.fromarray((np.clip(A2, 0, 1) * 255).astype(np.uint8), 'RGBA'), 'PNG')
    return dict(gray_px=n_gray, sock_px=n_dark)


def paint(UVt, At, kind, size=1024):
    AA, M = JE.raster(UVt, At, (size, size))
    rib, line = AA[..., 0], AA[..., 1]
    rng = np.random.default_rng(7); noise = rng.normal(0, 0.018, (size, size))
    vv = (np.arange(size)[:, None] + 0.5) / size; uu = (np.arange(size)[None, :] + 0.5) / size
    if kind == 'top':
        base = hexrgb(TEE)[None, None, :] * (1 + noise[..., None]); ribc = hexrgb(TEE_RIB)[None, None, :] * (0.92 + 0.08 * np.cos(uu * 2 * np.pi * 220))[..., None]
        rgb = base * (1 - rib[..., None]) + ribc * rib[..., None]
    else:
        base = hexrgb(SH)[None, None, :] * (1 + noise[..., None] * 0.8); ribc = hexrgb(SH_RIB)[None, None, :] * (0.9 + 0.1 * np.cos(vv * 2 * np.pi * 260))[..., None]
        rgb = base * (1 - rib[..., None]) + ribc * rib[..., None]
        ang = np.abs(np.arctan2(AA[..., 2], line)); ln = (np.clip((0.075 - ang) / 0.012, 0, 1) * (line > 0.2))[..., None]   # 外側正中間一條約 1.2 cm 的白線
        rgb = rgb * (1 - ln) + hexrgb(SH_LINE)[None, None, :] * ln
    rgb[~M] = hexrgb(TEE if kind == 'top' else SH)
    a = np.ones((size, size, 4)); a[..., :3] = np.clip(rgb, 0, 1)
    return Image.fromarray((a * 255).astype(np.uint8), 'RGBA')


def add_piece(v, name, matname, src_key, piece, img):
    j = v.j; Pn, Nu, UVu, Jo, Wo, Tn, attr, nsel = piece
    mi_t = prim_of(v, src_key)['material']
    smat = json.loads(json.dumps(j['materials'][mi_t])); svm = json.loads(json.dumps(v.vrm_mat(mi_t)))
    ti = v.add_image(img, name); v.set_image(v.image_of_tex(ti), img.convert('RGB'), 'JPEG')
    smat['name'] = svm['name'] = matname
    smat['pbrMetallicRoughness']['baseColorTexture']['index'] = ti
    svm['textureProperties']['_MainTex'] = ti; svm['textureProperties']['_ShadeTexture'] = ti
    j['materials'].append(smat); j['extensions']['VRM']['materialProperties'].append(svm); new_mi = len(j['materials']) - 1
    prim = {'attributes': {'POSITION': v.add_acc(Pn.astype(np.float32), 5126, 'VEC3', 34962, True),
                           'NORMAL': v.add_acc(Nu.astype(np.float32), 5126, 'VEC3', 34962),
                           'TEXCOORD_0': v.add_acc(UVu.astype(np.float32), 5126, 'VEC2', 34962),
                           'JOINTS_0': v.add_acc(Jo.astype(np.uint16), 5123, 'VEC4', 34962),
                           'WEIGHTS_0': v.add_acc(Wo.astype(np.float32), 5126, 'VEC4', 34962)},
            'indices': v.add_acc(Tn.reshape(-1).astype(np.uint32), 5125, 'SCALAR', 34963), 'material': new_mi, 'mode': 4}
    j['meshes'].append({'name': name, 'primitives': [prim]})
    bni, bnode = v.mesh_node('Body')
    j['nodes'].append({'name': name, 'mesh': len(j['meshes']) - 1, 'skin': bnode['skin']})
    j['scenes'][j.get('scene', 0)]['nodes'].append(len(j['nodes']) - 1)
    fp = j['extensions']['VRM'].get('firstPerson', {})
    if 'meshAnnotations' in fp: fp['meshAnnotations'].append({'mesh': len(j['meshes']) - 1, 'firstPersonFlag': 'Auto'})
    return dict(verts=int(len(Pn)), tris=int(len(Tn)), selected=nsel)


def build(v, tex_dir=None):
    j = v.j
    assert not any(n.get('name') in (TOP, SHORTS) for n in j['nodes']), '已經有運動服：輸入要用沒有運動服的 vroid_yuting.vrm'
    for m in j['meshes']:
        assert 'fit' not in ((m.get('extras') or {}).get('targetNames') or []), '輸入已經有 fit morph：先加運動服，再跑 fit_body_morph.py'
    p = skin_prim(v); A = p['attributes']
    idx = v.acc(p['indices']).astype(np.int64).reshape(-1, 3); used, inv = np.unique(idx, return_inverse=True); T = inv.reshape(-1, 3)
    P = v.acc(A['POSITION']).astype(np.float64)[used]; N = v.acc(A['NORMAL']).astype(np.float64)[used]; UV = v.acc(A['TEXCOORD_0']).astype(np.float64)[used]
    Jn = v.acc(A['JOINTS_0']).astype(np.int64)[used]; Wt = v.acc(A['WEIGHTS_0']).astype(np.float64)[used]
    if Wt.max() > 1.5: Wt /= 255.0
    N /= np.maximum(1e-8, np.linalg.norm(N, axis=1, keepdims=True))
    bni, bnode = v.mesh_node('Body'); names = [j['nodes'][k]['name'] for k in j['skins'][bnode['skin']]['joints']]
    out = {'skin_fix': skin_fix(v, P, UV, T, names, Jn, Wt)}
    for kind, name, mat, src in (('top', TOP, MAT_TOP, 'Tops'), ('shorts', SHORTS, MAT_SHORTS, 'Bottoms')):
        pc = build_piece(v, P, N, UV, Jn, Wt, T, names, kind)
        Pn, Nu, UVu, Jo, Wo, Tn, attr, nsel = pc
        img = paint(UVu[Tn], np.concatenate([attr[Tn]], 2), kind)
        if tex_dir: os.makedirs(tex_dir, exist_ok=True); img.save(os.path.join(tex_dir, name.lower() + '.png'))
        out[name] = add_piece(v, name, mat, src, pc, img)
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True); ap.add_argument('--tex', default=None)
    a = ap.parse_args()
    v = VB.VRM(a.inp)
    print(json.dumps(build(v, a.tex), ensure_ascii=False))
    n = v.save(a.out)
    print('saved', a.out, round(n / 1e6, 2), 'MB')
