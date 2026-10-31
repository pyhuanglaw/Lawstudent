"""BB-B 10-31：芯慈戀愛線（AA_548，XCROM.ON＝true）瀏覽器探針；遊戲工作樹 bcb788dec（LAWWW-B 的清單；254bcfb35 起寫，bcb788dec 照新行為改：心意邀約當天 12:00、過了半夜的日期、挽回接 DATE.settle、privtalk 清單）。
走真實流程（不用 ?turbo）；日期、地點、關係、門檻是【前置】（使用者存檔改日子，讀檔後設關係與旗標），每一個都用 run.setup 標出來。Playwright 手機橫向模擬，不是 iPhone。
前置的標準答案照 tests/xinci_romance_unit.js；每一支的前置先在 Node（tests/pg_harness.js＋同一份使用者存檔）驗過：那一天那一刻條件成立。
玩家動作（走到她旁邊、按「和吳芯慈說話」、點選項、手機回訊息、等時間到）照畫面做，不直接呼叫事件。
 一、回家的路上（大三下期末時段 2028-06-08～06-18；最後一科 6/8 上午考完；HEART.sameDay：排好 6/10，那天 12:00 心意邀約、回覆到 17:30 → 回「好。」
     →【前置】同一天跳到 17:25 → 18:00 巷口家常菜 → 羅斯福路・往公館站；開場旁白、底圖還是簡餐店那一套＝已知，只 run.note）
  TE_ME_YES     先從 6/8 20:26 等到 20:36：不再傳（排好的那一天＝6/10）；【前置】跳到 6/10 11:52；戀愛 76：玩家先說「我喜歡妳。」→ 答應（yes 四句）；
                她不問「你現在有在跟誰交往嗎。」、祐廷沒有「沒有。」
  TE_ME_NOTYET  6/10 11:52 起；戀愛 72（< 75）：玩家先說 → notYet 兩句、XC_NOT_YET、這學期記 think、不交往
  TE_SHE_THINK  6/10 11:52 起；（先不說）→ she 三句 → 直接「好／讓我想想」選「讓我想想」；【前置】跳到大四上期末（最後一科 12/22）12/25 11:52 → 12:00 第二次邀約（invite2）
                → 當天 18:00 → she2「上次那件事，我的答案沒變。」「……你的呢。」→「好。」交往
  TE_TELL       6/10 11:52 起；交往中（子晴）、她不知道：選項多「（先告訴她，你在跟誰交往）」→「……我要知道是誰。」「（你說了。）」「好。知道了，我才排得出來。」→ 再選一次（沒有那一個）→ 答應
  TE_KNOWN      之前就親口跟她說過子晴：心意邀約照發、選項沒有「先告訴她」、答應時多「你跟她的事，我知道。……我排得出來。」
  TE_FOUNDOUT   她從別的地方知道子晴、你沒說過：6/10 12:00（等到 12:06）沒有心意邀約；【前置】跳到時段最後一天 6/18 20:00 也沒有 NOPE
 二、交往以後（大四上）
  AFTER_TELL    交往中、又在跟子晴交往（她不知道）2028-10-17（二）15:36 總圖三樓（前置：companyOf 空的、記 note）：選單「（自己跟她講子晴的事）」→ 兩句；再和她說一次話，選單沒有那一個
  AN_KNOWS      交往後第 2 天 20:55 宿舍 → 21:00 以後以安私訊兩則
  AN_KNOWS_NO   以安自己也在跟你交往：21:00 以後沒有那兩則
  FOUND         她從別的地方知道子晴（你沒說過）2028-10-18 15:36 總圖三樓：走到她旁邊 →「我沒有問你，是因為我以為你會說。」「……我們到這裡就好。」→ 分手
 三、挽回（8-2）
  REPAIR_OPEN   10/18 她自己發現而分手、10/29 和子晴結束、11/28 單身滿 30 天 15:36 總圖三樓：選單「（跟她說，你已經結束了那一段）」→ 兩句
  REPAIR_YES    挽回中、60 天內已經正式約會 2 次＋半夜訊息 30 分鐘內回 2 次；12/2（六）她約的北美館：提醒時「現在出發」→ 兩個互動點 → 回去，
                結算以後（bcb788dec 改接 DATE.settle）「我排好了。」「……這次，你什麼都先告訴我。」→ 回到交往
  REPAIR_NO     挽回第 60 天（2029-01-27）21:00：私訊「我想好了。我們當朋友就好。」
 四、她爸爸 8-1、冷落 8-3
  DAD2          2029-04-27（五）17:25 法律系館A門口、交往中：四句 → 三個選項 →「她去哪，我都會在台北。」→「……走吧。他等一下會問你喜歡吃什麼。我會說。」；沒有「誰最強」
  DAD2_NO       同一天 17:53、沒交往：站在門口等到 18:02，不演
  COLD          交往中 30 天沒約會，熬夜到 00:35（遊戲的寫法：前一天 24:35）→ 00:40 一則（不用回）、不分手、訊息時間＝現在；【前置】隔一晚同一時間不再傳
 五、新的時刻（AA_548 第 2、3、5 節）
  G2_DAD        3-1 大二上第 3 週週二 2026-09-22 17:56 巷口家常菜 → 18:00「我昨天又在幫我媽對帳。……」→「我想聽。」兩句、TALKED_FAMILY
  BLANK         3-5 慈 6（2028-05-04（四）19:00 麵店）結尾「週六晚上」→「我可以一起嗎？」→「……可以。不要遲到。」、XC_BLANK
  BLANK_AGAIN   3-5 後補：大四上第 6 週週六 2028-10-14 14:00 私訊「今天晚上七點，西門町。……我還是一個人。」→「我也去。」→ XC_BLANK、那天排 D04 約會
  G6_MAKEUP     G6 補一次：大三下第 3 週週一 2028-03-06 18:02 從總圖大廳二樓的樓梯間走進三樓 → 對答案（看到就算）、XC5_RECONCILE
  NIGHT_A       半夜訊息 A3、A4、A5、A7、A8（大二下，慈 3 以後、慈 5 以前）：手機泡泡、三個選項、她回的一句、30 分鐘內回 XC_NIGHT +1
  NIGHT_B       半夜訊息 B1、B3、B8（大三上，慈 5 以後）：同上
  NIGHT_REAL    同 A3 那一則，但用遊戲熬夜的寫法讀檔（週六 25:26＝週日 01:26）：那一晚就收到、訊息時間對、手機回了 30 分鐘內照樣算
                （NIGHT_A／B 讀檔寫成「那一天 01:26」，和單元測試同一種；bcb788dec 以後兩種寫法 Node 都收得到）
 每一場都查：說的話、芯慈／以安的手機訊息裡沒有「第二名」「第一名」「誰最強」「我問過你」
用法：LW_TESTS=<工作樹>/tests SCEN=TE_ME_YES,... SHA=bcb788dec python3 xcrom_probe.py <URL>/index.html <輸出資料夾> <使用者存檔>"""
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
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, day:m.day, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, until:m.ask&&m.ask.until!=null?m.ask.until:null, ans:m.ans==null?null:m.ans})))"""
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


BODY = "((document.getElementById('phoneBody')||{}).innerText||'')"


async def answer2(pg, cdp, run, th, ask_id, want, label=''):
    """同 answer，多記：打開對話串時畫面上的字（泡泡）、這一則的回覆鍵、回完以後畫面上的字。want＝None 只看不回"""
    await phone_tab(pg, cdp, 'msg')
    hit = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    await pg.wait_for_timeout(700); before = await pg.evaluate(BODY); await run.shot(pg, '%s_dm' % label)
    btns = await pg.evaluate("(id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(b=>(b.dataset.ask||'').split('|')[0]===id).map(b=>(b.textContent||'').trim()))(%s)" % json.dumps(ask_id))
    o = await pg.evaluate("(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; })(%s)" % json.dumps(ask_id))
    r = {'thread': bool(hit), 'before': before[-1500:], 'btns': btns, 'opts': o, 'got': None, 'after': ''}
    if want is None or not o: await L.phone_away(pg, cdp); return r
    k = next((i for i, t in enumerate(o) if t.startswith(want)), 0)
    r['got'] = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (ask_id, k)))
    await pg.wait_for_timeout(1500); r['after'] = (await pg.evaluate(BODY))[-1500:]; await run.shot(pg, '%s_dm_answered' % label)
    say('   %s 手機回 %s：「%s」' % (label, ask_id, r['got'])); await L.phone_away(pg, cdp); return r


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
            if pos:   # n25 ZRL3：她跟一群人在一起時，互動鈕會抓到旁邊的人——繞著她換方向靠近（0.7 m，四個方向輪流）
                ang = j * math.pi / 2; tx, tz = pos[0] + 0.7 * math.cos(ang), pos[1] + 0.7 * math.sin(ang)
                await L.go_to(pg, cdp, run, tx, tz, 0.35, name, max_s=30, lv=pos[2], stop=STOP)
            await pg.wait_for_timeout(500)
        if not hit(lab):   # n25_xinci_f：芷若在吧檯後面、老闆比較近——在她周圍 1.2～1.6 m 找站得到、而且離她比離別人近的點（吧檯客人那一側）
            best = await pg.evaluate("""(ids=>{ const E=GAME.E; const me=(E.npcs||[]).find(x=>x&&ids.some(id=>x.charId===id||x.id===id)&&x.obj); if(!me) return null; const q=me.obj.position, lv=me.lv|0;
                const others=(E.npcs||[]).filter(x=>x&&x!==me&&x.obj&&x.obj.visible!==false&&!x.hidden); const out=[];
                for(const r of [1.2,1.6]) for(let k=0;k<8;k++){ const a=k*Math.PI/4, x=q.x+r*Math.cos(a), z=q.z+r*Math.sin(a); if(E.canStand&&!E.canStand(x,z,0.3,lv)) continue;
                  const dMe=Math.hypot(x-q.x,z-q.z), dO=Math.min(9,...others.map(o=>Math.hypot(o.obj.position.x-x,o.obj.position.z-z))); if(dO>dMe+0.2) out.push([+x.toFixed(2),+z.toFixed(2),lv,+(dO-dMe).toFixed(2)]); }
                out.sort((u,v)=>v[3]-u[3]); return out.slice(0,3); })""", ids)
            say('   %s 換到她身邊（離她比離別人近）的點：%s' % (label, J(best)))
            for bp in (best or []):
                await L.go_to(pg, cdp, run, bp[0], bp[1], 0.3, name, max_s=40, lv=bp[2], stop=STOP)
                st = await L.state(pg)
                if st['dlg'] or st['choices'] or st['busy']:
                    ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label); return ch, '（走近就開始）'
                lab = await pg.evaluate(LAB)
                if hit(lab): break
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


def hm(h):
    return '%02d:%02d' % (int(h), int(round((h - int(h)) * 60)) % 60)


async def launch(p, run, base, key, h, zone, preflags=None, rels=None, dating=(), flags=None, quiet=False, label='', groups=(), mems=(), pos=None):
    """路線旗標先寫進存檔再讀（日本、美國路線讀檔的地方才對）；讀檔後在頁面裡設關係、交往、其他旗標。quiet 一律 False（事件要開著）；pos：讀檔的位置（不給＝那一區的出生點）"""
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
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': pos, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, list(dating), flags or {}, [list(g) for g in groups], [list(m) for m in mems]]))
    run.setup('[前置] %s：使用者存檔改到 %s %s %s%s（%s；讀檔前拿掉其他人的交往）；路線旗標 %s；關係 %s；交往 %s；旗標 %s → %s' % (
        label, key, hm(h), zone, (' 位置 %s' % json.dumps(pos)) if pos else '', 'quiet_events' if quiet else '事件系統開著', json.dumps(preflags or {}, ensure_ascii=False), json.dumps(rels or {}, ensure_ascii=False),
        list(dating) or '—', json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r


async def jump(pg, run, key, h, zone, label, pos=None):
    """【前置】同一份進度直接跳到另一個時刻（GAME.snapshot → 改日子 → 遊戲自己的讀檔；事件系統開著），中間的時間沒有玩"""
    snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, key)
    snap.update({'day': d, 'hour': h, 'zone': zone, 'pos': pos, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    run.setup('【前置】%s：同一份進度直接跳到 %s %s %s（中間的時間沒有玩）' % (label, key, hm(h), zone))


async def pre(pg, run, label, js):
    """【前置】讀檔以後在頁面裡設狀態（js 要 return 一個摘要）；變數：G、F、XC、AN、ZQ、D（日期→第幾天）、at（暫時改日子做一件事：ROM 的開始／結束記在那一天）"""
    r = await pg.evaluate("(()=>{ const G=GAME.G, F=G.flags, XC='classmate_xinci', AN='heroine_01', ZQ='heroine_04', D=k=>STORY.dayOfKey(k); "
                          "const at=(k,f)=>{ const d0=G.day; G.day=D(k); try{ f(); } finally { G.day=d0; } }; %s })()" % js)
    run.setup('【前置】%s：%s' % (label, J(r, 700))); return r


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


async def near_wait(pg, cdp, run, sid, ev, x, z, lv, picks, max_s=600, r=1.2):
    n0 = await log_len(pg)   # n25：先記再走（走近時事件可能就開始）；go_to 有對話就停，交給 wait_for 照 picks 選
    await L.go_to(pg, cdp, run, x, z, r, sid, max_s=240, lv=lv, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])
    ok, ch = await wait_for(pg, cdp, run, DONE + "('%s')" % ev, max_s=max_s, picks=picks, label=sid)
    lg = await log_since(pg, n0); return ok, ch, texts(lg), caps(lg), choice_sets(lg)


# ---------------------------------------------------------------- 芯慈戀愛線（AA_548）
XC = 'classmate_xinci'; AN = 'heroine_01'; ZQ = 'heroine_04'
XCN = ['芯慈', '吳芯慈']
BANNED = ['第二名', '第一名', '誰最強', '我問過你']
PHONE_XA = "(GAME.G.msgs||[]).filter(m=>m.th==='p:classmate_xinci'||m.th==='p:heroine_01').map(m=>m.text)"


async def banned_check(pg, run, sid, T, log=None):
    ph = await pg.evaluate(PHONE_XA)
    bad = [x for x in list(T) + ph if any(b in x for b in BANNED)]
    who = [(y['n'], y['t']) for y in (log or []) if any(b in y['t'] for b in BANNED)]
    run.check('%s：說的話、芯慈／以安的手機訊息裡沒有「第二名」「第一名」「誰最強」「我問過你」' % sid, not bad, J({'bad': bad, 'who': who}, 600))


async def report(pg, run, sid, res, T, CS, C=None, log=None):
    res.update({'said': T, 'choices': CS, 'caps': C}); await run.shot(pg, '%s_after' % sid)
    say('   %s 說的：%s；選項 %s；字幕 %s' % (sid, J(T[-16:], 1200), J(CS[-3:]), J((C or [])[-4:])))
    await banned_check(pg, run, sid, T, log)


# ---- 稿（字以遊戲台詞表為準：src/xcrom3d.js、src/data/termend_lines.js、src/data/confess_lines.js、src/data/r2y3b_events.js；單元測試第 0、10、12、13 節逐字對過企劃稿）----
INVITE = '考完了。今天晚上有空嗎。……我沒有提前一天。'
INVITE2 = '考完了。今天晚上有空嗎。……上次那件事，我還放著。'
TABLE = '我今天點了一道沒吃過的。……你不要笑。'
WALK = ['這學期，我有一天沒有排讀書。', '……是跟你吃飯那天。']
CONF3 = ['「我喜歡妳。」', '「我們可以不只是朋友嗎？」', '「我喜歡妳。妳不用現在回答。」']
NOT_YET_OPT = '（先不說）'
ANSWER = ['「好。」', '「讓我想想。」']
YES = ['……你說完了嗎。', '（她把杯子轉了半圈，又轉回來。）', '我本來以為，這件事我會先想好。', '……我沒有想好。可是好。']
NOTYET = ['我還沒想好。想好了，我會先跟你說。', '這不是拒絕。你不要聽成拒絕。']
SHE = ['……你不說，那我說。', '我排了一個晚上要講這個。講稿寫了三版，都很爛。', '我喜歡你。']
SHE2 = ['上次那件事，我的答案沒變。', '……你的呢。']
THINK = '好。我把它排進下學期。……不要讓我排到畢業。'
ASK_Q = '你現在有在跟誰交往嗎。'
TELL_OPT = '（先告訴她，你在跟誰交往）'
TELL_LINES = ['……我要知道是誰。', '（你說了。）', '好。知道了，我才排得出來。']
KNOWN_LINE = '你跟她的事，我知道。……我排得出來。'
TELL_AFTER_OPT = '（自己跟她講子晴的事）'
TELL_AFTER = ['我要知道是誰。……知道了，我才排得出來。', '你跟她約的那幾天，先告訴我。我排別的。']
FOUND_L = ['我沒有問你，是因為我以為你會說。', '……我們到這裡就好。']
AN_KNOWS_L = ['芯慈跟我說了。她自己來跟我說的。', '我很高興。是真的。']
REPAIR_OPT = '（跟她說，你已經結束了那一段）'
REPAIR_OPEN_L = ['……我知道。以安說了。', '我需要時間。我會自己決定要多久。']
REPAIR_YES_L = ['我排好了。', '……這次，你什麼都先告訴我。']
REPAIR_NO_L = '我想好了。我們當朋友就好。'
DAD2_OPEN = ['這是上次那位同學？', '嗯。……現在不只是同學了。', '（笑）我知道。妳媽說了。', '她說畢業要去國際所。我們很放心。……你呢？']
DAD2_OPTS = ['「還在準備國考。」', '「還在想。」', '「她去哪，我都會在台北。」']
DAD2_C = ['（芯慈看了你一眼，耳朵有點紅。）', '……好。', '……走吧。他等一下會問你喜歡吃什麼。我會說。']
COLD_L = '你最近很忙。我不是在怪你，我只是先說出來，免得我自己亂想。'
G2_FIRST = '我昨天又在幫我媽對帳。……算了，你不會想聽。'
G2_REST = ['我爸媽都是律師。事務所的帳，我從國中就在對。', '……所以我雙主修財金。是我自己要的。']
C6_OPTS = ['「恭喜！」', '「為什麼是金融那一組？」', '「妳爸媽怎麼說？」']
BLANK_L = ['實習是週一到週五。', '週六晚上，我還是會去西門町，看七點那一場。']
BLANK_OPTS = ['「我可以一起嗎？」', '「妳一個人看嗎？」', '「好好實習。」']
BLANK_AGAIN_L = '今天晚上七點，西門町。……我還是一個人。'
G6_L = ['（以安和芯慈在對民訴的考古題。以安在日本以前的最後幾個禮拜。）', '第三題，妳的寫法比我的清楚。我抄。', '第六題換我抄妳的表。', '（對你）你要加入嗎？你負責第八題。']
# 半夜訊息八則（AA_548 第 5 節）：她傳的泡泡、三個選項（祐廷的字、她回的一句）；slot＝那一週的時段（XCROM.nightSlot；Node 算過）；pick＝這一次回第幾個（三個位置都輪到）
NIGHT = {
    'A3': {'idx': 2, 'slot': ('2027-03-14', 1.5), 'pick': 0, 'm': ['今天財管的小考，最後一題我算了三次才對起來。', '對起來的時候，我在考場笑出來。'],
           'o': [['監考沒看到吧？', '看到了。他也笑了。'], ['妳真的很喜歡數字。', '嗯。數字不會繞路。'], ['恭喜。', '謝謝。……還沒改。可是我知道對了。']]},
    'A4': {'idx': 3, 'slot': ('2027-03-17', 1.25), 'pick': 1, 'm': ['我媽問我寒假要不要去事務所幫忙對帳。', '我說好。……我好像是全家唯一喜歡對帳的人。'],
           'o': [['妳爸媽呢？', '他們喜歡吵架。法庭上的那種。'], ['那很好啊。', '嗯。我也覺得。'], ['對帳有什麼好玩？', '對起來的那一下。你沒試過。']]},
    'A5': {'idx': 4, 'slot': ('2027-03-28', 1.0), 'pick': 2, 'm': ['最後一班公車，我跑到站牌，車剛好開走。', '……結果下一班才是最後一班。'],
           'o': [['所以有趕上？', '有。我白跑了。'], ['妳也會用跑的？', '會。很少。'], ['到家說一聲。', '到了。……你怎麼還沒睡。']]},
    'A7': {'idx': 6, 'slot': ('2027-04-11', 0.5), 'pick': 0, 'm': ['我在看第八集。', '男主角說：「我不是不想選，是每一個都想要。」', '……我把它暫停了。我也是這樣。'],
           'o': [['妳想要什麼？', '財金跟法律。兩個都要。'], ['繼續看啊。', '等一下。我想一下再看。'], ['這句很好。', '這句很爛。可是很準。']]},
    'A8': {'idx': 7, 'slot': ('2027-04-25', 1.25), 'pick': 1, 'm': ['今天在總圖，以安坐我斜對面。', '她讀到一半，把她的條文筆記推過來。我把我的表推過去。……兩個小時，都沒說話，一直在換。'],
           'o': [['妳們很有默契。', '嗯。我們很會讀書。'], ['她的筆記好嗎？', '好。很細。我抄了三頁。'], ['下次叫我。', '好。你帶你的經原筆記。']]},
    'B1': {'idx': 0, 'slot': ('2027-10-13', 1.25), 'pick': 2, 'm': ['你還沒睡吧。', '以安傳了一張照片給我。開學第一天，我們坐第一排，兩個人都在抄課表。'],
           'o': [['好懷念？', '嗯。那天她的螢光筆借我。'], ['誰拍的？', '阿哲。他坐我們後面。'], ['傳給我看。', '不要。']]},
    'B3': {'idx': 2, 'slot': ('2027-10-24', 1.0), 'pick': 0, 'm': ['財金那邊，我這學期多修了一門投資學。', '我媽說我瘋了。可是她說的時候在笑。'],
           'o': [['妳撐得住嗎？', '撐得住。我排好了。'], ['為什麼要多修？', '因為我想。'], ['妳媽說得對。', '……你跟她一國。']]},
    'B8': {'idx': 7, 'slot': ('2027-10-27', 0.75), 'pick': 2, 'm': ['今天以安問我，大四要不要一起讀書。', '我說好。我們連螢光筆的顏色都講好了。'],
           'o': [['那很好。', '嗯。很好。'], ['什麼顏色？', '她黃色，我藍色。……不要問為什麼。'], ['我也可以一起嗎？', '你要先問以安。……我說好。']]},
}

# 全部門檻都過（tests/xinci_romance_unit.js 的 full()，照搬到瀏覽器）：G1 慈 1＋聯絡方式、G2 TALKED_FAMILY、G3 H7c、G4 XINCI_SECOND（沒走補演）、G5 XC_NIGHT 6、G6 XC5_RECONCILE、
# G7 XC_SAMEDAY、G8 慈 6＋XC_BLANK、G9 第 6 階＋戀愛 ≥ 70＋信任 ≥ 60＋正式約會 6 次＋去過心願地點。o.term：讀檔時這學期的學期末 plan 已經先算了（那時門檻還沒設）＝還沒發任何邀約就清掉重算
GATES = """((o)=>{ const G=GAME.G, F=G.flags, XC='classmate_xinci', D=k=>STORY.dayOfKey(k);
  G.events=G.events||{}; G.events.done=G.events.done||{}; const E=G.events.done;
  if(!E.ev_xinci_notes) E.ev_xinci_notes=D('2025-10-20'); if(!E.ev_xinci_second) E.ev_xinci_second=D('2026-11-24'); if(!E.ev_xinci_first_place) E.ev_xinci_first_place=D('2028-05-04');
  G.contacts=G.contacts||{}; if(G.contacts[XC]==null) G.contacts[XC]=D('2025-10-20');
  SOCIAL.remember(XC,'FIRST_MET',''); SOCIAL.remember(XC,'TALKED_FAMILY',''); SOCIAL.remember(XC,'XINCI_SECOND','');
  G.l118=G.l118||{}; G.l118.once=G.l118.once||{}; if(G.l118.once.H7c==null) G.l118.once.H7c=D('2026-10-02');
  Object.assign(F,{XC_NIGHT:6,XC5_RECONCILE:true,XC_SAMEDAY:true,XC_BLANK:true}); delete F.XC_FIX;
  const r=SOCIAL.rel(XC); r.fam=70; r.trust=62; r.comf=50; r.npcRom=o.npcRom; r.rom=40;
  const L=DATE.log(G,XC); L.count=Math.max(L.count|0,6); L.wish=true; L.wishKnown=true;
  let cleared=null; if(o.term){ const R=G.termend&&G.termend[o.term]; if(R&&R.plan){ cleared={heart:R.plan.heart,fallback:R.plan.fallback,asks:Object.keys(R.asks||{}),picked:R.picked||null}; if(!Object.keys(R.asks||{}).length&&!R.picked){ delete R.plan; cleared.deleted=true; } } }
  const w=o.term?TERMEND.windowOf(o.term):null;
  return {gates:XCROM.gates(G), all:XCROM.allGates(G), ON:XCROM.ON, stage:DATE.stageNum(XC), npcRom:r.npcRom, heartWhy:w?TERMEND.heartWhy(G,XC,w):null, cleared,
    others:XCROM.othersDating(G), hidden:XCROM.hidden(G), foundOut:XCROM.foundOut(G)}; })"""
TE_MSG = "(t=>(GAME.G.msgs||[]).find(m=>m.tag===t)||null)"
TE_RES = "(t=>{ const T=GAME.G.termend||{}, R=T[t]||{}; return {result:R.result||null, picked:R.picked||null, done:R.done||null, plan:R.plan?{heart:R.plan.heart,nope:R.plan.nope,friend:R.plan.friend,fallback:R.plan.fallback}:null, think:(T.think||{})['classmate_xinci']||null}; })"
OUTQ1 = "(id=>{ const q=(typeof OUT!=='undefined'&&OUT.get)?OUT.get(GAME.G,id):null; return q?{id:q.id,key:CALENDAR.dateOf(q.day).key,day:q.day,h:q.h,state:q.state,title:q.title||'',place:q.place||''}:null; })"
XCSTATE = """(()=>{ const G=GAME.G, F=G.flags, XC='classmate_xinci', ZQ='heroine_04'; const rr=(ROM.relRec(G)[XC]||{});
  return {dating:F['dating_'+XC]===true, rom:ROM.get(G,XC).status, XC_TOLD:F.XC_TOLD==null?null:F.XC_TOLD, XC_NOT_YET:F.XC_NOT_YET||null, XC_FOUND:F.XC_FOUND||null, XC_REPAIR:F.XC_REPAIR||null,
    knowsZQ:rr[ZQ]||null, openOk:(F.OPEN_OK||{})[XC]||null, confessed:(F.confessed||{})[XC]==null?null:(F.confessed||{})[XC], XC_NIGHT:F.XC_NIGHT|0, XC_BLANK:F.XC_BLANK||null,
    XC5_RECONCILE:F.XC5_RECONCILE||null, others:XCROM.othersDating(G), hidden:XCROM.hidden(G), foundOut:XCROM.foundOut(G)}; })()"""
COMPANY = "(()=>{ try{ return STORY.companyOf(GAME.G,'classmate_xinci',null,GAME); }catch(e){ return 'ERR '+e.message; } })()"


async def te_invite(pg, cdp, run, sid, res, term, want_text, din_key, label=''):
    """bcb788dec（HEART.sameDay）：那一天 12:00 才傳心意邀約、回覆到 17:30、飯就在那天 18:00。在畫面上照玩家等 12:00 → 打開手機、看泡泡 → 回「好。」→ 期末飯排好了沒"""
    tag = 'te_%s_%s' % (term, XC); dd = await dayk(pg, din_key)
    ok, ch = await wait_for(pg, cdp, run, "!!(%s)('%s')" % (TE_MSG, tag), max_s=600, picks=['「那天有約了。」'], label=label or sid)
    m = await pg.evaluate(TE_MSG + "('%s')" % tag)
    res['invite'] = m and {'text': m['text'], 'day': m['day'], 'key': din_key if m['day'] == dd else m['day'], 'h': m['h'], 'ask': [o['t'] for o in (m.get('ask') or {}).get('opts', [])], 'until': (m.get('ask') or {}).get('until')}
    run.check('%s：%s 12:00 收到心意邀約「%s」（回覆鍵「好。」／「那天有約了。」）' % (sid, din_key, want_text),
              bool(m) and m['text'] == want_text and bool(res['invite']['ask']) and res['invite']['ask'][:2] == ['好。', '那天有約了。'], J({'ok': ok, 'm': res['invite']}))
    if not m: return None
    run.check('%s：邀約是那一天 12:00 傳的、回覆期限同一天 17:30（不是時段第一天 20:30）' % sid,
              m['day'] == dd and 12 <= m['h'] < 12.3 and res['invite']['until'] is not None and abs(res['invite']['until'] - (dd * 24 + 17.5)) < 0.01, J(res['invite']))
    a = await answer2(pg, cdp, run, 'p:' + XC, tag, '好。', label='%s_%s' % (sid, term)); res['invite_ui'] = a
    run.check('%s：手機對話串看得到那一則、回「好。」' % sid, want_text in a['before'] and a['got'] == '好。', J({k: a[k] for k in ('btns', 'got')}))
    # 回「好。」只記 TE_PICK，期末飯是下一次 STORY.tick（手機收起來、遊戲在跑）才排（TERMEND.pickCheck）
    await wait_for(pg, cdp, run, "!!(%s)('te_%s')" % (OUTQ1, term), max_s=120, picks=['「那天有約了。」'], label=label or sid)
    q = await pg.evaluate(OUTQ1 + "('te_%s')" % term); res['dinner'] = q
    run.check('%s：回「好。」→ 期末飯就在同一天（%s）18:00 巷口家常菜' % (sid, din_key), bool(q) and q['key'] == din_key and q['h'] == 18 and q['place'] == '巷口家常菜', J(q))
    return q


async def te_dinner(pg, cdp, run, sid, res, term, din_key, picks, label=''):
    """【前置】同一天跳到 17:25（宿舍；12:0x 回完邀約到 17:25 的時間沒有玩）→ 照玩家等「出發：學期末的飯」→ 飯 → 回家的路上（picks）→ 回傳 (log, T, CS)"""
    await jump(pg, run, din_key, 17.42, 'dorm', '%s：期末飯那天（同一天）' % sid)
    n0 = await log_len(pg)
    ok, ch = await wait_for(pg, cdp, run, "!!(%s)('%s').result" % (TE_RES, term), max_s=900, picks=picks + ['「那天有約了。」'], go=('出發：學期末的飯',), label=label or sid)
    lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg)
    res['te'] = await pg.evaluate(TE_RES + "('%s')" % term); res['xc'] = await pg.evaluate(XCSTATE)
    # c3a8aded9 TERMEND.teBusy：兩頓期末飯不排同一晚（TE_TELL＝和子晴交往中，子晴的期末約也在這個時段）
    tes = await pg.evaluate("(()=>(GAME.G.outings||[]).filter(o=>o&&/^te_/.test(o.id||'')).map(o=>({id:o.id, day:CALENDAR.dateOf(o.day).key, h:o.h, state:o.state||null})))()")
    res['te_outings'] = tes; days = [t['day'] for t in tes]
    run.check('%s：期末飯（te_ 出遊）沒有兩頓排在同一晚' % sid, len(days) == len(set(days)), J(tes))
    run.check('%s：%s 期末飯演完、回家的路上有結果（%s）' % (sid, din_key, J(res['te'].get('result'))), ok, J(ch[-3:], 600))
    gos = [o for c in CS for o in c if o.startswith('出發：學期末的飯')]; res['go_opt'] = gos[:1]
    narr = [t for t in T if t.startswith('（')]; res['open_close'] = [narr[:1], narr[-3:]]
    # c3a8aded9（AA_537b 8-4）：PLACE.l118_home——開場、收尾旁白、字幕「巷口家常菜」；收尾在回家路上之前
    OPEN_L, CLOSE_L = '（傍晚的巷口家常菜。菜擺在玻璃櫃裡，用手指一指，老闆娘就幫你夾。）', '（老闆娘開始收玻璃櫃裡的菜。你們走出巷口，路燈剛亮。）'
    cp = [x['t'] for x in lg if x.get('n') == '［字幕］']; res['captions'] = cp[:6]
    seq = [x['t'] for x in lg]   # 含字幕、選項：比收尾和「羅斯福路・往公館站」（回家路上的字幕或旁白）誰先
    io, ic = (seq.index(OPEN_L) if OPEN_L in seq else -1), (seq.index(CLOSE_L) if CLOSE_L in seq else -1)
    iw = next((k for k, t in enumerate(seq) if '羅斯福路' in t or '公館站' in t), -1)
    run.check('%s：巷口家常菜開場「%s」、收尾「%s」，收尾在回家路上之前；字幕「巷口家常菜」' % (sid, OPEN_L, CLOSE_L),
              io >= 0 and ic > io and iw > ic and any('巷口家常菜' in c for c in cp) and not any('簡餐店' in t for t in T),
              J({'open': io, 'close': ic, 'walk': iw, 'caps': cp[:4], 'narr': narr[:3]}, 800))
    run.check('%s：出發的選項「出發：學期末的飯：（芯慈）（巷口家常菜）」' % sid, any('芯慈' in o and '巷口家常菜' in o for o in gos), J(CS[:2]))
    return lg, T, CS


def te_common(run, sid, lg, T, CS, table=True):
    if table: run.check('%s：飯桌一句「%s」' % (sid, TABLE), TABLE in T, J(T[:12], 600))
    run.check('%s：回家的路上「這學期，我有一天沒有排讀書。」「……是跟你吃飯那天。」' % sid, has_seq(T, WALK), J(T[-14:], 700))
    run.check('%s：她不問「你現在有在跟誰交往嗎。」、祐廷沒有說「沒有。」' % sid, ASK_Q not in T and not any(x['t'] == '沒有。' for x in lg), J([x for x in lg if x['t'] in (ASK_Q, '沒有。')]))


# ======================================================== 一、回家的路上
@guard
async def s_te_me(p, run, base, sid, out):
    res = out.setdefault(sid, {}); rom = 76 if sid == 'TE_ME_YES' else 72
    yes = sid == 'TE_ME_YES'   # YES 這一支從時段第一天 6/8 20:26 開始，看 20:30 不再傳（bcb788dec 以前的時間）；NOTYET 直接從 6/10 11:52 開始
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-08' if yes else '2028-06-10', 20.43 if yes else 11.87, 'campus', preflags=TWF, quiet=False,
                                       label=sid + ('（大三下期末時段第一天 2028-06-08（四）20:26 校園；臺灣路線）' if yes else '（大三下期末 2028-06-10（六）11:52 校園；臺灣路線）'))
    try:
        g = await pg.evaluate(GATES + "(%s)" % json.dumps({'npcRom': rom, 'term': 'Y3S2'})); res['gates'] = g
        run.setup('【前置】%s：門檻 G1～G9 全過（照 xinci_romance_unit.js full()），她的戀愛 %d；讀檔時先算的學期末 plan 清掉重算 → %s' % (sid, rom, J(g, 700)))
        run.check('%s：前置——門檻全過、心意邀約要發（heartWhy true）' % sid, g['all'] and g['heartWhy'] is True, J(g, 500))
        if not (g['all'] and g['heartWhy'] is True): return
        if yes:
            ok0, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=20.6", max_s=600, picks=['「那天有約了。」'], label=sid)
            m0 = await pg.evaluate(TE_MSG + "('te_Y3S2_%s')" % XC); hd = await pg.evaluate("(((GAME.G.termend||{}).Y3S2||{}).heartDay||{})['classmate_xinci']")
            res['first_night'] = {'reached': ok0, 'msg': m0 and m0['text'], 'heartDay': hd}
            run.check('%s：6/8 20:30 以後（等到 20:36）還沒有心意邀約（當天才約）；排好的那一天＝6/10' % sid, ok0 and not m0 and hd == await dayk(pg, '2028-06-10'), J(res['first_night']))
            await jump(pg, run, '2028-06-10', 11.87, 'campus', '%s：6/10（六）11:52（6/9 一整天沒有玩）' % sid)
        q = await te_invite(pg, cdp, run, sid, res, 'Y3S2', INVITE, '2028-06-10')
        if not q: return
        lg, T, CS = await te_dinner(pg, cdp, run, sid, res, 'Y3S2', q['key'], ['「我喜歡妳。」'])
        await report(pg, run, sid, res, T, CS, caps(lg), lg)
        te_common(run, sid, lg, T, CS)
        run.check('%s：回家的路上的選項＝三句＋「（先不說）」（沒有別的交往對象＝沒有「先告訴她」）' % sid, any(c == CONF3 + [NOT_YET_OPT] for c in CS), J(CS[-3:]))
        x = res['xc']; te = res['te']
        if sid == 'TE_ME_YES':
            run.check('%s：選「我喜歡妳。」、戀愛 76 ≥ 75 → yes 四句「……你說完了嗎。」…「……我沒有想好。可是好。」' % sid, has_seq(T, YES), J(T[-6:]))
            run.check('%s：交往（dating、ROM dating、confessed 記今天）、結果 yes' % sid, x['dating'] and x['rom'] == 'dating' and x['confessed'] is not None and te['result'] == 'yes', J({'xc': x, 'te': te}))
        else:
            run.check('%s：選「我喜歡妳。」、戀愛 72 < 75 → notYet「我還沒想好。想好了，我會先跟你說。」「這不是拒絕。你不要聽成拒絕。」' % sid, has_seq(T, NOTYET) and not has_seq(T, YES[-1:]), J(T[-5:]))
            run.check('%s：不交往、記 XC_NOT_YET、這學期記 think（下學期第二次）、結果 notYet' % sid, not x['dating'] and bool(x['XC_NOT_YET']) and te['think'] == 'Y3S2' and te['result'] == 'notYet', J({'xc': x, 'te': te}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_te_she(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.87, 'campus', preflags=TWF, quiet=False, label=sid + '（大三下期末 2028-06-10（六）11:52 校園；臺灣路線）')
    try:
        g = await pg.evaluate(GATES + "(%s)" % json.dumps({'npcRom': 76, 'term': 'Y3S2'})); res['gates'] = g
        run.setup('【前置】%s：門檻 G1～G9 全過、戀愛 76；學期末 plan 清掉重算 → %s' % (sid, J(g, 600)))
        run.check('%s：前置——門檻全過、心意邀約要發' % sid, g['all'] and g['heartWhy'] is True, J(g, 400))
        if not (g['all'] and g['heartWhy'] is True): return
        q = await te_invite(pg, cdp, run, sid, res, 'Y3S2', INVITE, '2028-06-10')
        if not q: return
        lg, T, CS = await te_dinner(pg, cdp, run, sid, res, 'Y3S2', q['key'], [NOT_YET_OPT, '「讓我想想。」'])
        res['y3s2'] = {'said': T, 'choices': CS, 'invite': res.get('invite'), 'dinner': res.get('dinner'), 'te': res.get('te')}
        te_common(run, sid, lg, T, CS)
        run.check('%s：選「（先不說）」→ she 三句「……你不說，那我說。」「我排了一個晚上要講這個。講稿寫了三版，都很爛。」「我喜歡你。」' % sid, has_seq(T, SHE), J(T[-8:]))
        run.check('%s：三句以後直接「好／讓我想想」（沒有問句、沒有別的選項）' % sid, any(c == ANSWER for c in CS) and not has_seq(T, SHE + [ASK_Q]), J(CS[-2:]))
        run.check('%s：選「讓我想想」→「%s」、記 think Y3S2、不交往' % (sid, THINK), THINK in T and res['te']['think'] == 'Y3S2' and res['te']['result'] == 'think' and not res['xc']['dating'], J({'te': res['te'], 'T': T[-3:]}))
        if res['te']['result'] != 'think': return
        # 第二次：大四上期末（最後一科 12/22，時段 12/21～12/31；bcb788dec：排在 12/25，那天 12:00 邀約、18:00 吃飯）
        await jump(pg, run, '2028-12-25', 11.87, 'campus', '%s：大四上期末 12/25（一）11:52（最後一科 12/22 考完）' % sid)
        g2 = await pg.evaluate(GATES + "(%s)" % json.dumps({'npcRom': 76, 'term': 'Y4S1'})); res['gates2'] = g2
        run.setup('【前置】%s：大四上門檻照舊（同一份），plan 清掉重算 → %s' % (sid, J(g2, 500)))
        run.check('%s：前置——大四上門檻照舊全過、心意邀約要發（上學期讓我想想＝第二次）' % sid, g2['all'] and g2['heartWhy'] is True, J(g2, 400))
        if not (g2['all'] and g2['heartWhy'] is True): return
        q2 = await te_invite(pg, cdp, run, sid, res, 'Y4S1', INVITE2, '2028-12-25', label=sid + '_Y4S1')
        if not q2: return
        res.pop('te', None)
        lg2, T2, CS2 = await te_dinner(pg, cdp, run, sid, res, 'Y4S1', q2['key'], [NOT_YET_OPT, '「好。」'], label=sid + '_Y4S1')
        await report(pg, run, sid, res, T + T2, CS + CS2, caps(lg2), lg + lg2)
        run.check('%s：第二次選「（先不說）」→ she2「上次那件事，我的答案沒變。」「……你的呢。」→「好／讓我想想」' % sid, has_seq(T2, SHE2) and any(c == ANSWER for c in CS2) and not has_seq(T2, SHE[:1]), J(T2[-6:]))
        run.check('%s：選「好。」＝交往（sheSaid）' % sid, res['te']['result'] == 'sheSaid' and res['xc']['dating'], J({'te': res['te'], 'xc': res['xc']}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_te_other(p, run, base, sid, out):
    """TE_TELL／TE_KNOWN：交往中（子晴）；TELL＝她不知道、KNOWN＝之前親口說過（ROM.tellBy）"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.87, 'campus', preflags=TWF, dating=[ZQ], quiet=False, label=sid + '（2028-06-10（六）11:52 校園；和子晴交往中）')
    try:
        if sid == 'TE_KNOWN': await pre(pg, run, '%s：之前就親口跟芯慈說過子晴（ROM.tellBy；source yt_told）' % sid, "ROM.tellBy(G,XC,ZQ); return {knows:(ROM.relRec(G)[XC]||{})[ZQ]};")
        g = await pg.evaluate(GATES + "(%s)" % json.dumps({'npcRom': 76, 'term': 'Y3S2'})); res['gates'] = g
        run.setup('【前置】%s：門檻全過、戀愛 76；學期末 plan 清掉重算 → %s' % (sid, J(g, 600)))
        want_hidden = [ZQ] if sid == 'TE_TELL' else []
        okp = g['all'] and g['heartWhy'] is True and g['others'] == [ZQ] and g['hidden'] == want_hidden
        run.check('%s：前置——門檻全過、心意邀約照發；交往中 %s、她不知道的 %s' % (sid, g['others'], g['hidden']), okp, J(g, 500))
        if not okp: return
        q = await te_invite(pg, cdp, run, sid, res, 'Y3S2', INVITE, '2028-06-10')
        if not q: return
        picks = [TELL_OPT, '「我喜歡妳。」'] if sid == 'TE_TELL' else ['「我喜歡妳。」']
        lg, T, CS = await te_dinner(pg, cdp, run, sid, res, 'Y3S2', q['key'], picks)
        await report(pg, run, sid, res, T, CS, caps(lg), lg)
        te_common(run, sid, lg, T, CS)
        x = res['xc']
        if sid == 'TE_TELL':
            run.check('%s：第一次的選項＝三句＋「（先不說）」＋「%s」' % (sid, TELL_OPT), any(c == CONF3 + [NOT_YET_OPT, TELL_OPT] for c in CS), J(CS[-3:]))
            run.check('%s：選了以後「……我要知道是誰。」「（你說了。）」「好。知道了，我才排得出來。」' % sid, has_seq(T, TELL_LINES), J(T[-10:], 600))
            run.check('%s：再選一次，選項沒有「先告訴她」（三句＋先不說）→「我喜歡妳。」→ yes 四句（沒有「你跟她的事，我知道。」）' % sid,
                      any(c == CONF3 + [NOT_YET_OPT] for c in CS) and has_seq(T, TELL_LINES + YES) and KNOWN_LINE not in T, J(CS[-2:]))
            run.check('%s：交往；記 XC_TOLD；她知道子晴、來源是你說的（yt_told）；OPEN_OK' % sid,
                      x['dating'] and x['XC_TOLD'] is not None and bool(x['knowsZQ']) and x['knowsZQ'].get('source') == 'yt_told' and bool((x['openOk'] or {}).get(ZQ)), J(x))
        else:
            run.check('%s：選項＝三句＋「（先不說）」（她已經知道＝沒有「先告訴她」）' % sid, any(c == CONF3 + [NOT_YET_OPT] for c in CS) and not any(TELL_OPT in c for c in CS), J(CS[-3:]))
            run.check('%s：答應時多「%s」，接著 yes 四句' % (sid, KNOWN_LINE), has_seq(T, [KNOWN_LINE] + YES), J(T[-7:]))
            run.check('%s：交往' % sid, x['dating'] and res['te']['result'] == 'yes', J({'xc': x, 'te': res['te']}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_te_foundout(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-06-10', 11.87, 'campus', preflags=TWF, dating=[ZQ], quiet=False, label=sid + '（2028-06-10（六）11:52 校園；和子晴交往中）')
    try:
        await pre(pg, run, '%s：芯慈從別的地方知道子晴（ROM.learn source seen；你沒說過）' % sid, "ROM.learn(G,XC,ZQ,'seen'); return {knows:(ROM.relRec(G)[XC]||{})[ZQ]};")
        g = await pg.evaluate(GATES + "(%s)" % json.dumps({'npcRom': 76, 'term': 'Y3S2'})); res['gates'] = g
        run.setup('【前置】%s：門檻全過、戀愛 76；學期末 plan 清掉重算 → %s' % (sid, J(g, 600)))
        okp = g['all'] and g['foundOut'] == [ZQ] and isinstance(g['heartWhy'], dict) and g['heartWhy'].get('nope') == 'knows'
        run.check('%s：前置——門檻全過、她自己知道子晴（foundOut）；heartWhy＝{nope:knows}' % sid, okp, J(g, 500))
        if not okp: return
        ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=12.1", max_s=600, picks=['「那天有約了。」'], label=sid)
        ms = await msgs(pg, 'p:' + XC); te = await pg.evaluate(TE_RES + "('Y3S2')"); res.update({'msgs1': ms[-3:], 'te': te})
        run.check('%s：6/10 12:00 以後（等到 12:06；心意邀約本來會在這時候傳）沒有她的心意邀約（也沒有朋友的邀約）' % sid, ok and not any((m['tag'] or '').startswith('te_') for m in ms), J({'reached': ok, 'msgs': ms[-3:], 'plan': te.get('plan')}))
        await jump(pg, run, '2028-06-18', 19.95, 'campus', '%s：時段最後一天（6/18）' % sid)
        ok2, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=20.1", max_s=500, picks=['「那天有約了。」'], label=sid)
        ms2 = await msgs(pg, 'p:' + XC); res['msgs2'] = ms2[-3:]; await run.shot(pg, '%s_after' % sid)
        run.check('%s：6/18 20:00 以後（等到 20:06）也沒有 NOPE 那一句（NOPE.knows 沒有她）' % sid, ok2 and not any((m['tag'] or '').startswith('te_') for m in ms2), J({'reached': ok2, 'msgs': ms2[-3:]}))
        await banned_check(pg, run, sid, [])
    finally: await finish_page(run, sid, res, errs, b)


# ======================================================== 二、交往以後
@guard
async def s_after_tell(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-17', 15.6, 'library', preflags=TWF, dating=[XC, ZQ], quiet=False, label=sid + '（大四上 2028-10-17（二）15:36 總圖三樓；和芯慈、子晴都在交往）')
    try:
        p0 = await pre(pg, run, '%s：和芯慈交往 10 天（confessed 10/7）；子晴的事她不知道' % sid, "(F.confessed||(F.confessed={}))[XC]=G.day-10; G.contacts[XC]=G.contacts[XC]||1; return {hidden:XCROM.hidden(G),foundOut:XCROM.foundOut(G),company:STORY.companyOf(G,XC,null,GAME)};")
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([XC])); res['pos'] = pos
        okp = bool(pos) and p0['hidden'] == [ZQ] and not p0['foundOut']
        run.check('%s：前置——她在總圖三樓、子晴的事她不知道' % sid, okp, J({'pos': pos, 'pre': p0}))
        if not okp: return
        res['company'] = await pg.evaluate(COMPANY)
        # bcb788dec：privtalk 清單有 xc_tell、xc_repair——她圈子的人在旁邊時選項不出、沒有期限（照舊用 STORY.companyOf 看；heroine_circle 目前沒有芯慈的列＝應該一直是空的）
        run.note('%s：說話前 companyOf（她旁邊、她圈子的人）＝%s' % (sid, J(res['company'])))
        run.check('%s：前置——她旁邊沒有她圈子的人（companyOf 空的；不然私密選項照規則不出）' % sid, res['company'] == [], J(res['company']))
        if res['company'] != []: return
        n0 = await log_len(pg)
        ch1, lab1 = await talk(pg, cdp, run, [XC], XCN, picks=['自己跟她講'], label=sid + '_1')
        x1 = await pg.evaluate(XCSTATE)
        ch2, lab2 = await talk(pg, cdp, run, [XC], XCN, picks=[], label=sid + '_2')
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); res.update({'ch1': ch1, 'ch2': ch2, 'xc': x1, 'company2': await pg.evaluate(COMPANY)})
        await report(pg, run, sid, res, T, CS, None, lg)
        m1 = [c['opts'] for c in (ch1 or []) if any(o.startswith('就這樣') for o in c['opts'])]
        m2 = [c['opts'] for c in (ch2 or []) if any(o.startswith('就這樣') for o in c['opts'])]
        run.check('%s：和她說話（%s）的選單有「%s」' % (sid, lab1, TELL_AFTER_OPT), any(TELL_AFTER_OPT in o for o in m1), J({'menus': m1, 'company': res['company']}, 600))
        run.check('%s：選了 → 兩句「我要知道是誰。……知道了，我才排得出來。」「你跟她約的那幾天，先告訴我。我排別的。」' % sid, has_seq(T, TELL_AFTER), J(T[-6:]))
        run.check('%s：記 XC_TOLD、她知道子晴（來源是你說的）、還在交往' % sid, x1['XC_TOLD'] is not None and bool(x1['knowsZQ']) and x1['knowsZQ'].get('source') == 'yt_told' and x1['dating'], J(x1))
        run.check('%s：之後再和她說話（%s），選單沒有「%s」' % (sid, lab2, TELL_AFTER_OPT), bool(ch2 is not None) and not any(TELL_AFTER_OPT in o for o in m2), J({'menus': m2, 'ch2': ch2}, 500))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_an_knows(p, run, base, sid, out):
    res = out.setdefault(sid, {}); both = sid == 'AN_KNOWS_NO'
    dating = [XC, AN] if both else [XC]
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-09-20', 20.95 if both else 20.92, 'dorm', preflags=TWF, rels={AN: 'FRIEND'}, dating=dating, quiet=False,
                                       label=sid + '（2028-09-20（三）%s 宿舍；和芯慈交往%s；以安 FRIEND＋聯絡方式）' % ('20:57' if both else '20:55', '、也和以安交往' if both else ''))
    try:
        p0 = await pre(pg, run, '%s：和芯慈交往從昨天開始（confessed 9/19）' % sid, "(F.confessed||(F.confessed={}))[XC]=G.day-1; G.contacts[XC]=G.contacts[XC]||1; return {start:XCROM.startDay(G),day:G.day,anContact:INV.hasContact(G,AN),datingAN:F['dating_'+AN]===true,datingXC:F['dating_'+XC]===true};")
        okp = p0['start'] == p0['day'] - 1 and p0['anContact'] and p0['datingXC'] and p0['datingAN'] == both
        run.check('%s：前置——和芯慈交往第 2 天、有以安的聯絡方式%s' % (sid, '、也和以安交往' if both else '、沒有和以安交往'), okp, J(p0))
        if not okp: return
        if not both:
            ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='xc_an_knows')", max_s=600, label=sid)
            ms = [m for m in await msgs(pg, 'p:' + AN) if m['tag'] == 'xc_an_knows']; res['msgs'] = ms
            a = await answer2(pg, cdp, run, 'p:' + AN, '-', None, label=sid); res['thread'] = a['before'][-400:]
            await report(pg, run, sid, res, [m['text'] for m in ms], [])
            run.check('%s：交往後第一週 21:00 以後，以安私訊兩則「芯慈跟我說了。她自己來跟我說的。」「我很高興。是真的。」' % sid,
                      ok and [m['text'] for m in ms] == AN_KNOWS_L and all(m['d'] == '2028-09-20' and m['h'] >= 21 for m in ms), J(ms))
            run.check('%s：手機以安的對話串看得到兩則' % sid, all(t in a['before'] for t in AN_KNOWS_L), J(a['before'][-300:]))
        else:
            ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=21.1", max_s=600, label=sid)
            ms = [m for m in await msgs(pg, 'p:' + AN) if m['tag'] == 'xc_an_knows']; res['msgs'] = ms; await run.shot(pg, '%s_after' % sid)
            run.check('%s：以安自己在跟你交往：等到 21:06 還是沒有那兩則（21:00 第一次看就會傳）' % sid, ok and not ms, J({'reached': ok, 'msgs': ms}))
            await banned_check(pg, run, sid, [])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_found(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-18', 15.6, 'library', preflags=TWF, dating=[XC, ZQ], quiet=False, label=sid + '（2028-10-18（三）15:36 總圖三樓；和芯慈、子晴都在交往）')
    try:
        p0 = await pre(pg, run, '%s：和芯慈交往 10 天；芯慈從別的地方知道子晴（ROM.learn seen，你沒說過）' % sid,
                       "(F.confessed||(F.confessed={}))[XC]=G.day-10; ROM.learn(G,XC,ZQ,'seen'); return {foundOut:XCROM.foundOut(G),due:XCROM.foundDue(G)};")
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([XC])); res['pos'] = pos
        okp = bool(pos) and p0['foundOut'] == [ZQ] and p0['due']
        run.check('%s：前置——她在總圖三樓、foundOut＝子晴' % sid, okp, J({'pos': pos, 'pre': p0}))
        if not okp: return
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, [XC], XCN, picks=[], label=sid)
        if not await pg.evaluate(DONE + "('ev_xc_found')"):
            await wait_for(pg, cdp, run, DONE + "('ev_xc_found')", max_s=120, label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); x = await pg.evaluate(XCSTATE); res.update({'ch': ch, 'lab': lab, 'xc': x})
        await report(pg, run, sid, res, T, CS, None, lg)
        run.check('%s：走到她旁邊（%s）演「%s」「%s」' % (sid, lab, FOUND_L[0], FOUND_L[1]), has_seq(T, FOUND_L), J(T[:6]))
        run.check('%s：分手（不交往、ROM ex）、XC_FOUND 第 1 次' % sid, not x['dating'] and x['rom'] == 'ex' and bool(x['XC_FOUND']) and x['XC_FOUND'].get('n') == 1, J(x))
    finally: await finish_page(run, sid, res, errs, b)


# ======================================================== 三、挽回
REPAIR_HIST = ("at('2028-09-20',()=>ROM.start(G,XC)); at('2028-09-25',()=>ROM.start(G,ZQ)); at('2028-10-18',()=>{ ROM.end(G,XC,'found'); F.XC_FOUND={n:1,day:G.day}; });"
               " at('2028-10-29',()=>ROM.end(G,ZQ,'apart_talk')); ROM.cleanup(G);"
               " const r=SOCIAL.rel(XC); r.fam=Math.max(r.fam|0,70); r.trust=Math.max(r.trust|0,60); r.comf=Math.max(r.comf|0,55); SOCIAL.remember(XC,'FIRST_MET',''); SOCIAL.remember(ZQ,'FIRST_MET',''); G.contacts[XC]=G.contacts[XC]||1;")
REPAIR_HIST_TXT = '芯慈 9/20 開始交往、子晴 9/25 開始；10/18 芯慈自己發現（XC_FOUND 第 1 次，ROM.end found）；10/29 和子晴分開；收拾過（CLEANUP_DONE）'


@guard
async def s_repair_open(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-11-28', 15.6, 'library', preflags=TWF, rels={ZQ: 'FAMILIAR'}, quiet=False, label=sid + '（2028-11-28（二）15:36 總圖三樓）')
    try:
        p0 = await pre(pg, run, '%s：%s' % (sid, REPAIR_HIST_TXT), REPAIR_HIST + " return {due:XCROM.repairDue(G),lastEnd:CALENDAR.dateOf(XCROM.lastEndOther(G)).key,dating:XCROM.othersDating(G),rom:ROM.get(G,XC).status};")
        d29 = await pg.evaluate("(()=>{ const G=GAME.G; G.day-=1; const a=XCROM.repairOpts(G,'classmate_xinci').map(o=>o.t); G.day+=1; return a; })()")
        run.note('%s【程式檢查，不是玩家動作】前一天（單身第 29 天）選單會不會有：%s' % (sid, J(d29))); res['day29'] = d29
        okp = p0['due'] is True and p0['lastEnd'] == '2028-10-29' and not d29
        run.check('%s：前置——和另一位結束、單身滿 30 天、畢業以前＝挽回的條件成立（前一天 29 天不成立）' % sid, okp, J({'pre': p0, 'd29': d29}))
        if not okp: return
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps([XC])); res['pos'] = pos
        run.check('%s：前置——她在總圖三樓' % sid, bool(pos), J(pos))
        if not pos: return
        res['company'] = await pg.evaluate(COMPANY)
        # bcb788dec：privtalk 清單有 xc_tell、xc_repair——她圈子的人在旁邊時選項不出、沒有期限（照舊用 STORY.companyOf 看；heroine_circle 目前沒有芯慈的列＝應該一直是空的）
        run.note('%s：說話前 companyOf（她旁邊、她圈子的人）＝%s' % (sid, J(res['company'])))
        run.check('%s：前置——她旁邊沒有她圈子的人（companyOf 空的；不然私密選項照規則不出）' % sid, res['company'] == [], J(res['company']))
        if res['company'] != []: return
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, [XC], XCN, picks=[REPAIR_OPT], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); x = await pg.evaluate(XCSTATE); res.update({'ch': ch, 'lab': lab, 'xc': x})
        await report(pg, run, sid, res, T, CS, None, lg)
        run.check('%s：和她說話（%s）的選單有「%s」' % (sid, lab, REPAIR_OPT), any(REPAIR_OPT in c for c in CS), J({'CS': CS[-2:], 'company': res['company']}, 600))
        run.check('%s：選了 → 「……我知道。以安說了。」「我需要時間。我會自己決定要多久。」' % sid, has_seq(T, REPAIR_OPEN_L), J(T[-5:]))
        run.check('%s：XC_REPAIR 記成 wait（今天開始算 60 天）、還沒交往' % sid, bool(x['XC_REPAIR']) and x['XC_REPAIR'].get('state') == 'wait' and not x['dating'], J(x))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_repair_yes(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-12-02', 12.1, 'dorm', preflags=TWF, rels={ZQ: 'FAMILIAR'}, quiet=False, label=sid + '（2028-12-02（六）12:06 宿舍）')
    try:
        p0 = await pre(pg, run, '%s：%s；11/28 選了「（跟她說，你已經結束了那一段）」（XC_REPAIR wait）；之後已經正式約會 2 次（count 4 → d0 2）、半夜訊息 30 分鐘內回 2 次（XC_NIGHT 4 → n0 2）；她約的：今天 13:00 北美館（D06，DATE.book by npc）' % (sid, REPAIR_HIST_TXT),
                       REPAIR_HIST + " const L=DATE.log(G,XC); L.count=4; F.XC_NIGHT=4; F.XC_REPAIR={state:'wait',day:D('2028-11-28'),d0:2,n0:2};"
                       " const t=DATE.book(G,{who:XC,locs:['D06'],day:G.day,depart:13,by:'npc'}); return {trip:t&&{ok:t.ok,why:t.why,trip:t.trip,depart:t.depart,back:t.back},progress:XCROM.repairProgress(G),rom:ROM.get(G,XC).status};")
        res['pre'] = p0
        okp = bool(p0['trip']) and p0['trip'].get('ok') and p0['progress'] == {'dates': 2, 'nights': 2} and p0['rom'] == 'ex'
        run.check('%s：前置——約好今天 13:00 北美館；挽回進度 約會 2、半夜訊息 2；她和你是分開的（ROM ex）' % sid, okp, J(p0))
        if not okp: return
        tid = p0['trip']['trip']; n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, "(GAME.G.trips||[]).some(t=>t.trip===%s&&t.status==='done')" % json.dumps(tid), max_s=1200,
                                picks=['現在出發', '出發', '大展廳', '只有空畫框的作品', '差不多了，回去吧'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); x = await pg.evaluate(XCSTATE)
        tr = await pg.evaluate("(id=>{ const t=(GAME.G.trips||[]).find(t=>t.trip===id); return t?{status:t.status,spots:t.spots,counted:t.counted}:null; })(%s)" % json.dumps(tid))
        res.update({'trip': tr, 'xc': x, 'count': await pg.evaluate("DATE.log(GAME.G,'classmate_xinci').count")})
        await report(pg, run, sid, res, T, CS, caps(lg), lg)
        run.check('%s：照玩家走完北美館的約會（提醒時「現在出發」、兩個互動點、回去）' % sid, ok and bool(tr) and tr['status'] == 'done', J({'tr': tr, 'ch': ch[-3:]}, 600))
        run.check('%s：第三次約會結束時（結算以後）「我排好了。」「……這次，你什麼都先告訴我。」' % sid, has_seq(T, REPAIR_YES_L), J(T[-8:], 600))
        run.check('%s：回到交往（dating、ROM dating）、XC_REPAIR done' % sid, x['dating'] and x['rom'] == 'dating' and bool(x['XC_REPAIR']) and x['XC_REPAIR'].get('state') == 'done', J(x))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_repair_no(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2029-01-27', 20.92, 'dorm', preflags=TWF, rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（2029-01-27（六）20:55 宿舍；挽回第 60 天）')
    try:
        p0 = await pre(pg, run, '%s：XC_FOUND 第 1 次（10/18）、XC_REPAIR wait 從 11/28 開始、約會和半夜訊息都沒達到（d0、n0 等於現在）' % sid,
                       "F.XC_FOUND={n:1,day:D('2028-10-18')}; F.XC_REPAIR={state:'wait',day:D('2028-11-28'),d0:DATE.log(G,XC).count|0,n0:F.XC_NIGHT|0}; return {days:G.day-F.XC_REPAIR.day,rep:F.XC_REPAIR};")
        run.check('%s：前置——今天是第 60 天' % sid, p0['days'] == 60, J(p0))
        if p0['days'] != 60: return
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='xc_repair_no')", max_s=600, label=sid)
        ms = [m for m in await msgs(pg, 'p:' + XC) if m['tag'] == 'xc_repair_no']; res['msgs'] = ms
        a = await answer2(pg, cdp, run, 'p:' + XC, '-', None, label=sid); res['thread'] = a['before'][-300:]
        x = await pg.evaluate(XCSTATE); opts2 = await pg.evaluate("XCROM.repairOpts(GAME.G,'classmate_xinci').map(o=>o.t)"); res.update({'xc': x, 'opts': opts2})
        await report(pg, run, sid, res, [m['text'] for m in ms], [])
        run.check('%s：60 天沒滿：21:00 以後私訊「%s」（手機看得到）' % (sid, REPAIR_NO_L), ok and [m['text'] for m in ms] == [REPAIR_NO_L] and REPAIR_NO_L in a['before'], J(ms))
        run.check('%s：XC_REPAIR 變 friend、【程式檢查】之後挽回的選項不再出現' % sid, bool(x['XC_REPAIR']) and x['XC_REPAIR'].get('state') == 'friend' and not opts2, J({'rep': x['XC_REPAIR'], 'opts': opts2}))
    finally: await finish_page(run, sid, res, errs, b)


# ======================================================== 四、她爸爸、冷落
DAD_POS = {'x': 34.0, 'z': -99.0, 'yaw': 3.14159, 'lv': 0}


@guard
async def s_dad2(p, run, base, sid, out):
    res = out.setdefault(sid, {}); no = sid == 'DAD2_NO'
    b, pg, cdp, errs, r = await launch(p, run, base, '2029-04-27', 17.88 if no else 17.42, 'campus', preflags=TWF, rels={XC: 'FRIEND'} if no else None, dating=[] if no else [XC], quiet=False, pos=DAD_POS,
                                       label=sid + '（2029-04-27（五）%s 校園、法律系館A前面約 10 m；%s）' % ('17:53' if no else '17:25', '沒有交往' if no else '和芯慈交往中'))
    try:
        if not no:
            p0 = await pre(pg, run, '%s：交往從 2029-01-10 開始' % sid, "(F.confessed||(F.confessed={}))[XC]=D('2029-01-10'); return {due:STORY_EVENTS.find(e=>e.id==='ev_xc_dad2').prereq.custom(G),where:STORY.whereIs(GAME,XC)};")
            run.check('%s：前置——交往中、2029-04 的週五、不在國外（ev_xc_dad2 的條件成立）' % sid, p0['due'] is True, J(p0))
            if p0['due'] is not True: return
            ok, ch, T, C, CS = await near_wait(pg, cdp, run, sid, 'ev_xc_dad2', 34.0, -106.5, 0, ['「她去哪，我都會在台北。」'], max_s=900, r=2.0)
            lg = await log_since(pg, 0); await report(pg, run, sid, res, T, CS, C, lg)
            run.check('%s：17:30～18:00 法律系館A門口演「銀色的車」（ev_xc_dad2 done）' % sid, ok, J(ch[-2:]))
            if not ok: return
            run.check('%s：爸爸「這是上次那位同學？」→ 她「嗯。……現在不只是同學了。」→「（笑）我知道。妳媽說了。」→「她說畢業要去國際所。我們很放心。……你呢？」' % sid, has_seq(T, DAD2_OPEN), J(T[:8], 600))
            run.check('%s：三個選項「「還在準備國考。」」／「「還在想。」」／「「她去哪，我都會在台北。」」' % sid, any(c == DAD2_OPTS for c in CS), J(CS[-2:]))
            run.check('%s：選「她去哪，我都會在台北。」→「（芯慈看了你一眼，耳朵有點紅。）」「……好。」→ 最後「……走吧。他等一下會問你喜歡吃什麼。我會說。」' % sid, has_seq(T, DAD2_OPEN + DAD2_C), J(T[-4:]))
            run.check('%s：沒有「誰最強」那一段（AA_537 5-4 換成 8-1）' % sid, not any('誰最強' in t or '最強' in t for t in T), J([t for t in T if '強' in t]))
        else:
            await L.go_to(pg, cdp, run, 34.0, -106.5, 2.0, sid, max_s=240, lv=0, stop=lambda s: s['dlg'] or s['choices'] or s['busy'])
            n0 = await log_len(pg)
            ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=18.03", max_s=600, label=sid)
            lg = await log_since(pg, n0); T = texts(lg); await report(pg, run, sid, res, T, choice_sets(lg), None, lg)
            dn = await pg.evaluate(DONE + "('ev_xc_dad2')"); wh = await pg.evaluate("JSON.stringify(STORY.whereIs(GAME,'classmate_xinci'))"); res.update({'done': dn, 'where': wh})
            run.check('%s：沒有交往：站在門口等到 18:02，「銀色的車」（她爸爸 8-1）不演' % sid, ok and not dn and not any(t in T for t in DAD2_OPEN[:2]), J({'reached': ok, 'done': dn, 'where': wh}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_cold(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    # 遊戲裡熬夜過了半夜＝同一天、G.hour 24 以上（game3d.js 時間只加不換日，換日在睡覺）；10/17 24:35＝10/18 00:35
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-17', 24.58, 'dorm', preflags=TWF, dating=[XC], quiet=False, label=sid + '（2028-10-17（二）24:35＝10/18 00:35 宿舍，熬夜；和芯慈交往中）')
    try:
        p0 = await pre(pg, run, '%s：交往從 9/17 開始、最後一次正式約會也是 9/17（之後 30 天沒約會）；這學期還沒傳過' % sid,
                       "const c0=D('2028-09-17'); (F.confessed||(F.confessed={}))[XC]=c0; DATE.log(G,XC).last={trip:'T0',day:c0}; F.XCN_MISS=0; delete F.XC_COLD; G.contacts[XC]=G.contacts[XC]||1; return {days:G.day-c0,h:G.hour,term:CALENDAR.termOf(G.day).id};")
        run.check('%s：前置——交往中、30 天沒有正式約會、大四上' % sid, p0['days'] >= 28 and p0['term'] == 'Y4S1', J(p0))
        if not (p0['days'] >= 28 and p0['term'] == 'Y4S1'): return
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>/^xc_cold_/.test(m.tag||''))", max_s=600, label=sid)
        now = await pg.evaluate("GAME.G.day*24+GAME.G.hour")
        ms = [m for m in await msgs(pg, 'p:' + XC) if (m['tag'] or '').startswith('xc_cold_')]; res['msgs'] = ms
        a = await answer2(pg, cdp, run, 'p:' + XC, '-', None, label=sid); res['thread'] = a['before'][-300:]
        x = await pg.evaluate(XCSTATE); res['xc'] = x
        run.check('%s：00:40 一則「%s」、不用回（沒有回覆鍵）、手機看得到' % (sid, COLD_L), ok and len(ms) == 1 and ms[0]['text'] == COLD_L and ms[0]['ask'] is None and COLD_L in a['before'], J({'reached': ok, 'msgs': ms, 'pre': p0}))
        run.check('%s：不會因為冷落分手（還在交往）' % sid, x['dating'], J(x))
        if ms:
            ab = ms[0]['day'] * 24 + ms[0]['h']
            run.check('%s：訊息的時間＝現在（10/18 00:40），不是前一天的 00:40' % sid, abs(now - ab) < 0.5, J({'msg': [ms[0]['d'], ms[0]['h']], 'now_abs': round(now, 2), 'msg_abs': round(ab, 2)}))
        await jump(pg, run, '2028-10-18', 24.58, 'dorm', '%s：隔一晚（10/18 24:35＝10/19 00:35）' % sid)
        ok2, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=24.75", max_s=500, label=sid)
        ms2 = [m for m in await msgs(pg, 'p:' + XC) if (m['tag'] or '').startswith('xc_cold_')]; res['msgs2'] = ms2; await run.shot(pg, '%s_after' % sid)
        run.check('%s：同一學期只一次：隔一晚等到 00:45 還是只有一則' % sid, ok2 and len(ms2) == 1, J({'reached': ok2, 'msgs': ms2}))
        await banned_check(pg, run, sid, [])
    finally: await finish_page(run, sid, res, errs, b)


# ======================================================== 五、新的時刻
@guard
async def s_g2(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-09-22', 17.93, 'l118_home', rels={XC: 'FAMILIAR'}, quiet=False, label=sid + '（大二上第 3 週週二 2026-09-22 17:56 巷口家常菜；跟芯慈 FAMILIAR）')
    try:
        g0 = await pg.evaluate("({g2:XCROM.g2Done(GAME.G),done:!!(GAME.G.events.done||{}).ev_xc_g2_dad,where:STORY.whereIs(GAME,'classmate_xinci')})")
        run.check('%s：前置——慈 2 兩個都沒記（TALKED_FAMILY、ECON_TOGETHER）、3-1 還沒演' % sid, not g0['g2'] and not g0['done'], J(g0))
        if g0['g2'] or g0['done']: return
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xc_g2_dad')", max_s=700, picks=['「我想聽。」'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS, caps(lg), lg)
        g1 = await pg.evaluate("({g2:XCROM.gates(GAME.G).G2, mem:(GAME.G.social.mem.classmate_xinci||[]).map(m=>m.tag)})"); res['after'] = g1
        run.check('%s：18:00 她在巷口家常菜、演 3-1（ev_xc_g2_dad done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：「%s」→ 兩個選項「「我想聽。」」／「（不問）」' % (sid, G2_FIRST), G2_FIRST in T and any(c == ['「我想聽。」', '（不問）'] for c in CS), J({'T': T[:3], 'CS': CS[-2:]}))
        run.check('%s：選「我想聽。」→「我爸媽都是律師。事務所的帳，我從國中就在對。」「……所以我雙主修財金。是我自己要的。」' % sid, has_seq(T, [G2_FIRST] + G2_REST), J(T[-4:]))
        run.check('%s：記 TALKED_FAMILY（G2 過）' % sid, g1['g2'] is True and 'TALKED_FAMILY' in g1['mem'], J(g1))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_blank(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-05-04', 18.92, 'noodle', rels={XC: 'FAMILIAR'}, preflags=TWF, quiet=False, label=sid + '（2028-05-04（四）18:55 阿鳳麵店；跟芯慈 FAMILIAR；臺灣路線）')
    try:
        on = await pg.evaluate("XCROM.ON"); run.check('%s：前置——XCROM.ON＝true' % sid, on is True, J(on))
        if on is not True: return
        n0 = await log_len(pg)
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xinci_first_place')", max_s=900, picks=['「妳爸媽怎麼說？」', '「我可以一起嗎？」'], label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS, caps(lg), lg)
        g = await pg.evaluate("({blank:GAME.G.flags.XC_BLANK||null, G8:XCROM.gates(GAME.G).G8})"); res['after'] = g
        run.check('%s：19:00 麵店演慈 6「暑期實習」（ev_xinci_first_place done）' % sid, ok, J(ch[-2:]))
        if not ok: return
        run.check('%s：三個選項照舊、選「妳爸媽怎麼說？」→「我媽說：那家樓下的咖啡很好喝。」' % sid, any(c == C6_OPTS for c in CS) and '我媽說：那家樓下的咖啡很好喝。' in T, J(CS[:2]))
        run.check('%s：最後多「實習是週一到週五。」「週六晚上，我還是會去西門町，看七點那一場。」→ 三個選項「「我可以一起嗎？」」／「「妳一個人看嗎？」」／「「好好實習。」」' % sid,
                  has_seq(T, BLANK_L) and any(c == BLANK_OPTS for c in CS), J({'T': T[-4:], 'CS': CS[-1:]}))
        run.check('%s：選「我可以一起嗎？」→「……可以。不要遲到。」、記 XC_BLANK（G8 過）' % sid, has_seq(T, BLANK_L + ['……可以。不要遲到。']) and g['blank'] is True and g['G8'] is True, J({'T': T[-2:], 'g': g}))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_blank_again(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-10-14', 13.92, 'dorm', rels={XC: 'FAMILIAR'}, preflags=TWF, quiet=False, label=sid + '（大四上第 6 週週六 2028-10-14 13:55 宿舍；跟芯慈 FAMILIAR＋聯絡方式）')
    try:
        p0 = await pre(pg, run, '%s：慈 6 演過、那天沒選「我可以一起嗎？」（ev_xinci_first_place done、沒有 XC_BLANK）' % sid,
                       "G.events.done.ev_xinci_first_place=D('2028-05-04'); delete F.XC_BLANK; return {wd:CALENDAR.dateOf(G.day).wd%7,term:CALENDAR.termOf(G.day)};")
        okp = p0['wd'] == 6 and (p0['term'] or {}).get('id') == 'Y4S1' and (p0['term'] or {}).get('week') == 6
        run.check('%s：前置——大四上第 6 週週六' % sid, okp, J(p0))
        if not okp: return
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag==='xc_blank_again')", max_s=600, label=sid)
        ms = [m for m in await msgs(pg, 'p:' + XC) if m['tag'] == 'xc_blank_again']; res['msgs'] = ms
        run.check('%s：14:00 私訊「%s」、回覆鍵「我也去。」' % (sid, BLANK_AGAIN_L), ok and len(ms) == 1 and ms[0]['text'] == BLANK_AGAIN_L and ms[0]['ask'] == ['我也去。'] and abs(ms[0]['h'] - 14) < 0.3, J(ms))
        if not ms: return
        a = await answer2(pg, cdp, run, 'p:' + XC, 'xc_blank_again', '我也去。', label=sid); res['ui'] = a
        run.check('%s：手機看得到那一則、按「我也去。」' % sid, BLANK_AGAIN_L in a['before'] and a['got'] == '我也去。', J({k: a[k] for k in ('btns', 'got')}))
        g = await pg.evaluate("(()=>{ const G=GAME.G; const t=(G.trips||[]).find(t=>t.who==='classmate_xinci'&&t.day===G.day); const q=t&&(G.outings||[]).find(q=>q.dateTrip===t.trip); "
                              "return {blank:G.flags.XC_BLANK||null, trip:t?{locs:t.locs,depart:t.depart,back:t.back,kind:t.kind,by:t.by,status:t.status}:null, out:q?{h:q.h,title:q.title,state:q.state}:null}; })()")
        res['after'] = g; await report(pg, run, sid, res, [m['text'] for m in await msgs(pg, 'p:' + XC)][-3:], [])
        run.check('%s：記 XC_BLANK、那天排 D04（西門町）約會（晚上場、19:00 前到）' % sid, g['blank'] is True and bool(g['trip']) and g['trip']['locs'] == ['D04'] and 18 <= g['trip']['depart'] < 19 and bool(g['out']), J(g))
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_g6(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2028-03-06', 18.03, 'library_hall', rels={XC: 'FAMILIAR', AN: 'FRIEND'}, preflags=TWF, quiet=False,
                                       pos={'x': 10.8, 'z': -6.0, 'yaw': -1.5708, 'lv': 1}, label=sid + '（大三下第 3 週週一 2028-03-06 18:02 總圖大廳二樓、樓梯間門口；臺灣路線）')
    try:
        await pg.wait_for_timeout(3000)
        p0 = await pg.evaluate("({rec:!!GAME.G.flags.XC5_RECONCILE, xc:STORY.whereIs(GAME,'classmate_xinci'), an:STORY.whereIs(GAME,'heroine_01'), afternoonDone:!!GAME.G.flags.afternoonDone, term:CALENDAR.termOf(GAME.G.day)})")
        res['pre'] = p0
        okp = not p0['rec'] and (p0['xc'] or {}).get('zone') == 'library' and (p0['an'] or {}).get('zone') == 'library'
        run.check('%s：前置——還沒有 XC5_RECONCILE；照作息以安、芯慈都在總圖三樓（library；以安要 S.tick 先補 afternoonDone）' % sid, okp, J(p0))
        if not okp: return
        lab = await pg.evaluate(LAB)
        if '樓梯間' not in lab:
            await L.go_to(pg, cdp, run, 11.1, -6.0, 0.6, '樓梯間門口', max_s=120, lv=1, stop=lambda s: s['dlg'] or s['choices'] or s['busy']); lab = await pg.evaluate(LAB)
        run.check('%s：互動鈕「樓梯間：往 3F 閱覽區」' % sid, '樓梯間' in lab, J(lab))
        n0 = await log_len(pg)
        if '樓梯間' in lab: await L.tap(pg, cdp, '#interact')
        ok, ch = await wait_for(pg, cdp, run, DONE + "('ev_xc_g6_makeup')", max_s=500, label=sid)
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); await report(pg, run, sid, res, T, CS, caps(lg), lg)
        rec = await pg.evaluate("GAME.G.flags.XC5_RECONCILE||null"); res['rec'] = rec
        run.check('%s：走進三樓就演「對答案」（ev_xc_g6_makeup done）' % sid, ok, J({'zone': await pg.evaluate("GAME.G.zone"), 'ch': ch[-2:]}))
        if not ok: return
        run.check('%s：旁白＋三句照稿（以安和芯慈對民訴考古題…「（對你）你要加入嗎？你負責第八題。」），看到就算、沒有選項' % sid, has_seq(T, G6_L) and not CS, J({'T': T[:6], 'CS': CS}, 600))
        run.check('%s：記 XC5_RECONCILE（G6 過）' % sid, rec is True, J(rec))
    finally: await finish_page(run, sid, res, errs, b)


NIGHT_PRE = ("G.events.done.ev_xinci_second=G.events.done.ev_xinci_second||D('2026-11-24'); SOCIAL.remember(XC,'XINCI_SECOND',''); G.contacts[XC]=G.contacts[XC]||D('2025-10-20');"
             " F.XCN_START=D('%s'); F.XC_NIGHT=2; delete F.XC_FIX; delete F.XC_CALL1_MISS; DATE.log(G,XC).wishKnown=true; %s")
NIGHT_INFO = ("const sl=XCROM.nightSlot(G.day), x=XCROM.nightPick(G); return {now:[CALENDAR.dateOf(G.day).key,+G.hour.toFixed(2)], slot:[CALENDAR.dateOf(sl.day).key,sl.h], tag:'xcn_'+sl.mon,"
              " pick:x&&x.k, XC_NIGHT:F.XC_NIGHT|0, XCN:F.XCN, closed:XCROM.closed(G), start:XCROM.nightStart(G)};")


async def night_one(pg, cdp, run, sid, res, key, first):
    N = NIGHT[key]; lst = 'a' if key[0] == 'A' else 'b'; dkey, h = N['slot']
    if not first: await jump(pg, run, dkey, h - 0.06, 'dorm', '%s %s：那一週的時段' % (sid, key))
    info = await pre(pg, run, '%s：%s 排在下一則（XCN.%s＝%d）' % (sid, key, lst, N['idx']), "F.XCN=Object.assign({a:0,b:0,l:0},F.XCN||{},{%s:%d}); %s" % (lst, N['idx'], NIGHT_INFO))
    r = res.setdefault(key, {'pre': info})
    if not (info['pick'] == key and info['slot'] == [dkey, h]):
        run.check('%s %s：前置——這一週輪到 %s（%s %s）' % (sid, key, key, dkey, hm(h)), False, J(info)); return
    tag = info['tag']; n_before = info['XC_NIGHT']
    ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag===%s)" % json.dumps(tag), max_s=420, label='%s_%s' % (sid, key))
    ms = [m for m in await msgs(pg, 'p:' + XC) if m['tag'] == tag]; r['msgs'] = ms
    run.check('%s %s：%s %s 她傳「%s」（泡泡 %d 則照稿）' % (sid, key, dkey, hm(h), '／'.join(N['m']), len(N['m'])),
              ok and [m['text'] for m in ms] == N['m'] and all(m['d'] == dkey and abs(m['h'] - h) < 0.3 for m in ms), J(ms, 600))
    if not ms: return
    want = N['o'][N['pick']]
    a = await answer2(pg, cdp, run, 'p:' + XC, tag, want[0], label='%s_%s' % (sid, key)); r['ui'] = a
    run.check('%s %s：手機對話串看得到泡泡、三個回覆鍵「%s」' % (sid, key, '」「'.join(o[0] for o in N['o'])),
              all(t in a['before'] for t in N['m']) and a['opts'] == [o[0] for o in N['o']] and a['btns'] == [o[0] for o in N['o']], J({k: a[k] for k in ('opts', 'btns')}))
    after = await msgs(pg, 'p:' + XC); xn = await pg.evaluate("GAME.G.flags.XC_NIGHT|0"); r.update({'reply': [m['text'] for m in after[-2:]], 'XC_NIGHT': xn})
    run.check('%s %s：回「%s」→ 她回「%s」（手機看得到）' % (sid, key, want[0], want[1]), a['got'] == want[0] and any(m['text'] == want[1] and m['from'] == XC for m in after) and want[1] in a['after'], J({'got': a['got'], 'after': [m['text'] for m in after[-3:]]}))
    run.check('%s %s：30 分鐘內回＝XC_NIGHT +1（%d → %d）' % (sid, key, n_before, xn), xn == n_before + 1, J({'before': n_before, 'after': xn}))
    return [m['text'] for m in ms] + [want[1]]


@guard
async def s_night(p, run, base, sid, out):
    res = out.setdefault(sid, {}); A = sid == 'NIGHT_A'
    keys = ['A3', 'A4', 'A5', 'A7', 'A8'] if A else ['B1', 'B3', 'B8']
    k0 = keys[0]; dkey, h = NIGHT[k0]['slot']
    b, pg, cdp, errs, r = await launch(p, run, base, dkey, h - 0.06, 'dorm', rels={XC: 'FAMILIAR'}, preflags=TWF, quiet=False,
                                       label=sid + '（%s %s 宿舍；寫成那一天的凌晨（同單元測試），遊戲熬夜的寫法見 NIGHT_REAL；跟芯慈 FAMILIAR＋聯絡方式）' % (dkey, hm(h - 0.06)))
    try:
        await pre(pg, run, '%s：慈 3 演過（ev_xinci_second、XINCI_SECOND）、XCN_START 早於這幾週、XC_NIGHT 2（避開大二下第 6 週「你應該睡了吧。」）；%s；已經知道她的心願（不出 mention）' % (sid, '慈 5 以後（XC5_RECONCILE）' if not A else '慈 5 以前'),
                  NIGHT_PRE % ('2027-03-01' if A else '2027-10-01', 'delete F.XC5_RECONCILE;' if A else 'F.XC5_RECONCILE=true;') + " return {start:XCROM.nightStart(G),closed:XCROM.closed(G),rec:!!F.XC5_RECONCILE};")
        said = []
        for i, k in enumerate(keys):
            t = await night_one(pg, cdp, run, sid, res, k, i == 0)
            said += t or []
        await report(pg, run, sid, res, said, [])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_night_real(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    N = NIGHT['A3']; dkey, h = N['slot']; prev = '2027-03-13'
    b, pg, cdp, errs, r = await launch(p, run, base, prev, 24 + h - 0.06, 'dorm', rels={XC: 'FAMILIAR'}, preflags=TWF, quiet=False,
                                       label=sid + '（%s（六）%s＝%s（日）%s 宿舍，熬夜沒睡：遊戲的寫法是前一天、G.hour 24 以上）' % (prev, hm(24 + h - 0.06), dkey, hm(h - 0.06)))
    try:
        info = await pre(pg, run, '%s：同 NIGHT_A 的 A3（慈 3 演過、XCN.a＝2、XC_NIGHT 2）' % sid,
                         NIGHT_PRE % ('2027-03-01', 'delete F.XC5_RECONCILE;') + " F.XCN=Object.assign({a:0,b:0,l:0},F.XCN||{},{a:2}); " + NIGHT_INFO)
        res['pre'] = info
        okp = info['pick'] == 'A3' and info['slot'] == [dkey, h]
        run.check('%s：前置——這一週輪到 A3（%s %s）' % (sid, dkey, hm(h)), okp, J(info))
        if not okp: return
        tag = info['tag']; n_before = info['XC_NIGHT']
        # bcb788dec：xcrom3d 改用 G.day＋floor(hour/24)——熬夜那一晚（週六 25:30＝週日 01:30）就收到、訊息時間對
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.tag===%s)" % json.dumps(tag), max_s=500, label=sid)
        now = await pg.evaluate("GAME.G.day*24+GAME.G.hour"); st = await pg.evaluate(STATE)
        ms = [m for m in await msgs(pg, 'p:' + XC) if m['tag'] == tag]; res.update({'msgs': ms, 'state': st, 'now_abs': round(now, 2)})
        run.check('%s：熬夜那一晚（%s 週六 %s＝週日 %s）就收到 A3「%s」（泡泡 %d 則照稿）' % (sid, prev, hm(24 + h), hm(h), '／'.join(N['m']), len(N['m'])),
                  ok and [m['text'] for m in ms] == N['m'], J({'reached': ok, 'state': st, 'msgs': ms, 'pre': info}, 600))
        if not ms: return
        ab = ms[0]['day'] * 24 + ms[0]['h']
        run.check('%s：訊息時間＝現在（%s %s，不是早 24 小時）' % (sid, dkey, hm(h)), ms[0]['d'] == dkey and abs(ms[0]['h'] - h) < 0.3 and abs(now - ab) < 0.5, J({'msg': [ms[0]['d'], ms[0]['h']], 'now_abs': round(now, 2), 'msg_abs': round(ab, 2)}))
        want = N['o'][1]
        a = await answer2(pg, cdp, run, 'p:' + XC, tag, want[0], label=sid); res['ui'] = a
        after = await msgs(pg, 'p:' + XC); xn = await pg.evaluate("GAME.G.flags.XC_NIGHT|0"); res.update({'reply': [m['text'] for m in after[-2:]], 'XC_NIGHT': xn})
        run.check('%s：手機看得到泡泡、三個回覆鍵；回「%s」→ 她回「%s」' % (sid, want[0], want[1]),
                  all(t in a['before'] for t in N['m']) and a['btns'] == [o[0] for o in N['o']] and a['got'] == want[0] and want[1] in a['after'], J({k: a[k] for k in ('btns', 'got')}))
        run.check('%s：熬夜的寫法下 30 分鐘內回照樣算＝XC_NIGHT +1（%d → %d）' % (sid, n_before, xn), xn == n_before + 1, J({'before': n_before, 'after': xn}))
        await report(pg, run, sid, res, [m['text'] for m in ms] + [want[1]], [])
    finally: await finish_page(run, sid, res, errs, b)


ORDER = ['TE_ME_YES', 'TE_ME_NOTYET', 'TE_SHE_THINK', 'TE_TELL', 'TE_KNOWN', 'TE_FOUNDOUT',
         'AFTER_TELL', 'AN_KNOWS', 'AN_KNOWS_NO', 'FOUND',
         'REPAIR_OPEN', 'REPAIR_YES', 'REPAIR_NO',
         'DAD2', 'DAD2_NO', 'COLD',
         'G2_DAD', 'BLANK', 'BLANK_AGAIN', 'G6_MAKEUP', 'NIGHT_A', 'NIGHT_B', 'NIGHT_REAL']
FN = {'TE_ME_YES': s_te_me, 'TE_ME_NOTYET': s_te_me, 'TE_SHE_THINK': s_te_she, 'TE_TELL': s_te_other, 'TE_KNOWN': s_te_other, 'TE_FOUNDOUT': s_te_foundout,
      'AFTER_TELL': s_after_tell, 'AN_KNOWS': s_an_knows, 'AN_KNOWS_NO': s_an_knows, 'FOUND': s_found,
      'REPAIR_OPEN': s_repair_open, 'REPAIR_YES': s_repair_yes, 'REPAIR_NO': s_repair_no,
      'DAD2': s_dad2, 'DAD2_NO': s_dad2, 'COLD': s_cold,
      'G2_DAD': s_g2, 'BLANK': s_blank, 'BLANK_AGAIN': s_blank_again, 'G6_MAKEUP': s_g6, 'NIGHT_A': s_night, 'NIGHT_B': s_night, 'NIGHT_REAL': s_night_real}


async def main():
    run = L.Run('xcrom548', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'xcrom.json'), 'w'), ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'))
    run.finish()
asyncio.run(main())
