"""D40 體態第一階段：同一個位置、側面＋正面，普通／有在運動／結實／經常鍛鍊（＋誇大 6 倍看方向）。[捷徑] 讀檔到 1F 體育館、直接放玩家、路人藏起來、直接設 u.posture。
用法：python3 posture_shots.py 工作樹 URL 輸出 [pose]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; POSE = sys.argv[4] if len(sys.argv) > 4 else 'idle'
async def main():
    run = L.Run('posture', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'gym', 'hour': 15.0, 'day': day, 'weather': 'sunny', 'pos': {'x': 0.4, 'z': 7.6, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        await pg.evaluate("(()=>{ const E=GAME.E, P=E.player; for(const n of (E.npcs||[])) if(n.obj) n.obj.visible=false; P.frozen=true; P.obj.position.set(0.4,P.obj.position.y,7.6); P.obj.rotation.y=Math.PI; FIT.sync=()=>false; })()")
        sets = [('s0', 'null'), ('s1', 'FIT.POSTURE[1]'), ('s2', 'FIT.POSTURE[2]'), ('s3', 'FIT.POSTURE[3]')]
        for (vn, yaw, pitch, dist) in (('side', -math.pi / 2, 0.1, 2.6), ('front', math.pi, 0.1, 2.6)):
            for nm, expr in sets:
                await pg.evaluate(f"(()=>{{ const P=GAME.E.player; P.pose='{POSE}'; P.obj.userData.posture={expr}; GAME.E.cam.yaw={yaw}; GAME.E.cam.pitch={pitch}; GAME.E.cam.distTarget={dist}; }})()")
                await pg.wait_for_timeout(2500); await run.shot(pg, f'{vn}_{nm}')
                if vn == 'side':
                    m = await pg.evaluate("(()=>{ const P=GAME.E.player, H=P.obj.userData.vrm.humanoid, g=n=>new THREE.Vector3().setFromMatrixPosition(H.getRawBoneNode(n).matrixWorld); P.obj.updateMatrixWorld(true); const hip=g('hips'), rs=g('rightUpperArm'), ls=g('leftUpperArm'), hd=g('head'), ch=g('chest'); const right=rs.clone().sub(ls); right.y=0; right.normalize(); const fw=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),right); const f=v=>+v.clone().sub(hip).dot(fw).toFixed(4); return {shoulderFwd:+((f(rs)+f(ls))/2).toFixed(4), headFwd:f(hd), chestFwd:f(ch), shoulderW:+rs.distanceTo(ls).toFixed(4)}; })()")
                    print(nm, json.dumps(m), flush=True)
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
