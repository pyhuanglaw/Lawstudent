"""事件煙霧測試：對每個 STORY_EVENT 直接 run()，自動推進對話，兩種選項策略（第一個／最後一個），回報錯誤。
用法：python3 evtest.py [ids...]"""
import asyncio, sys, json, time
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html?turbo&lowres'
DRIVER=r"""
window.__sleep=ms=>new Promise(r=>setTimeout(r,ms)); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false;
window.__drive=async function(evId,strategy){
  const ev=STORY_EVENTS.find(e=>e.id===evId); if(!ev) return {err:'no event'};
  const errs=[]; const orig=console.error; console.error=function(){ errs.push(Array.from(arguments).map(a=>a&&a.stack||String(a)).join(' ')); orig.apply(console,arguments); };
  const loc=Array.isArray(ev.location)?ev.location[0]:(ev.location||GAME.G.zone);
  if(loc&&loc!=='any'&&GAME.G.zone!==loc){ await GAME.enter(loc,undefined,{noFade:true}); await __sleep(600); }
  const t0=performance.now(); let lines=0, choices=0; const seen=[];
  const p=EVENTS.run(ev);
  let guard=0;
  while(EVENTS.running===ev.id||EVENTS.running){ await __sleep(40); if(++guard>4000){ errs.push('TIMEOUT '+evId); break; }
    if(GAME.D.active){ lines++; if(seen.length<200) seen.push((document.getElementById('dlgName').textContent||'')+'：'+GAME.D.full); GAME.dlgAdvance(); await __sleep(15); GAME.dlgAdvance(); continue; }
    const ch=document.getElementById('choices'); if(!ch.classList.contains('hide')){ const b=ch.querySelectorAll('button'); if(b.length){ choices++; const i=strategy==='last'?b.length-1:(strategy==='mid'?Math.floor(b.length/2):0); seen.push('▶'+b[i].innerText.replace(/\n/g,' | ')); b[i].click(); await __sleep(60); } }
  }
  try{ await p; }catch(e){ errs.push('REJECT '+e); }
  console.error=orig;
  return {lines,choices,ms:Math.round(performance.now()-t0),errs,adv:ADV.active,busy:GAME.E.player.busy,dlg:GAME.D.active,seen};
};
"""
def state():
    return {'day':14,'weekday':2,'hour':10.0,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':-1.5708},'weather':'rain','money':800,'energy':70,
     'flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'crimpro_attended':True,'ball_invite':True,'yutong_hospital':True,'grad_reading':True},
     'visited':{'dorm':True,'campus':True,'library':True,'cafe':True,'gongguan':True,'wenzhou':True,'classroom':True,'wancai':True,'noodle':True},
     'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'CONSIDERING','field':'公法','prep':0}}}
async def main(ids):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        await pg.evaluate(DRIVER)
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(state(),ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        # 建立關係／記憶讓分支都可到達
        await pg.evaluate("""(()=>{ const ids=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','zhe','yu','kai','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_youchen','classmate_peishan','npc_ta_chen','prof_zhou','prof_lin','prof_xu']; for(const id of ids){ SOCIAL.adjust(id,{fam:40,trust:25,aff:10,comf:20,resp:10}); SOCIAL.remember(id,'FIRST_MET','test'); } SOCIAL.remember('heroine_01','CAFE_AFTERNOON','x'); SOCIAL.remember('heroine_02','SHARED_SECRET','x'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); SOCIAL.remember('heroine_03','TALKED_FAMILY','x'); SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','x'); SOCIAL.remember('heroine_05','IMPORTANT_CONVERSATION','x'); SOCIAL.remember('heroine_05','GRAD_SCHOOL_DISCUSSION','x'); SOCIAL.remember('classmate_xinci','LENT_NOTES','x'); })()""")
        all_ids=await pg.evaluate("STORY_EVENTS.map(e=>e.id)")
        if not ids: ids=all_ids
        report=[]
        for evid in ids:
            for strat in ('first','last'):
                before=len(msgs)
                try:
                    r=await asyncio.wait_for(pg.evaluate(f"__drive({json.dumps(evid)},{json.dumps(strat)})"),timeout=120)
                except Exception as e:
                    r={'errs':['EXC '+str(e)],'lines':0,'choices':0,'ms':0,'seen':[]}
                    await pg.evaluate("EVENTS.running=null; ADV.end(); GAME.sceneEnd();")
                new=msgs[before:]
                bad=[m for m in new if ('error' in m.lower() or 'PAGEERROR' in m) and '404' not in m and 'ERR_TUNNEL' not in m]
                r['console']=bad
                ok=not r['errs'] and not bad and not r.get('adv') and not r.get('busy') and not r.get('dlg')
                print(('OK ' if ok else 'BAD'),evid,strat,f"lines={r['lines']} choices={r['choices']} {r['ms']}ms",('' if ok else json.dumps({k:r[k] for k in ('errs','console','adv','busy','dlg') if k in r},ensure_ascii=False)))
                if not ok:
                    for s in r.get('seen',[])[-6:]: print('     ',s[:90])
                report.append((evid,strat,ok))
                # 事件之間重設冷卻，讓 once/cooldown 不影響（run 不檢查，但 next_event 會）
                await pg.evaluate("(()=>{ GAME.G.events.done={}; GAME.G.events.last={}; if(GAME.E.player.seat) GAME.standUp(GAME.E.player); })()")
                await pg.wait_for_timeout(150)
        print('TOTAL',len(report),'bad',sum(1 for r in report if not r[2]))
        for m in msgs[:30]: print(m)
        await b.close()
asyncio.run(main(sys.argv[1:]))
