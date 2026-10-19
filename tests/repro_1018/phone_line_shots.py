import asyncio, json, sys
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]; OUT=sys.argv[2]
st={'day':26,'weekday':0,'hour':21.5,'zone':'dorm','pos':{'x':0,'z':2.4,'yaw':3.14},'weather':'clear','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'noodleTeam':20,'met_fang':True}}
VIEW="(()=>{ const b=document.getElementById('phoneBody'); const h=document.querySelector('#phoneBody .thHead'); return {open:!document.getElementById('phone').classList.contains('hide'), inThread:!!document.querySelector('#phoneBody [data-thback]'), rows:[...document.querySelectorAll('#phoneBody .chatRow')].map(r=>r.innerText.replace(/\\n/g,' | ')).slice(0,6), pendBlock:[...document.querySelectorAll('#phoneBody .item b')].some(x=>x.textContent==='待回覆'), scroll:[b.scrollTop,b.scrollHeight-b.clientHeight], headTop:h?Math.round(h.getBoundingClientRect().top-b.getBoundingClientRect().top):null, last:(([...document.querySelectorAll('#phoneBody .item')].pop()||{}).innerText||'').slice(0,60)}; })()"
async def run(p, landscape):
    tag='land' if landscape else 'port'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL); await L.wait_loaded(pg)
    await pg.evaluate("(()=>{ window.__pa=STORY.phoneAuto; })()")
    await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(3000)
    await pg.evaluate("(()=>{ STORY.phoneAuto=window.__pa; })()")   # 只關事件，手機自動打開照常（這裡要測它）
    for i in range(30):
        if await pg.evaluate("GAME.phoneIsOpen()"): break
        await pg.wait_for_timeout(500)
    v=await pg.evaluate(VIEW); print(tag,'auto-open',json.dumps(v,ensure_ascii=False)); await pg.screenshot(path=f'{OUT}/b_auto_{tag}.png')
    c=await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody .chatRow[data-th=\"p:kexin\"]')||document.querySelector('#phoneBody .chatRow'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
    if c:
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
        v=await pg.evaluate(VIEW); print(tag,'thread',json.dumps(v,ensure_ascii=False)); await pg.screenshot(path=f'{OUT}/b_thread_{tag}.png')
        await pg.evaluate("document.getElementById('phoneBody').scrollTop=0"); await pg.wait_for_timeout(400)
        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phoneTabs button')].find(x=>x.dataset.ptab==='msg'); })()")
        v=await pg.evaluate(VIEW); print(tag,'scrolled-up',json.dumps(v,ensure_ascii=False)); await pg.screenshot(path=f'{OUT}/b_thread_top_{tag}.png')
    print(tag,'errs',errs[:3]); await b.close()
async def main():
    async with async_playwright() as p:
        await run(p, False); await run(p, True)
asyncio.run(main())
