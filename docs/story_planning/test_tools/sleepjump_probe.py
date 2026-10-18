"""BB：BUG-ECON-SLEEPSKIP-1018 的「睡覺」那條路（ECONFF.sleepJump）。
[前置] 讀新遊戲玩到 9/1 過完的存檔（9/2 07:01 宿舍）。
[捷徑] 事件模式下玩家一空下來 1.5 秒就自動跳，走到床邊來不及：每次在宿舍空下來，就把玩家放到床邊（只改站的位置），馬上按互動鍵、選「睡」。
看：每次睡覺以後接到的是不是事件表的下一個（不是睡到隔天、跳過事件）；最後事件表沒有 missed。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]
ST = "JSON.stringify((()=>{ const G=GAME.G, n=ECONFF.next(G); return {key:CALENDAR.dateOf(G.day).key,h:+G.hour.toFixed(2),zone:G.zone,on:ECONFF.on(G),next:n?{n:n.n,key:n.key,ev:n.ev||n.cls}:null}; })())"
async def main():
    run = L.Run('sleepjump_probe', OUT); log = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        run.setup('讀取 9/2 07:01 宿舍的存檔'); await pg.wait_for_timeout(3000)
        sleeps = 0; t0 = time.time(); pending = None
        while time.time() - t0 < 1500 and sleeps < 6:
            s = await L.state(pg); g = json.loads(await pg.evaluate(ST))
            if not g['on']: break
            if pending and (s['dlg'] or g['key'] != pending['before']['key']):
                pending['after'] = g; pending['after_line'] = s['dtext'][:40]; log.append(pending); print('  睡覺之後', json.dumps(pending, ensure_ascii=False), flush=True); pending = None
                await run.shot(pg, 'after_sleep_%d' % sleeps)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if s['choices']:
                c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/^睡/.test(x.textContent.trim()))||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
                if c[2].startswith('睡') and pending and 'pick' not in pending: pending['pick'] = c[2]
                continue
            if s['busy'] or pending: await pg.wait_for_timeout(500); continue
            if g['zone'] == 'dorm':
                ok = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); if(!it) return false; const P=GAME.E.player.obj.position; P.x=it.x; P.z=it.z; return true; })()")
                if ok:
                    await pg.wait_for_timeout(250); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(600)
                    sleeps += 1; pending = {'before': g}; print('  [捷徑] 放到床邊、按互動鍵', json.dumps(g, ensure_ascii=False), flush=True)
                    continue
            await pg.wait_for_timeout(400)
        res = json.loads(await pg.evaluate("JSON.stringify(ECONFF.STEPS.map(s=>({n:s.n,rec:(GAME.G.flags.ECONFF||{done:{}}).done[s.n]||null,done:ECONFF.stepDone(GAME.G,s)})).filter(x=>x.rec==='missed'))"))
        ok_all = all(x.get('pick') and x['after']['key'] <= (x['before']['next'] or {}).get('key', '9999') for x in log) if log else False
        for x in log: print('   睡前', x['before']['key'], x['before']['h'], '下一個', x['before']['next'], '→ 睡後', x['after']['key'], x['after']['h'], x.get('after_line'))
        run.check('在宿舍按床「睡覺」有出現睡覺的選項並選了（%d 次）' % len(log), bool(log) and all(x.get('pick') for x in log), json.dumps([x.get('pick') for x in log], ensure_ascii=False))
        run.check('睡覺以後接到的是下一個事件那天（沒有睡過頭跳過事件）', ok_all, '')
        run.check('事件表沒有 missed', not res, json.dumps(res))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
