import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); sys.path.insert(0, '/home/user/cc/docs/story_planning/test_tools/cc')
import playlib as L, cc_det
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107); await pg.goto(sys.argv[1]); await L.wait_loaded(pg)
        sv = json.load(open(os.environ['SAVE18'])); await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(4000)
        r = await pg.evaluate("""(async()=>{ const out={}; out.knowsSTORY=STORY.knows('classmate_bohan',GAME.G); out.src=AA613.ceremonyWalk.toString().slice(0,300);
          const said=[]; const f=GAME.say; GAME.say=function(w,t){ said.push(String(t)); return Promise.resolve(); };
          try{ out.ret=await AA613.ceremonyWalk(GAME); }catch(e){ out.err=String(e); } GAME.say=f; out.said=said;
          out.storyCer=(STORY.ceremonyY1||'').toString().slice(0,600); return out; })()""")
        print(json.dumps(r, ensure_ascii=False, indent=1)[:2500]); await b.close()
asyncio.run(main())
