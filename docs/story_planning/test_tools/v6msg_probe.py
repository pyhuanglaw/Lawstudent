"""BB（帳號 A）2026-10-22：RELEASE-9106-TEST（LAWWW 12:04 派，開發分支 91c5c7ea）第 4、5 項——
  第 4 項（3740c127、0bb6e8c0）交往中的可昕「祐廷在國外」兩則＋人在國外時，臺灣朋友的「深夜」照她那邊的時間：
    MX_US1136  美國路線、人在美國，當地 11:36（她 23:36）傳「在幹嘛」→「我這邊要睡了。」「你那邊應該才剛開始。」
    MX_JP0036  日本路線、人在日本，當地 00:36（她 23:36）→「我這邊十二點了。」「你那邊一點了，快去睡。」，當天回
    MX_US0200  美國當地 02:00（她 14:00）傳給可昕、阿凱：回的不是「深夜」那一類（例：可昕「睡不著。」、阿凱「醒著 剛吃完宵夜」）
    MX_JP2340  日本當地 23:18（她 22:18）傳給可昕：不是「深夜」那一類
    MX_TW2340  對照：在臺灣 23:36 傳給可昕：「深夜」那一類
  第 5 項（958c3fc1）ZR_FY：
    FY_F3      臺灣路線 2028-05-29 21:00 奕廷打來（接起來、選「說你剛好有兩張票。」）→ 芷若接受（ZZ fy seeing）→ ZR_FY true
    FY_PC      接 FY_F3 的存檔跳到 2029-04-20：宿舍的四月明信片，最後一行「另一種筆跡」旁白
    FY_PC_NO   對照：沒有 F3 → 四月那張沒有那一行
    （尾聲芷若「他到現在還記得我每一部看過的電影」在 aa382_probe.py 的 EPI_ZRFY／EPI_ZR）
【前置】讀使用者存檔改日期、時間、地點、路線旗標、關係（每個情境寫在 run.setup）；之後照玩家：手機「朋友」→「訊息」→「傳訊息」→「在幹嘛」、
時間照走等她回（太久才用手機「跳過時間」）；電話「接起來」；走到明信片按互動。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=MX_US1136,... python3 v6msg_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
# BB-B 10-23（LAWWW-B 09:10 查出）：原本預先設了 JP_RETURNED／US_RETURNED＝遊戲當成「已經回臺灣」，時差換算整段沒跑。
#   遊戲只在真的回國那一刻才記（jp3d.js:373、exchange3d.js returnHome）；人在國外＝出發了、還沒有 JP_RETURNED／US_RETURNED（jp3d.js:56、us_life3d.js:48）
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'JP_RETURNED': None, 'AN_SENDOFF': 'together'}
# 2026-10-22 08:3x（候選 364dabe0 第一輪 17 個 FAIL 全是前置不足）：使用者存檔停在 9/3（主線第一天），沒有 afternoonDone——以安（LEGACY_IDS）要 afternoonDone 才照作息出現；
# 也沒有 Y4_PATH——日本路線讀檔後先演「大四要怎麼過？」（8/5 返台那晚，在家），腳本在它演到一半時開手機，走不進 Café。大四的情境一律補上「早就過了的主線」：
BASEF = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'Y4_PATH': 'bar'}
USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': {'$day': '2028-08-02'}, 'US_RETURNED': None}


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


# 2026-10-22 v6msg：RELEASE-9106-TEST 第 4 項（國外訊息、她那邊的時間）、第 5 項（ZR_FY：F3 → 2029 明信片）
HOOK2 = """(()=>{ if(window.__LOGT) return; window.__LOGT=1; const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(a){ try{ (window.__LOG=window.__LOG||[]).push({n:'［提示］', t:String(a||''), at:at()}); }catch(e){} return t0.apply(this,arguments); }; } })()"""
BASE0 = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True}
KX, ZR, FY, KAI = 'kexin', 'heroine_02', 'npc_fangyt', 'kai'
FL = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"
POOLQ = """(id=>((MSG_POOL.people[id]||{}).replies||[]).filter(e=>e.topic==='chat'&&(e.variant==='深夜'||e.variant==='祐廷在國外')).map(e=>({v:e.variant, tags:e.tags||[], msgs:e.msgs})))"""
QUEUED = """(a=>{ const P=PHONE.rec(GAME.G); return (P.q||[]).filter(q=>(q.items||[]).some(it=>it.th==='p:'+a[0]&&it.from===a[0])).map(q=>({d:CALENDAR.dateOf(q.day).key, day:q.day, h:+(+q.h).toFixed(2), tag:q.tag, texts:q.items.filter(it=>it.from===a[0]).map(it=>String(it.text||''))})); })"""
GOT = """(a=>(GAME.G.msgs||[]).slice(a[1]).filter(m=>m.th==='p:'+a[0]).map(m=>({from:m.from||'', t:String(m.text||''), d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2)})))"""
TZQ = "(d=>STORY.tzOffset?STORY.tzOffset(GAME.G,d):null)"
def seq_in(T, want):
    """want 的句子照順序出現在 T 裡（中間可以夾別的）"""
    i = 0
    for t in T:
        if i < len(want) and t == want[i]: i += 1
    return i == len(want)


def prompts(ch):
    return [c for c in (ch or []) if any(o.startswith('接起來') for o in c['opts'])]


async def wait_out(pg, cdp, run, oid, max_s, label, picks=None, also=None):
    cond = "(OUT.rec(GAME.G).some(q=>q.id===%s&&q.state!=='planned'))%s" % (json.dumps(oid), ('||(' + also + ')') if also else '')
    return await wait_for(pg, cdp, run, cond, max_s=max_s, picks=picks, go=('接起來',), label=label)


US_L = ['我這邊要睡了。', '你那邊應該才剛開始。']
JP_L = ['我這邊十二點了。', '你那邊一點了，快去睡。']


async def send_chat(pg, cdp, run, pid, label):
    """手機 → 朋友 → 那個人的「訊息」→「傳訊息」→「在幹嘛」（照玩家點）。回傳 dict：傳出去沒有、送之前 G.msgs 長度、當時時間、排好的回覆"""
    await phone_tab(pg, cdp, 'friends')
    a = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msg]')].find(b=>b.dataset.msg===%s)" % json.dumps(pid))
    b2 = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msgto]')].find(b=>b.dataset.msgto===%s)" % json.dumps(pid))
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length"); st = await pg.evaluate(STATE)
    c = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msgt]')].find(b=>b.dataset.msgt===%s)" % json.dumps(pid + '|chat'))
    await pg.wait_for_timeout(1200); await run.shot(pg, '%s_sent_%s' % (label, pid))
    q = await pg.evaluate(QUEUED + "(%s)" % json.dumps([pid]))
    mine = [m for m in await pg.evaluate(GOT + "(%s)" % json.dumps([pid, n0])) if m['from'] == 'player']
    say('   %s 傳「在幹嘛」給 %s（%s %.2f）：訊息 %s、傳訊息 %s、話題 %s → %s；我傳的 %s；排好的回覆 %s' % (label, pid, st['key'], st['h'], bool(a), bool(b2), tops, c, J(mine, 200), J(q, 400)))
    await L.phone_away(pg, cdp)
    return {'ok': bool(c) and bool(mine), 'n0': n0, 'st': st, 'q': q, 'mine': mine, 'tops': tops}


async def wait_reply(pg, cdp, run, pid, n0, max_s, label, want=None):
    """時間照走等她回（不跳過時間）；max_s 秒還沒回，就手機「跳過時間」到下一段再看。
    want＝傳的時候排進佇列的那一則回覆的最後一句（BB-B 10-23：MX_TW2340 先收到她的週年預告，原本一收到她的任何一則就停）"""
    cond = "(GAME.G.msgs||[]).slice(%d).some(m=>m.th==='p:%s'&&m.from===%s%s)" % (n0, pid, json.dumps(pid), ('&&String(m.text||"")===' + json.dumps(want, ensure_ascii=False)) if want else '')
    ok, ch = await wait_for(pg, cdp, run, cond, max_s=max_s, label=label)
    how = '時間照走'
    if not ok:
        for pre in ('等到中午', '等到傍晚', '等到晚上'):
            await skip(pg, cdp, pre, label); how = '跳過時間「%s」' % pre
            if await pg.evaluate(cond): ok = True; break
    got = [m for m in await pg.evaluate(GOT + "(%s)" % json.dumps([pid, n0])) if m['from'] == pid]
    return ok, got, how


def her(got):
    return [m['t'] for m in got]


def reply_of(R):
    """BB-B 10-23：她「回這一則」的那幾句＝傳的時候排進 MSG 佇列的回覆（send.q，tag 空的第一筆），而且真的收到了。
    原本把傳出去以後她傳的每一則都當回覆：MX_TW2340 先收到交往週年的預告（「下禮拜二。第四年。……」），被當成回覆。"""
    got = R['got']; T = her(got)
    q = [x for x in (R['send'].get('q') or []) if not x.get('tag') and x.get('texts')]
    if q and all(w in T for w in q[0]['texts']):
        m = next(m for m in got if m['t'] == q[0]['texts'][0]); return q[0]['texts'], m.get('d'), m.get('h')
    return T, (got[0]['d'] if got else None), (got[0]['h'] if got else None)


async def one_send(pg, cdp, run, res, sid, pid, max_s=600):   # BB-B 10-23：240 → 600 秒（MX_JP2340 回覆排在 23:48，240 秒遊戲時間還沒走到）
    s = await send_chat(pg, cdp, run, pid, sid)
    q = [x for x in (s.get('q') or []) if not x.get('tag') and x.get('texts')]
    ok, got, how = await wait_reply(pg, cdp, run, pid, s['n0'], max_s, sid, want=(q[0]['texts'][-1] if q else None)) if s['ok'] else (False, [], '沒傳成')
    st = await pg.evaluate(STATE); tz = await pg.evaluate(TZQ + "(%d)" % st['day'])
    r = {'send': s, 'got': got, 'how': how, 'end': st, 'tz': tz}; res.setdefault('sends', {})[pid] = r
    say('   %s %s 回（%s）：%s' % (sid, pid, how, J(got, 400)))
    if got: await phone_tab(pg, cdp, 'friends'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-msg]')].find(b=>b.dataset.msg===%s)" % json.dumps(pid)); await run.shot(pg, '%s_reply_%s' % (sid, pid)); await L.phone_away(pg, cdp)
    return r


MXS = {
    # sid: (路線, 日期, 時間, 地點, 說明, 要傳的人)
    'MX_US1136': ('US', '2028-10-12', 11.6, 'us_apartment', '美國路線、人在美國；2028-10-12（四）當地 11:36（臺灣 23:36）', [KX]),
    'MX_JP0036': ('JP', '2028-04-10', 0.6, 'jp_room', '日本路線、人在日本；2028-04-10（一）當地 00:36（臺灣 4/9 23:36）', [KX]),
    'MX_US0200': ('US', '2028-10-13', 1.95, 'us_apartment', '美國路線、人在美國；2028-10-13（五）當地 01:57（臺灣 13:57）', [KX, KAI]),
    'MX_JP2340': ('JP', '2028-04-11', 23.3, 'jp_room', '日本路線、人在日本；2028-04-11（二）當地 23:18（臺灣 22:18；傳的時候她那邊要在 23:00 以前）', [KX]),
    'MX_TW2340': ('TW', '2028-10-12', 23.6, 'dorm', '對照：臺灣路線、在宿舍；2028-10-12（四）23:36', [KX, KAI]),
}


@guard
async def s_mx(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    route, key, h, zone, desc, who = MXS[sid]
    pf = dict(BASEF, **{'US': USF, 'JP': JPF, 'TW': TWF}[route])
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, zone, preflags=pf, rels={KAI: 'FRIEND'}, dating=(KX,), label='%s（%s；和可昕交往中）' % (sid, desc))
    try:
        await pg.evaluate(HOOK2); res['pre'] = r
        pool = {pid: await pg.evaluate(POOLQ + "(%s)" % json.dumps(pid)) for pid in who}
        night = {pid: [x['msgs'] for x in pool[pid] if x['v'] == '深夜'] for pid in who}
        res['pool'] = pool; say('   %s 回覆池（深夜／祐廷在國外）：%s' % (sid, J(pool, 600)))
        for pid in who:
            R = await one_send(pg, cdp, run, res, sid, pid)
            t, dd, hh = reply_of(R)
            run.check('%s：手機傳得出「在幹嘛」給 %s' % (sid, pid), R['send']['ok'], J(R['send'], 300))
            if not R['send']['ok']: continue
            if sid == 'MX_US1136':
                run.check('%s：可昕回「%s」「%s」（祐廷在國外・美國路線）' % (sid, US_L[0], US_L[1]), t == US_L, J({'her': t, 'at': [dd, hh], 'tz': R['tz'], 'q': R['send']['q']}))
            elif sid == 'MX_JP0036':
                run.check('%s：可昕回「%s」「%s」（祐廷在國外・日本路線），當天回（4/10，不是隔天早上）' % (sid, JP_L[0], JP_L[1]), t == JP_L and dd == key, J({'her': t, 'at': [dd, hh], 'tz': R['tz'], 'q': R['send']['q']}))
            elif sid in ('MX_US0200', 'MX_JP2340'):
                sh = R['send']['st']['h'] - (1 if sid == 'MX_JP2340' else 12)
                if sid == 'MX_JP2340' and not (0 <= sh < 23): run.note('%s：傳的時候她那邊 %.2f，已經不在 23:00 以前（這一次不判）' % (sid, sh)); continue
                bad = [m for m in night[pid] if m == t] + ([t] if t in (US_L, JP_L) else [])
                run.check('%s：%s 回的不是「深夜」那一類（她那邊是 %s），也不是「祐廷在國外」：%s' % (sid, pid, '下午' if sid == 'MX_US0200' else '晚上十點多', J(t)), bool(t) and not bad, J({'her': t, 'at': [dd, hh], 'night': night[pid]}))
            elif sid == 'MX_TW2340':
                if pid == KX: run.check('%s：對照——可昕回「深夜」那一類（在臺灣 23:36）：%s' % (sid, J(t)), t in night[pid], J({'her': t, 'night': night[pid]}))
                else: run.note('%s：對照 %s 在臺灣 23:36 回 %s（深夜那一類：%s；不判）' % (sid, pid, J(t), t in night[pid]))
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 第 5 項：F3 芷若接受奕廷 → ZR_FY → 2029 四月明信片「另一種筆跡」
PC_APR = ['論文開始寫了。題目還是很小。', '每天寫五百字，寫完去公園坐一下。']
PC_FY = '（四月那張的最後一行，是另一種筆跡：「這棵樹叫英國櫟。……他說的。」）'
ZZQ = "(()=>{ const F=GAME.G.flags, R=F.ZZ||{}; return {FANG_F3:F.FANG_F3==null?null:F.FANG_F3, F3_DAY:F.FANG_F3_DAY==null?null:CALENDAR.dateOf(F.FANG_F3_DAY).key, fy:R.fy||null, f3:R.f3||null, state:R.state||null, ZR_FY:F.ZR_FY===undefined?null:F.ZR_FY}; })()"
SNAP = {}


@guard
async def s_fy_f3(p, run, base, sid, out):
    """臺灣路線 5/29 21:00 奕廷打來（接起來、選「說你剛好有兩張票。」）→ 芷若接受（ZZ fy seeing）→ ZR_FY true（958c3fc1 以前永遠不會設）"""
    res = out.setdefault(sid, {})
    pf = dict(TWF, **BASE0)
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-05-29', 20.5, 'dorm', preflags=pf, rels={ZR: 'FAMILIAR', FY: 'FAMILIAR'}, quiet=False, label=sid + '（臺灣路線；2028-05-29（一）20:30 宿舍；芷若熟悉、奕廷熟悉、都沒交往；事件系統開著）')
    try:
        await pg.evaluate(HOOK2); n0 = await log_len(pg); res['pre'] = [r, await pg.evaluate(ZZQ)]
        ok, ch = await wait_out(pg, cdp, run, 'y3_fang_f3', 900, sid, picks=['「說你剛好有兩張票。」'])
        await drive(pg, cdp, run, picks=['「說你剛好有兩張票。」'], max_s=120, label=sid)
        pr = prompts(ch); T = texts(await log_since(pg, n0)); res['call'] = [pr, T[-10:]]
        ok2, _ = await wait_for(pg, cdp, run, "GAME.G.flags.ZR_FY===true", max_s=120, label=sid)
        z = await pg.evaluate(ZZQ); res['zz'] = z
        run.check('%s：21:00 問「接起來：方奕廷打電話來」、接了、選「說你剛好有兩張票。」→ FANG_F3 bought' % sid, ok and bool(pr) and z['FANG_F3'] == 'bought', J({'prompts': pr, 'zz': z, 'said': T[-6:]}))
        run.check('%s：芷若接受奕廷＝ZZ fy「seeing」→ ZR_FY true（BUG-ZR-FY-NEVER-SET-1022）' % sid, ok2 and z['fy'] == 'seeing' and z['ZR_FY'] is True, J(z))
        G = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G))")
        SNAP['fy'] = G.get('G', G) if isinstance(G, dict) else None
        if SNAP['fy']: json.dump(SNAP['fy'], open(os.path.join(OUT, 'fy_snap.json'), 'w'), ensure_ascii=False)
        res['snap'] = bool(SNAP['fy'])
    finally: await finish_page(run, sid, res, errs, b)


DIAG_PC2 = """(()=>{ const G=GAME.G, E=GAME.E, S=STORY; const P=R2Y4A.pc2Pending(G);
  const out={zone:G.zone, day:G.day, h:G.hour, pend:P.map(c=>[c.key,c.zone]), its:(E.interactables||[]).length, desk:!!(E.interactables||[]).find(i=>i.deskStudy),
    home:typeof HOME!=='undefined'&&HOME.at?HOME.at(G):null, trip:typeof TRIP!=='undefined'&&TRIP.at?TRIP.at(G):null, busy:!!(GAME.busy||GAME.G.busy), nT:(S.TICKS||[]).length};
  window.__PC2D={hits:{}, y4:0, exch:0, calls:0};
  if(!S.__pc2wrap){ S.__pc2wrap=true; S.TICKS.forEach((f,i)=>{ S.TICKS[i]=function(GM,dt){ const r=f(GM,dt); window.__PC2D.calls++; if(r) window.__PC2D.hits[i]=(window.__PC2D.hits[i]||0)+1; return r; }; });
    const y0=S.y4Tick; S.y4Tick=function(){ const r=y0.apply(this,arguments); if(r) window.__PC2D.y4++; return r; };
    if(typeof EXCH!=='undefined'&&EXCH.tick){ const e0=EXCH.tick; EXCH.tick=function(){ const r=e0.apply(this,arguments); if(r) window.__PC2D.exch++; return r; }; } }
  try{ R2Y4A.pc2Place(GAME); out.manual=!!(E.interactables||[]).find(i=>i.zrPostcard2); }catch(e){ out.manualErr=String(e); }
  return out; })()"""


async def pc_apr(p, run, base, sid, res, from_fy):
    pf = dict(TWF, **BASEF)   # 大四下：Y4_PATH 早就選過了（不然讀檔先演「大四要怎麼過？」）
    if not from_fy: pf.update({'FANG_F3': None, 'FANG_F3_DAY': None, 'ZR_FY': None, 'ZZ': None})
    b, pg, cdp, errs, r = await launch(p, run, base, '2029-04-20', 12.6, 'dorm', preflags=pf, rels={ZR: 'FRIEND', FY: 'FAMILIAR'},
                                       label=sid + ('（FY_F3 的存檔接著：5/29 芷若接受奕廷以後；跳到 2029-04-20（五）12:36 宿舍）' if from_fy else '（對照：沒有 F3（芷若沒選奕廷）；2029-04-20（五）12:36 宿舍）'))
    try:
        await pg.evaluate(HOOK2); res['pre'] = [r, await pg.evaluate(ZZQ)]
        pre = await pg.evaluate("""(()=>{ const G=GAME.G, R=R2Y4A.pc2Rec(G); const L=[];
          const cards=R2Y4A.pc2Cards(G); for(const c of cards){ if(c.key<'2029-04-20'){ R.read[c.key]=STORY.dayOfKey(c.key); if(!G.flags.ZR_POSTCARD2.includes(c.m)) G.flags.ZR_POSTCARD2.push(c.m); L.push(c.key); } }
          R.first=R.first||STORY.dayOfKey('2028-09-22'); return {read:L, pending:R2Y4A.pc2Pending(G).map(c=>c.key)}; })()""")
        run.setup('[前置] %s：2028-09～2029-03 那七張當成已經讀過（不回寄）：%s → 剩下 %s' % (sid, pre.get('read'), pre.get('pending')))
        res['pcpre'] = pre
        await pg.wait_for_timeout(3000)
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.zrPostcard2&&!i.hidden); return it?[it.x,it.z,it.label]:null; })()")
        res['it'] = it
        if not it:   # BB-B 10-23 第二次診斷：再等 20 秒（每 2 秒看一次）、看畫面狀態，再直接叫 R2Y4A.tick 一次
            seen = None
            for k in range(10):
                await pg.wait_for_timeout(2000)
                seen = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.zrPostcard2&&!i.hidden); return it?[it.x,it.z,it.label]:null; })()")
                if seen: break
            res['diag0'] = {'after_wait': seen, 'waited_s': 3 + 2 * (k + 1), 'state': await L.state(pg)}
            if not seen:
                res['diag'] = await pg.evaluate(DIAG_PC2.replace("try{ R2Y4A.pc2Place(GAME);", "try{ out.tickRet=R2Y4A.tick(GAME,0.5); out.afterTick=!!(E.interactables||[]).find(i=>i.zrPostcard2); R2Y4A.pc2Place(GAME);"))
                await pg.wait_for_timeout(4000); res['diag2'] = await pg.evaluate("window.__PC2D||null")
            it = seen or it
        run.check('%s：宿舍書桌旁有「明信片」' % sid, bool(it), J({'it': it, 'diag0': res.get('diag0'), 'diag': res.get('diag'), 'diag2': res.get('diag2')}, 1400))
        if not it: return
        await L.go_to(pg, cdp, run, it[0], it[1], 0.6, '明信片', max_s=120)
        lab = await pg.evaluate(LAB); tried = [['go_to 0.6', lab]]
        if '明信片' not in (lab or ''):   # BB-B 10-23：互動鈕是「坐在書桌前」＝明信片被書桌蓋住？在明信片四周找一個會出「明信片」的位置（找得到＝腳本走的位置不對；八個方向都找不到＝玩家讀不到）
            import math as _m
            for k in range(9):
                tx, tz = (it[0], it[1]) if k == 0 else (it[0] + 0.45 * _m.cos(k * _m.pi / 4), it[1] + 0.45 * _m.sin(k * _m.pi / 4))
                await L.go_to(pg, cdp, run, tx, tz, 0.15, '明信片旁 %d' % k, max_s=60); await pg.wait_for_timeout(800)
                lab = await pg.evaluate(LAB); pp = await pg.evaluate("[+GAME.E.player.obj.position.x.toFixed(2),+GAME.E.player.obj.position.z.toFixed(2)]")
                tried.append([k, pp, lab])
                if '明信片' in (lab or ''): break
        res['reach'] = tried; say('   %s 走到明信片：%s' % (sid, J(tried, 600)))
        run.check('%s：站得到一個互動鈕是「明信片」的位置（書桌旁；不然玩家讀不到）' % sid, '明信片' in (lab or ''), J(tried, 700))
        n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        ch = await drive(pg, cdp, run, picks=['（先不回）'], max_s=150, label=sid)
        T = texts(await log_since(pg, n0)); res['said'] = [lab, T, ch]
        await run.shot(pg, '%s_after' % sid)
        cardq = ['「' + x + '」' for x in PC_APR]
        if from_fy:
            run.check('%s：四月那張（%s）＋最後一行「另一種筆跡」旁白' % (sid, PC_APR[0][:8]), seq_in(T, cardq + [PC_FY]), J({'lab': lab, 'said': T}, 700))
        else:
            run.check('%s：四月那張照原本（%s），沒有「另一種筆跡」那一行' % (sid, PC_APR[0][:8]), seq_in(T, cardq) and PC_FY not in T, J({'lab': lab, 'said': T}, 700))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_fy_pc(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    snap = SNAP.get('fy')
    if not snap:
        fp = os.path.join(OUT, 'fy_snap.json')
        if os.path.exists(fp): snap = json.load(open(fp, encoding='utf-8'))
    if not snap:
        run.check('%s：要接 FY_F3 的存檔（FY_F3 沒有存到，這項沒跑）' % sid, False, ''); return
    await pc_apr(p, run, snap, sid, res, True)


@guard
async def s_fy_pc_no(p, run, base, sid, out):
    await pc_apr(p, run, base, sid, out.setdefault(sid, {}), False)


# BB-B 10-23 11:0x：LAWWW-B a89f1815b 修了明信片的位置（宿舍 d.x+0.35；美國公寓改放 (2.85,-1.8)），請加測美國公寓那幾張（2028-09～12，美國路線、她在美國）
async def pc_us(p, run, base, sid, res, key):
    pf = dict(USF, **BASEF); pf['Y4_PATH'] = 'other'
    b, pg, cdp, errs, r = await launch(p, run, base, key, 12.6, 'us_apartment', preflags=pf, rels={ZR: 'FRIEND'}, label=sid + '（美國路線、人在美國；%s 12:36 公寓）' % key)
    try:
        await pg.evaluate(HOOK2)
        pre = await pg.evaluate("""(k=>{ const G=GAME.G, R=R2Y4A.pc2Rec(G); const L=[]; for(const c of R2Y4A.pc2Cards(G)){ if(c.key<k){ R.read[c.key]=STORY.dayOfKey(c.key); G.flags.ZR_POSTCARD2=G.flags.ZR_POSTCARD2||[]; if(!G.flags.ZR_POSTCARD2.includes(c.m)) G.flags.ZR_POSTCARD2.push(c.m); L.push(c.key); } }
          R.first=R.first||STORY.dayOfKey('2028-09-22'); return {read:L, pending:R2Y4A.pc2Pending(G).map(c=>c.key+'@'+c.zone), abroad:!!STORY.abroad(G), route:STORY.route(G)}; })(%s)""" % json.dumps(key))
        run.setup('[前置] %s：%s 以前的當成讀過：%s → 剩下 %s（abroad %s、路線 %s）' % (sid, key, pre.get('read'), pre.get('pending'), pre.get('abroad'), pre.get('route')))
        it = None
        for k in range(30):   # 11:1x：容器重開後 load 14，24 秒內沒放出來（第一次 9 秒就有）＝最多等 60 秒；還沒有就記狀態、直接叫 R2Y4A.tick 一次（同 FY_PC 第二次診斷）
            await pg.wait_for_timeout(2000)
            it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.zrPostcard2&&!i.hidden); return it?[it.x,it.z,it.label]:null; })()")
            if it: break
        res['waited_s'] = 2 * (k + 1)
        if not it:
            res['diag'] = await pg.evaluate(DIAG_PC2.replace("try{ R2Y4A.pc2Place(GAME);", "try{ out.tickRet=R2Y4A.tick(GAME,0.5); out.afterTick=!!(E.interactables||[]).find(i=>i.zrPostcard2); R2Y4A.pc2Place(GAME);"))
            res['state'] = await L.state(pg)
        res['it'] = it; run.check('%s：公寓裡有「明信片」（等了 %d 秒）' % (sid, res['waited_s']), bool(it), J({'it': it, 'pre': pre, 'diag': res.get('diag'), 'state': res.get('state')}, 1200))
        if not it: return
        # 第一次（11:0x）只等 150 秒：畫面 0.4 fps，人還在往臥室的走道走就停了（截圖 03_PC_US9_at）＝腳本；改成最多 420 秒、沒到再點一次
        lab = ''
        for k in range(2):
            await L.go_to(pg, cdp, run, it[0], it[1], 0.6, '明信片', max_s=420); await pg.wait_for_timeout(800)
            lab = await pg.evaluate(LAB)
            if '明信片' in (lab or ''): break
        pp = await pg.evaluate("[+GAME.E.player.obj.position.x.toFixed(2),+GAME.E.player.obj.position.z.toFixed(2)]")
        res['reach'] = [pp, lab]; await run.shot(pg, '%s_at' % sid)
        run.check('%s：走得到、互動鈕是「明信片」' % sid, '明信片' in (lab or ''), J({'pos': pp, 'lab': lab, 'it': it}, 400))
        if '明信片' not in (lab or ''): return
        card = await pg.evaluate("(k=>{ const c=R2Y4A.pc2Cards(GAME.G).find(c=>c.key===k); if(!c) return []; const o=[]; const w=v=>{ if(typeof v==='string'){ if(v.length>=6) o.push(v); } else if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object') Object.values(v).forEach(w); }; w(c); return o; })(%s)" % json.dumps(key))
        n0 = await log_len(pg); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        ch = await drive(pg, cdp, run, picks=['（先不回）'], max_s=150, label=sid)
        T = texts(await log_since(pg, n0)); res['said'] = [lab, T, ch]; await run.shot(pg, '%s_after' % sid)
        hit = [c for c in card if any(c in t or t in c for t in T if len(t) >= 6)]
        rd = await pg.evaluate("(k=>{ const R=R2Y4A.pc2Rec(GAME.G); return !!(R.read&&R.read[k]!=null); })(%s)" % json.dumps(key))
        run.check('%s：按下去讀得到那一張（卡上的字出現、記成讀過）' % sid, bool(hit) and rd, J({'hit': hit[:3], 'read': rd, 'said': T[:8], 'card': card[:4]}, 700))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_pc_us9(p, run, base, sid, out): await pc_us(p, run, base, sid, out.setdefault(sid, {}), '2028-09-22')
@guard
async def s_pc_us12(p, run, base, sid, out): await pc_us(p, run, base, sid, out.setdefault(sid, {}), '2028-12-15')


ORDER = ['MX_US1136', 'MX_JP0036', 'MX_US0200', 'MX_JP2340', 'MX_TW2340', 'FY_F3', 'FY_PC', 'FY_PC_NO', 'PC_US9', 'PC_US12']
FN = dict({k: s_mx for k in MXS}, FY_F3=s_fy_f3, FY_PC=s_fy_pc, FY_PC_NO=s_fy_pc_no, PC_US9=s_pc_us9, PC_US12=s_pc_us12)


async def main():
    run = L.Run('v6msg', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'v6msg.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    run.finish()

asyncio.run(main())
