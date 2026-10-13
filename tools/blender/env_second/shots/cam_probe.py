"""鏡頭案例的細查：照 cam_cases_shots.py 的方式把玩家放到案例位置、鏡頭轉到案例方向，然後列出
① 鏡頭在哪些看得見的網格的包圍盒裡（近平面切進牆或家具時，畫面會有一大塊黑）
② 頭→鏡頭這條線上（含鏡頭後面 0.5 m）打到的看得見的網格（名稱、距離、材質）
③ 鏡頭附近 0.6 m 內的看得見表面（26 個方向的射線，最近的距離與網格）
用法：python3 tools/blender/env_second/shots/cam_probe.py <URL> <輸出資料夾> <cases.json> <id> [<id>...]"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
URL, OUT, CASES = sys.argv[1:4]; IDS = sys.argv[4:]
os.makedirs(OUT, exist_ok=True)
PROBE = """(()=>{ const E=GAME.E, cam=E.camera, c=cam.position.clone(), t=(E.cam.target||E.player.obj.position).clone();
  const vis=[]; E.scene.traverse(o=>{ if(!o.isMesh) return; let v=true, p=o; while(p){ if(p.visible===false){ v=false; break; } p=p.parent; } if(!v) return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.visible===false) return; vis.push(o); });
  const nm=o=>{ const m=Array.isArray(o.material)?o.material[0]:o.material; const path=[]; let p=o; for(let i=0;i<3&&p;i++){ if(p.name) path.push(p.name); p=p.parent; }
    return {name:path.join('<')||'(無名)', mat:m&&m.name||'', color:m&&m.color?'#'+m.color.getHexString():'', opacity:m?+(+m.opacity).toFixed(2):1, transparent:!!(m&&m.transparent), side:m?m.side:0}; };
  const inside=[]; const bb=new THREE.Box3(); for(const o of vis){ if(o.isInstancedMesh||o.isSkinnedMesh) continue; bb.setFromObject(o); if(bb.containsPoint(c)){ const sz=bb.getSize(new THREE.Vector3()); if(sz.x>30&&sz.z>30) continue; inside.push(Object.assign(nm(o),{box:[bb.min.toArray().map(v=>+v.toFixed(2)),bb.max.toArray().map(v=>+v.toFixed(2))]})); } }
  const rc=new THREE.Raycaster(); const dir=c.clone().sub(t); const L=dir.length(); dir.normalize(); rc.set(t,dir); rc.far=L+0.5;
  const line=rc.intersectObjects(vis,false).filter(h=>!h.object.isSkinnedMesh).slice(0,8).map(h=>Object.assign(nm(h.object),{d:+h.distance.toFixed(2),pastCam:h.distance>L}));
  const near=[]; for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++) for(let k=-1;k<=1;k++){ if(!i&&!j&&!k) continue; const d=new THREE.Vector3(i,j,k).normalize(); rc.set(c,d); rc.far=0.6; rc.near=0; const h=rc.intersectObjects(vis,false).filter(h=>!h.object.isSkinnedMesh)[0]; if(h) near.push(Object.assign(nm(h.object),{dir:[i,j,k],d:+h.distance.toFixed(2)})); }
  near.sort((a,b)=>a.d-b.d);
  return {cam:c.toArray().map(v=>+v.toFixed(2)), head:t.toArray().map(v=>+v.toFixed(2)), near:cam.near, camDist:+L.toFixed(2), inside, line, nearest:near.slice(0,6)}; })()"""


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def load(pg, zone, x, z, lv, yaw):
    st = {'zone': zone, 'hour': 10.0, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'lv': lv, 'yaw': yaw}, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(" + json.dumps(st) + ")")
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    for i in range(80):
        if await pg.evaluate("(()=>{ const m=GAME.E.player.obj.userData&&GAME.E.player.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; })()"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500); await frames(pg, 4)


async def main():
    cases = {c['id']: c for c in json.load(open(CASES))}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        res = {}
        for cid in IDS:
            c = cases[cid]
            await load(pg, c['zone'], c['x'], c['z'], c['lv'], c['yaw'] + 3.1416)
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=y; C.manualT=999; })(%f)" % c['yaw'])
            await pg.wait_for_timeout(2500); await frames(pg, 8)
            r = await pg.evaluate(PROBE); res[cid] = r
            await pg.screenshot(path=f'{OUT}/{cid}.png'); print(cid, json.dumps(r, ensure_ascii=False)[:1500], flush=True)
        json.dump(res, open(f'{OUT}/probe.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()


asyncio.run(main())
