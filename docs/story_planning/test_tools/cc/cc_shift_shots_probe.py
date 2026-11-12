"""CC-C 11-12：SHOP-JOBS 第五輪「五間店上班中各一張」（LAWWW-C 10:41，14e53d6bf8；BB-C 前一輪看到祐廷沒穿圍裙、站在用餐區中間）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
做法（JOBS 每一個 key：shanlan 山嵐、cinema 南洋、flower 花序、yue 越好吃、dakou 大口）：
  【前置／捷徑】讀檔 FIX（day51b）改成：大一下（TERM，預設 Y1S2）、那一間的班（G.jobs.<key>：資料裡第一個班表那一天、已上過 3 班）→ 掃那一學期第 3 週以後第一個那一天（不是考試週）→
  班開始前 12 分鐘讀檔進店（條件事件關掉）→ 進店班的時間到了遊戲自己開班（jobs3d.js S.shiftNow；沒開＝【捷徑】JOBS.runShift 同一個函式）→
  對話照第一個選項點，在「第一段工作旁白」和「第一個選項選完」兩個時候各記一次：祐廷的位置、面向、姿勢、身上有沒有圍裙類的網格（名字含 apron／圍裙）、離櫃台／工作點多遠、
  1 m 內家具、店裡其他人；拍遊戲鏡頭＋俯視。
CC_02 清單 2026-11-12：1✓（班表從遊戲資料讀：SHOP_JOBS_AA828／AA829 的 sched） 2✓（店的區域從 JOBS.X3 讀） 3✓（每間重新讀檔） 4✓（對話用 #dlg、#choices） 5n/a（讀檔進店） 6✓（讀檔等 6 秒） 7✓ 8n/a（不判，圖和位置給 BB） 9✓（俯視相機不藏人） 10✓（條件事件關掉；開班不是條件事件） 11✓ 12✓（兩個時間點各記位置、家具、人；BB-C 10:55 加書包網格看不看得到、鏡頭到頭之間被什麼擋、下班以後再記一次） 13✓（改存檔、捷徑都標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [KEYS=shanlan,cinema,flower,yue,dakou] [TERM=Y1S2] [FIX=…] python3 cc_shift_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
KEYS = [k for k in (os.environ.get('KEYS') or 'shanlan,cinema,flower,yue,dakou').split(',') if k]
TERM = os.environ.get('TERM_ID') or os.environ.get('TERM') or 'Y1S2'
R = L.Run('shift_shots', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {zone:GAME.G.zone, day:GAME.G.day, hour:GAME.G.hour}; })"""
PLAN = r"""((a)=>{ const X=JOBS.X3&&JOBS.X3[a.k]; const D1=(typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828.jobs&&SHOP_JOBS_AA828.jobs[a.k])||(typeof SHOP_JOBS_AA829!=='undefined'&&SHOP_JOBS_AA829.jobs&&SHOP_JOBS_AA829.jobs[a.k]); if(!X||!D1||!D1.sched||!D1.sched.length) return {why:'沒有這個 key 的資料', X:!!X};
  const s=D1.sched[0]; for(let d=0; d<2600; d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==a.term||T.week<3) continue; const D=CALENDAR.dateOf(d); if(D.wd!==s.wd) continue; let ex=false; try{ ex=!!(CLS.examWeek&&CLS.examWeek({day:d,weekday:D.wd%7,hour:12,flags:{}})); }catch(e){} if(ex) continue;
    return {zone:X.zone, name:X.name, wd:s.wd, t0:s.t0, t1:s.t1, day:d, key:D.key, desk:X.desk||null}; } return {why:'這學期找不到那一天'}; })"""
SNAPJS = r"""((a)=>{ const E=GAME.E, G=GAME.G, P=E.player&&E.player.obj; if(!P) return null; const pp={x:+P.position.x.toFixed(2), z:+P.position.z.toFixed(2), yaw:+P.rotation.y.toFixed(2), pose:E.player.pose||null};
  let apron=[], bag=[]; P.traverse(o=>{ const n=(o.name||'')+' '+((o.material&&o.material.name)||''); if(/apron|圍裙/i.test(n)) apron.push(n.trim().slice(0,40)); if(/bag|書包|backpack/i.test(n)){ let v=o.visible; let q=o.parent; while(q&&v){ v=q.visible!==false; q=q.parent; } bag.push([n.trim().slice(0,30), v]); } });
  let occ=null; try{ const cam=E.camera, rc=new THREE.Raycaster(), head=new THREE.Vector3(P.position.x,P.position.y+1.5,P.position.z), from=cam.getWorldPosition(new THREE.Vector3()), dir=head.clone().sub(from); const dist=dir.length(); rc.set(from,dir.normalize()); rc.far=dist; const ex0=new Set(); P.traverse(o=>ex0.add(o));
    const h=rc.intersectObjects(E.scene.children,true).find(x=>!ex0.has(x.object)&&x.object.visible!==false); occ={camToHead:+dist.toFixed(2), blockedBy:h?(h.object.name||(h.object.parent&&h.object.parent.name)||'?'):null, at:h?+h.distance.toFixed(2):null}; }catch(e){ occ=String(e).slice(0,60); }
  const ex=new Set(); P.traverse(o=>ex.add(o)); const bx=new THREE.Box3(), furn=[]; E.scene.traverse(q=>{ if(!q.isMesh||ex.has(q)||q.visible===false||!q.geometry) return; if(!q.geometry.boundingBox) q.geometry.computeBoundingBox(); bx.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);
    const sx=bx.max.x-bx.min.x, sz=bx.max.z-bx.min.z, sy=bx.max.y-bx.min.y; if(sy<0.15||bx.max.y<P.position.y+0.1||bx.min.y>P.position.y+2.2) return; const d=Math.hypot(Math.max(bx.min.x-P.position.x,0,P.position.x-bx.max.x), Math.max(bx.min.z-P.position.z,0,P.position.z-bx.max.z)); if(d===0&&sx>3&&sz>3) return; if(d<=1.0) furn.push({name:q.name||(q.parent&&q.parent.name)||'?', d:+d.toFixed(2)}); });
  furn.sort((x,y)=>x.d-y.d);
  const its=(E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label, d:+Math.hypot(i.x-P.position.x,i.z-P.position.z).toFixed(2)})).sort((x,y)=>x.d-y.d).slice(0,4);
  const ppl=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false&&!n.hidden).map(n=>({id:n.charId||n.id||'', name:n.name||'', x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), seat:!!n.seat, clerk:!!n.clerk}));
  return {zone:G.zone, h:+(+G.hour).toFixed(2), player:pp, apron, bag, camOcclusion:occ, furn1m:furn.slice(0,6), nearIts:its, people:ppl, running:!!JOBS.running, dlg:(document.getElementById('dlgText')||{}).textContent||''}; })"""
TOP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(70, c.width/c.height, 0.05, 300); cam.position.set(a.x, a.y+7.5, a.z+0.01); cam.lookAt(a.x, a.y, a.z); cam.updateMatrixWorld(true);
  const hid=[]; E.scene.traverse(o=>{ if(o.isMesh&&o.visible&&o.name&&/ceil|roof|天花/i.test(o.name)){ hid.push(o); o.visible=false; } }); let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { for(const o of hid) o.visible=true; } return url; })"""


def prep(sv0, k, plan):
    sv = json.loads(json.dumps(sv0)); d = plan['day']
    sv.update({'day': d, 'weekday': plan['wd'] % 7, 'hour': plan['t0'] - 0.2, 'zone': plan['zone'], 'weather': 'clear'}); sv.pop('pos', None)
    jobs = sv.setdefault('jobs', {}); jobs.setdefault('_meta', {})
    jobs[k] = {'since': d - 21, 'from': (d - 21) * 24, 'day': [plan['wd']], 'shifts': 3, 'skill': 1, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0, 'worked': [], 'chk': d - 1, 'wk': {}, 'brk': {}, 'ot': {}}
    F = sv.setdefault('flags', {}); F.setdefault('FC', {'cnt': 1, 'last': d - 7})
    return sv


async def main():
    print('CC 上班中各一張：SHA %s；KEYS %s；TERM %s' % (SHA or '?', KEYS, TERM), flush=True)
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8'))
    res = {'sha': SHA, 'shops': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for k in KEYS:
            tag = '[%s]' % k
            try:
                plan = await pg.evaluate(PLAN, {'k': k, 'term': TERM})
                if not R.check('%s 找得到班表和日子' % tag, 'day' in plan, J(plan)): continue
                r = await pg.evaluate(APPLY, prep(sv0, k, plan))
                R.setup('%s 【前置／捷徑】讀檔改成 %s 有 %s 的班（%s 週%s %.2f～%.2f），班開始前 12 分鐘進店（條件事件關掉）' % (tag, TERM, plan['name'], plan['key'], plan['wd'], plan['t0'], plan['t1']))
                await pg.wait_for_timeout(6000)
                started = await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)")
                if not started and not await pg.evaluate("!!(document.getElementById('dlg')&&document.getElementById('dlg').offsetParent)"):
                    R.note('%s 進店沒有自動開班 →【捷徑】JOBS.runShift(GAME,\'%s\')' % (tag, k)); await pg.evaluate("(k=>{ window.__ccShift=JOBS.runShift(GAME,k); })", k); await pg.wait_for_timeout(1500)
                shots = []; chose = False; t0 = time.time()
                while time.time() - t0 < 150 and len(shots) < 2:
                    s = await L.state(pg)
                    if s['dlg'] and not shots:
                        sn = await pg.evaluate(SNAPJS, {}); shots.append(('first', sn))
                    if s['choices']:
                        await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); chose = True; await pg.wait_for_timeout(900)
                        sn = await pg.evaluate(SNAPJS, {}); shots.append(('after_choice', sn)); continue
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                    await pg.wait_for_timeout(700)
                for nm, sn in shots:
                    if not sn: continue
                    await pg.screenshot(path=os.path.join(OUT, 'shift_%s_%s_game.png' % (k, nm)))
                    u = await pg.evaluate(TOP, {'x': sn['player']['x'], 'y': 0, 'z': sn['player']['z']})
                    if u: open(os.path.join(OUT, 'shift_%s_%s_top.jpg' % (k, nm)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
                    R.note('%s %s：祐廷 %s；圍裙網格 %s；最近的互動點 %s；1 m 內家具 %s；店裡的人 %s；當下那一句「%s」' % (tag, nm, J(sn['player']), J(sn['apron']), J(sn['nearIts']), J(sn['furn1m']), J(sn['people']), sn['dlg'][:40]))
                # 下班以後（BB-C 10:55）：書包還原、人有沒有被推走
                t1 = time.time()
                while time.time() - t1 < 150 and await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)"):
                    s = await L.state(pg)
                    if s['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(800); continue
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                    await pg.wait_for_timeout(700)
                await pg.wait_for_timeout(2500); after = await pg.evaluate(SNAPJS, {})
                if after:
                    shots.append(('after_shift', after)); await pg.screenshot(path=os.path.join(OUT, 'shift_%s_after_shift_game.png' % k))
                    R.note('%s 下班以後：祐廷 %s；書包 %s；鏡頭到頭之間被 %s 擋' % (tag, J(after['player']), J(after['bag']), J(after['camOcclusion'])))
                for nm, sn in shots:
                    if sn and nm != 'after_shift': R.note('%s %s：書包 %s；鏡頭到頭之間 %s' % (tag, nm, J(sn['bag']), J(sn['camOcclusion'])))
                if len(shots) >= 2 and shots[0][1] and shots[1][1]:
                    a0, a1 = shots[0][1]['player'], shots[1][1]['player']
                    R.note('%s 上班中位置變化 %.2f m（被碰撞推出來的參考）' % (tag, ((a0['x'] - a1['x']) ** 2 + (a0['z'] - a1['z']) ** 2) ** 0.5))
                R.check('%s 上班中有拍到（%d 張）' % (tag, len(shots)), bool(shots), '')
                res['shops'][k] = {'plan': plan, 'shots': shots}
            except Exception as e:
                R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
            await pg.goto(URL); await L.wait_loaded(pg)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'shift_shots.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
