"""CC（帳號 A）11-03：BUG-YT-FIRSTMET-RELABEL-1103 修法 ①（BB 22:51）：新遊戲一開始就寫 G.social.fm120＝true。
  真實流程：清掉存檔 → 標題按「開始新的一天」（#btnNew）→ 等進到 3D（GAME.G.zone 有值）、G.social 建好 → 讀 G.social.fm120。
  不讀檔、不改旗標、不用 ?turbo。
  檢查：① 進到 3D、G.social 建好（60 秒內） ② G.social.fm120 === true（9d8e00fdc 要 PASS；d2b962a3f 對照組要 FAIL）
用法：LW_TESTS=<wt>/tests python3 cc_yt_newgame_fm120_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


ST = "(()=>{ const G=(typeof GAME!=='undefined')&&GAME.G; const so=G&&G.social; return {zone:G?G.zone||null:null, social:!!so, fm120:so?(so.fm120===undefined?'undefined':so.fm120):null, keys:so?Object.keys(so).slice(0,20):[]}; })()"


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")   # 乾淨的玩家（沒有舊存檔）
        check('標題畫面按「開始新的一天」', await L.tap(pg, cdp, '#btnNew'))
        t0 = time.time(); s = None
        while time.time() - t0 < 60:
            s = await pg.evaluate(ST)
            if s['zone'] and s['social']: break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); s = await pg.evaluate(ST)
        await pg.screenshot(path=os.path.join(OUT, 'newgame.png'))
        check('① 進到 3D、G.social 建好（60 秒內）', bool(s and s['zone'] and s['social']), J(s))
        check('② 新遊戲的 G.social.fm120 === true（修法 ①）', bool(s) and s['fm120'] is True, J(s))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
