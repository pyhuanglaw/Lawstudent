"""BB（帳號 A）2026-10-22：RELEASE-9106-TEST 第 14 項 AA386-SIS-BATCH4-1022（LAWWW 13:4x 派；開發分支 52038bda 起，AA 第 6 節的十個解讀 57bab0c0）——AA_386 學姊第四批第 1～4 節（4-1）。
下面「應該演的台詞」照 AA_386（企劃線 9a814945）原文寫（不是照程式）。共用的小工具照抄 aa379c_probe.py（launch 多一個 extra：讀檔前寫進存檔的欄位，例：在臺北的家）。
  第 1 節 直屬學姊替你看路（找她說話時先演；她讀書的四個地方：Café、法圖、總圖 3F 閱覽區、總圖大廳二樓自習區）：
    ADV_GRAD 大一下 4/6 起、熟悉：1-1，選「那學姊後悔嗎？」　ADV_EXCH_A／B 大二上 12/1 起：1-2 兩個選項（記 SIS_ADV_EXCH same／go）
    ADV_PICK 大三上 11/15 起、熟悉：1-3 一般版　ADV_PICK_DATE 同一天、交往中：1-3 交往中版（志願表那一版、「本來要畫幾架？」）
    ADV_Y4_TW 大三下 5/2 起、熟悉、臺灣路線：1-4（另外【讀資料】同一天日本路線 preTalkEv＝null）　ADV_Y4_US_DATE／ADV_Y4_TW_DATE 交往中多一句（美國／臺灣那句）
    ADV_Y4_REDATE 分開過、演過三件事、又重新交往（現在交往中）：1-4 照常演（AA_386 第 6 節第 1 點）
    ADV_ACQ 只是認識（熟 5）：4/6 找她說話，四場都不出現。每一場：記憶、再找她說話不再演；交往中對話框寫「書瑀」
  第 2 節 S26_HEARD（SIS_ADV_EXCH go）／S26_LADDER（大二下階梯過了 S4-Lx）／S26_NONE：2027-11-03 起 18:30 以後在 Café／法圖找她，2-6 一般版那一句換兩句／照原句
  第 3 節（交往中；她私訊約 → 手機回 → 時間到「出發」→ 那一場）：
    XMAS_Y2（12/23 21:00 → 12/24 22:00 Café 門口，選「收好」）、XMAS_Y2_NO（回「明天晚上不行。」→「好。」→ 12/24 22:20 那兩則、記 no、不扣關係）
    XMAS_Y3（美國路線＋去年有來：12/24 20:30 → 21:00 研究室，同一天；多「去年是 Café 門口…」、美國路線那句整句取代）
    VDAY_Y2（大二寒假住宿舍：2/13 21:00 → 2/14 14:00 植物園，4 小時、18:00 出來）、VDAY_Y2_NO（17:00 那兩則）、VDAY_Y3_HOME（大三寒假在臺北的家：快轉停在她的私訊 → 2/14 10:00 公館捷運站，從家裡出發）
    VDAY_Y4（2029-02-14 22:30 在臺北的家接電話，3-5 去過多兩句）、VDAY_Y4_MISS（在宿舍按「先不接」→ 22:40 那兩則、記 missed）
    HOL_NODATE 朋友、沒交往：12/23 21:00、12/24 20:30 都沒有她的私訊
  第 4 節 4-1：REB_EARLY（分開 4 週：不演）、REB_OK（分開 7 週、朋友：演一般版，選「第三件，我等妳。」；【讀資料】DATE.hint＝「她在等她說好的那一天」；再找她不再演）、REB_CAUGHT（被發現退回朋友：第一件換句）
  這一支不測（另外一支 aa386b）：3-3 2028-12-24 那一頓多兩句、學期末交往版避開 12/24、4-2 兩次正式約會＋第二次結尾告白的答應台詞、閒聊階梯 S5-L8 extraIf／S6-L1 skipIf。
【前置】讀使用者存檔改日期、時間、地點（quiet_events；讀檔前拿掉和可昕的交往）；學姊的關係（熟悉／朋友／交往中）、已經認識、聯絡方式讀檔後設（同 aa379c）；路線、情境自己的旗標讀檔前寫進存檔；
讀檔時間照她的作息（STORY.whereIs，手機「朋友」那一句的來源）挑她在讀書地方的那一刻（每個情境寫在 run.setup）。之後照玩家：手機「朋友」看她在哪 → 手機「地點」→ 走過去按說話；手機回訊息；床上睡覺；手機跳過時間；在家選單「快轉」；時間到了按「出發」「接起來」。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=ADV_GRAD,... python3 aa386_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
ID = 'heroine_05'; TH = 'p:heroine_05'; FAM = 'g:family_law'
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>m.th===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null})))"""
OUTQ = """(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>q&&q.day>=GAME.G.day-1).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, h:+(+q.h).toFixed(3), state:q.state, title:q.title||'', place:q.place||'', alarm:!!q.alarm})))()"""
FLAGS = """(()=>{ const F=GAME.G.flags, ID='heroine_05'; const o={}; for(const k of ['SIS_PREDEPART','SIS_RIDE_ASK','SIS_RIDE','SIS_DEFENSE','SIS_INTERVIEW','met_sis','SIS_W1','SIS_W1_LATE','EXCHANGE_ROUTE']) o[k]=F[k]===undefined?null:F[k];
  const R=SOCIAL.rel(ID); o.fam=R.fam; o.trust=R.trust; o.stage=SOCIAL.stage(ID); o.mem=['FIRST_MET','SIS_INTERVIEW'].filter(t=>SOCIAL.has(ID,t)); return o; })()"""
# lv：null＝不動學姊（W1_LATE）；LATE＝晚到版認識的樣子（熟 5）；FAMILIAR／FRIEND；mems＝要記的人物記憶
SETREL = """(([lv,dating,mems])=>{ const G=GAME.G, ID='heroine_05', F=G.flags; const R=SOCIAL.rel(ID);
  if(lv){ const V={LATE:[5,1,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10]}[lv]; R.fam=V[0]; R.trust=V[1]; R.comf=V[2]; R.rom=0; R.npcRom=0; SOCIAL.remember(ID,'FIRST_MET','');
    F.met_sis=true; F.SIS_W1=true; G.events=G.events||{}; if(lv==='LATE') F.SIS_W1_LATE=true; else { (G.events.done||(G.events.done={})).ev_sis_w1=1; G.contacts=G.contacts||{}; G.contacts[ID]=STORY.dayOfKey('2025-09-24'); } }
  G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true});
  for(const m of (mems||[])) SOCIAL.remember(ID,m,'');
  if(dating){ try{ ROM.start(G,ID); }catch(e){} F['dating_'+ID]=true; R.fam=70; R.trust=60; R.comf=60; R.rom=70; R.npcRom=70; }
  return {stage:SOCIAL.stage(ID), fam:R.fam, met:!!F.met_sis, firstMet:SOCIAL.has(ID,'FIRST_MET'), contact:!!(INV.hasContact&&INV.hasContact(G,ID)), dating:F['dating_'+ID]===true,
    partners:typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):null, familyGroup:!!(PHONE.inGroup&&PHONE.inGroup(G,'family_law')), route:STORY.route?STORY.route(G):null,
    ok:typeof SISY23!=='undefined'?{FAMILIAR:SISY23.ok(G,'FAMILIAR'),FRIEND:SISY23.ok(G,'FRIEND')}:'沒有 SISY23'}; })"""
HER = """(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })()"""


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def is_go(o, go_keys):
    return bool(go_keys) and o.startswith(('出發：', '接起來：')) and any(k in o for k in go_keys)


def pick_idx(ops, picks=None, go_keys=None):
    """picks（場景裡要選的字，依序找）→ 這個情境要去的「出發」（go_keys）→ 起床選單「先起床再說」、跳過時間「照樣跳過」、說話完的「就這樣」→ 別的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for i, o in enumerate(ops):
        if is_go(o, go_keys): return i
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


async def drive(pg, cdp, run, picks=None, go_keys=None, max_s=240, label=''):
    """一直點到沒有對話、沒有選項（連續 3 次）；回傳選單紀錄"""
    t0 = time.time(); idle = 0; ch = []
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            k = pick_idx(ops, picks, go_keys); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, go_keys=None, label='', shot_at=None):
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立。shot_at＝看到這句台詞時截圖"""
    t0 = time.time(); ch = []; shot = False
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks, go_keys); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                if is_go(ops[k], go_keys): await run.shot(pg, '%s_prompt' % label)
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            if shot_at and not shot:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if shot_at in txt: await run.shot(pg, '%s_scene' % label); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def find_ask(pg, th, text):
    """她那則要回的訊息（ask 掛在最後一句）：先找文字一樣的，沒有就找這個對話串裡任何一則要回的"""
    return await pg.evaluate("""(([th,t])=>{ const P=PHONE.pending(GAME.G).filter(m=>m.ask&&(m.th||'')===th); const m=P.find(x=>x.text===t)||P[P.length-1]; return m?{id:m.ask.id, text:m.text, opts:m.ask.opts.map(o=>o.t)}:null; })(%s)""" % json.dumps([th, text]))


async def answer(pg, cdp, run, th, ask_id, want, label=''):
    """照玩家：手機 → 訊息 → 對話串 → 點回覆"""
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th))
    await pg.wait_for_timeout(600); await run.shot(pg, '%s_dm' % label)
    opts_ = await pg.evaluate("(id=>{ const m=PHONE.pending(GAME.G).find(x=>x.ask&&x.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; })(%s)" % json.dumps(ask_id))
    if not opts_: await L.phone_away(pg, cdp); return None
    k = next((i for i, t in enumerate(opts_) if t.startswith(want)), 0)
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===%s)" % json.dumps('%s|%d' % (ask_id, k)))
    await pg.wait_for_timeout(1500); say('   %s 手機回 %s：「%s」' % (label, ask_id, got)); await run.shot(pg, '%s_dm_answered' % label)
    await L.phone_away(pg, cdp); return got


FALLBACK = {'等到中午': ['等到中午', '等到下一堂課前'], '等到傍晚': ['等到傍晚', '等到下午'], '等到下午': ['等到下午'], '等到晚上': ['等到晚上']}


async def skip(pg, cdp, label_prefix, label=''):
    """手機「今天」→ 跳過時間：按文字開頭是 label_prefix 的那顆（沒有就照 FALLBACK 換下一個）；跳出「照樣跳過」就按。回傳按到的字"""
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
    """走到床邊按睡覺，選開頭是 prefix 的選項。回傳床的選項（沒有床＝None）"""
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
    for _ in range(3): await drive(pg, cdp, run, max_s=40, label=label); await pg.wait_for_timeout(2500)   # 起床選單（先起床再說）可能晚一點才出來
    return ops, ok


async def talk_her(pg, cdp, run, picks, label, wait_s=90):
    """找到她（最多等 wait_s 秒）、走過去、按說話、一直點到結束。回傳這次的台詞紀錄（沒找到她＝None）"""
    her = None; t0 = time.time()
    while time.time() - t0 < wait_s:
        her = await pg.evaluate(HER)
        if her: break
        await pg.wait_for_timeout(2000)
    if not her: return None
    await pg.wait_for_timeout(6000)   # 剛走進來的先讓她坐好
    btn = ''
    for _ in range(4):   # 還沒認識她的時候按鈕不一定寫名字：有「說話」就按
        her = await pg.evaluate(HER) or her
        await L.go_to(pg, cdp, run, her[0], her[1], 1.0, '學姊', max_s=150, lv=her[2]); await pg.wait_for_timeout(800)
        btn = (await L.state(pg)).get('interact') or ''
        if '說話' in btn or '搭話' in btn: break
    say('   %s 按鈕：%s' % (label, btn))
    n0 = len(await pg.evaluate("window.__LOG||[]"))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await run.shot(pg, '%s_talk' % label)
    await drive(pg, cdp, run, picks=picks, max_s=200, label=label)
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def friends_row(pg, cdp, run, who, label):
    await phone_tab(pg, cdp, 'friends')
    r = await pg.evaluate("""(id=>{ const b=document.querySelector('#phoneBody [data-person="'+id+'"]'); const row=b?b.closest('.item'):null; if(row) row.scrollIntoView({block:'center'}); return {text:row?row.innerText.replace(/\\n/g,'｜'):null}; })(%s)""" % json.dumps(who))
    await run.shot(pg, '%s_friends' % label); await L.phone_away(pg, cdp); return r


def texts(log, name):
    return [x['t'].replace('{name}', name) for x in log if x['n'] not in ('［選項］', '［字幕］')]


def in_order(T, exp):
    """exp 的每一句依序出現在 T（一字不差）；回傳缺的第一句"""
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None


def lines_check(run, sid, log, name, exp, absent=(), flag=None, flags=None):
    T = texts(log, name); exp = [e.replace('{name}', name) for e in exp]; miss = in_order(T, exp)
    run.check('%s：照 AA_386 依序演出（%d 句）' % (sid, len(exp)), miss is None, ('缺「%s」｜實際：' % miss if miss else '') + json.dumps(T[:40], ensure_ascii=False)[:900])
    for a in absent: run.check('%s：沒有「%s」' % (sid, a[:24]), a.replace('{name}', name) not in T, '')
    if flag: run.check('%s：記 %s＝%s' % (sid, flag[0], flag[1]), (flags or {}).get(flag[0]) == flag[1], json.dumps(flags, ensure_ascii=False))
    return T


async def launch(p, run, base, key, h, zone, lv, dating=False, flags=None, mems=None, label='', extra=None):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    Rm = F.get('romance') or {}; cleared = [k for k, v in Rm.items() if isinstance(v, dict) and v.get('status') == 'dating']
    for k in cleared: del Rm[k]
    F['KX_DEC3_MIGRATED'] = True
    for k, v in (flags or {}).items(): F[k] = (await pg.evaluate("STORY.dayOfKey('%s')" % v['$day'])) if isinstance(v, dict) and '$day' in v else v
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if extra: G.update(json.loads(json.dumps(extra)))
    if isinstance(G.get('home'), dict) and G['home'].get('at'): G['home']['day'] = d   # 在臺北的家（讀檔時人在家＝回到家的選單；放假中＝住家裡）
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETREL + "(%s)" % json.dumps([lv, dating, mems or []]))
    name = await pg.evaluate("GAME.G.name||'祐廷'")
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events；讀檔前拿掉和 %s 的交往）；學姊＝%s%s；讀檔前的旗標 %s；記憶 %s → %s' % (
        label, key, h, zone, cleared or '—', {None: '不動（使用者存檔原樣）', 'LATE': '晚到版認識（熟 5）', 'FAMILIAR': '熟悉', 'FRIEND': '朋友'}[lv], '＋交往中' if dating else '',
        json.dumps(flags or {}, ensure_ascii=False), mems or [], json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r, name


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def msgs(pg, th=TH):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))



# ================================================================ AA_386 學姊第四批（RELEASE-9106-TEST 第 14 項）
# 台詞照 AA_386（企劃線 9a814945）原文（不是照程式）；texts() 只比句子（說話的人另外看）
SB4F = """(()=>{ const F=GAME.G.flags; const o={}; for(const k of ['SIS_ADV_EXCH','SIS_XMAS_Y2','SIS_XMAS_Y3','SIS_VDAY_Y2','SIS_VDAY_Y3','SIS_VDAY_Y4','SIS_REBUILD','SIS_REBUILD_N','EXCHANGE_ROUTE']) o[k]=F[k]===undefined?null:F[k];
  o.mem=['SIS_ADV_GRAD','SIS_ADV_EXCH','SIS_ADV_PICK','SIS_ADV_Y4','SIS_XMAS_Y2','SIS_XMAS_Y3','SIS_VDAY_Y2','SIS_VDAY_Y3','SIS_VDAY_Y4','SIS_REBUILD'].filter(t=>SOCIAL.has('heroine_05',t));
  const D=(GAME.G.events&&GAME.G.events.done)||{}; o.done=['ev_sis_adv_grad','ev_sis_adv_exch','ev_sis_adv_pick','ev_sis_adv_y4','ev_sis_three_conditions','ev_sis_us_told'].filter(k=>D[k]);
  const R=SOCIAL.rel('heroine_05'); o.rel={fam:R.fam,trust:R.trust,comf:R.comf,rom:R.rom,npcRom:R.npcRom}; o.stage=SOCIAL.stage('heroine_05');
  o.where=(()=>{ try{ return GAME.whereText('heroine_05')||''; }catch(e){ return ''; } })(); return o; })()"""
WHERE = "(()=>{ try{ return GAME.whereText('heroine_05')||''; }catch(e){ return 'ERR '+e; } })()"
READ4 = ('cafe', 'lawlib', 'library', 'library_hall')
QUICK3 = ('cafe', 'lawlib', 'library_hall')   # 手機「地點」到得了的三個（沒有總圖 3F 閱覽區）：讀檔時間挑她在這三個地方的時候
# 她在哪（STORY.whereIs，手機「朋友」那一句的來源）：拿目前的存檔換日期、時間查（不改遊戲狀態），用來決定讀檔到哪一刻
SCAN = """(([days,hours])=>{ const out=[]; for(const k of days){ const d=STORY.dayOfKey(k), wd=CALENDAR.dateOf(d).wd%7; for(const h of hours){ const g=Object.assign({},GAME.G,{day:d,hour:h,weekday:wd});
  let w=null; try{ w=STORY.whereIs({G:g,E:GAME.E},'heroine_05'); }catch(e){ w={zone:null,err:String(e)}; } out.push([k,h,(w&&w.zone)||null,(w&&(w.away||w.act))||null]); } } return out; })"""


def zone_of(wt):
    if not wt: return None
    if 'Café' in wt: return 'cafe'
    if '法律學院圖書館' in wt: return 'lawlib'
    if '3F' in wt or '閱覽' in wt: return 'library'
    if '總圖' in wt: return 'library_hall'
    return None


async def launch_her(p, run, base, cands, hours, zones, lv, dating=False, flags=None, mems=None, label='', zone='campus'):
    """讀檔到候選的第一天第一個時間 → 查她在哪（SCAN）→ 第一個她在 zones 的時間不是現在＝重新讀檔到那個時間。回傳 launch 的結果＋(key,h)"""
    b, pg, cdp, errs, r, name = await launch(p, run, base, cands[0], hours[0], zone, lv, dating=dating, flags=flags, mems=mems, label=label)
    sc = await pg.evaluate(SCAN + "(%s)" % json.dumps([list(cands), list(hours)]))
    good = next((x for x in sc if x[2] in zones), None)
    say('   %s 她的作息（前 12 格）：%s → %s' % (label.split('（')[0], [(x[0][5:], x[1], x[2] or x[3]) for x in sc[:12]], good))
    if good and (good[0], good[1]) != (cands[0], hours[0]):
        await close(b)
        b, pg, cdp, errs, r, name = await launch(p, run, base, good[0], good[1], zone, lv, dating=dating, flags=flags, mems=mems, label=label + '｜讀檔時間照她的作息改到 %s %.2f（%s）' % (good[0], good[1], good[2]))
    return b, pg, cdp, errs, r, name, ((good[0], good[1]) if good else (cands[0], hours[0]))


async def find_her(pg, cdp, run, sid, picks, zones=READ4, tries=('等到下午', '等到傍晚', '等到晚上')):
    """照玩家：手機「朋友」看她在哪（GAME.whereText＝同一句）→ 是 zones 的地方就用手機「地點」過去、走到她旁邊按說話；不是就跳過時間再看"""
    wt = ''
    for k in range(len(tries) + 1):
        wt = await pg.evaluate(WHERE); z = zone_of(wt); st = await pg.evaluate(STATE)
        say('   %s %s %.2f 她在：「%s」→ %s' % (sid, st['key'], st['h'], wt, z))
        if z in zones and (st.get('zone') == z or await quick_go(pg, cdp, z)):   # 已經在那一區＝直接走過去（手機「地點」不能前往同一區；BB-B 13:5x：_again 全部沒找到她）
            log = await talk_her(pg, cdp, run, picks, sid)
            if log is not None: return log, wt, z
        if k < len(tries): await skip(pg, cdp, tries[k], sid)
    return None, wt, None


def her_names(log, name):
    return sorted({x['n'] for x in log if x['n'] not in ('［選項］', '［字幕］', '', name, None)})


ADV = {
    'ADV_GRAD': dict(days=['2026-04-06', '2026-04-07', '2026-04-08'], lv='FAMILIAR', dating=False, flags={}, picks=['那學姊後悔嗎'],
                     exp=['學姊是什麼時候開始準備研究所的？', '大三。', '……現在想起來，太早了。大三那一年，我的計畫本上沒有一格是空的。', '重點是，先把大學念完。研究所會等你。', '不後悔。', '……可是如果重來，我會留幾格空的。'],
                     absent=['以前這一格，我會寫三件事。', '以前這一格，我會排滿。'], mem='SIS_ADV_GRAD', desc='大一下第 7 週 4/6（一）起、熟悉'),
    'ADV_EXCH_A': dict(days=['2026-12-01', '2026-12-02', '2026-12-03'], lv='FAMILIAR', dating=False, flags={}, picks=['好像也不會怎樣'],
                       exp=['（你的包包裡露出一張傳單：「交換學生甄選說明會」。她看到了。）', '學姊大學有去交換嗎？', '沒有。我算過，會晚半年。', '晚半年畢業，晚半年考研究所。後面每一件事，都晚半年。', '……現在想想，晚半年會怎樣？', '（她問完，自己也沒有回答。）', '嗯。', '……我那時候覺得，會怎樣。', '傳單收好。大三上就要填志願了。'],
                       flag=('SIS_ADV_EXCH', 'same'), mem='SIS_ADV_EXCH', desc='大二上第 13 週 12/1（二）起、熟悉、選「好像也不會怎樣。」'),
    'ADV_EXCH_B': dict(days=['2026-12-01', '2026-12-02', '2026-12-03'], lv='FAMILIAR', dating=False, flags={}, picks=['學姊現在還可以去啊'],
                       exp=['（你的包包裡露出一張傳單：「交換學生甄選說明會」。她看到了。）', '學姊大學有去交換嗎？', '沒有。我算過，會晚半年。', '晚半年畢業，晚半年考研究所。後面每一件事，都晚半年。', '……現在想想，晚半年會怎樣？', '（她問完，自己也沒有回答。）', '研究生也可以申請。……我查過。', '只是查過。', '傳單收好。大三上就要填志願了。'],
                       flag=('SIS_ADV_EXCH', 'go'), mem='SIS_ADV_EXCH', desc='同上、選「學姊現在還可以去啊。」'),
    'ADV_PICK': dict(days=['2027-11-15', '2027-11-16', '2027-11-17'], lv='FAMILIAR', dating=False, flags={}, picks=['學姊自己呢'],
                     exp=['志願表，寫了嗎？', '還沒。禮拜四中午截止。', '選你想學的地方。', '……選了，就不要一直回頭看。', '前面那句做到了。', '後面那句，我還在練。'],
                     absent=['三件事。', '一，選你想學的。', '第三件，我還在練。'], mem='SIS_ADV_PICK', desc='大三上 11/15（一）起、熟悉（路線 11/18 才定）'),
    'ADV_PICK_DATE': dict(days=['2027-11-15', '2027-11-16', '2027-11-17'], lv='FRIEND', dating=True, flags={}, picks=['本來要畫幾架'],
                          exp=['志願表，寫了嗎？', '（你把手機上的志願表給她看。第一志願，是她要去的那間學校。）', '……嗯。', '那計畫本上，飛機畫一架就好。', '兩架。你的，我的。', '……我畫飛機很醜。一架就夠了。'],
                          absent=['……選了，就不要一直回頭看。', '還沒。禮拜四中午截止。', '三件事呢？'], mem='SIS_ADV_PICK', names=True, desc='同上、交往中'),
    # BB-B 10-23（SIS-NO-THREE-1023，AA_398 第 23～25 列）：志願表的另外兩支選項
    'ADV_PICK_B': dict(days=['2027-11-15', '2027-11-16', '2027-11-17'], lv='FAMILIAR', dating=False, flags={}, picks=['如果我選了留在臺灣'],
                       exp=['志願表，寫了嗎？', '選你想學的地方。', '……選了，就不要一直回頭看。', '那也是選。', '……一樣，不要回頭看。'],
                       absent=['三件事。', '……三件事一樣。'], mem='SIS_ADV_PICK', desc='大三上 11/15（一）起、熟悉、選「如果我選了留在臺灣呢？」'),
    'ADV_PICK_DATE_E': dict(days=['2027-11-15', '2027-11-16', '2027-11-17'], lv='FRIEND', dating=True, flags={}, picks=['妳沒有要交代我什麼'],
                            exp=['志願表，寫了嗎？', '那計畫本上，飛機畫一架就好。', '本來有。……選你想學的，選了不要回頭看。', '可是你已經選了。不用說。'],
                            absent=['三件事呢？', '一，選你想學的。二，選你以後會想念的。', '三……你已經選了。不用說。'], mem='SIS_ADV_PICK', names=True, desc='同上、交往中、選「妳沒有要交代我什麼？」'),
    'ADV_Y4_TW': dict(days=['2028-05-02', '2028-05-03', '2028-05-04'], lv='FAMILIAR', dating=False, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, picks=['還在想'],
                      exp=['你大四要做什麼，想了嗎？', '還在想，也是一種排法。', '你的大四，你自己排。我只幫你看。', '排之前先睡飽。排好的，一個禮拜看一次就好。', '……不要讓別人替你寫。', '（她說這句的時候，看的是自己的計畫本。）'],
                      absent=['到了那邊，拿給我看。', '八月以後，拍照傳給我。我在那邊也看得到。'], mem='SIS_ADV_Y4', jp=True, desc='大三下第 11 週 5/2（二）起、熟悉、臺灣路線'),
    'ADV_Y4_US_DATE': dict(days=['2028-05-02', '2028-05-03', '2028-05-04'], lv='FRIEND', dating=True, flags={'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1}, picks=['大概知道'],
                           exp=['你大四要做什麼，想了嗎？', '嗯。不用跟我說。先跟自己說。', '你的大四，你自己排。我只幫你看。', '排之前先睡飽。排好的，一個禮拜看一次就好。', '……不要讓別人替你寫。', '（她說這句的時候，看的是自己的計畫本。）', '到了那邊，拿給我看。'],
                           absent=['八月以後，拍照傳給我。我在那邊也看得到。'], mem='SIS_ADV_Y4', names=True, desc='同上、交往中、美國路線'),
    'ADV_Y4_TW_DATE': dict(days=['2028-05-02', '2028-05-03', '2028-05-04'], lv='FRIEND', dating=True, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, picks=['還在想'],
                           exp=['你大四要做什麼，想了嗎？', '還在想，也是一種排法。', '你的大四，你自己排。我只幫你看。', '……不要讓別人替你寫。', '（她說這句的時候，看的是自己的計畫本。）', '八月以後，拍照傳給我。我在那邊也看得到。'],
                           absent=['到了那邊，拿給我看。'], mem='SIS_ADV_Y4', names=True, desc='同上、交往中、臺灣路線'),
    'ADV_Y4_REDATE': dict(days=['2028-05-02', '2028-05-03', '2028-05-04'], lv='FRIEND', dating=True, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, picks=['還在想'],
                          exp=['你大四要做什麼，想了嗎？', '還在想，也是一種排法。', '你的大四，你自己排。我只幫你看。', '……不要讓別人替你寫。', '（她說這句的時候，看的是自己的計畫本。）', '八月以後，拍照傳給我。我在那邊也看得到。'],
                          absent=['到了那邊，拿給我看。'], mem='SIS_ADV_Y4', names=True,
                          pre="""(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k), R=(F.romance=F.romance||{}); R.heroine_05=Object.assign({},R.heroine_05||{},{status:'dating',history:[{ev:'start',day:D('2027-03-01')},{ev:'end',day:D('2027-08-30')},{ev:'start',day:D('2027-12-01')}]});
  F.dating_heroine_05=true; F.SIS_REBUILD=D('2027-10-20'); F.SIS_REBUILD_N=4; return {rec:R.heroine_05, brokeUp:SISB4.brokeUp(G), ok:SISB4.ok(G,'FAMILIAR'), restartYes:SISB4.restartYes(G)}; })()""",
                          desc='同上、交往中、臺灣路線；【前置】2027-08-30 分開過、10-20 演過三件事、12-01 重新交往（AA_386 第 6 節第 1 點：窗口還在就照常演）'),
}
FOUR_FIRST = ['學姊是什麼時候開始準備研究所的？', '（你的包包裡露出一張傳單：「交換學生甄選說明會」。她看到了。）', '志願表，寫了嗎？', '你大四要做什麼，想了嗎？']
HOURS = [15.0, 16.0, 17.0, 18.5, 19.5, 20.5]
JPCHK = """(()=>{ const G=GAME.G; const a=SISB4.preTalkEv(Object.assign({},G,{zone:'cafe'})); const g=Object.assign({},G,{zone:'cafe',flags:Object.assign({},G.flags,{EXCHANGE_ROUTE:'JP'})});
  let b=null; try{ b=SISB4.preTalkEv(g); }catch(e){ b='ERR '+e; } return {tw:a, jp:b, routeJP:STORY.route?STORY.route(g):null}; })()"""


async def s_adv(p, run, base, sid, out):
    res = out.setdefault(sid, {}); C = ADV[sid]
    b, pg, cdp, errs, r, name, at = await launch_her(p, run, base, C['days'], HOURS, QUICK3, C['lv'], dating=C['dating'], flags=dict({'Y4_PATH': 'other'}, **C['flags']), label=sid + '（' + C['desc'] + '）')
    try:
        if C.get('pre'):
            pr = await pg.evaluate(C['pre']); res['pre'] = pr; run.setup('[前置] %s：讀檔後設學姊的交往紀錄 → %s' % (sid, json.dumps(pr, ensure_ascii=False)))
        await drive(pg, cdp, run, max_s=30, label=sid)
        if C.get('jp'):
            jc = await pg.evaluate(JPCHK); res['jp'] = jc
            run.check('%s【讀資料】1-4 只有日本路線不演：同一天、在 Café，臺灣路線＝ev_sis_adv_y4、日本路線＝null' % sid, jc.get('tw') == 'ev_sis_adv_y4' and jc.get('jp') is None, json.dumps(jc, ensure_ascii=False))
        log, wt, z = await find_her(pg, cdp, run, sid, C['picks']); fl = await pg.evaluate(SB4F); res.update({'at': at, 'where': wt, 'zone': z, 'flags': fl, 'log': log})
        run.check('%s：在她讀書的地方找到她、說話（%s）' % (sid, wt), log is not None, json.dumps(fl, ensure_ascii=False)[:300])
        if log is None: raise RuntimeError('找不到她')
        lines_check(run, sid, log, name, C['exp'], absent=C.get('absent', ()), flag=C.get('flag'), flags=fl)
        run.check('%s：人物頁記憶 %s' % (sid, C['mem']), C['mem'] in fl.get('mem', []), json.dumps(fl, ensure_ascii=False)[:300])
        if C.get('names'): nm = her_names(log, name); run.check('%s：交往中對話框寫「書瑀」（%s）' % (sid, nm), nm == ['書瑀'], json.dumps(nm, ensure_ascii=False))
        log2, wt2, z2 = await find_her(pg, cdp, run, sid + '_again', [], tries=()); T2 = texts(log2 or [], name)
        run.check('%s：再找她說話不再演（只演一次）' % sid, log2 is not None and not any(x in T2 for x in FOUR_FIRST), json.dumps(T2[:8], ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_adv_acq(p, run, base, sid, out):
    """不熟（晚到版認識的樣子，熟 5）：大一下 4/6 找她說話，四場都不出現"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name, at = await launch_her(p, run, base, ['2026-04-06', '2026-04-07', '2026-04-08'], HOURS, QUICK3, 'LATE', flags={'Y4_PATH': 'other'}, label=sid + '（大一下 4/6 起、學姊只是認識（熟 5））')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        log, wt, z = await find_her(pg, cdp, run, sid, []); fl = await pg.evaluate(SB4F); res.update({'at': at, 'where': wt, 'log': log, 'flags': fl})
        T = texts(log or [], name)
        run.check('%s：找得到她說話，四場的開頭都沒有（stage %s）' % (sid, fl.get('stage')), log is not None and not any(x in T for x in FOUR_FIRST) and 'ev_sis_adv_grad' not in fl['done'], json.dumps(T[:12], ensure_ascii=False)[:400])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 第 2 節：AA_379 2-6（11/1～11/9，Café／法圖、18:00 以後）一般版那一句
S26_OLD = '計畫本上寫了很久。今天才決定要跟人說。'
S26_NEW = ['之前跟你提過。', '……申請送出去了。今天才覺得是真的。']
S26_HEAD = ['明年夏天，我想去美國待一個學期。研究交換。', '八月走，十二月回來。論文的第三章，要在那邊寫。']
LADX = """(()=>{ const G=GAME.G, St=LADDER.byTerm.Y2S2.heroine_05.steps, i=St.findIndex(s=>s&&s.id==='S4-Lx'); const so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladder['heroine_05@Y2S2']=i+1; return {idx:i, set:so.ladder['heroine_05@Y2S2']}; })()"""


async def s_26(p, run, base, sid, out):
    res = out.setdefault(sid, {}); fl0 = {'Y4_PATH': 'other'}
    if sid == 'S26_HEARD': fl0['SIS_ADV_EXCH'] = 'go'
    desc = {'S26_HEARD': '【前置】大二上 1-2 選了「學姊現在還可以去啊。」＝SIS_ADV_EXCH go', 'S26_LADDER': '【前置】大二下閒聊階梯學姊的進度過了 S4-Lx（讀檔後設 G.social.ladder）', 'S26_NONE': '都沒聽過'}[sid]
    days = ['2027-11-03', '2027-11-04', '2027-11-02', '2027-11-05', '2027-11-08', '2027-11-09', '2027-11-01']
    b, pg, cdp, errs, r, name, at = await launch_her(p, run, base, days, [18.5, 19.5, 20.5, 21.5], ('cafe', 'lawlib'), 'FRIEND', flags=fl0, label=sid + '（2027-11-03（三）起 18:30 以後；%s）' % desc)
    try:
        if sid == 'S26_LADDER': lx = await pg.evaluate(LADX); res['ladder'] = lx; run.setup('[前置] %s：G.social.ladder[heroine_05@Y2S2]＝%s' % (sid, json.dumps(lx)))
        await drive(pg, cdp, run, max_s=30, label=sid)
        log, wt, z = await find_her(pg, cdp, run, sid, ['去啊'], zones=('cafe', 'lawlib'), tries=('等到晚上',)); T = texts(log or [], name); fl = await pg.evaluate(SB4F); res.update({'at': at, 'where': wt, 'log': log, 'flags': fl})
        run.check('%s：Café／法圖 18:00 以後找她說話＝先演 2-6（%s）' % (sid, wt), log is not None and in_order(T, S26_HEAD) is None, json.dumps(T[:30], ensure_ascii=False)[:600])
        if sid != 'S26_NONE':
            run.check('%s：2-6 一般版那一句換成「%s」「%s」、沒有「%s」' % (sid, S26_NEW[0], S26_NEW[1], S26_OLD), in_order(T, S26_HEAD + S26_NEW) is None and S26_OLD not in T, json.dumps(T[:30], ensure_ascii=False)[:700])
        else:
            run.check('%s：2-6 一般版照原句「%s」' % (sid, S26_OLD), in_order(T, S26_HEAD + [S26_OLD]) is None and S26_NEW[0] not in T, json.dumps(T[:30], ensure_ascii=False)[:700])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 第 3 節：交往中的節日
HOL = {
    'XMAS_Y2': dict(end=(22.45, 23.1), ask='2026-12-23', askh=21.0, start=20.85, dm=['明天晚上十點，Café 門口。', '十五分鐘就好。'], opts=['好。', '明天晚上不行。'], go_day='2026-12-24', go_h=22.0, go=('聖誕夜',),
                    picks=['收好，回去再看'], flag='SIS_XMAS_Y2', ok='there', route={}, skip='等到晚上', no_skip='等到晚上',
                    exp=['（Café 的燈一盞一盞關掉。她站在門口，手上拿著兩個紙杯。）', '熱水。加了一點蜂蜜。', '……今天聖誕節，算特別的。', '（你把準備好的禮物給她。一盒綠色螢光筆。）', '……你怎麼知道我的用完了。',
                         '（她把螢光筆收進大衣口袋，沒有放進包包。然後拿出一個紙袋。）', '明年的計畫本。第一頁我寫了。回去再看。', '嗯。', '十五分鐘到了。', '（她說十五分鐘到了，可是沒有走。）', '（回到宿舍，你打開第一頁。只有一行：「1/1　早上不要排事情。睡飽。」）'],
                    absent=['……我說回去再看。'], miss_day='2026-12-24', miss_h=22 + 20 / 60, miss=['📷（Café 門口，兩個紙杯）', '熱水我喝完了。兩杯。'], no_reply='好。'),
    'XMAS_Y3': dict(end=(21.95, 22.6), ask='2027-12-24', askh=20.5, start=20.35, dm=['九點，研究室。', '……今天只有我。'], opts=['好。', '今天晚上不行。'], go_day='2027-12-24', go_h=21.0, go=('聖誕夜',),
                    picks=['坐在她旁邊'], flag='SIS_XMAS_Y3', ok='there', route={'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1}, pre={'SIS_XMAS_Y2': 'there'},
                    exp=['（研究室只剩她一個人。門口她那張桌上，放著一棵手掌大的聖誕樹，燈一閃一閃。）', '隔壁的學妹放的。她回家了，叫我幫她顧。', '……樹要怎麼顧。', '（她寫了三行，刪了兩行。）', '你在旁邊，我刪得比較快。',
                         '去年是 Café 門口。今年是研究室。', '……明年的今天，我們剛回來一天。', '十二月二十三號的飛機。……我先查好了。', '（你要走的時候，她沒有關那棵樹的燈。）'],
                    absent=['如果三月的信是好消息，明年的今天，我剛回來一天。'], miss_day='2027-12-24', miss_h=21.5, miss=['📷（研究室門口的桌上，一棵很小的聖誕樹）', '學妹的。我幫她顧。'], no_reply='好。'),
    'VDAY_Y2': dict(end=(17.95, 18.75), ask='2027-02-13', askh=21.0, start=20.85, dm=['明天下午兩點，植物園門口。', '我想走一走。不讀書的那種。'], opts=['好。', '明天不行。'], go_day='2027-02-14', go_h=14.0, go=('情人節',),
                    picks=['妳最喜歡哪一區'], flag='SIS_VDAY_Y2', ok='went', route={}, skip='等到下午', no_skip='等到傍晚',
                    exp=['（植物園分成很多區，每一區門口都有一塊說明牌。她每一塊都停下來讀，大概一分鐘。）', '一區一分鐘。', '……這樣才走得完。', '荷花池。', '二月沒有荷花，只有水。', '……我喜歡看什麼都還沒長出來的時候。',
                         '（出來的時候天已經暗了。她在計畫本二月十四號那一格寫了「植物園」，後面又加了三個字：「兩個人」。）'],
                    miss_day='2027-02-14', miss_h=17.0, miss=['📷（荷花池，只有水）', '走完了。荷花池，下次再看。'], no_reply='好。我自己去。'),
    'VDAY_Y3': dict(end=(14.95, 15.9), ask='2028-02-13', askh=21.0, start=20.85, dm=['明天是我寒假那一天的假。', '早上十點，公館捷運站二號出口。其他的沒排。'], opts=['好。', '明天不行。'], go_day='2028-02-14', go_h=10.0, go=('情人節',),
                    picks=['陪她看窗外'], flag='SIS_VDAY_Y3', ok='went', route={'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1},
                    exp=['（她站在出口，手上沒有計畫本。）', '今天沒帶。放在家裡了。', '第一班來的公車，我們就上去。坐到最後一站。', '（她一開始看著窗外，小聲念站名。念到第七站，就不念了。）', '（過了一個隧道，她的頭靠在你肩膀上。）',
                         '（終點站在山腳下。站牌旁邊有一家賣湯圓的小店，只有兩張桌子。）', '……情人節吃湯圓。', '我記一下。明年不要再這樣排。', '（她說不要再這樣排，可是一直在笑。）', '回去以後，那一格，我要畫一個勾。'],
                    miss_day='2028-02-14', miss_h=15.0, miss=['📷（一碗湯圓）', '坐到終點站了。有湯圓。'], no_reply='好。那一格先空著。'),
}
# 情境：XMAS_Y2（宿舍，答應）、XMAS_Y2_NO（宿舍，不行）、XMAS_Y3（宿舍、美國路線、去年有來，答應；同一天赴約）、VDAY_Y2（大二寒假住宿舍，答應）、VDAY_Y2_NO、VDAY_Y3_HOME（大三寒假在臺北的家，答應）
HOL_SC = {'XMAS_Y2': ('XMAS_Y2', False, False), 'XMAS_Y2_NO': ('XMAS_Y2', True, False), 'XMAS_Y3': ('XMAS_Y3', False, False), 'VDAY_Y2': ('VDAY_Y2', False, False),
          'VDAY_Y2_NO': ('VDAY_Y2', True, False), 'VDAY_Y3_HOME': ('VDAY_Y3', False, True)}
RELJ = "(()=>{ const R=SOCIAL.rel('heroine_05'); return {fam:R.fam,trust:R.trust,comf:R.comf,rom:R.rom,npcRom:R.npcRom}; })()"


def hm(h):
    m = int(round(h * 60)); return '%02d:%02d' % (m // 60, m % 60)


async def home_ff(pg, cdp, run, sid, until_js, go_keys, picks, max_s=600):
    """在臺北的家（2D 選單）：until_js 成立就停；手機自己打開（快轉停在要回的訊息、在家的自動打開）且 until 還不成立＝收起來（跳過）；
    選單：要去的「出發」→ picks → 「快轉」→「到下一個有事的日子」→ 其他照 pick_idx。回傳 (成立, 選單紀錄)"""
    t0 = time.time(); ch = []
    while time.time() - t0 < max_s:
        if await pg.evaluate(until_js): return True, ch
        if await phone_open(pg):
            await pg.wait_for_timeout(1500)
            if await pg.evaluate(until_js): return True, ch
            await run.shot(pg, '%s_home_phone_%d' % (sid, len(ch))); await L.phone_away(pg, cdp); await pg.wait_for_timeout(1200); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            st = await pg.evaluate(STATE)
            k = next((i for i, o in enumerate(ops) if is_go(o, go_keys)), None)
            if k is None: k = next((i for w in (picks or []) for i, o in enumerate(ops) if w in o), None)
            if k is None: k = next((i for i, o in enumerate(ops) if o.startswith('到下一個有事的日子')), None)
            if k is None: k = next((i for i, o in enumerate(ops) if o.startswith('快轉')), None)
            if k is None: k = pick_idx(ops, picks, go_keys)
            ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]}); say('   %s %s %.2f 選項 %s → %s' % (sid, st['key'], st['h'], [o[:14] for o in ops], ops[k][:20]))
            if is_go(ops[k], go_keys): await run.shot(pg, '%s_prompt' % sid)
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1500); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def s_hol(p, run, base, sid, out):
    """交往中：她那則私訊（約的時間才送到）→ 手機回「好。」或不行 → 睡覺、手機跳過時間（在家：快轉）→ 時間到「出發」→ 那一場照稿；不行＝那天她再傳一則、記 no"""
    key, no, home = HOL_SC[sid]; C = HOL[key]; res = out.setdefault(sid, {})
    fl0 = dict({'Y4_PATH': 'other'}, **C.get('route', {})); fl0.update(C.get('pre', {}))
    b, pg, cdp, errs, r, name = await launch(p, run, base, C['ask'], C['start'], 'dorm', 'FRIEND', dating=True, flags=fl0, extra=({'home': {'at': True}} if home else None),
                                             label=sid + '（交往中；%s %s %s；%s）' % (C['ask'], hm(C['start']), '臺北的家（寒假住家裡）' if home else '宿舍', '回不行' if no else '回好'))
    try:
        cond = "(GAME.G.msgs||[]).some(m=>m.th===%s&&m.text===%s)||GAME.G.day>STORY.dayOfKey(%s)" % (json.dumps(TH), json.dumps(C['dm'][-1]), json.dumps(C['ask']))
        if home: await home_ff(pg, cdp, run, sid, cond, (), [], max_s=420)
        else: await wait_for(pg, cdp, run, cond + "||GAME.G.hour>=%.2f" % (C['askh'] + 0.5), max_s=420, label=sid)
        await pg.wait_for_timeout(2500)
        M = await msgs(pg); mine = [m for m in M if m['text'] in C['dm']]; ask = await find_ask(pg, TH, C['dm'][-1]); res['dm'] = [M[-4:], ask]
        run.check('%s：%s %s 她私訊「%s」（回覆：%s）' % (sid, C['ask'], hm(C['askh']), '」「'.join(C['dm']), '／'.join(C['opts'])),
                  [m['text'] for m in mine][-2:] == C['dm'] and bool(ask) and ask['opts'] == C['opts'] and all(m['d'] == C['ask'] and abs(m['h'] - C['askh']) < 0.3 for m in mine[-2:]),
                  json.dumps({'msgs': M[-3:], 'ask': ask}, ensure_ascii=False)[:500])
        if not ask: raise RuntimeError('沒有收到她的私訊')
        rel0 = await pg.evaluate(RELJ)
        got = await answer(pg, cdp, run, TH, ask['id'], C['opts'][1 if no else 0], sid); res['answered'] = got
        await pg.wait_for_timeout(3000)
        if no:
            M2 = await msgs(pg); run.check('%s：回「%s」→ 她回「%s」' % (sid, C['opts'][1], C['no_reply']), any(m['text'] == C['no_reply'] for m in M2[-3:]), json.dumps(M2[-3:], ensure_ascii=False)[:300])
            Q = await pg.evaluate(OUTQ); run.check('%s：回不行＝沒有排出遊' % sid, not any(q['d'] == C['go_day'] and abs(q['h'] - C['go_h']) < 0.01 for q in Q), json.dumps(Q, ensure_ascii=False)[:300])
            miss_js = "(GAME.G.msgs||[]).some(m=>m.th===%s&&m.text===%s)" % (json.dumps(TH), json.dumps(C['miss'][-1]))
            if C['miss_day'] != C['ask']: await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, C['no_skip'], sid)
            await wait_for(pg, cdp, run, miss_js + "||GAME.G.day>STORY.dayOfKey(%s)||(GAME.G.day===STORY.dayOfKey(%s)&&GAME.G.hour>=%.2f)" % (json.dumps(C['miss_day']), json.dumps(C['miss_day']), C['miss_h'] + 0.4), max_s=600, label=sid)
            await pg.wait_for_timeout(2500); M3 = await msgs(pg); fl = await pg.evaluate(SB4F); gotm = [m for m in M3 if m['text'] in C['miss']]; res['miss'] = [M3[-4:], fl]
            run.check('%s：沒來＝%s %s 她傳「%s」' % (sid, C['miss_day'], hm(C['miss_h']), '」「'.join(C['miss'])),
                      [m['text'] for m in gotm] == C['miss'] and all(m['d'] == C['miss_day'] and abs(m['h'] - C['miss_h']) < 0.1 for m in gotm), json.dumps(M3[-4:], ensure_ascii=False)[:400])
            run.check('%s：記 %s＝no' % (sid, C['flag']), fl.get(C['flag']) == 'no', json.dumps(fl, ensure_ascii=False)[:300])
            run.check('%s：回不行不扣關係（%s → %s）' % (sid, rel0, fl['rel']), all(fl['rel'][k] >= rel0[k] for k in rel0), '')
        else:
            Q = await pg.evaluate(OUTQ); res['out'] = Q
            run.check('%s：回「好。」→ 排 %s %s 的出遊' % (sid, C['go_day'], hm(C['go_h'])), any(q['d'] == C['go_day'] and abs(q['h'] - C['go_h']) < 0.01 and q['state'] == 'planned' for q in Q), json.dumps(Q, ensure_ascii=False)[:400])
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            if home:
                ok, ch = await home_ff(pg, cdp, run, sid, "GAME.G.flags.%s!=null" % C['flag'], C['go'], C['picks'], max_s=900)
                st_end = await pg.evaluate(STATE); await pg.wait_for_timeout(3000)
            else:
                if C['go_day'] != C['ask']: await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, C['skip'], sid)
                ok, ch = await wait_for(pg, cdp, run, "(GAME.G.flags.%s!=null&&!(typeof ADV!=='undefined'&&ADV.active))||GAME.G.day>STORY.dayOfKey(%s)" % (C['flag'], json.dumps(C['go_day'])), max_s=900, picks=C['picks'], go_keys=C['go'], label=sid)
                st_end = await pg.evaluate(STATE)   # 演完那一刻（3D 裡時間照走，後面 drive 會再過幾分鐘）
                await drive(pg, cdp, run, picks=C['picks'], max_s=60, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; fl = await pg.evaluate(SB4F); res.update({'log': log, 'ch': ch, 'flags': fl})
            prompt = [c for c in ch if any(is_go(o, C['go']) for o in c['opts'])]
            run.check('%s：%s 時間到跳出「出發」（%s ｜ %s）' % (sid, C['go_day'], prompt[0]['at'] if prompt else '—', prompt[0]['pick'] if prompt else '—'), bool(prompt), json.dumps(ch[-6:], ensure_ascii=False)[:500])
            lines_check(run, sid, log, name, C['exp'], absent=C.get('absent', ()), flag=(C['flag'], C['ok']), flags=fl)
            run.check('%s：人物頁記憶 %s' % (sid, C['flag']), C['flag'] in fl.get('mem', []), json.dumps(fl, ensure_ascii=False)[:300])
            nm = her_names(log, name); run.check('%s：對話框寫「書瑀」（%s）' % (sid, nm), nm == ['書瑀'], json.dumps(nm, ensure_ascii=False))
            res['rel'] = [rel0, fl['rel']]; say('   %s 關係 %s → %s' % (sid, rel0, fl['rel']))
            st2 = st_end; res['end'] = st2
            if C.get('end'): run.check('%s：演完那一刻是 %s %s（這一場 %s 開始；AA_386 第 6 節：時長照 LAWWW、植物園 4 小時）' % (sid, st2['key'], hm(st2['h']), hm(C['go_h'])),
                                       st2['key'] == C['go_day'] and C['end'][0] <= st2['h'] <= C['end'][1], json.dumps(st2))
        await run.shot(pg, '%s_end' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_hol_nodate(p, run, base, sid, out):
    """沒交往（朋友）：2026-12-23 21:00、2027-12-24 20:30 都沒有她的私訊"""
    res = out.setdefault(sid, {})
    for key in ('XMAS_Y2', 'XMAS_Y3'):
        C = HOL[key]
        b, pg, cdp, errs, r, name = await launch(p, run, base, C['ask'], C['start'], 'dorm', 'FRIEND', flags=dict({'Y4_PATH': 'other'}, **C.get('route', {})), label='%s_%s（朋友、沒交往；%s %s 宿舍）' % (sid, key, C['ask'], hm(C['start'])))
        try:
            await wait_for(pg, cdp, run, "GAME.G.hour>=%.2f" % (C['askh'] + 0.4), max_s=300, label=sid)
            M = await msgs(pg); bad = [m for m in M if m['text'] in C['dm'] or m['text'] in C['miss']]; res[key] = M[-3:]
            run.check('%s_%s：沒交往＝%s 沒有她的私訊' % (sid, key, C['ask']), not bad, json.dumps(M[-3:], ensure_ascii=False)[:300])
            run.check('%s_%s：沒有 JS 例外' % (sid, key), not errs, json.dumps(errs[:3], ensure_ascii=False))
        except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s_%s：測試跑完' % (sid, key), False, str(e)[:300])
        await close(b)


V4 = ['我爸剛去睡。我在陽台。', '……情人節快樂。', '去年那家湯圓，我前幾天又想到。', '……想不起來那一站叫什麼。', '今年的二月十四號，我什麼都沒排。', '……過年，一直在吃。', '嗯。……那一天我來寫。']
V4_MISS = ['情人節快樂。', '我在陽台吹風。……你早點睡。']


async def s_v4(p, run, base, sid, out):
    """3-6 2029-02-14（三，初二）22:30 她打來；3-5 去過（SIS_VDAY_Y3 went）多兩句。VDAY_Y4＝在臺北的家接；VDAY_Y4_MISS＝在宿舍按「先不接」→ 22:40 私訊"""
    res = out.setdefault(sid, {}); miss = sid.endswith('_MISS')
    fl0 = {'Y4_PATH': 'other', 'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'SIS_VDAY_Y3': 'went'}
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2029-02-14', 21.5, 'dorm', 'FRIEND', dating=True, flags=fl0, extra=(None if miss else {'home': {'at': True}}),
                                             label=sid + '（交往中、美國路線；2029-02-14（三，初二）21:30 %s；【前置】大三寒假 3-5 去過＝SIS_VDAY_Y3 went）' % ('宿舍' if miss else '臺北的家'))
    try:
        n0 = len(await pg.evaluate("window.__LOG||[]")); rel0 = await pg.evaluate(RELJ)
        if miss:
            ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags.SIS_VDAY_Y4!=null||GAME.G.hour>=23.2", max_s=900, picks=['先不接'], label=sid)
            await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th===%s&&m.text===%s)||GAME.G.hour>=23.2" % (json.dumps(TH), json.dumps(V4_MISS[-1])), max_s=400, label=sid)
        else:
            ok, ch = await home_ff(pg, cdp, run, sid, "GAME.G.flags.SIS_VDAY_Y4!=null", ('打電話來',), ['開學以後，我們再補一天'], max_s=900)
            await pg.wait_for_timeout(3000)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; fl = await pg.evaluate(SB4F); M = await msgs(pg); res.update({'log': log, 'ch': ch, 'flags': fl, 'msgs': M[-4:]})
        prompt = [c for c in ch if any(o.startswith('接起來') for o in c['opts'])]
        run.check('%s：22:30 那一通前後跳出「接起來：…打電話來」（出遊系統約提前 15 分鐘問；%s ｜ %s）' % (sid, prompt[0]['at'] if prompt else '—', prompt[0]['opts'] if prompt else '—'),
                  bool(prompt) and 22.0 <= float(prompt[0]['at'].split()[1]) <= 22.75, json.dumps(ch[-5:], ensure_ascii=False)[:400])
        if miss:
            got = [m for m in M if m['text'] in V4_MISS]
            run.check('%s：沒接＝22:40 她傳「%s」、記 missed' % (sid, '」「'.join(V4_MISS)), [m['text'] for m in got][-2:] == V4_MISS and all(abs(m['h'] - (22 + 40 / 60)) < 0.1 for m in got[-2:]) and fl.get('SIS_VDAY_Y4') == 'missed',
                      json.dumps([M[-3:], fl], ensure_ascii=False)[:400])
            run.check('%s：沒接不扣關係（%s → %s）' % (sid, rel0, fl['rel']), all(fl['rel'][k] >= rel0[k] for k in rel0), '')
        else:
            lines_check(run, sid, log, name, V4, flag=('SIS_VDAY_Y4', 'call'), flags=fl)
            run.check('%s：人物頁記憶 SIS_VDAY_Y4' % sid, 'SIS_VDAY_Y4' in fl.get('mem', []), json.dumps(fl, ensure_ascii=False)[:300])
            nm = her_names(log, name); run.check('%s：對話框寫「書瑀」（%s）' % (sid, nm), nm == ['書瑀'], json.dumps(nm, ensure_ascii=False))
            res['rel'] = [rel0, fl['rel']]; say('   %s 關係 %s → %s' % (sid, rel0, fl['rel']))
        await run.shot(pg, '%s_end' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 第 4 節 4-1：分開以後的三件事
REB_GEN = ['有事先跟我說。不要讓我自己猜。', '還有，我要時間。不是一週，是我說好的那天。', '……其他的，我還沒想好。想好了告訴你。', '……不要說得那麼好聽。等就是了。']   # BB-B 10-23：AA_398 第 45、46 列（學姊不數件數）
REB_CAUGHT = ['我不要再從別人那裡聽到你的事。', '還有，我要時間。不是一週，是我說好的那天。', '……其他的，我還沒想好。想好了告訴你。', '嗯。']
EXREC = """(([st,startKey,endKey])=>{ const G=GAME.G, F=G.flags; F.romance=F.romance||{}; F.romance.heroine_05={status:st, history:[{ev:'start',day:STORY.dayOfKey(startKey)},{ev:'end',day:STORY.dayOfKey(endKey)}]}; F.dating_heroine_05=false;
  return {rec:F.romance.heroine_05, brokeUp:SISB4.brokeUp(G), breakDay:SISB4.breakDay(G), due:SISB4.rebuildDue(G), partners:ROM.partners?ROM.partners(G):null}; })"""
HINT = "(()=>{ try{ return {hint:DATE.hint(GAME.G,'heroine_05'), rebuild:SISB4.rebuild(GAME.G)}; }catch(e){ return {err:String(e)}; } })()"


async def s_reb(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    C = {'REB_EARLY': ('ex', '2027-09-20', 'EARLY', '分開才 4 週'), 'REB_OK': ('ex', '2027-08-30', 'OK', '分開 7 週'), 'REB_CAUGHT': ('friend_after_catch', '2027-08-30', 'CAUGHT', '被發現退回朋友 7 週')}[sid]
    days = ['2027-10-20', '2027-10-21', '2027-10-22']
    b, pg, cdp, errs, r, name, at = await launch_her(p, run, base, days, HOURS, QUICK3, 'FRIEND', flags={'Y4_PATH': 'other'},
                                                     label=sid + '（2027-10-20（三）起；學姊朋友；【前置】和她交往過、%s 分開（%s，%s）、現在沒有和別人交往）' % (C[1], C[0], C[3]))
    try:
        pre = await pg.evaluate(EXREC + "(%s)" % json.dumps([C[0], '2027-03-01', C[1]])); res['pre'] = pre
        run.setup('[前置] %s：讀檔後設學姊的交往紀錄 %s → %s' % (sid, C[0], json.dumps(pre, ensure_ascii=False)))
        await drive(pg, cdp, run, max_s=30, label=sid)
        picks = ['我等妳'] if C[2] == 'OK' else ['好。']
        log, wt, z = await find_her(pg, cdp, run, sid, picks); fl = await pg.evaluate(SB4F); T = texts(log or [], name); res.update({'at': at, 'where': wt, 'log': log, 'flags': fl})
        run.check('%s：在她讀書的地方找到她、說話（%s）' % (sid, wt), log is not None, '')
        if C[2] == 'EARLY':
            run.check('%s：分開才 4 週：找她說話不演 4-1（她要的時間）' % sid, log is not None and '還有，我要時間。不是一週，是我說好的那天。' not in T and '三件事。' not in T and fl.get('SIS_REBUILD') is None, json.dumps(T[:12], ensure_ascii=False)[:400])
        else:
            lines_check(run, sid, log or [], name, REB_GEN if C[2] == 'OK' else REB_CAUGHT, absent=(['有事先跟我說。不要讓我自己猜。'] if C[2] == 'CAUGHT' else ['我不要再從別人那裡聽到你的事。']) + ['三件事。', '第三件，我等妳。'])
            run.check('%s：記 SIS_REBUILD（那天）、人物頁記憶 SIS_REBUILD' % sid, fl.get('SIS_REBUILD') is not None and 'SIS_REBUILD' in fl.get('mem', []), json.dumps(fl, ensure_ascii=False)[:300])
            lab = await pg.evaluate("SOCIAL.MEMORY_LABEL.SIS_REBUILD"); run.check('%s：記憶名稱＝「她說：等她說好的那天」（AA_398 第 48 列）' % sid, lab == '她說：等她說好的那天', json.dumps(lab, ensure_ascii=False))
            hn = await pg.evaluate(HINT); res['hint'] = hn
            run.check('%s【讀資料】人物頁的進度提示＝「她在等她說好的那一天」' % sid, hn.get('hint') == '她在等她說好的那一天', json.dumps(hn, ensure_ascii=False))
            log2, wt2, z2 = await find_her(pg, cdp, run, sid + '_again', [], tries=()); T2 = texts(log2 or [], name)
            run.check('%s：再找她說話不再演（這一次分開只演一次）' % sid, log2 is not None and '還有，我要時間。不是一週，是我說好的那天。' not in T2 and '三件事。' not in T2, json.dumps(T2[:8], ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['ADV_GRAD', 'ADV_EXCH_A', 'ADV_EXCH_B', 'ADV_PICK', 'ADV_PICK_DATE', 'ADV_PICK_B', 'ADV_PICK_DATE_E', 'ADV_Y4_TW', 'ADV_Y4_US_DATE', 'ADV_Y4_TW_DATE', 'ADV_Y4_REDATE', 'ADV_ACQ', 'S26_HEARD', 'S26_LADDER', 'S26_NONE',
         'XMAS_Y2', 'XMAS_Y2_NO', 'XMAS_Y3', 'VDAY_Y2', 'VDAY_Y2_NO', 'VDAY_Y3_HOME', 'VDAY_Y4', 'VDAY_Y4_MISS', 'HOL_NODATE', 'REB_EARLY', 'REB_OK', 'REB_CAUGHT']
FN = dict({k: s_adv for k in ADV}, ADV_ACQ=s_adv_acq, S26_HEARD=s_26, S26_LADDER=s_26, S26_NONE=s_26, VDAY_Y4=s_v4, VDAY_Y4_MISS=s_v4, HOL_NODATE=s_hol_nodate, REB_EARLY=s_reb, REB_OK=s_reb, REB_CAUGHT=s_reb,
          **{k: s_hol for k in HOL_SC})


async def main():
    run = L.Run('aa386', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa386.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    run.finish()

asyncio.run(main())
