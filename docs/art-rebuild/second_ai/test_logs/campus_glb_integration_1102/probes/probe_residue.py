"""一般網址那一輪跑完測試的 check() 以後，和剛進校園比：gate_avenue 鏡頭每個頂層群組畫了幾次（主畫面＋陰影）。用法：python3 probe_residue.py <repo> <URL>"""
import asyncio, json, sys, os
REPO, URL = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(REPO, 'tests'))
src = open(os.path.join(REPO, 'tests', 'campus_glb_integration.py'), encoding='utf8').read()
src = src[:src.rindex('asyncio.run(main())')]
NS = {'__file__': os.path.join(REPO, 'tests', 'campus_glb_integration.py'), '__name__': 'cgi'}
exec(compile(src, 'cgi', 'exec'), NS)
PL = NS['PL']
from playwright.async_api import async_playwright
HOOK = """(()=>{ const E=GAME.E; const top=o=>{ let p=o; while(p&&p.parent&&p.parent!==E.zone.group&&p.parent!==E.scene) p=p.parent; return (p&&p.parent===E.zone.group)?(p.name||p.type+(p.userData&&p.userData.ckTag?':'+p.userData.ckTag:'')):'scene:'+((p&&p.name)||(p&&p.type)); };
  window.__cnt={}; E.scene.traverse(o=>{ if(!(o.isMesh||o.isSprite||o.isPoints||o.isLine)) return; const k=top(o); o.onBeforeRender=function(){ if(window.__on) window.__cnt[k]=(window.__cnt[k]||0)+1; }; }); return true; })()"""
MEAS = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+3;i++) await new Promise(r=>setTimeout(r,250)); window.__cnt={}; window.__on=true; const f1=E.frame; for(let i=0;i<240&&E.frame<f1+1;i++) await new Promise(r=>setTimeout(r,100)); window.__on=false;
    const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, frames:E.frame-f1, cnt:window.__cnt}; hid.forEach(a=>a[1].add(a[0])); E.endCinematic(); return out; })"""
GA = ((-110, 1.7, 0.5), (100, 8, 0))
class R:
    def setup(self, s): pass
    def check(self, n, ok, info=''): pass
    def note(self, s): pass
    async def shot(self, pg, label): pass
async def main():
    out = {}
    async with async_playwright() as p:
        for mode in ('fresh', 'aftercheck'):
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(URL); await PL.wait_loaded(pg)
            if mode == 'fresh':
                await pg.evaluate(NS['SETTLED'])
                await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
                await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
                for t, (k, g, _) in NS['TAGS'].items(): await pg.evaluate(NS['WAIT_FORMAL'] % g)
                await pg.evaluate(NS['SETTLED']); await pg.wait_for_timeout(3000)
            else:
                NS['VIEWS'][:] = NS['VIEWS'][:1]   # 只量第一個（gate_avenue），其他照測試
                await NS['check'](pg, R(), True)
            await pg.evaluate(HOOK)
            m = await pg.evaluate(MEAS + '(%s,%s)' % (json.dumps(GA[0]), json.dumps(GA[1])))
            out[mode] = m; print(mode, m['calls'], m['tris'], 'frames', m['frames'], flush=True)
            await b.close()
    a, c = out['fresh']['cnt'], out['aftercheck']['cnt']
    for k in sorted(set(a) | set(c), key=lambda k: -(c.get(k, 0) - a.get(k, 0))):
        if a.get(k, 0) != c.get(k, 0): print('DIFF', k, a.get(k, 0), '->', c.get(k, 0))
asyncio.run(main())
