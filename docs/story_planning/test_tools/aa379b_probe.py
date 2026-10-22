"""BB（帳號 A）2026-10-22：AA379-SIS-Y2Y3-1021 學姊大二到大三的八場（AA_379 第 2 節；開發分支 e41dd8c0 起）——照 2-8 的 BB 測試。
台詞對照（讀碼）另外做過：src/data/sis_y2y3_events.js 每一句和 AA_379 第 2 節一字不差（BB_218）。這支測玩家玩得到的：私訊什麼時候來、回覆、出遊、說話前接演、生日、電話、只認識時八場都不出現。
下面的「應該演的台詞」照 AA_379 第 2 節原文寫（不是照程式），瀏覽器裡演出來的每一句要依序出現。
  LAB_SKIP   【前置：已回「好。」】9/22 08:00 手機「等到下午（14:00）」：跳過時間會不會停在 12:20 研究室的出發前（手機寫「遇到…約好的時間…會停下來」）
  RESULT_SLEEP 2028-03-15 21:00 上床「睡到明天」：21:30 她的電話會不會響（sis_y2y3_3d.js S.result 的註解寫「快轉、睡覺會停在電話」）
  LAB_GO     大二上 9/21 21:00 私訊兩則＋回覆「好。」「明天中午有課。」→ 回「好。」→ 9/22 睡醒、手機「等到中午」→ 研究室「出發」→ 選「（幫她把最重的那一排推進去）」；沒有交往中那兩句；傍晚 18:00 以後沒有「搬完了。」
  SEM_ASK    11/17 21:00 私訊 →「好。」→ 11/18 傍晚 → 19:00 法圖・討論室 → 選「妳為什麼選這個題目？」（記 asked）；沒有「你坐第一排」
  TOPIC_LIB  【前置：SIS_SEMINAR_Y2＝asked】大二下第 5 週週三（2027-03-24）19:06 手機「地點」到法圖，找她說話＝接在前面演 2-3（有「你上次問我為什麼…」）→ 演完照常說話；再說一次不再演
  BDAY1      2026-06-02（二）12:10 家族群組 Kevin「今天溫學姊生日🎂」→ 晚上 Café 找她說話＝生日（「下禮拜畢業…」）→ 選茶葉
  IV         大三上 10/15（五）21:00 私訊（朋友以上）→「好。」→ 10/16 早上 → 09:00 法扶 → 便利商店門口；記憶 SIS_INTERVIEW
  US_LIB     2027-11-03（三）法圖說話＝接在前面演 2-6 一般版 → 選「那妳會回來吧？」
  RESULT     大三下 2028-03-15 21:30 電話（臺灣路線、朋友）→「要慶祝嗎？」
  US_STEPS   11/1～11/9 沒遇到：11/11 21:00「明天中午，總圖門口的台階。」→ 11/12 12:20 →「去啊。」
  TOPIC_STEPS 第 5～10 週沒遇到：第 11 週週三（2027-05-05）21:00「法圖外面的台階。等你十分鐘。」→「出發」→ 台階版
  BDAY_DATE  交往中：2027-06-01 21:00「明天我生日。」「晚上七點，法圖旁邊那家。我訂了。」→ 6/2 12:10 Kevin → 19:00「出發」→ 自己訂的那一版；「生日快樂。」→「你今天穿得比平常好看。」＋回去的路上
  US_DATE    交往中：2027-11-04（四）Café：「你們系的交換名單…」「你如果去，我們同一班飛機。」→「（握住她的手）」
  RESULT_US  交往中、美國路線：「八月二號。我們同一班。」→「我現在過去。」
  LAB_NO     回「明天中午有課。」→ 她回「好。我自己搬兩趟。」、沒有出遊；9/22 傍晚 18:00「📷（排好的書架）」「搬完了。」、記 missed
  SEM_NO     回「明天晚上不行。」→「好。那我對著牆講。」；睡到隔天，11/18 22:00 那則「講完了。牆沒有意見。」
  IV_NOREPLY 不回 → 隔天下午看得到 10/16 12:30「訪談完了。錄音有雜音，我自己聽了兩遍。」、記 missed
  EX         分手過（EX_heroine_05，LAWWW 02:50 加的）：熟悉以上但前任＝9/21 晚上沒有私訊、2027-11-03 法圖說話不演 2-6、2028-03-15 沒有電話
             （「她在美國的時候也不出現」：八場的日子都在她 2028-08 出發以前、玩家出國以前，沒有重疊的日子可以測，NOT TESTED）
  NONE       只認識（ACQUAINTANCE）：9/21 晚上沒有私訊、2027-03-24 法圖說話不演 2-3、2027-11-03 不演 2-6、2026-06-02 群組有 Kevin（認識就收得到）但找她說話不演生日、2028-03-15 沒有電話
  LAB_DATE   交往中：研究室選「照顏色排？」；多便條那一段＋「……你的。」
  TOPIC_CAFE 交往中、沒問過：第 5 週週一（2027-03-22）Café → 沒有「你上次問我」、最後多「我爸媽還不知道…」；選「那個阿姨後來呢？」
  BDAY2      【前置：SIS_LAB_DESK＝went】2027-06-02（三）法圖：生日（「碩一過完一年了…坐墊」）→ 選保溫瓶
  RESULT_TW  交往中、臺灣路線：「八月二號。……你要來送我。」→「恭喜。」
【前置】讀使用者存檔改日期、時間、地點（每個情境寫在 run.setup）；quiet_events（條件事件不演、要回的訊息不自己打開手機；手機訊息、出遊、說話照常）；
讀檔後在頁面裡設她的關係（只認識／熟悉／朋友／交往中）、已經認識（met_sis、W1 演過）、聯絡方式、去過 Café／法圖、路線旗標。之後照玩家：手機回訊息、床上睡覺、手機「跳過時間」、
手機「地點」前往、走過去按說話、選項、時間到了按「出發」「接起來」。Playwright 手機橫向模擬、?turbo（每格最多 0.3 秒），不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=LAB_GO,... python3 aa379b_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
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
OUTQ = """(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^sisy23_/.test(q.id||'')).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, h:+(+q.h).toFixed(3), state:q.state, title:q.title||'', alarm:!!q.alarm})))()"""
FLAGS = """(()=>{ const F=GAME.G.flags; const o={}; for(const k of ['SIS_LAB_GO','SIS_LAB_DESK','SIS_SEM_GO','SIS_SEMINAR_Y2','SIS_TOPIC_Y2','SIS_BDAY_Y1','SIS_BDAY_Y2','SIS_IV_GO','SIS_INTERVIEW','SIS_US_TOLD','SIS_US_RESULT']) o[k]=F[k]===undefined?null:F[k];
  o.mem=['SIS_TOPIC','SIS_INTERVIEW','SIS_US_TOLD'].filter(t=>SOCIAL.has('heroine_05',t)); return o; })()"""
SETREL = """(([lv,dating,extra])=>{ const G=GAME.G, ID='heroine_05', F=G.flags; const R=SOCIAL.rel(ID); const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10]}[lv];
  R.fam=V[0]; R.trust=V[1]; R.comf=V[2]; R.rom=0; R.npcRom=0; SOCIAL.remember(ID,'FIRST_MET','');
  F.met_sis=true; F.SIS_W1=true; G.events=G.events||{}; (G.events.done||(G.events.done={})).ev_sis_w1=1;
  G.contacts=G.contacts||{}; G.contacts[ID]=STORY.dayOfKey('2025-09-24'); G.visited=Object.assign(G.visited||{},{cafe:true,lawlib:true,library:true,library_hall:true});
  Object.assign(F,extra||{});
  if(dating){ try{ ROM.start(G,ID); }catch(e){} F['dating_'+ID]=true; R.fam=70; R.trust=60; R.comf=60; R.rom=70; R.npcRom=70; }
  return {stage:SOCIAL.stage(ID), contact:!!(INV.hasContact&&INV.hasContact(G,ID)), dating:F['dating_'+ID]===true, rom:(F.romance||{})[ID]?(F.romance||{})[ID].status:null,
    familyGroup:!!(PHONE.inGroup&&PHONE.inGroup(G,'family_law')), route:STORY.route?STORY.route(G):null,
    ok:typeof SISY23!=='undefined'?{FAMILIAR:SISY23.ok(G,'FAMILIAR'),FRIEND:SISY23.ok(G,'FRIEND')}:'沒有 SISY23'}; })"""
HER = """(()=>{ const n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')&&x.obj&&x.obj.visible!==false&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })()"""
# 每一場應該演的台詞（照 AA_379 第 2 節原文；{name}＝玩家名字）
LAB = ['（研究室有八張桌子。她的在門邊，門一開就撞到椅背。）', '靠門的位子。每個人進來都會撞到我。', '……也好。誰來了我都知道。', '（你把兩箱書搬上桌。她一本一本排上書架，照顏色。）']
LAB_A = ['照顏色好找。照作者，我會一直想要不要調整。']; LAB_B = ['……謝謝。你比電梯可靠。']
LAB_D = ['（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，我在這裡。」）', '……你的。']
SEM = ['（白板上寫著她的報告題目，字很小。她站在白板前，手上是幾張講稿。）', '二十分鐘。中間不要問，最後再問。', '（她講了十九分鐘。講到一半，停下來喝了一口保溫瓶。）', '好了。……哪裡聽不懂？']
SEM_C = ['……這是最後才要問的問題。你先問了。', '下次再回答你。我還沒想好怎麼講。', '好。我回去改。……你先回宿舍，很晚了。']; SEM_D = '你坐第一排，我比較不會看錯地方。'
TOPIC0 = ['我想寫的東西，找到了。', '債務清理案件的法律扶助。……題目還要再改，方向不會變了。']; TOPIC_ASKED = '你上次問我為什麼。……我想好怎麼講了。'
TOPIC1 = ['我大二在法服的時候，有一個阿姨拿著一袋信來。全部是銀行寄的。最舊的那一封，是我國小的時候寄的。', '我只能跟她說，這個要去找法扶。', '她說她去過了。排了很久。', '我想知道『很久』是多久。……還有為什麼要那麼久。']
TOPIC_A = ['還沒。所以要寫兩年。']; TOPIC_B = ['……我不知道。那天以後，就沒再見過她。']; TOPIC_D = '我爸媽還不知道。……他們會問，寫這個以後要做什麼。'
BD_NARR = '（她在讀書。保溫瓶旁邊多了一小盒蛋糕，還沒拆。）'; BD_GRP = '群組那則看到了吧。Kevin 每年都發。'
BD_Y1 = '下禮拜畢業。……之後還是在這裡讀書，只是換一張學生證。'; BD_Y2 = '碩一過完一年了。研究室那張靠門的椅子，我換了一個坐墊。'
BD_TEA = ['（看了一下包裝）這家我喝過。……你怎麼知道。', '妳保溫瓶的味道。', '……好。', '（她收進包包）']; BD_WATER = ['這不算禮物。', '……算。']
BD_DATE0 = '我自己訂的。我知道你會想訂，可是你會訂錯家。'; BD_DATE_THX = '謝謝。……你今天穿得比平常好看。'; BD_DATE_END = '（回去的路上，她走得比平常慢。）'
IV = ['（會議室很小。律師講了一個半小時，你打了十一頁。）', '（她把你的筆記從頭滑到尾。）', '你多寫了一句：『他講到這裡，停了很久。』', '……這句我要。錄音裡聽不到這個。']
IV_A = ['在想一個當事人。他沒說是誰。', '……我也沒問。']; IV_D = '（她把你的筆記存進雲端，資料夾的名字是「{name}記的」。）'
US0 = ['明年夏天，我想去美國待一個學期。研究交換。', '八月走，十二月回來。論文的第三章，要在那邊寫。']; US_GEN = '計畫本上寫了很久。今天才決定要跟人說。'
US_A = ['嗯。', '（她把計畫本闔上）', '……你說得好簡單。']; US_B = ['十二月。回程的日子，計畫本上寫好了。我不會改。']
US_DT = ['你們系的交換名單，美國那間我查過了。跟我同一個學期。', '你如果去，我們同一班飛機。']; US_HAND = ['（她沒有說話。手翻過來，握回去。）']
RS0 = '……上了。'; RS_GEN = ['信是下午來的。我看了好幾遍，確定沒有看錯，才打給你。', '八月二號的飛機。……還沒訂，先把日子想好。']
RS_B = ['要。……等我把八月以前的事排完。']; RS_US = '八月二號。我們同一班。'; RS_TW = '八月二號。……你要來送我。'
RS_C = ['嗯。……你先不要掛。我想再聽一下你那邊的聲音。']; RS_D = ['很晚了。……明天中午，研究室。']
OURS = ('出發：研究室', '出發：法圖・討論室', '出發：法圖外面的台階', '出發：她的生日', '出發：陪學姊去訪談', '出發：總圖門口的台階', '接起來：')


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None, go=True):
    """picks（場景裡要選的字，依序找）→ 我們這幾場的「出發／接起來」→ 起床選單「先起床再說」、跳過時間「照樣跳過」、說話完的「就這樣」→ 別人的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    if go:
        for i, o in enumerate(ops):
            if o.startswith(OURS): return i
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


async def drive(pg, cdp, run, picks=None, go=True, max_s=240, label=''):
    """一直點到沒有對話、沒有選項（連續 3 次）；回傳選單紀錄"""
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


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, go=True, label='', shot_at=None):
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立。shot_at＝看到這句台詞時截圖（背景）"""
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
                if ops[k].startswith(OURS): await run.shot(pg, '%s_prompt' % label)
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            if shot_at and not shot:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if shot_at in txt: await run.shot(pg, '%s_scene' % label); shot = True
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def wait_ask(pg, cdp, run, ask_id, max_s=300, label=''):
    return await wait_for(pg, cdp, run, "PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id===%s)" % json.dumps(ask_id), max_s=max_s, label=label)


async def answer(pg, cdp, run, ask_id, want, label=''):
    """照玩家：手機 → 訊息 → 她的對話串 → 點回覆"""
    await phone_tab(pg, cdp, 'msg')
    await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(TH))
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


async def quick_go(pg, cdp, zone):
    await phone_tab(pg, cdp, 'places')
    got = await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got: await L.phone_away(pg, cdp); return False
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); return (await pg.evaluate("GAME.G.zone")) == zone


async def talk_her(pg, cdp, run, picks, label, wait_s=90):
    """找到她（最多等 wait_s 秒她走進來）、走過去、按說話、一直點到結束。回傳這次的台詞紀錄"""
    her = None; t0 = time.time()
    while time.time() - t0 < wait_s:
        her = await pg.evaluate(HER)
        if her: break
        await pg.wait_for_timeout(2000)
    if not her: return None
    await pg.wait_for_timeout(6000)   # 剛走進來的（Café 的她從門口走到座位）先讓她坐好
    btn = ''
    for _ in range(4):   # 她可能還在走：走過去、看按鈕是不是「和她說話」，不是就再靠近一點
        her = await pg.evaluate(HER) or her
        await L.go_to(pg, cdp, run, her[0], her[1], 1.0, '學姊', max_s=150, lv=her[2]); await pg.wait_for_timeout(800)
        btn = (await L.state(pg)).get('interact') or ''
        if '說話' in btn and ('溫書瑀' in btn or '學姊' in btn): break
    say('   %s 按鈕：%s' % (label, btn))
    n0 = len(await pg.evaluate("window.__LOG||[]"))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); await run.shot(pg, '%s_talk' % label)
    await drive(pg, cdp, run, picks=picks, max_s=200, label=label)
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


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


async def launch(p, run, base, key, h, zone, lv, dating=False, flags=None, label=''):
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
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETREL + "(%s)" % json.dumps([lv, dating, flags or {}]))
    name = await pg.evaluate("GAME.G.name||'祐廷'")
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）；學姊＝%s%s、已認識（met_sis、W1）、有聯絡方式、去過 Café／法圖；旗標 %s → %s' % (
        label, key, h, zone, {'ACQ': '只認識', 'FAMILIAR': '熟悉', 'FRIEND': '朋友'}[lv], '＋交往中' if dating else '', json.dumps(flags or {}, ensure_ascii=False), json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (label, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r, name


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def msgs(pg, th=TH):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def lines_check(run, sid, log, name, exp, absent=(), flag=None, flags=None, mem=None):
    T = texts(log, name); miss = in_order(T, exp)
    run.check('%s：照 AA_379 依序演出（%d 句）' % (sid, len(exp)), miss is None, ('缺「%s」｜實際：' % miss if miss else '') + json.dumps(T[:40], ensure_ascii=False)[:900])
    for a in absent: run.check('%s：沒有「%s」' % (sid, a[:24]), a not in T, '')
    if flag: run.check('%s：記 %s＝%s' % (sid, flag[0], flag[1]), (flags or {}).get(flag[0]) == flag[1], json.dumps(flags, ensure_ascii=False))
    if mem: run.check('%s：人物記憶 %s' % (sid, mem), mem in (flags or {}).get('mem', []), json.dumps(flags, ensure_ascii=False))
    return T


# ---------------------------------------------------------------- 情境
async def s_lab_skip(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2026-09-22', 8.0, 'dorm', 'FAMILIAR', flags={'SIS_LAB_GO': True}, label=sid + '（前置：9/21 已經回「好。」＝SIS_LAB_GO）')
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); await pg.wait_for_timeout(3000)
        q0 = await pg.evaluate(OUTQ); res['out0'] = q0
        run.check('%s：9/22 研究室的出遊排好了（12:20）' % sid, any(q['id'] == 'sisy23_lab' and q['state'] == 'planned' and abs(q['h'] - 12.333) < 0.01 for q in q0), json.dumps(q0, ensure_ascii=False))
        await phone_tab(pg, cdp, 'today'); today = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜').slice(0,700)"); res['today'] = today
        await run.shot(pg, '%s_phone_today' % sid); await L.phone_away(pg, cdp)
        got = await skip(pg, cdp, '等到下午', sid); st = await pg.evaluate(STATE); res['after_skip'] = st; res['skip'] = got
        ops = await opts(pg); res['ops'] = ops; q1 = await pg.evaluate(OUTQ); res['out1'] = q1; fl = await pg.evaluate(FLAGS); res['flags'] = fl
        log = await pg.evaluate("window.__LOG||[]"); res['captions'] = [x['t'] for x in log if x['n'] == '［字幕］'][-3:]
        await run.shot(pg, '%s_after_skip' % sid)
        stopped = st['h'] < 12.34 or any(o.startswith('出發：研究室') for o in ops)
        run.check('%s：手機「等到下午（14:00）」停在研究室出發前（手機寫「遇到…約好的時間…會停下來」；這個出遊 alarm＝%s）' % (sid, any(q.get('alarm') for q in q0)), stopped,
                  json.dumps({'跳到': st, '選項': ops, '出遊': q1, '字幕': res['captions'], 'SIS_LAB_DESK': fl.get('SIS_LAB_DESK')}, ensure_ascii=False)[:600])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_result_sleep(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2028-03-15', 21.0, 'dorm', 'FRIEND', flags={'EXCHANGE_ROUTE': 'TW'}, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); await pg.wait_for_timeout(2000)
        q0 = await pg.evaluate(OUTQ); res['out0'] = q0
        run.check('%s：3/15 21:30 的電話排好了' % sid, any(q['id'] == 'sisy23_result' and q['state'] == 'planned' for q in q0), json.dumps(q0, ensure_ascii=False))
        st0 = await pg.evaluate(STATE)
        ops = await bed(pg, cdp, run, '睡到明天', sid); res['bed'] = ops
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d&&!GAME.E.player.busy" % st0['day'], max_s=240, picks=['要慶祝嗎'], label=sid)
        await drive(pg, cdp, run, max_s=40, label=sid); res['ch'] = ch
        fl = await pg.evaluate(FLAGS); res['flags'] = fl; q1 = await pg.evaluate(OUTQ); res['out1'] = q1
        rang = any(any(o.startswith('接起來：') for o in c['opts']) for c in ch)
        run.check('%s：21:00 上床「睡到明天」——21:30 的電話會響（S.result 註解「快轉、睡覺會停在電話」）' % sid, rang or fl.get('SIS_US_RESULT') == 'call',
                  json.dumps({'床的選項': ops, '選單': ch[:4], 'SIS_US_RESULT': fl.get('SIS_US_RESULT'), '出遊': q1}, ensure_ascii=False)[:700])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ASKS = {  # 私訊約隔天（2-1、2-2、2-5）
    'LAB': dict(ask='sisy23_lab_ask', key='2026-09-21', lines=['明天中午有空嗎。', '研究室分到位子了。書有兩箱，電梯在修。'], opts=['好。', '明天中午有課。'], no='好。我自己搬兩趟。',
                out='sisy23_lab', od='2026-09-22', oh=12.333, flag='SIS_LAB_DESK', missed=['📷（排好的書架）', '搬完了。'], mh=18.0, lv='FAMILIAR'),
    'SEM': dict(ask='sisy23_sem_ask', key='2026-11-17', lines=['明天晚上七點，法圖的討論室。', '我要練一次 seminar 的報告。需要一個不是法研所的人聽。'], opts=['好。', '明天晚上不行。'], no='好。那我對著牆講。',
                out='sisy23_sem', od='2026-11-18', oh=19.0, flag='SIS_SEMINAR_Y2', missed=['講完了。牆沒有意見。'], mh=22.0, lv='FAMILIAR'),
    'IV': dict(ask='sisy23_iv_ask', key='2027-10-15', lines=['明天早上九點，我要去訪談一位法扶的律師。', '需要一個人幫我做筆記。你打字比我快。'], opts=['好。', '明天早上不行。'], no='好。我錄音。',
               out='sisy23_iv', od='2027-10-16', oh=9.0, flag='SIS_INTERVIEW', missed=['訪談完了。錄音有雜音，我自己聽了兩遍。'], mh=12.5, lv='FRIEND')}


async def s_ask(p, run, base, sid, out):
    """LAB_GO／LAB_DATE／LAB_NO／SEM_ASK／SEM_NO／IV／IV_NOREPLY"""
    res = out.setdefault(sid, {}); k = sid.split('_')[0]; A = ASKS[k]; mode = sid.split('_', 1)[1] if '_' in sid else 'GO'   # GO DATE NO ASK NOREPLY（IV 單獨＝GO）
    dating = mode == 'DATE'; reply = None if mode == 'NOREPLY' else (A['opts'][1] if mode == 'NO' else A['opts'][0])
    b, pg, cdp, errs, r, name = await launch(p, run, base, A['key'], 20.9, 'dorm', A['lv'], dating=dating, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        ok, _ = await wait_ask(pg, cdp, run, A['ask'], max_s=360, label=sid)
        st = await pg.evaluate(STATE); M = await msgs(pg); res['dm'] = M[-4:]
        mine = [m for m in M if m['tag'] == A['ask'] or m['text'] in A['lines']]
        run.check('%s：%s 21:00 她私訊「%s」（%s）' % (sid, A['key'], '」「'.join(A['lines']), '回覆：' + '／'.join(A['opts'])),
                  ok and [m['text'] for m in mine][-2:] == A['lines'] and all(m['h'] >= 21.0 and m['d'] == A['key'] for m in mine[-2:]) and (mine[-1]['ask'] == A['opts']),
                  json.dumps({'now': st, 'msgs': M[-3:]}, ensure_ascii=False)[:500])
        if reply:
            got = await answer(pg, cdp, run, A['ask'], reply, sid); res['answered'] = got
            await pg.wait_for_timeout(4000); M2 = await msgs(pg); q = await pg.evaluate(OUTQ); res['out'] = q
            if mode == 'NO':
                run.check('%s：回「%s」→ 她回「%s」、沒有排出遊' % (sid, reply, A['no']), any(m['text'] == A['no'] for m in M2) and not any(x['id'] == A['out'] for x in q), json.dumps({'msgs': M2[-3:], 'out': q}, ensure_ascii=False)[:400])
            else:
                run.check('%s：回「好。」→ 排 %s %s（%s）' % (sid, A['od'], '%.2f' % A['oh'], A['out']), any(x['id'] == A['out'] and x['d'] == A['od'] and abs(x['h'] - A['oh']) < 0.01 and x['state'] == 'planned' for x in q), json.dumps(q, ensure_ascii=False))
        # ---- 睡到隔天
        ops, slept = await sleep_night(pg, cdp, run, sid); res['bed'] = ops
        st = await pg.evaluate(STATE); res['morning'] = st
        run.check('%s：上床「睡到明天」→ %s 早上' % (sid, A['od']), st['key'] == A['od'], json.dumps({'床': ops, 'now': st}, ensure_ascii=False)[:300])
        if mode in ('GO', 'DATE', 'ASK'):
            picks = {'LAB': ['照顏色排'] if dating else ['幫她把最重的'], 'SEM': ['妳為什麼選這個題目'], 'IV': ['他停下來的時候']}[k]
            if A['oh'] >= 13: await skip(pg, cdp, '等到傍晚', sid)
            elif A['oh'] >= 12: await skip(pg, cdp, '等到中午', sid)
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            first = {'LAB': LAB[0], 'SEM': SEM[0], 'IV': IV[0]}[k]
            ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags[%s]!=null&&!(typeof ADV!=='undefined'&&ADV.active)" % json.dumps(A['flag']), max_s=900, picks=picks, label=sid, shot_at=first[:8])
            await drive(pg, cdp, run, max_s=40, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; res['ch'] = ch; fl = await pg.evaluate(FLAGS); res['flags'] = fl
            prompt = [c for c in ch if any(o.startswith(OURS) for o in c['opts'])]
            run.check('%s：時間到跳出「出發」（%s）' % (sid, prompt[0]['opts'][0] if prompt else '—'), bool(prompt), json.dumps(ch[:5], ensure_ascii=False)[:500])
            if k == 'LAB':
                exp = LAB + (LAB_A if dating else LAB_B) + (LAB_D if dating else [])
                T = await lines_check(run, sid, log, name, exp, absent=() if dating else LAB_D, flag=(A['flag'], 'went'), flags=fl)
            elif k == 'SEM':
                T = await lines_check(run, sid, log, name, SEM + SEM_C, absent=(SEM_D,), flag=(A['flag'], 'asked'), flags=fl)
            else:
                T = await lines_check(run, sid, log, name, IV + IV_A, absent=(IV_D.replace('{name}', name),), flag=(A['flag'], 'went'), flags=fl, mem='SIS_INTERVIEW')
            await run.shot(pg, '%s_after' % sid)
            if k == 'LAB':   # 去了的：傍晚 18:00 以後不會再收到「搬完了。」
                await skip(pg, cdp, '等到傍晚', sid); await wait_for(pg, cdp, run, "GAME.G.hour>=18.08", max_s=420, label=sid)
                M3 = await msgs(pg); res['msgs_eve'] = M3[-3:]
                run.check('%s：去了的，18:00 以後沒有「搬完了。」' % sid, not any(m['text'] in A['missed'] for m in M3), json.dumps(M3[-3:], ensure_ascii=False)[:300])
        else:   # NO／NOREPLY：沒去＝那天她再傳一則
            if k == 'LAB': await skip(pg, cdp, '等到傍晚', sid); await wait_for(pg, cdp, run, "GAME.G.hour>=18.08", max_s=420, label=sid)
            elif k == 'IV': await skip(pg, cdp, '等到下午', sid); await pg.wait_for_timeout(4000)
            else: await skip(pg, cdp, '等到晚上', sid); o2, _ = await sleep_night(pg, cdp, run, sid)   # SEM：22:00 那則，睡到隔天看
            await drive(pg, cdp, run, max_s=30, label=sid)
            M3 = await msgs(pg); fl = await pg.evaluate(FLAGS); res['msgs_after'] = M3[-4:]; res['flags'] = fl
            got = [m for m in M3 if m['text'] in A['missed']]
            run.check('%s：沒去＝%s %s 她傳「%s」' % (sid, A['od'], '%05.2f' % A['mh'], '」「'.join(A['missed'])),
                      [m['text'] for m in got] == A['missed'] and all(m['d'] == A['od'] and abs(m['h'] - A['mh']) < 0.05 for m in got), json.dumps(M3[-4:], ensure_ascii=False)[:400])
            run.check('%s：記 %s＝missed' % (sid, A['flag']), fl.get(A['flag']) == 'missed', json.dumps(fl, ensure_ascii=False))
            q = await pg.evaluate(OUTQ); run.check('%s：沒有演那一場' % sid, not any(x['id'] == A['out'] and x['state'] == 'done' for x in q), json.dumps(q, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_pretalk(p, run, base, sid, out):
    """TOPIC_LIB／TOPIC_CAFE／US_LIB／US_DATE：晚上到法圖或 Café 找她說話，接在前面演"""
    res = out.setdefault(sid, {})
    C = {'TOPIC_LIB': ('2027-03-24', 'lawlib', 'FRIEND', False, {'SIS_SEMINAR_Y2': 'asked'}, ['那妳查到了嗎']),
         'TOPIC_CAFE': ('2027-03-22', 'cafe', 'FRIEND', True, {}, ['那個阿姨後來呢']),
         'US_LIB': ('2027-11-03', 'lawlib', 'FAMILIAR', False, {}, ['那妳會回來吧']),
         'US_DATE': ('2027-11-04', 'cafe', 'FAMILIAR', True, {}, ['握住她的手'])}[sid]
    key, zone, lv, dating, fl0, picks = C
    b, pg, cdp, errs, r, name = await launch(p, run, base, key, 19.1, 'dorm', lv, dating=dating, flags=fl0, label=sid + '（晚上 19:06 在宿舍，手機「地點」前往%s）' % ('法圖' if zone == 'lawlib' else 'Café'))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        went = await quick_go(pg, cdp, zone); st = await pg.evaluate(STATE); res['arrive'] = st
        run.check('%s：手機「地點」到%s' % (sid, zone), went, json.dumps(st, ensure_ascii=False))
        log = await talk_her(pg, cdp, run, picks, sid)
        if log is None:
            await run.shot(pg, '%s_noher' % sid); run.check('%s：%s %s 有她（作息）' % (sid, key, zone), False, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        else:
            res['log'] = log; fl = await pg.evaluate(FLAGS); res['flags'] = fl; T = texts(log, name)
            if sid.startswith('TOPIC'):
                exp = TOPIC0 + ([TOPIC_ASKED] if sid == 'TOPIC_LIB' else []) + TOPIC1 + (TOPIC_A if sid == 'TOPIC_LIB' else TOPIC_B + [TOPIC_D])
                await lines_check(run, sid, log, name, exp, absent=((TOPIC_D,) if not dating else (TOPIC_ASKED,)), mem='SIS_TOPIC', flags=fl)
                run.check('%s：記 SIS_TOPIC_Y2' % sid, fl.get('SIS_TOPIC_Y2') is True, json.dumps(fl, ensure_ascii=False))
                last = (TOPIC_A if sid == 'TOPIC_LIB' else [TOPIC_D])[-1]
            else:
                exp = US0 + ([US_GEN] + US_B if not dating else US_DT + US_HAND)
                await lines_check(run, sid, log, name, exp, absent=((US_GEN,) if dating else tuple(US_DT)), flag=('SIS_US_TOLD', 'here'), flags=fl, mem='SIS_US_TOLD')
                last = exp[-1]
            pos = max((i for i, x in enumerate(log) if x['t'] == last), default=-1)
            tail = [x['t'] for x in log[pos + 1:] if x['n'] != '［字幕］'] if pos >= 0 else []
            run.check('%s：演完照常說話（後面還有閒聊、升階或「約她去…」選單）' % sid, bool(tail), json.dumps(tail[:6], ensure_ascii=False)[:300])
            await run.shot(pg, '%s_after' % sid)
            log2 = await talk_her(pg, cdp, run, ['就這樣'], sid + '_2', wait_s=30); res['log2'] = log2
            T2 = texts(log2 or [], name)
            run.check('%s：再說一次話不再演' % sid, log2 is not None and (TOPIC0[0] if sid.startswith('TOPIC') else US0[0]) not in T2, json.dumps(T2[:6], ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_steps(p, run, base, sid, out):
    """TOPIC_STEPS：第 11 週週三 21:00 → 21:10 法圖外面的台階；US_STEPS：11/11 21:00 → 11/12 12:20 總圖門口的台階"""
    res = out.setdefault(sid, {})
    if sid == 'TOPIC_STEPS': key, lv, dm, oid, picks = '2027-05-05', 'FRIEND', '法圖外面的台階。等你十分鐘。', 'sisy23_topic', ['那妳查到了嗎']
    else: key, lv, dm, oid, picks = '2027-11-11', 'FAMILIAR', '明天中午，總圖門口的台階。', 'sisy23_us', ['去啊']
    b, pg, cdp, errs, r, name = await launch(p, run, base, key, 20.9, 'dorm', lv, label=sid)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid); n0 = len(await pg.evaluate("window.__LOG||[]"))
        flag = 'SIS_TOPIC_Y2' if sid == 'TOPIC_STEPS' else 'SIS_US_TOLD'
        if sid == 'US_STEPS':   # 隔天中午的約：先等私訊、睡覺、等到中午
            ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:heroine_05'&&m.text===%s)" % json.dumps(dm), max_s=360, go=False, label=sid)
            await pg.wait_for_timeout(2000); res['out0'] = await pg.evaluate(OUTQ)
            ops, slept = await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, '等到中午', sid)
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags[%s]!=null&&!(typeof ADV!=='undefined'&&ADV.active)" % json.dumps(flag), max_s=600, picks=picks, label=sid, shot_at=(TOPIC0[0] if sid == 'TOPIC_STEPS' else US0[0])[:8])
        await drive(pg, cdp, run, max_s=40, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; res['log'] = log; res['ch'] = ch; fl = await pg.evaluate(FLAGS); res['flags'] = fl
        M = await msgs(pg); res['dm'] = M[-2:]; mine = [m for m in M if m['text'] == dm]; q = await pg.evaluate(OUTQ); res['out'] = q
        run.check('%s：%s 21:00 她私訊「%s」' % (sid, key, dm), bool(mine) and mine[-1]['h'] >= 21.0 and mine[-1]['d'] == key, json.dumps(M[-2:], ensure_ascii=False))
        run.check('%s：排了出遊（%s），演完記 done' % (sid, oid), any(x['id'] == oid and x['state'] == 'done' for x in q) or any(x['id'] == oid for x in (res.get('out0') or [])), json.dumps(q, ensure_ascii=False))
        prompt = [c for c in ch if any(o.startswith(OURS) for o in c['opts'])]
        run.check('%s：時間到跳出「出發」（%s）' % (sid, prompt[0]['opts'][0] if prompt else '—'), bool(prompt), json.dumps(ch[:4], ensure_ascii=False)[:400])
        if sid == 'TOPIC_STEPS':
            await lines_check(run, sid, log, name, TOPIC0 + TOPIC1 + TOPIC_A, absent=(TOPIC_ASKED, TOPIC_D), mem='SIS_TOPIC', flags=fl)
        else:
            await lines_check(run, sid, log, name, US0 + [US_GEN] + US_A, absent=tuple(US_DT), flag=('SIS_US_TOLD', 'steps'), flags=fl, mem='SIS_US_TOLD')
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_bday(p, run, base, sid, out):
    """BDAY1（2026 Café）／BDAY2（2027 法圖）／BDAY_DATE（2027 交往中：前一天約、法圖旁邊那家）"""
    res = out.setdefault(sid, {})
    kevin = '今天溫學姊生日🎂'
    if sid == 'BDAY_DATE':
        b, pg, cdp, errs, r, name = await launch(p, run, base, '2027-06-01', 20.9, 'dorm', 'FAMILIAR', dating=True, label=sid)
    else:
        key = '2026-06-02' if sid == 'BDAY1' else '2027-06-02'
        b, pg, cdp, errs, r, name = await launch(p, run, base, key, 11.9, 'dorm', 'FAMILIAR', flags=({'SIS_LAB_DESK': 'went'} if sid == 'BDAY2' else {}), label=sid + ('（前置：大二上研究室去過＝SIS_LAB_DESK went）' if sid == 'BDAY2' else ''))
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        if sid == 'BDAY_DATE':
            ask = ['明天我生日。', '晚上七點，法圖旁邊那家。我訂了。']
            ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='p:heroine_05'&&m.text===%s)" % json.dumps(ask[1]), max_s=360, go=False, label=sid)
            M = await msgs(pg); mine = [m for m in M if m['text'] in ask]
            run.check('%s：6/1 21:00 她私訊「%s」' % (sid, '」「'.join(ask)), [m['text'] for m in mine] == ask and all(m['h'] >= 21.0 and m['d'] == '2027-06-01' for m in mine), json.dumps(M[-3:], ensure_ascii=False))
            await pg.wait_for_timeout(2000); q = await pg.evaluate(OUTQ); res['out'] = q
            run.check('%s：排好 6/2 19:00 法圖旁邊那家' % sid, any(x['id'] == 'sisy23_bday_y2' and x['d'] == '2027-06-02' and abs(x['h'] - 19) < 0.01 for x in q), json.dumps(q, ensure_ascii=False))
            ops, slept = await sleep_night(pg, cdp, run, sid); await skip(pg, cdp, '等到中午', sid)
        ok, _ = await wait_for(pg, cdp, run, "(GAME.G.msgs||[]).some(m=>m.th==='g:family_law'&&m.text===%s)" % json.dumps(kevin), max_s=300, go=False, label=sid)
        G = await msgs(pg, FAM); kv = [m for m in G if m['text'] == kevin]; res['kevin'] = kv
        run.check('%s：12:10 家族群組 Kevin「%s」' % (sid, kevin), ok and len(kv) == 1 and kv[0]['from'] == 'kevin' and abs(kv[0]['h'] - 12.17) < 0.05, json.dumps(kv or G[-2:], ensure_ascii=False))
        if sid == 'BDAY_DATE':
            await skip(pg, cdp, '等到傍晚', sid)
            n0 = len(await pg.evaluate("window.__LOG||[]"))
            ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags.SIS_BDAY_Y2!=null&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=900, picks=['生日快樂'], label=sid, shot_at=BD_DATE0[:6])
            await drive(pg, cdp, run, max_s=40, label=sid)
            log = (await pg.evaluate("window.__LOG||[]"))[n0:]; fl = await pg.evaluate(FLAGS); res['log'] = log; res['flags'] = fl; res['ch'] = ch
            prompt = [c for c in ch if any(o.startswith(OURS) for o in c['opts'])]
            run.check('%s：19:00 跳出「出發：她的生日（法圖旁邊那家）」' % sid, bool(prompt), json.dumps(ch[:4], ensure_ascii=False)[:400])
            await lines_check(run, sid, log, name, [BD_DATE0, BD_GRP, BD_DATE_THX, BD_DATE_END], absent=(BD_NARR, BD_Y2, '謝謝。……蛋糕分你一半，我吃不完。'), flag=('SIS_BDAY_Y2', 'there'), flags=fl)
        else:
            zone = 'cafe' if sid == 'BDAY1' else 'lawlib'
            await skip(pg, cdp, '等到晚上', sid); went = await quick_go(pg, cdp, zone); st = await pg.evaluate(STATE); res['arrive'] = st
            run.check('%s：晚上手機「地點」到%s' % (sid, 'Café' if zone == 'cafe' else '法圖'), went, json.dumps(st, ensure_ascii=False))
            picks = ['遞給她一包茶葉'] if sid == 'BDAY1' else ['把她的保溫瓶']
            log = await talk_her(pg, cdp, run, picks, sid)
            if log is None: await run.shot(pg, '%s_noher' % sid); run.check('%s：她在%s' % (sid, zone), False, json.dumps(st, ensure_ascii=False))
            else:
                fl = await pg.evaluate(FLAGS); res['log'] = log; res['flags'] = fl
                if sid == 'BDAY1': await lines_check(run, sid, log, name, [BD_NARR, BD_GRP, BD_Y1] + BD_TEA, absent=(BD_Y2, BD_DATE0), flag=('SIS_BDAY_Y1', 'tea'), flags=fl)
                else: await lines_check(run, sid, log, name, [BD_NARR, BD_GRP, BD_Y2] + BD_WATER, absent=(BD_Y1, BD_DATE0), flag=('SIS_BDAY_Y2', 'water'), flags=fl)
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_result(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    C = {'RESULT': ('FRIEND', False, 'TW', ['要慶祝嗎']), 'RESULT_US': ('FRIEND', True, 'US', ['我現在過去']), 'RESULT_TW': ('FRIEND', True, 'TW', ['恭喜'])}[sid]
    lv, dating, route, picks = C
    b, pg, cdp, errs, r, name = await launch(p, run, base, '2028-03-15', 21.05, 'dorm', lv, dating=dating, flags={'EXCHANGE_ROUTE': route}, label=sid + '（路線 %s）' % route)
    try:
        await drive(pg, cdp, run, max_s=30, label=sid)
        n0 = len(await pg.evaluate("window.__LOG||[]"))
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.flags.SIS_US_RESULT!=null&&!(typeof ADV!=='undefined'&&ADV.active)", max_s=600, picks=picks, label=sid, shot_at=RS0)
        await drive(pg, cdp, run, max_s=40, label=sid)
        log = (await pg.evaluate("window.__LOG||[]"))[n0:]; fl = await pg.evaluate(FLAGS); res['log'] = log; res['flags'] = fl; res['ch'] = ch
        prompt = [c for c in ch if any(o.startswith('接起來：') for o in c['opts'])]
        run.check('%s：21:30 她打來（「%s」）' % (sid, prompt[0]['opts'][0] if prompt else '—'), bool(prompt) and 21.2 <= float(prompt[0]['at'].split()[1]) <= 21.7, json.dumps(ch[:3], ensure_ascii=False)[:300])
        if sid == 'RESULT': await lines_check(run, sid, log, name, [RS0] + RS_GEN + RS_B, absent=(RS_US, RS_TW), flag=('SIS_US_RESULT', 'call'), flags=fl)
        elif sid == 'RESULT_US': await lines_check(run, sid, log, name, [RS0, RS_US] + RS_D, absent=tuple(RS_GEN) + (RS_TW,), flag=('SIS_US_RESULT', 'call'), flags=fl)
        else: await lines_check(run, sid, log, name, [RS0, RS_TW] + RS_C, absent=tuple(RS_GEN) + (RS_US,), flag=('SIS_US_RESULT', 'call'), flags=fl)
        await run.shot(pg, '%s_after' % sid)
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_none(p, run, base, sid, out):
    """NONE＝只認識：五個時間點；EX＝分手過（熟悉＋朋友數值，但 EX_heroine_05）：三個時間點。各開一次"""
    res = out.setdefault(sid, {})
    parts = (('a', '2026-09-21', 20.9, None), ('b', '2027-03-24', 19.1, 'lawlib'), ('c', '2027-11-03', 19.1, 'lawlib'), ('d', '2026-06-02', 11.9, 'cafe'), ('e', '2028-03-15', 21.05, None))
    if sid == 'EX': parts = tuple(x for x in parts if x[0] in ('a', 'c', 'e'))
    for part, key, h, extra in parts:
        tag = '%s-%s' % (sid, part); r0 = res.setdefault(part, {})
        fl = {'EXCHANGE_ROUTE': 'TW'} if part == 'e' else {}
        if sid == 'EX': fl['EX_heroine_05'] = True
        b, pg, cdp, errs, r, name = await launch(p, run, base, key, h, 'dorm', 'ACQ' if sid == 'NONE' else 'FRIEND', flags=fl, label=tag + ('（前置：分手過＝EX_heroine_05）' if sid == 'EX' else ''))
        try:
            await drive(pg, cdp, run, max_s=30, label=tag)
            if sid == 'NONE': run.check('%s：只認識＝ACQUAINTANCE、SISY23.ok 熟悉／朋友都是 false' % tag, r.get('stage') == 'ACQUAINTANCE' and r.get('ok') == {'FAMILIAR': False, 'FRIEND': False}, json.dumps(r, ensure_ascii=False))
            else: run.check('%s：分手過＝SISY23.ok 熟悉／朋友都是 false（數值是朋友）' % tag, r.get('ok') == {'FAMILIAR': False, 'FRIEND': False}, json.dumps(r, ensure_ascii=False))
            if part in ('a', 'e'):
                ok, ch = await wait_for(pg, cdp, run, "GAME.G.hour>=%s" % (21.3 if part == 'a' else 21.75), max_s=420, go=True, label=tag)
                M = await msgs(pg); q = await pg.evaluate(OUTQ); r0['msgs'] = M[-3:]; r0['out'] = q; r0['ch'] = ch
                if part == 'a': run.check('%s：9/21 21:00 以後沒有她的私訊、沒有排研究室' % tag, ok and not any(m['d'] == key and m['h'] >= 20.9 for m in M) and not q, json.dumps({'msgs': M[-2:], 'out': q}, ensure_ascii=False)[:300])
                else: run.check('%s：3/15 21:30 沒有她的電話' % tag, ok and not any(any(o.startswith('接起來：') for o in c['opts']) for c in ch) and not q, json.dumps({'ch': ch[:3], 'out': q}, ensure_ascii=False)[:300])
            else:
                if part == 'd':
                    ok, _ = await wait_for(pg, cdp, run, "GAME.G.hour>=12.3", max_s=300, go=False, label=tag)
                    G = await msgs(pg, FAM); kv = [m for m in G if m['text'] == '今天溫學姊生日🎂']; r0['kevin'] = kv
                    run.check('%s：認識她＝6/2 12:10 群組照樣有 Kevin 那則' % tag, len(kv) == 1, json.dumps(kv or G[-2:], ensure_ascii=False))
                    await skip(pg, cdp, '等到晚上', tag)
                await quick_go(pg, cdp, extra); log = await talk_her(pg, cdp, run, ['就這樣'], tag)
                if log is None: await run.shot(pg, '%s_noher' % tag); run.check('%s：%s 有她（作息）' % (tag, extra), False, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
                else:
                    T = texts(log, name); r0['log'] = T[:12]; fl = await pg.evaluate(FLAGS); r0['flags'] = fl
                    bad = {'b': TOPIC0[0], 'c': US0[0], 'd': BD_GRP}[part]
                    run.check('%s：找她說話不演（沒有「%s」）' % (tag, bad[:14]), bad not in T, json.dumps(T[:8], ensure_ascii=False)[:300])
            r0['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False))
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


ORDER = ['LAB_SKIP', 'RESULT_SLEEP', 'LAB_GO', 'SEM_ASK', 'TOPIC_LIB', 'BDAY1', 'IV', 'US_LIB', 'RESULT', 'US_STEPS', 'TOPIC_STEPS', 'BDAY_DATE', 'US_DATE', 'RESULT_US',
         'LAB_NO', 'SEM_NO', 'IV_NOREPLY', 'NONE', 'EX', 'LAB_DATE', 'TOPIC_CAFE', 'BDAY2', 'RESULT_TW']
FN = {'LAB_SKIP': s_lab_skip, 'RESULT_SLEEP': s_result_sleep, 'LAB_GO': s_ask, 'LAB_DATE': s_ask, 'LAB_NO': s_ask, 'SEM_ASK': s_ask, 'SEM_NO': s_ask, 'IV': s_ask, 'IV_NOREPLY': s_ask,
      'TOPIC_LIB': s_pretalk, 'TOPIC_CAFE': s_pretalk, 'US_LIB': s_pretalk, 'US_DATE': s_pretalk, 'TOPIC_STEPS': s_steps, 'US_STEPS': s_steps,
      'BDAY1': s_bday, 'BDAY2': s_bday, 'BDAY_DATE': s_bday, 'RESULT': s_result, 'RESULT_US': s_result, 'RESULT_TW': s_result, 'NONE': s_none, 'EX': s_none}


async def main():
    run = L.Run('aa379b', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa379b.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
