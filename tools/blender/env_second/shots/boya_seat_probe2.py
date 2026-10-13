"""博雅 101 演講的聽眾：剛出現的時候是不是已經坐好（LAWWW 8234015「座位上的人先套好坐姿再畫」之後的驗證）。
[前置／捷徑] 讀檔進博雅＋一場測試活動（遊戲的活動清單是空的）。
量三個時間點（遊戲時間）：出現後第一個畫面、1 秒、5 秒；每個聽眾：臀部離座位地面的高度（坐著約 0.45–0.6、站著 0.85 以上）、離座位中心的水平距離、姿勢。
另外：包住 E.render——聽眾在「E.update 之後、畫面之前」加進來（遊戲的課堂／人流就是這個時間點），然後在聽眾出現後的前 60 個畫面每一幀都檢查有沒有站著的聽眾被畫出來（模型還在載入的不算）。
修改前的版本應該在第一個畫面抓到站著的人（測試要在有 bug 的版本失敗）。
用法：python3 tools/blender/env_second/shots/boya_seat_probe2.py <URL> <輸出 json>"""
import asyncio, json, sys
from playwright.async_api import async_playwright
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
URL, OUT = sys.argv[1], sys.argv[2]
MEASURE = """(()=>{ const E=GAME.E, V=new THREE.Vector3(); const out=[];
 for(const n of E.npcs.filter(q=>q.clsStudent)){ const u=n.obj.userData||{}; const m=u.model; const vrm=u.vrm||(u.anim&&u.anim.vrm)||(m&&m.userData&&m.userData.vrm)||null;
  const r={pose:n.pose, pending:!!(m&&m.userData&&m.userData.driver==='pending')};
  if(vrm){ const nd=vrm.humanoid.getRawBoneNode('hips'); if(nd){ nd.getWorldPosition(V); r.hipsAboveSeat=+(V.y-(n.seat.y||0)).toFixed(3); r.hipsFromSeat=+Math.hypot(V.x-n.seat.x,V.z-n.seat.z).toFixed(3); } }
  else r.noVRM=true; out.push(r); } return out; })()"""
HOOK = """(()=>{ const E=GAME.E; window._seatLog=[]; const orig=E.render||null; let k=0; const V=new THREE.Vector3();
  const check=()=>{ if(k>=60) return; k++; let standing=0, seated=0, pending=0;
    for(const n of E.npcs.filter(q=>q.clsStudent)){ const u=n.obj.userData||{}; const m=u.model; if(m&&m.userData&&m.userData.driver==='pending'){ pending++; continue; }
      const vrm=u.vrm||(u.anim&&u.anim.vrm)||(m&&m.userData&&m.userData.vrm); if(!vrm) continue; const nd=vrm.humanoid.getRawBoneNode('hips'); if(!nd) continue; nd.getWorldPosition(V);
      if(!n.obj.visible) continue; (V.y-(n.seat.y||0)>0.75)?standing++:seated++; }
    window._seatLog.push({frame:k, t:+E.time.toFixed(2), standing, seated, pending}); };
  /* 聽眾在「E.update 之後、畫面之前」加進來（遊戲的課堂／人流就是在這個時間點加人物——LAWWW 查到的原因）：在 E.render 的開頭呼叫 syncRooms，再畫 */
  if(orig){ E.render=function(){ if(window._doSync){ window._doSync=false; CLS.syncRooms(GAME,{instant:true}); } check(); return orig.apply(this,arguments); }; return 'render hooked'; }
  const r=E.renderer, o2=r.render.bind(r); r.render=function(s,c){ check(); return o2(s,c); }; return 'renderer hooked'; })()"""


async def game_time(pg, t):
    await pg.evaluate("(async t=>{ const t0=GAME.E.time; for(let i=0;i<900&&GAME.E.time<t0+t;i++) await new Promise(r=>setTimeout(r,200)); })(%f)" % t)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await ctx.new_page(); await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'boya', 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -7.0, 'z': 6.0, 'yaw': 1.5708, 'lv': 0}, 'flags': FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(" + json.dumps(st) + ")")
        await game_time(pg, 2.0)
        # 鏡頭看著座位（聽眾都在畫面裡）
        await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })([-7.2,3.0,6.6],[-12.5,1.0,-2.5])")
        hooked = await pg.evaluate(HOOK)
        await pg.evaluate("(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); const h=G.hour%24; ACTIVITIES.list.push({id:'t_probe2',title:'測試',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:[d.key],t0:h-0.1,t1:h+2,crowd:{n:16}}); window._doSync=true; })()")
        res = {'hook': hooked}
        for i in range(60):   # 等下一個畫面把聽眾加進來
            if await pg.evaluate("!window._doSync&&GAME.E.npcs.some(n=>n.clsStudent)"): break
            await pg.wait_for_timeout(250)
        res['t0'] = await pg.evaluate(MEASURE); await pg.screenshot(path=OUT.replace('.json', '_t0.png'))
        await game_time(pg, 1.0); res['t1'] = await pg.evaluate(MEASURE)
        await game_time(pg, 4.0); res['t5'] = await pg.evaluate(MEASURE); await pg.screenshot(path=OUT.replace('.json', '_t5.png'))
        res['frames'] = await pg.evaluate("window._seatLog")
        def summ(L):
            v = [r for r in L if 'hipsAboveSeat' in r]
            return {'n': len(L), 'measured': len(v), 'standing(>0.75)': sum(1 for r in v if r['hipsAboveSeat'] > 0.75), 'pending': sum(1 for r in L if r.get('pending')),
                    'hipsAboveSeat_range': [min((r['hipsAboveSeat'] for r in v), default=None), max((r['hipsAboveSeat'] for r in v), default=None)],
                    'poses': sorted({r['pose'] for r in L if r.get('pose')})}
        res['summary'] = {k: summ(res[k]) for k in ('t0', 't1', 't5')}
        fr = res['frames'] or []
        res['summary']['frames'] = {'checked': len(fr), 'frames_with_standing': sum(1 for f in fr if f['standing'] > 0), 'max_standing': max((f['standing'] for f in fr), default=0)}
        json.dump(res, open(OUT, 'w'), indent=1, ensure_ascii=False)
        print(json.dumps(res['summary'], ensure_ascii=False))
        await b.close()

asyncio.run(main())
