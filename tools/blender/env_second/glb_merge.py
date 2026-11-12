"""把一顆小 GLB 接進一顆大 GLB（不重建整條街：把新的櫥窗店內、店面零件加進街景模型）。純 Python。
用法：python3 glb_merge.py base.glb add.glb out.glb [--at x,y,z] [--ry 弧度] [--name 上層節點名] [--scale sx,sy,sz]
- add.glb 的場景根節點全部掛到一個新的上層節點（--name，預設 add 的檔名）底下，放在 --at、繞 y 轉 --ry（遊戲座標＝glTF 座標）。
- 兩邊的 BIN 接在一起（add 的 bufferView 位移往後移）；add 的材質、貼圖、圖片、取樣器、網格、accessor 全部加在後面、索引重編。
  **同名材質不合併**（加進來的照自己的設定）；要共用材質就在做 add.glb 的時候用不同的名字或事後處理。
- 只支援一個 buffer（GLB 內嵌）、圖片在 bufferView 裡；動畫、skin、camera 不搬。"""
import json, math, os, struct, sys
A = sys.argv[1:]
if len(A) < 3: print(__doc__); sys.exit(2)
def opt(k, d=None): return A[A.index(k) + 1] if k in A else d
def load(p):
    f = open(p, 'rb').read(); n = struct.unpack('<I', f[12:16])[0]; j = json.loads(f[20:20 + n]); b = f[20 + n + 8:20 + n + 8 + struct.unpack('<I', f[20 + n:24 + n])[0]]; return j, bytearray(b)
J, B = load(A[0]); K, C = load(A[1])
while len(B) % 4: B.append(0)
off = len(B); B += C
while len(B) % 4: B.append(0)
for k in ('bufferViews', 'accessors', 'materials', 'textures', 'images', 'samplers', 'meshes', 'nodes'): J.setdefault(k, [])
nb, na, nm, nt, ni, ns, nme, nn = (len(J[k]) for k in ('bufferViews', 'accessors', 'materials', 'textures', 'images', 'samplers', 'meshes', 'nodes'))
for bv in K.get('bufferViews', []): bv = dict(bv); bv['buffer'] = 0; bv['byteOffset'] = bv.get('byteOffset', 0) + off; J['bufferViews'].append(bv)
for a in K.get('accessors', []):
    a = dict(a)
    if 'bufferView' in a: a['bufferView'] += nb
    assert 'sparse' not in a; J['accessors'].append(a)
for s in K.get('samplers', []): J['samplers'].append(s)
for im in K.get('images', []):
    im = dict(im); assert 'bufferView' in im, '圖片要內嵌'; im['bufferView'] += nb; J['images'].append(im)
for t in K.get('textures', []):
    t = dict(t)
    if 'source' in t: t['source'] += ni
    if 'sampler' in t: t['sampler'] += ns
    J['textures'].append(t)
def fix_tex(o):
    if isinstance(o, dict):
        return {k: (v + nt if k == 'index' and isinstance(v, int) and 'texCoord' in o or (k == 'index' and isinstance(v, int)) else fix_tex(v)) for k, v in o.items()}
    if isinstance(o, list): return [fix_tex(v) for v in o]
    return o
for m in K.get('materials', []): J['materials'].append(fix_tex(m))
for me in K.get('meshes', []):
    me = json.loads(json.dumps(me))
    for pr in me['primitives']:
        pr['attributes'] = {k: v + na for k, v in pr['attributes'].items()}
        if 'indices' in pr: pr['indices'] += na
        if 'material' in pr: pr['material'] += nm
        assert 'targets' not in pr
    J['meshes'].append(me)
for nd in K.get('nodes', []):
    nd = {k: v for k, v in nd.items() if k not in ('skin', 'camera')}
    if 'mesh' in nd: nd['mesh'] += nme
    if 'children' in nd: nd['children'] = [c + nn for c in nd['children']]
    J['nodes'].append(nd)
roots = [r + nn for r in K['scenes'][K.get('scene', 0)]['nodes']]
top = {'name': opt('--name', os.path.splitext(os.path.basename(A[1]))[0]), 'children': roots}
if opt('--at'): top['translation'] = [float(v) for v in opt('--at').split(',')]
if opt('--ry'): r = float(opt('--ry')); top['rotation'] = [0.0, math.sin(r / 2), 0.0, math.cos(r / 2)]
if opt('--scale'): top['scale'] = [float(v) for v in opt('--scale').split(',')]
J['nodes'].append(top); J['scenes'][J.get('scene', 0)]['nodes'].append(len(J['nodes']) - 1)
J['buffers'] = [{'byteLength': len(B)}]
for k in ('extensionsUsed', 'extensionsRequired'):
    if K.get(k): J[k] = sorted(set(J.get(k, [])) | set(K[k]))
js = json.dumps(J, separators=(',', ':'), ensure_ascii=False).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(B)) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(B)) + b'BIN\x00' + bytes(B)
open(A[2], 'wb').write(out)
print(json.dumps({'out': A[2], 'bytes': len(out), 'added_nodes': len(K.get('nodes', [])) + 1, 'added_meshes': len(K.get('meshes', [])), 'added_materials': len(K.get('materials', []))}, ensure_ascii=False))
