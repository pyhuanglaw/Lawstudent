"""BB：BUG-ECON-SLEEPSKIP-1018（LAWWW 60c84c0c）——經濟系事件模式，玩家每天一空下來就去睡覺，事件一個都不能少。
[前置] 讀新遊戲玩到 9/1 過完的存檔（欄位 1，標題「讀取」）。之後照玩家：對話點過去、選項選第一個、手機要回的回第一個；
一空下來：在宿舍就走到床邊按「睡覺」→ 睡到明天；在家就選「睡覺」。不在宿舍也不在家＝不做事（事件模式自己會跳）。
順便：可昕在 3D 畫面裡就截圖（BUG-KX-MALE-1018，每個事件一張）。
檢查：ECONFF.STEPS 每一個都 done（不是 missed）、9/2～10/18 沒有 JS 例外、沒有卡住。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
import screencheck as SC
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; SAVE = sys.argv[3]
PENDING = "(()=>{ const G=GAME.G; const a=(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>PHONE.th(m)):[]; return a; })()"
PREFER = ['睡到明天早上', '睡覺', '出發', '直接去上課', '好']
async def pick(pg, cdp):
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,26),bs.map(x=>x.textContent.trim().slice(0,12))]; })(%s)" % json.dumps(PREFER))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    return c
async def answer_phone(pg, cdp, th):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===t); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(th))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    b = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask], #phoneBody [data-ans]')][0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(900)
    if await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    return b and b[2]
async def main():
    run = L.Run('sleep_probe', OUT); sc = SC.Checker(run, OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1'))||b[0]; if(!e) return null; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        run.setup('讀取新遊戲玩到 9/1 過完的存檔（欄位 1）'); await pg.wait_for_timeout(4000)
        t0 = time.time(); last_key = None; sleeps = 0; kx_shots = {}; last_sig = None; stuck_t = time.time(); stuck = 0
        while time.time() - t0 < 1.8 * 3600:
            g = await pg.evaluate("({key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,stage:GAME.G.stage,home:typeof HOME!=='undefined'&&HOME.at(GAME.G),ff:typeof ECONFF!=='undefined'&&ECONFF.on(GAME.G)})")
            if g['key'] != last_key: last_key = g['key']; print('  [%6.1f 分] %s' % ((time.time()-t0)/60, json.dumps(g, ensure_ascii=False)), flush=True)
            if g['key'] >= '2024-10-19' or g['stage'] != 'econ': break
            s = await L.state(pg)
            sig = (s['dtext'], s['choices'], g['zone'], g['h'], g['key'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                stuck += 1; run.note('超過 4 分鐘沒有進展：' + json.dumps(s, ensure_ascii=False)); await run.shot(pg, 'stuck_%d' % stuck); stuck_t = time.time()
                await L.close_panels(pg, cdp)
                if stuck > 3: break
            kx = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.kexin; if(!n||!n.obj||n.hidden) return null; const blur=!!document.querySelector('#adv.blur, .adv-blur, #advBg:not(.hidden)'); return {blur, ev:(GAME.G.events&&GAME.G.events.cur)||null}; })()")
            if kx and not kx['blur']:
                k = g['key'] + ('' if not s['dlg'] else '_dlg')
                if k not in kx_shots and len(kx_shots) < 14: kx_shots[k] = 1; await run.shot(pg, 'kexin_%s_%s' % (g['key'], g['zone']))
            if s['dlg']:
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            pend = await pg.evaluate(PENDING)
            if pend and (s['choices'] or not s['busy']):
                a = await answer_phone(pg, cdp, pend[0]); print('   手機回覆', pend[0], a, flush=True); continue
            if s['choices']:
                c = await pick(pg, cdp)
                if c:
                    print('   ▶', c[2], '／', c[3], flush=True)
                    if c[2].startswith('睡'): sleeps += 1
                continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            if g['zone'] == 'dorm' and not g['home']:
                bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed:
                    print('   一空下來就去睡（宿舍） %s %.2f' % (g['key'], g['h']), flush=True)
                    if await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=90):
                        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                    continue
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'end'); sc.finish()
        res = json.loads(await pg.evaluate("JSON.stringify((()=>{ const G=GAME.G, r=(G.flags.ECONFF||{}).done||{}; return {key:CALENDAR.dateOf(G.day).key,h:G.hour,stage:G.stage, steps:ECONFF.STEPS.map(s=>({n:s.n,key:s.key,ev:s.ev||s.cls,then:s.then||null,rec:r[s.n]||null,done:ECONFF.stepDone(G,s)})), done:Object.keys(G.events.done||{})}; })())"))
        print('結束', res['key'], res['h'], res['stage'], flush=True)
        miss = [x for x in res['steps'] if not x['done'] or x['rec'] == 'missed']
        for x in res['steps']: print('   #%d %s %s%s  %s' % (x['n'], x['key'], x['ev'], ('→' + x['then']) if x['then'] else '', 'OK' if x['done'] and x['rec'] != 'missed' else ('MISSED' if x['rec'] == 'missed' else '沒演')), flush=True)
        print('   睡覺 %d 次；可昕截圖 %d 張' % (sleeps, len(kx_shots)), flush=True)
        run.check('玩到 10/19（休學）', res['key'] >= '2024-10-18', res['key'])
        run.check('AA_292 事件表 #4～#29 每一個都演了（沒有 missed）', not miss, json.dumps(miss, ensure_ascii=False))
        run.check('真的有去睡覺（不是全靠自動跳）', sleeps >= 5, str(sleeps))
        run.check('沒有卡住超過 4 分鐘', stuck == 0, str(stuck))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
