"""經濟系事件接事件的瀏覽器探測（QA-TRANSCRIPT-1018）：第一階段 9/2 宿舍起一路點對話、選第一個選項、關手機，
   印出每次換日／換區域／步驟，掛 ADV.log 把畫面上每一句存成 transcript1.json（OUT 環境變數指定資料夾）。
   用法：OUT=<資料夾> python3 tests/econ_ff_probe1.py http://127.0.0.1:8765/index.html <目標事件 id> [最多秒數]
   不是驗收測試（選項一律選第一個、不測每條分支）；給 AA 讀劇本、找卡住的地方用。"""
import asyncio, json, os, sys, time
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]
class Run:
    def note(self,t): print('  note',t,flush=True)
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p)
        await pg.goto(URL+'?turbo'); await L.wait_loaded(pg)
        D=await pg.evaluate("STORY.dayOfKey('2024-09-02')")
        st={'stage':'econ','zone':'dorm','day':D,'hour':8.0,'weekday':1,'weather':'clear','pos':None,
            'flags':{'ECON_CAMP_OPEN':True,'ECON_CAMP_DONE':True,'E15_BUS':'watching','E15_WENT':True,'met_kexin':True,'met_econ_zhengxun':True,'E01_NIGHT':'sleep','E01_DONE':True,'E01_MORNING':True,'E412_MOVEIN':True,'KX_FIRST_MSG':True,'fundsV2':1,'LIFELINE_V':1}}
        await L.load_state(pg, st)
        await pg.evaluate("window.__T=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__T.push([GAME.G.day,+GAME.G.hour.toFixed(2),n||'',t]); }catch(e){} return o.apply(this,arguments); }")
        run=Run(); t0=time.time(); last=None
        target=sys.argv[2] if len(sys.argv)>2 else 'ev_y0_e07'
        MAXS=float(sys.argv[3]) if len(sys.argv)>3 else 1500
        while time.time()-t0<MAXS:
            s=await L.state(pg)
            info=await pg.evaluate("(()=>{ const G=GAME.G; return {d:G.day,h:+G.hour.toFixed(2),z:G.zone,done:Object.keys((G.flags.ECONFF||{}).done||{}).join(','),ev:Object.keys(G.events.done||{}).join(','),phone:!document.getElementById('phone').classList.contains('hide')}; })()")
            k=(info['d'],info['z'],info['done'])
            if k!=last: last=k; print(f"[{time.time()-t0:5.0f}s] day {info['d']} {info['h']} {info['z']} steps={info['done']} ev={info['ev']} phone={info['phone']}",flush=True)
            if target in info['ev'].split(','): print('REACHED',target); break
            if info['phone']: await L.close_panels(pg,cdp); continue
            if s['choices'] or s['dlg']:
                await L.advance_dialogs(pg,cdp,run,lambda q: not q['dlg'] and not q['choices'],max_steps=60,step_wait=500)
            else: await pg.wait_for_timeout(800)
        open(os.path.join(os.environ.get('OUT','.'),'transcript1.json'),'w').write(await pg.evaluate('JSON.stringify(window.__T||[])'))
        print('errs',errs[:5]); print('final',await pg.evaluate("JSON.stringify({d:GAME.G.day,h:GAME.G.hour,z:GAME.G.zone,stage:GAME.G.stage,missed:(GAME.G.flags.ECONFF||{}).missed})")); await b.close()
asyncio.run(main())
