"""從 GLB 裡的發光網格（日光燈的發光面、檯燈燈罩下的亮片……）找出每一盞燈的位置，給 bake_room.py 用（LAWWW2-B 2026-11-07，總圖 B1 v4.1 光照烘焙）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/mesh_lights.py <glb> <節點名> cells|points|up [--w 10] [--y -0.03] [--col 0.95,0.98,1.0] [--size 原寸|lsx,lsz] [--min 0.05]
為什麼：配置改版（燈的位置改了）以後，烘焙腳本裡寫死的燈位就對不上（bake_library_b1.sh 原本照 10-23 版的 library_b1.py 寫了一份 LT 清單，
  4.1 版燈位全換了）。直接從模型讀：每一盞燈是一組互相碰到的面（面和面不共用頂點也算——library_b1.py 的 box 每一面都是獨立的頂點），
  兩組的外框差 2 cm 以內算同一盞；輸出：
  cells：bake_room --lights 的格子（x0,x1,z0,z1,y,1,1,W,lsx,lsz,r,g,b；一格一盞、面光源大小＝那一盞的外框，朝下）
  points：bake_room --points（x,y,z,W,r,g,b；那一盞的中心、最低點再加 --y）
  up：同 points，但放在燈下 --y（例如 −0.9：面光源只往下照，天花板只吃得到地板反彈的光，整片暗；燈下一顆點光源把天花板補亮）
節點的變換（translation／rotation／scale）會乘上去；只看節點自己的網格（不含子節點）。"""
import json, struct, sys
import numpy as np


def arg(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d


def node_world(J, name):
    par = {}
    for i, nd in enumerate(J['nodes']):
        for c in nd.get('children', []): par[c] = i
    idx = next(i for i, nd in enumerate(J['nodes']) if nd.get('name') == name)
    M = np.eye(4); i = idx
    while i is not None:
        nd = J['nodes'][i]
        if 'matrix' in nd: L = np.array(nd['matrix']).reshape(4, 4).T
        else:
            t = nd.get('translation', [0, 0, 0]); x, y, z, w = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
            R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
            L = np.eye(4); L[:3, :3] = R * np.array(s); L[:3, 3] = t
        M = L @ M; i = par.get(i)
    return idx, M


def main():
    p, name, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); off = 20 + n; bl = struct.unpack('<I', b[off:off + 4])[0]; B = b[off + 8:off + 8 + bl]

    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        nc = {'SCALAR': 1, 'VEC3': 3}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
        st = bv.get('byteStride'); isz = np.dtype(dt).itemsize * nc
        if st and st != isz:
            return np.array([np.frombuffer(B, dt, nc, o + k * st) for k in range(a['count'])])
        arr = np.frombuffer(B, dt, a['count'] * nc, o)
        return arr.reshape(a['count'], nc) if nc > 1 else arr
    idx, M = node_world(J, name)
    boxes = []
    for pr in J['meshes'][J['nodes'][idx]['mesh']]['primitives']:
        P = acc(pr['attributes']['POSITION']).astype(float); P = (np.c_[P, np.ones(len(P))] @ M.T)[:, :3]
        I = acc(pr['indices']).astype(int).reshape(-1, 3) if 'indices' in pr else np.arange(len(P)).reshape(-1, 3)
        par = list(range(len(P)))

        def f(a):
            while par[a] != a: par[a] = par[par[a]]; a = par[a]
            return a
        for t in I:
            for k in (1, 2):
                ra, rb = f(t[0]), f(t[k])
                if ra != rb: par[ra] = rb
        g = {}
        for i in range(len(P)): g.setdefault(f(i), []).append(i)
        for v in g.values(): Q = P[v]; boxes.append([Q.min(0), Q.max(0)])
    eps = 0.02; merged = True
    while merged:   # 外框碰到（差 eps 以內）的併成同一盞
        merged = False; out = []
        for bx in boxes:
            for o in out:
                if np.all(bx[0] <= o[1] + eps) and np.all(o[0] <= bx[1] + eps):
                    o[0] = np.minimum(o[0], bx[0]); o[1] = np.maximum(o[1], bx[1]); merged = True; break
            else: out.append([bx[0].copy(), bx[1].copy()])
        boxes = out
    mn = float(arg('--min', 0.05)); boxes = [bx for bx in boxes if max(bx[1][0] - bx[0][0], bx[1][2] - bx[0][2]) >= mn]
    W = arg('--w', '10'); dy = float(arg('--y', -0.03)); col = arg('--col', '0.95,0.98,1.0'); size = arg('--size')
    res = []
    for lo, hi in boxes:
        cx, cz = (lo[0] + hi[0]) / 2, (lo[2] + hi[2]) / 2
        if mode == 'cells':
            lsx, lsz = (hi[0] - lo[0], hi[2] - lo[2]) if not size else map(float, size.split(','))
            res.append(f'{cx - 0.01:.3f},{cx + 0.01:.3f},{cz - 0.01:.3f},{cz + 0.01:.3f},{lo[1] + dy:.3f},1,1,{W},{lsx:.3f},{lsz:.3f},{col}')
        else:
            res.append(f'{cx:.3f},{lo[1] + dy:.3f},{cz:.3f},{W},{col}')
    print(';'.join(res))
    print(name, mode, len(res), 'lights', file=sys.stderr)


if __name__ == '__main__':
    main()
