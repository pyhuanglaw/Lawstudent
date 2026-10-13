"""真實玩家流程：課表與每日上課（D52：AA_103／AA_104；D54 的測試要求）。不用 ?turbo。
玩家操作一律走真的介面（觸控點地面、搖桿、互動按鈕、對話框、選項、手機按鈕、讀檔選單）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 正常走路：週五 12:55 在霖澤館二樓 201 門口 → 點「進入 201」→ 教授在講台 → 走到座位 → 坐下選「上課：法律與社會」→ 點對話 → 快轉到 15:10 下課
   → 起身 → 走到後門 → 離開教室（回到霖澤館二樓）；下課後教授離開教室。
B. 手機快速前往：週一 08:50 在校門口 → 點 📱 → 「今天」有 09:10 憲法 → 點「去教室」→ 到 201、時間有過（15 分鐘）→ 坐下上課 → 下課 12:10。
C. 共同教學館 101：週二 08:50 在椰林大道 → 走到共同教學館門口 → 按門進館 → 自己走進 101（階梯教室，走側邊台階上到第 2 排）→ 坐下「上課：大一國文」→ 下課 12:10；之後 14:00 打開手機：13:20 通識寫「沒去」。
D. 存讀檔：重新整理頁面 → 標題畫面「讀取」→ 自動存檔 → 課表紀錄還在（上過的課、出席次數），手機寫「上過了」。
E. 手機在直向、橫向的顯示（截圖）。
用法：python3 tests/flow_classes.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_classes'
DAY1_FRI, DAY1_MON, DAY1_TUE = 3, 6, 7   # 9/19 週五、9/22 週一、9/23 週二（第 1 天＝9/17 週三）
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
REC_JS = "(()=>{ const R=(GAME.G.courses||{}); return {done:Object.keys(R.done||{}), attend:R.attend||{}, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day, zone:GAME.G.zone}; })()"


async def sit_and_attend(pg, cdp, run, course_name, seat_rc=(2, 3)):
    seat = await pg.evaluate("(([r,c])=>{ const s=GAME.E.zone.seats.find(q=>q.row===r&&q.col===c); return s?{x:s.x,z:s.z,y:s.y}:null; })(%s)" % json.dumps(list(seat_rc)))
    run.check('201 的座位資料', bool(seat), json.dumps(seat))
    ok = await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.45, '座位')
    run.check('走到座位旁邊', ok)
    s = await L.state(pg)
    run.check('出現「坐下」按鈕', s['interact'].startswith('坐下'), s['interact'])
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    s = await L.state(pg)
    first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
    run.check('坐下後第一個選項是「上課：' + course_name + '」', first.startswith('上課：' + course_name), first)
    h0 = s['hour']
    s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
    return h0, s


async def main():
    run = L.Run('flow_classes', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：正常走路進 201、上課、下課、離開 ----------
        run.setup('讀檔：第 3 天（9/19 週五）12:55，霖澤館二樓 201 門口 (-2.0,-6.0, 2F)；第一、二天主線已過')
        await L.load_state(pg, {'zone': 'linze', 'hour': 12.92, 'day': DAY1_FRI, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        hud = await pg.evaluate("(document.getElementById('nextClass')||{}).textContent||''")
        run.check('HUD 寫「現在可以上課：13:20 法律與社會（霖澤館 201）」', '13:20 法律與社會' in hud and '現在可以上課' in hud, hud)
        s = await L.state(pg)
        run.check('門口出現「進入 201」按鈕', s['interact'].startswith('進入 201'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        s = await L.state(pg)
        run.check('進到 201', s['zone'] == 'classroom', s['zone'])
        prof = await pg.evaluate("!!(GAME.E.npcs.find(n=>n.charId==='prof_huang'||n.id==='prof_huang'))")
        run.check('黃教授在講台（課表：週五下午一 法律與社會）', prof)
        studs = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).length")
        run.check('座位上有同學（上課時間）', studs >= 6, str(studs))
        await run.shot(pg, 'A_classroom_before')
        h0, s = await sit_and_attend(pg, cdp, run, '法律與社會')
        rec = await pg.evaluate(REC_JS)
        run.check('上完課：時間快轉到 15:10（下課）', s['hour'] >= 15.15 and s['hour'] < 15.6, f"{h0} → {s['hour']}")
        run.check('紀錄：法律與社會 上過了、出席 1 次', any(':law_society:' in k for k in rec['done']) and rec['attend'].get('law_society') == 1, json.dumps(rec, ensure_ascii=False))
        await run.shot(pg, 'A_after_class')
        await pg.wait_for_timeout(5000)
        prof2 = await pg.evaluate("!!(GAME.E.npcs.find(n=>n.charId==='prof_huang'||n.id==='prof_huang'))")
        run.check('下課後教授離開教室（作息更新）', not prof2)
        door = await L.find_it(pg, '離開教室')
        ok = await L.go_to(pg, cdp, run, door['x'], door['z'], 0.9, '後門')
        s = await L.state(pg)
        run.check('走到後門、出現「離開教室」', ok and s['interact'].startswith('離開教室'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        s = await L.state(pg)
        run.check('回到霖澤館二樓、站得住', s['zone'] == 'linze' and s['lv'] == 1 and s['stand'], json.dumps(s, ensure_ascii=False))
        # ---------- B：手機「去教室」（快速前往）----------
        run.setup('讀檔：第 6 天（9/22 週一）08:50，校門口')
        await L.load_state(pg, {'zone': 'campus', 'hour': 8.83, 'day': DAY1_MON, 'weekday': 1, 'weather': 'sunny', 'pos': {'x': -112, 'z': 0, 'yaw': -1.57}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「今天」：09:10 憲法、霖澤館 201、張老師', '憲法' in txt and '霖澤館 201' in txt and '張老師' in txt, txt[:160])
        await run.shot(pg, 'B_phone_today_landscape')
        ok = await L.tap(pg, cdp, '#phoneBody [data-go]')
        run.check('點「去教室」', ok)
        await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('到 201、時間過了約 15 分鐘（不是瞬間）', s['zone'] == 'classroom' and 9.0 <= s['hour'] < 9.3, json.dumps(s, ensure_ascii=False))
        h0, s = await sit_and_attend(pg, cdp, run, '憲法', (1, 4))
        run.check('憲法下課：12:10', s['hour'] >= 12.15 and s['hour'] < 12.6, f"{h0} → {s['hour']}")
        # ---------- C：共同教學館 101 上課（館內的 3D 教室，D55 第二階段）＋翹掉的課 ----------
        run.setup('讀檔：第 7 天（9/23 週二）08:50，椰林大道上、共同教學館前 (2,10)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 8.83, 'day': DAY1_TUE, 'weekday': 2, 'weather': 'sunny', 'pos': {'x': 2, 'z': 10, 'yaw': 0}, 'flags': BASE_FLAGS})
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '共同教學館')
        run.check('校園有「共同教學館」的門口', bool(d), json.dumps(d, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '共同教學館')
        s = await L.state(pg)
        run.check('走到門口、出現「共同教學館」按鈕', ok and s['interact'].startswith('共同教學館'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('按門：走進共同教學館（課在館內的 101，不是門口的 2D 畫面）', s['zone'] == 'gongtong' and s['stand'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'C_gongtong_lobby')
        seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.room==='101'&&q.row===1&&q.col===1); return s?{x:s.x,z:s.z,yaw:s.yaw,y:s.y}:null; })()")
        ax, az = seat['x'] - math.sin(seat['yaw']) * 0.6, seat['z'] - math.cos(seat['yaw']) * 0.6   # 共 101 是階梯教室：椅子後面的走道（第 2 排的平台）
        ok = await L.go_to(pg, cdp, run, ax, az, 0.3, '共 101 第 2 排的座位後面', lv=0)
        s = await L.state(pg)
        run.check('自己走進共 101（階梯教室：從講台那一端的門進去、走側邊的台階上到第 2 排）、站在那一排的平台上、出現「坐下」', ok and s['interact'].startswith('坐下') and abs(s['y'] - seat['y']) < 0.08, json.dumps(s, ensure_ascii=False))
        studs = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).length")
        run.check('101 上課前已經有同學坐著（同一間、一半左右的位子）', studs >= 4, str(studs))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
        run.check('坐下後第一個選項「上課：大一國文」', first.startswith('上課：大一國文'), first)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
        run.check('大一國文下課：12:10', s['hour'] >= 12.15 and s['hour'] < 12.6, str(s['hour']))
        await run.shot(pg, 'C_after_door_class')
        # ---------- D：存讀檔（重新整理）----------
        await pg.wait_for_timeout(1500)
        await pg.reload(); run.check('重新整理後遊戲載入', await L.wait_loaded(pg))
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
        ok = await L.tap(pg, cdp, '#saveSlots .item:first-child .btn.pri')
        run.check('標題畫面「讀取」→ 自動存檔', ok)
        await pg.wait_for_timeout(6000)
        rec = await pg.evaluate(REC_JS)
        run.check('讀檔後：第 7 天、大一國文、憲法、法律與社會都是「上過了」', rec['day'] == DAY1_TUE and all(any(':%s:' % c in k for k in rec['done']) for c in ('chinese1', 'con_law1', 'law_society')), json.dumps(rec, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('讀檔後手機：大一國文「上過了」、13:20 通識「還沒開始」或「現在可以進教室」', '上過了' in txt and '通識' in txt, txt[:200])
        await L.tap(pg, cdp, '#btnPhoneClose')
        # 翹課：照常讓時間過（坐在長椅上「坐一下」每次 20 分鐘不好找；這裡用讀檔到 14:00 當前置，檢查手機的狀態）
        run.setup('讀檔（同一份紀錄）到 14:00：通識開始超過 30 分鐘')
        await pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')); s.hour=14.0; document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()")
        await pg.wait_for_timeout(3500)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('14:00 的手機：13:20 通識「沒去」（翹課不用操作、不跳警告）', '通識' in txt and '沒去' in txt, txt[:220])
        # ---------- E：手機直向 ----------
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1500)
        await run.shot(pg, 'E_phone_today_portrait')
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="week"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「課表」：大一上、憲法、民法總則、刑法總則（一）、體育', all(k in txt for k in ('大一上', '憲法', '民法總則', '刑法總則（一）', '體育')), txt[:200])
        ov = await pg.evaluate("(()=>{ const e=document.querySelector('#phone .card'); const r=e.getBoundingClientRect(); return {w:r.width,right:r.right,scroll:document.documentElement.scrollWidth>innerWidth}; })()")
        run.check('直向：手機面板在畫面內、沒有橫向捲動', ov['right'] <= 390 and not ov['scroll'], json.dumps(ov))
        await run.shot(pg, 'E_phone_week_portrait')
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(800)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「朋友」：認識的人大概在哪（照作息；不是任務標記）', '大概在哪' in txt or '還沒有認識的人' in txt, txt[:200])
        await run.shot(pg, 'E_phone_friends_portrait')
        await L.tap(pg, cdp, '#btnPhoneClose')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
