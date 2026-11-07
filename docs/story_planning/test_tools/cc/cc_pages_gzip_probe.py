"""CC-B（帳號 B）11-07：PAGES-GZIP（LAWWW2-B 11:19）——GitHub Pages 會不會把 .glb 壓縮傳（雲端代理擋 github.io，要在使用者電腦跑）。
對每個網址送兩次 GET（Accept-Encoding: gzip, br／identity），只讀標頭和實際傳了幾個 bytes，印 Content-Type、Content-Encoding、Content-Length、Cache-Control、ETag、實收 bytes。
不開瀏覽器、不改遊戲。用法：python3 cc_pages_gzip_probe.py <url（不用）> <out>；URLS 環境變數可以換網址（逗號分隔）"""
import os, sys, json, urllib.request

OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
BASE = 'https://pyhuanglaw.github.io/Lawstudent/'
URLS = [u for u in (os.environ.get('URLS') or ','.join(BASE + p for p in (
    'assets/models/env/second_ai/wenzhou_street.glb', 'assets/models/env/second_ai/wz_park.glb', 'index.html'))).split(',') if u]
rows = []; fails = 0
for u in URLS:
    for enc in ('gzip, br', 'identity'):
        req = urllib.request.Request(u, headers={'Accept-Encoding': enc, 'User-Agent': 'cc-pages-gzip-probe'})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                h = {k: r.headers.get(k) for k in ('Content-Type', 'Content-Encoding', 'Content-Length', 'Cache-Control', 'ETag', 'Vary', 'Age', 'X-Cache')}
                n = 0
                while True:
                    b = r.read(1 << 16)
                    if not b: break
                    n += len(b)
                row = {'url': u, 'acceptEncoding': enc, 'status': r.status, 'headers': h, 'bytesOnWire': n}
        except Exception as ex:
            row = {'url': u, 'acceptEncoding': enc, 'err': repr(ex)[:200]}; fails += 1
        rows.append(row); print(json.dumps(row, ensure_ascii=False), flush=True)
os.makedirs(OUT, exist_ok=True)
json.dump(rows, open(os.path.join(OUT, 'pages_gzip.json'), 'w'), ensure_ascii=False, indent=1)
print('ALL PASS' if not fails else 'FAILED %d' % fails, flush=True)
