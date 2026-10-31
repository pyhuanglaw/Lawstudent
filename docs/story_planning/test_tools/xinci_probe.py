"""BB-B 10-30：XINCI-REWRITE-1030（LAWWW-B 21:54 P2，n25_xinci547；開發分支 3f1e7585f；AA_547 芯慈新個性＋AA_546 第 7 節 NO-COMPARE 第二批）。
走真實流程（不用 ?turbo）；日期、地點、關係是【前置】（使用者存檔改日子，讀檔後設關係），每一個都標出來。Playwright 手機橫向模擬，不是 iPhone。
  DAY1  大一上第 1 週週一 9/1 憲法（上）上課前：手機「今天」「直接去上課」→ 課前「第一排」三句
  COPY_REAL  大一下第 7 週週三 12:15 總圖大廳一樓影印機旁，認識以安、芯慈：照玩家站著等（不做任何捷徑）——看會不會演（SUP497.bind 只在宥辰那一場呼叫）
  COPY_BACK／COPY_RPS  同上（890f8f3f7 起不再 bind；XC_BIND=1 才用舊捷徑）：「（排到她們後面）」／「「猜拳？」」兩支
  C2  大一下第 6 週週二 15:30 總圖閱覽室：「和吳芯慈說話」→ 選「妳為什麼要雙主修？」→ 兩句；人物頁「雙主修財金…」「爸媽都是律師…」
  C3A／C3B／C3C  大二上第 12 週週一 00:18 日日便利：「凌晨的便利商店」三個選項各一次
  C3B1  同一天 00:03 總圖 B1：「（陪她走到門口）」
  C3FIX  沒演慈 3：大二下第 2 週週一 2027-03-01 20:50 → 21:00 私訊「……我欠你一杯咖啡。」→ 回「好。」→【前置】跳到 3/2 15:45 Café → 和她說話：「你來了。」「（坐下來）」「四點半了。我要去上財管。」
  DAD  2027-04-23 17:25 法律系館A門口：「你們民法教到哪裡了？」三個選項；有聯絡方式＝當晚 22:00「我爸說你很有禮貌。……」
  C5  2027-11-29（大三上第 13 週週一）18:05 總圖三樓：遠版旁白 → 走到以安、芯慈旁邊 → 分工抄筆記三個選項
  C6  2028-05-04 18:55 阿鳳麵店：19:00「暑期實習」三個選項；人物頁「大三下，她申請上國際所的暑期實習，金融那一組。」
  ZRFEED  2027-03-24（大二下第 5 週週三）21:55，芷若 FRIEND＋聯絡方式：22:07 動態「新來的那個，三天就把常客的名字記起來了。」→ 留言「好厲害。」
  ZRL3  2027-03-23（週二）10:20 傅鐘附近，【前置】芷若大二下閒聊停在第 2 句：和芷若說話 → Z4-L3「……她記得比我那時候快。我好高興。」
  每一場都查：說的話裡沒有「第二名」「第一名」「補習班」「排名出來了。我第一。」「芯慈跟以安吵架了」
用法：LW_TESTS=<工作樹>/tests SCEN=DAY1,... python3 xinci_probe.py <URL>/index.html <輸出資料夾> <使用者存檔>"""
import os, sys, json, asyncio, time, re, math
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
  if(GAME.titleCard){ const c2=GAME.titleCard; GAME.titleCard=function(a,b){ try{ window.__LOG.push({n:'［日期卡］', t:String(a||'')+'｜'+String(b||''), at:at()}); }catch(e){} return c2.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, until:m.ask&&m.ask.until!=null?m.ask.until:null})))"""
ALLMSG = """(re=>(GAME.G.msgs||[]).filter(m=>new RegExp(re).test(m.tag||'')).map(m=>({th:m.th, d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||'')})))"""
PEND = """(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); if(!m) return null; const u=m.ask.until; return {until:u, untilKey:u!=null?CALENDAR.dateOf(Math.floor(u/24)).key+' '+(u-24*Math.floor(u/24)).toFixed(2):null, opts:m.ask.opts.map(o=>o.t)}; })"""
OUTQ = """(re=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>new RegExp(re).test(q.id||'')).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, day:q.day, wd:CALENDAR.dateOf(q.day).wd%7, h:+(+q.h).toFixed(3), state:q.state, title:q.title||'', place:q.place||''})))"""
SETUP = """(([rels,dating,flags,groups,mems])=>{ const G=GAME.G, F=G.flags; const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
  const day0=STORY.dayOfKey('2025-09-24'); G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id), v=V[rels[id]]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0; }
  for(const g of groups||[]) if(!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))) PHONE.join(G,g[0],g[1]);
  Object.assign(F,flags||{});
  for(const id of dating||[]){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,70); R.trust=Math.max(R.trust|0,60); R.comf=Math.max(R.comf|0,60); R.rom=70; R.npcRom=70; if(G.contacts[id]==null) G.contacts[id]=day0; SOCIAL.remember(id,'FIRST_MET',''); }
  for(const [id,tag] of mems||[]) SOCIAL.remember(id,tag,'');
  G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true,noodle:true,wancai:true,gongguan:true,campus:true,classroom:true,wenzhou:true});
  const ids=Object.keys(rels).concat(dating||[]);
  return {stages:Object.fromEntries(ids.map(id=>[id,SOCIAL.stage(id)])), knows:Object.fromEntries(['classmate_peishan','classmate_bohan','zhe'].map(id=>[id,!!(STORY.knows&&STORY.knows(id,G))])),
    partners:(typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]), groups:(groups||[]).map(g=>[g[0],!!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))]), route:STORY.route?STORY.route(G):null}; })"""
NPC = """(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.some(id=>x.charId===id||x.id===id)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })"""
LAB = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'JP_RETURNED': {'$day': '2028-08-05'}, 'AN_SENDOFF': 'together'}
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': {'$day': '2028-08-02'}, 'US_RETURNED': {'$day': '2028-12-23'}}


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
        s = await L.state(pg)
        if await pg.evaluate(cond) and not (s['dlg'] or s['choices'] or s['busy']): return True, ch   # n25：done 可能在事件一開始就記，等對話演完才回
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
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
    await pg.wait_for_timeout(1500); await run.shot(pg, '%s_dm_answered' % label); say('   %s 手機回 %s：「%s」' % (label, ask_id, got)); await L.phone_away(pg, cdp); return got


FALLBACK = {'等到中午': ['等到中午', '等到下一堂課前'], '等到傍晚': ['等到傍晚', '等到下午'], '等到下午': ['等到下午'], '等到晚上': ['等到晚上', '等到傍晚']}


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


async def talk(pg, cdp, run, ids, names, picks=None, label=''):
    """走到那個人旁邊，互動鈕是「和〇〇說話」才按（names：她可能的稱呼，例：以安／小安），對話照 picks 點完（說完的「就這樣」）；回傳（選項紀錄, 互動鈕的字）"""
    lab = ''; name = names[0]; hit = lambda s: '說話' in s and any(n in s for n in names)
    for k in range(3):
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
        if not pos: say('   %s 不在這一區' % name); return None, ''
        STOP = lambda s: s['dlg'] or s['choices'] or s['busy']   # n25 C3FIX：走近時事件就開始，go_to 沒給 stop 會自動點掉、選第一個
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.2, name, max_s=90, lv=pos[2], stop=STOP)
        for j in range(6):
            st = await L.state(pg)
            if st['dlg'] or st['choices'] or st['busy']:
                ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label); return ch, '（走近就開始）'
            lab = await pg.evaluate(LAB)
            if hit(lab): break
            pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
            if pos:   # n25 ZRL3：她跟一群人走在一起，互動鈕抓到旁邊不認識的女生——繞著她換方向靠近（0.7 m，四個方向輪流）
                ang = j * math.pi / 2; tx, tz = pos[0] + 0.7 * math.cos(ang), pos[1] + 0.7 * math.sin(ang)
                await L.go_to(pg, cdp, run, tx, tz, 0.35, name, max_s=30, lv=pos[2], stop=STOP)
            await pg.wait_for_timeout(500)
        say('   %s 互動鈕：「%s」' % (label, lab))
        if hit(lab):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label)
            return ch, lab
    return None, lab


def texts(log):
    return [x['t'] for x in log if x['n'] not in ('［選項］', '［字幕］', '［日期卡］')]


async def log_since(pg, n0):
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def log_len(pg):
    return len(await pg.evaluate("window.__LOG||[]"))


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def dayk(pg, key):
    return await pg.evaluate("STORY.dayOfKey('%s')" % key)


async def launch(p, run, base, key, h, zone, preflags=None, rels=None, dating=(), flags=None, quiet=True, label='', groups=(), mems=()):
    """路線旗標先寫進存檔再讀（日本、美國路線讀檔的地方才對）；讀檔後在頁面裡設關係、交往、其他旗標"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await dayk(pg, key)
    for k, kk in ROOMS:
        dd = await dayk(pg, kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_') and k[7:] not in dating: F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    for k, v in (preflags or {}).items(): F[k] = (await dayk(pg, v['$day'])) if isinstance(v, dict) and '$day' in v else v
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, list(dating), flags or {}, [list(g) for g in groups], [list(m) for m in mems]]))
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（%s；讀檔前拿掉其他人的交往）；路線旗標 %s；關係 %s；交往 %s；旗標 %s → %s' % (
        label, key, h, zone, 'quiet_events' if quiet else '事件系統開著', json.dumps(preflags or {}, ensure_ascii=False), json.dumps(rels or {}, ensure_ascii=False),
        list(dating) or '—', json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)))
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


def J(x, n=400):
    return json.dumps(x, ensure_ascii=False)[:n]





# ---------------------------------------------------------------- 柏翰（AA_546）
BH = 'classmate_bohan'
SCORE_RE = re.compile(r'\d+\s*分|八十一|第六|名次|第[一二三四五六七八九十]+名|不想說|排名')
CHOICE_JS = "(()=>{ const ch=document.getElementById('choices'); return ch&&!ch.classList.contains('hide')?[...ch.querySelectorAll('button')].map(b=>b.textContent.trim()):[]; })()"
DONE = "(id=>!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id]))"
NOPAREN = lambda t: t.strip().strip('（）()')


def has_seq(T, seq):
    """seq 的每一句照順序出現在 T（旁白的括號拿掉比）"""
    k = 0; TT = [NOPAREN(x) for x in T]
    for x in TT:
        if k < len(seq) and x == NOPAREN(seq[k]): k += 1
    return k == len(seq)


def caps(log):
    return [x['t'] for x in log if x['n'] == '［字幕］']


def choice_sets(log):
    return [json.loads(x['t']) for x in log if x['n'] == '［選項］']


async def day_of_class(pg, term, week, cid):
    return await pg.evaluate("""(([t,w,c])=>{ const T=CALENDAR.TERMS.find(x=>x.id===t); const a=STORY.dayOfKey(T.start); for(let d=a+(w-1)*7; d<a+w*7; d++){ const it=(CLS.dayItems(GAME.G,d)||[]).find(x=>x.c&&x.c.id===c&&!x.exam); if(it) return {d, key:CALENDAR.dateOf(d).key, t0:it.t0, t1:it.t1, k:it.key}; } return null; })""", [term, week, cid])


async def day_in_week(pg, term, week, wd):
    return await pg.evaluate("""(([t,w,wd])=>{ const T=CALENDAR.TERMS.find(x=>x.id===t); const a=STORY.dayOfKey(T.start); for(let d=a+(w-1)*7; d<a+w*7+7; d++){ const x=CALENDAR.dateOf(d); if(x.wd%7===wd&&CALENDAR.termOf(d)&&CALENDAR.termOf(d).week===w) return x.key; } return null; })""", [term, week, wd])


async def go_class(pg, cdp, run, k, label):
    """手機「今天」按「直接去上課」（讀檔後先把對話點完；找不到就把手機收起來）"""
    bt = None
    for _ in range(4):
        await drive(pg, cdp, run, max_s=40, label=label)
        await phone_tab(pg, cdp, 'today')
        bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })(%s)" % json.dumps(k))
        if bt: break
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)
    if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % k)
    else: await L.phone_away(pg, cdp)
    say('   %s 手機「今天」：%s' % (label, bt)); return bt


async def preday(pg, run, label, js):
    r = await pg.evaluate("(()=>{ const G=GAME.G, F=G.flags; G.events=G.events||{}; G.events.done=G.events.done||{}; %s; return {BOHAN_SCORE:F.BOHAN_SCORE||null, stage:SOCIAL.stage('classmate_bohan'), done:Object.keys(G.events.done).filter(k=>/bohan/.test(k))}; })()" % js)
    run.setup('【前置】%s：%s' % (label, J(r))); return r



# ---------------------------------------------------------------- 芯慈（AA_547）
XC = 'classmate_xinci'; AN = 'heroine_01'; ZR = 'heroine_02'
BANNED = ['第二名', '第一名', '補習班', '排名出來了。我第一。', '芯慈跟以安吵架了']
DONE = "(id=>!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id]))"
NOPAREN = lambda t: t.strip().strip('（）()')
WHO = "(id=>{ try{ return WHOIS.lines(GAME.G,id); }catch(e){ return ['ERR '+e.message]; } })"


def has_seq(T, seq):
    k = 0; TT = [NOPAREN(x) for x in T]
    for x in TT:
        if k < len(seq) and x == NOPAREN(seq[k]): k += 1
    return k == len(seq)


def caps(log):
    return [x['t'] for x in log if x['n'] == '［字幕］']


def choice_sets(log):
    return [json.loads(x['t']) for x in log if x['n'] == '［選項］']


def banned_check(run, sid, T):
    bad = [x for x in T if any(b in x for b in BANNED)]
    run.check('%s：說的話沒有「第二名」「第一名」「補習班」「排名出來了。我第一。」「芯慈跟以安吵架了」' % sid, not bad, J(bad))


async def go_class(pg, cdp, run, k, label):
    bt = None
    for _ in range(4):
        await drive(pg, cdp, run, max_s=40, label=label)
        await phone_tab(pg, cdp, 'today')
        bt = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>b.dataset.go===k); return e?(e.textContent||'').trim():null; })(%s)" % json.dumps(k))
        if bt: break
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(1500)
    if bt: await L.tap(pg, cdp, '#phoneBody [data-go="%s"]' % k)
    else: await L.phone_away(pg, cdp)
    say('   %s 手機「今天」：%s' % (label, bt)); return bt


async def near_wait(pg, cdp, run, sid, ev, x, z, lv, picks, max_s=600, r=1.2):
    n0 = await log_len(pg)   # n25：先記再走（走近時事件可能就開始）；go_to 有對話就停，交給 wait_for 照 picks 選
    await L.go_to(pg, cdp, run, x, z, r, sid, max_s=240, lv=lv, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])
    ok, ch = await wait_for(pg, cdp, run, DONE + "('%s')" % ev, max_s=max_s, picks=picks, label=sid)
    lg = await log_since(pg, n0); return ok, ch, texts(lg), caps(lg), choice_sets(lg)


async def report(pg, run, sid, res, T, CS, C=None):
    res.update({'said': T, 'choices': CS, 'caps': C}); await run.shot(pg, '%s_after' % sid)
    say('   %s 說的：%s；選項 %s；字幕 %s' % (sid, J(T[-16:], 1200), J(CS[-3:]), J((C or [])[-4:])))
    banned_check(run, sid, T)


@guard
async def s_day1(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    # n25：使用者存檔是舊開局（主線第一天＝第三週），9/1 沒有課（CLS.dayItems 空、STORY.week1Start false），「第一排」只有新開局才有
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.goto(URL); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnNewLaw'); await pg.wait_for_timeout(4000)
        st0 = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'), stage:GAME.G&&GAME.G.stage, key:GAME.G&&CALENDAR.dateOf(GAME.G.day).key}))()")
        run.check('%s：前置——標題「從法律系開始」真的開局' % sid, not st0['title'], J(st0))
        snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, '2025-09-01')
        snap.update({'day': d, 'hour': 8.6, 'zone': 'campus', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
        # n25_xinci_b：按開局 4 秒時還在回顧（day＝預設 9/17），選 1 的旗標要等 8/29 搬宿舍（STORY.startLawWeek1）才設——照它設 LAW_START_DAY、MAIN_D1
        lw = await pg.evaluate("(()=>({d0:STORY.dayOfKey('2025-08-29'), m1:STORY.MAIN_D1_NEW}))()")
        snap.setdefault('flags', {}).update({'LAW_START_DAY': lw['d0'], 'MAIN_D1': lw['m1']})
        await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
        w1 = await pg.evaluate("(()=>({week1Start:STORY.week1Start?STORY.week1Start(GAME.G):null, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}))()")
        run.setup('【前置】%s：新開局（按開局時 %s）的進度直接跳到 2025-09-01 08:36 校園，照 STORY.startLawWeek1 設 LAW_START_DAY＝8/29、MAIN_D1＝主線第一天（中間的宿營、搬宿舍沒有照玩家走）；%s' % (sid, st0.get('key'), J(w1)))
        it = await pg.evaluate("(()=>{ const it=(CLS.dayItems(GAME.G)||[]).find(x=>x.c&&x.c.kind==='required'&&!x.exam); return it?{k:it.key, t0:it.t0, name:it.c.name}:null; })()"); res['class'] = it
        run.check('%s：前置——那一天第一堂必修（%s）' % (sid, J(it)), bool(it), J(it))
        if not it: return
        bt = await go_class(pg, cdp, run, it['k'], sid)
        run.check('%s：手機「今天」有「直接去上課」' % sid, bool(bt), J(bt))
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xc_day1')", max_s=900, picks=['坐'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); await report(pg, run, sid, res, T, choice_sets(lg), caps(lg))
        run.check('%s：課前演「第一排」（ev_xc_day1 done）' % sid, ok, J(ch[-2:]))
        run.check('%s：以安「妳好，我是沈以安。」→ 芯慈「吳芯慈。」→「（她把抄好的課表往中間推了一點，讓以安也看得到。）」' % sid,
                  has_seq(T, ['妳好，我是沈以安。', '吳芯慈。', '（她把抄好的課表往中間推了一點，讓以安也看得到。）']), J(T[:10], 600))
    finally: await finish_page(run, sid, res, errs, b)


COPYP = {'COPY_BACK': '（排到她們後面）', 'COPY_RPS': '「猜拳？」'}
COPYS = {'COPY_BACK': ['（最後是以安先印。她印完，順手把芯慈那一份也放進去。）'], 'COPY_RPS': ['下次我先。', '好。']}


@guard
async def s_copy(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-04-08', 12.2, 'library_hall', rels={AN: 'FAMILIAR', XC: 'FAMILIAR'}, quiet=False, label=sid + '（大一下第 7 週週三 12:12 總圖大廳；認識以安、芯慈）')
    try:
        n0 = await log_len(pg)
        await L.go_to(pg, cdp, run, 10.35, 3.2, 0.8, '影印機旁', max_s=240, lv=0, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])   # n25：沒給 stop 時 go_to 自動點掉對話、選第一個
        pos = await pg.evaluate("(()=>{ const P=GAME.E.player; return {x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), lv:P.lv|0, bound:!!(SUP497.bind&&SUP497.bind()), due:!!(SUP497.copyDue&&SUP497.copyDue(GAME.G)), h:+(+GAME.G.hour).toFixed(2)}; })()")
        res['pos'] = pos; say('   %s 站到影印機旁：%s' % (sid, J(pos)))
        if sid == 'COPY_REAL':
            ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xc_copy')", max_s=300, label=sid)
            pos2 = await pg.evaluate("(()=>({bound:!!(SUP497.bind&&SUP497.bind()), due:!!(SUP497.copyDue&&SUP497.copyDue(GAME.G)), h:+(+GAME.G.hour).toFixed(2)}))()")
            await run.shot(pg, '%s_after' % sid)
            run.check('%s：照玩家（不做捷徑）站在影印機旁、copyDue 成立的時候演「影印機」（ev_xc_copy）' % sid, ok, J({'before': pos, 'after': pos2}))
            return
        # 890f8f3f7 起（BUG-SUP497-BIND-1030）沒有 GMr 時用 GAME.E：不再 SUP497.bind，照玩家站著等；XC_BIND=1 才用舊捷徑
        if os.environ.get('XC_BIND') == '1':
            run.setup('【捷徑】SUP497.bind(GAME)'); await pg.evaluate("SUP497.bind(GAME)")
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xc_copy')", max_s=300, picks=[COPYP[sid]], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS, caps(lg))
        run.check('%s：不做捷徑、站在影印機旁等，演「影印機」' % sid, ok, J({'pos': pos, 'ch': ch[-2:]}))
        if not ok: return
        run.check('%s：三個選項「「我幫妳們一起印。」」／「（排到她們後面）」／「「猜拳？」」' % sid, any(c == ['「我幫妳們一起印。」', '（排到她們後面）', '「猜拳？」'] for c in CS), J(CS[-2:]))
        run.check('%s：選 %s → %s' % (sid, COPYP[sid], '／'.join(COPYS[sid])), has_seq(T, COPYS[sid]), J(T[-6:]))
    finally: await finish_page(run, sid, res, errs, b)


YC = 'classmate_youchen'
ELEV_OPTS = ['「我幫你擋。」', '「我等一下有課。」']
ELEV_OPEN = ['（電梯門開了。他沒有進去，手上拿著一支小小的錄音機。門關上。他按了一下，門又開了。）', '……啊，你。幫我一個忙。', '我要錄電梯「叮」那一聲，可是一直有人。中午十二點十分以後，大概有五分鐘沒有人。你在一樓樓梯口幫我擋一下。']
ELEV_DONE_T = ['（你站在樓梯口。一個學姊要走過來，你說了一句「電梯在維修」，她就去走樓梯了。）', '（叮。）', '……錄到了。', '你剛剛騙那個學姊的那一句，我也錄到了。我會剪掉。……大概。']
SONG5 = "PHONE.postAt(GAME.G,{th:'p:classmate_youchen',from:'classmate_youchen',text:'（前置）',tag:'yc_song_5'},STORY.termDay('Y2S1',4,5),23.5)"
ELEVQ = "(()=>{ const r=SIDEQ.get(GAME.G,'YQ_ELEV'); return r?{state:r.state, by:r.by, byKey:r.by!=null?CALENDAR.dateOf(r.by).key:null}:null; })()"


@guard
async def s_elev(p, run, base, sid, out):
    # 宥辰兩場電梯（BUG-SUP497-BIND-1030 修好以後，讀檔不 bind 也要演）：開口＝大二上第 7 週週二 15:30 霖澤館一樓；做完＝隔天 12:10～12:20
    res = out.setdefault(sid, {})
    if sid == 'ELEV_ASK':
        b, pg, cdp, errs, r = await launch(p, run, base, '2026-10-20', 15.5, 'linze', rels={YC: 'FAMILIAR'}, quiet=False, label=sid + '（大二上第 7 週週二 15:30 法律系館A 一樓；跟宥辰 FAMILIAR、有聯絡方式）')
    else:
        b, pg, cdp, errs, r = await launch(p, run, base, '2026-10-21', 12.05, 'linze', rels={YC: 'FAMILIAR'}, quiet=False, label=sid + '（大二上第 7 週週三 12:03 法律系館A 一樓；跟宥辰 FAMILIAR）')
    try:
        await pg.evaluate(SONG5); run.setup('【前置】宥辰第 5 則歌的私訊（tag yc_song_5）放進手機（第 4 週週五 23:30）')
        if sid == 'ELEV_DONE':
            await pg.evaluate("SUP497.acceptElev(GAME)"); run.setup('【前置】SUP497.acceptElev(GAME)：順手的事「電梯」已答應（期限這一週週五）；%s' % J(await pg.evaluate(ELEVQ)))
        bound = await pg.evaluate("!!SUP497.bind()"); run.note('%s：讀檔以後有沒有人 bind（應該沒有）：%s' % (sid, bound))
        n0 = await log_len(pg)
        await L.go_to(pg, cdp, run, 4.6, -4.4, 0.6, '一樓電梯前', max_s=200, lv=0, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])
        evid = 'ev_yc_elev_ask' if sid == 'ELEV_ASK' else 'ev_yc_elev_done'
        ok, ch = await wait_for(pg, cdp, run, DONE + "('%s')" % evid, max_s=900 if sid == 'ELEV_DONE' else 300, picks=[ELEV_OPTS[0]], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS)
        q = await pg.evaluate(ELEVQ); fl = await pg.evaluate("GAME.G.flags.YC_ELEVATOR||null"); st = await pg.evaluate(STATE)
        res.update({'q': q, 'flag': fl, 'bound': bound})
        run.check('%s：讀檔以後沒有人 bind（%s），照玩家站在電梯前也演（%s done）' % (sid, bound, evid), ok and not bound, J({'ch': ch[-2:], 'at': st}))
        if not ok: return
        if sid == 'ELEV_ASK':
            run.check('ELEV_ASK：三句開場＋兩個選項「「我幫你擋。」」／「「我等一下有課。」」', has_seq(T, ELEV_OPEN) and any(c == ELEV_OPTS for c in CS), J({'T': T[:6], 'CS': CS[-2:]}, 700))
            run.check('ELEV_ASK：選「我幫你擋。」→ 順手的事 YQ_ELEV 掛上（open、期限 2026-10-23 週五）', bool(q) and q['state'] == 'open' and q['byKey'] == '2026-10-23', J(q))
        else:
            run.check('ELEV_DONE：12:10～12:20 之間演、四句（擋學姊、叮、錄到了、我會剪掉）', has_seq(T, ELEV_DONE_T) and 12 + 10 / 60 - 0.02 <= st['h'] < 12 + 21 / 60, J({'T': T[:6], 'h': st['h']}, 700))
            run.check('ELEV_DONE：記 YC_ELEVATOR、順手的事做完（done）', fl is True and bool(q) and q['state'] == 'done', J({'flag': fl, 'q': q}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_c2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-03-31', 15.5, 'library', rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（大一下第 6 週週二 15:30 總圖閱覽室；跟芯慈 FAMILIAR）')
    try:
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, [XC], ['芯慈', '吳芯慈'], picks=['妳為什麼要雙主修？'], label=sid)
        ok = await pg.evaluate(DONE + "('ev_xinci_double')")
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS)
        run.check('%s：和吳芯慈說話＝慈 2（ev_xinci_double done）' % sid, ok, J({'lab': lab, 'ch': ch}))
        if not ok: return
        run.check('%s：選「妳為什麼要雙主修？」→「我喜歡財金。看財報比看小說好看。」「……我爸媽都是律師。他們說，念我喜歡的就好。」' % sid,
                  any('「妳為什麼要雙主修？」' in c for c in CS) and has_seq(T, ['我喜歡財金。看財報比看小說好看。', '……我爸媽都是律師。他們說，念我喜歡的就好。']), J(T[-6:]))
        wl = await pg.evaluate(WHO + "('%s')" % XC); res['whois'] = wl
        run.check('%s：人物頁有「雙主修財金。她說看財報比看小說好看。」「爸媽都是律師，在永和開事務所。」，沒有改輔系' % sid,
                  '雙主修財金。她說看財報比看小說好看。' in wl and '爸媽都是律師，在永和開事務所。' in wl and not any('輔系' in x for x in wl), J(wl))
    finally: await finish_page(run, sid, res, errs, b)


C3P = {'C3A': '「妳家也是做這個的嗎？」', 'C3B': '「什麼時候開始喜歡的？」', 'C3C': '（陪她等咖啡）', 'C3B1': '（陪她走到門口）'}
C3S = {'C3A': ['不是。我爸媽都是律師。', '我從小在他們的會議室寫功課。法律聽得很熟，可是我比較喜歡這個。'],
       'C3B': ['國中。我幫我媽對過一次事務所的帳。', '對起來的時候，好像整間辦公室都安靜了。'],
       'C3C': ['（咖啡好了。她把第二杯推過來。）', '多按了一杯。不要浪費。'],
       'C3B1': ['（走到 B1 門口，她把手機的劇按了暫停。）', '……剩下的回家看。']}


@guard
async def s_c3(p, run, base, sid, out):
    res = out.setdefault(sid, {}); b1 = sid == 'C3B1'
    zone, hh, ev = ('library_b1', 24.05, 'ev_xinci_second_b1') if b1 else ('cvs', 24.28, 'ev_xinci_second')
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-11-23', hh, zone, rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（大二上第 12 週週一深夜 %s %s；跟芯慈 FAMILIAR）' % ('00:03' if b1 else '00:17', zone))
    try:
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([XC])); say('   %s 芯慈位置 %s' % (sid, J(pos)))
        run.check('%s：前置——芯慈在 %s' % (sid, zone), bool(pos), J(pos))
        if not pos: return
        ok, ch, T, C, CS = await near_wait(pg, cdp, run, sid, ev, pos[0], pos[1], pos[2], [C3P[sid]], max_s=420, r=2.0)
        await report(pg, run, sid, res, T, CS, C)
        run.check('%s：走到芯慈旁邊演慈 3（%s done）' % (sid, ev), ok, J(ch[-2:]))
        if not ok: return
        if not b1: run.check('%s：字幕標題「凌晨的便利商店」' % sid, '凌晨的便利商店' in C, J(C[-4:]))
        run.check('%s：「你也還沒睡。」「我在算財管的作業。……我喜歡數字對起來的那一下。」' % sid, has_seq(T, ['你也還沒睡。', '我在算財管的作業。……我喜歡數字對起來的那一下。']), J(T[:8], 500))
        third = '（陪她走到門口）' if b1 else '（陪她等咖啡）'
        run.check('%s：三個選項「「妳家也是做這個的嗎？」」／「「什麼時候開始喜歡的？」」／「%s」' % (sid, third), any(c == ['「妳家也是做這個的嗎？」', '「什麼時候開始喜歡的？」', third] for c in CS), J(CS[-2:]))
        run.check('%s：選 %s → %s' % (sid, C3P[sid], '／'.join(C3S[sid])), has_seq(T, C3S[sid]), J(T[-5:]))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_c3fix(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-03-01', 20.8, 'dorm', rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（大二下第 2 週週一 20:48 宿舍；跟芯慈 FAMILIAR＋聯絡方式；慈 3 三個版本都沒演）')
    try:
        ok, ch = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:classmate_xinci'&&/我欠你一杯咖啡/.test(m.text||''))", max_s=900, label=sid)
        ms = await msgs(pg, 'p:' + XC); res['msgs'] = ms[-4:]
        run.check('%s：21:00 私訊「明天下午四點，你有空嗎。兩點半 Café。……我欠你一杯咖啡。」' % sid, any(m['text'] == '明天下午四點，你有空嗎。兩點半 Café。……我欠你一杯咖啡。' for m in ms), J(ms[-3:]))
        if not ok: return
        ask = next((m for m in reversed(ms) if m.get('ask')), None)
        run.check('%s：回覆鍵「好。」／「明天不行。」' % sid, bool(ask) and ask['ask'] == ['好。', '明天不行。'], J(ask))
        aid = await pg.evaluate("(()=>{ const m=PHONE.pending(GAME.G).find(x=>x.th==='p:classmate_xinci'&&x.ask); return m?m.ask.id:null; })()")
        run.note('%s 要回覆的私訊 ask id：%s' % (sid, aid))
        await answer(pg, cdp, run, 'p:' + XC, aid, '好。', label=sid)
        fx = await pg.evaluate("(()=>({fix:GAME.G.flags.XC_FIX||null, inv:(GAME.G.invites||[]).filter(v=>/芯慈|xinci/.test(JSON.stringify(v))).map(v=>({label:v.label||v.title, h:v.h, day:v.day, zone:v.zone||v.place, ev:v.ev}))}))()")
        run.check('%s：回「好。」→ XC_FIX＝yes、約好 3/2 16:00 兩點半 Café' % sid, fx['fix'] == 'yes' and bool(fx['inv']), J(fx))
        snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, '2027-03-02')
        snap.update({'day': d, 'hour': 15.75, 'zone': 'cafe', 'pos': None, 'weekday': 2}); await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
        run.setup('[前置] 同一份進度跳到 2027-03-02（二）15:45 兩點半 Café（中間的時間沒有玩）')
        n0 = await log_len(pg)
        ch2, lab = await talk(pg, cdp, run, [XC], ['芯慈', '吳芯慈'], picks=['（坐下來）'], label=sid)
        if not await pg.evaluate(DONE + "('ev_xinci_second_day')"):
            await wait_for(pg, cdp, run, DONE + "('ev_xinci_second_day')", max_s=200, picks=['（坐下來）'], label=sid)
        ok2 = await pg.evaluate(DONE + "('ev_xinci_second_day')")
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS)
        run.check('%s：Café 和她說話演白天版（ev_xinci_second_day done）' % sid, ok2, J({'lab': lab, 'ch': ch2}))
        if not ok2: return
        run.check('%s：「你來了。」…第三個選項「（坐下來）」…結尾「四點半了。我要去上財管。」' % sid,
                  has_seq(T, ['你來了。', '我剛算完財管的作業。……我喜歡數字對起來的那一下。']) and any('（坐下來）' in c for c in CS) and has_seq(T, ['這杯我請。說好的。', '四點半了。我要去上財管。']), J(T[-8:]))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_dad(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-04-23', 17.42, 'campus', rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（2027-04-23（五）17:25 校園；跟芯慈 FAMILIAR＋聯絡方式）')
    try:
        ok, ch, T, C, CS = await near_wait(pg, cdp, run, sid, 'ev_xc_dad', 34.0, -107.0, 0, ['「債總。」'], max_s=600, r=2.5)
        await report(pg, run, sid, res, T, CS, C)
        run.check('%s：法律系館A門口演「銀色的車」（ev_xc_dad done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：爸爸「法律系的同學。你們民法教到哪裡了？」' % sid, '法律系的同學。你們民法教到哪裡了？' in T, J(T[:8], 500))
        run.check('%s：三個選項「「債總。」」／「「物權。」」／「「我也不太確定。」」' % sid, any(c == ['「債總。」', '「物權。」', '「我也不太確定。」'] for c in CS), J(CS[-2:]))
        run.check('%s：選「債總。」→「債總好。什麼都從債總開始。」→（車窗搖上去…）' % sid, has_seq(T, ['債總好。什麼都從債總開始。', '（車窗搖上去。芯慈上車前，回頭看了你一眼。）']), J(T[-4:]))
        ok2, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=22.05", max_s=1500, label=sid)
        ms = await msgs(pg, 'p:' + XC); res['msgs'] = ms[-3:]
        run.check('%s：當晚 22:00 私訊「我爸說你很有禮貌。……他每個同學都這樣說。」' % sid, any(m['text'] == '我爸說你很有禮貌。……他每個同學都這樣說。' for m in ms), J({'reached': ok2, 'msgs': ms[-3:]}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_c5diag(p, run, base, sid, out):
    # n25 C5：2027-11-29 18:08 總圖三樓只有芯慈、以安不在（作息 r2y3a3d.js:64 寫 Y3S1 第 13 週週一～三 18～21 在 library）——列出場上所有人、作息查詢、交往旗標，分清楚是探針找人還是遊戲沒放人
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-11-29', 18.08, 'library', rels={XC: 'FAMILIAR', AN: 'FRIEND'}, quiet=False, label=sid + '（同 C5）')
    try:
        await drive(pg, cdp, run, max_s=40, label=sid); await pg.wait_for_timeout(4000)
        info = await pg.evaluate("""(()=>{ const G=GAME.G, E=GAME.E; const npcs=(E.npcs||[]).map(n=>({id:n.id, charId:n.charId||null, vis:!!(n.obj&&n.obj.visible!==false), hidden:!!n.hidden, x:n.obj?+n.obj.position.x.toFixed(1):null, z:n.obj?+n.obj.position.z.toFixed(1):null}));
          const w=id=>{ try{ return STORY.whereIs(GAME,id); }catch(e){ return 'ERR '+e.message; } };
          const t=CALENDAR.termOf(G.day); const F=G.flags; const dating=Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]);
          return {key:CALENDAR.dateOf(G.day).key, wd:G.weekday, h:+(+G.hour).toFixed(2), zone:G.zone, term:t, npcs, whereAN:w('heroine_01'), whereAn:w('an'), whereXC:w('classmate_xinci'), dating, route:F.EXCHANGE_ROUTE||null, jp:Object.keys(F).filter(k=>/JP|JAPAN/.test(k)).slice(0,8)}; })()""")
        res['info'] = info; say('   %s：%s' % (sid, J(info, 3000)))
        run.note('%s 場上的人與作息：%s' % (sid, J(info, 3000)))
        await run.shot(pg, '%s_scene' % sid)
        run.check('%s：（診斷）以安在總圖三樓（NPC 列表有 heroine_01／an）' % sid, any((n['charId'] == AN or n['id'] in (AN, 'an')) and n['vis'] for n in info['npcs']), J({'where': info['whereAN'], 'whereAn': info['whereAn'], 'ids': [n['id'] for n in info['npcs']]}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_c5(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-11-29', 18.08, 'library', rels={XC: 'FAMILIAR', AN: 'FRIEND'}, quiet=False, label=sid + '（大三上第 13 週週一 18:05 總圖三樓；認識以安、芯慈）')
    try:
        await drive(pg, cdp, run, max_s=60, label=sid)
        pa = await pg.evaluate(NPC + "(%s)" % json.dumps([AN])); px = await pg.evaluate(NPC + "(%s)" % json.dumps([XC])); say('   %s 以安 %s 芯慈 %s' % (sid, J(pa), J(px)))
        run.check('%s：前置——以安、芯慈都在總圖三樓' % sid, bool(pa) and bool(px), J({'an': pa, 'xc': px}))
        if not (pa and px): return
        mx, mz = (pa[0] + px[0]) / 2, (pa[1] + px[1]) / 2
        ok, ch, T, C, CS = await near_wait(pg, cdp, run, sid, 'ev_xinci_an_answers', mx, mz, px[2], ['「妳們開學就坐在一起了吧。」'], max_s=600, r=1.2)
        await report(pg, run, sid, res, T, CS, C)
        run.check('%s：走到她們旁邊演慈 5 近版（ev_xinci_an_answers done、CI5 near）' % sid, ok and await pg.evaluate("GAME.G.flags.CI5==='near'"), J(ch[-2:]))
        if not ok: return
        run.check('%s：分工抄筆記：「第三題，妳的整理比我的清楚。我可以抄嗎？」「可以。第五題妳的條文比我記得細，換我抄。」「……我們分工好了。」' % sid,
                  has_seq(T, ['第三題，妳的整理比我的清楚。我可以抄嗎？', '可以。第五題妳的條文比我記得細，換我抄。', '……我們分工好了。']), J(T[:10], 600))
        run.check('%s：三個選項「「我可以加入嗎？」」／「「妳們開學就坐在一起了吧。」」／「（聽她們對）」' % sid, any(c == ['「我可以加入嗎？」', '「妳們開學就坐在一起了吧。」', '（聽她們對）'] for c in CS), J(CS[-2:]))
        run.check('%s：選「妳們開學就坐在一起了吧。」→ 以安「第一排。她把課表推過來給我看。……我那時候想，這個人好細心。」' % sid, has_seq(T, ['第一排。她把課表推過來給我看。……我那時候想，這個人好細心。']), J(T[-3:]))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_c6(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-05-04', 18.92, 'noodle', rels={XC: 'FAMILIAR'}, preflags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, quiet=False, label=sid + '（2028-05-04（四）18:55 阿鳳麵店；跟芯慈 FAMILIAR；台灣路線）')
    try:
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xinci_first_place')", max_s=900, picks=['「妳爸媽怎麼說？」'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); C = caps(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS, C)
        run.check('%s：19:00 麵店演慈 6（ev_xinci_first_place done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：字幕標題「暑期實習」' % sid, '暑期實習' in C, J(C[-4:]))
        run.check('%s：「我申請了國際所的暑期實習。台灣分所。」「……錄取了。金融那一組。」' % sid, has_seq(T, ['我申請了國際所的暑期實習。台灣分所。', '……錄取了。金融那一組。']), J(T[:6]))
        run.check('%s：三個選項「「恭喜！」」／「「為什麼是金融那一組？」」／「「妳爸媽怎麼說？」」' % sid, any(c == ['「恭喜！」', '「為什麼是金融那一組？」', '「妳爸媽怎麼說？」'] for c in CS), J(CS[-2:]))
        run.check('%s：選「妳爸媽怎麼說？」→「我媽說：那家樓下的咖啡很好喝。」' % sid, has_seq(T, ['我媽說：那家樓下的咖啡很好喝。']), J(T[-3:]))
        wl = await pg.evaluate(WHO + "('%s')" % XC); res['whois'] = wl
        run.check('%s：人物頁有「大三下，她申請上國際所的暑期實習，金融那一組。」，沒有改輔系' % sid, '大三下，她申請上國際所的暑期實習，金融那一組。' in wl and not any('輔系' in x for x in wl), J(wl))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zrfeed(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-03-24', 21.9, 'dorm', rels={ZR: 'FRIEND'}, quiet=False, label=sid + '（大二下第 5 週週三 21:54 宿舍；芷若 FRIEND＋聯絡方式）')
    try:
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=22.15", max_s=900, label=sid)
        await phone_tab(pg, cdp, 'feed'); await pg.wait_for_timeout(1200)
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await run.shot(pg, '%s_feed' % sid); res['feed'] = txt[:600]
        run.check('%s：22:07 以後手機「動態」有芷若「新來的那個，三天就把常客的名字記起來了。」' % sid, '新來的那個，三天就把常客的名字記起來了。' in txt, J(txt[:300]))
        btn = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody button')].find(b=>(b.textContent||'').trim()==='好厲害。')")
        await pg.wait_for_timeout(2500); txt2 = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await run.shot(pg, '%s_reply' % sid)
        run.check('%s：按「好厲害。」→「你留言：好厲害。」、芷若回「對。我第一個禮拜只記得杯子。」' % sid, bool(btn) and '好厲害。' in txt2 and '對。我第一個禮拜只記得杯子。' in (txt2 + J(await msgs(pg, 'p:' + ZR))), J({'btn': btn, 'after': txt2[:300]}))
        banned_check(run, sid, [txt, txt2])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zrl3(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-03-24', 11.5, 'cafe', rels={ZR: 'FRIEND'}, quiet=False, label=sid + '（大二下第 5 週週三 11:30 兩點半 Café；芷若在班上（作息週一三五 11～15）；芷若 FRIEND）')   # n25_xinci_e：週二 10:18 在傅鐘附近她跟別人一起走、一下就離開這一區，改到她固定在的 Café
    try:
        await pg.evaluate("(()=>{ const G=GAME.G; G.social.ladder=G.social.ladder||{}; G.social.ladder['heroine_02@Y2S2']=2; G.social.ladderDay=G.social.ladderDay||{}; delete G.social.ladderDay.heroine_02; })()")
        run.setup('【前置】芷若大二下閒聊停在第 2 句（ladder heroine_02@Y2S2＝2、今天還沒聊過）')
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, [ZR], ['芷若', '林芷若'], picks=['「為什麼？」'], label=sid)
        # n25_xinci_c：繞了四個方向互動鈕還是「和不認識的女生說話」、截圖旁邊只有一個女生——查她是誰、芷若算不算認識了
        dg = await pg.evaluate("""(()=>{ const E=GAME.E, p=E.player.obj.position; const near=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false).map(n=>({id:n.id, charId:n.charId||null, d:+Math.hypot(n.obj.position.x-p.x,n.obj.position.z-p.z).toFixed(2), name:(n.id&&SOCIAL.displayName)?SOCIAL.displayName(n.id):null})).sort((a,b)=>a.d-b.d).slice(0,4);
            const it=(E.interactables||[]).filter(i=>i.npc||i.npcId).map(i=>({label:i.label, npc:i.npc&&i.npc.id||i.npcId||null})).slice(0,4);
            return {near, it, metD:SOCIAL.metD?SOCIAL.metD('heroine_02'):null, first:SOCIAL.has('heroine_02','FIRST_MET'), disp:SOCIAL.displayName('heroine_02'), layer:(CHARACTERS.heroine_02||{}).social_layer}; })()""")
        run.note('%s 診斷：身邊的人與互動點 %s' % (sid, J(dg, 1500))); res['diag'] = dg
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS)
        run.check('%s：和林芷若說話＝Z4-L3「我帶的那個工讀生，已經記得所有常客的名字了。」「……她記得比我那時候快。我好高興。」' % sid,
                  has_seq(T, ['我帶的那個工讀生，已經記得所有常客的名字了。', '……她記得比我那時候快。我好高興。']), J({'lab': lab, 'said': T[-6:]}))
        run.check('%s：選「為什麼？」→「因為常客會被記得。被記得的人，會再來。」' % sid, has_seq(T, ['因為常客會被記得。被記得的人，會再來。']), J(T[-3:]))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['DAY1', 'COPY_REAL', 'COPY_BACK', 'COPY_RPS', 'ELEV_ASK', 'ELEV_DONE', 'C2', 'C3A', 'C3B', 'C3C', 'C3B1', 'C3FIX', 'DAD', 'C5DIAG', 'C5', 'C6', 'ZRFEED', 'ZRL3']
FN = {'DAY1': s_day1, 'COPY_REAL': s_copy, 'COPY_BACK': s_copy, 'COPY_RPS': s_copy, 'ELEV_ASK': s_elev, 'ELEV_DONE': s_elev, 'C2': s_c2, 'C3A': s_c3, 'C3B': s_c3, 'C3C': s_c3, 'C3B1': s_c3, 'C3FIX': s_c3fix,
      'DAD': s_dad, 'C5DIAG': s_c5diag, 'C5': s_c5, 'C6': s_c6, 'ZRFEED': s_zrfeed, 'ZRL3': s_zrl3}


async def main():
    run = L.Run('xinci547', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'xinci.json'), 'w'), ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'))
    run.finish()
asyncio.run(main())
