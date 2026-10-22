"""BB（帳號 A）2026-10-22：AA376-Y3S1-FIX-1021 法律系大三上修正（AA_376 第 6 節的 BB 測試）＋AA_342 第 3-1 節大三上補空白（含 11/3、12/18 摘要日）。
開發分支：大三子代理 y3（eb97dbd5）合併進 014a38bc（AA_376 20 項＋AA_342 3-1）；#2 舊刑訴課堂停用在 2469df7f。台詞照 AA 文件原文一字對照。
  YT_THU      #1 語彤大三上週四 17:00–20:00：12/9（四）還在麵店；12/16（四）起＝總圖 3F 閱覽區（手機「朋友」那一列也這樣寫），走進 3F 看得到她；2028-02-24（四）起才是「在做田野訪談」
  CRIMPRO     #2 大三上週二 10:20 走進 201（刑訴開始超過 15 分鐘，手機「今天」→ 去聽後半堂）：不演 v7 舊課堂「上週我們談了刑事訴訟的目的……」；第 5 週（10/5）、有 crimpro_attended 也不演小考「這兩題會出現在期中…」「收卷。下週講強制處分。」
  TA_LIB      #3 9/13（一）總圖 3F 遇到語彤（朋友、還沒聽過助教的事）：「明天第一次上台。我要講二十分鐘。」（不是「下週二」）
  K17_FRESH   #5 和可昕交往：12/8 21:00 她約 12/9 21:45 視訊 →「好。」→ 12/9 視訊第一句「我開始帶大一的民總讀書會了。我先講一次給你聽，你當學弟妹。」（沒聽過 K5-L3 的）
  K17_HEARD   #5 【前置：12/8 已回「好。」、聽過 K5-L3（記憶 KX5_HYPO_SENIOR）】12/9 視訊第一句換「民總讀書會，我先講一次給你聽。」（同一通不再宣布一次）；演完 K5-L3 算過【讀資料】
  TUE_NOODLE  AA_342 3-1 第 3 週：9/21（二）傍晚進麵店＝「（大三第一次的週二麵店。阿姨看了一圈：「大三了，點的還是一樣。」）」（只演一次）
  RIVER_GO    第 4 週：9/27 21:00 群組（阿哲）「明天放假 河濱 三對三」「輸的請飲料」→「去。」→ 9/28 15:00「出發」→ 河濱的旁白
  RIVER_NO    同上回「不去。」→ 阿哲「好喔」、沒有出遊
  PLG         第 5～6 週（參加公法讀書會的）：10/7（四）萬才館二樓研討室 A 門口「參加：公法讀書會」→ 散會以安「下週的題目，你帶。」→「我還不會。」→「不會才要帶。」；
              10/14（四）再參加 →「（你講了十五分鐘。以安只問了一個問題：「理由呢？」你答了。她在手帳上畫了一個勾。）」（10/14 那一段讀檔時帶 10/7 玩出來的旗標）
  BOHAN       沒參加讀書會的：10/8（五）21:00 柏翰私訊「民訴甲上第三章，我的筆記寫錯一個條號。」「改好了。你那份也改一下。」
  SUM1103     第 9 週：11/3（三）摘要日——手機「等到晚上」跳過 18:30 → 日期卡＋「（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）」，只出一次
  NOCLASS     11/5（五）22:00 群組：Alison（yu）「沒課的一週」「我睡了三天」
  LASTNOODLE  第 14 週：12/8 21:00 群組阿哲「期末前最後一次麵店 禮拜四」→ 12/9（四）傍晚進麵店「（期末前最後一次週四麵店。大家都帶了講義，沒有人翻開。）」
  SUM1218     第 15 週：12/18（六）18:20 在宿舍等到 18:30 → 日期卡＋「（期末考前的週末。總圖的位子早上八點就沒了。）」
  TEXTS       【讀資料，不是玩】AA_376 #4、#6～#20 的字和條件（新句在、舊句不在；方奕廷 11/1～11/7 上山；四件初識事件限大一；9/14 語彤麵店 18:30 起）
【前置】讀使用者存檔改日期、時間、地點、旗標（每個情境寫在 run.setup；大三＝ROOM_Y2、ROOM_Y3 已搬過）；讀檔後在頁面裡設關係、聯絡方式、群組（麵店團）、交往。
進門事件（麵店、教室）、總圖的自動事件要事件系統開著（quiet_events=False）；只看手機、出遊的用 quiet_events。之後照玩家：手機回訊息、床上睡覺、手機「跳過時間」、
手機「地點」前往、走樓梯間、按門「參加」、說話、選項、時間到了按「出發」「接起來」。Playwright 手機橫向模擬、?turbo（每格最多 0.3 秒），不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=YT_THU,... python3 aa376_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; }
  if(GAME.titleCard){ const c2=GAME.titleCard; GAME.titleCard=function(a,b){ try{ window.__LOG.push({n:'［日期卡］', t:String(a||'')+'｜'+String(b||''), at:at()}); }catch(e){} return c2.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'&&CLS.content){ const c3=CLS.content; CLS.content=function(it){ const r=c3.apply(this,arguments); try{ window.__LOG.push({n:'［板書］', t:JSON.stringify((r&&r.board)||[]), at:at()}); }catch(e){} return r; }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null})))"""
OUTQ = """(re=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>new RegExp(re).test(q.id||'')).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, wd:CALENDAR.dateOf(q.day).wd%7, h:+(+q.h).toFixed(3), state:q.state, title:q.title||''})))"""
SETUP = """(([rels,dating,repair,flags,groups,mems])=>{ const G=GAME.G, F=G.flags; const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
  const day0=STORY.dayOfKey('2025-09-24'); G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id), v=V[rels[id]]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0; }
  if(rels.heroine_05){ F.met_sis=true; F.SIS_W1=true; }
  for(const g of groups||[]) if(!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))) PHONE.join(G,g[0],g[1]);
  Object.assign(F,flags||{});
  for(const id of dating||[]){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,70); R.trust=Math.max(R.trust|0,60); R.comf=Math.max(R.comf|0,60); R.rom=70; R.npcRom=70; if(G.contacts[id]==null) G.contacts[id]=day0; SOCIAL.remember(id,'FIRST_MET',''); }
  for(const id of repair||[]){ try{ ROM.start(G,id); ROM.end(G,id,'test'); }catch(e){} F['dating_'+id]=false; }
  for(const [id,tag] of mems||[]) SOCIAL.remember(id,tag,'');
  G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true,noodle:true,wancai:true,gongguan:true,campus:true,classroom:true});
  const ids=Object.keys(rels).concat(dating||[]);
  return {stages:Object.fromEntries(ids.map(id=>[id,SOCIAL.stage(id)])), groups:(groups||[]).map(g=>[g[0],!!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))]), route:STORY.route?STORY.route(G):null}; })"""
NPC = """(id=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId===id||x.id===id)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })"""
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
NT = ('noodle_team', '麵店團')
OLD_CRIM = ['上週我們談了刑事訴訟的目的', '這兩題會出現在期中。不是威脅，是預告。', '收卷。下週講強制處分。']


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None, go=()):
    """picks（要選的字，依序找）→ go（這個情境要去的「出發／接起來」開頭）→ 起床選單、跳過時間「照樣跳過」、說話完的「就這樣」→ 別人的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for i, o in enumerate(ops):
        if go and o.startswith(tuple(go)): return i
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
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立"""
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


async def answer(pg, cdp, run, th, ask_id, want, label=''):
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    await pg.wait_for_timeout(600); await run.shot(pg, '%s_dm' % label)
    o = await pg.evaluate("(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; })(%s)" % json.dumps(ask_id))
    if not o: await L.phone_away(pg, cdp); return None
    k = next((i for i, t in enumerate(o) if t.startswith(want)), 0)
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (ask_id, k)))
    await pg.wait_for_timeout(1500); say('   %s 手機回 %s：「%s」' % (label, ask_id, got)); await L.phone_away(pg, cdp); return got


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
    st0 = await pg.evaluate(STATE); ops = await bed(pg, cdp, run, '睡到明天', label)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, ok


async def friend_row(pg, cdp, pid):
    """手機「朋友」那一列（玩家看到的字）＋GAME.whereText（同一個來源）"""
    await phone_tab(pg, cdp, 'friends')
    row = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-person=\"'+id+'\"]'); if(!b) return null; const r=b.closest('.item')||b.parentElement&&b.parentElement.parentElement; return r?r.innerText.replace(/\\n/g,'｜'):null; })(%s)" % json.dumps(pid))
    wt = await pg.evaluate("(id=>GAME.whereText?GAME.whereText(id):null)(%s)" % json.dumps(pid))
    return row, wt


async def to_reading_room(pg, cdp, run):
    """手機「地點」到總圖大廳 → 走到二樓樓梯間 → 3F 閱覽區（直接讀檔進閱覽室人物不生成，BUG-SIS-LIB-LOAD-1022）"""
    if (await pg.evaluate("GAME.G.zone")) != 'library_hall': await quick_go(pg, cdp, 'library_hall')
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
    if not it: return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=180, lv=it[2]); await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == 'library': break
    await pg.wait_for_timeout(4000); return (await pg.evaluate("GAME.G.zone")) == 'library'


def texts(log):
    return [x['t'] for x in log if x['n'] not in ('［選項］', '［字幕］', '［日期卡］', '［板書］')]


async def log_since(pg, n0):
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def log_len(pg):
    return len(await pg.evaluate("window.__LOG||[]"))


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def launch(p, run, base, key, h, zone, rels=None, dating=(), repair=(), flags=None, groups=(), mems=(), quiet=True, extraG=None, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in ROOMS:
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_') and k[7:] not in dating: F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if extraG: G.update(extraG)
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, list(dating), list(repair), flags or {}, [list(g) for g in groups], [list(m) for m in mems]]))
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（%s）；關係 %s；交往 %s；旗標 %s；群組 %s；記憶 %s → %s' % (
        label, key, h, zone, 'quiet_events' if quiet else '事件系統開著', json.dumps(rels or {}, ensure_ascii=False), list(dating) or '—', json.dumps(flags or {}, ensure_ascii=False),
        [g[1] for g in groups] or '—', [m[1] for m in mems] or '—', json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


def guard(fn):
    async def w(p, run, base, sid, out):
        try: await fn(p, run, base, sid, out)
        except Exception as e: out.setdefault(sid, {})['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    return w


async def finish_page(run, tag, res, errs, b):
    res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False)); await close(b)


# ---------------------------------------------------------------- 情境
@guard
async def s_yt_thu(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    for part, key, want, nowant in (('1209', '2027-12-09', '阿鳳麵店', '總圖'), ('1216', '2027-12-16', '總圖 3F 閱覽區', '田野'), ('0224', '2028-02-24', '在做田野訪談', '總圖')):
        tag = '%s-%s' % (sid, part); r0 = res.setdefault(part, {})
        b, pg, cdp, errs, r = await launch(p, run, base, key, 17.75, 'dorm', rels={'heroine_03': 'FRIEND'}, flags={'EXCHANGE_ROUTE': 'TW'} if part == '0224' else {}, label=tag + '（週四 17:45 在宿舍；語彤朋友）')
        try:
            await drive(pg, cdp, run, max_s=30, label=tag)
            row, wt = await friend_row(pg, cdp, 'heroine_03'); r0['row'] = row; r0['where'] = wt; await run.shot(pg, '%s_phone' % tag); await L.phone_away(pg, cdp)
            run.check('%s：手機「朋友」語彤那一列寫「%s」（不是%s）' % (tag, want, nowant), bool(row) and want in row and nowant not in (wt or ''), json.dumps({'row': row, 'whereText': wt}, ensure_ascii=False)[:300])
            if part == '1216':
                ok = await to_reading_room(pg, cdp, run); her = None
                for _ in range(15):
                    her = await pg.evaluate(NPC + "('heroine_03')")
                    if her: break
                    await pg.wait_for_timeout(2000)
                r0['in_lib'] = her; await run.shot(pg, '%s_3F' % tag)
                run.check('%s：走樓梯間進 3F 閱覽區，語彤在（作息＝總圖三樓，AA_376 #1）' % tag, ok and bool(her), json.dumps({'zone': await pg.evaluate("GAME.G.zone"), 'npc': her}, ensure_ascii=False))
        finally: await finish_page(run, tag, r0, errs, b)


@guard
async def s_crimpro(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    for part, key, fl in (('w2', '2027-09-14', {}), ('w5', '2027-10-05', {'crimpro_attended': True})):
        tag = '%s-%s' % (sid, part); r0 = res.setdefault(part, {})
        b, pg, cdp, errs, r = await launch(p, run, base, key, 10.2, 'dorm', rels={'classmate_bohan': 'FAMILIAR'}, flags=fl, quiet=False, label=tag + '（週二 10:12 在宿舍；事件系統開著＝進門事件會跑）')
        try:
            await drive(pg, cdp, run, max_s=40, label=tag); n0 = await log_len(pg)
            await phone_tab(pg, cdp, 'today')
            got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-go]')][0]")
            r0['go'] = got; say('   %s 手機「今天」按：%s' % (tag, got))
            ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［字幕］'&&/下課了|考完了/.test(x.t))", max_s=300, label=tag)
            await drive(pg, cdp, run, max_s=40, label=tag)
            log = await log_since(pg, n0); T = texts(log); r0['log'] = T[:30]; st = await pg.evaluate(STATE)
            run.check('%s：手機「今天」走進教室上刑訴（%s；%s）' % (tag, got, st['zone']), bool(got) and ok, json.dumps({'state': st, 'ch': ch[:3]}, ensure_ascii=False)[:300])
            bad = [t for t in T if any(o in t for o in OLD_CRIM)]
            run.check('%s：不演 v7 舊刑訴課堂（%s）' % (tag, '「上週我們談了…」「這兩題會出現在期中…」「收卷…」'), not bad, json.dumps(bad or T[:12], ensure_ascii=False)[:500])
            done = await pg.evaluate("(()=>{ const D=(GAME.G.events||{}).done||{}; return {cls:D.ev_class_crimpro||0, quiz:D.ev_quiz_crimpro||0}; })()")
            run.check('%s：事件紀錄 ev_class_crimpro／ev_quiz_crimpro 沒有演過' % tag, not done['cls'] and not done['quiz'], json.dumps(done))
        finally: await finish_page(run, tag, r0, errs, b)


@guard
async def s_ta_lib(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-09-13', 9.3, 'library_hall', rels={'heroine_03': 'FRIEND'}, quiet=False, label=sid + '（9/13 週一 09:18 總圖大廳；語彤朋友、還沒聽過助教的事；事件系統開著）')
    try:
        await drive(pg, cdp, run, max_s=40, label=sid); n0 = await log_len(pg)
        ok = await to_reading_room(pg, cdp, run)
        got, ch = await wait_for(pg, cdp, run, "!!(GAME.G.flags&&GAME.G.flags.YT_TA)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=240, picks=['意思是妳很會聽'], label=sid, shot_at='系上老師叫我')
        await drive(pg, cdp, run, max_s=30, label=sid)
        T = texts(await log_since(pg, n0)); res['log'] = T[:16]
        run.check('%s：進 3F 閱覽區、語彤說助教的事（YT_TA）' % sid, ok and got, json.dumps({'zone': await pg.evaluate("GAME.G.zone"), 'T': T[:4]}, ensure_ascii=False)[:300])
        run.check('%s：「明天第一次上台。我要講二十分鐘。」（AA_376 #3）' % sid, '明天第一次上台。我要講二十分鐘。' in T and '下週二第一次上台。我要講二十分鐘。' not in T, json.dumps(T[:10], ensure_ascii=False)[:500])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_k17(p, run, base, sid, out):
    res = out.setdefault(sid, {}); fresh = sid == 'K17_FRESH'
    FIRST0 = '我開始帶大一的民總讀書會了。我先講一次給你聽，你當學弟妹。'; FIRST1 = '民總讀書會，我先講一次給你聽。'
    if fresh:
        b, pg, cdp, errs, r = await launch(p, run, base, '2027-12-08', 20.9, 'dorm', dating=('kexin',), label=sid + '（和可昕交往中；12/8 20:54 宿舍）')
    else:
        b, pg, cdp, errs, r = await launch(p, run, base, '2027-12-09', 21.3, 'dorm', dating=('kexin',), flags={'KX_K17_GO': True}, mems=(('kexin', 'KX5_HYPO_SENIOR'),), label=sid + '（前置：12/8 已回「好。」；聽過 K5-L3＝記憶 KX5_HYPO_SENIOR）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        if fresh:
            ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='y3_k17')", max_s=360, label=sid)
            M = await msgs(pg, 'p:kexin'); res['dm'] = M[-3:]
            run.check('%s：12/8 21:00 她約「明天晚上九點四十五，視訊。你讀書會結束以後。」「我有一件事要你幫忙。」' % sid, ok and [m['text'] for m in M][-2:] == ['明天晚上九點四十五，視訊。你讀書會結束以後。', '我有一件事要你幫忙。'], json.dumps(M[-3:], ensure_ascii=False)[:300])
            await answer(pg, cdp, run, 'p:kexin', 'y3_k17', '好。', sid)
            ops, slept = await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, '等到晚上', sid)
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_kexin_tutor_practice&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=900, picks=['（聽懂了）'], go=('接起來：',), label=sid, shot_at='民總讀書會')
        await drive(pg, cdp, run, max_s=30, label=sid)
        T = texts(await log_since(pg, n0)); res['log'] = T[:12]; res['ch'] = ch
        run.check('%s：12/9 21:45「接起來」可昕的視訊、演完' % sid, ok and any(any(o.startswith('接起來：') for o in c['opts']) for c in ch), json.dumps(ch[:3], ensure_ascii=False)[:300])
        want, nowant = (FIRST0, FIRST1) if fresh else (FIRST1, FIRST0)
        run.check('%s：第一句「%s」（AA_376 #5）' % (sid, want), want in T and nowant not in T, json.dumps(T[:6], ensure_ascii=False)[:400])
        if not fresh:
            sk = await pg.evaluate("(()=>{ try{ return !!(STORY.LADDER_SKIP&&STORY.LADDER_SKIP['K5-L3']&&STORY.LADDER_SKIP['K5-L3'](GAME.G)); }catch(e){ return 'ERR '+e.message; } })()")
            run.check('%s：【讀資料】K17 演過以後，閒聊階梯 K5-L3 算過（不會再宣布一次）' % sid, sk is True, json.dumps(sk))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_tue_noodle(p, run, base, sid, out):
    res = out.setdefault(sid, {}); L0 = '（大三第一次的週二麵店。阿姨看了一圈：「大三了，點的還是一樣。」）'
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-09-21', 17.6, 'gongguan', rels={'zhe': 'FAMILIAR'}, groups=(NT,), quiet=False, label=sid + '（9/21 週二 17:36 公館；事件系統開著）')
    try:
        await drive(pg, cdp, run, max_s=40, label=sid); n0 = await log_len(pg)
        went = await quick_go(pg, cdp, 'noodle')
        ok, ch = await wait_for(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_y3_tue_noodle&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=120, label=sid)
        await drive(pg, cdp, run, max_s=30, label=sid); T = texts(await log_since(pg, n0)); res['log'] = T[:10]
        run.check('%s：進麵店＝%s' % (sid, L0), went and ok and L0 in T, json.dumps({'went': went, 'T': T[:6]}, ensure_ascii=False)[:400])
        await quick_go(pg, cdp, 'gongguan'); n1 = await log_len(pg); await quick_go(pg, cdp, 'noodle'); await pg.wait_for_timeout(5000); await drive(pg, cdp, run, max_s=30, label=sid)
        T2 = texts(await log_since(pg, n1)); run.check('%s：同一晚再進一次不再演（只演一次）' % sid, L0 not in T2, json.dumps(T2[:4], ensure_ascii=False))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_river(p, run, base, sid, out):
    res = out.setdefault(sid, {}); go = sid == 'RIVER_GO'; RV = '（三對三。你們輸了兩場，贏了一場。阿哲說贏的那一場才算。飲料還是你們請的。）'
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-09-27', 20.9, 'dorm', rels={'zhe': 'FAMILIAR'}, groups=(NT,), label=sid + '（9/27 週一 20:54 宿舍；在麵店團）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='y3_river33_ask')", max_s=360, label=sid)
        M = await msgs(pg, 'g:noodle_team'); mine = [m for m in M if m['tag'] == 'y3_river33_ask' or m['text'] in ('明天放假 河濱 三對三', '輸的請飲料')]; res['grp'] = mine
        run.check('%s：9/27 21:00 群組阿哲「明天放假 河濱 三對三」「輸的請飲料」、回覆「去。」「不去。」' % sid, ok and [m['text'] for m in mine][-2:] == ['明天放假 河濱 三對三', '輸的請飲料'] and mine[-1]['ask'] == ['去。', '不去。'] and all(m['h'] >= 21.0 for m in mine[-2:]), json.dumps(mine, ensure_ascii=False)[:400])
        await answer(pg, cdp, run, 'g:noodle_team', 'y3_river33_ask', '去。' if go else '不去。', sid)
        await wait_for(pg, cdp, run, ("OUT.rec(GAME.G).some(q=>q.id==='y3_river33')" if go else "(GAME.G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.text==='好喔')"), max_s=60, label=sid)
        q = await pg.evaluate(OUTQ + "('^y3_river33')"); M2 = await msgs(pg, 'g:noodle_team'); res['out'] = q
        if not go:
            run.check('%s：回「不去。」→ 阿哲「好喔」、沒有排出遊' % sid, any(m['text'] == '好喔' and m['from'] == 'zhe' for m in M2) and not q, json.dumps({'msgs': M2[-2:], 'out': q}, ensure_ascii=False)[:300])
        else:
            run.check('%s：回「去。」→ 排 9/28 15:00 公館河濱' % sid, any(x['d'] == '2027-09-28' and abs(x['h'] - 15) < 0.01 for x in q), json.dumps(q, ensure_ascii=False))
            ops, slept = await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, '等到下午', sid); n0 = await log_len(pg)
            ok2, ch = await wait_for(pg, cdp, run, "GAME.G.flags.Y3_RIVER33==='went'&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=600, go=('出發：河濱',), label=sid, shot_at='三對三')
            T = texts(await log_since(pg, n0)); res['log'] = T[:6]; res['ch'] = ch
            run.check('%s：9/28 時間到「出發：河濱 三對三」→ %s' % (sid, RV), ok2 and RV in T, json.dumps({'ch': ch[:3], 'T': T[:4]}, ensure_ascii=False)[:400])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_plg(p, run, base, sid, out):
    res = out.setdefault(sid, {}); topic = None
    for part, key in (('1007', '2027-10-07'), ('1014', '2027-10-14')):
        tag = '%s-%s' % (sid, part); r0 = res.setdefault(part, {}); fl = {'CLUB_public_law_group': True}
        if part == '1014': fl['Y3_PLG_TOPIC'] = topic or 'yes'   # 10/7 那一段沒玩出旗標＝【前置】當作回了「好。」（照樣測 10/14 那一句）
        b, pg, cdp, errs, r = await launch(p, run, base, key, 19.75, 'wancai', rels={'heroine_01': 'FRIEND', 'yu': 'FAMILIAR', 'classmate_bohan': 'FAMILIAR'}, flags=fl, quiet=False,
                                          label=tag + '（週四 19:45 萬才館大廳；參加過公法讀書會＝CLUB_public_law_group%s；事件系統開著）' % (('；10/7 玩出來的 Y3_PLG_TOPIC＝%s' % topic) if (part == '1014' and topic) else ('；【前置】Y3_PLG_TOPIC＝yes（10/7 那一段沒玩出來）' if part == '1014' else '')))
        try:
            await drive(pg, cdp, run, max_s=30, label=tag)
            door = await L.find_it(pg, '研討室 A')
            ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'] + 0.6, 0.9, '二樓研討室 A 門口', lv=1, max_s=600)
            for _ in range(60):   # 社課 20:00：門口等到開始前（照玩家，時間照走）
                if (await pg.evaluate("GAME.G.hour")) >= 19.95: break
                await pg.wait_for_timeout(3000)
            n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
            ops = await opts(pg); r0['door'] = ops
            k = next((i for i, o in enumerate(ops) if o.startswith('參加：公法讀書會')), None)
            run.check('%s：走到二樓研討室 A 門口、按門有「參加：公法讀書會」' % tag, ok and k is not None, json.dumps({'door': door, 'opts': ops}, ensure_ascii=False)[:300])
            if k is None: continue
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
            await drive(pg, cdp, run, picks=['我還不會'], max_s=240, label=tag)
            T = texts(await log_since(pg, n0)); r0['log'] = T[:14]; F = await pg.evaluate("({t:GAME.G.flags.Y3_PLG_TOPIC||null, l:GAME.G.flags.Y3_PLG_LEAD||null})"); r0['flags'] = F
            if part == '1007':
                topic = F['t']
                run.check('%s：散會以安「下週的題目，你帶。」→「我還不會。」→「不會才要帶。」（Y3_PLG_TOPIC＝notyet）' % tag,
                          '下週的題目，你帶。' in T and '不會才要帶。' in T and topic == 'notyet', json.dumps({'T': T[:10], 'F': F}, ensure_ascii=False)[:500])
            else:
                L1 = '（你講了十五分鐘。以安只問了一個問題：「理由呢？」你答了。她在手帳上畫了一個勾。）'
                run.check('%s：10/14 讀書會＝%s' % (tag, L1), L1 in T and F['l'] is not None, json.dumps({'T': T[:10], 'F': F}, ensure_ascii=False)[:500])
        finally: await finish_page(run, tag, r0, errs, b)


@guard
async def s_bohan(p, run, base, sid, out):
    res = out.setdefault(sid, {}); W = ['民訴甲上第三章，我的筆記寫錯一個條號。', '改好了。你那份也改一下。']
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-10-08', 20.9, 'dorm', rels={'classmate_bohan': 'FAMILIAR'}, label=sid + '（10/8 週五 20:54；沒參加讀書會；有柏翰的聯絡方式）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:classmate_bohan'&&m.text===%s)" % json.dumps(W[1]), max_s=360, label=sid)
        M = await msgs(pg, 'p:classmate_bohan'); res['dm'] = M[-3:]
        run.check('%s：10/8 21:00 柏翰私訊「%s」' % (sid, '」「'.join(W)), ok and [m['text'] for m in M][-2:] == W and all(m['h'] >= 21.0 and m['d'] == '2027-10-08' for m in M[-2:]), json.dumps(M[-3:], ensure_ascii=False)[:300])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_sum(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    if sid == 'SUM1103': key, h, line, md = '2027-11-03', 15.0, '（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）', '11/3（三）'
    else: key, h, line, md = '2027-12-18', 18.33, '（期末考前的週末。總圖的位子早上八點就沒了。）', '12/18（六）'
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, 'dorm', label=sid + '（%s %s 在宿舍）' % (key, '15:00，手機「等到晚上」' if sid == 'SUM1103' else '18:20，在房間等到 18:30'))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); n0 = await log_len(pg)
        if sid == 'SUM1103': await skip(pg, cdp, '等到晚上', sid)
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［日期卡］'&&x.t.includes(%s))" % json.dumps(line), max_s=420, label=sid)
        await pg.wait_for_timeout(1500); await run.shot(pg, '%s_card' % sid)
        cards = [x for x in await log_since(pg, n0) if x['n'] == '［日期卡］']; res['cards'] = cards
        hit = [c for c in cards if line in c['t']]
        run.check('%s：摘要日的日期卡（%s…）＋「%s」' % (sid, md, line), ok and bool(hit) and hit[0]['t'].startswith(md) and float(hit[0]['at'].split()[1]) >= 18.5, json.dumps(cards, ensure_ascii=False)[:400])
        await wait_for(pg, cdp, run, "false", max_s=60, label=sid)
        cards2 = [x for x in await log_since(pg, n0) if x['n'] == '［日期卡］' and line in x['t']]
        F = await pg.evaluate("GAME.G.flags.Y3_SUMS||null"); res['Y3_SUMS'] = F
        run.check('%s：只出一次（之後沒有第二張；Y3_SUMS 記了 %s）' % (sid, key), len(cards2) == 1 and bool(F) and key in F, json.dumps({'n': len(cards2), 'Y3_SUMS': F}, ensure_ascii=False))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_noclass(p, run, base, sid, out):
    res = out.setdefault(sid, {}); W = ['沒課的一週', '我睡了三天']
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-11-05', 21.85, 'dorm', rels={'yu': 'FAMILIAR'}, groups=(NT,), label=sid + '（11/5 週五 21:51；在麵店團）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.text===%s)" % json.dumps(W[1]), max_s=360, label=sid)
        M = [m for m in await msgs(pg, 'g:noodle_team') if m['text'] in W]; res['grp'] = M
        run.check('%s：11/5 22:00 群組 Alison（yu）「沒課的一週」「我睡了三天」' % sid, ok and [m['text'] for m in M] == W and all(m['from'] == 'yu' and m['h'] >= 22.0 for m in M), json.dumps(M, ensure_ascii=False)[:300])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_lastnoodle(p, run, base, sid, out):
    res = out.setdefault(sid, {}); L1 = '（期末前最後一次週四麵店。大家都帶了講義，沒有人翻開。）'
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-12-08', 20.9, 'dorm', rels={'zhe': 'FAMILIAR'}, groups=(NT,), quiet=False, label=sid + '（12/8 週三 20:54 宿舍；在麵店團；事件系統開著）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.text==='期末前最後一次麵店 禮拜四')", max_s=360, label=sid)
        M = [m for m in await msgs(pg, 'g:noodle_team') if m['text'] == '期末前最後一次麵店 禮拜四']; res['grp'] = M
        run.check('%s：12/8 21:00 群組阿哲「期末前最後一次麵店 禮拜四」' % sid, ok and len(M) == 1 and M[0]['from'] == 'zhe' and M[0]['h'] >= 21.0, json.dumps(M, ensure_ascii=False))
        ops, slept = await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, '等到傍晚', sid)
        for _ in range(40):
            if (await pg.evaluate("GAME.G.hour")) >= 17.0: break
            await wait_for(pg, cdp, run, "GAME.G.hour>=17.0", max_s=60, label=sid)
        n0 = await log_len(pg); went = await quick_go(pg, cdp, 'noodle')
        ok2, ch = await wait_for(pg, cdp, run, "!!((GAME.G.events||{}).done||{}).ev_y3_last_noodle&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=120, label=sid)
        T = texts(await log_since(pg, n0)); res['log'] = T[:6]
        run.check('%s：12/9（四）傍晚進麵店＝%s' % (sid, L1), went and ok2 and L1 in T, json.dumps({'went': went, 'state': await pg.evaluate(STATE), 'T': T[:4]}, ensure_ascii=False)[:400])
    finally: await finish_page(run, sid, res, errs, b)


TEXT_ITEMS = [  # [項目, 檔案, 要有的, 不能有的]
    ('#3 TA_NEWS_LIB 9/13', 'src/data/y2b_events.js', ['明天第一次上台。我要講二十分鐘。'], []),
    ('#4 子晴 Q10 演過 Q8b 的第一句', 'src/data/y2b_events.js', ['……上次跟你說的那個遊戲。'], []),
    ('#7 9/9 開學第一頓以安', 'src/data/r2y3a_events.js', ['（翻開手帳）讀書會八點。……我們先走。'], ['（翻開手帳）週四的讀書會照常。八點。']),
    ('#8 颱風夜阿凱', 'src/data/r2y3a_events.js', ['我們那棟停電了。你們這棟還有電。'], ['我們那層停電了。你們這層還有電。']),
    ('#9 以安 A5-L2', 'src/data/ladder.js', ['那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。', '那天晚上，我看了手機好幾次。'], ['柚子我跟室友分著吃完了。', '你那天晚上傳的訊息，我看了好幾次。']),
    ('#10 續約轉述', 'src/r2y3a3d.js', ['……新屋主說，他高中的時候也來這裡吃過麵。'], ['他小時候也來這裡吃過麵。']),
    ('#12 K15 選項', 'src/data/r2y3a_events.js', ['刑訴老師昨天點了後面三排。'], ['「刑訴老師點了後面三排。」']),
    ('#13 K15 可昕', 'src/r2y3a3d.js', ['我七點要回學校。'], ['我七點有課。']),
    ('#14 CW_SNEEZE 可昕', 'src/story3d.js', ['……我下週也期中，二十六號考第一科。'], ['……我這週也期中，二十六號考第一科。']),
    ('#17 學姊感冒週', 'src/story3d.js', ['你兩天沒出門了吧。……我猜的。'], []),
    ('#18 日本路線選項', 'src/data/ladder.js', ['那我們在日本找一家麵店。', '我們同一班。', '……那我十點去機場。送兩個。'], []),
    ('#20 臺灣路線 11/17、11/18', 'src/story3d.js', ['嗯。大四還沒開始，我想在這裡過。', '（你想，大四還沒開始。你想在這裡過。）'], ['臺灣的大四也還沒過完'])]
TEXT_JS = """(async items=>{ const out=[]; const cache={}; for(const [k,f,yes,no] of items){ if(!(f in cache)){ try{ cache[f]=(await (await fetch(f)).text()).replace(/\\/\\*[\\s\\S]*?\\*\\//g,''); }catch(e){ cache[f]=''; } } const s=cache[f];   /* 註解拿掉（註解裡會寫改之前的舊句）*/
  out.push({k,f,miss:yes.filter(t=>!s.includes(t)),still:no.filter(t=>s.includes(t))}); } return out; })"""
LOGIC_JS = """(()=>{ const r={}; const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}; const at=(k,h)=>{ G.day=STORY.dayOfKey(k); G.hour=h; G.weekday=CALENDAR.dateOf(G.day).wd%7; };
  try{ at('2027-11-03',12); r.fang=GAME.whereText?GAME.whereText('npc_fangyt'):null;
    at('2027-09-14',17.75); r.yt0914a=GAME.whereText('heroine_03'); at('2027-09-14',18.75); r.yt0914b=GAME.whereText('heroine_03');
    r.y1only=['ev_sis_w1','ev_grad_info_session','ev_fangyt_pothos','ev_prof_zhou_office'].map(id=>{ const e=STORY_EVENTS.find(x=>x.id===id); return [id,e?e.term:null]; });
    r.k52=!!(STORY.LADDER_SKIP&&STORY.LADDER_SKIP['K5-L2']); r.y57=STORY.LADDER_WEEK_IF?STORY.LADDER_WEEK_IF['Y5-L7']:null; r.a51=STORY.LADDER_WEEK_IF?STORY.LADDER_WEEK_IF['A5-L1']:null;
  } finally { Object.assign(G,keep); } return r; })()"""


@guard
async def s_texts(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-10-20', 12.0, 'dorm', label=sid + '（只讀資料：遊戲載入的原始檔＋頁面裡的作息查詢；不是玩）')
    try:
        R = await pg.evaluate(TEXT_JS + "(%s)" % json.dumps(TEXT_ITEMS, ensure_ascii=False)); res['texts'] = R
        for x in R: run.check('%s：【讀資料，不是玩】AA_376 %s（%s）' % (sid, x['k'], x['f']), not x['miss'] and not x['still'], json.dumps({'缺': x['miss'], '還在': x['still']}, ensure_ascii=False))
        Lg = await pg.evaluate(LOGIC_JS); res['logic'] = Lg
        run.check('%s：【讀資料】#16 方奕廷 11/3 上山（手機寫「上山做調查（沒有訊號）」）' % sid, '上山' in (Lg.get('fang') or ''), json.dumps(Lg.get('fang'), ensure_ascii=False))
        run.check('%s：【讀資料】#15 9/14 語彤 17:45 不在麵店、18:45 在麵店（麵店作息 18:30 起）' % sid, '麵店' not in (Lg.get('yt0914a') or '') and '麵店' in (Lg.get('yt0914b') or ''), json.dumps([Lg.get('yt0914a'), Lg.get('yt0914b')], ensure_ascii=False))
        run.check('%s：【讀資料】#19 四件初識事件限大一（term Y1S1、Y1S2）' % sid, all(t == ['Y1S1', 'Y1S2'] for _, t in Lg.get('y1only', [])), json.dumps(Lg.get('y1only'), ensure_ascii=False))
        run.check('%s：【讀資料】#6 K5-L2 有條件、#10 Y5-L7 第 14～15 週、#11 A5-L1 第 2 週起' % sid, Lg.get('k52') and (Lg.get('y57') or {}).get('week') == [14, 15] and (Lg.get('a51') or {}).get('week', [0])[0] == 2, json.dumps(Lg, ensure_ascii=False)[:300])
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['YT_THU', 'CRIMPRO', 'TA_LIB', 'SUM1103', 'SUM1218', 'TUE_NOODLE', 'RIVER_GO', 'RIVER_NO', 'PLG', 'BOHAN', 'NOCLASS', 'LASTNOODLE', 'K17_FRESH', 'K17_HEARD', 'TEXTS']
FN = {'YT_THU': s_yt_thu, 'CRIMPRO': s_crimpro, 'TA_LIB': s_ta_lib, 'SUM1103': s_sum, 'SUM1218': s_sum, 'TUE_NOODLE': s_tue_noodle, 'RIVER_GO': s_river, 'RIVER_NO': s_river,
      'PLG': s_plg, 'BOHAN': s_bohan, 'NOCLASS': s_noclass, 'LASTNOODLE': s_lastnoodle, 'K17_FRESH': s_k17, 'K17_HEARD': s_k17, 'TEXTS': s_texts}


async def main():
    run = L.Run('aa376', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa376.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
