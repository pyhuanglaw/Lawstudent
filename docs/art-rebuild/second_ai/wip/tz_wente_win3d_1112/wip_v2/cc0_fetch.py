"""CC0 素材下載（SHOP-REALISM-1112；LAWWW2-C 2026-11-12）：Poly Haven 掃描模型、ambientCG 材質組。
使用者 11-12：「所有店面都是方塊…什麼都是塑膠方塊」→ 店內道具改用真的掃描模型、材質用整組貼圖（研究：docs/art-rebuild/second_ai/research/SHOP_REALISM_1112.md）。
下載到快取（預設 ~/.cache/lawstudent_cc0，可用環境變數 CC0_CACHE 改），不進 repo：遊戲用的是烘焙後的成品 GLB。
  ph_model(id, res='1k') → 那個模型的 .gltf 路徑（連同貼圖、.bin）
  acg_material(id, res='1K') → {'color':…, 'normal':…, 'rough':…, 'ao':…}（有哪張就給哪張）
授權：兩邊都是 CC0；用到的每一件在 LICENSES.md 登記（作者照 Poly Haven API 的 authors）。
"""
import os, json, urllib.request, zipfile, io

CACHE = os.environ.get('CC0_CACHE', os.path.expanduser('~/.cache/lawstudent_cc0'))
UA = {'User-Agent': 'lawstudent-asset-fetch/1.0'}

def _get(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r: return r.read()

def ph_info(aid):
    return json.loads(_get('https://api.polyhaven.com/info/' + aid))

def ph_model(aid, res='1k'):
    d = os.path.join(CACHE, 'polyhaven', aid, res); os.makedirs(d, exist_ok=True)
    meta = os.path.join(d, 'files.json')
    if not os.path.exists(meta):
        files = json.loads(_get('https://api.polyhaven.com/files/' + aid)); open(meta, 'w').write(json.dumps(files))
    files = json.load(open(meta)); fmt = 'gltf' if 'gltf' in files else 'blend'   # 少數模型只有 .blend
    g = files[fmt][res][fmt]
    main = os.path.join(d, os.path.basename(g['url']))
    if not os.path.exists(main): open(main, 'wb').write(_get(g['url']))
    for rel, f in g.get('include', {}).items():
        p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        if not os.path.exists(p) or os.path.getsize(p) != f.get('size', -1): open(p, 'wb').write(_get(f['url']))
    info = os.path.join(d, 'info.json')
    if not os.path.exists(info): open(info, 'w').write(json.dumps(ph_info(aid)))
    return main

def acg_material(aid, res='1K'):
    d = os.path.join(CACHE, 'ambientcg', aid + '_' + res); os.makedirs(d, exist_ok=True)
    if not any(n.lower().endswith(('.jpg', '.png')) for n in os.listdir(d)):
        z = zipfile.ZipFile(io.BytesIO(_get('https://ambientcg.com/get?file=%s_%s-JPG.zip' % (aid, res), timeout=120))); z.extractall(d)
    out = {}
    for n in os.listdir(d):
        l = n.lower()
        if 'color' in l: out['color'] = os.path.join(d, n)
        elif 'normalgl' in l: out['normal'] = os.path.join(d, n)
        elif 'roughness' in l: out['rough'] = os.path.join(d, n)
        elif 'ambientocclusion' in l: out['ao'] = os.path.join(d, n)
        elif 'displacement' in l: out['disp'] = os.path.join(d, n)
    return out

if __name__ == '__main__':
    import sys
    for a in sys.argv[1:]:
        print(a, acg_material(a[4:]) if a.startswith('acg:') else ph_model(a))
