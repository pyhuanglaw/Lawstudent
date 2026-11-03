"""CC（帳號 A）11-03：線上版的快取版本號（BB 21:06：v9.10.19 上 main e1603907e，PR #26 把 309 個 ?v= 補成 9.10.19）。
  tests/deploy_check.py 只看 script 有沒有帶 ?v=，不看是哪一版；這支看「載進來的每一個 ?v= 都是 WANT、沒有舊版」。
  檢查：
    ① 標題畫面的版本字樣＝VER（預設「版本 v9.10.19（2026-11-03）」）
    ② index.html 裡每一個 <script src> 都帶 ?v=WANT（預設 9.10.19）
    ③ 遊戲載完以後，瀏覽器實際載入的所有資源（performance 的 resource 紀錄）裡，帶 ?v= 的都是 WANT；沒有任何 ?v=OLD（預設 9.10.18）
    ④ 沒有 4xx／5xx（Pages 部署到一半會 503：遇到就等 2 分鐘重跑，探針自己重試一次）
用法：python3 cc_live_ver_probe.py <url> <out>   環境變數 WANT、OLD、VER"""
import os, re, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = os.environ.get('LIVE_URL') or sys.argv[1], sys.argv[2]   # LIVE_URL：PC 佇列的 probe 只拿得到本機網址，線上版用這個蓋過去
WANT = os.environ.get('WANT', '9.10.19'); OLD = os.environ.get('OLD', '9.10.18'); VER = os.environ.get('VER', '版本 v9.10.19（2026-11-03）')
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


async def once(p):
    bad = []
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('response', lambda r: bad.append([r.status, r.url]) if r.status >= 400 else None)
    await pg.goto(URL); ok = await L.wait_loaded(pg)
    await pg.wait_for_timeout(4000)
    info = await pg.evaluate("""(()=>{ const v=document.getElementById('verLabel'); const ss=[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean);
      const res=performance.getEntriesByType('resource').map(e=>e.name); return {ver:v?v.textContent.trim():null, scripts:ss, res}; })()""")
    await pg.screenshot(path=os.path.join(OUT, 'title.png'))
    await b.close()
    return ok, info, bad, errs


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        ok, info, bad, errs = await once(p)
        if any(s >= 500 for s, _ in bad):
            print('  遇到 5xx（Pages 可能還在部署）：等 120 秒重跑一次  %s' % J(bad[:3]), flush=True)
            await asyncio.sleep(120); ok, info, bad, errs = await once(p)
        check('遊戲載入', ok)
        check('① 標題的版本字樣＝「%s」' % VER, info['ver'] == VER, str(info['ver']))
        sv = [(s, (re.search(r'[?&]v=([^&#]+)', s) or [None, None])[1]) for s in info['scripts']]
        badsv = [s for s, v in sv if v != WANT]
        check('② %d 個 <script src> 都是 ?v=%s' % (len(sv), WANT), bool(sv) and not badsv, J(badsv[:6]))
        rv = [(u, (re.search(r'[?&]v=([^&#]+)', u) or [None, None])[1]) for u in info['res']]
        withv = [x for x in rv if x[1]]; other = [u for u, v in withv if v != WANT]; old = [u for u, v in withv if v == OLD]
        print('  實際載入的資源 %d 個，帶 ?v= 的 %d 個' % (len(rv), len(withv)), flush=True)
        check('③ 實際載入、帶 ?v= 的資源都是 %s（%d 個），沒有 %s' % (WANT, len(withv), OLD), bool(withv) and not other, J({'not_want': other[:6], 'old': old[:6]}))
        check('④ 沒有 4xx／5xx', not bad, J(bad[:6]))
        check('沒有 JS 例外', not errs, J(errs[:3]))
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS[:6])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
