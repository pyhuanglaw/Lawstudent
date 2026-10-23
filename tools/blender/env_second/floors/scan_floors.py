"""掃描 GLB 的地板材質：大片、水平、靠近各樓層地面的網格用的材質，算底色貼圖×底色係數的平均顏色（sRGB），標出「木頭色而且深」的。
用法：python3 scan_floors.py <資料夾或 glb>... --json out.json"""
import sys, os, json, struct, io, math
import numpy as np
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]; OUTJ = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
if OUTJ in args: args.remove(OUTJ)
def glbs(paths):
    for p in paths:
        if os.path.isdir(p):
            for r, _, fs in os.walk(p):
                for f in sorted(fs):
                    if f.endswith('.glb'): yield os.path.join(r, f)
        elif p.endswith('.glb'): yield p
def load(p):
    b = open(p, 'rb').read(); n = struct.unpack_from('<I', b, 12)[0]; j = json.loads(b[20:20 + n]); bin_ = None
    o = 20 + n
    if o < len(b): ln = struct.unpack_from('<I', b, o)[0]; bin_ = b[o + 8:o + 8 + ln]
    return j, bin_
def trs(nd):
    if 'matrix' in nd: return np.array(nd['matrix'], float).reshape(4, 4).T
    t = nd.get('translation', [0, 0, 0]); r = nd.get('rotation', [0, 0, 0, 1]); s = nd.get('scale', [1, 1, 1])
    x, y, z, w = r; R = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    M = np.eye(4); M[:3, :3] = R * np.array(s); M[:3, 3] = t; return M
def s2l(c): c = c / 255.0; return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def l2s(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, None), 1 / 2.4) - 0.055) * 255
res = []
for p in glbs(args):
    try: j, bn = load(p)
    except Exception as e: print('ERR', p, e); continue
    mats = j.get('materials', []); imgs = j.get('images', []); texs = j.get('textures', []); bvs = j.get('bufferViews', []); acc = j.get('accessors', [])
    imgcache = {}
    def img_mean(ti):
        src = texs[ti].get('source')
        if src is None:
            ext = texs[ti].get('extensions', {}); src = next((v.get('source') for v in ext.values() if 'source' in v), None)
        if src is None: return None
        if src in imgcache: return imgcache[src]
        im = imgs[src]
        if 'bufferView' not in im: imgcache[src] = None; return None
        bv = bvs[im['bufferView']]; data = bn[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
        try:
            I = Image.open(io.BytesIO(data)).convert('RGB'); I.thumbnail((128, 128)); a = np.asarray(I, float).reshape(-1, 3)
            imgcache[src] = s2l(a).mean(0)   # 線性平均
        except Exception: imgcache[src] = None
        return imgcache[src]
    # 每個材質：水平大片網格的面積（世界座標）
    flat = {}
    def walk(ni, M):
        nd = j['nodes'][ni]; W = M @ trs(nd)
        if 'mesh' in nd:
            for pr in j['meshes'][nd['mesh']]['primitives']:
                a = acc[pr['attributes']['POSITION']]
                if 'min' not in a: continue
                mn, mx = np.array(a['min']), np.array(a['max'])
                cs = np.array([[x, y, z, 1] for x in (mn[0], mx[0]) for y in (mn[1], mx[1]) for z in (mn[2], mx[2])]) @ W.T
                lo, hi = cs[:, :3].min(0), cs[:, :3].max(0); sz = hi - lo
                if sz[1] < 0.12 and sz[0] * sz[2] > 1.5:   # 水平、夠大
                    k = pr.get('material', -1); f = flat.setdefault(k, [0.0, []]); f[0] += sz[0] * sz[2]; f[1].append(round(float(hi[1]), 2))
        for c in nd.get('children', []): walk(c, W)
    for sc in j.get('scenes', [{}])[:1]:
        for ni in sc.get('nodes', []): walk(ni, np.eye(4))
    for k, (area, ys) in flat.items():
        m = mats[k] if 0 <= k < len(mats) else {'name': '(default)'}
        pbr = m.get('pbrMetallicRoughness', {}); fac = np.array(pbr.get('baseColorFactor', [1, 1, 1, 1])[:3])
        lin = fac.copy(); tex = 'baseColorTexture' in pbr
        if tex:
            mm = img_mean(pbr['baseColorTexture']['index'])
            if mm is not None: lin = lin * mm
        srgb = l2s(lin); r, g, b = srgb; lum = 0.299 * r + 0.587 * g + 0.114 * b
        brown = r > g > b and (r - b) > 25
        name = m.get('name', '')
        woodname = any(w in name.lower() for w in ('wood', 'parquet', 'plank', 'oak', 'walnut', 'deck', 'laminate', 'timber', 'teak', 'floor'))
        res.append(dict(file=os.path.relpath(p), mat=name, area=round(area, 1), ys=sorted(set(ys))[:6], rgb=[int(round(x)) for x in srgb], lum=round(float(lum), 1), tex=tex, brown=bool(brown), woodname=woodname,
                        dark_wood=bool(brown and lum < 150)))
res.sort(key=lambda r: (not r['dark_wood'], r['lum']))
for r in res:
    if r['brown']: print(('DARK ' if r['dark_wood'] else '     '), r['lum'], r['rgb'], r['area'], r['file'], r['mat'], r['ys'])
if OUTJ: json.dump(res, open(OUTJ, 'w'), ensure_ascii=False, indent=1)
