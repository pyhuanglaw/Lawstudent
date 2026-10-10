"""室內鏡頭遮擋（v9.4 #16）：玩家站在已知的位置、鏡頭在背後（一般跟隨鏡頭），從鏡頭到人物的頭、胸口、腰（各左中右）打 9 條射線，
3 條以上不能有「看得到、不透明」的東西（淡出到 0.5 以下的牆、玻璃、點地面用的隱形地板不算）。
曾經的 bug：霖澤館大廳剛進門時兩扇深色自動門擋住人物；201 最上排鏡頭在後牆外、後門擋住人物（門與框合併進一般材質，不會跟著牆淡出）。
[前置] 用讀檔把玩家放到位置（不是測走路）。
用法：python3 tests/indoor_camera_occlusion.py URL
舊版重現：GLB_SWAP="assets/models/env/linze_interior.glb=舊檔;assets/models/env/classroom_201.glb=舊檔" python3 tests/indoor_camera_occlusion.py URL"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/indoor_camera_occlusion'
CASES = [('霖澤館大廳：剛進門（面向大廳，鏡頭在入口外）', 'linze', 6.6, 4.0, 0, -1.5708),
         ('霖澤館大廳：靠南面帷幕、面向北', 'linze', 0.0, 5.6, 0, 3.14159),
         ('霖澤館二樓迴廊：201 門口、面向南（鏡頭在北牆外）', 'linze', -2.0, -5.6, 1, 0.0),
         ('201：從後門進來（面向講台，鏡頭在後牆外）', 'classroom', 0.0, 7.0, 0, 3.14159),
         ('201：最上排西側走道', 'classroom', -5.25, 7.3, 0, 3.14159)]
PROBE = r"""(()=>{ const E=GAME.E, P=E.player; const cam=E.camera; cam.updateMatrixWorld(true); E.scene.updateMatrixWorld(true);
  const vis=(o)=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const isPlayer=(o)=>{ for(let p=o;p;p=p.parent) if(p===P.obj) return true; return false; };
  const out=[]; const rc=new THREE.Raycaster(); const side=new THREE.Vector3().subVectors(P.obj.position,cam.position); side.y=0; side.normalize(); side.set(-side.z,0,side.x);
  for(const h of [1.5,1.1,0.6]) for(const s of [-0.2,0,0.2]){ const t=P.obj.position.clone().addScaledVector(side,s); t.y+=h; const d=t.clone().sub(cam.position); const len=d.length(); rc.set(cam.position,d.normalize()); rc.far=len-0.05;
    const hits=rc.intersectObjects(E.scene.children,true);
    for(const x of hits){ const o=x.object; if(!o.isMesh||isPlayer(o)||!vis(o)) continue; const mats=[].concat(o.material); const m=mats[(x.face&&x.face.materialIndex)||0]||mats[0]; if(!m||m.visible===false) continue;
      const op=m.transparent?(m.opacity==null?1:m.opacity):1; if(op<0.5) continue; out.push({h, s, name:o.name||o.parent&&o.parent.name||'?', mat:m.name||'', d:+x.distance.toFixed(2), op:+op.toFixed(2)}); break; } }
  return {blocked:out, cam:cam.position.toArray().map(v=>+v.toFixed(2)), p:P.obj.position.toArray().map(v=>+v.toFixed(2)), formal:!!(E.zone&&E.zone.formal), walls:E.zone&&E.zone.walls?E.zone.walls.length:null }; })()"""


async def main():
    os.makedirs(OUT, exist_ok=True); fails = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        for pair in filter(None, os.environ.get('GLB_SWAP', '').split(';')):
            u, f = pair.split('=', 1); body = open(f, 'rb').read()
            await pg.route('**/' + u, (lambda b_: (lambda route: route.fulfill(status=200, body=b_, headers={'Content-Type': 'model/gltf-binary'})))(body))
            print('swap', u, '->', f, flush=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for i, (name, zone, x, z, lv, yaw) in enumerate(CASES):
            await L.load_state(pg, {'zone': zone, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': lv},
                                    'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}}, quiet_events=True)
            for k in range(30):   # 等正式模型（GLB）接上
                if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
                await pg.wait_for_timeout(500)
            await pg.evaluate("(()=>{ const E=GAME.E; E.npcs.slice().forEach(n=>E.removeNPC(n)); E.recenter(); E.cam.manualT=0; })()")
            await pg.wait_for_timeout(3500)
            r = await pg.evaluate(PROBE)
            await pg.screenshot(path=f'{OUT}/{i:02d}_{zone}.png')
            ok = len(r['blocked']) < 3   # 9 條射線（頭、胸、腰 × 左、中、右）：3 條以上被不透明的東西擋住＝人物被遮住
            print(('PASS ' if ok else 'FAIL ') + name, json.dumps(r, ensure_ascii=False), flush=True)
            if not ok: fails.append(name)
        print('PASS 沒有 JS 例外' if not errs else 'FAIL JS 例外 ' + str(errs[:3]))
        if errs: fails.append('JS')
        await b.close()
    print('ALL PASS' if not fails else 'FAILED: ' + ', '.join(fails))
    sys.exit(1 if fails else 0)

asyncio.run(main())
