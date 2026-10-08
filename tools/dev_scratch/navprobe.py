import asyncio, json, sys
from playwright.async_api import async_playwright
zone=sys.argv[1]; cx=float(sys.argv[2]); cz=float(sys.argv[3]); R=int(sys.argv[4]) if len(sys.argv)>4 else 8
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':844,'height':390})
        await pg.goto('http://127.0.0.1:8765/index.html?turbo&lowres'); await pg.wait_for_timeout(8000)
        st={'day':8,'weekday':1,'hour':10.5,'zone':zone,'pos':{'x':cx,'z':cz,'yaw':0},'flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1000)
        rows=await pg.evaluate("((cx,cz,R)=>{ const nav=GAME.E.nav; const out=[]; for(let z=cz-R;z<=cz+R;z+=1){ let s=''; for(let x=cx-R;x<=cx+R;x+=1){ s+=nav.free(x,z)?'.':'#'; } out.push((z).toFixed(0).padStart(5)+' '+s); } return out; })(%s,%s,%s)" % (cx,cz,R))
        print('\n'.join(rows)); print('cols x from',cx-R,'to',cx+R)
        print(await pg.evaluate("(()=>{ const n=GAME.E.nav; return {cell:n.cell, ox:n.ox, oz:n.oz, cols:n.cols, rows:n.rows}; })()"))
        await b.close()
asyncio.run(main())
