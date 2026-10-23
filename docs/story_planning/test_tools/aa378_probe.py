"""BB（帳號 A）2026-10-21：學姊（使用者 10-21 22:5x「學姊才是真正的女主角」；LAWWW 23:10 派，學姊排最前面）。
  MEET_*＝AA379-SIS-W1-LIB（AA_379 1-2、1-3；開發分支 3707596e）：閱覽室、大廳二樓自習區找她說話就直接演第一次見面。
    使用者存檔本來就還沒認識她（met_sis 空、ev_sis_w1 沒演）＝使用者卡住的那個狀態。
    她的作息表（characters.js）平日白天只在「閱覽室」（library），沒有大廳（library_hall）：大廳那一段找不到她就記「NOT TESTED＋作息沒有大廳」。
  NOTE23_*＝AA378 S3（8a9ed802）：收過 10/25 推甄前那張便條的，2/3 筆試前那張只寫「同上。」→回「同上。」→她「對。」；沒收過的照原本三行。
  PICKUP＝AA378 S4：12/20 21:00 家族群組答應接機（12/23 20:30）→ 期末飯不排在 12/23 晚上。
  T3／T2／T1＝AA378 S1、S2（AA_378 第 7 節）：臺灣路線 8/2～12/18，每天睡覺（約好的時間前用手機「跳過時間」，遇到約會會停）：
    「到了。」只在 8/3 一次；她每週那一套沒有一則重複；楓樹那則 9/25 以後；T1／T2 兩週一則（週一）；T3 視訊每週日 10:00、三組各一次、之後只有一行旁白；
    T3 回覆率夠：9/24 那通有大峽谷邀約（BB 選「這次不行。」，不跑大峽谷那一趟）；週一沒有她的視訊（強制執行法照常）。
    手機訊息只留最近 200 則：每過一天記一次她的訊息（不然 8/3 那則到 12 月已經被洗掉）。
【前置】讀使用者存檔改日期、地點、旗標（每個情境寫在 run.setup）；NOTE／PICKUP／T 用 quiet_events（條件事件不演、手機不自己跳出來；
手機訊息、出遊、視訊照常，視訊是 OUT.go → EVENTS.run）；讀檔後在頁面裡設她的關係、聯絡方式。之後照玩家：床邊睡覺、手機「跳過時間」、手機回她的訊息、
出遊按「接起來／出發」。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=MEET_LIB,... python3 aa378_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SIS = 'heroine_05'
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); }; })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
SISMSG = """(()=>(GAME.G.msgs||[]).filter(m=>m.th==='p:heroine_05').map(m=>({d:CALENDAR.dateOf(m.day).key, wd:CALENDAR.dateOf(m.day).wd%7, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, ans:m.ans})))()"""
OUTS = """(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^y4_sa_|^y4_sis_|^te_/.test(q.id||'')).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, wd:CALENDAR.dateOf(q.day).wd%7, h:q.h, state:q.state, set:q.sa?q.sa.set:null, title:q.title||''})))()"""
REL = """(([id,v])=>{ const G=GAME.G; const R=SOCIAL.rel(id); Object.assign(R,v); SOCIAL.remember(id,'FIRST_MET','');
  G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
  let st=null; try{ st=DATE.stageNum(id); }catch(e){} return {stageNum:st, stage:SOCIAL.stage(id), contact:!!INV.hasContact(G,id)}; })"""
TIER_REL = {'T1': {'fam': 45, 'trust': 30, 'comf': 20, 'npcRom': 0, 'rom': 0}, 'T2': {'fam': 60, 'trust': 45, 'comf': 40, 'npcRom': 10, 'rom': 0},
            'T3': {'fam': 60, 'trust': 45, 'comf': 40, 'npcRom': 55, 'rom': 30}}
ARRIVE = '到了。'; MAPLE = '九月底，葉子先紅了一棵。'; VNARR = '（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）'
KNOWN = '你認得她——家族群組大頭貼上那個學姊。）'; END = '（笑了一下）對，就是這樣。有問題再私訊我。'; PRE = '（她在看手機，沒有抬頭。）'


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def answer_asks(pg, cdp, pick, seen):
    """照玩家：手機 → 訊息 → 那個對話串 → 點選項。pick(ask)＝要點的選項開頭（None＝不回）。回傳回了幾則"""
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:String(m.text||''), opts:m.ask.opts.map(o=>o.t)})))()")
    n = 0
    for m in pend:
        if m['id'] in seen: continue
        want = pick(m)
        if want is None: continue
        seen.add(m['id'])
        if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
        c = await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(m['th']))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
        k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), 0)
        c = await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps('%s|%d' % (m['id'], k)))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); say('   手機回 %s：「%s」' % (m['id'], c[2])); n += 1
        else: say('   ! 手機找不到 %s 的按鈕（%s）' % (m['id'], m['opts']))
    if n or await phone_open(pg): await L.phone_away(pg, cdp)
    return n


def choose(ops, canyon):
    """選項：她的視訊、接機＝接起來／出發；大峽谷＝canyon；床＝睡到明天（第一個，鬧鐘照遊戲）；起床的課表選單＝先起床再說；別人的出遊＝不去了；其他＝第一個"""
    for i, o in enumerate(ops):
        if o.startswith(('接起來：和學姊', '出發：接機')): return i
    # 2026-10-22（開發分支 eece763b PICKUP）：12/23 20:00 阿凱當面「宵夜？」比接機的「出發」先問——照玩家記得要去接機，回「那天有約了。」（接受＝接機變 missed，已報 LAWWW）
    if ops == ['「好。」', '「那天有約了。」']: return 1
    if canyon:
        for i, o in enumerate(ops):
            if o.startswith(canyon): return i
    for pre in ('睡到明天', '先起床再說', '先起床'):
        for i, o in enumerate(ops):
            if o.startswith(pre): return i
    if any(o.startswith(('出發：', '接起來：')) for o in ops):
        for i, o in enumerate(ops):
            if o.startswith(('不去了', '今天先不要', '不接')): return i
    return 0


async def quick_go(pg, cdp, zone):
    """手機「地點」→ 那一區的「前往」（回宿舍用）"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(zone))
    if not c: await L.phone_away(pg, cdp); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2000); return True


async def phone_skip(pg, cdp):
    """手機「今天」的「跳過時間」最後一個（最晚）；遇到特殊課堂、約好的時間、劇情會停。沒有按鈕回傳 None"""
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; const e=bs[bs.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })()")
    if not c: await L.phone_away(pg, cdp); return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(2000); return c[2]


async def play_until(pg, cdp, run, until_key, until_h, pick, canyon=None, max_s=5400, label='', on_day=None):
    """照玩家一天一天過：白天用手機「跳過時間」（遇到課、約好的時間、劇情會停）；晚上（17:30 以後）今天還有約就繼續跳／等，沒有就去床上「睡到明天…」（鬧鐘照遊戲）；
    不在宿舍又不是在等約＝手機「地點」回宿舍。on_day(st)：每換一天呼叫一次"""
    uday = await pg.evaluate("STORY.dayOfKey('%s')" % until_key); t0 = time.time(); seen = set(); ch = []; last = None; still = time.time(); lastday = None; same = 0; lastops = None
    while time.time() - t0 < max_s:
        st = await pg.evaluate(STATE)
        if on_day and st['day'] != lastday: lastday = st['day']; await on_day(st)
        if st['day'] > uday or (st['day'] == uday and st['h'] >= until_h): return True, ch
        key = (st['day'], round(st['h'], 2))
        if key != last: last = key; still = time.time()
        elif time.time() - still > 300: run.note('%s：遊戲時間 5 分鐘沒有前進 %s' % (label, json.dumps(st, ensure_ascii=False))); await run.shot(pg, 'stuck_%s' % label); return False, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg); k = choose(ops, canyon); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k] if ops else None})
            same = same + 1 if ops == lastops else 0; lastops = ops
            if same > 15:
                diag = await pg.evaluate("(()=>{ const G=GAME.G; let lw=null; try{ lw=STORY.lawWakeAt(G); }catch(e){ lw='ERR '+e.message; } return {lw, paused:!!(GAME.E&&GAME.E.paused), dlg:!!(GAME.D&&GAME.D.active), adv:!!(typeof ADV!=='undefined'&&ADV.active), evRun:!!(typeof EVENTS!=='undefined'&&EVENTS.running), busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy), home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)), brk:!!(typeof HOME!=='undefined'&&HOME.breakMode&&HOME.breakMode(G)), out:(OUT.rec(G)||[]).filter(q=>q.state==='planned').map(q=>q.id+'@'+q.day+'/'+q.h)}; })()")
                run.note('%s：同一個選單連續 15 次 %s；狀態 %s；console %s' % (label, ops, json.dumps(diag, ensure_ascii=False), json.dumps(CONS[-6:], ensure_ascii=False))); await run.shot(pg, 'loop_%s' % label); return False, ch
            say('   %s %.2f 選項 %s → %s' % (st['key'], st['h'], [o[:14] for o in ops], ops[k][:18] if ops else ''))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1300); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['busy']: await pg.wait_for_timeout(800); continue
        if await answer_asks(pg, cdp, pick, seen): continue
        h = st['h']; night = h >= 17.5 or h < 5
        today = await pg.evaluate("(()=>{ const G=GAME.G; return (typeof OUT==='undefined'?[]:OUT.rec(G)).some(q=>q.state==='planned'&&q.day===G.day&&q.h>G.hour-0.5); })()")
        bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        if not night or today:
            if await phone_skip(pg, cdp): continue
            if not bed and not today and st['zone'] != 'dorm':
                if await quick_go(pg, cdp, 'dorm'): continue
            await pg.wait_for_timeout(3000); continue
        if not bed:
            if await quick_go(pg, cdp, 'dorm'): continue
            run.note('%s：晚上不在宿舍、也回不去（%s）' % (label, json.dumps(st, ensure_ascii=False))); await pg.wait_for_timeout(3000); continue
        if await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    return False, ch


CONS = []   # console 的 warning／error（選單一直重複時一起記下來）


async def launch_load(p, run, base, key, h, zone, flags=None, quiet=True, extra_js=None, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('console', lambda m: CONS.append(('%s %s' % (m.type, m.text))[:240]) if m.type in ('warning', 'error') and 'Canvas2D' not in m.text else None)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    F['KX_DEC3_MIGRATED'] = True; F.update(flags or {})
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    if extra_js: await pg.evaluate(extra_js)
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s%s；旗標 %s' % (label, key, h, zone, '（quiet_events）' if quiet else '', json.dumps(flags or {}, ensure_ascii=False)))
    return b, pg, cdp, errs


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def meet(p, run, base, sid, out):
    # 新局（AA_195：8/29 搬進宿舍、主線第一天 9/3）＝LAW_START_DAY −18、MAIN_D1 −13；使用者的存檔是舊局（主線第一天 9/17），9/3、9/5 在它的第一天以前、學姊不出現（不算錯）
    # MEET_PRE 改 9/2：9/3、9/4 是主線第 1、2 天（STORY.opening＝開場劇情，閱覽室不生成她；2026-10-22 02:5x 第一輪 9/3 找不到她）；9/2 是開場以前的一般日子（開局 B：8/31 起是一般的日子）
    NEW = {'LAW_START_DAY': -18, 'MAIN_D1': -13}
    key, h, zone, known, xf = {'MEET_LIB': ('2025-09-05', 10.0, 'library', False, NEW), 'MEET_HALL': ('2025-09-05', 10.0, 'library_hall', False, NEW),
                               'MEET_PRE': ('2025-09-02', 10.0, 'library', False, NEW), 'MEET_KNOWN': ('2025-09-24', 10.0, 'library', True, None),
                               'MEET_USER': ('2025-09-24', 10.0, 'library', False, None)}[sid]
    res = out.setdefault(sid, {})
    js = None if not known else "(()=>{ const G=GAME.G; G.flags.met_sis=G.day-1; G.flags.SIS_W1=G.day-1; G.events=G.events||{}; (G.events.done||(G.events.done={})).ev_sis_w1=G.day-1; SOCIAL.remember('heroine_05','FIRST_MET',''); })()"
    b, pg, cdp, errs = await launch_load(p, run, base, key, h, 'library_hall', flags=xf, quiet=False, extra_js=js,
                                         label=sid + ('（前置：已經認識＝met_sis、ev_sis_w1 記成演過）' if known else '（還沒認識：存檔原本的狀態）') + ('；新局的開學（LAW_START_DAY −18、MAIN_D1 −13）' if xf else '；使用者自己的舊局') + '；讀檔在總圖大廳' + ('，自己走樓梯間進 3F 閱覽室（直接讀檔進閱覽室她不會出現）' if zone == 'library' else ''))
    try:
        await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        if zone == 'library':
            it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
            if it:
                await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=180, lv=it[2]); await L.tap(pg, cdp, '#interact')
                for _ in range(40):
                    await pg.wait_for_timeout(1000)
                    if (await pg.evaluate("GAME.G.zone")) == 'library': break
                await pg.wait_for_timeout(4000)
            run.check('%s：從大廳二樓樓梯間走進 3F 閱覽室' % sid, (await pg.evaluate("GAME.G.zone")) == 'library', json.dumps(it, ensure_ascii=False))
        for _ in range(10):
            s = await L.state(pg)
            if s['dlg'] or s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not (q['dlg'] or q['choices']), max_steps=40)
            else: break
        await pg.wait_for_timeout(4000)
        npc = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0]:null; })()")
        res['npc'] = npc; say('   %s：學姊在 %s' % (sid, npc))
        if not npc:
            await run.shot(pg, '%s_noher' % sid)
            if sid == 'MEET_HALL': run.note('MEET_HALL：NOT TESTED——%s %.0f:00 大廳（library_hall）沒有她；她的作息表平日 9:00–17:00 只在閱覽室（library），沒有大廳那一格，所以大廳版開頭「長桌的一角」正常玩不會出現' % (key, h))
            else: run.check('%s：%s %.0f:00 學姊在 %s（作息）' % (sid, key, h, zone), False, '這個時間她不在 %s' % zone)
        else:
            await L.go_to(pg, cdp, run, npc[0], npc[1], 1.2, '學姊', max_s=150, lv=npc[2])
            res['button'] = (await L.state(pg))['interact']; await run.shot(pg, '%s_before' % sid)
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            for k in range(80):
                s = await L.state(pg)
                if s['choices']: await tap_idx(pg, cdp, 0); await pg.wait_for_timeout(1000); continue
                if s['dlg']:
                    if k == 1: await run.shot(pg, '%s_first' % sid)
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                if k > 3: break
                await pg.wait_for_timeout(800)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = [x['t'] for x in log]; res['lines'] = log
            fl = await pg.evaluate("(()=>{ const G=GAME.G, F=G.flags; return {met_sis:F.met_sis, SIS_W1:F.SIS_W1, w1:!!((G.events||{}).done||{}).ev_sis_w1, contact:!!INV.hasContact(G,'heroine_05'), known:!!STORY.knows('heroine_05',G)}; })()")
            res['flags'] = fl; say('   %s 台詞：%s' % (sid, json.dumps(T[:14], ensure_ascii=False))); say('   %s 記號：%s' % (sid, fl))
            spot = '靠窗的位子讀書' if zone == 'library' else '長桌的一角'
            if sid in ('MEET_LIB', 'MEET_HALL', 'MEET_USER'):
                op = [t for t in T if KNOWN in t]
                run.check('%s：找她說話＝直接演第一次見面（開頭「…%s…%s」、最後「%s」）' % (sid, spot, KNOWN[:10], END), bool(op) and spot in op[0] and END in T, json.dumps(T[:14], ensure_ascii=False)[:600])
                run.check('%s：演完就認識了（met_sis、ev_sis_w1、STORY.knows）' % sid, fl.get('met_sis') is not None and fl.get('w1') and fl.get('known'), json.dumps(fl, ensure_ascii=False))
                run.check('%s：沒有「%s」（9/4 以前那一句）' % (sid, PRE), PRE not in T, json.dumps(T[:4], ensure_ascii=False))
            elif sid == 'MEET_PRE':
                run.check('MEET_PRE：9/2（9/4 以前）照舊「%s」、不演第一次見面' % PRE, PRE in T and not any(KNOWN in t for t in T) and not fl.get('w1'), json.dumps(T[:6], ensure_ascii=False))
            else:
                run.check('MEET_KNOWN：已經認識的，閱覽室照一般閒聊（不再演第一次見面）', not any(KNOWN in t for t in T) and END not in T and len(T) > 0, json.dumps(T[:8], ensure_ascii=False))
                inv = any(x['n'] == '［選項］' and '約她去' in x['t'] for x in log)
                if not inv:   # 第一次可能是升階那一段（便條），照玩家再說一次話
                    n2 = await pg.evaluate("(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0]:null; })()")
                    if n2:
                        await L.go_to(pg, cdp, run, n2[0], n2[1], 1.2, '學姊', max_s=90, lv=n2[2]); m0 = len(await pg.evaluate("window.__LOG||[]"))
                        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                        for k in range(40):
                            s2 = await L.state(pg)
                            if s2['choices']:
                                ops = await opts(pg)
                                if any(o.startswith('約她去') for o in ops): inv = True; await tap_idx(pg, cdp, len(ops) - 1); await pg.wait_for_timeout(1000); break
                                await tap_idx(pg, cdp, 0); await pg.wait_for_timeout(1000); continue
                            if s2['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                            if k > 3: break
                            await pg.wait_for_timeout(800)
                        res['talk2'] = [x['t'] for x in (await pg.evaluate("window.__LOG||[]"))[m0:]]
                run.check('MEET_KNOWN：閱覽室說話以後有「約她去…」（第一次是升階那段的話，第二次說話）', inv, json.dumps(res.get('talk2') or T[:8], ensure_ascii=False)[:400])
            await run.shot(pg, '%s_after' % sid)
            if sid in ('MEET_LIB', 'MEET_HALL', 'MEET_USER'):
                await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
                txt = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜').slice(0,800)")
                res['friends'] = txt; await run.shot(pg, '%s_phone_friends' % sid)
                run.check('%s：手機「朋友」有她' % sid, '溫書瑀' in txt or '學姊' in txt, txt[:240])
                await L.phone_away(pg, cdp)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def note23(p, run, base, sid, out):
    """2/2 21:00 起：等她的便條出現（不睡覺，時間自己走），手機回第一個選項，看她回什麼"""
    res = out.setdefault(sid, {}); same = sid == 'NOTE23_SAME'
    js = ("(()=>{ PHONE.postAt(GAME.G,{th:'p:heroine_05',from:'heroine_05',text:'（便條：「你可以。」）',tag:'y4_push_note'},STORY.dayOfKey('2028-10-25'),21); })()" if same else None)
    b, pg, cdp, errs = await launch_load(p, run, base, '2029-02-02', 21.0, 'dorm', flags={'Y4_PATH': 'grad', 'Y4_PUSH': 'fail', 'dating_heroine_01': True}, extra_js=js,
                                         label=sid + ('（前置：10/25 那張已收到＝手機放一則 tag y4_push_note；和以安交往中＝便條是照片版）' if same else '（沒收過 10/25 那張；和以安交往中）'))
    try:
        res['rel'] = await pg.evaluate(REL + "(%s)" % json.dumps([SIS, {'fam': 45, 'trust': 30, 'comf': 20}]))
        res['sent_push'] = await pg.evaluate("PHONE.sent(GAME.G,'y4_push_note')"); say('   %s 關係 %s；收過 10/25：%s' % (sid, res['rel'], res['sent_push']))
        seen = set(); t0 = time.time(); got = False
        while time.time() - t0 < 600:
            if await phone_open(pg): await L.phone_away(pg, cdp)
            s = await L.state(pg)
            if s['choices']: ops = await opts(pg); say('   選項 %s' % ops); await tap_idx(pg, cdp, choose(ops, None)); await pg.wait_for_timeout(1200); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if await answer_asks(pg, cdp, lambda m: (m['opts'][0] if m['id'] == 'r3_sis_note_photo' else None), seen): got = True; break
            await pg.wait_for_timeout(2500)
        await pg.wait_for_timeout(1500)
        st = await pg.evaluate(STATE); res['at'] = st
        ms = [m for m in await pg.evaluate(SISMSG) if m['d'] >= '2029-02-01']; res['msgs'] = ms
        say('   %s 學姊對話串（2/1 以後）：%s' % (sid, json.dumps(ms, ensure_ascii=False)))
        want = '📷（一張手寫的便條：同上。）' if same else '📷（一張手寫的便條：你可以。）'   # BB-B 10-23：AA_398 第 38 列
        note = [m for m in ms if m['tag'] == 'r3_sis_note_photo']
        run.check('%s：2/2 21:00 的便條＝「%s」' % (sid, want), len(note) == 1 and note[0]['text'] == want and note[0]['d'] == '2029-02-02' and abs(note[0]['h'] - 21) < 0.05, json.dumps(note, ensure_ascii=False)[:300])
        run.check('%s：手機上的回覆按鈕＝「%s」「謝謝。」' % (sid, '同上。' if same else '只有一句。'), bool(note) and note[0]['ask'] == ['同上。' if same else '只有一句。', '謝謝。'], json.dumps(note[0]['ask'] if note else None, ensure_ascii=False))
        after = [m['text'] for m in ms if m['d'] >= '2029-02-02' and m['tag'] != 'r3_sis_note_photo']
        rep = '對。' if same else '一句就夠了。'   # BB-B 10-23：AA_398 第 38 列（「同上。」那一支照舊「對。」）
        run.check('%s：用手機回第一個 → 她回「%s」' % (sid, rep), got and ('同上。' if same else '只有一句。') in after and rep in after, json.dumps(after, ensure_ascii=False)[:300])
        await run.shot(pg, '%s_end' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def pickup(p, run, base, out):
    sid = 'PICKUP'; res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch_load(p, run, base, '2028-12-20', 20.9, 'dorm', extra_js="(()=>{ PHONE.join(GAME.G,'family_law','直屬家族'); })()",
                                         label='PICKUP（前置：在家族群組；和學姊是朋友、兩個人都單身、沒送過她＝家族群組版）')
    try:
        res['rel'] = await pg.evaluate(REL + "(%s)" % json.dumps([SIS, {'fam': 45, 'trust': 30, 'comf': 20}]))
        ok, ch = await play_until(pg, cdp, run, '2029-01-12', 12.0, lambda m: ('我去接' if m['id'] == 'y4_pickup' else ('有。' if m['id'] == 'y4_pickup_two' else None)), max_s=3000, label=sid)
        res['reached'] = ok; res['choices'] = ch[-60:]
        v = await pg.evaluate(OUTS); res['outings'] = v
        fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {SIS_PICKUP:F.SIS_PICKUP, SIS_PICKUP_V:F.SIS_PICKUP_V, SIS_PICKUP_GO:F.SIS_PICKUP_GO}; })()"); res['flags'] = fl
        say('   PICKUP 出遊：%s；%s' % (json.dumps(v, ensure_ascii=False), fl))
        run.check('PICKUP：玩到 2029-01-12', ok, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        pk = [q for q in v if q['id'] == 'y4_sis_pickup']
        run.check('PICKUP：12/20 用手機答應以後，排了 12/23 20:30 接機', bool(pk) and pk[0]['d'] == '2028-12-23' and abs(pk[0]['h'] - 20.5) < 0.01, json.dumps(pk, ensure_ascii=False))
        run.check('PICKUP：接機那天真的去了（出遊 done）', bool(pk) and pk[0]['state'] == 'done', json.dumps(pk, ensure_ascii=False))
        # BUG-KAI-PICKUP-1022（開發分支 1ad1a710）：12/23 晚上有接機＝阿凱不問「宵夜？」；接機有鬧鐘＝跳過時間停在出發前、跳「出發：接機」
        kai23 = [c for c in ch if c['at'].startswith('2028-12-23') and c['opts'] == ['「好。」', '「那天有約了。」']]
        go23 = [c for c in ch if c['at'].startswith('2028-12-23') and any(o.startswith('出發：接機') for o in c['opts'])]
        run.check('PICKUP：12/23 晚上阿凱不問「宵夜？」（那晚有接機）', not kai23, json.dumps(kai23, ensure_ascii=False))
        run.check('PICKUP：12/23 跳出「出發：接機」（%s）' % (go23[0]['at'] if go23 else '—'), bool(go23) and float(go23[0]['at'].split()[1]) < 20.5, json.dumps(go23, ensure_ascii=False)[:300])
        te = [q for q in v if q['id'].startswith('te_')]
        run.check('PICKUP：期末飯（te_）不在 12/23 晚上', not any(q['d'] == '2028-12-23' and q['h'] >= 17 for q in te), json.dumps(te, ensure_ascii=False)[:300])
        if not te: run.note('PICKUP：到 2029-01-12 都沒有排期末飯（te_），這一項只能說「沒有撞到」，沒看到期末飯排去哪一天')
        res['errs'] = errs[:3]; run.check('PICKUP：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('PICKUP：測試跑完', False, str(e)[:300])
    await close(b)


async def tier(p, run, base, sid, out):
    res = out.setdefault(sid, {}); allm = {}
    js = "(()=>{ const L=DATE.log(GAME.G,'heroine_05'); L.count=Math.max(L.count|0,2); })()" if sid == 'T3' else None
    b, pg, cdp, errs = await launch_load(p, run, base, '2028-08-02', 21.0, 'dorm', extra_js=js,
                                         label=sid + '（臺灣路線、單身；關係 %s%s）' % (json.dumps(TIER_REL[sid]), '；T3 前置：和她正式約會 2 次' if sid == 'T3' else ''))
    try:
        res['rel'] = await pg.evaluate(REL + "(%s)" % json.dumps([SIS, TIER_REL[sid]]))
        res['route'] = await pg.evaluate("(()=>{ try{ return STORY.route?STORY.route(GAME.G):null; }catch(e){ return 'ERR'; } })()")
        say('   %s 她的關係 %s、路線 %s' % (sid, res['rel'], res['route']))

        async def collect(st):
            for m in await pg.evaluate(SISMSG): allm.setdefault('%s|%s|%s|%s' % (m['d'], m['h'], m['from'], m['text']), m)
        pick = lambda m: ('這次不行' if m['id'] == 'y4_sa_canyon_ask' else (m['opts'][0] if m['th'] == 'p:heroine_05' else None))
        ok, ch = await play_until(pg, cdp, run, '2028-12-18', 23.0, pick, canyon='這次不行', max_s=6600, label=sid, on_day=collect)
        await collect(None); res['reached'] = ok; res['choices'] = [c for c in ch if not c['pick'] or not c['pick'].startswith(('睡到', '先起床'))][:80]
        ms = sorted([m for m in allm.values() if '2028-08-01' <= m['d'] <= '2028-12-19'], key=lambda m: (m['d'], m['h'])); res['msgs'] = ms
        v = [q for q in await pg.evaluate(OUTS) if q['id'].startswith('y4_sa_v_')]; res['videos'] = v
        R = await pg.evaluate("(()=>{ const F=GAME.G.flags, R=F.SIS_AB||{}; return {tier:R.tier, i1:R.i1, i2:R.i2, i3:R.i3, ix:R.ix, log:R.log, rate:typeof R2Y4B!=='undefined'&&R2Y4B.saRate?R2Y4B.saRate(GAME.G):null, canyonAsk:F.SIS_CANYON_ASK, canyon:F.SIS_CANYON, abroadTier:F.SIS_ABROAD_TIER}; })()"); res['R'] = R
        log = await pg.evaluate("window.__LOG||[]"); res['vnarr'] = [x for x in log if x['t'] == VNARR]
        say('   %s 到 %s；她的訊息 %d 則、視訊 %d 次；SIS_AB %s' % (sid, (await pg.evaluate(STATE))['key'], len(ms), len(v), json.dumps({k: R.get(k) for k in ('tier', 'i1', 'i2', 'i3', 'ix', 'rate', 'canyonAsk', 'canyon')}, ensure_ascii=False)))
        for m in ms: say('     %s(%d) %05.2f %-10s %-16s %s' % (m['d'], m['wd'], m['h'], m['from'][:10], m['tag'][:16], m['text'][:34]))
        for q in v: say('     視訊 %s(%d) %05.2f set=%s %s' % (q['d'], q['wd'], q['h'], q['set'], q['state']))
        run.check('%s：玩到 12/18' % sid, ok, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        hers = [m for m in ms if m['from'] == SIS]
        arr = [m for m in hers if m['text'] == ARRIVE]
        run.check('%s：「到了。」只有一次、8/3 07:00' % sid, len(arr) == 1 and arr[0]['d'] == '2028-08-03' and abs(arr[0]['h'] - 7) < 0.05, json.dumps(arr, ensure_ascii=False))
        texts = [m['text'] for m in hers if m['tag'].startswith('y4_sa')]
        dup = sorted({t for t in texts if texts.count(t) > 1})
        run.check('%s：她每週那一套的訊息沒有一則重複' % sid, not dup, json.dumps(dup, ensure_ascii=False)[:300])
        mp = [m for m in hers if MAPLE in m['text']]
        run.check('%s：楓樹那則（有出的話）在 9/25 以後' % sid, all(m['d'] >= '2028-09-25' for m in mp), json.dumps(mp, ensure_ascii=False))
        if sid in ('T1', 'T2'):
            okd = {'2028-08-07', '2028-08-21', '2028-09-04', '2028-09-18', '2028-10-02', '2028-10-16', '2028-10-30', '2028-11-13', '2028-11-27', '2028-12-11'}
            sched = sorted({m['d'] for m in hers if m['tag'].startswith(('y4_sa_t1_', 'y4_sa_t2_', 'y4_sa_x_'))})
            run.check('%s：訊息兩週一則、都在週一（8/7、8/21……12/11）' % sid, bool(sched) and set(sched) <= okd, json.dumps(sched))
            hh = sorted({(m['d'], m['h']) for m in hers if m['tag'].startswith(('y4_sa_t1_', 'y4_sa_t2_', 'y4_sa_x_'))})
            run.check('%s：週一 09:00、11/5 以後 10:00' % sid, all(abs(h - (10 if d >= '2028-11-05' else 9)) < 0.05 for d, h in hh), json.dumps(hh))
            run.check('%s：沒有視訊（T3 才有）' % sid, not v, json.dumps(v, ensure_ascii=False)[:200])
        if sid == 'T3':
            run.check('T3：每週視訊都在週日 10:00', bool(v) and all(q['wd'] == 0 and abs(q['h'] - 10) < 0.01 for q in v), json.dumps([(q['d'], q['wd'], q['h']) for q in v]))
            sets = [q['set'] for q in sorted(v, key=lambda q: q['d'])]
            run.check('T3：視訊三組各一次（set 0、1、2），第四次起 set 3', sets[:3] == [0, 1, 2] and all(s == 3 for s in sets[3:]), json.dumps(sets))
            done = [q for q in v if q['state'] == 'done']
            run.check('T3：第四次起的視訊演出「%s」' % VNARR[:16], len(res['vnarr']) >= max(0, len(done) - 3), '旁白 %d 次／接過的視訊 %d 次' % (len(res['vnarr']), len(done)))
            cy = [c for c in ch if any(o.startswith(('這次不行', '我去')) for o in c['opts'])]
            run.check('T3：9/24 那通視訊有大峽谷邀約（BB 選「這次不行。」）', (bool(cy) and cy[0]['at'].startswith('2028-09-24')) or R.get('canyonAsk') == 'no', json.dumps({'choices': cy[:2], 'ask': R.get('canyonAsk')}, ensure_ascii=False)[:300])
            run.check('T3：週一沒有她的視訊', not [q for q in v if q['wd'] == 1], json.dumps([q for q in v if q['wd'] == 1], ensure_ascii=False)[:200])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- PRE94＝BUG-SIS-PRE94-PRESENCE-1022（LAWWW 07:30 派；開發分支 367b8dfc 起；AA_379 1-4 企劃線 19a4414e，AA 選 ①）
# 學姊從新局 9/1 開學起照作息出現，不等主線第二天下午（afternoonDone）；9/4 以前找她只有 SIS_PRE_W1 那一句、不記關係；9/5 照 AA_379 閱覽室直接認識；以安、阿凱照舊
SISNPC = "(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), lv:n.lv|0, pose:n.pose||n.idlePose||null, seat:!!n.seat, id:n.id}:null; })()"
ANYNPC = "(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.some(i=>x.charId===i||x.id===i)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.id]:null; })"
KNOWQ = """(()=>{ const G=GAME.G, R=SOCIAL.rel('heroine_05')||{}; return {known:(GAME.knownIds?GAME.knownIds():[]).includes('heroine_05'), firstMet:!!SOCIAL.has('heroine_05','FIRST_MET'), met_sis:G.flags.met_sis==null?null:G.flags.met_sis,
  w1:!!((G.events||{}).done||{}).ev_sis_w1, rel:{fam:R.fam|0,trust:R.trust|0,comf:R.comf|0}, contact:!!(G.contacts&&G.contacts.heroine_05!=null), early:!!(STORY.sisEarly&&STORY.sisEarly(G)), afternoonDone:!!G.flags.afternoonDone}; })()"""
SCHEDQ = """(ids=>Object.fromEntries(ids.map(id=>{ let e=null, w=null; try{ e=STORY.schedEnt(CHARACTERS[id],GAME.G); }catch(x){ e='ERR '+x.message; } try{ w=STORY.whereIs(GAME,id); }catch(x){ w='ERR '+x.message; }
  return [id,{raw:e&&e.zone?e.zone+'/'+(e.act||''):e, where:w}]; })))"""
FRIENDS = "((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜').slice(0,900)"


async def to_3f(pg, cdp, run):
    """總圖大廳 → 二樓樓梯間 → 3F 閱覽區（直接讀檔進閱覽室人物不生成，BUG-SIS-LIB-LOAD-1022）"""
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
    if it:
        await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=180, lv=it[2]); await L.tap(pg, cdp, '#interact')
        for _ in range(40):
            await pg.wait_for_timeout(1000)
            if (await pg.evaluate("GAME.G.zone")) == 'library': break
        await pg.wait_for_timeout(4000)
    for _ in range(10):
        s = await L.state(pg)
        if s['dlg'] or s['choices']: await L.advance_dialogs(pg, cdp, run, lambda q: not (q['dlg'] or q['choices']), max_steps=40)
        else: break
    return (await pg.evaluate("GAME.G.zone")) == 'library', it


async def talk_sis(pg, cdp, run, npc, tag):
    """走到學姊旁邊按說話，對話點完（選項點第一個）；回傳（按鈕的字, 台詞紀錄, 出現過的選項）"""
    await L.go_to(pg, cdp, run, npc['x'], npc['z'], 1.2, '學姊', max_s=150, lv=npc['lv'])
    btn = (await L.state(pg))['interact']; await run.shot(pg, '%s_before' % tag)
    n0 = len(await pg.evaluate("window.__LOG||[]")); chs = []; shot = False
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    for k in range(80):
        s = await L.state(pg)
        if s['choices']: ops = await opts(pg); chs.append(ops); await tap_idx(pg, cdp, 0); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            if not shot: await run.shot(pg, '%s_talk' % tag); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if k > 3: break
        await pg.wait_for_timeout(800)
    return btn, (await pg.evaluate("window.__LOG||[]"))[n0:], chs


async def pre94(p, run, base, sid, out):
    res = out.setdefault(sid, {}); NEW = {'LAW_START_DAY': -18, 'MAIN_D1': -13}
    b, pg, cdp, errs = await launch_load(p, run, base, '2025-09-02', 9.9, 'library_hall', flags=NEW, quiet=False,
                                         label=sid + '（還沒認識學姊：存檔原本的狀態；新局的開學（LAW_START_DAY −18、MAIN_D1 −13）；9/2（二）09:54 讀檔在總圖大廳，自己走樓梯間進 3F 閱覽室）')
    try:
        await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        k0 = await pg.evaluate(KNOWQ); res['k0'] = k0; say('   %s 前置：%s' % (sid, json.dumps(k0, ensure_ascii=False)))
        run.check('%s：前置——還沒認識學姊、主線第二天下午還沒演（沒有 afternoonDone）、新局 9/1 開學以後（sisEarly）' % sid, not k0['known'] and not k0['firstMet'] and not k0['afternoonDone'] and k0['early'], json.dumps(k0, ensure_ascii=False))
        ok, it = await to_3f(pg, cdp, run); await pg.wait_for_timeout(2500)
        run.check('%s：從總圖大廳二樓樓梯間走進 3F 閱覽室' % sid, ok, json.dumps(it, ensure_ascii=False))
        st = await pg.evaluate(STATE); npc = await pg.evaluate(SISNPC); an = await pg.evaluate(ANYNPC + "(['heroine_01','an'])")
        sch = await pg.evaluate(SCHEDQ + "(['heroine_05','heroine_01','kai'])"); res.update({'st': st, 'npc': npc, 'an': an, 'sched': sch})
        say('   %s %s %.2f 閱覽室：學姊 %s、以安 %s；作息 %s' % (sid, st['key'], st['h'], npc, an, json.dumps(sch, ensure_ascii=False)))
        await run.shot(pg, '%s_0902_3F' % sid)
        run.check('%s 1：9/2（二）%.2f 3F 閱覽室有學姊（%s；作息 %s）' % (sid, st['h'], json.dumps(npc, ensure_ascii=False), (sch.get('heroine_05') or {}).get('raw')), bool(npc), json.dumps({'npc': npc, 'sched': sch.get('heroine_05')}, ensure_ascii=False))
        araw = (sch.get('heroine_01') or {}).get('raw')
        run.check('%s 4（對照）：以安這時候的作息也是閱覽室（%s），她照舊沒有出現（等主線第二天下午）' % (sid, araw), an is None, json.dumps({'an': an, 'sched': sch.get('heroine_01')}, ensure_ascii=False))
        if npc:
            btn, log, chs = await talk_sis(pg, cdp, run, npc, '%s_0902' % sid)
            T = [x['t'] for x in log if x['n'] not in ('［選項］', '［字幕］', '［日期卡］')]; k1 = await pg.evaluate(KNOWQ); res.update({'btn': btn, 'talk': T, 'choices': chs, 'k1': k1})
            say('   %s 說話（按鈕「%s」）：%s；選項 %s；之後 %s' % (sid, btn, json.dumps(T, ensure_ascii=False), chs, json.dumps(k1, ensure_ascii=False)))
            run.check('%s 2：找她說話只有「%s」（按鈕「%s」），沒有選項、沒有演第一次見面' % (sid, PRE, btn), T == [PRE] and not chs and not any(KNOWN in t for t in T), json.dumps({'T': T, 'choices': chs}, ensure_ascii=False))
            run.check('%s 2：不記關係（沒有 FIRST_MET、met_sis、ev_sis_w1；熟悉度不變 %s → %s）' % (sid, k0['rel'], k1['rel']), not k1['firstMet'] and k1['met_sis'] is None and not k1['w1'] and k1['rel'] == k0['rel'], json.dumps(k1, ensure_ascii=False))
            await L.close_panels(pg, cdp); await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
            await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
            fr = await pg.evaluate(FRIENDS); res['friends'] = fr; await run.shot(pg, '%s_0902_friends' % sid); await L.phone_away(pg, cdp)
            run.check('%s 2：人物頁（手機「朋友」）沒有她' % sid, not k1['known'] and '溫書瑀' not in fr, fr[:300])
        kraw = (sch.get('kai') or {}).get('raw'); kz = kraw.split('/')[0] if isinstance(kraw, str) and '/' in kraw and not kraw.startswith('ERR') else None
        if kz and kz not in ('library', 'dorm'):
            went = await quick_go(pg, cdp, kz); await pg.wait_for_timeout(3000); kn = await pg.evaluate(ANYNPC + "(['kai'])"); st2 = await pg.evaluate(STATE); res['kai'] = {'went': went, 'npc': kn, 'st': st2}
            await run.shot(pg, '%s_0902_kai' % sid)
            run.check('%s 4（對照）：阿凱這時候的作息是 %s，手機「地點」過去他不在（照舊等主線第二天下午）' % (sid, kraw), went and st2['zone'] == kz and kn is None, json.dumps(res['kai'], ensure_ascii=False))
        else: run.note('%s 4（對照）：阿凱這時候的作息 %s（手機「朋友」寫 %s）——不是一般地點，只記錄' % (sid, kraw, json.dumps((sch.get('kai') or {}).get('where'), ensure_ascii=False)))
        snap = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G))")
        d5 = await pg.evaluate("STORY.dayOfKey('2025-09-05')"); snap.update({'day': d5, 'hour': 10.0, 'zone': 'library_hall', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d5)})
        await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        run.setup('[前置] %s 3：同一份遊戲狀態（9/2 找她說過話）跳到 2025-09-05（五）10:00 總圖大廳（跳過 9/3、9/4 主線兩天），自己走樓梯間進 3F' % sid)
        ok3, _ = await to_3f(pg, cdp, run); await pg.wait_for_timeout(2500); npc3 = await pg.evaluate(SISNPC); res['npc5'] = npc3
        run.check('%s 3：9/5（五）10:00 3F 閱覽室有學姊' % sid, ok3 and bool(npc3), json.dumps(npc3, ensure_ascii=False))
        if npc3:
            btn3, log3, chs3 = await talk_sis(pg, cdp, run, npc3, '%s_0905' % sid)
            T3 = [x['t'] for x in log3 if x['n'] not in ('［選項］', '［字幕］', '［日期卡］')]; k3 = await pg.evaluate(KNOWQ); res.update({'talk5': T3, 'k5': k3})
            say('   %s 9/5 說話：%s；之後 %s' % (sid, json.dumps(T3[:14], ensure_ascii=False), json.dumps(k3, ensure_ascii=False)))
            op = [t for t in T3 if KNOWN in t]
            run.check('%s 3：9/5 找她說話＝閱覽室直接認識（開頭「…靠窗的位子讀書…%s」、最後「%s」）' % (sid, KNOWN[:10], END), bool(op) and '靠窗的位子讀書' in op[0] and END in T3 and PRE not in T3, json.dumps(T3[:14], ensure_ascii=False)[:600])
            run.check('%s 3：演完就認識了（FIRST_MET、met_sis、ev_sis_w1、人物頁有她）' % sid, k3['firstMet'] and k3['met_sis'] is not None and k3['w1'] and k3['known'], json.dumps(k3, ensure_ascii=False))
            await run.shot(pg, '%s_0905_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def main():
    run = L.Run('aa378', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    scen = os.environ.get('SCEN', 'MEET_LIB,MEET_HALL,MEET_PRE,MEET_KNOWN,NOTE23_SAME,NOTE23_NEW,PICKUP,T3,T2,T1').split(',')
    async with async_playwright() as p:
        for sid in scen:
            say('== %s' % sid)
            if sid == 'PRE94': await pre94(p, run, base, sid, out)
            elif sid.startswith('MEET_'): await meet(p, run, base, sid, out)
            elif sid.startswith('NOTE23_'): await note23(p, run, base, sid, out)
            elif sid == 'PICKUP': await pickup(p, run, base, out)
            else: await tier(p, run, base, sid, out)
            json.dump(out, open(os.path.join(OUT, 'aa378.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
