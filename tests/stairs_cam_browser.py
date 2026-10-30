"""樓梯上、電梯裡的人不被上一層的樓板擋住——瀏覽器版（正式 Blender 模型）。
2026-10-11 v9.5 審查：換樓層看到天空的修正（engine3d.js updateLevelVis）讓「人在樓梯上就顯示上一層」，鏡頭高過二樓地板時，
總圖大廳的連廊與兩翼、萬才館北側走廊的樓板擋住樓梯上的人；總圖二樓樓板原本還蓋住玻璃電梯井。修正：engine3d.js 的 slabClip
（鏡頭和人的頭、腳之間隔著會畫出來的樓板時，沿視線拉近）、總圖二樓樓板挖出電梯井（備用模型＋Blender 正式模型）。
量法：遊戲裡等正式模型載入（zone.formal），沿引擎找的路線（入口 → 二樓）取樓梯上的點（腳的高度在 0.5 m 到二樓地板之間），
鏡頭四個方向、俯角 0.38／0.6，直接呼叫引擎的 E.update 讓鏡頭穩定，用 three.js Raycaster 從鏡頭打到人的腳（0.3 m）、胸（0.9 m）、頭（1.5 m）：
只算畫面上看得到的不透明網格（整層藏起來的、材質不畫的、半透明 < 0.9 的、人物不算）；打到的點在某一塊樓板的範圍與厚度裡（±5 cm）＝被樓板擋住。
三條線有兩條以上被樓板擋住＝這個鏡頭位置看不到人。電梯：game3d.js elevatorRide 的運鏡（鏡頭 (cx-3.4, y+2.6, cz+4.2) 看 (cx, y+1.2, cz)），車廂高度每 0.5 m。
同一組點也用修改前的行為（E.noSlabClip=true）量一次：總圖、萬才館一定要量得到被擋住的點（證明這個測試抓得到問題；電梯井的洞是模型改的，不在開關裡）。
截圖：修改前／後各一張（同一個位置、同一個鏡頭）。這是 Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。
用法：python3 tests/stairs_cam_browser.py http://127.0.0.1:8765/index.html?turbo [輸出資料夾]"""
import asyncio, sys, json
sys.path.insert(0, '/home/user/Lawstudent/tests')
from playwright.async_api import async_playwright
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html?turbo'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/stairs_cam_browser'

SURVEY_JS = r"""((args)=>{ const [routes,clip,pitches]=args; const E=GAME.E, P=E.player, cam=E.camera, LG=E.zone.levelGroups, Y1=LG[1].y; E.noSlabClip=!clip; E.endCinematic();
  const skip=new Set(); P.obj.traverse(o=>skip.add(o)); for(const n of E.npcs) if(n.obj) n.obj.traverse(o=>skip.add(o));
  const meshes=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&!skip.has(o)) meshes.push(o); });
  const shown=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const real=h=>{ const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.visible===false) return false; if(m.transparent&&(m.opacity==null||m.opacity<0.9)) return false; return shown(o); };
  const onSlab=p=>{ for(const s of (E.zone.slabs||[])) if(p.x>s.x0-0.05&&p.x<s.x1+0.05&&p.z>s.z0-0.05&&p.z<s.z1+0.05&&p.y>s.y-s.t-0.05&&p.y<s.y+0.05) return true; return p.y>Y1-0.4&&p.y<Y1+0.05; };
  const ray=new THREE.Raycaster(); const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const probe=()=>{ cam.updateMatrixWorld(); for(const m of meshes) m.updateMatrixWorld(); const p=P.obj.position; let slab=0, other=0, what='';
    for(const hh of [0.3,0.9,1.5]){ const q=V(p.x,p.y+hh,p.z), d=q.clone().sub(cam.position), len=d.length(); d.normalize(); ray.set(cam.position,d); ray.near=0; ray.far=len-0.05;
      const hs=ray.intersectObjects(meshes,false).filter(real); if(hs.length){ if(onSlab(hs[0].point)){ slab++; if(!what) what=(hs[0].object.name||hs[0].object.parent&&hs[0].object.parent.name||'?')+'@'+hs[0].point.toArray().map(v=>v.toFixed(2)).join(','); } else other++; } }
    return {slab,other,what}; };
  const settle=()=>{ for(let k=0;k<5;k++) E.update(0.3); };
  const out={n:0,bad:0,other:0,ex:null,worst:null};
  for(const r of routes){ const path=E.pathTo(r[0],r[1],r[2],r[3],r[4],r[5]); if(!path){ out.err=(out.err||'')+'找不到路 '+JSON.stringify(r)+'；'; continue; } const pts=[[r[0],r[1],r[2]]].concat(path.map(q=>[q[0],q[1],q[2]==null?r[5]:q[2]]));
    for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), m=Math.max(1,Math.ceil(L/0.5));
      for(let k=0;k<m;k++){ const t=k/m, x=a[0]+(b[0]-a[0])*t, z=a[1]+(b[1]-a[1])*t, lv=(t<0.5?a[2]:b[2])|0; const py=E.navOf(lv).heightAt(x,z); if(!(py>=0.5&&py<Y1-0.01)) continue;
        for(const pitch of pitches) for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){ E.placeAt(P,x,z,lv); P.path=null; P.obj.rotation.y=yaw+Math.PI; E.cam.yaw=yaw; E.cam.pitch=pitch; E.cam.manualT=0; settle();
          const pr=probe(); out.n++; if(pr.other>=2) out.other++; if(pr.slab>=2){ out.bad++; const e={x:+x.toFixed(2),z:+z.toFixed(2),lv,py:+P.obj.position.y.toFixed(2),yaw:+yaw.toFixed(2),pitch,camY:+cam.position.y.toFixed(2),hit:pr.what}; if(!out.ex) out.ex=e; if(!out.worst||pitch>out.worst.pitch) out.worst=e; } } } } }
  E.noSlabClip=false; return out; })"""

ELEV_JS = r"""((clip)=>{ const E=GAME.E, P=E.player, cam=E.camera, LG=E.zone.levelGroups, Y1=LG[1].y, el=E.zone.elev; E.noSlabClip=!clip;
  const skip=new Set(); P.obj.traverse(o=>skip.add(o)); for(const n of E.npcs) if(n.obj) n.obj.traverse(o=>skip.add(o));
  const meshes=[]; E.scene.traverse(o=>{ if(o.isMesh&&!o.isSkinnedMesh&&!skip.has(o)) meshes.push(o); });
  const shown=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const real=h=>{ const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.visible===false) return false; if(m.transparent&&(m.opacity==null||m.opacity<0.9)) return false; return shown(o); };
  const onSlab=p=>{ for(const s of (E.zone.slabs||[])) if(p.x>s.x0-0.05&&p.x<s.x1+0.05&&p.z>s.z0-0.05&&p.z<s.z1+0.05&&p.y>s.y-s.t-0.05&&p.y<s.y+0.05) return true; return p.y>Y1-0.4&&p.y<Y1+0.05; };
  const ray=new THREE.Raycaster(); const V=(x,y,z)=>new THREE.Vector3(x,y,z); const out={n:0,bad:0,ex:null};
  for(let y=0;y<=Y1+1e-6;y+=0.5){ E.placeAt(P,el.cx,el.cz,0); P.path=null; P.obj.position.y=y; E.cinematic(V(el.cx-3.4,y+2.6,el.cz+4.2),V(el.cx,y+1.2,el.cz)); E.snapCinematic(); for(let k=0;k<4;k++) E.update(0.3);
    cam.updateMatrixWorld(); for(const m of meshes) m.updateMatrixWorld(); let slab=0;
    for(const hh of [0.3,0.9,1.5]){ const q=V(el.cx,y+hh,el.cz), d=q.clone().sub(cam.position), len=d.length(); d.normalize(); ray.set(cam.position,d); ray.near=0; ray.far=len-0.05; const hs=ray.intersectObjects(meshes,false).filter(real); if(hs.length&&onSlab(hs[0].point)) slab++; }
    out.n++; if(slab>=2){ out.bad++; if(!out.ex) out.ex={y:+y.toFixed(2),camY:+cam.position.y.toFixed(2)}; } }
  E.endCinematic(); E.noSlabClip=false; return out; })"""

SHOT_JS = r"""((e,clip)=>{ const E=GAME.E, P=E.player; E.noSlabClip=!clip; E.endCinematic(); E.placeAt(P,e.x,e.z,e.lv); P.path=null; P.obj.rotation.y=e.yaw+Math.PI; E.cam.yaw=e.yaw; E.cam.pitch=e.pitch; E.cam.manualT=0; for(let k=0;k<5;k++) E.update(0.3); E.render&&E.render(); return {camY:+E.camera.position.y.toFixed(2)}; })"""

async def zone_state(zone, x, z, lv=0):
    return {'day': 3, 'weekday': 5, 'hour': 10.0, 'zone': zone, 'pos': {'x': x, 'z': z, 'yaw': 3.14, 'lv': lv},
            'flags': {'introDone': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'guideTip': True, 'fundsV2': 1, 'allowanceMonth': 9}}

async def main():
    run = L.Run('stairs_cam_browser', OUT); results = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); assert await L.wait_loaded(pg)
        plans = [
            ('library_hall', '總圖大廳', "(()=>{ const s=LIBRARY_LAYOUT.entrance.spawn; return [[s.x,s.z,0,-8.6,1.5,1],[s.x,s.z,0,8.6,1.5,1]]; })()"),
            ('wancai', '法律系館B', "(()=>{ const u=WANCAI_LAYOUT.upperDoor.spawn; return [[0,5,0,u.x,u.z,1]]; })()"),
            ('linze', '霖澤館（對照）', "(()=>{ const s=LINZE_LAYOUT.entrance.spawn; const c=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='classroom'); return c?[[s.x,s.z,0,c.x,c.z+0.3,1]]:[]; })()"),
        ]
        for zone, name, routes_js in plans:
            run.setup('讀檔：第三天 10:00 %s（事件關閉），等正式模型載入' % name)
            sp = {'library_hall': (0, 7, 0), 'wancai': (0, 5, 0), 'linze': (0, 5, 0)}[zone]
            await L.load_state(pg, await zone_state(zone, *sp), quiet_events=True)
            formal = False
            for _ in range(90):
                await pg.wait_for_timeout(1000)
                formal = await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)")
                if formal: break
            run.check('%s：正式模型載入（zone.formal）' % name, formal)
            routes = await pg.evaluate(routes_js)
            after = await pg.evaluate(SURVEY_JS, [routes, True, [0.38, 0.6]])
            before = await pg.evaluate(SURVEY_JS, [routes, False, [0.38, 0.6]])
            results[zone] = {'after': after, 'before': before}
            print(name, 'after', json.dumps(after, ensure_ascii=False)); print(name, 'before', json.dumps(before, ensure_ascii=False))
            run.check('%s：在樓梯上時被樓板擋住的鏡頭位置＝0（正式模型）' % name, after.get('n', 0) > 0 and after['bad'] == 0 and not after.get('err'),
                      '修改後 %d/%d（修改前 %d/%d）%s' % (after['bad'], after['n'], before['bad'], before['n'], ('　例：' + json.dumps(after['ex'], ensure_ascii=False)) if after.get('ex') else ''))
            if zone in ('library_hall', 'wancai'):
                ea = await pg.evaluate(ELEV_JS, True); eb = await pg.evaluate(ELEV_JS, False)
                print(name, 'elevator after', ea, 'before', eb)
                run.check('%s：電梯運鏡時車廂裡的人不被樓板擋住（正式模型）' % name, ea['n'] > 0 and ea['bad'] == 0, '修改後 %d/%d（修改前 %d/%d）' % (ea['bad'], ea['n'], eb['bad'], eb['n']))
                run.check('（測試有效）%s：修改前的行為量得到被擋住的點' % name, before['bad'] > 0, '%d/%d' % (before['bad'], before['n']))
                if before.get('worst'):
                    e = before['worst']
                    await pg.evaluate(SHOT_JS, [e, False]); await pg.wait_for_timeout(1200); await run.shot(pg, zone + '_before')
                    await pg.evaluate(SHOT_JS, [e, True]); await pg.wait_for_timeout(1200); await run.shot(pg, zone + '_after')
                    await pg.evaluate("GAME.E.noSlabClip=false")
        await ctx.close(); await b.close()
    print('errors:', errs[:3])
    run.check('沒有 JS 例外', not errs, str(errs[:2]))
    return run.finish()
sys.exit(asyncio.run(main()))
