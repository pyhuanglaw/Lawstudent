"""開門第二階段截圖：各區域真的按出入口（推門＋門板轉開），在推門的時間點停住截圖（[捷徑] 讀檔、直接放到門口、把推門那一刻凍結：設 DOOR.T_SWING 很短、攔下 GAME.enter 一次）。
再按一次真的換區域。用法：python3 swing_shots.py 工作樹 URL 輸出 zone:label;zone:label"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; SPEC = [x.split(':', 1) for x in sys.argv[4].split(';')]
async def main():
    run = L.Run('door_swing', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        for z, lab in SPEC:
            await L.load_state(pg, {'zone': z, 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True)
            await pg.wait_for_timeout(15000); await L.close_panels(pg, cdp)
            await L.advance_dialogs(pg, cdp, run, lambda s: not s['busy'], max_steps=30)
            r = await pg.evaluate("""(lab=>{ const E=GAME.E, it=E.interactables.find(q=>{ try{ return String(q.label)===lab; }catch(e){ return false; } }); if(!it) return null; const L=DOOR.findLeaf(E,it); if(!L) return {it:[it.x,it.z],leaf:null};
              const bb=L.bb, c=bb.getCenter(new THREE.Vector3()), alongX=(bb.max.x-bb.min.x)>=(bb.max.z-bb.min.z); const n=alongX?[0,1]:[1,0]; let best=null;
              for(const sgn of [1,-1]){ const x=c.x+n[0]*1.0*sgn, zz=c.z+n[1]*1.0*sgn; if(E.canStand(x,zz,0.3,0)&&(!best||Math.hypot(x-it.x,zz-it.z)<Math.hypot(best[0]-it.x,best[1]-it.z))) best=[x,zz]; }
              if(!best) return {leaf:L.o.name, stand:false}; const P=E.player; P.obj.position.set(best[0],P.obj.position.y,best[1]); P.obj.rotation.y=Math.atan2(c.x-best[0],c.z-best[1]);
              E.cam.yaw=P.obj.rotation.y+Math.PI+0.5; E.cam.pitch=0.15; E.cam.distTarget=2.8; for(const q of (E.npcs||[])) if(q.obj) q.obj.visible=false; window.__it=it; return {leaf:L.o.name, at:best, it:[it.x,it.z]}; })(%s)""" % json.dumps(lab))
            print(z, json.dumps(r, ensure_ascii=False), flush=True)
            if not r or not r.get('at'): continue
            await pg.wait_for_timeout(3000); await run.shot(pg, z + '_before')
            await pg.evaluate("(()=>{ window.__enter0=GAME.enter; GAME.enter=async()=>{}; DOOR.open(GAME,window.__it); })()")   # [捷徑] 攔下換區域：停在推門、門開的那一刻
            await pg.wait_for_timeout(3500)
            st = await pg.evaluate("(()=>{ const p=GAME.E.scene.getObjectByName('door_pivot'), c=GAME.E.scene.getObjectByName('door_beyond_card'); return {rot:p?+p.rotation.y.toFixed(2):null, card:!!c}; })()")
            print(z, 'open', json.dumps(st), flush=True)
            await run.shot(pg, z + '_open')
            await pg.evaluate("(()=>{ GAME.enter=window.__enter0; })()")
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
