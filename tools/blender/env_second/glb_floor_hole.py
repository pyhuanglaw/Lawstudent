"""在 GLB 的一個方塊地板上挖一個長方形的洞（樓梯口、樓梯間）：不重新匯出模型、只換那一個網格的幾何（其他網格、材質、instancing 一個 byte 都不動）。
LAWWW2-C 2026-11-05，GUITAR-SHOP-ZONE-1105：CC 的同弦店內（assets/models/env/second_ai/bb_support/tongxian.glb）地板是一整塊方塊（tx_floor，24 個頂點），
樓梯間（x −3.2～−1.14、z 1.0～5.2）裡也是平的木地板。
  第一版（a353148b7）只挖樓梯那一段（x −2.95～−1.45、z 1.0～4.2）。
  第二版（BB-C 11-05 01:39Z，D112）：樓梯間整塊挖掉（門外的平台、樓梯口兩側改成和樓梯同一種磨石子，在 tools/blender/env_second/tongxian_stair.py），
  洞碰到地板的外緣（西牆 x −3.2、南牆 z 5.2）也可以。
不需要 Blender：
  python3 tools/blender/env_second/glb_floor_hole.py 輸入.glb 輸出.glb 網格名 x0,x1,z0,z1
做法：
  - 從網格的外框（x、y、z 範圍）重新切成洞以外的四塊：洞的北、南兩條整寬，東、西兩條夾在中間；洞碰到外緣那一邊的那一塊是空的，不做。
  - 每一面的 UV 照原本同方向那一面的對應（世界座標的線性對應，木地板的紋路接得起來）。
  - 輸入可以是原本的方塊，也可以是已經挖過的（外框和 UV 對應不變）：重跑同一個洞，結果一樣；換一個洞，照新的洞重切。
  - 網格不是幾個軸對齊的方塊、UV 不是線性對應（對應的誤差太大）就不動、報錯。"""
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


def refs(J):
    """每個 accessor 被用了幾次（網格的屬性、索引、morph target、instancing、skin、動畫）"""
    from collections import Counter
    c = Counter()
    for m in J['meshes']:
        for pr in m['primitives']:
            for v in pr['attributes'].values(): c[v] += 1
            if 'indices' in pr: c[pr['indices']] += 1
            for t in pr.get('targets', []):
                for v in t.values(): c[v] += 1
    for n in J.get('nodes', []):
        for v in ((n.get('extensions') or {}).get('EXT_mesh_gpu_instancing') or {}).get('attributes', {}).values(): c[v] += 1
    for sk in J.get('skins', []):
        if 'inverseBindMatrices' in sk: c[sk['inverseBindMatrices']] += 1
    for an in J.get('animations', []):
        for sm in an['samplers']: c[sm['input']] += 1; c[sm['output']] += 1
    return c


def put(J, BIN, arr, typ, target, old=None):
    """寫一個新的 accessor。old＝要換掉的那一個：只有這個網格自己用（refs＝1）才照原本的編號放（舊的 bufferView 沒人用了，write() 時拿掉）；
    和別的網格共用（匯出時 dedup 過：同弦的地板和吉他牆的灰泥共用一個方塊的索引）就另外加一個，舊的留給別人用"""
    i = add(J, BIN, arr, typ, target)
    if old is None or refs(J)[old] > 1: return i
    J['accessors'][old] = J['accessors'].pop(i); return old


def main():
    src, dst, name, rect = sys.argv[1], sys.argv[2], sys.argv[3], [float(v) for v in sys.argv[4].split(',')]
    hx0, hx1, hz0, hz1 = rect
    J, BIN = load(src)
    mesh = next((m for m in J['meshes'] if m['name'] == name), None)
    assert mesh is not None, '找不到網格 ' + name
    pr = mesh['primitives'][0]; at = pr['attributes']
    P = acc(J, BIN, at['POSITION']); N = acc(J, BIN, at['NORMAL']); UV = acc(J, BIN, at['TEXCOORD_0']) if 'TEXCOORD_0' in at else None
    keys = [tuple(int(v) for v in np.round(n)) for n in N]   # 照法線分面（匯出器的頂點順序不一定一面四個連在一起）
    assert all(sum(abs(v) for v in k) == 1 for k in keys) and len(P) % 4 == 0, '不是軸對齊的方塊（%d 個頂點）：不動' % len(P)
    lo, hi = P.min(0), P.max(0); X0, Y0, Z0 = lo; X1, Y1, Z1 = hi
    e = 1e-4
    assert X0 - e <= hx0 < hx1 <= X1 + e and Z0 - e <= hz0 < hz1 <= Z1 + e and ((hx1 - hx0) < (X1 - X0) - e or (hz1 - hz0) < (Z1 - Z0) - e), ('洞要在地板裡面（可以碰到外緣，不能整塊挖掉）', lo, hi, rect)
    hx0, hx1, hz0, hz1 = max(hx0, X0), min(hx1, X1), max(hz0, Z0), min(hz1, Z1)
    # 每一面（照法線分）的 UV 對應：uv = [x y z 1] · M（最小平方；方塊的四個頂點、挖過的話是同方向的所有面）
    maps = {}
    if UV is not None:
        for nrm in set(keys):
            idx = [i for i, k in enumerate(keys) if k == nrm]; A = np.c_[P[idx], np.ones(len(idx))]
            M, *_ = np.linalg.lstsq(A, UV[idx], rcond=None); err = float(np.abs(A @ M - UV[idx]).max())
            assert err < 1e-3, ('UV 不是世界座標的線性對應（%s 面誤差 %.4f）：不動' % (nrm, err))
            maps[nrm] = M
    boxes = [b for b in ((X0, X1, Z0, hz0), (X0, X1, hz1, Z1), (X0, hx0, hz0, hz1), (hx1, X1, hz0, hz1)) if b[1] - b[0] > e and b[3] - b[2] > e]
    pos, nor, uvs, ind = [], [], [], []
    for (x0, x1, z0, z1) in boxes:
        faces = [((1, 0, 0), [(x1, Y0, z0), (x1, Y1, z0), (x1, Y1, z1), (x1, Y0, z1)]), ((-1, 0, 0), [(x0, Y0, z1), (x0, Y1, z1), (x0, Y1, z0), (x0, Y0, z0)]),
                 ((0, 1, 0), [(x0, Y1, z0), (x0, Y1, z1), (x1, Y1, z1), (x1, Y1, z0)]), ((0, -1, 0), [(x0, Y0, z1), (x0, Y0, z0), (x1, Y0, z0), (x1, Y0, z1)]),
                 ((0, 0, 1), [(x0, Y0, z1), (x1, Y0, z1), (x1, Y1, z1), (x0, Y1, z1)]), ((0, 0, -1), [(x1, Y0, z0), (x0, Y0, z0), (x0, Y1, z0), (x1, Y1, z0)])]
        for nrm, q in faces:
            b = len(pos); pos += q; nor += [nrm] * 4; ind += [b, b + 1, b + 2, b, b + 2, b + 3]
            if maps: M = maps.get(nrm); uvs += [list(np.r_[p, 1.0] @ M) if M is not None else [0.0, 0.0] for p in q]
    P2 = np.array(pos, np.float32); N2 = np.array(nor, np.float32); I2 = np.array(ind, np.uint32)
    at['POSITION'] = put(J, BIN, P2, 'VEC3', 34962, at['POSITION']); at['NORMAL'] = put(J, BIN, N2, 'VEC3', 34962, at['NORMAL'])
    if maps: at['TEXCOORD_0'] = put(J, BIN, np.array(uvs, np.float32), 'VEC2', 34962, at['TEXCOORD_0'])
    for k in [k for k in list(at) if k not in ('POSITION', 'NORMAL', 'TEXCOORD_0')]: del at[k]   # 方塊地板沒有其他屬性；有的話（切線）照新的幾何就不對了，拿掉（它的 accessor 留著不用）
    pr['indices'] = put(J, BIN, I2, 'SCALAR', 34963, pr.get('indices'))
    write(J, BIN, dst); print('wrote', dst, '洞', rect, '頂點', len(P), '→', len(P2), '（%d 塊）' % len(boxes))


def compact(J, BIN):
    """拿掉沒人用的 bufferView（換掉的地板網格、貼圖：put() 照原本的編號放新的 accessor，舊的資料就沒人用了），BIN 重新排；只看 accessors、images 用到的（這幾個 GLB 沒有 sparse accessor）"""
    assert not any('sparse' in a for a in J['accessors']), 'sparse accessor：不處理'
    used = sorted({a['bufferView'] for a in J['accessors'] if 'bufferView' in a} | {im['bufferView'] for im in J.get('images', []) if 'bufferView' in im})
    remap, out, views = {}, bytearray(), []
    for i in used:
        bv = dict(J['bufferViews'][i]); o = bv.get('byteOffset', 0)
        while len(out) % 4: out.append(0)
        data = BIN[o:o + bv['byteLength']]; bv['byteOffset'] = len(out); out += data; remap[i] = len(views); views.append(bv)
    for a in J['accessors']:
        if 'bufferView' in a: a['bufferView'] = remap[a['bufferView']]
    for im in J.get('images', []):
        if 'bufferView' in im: im['bufferView'] = remap[im['bufferView']]
    J['bufferViews'] = views; BIN[:] = out
    return len(J['bufferViews'])


def write(J, BIN, dst):
    """GLB 寫回：先 compact（不留換掉的舊資料），BIN 補齊 4 byte、JSON 補空白"""
    compact(J, BIN)
    while len(BIN) % 4: BIN.append(0)
    J['buffers'][0]['byteLength'] = len(BIN)
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    while len(js) % 4: js += b' '
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(BIN)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(BIN), 0x004E4942) + bytes(BIN)
    open(dst, 'wb').write(out); return len(out)


if __name__ == '__main__':
    main()
