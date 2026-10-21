#!/usr/bin/env python3
"""CG-10 五年後的窗邊長桌：基底圖＋人物圖層合成 8 張（assets/cg/epilogue/cg_reunion_<id>.webp，1672×941）。

來源：企劃線 docs/story_planning/cg_approved/ 的 cg_reunion_window_table_base.webp 和 8 張 cg_reunion_window_table_layer_<id>.webp
（使用者用 AI 生成、BB 2026-10-14 檢查通過 ART_APPROVED）。參數照 cg_approved/README.md 每個圖層 BB 試合成寫的：
縮放倍數、左上角位置、調暖 RGB ×(1.00, 0.84, 0.64)、亮度 ×0.88（阿凱的圖層本來就是暖光，不調）、去掉原圖 y 以下的桌子、
保留以安的手帳／學姊的保溫瓶、合成後把基底圖的冰咖啡蓋回人物前面。

做法：
  1. 去背：圖層是單一淺灰底。Lab 色差 < 9 而且和上、左、右邊緣連在一起的＝背景；包在裡面的小塊（髮絲之間、手臂和身體之間）
     要夠平、夠接近底色才算背景（白襯衫的陰影不會被挖掉）。飄出來的細髮絲和頭髮本體圍起來的灰底（芷若、語彤、子晴頭髮外側的淺灰楔形）：
     把 4 px 以下的細線當成穿得過去，還是和邊緣連得到、色差中位數 < 5 的也算背景（2026-10-20 加；--debug 的 <名字>_holes.png 紅色＝挖掉的）。
  2. 邊緣（輪廓內外各 3 px）：用附近確定是人物的顏色 F 和底色 B 估透明度 α＝(C−B)·(F−B)/|F−B|²，再把灰色從邊緣扣掉
     （C＝B＋(C−B)/α）——頭髮邊緣不留灰邊、不是硬邊。髮絲之間離背景 6 px 以內、顏色剛好在底色和頭髮之間的縫：
     用附近的頭髮顏色分解透明度、顏色直接用頭髮的（2026-10-21 加，子晴頭髮外側原本有一層淡灰霧）。
  3. 桌子：原圖 y 以下拿掉（3 px 漸層）；阿凱照桌緣斜切，冰飲、咖啡杯、右邊椅背拿掉，冰飲擋住的襯衫用上面的襯衫鏡射、
     前臂照杯子右邊看得到的那一段前臂的明暗往手腕延伸（fix_kai）。
  4. 調暖 → 預乘 α 縮放（Lanczos）→ 貼到基底圖。
  5. 蓋回基底圖在人物前面的東西：冰咖啡＋杯墊（照輪廓）、前景三個人失焦的頭和肩膀（柔邊）。

用法（先把企劃線的 cg_approved/ 拿出來）：
  git archive --format=tar -o /tmp/cg.tar origin/claude/magical-albattani-bk7b4n docs/story_planning/cg_approved
  mkdir /tmp/cg && tar -xf /tmp/cg.tar -C /tmp/cg
  python3 tools/cg/compose_reunion.py /tmp/cg/docs/story_planning/cg_approved assets/cg/epilogue [--sheet 對照圖.png] [--debug 目錄]
只用 numpy＋Pillow。 """
import os
import sys
import numpy as np
from PIL import Image, ImageDraw

W, H = 1672, 941
WARM = np.array([1.00, 0.84, 0.64], np.float32) * 0.88   # BB 試合成：RGB 各乘 (1.00, 0.84, 0.64)、亮度 ×0.88

# 每個圖層（cg_approved/README.md 的 BB 試合成參數；座標都是原圖 1672×941 的像素）
LAYERS = {
    'kai': dict(scale=0.56, pos=(896, 127), warm=False,
                cut=((0, 850), (1672, 895))),           # 桌緣是斜的：左邊 y 850、右邊 y 895（冰飲、咖啡杯、椅背另外拿掉）
    'heroine01': dict(scale=0.66, pos=(880, 70), warm=True, cut=832, keep='notebook'),   # 手帳 x 520～1000、y 822～925 留著
    'heroine02': dict(scale=0.62, pos=(900, 60), warm=True, cut=900),
    'heroine03': dict(scale=0.62, pos=(930, 128), warm=True, cut=790),   # 傘在畫面外：CG-10b 的傘物件圖層 cg_approved/ 沒有，沒補
    'heroine04': dict(scale=0.62, pos=(930, 96), warm=True, cut=830),
    'heroine05': dict(scale=0.57, pos=(930, 122), warm=True, cut=868, keep='thermos',    # 保溫瓶 x 405～545、y 605～935 留著
                      keep_at=(1550, 645)),   # 照 BB 的位置保溫瓶會在前景那個人的頭後面（只露出蓋子）：另外立在她右手邊的桌上（底部中心）
    'kexin': dict(scale=0.55, pos=(985, 180), warm=True, cut=795),
    'peishan': dict(scale=0.58, pos=(975, 125), warm=True, cut=845),
}

# 基底圖在人物前面的東西（合成以後蓋回去）
# 冰咖啡：冰塊、咖啡那一段（y 548 以下；杯緣照基底圖的亮度逐列量的：右緣 y 550 → 1505、y 600 → 1499.5、y 672 → 1494）
COFFEE = [(1423.5, 548), (1505.5, 548), (1505, 550), (1503, 570), (1499.5, 600), (1497.5, 630), (1496, 660), (1494, 672), (1491, 677),
          (1434, 677), (1431, 672), (1429, 660), (1427.5, 630), (1427, 600), (1425, 570), (1423.5, 550)]
# 杯口（橢圓，中間 y 528.5、兩側 y 538）到冰塊之間是透明的：只蓋回亮的（杯緣的反光、杯壁、冰塊），其他看得到後面的人
GLASS_TOP = [(1423, 540), (1426, 535), (1435, 531), (1450, 529), (1465, 528.5), (1480, 529), (1495, 531), (1504, 535), (1507, 540),
             (1505.5, 548), (1423.5, 548)]
STRAW = [(1488, 469), (1497, 470), (1486, 549), (1477, 549)]                                                        # 吸管（約 8 px 寬）
COASTER = [(1389, 668), (1420, 658), (1506, 660), (1530, 670), (1516, 681), (1495, 690), (1398, 680)]               # 杯墊
FG_HEAD_MID = [(888, 941), (888, 650), (897, 600), (912, 545), (938, 498), (973, 464), (1015, 446), (1058, 438), (1100, 439),
               (1142, 447), (1180, 466), (1210, 492), (1236, 530), (1255, 578), (1266, 638), (1271, 720), (1282, 800), (1305, 941)]   # 中間前景的人（失焦的頭）
FG_HEAD_RIGHT = [(1672, 270), (1655, 285), (1638, 330), (1628, 390), (1625, 450), (1628, 500), (1636, 545), (1642, 590), (1630, 625),
                 (1608, 642), (1580, 660), (1545, 676), (1505, 690), (1475, 705), (1455, 740), (1440, 800), (1425, 941), (1672, 941)]
# ↑ 右邊前景的人（失焦的頭、肩膀）；椅子的黑色支架（x 1580～1640、y 543～623，清楚的）在人物後面，不算


# ---------------------------------------------------------------- 小工具
def srgb_to_lab(rgb):
    c = rgb / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]], np.float32)
    xyz = (lin @ M.T) / np.array([0.95047, 1.0, 1.08883], np.float32)
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1).astype(np.float32)


def label(mask):
    """4 連通的連通區塊（不用 scipy）：回傳 (labels, sizes)；labels 0＝不在 mask 裡。"""
    h, w = mask.shape
    m = mask.ravel().tolist()
    lab = [0] * (h * w)
    sizes = [0]
    cur = 0
    for s in np.flatnonzero(mask.ravel()).tolist():
        if lab[s]:
            continue
        cur += 1
        lab[s] = cur
        st = [s]
        n = 0
        while st:
            p = st.pop()
            n += 1
            x = p % w
            if x > 0 and m[p - 1] and not lab[p - 1]:
                lab[p - 1] = cur; st.append(p - 1)
            if x < w - 1 and m[p + 1] and not lab[p + 1]:
                lab[p + 1] = cur; st.append(p + 1)
            if p >= w and m[p - w] and not lab[p - w]:
                lab[p - w] = cur; st.append(p - w)
            if p + w < h * w and m[p + w] and not lab[p + w]:
                lab[p + w] = cur; st.append(p + w)
        sizes.append(n)
    return np.array(lab, np.int32).reshape(h, w), np.array(sizes)


def shift_max(b, r):
    """方形視窗的最大值（膨脹）。"""
    out = b.copy()
    h, w = b.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dy == 0 and dx == 0:
                continue
            src = b[max(0, -dy):h - max(0, dy), max(0, -dx):w - max(0, dx)]
            dst = out[max(0, dy):h - max(0, -dy), max(0, dx):w - max(0, -dx)]
            np.maximum(dst, src, out=dst)
    return out


def dilate(m, r):
    return shift_max(m.astype(np.uint8), r).astype(bool)


def erode(m, r):
    return ~dilate(~m, r)


def gauss(a, sigma):
    """可分離高斯（float32；邊緣用邊緣值補）。"""
    r = max(1, int(np.ceil(3 * sigma)))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2).astype(np.float32)
    k /= k.sum()
    out = a.astype(np.float32)
    for axis in (0, 1):
        pad = [(0, 0)] * out.ndim
        pad[axis] = (r, r)
        p = np.pad(out, pad, mode='edge')
        acc = np.zeros_like(out)
        n = out.shape[axis]
        for i, kv in enumerate(k):
            sl = [slice(None)] * out.ndim
            sl[axis] = slice(i, i + n)
            acc += kv * p[tuple(sl)]
        out = acc
    return out


def poly_mask(poly, w=W, h=H, feather=0.0):
    im = Image.new('L', (w, h), 0)
    ImageDraw.Draw(im).polygon(poly, fill=255)
    m = np.asarray(im).astype(np.float32) / 255.0
    return gauss(m, feather) if feather > 0 else m


# ---------------------------------------------------------------- 去背
def background(rgb, lab):
    """底色：上緣、左右兩側（桌子以上）的中位數，再用平面 c0＋c1·x＋c2·y 修正一點點漸層（RGB 和 Lab 各一份）。"""
    h, w = rgb.shape[:2]
    border = np.concatenate([lab[:30].reshape(-1, 3), lab[:600, :30].reshape(-1, 3), lab[:600, -30:].reshape(-1, 3)])
    bg0 = np.median(border, axis=0)
    yy, xx = np.mgrid[0:h, 0:w]
    sel = (np.linalg.norm(lab - bg0, axis=2) < 6) & (yy < 700)
    ys, xs = np.nonzero(sel)
    pick = np.linspace(0, len(ys) - 1, min(len(ys), 40000)).astype(int)
    ys, xs = ys[pick], xs[pick]
    A = np.stack([np.ones_like(xs), xs / w, ys / h], 1).astype(np.float32)
    basis = np.stack([np.ones_like(xx), xx / w, yy / h], -1).astype(np.float32)
    out = []
    for img in (lab, rgb):
        coef, *_ = np.linalg.lstsq(A, img[ys, xs], rcond=None)
        out.append(basis @ coef)
    return out[0], out[1], bg0


def cutout(rgb, name, debug=None):
    """回傳 (rgb 已扣掉灰色, alpha 0..1)。"""
    h, w = rgb.shape[:2]
    lab = srgb_to_lab(rgb)
    bg_lab, bg_rgb, bg0 = background(rgb, lab)
    d = np.linalg.norm(lab - bg_lab, axis=2)
    # 1. 和上、左、右邊緣連在一起、接近底色的＝背景（下緣是桌子，不算）
    near = d < 9
    lbl, sizes = label(near)
    edge_ids = set(np.unique(np.concatenate([lbl[0], lbl[:, 0], lbl[:, -1]])).tolist()) - {0}
    bgmask = np.isin(lbl, list(edge_ids))
    outer = bgmask.copy()
    # 2. 包在裡面的背景（髮絲之間、手臂和身體之間）：
    #    a. 被細的髮絲圍起來的（飄出來的幾根頭髮和頭髮本體之間）：把「細的前景」（腐蝕再膨脹 2 px 就不見的＝寬度 4 px 以下的髮絲）
    #       當成可以穿過，還是和上、左、右邊緣連得到、而且色差中位數 < 5（幾乎就是底色）的＝背景。髮絲本身不是 near，照樣留下。
    #       毛衣、襯衫上剛好接近底色的亮面（色差 8～9）、被粗的東西（皮膚、衣服）圍住的眼白不會被挖掉；
    #    b. 小塊（≤ 3000 px）：色差的中位數 < 5，而且外圍一圈大多是頭髮（暗，L 中位數 < 50）——白襯衫、米色毛衣的陰影外圍是亮的，不會被挖掉；
    #    c. 大塊：要很平（L 的標準差 < 2.5）、平均色差 < 3.5
    fg0 = ~near
    thin = fg0 & ~dilate(erode(fg0, 2), 2)
    lblT, _ = label(near | thin)
    edgeT = set(np.unique(np.concatenate([lblT[0], lblT[:, 0], lblT[:, -1]])).tolist()) - {0}
    reach = np.isin(lblT, list(edgeT))
    lbl2, sizes2 = label(near & ~bgmask)
    holes = 0
    L = lab[..., 0]
    flat = lbl2.ravel()
    pix = np.flatnonzero(flat)
    labs = flat[pix]
    order = np.argsort(labs, kind='stable')
    pix, labs = pix[order], labs[order]
    bounds = np.searchsorted(labs, np.arange(1, len(sizes2) + 1))
    for i in range(1, len(sizes2)):
        if sizes2[i] < 3:
            continue
        ys, xs = np.divmod(pix[bounds[i - 1]:bounds[i]], w)
        y0, y1, x0, x1 = max(0, ys.min() - 3), min(h, ys.max() + 4), max(0, xs.min() - 3), min(w, xs.max() + 4)
        sub = np.zeros((y1 - y0, x1 - x0), bool)
        sub[ys - y0, xs - x0] = True
        ring = dilate(sub, 2) & ~sub
        dsub = d[y0:y1, x0:x1][sub]
        if float(reach[y0:y1, x0:x1][sub].mean()) > 0.5 and float(np.median(dsub)) < 7:
            ok = True                                    # a. 細髮絲圍起來的（縫很窄時混到一點頭髮，色差中位數到 5～6；毛衣的亮面 8 以上）
        elif sizes2[i] <= 3000:
            ok = float(np.median(dsub)) < 5 and float(np.median(L[y0:y1, x0:x1][ring])) < 50
        else:
            ok = float(L[y0:y1, x0:x1][sub].std()) < 2.5 and float(dsub.mean()) < 3.5
        if ok:
            bgmask[y0:y1, x0:x1] |= sub
            holes += 1
    fg = ~bgmask
    # 3. 邊緣的透明度：F＝附近確定是人物的顏色（輪廓往內 3 px 的顏色模糊平均），B＝底色
    core = erode(fg, 3)
    cw = gauss(core.astype(np.float32), 4.0)
    F = gauss(rgb * core[..., None], 4.0) / np.maximum(cw, 1e-3)[..., None]
    band = dilate(fg, 3) & ~core
    FB = F - bg_rgb
    CB = rgb - bg_rgb
    den = np.maximum((FB * FB).sum(2), 1.0)
    a_est = np.clip((CB * FB).sum(2) / den, 0, 1)
    weak = (np.sqrt(den) < 25) | (cw < 0.02)          # 人物的顏色太接近底色、或附近沒有確定的人物：用色差
    a_d = np.clip((d - 3.0) / 12.0, 0, 1)
    a_band = np.where(weak, a_d, a_est)
    a_band = np.where(fg, np.maximum(a_band, 0.0), np.minimum(a_band, a_d))   # 背景那一側不可能比色差說的還不透明
    alpha = np.where(band, a_band, fg.astype(np.float32))
    # 3b. 髮絲之間的縫（2026-10-21 加）：被髮絲圍住、離背景 6 px 以內、色差 < 14（大部分是底色、混了一點頭髮）的像素，原本是實心
    #     （透明度 1）＝合成後一層淡淡的灰霧（子晴頭髮外側最明顯）。用附近「確定是頭髮」的顏色 Fh（色差 ≥ 20、亮度 < 170）做顏色分解：
    #     α＝(C−B)·(Fh−B)/|Fh−B|²，顏色直接用 Fh（不放大雜訊）。只動「顏色剛好在底色和頭髮之間」的（分解的殘差 < 12）：
    #     毛衣、襯衫的亮面（比底色亮、偏暖）殘差大，不動。
    hair = fg & (d >= 20) & ((rgb @ np.array([0.299, 0.587, 0.114], np.float32)) < 170)
    hw = gauss(hair.astype(np.float32), 3.0)
    Fh = gauss(rgb * hair[..., None], 3.0) / np.maximum(hw, 1e-3)[..., None]
    FhB = Fh - bg_rgb
    denh = (FhB * FhB).sum(2)
    a_h = np.clip((CB * FhB).sum(2) / np.maximum(denh, 1.0), 0, 1)
    resid = np.linalg.norm(CB - a_h[..., None] * FhB, axis=2)
    seam = fg & (d < 14) & dilate(bgmask, 6) & (hw > 0.08) & (np.sqrt(denh) > 40) & (resid < 12)
    alpha = np.where(seam, np.minimum(alpha, a_h), alpha)
    alpha[alpha < 0.04] = 0
    # 4. 扣掉灰色：C＝B＋(C−B)/α（只在半透明的邊緣）；髮絲之間的縫用 Fh
    a3 = alpha[..., None]
    semi = (alpha > 0) & (alpha < 0.999)
    col = np.where(semi[..., None], bg_rgb + CB / np.maximum(a3, 0.04), rgb)
    col = np.where(seam[..., None], Fh, col)
    col = np.clip(col, 0, 255)
    if debug:
        Image.fromarray((alpha * 255).astype(np.uint8)).save(os.path.join(debug, name + '_alpha.png'))
        ov = rgb.copy()
        inner = bgmask & ~outer                          # 挖掉的內部背景塊：紅色
        ov[inner] = ov[inner] * 0.3 + np.array([255, 0, 0], np.float32) * 0.7
        Image.fromarray(np.clip(ov, 0, 255).astype(np.uint8)).save(os.path.join(debug, name + '_holes.png'))
    print('  %-10s 底色 Lab %s，內部的背景塊 %d 個' % (name, np.round(bg0, 1), holes))
    return col.astype(np.float32), alpha.astype(np.float32)


# ---------------------------------------------------------------- 桌子、要留／要拿掉的東西
def table_cut(cfg):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    c = cfg['cut']
    if isinstance(c, tuple):
        (x0, y0), (x1, y1) = c
        yc = y0 + (y1 - y0) * (xx - x0) / (x1 - x0)
    else:
        yc = np.full_like(yy, float(c))
    return np.clip((yc + 1.5 - yy) / 3.0, 0, 1)        # 3 px 漸層


def keep_mask(rgb, kind):
    """桌子以下要留的東西（README 的範圍裡照輪廓描的多邊形，柔邊 1 px；不用顏色挑：書頁、瓶身的反光和木頭分不開）。"""
    if kind == 'notebook':      # 以安的深藍布面手帳（README：x 520～1000、y 822～925）
        poly = [(523, 862), (681, 827), (994, 829), (1000, 844), (997, 870), (834, 894), (831, 920), (525, 904)]
    else:                       # 學姊的霧面深藍保溫瓶（README：x 405～545、y 605～935）：圓角的長方形
        poly = [(415, 609), (537, 609), (543, 616), (543, 926), (535, 934), (417, 934), (409, 926), (409, 616)]
    return poly_mask(poly, feather=1.0)


def fix_kai(rgb):
    """阿凱：README 要去掉他自己的冰飲和咖啡杯。冰飲（x 1170～1356、杯緣 y 710）後面原本是襯衫和放在桌上的左前臂（手錶 x 1102～1175），
    咖啡杯（x 1062～1298、杯緣 y 858）擋住手腕的下緣。補法（2026-10-20 重寫：舊的「左右兩欄內插」補出來是一塊平平的淺色板子）：
      吸管：用左邊 34 px 的襯衫蓋掉；
      杯緣以上到前臂上緣的線稿（袖口那邊 y 792 → 手腕 y 802）：杯緣上面的襯衫，以 y 703.5 為軸往下鏡射；
      前臂：杯子右邊看得到的那一段前臂（x 1358～1366 平均）一欄的明暗——上緣的線稿 → 皮膚 → 下緣的影子 → 桌子——整段往左延伸，
            上緣跟著前臂往手腕斜，越靠手腕亮一點（原圖手腕比較亮）；
      咖啡杯擋住的手腕下緣（x 1062～1170、y 856 以下）：同一欄明暗的下半段（皮膚 → 影子），4 px 漸層接上手腕。
    桌子之後照 cut 切掉，接基底圖的桌子。"""
    out = rgb.copy()
    straw = poly_mask([(1302, 556), (1344, 556), (1324, 722), (1287, 722)], feather=1.0)
    shifted = np.roll(rgb, 34, axis=1)                  # 往右移 34 px＝拿左邊的襯衫
    out = out * (1 - straw[..., None]) + shifted * straw[..., None]
    prof = rgb[786:941, 1358:1367].mean(axis=1)         # 前臂那一欄；index 0 ↔ y 786（線稿在 y 792）
    n = len(prof)
    gx0, gx1, mx0 = 1170, 1357, 1062
    filled = np.zeros((H, W), np.float32)
    for x in range(gx0, gx1):
        line = 792.0 + 10.0 * (gx1 - x) / (gx1 - 1092.0)            # 前臂上緣的線稿（往手腕斜）
        bright = 1.0 + 0.05 * (gx1 - x) / (gx1 - gx0)
        for y in range(704, H):
            if y < line - 6:
                out[y, x] = out[int(2 * 703.5 - y), x] if 2 * 703.5 - y >= 0 else out[y, x]   # 襯衫（鏡射）
            else:
                i = int(round(y - line + 6))
                p = prof[min(n - 1, i)] * bright
                if y < line - 2:                                     # 襯衫 → 前臂，4 px 漸層
                    w = (y - (line - 6)) / 4.0
                    p = out[int(2 * 703.5 - y), x] * (1 - w) + p * w
                out[y, x] = p
            filled[y, x] = 1
    for x in range(mx0, gx0):                                        # 咖啡杯擋住的手腕下緣
        for y in range(856, H):
            p = prof[min(n - 1, y - 856 + 80)]                       # 從皮膚的下半段（y 866）開始
            w = min(1.0, (y - 855) / 4.0)
            out[y, x] = out[y, x] * (1 - w) + p * w
            filled[y, x] = 1
    soft = gauss(out, 0.8)                                           # 補的地方稍微柔一點，接近原圖的筆觸
    f = gauss(filled, 1.0)[..., None]
    return out * (1 - f) + soft * f


def kai_remove():
    """阿凱要拿掉的：右邊椅背（照襯衫的右緣）。冰飲、咖啡杯擋住的地方已經補成人物，桌子照桌緣切掉。"""
    return poly_mask([(1427, 600), (1444, 660), (1464, 700), (1479, 740), (1494, 780), (1505, 820), (1511, 860), (1508, 895),
                      (1508, 941), (W, 941), (W, 600)], feather=1.0)


# 基底圖的桌子遠端那條邊（量出來的：x 1270 → y 613，每往右 10 px 低 1 px；x 1270 以左被前景的頭擋住）
def table_edge(x):
    return 613.0 + 0.1 * (x - 1270.0)


def extend_table(base, T):
    """圖層的桌子切在一條水平線（README 的 y），基底圖的桌緣卻是斜的（右邊比較低）：人物的手臂和桌面之間會露出椅子。
    把基底圖桌緣那一帶往上拉到圖層切的那條線 T(x)（只拉 x ≥ 1250 那一段；每一欄往上移 Δ＝桌緣−T，下面 Δ＋12 px 內慢慢接回原圖）。"""
    out = base.copy()
    ys = np.arange(H, dtype=np.float32)
    for x in range(1250, W):
        Tx = T[x]
        E = table_edge(x)
        if not np.isfinite(Tx) or Tx >= E - 0.5:
            continue
        dlt = E - Tx
        L = dlt + 12.0
        y0, y1 = int(np.floor(Tx)) - 1, int(np.ceil(E + L)) + 1
        yy = ys[y0:y1]
        src = np.where(yy < E, yy + dlt, yy + dlt * np.clip((E + L - yy) / L, 0, 1))
        src = np.where(yy < Tx - 0.5, yy, src)
        i0 = np.clip(np.floor(src).astype(int), 0, H - 2)
        f = (src - i0)[:, None]
        out[y0:y1, x] = base[i0, x] * (1 - f) + base[i0 + 1, x] * f
    return out


def crown_cap(alpha):
    """頭頂被原圖上緣切平了（以安、芷若、可昕、沛珊、阿凱的圖層頭髮碰到第 0 列）：用第 0 列的弦和第 40、60 列的寬度
    估頭頂那一段圓（圓心在 y＝d、半徑 R），回傳 (xc, c0, d, R)；缺的高度 R−d 小於 3 px 就不補。"""
    row0 = alpha[0] > 0.5
    xs = np.nonzero(row0)[0]
    if len(xs) == 0:
        return None
    # 第 0 列中間那一段連續的頭髮（旁邊零散的髮絲不算）
    mid = int(np.median(xs))
    l = r = mid
    while l > 0 and row0[l - 1]:
        l -= 1
    while r < W - 1 and row0[r + 1]:
        r += 1
    xc, c0 = (l + r) / 2.0, (r - l) / 2.0
    est = []
    for rr in (40, 60):
        run = alpha[rr] > 0.5
        if not run[int(xc)]:
            continue
        a, b = int(xc), int(xc)
        while a > 0 and run[a - 1]:
            a -= 1
        while b < W - 1 and run[b + 1]:
            b += 1
        w = (b - a) / 2.0
        d = (w * w - c0 * c0 + rr * rr) / (2.0 * rr)
        est.append((d, np.sqrt(c0 * c0 + d * d)))
    if not est:
        return None
    d = float(np.mean([e[0] for e in est]))
    R = float(np.sqrt(c0 * c0 + d * d))
    if R - d < 3 or d <= 0:
        return None
    return xc, c0, d, R


def add_crown(col, alpha, cap):
    """在圖層上面多加幾列，把頭頂補成圓的：顏色、透明度用第 0 列往下的頭髮上下鏡射，形狀照 crown_cap 的圓（邊緣 1.5 px 柔邊）。"""
    xc, c0, d, R = cap
    E = int(np.ceil(R - d)) + 3
    col2 = np.zeros((H + E, W, 3), np.float32)
    a2 = np.zeros((H + E, W), np.float32)
    col2[E:], a2[E:] = col, alpha
    xs = np.arange(W, dtype=np.float32)
    inside = np.abs(xs - xc) <= R
    top = np.where(inside, d - np.sqrt(np.maximum(R * R - (xs - xc) ** 2, 0)), np.inf)   # 原圖座標（負的＝第 0 列以上）
    for k in range(1, E + 1):
        y = -k + 0.5
        m = np.clip((y - top) / 1.5 + 0.5, 0, 1)
        col2[E - k] = col[k - 1]
        a2[E - k] = alpha[k - 1] * m
    return col2, a2, E


def table_line_base(cfg):
    """這個圖層切桌子的那條線，換成基底圖的座標 T(x)（每一欄一個 y）。"""
    s, (px, py) = cfg['scale'], cfg['pos']
    xs = np.arange(W, dtype=np.float32)
    xl = (xs - px) / s
    c = cfg['cut']
    if isinstance(c, tuple):
        (x0, y0), (x1, y1) = c
        yl = y0 + (y1 - y0) * (xl - x0) / (x1 - x0)
    else:
        yl = np.full_like(xl, float(c))
    T = py + s * yl
    T[(xl < 0) | (xl > W)] = np.inf
    return T


# ---------------------------------------------------------------- 合成
def paste(out, col, alpha, s, fx, fy):
    """預乘 α 再縮放（Lanczos；避免縮放時把透明的灰色帶進邊緣），左上角放在 (fx, fy)（四捨五入到整數像素）。"""
    h, w = alpha.shape
    ix, iy = int(round(fx)), int(round(fy))
    pre = np.dstack([col * alpha[..., None], alpha * 255]).astype(np.float32)
    nw, nh = int(round(w * s)), int(round(h * s))
    pre_s = np.dstack([np.asarray(Image.fromarray(pre[..., i], 'F').resize((nw, nh), Image.LANCZOS)) for i in range(4)])
    a_s = np.clip(pre_s[..., 3] / 255.0, 0, 1)
    c_s = np.clip(pre_s[..., :3], 0, None)
    x0, y0 = max(0, ix), max(0, iy)
    x1, y1 = min(W, ix + nw), min(H, iy + nh)
    if x1 <= x0 or y1 <= y0:
        return
    sa = a_s[y0 - iy:y1 - iy, x0 - ix:x1 - ix][..., None]
    sc = c_s[y0 - iy:y1 - iy, x0 - ix:x1 - ix]
    out[y0:y1, x0:x1] = np.clip(sc + out[y0:y1, x0:x1] * (1 - sa), 0, 255)


def compose(src, name, cfg, base, debug=None):
    rgb = np.asarray(Image.open(os.path.join(src, 'cg_reunion_window_table_layer_%s.webp' % name)).convert('RGB')).astype(np.float32)
    assert rgb.shape[:2] == (H, W), (name, rgb.shape)
    if name == 'kai':
        rgb = fix_kai(rgb)
    col, alpha = cutout(rgb, name, debug)
    cut = table_cut(cfg)
    a2 = alpha * cut
    sprite = None
    if cfg.get('keep'):
        km = keep_mask(rgb, cfg['keep'])
        if debug:
            Image.fromarray((km * 255).astype(np.uint8)).save(os.path.join(debug, name + '_keep.png'))
        if cfg.get('keep_at'):
            # 留下來的東西另外放（學姊的保溫瓶：照 BB 的位置會整個在前景那個人的頭後面，只露出蓋子）。
            # 保溫瓶本來擋住的毛衣：用瓶子右邊的毛衣左右鏡射補起來，再重新去背
            ys, xs = np.nonzero(km > 0.02)
            bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            sprite = (col[by0:by1, bx0:bx1].copy(), (km * alpha)[by0:by1, bx0:bx1].copy())
            mx = bx1 + 2                                    # 鏡射軸：瓶子右緣再過去 2 px
            fill = rgb.copy()
            for x in range(bx0 - 3, bx1 + 2):
                fill[by0 - 3:by1 + 2, x] = rgb[by0 - 3:by1 + 2, 2 * mx - x]
            m = gauss(dilate(km > 0.02, 2).astype(np.float32), 1.0)[..., None]
            rgb2 = rgb * (1 - m) + fill * m
            col, alpha = cutout(rgb2, name + '_fill', debug)
            a2 = alpha * cut
        else:
            a2 = np.maximum(a2, km * alpha)
    if name == 'kai':
        a2 = a2 * (1 - kai_remove())
    E = 0
    cap = crown_cap(a2)
    if cap:
        col, a2, E = add_crown(col, a2, cap)
        print('  %-10s 頭頂補 %d px（圖層座標）' % (name, int(round(cap[3] - cap[2]))))
    if cfg['warm']:
        col = col * WARM
    col = np.clip(col, 0, 255)
    s = cfg['scale']
    out = extend_table(base, table_line_base(cfg))
    px, py = cfg['pos']
    paste(out, col, a2, s, px, py - E * s)
    if sprite is not None:
        sc, sa = sprite
        if cfg['warm']:
            sc = sc * WARM
        cx, by = cfg['keep_at']
        hw = sa.shape[1] * s / 2
        sh = Image.new('L', (W, H), 0)                    # 桌面上的接觸陰影（扁的橢圓、模糊）
        ImageDraw.Draw(sh).ellipse([cx - hw * 1.05, by - 5, cx + hw * 1.15, by + 5], fill=255)
        sh = gauss(np.asarray(sh).astype(np.float32) / 255.0, 3.0)[..., None] * 0.45
        out[:] = out * (1 - sh) + out * 0.35 * sh
        paste(out, np.clip(sc, 0, 255), sa, s, cx - hw, by - sa.shape[0] * s)
    return restore_front(out, base)


def restore_front(out, base):
    """蓋回基底圖在人物前面的東西：冰咖啡（杯口透明的那一段只蓋回亮的反光，杯子後面看得到人物、稍微暗一點）、吸管、杯墊、
    前景失焦的頭和肩膀（柔邊 7 px）。"""
    lum = base @ np.array([0.299, 0.587, 0.114], np.float32)
    top = poly_mask(GLASS_TOP, feather=0.6)
    shine = np.clip((lum - 110.0) / 50.0, 0, 1) * top
    out = out * (1 - top[..., None] * 0.08)                     # 隔著玻璃：暗 8%
    out = out * (1 - shine[..., None]) + base * shine[..., None]
    parts = [poly_mask(COFFEE, feather=0.7), poly_mask(STRAW, feather=0.6), poly_mask(COASTER, feather=0.8)]
    if not NO_FG:
        parts += [poly_mask(FG_HEAD_MID, feather=7.0), poly_mask(FG_HEAD_RIGHT, feather=7.0)]
    front = np.maximum.reduce(parts)
    return out * (1 - front[..., None]) + base * front[..., None]


NO_FG = False   # --no-fg：前景的頭不蓋回去（只給 BB 比較用：BB 試合成時人物畫在前景的頭上面）


def sheet(results, path):
    tw, th = W // 4, H // 4
    im = Image.new('RGB', (tw * 4 + 5 * 6, th * 2 + 3 * 6 + 2 * 22), (30, 30, 30))
    d = ImageDraw.Draw(im)
    for i, (n, arr) in enumerate(results):
        cx, cy = 6 + (i % 4) * (tw + 6), 6 + (i // 4) * (th + 6 + 22)
        im.paste(Image.fromarray(arr.astype(np.uint8)).resize((tw, th), Image.LANCZOS), (cx, cy + 22))
        d.text((cx + 4, cy + 4), n, fill=(240, 240, 240))
    im.save(path)


def main():
    args = sys.argv[1:]
    sheet_path = debug = None
    if '--sheet' in args:
        i = args.index('--sheet'); sheet_path = args[i + 1]; del args[i:i + 2]
    if '--debug' in args:
        i = args.index('--debug'); debug = args[i + 1]; del args[i:i + 2]; os.makedirs(debug, exist_ok=True)
    global NO_FG
    if '--no-fg' in args:
        args.remove('--no-fg'); NO_FG = True
    only = None
    if '--only' in args:
        i = args.index('--only'); only = args[i + 1].split(','); del args[i:i + 2]
    src, out_dir = args[0], args[1]
    os.makedirs(out_dir, exist_ok=True)
    base = np.asarray(Image.open(os.path.join(src, 'cg_reunion_window_table_base.webp')).convert('RGB')).astype(np.float32)
    assert base.shape[:2] == (H, W)
    results = []
    for name, cfg in LAYERS.items():
        if only and name not in only:
            continue
        out = compose(src, name, cfg, base, debug)
        p = os.path.join(out_dir, 'cg_reunion_%s.webp' % name)
        Image.fromarray(np.round(out).astype(np.uint8)).save(p, 'WEBP', quality=90, method=6)
        print('  →', p)
        results.append((name, out))
    if sheet_path:
        sheet(results, sheet_path)
        print('  對照圖', sheet_path)


if __name__ == '__main__':
    main()
