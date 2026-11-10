"""CC（帳號 A）11-10：體育館 B1 泳池的泳客（ART-GYM-POOL-SWIMMERS-1103；BB 18:10 POOL_SWIM，開發分支 2c37122b6）。Playwright（PC GPU）≠ iPhone。
對照的程式（2c37122b6）：src/crowd3d.js S.SWIM（cap low 2／medium 3／high 4）、S.swimPlan、S.swimTick（VRM 載好才放；後來才載好的等畫面外或池邊轉身 turn>0 才放）、
  S.gymHours（第四個週一休館；平日 8～22、週六 9～22、週日 9～18）；character3d.js C.GYM.swim（water −0.14＝水面比池邊地面低多少）。
CASES（預設全部）：
  ENTRY   【前置／捷徑】讀檔到 1F（gym）入口出生點、那一天 14:00、中畫質 → 觸控走到「下樓到 B1」按 → 每 0.25 秒記：區域、黑幕（GAME.isEntering）、畫面亮度、泳客數
          → 記「按下去 → 畫面亮」「按下去 → 第一個泳客出現」秒數；每個泳客出現的那一刻 turn（池邊轉身）、在不在遊戲鏡頭的畫面裡（crowd3d 的 inView 同一個算法）。
          之後觸控走進泳池門口、站到池邊（0,−2.6）→ 人數＝CROWD.swimPlan 的人數、≤ 中畫質上限 3。
  POSE    （接 ENTRY）每個泳客：臀部、頭、最低／最高的骨頭世界高度 vs 水面 −0.14（連續 6 秒、每 0.2 秒），判斷「一半在水裡」：臀部在水面下 0～0.6 m、頭沒有一直在水面下 0.4 m 以下、沒有骨頭高過水面 0.45 m。
          自由式、蛙式各一組連拍（拍照鏡頭跟著那個人，不改遊戲鏡頭，不藏人）8 張×0.35 秒；近看（1.6 m）遠看（池邊斜角 14 m）各一張。
  TURN    （接 ENTRY）連續 30 秒、每 0.25 秒記 swimLive 的人：有人出現／消失時記 turn、在不在畫面裡（要 turn>0 或不在畫面裡才算對）。
  FPS     中畫質站在池邊 10 秒，requestAnimationFrame 數幾格。
  QUAL    低／中／高各一次：【前置／捷徑】設定的畫質（#setQuality 改值＋change）→ 讀檔到 gym_b1 池邊那一天 14:00 → 等 10 秒 → 數泳客＝min(那一天的人數, 上限)；人數挑一天原本就是 4 人的（才看得出上限）。
  CLOSED  同一天 22:30（關館）、那個月第四個週一 14:00（休館）讀檔到 gym_b1 池邊 → 等 10 秒 → 泳客 0。
  BASE=1  舊版對照（沒有泳客的版本，例 ecc3e12a7）：只跑 ENTRY 的「按下去 → 畫面亮」秒數，日子固定 2025-11-01（週六 9～22 開館）；新舊比較黑幕有沒有變長。
用法：LW_TESTS=<wt>/tests [CASES=ENTRY,POSE,TURN,FPS,QUAL,CLOSED] python3 cc_pool_swim_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = (os.environ.get('CASES') or 'ENTRY,POSE,TURN,FPS,QUAL,CLOSED').split(',')
R = L.Run('pool_swim', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
WATER = -0.14
LUM_OLD = "(()=>{ const c=GAME.E.renderer.domElement, k=document.createElement('canvas'); k.width=64; k.height=36; const g=k.getContext('2d'); g.drawImage(c,0,0,64,36); const d=g.getImageData(0,0,64,36).data; let s=0; for(let i=0;i<d.length;i+=4) s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; return +(s/(d.length/4)).toFixed(1); })()"
SW = r"""(()=>{ const E=GAME.E, cam=E.camera; const inV=p=>{ if(!cam) return null; const v=new THREE.Vector3(p.x,0.5,p.z).project(cam); return v.z<1&&Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05; };
  const live=CROWD.swimLive||{}; const out=[];
  for(const k in live){ const Lv=live[k], n=Lv.n, o=n.obj; let hips=null, head=null, lo=1e9, hi=-1e9; const w=new THREE.Vector3();
    o.updateWorldMatrix(true,true); o.traverse(b=>{ if(!b.isBone) return; b.getWorldPosition(w); if(w.y<lo) lo=w.y; if(w.y>hi) hi=w.y; const nm=String(b.name);
      if(!hips&&/(^|_)hips$/i.test(nm)) hips=w.y; if(!head&&/(^|_)head$/i.test(nm)) head=w.y; });
    const a=CROWD.swimAt(Lv.p); out.push({k, model:Lv.p.model, pose:Lv.p.pose, lane:Lv.p.lane, x:+o.position.x.toFixed(2), z:+o.position.z.toFixed(2), turn:+(+a.turn||0).toFixed(2), view:inV(o.position),
      vis:!!o.visible, hips:hips==null?null:+hips.toFixed(3), head:head==null?null:+head.toFixed(3), lo:lo>1e8?null:+lo.toFixed(3), hi:hi<-1e8?null:+hi.toFixed(3)}); }
  return {zone:GAME.G.zone, entering:!!(GAME.isEntering&&GAME.isEntering()), h:+(+GAME.G.hour).toFixed(3), q:E.q&&E.q.level, plan:CROWD.swimPlan?(CROWD.swimPlan(GAME.G,E.q&&E.q.level)||[]).length:0, n:out.length, sw:out}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  let url; r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.82); return url; })"""   # 不藏人、不改遊戲鏡頭；下一格遊戲自己會再畫
LUMJS = "(u=>new Promise(res=>{ const im=new Image(); im.onload=()=>{ const k=document.createElement('canvas'); k.width=64; k.height=36; const g=k.getContext('2d'); g.drawImage(im,0,0,64,36); const d=g.getImageData(0,0,64,36).data; let s=0; for(let i=0;i<d.length;i+=4) s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; res(+(s/(d.length/4)).toFixed(1)); }; im.onerror=()=>res(-1); im.src=u; }))"


async def lum_of(pg):
    '''r2：畫面亮度用 page.screenshot 算（原本 drawImage WebGL canvas，PC 上 preserveDrawingBuffer=false 永遠 0）'''
    b = await pg.screenshot(type='jpeg', quality=40)
    return await pg.evaluate(LUMJS, 'data:image/jpeg;base64,' + base64.b64encode(b).decode())


ME = "(()=>{ const P=GAME.E.player; return {zone:GAME.G.zone, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), fb:GAME.walkFallbacks|0}; })()"


async def snap(pg, fn, frm, at, fov=50):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at), 'fov': fov}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def set_quality(pg, lv):
    ok = await pg.evaluate("(v=>{ const s=document.getElementById('setQuality'); if(!s) return false; s.value=v; s.dispatchEvent(new Event('change')); return GAME.E.q.level; })(%s)" % J(lv))
    R.setup('【前置／設定】畫質選單 #setQuality＝%s（結果 E.q.level＝%s）' % (lv, ok))
    return ok


async def pick_day(pg):
    """找一天：14:00 開館、高畫質原本就 4 個人（看得出上限）；那個月第四個週一（休館）"""
    return await pg.evaluate(r"""(()=>{ const out={}; const pc=(d,h,q)=>(CROWD.swimPlan({day:d,hour:h},q)||[]).length;
      for(let d=40; d<120 && out.day4==null; d++){ if(CROWD.gymHours({day:d})&&pc(d,14,'high')===4) out.day4=d; }
      for(let d=40; d<120 && out.closed==null; d++){ if(!CROWD.gymHours({day:d})) out.closed=d; }
      out.key4=out.day4!=null?CALENDAR.dateOf(out.day4).key:null; out.keyC=out.closed!=null?CALENDAR.dateOf(out.closed).key:null;
      out.hours4=out.day4!=null?CROWD.gymHours({day:out.day4}):null; return out; })()""")


async def main():
    print('CC POOL_SWIM：CASES %s；Playwright ≠ iPhone' % ','.join(CASES), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        await pg.wait_for_timeout(2000)
        BASE = os.environ.get('BASE') == '1'
        if BASE: dd = {'key4': os.environ.get('DAY') or '2025-11-01'}; CASES[:] = ['ENTRY']
        else: dd = await pick_day(pg)
        R.note('挑的日子：%s' % J(dd))
        if not BASE and not R.check('找得到 14:00 開館、原本 4 個人的一天', dd.get('day4') is not None, J(dd)): await b.close(); return
        K4 = os.environ.get('DAY') or dd['key4']   # r2：DAY＝指定日子（新舊比進場黑幕用同一天）
        try:
            if 'ENTRY' in CASES or 'POSE' in CASES or 'TURN' in CASES or 'FPS' in CASES:
                await set_quality(pg, 'medium')
                await D.load_zone(pg, cdp, 'gym', K4, 14.0, 0.0, 17.6, wait=7000)
                R.setup('【前置／捷徑】讀檔到 1F 綜合體育館（gym）入口出生點 (0,17.6)、%s 14:00' % K4)
                its = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden&&i.exit&&i.exit.to==='gym_b1').map(i=>({x:i.x,z:i.z,label:i.label})))()")
                if not R.check('1F 有「下樓到 B1」', bool(its), ''): raise RuntimeError('no b1 exit')
                it = its[0]
                await L.go_to(pg, cdp, R, it['x'], it['z'], 0.6, '走到「%s」' % it['label'], max_s=90)
                await pg.wait_for_timeout(500)
                t0 = time.time(); await L.tap(pg, cdp, '#interact')
                tl = []; seen = {}; t_lit = None; t_end = None; t_sw = None; appear = []
                while time.time() - t0 < 60:
                    s = await pg.evaluate(SW); dt = round(time.time() - t0, 2); lum = await lum_of(pg) if (s['zone'] == 'gym_b1' and not s['entering'] and t_lit is None) else None
                    tl.append({'t': dt, 'zone': s['zone'], 'ent': s['entering'], 'lum': lum, 'n': s['n']})
                    if t_end is None and s['zone'] == 'gym_b1' and not s['entering']: t_end = dt
                    if t_lit is None and s['zone'] == 'gym_b1' and not s['entering'] and lum is not None and lum >= 12: t_lit = dt
                    for w in s['sw']:
                        if w['k'] not in seen: seen[w['k']] = dt; appear.append(dict(w, t=dt, entering=s['entering']))
                    if t_sw is None and s['n'] > 0: t_sw = dt
                    if t_lit is not None and ((s['n'] >= s['plan'] and s['plan'] > 0) or BASE) and dt - t_lit > 2: break
                    await pg.wait_for_timeout(250)
                json.dump({'timeline': tl, 'appear': appear}, open(os.path.join(OUT, 'entry_timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                R.note('[ENTRY] 按下去 → 黑幕結束（isEntering false）%s 秒；→ 畫面亮（截圖亮度 ≥12）%s 秒；→ 第一個泳客 %s 秒；' % (t_end, t_lit, t_sw) + '（%s）' % '出現的那一刻：%s' % (J([{k: a[k] for k in ('k', 't', 'turn', 'view', 'entering')} for a in appear])))
                R.note('[ENTRY] 時間軸（前 40 筆）：%s' % J(tl[:40]))
                R.check('[ENTRY] 進得去 B1、畫面亮起來（%s 秒）' % t_lit, t_lit is not None, J(tl[-3:]))
                bad = [a for a in appear if not a['entering'] and a['turn'] <= 0 and a['view']]
                R.check('[ENTRY] 泳客出現的時候：黑幕裡、池邊轉身、或不在畫面裡（不能在畫面中間突然冒出來）', not bad, J(bad))
                if BASE: raise SystemExit
                await L.go_to(pg, cdp, R, -4.1, 0.6, 0.5, '走到泳池門口', max_s=90)
                await L.go_to(pg, cdp, R, -4.1, -1.6, 0.5, '走進泳池', max_s=60)
                await L.go_to(pg, cdp, R, 0.0, -2.6, 0.5, '站到池邊 (0,−2.6)', max_s=90)
                await pg.wait_for_timeout(3000)
                s = await pg.evaluate(SW); me = await pg.evaluate(ME)
                R.note('[ENTRY] 池邊：%s；泳客 %s' % (J(me), J(s)))
                await pg.screenshot(path=os.path.join(OUT, 'pool_1_game_cam.jpg'), type='jpeg', quality=80)
                R.check('[ENTRY] 中畫質泳客數＝那一天的人數（%d）且 ≤ 3' % s['plan'], s['n'] == s['plan'] and s['n'] <= 3 and s['n'] >= 2, J({'n': s['n'], 'plan': s['plan']}))
                R.check('[ENTRY] 走到池邊沒有被放到目的地（walkFallbacks 0）', me['fb'] == 0, J(me))

                if 'POSE' in CASES:
                    samples = []
                    for _ in range(30):
                        samples.append(await pg.evaluate(SW)); await pg.wait_for_timeout(200)
                    per = {}
                    for s2 in samples:
                        for w in s2['sw']: per.setdefault(w['k'], []).append(w)
                    for k, ws in per.items():
                        hp = [w['hips'] for w in ws if w['hips'] is not None]; hd = [w['head'] for w in ws if w['head'] is not None]; hi = [w['hi'] for w in ws if w['hi'] is not None]; lo = [w['lo'] for w in ws if w['lo'] is not None]
                        if not hp: R.check('[POSE] %s 找得到臀部骨頭' % k, False, J(ws[0])); continue
                        st = {'model': ws[0]['model'], 'pose': ws[0]['pose'], 'hips': [min(hp), max(hp)], 'head': [min(hd), max(hd)] if hd else None, 'hi': max(hi), 'lo': min(lo), 'water': WATER}
                        R.note('[POSE] %s 高度（世界 y，6 秒）：%s' % (k, J(st)))
                        okh = WATER - 0.6 <= min(hp) and max(hp) <= WATER + 0.02
                        R.check('[POSE] %s（%s）臀部在水面下 0～0.6 m（%.2f～%.2f，水面 %.2f）' % (k, ws[0]['pose'], min(hp), max(hp), WATER), okh, J(st))
                        R.check('[POSE] %s 沒有整個沉下去（頭最高 %.2f ≥ 水面 −0.4）' % (k, max(hd) if hd else -9), bool(hd) and max(hd) >= WATER - 0.4, J(st))
                        R.check('[POSE] %s 沒有浮在水面上（最高骨頭 %.2f ≤ 水面 +0.45）' % (k, max(hi)), max(hi) <= WATER + 0.45, J(st))
                    s = await pg.evaluate(SW)
                    for pose in ('swim_free', 'swim_breast'):
                        w = next((x for x in s['sw'] if x['pose'] == pose), None)
                        if not w: R.note('[POSE] 這一天沒有 %s 的泳客（人數 %d）' % (pose, s['n'])); continue
                        for i in range(8):
                            s3 = await pg.evaluate(SW); w3 = next((x for x in s3['sw'] if x['k'] == w['k']), None)
                            if not w3: break
                            await snap(pg, 'pool_%s_%d.jpg' % (pose, i), (w3['x'] + 0.2, 0.9, w3['z'] + 2.4), (w3['x'], -0.2, w3['z']), 45)
                            await pg.wait_for_timeout(350)
                        R.note('[POSE] %s 連拍 8 張：pool_%s_0～7.jpg（側後方 2.4 m）' % (pose, pose))
                    s = await pg.evaluate(SW); w = s['sw'][0] if s['sw'] else None   # r2：拍之前重新讀位置（r1 用 4 秒前的位置，近看沒拍到人）
                    if w:
                        await snap(pg, 'pool_near.jpg', (w['x'] + 1.0, 0.6, w['z'] + 1.2), (w['x'], -0.15, w['z']), 50)
                        await snap(pg, 'pool_far.jpg', (-13.5, 3.2, -1.5), (2.0, -0.3, -12.0), 55)
                        R.note('[POSE] 近看 pool_near.jpg（%s，1.6 m）、遠看 pool_far.jpg（池邊西北角斜看整個池子）' % w['k'])

                if 'TURN' in CASES:
                    prev = None; ev = []; t1 = time.time()
                    while time.time() - t1 < 30:
                        s = await pg.evaluate(SW); cur = {w['k']: w for w in s['sw']}
                        if prev is not None:
                            for k in set(cur) - set(prev): ev.append({'t': round(time.time() - t1, 2), 'ev': 'appear', **{x: cur[k][x] for x in ('k', 'turn', 'view', 'x')}})
                            for k in set(prev) - set(cur): ev.append({'t': round(time.time() - t1, 2), 'ev': 'vanish', **{x: prev[k][x] for x in ('k', 'turn', 'view', 'x')}})
                        prev = cur; await pg.wait_for_timeout(250)
                    R.note('[TURN] 30 秒出現／消失：%s' % J(ev))
                    bad = [e for e in ev if e['turn'] <= 0 and e['view']]
                    R.check('[TURN] 30 秒內沒有人在畫面裡、不在池邊轉身的時候突然出現或消失', not bad, J(bad))

                if 'FPS' in CASES:
                    fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<10000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
                    s = await pg.evaluate(SW)
                    R.note('[FPS] 中畫質、池邊站 10 秒：%s fps（泳客 %d 人；PC GPU，不是 iPhone）' % (fps, s['n']))

            if 'QUAL' in CASES:
                for lv, cap in (('low', 2), ('medium', 3), ('high', 4)):
                    await set_quality(pg, lv)
                    await D.load_zone(pg, cdp, 'gym_b1', K4, 14.0, 0.0, -2.6, wait=10000)
                    s = await pg.evaluate(SW)
                    R.note('[QUAL] %s：%s' % (lv, J({k: s[k] for k in ('zone', 'q', 'plan', 'n')})))
                    R.check('[QUAL] %s 畫質泳客 %d 人＝上限 %d（那一天原本 4 人）' % (lv, s['n'], cap), s['n'] == cap and s['q'] == lv, J({k: s[k] for k in ('q', 'plan', 'n')}))
                    await pg.screenshot(path=os.path.join(OUT, 'pool_q_%s.jpg' % lv), type='jpeg', quality=70)
                await set_quality(pg, 'medium')

            if 'CLOSED' in CASES:
                for tag, key, h in (('關館 22:30', K4, 22.5), ('第四個週一 14:00', dd.get('keyC'), 14.0)):
                    if not key: R.check('[CLOSED] %s 找得到日子' % tag, False, J(dd)); continue
                    await D.load_zone(pg, cdp, 'gym_b1', key, h, 0.0, -2.6, wait=10000)
                    s = await pg.evaluate(SW)
                    R.note('[CLOSED] %s（%s）：%s' % (tag, key, J({k: s[k] for k in ('zone', 'h', 'plan', 'n')})))
                    R.check('[CLOSED] %s 泳池沒有人' % tag, s['n'] == 0 and s['plan'] == 0, J({k: s[k] for k in ('zone', 'plan', 'n')}))
                    await pg.screenshot(path=os.path.join(OUT, 'pool_closed_%s.jpg' % ('night' if h > 20 else 'mon4')), type='jpeg', quality=70)
        except SystemExit: pass
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
