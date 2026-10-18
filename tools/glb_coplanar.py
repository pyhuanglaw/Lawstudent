"""找 GLB 裡「疊在同一個平面上」的面（遊戲裡會閃爍：z-fighting）——純 Python＋numpy，不需要 Blender。
和 LAWWW2-B 的 tools/blender/env_second/check_coplanar.py 同一套判斷（那支要 /opt/blenv 的 bpy；雲端容器沒有 Blender 時用這支）。
用法：python3 tools/glb_coplanar.py <glb 或資料夾> [--min-area 0.01] [--tol 0.002] [--exact 0.0005] [--top 12] [--only 物件名片段] [--json out.json]
判斷：
- 每個三角形（世界座標，套用節點的位移、旋轉、縮放）算平面：法線取到 0.02、到原點的距離取到 tol（相鄰的距離格也比，避免剛好切在格子邊）。
- 同一個平面裡兩兩比（先用平面上的外接矩形篩），算兩個三角形在平面上真正的交集面積（Sutherland–Hodgman），≥ min-area 才算。
- same＝同一面朝外、兩個平面相差 < exact（0.5 mm）＝**一定會閃**；< tol 只有遠處會閃。背對背另外計數（雙面材質、看得到背面時才閃）。
- 輸出每個檔案「一定會閃」的總面積、依面積排序的前幾對（兩個物件、材質、位置）。
"""
import json, math, os, struct, sys
import numpy as np

A = sys.argv[1:]
if not A or A[0].startswith('--'):
    print(__doc__); sys.exit(2)
TARGET = A[0]
def opt(k, d):
    return type(d)(A[A.index(k) + 1]) if k in A else d
MIN_AREA = opt('--min-area', 0.01); TOL = opt('--tol', 0.002); EXACT = opt('--exact', 0.0005); TOP = opt('--top', 12); ONLY = opt('--only', ''); OUT = opt('--json', '')
COMP = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load_glb(path):
    f = open(path, 'rb').read()
    n = struct.unpack('<I', f[12:16])[0]; j = json.loads(f[20:20 + n]); b0 = 20 + n + 8
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; fmt, sz = COMP[a['componentType']]; nc = NCOMP[a['type']]
        off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', 0) or sz * nc
        if st == sz * nc:
            arr = np.frombuffer(f, dtype=np.dtype('<' + fmt), count=a['count'] * nc, offset=off).reshape(a['count'], nc) if nc > 1 else np.frombuffer(f, dtype=np.dtype('<' + fmt), count=a['count'], offset=off)
        else:
            arr = np.array([struct.unpack_from('<%d%s' % (nc, fmt), f, off + k * st) for k in range(a['count'])])
        return arr.astype(np.float64) if fmt == 'f' else arr.astype(np.int64)
    return j, acc


def node_matrix(nd):
    if 'matrix' in nd:
        return np.array(nd['matrix'], dtype=np.float64).reshape(4, 4).T
    t = nd.get('translation', [0, 0, 0]); r = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
    x, y, z, w = r
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                  [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M = np.eye(4); M[:3, :3] = R * np.array(s); M[:3, 3] = t
    return M


def triangles(path):
    j, acc = load_glb(path)
    mats = [m.get('name', '?') for m in j.get('materials', [])]
    dbl = [bool(m.get('doubleSided')) for m in j.get('materials', [])]
    out = []   # (物件名, 材質名, 雙面, tris[n,3,3])
    def walk(ni, P):
        nd = j['nodes'][ni]; M = P @ node_matrix(nd)
        if 'mesh' in nd:
            nm = nd.get('name') or j['meshes'][nd['mesh']].get('name', '?')
            for p in j['meshes'][nd['mesh']]['primitives']:
                if p.get('mode', 4) != 4 or 'indices' not in p:
                    continue
                V = acc(p['attributes']['POSITION']); V = (np.c_[V, np.ones(len(V))] @ M.T)[:, :3]
                I = acc(p['indices']).reshape(-1, 3); mi = p.get('material')
                out.append((nm, mats[mi] if mi is not None else '-', dbl[mi] if mi is not None else False, V[I]))
        for c in nd.get('children', []):
            walk(c, M)
    for sc in j.get('scenes', [{'nodes': list(range(len(j['nodes'])))}]):
        for ni in sc.get('nodes', []):
            walk(ni, np.eye(4))
    return out


def clip(poly, a, b):   # 留下在有向邊 a→b 左邊的部分
    res = []; n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        cp = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); cq = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])
        if cp >= 0: res.append(p)
        if (cp >= 0) != (cq >= 0):
            t = cp / (cp - cq); res.append((p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])))
    return res


def area2(poly):
    return 0.5 * sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))


def overlap(t1, t2):
    if area2(t1) < 0: t1 = t1[::-1]
    if area2(t2) < 0: t2 = t2[::-1]
    poly = list(t1)
    for i in range(3):
        poly = clip(poly, t2[i], t2[(i + 1) % 3])
        if not poly: return 0.0
    return abs(area2(poly))


def scan(path):
    objs = triangles(path)
    rows = []   # 每個三角形：物件 index、平面
    T = []; N = []; D = []; OI = []
    for oi, (nm, mt, ds, tr) in enumerate(objs):
        if ONLY and ONLY not in nm: continue
        e1 = tr[:, 1] - tr[:, 0]; e2 = tr[:, 2] - tr[:, 0]; cr = np.cross(e1, e2); ar = np.linalg.norm(cr, axis=1) / 2
        ok = ar > MIN_AREA / 4   # 太小的三角形不可能疊出 min-area
        n = cr[ok] / (2 * ar[ok][:, None]); T.append(tr[ok]); N.append(n); D.append(np.einsum('ij,ij->i', n, tr[ok][:, 0])); OI.append(np.full(ok.sum(), oi))
    if not T: return {'file': path, 'tris': 0, 'pairs': []}
    T = np.concatenate(T); N = np.concatenate(N); D = np.concatenate(D); OI = np.concatenate(OI)
    # 正規化方向（第一個不是 0 的分量為正），記下翻轉
    sgn = np.where(np.abs(N[:, 0]) > 1e-6, np.sign(N[:, 0]), np.where(np.abs(N[:, 1]) > 1e-6, np.sign(N[:, 1]), np.sign(N[:, 2])))
    Nc = N * sgn[:, None]; Dc = D * sgn
    nq = np.round(Nc / 0.02).astype(np.int64); dq = np.floor(Dc / TOL).astype(np.int64)
    groups = {}
    for i in range(len(T)):
        groups.setdefault((nq[i, 0], nq[i, 1], nq[i, 2], dq[i]), []).append(i)
    pairs = {}
    done = set()
    for key, idx in groups.items():
        cand = list(idx) + groups.get(key[:3] + (key[3] + 1,), [])
        if len(cand) < 2: continue
        k0 = key[:3]
        n = Nc[idx[0]]; u = np.cross(n, [0, 0, 1] if abs(n[2]) < 0.9 else [1, 0, 0]); u /= np.linalg.norm(u); v = np.cross(n, u)
        P2 = {i: [(float(p @ u), float(p @ v)) for p in T[i]] for i in cand}
        bb = sorted(((min(q[0] for q in P2[i]), max(q[0] for q in P2[i]), min(q[1] for q in P2[i]), max(q[1] for q in P2[i]), i) for i in cand))
        act = []
        for b in bb:
            act = [a for a in act if a[1] > b[0]]
            for a in act:
                i1, i2 = a[4], b[4]
                if (min(i1, i2), max(i1, i2)) in done: continue
                if a[3] <= b[2] or b[3] <= a[2]: continue
                done.add((min(i1, i2), max(i1, i2)))
                ov = overlap(P2[i1], P2[i2])
                if ov < 1e-4: continue
                gap = abs(Dc[i1] - Dc[i2]); same = float(N[i1] @ N[i2]) > 0
                o1, o2 = objs[OI[i1]], objs[OI[i2]]
                kind = ('always' if gap < EXACT else 'far') if same else ('back_ds' if (o1[2] or o2[2]) else 'back')
                pk = (min(OI[i1], OI[i2]), max(OI[i1], OI[i2]), kind, round(float(n[0]), 1), round(float(n[1]), 1), round(float(n[2]), 1))
                c = (T[i1].mean(0) + T[i2].mean(0)) / 2
                r = pairs.setdefault(pk, {'a': o1[0], 'am': o1[1], 'b': o2[0], 'bm': o2[1], 'kind': kind, 'area': 0.0, 'at': c.round(2).tolist(), 'n': [round(float(x), 2) for x in n], 'gap_mm': round(gap * 1000, 2)})
                r['area'] += ov
            act.append(b)
    L = sorted([p for p in pairs.values() if p['area'] >= MIN_AREA], key=lambda p: -p['area'])
    for p in L: p['area'] = round(p['area'], 3)
    return {'file': path, 'tris': int(len(T)), 'always': round(sum(p['area'] for p in L if p['kind'] == 'always'), 2), 'far': round(sum(p['area'] for p in L if p['kind'] == 'far'), 2), 'back_ds': round(sum(p['area'] for p in L if p['kind'] == 'back_ds'), 2), 'pairs': L}


files = [TARGET] if TARGET.endswith('.glb') else sorted(os.path.join(r, f) for r, _, fs in os.walk(TARGET, followlinks=True) for f in fs if f.endswith('.glb'))
res = []
for fp in files:
    r = scan(fp); res.append(r)
    al = [p for p in r['pairs'] if p['kind'] == 'always']
    print('%s：三角形 %d，一定會閃 %.2f m²（%d 對）、遠處 %.2f、背對背雙面 %.2f' % (os.path.basename(fp), r['tris'], r.get('always', 0), len(al), r.get('far', 0), r.get('back_ds', 0)), flush=True)
    for p in al[:TOP]:
        print('    %.3f m²  %s〔%s〕×%s〔%s〕  位置 %s  法線 %s' % (p['area'], p['a'], p['am'], p['b'], p['bm'], p['at'], p['n']), flush=True)
if OUT:
    json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
