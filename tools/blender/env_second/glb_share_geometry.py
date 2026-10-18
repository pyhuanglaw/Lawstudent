"""GLB 後處理：同一個形狀、不同配色的網格共用頂點與索引（只有 UV 不同）→ 檔案小一半。
例：seated_figures.glb 的 fig_<底模>_<姿勢>_c1（＿lod1）和 fig_<底模>_<姿勢>_c0（＿lod1）形狀相同、只是 UV 落在貼圖集的另一格。
規則：名字裡的 `_c<數字>` 換成 `_c0` 找到第一個配色的網格；兩邊每個 primitive 的 POSITION、NORMAL、indices 的資料逐位元組相同才共用（不同就不動）。
再來（2026-10-17 加）：所有網格裡「資料逐位元組相同、型別相同」的 accessor 都合併成一個——例：seated_figures 第二版同一個底模的三個姿勢 UV 和三角形索引一樣（只有頂點位置不同）。
沒用到的 accessor、bufferView 拿掉，重新排 BIN。
--qnormals：法線改存成 8 位元（BYTE normalized、每個頂點補到 4 bytes；KHR_mesh_quantization，three.js 的 GLTFLoader 支援）——法線佔檔案的三成，壓完小 3/4。
用法：python3 tools/blender/env_second/glb_share_geometry.py <in.glb> [<out.glb>] [--qnormals]（不給 out 就覆寫）"""
import json, re, struct, sys


def read_glb(path):
    b = open(path, 'rb').read()
    assert b[:4] == b'glTF'
    jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl])
    o = 20 + jl; bl = struct.unpack('<I', b[o:o + 4])[0]; bin_ = b[o + 8:o + 8 + bl]
    return j, bin_


def write_glb(path, j, bin_):
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    js += b' ' * ((4 - len(js) % 4) % 4); bin_ += b'\0' * ((4 - len(bin_) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(bin_)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total)); f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
        f.write(struct.pack('<II', len(bin_), 0x004E4942)); f.write(bin_)


def acc_bytes(j, bin_, ai):
    a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]
    return bin_[bv.get('byteOffset', 0) + a.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]


def quantize_normals(j, bin_):
    """所有 float 的 NORMAL 改成 BYTE normalized（x、y、z、0 一組 4 bytes）；回傳新的 BIN（舊的資料留著，後面重新排的時候沒用到的會拿掉）"""
    import array
    out = bytearray(bin_); done = {}
    for m in j['meshes']:
        for p in m['primitives']:
            ai = p['attributes'].get('NORMAL')
            if ai is None or ai in done: continue
            a = j['accessors'][ai]
            if a['componentType'] != 5126 or a['type'] != 'VEC3': continue
            f = array.array('f'); f.frombytes(acc_bytes(j, bin_, ai)[:a['count'] * 12])
            q = bytearray()
            for i in range(a['count']):
                for c in f[i * 3:i * 3 + 3]: q += struct.pack('<b', max(-127, min(127, round(c * 127))))
                q += b'\0'
            while len(out) % 4: out.append(0)
            j['bufferViews'].append({'buffer': 0, 'byteOffset': len(out), 'byteLength': len(q), 'byteStride': 4, 'target': 34962}); out += q
            a.update(bufferView=len(j['bufferViews']) - 1, componentType=5120, normalized=True); a.pop('byteOffset', None); a.pop('min', None); a.pop('max', None)
            done[ai] = True
    if done:
        for k in ('extensionsUsed', 'extensionsRequired'):
            L = j.setdefault(k, [])
            if 'KHR_mesh_quantization' not in L: L.append('KHR_mesh_quantization')
    return bytes(out)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    src = args[0]; dst = args[1] if len(args) > 1 else src
    j, bin_ = read_glb(src)
    byname = {m['name']: i for i, m in enumerate(j['meshes'])}
    shared = 0
    for name, mi in byname.items():
        m0 = re.sub(r'_c\d+', '_c0', name)
        if m0 == name or m0 not in byname: continue
        A, B = j['meshes'][byname[m0]], j['meshes'][mi]
        if len(A['primitives']) != len(B['primitives']): continue
        for pa, pb in zip(A['primitives'], B['primitives']):
            same = all(acc_bytes(j, bin_, pa['attributes'][k]) == acc_bytes(j, bin_, pb['attributes'][k]) for k in ('POSITION', 'NORMAL') if k in pa['attributes'] and k in pb['attributes'])
            same = same and acc_bytes(j, bin_, pa['indices']) == acc_bytes(j, bin_, pb['indices'])
            if not same: print('  不一樣，不共用：', name); continue
            for k in ('POSITION', 'NORMAL'):
                if k in pa['attributes']: pb['attributes'][k] = pa['attributes'][k]
            pb['indices'] = pa['indices']; shared += 1
    # 資料完全相同的 accessor 合併（不看名字）
    seen = {}; dedup = 0
    def key(ai):
        a = j['accessors'][ai]; meta = json.dumps({k: v for k, v in a.items() if k not in ('bufferView', 'byteOffset', 'name')}, sort_keys=True)
        return meta, acc_bytes(j, bin_, ai)
    for m in j['meshes']:
        for p in m['primitives']:
            for k, ai in list(p['attributes'].items()) + ([('indices', p['indices'])] if 'indices' in p else []):
                kk = key(ai); first = seen.setdefault(kk, ai)
                if first != ai:
                    dedup += 1
                    if k == 'indices': p['indices'] = first
                    else: p['attributes'][k] = first
    if '--qnormals' in sys.argv: bin_ = quantize_normals(j, bin_)
    # 用到的 accessor
    used = set()
    for m in j['meshes']:
        for p in m['primitives']:
            used.update(p['attributes'].values())
            if 'indices' in p: used.add(p['indices'])
    for s in j.get('skins', []):
        if 'inverseBindMatrices' in s: used.add(s['inverseBindMatrices'])
    for an in j.get('animations', []):
        for sm in an['samplers']: used.update((sm['input'], sm['output']))
    amap = {}; accs = []
    for i, a in enumerate(j['accessors']):
        if i in used: amap[i] = len(accs); accs.append(a)
    j['accessors'] = accs
    for m in j['meshes']:
        for p in m['primitives']:
            p['attributes'] = {k: amap[v] for k, v in p['attributes'].items()}
            if 'indices' in p: p['indices'] = amap[p['indices']]
    for s in j.get('skins', []):
        if 'inverseBindMatrices' in s: s['inverseBindMatrices'] = amap[s['inverseBindMatrices']]
    for an in j.get('animations', []):
        for sm in an['samplers']: sm['input'] = amap[sm['input']]; sm['output'] = amap[sm['output']]
    # 用到的 bufferView（accessor、圖片），重新排 BIN
    ubv = sorted({a['bufferView'] for a in accs if 'bufferView' in a} | {im['bufferView'] for im in j.get('images', []) if 'bufferView' in im})
    out = bytearray(); bmap = {}; views = []
    for i in ubv:
        bv = dict(j['bufferViews'][i]); data = bin_[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
        while len(out) % 4: out.append(0)
        bv['byteOffset'] = len(out); out += data; bmap[i] = len(views); views.append(bv)
    j['bufferViews'] = views
    for a in accs:
        if 'bufferView' in a: a['bufferView'] = bmap[a['bufferView']]
    for im in j.get('images', []):
        if 'bufferView' in im: im['bufferView'] = bmap[im['bufferView']]
    j['buffers'] = [{'byteLength': len(out)}]
    write_glb(dst, j, bytes(out))
    print(json.dumps({'shared_primitives': shared, 'dedup_accessors': dedup, 'accessors': len(accs), 'bufferViews': len(views), 'bin_bytes': len(out)}))


if __name__ == '__main__':
    main()
