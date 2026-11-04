"""CC（帳號 A）11-04：ADE_int（BB 07:56；阿德影印 v1c 接進遊戲 dfca69671 以後）。CASES 預設 IN,SHOTS,CUST,ENC,JOB,SUNNY。
  IN    【前置／捷徑】讀檔溫州街門口南邊（14:00、條件事件關閉）→ 點地面走到「進去阿德影印輸出」、按 → 進店（真的走進去）→ 玩家視角截圖
        → 四張「坐下」都走過去坐、起身（站得住、推得動 ≥0.3 m）→ 「印東西」選「印筆記（黑白，約 30 頁）」＝扣 60（AA_655 §5：黑白 A4 2 元 ×30）→ 「買文具」買第一樣 → 走出店（回到溫州街）
  SHOTS 14:00、21:00 各一套 8 角度（固定鏡頭）
  CUST  12:30（三天）【前置／捷徑】讀檔進店、等 25 秒：坐著的客人 ≤ 2、都坐在配置的 4 張電腦椅上
  CLERK（每段都量）阿德在 clerk (−0.95, −3.4) 0.3 m 內
  ENC   柏翰的店內偶遇（19:00～21:30、認識）：【前置／捷徑】設認識、讀檔進店；最多 8 天：他站的地方要是配置 stands 三點之一（0.15 m 內）、站得住、不在家具裡
  JOB   打工：【前置／捷徑】G.jobs.copy＝已經錄取、班表週二三四；週二 17:55 讀檔進店 → 班自動開始 → 點完對話到下班（22:00）→ 取樣玩家位置：三個工作站位（a、b、c 的 me）都到過（0.6 m 內）；下班後卡住檢查
  SUNNY SUNNY SIDE 東側轉角窗從溫州街外面看：14:00、20:00 各一張（固定鏡頭）
  每段都做卡住檢查（cc_gg_int_probe.stuck_check）。Playwright（PC GPU），不是手機實機。
用法：LW_TESTS=<wt>/tests [CASES=IN,JOB] python3 cc_ade_int_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time, types
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright


def load_mod(fn, name):
    path = os.path.join(HERE, fn); src = open(path, encoding='utf-8').read()
    k = src.rstrip().rfind('asyncio.run(main())')
    mod = types.ModuleType(name); mod.__file__ = path
    exec(compile(src[:k], path, 'exec'), mod.__dict__)
    return mod


GI = load_mod('cc_gg_int_probe.py', 'cc_gg_int')
URL, OUT = sys.argv[1], sys.argv[2]
GI.OUT = OUT
check, obs, J, ST = GI.check, GI.obs, GI.json.dumps, GI.ST
CASES = [c.strip() for c in (os.environ.get('CASES') or 'IN,SHOTS,CUST,ENC,JOB,SUNNY').split(',') if c.strip()]
ERRS = []
VIEWS = [('ref_door_in', [0.0, 1.6, 3.9], [0.0, 1.2, -4.6]), ('copiers_left', [1.2, 1.6, 3.2], [-2.2, 1.0, 2.0]),
         ('tables', [1.3, 1.6, 2.4], [-0.3, 0.8, -0.6]), ('rack_east', [-1.3, 1.6, 2.2], [2.2, 1.2, 1.4]),
         ('worktable', [-0.6, 1.6, 0.6], [2.1, 1.0, -1.2]), ('counter_back', [0.6, 1.6, -0.6], [-1.6, 1.1, -3.6]),
         ('back_wall', [0.0, 1.7, 1.2], [0.0, 1.5, -4.6]), ('ceiling', [0.0, 1.3, 2.6], [0.0, 3.0, -2.0])]
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls,tris:ri.triangles}; })"""
UNAIM = "(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
CLERK_JS = """(()=>{ const E=GAME.E; const n=(E.npcs||[]).find(n=>n&&(n.clerk||/阿德/.test(n.name||''))); if(!n||!n.obj) return null; const p=n.obj.position; return {name:n.name||'', x:+p.x.toFixed(2), z:+p.z.toFixed(2), stand:E.canStand?!!E.canStand(p.x,p.z,0.25,0):null}; })()"""
SEATED_JS = """(()=>{ const E=GAME.E, L=(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT.print)||{}; const S=(L.seats||[]);
  return (E.npcs||[]).filter(n=>n&&n.seat&&!n.clerk&&n.obj).map(n=>{ const s=n.seat; const m=S.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.12); return {name:n.name||'', x:+(+s.x).toFixed(2), z:+(+s.z).toFixed(2), inLayout:!!m, label:m&&m.label||null}; }); })()"""
ENC_JS = """(()=>{ const E=GAME.E, L=(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT.print)||{}; const n=(E.npcs||[]).find(n=>n&&n.shopEnc); if(!n||!n.obj) return null; const p=n.obj.position;
  const st=(L.stands||[]).map(q=>({q, d:Math.hypot(q[0]-p.x,q[1]-p.z)})).sort((a,b)=>a.d-b.d)[0];
  return {label:n.talkLabel||'', id:n.id||null, x:+p.x.toFixed(2), z:+p.z.toFixed(2), stand:E.canStand?!!E.canStand(p.x,p.z,0.25,0):null, free:E.nav?!!E.nav.free(p.x,p.z):null, nearest:st?{at:st.q,d:+st.d.toFixed(2)}:null}; })()"""


async def clerk_check(pg, tag):
    c = await pg.evaluate(CLERK_JS)
    check('[%s] 阿德站在櫃台後面 clerk (−0.95, −3.4) 0.3 m 內' % tag, bool(c) and math.hypot(c['x'] + 0.95, c['z'] + 3.4) <= 0.3, J(c))


async def load_in(pg, cdp, h, dd, desc, extra=None):
    GI.DAY, GI.WD = dd['day'], dd['wd']
    await GI.load(pg, cdp, 'wz_print', 0.0, 3.4, h, desc, extra=extra)


async def nextwd(pg, w, key='2025-09-24'):
    return await pg.evaluate("(([k,w])=>{ const d0=STORY.dayOfKey(k); for(let d=d0;d<d0+40;d++){ if(CALENDAR.dateOf(d).wd%%7===w&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d))) return {day:d,wd:w}; } return null; })(%s)" % J([key, w]))


async def case_IN(pg, cdp):
    print('== IN 走進去、坐四張、印東西、買文具、出店', flush=True)
    WED = await nextwd(pg, 3)
    GI.DAY, GI.WD = WED['day'], WED['wd']
    door = None
    await GI.load(pg, cdp, 'wenzhou', -8.0, 2.4, 14.0, '溫州街阿德影印門口南邊', yaw=0)
    its = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>!i.hidden&&i.exit&&i.exit.to==='wz_print').map(i=>({x:i.x,z:i.z,r:i.radius||1.2,label:i.label})))()")
    if its and abs(its[0]['x'] + 8.0) > 3:   # 搬到轉角（WZ_COPY_SHOP moved）
        print('  店門在 %s（搬到轉角）：重讀檔到門口旁' % J(its[0]), flush=True)
        await GI.load(pg, cdp, 'wenzhou', its[0]['x'] + 1.5, its[0]['z'], 14.0, '轉角店門旁', yaw=-math.pi / 2)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    if not await GI.enter_via(pg, cdp, 'IN_enter', {'exitTo': 'wz_print'}, '進去', 'wz_print'): return
    await pg.wait_for_timeout(3000); await pg.screenshot(path=os.path.join(OUT, 'ade_IN_game_view.png'))
    await clerk_check(pg, 'IN')
    seats = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||0.8,label:i.label})))()")
    print('  座位：%s' % J(seats), flush=True)
    check('[IN] 有 4 張客人座位', len(seats) == 4, str(len(seats)))
    for k, s in enumerate(seats):
        tag = 'IN_seat%d' % k
        it = await GI.walk_tap(pg, cdp, tag, {'at': [s['x'], s['z']]}, s['label'])
        if not it: continue
        ok = await GI.wait_js(pg, "!!GAME.E.player.seat&&!GAME.E.player.busy", 20); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, 'ade_%s_seated.png' % tag))
        check('[%s] 坐下了' % tag, ok)
        lab = (await pg.evaluate(ST))['interact']
        if lab.startswith('起身') or lab.startswith('站起'): await L.tap(pg, cdp, '#interact')
        await pg.wait_for_timeout(1500)
        moved = 0.0
        for dx, dy in ((0, 60), (60, 0), (-60, 0), (0, -60)):
            moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
            if moved >= 0.3: break
        st = await L.state(pg)
        check('[%s] 起身：不是坐著、站得住、推得動 ≥0.3 m' % tag, not await pg.evaluate("!!GAME.E.player.seat") and st['stand'] and moved >= 0.3, J({'moved': round(moved, 2), 'stand': st['stand'], 'x': st['x'], 'z': st['z']}))
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>!i.hidden&&(i.label||'').startsWith('印東西')); return i?[i.x,i.z]:null; })()")
    if check('[IN] 有「印東西」', bool(it), J(it)):
        r = await GI.buy_menu(pg, cdp, 'IN_print', None, '印筆記', 60, at=it, label='印東西')
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>!i.hidden&&(i.label||'').startsWith('買文具')); return i?[i.x,i.z]:null; })()")
    if check('[IN] 有「買文具」', bool(it), J(it)):
        if await GI.walk_tap(pg, cdp, 'IN_stat', {'at': it}, '買文具'):
            s0 = await pg.evaluate(ST); lines, menus, odd = await GI.converse(pg, cdp, 'IN_stat', [''], 120); s1 = await pg.evaluate(ST)
            opt = menus[0][0] if menus and menus[0] else ''
            import re as _re
            m = _re.search(r'(\d+)\s*元', opt)
            check('[IN] 買文具第一樣「%s」：扣的錢＝標價' % opt, bool(m) and s0['money'] - s1['money'] == int(m.group(1)), J({'opt': opt, 'money': [s0['money'], s1['money']]}))
    await GI.go_out(pg, cdp, 'IN_out', 'wenzhou')
    await GI.stuck_check(pg, cdp, 'IN', fb0, e0, ERRS)


async def shots(pg, cdp, h, dd):
    tag = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
    await load_in(pg, cdp, h, dd, '影印店門口 %s' % tag)
    await pg.wait_for_timeout(6000)
    await clerk_check(pg, 'SHOTS_%s' % tag)
    await pg.evaluate(HUD + '(false)')
    for name, e, l in VIEWS:
        ri = await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, 'ade_%s_%s.png' % (tag, name)))
        print('  [%s] %s：calls %s、tris %s' % (tag, name, ri['calls'], ri['tris']), flush=True)
    await pg.evaluate(UNAIM); await pg.evaluate(HUD + '(true)')


async def case_SHOTS(pg, cdp):
    print('== SHOTS 14:00、21:00 八角度', flush=True)
    WED = await nextwd(pg, 3)
    for h in (14.0, 21.0): await shots(pg, cdp, h, WED)


async def case_CUST(pg, cdp):
    print('== CUST 12:30 客人', flush=True)
    d0 = await nextwd(pg, 3)
    mx = 0
    for k in range(3):
        dd = {'day': d0['day'] + k, 'wd': (d0['wd'] + k) % 7}
        await load_in(pg, cdp, 12.5, dd, '影印店 12:30')
        await pg.wait_for_timeout(25000)
        sd = await pg.evaluate(SEATED_JS); mx = max(mx, len(sd))
        print('  day %d 坐著的客人：%s' % (dd['day'], J(sd)), flush=True)
        check('[CUST day%d] 坐著的客人 ≤ 2、都在配置的 4 張電腦椅上' % dd['day'], len(sd) <= 2 and all(s['inLayout'] for s in sd), J(sd))
        await clerk_check(pg, 'CUST_day%d' % dd['day'])
        if k == 0: await pg.screenshot(path=os.path.join(OUT, 'ade_CUST_1230.png'))
    obs('[CUST] 三天裡最多同時 %d 位坐著' % mx)


async def case_ENC(pg, cdp):
    print('== ENC 柏翰的店內偶遇', flush=True)
    SM = load_mod('cc_social_smoke_probe.py', 'cc_social_smoke')
    d0 = await nextwd(pg, 3)
    done = False
    for k in range(8):
        dd = {'day': d0['day'] + k, 'wd': (d0['wd'] + k) % 7}
        await load_in(pg, cdp, 19.3, dd, '影印店 19:18')
        r = await pg.evaluate(SM.SETUP_JS, {'id': 'classmate_bohan', 'met': True, 'rel': SM.REL['ACQUAINTANCE'], 'contact': True})
        print('  [前置／捷徑] 柏翰：認識 %s；同一份存檔重讀（進店時才排偶遇）' % J({x: r.get(x) for x in ('stage', 'name')}), flush=True)
        snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
        await L.load_state(pg, snap, quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
        e = await pg.evaluate(ENC_JS)
        print('  day %d 店內偶遇：%s' % (dd['day'], J(e)), flush=True)
        if not e: continue
        await pg.screenshot(path=os.path.join(OUT, 'ade_ENC_day%d.png' % dd['day']))
        check('[ENC] 偶遇的人站在配置 stands 三點之一（0.15 m 內）', bool(e['nearest']) and e['nearest']['d'] <= 0.15, J(e))
        check('[ENC] 站的地方站得住（不在家具裡）', bool(e['stand']), J(e))
        done = True; break
    check('[ENC] 8 天內有一天遇到', done)


async def case_JOB(pg, cdp):
    print('== JOB 打工一班', flush=True)
    TUE = await nextwd(pg, 2)
    jobs = {'copy': {'since': TUE['day'] - 14, 'from': TUE['day'] - 14, 'day': [2, 3, 4], 'shifts': 1, 'skill': 0, 'worked': [TUE['day'] - 7], 'wk': {}, 'brk': {}, 'ot': {}}}
    print('  [前置／捷徑] G.jobs.copy＝已經錄取（14 天前）、班表週二三四、做過 1 班；週二 17:55 讀檔在影印店門口', flush=True)
    await load_in(pg, cdp, 17.92, TUE, '週二 17:55', extra={'jobs': jobs})
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(ERRS)
    t0 = time.time(); samples = []
    while time.time() - t0 < 30:
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)"): break
    run = await pg.evaluate("!!(typeof JOBS!=='undefined'&&JOBS.running)")
    if not run:
        it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.wzJob==='copy'&&!i.hidden); return i?{x:i.x,z:i.z,label:i.label}:null; })()")
        print('  班沒有自己開始，櫃台的按鈕：%s' % J(it), flush=True)
        if it: await GI.walk_tap(pg, cdp, 'JOB_desk', {'at': [it['x'], it['z']]}, it['label'])
    lines, menus, odd = await GI.converse(pg, cdp, 'JOB', None, 600, samples=samples)
    await GI.wait_js(pg, "!(typeof JOBS!=='undefined'&&JOBS.running)", 60)
    s = await pg.evaluate(ST)
    work = await pg.evaluate("(()=>{ const w=(WZ_SHOPS_LAYOUT.print||{}).work||{}; return ['a','b','c'].map(k=>w[k]&&w[k].me?[k,w[k].me.x,w[k].me.z]:null).filter(Boolean); })()")
    seen = {}
    for k, x, z in work:
        seen[k] = min([math.hypot(px - x, pz - z) for _, _, px, pz in samples] or [99])
    print('  工作站位：%s；最近距離：%s；台詞 %d 句' % (J(work), J({k: round(v, 2) for k, v in seen.items()}), len(lines)), flush=True)
    check('[JOB] 下班了（22:00 以後、JOBS.running false）', s['hour'] % 24 >= 21.9 or s['hour'] < 3, J({'hour': s['hour'], 'zone': s['zone']}))
    check('[JOB] 三個工作站位（a、b、c 的 me）都到過（0.6 m 內）', len(seen) == 3 and all(v <= 0.6 for v in seen.values()), J({k: round(v, 2) for k, v in seen.items()}))
    await pg.screenshot(path=os.path.join(OUT, 'ade_JOB_end.png'))
    await GI.stuck_check(pg, cdp, 'JOB', fb0, e0, ERRS)


async def case_SUNNY(pg, cdp):
    print('== SUNNY 東側轉角窗（溫州街外面）', flush=True)
    WED = await nextwd(pg, 3)
    for h in (14.0, 20.0):
        GI.DAY, GI.WD = WED['day'], WED['wd']
        await GI.load(pg, cdp, 'wenzhou', 48.0, -1.0, h, '溫州街 SUNNY SIDE 東邊路口', yaw=-math.pi / 2)
        await pg.wait_for_timeout(6000)
        await pg.evaluate(HUD + '(false)')
        for name, e, l in (('corner', [50.0, 1.7, 0.5], [45.0, 1.6, -7.0]), ('east_wall', [49.0, 1.6, -6.5], [44.6, 1.5, -6.5])):
            await pg.evaluate(AIM + '(%s,%s)' % (J(e), J(l))); await pg.wait_for_timeout(800)
            await pg.screenshot(path=os.path.join(OUT, 'sunny_%02d00_%s.png' % (int(h), name)))
        await pg.evaluate(UNAIM); await pg.evaluate(HUD + '(true)')
    obs('[SUNNY] 只截圖（和室內的窗對不對得上由 BB 判）')


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('pageerror', lambda e: ERRS.append(str(e)[:200]))
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for c in CASES:
            try: await globals()['case_' + c](pg, cdp)
            except Exception as e:
                check('[%s] 沒有例外（探針）' % c, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'EXC_%s.png' % c))
        check('沒有 JS 例外', not ERRS and not errs, J((ERRS + list(errs))[:3]))
        await b.close()
    print('ALL PASS' if not GI.FAILS else 'FAILED %d: %s' % (len(GI.FAILS), '；'.join(GI.FAILS)), flush=True)
    sys.exit(1 if GI.FAILS else 0)

asyncio.run(main())
