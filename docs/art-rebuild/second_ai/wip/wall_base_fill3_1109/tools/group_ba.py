# 指定群（表面網格 ← WALL_）補前補後的平均亮度（灰階 0～255）
import sys, json, os, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/Lawstudent/tools/blender/env_second/lightbake')
from lm_fade_reveal_check import scene
OUT, r = sys.argv[1], sys.argv[2]; pairs = [a.split('<') for a in sys.argv[3:]]; tag = r.replace('/', '__')
z = np.load(f'{OUT}/{tag}.npz'); J = json.load(open(f'{OUT}/{tag}.json')); objmap, cov, by = z['objmap'], z['cov'], z['by']
objs = scene('/home/user/Lawstudent/assets/models/env/' + r + '.glb', 8)['objs']; wn = [w[0] for w in J['walls']]
for p in J['ims']:
    a = np.asarray(Image.open(p).convert('L'), np.float32); b = np.asarray(Image.open(os.path.join(OUT, os.path.basename(p))).convert('L'), np.float32)
    for surf, wall in pairs:
        oi = [i for i, o in enumerate(objs) if o['name'] == surf]; ki = wn.index(wall)
        g = cov & np.isin(objmap, oi) & (by == ki)
        print(f'{os.path.basename(p)}  {surf} ← {wall}：{int(g.sum())} 格，補前 {a[g].mean():.1f} → 補後 {b[g].mean():.1f}')
