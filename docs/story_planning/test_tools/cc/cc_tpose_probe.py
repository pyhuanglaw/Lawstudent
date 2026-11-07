"""CC-B（帳號 B）11-07：WZ_TPOSE（BB-B 13:29）——溫州街 A1 阿德影印門口往東看，背景路人 T 字站姿（雲端 8fdb294aa 看到）。
【前置／捷徑】讀檔進 wenzhou 2025-10-18 11:00（條件事件關閉）；鏡頭用新 CAM（照 cc_wz_dc_probe 的 TARGETS A1 同一個找角度法）。
讀檔後 5、20、60 秒（中間遊戲照常跑）各拍一張，每張印畫面裡每個 NPC：id、charId、位置、beh、pose、正在播的動作（action 名稱、weight、running）、
模型 url、driver、是不是 placeholder／fallback／遠距離 LOD；整區 NPC 裡「沒有任何 action 在播」的另外列出來。判定＝BB。
用法：LW_TESTS=<wt>/tests python3 cc_tpose_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('tpose', OUT); D.setup(R, OUT)
ZONE = os.environ.get('ZONE') or 'wenzhou'; DAY = os.environ.get('DAY') or '2025-10-18'; H = float(os.environ.get('HOUR') or 11)
TARGET = [float(x) for x in (os.environ.get('TARGET') or '-8,2.2,4.6').split(',')]
TIMES = [int(x) for x in (os.environ.get('AT') or '0,5,20,60').split(',')]

CLEAR = r"""((o)=>{ const z=GAME.E.zone; const meshes=[]; z.group.traverse(q=>{ if(q.isMesh&&q.visible&&!/VIEW|sky/i.test(q.name||'')) meshes.push(q); }); const rc=new THREE.Raycaster();
  for(let k=0;k<16;k++){ const a=o.a0+(k%2?1:-1)*Math.ceil(k/2)*0.39; const ex=o.c[0]+Math.cos(a)*o.d, ez=o.c[1]+Math.sin(a)*o.d; const eye=new THREE.Vector3(ex,o.h,ez), t=new THREE.Vector3(o.c[0],1.2,o.c[1]); const dir=t.clone().sub(eye); const L=dir.length(); rc.set(eye,dir.normalize()); rc.far=L-1.5;
    if(!rc.intersectObjects(meshes,false).length) return {eye:[+ex.toFixed(2),o.h,+ez.toFixed(2)], k}; }
  return null; })"""

NPCS = r"""((onlyVis)=>{ const E=GAME.E, cam=E.camera; const fr=new THREE.Frustum(), M=new THREE.Matrix4(); cam.updateMatrixWorld(); M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); fr.setFromProjectionMatrix(M);
  const S=new THREE.Sphere(); const out=[];
  for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o) continue; S.center.set(o.position.x,o.position.y+0.9,o.position.z); S.radius=1.0; const inView=o.visible&&fr.intersectsSphere(S);
    if(onlyVis&&!inView) continue;
    const u=o.userData||{}; const an=u.anim||{}; const acts=u.actions||an.actions||null; const mixer=u.mixer||an.mixer||null;
    let playing=[]; if(acts) for(const k in acts){ const a=acts[k]; try{ const w=a.getEffectiveWeight?a.getEffectiveWeight():null; if(a.isRunning&&a.isRunning()&&w>0.01) playing.push({clip:k, w:w!=null?+w.toFixed(2):null, run:!!(a.isRunning&&a.isRunning()), t:+(a.time||0).toFixed(2)}); }catch(e){} }
    let arm=null; try{ const hm=u.vrm&&u.vrm.humanoid; if(hm){ const f=s=>{ const a=hm.getRawBoneNode(s+'UpperArm'), b=hm.getRawBoneNode(s+'LowerArm'); if(!a||!b) return null; const pa=a.getWorldPosition(new THREE.Vector3()), pb=b.getWorldPosition(new THREE.Vector3()); const d=pb.sub(pa).normalize(); return +(Math.asin(Math.max(-1,Math.min(1,d.y)))*180/Math.PI).toFixed(0); }; arm=[f('left'),f('right')]; } }catch(e){}
    const mf=(typeof ASSETS!=='undefined'&&ASSETS.manifest&&u.key)?ASSETS.manifest[u.key]:null;
    out.push({id:n.id||null, charId:n.charId||null, pos:[+o.position.x.toFixed(2),+o.position.z.toFixed(2)], dist:+Math.hypot(o.position.x-cam.position.x,o.position.z-cam.position.z).toFixed(1), inView, beh:n.beh||null, pose:n.pose||null, speed:n.speed||0,
      driver:u.driver||null, key:u.key||null, url:mf?String(mf.url||'').split('/').pop():null, placeholder:!!u.placeholder, failed:!!u.failed, isFar:!!u.isFar, cur:an.cur||u.cur||null, arm, tpose:!!(arm&&arm[0]!=null&&arm[0]>-35&&arm[1]>-35), hasMixer:!!mixer, nActions:acts?Object.keys(acts).length:0, playing});
  }
  return out; })"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC WZ_TPOSE（溫州街 T 字路人）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real, 'shots': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            R.setup('讀檔 %s %s %.2f（條件事件關閉）' % (ZONE, DAY, H))
            s = await D.load_zone(pg, cdp, ZONE, DAY, H, wait=1500)
            t0 = time.time()
            if R.check('進得了 %s' % ZONE, s['zone'] == ZONE, J(s)):
                pk = None
                for d_ in (7.0, 5.0, 9.0):
                    pk = await pg.evaluate(CLEAR, {'c': [TARGET[0], TARGET[2]], 'a0': 0.0, 'd': d_, 'h': 1.7})
                    if pk: break
                eye = pk['eye'] if pk else [TARGET[0] + 5, 1.7, TARGET[2] - 4]; look = [TARGET[0] + 30, 1.6, TARGET[2] - 4]   # A1 門口往東看
                eye = [TARGET[0] + 1.5, 1.7, TARGET[2] - 2.5]
                for at in TIMES:
                    wait = at - (time.time() - t0)
                    if wait > 0: await pg.wait_for_timeout(int(wait * 1000))
                    cam = await D.user_shot(pg, cdp, 'tpose_%02ds' % at, {'eye': eye, 'look': look, 'lens': 24})
                    await pg.evaluate("(()=>{ GAME.E.paused=true; })()")
                    await pg.evaluate(D.CAM, {'eye': eye, 'look': look, 'lens': 24})
                    vis = await pg.evaluate(NPCS, True); allv = await pg.evaluate(NPCS, False)
                    await pg.evaluate(D.UNCAM)
                    still = [n for n in allv if n.get('tpose') or (not n['playing'] and n['pose'] not in ('sit',))]   # 坐著的是靜態坐姿（沒有 action、手臂往下），不算
                    R.note('[%ds] 畫面裡 NPC %d 個：%s' % (at, len(vis), J(vis)))
                    R.note('[%ds] 整區 NPC %d 個，上臂接近水平（T 字，上臂和水平夾角 > -35°）或沒坐著卻沒有 action 在播的 %d 個：%s' % (at, len(allv), len(still), J([{k: n[k] for k in ('id', 'charId', 'pos', 'beh', 'pose', 'driver', 'url', 'placeholder', 'isFar', 'cur', 'hasMixer', 'nActions', 'arm', 'tpose')} for n in still])))
                    rec['shots'].append({'at': at, 'cam': cam, 'visible': vis, 'noAction': still, 'nAll': len(allv)})
                last = rec['shots'][-1] if rec['shots'] else None
                if last: R.check('每一個時間點整區都沒有 T 字候選（沒在播動作或上臂接近水平）', not any(x['noAction'] for x in rec['shots']), J([(x['at'], [(n['url'], n['pos'], n['arm']) for n in x['noAction']]) for x in rec['shots'] if x['noAction']]))
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'tpose.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
