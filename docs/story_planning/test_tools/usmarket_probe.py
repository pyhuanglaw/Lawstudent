"""BB（帳號 A）2026-10-21：US-MARKET-STREET（LAWWW2 8512b3b0＋fa7c85e2 → 開發分支 d2252a05；LAWWW 22:30 派）美國超市街（可以走的戶外區域）。
  WALK（照玩家，2028-09-20 週三 14:00 社區）：「出門（去超市）」→ 到超市街公車站（不是直接進超市）→ 走過停車場到草原超市「進草原超市」（IN 門）→ 超市裡「離開超市」→ 站在 OUT 門外
       → 過四線道（斑馬線）到「進竹葉亞洲超市」→ 亞洲超市裡只剩「出門」→ 回超市街 → 「搭公車（回社區）」→ 回社區。每一段記走路有沒有卡住（go_to 成功、花多久）、截圖看鏡頭有沒有穿牆。
  SUN：2028-09-24（日）14:00 超市街：點亞洲超市的門＝公休（AA_370：週一～週六 10:00～21:00、週日公休），不能進去。
  LOOK：白天（9/20 14:00＝summer）、20:00、秋天（10/20 14:00＝autumn）、下雪（12/10 14:00＝snow）各拍公車站、停車場、斑馬線、亞洲超市四個角度（劇情鏡頭只動鏡頭）。四季照 us3d.js usSeasonKey。
  已知還沒做（LAWWW：不算 FAIL）：晚上停車場偏暗、車不會動、沒有路人。畫面 READY_FOR_ART_REVIEW，場景美術只有使用者能標，這裡只記看到什麼。
【前置】使用者 9/25 存檔＋美國路線旗標（同 us_life_probe：EXCHANGE_ROUTE US、US_ARRIVED…、自己一個人去）改日期；LOOK 直接讀檔在超市街。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 usmarket_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=WALK,SUN,LOOK）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', 'WALK,SUN,LOOK').split(',')
bad = []; out = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
USF = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'Y4_PATH': 'bar', 'USL_JETLAG': True}
USJS = "G.flags.US_ARRIVED_DAY=D('2028-08-02'); G.flags.Y4_PATH_DAY=D('2028-06-08'); G.flags.US1='alone';"
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), P=GAME.E.player.obj.position; return {key:d.key, h:+G.hour.toFixed(2), zone:G.zone, x:+P.x.toFixed(1), z:+P.z.toFixed(1)}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+GAME.G.hour.toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(at()+' '+(n?n+'：':'')+String(t||'')); }catch(e){} return o.apply(this,arguments); };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push(at()+' '+((w&&w.name)?w.name+'：':'')+String(t||'')); }catch(e){} return s0.apply(this,arguments); };
  const ot=GAME.toast; GAME.toast=function(t){ try{ window.__LOG.push(at()+' TOAST:'+String(t)); }catch(e){} return ot.apply(this,arguments); };
  if(GAME.titleCard&&!GAME.titleCard.__bb){ const tc=GAME.titleCard; const f=function(t,s){ try{ window.__LOG.push(at()+' CARD:'+t+(s?'｜'+s:'')); }catch(e){} return tc.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } })()"""
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({x:+i.x.toFixed(1),z:+i.z.toFixed(1),label:i.label||'',to:i.exit&&i.exit.to||null})))()"


async def load(p, base, key, h, zone):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    G['flags'].update(USF)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        G['flags'][k] = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
    G['flags'].update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k); %s })()" % USJS)
    await L.phone_away(pg, cdp)
    return b, pg, cdp, errs


async def drain(pg, cdp, secs=120):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/搭|出發|好|走/.test(x.textContent))||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,24))]; })()")
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶ %s （%s）' % (c[2], ' / '.join(c[3]))); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(900); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False


async def use(pg, cdp, run, pat, want_zone=None, max_s=300):
    """走到標籤符合 pat 的互動點、點它（照玩家）。回傳 (走到了嗎, 花幾秒, 之後的 zone)"""
    its = await pg.evaluate(ITS); it = next((i for i in its if pat in i['label']), None)
    if not it: say('   ⚠ 找不到「%s」（有：%s）' % (pat, [i['label'] for i in its])); return False, 0, None
    t0 = time.time(); ok = await L.go_to(pg, cdp, run, it['x'], it['z'], 0.9, it['label'], max_s=max_s); dt = round(time.time() - t0)
    lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
    say('   走到「%s」：%s，%d 秒；互動鈕「%s」' % (it['label'], ok, dt, lab))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); await drain(pg, cdp)
    if want_zone:
        for k in range(20):
            if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % json.dumps(want_zone)): break
            await pg.wait_for_timeout(800)
    return ok, dt, await pg.evaluate("GAME.G.zone")


def chk(run, sid, name, ok, info=''):
    run.check('%s：%s' % (sid, name), ok, info)
    if not ok: bad.append('%s：%s（%s）' % (sid, name, str(info)[:200]))


async def walk(p, base, run):
    b, pg, cdp, errs = await load(p, base, '2028-09-20', 14.0, 'us_outside')
    run.setup('[前置] WALK：美國路線（自己一個人）2028-09-20（三）14:00 社區（us_outside）')
    steps = []
    ok, dt, z = await use(pg, cdp, run, '出門（去超市）', 'us_market_street'); sn = await pg.evaluate(SNAP); await run.shot(pg, 'walk_01_bus_stop')
    steps.append(('社區→超市街', ok, dt, sn)); say('   下公車：%s' % json.dumps(sn, ensure_ascii=False))
    chk(run, 'WALK', '「出門（去超市）」到超市街公車站（zone us_market_street、站在站牌旁），不是直接進超市', sn['zone'] == 'us_market_street' and abs(sn['x'] + 22.6) < 3 and abs(sn['z'] - 12.9) < 3, json.dumps(sn, ensure_ascii=False))
    ok, dt, z = await use(pg, cdp, run, '進草原超市', 'us_market'); sn = await pg.evaluate(SNAP); steps.append(('停車場→草原超市 IN', ok, dt, sn))
    chk(run, 'WALK', '走過停車場到草原超市 IN 門、進得去（%d 秒）' % dt, ok and sn['zone'] == 'us_market', json.dumps(sn, ensure_ascii=False))
    await run.shot(pg, 'walk_02_in_market')
    its = await pg.evaluate(ITS); say('   草原超市裡的出口：%s' % [i for i in its if i['to']])
    ok, dt, z = await use(pg, cdp, run, '離開超市', 'us_market_street'); sn = await pg.evaluate(SNAP); await run.shot(pg, 'walk_03_pb_out')
    steps.append(('離開超市→OUT 門外', ok, dt, sn))
    chk(run, 'WALK', '「離開超市」站在 OUT 門外（-13.5,-18.5 附近）', sn['zone'] == 'us_market_street' and abs(sn['x'] + 13.5) < 3 and abs(sn['z'] + 18.5) < 3, json.dumps(sn, ensure_ascii=False))
    ok, dt, z = await use(pg, cdp, run, '進竹葉亞洲超市', 'us_asian_market', max_s=420); sn = await pg.evaluate(SNAP); steps.append(('過馬路→亞洲超市', ok, dt, sn))
    chk(run, 'WALK', '過四線道（斑馬線）到竹葉亞洲超市、進得去（%d 秒）' % dt, ok and sn['zone'] == 'us_asian_market', json.dumps(sn, ensure_ascii=False))
    await run.shot(pg, 'walk_04_in_asian')
    its = await pg.evaluate(ITS); exits = [i for i in its if i['to']]; say('   亞洲超市裡的出口：%s' % json.dumps(exits, ensure_ascii=False))
    chk(run, 'WALK', '亞洲超市裡只剩「出門」一個出口', len(exits) == 1 and exits[0]['label'] == '出門', json.dumps(exits, ensure_ascii=False))
    ok, dt, z = await use(pg, cdp, run, '出門', 'us_market_street'); sn = await pg.evaluate(SNAP); await run.shot(pg, 'walk_05_am_out')
    steps.append(('亞洲超市→超市街', ok, dt, sn))
    chk(run, 'WALK', '亞洲超市「出門」回超市街（-4.5,35.8 附近）', sn['zone'] == 'us_market_street' and abs(sn['x'] + 4.5) < 3 and abs(sn['z'] - 35.8) < 3, json.dumps(sn, ensure_ascii=False))
    ok, dt, z = await use(pg, cdp, run, '搭公車（回社區）', 'us_outside', max_s=420); sn = await pg.evaluate(SNAP); steps.append(('超市街→社區', ok, dt, sn))
    chk(run, 'WALK', '走回公車站「搭公車（回社區）」回到社區（%d 秒）' % dt, ok and sn['zone'] == 'us_outside', json.dumps(sn, ensure_ascii=False))
    await run.shot(pg, 'walk_06_back_home')
    lines = await pg.evaluate("window.__LOG||[]"); out['WALK'] = {'steps': steps, 'lines': lines[-40:], 'errs': errs[:3]}
    say('   旁白／字卡：%s' % json.dumps(lines[-12:], ensure_ascii=False))
    chk(run, 'WALK', '沒有 JS 例外', not errs, json.dumps(errs[:2], ensure_ascii=False))
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def sun(p, base, run):
    for key, h, tag in (('2028-09-24', 14.0, '週日 14:00'), ('2028-09-20', 21.5, '週三 21:30')):
        b, pg, cdp, errs = await load(p, base, key, h, 'us_market_street')
        run.setup('[前置] SUN：%s %.2f 直接在超市街' % (key, h))
        await pg.evaluate("window.__LOG=[]")
        ok, dt, z = await use(pg, cdp, run, '進竹葉亞洲超市', None, max_s=420)
        await pg.wait_for_timeout(2500); z = await pg.evaluate("GAME.G.zone"); lines = await pg.evaluate("window.__LOG||[]")
        await run.shot(pg, 'sun_%s' % key)
        say('   %s 點亞洲超市的門：zone=%s；%s' % (tag, z, json.dumps(lines[-6:], ensure_ascii=False)))
        chk(run, 'SUN', '%s 亞洲超市沒開、進不去（有說明）' % tag, z != 'us_asian_market' and any(('沒有開' in l) or ('公休' in l) or ('下次開門' in l) for l in lines), json.dumps({'zone': z, 'lines': lines[-4:]}, ensure_ascii=False))
        out['SUN_' + key] = {'zone': z, 'lines': lines[-10:], 'errs': errs[:3]}
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


VIEWS = [('bus', [-28, 2.2, 18], [-10, 1.5, -5]), ('lot', [-20, 3.0, 0], [10, 1.5, -20]), ('cross', [-12, 2.0, 24], [-4, 1.2, 34]), ('asian', [-4.5, 2.0, 26], [-4.5, 2.0, 38])]


async def look(p, base, run):
    for key, h, tag in (('2028-09-20', 14.0, 'day'), ('2028-09-20', 20.0, 'night'), ('2028-10-20', 14.0, 'autumn'), ('2028-12-10', 14.0, 'snow')):
        b, pg, cdp, errs = await load(p, base, key, h, 'us_market_street')
        run.setup('[前置] LOOK：%s %.2f 直接在超市街；劇情鏡頭只動鏡頭' % (key, h))
        await pg.wait_for_timeout(5000)
        sea = await pg.evaluate("(()=>{ let k=null; GAME.E.scene.traverse(o=>{ if(o.userData&&o.userData.usSeason&&!k) k=o.userData.usSeason; }); return k; })()")
        await run.shot(pg, 'look_%s_default' % tag)
        for nm, pos, lk in VIEWS:
            await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, lk]))
            await pg.wait_for_timeout(2500); await run.shot(pg, 'look_%s_%s' % (tag, nm))
        await pg.evaluate("GAME.E.endCinematic()")
        say('   %s（%s %.2f）：模型四季＝%s' % (tag, key, h, sea))
        want = {'day': 'summer', 'night': 'summer', 'autumn': 'autumn', 'snow': 'snow'}[tag]
        chk(run, 'LOOK', '%s：超市街正式模型的四季是 %s' % (tag, want), sea == want, str(sea))
        out['LOOK_' + tag] = {'season': sea, 'errs': errs[:3]}
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------------------------------------------------------- CAM（US-PATROL-1021，LAWWW2 us_market_cam／us_ms_seethru；LAWWW 10-22 06:46 派）
CAMIN = """(()=>{ const E=GAME.E, c=E.camera.position, n=E.nav, P=E.player.obj.position; const inside=!!n&&c.x>=n.ox&&c.x<=n.ox+n.w&&c.z>=n.oz&&c.z<=n.oz+n.h;
  return {zone:GAME.G.zone, cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+P.x.toFixed(2),+P.z.toFixed(2)], nav:n?[n.ox,n.oz,+(n.ox+n.w).toFixed(2),+(n.oz+n.h).toFixed(2)]:null, inside}; })()"""
POLE = """(()=>{ const out=[], v=new THREE.Vector3(); GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; const ms=[].concat(o.material); if(!ms.some(m=>m&&m.userData&&m.userData.seeThrough)) return;
  o.getWorldPosition(v); out.push({name:o.name||'', mats:ms.map(m=>m&&m.name||''), x:+v.x.toFixed(1), z:+v.z.toFixed(1)}); });
  return {n:out.length, near:out.filter(q=>Math.hypot(q.x+22.6,q.z-14.9)<3).slice(0,6), mats:[...new Set(out.flatMap(q=>q.mats))].slice(0,20)}; })()"""


async def cam(p, base, run):
    b, pg, cdp, errs = await load(p, base, '2028-09-20', 14.0, 'us_outside')
    run.setup('[前置] CAM：美國路線（自己一個人）2028-09-20（三）14:00 社區；照玩家搭公車到超市街、走進兩間超市')
    ok, dt, z = await use(pg, cdp, run, '出門（去超市）', 'us_market_street'); await pg.wait_for_timeout(4000)
    sn = await pg.evaluate(SNAP); po = await pg.evaluate(POLE); c0 = await pg.evaluate(CAMIN); await run.shot(pg, 'cam_01_bus_stop')
    out['CAM_pole'] = {'snap': sn, 'pole': po, 'cam': c0}; say('   下公車：%s；網點透空：%s' % (json.dumps(sn, ensure_ascii=False), json.dumps(po, ensure_ascii=False)[:400]))
    chk(run, 'CAM', '下公車（%s）：超市街的金屬桿有網點透空（%d 個網格；站牌柱附近 %d 個）' % (sn['zone'], po['n'], len(po['near'])), sn['zone'] == 'us_market_street' and po['n'] > 0, json.dumps(po, ensure_ascii=False)[:500])
    for pat, zid, back in (('進草原超市', 'us_market', '離開超市'), ('進竹葉亞洲超市', 'us_asian_market', '出門')):
        ok, dt, z = await use(pg, cdp, run, pat, zid, max_s=420); await pg.wait_for_timeout(2500)
        c = await pg.evaluate(CAMIN); out['CAM_' + zid] = c; await run.shot(pg, 'cam_%s_enter' % zid)
        chk(run, 'CAM', '%s：一進門，鏡頭在店裡（鏡頭 %s、店的範圍 %s）' % (zid, c['cam'], c['nav']), c['zone'] == zid and c['inside'], json.dumps(c, ensure_ascii=False))
        await use(pg, cdp, run, back, 'us_market_street')
    chk(run, 'CAM', '沒有 JS 例外', not errs, json.dumps(errs[:2], ensure_ascii=False))
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def main():
    run = L.Run('usmarket', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        for sid, f in (('WALK', walk), ('SUN', sun), ('LOOK', look), ('CAM', cam)):
            if sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            try: await f(p, base, run)
            except Exception as e: say('   ! 例外 %r' % e); bad.append('%s 例外 %r' % (sid, e)); run.check('%s 跑完' % sid, False, repr(e)[:200])
            say('   （%.0f 秒）' % (time.time() - t0))
            json.dump({'out': out, 'bad': bad}, open(os.path.join(OUT, 'usmarket.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
    run.finish()
asyncio.run(main())
