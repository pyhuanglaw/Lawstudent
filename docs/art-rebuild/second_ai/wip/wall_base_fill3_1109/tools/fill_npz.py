# 用 scan.py 存的遮罩補（不重算 covered）：輸出到 OUT/，不動資產
import sys, json, os, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/Lawstudent/tools/blender/env_second/lightbake')
import lm_fill_covered as F
OUT, r = sys.argv[1], sys.argv[2]; tag = r.replace('/', '__')
z = np.load(f'{OUT}/{tag}.npz'); J = json.load(open(f'{OUT}/{tag}.json'))
imgs = [np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) for p in J['ims']]
outs, it, rest, nre = F.fill(imgs, z['objmap'], z['cov'])
for p, im in zip(J['ims'], outs):
    dst = os.path.join(OUT, os.path.basename(p)); Image.fromarray(np.clip(im + 0.5, 0, 255).astype(np.uint8)).save(dst, quality=90, method=6); print('寫', dst)
print(f'{r}：補了 {int(z["cov"].sum())} 格（{it} 圈；中位數 {rest} 格；留邊 {nre} 格）')
