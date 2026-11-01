"""GLB 後處理：把「裡外相反」的封閉小零件翻成朝外（ART-LAMPSHADE-FLIP-1027，LAWWW2-B 2026-10-31）。不用重匯模型。
  python3 tools/blender/env_second/glb_flip_insideout.py 模型.glb --node 節點名稱正規式 [--max-ext 1.0] [--dry]
找法（和 lib2.single_side、tests/singleside_*_unit.js 的 insideOut 一樣）：同一個網格裡，頂點位置相同就算相連；每條邊剛好兩個面、方向相反＝封閉；
  封閉、體積是負的、最小邊長 1 mm～--max-ext 的零件＝裡外相反（單面材質從外面看到的是背面：燈罩隔著店面玻璃看明暗是反的）。
翻法：那些三角形的頂點順序對調（索引 1、2 交換），只被它們用到的頂點法線反向。只改 GLB 二進位裡的索引和法線，大小、節點、材質、其他零件都不變。
為什麼不重匯：溫州街、118 巷的店是 10-25 單面化（PERF-SINGLESIDE）以後部署的，現在的腳本重匯會連帶改到別的小零件（lib2.single_side 10-27 改 64 位元以後判斷不同）。
腳本本身也已經改（燈罩車床的輪廓反過來）：之後重匯就是對的，不需要再跑這支。"""
import json, re, struct, sys
import numpy as np
from collections import defaultdict

args = sys.argv[1:]
path = args[0]
NODE = re.compile(args[args.index('--node') + 1]) if '--node' in args else re.compile('.')
MAXE = float(args[args.index('--max-ext') + 1]) if '--max-ext' in args else 1.0
DRY = '--dry' in args
b = bytearray(open(path, 'rb').read())
n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); BIN = 20 + n + 8
COMP = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def view(i):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; off = BIN + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    dt = np.dtype(COMP[a['componentType']]); k = NC[a['type']]; st = bv.get('byteStride') or dt.itemsize * k
    return off, st, dt, k, a['count']


def read(i):
    off, st, dt, k, cnt = view(i)
    raw = np.frombuffer(bytes(b[off:off + st * (cnt - 1) + dt.itemsize * k]), dtype=np.uint8)
    out = np.empty((cnt, k), dtype=dt)
    for r in range(cnt): out[r] = np.frombuffer(raw[r * st:r * st + dt.itemsize * k].tobytes(), dtype=dt)
    return out


def write(i, arr):
    off, st, dt, k, cnt = view(i)
    for r in range(cnt): b[off + r * st:off + r * st + dt.itemsize * k] = arr[r].astype(dt).tobytes()


total = 0
for nd in j['nodes']:
    if nd.get('mesh') is None or not NODE.search(nd.get('name', '')): continue
    for pi, pr in enumerate(j['meshes'][nd['mesh']]['primitives']):
        if 'indices' not in pr: continue
        P = read(pr['attributes']['POSITION']).astype(np.float64); Iraw = read(pr['indices']).reshape(-1)
        I = Iraw.reshape(-1, 3)
        key = {}; vid = np.array([key.setdefault((round(x, 4), round(y, 4), round(z, 4)), len(key)) for x, y, z in P])
        T = vid[I]; par = list(range(len(T)))

        def f(x):
            while par[x] != x: par[x] = par[par[x]]; x = par[x]
            return x
        ed = defaultdict(list)
        for ti, (a_, b_, c_) in enumerate(T):
            for u, v in ((a_, b_), (b_, c_), (c_, a_)):
                if u != v: ed[(min(u, v), max(u, v))].append((ti, u < v))
        bad = set()
        for l in ed.values():
            if len(l) == 2 and l[0][1] != l[1][1]:
                ra, rb = f(l[0][0]), f(l[1][0])
                if ra != rb: par[ra] = rb
            else: bad.update(t for t, _ in l)
        badr = {f(x) for x in bad}; comp = defaultdict(list)
        for ti in range(len(T)):
            r = f(ti)
            if r not in badr: comp[r].append(ti)
        flip = []
        for r, tis in comp.items():
            V = P[I[tis]]; o = V[0, 0]; vol = np.sum(np.einsum('ij,ij->i', V[:, 0] - o, np.cross(V[:, 1] - o, V[:, 2] - o))) / 6
            ext = V.reshape(-1, 3).max(0) - V.reshape(-1, 3).min(0)
            if vol < 0 and 0.001 <= ext.min() <= MAXE:
                flip += tis; t = nd.get('translation', [0, 0, 0])
                print('flip', nd['name'], 'prim', pi, 'tris', len(tis), 'vol', round(vol, 5), 'at', (V.reshape(-1, 3).min(0) + t).round(2).tolist(), 'ext', ext.round(2).tolist())
        if not flip or DRY: total += len(flip); continue
        fs = set(flip); I2 = I.copy()
        for ti in flip: I2[ti, 1], I2[ti, 2] = I[ti, 2], I[ti, 1]
        write(pr['indices'], I2.reshape(-1, 1))
        if 'NORMAL' in pr['attributes']:
            used_other = set(I[[t for t in range(len(I)) if t not in fs]].reshape(-1).tolist())
            mine = set(I[flip].reshape(-1).tolist()) - used_other
            N = read(pr['attributes']['NORMAL'])
            for v in mine: N[v] = -N[v]
            write(pr['attributes']['NORMAL'], N)
        total += len(flip)
if not DRY: open(path, 'wb').write(bytes(b))
print(('會翻' if DRY else '翻了'), total, '個三角形', path)
