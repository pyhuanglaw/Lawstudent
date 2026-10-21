"""沛珊上霖澤館樓梯：每一個取樣點量兩隻手在不在裙子裡面（margin＝手的水平半徑 − 同一高度、同一方位的裙子半徑；負的＝在裡面）。
[捷徑] 讀檔、spawnCharacter、walkTo（和 tools/shots/char_motion.py 一樣）。用法：python3 skirt_probe.py 工作樹 URL 設定JSON（[[armOut 度, armBack, armFwd], ...]）"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests'); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[2]; CFG = json.loads(sys.argv[3])
SETUP = """(()=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); for(const k in GAME.npc) delete GAME.npc[k]; const n=GAME.spawnCharacter('classmate_peishan',-6.6,6.0,{yaw:Math.PI}); n.greet=false; n.frozen=false; n.beh='idle';
  window.__ps=n; void GAME.walkTo(n,-6.6,-4.6,{lv:1}); return true; })()"""
MEAS = """(()=>{ const n=window.__ps; if(!n) return null; const h=n.obj, u=h.userData; if(!u||!u.vrm) return {wait:1}; const hm=u.vrm.humanoid; h.updateWorldMatrix(true,true);
  const sk=[]; u.vrm.scene.traverse(o=>{ if(o.isSkinnedMesh&&[].concat(o.material).some(m=>/skirt/i.test(m.name||''))) sk.push(o); });
  if(!sk.length) return {noskirt:1};
  const V=new THREE.Vector3(), out={z:+h.position.z.toFixed(2), y:+h.position.y.toFixed(2)};
  const hips=hm.getRawBoneNode('hips').getWorldPosition(new THREE.Vector3()); const hl=h.worldToLocal(hips.clone());
  const PTS=[['left','leftHand'],['right','rightHand'],['lknee','leftLowerLeg'],['rknee','rightLowerLeg'],['lthigh','leftUpperLeg',0.5,'leftLowerLeg'],['rthigh','rightUpperLeg',0.5,'rightLowerLeg']];
  for(const [side,bn,t,bn2] of PTS){ let hw=hm.getRawBoneNode(bn).getWorldPosition(new THREE.Vector3()); if(bn2){ hw.lerp(hm.getRawBoneNode(bn2).getWorldPosition(new THREE.Vector3()),t); } const p=h.worldToLocal(hw.clone()); const dx=p.x-hl.x, dz=p.z-hl.z, rh=Math.hypot(dx,dz), th=Math.atan2(dz,dx);
    let rs=0, cnt=0; for(const m of sk){ const pos=m.geometry.attributes.position; for(let i=0;i<pos.count;i+=1){ m.getVertexPosition(i,V); m.localToWorld(V); const q=h.worldToLocal(V); if(Math.abs(q.y-p.y)>0.04) continue; const ex=q.x-hl.x, ez=q.z-hl.z; let dt=Math.atan2(ez,ex)-th; dt=Math.atan2(Math.sin(dt),Math.cos(dt)); if(Math.abs(dt)>0.17) continue; const r=Math.hypot(ex,ez); if(r>rs) rs=r; cnt++; } }
    out[side]={m:+(rh-rs).toFixed(3), rh:+rh.toFixed(3), rs:+rs.toFixed(3), hy:+p.y.toFixed(2), n:cnt}; }
  return out; })()"""
async def main():
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        for cfg in CFG:
            await L.load_state(pg, {'zone': 'linze', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 4.0, 'z': 4.0, 'yaw': 0, 'lv': 0}, 'flags': {'introDone': True}}, quiet_events=True)
            await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
            await pg.evaluate(SETUP)
            for _ in range(60):
                ok = await pg.evaluate("(()=>{ const n=window.__ps; return !!(n&&n.obj.userData&&n.obj.userData.vrm); })()")
                if ok: break
                await pg.wait_for_timeout(500)
            await pg.evaluate("(c=>{ const u=window.__ps.obj.userData; u.armOut=c[0]*Math.PI/180; u.armBack=c[1]; u.armFwd=c[2]; })(%s)" % json.dumps(cfg))
            rows = []
            for _ in range(90):
                r = await pg.evaluate(MEAS)
                if r and 'left' in r: rows.append(r)
                if r and r.get('z', 9) < -4.3: break
                await pg.wait_for_timeout(250)
            key = 'out%s_b%s_f%s' % tuple(cfg); worst = {s: min((x[s]['m'] for x in rows), default=None) for s in ('left', 'right')}; legmax = {s: max((x[s]['m'] for x in rows), default=None) for s in ('lknee', 'rknee', 'lthigh', 'rthigh')}
            inside = {s: sum(1 for x in rows if x[s]['m'] < 0.03) for s in ('left', 'right')}
            res[key] = {'n': len(rows), 'worst': worst, 'inside(<3cm)': inside, 'leg_outmost': legmax, 'stairs_worst': {s: min((x[s]['m'] for x in rows if x['y'] > 0.3), default=None) for s in ('left', 'right')}}
            print(key, json.dumps(res[key]), flush=True)
        await b.close()
    print(json.dumps(res))
asyncio.run(main())
