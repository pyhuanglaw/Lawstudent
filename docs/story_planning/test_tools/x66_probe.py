"""BB：X66 118 巷九間店（LAWWW d8b76104；照 tests/flow_l118_shops.py 的滇香小館，擴到其他八間）。
每間：[前置] L.load_state 到 2025-09-09（二）該店門外人行道（營業中的時間）→ 照玩家：門口按「進○○」→ 店裡（正式模型）→ 店員 1 位在配置的位置 →
櫃台「點餐」扣錢 → 每張椅子：引擎移動模擬走得到；前 3 張真的坐下、站起來 → 「離開○○」回到人行道。
另外：沒開的時間（03:00）門口按下去的那一句；晚上 20:30 店裡往門外看（巷子變暗）截圖。"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SHOPS = os.environ.get('SHOPS', 'self,tea,home,cafe2,pasta,korea,omu,noodle2,dian').split(',')
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}
res = {}
async def talk_through(pg, cdp, max_s=90, pick=None):
    log = []; t0 = time.time()
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(b=>b.textContent.includes(t)); if(e) break; } e=e||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(pick or []))
            log.append('▶' + c[2][:30]); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700); continue
        if s['dlg']:
            await pg.wait_for_timeout(700); t = (await L.state(pg))['dtext'][:60]
            if t and (not log or log[-1] != t): log.append(t)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['busy']: await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(900); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True, log
    return False, log
async def load_at(pg, d, hour, so):
    await L.load_state(pg, {'zone': 'lane118', 'hour': hour, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': so['x'], 'z': so['z'], 'yaw': so['yaw']}})
    await pg.wait_for_timeout(5000)
async def one_shop(pg, cdp, run, sid, d):
    r = {'shop': sid}; res[sid] = r
    LL = await pg.evaluate("L118_SHOP_LAYOUTS[%s]" % json.dumps(sid)); nm = LL['name']; so = LL['street']; zone = LL['zone']
    hrs = await pg.evaluate("(id=>{ const s=L118.shop(id); return s?s.hours:null; })(%s)" % json.dumps(sid)); r['hours'] = hrs
    # 找一個營業中的時間（週二）
    hour = None
    for hh in [12.25, 13.0, 15.0, 18.5, 19.5, 11.5, 10.5, 9.0, 8.0, 7.5]:
        if await pg.evaluate("(a=>L118.isOpen(a[0],{hour:a[1],day:a[2],weekday:2}))(%s)" % json.dumps([sid, hh, d])): hour = hh; break
    r['openHour'] = hour
    await load_at(pg, d, hour or 12.25, so); run.setup('[前置] 讀檔 9/9（二）%.2f %s 門外' % (hour or 12.25, nm))
    await L.close_panels(pg, cdp)
    it = await L.find_it(pg, '進' + nm)
    ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, nm + '門口')
    s = await L.state(pg); r['doorLabel'] = s['interact']
    run.check('%s：門口按鈕「進%s」' % (nm, nm), ok and s['interact'].startswith('進' + nm), s['interact'])
    await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % json.dumps(zone)): break
        s = await L.state(pg)
        if s['dlg'] or s['choices']: await talk_through(pg, cdp, 20)
        await pg.wait_for_timeout(1000)
    for _ in range(40):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, sid + '_01_inside')
    formal = await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)")
    r['inside'] = {'zone': s['zone'], 'formal': formal, 'stand': s['stand'], 'interact': s['interact']}
    run.check('%s：進到店裡（%s、正式模型）、站得住、不在「離開」上' % (nm, zone), s['zone'] == zone and formal and s['stand'] and not s['interact'].startswith('離開'), json.dumps(r['inside'], ensure_ascii=False))
    if s['zone'] != zone: return
    ck = await pg.evaluate("GAME.E.npcs.filter(n=>n.clerk).map(q=>({x:+q.obj.position.x.toFixed(2), z:+q.obj.position.z.toFixed(2), vis:q.obj.visible!==false}))")
    r['clerk'] = ck
    run.check('%s：店員 1 位在櫃台後面' % nm, len(ck) == 1 and abs(ck[0]['x'] - LL['clerk']['x']) < 0.15 and abs(ck[0]['z'] - LL['clerk']['z']) < 0.15, json.dumps(ck))
    its = await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>({label:i.label||'',x:i.x,z:i.z,seat:!!i.seat,exit:i.exit?i.exit.to:''}))")
    r['labels'] = sorted(set(i['label'] for i in its if not i['seat']))
    order = next((i for i in its if i['label'].startswith('點餐') or i['label'].startswith('結帳') or '點' in i['label'][:3]), None)
    if order and await L.go_to(pg, cdp, run, order['x'], order['z'], 0.5, '櫃台'):
        lab = (await L.state(pg))['interact']; m0 = await pg.evaluate("GAME.G.money")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
        done, log = await talk_through(pg, cdp, 90); m1 = await pg.evaluate("GAME.G.money")
        r['order'] = {'label': lab, 'log': log[:10], 'money': [m0, m1]}; await run.shot(pg, sid + '_02_order')
        run.check('%s：櫃台「%s」→ 點餐、扣錢' % (nm, lab), done and m1 < m0, ' / '.join(log[:6]) + '；%s→%s' % (m0, m1))
    else: run.check('%s：找得到點餐的互動點' % nm, False, json.dumps(r['labels'], ensure_ascii=False))
    seats = [i for i in its if i['seat']]
    P = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
    reach = await pg.evaluate("(a=>a[1].map(s=>{ try{ const r=GAME.E.simWalk(a[0][0],a[0][1],s.x,s.z); const d=r&&r.x!=null?Math.hypot(r.x-s.x,r.z-s.z):99; return +d.toFixed(2); }catch(e){ return -1; } }))(%s)" % json.dumps([P, seats]))
    unreach = [(s['x'], s['z'], d) for s, d in zip(seats, reach) if not (0 <= d <= 0.8)]
    r['seats'] = {'n': len(seats), 'unreachable': unreach}
    run.check('%s：%d 張椅子的互動點都走得到（引擎移動模擬）' % (nm, len(seats)), not unreach, json.dumps(unreach))
    satok = []
    for s0 in seats[:3]:
        ok = await L.go_to(pg, cdp, run, s0['x'], s0['z'], 0.45, '椅子')
        lab = (await L.state(pg))['interact']
        if not (ok and lab.startswith('坐')): satok.append(('走不到或沒有坐下', s0['x'], s0['z'], lab)); continue
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = False
        while time.time() - t0 < 30:
            q = await L.state(pg)
            if q['pose'] == 'sit': sat = True; break
            if q['choices'] or q['dlg']: await talk_through(pg, cdp, 15, pick=['坐', '休息'])
            await pg.wait_for_timeout(500)
        await talk_through(pg, cdp, 20)
        q = await L.state(pg)
        if q['pose'] == 'sit': await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
        q = await L.state(pg); stood = q['pose'] != 'sit' and q['stand']
        satok.append(('ok' if sat and stood else ('沒坐下' if not sat else '站不起來'), s0['x'], s0['z'], lab))
    r['sit3'] = satok; await run.shot(pg, sid + '_03_after_sit')
    run.check('%s：前 3 張椅子真的坐下、站起來' % nm, all(x[0] == 'ok' for x in satok), json.dumps(satok, ensure_ascii=False))
    it = await L.find_it(pg, '離開' + nm)
    ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.4, '店門')
    lab = (await L.state(pg))['interact']
    if ok: await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500); s = await L.state(pg)
    r['exit'] = {'label': lab, 'zone': s['zone'], 'x': s['x'], 'z': s['z'], 'interact': s['interact']}
    run.check('%s：「離開%s」回到人行道、站得住、不在「進店」上' % (nm, nm), lab.startswith('離開' + nm) and s['zone'] == 'lane118' and s['stand'] and math.hypot(s['x'] - so['x'], s['z'] - so['z']) < 0.8 and not s['interact'].startswith('進' + nm), json.dumps(r['exit'], ensure_ascii=False))
async def main():
    run = L.Run('x66', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        for sid in SHOPS:
            try: await one_shop(pg, cdp, run, sid, d)
            except Exception as e: run.check('%s：腳本例外' % sid, False, repr(e)[:200])
            json.dump(res, open(os.path.join(OUT, 'x66_res.json'), 'w'), ensure_ascii=False, indent=1)
        # 沒開的時間
        LL = await pg.evaluate("L118_SHOP_LAYOUTS.korea"); await load_at(pg, d, 3.0, LL['street']); run.setup('[前置] 9/10 03:00 韓食小廚門外'); await L.close_panels(pg, cdp)
        it = await L.find_it(pg, '進' + LL['name'])
        if it and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '門口'):
            lab = (await L.state(pg))['interact']; await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            done, log = await talk_through(pg, cdp, 30); z = await pg.evaluate("GAME.G.zone")
            res['closed'] = {'label': lab, 'log': log, 'zone': z}; await run.shot(pg, 'closed_0300')
            run.check('沒開的時間按「進店」：鐵門拉下來一半、沒有進去', z == 'lane118' and any('鐵門' in t for t in log), json.dumps(res['closed'], ensure_ascii=False))
        # 晚上：店裡往門口看
        LL = await pg.evaluate("L118_SHOP_LAYOUTS.cafe2"); await load_at(pg, d, 20.5, LL['street']); run.setup('[前置] 9/9 20:30 慢讀咖啡門外'); await L.close_panels(pg, cdp)
        await run.shot(pg, 'night_lane_outside')
        it = await L.find_it(pg, '進' + LL['name'])
        if it and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '門口'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(9000); await talk_through(pg, cdp, 20)
            ex = await L.find_it(pg, '離開' + LL['name'])
            if ex: await pg.evaluate("(a=>{ const E=GAME.E, P=E.player.obj.position; E.cam.yaw=Math.atan2(P.x-a[0],P.z-a[1]); })(%s)" % json.dumps([ex['x'], ex['z']]))
            await pg.wait_for_timeout(2500); await run.shot(pg, 'night_inside_look_out')
        json.dump(res, open(os.path.join(OUT, 'x66_res.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        run.check('劇情自動走路沒有用到卡住保險', (await pg.evaluate("GAME.walkFallbacks||0")) == 0)
        await b.close()
    run.finish()
asyncio.run(main())
