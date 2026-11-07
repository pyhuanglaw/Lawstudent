import sys, os, json, io
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools'); import vroid_build as VB, hair_texture as HT
res = {}
for f in ['vroid_yuting', 'vroid_heroine_01', 'vroid_heroine_03', 'vroid_heroine_04', 'vroid_heroine_05']:
    A = VB.VRM('assets/models/char/%s.vrm' % f); B = VB.VRM(sys.argv[1] + '/%s.vrm' % f)
    changed = {ii for ii, _, m in HT.hair_images(A) if m != 'skip'}
    chv = {A.j['images'][ii]['bufferView'] for ii in changed}
    other = [i for i in range(len(A.views)) if i not in chv and A.views[i] != B.views[i]]
    ja = json.loads(json.dumps(A.j)); jb = json.loads(json.dumps(B.j)); jb['asset']['extras'].pop('hairTexture', None)
    for j in (ja, jb):
        for bv in j['bufferViews']: bv.pop('byteOffset', None); bv.pop('byteLength', None)
        for b_ in j['buffers']: b_.pop('byteLength', None)
    out = {'other_views_changed': len(other), 'json_same_except_extras': ja == jb, 'imgs': []}
    for ii in sorted(changed):
        a = np.asarray(A.get_image(ii), dtype=float); b = np.asarray(B.get_image(ii), dtype=float); al = a[..., 3] > 0
        gx = lambda x: np.abs(np.diff(x[..., :3], axis=1))[al[:, 1:]].mean()
        rowa = np.array([a[r, al[r], :3].mean(0) if al[r].any() else [0, 0, 0] for r in range(a.shape[0])]); rowb = np.array([b[r, al[r], :3].mean(0) if al[r].any() else [0, 0, 0] for r in range(b.shape[0])])
        out['imgs'].append({'image': ii, 'xgrad_before': round(gx(a), 2), 'xgrad_after': round(gx(b), 2), 'row_mean_maxdiff': round(float(np.abs(rowa - rowb).max()), 2), 'alpha_same': bool((a[..., 3] == b[..., 3]).all()), 'mean_before': np.round(a[al][:, :3].mean(0), 1).tolist(), 'mean_after': np.round(b[al][:, :3].mean(0), 1).tolist()})
    res[f] = out
print(json.dumps(res, ensure_ascii=False, indent=1))
