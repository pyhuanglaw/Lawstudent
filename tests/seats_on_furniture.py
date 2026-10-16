"""全部座位點底下真的有椅子（QA-W1-VISUAL，使用者 2026-10-16「這種肉眼就可以分辨的事情」）。
瀏覽器裡（GLB 正式模型都載入）逐區進去，每個座位點從上往下打一條射線：第一個碰到的面要在「地面＋0.30～0.65 m」（椅面、長椅面）；
碰到地面（＋0.15 m 以下）＝座位底下沒有椅子（人會坐在空中）；碰到 0.65 以上＝座位被桌子、牆、樹蓋住（人會坐進東西裡）。
也檢查：座位點 0.9 m 內沒有樹幹、柱子、路燈這類「從地面一路到 1.5 m 以上」的東西（長椅貼著椰子樹那種）。
用法：python3 tests/seats_on_furniture.py http://127.0.0.1:8765/index.html  （?turbo；約 10 分鐘）
"""
import asyncio, json, sys
from playwright.async_api import async_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/index.html')+'?turbo'
ZONES=['dorm','dorm_hall','campus','gongguan','wenzhou','cafe','noodle','bookstore','cvs','wz_brunch','wz_teahouse','library_hall','library','linze','classroom','wancai','gongtong','lawlib','soclib','gym']
CHECK="""()=>{ const E=GAME.E, T=THREE; const skip=new Set(); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>skip.add(o)); if(E.player&&E.player.obj) E.player.obj.traverse(o=>skip.add(o));
  const meshes=[]; E.scene.traverse(o=>{ if(!(o.isMesh||o.isInstancedMesh)||skip.has(o)) return; let p=o, vis=true; while(p){ if(p.visible===false){ vis=false; break; } p=p.parent; } if(!vis) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(m&&m.transparent&&m.opacity<0.3) return; meshes.push(o); });
  const seats=[]; const add=(s,label)=>{ if(s&&typeof s.x==='number'&&!seats.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05&&(q.lv|0)===(s.lv|0))) seats.push(Object.assign({label},s)); };
  for(const s of ((E.zone&&E.zone.seats)||[])) add(s,s.label||'');
  for(const it of (E.interactables||[])) if(it.seat) add(it.seat,it.label||'');
  const rc=new T.Raycaster(); const out=[];
  for(const s of seats){ const lv=s.lv|0; const base=s.y!=null?s.y:(E.heightAt?E.heightAt(s.x,s.z,lv):0); rc.set(new T.Vector3(s.x,base+1.25,s.z),new T.Vector3(0,-1,0)); rc.far=2.0; const hit=rc.intersectObjects(meshes,false)[0];
    const top=hit?+(base+1.25-hit.distance-base).toFixed(2):null; let near=null;
    for(const [dx,dz] of [[0.9,0],[-0.9,0],[0,0.9],[0,-0.9],[0.64,0.64],[-0.64,0.64],[0.64,-0.64],[-0.64,-0.64]]){ rc.set(new T.Vector3(s.x+dx,base+1.5,s.z+dz),new T.Vector3(-dx,0,-dz).normalize()); rc.far=0.9; const h=rc.intersectObjects(meshes,false)[0]; if(h&&h.distance<0.5){ near=(h.object.name||h.object.parent&&h.object.parent.name||'?').slice(0,30)+'@'+h.distance.toFixed(2); break; } }
    out.push({label:s.label.slice(0,20),x:+s.x.toFixed(2),z:+s.z.toFixed(2),lv,top,hitName:hit?(hit.object.name||(hit.object.parent&&hit.object.parent.name)||'').slice(0,30):'',near}); }
  return {zone:GAME.G.zone,n:seats.length,out}; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':844,'height':390},is_mobile=True,has_touch=True)
        await pg.goto(URL,wait_until='load')
        await pg.wait_for_function("typeof GAME!=='undefined'&&document.getElementById('btnNew')",timeout=120000)
        await pg.wait_for_timeout(2000); await pg.click('#btnNew')
        await pg.wait_for_function("GAME.G&&GAME.G.zone&&(GAME.E||{}).scene",timeout=180000); await pg.wait_for_timeout(15000)
        res=[]; bad=0
        for z in ZONES:
            try:
                if (await pg.evaluate("()=>GAME.G.zone"))!=z:
                    await pg.evaluate("(z)=>{ void GAME.enter(z) }",z); await pg.wait_for_function("(z)=>GAME.G.zone===z",arg=z,timeout=120000)
                await pg.wait_for_timeout(20000)
                r=await pg.evaluate(CHECK)
            except Exception as e:
                res.append({'zone':z,'err':str(e)[:160]}); continue
            probs=[q for q in r['out'] if q['top'] is None or q['top']<0.30 or q['top']>0.65 or q['near']]
            bad+=len(probs); res.append({'zone':z,'seats':r['n'],'problems':probs})
            print(('OK  ' if not probs else 'BAD ')+z+'：座位 '+str(r['n'])+'，有問題 '+str(len(probs)),flush=True)
            for q in probs[:40]: print('     ',json.dumps(q,ensure_ascii=False),flush=True)
        print(json.dumps({'bad':bad},ensure_ascii=False))
        await b.close()
        sys.exit(1 if bad else 0)
asyncio.run(main())
