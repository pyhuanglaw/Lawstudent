import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':844,'height':390})
        await pg.goto('http://127.0.0.1:8765/index.html?turbo&lowres'); await pg.wait_for_timeout(8000)
        st={'day':8,'weekday':1,'hour':10.5,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':-1.57},'flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1000)
        r=await pg.evaluate("""(async()=>{ const out=[]; for(const zid of Object.keys(Z3.ZONES)){ await GAME.enter(zid,undefined,{noFade:true}); const E=GAME.E; const nav=E.nav; const r=0.32; const can=(x,z)=>nav.free(x,z)&&nav.free(x+r,z)&&nav.free(x-r,z)&&nav.free(x,z+r)&&nav.free(x,z-r);
          const pts=[]; const zs=E.zone.spawn; if(zs) pts.push(['zone.spawn',zs.x,zs.z]);
          for(const it of E.interactables){ if(it.exit&&it.exit.spawn){ /* spawn 在目標區域，之後再查 */ } pts.push(['it:'+(it.label||''),it.x,it.z]); }
          for(const [n,x,z] of pts){ if(!can(x,z)) out.push({zone:zid,name:n,x,z,free:nav.free(x,z)}); }
          // 各區域 exit 的目標 spawn（進入目標區域後才能查），先收集
          for(const it of E.interactables){ if(it.exit&&it.exit.spawn){ out.push({exitFrom:zid,to:it.exit.to,spawn:[it.exit.spawn.x,it.exit.spawn.z],label:it.label}); } } }
          return out; })()""")
        spawns=[x for x in r if 'exitFrom' in x]; bad=[x for x in r if 'exitFrom' not in x]
        print('blocked interactables/spawns:', bad)
        # 檢查 exit spawn 是否可站
        res=await pg.evaluate("""(async(list)=>{ const out=[]; const byZone={}; for(const s of list){ (byZone[s.to]=byZone[s.to]||[]).push(s); } for(const zid in byZone){ await GAME.enter(zid,undefined,{noFade:true}); const nav=GAME.E.nav; const r=0.32; const can=(x,z)=>nav.free(x,z)&&nav.free(x+r,z)&&nav.free(x-r,z)&&nav.free(x,z+r)&&nav.free(x,z-r); for(const s of byZone[zid]){ if(!can(s.spawn[0],s.spawn[1])) out.push({to:zid,from:s.exitFrom,spawn:s.spawn,label:s.label,center:nav.free(s.spawn[0],s.spawn[1])}); } } return out; })(%s)""" % json.dumps(spawns))
        print('blocked exit spawns:', res)
        await b.close()
asyncio.run(main())
