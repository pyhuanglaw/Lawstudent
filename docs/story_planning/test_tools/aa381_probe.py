"""BB（帳號 A）2026-10-22：AA381-Y4S2-FIX-1021（AA_381 第 1、2 節；開發分支 5464b872 起；LAWWW 03:17 派）——照 AA_381 第 4 節的 BB 測試。
第 1 節：交換延畢的玩家（日本、美國路線）6/2 典禮那天大家不說「畢業快樂」；臺灣路線照舊。第 2 節：語彤週四 17:00～20:00 的去處一次定完。
下面「應該演的台詞」照 AA_381 第 1 節表格的原文寫（不是照程式）。
  US_SIS     美國路線、和學姊交往（語彤朋友；沛珊、芷若熟悉＝會收到她們 6/2 的訊息）：2029-06-02 07:18 宿舍 → 家人那一段（照玩家點）→ 12:00 拍照：
             學姊遞保溫瓶第 2 句「學士服借的吧。……一月還要再穿一次。」；語彤（有伴侶）「恭喜。……我們兩個的證書，都還要再等。」；阿凱「恭喜一半。宵夜？」「……現在才中午。」「那晚上。」；
             學姊女朋友的約「好。」→ 17:00「出發」吃飯 → 走回研究室的生日（交往中版：沒有「生日快樂。」那個選項）；沛珊 12:30「我學生說要送穿學士服的人卡片。……我拍給你。」「恭喜！」、
             芷若 21:00「恭喜。今天下午替你看了一部。」；家人那一段「（還差一門實習，證書下學期才拿得到。）」；整天（台詞＋6/2 的手機訊息）沒有任何一句「畢業快樂」
  US_FRIEND  美國路線、學姊朋友＋心意邀約（語彤朋友）：保溫瓶同一句、語彤（朋友）「我們兩個都還沒畢業。……今天先穿一次學士服。」、阿凱同上；
             學姊心意邀約回「今天晚上我有約了。」→「好。……今天恭喜。」；Café「不去了」→ 19:30 家族群組 Kevin → 20:30「出發」學姊的生日 →「生日快樂。」→「嗯。」
             「今天你穿學士服，我生日。都沒排，結果還不錯。」；整天沒有「畢業快樂」
  TW_FRIEND  臺灣路線（照舊）同上的存檔＋沛珊、芷若：「畢業快樂。」（保溫瓶）、「恭喜。……我還要一年，今天先穿一次學士服。」、「畢業快樂。宵夜？」、「好。畢業快樂。」、
             生日「今天你畢業，我生日。都沒排，結果還不錯。」、沛珊「畢業快樂！」、芷若「畢業快樂。今天下午替你看了一部。」；沒有「還差一門實習」
  JP_AN      日本路線、和以安交往、學姊朋友＋心意邀約：以安媽媽那一段（伴侶版）、保溫瓶「學士服借的吧。…」；學姊的心意邀約「好。」→ 接著以安的女朋友約＝你說「今天晚上我有約了。」、
             以安「好。今天恭喜。」（AUTO_NO_GRAD 交換延畢版）；17:00「出發」和學姊吃飯（回家路上：「（先不說）」、她說了以後「讓我想想。」）→ 走回研究室的生日（友情版）→「生日快樂。」→
             「今天你穿學士服，我生日。…」；整天沒有「畢業快樂」
  YT_THU     語彤週四 17:00～20:00（第 2 節）：大四下 2029-03-08、大四上 2028-09-07＝總圖三樓（手機「朋友」寫「總圖 3F 閱覽區」＋從大廳二樓樓梯間走進 3F 看得到她）；
             大三下 2028-03-02＝「在做田野訪談」（手機「朋友」寫這一句）
【前置】
  6/2 那四個情境：最小存檔（照 pgdate_probe.py 的做法：stage law、2029-06-02 07:18 宿舍、PACKED_Y4、Y4_PATH other、BAR_REG false、ROOM_Y2～Y4、大一的引導旗標、
  路線旗標 EXCHANGE_ROUTE＋EXCH_RULE；美國再加 US_DEPARTED／US_ARRIVED／US_RETURNED、日本加 X1_JP／JP_DEPARTED／JP_RETURNED——沒有這幾個，美國路線讀檔就會開始「出發去美國」），
  讀檔後馬上（07:30 家人那一段開始以前）在頁面裡設學姊／語彤／以安朋友（熟 48、信任 32、自在 20）、沛珊／芷若熟悉（沛珊加 PS_RECONNECT）、學姊心意邀約的條件（她的戀愛 40、校外約會紀錄 4 次＋心願）、
  交往（ROM.start）、加入家族群組、麵店團；quiet_events（條件事件、手機自動打開關掉）。
  YT_THU：使用者存檔改日期（照 aa379b_probe.py 的 launch），語彤設朋友、YT_EV13；quiet_events。
之後照玩家：點對話、選項（照情境）、時間到了按「出發」（學期末的飯、學姊的生日），Café「不去了」；畢業後篇站著不動會自己跳到下一件事（不按跳過時間）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=US_SIS,... python3 aa381_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
def say(*a): print(' '.join(str(x) for x in a), flush=True)
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); }; })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
DAYMSGS = """(k=>{ const d=STORY.dayOfKey(k); return (GAME.G.msgs||[]).filter(m=>m.day===d).map(m=>({th:m.th||'', h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', tag:m.tag||'', text:String(m.text||'')})); })"""
FLAGS = """(()=>{ const F=GAME.G.flags; const o={}; for(const k of ['GRADUATED','GRAD_DONE','SIS_THERMOS','SIS_BDAY_Y4','GRAD_EVENING','GRAD_ENVELOPE','EXCHANGE_ROUTE','US_DEPARTED','PS_GRAD_CARD']) o[k]=F[k]===undefined?null:F[k];
  o.delayed=typeof PG!=='undefined'&&PG.delayed?PG.delayed(GAME.G):null; o.pgDone=(F.PG&&F.PG.done)||null; o.outs=(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^te_|^pg_/.test(q.id||'')).map(q=>[q.id,q.state,q.title]); return o; })()"""
# 6/2 讀檔後在頁面裡補的關係（sc：sis／yt／an＝朋友、ps／zr＝熟悉、sisHeart＝學姊心意邀約的條件、dating＝交往的人）
SETUP = """(sc=>{ const G=GAME.G, F=G.flags; const rel=(id,v)=>{ const R=SOCIAL.rel(id); R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); return R; };
  const FR=[48,32,20], FA=[25,5,5];
  if(sc.sis){ rel('heroine_05',FR); F.met_sis=true; F.SIS_W1=true; }
  if(sc.yt) rel('heroine_03',FR); if(sc.an) rel('heroine_01',FR);
  if(sc.ps){ rel('classmate_peishan',FA); F.PS_RECONNECT=true; } if(sc.zr) rel('heroine_02',FA);
  if(sc.sisHeart){ SOCIAL.rel('heroine_05').npcRom=40; const Lg=DATE.log(G,'heroine_05'); Lg.count=4; Lg.wish=true; }
  for(const id of (sc.dating||[])){ try{ ROM.start(G,id); }catch(e){} F['dating_'+id]=true; const R=rel(id,[70,60,60]); R.rom=70; R.npcRom=70; }
  PHONE.join(G,'family_law','法律系直屬家族'); PHONE.join(G,'noodle_team','麵店團');
  let heart=null; try{ heart=sc.sisHeart?TERMEND.heartWhy(G,'heroine_05',TERMEND.windowOf('Y4S2')):null; }catch(e){ heart='ERR '+e.message; }
  return {delayed:PG.delayed(G), route:STORY.route?STORY.route(G):null, partners:PG.partners(G), sisOk:PG.sisOk(G), heart, fam:!!(PHONE.inGroup&&PHONE.inGroup(G,'family_law')), gradReady:PG.gradReady(G), abroad:STORY.abroad(G),
    stages:{sis:SOCIAL.stage('heroine_05'), yt:SOCIAL.stage('heroine_03'), an:SOCIAL.stage('heroine_01'), ps:SOCIAL.stage('classmate_peishan'), zr:SOCIAL.stage('heroine_02')}}; })"""
# 照 AA_381 第 1 節表格（交換延畢那一欄／現在那一欄）＋ postgrad_lines.js 沒改的句子
TH_NARR = '（她還穿著碩士服，手上拿著一個新的保溫瓶。）'; TH_REST = ['（把保溫瓶遞給他）裡面是熱水。不是咖啡。', '每天帶出門。']
TH2_D = '學士服借的吧。……一月還要再穿一次。'; TH2_T = '畢業快樂。'
KAI_D = ['恭喜一半。宵夜？', '……現在才中午。', '那晚上。']; KAI_T = ['畢業快樂。宵夜？', '……現在才中午。', '那晚上。']
YT_FRIEND_D = '我們兩個都還沒畢業。……今天先穿一次學士服。'; YT_FRIEND_T = '恭喜。……我還要一年，今天先穿一次學士服。'
YT_OTHER_D = '恭喜。……我們兩個的證書，都還要再等。'; YT_OTHER_T = '恭喜。我證書還要再等一年。'
SIS_HEART_INV = '今天晚上……飯吃完，跟我回研究室。'; SIS_DEC_D = '好。……今天恭喜。'; SIS_DEC_T = '好。畢業快樂。'
SIS_GF_INV = '今天的計畫本，晚上那一格是空的。……留給你。'
AN_GF_INV = '今天不讀書。……晚上的位子我訂好了。'; AN_NO_D = '好。今天恭喜。'; ME_NO = '今天晚上我有約了。'
MOM_PARTNER = ['媽，這是{name}。', '我知道。妳說過很多次。', '……一次而已。']
BD_FRIEND = ['（研究室的燈只開了一半。長桌上一個蛋糕，比她平常吃的大很多。Kevin 在點蠟燭。）', '學姊！快！蠟燭要燒完了！', '……我說過不用。', '……謝謝。蠟燭一根就好。', '{name}也來了。']
BD_YES_D = ['嗯。', '今天你穿學士服，我生日。都沒排，結果還不錯。']; BD_YES_T = ['嗯。', '今天你畢業，我生日。都沒排，結果還不錯。']
BD_LOVER = ['……許願要說出來嗎？', '……不說。這次不排。']
PS_D = ['我學生說要送穿學士服的人卡片。……我拍給你。', '恭喜！']; PS_T = ['我學生說要送畢業的人卡片。……我拍給你。', '畢業快樂！']
ZR_D = '恭喜。今天下午替你看了一部。'; ZR_T = '畢業快樂。今天下午替你看了一部。'
LATE_NARR = '（還差一門實習，證書下學期才拿得到。）'; KEVIN_BDAY = '學姊今天生日，研究室，八點半。'
GO_KEYS = ('學期末的飯', '學姊的生日')
_RUN = {}


async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def ours(o):
    return o.startswith(('出發：', '接起來：')) and any(k in o for k in GO_KEYS)


def pick_idx(ops, picks=None):
    """picks（要選的字，依序找）→ 我們要去的出遊（學期末的飯、學姊的生日）→ 起床、跳過時間、說話完 → 別的出遊「不去了」→ 第一個"""
    for want in picks or []:
        for i, o in enumerate(ops):
            if want in o: return i
    for i, o in enumerate(ops):
        if ours(o): return i
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


async def wait_for(pg, cdp, run, cond, max_s=400, picks=None, label=''):
    """時間照走（不按跳過時間；畢業後篇站著不動會自己跳），遇到對話、選項照 pick_idx 點，直到 cond（JS）成立"""
    t0 = time.time(); ch = []; shots = 0
    while time.time() - t0 < max_s:
        if await pg.evaluate(cond): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); await pg.wait_for_timeout(600); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                if shots < 10: await run.shot(pg, '%s_choice%d' % (label, len(ch))); shots += 1
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def friends_row(pg, cdp, who, label):
    await phone_tab(pg, cdp, 'friends')
    r = await pg.evaluate("""(id=>{ const b=document.querySelector('#phoneBody [data-person="'+id+'"]'); const row=b?b.closest('.item'):null; if(row) row.scrollIntoView({block:'center'}); return {text:row?row.innerText.replace(/\\n/g,'｜'):null}; })(%s)""" % json.dumps(who))
    if _RUN.get('run'): await _RUN['run'].shot(pg, '%s_friends' % label)
    await L.phone_away(pg, cdp); return r


def texts(log, name):
    return [x['t'].replace('{name}', name) for x in log if x['n'] != '［選項］']


def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None


def chk_seq(run, sid, T, exp, what, name='祐廷'):
    exp = [e.replace('{name}', name) for e in exp]; miss = in_order(T, exp)
    run.check('%s：%s' % (sid, what), miss is None, ('缺「%s」｜' % miss if miss else '') + json.dumps([t for t in T if any(k in t for k in ('保溫瓶', '畢業', '恭喜', '宵夜', '學士服', '生日', '蠟燭', '許願', '有約', '我知道', '這是'))][:30], ensure_ascii=False)[:900])


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


# ---------------------------------------------------------------- 6/2
GRAD = {'US_SIS': dict(route='US', sis=True, yt=True, an=False, ps=True, zr=True, sisHeart=False, dating=['heroine_05'], picks=['生日快樂'], delayed=True),
        'US_FRIEND': dict(route='US', sis=True, yt=True, an=False, ps=False, zr=False, sisHeart=True, dating=[], picks=[ME_NO, '生日快樂'], delayed=True),
        'TW_FRIEND': dict(route='TW', sis=True, yt=True, an=False, ps=True, zr=True, sisHeart=True, dating=[], picks=[ME_NO, '生日快樂'], delayed=False),
        'JP_AN': dict(route='JP', sis=True, yt=True, an=True, ps=False, zr=False, sisHeart=True, dating=['heroine_01'], picks=['（先不說）', '讓我想想', '生日快樂'], delayed=True)}
DK_KEYS = ('2025-09-24', '2026-09-06', '2027-09-05', '2028-09-03', '2029-06-01', '2029-06-02', '2028-02-20', '2028-03-25', '2028-08-05', '2028-08-02', '2028-12-23')


async def launch_min(p, run, sid, sc):
    """最小存檔（pgdate_probe.py 的 base_state 做法）讀到 2029-06-02 07:18 宿舍；家人那一段 07:30 才開始，讀檔後馬上補關係"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    dk = {k: await pg.evaluate("STORY.dayOfKey('%s')" % k) for k in DK_KEYS}
    F = {'KX_DEC3_MIGRATED': True, 'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'],
         'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'met_sis': True, 'SIS_W1': True,
         'EXCHANGE_ROUTE': sc['route'], 'EXCH_RULE': 1}
    if sc['route'] == 'US': F.update({'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': dk['2028-08-02'], 'US_RETURNED': dk['2028-12-23']})
    if sc['route'] == 'JP': F.update({'X1_JP': dk['2028-02-20'], 'JP_DEPARTED': dk['2028-03-25'], 'JP_RETURNED': dk['2028-08-05'], 'AN_SENDOFF': 'together'})
    day = dk['2029-06-02']
    st = {'v': 3, 'stage': 'law', 'name': '祐廷', 'day': day, 'hour': 7.3, 'energy': 100, 'money': 30000, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'flags': F,
          'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day), 'contacts': {'heroine_05': dk['2025-09-24'], 'heroine_03': dk['2025-09-24'], 'heroine_01': dk['2025-09-24']},
          'events': {'done': {'ev_sis_w1': 1}, 'last': {}, 'count': 0}}
    await L.load_state(pg, st, quiet_events=True)
    await pg.evaluate(HOOK); r = await pg.evaluate(SETUP + "(%s)" % json.dumps(sc))
    now = await pg.evaluate(STATE)
    run.setup('[前置] %s：最小存檔 2029-06-02 07:18 宿舍（stage law、PACKED_Y4、Y4_PATH other、BAR_REG false、ROOM_Y2～Y4、EXCHANGE_ROUTE=%s%s）＋讀檔後馬上設 學姊%s、語彤%s、以安%s、沛珊%s、芷若%s、'
              '學姊心意邀約%s、交往 %s、家族群組、麵店團；quiet_events → 設完是 %s %.2f；%s' % (
        sid, sc['route'], {'US': '＋US_DEPARTED／ARRIVED／RETURNED', 'JP': '＋X1_JP／JP_DEPARTED／JP_RETURNED'}.get(sc['route'], ''), '朋友' if sc['sis'] else '—', '朋友' if sc['yt'] else '—',
        '朋友' if sc['an'] else '—', '熟悉＋PS_RECONNECT' if sc['ps'] else '—', '熟悉' if sc['zr'] else '—', '有' if sc['sisHeart'] else '無', sc['dating'], now['key'], now['h'], json.dumps(r, ensure_ascii=False)))
    say('   %s 設定：%s' % (sid, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r, dk


async def s_grad(p, run, base, sid, out):
    res = out.setdefault(sid, {}); sc = GRAD[sid]; d = sc['delayed']
    b, pg, cdp, errs, r, dk = await launch_min(p, run, sid, sc)
    try:
        run.check('%s：前置——交換延畢＝%s（PG.delayed）、學姊 sisOk、不在國外%s' % (sid, d, '、心意邀約成立' if sc['sisHeart'] else ''),
                  r.get('delayed') == d and r.get('sisOk') is True and r.get('abroad') is False and (not sc['sisHeart'] or r.get('heart') is True), json.dumps(r, ensure_ascii=False))
        ok, ch = await wait_for(pg, cdp, run, "GAME.G.day>%d||GAME.G.hour>=21.75" % dk['2029-06-02'], max_s=1800, picks=sc['picks'], label=sid)
        res['reached'] = ok; res['ch'] = ch
        log = await pg.evaluate("window.__LOG||[]"); res['log'] = log; T = texts(log, '祐廷'); fl = await pg.evaluate(FLAGS); res['flags'] = fl
        M = await pg.evaluate(DAYMSGS + "('2029-06-02')"); res['msgs'] = M; MT = [m['text'] for m in M]
        await run.shot(pg, '%s_end' % sid)
        run.check('%s：玩到 6/2 21:45（或隔天）' % sid, ok, json.dumps({'now': await pg.evaluate(STATE), 'flags': fl}, ensure_ascii=False)[:400])
        run.check('%s：沒有被帶去「出發去美國／日本」（6/2 一直在臺灣）' % sid, not any(k in t for t in T for k in ('桃園機場', '飛往美國', '飛往日本')) and fl.get('EXCHANGE_ROUTE') == sc['route'], json.dumps(fl, ensure_ascii=False)[:200])
        run.check('%s：拍照演完（GRADUATED、PG done grad）' % sid, bool(fl.get('GRADUATED')) and bool((fl.get('pgDone') or {}).get('grad')), json.dumps(fl, ensure_ascii=False)[:300])
        # 家人那一段
        run.check('%s：家人那一段%s「%s」' % (sid, '有' if d else '沒有', LATE_NARR), (LATE_NARR in T) == d, '')
        # 保溫瓶
        chk_seq(run, sid, T, [TH_NARR, TH2_D if d else TH2_T] + TH_REST, '學姊遞保溫瓶：第 2 句「%s」' % (TH2_D if d else TH2_T))
        # 阿凱
        chk_seq(run, sid, T, KAI_D if d else KAI_T, '阿凱「%s」，後面兩句照舊' % (KAI_D if d else KAI_T)[0])
        # 語彤
        yt = (YT_OTHER_D if d else YT_OTHER_T) if sc['dating'] else (YT_FRIEND_D if d else YT_FRIEND_T)
        chk_seq(run, sid, T, [yt], '語彤（%s）「%s」' % ('有伴侶' if sc['dating'] else '朋友', yt))
        # 沛珊、芷若（手機）
        if sc['ps']:
            ps = PS_D if d else PS_T
            run.check('%s：12:30 沛珊的卡片照片「%s」「%s」' % (sid, ps[0], ps[1]), all(t in MT for t in ps), json.dumps([m for m in M if 'peishan' in m['th']], ensure_ascii=False)[:300])
        if sc['zr']:
            zr = ZR_D if d else ZR_T
            run.check('%s：21:00 芷若「%s」' % (sid, zr), zr in MT, json.dumps([m for m in M if 'heroine_02' in m['th']], ensure_ascii=False)[:300])
        # 傍晚的約
        if sid == 'US_SIS':
            chk_seq(run, sid, T, [SIS_GF_INV], '學姊女朋友的約「%s」' % SIS_GF_INV)
            run.check('%s：答應以後 17:30 和她吃飯（te_gf 出遊 done）' % sid, any(o[0].startswith('te_gf_Y4S2_heroine_05') and o[1] == 'done' for o in fl.get('outs') or []), json.dumps(fl.get('outs'), ensure_ascii=False))
            chk_seq(run, sid, T, BD_LOVER, '走回研究室的生日＝交往中版（「……許願要說出來嗎？」…）')
            run.check('%s：交往中的生日沒有「生日快樂。」那個選項（AA_381 第 4 節寫的「今天你穿學士服」是朋友版那一句，交往中聽不到；朋友版在 US_FRIEND 測）' % sid,
                      not any('生日快樂' in c for x in ch for c in x['opts']), json.dumps([x['opts'] for x in ch][-4:], ensure_ascii=False)[:300])
            run.check('%s：SIS_BDAY_Y4＝lover' % sid, fl.get('SIS_BDAY_Y4') == 'lover', json.dumps(fl, ensure_ascii=False)[:200])
        elif sid in ('US_FRIEND', 'TW_FRIEND'):
            chk_seq(run, sid, T, [SIS_HEART_INV, SIS_DEC_D if d else SIS_DEC_T], '學姊心意邀約回「今天晚上我有約了。」→「%s」' % (SIS_DEC_D if d else SIS_DEC_T))
            run.check('%s：19:30 家族群組 Kevin「%s」' % (sid, KEVIN_BDAY), KEVIN_BDAY in MT, json.dumps([m for m in M if 'family' in m['th']], ensure_ascii=False)[:300])
            chk_seq(run, sid, T, BD_FRIEND + (BD_YES_D if d else BD_YES_T), '20:30 學姊的生日（友情版）→「生日快樂。」→「%s」' % (BD_YES_D if d else BD_YES_T)[1])
            run.check('%s：SIS_BDAY_Y4＝there' % sid, fl.get('SIS_BDAY_Y4') == 'there', json.dumps(fl, ensure_ascii=False)[:200])
        else:   # JP_AN
            chk_seq(run, sid, T, MOM_PARTNER, '以安媽媽那一段（伴侶版：「媽，這是{name}。」…）')
            chk_seq(run, sid, T, [SIS_HEART_INV, AN_GF_INV, ME_NO, AN_NO_D], '學姊心意邀約「好。」→ 以安的約：你「今天晚上我有約了。」、以安「%s」' % AN_NO_D)
            chk_seq(run, sid, T, BD_FRIEND + BD_YES_D, '和學姊吃飯以後走回研究室的生日（友情版）→「生日快樂。」→「%s」' % BD_YES_D[1])
        # 整天沒有「畢業快樂」（交換延畢）／臺灣路線有
        bad = [t for t in T if '畢業快樂' in t] + [t for t in MT if '畢業快樂' in t]
        if d: run.check('%s：整天（台詞＋6/2 手機訊息）沒有任何一句「畢業快樂」' % sid, not bad, json.dumps(bad, ensure_ascii=False)[:400])
        else: run.check('%s：臺灣路線照舊有「畢業快樂」' % sid, bool(bad), json.dumps(bad, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    await close(b)


# ---------------------------------------------------------------- 語彤週四
async def launch_user(p, run, base, key, h, zone, js=None, label=''):
    """使用者存檔改日期（aa379b_probe.py 的 launch 做法）"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
    for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
        dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
        if dd <= d: F[k] = dd
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    F['KX_DEC3_MIGRATED'] = True; F['afternoonDone'] = True
    G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(js) if js else None
    run.setup('[前置] %s：使用者存檔改到 %s %.2f %s（quiet_events）→ %s' % (label, key, h, zone, json.dumps(r, ensure_ascii=False)))
    return b, pg, cdp, errs, r


YT_SET = "(()=>{ const R=SOCIAL.rel('heroine_03'); R.fam=48; R.trust=32; R.comf=20; SOCIAL.remember('heroine_03','FIRST_MET',''); GAME.G.flags.YT_EV13=true; const V=GAME.G.visited||(GAME.G.visited={}); V.library=true; V.library_hall=true; return {stage:SOCIAL.stage('heroine_03'), thuFree:STORY.ytThuFree(GAME.G), sched:STORY.schedEnt(CHARACTERS.heroine_03,GAME.G)}; })()"
YT_NPC = "(()=>{ const n=(GAME.E.npcs||[]).find(q=>q&&(q.charId==='heroine_03'||q.id==='heroine_03')); return n&&n.obj?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), visible:n.obj.visible!==false, pose:n.pose||null, seat:!!n.seat}:null; })()"


async def s_ytthu(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    for key, want in (('2029-03-08', 'lib'), ('2028-09-07', 'lib'), ('2028-03-02', 'field')):
        tag = '%s-%s' % (sid, key); r0 = res.setdefault(key, {})
        b, pg, cdp, errs, r = await launch_user(p, run, base, key, 17.6, 'library_hall', js=YT_SET, label=tag + '（語彤朋友、YT_EV13；讀檔在總圖大廳）')
        try:
            await pg.wait_for_timeout(2000); row = await friends_row(pg, cdp, 'heroine_03', tag); r0['row'] = row; r0['set'] = r
            txt = (row or {}).get('text') or ''
            if want == 'lib':
                run.check('%s：%s（週四）17:36 手機「朋友」語彤在「總圖 3F 閱覽區」' % (tag, key), '總圖 3F' in txt, txt[:200])
                it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
                seen = None
                if it:
                    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=240, lv=it[2]); await L.tap(pg, cdp, '#interact')
                    for _ in range(40):
                        await pg.wait_for_timeout(1000)
                        if (await pg.evaluate("GAME.G.zone")) == 'library': break
                    await pg.wait_for_timeout(6000)
                    seen = await pg.evaluate(YT_NPC)
                    await run.shot(pg, '%s_3f' % tag)
                r0['seen'] = seen
                run.check('%s：從大廳二樓樓梯間走進 3F 閱覽室，看得到語彤' % tag, bool(seen) and seen.get('visible'), json.dumps({'door': it, 'zone': await pg.evaluate("GAME.G.zone"), 'her': seen}, ensure_ascii=False))
            else:
                run.check('%s：%s（大三下週四）17:36 手機「朋友」語彤「在做田野訪談」' % (tag, key), '田野' in txt, txt[:200])
            r0['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, json.dumps(errs[:3], ensure_ascii=False))
        except Exception as e: r0['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % tag, False, str(e)[:300])
        await close(b)


ORDER = ['US_SIS', 'US_FRIEND', 'TW_FRIEND', 'JP_AN', 'YT_THU']
FN = {'US_SIS': s_grad, 'US_FRIEND': s_grad, 'TW_FRIEND': s_grad, 'JP_AN': s_grad, 'YT_THU': s_ytthu}


async def main():
    run = L.Run('aa381', OUT); _RUN['run'] = run; base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'aa381.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
