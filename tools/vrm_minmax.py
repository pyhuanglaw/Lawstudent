"""VRM／GLB 的 POSITION accessor（含表情形變 morph target）補上 min／max（glTF 規格要求；沒有的話 three.js 的 GLTFLoader 每次載入都印
「Missing min/max properties for accessor POSITION」警告）。只改 JSON 區塊，二進位資料（頂點、貼圖）完全不動。
來源：LAWWW2 2026-10-10 16:59Z 回報警告來自 VRoid 人物 VRM 的表情形變（vroid_build.py 輸出時沒寫 min／max）。
用法：python3 tools/vrm_minmax.py <檔案.vrm> [...]（直接改檔；先 --check 看有幾個要補）"""
import json, struct, sys


def load(path):
    b = open(path, 'rb').read()
    magic, ver, total = struct.unpack_from('<4sII', b, 0)
    assert magic == b'glTF', path
    off = 12; chunks = []
    while off < len(b):
        ln, typ = struct.unpack_from('<I4s', b, off); chunks.append((typ, b[off + 8:off + 8 + ln])); off += 8 + ln
    return ver, chunks


def save(path, ver, chunks):
    out = b''
    for typ, data in chunks:
        pad = (b' ' if typ == b'JSON' else b'\x00') * ((4 - len(data) % 4) % 4)
        data = data + pad; out += struct.pack('<I4s', len(data), typ) + data
    open(path, 'wb').write(struct.pack('<4sII', b'glTF', ver, 12 + len(out)) + out)


def fix(path, check=False):
    ver, chunks = load(path)
    js = json.loads(chunks[0][1].decode('utf-8')); binc = chunks[1][1] if len(chunks) > 1 else b''
    acc = js.get('accessors', []); views = js.get('bufferViews', [])
    targets = set()
    for m in js.get('meshes', []):
        for p in m.get('primitives', []):
            if 'POSITION' in p.get('attributes', {}): targets.add(p['attributes']['POSITION'])
            for t in p.get('targets', []) or []:
                if 'POSITION' in t: targets.add(t['POSITION'])
    n = 0
    for i in sorted(targets):
        a = acc[i]
        if 'min' in a and 'max' in a: continue
        n += 1
        if check: continue
        assert a['type'] == 'VEC3' and a['componentType'] == 5126, (path, i, a.get('type'), a.get('componentType'))
        cnt = a['count']
        if 'bufferView' not in a:          # 稀疏或全 0 的 accessor
            a['min'] = [0.0, 0.0, 0.0]; a['max'] = [0.0, 0.0, 0.0]; continue
        v = views[a['bufferView']]; st = v.get('byteStride', 12); base = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        lo = [float('inf')] * 3; hi = [float('-inf')] * 3
        for k in range(cnt):
            xyz = struct.unpack_from('<3f', binc, base + k * st)
            for j in range(3):
                if xyz[j] < lo[j]: lo[j] = xyz[j]
                if xyz[j] > hi[j]: hi[j] = xyz[j]
        if cnt == 0: lo = hi = [0.0, 0.0, 0.0]
        a['min'] = lo; a['max'] = hi
    if not check and n:
        chunks[0] = (b'JSON', json.dumps(js, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
        save(path, ver, chunks)
    return n


if __name__ == '__main__':
    check = '--check' in sys.argv
    for f in [a for a in sys.argv[1:] if a != '--check']:
        print(f, ('缺 min/max 的 POSITION accessor：%d' if check else '補上 min/max：%d') % fix(f, check))
