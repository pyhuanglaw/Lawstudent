import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); sys.path.insert(0, '/home/user/cc/docs/story_planning/test_tools/cc')
import playlib as L, cc_det, cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
R = L.Run('book_dbg', OUT); D.setup(R, OUT)
SNAP = "(()=>{ const G=GAME.G; return {zone:G.zone, hour:+(+G.hour).toFixed(3), day:G.day, flags:JSON.parse(JSON.stringify(G.flags||{})), jobs:JSON.parse(JSON.stringify(G.jobs||{})), outings:(G.outings||[]).length, dlg:(document.getElementById('dlgText')||{}).innerText||null, toast:(document.getElementById('toast')||{}).innerText||null, ev:(typeof EVENTS!=='undefined'&&EVENTS.current&&EVENTS.current.id)||null}; })()"
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("(k=>STORY.dayOfKey(k))('2025-10-18')")
        for zone in (os.environ.get('ZONES') or 'bookstore').split(','):
          for quiet in (True, False):
            st0 = {'zone': zone, 'day': d, 'hour': 13.8}
            await L.load_state(pg, st0, quiet_events=quiet, quiet_phone=True)
            prev = None; first = None
            for i in range(40):
                s = await pg.evaluate(SNAP)
                if first is None: first = s
                key = (s['zone'], s['hour'], s['dlg'], s['toast'], s['ev'])
                if key != prev:
                    print('[%s] quiet=%s t=%.1fs zone=%s hour=%s dlg=%r toast=%r ev=%s' % (zone, quiet, i * 0.5, s['zone'], s['hour'], (s['dlg'] or '')[:80], (s['toast'] or '')[:60], s['ev']), flush=True)
                    prev = key
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            last = await pg.evaluate(SNAP)
            fd = {k: [first['flags'].get(k), last['flags'].get(k)] for k in set(first['flags']) | set(last['flags']) if first['flags'].get(k) != last['flags'].get(k)}
            print('[%s] quiet=%s flags diff: %s' % (zone, quiet, json.dumps(fd, ensure_ascii=False)[:1500]), flush=True)
            print('[%s] quiet=%s jobs: %s outings %s->%s' % (zone, quiet, json.dumps(last['jobs'], ensure_ascii=False)[:300], first['outings'], last['outings']), flush=True)
        print('errs', errs[:3]); await b.close()
asyncio.run(main())
