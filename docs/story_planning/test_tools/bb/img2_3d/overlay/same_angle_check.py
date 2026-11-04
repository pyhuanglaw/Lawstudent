"""同角度疊圖驗收（結構）：參考圖 vs 同角度的遊戲截圖（或 Blender 渲染）。
和 tools/blender/env_second/ref_match.py 互補：ref_match 只量光和顏色；這支量「形狀、位置、東西多不多」。

用法：python same_angle_check.py <參考圖> <截圖> <輸出前綴> [--fov 53.7] [--mode shop|campus] [--crop x0,y0,x1,y1] [--crop2 x0,y0,x1,y1] [--width 640] [--mask x0,y0,x1,y1 ...]
  --mode shop（預設，D133：店面照參考圖做，越像越好）
  --mode campus（D136：校園建築「相似但不能照抄」）：不是越高越好。分兩部分回報——
      ①相似（要接近）：鏡頭、大體量、開窗節奏（尺度）、各區材質；
      ②疑似照抄（要是 0）：對好位置以後，細部邊緣（窗型、裝飾、屋頂輪廓）幾乎 1:1 重疊的格子＋屋頂天際線幾乎一樣 → 標橘框，給人看。
  --crop／--crop2：參考圖／截圖只取一部分（比例 0～1），例如把拼圖裡的一格切出來
  --mask：不比的區域（比例 0～1，可以多個），例如 HUD、參考圖的浮水印
需要：numpy、pillow、opencv-python-headless、scikit-image（pip 裝得到）

輸出：
  <前綴>_overlay.jpg：上排 參考｜截圖｜邊緣疊圖（紅＝只有參考圖有、青＝只有截圖有、白＝兩邊都有）
                     下排 50% 疊圖｜最佳對位後的邊緣疊圖｜「參考圖比較多東西」的格子（紅框）
  <前綴>_structure.json＋終端機：
    edge_F（容許 tol 像素的邊緣 F 分數，0～1；precision＝截圖的邊緣有多少落在參考圖邊緣附近、recall 反過來）
    line_F（只算長直線：牆角、吧台、窗框、天花板木條——「結構」）
    ssim_struct（模糊後灰階的 SSIM，0～1；只看大形狀，不看貼圖細節）
    region_color（3×3 格，每格 Lab 平均色差 ΔE 和 a/b 直方圖交集 0～1）
    detail_gap（6×4 格，邊緣密度 參考/截圖；> 1.8 的格子＝參考圖這裡東西多很多，可能少放了物件）
    best_shift（在 ±10% 平移、0.85～1.15 縮放裡找邊緣最對得上的位置：鏡頭差多少）
"""
import json, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from skimage.metrics import structural_similarity

A = sys.argv[1:]
if len(A) < 3: sys.exit(__doc__)
ref_p, shot_p, pre = A[0], A[1], A[2]


def opt(name, default=None):
    return A[A.index(name) + 1] if name in A else default


def boxes(name):
    out = []
    for i, a in enumerate(A):
        if a == name: out.append([float(v) for v in A[i + 1].split(',')])
    return out


W = int(opt('--width', 640))
FONT = None
for f in ('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',):
    try: FONT = ImageFont.truetype(f, 16)
    except Exception: pass


def load(p, crop):
    im = Image.open(p).convert('RGB')
    if crop:
        w, h = im.size; c = [float(v) for v in crop.split(',')]
        im = im.crop((int(c[0] * w), int(c[1] * h), int(c[2] * w), int(c[3] * h)))
    return im


R0 = load(ref_p, opt('--crop')); S0 = load(shot_p, opt('--crop2'))
H = int(round(W * R0.size[1] / R0.size[0]))
ar_ref, ar_shot = R0.size[0] / R0.size[1], S0.size[0] / S0.size[1]
R = np.asarray(R0.resize((W, H), Image.LANCZOS)); S = np.asarray(S0.resize((W, H), Image.LANCZOS))
mask = np.ones((H, W), bool)
for b in boxes('--mask'): mask[int(b[1] * H):int(b[3] * H), int(b[0] * W):int(b[2] * W)] = False


def edges(rgb):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    g = cv2.bilateralFilter(g, 7, 40, 7)          # 壓掉磨石子、木紋這種細紋理，留下輪廓
    v = np.median(g); lo, hi = int(max(0, 0.66 * v)), int(min(255, 1.33 * v))
    e = cv2.Canny(g, lo, hi, L2gradient=True) > 0
    return e & mask


FOV = float(opt('--fov', 0)) or None      # 截圖的垂直視角（度），有給就把鏡頭差換算成「FOV、左右、上下要改幾度」


def sparse_edges(rgb, keep=0.07):
    """固定密度的邊緣（梯度最強的 7%）：兩張圖的邊緣一樣多，F 分數才不會因為一張比較雜就虛高。"""
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (0, 0), 1.5)
    mag = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    hi = float(np.percentile(mag[mask], 100 * (1 - keep * 0.6)))
    e = cv2.Canny(g, 0.5 * hi, hi, L2gradient=True) > 0
    return e & mask


NB = 12   # 方向分 12 格（每格 15°）


def long_lines(rgb):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    L = cv2.createLineSegmentDetector().detect(g)[0]
    img = np.zeros((H, W), np.uint8); ori = np.zeros((NB, H, W), np.uint8); segs = []
    if L is not None:
        minlen = 0.04 * np.hypot(W, H)
        for x1, y1, x2, y2 in np.asarray(L).reshape(-1, 4):
            if np.hypot(x2 - x1, y2 - y1) < minlen: continue
            k = int((np.degrees(np.arctan2(y2 - y1, x2 - x1)) % 180) / (180 / NB)) % NB
            p1, p2 = (int(x1), int(y1)), (int(x2), int(y2))
            cv2.line(img, p1, p2, 255, 1); cv2.line(ori[k], p1, p2, 255, 1); segs.append([float(x1), float(y1), float(x2), float(y2)])
    return (img > 0) & mask, (ori > 0) & mask[None], segs


def fscore(a, b, tol):
    """a＝參考的邊緣、b＝截圖的邊緣；容許 tol 像素。"""
    if a.sum() == 0 or b.sum() == 0: return 0.0, 0.0, 0.0
    da = cv2.distanceTransform((~a).astype(np.uint8), cv2.DIST_L2, 3)
    db = cv2.distanceTransform((~b).astype(np.uint8), cv2.DIST_L2, 3)
    prec = float((da[b] <= tol).mean()); rec = float((db[a] <= tol).mean())
    return prec, rec, (2 * prec * rec / (prec + rec) if prec + rec else 0.0)


def ori_dt(o):
    """每個方向一張距離圖；相鄰方向也算（±15°）。"""
    dts = [cv2.distanceTransform((~o[k]).astype(np.uint8), cv2.DIST_L2, 3) for k in range(NB)]
    return [np.minimum(np.minimum(dts[k], dts[(k - 1) % NB]), dts[(k + 1) % NB]) for k in range(NB)]


def ofscore(oa, ob, tol, dta=None, dtb=None):
    """有方向的直線 F：位置在 tol 內、而且方向差 ≤ 15° 才算對上（牆角對牆角、木條對木條）。"""
    dta = dta or ori_dt(oa); dtb = dtb or ori_dt(ob)
    hit_b = sum(int((dta[k][ob[k]] <= tol).sum()) for k in range(NB)); nb = int(ob.sum())
    hit_a = sum(int((dtb[k][oa[k]] <= tol).sum()) for k in range(NB)); na = int(oa.sum())
    if not na or not nb: return 0.0, 0.0, 0.0
    p, r = hit_b / nb, hit_a / na
    return p, r, (2 * p * r / (p + r) if p + r else 0.0)


def warp(img, s, dx, dy, cx=None, cy=None):
    cx = W / 2 if cx is None else cx; cy = H / 2 if cy is None else cy
    M = np.float32([[s, 0, (1 - s) * cx + dx], [0, s, (1 - s) * cy + dy]])
    return cv2.warpAffine(img.astype(np.uint8), M, (W, H), flags=cv2.INTER_NEAREST) > 0


def vanishing_point(segs, rng=np.random.RandomState(7)):
    """主要消失點（RANSAC）：不算接近垂直（±12°）、接近水平（±4°）的線（一點透視裡它們和畫面平行）。
    回傳 (x, y)（像素）、支持的線長比例；找不到回傳 None。"""
    S_ = []
    for x1, y1, x2, y2 in segs:
        a = np.degrees(np.arctan2(y2 - y1, x2 - x1)) % 180
        if abs(a - 90) < 12 or a < 4 or a > 176: continue
        S_.append((x1, y1, x2, y2))
    if len(S_) < 4: return None
    S_ = np.array(S_); P1 = np.c_[S_[:, :2], np.ones(len(S_))]; P2 = np.c_[S_[:, 2:], np.ones(len(S_))]
    Lh = np.cross(P1, P2); ln = np.hypot(S_[:, 2] - S_[:, 0], S_[:, 3] - S_[:, 1]); mid = (S_[:, :2] + S_[:, 2:]) / 2
    d = (S_[:, 2:] - S_[:, :2]) / ln[:, None]

    def support(v):
        to = v[None, :] - mid; to /= np.maximum(np.linalg.norm(to, axis=1, keepdims=True), 1e-9)
        c = np.abs((to * d).sum(1)); return c > np.cos(np.radians(2.0))
    best, bw = None, 0
    for _ in range(600):
        i, j = rng.choice(len(S_), 2, replace=False); v = np.cross(Lh[i], Lh[j])
        if abs(v[2]) < 1e-9: continue
        v = v[:2] / v[2]
        if not (-1.5 * W < v[0] < 2.5 * W and -1.5 * H < v[1] < 2.5 * H): continue   # 只找畫面附近的（一點、兩點透視的主消失點）
        inl = support(v); w_ = ln[inl].sum()
        if w_ > bw: bw, best = w_, (v, inl)
    if best is None: return None
    v, inl = best
    A_ = Lh[inl, :2] / np.linalg.norm(Lh[inl, :2], axis=1, keepdims=True); b_ = -Lh[inl, 2] / np.linalg.norm(Lh[inl, :2], axis=1)
    try: v = np.linalg.lstsq(A_ * ln[inl, None], b_ * ln[inl], rcond=None)[0]
    except Exception: pass
    return float(v[0]), float(v[1]), float(bw / ln.sum()), int(inl.sum())


def vertical_tilt(segs):
    """接近垂直的線：左半邊、右半邊的平均傾斜（度）。兩邊往內收＝鏡頭往下看（或往上看）；真的垂直＝鏡頭水平。"""
    L_, R_ = [], []
    for x1, y1, x2, y2 in segs:
        if y2 < y1: x1, y1, x2, y2 = x2, y2, x1, y1
        a = np.degrees(np.arctan2(x2 - x1, y2 - y1))
        if abs(a) > 12: continue
        (L_ if (x1 + x2) / 2 < W / 2 else R_).append((a, np.hypot(x2 - x1, y2 - y1)))
    f = lambda Z: float(np.average([z[0] for z in Z], weights=[z[1] for z in Z])) if Z else None
    return f(L_), f(R_)


tol = max(2.0, 0.012 * W)
eR, eS = edges(R), edges(S)                       # 給「東西多不多」用（絕對密度）
xR, xS = sparse_edges(R), sparse_edges(S)         # 給 F 分數用（固定密度）
lR, oR, segR = long_lines(R); lS, oS, segS = long_lines(S)
pe, re_, fe = fscore(xR, xS, tol)
dtR = ori_dt(oR)
pl, rl, fl = ofscore(oR, oS, tol, dta=dtR)

# 偶然對上多少：把截圖左右、上下各移 25%，分數會掉多少（真的同角度，移開以後分數應該掉很多）
decoy = []
for dx, dy in ((0.25 * W, 0), (-0.25 * W, 0), (0, 0.25 * H), (0, -0.25 * H)):
    od = np.stack([warp(oS[k], 1.0, dx, dy) for k in range(NB)])
    decoy.append(ofscore(oR, od, tol, dta=dtR)[2])
lift = fl - float(np.mean(decoy))

# 消失點、垂直線
vpR, vpS = vanishing_point(segR), vanishing_point(segS)
tR, tS = vertical_tilt(segR), vertical_tilt(segS)

# 最佳對位（以參考圖的消失點為縮放中心；找不到消失點就用畫面中心）：鏡頭差多少
cx, cy = (vpR[0], vpR[1]) if vpR and 0 <= vpR[0] <= W and 0 <= vpR[1] <= H else (W / 2, H / 2)
dL = dtR


def score(s, dx, dy):
    tot, n = 0.0, 0
    for k in range(NB):
        w = warp(oS[k], s, dx, dy, cx, cy)
        if w.any(): tot += float(np.minimum(dL[k][w], 3 * tol).sum()); n += int(w.sum())
    return tot / n if n > 50 else 1e9


best = (1e9, 1.0, 0.0, 0.0)
for s in np.linspace(0.80, 1.20, 9):
    for dx in np.linspace(-0.12 * W, 0.12 * W, 9):
        for dy in np.linspace(-0.12 * H, 0.12 * H, 7):
            c = score(s, dx, dy)
            if c < best[0]: best = (c, float(s), float(dx), float(dy))
for step_s, step_x, step_y in ((0.025, 0.015 * W, 0.02 * H), (0.01, 0.005 * W, 0.007 * H)):
    _, s0, x0_, y0_ = best
    for s in s0 + step_s * np.arange(-2, 3):
        for dx in x0_ + step_x * np.arange(-2, 3):
            for dy in y0_ + step_y * np.arange(-2, 3):
                c = score(s, dx, dy)
                if c < best[0]: best = (c, float(s), float(dx), float(dy))
_, bs, bdx, bdy = best
oS_al = np.stack([warp(oS[k], bs, bdx, bdy, cx, cy) for k in range(NB)]); eS_al = warp(eS, bs, bdx, bdy, cx, cy)
pla, rla, fla = ofscore(oR, oS_al, tol, dta=dtR)
cam_fix = None
if FOV:
    f_px = (H / 2) / np.tan(np.radians(FOV / 2))
    new_fov = float(np.degrees(2 * np.arctan(np.tan(np.radians(FOV / 2)) / bs)))
    cam_fix = {'fov_now': FOV, 'fov_suggest_from_scale': round(new_fov, 1),
               'note': '先對消失點（左右、上下），對好以後再看縮放：縮放 s＜1＝截圖要縮小才對得上＝遊戲 FOV 太窄。兩者混在一起時縮放不可靠。'}
    if vpR and vpS:
        ang = lambda vp: (float(np.degrees(np.arctan((vp[0] - W / 2) / f_px))), float(np.degrees(np.arctan((H / 2 - vp[1]) / f_px))))
        (ayR, apR), (ayS, apS) = ang(vpR), ang(vpS)
        cam_fix.update({'ref_axis_right_of_center_deg': round(ayR, 2), 'ref_pitch_down_deg': round(apR, 2),
                        'shot_axis_right_of_center_deg': round(ayS, 2), 'shot_pitch_down_deg': round(apS, 2),
                        'turn_left_deg': round(ayR - ayS, 2), 'pitch_down_more_deg': round(apR - apS, 2),
                        'how': '假設參考圖和截圖的 FOV 一樣（--fov）。消失點＝房間主軸的方向：參考圖的消失點在右邊＝參考的鏡頭偏左看；在上面＝鏡頭往下看（或移軸）。turn_left 正＝遊戲鏡頭要往左轉；pitch_down_more 正＝要再往下看。參考圖的垂直線幾乎平行、消失點卻偏高＝移軸（three.js camera.setViewOffset、Blender camera shift_y），不要用俯角。'})

# 大形狀的 SSIM（模糊掉貼圖細節）
gR = cv2.GaussianBlur(cv2.cvtColor(R, cv2.COLOR_RGB2GRAY), (0, 0), 4)
gS = cv2.GaussianBlur(cv2.cvtColor(S, cv2.COLOR_RGB2GRAY), (0, 0), 4)
ssim_map = structural_similarity(gR, gS, data_range=255, full=True)[1]
ssim = float(ssim_map[mask].mean())

# 各區顏色：3×3 格的 Lab
labR = cv2.cvtColor(R, cv2.COLOR_RGB2LAB).astype(np.float32); labS = cv2.cvtColor(S, cv2.COLOR_RGB2LAB).astype(np.float32)
for L_ in (labR, labS): L_[..., 0] *= 100 / 255; L_[..., 1:] -= 128
reg = []
for i in range(3):
    for j in range(3):
        sl = (slice(i * H // 3, (i + 1) * H // 3), slice(j * W // 3, (j + 1) * W // 3)); m = mask[sl]
        a, b = labR[sl][m], labS[sl][m]
        dE = float(np.linalg.norm(a.mean(0) - b.mean(0)))
        ha = np.histogram2d(a[:, 1], a[:, 2], bins=16, range=[[-60, 60], [-60, 60]])[0]; hb = np.histogram2d(b[:, 1], b[:, 2], bins=16, range=[[-60, 60], [-60, 60]])[0]
        inter = float(np.minimum(ha / ha.sum(), hb / hb.sum()).sum())
        reg.append({'cell': f'{i},{j}', 'dE_mean': round(dE, 1), 'ab_hist_intersection': round(inter, 2)})

# 細節密度：6×4 格的邊緣密度
GX, GY = 6, 4; gap = []
for i in range(GY):
    for j in range(GX):
        sl = (slice(i * H // GY, (i + 1) * H // GY), slice(j * W // GX, (j + 1) * W // GX))
        dr, ds = float(eR[sl].mean()), float(eS[sl].mean())
        gap.append({'cell': f'{i},{j}', 'ref': round(dr, 3), 'shot': round(ds, 3), 'ratio': round((dr + 0.005) / (ds + 0.005), 2)})

MODE = opt('--mode', 'shop')


def warp_img(img, s_, dx, dy, cx_, cy_):
    M = np.float32([[s_, 0, (1 - s_) * cx_ + dx], [0, s_, (1 - s_) * cy_ + dy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def fine_edges(rgb, keep=0.10):
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (0, 0), 1.0)
    mag = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    hi = float(np.percentile(mag, 100 * (1 - keep * 0.6)))
    return cv2.Canny(g, 0.5 * hi, hi, L2gradient=True) > 0


def skyline(rgb):
    """每一欄從上往下第一個「不是天空」的位置（比例 0～1）；那一欄最上面就不是天空＝NaN。"""
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32); r, g_, b = [rgb[..., k].astype(np.float32) for k in range(3)]
    sky = ((b > r + 8) & (hsv[..., 2] > 120)) | ((hsv[..., 2] > 215) & (hsv[..., 1] < 40))
    sky = cv2.morphologyEx(sky.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    prof = np.full(W, np.nan)
    for x in range(W):
        col = sky[:, x]
        if not col[:4].all(): continue
        nz = np.flatnonzero(~col)
        prof[x] = (nz[0] if len(nz) else H) / H
    return prof


def period(profile, lo=4, hi=None):
    """一維訊號的主週期：先去掉大範圍的亮暗變化（高通），再找自相關「第一個谷之後最高的峰」＝開窗、柱距的節奏。"""
    from scipy.ndimage import gaussian_filter1d
    hi = hi or len(profile) // 4
    p = profile - gaussian_filter1d(profile, max(3, len(profile) / 40))
    if np.allclose(p, 0): return None
    ac = np.correlate(p, p, 'full')[len(p) - 1:]; ac /= ac[0]
    k0 = lo
    while k0 < hi - 1 and ac[k0 + 1] < ac[k0]: k0 += 1          # 走到第一個谷
    if k0 >= hi - 2: return None
    k = int(np.argmax(ac[k0:hi])) + k0
    return float(k) if ac[k] > 0.1 else None


def campus_analysis():
    cx_, cy_ = cx, cy
    Sal = warp_img(S, bs, bdx, bdy, cx_, cy_)                       # 截圖照最佳 2D 對位移到參考圖上（對細部用）
    fR, fS = fine_edges(R) & mask, fine_edges(Sal) & mask
    # ①相似：大體量（重模糊 SSIM）、開窗節奏（垂直邊緣的柱距、水平邊緣的樓層）、各區材質（色差＋紋理強度）
    gR8 = cv2.GaussianBlur(cv2.cvtColor(R, cv2.COLOR_RGB2GRAY), (0, 0), 8); gS8 = cv2.GaussianBlur(cv2.cvtColor(Sal, cv2.COLOR_RGB2GRAY), (0, 0), 8)
    mass = float(structural_similarity(gR8, gS8, data_range=255, full=True)[1][mask].mean())
    def rhythm(img):
        g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY), (0, 0), 1.0).astype(np.float32)
        vx = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0))[H // 5:4 * H // 5].mean(0); hy = np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1))[:, W // 5:4 * W // 5].mean(1)
        return period(vx), period(hy, 6, H // 3)
    (pxR, pyR), (pxS, pyS) = rhythm(R), rhythm(Sal)
    def texE(img):
        g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32); return np.abs(cv2.Laplacian(cv2.GaussianBlur(g, (0, 0), 0.8), cv2.CV_32F))
    tR_, tS_ = texE(R), texE(Sal)
    labA = cv2.cvtColor(Sal, cv2.COLOR_RGB2LAB).astype(np.float32); labA[..., 0] *= 100 / 255; labA[..., 1:] -= 128
    mats = []
    for i in range(3):
        for j in range(3):
            sl = (slice(i * H // 3, (i + 1) * H // 3), slice(j * W // 3, (j + 1) * W // 3)); m = mask[sl]
            dE = float(np.linalg.norm(labR[sl][m].mean(0) - labA[sl][m].mean(0))); tr = float((tS_[sl][m].mean() + 1) / (tR_[sl][m].mean() + 1))
            mats.append({'cell': f'{i},{j}', 'dE': round(dE, 1), 'texture_ratio': round(tr, 2), 'ok': dE <= 15 and 0.6 <= tr <= 1.6})
    # ②疑似照抄：參考圖切 8×6 格，每格在截圖裡（不靠整體對位）±12% 範圍、縮放 0.9／1.0／1.1 找最像的位置（邊緣圖的正規化相關），
    #   再量那個位置的細邊緣 1.5 px 內 F 分數。兩個都高＝窗型、裝飾、輪廓幾乎 1:1。
    GX2, GY2 = 8, 6; flags = []; cells = []
    tolf = max(1.5, 0.0025 * W)
    fS0 = fine_edges(S) & mask
    bR = cv2.GaussianBlur(fR.astype(np.float32), (0, 0), 1.2)
    shots_ = []
    for sc in (0.9, 1.0, 1.1):
        e = cv2.resize(fS0.astype(np.uint8), (int(W * sc), int(H * sc)), interpolation=cv2.INTER_NEAREST) > 0
        shots_.append((sc, e, cv2.GaussianBlur(e.astype(np.float32), (0, 0), 1.2)))
    for i in range(GY2):
        for j in range(GX2):
            y0_, y1_, x0_, x1_ = i * H // GY2, (i + 1) * H // GY2, j * W // GX2, (j + 1) * W // GX2
            a_ = fR[y0_:y1_, x0_:x1_]; da = float(a_.mean())
            if da < 0.03 or not mask[y0_:y1_, x0_:x1_].mean() > 0.5: cells.append(None); continue
            T = bR[y0_:y1_, x0_:x1_]; best_ = (-1, None)
            for sc, e, be in shots_:
                cx2, cy2 = (x0_ + x1_) / 2 * sc, (y0_ + y1_) / 2 * sc; hw, hh = (x1_ - x0_) / 2 + 0.12 * W, (y1_ - y0_) / 2 + 0.12 * H
                X0, X1 = int(max(0, cx2 - hw)), int(min(be.shape[1], cx2 + hw)); Y0, Y1 = int(max(0, cy2 - hh)), int(min(be.shape[0], cy2 + hh))
                if X1 - X0 < T.shape[1] or Y1 - Y0 < T.shape[0]: continue
                res = cv2.matchTemplate(be[Y0:Y1, X0:X1], T, cv2.TM_CCOEFF_NORMED); _, mv, _, ml = cv2.minMaxLoc(res)
                if mv > best_[0]: best_ = (float(mv), (sc, X0 + ml[0], Y0 + ml[1], e))
            if best_[1] is None: cells.append(None); continue
            ncc, (sc, bx, by, e) = best_
            b_ = e[by:by + (y1_ - y0_), bx:bx + (x1_ - x0_)]
            if b_.shape != a_.shape or b_.mean() < 0.02: cells.append({'cell': f'{i},{j}', 'F_fine': 0.0, 'ncc': round(ncc, 2), 'edge_density_ref': round(da, 3)}); continue
            da_ = cv2.distanceTransform((~a_).astype(np.uint8), cv2.DIST_L2, 3); db_ = cv2.distanceTransform((~b_).astype(np.uint8), cv2.DIST_L2, 3)
            pr_, rc_ = float((da_[b_] <= tolf).mean()), float((db_[a_] <= tolf).mean()); F_ = 2 * pr_ * rc_ / (pr_ + rc_) if pr_ + rc_ else 0
            c = {'cell': f'{i},{j}', 'F_fine': round(F_, 2), 'ncc': round(ncc, 2), 'edge_density_ref': round(da, 3),
                 'found_at': {'scale': sc, 'dx_pct': round((bx / sc - x0_) / W * 100, 1), 'dy_pct': round((by / sc - y0_) / H * 100, 1)}}
            cells.append(c)
            if F_ >= CF and ncc >= CN: flags.append(c)
    skR, skS = skyline(R), skyline(Sal)
    ok = ~np.isnan(skR) & ~np.isnan(skS); sky = None
    if ok.mean() > 0.3:
        from scipy.ndimage import gaussian_filter1d
        fill = lambda p_: np.interp(np.arange(W), np.flatnonzero(~np.isnan(p_)), p_[~np.isnan(p_)])
        aR, aS = fill(skR), fill(skS); dR_, dS_ = aR - gaussian_filter1d(aR, 25), aS - gaussian_filter1d(aS, 25)
        dR_, dS_ = dR_[ok], dS_[ok]; corr = float(np.corrcoef(dR_, dS_)[0, 1]) if dR_.std() > 1e-4 and dS_.std() > 1e-4 else 0.0
        rmse = float(np.sqrt(np.mean((skR[ok] - skS[ok]) ** 2)))
        sky = {'columns_with_sky': round(float(ok.mean()), 2), 'detail_corr': round(corr, 2), 'rmse_frac_H': round(rmse, 4), 'detail_std_ref': round(float(dR_.std()), 4),
               'copy_flag': bool(corr >= 0.8 and rmse <= 0.025 and dR_.std() > 0.003)}
    rr = lambda a_, b_: round(b_ / a_, 2) if a_ and b_ else None
    return {'mass_ssim': round(mass, 3),
            'rhythm': {'bay_px_ref': pxR, 'bay_px_shot': pxS, 'bay_ratio': rr(pxR, pxS), 'floor_px_ref': pyR, 'floor_px_shot': pyS, 'floor_ratio': rr(pyR, pyS)},
            'material_cells_ok': sum(m['ok'] for m in mats), 'material': mats,
            'copy_cells': flags, 'cells_checked': sum(c is not None for c in cells), 'cells': cells, 'skyline': sky,
            'thresholds': {'copy_F_fine': CF, 'copy_ncc': CN, 'tol_px': round(tolf, 2)},
            '_skR': skR, '_skS': skS, '_Sal': Sal, '_fR': fR, '_fS': fS}


CF, CN = float(opt('--copyF', 0.6)), float(opt('--copyN', 0.55))
campus = campus_analysis() if MODE == 'campus' else None

vp_d = None
if vpR and vpS: vp_d = float(np.hypot((vpR[0] - vpS[0]) / W, (vpR[1] - vpS[1]) / H) * 100)
tilt_d = None
if all(v is not None for v in (tR[0], tR[1], tS[0], tS[1])): tilt_d = max(abs(tR[0] - tS[0]), abs(tR[1] - tS[1]))
# 判定：鏡頭三項＋內容一項是門檻；直線 F、lift、縮放只當參考（2026-11-04 青木茶室四組實測：AI 參考圖細節多很多，直線 F 普遍偏低；
# 2D 縮放找不出「房間深度不一樣」這種透視差，見 REPORT）
checks = [
    ('[鏡頭] 消失點位置差 ≤ 2%（左右、上下看的方向一樣）', vp_d is not None and vp_d <= 2, f'{vp_d:.1f}%' if vp_d is not None else '找不到消失點'),
    ('[鏡頭] 垂直線傾斜差 ≤ 1.5°（俯仰／移軸一樣）', tilt_d is not None and tilt_d <= 1.5, f'{tilt_d:.1f}°' if tilt_d is not None else '垂直線不夠'),
    ('[鏡頭] 畫面比例相同（±3%）', abs(ar_ref / ar_shot - 1) <= 0.03, f'參考 {ar_ref:.3f}｜截圖 {ar_shot:.3f}'),
    ('[內容] 參考圖東西多很多（邊緣密度比 > 1.8）的格子 ≤ 3／24', sum(g['ratio'] > 1.8 for g in gap) <= 3, f"{sum(g['ratio'] > 1.8 for g in gap)} 格"),
]
if campus:   # D136：校園建築不要求細部一樣；「東西多不多」不當門檻，改成「相似」三項＋「不能照抄」一項
    rh = campus['rhythm']; sk = campus['skyline']
    checks = checks[:3] + [
        ('[相似] 大體量 SSIM（重模糊）≥ 0.50', campus['mass_ssim'] >= 0.5, f"{campus['mass_ssim']:.2f}"),
        ('[相似] 材質區塊（色差 ≤ 15、紋理強度 0.6～1.6 倍）≥ 5／9', campus['material_cells_ok'] >= 5, f"{campus['material_cells_ok']}／9"),
        ('[不能照抄] 細部 1:1 重疊的格子 = 0，屋頂輪廓不是 1:1', not campus['copy_cells'] and not (sk and sk['copy_flag']),
         f"疑似照抄 {len(campus['copy_cells'])}／{campus['cells_checked']} 格" + (f"；屋頂輪廓細部相關 {sk['detail_corr']}、誤差 {sk['rmse_frac_H'] * 100:.1f}%" + ('（疑似照抄）' if sk['copy_flag'] else '') if sk else '；看不到天際線')),
    ]
info = [
    ('（參考）line_F 有方向的長直線', f'{fl:.2f}；移開 25% 的平均 {np.mean(decoy):.2f}；lift {lift:+.2f}；最佳 2D 對位後 {fla:.2f}'),
    ('（參考）ssim_struct 大形狀', f'{ssim:.2f}'),
    ('（參考）最佳 2D 對位', f'縮放 {bs:.2f}、平移 {bdx / W * 100:+.1f}%／{bdy / H * 100:+.1f}%（消失點對好以後還差很多＝房間比例／深度不一樣，不是鏡頭）'),
]
if campus: info.append(('（參考）開窗／柱距、樓層節奏（自相關；透視大的畫面不準）', f"柱距 {campus['rhythm']['bay_px_ref']}→{campus['rhythm']['bay_px_shot']} px；樓層 {campus['rhythm']['floor_px_ref']}→{campus['rhythm']['floor_px_shot']} px"))
rep = {'ref': ref_p, 'shot': shot_p, 'size': [W, H], 'tol_px': round(tol, 1),
       'edge': {'precision': round(pe, 3), 'recall': round(re_, 3), 'F': round(fe, 3)},
       'line': {'precision': round(pl, 3), 'recall': round(rl, 3), 'F': round(fl, 3), 'n_ref': len(segR), 'n_shot': len(segS)},
       'line_after_best_shift': {'F': round(fla, 3)}, 'lift_vs_shifted_decoys': round(lift, 3), 'decoy_F': [round(x, 3) for x in decoy],
       'vanishing_point': {'ref': [round(vpR[0] / W, 3), round(vpR[1] / H, 3), round(vpR[2], 2)] if vpR else None, 'shot': [round(vpS[0] / W, 3), round(vpS[1] / H, 3), round(vpS[2], 2)] if vpS else None, 'diff_pct': round(vp_d, 2) if vp_d is not None else None, 'note': '[x/寬, y/高, 支持的線長比例]'},
       'vertical_tilt_deg': {'ref_left_right': tR, 'shot_left_right': tS, 'note': '線往下走時往右偏為正。左正右負＝往下收攏＝鏡頭往下看；左負右正＝鏡頭往上看；兩邊都≈0＝鏡頭水平（或參考圖用了移軸／AI 圖常見）'},
       'camera_fix': cam_fix,
       'best_shift': {'scale': round(bs, 3), 'dx_pct': round(bdx / W * 100, 1), 'dy_pct': round(bdy / H * 100, 1)},
       'ssim_struct': round(ssim, 3), 'region_color': reg, 'detail_gap': gap,
       'mode': MODE, 'campus': ({k: v for k, v in campus.items() if not k.startswith('_')} if campus else None),
       'checks': [{'name': n, 'ok': bool(o), 'info': i} for n, o, i in checks], 'info': [{'name': n, 'value': v} for n, v in info], 'vertical_tilt_diff_deg': tilt_d, 'pass_all': all(o for _, o, _ in checks)}
json.dump(rep, open(pre + '_structure.json', 'w'), ensure_ascii=False, indent=1)
for n, o, i in checks: print(('PASS ' if o else 'FAIL ') + n + '　' + i)
for n, v in info: print('     ' + n + '　' + v)
print('line F 對位後', round(fla, 3), '｜edge F（固定密度）', round(fe, 2), '｜消失點 參考', rep['vanishing_point']['ref'], '截圖', rep['vanishing_point']['shot'], '｜垂直線傾斜 參考', tR, '截圖', tS)
if cam_fix: print('鏡頭建議', cam_fix)
if campus:
    print('校園模式（D136）：相似要接近，照抄要是 0。疑似照抄的格子：', [(c['cell'], c['F_fine'], c['ncc']) for c in campus['copy_cells']], '｜屋頂', campus['skyline'])
    print('開窗節奏', campus['rhythm'], '｜材質', campus['material_cells_ok'], '/9', '｜最高的格子 F/ncc', max([(c['F_fine'], c['ncc']) for c in campus['cells'] if c] or [None]))
if campus:
    sim_ok = all(o for _, o, _ in checks[:-1]); n_copy = len(campus['copy_cells']) + (1 if campus['skyline'] and campus['skyline']['copy_flag'] else 0)
    print(('相似：PASS' if sim_ok else '相似：FAIL（' + '、'.join(n.split('（')[0] for n, o, _ in checks[:-1] if not o) + '）') + '｜' + ('照抄檢查：0（沒有 1:1 的細部）' if not n_copy else f'照抄檢查：REVIEW_COPY {n_copy} 處，請人看橘框'))
else:
    print('ALL PASS' if rep['pass_all'] else 'FAILED')


# ---- 圖 ----
def edge_rgb(a, b, base):
    o = (base.astype(np.float32) * 0.35).astype(np.uint8)
    o[a & ~b] = (255, 60, 60); o[b & ~a] = (0, 220, 255); o[a & b] = (255, 255, 255)
    return o


K2 = np.ones((2, 2), np.uint8)
ka = cv2.dilate(lR.astype(np.uint8), K2) > 0
kb = cv2.dilate(lS.astype(np.uint8), K2) > 0
kb2 = cv2.dilate(oS_al.any(0).astype(np.uint8), K2) > 0
blend = (R.astype(np.float32) * 0.5 + S.astype(np.float32) * 0.5).astype(np.uint8)
gapimg = (R.astype(np.float32) * 0.6 + S.astype(np.float32) * 0.4).astype(np.uint8)
tiles = [R, S, edge_rgb(ka, kb, blend), blend, edge_rgb(ka, kb2, blend), gapimg]
if campus:
    fR_d = cv2.dilate(campus['_fR'].astype(np.uint8), K2) > 0; fS_d = cv2.dilate(campus['_fS'].astype(np.uint8), K2) > 0
    cblend = (R.astype(np.float32) * 0.5 + campus['_Sal'].astype(np.float32) * 0.5).astype(np.uint8)
    tiles[4] = edge_rgb(fR_d, fS_d, cblend); tiles[5] = (R.astype(np.float32) * 0.55 + campus['_Sal'].astype(np.float32) * 0.45).astype(np.uint8)
labels = ['參考圖（黃十字＝消失點）', '截圖（黃十字＝消失點）', '長直線疊圖 紅=只有參考 青=只有截圖 白=都有', '50% 疊圖', f'最佳對位後（縮放 {bs:.2f}、平移 {bdx / W * 100:+.0f}%/{bdy / H * 100:+.0f}%）', '紅框＝參考圖東西多很多的格子']
if campus: labels[4], labels[5] = '對位後的細部邊緣（白＝重疊）', '橘框＝疑似照抄（細部 1:1）／線＝屋頂輪廓 紅參考 青截圖'
out = Image.new('RGB', (W * 3, (H + 24) * 2 + 60), 'white'); d = ImageDraw.Draw(out)
for k, (t, lb) in enumerate(zip(tiles, labels)):
    x, y = (k % 3) * W, (k // 3) * (H + 24)
    out.paste(Image.fromarray(t), (x, y + 24)); d.text((x + 6, y + 3), lb, fill=(0, 0, 0), font=FONT)
for k, vp in ((0, vpR), (1, vpS), (2, vpR), (2, vpS)):
    if vp and 0 <= vp[0] <= W and 0 <= vp[1] <= H:
        px, py = k * W + vp[0], 24 + vp[1]; col = (255, 230, 0) if k < 2 or vp is vpR else (0, 255, 120)
        d.line([px - 12, py, px + 12, py], fill=col, width=3); d.line([px, py - 12, px, py + 12], fill=col, width=3)
x0, y0 = 2 * W, H + 24 + 24
if campus:
    GX2, GY2 = 8, 6
    for c in campus['copy_cells']:
        i, j = map(int, c['cell'].split(','))
        d.rectangle([x0 + j * W // GX2 + 2, y0 + i * H // GY2 + 2, x0 + (j + 1) * W // GX2 - 2, y0 + (i + 1) * H // GY2 - 2], outline=(255, 140, 0), width=3)
        d.text((x0 + j * W // GX2 + 5, y0 + i * H // GY2 + 4), f"F{c['F_fine']:.2f}", fill=(255, 140, 0), font=FONT)
    for prof, col in ((campus['_skR'], (255, 60, 60)), (campus['_skS'], (0, 220, 255))):
        pts = [(x0 + x, y0 + prof[x] * H) for x in range(W) if not np.isnan(prof[x])]
        if len(pts) > 1: d.point(pts, fill=col)
    gap = []   # 校園模式不畫「東西多不多」的紅框
for gi, g in enumerate(gap):
    i, j = map(int, g['cell'].split(','))
    if g['ratio'] > 1.8:
        d.rectangle([x0 + j * W // GX + 2, y0 + i * H // GY + 2, x0 + (j + 1) * W // GX - 2, y0 + (i + 1) * H // GY - 2], outline=(255, 0, 0), width=3)
        d.text((x0 + j * W // GX + 6, y0 + i * H // GY + 6), f"×{g['ratio']:.1f}", fill=(255, 0, 0), font=FONT)
summ = (f"line_F {fl:.2f}（lift {lift:+.2f}、對位後 {fla:.2f}）｜消失點差 {vp_d if vp_d is None else round(vp_d, 1)}%｜ssim {ssim:.2f}｜鏡頭：縮放 {bs:.2f}、平移 {bdx / W * 100:+.1f}%/{bdy / H * 100:+.1f}%｜"
        + ('ALL PASS' if rep['pass_all'] else 'FAILED：' + '、'.join(n.split('（')[0] for n, o, _ in checks if not o)))
if campus:
    sim_ok = all(o for _, o, _ in checks[:-1]); n_copy = len(campus['copy_cells']) + (1 if campus['skyline'] and campus['skyline']['copy_flag'] else 0)
    summ = (f"校園模式（D136）｜大體量 {campus['mass_ssim']:.2f}｜材質 {campus['material_cells_ok']}/9｜" + ('相似 PASS' if sim_ok else '相似 FAIL') + '｜'
            + (f'疑似照抄 {n_copy} 處（橘框，請人看）' if n_copy else '疑似照抄 0'))
d.text((8, (H + 24) * 2 + 18), summ, fill=(0, 110, 0) if rep['pass_all'] else (200, 0, 0), font=FONT)
out.save(pre + '_overlay.jpg', quality=85)
print('寫出', pre + '_overlay.jpg', pre + '_structure.json')
