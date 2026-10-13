"""真實玩家流程：選課結果之後（ChatGPT 審查第七點「選擇不同課程後的實際玩家流程」；AA_104 第 2 節的選課結果）。不用 ?turbo。
[前置／捷徑] 讀檔：2026-02-21（週六）22:30 宿舍房間＝寒假最後一個週末；第一、二天主線已過；關掉條件事件（這個測試不測劇情；選課結果不是條件事件，照常出現）。
A. 不修：走到床邊「睡覺」→ 2/22（週日）起床 →「選課結果出來了：大一下」→ 選「這學期不修法律與社會（下）」
   → 手機「課表」：週二下午一沒有法律與社會（下）→ 手機「跳過時間」等到晚上 → 睡覺 → 週一（開學）：跳過時間（照樣跳過）→ 睡覺
   → 週二早上：手機「今天」只有 09:10 大一國文（下）；「等到傍晚」：會錯過的只有國文。
B. 修：重新讀同一個前置存檔 → 睡覺 → 選「法律與社會（下）」→ 手機「課表」週二下午一是它 → 一路到週二 →「等到中午」（照樣跳過國文）→「等到下一堂課前」13:10
   → 手機「去教室」→ 霖澤館 201 → 自己走到座位、坐下「上課：法律與社會（下）」→ 下課 15:10、出席 1 次。
用法：python3 tests/flow_course_choice.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_course_choice'
SAT = 158   # 2026-02-21 週六（第 1 天＝2025-09-17）；大一下 2026-02-23 開學
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'fundsV2': 1, 'allowanceMonth': 2}
PRE = {'zone': 'dorm', 'hour': 22.5, 'day': SAT, 'weekday': 6, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.0, 'yaw': 3.14}, 'flags': BASE_FLAGS,
       'visited': {'dorm': True, 'campus': True, 'linze': True, 'classroom': True, 'gongguan': True, 'wenzhou': True},
       'courses': {'done': {}, 'attend': {'crim_gen1': 10}, 'prep': {}, 'electives': {}, 'grades': {'Y1S1': {'crim_gen1': '過了'}}, 'note': {'sel_Y1S1': 1}}}
REC_JS = "(()=>{ const R=GAME.G.courses||{}; return {el:R.electives||{}, attend:R.attend||{}, day:GAME.G.day, wd:GAME.G.weekday, hour:+GAME.G.hour.toFixed(2), zone:GAME.G.zone}; })()"


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def close_phone(pg, cdp):
    if not await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)


async def choose(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return True


async def settle(pg, cdp, run, pick_prefix=None, max_steps=40):
    """點對話直到恢復控制；有選項時選開頭是 pick_prefix 的（沒有就第一個）。回傳說過的話、看到的選項"""
    said, opts_seen = [], []
    for _ in range(max_steps):
        q = await L.state(pg)
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        if q['choices']:
            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
            opts_seen.append(opts)
            if not (pick_prefix and await choose(pg, cdp, pick_prefix)): await choose(pg, cdp, opts[0][:4])
            continue
        if not q['busy'] and not q['dlg']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(900)
    return said, opts_seen


async def sleep_in_bed(pg, cdp, run, label):
    """走到床邊、按「睡覺」、選「睡覺」；等到隔天早上在宿舍醒來（titleCard、進宿舍）"""
    bed = await L.find_it(pg, '睡覺')
    ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
    s = await L.state(pg)
    if not (ok and s['interact'].startswith('睡覺')):
        run.check(label + '：走到床邊、出現「睡覺」', False, json.dumps(s, ensure_ascii=False)); return None
    d0 = await pg.evaluate("GAME.G.day")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    if not await choose(pg, cdp, '睡覺'):
        run.check(label + '：床的選項有「睡覺」', False); return None
    for _ in range(60):
        st = await pg.evaluate("({day:GAME.G.day, zone:GAME.G.zone, hour:GAME.G.hour})")
        if st['day'] == d0 + 1 and st['zone'] == 'dorm' and abs(st['hour'] - 7.5) < 0.05: break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(3500)   # 起床的標題卡、進宿舍、早上的提示（CLS.morning）
    return st


async def skip_to(pg, cdp, run, target, pick='照樣跳過'):
    """手機「今天」→「跳過時間」按 data-skip＝target 的按鈕；會錯過課時選 pick；回傳 (說過的話, 看到的選項)"""
    await phone(pg, cdp, 'today')
    sel = '#phoneBody [data-skip="%.3f"]' % target
    if not await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)): return None, None
    await pg.evaluate("document.querySelector(%s).scrollIntoView({block:'center'})" % json.dumps(sel)); await pg.wait_for_timeout(400)
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(2500)
    said, opts = await settle(pg, cdp, run, pick)
    await pg.wait_for_timeout(3500)   # 字幕「你在宿舍待到…」
    return said, opts


async def to_evening_and_sleep(pg, cdp, run, label):
    for _ in range(4):   # 中途可能停下來（特殊課堂、劇情），再按一次
        h = await pg.evaluate("GAME.G.hour")
        if h >= 19.9: break
        r = await skip_to(pg, cdp, run, 20.0)
        if r[0] is None: break
    await close_phone(pg, cdp)
    return await sleep_in_bed(pg, cdp, run, label)


async def wake_and_select(pg, cdp, run, label, pick):
    st = await sleep_in_bed(pg, cdp, run, label + '（週六晚上）')
    for _ in range(20):
        q = await L.state(pg)
        if '選課結果' in q['dtext'] or q['choices']: break
        await pg.wait_for_timeout(700)
    said, opts = await settle(pg, cdp, run, pick)
    return st, said, opts


async def main():
    run = L.Run('flow_course_choice', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---------- A：不修 ----------
        run.setup('讀檔：2026-02-21（週六）22:30 宿舍房間（寒假最後一個週末）、第一、二天主線已過、大一上成績已發；關掉條件事件')
        await L.load_state(pg, PRE, quiet_events=True)
        await pg.wait_for_timeout(3500)
        st, said, opts = await wake_and_select(pg, cdp, run, 'A', '這學期不修')
        run.check('A 睡覺 → 週日（2/22）早上起床：「選課結果出來了：大一下」、問法律與社會（下）要不要修',
                  bool(st) and any(t.startswith('選課結果出來了') for t in said) and any('要修嗎' in t for t in said), json.dumps(said, ensure_ascii=False))
        run.check('A 選項：「法律與社會（下）」（預設，排第一）、「這學期不修法律與社會（下）」',
                  bool(opts) and opts[0][0].startswith('法律與社會（下）') and any(o.startswith('這學期不修') for o in opts[0]), json.dumps(opts, ensure_ascii=False))
        rec = await pg.evaluate(REC_JS)
        run.check('A 選了不修（electives.Y1S2_ls＝none）、存檔', rec['el'].get('Y1S2_ls') == 'none' and await pg.evaluate("!!localStorage.getItem('fatiao3d_auto')&&JSON.parse(localStorage.getItem('fatiao3d_auto')).courses.electives.Y1S2_ls==='none'"), json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'week')
        run.check('A 手機「課表」（大一下）：沒有法律與社會（下）；經濟學原理（下）、大一國文（下）都在', '大一下' in txt and '法律與社會' not in txt and '經濟學原理（下）' in txt and '大一國文（下）' in txt, txt[:220])
        await run.shot(pg, 'A_week_no_ls')
        await close_phone(pg, cdp)
        st = await to_evening_and_sleep(pg, cdp, run, 'A 週日晚上')
        run.check('A 週日等到晚上、睡覺 → 週一（開學第一天）早上', bool(st) and (await pg.evaluate(REC_JS))['wd'] == 1, json.dumps(st))
        st = await to_evening_and_sleep(pg, cdp, run, 'A 週一晚上')
        rec = await pg.evaluate(REC_JS)
        run.check('A 週一跳過時間（照樣跳過）、睡覺 → 週二早上', bool(st) and rec['wd'] == 2, json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'today')
        run.check('A 週二手機「今天」：09:10 大一國文（下），沒有 13:20 法律與社會（下）', '大一國文（下）' in txt and '法律與社會' not in txt, txt[:220])
        await run.shot(pg, 'A_tue_today')
        said, opts = await skip_to(pg, cdp, run, 17.5)
        flat = ' '.join(' '.join(o) for o in (opts or []))
        run.check('A 週二「等到傍晚」：會錯過的只有 09:10 大一國文（下）（沒有法律與社會）', said is not None and '大一國文（下）' in flat and '法律與社會' not in flat, flat[:200])
        s = await L.state(pg)
        run.check('A 跳到 17:30', abs(s['hour'] - 17.5) < 0.05, str(s['hour']))
        await close_phone(pg, cdp)
        # ---------- B：修 ----------
        run.setup('重新讀同一個前置存檔（2026-02-21 週六 22:30 宿舍）')
        await L.load_state(pg, PRE, quiet_events=True)
        await pg.wait_for_timeout(3500)
        st, said, opts = await wake_and_select(pg, cdp, run, 'B', '法律與社會（下）')
        rec = await pg.evaluate(REC_JS)
        run.check('B 週日早上的選課結果選「法律與社會（下）」', bool(st) and rec['el'].get('Y1S2_ls') == 'law_society_2', json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'week')
        run.check('B 手機「課表」：法律與社會（下）在週二', '法律與社會（下）' in txt, txt[:220])
        await run.shot(pg, 'B_week_ls')
        await close_phone(pg, cdp)
        await to_evening_and_sleep(pg, cdp, run, 'B 週日晚上')
        st = await to_evening_and_sleep(pg, cdp, run, 'B 週一晚上')
        rec = await pg.evaluate(REC_JS)
        run.check('B 一路到週二早上', bool(st) and rec['wd'] == 2, json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'today')
        run.check('B 週二手機「今天」：09:10 大一國文（下）、13:20 法律與社會（下）（霖澤館 201）', '大一國文（下）' in txt and '法律與社會（下）' in txt and '霖澤館 201' in txt, txt[:260])
        said, opts = await skip_to(pg, cdp, run, 12.0)
        s = await L.state(pg)
        run.check('B「等到中午」：先問會錯過國文、照樣跳過 → 12:00', abs(s['hour'] - 12.0) < 0.05 and any('大一國文（下）' in ' '.join(o) for o in (opts or [])), f"{s['hour']} {json.dumps(opts, ensure_ascii=False)}")
        said, opts = await skip_to(pg, cdp, run, 13 + 1 / 6)
        s = await L.state(pg)
        run.check('B「等到下一堂課前」→ 13:10（中間沒有課，不問）', abs(s['hour'] - (13 + 1 / 6)) < 0.05 and not opts, f"{s['hour']} {json.dumps(opts, ensure_ascii=False)}")
        await phone(pg, cdp, 'today')
        ok = await pg.evaluate("!!document.querySelector('#phoneBody [data-go]')")
        run.check('B 手機「今天」有「去教室」（法律與社會（下）現在可以進教室）', ok)
        if ok:
            await L.tap(pg, cdp, '#phoneBody [data-go]'); await pg.wait_for_timeout(6000)
        s = await L.state(pg)
        run.check('B 到霖澤館 201、時間有過（快速前往）', s['zone'] == 'classroom' and 13.2 <= s['hour'] < 13.7, json.dumps(s, ensure_ascii=False))
        if s['zone'] == 'classroom':
            seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.row===2&&q.col===3); return s?{x:s.x,z:s.z}:null; })()")
            ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.3, '座位')
            s = await L.state(pg)
            run.check('B 自己走到座位旁、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
            if s['interact'].startswith('坐下'):
                await L.tap(pg, cdp, '#interact')
                first = ''
                for _ in range(16):   # 坐下的動畫＋選單（SwiftShader 慢時要好幾秒）
                    await pg.wait_for_timeout(700)
                    first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
                    if first: break
                run.check('B 坐下後第一個選項「上課：法律與社會（下）」', first.startswith('上課：法律與社會（下）'), first)
                s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
                rec = await pg.evaluate(REC_JS)
                run.check('B 下課 15:10、法律與社會（下）出席 1 次', s['hour'] >= 15.15 and s['hour'] < 15.6 and rec['attend'].get('law_society_2') == 1, json.dumps(rec, ensure_ascii=False))
                await run.shot(pg, 'B_after_class')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
