"""CC-C 11-12：越好吃上班時可昕（交往中）／學姊來吃飯的 3D 站位（SHOP-JOBS-1112 第四輪 ②③；BB-C 08:42、08:52 定做法，結果 BB 判）。Playwright（PC GPU）≠ iPhone。
讀碼（d4daa6326c）：上班那一段時間停在開班那一刻（17:30），jobs3d.js S.yueMealRun 用 S.mealHere「往後看這一班」決定誰來吃飯，然後只演台詞（say）；
  可昕另外有 SHOPLIFE.yueDate（交往中、晚餐時段、祐廷那天有班＝放進這間店）。所以要看的是：台詞演的時候，店裡 3D 有沒有她、坐哪、和祐廷的相對位置。
  沒有人＝照實記「只有台詞、沒有人」（BB：GAME_BUG 候選，BB 判）。
做法（每個情境 CASES：KX＝可昕交往中、SIS＝學姊 heroine_05 朋友以上）：
  【前置／捷徑】讀檔 FIX（預設 day51b_1110）改成：大一下（Y1S2）、越好吃的班（G.jobs.yue：週二、週四 17:30～21:00，已上過 3 班）、她的關係（KX：flags.dating_kexin、可昕聯絡人、關係高；SIS：學姊聯絡人、關係到朋友以上）。
  先在遊戲裡掃大一下每個週二、週四：JOBS.mealHere（遊戲自己判斷「這一班她會來吃飯」的函式）回不回她 → 第一個回的那天。掃不到＝照實記（不硬放）。
  那天 17:25 讀檔到越好吃（條件事件關掉）→ 走進店裡班的時間到了就開班（jobs3d.js：S.shiftNow）；沒開＝【捷徑】JOBS.runShift（同一個函式）→
  對話照第一個選項一路按，到她那一句（yueMeal.own 的句子或通用的「你在這裡打工喔？」）出來的那一刻停：
  記店裡所有人（E.npcs：誰、位置、坐不坐、姿勢）、她在不在、她和祐廷的距離和方向、她 1 m 內最近的家具；拍遊戲鏡頭一張＋俯視一張（另一台相機，藏玩家以外不動）。
  演完這一班以後再記一次（時間走了以後她會不會出現）。
CC_02 清單 2026-11-12：1✓（班表從資料讀：週二、週四 17:30；她來不來用遊戲的 JOBS.mealHere 掃，不硬放） 2✓（人物位置從 E.npcs 讀） 3✓（對話照第一個選項；記每一句） 4✓（對話用 #dlg、#choices） 5n/a（不走路，讀檔進店） 6✓（讀檔後等 6 秒） 7✓ 8n/a（不判，有沒有人照實記，BB 判） 9✓（俯視相機藏玩家頭以外不藏人；遊戲鏡頭原樣） 10✓（條件事件關掉；打工的開班不是條件事件，照跑） 11✓ 12✓（記日期、句子、每個人的位置、距離、家具） 13✓（改存檔、捷徑都標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=KX,SIS] [FIX=…] python3 cc_yue_meal_probe.py <url> <out>"""
import os, sys, json, asyncio, math, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
CASES = [c for c in (os.environ.get('CASES') or 'KX,SIS').split(',') if c]
WHO = {'KX': 'kexin', 'SIS': 'heroine_05'}
R = L.Run('yue_meal', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONE = 'tz_yuehaochi'


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {zone:GAME.G.zone, day:GAME.G.day, hour:GAME.G.hour}; })"""
# 掃大一下週二、週四：遊戲自己的 JOBS.mealHere（玩家在越好吃、這一班她會不會來吃飯）
SCAN = r"""((a)=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; const out=[]; let n=0;
  try{ for(let d=0; d<2600; d++){ const T=CALENDAR.termOf(d); if(!T||T.id!=='Y1S2') continue; const wd=CALENDAR.dateOf(d).wd%7; if(wd!==2&&wd!==4) continue; n++;
      G.day=d; G.weekday=wd; G.zone=a.zone; G.hour=17.5; let due=null, slot=null; try{ due=JOBS.due(G,'yue',d); slot=JOBS.mealHere(G,a.who); }catch(e){ slot='ERR '+String(e).slice(0,80); }
      const ok=!!slot&&!(typeof slot==='string'&&slot.indexOf('ERR')===0); if(ok){ out.push({day:d, key:CALENDAR.dateOf(d).key, wd, due, slot}); if(out.length>=a.max) break; } else if(n<=3) out.push({probe:true, day:d, key:CALENDAR.dateOf(d).key, due, slot}); } }
  finally{ Object.assign(G,keep); } return {scanned:n, hits:out.filter(x=>!x.probe), first:out.filter(x=>x.probe)}; })"""
PEOPLE = r"""((a)=>{ const E=GAME.E, G=GAME.G, P=E.player&&E.player.obj; const pp=P?{x:+P.position.x.toFixed(2), z:+P.position.z.toFixed(2), yaw:+P.rotation.y.toFixed(2)}:null;
  const L=(E.npcs||[]).filter(n=>n&&n.obj).map(n=>({id:n.charId||n.id||'', name:n.name||'', x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), vis:n.obj.visible!==false&&!n.hidden, seat:!!n.seat, pose:n.pose||null, clerk:!!n.clerk}));
  const me=L.find(q=>q.id===a.who); let rel=null, furn=[];
  if(me&&pp){ const dx=me.x-pp.x, dz=me.z-pp.z; rel={d:+Math.hypot(dx,dz).toFixed(2), dx:+dx.toFixed(2), dz:+dz.toFixed(2)};
    const n=(E.npcs||[]).find(q=>q&&(q.charId||q.id)===a.who), o=n.obj, ex=new Set(); o.traverse(q=>ex.add(q)); if(P) P.traverse(q=>ex.add(q)); const bx=new THREE.Box3();
    E.scene.traverse(q=>{ if(!q.isMesh||ex.has(q)||q.visible===false||!q.geometry) return; if(!q.geometry.boundingBox) q.geometry.computeBoundingBox(); bx.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);
      const sx=bx.max.x-bx.min.x, sz=bx.max.z-bx.min.z, sy=bx.max.y-bx.min.y; if(sx>8||sz>8||sy<0.15||bx.max.y<o.position.y+0.1||bx.min.y>o.position.y+2.2) return;
      const d=Math.hypot(Math.max(bx.min.x-o.position.x,0,o.position.x-bx.max.x), Math.max(bx.min.z-o.position.z,0,o.position.z-bx.max.z)); if(d<=1.0) furn.push({name:q.name||(q.parent&&q.parent.name)||'?', d:+d.toFixed(2)}); });
    furn.sort((x,y)=>x.d-y.d); furn=furn.slice(0,8); }
  return {zone:G.zone, hour:+(+G.hour).toFixed(2), player:pp, people:L, her:me||null, rel, furn1m:furn, dlg:(document.getElementById('dlgText')||{}).textContent||''}; })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.05, 300); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; E.scene.traverse(o=>{ if(o.isMesh&&o.visible&&o.position&&o.matrixWorld&&o.name&&/ceil|roof|天花/i.test(o.name)){ hid.push(o); o.visible=false; } });
  let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { for(const o of hid) o.visible=true; } return url; })"""


def wsave(u, name):
    if u: open(os.path.join(OUT, name), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def prep(sv0, who, day=None, wd=None, h=None):
    sv = json.loads(json.dumps(sv0))
    if day is not None:
        sv['day'] = day; sv['weekday'] = wd; sv['hour'] = h; sv['zone'] = ZONE; sv['weather'] = 'clear'; sv.pop('pos', None)
    d0 = sv['day']
    jobs = sv.setdefault('jobs', {}); jobs.setdefault('_meta', {})
    jobs['yue'] = {'since': d0 - 21, 'from': (d0 - 21) * 24, 'day': [2, 4], 'shifts': 3, 'skill': 1, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0,
                   'worked': [], 'chk': d0 - 1, 'wk': {}, 'brk': {}, 'ot': {}, 'mealHi': []}
    F = sv.setdefault('flags', {})
    sv.setdefault('contacts', {})[who] = sv.get('contacts', {}).get(who, 2)
    rel = sv.setdefault('social', {}).setdefault('rel', {})
    r0 = rel.get(who) or {}
    r0.update({'fam': max(r0.get('fam', 0), 90), 'trust': max(r0.get('trust', 0), 70), 'comf': max(r0.get('comf', 0), 70), 'seen': max(r0.get('seen', 0), 30), 'talked': max(r0.get('talked', 0), 30), '_migrated': True})
    if who == 'kexin':
        F['dating_kexin'] = True; r0['rom'] = max(r0.get('rom', 0), 80); r0['aff'] = max(r0.get('aff', 0), 60)
    rel[who] = r0
    return sv


async def run_case(pg, cdp, sv0, case, res):
    who = WHO[case]; tag = case
    r = await pg.evaluate(APPLY, prep(sv0, who))
    await pg.wait_for_timeout(4000)
    sc = await pg.evaluate(SCAN, {'zone': ZONE, 'who': who, 'max': 3})
    R.setup('[%s] 【前置／捷徑】讀檔改成大一下、越好吃週二週四的班、%s 的關係；掃大一下週二週四 JOBS.mealHere → %s' % (tag, who, J({'scanned': sc['scanned'], 'hits': sc['hits'][:3]})))
    out = {'who': who, 'scan': sc}
    if not sc['hits']:
        R.note('[%s] 掃了 %d 天，遊戲沒有一天說「這一班 %s 會來吃飯」：%s' % (tag, sc['scanned'], who, J(sc['first'])))
        R.check('[%s] 大一下找得到 %s 會來越好吃吃飯的一班（JOBS.mealHere）' % (tag, who), False, J(sc['first']))
        res[case] = out; return
    hit = sc['hits'][0]
    r = await pg.evaluate(APPLY, prep(sv0, who, hit['day'], hit['wd'], 17.4))
    R.setup('[%s] 【前置／捷徑】%s 17:24 讀檔到越好吃（條件事件關掉）' % (tag, hit['key']))
    await pg.wait_for_timeout(6000)
    started = await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)")
    if not started:
        dlg = await pg.evaluate("!!(document.getElementById('dlg')&&document.getElementById('dlg').offsetParent)")
        if not dlg:
            R.note('[%s] 進店沒有自動開班（JOBS.running=false、沒有對話）→【捷徑】JOBS.runShift(GAME,\'yue\')' % tag)
            await pg.evaluate("(()=>{ window.__ccShift=JOBS.runShift(GAME,'yue'); })()")
            await pg.wait_for_timeout(1500)
    seen_lines = []; snap_at = None
    target = await pg.evaluate("((id)=>{ const Y=SHOP_JOBS_AA828.yueMeal; const c=CHARACTERS[id]; return {own:JOBS.yueOwn?JOBS.yueOwn(c):null, ask:Y.ask, narr:Y.narr}; })", who)
    for i in range(120):
        s = await L.state(pg)
        t = s.get('dtext') or ''
        if t and (not seen_lines or seen_lines[-1] != t): seen_lines.append(t)
        if t and (t == target.get('own') or t == target.get('ask') or t == target.get('narr')):
            snap_at = await pg.evaluate(PEOPLE, {'who': who}); break
        if not s.get('dlg') and not s.get('choices') and not await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)"): break
        if s.get('choices'):
            await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(b) b.click(); })()")
        elif s.get('dlg'):
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    out['lines'] = seen_lines[-12:]; out['target'] = target
    R.note('[%s] 這一班演到的句子（最後 12 句）：%s' % (tag, J(seen_lines[-12:])))
    if snap_at:
        out['at_line'] = snap_at
        await pg.screenshot(path=os.path.join(OUT, 'yue_%s_game.png' % tag))
        her = snap_at.get('her'); pl = snap_at.get('player') or {'x': 0, 'z': 0}
        c = [her['x'], her['z']] if her else [pl['x'], pl['z']]
        wsave(await pg.evaluate(SNAP, {'from': [c[0], 7.5, c[1] + 0.01], 'at': [c[0], 0, c[1]], 'fov': 70}), 'yue_%s_top.jpg' % tag)
        R.note('[%s] 她那一句出來的時候（%s）：她在店裡=%s %s；祐廷 %s；距離 %s；1 m 內家具 %s；店裡所有人 %s' % (tag, snap_at['dlg'][:30], bool(her), J(her), J(snap_at.get('player')), J(snap_at.get('rel')), J(snap_at.get('furn1m')), J(snap_at['people'])))
        R.check('[%s] 她那一句演的時候，3D 店裡有她（%s）' % (tag, who), bool(her and her.get('vis')), '只有台詞、沒有人' if not her else J(her))
    else:
        R.check('[%s] 這一班演到她那一句' % tag, False, J(seen_lines[-6:]))
    for _ in range(60):
        if not await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)"): break
        await L.advance_dialogs(pg, cdp, R, lambda q: not q['dlg'] and not q['choices'], max_steps=10)
    await pg.wait_for_timeout(3000)
    after = await pg.evaluate(PEOPLE, {'who': who}); out['after_shift'] = after
    await pg.screenshot(path=os.path.join(OUT, 'yue_%s_after.png' % tag))
    R.note('[%s] 這一班演完（%s %s）：她在店裡=%s %s；所有人 %s' % (tag, after['zone'], after['hour'], bool(after.get('her')), J(after.get('her')), J(after['people'])))
    res[case] = out


async def main():
    print('CC 越好吃同學來吃飯 3D：SHA %s；CASES %s；Playwright ≠ iPhone' % (SHA or '?', CASES), flush=True)
    sv0 = json.load(open(fix_path(FIX), encoding='utf-8'))
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for case in CASES:
            try:
                await run_case(pg, cdp, sv0, case, res)
            except Exception as e:
                R.check('[%s] 沒有中斷' % case, False, repr(e)[:300])
                await pg.screenshot(path=os.path.join(OUT, 'crash_%s.png' % case))
            await pg.goto(URL); await L.wait_loaded(pg)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'yue_meal.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
