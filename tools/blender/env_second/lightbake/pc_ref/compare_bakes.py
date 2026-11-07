"""比較兩次烘焙（BAKE-PC-1102）：雲端 CPU 和 PC（CPU 或 GPU）各烘一次 pc_bake_dorm_ref.py，同一個場景、同一組參數。
  python3 tools/blender/env_second/lightbake/pc_ref/compare_bakes.py <參考資料夾（雲端）> <要比的資料夾（PC）> [--json 輸出.json]
一致才採用（BB_229 第 1 條）。判斷標準（先寫好、看結果以前就定）：
  ① day／night／dark 三張的平均亮度比 0.97～1.03（只算有分到光照的像素；平均 < 0.02 的那張〔熄燈〕8 位元量化不準，不看比例）；
  ② 每個像素的亮度差（同一個 UV 位置），平均 ≤ 3/255、95 百分位 ≤ 12/255；
  ③ 兩邊的圖一樣大、有效像素（alpha）一樣。
時間只報告，不當標準（GPU 快多少是使用者要知道的數字）。
"""
import sys, json, os
import numpy as np
from PIL import Image

A = sys.argv[1:]
if len(A) < 2: print(__doc__); sys.exit(2)
REF, CMP = A[0], A[1]
W = np.array([0.2126, 0.7152, 0.0722], np.float32)

def load(d, k):
    p = os.path.join(d, 'd_%s.png' % k)
    if not os.path.exists(p): return None
    im = np.asarray(Image.open(p).convert('RGBA'), dtype=np.float32) / 255.0
    return im

def meta(d):
    out = {}
    for f in ('stats.json', 'd.json'):
        try: out.update(json.load(open(os.path.join(d, f), encoding='utf-8')))
        except Exception: pass
    return {k: out.get(k) for k in ('device', 'blender', 'bake_seconds', 'total_seconds', 'res', 'samples')}

res = {'ref': REF, 'cmp': CMP, 'ref_meta': meta(REF), 'cmp_meta': meta(CMP), 'images': {}, 'pass': True, 'why': []}
for k in ('day', 'night', 'dark'):
    a, b = load(REF, k), load(CMP, k)
    if a is None or b is None:
        res['images'][k] = 'missing'; res['pass'] = False; res['why'].append(k + ' 少一張'); continue
    if a.shape != b.shape:
        res['images'][k] = 'size %s vs %s' % (a.shape, b.shape); res['pass'] = False; res['why'].append(k + ' 大小不同'); continue
    ma, mb = a[..., 3] > 0.5, b[..., 3] > 0.5
    same_mask = bool((ma == mb).all())
    la, lb = a[..., :3] @ W, b[..., :3] @ W
    m = ma & mb & ((la > 0) | (lb > 0))   # 只比有分到光照的像素（貼圖空白的地方兩邊都是 0，算進去會把差異稀釋掉）
    mean_a, mean_b = float(la[m].mean()), float(lb[m].mean())
    ratio = mean_b / mean_a if mean_a > 1e-6 else float('nan')
    d = np.abs(la[m] - lb[m]) * 255.0
    r = {'mean_ref': round(mean_a, 5), 'mean_cmp': round(mean_b, 5), 'ratio': round(ratio, 4), 'mad_255': round(float(d.mean()), 3), 'p95_255': round(float(np.percentile(d, 95)), 3), 'p99_255': round(float(np.percentile(d, 99)), 3), 'alpha_same': same_mask}
    ratio_ok = (0.97 <= ratio <= 1.03) if mean_a >= 0.02 else True   # 熄燈那張很暗（平均 < 0.02＝5/255）：8 位元量化讓比例不準，只看像素差
    ok = ratio_ok and r['mad_255'] <= 3.0 and r['p95_255'] <= 12.0 and same_mask
    r['ok'] = ok; res['images'][k] = r
    if not ok: res['pass'] = False; res['why'].append('%s：亮度比 %.3f、平均差 %.2f/255、95%% %.1f/255、alpha %s' % (k, ratio, r['mad_255'], r['p95_255'], '同' if same_mask else '不同'))
    # 差異圖（看差在哪裡）：放大 8 倍
    try:
        out = os.path.join(CMP, 'diff_%s.png' % k); dm = np.zeros(la.shape, np.float32); dm[m] = np.abs(la[m] - lb[m]) * 8.0
        Image.fromarray((np.clip(dm, 0, 1) * 255).astype(np.uint8)).save(out)
    except Exception: pass
ta, tb = res['ref_meta'].get('bake_seconds'), res['cmp_meta'].get('bake_seconds')
if ta and tb: res['speedup'] = round(ta / tb, 2)
print(json.dumps(res, ensure_ascii=False, indent=1))
print('RESULT', 'PASS（一致，可以採用）' if res['pass'] else 'FAIL（不一致：' + '；'.join(res['why']) + '）')
if '--json' in A: json.dump(res, open(A[A.index('--json') + 1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
sys.exit(0 if res['pass'] else 1)
