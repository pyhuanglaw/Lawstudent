"""光照貼圖「被牆蓋住、牆淡出時會露出來」的格子不能是黑的（BB-B 11-08 LM3_cloud；LAWWW2-B lm_fill_covered.py）——不需要瀏覽器、不需要 Blender（D131）。
檢查：六間有隔間牆的房間（總圖 B1、研究小間、霖澤 5F、體育館 B1、美國公寓、合租戶）＋11-09 #204 五個（宿舍四人房、205、萬才館一樓、大口漢堡一樓、溫州街茶屋）＋#204 第二批兩個（公館轉角唱片、溫州街阿德；LAWWW-B 21:19 選），
  每一張光照貼圖（白天、晚上；5F、四人房加熄燈）：
  被 WALL_ 網格蓋住、而且有鏡頭／玩家位置會讓它露出來的格子（lm_fill_covered.covered），平均亮度 ≥ 旁邊 3 格內同一個網格沒被蓋住的格子的 0.85 倍。
  （熄燈那一張本來就近乎全黑：差 ≤ 3／255 也算過。）
修改前（開發 7206a12de 的光照貼圖）：牆腳下的地板、牆和牆交接處是黑的（約 0.2～0.5 倍）→ FAIL。
用法：python3 tests/lm_covered_fill_check.py   （在 repo 根目錄）"""
import os, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools/blender/env_second/lightbake'))
from lm_fill_covered import covered   # noqa: E402
A = os.path.join(ROOT, 'assets/models/env/second_ai/')
fails = 0
# 11-09 #204（LAWWW2-B；LAWWW-B 19:42 選盤點的 1～4）：宿舍四人房、205、萬才館一樓、大口漢堡一樓、溫州街茶屋（路徑相對 assets/models/env/）
E = os.path.join(ROOT, 'assets/models/env/')
for r in ['second_ai/library_b1', 'second_ai/library_carrels', 'second_ai/linze_5f', 'second_ai/gym_b1', 'second_ai/us_apartment', 'second_ai/us_shared',
          'second_ai/dorm_room4', 'second_ai/dorm_205', 'wancai_interior', 'second_ai/bb_support/dakou_1f', 'second_ai/wz_teahouse_interior',
          'second_ai/bb_support/corner', 'second_ai/bb_support/ade']:
    A = E
    ims = sorted(glob.glob(A + r + '_lm_*.webp'))
    im0 = np.asarray(Image.open(ims[0]).convert('L'), dtype=np.float32)
    H, W = im0.shape
    objmap, cov, _ = covered(A + r + '.glb', H, W)
    for p in ims:
        L = np.asarray(Image.open(p).convert('L'), dtype=np.float32)
        a = b = 0.0
        for o in np.unique(objmap[cov]):
            c = cov & (objmap == o); ring = ndimage.binary_dilation(c, iterations=3) & ~cov & (objmap == o)
            if not ring.any(): continue
            a += L[c].sum(); b += L[ring].mean() * c.sum()
        n = cov.sum(); ca, ra = a / max(n, 1), b / max(n, 1)
        ok = n == 0 or ca >= 0.85 * ra or ra - ca <= 3
        print(('PASS ' if ok else 'FAIL ') + f'{os.path.basename(p)}：被蓋住、會露出來的 {int(n)} 格，平均 {ca:.1f}，旁邊 {ra:.1f}（{ca / max(ra, 1e-6):.2f} 倍）')
        fails += not ok
print('FAILED %d' % fails if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
