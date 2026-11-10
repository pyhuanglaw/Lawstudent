"""VRM（glTF binary）頭髮診斷：只讀檔，不改任何東西。
用法：python vrm_hair_probe.py <a.vrm> [<b.vrm> ...] [--json out.json] [--atlas out_dir]
每個檔印出：
  - 頭髮網格／primitive 數、三角形數、頂點數
  - 髮束數（connected components，用「同位置頂點合併」以後算）、每束的三角形數分布、外形重複（長寬高＋三角形數相同）的束數
  - 法線：同位置頂點但法線不同的比例（硬邊、分面）、頂點法線和相鄰面法線的平均夾角
  - 每一束的「截面」：沿主軸切片，看截面寬高比（扁片 ribbon≈卡片、圓管 tube≈麵條）
  - 頭髮材質：alphaMode、MToon（VRM 0.x materialProperties）的 _ShadeToony／_ShadeShift／_OutlineWidth／_RimColor…、貼圖尺寸
"""
import json, struct, sys, os, io
import numpy as np

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load_glb(p):
    b = open(p, 'rb').read()
    magic, ver, ln = struct.unpack_from('<III', b, 0)
    assert magic == 0x46546C67, 'not glb'
    off = 12; js = None; binc = None
    while off < ln:
        cl, ctype = struct.unpack_from('<II', b, off); off += 8
        chunk = b[off:off + cl]; off += cl
        if ctype == 0x4E4F534A: js = json.loads(chunk.decode('utf-8'))
        elif ctype == 0x004E4942: binc = chunk
    return js, binc


def acc(js, binc, i):
    a = js['accessors'][i]; bv = js['bufferViews'][a['bufferView']]
    dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0)
    if stride and stride != dt.itemsize * n:
        raw = np.frombuffer(binc, dtype=np.uint8, count=stride * (a['count'] - 1) + dt.itemsize * n, offset=start)
        out = np.lib.stride_tricks.as_strided(raw, shape=(a['count'], dt.itemsize * n), strides=(stride, 1)).copy()
        return out.view(dt).reshape(a['count'], n)
    return np.frombuffer(binc, dtype=dt, count=a['count'] * n, offset=start).reshape(a['count'], n)


def components(tri, nverts):
    # union-find over triangles' vertices
    par = np.arange(nverts)

    def find(x):
        r = x
        while par[r] != r: r = par[r]
        while par[x] != r: par[x], x = r, par[x]
        return r
    for t in tri:
        a, b, c = find(t[0]), find(t[1]), find(t[2])
        if a != b: par[b] = a
        if a != c: par[find(c)] = a
    roots = np.array([find(i) for i in range(nverts)])
    return roots


def img_size(js, binc, tex_index):
    try:
        src = js['textures'][tex_index]['source']; im = js['images'][src]
        bv = js['bufferViews'][im['bufferView']]; data = binc[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
        from PIL import Image
        I = Image.open(io.BytesIO(data)); return I.size, I.mode, data
    except Exception as e:
        return None, None, None


def probe(path, atlas_dir=None):
    js, binc = load_glb(path)
    rep = {'file': os.path.basename(path), 'extensionsUsed': js.get('extensionsUsed', [])}
    mats = js.get('materials', [])
    vrm0 = js.get('extensions', {}).get('VRM', {})
    mprops = {m['name']: m for m in vrm0.get('materialProperties', [])}
    hair_mat_idx = [i for i, m in enumerate(mats) if 'HAIR' in m.get('name', '').upper()]
    rep['hairMaterials'] = []
    for i in hair_mat_idx:
        m = mats[i]; mp = mprops.get(m['name'], {})
        fp = mp.get('floatProperties', {}); vp = mp.get('vectorProperties', {}); tp = mp.get('textureProperties', {})
        ext1 = m.get('extensions', {}).get('VRMC_materials_mtoon')
        texs = {}
        for k, ti in tp.items():
            sz, mode, data = img_size(js, binc, ti)
            texs[k] = {'tex': ti, 'size': sz, 'mode': mode}
            if atlas_dir and data and k in ('_MainTex', '_ShadeTexture', '_BumpMap', '_SphereAdd', '_RimTexture', '_OutlineWidthTexture'):
                os.makedirs(atlas_dir, exist_ok=True)
                open(os.path.join(atlas_dir, f"{rep['file']}_{m['name'].replace('/', '_')}_{k}.png"), 'wb').write(data)
        rep['hairMaterials'].append({
            'index': i, 'name': m['name'], 'alphaMode': m.get('alphaMode', 'OPAQUE'), 'alphaCutoff': m.get('alphaCutoff'), 'doubleSided': m.get('doubleSided', False),
            'shader': mp.get('shader'), 'renderQueue': mp.get('renderQueue'), 'keywords': mp.get('keywordMap'),
            'float': {k: fp.get(k) for k in ('_Cutoff', '_ShadeToony', '_ShadeShift', '_ReceiveShadowRate', '_ShadingGradeRate', '_LightColorAttenuation', '_IndirectLightIntensity',
                                             '_RimLightingMix', '_RimFresnelPower', '_RimLift', '_OutlineWidth', '_OutlineWidthMode', '_OutlineColorMode', '_OutlineLightingMix', '_OutlineScaledMaxDistance', '_BumpScale', '_CullMode', '_BlendMode') if k in fp},
            'vector': {k: [round(x, 3) for x in vp.get(k)] for k in ('_Color', '_ShadeColor', '_RimColor', '_OutlineColor', '_EmissionColor') if k in vp},
            'textures': texs, 'mtoon1': bool(ext1)})
    # meshes
    hair_prims = []; tot = {'tris': 0, 'verts': 0}
    for mi, mesh in enumerate(js['meshes']):
        for pi, pr in enumerate(mesh['primitives']):
            if pr.get('material') not in hair_mat_idx: continue
            P = acc(js, binc, pr['attributes']['POSITION']).astype(np.float64)
            N = acc(js, binc, pr['attributes']['NORMAL']).astype(np.float64) if 'NORMAL' in pr['attributes'] else None
            I = acc(js, binc, pr['indices']).reshape(-1, 3).astype(np.int64)
            # 只看真的有被這個 primitive 用到的頂點
            used = np.unique(I); remap = -np.ones(len(P), np.int64); remap[used] = np.arange(len(used))
            Pu, Nu, Iu = P[used], (N[used] if N is not None else None), remap[I]
            # 同位置合併（1e-5 m）
            key = np.round(Pu / 1e-5).astype(np.int64)
            _, weld, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
            inv = inv.ravel(); Iw = inv[Iu]
            roots = components(Iw, len(weld))
            comp_of_tri = roots[Iw[:, 0]]
            ids, counts = np.unique(comp_of_tri, return_counts=True)
            # 硬邊：同位置的頂點，法線差 > 10°
            split = 0; dup = 0
            if Nu is not None:
                order = np.argsort(inv)
                si = inv[order]; brk = np.flatnonzero(np.diff(si)) + 1
                for grp in np.split(order, brk):
                    if len(grp) < 2: continue
                    dup += 1
                    nn = Nu[grp]; nn = nn / np.maximum(np.linalg.norm(nn, axis=1, keepdims=True), 1e-9)
                    if (nn @ nn[0] < np.cos(np.radians(10))).any(): split += 1
            # 面法線 vs 頂點法線
            v0, v1, v2 = Pu[Iu[:, 0]], Pu[Iu[:, 1]], Pu[Iu[:, 2]]
            fn = np.cross(v1 - v0, v2 - v0); area = np.linalg.norm(fn, axis=1); fnn = fn / np.maximum(area[:, None], 1e-12)
            ang = None
            if Nu is not None:
                vn = Nu[Iu].mean(1); vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-9)
                ang = float(np.degrees(np.arccos(np.clip((vn * fnn).sum(1), -1, 1))).mean())
            # 每一束的形狀：PCA 主軸長度 + 截面扁平度
            shapes = []
            for cid in ids:
                tri_ids = np.flatnonzero(comp_of_tri == cid)
                vids = np.unique(Iw[tri_ids]); pts = Pu[weld[vids]]
                c = pts - pts.mean(0)
                if len(pts) < 4: continue
                ev = np.sqrt(np.maximum(np.linalg.eigvalsh(np.cov(c.T)), 0))[::-1]  # 長、寬、厚（標準差）
                shapes.append((len(tri_ids), *[float(x) for x in ev]))
            S = np.array(shapes) if shapes else np.zeros((0, 4))
            # 外形相同的束（三角形數相同、長寬厚差 < 5%）＝複製貼上的髮束
            sig = {}
            for s in S:
                k = (int(s[0]), round(s[1], 3), round(s[2], 3), round(s[3], 3)); sig[k] = sig.get(k, 0) + 1
            repeated = sum(v for v in sig.values() if v > 1)
            repeated3 = sum(v for v in sig.values() if v > 2)   # 三束以上一模一樣（左右對稱的一對不算）
            # 束的截面扁平度：厚/寬（0＝完全扁片；1＝圓管）
            flat = (S[:, 3] / np.maximum(S[:, 2], 1e-9)) if len(S) else np.array([])
            elong = (S[:, 1] / np.maximum(S[:, 2], 1e-9)) if len(S) else np.array([])
            uv = acc(js, binc, pr['attributes']['TEXCOORD_0'])[used] if 'TEXCOORD_0' in pr['attributes'] else None
            hp = {'mesh': mesh.get('name', mi), 'prim': pi, 'material': mats[pr['material']]['name'], 'tris': int(len(I)), 'verts': int(len(used)),
                  'strands': int(len(ids)), 'trisPerStrand_median': float(np.median(counts)), 'trisPerStrand_min': int(counts.min()), 'trisPerStrand_max': int(counts.max()),
                  'repeatedStrands': int(repeated), 'repeated3plus': int(repeated3), 'weldedVertsWithCopies': int(dup), 'hardEdgeVerts(>10deg)': int(split),
                  'meanVertexVsFaceNormalDeg': ang,
                  'strandThickness/width_median': float(np.median(flat)) if len(flat) else None,
                  'strandLength/width_median': float(np.median(elong)) if len(elong) else None,
                  'uvRange': [[float(uv[:, 0].min()), float(uv[:, 0].max())], [float(uv[:, 1].min()), float(uv[:, 1].max())]] if uv is not None else None,
                  'bbox_m': [float(x) for x in (Pu.max(0) - Pu.min(0))]}
            hair_prims.append(hp); tot['tris'] += hp['tris']; tot['verts'] += hp['verts']
    rep['hairPrimitives'] = hair_prims; rep['hairTotal'] = tot
    sb = vrm0.get('secondaryAnimation', {}).get('boneGroups', [])
    rep['springBoneGroups'] = [{'comment': g.get('comment'), 'stiff': g.get('stiffiness'), 'drag': g.get('dragForce'), 'gravity': g.get('gravityPower'), 'hitR': g.get('hitRadius'), 'bones': len(g.get('bones', []))} for g in sb]
    return rep


if __name__ == '__main__':
    A = sys.argv[1:]; out = None; atlas = None
    if '--json' in A: out = A[A.index('--json') + 1]; A = [a for a in A if a not in ('--json', out)]
    if '--atlas' in A: atlas = A[A.index('--atlas') + 1]; A = [a for a in A if a not in ('--atlas', atlas)]
    reps = []
    for p in A:
        r = probe(p, atlas); reps.append(r)
        print('==', r['file'], r['extensionsUsed'])
        for m in r['hairMaterials']:
            print('  MAT', m['name'], m['alphaMode'], 'cut', m['alphaCutoff'], 'dbl', m['doubleSided'], m['shader'], 'q', m['renderQueue'])
            print('     float', m['float']); print('     vec', m['vector']); print('     tex', {k: v['size'] for k, v in m['textures'].items()})
        for h in r['hairPrimitives']:
            print('  PRIM', {k: (round(v, 3) if isinstance(v, float) else v) for k, v in h.items()})
        print('  TOTAL', r['hairTotal'], 'spring', r['springBoneGroups'][:6])
    if out: json.dump(reps, open(out, 'w'), ensure_ascii=False, indent=1)
