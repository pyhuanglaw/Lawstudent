# 分群檢查：每一群（表面網格, 蓋住它的 WALL_）各自和旁邊 3 格比（整間平均會把一小塊黑的稀釋掉：阿德整間 0.96 倍 PASS，木櫃底下那一群其實 0.3 倍）
import sys, json, os, numpy as np
from PIL import Image
from scipy import ndimage
OUT = sys.argv[1]; rooms = sys.argv[2:]; MINN = 40
for r in rooms:
    tag = r.replace('/', '__'); z = np.load(f'{OUT}/{tag}.npz'); J = json.load(open(f'{OUT}/{tag}.json'))
    objmap, cov, by, rc = z['objmap'], z['cov'], z['by'], z['rc']; wn = [w[0] for w in J['walls']]
    for p in J['ims']:
        if os.environ.get('IMGDIR') and os.path.exists(os.path.join(os.environ['IMGDIR'], os.path.basename(p))): p = os.path.join(os.environ['IMGDIR'], os.path.basename(p))
        L = np.asarray(Image.open(p).convert('L'), np.float32); bad = []
        for o in np.unique(objmap[cov]):
            co = cov & (objmap == o)
            for k in np.unique(by[co]):
                g = co & (by == k); n = int(g.sum())
                if n < MINN: continue
                ring = ndimage.binary_dilation(g, iterations=3) & ~cov & (objmap == o)
                if not ring.any(): continue
                ca, ra = L[g].mean(), L[ring].mean()
                if not (ca >= 0.85 * ra or ra - ca <= 3): bad.append((n, ca, ra, wn[k], int((g & rc).sum())))
        bad.sort(key=lambda b: -b[0] * (b[2] - b[1]))
        print(f"{r} {p.split('/')[-1]}：不合格的群 {len(bad)}" + ''.join(f"\n    {b[0]:6d} 格（新規則 {b[4]}）平均 {b[1]:.1f} 旁邊 {b[2]:.1f}（{b[1]/max(b[2],1e-6):.2f} 倍）← {b[3]}" for b in bad[:8]))
