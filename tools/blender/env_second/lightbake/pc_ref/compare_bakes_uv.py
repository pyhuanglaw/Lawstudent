"""比較兩次烘焙（BAKE-PC-1102 第二版比法）：不同 Blender 版本（雲端 5.2.2、PC 5.2.3）排出來的光照貼圖 UV 不一樣，
同一個像素位置對到的是不同的面，逐像素比（compare_bakes.py）會整片「不一致」——那不是光不一樣，是排版不一樣。
這支改成**照每個模型自己的 TEXCOORD_1 去貼圖取值**：每個三角形的中心點（UV 取三個頂點的平均，落在 UV 島裡面，不會取到島外的空白），
用 3D 位置配對兩邊同一個網格裡最近的三角形中心（距離 ≤ 1 cm；UV 接縫切法不同時頂點數會差幾個，用頂點編號配不起來），比兩邊在那一點的光照亮度。
  python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes_uv.py <參考資料夾> <要比的資料夾> [--json 輸出.json]
資料夾裡要有 d.glb、d_day.png、d_night.png、d_dark.png（pc_bake_dorm_ref.py 的輸出；3F 的 pc_bake_3f_ref.py 沒有熄燈那張，兩邊都沒有就跳過）。
另外印每個網格各自的差（json 的 per_mesh）：看差的是大平面還是少數小東西。
判斷標準（和 compare_bakes.py 同一組，只是改成「每個頂點」）：
  ① day／night 平均亮度比 0.97～1.03（熄燈那張平均 < 0.02 不看比例）；
  ② 每個頂點的亮度差：平均 ≤ 3/255、95 百分位 ≤ 12/255；
  ③ 兩邊的網格名稱一樣、每個網格 ≥ 95% 的三角形中心配得到（配不到＝輸入模型不同，不能比）。
取值用雙線性內插；貼圖邊緣 2 像素以內的點不算，另外報有幾個。
"""
import sys, json, struct, os
import numpy as np
from PIL import Image

A = sys.argv[1:]
if len(A) < 2: print(__doc__); sys.exit(2)
REF, CMP = A[0], A[1]
W = np.array([0.2126, 0.7152, 0.0722], np.float32)
CT = {5126: ('<f4', 4), 5123: ('<u2', 2), 5121: ('<u1', 1), 5125: ('<u4', 4)}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def read_glb(p):
    b = open(p, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
    off = 20 + n; bn = struct.unpack('<I', b[off:off + 4])[0]; bin_ = b[off + 8:off + 8 + bn]
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
        dt, sz = CT[a['componentType']]; nc = NC[a['type']]
        o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride') or sz * nc
        raw = np.frombuffer(bin_, dtype=np.uint8, count=stride * (a['count'] - 1) + sz * nc, offset=o)
        arr = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], sz * nc), strides=(stride, 1)).copy().view(dt).reshape(a['count'], nc).astype(np.float32)
        if a.get('normalized') and a['componentType'] != 5126: arr /= float(np.iinfo(np.dtype(dt)).max)
        return arr
    out = {}
    for m in j['meshes']:
        for k, pr in enumerate(m['primitives']):
            uv = pr['attributes'].get('TEXCOORD_1')
            if uv is None: continue
            P, U = acc(pr['attributes']['POSITION'])[:, :3], acc(uv)
            idx = acc(pr['indices']).astype(np.int64).reshape(-1, 3) if 'indices' in pr else np.arange(len(P)).reshape(-1, 3)
            out[m['name']] = (P[idx].mean(1), U[idx].mean(1))   # 三角形中心：位置、光照貼圖 UV
    return out


def load(d, k):
    p = os.path.join(d, 'd_%s.png' % k)
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) / 255.0 if os.path.exists(p) else None


def sample(img, uv):
    h, w = img.shape[:2]
    x = uv[:, 0] * w - 0.5; y = uv[:, 1] * h - 0.5   # glTF 的 UV 原點在左上（v 往下），和 PNG 的列方向一樣
    edge = (x < 2) | (y < 2) | (x > w - 3) | (y > h - 3)
    x = np.clip(x, 0, w - 1.001); y = np.clip(y, 0, h - 1.001)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[:, None]; fy = (y - y0)[:, None]
    c = (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)
    return c @ W, edge


ga, gb = read_glb(os.path.join(REF, 'd.glb')), read_glb(os.path.join(CMP, 'd.glb'))
res = {'ref': REF, 'cmp': CMP, 'pass': True, 'why': [], 'images': {}}
same_keys = sorted(set(ga) & set(gb)); miss = sorted(set(ga) ^ set(gb))
PAIR = {}; bad_n = []
for key in same_keys:   # 每個中心點找對方最近的中心點（分塊算距離）
    pa, pb = ga[key][0], gb[key][0]; best = np.empty(len(pa), int); dist = np.empty(len(pa))
    for i in range(0, len(pa), 512):
        d2 = ((pa[i:i + 512, None, :] - pb[None, :, :]) ** 2).sum(-1); best[i:i + 512] = d2.argmin(1); dist[i:i + 512] = np.sqrt(d2.min(1))
    ok = dist <= 0.01; PAIR[key] = (ok, best)
    if ok.mean() < 0.95: bad_n.append('%s %.0f%%' % (key, ok.mean() * 100))
res['meshes'] = len(same_keys); res['mesh_mismatch'] = miss[:10]; res['unmatched'] = bad_n[:10]
if miss or bad_n: res['pass'] = False; res['why'].append('網格名稱不一樣或三角形配不到（輸入模型不同，不能比）')
res['uv_identical_meshes'] = sum(1 for k in same_keys if len(ga[k][1]) == len(gb[k][1]) and np.allclose(ga[k][1], gb[k][1], atol=1e-6))
for k in ('day', 'night', 'dark'):
    ia, ib = load(REF, k), load(CMP, k)
    if ia is None and ib is None: res['images'][k] = '兩邊都沒有（這個場景不烘）'; continue   # 3F 沒有熄燈那張（pc_bake_3f_ref.py）
    if ia is None or ib is None: res['images'][k] = 'missing'; res['pass'] = False; res['why'].append(k + ' 少一張'); continue
    la, lb, edges, pm = [], [], 0, []
    for key in same_keys:
        ok, best = PAIR[key]
        va, ea = sample(ia, ga[key][1]); vb, eb = sample(ib, gb[key][1][best]); keep = ok & ~(ea | eb); edges += int((ok & (ea | eb)).sum())
        la.append(va[keep]); lb.append(vb[keep])
        if keep.any():   # 每個網格各自的差（BK1、BK2 都是這樣找出差在哪一種東西：大平面中位數很小、差的集中在少數網格）
            dd = np.abs(va[keep] - vb[keep]) * 255.0
            pm.append({'mesh': key, 'n': int(keep.sum()), 'ref_255': round(float(va[keep].mean() * 255), 1), 'cmp_255': round(float(vb[keep].mean() * 255), 1),
                       'median_255': round(float(np.median(dd)), 2), 'mad_255': round(float(dd.mean()), 2)})
    res.setdefault('per_mesh', {})[k] = sorted(pm, key=lambda r: -r['n'] * r['mad_255'])
    la = np.concatenate(la); lb = np.concatenate(lb)
    m = (la > 0) | (lb > 0)
    ma, mb = float(la[m].mean()), float(lb[m].mean()); ratio = mb / ma if ma > 1e-6 else float('nan')
    d = np.abs(la[m] - lb[m]) * 255.0
    r = {'points': int(m.sum()), 'edge_skipped': edges, 'mean_ref': round(ma, 5), 'mean_cmp': round(mb, 5), 'ratio': round(ratio, 4),
         'mad_255': round(float(d.mean()), 3), 'p95_255': round(float(np.percentile(d, 95)), 3), 'p99_255': round(float(np.percentile(d, 99)), 3)}
    ok = ((0.97 <= ratio <= 1.03) if ma >= 0.02 else True) and r['mad_255'] <= 3.0 and r['p95_255'] <= 12.0
    r['ok'] = ok; res['images'][k] = r
    if not ok: res['pass'] = False; res['why'].append('%s：亮度比 %.3f、平均差 %.2f/255、95%% %.1f/255' % (k, ratio, r['mad_255'], r['p95_255']))
print(json.dumps({k: v for k, v in res.items() if k != 'per_mesh'}, ensure_ascii=False, indent=1))
for k, rows in res.get('per_mesh', {}).items():
    print('== %s：每個網格（照 點數×平均差 排，前 8 個）' % k)
    for r in rows[:8]: print('  %-26s n=%5d 參考 %6.1f  比較 %6.1f  中位數差 %5.1f  平均差 %5.1f' % (r['mesh'], r['n'], r['ref_255'], r['cmp_255'], r['median_255'], r['mad_255']))
print('RESULT', 'PASS（一致，可以採用）' if res['pass'] else 'FAIL（' + '；'.join(res['why']) + '）')
if '--json' in A: json.dump(res, open(A[A.index('--json') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
sys.exit(0 if res['pass'] else 1)
