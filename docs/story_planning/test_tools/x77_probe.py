"""BB：X77（地圖南方一直有黃點、永遠走不到）＋X71（兩點半 Café 沒有 NPC）。
[前置] 讀使用者存檔（argv[3]），[捷徑] GAME.enter 到各區域、設時間；每一區：
 - 列出大地圖會畫成黃點的人（E.npcs 不是路人），他的位置、在不在導航格可走的地方、從玩家走不走得到（E.pathTo 最後一點離他多遠）
 - 開大地圖截圖、小地圖截圖
 - Café：10、12、15、18、21 點各進去一次，數店裡的人（含路人、店員）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ZONES = os.environ.get('ZONES', 'campus,wenzhou,gongguan').split(',')
HOURS = [float(x) for x in os.environ.get('HOURS', '10,15,19').split(',')]
LIST = """(()=>{ const E=GAME.E, P=E.player.obj.position, plv=E.player.lv|0; const out=[];
  for(const n of E.npcs){ if(!n.obj) continue; const x=n.obj.position.x, z=n.obj.position.z, lv=n.lv|0;
    let reach=null, endD=null; try{ const p=E.pathTo(P.x,P.z,plv,x,z,lv); if(p&&p.length){ const q=p[p.length-1]; endD=+Math.hypot(q[0]-x,q[1]-z).toFixed(2); } else endD=-1; }catch(e){ endD=-2; }
    let stand=null; try{ stand=E.canStand?E.canStand(x,z,0.32,lv):null; }catch(e){}
    out.push({id:n.charId||'', name:n.name||'', extra:!!n.isExtra, clerk:!!n.clerk, x:+x.toFixed(1), z:+z.toFixed(1), lv, seat:!!n.seat, frozen:!!n.frozen, stand, endD, dz:+(z-P.z).toFixed(1)}); }
  const g=GUIDE._st&&GUIDE._st.tgt; return {zone:GAME.G.zone, h:+GAME.G.hour.toFixed(2), player:[+P.x.toFixed(1),+P.z.toFixed(1)], goal:GAME.G.goal, guideTgt:g?{x:+g.x.toFixed(1),z:+g.z.toFixed(1),text:g.text}:null, npcs:out}; })()"""
async def drain(pg, cdp, secs=60):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/不|晚一點|之後/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
            await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True); await pg.wait_for_timeout(800); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['busy']: await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(800)
        s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def main():
    run = L.Run('x77', OUT); rec = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀使用者存檔 ' + os.path.basename(SAVE)); await pg.wait_for_timeout(4000); await drain(pg, cdp)
        for h in HOURS:
            for zn in ZONES:
                await pg.evaluate("(h=>{ const G=GAME.G; G.hour=h; GAME.E.hour=h; })(%s)" % h)
                await pg.evaluate("void GAME.enter(%s)" % json.dumps(zn)); run.setup('[捷徑] %02d:00 GAME.enter(%s)' % (int(h), zn))
                await pg.wait_for_timeout(6000); await drain(pg, cdp, 40)
                r = await pg.evaluate(LIST); r['tag'] = '%s_%02d' % (zn, int(h)); rec.append(r)
                named = [n for n in r['npcs'] if not n['extra']]
                print('  [%s] 玩家 %s，目標「%s」導航點 %s；人 %d（黃點 %d）' % (r['tag'], r['player'], (r['goal'] or '')[:20], r['guideTgt'], len(r['npcs']), len(named)), flush=True)
                for n in r['npcs']:
                    flag = '' if (n['endD'] is not None and 0 <= n['endD'] < 1.6) else '  ← 走不到？'
                    if not n['extra'] or zn == 'cafe': print('      %s %s (%s,%s) lv%d stand=%s 路線終點離他 %s m%s' % ('黃' if not n['extra'] else ('店員' if n['clerk'] else '路人'), n['name'] or n['id'], n['x'], n['z'], n['lv'], n['stand'], n['endD'], flag), flush=True)
                await run.shot(pg, r['tag'] + '_view')
                if zn != 'cafe':
                    await pg.evaluate("(()=>{ GUIDE.openMap(); })()"); await pg.wait_for_timeout(1500); await run.shot(pg, r['tag'] + '_bigmap')
                    await pg.evaluate("(()=>{ if(GUIDE.closeMap) GUIDE.closeMap(); })()"); await pg.wait_for_timeout(600)
        json.dump(rec, open(os.path.join(OUT, 'x77_rec.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
