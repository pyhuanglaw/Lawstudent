"""全部座位點底下真的有椅子（QA-W1-VISUAL，使用者 2026-10-16「這種肉眼就可以分辨的事情」）。
瀏覽器裡（GLB 正式模型都載入）逐區進去，每個座位點從上往下打射線（中心＋前後左右 7 cm，取最高；木板座椅有縫）：第一個碰到的面要在「地面＋0.30～0.65 m」（高腳椅加 lift）（椅面、長椅面）；
碰到地面（＋0.15 m 以下）＝座位底下沒有椅子（人會坐在空中）；碰到 0.65 以上＝座位被桌子、牆、樹蓋住（人會坐進東西裡）。
也檢查：從座位往前、往兩側（肩膀高度）0.45 m 內沒有樹幹、柱子、路燈、牆（長椅貼著椰子樹那種）；坐墊（floor）的座位要在坐墊頂（跪坐）。
用法：python3 tests/seats_on_furniture.py http://127.0.0.1:8765/index.html [區域 ...]  （?turbo；全部區域約 40 分鐘）
"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/index.html')+'?turbo'
ONLY=sys.argv[2:]   # 只跑這幾個區域（例：wenzhou wz_teahouse）
ZONES=['dorm','dorm_hall','campus','gongguan','wenzhou','cafe','noodle','bookstore','cvs','wz_brunch','wz_teahouse','library_hall','library','linze','classroom','wancai','gongtong','lawlib','soclib','gym']
CHECK="""()=>{ const E=GAME.E, T=THREE; const skip=new Set(); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>skip.add(o)); if(E.player&&E.player.obj) E.player.obj.traverse(o=>skip.add(o));
  const meshes=[]; E.scene.traverse(o=>{ if(!(o.isMesh||o.isInstancedMesh)||skip.has(o)) return; if(/skyline|^sky/i.test(o.name||'')) return; let p=o, vis=true; while(p){ if(p.visible===false){ vis=false; break; } p=p.parent; } if(!vis) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(m&&m.transparent&&m.opacity<0.3) return; meshes.push(o); });
  const seats=[]; const add=(s,label)=>{ if(s&&typeof s.x==='number'&&!seats.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05&&(q.lv|0)===(s.lv|0))) seats.push(Object.assign({label},s)); };
  for(const s of ((E.zone&&E.zone.seats)||[])) add(s,s.label||'');
  for(const it of (E.interactables||[])) if(it.seat) add(it.seat,it.label||'');
  const rc=new T.Raycaster(); const out=[];
  for(const s of seats){ const lv=s.lv|0; const base=s.y!=null?s.y:(E.heightAt?E.heightAt(s.x,s.z,lv):0); let hit=null; for(const [ox,oz] of [[0,0],[0.07,0],[-0.07,0],[0,0.07],[0,-0.07]]){ rc.set(new T.Vector3(s.x+ox,base+1.25,s.z+oz),new T.Vector3(0,-1,0)); rc.far=2.0; const h=rc.intersectObjects(meshes,false)[0]; if(h&&(!hit||h.distance<hit.distance)) hit=h; }   /* 屁股底下 5 條（中心＋前後左右 7 cm）取最高的：樹圍座椅是一條一條的木板，單一條會剛好穿過板縫 */
    const lift=s.lift||0; const top=hit?+(1.25-hit.distance-lift).toFixed(2):null; let near=null; const yaw=s.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw);
    for(const [dx,dz] of (/鞦韆/.test(s.label||'')?[]:[[1,0],[-1,0],[0,1],[0,-1],[0.71,0.71],[-0.71,0.71],[0.71,-0.71],[-0.71,-0.71]])){ if(dx*fx+dz*fz< -0.3) continue;   /* 鞦韆兩邊本來就是鐵鍊（0.22 m）：不查貼著 */   /* 椅背後面（牆、樹籬）不算：只看前方和兩側 */ rc.set(new T.Vector3(s.x,base+(s.floor?0.9:1.25),s.z),new T.Vector3(dx,0,dz)); rc.far=0.45; const h=rc.intersectObjects(meshes,false)[0]; if(h){ near=(h.object.name||h.object.parent&&h.object.parent.name||'?').slice(0,30)+'@'+h.distance.toFixed(2); break; } }   /* 從座位往外（肩膀高度）0.45 m 內碰到東西＝人會貼著或插進樹幹、柱子、牆（卡座旁邊 0.85 m 的牆不算）*/
    out.push({label:s.label.slice(0,20),x:+s.x.toFixed(2),z:+s.z.toFixed(2),lv,top,hitName:hit?(hit.object.name||(hit.object.parent&&hit.object.parent.name)||'').slice(0,30):'',near,floor:s.floor||0}); }
  return {zone:GAME.G.zone,n:seats.length,out}; }"""
def bad(q):   # 椅子：座面在地面＋0.30～0.65；坐墊（floor＝坐墊高度，跪坐）：坐墊頂 ±5 cm～＋15 cm
    t=q['top']
    if t is None or q['near']: return True
    if q.get('floor'): return not (q['floor']-0.05<=t<=q['floor']+0.15)
    return t<0.30 or t>0.65
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':844,'height':390},is_mobile=True,has_touch=True)
        await pg.goto(L.legacy_url(URL),wait_until='load')   # 舊開局（新遊戲預設是宿營，CAMP-L1）
        await pg.wait_for_function("typeof GAME!=='undefined'&&document.getElementById('btnNew')",timeout=120000)
        await pg.wait_for_function("(()=>{ const l=document.getElementById('loading'); return !l||l.style.display==='none'||getComputedStyle(l).display==='none'||getComputedStyle(l).opacity==='0'||l.classList.contains('hide'); })()",timeout=180000)
        await pg.wait_for_timeout(2000); await pg.evaluate("()=>document.getElementById('btnNew').click()")
        await pg.wait_for_function("GAME.G&&GAME.G.zone&&(GAME.E||{}).scene",timeout=180000); await pg.wait_for_timeout(15000)
        res=[]; nbad=0
        allz=await pg.evaluate("()=>Object.keys(Z3.ZONES)")
        zones=ONLY or (ZONES+[z for z in allz if z not in ZONES])   # 寫在 ZONES 的先跑（玩家第一週會去的），其餘區域接在後面
        for z in zones:
            try:
                if (await pg.evaluate("()=>GAME.G.zone"))!=z:
                    await pg.evaluate("(z)=>{ void GAME.enter(z) }",z); await pg.wait_for_function("(z)=>GAME.G.zone===z",arg=z,timeout=120000)
                await pg.wait_for_timeout(25000)
                r=await pg.evaluate(CHECK)
                if any(bad(q) for q in r['out']):
                    await pg.wait_for_timeout(30000); r=await pg.evaluate(CHECK)   # 正式模型可能還在載入：等一下再量一次
            except Exception as e:
                res.append({'zone':z,'err':str(e)[:160]}); continue
            probs=[q for q in r['out'] if bad(q)]
            nbad+=len(probs); res.append({'zone':z,'seats':r['n'],'problems':probs})
            print(('OK  ' if not probs else 'BAD ')+z+'：座位 '+str(r['n'])+'，有問題 '+str(len(probs)),flush=True)
            for q in probs[:40]: print('     ',json.dumps(q,ensure_ascii=False),flush=True)
        print(json.dumps({'bad':nbad},ensure_ascii=False))
        await b.close()
        sys.exit(1 if nbad else 0)
asyncio.run(main())
