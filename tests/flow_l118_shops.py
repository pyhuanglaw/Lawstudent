"""118 巷的店走得進去（LANE118-SHOPS-1020；LAWWW2-C 臨時接線 src/l118_shops3d.js）：真實玩家流程。
[前置／捷徑] 讀檔到 2025-09-09（二）12:15 118 巷滇香小館門口外面的人行道（大一上第 2 週）。手機模擬橫向、不用 turbo；選項照第一個選。
  1. 巷子裡店門口的按鈕是「進滇香小館」→ 進到店裡（區域 l118_dian、正式模型載入）；站得住、不會一進來就在「離開」上
  2. 店員站在店裡（櫃台後面）
  3. 走到櫃台前面「點餐（滇香小館）」→ 點餐（AA_280：「坐這邊。椒麻雞今天比較辣喔。」）
  4. 走到桌子旁邊坐下（坐姿）、站起來
  5. 「離開滇香小館」→ 回到 118 巷（店門口外面的人行道），不會一出來就在「進滇香小館」上
  6. 沒有 JS 例外；劇情自動走路沒有用到卡住保險
這是 Playwright 手機模擬，不是 iPhone 實機。用法：python3 tests/flow_l118_shops.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_l118_shops'
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}


async def talk_through(pg, cdp, until, max_s=90):
    log = []; t0 = time.time()
    while time.time() - t0 < max_s:
        if await pg.evaluate(until): return True, log
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2,e.textContent]; })()")
            if c: log.append('▶' + c[2][:30]); await L.touch_tap(cdp, c[0], c[1])
        elif s['dlg']:
            t = (s['dtext'] or '')[:60]
            if not log or log[-1] != t: log.append(t)
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    return False, log


async def main():
    run = L.Run('flow_l118_shops', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        LL = await pg.evaluate("L118_SHOP_LAYOUTS.dian")
        so = LL['street']['spawn_out']
        run.setup(f'讀檔：2025-09-09（二）12:15 118 巷滇香小館門口外面的人行道 ({so["x"]}, {so["z"]})')
        await L.load_state(pg, {'zone': 'lane118', 'hour': 12.25, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': so['x'], 'z': so['z'], 'yaw': so['yaw']}})
        await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
        await run.shot(pg, '01_lane_outside')
        s = await L.state(pg)
        run.check('0. 出生在店門口外面的人行道：站得住、互動鍵不是「進滇香小館」', s['zone'] == 'lane118' and s['stand'] and not s['interact'].startswith('進滇香'), json.dumps(s, ensure_ascii=False))
        # 1. 進店
        it = await L.find_it(pg, '進滇香小館')
        ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '滇香小館門口')
        s = await L.state(pg); await run.shot(pg, '02_lane_door')
        run.check('1. 巷子裡店門口的按鈕是「進滇香小館」', ok and s['interact'].startswith('進滇香小館'), s['interact'])
        await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone==='l118_dian'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        for _ in range(40):
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2500); s = await L.state(pg); await run.shot(pg, '03_inside_door')
        formal = await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)")
        run.check('1. 進到店裡（l118_dian、正式模型）、站得住、不會一進來就在「離開」上', s['zone'] == 'l118_dian' and formal and s['stand'] and not s['interact'].startswith('離開'), json.dumps(dict(s, formal=formal), ensure_ascii=False))
        # 2. 店員
        ck = await pg.evaluate("(()=>{ const n=GAME.E.npcs.filter(n=>n.clerk); return n.map(q=>({x:+q.obj.position.x.toFixed(2), z:+q.obj.position.z.toFixed(2)})); })()")
        run.check('2. 店員站在店裡（櫃台後面）', len(ck) == 1 and abs(ck[0]['x'] - LL['clerk']['x']) < 0.1 and abs(ck[0]['z'] - LL['clerk']['z']) < 0.1, json.dumps(ck))
        # 3. 點餐
        it = await L.find_it(pg, '點餐（滇香小館）')
        ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.5, '櫃台前面')
        s = await L.state(pg); await run.shot(pg, '04_counter')
        run.check('3. 走到櫃台前面，互動鍵「點餐（滇香小館）」', ok and s['interact'].startswith('點餐（滇香小館）'), s['interact'])
        m0 = await pg.evaluate("GAME.G.money")
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(800)
        done, log = await talk_through(pg, cdp, "!GAME.E.player.busy&&!document.querySelector('#dlg:not(.hide)')&&!document.querySelector('#choices button')", 90)
        m1 = await pg.evaluate("GAME.G.money")
        run.check('3. 點餐：店員招呼、點菜（AA_280）、扣錢', done and any('椒麻雞' in t or '內用' in t for t in log) and m1 < m0, ' / '.join(log[:8]) + f'；{m0}→{m1}')
        # 4. 坐下
        seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const it=GAME.E.interactables.filter(i=>i.seat).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0]; return it?{x:it.x,z:it.z,label:it.label}:null; })()")
        ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'], 0.45, '桌子')
        s = await L.state(pg)
        run.check('4. 走到桌子旁邊，互動鍵「坐下」', ok and s['interact'].startswith('坐'), s['interact'])
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); sat = None
        while time.time() - t0 < 40:
            s = await L.state(pg)
            if s['pose'] == 'sit': sat = s; break
            if s['choices']:
                c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>/坐|休息/.test(b.textContent))||bs[0]; const r=e.getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; })()")
                await L.touch_tap(cdp, c[0], c[1])
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(1500); await run.shot(pg, '05_sit')
        run.check('4. 坐下（坐姿）', bool(sat), json.dumps(sat, ensure_ascii=False))
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], max_steps=30)
        if s['pose'] == 'sit': await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
        s = await L.state(pg)
        run.check('4. 站起來、站得住', s['pose'] != 'sit' and s['stand'], json.dumps(s, ensure_ascii=False))
        # 5. 離開
        it = await L.find_it(pg, '離開滇香小館')
        ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.4, '店門')
        s = await L.state(pg); await run.shot(pg, '06_exit')
        run.check('5. 走回店門，互動鍵「離開滇香小館」', ok and s['interact'].startswith('離開滇香小館'), s['interact'])
        await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(3000); s = await L.state(pg); await run.shot(pg, '07_back_lane')
        run.check('5. 回到 118 巷店門口外面的人行道、站得住、互動鍵不是「進滇香小館」', s['zone'] == 'lane118' and s['stand'] and math.hypot(s['x'] - so['x'], s['z'] - so['z']) < 0.8 and not s['interact'].startswith('進滇香'), json.dumps(s, ensure_ascii=False))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        run.check('6. 沒有 JS 例外', not errs, '；'.join(errs[:3]))
        run.check('6. 劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    run.finish()

asyncio.run(main())
