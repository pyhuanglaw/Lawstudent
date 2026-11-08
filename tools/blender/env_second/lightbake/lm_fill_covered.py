"""光照貼圖上「被 WALL_ 網格蓋住、牆淡出時才看得到」的格子，補成旁邊的顏色（11-08 LAWWW2-B；BB-B 隔間牆雲端判 LM3_cloud 要兩批隔間牆都掃）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/lm_fill_covered.py <glb> <光照 webp …（白天、晚上、熄燈，同一套 UV）> [--out 資料夾，預設覆蓋] [--dry] [--contact 0.02]
為什麼：
  - 烘焙時，牆腳下的地板、牆和牆交接處（隔間牆的一端插在外牆裡、T 字接頭）、門板貼著門框那幾公分，被牆蓋住，照不到光，烘出來是黑的。
    牆在的時候這幾格本來就看不到，沒關係。
  - 遊戲的 fadeWalls 會把擋在鏡頭和人中間的牆藏起來。蓋住它們的牆一藏，就露出一條黑線（霖澤 5F 研究室：P1 藏起來時地上一條橫的黑線、右邊外牆一條直的黑線）。
做法：
  1. 照 three.js＋attachRoomGLB 的規則算每個 WALL_ 網格的淡出參數，在 400 組鏡頭／玩家位置下算它顯示或藏（lm_fade_reveal_check.scene）。
  2. 每個有第二套 UV 的三角形，在光照貼圖上逐格（格子中心）算出世界座標。「被蓋住」＝
     (a) 沿法線往外 contact（預設 2 cm）內碰到另一個 WALL_ 網格，或 (b) 這一點在另一個 WALL_ 網格的實心裡（沿法線、沿另一個方向打線，碰到的面數都是單數）；
     而且至少有一組鏡頭／玩家位置是「這個面顯示、朝著鏡頭，蓋住它的網格藏起來」（不會露出來的不動）。
  3. 被蓋住的格子：從同一個網格、沒被蓋住的相鄰格子往裡面一圈一圈補（8 鄰格平均）；整塊島都被蓋住的（門板朝牆那一面），用這個網格沒被蓋住的格子的中位數。
     邊界外 4 格的留邊（烘焙的 margin，雙線性取樣會用到）照新的值重新往外擴。
  4. 每一張光照貼圖（白天、晚上、熄燈）用同一張遮罩補，存成 WebP（品質 90、method 6，和 to_webp.py 一樣）。
只改光照貼圖，不動 GLB。補過的格子在牆顯示的時候看不到（被蓋住），所以平常的畫面不變。"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lm_fade_reveal_check import scene   # noqa: E402


def opt(name, d):
    return type(d)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else d


def hits(P, d, tris, eps=1e-9):
    """每一點沿 d 方向打線，對每個三角形：距離（沒碰到＝inf）。P k×3，d 3 或 k×3，tris m×3×3 → k×m"""
    e1 = tris[:, 1] - tris[:, 0]; e2 = tris[:, 2] - tris[:, 0]
    D = np.broadcast_to(d, P.shape)
    pv = np.cross(D[:, None, :], e2[None]); det = np.einsum('mj,kmj->km', e1, pv)
    ok = np.abs(det) > eps; inv = np.where(ok, 1.0 / np.where(ok, det, 1.0), 0.0)
    tv = P[:, None, :] - tris[None, :, 0]; u = np.einsum('kmj,kmj->km', tv, pv) * inv
    qv = np.cross(tv, e1[None]); v = np.einsum('kj,kmj->km', D, qv) * inv; t = np.einsum('mj,kmj->km', e2, qv) * inv
    h = ok & (u >= -1e-7) & (v >= -1e-7) & (u + v <= 1 + 1e-7) & (t > 1e-6)
    return np.where(h, t, np.inf)


def covered(glb, H, W, CONTACT=0.02):
    """光照貼圖 W×H 上：objmap（每一格屬於哪個網格，-1＝留邊）、cov（被 WALL_ 網格蓋住、會露出來的格子）、stats（（網格、蓋住它的）：格數）。測試也用。"""
    SC = scene(glb, 400); objs, walls, cam = SC['objs'], SC['walls'], SC['cam']
    objmap = np.full((H, W), -1, np.int32)
    cov = np.zeros((H, W), bool)
    stats = {}
    wbox = [(o['P'].min(0) - CONTACT, o['P'].max(0) + CONTACT) for o in walls]
    wtris = [o['P'][o['I']] for o in walls]
    d2s = np.array([[0.0, 1.0, 0.0], [1.0, 0.0, 0.0]])
    for ri, o in enumerate(objs):
        if o['U'] is None: continue
        T = o['P'][o['I']]; UV = o['U'][o['I']]
        N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); A2 = np.linalg.norm(N, axis=1); N = N / np.maximum(A2[:, None], 1e-12)
        rvis = o['wall']['vis'] if o['wall'] else np.ones(len(cam), bool)
        tmn, tmx = T.min(1), T.max(1)
        for t in np.where(A2 > 1e-9)[0]:
            # 這個三角形在光照貼圖上的格子（格子中心在三角形裡）
            uv = UV[t] * [W, H]
            x0, y0 = np.floor(uv.min(0) - 0.5).astype(int); x1, y1 = np.ceil(uv.max(0) - 0.5).astype(int)
            x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, W - 1), min(y1, H - 1)
            if x1 < x0 or y1 < y0: continue
            X, Y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1)); q = np.c_[X.ravel() + 0.5, Y.ravel() + 0.5]
            v0 = uv[1] - uv[0]; v1 = uv[2] - uv[0]; den = v0[0] * v1[1] - v1[0] * v0[1]
            if abs(den) < 1e-12: continue
            w1 = ((q[:, 0] - uv[0, 0]) * v1[1] - v1[0] * (q[:, 1] - uv[0, 1])) / den; w2 = (v0[0] * (q[:, 1] - uv[0, 1]) - (q[:, 0] - uv[0, 0]) * v0[1]) / den; w0 = 1 - w1 - w2
            m = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
            if not m.any(): continue
            gx = X.ravel()[m]; gy = Y.ravel()[m]; objmap[gy, gx] = ri
            # 附近、會讓它露出來的 WALL_ 網格
            facing = (cam - T[t].mean(0)) @ N[t] > 0
            cand = [k for k, (lo, hi) in enumerate(wbox) if walls[k] is not o and np.all(tmx[t] >= lo) and np.all(tmn[t] <= hi) and np.any(rvis & facing & ~walls[k]['wall']['vis'])]
            if not cand: continue
            P = np.c_[w0[m], w1[m], w2[m]] @ T[t] + N[t] * 1e-4
            c = np.zeros(len(P), bool); by = np.full(len(P), -1)
            for k in cand:
                tr = wtris[k]
                dist = hits(P, N[t], tr)
                a = (dist.min(1) <= CONTACT)
                n1 = np.isfinite(dist).sum(1)
                d2 = d2s[0] if abs(N[t][1]) < 0.9 else d2s[1]
                n2 = np.isfinite(hits(P, d2, tr)).sum(1)
                inside = (n1 % 2 == 1) & (n2 % 2 == 1)
                hit = (a | inside) & ~c; by[hit] = k; c |= a | inside
            if c.any():
                cov[gy[c], gx[c]] = True
                for k in np.unique(by[c]):
                    key = (o['name'], walls[k]['name']); stats[key] = stats.get(key, 0) + int((by[c] == k).sum())
    return objmap, cov, stats


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--') and a not in (opt('--out', '__'), str(opt('--contact', 0.02)))]
    glb, ims = args[0], args[1:]
    out = opt('--out', ''); dry = '--dry' in sys.argv; CONTACT = opt('--contact', 0.02)
    imgs = [np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) for p in ims]
    H, W = imgs[0].shape[:2]
    objmap, cov, stats = covered(glb, H, W, CONTACT)
    owned = objmap >= 0
    print(f'{glb}：光照貼圖 {W}×{H}，屬於網格的格子 {owned.sum()}，被蓋住、會露出來的 {cov.sum()} 格（{100 * cov.sum() / max(owned.sum(), 1):.2f}%）')
    for (r, k), n in sorted(stats.items(), key=lambda x: -x[1])[:25]: print(f'  {r} ← {k}：{n} 格')
    if dry or not cov.any(): return stats
    # 3. 補：同一個網格、沒被蓋住的相鄰格子往裡面補
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    def shift(a, dy, dx, fill):
        r = np.full_like(a, fill); ys = slice(max(dy, 0), H + min(dy, 0)); yd = slice(max(-dy, 0), H + min(-dy, 0)); xs = slice(max(dx, 0), W + min(dx, 0)); xd = slice(max(-dx, 0), W + min(-dx, 0))
        r[yd, xd] = a[ys, xs]; return r
    known = owned & ~cov; todo = cov.copy(); outs = [im.copy() for im in imgs]; it = 0
    while todo.any() and it < 400:
        acc = [np.zeros_like(im) for im in imgs]; cnt = np.zeros((H, W), np.float32)
        for dy, dx in nb:
            k = shift(known, dy, dx, False) & (shift(objmap, dy, dx, -2) == objmap)
            cnt += k
            for a, im in zip(acc, outs): a += shift(im, dy, dx, 0) * k[..., None]
        upd = todo & (cnt > 0)
        if not upd.any(): break
        for a, im in zip(acc, outs): im[upd] = a[upd] / cnt[upd][:, None]
        known |= upd; todo &= ~upd; it += 1
    rest = int(todo.sum())
    if rest:   # 整塊島都被蓋住：用這個網格沒被蓋住的格子的中位數
        for ri in np.unique(objmap[todo]):
            sel = todo & (objmap == ri); src = owned & ~cov & (objmap == ri)
            for im, o0 in zip(outs, imgs): im[sel] = np.median(o0[src], axis=0) if src.any() else np.median(o0[owned & ~cov], axis=0)
    # 留邊：補過的格子附近 4 格內、不屬於任何網格的格子，從屬於網格的格子重新往外擴
    near = ndimage.binary_dilation(cov, iterations=4) & ~owned
    have = owned.copy()
    for _ in range(4):
        acc = [np.zeros_like(im) for im in imgs]; cnt = np.zeros((H, W), np.float32)
        for dy, dx in nb:
            k = shift(have, dy, dx, False); cnt += k
            for a, im in zip(acc, outs): a += shift(im, dy, dx, 0) * k[..., None]
        upd = near & ~have & (cnt > 0)
        for a, im in zip(acc, outs): im[upd] = a[upd] / cnt[upd][:, None]
        have |= upd
    print(f'  補了 {int(cov.sum())} 格（一圈一圈補 {it} 圈；整塊被蓋住用中位數 {rest} 格）；留邊重算 {int((near & have).sum())} 格')
    for p, im, o0 in zip(ims, outs, imgs):
        dst = os.path.join(out, os.path.basename(p)) if out else p
        Image.fromarray(np.clip(im + 0.5, 0, 255).astype(np.uint8)).save(dst, quality=90, method=6)
        ch = np.abs(im - o0).max(2) > 0.5
        print(f'  {dst}：改了 {int(ch.sum())} 格；被蓋住那些平均 {o0[cov].mean():.1f} → {im[cov].mean():.1f}（0～255）')
    return stats


if __name__ == '__main__':
    main()
