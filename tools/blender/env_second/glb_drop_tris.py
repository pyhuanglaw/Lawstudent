"""從 GLB 拿掉落在一個範圍盒裡的三角形（不重建整條街：拿掉舊的平面景深卡、舊的淺店內、擋在新店內前面的那片外殼牆）。純 Python＋numpy。
用法：python3 glb_drop_tris.py in.glb out.glb x0 x1 y0 y1 z0 z1 [--mat 材質名,材質名…] [--not-mat 材質名,…] [--node 節點名片段] [--plane x|y|z 值] [--dry]
- 範圍盒是世界座標（套用節點和上層節點的變換）；三角形的**三個頂點都在盒子裡**才拿掉。
- --mat：只動這些材質；--not-mat：這些材質不動；--node：只動名字含這個片段的節點；--plane：只拿「整片都在這個平面上（±1 mm）」的三角形。
- 做法：把那些三角形的索引改成同一個頂點（退化三角形，不畫）、再把索引陣列壓到前面並改 accessor 的 count——檔案大小不變，頂點不動。
- --dry：只印會拿掉幾個、哪些材質，不寫檔。"""
import json, struct, sys
import numpy as np
A = sys.argv[1:]
if len(A) < 8: print(__doc__); sys.exit(2)
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
src, dst = A[0], A[1]; box = [float(v) for v in A[2:8]]
MAT = set(opt('--mat').split(',')) if opt('--mat') else None; NOT = set(opt('--not-mat').split(',')) if opt('--not-mat') else set(); NODE = opt('--node'); DRY = '--dry' in A
PL = ('xyz'.index(A[A.index('--plane') + 1]), float(A[A.index('--plane') + 2])) if '--plane' in A else None
f = bytearray(open(src, 'rb').read()); n = struct.unpack('<I', f[12:16])[0]; j = json.loads(f[20:20 + n]); b0 = 20 + n + 8
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
DT = {5121: ('u1', 1), 5123: ('<u2', 2), 5125: ('<u4', 4)}; rep = {}; done = set(); total = 0
for i, nd in enumerate(j['nodes']):
    if 'mesh' not in nd or i not in WM: continue
    if NODE and NODE not in nd.get('name', ''): continue
    m = WM[i]
    for pr in j['meshes'][nd['mesh']]['primitives']:
        mn = j['materials'][pr['material']]['name']
        if (MAT and mn not in MAT) or mn in NOT or pr.get('mode', 4) != 4 or 'indices' not in pr: continue
        if pr['indices'] in done: continue
        done.add(pr['indices'])
        a = j['accessors'][pr['attributes']['POSITION']]; bv = j['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0); assert (bv.get('byteStride', 0) or 12) == 12
        P = np.frombuffer(bytes(f[off:off + a['count'] * 12]), dtype='<f4').reshape(-1, 3).astype(np.float64); Wp = P @ m[:3, :3].T + m[:3, 3]
        ia = j['accessors'][pr['indices']]; ibv = j['bufferViews'][ia['bufferView']]; ioff = b0 + ibv.get('byteOffset', 0) + ia.get('byteOffset', 0); dt, sz = DT[ia['componentType']]
        I = np.frombuffer(bytes(f[ioff:ioff + ia['count'] * sz]), dtype=dt).reshape(-1, 3); T = Wp[I]
        ok = np.ones(len(I), bool)
        for k in range(3): ok &= (T[:, :, k].min(1) >= box[k * 2]) & (T[:, :, k].max(1) <= box[k * 2 + 1])
        if PL: ok &= (np.abs(T[:, :, PL[0]] - PL[1]).max(1) < 0.001)
        if not ok.any(): continue
        rep[mn] = rep.get(mn, 0) + int(ok.sum()); total += int(ok.sum())
        if DRY: continue
        keep = I[~ok]; pad = np.zeros((int(ok.sum()), 3), dtype=I.dtype)
        f[ioff:ioff + ia['count'] * sz] = np.concatenate([keep, pad]).astype(dt).tobytes(); ia['count'] = int(len(keep) * 3)
if not DRY:
    js = json.dumps(j, separators=(',', ':'), ensure_ascii=False).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    out = bytearray(f[:12]) + struct.pack('<I', len(js)) + b'JSON' + js + f[20 + n:]; out[8:12] = struct.pack('<I', len(out)); open(dst, 'wb').write(out)
print(json.dumps({'dropped_tris': total, 'by_material': rep, 'dry': DRY, 'out': None if DRY else dst}, ensure_ascii=False))
