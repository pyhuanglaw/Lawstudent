"""BB-C 10-28：讀檔時一般劇情事件（EVENTS.run）正在對話中——讀進來以後別的劇情事件還演不演（LAWWW-C 08:12 LOADGEN-LOCKS-1028：applySave 沒清 EVENTS.running）。
做法（不是 iPhone：Playwright 手機橫向模擬、SwiftShader）：
  【前置】讀使用者存檔（day 14），【捷徑】void EVENTS.run(ev_bike_flat)（同 tests/p0_movement.py 的做法），點到第 2 句、對話框開著；
  【捷徑】GAME.applySave 讀另一份（同一份使用者存檔、改到宿舍）——遊戲裡劇情中選單「讀取」會擋，stale 或回標題以後讀檔走的也是 applySave；
  讀進來 3 秒後：記 EVENTS.running、對話框；照玩家點掉還開著的對話框；
  【捷徑】再 void EVENTS.run(同一個事件) → 30 秒內第一句有沒有出來（＝新的一局劇情事件還演得出來）；演完以後 EVENTS.running 清掉、不忙、走得動。
用法：LW_TESTS=<工作樹>/tests python3 reload_event_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用。"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad/bbtest/p0an/user_day14.json'
SAVE = json.load(open(SAVEF, encoding='utf-8')); SAVE = SAVE.get('G', SAVE); SAVE.pop('_stuck', None); SAVE.pop('_busy', None)
EV = os.environ.get('EV', 'ev_bike_flat')
ST = """(()=>{ const D=GAME.D, E=GAME.E, ch=document.getElementById('choices'); return {running:(typeof EVENTS!=='undefined'?EVENTS.running:null)||null, depth:D.busyDepth|0, dlg:!!D.active,
  txt:((document.getElementById('dlgName').textContent||'')+'｜'+(D.full||'')).slice(0,60), ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent.slice(0,20)):[],
  busy:!!E.player.busy, zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(2), loadGen:(typeof GAME.loadGen==='number')?GAME.loadGen:null}; })()"""
LOG = """(()=>{ window.__rl=[]; let last=''; setInterval(()=>{ try{ const D=GAME.D; const k=D.active?((document.getElementById('dlgName').textContent||'')+'｜'+(D.full||'')).slice(0,80):''; if(k&&k!==last) window.__rl.push({t:Math.round(performance.now()),k}); last=k; }catch(e){} },50); })()"""

async def click_through(pg, cdp, secs, until=None):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await pg.evaluate(ST)
        if until and until(s): return s
        if s['ch']:
            await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const b=bs.find(x=>!x.classList.contains('dim'))||bs[0]; if(b) b.click(); })()"); await pg.wait_for_timeout(700); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not s['busy'] and not s['depth'] and not s['running']: return s
        await pg.wait_for_timeout(500)
    return await pg.evaluate(ST)

async def main():
    run = L.Run('reload_event', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        st = copy.deepcopy(SAVE); st.update({'zone': 'campus', 'pos': {'x': 34, 'z': -86, 'yaw': 0, 'lv': 0, 'y': 0}, 'hour': 13.4})
        await L.load_state(pg, st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(4000)
        run.setup('[前置] 使用者存檔（day 14）改到 13:24 霖澤館前；關掉條件事件、要回覆的訊息自動開手機')
        await pg.evaluate(LOG)
        has = await pg.evaluate("!!(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e.id===%s))" % json.dumps(EV))
        run.check('前置：有這個事件（%s）' % EV, has)
        run.setup('[捷徑] void EVENTS.run(%s)，點到第 2 句' % EV)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id===%s))" % json.dumps(EV))
        n_lines = 0; s = None
        for _ in range(120):
            s = await pg.evaluate(ST)
            if s['dlg']:
                n_lines += 1
                if n_lines >= 2: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            await pg.wait_for_timeout(500)
        run.check('前置：事件演到一半（EVENTS.running＝%s、對話框開著）' % EV, s and s['dlg'] and s['running'] == EV, json.dumps(s, ensure_ascii=False))
        other = copy.deepcopy(SAVE); other.update({'zone': 'dorm', 'pos': None, 'hour': 21.0})
        g0 = await pg.evaluate("(typeof GAME.loadGen==='number')?GAME.loadGen:null")
        run.setup('[捷徑] 對話中 GAME.applySave（同一份使用者存檔改到 21:00 宿舍）')
        await L.load_state(pg, other, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
        a0 = await pg.evaluate(ST); run.note('讀檔 3 秒後 %s（loadGen %s → %s）' % (json.dumps(a0, ensure_ascii=False), g0, a0['loadGen']))
        run.check('讀進來是另一份（宿舍、21:00）', a0['zone'] == 'dorm', json.dumps(a0, ensure_ascii=False))
        n0 = await pg.evaluate("window.__rl.length")
        a1 = await click_through(pg, cdp, 60)
        old = await pg.evaluate("window.__rl.slice(%d)" % n0)
        run.note('讀檔以後點過的句子：%s' % json.dumps(old, ensure_ascii=False))
        run.check('讀檔以後 EVENTS.running 清掉了（照玩家點掉還開著的對話框以後）', not a1['running'], json.dumps(a1, ensure_ascii=False))
        run.check('讀檔以後不忙、鎖 0 層', not a1['busy'] and a1['depth'] == 0, json.dumps(a1, ensure_ascii=False))
        # 新的一局：劇情事件還演得出來嗎
        n1 = await pg.evaluate("window.__rl.length")
        run.setup('[捷徑] 新的一局 void EVENTS.run(%s)' % EV)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id===%s))" % json.dumps(EV))
        seen = False
        for _ in range(60):
            s = await pg.evaluate(ST)
            if s['dlg'] or s['running'] == EV: seen = True; break
            await pg.wait_for_timeout(500)
        run.check('新的一局劇情事件演得出來（30 秒內對話框出現、EVENTS.running＝%s）' % EV, seen, json.dumps(s, ensure_ascii=False))
        a2 = await click_through(pg, cdp, 180)
        lines = await pg.evaluate("window.__rl.slice(%d)" % n1)
        run.note('新的一局這個事件的句子：%s' % json.dumps(lines[:12], ensure_ascii=False))
        run.check('演完以後 EVENTS.running 清掉、不忙', not a2['running'] and not a2['busy'] and a2['depth'] == 0, json.dumps(a2, ensure_ascii=False))
        moved, n, sx = await L.push_until(pg, cdp, 0, -60, 0.3, max_pushes=3, ms=1200)
        if moved < 0.3: moved, n, sx = await L.push_until(pg, cdp, 0, 60, 0.3, max_pushes=2, ms=1200)
        run.check('推搖桿走得動', moved >= 0.3, '%.2f m' % moved)
        await run.shot(pg, 'end')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        print('SHA', os.environ.get('SHA', '?'), 'EV', EV)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
