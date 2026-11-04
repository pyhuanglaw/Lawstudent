"""CC-C（帳號 C）11-04：截圖基準試點的比對工具（雲端跑，要 PIL＋numpy；使用者電腦沒有）。
  比兩個資料夾裡同名的 PNG（cc_baseline_probe／cc_wz_slice_probe 的輸出）：每張算
    差的像素比例（任一色版差 > TOL，預設 8）、平均絕對差、最大差、差最多的區塊（16×16 格的範圍）；
  列出差最大的 TOP 張（預設 5），各存一張「A｜B｜差×4」的對照圖 diff_<名字>.jpg。
  不判 PASS／FAIL：只給數字和圖（判定 BB）。
用法：python3 cc_baseline_diff.py <A 資料夾> <B 資料夾> <輸出資料夾> [TOL=8] [TOP=5]"""
import os, sys, json
import numpy as np
from PIL import Image

A, B, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TOL = int(os.environ.get('TOL') or 8)
TOP = int(os.environ.get('TOP') or 5)
os.makedirs(OUT, exist_ok=True)


def load(p):
    return np.asarray(Image.open(p).convert('RGB'), dtype=np.int16)


names = sorted(n for n in os.listdir(A) if n.endswith('.png') and os.path.exists(os.path.join(B, n)))
only_a = sorted(n for n in os.listdir(A) if n.endswith('.png') and not os.path.exists(os.path.join(B, n)))
only_b = sorted(n for n in os.listdir(B) if n.endswith('.png') and not os.path.exists(os.path.join(A, n)))
rows = []
for n in names:
    a, b = load(os.path.join(A, n)), load(os.path.join(B, n))
    if a.shape != b.shape:
        rows.append({'name': n, 'shape': [list(a.shape), list(b.shape)], 'frac': 1.0, 'mean': None, 'max': None}); continue
    d = np.abs(a - b).max(axis=2)
    m = d > TOL
    frac = float(m.mean()); bbox = None
    if m.any():
        ys, xs = np.nonzero(m); bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    rows.append({'name': n, 'frac': round(frac, 6), 'mean': round(float(np.abs(a - b).mean()), 4), 'max': int(d.max()), 'bbox': bbox, 'identical': bool(d.max() == 0)})
rows.sort(key=lambda r: (-(r['frac'] or 0), -(r['mean'] or 0)))
for r in rows[:TOP]:
    if r.get('identical') or r.get('mean') is None: continue
    a, b = load(os.path.join(A, r['name'])), load(os.path.join(B, r['name']))
    d = np.clip(np.abs(a - b) * 4, 0, 255)
    h, w = a.shape[:2]
    c = Image.new('RGB', (w * 3, h))
    for i, im in enumerate([a, b, d]): c.paste(Image.fromarray(im.astype(np.uint8)), (i * w, 0))
    c.save(os.path.join(OUT, 'diff_' + r['name'][:-4] + '.jpg'), quality=85)
same = sum(1 for r in rows if r.get('identical'))
json.dump({'A': A, 'B': B, 'tol': TOL, 'n': len(rows), 'identical': same, 'only_a': only_a, 'only_b': only_b, 'rows': rows}, open(os.path.join(OUT, 'diff.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('比對 %d 張：完全一樣 %d 張；只有 A：%d、只有 B：%d（TOL=%d）' % (len(rows), same, len(only_a), len(only_b), TOL))
for r in rows[:max(TOP, 10)]:
    print('  %-34s 差的像素 %7.3f%%  平均差 %s  最大差 %s  範圍 %s' % (r['name'], (r['frac'] or 0) * 100, r['mean'], r['max'], r.get('bbox')))
