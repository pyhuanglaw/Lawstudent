"""榕樹氣根為什麼是黑的：一次只改一樣東西（玩家鏡頭，舊社科院位置那棵）。[捷徑] 讀檔。
用法：python3 banyan_probe.py 工作樹 URL 輸出資料夾"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; PI = math.pi
F = {'introDone': True, 'afternoonDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True}
POSE = "(()=>{ const P=GAME.E.player.obj; P.position.x=92; P.position.z=-70; P.rotation.y=PI/2; GAME.E.cam.yaw=-PI/2; GAME.E.cam.pitch=0.22; GAME.E.cam.distTarget=6; })()".replace('PI', 'Math.PI')
async def main():
    run = L.Run('banyan_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'day': 9, 'weekday': 4, 'weather': 'sunny', 'flags': F, 'pos': {'x': 92, 'z': -70, 'yaw': 0}}, quiet_events=True)
        await pg.wait_for_timeout(12000); await L.close_panels(pg, cdp)
        await pg.evaluate(POSE); await pg.wait_for_timeout(4000); await run.shot(pg, 'a_base')
        info = await pg.evaluate("(()=>{ const r=[]; GAME.E.scene.traverse(o=>{ if(o.isInstancedMesh&&/banyan/.test(o.name)) r.push([o.name,o.count,o.material.name,o.receiveShadow, o.instanceColor?Array.from(o.instanceColor.array.slice(0,3)).map(v=>+v.toFixed(2)):null]); }); return r; })()")
        print(json.dumps(info))
        NEW = "(kind,rs)=>{ GAME.E.scene.traverse(o=>{ if(o.isInstancedMesh&&/banyan_a_leaf/.test(o.name)){ const m=o.userData._m0||(o.userData._m0=o.material); const P={map:m.map,alphaTest:0.5,side:THREE.DoubleSide}; o.material=kind==='lambert'?new THREE.MeshLambertMaterial(P):new THREE.MeshStandardMaterial(Object.assign(P,{roughness:0.62,metalness:0})); o.receiveShadow=rs; } }); }"
        for nm, args in [('b_std_noshadow', "'std',false"), ('c_lambert_shadow', "'lambert',true"), ('d_std_shadow', "'std',true")]:
            await pg.evaluate(f"({NEW})({args})"); await pg.wait_for_timeout(2500); await run.shot(pg, nm)
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
