"""照參考圖做（SCENE_RULES 第 12 節；使用者 11-03 23:0x：「我已經給每個店面參考圖……要讓他們做成我給你的圖片裡的樣子」）。
把參考圖（使用者給的）和同角度的渲染（或遊戲截圖）比一比，輸出一張比對圖和一份數字報告。交件時兩樣都要附上。

用法：python3 tools/blender/env_second/ref_match.py <參考圖> <渲染圖> <輸出前綴> [--crop x0,y0,x1,y1]
  --crop：參考圖只取一部分，例如參考圖左半邊是外觀、右半邊是室內，用比例 0～1，例如 0.5,0,1,1
輸出：
  <前綴>_cmp.jpg   左：參考圖｜中：渲染｜右：兩張疊成 50%（看配置、比例、鏡頭對不對得上）；下面一列是兩邊各自的 10 色色票
  <前綴>_report.json＋印在終端機的報告：
    - 平均亮度、亮部（前 10%）、暗部（後 10%）、對比：渲染不能比參考圖更平，太白、太灰都看得出來
    - 冷暖（R−B）、飽和度：日系暖光的店，渲染偏冷、偏灰就不過
    - 色票距離：參考圖的 10 個主色，渲染裡找最接近的，平均差多少（ΔE，CIE76）
    - 九宮格亮度差：配置、亮的地方在不在同一個位置
  門檻（不過就不交）：平均亮度差 ≤ 0.08、對比 ≥ 參考圖 × 0.8、冷暖差 ≤ 0.05、色票平均 ΔE ≤ 18、九宮格亮度差平均 ≤ 0.12
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

A = sys.argv[1:]
if len(A) < 3: sys.exit(__doc__)
ref_p, ren_p, pre = A[0], A[1], A[2]
crop = [float(v) for v in A[A.index('--crop') + 1].split(',')] if '--crop' in A else None
W, H = 640, 360


def load(p, c=None):
    im = Image.open(p).convert('RGB')
    if c: w, h = im.size; im = im.crop((int(c[0] * w), int(c[1] * h), int(c[2] * w), int(c[3] * h)))
    return im.resize((W, H), Image.LANCZOS)


def lab(rgb):   # sRGB 0..1 → CIELAB
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def palette(a, k=10, it=12):   # 簡單的 k-means（固定種子）
    px = a.reshape(-1, 3)[::7]
    rng = np.random.RandomState(1103); c = px[rng.choice(len(px), k, replace=False)]
    for _ in range(it):
        d = ((px[:, None, :] - c[None]) ** 2).sum(-1); lb = d.argmin(1)
        for j in range(k):
            if (lb == j).any(): c[j] = px[lb == j].mean(0)
    cnt = np.bincount(lb, minlength=k); o = np.argsort(-cnt)
    return c[o], cnt[o] / cnt.sum()


def stats(a):
    L = a.mean(-1); s = np.sort(L.ravel())
    hi, lo = s[int(len(s) * 0.9):].mean(), s[:int(len(s) * 0.1)].mean()
    mx, mn = a.max(-1), a.min(-1); sat = np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0).mean()
    g = [L[i * H // 3:(i + 1) * H // 3, j * W // 3:(j + 1) * W // 3].mean() for i in range(3) for j in range(3)]
    return dict(mean=float(L.mean()), hi=float(hi), lo=float(lo), contrast=float(hi - lo), warm=float((a[..., 0] - a[..., 2]).mean()), sat=float(sat), grid=[float(v) for v in g])


R, N = load(ref_p, crop), load(ren_p)
ra, na = np.asarray(R).astype(np.float32) / 255, np.asarray(N).astype(np.float32) / 255
sr, sn = stats(ra), stats(na)
pr, wr = palette(ra); pn, wn = palette(na)
lr, ln = lab(pr), lab(pn)
dE = [float(np.sqrt(((ln - x) ** 2).sum(-1)).min()) for x in lr]
dE_w = float(np.average(dE, weights=wr))
grid = float(np.mean(np.abs(np.array(sr['grid']) - np.array(sn['grid']))))
checks = [
    ('平均亮度差 ≤ 0.08', abs(sn['mean'] - sr['mean']) <= 0.08, f"參考 {sr['mean']:.3f}｜渲染 {sn['mean']:.3f}"),
    ('對比 ≥ 參考 × 0.8（不能比參考圖平）', sn['contrast'] >= sr['contrast'] * 0.8, f"參考 {sr['contrast']:.3f}｜渲染 {sn['contrast']:.3f}"),
    ('冷暖差 ≤ 0.05（R−B）', abs(sn['warm'] - sr['warm']) <= 0.05, f"參考 {sr['warm']:+.3f}｜渲染 {sn['warm']:+.3f}"),
    ('色票平均 ΔE ≤ 18（參考圖 10 個主色在渲染裡找得到）', dE_w <= 18, f'ΔE {dE_w:.1f}'),
    ('九宮格亮度差平均 ≤ 0.12（亮暗的位置對得上）', grid <= 0.12, f'{grid:.3f}'),
]
rep = dict(ref=ref_p, render=ren_p, ref_stats=sr, render_stats=sn, palette_dE=dE, palette_dE_weighted=dE_w, grid_diff=grid,
           checks=[dict(name=n, ok=bool(o), info=i) for n, o, i in checks], pass_all=all(o for _, o, _ in checks))
json.dump(rep, open(pre + '_report.json', 'w'), ensure_ascii=False, indent=1)
for n, o, i in checks: print(('PASS ' if o else 'FAIL ') + n + '　' + i)
print('ALL PASS' if rep['pass_all'] else 'FAILED（照參考圖改完再交）')
# 比對圖
out = Image.new('RGB', (W * 3, H + 70), 'white'); out.paste(R, (0, 0)); out.paste(N, (W, 0)); out.paste(Image.blend(R, N, 0.5), (W * 2, 0))
d = ImageDraw.Draw(out)
for side, (p, w) in enumerate(((pr, wr), (pn, wn))):
    x = side * W + 8
    for c, f in zip(p, w):
        ww = max(6, int(f * (W - 16))); d.rectangle([x, H + 10, x + ww, H + 60], fill=tuple(int(v * 255) for v in c)); x += ww
d.text((W * 2 + 8, H + 20), 'ALL PASS' if rep['pass_all'] else 'FAILED', fill=(0, 120, 0) if rep['pass_all'] else (200, 0, 0))
out.save(pre + '_cmp.jpg', quality=85)
