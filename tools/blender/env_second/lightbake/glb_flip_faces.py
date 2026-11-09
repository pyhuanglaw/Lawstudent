"""把 GLB 裡「面朝向反了」的三角形翻正（LAWWW2-B 2026-11-09；BB-B 16:45 選 (b)：好拍洞洞板翻正）。不需要 Blender。
  python3 tools/blender/env_second/lightbake/glb_flip_faces.py <in.glb> <out.glb> --node <網格名字正規式> --normal x+ [--node ... --normal ...]...
         [--opaque-copy <節點正規式>=<新材質名>]...
  --node／--normal 一組：名字合的網格裡，世界座標法線（三角形頂點順序算的）和那個軸夾角 < 30° 的三角形翻過來
    （交換第 2、3 個頂點；那些頂點的 NORMAL 乘 −1）。例：好拍右牆洞洞板 --node '^WALL_right_pegwall_alpha$' --normal x+。
  --opaque-copy：名字合的網格改用一份新材質（原材質的複製、alphaMode OPAQUE）。
    好拍的洞洞板用 hp_alpha（MASK），但它在貼圖上那一塊 alpha 全是 255。單獨一份不透明材質的好處：
    ① 遠處的 mipmap 不會混到隔壁鐵網格那一塊的透空，在板子接縫切出縫；② 烘焙時自己一個材質，不用和球拍卡分 _rt。
安全檢查（不合就停、不寫檔）：
  - 要翻的三角形的頂點不能被不翻的三角形用到（不然法線沒辦法同時對兩邊）；
  - 索引、法線的 accessor 不能被別的網格共用；網格不能被兩個以上節點用（instancing）；
  - 有 TANGENT 的不處理（要另外算）。
只改這些三角形的索引順序、法線，和（--opaque-copy）材質；其他位元組不動。"""
import json, struct, sys, re
import numpy as np


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]
    J = json.loads(b[20:20 + n]); rest = b[20 + n:]
    bl, bt = struct.unpack('<II', rest[:8]); assert bt == 0x004E4942, 'BIN chunk'
    return J, bytearray(rest[8:8 + bl])


def mat(nd):
    if 'matrix' in nd: return np.array(nd['matrix'], float).reshape(4, 4).T
    M = np.eye(4); t = nd.get('translation', [0, 0, 0]); x, y, z, w = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                  [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M


def view(J, B, ai):
    a = J['accessors'][ai]; bv = J['bufferViews'][a['bufferView']]; off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    assert bv.get('byteStride', k * np.dtype(dt).itemsize) == k * np.dtype(dt).itemsize, 'interleaved'
    return np.frombuffer(B, dtype=dt, count=a['count'] * k, offset=off).reshape(a['count'], k)   # 可以寫（B 是 bytearray）


def main():
    a = sys.argv[1:]; src, dst = a[0], a[1]
    pairs = [(a[i + 1], a[i + 3]) for i in range(len(a)) if a[i] == '--node' and i + 3 < len(a) and a[i + 2] == '--normal']
    opq = [a[i + 1].split('=', 1) for i in range(len(a)) if a[i] == '--opaque-copy']
    J, B = load(src)
    W = {}
    def walk(i, P):
        nd = J['nodes'][i]; M = P @ mat(nd); W[i] = M
        for c in nd.get('children', []): walk(c, M)
    for r in J['scenes'][J.get('scene', 0)]['nodes']: walk(r, np.eye(4))
    users = {}; acc_users = {}
    for i, nd in enumerate(J['nodes']):
        if 'mesh' in nd: users.setdefault(nd['mesh'], []).append(i)
    for mi, me in enumerate(J['meshes']):
        for pr in me['primitives']:
            for ai in list(pr['attributes'].values()) + ([pr['indices']] if 'indices' in pr else []): acc_users.setdefault(ai, set()).add(mi)
    total = 0
    for rx, ax in pairs:
        axis = {'x': 0, 'y': 1, 'z': 2}[ax[0]]; sg = 1 if ax[1] == '+' else -1; hit = False
        for i, nd in enumerate(J['nodes']):
            if 'mesh' not in nd or not re.search(rx, nd.get('name', '')): continue
            hit = True; mi = nd['mesh']
            if len(users[mi]) > 1: sys.exit('%s：網格被 %d 個節點用（instancing），不處理' % (nd['name'], len(users[mi])))
            for pr in J['meshes'][mi]['primitives']:
                if 'TANGENT' in pr['attributes']: sys.exit('%s：有 TANGENT，不處理' % nd['name'])
                for ai in (pr['indices'], pr['attributes']['NORMAL']):
                    if len(acc_users[ai]) > 1: sys.exit('%s：accessor %d 被別的網格共用' % (nd['name'], ai))
                P = view(J, B, pr['attributes']['POSITION']).astype(float); Pw = (np.c_[P, np.ones(len(P))] @ W[i].T)[:, :3]
                I = view(J, B, pr['indices']).reshape(-1, 3); T = Pw[I]
                N = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); N /= np.maximum(np.linalg.norm(N, axis=1)[:, None], 1e-12)
                flip = N[:, axis] * sg > 0.866
                if not flip.any(): continue
                vf = set(I[flip].ravel().tolist()); vk = set(I[~flip].ravel().tolist())
                if vf & vk: sys.exit('%s：要翻的三角形和不翻的共用 %d 個頂點' % (nd['name'], len(vf & vk)))
                I[flip, 1], I[flip, 2] = I[flip, 2].copy(), I[flip, 1].copy()
                Nv = view(J, B, pr['attributes']['NORMAL']); idx = np.array(sorted(vf)); Nv[idx] = -Nv[idx]
                print('%s：翻 %d／%d 個三角形（%s），頂點法線 %d 個' % (nd['name'], int(flip.sum()), len(I), ax, len(idx)))
                total += int(flip.sum())
        if not hit: sys.exit('沒有網格合 %s' % rx)
    for rx, newname in opq:
        for i, nd in enumerate(J['nodes']):
            if 'mesh' not in nd or not re.search(rx, nd.get('name', '')): continue
            for pr in J['meshes'][nd['mesh']]['primitives']:
                old = J['materials'][pr['material']]['name']
                m = dict(J['materials'][pr['material']]); m['name'] = newname; m['alphaMode'] = 'OPAQUE'; m.pop('alphaCutoff', None)
                J['materials'].append(m); pr['material'] = len(J['materials']) - 1
                print('%s：材質換成 %s（OPAQUE，複製自 %s）' % (nd['name'], newname, old))
    js = json.dumps(J, ensure_ascii=False, separators=(',', ':')).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
    bn = bytes(B); bn += b'\0' * ((4 - len(bn) % 4) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bn)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bn), 0x004E4942) + bn
    open(dst, 'wb').write(out); print('寫到', dst, '翻了', total, '個三角形')


if __name__ == '__main__':
    main()
