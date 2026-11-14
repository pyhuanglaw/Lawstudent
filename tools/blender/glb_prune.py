#!/usr/bin/env python3
"""glb_prune.py — 從 GLB／VRM(0.x) 拿掉指定節點（連同子節點），並把再也沒人用的
mesh、skin、material、texture、image、accessor、bufferView 一起清掉、重新編號、重寫 buffer。
用法：python3 tools/blender/glb_prune.py 輸入.glb 輸出.glb 節點名 [節點名 ...]
只拿掉「葉子」型的東西：要拿掉的節點若被骨架、VRM 人形骨、彈簧骨引用，直接報錯不寫檔。"""
import json, struct, sys

def read_glb(p):
    b = open(p, 'rb').read()
    assert b[:4] == b'glTF'
    off = 12; js = None; bin_ = b''
    while off < len(b):
        ln, ty = struct.unpack('<II', b[off:off+8]); ch = b[off+8:off+8+ln]
        if ty == 0x4E4F534A: js = json.loads(ch)
        elif ty == 0x004E4942: bin_ = ch
        off += 8 + ln
    return js, bin_

def write_glb(p, j, bin_):
    js = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    bin_ += b'\0' * ((4 - len(bin_) % 4) % 4)
    total = 12 + 8 + len(js) + (8 + len(bin_) if bin_ else 0)
    out = struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js
    if bin_: out += struct.pack('<II', len(bin_), 0x004E4942) + bin_
    open(p, 'wb').write(out)

def remap_list(lst, keep):
    """keep: 舊 index -> 新 index（不在表內＝刪掉）"""
    return [keep[i] for i in lst if i in keep]

def prune(j, bin_, names):
    N = j['nodes']
    kill = set()
    stack = [i for i, n in enumerate(N) if n.get('name') in names]
    found = {N[i]['name'] for i in stack}
    miss = set(names) - found
    if miss: raise SystemExit('找不到節點：%s' % sorted(miss))
    while stack:
        i = stack.pop(); kill.add(i); stack += N[i].get('children', [])
    # 被骨架或 VRM 引用的節點不准拿
    for s in j.get('skins', []):
        if kill & set(s['joints']) or s.get('skeleton') in kill: raise SystemExit('要拿掉的節點是骨架的一部分')
    V = j.get('extensions', {}).get('VRM')
    if V:
        for hb in V.get('humanoid', {}).get('humanBones', []):
            if hb.get('node') in kill: raise SystemExit('要拿掉的節點是人形骨')
        sa = V.get('secondaryAnimation', {})
        for g in sa.get('boneGroups', []):
            if kill & set(g.get('bones', [])) or g.get('center') in kill: raise SystemExit('要拿掉的節點是彈簧骨')
        for cg in sa.get('colliderGroups', []):
            if cg.get('node') in kill: raise SystemExit('要拿掉的節點是碰撞群組')
    for a in j.get('animations', []):
        a['channels'] = [c for c in a['channels'] if c.get('target', {}).get('node') not in kill]
    nk = {o: n for n, o in enumerate(i for i in range(len(N)) if i not in kill)}
    j['nodes'] = [N[i] for i in range(len(N)) if i not in kill]
    for n in j['nodes']:
        if 'children' in n:
            n['children'] = remap_list(n['children'], nk)
            if not n['children']: del n['children']
    for sc in j.get('scenes', []): sc['nodes'] = remap_list(sc.get('nodes', []), nk)
    for s in j.get('skins', []):
        s['joints'] = remap_list(s['joints'], nk)
        if 'skeleton' in s: s['skeleton'] = nk[s['skeleton']]
    for a in j.get('animations', []):
        for c in a['channels']: c['target']['node'] = nk[c['target']['node']]
    if V:
        for hb in V.get('humanoid', {}).get('humanBones', []): hb['node'] = nk[hb['node']]
        fp = V.get('firstPerson', {})
        if 'firstPersonBone' in fp and fp['firstPersonBone'] >= 0: fp['firstPersonBone'] = nk[fp['firstPersonBone']]
        sa = V.get('secondaryAnimation', {})
        for g in sa.get('boneGroups', []):
            g['bones'] = remap_list(g.get('bones', []), nk)
            if g.get('center', -1) >= 0: g['center'] = nk[g['center']]
        for cg in sa.get('colliderGroups', []): cg['node'] = nk[cg['node']]

    # mesh
    used = {n['mesh'] for n in j['nodes'] if 'mesh' in n}
    mk = {o: n for n, o in enumerate(sorted(used))}
    j['meshes'] = [j['meshes'][o] for o in sorted(used)]
    for n in j['nodes']:
        if 'mesh' in n: n['mesh'] = mk[n['mesh']]
    if V:
        fp = V.get('firstPerson', {})
        fp['meshAnnotations'] = [dict(a, mesh=mk[a['mesh']]) for a in fp.get('meshAnnotations', []) if a.get('mesh') in mk]
        for g in V.get('blendShapeMaster', {}).get('blendShapeGroups', []):
            g['binds'] = [dict(b, mesh=mk[b['mesh']]) for b in g.get('binds', []) if b.get('mesh') in mk]
    # skin
    used = {n['skin'] for n in j['nodes'] if 'skin' in n}
    if 'skins' in j:
        sk = {o: n for n, o in enumerate(sorted(used))}
        j['skins'] = [j['skins'][o] for o in sorted(used)]
        for n in j['nodes']:
            if 'skin' in n: n['skin'] = sk[n['skin']]
        if not j['skins']: del j['skins']
    # material
    used = {p['material'] for m in j['meshes'] for p in m['primitives'] if 'material' in p}
    if 'materials' in j:
        old = j['materials']
        mt = {o: n for n, o in enumerate(sorted(used))}
        killnames = {old[i].get('name') for i in range(len(old)) if i not in mt}
        j['materials'] = [old[o] for o in sorted(used)]
        for m in j['meshes']:
            for p in m['primitives']:
                if 'material' in p: p['material'] = mt[p['material']]
        if V and 'materialProperties' in V:
            mp = V['materialProperties']
            if len(mp) == len(old):
                V['materialProperties'] = [mp[o] for o in sorted(used)]
            else:
                V['materialProperties'] = [x for x in mp if x.get('name') not in killnames]
            for g in V.get('blendShapeMaster', {}).get('blendShapeGroups', []):
                g['materialValues'] = [x for x in g.get('materialValues', []) if x.get('materialName') not in killnames]
    # texture
    tex_refs = []   # (dict, key)
    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if isinstance(v, dict) and 'index' in v and k.lower().endswith('texture'): tex_refs.append((v, 'index'))
                walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(j.get('materials', []))
    if V:
        for mp in V.get('materialProperties', []):
            tp = mp.get('textureProperties', {})
            for k in list(tp.keys()): tex_refs.append((tp, k))
        if V.get('meta', {}).get('texture', -1) >= 0: tex_refs.append((V['meta'], 'texture'))
    if 'textures' in j:
        used = {d[k] for d, k in tex_refs}
        tk = {o: n for n, o in enumerate(sorted(used))}
        j['textures'] = [j['textures'][o] for o in sorted(used)]
        for d, k in tex_refs: d[k] = tk[d[k]]
    # image
    img_refs = []
    for t in j.get('textures', []):
        if 'source' in t: img_refs.append((t, 'source'))
        for e in t.get('extensions', {}).values():
            if isinstance(e, dict) and 'source' in e: img_refs.append((e, 'source'))
    if 'images' in j:
        used = {d[k] for d, k in img_refs}
        ik = {o: n for n, o in enumerate(sorted(used))}
        j['images'] = [j['images'][o] for o in sorted(used)]
        for d, k in img_refs: d[k] = ik[d[k]]
    # sampler（沒人用就留著，不影響）
    # accessor
    acc_refs = []
    for m in j['meshes']:
        for p in m['primitives']:
            for k in p['attributes']: acc_refs.append((p['attributes'], k))
            if 'indices' in p: acc_refs.append((p, 'indices'))
            for t in p.get('targets', []):
                for k in t: acc_refs.append((t, k))
    for s in j.get('skins', []):
        if 'inverseBindMatrices' in s: acc_refs.append((s, 'inverseBindMatrices'))
    for a in j.get('animations', []):
        used_s = sorted({c['sampler'] for c in a['channels']})
        sk2 = {o: n for n, o in enumerate(used_s)}
        a['samplers'] = [a['samplers'][o] for o in used_s]
        for c in a['channels']: c['sampler'] = sk2[c['sampler']]
        for s in a['samplers']: acc_refs += [(s, 'input'), (s, 'output')]
    if 'animations' in j:
        j['animations'] = [a for a in j['animations'] if a['channels']]
        if not j['animations']: del j['animations']
    used = {d[k] for d, k in acc_refs}
    ak = {o: n for n, o in enumerate(sorted(used))}
    j['accessors'] = [j['accessors'][o] for o in sorted(used)]
    for d, k in acc_refs: d[k] = ak[d[k]]
    # bufferView：重寫 buffer
    bv_refs = []
    for a in j['accessors']:
        if 'bufferView' in a: bv_refs.append((a, 'bufferView'))
        sp = a.get('sparse')
        if sp: bv_refs += [(sp['indices'], 'bufferView'), (sp['values'], 'bufferView')]
    for im in j.get('images', []):
        if 'bufferView' in im: bv_refs.append((im, 'bufferView'))
    used = sorted({d[k] for d, k in bv_refs})
    assert all(j['bufferViews'][o].get('buffer', 0) == 0 for o in used), '只處理單一 buffer 的 GLB'
    nb = bytearray(); bk = {}; views = []
    for n, o in enumerate(used):
        v = dict(j['bufferViews'][o]); st = v.get('byteOffset', 0)
        while len(nb) % 4: nb.append(0)
        chunk = bin_[st:st+v['byteLength']]
        v['byteOffset'] = len(nb); nb += chunk; views.append(v); bk[o] = n
    while len(nb) % 4: nb.append(0)
    j['bufferViews'] = views
    for d, k in bv_refs: d[k] = bk[d[k]]
    j['buffers'] = [dict(j['buffers'][0], byteLength=len(nb))]
    return j, bytes(nb)

if __name__ == '__main__':
    src, dst, *names = sys.argv[1:]
    j, b = read_glb(src)
    j, b = prune(j, b, set(names))
    write_glb(dst, j, b)
    print('ok', dst, 'nodes', len(j['nodes']), 'meshes', len(j['meshes']), 'materials', len(j.get('materials', [])), 'images', len(j.get('images', [])), 'bin', len(b))
