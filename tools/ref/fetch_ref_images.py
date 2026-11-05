#!/usr/bin/env python3
"""把參考照片從原網站抓到本機（NTU-REF-AUDIT-1104）。

學校網站、別人網站的照片有著作權；這個 repo 是公開的、main 又直接當 GitHub Pages 網站，
所以 repo 只放每棟的 README（來源、事實、逐張說明）和 list.json（原圖網址），照片本身不 commit。
要看圖的人跑這支，照 list.json 抓到 ref_cache/（已在 .gitignore），長邊縮到 1600 px。

用法：python3 tools/ref/fetch_ref_images.py docs/story_planning/ref_images/buildings/freshman_women_dorm_1104/web [--out ref_cache]
list.json 格式：[{"file": "fwd_web_01.jpg", "url": "https://…", "page": "https://…", "caption": "…"}]
"""
import argparse, json, os, subprocess, sys, tempfile

ap = argparse.ArgumentParser()
ap.add_argument('folder')
ap.add_argument('--out', default='ref_cache')
ap.add_argument('--max', type=int, default=1600)
a = ap.parse_args()
items = json.load(open(os.path.join(a.folder, 'list.json'), encoding='utf-8'))
dst = os.path.join(a.out, os.path.relpath(a.folder, 'docs/story_planning/ref_images') if a.folder.startswith('docs/story_planning/ref_images') else os.path.basename(a.folder.rstrip('/')))
os.makedirs(dst, exist_ok=True)
try:
    from PIL import Image
except ImportError:
    Image = None
ok = bad = 0
for it in items:
    out = os.path.join(dst, it['file'])
    if os.path.exists(out):
        ok += 1
        continue
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, 'raw')
        r = subprocess.run(['curl', '-sSL', '--max-time', '90', '-o', raw, '-w', '%{http_code}', it['url']], capture_output=True, text=True)
        if r.stdout.strip() != '200' or not os.path.exists(raw) or os.path.getsize(raw) < 1000:
            print('抓不到', it['file'], it['url'], r.stdout.strip(), r.stderr.strip()[:120])
            bad += 1
            continue
        if Image:
            im = Image.open(raw).convert('RGB')
            s = min(1.0, a.max / max(im.size))
            if s < 1:
                im = im.resize((int(im.size[0] * s), int(im.size[1] * s)), Image.LANCZOS)
            im.save(out, quality=82, optimize=True)
        else:
            os.replace(raw, out)
        ok += 1
print(f'{dst}：{ok} 張好了、{bad} 張抓不到')
sys.exit(1 if bad else 0)
