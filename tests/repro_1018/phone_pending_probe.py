"""REL-9101-POSTCHECK-1018：讀 p0_movement 的狀態（法律系第 8 天 13:18、預設交往中的可昕），每 2.5 秒印要回的訊息、手機開了沒、遊戲暫停沒。
   v9.10.1 和開發分支都在約 5 秒時手機自動打開（第 3 天 19:30「週末來政大？我當導遊。」）、paused:true。用法：python3 tests/repro_1018/phone_pending_probe.py <網址>"""
import asyncio, json, sys
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]
st={'day':8,'weekday':4,'hour':13.3,'zone':'campus','pos':{'x':34,'z':-97.6,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True}}
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p)
        await pg.goto(URL); await L.wait_loaded(pg)
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })("+json.dumps(st)+")")
        for i in range(12):
            r=await pg.evaluate("(()=>({h:+GAME.G.hour.toFixed(3),pend:PHONE.pending(GAME.G).map(m=>(m.day+'/'+(+m.h).toFixed(2)+' '+(m.text||'').slice(0,14))),open:GAME.phoneIsOpen(),paused:GAME.E.paused,auto:(GAME.G.flags._autoAsk||[]).length,frame:GAME.E.frame,titleIdle:!!GAME.titleIdle,busy:!!GAME.E.player.busy}))()")
            print(i*2.5, json.dumps(r, ensure_ascii=False)); await pg.wait_for_timeout(2500)
        await b.close()
asyncio.run(main())
