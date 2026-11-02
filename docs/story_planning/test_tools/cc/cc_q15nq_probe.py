"""CC（帳號 A）11-02：NOT-QUESTION-DEL-1102（AA_573；使用者 11-02「不是問句這種句型給我全部刪掉」）的瀏覽器探針。
LAWWW 開發分支 d4398a91f 拿掉子晴的「這不是問句。」「這次是直述句。」句型；這支看玩家實際看到的。從 ../aa296_probe.py 複製來改（原檔不動；以安、可昕、沛珊、芷若那幾段拿掉）。
不是 iPhone：Playwright 手機橫向模擬 844×390（?turbo、SwiftShader 1～4 fps）；選項畫面另外切成直向 390×844 再拍一張（截完轉回橫向）。

情境（SCEN 不給＝全部照下面的順序；一個情境開一個瀏覽器）：
  Q15_WALK     ① 【前置】存檔改到 2028-06-09（五）21:30 宿舍、臺灣路線、子晴 CLOSE；【捷徑】直接呼叫 void R2Y3B.q15Walk(GAME,'heroine_04','Y3S2')（大三下期末「回家的路上」）
                 → 選項＝三個說出來的＋「（先不說）」，第三個是「「我喜歡妳。」」→ 點它 →「欸不是……你認真的？」→ 她回「……嗯。」→ ZQ_Q15.k＝'not_question'
  ZQ_NOREPLY   ② ③ 【前置】6/10（六）11:30 宿舍；ZQSET(['not_question',null])＝Q15 選了「「我喜歡妳。」」→ 手機「跳過時間：等到中午」→ 12:00「回答.exe」最後字卡「我也是。」
                 → 場面裡選「（還沒想好怎麼回）」→ 6/10 傍晚上床睡到明天 → 6/11「等到晚上」→ 21:00 她打來（接起來）＝台詞最後沒有「這次是直述句。」
  ZQ_CALL_FP   ③ 對照：【前置】6/11（日）19:30、Q15 說的是「第一個玩的」、回答.exe 看過沒回 → 等到 21:00 接她的電話（舊版這一支有「這次是直述句。」＝修改前 FAIL）
  ZQ_SLEEP     ③ 【前置】6/11 19:30、not_question 那一支、回答.exe 看過沒回 → 上床睡到明天＝沒接 → 她那一則私訊「好，我收到你的不回答了。我們還是最好的朋友。」
                 （not_question 這一支修改前也是這一句＝前後都 PASS，留著當回歸）
  ZQ_SLEEP_FP  ③ 對照：同上但 Q15 說的是「第一個玩的」（舊版私訊多「這次是直述句。」＝修改前 FAIL）
  GUITAR       ④ 【前置】最小存檔（一定用最小存檔：使用者存檔可能已經收過舊字的群組訊息）、法律系大一下第 13 週週三（Y1S2 13 3）21:40 宿舍、
                 guitarFirstDay＝2025-10-01（吉他社第一天的 stamp）→ 遊戲自己的手機規則把兩則群組訊息排進來 → 打開手機「訊息」→「吉他社」→ 讀 DOM、截圖（橫向＋直向）
                 「新人自己報名字，不要讓我問。」（guitar_grp1，guitarFirstDay 21:30）、「期末成發你要來。」（zq_show_inv，Y1S2 第 13 週週三 21:30）
每一段的檢查都寫成「新字出現、舊字（這不是問句／這次是直述句／我喜歡妳。這不是問句。）不出現」：在 d4398a91f^ 會 FAIL、d4398a91f 之後 PASS（D34）；例外寫在上面（ZQ_SLEEP）。
【前置】讀存檔改日期、時間、地點、路線旗標、關係（run.setup 印出來）；【捷徑】只有 Q15_WALK 直接叫 q15Walk、和 ZQSET 直接寫 ZQ_Q15（模擬 6/9 已經選過）。之後照玩家：手機「跳過時間」、床、跳出來的「接起來」、對話點下去、手機「訊息」。

用法：
  LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_q15nq_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
  環境變數（同原探針）：LW_TESTS（必填，playlib 所在）、SCEN=Q15_WALK,ZQ_NOREPLY,...（不給＝全部）、SAVE（第三個參數的替代）、SHA（只印在輸出、記錄測的是哪一版）
  存檔：給了就 Q15_WALK／ZQ_* 用那份改日期（同原探針，建議給）；沒給就用最小存檔（GAME.defaults＋過了開場的旗標）。GUITAR 一律最小存檔。
  輸出：<輸出資料夾>/NN_*.png、cc_q15nq.json；PASS／FAIL 一行一項，最後 ALL PASS 或 FAILED: …
預估時間（SwiftShader）：Q15_WALK 4～6 分、ZQ_NOREPLY 15～25 分（含睡覺、等到 21:00）、ZQ_CALL_FP 8～15 分、ZQ_SLEEP／ZQ_SLEEP_FP 各 6～10 分、GUITAR 3～5 分。"""
import os, sys, json, asyncio, time, re, copy
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('SAVE')
SHA = os.environ.get('SHA', '')
MINF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
        'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
        'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 最小存檔：法律系、過了開場（同 cc_dl04b_probe.py 的 BASEF）
def min_save():
    return {'v': 2, 'stage': 'law', 'name': '祐廷', 'energy': 100, 'money': 30000, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(MINF)}
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




# ---------------------------------------------------------------- 共用：舊字、直向／橫向截圖
FORBID = ['這不是問句', '這次是直述句', '我喜歡妳。這不是問句。']   # 舊字（d4398a91f 拿掉的）：任何一段出現就 FAIL
VP = {'land': {'width': 844, 'height': 390}, 'port': {'width': 390, 'height': 844}}
RELAYOUT_MS = int(os.environ.get('RELAYOUT_MS', '1800'))


def bad(xs):
    """xs（字串或字串的 list）裡出現的舊字"""
    if isinstance(xs, str): xs = [xs]
    return sorted({f for x in xs for f in FORBID if f in str(x)})


async def set_orient(pg, run, o):
    if pg.viewport_size != VP[o]:
        await pg.set_viewport_size(VP[o]); await pg.wait_for_timeout(RELAYOUT_MS)
    if await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r&&r.classList.contains('want')){ r.classList.remove('want'); return true; } return false; })()"):
        run.setup('[前置] 直向的「請把手機轉成橫向」（#rotate.want）還在 → 拿掉（同 playlib.load_state；玩家點一下就關）')
    await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(1))))")


async def shot2(pg, run, label):
    """同一個畫面：橫向一張、切直向 390×844 一張、再轉回橫向（之後的點擊座標照橫向）"""
    a = await run.shot(pg, label + '_land'); await set_orient(pg, run, 'port')
    b = await run.shot(pg, label + '_port'); await set_orient(pg, run, 'land')
    return [a, b]


async def wait_opts(pg, n=1, max_s=20):
    for _ in range(int(max_s * 2)):
        o = await opts(pg)
        if len(o) >= n: return o
        await pg.wait_for_timeout(500)
    return await opts(pg)


async def thread_dom(pg, cdp, run, th, label):
    """手機「訊息」→ 那一個對話（bbplay.phone_thread），讀 DOM 文字、拍橫向＋直向，關手機"""
    t = await P.phone_thread(pg, cdp, th); await pg.wait_for_timeout(600)
    shots = await shot2(pg, run, label) if t['ok'] else []
    t['text2'] = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")   # 直向切回來以後再讀一次（版面重排不影響字）
    await L.phone_away(pg, cdp); return t, shots


# ---------------------------------------------------------------- 子晴 Q15（大三下期末「回家的路上」→ 隔天「回答.exe」→ 6/11 21:00 的電話）
ZQ_EXE = '（《找插座的貓》的新關卡。貓找到了插座，插座旁邊坐著另一隻貓。兩隻貓一起充電。）'
ZQ_OPTS = ['（回一張插座貓貼紙）', '（還沒想好怎麼回）']
ZQ_CALL = ['（手機震了。是她打來的。）', '……你回貼紙喔。', '插座貓的意思，你知道吧。', '知道。', '……好啦。', '那、那明天見。', '（她先掛了。）']
ZQ_NO = ['（晚上九點。她打來了。）', '……你沒回耶。', '好，我收到你的不回答了。', '我們還是最好的朋友。', '（她沒有等你說話，就掛了。）']   # d4398a91f：「這次是直述句。」拿掉（兩支都是）
ZQ_NODM = '好，我收到你的不回答了。我們還是最好的朋友。'   # d4398a91f：兩支同一句（noReplyNQ 刪了）
Q15_OPTS = ['「妳下一個遊戲，我也要當第一個玩的。」', '「我喜歡妳。喜歡很久了。」', '「我喜歡妳。」', '（先不說）']   # 第三個：舊版「「我喜歡妳。這不是問句。」」；（先不說）＝TERMEND_LINES.NOT_YET_OPT
Q15_SURE, Q15_R_NEW, Q15_R_OLD = '欸不是……你認真的？', '……嗯。', '……那是我的台詞。'
EXE_CARD = {'not_question': '我也是。', 'first_player': '第一個玩家：'}   # 舊版 not_question 的字卡是「這不是問句。」
ZQF = dict(TWF, **BASE0)
ZQSET = """(([k,seen])=>{ const G=GAME.G, F=G.flags; F.ZQ_Q15={day:STORY.dayOfKey('2028-06-09'),k}; if(seen) F.ZQ_Q15.seen=STORY.dayOfKey(seen); F.ZQ_CONFESS_LINE=k; F.ZQ_DAD_HEARD=true; F.ATTENDED_SHOW=true;
  delete F.ZQ_EXE_REPLY; F.dating_heroine_04=false; SOCIAL.rel('heroine_04').npcRom=40; return {Q:F.ZQ_Q15, stage:SOCIAL.stage('heroine_04')}; })"""
ZQCLR = """(()=>{ const G=GAME.G, F=G.flags; delete F.ZQ_Q15; delete F.ZQ_CONFESS_LINE; delete F.ZQ_EXE_REPLY; F.ZQ_DAD_HEARD=true; F.ATTENDED_SHOW=true; F.dating_heroine_04=false; SOCIAL.rel('heroine_04').npcRom=40;
  let heart=null; try{ const h=TERMEND.heart('heroine_04','Y3S2'); heart=!!h&&!!h.walk; }catch(e){ heart='ERR '+e.message; }
  return {stage:SOCIAL.stage('heroine_04'), special:(typeof R2Y3B!=='undefined'&&R2Y3B.special)?R2Y3B.special(G,'heroine_04'):null, heart, q15Walk:typeof R2Y3B!=='undefined'&&typeof R2Y3B.q15Walk}; })()"""
ZQQ = "(()=>{ const F=GAME.G.flags; return {Q:F.ZQ_Q15||null, line:F.ZQ_CONFESS_LINE||null, reply:!!F.ZQ_EXE_REPLY, dating:!!F.dating_heroine_04}; })()"
SAVE0 = None


def base_save():
    return SAVE0 if SAVE0 is not None else min_save()


@guard
async def s_q15_walk(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-09', 21.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-09（五）21:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQCLR); res['set'] = z
        run.setup('[前置] %s：拿掉 ZQ_Q15／ZQ_CONFESS_LINE／ZQ_EXE_REPLY、子晴 npcRom 40、沒交往 → %s' % (sid, J(z)))
        await settle(pg, cdp, run, sid)
        n0 = await log_len(pg)
        await pg.evaluate("void R2Y3B.q15Walk(GAME,'heroine_04','Y3S2')")
        run.setup("【捷徑】%s：直接呼叫 void R2Y3B.q15Walk(GAME,'heroine_04','Y3S2')（大三下期末和子晴「回家的路上」；正常是 6/9 宵夜後 TERMEND.walkHome 叫它）" % sid)
        ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［選項］'&&x.t.includes('（先不說）'))", max_s=300, label=sid)
        ops = await wait_opts(pg, 4); res['opts'] = ops; res['pre'] = ch
        await pg.wait_for_timeout(800); await shot2(pg, run, '%s_opts' % sid)
        run.check('%s：回家路上的選項＝三個說出來的＋「（先不說）」，第三個是「「我喜歡妳。」」（%s）' % (sid, ' / '.join(ops)), ok and ops == Q15_OPTS, J(ops))
        run.check('%s：選項沒有舊字（「我喜歡妳。這不是問句。」）' % sid, ok and bool(ops) and not bad(ops), J(bad(ops)))
        k = ops.index(Q15_OPTS[2]) if Q15_OPTS[2] in ops else 2   # 舊版沒有這一個＝點第三個（舊的「這不是問句」那一支），看她回什麼
        if ops: say('   %s 點第 %d 個「%s」' % (sid, k + 1, ops[k] if k < len(ops) else '?')); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200)
        n1 = await log_len(pg)
        await wait_for(pg, cdp, run, "(window.__LOG||[]).slice(%d).some(x=>x.t===%s||x.t===%s)" % (n1, json.dumps(Q15_R_NEW), json.dumps(Q15_R_OLD)), max_s=120, label=sid,
                       shot_at=Q15_R_NEW)
        await pg.wait_for_timeout(800); await run.shot(pg, '%s_reply' % sid)   # 她回的那一句（對話框）
        await drive(pg, cdp, run, max_s=120, label=sid)
        L1 = await log_since(pg, n0); T = texts(L1); after = texts(await log_since(pg, n1)); q = await pg.evaluate(ZQQ)
        res['said'] = T; res['after'] = after; res['Q'] = q
        run.check('%s：點了以後「%s」→ 她回「%s」（不是舊的「%s」）' % (sid, Q15_SURE, Q15_R_NEW, Q15_R_OLD),
                  seq_in(after, [Q15_SURE, Q15_R_NEW]) and Q15_R_OLD not in after, J(after, 600))
        run.check('%s：ZQ_Q15.k＝not_question（key 不改，舊存檔相容）' % sid, (q['Q'] or {}).get('k') == 'not_question' and q['line'] == 'not_question', J(q))
        run.check('%s：這一段（回家路上全部台詞、選項）沒有舊字' % sid, not bad(T + [x['t'] for x in L1]), J(bad(T + [x['t'] for x in L1])))
        await run.shot(pg, '%s_end' % sid)
    finally: await finish_page(run, sid, res, errs, b)


async def zq_exe(pg, cdp, run, sid, res, pick, k):
    """6/10 11:30 → 手機「跳過時間」到中午 → 12:00「回答.exe」演起來 → 最後字卡（not_question＝「我也是。」）→ 兩個選項拍直向／橫向 → 照 pick"""
    n0 = await log_len(pg)
    got = await skip(pg, cdp, '等到中午', sid); res['skip'] = got
    ok, ch = await wait_for(pg, cdp, run, "(window.__LOG||[]).some(x=>x.n==='［選項］'&&x.t.includes(%s))||(GAME.G.flags.ZQ_Q15||{}).res!=null" % json.dumps(ZQ_OPTS[1]), max_s=400, label=sid)
    ops = await wait_opts(pg, 2); await pg.wait_for_timeout(800); await shot2(pg, run, '%s_exe_opts' % sid)
    await drive(pg, cdp, run, picks=[pick], max_s=120, label=sid)
    L1 = await log_since(pg, n0); T = texts(L1); cs = cards(L1); res['exe'] = {'said': T, 'cards': cs, 'opts': chs(L1), 'caps': caps(L1), 'dom_opts': ops}
    oc = [c for c in chs(L1) if isinstance(c, list) and c == ZQ_OPTS]
    want = EXE_CARD[k]; hit = any(c.split('｜')[0] == want or (want.endswith('：') and c.startswith(want)) for c in cs)
    run.check('%s：6/10 12:00「回答.exe」演出來（%s），最後字卡「%s」疊完，場面裡兩個選項「%s」' % (sid, got, want, '」「'.join(ZQ_OPTS)), ZQ_EXE in T and hit and bool(oc), J(res['exe'], 700))
    run.check('%s：回答.exe 的字卡、台詞沒有舊字（字卡不是「這不是問句。」）' % sid, not bad(cs + T), J(bad(cs + T)))
    return T, L1


@guard
async def s_zq_noreply(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-10（六）11:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "(['not_question',null])"); res['set'] = z
        run.setup('[前置]【捷徑】%s：ZQSET(not_question)＝子晴 Q15 在 6/9 回家的路上選了「「我喜歡妳。」」（ZQ_Q15={day:6/9,k:not_question}；子晴 CLOSE、npcRom 40）→ %s' % (sid, J(z)))
        await settle(pg, cdp, run, sid)
        T, L1 = await zq_exe(pg, cdp, run, sid, res, ZQ_OPTS[1], 'not_question')
        q = await pg.evaluate(ZQQ); pend = await pg.evaluate(PEND + "('y3_zq_exe')"); d11 = await dayk(pg, '2028-06-11'); res['mid'] = [q, pend]
        run.check('%s：選「%s」＝沒有電話、還沒交往；手機的貼紙按鈕留到隔天 21:00（%s）' % (sid, ZQ_OPTS[1], (pend or {}).get('untilKey')),
                  ZQ_CALL[0] not in T and not q['dating'] and bool(pend) and abs(pend['until'] - (d11 * 24 + 21)) < 0.01, J(res['mid']))
        await skip(pg, cdp, '等到傍晚', sid); ops, got, ok = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed10'] = [ops, got]
        n1 = await log_len(pg)
        await skip(pg, cdp, '等到晚上', sid); st = await pg.evaluate(STATE); res['at20'] = st
        await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_zq_noreply_call')||GAME.G.hour>=20.5", max_s=90, label=sid)
        q20 = await outq(pg, '^y3_zq_'); res['q20'] = q20
        run.check('%s：6/11 跳到 20:00：已經排好 21:00「子晴打電話來」' % sid, any(x['id'] == 'y3_zq_noreply_call' and x['state'] == 'planned' and x['d'] == '2028-06-11' and abs(x['h'] - 21) < 0.01 for x in q20), J({'st': st, 'out': q20}))
        await call_check(pg, cdp, run, sid, res, n1)
    finally: await finish_page(run, sid, res, errs, b)


async def call_check(pg, cdp, run, sid, res, n1):
    """等 21:00 她打來 → 接起來 → 台詞照新稿、最後沒有「這次是直述句。」"""
    ok, ch = await wait_out(pg, cdp, run, 'y3_zq_noreply_call', 900, sid)
    await run.shot(pg, '%s_call' % sid)
    await drive(pg, cdp, run, max_s=120, label=sid)
    L2 = await log_since(pg, n1); T2 = texts(L2); pr = prompts(ch); res['call'] = {'said': T2, 'prompt': pr, 'caps': caps(L2)}
    run.check('%s：問「接起來：子晴打電話來」（只有這一個）' % sid, bool(pr) and len(pr[0]['opts']) == 1 and pr[0]['opts'][0].startswith('接起來：子晴打電話來'), J(pr))
    run.check('%s：21:00 她打來（字幕「電話」），台詞照稿、「我們還是最好的朋友。」後面直接「（她沒有等你說話，就掛了。）」' % sid,
              '電話' in caps(L2) and seq_in(T2, ZQ_NO), J(res['call'], 900))
    run.check('%s：電話裡沒有「這次是直述句。」等舊字' % sid, bool(T2) and not bad(T2), J(bad(T2)))
    q = await pg.evaluate(ZQQ); dm = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == 'y3_zq_noreply']; res['after'] = [q, dm]
    run.check('%s：接了＝這學期不交往（Q15 res none）、沒有那一則私訊' % sid, (q['Q'] or {}).get('res') == 'none' and not q['dating'] and not dm, J(res['after']))
    await run.shot(pg, '%s_end' % sid)


@guard
async def s_zq_call_fp(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-11', 19.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-11（日）19:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "(['first_player','2028-06-10'])"); res['set'] = z
        run.setup('[前置]【捷徑】%s：Q15 說的是「第一個玩的」、6/10 的「回答.exe」看過了、沒回（ZQ_Q15={day:6/9,k:first_player,seen:6/10}）→ %s' % (sid, J(z)))
        ok, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_zq_noreply_call'&&q.state==='planned')", max_s=90, label=sid)
        run.check('%s：19:30 已經排好 21:00「子晴打電話來」' % sid, ok, J(await outq(pg, '^y3_zq_')))
        n1 = await log_len(pg)
        await skip(pg, cdp, '等到晚上', sid)   # 沒有這顆鈕（已經是晚上）就照時間走
        await call_check(pg, cdp, run, sid, res, n1)
    finally: await finish_page(run, sid, res, errs, b)


async def zq_sleep(p, run, base, sid, out, k):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-11', 19.5, 'dorm', preflags=ZQF, rels={ZQ: 'CLOSE'}, label=sid + '（臺灣路線；2028-06-11（日）19:30 宿舍）')
    try:
        await pg.evaluate(HOOK2); z = await pg.evaluate(ZQSET + "([%s,'2028-06-10'])" % json.dumps(k)); res['set'] = z
        run.setup('[前置]【捷徑】%s：Q15 選的是 %s、6/10 的「回答.exe」看過了、沒回（ZQ_Q15={day:6/9,k:%s,seen:6/10}）→ %s' % (sid, k, k, J(z)))
        ok, _ = await wait_for(pg, cdp, run, "OUT.rec(GAME.G).some(q=>q.id==='y3_zq_noreply_call'&&q.state==='planned')", max_s=90, label=sid)
        run.check('%s：19:30 已經排好 21:00「子晴打電話來」' % sid, ok, J(await outq(pg, '^y3_zq_')))
        n0 = await log_len(pg)
        ops, got, okw = await sleep2(pg, cdp, run, ('睡到明天',), sid); res['bed'] = [ops, got, okw]
        st = await pg.evaluate(STATE); T = texts(await log_since(pg, n0)); q = await pg.evaluate(ZQQ); dm = [m for m in await msgs(pg, 'p:heroine_04') if m['tag'] == 'y3_zq_noreply']; q1 = await outq(pg, '^y3_zq_')
        res['after'] = [st, q, dm, q1, T[-8:]]
        run.check('%s：睡著＝沒接：醒來（%s）手機有她的那一則「%s」（6/11 21:00）' % (sid, st['key'], ZQ_NODM),
                  [m['text'] for m in dm] == [ZQ_NODM] and all(m['d'] == '2028-06-11' and abs(m['h'] - 21) < 0.05 for m in dm), J(dm))
        run.check('%s：沒有演電話；這學期不交往（res none）；那一通記 missed' % sid, ZQ_NO[0] not in T and (q['Q'] or {}).get('res') == 'none' and not q['dating'] and any(x['id'] == 'y3_zq_noreply_call' and x['state'] == 'missed' for x in q1), J(res['after']))
        t, shots = await thread_dom(pg, cdp, run, 'p:heroine_04', '%s_dm' % sid); res['dom'] = {'ok': t['ok'], 'text': t['text'][-600:], 'shots': shots}
        run.check('%s：手機「訊息」→ 子晴的對話（DOM）看得到「%s」、沒有舊字' % (sid, ZQ_NODM), t['ok'] and ZQ_NODM in t['text'] and not bad([t['text'], t['text2']]), J({'bad': bad(t['text']), 'tail': t['text'][-300:]}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zq_sleep(p, run, base, sid, out):
    await zq_sleep(p, run, base, sid, out, 'not_question')


@guard
async def s_zq_sleep_fp(p, run, base, sid, out):
    await zq_sleep(p, run, base, sid, out, 'first_player')


# ---------------------------------------------------------------- 吉他社群組（子晴）兩則
GUITAR = [('guitar_grp1', '新人自己報名字，不要讓我問。'), ('zq_show_inv', '期末成發你要來。')]


@guard
async def s_guitar(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        d = await P.day_of(pg, ['Y1S2', 13, 3]); g1 = await P.day_of(pg, '2025-10-01'); show = await P.day_of(pg, ['Y1S2', 14, 3])
        st = min_save(); F = st['flags']; F['guitarFirstDay'] = g1['d']
        st.update(day=d['d'], weekday=d['wd'], hour=21.67, zone='dorm', pos=None, weather='clear')
        st['visited'] = {z: True for z in ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'cvs', 'bookstore')}
        await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
        run.setup('[前置] %s：最小存檔（法律系、過了開場；不用使用者存檔＝沒有收過舊字的群組訊息）讀 %s（%s 第 %s 週週三）21:40 宿舍；guitarFirstDay＝%s（吉他社第一天）；成發 %s；quiet_events' % (
            sid, d['key'], d['term'], d['week'], g1['key'], show['key']))
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='zq_show_inv')&&(GAME.G.msgs||[]).some(m=>m.tag==='guitar_grp1')", max_s=180, label=sid)
        g = await msgs(pg, 'g:guitar'); res['msgs'] = g
        say('   %s 吉他社群組：%s' % (sid, J([[m['d'], m['h'], m['tag'], m['text']] for m in g], 800)))
        for tag, want in GUITAR:
            m = [x for x in g if x['tag'] == tag]
            run.check('%s：群組「吉他社」%s＝子晴「%s」（後面沒有「這不是問句。」）' % (sid, tag, want), len(m) == 1 and m[0]['text'] == want and m[0]['from'] == ZQ, J(m))
        run.check('%s：吉他社群組所有訊息沒有舊字' % sid, ok and bool(g) and not bad([m['text'] for m in g]), J(bad([m['text'] for m in g])))
        t, shots = await thread_dom(pg, cdp, run, 'g:guitar', '%s_thread' % sid); res['dom'] = {'ok': t['ok'], 'text': t['text'][-800:], 'list': t['list'][:300], 'shots': shots}
        run.check('%s：手機「訊息」→「吉他社」（DOM）兩則都看得到、沒有「這不是問句」' % sid,
                  t['ok'] and all(w in t['text'] for _, w in GUITAR) and not bad([t['text'], t['text2']]), J({'bad': bad(t['text']), 'text': t['text'][-400:]}))
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['Q15_WALK', 'ZQ_NOREPLY', 'ZQ_CALL_FP', 'ZQ_SLEEP', 'ZQ_SLEEP_FP', 'GUITAR']
FN = {'Q15_WALK': s_q15_walk, 'ZQ_NOREPLY': s_zq_noreply, 'ZQ_CALL_FP': s_zq_call_fp, 'ZQ_SLEEP': s_zq_sleep, 'ZQ_SLEEP_FP': s_zq_sleep_fp, 'GUITAR': s_guitar}


async def main():
    global SAVE0
    run = L.Run('cc_q15nq', OUT); out = {'sha': SHA, 'url': URL, 'save': SAVEF or '（最小存檔）'}
    if SAVEF: SAVE0 = json.load(open(SAVEF, encoding='utf-8'))
    else: say('   （沒給使用者存檔：Q15_WALK／ZQ_* 用最小存檔；原探針用使用者存檔，最小存檔在 2028-06 可能多出別的劇情）')
    say('== cc_q15nq SHA=%s URL=%s' % (SHA or '?', URL))
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base_save(), sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'cc_q15nq.json'), 'w'), ensure_ascii=False, indent=1)
    sys.exit(run.finish())
asyncio.run(main())
