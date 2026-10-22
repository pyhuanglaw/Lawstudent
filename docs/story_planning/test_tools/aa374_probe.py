"""BB（帳號 A）2026-10-22：AA374-Y2S1-FIX-1021 法律系大二上（AA_374 第 5 節＋幾項玩家看得到的；開發分支 ea00c8bd 起，LAWWW 01:5x 合併）。
AA_374 第 5 節的 BB 測試：①大二上晚上進 312 看到阿哲、柏翰，沒有阿凱 ②9/16～17 博覽會法服攤位是柏翰、沒有學姊 ③和沛珊交往中的存檔第 6 週沒有「我和柏翰分開了」
④小語問博覽會那則 9/16 以前收到 ⑤12/17 晚上回沛珊的筆記她當晚會回、12/18 以後回她不回（交往中照例外）。
（小語改名 Alison＝AA_380 還沒實作：照開發分支現在的名字「小語」測，台詞、對話串用 id yu 對，不看名字。）
  DORM312     10/7（三）22:40 在校園，手機「地點」回宿舍：312 裡阿哲（L1）、柏翰（R1）在，阿凱不在；手機「朋友」三個人的「大概在哪」記下來（觀察）
  DORM_EARLY  10/7 19:00 回宿舍：阿凱不在（他 9/6 以後住別棟）；阿哲、柏翰還沒回來（22:00、22:30 以後）
  EXPO_LAW    9/16（三）12:30 校園博覽會（不開 quiet_events：自動事件要跑）：加入法服的 → 走到攤位 → 站法服攤位 →「先問事實，再找條文。」：
              旁白「攤位後面，柏翰抬頭看了你一眼。」、柏翰「……順序對了。」；沒有學姊（不說話、沒有「學姊抬起頭」）；熟悉 +1 給柏翰、學姊不加（第 6 項）
  EXPO_BALL   9/16 系籃攤位、沒有 ZHE_CALLS_GE：阿哲「欸，你站這裡。身高夠，看起來很會打。」（不是「哥，…」；第 7 項）
  YU_EXPO     9/13（日）20:50 宿舍：21:00「這週的訊息」裡小語「社團博覽會你站哪一攤？我要去偷看。」（9/13＝博覽會 9/16 以前；第 3 項）→ 回「妳來就知道。」→「好神秘。我帶阿哲去。」
  NEED_W13    12/6（日）21:00 這週的訊息：以安公文那則（「我家教學生家的補助被駁回了，公文我拿到了。」）在；阿哲記分那則還沒有（第 4、5 項）
  NEED_W14    12/13（日）21:00：阿哲「週六系籃缺一個記分的。你會加減吧？」（週六＝12/19 系籃；第 4 項）
  WHERE_WED   10/7（三）19:30 手機「朋友」：柏翰在總圖讀書，不在萬才館「社團」（第 19 項）
  WHERE_THU   10/8（四）14:00 手機「朋友」：同學不在霖澤館 201「上課」（大二上週四下午沒課；第 19 項）
  PS_SPLIT    沒有和沛珊交往：第 6 週週一 10/12 12:15 走進霖澤館、走到沛珊旁邊＝走廊那一件（沒看過 P3＝「跟你說一下，我跟柏翰分開了。」「我們都還好，讀書會照常。」；第 18 項）
  PS_DATING   和沛珊交往中：同一個時間、同一個地方站在她旁邊＝不演（第 11 項、BB 測試③）
  PS_GROUP    沒交往、沒遇到走廊那一件：10/16（五）21:00 麵店團群組 BB_97 版四則（第 18 項）
  PS_GROUP_DATING 交往中：10/16 21:00 群組不發（BB 測試③）
  PS_NOTES_IN 12/17（四）22:00「這學期的題目和筆記，我放在萬才館櫃子的第二格。」→ 當晚回「收到。」→ 她回「……謝謝你接住。」（第 17 項、BB 測試⑤）
  PS_NOTES_LATE 沒交往、當晚不回、睡到 12/18：回不了（期限到 12/17 23:59）、她沒有回（BB 測試⑤）
  PS_NOTES_DATING 交往中、當晚不回、睡到 12/18 早上才回：她照樣回「……謝謝你接住。」（例外；BB 測試⑤）
【前置】讀使用者存檔（舊局 9/25）改日期、時間、地點（每個情境寫在 run.setup）；設那幾個人的關係（認識 FIRST_MET、熟悉度、聯絡方式）、麵店團群組、法服／系籃社團、
讀書會旗標（STUDYGROUP_LEADER、ev_peishan_handover 演過）；大二的房間 ROOM_Y2 照日期（9/6 以後）。quiet_events 只在不需要自動事件的情境開。之後照玩家：手機回訊息、
床上睡覺、手機「地點」前往、走過去、按門、選項。Playwright 手機橫向模擬、?turbo，不是 iPhone。【讀資料】的項目另外標。
用法：LW_TESTS=<開發分支>/tests SCEN=DORM312,... python3 aa374_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
async def s_dorm(p, run, base, sid, out):
    res = out.setdefault(sid, {}); h = 22.67 if sid == 'DORM312' else 19.0
    b, pg, cdp, errs = await launch(p, run, base, '2026-10-07', h, 'campus', rels=(('zhe', 'FAM'), ('classmate_bohan', 'FAM'), ('kai', 'FAM')), label=sid + '（在校園，手機「地點」回宿舍）')
    try:
        await drive(pg, cdp, run, max_s=40, label=sid)
        ok = await quick_go(pg, cdp, 'dorm'); st = await pg.evaluate(STATE); res['arrive'] = st
        run.check('%s：手機「地點」回到宿舍（%s）' % (sid, st['key']), ok, json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(3000); n = await pg.evaluate(NPCS); ids = [x['id'] for x in n]; res['npcs'] = n
        room = await pg.evaluate("(()=>({ROOM_Y2:GAME.G.flags.ROOM_Y2!=null, mates:typeof STORY!=='undefined'&&STORY.dormMates?STORY.dormMates(GAME.G):null, kaiRoommate:typeof STORY!=='undefined'&&STORY.kaiRoommate?STORY.kaiRoommate(GAME.G):null}))()"); res['room'] = room
        await run.shot(pg, '%s_room' % sid)
        if sid == 'DORM312':
            run.check('DORM312：大二上 22:40 進 312：阿哲、柏翰在，阿凱不在（BB 測試①）', 'zhe' in ids and 'classmate_bohan' in ids and 'kai' not in ids, json.dumps({'npcs': ids, 'room': room}, ensure_ascii=False))
        else:
            run.check('DORM_EARLY：19:00 進房間：阿凱不在；阿哲、柏翰還沒回來（22:00、22:30 以後）', 'kai' not in ids and 'zhe' not in ids and 'classmate_bohan' not in ids, json.dumps({'npcs': ids, 'room': room}, ensure_ascii=False))
        ft = await friends_text(pg, cdp, run, sid); nm = await pg.evaluate("({kai:SOCIAL.displayName('kai'),zhe:SOCIAL.displayName('zhe'),bohan:SOCIAL.displayName('classmate_bohan')})")
        rows = {k: row_of(ft, v) for k, v in nm.items()}; res['friends'] = rows
        say('   %s 手機「朋友」：%s' % (sid, json.dumps(rows, ensure_ascii=False)))
        if rows.get('kai') and '就在這裡' in rows['kai'] and 'kai' not in ids:
            run.note('%s（觀察，不是 AA_374 的測試點）：阿凱不在房間，手機「朋友」卻寫「%s」——他的作息是宿舍書桌（別棟），玩家在自己的宿舍時顯示「就在這裡」' % (sid, rows['kai']))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_expo(p, run, base, sid, out):
    res = out.setdefault(sid, {}); law = sid == 'EXPO_LAW'
    fl = {'CLUB_lawclub_study': True} if law else {'CLUB_dept_basketball': True, 'ZHE_CALLS_GE': None}
    b, pg, cdp, errs = await launch(p, run, base, '2026-09-16', 12.5, 'campus', rels=(('classmate_bohan', 'FAM'), ('heroine_05', 'FAM'), ('zhe', 'FAM')), flags=fl, met=('heroine_05',), quiet=False,
                                    label=sid + '（加入%s；認識柏翰、學姊、阿哲）' % ('法服' if law else '系籃、沒有 ZHE_CALLS_GE'))
    try:
        await drive(pg, cdp, run, max_s=90, label=sid)
        f0 = await pg.evaluate("[+SOCIAL.rel('classmate_bohan').fam, +SOCIAL.rel('heroine_05').fam]")
        if (await pg.evaluate("GAME.G.zone")) != 'campus': await quick_go(pg, cdp, 'campus|椰林大道')
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        await L.go_to(pg, cdp, run, -13.5, 13.6, 2.5, '博覽會攤位', max_s=240)
        picks = ['（在法服的攤位', '先問事實'] if law else ['（在系籃的攤位']
        ok, ch = await wait_for(pg, cdp, run, "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_y2_club_expo)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=240, picks=picks, label=sid)
        await drive(pg, cdp, run, picks=picks, max_s=60, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = texts(log); res['log'] = log; res['ch'] = ch
        f1 = await pg.evaluate("[+SOCIAL.rel('classmate_bohan').fam, +SOCIAL.rel('heroine_05').fam]"); res['fam'] = [f0, f1]
        await run.shot(pg, '%s_after' % sid)
        run.check('%s：9/16 走到博覽會攤位＝大二的博覽會（「去年，你站在這一排攤位前面填表。」「今年，你站在攤位後面。」）' % sid, ok and in_order(T, ['去年，你站在這一排攤位前面填表。', '今年，你站在攤位後面。']) is None, json.dumps(T[:6], ensure_ascii=False))
        if law:
            nm_b = await pg.evaluate("SOCIAL.displayName('classmate_bohan')"); nm_s = await pg.evaluate("[SOCIAL.displayName('heroine_05'),'溫書瑀','學姊','溫學姊']")
            said_b = [x['t'] for x in log if x['n'] == nm_b or x.get('id') == 'classmate_bohan']
            run.check('EXPO_LAW：「先問事實，再找條文。」→ 旁白「攤位後面，柏翰抬頭看了你一眼。」、柏翰「……順序對了。」（BB 測試②、第 6 項）', '攤位後面，柏翰抬頭看了你一眼。' in T and '……順序對了。' in said_b, json.dumps({'T': T[:14], 'bohan': said_b}, ensure_ascii=False)[:600])
            run.check('EXPO_LAW：沒有學姊（沒有「學姊抬起頭」「繼續整理報名表」，學姊不說話）', not any('學姊抬起頭' in t or '繼續整理報名表' in t for t in T) and not any(x['n'] in nm_s or x.get('id') == 'heroine_05' for x in log if x['n'] not in ('［選項］', '［字幕］')), json.dumps(T[:14], ensure_ascii=False)[:500])
            run.check('EXPO_LAW：熟悉 +1 給柏翰、學姊不加（after）', f1[0] - f0[0] == 1 and f1[1] == f0[1], json.dumps([f0, f1]))
            if '……這句，是學姊的。' in said_b: run.note('EXPO_LAW：柏翰接著說「……這句，是學姊的。」（AA_358 2-5 的句子；開發分支註解寫 AA_374 沒提、照留、給 AA 的問題）——台詞提到學姊，學姊本人不在攤位')
        else:
            said_z = [x['t'] for x in log if x.get('id') == 'zhe' or x['n'] == '阿哲']
            run.check('EXPO_BALL：沒有 ZHE_CALLS_GE＝阿哲「欸，你站這裡。身高夠，看起來很會打。」，沒有「哥，…」（第 7 項）', '欸，你站這裡。身高夠，看起來很會打。' in said_z and not any(t.startswith('哥，') for t in said_z), json.dumps(said_z, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


NEED = {'YU_EXPO': ('2026-09-13', 'yu', 'yu_expo', ['社團博覽會你站哪一攤？我要去偷看。'], '妳來就知道。', ['好神秘。我帶阿哲去。'], (('yu', 'FAM'),)),
        'NEED_W13': ('2026-12-06', 'heroine_01', 'an_admin', ['我家教學生家的補助被駁回了，公文我拿到了。', '……先看哪一段？我想先自己看懂。'], None, None, (('heroine_01', 'FAM'), ('zhe', 'FAM'))),
        'NEED_W14': ('2026-12-13', 'zhe', 'zhe_score', ['週六系籃缺一個記分的。你會加減吧？'], '會。', ['那就是你了。不准跑。'], (('heroine_01', 'FAM'), ('zhe', 'FAM')))}


async def s_need(p, run, base, sid, out):
    res = out.setdefault(sid, {}); key, who, eid, lines, reply, resp, rels = NEED[sid]
    b, pg, cdp, errs = await launch(p, run, base, key, 20.85, 'dorm', rels=rels, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=21.03&&(GAME.G.msgs||[]).some(m=>m.th==='sys'&&/這週的訊息/.test(m.text||'')&&m.day===GAME.G.day)", max_s=420, label=sid)
        M = await msgs(pg, 'p:' + who); mine = [m for m in M if m['d'] == key]; res['msgs'] = mine
        batch = await pg.evaluate("(()=>{ const N=GAME.G.needed||{}; return (N.batches||[]).map(b=>({d:CALENDAR.dateOf(b.d).key, ids:b.ids})); })()"); res['batches'] = batch
        say('   %s 這週的訊息：%s' % (sid, json.dumps(batch, ensure_ascii=False)))
        got = [m['text'] for m in mine if m['h'] >= 20.99]
        run.check('%s：%s（日）21:00「這週的訊息」裡 %s「%s」' % (sid, key, who, '」「'.join(lines)), ok and in_order(got, lines) is None, json.dumps({'got': got, 'batch': batch[-1:] if batch else None}, ensure_ascii=False)[:500])
        if sid == 'NEED_W13':
            Z = await msgs(pg, 'p:zhe')
            run.check('NEED_W13：12/6 阿哲「週六系籃缺一個記分的」還沒有（第 13 週；12/6 發會指 12/12，系籃是 12/19）', not any('記分' in m['text'] for m in Z if m['d'] == key), json.dumps([m['text'] for m in Z if m['d'] == key], ensure_ascii=False))
        if reply:
            g, m = await answer(pg, cdp, run, 'p:' + who, "/_%s$/.test(m.ask.id)" % eid, reply, sid)
            await pg.wait_for_timeout(2500); M2 = await msgs(pg, 'p:' + who); res['after'] = M2[-3:]
            run.check('%s：回「%s」→ %s「%s」' % (sid, reply, who, '」「'.join(resp)), bool(g) and in_order([x['text'] for x in M2], resp) is None, json.dumps({'tap': g, 'msgs': M2[-3:]}, ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_where(p, run, base, sid, out):
    res = out.setdefault(sid, {}); ids = ['classmate_bohan', 'classmate_xinci', 'heroine_01', 'yu', 'classmate_mingxuan', 'classmate_peishan']
    key, h = ('2026-10-07', 19.5) if sid == 'WHERE_WED' else ('2026-10-08', 14.0)
    b, pg, cdp, errs = await launch(p, run, base, key, h, 'dorm', rels=tuple((i, 'FAM') for i in ids), label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ft = await friends_text(pg, cdp, run, sid); nm = await pg.evaluate("(ids=>Object.fromEntries(ids.map(i=>[i,SOCIAL.displayName(i)])))(%s)" % json.dumps(ids))
        rows = {i: row_of(ft, nm[i]) for i in ids}; res['rows'] = rows; say('   %s：%s' % (sid, json.dumps(rows, ensure_ascii=False)))
        sch = await pg.evaluate("(ids=>Object.fromEntries(ids.map(i=>{ const e=STORY.schedEnt(CHARACTERS[i],GAME.G); return [i,e?(e.zone||'')+'/'+(e.act||''):null]; })))(%s)" % json.dumps(ids)); res['sched'] = sch
        if sid == 'WHERE_WED':
            r = rows.get('classmate_bohan') or ''
            run.check('WHERE_WED：10/7（三）19:30 手機「朋友」柏翰在總圖讀書，不在萬才館（法服週三讀書會作廢；第 19 項）', '總圖' in r and '萬才館' not in r, json.dumps({'row': r, 'sched': sch.get('classmate_bohan')}, ensure_ascii=False))
        else:
            bad = {i: rows[i] for i in ids if rows.get(i) and '201' in rows[i] and '上課' in rows[i]}
            run.check('WHERE_THU：10/8（四）14:00 同學沒有人在「霖澤館 201（上課）」（大二上週四下午沒課；第 19 項）', not bad, json.dumps({'rows': rows, 'sched': sch}, ensure_ascii=False)[:600])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


PS_SHORT = ['跟你說一下，我跟柏翰分開了。', '我們都還好，讀書會照常。']; PS_FULL = ['我們上週分開了。我自己說的。', '柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。']
PS_GRP = [('classmate_peishan', '說一件事，說完就好。'), ('classmate_peishan', '我和柏翰分開了。是我說的。我們都好。'), ('classmate_peishan', '……大家照常吃飯，不用特別安慰我。'), ('zhe', '……收到。')]


async def s_ps_split(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'PS_DATING'
    b, pg, cdp, errs = await launch(p, run, base, '2026-10-12', 12.1, 'campus', rels=(('classmate_peishan', 'FRI'), ('classmate_bohan', 'FAM')), dating=(('classmate_peishan',) if dating else ()), quiet=False,
                                    label=sid + '（第 6 週週一 12:06 在校園，走進霖澤館找沛珊；%s）' % ('和沛珊交往中' if dating else '沒交往、沒看過 P3'))
    try:
        await drive(pg, cdp, run, max_s=60, label=sid)
        if (await pg.evaluate("GAME.G.zone")) != 'campus': await quick_go(pg, cdp, 'campus|台大校園（霖澤館前）')
        ok, it = await enter_door(pg, cdp, run, 'linze', sid); st = await pg.evaluate(STATE); res['enter'] = [st, it]
        run.check('%s：走進霖澤館（%s）' % (sid, it[3] if it else '找不到門'), ok, json.dumps(st, ensure_ascii=False))
        n0 = len(await pg.evaluate("window.__LOG||[]")); her = None; t0 = time.time()
        while time.time() - t0 < 60 and not her:
            her = await find_npc(pg, ['classmate_peishan'])
            if not her: await drive(pg, cdp, run, max_s=10, label=sid); await pg.wait_for_timeout(2000)
        res['her'] = her; st = await pg.evaluate(STATE)
        if not her:
            await run.shot(pg, '%s_noher' % sid); run.note('%s：NOT TESTED——%s %.2f 霖澤館裡沒有沛珊（作息 12:12～12:40 是霖澤館 linger）' % (sid, st['key'], st['h'])); res['errs'] = errs[:3]
        else:
            await L.go_to(pg, cdp, run, her[0], her[1], 1.6, '沛珊', max_s=150, lv=her[2])
            ok2, ch = await wait_for(pg, cdp, run, "!!(GAME.G.flags&&GAME.G.flags.HEARD_PS_SPLIT)&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=(60 if dating else 150), label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; T = texts(log); res['log'] = log; st = await pg.evaluate(STATE); res['at'] = st
            fl = await pg.evaluate("(()=>({HEARD:GAME.G.flags.HEARD_PS_SPLIT||null, SPLIT:GAME.G.flags.PEISHAN_BOHAN_SPLIT||null, done:!!(GAME.G.events.done||{}).ev_peishan_split}))()"); res['flags'] = fl
            await run.shot(pg, '%s_after' % sid)
            if dating:
                run.check('PS_DATING：和沛珊交往中，第 6 週中午站在她旁邊＝沒有「分開了」那一件（BB 測試③、第 11 項）', not any(t in T for t in PS_SHORT + PS_FULL) and not fl['done'] and not fl['HEARD'], json.dumps({'T': T[:8], 'flags': fl, 'at': st}, ensure_ascii=False)[:500])
            else:
                run.check('PS_SPLIT：沒交往、沒看過 P3：走廊那一件是短的兩句「%s」（第 18 項）' % '」「'.join(PS_SHORT), ok2 and in_order(T, PS_SHORT) is None and not any(t in T for t in PS_FULL), json.dumps({'T': T[:8], 'flags': fl}, ensure_ascii=False)[:500])
                run.check('PS_SPLIT：記 HEARD_PS_SPLIT、PEISHAN_BOHAN_SPLIT（合併的那一件也記原本的後果）', fl['HEARD'] is True and fl['SPLIT'] is True, json.dumps(fl))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_ps_group(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'PS_GROUP_DATING'
    b, pg, cdp, errs = await launch(p, run, base, '2026-10-16', 20.85, 'dorm', rels=(('classmate_peishan', 'FRI'), ('zhe', 'FAM'), ('yu', 'FAM')), dating=(('classmate_peishan',) if dating else ()),
                                    groups=(('noodle_team', '麵店團'),), label=sid + '（第 6 週週五；沒遇到走廊那一件；%s）' % ('和沛珊交往中' if dating else '沒交往'))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=21.2", max_s=420, label=sid)
        M = await msgs(pg, 'g:noodle_team'); got = [(m['from'], m['text']) for m in M if m['d'] == '2026-10-16']; res['grp'] = got
        await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='g:noodle_team')"); await run.shot(pg, '%s_group' % sid); await L.phone_away(pg, cdp)
        if dating:
            run.check('PS_GROUP_DATING：交往中＝10/16 21:00 群組沒有「我和柏翰分開了」（BB 測試③）', ok and not any('分開了' in t for _, t in got), json.dumps(got, ensure_ascii=False))
        else:
            run.check('PS_GROUP：沒遇到走廊那一件＝10/16 21:00 麵店團群組 BB_97 版四則（沛珊三則、阿哲「……收到。」；沒有「你們吃你們的」）', ok and got == PS_GRP, json.dumps(got, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_ps_notes(p, run, base, sid, out):
    res = out.setdefault(sid, {}); dating = sid == 'PS_NOTES_DATING'; NOTE = '這學期的題目和筆記，我放在萬才館櫃子的第二格。'; THX = '……謝謝你接住。'
    b, pg, cdp, errs = await launch(p, run, base, '2026-12-17', 21.85, 'dorm', rels=(('classmate_peishan', 'FRI'),), dating=(('classmate_peishan',) if dating else ()), flags={'STUDYGROUP_LEADER': True},
                                    done=('ev_peishan_handover',), label=sid + '（前置：接了讀書會 STUDYGROUP_LEADER、12/17 交接那一場演過；%s）' % ('和沛珊交往中' if dating else '沒交往'))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='ps_notes')", max_s=420, label=sid)
        M = await msgs(pg, 'p:classmate_peishan'); m0 = [m for m in M if m['text'] == NOTE]; res['note'] = m0
        run.check('%s：12/17（四）22:00 沛珊「%s」、回覆「收到。」' % (sid, NOTE), ok and bool(m0) and m0[-1]['d'] == '2026-12-17' and 21.99 <= m0[-1]['h'] <= 22.2 and m0[-1]['ask'] and m0[-1]['ask']['opts'] == ['收到。'], json.dumps(M[-2:], ensure_ascii=False))
        if sid == 'PS_NOTES_IN':
            g, _ = await answer(pg, cdp, run, 'p:classmate_peishan', "m.ask.id==='ps_notes'", '收到。', sid)
            ok3, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:classmate_peishan'&&m.text===%s)" % json.dumps(THX), max_s=120, label=sid)
            M2 = await msgs(pg, 'p:classmate_peishan'); st = await pg.evaluate(STATE); res['after'] = M2[-3:]
            run.check('PS_NOTES_IN：12/17 當晚回「收到。」→ 她當晚回「%s」（12/17 當天照常，BB 測試⑤）' % THX, bool(g) and ok3 and any(m['text'] == THX and m['d'] == '2026-12-17' for m in M2), json.dumps({'msgs': M2[-3:], 'now': st}, ensure_ascii=False)[:400])
        else:
            ops, slept = await sleep_night(pg, cdp, run, sid); st = await pg.evaluate(STATE); res['morning'] = st
            run.check('%s：當晚不回、上床「睡到明天」→ 12/18' % sid, st['key'] == '2026-12-18', json.dumps({'bed': ops, 'now': st}, ensure_ascii=False)[:300])
            pend = await pg.evaluate("PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id==='ps_notes')"); res['pending_1218'] = pend
            await phone_tab(pg, cdp, 'msg'); await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th==='p:classmate_peishan')")
            btn = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].filter(b=>b.dataset.ask.startsWith('ps_notes|')).map(b=>({t:b.textContent.trim(),dis:!!b.disabled}))"); res['btn_1218'] = btn
            await run.shot(pg, '%s_thread_1218' % sid); await L.phone_away(pg, cdp)
            if dating:
                run.check('PS_NOTES_DATING：交往中＝12/18 還回得了（例外，沒有期限）', pend and bool(btn), json.dumps({'pending': pend, 'btn': btn}, ensure_ascii=False))
                g, _ = await answer(pg, cdp, run, 'p:classmate_peishan', "m.ask.id==='ps_notes'", '收到。', sid)
                ok3, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:classmate_peishan'&&m.text===%s)" % json.dumps(THX), max_s=120, label=sid)
                M2 = await msgs(pg, 'p:classmate_peishan'); res['after'] = M2[-3:]
                run.check('PS_NOTES_DATING：12/18 回「收到。」→ 她回「%s」（交往中照例外，BB 測試⑤）' % THX, bool(g) and ok3, json.dumps(M2[-3:], ensure_ascii=False))
            else:
                M2 = await msgs(pg, 'p:classmate_peishan'); res['after'] = M2[-3:]
                run.check('PS_NOTES_LATE：沒交往、12/18 才看＝回不了（回覆期限到 12/17 23:59）、她也沒有回「%s」（BB 測試⑤）' % THX, not pend and not [x for x in btn if not x['dis']] and not any(m['text'] == THX for m in M2), json.dumps({'pending': pend, 'btn': btn, 'msgs': M2[-2:]}, ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['DORM312', 'DORM_EARLY', 'EXPO_LAW', 'YU_EXPO', 'PS_DATING', 'PS_GROUP_DATING', 'PS_NOTES_IN', 'PS_NOTES_LATE', 'PS_NOTES_DATING',
         'PS_SPLIT', 'PS_GROUP', 'EXPO_BALL', 'NEED_W13', 'NEED_W14', 'WHERE_WED', 'WHERE_THU']
FN = {'DORM312': s_dorm, 'DORM_EARLY': s_dorm, 'EXPO_LAW': s_expo, 'EXPO_BALL': s_expo, 'YU_EXPO': s_need, 'NEED_W13': s_need, 'NEED_W14': s_need,
      'WHERE_WED': s_where, 'WHERE_THU': s_where, 'PS_SPLIT': s_ps_split, 'PS_DATING': s_ps_split, 'PS_GROUP': s_ps_group, 'PS_GROUP_DATING': s_ps_group,
      'PS_NOTES_IN': s_ps_notes, 'PS_NOTES_LATE': s_ps_notes, 'PS_NOTES_DATING': s_ps_notes}


async def main():
    run = L.Run('aa374', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa374.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
