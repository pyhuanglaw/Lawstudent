"""us_market 實際載入後（INTERIOR-AAA，LAWWW2 帳號 A 11-02）：光照貼圖接了幾個材質、窗景材質 14:00／20:30 的顏色。用法：python3 us_market_rt_check.py <工作樹> <URL>（先在工作樹開 http.server）。[捷徑] 讀檔直接進區域；SwiftShader，不是實機"""
import asyncio, json, sys
WT, URL = sys.argv[1], sys.argv[2]
sys.path.insert(0, WT + '/tests')
import playlib as L
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        out = {}
        for h in (14.0, 20.5):
            await L.load_state(pg, {'zone': 'us_market', 'hour': h, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True, quiet_phone=True)
            for i in range(60):
                if await pg.evaluate("GAME.G.zone==='us_market'&&!!GAME.E.zone&&GAME.E.zone.formal"): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(4000)
            r = await pg.evaluate("""(()=>{ const z=GAME.E.zone; let lmMats=0, view=null; const seen=new Set();
              z.group.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||seen.has(m)) continue; seen.add(m); if(m.lightMap) lmMats++; }
                if(/^usm_outside_view/.test(o.name)&&!view){ const m=[].concat(o.material)[0]; view={name:m.name, color:m.color?m.color.getHexString():null, emissive:m.emissive?m.emissive.getHexString():null, ei:m.emissiveIntensity}; } });
              return {hour:GAME.G.hour, lightmapped:z.lightmapped||0, rtWired:z.rtWired||0, lmMats, view}; })()""")
            out[str(h)] = r
        print(json.dumps(out, ensure_ascii=False)); print('errs', errs[:5]); await b.close()
asyncio.run(main())
