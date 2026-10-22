"""沛珊（bl_classmate_peishan.vrm）長裙前片的輔助骨頭（PS-SKIRT-LEG，LAWWW2 2026-10-22）：臉、頭髮、衣服形狀、貼圖都不動，只加骨頭、改裙子頂點的權重。
起因：上霖澤館樓梯抬腳時，膝蓋、大腿內側從裙子前面穿出來（量測：$SP 的 skirt_vis.js；上樓梯 90 格裡 61 格看得到膝蓋以上的腿）。
  - 裙子前片中間的頂點一半跟左腿、一半跟右腿：一條腿抬 70°、另一條不動時，中間被兩邊拉開、往身體縮進去，抬起那條腿的膝蓋內側就從中間穿出來。
  - 10-21 的試做（peishan_skirt_reweight.py）左右腿接反了（+x 當成左邊；VRM 0.x 面向 −z，人物的左邊是 −x），那次「只改權重兩全不了」的結論不算數。
這一版：
  - 加兩根骨頭（hips 的子骨）：skirt_F（髖關節中間的高度）、skirt_F_lo（skirt_F 的子骨，膝蓋高度）＝「中間的第三條腿」。
    節點的 extras.drive 寫怎麼動（遊戲 character3d.js 每一幀照它算，見 patches/skirt_drive.diff）：
      skirt_F＝兩條大腿旋轉的 slerp，偏向往前抬的那一條（t＝0.5＋(MAX−0.5)·tanh(抬起角度差／SIG)）；skirt_F_lo＝兩條小腿旋轉的 slerp，用同一個 t。
  - 權重（只改前片 front＞0、已經跟腿走的頂點，和 10-21 同一批）：
      ① 左右：|x| 小於 XA 全部跟中間那條腿，XA～XB 漸漸換成同一側的腿（左邊 −x 跟左腿）；
      ② 同一條腿上：跟腿的比例，膝蓋以上 0.5＋(K−0.5)·front、膝蓋以下 0.75＋(KLO−0.75)·front（側邊 0.5／0.75 和後片一樣，接縫才接得上），其餘留在臀部；中間那條腿 KF；
      ③ 上下：膝蓋上 LO0～膝蓋下 LO1 漸漸從大腿換成小腿（原本膝蓋上 6 cm～下 10 cm）。
用法：python3 tools/blender/char_second/peishan_skirt_bones.py <輸入.vrm> <輸出.vrm> [--k 1.0] [--kf 1.0] [--lo 0.06 -0.10] [--xa 0.03] [--xb 0.10] [--max 0.85] [--sig 0.3]
（純 numpy 改 glTF：加兩個節點、Clothes 的 skin 多兩個關節＋一份新的 inverseBindMatrices、改 JOINTS_0／WEIGHTS_0；不用 Blender）"""
import argparse, json, struct
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--k', type=float, default=1.0, help='前片跟大腿的比例（front＝1；原本 0.9）')
ap.add_argument('--klo', type=float, default=0.95, help='前片膝蓋以下跟小腿的比例（front＝1；原本 0.95，側邊 0.75 不變）')
ap.add_argument('--lo', type=float, nargs=2, default=[0.06, -0.10], help='膝蓋上下多少公尺之間從大腿換成小腿（原本 0.06 -0.10）')
ap.add_argument('--xa', type=float, default=0.03); ap.add_argument('--xb', type=float, default=0.10)
ap.add_argument('--max', type=float, default=0.85); ap.add_argument('--sig', type=float, default=0.3)
ap.add_argument('--bmax', type=float, default=0.85); ap.add_argument('--bsig', type=float, default=0.3); ap.add_argument('--bdir', type=float, default=-1.0)
ap.add_argument('--bxa', type=float, default=None); ap.add_argument('--bxb', type=float, default=None)
ap.add_argument('--back2', action='store_true', help='後片：每條腿一組只在腿往後時跟著走的骨頭（skirt_BL／BR＋_lo，gate）＋中間 skirt_B（同樣的 gate）')
ap.add_argument('--gate', type=float, nargs=2, default=[-10.0, 15.0], help='往後抬幾度之間從 kmin 漸漸到 kmax（度；負的＝往前）')
ap.add_argument('--net', action='store_true', help='--back2：下半段照大腿×小腿合起來的方向轉（坐下時後片垂直往下）')
ap.add_argument('--kbumax', type=float, default=0.6, help='--back2：腿往後時，後片膝蓋以上跟大腿的比例')
ap.add_argument('--kblmax', type=float, default=0.9, help='--back2：腿往後時，後片膝蓋以下跟小腿的比例')
ap.add_argument('--bc2', action='store_true', help='--back3：後片中間原本那一份照舊（左右腿），多的那一份給 skirt_Bg（偏向往後那條腿，gate 0→1）')
ap.add_argument('--bc', action='store_true', help='--back3：後片中間（|x|＜xb）原本那一份給 skirt_Bm（兩腿平均）、多的那一份給 skirt_Bg（偏向往後那條腿，gate 0→1）')
ap.add_argument('--back3', action='store_true', help='後片：原本的權重不動，多一份只在腿往後時才轉的骨頭（skirt_BL／BR＋_lo，gate 0→1）：腿往後時後片跟腿的比例加到 kbumax／kblmax；腿往前、坐下和原本完全一樣')
ap.add_argument('--back', action='store_true', help='後片也加一組（skirt_B，偏向往後的那條腿）')
ap.add_argument('--kbu', type=float, default=0.15, help='後片膝蓋以上跟大腿的比例（front＝−1；原本 0.15）')
ap.add_argument('--kbl', type=float, default=0.45, help='後片膝蓋以下跟小腿的比例（front＝−1；原本 0.45）')
A = ap.parse_args()


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0); return t * t * (3 - 2 * t)


raw = open(A.src, 'rb').read(); jl = struct.unpack('<I', raw[12:16])[0]; j = json.loads(raw[20:20 + jl])
binlen = struct.unpack('<I', raw[20 + jl:24 + jl])[0]; BIN = bytearray(raw[28 + jl:28 + jl + binlen])
assert len(j['buffers']) == 1 and j['buffers'][0]['byteLength'] <= binlen


def view(i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; n = {'VEC3': 3, 'VEC4': 4, 'SCALAR': 1, 'MAT4': 16}[a['type']]
    dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a['componentType']]
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0); st = v.get('byteStride')
    assert not st or st == n * np.dtype(dt).itemsize, 'interleaved'
    return off, dt, n, a['count']


def read(i):
    off, dt, n, c = view(i); x = np.frombuffer(bytes(BIN[off:off + c * n * np.dtype(dt).itemsize]), dtype=dt); return x.reshape(c, n) if n > 1 else x


def write(i, arr):
    off, dt, n, c = view(i); r = np.ascontiguousarray(arr.astype(dt)).tobytes(); assert len(r) == c * n * np.dtype(dt).itemsize; BIN[off:off + len(r)] = r


par = {}
for i, nd in enumerate(j['nodes']):
    for c in nd.get('children', []): par[c] = i


def gpos(i):   # VRM 0.x：骨頭沒有旋轉、縮放 → 世界位置＝平移累加
    p = np.zeros(3)
    while i is not None:
        nd = j['nodes'][i]; assert 'rotation' not in nd and 'scale' not in nd and 'matrix' not in nd, nd.get('name'); p += np.array(nd.get('translation', [0, 0, 0])); i = par.get(i)
    return p


NODE = {nd.get('name'): i for i, nd in enumerate(j['nodes'])}
assert 'skirt_F' not in NODE, '已經有 skirt_F（輸入要用原本的 VRM）'
HIPS = NODE['J_Bip_C_Hips']
hu, hl, ru_, rl_ = (gpos(NODE[n]) for n in ('J_Bip_L_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_UpperLeg', 'J_Bip_R_LowerLeg'))
yj, yk = 0.5 * (hu[1] + ru_[1]), 0.5 * (hl[1] + rl_[1]); zj, zk = 0.5 * (hu[2] + ru_[2]), 0.5 * (hl[2] + rl_[2])
pF, pFlo = np.array([0.0, yj, zj]), np.array([0.0, yk, zk])
LIFT = ['leftUpperLeg', 'rightUpperLeg']
drv = lambda frm, d, mx=A.max, sg=A.sig: {'drive': {'from': frm, 'lift': LIFT, 'dir': d, 'max': mx, 'sig': sg}}

# ---- 節點 ----
newn = []
def add_node(name, parent, wpos, extras):
    i = len(j['nodes']); j['nodes'].append({'name': name, 'translation': [float(x) for x in (wpos - gpos(parent))], 'extras': extras}); par[i] = parent
    j['nodes'][parent].setdefault('children', []).append(i); newn.append(i); return i
F = add_node('skirt_F', HIPS, pF, drv(['leftUpperLeg', 'rightUpperLeg'], 1)); Flo = add_node('skirt_F_lo', F, pFlo, drv(['leftLowerLeg', 'rightLowerLeg'], 1))
G = [x * np.pi / 180 for x in A.gate]
gate = lambda kmin, kmax: [float(G[0]), float(G[1]), float(kmin), float(kmax)]
if A.back2:
    A.back = False
    def gd(frm, lift, d, kmin, kmax, mx=A.bmax, sg=A.bsig, net=None):
        r = {'drive': {'from': frm, 'lift': lift, 'dir': d, 'max': mx, 'sig': sg, 'gate': gate(kmin, kmax)}}
        if net and A.net: r['drive']['net'] = net
        return r
    Bk = add_node('skirt_B', HIPS, pF, gd(['leftUpperLeg', 'rightUpperLeg'], LIFT, -1, A.kbu, A.kbumax)); Blo = add_node('skirt_B_lo', Bk, pFlo, gd(['leftLowerLeg', 'rightLowerLeg'], LIFT, -1, A.kbl, A.kblmax, net=['leftUpperLeg', 'rightUpperLeg']))
    BLn = add_node('skirt_BL', HIPS, hu, gd(['leftUpperLeg'], ['leftUpperLeg'], -1, A.kbu, A.kbumax)); add_node('skirt_BL_lo', BLn, hl, gd(['leftLowerLeg'], ['leftUpperLeg'], -1, A.kbl, A.kblmax, net=['leftUpperLeg']))
    BRn = add_node('skirt_BR', HIPS, ru_, gd(['rightUpperLeg'], ['rightUpperLeg'], -1, A.kbu, A.kbumax)); add_node('skirt_BR_lo', BRn, rl_, gd(['rightLowerLeg'], ['rightUpperLeg'], -1, A.kbl, A.kblmax, net=['rightUpperLeg']))
if A.back3:
    def g1(frm, lift): return {'drive': {'from': frm, 'lift': lift, 'dir': -1, 'gate': gate(0.0, 1.0)}}
    BLn = add_node('skirt_BL', HIPS, hu, g1(['leftUpperLeg'], ['leftUpperLeg'])); add_node('skirt_BL_lo', BLn, hl, g1(['leftLowerLeg'], ['leftUpperLeg']))
    BRn = add_node('skirt_BR', HIPS, ru_, g1(['rightUpperLeg'], ['rightUpperLeg'])); add_node('skirt_BR_lo', BRn, rl_, g1(['rightLowerLeg'], ['rightUpperLeg']))
    if A.bc2:
        Bg = add_node('skirt_Bg', HIPS, pF, {'drive': {'from': ['leftUpperLeg', 'rightUpperLeg'], 'lift': LIFT, 'dir': -1, 'max': A.bmax, 'sig': A.bsig, 'gate': gate(0.0, 1.0)}}); add_node('skirt_Bg_lo', Bg, pFlo, {'drive': {'from': ['leftLowerLeg', 'rightLowerLeg'], 'lift': LIFT, 'dir': -1, 'max': A.bmax, 'sig': A.bsig, 'gate': gate(0.0, 1.0)}})
    if A.bc:
        Bm = add_node('skirt_Bm', HIPS, pF, {'drive': {'from': ['leftUpperLeg', 'rightUpperLeg'], 'lift': LIFT, 'dir': -1, 'max': 0.5, 'sig': 0.3}}); add_node('skirt_Bm_lo', Bm, pFlo, {'drive': {'from': ['leftLowerLeg', 'rightLowerLeg'], 'lift': LIFT, 'dir': -1, 'max': 0.5, 'sig': 0.3}})
        Bg = add_node('skirt_Bg', HIPS, pF, {'drive': {'from': ['leftUpperLeg', 'rightUpperLeg'], 'lift': LIFT, 'dir': -1, 'max': A.bmax, 'sig': A.bsig, 'gate': gate(0.0, 1.0)}}); add_node('skirt_Bg_lo', Bg, pFlo, {'drive': {'from': ['leftLowerLeg', 'rightLowerLeg'], 'lift': LIFT, 'dir': -1, 'max': A.bmax, 'sig': A.bsig, 'gate': gate(0.0, 1.0)}})
if A.back:
    Bk = add_node('skirt_B', HIPS, pF, drv(['leftUpperLeg', 'rightUpperLeg'], A.bdir, A.bmax, A.bsig)); Blo = add_node('skirt_B_lo', Bk, pFlo, drv(['leftLowerLeg', 'rightLowerLeg'], A.bdir, A.bmax, A.bsig))

# ---- Clothes 的 skin：多兩（四）個關節、新的 inverseBindMatrices（其他 skin 共用的那一份不動）----
mesh = next(m for m in j['meshes'] if any('Skirt' in j['materials'][p['material']]['name'] for p in m['primitives']))
mi = j['meshes'].index(mesh); sk_i = next(nd['skin'] for nd in j['nodes'] if nd.get('mesh') == mi); skin = j['skins'][sk_i]
assert all(nd.get('skin') != sk_i for nd in j['nodes'] if nd.get('mesh') not in (None, mi)), '這個 skin 也給別的網格用'
ibm_old = read(skin['inverseBindMatrices']).reshape(-1, 16)
def ibm(p): m = np.eye(4, dtype=np.float32); m[:3, 3] = -p; return m.T.reshape(16)   # column-major
new_ibm = np.vstack([ibm_old] + [ibm(gpos(i))[None] for i in newn]).astype(np.float32)
while len(BIN) % 4: BIN.append(0)
bv = {'buffer': 0, 'byteOffset': len(BIN), 'byteLength': new_ibm.nbytes}; BIN.extend(new_ibm.tobytes()); j['bufferViews'].append(bv)
j['accessors'].append({'bufferView': len(j['bufferViews']) - 1, 'componentType': 5126, 'count': len(new_ibm), 'type': 'MAT4'})
skin['inverseBindMatrices'] = len(j['accessors']) - 1; JI = {}
for i in newn: skin['joints'].append(i); JI[j['nodes'][i]['name']] = len(skin['joints']) - 1
JN = {j['nodes'][n]['name']: k for k, n in enumerate(skin['joints'])}
hips, lu, ll, ru, rl = (JN[n] for n in ('J_Bip_C_Hips', 'J_Bip_L_UpperLeg', 'J_Bip_L_LowerLeg', 'J_Bip_R_UpperLeg', 'J_Bip_R_LowerLeg'))

# ---- 權重 ----
pr = next(p for p in mesh['primitives'] if 'Skirt' in j['materials'][p['material']]['name'])
P = read(pr['attributes']['POSITION']); J = read(pr['attributes']['JOINTS_0']).copy(); W = read(pr['attributes']['WEIGHTS_0']).copy()
assert J.dtype == np.uint16 or len(skin['joints']) < 256
I = np.unique(read(pr['indices']))
for p in mesh['primitives']:
    if p is pr: continue
    assert p['attributes']['POSITION'] == pr['attributes']['POSITION'] and not np.intersect1d(np.unique(read(p['indices'])), I).size, 'shared verts'
Q = P[I]; y = Q[:, 1]; zc = gpos(HIPS)[2]
r = np.hypot(Q[:, 0], Q[:, 2] - zc); front = np.clip(-(Q[:, 2] - zc) / np.maximum(r, 1e-6), -1, 1)   # VRM 0.x：前面是 −z
legs = np.isin(J[I], [lu, ll, ru, rl]) & (W[I] > 1e-4)
sel = legs.any(1) & (y < yj - 0.10) & ((front > 0) | A.back | A.back2 | A.back3)      # 前片（--back／--back2／--back3：後片也改）；上面是裙頭，照舊
fw = np.abs(front); isF = front >= 0
lo = sstep(yk + A.lo[0], yk + A.lo[1], y)
KU = np.where(isF, A.k, A.kbu); KL = np.where(isF, A.klo, A.kbl)
k_leg = np.minimum(1.0, (0.5 + (KU - 0.5) * fw) * (1 - lo) + (0.75 + (KL - 0.75) * fw) * lo)   # 原本：膝蓋以上 0.5＋0.4·front（後 0.5−0.35）、以下 0.75＋0.2·front（後 0.75−0.3）；側邊 0.5／0.75 不變，前後片接得上
sideL = sstep(0.035, -0.035, Q[:, 0])                                 # 人物的左邊＝−x
wC = np.where(isF, sstep(A.xb, A.xa, np.abs(Q[:, 0])), sstep(A.bxb if A.bxb is not None else A.xb, A.bxa if A.bxa is not None else A.xa, np.abs(Q[:, 0])))   # 中間那條腿的比例
n_changed = nb = 0
bwv = sstep(-0.15, -0.6, front)                                       # --back2：側邊（0）→ 後片（1）
for t in np.nonzero(sel)[0]:
    k, l, sL = k_leg[t], lo[t], sideL[t]; f = wC[t] if (isF[t] or A.back) else 0.0
    if A.back3 and not isF[t]:
        fb = fw[t]; ko = (0.5 - 0.35 * fb) * (1 - l) + (0.75 - 0.3 * fb) * l          # 原本的後片（front＝−fb）
        km = (0.5 + (A.kbumax - 0.5) * fb) * (1 - l) + (0.75 + (A.kblmax - 0.75) * fb) * l
        e = max(0.0, km - ko)
        cc = wC[t] if A.bc else 0.0
        w = {lu: (1 - cc) * sL * ko * (1 - l), ru: (1 - cc) * (1 - sL) * ko * (1 - l), ll: (1 - cc) * sL * ko * l, rl: (1 - cc) * (1 - sL) * ko * l, hips: 1 - ko - e}
        c2 = wC[t] if A.bc2 else 0.0
        for nm, v in (('skirt_BL', sL * (1 - l)), ('skirt_BL_lo', sL * l), ('skirt_BR', (1 - sL) * (1 - l)), ('skirt_BR_lo', (1 - sL) * l)): w[JI[nm]] = (1 - cc) * (1 - c2) * e * v
        if c2 > 0: w[JI['skirt_Bg']] = c2 * e * (1 - l); w[JI['skirt_Bg_lo']] = c2 * e * l
        if cc > 0:
            for nm, v in (('skirt_Bm', ko * (1 - l)), ('skirt_Bm_lo', ko * l), ('skirt_Bg', e * (1 - l)), ('skirt_Bg_lo', e * l)): w[JI[nm]] = cc * v
        top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; s_ = sum(v for _, v in top) or 1.0
        vi = I[t]; J[vi] = [a for a, _ in top] + [0] * (4 - len(top)); W[vi] = [v / s_ for _, v in top] + [0] * (4 - len(top)); nb += 1
        continue
    if A.back2 and not isF[t]:
        bw = bwv[t]; c = wC[t]
        w = {lu: (1 - bw) * sL * k * (1 - l), ru: (1 - bw) * (1 - sL) * k * (1 - l), ll: (1 - bw) * sL * k * l, rl: (1 - bw) * (1 - sL) * k * l, hips: (1 - bw) * (1 - k)}
        for nm, v in (('skirt_BL', sL * (1 - l)), ('skirt_BL_lo', sL * l), ('skirt_BR', (1 - sL) * (1 - l)), ('skirt_BR_lo', (1 - sL) * l)): w[JI[nm]] = w.get(JI[nm], 0) + bw * (1 - c) * v
        w[JI['skirt_B']] = bw * c * (1 - l); w[JI['skirt_B_lo']] = bw * c * l
        top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; s_ = sum(v for _, v in top) or 1.0
        vi = I[t]; J[vi] = [a for a, _ in top] + [0] * (4 - len(top)); W[vi] = [v / s_ for _, v in top] + [0] * (4 - len(top)); nb += 1
        continue
    cu, cl = (JI['skirt_F'], JI['skirt_F_lo']) if isF[t] else (JI.get('skirt_B'), JI.get('skirt_B_lo'))
    w = {lu: (1 - f) * sL * k * (1 - l), ru: (1 - f) * (1 - sL) * k * (1 - l), ll: (1 - f) * sL * k * l, rl: (1 - f) * (1 - sL) * k * l, hips: 1 - k}
    if f > 0: w[cu] = f * k * (1 - l); w[cl] = f * k * l
    top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; s_ = sum(v for _, v in top) or 1.0
    vi = I[t]; J[vi] = [a for a, _ in top] + [0] * (4 - len(top)); W[vi] = [v / s_ for _, v in top] + [0] * (4 - len(top))
    if isF[t]: n_changed += 1
    else: nb += 1
write(pr['attributes']['JOINTS_0'], J); write(pr['attributes']['WEIGHTS_0'], W)

# ---- 寫回 GLB ----
j['buffers'][0]['byteLength'] = len(BIN)
while len(BIN) % 4: BIN.append(0)
js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
while len(js) % 4: js += b' '
out = b''.join([b'glTF', struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(BIN)), struct.pack('<I', len(js)), b'JSON', js, struct.pack('<I', len(BIN)), b'BIN\x00', bytes(BIN)])
open(A.dst, 'wb').write(out)
print(json.dumps({'skirt_verts': int(len(I)), 'front_changed': n_changed, 'back_changed': nb, 'hip_y': round(float(yj), 3), 'knee_y': round(float(yk), 3), 'joints': len(skin['joints']),
                  'args': {k: v for k, v in vars(A).items() if k not in ('src', 'dst')}, 'out': A.dst, 'bytes': len(out)}, ensure_ascii=False))
