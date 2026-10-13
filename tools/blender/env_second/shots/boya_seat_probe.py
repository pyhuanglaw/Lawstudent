"""博雅 101 演講：坐著的聽眾和座位對不對（臀部離座位中心、腳離地板）。[前置／捷徑] 讀檔進博雅＋測試活動。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
URL, OUT = sys.argv[1], sys.argv[2]
JS = """(()=>{ const E=GAME.E, V=new THREE.Vector3(); const out=[];
 for(const n of E.npcs.filter(q=>q.clsStudent)){ const u=n.obj.userData||{}; const vrm=u.vrm||(u.anim&&u.anim.vrm)||(u.model&&u.model.userData&&u.model.userData.vrm)||null;
  const r={seat:{x:n.seat.x,z:n.seat.z,y:n.seat.y,row:n.seat.row,col:n.seat.col}, pos:[+n.obj.position.x.toFixed(3),+n.obj.position.y.toFixed(3),+n.obj.position.z.toFixed(3)], pose:n.pose, rotY:+n.obj.rotation.y.toFixed(3), seatYaw:n.seat.yaw};
  if(vrm){ const hm=vrm.humanoid; const W=b=>{ const nd=hm.getRawBoneNode(b); if(!nd) return null; nd.getWorldPosition(V); return [+V.x.toFixed(3),+V.y.toFixed(3),+V.z.toFixed(3)]; };
   r.hips=W('hips'); r.lFoot=W('leftFoot'); r.rFoot=W('rightFoot'); r.lToe=W('leftToes'); r.head=W('head');
   const fl=f=>f?+(f[1]-E.heightAt(f[0],f[2],n.lv|0)).toFixed(3):null; r.lFootAboveFloor=fl(r.lFoot); r.rFootAboveFloor=fl(r.rFoot);
   if(r.hips) r.hipsFromSeat=+Math.hypot(r.hips[0]-n.seat.x,r.hips[2]-n.seat.z).toFixed(3), r.hipsAboveSeatFloor=+(r.hips[1]-(n.seat.y||0)).toFixed(3); }
  else r.noVRM=true; out.push(r); } return out; })()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}); pg = await ctx.new_page(); await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'boya', 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 0, 'z': 6.8, 'yaw': 3.14, 'lv': 0}, 'flags': FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })(" + json.dumps(st) + ")")
        await pg.wait_for_timeout(4000)
        await pg.evaluate("(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); const h=G.hour%24; ACTIVITIES.list.push({id:'t_probe',title:'測試',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:[d.key],t0:h-0.1,t1:h+2,crowd:{n:16}}); CLS.syncRooms(GAME,{instant:true}); })()")
        for i in range(120):
            ok = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })")
            if ok: break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(5000)
        res = await pg.evaluate(JS)
        json.dump(res, open(OUT, 'w'), indent=1)
        css = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#nextClass{display:none!important}"
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); GAME.E.player.obj.visible=false; })(%s)" % json.dumps(css))
        for name, pos, look in (('side_rows', [-6.6, 2.4, 4.6], [-14.5, 0.9, -3.5]), ('side_back', [-6.6, 3.0, -8.2], [-14.5, 1.4, 2.0])):
            await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))
            await pg.wait_for_timeout(4000)
            await pg.screenshot(path=OUT.replace('.json', '_' + name + '.png'))
        await pg.wait_for_timeout(25000)
        res2 = await pg.evaluate(JS)
        json.dump(res2, open(OUT.replace('.json', '_t30.json'), 'w'), indent=1)
        extra = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).map(n=>{ const m=n.obj.userData&&n.obj.userData.model; return {row:n.seat.row,col:n.seat.col,frozen:n.frozen,pose:n.pose,driver:m&&m.userData&&m.userData.driver,kids:n.obj.children.length}; })")
        print('extra', json.dumps(extra), flush=True)
        for r in res2: print('t30', json.dumps({'row': r['seat']['row'], 'col': r['seat']['col'], 'hips': r.get('hipsAboveSeatFloor')}), flush=True)
        for r in res: print(json.dumps({k: r.get(k) for k in ('seat', 'pose', 'hipsFromSeat', 'hipsAboveSeatFloor', 'lFootAboveFloor', 'rFootAboveFloor', 'noVRM')}), flush=True)
        await b.close()
asyncio.run(main())
