"""光照貼圖的 UV 排版檢查（LIGHTBAKE-UV-FIX-1028，LAWWW2-C 2026-10-28）：烘焙過的 GLB（或 bake_room.py --uvonly 的輸出）
- 整張貼圖被 TEXCOORD_1（遊戲的 uv1）用掉多少（填滿率）；
- 每個物件分到的面積、每公尺幾個像素（光照貼圖的解析度）；
- 哪些網格沒有 uv1（遊戲裡吃不到光照貼圖：照舊即時光）。
用法：python3 tools/blender/env_second/lightbake/uv_fill.py <房間.glb> [--res 1024] [--png 排版圖.png]
10-28 查到的：202 每公尺 8～11 個像素、201 2～9 個（島只佔整張的 6～9%）→ 修 bake_room.py 以後 202 34 個、201 12～17 個。
"""
import json, struct, sys
import numpy as np

A = sys.argv[1:]
def arg(k, d=None): return A[A.index(k) + 1] if k in A else d
F = A[0]; R = int(arg('--res', '1024')); PNG = arg('--png')
b = open(F, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + jl]); bo = 20 + jl + 8

def acc(i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]; n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = np.dtype({5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a['componentType']]); off = bo + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    st = bv.get('byteStride')
    if st and st != n * dt.itemsize:
        raw = np.frombuffer(b, np.uint8, count=st * a['count'], offset=off).reshape(a['count'], st)
        return raw[:, :n * dt.itemsize].copy().view(dt).reshape(a['count'], n)
    return np.frombuffer(b, dt, count=n * a['count'], offset=off).reshape(a['count'], n)

rows, none, tris = [], [], []
for nd in J['nodes']:
    if 'mesh' not in nd: continue
    A3 = Au = 0.0; has = False
    for p in J['meshes'][nd['mesh']]['primitives']:
        if 'TEXCOORD_1' not in p['attributes']: continue
        has = True; P = acc(p['attributes']['POSITION']).astype(np.float64); U = acc(p['attributes']['TEXCOORD_1']).astype(np.float64)
        T = (acc(p['indices']).ravel() if 'indices' in p else np.arange(len(P))).reshape(-1, 3)
        a, c, d = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]; A3 += 0.5 * np.linalg.norm(np.cross(c - a, d - a), axis=1).sum()
        u0, u1, u2 = U[T[:, 0]], U[T[:, 1]], U[T[:, 2]]
        Au += 0.5 * np.abs((u1[:, 0] - u0[:, 0]) * (u2[:, 1] - u0[:, 1]) - (u2[:, 0] - u0[:, 0]) * (u1[:, 1] - u0[:, 1])).sum()
        tris.append(U[T])
    if has and A3 > 0: rows.append((nd['name'], A3, Au))
    elif not has: none.append(nd['name'])
print('%-30s %9s %7s %6s' % ('物件', 'm²', 'uv%', 'px/m'))
for n, A3, Au in sorted(rows, key=lambda r: -r[1]): print('%-30s %9.2f %7.2f %6.0f' % (n[:30], A3, Au * 100, (Au * R * R / A3) ** 0.5))
fill = None
if tris:
    from PIL import Image, ImageDraw
    im = Image.new('L', (R, R), 0); dr = ImageDraw.Draw(im); rng = np.random.default_rng(1)
    for t in tris:
        col = int(rng.integers(60, 255))
        for tri in t: dr.polygon([(x * R, y * R) for x, y in tri], fill=col)
    fill = (np.asarray(im) > 0).mean() * 100
    if PNG: im.save(PNG)
print('填滿率 %.1f%%（三角形實際蓋到的像素）；沒有 uv1 的網格：%s' % (fill or 0, ', '.join(none) or '沒有'))
