"""BB（帳號 A）2026-10-22：AA382-PG-FIX-1022（AA_382 第 7 節＋LAWWW 04:11 列的六項；開發分支 895345e0 起，下一版 v9.10.5）。
下面「應該出現的句子」照 AA_382 原文（企劃線 e6d4a198）寫，不是照程式；舊句（修改前）也一起檢查「不該出現」。
畢業以後是「跳到下一件事」：站在校園（傅鐘廣場北緣）不動 2 秒，遊戲自己跳到下一個停點，跳過的日子出日期卡（PG.advance、PG.cardLine）。
照玩家：站著不動等跳、手機自己打開就照情境回覆或收起來、出遊的「出發／晚一點／不去了」照情境按、點對話。

【4】學姊 2030 年的生日（使用者說學姊才是真正的女主角：最優先、寫最細）——美國路線（交換延畢；和學姊交往的玩家一定走美國路線，AA_381）、畢業以後和學姊交往中：
  SEA_GO       6/1（六）17:30 讀檔 → 18:05「出發：…法圖旁邊那家」（六月的固定格照排：她那一句是 AA_382 第 3 節新句「隔壁座位的盆栽開花了。…」）→ 21:00 私訊兩則＋回覆「好。」／「明天不行。」
               → 回「好。」→【讀資料】排好 6/2 09:00 她家樓下、alarm → 站著 → 6/2 08:30 停「出發：學姊的生日：九點，她家樓下」→ 出發 → 字卡「6/2（日）10:00」＋「北海岸」、海邊背景、
               旁白＋她三句 → 選「生日快樂。」→「……嗯。今年這一句，聽得最清楚。」→「明年這一天，計畫本上我還是空著。」；SIS_BDAY_Y5＝sea；15:00 不傳照片
  SEA_SIT      6/1 20:45 讀檔 → 回「好。」→ 出發 → 選「（坐到她旁邊，也把鞋子脫了）」→「（浪打上來一次，兩個人都往後縮了一下。她笑出聲。）」、沒有「……嗯。今年這一句…」、最後一句照樣
  SEA_NO       回「明天不行。」→ 她「好。……那我自己去。拍照給你。」、沒有排出遊、6/2 沒有「出發：學姊的生日」→ 15:00「📷（照片：堤防上，一雙鞋）」「看到了。」；SIS_BDAY_Y5＝alone
  SEA_NOREPLY  私訊來了不回（收起手機）→ 09:00 以後不能回 → 15:00 照片、alone
  SEA_LATE     回「好。」→ 08:30「晚一點」兩次 → 第三次「不去了」（答應了沒到）→ 15:00 照片、alone
  SEA_FRIEND   對照：學姊是朋友（沒有交往）＝6/1 沒有私訊、6/2 沒有照片、沒有旗標
【1】交換延畢：美國路線還要補修兩門課
  GRAD_US／GRAD_JP  2029-06-02 07:18 宿舍（最小存檔，同 aa381_probe.py）→ 家人那一段照玩家點 → 撥穗以後那一句：美國「（還差一門實習和兩門課，證書下學期才拿得到。）」、日本照舊「（還差一門實習，…）」
  CARD_US／CARD_JP  6/3 09:00 校園站著 → 第一張日期卡：美國「（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）」、日本照舊「…還差一門實習，九月再回學校。）」
  Y5_A         美國路線、和學姊交往：2029-09-03 08:30 讀檔 → 09:00 大五上的計畫（旁白「（這學期，週二去實習，週一、週三補兩門課。其他的日子——）」→ 選「接家教」）→ 站到 12/31：
               日期卡有「（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）」、「（週二去法扶。其他的日子，一天和一天很像。）」，沒有「大三的」「事務所」；
               【5】學姊每月一格：2029-09、10、11 有（固定格的出遊排起來＝PG_DATE_heroine_05 記那個月，出發的時候按「不去了」）、2029-12 沒有
  Y5_B         同上，2030-01-01 讀檔（Y5_DAYS 已選）→ 站到 3/3：2030-01 有格子；日期卡「（二月。學弟妹開學了。這是你第一次，開學跟你沒有關係。）」，沒有「二月底…」
【2】可昕 K26（7/7「老地方」）
  K26_DELAY    日本路線（交換延畢）、和可昕交往：7/5 12:00 → 21:00 私訊「禮拜六下午，我把行程表空出來了。」「三點，老地方。」→ 7/7 出發 → 字幕／事件名「老地方」→「你還差一個學期。……那今天先慶祝我的。」
  K26_MISS     臺灣路線：7/7 按「不去了」→ 16:00「三點，老地方。你沒來。」「……我自己吃了兩份。」
【3】可昕「我們的日子」：KX_WEEK 四格（每格開新瀏覽器、前一天中午讀檔、照玩家出發／打給她）：2030-01-05「…受訓太累了。…」、2030-04-07／09-01／12-01「這禮拜…」
【6】EPI_MX     2030 年考上（BAR_YEAR 2030）、明軒熟悉：2030-12-20 站著 → 跳到尾聲（2034-06-03）→ 明軒「你放榜那天，我在上班。在茶水間看完的。」
【前置／捷徑】全部是最小存檔（pgdate_probe.py 的做法：stage law、GRADUATED、PG done grad、MOVED_OUT、Y4_PATH other、路線旗標；美國加 US_DEPARTED／ARRIVED／RETURNED，日本加 X1_JP／JP_DEPARTED／JP_RETURNED），
  讀檔後在頁面裡設關係、交往（ROM.start；可昕用 dating_kexin＋KX_OUR_DAY，同 pgdate_probe.py）。不用使用者存檔（第 3 個參數照佇列的格式傳，不讀）。
Playwright 手機橫向模擬、?turbo（只縮短淡入淡出和字卡），不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=SEA_GO,... python3 aa382_probe.py '<URL>/index.html?turbo' <輸出資料夾> [<存檔.json>]"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)

HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; window.__CAP=[];
  const at=()=>{ try{ return PG.dateLabel(GAME.G.day,GAME.G.hour); }catch(e){ return ''; } };
  const strip=s=>String(s==null?'':s).replace(/<small>/g,'｜').replace(/<[^>]+>/g,'');
  const push=(n,t,x)=>{ try{ window.__LOG.push(Object.assign({n, t:String(t==null?'':t), at:at(), day:GAME.G.day, h:+(+GAME.G.hour).toFixed(3)}, x||{})); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push((w&&w.name)||(typeof w==='string'?w:''), t); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push('［選項］', JSON.stringify((o||[]).map(x=>x.t))); return c0.apply(this,arguments); };
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b,ms){ push('［字卡］', strip(a), {sub:strip(b)}); return t0.apply(this,arguments); }; }
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ push('［字幕］', strip(b||a)); return c1.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'){ const bgs=o=>{ const b=o&&o.background; return typeof b==='string'?b:JSON.stringify(b||null); };
    if(ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push('［背景］', bgs(o)); return b0.apply(this,arguments); }; }
    if(ADV.setBg){ const b1=ADV.setBg; ADV.setBg=function(b){ push('［背景］', typeof b==='string'?b:JSON.stringify(b||null)); return b1.apply(this,arguments); }; } }
  const watch=id=>{ const e=document.getElementById(id); if(!e) return; let last=''; new MutationObserver(()=>{ const t=strip(e.innerHTML||'').trim(); if(t&&t!==last){ last=t; window.__CAP.push({id, t, at:at()}); } }).observe(e,{childList:true,subtree:true,characterData:true}); };
  watch('title3'); watch('caption'); })()"""
STATE = """(()=>{ const G=GAME.G; let lab=''; try{ lab=PG.dateLabel(G.day,G.hour); }catch(e){} const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, h:+(+G.hour).toFixed(3), label:lab, zone:G.zone, money:G.money}; })()"""
MSGS = """(([th,d0,d1])=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th&&m.day>=d0&&m.day<=d1).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, ans:m.ans==null?null:m.ans})))"""
OUTS = """(pre=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>!pre||String(q.id||'').startsWith(pre)).map(q=>({id:q.id, d:CALENDAR.dateOf(q.day).key, h:+(+q.h).toFixed(3), state:q.state, title:q.title||'', alarm:!!q.alarm})))"""
FLAGS = """(ks=>{ const F=GAME.G.flags, o={}; for(const k of ks) o[k]=F[k]===undefined?null:F[k]; return o; })"""
PENDING = """(id=>typeof PHONE!=='undefined'&&PHONE.pending(GAME.G).some(m=>m.ask&&m.ask.id===id))"""
DKS = """(ks=>{ const o={}; for(const k of ks){ let d=null; try{ d=STORY.dayOfKey(k); }catch(e){} if(d==null&&typeof PG!=='undefined'&&PG.DK) d=PG.DK(k); o[k]=d; } return o; })"""
# 讀檔後補的關係（rel：{id:[熟,信任,自在,戀愛?]}；date：ROM.start 的人；sis：學姊認識過、有聯絡方式）
SETREL = """(o=>{ const G=GAME.G, F=G.flags; const set=(id,v)=>{ const R=SOCIAL.rel(id); R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; if(v[3]!=null){ R.rom=v[3]; R.npcRom=v[3]; } SOCIAL.remember(id,'FIRST_MET',''); return R; };
  for(const id in (o.rel||{})) set(id,o.rel[id]);
  G.contacts=G.contacts||{}; for(const id of (o.contacts||[])) if(G.contacts[id]==null) G.contacts[id]=STORY.dayOfKey('2025-09-24');
  if(o.sis){ F.met_sis=true; F.SIS_W1=true; }
  for(const id of (o.date||[])){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; }
  const nx=(typeof PG!=='undefined'&&PG.nextStop)?PG.nextStop(G):null;
  return {partners:(typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]), delayed:!!(PG.delayed&&PG.delayed(G)), route:STORY.route?STORY.route(G):null, pgOn:!!(PG.on&&PG.on(G)),
    pgdOn:!!(typeof PGDATE!=='undefined'&&PGDATE.on&&PGDATE.on(G)), seaOk:!!(PG.seaOk&&PG.seaOk(G)), kxOn:!!(typeof PGDATE!=='undefined'&&PGDATE.kxOn&&PGDATE.kxOn(G)),
    stages:Object.fromEntries(Object.keys(o.rel||{}).map(id=>[id,SOCIAL.stage(id)])), next:nx!=null?PG.dateLabel(Math.floor(nx/24),nx%24):null}; })"""
SIX = """(([who,yms])=>{ const G=GAME.G, S=PGDATE, busy=S.busyDays(G,G.day,STORY.dayOfKey(S.TO)+1); const o={}; for(const ym of yms){ const M=S.sixMonth(G,ym,busy); const s=M[who]; o[ym]=s?CALENDAR.dateOf(s.day).key+' '+s.h+' '+(s.place||''):null; } return o; })"""
PROMPT_PRE = ('出發：', '接起來：', '打給她：')
DATE_LABEL = re.compile(r'^\d+/\d+（.）\d\d:\d\d$')

# ---------------------------------------------------------------- AA_382 原文（企劃線 e6d4a198）
SEA_ASK = ['生日那一格，計畫本上是空的。……我故意的。', '明天九點，我家樓下。你開車。去看海。']; SEA_OPTS = ['好。', '明天不行。']; SEA_NO_REPLY = '好。……那我自己去。拍照給你。'   # AA 07:29 改稿（企劃線 116d5c72，開發分支 b947f4eb）：「明天」在有選項的那一則
SEA_ASK_OLD = ['明天，計畫本上那一格是空的。……我故意的。', '九點，我家樓下。你開車。去看海。']; SEA_LATE930 = '九點半了。我先去。'   # 答應了沒到（出遊錯過）的 6/2 09:30 先一句
ASK_CARD = {}   # answer() 截圖那一刻：有回覆鈕的那一則訊息看得到的字、在不在手機畫面裡（橫向）
SEA_OPEN = ['（北海岸。她把鞋子脫在堤防上，坐著看了很久。）', '不用很遠。看得到就好。', '以前生日那天，我也照樣讀書。', '今年第一次，什麼都沒排。']
SEA_C1 = ['生日快樂。', '……嗯。今年這一句，聽得最清楚。']; SEA_C2 = ['（坐到她旁邊，也把鞋子脫了）', '（浪打上來一次，兩個人都往後縮了一下。她笑出聲。）']
SEA_CLOSE = '明年這一天，計畫本上我還是空著。'; SEA_ALONE = ['📷（照片：堤防上，一雙鞋）', '看到了。']
SIS_0606_NEW = '隔壁座位的盆栽開花了。不是我的，可是我每天幫它澆水。'; SIS_0606_OLD = '今年生日，我想去看海。不用很遠，看得到就好。'
GRAD_US = '（還差一門實習和兩門課，證書下學期才拿得到。）'; GRAD_JP = '（還差一門實習，證書下學期才拿得到。）'
CARD_US = '（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）'; CARD_JP = '（同屆的人都畢業了。你還差一門實習，九月再回學校。）'
Y5_PLAN_US = '（這學期，週二去實習，週一、週三補兩門課。其他的日子——）'
CARD_0904 = '（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）'; CARD_0904_OLD = '（週一、週三補修兩門課。教室裡坐的，都是大三的。）'
CARD_1017 = '（週二去法扶。其他的日子，一天和一天很像。）'; CARD_1017_OLD = '（週二去事務所。其他的日子，一天和一天很像。）'
CARD_0211 = '（二月。學弟妹開學了。這是你第一次，開學跟你沒有關係。）'; CARD_0211_OLD = '（二月底。學弟妹開學了。你第一次在開學那天沒有課。）'
K26_ASK = ['禮拜六下午，我把行程表空出來了。', '三點，老地方。']; K26_ASK_OLD = ['畢業了。我們的日子，重新排一天。', '週六下午三點，老地方。']
K26_DELAY = '你還差一個學期。……那今天先慶祝我的。'; K26_DELAY_OLD = '你還差一門實習。……那今天先慶祝我的。'; K26_TW = '下個月考試。今天不讀書。……考試的事，明天再說。'
K26_MISS = ['三點，老地方。你沒來。', '……我自己吃了兩份。']; K26_MISS_OLD = '重新排的第一天。你沒來。'; K26_TITLE = '老地方'; K26_TITLE_OLD = '重新排的一天'
KX_WEEK = [('2030-01-04', '2030-01-05', '跨年那天我十點就睡了。受訓太累了。……我有聽到煙火。', '跨年那天我十點就睡了。隔天八點要上課。……我有聽到煙火。'),
           ('2030-04-06', '2030-04-07', '這禮拜第一次跟著去開庭。我坐在後面，一句話都沒說。……可是我都記下來了。', '今天第一次跟著去開庭。我坐在後面，一句話都沒說。……可是我都記下來了。'),
           ('2030-08-31', '2030-09-01', '這禮拜我自己開了一個庭。站起來的時候腳在抖，聲音沒有。', '今天我自己開了一個庭。站起來的時候腳在抖，聲音沒有。'),
           ('2030-11-30', '2030-12-01', '這禮拜有個當事人在會議室哭了。我把整包衛生紙推過去，等她哭完，再繼續問。', '今天有個當事人在會議室哭了。我把整包衛生紙推過去，等她哭完，再繼續問。')]
MX_NEW = '你放榜那天，我在上班。在茶水間看完的。'; MX_OLD = '你放榜那天，我剛好下班。在公車上看完的。'
DK_KEYS = ['2025-09-24', '2026-09-06', '2027-09-05', '2028-09-03', '2028-02-20', '2028-03-25', '2028-08-05', '2028-08-02', '2028-12-23', '2029-06-01', '2029-06-02', '2029-06-03',
           '2029-06-28', '2029-06-29', '2029-07-05', '2029-07-07', '2029-07-08', '2029-09-03', '2029-12-31', '2030-01-01', '2030-03-03', '2030-06-01', '2030-06-02', '2030-06-03', '2030-12-20', '2028-05-29']


# ---------------------------------------------------------------- 共用
async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def phone_tab(pg, cdp, tab):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)


async def tap_sel_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); return c[2]


async def answer(pg, cdp, run, ask_id, k, th, label):
    """照玩家：手機（自己打開的那一段，或 訊息 → 她的對話串）→ 點第 k 個回覆 → 收起手機。回傳點到的字"""
    sel = '#phoneBody [data-ask="%s|%d"]' % (ask_id, k)
    if not await phone_open(pg) or not await pg.evaluate("!!document.querySelector(%s)" % json.dumps(sel)):
        await phone_tab(pg, cdp, 'msg')
        await tap_sel_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===%s)" % json.dumps(th)); await pg.wait_for_timeout(800)
    await run.shot(pg, '%s_dm' % label)
    ASK_CARD[label] = await pg.evaluate("""(sel=>{ const b=document.querySelector(sel); if(!b) return null; let c=b; for(let i=0;i<4&&c.parentElement&&c.parentElement.id!=='phoneBody';i++) c=c.parentElement;
      const r=c.getBoundingClientRect(), rb=document.getElementById('phoneBody').getBoundingClientRect(); const vis=(c.innerText||'').replace(/\\n/g,'｜');
      return {text:vis, inView:r.top>=rb.top-2&&r.top<rb.bottom, top:Math.round(r.top), bottom:Math.round(r.bottom), bodyTop:Math.round(rb.top), bodyBottom:Math.round(rb.bottom)}; })(%s)""" % json.dumps(sel))
    say('   %s 有回覆鈕的那一則：%s' % (label, json.dumps(ASK_CARD[label], ensure_ascii=False)))
    got = await tap_sel_js(pg, cdp, "document.querySelector(%s)" % json.dumps(sel))
    await pg.wait_for_timeout(1800); await run.shot(pg, '%s_dm_answered' % label)
    say('   %s 手機回 %s：「%s」' % (label, ask_id, got))
    await L.phone_away(pg, cdp); return got


def pick_default(ops, picks):
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for pre in ('先起床再說', '先起床', '照樣跳過', '就這樣'):
        for i, o in enumerate(ops):
            if o.startswith(pre): return i
    return 0


async def drive(pg, cdp, run, label, until, max_s, pol, rec):
    """照玩家：站著不動等跳日期；手機自己打開＝照 pol['answer']（{ask_id:[第幾個, 對話串]}）回覆，不然收起來；
    出遊的「出發／接起來／打給她」：標題含 pol['go'] 的字＝出發，含 pol['late'] 的字＝「晚一點」（最多 pol['late_n'] 次，之後不去了），其他＝不去了／今天先不要；
    其他選項照 pol['picks']；點對話。直到 until（JS）成立。rec：prompts（出遊提示：時間、選項、按了什麼）、choices、answered"""
    t0 = time.time(); last_t = None; since = time.time(); late_n = 0
    rec.setdefault('prompts', []); rec.setdefault('choices', []); rec.setdefault('answered', {})
    while time.time() - t0 < max_s:
        if await pg.evaluate(until): return True
        st = await pg.evaluate(STATE); t = (st['day'], round(st['h'], 2))
        if t != last_t: last_t = t; since = time.time()
        elif time.time() - since > (pol.get('stuck') or 300):
            run.note('%s：超過 %d 秒遊戲時間沒有前進：%s' % (label, pol.get('stuck') or 300, json.dumps(st, ensure_ascii=False))); await run.shot(pg, '%s_stuck' % label); return False
        if await phone_open(pg):
            done = False
            for aid, (k, th) in (pol.get('answer') or {}).items():
                if aid in rec['answered']: continue
                if await pg.evaluate(PENDING + "(%s)" % json.dumps(aid)):
                    rec['answered'][aid] = {'k': k, 'at': st['label'], 'got': await answer(pg, cdp, run, aid, k, th, label)}; done = True; break
            if not done: await L.phone_away(pg, cdp); await pg.wait_for_timeout(600)
            continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            pr = next((o for o in ops if o.startswith(PROMPT_PRE)), None)
            if pr:
                if any(g in pr for g in pol.get('go') or []): k = ops.index(pr); act = 'go'
                elif any(g in pr for g in pol.get('late') or []) and late_n < (pol.get('late_n') or 2):
                    k = next((i for i, o in enumerate(ops) if o.startswith('晚一點')), None); act = 'late'; late_n += 1
                    if k is None: k = next((i for i, o in enumerate(ops) if o.startswith(('不去了', '今天先不要'))), 0); act = 'no'
                else:
                    k = next((i for i, o in enumerate(ops) if o.startswith(('不去了', '今天先不要'))), None); act = 'no'
                    if k is None: k = ops.index(pr); act = 'go(只有出發)'
                rec['prompts'].append({'at': st['label'], 'key': st['key'], 'h': st['h'], 'opts': ops, 'act': act})
                say('   %s %s 出遊提示 %s → %s' % (label, st['label'], [o[:26] for o in ops], act))
                if len(rec['prompts']) <= 12: await run.shot(pg, '%s_prompt%d' % (label, len(rec['prompts'])))
            else:
                k = pick_default(ops, pol.get('picks'))
                rec['choices'].append({'at': st['label'], 'opts': ops, 'pick': ops[k]})
                say('   %s %s 選項 %s → %s' % (label, st['label'], [o[:18] for o in ops], ops[k][:22]))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1300); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(1500)
    run.note('%s：%d 秒到了還沒到終點' % (label, max_s)); return False


def lines(log):
    return [x['t'] for x in log if not x['n'].startswith('［')]


def cards(log):
    return [{'t': x['t'], 'sub': x.get('sub', ''), 'day': x.get('day'), 'h': x.get('h')} for x in log if x['n'] == '［字卡］' and DATE_LABEL.match(x['t'] or '')]


def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None


def route_flags(route, dk):
    F = {'EXCHANGE_ROUTE': route, 'EXCH_RULE': 1}
    if route == 'US': F.update({'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': dk['2028-08-02'], 'US_RETURNED': dk['2028-12-23']})
    if route == 'JP': F.update({'X1_JP': dk['2028-02-20'], 'JP_DEPARTED': dk['2028-03-25'], 'JP_RETURNED': dk['2028-08-05'], 'AN_SENDOFF': 'together'})
    return F


def base_flags(dk):
    return {'KX_DEC3_MIGRATED': True, 'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'],
            'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True}


async def launch(p, run, sid, key, h, flags, setrel, pg_mode=True, quiet=False, label=''):
    """最小存檔：pg_mode＝畢業以後（GRADUATED、PG done grad、MOVED_OUT、校園傅鐘廣場北緣）；不然＝6/2 典禮那天早上的宿舍（aa381_probe.py 的 launch_min）"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    dk = await pg.evaluate(DKS + "(%s)" % json.dumps(DK_KEYS + [key]))
    F = base_flags(dk); F.update(flags(dk) if callable(flags) else (flags or {}))
    if pg_mode:
        F.update({'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home'})
        F.setdefault('PG', {'done': {'grad': 1}})
        st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[key], 'hour': h, 'energy': 100, 'money': 22000, 'zone': 'campus', 'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
              'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1, 'ev_sis_w1': 1}, 'last': {}, 'count': 0}}
    else:
        st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[key], 'hour': h, 'energy': 100, 'money': 30000, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'flags': F,
              'events': {'done': {'ev_sis_w1': 1}, 'last': {}, 'count': 0}}
    st['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % st['day'])
    await L.load_state(pg, st, quiet_events=quiet); await pg.wait_for_timeout(3000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETREL + "(%s)" % json.dumps(setrel or {}))
    now = await pg.evaluate(STATE)
    run.setup('[前置] %s：最小存檔讀到 %s %.2f %s（%s；quiet_events=%s）旗標 %s；讀檔後設關係 %s → %s' % (
        label or sid, key, h, st['zone'], '畢業以後' if pg_mode else '典禮那天', quiet, json.dumps({k: v for k, v in F.items() if k not in base_flags(dk)}, ensure_ascii=False)[:300],
        json.dumps(setrel or {}, ensure_ascii=False), json.dumps({'now': now['label'], **r}, ensure_ascii=False)[:400]))
    return b, pg, cdp, errs, dk, r


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


def errs_check(run, sid, res, errs):
    res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))


# ---------------------------------------------------------------- 【4】學姊 2030 年的生日
SIS_DATE = {'rel': {'heroine_05': [70, 60, 60, 70]}, 'date': ['heroine_05'], 'sis': True, 'contacts': ['heroine_05']}
SIS_FRIEND = {'rel': {'heroine_05': [48, 32, 20]}, 'sis': True, 'contacts': ['heroine_05']}
SEA = {'SEA_GO': dict(h=17.5, rel=SIS_DATE, ans=0, go=['學姊的生日', '法圖旁邊那家'], picks=['生日快樂'], late=[]),
       'SEA_SIT': dict(h=20.75, rel=SIS_DATE, ans=0, go=['學姊的生日'], picks=['坐到她旁邊'], late=[]),
       'SEA_NO': dict(h=20.75, rel=SIS_DATE, ans=1, go=[], picks=[], late=[]),
       'SEA_NOREPLY': dict(h=20.75, rel=SIS_DATE, ans=None, go=[], picks=[], late=[]),
       'SEA_LATE': dict(h=20.75, rel=SIS_DATE, ans=0, go=[], picks=[], late=['學姊的生日']),
       'SEA_FRIEND': dict(h=20.75, rel=SIS_FRIEND, ans=None, go=[], picks=[], late=[])}


async def s_sea(p, run, sid, out):
    res = out.setdefault(sid, {}); sc = SEA[sid]; dating = 'date' in sc['rel']
    fl = lambda dk: dict(route_flags('US', dk), Y5_DAYS='work', BAR_REG_2030=False, dating_kexin=False)   # 只和學姊交往：讀檔前寫 dating_kexin false（沒寫的話舊存檔規則當成和可昕交往中，6/1 會先演「選一個人」；BB_218 46612bb1 那一輪）
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2030-06-01', sc['h'], fl, sc['rel'],
                                           label='%s（美國路線＝交換延畢、學姊%s；2030-06-01（六）%s 校園）' % (sid, '交往中' if dating else '朋友（沒有交往）', '17:30' if sc['h'] < 18 else '20:45'))
    try:
        res['pre'] = r
        if dating: run.check('%s：前置——畢業以後、和學姊交往中（PG.seaOk）、交換延畢' % sid, r.get('pgOn') and r.get('seaOk') and r.get('delayed'), json.dumps(r, ensure_ascii=False)[:300])
        else: run.check('%s：前置——畢業以後、學姊朋友、沒有交往（PG.seaOk＝false）' % sid, r.get('pgOn') and not r.get('seaOk'), json.dumps(r, ensure_ascii=False)[:300])
        pol = {'go': sc['go'], 'late': sc['late'], 'late_n': 2, 'picks': sc['picks'], 'answer': ({'pg_sis_sea': [sc['ans'], 'p:heroine_05']} if sc['ans'] is not None else {})}
        rec = {}; d2 = dk['2030-06-02']
        ok = await drive(pg, cdp, run, sid, "GAME.G.day>%d" % d2, 720 if sid == 'SEA_GO' else 540, pol, rec)
        log = await pg.evaluate("window.__LOG||[]"); cap = await pg.evaluate("window.__CAP||[]"); T = lines(log); C = cards(log)
        M = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:heroine_05', dk['2030-06-01'], d2])); Mt = [m['text'] for m in M]
        fl_ = await pg.evaluate(FLAGS + "(%s)" % json.dumps(['SIS_BDAY_Y5', 'PG_SIS_SEA', 'PG_DATE_heroine_05']))
        q = await pg.evaluate(OUTS + "('pg_sis_sea')"); qs = await pg.evaluate(OUTS + "('pg_date_heroine_05_2030-06')")
        res.update({'rec': rec, 'msgs': M, 'flags': fl_, 'out': q, 'slot': qs, 'cards': C, 'cap': cap[-20:], 'log': log[-60:], 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        run.check('%s：玩到 6/3 以後（沒有卡住）' % sid, ok, json.dumps(res['end'], ensure_ascii=False))
        say('   %s 學姊 6/1～6/2 的訊息：%s' % (sid, json.dumps(M, ensure_ascii=False)[:600]))
        sea_prompt = [x for x in rec['prompts'] if any(o.startswith('出發：學姊的生日') for o in x['opts'])]
        if not dating:
            run.check('SEA_FRIEND：6/1 沒有私訊「%s」、沒有回覆選項' % SEA_ASK[0], not any(t in Mt for t in SEA_ASK), json.dumps(M, ensure_ascii=False)[:300])
            run.check('SEA_FRIEND：6/2 沒有照片「%s」' % SEA_ALONE[1], not any(t in Mt for t in SEA_ALONE), json.dumps(M, ensure_ascii=False)[:300])
            run.check('SEA_FRIEND：沒有「出發：學姊的生日」、SIS_BDAY_Y5 沒有值', not sea_prompt and fl_.get('SIS_BDAY_Y5') is None, json.dumps({'prompts': rec['prompts'][:3], 'flags': fl_}, ensure_ascii=False)[:300])
            errs_check(run, sid, res, errs); await close(b); return
        ask = [m for m in M if m['text'] in SEA_ASK]
        run.check('%s：6/1（六）21:00 學姊私訊兩則「%s」「%s」，第二則可以回「好。」／「明天不行。」' % (sid, SEA_ASK[0], SEA_ASK[1]),
                  [m['text'] for m in ask] == SEA_ASK and all(m['d'] == '2030-06-01' and abs(m['h'] - 21) < 0.05 for m in ask) and ask[-1]['ask'] == SEA_OPTS, json.dumps(ask, ensure_ascii=False)[:400])
        run.check('%s：沒有舊的兩句（「%s」「%s」）' % (sid, SEA_ASK_OLD[0], SEA_ASK_OLD[1]), not any(t_ in Mt for t_ in SEA_ASK_OLD), json.dumps(Mt[:4], ensure_ascii=False))
        card = ASK_CARD.get(sid)
        if card is not None or sc['ans'] is not None:
            run.check('%s：橫向手機點進對話，有回覆鈕的那一則在畫面裡、看得到「明天」（%s）' % (sid, (card or {}).get('text')), bool(card) and card['inView'] and '明天' in card['text'], json.dumps(card, ensure_ascii=False))
        l930 = [m for m in M if m['text'] == SEA_LATE930]
        if sid == 'SEA_LATE':
            ph = [i for i, m in enumerate(M) if m['text'] == SEA_ALONE[0]]
            run.check('SEA_LATE：答應了沒到＝6/2 09:30 她先傳「%s」（在照片前面）' % SEA_LATE930, len(l930) == 1 and l930[0]['d'] == '2030-06-02' and abs(l930[0]['h'] - 9.5) < 0.05 and (not ph or M.index(l930[0]) < ph[0]), json.dumps(l930 + M[-4:], ensure_ascii=False)[:400])
        else:
            run.check('%s：沒有 09:30「%s」（只給答應了沒到的）' % (sid, SEA_LATE930), not l930, json.dumps(l930, ensure_ascii=False))
        if sid == 'SEA_GO':
            slot = [x for x in rec['prompts'] if any('法圖旁邊那家' in o for o in x['opts'])]
            run.check('SEA_GO：六月的固定格照排：6/1 18:05 左右「出發：和…：法圖旁邊那家」', bool(slot) and slot[0]['key'] == '2030-06-01' and 17.9 <= slot[0]['h'] <= 18.3, json.dumps(slot[:1], ensure_ascii=False)[:300])
            run.check('SEA_GO：固定格她那一句是新句「%s」（AA_382 第 3 節）、沒有舊句「%s」' % (SIS_0606_NEW, SIS_0606_OLD), SIS_0606_NEW in T and SIS_0606_OLD not in T, json.dumps([t for t in T if '盆栽' in t or '看海' in t], ensure_ascii=False))
            capt = [x['t'] for x in log if x['n'] == '［字幕］']; res['captions'] = capt[-12:]
            run.check('SEA_GO：BUG-PG-RETURN-TEXT-1021 畢業退宿（住家裡）以後，6/1 固定格（法圖旁邊那家）演完的字幕是「回到家。」、沒有「回到台大。」', '回到家。' in capt and '回到台大。' not in capt, json.dumps(capt[-10:], ensure_ascii=False))
        if sc['ans'] == 1:
            run.check('SEA_NO：回「明天不行。」→ 她回「%s」' % SEA_NO_REPLY, SEA_NO_REPLY in Mt and Mt.index(SEA_NO_REPLY) > Mt.index(SEA_ASK[1]) if SEA_ASK[1] in Mt else False, json.dumps(Mt, ensure_ascii=False)[:300])
        if sc['ans'] == 0 or sid == 'SEA_LATE':
            run.check('%s：回「好。」以後她沒有另外回（「好。」就是最後一則）' % sid, bool(Mt) and SEA_NO_REPLY not in Mt, json.dumps(Mt[-3:], ensure_ascii=False))
            o = [x for x in q if x['id'] == 'pg_sis_sea']
            run.check('%s：【讀資料】回「好。」＝排出遊 6/2 09:00 她家樓下、alarm（跳過時間、睡覺會停）' % sid, bool(o) and o[0]['d'] == '2030-06-02' and abs(o[0]['h'] - 9) < 0.01 and o[0]['alarm'], json.dumps(q, ensure_ascii=False))
            run.check('%s：6/2 08:30 停下來問「出發：學姊的生日：九點，她家樓下」（出發前）' % sid, bool(sea_prompt) and sea_prompt[0]['key'] == '2030-06-02' and 8.45 <= sea_prompt[0]['h'] <= 8.6, json.dumps(sea_prompt[:1], ensure_ascii=False)[:300])
        if sc['go']:   # SEA_GO、SEA_SIT：去了
            card = [c for c in C if c['sub'] == '北海岸']
            run.check('%s：到了：字卡「6/2（日）10:00」＋地點「北海岸」' % sid, bool(card) and card[0]['t'].startswith('6/2（日）10:00'), json.dumps(C[-4:], ensure_ascii=False)[:300])
            bg = [x['t'] for x in log if x['n'] == '［背景］']
            run.check('%s：海邊的背景（trip_sea）' % sid, any('trip_sea' in x for x in bg), json.dumps(bg[-4:], ensure_ascii=False)[:300])
            exp = SEA_OPEN + (SEA_C1[1:] if sid == 'SEA_GO' else SEA_C2[1:]) + [SEA_CLOSE]
            miss = in_order(T, exp)
            run.check('%s：照 AA_382 第 4 節依序：旁白＋她三句 →「%s」→「%s」→「%s」' % (sid, (SEA_C1 if sid == 'SEA_GO' else SEA_C2)[0], exp[-2], SEA_CLOSE), miss is None,
                      ('缺「%s」｜' % miss if miss else '') + json.dumps(T[-14:], ensure_ascii=False)[:600])
            other = SEA_C2[1] if sid == 'SEA_GO' else SEA_C1[1]
            run.check('%s：沒有另一個選項的回答「%s」' % (sid, other), other not in T, '')
            chs = [c for c in rec['choices'] if any(SEA_C1[0] in o for o in c['opts'])]
            run.check('%s：兩個選項「生日快樂。」「（坐到她旁邊，也把鞋子脫了）」' % sid, bool(chs) and len(chs[0]['opts']) == 2 and SEA_C1[0] in chs[0]['opts'][0] and SEA_C2[0] in chs[0]['opts'][1], json.dumps(chs[:1], ensure_ascii=False)[:300])
            run.check('%s：SIS_BDAY_Y5＝sea、出遊 done' % sid, fl_.get('SIS_BDAY_Y5') == 'sea' and any(x['id'] == 'pg_sis_sea' and x['state'] == 'done' for x in q), json.dumps({'flags': fl_, 'out': q}, ensure_ascii=False)[:300])
            run.check('%s：去了＝6/2 15:00 不傳照片' % sid, not any(t in Mt for t in SEA_ALONE), json.dumps(Mt[-3:], ensure_ascii=False))
        else:   # SEA_NO、SEA_NOREPLY、SEA_LATE：沒去
            if sid in ('SEA_NO', 'SEA_NOREPLY'):
                run.check('%s：沒有排出遊、6/2 沒有「出發：學姊的生日」' % sid, not any(x['id'] == 'pg_sis_sea' for x in q) and not sea_prompt, json.dumps({'out': q, 'prompts': rec['prompts'][:3]}, ensure_ascii=False)[:300])
            if sid == 'SEA_NOREPLY':
                run.check('SEA_NOREPLY：私訊來了沒回（沒有點回覆）', not rec['answered'] and all(m['ans'] is None for m in ask), json.dumps(ask, ensure_ascii=False)[:300])
            if sid == 'SEA_LATE':
                acts = [x['act'] for x in sea_prompt]
                run.check('SEA_LATE：答應了沒到：「晚一點」兩次、第三次「不去了」（出遊不是 done）', acts[:3] == ['late', 'late', 'no'] and not any(x['id'] == 'pg_sis_sea' and x['state'] == 'done' for x in q), json.dumps({'acts': acts, 'out': q}, ensure_ascii=False)[:300])
            al = [m for m in M if m['text'] in SEA_ALONE]
            run.check('%s：6/2 15:00 她傳「%s」「%s」' % (sid, SEA_ALONE[0], SEA_ALONE[1]), [m['text'] for m in al] == SEA_ALONE and all(m['d'] == '2030-06-02' and abs(m['h'] - 15) < 0.05 for m in al), json.dumps(M[-4:], ensure_ascii=False)[:400])
            run.check('%s：SIS_BDAY_Y5＝alone' % sid, fl_.get('SIS_BDAY_Y5') == 'alone', json.dumps(fl_, ensure_ascii=False))
            run.check('%s：沒有北海岸那一段（她那四句沒有演）' % sid, not any(t in T for t in SEA_OPEN), '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 【1】交換延畢：撥穗、日期卡
async def s_grad(p, run, sid, out):
    res = out.setdefault(sid, {}); route = 'US' if sid == 'GRAD_US' else 'JP'
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2029-06-02', 7.3, lambda dk: dict(route_flags(route, dk), met_sis=True, SIS_W1=True), {}, pg_mode=False, quiet=True,
                                           label='%s（%s路線＝交換延畢；2029-06-02 07:18 宿舍；家人那一段 07:30 開始）' % (sid, '美國' if route == 'US' else '日本'))
    try:
        res['pre'] = r
        run.check('%s：前置——交換延畢（PG.delayed）、路線 %s' % (sid, route), r.get('delayed') and r.get('route') == route, json.dumps(r, ensure_ascii=False)[:300])
        rec = {}
        ok = await drive(pg, cdp, run, sid, "(window.__LOG||[]).some(x=>x.t==='我們家第一個台大畢業的。')", 720, {'picks': []}, rec)
        log = await pg.evaluate("window.__LOG||[]"); T = lines(log); res.update({'rec': rec, 'log': log[-40:], 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        run.check('%s：家人那一段演到 11:55 大廳（媽媽「我們家第一個台大畢業的。」）' % sid, ok, json.dumps(res['end'], ensure_ascii=False))
        i = T.index('（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）') if '（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）' in T else -1
        want, other = (GRAD_US, GRAD_JP) if route == 'US' else (GRAD_JP, GRAD_US)
        run.check('%s：撥穗以後那一句「%s」' % (sid, want), i >= 0 and i + 1 < len(T) and T[i + 1] == want, json.dumps(T[max(0, i - 1):i + 3], ensure_ascii=False))
        run.check('%s：沒有「%s」' % (sid, other), other not in T, '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_card(p, run, sid, out):
    res = out.setdefault(sid, {}); route = 'US' if sid == 'CARD_US' else 'JP'
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2029-06-03', 9.0, lambda dk: route_flags(route, dk), {},
                                           label='%s（%s路線＝交換延畢；2029-06-03 09:00 校園，畢業以後）' % (sid, '美國' if route == 'US' else '日本'))
    try:
        res['pre'] = r
        rec = {}
        ok = await drive(pg, cdp, run, sid, "(window.__LOG||[]).some(x=>x.n==='［字卡］'&&x.sub)||GAME.G.day>=%d" % dk['2029-06-29'], 420, {'picks': []}, rec)
        log = await pg.evaluate("window.__LOG||[]"); C = cards(log); res.update({'rec': rec, 'cards': C, 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        subs = [c['sub'] for c in C if c['sub']]
        want, other = (CARD_US, CARD_JP) if route == 'US' else (CARD_JP, CARD_US)
        say('   %s 日期卡：%s' % (sid, json.dumps(C, ensure_ascii=False)[:400]))
        run.check('%s：6/3 以後跳日期的第一張卡「%s」' % (sid, want), bool(subs) and subs[0] == want, json.dumps(C[:3], ensure_ascii=False)[:300])
        run.check('%s：沒有「%s」' % (sid, other), other not in subs, '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


async def s_y5(p, run, sid, out):
    """Y5_A：2029-09-03 08:30 → 12/31；Y5_B：2030-01-01 → 3/3。美國路線、和學姊交往（每月一格＝跳日期的停點）"""
    res = out.setdefault(sid, {})
    if sid == 'Y5_A': key, h, endk, fl = '2029-09-03', 8.5, '2029-12-31', (lambda dk: route_flags('US', dk))
    else: key, h, endk, fl = '2030-01-01', 12.0, '2030-03-03', (lambda dk: dict(route_flags('US', dk), Y5_DAYS='work'))
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, key, h, fl, SIS_DATE, label='%s（美國路線、和學姊交往；%s %02d:%02d 校園%s）' % (sid, key, int(h), round(h % 1 * 60), '' if sid == 'Y5_A' else '；大五上的計畫已選「接家教」'))
    try:
        res['pre'] = r
        yms = ['2029-09', '2029-10', '2029-11', '2029-12', '2030-01'] if sid == 'Y5_A' else ['2030-01', '2030-02', '2030-03']
        six = await pg.evaluate(SIX + "(%s)" % json.dumps(['heroine_05', yms])); res['six0'] = six
        run.note('【讀資料，不是玩】讀檔當下學姊每月一格的排法：%s' % json.dumps(six, ensure_ascii=False))
        rec = {}
        ok = await drive(pg, cdp, run, sid, "GAME.G.day>=%d" % dk[endk], 1500, {'picks': ['接家教'], 'go': [], 'stuck': 360}, rec)
        log = await pg.evaluate("window.__LOG||[]"); T = lines(log); C = cards(log); subs = [c['sub'] for c in C if c['sub']]
        fl_ = await pg.evaluate(FLAGS + "(%s)" % json.dumps(['PG_DATE_heroine_05', 'Y5_DAYS'])); used = fl_.get('PG_DATE_heroine_05') or []
        slots = await pg.evaluate(OUTS + "('pg_date_heroine_05_')")
        res.update({'rec': rec, 'cards': C, 'flags': fl_, 'slots': slots, 'log': log[-40:], 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        say('   %s 日期卡：%s' % (sid, json.dumps([(c['t'], c['sub']) for c in C], ensure_ascii=False)[:1500]))
        say('   %s 學姊的固定格：%s；PG_DATE_heroine_05=%s' % (sid, json.dumps(slots, ensure_ascii=False)[:600], used))
        run.check('%s：玩到 %s（沒有卡住）' % (sid, endk), ok, json.dumps(res['end'], ensure_ascii=False))
        if sid == 'Y5_A':
            run.check('Y5_A：9/3 大五上的計畫：美國路線旁白「%s」，選「接家教」' % Y5_PLAN_US, Y5_PLAN_US in T and fl_.get('Y5_DAYS') == 'work', json.dumps({'Y5_DAYS': fl_.get('Y5_DAYS'), 'T': [t for t in T if '這學期' in t]}, ensure_ascii=False))
            run.check('Y5_A：日期卡有「%s」（AA_382 第 1 節第 4 項）' % CARD_0904, CARD_0904 in subs, json.dumps(subs, ensure_ascii=False)[:500])
            run.check('Y5_A：日期卡沒有舊句「…都是大三的。）」', CARD_0904_OLD not in subs, '')
            in_rng = [c for c in C if c['day'] is not None and dk['2029-09-03'] + 45 <= c['day'] <= dk['2029-09-03'] + 77]   # 10/18～11/19 落地（10/17 那一段裡面）
            if CARD_1017 in subs: run.check('Y5_A：日期卡有「%s」（第 5 項）' % CARD_1017, True, '')
            elif in_rng: run.check('Y5_A：日期卡有「%s」（第 5 項；有一跳落在 10/18～11/19 卻沒出）' % CARD_1017, False, json.dumps(in_rng, ensure_ascii=False)[:300])
            else: run.note('Y5_A：NOT TESTED「%s」——這一輪沒有一跳落在 10/18～11/19（共通那一句只在落點還在那一段裡才出，AA_363 T3）；日期卡 %s' % (CARD_1017, json.dumps(subs, ensure_ascii=False)[:300]))
            run.check('Y5_A：日期卡沒有舊句「（週二去事務所。…）」', CARD_1017_OLD not in subs, '')
            run.check('Y5_A：學姊每月一格：2029-09、10、11 都排了（AA_367 第 10 節 A4：交換延畢的大五上也排）', all(m in used for m in ('2029-09', '2029-10', '2029-11')), json.dumps({'PG_DATE': used, 'slots': slots}, ensure_ascii=False)[:400])
            run.check('Y5_A：2029-12 不排（12/21 延畢的期末約會）', '2029-12' not in used and not any(x['id'].endswith('2029-12') for x in slots), json.dumps(used, ensure_ascii=False))
        else:
            run.check('Y5_B：學姊 2030-01 有格子（AA_367 A4）', '2030-01' in used, json.dumps({'PG_DATE': used, 'slots': slots}, ensure_ascii=False)[:400])
            if CARD_0211 in subs: run.check('Y5_B：日期卡有「%s」（第 6 項）' % CARD_0211, True, '')
            else:
                land = [c for c in C if c['day'] is not None and dk['2030-01-01'] + 42 <= c['day'] <= dk['2030-01-01'] + 72]   # 2/12～3/14 落地
                run.check('Y5_B：日期卡有「%s」（第 6 項）' % CARD_0211, False, json.dumps({'subs': subs, '落在2/12～3/14': land}, ensure_ascii=False)[:400])
            run.check('Y5_B：日期卡沒有舊句「（二月底。…你第一次在開學那天沒有課。）」', CARD_0211_OLD not in subs, '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 【2】可昕 K26
KX_REL = {'rel': {'kexin': [45, 30, 20]}, 'contacts': ['kexin']}


async def s_k26(p, run, sid, out):
    res = out.setdefault(sid, {}); route = 'JP' if sid == 'K26_DELAY' else 'TW'
    fl = lambda dk: dict(route_flags(route, dk), dating_kexin=True, KX_OUR_DAY={'day': 'sun', 'mode': 'mid'})
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2029-07-05', 12.0, fl, KX_REL, label='%s（%s路線、和可昕交往；2029-07-05 12:00 校園）' % (sid, '日本（交換延畢）' if route == 'JP' else '臺灣'))
    try:
        res['pre'] = r
        rec = {}; d7 = dk['2029-07-07']
        until = "GAME.G.flags.KX_K26!=null&&!(GAME.D&&GAME.D.active)" if sid == 'K26_DELAY' else "(GAME.G.msgs||[]).some(m=>m.text===%s)||GAME.G.day>%d" % (json.dumps(K26_MISS[1]), d7)
        ok = await drive(pg, cdp, run, sid, until, 600, {'go': (['老地方'] if sid == 'K26_DELAY' else []), 'picks': []}, rec)
        await pg.wait_for_timeout(2500)
        log = await pg.evaluate("window.__LOG||[]"); cap = await pg.evaluate("window.__CAP||[]"); T = lines(log)
        M5 = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:kexin', dk['2029-07-05'], dk['2029-07-05']])); M7 = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:kexin', d7, d7]))
        fl_ = await pg.evaluate(FLAGS + "(%s)" % json.dumps(['KX_K26'])); res.update({'rec': rec, 'm5': M5, 'm7': M7, 'flags': fl_, 'cap': cap[-20:], 'log': log[-40:], 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        t5 = [m['text'] for m in M5]; t7 = [m['text'] for m in M7]
        run.check('%s：玩到 K26 演完／錯過（沒有卡住）' % sid, ok, json.dumps(res['end'], ensure_ascii=False))
        k5 = [m for m in M5 if m['text'] in K26_ASK]
        run.check('%s：7/5 21:00 兩則「%s」「%s」（AA_366 第 4 節 A7）' % (sid, K26_ASK[0], K26_ASK[1]), [m['text'] for m in k5] == K26_ASK and all(abs(m['h'] - 21) < 0.05 for m in k5), json.dumps(M5, ensure_ascii=False)[:300])
        run.check('%s：沒有舊句「%s」「%s」' % (sid, K26_ASK_OLD[0], K26_ASK_OLD[1]), not any(t in t5 for t in K26_ASK_OLD), '')
        pr = [x for x in rec['prompts'] if any('老地方' in o for o in x['opts'])]
        run.check('%s：7/7 停下來問「出發：…老地方」' % sid, bool(pr) and pr[0]['key'] == '2029-07-07', json.dumps(pr[:1], ensure_ascii=False)[:300])
        if sid == 'K26_DELAY':
            ttl = [x['t'] for x in log if x['n'] in ('［字卡］', '［字幕］')] + [c['t'] for c in cap]
            run.check('K26_DELAY：出發的字卡有「%s」、沒有舊的「%s」' % (K26_TITLE, K26_TITLE_OLD), any(K26_TITLE in t for t in ttl) and not any(K26_TITLE_OLD in t for t in ttl), json.dumps(ttl[-10:], ensure_ascii=False)[:300])
            evt = await pg.evaluate("(()=>{ const e=(STORY_EVENTS||[]).find(x=>x.id==='ev_kexin_after_grad'); return e?e.title:null; })()")
            run.check('K26_DELAY：【讀資料，不是玩】事件標題（日誌）是「%s」' % K26_TITLE, evt == K26_TITLE, json.dumps(evt, ensure_ascii=False))
            run.check('K26_DELAY：交換延畢那一句「%s」' % K26_DELAY, K26_DELAY in T, json.dumps(T[-8:], ensure_ascii=False)[:400])
            run.check('K26_DELAY：沒有舊句「%s」、也沒有臺灣路線那一句「%s」' % (K26_DELAY_OLD, K26_TW), K26_DELAY_OLD not in T and K26_TW not in T, '')
            run.check('K26_DELAY：KX_K26＝went', fl_.get('KX_K26') == 'went', json.dumps(fl_, ensure_ascii=False))
        else:
            run.check('K26_MISS：按「不去了」→ 7/7 16:00 兩則「%s」「%s」' % (K26_MISS[0], K26_MISS[1]), [m['text'] for m in M7 if m['text'] in K26_MISS] == K26_MISS and all(abs(m['h'] - 16) < 0.3 for m in M7 if m['text'] in K26_MISS), json.dumps(M7, ensure_ascii=False)[:300])
            run.check('K26_MISS：沒有舊句「%s」' % K26_MISS_OLD, K26_MISS_OLD not in t7, '')
            run.check('K26_MISS：KX_K26＝missed', fl_.get('KX_K26') == 'missed', json.dumps(fl_, ensure_ascii=False))
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 【3】可昕「我們的日子」四格
async def s_kxweek(p, run, sid, out):
    res = out.setdefault(sid, {})
    for k0, kd, new, old in KX_WEEK:
        tag = '%s %s' % (sid, kd); r0 = res.setdefault(kd, {})
        def fl(dk, k0=k0):
            F = dict(route_flags('TW', dk), dating_kexin=True, KX_OUR_DAY={'day': 'sun', 'mode': 'mid'})
            if k0 >= '2030-10-01': F.update({'FIRST_DAY_SEEN': True, 'PG': {'done': {'grad': 1, 'first': 1}}})   # 2030-10-01 第一份工作那一晚已經過了（不然讀檔就先演那一段）
            return F
        b, pg, cdp, errs, dk, r = await launch(p, run, tag, k0, 12.0, fl, KX_REL, label='%s（臺灣路線、和可昕交往；前一天 %s 12:00 校園）' % (tag, k0))
        try:
            r0['pre'] = r; rec = {}
            dd = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(kd))
            ok = await drive(pg, cdp, run, tag, "((window.__LOG||[]).some(x=>x.t===%s||x.t===%s)&&!(GAME.D&&GAME.D.active))||GAME.G.day>%d" % (json.dumps(new), json.dumps(old), dd), 420, {'go': ['我們的日子'], 'picks': []}, rec)
            await pg.wait_for_timeout(2000)
            log = await pg.evaluate("window.__LOG||[]"); T = lines(log); r0.update({'rec': rec, 'log': log[-20:], 'end': await pg.evaluate(STATE)})
            await run.shot(pg, '%s_end' % tag.replace(' ', '_'))
            pr = [x for x in rec['prompts'] if any('我們的日子' in o for o in x['opts'])]
            run.check('%s：%s 停下來問「%s：我們的日子…」' % (tag, kd, '打給她' if kd == '2030-01-05' else '出發'), bool(pr) and pr[0]['key'] == kd and any(o.startswith('打給她：' if kd == '2030-01-05' else '出發：') for o in pr[0]['opts']), json.dumps(pr[:1], ensure_ascii=False)[:300])
            run.check('%s：她那一句「%s」' % (tag, new), new in T, json.dumps(T[-5:], ensure_ascii=False)[:300])
            run.check('%s：沒有舊句「%s」' % (tag, old), old not in T, '')
            errs_check(run, tag, r0, errs)
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


# ---------------------------------------------------------------- 【6】明軒的尾聲
async def s_epi(p, run, sid, out):
    res = out.setdefault(sid, {})
    fl = lambda dk: dict(route_flags('TW', dk), BAR_YEAR=2030, FIRST_DAY_SEEN=True, PG={'done': {'grad': 1, 'first': 1}})
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2030-12-20', 12.0, fl, {'rel': {'classmate_mingxuan': [25, 10, 10]}},
                                           label='%s（2030 年考上：BAR_YEAR 2030；明軒熟悉；第一份工作那一晚已過；2030-12-20 12:00 校園）' % sid)
    try:
        res['pre'] = r; rec = {}
        ok = await drive(pg, cdp, run, sid, "!!GAME.G.flags.EPILOGUE_DONE||(window.__LOG||[]).some(x=>x.t===%s||x.t===%s)" % (json.dumps(MX_NEW), json.dumps(MX_OLD)), 900, {'picks': [], 'stuck': 420}, rec)
        await pg.wait_for_timeout(2000)
        log = await pg.evaluate("window.__LOG||[]"); T = lines(log); res.update({'rec': rec, 'log': log[-40:], 'end': await pg.evaluate(STATE)})
        await run.shot(pg, '%s_end' % sid)
        run.check('%s：跳到尾聲（2034-06-03 兩點半 Café），明軒那一桌有演' % sid, ok, json.dumps(res['end'], ensure_ascii=False))
        run.check('%s：明軒「%s」（AA_382 第 5 節）' % (sid, MX_NEW), MX_NEW in T, json.dumps([t for t in T if '放榜' in t], ensure_ascii=False)[:300])
        run.check('%s：沒有舊句「%s」' % (sid, MX_OLD), MX_OLD not in T, '')
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 【7】芷若選了方奕廷的尾聲（RELEASE-9106-TEST 第 5 項，958c3fc1：ZR_FY）
ZR_FYL = '（他去倒水的時候）他到現在還記得我每一部看過的電影。……連我自己忘了的都記得。'
ZR_MAIN = ['公館那間小戲院，這個月放的都是老片。四十個座位。', '倒數第三排，我還是留給一個人來的客人。']
FY_ZR = ['我下個月調回台北。', '她說戲院週末缺一個人顧門口。']
FY_2030 = '那一年你在考試。……我知道。'


async def s_epi_zr(p, run, sid, out):
    """EPI_ZRFY：舊存檔的 F3（FANG_F3 direct、5/29）＝ZZ 建起來 fy seeing → ZR_FY；尾聲芷若 zr.fy、奕廷 fy.zr。EPI_ZR：對照（沒有 F3）"""
    res = out.setdefault(sid, {}); fy = sid == 'EPI_ZRFY'
    def fl(dk):
        F = dict(route_flags('TW', dk), BAR_YEAR=2030, FIRST_DAY_SEEN=True, PG={'done': {'grad': 1, 'first': 1}})
        if fy: F.update({'FANG_F3': 'direct', 'FANG_F3_DAY': dk['2028-05-29'], 'FANG_F3_J1': dk['2028-05-29']})
        return F
    b, pg, cdp, errs, dk, r = await launch(p, run, sid, '2030-12-20', 12.0, fl, {'rel': {'heroine_02': [45, 30, 10], 'npc_fangyt': [25, 10, 10]}},
                                           label='%s（2030 年考上；芷若朋友、奕廷熟悉；%s；2030-12-20 12:00 校園）' % (sid, '2028-05-29 F3 芷若答應了奕廷（FANG_F3 direct，沒有 ZZ 紀錄＝舊存檔）' if fy else '沒有 F3'))
    try:
        res['pre'] = r; rec = {}
        zz0 = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {fy:(F.ZZ||{}).fy||null, ZR_FY:F.ZR_FY===undefined?null:F.ZR_FY}; })()")
        stop = [FY_ZR[1], FY_2030, '山上沒有訊號。所以我每次下山，都會一次收到很多訊息。']   # BB-B 10-23：原本停在 FY_ZR[0]＝第二句還沒說就停了（9f9e13cc 第一次跑 FAIL 的原因）
        ok = await drive(pg, cdp, run, sid, "!!GAME.G.flags.EPILOGUE_DONE||(window.__LOG||[]).some(x=>%s.includes(x.t))" % json.dumps(stop), 900, {'picks': [], 'stuck': 420}, rec)
        await pg.wait_for_timeout(2000)
        log = await pg.evaluate("window.__LOG||[]"); T = lines(log); res.update({'rec': rec, 'log': log[-40:], 'end': await pg.evaluate(STATE)})
        zz = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {fy:(F.ZZ||{}).fy||null, ZR_FY:F.ZR_FY===undefined?null:F.ZR_FY}; })()"); res['zz'] = [zz0, zz]
        await run.shot(pg, '%s_end' % sid)
        run.check('%s：跳到尾聲（2034-06-03 兩點半 Café），芷若、奕廷那一桌有演' % sid, ok, json.dumps(res['end'], ensure_ascii=False))
        if fy:
            run.check('%s：ZZ fy seeing → ZR_FY true（讀檔後遊戲自己記）' % sid, zz['fy'] == 'seeing' and zz['ZR_FY'] is True, json.dumps(res['zz'], ensure_ascii=False))
            run.check('%s：芷若「%s」' % (sid, ZR_FYL[:18]), ZR_FYL in T and ZR_MAIN[0] not in T, json.dumps([t for t in T if '戲院' in t or '電影' in t], ensure_ascii=False)[:300])
            run.check('%s：奕廷「%s」「%s」' % (sid, FY_ZR[0], FY_ZR[1]), all(x in T for x in FY_ZR), json.dumps(T[-8:], ensure_ascii=False)[:400])
        else:
            run.check('%s：對照——芷若照原本「%s」、沒有 zr.fy' % (sid, ZR_MAIN[0][:12]), ZR_MAIN[0] in T and ZR_FYL not in T, json.dumps([t for t in T if '戲院' in t or '電影' in t], ensure_ascii=False)[:300])
            run.check('%s：對照——奕廷不是 fy.zr' % sid, FY_ZR[0] not in T, json.dumps(T[-8:], ensure_ascii=False)[:400])
        errs_check(run, sid, res, errs)
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


ORDER = ['SEA_GO', 'SEA_NO', 'SEA_NOREPLY', 'SEA_SIT', 'SEA_LATE', 'SEA_FRIEND', 'GRAD_US', 'GRAD_JP', 'CARD_US', 'CARD_JP', 'Y5_A', 'Y5_B', 'K26_DELAY', 'K26_MISS', 'KX_WEEK', 'EPI_MX', 'EPI_ZRFY', 'EPI_ZR']
FN = dict({k: s_sea for k in SEA}, GRAD_US=s_grad, GRAD_JP=s_grad, CARD_US=s_card, CARD_JP=s_card, Y5_A=s_y5, Y5_B=s_y5, K26_DELAY=s_k26, K26_MISS=s_k26, KX_WEEK=s_kxweek, EPI_MX=s_epi, EPI_ZRFY=s_epi_zr, EPI_ZR=s_epi_zr)


async def main():
    run = L.Run('aa382', OUT); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa382.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
