import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests'); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
URL, OUT, AO = sys.argv[2], sys.argv[3], float(sys.argv[4])
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.set_viewport_size({'width': 720, 'height': 960})
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': 'linze', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 4.0, 'z': 4.0, 'yaw': 0, 'lv': 0}, 'flags': {'introDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
        await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
        await pg.evaluate("""(()=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; const n=GAME.spawnCharacter('classmate_peishan',-6.6,6.0,{yaw:Math.PI}); n.greet=false; n.frozen=false; n.beh='idle'; window.__ps=n; void GAME.walkTo(n,-6.6,-4.6,{lv:1}); })()""")
        shots = 0
        for _ in range(400):
            st = await pg.evaluate("(()=>{ const n=window.__ps; if(!n||!n.obj.userData.vrm) return null; n.obj.userData.armOut=%s*Math.PI/180; const o=n.obj.position; return {x:o.x,y:o.y,z:o.z}; })()" % AO)
            if st and ((shots == 0 and 2.05 <= st['y'] <= 2.35) or (shots == 1 and 2.9 <= st['y'] <= 3.7)):
                r = await pg.evaluate("""((p,l)=>{ const E=GAME.E; E.paused=true; E.camera.position.set(...p); E.camera.lookAt(new THREE.Vector3(...l)); E.camera.updateMatrixWorld(true); const n=window.__ps; n.obj.visible=true; E.renderer.render(E.scene,E.camera);
                  const hm=n.obj.userData.vrm.humanoid, out={}; const W=innerWidth, H=innerHeight;
                  for(const [k,b,b2] of [['LH','leftHand'],['RH','rightHand'],['LK','leftLowerLeg'],['RK','rightLowerLeg'],['LT','leftUpperLeg','leftLowerLeg'],['RT','rightUpperLeg','rightLowerLeg'],['LF','leftLowerArm'],['RF','rightLowerArm']]){ const v=hm.getRawBoneNode(b).getWorldPosition(new THREE.Vector3()); if(b2) v.lerp(hm.getRawBoneNode(b2).getWorldPosition(new THREE.Vector3()),0.5); const d=v.distanceTo(E.camera.position); v.project(E.camera); out[k]=[Math.round((v.x+1)/2*W),Math.round((1-v.y)/2*H),+d.toFixed(2)]; }
                  return out; })(%s,%s)""" % (json.dumps([st['x'] + 3.0, st['y'] + 1.0, st['z'] + 0.2]), json.dumps([st['x'], st['y'] + 0.75, st['z']])))
                await pg.wait_for_timeout(800); f = '%s_%d.png' % (OUT, shots); await pg.screenshot(path=f)
                im = Image.open(f).convert('RGB'); d = ImageDraw.Draw(im)
                for k, (x, y, dist) in r.items():
                    col = (255, 0, 0) if k[1] in 'HF' else (0, 120, 255)
                    d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=col, width=2); d.text((x + 7, y - 6), '%s %.2f' % (k, dist), fill=col)
                im.save(f.replace('.png', '_mark.png')); print(shots, json.dumps(r), flush=True)
                await pg.evaluate("GAME.E.paused=false"); shots += 1
                if shots >= 2: break
            await pg.wait_for_timeout(150)
        await b.close()
asyncio.run(main())
