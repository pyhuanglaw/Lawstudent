"""BB（帳號 A）2026-10-22：AA375-Y2S2-FIX-1021 法律系大二下（AA_375 第 6 節的 BB 測試＋第 4 節提醒＋AA_373 第 6 節第 9 題；開發分支 ea00c8bd 起，LAWWW 01:5x 合併）。
AA_375 第 6 節：①6/4 以後進 Café 吧檯不是芷若、約她回「今天是客人」 ②大二下期末邀約芷若不說「九點下班」 ③5/12～6/3 進 Café 聽到錄取、6/4 以後不會第一次聽到
④子晴「我爸下週要來」在 5/16 收到 ⑤4/4 春假出遊車上最多三個人。
  CAFE_0607   6/7（一）14:20 手機「地點」到 Café：芷若在店裡當客人（不是吧檯的人）；到吧檯點餐＝學妹小婷說話（「芷若交代過，你的我會做。」），不是芷若；
              和芷若說話不是「兩點半的店員」、招呼不是上班那幾句（BB 測試①、第 1 項）
  INV_GUEST   6/7 13:00 手機約芷若「去兩點半 Café 坐坐」今天 15:30：「我在 Café，今天是客人。你要來嗎？」（BB 測試①）
  INV_SHIFT   對照 5/31（一）10:00 約今天 12:10（她在班）：「我就在 Café 啊。你來，我做給你。」
  ADMIT       5/14（五）12:50 不開 quiet_events，手機「地點」進 Café（她在班）＝錄取那一場（一般版）：「下學期我要去英國交換。…」→「九月走？」→「嗯。九月初。……還有三個多月。」；沒有「四個月」（BB 測試③、第 2 項）
  ADMIT_DATE  和芷若交往中：「錄取了。……那天你沒打來。」…「九月我就走了。五個多月。」→「五個多月很快。」→「五個多月欸。……好啦，你這樣講我比較安心。」（BB 測試③）
  ADMIT_AFTER 6/7 15:00 進 Café（她當客人）：不會第一次聽到錄取（BB 測試③）
  TERM_GF     和芷若交往中：6/12（最後一科 6/11 考完的隔天）20:15「禮拜五晚上，我們去吃宵夜。……我現在不用上班了。」，不說「九點」（BB 測試②、第 1、6 項）【前置：讀檔跳過 6/11 的考試】
  TERM_GF_EARLY 6/10 晚上不會先傳（原本 6/10 20:30 起；第 6 項）
  ZR_TEN      AA_373 第 6 節第 9 題：交往中大二上期末 12/24 20:15「禮拜五十點，等我下班。」（不是九點）
  ZQ_DAD      5/16（日）21:00「這週的訊息」子晴「欸跟你說」「我爸下週要來台北」…；5/9 那一組沒有（BB 測試④、第 3 項）
  SPRING_CAR  4/1（四）20:00 在麵店團群組、認識六個人（語彤、柏翰比較熟）：春假選單「跟麵店團出去」→ 睡到 4/4 → 時間到「出發」→ 車上三個人（語彤、柏翰、阿哲）、
              「（車子坐不下。剩下的人搭火車，下午在那邊會合。）」、市場只有車上的人說話、海邊會合以後小語、芯慈照樣有句子、回程「後座三個人都睡著了」（BB 測試⑤、第 5 項）
  NOODLE_THU  2/25（四）17:50 不開 quiet_events 進麵店＝「（大二下第一次的週四麵店。阿姨說，過年胖了的人自己知道。）」（第 4 節 AA_342）
  NOODLE_SPRING 4/8（四）進麵店＝「（春假回來的第一個週四。長桌的人，每個人都在講自己這幾天去了哪裡。）」
  SUM_0306    3/6（六）08:00 以後第一次空下來＝「（大二下的第二週。你終於記住了這學期的課表：週二要跑萬才館。）」
  SUM_0520    5/20（四）＝「（五月。宿舍走廊開始有人在討論暑假要去哪裡。）」
  MSG_BH      3/12（五）21:00 柏翰「債各第一章的筆記，我做了表格。」「要的話傳給你。」→「要。」→「（照片：一張表格，欄位比內容多）」
  MSG_GRP     4/21（三）22:00 麵店團群組：小語「期中考完了」「我要吃三碗麵」、阿哲「我請一碗」
  MSG_KAI     5/21（五）22:00 阿凱「暑假你回家還是留宿舍」（還沒想。／回家吧。）→「還沒想。」→「我也是。」
  ZQ_0604     6/4（五）22:00 子晴四則（沒看過 Q6）→「沒事就好。」→「嗯」「……其實有一點事 改天講」（第 4 節 AA_255）
  EXPO_Y2     3/18（四）12:00 走進博雅教學館、101 坐下「聽演講：交換學生甄選說明會」→ 散場柏翰「交換要成績多少？」以安「簡章第三頁有寫，我等一下傳給你。」柏翰「好。」；沒有「我查過了。你夠。」（第 4 節 AA_255）
  DATA        【讀資料，不是玩】心意邀約、朋友的期末飯（大二下）芷若的句子不說九點；大一上～大二上心意邀約「十點」、22:00（AA_373 6-9）
【前置】讀使用者存檔（舊局 9/25）改日期、時間、地點（每個情境寫在 run.setup）；設那幾個人的關係（認識、熟悉度、聯絡方式）、麵店團群組、交往中；
quiet_events 只在不需要自動事件的情境開。之後照玩家：手機回訊息、床上睡覺、手機「跳過時間」「地點」、走過去、按吧檯、坐下、選項、時間到「出發」。
Playwright 手機橫向模擬、?turbo，不是 iPhone。小語改名 Alison（AA_380）還沒實作：照現在的名字，對話串用 id。
用法：LW_TESTS=<開發分支>/tests SCEN=CAFE_0607,... python3 aa375_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), id:(w&&w.charId)||'', t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?{id:m.ask.id,opts:m.ask.opts.map(o=>o.t)}:null})))"""
NPCS = """(()=>(GAME.E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false&&!n.hidden).map(n=>({id:n.charId||n.id, x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), lv:n.lv|0, seat:!!n.seat})))()"""
SETUP = """(([rels,dating,extra,groups,done,met])=>{ const G=GAME.G, F=G.flags; const LV={ACQ:[8,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
  G.contacts=G.contacts||{}; F.MET_ZHE=true;
  for(const [id,lv] of rels){ const R=SOCIAL.rel(id), v=LV[lv]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; R.rom=0; R.npcRom=0; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=G.day-60; }
  if(met&&met.includes('heroine_05')){ F.met_sis=true; F.SIS_W1=true; }
  for(const [g,n] of (groups||[])) PHONE.join(G,g,n);
  G.events=G.events||{}; G.events.done=G.events.done||{}; for(const id of (done||[])) G.events.done[id]=1;
  Object.assign(F,extra||{}); for(const k of Object.keys(extra||{})) if(extra[k]===null) delete F[k];
  for(const id of (dating||[])){ let ok=false; try{ ok=!!(ROM.start&&ROM.start(G,id)); }catch(e){} F['dating_'+id]=true; try{ const r=ROM.get&&ROM.get(G,id); if(r) r.status='dating'; }catch(e){}
    const R=SOCIAL.rel(id); R.fam=Math.max(R.fam,70); R.trust=Math.max(R.trust,60); R.comf=Math.max(R.comf,60); R.rom=70; R.npcRom=70; }
  const out={}; for(const [id] of rels) out[id]=SOCIAL.stage(id); return {stage:out, dating:(dating||[]).map(id=>[id,F['dating_'+id]===true]), groups:(groups||[]).map(([g])=>[g,!!PHONE.inGroup(G,g)]), ROOM_Y2:F.ROOM_Y2!=null}; })"""


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None):
    """picks（要選的字，依序找）→ 起床「先起床再說」、跳過時間「照樣跳過」、說話完「就這樣」→ 出遊／視訊「不去了／先不接」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for pre in ('先起床再說', '先起床', '照樣跳過', '就這樣'):
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


async def drive(pg, cdp, run, picks=None, max_s=240, label=''):
    """一直點到沒有對話、沒有選項（連續 3 次）；回傳選單紀錄"""
    t0 = time.time(); idle = 0; ch = []
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            k = pick_idx(ops, picks); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, label=''):
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立"""
    t0 = time.time(); ch = []
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def answer(pg, cdp, run, th, ask_pred, want, label=''):
    """照玩家：手機 → 訊息 → 那個對話串 → 點回覆。ask_pred＝JS 判斷 ask.id 的式子（m 是訊息）。回傳 (按到的字, 選項)"""
    m = await pg.evaluate("(()=>{ const m=PHONE.pending(GAME.G).find(m=>m.ask&&(%s)); return m?{id:m.ask.id,opts:m.ask.opts.map(o=>o.t)}:null; })()" % ask_pred)
    if not m: return None, None
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    await pg.wait_for_timeout(600); await run.shot(pg, '%s_dm' % label)
    k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), 0)
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (m['id'], k)))
    await pg.wait_for_timeout(1800); say('   %s 手機回 %s：「%s」' % (label, m['id'], got)); await run.shot(pg, '%s_dm_answered' % label)
    await L.phone_away(pg, cdp); return got, m


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


async def sleep_night(pg, cdp, run, label='', picks=None):
    """上床「睡到明天」到隔天早上；起床選單、早上的事照 picks／pick_idx 點（picks 要放這一場要接的「出發：…」，不然出遊會被按「不去了」）"""
    st0 = await pg.evaluate(STATE); ops = await bed(pg, cdp, run, '睡到明天', label)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, picks=picks, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, picks=picks, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, ok


async def quick_go(pg, cdp, place):
    """手機「地點」→ 前往。place＝區域 id（dorm）或 data-place 的完整開頭（'campus|博雅教學館'）"""
    zone = place.split('|')[0]; key = place if '|' in place else place + '|'
    await phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(key))
    if not got: await L.phone_away(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone and not (await L.state(pg)).get('busy'): break
    await pg.wait_for_timeout(2500); return (await pg.evaluate("GAME.G.zone")) == zone


async def friends_text(pg, cdp, run, label):
    await phone_tab(pg, cdp, 'friends'); await pg.wait_for_timeout(500)
    t = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')"); await run.shot(pg, '%s_friends' % label)
    await L.phone_away(pg, cdp); return t


def row_of(text, name):
    """手機「朋友」：名字那一行的下一行（大概在哪）"""
    lines = [x.strip() for x in text.split('\n') if x.strip()]
    for i, x in enumerate(lines):
        if x == name and i + 1 < len(lines): return lines[i + 1]
    return None


def texts(log, name='祐廷'):
    return [x['t'].replace('{name}', name) for x in log if x['n'] not in ('［選項］', '［字幕］')]


def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None


async def launch(p, run, base, key, h, zone, rels=(), dating=(), flags=None, groups=(), done=(), met=(), quiet=True, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([list(map(list, rels)), list(dating), flags or {}, list(map(list, groups)), list(done), list(met)]))
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s%s；關係 %s；交往中 %s；群組 %s；演過 %s；旗標 %s → %s' % (
        label, key, h, zone, '（quiet_events）' if quiet else '（不開 quiet_events：自動事件照跑）', json.dumps(rels, ensure_ascii=False), list(dating), [g for g, _ in groups], list(done),
        json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def find_npc(pg, ids):
    return await pg.evaluate("(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.includes(x.charId||x.id)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0]:null; })(%s)" % json.dumps(ids))


async def enter_door(pg, cdp, run, to, label):
    """校園上走到通往 to 的門（exit.to 或 door enter），按下去進館"""
    it = await pg.evaluate("(to=>{ const i=(GAME.E.interactables||[]).find(q=>q&&!q.hidden&&((q.exit&&q.exit.to===to)||(q.door&&typeof CLS!=='undefined'&&CLS.DOORS&&CLS.DOORS[q.door]&&CLS.DOORS[q.door].enter===to))); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })(%s)" % json.dumps(to))
    if not it: return False, None
    await L.go_to(pg, cdp, run, it[0], it[1], 1.0, it[3] or to, max_s=240, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    for _ in range(6):
        ops = await opts(pg)
        if ops:
            k = next((i for i, o in enumerate(ops) if o.startswith(('進館裡逛逛', '進去'))), None)
            if k is not None: await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
            break
        await pg.wait_for_timeout(600)
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == to: break
    await pg.wait_for_timeout(3000); return (await pg.evaluate("GAME.G.zone")) == to, it


# ---------------------------------------------------------------- 情境
ZR = 'heroine_02'; TH_ZR = 'p:heroine_02'


async def skip(pg, cdp, prefixes, label=''):
    """手機「今天」→ 跳過時間：依序找文字開頭是 prefixes 之一的那顆；跳出「照樣跳過」就按"""
    await phone_tab(pg, cdp, 'today'); got = None
    for pre in prefixes:
        got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(pre))
        if got: break
    if not got:
        btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim())"); say('   %s 跳過時間沒有 %s：%s' % (label, prefixes, btns)); await L.phone_away(pg, cdp); return None
    await pg.wait_for_timeout(1500)
    for _ in range(6):
        ops = await opts(pg)
        if ops and any(o.startswith('照樣跳過') for o in ops): await tap_idx(pg, cdp, next(i for i, o in enumerate(ops) if o.startswith('照樣跳過'))); await pg.wait_for_timeout(1500); break
        if not ops: await pg.wait_for_timeout(700)
        else: break
    await pg.wait_for_timeout(2500); say('   %s 跳過時間「%s」→ %s' % (label, got, await pg.evaluate(STATE))); return got


async def next_day(pg, cdp, run, label='', picks=None):
    """過到隔天早上：白天先「等到晚上」，晚上上床「睡到明天」"""
    st = await pg.evaluate(STATE)
    if 5 <= st['h'] < 17.5: await skip(pg, cdp, ['等到晚上', '等到傍晚'], label); await drive(pg, cdp, run, picks=picks, max_s=40, label=label)
    return await sleep_night(pg, cdp, run, label, picks)


async def ask_and_answer(pg, cdp, run, sid, th, ask_id, lines, opts_exp, want, replies, res):
    """等她的私訊（最後一則帶回覆），核對每一句、回覆的選項；照玩家回 want，看她回什麼"""
    ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id===%s)" % json.dumps(ask_id), max_s=420, label=sid)
    M = await msgs(pg, th); res['dm'] = M[-6:]; st = await pg.evaluate(STATE)
    got = [m['text'] for m in M if m['d'] == st['key']]; last = next((m for m in reversed(M) if m['ask'] and m['ask']['id'] == ask_id), None)
    run.check('%s：%s 傳來「%s」（回覆：%s）' % (sid, st['key'], '」「'.join(lines), '／'.join(opts_exp)), ok and in_order(got, lines) is None and bool(last) and last['ask']['opts'] == opts_exp, json.dumps({'got': got, 'last': last}, ensure_ascii=False)[:500])
    g, _ = await answer(pg, cdp, run, th, "m.ask.id===%s" % json.dumps(ask_id), want, sid)
    ok2, _ = await wait_for(pg, cdp, run, "(()=>{ const L=(GAME.G.msgs||[]).filter(m=>m.th===%s).map(m=>m.text); return %s.every(t=>L.includes(t)); })()" % (json.dumps(th), json.dumps(replies)), max_s=120, label=sid)
    M2 = await msgs(pg, th); res['after'] = M2[-4:]
    run.check('%s：回「%s」→「%s」' % (sid, want, '」「'.join(replies)), bool(g) and ok2, json.dumps({'tap': g, 'msgs': M2[-4:]}, ensure_ascii=False)[:400])


async def s_cafe(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-06-07', 14.33, 'dorm', rels=((ZR, 'FAM'),), flags={'CAFE_VISITS': 5}, label=sid + '（前置：Café 點過 5 次＝CAFE_VISITS，店員會說常客那一句）')
    try:
        await pg.evaluate("(()=>{ const R=GAME.G.eat; if(R&&R.l5) delete R.l5['兩點半 Café']; })()")
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok = await quick_go(pg, cdp, 'cafe'); st = await pg.evaluate(STATE); res['arrive'] = st
        run.check('CAFE_0607：手機「地點」到兩點半 Café（%s %.2f）' % (st['key'], st['h']), ok, json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(4000)
        zr = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.heroine_02; return n?{staff:n.staff||null, seat:!!n.seat, pose:n.pose||null, idle:n.idlePose||null}:null; })()"); res['zr'] = zr
        onShift = await pg.evaluate("typeof EAT!=='undefined'&&EAT.zrOnShift?EAT.zrOnShift(GAME):null"); res['zrOnShift'] = onShift
        await run.shot(pg, 'CAFE_0607_inside')
        run.check('CAFE_0607：芷若在店裡、不是吧檯的人（staff 不是 cafe；6/3 是她最後一個班）', bool(zr) and zr['staff'] != 'cafe' and not onShift, json.dumps({'zr': zr, 'onShift': onShift}, ensure_ascii=False))
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        btn = ''
        for tol in (1.0, 0.6, 0.35):   # 吧檯點餐的互動點（-2.5,-3.2）；按鈕不是「到吧檯點餐」（例如旁邊的座位）就再靠近一點
            await L.go_to(pg, cdp, run, -2.5, -3.2, tol, '吧檯', max_s=120); await pg.wait_for_timeout(600); btn = (await L.state(pg)).get('interact') or ''
            if '點餐' in btn: break
        res['counter_btn'] = btn
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        await drive(pg, cdp, run, max_s=60, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['counter_log'] = log
        spk = [(x['n'], x['t']) for x in log if x['n'] not in ('［選項］', '［字幕］', '')]
        zname = await pg.evaluate("SOCIAL.displayName('heroine_02')")
        run.check('CAFE_0607：到吧檯點餐（按鈕「%s」）＝學妹小婷說「芷若交代過，你的我會做。」，不是芷若（BB 測試①）' % btn, ('小婷', '芷若交代過，你的我會做。') in spk and not any(n in (zname, '林芷若', '芷若') for n, _ in spk), json.dumps(spk, ensure_ascii=False)[:400])
        await run.shot(pg, 'CAFE_0607_counter')
        her = await find_npc(pg, [ZR]); res['her'] = her
        if her:
            last0 = await pg.evaluate("((GAME.G.events||{}).last||{}).ev_cafe_barista_zhiruo||null")
            await L.go_to(pg, cdp, run, her[0], her[1], 1.0, '芷若', max_s=120, lv=her[2]); n1 = len(await pg.evaluate("window.__LOG||[]"))
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await drive(pg, cdp, run, picks=['就這樣'], max_s=90, label=sid)
            log2 = (await pg.evaluate("window.__LOG||[]"))[n1:]; T2 = texts(log2); res['talk'] = T2[:10]
            last1 = await pg.evaluate("((GAME.G.events||{}).last||{}).ev_cafe_barista_zhiruo||null")
            BAD = ['（她把杯子推過來）你的。我看到你在門口就做了。', '（她在吧檯後面點了一下頭，手沒停）', '（她在吧檯後面抬頭）……嗨。', '要打烊了。……你可以坐到我擦完這張桌子。', '期末了。我還有一份報告沒寫，店裡也要盤點。']
            run.check('CAFE_0607：和芷若說話不是「兩點半的店員」（點餐），招呼沒有上班、吧檯、打烊、盤點那幾句', last1 == last0 and not any(t in BAD for t in T2), json.dumps({'T': T2[:8], 'barista_last': [last0, last1]}, ensure_ascii=False)[:400])
        else: run.note('CAFE_0607：找不到芷若的人物（作息 6/7 14:00～16:00 在 Café 讀書），和她說話那一項 NOT TESTED')
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_inv(p, run, base, sid, out):
    res = out.setdefault(sid, {}); guest = sid == 'INV_GUEST'
    key, h, tm, exp = ('2027-06-07', 13.0, '今天 15:30', '我在 Café，今天是客人。你要來嗎？') if guest else ('2027-05-31', 10.0, '今天 12:10', '我就在 Café 啊。你來，我做給你。')
    b, pg, cdp, errs = await launch(p, run, base, key, h, 'dorm', rels=((ZR, 'FAM'),), label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); n0 = len(await pg.evaluate("window.__LOG||[]"))
        await phone_tab(pg, cdp, 'friends'); got = await tap_sel_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"heroine_02\"]')")
        res['inv_btn'] = got; await pg.wait_for_timeout(1500)
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).slice(%d).some(x=>x.n!=='［選項］'&&x.n!=='［字幕］'&&/Café/.test(x.t))&&!(GAME.D&&GAME.D.active)" % n0, max_s=120, picks=['去兩點半 Café', tm], label=sid)
        await drive(pg, cdp, run, max_s=30, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = texts(log); res['log'] = log; res['ch'] = ch
        iv = await pg.evaluate("(GAME.G.invites||[]).filter(v=>v.who==='heroine_02').map(v=>({state:v.state,h:v.h,place:v.place}))"); res['inv'] = iv
        await run.shot(pg, '%s_reply' % sid)
        run.check('%s：手機約芷若「去兩點半 Café 坐坐」%s → 她回「%s」%s' % (sid, tm, exp, '（BB 測試①）' if guest else '（對照：她在班）'), any(exp in t for t in T), json.dumps({'T': T[:8], 'choices': [c['opts'] for c in ch][:3]}, ensure_ascii=False)[:500])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ADM_GEN = ['下學期我要去英國交換。那邊的信，前幾天來了。', '這幾天一直想跟每個客人說。……結果都沒說。', '嗯。九月初。……還有三個多月。']
ADM_DATE = ['錄取了。……那天你沒打來。', '（她把吧檯擦了一遍，沒有看你。）', '九月我就走了。五個多月。', '五個多月欸。……好啦，你這樣講我比較安心。']


async def s_admit(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'ADMIT_DATE'; after = sid == 'ADMIT_AFTER'
    key, h = ('2027-06-07', 14.8) if after else ('2027-05-14', 12.85)
    b, pg, cdp, errs = await launch(p, run, base, key, h, 'dorm', rels=((ZR, 'FAM'),), dating=((ZR,) if dating else ()), quiet=False, label=sid + '（不開 quiet_events：進 Café 的事件要跑）')
    try:
        await drive(pg, cdp, run, max_s=90, label=sid)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        ok = await quick_go(pg, cdp, 'cafe'); st = await pg.evaluate(STATE); res['arrive'] = st
        picks = ['「五個多月很快。」'] if dating else ['「九月走？」']
        ok2, ch = await wait_for(pg, cdp, run, "!!GAME.G.flags.ZR_ADMITTED&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=(60 if after else 150), picks=picks, label=sid)
        await drive(pg, cdp, run, picks=picks, max_s=30, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = texts(log); res['log'] = log
        zr = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.heroine_02; return n?{staff:n.staff||null}:null; })()"); res['zr'] = zr
        await run.shot(pg, '%s_after' % sid)
        if after:
            run.check('ADMIT_AFTER：6/7（6/3 最後一個班以後）進 Café 不會第一次聽到錄取（BB 測試③）', ok and not any(t in T for t in ADM_GEN + ADM_DATE) and not await pg.evaluate("!!GAME.G.flags.ZR_ADMITTED"), json.dumps({'T': T[:8], 'zr': zr}, ensure_ascii=False)[:400])
        elif dating:
            run.check('ADMIT_DATE：交往中 5/14 進 Café＝「%s」（「五個多月」；BB 測試③、第 2 項）' % '」「'.join(ADM_DATE), ok2 and in_order(T, ADM_DATE) is None and not any('四個月' in t for t in T), json.dumps(T[:14], ensure_ascii=False)[:600])
        else:
            run.check('ADMIT：5/14 進 Café（她在班）＝錄取一般版「%s」；沒有「四個月」（BB 測試③）' % '」「'.join(ADM_GEN), ok2 and in_order(T, ADM_GEN) is None and not any('四個月' in t for t in T), json.dumps({'T': T[:12], 'zr': zr}, ensure_ascii=False)[:600])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_termgf(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    key, h, until, text, tag = {'TERM_GF': ('2027-06-12', 19.92, 20.4, '禮拜五晚上，我們去吃宵夜。……我現在不用上班了。', 'te_gf_Y2S2_heroine_02'),
                                'TERM_GF_EARLY': ('2027-06-10', 19.92, 20.75, None, 'te_gf_Y2S2_heroine_02'),
                                'ZR_TEN': ('2026-12-24', 19.92, 20.4, '禮拜五十點，等我下班。', 'te_gf_Y2S1_heroine_02')}[sid]
    b, pg, cdp, errs = await launch(p, run, base, key, h, 'dorm', rels=((ZR, 'FAM'),), dating=(ZR,), label=sid + '（和芷若交往中%s）' % ('；前置：讀檔跳過 6/11 的期末考' if sid == 'TERM_GF' else ''))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        info = await pg.evaluate("(()=>{ const w=TERMEND.window(GAME.G); if(!w) return null; return {id:w.id, from:CALENDAR.dateOf(w.from).key, examStart:CALENDAR.dateOf(TERMEND.examStart(GAME.G,w)).key}; })()"); res['window'] = info
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=%s" % until, max_s=480, label=sid)
        M = await msgs(pg, TH_ZR); mine = [m for m in M if m['tag'] == tag or (text and m['text'] == text)]; res['msgs'] = M[-3:]
        sent = await pg.evaluate("PHONE.sent(GAME.G,%s)" % json.dumps(tag)); res['sent'] = sent
        if text:
            await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(TH_ZR)); await run.shot(pg, '%s_dm' % sid); await L.phone_away(pg, cdp)
            run.check('%s：%s 20:15 芷若「%s」（回覆「好。」）%s' % (sid, key, text, '（BB 測試②、第 1、6 項；時段 %s）' % json.dumps(info, ensure_ascii=False) if sid == 'TERM_GF' else '（AA_373 第 6 節第 9 題：十點）'),
                      ok and bool(mine) and mine[-1]['text'] == text and mine[-1]['d'] == key and 20.24 <= mine[-1]['h'] <= 20.4 and (mine[-1]['ask'] or {}).get('opts') == ['好。'], json.dumps({'mine': mine, 'info': info}, ensure_ascii=False)[:500])
            run.check('%s：她的期末邀約沒有「九點」' % sid, not any('九點' in m['text'] for m in M if m['d'] == key), json.dumps([m['text'] for m in M if m['d'] == key], ensure_ascii=False))
        else:
            run.check('TERM_GF_EARLY：6/10 晚上（最後一科 6/11 還沒考）芷若的期末約會還沒傳（原本時段第一天 6/10 就傳；第 6 項）', ok and not sent and not mine, json.dumps({'sent': sent, 'msgs': M[-2:], 'info': info}, ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_zqdad(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-05-16', 20.85, 'dorm', rels=(('heroine_04', 'FAM'),), label=sid + '（舊局第一次讀到大二下：讀檔時補 5/9 那一組，21:00 收 5/16 那一組）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=21.03&&(GAME.G.msgs||[]).some(m=>m.th==='sys'&&/這週的訊息/.test(m.text||'')&&m.day===GAME.G.day)", max_s=420, label=sid)
        M = await msgs(pg, 'p:heroine_04'); res['msgs'] = M[-6:]
        batch = await pg.evaluate("(()=>{ const N=GAME.G.needed||{}; return (N.batches||[]).map(b=>({d:CALENDAR.dateOf(b.d).key, ids:b.ids})); })()"); res['batches'] = batch
        say('   %s 這週的訊息：%s' % (sid, json.dumps(batch, ensure_ascii=False)))
        w12 = [m['text'] for m in M if m['d'] == '2027-05-16']; w11 = [m['text'] for m in M if m['d'] == '2027-05-09']
        run.check('ZQ_DAD：5/16（日）21:00 子晴「欸跟你說」「我爸下週要來台北」（「下週」＝第 13 週，BB 測試④）', ok and in_order(w12, ['欸跟你說', '我爸下週要來台北']) is None, json.dumps({'5/16': w12, 'batch': batch}, ensure_ascii=False)[:500])
        run.check('ZQ_DAD：5/9（第 11 週）那一組沒有爸爸那則', not any('我爸下週要來台北' in t for t in w11), json.dumps({'5/9': w11}, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


SP_START = ['（你回家把車開出來。後座擠了三個人。）', '（車子坐不下。剩下的人搭火車，下午在那邊會合。）']
SP_END = '（回程，後座三個人都睡著了。你一個人開到臺北，收音機開得很小聲。）'


async def s_spring(p, run, base, sid, out):
    res = out.setdefault(sid, {}); team = (('heroine_03', 'FRI'), ('classmate_bohan', 'FRI'), ('zhe', 'FAM'), ('heroine_01', 'FAM'), ('yu', 'FAM'), ('classmate_xinci', 'FAM'))
    b, pg, cdp, errs = await launch(p, run, base, '2027-04-01', 20.0, 'dorm', rels=team, groups=(('noodle_team', '麵店團'),), label=sid + '（麵店團群組；語彤、柏翰朋友，其他四個熟悉；4/1＝回覆期限那天才看到 3/30 的邀約）')
    try:
        picks = ['春假：跟麵店團出去', '出發：春假', '（下去踩水）']
        ok, ch = await wait_for(pg, cdp, run, "(OUT.rec(GAME.G)||[]).some(q=>q.id==='ndl_trip_y2s2')", max_s=240, picks=picks, label=sid)
        q = await pg.evaluate("(OUT.rec(GAME.G)||[]).filter(q=>q.id==='ndl_trip_y2s2').map(q=>({d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state}))"); res['plan'] = q; res['menu'] = ch
        run.check('SPRING_CAR：春假選單選「跟麵店團出去」→ 排 4/4 08:00（先回家取車）', ok and bool(q) and q[0]['d'] == '2027-04-04', json.dumps({'plan': q, 'menu': [c['opts'] for c in ch][:2]}, ensure_ascii=False)[:400])
        for _ in range(4):
            st = await pg.evaluate(STATE)
            if st['key'] >= '2027-04-04': break
            await next_day(pg, cdp, run, sid, picks)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        ok2, ch2 = await wait_for(pg, cdp, run, "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_spring_y2_noodle)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=600, picks=picks, label=sid)
        await drive(pg, cdp, run, picks=picks, max_s=40, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = texts(log); res['log'] = log; car = await pg.evaluate("GAME.G.flags.SPRING_Y2_CAR||null"); res['car'] = car
        await run.shot(pg, '%s_after' % sid)
        run.check('SPRING_CAR：4/4 時間到「出發：春假：開車載麵店團」→ 演完', ok2 and any(any(o.startswith('出發：春假') for o in c['opts']) for c in ch2), json.dumps([c['opts'] for c in ch2][:3], ensure_ascii=False)[:300])
        run.check('SPRING_CAR：車上三個人＝照熟悉度（語彤、柏翰、阿哲）（BB 測試⑤）', isinstance(car, list) and len(car) == 3 and car[:2] == ['heroine_03', 'classmate_bohan'] and 'zhe' in car, json.dumps(car))
        mk = T[:T.index('（第二站是海邊。四月的風還有點冷。）')] if '（第二站是海邊。四月的風還有點冷。）' in T else T
        adj = all(x in T for x in SP_START) and T.index(SP_START[1]) == T.index(SP_START[0]) + 1
        run.check('SPRING_CAR：開頭「後座擠了三個人」接「車子坐不下…搭火車，下午在那邊會合」；市場只有車上的人（語彤、阿哲在，以安不在）', adj
                  and '這個市場，我田野課看過資料。……想自己來看一次。' in mk and '（手上拿著一袋剛炸好的東西）這個好吃。我不知道是什麼。' in mk and '第一站選得很有理由。' not in mk, json.dumps(T[:10], ensure_ascii=False)[:500])
        run.check('SPRING_CAR：會合以後海邊照樣有小語、芯慈的句子；回程「後座三個人都睡著了」', '我說要去海邊，真的來了。' in T and '我們拍一張。……阿哲你站後面，你太高。' in T and SP_END in T, json.dumps(T[-8:], ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_noodle(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    key, line = {'NOODLE_THU': ('2027-02-25', '（大二下第一次的週四麵店。阿姨說，過年胖了的人自己知道。）'), 'NOODLE_SPRING': ('2027-04-08', '（春假回來的第一個週四。長桌的人，每個人都在講自己這幾天去了哪裡。）')}[sid]
    b, pg, cdp, errs = await launch(p, run, base, key, 17.85, 'dorm', rels=(('zhe', 'FAM'), ('heroine_03', 'FAM')), groups=(('noodle_team', '麵店團'),), quiet=False, label=sid + '（麵店團群組；不開 quiet_events：進麵店的事件要跑）')
    try:
        await drive(pg, cdp, run, max_s=90, label=sid); n0 = len(await pg.evaluate("window.__LOG||[]"))
        ok = await quick_go(pg, cdp, 'noodle'); st = await pg.evaluate(STATE); res['arrive'] = st
        ok2, _ = await wait_for(pg, cdp, run, "(window.__LOG||[]).slice(%d).some(x=>x.t===%s)" % (n0, json.dumps(line)), max_s=120, label=sid)
        await drive(pg, cdp, run, max_s=40, label=sid)
        T = texts((await pg.evaluate("window.__LOG||[]"))[n0:]); res['T'] = T[:10]; await run.shot(pg, '%s_after' % sid)
        run.check('%s：%s（四）%.2f 進麵店＝「%s」（AA_342 第 2-2 節）' % (sid, key, st['h'], line), ok and ok2 and T.count(line) == 1, json.dumps(T[:8], ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_sum(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    key, line = {'SUM_0306': ('2027-03-06', '（大二下的第二週。你終於記住了這學期的課表：週二要跑萬才館。）'), 'SUM_0520': ('2027-05-20', '（五月。宿舍走廊開始有人在討論暑假要去哪裡。）')}[sid]
    b, pg, cdp, errs = await launch(p, run, base, key, 7.9, 'dorm', label=sid + '（07:54 在宿舍）')
    try:
        ok, _ = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.t===%s)" % json.dumps(line), max_s=300, label=sid)
        log = await pg.evaluate("window.__LOG||[]"); hit = [x for x in log if x['t'] == line]; res['hit'] = hit
        await drive(pg, cdp, run, max_s=30, label=sid); await run.shot(pg, '%s_after' % sid)
        run.check('%s：%s 08:00 以後第一次空下來＝旁白「%s」（說一次）' % (sid, key, line), ok and len(hit) == 1 and hit[0]['at'].startswith(key) and float(hit[0]['at'].split()[1]) >= 8.0, json.dumps(hit, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_msgs(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    try:
        if sid == 'MSG_BH':
            b, pg, cdp, errs = await launch(p, run, base, '2027-03-12', 20.85, 'dorm', rels=(('classmate_bohan', 'FAM'),), label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            await ask_and_answer(pg, cdp, run, sid, 'p:classmate_bohan', 'y2s2_bh_table', ['債各第一章的筆記，我做了表格。', '要的話傳給你。'], ['要。', '我自己整理。'], '要。', ['（照片：一張表格，欄位比內容多）'], res)
        elif sid == 'MSG_KAI':
            b, pg, cdp, errs = await launch(p, run, base, '2027-05-21', 21.85, 'dorm', rels=(('kai', 'FAM'),), label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            await ask_and_answer(pg, cdp, run, sid, 'p:kai', 'y2s2_kai_summer', ['暑假你回家還是留宿舍'], ['還沒想。', '回家吧。'], '還沒想。', ['我也是。'], res)
        elif sid == 'ZQ_0604':
            b, pg, cdp, errs = await launch(p, run, base, '2027-06-04', 21.85, 'dorm', rels=(('heroine_04', 'FRI'),), label=sid + '（子晴朋友、有聯絡方式、沒看過 Q6）')
            await drive(pg, cdp, run, max_s=30, label=sid)
            await ask_and_answer(pg, cdp, run, sid, 'p:heroine_04', 'y2_zq_dad_msg', ['我爸上禮拜來過', '搭計程車來 搭計程車回去', '他問我最近在忙什麼 我說寫程式', '……我跟芷若去河堤走了一圈 沒事'],
                                 ['沒事就好。', '要不要出來走走？'], '沒事就好。', ['嗯', '……其實有一點事 改天講'], res)
        else:   # MSG_GRP
            b, pg, cdp, errs = await launch(p, run, base, '2027-04-21', 21.85, 'dorm', rels=(('yu', 'FAM'), ('zhe', 'FAM')), groups=(('noodle_team', '麵店團'),), label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=22.1", max_s=420, label=sid)
            M = await msgs(pg, 'g:noodle_team'); got = [(m['from'], m['text']) for m in M if m['d'] == '2027-04-21']; res['grp'] = got
            run.check('MSG_GRP：4/21（三）22:00 麵店團群組 小語「期中考完了」「我要吃三碗麵」、阿哲「我請一碗」（AA_342 第 2-2 節）', ok and got[-3:] == [('yu', '期中考完了'), ('yu', '我要吃三碗麵'), ('zhe', '我請一碗')], json.dumps(got, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    try: await close(b)
    except Exception: pass


EXPO_END = [('classmate_bohan', '交換要成績多少？'), ('heroine_01', '簡章第三頁有寫，我等一下傳給你。'), ('classmate_bohan', '好。')]


async def s_expo_y2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-03-18', 11.95, 'campus', rels=(('heroine_01', 'FAM'), ('classmate_bohan', 'FAM')), label=sid + '（認識以安、柏翰；11:57 在校園）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        await quick_go(pg, cdp, 'campus|博雅教學館'); ok, it = await enter_door(pg, cdp, run, 'boya', sid); st = await pg.evaluate(STATE); res['enter'] = [st, it]
        run.check('EXPO_Y2：走進博雅教學館（%s）' % (it[3] if it else '找不到門'), ok, json.dumps(st, ensure_ascii=False))
        n0 = len(await pg.evaluate("window.__LOG||[]")); joined = False; t0 = time.time()
        while time.time() - t0 < 420 and not joined:
            seat = await pg.evaluate(FREE101)
            if not seat:
                labels = await pg.evaluate("(GAME.E.interactables||[]).slice(0,40).map(i=>i.label+(i.seat?'@'+(i.seat.room||''):''))"); res['labels'] = labels
                run.check('EXPO_Y2：博雅 101 有座位可以坐', False, json.dumps(labels, ensure_ascii=False)[:600]); break
            await L.go_to(pg, cdp, run, seat[0], seat[1], 0.8, '101 的座位', max_s=150, lv=seat[2]); near = await pg.evaluate(NEAR_IT)
            if not (near and near[1]): res.setdefault('skipped', []).append([seat[:2], near]); await pg.evaluate("(p=>{ window.__TRIED=(window.__TRIED||[]).concat([p]); })(%s)" % json.dumps(seat[:2])); continue   # 走到了，互動鈕不是「坐下」（剛被聽眾坐走）＝換一個位子
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            ops = await opts(pg); res.setdefault('seat_menus', []).append(ops)
            k = next((i for i, o in enumerate(ops) if o.startswith('聽演講：交換學生甄選說明會')), None)
            if k is not None: await tap_idx(pg, cdp, k); joined = True; break
            if ops: k2 = next((i for i, o in enumerate(ops) if o.startswith(('不坐了', '算了', '站起來'))), len(ops) - 1); await tap_idx(pg, cdp, k2)
            await pg.wait_for_timeout(15000)
        if joined:
            ok2, ch = await wait_for(pg, cdp, run, "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_exchange_expo_y2)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=240, picks=['（坐到台灣那一區）'], label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log
            sp = [(x.get('id') or x['n'], x['t']) for x in log if x['n'] not in ('［選項］', '［字幕］')]
            nm = await pg.evaluate("({b:SOCIAL.displayName('classmate_bohan'),a:SOCIAL.displayName('heroine_01')})")
            sp2 = [('classmate_bohan' if w in ('classmate_bohan', nm['b']) else ('heroine_01' if w in ('heroine_01', nm['a']) else w), t) for w, t in sp]
            idx = [i for i, x in enumerate(sp2) if x == EXPO_END[0]]
            run.check('EXPO_Y2：說明會散場三句：柏翰「交換要成績多少？」／以安「簡章第三頁有寫，我等一下傳給你。」／柏翰「好。」（AA_255；第 4 節提醒）', ok2 and bool(idx) and sp2[idx[0]:idx[0] + 3] == EXPO_END, json.dumps(sp2[-8:], ensure_ascii=False)[:500])
            run.check('EXPO_Y2：沒有「我查過了。你夠。」「……我是問妳。」', not any(t in ('我查過了。你夠。', '……我是問妳。') for _, t in sp2), '')
        elif 'labels' not in res: run.check('EXPO_Y2：101 坐下有「聽演講：交換學生甄選說明會」（12:05～12:45 可以參加）', False, json.dumps(res.get('seat_menus'), ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_data(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-06-07', 12.0, 'dorm', label=sid + '【讀資料，不是玩】')
    try:
        d = await pg.evaluate("""(()=>{ const H=t=>TERMEND.heart('heroine_02',t), F=TERMEND_LINES.FRIEND.heroine_02;
          return {heartY2S2:H('Y2S2').invite, heartPlace:H('Y2S2').place, friendY2S2:(F.genByTerm||{}).Y2S2, older:['Y1S1','Y1S2','Y2S1'].map(t=>[t,H(t).invite,H(t).invite2,H(t).h]),
            noShift:['2027-06-03','2027-06-04','2027-09-02','2027-09-03'].map(k=>[k,STORY.zrNoShift(GAME.G,STORY.dayOfKey(k))])}; })()"""); res['data'] = d
        run.check('DATA【讀資料】：大二下心意邀約「這禮拜五晚上我有空。……我想吃飯，不想吃店裡的東西。」、不在 Café 打烊以後；朋友的期末飯「考完了嗎？九月我就走了。……出來吃個東西？」（第 1 項）',
                  d['heartY2S2'] == '這禮拜五晚上我有空。……我想吃飯，不想吃店裡的東西。' and d['heartPlace'] != 'cafe' and d['friendY2S2'] == '考完了嗎？九月我就走了。……出來吃個東西？', json.dumps(d, ensure_ascii=False)[:500])
        run.check('DATA【讀資料】：大一上～大二上心意邀約「這禮拜五我十點下班。……」「禮拜五十點。……」、22:00（AA_373 第 6 節第 9 題）',
                  all(x[1] == '這禮拜五我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。' and x[2] == '禮拜五十點。……上次那句，你想好了嗎？' and x[3] == 22 for x in d['older']), json.dumps(d['older'], ensure_ascii=False))
        run.check('DATA【讀資料】：芷若不上班＝6/4～9/2（6/3 否、6/4 是、9/2 是、9/3 否）', [x[1] for x in d['noShift']] == [False, True, True, False], json.dumps(d['noShift']))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# BB-B 10-24 10:3x（EXPO_DBG／EXPO_DBG2）：說明會 12:20 起 30 個聽眾從門口進來入座，門口附近的位子先被坐走；
#   GAME.E.nearestInteractable 會跳過有人坐（n.seat）的位子，所以站在那裡互動鈕是藏著的（遊戲對，腳本一直挑同一個有人的位子＝腳本錯）。
#   改：只挑沒人坐、沒人正要去坐（seatTarget）、替身沒佔（taken）、還沒試過的位子；走到以後互動鈕要是「坐下」才按，不是就換一個
FREE101 = ("(()=>{ const E=GAME.E, P=E.player.obj.position, T=window.__TRIED||[]; const occ=st=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35)||E.npcs.some(n=>n.seatTarget&&Math.hypot(n.seatTarget.x-st.x,n.seatTarget.z-st.z)<0.4); "
           "const L=(E.interactables||[]).filter(i=>i&&i.seat&&String(i.seat.room)==='101'&&!i.hidden&&!i.seat.taken&&!occ(i.seat)&&!T.some(t=>Math.hypot(t[0]-i.x,t[1]-i.z)<0.2)); "
           "L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=L[0]; return i?[i.x,i.z,i.lv|0,L.length]:null; })()")
NEAR_IT = "(()=>{ try{ const it=GAME.E.nearestInteractable(); return it?[it.label,!!it.seat]:null; }catch(e){ return null; } })()"


# BB-B 10-24 03:5x：清單第 86 項①（BB 事件包第 2 輪，bbpack_r2；開發分支 23bba7c8d 起）：交換展坐哪一區的句子
#   日本區＋見過日文班（JP_MET）＋上過日文（attend.japanese_1）＝采蓁兩句；美國區＝明軒一句；台灣區＝明軒一句；認識明軒＝門口兩句（每一種都有）
EXPO86 = {
  'EXPO86_JP': ('（坐到日本那一區）', [('采蓁', '欸，日文課的！你也想去日本？'), ('采蓁', '獸醫系走不開。……可是看看也好。')], {'JP_MET': True}, True),
  'EXPO86_US': ('（坐到美國那一區）', [('classmate_mingxuan', '美國區。……我坐這裡，不代表付得起。')], {}, False),
  'EXPO86_TW': ('（坐到台灣那一區）', [('classmate_mingxuan', '你只是來聽聽？……我也是。聽聽不用錢。')], {}, False),
  'EXPO86_LATE': ('（坐到台灣那一區）', [('classmate_mingxuan', '你只是來聽聽？……我也是。聽聽不用錢。')], {}, False),
}
# BB-B 10-24 11:5x：12:20 開始以後才坐下＝坐下那一刻 actTrack 記了 EXPO_Y2『in』→ onceDone（once:true＋stateOf 有 partial）→ canJoin false，選單沒有「聽演講」（Node 重現，chk/expo_once.js；v9.10.7 線上也有）。
#   EXPO86_JP／US／TW 改成 11:45 讀檔、開始前（12:05～12:20）坐下＝現在走得通的路，驗台詞；EXPO86_LATE 照舊 11:57 讀檔、開始以後才坐下＝這個 bug 的證據（修好以前 FAIL）
EXPO86_H = {'EXPO86_LATE': 11.95}
MX_DOOR = [('classmate_mingxuan', '我想去。……交換要先存錢，我算過了。'), ('classmate_mingxuan', '要再多教兩個家教學生。')]


async def s_expo86(p, run, base, sid, out):
    res = out.setdefault(sid, {}); pk, want, flags, jp = EXPO86[sid]
    b, pg, cdp, errs = await launch(p, run, base, '2027-03-18', EXPO86_H.get(sid, 11.75), 'campus', rels=(('heroine_01', 'FAM'), ('classmate_bohan', 'FAM'), ('classmate_mingxuan', 'FAM')), flags=flags,
                                    label=sid + '（認識以安、柏翰、明軒；%s）' % ('見過日文班、【前置】日文（上）出席 3 次' if jp else '沒修日文'))
    try:
        if jp: await pg.evaluate("(()=>{ const R=CLS.rec(GAME.G); R.attend=R.attend||{}; R.attend.japanese_1=3; return R.attend.japanese_1; })()")
        await drive(pg, cdp, run, max_s=30, label=sid)
        await quick_go(pg, cdp, 'campus|博雅教學館'); ok, it = await enter_door(pg, cdp, run, 'boya', sid); st = await pg.evaluate(STATE); res['enter'] = [st, it]
        run.check('%s：走進博雅教學館（%s）' % (sid, it[3] if it else '找不到門'), ok, json.dumps(st, ensure_ascii=False))
        n0 = len(await pg.evaluate("window.__LOG||[]")); joined = False; t0 = time.time()
        while time.time() - t0 < 420 and not joined:
            seat = await pg.evaluate(FREE101)
            if not seat: run.check('%s：博雅 101 有座位可以坐' % sid, False, ''); break
            await L.go_to(pg, cdp, run, seat[0], seat[1], 0.8, '101 的座位', max_s=150, lv=seat[2]); near = await pg.evaluate(NEAR_IT)
            if not (near and near[1]): res.setdefault('skipped', []).append([seat[:2], near]); await pg.evaluate("(p=>{ window.__TRIED=(window.__TRIED||[]).concat([p]); })(%s)" % json.dumps(seat[:2])); continue   # 走到了，互動鈕不是「坐下」（剛被聽眾坐走）＝換一個位子
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            ops = await opts(pg); res.setdefault('seat_menus', []).append(ops)
            k = next((i for i, o in enumerate(ops) if o.startswith('聽演講：交換學生甄選說明會')), None)
            if k is not None: await tap_idx(pg, cdp, k); joined = True; break
            if ops: k2 = next((i for i, o in enumerate(ops) if o.startswith(('不坐了', '算了', '站起來'))), len(ops) - 1); await tap_idx(pg, cdp, k2)
            await pg.wait_for_timeout(15000)
        if joined:
            ok2, ch = await wait_for(pg, cdp, run, "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_exchange_expo_y2)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=240, picks=[pk], label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; res['country'] = await pg.evaluate("GAME.G.flags.EXPO_COUNTRY||null")
            nm = await pg.evaluate("({m:SOCIAL.displayName('classmate_mingxuan')})")
            sp = [('classmate_mingxuan' if (x.get('id') or x['n']) in ('classmate_mingxuan', nm['m']) else (x.get('id') or x['n']), x['t']) for x in log if x['n'] not in ('［選項］', '［字幕］')]
            miss = [w for w in MX_DOOR + want if not any(t == w[1] and (n == w[0] or w[0] == '采蓁') for n, t in sp)]
            run.check('%s：選「%s」（EXPO_COUNTRY＝%s）；明軒門口兩句＋這一區的句子逐字' % (sid, pk, res['country']), ok2 and not miss, json.dumps({'miss': miss, 'tail': sp[-10:]}, ensure_ascii=False)[:600])
            if not jp: run.check('%s：沒修日文＝沒有采蓁那兩句' % sid, not any(t.startswith('欸，日文課的') for _, t in sp), '')
        else: run.check('%s：101 坐下有「聽演講：交換學生甄選說明會」%s' % (sid, '（12:20 開始以後才坐下）' if sid == 'EXPO86_LATE' else ''), False, json.dumps(res.get('seat_menus'), ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# BB-B 10-24 09:4x：EXPO86 三種都「101 坐下選單是空的」——查是腳本還是遊戲（不是驗收項目，只記狀態＋截圖）
async def s_expo_dbg(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-03-18', 11.95, 'campus', rels=(('heroine_01', 'FAM'), ('classmate_bohan', 'FAM'), ('classmate_mingxuan', 'FAM')), label=sid + '【除錯】')
    PROBE = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player.obj.position; const ib=document.getElementById('interact');
      const near=(E.interactables||[]).filter(i=>i&&!i.hidden).map(i=>({l:i.label, d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2), seat:i.seat?String(i.seat.room||'')+(i.seat.taken?'/taken':''):'', npc:i.npc||'', lv:i.lv|0})).sort((a,b)=>a.d-b.d).slice(0,6);
      const ch=document.getElementById('choices'); const t=document.getElementById('toast');
      return {h:+(+G.hour).toFixed(3), zone:G.zone, lv:E.player.lv|0, sit:!!E.player.seat, ib:ib?[ib.textContent.trim(), ib.classList.contains('hide')||getComputedStyle(ib).display==='none']:null, near,
        ch:ch?[ch.classList.contains('hide'), [...ch.querySelectorAll('button')].map(b=>b.textContent.trim())]:null, toast:t?t.textContent.trim():null, adv:typeof ADV!=='undefined'&&!!ADV.active,
        act:(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.atSeat)?(ACTIVITIES.atSeat(G,G.zone,'101')||null):'noapi'}; })()"""
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        await quick_go(pg, cdp, 'campus|博雅教學館'); ok, it = await enter_door(pg, cdp, run, 'boya', sid)
        run.check('%s：走進博雅教學館' % sid, ok, '')
        seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const L=(GAME.E.interactables||[]).filter(i=>i&&i.seat&&String(i.seat.room)==='101'&&!i.hidden); L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=L[0]; return i?[i.x,i.z,i.lv|0,L.length,i.label]:null; })()")
        res['seat'] = seat; say('   座位', json.dumps(seat, ensure_ascii=False))
        await L.go_to(pg, cdp, run, seat[0], seat[1], 0.8, '101 的座位', max_s=150, lv=seat[2])
        res['before'] = await pg.evaluate(PROBE); say('   點之前', json.dumps(res['before'], ensure_ascii=False)[:900])
        await run.shot(pg, sid + '_before') if hasattr(run, 'shot') else None
        await L.tap(pg, cdp, '#interact'); res['after'] = []
        for k in range(12):
            await pg.wait_for_timeout(500); st = await pg.evaluate(PROBE); res['after'].append(st)
            say('   +%.1fs' % ((k + 1) * 0.5), json.dumps({x: st[x] for x in ('h', 'sit', 'ib', 'ch', 'toast', 'adv')}, ensure_ascii=False)[:500])
        await run.shot(pg, sid + '_after') if hasattr(run, 'shot') else None
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# BB-B 10-24 09:5x：EXPO_DBG 看到「離座位 0.53 m、互動鈕藏起來」（#interact hide、標籤還是「看看博雅 101 階梯教室」）。
#   分開看：玩家 busy／對話框 D.active／D.busyDepth／選單、nearestInteractable 是哪一個、座位 y 和玩家 y、站到互動點正上方（【捷徑】）以後會不會出現
async def s_expo_dbg2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await launch(p, run, base, '2027-03-18', 11.95, 'campus', rels=(('heroine_01', 'FAM'), ('classmate_bohan', 'FAM'), ('classmate_mingxuan', 'FAM')), label=sid + '【除錯】')
    PROBE = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, pp=P.obj.position, ib=document.getElementById('interact'), D=GAME.D||{};
      const seats=(E.interactables||[]).filter(i=>i&&i.seat&&String(i.seat.room)==='101'&&!i.hidden).map(i=>({d:+Math.hypot(i.x-pp.x,i.z-pp.z).toFixed(2), y:i.y, sy:i.seat.y, lv:i.lv, r:i.radius, taken:!!i.seat.taken})).sort((a,b)=>a.d-b.d).slice(0,3);
      let ni=null; try{ const it=E.nearestInteractable(); ni=it?(it.label+(it.seat?'@seat':'')):null; }catch(e){ ni='ERR '+e; }
      return {h:+(+G.hour).toFixed(3), busy:!!P.busy, plv:P.lv|0, py:+pp.y.toFixed(2), dActive:!!D.active, dBusy:D.busyDepth|0, sitting:!!P.seat, ibHide:ib?ib.classList.contains('hide'):null, ibLabel:ib?ib.textContent.trim():null, nearest:ni, seats}; })()"""
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        await quick_go(pg, cdp, 'campus|博雅教學館'); ok, it = await enter_door(pg, cdp, run, 'boya', sid)
        run.check('%s：走進博雅教學館' % sid, ok, '')
        res['in_door'] = await pg.evaluate(PROBE); say('   進門', json.dumps(res['in_door'], ensure_ascii=False)[:700])
        seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const L=(GAME.E.interactables||[]).filter(i=>i&&i.seat&&String(i.seat.room)==='101'&&!i.hidden&&!i.seat.taken); L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=L[0]; return i?[i.x,i.z,i.lv|0,i.y==null?null:i.y]:null; })()")
        res['seat'] = seat; say('   座位', json.dumps(seat))
        await L.go_to(pg, cdp, run, seat[0], seat[1], 0.8, '101 的座位', max_s=150, lv=seat[2]); await pg.wait_for_timeout(1500)
        res['walked'] = await pg.evaluate(PROBE); say('   走到旁邊', json.dumps(res['walked'], ensure_ascii=False)[:700])
        await pg.evaluate("GAME.updateInteract&&GAME.updateInteract()"); res['walked2'] = await pg.evaluate(PROBE); say('   叫一次 updateInteract', json.dumps(res['walked2'], ensure_ascii=False)[:500])
        await run.shot(pg, sid + '_walked')
        run.setup('[捷徑] %s：主角放到座位互動點正上方（看互動鈕會不會出現；不是玩家做得到的事）' % sid)
        await pg.evaluate("(([x,z])=>{ const E=GAME.E; if(E.placeAt) E.placeAt(E.player,x,z); else E.player.obj.position.set(x,E.player.obj.position.y,z); })(%s)" % json.dumps(seat[:2])); await pg.wait_for_timeout(1500)
        res['placed'] = await pg.evaluate(PROBE); say('   放到互動點上', json.dumps(res['placed'], ensure_ascii=False)[:700])
        await run.shot(pg, sid + '_placed')
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['CAFE_0607', 'INV_GUEST', 'INV_SHIFT', 'ADMIT', 'ADMIT_DATE', 'ADMIT_AFTER', 'TERM_GF', 'TERM_GF_EARLY', 'ZQ_DAD', 'SPRING_CAR', 'DATA',
         'ZR_TEN', 'MSG_BH', 'MSG_GRP', 'MSG_KAI', 'ZQ_0604', 'SUM_0306', 'SUM_0520', 'NOODLE_THU', 'NOODLE_SPRING', 'EXPO_Y2'] + list(EXPO86) + ['EXPO_DBG', 'EXPO_DBG2']
FN = {'CAFE_0607': s_cafe, 'INV_GUEST': s_inv, 'INV_SHIFT': s_inv, 'ADMIT': s_admit, 'ADMIT_DATE': s_admit, 'ADMIT_AFTER': s_admit,
      'TERM_GF': s_termgf, 'TERM_GF_EARLY': s_termgf, 'ZR_TEN': s_termgf, 'ZQ_DAD': s_zqdad, 'SPRING_CAR': s_spring, 'DATA': s_data,
      'MSG_BH': s_msgs, 'MSG_GRP': s_msgs, 'MSG_KAI': s_msgs, 'ZQ_0604': s_msgs, 'SUM_0306': s_sum, 'SUM_0520': s_sum,
      'NOODLE_THU': s_noodle, 'NOODLE_SPRING': s_noodle, 'EXPO_Y2': s_expo_y2}
FN.update({k: s_expo86 for k in EXPO86}); FN['EXPO_DBG'] = s_expo_dbg; FN['EXPO_DBG2'] = s_expo_dbg2


async def main():
    run = L.Run('aa375', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa375.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
