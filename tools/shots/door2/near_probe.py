"""門板附近的網格（合併以後）：名字、大小、是不是 merged。用法：python3 near_probe.py 工作樹 URL 區域,區域..."""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, ZONES = sys.argv[2], sys.argv[3].split(',')
JS = """(()=>{ const E=GAME.E, it=E.interactables.find(q=>q.exit&&DOOR.kind(q,GAME.G.zone)==='push'); if(!it) return 'no exit'; const L=DOOR.findLeaf(E,it); if(!L) return 'no leaf';
  const bb=L.bb, c=bb.getCenter(new THREE.Vector3()), out=[]; const ex=bb.clone().expandByScalar(0.3);
  E.zone.group.traverse(m=>{ if(!m.isMesh||m===L.o) return; const b=new THREE.Box3().setFromObject(m); if(b.isEmpty()||!b.intersectsBox(ex)) return; const s=b.getSize(new THREE.Vector3());
    out.push([m.name||'(no name)', s.toArray().map(v=>+v.toFixed(2)), b.min.toArray().map(v=>+v.toFixed(2)), (m.material&&m.material.name)||'', m.userData&&m.userData.merged?'merged':'']); });
  return {leaf:L.o.name, bb:[bb.min.toArray().map(v=>+v.toFixed(2)),bb.max.toArray().map(v=>+v.toFixed(2))], merged:E.zone.mergedCount, near:out.slice(0,40)}; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'dorm', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(5000)
        for z in ZONES:
            await pg.evaluate("(async z=>{ await GAME.enter(z); })(%s)" % json.dumps(z)); await pg.wait_for_timeout(9000)
            r = await pg.evaluate(JS); print(z, json.dumps(r, ensure_ascii=False), flush=True)
        await b.close()
asyncio.run(main())
