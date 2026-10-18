import asyncio, json, sys, time
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]; TURBO=len(sys.argv)>2 and sys.argv[2]=='turbo'
class Run:
    def note(self,t): print('  note',t,flush=True)
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p)
        await pg.goto(URL+('?turbo' if TURBO else '')); await L.wait_loaded(pg)
        D=await pg.evaluate("STORY.dayOfKey('2024-09-13')")
        st={'stage':'econ','zone':'dorm','day':D,'hour':18.5,'weekday':5,'weather':'clear','pos':None,
            'flags':{'ECON_CAMP_OPEN':True,'ECON_CAMP_DONE':True,'E15_BUS':'watching','E15_WENT':True,'met_kexin':True,'met_econ_zhengxun':True,'E01_NIGHT':'sleep','E01_DONE':True,'E01_MORNING':True,'E412_MOVEIN':True,'KX_FIRST_MSG':True,'fundsV2':1,'LIFELINE_V':1,
                     'ECONFF':{'done':{'4':1,'5':1,'6':1},'lines':[]}}}
        await L.load_state(pg, st)
        run=Run(); t0=time.time(); last=None; seenE14=False; after=None
        while time.time()-t0<float(sys.argv[3] if len(sys.argv)>3 else 240):
            s=await L.state(pg)
            info=await pg.evaluate("""(()=>{ const G=GAME.G,E=GAME.E; return {d:G.day,h:+G.hour.toFixed(2),z:G.zone,e14:!!(G.events.done||{}).ev_y0_e14,
              paused:!!(E&&E.paused),busy:!!(E&&E.player&&E.player.busy),adv:typeof ADV!=='undefined'&&!!ADV.active,evr:!!EVENTS.running,ff:!!(typeof ECONFF!=='undefined'&&ECONFF.busy),
              Dact:!!(GAME.D&&GAME.D.active),fade:(document.getElementById('fade')||{}).className,phone:!document.getElementById('phone').classList.contains('hide'),
              next:(typeof ECONFF!=='undefined'&&ECONFF.next&&ECONFF.next(G))?(ECONFF.next(G).n+':'+(ECONFF.next(G).ev||ECONFF.next(G).cls)):null,
              out:(typeof OUT!=='undefined'&&OUT.get(G,'y0_e14'))?OUT.get(G,'y0_e14').state:null,on:typeof ECONFF!=='undefined'&&ECONFF.on(G)}; })()""")
            k=json.dumps(info,ensure_ascii=False)
            if k!=last: last=k; print(f"[{time.time()-t0:5.0f}s] {k}",flush=True)
            if info['e14'] and after is None: after=time.time()
            if after and time.time()-after>60: print('60s after E14'); break
            if info['phone']: await L.close_panels(pg,cdp); continue
            if s['choices'] or s['dlg']:
                await L.advance_dialogs(pg,cdp,run,lambda q: not q['dlg'] and not q['choices'],max_steps=60,step_wait=500)
            else: await pg.wait_for_timeout(1000)
        await pg.screenshot(path='/tmp/bowl_after.png')
        print('errs',errs[:5]); await b.close()
asyncio.run(main())
