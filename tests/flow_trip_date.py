"""真實玩家流程（第 2 級，局部瀏覽器；手機模擬 844×390 觸控，不是實機）：捷運自由出行第二批＋校外約會。
A. DL-06B：[前置] 讀檔到公館、捷運公館站入口旁（週六 14:00，晴天）→ 點「捷運公館站入口」→ 選「九份老街」→ 交通標題卡（兩段：捷運＋客運）→
   九份的 2D 畫面（底圖 d18_base_dusk）→ 選第一個能做的 → 回去 → 回公館。檢查：回到公館、G.places.free.D18＝1、時間往後、扣了車資、沒有 JS 錯誤。
B. DATE-S3／S6：[前置] 和語彤交往中、有她的聯絡方式（讀檔時設旗標）；[前置] 用 INV.flow 開「約人」的選單（等同手機朋友頁按「約」，手機面板的點法另外測）→
   像玩家一樣點：出去玩… → 新北市、桃園：海邊… → 淡水金色水岸 → 明天 → 15:00 出發 → 就這樣約 → 她的「答應（交往中）」那一句（INVITE-MENU-1030／AA_535：選單分層）。
   [前置] 把時間撥到隔天 14:58（等出發提示；不用 turbo、不瞬移）→「現在要出發嗎？」→ 出發 → 淡水的 2D 畫面、她的抵達句 → 點兩個互動點 → 差不多了 → 收尾句 → 回程。
   檢查：正式校外約會 1 次（G.dateLog.heroine_03.count）、DATED_1、行程 done、記得點過的互動點、沒有 JS 錯誤。
用法：python3 tests/flow_trip_date.py http://127.0.0.1:8765/index.html [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_trip_date'


async def pick(pg, cdp, want, tries=60):
    """等選項出來，點文字含 want 的那個（want 是函式＝自己挑：回傳 index）；回傳點到的字"""
    for _ in range(tries):
        texts = await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>!document.getElementById('choices').classList.contains('hide')).map(b=>b.textContent.trim())")
        if texts:
            i = want(texts) if callable(want) else next((k for k, t in enumerate(texts) if want in t), -1)
            if i is not None and i >= 0:
                await pg.evaluate("(i=>document.querySelectorAll('#choices button')[i].scrollIntoView({block:'center'}))(%d)" % i)
                c = await pg.evaluate("(i=>{ const r=document.querySelectorAll('#choices button')[i].getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
                await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(600); return texts[i]
        if await pg.evaluate("!!(GAME.D&&GAME.D.active)"):
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return None


async def talk_until_choices(pg, cdp, max_taps=40):
    """點對話直到出現選項或對話結束；回傳看過的台詞"""
    seen = []
    for _ in range(max_taps):
        s = await L.state(pg)
        if s['choices']: break
        if not s['dlg']: break
        if s['dtext'] and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
    return seen


async def main():
    run = L.Run('flow_trip_date', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A 自由出行：九份 ----------
        run.setup('讀檔：公館、捷運公館站入口旁，第 11 天（9/27 週六）14:00、晴天')
        await L.load_state(pg, {'zone': 'gongguan', 'hour': 14.0, 'day': 11, 'weekday': 6, 'weather': 'sunny', 'money': 5000, 'pos': {'x': -35.6, 'z': 12.6, 'yaw': 3.14},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(2500)
        s = await L.state(pg); m0 = await pg.evaluate("GAME.G.money"); h0 = s['hour']
        run.check('站在捷運站入口旁：互動按鈕是「捷運公館站入口」', '捷運' in s['interact'], s['interact'])
        await L.tap(pg, cdp, '#interact')
        got = await pick(pg, cdp, '九份')
        run.check('「要去哪裡？」的清單有第二批的九份，點得到', got is not None and '九份' in got, str(got))
        bg = ''
        for _ in range(60):   # 交通標題卡（約 2 秒）之後才進 2D 畫面：等 ADV 開起來、底圖換上
            bg = await pg.evaluate("(typeof ADV!=='undefined'&&ADV.active&&ADV.bg)?(ADV.bg.style.backgroundImage||''):''")
            if await pg.evaluate("!!(GAME.G.trip&&GAME.G.trip.spot)") and bg: break
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'jiufen')
        run.check('到了九份：行程記在 G.trip、2D 畫面用九份的底圖（d18_base_dusk）', await pg.evaluate("GAME.G.trip&&GAME.G.trip.spot==='D18'") and 'd18_base' in bg, bg[:200])
        did = await pick(pg, cdp, lambda t: next((k for k, x in enumerate(t) if x not in ('回去',) and '拍一張照' not in x), -1))
        await talk_until_choices(pg, cdp)
        run.check('選了一個能做的（散步或互動點）', did is not None, str(did))
        await pick(pg, cdp, '回去'); await pick(pg, cdp, '回公館')
        for _ in range(60):
            s = await L.state(pg)
            if s['zone'] == 'gongguan' and not await pg.evaluate("!!GAME.G.trip") and not s['dlg']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        st = await pg.evaluate("({zone:GAME.G.zone, trip:GAME.G.trip, free:(GAME.G.places||{}).free, money:GAME.G.money, hour:GAME.G.hour})")
        run.check('回到公館、G.places.free.D18＝1、時間往後至少 3 小時（來回 3 小時＋待一下）、扣了車資 200 元以上', st['zone'] == 'gongguan' and not st['trip'] and (st['free'] or {}).get('D18') == 1 and st['hour'] >= h0 + 3 and m0 - st['money'] >= 200, json.dumps(st, ensure_ascii=False))
        await run.shot(pg, 'back_gongguan')
        # ---------- B 校外約會：預約 → 出發 → 淡水 ----------
        run.setup('讀檔：宿舍、第 11 天（9/27 週六）10:00；和語彤交往中、有聯絡方式')
        await L.load_state(pg, {'zone': 'dorm', 'hour': 10.0, 'day': 11, 'weekday': 6, 'weather': 'sunny', 'money': 5000,
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'dating_heroine_03': True}}, quiet_events=True)
        await pg.wait_for_timeout(2000)
        await pg.evaluate("(()=>{ GAME.G.contacts=GAME.G.contacts||{}; GAME.G.contacts.heroine_03=1; })()")
        run.setup('用 INV.flow 開約人選單（等同手機朋友頁的「約」）')
        await pg.evaluate("void INV.flow(GAME,'heroine_03',null,false)")
        steps = [('出去玩', 'place'), ('新北市、桃園：海邊', 'group'), ('淡水金色水岸', 'loc'), ('明天', 'day'), ('15:00', 'time'), ('就這樣約', 'ok')]
        ok_steps = []
        for w, k in steps:
            t = await pick(pg, cdp, w); ok_steps.append((k, t))
        seen = await talk_until_choices(pg, cdp)
        trip = await pg.evaluate("(GAME.G.trips||[]).slice(-1)[0]||null")
        run.check('預約：出去玩… → 海邊 → 淡水 → 明天 → 15:00 → 就這樣約，都點得到；行程 booked、明天 15:00', all(t for _, t in ok_steps) and trip and trip['status'] == 'booked' and trip['depart'] == 15, json.dumps([ok_steps, trip], ensure_ascii=False))
        await run.shot(pg, 'date_booked')
        run.setup('把時間撥到隔天 14:58（等出發提示）')
        await pg.evaluate("(()=>{ const G=GAME.G; G.day+=1; G.weekday=(G.weekday+1)%7; G.hour=14.97; GAME.E.hour=G.hour; })()")
        got = await pick(pg, cdp, '出發', tries=90)
        run.check('15:00 前後跳出「現在要出發嗎？」、點「出發」', bool(got) and got.startswith('出發'), str(got))
        lines = []
        for _ in range(80):   # 交通標題卡、地點字幕、抵達句：一路點對話，直到出現互動點的選單
            s = await L.state(pg)
            if s['choices']: break
            if s['dlg']:
                if s['dtext'] and (not lines or lines[-1] != s['dtext']): lines.append(s['dtext'])
                await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'tamsui_arrive')
        rec = await pg.evaluate("(((GAME.G.dateMemory||{}).heroine_03||{}).D13||{}).recent||[]")
        run.check('到了淡水：她的抵達句有播（dateMemory 記了抵達那一池；看到的台詞記在說明）', any(str(k).startswith('arrive.') for k in rec), json.dumps({'recent': rec, 'seen': lines}, ensure_ascii=False))
        for _ in range(2):
            got = await pick(pg, cdp, lambda t: next((k for k, x in enumerate(t) if '差不多' not in x and '就這樣回去' not in x), -1))
            await talk_until_choices(pg, cdp)
        await pick(pg, cdp, '差不多了')
        await talk_until_choices(pg, cdp)
        for _ in range(60):
            s = await L.state(pg)
            if not s['dlg'] and not s['choices'] and await pg.evaluate("((GAME.G.trips||[]).slice(-1)[0]||{}).status==='done'"): break
            if s['choices']: await pick(pg, cdp, lambda t: 0)
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        st = await pg.evaluate("({log:(GAME.G.dateLog||{}).heroine_03, trip:(GAME.G.trips||[]).slice(-1)[0], dated:!!GAME.G.flags.DATED_1_heroine_03, mem:((GAME.G.dateMemory||{}).heroine_03||{}).D13, zone:GAME.G.zone})")
        run.check('約會結束：正式校外約會 1 次、DATED_1、行程 done、記得點過的兩個互動點', st['log'] and st['log'].get('count') == 1 and st['dated'] and st['trip']['status'] == 'done' and len((st['mem'] or {}).get('picks', [])) == 2, json.dumps(st, ensure_ascii=False)[:400])
        await run.shot(pg, 'date_back')
        run.check('沒有 JS 錯誤', not errs, '; '.join(errs[:5]))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
