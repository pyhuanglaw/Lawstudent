"""沛珊（bl_classmate_peishan.vrm）長裙的權重修正（PS-SKIRT-LEG，LAWWW2-C 2026-10-21）：只改裙子頂點的骨架權重，臉、頭髮、衣服形狀、貼圖都不動。
起因：上霖澤館樓梯抬腳時，左膝、小腿上段從裙子前面穿出來（test_shots/ps_skirt_hand_1021：大腿中段最多在裙面外 6.7 cm）。
peishan_clothes.py 的 long_skirt_weights（第三版）：
  - 髖關節以下＝同一側大腿＋臀部，跟腿的比例 k：前 0.9、側 0.5、後 0.15；
  - 膝蓋上 6 cm～膝蓋下 10 cm 漸漸改成跟小腿。
  - 抬腿時前片有兩個問題：
    ① 膝蓋高度的前片已經跟著（垂直的）小腿，膝蓋往前頂出去；
    ② 前片 10% 留在臀部，大腿抬 70° 時被拉回約 3 cm。
這一版（只改前片，front＞0；後片、側邊和原本一樣）：
  - 改跟小腿的位置往下移：膝蓋下 FRONT_LO0～FRONT_LO1（比例照 front 漸變）；
  - 前片跟大腿的比例 k_up 提到 FRONT_K（front＝1 時）；
  - 前片中間左右兩腿的分界加寬 SIDE_W（原本 ±3.5 cm 一刀切，k＝1 時兩腿分開，中線被拉成一條裂縫）。
用法：python3 tools/blender/char_second/peishan_skirt_reweight.py <輸入.vrm> <輸出.vrm> [FRONT_K FRONT_LO0 FRONT_LO1 SIDE_W]
（純 numpy 改 glTF 二進位的 WEIGHTS_0／JOINTS_0，同樣大小寫回；不用 Blender）"""
import json, struct, sys
import numpy as np
SRC, DST = sys.argv[1], sys.argv[2]
FRONT_K, FRONT_LO0, FRONT_LO1 = (float(x) for x in (sys.argv[3:6] if len(sys.argv) >= 6 else ('1.0', '-0.06', '-0.20')))


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0); return t * t * (3 - 2 * t)


b = bytearray(open(SRC, 'rb').read()); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(bytes(b[20:20 + jl])); BIN = 20 + jl + 8


def view(i):
    A = j['accessors'][i]; V = j['bufferViews'][A['bufferView']]; n = {'VEC3': 3, 'VEC4': 4, 'SCALAR': 1}[A['type']]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[A['componentType']]
    off = BIN + V.get('byteOffset', 0) + A.get('byteOffset', 0); stride = V.get('byteStride')
    assert not stride or stride == n * np.dtype(dt).itemsize, 'interleaved'
    return off, dt, n, A['count']


def read(i):
    off, dt, n, c = view(i); a = np.frombuffer(bytes(b[off:off + c * n * np.dtype(dt).itemsize]), dtype=dt); return a.reshape(c, n) if n > 1 else a


def write(i, arr):
    off, dt, n, c = view(i); raw = np.ascontiguousarray(arr.astype(dt)).tobytes(); assert len(raw) == c * n * np.dtype(dt).itemsize; b[off:off + len(raw)] = raw


# 骨頭的靜止位置（節點階層的平移累加；VRM 0.x 骨頭沒有旋轉）
par = {}
for i, nd in enumerate(j['nodes']):
    for c in nd.get('children', []): par[c] = i
def gpos(i):
    p = np.zeros(3)
    while i is not None:
        p += np.array(j['nodes'][i].get('translation', [0, 0, 0])); i = par.get(i)
    return p
NODE = {nd.get('name'): i for i, nd in enumerate(j['nodes'])}
skin = j['skins'][0]; JIDX = {j['nodes'][n]['name']: k for k, n in enumerate(skin['joints'])}
hips, lu, ll, ru, rl = (JIDX[n] for n in ('J_Bip_C_Hips', 'J_Bip_L_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_UpperLeg', 'J_Bip_R_LowerLeg'))
yj = 0.5 * (gpos(NODE['J_Bip_L_UpperLeg'])[1] + gpos(NODE['J_Bip_R_UpperLeg'])[1]); yk = 0.5 * (gpos(NODE['J_Bip_L_LowerLeg'])[1] + gpos(NODE['J_Bip_R_LowerLeg'])[1])
zc = gpos(NODE['J_Bip_C_Hips'])[2]

mesh = next(m for m in j['meshes'] if any('Skirt' in j['materials'][p['material']]['name'] for p in m['primitives']))
pr = next(p for p in mesh['primitives'] if 'Skirt' in j['materials'][p['material']]['name'])
P = read(pr['attributes']['POSITION']); J = read(pr['attributes']['JOINTS_0']).copy(); W = read(pr['attributes']['WEIGHTS_0']).copy()
I = np.unique(read(pr['indices']))
for p in mesh['primitives']:   # 同一個網格的其他部分（上衣、鞋）共用頂點：裙子的頂點不能也被它們用到
    if p is pr: continue
    assert p['attributes']['POSITION'] == pr['attributes']['POSITION']
    assert not np.intersect1d(np.unique(read(p['indices'])), I).size, 'shared verts'
Q = P[I]; y = Q[:, 1]
r = np.hypot(Q[:, 0], Q[:, 2] - zc); front = np.clip(-(Q[:, 2] - zc) / np.maximum(r, 1e-6), -1, 1)   # VRM 0.x：前面是 −z
legs = np.isin(J[I], [lu, ll, ru, rl]) & (W[I] > 1e-4)
sel = legs.any(1) & (y < yj - 0.10) & (front > 0)          # 只動已經跟腿走、而且在前半邊的頂點（上面是裙頭，照舊）
fw = np.clip(front, 0, 1)
k_old = 0.5 + 0.4 * fw; k_new = k_old + (FRONT_K - 0.9) * fw   # front＝1 時 0.9 → FRONT_K
lo_old = sstep(yk + 0.06, yk - 0.10, y)
lo_new = sstep(yk + 0.06 + (FRONT_LO0 - 0.06) * fw, yk - 0.10 + (FRONT_LO1 + 0.10) * fw, y)
SIDE_W = float(sys.argv[6]) if len(sys.argv) >= 7 else 0.06
hw = 0.035 + SIDE_W * fw                                       # 左右的分界：原本 ±3.5 cm；前片中間加寬（兩腿分開時中線不會被拉成一條裂縫）
sideL = sstep(-hw, hw, Q[:, 0])                               # VRM 0.x：+x 是人物的左邊
n_changed = 0
for t in np.nonzero(sel)[0]:
    k = min(1.0, k_new[t]); lo = lo_new[t]; sL = sideL[t]
    w = {lu: sL * k * (1 - lo), ru: (1 - sL) * k * (1 - lo), ll: sL * k * lo, rl: (1 - sL) * k * lo, hips: 1 - k}
    top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; s = sum(v for _, v in top) or 1.0
    vi = I[t]; J[vi] = [a for a, _ in top]; W[vi] = [v / s for _, v in top]; n_changed += 1
write(pr['attributes']['JOINTS_0'], J); write(pr['attributes']['WEIGHTS_0'], W)
open(DST, 'wb').write(bytes(b))
print(json.dumps({'skirt_verts': int(len(I)), 'changed': n_changed, 'hip_y': round(float(yj), 3), 'knee_y': round(float(yk), 3), 'FRONT_K': FRONT_K, 'FRONT_LO': [FRONT_LO0, FRONT_LO1], 'SIDE_W': SIDE_W, 'out': DST}))
