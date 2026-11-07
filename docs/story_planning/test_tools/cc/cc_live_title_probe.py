"""CC-B（帳號 B）11-07：線上標題畫面版本字樣＋截圖（BB-B 03:38 RELEASE-V91021-1105：v9.10.21 線上檢查；雲端連不到 github.io，只能用使用者電腦）。
  打開 LIVE_URL（加 cb= 避免快取）→ 等載入 → 讀 #verLabel → 標題畫面截圖（直向、橫向各一張）。
  版本字樣要含 WANT_VER；還沒含就每 3 分鐘重新載入，最多 30 分鐘（部署還沒好那幾次不算）。
  Windows＋GPU ≠ iPhone 實機。
用法：LIVE_URL=https://pyhuanglaw.github.io/Lawstudent/index.html WANT_VER=v9.10.21 python3 cc_live_title_probe.py <url（不用）> <out>"""
import os, sys, asyncio, time, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

OUT = sys.argv[2]
URL = os.environ.get('LIVE_URL', '').strip() or sys.argv[1]
WANT = os.environ.get('WANT_VER', '').strip()
R = L.Run('live_title', OUT)
VER = "(document.getElementById('verLabel')||{}).textContent||''"


def bust(u):
    return u + ('&' if '?' in u else '?') + 'cb=%d' % int(time.time())


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC LIVE_TITLE：%s，要含「%s」；Windows＋GPU ≠ iPhone' % (URL, WANT), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        t0 = time.time(); ver = ''
        while True:
            await pg.goto(bust(URL)); ok = await L.wait_loaded(pg)
            ver = (await pg.evaluate(VER)).strip()
            print('  線上版本字樣：%s（載入 %s）' % (ver, ok), flush=True)
            if (WANT and WANT in ver) or not WANT or time.time() - t0 > 1800: break
            await pg.wait_for_timeout(180000)
        R.check('遊戲載入', ok, '')
        R.check('線上標題版本字樣含 %s' % WANT, (WANT in ver) if WANT else bool(ver), ver)
        await pg.screenshot(path=os.path.join(OUT, 'title_portrait.png'))
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, 'title_landscape.png'))
        print('  截圖：title_portrait.png、title_landscape.png', flush=True)
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
