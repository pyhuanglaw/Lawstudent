"""真實玩家流程：課表與每日上課（D52：AA_103／AA_104；D54 的測試要求）。不用 ?turbo。
玩家操作一律走真的介面（觸控點地面、搖桿、互動按鈕、對話框、選項、手機按鈕、讀檔選單）；前置條件（讀檔到某天某時某地）用 [前置／捷徑] 標示。
A. 正常走路：週四 12:55 在法律系館A二樓 201 門口 → 點「進入 201」→ 教授在講台 → 走到座位 → 坐下選「上課：民法總則」→ 點對話 → 快轉到 15:10 下課
   → 起身 → 走到後門 → 離開教室（回到法律系館A二樓）；下課後教授離開教室。
   （2026-10-15 改：法律與社會在 AA_130 課程調整刪掉了（bb6d2ee），原本的週五下午一沒有課；改用同一間 201、同一個時段的週四民法總則（周教授））
B. 手機快速前往：週一 08:50 在校門口 → 點 📱 → 「今天」有 09:10 憲法 → 點「去教室」→ 到 201、時間有過（15 分鐘）→ 坐下上課 → 下課 12:10。
C. 共同教學館 102：週四 08:50 在椰影大道 → 走到共同教學館門口 → 按門進館 → 自己走進 102（小班的語言教室）、走到空位旁 → 坐下「上課：大一英文」→ 下課 12:10；之後 14:00 打開手機：13:20 民法總則寫「沒去」。
   （2026-10-14 改：方案 A（D55）之後大一國文在博思教學館 101——那一堂由 flow_boya_interior 測；共同教學館 101 這學期沒有排課）
D. 存讀檔：重新整理頁面 → 標題畫面「讀取」→ 自動存檔 → 課表紀錄還在（C 段上過的大一英文、出席次數），手機寫「上過了」。
   （每一段都是重新讀檔開始的［前置］，A、B 段的紀錄不會帶到 C 段：原本要求三堂都「上過了」是測試寫錯，2026-10-14 改成檢查 C 段的那一堂）
E. 手機在直向、橫向的顯示（截圖）。
用法：python3 tests/flow_classes.py URL [輸出資料夾]"""
import asyncio, json, sys, time, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_classes'
DAY1_FRI, DAY1_MON, DAY1_TUE, DAY1_THU = 3, 6, 7, 9   # 9/19 週五、9/22 週一、9/23 週二、9/25 週四（第 1 天＝9/17 週三）
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
REC_JS = "(()=>{ const R=(GAME.G.courses||{}); return {done:Object.keys(R.done||{}), attend:R.attend||{}, hour:+GAME.G.hour.toFixed(2), day:GAME.G.day, zone:GAME.G.zone}; })()"


async def phone_tab(pg, cdp, tab):
    """點手機的分頁，等它真的換過去再讀內容（2026-10-14 v9.6 回歸：SwiftShader 約 1 fps，點下去 0.8 秒後讀到的還是「今天」——截圖也還在「今天」）。
    沒換過去就再點一次（玩家也會再點），最多 3 次；回傳點了幾次（0＝沒換過去）"""
    for i in range(3):
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab)
        for _ in range(12):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\\''+t+'\\']'); return !!(b&&b.classList.contains('on')); })(%s)" % json.dumps(tab)):
                return i + 1
    return 0


async def first_choice(pg, max_s=60):
    """按「坐下」之後等選項真的出現再讀第一個（玩家也是等它出現）：人物先走到椅子旁、坐下，SwiftShader 約 1 fps 時要好幾秒
    （2026-10-14 v9.6 回歸：原本固定等 2.5 秒，讀到空字串判失敗，之後選第一個照樣上了課）。回傳第一個選項的字（沒出現＝空字串）"""
    for _ in range(int(max_s * 2)):
        t = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
        if t: return t
        await pg.wait_for_timeout(500)
    return ''


async def sit_and_attend(pg, cdp, run, course_name, seat_rc=(2, 3)):
    seat = await pg.evaluate("(([r,c])=>{ const s=GAME.E.zone.seats.find(q=>q.row===r&&q.col===c); return s?{x:s.x,z:s.z,y:s.y}:null; })(%s)" % json.dumps(list(seat_rc)))
    run.check('201 的座位資料', bool(seat), json.dumps(seat))
    ok = await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.45, '座位')
    run.check('走到座位旁邊', ok)
    s = await L.state(pg)
    run.check('出現「坐下」按鈕', s['interact'].startswith('坐下'), s['interact'])
    await L.tap(pg, cdp, '#interact')
    first = await first_choice(pg)
    s = await L.state(pg)
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
        run.setup('讀檔：第 9 天（9/25 週四）12:55，法律系館A二樓 201 門口 (-2.0,-6.0, 2F)；第一、二天主線已過')
        await L.load_state(pg, {'zone': 'linze', 'hour': 12.92, 'day': DAY1_THU, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 3.14}, 'flags': BASE_FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(3500)
        # HUD 的「下一堂」跟著作息更新（game3d.js 每 30 幀一次：手機 60 fps 約半秒，SwiftShader 1–4 fps 要 8–30 秒）——等它出現再看內容，最多再等 60 秒
        # （2026-10-14 v9.6 回歸：讀檔後只等 3.5 秒，還沒輪到更新，讀到空字串）
        hud = ''
        for _ in range(30):
            hud = await pg.evaluate("(document.getElementById('nextClass')||{}).textContent||''")
            if hud: break
            await pg.wait_for_timeout(2000)
        run.check('HUD 寫「現在可以上課：13:20 民法總則（法律系館A 201）」', '13:20 民法總則' in hud and '現在可以上課' in hud, hud)
        s = await L.state(pg)
        run.check('門口出現「進入 201」按鈕', s['interact'].startswith('進入 201'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        s = await L.state(pg)
        run.check('進到 201', s['zone'] == 'classroom', s['zone'])
        prof = await pg.evaluate("!!(GAME.E.npcs.find(n=>n.charId==='prof_zhou'||n.id==='prof_zhou'))")
        run.check('周教授在講台（課表：週四下午一 民法總則）', prof)
        studs0 = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).length")
        run.check('12:55（上課前 25 分鐘）同學還沒進來（AA_137 第 8 節：上課前 10 分鐘起才陸續進來，54146f5c）', studs0 == 0, str(studs0))
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'], max_steps=40)   # 進教室時的人物事件（BUG-15：課前事件照常演）先點完，作息和教室排人才會跑
        run.setup('時間推到 13:12（上課前 8 分鐘），等教室排人（每 2 遊戲分鐘一次）')
        await pg.evaluate("GAME.advance(13.2-GAME.G.hour)")
        # 教室排人在 story3d.js 的 S.tick 裡（每 30 幀；SwiftShader 約 1 fps＝30 秒一次）：輪詢到排過為止，最多 2 分鐘（2026-10-16：原本只等 8 秒，常常還沒輪到就檢查）。
        # 人數照 AA_137 第 8 節（上課前 10 分鐘 15%，到上課 80%）：13:12 是 16 個位子 ×約 28%＝4～5 人（原本的「≥6」是 AA_137 以前全部一次坐好的標準）
        studs, want = 0, 99
        for _ in range(40):
            studs, want = await pg.evaluate("(()=>{ const G=GAME.G, live=CLS.liveIn(G,'classroom'); return [GAME.E.npcs.filter(n=>n.clsStudent&&(n.seat||n.seatTarget)).length, live.length?Math.round(16*CLS.arriveFrac(G,live[0])):99]; })()")
            if studs >= 4 and studs >= want - 1: break
            await pg.wait_for_timeout(3000)
        run.check('13:12 同學陸續走進來坐（座位上或正走向座位；AA_137：16 個位子 ×這個時間的比例）', studs >= 4 and studs >= want - 1, f'{studs} 人（這個時間應有 {want}）')
        await run.shot(pg, 'A_classroom_before')
        h0, s = await sit_and_attend(pg, cdp, run, '民法總則')
        rec = await pg.evaluate(REC_JS)
        run.check('上完課：時間快轉到 15:10（下課）', s['hour'] >= 15.15 and s['hour'] < 15.6, f"{h0} → {s['hour']}")
        run.check('紀錄：民法總則 上過了、出席 1 次', any(':civ_general:' in k for k in rec['done']) and rec['attend'].get('civ_general') == 1, json.dumps(rec, ensure_ascii=False))
        split = await pg.evaluate("(()=>({done:!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_an_report_split), part:GAME.G.flags.REPORT_PARTNER||null}))()")
        run.check('下課後以安「民總的報告，兩人一組…」有演（BUG-15：坐在座位上課也演課後事件；修之前座位上課永遠不演）', split['done'], json.dumps(split, ensure_ascii=False))
        await run.shot(pg, 'A_after_class')
        # 下課後教授先走到最近的門口才離開（v9.6 的 2e964bb：時段結束的人不會在眼前消失）——原本只等 5 秒就檢查他不在了，跟這個行為對不上；
        # 改成等他走出去，並記下途中是不是「要離開」（走向出口）。判斷標準：他最後要離開教室。最多等 5 分鐘：SwiftShader 約 1 fps、每幀最多 0.1 秒遊戲時間，
        # 作息（story3d.js 的 refreshSchedule，每 3 秒遊戲時間）在這裡約 30 秒才輪到一次——開始走一次、走到門口再一次，加上從講台走到後門（約 14 m、上台階）的時間
        gone, seen_leaving, t0, st = False, False, time.time(), None
        while time.time() - t0 < 300:
            st = await pg.evaluate("(()=>{ const n=GAME.E.npcs.find(n=>n.charId==='prof_zhou'||n.id==='prof_zhou'); return n?{leaving:!!n.leaving,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2)}:null; })()")
            if st is None: gone = True; break
            seen_leaving = seen_leaving or st['leaving']
            await pg.wait_for_timeout(2000)
        run.check('下課後教授走到門口、離開教室（作息更新；時段結束的人先走到出口）', gone, json.dumps({'seen_leaving': seen_leaving, 'last': st, 'waited_s': round(time.time() - t0)}, ensure_ascii=False))
        door = await L.find_it(pg, '離開教室')
        ok = await L.go_to(pg, cdp, run, door['x'], door['z'], 0.9, '後門')
        s = await L.state(pg)
        run.check('走到後門、出現「離開教室」', ok and s['interact'].startswith('離開教室'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        s = await L.state(pg)
        run.check('回到法律系館A二樓、站得住', s['zone'] == 'linze' and s['lv'] == 1 and s['stand'], json.dumps(s, ensure_ascii=False))
        # ---------- B：手機「去教室」（快速前往）----------
        run.setup('讀檔：第 6 天（9/22 週一）08:50，校門口')
        await L.load_state(pg, {'zone': 'campus', 'hour': 8.83, 'day': DAY1_MON, 'weekday': 1, 'weather': 'sunny', 'pos': {'x': -112, 'z': 0, 'yaw': -1.57}, 'flags': BASE_FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(3500)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「今天」：09:10 憲法、霖澤館 201、張老師', '憲法' in txt and '法律系館A 201' in txt and '張老師' in txt, txt[:160])
        await run.shot(pg, 'B_phone_today_landscape')
        ok = await L.tap(pg, cdp, '#phoneBody [data-go]')
        run.check('點「去教室」', ok)
        await pg.wait_for_timeout(5000)
        # DL-01 一鍵上課：到教室以後先問坐哪裡（老位子／坐在誰旁邊／自己找位子）；這一段測的是自己走到座位，選「自己找位子」
        for _ in range(30):
            q = await L.state(pg)
            if q['choices']:
                c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b.find(x=>x.textContent.includes('自己找位子'))||b[b.length-1]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent]; })()")
                run.note('坐哪裡的選單：選「%s」' % c[2]); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); break
            if q['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(700)
        s = await L.state(pg)
        run.check('到 201、時間過了約 15 分鐘（不是瞬間）', s['zone'] == 'classroom' and 9.0 <= s['hour'] < 9.3, json.dumps(s, ensure_ascii=False))
        h0, s = await sit_and_attend(pg, cdp, run, '憲法', (1, 4))
        run.check('憲法下課：12:10', s['hour'] >= 12.15 and s['hour'] < 12.6, f"{h0} → {s['hour']}")
        # ---------- C：共同教學館 102 上課（館內的 3D 教室，D55 第二階段）＋翹掉的課 ----------
        run.setup('讀檔：第 9 天（9/25 週四）08:50，椰影大道上、共同教學館前 (2,10)')
        await L.load_state(pg, {'zone': 'campus', 'hour': 8.83, 'day': DAY1_THU, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': 2, 'z': 10, 'yaw': 0}, 'flags': BASE_FLAGS}, quiet_phone=True)
        await pg.wait_for_timeout(3500)
        d = await L.find_it(pg, '共同教學館')
        run.check('校園有「共同教學館」的門口', bool(d), json.dumps(d, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, d['x'], d['z'], 1.2, '共同教學館')
        s = await L.state(pg)
        run.check('走到門口、出現「共同教學館」按鈕', ok and s['interact'].startswith('共同教學館'), s['interact'])
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
        s = await L.state(pg)
        run.check('按門：走進共同教學館（課在館內的教室，不是門口的 2D 畫面）', s['zone'] == 'gongtong' and s['stand'], json.dumps(s, ensure_ascii=False))
        await run.shot(pg, 'C_gongtong_lobby')
        await L.advance_dialogs(pg, cdp, run, lambda q: not q['dlg'] and not q['choices'], max_steps=40)
        run.setup('時間推到 09:05（上課前 5 分鐘；AA_137 第 8 節：上課前 10 分鐘起同學才陸續進來）')
        await pg.evaluate("GAME.advance(9+5/60-GAME.G.hour)")
        # 同上：輪詢到排過為止。人數＝min(16, 102 一半的位子) ×這個時間的比例（09:05 約 48%）；2026-10-16 修了「第一批之後不再補人」（classes3d.js syncRooms）
        studs, want = 0, 99
        for _ in range(40):
            studs, want = await pg.evaluate("(()=>{ const G=GAME.G, E=GAME.E, it=CLS.liveIn(G,G.zone).find(q=>q.room&&q.room.room==='102'); const seats=E.zone.seats.filter(q=>q.room==='102'&&(q.kind==='class'||q.kind==='lecture')); const cap=Math.min(16,(it&&it.n)||Math.round(seats.length*0.5)); return [E.npcs.filter(n=>n.clsStudent&&((n.seat&&n.seat.room==='102')||(n.seatTarget&&n.seatTarget.room==='102'))).length, it?Math.round(cap*CLS.arriveFrac(G,it)):99]; })()")
            if studs >= 2 and studs >= want - 1: break
            await pg.wait_for_timeout(3000)
        run.check('102 上課前 5 分鐘已經有同學（坐著或正走向座位；同一間；名額 ×這個時間的比例）', studs >= 2 and studs >= want - 1, f'{studs} 人（這個時間應有 {want}）')
        # 空位：沒有同學坐的、離玩家最近的那一個；站的位置用遊戲自己算的（GAME.seatApproach，和按「坐下」時走過去的是同一個點）
        seat = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position; const free=E.zone.seats.filter(q=>q.room==='102'&&!E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-q.x,n.seat.z-q.z)<0.35)); free.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const s=free[0]; if(!s) return null; const ap=GAME.seatApproach(s)||[s.x,s.z]; return {x:s.x,z:s.z,yaw:s.yaw,row:s.row,col:s.col,ax:ap[0],az:ap[1]}; })()")
        run.check('102 有空位', bool(seat), json.dumps(seat, ensure_ascii=False))
        ok = await L.go_to(pg, cdp, run, seat['ax'], seat['az'], 0.15, '共 102 的空位旁', lv=0)
        s = await L.state(pg)
        run.check('自己走進共 102、走到空位旁、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
        await L.tap(pg, cdp, '#interact')
        first = await first_choice(pg)
        run.check('坐下後第一個選項「上課：大一英文」', first.startswith('上課：大一英文'), first)
        s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
        run.check('大一英文下課：12:10', s['hour'] >= 12.15 and s['hour'] < 12.6, str(s['hour']))
        await run.shot(pg, 'C_after_door_class')
        # ---------- D：存讀檔（重新整理）----------
        await pg.wait_for_timeout(1500)
        await pg.reload(); run.check('重新整理後遊戲載入', await L.wait_loaded(pg))
        await L.no_phone_auto(pg)   # [前置] 讀進來的存檔有要回的訊息：手機自己打開會擋住搖桿（D103）
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
        ok = await L.tap(pg, cdp, '#saveSlots .item:first-child .btn.pri')
        run.check('標題畫面「讀取」→ 自動存檔', ok)
        await pg.wait_for_timeout(6000)
        rec = await pg.evaluate(REC_JS)
        run.check('讀檔後：第 9 天、大一英文「上過了」、出席 1 次（C 段的紀錄）', rec['day'] == DAY1_THU and any(':english_y1:' in k for k in rec['done']) and rec['attend'].get('english_y1') == 1, json.dumps(rec, ensure_ascii=False))
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('讀檔後手機：大一英文「上過了」、13:20 民法總則還在今天的課表上', '上過了' in txt and '大一英文' in txt and '民法總則' in txt, txt[:260])
        await L.tap(pg, cdp, '#btnPhoneClose')
        # 翹課：照常讓時間過（坐在長椅上「坐一下」每次 20 分鐘不好找；這裡用讀檔到 14:00 當前置，檢查手機的狀態）
        run.setup('讀檔（同一份紀錄）到 14:00：民法總則開始超過 30 分鐘')
        await pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')); s.hour=14.0; document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()")
        await pg.wait_for_timeout(3500)
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('14:00 的手機：13:20 民法總則「沒去」（翹課不用操作、不跳警告）', '民法總則' in txt and '沒去' in txt, txt[:260])
        # ---------- E：手機直向 ----------
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(1500)
        await run.shot(pg, 'E_phone_today_portrait')
        n = await phone_tab(pg, cdp, 'week')
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「課表」：大一上、憲法、民法總則、刑法總則（一）、體育', n > 0 and all(k in txt for k in ('大一上', '憲法', '民法總則', '刑法總則（一）', '體育')), f'點了 {n} 次　' + txt[:200])
        ov = await pg.evaluate("(()=>{ const e=document.querySelector('#phone .card'); const r=e.getBoundingClientRect(); return {w:r.width,right:r.right,scroll:document.documentElement.scrollWidth>innerWidth}; })()")
        run.check('直向：手機面板在畫面內、沒有橫向捲動', ov['right'] <= 390 and not ov['scroll'], json.dumps(ov))
        await run.shot(pg, 'E_phone_week_portrait')
        n = await phone_tab(pg, cdp, 'friends')
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")
        run.check('手機「朋友」：認識的人大概在哪（照作息；不是任務標記）', n > 0 and ('大概在哪' in txt or '還沒有認識的人' in txt), f'點了 {n} 次　' + txt[:200])
        await run.shot(pg, 'E_phone_friends_portrait')
        await L.tap(pg, cdp, '#btnPhoneClose')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
