"""CC-B（帳號 B）11-07：PERF_WZ_DC（BB-B 09:47；PERF-WZ-DC-1107 d）1＋2，LAWWW-B 8530a4b26／LAWWW2-B a535443e2：
  人物描邊不進影子那一輪、溫州街頂點色材質打包 55 → 52；畫面應該不變）。前（285c05052）、後（8530a4b26）各跑一次（同一支探針、同一組鏡頭）。
  【前置／捷徑】讀檔進 wenzhou（14:00、21:00 晴；條件事件關閉）；鏡頭用新 CAM（暫停、重算 fadeWalls／樹／NPC 顯示／天空）。
  每個鏡頭：
    ① draw call 分兩輪：一次 E.render()（強制影子這一格重畫），renderer.info 不自動歸零；包住 renderer.shadowMap.render 算影子那一輪的 calls／三角形，
       主畫面＝總數 − 影子；另外記：畫面裡看得到的 NPC 數、CHAR.OUTLINE_MATS 大小（後版才有）、會投影的人物網格裡描邊材質的數量
    ② 截圖（1280×720，藏 HUD、藏玩家）——前後並排看有沒有變亮、變暗、變反光，影子一樣、主畫面描邊還在
  鏡頭：spawn（出生點跟隨鏡頭那個角度）、lane（巷子中段往東）、crowd（自動找 12 m 內人最多的一團、離 9 m、高 3.5 m 看過去，要 ≥ 5 人入鏡）
  fps：玩家站在出生點、遊戲照常跑（跟隨鏡頭）3 秒，參考用。Playwright ≠ iPhone；雲端 SwiftShader 的 fps 沒意義（只驗探針）。
用法：LW_TESTS=<wt>/tests TAG=before|after python3 cc_wz_dc_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
TAG = os.environ.get('TAG') or 'x'
R = L.Run('wz_dc_' + TAG, OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
TIMES = [('day', 14.0), ('night', 21.0)]

FPS = r"""(async (ms)=>{ const E=GAME.E; const t=[]; let last=performance.now(); const t0=last; await new Promise(res=>{ const f=now=>{ t.push(now-last); last=now; if(now-t0<ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  t.shift(); const avg=t.reduce((a,b)=>a+b,0)/Math.max(t.length,1), worst=Math.max(...t); const ri=E.renderer&&E.renderer.info&&E.renderer.info.render;
  return {frames:t.length, fpsAvg:+(1000/avg).toFixed(1), fpsMin:+(1000/worst).toFixed(1), msWorst:+worst.toFixed(1), calls:ri?ri.calls:null, tris:ri?ri.triangles:null}; })"""

DC = r"""(()=>{ const E=GAME.E, r=E.renderer, inf=r.info, SM=r.shadowMap; const orig=SM.render; let sc=0, st=0, sn=0;
  SM.render=function(){ const c0=inf.render.calls, t0=inf.render.triangles; try{ return orig.apply(this,arguments); } finally{ sc+=inf.render.calls-c0; st+=inf.render.triangles-t0; sn++; } };
  const ar=inf.autoReset; inf.autoReset=false; inf.reset(); const nu=SM.needsUpdate; SM.needsUpdate=true; let tot=null;
  try{ E.render(); tot={calls:inf.render.calls, tris:inf.render.triangles}; } finally{ SM.render=orig; inf.autoReset=ar; SM.needsUpdate=nu; }
  let olCast=0, olAll=0; for(const n of (E.npcs||[]).concat(E.player?[E.player]:[])){ if(!n||!n.obj||!n.obj.visible) continue; n.obj.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&(m.isOutline===true||/\(Outline\)$/.test(m.name||''))){ olAll++; if(o.castShadow) olCast++; } }); }
  const npcVis=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible).length;
  return {total:tot, shadow:{calls:sc, tris:st, passes:sn}, main:tot?{calls:tot.calls-sc, tris:tot.tris-st}:null, npcVis, outlineMats:(typeof CHAR!=='undefined'&&CHAR.OUTLINE_MATS)?CHAR.OUTLINE_MATS.size:null, outlineInVisibleChars:olAll, outlineOnCasters:olCast, shadowsOn:!!r.shadowMap.enabled}; })()"""

CLUSTER = r"""(()=>{ const ps=(GAME.E.npcs||[]).filter(n=>n&&n.obj&&!n.hidden).map(n=>[n.obj.position.x,n.obj.position.z]); let best=null;
  for(const p of ps){ const k=ps.filter(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<12); if(!best||k.length>best.n){ const cx=k.reduce((a,q)=>a+q[0],0)/k.length, cz=k.reduce((a,q)=>a+q[1],0)/k.length; best={n:k.length,c:[+cx.toFixed(2),+cz.toFixed(2)]}; } }
  return {npcs:ps.length, best}; })()"""

CLEAR = r"""((o)=>{ const z=GAME.E.zone; const meshes=[]; z.group.traverse(q=>{ if(q.isMesh&&q.visible&&!/VIEW|sky/i.test(q.name||'')) meshes.push(q); }); const rc=new THREE.Raycaster();
  for(let k=0;k<16;k++){ const a=o.a0+(k%2?1:-1)*Math.ceil(k/2)*0.39; const ex=o.c[0]+Math.cos(a)*o.d, ez=o.c[1]+Math.sin(a)*o.d; const eye=new THREE.Vector3(ex,o.h,ez), t=new THREE.Vector3(o.c[0],1.2,o.c[1]); const dir=t.clone().sub(eye); const L=dir.length(); rc.set(eye,dir.normalize()); rc.far=L-1.5;
    if(!rc.intersectObjects(meshes,false).length) return {eye:[+ex.toFixed(2),o.h,+ez.toFixed(2)], look:[o.c[0],1.2,o.c[1]], k}; }
  return null; })"""


async def view(pg, cdp, tag, nm, tn, eye, look, rec):
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.HUD + '(false)')
    cam = await pg.evaluate(D.CAM, {'eye': eye, 'look': look, 'lens': 24}); await pg.wait_for_timeout(500)
    dc = await pg.evaluate(DC)
    m = await D.shot(pg, 'wzdc_%s_%s_%s' % (TAG, nm, tn))
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    R.note('%s %s：draw call（主畫面／影子／合計）%s；鏡頭 %s；亮度 %s' % (tag, nm, J(dc), J(cam), J(m)))
    rec.setdefault(tn, {})[nm] = {'dc': dc, 'cam': cam, 'lum': m}
    return dc


async def one(pg, cdp, tn, h, rec):
    tag = '[%s %s]' % (TAG, tn)
    R.setup('%s 讀檔 wenzhou %s %.2f 晴（條件事件關閉）' % (tag, DAY, h))
    s = await D.load_zone(pg, cdp, 'wenzhou', DAY, h, wait=9000)
    if not R.check('%s 進得了 wenzhou' % tag, s['zone'] == 'wenzhou', J(s)): return
    await pg.wait_for_timeout(5000)
    f = await pg.evaluate(FPS, 3000); R.note('%s 出生點跟隨鏡頭 fps（參考）：%s' % (tag, J(f))); rec.setdefault(tn, {})['fps'] = f
    c = await pg.evaluate("(()=>{ const c=GAME.E.camera.position, p=GAME.E.player.obj.position; return {c:[c.x,c.y,c.z], p:[p.x,p.y,p.z]}; })()")
    sx, sz = c['p'][0], c['p'][2]
    await view(pg, cdp, tag, 'spawn', tn, [round(c['c'][0], 2), round(c['c'][1], 2), round(c['c'][2], 2)], [sx, 1.2, sz], rec)
    await view(pg, cdp, tag, 'lane', tn, [sx - 6.0, 2.2, sz], [sx + 30.0, 1.5, sz], rec)
    cl = await pg.evaluate(CLUSTER); R.note('%s 路人分布：%s' % (tag, J(cl)))
    if cl.get('best') and cl['best']['n'] >= 5:
        cc = cl['best']['c']; a0 = math.atan2(sz - cc[1], sx - cc[0])
        pk = await pg.evaluate(CLEAR, {'c': cc, 'a0': a0, 'd': 9.0, 'h': 3.5})
        if pk:
            dc = await view(pg, cdp, tag, 'crowd', tn, pk['eye'], pk['look'], rec)
            R.check('%s crowd：畫面裡看得到 ≥ 5 個人' % tag, (dc.get('npcVis') or 0) >= 5, J({'npcVis': dc.get('npcVis'), 'cluster': cl['best']}))
        else: R.note('%s crowd：那一團附近 16 個角度都被擋（沒拍）' % tag)
    else:
        sp = rec[tn].get('spawn', {}).get('dc', {}).get('npcVis') or 0
        R.note('%s crowd：這個時段 12 m 內最多只有 %s 人（不到 5 人，沒另外拍）；spawn 那個鏡頭入鏡 %s 人%s' % (tag, (cl.get('best') or {}).get('n'), sp, '——人物多的鏡頭就看 spawn' if sp >= 5 else ''))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC PERF_WZ_DC（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'tag': TAG, 'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for tn, h in TIMES:
                print('== %s' % tn, flush=True)
                try: await one(pg, cdp, tn, h, rec)
                except Exception as ex: R.check('[%s] 探針沒有例外' % tn, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'wz_dc_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
