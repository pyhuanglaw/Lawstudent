import cv2, numpy as np, sys, os
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = im.shape[:2]
lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
# background colour = median of a border strip
b = np.concatenate([lab[:20].reshape(-1,3), lab[-20:].reshape(-1,3), lab[:, :20].reshape(-1,3), lab[:, -20:].reshape(-1,3)])
bg = np.median(b, axis=0)
d = np.linalg.norm(lab - bg, axis=2)
near = (d < 9).astype(np.uint8)
# keep only near-bg regions connected to the border
n, lbl = cv2.connectedComponents(near, connectivity=4)
border = set(np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))) - {0}
bgmask = np.isin(lbl, list(border))
# grabCut refine: sure bg = bgmask eroded, probable fg elsewhere
gc = np.full((h, w), cv2.GC_PR_FGD, np.uint8)
gc[bgmask] = cv2.GC_PR_BGD
er = cv2.erode(bgmask.astype(np.uint8), np.ones((15, 15), np.uint8))
gc[er > 0] = cv2.GC_BGD
fgcore = cv2.erode((~bgmask).astype(np.uint8), np.ones((15, 15), np.uint8))
gc[fgcore > 0] = cv2.GC_FGD
bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(im, gc, None, bgd, fgd, 3, cv2.GC_INIT_WITH_MASK)
fg = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 1, 0).astype(np.uint8)
# largest component only (drop specks)
n, lbl, st, _ = cv2.connectedComponentsWithStats(fg, 8)
if n > 1:
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
    keep = np.zeros_like(fg)
    for i in range(1, n):
        if i == big or st[i, cv2.CC_STAT_AREA] > 4000:
            keep[lbl == i] = 1
    fg = keep
# enclosed background holes (e.g. between legs): near-bg regions not touching the border, large enough
nearh=(d < 7).astype(np.uint8)
n2, lbl2, st2, _ = cv2.connectedComponentsWithStats(nearh, 4)
for i in range(1, n2):
    if st2[i, cv2.CC_STAT_AREA] > 600 and i not in border:
        reg = (lbl2 == i)
        # real background is flat and very close to the bg colour; white clothes/shoes have shading
        if lab[..., 0][reg].std() < 2.5 and d[reg].mean() < 3.5:
            fg[reg] = 0
            print('  hole removed', int(st2[i, cv2.CC_STAT_AREA]), 'std', round(float(lab[..., 0][reg].std()), 2), 'mean d', round(float(d[reg].mean()), 2))
        else:
            print('  kept', int(st2[i, cv2.CC_STAT_AREA]), 'std', round(float(lab[..., 0][reg].std()), 2), 'mean d', round(float(d[reg].mean()), 2))
# soft alpha: blend hard mask with colour distance near the edge
alpha = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.2)
soft = np.clip((d - 4) / 14.0, 0, 1)
edge = cv2.dilate(fg, np.ones((5, 5), np.uint8)) - cv2.erode(fg, np.ones((5, 5), np.uint8))
alpha = np.where(edge > 0, np.minimum(alpha + 0.0, np.maximum(soft, alpha * 0.6)), alpha)
alpha = np.clip(alpha, 0, 1)
# de-fringe: remove bg colour from semi-transparent pixels
bgbgr = cv2.cvtColor(np.uint8([[bg]]), cv2.COLOR_LAB2BGR)[0, 0].astype(np.float32)
a3 = alpha[..., None]
col = im.astype(np.float32)
col = np.where(a3 > 0.02, (col - (1 - a3) * bgbgr) / np.maximum(a3, 0.02), col)
col = np.clip(col, 0, 255)
rgba = np.dstack([col.astype(np.uint8), (alpha * 255).astype(np.uint8)])
ys, xs = np.where(alpha > 0.1)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
cv2.imwrite(out, rgba[y0:y1 + 1, x0:x1 + 1])
print(os.path.basename(src), 'bg', np.round(bg, 1), 'bbox', (x0, y0, x1, y1), 'h', y1 - y0 + 1)
