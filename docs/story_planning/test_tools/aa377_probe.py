"""BB（帳號 A）2026-10-22：AA377-Y3S2-FIX-1021 法律系大三下（臺灣、日本、美國三條路線）修正——AA_377 第 5 節的 BB 測試＋第 6 節（第 2、6、9、17 項）＋第 7 節（AA 02:50 定）。
開發分支：第 1 項 014a38bc（y3），其他 c51e4b72（白名單 AA_377@eab1eba3）。第 7 節芷若大三下交往中的期末約會「禮拜四十點，等我下班。」開發分支還沒做＝那兩項標【等實作】（現在會 FAIL）。
台詞照 AA_377 原文一字對照。
  JP_ADMIN    #1 日本路線比較行政法（週四 13:00）：4/13 第一堂不提町公所；5/11（5/6 以後第一堂）出一次「今天講行政指導。你想起以安說的町公所。」；
              5/25（讀檔帶 5/11 玩出來的 G.jp）回到兩句輪流；三堂都沒有「期末報告的題目，你寫了三次才寫定。」
  JP_ZHE4_A   #2＋第 6-2 節 日本路線、阿哲 FRIEND：4/28 22:00 據點「快轉」→ 停在 4/29 0:00（臺灣 23:00）、「接起來：阿哲的視訊」→ 選「嗯。我在。」→
              「（他把紅茶喝完。你們講到臺灣十二點半。你這邊已經一點半。…）」、結束是 4/29 01:30（不是 4/30）；「睡覺」以後 4/29 冠軍賽直播的旁白演得到
  JP_ZHE4_C   同上選「（什麼都不說，坐著）」→「（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）」「走啦。謝了。明天記得看直播。」、4/29 01:00
  JP_328      #17 日本路線 3/28 18:30 摘要日：「（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）」
  TW_AN_326   #5 臺灣路線（沒和以安交往）：3/26（日）20:00 以安的訊息是飯糰那則、沒有「四月」
  TW_AN_409   #5 4/9（日）20:00 才是櫻花「四月。這邊的櫻花開得比較晚。」
  CIVPRO_522  #9＋第 6-1 節 5/22（一）民訴第 14 週：板書三行、教授一句、Alison／柏翰、選邊只有原告／被告（沒有法官）、整堂沒有「模擬法庭」
  ZR_MON      #8 芷若大三下週一 19:30：手機「朋友」不寫 Café、Café 沒有她
  ZR_WED      #8 週三 19:30：手機「兩點半 Café（打工，到 22:00）」、吧檯有她
  GF_ZR       第 7 節【等實作】和芷若交往中：期末時段第一天 6/8 20:15 她約「禮拜四十點，等我下班。」→「好。」→ 排在週四 22:00
  TEXTS       【讀資料，不是玩】#1、#2、#4～#18 的新句在、舊句不在（遊戲載入的原始檔，拿掉註解）；第 7 節心意第二次「禮拜四十點。……」；Y6-L3 選項條件
沒有做成瀏覽器情境的（只在 TEXTS 讀資料）：#3 讀書會整學期、#6 Y6-L3 四種玩家、#7 A6 略過／228／餞行、#10～#16、#18、#19 4/13 視訊時間——要的話再排。
【前置】讀使用者存檔改日期、時間、地點；路線旗標（EXCHANGE_ROUTE；日本路線＝X1_JP 2/20 退宿、JP_DEPARTED 3/25 出發、AN_SENDOFF）讀檔前寫進存檔，讀檔就在日本的據點；
讀檔後在頁面裡設關係、交往、群組。之後照玩家：日本的據點選單（去上課、快轉、睡覺、接起來）、手機回訊息、手機「今天」去上課、手機「朋友」、手機「地點」。
Playwright 手機橫向模擬、?turbo（每格最多 0.3 秒），不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=JP_ADMIN,... python3 aa377_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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


# ---------------------------------------------------------------- 日本路線的據點（2D 選單：時間只有選了才走）
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'AN_SENDOFF': 'together'}
L1 = '（教授的日文很快。你只抓得到一半，筆記上一半是問號。）'; L2 = '（旁邊的日本同學把筆記推過來給你看。字很小，很整齊。）'; TOWN = '今天講行政指導。你想起以安說的町公所。'
OLD_ADMIN = '期末報告的題目，你寫了三次才寫定。'
STREAM = '（日本晚上八點。你在宿舍的書桌前開著系上的直播，畫面一直卡。最後一顆，阿哲傳給明軒。他們贏了。）'
ZA = '（他把紅茶喝完。你們講到臺灣十二點半。你這邊已經一點半。他講了很多，大部分是高雄、他爸、高中的球隊。）'
ZC = ['（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）', '走啦。謝了。明天記得看直播。']


def is_menu(ops):
    return bool(ops) and '存檔' in ops and any(o.startswith('睡覺') for o in ops)


async def jp_until_menu(pg, cdp, run, picks=None, go=(), max_s=240, label='', shot_at=None):
    """日本的據點：演到據點選單（有「存檔」「睡覺」）出現為止；場景裡的選項照 picks、出遊照 go"""
    t0 = time.time(); ch = []; shot = False
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if is_menu(ops): return ops, ch
            if ops:
                k = pick_idx(ops, picks, go); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            if shot_at and not shot:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if shot_at in txt: await run.shot(pg, '%s_scene' % label); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1000)
    return None, ch


async def jp_choose(pg, cdp, prefix):
    ops = await opts(pg)
    k = next((i for i, o in enumerate(ops) if o.startswith(prefix)), None)
    if k is None: return None
    await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500); return ops[k]


async def jp_ff(pg, cdp):
    """據點選單「快轉」→「到下一個有事的日子」"""
    if not await jp_choose(pg, cdp, '快轉'): return None
    for _ in range(10):
        ops = await opts(pg)
        if any(o.startswith('到下一個有事的日子') for o in ops): break
        await pg.wait_for_timeout(500)
    return await jp_choose(pg, cdp, '到下一個有事的日子')


async def launch377(p, run, base, key, h, zone, preflags=None, **kw):
    """先把路線旗標寫進存檔再讀（日本路線讀檔就在日本的據點）；其他照 launch"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in ROOMS:
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    dating = kw.get('dating', ())
    for k in list(F.keys()):
        if k.startswith('dating_') and k[7:] not in dating: F[k] = False
    F['KX_DEC3_MIGRATED'] = True
    for k, v in (preflags or {}).items(): F[k] = (await pg.evaluate("STORY.dayOfKey('%s')" % v['$day'])) if isinstance(v, dict) and '$day' in v else v
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if kw.get('extraG'): G.update(kw['extraG'])
    await L.load_state(pg, G, quiet_events=kw.get('quiet', True)); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([kw.get('rels') or {}, list(dating), list(kw.get('repair', ())), kw.get('flags') or {}, [list(g) for g in kw.get('groups', ())], [list(m) for m in kw.get('mems', ())]]))
    r['inJapan'] = await pg.evaluate("!!(typeof STORY!=='undefined'&&STORY.inJapan&&STORY.inJapan(GAME.G))"); r['zone'] = await pg.evaluate("GAME.G.zone")
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（%s）；路線旗標 %s；關係 %s；交往 %s；挽回中 %s；群組 %s → %s' % (
        kw.get('label', ''), key, h, zone, 'quiet_events' if kw.get('quiet', True) else '事件系統開著', json.dumps(preflags or {}, ensure_ascii=False), json.dumps(kw.get('rels') or {}, ensure_ascii=False),
        list(dating) or '—', list(kw.get('repair', ())) or '—', [g[1] for g in kw.get('groups', ())] or '—', json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (kw.get('label', ''), json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r


# ---------------------------------------------------------------- 情境
@guard
async def s_jp_admin(p, run, base, sid, out):
    """#1 日本路線比較行政法（週四 13:00）：4/13 第一堂不提町公所；5/11（5/6 以後第一堂）提一次；之後（5/25）回到兩句輪流"""
    res = out.setdefault(sid, {}); carry = None
    for part, key in (('0413', '2028-04-13'), ('0511', '2028-05-11'), ('0525', '2028-05-25')):
        tag = '%s-%s' % (sid, part); r0 = res.setdefault(part, {})
        b, pg, cdp, errs, r = await launch377(p, run, base, key, 12.17, 'jp_hub', preflags=JPF, rels={'heroine_01': 'FAMILIAR'}, dating=('heroine_01',), extraG=({'jp': carry} if part == '0525' and carry else None),
                                             label=tag + '（日本路線、和以安交往中；週四 12:10 在日本的據點%s）' % ('；讀檔帶 5/11 玩出來的 G.jp（町公所那句已經出過）' if part == '0525' else ''))
        try:
            ops, _ = await jp_until_menu(pg, cdp, run, max_s=120, label=tag); r0['menu'] = ops
            got = await jp_choose(pg, cdp, '去上課：比較行政法')
            run.check('%s：據點選單有「去上課：比較行政法」（13:00 前一小時起）' % tag, bool(got), json.dumps(ops, ensure_ascii=False)[:300])
            if not got: continue
            n0 = await log_len(pg); ops2, _ = await jp_until_menu(pg, cdp, run, max_s=120, label=tag); T = texts(await log_since(pg, n0)); r0['log'] = T[:6]
            await run.shot(pg, '%s_after' % tag)
            if part == '0413': run.check('%s：4/13 第一堂＝「%s」、沒有町公所' % (tag, L1), L1 in T and TOWN not in T, json.dumps(T, ensure_ascii=False)[:300])
            elif part == '0511': run.check('%s：5/11（5/6 以後第一堂）＝「%s」' % (tag, TOWN), TOWN in T, json.dumps(T, ensure_ascii=False)[:300])
            else: run.check('%s：5/25 回到兩句輪流（%s／%s），町公所不再出' % (tag, L1[:8], L2[:8]), (L1 in T or L2 in T) and TOWN not in T, json.dumps(T, ensure_ascii=False)[:300])
            run.check('%s：沒有「%s」（拿掉）' % (tag, OLD_ADMIN), OLD_ADMIN not in T, '')
            if part == '0511': carry = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G.jp||null))"); r0['jp'] = carry
        finally: await finish_page(run, tag, r0, errs, b)


@guard
async def s_jp_zhe4(p, run, base, sid, out):
    """#2 日本路線、和阿哲 FRIEND：4/28 22:00 在據點「快轉」→ 4/29 0:00（臺灣 4/28 23:00）停、阿哲的視訊 → 選①／③ → 時間照當地（1:30／1:00，還是 4/29）；
    之後選「睡覺」→ 冠軍賽直播的旁白演得到（4/29 20:00）"""
    res = out.setdefault(sid, {}); a = sid == 'JP_ZHE4_A'
    b, pg, cdp, errs, r = await launch377(p, run, base, '2028-04-28', 22.0, 'jp_hub', preflags=JPF, rels={'heroine_01': 'FAMILIAR', 'zhe': 'FRIEND', 'classmate_mingxuan': 'FAMILIAR'}, dating=('heroine_01',), groups=(NT,),
                                         label=sid + '（日本路線、和以安交往中、阿哲 FRIEND、在麵店團；4/28 22:00 日本的據點）')
    try:
        ops, _ = await jp_until_menu(pg, cdp, run, max_s=120, label=sid)
        ff = await jp_ff(pg, cdp); res['ff'] = ff
        ops, ch0 = await jp_until_menu(pg, cdp, run, max_s=240, label=sid); st = await pg.evaluate(STATE); res['stop'] = st; res['menu'] = ops
        run.check('%s：「快轉」停在 4/29 0:00（臺灣 4/28 23:00），選單有「接起來：阿哲的視訊」' % sid, bool(ops) and any(o.startswith('接起來：阿哲') for o in ops), json.dumps({'state': st, 'menu': ops}, ensure_ascii=False)[:400])
        if not ops or not any(o.startswith('接起來：阿哲') for o in ops): return
        n0 = await log_len(pg); await jp_choose(pg, cdp, '接起來：阿哲')
        ops2, ch = await jp_until_menu(pg, cdp, run, picks=(['「嗯。我在。」'] if a else ['（什麼都不說，坐著）']), max_s=300, label=sid, shot_at='有事。我很緊張')
        T = texts(await log_since(pg, n0)); st2 = await pg.evaluate(STATE); res['log'] = T[:20]; res['after'] = st2
        if a: run.check('%s：選①＝「%s」' % (sid, ZA[:30]), ZA in T, json.dumps(T[-6:], ensure_ascii=False)[:500])
        else: run.check('%s：選③＝「%s」「%s」' % (sid, ZC[0][:24], ZC[1]), ZC[0] in T and ZC[1] in T, json.dumps(T[-6:], ensure_ascii=False)[:500])
        want_h = 1.5 if a else 1.0
        run.check('%s：視訊完是 4/29 %s（照當地時間，不是一口氣跳到 4/30）' % (sid, '01:30' if a else '01:00'), st2['key'] == '2028-04-29' and abs(st2['h'] - want_h) < 0.2, json.dumps(st2, ensure_ascii=False))
        await run.shot(pg, '%s_after_video' % sid)
        n1 = await log_len(pg); await jp_choose(pg, cdp, '睡覺')
        ops3, ch3 = await jp_until_menu(pg, cdp, run, max_s=300, label=sid); st3 = await pg.evaluate(STATE); res['wake'] = st3
        L3 = await log_since(pg, n1); T3 = texts(L3); res['log_sleep'] = T3[:8]
        F = await pg.evaluate("({fg:GAME.G.flags.FINAL_GAME_Y3||null, seen:!!GAME.G.flags.FINAL_STREAM_SEEN})"); res['flags'] = F
        if STREAM not in T3:   # 睡醒還沒到 20:00 的話照玩家再「快轉」一次
            await jp_ff(pg, cdp); await jp_until_menu(pg, cdp, run, max_s=300, label=sid); T3 = texts(await log_since(pg, n1)); F = await pg.evaluate("({fg:GAME.G.flags.FINAL_GAME_Y3||null, seen:!!GAME.G.flags.FINAL_STREAM_SEEN})")
        run.check('%s：4/29 冠軍賽直播演得到：「%s」（FINAL_GAME_Y3＝stream）' % (sid, STREAM[:20]), STREAM in T3 and F['fg'] == 'stream' and F['seen'], json.dumps({'T': T3[:6], 'F': F, 'wake': st3}, ensure_ascii=False)[:500])
        run.note('%s：凌晨 %s 在據點選「睡覺」→ 選單寫「明天 … 醒來」、實際醒在 %s %.2f（疑似：凌晨睡覺算成隔天的「明天」，中間只會停在有事的時間）' % (sid, '01:30' if a else '01:00', st3['key'], st3['h']))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_jp_328(p, run, base, sid, out):
    """#17 3/28 18:30 摘要日：「（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）」"""
    res = out.setdefault(sid, {}); W = '（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）'
    b, pg, cdp, errs, r = await launch377(p, run, base, '2028-03-28', 17.5, 'jp_hub', preflags=JPF, rels={'heroine_01': 'FAMILIAR'}, dating=('heroine_01',), label=sid + '（日本路線；3/28 17:30 日本的據點；選「快轉」）')
    try:
        await jp_until_menu(pg, cdp, run, max_s=120, label=sid); n0 = await log_len(pg); await jp_ff(pg, cdp)
        await jp_until_menu(pg, cdp, run, max_s=240, label=sid); T = texts(await log_since(pg, n0)); st = await pg.evaluate(STATE); res['log'] = T[:6]; res['state'] = st
        run.check('%s：快轉停在 3/28 18:30、旁白「%s」' % (sid, W[:16]), W in T and st['key'] == '2028-03-28', json.dumps({'T': T[:4], 'state': st}, ensure_ascii=False)[:400])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_tw_an(p, run, base, sid, out):
    """#5 臺灣路線（沒和以安交往）：以安在日本的週日訊息照日期——3/26 是飯糰那則、沒有「四月」；4/9 才是櫻花"""
    res = out.setdefault(sid, {}); key = '2028-03-26' if sid == 'TW_AN_326' else '2028-04-09'
    b, pg, cdp, errs, r = await launch377(p, run, base, key, 19.5, 'dorm', preflags={'EXCHANGE_ROUTE': 'TW'}, rels={'heroine_01': 'FAMILIAR'}, label=sid + '（臺灣路線、以安熟悉、沒交往；週日 19:30 宿舍）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:heroine_01'&&m.day===GAME.G.day&&(+m.h)>=19.9)", max_s=480, label=sid)
        M = [m for m in await msgs(pg, 'p:heroine_01') if m['d'] == key]; res['msgs'] = M
        Tm = [m['text'] for m in M]
        if sid == 'TW_AN_326':
            run.check('%s：3/26 20:00（她那邊 21:00）以安傳飯糰那則、沒有「四月」' % sid, ok and Tm[:2] == ['（照片：便利商店的飯糰架）', '飯糰的海苔要自己拉開。我研究了三天。'] and not any('四月' in t for t in Tm), json.dumps(M, ensure_ascii=False)[:400])
        else:
            run.check('%s：4/9 20:00 以安傳櫻花那則（四月才出）' % sid, ok and Tm[:2] == ['（照片：大學的櫻花）', '四月。這邊的櫻花開得比較晚。'], json.dumps(M, ensure_ascii=False)[:400])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_civpro(p, run, base, sid, out):
    """#9＋第 6-1 節：5/22（一）民訴（civpro_2 第 14 週）＝言詞辯論的練習，沒有「模擬法庭」、沒有法官"""
    res = out.setdefault(sid, {})
    BOARD = ['言詞辯論的順序：原告、被告', '先講要什麼，再講為什麼', '一個人一分鐘']; PROF = '左邊這半當原告，右邊這半當被告。一個人一分鐘，先講你要什麼。'
    REACTS = ['沒有法官喔？……那我當原告。我要先講。', '我計時。一分鐘，我幫大家按碼表。']; PROMPT = '蔡教授讓大家分成兩邊。你在……'; RES = '你發現說清楚「我要什麼」比想像中難。'
    b, pg, cdp, errs, r = await launch377(p, run, base, '2028-05-22', 8.6, 'dorm', preflags={'EXCHANGE_ROUTE': 'TW'}, rels={'yu': 'FAMILIAR', 'classmate_bohan': 'FAMILIAR'}, label=sid + '（臺灣路線；5/22 週一 08:36 宿舍）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); n0 = await log_len(pg)
        await phone_tab(pg, cdp, 'today'); got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-go]')][0]"); res['go'] = got
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［字幕］'&&/下課了/.test(x.t))", max_s=400, picks=['原告'], label=sid, shot_at='分成兩邊')
        Lg = await log_since(pg, n0); T = texts(Lg); res['log'] = [x['n'] + '｜' + x['t'] for x in Lg][:30]
        boards = [json.loads(x['t']) for x in Lg if x['n'] == '［板書］']; choices = [json.loads(x['t']) for x in Lg if x['n'] == '［選項］']
        run.check('%s：手機「今天」去上課、下課了（%s）' % (sid, got), bool(got) and ok, json.dumps(ch[:3], ensure_ascii=False)[:300])
        run.check('%s：板書三行＝%s' % (sid, '／'.join(BOARD)), BOARD in boards, json.dumps(boards, ensure_ascii=False)[:300])
        run.check('%s：教授「%s」' % (sid, PROF[:16]), any(PROF in t for t in T), json.dumps(T[:8], ensure_ascii=False)[:400])
        run.check('%s：同學反應是 Alison 或柏翰那一句' % sid, any(any(rx in t for rx in REACTS) for t in T), json.dumps(T[:10], ensure_ascii=False)[:400])
        run.check('%s：「%s」選項只有原告、被告（沒有法官）→ 選原告「%s」' % (sid, PROMPT, RES), PROMPT in T and ['原告', '被告'] in choices and RES in T, json.dumps({'choices': choices, 'T': T[-6:]}, ensure_ascii=False)[:400])
        run.check('%s：整堂課沒有「模擬法庭」' % sid, not any('模擬法庭' in (x['t'] or '') for x in Lg), '')
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zr(p, run, base, sid, out):
    """#8 芷若大三下只有週三、四 19:00～22:00 在吧檯：3/6（一）19:30 手機不寫 Café、Café 沒有她；3/8（三）19:30 手機寫「兩點半 Café（打工，到 22:00）」、吧檯有她"""
    res = out.setdefault(sid, {}); wed = sid == 'ZR_WED'; key = '2028-03-08' if wed else '2028-03-06'
    b, pg, cdp, errs, r = await launch377(p, run, base, key, 19.5, 'dorm', preflags={'EXCHANGE_ROUTE': 'TW'}, rels={'heroine_02': 'FAMILIAR'}, label=sid + '（臺灣路線；%s 19:30 宿舍；芷若熟悉）' % key)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        row, wt = await friend_row(pg, cdp, 'heroine_02'); res['row'] = row; res['where'] = wt; await run.shot(pg, '%s_phone' % sid); await L.phone_away(pg, cdp)
        if wed: run.check('%s：手機「朋友」芷若＝「兩點半 Café（打工，到 22:00）」' % sid, bool(row) and '兩點半 Café' in row and '打工' in row, json.dumps({'row': row, 'where': wt}, ensure_ascii=False)[:300])
        else: run.check('%s：手機「朋友」芷若不寫 Café（週一不排班）' % sid, bool(row) and 'Café' not in (wt or ''), json.dumps({'row': row, 'where': wt}, ensure_ascii=False)[:300])
        went = await quick_go(pg, cdp, 'cafe'); her = None
        for _ in range(12):
            her = await pg.evaluate(NPC + "('heroine_02')")
            if her: break
            await pg.wait_for_timeout(2000)
        res['npc'] = her; await run.shot(pg, '%s_cafe' % sid)
        run.check('%s：手機「地點」到 Café，%s' % (sid, '吧檯有芷若' if wed else '沒有芷若'), went and (bool(her) if wed else not her), json.dumps({'went': went, 'npc': her}, ensure_ascii=False))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_gf_zr(p, run, base, sid, out):
    """第 7 節（AA 02:50 定）：芷若大三下交往中的期末約會——「禮拜四十點，等我下班。」（週四 22:00）。開發分支還沒做＝等實作"""
    res = out.setdefault(sid, {}); WANT = '禮拜四十點，等我下班。'; OLD = '禮拜五九點，等我下班。'
    b, pg, cdp, errs, r = await launch377(p, run, base, '2028-06-08', 19.9, 'dorm', preflags={'EXCHANGE_ROUTE': 'TW'}, dating=('heroine_02',), label=sid + '（臺灣路線、和芷若交往中；期末時段第一天 6/8 19:54 宿舍）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='te_gf_Y3S2_heroine_02')", max_s=480, label=sid)
        M = [m for m in await msgs(pg, 'p:heroine_02') if m['tag'] == 'te_gf_Y3S2_heroine_02']; res['msg'] = M
        txt = M[-1]['text'] if M else None
        run.check('%s：【等實作】6/8 20:15 芷若「%s」（現在：%s）' % (sid, WANT, txt), ok and txt == WANT, json.dumps(M, ensure_ascii=False)[:300])
        if ok:
            await answer(pg, cdp, run, 'p:heroine_02', 'te_gf_Y3S2_heroine_02', '好。', sid)
            await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='te_gf_Y3S2_heroine_02')", max_s=60, label=sid)
            q = await pg.evaluate(OUTQ + "('^te_gf_Y3S2_heroine_02')"); res['out'] = q
            run.check('%s：【等實作】排在週四 22:00（現在：%s）' % (sid, ['週%s %.2f' % ('日一二三四五六'[x['wd']], x['h']) for x in q]), any(x['wd'] == 4 and abs(x['h'] - 22) < 0.01 for x in q), json.dumps(q, ensure_ascii=False))
        run.note('%s：開發分支 termend_lines.js 的 GF.heroine_02 沒有大三下的 over，大三下還是用「%s」（週五 21:00）＝AA_377 第 7 節還沒做' % (sid, OLD))
    finally: await finish_page(run, sid, res, errs, b)


TEXT_ITEMS = [  # [項目, 檔案（多個＝任一個有就算）, 要有的, 不能有的]
    ('#4 以安在日本：公寓（訊息、視訊、群組、A6-L2）', ['src/data/r2y3b_events.js', 'src/data/jp_events.js', 'src/jp3d.js', 'src/data/ladder.js'],
     ['（照片：公寓的投幣洗衣機）', '我回房間查字典', '（畫面裡是她房間的書桌', '理由：公寓的走廊晚上會有回音', '房東寄來的信，我還看不太懂', '公寓的垃圾分六種', '投幣洗衣機三號壞了'],
     ['（照片：宿舍的洗衣機）', '回宿舍查字典', '她宿舍的書桌', '理由：宿舍的走廊', '宿舍寄來的信', '宿舍的垃圾分六種', '宿舍三號洗衣機']),
    ('#5 期中那則', ['src/data/r2y3b_events.js'], ['你那邊期中考了嗎？'], ['你那邊的行政法，期中考了嗎？']),
    ('#6 語彤 Y6-L3（第 6-3 節）', ['src/data/ladder.js'], ['以安傳在群組那張杜鵑花，是你拍的吧。……拍得很好。', '……這張她眨眼了。', '你沒傳這張，是對的。'], []),
    ('#7 挽回中的餞行、228（第 7 節）', ['src/y34b3d.js', 'src/data/r2y3b_events.js'], ['（以安點了一下頭，沒有說話。）', '（以安看了你一眼，又低頭寫。）'], []),
    ('#8 芷若學期末（心意、朋友、第二次）', ['src/data/termend_lines.js'], ['這禮拜四我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。', '禮拜四十點。……上次那句，你想好了嗎？', '考完了嗎？禮拜四我下班以後，吃個東西？'], []),
    ('#9 民訴第 14 週（syllabus 整份沒有模擬法庭）', ['src/data/syllabus.js'], ['言詞辯論的順序：原告、被告', '先講要什麼，再講為什麼', '一個人一分鐘', '上週的練習：講義在課程網'], ['模擬法庭']),
    ('#10 子晴大三下', ['src/data/termend_lines.js'], ['你考完了吧 宵夜'], []),
    ('#11 芷若飯桌、Z12', ['src/data/termend_lines.js', 'src/data/group_events.js'], ['……六月的週五，你先全部給我。', '我七月先回台中，去影印店幫忙一個月。'], ['……八月以前的週五，你先全部給我。', '去影印店幫忙一個暑假']),
    ('#12 日本挽回中 5/14', ['src/jp3d.js'], ['比較行政法的報告，我排在第六週。'], ['比較行政法的報告，我排在第八週。']),
    ('#13 可昕 5/3 日本路線', ['src/y34b3d.js'], ['報告講完了。……好累。'], []),
    ('#14 柏翰 4/13 日本路線', ['src/data/r2y3b_events.js'], ['你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。'], []),
    ('#15 語彤 Y6-L1（有 T1 的）', ['src/data/ladder.js'], ['週四我還是五點就到店門口。……只是現在不是去顧店。'], []),
    ('#16 語彤 Y6-L4', ['src/data/ladder.js'], ['巷子裡有個修鞋的老闆，我又去找他聊了一次。'], []),
    ('#17 3/28 摘要日', ['src/jp3d.js'], ['（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）'], []),
    ('#18 床墊（第 7 節：三個地方）', ['src/r2y3a3d.js'], ['（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'], ['大一的課表']),
    ('#18 床墊 r2y3b3d.js', ['src/r2y3b3d.js'], ['（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'], ['大一的課表']),
    ('#18 床墊 r2y3b_events.js', ['src/data/r2y3b_events.js'], ['（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'], ['大一的課表']),
    ('#1 比較行政法拿掉的那句', ['src/jp3d.js'], ['今天講行政指導。你想起以安說的町公所。'], ['期末報告的題目，你寫了三次才寫定。']),
    ('#2 哲 4 日本版旁白（第 6-2 節）', ['src/data/group_events.js'], [ZA, ZC[0], ZC[1]], [])]
TEXT_JS = """(async items=>{ const out=[]; const cache={}; const get=async f=>{ if(!(f in cache)){ try{ cache[f]=(await (await fetch(f)).text()).replace(/\\/\\*[\\s\\S]*?\\*\\//g,''); }catch(e){ cache[f]=''; } } return cache[f]; };
  for(const [k,fs,yes,no] of items){ let s=''; for(const f of fs) s+='\\n'+(await get(f)); out.push({k,f:fs.join('、'),miss:yes.filter(t=>!s.includes(t)),still:no.filter(t=>s.includes(t))}); } return out; })"""
LOGIC_JS = """(()=>{ const r={}; try{ const g=TERMEND.gf('heroine_02','Y3S2'); r.gf={invite:typeof g.invite==='function'?'(函式)':g.invite,wd:g.wd,h:g.h}; }catch(e){ r.gf='ERR '+e.message; }
  try{ const h=TERMEND.heart('heroine_02','Y3S2'); r.heart={invite:h.invite,invite2:h.invite2,wd:h.wd,h:h.h}; }catch(e){ r.heart='ERR '+e.message; }
  try{ const c=STORY.LADDER_CHOICE_IF&&STORY.LADDER_CHOICE_IF['Y6-L3']; r.y6l3=c?Object.keys(c):null; }catch(e){ r.y6l3='ERR'; }
  try{ r.an_when=Object.keys((R2Y3B&&R2Y3B.AB_WHEN)||{}); }catch(e){ r.an_when='ERR'; } return r; })()"""


@guard
async def s_texts(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch377(p, run, base, '2028-04-20', 12.0, 'dorm', preflags={'EXCHANGE_ROUTE': 'TW'}, label=sid + '（只讀資料：遊戲載入的原始檔（拿掉註解）＋頁面裡的資料；不是玩）')
    try:
        R = await pg.evaluate(TEXT_JS + "(%s)" % json.dumps(TEXT_ITEMS, ensure_ascii=False)); res['texts'] = R
        for x in R: run.check('%s：【讀資料，不是玩】AA_377 %s（%s）' % (sid, x['k'], x['f']), not x['miss'] and not x['still'], json.dumps({'缺': x['miss'], '還在': x['still']}, ensure_ascii=False))
        Lg = await pg.evaluate(LOGIC_JS); res['logic'] = Lg
        hv = Lg.get('heart') or {}
        run.check('%s：【讀資料】第 7 節芷若大三下心意邀約第二次「禮拜四十點。……上次那句，你想好了嗎？」、週四 22:00' % sid, isinstance(hv, dict) and hv.get('invite2') == '禮拜四十點。……上次那句，你想好了嗎？' and hv.get('wd') == 4 and hv.get('h') == 22, json.dumps(hv, ensure_ascii=False))
        gv = Lg.get('gf') or {}
        run.check('%s：【讀資料】【等實作】第 7 節芷若大三下交往中期末約會「禮拜四十點，等我下班。」週四 22:00' % sid, isinstance(gv, dict) and gv.get('invite') == '禮拜四十點，等我下班。' and gv.get('wd') == 4 and gv.get('h') == 22, json.dumps(gv, ensure_ascii=False))
        run.check('%s：【讀資料】#6 語彤 Y6-L3 的選項條件（AN3_AZALEA：「妳也有拍嗎？」換「（給她看手機裡的另一張）」）' % sid, isinstance(Lg.get('y6l3'), list) and '（給她看手機裡的另一張）' in Lg['y6l3'], json.dumps(Lg.get('y6l3'), ensure_ascii=False))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['JP_ADMIN', 'JP_ZHE4_A', 'JP_ZHE4_C', 'JP_328', 'TW_AN_326', 'TW_AN_409', 'CIVPRO_522', 'ZR_MON', 'ZR_WED', 'GF_ZR', 'TEXTS']
FN = {'JP_ADMIN': s_jp_admin, 'JP_ZHE4_A': s_jp_zhe4, 'JP_ZHE4_C': s_jp_zhe4, 'JP_328': s_jp_328, 'TW_AN_326': s_tw_an, 'TW_AN_409': s_tw_an, 'CIVPRO_522': s_civpro,
      'ZR_MON': s_zr, 'ZR_WED': s_zr, 'GF_ZR': s_gf_zr, 'TEXTS': s_texts}


async def main():
    run = L.Run('aa377', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa377.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
