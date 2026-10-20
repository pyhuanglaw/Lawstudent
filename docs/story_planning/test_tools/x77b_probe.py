"""BB：X77 第二步。[前置] 讀存檔、[捷徑] GAME.enter('campus')。每一個互動點（門、入口標記、活動點）：站不站得住、
用引擎真的移動模擬（E.simWalk）從校園出生點和宿舍門口走過去，最後離互動點多遠、有沒有進到互動範圍。另外把幾個南邊的目標設成導航目的地，截小地圖與大地圖。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
CHECK = """(()=>{ const E=GAME.E, out=[]; const starts=[['出生點',E.zone.spawn||{x:0,z:0}],['宿舍門口',(E.interactables.find(i=>i.exit&&i.exit.to==='dorm')||{})]];
  for(const it of E.interactables){ const lv=it.lv|0; let st=null; try{ st=E.canStand(it.x,it.z,0.32,lv); }catch(e){}
    const res=[]; for(const [nm,s] of starts){ if(s.x==null) continue; let r=null; try{ r=E.simWalk(s.x,s.z,it.x,it.z,{lv0:0,lv1:lv}); }catch(e){ r={ok:false,reason:String(e)}; }
      const d=r&&r.x!=null?+Math.hypot(r.x-it.x,r.z-it.z).toFixed(2):null; res.push({from:nm, ok:!!(r&&r.ok), reason:r&&r.reason||'', end:d, inRange:d!=null&&d<=(it.radius||1.2)}); }
    out.push({label:it.label||'', exit:it.exit?it.exit.to:'', mark:!!it.mark, x:+it.x.toFixed(1), z:+it.z.toFixed(1), lv, r:it.radius||null, stand:st, res}); }
  return out; })()"""
async def main():
    run = L.Run('x77b', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀存檔'); await pg.wait_for_timeout(4000)
        for i in range(30):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(600); continue
            break
        await pg.evaluate("(()=>{ GAME.G.hour=10; GAME.E.hour=10; })()"); await pg.evaluate("void GAME.enter('campus')"); run.setup('[捷徑] 10:00 GAME.enter(campus)'); await pg.wait_for_timeout(8000)
        res = await pg.evaluate(CHECK); json.dump(res, open(os.path.join(OUT, 'campus_interact.json'), 'w'), ensure_ascii=False, indent=1)
        bad = [q for q in res if not all(r['inRange'] for r in q['res'])]
        print('互動點 %d 個，走不到互動範圍的 %d 個：' % (len(res), len(bad)), flush=True)
        for q in bad: print('   %s%s (%s,%s) lv%d 站得住=%s %s' % (q['label'], ('→'+q['exit']) if q['exit'] else '', q['x'], q['z'], q['lv'], q['stand'], json.dumps(q['res'], ensure_ascii=False)), flush=True)
        south = sorted(res, key=lambda q: -q['z'])[:6]
        print('最南邊的 6 個：', json.dumps([(q['label'], q['x'], q['z']) for q in south], ensure_ascii=False), flush=True)
        for gl, dest in [('共同教學館：大一國文', {'zone': 'campus', 'label': '共同教學館', 'name': '共同教學館'}), ('體育館：體育', {'zone': 'campus', 'label': '體育館', 'name': '體育館'})]:
            await pg.evaluate("(a=>{ GAME.setGoal(a[0],a[1]); })(%s)" % json.dumps([gl, dest])); await pg.wait_for_timeout(3500)
            t = await pg.evaluate("(()=>{ const g=GUIDE._st.tgt; return g?{x:+g.x.toFixed(1),z:+g.z.toFixed(1),text:g.text}:null; })()"); print('  目標「%s」→ 導航點 %s' % (gl, t), flush=True)
            await run.shot(pg, 'goal_' + dest['label'])
            await pg.evaluate("(()=>{ GUIDE.openMap(); })()"); await pg.wait_for_timeout(1500); await run.shot(pg, 'goal_' + dest['label'] + '_bigmap')
            await pg.evaluate("(()=>{ if(GUIDE.closeMap) GUIDE.closeMap(); })()"); await pg.wait_for_timeout(600)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
