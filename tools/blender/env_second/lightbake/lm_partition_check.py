"""烘過光照的 GLB 裡，隔間牆（extras.partition）有沒有整面被壓成一點（11-08 LAWWW2-B；bake_room.py hidden_faces 的隔間牆 bug）。不需要 Blender：
  python3 tools/blender/env_second/lightbake/lm_partition_check.py [GLB ...]（不給就掃 assets/models/env/second_ai 底下所有有 extras.lightmap 的）
「壓成一點」＝3D 面積超過 0.3 m² 的三角形，在第二套 UV 上不到 1 個像素（1024 貼圖）：那一面整片讀同一個光照值、沒有明暗。
每個 GLB 印隔間牆被壓掉的總面積和哪幾個節點；有的話結束碼 1。"""
import glob, json, struct, sys
import numpy as np


def scan(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); b0 = 20 + n + 8
    if not any('lightmap' in (s.get('extras') or {}) for s in J.get('scenes', [])): return None
    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        comp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
        isz = np.dtype(dt).itemsize; st = bv.get('byteStride', comp * isz)
        raw = np.frombuffer(b, dtype=np.uint8, count=st * (a['count'] - 1) + comp * isz, offset=off)
        return np.lib.stride_tricks.as_strided(raw, shape=(a['count'], comp * isz), strides=(st, 1)).copy().view(dt).reshape(a['count'], comp)
    tot, names = 0.0, []
    for nd in J['nodes']:
        if 'mesh' not in nd or not (nd.get('extras') or {}).get('partition'): continue
        for pr in J['meshes'][nd['mesh']]['primitives']:
            if 'TEXCOORD_1' not in pr['attributes'] or 'indices' not in pr: continue
            P = acc(pr['attributes']['POSITION']); U = acc(pr['attributes']['TEXCOORD_1']); I = acc(pr['indices']).reshape(-1, 3)
            a3 = 0.5 * np.linalg.norm(np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]]), axis=1)
            e1 = U[I[:, 1]] - U[I[:, 0]]; e2 = U[I[:, 2]] - U[I[:, 0]]; a2 = 0.5 * np.abs(e1[:, 0] * e2[:, 1] - e1[:, 1] * e2[:, 0]) * 1024 * 1024
            bad = (a3 > 0.3) & (a2 < 1)
            if bad.any(): tot += float(a3[bad].sum()); names.append(nd['name'])
    return tot, names


def main():
    files = sys.argv[1:] or sorted(glob.glob('assets/models/env/second_ai/**/*.glb', recursive=True)); bad = 0
    for p in files:
        r = scan(p)
        if r is None or r[0] < 0.5: continue
        bad += 1; print('%s　隔間牆被壓成一點 %.1f m²：%s' % (p, r[0], '、'.join(r[1])))
    print('有問題的 GLB：%d 個' % bad); sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
