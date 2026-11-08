"""新生南路 BB-B XS9 判定的兩處修正（LAWWW2-B 2026-11-08）。不需要瀏覽器：python3 tests/xs9_haopai_shanlan_check.py
1. 好拍：進門右手那面牆（WALL_right_wall_wall 朝室內那一面）前段 z 0～6 的光照，白天、晚上都 ≥ 0.35
   （舊版：牆前 9 mm 的鏤空洞洞板烘焙時被當實心，0.01～0.03；左牆同一段 0.24～0.38）
2. 山嵐：左前那根柱子（shl_wall 裡，x −2.2～−0.8、z 4～6.5）朝街那一面 1F（y 0～3.95）白天平均 0.50～0.70（舊版 0.82 整面亮黃；旁邊柱子 0.6 左右）
3. 山嵐：旁邊那根柱子（x 1.5～3、z −1～0）朝街那一面不動（白天 1F 平均 0.55～0.70）；晚上那根柱子不動（≤ 0.70）
光照貼圖值＝WebP 編碼值 0～1，三角形上均勻取點、面積平均。"""
import json, struct, sys
import numpy as np
from PIL import Image
def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); b0 = 20 + n + 8
    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
        st = bv.get('byteStride', k * np.dtype(dt).itemsize)
        raw = np.frombuffer(b, dtype=np.uint8, count=st * (a['count'] - 1) + k * np.dtype(dt).itemsize, offset=off)
        return np.lib.stride_tricks.as_strided(raw, shape=(a['count'], k * np.dtype(dt).itemsize), strides=(st, 1)).copy().view(dt).reshape(a['count'], k)
    lm = J['scenes'][0]['extras']['lightmap']; ims = {t: np.asarray(Image.open(lm[t]).convert('RGB'), float) / 255 for t in ('day', 'night')}
    return J, acc, ims
def mean(p, node, box, ax, sg):
    J, acc, ims = load(p); rng = np.random.default_rng(0); out = {t: [0.0, 0.0] for t in ims}
    for nd in J['nodes']:
        if nd.get('name') != node: continue
        t0 = np.array(nd.get('translation', [0, 0, 0]))
        for pr in J['meshes'][nd['mesh']]['primitives']:
            P = acc(pr['attributes']['POSITION']).astype(float) + t0; U = acc(pr['attributes']['TEXCOORD_1']).astype(float); I = acc(pr['indices']).reshape(-1, 3); T = P[I]
            N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); A = np.linalg.norm(N, axis=1) / 2; Nn = N / np.maximum(2 * A[:, None], 1e-12)
            for k in np.where((A > 1e-5) & (Nn[:, ax] * sg > 0.866))[0]:
                ns = int(min(4000, max(16, A[k] / 0.0025))); r = rng.random((ns, 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]; w = np.c_[1 - r.sum(1), r]; q = w @ T[k]; uv = w @ U[I[k]]
                sel = (q[:, 0] >= box[0]) & (q[:, 0] <= box[1]) & (q[:, 1] >= box[2]) & (q[:, 1] <= box[3]) & (q[:, 2] >= box[4]) & (q[:, 2] <= box[5])
                if not sel.any(): continue
                for t, im in ims.items():
                    H, W, _ = im.shape; v = im[np.clip((uv[sel, 1] * H).astype(int), 0, H - 1), np.clip((uv[sel, 0] * W).astype(int), 0, W - 1)].mean(1)
                    out[t][0] += v.sum() * A[k] / ns; out[t][1] += sel.sum() * A[k] / ns
    return {t: s[0] / s[1] for t, s in out.items()}
fails = 0
def check(ok, msg):
    global fails
    print(('PASS ' if ok else 'FAIL ') + msg); fails += 0 if ok else 1
HP = 'assets/models/env/second_ai/bb_support/haopai.glb'; SL = 'assets/models/env/second_ai/aa_support/shanlan.glb'
v = mean(HP, 'WALL_right_wall_wall', (2.0, 2.2, 0, 3.4, 0, 6), 0, -1)
check(v['day'] >= 0.35 and v['night'] >= 0.35, '1 好拍右牆前段 白天 %.3f 晚上 %.3f ≥ 0.35' % (v['day'], v['night']))
v = mean(SL, 'shl_wall', (-2.2, -0.8, 0, 3.95, 4, 6.5), 2, 1)
check(0.50 <= v['day'] <= 0.70, '2 山嵐左前柱子朝街那面 1F 白天 %.3f 在 0.50～0.70' % v['day'])
check(v['night'] <= 0.70, '3 同一根晚上 %.3f ≤ 0.70（晚上不動）' % v['night'])
v = mean(SL, 'shl_wall', (1.5, 3.0, 0, 3.95, -1, 0), 2, 1)
check(0.55 <= v['day'] <= 0.70, '3 旁邊柱子朝街那面 1F 白天 %.3f 在 0.55～0.70（不動）' % v['day'])
print('ALL PASS' if not fails else 'FAILED %d' % fails); sys.exit(1 if fails else 0)
