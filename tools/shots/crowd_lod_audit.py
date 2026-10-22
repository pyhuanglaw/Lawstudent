"""PERF-CROWD-LOD-1021（LAWWW2 2026-10-21）：校園路人的距離分布、draw call、三角形；遠距離版本開／關的同一格畫面。
[前置] 讀 9/25 存檔（tests/repro_1020/user_save_day9.json）；[捷徑] 設時間、GAME.enter('campus')、搬玩家到椰林大道（兩個位置）。
每個位置等路人底模下載完，每隔 2.5 秒取一次樣（路人會走動），每一次在「同一格」（同步、中間不跑遊戲迴圈）量：
  now＝現在的畫面（修改後：30 m 外的路人是遠距離版本）、off＝遠距離版本全部關掉（＝修改前的畫法）、none＝路人全部藏起來（路人自己佔多少）。
renderer.info 含陰影那一輪。修改前的版本沒有 CHAR.setFar：只量 now、none。
最後一次取樣另外存：整張畫面（now／off）＋每個 30 m 外路人的放大對照（左＝原本的模型、右＝遠距離版本）。
用法：python3 tools/shots/crowd_lod_audit.py <工作樹> <URL> <輸出資料夾> [時間，預設 15]"""
import os, sys, json, asyncio, base64
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
SPOTS = {'avenue_mid': (-40, 0, 1.5708), 'avenue_gate': (-104, 0, 1.5708)}   # 椰林大道中段（傅鐘旁）、大門口往東看整條大道
SAMPLES = 6
WAIT_MODELS = """(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)); const t0=performance.now();
  for(;;){ const P=CHAR.anonPool, cur=(P&&P.cur)||[]; const ok=cur.every(k=>ASSETS.has(k)); const hid=GAME.E.npcs.filter(n=>n.isExtra&&n.obj&&n.obj.userData.degradedHidden).length;
    if((ok&&!hid)||performance.now()-t0>90000) return {ok,cur:cur.length,hid,sec:Math.round((performance.now()-t0)/1000)}; await wait(1000); if(GAME.upgradeModels) GAME.upgradeModels(); } })()"""
AUDIT = """((shots)=>{ const E=GAME.E, R=E.renderer, cam=E.camera, C=CHAR;
  const ex=[]; for(const n of E.npcs){ if(n.isExtra&&n.obj) ex.push({o:n.obj,top:n.obj,kind:n.beh==='route'?'walk':'stand'}); } for(const x of E.extras){ if(x.rider&&x.obj) ex.push({o:x.rider,top:x.obj,kind:'ride'}); }
  const pos=e=>e.top.position; const dist=e=>Math.hypot(cam.position.x-pos(e).x,cam.position.z-pos(e).z);
  const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)); const sp=new THREE.Sphere();
  const inView=e=>{ sp.center.set(pos(e).x,pos(e).y+0.9,pos(e).z); sp.radius=1.3; return fr.intersectsSphere(sp); };
  const snap=()=>{ E.render(); return {calls:R.info.render.calls,tris:R.info.render.triangles}; };
  const grab=()=>R.domElement.toDataURL('image/png');
  const rows=ex.map(e=>({kind:e.kind,d:+dist(e).toFixed(1),view:inView(e),shown:shown(e.o),far:!!e.o.userData.isFar,lod:!!e.o.userData.farLOD}));
  const out={rows,hasLOD:!!C.setFar}; out.now=snap(); if(shots) out.imgNow=grab();
  if(C.setFar){ const prev=C.farOff; C.farOff=true; for(const e of ex) C.setFar(e.o,false); out.off=snap(); if(shots) out.imgOff=grab(); C.farOff=prev; for(const e of ex) if(e.o.userData.farLOD) C.setFar(e.o,dist(e)>C.FAR_OUT); }
  const v0=ex.map(e=>e.top.visible); ex.forEach(e=>e.top.visible=false); out.none=snap(); ex.forEach((e,i)=>e.top.visible=v0[i]);
  if(shots){ const w=R.domElement.width, h=R.domElement.height, v=new THREE.Vector3(); out.boxes=ex.map(e=>{ if(!e.o.userData.isFar||!shown(e.o)||!inView(e)) return null; const p=pos(e);
      v.set(p.x,p.y+1.85,p.z).project(cam); const top=[(v.x+1)/2*w,(1-v.y)/2*h]; v.set(p.x,p.y,p.z).project(cam); const bot=[(v.x+1)/2*w,(1-v.y)/2*h];
      return {d:+dist(e).toFixed(1),kind:e.kind,x:Math.round(bot[0]),y0:Math.round(top[1]),y1:Math.round(bot[1])}; }).filter(Boolean); out.size=[w,h]; }
  return out; })"""
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('crowd_lod_audit', OUT); res = {}
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(async()=>{ GAME.G.hour=%s; GAME.E.hour=%s; await GAME.enter('campus'); })()" % (HOUR, HOUR)); await pg.wait_for_timeout(12000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        wm = await pg.evaluate(WAIT_MODELS); print('models', wm, flush=True); run.setup('[捷徑] 時間 %s、進校園；路人底模 %s' % (HOUR, json.dumps(wm, ensure_ascii=False)))
        for name, (x, z, yaw) in SPOTS.items():
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y; GAME.E.cam.yaw=y+Math.PI; GAME.E.cam.manualT=0; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(6000); samples = []
            for i in range(SAMPLES):
                r = await pg.evaluate(AUDIT + "(%s)" % ('true' if i == SAMPLES - 1 else 'false'))
                for k in ('imgNow', 'imgOff'):
                    if r.get(k):
                        open(os.path.join(OUT, '%s_%s.png' % (name, 'now' if k == 'imgNow' else 'off')), 'wb').write(base64.b64decode(r[k].split(',', 1)[1])); del r[k]
                samples.append(r); print(name, i, 'extras', len(r['rows']), 'now', r['now'], 'off', r.get('off'), 'none', r['none'], flush=True)
                await pg.wait_for_timeout(2500)
            res[name] = samples
        json.dump(res, open(os.path.join(OUT, 'audit.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
