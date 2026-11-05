"""CC-C（帳號 C）11-05：TAPSCAN／GYM_TAP（BB-C 05:42）——點地面落點掃描：有高度的地方（看台、斜地板、樓梯、二樓、夾層）點下去，遊戲會不會走到點的地方。
  起因：南洋 1 廳沒有 walkMeshes，E.screenToFloor 退回 y 0 的平面＝點斜地板差到 3.41 m（CC-C 13700be8f）；LAWWW2 掃到體育館 3F 主球場看台同一個問題（差 17.9 m）。
  做法（每個區域）：讀檔到出生點（再加一處：有樓梯的上到第 1 層），鏡頭照遊戲自己的；把人周圍 14 m 內、每一層站得住的格子（1 m）照 E.heightAt 的真正高度投影到螢幕，
    只留看得到的（螢幕上、是遊戲畫面、鏡頭到那一點中間沒有網格擋住），用遊戲自己的 E.screenToFloor 算點下去落在哪裡：水平差 ≤0.5 m 才算對。
    「有高度」＝那一點的高度和那一層的基本高度差 >0.15 m（看台、斜面、樓梯）；平的地方也一起算。
  GYM 另外：看台抽幾排的座位，照玩家點地走過去、坐下（共用 sit_all：seatApproach 那一點最近的按鈕是這一張）。
  修改前：9ea82730f；修改後：LAWWW-C 001703460（GYM-ARENA-TAP-1105）。判定歸 BB。
用法：LW_TESTS=<wt>/tests [ZONES=gym_arena,linze,...] [SEATS=gym_arena] python3 cc_tapscan_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
ZONES = [z for z in (os.environ.get('ZONES') or 'gym_arena,xs_nanyang_hall,linze,wancai,library_hall,dorm_hall,xs_shanlan,xs_dakou,xs_xsports').split(',') if z]
SEATZ = [z for z in (os.environ.get('SEATS') or 'gym_arena,xs_nanyang_hall').split(',') if z]
R = L.Run('tapscan', OUT); D.setup(R, OUT)
DAY = '2025-10-15'
SCAN = r"""((o)=>{ const E=GAME.E, cam=E.camera, P=E.player.obj.position, z=E.zone; const LG=z.levelGroups||[{y:0}], nl=Math.max(1,(z.levels||[0]).length);
  const out={pts:0, raised:0, bad:[], badRaised:0, badFlat:0, walk:(z.walkMeshes||[]).length, levels:nl, camY:+cam.position.y.toFixed(2)}; const ray=new THREE.Raycaster(); const V=THREE.Vector3;
  const vis=m=>{ for(let p=m;p;p=p.parent) if(p.visible===false) return false; return true; };
  const meshes=[]; E.scene.traverse(m=>{ if(m.isMesh&&vis(m)&&!(m.material&&m.material.visible===false)&&!(m.userData&&m.userData.walkLv!=null)) meshes.push(m); });
  for(let lv=0; lv<nl; lv++){ const base=LG[lv]?LG[lv].y:0;
    for(let x=Math.round(P.x)-o.r; x<=Math.round(P.x)+o.r; x+=o.step) for(let zz=Math.round(P.z)-o.r; zz<=Math.round(P.z)+o.r; zz+=o.step){
      if(!E.canStand(x,zz,0.3,lv)) continue; const h=E.heightAt?E.heightAt(x,zz,lv):base; const p=new V(x,h,zz), v=p.clone().project(cam); if(v.z>1||Math.abs(v.x)>0.95||Math.abs(v.y)>0.95) continue;
      const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; const el=document.elementFromPoint(sx,sy); if(!el||el.id!=='c') continue;
      const dir=p.clone().sub(cam.position), dist=dir.length(); dir.normalize(); ray.set(cam.position,dir); ray.near=0.05; ray.far=dist-0.25;
      const blk=ray.intersectObjects(meshes,false).filter(q=>!(q.object.material&&q.object.material.transparent&&q.object.material.opacity<0.6)); if(blk.length) continue;   /* 被擋住：玩家點不到 */
      const hit=E.screenToFloor(sx,sy); out.pts++; const raised=Math.abs(h-base)>0.15; if(raised) out.raised++;
      const off=hit?Math.hypot(hit.x-x,hit.z-zz):99;
      if(off>0.5){ if(raised) out.badRaised++; else out.badFlat++; if(out.bad.length<12) out.bad.push({at:[x,zz,lv,+h.toFixed(2)], lands:hit?[+hit.x.toFixed(2),+hit.z.toFixed(2),hit.lv|0,+(+hit.y).toFixed(2)]:null, off:+off.toFixed(2), raised}); } } }
  return out; })"""


async def scan_here(pg, tag):
    r = await pg.evaluate(SCAN, {'r': 14, 'step': 1})
    R.note('%s 看得到的點 %d（有高度 %d）、walkMeshes %d、層數 %d、鏡頭高 %s；落點差 >0.5 m：有高度 %d、平的 %d；例：%s' % (tag, r['pts'], r['raised'], r['walk'], r['levels'], r['camY'], r['badRaised'], r['badFlat'], J(r['bad'][:6])))
    return r


async def zone_scan(pg, cdp, zn):
    if not await pg.evaluate("(z=>!!Z3.ZONES[z])", zn):
        R.note('[%s] 這一版沒有這個區域：不測' % zn); return
    R.setup('[%s] 讀檔 %s 14:00（區域出生點）' % (zn, DAY))
    s = await D.load_zone(pg, cdp, zn, DAY, 14.0, wait=10000)
    if not R.check('[%s] 讀到' % zn, s['zone'] == zn, J(s)): return
    tot = {'pts': 0, 'raised': 0, 'badRaised': 0, 'badFlat': 0, 'bad': []}
    views = [('出生點', None)]
    ends = await pg.evaluate("(()=>{ const out=[]; for(const w of (GAME.E.zone.walkMeshes||[])){ if(w.userData&&w.userData.stairEnds) out.push(...w.userData.stairEnds); } return out; })()")
    top = next((e for e in ends if e.get('lv') == 1), None)
    if top: views.append(('樓梯頂（第 1 層）', top))
    for nm, at in views:
        if at:
            await L.go_to(pg, cdp, R, at['x'], at['z'], 0.4, '[%s] 走到%s' % (zn, nm), max_s=200, lv=at['lv']); await D.settle(pg)
        for k, yaw_add in enumerate((0.0, math.pi / 2, math.pi, -math.pi / 2)):
            await pg.evaluate("(a=>{ GAME.E.cam.yaw+=a; })", yaw_add if k else 0.0); await pg.wait_for_timeout(1200)
            r = await scan_here(pg, '[%s %s 鏡頭 %d]' % (zn, nm, k))
            for key in ('pts', 'raised', 'badRaised', 'badFlat'): tot[key] += r[key]
            tot['bad'] += r['bad'][:3]
        await D.shot(pg, 'tapscan_%s_%s' % (zn, 'top' if at else 'spawn'), judge_black=False)
    R.note('[%s] 合計：看得到的點 %d（有高度 %d）；差 >0.5 m：有高度 %d、平的 %d' % (zn, tot['pts'], tot['raised'], tot['badRaised'], tot['badFlat']))
    R.check('[%s] 點有高度的地方（%d 點）：落點差都 ≤0.5 m' % (zn, tot['raised']), tot['badRaised'] == 0, J([b for b in tot['bad'] if b['raised']][:6]))
    R.check('[%s] 點平的地方（%d 點）：落點差都 ≤0.5 m' % (zn, tot['pts'] - tot['raised']), tot['badFlat'] == 0, J([b for b in tot['bad'] if not b['raised']][:6]))
    if zn in SEATZ:
        allseats = await pg.evaluate(D.SEATS)
        ys = sorted({(s['sy'] if s['sy'] is not None else 0.0) for s in allseats})
        want = [ys[0], ys[len(ys) // 2], ys[-1]] if ys else []
        keep = []
        for y in want:
            c = next((s for s in allseats if (s['sy'] if s['sy'] is not None else 0.0) == y and (s['sx'], s['sz']) not in keep), None)
            if c: keep.append((c['sx'], c['sz']))
        R.setup('[%s 座位] 【捷徑】抽最低、中間、最高三排各一張（共 %d 張中的 %s），其他座位按鈕先藏起來' % (zn, len(allseats), J(keep)))
        await pg.evaluate("((keep)=>{ const K=new Set(keep.map(q=>q.join(','))); for(const i of GAME.E.interactables){ if(i.seat&&!K.has([+i.seat.x.toFixed(3),+i.seat.z.toFixed(3)].join(','))){ i.__ccHide=true; Object.defineProperty(i,'hidden',{value:true,configurable:true,writable:true}); } } })", [list(x) for x in keep])
        res = await D.sit_all(pg, cdp, '[%s 座位]' % zn, zn)
        await pg.evaluate("(()=>{ for(const i of GAME.E.interactables){ if(i.__ccHide){ delete i.hidden; delete i.__ccHide; } } })()")
        R.note('[%s 座位] 每張：%s' % (zn, J(res)))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC TAPSCAN（點地面落點：%s）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (','.join(ZONES), os.environ.get('SHA', '?'), real or '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for zn in ZONES:
            try: await zone_scan(pg, cdp, zn)
            except Exception as e: R.check('[%s] 探針沒有例外' % zn, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
