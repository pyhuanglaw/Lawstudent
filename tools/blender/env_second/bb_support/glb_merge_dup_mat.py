"""把 GLB 裡烘焙重新匯入時複製出來的「<名字>.001」材質併回原本那一個（設定相同才併；SHOP-CC0-HELP-1113 幫手 g2）。
用法：python3 glb_merge_dup_mat.py <glb>（就地改寫）
起因：唱片 v2 烘焙後，Poly Haven 大盆栽的盆子變成 cr_vc.001（和 cr_vc 只差貼圖編號），材質數 12→13（tests/corner_glb_unit.js 第 1 項）。
做法：primitive 的 material 改指原本那一個、刪掉重複的、後面的編號往前補；只用在重複材質上的 texture／image 一起刪（bufferView 留著，glTF 允許）。"""
import json, re, struct, sys

p = sys.argv[1]
b = open(p, 'rb').read()
n = struct.unpack('<I', b[12:16])[0]
j = json.loads(b[20:20 + n])
rest = b[20 + n:]
M = j['materials']; names = [m['name'] for m in M]


def sig(m):
    m = json.loads(json.dumps(m)); m.pop('name', None)
    for k in ('normalTexture', 'occlusionTexture', 'emissiveTexture'): m.get(k, {}).pop('index', None)
    for k in ('baseColorTexture', 'metallicRoughnessTexture'): m.get('pbrMetallicRoughness', {}).get(k, {}).pop('index', None)
    return json.dumps(m, sort_keys=True)


def texidx(m):
    out = [m.get(k, {}).get('index') for k in ('normalTexture', 'occlusionTexture', 'emissiveTexture')]
    out += [m.get('pbrMetallicRoughness', {}).get(k, {}).get('index') for k in ('baseColorTexture', 'metallicRoughnessTexture')]
    return [t for t in out if t is not None]


drop = {}
for i, nm in enumerate(names):
    g = re.match(r'^(.*)\.\d{3}$', nm)
    if g and g.group(1) in names:
        k = names.index(g.group(1))
        if sig(M[i]) == sig(M[k]): drop[i] = k
if not drop: print('沒有可併的重複材質'); sys.exit(0)
keep = [i for i in range(len(M)) if i not in drop]; newi = {o: n for n, o in enumerate(keep)}
for me in j['meshes']:
    for pr in me['primitives']:
        if 'material' in pr: pr['material'] = newi[drop.get(pr['material'], pr['material'])]
deadtex = set(t for i in drop for t in texidx(M[i])) - set(t for i in keep for t in texidx(M[i]))
j['materials'] = [M[i] for i in keep]
if deadtex:
    T = j['textures']; tkeep = [i for i in range(len(T)) if i not in deadtex]; tnew = {o: n for n, o in enumerate(tkeep)}
    for m in j['materials']:
        for k in ('normalTexture', 'occlusionTexture', 'emissiveTexture'):
            if k in m: m[k]['index'] = tnew[m[k]['index']]
        pb = m.get('pbrMetallicRoughness', {})
        for k in ('baseColorTexture', 'metallicRoughnessTexture'):
            if k in pb: pb[k]['index'] = tnew[pb[k]['index']]
    def srcs(t): return [t['source']] if 'source' in t else [e['source'] for e in t.get('extensions', {}).values() if 'source' in e]
    deadimg = set(s for i in deadtex for s in srcs(T[i])) - set(s for i in tkeep for s in srcs(T[i]))
    j['textures'] = [T[i] for i in tkeep]
    if deadimg:
        I = j['images']; ikeep = [i for i in range(len(I)) if i not in deadimg]; inew = {o: n for n, o in enumerate(ikeep)}
        for t in j['textures']:
            if 'source' in t: t['source'] = inew[t['source']]
            for e in t.get('extensions', {}).values():
                if 'source' in e: e['source'] = inew[e['source']]
        j['images'] = [I[i] for i in ikeep]
js = json.dumps(j, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
out = b[:12] + struct.pack('<I', len(js)) + b'JSON' + js + rest
out = out[:8] + struct.pack('<I', len(out)) + out[12:]
open(p, 'wb').write(out)
print('併了', {names[i]: names[k] for i, k in drop.items()}, '材質', len(M), '→', len(j['materials']), '；刪掉貼圖', len(deadtex))
