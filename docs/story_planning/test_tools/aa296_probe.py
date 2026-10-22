"""BB（帳號 A）2026-10-22：v9.10.6 預告清單第一項（LAWWW 09:25）——AA_296 2-3-1「只用手機演的重要劇情」改成演出來的電話／當面五項（開發分支 958c3fc1 起；任務 AA296-PHONE-LIVE-1021）。
每一通「接一次、不接一次」；跳過時間（或暑假的快轉）碰到她打來要停；睡著＝沒接、給原本的私訊（AA 10-22 08:41）。台詞照 ed0daea9 的稿一字對照（LAWWW 的 tests/aa296_phone_live_unit.js 已逐字比對；這支看玩家實際看到的）。
  AN_SKIP     ① 美國路線、和以安交往中：10/19 當地 07:30 按「跳過時間：等到中午」→ 停在 10:00（臺灣 22:00）「手機響了」→ 只有「接起來」→ 視訊（三選一照 AN18）；AN_CHOICE video
  AN_SLEEP    ① 前一晚 22:00「睡到明天中午」＝睡過＝她原本兩則私訊（10:00）、AN_CHOICE dm
  ZQ_STICKER  ② 子晴 Q15 說了「第一個玩的」→ 6/10 12:00「回答.exe」→ 場面裡選「（回一張插座貓貼紙）」＝交往、接著演她打來
  ZQ_NOREPLY  ② 選「（還沒想好怎麼回）」→ 手機按鈕留到 6/11 21:00 → 6/11 跳到 20:00 → 21:00 她打來（有「這次是直述句。」）＝這學期不交往
  ZQ_SLEEP    ② 【前置】「這不是問句」那一支、回答.exe 看過了沒回；6/11 19:30 上床睡到明天＝她原本那一則私訊（拿掉「這次是直述句。」）
  KX_CALL     ③ 畢業後篇、和可昕交往、沒報 2029 國考：12/14 10:00 站著等「下一件事」→ 15:05 她打來（兩個選項、宵夜那一句旁白）
  KX_LATE     ③ 【前置】讀檔在 16:12（那一段不在）＝原本兩則私訊（15:05）
  PS_CALL     ④ 沛珊（消失期你傳過她訊息、沒交往）：8/7 20:20 等到 21:00 她打來（三個選項；選「妳現在在哪？」＝「台中。在家。」台中版）
  PS_FF       ④ 8/7 12:00 宿舍的床「快轉：到下一個有事的日子」＝停在她打來以前，不跳過電話
  PS_SLEEP    ④ 8/7 19:30 上床睡到明天＝她原本兩則私訊（21:00）
  ZR_JP529    ⑤ 日本路線、人在日本：5/29 日本 22:00 奕廷打來（接、選「說你剛好有兩張票。」）→ 待到 22:20：芷若 22:07 那則私訊不傳
  ZR_JP       ⑤ 【前置】日本路線、5/29 答應了奕廷的約（FANG_F3 bought）：8/6 進 Café 跟芷若說話＝過去式那兩句
  ZR_TW       ⑤ 對照：臺灣路線 5/31 進 Café＝原本那兩句
【前置】讀使用者存檔改日期、時間、地點、路線旗標、關係（每個情境寫在 run.setup）；之後照玩家：手機「跳過時間」、床、手機「地點」、走到人旁邊說話、跳出來的「接起來」按下去。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=AN_SKIP,... python3 aa296_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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


# ---------------------------------------------------------------- ① 以安新 18，美國路線、交往中：她打來的視訊
AN_V = ['（視訊。她那邊是晚上十點，你這邊是早上。她把手帳攤在鏡頭前面。）', '我決定了。考台大法研所，商法組。', '昨天先跟我媽說了。……今天跟你說。',
        '公司法、證交法、保險法。我讀這些的時候，不會一直看時間。', '念完以後要當司法官還是去事務所，我還沒想好。……想好了，我會先跟你說。']
AN_OPTS = ['「什麼時候考？」', '「妳媽怎麼說？」', '「讀書會那邊知道嗎？」']
AN_R0 = '明年二月。還有四個月。'; AN_END = ['……你那邊早上十點了。先去上課。', '（她先掛了。）']
AN_DM = ['我決定了。考台大法研所，商法組。', '先跟我媽說了。然後是你。……你那邊早上十點，先去上課。']
ANF = dict(USF, **BASEF, Y4_PATH_DAY={'$day': '2028-06-20'})


@guard
async def s_an_skip(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-19', 7.5, 'us_apartment', preflags=ANF, rels={AN: 'FRIEND'}, dating=(AN,), quiet=False, label=sid + '（美國路線、和以安交往中；2028-10-19（四）當地 07:30 美國公寓）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid)
        st = await pg.evaluate(STATE); q0 = await outq(pg, '^y4_an18'); res['pre'] = [st, q0]; say('   %s 讀檔後 %s；視訊 %s' % (sid, J(st), J(q0)))
        n0 = await log_len(pg)
        got = await skip(pg, cdp, '等到中午', sid); st1 = await pg.evaluate(STATE); L1 = await log_since(pg, n0); res['skip'] = [got, st1, caps(L1)]
        run.check('%s：手機「跳過時間」按「%s」' % (sid, got), bool(got) and got.startswith('等到中午'), J(got))
        run.check('%s：跳過時間停在當地 10:00（臺灣 22:00，她打來的時間），字幕寫「手機響了」（%s %.2f）' % (sid, st1['key'], st1['h']),
                  st1['key'] == '2028-10-19' and abs(st1['h'] - 10) < 0.05 and any('手機響了' in c for c in caps(L1)), J({'st': st1, 'caps': caps(L1)}))
        await run.shot(pg, '%s_stop' % sid)
        ok, ch = await wait_out(pg, cdp, run, 'y4_an18_video', 300, sid, picks=[AN_OPTS[0]])
        ch2 = await drive(pg, cdp, run, picks=[AN_OPTS[0]], max_s=150, label=sid)
        L2 = await log_since(pg, n0); T = texts(L2); res['said'] = T; res['ch'] = (ch or []) + (ch2 or []); pr = prompts(res['ch'])
        run.check('%s：問「接起來」——只有這一個（沒有「不去了」「晚一點」）：%s' % (sid, J(pr[:1], 200)), bool(pr) and len(pr[0]['opts']) == 1 and pr[0]['opts'][0].startswith('接起來：以安打視訊來（台灣 22:00）'), J(pr))
        run.check('%s：視訊（字幕「視訊」）：開頭旁白＋她四句照稿' % sid, '視訊' in caps(L2) and seq_in(T, AN_V), J({'caps': caps(L2), 'said': T}, 900))
        oc = [c for c in chs(L2) if isinstance(c, list) and c and c[0] == AN_OPTS[0]]
        run.check('%s：三個選項照 AN18「%s」，選第一個「%s」→「%s」' % (sid, '」「'.join(AN_OPTS), AN_OPTS[0], AN_R0), bool(oc) and oc[0] == AN_OPTS and AN_R0 in T, J({'opts': chs(L2), 'said': T[-6:]}))
        run.check('%s：結尾「%s」「%s」' % (sid, AN_END[0], AN_END[1]), seq_in(T, AN_END), J(T[-6:]))
        fl = await pg.evaluate(FL + "('AN_CHOICE')"); mem = await pg.evaluate(MEM + "(%s)" % json.dumps([AN, 'AN_CHOICE_TOLD']))
        dm = [m for m in await msgs(pg, 'p:heroine_01') if m['tag'] == 'y4_an18_dm']; q1 = await outq(pg, '^y4_an18'); res['after'] = [fl, mem, dm, q1]
        run.check('%s：接了＝AN_CHOICE video、記憶「第一批知道」、視訊 done；沒有那兩則私訊' % sid, fl == 'video' and mem == '第一批知道' and not dm and any(q['state'] == 'done' for q in q1), J(res['after']))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_an_sleep(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-18', 22.0, 'us_apartment', preflags=ANF, rels={AN: 'FRIEND'}, dating=(AN,), quiet=False, label=sid + '（美國路線、和以安交往中；2028-10-18（三）當地 22:00 美國公寓，前一晚）')
    try:
        await pg.evaluate(HOOK2); await settle(pg, cdp, run, sid); n0 = await log_len(pg)
        ops, got, ok = await sleep2(pg, cdp, run, ('睡到明天中午', '睡到明天下午'), sid, home='us_apartment'); res['bed'] = [ops, got, ok]
        run.check('%s：床有「睡到明天中午」（睡過她打來的當地 10:00），按了「%s」' % (sid, got), bool(got) and got.startswith(('睡到明天中午', '睡到明天下午')), J(ops))
        st = await pg.evaluate(STATE); await drive(pg, cdp, run, max_s=60, label=sid); await pg.wait_for_timeout(3000)
        T = texts(await log_since(pg, n0)); dm = [m for m in await msgs(pg, 'p:heroine_01') if m['tag'] == 'y4_an18_dm']
        fl = await pg.evaluate(FL + "('AN_CHOICE')"); mem = await pg.evaluate(MEM + "(%s)" % json.dumps([AN, 'AN_CHOICE_TOLD'])); q1 = await outq(pg, '^y4_an18'); res['after'] = [st, dm, fl, mem, q1, T[-8:]]
        run.check('%s：睡著＝沒接：醒來（%s %.2f）手機有她的兩則私訊「%s」，時間是 10/19 當地 10:00' % (sid, st['key'], st['h'], '」「'.join(AN_DM)),
                  [m['text'] for m in dm] == AN_DM and all(m['d'] == '2028-10-19' and abs(m['h'] - 10) < 0.05 for m in dm), J(dm))
        run.check('%s：AN_CHOICE dm、記憶「第一批知道」；沒有演視訊' % sid, fl == 'dm' and mem == '第一批知道' and AN_V[0] not in T, J(res['after']))
        await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:heroine_01')"); await pg.wait_for_timeout(800)
        await run.shot(pg, '%s_dm' % sid); await L.phone_away(pg, cdp)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- ② 子晴 Q15「回答.exe」
ZQ_EXE = '（《找插座的貓》的新關卡。貓找到了插座，插座旁邊坐著另一隻貓。兩隻貓一起充電。）'
ZQ_OPTS = ['（回一張插座貓貼紙）', '（還沒想好怎麼回）']
ZQ_CALL = ['（手機震了。是她打來的。）', '……你回貼紙喔。', '插座貓的意思，你知道吧。', '知道。', '……好啦。', '那、那明天見。', '（她先掛了。）']
ZQ_NO = ['（晚上九點。她打來了。）', '……你沒回耶。', '好，我收到你的不回答了。', '我們還是最好的朋友。', '這次是直述句。', '（她沒有等你說話，就掛了。）']
ZQ_NODM = '好，我收到你的不回答了。我們還是最好的朋友。這次是直述句。'; ZQ_NODM_NQ = '好，我收到你的不回答了。我們還是最好的朋友。'
ZQF = dict(TWF, **BASE0)
ZQSET = """(([k,seen])=>{ const G=GAME.G, F=G.flags; F.ZQ_Q15={day:STORY.dayOfKey('2028-06-09'),k}; if(seen) F.ZQ_Q15.seen=STORY.dayOfKey(seen); F.ZQ_CONFESS_LINE=k; F.ZQ_DAD_HEARD=true; F.ATTENDED_SHOW=true;
  delete F.ZQ_EXE_REPLY; F.dating_heroine_04=false; SOCIAL.rel('heroine_04').npcRom=40; return {Q:F.ZQ_Q15, stage:SOCIAL.stage('heroine_04')}; })"""
ZQQ = "(()=>{ const F=GAME.G.flags; return {Q:F.ZQ_Q15||null, reply:!!F.ZQ_EXE_REPLY, dating:!!F.dating_heroine_04}; })()"


async def zq_exe(pg, cdp, run, sid, res, pick):
    """6/10 11:30 → 手機「跳過時間」到中午 → 12:00「回答.exe」演起來 → 最後那一行字疊完的兩個選項照 pick"""
    n0 = await log_len(pg)
    got = await skip(pg, cdp, '等到中午', sid); res['skip'] = got
    # 等到場面裡的兩個選項跳出來（GAME.choose 一叫就記在 __LOG）；選項交給下面的 drive 照 pick 按
    ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［選項］'&&x.t.includes(%s))||(GAME.G.flags.ZQ_Q15||{}).res!=null" % json.dumps(ZQ_OPTS[1]), max_s=400, label=sid)
    await drive(pg, cdp, run, picks=[pick], max_s=120, label=sid)
    L1 = await log_since(pg, n0); T = texts(L1); res['exe'] = {'said': T, 'cards': cards(L1), 'opts': chs(L1), 'caps': caps(L1)}
    oc = [c for c in chs(L1) if isinstance(c, list) and c == ZQ_OPTS]
    run.check('%s：6/10 12:00「回答.exe」演出來（%s）：最後那一行字「第一個玩家：祐廷」疊完，場面裡兩個選項「%s」' % (sid, got, '」「'.join(ZQ_OPTS)),
              ZQ_EXE in T and any('第一個玩家：' in c for c in cards(L1)) and bool(oc), J(res['exe'], 700))
    return T, L1


@guard
async def s_zq_sticker(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-10（六）11:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "(['first_player',null])"); res['set'] = z
        run.setup('[前置] %s：子晴 Q15 已經在 6/9 回家的路上說了「妳下一個遊戲，我也要當第一個玩的。」（ZQ_Q15={day:6/9,k:first_player}；子晴 CLOSE、npcRom 40）→ %s' % (sid, J(z)))
        await settle(pg, cdp, run, sid)
        T, L1 = await zq_exe(pg, cdp, run, sid, res, ZQ_OPTS[0])
        run.check('%s：選「%s」＝接著演她打來（字幕「電話」），台詞照稿' % (sid, ZQ_OPTS[0]), '電話' in caps(L1) and seq_in(T, ZQ_CALL), J({'caps': caps(L1), 'said': T}, 900))
        q = await pg.evaluate(ZQQ); th = await msgs(pg, 'p:heroine_04'); res['after'] = [q, th[-4:]]
        run.check('%s：選了貼紙＝交往（dating）、ZQ_EXE_REPLY、Q15 res sticker；手機那段對話補上「（貼圖：插座貓）」' % sid,
                  q['dating'] and q['reply'] and (q['Q'] or {}).get('res') == 'sticker' and any(m['from'] == 'player' and m['text'] == '（貼圖：插座貓）' for m in th), J(res['after']))
        oq = await outq(pg, '^y3_zq_'); res['out'] = oq
        run.check('%s：不另外排電話（沒有 y3_zq_exe_call、y3_zq_noreply_call 排著）' % sid, not any(x['state'] == 'planned' for x in oq), J(oq))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zq_noreply(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-10（六）11:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "(['first_player',null])"); res['set'] = z
        run.setup('[前置] %s：同 ZQ_STICKER（Q15 說了「第一個玩的」）→ %s' % (sid, J(z)))
        await settle(pg, cdp, run, sid)
        T, L1 = await zq_exe(pg, cdp, run, sid, res, ZQ_OPTS[1])
        q = await pg.evaluate(ZQQ); pend = await pg.evaluate(PEND + "('y3_zq_exe')"); d11 = await dayk(pg, '2028-06-11'); res['mid'] = [q, pend]
        run.check('%s：選「%s」＝沒有電話、還沒交往；手機的貼紙按鈕留到隔天 21:00（%s）' % (sid, ZQ_OPTS[1], (pend or {}).get('untilKey')),
                  ZQ_CALL[0] not in T and not q['dating'] and bool(pend) and abs(pend['until'] - (d11 * 24 + 21)) < 0.01, J(res['mid']))
        # 6/10 傍晚睡覺 → 6/11 白天跳到 20:00 → 21:00 她打來
        await skip(pg, cdp, '等到傍晚', sid); ops, got, ok = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed10'] = [ops, got]
        n1 = await log_len(pg)
        await skip(pg, cdp, '等到晚上', sid); st = await pg.evaluate(STATE); res['at20'] = st
        await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_zq_noreply_call')||GAME.G.hour>=20.5", max_s=90, label=sid)   # 跳過時間以後等遊戲自己更新一次（SwiftShader 約 30 秒一次；實機約 0.5 秒）再看
        q20 = await outq(pg, '^y3_zq_'); st20 = await pg.evaluate(STATE); say('   %s 20:00 以後的出遊（%s %.2f）：%s' % (sid, st20['key'], st20['h'], J(q20)))
        run.check('%s：6/11 跳到 20:00：已經排好 21:00「子晴打電話來」（前 2 小時才排）' % sid, any(x['id'] == 'y3_zq_noreply_call' and x['state'] == 'planned' and x['d'] == '2028-06-11' and abs(x['h'] - 21) < 0.01 for x in q20), J({'st': st, 'out': q20}))
        ok, ch = await wait_out(pg, cdp, run, 'y3_zq_noreply_call', 900, sid)
        await drive(pg, cdp, run, max_s=120, label=sid)
        L2 = await log_since(pg, n1); T2 = texts(L2); pr = prompts(ch); res['call'] = {'said': T2, 'prompt': pr, 'caps': caps(L2)}
        run.check('%s：問「接起來：子晴打電話來」（只有這一個）' % sid, bool(pr) and len(pr[0]['opts']) == 1 and pr[0]['opts'][0].startswith('接起來：子晴打電話來'), J(pr))
        run.check('%s：21:00 她打來（字幕「電話」），台詞照稿（第一個玩的那一支有「這次是直述句。」）' % sid, '電話' in caps(L2) and seq_in(T2, ZQ_NO), J(res['call'], 900))
        q = await pg.evaluate(ZQQ); dm = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == 'y3_zq_noreply']; res['after'] = [q, dm]
        run.check('%s：接了＝這學期不交往（Q15 res none）、沒有那一則私訊' % sid, (q['Q'] or {}).get('res') == 'none' and not q['dating'] and not dm, J(res['after']))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zq_sleep(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-11', 19.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-11（日）19:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "(['not_question','2028-06-10'])"); res['set'] = z
        run.setup('[前置] %s：Q15 說的是「我喜歡妳。這不是問句。」、6/10 的「回答.exe」看過了、沒回（ZQ_Q15={day:6/9,k:not_question,seen:6/10}）→ %s' % (sid, J(z)))
        ok, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_zq_noreply_call'&&q.state==='planned')", max_s=90, label=sid)
        q0 = await outq(pg, '^y3_zq_'); res['planned'] = q0
        run.check('%s：19:30 已經排好 21:00「子晴打電話來」' % sid, ok, J(q0))
        n0 = await log_len(pg)
        ops, got, okw = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed'] = [ops, got, okw]
        run.check('%s：床照舊有「睡到明天」（她的電話不算今晚的鬧鐘：沒有「睡一下（21:00 叫醒你）」），按了「%s」' % (sid, got), bool(got) and not any('叫醒你' in o and '21:00' in o for o in ops or []), J(ops))
        st = await pg.evaluate(STATE); T = texts(await log_since(pg, n0)); q = await pg.evaluate(ZQQ); dm = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == 'y3_zq_noreply']; q1 = await outq(pg, '^y3_zq_')
        res['after'] = [st, q, dm, q1, T[-8:]]
        run.check('%s：睡著＝沒接：醒來（%s）手機有她的那一則「%s」（6/11 21:00；這不是問句那一支拿掉「這次是直述句。」）' % (sid, st['key'], ZQ_NODM_NQ),
                  [m['text'] for m in dm] == [ZQ_NODM_NQ] and all(m['d'] == '2028-06-11' and abs(m['h'] - 21) < 0.05 for m in dm), J(dm))
        run.check('%s：沒有演電話；這學期不交往（res none）；那一通記 missed' % sid, ZQ_NO[0] not in T and (q['Q'] or {}).get('res') == 'none' and not q['dating'] and any(x['id'] == 'y3_zq_noreply_call' and x['state'] == 'missed' for x in q1), J(res['after']))
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- ③ 可昕考上律師（畢業後篇，交往中、沒報 2029 國考）
KX_NARR = '（下午三點多。可昕打來了。）'; KX_L = ['……律師考試放榜了。', '我上了。']; KX_OPTS = ['「恭喜。」', '「妳查了幾遍？」']
KX_R0 = '嗯。'; KX_CLOSE = '今天你負責宵夜。'; KX_AFTER = '（那天晚上的宵夜，兩碗酸辣湯餃，你付的。她一直在笑。）'; KX_DM = ['律師考試放榜了。我上了。', '今天你負責宵夜。']


def pg_state(dk, key, h, extra=None):
    F = {'dating_kexin': True, 'KX_DEC3_MIGRATED': True, 'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'PG': {'done': {'grad': 1}},
         'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'Y4_PATH': 'other', 'PACKED_Y4': dk['2029-06-01'], 'BAR_REG': False, 'KX_OUR_DAY': {'day': 'sun', 'mode': 'mid'}}
    F.update(extra or {})
    return {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[key], 'hour': h, 'energy': 100, 'money': 22000, 'zone': 'campus',
            'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
            'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1}, 'last': {}, 'count': 0}}


async def pg_launch(p, run, sid, key, h):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    dk = await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })(%s)" % json.dumps(['2029-06-01', '2029-06-02', '2029-06-28', key]))
    st = pg_state(dk, key, h); st['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % st['day'])
    await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK); await pg.evaluate(HOOK2)
    await pg.evaluate("(()=>{ const r=SOCIAL.rel('kexin'); r.fam=45; r.trust=30; SOCIAL.remember('kexin','FIRST_MET',''); })()")
    pre = await pg.evaluate("(()=>{ const G=GAME.G; let ns=null; try{ const t=PG.nextStop(G); ns=t!=null?PG.dateLabel(Math.floor(t/24),t-24*Math.floor(t/24)):null; }catch(e){ ns='ERR '+e.message; } return {pgOn:!!(PG.on&&PG.on(G)), partners:(ROM.partners?ROM.partners(G):[]), next:ns, ok:!!(PG.kxBarOk&&PG.kxBarOk(G)), label:PG.dateLabel(G.day,G.hour)}; })()")
    run.setup('[前置] %s：最小存檔（畢業後篇：GRADUATED、MOVED_OUT、Y4_PATH other、BAR_REG false＝沒報 2029 國考；和可昕交往）讀 %s %.2f 校園 → %s' % (sid, key, h, J(pre)))
    say('   %s 讀檔後：%s' % (sid, J(pre)))
    return b, pg, cdp, errs, pre


@guard
async def s_kx_call(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, pre = await pg_launch(p, run, sid, '2029-12-14', 10.0); res['pre'] = pre
    try:
        run.check('%s：讀檔後畢業後篇有開、和可昕交往；10:00 的「下一件事」＝12/14 15:05（%s）' % (sid, pre.get('next')), pre['pgOn'] and 'kexin' in pre['partners'] and str(pre.get('next', '')).endswith('15:05'), J(pre))
        n0 = await log_len(pg); d = await dayk(pg, '2029-12-14')
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.t===%s)||GAME.G.day>%d||GAME.G.hour>=17" % (json.dumps(KX_AFTER), d), max_s=900, picks=[KX_OPTS[0]], label=sid)
        await drive(pg, cdp, run, picks=[KX_OPTS[0]], max_s=90, label=sid)
        L1 = await log_since(pg, n0); T = texts(L1); res['said'] = T; res['toasts'] = toasts(L1); st = await pg.evaluate(STATE)
        call = [x for x in L1 if x['t'] == KX_NARR]; at = call[0]['at'] if call else None; res['at'] = at
        run.check('%s：站著不動等「下一件事」：15:05 她打來（%s；提示「手機響了。」）' % (sid, at), bool(call) and at and at.startswith('2029-12-14 15.0') and any('手機響了' in t for t in toasts(L1)), J({'at': at, 'toasts': toasts(L1)}))
        nm = [x['n'] for x in L1 if x['t'] in KX_L]
        oc = [c for c in chs(L1) if isinstance(c, list) and c == KX_OPTS]
        run.check('%s：電話台詞照稿：旁白、她兩句（名字「…（電話）」）、選項「%s」、選「%s」→「%s」、「%s」、最後一句旁白' % (sid, '」「'.join(KX_OPTS), KX_OPTS[0], KX_R0, KX_CLOSE),
                  seq_in(T, [KX_NARR] + KX_L + [KX_R0, KX_CLOSE, KX_AFTER]) and bool(oc) and nm and all('（電話）' in n for n in nm), J({'said': T, 'names': nm, 'opts': chs(L1)}, 900))
        dm = [m for m in await msgs(pg, 'p:kexin') if m['tag'] == 'pg_r2kx_2029']; dn = await pg.evaluate("(()=>{ try{ return PG.rec(GAME.G).done.kx_bar_2029||null; }catch(e){ return 'ERR'; } })()")
        oq = await pg.evaluate(OUTQ + "('kx|kexin')"); res['after'] = [dm, dn, [q for q in oq if q['d'] == '2029-12-14']]
        run.check('%s：演完＝沒有那兩則私訊、場景記演過；那天不另外排出遊（宵夜只是旁白）' % sid, not dm and dn == 1 and not [q for q in oq if q['d'] == '2029-12-14'], J(res['after']))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_kx_late(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, pre = await pg_launch(p, run, sid, '2029-12-14', 16.2); res['pre'] = pre
    try:
        run.note('%s：【前置】讀檔在 16:12＝15:05～16:00 那一段玩家不在（在別的劇情、出遊裡），等於沒接' % sid)
        n0 = await log_len(pg); await pg.wait_for_timeout(6000); await drive(pg, cdp, run, max_s=60, label=sid)
        T = texts(await log_since(pg, n0)); dm = [m for m in await msgs(pg, 'p:kexin') if m['tag'] == 'pg_r2kx_2029']
        dn = await pg.evaluate("(()=>{ try{ return PG.rec(GAME.G).done.kx_bar_2029||null; }catch(e){ return 'ERR'; } })()"); res['after'] = [dm, dn, T[-6:]]
        run.check('%s：過了 16:00 才回來＝她原本那兩則私訊「%s」（12/14 15:05）、那一場記 missed、沒有演電話' % (sid, '」「'.join(KX_DM)),
                  [m['text'] for m in dm] == KX_DM and all(m['d'] == '2029-12-14' and abs(m['h'] - (15 + 5 / 60)) < 0.05 for m in dm) and dn == 'missed' and KX_NARR not in T, J(res['after']))
        await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:kexin')"); await pg.wait_for_timeout(800)
        await run.shot(pg, '%s_dm' % sid); await L.phone_away(pg, cdp)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- ④ 沛珊回來（台中版）：2027-08-07 21:00 她打來
PS_CALL = ['（晚上九點。手機響了。來電的名字，你半年沒看到了。）', '……喂。', '這半年，我都沒看手機。你傳的，我今天才一則一則看完。', '對不起。']
PS_OPTS = ['「妳還好嗎？」', '「妳現在在哪？」', '（先不說話）']; PS_R = {0: ['我現在很好。真的。'], 1: ['台中。在家。'], 2: ['……你可以生氣。我只是想先打給你。']}
PS_END = ['開學以後，我在台南。你要來的話，跟我說。', '（她等了一下，才掛電話。）']; PS_DM = ['……這半年我都沒看手機。對不起。', '我現在很好。']
PSF = dict(TWF, **BASE0)


async def ps_launch(p, run, base, sid, h, label):
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-08-07', h, 'dorm', preflags=PSF, rels={PS: 'FRIEND'}, label=sid + label)
    await pg.evaluate(HOOK2); dm = await post_ps_dm(pg)
    run.setup('[前置] %s：消失期你傳過她一則（2027-03-15 20:00「生日快樂」）；沒交往；PS_BACK_READ 沒有 → %s' % (sid, J(dm)))
    return b, pg, cdp, errs


async def ps_check_call(pg, run, sid, L1, ch, k):
    T = texts(L1); pr = prompts(ch)
    run.check('%s：問「接起來：沛珊打電話來」（只有這一個）' % sid, bool(pr) and len(pr[0]['opts']) == 1 and pr[0]['opts'][0].startswith('接起來：沛珊打電話來'), J(pr))
    oc = [c for c in chs(L1) if isinstance(c, list) and c == PS_OPTS]
    run.check('%s：21:00 她打來（字幕「電話」），三個選項「%s」，選「%s」→「%s」，結尾照稿（台中版）' % (sid, '」「'.join(PS_OPTS), PS_OPTS[k], PS_R[k][0]),
              '電話' in caps(L1) and seq_in(T, PS_CALL + PS_R[k] + PS_END) and bool(oc), J({'caps': caps(L1), 'said': T, 'opts': chs(L1)}, 900))
    d = await dayk(pg, '2027-08-07'); rd = await pg.evaluate(FL + "('PS_BACK_READ')"); dm = [m for m in await msgs(pg, 'p:classmate_peishan') if m['tag'] == 'ps_back_read']
    run.check('%s：接了＝PS_BACK_READ 記 8/7（放榜以後重新聯絡上）、沒有那兩則私訊' % sid, rd == d and not dm, J([rd, d, dm]))
    return T


@guard
async def s_ps_call(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await ps_launch(p, run, base, sid, 20.33, '（2027-08-07（六）20:20 宿舍）')
    try:
        n0 = await log_len(pg)
        ok, ch = await wait_out(pg, cdp, run, 'y3_ps_back_call', 900, sid, picks=[PS_OPTS[1]])
        ch2 = await drive(pg, cdp, run, picks=[PS_OPTS[1]], max_s=120, label=sid)
        L1 = await log_since(pg, n0); res['said'] = texts(L1); res['ch'] = (ch or []) + (ch2 or [])
        call = [x for x in L1 if x['t'] == PS_CALL[0]]; res['at'] = call[0]['at'] if call else None
        run.check('%s：等到 21:00 前後她打來（演出時間 %s）' % (sid, res['at']), ok and bool(call), J(res['at']))
        await ps_check_call(pg, run, sid, L1, res['ch'], 1)
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_ps_ff(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await ps_launch(p, run, base, sid, 12.0, '（2027-08-07（六）12:00 宿舍，暑假）')
    try:
        await settle(pg, cdp, run, sid); n0 = await log_len(pg); d = await dayk(pg, '2027-08-07')
        r = await bed2(pg, cdp, run, ('快轉',), sid); ops, got = r if r else ([], None); res['bed'] = [ops, got]
        run.check('%s：暑假宿舍的床有「快轉」' % sid, bool(got) and got.startswith('快轉'), J(ops))   # 按鈕字＝「快轉」＋說明小字（腳本 10-22 13:0x 改）
        if not (got and got.startswith('快轉')): return
        mo = []
        for _ in range(10):
            mo = await opts(pg)
            if mo: break
            await pg.wait_for_timeout(600)
        hint = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.replace(/\\s+/g,' ').trim())"); res['menu'] = hint; say('   %s 快轉選單：%s' % (sid, J(hint)))
        k = next((i for i, o in enumerate(mo) if o.startswith('到下一個有事的日子')), None)
        if k is None: run.check('%s：快轉選單有「到下一個有事的日子」' % sid, False, J(hint)); return
        await tap_idx(pg, cdp, k); await pg.wait_for_timeout(3000)
        ok, ch = await wait_out(pg, cdp, run, 'y3_ps_back_call', 900, sid, picks=[PS_OPTS[0]], also='GAME.G.day>%d' % d)
        ch2 = await drive(pg, cdp, run, picks=[PS_OPTS[0]], max_s=120, label=sid)
        L1 = await log_since(pg, n0); res['said'] = texts(L1); res['ch'] = (ch or []) + (ch2 or []); pr = prompts(res['ch'])
        call = [x for x in L1 if x['t'] == PS_CALL[0]]; res['at'] = call[0]['at'] if call else None; res['prompt_at'] = pr[0]['at'] if pr else None
        run.check('%s：快轉「到下一個有事的日子」停在 8/7 晚上她打來以前（問「接起來」的時間 %s），沒有跳過她的電話' % (sid, res['prompt_at']),
                  bool(pr) and str(pr[0]['at']).startswith('2027-08-07') and bool(call), J({'prompt': pr, 'at': res['at'], 'cards': cards(L1)}))
        if call: await ps_check_call(pg, run, sid, L1, res['ch'], 0)
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_ps_sleep(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs = await ps_launch(p, run, base, sid, 19.5, '（2027-08-07（六）19:30 宿舍）')
    try:
        ok, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_ps_back_call'&&q.state==='planned')", max_s=90, label=sid)
        q0 = await outq(pg, '^y3_ps_'); res['planned'] = q0
        run.check('%s：19:30 已經排好 21:00「沛珊打電話來」' % sid, ok, J(q0))
        n0 = await log_len(pg)
        ops, got, okw = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed'] = [ops, got, okw]
        run.check('%s：床照舊有「睡到明天」（沒有「睡一下（21:00 叫醒你）」），按了「%s」' % (sid, got), bool(got) and not any('叫醒你' in o and '21:00' in o for o in ops or []), J(ops))
        st = await pg.evaluate(STATE); T = texts(await log_since(pg, n0)); d = await dayk(pg, '2027-08-07'); rd = await pg.evaluate(FL + "('PS_BACK_READ')")
        dm = [m for m in await msgs(pg, 'p:classmate_peishan') if m['tag'] == 'ps_back_read']; q1 = await outq(pg, '^y3_ps_'); res['after'] = [st, rd, dm, q1, T[-6:]]
        run.check('%s：睡著＝沒接：醒來（%s）手機有她原本那兩則「%s」（8/7 21:00）' % (sid, st['key'], '」「'.join(PS_DM)),
                  [m['text'] for m in dm] == PS_DM and all(m['d'] == '2027-08-07' and abs(m['h'] - 21) < 0.05 for m in dm), J(dm))
        run.check('%s：沒有演電話；PS_BACK_READ 一樣記 8/7；那一通記 missed' % sid, PS_CALL[0] not in T and rd == d and any(x['state'] == 'missed' for x in q1), J(res['after']))
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- ⑤ 芷若答應奕廷的約：日本路線 8/5 以後第一次進 Café 當面說
ZR_JP = ['奕廷約我去看了一部電影。很老的那部，《秋天的晚飯》。', '他連我高中看過哪幾部都記得。……那時候，我說好了。']
ZR_TW = ['奕廷約我去看電影。很老的那部，《秋天的晚飯》。', '他連我高中看過哪幾部都記得。……我說好。']
ZRS = ['heroine_02']


async def counter_talk(pg, cdp, run, label):
    """芷若在吧檯後面上班：照玩家走到吧檯的點餐點（店員在班時那一點的按鈕＝和店員說話，engine3d.js「店員擋住了吧檯的點餐點」）按互動，點完對話"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.counter==='cafe'&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not it: return [], ''
    # 店員要在 2.2 m 以內按鈕才是「和她說話」（engine3d.js nearestInteractable；她站在吧檯後面 z≈-5.15）：走到點餐點本身（第一次 v6_aa296d 停在 1.7 m 外，按鈕是空的）
    lab = ''
    for dz, tol in ((0.0, 0.3), (-0.2, 0.2), (0.2, 0.25)):
        await L.go_to(pg, cdp, run, it[0], it[1] + dz, tol, '吧檯點餐點', max_s=180); await pg.wait_for_timeout(1500)
        lab = await pg.evaluate(LAB); say('   %s 吧檯前的按鈕：「%s」' % (label, lab))
        if '說話' in lab or '點餐' in lab: break
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    ch = await drive(pg, cdp, run, picks=['不用了'], max_s=150, label=label)
    return ch, lab


async def zr_cafe(pg, cdp, run, sid, res, want, other):
    await settle(pg, cdp, run, sid)
    ok, tries = await go_cafe(pg, cdp, run, sid); res['go'] = [ok, tries]
    run.check('%s：手機「地點」到兩點半 Café' % sid, ok, J(await pg.evaluate(STATE)))
    if not ok: return
    await settle(pg, cdp, run, sid)
    pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ZRS))
    if not pos:   # 不在班：等到傍晚再進來一次
        say('   %s 芷若不在 Café，等到傍晚再來' % sid); await quick_go(pg, cdp, 'campus'); await skip(pg, cdp, '等到傍晚', sid); await go_cafe(pg, cdp, run, sid); await settle(pg, cdp, run, sid)
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ZRS))
    st = await pg.evaluate(STATE); wt = await pg.evaluate("(()=>{ try{ return GAME.whereText('heroine_02')||''; }catch(e){ return 'ERR '+e; } })()"); res['pos'] = [pos, st, wt]
    run.check('%s：芷若在 Café（%s %.2f）' % (sid, st['key'], st['h']), bool(pos), J(res['pos']))
    if not pos: return
    said = []; labs = []
    for k in range(2):
        n0 = await log_len(pg); staff = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.heroine_02; return !!(n&&n.staff==='cafe'); })()")
        ch, lab = await (counter_talk(pg, cdp, run, sid) if staff else talk(pg, cdp, run, ZRS, ('芷若',), label=sid)); T = texts(await log_since(pg, n0)); said.append(T); labs.append(lab)
        if any(t in T for t in want + other): break
    res['said'] = said; res['labs'] = labs; allT = [t for T in said for t in T]
    dn = await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_zhiruo_f3_cafe)"); res['done'] = dn
    run.check('%s：跟芷若說話＝「%s」「%s」（%s）' % (sid, want[0], want[1], '第 %d 次說話' % len(said)), seq_in(allT, want) and not any(t in allT for t in other) and dn, J({'said': said, 'labs': labs}, 900))
    await run.shot(pg, '%s_cafe' % sid)


@guard
async def s_zr_jp(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    pf = dict(JPF, **BASEF, Y4_PATH_DAY={'$day': '2028-08-05'}, FANG_F3='bought', FANG_F3_DAY={'$day': '2028-05-29'}, FANG_F3_J1={'$day': '2028-05-29'})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-08-07', 19.0, 'campus', preflags=pf, rels={ZR: 'FRIEND', 'npc_fangyt': 'FAMILIAR'}, label=sid + '（日本路線、8/5 回國；5/29 答應了奕廷的約（FANG_F3 bought）；2028-08-07（一）19:00 校園——她 8/6（日）沒有班，回國後第一個班是 8/7）')
    try:
        await pg.evaluate(HOOK2)
        run.note('%s：22:07 那則私訊不傳——讀檔在 8/6 不算證據（規則只在 5/29～6/20 跑），看 ZR_JP529' % sid)
        await zr_cafe(pg, cdp, run, sid, res, ZR_JP, ZR_TW)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zr_tw(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    pf = dict(TWF, **BASE0, FANG_F3='bought', FANG_F3_DAY={'$day': '2028-05-29'}, FANG_F3_J1={'$day': '2028-05-29'})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-05-31', 19.0, 'campus', preflags=pf, rels={ZR: 'FRIEND', 'npc_fangyt': 'FAMILIAR'}, label=sid + '（對照：臺灣路線；5/29 答應了奕廷的約；2028-05-31（三）19:00 校園——大三下她只排週三、四 19:00～22:00）')
    try:
        await pg.evaluate(HOOK2)
        await zr_cafe(pg, cdp, run, sid, res, ZR_TW, ZR_JP)
    finally: await finish_page(run, sid, res, errs, b)


F3Q = "(()=>{ const q=(typeof OUT==='undefined'?null:OUT.get(GAME.G,'y3_fang_f3')); const F=GAME.G.flags; return {q:q?{state:q.state,h:q.h,day:CALENDAR.dateOf(q.day).key}:null, J1:F.FANG_F3_J1==null?null:CALENDAR.dateOf(F.FANG_F3_J1).key, F3:F.FANG_F3||null, zone:GAME.G.zone, ZR_FY:F.ZR_FY===undefined?null:F.ZR_FY, fy:(F.ZZ||{}).fy||null}; })()"


@guard
async def s_zr_jp529(p, run, base, sid, out):
    """日本路線 5/29：日本 22:00 奕廷打來（接起來、選「說你剛好有兩張票。」）→ 待到 22:20：芷若那則「奕廷約我…我說好。」不傳。
    ZR_JP529＝人待在 3D 的「你的房間」（jp_room）；ZR_JP529H＝人在 2D 的據點（jp_hub，平常在日本的畫面）"""
    res = out.setdefault(sid, {}); hub = sid.endswith('H')
    pf = dict(BASE0, EXCHANGE_ROUTE='JP', EXCH_RULE=1, X1_JP={'$day': '2028-02-20'}, JP_DEPARTED={'$day': '2028-03-25'}, AN_SENDOFF='together')
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-05-29', 21.5, 'jp_hub' if hub else 'jp_room', preflags=pf, rels={ZR: 'FAMILIAR', 'npc_fangyt': 'FAMILIAR'}, quiet=False,
                                       label=sid + ('（日本路線、在日本；2028-05-29（一）日本 21:30 據點（2D 的國際學生宿舍））' if hub else '（日本路線、在日本；2028-05-29（一）日本 21:30 3D 的宿舍房間，人一直待在房間裡）'))
    try:
        await pg.evaluate(HOOK2); n0 = await log_len(pg); d = await dayk(pg, '2028-05-29')
        pk = ['「說你剛好有兩張票。」'] + (['共用廚房'] if hub else [])   # 據點：照玩家去共用廚房打發時間（「在房間休息一下」會走進 3D 房間），等 22:00
        ok, ch = await wait_out(pg, cdp, run, 'y3_fang_f3', 900, sid, picks=pk, also=('GAME.G.day>%d' % d) + ('' if hub else '||GAME.G.hour>=23.3'))
        await drive(pg, cdp, run, picks=['「說你剛好有兩張票。」'], max_s=120, label=sid)
        f3 = await pg.evaluate(FL + "('FANG_F3')"); pr = prompts(ch); res['call'] = [f3, pr, texts(await log_since(pg, n0))[-8:]]; res['f3q'] = await pg.evaluate(F3Q); say('   %s 奕廷那一通：%s' % (sid, J(res['f3q'])))
        run.check('%s：日本 22:00 奕廷打來（接起來）、選「說你剛好有兩張票。」→ FANG_F3 bought' % sid, ok and f3 == 'bought', J(res['call']))
        ok2, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=22.34||GAME.G.day>%d" % d, max_s=900, label=sid)
        st = await pg.evaluate(STATE); dm = [m for m in await msgs(pg, 'p:heroine_02') if m['tag'] == 'y3_zr_f3_jp' or '奕廷約我' in m['text'] or '我說好' in m['text']]; res['dm'] = [st, dm]
        run.check('%s：待到日本 %.2f：沒有芷若 22:07 那則「奕廷約我…我說好。」的私訊（日本路線改成 8/5 回國以後當面說）' % (sid, st['h']), ok2 and not dm, J(res['dm']))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['AN_SKIP', 'AN_SLEEP', 'ZQ_STICKER', 'ZQ_NOREPLY', 'ZQ_SLEEP', 'KX_CALL', 'KX_LATE', 'PS_CALL', 'PS_FF', 'PS_SLEEP', 'ZR_JP529', 'ZR_JP529H', 'ZR_JP', 'ZR_TW']
FN = {'AN_SKIP': s_an_skip, 'AN_SLEEP': s_an_sleep, 'ZQ_STICKER': s_zq_sticker, 'ZQ_NOREPLY': s_zq_noreply, 'ZQ_SLEEP': s_zq_sleep, 'KX_CALL': s_kx_call, 'KX_LATE': s_kx_late,
      'PS_CALL': s_ps_call, 'PS_FF': s_ps_ff, 'PS_SLEEP': s_ps_sleep, 'ZR_JP529': s_zr_jp529, 'ZR_JP529H': s_zr_jp529, 'ZR_JP': s_zr_jp, 'ZR_TW': s_zr_tw}


async def main():
    run = L.Run('aa296', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa296.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
