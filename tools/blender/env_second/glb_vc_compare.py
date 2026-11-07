"""比較兩個溫州街 GLB 的頂點色材質（PERF-WZ-DC-1107，LAWWW2-B 2026-11-07；lib2.vc_pack 打包前後）：
每個三角形「實際讀到的」粗糙度、金屬度（打包材質從 metallicRoughnessTexture 解 WebP 讀那一格）、頂點色、會不會投影（照 zones3d.js wzCastsShadow 的材質名規則）、
是不是 instancing、平常藏不藏（COPY_*_SHUT、SEASON_），分類加總個數、三角形中心、顏色；不是頂點色的網格要完全相同。最後一行 RESULT SAME／DIFFERENT。
用法：python3 -I tools/blender/env_second/glb_vc_compare.py 舊.glb 新.glb
  舊的 GLB：WZ_NOPACK=1 /opt/blenv/bin/python tools/blender/env_second/wz_street.py -- --out <scratch>/wenzhou_street.glb（cwd 放 scratchpad）"""
import json, struct, sys, collections, re, io
import numpy as np
from PIL import Image
NOSH = re.compile(r'^(cafe_int_|cafe_room_dark|cafe_curtain|ext_glass_lit|wz_room_lit|jp_shoji|cafe_leaf_|cafe_glass|cafe_win_glass|cafe_lampglass|cafe_bulb|cafe_books|cafe_vc_|ck_trim_win|ck_glass|ck_frame|ck_door|ck_ceiling|ck_stone_base|ck_pav_dark|ck_soc_metal|ck_bell_lens|ck_bell_wash)')
VC = re.compile(r'^(wz_vc_|cafe_vc_wz)')
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}
def load(p):
    b = open(p, 'rb').read(); l = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + l]); o = 20 + l; bl = struct.unpack('<I', b[o:o + 4])[0]; bin_ = b[o + 8:o + 8 + bl]
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; dt = CT[a['componentType']]; n = NC[a['type']]
        st = bv.get('byteStride'); off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        if st and st != np.dtype(dt).itemsize * n:
            raw = np.frombuffer(bin_, np.uint8, count=st * a['count'], offset=off).reshape(a['count'], st)[:, :np.dtype(dt).itemsize * n].copy()
            arr = raw.view(dt).reshape(a['count'], n)
        else: arr = np.frombuffer(bin_, dt, count=a['count'] * n, offset=off).reshape(a['count'], n)
        arr = arr.astype(np.float64)
        if a.get('normalized'): arr = arr / float(np.iinfo(dt).max)
        return arr
    def img(i):
        im = j['images'][i]; bv = j['bufferViews'][im['bufferView']]; return np.asarray(Image.open(io.BytesIO(bin_[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB')).astype(np.float64) / 255.0
    return j, acc, img
def mat4(n):
    if 'matrix' in n: return np.array(n['matrix']).reshape(4, 4).T
    t = n.get('translation', [0, 0, 0]); r = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1]); x, y, z, w = r
    R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
    M = np.eye(4); M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M
def walk(p):
    j, acc, img = load(p); par = {}
    for i, n in enumerate(j['nodes']):
        for c in n.get('children', []): par[c] = i
    def world(i):
        M = mat4(j['nodes'][i])
        while i in par: i = par[i]; M = mat4(j['nodes'][i]) @ M
        return M
    def chain(i):
        s = [j['nodes'][i].get('name', '')]
        while i in par: i = par[i]; s.append(j['nodes'][i].get('name', ''))
        return s
    vc_tris = collections.defaultdict(lambda: [0, np.zeros(3), np.zeros(4)]); other = collections.Counter(); draws = collections.Counter(); prims = []
    for ni, n in enumerate(j['nodes']):
        if 'mesh' not in n: continue
        ch = chain(ni); hidden = any(c.startswith('COPY_') and c.endswith('_SHUT') for c in ch) or any(c.startswith('SEASON_') for c in ch)
        inst = 'EXT_mesh_gpu_instancing' in (n.get('extensions') or {}); W = world(ni)
        if inst:
            e = n['extensions']['EXT_mesh_gpu_instancing']['attributes']; T = acc(e['TRANSLATION']); R = acc(e['ROTATION']) if 'ROTATION' in e else np.tile([0, 0, 0, 1.0], (len(T), 1)); Sc = acc(e['SCALE']) if 'SCALE' in e else np.ones((len(T), 3))
            Ms = [W @ mat4({'translation': list(T[k]), 'rotation': list(R[k]), 'scale': list(Sc[k])}) for k in range(len(T))]
        else: Ms = [W]
        for p in j['meshes'][n['mesh']]['primitives']:
            m = j['materials'][p['material']]; mn = m['name']; pos = acc(p['attributes']['POSITION']); ix = acc(p['indices']).astype(int).ravel() if 'indices' in p else np.arange(len(pos))
            ntri = len(ix) // 3; casts = (not inst) and ('FACE' not in n.get('name', '')) and not NOSH.match(mn) and bool(re.match(r'^wz_vc_', mn))
            if not hidden: draws['main'] += 1; draws['shadow'] += 1 if (not inst and not NOSH.match(mn) and 'FACE' not in n.get('name', '')) else 0
            if not VC.match(mn):
                other[(tuple(ch[:2]), mn, ntri, len(Ms))] += 1; continue
            pm = m['pbrMetallicRoughness']; rf = pm.get('roughnessFactor', 1.0); mf = pm.get('metallicFactor', 1.0)
            col = acc(p['attributes']['COLOR_0']) if 'COLOR_0' in p['attributes'] else np.ones((len(pos), 4))
            if col.shape[1] == 3: col = np.hstack([col, np.ones((len(col), 1))])
            if 'metallicRoughnessTexture' in pm:
                tx = j['textures'][pm['metallicRoughnessTexture']['index']]; im = img(tx['source'] if 'source' in tx else tx['extensions']['EXT_texture_webp']['source']); uv = acc(p['attributes']['TEXCOORD_%d' % pm['metallicRoughnessTexture'].get('texCoord', 0)])
                h, w, _ = im.shape; px = np.clip((uv[:, 0] * w).astype(int), 0, w - 1); py = np.clip((uv[:, 1] * h).astype(int), 0, h - 1); s = im[py, px]
                rv = rf * s[:, 1]; mv = mf * s[:, 2]
                tri_uv = uv[ix].reshape(-1, 3, 2); assert np.abs(tri_uv - tri_uv[:, :1]).max() < 1e-6, ('三角形 UV 不一樣', mn)
            else: rv = np.full(len(pos), rf); mv = np.full(len(pos), mf)
            t3 = ix.reshape(-1, 3)
            for M in Ms:
                wp = (np.hstack([pos, np.ones((len(pos), 1))]) @ M.T)[:, :3]; cen = wp[t3].mean(1); cc = col[t3].mean(1)
                for k in range(ntri):
                    key = (round(float(rv[t3[k, 0]]), 2), round(float(mv[t3[k, 0]]), 2), casts, inst, hidden)
                    e = vc_tris[key]; e[0] += 1; e[1] += cen[k]; e[2] += cc[k]
            prims.append((n.get('name'), mn, ntri, inst, hidden))
    return vc_tris, other, draws, prims
A = walk(sys.argv[1]); Bn = walk(sys.argv[2])
print('== 頂點色三角形（粗糙度, 金屬度, 投影, instancing, 藏起來）：個數、中心總和、顏色總和')
ok = True
for k in sorted(set(A[0]) | set(Bn[0]), key=str):
    a = A[0].get(k, [0, np.zeros(3), np.zeros(4)]); b = Bn[0].get(k, [0, np.zeros(3), np.zeros(4)])
    same = a[0] == b[0] and np.allclose(a[1], b[1], atol=0.05 + 1e-6 * abs(a[1]).max()) and np.allclose(a[2], b[2], atol=0.05)
    ok &= same; print(k, a[0], b[0], np.round(a[1], 1), np.round(b[1], 1), np.round(a[2], 2), np.round(b[2], 2), 'OK' if same else 'DIFF')
oa, ob = A[1], Bn[1]; od = (oa - ob) + (ob - oa)
print('== 其他網格（不是頂點色）：', 'OK 完全相同' if not od else 'DIFF %s' % list(od.items())[:10]); ok &= not od
print('== draw call 估計（GLB 裡顯示中的 primitive；影子＝不是 instancing、材質不在 WZ_NO_SHADOW；遊戲的「貼地、細小不投影」規則沒算）')
print('  舊', dict(A[2]), ' 新', dict(Bn[2]))
print('== 頂點色 primitive：舊', len(A[3]), '新', len(Bn[3]))
for x in sorted(A[3], key=str): print('  舊', x)
for x in sorted(Bn[3], key=str): print('  新', x)
print('RESULT', 'SAME' if ok else 'DIFFERENT')
