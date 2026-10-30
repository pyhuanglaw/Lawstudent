"""真實玩家流程：選課結果之後（ChatGPT 審查第七點「選擇不同課程後的實際玩家流程」；AA_104 第 2 節的選課結果）。不用 ?turbo。
2026-10-15 改寫：AA_130 課程調整（bb6d2ee）刪掉法律與社會以後，大一下沒有選修了；現在只有大四上有兩組選修（勞動社會法／財稅法，週四下午一；
刑事判決研討／公法判決研討，週五上午），所以改測大四上。原本的大一下版本在 git 歷史裡（3fbaca9 以前）。
[前置／捷徑] 讀檔：2028-09-02（週六）22:30 宿舍房間＝大四上開學前的週末；關掉條件事件（這個測試不測劇情；選課結果不是條件事件）。
A. 選非預設：走到床邊「睡覺」→ 9/3（週日）起床 →「選課結果出來了：大四上」→「勞動社會法、財稅法，選一門。」選財稅法 →「刑事判決研討、公法判決研討，選一門。」選公法判決研討
   → 存檔 → 手機「課表」：有財稅法、公法判決研討，沒有勞動社會法、刑事判決研討 → 等到晚上、睡覺 → 9/4（週一，開學第一天）手機「今天」：09:10 強制執行法（不受影響）。
B. 預設：重新讀同一個前置存檔 → 睡覺 → 兩組都選第一個（預設排第一）→ 勞動社會法、刑事判決研討 → 手機「課表」相反。
C. 上選的那門課：[前置／捷徑] 讀檔到 9/7（週四）13:00 宿舍、選修照 A（財稅法）→ 手機「今天」13:20 財稅法（法律系館A 201）→「去教室」→ 自己走到座位、坐下「上課：財稅法」→ 下課 15:10、出席 1 次。
用法：python3 tests/flow_course_choice.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_course_choice'
SAT, THU = 1082, 1087   # 2028-09-02 週六、09-07 週四（第 1 天＝2025-09-17）；大四上 2028-09-04 開學
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'fundsV2': 1, 'allowanceMonth': 9}
GRADES = {t: {} for t in ('Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2')}
NOTE = {'sel_' + t: 1 for t in GRADES}
PRE = {'zone': 'dorm', 'hour': 22.5, 'day': SAT, 'weekday': 6, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.0, 'yaw': 3.14}, 'flags': BASE_FLAGS,
       'visited': {'dorm': True, 'campus': True, 'linze': True, 'classroom': True, 'gongguan': True, 'wenzhou': True, 'wancai': True},
       'courses': {'idv': 3, 'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'grades': GRADES, 'note': dict(NOTE)}}
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
        # 記整句（GAME.D.full）：畫面上的字是打字機效果打到一半的樣子，SwiftShader 1 fps 時取樣常常只拿到半句，
        # 下一次取樣已經是下一句（2026-10-14 v9.6 回歸：「選課結果出來」少了「了」）——判斷標準不變，只是不靠取樣剛好碰到打完的那一刻
        full = await pg.evaluate("(()=>{ const D=GAME.D; return D&&D.active?String(D.full||''):''; })()")
        t = full or q['dtext']
        if t and (not said or said[-1] != t): said.append(t)
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
    """走到床邊、按「睡覺」、選「睡到明天早上」（v9.7 以前是「睡覺」）；等到隔天早上在宿舍醒來（titleCard、進宿舍）"""
    bed = await L.find_it(pg, '睡覺')
    ok = bool(bed) and await L.go_to(pg, cdp, run, bed['x'], bed['z'], bed['r'] * 0.7, '床')
    s = await L.state(pg)
    if not (ok and s['interact'].startswith('睡覺')):
        run.check(label + '：走到床邊、出現「睡覺」', False, json.dumps(s, ensure_ascii=False)); return None
    d0 = await pg.evaluate("GAME.G.day")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    # v9.7 睡覺第二版（AA_110 6-5）：床的選項是「睡到明天早上（07:30）」「睡到明天中午」…（舊版是「睡覺」）；照 flow_typhoon（候選 4）的改法
    if not (await choose(pg, cdp, '睡到明天早上') or await choose(pg, cdp, '睡覺')):
        run.check(label + '：床的選項有「睡到明天早上」', False); return None
    for _ in range(300):   # 睡覺的過場（淡出、標題卡、換區域）在 1 fps 時要好幾分鐘（flow_typhoon 候選 4 同一個改法：原本只等 60 秒）
        st = await pg.evaluate("({day:GAME.G.day, zone:GAME.G.zone, hour:GAME.G.hour})")
        if st['day'] == d0 + 1 and st['zone'] == 'dorm' and abs(st['hour'] - 7.5) < 0.05: break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(3500)   # 起床的標題卡、進宿舍、早上的提示（CLS.morning）
    if st.get('day') and await pg.evaluate("CLS.goList(GAME.G).length>0"):
        await L.skip_wake_menu(pg, cdp)   # DL-01：有課的早上（9/4 開學）出起床選單，選「先起床再說」
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
        # ---------- A：選非預設 ----------
        run.setup('讀檔：2028-09-02（週六）22:30 宿舍房間（大四上開學前的週末）、前六學期的成績已發；關掉條件事件')
        await L.load_state(pg, PRE, quiet_events=True)
        await pg.wait_for_timeout(3500)
        st = await sleep_in_bed(pg, cdp, run, 'A（週六晚上）')
        said, opts = [], []
        for _ in range(20):
            q = await L.state(pg)
            if '選課結果' in q['dtext'] or q['choices']: break
            await pg.wait_for_timeout(700)
        picks = ['財稅法', '公法判決研討']
        for _ in range(60):   # 點對話；兩次選項依序選 picks（settle 一次只能給一個開頭）
            q = await L.state(pg)
            full = await pg.evaluate("(()=>{ const D=GAME.D; return D&&D.active?String(D.full||''):''; })()")
            t = full or q['dtext']
            if t and (not said or said[-1] != t): said.append(t)
            if q['choices']:
                o = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
                opts.append(o); want = picks.pop(0) if picks else o[0][:4]
                if not await choose(pg, cdp, want): await choose(pg, cdp, o[0][:4])
                continue
            if not q['busy'] and not q['dlg']: break
            if q['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(900)
        run.check('A 睡覺 → 週日（9/3）早上起床：「選課結果出來了：大四上」、兩組各選一門',
                  bool(st) and any(t.startswith('選課結果出來了：大四上') for t in said) and any('勞動社會法、財稅法，選一門' in t for t in said) and any('刑事判決研討、公法判決研討，選一門' in t for t in said), json.dumps(said, ensure_ascii=False))
        run.check('A 選項：預設排第一（勞動社會法、刑事判決研討）', len(opts) >= 2 and opts[0][0].startswith('勞動社會法') and opts[1][0].startswith('刑事判決研討'), json.dumps(opts, ensure_ascii=False))
        rec = await pg.evaluate(REC_JS)
        saved = await pg.evaluate("(()=>{ try{ return JSON.parse(localStorage.getItem('fatiao3d_auto')).courses.electives; }catch(e){ return null; } })()")
        run.check('A 選了財稅法、公法判決研討（electives）、存檔', rec['el'].get('Y4S1_elec') == 'tax_law' and rec['el'].get('Y4S1_sem') == 'public_judgment_sem' and bool(saved) and saved.get('Y4S1_elec') == 'tax_law', json.dumps([rec['el'], saved], ensure_ascii=False))
        txt = await phone(pg, cdp, 'week')
        run.check('A 手機「課表」（大四上）：有財稅法、公法判決研討；沒有勞動社會法、刑事判決研討', '大四上' in txt and '財稅法' in txt and '公法判決研討' in txt and '勞動社會法' not in txt and '刑事判決研討' not in txt, txt[:300])
        await run.shot(pg, 'A_week')
        await close_phone(pg, cdp)
        st = await to_evening_and_sleep(pg, cdp, run, 'A 週日晚上')
        rec = await pg.evaluate(REC_JS)
        run.check('A 週日等到晚上、睡覺 → 週一（開學第一天）早上', bool(st) and rec['wd'] == 1, json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'today')
        run.check('A 週一手機「今天」：09:10 強制執行法', '強制執行法' in txt, txt[:220])
        await run.shot(pg, 'A_mon_today')
        await close_phone(pg, cdp)
        # ---------- B：預設 ----------
        run.setup('重新讀同一個前置存檔（2028-09-02 週六 22:30 宿舍）')
        await L.load_state(pg, PRE, quiet_events=True)
        await pg.wait_for_timeout(3500)
        st, said, opts = await wake_and_select(pg, cdp, run, 'B', None)
        rec = await pg.evaluate(REC_JS)
        run.check('B 兩組都選第一個 → 勞動社會法、刑事判決研討', bool(st) and rec['el'].get('Y4S1_elec') == 'labor_social' and rec['el'].get('Y4S1_sem') == 'crim_judgment_sem', json.dumps(rec, ensure_ascii=False))
        txt = await phone(pg, cdp, 'week')
        run.check('B 手機「課表」：有勞動社會法、刑事判決研討；沒有財稅法、公法判決研討', '勞動社會法' in txt and '刑事判決研討' in txt and '財稅法' not in txt and '公法判決研討' not in txt, txt[:300])
        await run.shot(pg, 'B_week')
        await close_phone(pg, cdp)
        # ---------- C：上選的那門課 ----------
        run.setup('讀檔：2028-09-07（週四）13:00 宿舍、選修＝財稅法、公法判決研討（A 的結果）')
        C = json.loads(json.dumps(PRE)); C.update({'day': THU, 'weekday': 4, 'hour': 13.0})
        C['courses']['electives'] = {'Y4S1_elec': 'tax_law', 'Y4S1_sem': 'public_judgment_sem'}; C['courses']['note']['sel_Y4S1'] = 1
        await L.load_state(pg, C, quiet_events=True)
        await pg.wait_for_timeout(3500)
        txt = await phone(pg, cdp, 'today')
        run.check('C 手機「今天」：13:20 財稅法（法律系館A 201），沒有勞動社會法', '財稅法' in txt and '法律系館A 201' in txt and '勞動社會法' not in txt, txt[:260])
        ok = await pg.evaluate("!!document.querySelector('#phoneBody [data-go]')")
        run.check('C 手機「今天」有「去教室」', ok)
        if ok:
            await L.tap(pg, cdp, '#phoneBody [data-go]'); await pg.wait_for_timeout(6000)
        s = await L.state(pg)
        run.check('C 到法律系館A 201（快速前往）', s['zone'] == 'classroom', json.dumps(s, ensure_ascii=False))
        if s['zone'] == 'classroom':
            seat = await pg.evaluate("(()=>{ const s=GAME.E.zone.seats.find(q=>q.row===2&&q.col===3); return s?{x:s.x,z:s.z}:null; })()")
            ok = bool(seat) and await L.go_to(pg, cdp, run, seat['x'], seat['z'] + 0.35, 0.3, '座位')
            s = await L.state(pg)
            run.check('C 自己走到座位旁、出現「坐下」', ok and s['interact'].startswith('坐下'), json.dumps(s, ensure_ascii=False))
            if s['interact'].startswith('坐下'):
                await L.tap(pg, cdp, '#interact')
                first = ''
                for _ in range(16):
                    await pg.wait_for_timeout(700)
                    first = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); return b?b.textContent:''; })()")
                    if first: break
                run.check('C 坐下後第一個選項「上課：財稅法」', first.startswith('上課：財稅法'), first)
                s = await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['busy'] and not q['dlg'] and not q['choices'], pick=0)
                rec = await pg.evaluate(REC_JS)
                run.check('C 下課 15:10、財稅法出席 1 次', s['hour'] >= 15.15 and s['hour'] < 15.6 and rec['attend'].get('tax_law') == 1, json.dumps(rec, ensure_ascii=False))
                await run.shot(pg, 'C_after_class')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
