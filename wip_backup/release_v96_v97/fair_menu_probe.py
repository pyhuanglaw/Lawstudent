import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, sys.argv[2])
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[3]
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        await L.load_state(pg, {'zone': 'campus', 'hour': 12.0, 'day': 14, 'weekday': 2, 'weather': 'sunny', 'pos': {'x': -13.5, 'z': 13.2, 'yaw': 3.14, 'lv': 0}, 'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}})
        await pg.wait_for_timeout(4000)
        await pg.evaluate("void CLS.fairMenu(GAME, ACTIVITIES.list.find(a=>a.kind==='fair'))")
        for i in range(40):
            s = await L.state(pg)
            if s['choices']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        m = await pg.evaluate("""(()=>{ const r=e=>{ if(!e) return null; const q=e.getBoundingClientRect(); return [Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)]; };
          const box=document.getElementById('choices'), bs=[...box.querySelectorAll('button')];
          return {vw:innerWidth,vh:innerHeight,box:r(box),boxBottom:box.style.bottom,scrollTop:box.scrollTop,scrollH:box.scrollHeight,clientH:box.clientHeight,dlg:r(document.getElementById('dlg')),dlgHidden:document.getElementById('dlg').classList.contains('hide'),
            first:r(bs[0]),last:r(bs[bs.length-1]),n:bs.length, hitFirst:(()=>{ const q=bs[0].getBoundingClientRect(); const cx=q.left+q.width/2, cy=q.top+q.height/2; const h=document.elementFromPoint(cx,cy); return {cx,cy,hit:!!h&&(h===bs[0]||bs[0].contains(h))}; })()}; })()""")
        print(json.dumps(m, ensure_ascii=False))
        await pg.screenshot(path=OUT)
        await b.close()
asyncio.run(main())
