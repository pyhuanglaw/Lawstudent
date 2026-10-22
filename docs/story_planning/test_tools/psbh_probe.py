"""BB（帳號 A）2026-10-22：AA245-PSBH（LAWWW 07:42 派，P2；開發分支 aaa84bbc 起）——AA_245「沛珊和柏翰沒在一起的版本」（企劃線 2af03a63），
條件同 AA_374 第 11 項＝玩家和沛珊交往中。【前置】和沛珊交往中＝「大一上期末就和沛珊交往」的狀態（讀檔後 ROM.start；dating_classmate_peishan）。
  SUP_DATE   大一下第 8 週 2026-04-15（三）刑總二期中考那天 15:00 宿舍（在麵店團群組）：阿哲群組揪 19:00 長桌 → 出發「考完的晚餐」（阿鳳麵店長桌）→
             要有「（柏翰把每個人的麵錢算好，寫在餐巾紙上。）」「一個人一百一十五。阿哲你多一顆蛋，一百二十五。」「……你連這個都算。」，
             沒有「對，我們在一起了。你們吃你們的。」「柏翰幫沛珊把滷蛋切成兩半。」
  SUP_FREE   對照：沒和沛珊交往（認識沛珊、柏翰）＝照舊公開（切滷蛋、「對，我們在一起了。」），沒有算麵錢那三句
  W4_DATE    大一下第 4 週 2026-03-19（四）19:45 萬才館：二樓研討室 A 門口「參加：公法讀書會」→ 散會沒有「沛珊和柏翰一起走出萬才館」那一段
  W4_FREE    對照：沒和沛珊交往＝照舊演「（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）」
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=SUP_DATE,... python3 psbh_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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



# ---------------------------------------------------------------- 考完的晚餐（大一下第 8 週）、第 4 週讀書會散場
PS = 'classmate_peishan'; BH = 'classmate_bohan'; NT = ('noodle_team', '麵店團')
NOBH = ['（柏翰把每個人的麵錢算好，寫在餐巾紙上。）', '一個人一百一十五。阿哲你多一顆蛋，一百二十五。', '……你連這個都算。']
BHL = ['柏翰幫沛珊把滷蛋切成兩半。', '對，我們在一起了。你們吃你們的。', '上禮拜的事。', '（他把另一半滷蛋推回她碗裡。）']
W4 = '（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）'
DONE = "(id=>!!((GAME.G.events||{}).done||{})[id])"


@guard
async def s_sup(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'SUP_DATE'
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-04-15', 15.0, 'dorm', rels={PS: 'FRIEND', BH: 'FAMILIAR', 'zhe': 'FRIEND'}, dating=((PS,) if dating else ()), groups=(NT,),
                                       label=sid + '（大一下第 8 週 2026-04-15（三）刑總二期中考那天 15:00 宿舍；在麵店團群組；%s）' % ('和沛珊交往中（大一上期末就交往的狀態）' if dating else '沒和沛珊交往、認識沛珊和柏翰'))
    try:
        run.check('%s：前置——%s、認識柏翰' % (sid, '和沛珊交往中' if dating else '沒和沛珊交往'), (PS in r['partners']) == dating and r['knows'].get(BH), json.dumps(r, ensure_ascii=False))
        ok0, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='supper_mid2')", max_s=120, label=sid)
        q = await pg.evaluate(OUTQ + "('^supper_mid2')"); g = [m for m in await msgs(pg, 'g:noodle_team') if m['tag'] == 'zhe_supper_mid2']; res.update({'plan': q, 'group': g})
        run.check('%s：考完阿哲在群組揪「刑總考完了。今天麵店，七點，長桌。」，排 19:00「考完的晚餐」' % sid, ok0 and bool(g) and any(x['h'] == 19 for x in q), json.dumps({'g': g, 'q': q}, ensure_ascii=False)[:300])
        n0 = await log_len(pg); await skip(pg, cdp, '等到傍晚', sid)
        ok, ch = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='supper_mid2'&&q.state!=='planned')", max_s=600, go=('出發：考完的晚餐',), label=sid, shot_at='柏翰')
        await drive(pg, cdp, run, max_s=120, label=sid)
        T = texts(await log_since(pg, n0)); q2 = await pg.evaluate(OUTQ + "('^supper_mid2')"); res.update({'said': T, 'out': q2}); await run.shot(pg, '%s_end' % sid)
        say('   %s 晚餐：%s' % (sid, J(T, 900)))
        run.check('%s：出發去阿鳳麵店長桌，演完（出遊 done）' % sid, ok and any(x['state'] == 'done' for x in q2), J({'out': q2, 'ch': ch}, 400))
        if dating:
            idx = [T.index(x) if x in T else -1 for x in NOBH]
            run.check('%s：和沛珊交往中＝柏翰算麵錢三句「%s」「%s」「%s」（照順序）' % (sid, NOBH[0], NOBH[1], NOBH[2]), all(i >= 0 for i in idx) and idx == sorted(idx), J(T[-10:], 500))
            run.check('%s：沒有公開那一段（「%s」「%s」）' % (sid, BHL[1], BHL[0]), not any(x in T for x in BHL), J([x for x in T if x in BHL], 300))
        else:
            run.check('%s：沒和沛珊交往＝照舊公開（「%s」「%s」「%s」）' % (sid, BHL[0], BHL[1], BHL[2]), all(x in T for x in BHL[:3]), J(T[-10:], 500))
            run.check('%s：沒有算麵錢那三句' % sid, not any(x in T for x in NOBH), J([x for x in T if x in NOBH], 300))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_w4(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'W4_DATE'
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-03-19', 19.75, 'wancai', rels={PS: 'FRIEND', BH: 'FAMILIAR', 'heroine_01': 'FRIEND'}, dating=((PS,) if dating else ()), flags={'CLUB_public_law_group': True}, quiet=False,
                                       label=sid + '（大一下第 4 週 2026-03-19（四）19:45 萬才館大廳；參加過公法讀書會；%s；事件系統開著）' % ('和沛珊交往中' if dating else '沒和沛珊交往、認識沛珊和柏翰'))
    try:
        run.check('%s：前置——%s' % (sid, '和沛珊交往中' if dating else '沒和沛珊交往'), (PS in r['partners']) == dating and r['knows'].get(PS), json.dumps(r, ensure_ascii=False))
        await drive(pg, cdp, run, max_s=30, label=sid)
        # 2026-10-22 rc2：研討室 A 變成走得進去的房間（rooms_glb3d.js wancai_sema），門的互動點寫「進入 研討室 A」——門口照樣先問社課（CLS.roomDoorBusy）
        door = await L.find_it(pg, '研討室 A') or await L.find_it(pg, '進入 研討室 A')
        ok = bool(door) and await L.go_to(pg, cdp, run, door['x'], door['z'] + 0.6, 0.9, '二樓研討室 A 門口', lv=1, max_s=600)
        for _ in range(60):   # 讀書會 20:00：門口等到開始前（時間照走）
            if (await pg.evaluate("GAME.G.hour")) >= 19.95: break
            await pg.wait_for_timeout(3000)
        n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000)
        ops = await opts(pg); res['door'] = ops
        k = next((i for i, o in enumerate(ops) if o.startswith('參加：公法讀書會')), None)
        run.check('%s：走到二樓研討室 A 門口、按門有「參加：公法讀書會」' % sid, ok and k is not None, J({'door': door, 'opts': ops}, 300))
        if k is None: return
        await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500)
        await drive(pg, cdp, run, max_s=240, label=sid)
        T = texts(await log_since(pg, n0)); done = await pg.evaluate(DONE + "('ev_peishan_bohan_w4')"); st = await pg.evaluate(STATE); res.update({'said': T, 'done': done, 'st': st}); await run.shot(pg, '%s_after' % sid)
        say('   %s 讀書會：%s；ev_peishan_bohan_w4 %s；%s' % (sid, J(T, 600), done, J(st)))
        run.check('%s：讀書會開完（現在 %.2f）' % (sid, st['h']), st['h'] >= 21.4 or '社課結束了。' in T, J(st))
        if dating: run.check('%s：和沛珊交往中＝散會沒有「%s」' % (sid, W4), W4 not in T and not done, J({'said': T[-6:], 'done': done}, 400))
        else: run.check('%s：沒和沛珊交往＝散會照舊「%s」' % (sid, W4), W4 in T and done, J({'said': T[-6:], 'done': done}, 400))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['SUP_DATE', 'SUP_FREE', 'W4_DATE', 'W4_FREE']
FN = {'SUP_DATE': s_sup, 'SUP_FREE': s_sup, 'W4_DATE': s_w4, 'W4_FREE': s_w4}


async def main():
    run = L.Run('psbh', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'psbh.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
