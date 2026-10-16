import asyncio, json
from playwright.async_api import async_playwright
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 640, 'height': 480}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8842/index.html?turbo')
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'gongguan', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 0, 'z': -30, 'yaw': 0}, 'flags': FLAGS}
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(3000)
        r = await pg.evaluate("""(()=>{ const E=GAME.E, n=E.nav; const out={};
          out.door_stand=E.canStand(-0.3,21,0.3); const p=n.path(0,-30,-0.3,21); out.door_reach=!!(p&&p.length); if(p&&p.length){ const e=p[p.length-1]; out.door_end=JSON.stringify(e); }
          out.bike_cells_blocked=[[-3.0,21.55],[2.6,21.55],[4.5,21.55]].map(q=>!n.free(q[0],q[1]));
          out.aboard_blocked=!n.free(2.6,18.4);
          const sw=[]; for(let x=-6;x<=7;x+=0.25) sw.push(E.canStand(x,20.4,0.3)); out.arcade_line_ok=sw.every(Boolean);
          out.has_sim=typeof E.simWalk; return out; })()""")
        print(json.dumps(r, ensure_ascii=False))
        if r['has_sim'] == 'function':
            for a, bb in (((-7.0, 20.4), (7.0, 20.4)), ((7.0, 20.4), (-0.3, 21.0)), ((-0.3, 12.0), (-0.3, 21.0))):
                s = await pg.evaluate("(async(a)=>{ const r=await GAME.E.simWalk(a[0],a[1],a[2],a[3]); return r; })(%s)" % json.dumps([a[0], a[1], bb[0], bb[1]]))
                print('simWalk', a, '->', bb, json.dumps(s, ensure_ascii=False)[:300])
        print('errors', errs)
        await b.close()
asyncio.run(main())
