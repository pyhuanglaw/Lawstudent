"""GLB 後處理：同一個形狀、不同配色的網格共用頂點與索引（只有 UV 不同）→ 檔案小一半。
例：seated_figures.glb 的 fig_<底模>_<姿勢>_c1（＿lod1）和 fig_<底模>_<姿勢>_c0（＿lod1）形狀相同、只是 UV 落在貼圖集的另一格。
規則：名字裡的 `_c<數字>` 換成 `_c0` 找到第一個配色的網格；兩邊每個 primitive 的 POSITION、NORMAL、indices 的資料逐位元組相同才共用（不同就不動）。
沒用到的 accessor、bufferView 拿掉，重新排 BIN。
用法：python3 tools/blender/env_second/glb_share_geometry.py <in.glb> [<out.glb>]（不給 out 就覆寫）"""
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


def main():
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else src
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
    print(json.dumps({'shared_primitives': shared, 'accessors': len(accs), 'bufferViews': len(views), 'bin_bytes': len(out)}))


if __name__ == '__main__':
    main()
