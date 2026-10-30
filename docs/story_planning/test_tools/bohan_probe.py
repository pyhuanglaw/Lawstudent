"""BB-B 10-30：NO-COMPARE-1030（LAWWW-B 18:19 P1，n23_bohan_nocmp；開發分支 fdac7f6e2；AA_546 第 0、1 節，D116 遊戲裡的人不跟別人比）。
走真實流程（不用 ?turbo）；日期、地點、關係是【前置】（使用者存檔改日子，讀檔後設關係），每一個都標出來。Playwright 手機橫向模擬，不是 iPhone。
  H1_TOLD／H1_UNSURE／H1_ASKED  翰 1：大一上第 10 週民總那一天上課前 30 分鐘在校園 → 手機「今天」「直接去上課」→ 下課演「第三題」：
      字幕標題「第三題」、三個選項（講你怎麼寫的）／「我也不確定。」／「你錯哪裡？」各一次，各自的回應照 AA_546 1-2；畫面上沒有分數、名次；
      H1_TOLD 再看人物頁柏翰那一行「大一上期中考完，他問過你第三題怎麼寫。」（畫面＋WHOIS.lines）
  H2_SLOW  翰 2：大二上第 7 週週一 18:05 總圖閱覽室，【前置】翰 1 演過（BOHAN_SCORE told）、跟他 FAMILIAR → 走到柏翰旁邊 → 選「我寫得很慢，可以嗎？」→「……我也是。所以才組的。」
  H2_YES   同上選「好。」→ 那一週起每週六 16:00 考古題小組（出發選單「出發：」）；【前置】跳到第 7、8、9 週週六 15:30（中間的日子沒有玩）→ 去三次；第一次「四個人，一張考古題…」、第三次「寫完，柏翰把每個人的寫法抄在白板上…」
  H3_MESS／H3_WRITE  翰 3：大二下第 2 週週四 19:45 萬才館，【前置】參加過公法讀書會（CLUB_public_law_group）、認識柏翰 → 研討室 A 門口「參加：公法讀書會」→ 白板三句、三個選項、回應
  H4_GOOD／H4_SIT  翰 4：大三上第 10 週週一 12:12 霖澤館 4F，【前置】FAMILIAR＋記憶 ASKED_BACK → 走到柏翰旁邊 → AA_546 1-5 每一句、舊句（平均以下、我哥念電機…）都沒有
  CAMP  宿營破冰：從標題「從法律系開始」照玩家點，到名字接龍「從哪裡來」：七個人的句子、兩個選項（早餐那一版都沒有）
用法：LW_TESTS=<工作樹>/tests SCEN=H1_TOLD,... python3 bohan_probe.py <URL>/index.html <輸出資料夾> <使用者存檔>"""
import os, sys, json, asyncio, time, re
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
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.2, name, max_s=90, lv=pos[2])
        for j in range(6):
            lab = await pg.evaluate(LAB)
            if hit(lab): break
            pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
            if pos: await L.go_to(pg, cdp, run, pos[0], pos[1], 0.9, name, max_s=30, lv=pos[2])
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


H1PICK = {'H1_TOLD': '（講你怎麼寫的）', 'H1_UNSURE': '「我也不確定。」', 'H1_ASKED': '「你錯哪裡？」'}
H1SEQ = {'H1_TOLD': ['你講了你的寫法。', '……你先從事實看的。好。', '他寫進手機的備忘錄。'],
         'H1_UNSURE': ['好。不確定也算一種寫法。', '他也寫進去。'],
         'H1_ASKED': ['他停了一下。', '……第三題。整題。', '第一次有人反問他。']}


@guard
async def s_h1(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        it = await day_of_class(pg, 'Y1S1', 10, 'civ_general'); res['class'] = it
        run.check('%s：前置——大一上第 10 週有民總' % sid, bool(it), J(it))
        if not it: return
        await close(b)
        b, pg, cdp, errs, r = await launch(p, run, base, it['key'], it['t0'] - 0.5, 'campus', quiet=False, label=sid + '（大一上第 10 週民總那天上課前 30 分鐘、校園；事件系統開著）')
        bt = await go_class(pg, cdp, run, it['k'], sid)
        run.check('%s：手機「今天」有「直接去上課」' % sid, bool(bt), J(bt))
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_bohan_score')", max_s=1200, picks=[H1PICK[sid], '坐'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); C = caps(lg); CS = choice_sets(lg); res.update({'said': T, 'caps': C, 'choices': CS})
        await run.shot(pg, '%s_after' % sid); say('   %s 說的：%s；字幕 %s；選項 %s' % (sid, J(T[-14:], 900), J(C[-6:]), J(CS[-3:])))
        run.check('%s：民總下課演了翰 1（ev_bohan_score done）' % sid, ok, J({'ch': ch[-3:]}))
        if not ok: return
        run.check('%s：字幕標題「第三題」（沒有「你考幾分」）' % sid, '第三題' in C and not any('你考幾分' in c for c in C), J(C[-6:]))
        run.check('%s：柏翰「民總期中，第三題你怎麼寫？」「我問了十四個人。你是第十五個。」' % sid, has_seq(T, ['民總期中，第三題你怎麼寫？', '我問了十四個人。你是第十五個。']), J(T[-14:], 600))
        want = ['（講你怎麼寫的）', '「我也不確定。」', '「你錯哪裡？」']
        run.check('%s：三個選項剛好是（講你怎麼寫的）／「我也不確定。」／「你錯哪裡？」（沒有「不想說」）' % sid, any(c == want for c in CS), J(CS[-3:]))
        run.check('%s：選 %s → %s' % (sid, H1PICK[sid], '／'.join(H1SEQ[sid])), has_seq(T, H1SEQ[sid]), J(T[-10:], 600))
        i = next((k for k, x in enumerate(T) if x == '民總期中，第三題你怎麼寫？'), 0); seg = T[max(0, i - 1):]   # 只看翰 1 那一段（課堂內容的「15 分鐘」之類不算）
        bad = [x for x in seg + (CS[-1] if CS else []) if SCORE_RE.search(x)]
        run.check('%s：翰 1 那一段沒有分數、名次（「八十一」「第六」「…分」「名次」）' % sid, not bad, J(bad))
        st = await pg.evaluate("(()=>({BOHAN_SCORE:GAME.G.flags.BOHAN_SCORE||null, mem:((GAME.G.social.mem||{}).classmate_bohan||[]).map(m=>m.tag+':'+(m.note||''))}))()"); res['st'] = st
        wantf = {'H1_TOLD': 'told', 'H1_UNSURE': 'unsure', 'H1_ASKED': 'asked'}[sid]
        memok = ('TOLD_SCORE:期中放榜，跟他講第三題你怎麼寫' in st['mem']) if sid == 'H1_TOLD' else (any(m.startswith('ASKED_BACK') for m in st['mem']) if sid == 'H1_ASKED' else True)
        run.check('%s：BOHAN_SCORE＝%s%s' % (sid, wantf, '、記憶 TOLD_SCORE「期中放榜，跟他講第三題你怎麼寫」' if sid == 'H1_TOLD' else ('、記憶 ASKED_BACK' if sid == 'H1_ASKED' else '')), st['BOHAN_SCORE'] == wantf and memok, J(st))
        if sid == 'H1_TOLD':
            api = await pg.evaluate("(()=>{ try{ return WHOIS.lines(GAME.G,'classmate_bohan'); }catch(e){ return ['ERR '+e.message]; } })()")
            await phone_tab(pg, cdp, 'friends')
            has = await pg.evaluate("!!document.querySelector('#phoneBody [data-person=\"classmate_bohan\"]')")
            ui = []
            if has:
                await L.tap(pg, cdp, '#phoneBody [data-person="classmate_bohan"]'); await pg.wait_for_timeout(900)
                ui = await pg.evaluate("(()=>{ const w=document.querySelector('#phoneBody .whois'); return w?w.innerText.split('\\n').map(s=>s.trim()).filter(Boolean):[]; })()")
                await run.shot(pg, '%s_whois' % sid)
            line = '大一上期中考完，他問過你第三題怎麼寫。'
            run.check('%s：人物頁柏翰那一行「%s」（畫面＋WHOIS.lines），沒有「考幾分」' % (sid, line), any(line in x for x in ui) and line in api and not any('考幾分' in x for x in ui + api), J({'ui': ui, 'api': api}))
            await L.phone_away(pg, cdp)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_h2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); key = await day_in_week(pg, 'Y2S1', 7, 1); await close(b)
    b, pg, cdp, errs, r = await launch(p, run, base, key, 18.05, 'library', rels={BH: 'FAMILIAR'}, quiet=False, label=sid + '（大二上第 7 週週一 18:05 總圖閱覽室；跟柏翰 FAMILIAR）')
    try:
        await preday(pg, run, '翰 1 演過（ev_bohan_score done、BOHAN_SCORE told）', "G.events.done.ev_bohan_score=1; F.BOHAN_SCORE='told'")
        n0 = await log_len(pg); pick = '「我寫得很慢，可以嗎？」' if sid == 'H2_SLOW' else '「好。」'
        where = await pg.evaluate("(()=>{ try{ const w=STORY.whereIs(GAME,'classmate_bohan'); return w?{zone:w.zone, act:w.act||null}:null; }catch(e){ return 'ERR '+e.message; } })()")
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([BH])); say('   %s 柏翰在：%s；位置 %s' % (sid, J(where), J(pos)))
        run.check('%s：前置——柏翰在總圖閱覽室（作息 %s）' % (sid, J(where)), bool(pos), J({'where': where, 'pos': pos}))
        if not pos: return
        await L.go_to(pg, cdp, run, pos[0], pos[1], 2.0, '柏翰旁邊', max_s=240, lv=pos[2])
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_bohan_exam_group')", max_s=600, picks=[pick], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); res.update({'said': T, 'choices': CS}); await run.shot(pg, '%s_after' % sid)
        say('   %s 說的：%s；選項 %s' % (sid, J(T[-12:], 900), J(CS[-2:])))
        run.check('%s：走到柏翰旁邊演翰 2（ev_bohan_exam_group done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：「我在組一個考古題小組。每週寫一份，寫完互相看怎麼寫。」→「以安說不要…」→「你要不要來？」' % sid, has_seq(T, ['我在組一個考古題小組。每週寫一份，寫完互相看怎麼寫。', '以安說不要。她說她週四有讀書會。', '你要不要來？']), J(T[-12:], 600))
        want = ['「好。」', '「不了。」', '「我寫得很慢，可以嗎？」']
        run.check('%s：三個選項「好。」／「不了。」／「我寫得很慢，可以嗎？」（沒有「分數不夠的人呢？」）' % sid, any(c == want for c in CS), J(CS[-2:]))
        i = next((k for k, x in enumerate(T) if x.startswith('我在組一個考古題小組')), 0); seg = T[i:]
        bad = [x for x in seg + (CS[-1] if CS else []) if SCORE_RE.search(x) or '分數' in x]
        run.check('%s：沒有分數那一類的字' % sid, not bad, J(bad))
        if sid == 'H2_SLOW':
            run.check('%s：選「我寫得很慢，可以嗎？」→「他愣了一下。」「……我也是。所以才組的。」、記憶 ASKED_SLOW' % sid,
                      has_seq(T, ['他愣了一下。', '……我也是。所以才組的。']) and await pg.evaluate("((GAME.G.social.mem||{}).classmate_bohan||[]).some(m=>m.tag==='ASKED_SLOW')"), J(T[-4:]))
            g = await pg.evaluate("GAME.G.flags.BOHAN_GROUP||null"); res['group'] = g
            run.note('選「我寫得很慢」以後 BOHAN_GROUP＝%s：照程式（story3d.js 考古題小組只排 BOHAN_GROUP===\'yes\'）這個選項之後週六不會排小組（給 LAWWW-B 確認是不是要這樣）' % J(g))
            return
        run.check('%s：選「好。」→「小組每週六下午，總圖 B1 的討論室。寫完，一個人講一題。」' % sid, has_seq(T, ['小組每週六下午，總圖 B1 的討論室。寫完，一個人講一題。']), J(T[-3:]))
        sess = []
        for w in (7, 8, 9):
            sk = await day_in_week(pg, 'Y2S1', w, 6)
            snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, sk)
            snap.update({'day': d, 'hour': 15.5, 'zone': 'campus', 'pos': None, 'weekday': 6})
            await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
            run.setup('[前置] 同一份進度跳到 %s（大二上第 %d 週週六）15:30 校園（中間的日子沒有玩）' % (sk, w))
            n1 = await log_len(pg)
            ok2, ch2 = await wait_for(pg, cdp, run, "(()=>{ const q=(OUT.rec(GAME.G)||[]).find(x=>x.id==='bohan_group_'+GAME.G.day); return !!q&&q.state==='done'; })()", max_s=900, go=('出發：',), label='%s_w%d' % (sid, w))
            T2 = texts(await log_since(pg, n1)); n = await pg.evaluate("GAME.G.flags.BOHAN_GROUP_N|0"); sess.append({'w': w, 'ok': ok2, 'n': n, 'said': T2[-6:], 'prompt': [c['opts'] for c in ch2][-2:]})
            say('   %s 第 %d 週週六：%s' % (sid, w, J(sess[-1], 600)))
        res['sess'] = sess
        run.check('%s：第 7、8、9 週週六 16:00 都有「出發：考古題小組」、去了三次（BOHAN_GROUP_N 1→2→3）' % sid, [s['ok'] for s in sess] == [True] * 3 and [s['n'] for s in sess] == [1, 2, 3], J([(s['w'], s['ok'], s['n'], s['prompt']) for s in sess]))
        F1 = '四個人，一張考古題。柏翰按下手機的計時器。'; F3 = '寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。'
        hasx = lambda s, t: any(NOPAREN(x) == t for x in s['said'])
        run.check('%s：第一次旁白「（%s）」' % (sid, F1), len(sess) > 0 and hasx(sess[0], F1), J(sess[0]['said'] if sess else None))
        run.check('%s：第三次旁白「（%s）」（第一、二次沒有）' % (sid, F3), len(sess) == 3 and hasx(sess[2], F3) and not hasx(sess[0], F3) and not hasx(sess[1], F3), J([s['said'] for s in sess]))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_h3(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); key = await day_in_week(pg, 'Y2S2', 2, 4); await close(b)
    b, pg, cdp, errs, r = await launch(p, run, base, key, 19.75, 'wancai', rels={BH: 'FAMILIAR', 'heroine_01': 'FRIEND'}, flags={'CLUB_public_law_group': True}, quiet=False,
                                       label=sid + '（大二下第 2 週週四 19:45 萬才館大廳；參加過公法讀書會；認識柏翰、以安）')
    try:
        pick = '「我這週很亂，寫不出來。」' if sid == 'H3_MESS' else '「我也寫。」'
        await drive(pg, cdp, run, max_s=30, label=sid)
        door = await L.find_it(pg, '研討室 A') or await L.find_it(pg, '進入 研討室 A')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'] + 0.6, 0.9, '二樓研討室 A 門口', lv=1, max_s=600)
        for _ in range(60):
            if (await pg.evaluate("GAME.G.hour")) >= 19.95: break
            await pg.wait_for_timeout(3000)
        n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        ops = await opts(pg); k = next((i for i, o in enumerate(ops) if o.startswith('參加：公法讀書會')), None)
        run.check('%s：走到二樓研討室 A 門口、按門有「參加：公法讀書會」' % sid, ok and k is not None, J({'door': door, 'opts': ops}))
        if k is None: return
        await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
        ok2, ch = await wait_for(pg, cdp, run, DONE + "('ev_bohan_scores')", max_s=600, picks=[pick], label=sid)
        await drive(pg, cdp, run, max_s=120, label=sid)
        lg = await log_since(pg, n0); T = texts(lg); C = caps(lg); CS = choice_sets(lg); res.update({'said': T, 'caps': C, 'choices': CS}); await run.shot(pg, '%s_after' % sid)
        say('   %s 說的：%s；字幕 %s；選項 %s' % (sid, J(T[-14:], 900), J(C[-4:]), J(CS[-3:])))
        run.check('%s：讀書會演翰 3（ev_bohan_scores done）' % sid, ok2, J(ch[-2:]))
        if not ok2: return
        run.check('%s：字幕標題「白板」（沒有「分數表」）' % sid, '白板' in C and not any('分數表' in c for c in C), J(C[-4:]))
        run.check('%s：白板三句照 AA_546 1-4（每個人寫自己這週要讀到哪裡／只寫自己的／以安寫「刑總 第五章」）' % sid,
                  has_seq(T, ['（白板上多了一張表：每個人寫自己這週要讀到哪裡。）', '寫下來比較不會忘。只寫自己的。', '（以安看了白板一眼，在自己那一格寫「刑總 第五章」。）']), J(T[-8:], 600))
        want = ['「我也寫。」', '「我這週很亂，寫不出來。」', '（什麼都不做）']
        run.check('%s：三個選項「我也寫。」／「我這週很亂，寫不出來。」／（什麼都不做）' % sid, any(c == want for c in CS), J(CS[-3:]))
        reply = '那就寫「很亂」。也是一種進度。' if sid == 'H3_MESS' else '好。'
        run.check('%s：選 %s → 柏翰「%s」' % (sid, pick, reply), has_seq(T, [reply]), J(T[-4:]))
        i = next((k for k, x in enumerate(T) if '白板上多了一張表' in x), 0); seg = T[i:]
        bad = [x for x in seg if '差多少' in x or '她不來了' in x or SCORE_RE.search(x)]
        run.check('%s：沒有「這樣大家比較知道自己差多少」「她不來了」、沒有分數' % sid, not bad, J(bad))
    finally: await finish_page(run, sid, res, errs, b)


H4SEQ = ['刑訴。我最喜歡的一科。六十二。', '你知道我為什麼每天念六小時嗎。', '不是因為我很認真。是因為我念得慢。一頁要看三次，才記得住。', '可是看三次的東西，我都不會忘。……這是我唯一確定的事。',
         '我問大家第三題怎麼寫，是想知道別人怎麼想。我自己只會一種想法。', '……那天你反問我錯哪裡。我回家想了很久，我從來沒跟人說過我錯哪裡。']
H4OLD = ['平均以下', '我哥念電機', '就跟不上你們', '是想確定我沒有輸太多', '第一排是因為我怕坐後面聽不到', '你還坐在第一排', '為什麼我不敢反問別人', '那個你可以說']


@guard
async def s_h4(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); key = await day_in_week(pg, 'Y3S1', 10, 1); await close(b)
    b, pg, cdp, errs, r = await launch(p, run, base, key, 12.2, 'linze_4f', rels={BH: 'FAMILIAR'}, mems=[(BH, 'ASKED_BACK')], flags={'BOHAN_SCORE': 'asked'}, quiet=False,
                                       label=sid + '（大三上第 10 週週一 12:12 霖澤館 4F；跟柏翰 FAMILIAR、記憶 ASKED_BACK）')
    try:
        pick = '「念得慢、記得久，那很好啊。」' if sid == 'H4_GOOD' else '（在他旁邊的台階坐下）'
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([BH])); say('   %s 柏翰位置 %s' % (sid, J(pos)))
        run.check('%s：前置——柏翰在 4F 樓梯間' % sid, bool(pos), J(pos))
        if not pos: return
        n0 = await log_len(pg)
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.6, '柏翰旁邊', max_s=240, lv=pos[2])
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_bohan_third_floor')", max_s=600, picks=[pick], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); res.update({'said': T, 'choices': CS}); await run.shot(pg, '%s_after' % sid)
        say('   %s 說的：%s；選項 %s' % (sid, J(T, 1200), J(CS[-2:])))
        run.check('%s：走到柏翰旁邊演翰 4（ev_bohan_third_floor done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：AA_546 1-5 的句子照順序（六十二、念得慢、看三次不會忘、第三題怎麼寫、反問我錯哪裡）' % sid, has_seq(T, H4SEQ), J(T[:12], 900))
        want = ['「六小時也是你的。」', '「念得慢、記得久，那很好啊。」', '（在他旁邊的台階坐下）']
        run.check('%s：三個選項「六小時也是你的。」／「念得慢、記得久，那很好啊。」／（在他旁邊的台階坐下）' % sid, any(c == want for c in CS), J(CS[-2:]))
        if sid == 'H4_GOOD': run.check('%s：選「念得慢、記得久…」→（他笑了一下，很小。）「……那我以後不要說『只是』念得慢。」' % sid, has_seq(T, ['（他笑了一下，很小。）', '……那我以後不要說『只是』念得慢。']), J(T[-4:]))
        else: run.check('%s：坐下 →「今天的事，……就到這裡。」…「……下次我考好了，我先跟你說。」' % sid, has_seq(T, ['今天的事，……就到這裡。', '……下次我考好了，我先跟你說。']), J(T[-5:]))
        bad = [x for x in T + sum(CS, []) for o in H4OLD if o in x]
        run.check('%s：舊句一句都沒有（平均以下、我哥念電機、跟不上你們、沒有輸太多、第一排怕聽不到…）' % sid, not bad, J(bad))
    finally: await finish_page(run, sid, res, errs, b)


CAMPSEQ = ['第二個。名字接龍，順便講你從哪裡來。要先把前面的人念一遍。', '張哲維，叫我阿哲。高雄上來的。', '阿哲。吳芯慈，永和。我應該是全隊住最近的。', '……前面是阿哲、還有、呃……', '（小聲）芯慈。',
           '芯慈，謝謝。我是郭沛珊，台中來的。', '（一口氣念完前面的名字）江明軒。彰化，五點的客運。', '阿哲、芯慈、沛珊、明軒。許柏翰。新竹。', '（念完，一個都沒漏）凱文！台北人，土生土長！']


@guard
async def s_camp(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.goto(URL); await L.wait_loaded(pg); await pg.wait_for_timeout(1500); await pg.evaluate(HOOK)
        await L.tap(pg, cdp, '#btnNewLaw'); await pg.wait_for_timeout(3000)
        st0 = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'), stage:GAME.G&&GAME.G.stage}))()")
        run.check('%s：前置——標題「從法律系開始」真的開局' % sid, not st0['title'], J(st0))
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.t==='好，七個人都記住了吧。')", max_s=2400, label=sid)
        lg = await pg.evaluate("window.__LOG||[]"); T = texts(lg); CS = choice_sets(lg)
        i = next((k for k, x in enumerate(T) if x.startswith('第二個。名字接龍')), -1); seg = T[i:i + 14] if i >= 0 else T[-20:]
        res.update({'seg': seg, 'choices': CS[-4:]}); await run.shot(pg, '%s_after' % sid)
        say('   %s 破冰那一段：%s；選項 %s' % (sid, J(seg, 1200), J(CS[-3:])))
        run.check('%s：照玩家點到宿營名字接龍（「好，七個人都記住了吧。」）' % sid, ok, J(ch[-3:]))
        if not ok: return
        run.check('%s：小隊輔＋六個人的句子照 AA_546 第 0 節、照順序（從哪裡來）' % sid, has_seq(seg, CAMPSEQ), J(seg, 900))
        run.check('%s：祐廷兩個選項「臺北。我家就在這附近。」／「臺北人。」' % sid, any(c == ['「臺北。我家就在這附近。」', '「臺北人。」'] for c in CS), J(CS[-3:]))
        bad = [x for x in seg + sum(CS[-3:], []) if '早餐' in x]
        run.check('%s：破冰那一段沒有「早餐」' % sid, not bad, J(bad))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['H1_TOLD', 'H1_UNSURE', 'H1_ASKED', 'H2_SLOW', 'H2_YES', 'H3_MESS', 'H3_WRITE', 'H4_GOOD', 'H4_SIT', 'CAMP']
FN = {'H1_TOLD': s_h1, 'H1_UNSURE': s_h1, 'H1_ASKED': s_h1, 'H2_SLOW': s_h2, 'H2_YES': s_h2, 'H3_MESS': s_h3, 'H3_WRITE': s_h3, 'H4_GOOD': s_h4, 'H4_SIT': s_h4, 'CAMP': s_camp}


async def main():
    run = L.Run('bohan_nocmp', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'bohan.json'), 'w'), ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'))
    run.finish()
asyncio.run(main())
