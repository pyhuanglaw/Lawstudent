"""CC-C（帳號 C）11-04：FETCH_FRESHMAN_HOUSE（LAWWW-C 14:12 轉使用者 14:07：「超多的 內裝也有」——自己去 https://osa_dorm.ntu.edu.tw/Freshman_House 抓大一女舍外觀和內裝照片；
  雲端 proxy 擋這個網域，改用使用者電腦抓）。**這不是測試、不判定**：只抓圖當美術參考（ART-PHOTO-CMP-1021），不跟外部連結、不登入、不填表。
  1. Playwright 開網址（TARGET，預設上面那個），慢慢捲到底讓延遲載入的圖出來，等圖片載完；
  2. 存整頁截圖（page_full.jpg）、HTML（page.html）、文字（page.txt：設施、樓層說明）；
  3. 頁面上的 img（含 srcset 最大的那張）、CSS 背景圖、指向圖片檔的連結（相簿、放大圖）——**只抓同一個網站**（主機名稱一樣）、寬 300 px 以上（img 看 naturalWidth；連結和背景圖沒有尺寸就先抓）；
     檔名「序號_alt 或附近標題」；總量上限 MAX_MB（預設 60 MB），超過的只記在清單不下載；
  4. 清單 list.json／list.md（檔名、原網址、alt／標題、寬高、來源 img／bg／link）。
  注意：這些是網站的照片，只當參考，不能放進遊戲（LICENSES.md 只收 CC0／MIT／明確允許的素材）。
用法：python3 cc_fetch_site_probe.py <url（不用，runner 給的遊戲網址）> <out>"""
import os, sys, json, asyncio, re, time
from urllib.parse import urljoin, urlparse
from playwright.async_api import async_playwright

OUT = sys.argv[2] if len(sys.argv) > 2 else sys.argv[1]
TARGET = os.environ.get('TARGET') or 'https://osa_dorm.ntu.edu.tw/Freshman_House'
MAX_MB = float(os.environ.get('MAX_MB') or 60)
MIN_W = int(os.environ.get('MIN_W') or 300)
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


COLLECT_JS = r"""(()=>{ const out=[]; const near=el=>{ let t=''; for(let e=el, i=0; e&&i<4&&!t; e=e.parentElement, i++){ const h=e.querySelector&&e.querySelector('h1,h2,h3,h4,figcaption,.title,.caption'); if(h) t=(h.textContent||'').trim(); if(!t&&e.getAttribute) t=(e.getAttribute('title')||'').trim(); } return t.slice(0,40); };
  for(const im of document.images){ let src=im.currentSrc||im.src; if(im.srcset){ const c=im.srcset.split(',').map(s=>s.trim().split(/\s+/)).filter(a=>a[0]); c.sort((a,b)=>parseInt(b[1]||'0')-parseInt(a[1]||'0')); if(c[0]) src=c[0][0]; }
    out.push({kind:'img', url:src, alt:(im.alt||'').trim().slice(0,60), title:near(im), w:im.naturalWidth, h:im.naturalHeight}); }
  for(const el of document.querySelectorAll('*')){ const bg=getComputedStyle(el).backgroundImage; if(bg&&bg!=='none'){ const m=[...bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)]; for(const q of m) out.push({kind:'bg', url:q[1], alt:'', title:near(el), w:el.clientWidth, h:el.clientHeight}); } }
  for(const a of document.querySelectorAll('a[href]')){ if(/\.(jpe?g|png|webp|gif)(\?|$)/i.test(a.getAttribute('href')||'')) out.push({kind:'link', url:a.href, alt:(a.getAttribute('title')||a.textContent||'').trim().slice(0,60), title:near(a), w:null, h:null}); }
  return {items:out, title:document.title, text:(document.body&&document.body.innerText||'').slice(0,200000)}; })()"""


def safe(s):
    s = re.sub(r'[\\/:*?"<>|\s]+', '_', (s or '').strip())[:40]
    return s.strip('_') or 'img'


async def main():
    os.makedirs(OUT, exist_ok=True); idir = os.path.join(OUT, 'images'); os.makedirs(idir, exist_ok=True)
    print('CC FETCH_FRESHMAN_HOUSE：%s（只抓同一個網站的圖；不是測試）' % TARGET, flush=True)
    host = urlparse(TARGET).hostname
    rows = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1366, 'height': 900}, locale='zh-TW')
        pg = await ctx.new_page()
        try:
            r = await pg.goto(TARGET, wait_until='domcontentloaded', timeout=60000)
            check('開得了網頁（HTTP %s）' % (r.status if r else '?'), bool(r) and r.ok, pg.url)
        except Exception as e:
            check('開得了網頁', False, repr(e)[:300]); await b.close(); print('FAILED 1', flush=True); sys.exit(1)
        for _ in range(40):   # 慢慢捲到底，延遲載入的圖出來
            done = await pg.evaluate("(()=>{ window.scrollBy(0, innerHeight*0.8); return innerHeight+scrollY>=document.body.scrollHeight-4; })()")
            await pg.wait_for_timeout(500)
            if done: break
        try: await pg.wait_for_load_state('networkidle', timeout=20000)
        except Exception: pass
        await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=os.path.join(OUT, 'page_full.jpg'), full_page=True, type='jpeg', quality=80)
        html = await pg.content()
        open(os.path.join(OUT, 'page.html'), 'w', encoding='utf-8').write(html)
        c = await pg.evaluate(COLLECT_JS)
        open(os.path.join(OUT, 'page.txt'), 'w', encoding='utf-8').write((c.get('title') or '') + '\n\n' + (c.get('text') or ''))
        print('  頁面標題：%s；找到候選 %d 個' % (c.get('title'), len(c['items'])), flush=True)
        seen = set(); total = 0; n = 0
        for it in c['items']:
            u = urljoin(pg.url, it['url'] or '')
            if not u or u.startswith('data:') or u in seen: continue
            seen.add(u)
            if urlparse(u).hostname != host: rows.append(dict(it, url=u, file=None, skip='別的網站')); continue
            if it['kind'] == 'img' and (it['w'] or 0) < MIN_W: rows.append(dict(it, url=u, file=None, skip='寬 %s < %d' % (it['w'], MIN_W))); continue
            if total > MAX_MB * 1048576: rows.append(dict(it, url=u, file=None, skip='超過總量 %d MB' % MAX_MB)); continue
            try:
                resp = await ctx.request.get(u, timeout=60000)
                if not resp.ok: rows.append(dict(it, url=u, file=None, skip='HTTP %s' % resp.status)); continue
                body = await resp.body(); ct = (resp.headers.get('content-type') or '').lower()
                if not ct.startswith('image/'): rows.append(dict(it, url=u, file=None, skip='不是圖片（%s）' % ct[:30])); continue
                ext = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif'}.get(ct.split(';')[0], os.path.splitext(urlparse(u).path)[1] or '.img')
                n += 1; fn = '%03d_%s%s' % (n, safe(it['alt'] or it['title'] or os.path.basename(urlparse(u).path)), ext)
                open(os.path.join(idir, fn), 'wb').write(body); total += len(body)
                rows.append(dict(it, url=u, file='images/' + fn, bytes=len(body)))
            except Exception as e:
                rows.append(dict(it, url=u, file=None, skip='下載失敗 %r' % (str(e)[:80],)))
        await b.close()
    got = [r for r in rows if r.get('file')]
    json.dump(rows, open(os.path.join(OUT, 'list.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, 'list.md'), 'w', encoding='utf-8') as fh:
        fh.write('# FETCH_FRESHMAN_HOUSE（%s）\n\n只當美術參考，不能放進遊戲。\n\n| 檔名 | 來源 | alt／標題 | 寬×高 | 原網址 |\n|---|---|---|---|---|\n' % TARGET)
        for r in rows:
            fh.write('| %s | %s | %s | %s×%s | %s |\n' % (r.get('file') or '（沒抓：%s）' % r.get('skip'), r['kind'], (r.get('alt') or r.get('title') or '').replace('|', '／'), r.get('w'), r.get('h'), r['url']))
    check('有抓到圖', bool(got), '%d 張、%.1f MB' % (len(got), total / 1048576))
    print('INFO 抓到 %d 張（%.1f MB），沒抓 %d 個（別的網站、太小、超量、失敗）' % (len(got), total / 1048576, len(rows) - len(got)), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
