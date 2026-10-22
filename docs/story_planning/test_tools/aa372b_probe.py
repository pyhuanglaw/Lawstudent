"""BB（帳號 A）2026-10-22：AA372-Y1S1-FIX-1021 第二部分（AA_372 第 5 節要新局 9/1～9/4 才玩得到的＋第 6 節十題裡玩家看得到的；開發分支 4326d91c 起，y1b 合併）。
第一部分（使用者 9/25 存檔做得到的：博覽會、芯慈／柏翰／明軒只演一次、以安第 4 週、沛珊單數週、語彤雨天）在 aa372_probe.py。
  AN_ATTEND  新局 9/4（主線第 2 天）13:03 霖澤館大廳 → 自己走上二樓進 201 → 民總（答「網頁標價比較像要約之引誘…」「八十八條…」）：
             旁白「教室安靜了兩秒。前排那個女生低頭寫字。」「前排那個女生回頭看了你一眼，很快又轉回去。」、沒有「前排的小安」；下課後走到她旁邊，按鈕是「和她說話」（不按）；
             走出霖澤館 → 她追出來：字幕「前排的女生」「{name}！等一下！」→「呼——你走好快。」「我是沈以安。……大家都叫我小安。」（前排的女生說的）→ 之後的話是「小安」說的；
             約你的三個選項小字「跟小安一起走去溫州街」「跟小安一起走去總圖」；記 AN_NAME_TOLD（第 6 節第 3 題）
  AN_ABSENT  新局 9/4 15:13 在校園、沒去民總：字幕「不認識的女生」「請問——你是{name}嗎？」→「呼——你走好快。」→「阿哲說你應該在這附近。」→「我是沈以安。……大家都叫我小安。」→（小安）「你今天沒來？…」；日誌「翹掉了民法總則」（第 5 項、第 6 節第 3、5 題）
  KEVIN      新局 9/4 20:45 宿舍：手機上學姊的私訊串（9/3 加好友起）寫「溫書瑀」、沒有「不認識的女生」、還沒有「（直屬）」；21:00 家族群組 Kevin「家族群組開好了。學弟，這次不用臥底了。」「上面那位是你的直屬學姊。」
             接學姊兩句、Kevin「你們認識？」，沒有「我是 Kevin」「歡迎學弟」；21:00 以後聯絡人變「溫書瑀（直屬）」（第 2 項、第 12 項、第 6 節第 10 題）
             【前置／捷徑】9/1～9/3 的手機訊息（系上社群自介、她的留言、9/3 接受交友、9/3 晚上祐廷私訊她）在頁面裡把時間撥回那幾天跑手機規則補上（開場兩天不能跳過時間，照玩家走要 13 個遊戲小時）
  NCCU       新局 9/12（五）19:20 宿舍：可昕「週末來政大？我當導遊。」→ 回「好，週六下午過去。」→ 睡覺 → 9/13 手機「等到下午」→「出發：去政大找可昕」→ 選「妳推薦哪一家？」：
             「山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。」、最後一句「下次你來，我們吃山上那家。」、沒有「……這是分工，不是命令。」（第 7 項、第 6 節第 7 題）
  K2         新局 10/10（五）19:50：可昕「這次換我去台大。我先去找品妤，再去霖澤館抓你。」→ 10/11 16:00 社科院門口（床上小睡到 15:30 等出發）→ 演完，選單「筆記」的日誌寫「可昕來台大找你」、沒有「可昕第一次來台大」（第 11 項、第 6 節第 9 題）
  PS_ALT     沛珊大一下、大二上也隔週回台中（第 6 節第 8 題）：使用者存檔改到 2026-03-14（大一下第 3 週六）、03-21（第 4 週六）、2026-09-26（大二上第 3 週六）、10-03（第 4 週六）15:12 公館：
             朋友頁單數週「回台中」、沒有「約」；捷運到大稻埕：單數週迪化街不會遇到她；雙數週照遊戲擲的結果（ENC 的紀錄）——擲到她就要遇到（擲到沒人＝那天沒有偶遇，記 NOT TESTED，不算 FAIL）
  AN_D26     以安 D26（台中審計新村）加大一上第 4、8、12 週的週六（第 6 節第 8 題）：使用者存檔改到 9/27、10/25、11/22（對照 10/4）11:00 公館 → 捷運 → 臺中（外縣市）→ 到達時有沒有遇到她；
             10/25 是期中考週：臺中一日遊是 noExamWeek（考試週不能去）＝玩家到不了，記下來（給 AA／LAWWW）
  BOHAN_UP   柏翰升到「有點熟」的兩句（第 6 節第 2 題）：使用者存檔 10/14 16:00 總圖大廳、柏翰有點熟（還沒播過升級句；考古題那件記成演過），手機朋友頁「帶我去」找他說話：
             「我現在每天記讀書時數。……昨天四小時二十分。」「我想調一下我的時間表。」；找不到他＝【讀資料，不是玩】REL_LINES 那兩句
【前置】新局的情境用遊戲自己的讀檔（GAME.defaults＋新局旗標 LAW_START_DAY 8/29、MAIN_D1 9/3、CAMP_Y1、introDone、readCase）放到那一天；使用者存檔的情境改日期、時間、地點；每個情境寫在 run.setup。
quiet_events（條件事件不演、要回的訊息不自己打開手機；主線劇情、手機訊息、出遊、偶遇、說話照常）。之後照玩家：走路、按互動、手機回訊息、床上睡覺、手機「跳過時間」、捷運。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=AN_ATTEND,... python3 aa372b_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>(x.t||x.text||'')+(x.hint?'〔'+x.hint+'〕':''))), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(a||'')+'｜'+String(b||''), at:at()}); }catch(e){} return c1.apply(this,arguments); }; }
  if(GAME.memo){ const m0=GAME.memo; GAME.memo=function(m){ try{ window.__LOG.push({n:'［日誌］', t:typeof m==='string'?m:String((m&&(m.t||m.text))||''), at:at()}); }catch(e){} return m0.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||'', name:m.name||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?{id:m.ask.id,opts:m.ask.opts.map(o=>o.t)}:null})))"""
OUTQ = """(ids=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>ids.includes(q.id)).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, h:+(+q.h).toFixed(3), state:q.state, title:q.title||''})))"""
DAY2_DONE = {'campusIntro': True, 'classDone': True, 'classAnswer': 'good', 'metAn': True, 'AN_NAME_TOLD': True, 'anSkipped': True, 'afternoonDone': True}
CHAIN = """(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k), keep=[G.day,G.hour,G.weekday];
  const at=(d,h)=>{ G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; STORY.phoneRules(GAME); PHONE.tick(G); };
  if(STORY.familyW0) STORY.familyW0(G); at(D('2025-08-30'),21.1);
  at(D('2025-08-31'),15); STORY.lawClassJoinY1(G); at(D('2025-08-31'),15.2);
  const d1=D('2025-09-01'); at(d1,21.05); at(d1+1,12.55); at(d1+2,8.05); at(d1+2,21.05);
  G.day=keep[0]; G.hour=keep[1]; G.weekday=keep[2]; STORY.phoneRules(GAME); PHONE.tick(G);
  return {family:PHONE.inGroup(G,'family_law'), board:PHONE.inGroup(G,'law_board'), sent:['sis_b_intro','sis_b_comment','sis_b_dm','fam_w0'].map(t=>t+':'+PHONE.sent(G,t)), contacted:!!G.flags.SIS_CONTACTED,
    title:PHONE.title(G,'p:heroine_05'), contact:SOCIAL.contactName('heroine_05')}; })()"""


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None, go=()):
    """picks（要選的字，依序找）→ go（要出發的出遊）→ 起床「先起床再說」、跳過時間「照樣跳過」、捷運「照樣出發」、說話完「就這樣」→ 別人的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for i, o in enumerate(ops):
        if go and o.startswith(tuple(go)): return i
    for pre in ('先起床再說', '先起床', '照樣跳過', '照樣出發', '就這樣'):
        for i, o in enumerate(ops):
            if o.startswith(pre): return i
    if any(o.startswith(('出發：', '接起來：')) for o in ops):
        for i, o in enumerate(ops):
            if o.startswith(('不去了', '今天先不要', '先不接', '不接')): return i
    return 0


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def phone_tab(pg, cdp, tab):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def phone_text(pg):
    return await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜')")


async def drive(pg, cdp, run, picks=None, go=(), max_s=240, label=''):
    t0 = time.time(); idle = 0; ch = []
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            k = pick_idx(ops, picks, go); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, go=(), label='', shot_at=None):
    """時間照走（不跳過時間），對話、選項照 pick_idx 點，直到 cond（JS）成立"""
    t0 = time.time(); ch = []; shot = False
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks, go); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                if go and ops[k].startswith(tuple(go)): await run.shot(pg, '%s_prompt' % label)
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            if shot_at and not shot:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if shot_at in txt: await run.shot(pg, '%s_scene' % label); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def answer_text(pg, cdp, run, th, contains, want, label=''):
    """照玩家：手機 → 訊息 → 那個對話串 → 點回覆（找文字含 contains、還沒回的那則）"""
    m = await pg.evaluate("(([th,c])=>{ const m=PHONE.pending(GAME.G).find(x=>x.th===th&&String(x.text||'').includes(c)); return m?{id:m.ask.id,opts:m.ask.opts.map(o=>o.t)}:null; })(%s)" % json.dumps([th, contains]))
    if not m: return None
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th)); await pg.wait_for_timeout(600)
    await run.shot(pg, '%s_dm' % label)
    k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), 0)
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
    await pg.wait_for_timeout(1500); say('   %s 手機回：「%s」' % (label, got)); await L.phone_away(pg, cdp); return got


FALLBACK = {'等到中午': ['等到中午', '等到下一堂課前'], '等到傍晚': ['等到傍晚', '等到下午'], '等到下午': ['等到下午'], '等到晚上': ['等到晚上']}


async def skip(pg, cdp, label_prefix, label=''):
    await phone_tab(pg, cdp, 'today'); got = None
    for pre in FALLBACK.get(label_prefix, [label_prefix]):
        got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(pre))
        if got: break
    if not got:
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim())"); say('   %s 跳過時間沒有「%s」：%s' % (label, label_prefix, btns)); await L.phone_away(pg, cdp); return None
    await pg.wait_for_timeout(1500)
    for _ in range(6):
        ops = await opts(pg)
        if ops and any(o.startswith('照樣跳過') for o in ops): await tap_idx(pg, cdp, next(i for i, o in enumerate(ops) if o.startswith('照樣跳過'))); await pg.wait_for_timeout(1500); break
        if not ops: await pg.wait_for_timeout(700)
        else: break
    await pg.wait_for_timeout(2500); say('   %s 跳過時間「%s」→ %s' % (label, got, await pg.evaluate(STATE))); return got


async def quick_go(pg, cdp, zone):
    await phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); return (await pg.evaluate("GAME.G.zone")) == zone


async def bed(pg, cdp, run, prefix, label=''):
    if (await pg.evaluate("GAME.G.zone")) != 'dorm': await quick_go(pg, cdp, 'dorm')
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=120, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    ops = []
    for _ in range(12):
        ops = await opts(pg)
        if ops: break
        await pg.wait_for_timeout(600)
    say('   %s 床：%s' % (label, ops))
    k = next((i for i, o in enumerate(ops) if o.startswith(prefix)), None)
    if k is not None: await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops


async def sleep_night(pg, cdp, run, label=''):
    st0 = await pg.evaluate(STATE); ops = await bed(pg, cdp, run, '睡', label)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, ok


async def log_since(pg, n0):
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def log_len(pg):
    return len(await pg.evaluate("window.__LOG||[]"))


def texts(log, name='祐廷'):
    return [x['t'].replace('{name}', name) for x in log if x['n'] not in ('［選項］', '［字幕］', '［日誌］')]


def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None


async def launch(p, run, base, key, h, zone, flags=None, fresh=False, js=None, label='', quiet=True, weather=None, money=None):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)
    if fresh:   # 新局：GAME.defaults＋法律系開局（8/29 搬進宿舍、9/3 主線第一天）的旗標
        d829 = await pg.evaluate("STORY.dayOfKey('2025-08-29')"); d93 = await pg.evaluate("STORY.dayOfKey('2025-09-03')"); m = await pg.evaluate("CALENDAR.dateOf(%d).m" % d)
        F = {'dating_kexin': True, 'KX_DEC3_MIGRATED': True, 'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': m, 'LAW_START_DAY': d829, 'MAIN_D1': d93,
             'LAW_RECAP_SEEN': True, 'LAW_MOVEIN_DAY': d829, 'CAMP_Y1': True, 'introDone': True, 'readCase': 'full'}
        F.update(flags or {})
        G = {'stage': 'law', 'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': wd, 'money': money or 7000, 'flags': F}
    else:       # 使用者存檔（舊局，主線第一天 9/17）改日期
        st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
        for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
            dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
            if dd <= d: F[k] = dd
        F['KX_DEC3_MIGRATED'] = True; F.update(flags or {})
        G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': wd})
        if money: G['money'] = max(G.get('money') or 0, money)
    if weather: G['weather'] = weather
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(js) if js else None
    run.setup('[前置] %s：%s %s %.2f %s%s；旗標 %s%s' % (label, '新局（GAME.defaults＋LAW_START_DAY 8/29、MAIN_D1 9/3、CAMP_Y1、introDone、readCase full）' if fresh else '使用者存檔改到',
              key, h, zone, '（quiet_events）' if quiet else '', json.dumps(flags or {}, ensure_ascii=False), '；頁面裡：' + json.dumps(r, ensure_ascii=False)[:400] if r is not None else ''))
    return b, pg, cdp, errs, r


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


def errs_check(run, sid, res, errs):
    res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))


# ------------------------------------------------------------------ 9/4 民總、以安追出來
async def leave_linze(pg, cdp, run, sid):
    ex = await L.find_it(pg, '離開教室')
    ok = bool(ex) and await L.go_to(pg, cdp, run, ex['x'], ex['z'], ex['r'] * 0.7, '教室後門', max_s=180)
    if ok: await L.tap(pg, cdp, '#interact')
    ok2, _ = await wait_for(pg, cdp, run, "GAME.G.zone==='linze'&&!GAME.E.player.busy", max_s=120, label=sid)
    ex2 = await L.find_it(pg, '走出霖澤館')
    ok3 = bool(ex2) and await L.go_to(pg, cdp, run, ex2['x'] - 0.3, ex2['z'], 0.9, '霖澤館大廳出口', max_s=240, lv=0)
    if ok3: await L.tap(pg, cdp, '#interact')
    ok4, _ = await wait_for(pg, cdp, run, "GAME.G.zone==='campus'", max_s=120, label=sid)
    return {'後門': ok, '回到霖澤館': ok2, '走到出口': ok3, '回到校園': ok4}


async def s_an_attend(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-09-04', 13.05, 'linze', flags={'campusIntro': True}, fresh=True,
                                       label=sid + '（9/4 主線第 2 天 13:03 霖澤館大廳；中午阿哲那一段算演過＝campusIntro）')
    try:
        await drive(pg, cdp, run, max_s=20, label=sid)
        it = await L.find_it(pg, '進入 201')
        ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'] + 0.3, 0.9, '201 教室門口（二樓）', max_s=300, lv=1)
        run.check('%s：自己走樓梯上二樓，到 201 門口' % sid, ok, json.dumps(it, ensure_ascii=False))
        n0 = await log_len(pg); await L.tap(pg, cdp, '#interact')
        ok, ch = await wait_for(pg, cdp, run, "!!GAME.G.flags.classDone&&!(GAME.D&&GAME.D.active)&&!GAME.E.player.busy", max_s=480,
                                picks=['網頁標價比較像要約之引誘', '八十八條'], label=sid, shot_at='前排')
        await drive(pg, cdp, run, max_s=60, label=sid)   # 下課後阿哲那兩句
        lg = await log_since(pg, n0); T = texts(lg); res['class'] = T[:30]
        fl = await pg.evaluate("({ans:GAME.G.flags.classAnswer||null, told:!!GAME.G.flags.AN_NAME_TOLD})"); res['class_flags'] = fl
        run.check('%s：民總上完（答對＝classAnswer good）' % sid, ok and fl['ans'] == 'good', json.dumps(fl, ensure_ascii=False))
        run.check('%s：旁白「教室安靜了兩秒。前排那個女生低頭寫字。」' % sid, '教室安靜了兩秒。前排那個女生低頭寫字。' in T, json.dumps([t for t in T if '前排' in t], ensure_ascii=False))
        run.check('%s：旁白「前排那個女生回頭看了你一眼，很快又轉回去。」' % sid, '前排那個女生回頭看了你一眼，很快又轉回去。' in T, json.dumps([t for t in T if '前排' in t], ensure_ascii=False))
        run.check('%s：上課時沒有「前排的小安」' % sid, not any('前排的小安' in t for t in T), '')
        an = await pg.evaluate("(()=>{ const n=(GAME.npc||{}).an; return n&&n.obj?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.name||'',n.talkLabel||'']:null; })()")
        btn = ''
        if an:
            await L.go_to(pg, cdp, run, an[0], an[1], 1.1, '前排的她', max_s=90, lv=an[2]); await pg.wait_for_timeout(800)
            btn = (await L.state(pg)).get('interact') or ''; await run.shot(pg, '%s_an_button' % sid)
        res['an_button'] = [an, btn]
        run.check('%s：下課後走到她旁邊，按鈕是「和她說話」（還沒報名字；不按）' % sid, btn.startswith('和她說話'), json.dumps([an, btn], ensure_ascii=False))
        mv = await leave_linze(pg, cdp, run, sid); res['leave'] = mv
        run.check('%s：走出 201、走下樓梯、走出霖澤館' % sid, all(mv.values()), json.dumps(mv, ensure_ascii=False))
        n1 = await log_len(pg)
        door = await pg.evaluate("(()=>{ const d=(typeof B3!=='undefined'&&B3.CAMPUS_DOOR)||{x:34,z:-100}; return [d.x,d.z]; })()")
        for tx, tz in ((door[0] + 12, door[1] + 5), (door[0], door[1] + 10), (door[0] - 10, door[1] + 4)):   # 走出大廳再走 6 m，她追上來
            if await pg.evaluate("!!GAME.G.flags.metAn"): break
            await L.go_to(pg, cdp, run, tx, tz, 1.5, '離開霖澤館門口', max_s=90)
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags.anSkipped===true||GAME.G.flags.companion==='an'", max_s=300, picks=['今天有點累'], label=sid, shot_at='呼——')
        lg = await log_since(pg, n1); res['meet'] = lg[:30]
        caps = [x['t'] for x in lg if x['n'] == '［字幕］']; said = [(x['n'], x['t']) for x in lg if x['n'] not in ('［選項］', '［字幕］', '［日誌］')]
        chs = [json.loads(x['t']) for x in lg if x['n'] == '［選項］']
        run.check('%s：字幕「前排的女生」「{name}！等一下！」' % sid, bool(caps) and caps[0].startswith('前排的女生｜') and '等一下！' in caps[0], json.dumps(caps[:2], ensure_ascii=False))
        run.check('%s：「呼——你走好快。」「我是沈以安。……大家都叫我小安。」是「前排的女生」說的（第 6 節第 3 題）' % sid,
                  said[:2] == [('前排的女生', '呼——你走好快。'), ('前排的女生', '我是沈以安。……大家都叫我小安。')], json.dumps(said[:4], ensure_ascii=False))
        later = [n for n, t in said[2:] if n and n not in ('祐廷', '')]
        run.check('%s：報了名字以後是「小安」說的' % sid, bool(later) and all(n == '小安' for n in later), json.dumps(said[2:6], ensure_ascii=False))
        hints = json.dumps(chs[:1], ensure_ascii=False)
        run.check('%s：約你的三個選項小字「跟小安一起走去溫州街」「跟小安一起走去總圖」' % sid, '跟小安一起走去溫州街' in hints and '跟小安一起走去總圖' in hints and '跟她一起' not in hints, hints)
        run.check('%s：記 AN_NAME_TOLD' % sid, await pg.evaluate("GAME.G.flags.AN_NAME_TOLD===true"), '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_an_absent(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-09-04', 15.22, 'campus', flags={'campusIntro': True}, fresh=True,
                                       label=sid + '（9/4 15:13 人在校園、沒去民總；中午阿哲那一段算演過）')
    try:
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags.anSkipped===true||GAME.G.flags.companion==='an'", max_s=360, picks=['今天有點累'], label=sid, shot_at='呼——')
        lg = await log_since(pg, n0); res['log'] = lg[:30]
        caps = [x['t'] for x in lg if x['n'] == '［字幕］']; said = [(x['n'], x['t']) for x in lg if x['n'] not in ('［選項］', '［字幕］', '［日誌］')]
        memo = [x['t'] for x in lg if x['n'] == '［日誌］']
        fl = await pg.evaluate("({ans:GAME.G.flags.classAnswer||null, told:!!GAME.G.flags.AN_NAME_TOLD})"); res['flags'] = fl
        run.check('%s：15:18 以後她追出來（classAnswer absent）' % sid, ok and fl['ans'] == 'absent', json.dumps(fl, ensure_ascii=False))
        run.check('%s：字幕「不認識的女生」「請問——你是{name}嗎？」（不是「{name}！等一下！」）' % sid, bool(caps) and caps[0].startswith('不認識的女生｜') and '請問——你是' in caps[0] and '等一下！' not in caps[0], json.dumps(caps[:2], ensure_ascii=False))
        exp = [('不認識的女生', '呼——你走好快。'), ('不認識的女生', '阿哲說你應該在這附近。'), ('不認識的女生', '我是沈以安。……大家都叫我小安。'), ('小安', '你今天沒來？周老師點了你的名字，全班都在找你。……我有抄筆記，等一下給你看。')]
        run.check('%s：順序「呼——你走好快。」→「阿哲說你應該在這附近。」→ 報名字 →（小安）「你今天沒來？…」（第 6 節第 3、5 題）' % sid, said[:4] == exp, json.dumps(said[:5], ensure_ascii=False))
        run.check('%s：日誌「翹掉了民法總則」' % sid, '翹掉了民法總則' in memo, json.dumps(memo, ensure_ascii=False))
        await run.shot(pg, '%s_after' % sid)
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ------------------------------------------------------------------ 9/4 21:00 家族群組、學姊的名字
async def s_kevin(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-09-04', 20.75, 'dorm', flags=dict(DAY2_DONE), fresh=True, js=CHAIN,
                                       label=sid + '（9/4 20:45 宿舍；9/4 白天的主線算演過；9/1～9/3 的手機訊息：頁面裡撥回那幾天跑手機規則補上）')
    try:
        res['chain'] = r
        run.check('%s：【前置】系上社群、家族群組、她的留言、9/3 接受交友、9/3 晚上的私訊都在' % sid, bool(r) and r['family'] and r['board'] and all(x.endswith('true') for x in r['sent']) and r['contacted'], json.dumps(r, ensure_ascii=False))
        await phone_tab(pg, cdp, 'msg'); lst = await phone_text(pg); await run.shot(pg, '%s_threads_2045' % sid)
        await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:heroine_05')"); await pg.wait_for_timeout(800)
        th = await phone_text(pg); await run.shot(pg, '%s_sis_thread_2045' % sid); await L.phone_away(pg, cdp)
        nm0 = await pg.evaluate("({title:PHONE.title(GAME.G,'p:heroine_05'), contact:SOCIAL.contactName('heroine_05')})"); res['before'] = {'list': lst[:400], 'thread': th[:400], 'names': nm0}
        run.check('%s：9/4 20:45 手機：學姊的私訊串寫「溫書瑀」、沒有「不認識的女生」、還沒有「（直屬）」（第 6 節第 10 題）' % sid,
                  '溫書瑀' in lst and '不認識的女生' not in lst and '溫書瑀（直屬）' not in lst and nm0['title'] == '溫書瑀', json.dumps({'list': lst[:200], 'names': nm0}, ensure_ascii=False))
        run.check('%s：私訊串裡 9/3 晚上那段在（祐廷問民總要買哪一本、她回「先不要買。…」）' % sid, '先不要買。' in th, th[:200])
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=21.05", max_s=420, label=sid)
        M = await msgs(pg, 'g:family_law'); d4 = [m for m in M if m['d'] == '2025-09-04']; res['family_0904'] = d4
        exp = [('kevin', '家族群組開好了。學弟，這次不用臥底了。'), ('kevin', '上面那位是你的直屬學姊。'), ('heroine_05', '學弟好。我們留言區見過了。'), ('kevin', '你們認識？'), ('heroine_05', '他自介我有留言。')]
        run.check('%s：21:00 家族群組：Kevin「家族群組開好了。學弟，這次不用臥底了。」「上面那位是你的直屬學姊。」→ 學姊、Kevin、學姊（第 2 項）' % sid,
                  ok and [(m['from'], m['text']) for m in d4][-5:] == exp and all(m['h'] >= 21.0 for m in d4[-5:]), json.dumps(d4[-6:], ensure_ascii=False)[:600])
        run.check('%s：9/4 那一串 Kevin 沒有自我介紹（「我是 Kevin」「歡迎學弟」）' % sid, not any('我是 Kevin' in m['text'] or '歡迎學弟' in m['text'] for m in d4), '')
        await phone_tab(pg, cdp, 'msg'); lst2 = await phone_text(pg)
        await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='g:family_law')"); await pg.wait_for_timeout(800)
        await run.shot(pg, '%s_family_2100' % sid); await L.phone_away(pg, cdp)
        nm1 = await pg.evaluate("({title:PHONE.title(GAME.G,'p:heroine_05'), contact:SOCIAL.contactName('heroine_05')})"); res['after'] = {'list': lst2[:400], 'names': nm1}
        run.check('%s：21:00 以後聯絡人、私訊串變「溫書瑀（直屬）」（第 12 項）' % sid, nm1['title'] == '溫書瑀（直屬）' and '溫書瑀（直屬）' in lst2, json.dumps(nm1, ensure_ascii=False))
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ------------------------------------------------------------------ 可昕：政大導遊（K1）、她來台大找你（K2）
async def s_nccu(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-09-12', 19.33, 'dorm', flags=dict(DAY2_DONE), fresh=True, label=sid + '（9/12 週五 19:20 宿舍；9/4 主線算演過；可昕交往中＝新局預設）')
    try:
        await drive(pg, cdp, run, max_s=20, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.th==='p:kexin'&&String(m.text).includes('我當導遊'))", max_s=360, label=sid)
        run.check('%s：9/12 19:30 可昕「週末來政大？我當導遊。」' % sid, ok, json.dumps((await msgs(pg, 'p:kexin'))[-2:], ensure_ascii=False))
        got = await answer_text(pg, cdp, run, 'p:kexin', '我當導遊', '好，週六下午過去。', sid)
        await pg.wait_for_timeout(2500); q = await pg.evaluate(OUTQ + "(['kx_tour'])"); res['plan'] = q
        run.check('%s：回「好，週六下午過去。」→ 排 9/13 14:00 去政大' % sid, bool(got) and any(x['d'] == '2025-09-13' and abs(x['h'] - 14) < 0.01 for x in q), json.dumps(q, ensure_ascii=False))
        ops, slept = await sleep_night(pg, cdp, run, sid)
        await skip(pg, cdp, '等到下午', sid)
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_kexin_tour_nccu&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=600,
                                picks=['妳推薦哪一家', '吃她推薦的'], go=('出發：去政大',), label=sid, shot_at='下次你來')
        await drive(pg, cdp, run, max_s=40, label=sid)
        lg = await log_since(pg, n0); T = texts(lg); res['log'] = T[:40]; memo = [x['t'] for x in lg if x['n'] == '［日誌］']
        run.check('%s：9/13 時間到「出發：去政大找可昕」、導遊那一場演完' % sid, ok and any(any(o.startswith('出發：去政大') for o in c['opts']) for c in ch), json.dumps(ch[:3], ensure_ascii=False)[:300])
        run.check('%s：「山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。」' % sid, '山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。' in T, json.dumps([t for t in T if '酸辣' in t], ensure_ascii=False))
        ks = [x['t'] for x in lg if x['n'] not in ('［選項］', '［字幕］', '［日誌］', '', '祐廷')]
        run.check('%s：她最後一句「下次你來，我們吃山上那家。」；沒有「……這是分工，不是命令。」（第 6 節第 7 題）' % sid, bool(ks) and ks[-1] == '下次你來，我們吃山上那家。' and not any('分工' in t for t in T), json.dumps(ks[-3:], ensure_ascii=False))
        run.check('%s：沒有「吃了一學期」「選宵夜」（第 7 項）' % sid, not any('吃了一學期' in t or '選宵夜' in t for t in T), '')
        res['memo'] = memo; errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_k2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-10-10', 19.85, 'dorm', flags=dict(DAY2_DONE), fresh=True, label=sid + '（10/10 週五 19:50 宿舍；可昕交往中＝新局預設）')
    try:
        await drive(pg, cdp, run, max_s=20, label=sid)
        dm = '這次換我去台大。我先去找品妤，再去霖澤館抓你。'
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:kexin'&&m.text===%s)" % json.dumps(dm), max_s=360, label=sid)
        await pg.wait_for_timeout(2500); q = await pg.evaluate(OUTQ + "(['kx_ntu'])"); res['plan'] = q
        run.check('%s：10/10 20:00 可昕「%s」、排 10/11 16:00 社科院門口' % (sid, dm), ok and any(x['d'] == '2025-10-11' and abs(x['h'] - 16) < 0.01 for x in q), json.dumps(q, ensure_ascii=False))
        ops, slept = await sleep_night(pg, cdp, run, sid)
        await skip(pg, cdp, '等到下午', sid)
        for nap in ('小睡 1 小時', '小睡 30 分鐘'):   # 等 16:00 的出發：床上小睡（跳過時間「等到傍晚」會跳過頭）
            if (await pg.evaluate("GAME.G.hour")) < 15.4: o2 = await bed(pg, cdp, run, nap, sid); await pg.wait_for_timeout(4000); await drive(pg, cdp, run, max_s=30, go=('出發：可昕來台大',), label=sid)
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_kexin_visits_ntu&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=600, go=('出發：可昕來台大',), label=sid, shot_at='霖澤館。以前')
        await drive(pg, cdp, run, max_s=40, label=sid)
        lg = await log_since(pg, n0); T = texts(lg); res['log'] = T[:30]
        run.check('%s：10/11 她來台大那一場演完（「霖澤館。以前每天從社科院看過來。……第一次走進來。」）' % sid, ok and '霖澤館。以前每天從社科院看過來。……第一次走進來。' in T, json.dumps(T[:8], ensure_ascii=False)[:400])
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
        notes = await pg.evaluate("((document.getElementById('notesList')||{}).innerText||'').replace(/\\n/g,'｜')"); await run.shot(pg, '%s_journal' % sid); res['notes'] = notes[:600]
        await pg.keyboard.press('Escape'); await L.close_panels(pg, cdp)
        run.check('%s：選單「筆記」的日誌寫「可昕來台大找你」、沒有「可昕第一次來台大」（第 6 節第 9 題）' % sid, '可昕來台大找你' in notes and '可昕第一次來台大' not in notes, notes[:300])
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ------------------------------------------------------------------ 捷運：迪化街（沛珊）、臺中（以安）
async def friends_row(pg, cdp, name):
    await phone_tab(pg, cdp, 'friends')
    r = await pg.evaluate("(nm=>{ const rows=[...document.querySelectorAll('#phoneBody .item')]; const r=rows.find(e=>(e.innerText||'').includes(nm)); if(!r) return null; return {text:r.innerText.replace(/\\n/g,'｜'), inv:!!r.querySelector('[data-inv]'), find:!!r.querySelector('[data-find]')}; })(%s)" % json.dumps(name))
    return r


async def mrt_trip(pg, cdp, run, dest_prefix, spot, label, walks_for=None):
    """公館捷運站 → 選 dest_prefix 的地方 → 到了以後：偶遇在第幾個時刻（ENC 的紀錄 m）就散步幾次，再「回去」→「回公館」。回傳這一趟的台詞、ENC 紀錄"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/捷運公館站/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
    if not it: return None, '公館沒有捷運站入口'
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=120); n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    ops = []
    for _ in range(20):
        s = await L.state(pg)
        if s['choices']: ops = await opts(pg); break
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    k = next((i for i, o in enumerate(ops) if o.startswith(dest_prefix)), None)
    if k is None: return None, '捷運選單沒有「%s」：%s' % (dest_prefix, [o[:14] for o in ops])
    await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2500)
    walked = 0; t0 = time.time(); enc = None
    while time.time() - t0 < 420:
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if not s['choices']:
            if (await pg.evaluate("!GAME.G.trip")) and time.time() - t0 > 20: break
            await pg.wait_for_timeout(800); continue
        ops = await opts(pg)
        e2 = await pg.evaluate("(sp=>{ try{ const R=ENC.rec(GAME.G), k=ENC.key(GAME.G,sp); return R.enc[k]||null; }catch(e){ return 'ERR '+e.message; } })(%s)" % json.dumps(spot))
        if not isinstance(enc, dict): enc = e2   # 到達那一刻遊戲擲的結果（之後換時段，key 會變）
        met = await pg.evaluate("!!(GAME.G.trip&&GAME.G.trip.enc)")
        if any(o.startswith('照樣出發') for o in ops): await tap_idx(pg, cdp, next(i for i, o in enumerate(ops) if o.startswith('照樣出發'))); await pg.wait_for_timeout(1500); continue
        if any(o.startswith('回公館') for o in ops): await tap_idx(pg, cdp, next(i for i, o in enumerate(ops) if o.startswith('回公館'))); await pg.wait_for_timeout(2500); continue
        need = isinstance(enc, dict) and enc.get('who') and not met and (enc.get('m') or 0) > walked
        wk = next((i for i, o in enumerate(ops) if o.startswith(('走', '散步')) and '回' not in o), None)
        if need and wk is not None: walked += 1; await tap_idx(pg, cdp, wk); await pg.wait_for_timeout(1500); continue
        if any(o == '回去' for o in ops): await tap_idx(pg, cdp, ops.index('回去')); await pg.wait_for_timeout(1500); continue
        await tap_idx(pg, cdp, pick_idx(ops)); await pg.wait_for_timeout(1200)
    return {'log': await log_since(pg, n0), 'enc': enc, 'walked': walked}, None


async def s_ps_alt(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    js = "(()=>{ const G=GAME.G, R=SOCIAL.rel('classmate_peishan'); R.fam=30; R.trust=20; R.comf=20; SOCIAL.remember('classmate_peishan','FIRST_MET',''); G.contacts=G.contacts||{}; G.contacts.classmate_peishan=STORY.dayOfKey('2025-09-10'); return {stage:SOCIAL.stage('classmate_peishan'), pres:STORY.presence('classmate_peishan',G)}; })()"
    for key, odd in (('2026-03-14', True), ('2026-03-21', False), ('2026-09-26', True), ('2026-10-03', False)):
        tag = '%s %s' % (sid, key); r0 = res.setdefault(key, {})
        b, pg, cdp, errs, r = await launch(p, run, base, key, 15.2, 'gongguan', fresh=False, js=js, weather='clear', money=30000, label=tag + '（沛珊有點熟＋聯絡方式；%s週六）' % ('單數' if odd else '雙數'))
        try:
            r0['setup'] = r
            row = await friends_row(pg, cdp, '郭沛珊'); await run.shot(pg, 'ps_%s_friends' % key); await L.phone_away(pg, cdp); r0['row'] = row
            if odd: run.check('%s：朋友頁「回台中」、沒有「約」' % tag, bool(row) and '回台中' in row['text'] and not row['inv'], json.dumps(row, ensure_ascii=False))
            else: run.check('%s：朋友頁沒有「回台中」（她在臺北）' % tag, bool(row) and '回台中' not in row['text'], json.dumps(row, ensure_ascii=False))
            cand = await pg.evaluate("(()=>{ const G=GAME.G, h0=G.hour; G.hour=16; let c=[]; try{ c=ENC.candidates(G,'D12').map(x=>x.row.who); }catch(e){ c=['ERR '+e.message]; } G.hour=h0; return c; })()")
            r0['cand16'] = cand
            run.check('%s：【讀資料，不是玩】16:00 迪化街偶遇名單%s沛珊' % (tag, '沒有' if odd else '有'), ('classmate_peishan' in cand) != odd, json.dumps(cand, ensure_ascii=False))
            tr, why = await mrt_trip(pg, cdp, run, '大稻埕', 'D12', tag)
            if not tr: run.check('%s：搭捷運到大稻埕' % tag, False, why)
            else:
                T = texts(tr['log']); met = any('她在一間舊書店門口翻繪本。' in t for t in T); r0['trip'] = {'enc': tr['enc'], 'walked': tr['walked'], 'lines': T[:20]}
                await run.shot(pg, 'ps_%s_after' % key)
                if odd: run.check('%s：單數週六迪化街沒有遇到沛珊' % tag, not met, json.dumps(tr['enc'], ensure_ascii=False))
                else:
                    who = tr['enc'].get('who') if isinstance(tr['enc'], dict) else None
                    if who == 'classmate_peishan': run.check('%s：雙數週六迪化街：遊戲擲到沛珊＝遇到她（「她在一間舊書店門口翻繪本。」）' % tag, met, json.dumps(tr, ensure_ascii=False)[:500])
                    else: run.note('%s：NOT TESTED——那天遊戲擲到的是 %s（四成沒有偶遇、或別人），不算 FAIL；名單 %s' % (tag, json.dumps(tr['enc'], ensure_ascii=False), cand))
            errs_check(run, tag, r0, errs)
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


async def s_an_d26(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    js = "(()=>{ const G=GAME.G, R=SOCIAL.rel('heroine_01'); if((R.fam||0)<25){ R.fam=25; } SOCIAL.remember('heroine_01','FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts.heroine_01==null) G.contacts.heroine_01=STORY.dayOfKey('2025-09-05'); return {stage:SOCIAL.stage('heroine_01'), pres:STORY.presence('heroine_01',G)}; })()"
    WHY = '她坐在審計新村一間小店門口的階梯上，手上拿著一張寫滿字的購物清單。'
    for key, home in (('2025-09-27', True), ('2025-10-25', True), ('2025-11-22', True), ('2025-10-04', False)):
        tag = '%s %s' % (sid, key); r0 = res.setdefault(key, {})
        b, pg, cdp, errs, r = await launch(p, run, base, key, 11.0, 'gongguan', fresh=False, js=js, weather='clear', money=30000, label=tag + '（以安有點熟＋聯絡方式；週六 11:00 公館）')
        try:
            r0['setup'] = r
            cand = await pg.evaluate("(()=>{ const G=GAME.G, h0=G.hour; G.hour=15; let c=[]; try{ c=ENC.candidates(G,'D26').map(x=>x.row.who); }catch(e){ c=['ERR '+e.message]; } G.hour=h0; return c; })()")
            chk = await pg.evaluate("(()=>{ try{ const s=TRIP.spot('D26'); return TRIP.check(GAME.G,s); }catch(e){ return 'ERR '+e.message; } })()")
            r0['cand15'] = cand; r0['trip_check'] = chk
            run.check('%s：【讀資料，不是玩】15:00 臺中偶遇名單%s以安' % (tag, '有' if home else '沒有'), ('heroine_01' in cand) == home, json.dumps(cand, ensure_ascii=False))
            tr, why = await mrt_trip(pg, cdp, run, '臺中草悟道', 'D26', tag)
            if not tr:
                run.check('%s：搭捷運＋高鐵到臺中（外縣市）' % tag, False, why)
            else:
                T = texts(tr['log']); met = WHY in T; r0['trip'] = {'enc': tr['enc'], 'walked': tr['walked'], 'lines': T[:20]}
                blocked = [t for t in T if '考試週' in t]; await run.shot(pg, 'd26_%s_after' % key)
                if key == '2025-10-25' and (blocked or not any('臺中' in t or '草悟道' in t for t in T)):
                    run.note('%s：期中考週（第 8 週）臺中一日遊被擋（noExamWeek）＝AA_372 第 6 節第 8 題要的 10/25 偶遇玩家到不了（給 AA／LAWWW）；%s' % (tag, json.dumps(T[:4], ensure_ascii=False)))
                    run.check('%s：第 8 週週六玩家到得了臺中、遇得到以安' % tag, False, '考試週不能去臺中（free_trips D26 noExamWeek）')
                elif home:
                    who = tr['enc'].get('who') if isinstance(tr['enc'], dict) else None
                    if who == 'heroine_01': run.check('%s：到臺中、遊戲擲到以安＝遇到她（「%s」）' % (tag, WHY[:14]), met, json.dumps(tr, ensure_ascii=False)[:500])
                    else: run.note('%s：NOT TESTED——那天遊戲擲到 %s（四成沒有偶遇），不算 FAIL；名單 %s' % (tag, json.dumps(tr['enc'], ensure_ascii=False), cand))
                else: run.check('%s：對照：她在臺北的週六，臺中沒有遇到她' % tag, not met, json.dumps(tr['enc'], ensure_ascii=False))
            errs_check(run, tag, r0, errs)
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


# ------------------------------------------------------------------ 柏翰升級句
async def s_bohan_up(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    js = """(()=>{ const G=GAME.G, id='classmate_bohan', R=SOCIAL.rel(id); R.fam=25; R.trust=5; R.comf=5; SOCIAL.remember(id,'FIRST_MET',''); G.events=G.events||{}; (G.events.done||(G.events.done={})).ev_bohan_kaogu=1;
      const U=SOCIAL.upLine?SOCIAL.upLine(id):null; return {stage:SOCIAL.stage(id), up:U?U.l:null, data:(REL_LINES[id]&&REL_LINES[id].up&&REL_LINES[id].up.FAMILIAR)?REL_LINES[id].up.FAMILIAR.l:null}; })()"""
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-10-14', 16.0, 'library_hall', fresh=False, js=js, label=sid + '（柏翰有點熟、還沒播升級句；考古題那件記成演過）')
    try:
        res['setup'] = r
        EXP = ['我現在每天記讀書時數。……昨天四小時二十分。', '我想調一下我的時間表。']
        row = await friends_row(pg, cdp, '許柏翰'); res['row'] = row
        if row and row['find']:
            await tap_sel_js(pg, cdp, "document.querySelector('#phoneBody [data-find=\"classmate_bohan\"]')"); await pg.wait_for_timeout(1500); await drive(pg, cdp, run, max_s=120, label=sid)
        await L.phone_away(pg, cdp)
        pos = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&x.charId==='classmate_bohan'&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0]:null; })()")
        res['pos'] = [pos, await pg.evaluate(STATE)]
        if pos:
            await L.go_to(pg, cdp, run, pos[0], pos[1], 1.1, '柏翰', max_s=120, lv=pos[2]); n0 = await log_len(pg)
            btn = (await L.state(pg)).get('interact') or ''
            if '說話' in btn:
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); await drive(pg, cdp, run, max_s=120, label=sid)
            T = [t.strip('「」') for t in texts(await log_since(pg, n0))]; res['said'] = T[:10]
            run.check('%s：找柏翰說話＝升到「有點熟」的兩句「%s」「%s」（第 6 節第 2 題）' % (sid, EXP[0], EXP[1]), in_order(T, EXP) is None, json.dumps([btn] + T[:6], ensure_ascii=False))
        else:
            data = [t.strip('「」') for t in (r or {}).get('data') or []]
            run.note('%s：這個時間找不到柏翰（%s）——改【讀資料，不是玩】' % (sid, json.dumps(res['pos'], ensure_ascii=False)))
            run.check('%s：【讀資料，不是玩】REL_LINES 柏翰升到「有點熟」＝「%s」「%s」' % (sid, EXP[0], EXP[1]), data == EXP, json.dumps(data, ensure_ascii=False))
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['AN_ATTEND', 'AN_ABSENT', 'KEVIN', 'NCCU', 'K2', 'PS_ALT', 'AN_D26', 'BOHAN_UP']
FN = {'AN_ATTEND': s_an_attend, 'AN_ABSENT': s_an_absent, 'KEVIN': s_kevin, 'NCCU': s_nccu, 'K2': s_k2, 'PS_ALT': s_ps_alt, 'AN_D26': s_an_d26, 'BOHAN_UP': s_bohan_up}


async def main():
    run = L.Run('aa372b', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa372b.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
