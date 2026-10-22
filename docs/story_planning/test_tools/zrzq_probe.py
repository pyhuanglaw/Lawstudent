"""BB（帳號 A）2026-10-22：v9.10.6 預告清單（LAWWW 09:25）AA_232 芷若×子晴「從摯友到戀人」（開發分支 0b4db9c8 起；AA_385 0fc65c3f、f9941cfd；曼谷 3256ce62）。
台詞照 ZRZQ_LINES（LAWWW 的 tests/zrzq_line_unit.js、aa385_zz_unit.js 已逐字比對 AA_232 088556ed、AA_385 028dc128）；這支看玩家實際看到的：時間到了遊戲自己帶到場、演完狀態往前走。
  Z41_HOME     大一下第 3 週 2026-03-11（三）21:12 宿舍，站著不動：21:30 遊戲帶到溫州街 Café 門口（21:50）演 4-1 → feelings_emerging、下一場排 4/30 16:40
  Z42_NEXT     【前置】4-1 演過：2026-04-30（四）16:24 校園，16:40 帶到公館（二輪戲院）演 4-2（兩個都是朋友＝朋友版）→ mutual_interest
  Z42_PURSUE   同上，芷若到第 4 階（甲：祐廷在追她）＝4-2 照演（甲只擋 4-4）
  Z44_SERIOUS  【前置】4-1、4-2、4-2b 演過：2026-06-05（五）14:15 校園，14:30 帶到醉月湖演 4-4 → 兩個人交往
  Z44_PURSUE   同上，芷若到第 4 階（甲）＝6/5 不帶到場、不演，順延
  BKK          3256ce62：2028-07-04 芷若×子晴交往中＝芷若在曼谷；還沒交往＝照舊回台中（手機朋友頁的字＋presence）
【前置】讀使用者存檔改日期、時間、地點、關係，芷若×子晴的狀態（G.flags.ZZ）直接設；之後照玩家：站著等、點對話。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=Z41_HOME,... python3 zrzq_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
SETUP = """(([rels,dating,flags])=>{ const G=GAME.G, F=G.flags; const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
  const day0=STORY.dayOfKey('2025-09-24'); G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id), v=V[rels[id]]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0;
    const so=G.social||(G.social={}), U=so.relUp||(so.relUp={}), k={ACQ:1,FAMILIAR:2,FRIEND:3,CLOSE:4}[rels[id]]|0; if((U[id]|0)<k) U[id]=k; }   /* 2026-10-22：早就升到這一階、門檻台詞（SOCIAL.playUp）說過了——不然下一次說話先演升階台詞、這次不走閒聊階梯（候選 364dabe0 第二輪以安 9/15）*/
  if(rels.heroine_05){ F.met_sis=true; F.SIS_W1=true; }
  Object.assign(F,flags||{});
  for(const id of dating||[]){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,70); R.trust=Math.max(R.trust|0,60); R.comf=Math.max(R.comf|0,60); R.rom=70; R.npcRom=70; if(G.contacts[id]==null) G.contacts[id]=day0; SOCIAL.remember(id,'FIRST_MET',''); }
  G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true,noodle:true,wancai:true,gongguan:true,campus:true,classroom:true,wenzhou:true});
  const ids=Object.keys(rels).concat(dating||[]);
  return {stages:Object.fromEntries(ids.map(id=>[id,SOCIAL.stage(id)])), partners:(typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]), route:STORY.route?STORY.route(G):null, abroad:STORY.abroad?STORY.abroad(G):null}; })"""
NPC = """(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.some(id=>x.charId===id||x.id===id)&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })"""
LAB = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'JP_RETURNED': {'$day': '2028-08-05'}, 'AN_SENDOFF': 'together'}
# 2026-10-22 08:3x（候選 364dabe0 第一輪 17 個 FAIL 全是前置不足）：使用者存檔停在 9/3（主線第一天），沒有 afternoonDone——以安（LEGACY_IDS）要 afternoonDone 才照作息出現；
# 也沒有 Y4_PATH——日本路線讀檔後先演「大四要怎麼過？」（8/5 返台那晚，在家），腳本在它演到一半時開手機，走不進 Café。大四的情境一律補上「早就過了的主線」：
BASEF = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'Y4_PATH': 'bar'}
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


async def launch(p, run, base, key, h, zone, preflags=None, rels=None, dating=(), flags=None, quiet=True, label=''):
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
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, list(dating), flags or {}]))
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



async def settle(pg, cdp, run, label, rounds=3):
    """讀檔後如果有事件在演（換場景、淡入淡出中間 drive 會以為沒事），多等幾輪，直到連續一輪什麼都沒有"""
    for _ in range(rounds):
        ch = await drive(pg, cdp, run, max_s=90, label=label); await pg.wait_for_timeout(2500)
        s = await L.state(pg)
        if not ch and not s['dlg'] and not s['choices'] and not s.get('busy'): break


async def go_cafe(pg, cdp, run, label):
    """手機「地點」進 Café；沒去成（事件還在演、手機被收走）就先演完再按，最多三次；回傳（到了沒, 第幾次）"""
    for k in range(3):
        if await quick_go(pg, cdp, 'cafe'): return True, k + 1
        st = await pg.evaluate(STATE); say('   %s 第 %d 次手機「地點」沒進 Café（%s）' % (label, k + 1, J(st)))
        await settle(pg, cdp, run, label)
    return False, 3


# 2026-10-22 aa296：HOOK 多記「提示」（GAME.toast，例：「手機響了。」）
HOOK2 = """(()=>{ if(window.__LOGT) return; window.__LOGT=1; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(a){ try{ (window.__LOG=window.__LOG||[]).push({n:'［提示］', t:String(a||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
BASE0 = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True}
AN, ZQ, KX, PS, ZR = 'heroine_01', 'heroine_04', 'kexin', 'classmate_peishan', 'heroine_02'
SAID = "(()=>(window.__LOG||[]).map(x=>[x.n,x.t,x.at]))()"
FL = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"
MEM = """(([id,tag])=>{ const s=GAME.G.social||{}, L=(s.mem&&s.mem[id])||[]; const m=L.find(x=>x.tag===tag); if(m) return m.note||''; try{ const M=SOCIAL.memories?SOCIAL.memories(id):[]; const x=(M||[]).find(y=>y.tag===tag); return x?(x.note||''):null; }catch(e){ return null; } })"""


def caps(log):
    return [x['t'] for x in log if x['n'] == '［字幕］']


def toasts(log):
    return [x['t'] for x in log if x['n'] == '［提示］']


def cards(log):
    return [x['t'] for x in log if x['n'] == '［日期卡］']


def chs(log):
    out = []
    for x in log:
        if x['n'] == '［選項］':
            try: out.append(json.loads(x['t']))
            except Exception: out.append(x['t'])
    return out


def seq_in(T, want):
    """want 的句子照順序出現在 T 裡（中間可以夾別的）"""
    i = 0
    for t in T:
        if i < len(want) and t == want[i]: i += 1
    return i == len(want)


async def bed2(pg, cdp, run, prefix, label='', home='dorm'):
    """這一區有床就用這一張（美國公寓也有）；沒有才回宿舍。prefix 依序找（字串或 tuple）"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it:
        await quick_go(pg, cdp, home)
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=120, lv=it[2]); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    ops = []
    for _ in range(12):
        ops = await opts(pg)
        if ops: break
        await pg.wait_for_timeout(600)
    say('   %s 床：%s' % (label, ops))
    pre = prefix if isinstance(prefix, tuple) else (prefix,)
    k = next((i for p in pre for i, o in enumerate(ops) if o.startswith(p)), None)
    if k is not None: await tap_idx(pg, cdp, k); await pg.wait_for_timeout(2000)
    return ops, (ops[k] if k is not None else None)


async def sleep2(pg, cdp, run, prefix=('睡到明天',), label='', home='dorm'):
    st0 = await pg.evaluate(STATE); r = await bed2(pg, cdp, run, prefix, label, home)
    ops, got = r if r else ([], None)
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=300, label=label)
    await pg.wait_for_timeout(4000)
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)
    return ops, got, ok


async def post_ps_dm(pg):
    """【前置】消失期（2026-12-18～2027-08-06）你傳給沛珊的一則：2027-03-15 20:00「生日快樂」"""
    return await pg.evaluate("""(()=>{ const G=GAME.G, d=STORY.dayOfKey('2027-03-15'); PHONE.postAt(G,{th:'p:classmate_peishan',from:'player',text:'生日快樂'},d,20);
      delete G.flags.PS_BACK_READ; G.flags.dating_classmate_peishan=false; return (G.msgs||[]).filter(m=>m.th==='p:classmate_peishan'&&m.from==='player').map(m=>[CALENDAR.dateOf(m.day).key,m.h,m.text]); })()""")


async def outq(pg, rx):
    return await pg.evaluate(OUTQ + "(%s)" % json.dumps(rx))


async def wait_out(pg, cdp, run, oid, max_s, label, picks=None, also=None):
    cond = "(OUT.rec(GAME.G).some(q=>q.id===%s&&q.state!=='planned'))%s" % (json.dumps(oid), ('||(' + also + ')') if also else '')
    return await wait_for(pg, cdp, run, cond, max_s=max_s, picks=picks, go=('接起來',), label=label)


def prompts(ch):
    return [c for c in (ch or []) if any(o.startswith('接起來') for o in c['opts'])]


ZR, ZQ = 'heroine_02', 'heroine_04'
ZZQ = """(()=>{ const G=GAME.G, R=(G.flags||{}).ZZ||null; return R?{state:R.state, yt:R.yt, lastDay:R.lastDay!=null?CALENDAR.dateOf(R.lastDay).key:null, ev:Object.fromEntries(Object.entries(R.ev||{}).map(([k,v])=>[k,{day:v&&v.day!=null?CALENDAR.dateOf(v.day).key:null,seen:!!(v&&v.seen)}])),
  dating:!!G.flags.ZZ_DATING, saw1:!!G.flags.YT_SAW_ZZ_1, saw2:!!G.flags.YT_SAW_ZZ_2, up:(ZRZQ.upcoming?ZRZQ.upcoming(G):[]).map(u=>CALENDAR.dateOf(u.day).key+' '+(+u.h).toFixed(2))}:null; })()"""
WANT = """(k=>{ const L=ZRZQ_LINES; let a=L[k]||[]; return a.filter(x=>Array.isArray(x)&&typeof x[1]==='string').map(x=>x[1]); })"""
ZZSET = """(([state,evs])=>{ const G=GAME.G, F=G.flags; delete F.ZZ; const R=ZRZQ.rec(G); R.state=state; R.since=STORY.dayOfKey('2026-02-23'); R.yt=state==='friends'?'none':'hint';
  for(const [id,k] of evs||[]){ const d=STORY.dayOfKey(k); R.ev[id]={day:d,seen:true,term:'Y1S2'}; R.lastDay=d; const E=G.events; E.done[id]=(E.done[id]||0)+1; E.last[id]=d; }
  return {state:R.state, ev:Object.keys(R.ev), stZR:DATE.stageNum('heroine_02'), stZQ:DATE.stageNum('heroine_04')}; })"""
ZZF = dict(TWF, **BASE0)


async def zz_wait_scene(pg, cdp, run, sid, first_line, until_js, max_s=900):
    """站著等：時間到了遊戲自己帶到場、演（不按任何東西，只點對話）"""
    n0 = await log_len(pg)
    ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.t===%s)||(%s)" % (json.dumps(first_line), until_js), max_s=max_s, label=sid)
    pos = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; return {zone:GAME.G.zone, x:+P.x.toFixed(1), z:+P.z.toFixed(1), h:+(+GAME.G.hour).toFixed(2)}; })()")
    await run.shot(pg, '%s_scene' % sid)
    await drive(pg, cdp, run, max_s=150, label=sid); await pg.wait_for_timeout(2000)
    return n0, pos


async def zz_launch(p, run, base, sid, key, h, zone, rels, state, evs, label):
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, zone, preflags=ZZF, rels=rels, label=sid + label)
    await pg.evaluate(HOOK2); z = await pg.evaluate(ZZSET + "(%s)" % json.dumps([state, evs]))
    run.setup('[前置] %s：芷若×子晴的狀態 %s、已經演過 %s；關係 %s → %s' % (sid, state, [e[0] for e in evs] or '—', J(rels), J(z)))
    return b, pg, cdp, errs, z


@guard
async def s_z41(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, z = await zz_launch(p, run, base, sid, '2026-03-11', 21.2, 'dorm', {ZR: 'FRIEND', ZQ: 'FRIEND'}, 'friends', [], '（大一下第 3 週；2026-03-11（三）21:12 宿舍）')
    try:
        want = await pg.evaluate(WANT + "('HOME')"); intro = await pg.evaluate("ZRZQ_LINES.IN.home.dorm")
        n0, pos = await zz_wait_scene(pg, cdp, run, sid, want[0] if want else '', "GAME.G.hour>=23.5||GAME.G.day>%d" % (await dayk(pg, '2026-03-11')))
        L1 = await log_since(pg, n0); T = texts(L1); zz = await pg.evaluate(ZZQ); res['said'] = T; res['pos'] = pos; res['zz'] = zz
        at = [x['at'] for x in L1 if want and x['t'] == want[0]]
        run.check('%s：21:30 站著不動＝遊戲自己帶到溫州街 Café 門口（%s；開始演 %s）' % (sid, J(pos), at[:1]), pos['zone'] == 'wenzhou' and abs(pos['x'] - 51.7) < 6 and abs(pos['z']) < 6 and bool(at) and at[0].startswith('2026-03-11 21.8'), J({'pos': pos, 'at': at}))
        run.check('%s：先一句宿舍版的旁白「%s…」，接 4-1 照稿 %d 句' % (sid, intro[:16], len(want)), intro in T and seq_in(T, want), J({'said': T}, 900))
        run.check('%s：演完＝狀態 feelings_emerging、YT_SAW_ZZ_1；下一場排在 4/30（四）16:40' % sid, zz['state'] == 'feelings_emerging' and zz['saw1'] and '2026-04-30 16.67' in zz['up'], J(zz))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_z42(p, run, base, sid, out):
    res = out.setdefault(sid, {}); pursue = sid == 'Z42_PURSUE'
    rels = {ZR: 'CLOSE' if pursue else 'FRIEND', ZQ: 'FRIEND'}
    b, pg, cdp, errs, z = await zz_launch(p, run, base, sid, '2026-04-30', 16.4, 'campus', rels, 'feelings_emerging', [['ev_zz_home_together', '2026-03-11']],
                                         '（大一下第 10 週；2026-04-30（四）16:24 校園%s）' % ('；芷若到第 4 階＝甲（祐廷在追她）' if pursue else ''))
    try:
        if pursue: run.check('%s：【前置】芷若第 4 階（甲成立）' % sid, z['stZR'] >= 4, J(z))
        want = (await pg.evaluate(WANT + "('NEXT_FRIEND')")) + (await pg.evaluate(WANT + "('NEXT')"))
        n0, pos = await zz_wait_scene(pg, cdp, run, sid, want[0] if want else '', "GAME.G.hour>=18.2||GAME.G.day>%d" % (await dayk(pg, '2026-04-30')))
        L1 = await log_since(pg, n0); T = texts(L1); zz = await pg.evaluate(ZZQ); res['said'] = T; res['pos'] = pos; res['zz'] = zz
        run.check('%s：16:40 遊戲自己帶到公館（二輪戲院門口；%s）' % (sid, J(pos)), pos['zone'] == 'gongguan', J(pos))
        run.check('%s：4-2 照稿（兩個都是朋友＝朋友版開頭）' % sid, bool(want) and seq_in(T, want), J({'want': want[:4], 'said': T}, 900))
        run.check('%s：演完＝狀態 mutual_interest%s' % (sid, '（甲只擋 4-4，4-2 照演）' if pursue else ''), zz['state'] == 'mutual_interest' and zz['saw2'], J(zz))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_z44(p, run, base, sid, out):
    res = out.setdefault(sid, {}); pursue = sid == 'Z44_PURSUE'
    rels = {ZR: 'CLOSE' if pursue else 'FRIEND', ZQ: 'FRIEND'}
    b, pg, cdp, errs, z = await zz_launch(p, run, base, sid, '2026-06-05', 14.25, 'campus', rels, 'mutual_interest',
                                         [['ev_zz_home_together', '2026-03-11'], ['ev_zz_next_time', '2026-04-30'], ['ev_zz_zq_mind', '2026-05-14']],
                                         '（大一下第 15 週；2026-06-05（五）14:15 校園%s）' % ('；芷若到第 4 階＝甲' if pursue else ''))
    try:
        d = await dayk(pg, '2026-06-05')
        if pursue:
            run.check('%s：【前置】芷若第 4 階（甲成立）' % sid, z['stZR'] >= 4, J(z))
            n0 = await log_len(pg)
            ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=18.1||GAME.G.day>%d" % d, max_s=900, label=sid)
            T = texts(await log_since(pg, n0)); zz = await pg.evaluate(ZZQ); res['said'] = T; res['zz'] = zz
            run.check('%s：甲＝6/5 14:30～18:00 沒有帶到醉月湖、沒有演 4-4；狀態還是 mutual_interest（順延到下一個學期）' % sid,
                      zz['state'] == 'mutual_interest' and 'ev_zz_serious' not in zz['ev'] and not any('醉月湖' in t for t in caps(await log_since(pg, n0))), J({'zz': zz, 'said': T[-6:]}))
        else:
            want0 = await pg.evaluate("(()=>{ const s=ZRZQ.slotOf('serious','Y1S2'), c=ZRZQ.seriousCtx(GAME.G,s); return ZRZQ_TOLINES(ZRZQ.seriousLines(GAME.G,c)).filter(x=>x&&typeof x.text==='string').map(x=>x.text.split('{name}').join(GAME.G.name||'祐廷')); })()")   # {name}＝玩家名字（v6_zrzq 第一次：腳本沒換，FAIL 在「{name}心想」那一句）
            n0, pos = await zz_wait_scene(pg, cdp, run, sid, want0[0] if want0 else '', "GAME.G.hour>=18.1||GAME.G.day>%d" % d)
            L1 = await log_since(pg, n0); T = texts(L1); zz = await pg.evaluate(ZZQ); res['said'] = T; res['pos'] = pos; res['zz'] = zz
            run.check('%s：14:30 遊戲自己帶到醉月湖（%s）' % (sid, J(pos)), pos['zone'] == 'campus' and abs(pos['x'] + 34.5) < 8 and abs(pos['z'] + 97.2) < 8, J(pos))
            run.check('%s：4-4 照稿（%d 句）' % (sid, len(want0)), bool(want0) and seq_in(T, want0), J({'want': want0[:4], 'said': T}, 900))
            run.check('%s：演完＝兩個人交往（ZZ dating、ZZ_DATING）' % sid, zz['state'] == 'dating' and zz['dating'], J(zz))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_bkk(p, run, base, sid, out):
    """3256ce62：芷若×子晴交往中，大三暑假 7/3～7/7 芷若在曼谷（沒交往＝照舊回台中）"""
    res = out.setdefault(sid, {})
    for dating in (True, False):
        tag = '%s_%s' % (sid, 'dating' if dating else 'friends')
        b, pg, cdp, errs, z = await zz_launch(p, run, base, tag, '2028-07-04', 15.0, 'campus', {ZR: 'FRIEND', ZQ: 'FRIEND'}, 'dating' if dating else 'mutual_interest',
                                             [['ev_zz_home_together', '2026-03-11'], ['ev_zz_next_time', '2026-04-30']] + ([['ev_zz_serious', '2026-06-05']] if dating else []),
                                             '（2028-07-04（二）15:00 校園；芷若×子晴 %s）' % ('交往中' if dating else '還沒交往'))
        try:
            pr = await pg.evaluate("(()=>{ const p=STORY.presence('heroine_02',GAME.G)||{}; return {here:p.here, away:p.away||'', kind:p.kind||'', signal:!!p.signal, bkk:!!(ZRZQ.bkkWith&&ZRZQ.bkkWith(GAME.G))}; })()")
            row = None
            await phone_tab(pg, cdp, 'friends')
            row = await pg.evaluate("(()=>{ const r=[...document.querySelectorAll('#phoneBody .item')].find(e=>/芷若/.test(e.innerText||'')); return r?r.innerText.replace(/\\n/g,'｜'):null; })()")
            await run.shot(pg, '%s_friends' % tag); await L.phone_away(pg, cdp)
            res[tag] = {'presence': pr, 'row': row}
            if dating: run.check('%s：交往中＝7/4 芷若在曼谷（presence 不在臺北、away 寫曼谷；手機朋友頁：%s）' % (tag, row), pr['here'] is False and '曼谷' in pr['away'] and pr['bkk'], J(res[tag]))
            else: run.check('%s：還沒交往＝7/4 芷若照舊回台中（不是曼谷）' % tag, pr['here'] is False and '曼谷' not in pr['away'] and not pr['bkk'], J(res[tag]))
        finally: await finish_page(run, tag, {}, errs, b)


ORDER = ['Z41_HOME', 'Z42_NEXT', 'Z42_PURSUE', 'Z44_SERIOUS', 'Z44_PURSUE', 'BKK']
FN = {'Z41_HOME': s_z41, 'Z42_NEXT': s_z42, 'Z42_PURSUE': s_z42, 'Z44_SERIOUS': s_z44, 'Z44_PURSUE': s_z44, 'BKK': s_bkk}


async def main():
    run = L.Run('zrzq', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'zrzq.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
