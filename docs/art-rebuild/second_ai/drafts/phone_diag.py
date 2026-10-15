"""flow_typhoon A 段「點 #btnPhone 手機沒打開」的診斷（LAWWW2）：照測試的讀檔＋SETUP，點之前看按鈕中心是哪個元素、點之後手機有沒有打開；
打不開再試 element.click()，並記錄 GAME.titleIdle、E.paused、phone 面板的 class。用法：python3 phone_diag.py URL OUT TESTS_DIR"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
URL, OUT, TD = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, TD)
import playlib as L
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
SETUP = "(()=>{ const G=GAME.G; PHONE.join(G,'noodle_team','麵店團'); PHONE.rec(G).groups.noodle_team.day=20; SOCIAL.remember('npc_fangyt','FIRST_MET','黃金葛'); return true; })()"
PROBE = """(()=>{ const b=document.getElementById('btnPhone'); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2;
  const stack=document.elementsFromPoint(x,y).slice(0,6).map(e=>(e.id?'#'+e.id:e.tagName.toLowerCase())+(e.className&&typeof e.className==='string'?'.'+e.className.trim().replace(/\\s+/g,'.'):''));
  const ph=document.getElementById('phone'); return {x, y, w:r.width, h:r.height, top:stack, phoneCls:ph.className, titleIdle:GAME.titleIdle, paused:GAME.E&&GAME.E.paused, busy:GAME.E&&GAME.E.player&&GAME.E.player.busy, hour:GAME.G.hour}; })()"""
async def main():
    os.makedirs(OUT, exist_ok=True); log = []
    def P(*a):
        s = ' '.join(str(x) for x in a); print(s, flush=True); log.append(s)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.goto(URL); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'dorm', 'hour': 21.45, 'day': 26, 'weekday': 0, 'weather': 'cloudy', 'flags': FLAGS})
        await pg.evaluate(SETUP); await pg.wait_for_timeout(4000)
        P('before tap', json.dumps(await pg.evaluate(PROBE), ensure_ascii=False))
        ev = await pg.evaluate("""(()=>{ window.__ev=[]; const b=document.getElementById('btnPhone'); for(const t of ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click']) document.addEventListener(t,e=>{ window.__ev.push(t+':'+(e.target.id||e.target.tagName)+(e.defaultPrevented?':prevented':'')); },true); return true; })()""")
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        P('after touch tap', json.dumps(await pg.evaluate(PROBE), ensure_ascii=False))
        P('events', json.dumps(await pg.evaluate("window.__ev"), ensure_ascii=False))
        await pg.screenshot(path=os.path.join(OUT, 'after_touch_tap.png'))
        if 'hide' in (await pg.evaluate("document.getElementById('phone').className")):
            await pg.evaluate("window.__ev=[]; document.getElementById('btnPhone').click()"); await pg.wait_for_timeout(1200)
            P('after element.click()', json.dumps(await pg.evaluate(PROBE), ensure_ascii=False))
            P('events', json.dumps(await pg.evaluate("window.__ev"), ensure_ascii=False))
            await pg.screenshot(path=os.path.join(OUT, 'after_click.png'))
        P('errors', json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    open(os.path.join(OUT, 'diag.log'), 'w').write('\n'.join(log) + '\n')
asyncio.run(main())
