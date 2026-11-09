"""每個 MASK 材質的網格：在它自己的 UV 上取樣 baseColor 貼圖的 alpha，算「alpha < cutoff」的比例（＝真的透空）。不需要 Blender。
   用法：python3 mask_alpha_audit.py <glb>..."""
import json, struct, io, sys, numpy as np
from PIL import Image
for p in sys.argv[1:]:
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + n]); b0 = 20 + n + 8
    def acc(i):
        a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; off = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]; dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
        st = bv.get('byteStride', k * np.dtype(dt).itemsize); cnt = a['count']
        raw = np.frombuffer(b, dtype=np.uint8, count=st * (cnt - 1) + k * np.dtype(dt).itemsize, offset=off)
        return np.lib.stride_tricks.as_strided(raw, shape=(cnt, k * np.dtype(dt).itemsize), strides=(st, 1)).copy().view(dt).reshape(cnt, k)
    imgs = {}
    def image(ti):
        T = J['textures'][ti]; src = T.get('source')
        if src is None: src = list(T.get('extensions', {}).values())[0]['source']
        if src not in imgs:
            I = J['images'][src]; bv = J['bufferViews'][I['bufferView']]; o = b0 + bv.get('byteOffset', 0)
            imgs[src] = np.asarray(Image.open(io.BytesIO(b[o:o + bv['byteLength']])).convert('RGBA'))
        return imgs[src]
    rows = []
    for nd in J['nodes']:
        if 'mesh' not in nd: continue
        for pr in J['meshes'][nd['mesh']]['primitives']:
            m = J['materials'][pr['material']] if 'material' in pr else {}
            if m.get('alphaMode') != 'MASK': continue
            cut = m.get('alphaCutoff', 0.5); bt = m.get('pbrMetallicRoughness', {}).get('baseColorTexture')
            P = acc(pr['attributes']['POSITION']).astype(float); I = acc(pr['indices']).reshape(-1, 3) if 'indices' in pr else np.arange(len(P)).reshape(-1, 3)
            area = float(np.linalg.norm(np.cross(P[I[:, 1]] - P[I[:, 0]], P[I[:, 2]] - P[I[:, 0]]), axis=1).sum() / 2)
            if not bt: rows.append((nd.get('name'), m.get('name'), area, None, 'no texture')); continue
            if bt.get('extensions', {}).get('KHR_texture_transform'): note = 'texture_transform!'
            else: note = ''
            im = image(bt['index']); H, W = im.shape[:2]; U = acc(pr['attributes']['TEXCOORD_%d' % bt.get('texCoord', 0)]).astype(float)
            rng = np.random.default_rng(0); s = []
            for t in I[:4000]:
                for w in rng.dirichlet([1, 1, 1], 8):
                    uv = w @ U[t]; x = int((uv[0] % 1) * W) % W; y = int((uv[1] % 1) * H) % H; s.append(im[y, x, 3])
            s = np.array(s); rows.append((nd.get('name'), m.get('name'), area, float((s < cut * 255).mean()), note))
    rows.sort(key=lambda r: -r[2])
    print('==', p)
    for r in rows[:8]: print('  %-34s %-14s %7.2f m²  透空 %s %s' % (r[0], r[1], r[2], 'n/a' if r[3] is None else '%.0f%%' % (100 * r[3]), r[4]))
    tot = sum(r[2] for r in rows); op = sum(r[2] for r in rows if r[3] is not None and r[3] < 0.02)
    print('  MASK 物件 %d 個、%.1f m²；其中幾乎沒有透空（<2%%）的 %.1f m²' % (len(rows), tot, op))
