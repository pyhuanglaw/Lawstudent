import asyncio, json, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page()
        await pg.goto('http://127.0.0.1:8765/index.html?turbo&lowres'); await pg.wait_for_timeout(6000)
        st={'day':14,'weekday':1,'hour':15.2,'zone':'campus','pos':{'x':34,'z':-99,'yaw':0},'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'zheInvite':True,'afternoonDone':True},'visited':{'dorm':True,'campus':True,'classroom':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        # 用 CDP profiler 抓 3 秒
        cdp=await ctx.new_cdp_session(pg)
        await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{'interval':2000}); await cdp.send('Profiler.start')
        await pg.wait_for_timeout(4000)
        prof=(await cdp.send('Profiler.stop'))['profile']
        nodes={n['id']:n for n in prof['nodes']}
        # self time per function
        from collections import Counter
        cnt=Counter()
        for s in prof['samples']: cnt[s]+=1
        tot=sum(cnt.values())
        rows=[]
        for nid,c in cnt.items():
            n=nodes[nid]; cf=n['callFrame']; rows.append((c/tot*100, cf['functionName'] or '(anon)', cf['url'].split('/')[-1], cf['lineNumber']))
        rows.sort(reverse=True)
        for r in rows[:25]: print(f"{r[0]:5.1f}% {r[1]} {r[2]}:{r[3]}")
        await b.close()
asyncio.run(main())
