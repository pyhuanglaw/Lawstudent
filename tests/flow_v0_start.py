"""經濟系開局（v0）從標題玩前幾天的真實玩家流程（使用者 2026-10-17：先把經濟系做好；標題畫面開放經濟系開局之前要過這一支）。
不用 ?turbo、不改旗標；網址加 ?y0（經濟系開局按鈕現在只在 ?y0 出現，D81）：
  標題「經濟系開局」→ 2024-09-01 晚上男宿（E01 宿舍第一晚）→ 對話選第一個 → 走到床邊「睡覺」→ 9/2（一）早上的起床選單 →
  「直接去上課」第一堂經濟學原理（博雅 101）→ 上完課、恢復控制。
檢查：stage 是 econ、日期、那一堂記成出席、沒有卡住保險、畫面上沒有看得到的備用人物、沒有 JS 例外。
用法：python3 tests/flow_v0_start.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_v0_start'
VIS_BAD = "(()=>{ const E=GAME.E, bad=[]; for(const n of [E.player].concat(E.npcs)){ const o=n.obj; if(!o||!CHAR.isDegraded||!CHAR.isDegraded(o)) continue; let shown=false; o.traverse(x=>{ if((x.isMesh||x.isSkinnedMesh)&&x.visible){ let p=x, v=true; while(p&&p!==o.parent){ if(!p.visible){ v=false; break; } p=p.parent; } if(v) shown=true; } }); if(shown) bad.push(n.name||n.id||'?'); } return bad; })()"


async def drive(pg, cdp, run, until_js, prefer, max_s=300):
    """點對話、選選項（優先選含 prefer 字樣的，沒有就第一個），直到 until_js 成立"""
    log = []; t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate(until_js): return True, log
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs.find(x=>w.some(t=>x.textContent.includes(t)))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })(%s)" % json.dumps(prefer))
            if c: log.append('▶' + c[2]); await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            if s['dtext'] and (not log or log[-1] != s['dtext'][:30]): log.append(s['dtext'][:30])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return False, log


async def main():
    run = L.Run('flow_v0_start', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'y0')
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        run.check('?y0：標題畫面有經濟系開局', await pg.evaluate("!document.getElementById('btnNewEcon').classList.contains('hide')"))
        await L.tap(pg, cdp, '#btnNewEcon')
        ok, log = await drive(pg, cdp, run, "GAME.G&&GAME.G.stage==='econ'&&GAME.G.zone==='dorm'&&!!GAME.G.flags.E01_DONE&&!GAME.E.player.busy&&!GAME.D.active", [], 400)
        d = await pg.evaluate("(()=>{ const G=GAME.G, k=CALENDAR.dateOf(G.day).key; return {stage:G.stage, day:G.day, key:k, hour:+G.hour.toFixed(2), zone:G.zone}; })()")
        await run.shot(pg, 'e01_done')
        run.check('經濟系開局：2024-09-01 男宿第一晚（E01）演完、恢復控制', ok and d['stage'] == 'econ' and d['key'] == '2024-09-01', json.dumps(d) + ' ' + json.dumps(log[-6:], ensure_ascii=False))
        bed = await L.find_it(pg, '睡覺')
        ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.8, '床')
        run.check('走到床邊（點地面／搖桿）', ok, str(bed))
        if ok:
            await pg.wait_for_timeout(800); s = await L.state(pg)
            run.check('床邊出現「睡覺」', s['interact'].startswith('睡覺'), s['interact'])
            await L.tap(pg, cdp, '#interact')
            # 睡覺可能先問要幾點起床／確認：照第一個選項
            ok, log = await drive(pg, cdp, run, "(()=>{ const G=GAME.G; return CALENDAR.dateOf(G.day).key==='2024-09-02'&&!!document.querySelector('#choices button')&&[...document.querySelectorAll('#choices button')].some(b=>b.textContent.includes('直接去上課')); })()", ['睡覺', '七點', '7', '好'], 300)
            await run.shot(pg, 'wake_902')
            run.check('9/2（一）早上：起床選單有「直接去上課」', ok, json.dumps(log[-6:], ensure_ascii=False))
            if ok:
                ok, log = await drive(pg, cdp, run, "(()=>{ const G=GAME.G, R=CLS.rec(G); return Object.keys(R.done).some(k=>k.startsWith(G.day+':econ_principles_y0'))&&!GAME.E.player.busy&&!GAME.D.active; })()", ['直接去上課', '經濟學原理'], 600)
                st = await pg.evaluate("({zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2), done:Object.keys(CLS.rec(GAME.G).done).filter(k=>k.startsWith(GAME.G.day+':')), fb:GAME.walkFallbacks||0})")
                await run.shot(pg, 'after_class')
                run.check('第一堂經濟學原理上完（出席）、恢復控制', ok, json.dumps(st, ensure_ascii=False) + ' ' + json.dumps(log[-6:], ensure_ascii=False))
                run.check('沒有用到卡住保險', st['fb'] == 0, str(st['fb']))
        bad = await pg.evaluate(VIS_BAD)
        run.check('畫面上沒有看得到的備用人物', not bad, json.dumps(bad, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
