"""經濟系開局（v0）從標題玩前幾天的真實玩家流程（2026-10-17 第 7 組起：標題的「新遊戲」就是經濟系開局，先演 8/23～25 宿營）（使用者 2026-10-17：先把經濟系做好；標題畫面開放經濟系開局之前要過這一支）。
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
        await pg.goto(URL)   # 2026-10-17 第 7 組：標題的「新遊戲」直接是經濟系開局（不用 ?y0）
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        run.check('標題畫面只有一個新遊戲（經濟系開局按鈕藏著）', await pg.evaluate("document.getElementById('btnNewEcon').classList.contains('hide')"))
        await L.tap(pg, cdp, '#btnNew')
        ok, log = await drive(pg, cdp, run, "GAME.G&&GAME.G.stage==='econ'&&GAME.G.zone==='dorm'&&!!GAME.G.flags.E01_DONE&&!GAME.E.player.busy&&!GAME.D.active", [], 400)
        d = await pg.evaluate("(()=>{ const G=GAME.G, k=CALENDAR.dateOf(G.day).key; return {stage:G.stage, day:G.day, key:k, hour:+G.hour.toFixed(2), zone:G.zone}; })()")
        await run.shot(pg, 'e01_done')
        G7 = "(()=>{ const G=GAME.G, F=G.flags; return {camp:!!F.ECON_CAMP_OPEN, bus:F.E15_BUS||null, kx:SOCIAL.has('kexin','FIRST_MET'), sq:(G.msgs||[]).filter(m=>m.th==='g:econ_squad3').length, q:((G.phone||{}).q||[]).map(q=>q.tag).join(','), key:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(2), busy:!!GAME.E.player.busy, dlg:!!GAME.D.active, paused:!!GAME.E.paused}; })()"
        for _ in range(120):   # 8/25 21:00 的小隊群組排在手機佇列；劇情演出中 STORY.tick 不跑，控制權回來後的第一個 tick 才送進手機。
            # E01 結尾「先睡。明天再拆。」會接著自動睡到 9/2 早上（AA_154 A24）：那一段又在劇情狀態裡，所以等到沒有劇情、再多等幾個 tick（SwiftShader 30 幀可能要十幾秒）
            g7 = await pg.evaluate(G7)
            if g7['sq'] >= 3: break
            await pg.wait_for_timeout(1000)
        run.check('第 7 組：先演 8/23～25 經濟系宿營（遊覽車上認識可昕、選了一個回答、小隊群組三則）', g7['camp'] and g7['bus'] in ('nosleep', 'watching') and g7['kx'] and g7['sq'] == 3, json.dumps(g7, ensure_ascii=False))
        # E01 的最後一個選項「先睡。明天再拆。」直接睡到 9/2 早上（劇情設計，AA_154 A24）；選「再拆一箱」的話停在 9/1 晚上，要自己走到床邊睡
        run.check('經濟系開局：2024-09-01 男宿第一晚（E01）演完、恢復控制（9/1 晚上，或 E01 結尾睡著到 9/2 早上）', ok and d['stage'] == 'econ' and d['key'] in ('2024-09-01', '2024-09-02'), json.dumps(d) + ' ' + json.dumps(log[-6:], ensure_ascii=False))
        ok = True
        if d['key'] == '2024-09-01':
            bed = await L.find_it(pg, '睡覺')
            ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.8, '床')
            run.check('走到床邊（點地面／搖桿）', ok, str(bed))
            if ok:
                await pg.wait_for_timeout(800); s = await L.state(pg)
                run.check('床邊出現「睡覺」', s['interact'].startswith('睡覺'), s['interact'])
                await L.tap(pg, cdp, '#interact')
        if ok:
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
