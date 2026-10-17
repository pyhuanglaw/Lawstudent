"""開遊戲加速（使用者 2026-10-16：「光打開遊戲超過 20 秒，可以優化嗎」）。
用 CDP 把網路限速成手機網路（預設 3 MB/s、延遲 40 ms；不同網速可以用第三個參數），從乾淨的瀏覽器（沒有快取）打開遊戲：
  1. 標題畫面出來的時間、那時已經下載多少 MB（舊版要等全部人物約 48 MB；新版只等主角＋動作＋環境小物）；
  2. 標題畫面出來時，主要角色還在背景下載（GAME.charsMain 是 false），下載不會停；
  3. 按「開始新的一天」：人物還沒到齊就出現「載入人物 n／14」，等主要角色＋路人底模全部到齊才進遊戲（使用者 2026-10-17：不准退化成醜模型）；
  4. 進遊戲時所有人物模型都已載入、畫面上沒有看得到的備用人物（CHAR.isDegraded）；沒有 JS 例外。
同一支對舊版（v9.9）跑：只量第 1 項的時間做比較。用法：python3 tests/boot_fast.py URL [輸出資料夾] [MB/s]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/boot_fast'
MBPS = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
TITLE = "!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')&&typeof GAME!=='undefined'"


async def main():
    run = L.Run('boot_fast', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cdp.send('Network.enable')
        await cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
        await cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 40, 'downloadThroughput': MBPS * 1048576, 'uploadThroughput': 1048576})
        run.note(f'網路限速 {MBPS} MB/s、延遲 40 ms、不用快取')
        t0 = time.time(); await pg.goto(L.law_url(URL))   # 法律系開局（第 7 組以後新遊戲預設是經濟系，?start1）
        ok = False
        while time.time() - t0 < 300:
            if await pg.evaluate(TITLE): ok = True; break
            await pg.wait_for_timeout(250)
        tt = time.time() - t0
        st = await pg.evaluate("({mb:+(ASSETS.bytes.done/1048576).toFixed(1), fast:typeof GAME.waitChars==='function', main:GAME.charsMain===undefined?null:!!GAME.charsMain})")
        await run.shot(pg, 'title')
        run.check('標題畫面出來', ok, f'{tt:.1f} 秒、已下載 {st["mb"]} MB')
        print(f'TITLE_SECONDS {tt:.1f} MB {st["mb"]}', flush=True)
        if not st['fast']:
            run.note('舊版（沒有背景下載）：只量時間'); await b.close(); sys.exit(run.finish())
        run.check('標題出來時已下載不到 15 MB（不用等全部人物）', st['mb'] < 15, json.dumps(st))
        run.check('標題出來時主要角色還在背景下載', st['main'] is False, json.dumps(st))
        await pg.wait_for_timeout(1500)
        mb2 = await pg.evaluate("+(ASSETS.bytes.done/1048576).toFixed(1)")
        run.check('標題畫面停著時下載繼續', mb2 > st['mb'], f'{st["mb"]} → {mb2} MB')
        await L.tap(pg, cdp, '#btnNew')
        seen = None; t1 = time.time()
        while time.time() - t1 < 240:
            q = await pg.evaluate("({load:!document.getElementById('loading').classList.contains('hide'), msg:document.getElementById('loadMsg').textContent, main:!!GAME.charsMain, title:!document.getElementById('titleScreen').classList.contains('hide')})")
            if q['load'] and seen is None: seen = q['msg']; await run.shot(pg, 'waiting')
            if not q['title'] and not q['load']: break
            await pg.wait_for_timeout(300)
        allm = await pg.evaluate("GAME.mainChars.every(k=>ASSETS.has(k))")
        alla = await pg.evaluate("(GAME.allChars||[]).every(k=>ASSETS.has(k))")
        run.check('按「開始」：人物還沒到齊就顯示「載入人物」等它們', seen is not None and seen.startswith('載入人物'), str(seen))
        run.check('進遊戲時主要角色都已經載入', allm)
        run.check('進遊戲時路人底模也都已經載入（不等到之後才換）', alla)
        await pg.wait_for_timeout(3000)
        vis = await pg.evaluate("(()=>{ const E=GAME.E, bad=[]; const all=[E.player].concat(E.npcs); for(const n of all){ const o=n.obj; if(!o) continue; const u=o.userData||{}; let shown=false; o.traverse(x=>{ if((x.isMesh||x.isSkinnedMesh)&&x.visible){ let p=x, v=true; while(p&&p!==o.parent){ if(!p.visible){ v=false; break; } p=p.parent; } if(v) shown=true; } }); if(CHAR.isDegraded(o)&&shown) bad.push((n.name||n.id||'?')+':'+u.driver); } return {n:all.length, bad}; })()")
        run.check('進遊戲後畫面上沒有看得到的備用人物', not vis['bad'], json.dumps(vis, ensure_ascii=False))
        await run.shot(pg, 'in_game')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
