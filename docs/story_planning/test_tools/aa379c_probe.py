"""BB（帳號 A）2026-10-22：AA_379 第 3、4 節（LAWWW 03:17 派）——3-1 大一寒假 Café、3-2 出國前最後一個週六、3-4 口試那天的回聲、第 4 節 大一沒認識她的玩家（W1 晚到版）。
開發分支 5464b872 還沒有實作這兩節：這支是先寫好的瀏覽器測試，等 LAWWW 實作的 commit 以後跑（現在跑會 FAIL；「不該出現」的那幾項現在 PASS 不代表做對了）。
下面「應該演的台詞」照 AA_379 第 3、4 節原文寫（不是照程式）。aa379b_probe.py 不動；共用的小工具照抄過來。
  S31_CAFE   大一寒假 2026-02-05（四）14:30、02-13（五）16:12：手機「朋友」學姊在「兩點半 Café（在看小說，到 17:00）」→ 手機「地點」到 Café，她在
  S31_OUT    2026-02-03（二）15:00、02-14（六）15:00：手機「朋友」不是 Café、到 Café 沒有她；另外 02-16（一，除夕）15:00 手機「朋友」不是 Café（2/14 是週六，平日規則本來就不在，多看一個過年的平日）
  S32_GO     臺灣路線、熟悉、7/26 群組沒有按「我送妳。我有車。」：2028-07-28 20:51 宿舍 → 21:00 私訊「明天下午有空嗎。」「我要去買行李箱的鎖。……順便走一走。」（回覆：好。／明天下午不行。）
             →「好。」→ 排 7/29 15:00 →上床「睡到明天」→ 手機「等到下午」→ 時間到「出發」→ 旁白＋兩句 → 選「四個多月很快。」→「嗯。……計畫本排到十二月了，排完就覺得很快。」
             → 結尾「群組那則，是寫給大家的。」（她看了你一眼，沒有再說。）；記 SIS_PREDEPART＝went
  S32_RIDE   同上，朋友＋【前置：7/26 群組按過「我送妳。我有車。」＝SIS_RIDE_ASK yes、SIS_RIDE two】：選「會想回來嗎？」→「會想 Café 的熱水。…」→ 結尾「你說要載我。……早上八點，我家樓下。不要遲到。」
  S32_DATE   交往中（讀檔時才開始交往＝2027-11-18 以後、臺灣路線）：選「四個多月很快。」以後多兩句「四個多月。……視訊我排好了，每個禮拜一次。」「時差你不要算，我來算。」
  S32_NO     回「明天下午不行。」→ 她回「好。我自己去。」、沒有排出遊；睡到 7/29、手機「等到傍晚」→ 18:00「📷（一個普通的行李箱鎖）」「買好了。」、記 SIS_PREDEPART＝missed
  S32_US     美國路線（和她同一班飛機，有自己的出發）：7/28 21:00～21:30 沒有這則私訊、沒有 7/29 的出遊
  S32_JP     日本路線（人在日本，8/5 才回來）：【讀資料，不是玩】日本的據點是選單、時間不會自己走——讀檔到 7/28 22:30（日本時間＝臺灣 21:30）以後叫一次手機規則，看有沒有這則私訊
  S34_IV     朋友、【前置：大三上 10/16 陪她去訪談＝SIS_INTERVIEW went＋記憶】：2029-05-28 20:51 宿舍 → 21:00 家族群組「學姊明天下午四點口試！」→ 睡到 5/29 → 手機「等到下午」→ 15:35「出發：學姊的口試」→
             「……好。我請大家喝飲料。販賣機的。」後面接「致謝裡有你。」「那一句『他講到這裡，停了很久』，我用在第四章了。」；沒有「致謝裡有你。寫的是研究助理。」
  S34_NOIV   同上但沒去訪談：這兩句都不出
  S34_DATE_IV 交往中＋去過訪談：「你坐這裡就好。」後面接「第四章那一句，是你記的。」；沒有不交往的那兩句
  W1_LATE    使用者存檔（大一沒認識學姊：沒有 met_sis／FIRST_MET）跳到大二上 2026-09-14（一）19:06 宿舍 → 手機「地點」到 Café（她不在就去法圖）→ 走過去找她說話 → W1 晚到版
             （開頭旁白照地點、「學姊好，我是{name}，妳的直屬學弟。」…選「大一太忙了。」→「嗯。大一都很忙。……我也是。」…「以後有問題，私訊我。……這次記得問。」）；
             記 met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET、關係＋3；沒有大一 W1 的句子；再找她說話不再演
  W1_LATE_NODM 【前置：大二上用晚到版認識她＝met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET、熟 5】2026-09-21 20:51：21:00～21:20 沒有「明天中午有空嗎。」（2-1 要熟悉以上）、沒有排研究室
  ORAL_AM    BUG-SIS-ORAL-SCHED-1022（LAWWW a3d2185d）：2029-05-29（二）09:54 宿舍，學姊＝朋友 → 手機「朋友」寫「口試（霖澤館的研究室）」→ 手機「地點」到總圖 3F，她不在
  KAI_Y1     大一 2025-10-01（三）21:00 宿舍 203：房間裡有阿凱（書桌）、手機「朋友」阿凱寫「就在這裡」（對照組）
  KAI_Y2     BUG-KAI-Y2-SCHED-1022（LAWWW c89f17df）：大二 2026-10-01（四）21:00 宿舍 312：手機「朋友」阿凱寫「在他那棟宿舍」、沒有「就在這裡」；房間裡沒有他
【前置】讀使用者存檔改日期、時間、地點（每個情境寫在 run.setup）；quiet_events（條件事件不演、要回的訊息不自己打開手機；手機訊息、出遊、找人說話（interact 事件）照常）。
使用者存檔裡和可昕交往中（romance）：讀檔前拿掉（不然每個情境都變成「同時和可昕交往」），dating_* 全部 false（同 aa379b_probe.py）。
路線、Y4_PATH other（不跳「大四要怎麼過」）、美國的 X1_US（不演 7/25 退宿）、日本的 X1_JP／JP_DEPARTED、情境自己的前置旗標：讀檔前寫進存檔。
讀檔後在頁面裡設學姊的關係（熟悉／朋友／交往中）、已經認識（met_sis、W1、FIRST_MET）、聯絡方式、去過 Café／法圖；W1_LATE 不動學姊。
之後照玩家：手機回訊息、床上睡覺、手機「跳過時間」、手機「地點」前往、走過去按說話、選項、時間到了按「出發」。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=S32_GO,... python3 aa379c_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
# ---- 照 AA_379 第 3、4 節原文（{name}＝玩家名字）
CAFE_NAME = '兩點半 Café'; NOVEL = '在看小說'
PD_DM = ['明天下午有空嗎。', '我要去買行李箱的鎖。……順便走一走。']; PD_OPTS = ['好。', '明天下午不行。']; PD_NO = '好。我自己去。'
PD_OPEN = ['（騎樓下。她挑鎖挑了很久，最後買了最普通的那一個。）', '那邊沒有騎樓。下雨要自己撐傘。', '……我傘帶了兩把。一把會忘在某個地方。']
PD_A = ['嗯。……計畫本排到十二月了，排完就覺得很快。']; PD_B = ['會想 Café 的熱水。……那邊的飲水機要按很久。']
PD_DATE = ['四個多月。……視訊我排好了，每個禮拜一次。', '時差你不要算，我來算。']
PD_RIDE = '你說要載我。……早上八點，我家樓下。不要遲到。'; PD_NORIDE = '群組那則，是寫給大家的。'; PD_LOOK = '她看了你一眼，沒有再說'
PD_MISS = ['📷（一個普通的行李箱鎖）', '買好了。']
M9_GRP = '學姊明天下午四點口試！大家去門口等！'
M9 = ['（研究室門口的長椅，門上貼著「口試中」。）', '（門開了。她出來。研究室的同學先鼓掌。）', '過了。', '……你們怎麼都還在？', '等妳。大家都是。']
M9_DRINK = '……好。我請大家喝飲料。販賣機的。'; M9_SIT = ['（她在你旁邊坐下。）', '你坐這裡就好。']
M9_IV = ['致謝裡有你。', '那一句『他講到這裡，停了很久』，我用在第四章了。']; M9_IV_DATE = '第四章那一句，是你記的。'; M9_RA = '致謝裡有你。寫的是研究助理。'
W1L_OPEN = {'cafe': '（她坐在靠窗的位子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）',
            'lawlib': '（她坐在法圖最裡面那張桌子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）',
            'library': '（她坐在靠窗的位子讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）',
            'library_hall': '（她坐在長桌的一角讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'}
W1L = ['學姊好，我是{name}，妳的直屬學弟。', '（抬頭）……{name}。', '家族群組裡的那個名字。家聚你一次都沒來。', '我還以為，你是不需要學姊的那種人。']
W1L_A = ['嗯。大一都很忙。……我也是。']; W1L_B = ['晚上我大多在 Café 或法圖。……不難找。']
W1L_END = ['溫書瑀。現在在念研究所。', '以後有問題，私訊我。……這次記得問。']
W1_Y1 = ['開學還習慣嗎？', '民法你選哪個老師？']
LAB_DM = '明天中午有空嗎。'
GO_PD = ('學姊', '書瑀', '公館', '鎖', '行李箱', '走一走'); GO_M9 = ('學姊的口試',)


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
    run.check('%s：照 AA_379 依序演出（%d 句）' % (sid, len(exp)), miss is None, ('缺「%s」｜實際：' % miss if miss else '') + json.dumps(T[:40], ensure_ascii=False)[:900])
    for a in absent: run.check('%s：沒有「%s」' % (sid, a[:24]), a.replace('{name}', name) not in T, '')
    if flag: run.check('%s：記 %s＝%s' % (sid, flag[0], flag[1]), (flags or {}).get(flag[0]) == flag[1], json.dumps(flags, ensure_ascii=False))
    return T


async def launch(p, run, base, key, h, zone, lv, dating=False, flags=None, mems=None, label=''):
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


# ---------------------------------------------------------------- 3-1 大一寒假
async def s31(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    parts = ((('2026-02-05', 14.5, True, True), ('2026-02-13', 16.2, True, True)) if sid == 'S31_CAFE' else
             (('2026-02-03', 15.0, False, True), ('2026-02-14', 15.0, False, True), ('2026-02-16', 15.0, False, False)))
    for key, h, there, visit in parts:
        tag = '%s-%s' % (sid, key); r0 = res.setdefault(key, {})
        b, pg, cdp, errs, r, name = await launch(p, run, base, key, h, 'dorm', 'FAMILIAR', label=tag)
        try:
            await drive(pg, cdp, run, max_s=30, label=tag)
            st = await pg.evaluate(STATE); row = await friends_row(pg, cdp, run, ID, tag); txt = (row or {}).get('text') or ''; r0['row'] = txt; r0['at'] = st
            if there: run.check('%s：%s %s 手機「朋友」學姊在「%s（%s…）」' % (tag, st['key'], '%05.2f' % st['h'], CAFE_NAME, NOVEL), CAFE_NAME in txt and NOVEL in txt, txt[:200])
            else: run.check('%s：%s %s 手機「朋友」學姊不在 Café（AA：在家）' % (tag, st['key'], '%05.2f' % st['h']), bool(txt) and CAFE_NAME not in txt and NOVEL not in txt, txt[:200])
            if visit:
                went = await quick_go(pg, cdp, 'cafe'); her = None; t0 = time.time()
                while went and time.time() - t0 < (60 if there else 30):
                    her = await pg.evaluate(HER)
                    if her: break
                    await pg.wait_for_timeout(2000)
                r0['her'] = her; await run.shot(pg, '%s_cafe' % tag)
                if there: run.check('%s：手機「地點」到 Café，她在' % tag, went and bool(her), json.dumps({'went': went, 'her': her, 'now': await pg.evaluate(STATE)}, ensure_ascii=False))
                else: run.check('%s：手機「地點」到 Café，她不在' % tag, went and not her, json.dumps({'went': went, 'her': her, 'now': await pg.evaluate(STATE)}, ensure_ascii=False))
            r0['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False))
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


# ---------------------------------------------------------------- 3-2 出國前最後一個週六
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'Y4_PATH': 'other'}
PD = {'S32_GO': dict(lv='FAMILIAR', dating=False, flags={}, reply=PD_OPTS[0], picks=['四個多月很快'], exp=PD_OPEN + PD_A + [PD_NORIDE], absent=[PD_RIDE] + PD_DATE + PD_B),
      'S32_RIDE': dict(lv='FRIEND', dating=False, flags={'SIS_RIDE_ASK': 'yes', 'SIS_RIDE': 'two'}, reply=PD_OPTS[0], picks=['會想回來嗎'], exp=PD_OPEN + PD_B + [PD_RIDE], absent=[PD_NORIDE] + PD_DATE + PD_A),
      'S32_DATE': dict(lv='FRIEND', dating=True, flags={}, reply=PD_OPTS[0], picks=['四個多月很快'], exp=PD_OPEN + PD_A + PD_DATE + [PD_NORIDE], absent=[PD_RIDE]),
      'S32_NO': dict(lv='FAMILIAR', dating=False, flags={}, reply=PD_OPTS[1], picks=[], exp=[], absent=[])}


def pd_out(Q):
    return [q for q in Q if q['d'] == '2028-07-29' and abs(q['h'] - 15) < 0.01]


async def s32(p, run, base, sid, out):
    res = out.setdefault(sid, {}); C = PD[sid]
    pre = {'S32_RIDE': '（前置：7/26 群組按過「我送妳。我有車。」＝SIS_RIDE_ASK yes、SIS_RIDE two）', 'S32_DATE': '（交往中：讀檔時才開始交往＝2027-11-18 以後）'}.get(sid, '')
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2028-07-28', 20.85, 'dorm', C['lv'], dating=C['dating'], flags=dict(TWF, **C['flags']), label=sid + '（臺灣路線）' + pre)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        cond = "(GAME.G.msgs||[]).some(m=>m.th===%s&&m.text===%s)||GAME.G.hour>=21.5" % (json.dumps(TH), json.dumps(PD_DM[0]))
        await wait_for(pg, cdp, run, cond, max_s=420, label=sid); await pg.wait_for_timeout(2500)
        M = await msgs(pg); mine = [m for m in M if m['text'] in PD_DM]; res['dm'] = M[-4:]
        ask = await find_ask(pg, TH, PD_DM[1]); res['ask'] = ask
        run.check('%s：7/28 21:00 她私訊「%s」（回覆：%s）' % (sid, '」「'.join(PD_DM), '／'.join(PD_OPTS)),
                  [m['text'] for m in mine][-2:] == PD_DM and all(m['d'] == '2028-07-28' and m['h'] >= 21.0 for m in mine[-2:]) and bool(ask) and ask['opts'] == PD_OPTS,
                  json.dumps({'now': await pg.evaluate(STATE), 'msgs': M[-3:], 'ask': ask}, ensure_ascii=False)[:500])
        if not ask: raise RuntimeError('沒有收到 7/28 21:00 的私訊（還沒實作？），後面不玩')
        got = await answer(pg, cdp, run, TH, ask['id'], C['reply'], sid); res['answered'] = got
        await pg.wait_for_timeout(4000); M2 = await msgs(pg); Q = await pg.evaluate(OUTQ); res['out'] = Q
        if sid == 'S32_NO':
            run.check('%s：回「%s」→ 她回「%s」、沒有排 7/29 的出遊' % (sid, C['reply'], PD_NO), any(m['text'] == PD_NO for m in M2) and not pd_out(Q), json.dumps({'msgs': M2[-3:], 'out': Q}, ensure_ascii=False)[:400])
        else:
            o = pd_out(Q)
            run.check('%s：回「好。」→ 排 7/29 15:00 的出遊（%s）' % (sid, (o[0]['title'] + '／' + o[0]['place']) if o else '—'), bool(o) and o[0]['state'] == 'planned', json.dumps(Q, ensure_ascii=False)[:400])
        ops, slept = await sleep_night(pg, cdp, run, sid); st = await pg.evaluate(STATE); res['morning'] = st
        run.check('%s：上床「睡到明天」→ 7/29 早上' % sid, st['key'] == '2028-07-29', json.dumps({'床': ops, 'now': st}, ensure_ascii=False)[:300])
        if sid == 'S32_NO':
            await skip(pg, cdp, '等到傍晚', sid); await wait_for(pg, cdp, run, "GAME.G.hour>=18.08", max_s=420, label=sid)
            await drive(pg, cdp, run, max_s=30, label=sid)
            M3 = await msgs(pg); fl = await pg.evaluate(FLAGS); res['msgs_after'] = M3[-4:]; res['flags'] = fl
            gotm = [m for m in M3 if m['text'] in PD_MISS]
            run.check('%s：沒去＝7/29 18:00 她傳「%s」' % (sid, '」「'.join(PD_MISS)), [m['text'] for m in gotm] == PD_MISS and all(m['d'] == '2028-07-29' and abs(m['h'] - 18) < 0.05 for m in gotm), json.dumps(M3[-4:], ensure_ascii=False)[:400])
            run.check('%s：記 SIS_PREDEPART＝missed' % sid, fl.get('SIS_PREDEPART') == 'missed', json.dumps(fl, ensure_ascii=False))
        else:
            await skip(pg, cdp, '等到下午', sid)
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            ok, ch = await wait_for(pg, cdp, run, "(GAME.G.flags.SIS_PREDEPART!=null&&!(typeof ADV!=='undefined'&&ADV.active))||GAME.G.hour>=17.6", max_s=900, picks=C['picks'], go_keys=GO_PD, label=sid, shot_at=PD_OPEN[0][:8])
            await drive(pg, cdp, run, max_s=40, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; res['ch'] = ch; fl = await pg.evaluate(FLAGS); res['flags'] = fl
            prompt = [c for c in ch if any(is_go(o, GO_PD) for o in c['opts'])]
            run.check('%s：7/29 時間到跳出「出發」（%s）' % (sid, prompt[0]['pick'] if prompt else '—'), bool(prompt) and 14.0 <= float(prompt[0]['at'].split()[1]) <= 15.3, json.dumps(ch[:5], ensure_ascii=False)[:500])
            T = lines_check(run, sid, log, name, C['exp'], absent=C['absent'], flag=('SIS_PREDEPART', 'went'), flags=fl)
            if sid != 'S32_RIDE': run.check('%s：結尾旁白「（%s。）」' % (sid, PD_LOOK), any(PD_LOOK in t for t in T), json.dumps(T[-6:], ensure_ascii=False)[:300])
            await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s32_none(p, run, base, sid, out):
    """S32_US：照玩家等到 21:30；S32_JP：【讀資料，不是玩】日本的據點是選單，時間不會自己走"""
    res = out.setdefault(sid, {})
    if sid == 'S32_US':
        fl = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'X1_US': {'$day': '2028-07-25'}}
        b, pg, cdp, errs, r, name = await launch(p, run, base, '2028-07-28', 20.85, 'wenzhou', 'FAMILIAR', flags=fl, label=sid + '（美國路線、7/25 退宿過了＝X1_US；在溫州街）')
    else:
        fl = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'X1_JP': {'$day': '2028-02-20'}, 'JP_DEPARTED': {'$day': '2028-03-25'}, 'AN_SENDOFF': 'together'}
        b, pg, cdp, errs, r, name = await launch(p, run, base, '2028-07-28', 22.5, 'jp_hub', 'FAMILIAR', flags=fl, label=sid + '（日本路線、人在日本；日本時間 22:30＝臺灣 21:30；據點）')
    try:
        if sid == 'S32_US':
            await drive(pg, cdp, run, max_s=30, label=sid)
            ok, ch = await wait_for(pg, cdp, run, "GAME.G.hour>=21.5", max_s=420, label=sid); res['ch'] = ch
            run.check('%s：照玩家等到 21:30' % sid, ok, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        else:
            res['rules'] = await pg.evaluate("(()=>{ try{ STORY.phoneRules(GAME); PHONE.tick(GAME.G); return {ok:true, inJapan:!!(STORY.inJapan&&STORY.inJapan(GAME.G))}; }catch(e){ return {err:String(e)}; } })()")
            run.setup('[讀資料，不是玩] %s：讀檔後叫一次 STORY.phoneRules＋PHONE.tick → %s' % (sid, json.dumps(res['rules'], ensure_ascii=False)))
        M = await msgs(pg); Q = await pg.evaluate(OUTQ); res['msgs'] = M[-3:]; res['out'] = Q
        run.check('%s：沒有「%s」那則私訊、沒有 7/29 15:00 的出遊' % (sid, PD_DM[0]), not any(m['text'] in PD_DM for m in M) and not pd_out(Q), json.dumps({'msgs': M[-3:], 'out': Q}, ensure_ascii=False)[:400])
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 3-4 口試那天
M9C = {'S34_IV': dict(dating=False, iv=True, exp=M9 + [M9_DRINK] + M9_IV, absent=[M9_RA, M9_IV_DATE] + M9_SIT),
       'S34_NOIV': dict(dating=False, iv=False, exp=M9 + [M9_DRINK], absent=[M9_RA, M9_IV_DATE] + M9_IV),
       'S34_DATE_IV': dict(dating=True, iv=True, exp=M9 + M9_SIT + [M9_IV_DATE], absent=[M9_RA, M9_DRINK] + M9_IV)}


async def s34(p, run, base, sid, out):
    res = out.setdefault(sid, {}); C = M9C[sid]
    fl = dict(TWF, **({'SIS_INTERVIEW': 'went'} if C['iv'] else {}))
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2029-05-28', 20.85, 'dorm', 'FRIEND', dating=C['dating'], flags=fl, mems=(['SIS_INTERVIEW'] if C['iv'] else []),
                                              label=sid + ('（前置：大三上 10/16 陪她去訪談＝SIS_INTERVIEW went＋記憶）' if C['iv'] else '（沒去訪談）') + ('（交往中）' if C['dating'] else ''))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th===%s&&m.text===%s)||GAME.G.hour>=21.5" % (json.dumps(FAM), json.dumps(M9_GRP)), max_s=420, label=sid)
        await pg.wait_for_timeout(2500); G0 = await msgs(pg, FAM); Q = await pg.evaluate(OUTQ); res['grp'] = G0[-3:]; res['out0'] = Q
        run.check('%s：5/28 21:00 家族群組「%s」、排好 5/29 16:00 學姊的口試' % (sid, M9_GRP), any(m['text'] == M9_GRP for m in G0) and any(q['id'] == 'y4_m9' and q['d'] == '2029-05-29' and q['state'] == 'planned' for q in Q),
                  json.dumps({'grp': G0[-2:], 'out': Q}, ensure_ascii=False)[:400])
        ops, slept = await sleep_night(pg, cdp, run, sid); st = await pg.evaluate(STATE); res['morning'] = st
        run.check('%s：上床「睡到明天」→ 5/29 早上' % sid, st['key'] == '2029-05-29', json.dumps({'床': ops, 'now': st}, ensure_ascii=False)[:300])
        await skip(pg, cdp, '等到下午', sid)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        ok, ch = await wait_for(pg, cdp, run, "(GAME.G.flags.SIS_DEFENSE!=null&&!(typeof ADV!=='undefined'&&ADV.active))||GAME.G.hour>=18.6", max_s=1200, go_keys=GO_M9, label=sid, shot_at=M9[0][:8])
        await drive(pg, cdp, run, max_s=40, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; res['ch'] = ch; flg = await pg.evaluate(FLAGS); res['flags'] = flg
        prompt = [c for c in ch if any(is_go(o, GO_M9) for o in c['opts'])]
        run.check('%s：5/29 時間到跳出「出發：學姊的口試」' % sid, bool(prompt), json.dumps(ch[:4], ensure_ascii=False)[:400])
        lines_check(run, sid, log, name, C['exp'], absent=C['absent'], flag=('SIS_DEFENSE', 'there'), flags=flg)
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 第 4 節 W1 晚到版
async def s_w1(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2026-09-14', 19.1, 'dorm', None, label=sid + '（大一沒認識學姊的使用者存檔；晚上 19:06 在宿舍）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        f0 = await pg.evaluate(FLAGS); res['before'] = f0
        run.check('%s：前置——大一沒認識她（沒有 met_sis、SIS_W1、FIRST_MET）' % sid, not f0.get('met_sis') and not f0.get('SIS_W1') and 'FIRST_MET' not in f0.get('mem', []), json.dumps(f0, ensure_ascii=False))
        log = None; where = None
        for zone in ('cafe', 'lawlib'):
            went = await quick_go(pg, cdp, zone); st = await pg.evaluate(STATE)
            say('   %s 手機「地點」到 %s：%s' % (sid, zone, json.dumps(st, ensure_ascii=False)))
            if not went: continue
            log = await talk_her(pg, cdp, run, ['大一太忙了'], sid, wait_s=45)
            if log is not None: where = zone; break
            await run.shot(pg, '%s_noher_%s' % (sid, zone))
        res['where'] = where
        if log is None:
            run.check('%s：9/14 晚上在 Café 或法圖找得到她' % sid, False, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        else:
            fl = await pg.evaluate(FLAGS); res['log'] = log; res['flags'] = fl
            T = lines_check(run, sid, log, name, [W1L_OPEN[where]] + W1L + W1L_A + W1L_END, absent=W1_Y1 + W1L_B)
            run.check('%s：記 met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET' % sid, fl.get('met_sis') is True and fl.get('SIS_W1') is True and fl.get('SIS_W1_LATE') is True and 'FIRST_MET' in fl.get('mem', []), json.dumps(fl, ensure_ascii=False))
            run.check('%s：關係＋3（熟 %s → %s）' % (sid, f0.get('fam'), fl.get('fam')), (fl.get('fam') or 0) - (f0.get('fam') or 0) >= 3, json.dumps({'before': f0, 'after': fl}, ensure_ascii=False)[:300])
            await run.shot(pg, '%s_after' % sid)
            log2 = await talk_her(pg, cdp, run, ['就這樣'], sid + '_2', wait_s=30); res['log2'] = log2
            T2 = texts(log2 or [], name)
            run.check('%s：再找她說話不再演' % sid, log2 is not None and W1L[0].replace('{name}', name) not in T2 and W1L_END[1] not in T2, json.dumps(T2[:6], ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_w1_nodm(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2026-09-21', 20.85, 'dorm', 'LATE', label=sid + '（前置：大二上用晚到版認識她＝met_sis、SIS_W1、SIS_W1_LATE、FIRST_MET、熟 5）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok0 = r.get('ok') if isinstance(r.get('ok'), dict) else {}
        run.check('%s：前置——只認識（SISY23.ok 熟悉＝false）' % sid, r.get('stage') == 'ACQUAINTANCE' and ok0.get('FAMILIAR') is False, json.dumps(r, ensure_ascii=False))
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.hour>=21.35", max_s=420, label=sid)
        M = await msgs(pg); Q = await pg.evaluate(OUTQ); res['msgs'] = M[-3:]; res['out'] = Q; res['ch'] = ch
        run.check('%s：9/21 21:00～21:20 沒有「%s」、沒有排研究室' % (sid, LAB_DM), ok and not any(m['text'] == LAB_DM for m in M) and not any(q['id'] == 'sisy23_lab' for q in Q), json.dumps({'msgs': M[-2:], 'out': Q}, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['W1_LATE', 'W1_LATE_NODM', 'S31_CAFE', 'S31_OUT', 'S32_GO', 'S32_RIDE', 'S32_DATE', 'S32_NO', 'S32_US', 'S32_JP', 'S34_IV', 'S34_NOIV', 'S34_DATE_IV', 'ORAL_AM', 'KAI_Y1', 'KAI_Y2']
FN = {'W1_LATE': s_w1, 'W1_LATE_NODM': s_w1_nodm, 'S31_CAFE': s31, 'S31_OUT': s31, 'S32_GO': s32, 'S32_RIDE': s32, 'S32_DATE': s32, 'S32_NO': s32, 'S32_US': s32_none, 'S32_JP': s32_none,
      'S34_IV': s34, 'S34_NOIV': s34, 'S34_DATE_IV': s34}


# ---------------------------------------------------------------- LAWWW 10-22 06:24 派的兩件作息修正（BB 05:02 回報；開發分支 1a9b5761 起）
KAI = """(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='kai'||x.id==='kai')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.pose||'',n.id]:null; })()"""
ORAL_AWAY = '口試（霖澤館的研究室）'


async def s_oral(p, run, base, sid, out):
    """ORAL_AM：BUG-SIS-ORAL-SCHED-1022（a3d2185d）——2029-05-29（二）她 16:00 口試：上午手機「朋友」寫「口試（霖澤館的研究室）」、手機「地點」到總圖 3F 她不在"""
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2029-05-29', 9.9, 'dorm', 'FRIEND', flags=TWF, label=sid + '（口試那天上午）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        st = await pg.evaluate(STATE); row = await friends_row(pg, cdp, run, ID, sid); txt = (row or {}).get('text') or ''; res['row'] = txt; res['at'] = st
        run.check('%s：%s %05.2f 手機「朋友」學姊寫「%s」' % (sid, st['key'], st['h'], ORAL_AWAY), ORAL_AWAY in txt, txt[:200])
        went = await quick_go(pg, cdp, 'library_hall')   # 手機「地點」只有總圖（大廳）；3F 閱覽區照玩家從二樓樓梯間走上去（同 aa378_probe MEET）
        if went:
            it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'&&!q.hidden); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
            if it:
                await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=180, lv=it[2]); await L.tap(pg, cdp, '#interact')
                for _ in range(40):
                    await pg.wait_for_timeout(1000)
                    if (await pg.evaluate("GAME.G.zone")) == 'library': break
                await pg.wait_for_timeout(4000)
            went = (await pg.evaluate("GAME.G.zone")) == 'library'
        her = None; t0 = time.time()
        while went and time.time() - t0 < 30:
            her = await pg.evaluate(HER)
            if her: break
            await pg.wait_for_timeout(2000)
        res['her'] = her; await run.shot(pg, '%s_library' % sid)
        run.check('%s：手機「地點」到總圖 3F（%s），她不在' % (sid, (await pg.evaluate(STATE))['h']), went and not her, json.dumps({'went': went, 'her': her, 'now': await pg.evaluate(STATE)}, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_kai(p, run, base, sid, out):
    """KAI_Y1：大一 2025-10-01（三）21:00 宿舍 203＝阿凱在房間（書桌）、手機「朋友」寫「就在這裡」；
    KAI_Y2：BUG-KAI-Y2-SCHED-1022（c89f17df）——大二 2026-10-01（四）21:00 宿舍 312＝手機「朋友」阿凱寫「在他那棟宿舍」、沒有「就在這裡」，房間裡沒有他"""
    res = out.setdefault(sid, {}); y2 = sid == 'KAI_Y2'
    key = '2026-10-01' if y2 else '2025-10-01'
    b, pg, cdp, errs, r, name = await launch(p, run, base, key, 21.0, 'dorm', None, label=sid + ('（大二上晚上，312）' if y2 else '（大一上晚上，203）'))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); await pg.wait_for_timeout(3000)
        st = await pg.evaluate(STATE); kai = await pg.evaluate(KAI); res['kai'] = kai; res['room'] = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {ROOM_Y2:F.ROOM_Y2||null, kaiRoommate:typeof STORY!=='undefined'&&STORY.kaiRoommate?STORY.kaiRoommate(GAME.G):null}; })()")
        await run.shot(pg, '%s_room' % sid)
        row = await friends_row(pg, cdp, run, 'kai', sid); txt = (row or {}).get('text') or ''; res['row'] = txt; res['at'] = st
        if y2:
            run.check('%s：%s %05.2f 手機「朋友」阿凱寫「在他那棟宿舍」、沒有「就在這裡」' % (sid, st['key'], st['h']), '在他那棟宿舍' in txt and '就在這裡' not in txt, txt[:200])
            run.check('%s：房間裡沒有阿凱' % sid, not kai, json.dumps({'kai': kai, 'room': res['room']}, ensure_ascii=False))
        else:
            run.check('%s：%s %05.2f 房間裡有阿凱（書桌）' % (sid, st['key'], st['h']), bool(kai), json.dumps({'kai': kai, 'room': res['room']}, ensure_ascii=False))
            run.check('%s：手機「朋友」阿凱寫「就在這裡」' % sid, '就在這裡' in txt, txt[:200])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


FN.update({'ORAL_AM': s_oral, 'KAI_Y1': s_kai, 'KAI_Y2': s_kai})


async def main():
    run = L.Run('aa379c', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa379c.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
