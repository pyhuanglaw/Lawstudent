#!/usr/bin/env python3
"""同一間房間、不同家具布置的第二張光照貼圖（LAWWW2-B 2026-11-07；萬才研討室 B：平常的初談隔間／推甄面試）。
用法：python3 lm_sets.py <A.glb（預設布置烘的）> <B.glb（另一套布置烘的）> <布置名，例 interview> <輸出.glb>
  - 比對 A、B 每個網格的第二套 UV（TEXCOORD_1）：兩次烘的網格一樣（家具本身都不烘），bake_room.py 的展 UV 也一樣，所以應該完全相同；
    有任何一個網格不同就停下來（貼圖對不上 UV，換成另一張會整間亂掉）。
  - 一樣：輸出＝A，場景的 extras.lightmap 多一項 sets.<布置名>＝{day, night}（B 的兩張）。遊戲照當天的布置換（rooms_glb3d.js，見同一天的 patch）。
"""
import sys, json, struct


def read(p):
    b = open(p, 'rb').read()
    assert b[:4] == b'glTF', p
    n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n])
    o = 20 + n; bn = struct.unpack('<I', b[o:o + 4])[0]; binc = b[o + 8:o + 8 + bn]
    return j, binc


def uv1(j, binc):
    """{網格節點名: [每個 primitive 的 TEXCOORD_1 位元組]}（沒有的回 None）"""
    out = {}
    for nd in j['nodes']:
        if 'mesh' not in nd: continue
        arr = []
        for pr in j['meshes'][nd['mesh']]['primitives']:
            ai = pr['attributes'].get('TEXCOORD_1')
            if ai is None: arr.append(None); continue
            a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]
            comp = {5126: 4, 5123: 2, 5121: 1}[a['componentType']]; size = comp * 2; stride = bv.get('byteStride') or size
            st = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
            arr.append(b''.join(binc[st + i * stride: st + i * stride + size] for i in range(a['count'])))
        out[nd['name']] = arr
    return out


def write(p, j, binc):
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    binc = binc + b'\0' * ((4 - len(binc) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(binc)
    with open(p, 'wb') as f:
        f.write(b'glTF' + struct.pack('<II', 2, total))
        f.write(struct.pack('<I', len(js)) + b'JSON' + js)
        f.write(struct.pack('<I', len(binc)) + b'BIN\0' + binc)


if __name__ == '__main__':
    pa, pb, name, out = sys.argv[1:5]
    ja, ba = read(pa); jb, bb = read(pb)
    ua, ub = uv1(ja, ba), uv1(jb, bb)
    bad = [k for k in sorted(set(ua) | set(ub)) if ua.get(k) != ub.get(k)]
    if bad:
        print('UV 不一樣，停止：', bad); sys.exit(1)
    la = ja['scenes'][0]['extras']['lightmap']; lb = jb['scenes'][0]['extras']['lightmap']
    assert abs(la['intensity'] - lb['intensity']) < 1e-9, (la, lb)
    la.setdefault('sets', {})[name] = {'day': lb['day'], 'night': lb['night']}
    write(out, ja, ba)
    n = sum(1 for v in ua.values() if any(x is not None for x in v))
    print('ok：%d 個網格的第二套 UV 一樣；%s 多了 sets.%s' % (n, out, name), json.dumps(la, ensure_ascii=False))
