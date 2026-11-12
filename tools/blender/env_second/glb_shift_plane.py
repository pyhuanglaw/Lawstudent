"""把 GLB 裡某個材質、落在某個平面上的頂點沿一個軸挪一點（修兩片面疊在同一個平面的閃爍，不用重建整條街）。純 Python＋numpy。
用法：python3 glb_shift_plane.py in.glb out.glb <材質名> <軸 x|y|z> <平面值> <位移> x0 x1 y0 y1 z0 z1
平面值、位移、範圍盒都是世界座標（套用節點和上層節點的位移、旋轉、縮放）。只動「該軸座標＝平面值（±0.5 mm）」而且落在範圍盒裡的頂點。會更新 accessor 的 min／max。"""
import json, struct, sys
import numpy as np
A = sys.argv[1:]
if len(A) < 12: print(__doc__); sys.exit(2)
src, dst, mat, ax, plane, delta = A[0], A[1], A[2], 'xyz'.index(A[3]), float(A[4]), float(A[5]); box = [float(v) for v in A[6:12]]
f = bytearray(open(src, 'rb').read()); n = struct.unpack('<I', f[12:16])[0]; j = json.loads(f[20:20 + n]); b0 = 20 + n + 8; moved = 0; done = set()
def local(nd):
    if 'matrix' in nd: return np.array(nd['matrix'], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4); x, y, z, w = nd.get('rotation', [0, 0, 0, 1])
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    m[:3, :3] = R * np.array(nd.get('scale', [1, 1, 1])); m[:3, 3] = nd.get('translation', [0, 0, 0]); return m
WM = {}
def walk(i, pm):
    m = pm @ local(j['nodes'][i]); WM[i] = m
    for c in j['nodes'][i].get('children', []): walk(c, m)
for r in j['scenes'][j.get('scene', 0)]['nodes']: walk(r, np.eye(4))
for i, nd in enumerate(j['nodes']):
    if 'mesh' not in nd or i not in WM: continue
    m = WM[i]
    for pr in j['meshes'][nd['mesh']]['primitives']:
        if j['materials'][pr['material']]['name'] != mat: continue
        ai = pr['attributes']['POSITION']
        if ai in done: continue
        done.add(ai); a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', 0) or 12
        assert st == 12 and a['componentType'] == 5126
        P = np.frombuffer(bytes(f[off:off + a['count'] * 12]), dtype='<f4').reshape(-1, 3).astype(np.float64); Wp = P @ m[:3, :3].T + m[:3, 3]
        ok = (np.abs(Wp[:, ax] - plane) < 0.0005) & (Wp[:, 0] >= box[0]) & (Wp[:, 0] <= box[1]) & (Wp[:, 1] >= box[2]) & (Wp[:, 1] <= box[3]) & (Wp[:, 2] >= box[4]) & (Wp[:, 2] <= box[5])
        if not ok.any(): continue
        dw = np.zeros(3); dw[ax] = delta; P[ok] += np.linalg.solve(m[:3, :3], dw); moved += int(ok.sum()); P32 = P.astype('<f4'); f[off:off + a['count'] * 12] = P32.tobytes()
        a['min'] = [float(v) for v in P32.min(0)]; a['max'] = [float(v) for v in P32.max(0)]
js = json.dumps(j, separators=(',', ':'), ensure_ascii=False).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
out = bytearray(f[:12]) + struct.pack('<I', len(js)) + b'JSON' + js + f[20 + n:]; out[8:12] = struct.pack('<I', len(out)); open(dst, 'wb').write(out)
print(json.dumps({'moved_vertices': moved, 'material': mat, 'out': dst}))
