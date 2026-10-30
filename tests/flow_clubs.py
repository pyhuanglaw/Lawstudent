"""真實玩家流程：社團（AA_110 第 6-8 節，AA 暫定；src/data/activities.js、classes3d.js 的 roomDoor／attendActivity／fairMenu）。不用 ?turbo。
[前置／捷徑] 每一段讀檔到那一天、那個時間、那一區的門口附近（位置與時間是設定的）；之後都走真的介面（點地面走路、互動按鈕、點對話、點選項）。
A. 吉他社第一次（還沒認識子晴）：10/15 週三 18:40 法律系館B大廳 → 自己走到多功能教室門口 → 還沒開始時按門寫「今天 19:00 在這裡」→ 等到 18:45 以後按門 →「參加：吉他社社課」
   → 社課一開始自動播子晴的初遇（ev_ziqing_club；這個存檔沒聽阿凱轉述過吉他社〔沒有 guitar_invite〕，所以第一句是「新人？……法律系的？」，不是「你就是阿凱的室友？」——v1 Q2 改寫，BB_95）
     「我高子晴，資工系的。」→ 時間到 21:00、記下 FIRST_MET、加入吉他社。
B. 法服讀書會第一次：10/1 週三 18:55 法律系館B大廳 → 自己走上二樓到研討室 A 門口 →「參加：法服讀書會」→ 播 ev_studygroup_wed 整段（學姊「來了？坐。」、題庫三題）→ 21:00、加入法服。
C. 社團博覽會：9/30 週二 12:00 椰影大道 → 自己走到公告欄前的「社團博覽會」→ 選單有五個社團 → 選吉他社（加入）→ 再看一次寫「已加入」→ 逛完了。
D. 系籃：10/3 週五 17:35 體育館附近 → 自己走到「系籃練球」→「去練球：系籃練球」→ 轉暗、19:00、系籃的旁白 →「社課結束了。」
全程沒有 JS 例外。
用法：python3 tests/flow_clubs.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_clubs'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
D_GUITAR = 29   # 2025-10-15 週三（第 7 週）。原本用 10/13 週一（day 27），v9.7 大一上劇情把那天排成颱風假（T1），沒有社課（noHoliday）；第 5、6 週的週一也放假
D_WED = 15   # 2025-10-01 週三（第 5 週）
D_TUE = 14   # 2025-09-30 週二（博覽會）
D_FRI = 17   # 2025-10-03 週五（第 5 週）


async def press_interact_and_choose(pg, cdp, run, want):
    """按互動按鈕，回傳出現的選項文字；有 want 就點它"""
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    if want:
        idx = next((i for i, o in enumerate(opts) if want in o), None)
        if idx is not None:
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (idx + 1)); await pg.wait_for_timeout(1500)
    return opts


async def g(pg, js):
    return await pg.evaluate(js)


async def main():
    run = L.Run('flow_clubs', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：吉他社第一次 ----------
        run.setup('讀檔：10/15 週三 18:40，法律系館B一樓大廳（還沒認識子晴）')
        await L.load_state(pg, {'zone': 'wancai', 'hour': 18.67, 'day': D_GUITAR, 'weekday': 3, 'weather': 'sunny', 'pos': {'x': 0, 'z': 4.6, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        door = await L.find_it(pg, '多功能教室')
        run.check('A 法律系館B大廳有多功能教室的門', bool(door), json.dumps(door, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, door['x'], door['z'] + 0.6, 0.9, '多功能教室門口', lv=0)
        s = await L.state(pg)
        run.check('A 自己走到多功能教室門口、出現「多功能教室」的按鈕', ok and s['interact'].startswith('多功能教室'), json.dumps(s, ensure_ascii=False))
        opts = await press_interact_and_choose(pg, cdp, run, None)
        cap = await g(pg, "(document.getElementById('caption')||{}).textContent||''")
        run.check('A 18:40 按門：還不能參加，寫「今天 19:00 在這裡」（不是「今天沒有社課」）', not opts and '今天 19:00 在這裡' in cap and '今天沒有社課' not in cap, cap)
        run.setup('等到 18:50（站在門口等，時間照常走；這裡直接把時鐘撥到 18:50 省掉十分鐘的模擬）')
        await pg.evaluate("(()=>{ GAME.G.hour=18.84; GAME.E.hour=18.84; })()"); await pg.wait_for_timeout(2500)
        opts = await press_interact_and_choose(pg, cdp, run, '參加：吉他社社課')
        run.check('A 18:50 按門：選項「參加：吉他社社課」', any(o.startswith('參加：吉他社社課') for o in opts), json.dumps(opts, ensure_ascii=False))
        seen = []
        t0 = time.time()
        while time.time() - t0 < 300:
            s = await L.state(pg)
            if s['dtext'] and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
            if not s['busy'] and not s['dlg'] and not s['choices']: break
            if s['choices']:
                await L.tap(pg, cdp, '#choices button:nth-child(1)')
            elif s['dlg']:
                await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'A_after_guitar')
        G = await g(pg, "(()=>{ const G=GAME.G; return {hour:+(G.hour%24).toFixed(2), met:SOCIAL.has('heroine_04','FIRST_MET'), club:!!G.flags.CLUB_club_guitar, ev:(G.events.done||{}).ev_ziqing_club||0}; })()")
        run.check('A 社課一開始播子晴的初遇（沒聽阿凱轉述過：「新人？……法律系的？」，不是「你就是阿凱的室友？」；「我高子晴，資工系的。」）', any(t.startswith('新人？……法律系的？') for t in seen) and not any('阿凱的室友' in t for t in seen) and any('我高子晴，資工系的。' in t for t in seen), ' / '.join(seen[:6]))
        run.check('A 結束：21:00、記下 FIRST_MET、加入吉他社、事件算播過一次', G['hour'] >= 20.99 and G['met'] and G['club'] and G['ev'] == 1, json.dumps(G))
        # ---------- B：法服讀書會第一次 ----------
        run.setup('讀檔：10/1 週三 18:55，法律系館B一樓大廳（沒看過法服公告）')
        await L.load_state(pg, {'zone': 'wancai', 'hour': 18.92, 'day': D_WED, 'weekday': 3, 'weather': 'sunny', 'pos': {'x': 0, 'z': 4.6, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        door = await L.find_it(pg, '研討室 A')
        ok = await L.go_to(pg, cdp, run, door['x'], door['z'] + 0.6, 0.9, '二樓研討室 A 門口', lv=1, max_s=600)
        s = await L.state(pg)
        run.check('B 自己走上二樓、到研討室 A 門口', ok and s['lv'] == 1 and s['interact'].startswith('研討室 A'), json.dumps(s, ensure_ascii=False))
        opts = await press_interact_and_choose(pg, cdp, run, '參加：法服讀書會')
        run.check('B 按門：「參加：法服讀書會」', any(o.startswith('參加：法服讀書會') for o in opts), json.dumps(opts, ensure_ascii=False))
        seen = []; t0 = time.time()
        while time.time() - t0 < 420:
            s = await L.state(pg)
            if s['dtext'] and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
            if not s['busy'] and not s['dlg'] and not s['choices']: break
            if s['choices']: await L.tap(pg, cdp, '#choices button:nth-child(1)')
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'B_after_study')
        G = await g(pg, "(()=>{ const G=GAME.G; return {hour:+(G.hour%24).toFixed(2), lawclub:!!G.flags.lawclub, club:!!G.flags.CLUB_lawclub_study, ev:(G.events.done||{}).ev_studygroup_wed||0}; })()")
        run.check('B 播讀書會整段（學姊「來了？坐。」）', any('來了？坐' in t for t in seen), ' / '.join(seen[:5]))
        run.check('B 結束：21:00、加入法服（lawclub、CLUB_lawclub_study）、ev_studygroup_wed 播過一次', G['hour'] >= 20.99 and G['lawclub'] and G['club'] and G['ev'] == 1, json.dumps(G))
        # ---------- C：社團博覽會 ----------
        run.setup('讀檔：9/30 週二 12:00，椰影大道（晨思鐘廣場東側）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 12.0, 'day': D_TUE, 'weekday': 2, 'weather': 'sunny', 'pos': {'x': -13.5, 'z': 7.5, 'yaw': 3.14, 'lv': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(4000)
        spot = await L.find_it(pg, '社團博覽會')
        run.check('C 有「社團博覽會」的集合點', bool(spot), json.dumps(spot, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, spot['x'], spot['z'], 0.9, '社團博覽會', lv=0)
        s = await L.state(pg)
        run.check('C 自己走到公告欄前、出現「社團博覽會」', ok and s['interact'].startswith('社團博覽會'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        menus = []; t0 = time.time()
        while time.time() - t0 < 240:
            s = await L.state(pg)
            if not s['busy'] and not s['dlg'] and not s['choices']: break
            if s['choices']:
                opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)"); menus.append(opts)
                k = len(opts) if any('已加入' in o for o in opts) else 1
                await L.tap(pg, cdp, '#choices button:nth-child(%d)' % k)
            elif s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(800)
        G = await g(pg, "(()=>{ const G=GAME.G; return {guitar:!!G.flags.CLUB_club_guitar, att:ACTIVITIES.attendedAny(G,'club_expo_y1s1',G.day)}; })()")
        run.check('C 選單列五個社團＋「逛完了」', bool(menus) and len(menus[0]) == 6 and menus[0][-1].startswith('逛完了'), json.dumps(menus[:1], ensure_ascii=False))
        run.check('C 選吉他社＝加入；再看一次寫「已加入」；逛完了離開', G['guitar'] and len(menus) >= 2 and '已加入' in menus[1][0] and G['att'], json.dumps(G))
        # ---------- D：系籃 ----------
        run.setup('讀檔：10/3 週五 17:35，霖澤館前（系籃 2026-10-14 搬到醉月湖東側的球場）；SK01 當作已經演過')
        await L.load_state(pg, {'zone': 'campus', 'hour': 17.58, 'day': D_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 34, 'z': -98, 'yaw': 0, 'lv': 0}, 'flags': dict(BASE_FLAGS, SK01_DAY=D_FRI - 10), 'events': {'done': {'ev_sk01_soc': 1}, 'last': {}, 'count': 1}})   # SK01（阿勳的社科圖，第一次站在霖澤館前就演；once 看 events.done）當作已經演過：這一段只測系籃
        await pg.wait_for_timeout(4000)
        spot = await L.find_it(pg, '系籃練球')
        ok = await L.go_to(pg, cdp, run, spot['x'], spot['z'], 0.9, '系籃練球', lv=0)
        s = await L.state(pg)
        run.check('D 自己走到球場（映月湖東側）的「系籃練球」', ok and s['interact'].startswith('系籃練球'), json.dumps(s, ensure_ascii=False))
        opts = await press_interact_and_choose(pg, cdp, run, '去練球：系籃練球')
        run.check('D 選項「去練球：系籃練球」', any(o.startswith('去練球：系籃練球') for o in opts), json.dumps(opts, ensure_ascii=False))
        seen = []; t0 = time.time()
        while time.time() - t0 < 180:
            s = await L.state(pg)
            if s['dtext'] and (not seen or seen[-1] != s['dtext']): seen.append(s['dtext'])
            if not s['busy'] and not s['dlg'] and not s['choices']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        G = await g(pg, "(()=>{ const G=GAME.G; return {hour:+(G.hour%24).toFixed(2), club:!!G.flags.CLUB_dept_basketball, narr:((G.acts||{}).narr||{})['dept_basketball@Y1S1']||0}; })()")
        run.check('D 轉暗以後 19:00、系籃的旁白（投籃練習）、加入系籃', G['hour'] >= 18.99 and any('投籃練習' in t for t in seen) and G['club'] and G['narr'] == 1, json.dumps(G) + ' ' + ' / '.join(seen))
        await run.shot(pg, 'D_after_ball')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
