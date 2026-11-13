"""烘焙過的 GLB 換掉材質的貼圖、法線強度（不重烘；SHOP-CC0-HELP-1113）。
aa_cc0.py 的中性紋路、法線調淡，或 Poly Haven 模型改顏色以後，光照貼圖（只烘地板、天花板、牆）不受影響：
照「材質名」比對新模型（同一份腳本重新匯出、沒烘焙的 GLB），把 baseColorTexture／normalTexture 的圖（內容、圖名）和 normalTexture.scale 換成新的。
烘焙時拆開的材質（…_rt）、只在烘焙檔裡的材質不動。
用法：python3 glb_swap_images.py <烘焙過的.glb> <輸出.glb> <新模型.glb> [--rename 舊材質名=新材質名 …]（新版改了材質名的，例如 Poly Haven 模型加了 tag）"""
import json, struct, sys


def load(p):
    b = open(p, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); o = 20 + n
    bn = struct.unpack('<I', b[o:o + 4])[0]; return j, b[o + 8:o + 8 + bn]


def img_of(j, bin_, tex):
    t = j['textures'][tex['index']]; src_ = t['source'] if 'source' in t else t['extensions']['EXT_texture_webp']['source']
    im = j['images'][src_]; bv = j['bufferViews'][im['bufferView']]; o = bv.get('byteOffset', 0)
    return im, bin_[o:o + bv['byteLength']]


src, out, new = sys.argv[1:4]
J, BIN = load(src); NJ, NB = load(new)
RN = dict(a.split('=', 1) for a in sys.argv[4:] if '=' in a)
for m in J.get('materials', []):
    if m.get('name') in RN: print('rename', m['name'], '→', RN[m['name']]); m['name'] = RN[m['name']]
NM = {m['name']: m for m in NJ.get('materials', [])}
repl = {}; n_img = 0
for m in J.get('materials', []):
    nm = NM.get(m['name'])
    if not nm: continue
    for slot, parent in (('baseColorTexture', 'pbrMetallicRoughness'), ('normalTexture', None)):
        a = (m.get(parent) or {}).get(slot) if parent else m.get(slot)
        b = (nm.get(parent) or {}).get(slot) if parent else nm.get(slot)
        if not a or not b: continue
        im, old = img_of(J, BIN, a); nim, data = img_of(NJ, NB, b)
        if data != old or im.get('name') != nim.get('name'):
            repl[im['bufferView']] = data; print('swap', m['name'], slot, im.get('name'), '→', nim.get('name')); im['name'] = nim.get('name'); n_img += 1
        if slot == 'normalTexture' and 'scale' in b and a.get('scale') != b['scale']: print('  scale', m['name'], a.get('scale'), '→', b['scale']); a['scale'] = b['scale']
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
open(out, 'wb').write(glb); print('wrote', out, len(glb), 'images swapped', n_img)
