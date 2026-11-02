"""gate_avenue 的 draw call：剛進校園／切過 20:30 再切回 17:30／照測試一般網址那一輪的順序（11、20.5、17.5 很多次）以後。mode=formal|before（before＝測試的改之前做法）"""
import asyncio, json, sys, os
REPO, URL, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(REPO, 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles};
    let spr=0, glowOn=0; E.zone.group.traverse(o=>{ if(o.isSprite&&o.visible){ let v=true; for(let p=o;p;p=p.parent) if(!p.visible){ v=false; break; } if(v) spr++; } }); out.visSprites=spr; out.lampGlowsOn=E.lampGlows.filter(g=>g.visible).length; out.lampsOn=!!E.lampsOn;
    hid.forEach(a=>a[1].add(a[0])); E.endCinematic(); return out; })"""
GA = ((-110, 1.7, 0.5), (100, 8, 0))
STUB = ['bldg.campus_library', 'bldg.campus_gate', 'bldg.campus_male1']
DEL = ['bldg.campus_bell', 'bldg.campus_admin', 'bldg.campus_arts', 'bldg.campus_hist', 'bldg.campus_pavilion', 'bldg.campus_gongtong', 'bldg.campus_freshman', 'bldg.campus_putong', 'bldg.campus_boya']
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); await PL.wait_loaded(pg)
        if MODE == 'before':
            await pg.evaluate("(([dele,stub])=>{ for(const k of dele) delete ASSETS.manifest[k]; const o=ASSETS.loadOne; ASSETS.loadOne=function(k){ return stub.includes(k)?Promise.resolve(null):o.call(this,k); }; })(%s)" % json.dumps([DEL, STUB]))
        await pg.evaluate(SETTLED)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
        await pg.wait_for_timeout(8000); await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
        e, l = GA
        print('A fresh', json.dumps(await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))))
        await pg.evaluate("(()=>{ const E=GAME.E; E.applyTime(20.5); E.applyTime(17.5); })()")
        print('B after 20.5->17.5', json.dumps(await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))))
        await pg.evaluate("(()=>{ const E=GAME.E; for(let i=0;i<8;i++){ E.applyTime(11); E.applyTime(20.5); E.applyTime(17.5); } E.applyTime(12); E.applyTime(17.5); })()")
        print('C after many', json.dumps(await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))))
        await pg.evaluate("(()=>{ const E=GAME.E; E.applyTime(11); E.applyTime(17.5); })()")
        print('D after 11->17.5', json.dumps(await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))))
        await b.close()
asyncio.run(main())
