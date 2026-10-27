"""建築 GLB 的重複貼圖盤點（離線）：每張圖的原始位元組 SHA-1、尺寸、哪些 GLB／材質／網格用到。
用法：python3 glb_dups.py 工作樹 輸出.json"""
import json, struct, hashlib, sys, os, re, collections, subprocess
ROOT, OUT = sys.argv[1], sys.argv[2]
man = subprocess.check_output(['node', '-e', r"""
global.window=global; global.location={search:''}; global.navigator={userAgent:'node'};
const fs=require('fs'); let s=fs.readFileSync('src/assets3d.js','utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1=');
global.THREE={}; global.THREE_JSM={}; require('vm').runInThisContext(s);
const o={}; for(const k in ASSETS.manifest){ const m=ASSETS.manifest[k]; if(m.type==='building') o[k]=m.url; } process.stdout.write(JSON.stringify(o));"""], cwd=ROOT)
man = json.loads(man)
def pngsize(b):
    if b[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', b[16:24])
    if b[:2] == b'\xff\xd8':
        i = 2
        while i < len(b):
            if b[i] != 0xFF: i += 1; continue
            mk = b[i+1]; ln = struct.unpack('>H', b[i+2:i+4])[0]
            if mk in (0xC0, 0xC1, 0xC2): h, w = struct.unpack('>HH', b[i+5:i+9]); return (w, h)
            i += 2 + ln
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        if b[12:16] == b'VP8 ': w, h = struct.unpack('<HH', b[26:30]); return (w & 0x3fff, h & 0x3fff)
        if b[12:16] == b'VP8L': v = struct.unpack('<I', b[21:25])[0]; return ((v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1)
        if b[12:16] == b'VP8X': return (1 + int.from_bytes(b[24:27], 'little'), 1 + int.from_bytes(b[27:30], 'little'))
    return (0, 0)
imgs = collections.defaultdict(lambda: {'bytes': 0, 'size': None, 'uses': []})
per = {}
for key, url in sorted(man.items()):
    p = os.path.join(ROOT, url)
    if not os.path.exists(p): continue
    b = open(p, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20+jl]); off = 20 + jl
    binb = b[off+8:off+8+struct.unpack('<I', b[off:off+4])[0]] if len(b) > off else b''
    meshes_by_mat = collections.defaultdict(set)
    for n in J.get('nodes', []):
        if 'mesh' in n:
            for pr in J['meshes'][n['mesh']]['primitives']:
                if 'material' in pr: meshes_by_mat[pr['material']].add(n.get('name', ''))
    tex_uses = collections.defaultdict(list)
    for mi, m in enumerate(J.get('materials', [])):
        def walk(o, path):
            if isinstance(o, dict):
                if 'index' in o and path.endswith('Texture'): tex_uses[o['index']].append((m.get('name', ''), path, sorted(meshes_by_mat[mi])[:3]))
                for k, v in o.items(): walk(v, path + '.' + k if path else k)
            elif isinstance(o, list):
                for v in o: walk(v, path)
        walk(m, '')
    n = 0
    for ti, t in enumerate(J.get('textures', [])):
        src = t.get('source', t.get('extensions', {}).get('EXT_texture_webp', {}).get('source'))
        if src is None: continue
        im = J['images'][src]
        if 'bufferView' not in im: continue
        bv = J['bufferViews'][im['bufferView']]; data = binb[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
        h = hashlib.sha1(data).hexdigest(); smp = J['samplers'][t['sampler']] if 'sampler' in t and J.get('samplers') else {}
        rec = imgs[h]; rec['bytes'] = len(data); rec['size'] = pngsize(data)
        for (mn, path, ms) in tex_uses[ti]: rec['uses'].append({'glb': key, 'mat': mn, 'slot': path, 'meshes': ms, 'sampler': smp})
        n += 1
    per[key] = n
dups = {h: r for h, r in imgs.items() if len({u['glb'] for u in r['uses']}) > 1}
tot_tex = sum(len({(u['glb']) for u in r['uses']}) for r in imgs.values())
saved_px = sum((len({u['glb'] for u in r['uses']}) - 1) * (r['size'][0] * r['size'][1]) for r in dups.values())
saved_b = sum((len({u['glb'] for u in r['uses']}) - 1) * r['bytes'] for r in dups.values())
print('GLB', len(per), '（貼圖 GLB×圖）', tot_tex, '不同的圖', len(imgs), '跨 GLB 重複的圖', len(dups), '可省 GLB×圖', sum(len({u['glb'] for u in r['uses']}) - 1 for r in dups.values()), '百萬像素', round(saved_px / 1e6, 1), '壓縮後 MB', round(saved_b / 1e6, 1))
road = [(h, r) for h, r in imgs.items() if any(re.match(r'^(wz_road|l118_road_)', m) for u in r['uses'] for m in u['meshes'])]
for h, r in road:
    other = [u for u in r['uses'] if not any(re.match(r'^(wz_road|l118_road_)', m) for m in u['meshes'])]
    print('road img', h[:8], r['size'], 'used by', len(r['uses']), 'non-road uses:', [(u['glb'], u['mat'], u['meshes'][:2]) for u in other][:6])
json.dump({'per': per, 'dups': {h: {'size': r['size'], 'bytes': r['bytes'], 'glbs': sorted({u['glb'] for u in r['uses']}), 'uses': r['uses'][:12]} for h, r in sorted(dups.items(), key=lambda kv: -len(kv[1]['uses']))}}, open(OUT, 'w'), ensure_ascii=False, indent=1)
