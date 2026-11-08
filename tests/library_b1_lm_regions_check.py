"""總圖 B1 光照各區亮度（LAWWW2-B 2026-11-08；BB-B 07:14 PC GPU 判：影印中心、討論室那一帶比使用者驗收的 4.1 版暗三成多、燈板旁天花板深灰；會議廳像黑洞）。
不需要瀏覽器：python3 tests/library_b1_lm_regions_check.py
在 GLB 每個有第二套 UV 的三角形上均勻取點，照位置分區（討論室、影印中心、南走廊、自習室 A、會議廳）、照朝向分天花板／地板／牆，
讀光照貼圖（白天、晚上，WebP 編碼值 0～1）算面積平均。門檻：
  1. 討論室、影印中心、南走廊的地板、牆至少 0.40／0.40／0.25（開發 11-08 以前那一版：討論室牆 0.285、地板 0.292）
  2. 討論室、影印中心天花板至少 0.18（舊版 0.118、0.249）
  3. 會議廳（關著、沒有燈）地板、牆至少 0.08（不是黑洞；舊版 0.002、0.000），但不超過 0.25（還是比有開燈的地方暗）
  4. 自習室 A 不動（BB-B：不要改回去）：天花板、地板、牆和 0.271／0.510／0.326 差不到 0.03
  5. 白天、晚上差不多（中庭天光只照到西牆玻璃那一邊）：每一區每一種面差不到 0.05
"""
import json, struct, sys
import numpy as np
from PIL import Image
G = 'assets/models/env/second_ai/library_b1.glb'
b = open(G, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); B0 = 20 + n + 8
def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    st = v.get('byteStride', k * np.dtype(dt).itemsize); off = B0 + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    raw = np.frombuffer(b, dtype=np.uint8, count=st * (a['count'] - 1) + k * np.dtype(dt).itemsize, offset=off)
    return np.lib.stride_tricks.as_strided(raw, shape=(a['count'], k * np.dtype(dt).itemsize), strides=(st, 1)).copy().view(dt).reshape(a['count'], k)
R = {'討論室': lambda x, z: -6 < x < 6 and 7.6 < z < 13, '影印中心': lambda x, z: 12 < x < 22 and 5 < z < 13, '南走廊': lambda x, z: -22 < x < 12 and 4.8 < z < 7.4,
     '自習室A': lambda x, z: (-16 < x < 8 and -13 < z < -2.5) or (-16 < x < -8 and -2.5 < z < 4.6), '會議廳': lambda x, z: -8 < x < 8 and -2.3 < z < 4.6}
lm = J['scenes'][0]['extras']['lightmap']
imgs = {t: np.asarray(Image.open(lm[t]).convert('L'), dtype=float) / 255 for t in ('day', 'night')}
S = {}; rng = np.random.default_rng(0)
for nd in J['nodes']:
    if nd.get('mesh') is None or 'extensions' in nd: continue
    t = np.array(nd.get('translation', [0, 0, 0]))
    for pr in J['meshes'][nd['mesh']]['primitives']:
        if 'TEXCOORD_1' not in pr['attributes']: continue
        P = acc(pr['attributes']['POSITION']).astype(float) + t; I = acc(pr['indices']).reshape(-1, 3); U = acc(pr['attributes']['TEXCOORD_1']).astype(float)
        T = P[I]; N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); A = np.linalg.norm(N, axis=1) / 2; N = N / np.maximum(2 * A[:, None], 1e-12)
        for k in np.where(A > 1e-4)[0]:
            ns = int(min(200, max(4, A[k] / 0.01))); r = rng.random((ns, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]; w = np.c_[1 - r.sum(1), r]; p = w @ T[k]; uv = w @ U[I[k]]
            surf = '天花板' if N[k][1] < -0.7 else ('地板' if N[k][1] > 0.7 else '牆')
            for name, f in R.items():
                sel = np.array([f(q[0], q[2]) for q in p])
                if not sel.any(): continue
                for tt, im in imgs.items():
                    H, W = im.shape; v = im[np.clip((uv[sel, 1] * H).astype(int), 0, H - 1), np.clip((uv[sel, 0] * W).astype(int), 0, W - 1)]
                    s = S.setdefault((name, surf, tt), [0.0, 0.0]); s[0] += v.sum() * A[k] / ns; s[1] += sel.sum() * A[k] / ns
V = {k: s[0] / s[1] for k, s in S.items() if s[1] > 0}
fails = 0
def check(ok, msg):
    global fails
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: fails += 1
for name in R:
    print(name, '　'.join('%s 白天 %.3f 晚上 %.3f' % (s, V.get((name, s, 'day'), 0), V.get((name, s, 'night'), 0)) for s in ('天花板', '地板', '牆')))
for name, lo in (('討論室', 0.40), ('影印中心', 0.40), ('南走廊', 0.25)):
    for s in ('地板', '牆'):
        th = lo if not (name == '南走廊' and s == '地板') else 0.40
        check(V[(name, s, 'day')] >= th and V[(name, s, 'night')] >= th, f'1 {name}{s} ≥ {th}')
for name in ('討論室', '影印中心'):
    check(V[(name, '天花板', 'day')] >= 0.18 and V[(name, '天花板', 'night')] >= 0.18, f'2 {name}天花板 ≥ 0.18')
for s in ('地板', '牆'):
    v = V[('會議廳', s, 'night')]; check(0.08 <= v <= 0.25, f'3 會議廳{s} 0.08～0.25（{v:.3f}）')
for s, ref in (('天花板', 0.271), ('地板', 0.510), ('牆', 0.326)):
    v = V[('自習室A', s, 'day')]; check(abs(v - ref) <= 0.03, f'4 自習室A{s} ≈ {ref}（{v:.3f}）')
for name in R:
    for s in ('天花板', '地板', '牆'):
        if (name, s, 'day') in V: check(abs(V[(name, s, 'day')] - V[(name, s, 'night')]) <= 0.05, f'5 {name}{s} 白天晚上差 ≤ 0.05')
print('ALL PASS' if not fails else 'FAILED %d' % fails); sys.exit(1 if fails else 0)
