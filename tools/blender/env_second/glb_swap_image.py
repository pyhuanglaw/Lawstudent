#!/usr/bin/env python3
"""把 A.glb 裡名字是 NAME 的貼圖換成 B.glb 的同名貼圖（其他幾何、UV、材質一個位元組都不動）。用法：glb_swap_image.py A.glb B.glb NAME OUT.glb"""
import json, struct, sys
def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); o = 20 + n
    m = struct.unpack('<I', b[o:o + 4])[0]; return j, b[o + 8:o + 8 + m]
def img(j, bin_, name):
    i = next(k for k, im in enumerate(j['images']) if im.get('name') == name); bv = j['bufferViews'][j['images'][i]['bufferView']]
    return i, bv, bin_[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
a, b, name, out = sys.argv[1:5]
ja, ba = load(a); jb, bb = load(b)
ia, bva, old = img(ja, ba, name); ib, bvb, new = img(jb, bb, name)
ja['images'][ia]['mimeType'] = jb['images'][ib].get('mimeType', ja['images'][ia].get('mimeType'))
off = bva.get('byteOffset', 0); pad = (-len(new)) % 4; d = len(new) + pad - (bva['byteLength'] + ((-bva['byteLength']) % 4))
nb = ba[:off] + new + b'\0' * pad + ba[off + bva['byteLength'] + ((-bva['byteLength']) % 4):]
for v in ja['bufferViews']:
    if v.get('byteOffset', 0) > off: v['byteOffset'] = v['byteOffset'] + d
bva['byteLength'] = len(new); ja['buffers'][0]['byteLength'] = len(nb)
js = json.dumps(ja, ensure_ascii=False, separators=(',', ':')).encode(); js += b' ' * ((-len(js)) % 4)
open(out, 'wb').write(b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(nb)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(nb)) + b'BIN\0' + nb)
print(name, len(old), '→', len(new), 'bytes；位移', d)
