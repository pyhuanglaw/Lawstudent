"""從參考圖反推鏡頭（camRef）：參考圖上幾個點的像素位置 ↔ 配置裡同一個東西的遊戲座標，最小平方法解眼睛、方向、焦距。
LAWWW2-C 2026-11-05（TONGXIAN-REF-1105；RULES_2D_TO_3D.md 第 2 步）。

為什麼要有這支：參考圖多半是 AI 生成的，透視不完全一致；照消失點推（same_angle_check.py 也會報消失點）只拿得到方向，
拿不到「站在哪裡」。這支讓所有對應點一起決定：眼睛 (x, y, z)、往東偏幾度（yaw）、俯仰（pitch）、焦距（感光元件寬 36 mm）。
解出來站不住、焦距太廣，就是配置和參考圖對不上（同弦：窗被外觀綁在西半邊）——這時候不要硬用，照 RULES_2D_TO_3D.md 第 2 步挑候選鏡頭。

用法（雲端：python3 -m venv <資料夾>；<資料夾>/bin/pip install numpy scipy）：
  python fit_refcam.py 對應點.json [--lens-min 24] [--lens-max 50] [--eye-box x0,x1,y0,y1,z0,z1] [--out 結果.json]
對應點.json：
  {"image": [寬, 高],
   "points": [{"name": "窗左上", "p": [-3.0, 2.53, -5.2], "px": [245, 172], "w": 1.0}, ...]}
  p＝遊戲座標（x 東、y 上、z 南），px＝參考圖像素（左上原點）。w 是權重（重要的點 1.5、沒把握的 0.5）。
  遊戲做成鏡像的（參考圖的轉角在左、遊戲在右）：先把參考圖左右翻過來再量像素。
輸出：最好的鏡頭（eye、look＝往前 7 m 的點、lens、水平視角、yaw、pitch）＋每一點的殘差（像素）。
  look 和 lens 可以直接填進配置的 camRef、或 glb_preview.py 的 views（水平視角）。
"""
import json, math, sys
import numpy as np
from scipy.optimize import least_squares

A = sys.argv[1:]
if not A: sys.exit(__doc__)
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
spec = json.load(open(A[0], encoding='utf-8'))
W, H = spec['image']; PTS = spec['points']
lens_min, lens_max = float(opt('--lens-min', 24)), float(opt('--lens-max', 50))
box = [float(v) for v in opt('--eye-box', '-50,50,0.9,2.0,-50,50').split(',')]


def proj(par, P):
    ex, ey, ez, psi, phi, T = par
    d = np.array(P) - np.array([ex, ey, ez])
    f = np.array([math.sin(psi) * math.cos(phi), math.sin(phi), -math.cos(psi) * math.cos(phi)])
    r = np.array([math.cos(psi), 0.0, math.sin(psi)]); u = np.cross(r, f)
    xc, yc, zc = d @ r, d @ u, d @ f
    F = (W / 2) / T
    return np.array([W / 2 + F * xc / zc, H / 2 - F * yc / zc]), zc


def res(par):
    out = []
    for q in PTS:
        s, zc = proj(par, q['p']); w = q.get('w', 1.0)
        out += list(w * (s - np.array(q['px'])) / W) if zc > 0.05 else [w * 10.0, w * 10.0]   # 跑到鏡頭後面：重罰
    return out


lo = [box[0], box[2], box[4], -1.2, -0.4, 18 / lens_max]; hi = [box[1], box[3], box[5], 1.2, 0.4, 18 / lens_min]
best = None
cx, cz = np.mean([q['p'][0] for q in PTS]), np.mean([q['p'][2] for q in PTS])
for ez0 in np.linspace(max(box[4], cz + 2), min(box[5], cz + 14), 5):
    for ex0 in np.linspace(max(box[0], cx - 3), min(box[1], cx + 3), 3):
        for psi0 in (-0.4, 0.0, 0.4):
            x0 = [min(max(ex0, lo[0]), hi[0]), min(max(1.3, lo[1]), hi[1]), min(max(ez0, lo[2]), hi[2]), psi0, 0.0, min(max(0.6, lo[5]), hi[5])]
            r = least_squares(res, x0, bounds=(lo, hi))
            if best is None or r.cost < best.cost: best = r
p = best.x; ex, ey, ez, psi, phi, T = p
look = [ex + 7 * math.sin(psi) * math.cos(phi), ey + 7 * math.sin(phi), ez - 7 * math.cos(psi) * math.cos(phi)]
rows = []
for q in PTS:
    s, zc = proj(p, q['p']); rows.append({'name': q['name'], 'ref_px': q['px'], 'fit_px': [round(float(s[0]), 1), round(float(s[1]), 1)], 'err_px': round(float(np.hypot(*(s - np.array(q['px'])))), 1)})
outd = {'eye': [round(ex, 3), round(ey, 3), round(ez, 3)], 'look': [round(v, 3) for v in look], 'lens': round(18 / T, 1), 'hfov_deg': round(2 * math.degrees(math.atan(T)), 2),
        'yaw_deg': round(math.degrees(psi), 1), 'pitch_deg': round(math.degrees(phi), 1), 'rms_px': round(float(np.sqrt(np.mean([r_['err_px'] ** 2 for r_ in rows]))), 1),
        'at_bound': [n for n, v, a, b in zip(('ex', 'ey', 'ez', 'yaw', 'pitch', 'lens'), p, lo, hi) if abs(v - a) < 1e-3 or abs(v - b) < 1e-3], 'points': rows}
print(json.dumps(outd, ensure_ascii=False, indent=1))
if outd['at_bound']: print('注意：', outd['at_bound'], '頂到範圍的邊——配置和參考圖可能對不上，照 RULES_2D_TO_3D.md 第 2 步挑候選鏡頭', file=sys.stderr)
if opt('--out'): json.dump(outd, open(opt('--out'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
