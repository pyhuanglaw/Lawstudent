"""烘焙過的 GLB 換掉幾張貼圖（不重烘）：aa_cc0.py 的中性紋路調淡以後，光照貼圖不受影響，只換顏色貼圖（SHOP-CC0-HELP-1113）。
用法：python3 glb_swap_images.py <烘焙過的.glb> <輸出.glb> <新模型.glb>
  照圖名（去掉 _nNN 的明暗起伏標記）比對：新模型裡同一張紋路的圖（例：Plaster001_n03_256）換掉烘焙檔裡的舊圖（Plaster001_n05_256），名字一起改。"""
import json, re, struct, sys


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); o = 20 + n
    bn = struct.unpack('<I', b[o:o + 4])[0]; return j, b[o + 8:o + 8 + bn]


def key(nm): return re.sub(r'_n\d\d_', '_n_', nm or '')


src, out, new = sys.argv[1:4]
J, BIN = load(src); NJ, NB = load(new)
newimg = {}
for im in NJ.get('images', []):
    if re.search(r'_n\d\d_\d+$', im.get('name', '')):
        bv = NJ['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0); newimg[key(im['name'])] = (im['name'], NB[o:o + bv['byteLength']])
repl = {}
for im in J.get('images', []):
    k = key(im.get('name'))
    if k in newimg and k != im.get('name'):
        nm, data = newimg[k]; repl[im['bufferView']] = data; print('swap', im['name'], '→', nm, len(data)); im['name'] = nm
out_bin = bytearray()
for i, bv in enumerate(J['bufferViews']):
    o = bv.get('byteOffset', 0); data = repl.get(i, BIN[o:o + bv['byteLength']])
    while len(out_bin) % 4: out_bin.append(0)
    bv['byteOffset'] = len(out_bin); bv['byteLength'] = len(data); out_bin += data
while len(out_bin) % 4: out_bin.append(0)
J['buffers'][0]['byteLength'] = len(out_bin)
js = json.dumps(J, separators=(',', ':'), ensure_ascii=False).encode()
while len(js) % 4: js += b' '
glb = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(out_bin)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(out_bin)) + b'BIN\x00' + bytes(out_bin)
open(out, 'wb').write(glb); print('wrote', out, len(glb), 'swapped', len(repl))
