import asyncio, json, sys, time, copy
sys.path.insert(0, 'tests')
from playwright.async_api import async_playwright
import playlib as L
URL=sys.argv[1]; SAVE=sys.argv[2]; TURBO=sys.argv[3]=='turbo'
class Run:
    def note(self,t): pass
async def main():
    async with async_playwright() as p:
        b,ctx,pg,cdp,errs=await L.launch(p)
        await pg.goto(URL+('?turbo' if TURBO else '')); await L.wait_loaded(pg)
        raw=json.load(open(SAVE)); st=raw.get('G',raw)
        st=copy.deepcopy(st); st['hour']=18.5
        st['events']['done'].pop('ev_y0_e14',None)
        st['outings']=[o for o in st.get('outings',[]) if o.get('id')!='y0_e14']
        st['flags']['ECONFF']['done'].pop('b1',None)
        await L.load_state(pg, st)
        await pg.evaluate("""(()=>{ window.__SB=[]; const g=GAME; const sb=g.sceneBegin, se=g.sceneEnd;
          g.sceneBegin=function(){ window.__SB.push(['B',+g.G.hour.toFixed(2),(new Error().stack||'').split('\\n').slice(2,5).join(' | ')]); return sb.apply(this,arguments); };
          g.sceneEnd=function(){ window.__SB.push(['E',+g.G.hour.toFixed(2),(new Error().stack||'').split('\\n').slice(2,4).join(' | ')]); return se.apply(this,arguments); }; })()""")
        run=Run(); t0=time.time(); last=None; stuckSince=None
        while time.time()-t0<float(sys.argv[4]):
            s=await L.state(pg)
            info=await pg.evaluate("""(()=>{ const G=GAME.G,E=GAME.E; return {d:G.day,h:+G.hour.toFixed(2),z:G.zone,e14:!!(G.events.done||{}).ev_y0_e14,busy:!!(E.player&&E.player.busy),
              Dact:!!(GAME.D&&GAME.D.active),evr:!!EVENTS.running,adv:typeof ADV!=='undefined'&&!!ADV.active,ff:!!ECONFF.busy,phone:!document.getElementById('phone').classList.contains('hide'),
              out:(OUT.get(G,'y0_e14')||{}).state||null,b1:((G.flags.ECONFF||{}).done||{}).b1||null,nB:window.__SB.filter(x=>x[0]==='B').length,nE:window.__SB.filter(x=>x[0]==='E').length}; })()""")
            k=json.dumps({x:info[x] for x in info if x not in ('nB','nE')},ensure_ascii=False)
            if k!=last: last=k; print(f"[{time.time()-t0:4.0f}s] {json.dumps(info,ensure_ascii=False)}",flush=True)
            stuck=info['busy'] and not info['Dact'] and not info['evr'] and not info['adv'] and not info['phone'] and info['e14']
            if stuck:
                stuckSince=stuckSince or time.time()
                if time.time()-stuckSince>10:
                    print('STUCK'); log=await pg.evaluate('JSON.stringify(window.__SB)'); 
                    for x in json.loads(log): print('  ',x[0],x[1],x[2][:300])
                    break
            else: stuckSince=None
            if info['phone']: await L.close_panels(pg,cdp); continue
            if s['choices'] or s['dlg']:
                await L.advance_dialogs(pg,cdp,run,lambda q: not q['dlg'] and not q['choices'],max_steps=40,step_wait=400)
            else: await pg.wait_for_timeout(800)
        else:
            print('no stuck within time'); log=await pg.evaluate('JSON.stringify(window.__SB)')
            for x in json.loads(log)[-12:]: print('  ',x[0],x[1],x[2][:200])
        print('errs',errs[:5]); await b.close()
asyncio.run(main())
