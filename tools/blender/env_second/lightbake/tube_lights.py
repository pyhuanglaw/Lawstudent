#!/usr/bin/env python3
"""從 GLB 的燈管網格讀出每一盞燈的位置 → bake_room.py 的 --lights 字串（LAWWW2-B 2026-11-07）。
用法：python3 tube_lights.py <房間.glb> [--mesh 正規式，預設 _tubes$] [--w 每盞瓦數，預設 30] [--shrink 面光源比燈管小多少 m，預設 0.02] [--list]
  燈管網格裡相連的三角形＝一盞（一支燈管或一片燈板）；每一盞輸出一格 x0,x1,z0,z1,y,1,1,W,寬,深（中心＝那一盞的中心、高度＝它的下緣）。
  只看網格節點自己的 translation（產生器的網格都掛在房間根節點、沒有旋轉縮放；有旋轉縮放的會停下來）。
為什麼：研討室、辦公室、教室這一批房間的燈位寫在各自的產生器裡，逐間手抄容易抄錯；直接讀交出去的模型，燈和看得到的燈管一定對得上。
"""
import sys, json, struct, re
import numpy as np


def arg(k, d=None):
    a = sys.argv
    return a[a.index(k) + 1] if k in a else d


def read(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
    o = 20 + n; bn = struct.unpack('<I', b[o:o + 4])[0]
    return j, b[o + 8:o + 8 + bn]


def acc(j, binc, i, comps):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    st = bv.get('byteOffset', 0) + a.get('byteOffset', 0); it = np.dtype(dt).itemsize * comps; stride = bv.get('byteStride') or it
    raw = np.frombuffer(binc, dtype=np.uint8, count=stride * (a['count'] - 1) + it, offset=st)
    rows = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], it), strides=(stride, 1))
    return np.frombuffer(rows.copy().tobytes(), dtype=dt).reshape(a['count'], comps)


def lamps(p, mesh_re):
    j, binc = read(p); out = []
    for nd in j['nodes']:
        if 'mesh' not in nd or not re.search(mesh_re, nd.get('name', '')): continue
        assert 'rotation' not in nd and 'scale' not in nd and 'matrix' not in nd, ('燈管網格有旋轉縮放，這個工具不處理', nd['name'])
        t = np.array(nd.get('translation', [0, 0, 0]), dtype=np.float64)
        for pr in j['meshes'][nd['mesh']]['primitives']:
            P = acc(j, binc, pr['attributes']['POSITION'], 3).astype(np.float64) + t
            I = acc(j, binc, pr['indices'], 1).ravel() if 'indices' in pr else np.arange(len(P))
            # 相連的三角形：同一個位置（四捨五入到 0.1 mm）的頂點算同一點，union-find
            key = {}; vid = np.array([key.setdefault(tuple(np.round(v, 4)), len(key)) for v in P])
            par = list(range(len(key)))
            def f(x):
                while par[x] != x: par[x] = par[par[x]]; x = par[x]
                return x
            tri = vid[I].reshape(-1, 3)
            for a, b, c in tri:
                ra, rb, rc = f(a), f(b), f(c); par[rb] = ra; par[f(rc)] = ra
            groups = {}
            for k, v in enumerate(vid): groups.setdefault(f(v), []).append(k)
            for g in groups.values():
                q = P[g]; lo, hi = q.min(0), q.max(0)
                out.append(dict(x=(lo[0] + hi[0]) / 2, z=(lo[2] + hi[2]) / 2, y=lo[1], sx=hi[0] - lo[0], sz=hi[2] - lo[2]))
    return sorted(out, key=lambda d: (round(d['z'], 2), round(d['x'], 2)))


if __name__ == '__main__':
    p = sys.argv[1]; L = lamps(p, arg('--mesh', r'_tubes$')); W = float(arg('--w', '30')); sh = float(arg('--shrink', '0.02'))
    if '--list' in sys.argv:
        for d in L: print('x %.3f z %.3f y %.3f  %.2f×%.2f' % (d['x'], d['z'], d['y'], d['sx'], d['sz']))
        print(len(L), '盞', file=sys.stderr); sys.exit(0)
    assert L, '找不到燈管網格'
    print(';'.join('%.3f,%.3f,%.3f,%.3f,%.3f,1,1,%g,%.2f,%.2f' % (d['x'] - 0.01, d['x'] + 0.01, d['z'] - 0.01, d['z'] + 0.01, d['y'] - 0.005, W, max(0.05, d['sx'] - sh), max(0.05, d['sz'] - sh)) for d in L))
