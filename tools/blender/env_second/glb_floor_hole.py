"""在 GLB 的一個方塊地板上挖一個長方形的洞（樓梯口）：不重新匯出模型、只換那一個網格的幾何（其他網格、材質、instancing 一個 byte 都不動）。
LAWWW2-C 2026-11-05，GUITAR-SHOP-ZONE-1105：CC 的同弦店內（assets/models/env/second_ai/bb_support/tongxian.glb）地板是一整塊方塊（tx_floor，24 個頂點），
樓梯間（x −3.2～−1.14、z 1.0～5.2）裡也是平的地板；樓梯（tools/blender/env_second/tongxian_stair.py）要從那裡往下，所以挖掉樓梯那一段（x −2.95～−1.45、z 1.0～4.2）。
不需要 Blender：
  python3 tools/blender/env_second/glb_floor_hole.py 輸入.glb 輸出.glb 網格名 x0,x1,z0,z1
做法：原本那個方塊的 x、y、z 範圍不變，切成洞以外的四塊（洞的北、南兩條整寬，東、西兩條夾在中間）；每一面的 UV 照原本同方向那一面的對應（世界座標的線性對應，木地板的紋路接得起來）。
已經挖過的（網格不是一個方塊）＝不動、照樣輸出（重跑不會挖兩次）。"""
import json, struct, sys
import numpy as np


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); off = 20 + n
    bl = struct.unpack('<I', b[off:off + 4])[0]; return J, bytearray(b[off + 8:off + 8 + bl])


def acc(J, BIN, i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    st = bv.get('byteStride'); isz = np.dtype(dt).itemsize
    if st and st != k * isz:
        raw = np.frombuffer(bytes(BIN), np.uint8, count=st * a['count'], offset=o).reshape(a['count'], st)
        return raw[:, :k * isz].copy().view(dt).reshape(a['count'], k)
    v = np.frombuffer(bytes(BIN), dt, count=k * a['count'], offset=o)
    return v.reshape(a['count'], k) if k > 1 else v


def add(J, BIN, arr, typ, target):
    while len(BIN) % 4: BIN.append(0)
    o = len(BIN); BIN += arr.tobytes()
    J['bufferViews'].append({'buffer': 0, 'byteOffset': o, 'byteLength': arr.nbytes, 'target': target})
    a = {'bufferView': len(J['bufferViews']) - 1, 'componentType': 5125 if arr.dtype == np.uint32 else 5126, 'count': len(arr), 'type': typ}
    if typ == 'VEC3' and target == 34962 and arr is not None: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    J['accessors'].append(a); return len(J['accessors']) - 1


def main():
    src, dst, name, rect = sys.argv[1], sys.argv[2], sys.argv[3], [float(v) for v in sys.argv[4].split(',')]
    hx0, hx1, hz0, hz1 = rect
    J, BIN = load(src)
    mesh = next((m for m in J['meshes'] if m['name'] == name), None)
    assert mesh is not None, '找不到網格 ' + name
    pr = mesh['primitives'][0]; at = pr['attributes']
    P = acc(J, BIN, at['POSITION']); N = acc(J, BIN, at['NORMAL']); UV = acc(J, BIN, at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
    if len(P) != 24:
        print('不是一個方塊（%d 個頂點）：應該已經挖過了，不動' % len(P)); open(dst, 'wb').write(open(src, 'rb').read()); return
    lo, hi = P.min(0), P.max(0); X0, Y0, Z0 = lo; X1, Y1, Z1 = hi
    assert X0 < hx0 < hx1 < X1 and Z0 < hz0 < hz1 < Z1, ('洞要在地板裡面', lo, hi, rect)
    # 每一面（照法線分）的 UV 對應：uv = [x y z 1] · M（最小平方，原本那一面的 4 個頂點）
    maps = {}
    if UV is not None:
        keys = [tuple(int(v) for v in np.round(n)) for n in N]   # 照法線分面（匯出器的頂點順序不一定一面四個連在一起）
        for nrm in set(keys):
            idx = [i for i, k in enumerate(keys) if k == nrm]; A = np.c_[P[idx], np.ones(len(idx))]
            maps[nrm] = np.linalg.lstsq(A, UV[idx], rcond=None)[0]
    boxes = [(X0, X1, Z0, hz0), (X0, X1, hz1, Z1), (X0, hx0, hz0, hz1), (hx1, X1, hz0, hz1)]
    pos, nor, uvs, ind = [], [], [], []
    for (x0, x1, z0, z1) in boxes:
        faces = [((1, 0, 0), [(x1, Y0, z0), (x1, Y1, z0), (x1, Y1, z1), (x1, Y0, z1)]), ((-1, 0, 0), [(x0, Y0, z1), (x0, Y1, z1), (x0, Y1, z0), (x0, Y0, z0)]),
                 ((0, 1, 0), [(x0, Y1, z0), (x0, Y1, z1), (x1, Y1, z1), (x1, Y1, z0)]), ((0, -1, 0), [(x0, Y0, z1), (x0, Y0, z0), (x1, Y0, z0), (x1, Y0, z1)]),
                 ((0, 0, 1), [(x0, Y0, z1), (x1, Y0, z1), (x1, Y1, z1), (x0, Y1, z1)]), ((0, 0, -1), [(x1, Y0, z0), (x0, Y0, z0), (x0, Y1, z0), (x1, Y1, z0)])]
        for nrm, q in faces:
            b = len(pos); pos += q; nor += [nrm] * 4; ind += [b, b + 1, b + 2, b, b + 2, b + 3]
            if maps: M = maps.get(nrm); uvs += [list(np.r_[p, 1.0] @ M) if M is not None else [0.0, 0.0] for p in q]
    P2 = np.array(pos, np.float32); N2 = np.array(nor, np.float32); I2 = np.array(ind, np.uint32)
    at['POSITION'] = add(J, BIN, P2, 'VEC3', 34962); at['NORMAL'] = add(J, BIN, N2, 'VEC3', 34962)
    if maps: at['TEXCOORD_0'] = add(J, BIN, np.array(uvs, np.float32), 'VEC2', 34962)
    for k in [k for k in list(at) if k not in ('POSITION', 'NORMAL', 'TEXCOORD_0')]: del at[k]   # 方塊地板沒有其他屬性；有的話（切線）照新的幾何就不對了，拿掉
    pr['indices'] = add(J, BIN, I2, 'SCALAR', 34963)
    while len(BIN) % 4: BIN.append(0)
    J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    while len(js) % 4: js += b' '
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
    open(dst, 'wb').write(out); print('wrote', dst, len(out), '洞', rect, '頂點', len(P), '→', len(P2))


if __name__ == '__main__':
    main()
