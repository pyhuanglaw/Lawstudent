"""BB（帳號 A）2026-10-22：AA378-Y4S1-FIX-1021（LAWWW 07:13 派，P2）——AA_378（企劃線 5cd35678）第 1 節學姊以外的六項；開發分支 1b639d68、a11c6c55 起（v9.10.4 沒有）。
台詞照 AA_378 原文一字對照。
  AN_0912／AN_0915／AN_0920  #1 以安 A7-L2「今年生日不是中秋。」只在她生日 2028-09-15（五）聊得到：閒聊階梯放在 A7-L2，16:xx 到兩點半 Café（她的作息 16～18 點）找她說話
              9/12（二）：不出（只打招呼，階梯不動）；9/15：「今年生日不是中秋。」→「「生日快樂。」」→「謝謝。今天晚上我媽要上來吃飯。」；9/20（三）：不出、直接接 A7-L3
  GF_AN       #3 女朋友的學期末約會（以安、大四上、臺灣路線）：12/20 晚上起每天睡覺、中午看手機；邀約在約會當天 12:00 才到、回覆期限當天 17:30；
              那一天在你最後一科考完以後；回「好。」→ 當天傍晚出發去「學期末的飯」
  CAFE_AUG    #4 日本路線：8/20 進過 Café →【前置】同一份存檔跳到 9/4 16:00 → 進 Café：新店員「……芷若姊走以前交代的。她說你的第一杯一定要點對。」、
              旁白「（她已經去英國了。店裡其他的都還在。）」；沒有「（半年。大家都還在。）」
  CAFE_NOAUG  #4 對照：日本路線、8 月沒進過 Café → 9/4 照舊（「（半年。大家都還在。）」）
  US_1223     #12 美國路線 12/23 回國那晚：20:00 阿凱私訊「回來了？」「所以時差調了沒」「宵夜 我在宿舍樓下」；那晚在宿舍不會再被當面約「宵夜？」；
              學期末的時段 12/24 起（12/23 沒有學期末的邀約；12/24 晚上才有）
  Q14_CANYON  #15＋S5 臺灣路線、答應了學姊的大峽谷：10/7 早上照玩家「出發」、演完回到臺北 10/15；子晴 Q14（10/11 21:00 那則）回到臺北還回得到，
              期限 10/16 12:00；10/16 上午回「介紹法服的指導律師給妳。」→「法服？你們系上那個社團？……好。」
  Q14_HOME    #15 對照＋S5：沒去大峽谷：10/11 21:00 Q14 來、期限 10/13 00:00；回「介紹法服的指導律師給妳。」→ 同一句
【前置】讀使用者存檔改日期、時間、地點、路線旗標、關係（每個情境寫在 run.setup）；之後照玩家：手機「地點」快速前往、走到人旁邊說話、床邊睡覺、
手機「跳過時間」、手機回訊息、出發的提示按「出發」。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=AN_0915,... python3 aa378x_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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


# ---------------------------------------------------------------- #1 以安 A7-L2
AN = ['heroine_01', 'an']; BDAY = '今年生日不是中秋。'; BDAY_OK = '「生日快樂。」'; BDAY_R = '謝謝。今天晚上我媽要上來吃飯。'; AN_L3 = '日本的鄰居，每天早上倒垃圾都跟我說早安。'
LADSET = """(sid=>{ const G=GAME.G, D=STORY.ladData(G,'heroine_01'); if(!D) return {err:'沒有 ladData'}; const i=D.L.steps.findIndex(s=>s.id===sid); const so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{};
  so.ladder[D.key]=i; delete so.ladderDay.heroine_01; return {key:D.key, i, term:D.term, ids:D.L.steps.map(s=>s.id)}; })"""
LADGET = """(()=>{ const G=GAME.G, D=STORY.ladData(G,'heroine_01'); if(!D) return null; const so=G.social||{}; const i=(so.ladder||{})[D.key]|0; return {i, id:(D.L.steps[i]||{}).id||null, day:(so.ladderDay||{}).heroine_01, today:G.day}; })()"""
AN_KEY = {'AN_0912': '2028-09-12', 'AN_0915': '2028-09-15', 'AN_0920': '2028-09-20'}


@guard
async def s_an(p, run, base, sid, out):
    res = out.setdefault(sid, {}); key = AN_KEY[sid]
    b, pg, cdp, errs, r = await launch(p, run, base, key, 16.1, 'campus', preflags=dict(TWF, **BASEF, Y4_PATH_DAY={'$day': '2028-06-20'}), rels={'heroine_01': 'FRIEND'}, label=sid + '（臺灣路線、以安朋友；%s 16:06 校園）' % key)
    try:
        lad = await pg.evaluate(LADSET + "('A7-L2')"); res['lad0'] = lad
        run.setup('[前置] %s：以安大四上的閒聊階梯放在 A7-L2（今天還沒推進）→ %s' % (sid, J(lad, 300)))
        ok = await quick_go(pg, cdp, 'cafe'); st = await pg.evaluate(STATE); res['at'] = st
        run.check('%s：手機「地點」到兩點半 Café（%s %.2f）' % (sid, st['key'], st['h']), ok, J(st))
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps(AN)); res['pos'] = pos
        run.check('%s：以安在 Café（作息 16～18 點 cafe／read）' % sid, bool(pos), J(pos))
        await run.shot(pg, '%s_cafe' % sid)
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, AN, ('以安', '小安'), picks=[BDAY_OK], label=sid)
        T = texts(await log_since(pg, n0)); res['said'] = T; res['ch'] = ch; res['lab'] = lab
        lad1 = await pg.evaluate(LADGET); res['lad1'] = lad1
        say('   %s 說了：%s；階梯：%s' % (sid, J(T, 600), J(lad1)))
        run.check('%s：按「%s」說話，有對話' % (sid, lab), ch is not None and bool(T), J({'lab': lab, 'said': T}))
        if sid == 'AN_0915':
            co = [c for c in (ch or []) if any(BDAY_OK in o for o in c['opts'])]
            run.check('%s：9/15（五）她生日當天＝「%s」→ 選項「%s」→「%s」' % (sid, BDAY, BDAY_OK, BDAY_R), BDAY in T and bool(co) and BDAY_R in T and T.index(BDAY_R) > T.index(BDAY), J({'said': T, 'ch': ch}, 600))
            run.check('%s：階梯推進到 A7-L3（今天推進過）' % sid, bool(lad1) and lad1['id'] == 'A7-L3' and lad1['day'] == lad1['today'], J(lad1))
        elif sid == 'AN_0912':
            run.check('%s：9/12（二）不是她生日＝沒有「%s」（她只打招呼）' % (sid, BDAY), BDAY not in T, J(T, 500))
            run.check('%s：階梯還停在 A7-L2（9/15 那天才聊得到）' % sid, bool(lad1) and lad1['id'] == 'A7-L2', J(lad1))
        else:
            run.check('%s：9/20（三）過了她生日＝沒有「%s」' % (sid, BDAY), BDAY not in T, J(T, 500))
            run.check('%s：A7-L2 直接算過，接 A7-L3「%s」' % (sid, AN_L3), AN_L3 in T, J(T, 500))
            run.check('%s：階梯推進到 A7-L4' % sid, bool(lad1) and lad1['id'] == 'A7-L4', J(lad1))
        await run.shot(pg, '%s_after' % sid)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- #3 女朋友的學期末約會（以安）
GF_TAG = 'te_gf_Y4S1_heroine_01'
# 2026-10-22 rc2 第一輪：以安的飯桌那一句照學期（tableByTerm.Y4S1「二月考完以前…」），不是通用的 table
TE_INFO = """(()=>{ const G=GAME.G, w=TERMEND.windowOf('Y4S1'); let fin=[]; try{ fin=CLS.examList(G,'Y4S1').filter(e=>e.kind==='final').sort((a,b)=>a.day-b.day).map(e=>({d:CALENDAR.dateOf(e.day).key, day:e.day, c:e.name||e.title||e.course||e.id||''})); }catch(e){ fin=['ERR '+e.message]; }
  let es=null; try{ es=TERMEND.examStart(G,w); }catch(e){}
  let g=null; try{ const x=TERMEND.gf('heroine_01','Y4S1'); const tb=x.tableByTerm&&x.tableByTerm.Y4S1; g={invite:typeof x.invite==='function'?'(函式)':x.invite, h:x.h, place:x.placeName, wd:x.wd, table:Array.isArray(tb)?tb[0]:(tb||x.table)}; }catch(e){ g='ERR '+e.message; }
  return {from:CALENDAR.dateOf(w.from).key, to:CALENDAR.dateOf(w.to).key, fromDay:w.from, toDay:w.to, finals:fin, examStart:es!=null?CALENDAR.dateOf(es).key:null, examStartDay:es, gf:g}; })()"""
GF_DAY = """(()=>{ try{ const R=TERMEND.rec(GAME.G,'Y4S1'); const d=(R.gfDay||{}).heroine_01; return d==null?null:{day:d, key:d>=0?CALENDAR.dateOf(d).key:null}; }catch(e){ return 'ERR '+e.message; } })()"""


@guard
async def s_gf_an(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-12-20', 21.5, 'dorm', preflags=dict(TWF, **BASEF, Y4_PATH_DAY={'$day': '2028-06-20'}), dating=('heroine_01',), label=sid + '（臺灣路線、和以安交往中；2028-12-20（三）21:30 宿舍）')
    try:
        info = await pg.evaluate(TE_INFO); res['info'] = info; say('   %s 學期末時段／期末考：%s' % (sid, J(info, 900)))
        run.note('%s：【讀資料】大四上學期末時段 %s～%s；你的期末考（最後一科）%s；照 AA_375 第 6 項，邀約從 %s 起；以安的期末約會 %s' % (
            sid, info['from'], info['to'], [f['d'] for f in info['finals'] if isinstance(f, dict)], info['examStart'], J(info['gf'], 200)))
        found = None; seen = []
        # 2026-10-22（候選 364dabe0 第一輪）：12 輪不夠——考試那兩天白天的床只有「小睡」，一輪只過半小時到一個半小時，12/23 中午就用完了（排好的日子是 12/25）。
        # 改成 24 輪；最後一科考完以後，中午看完手機就「跳過時間」到晚上再睡（不跳考試那幾天，免得錯過考試）
        lastfin0 = max([f['day'] for f in info['finals'] if isinstance(f, dict)] or [-1])
        for k in range(24):
            st = await pg.evaluate(STATE)
            if st['h'] < 12.1:
                await skip(pg, cdp, '等到中午', sid)
                await wait_for(pg, cdp, run, "GAME.G.hour>=12.15||GAME.G.day>%d" % st['day'], max_s=240, label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            M = [m for m in await msgs(pg, 'p:heroine_01') if m['tag'] == GF_TAG]; st = await pg.evaluate(STATE)
            gd = await pg.evaluate(GF_DAY); seen.append({'at': '%s %.2f' % (st['key'], st['h']), 'gfDay': gd, 'n': len(M)})
            say('   %s %s %.2f：以安的期末邀約 %d 則；排好的日子 %s' % (sid, st['key'], st['h'], len(M), J(gd)))
            if M: found = M; break
            if st['day'] > info['toDay']: break
            if st['day'] > lastfin0 and st['h'] < 19.5: await skip(pg, cdp, '等到晚上', sid)
            await sleep_night(pg, cdp, run, sid)
        res['seen'] = seen; res['msg'] = found
        run.check('%s：大四上學期末，以安傳了期末約會的邀約' % sid, bool(found), J(seen, 600))
        if not found: return
        m = found[0]; dd = m['day']; await run.shot(pg, '%s_invite' % sid)
        pend = await pg.evaluate(PEND + "(%s)" % json.dumps(GF_TAG)); res['pend'] = pend
        lastfin = max([f['day'] for f in info['finals'] if isinstance(f, dict)] or [None]) if any(isinstance(f, dict) for f in info['finals']) else None
        # 2026-10-22 rc2 第一輪：手機的訊息照「真的收到的時間」記（PHONE 佇列準時送＝現在的時間），跳過時間到 12:00 再淡入淡出，記成 12:02～12:03——
        # 要看的是「當天中午才到、前幾天沒有」，容許到 12:15
        run.check('%s：邀約在約會當天 12:00 才到（%s %.2f；前幾天中午都沒有）' % (sid, m['d'], m['h']), 12 - 1e-6 <= m['h'] < 12.25 and len(found) == 1, J(found))
        run.check('%s：句子照舊「%s」' % (sid, (info['gf'] or {}).get('invite') if isinstance(info['gf'], dict) else '?'), isinstance(info['gf'], dict) and m['text'] == info['gf'].get('invite'), J(m))
        run.check('%s：回覆期限＝當天 17:30（%s）' % (sid, (pend or {}).get('untilKey')), bool(pend) and abs(pend['until'] - (dd * 24 + 17.5)) < 0.01, J(pend))
        run.check('%s：那一天在你最後一科期末考以後（最後一科 %s、約會 %s）' % (sid, [f['d'] for f in info['finals'] if isinstance(f, dict)][-1:] or '—', m['d']),
                  (lastfin is None or dd > lastfin) and dd >= info['fromDay'], J({'finals': info['finals'], 'examStart': info['examStart'], 'dd': m['d']}))
        await answer(pg, cdp, run, 'p:heroine_01', GF_TAG, '好。', sid)
        # 回了以後要等下一次手機規則（TERMEND.phone → pickCheck）才排出遊；畫面每秒 1 格時 1.5 秒不夠（rc2 第一輪）
        await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='%s')" % GF_TAG, max_s=90, label=sid)
        q = await pg.evaluate(OUTQ + "('^te_gf_Y4S1_heroine_01')"); res['out'] = q
        h_gf = (info['gf'] or {}).get('h') if isinstance(info['gf'], dict) else None
        run.check('%s：回「好。」＝排出遊「學期末的飯」在同一天（%s）' % (sid, J(q, 200)), any(x['day'] == dd and (h_gf is None or abs(x['h'] - h_gf) < 0.01) for x in q), J(q))
        n0 = await log_len(pg)
        await skip(pg, cdp, '等到傍晚', sid)   # 跳過時間遇到約好的時間會停（停在出發前）
        ok, ch = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='%s'&&q.state!=='planned')" % GF_TAG, max_s=600, go=('出發：學期末的飯',), label=sid)
        await drive(pg, cdp, run, max_s=120, label=sid)
        T = texts(await log_since(pg, n0)); res['dinner'] = T; q2 = await pg.evaluate(OUTQ + "('^te_gf_Y4S1_heroine_01')"); res['out2'] = q2
        tbl = (info['gf'] or {}).get('table') if isinstance(info['gf'], dict) else None
        run.check('%s：當天傍晚出發、吃到飯（出遊 done；飯桌那一句「%s」）' % (sid, tbl), any(x['state'] == 'done' for x in q2) and (not tbl or tbl in T), J({'out': q2, 'said': T[-12:]}, 700))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- #4 日本路線 9/4 回到 Café
AUG1 = '……芷若姊走以前交代的。她說你的第一杯一定要點對。'; AUGN = '（她已經去英國了。店裡其他的都還在。）'
OLD_REG = '……芷若姊交代的。她說你回來那天，第一杯一定要點對。'; OLD_N1 = '你是……法律系的那位？'; OLD_N2 = '芷若姊說，你回來的話要跟你說一聲：歡迎回來。'; OLD_NAR = '（半年。大家都還在。）'
LATTE = ('熱拿鐵，不加糖？', '熱拿鐵，少糖？')
CAFEQ = """(()=>{ const G=GAME.G, H=G.habits||{}, a=STORY.dayOfKey('2028-08-06'), b=STORY.dayOfKey('2028-09-02'); const k=Object.keys(H).filter(x=>/^place:cafe:/.test(x)&&!/:with:/.test(x));
  const days=[].concat(...k.map(x=>((H[x]&&H[x].days)||[]).filter(d=>d>=a&&d<=b)));
  return {keys:k, aug:days.length>0, augDays:days.map(d=>CALENDAR.dateOf(d).key), visits:+G.flags.CAFE_VISITS||0, z11:!!(G.events&&G.events.done&&G.events.done.ev_zhiruo_no_sugar), back:!!G.flags.BACK_HOME, route:STORY.route(G), inJapan:!!(STORY.inJapan&&STORY.inJapan(G))}; })()"""


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


async def cafe_back(pg, cdp, run, sid, res):
    """9/4 16:00 校園 → 手機「地點」進 Café → 演完；回傳說了什麼"""
    await settle(pg, cdp, run, sid)
    q0 = await pg.evaluate(CAFEQ); res['q0'] = q0; say('   %s 進 Café 前：%s' % (sid, J(q0)))
    n0 = await log_len(pg)
    ok, tries = await go_cafe(pg, cdp, run, sid); res['go'] = [ok, tries]; await pg.wait_for_timeout(1500)
    run.check('%s：9/4 用手機「地點」走進 Café（第 %d 次按）' % (sid, tries), ok, J(await pg.evaluate(STATE)))
    shot = False
    for _ in range(3):
        s = await L.state(pg)
        if s['dlg'] and not shot: await run.shot(pg, '%s_back' % sid); shot = True
        await drive(pg, cdp, run, max_s=90, label=sid); await pg.wait_for_timeout(1500)
    q1 = await pg.evaluate(CAFEQ)
    if not q1['back']:   # 2026-10-22：進 Café 的 enter 事件照清單順序，隨機的「咖啡買錯」（ev_wrong_coffee，35%）排在「回來」前面——先演了它就出去、下次再進來（玩家會遇到的樣子）
        T0 = texts(await log_since(pg, n0)); res['first_entry'] = T0; say('   %s 第一次進 Café 沒有演「回來」（先演了：%s）；出去再進來一次' % (sid, J(T0, 300)))
        run.note('%s：第一次進 Café 先演了別的 enter 事件 %s，「回來」沒演；出去再進來（照玩家下次再來）' % (sid, J(T0, 200)))
        await quick_go(pg, cdp, 'wenzhou'); await settle(pg, cdp, run, sid)
        ok2, tries2 = await go_cafe(pg, cdp, run, sid); res['go2'] = [ok2, tries2]; await pg.wait_for_timeout(1500)
        for _ in range(3): await drive(pg, cdp, run, max_s=90, label=sid); await pg.wait_for_timeout(1500)
        q1 = await pg.evaluate(CAFEQ)
    T = texts(await log_since(pg, n0)); res['said'] = T; res['q1'] = q1
    say('   %s 進 Café：%s' % (sid, J(T, 700)))
    return ok, T, q0, q1


@guard
async def s_cafe_aug(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-08-20', 14.0, 'campus', preflags=dict(JPF, **BASEF, Y4_PATH_DAY={'$day': '2028-08-05'}), quiet=False, label=sid + '（日本路線，8/5 已經回國；2028-08-20（日）14:00 校園）')
    try:
        n0 = await log_len(pg); await settle(pg, cdp, run, sid)
        ok, tries = await go_cafe(pg, cdp, run, sid); await pg.wait_for_timeout(1500)
        for _ in range(2): await drive(pg, cdp, run, max_s=90, label=sid); await pg.wait_for_timeout(1500)
        qa = await pg.evaluate(CAFEQ); res['aug'] = qa; res['aug_said'] = texts(await log_since(pg, n0)); await run.shot(pg, '%s_0820' % sid)
        run.check('%s：8/20 用手機「地點」走進 Café（第 %d 次按）＝記到「8/6～9/2 進過 Café」（%s）' % (sid, tries, qa['augDays']), ok and qa['aug'] and '2028-08-20' in qa['augDays'], J(qa))
        snap = await pg.evaluate("JSON.parse(JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G))")
        d4 = await dayk(pg, '2028-09-04'); snap.update({'day': d4, 'hour': 16.0, 'zone': 'campus', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d4)})
        snap['flags']['ROOM_Y4'] = await dayk(pg, '2028-09-03')
        await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000)   # 同一頁、同一個 GAME：台詞的記錄（HOOK）還在，不重掛（重掛會記兩次）
        run.setup('[前置] %s：同一份遊戲狀態（含 8/20 進 Café 的紀錄）跳到 2028-09-04（一）16:00 校園' % sid)
        ok, T, q0, q1 = await cafe_back(pg, cdp, run, sid, res)
        run.check('%s：9/4 走進 Café＝新店員「%s」' % (sid, AUG1), AUG1 in T, J(T, 600))
        run.check('%s：旁白「%s」，沒有「%s」' % (sid, AUGN, OLD_NAR), AUGN in T and OLD_NAR not in T, J(T, 600))
        run.check('%s：點法照現在的條件（%s，看過 Z11＝%s），沒有「%s」「%s」「%s」' % (sid, '／'.join(LATTE), q0['z11'], OLD_REG, OLD_N1, OLD_N2),
                  any(x in T for x in LATTE) and (LATTE[0] in T) == q0['z11'] and not any(x in T for x in (OLD_REG, OLD_N1, OLD_N2)), J(T, 600))
        run.check('%s：演完記 BACK_HOME（之後不再演）' % sid, q1['back'], J(q1))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_cafe_noaug(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-09-04', 16.0, 'campus', preflags=dict(JPF, **BASEF, Y4_PATH_DAY={'$day': '2028-08-05'}), quiet=False, label=sid + '（日本路線，8 月沒進過 Café；2028-09-04（一）16:00 校園）')
    try:
        ok, T, q0, q1 = await cafe_back(pg, cdp, run, sid, res)
        run.check('%s：前置——8/6～9/2 沒進過 Café' % sid, not q0['aug'], J(q0))
        reg = q0['visits'] >= 3
        run.check('%s：照舊：沒有「%s」「%s」，有「%s」' % (sid, AUG1, AUGN, OLD_NAR), AUG1 not in T and AUGN not in T and OLD_NAR in T, J(T, 600))
        if reg: run.check('%s：常客（CAFE_VISITS %d ≥ 3）＝「%s」' % (sid, q0['visits'], OLD_REG), OLD_REG in T and any(x in T for x in LATTE), J(T, 600))
        else: run.check('%s：不是常客（CAFE_VISITS %d）＝「%s」「%s」' % (sid, q0['visits'], OLD_N1, OLD_N2), OLD_N1 in T and OLD_N2 in T, J(T, 600))
        run.check('%s：演完記 BACK_HOME' % sid, q1['back'], J(q1))
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- #12 美國路線 12/23
KAI3 = ['回來了？', '所以時差調了沒', '宵夜 我在宿舍樓下']; KAI_ASK = '宵夜？'
TE_US = """(()=>{ const G=GAME.G, w=TERMEND.window(G)||TERMEND.windowOf('Y4S1'); let P=null; try{ P=TERMEND.plan(G,w); }catch(e){ P={err:e.message}; } const R=TERMEND.rec(G,w.id);
  return {w:w.id, from:CALENDAR.dateOf(w.from).key, to:CALENDAR.dateOf(w.to).key, back:P&&P.back!=null?CALENDAR.dateOf(P.back).key:null, fallback:P?P.fallback:null, kaiAsked:R.kaiAsked!=null?CALENDAR.dateOf(R.kaiAsked).key:null}; })()"""


@guard
async def s_us(p, run, base, sid, out):
    res = out.setdefault(sid, {}); d23 = None
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-12-23', 19.2, 'dorm', preflags=USF, quiet=False, label=sid + '（美國路線，12/23 清晨落地、傍晚回到宿舍；2028-12-23（六）19:12 宿舍）')
    try:
        d23 = await dayk(pg, '2028-12-23'); n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='msg_kai_back_us')", max_s=420, label=sid)
        M = [m for m in await msgs(pg, 'p:kai') if m['tag'] == 'msg_kai_back_us']; res['kai'] = M
        run.check('%s：12/23 20:00 阿凱私訊「%s」' % (sid, '」「'.join(KAI3)), ok and [m['text'] for m in M] == KAI3 and all(m['d'] == '2028-12-23' and abs(m['h'] - 20) < 0.05 for m in M), J(M))
        await answer(pg, cdp, run, 'p:kai', 'msg_kai_back_us', '下去。', sid)
        # 保底的阿凱當面「宵夜？」是 20:00 以後一進時段、人在宿舍就問（TERMEND.kaiDue）；修改前 12/23 20:00 就會問——待到 20:45 看得出來（晚上 8 點以後手機沒有「跳過時間」，時間照走）
        ok2, ch2 = await wait_for(pg, cdp, run, "GAME.G.hour>=20.75||GAME.G.day>%d" % d23, max_s=600, label=sid)
        T = texts(await log_since(pg, n0)); res['said23'] = T; L23 = (await pg.evaluate("window.__LOG||[]"))[n0:]
        te23 = [m for m in await pg.evaluate(ALLMSG + "('^te_')") if m['day'] == d23]; te = await pg.evaluate(TE_US); res['te23'] = te23; res['te'] = te
        kai_said = [x for x in L23 if x['t'] == KAI_ASK]; st = await pg.evaluate(STATE); res['until23'] = st
        run.check('%s：12/23 晚上在宿舍待到 %.2f，沒有被當面再約一次「%s」' % (sid, st['h'], KAI_ASK), ok2 and st['zone'] == 'dorm' and not kai_said and te['kaiAsked'] is None, J({'kai': kai_said, 'te': te, 'st': st}))
        run.check('%s：12/23 沒有學期末的邀約（手機 te_ 開頭的訊息 0 則）' % sid, not te23, J(te23))
        run.check('%s：【讀資料】學期末時段的第一天對你是 12/24（回國的隔天）' % sid, te['back'] == '2028-12-24', J(te))
        await run.shot(pg, '%s_1223' % sid)
        await sleep_night(pg, cdp, run, sid)
        await skip(pg, cdp, '等到晚上', sid)
        if (await pg.evaluate("GAME.G.zone")) != 'dorm': await quick_go(pg, cdp, 'dorm')
        n1 = await log_len(pg); d24 = d23 + 1
        ok3, ch3 = await wait_for(pg, cdp, run, "GAME.G.hour>=21.2||GAME.G.day>%d" % d24, max_s=600, label=sid)
        L24 = (await pg.evaluate("window.__LOG||[]"))[n1:]; te24 = [m for m in await pg.evaluate(ALLMSG + "('^te_')") if m['day'] == d24]; te2 = await pg.evaluate(TE_US)
        res['te24'] = te24; res['te2'] = te2; res['said24'] = texts(L24)
        kai24 = [x for x in L24 if x['t'] == KAI_ASK]
        run.check('%s：12/24 晚上學期末開始了（手機邀約 %d 則%s）' % (sid, len(te24), '、阿凱當面「宵夜？」' if kai24 or te2['kaiAsked'] else ''),
                  bool(te24) or bool(kai24) or te2['kaiAsked'] == '2028-12-24', J({'te24': te24, 'kai24': kai24, 'te': te2}, 600))
        await run.shot(pg, '%s_1224' % sid)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- #15＋S5 子晴 Q14
Q14 = 'y4_q14'; FAFU_OPT = '介紹法服的指導律師給妳。'; FAFU_NEW = '法服？你們系上那個社團？……好。'; FAFU_OLD = '法服？那個學姊的法服？……好。'
Q14_FLAGS = {'FAFU_SHIFT_N': 1}


async def q14_answer(pg, cdp, run, sid, res):
    pend = await pg.evaluate(PEND + "(%s)" % json.dumps(Q14)); res['pend_before'] = pend
    got = await answer(pg, cdp, run, 'p:heroine_04', Q14, FAFU_OPT, sid)
    M = await msgs(pg, 'p:heroine_04'); res['zq'] = M[-8:]
    Mt = [m['text'] for m in M]; fl = await pg.evaluate("GAME.G.flags.ZQ_CONTRACT||null")
    run.check('%s：子晴 Q14 的選項有「%s」（值過法服班）' % (sid, FAFU_OPT), bool(pend) and FAFU_OPT in pend['opts'], J(pend))
    run.check('%s：回「%s」→ 她「%s」，沒有舊句「%s」' % (sid, FAFU_OPT, FAFU_NEW, FAFU_OLD), got == FAFU_OPT and FAFU_NEW in Mt and FAFU_OLD not in Mt and fl == 'legal_aid', J({'got': got, 'last': Mt[-4:], 'flag': fl}))
    return pend


@guard
async def s_q14_home(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-11', 20.75, 'dorm', preflags=TWF, rels={'heroine_04': 'FRIEND'}, flags=Q14_FLAGS, label=sid + '（臺灣路線、沒去大峽谷、子晴朋友、值過法服班；2028-10-11（三）20:45 宿舍）')
    try:
        ok, ch = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='%s')" % Q14, max_s=300, label=sid)
        M = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == Q14]; res['q14'] = M
        pend = await pg.evaluate(PEND + "(%s)" % json.dumps(Q14))
        run.check('%s：10/11 21:00 子晴 Q14 來了' % sid, ok and bool(M) and M[0]['d'] == '2028-10-11' and abs(M[0]['h'] - 21) < 0.05, J(M, 300))
        run.check('%s：沒去大峽谷＝回覆期限照舊 10/13 00:00（%s）' % (sid, (pend or {}).get('untilKey')), bool(pend) and pend['untilKey'] == '2028-10-13 0.00', J(pend))
        await q14_answer(pg, cdp, run, sid, res)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_q14_canyon(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-07', 5.5, 'dorm', preflags=TWF, rels={'heroine_04': 'FRIEND', 'heroine_05': 'CLOSE'},
                                       flags=dict(Q14_FLAGS, SIS_CANYON_ASK='go'), label=sid + '（臺灣路線、9/24 答應了學姊去大峽谷、子晴朋友、值過法服班；2028-10-07（六）05:30 宿舍）')
    try:
        await pg.wait_for_timeout(3000); q = await pg.evaluate(OUTQ + "('^y4_sis_canyon')"); res['plan'] = q
        run.check('%s：前置——出遊「秋假：去大峽谷找學姊」排在 10/7 07:00' % sid, any(x['d'] == '2028-10-07' and x['state'] == 'planned' for x in q), J(q))
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y4_sis_canyon'&&q.state!=='planned')", max_s=600, go=('出發：秋假',), picks=['（看著峽谷，不說話）'], label=sid)
        for _ in range(4): await drive(pg, cdp, run, picks=['（看著峽谷，不說話）'], max_s=90, label=sid); await pg.wait_for_timeout(1500)
        st = await pg.evaluate(STATE); q2 = await pg.evaluate(OUTQ + "('^y4_sis_canyon')"); T = texts(await log_since(pg, n0)); res['trip'] = {'st': st, 'out': q2, 'said': T[-10:]}
        run.check('%s：照玩家出發、演完大峽谷、回到臺北 10/15（%s %.2f）' % (sid, st['key'], st['h']), any(x['state'] == 'done' for x in q2) and st['key'] == '2028-10-15', J(res['trip'], 600))
        await run.shot(pg, '%s_back' % sid)
        M = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == Q14]; res['q14'] = M
        pend = await pg.evaluate(PEND + "(%s)" % json.dumps(Q14)); res['pend_1015'] = pend
        run.check('%s：回到臺北，子晴 10/11 21:00 那則 Q14 在手機裡、還回得到' % sid, bool(M) and bool(pend), J({'M': M, 'pend': pend}, 400))
        run.check('%s：回覆期限延到 10/16 12:00（%s）' % (sid, (pend or {}).get('untilKey')), bool(pend) and pend['untilKey'] == '2028-10-16 12.00', J(pend))
        if not pend: return
        await sleep_night(pg, cdp, run, sid)
        st = await pg.evaluate(STATE); res['wake'] = st
        if st['key'] != '2028-10-16' or st['h'] >= 12:
            run.check('%s：睡一晚醒來是 10/16 中午以前（%s %.2f）' % (sid, st['key'], st['h']), False, J(st)); return
        run.note('%s：10/16 %.2f 起床、回子晴 Q14（期限 12:00 以前）' % (sid, st['h']))
        await q14_answer(pg, cdp, run, sid, res)
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['AN_0912', 'AN_0915', 'AN_0920', 'CAFE_AUG', 'CAFE_NOAUG', 'Q14_HOME', 'Q14_CANYON', 'US_1223', 'GF_AN']
FN = {'AN_0912': s_an, 'AN_0915': s_an, 'AN_0920': s_an, 'CAFE_AUG': s_cafe_aug, 'CAFE_NOAUG': s_cafe_noaug, 'Q14_HOME': s_q14_home, 'Q14_CANYON': s_q14_canyon,
      'US_1223': s_us, 'GF_AN': s_gf_an}


async def main():
    run = L.Run('aa378x', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa378x.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
