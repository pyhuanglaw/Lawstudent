# #204 第三批（11-09 BB-B 23:33）：新規則 (c)（地板在落地的 WALL_ 底下）重新掃描一間；沒過門檻就補，輸出到 out/（不動資產）
import sys, os, glob, json, time, numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, '/home/user/Lawstudent/tools/blender/env_second/lightbake')
import lm_fill_covered as F
E = '/home/user/Lawstudent/assets/models/env/'
r, OUT = sys.argv[1], sys.argv[2]; tag = r.replace('/', '__'); t0 = time.time()
ims = sorted(glob.glob(E + r + '_lm_*.webp'))
imgs = [np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) for p in ims]
H, W = imgs[0].shape[:2]; info = {}
objmap, cov, stats = F.covered(E + r + '.glb', H, W, 0.02, True, info)
np.savez_compressed(os.path.join(OUT, tag + '.npz'), objmap=objmap, cov=cov, pos=info['pos'], by=info['by'], rc=info['rc'])
json.dump({'walls': info['walls'], 'ims': ims}, open(os.path.join(OUT, tag + '.json'), 'w'), ensure_ascii=False)
def ratio(L):   # 和 tests/lm_covered_fill_check.py 一樣（灰階）
    a = b = 0.0
    for o in np.unique(objmap[cov]):
        c = cov & (objmap == o); ring = ndimage.binary_dilation(c, iterations=3) & ~cov & (objmap == o)
        if not ring.any(): continue
        a += L[c].sum(); b += L[ring].mean() * c.sum()
    n = cov.sum(); ca, ra = a / max(n, 1), b / max(n, 1); return ca, ra, (n == 0 or ca >= 0.85 * ra or ra - ca <= 3)
gray = lambda p: np.asarray(Image.open(p).convert('L'), dtype=np.float32)
rc = info['rc']; lines = [f'{r}：{W}×{H}，被蓋住、會露出來的 {int(cov.sum())} 格，其中只因新規則 (c) 的 {int(rc.sum())} 格（{time.time()-t0:.0f} 秒）']
bad = False
for p in ims:
    ca, ra, ok = ratio(gray(p)); bad |= not ok; lines.append(f'  改前 {os.path.basename(p)}：平均 {ca:.1f}，旁邊 {ra:.1f}（{ca/max(ra,1e-6):.2f} 倍）{"PASS" if ok else "FAIL"}；新規則那些平均 {gray(p)[rc].mean() if rc.any() else 0:.1f}')
wn = [w[0] for w in info['walls']]
for k in np.unique(info['by'][rc]): lines.append(f'  新規則：{wn[k]} 底下 {int((rc & (info["by"] == k)).sum())} 格')
if bad and rc.any():
    outs, it, rest, nre = F.fill(imgs, objmap, cov)
    for p, im in zip(ims, outs):
        dst = os.path.join(OUT, os.path.basename(p)); Image.fromarray(np.clip(im + 0.5, 0, 255).astype(np.uint8)).save(dst, quality=90, method=6)
        ca, ra, ok = ratio(gray(dst)); lines.append(f'  改後 {os.path.basename(p)}：平均 {ca:.1f}，旁邊 {ra:.1f}（{ca/max(ra,1e-6):.2f} 倍）{"PASS" if ok else "FAIL"}；新規則那些平均 {gray(dst)[rc].mean():.1f}')
    lines.append(f'  補了 {int(cov.sum())} 格（{it} 圈；中位數 {rest} 格；留邊 {nre} 格）')
else: lines.append('  不用補（改前已經 PASS 或沒有新規則的格子）')
lines.append(f'  共 {time.time()-t0:.0f} 秒')
open(os.path.join(OUT, tag + '.txt'), 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
