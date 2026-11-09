# covered 格子分群：（表面網格, 蓋住它的 WALL_）→ 格數、中心、範圍、平均亮度（白天圖）、只因新規則的格數
import sys, json, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/Lawstudent/tools/blender/env_second/lightbake')
from lm_fade_reveal_check import scene
E = '/home/user/Lawstudent/assets/models/env/'; OUT = sys.argv[2]; r = sys.argv[1]; tag = r.replace('/', '__')
z = np.load(f'{OUT}/{tag}.npz'); J = json.load(open(f'{OUT}/{tag}.json'))
objmap, cov, pos, by, rc = z['objmap'], z['cov'], z['pos'], z['by'], z['rc']
objs = scene(E + r + '.glb', 8)['objs']   # covered() 的 objmap 照全部網格編號（含沒有第二套 UV 的）
day = [p for p in J['ims'] if '_day' in p][0]; L = np.asarray(Image.open(day).convert('L'), np.float32)
groups = []
for o in np.unique(objmap[cov]):
    for k in np.unique(by[cov & (objmap == o)]):
        m = cov & (objmap == o) & (by == k); P = pos[m]
        if len(P) < 30: continue
        groups.append({'surf': objs[o]['name'] if o < len(objs) else str(o), 'wall': J['walls'][k][0], 'dir': J['walls'][k][1], 'n': int(m.sum()), 'rc': int((m & rc).sum()),
                       'c': np.round(P.mean(0), 2).tolist(), 'min': np.round(P.min(0), 2).tolist(), 'max': np.round(P.max(0), 2).tolist(), 'lum': round(float(L[m].mean()), 1)})
groups.sort(key=lambda g: -g['n'])
json.dump(groups, open(f'{OUT}/{tag}.groups.json', 'w'), ensure_ascii=False, indent=0)
for g in groups[:int(sys.argv[3]) if len(sys.argv) > 3 else 12]: print(f"{g['n']:6d}（新 {g['rc']:5d}）亮 {g['lum']:6.1f}  {g['surf'][:28]:28s} ← {g['wall'][:30]:30s} c={g['c']} x[{g['min'][0]},{g['max'][0]}] y[{g['min'][1]},{g['max'][1]}] z[{g['min'][2]},{g['max'][2]}] dir={g['dir']}")
