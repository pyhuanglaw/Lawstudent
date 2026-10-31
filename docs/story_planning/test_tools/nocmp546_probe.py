"""BB-B 10-31：NO-COMPARE-1030 剩下的部分（LAWWW-B 要的瀏覽器驗收；AA_546 第 0、3、4、7 節；遊戲工作樹 lwren20＝00a88c56f）。
每一場查三件事：①畫面上的句子和 AA_546 新稿一字不差 ②沒有舊的比較句（AA_546 列的那幾句，加上「排名、第一名、第二名、誰比較強、贏他、贏我、輸給、比我、比她、不服氣、不真心」，
AA_546 新句自己留下的「第二名」「比我早到」不算）③沒有 JS 例外。
走真實流程（不用 ?turbo）：日期、地點、關係、旗標是【前置】（使用者存檔改日子，讀檔後設關係；要在人物生成以前設的，設好以後同一份進度重讀），用 run.setup 標出來；
玩家動作（走到他旁邊、按「和〇〇說話」、點選項、開手機看動態／訊息、按留言／私訊問／回覆鍵、等時間到）照畫面做，不直接呼叫事件。Playwright 手機橫向模擬，不是 iPhone。
前置先在 Node 算過（nocmp546_pre.js＋同一份使用者存檔：那一天那一刻會出、會出哪幾句）。
 第 0 節 宿營破冰（camp_y1.js:66～77）
  CAMP    標題「從法律系開始」新遊戲（不改狀態）→ 回顧 → 8/22 遊覽車選「坐阿哲旁邊」（照舊：「我阿哲。張哲維。高雄上來的。」）→ 破冰：
          小隊輔「第二個。名字接龍，順便講你從哪裡來。…」、阿哲／芯慈／沛珊（中間「……前面是阿哲、還有、呃……」「（小聲）芯慈。」照舊）／明軒／柏翰／凱文六句照順序、
          選項只有「「臺北。我家就在這附近。」」「「臺北人。」」→ 選「臺北。我家就在這附近。」→ 小隊輔「好，七個人都記住了吧。」；沒有早餐的句子
  CAMP2   同上，遊覽車選「坐明軒旁邊」、破冰選「臺北人。」（可省）
 第 7 節 明軒的個性
  MX7     使用者存檔原樣（2025-09-25 15:44 溫州街，已經認識明軒）：手機「朋友」→ 江明軒「資料」：有「看起來很輕鬆，其實自己偷偷念；社團活動比上課重要；跟阿哲一起打球」、
          沒有「看起來完全沒念書，考試卻很高分」
 第 3 節 子晴、阿凱
  ZQ3_CM  2025-11-15（大一上第 11 週週六）17:56 宿舍、子晴 FRIEND＋聯絡方式 → 等到 18:01：動態「（照片：排行榜的截圖…）」「第三」→ 按留言「恭喜！」→「謝謝。第一是你室友，他寫得超漂亮」；
          →【前置】同一份進度跳到 23:26 → 等到 23:31：私訊「你室友第一」「他都沒講？」「……他真的很不會講」→ 回「他沒講。」→「欸 你幫我恭喜他 他那題寫得好漂亮」
  ZQ3_DM  同上，按「（私訊問一句）第一是我室友？」→「對 我要去問他那題怎麼寫」；23:31 回「妳第三也很強。」→「謝謝」「下次換我教他一題」
  KAI203  2025-11-18（第 12 週週二）20:15 宿舍、【捷徑】DORM_FOUR（讀檔前寫進存檔＝203 四人房；使用者存檔是舊開局，沒有四人房）、認識子晴、ZQ_PRACTICE 沒有：
          和阿凱說話 → 第一句「系上那個練習賽，子晴第三。她跑來問我那題怎麼寫，問了一個小時。」（週日～四 21～24 點會先演 K-D1 一起打電動，所以 20:15）
  ZQL3    2026-05-12（大一下第 12 週週二）14:36 校園、子晴 FAMILIAR＋記憶 CONTEST_DAY、【捷徑】閒聊階梯停在 Q2-L3（ladder heroine_04@Y1S2＝2）、升級門檻台詞當作說過了，
          設好以後同一份進度重讀：走到子晴旁邊（作息「走走」）和她說話 →「比賽的結果出來了。我們系拿了第二名。」「……我傳了恭喜。他們熬了三個禮拜，很值得。」→ 選「妳還好嗎？」
  ZQL3_W  同上但沒有 CONTEST_DAY（第 10～16 週那一版）：只記看到的句子（「我沒去。……恭喜我傳了。真心的。大部分是。」＝AA_546 沒列、灰色），查沒有 AA_546 列的舊句
 第 4 節 可昕（使用者存檔裡和可昕交往中，不動；大二以後 EXCHANGE_ROUTE＝TW）
  KX5     2025-11-20（大一上第 12 週週四）23:46、可昕 FRIEND 數值 → 等到 23:51：動態「予樂寫的。她自己都還沒念。」→ 留言「妳呢？」→「我念了。她寫的倒數我也用了。」
  KXY2S1  2026-11-21（大二上第 11 週週六）22:26 → 22:31 私訊「輸了。」「對方的律師是大三的。」「……我下次要寫得更好。」→ 回 KXMOOT_PICK（預設「他講得很好嗎？」，記她回的）；
          →【前置】跳到 23:46（【前置】有予樂的聯絡方式）→ 23:51 予樂「可昕輸了以後回宿舍 一句話都沒講 直接開始寫下一份」「她好認真」；
          →【前置】跳到 11/24（第 12 週週二）21:16 → 21:21「走啦」群組品妤「可昕說她模擬法庭沒過。她講的時候一直在笑，你知道那代表她很在意。」
  KXWIN   2027-04-10 22:26 → 22:31 私訊「贏了。」「對方是大一的。他們的書狀寫得很好。」「我們的也是。」→ 回 KXWIN_PICK（預設「恭喜！」）；
          →【前置】跳到 22:56 → 23:01 予樂「可昕贏了 回來第一件事是把上次輸的那份書狀拿出來看」「我問她幹嘛 她說要記得」（「上次輸的」照舊：看自己的書狀）；
          →【前置】跳到 4/11 12:56 → 13:01 動態「贏了。」→（私訊問一句）「對方是誰？」→「大一的。他們準備得很好。……我很開心。」
  KX2E    2027-10-02（大三上第 4 週週六）21:56 → 22:01：動態「我帶的。」→ 留言「學姊了。」→「他們比我早到。我覺得很好。」
 沒做（原因寫在最後的 run.note）：vac_activities.js:172（阿凱秋葉原：大一暑假報名 C05、8/24～28 出國那一趟）、vac_activities.js:368（C17 事務所實習＋可昕視訊：要面試、錄取、暑假實習）、
   events.js:2719／story3d.js:3461（可昕重考那年：經濟系前傳的重考讀書日，要經濟系存檔）、feed_pg.js:50（畢業以後篇 2030-10-13：要畢業後篇的最小存檔、站著不動跳時間）——
   這四處 Node 已經確認新句在遊戲資料裡、舊句不在（feed_pg 那一則 Node 照時間走得到、私訊問的回答是新句）。
估計時間（沒有實測）：CAMP 5～10 分、MX7 2 分、ZQ3_CM／ZQ3_DM 各 10～20 分、KAI203 5 分、ZQL3／ZQL3_W 各 5～10 分、KX5 5～8 分、KXY2S1 15～25 分、KXWIN 15～25 分、KX2E 5～8 分。
不要和別的瀏覽器測試同時跑。
用法：LW_TESTS=<工作樹>/tests SCEN=CAMP,MX7,... SHA=00a88c56f python3 nocmp546_probe.py <URL>/index.html <輸出資料夾> <使用者存檔.json>
  （SCEN 不給＝全部；KXMOOT_PICK／KXWIN_PICK 換回覆鍵）"""
import os, sys, json, asyncio, time, re, math
sys.path.insert(0, os.environ['LW_TESTS']); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as B
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or None
KXMOOT_PICK = os.environ.get('KXMOOT_PICK', '他講得很好嗎？')
KXWIN_PICK = os.environ.get('KXWIN_PICK', '恭喜！')
def say(*a): print(' '.join(str(x) for x in a), flush=True)
J = lambda x, n=400: json.dumps(x, ensure_ascii=False)[:n]
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at()}); }catch(e){} return c0.apply(this,arguments); };
  if(GAME.caption){ const c1=GAME.caption; GAME.caption=function(a,b){ try{ window.__LOG.push({n:'［字幕］', t:String(b||a||'').replace(/<[^>]+>/g,'｜'), at:at()}); }catch(e){} return c1.apply(this,arguments); }; }
  if(GAME.titleCard){ const c2=GAME.titleCard; GAME.titleCard=function(a,b){ try{ window.__LOG.push({n:'［日期卡］', t:String(a||'')+'｜'+String(b||''), at:at()}); }catch(e){} return c2.apply(this,arguments); }; } })()"""
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
MSGS = """(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null, ans:m.ans==null?null:m.ans})))"""
SETUP = """(([rels,flags,groups,mems,cts])=>{ const G=GAME.G, F=G.flags; const V={ACQ:[8,0,0],FAMILIAR:[25,0,0],FRIEND:[45,30,10],CLOSE:[65,50,45]};
  const day0=STORY.dayOfKey('2025-09-24'); G.contacts=G.contacts||{};
  for(const id in rels){ const R=SOCIAL.rel(id), v=V[rels[id]]; R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0; }
  for(const id of cts||[]) if(G.contacts[id]==null) G.contacts[id]=day0;
  for(const g of groups||[]) if(!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))) PHONE.join(G,g[0],g[1]);
  Object.assign(F,flags||{});
  for(const [id,tag] of mems||[]) SOCIAL.remember(id,tag,'');
  const ids=Object.keys(rels);
  return {stages:Object.fromEntries(ids.map(id=>[id,SOCIAL.stage(id)])), dating:Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true), contacts:Object.keys(G.contacts),
    groups:(groups||[]).map(g=>[g[0],!!(PHONE.inGroup&&PHONE.inGroup(G,g[0]))]), route:STORY.route?STORY.route(G):null}; })"""
# n25（05:13 LAWWW-B）：obj.visible 是「在不在鏡頭畫面裡」，人在不在場只看 n.hidden
NPC = """(ids=>{ const n=(GAME.E.npcs||[]).find(x=>x&&ids.some(id=>x.charId===id||x.id===id)&&x.obj&&!x.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,n.id]:null; })"""
LAB = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()"
UPS = """(ids=>{ const out={}; for(const id of ids){ const L=[]; for(let i=0;i<6;i++){ const U=SOCIAL.upLine&&SOCIAL.upLine(id); if(!U) break; L.push(U.stage); SOCIAL.markUp(id,U.k); } out[id]=L; } return out; })"""
DONE = "(id=>!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[id]))"
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
NOPAREN = lambda t: t.strip().strip('（）()')

# ---------------------------------------------------------------- 句子
CAMP_ICE = ['第二個。名字接龍，順便講你從哪裡來。要先把前面的人念一遍。', '張哲維，叫我阿哲。高雄上來的。', '阿哲。吳芯慈，永和。我應該是全隊住最近的。', '……前面是阿哲、還有、呃……', '（小聲）芯慈。',
            '芯慈，謝謝。我是郭沛珊，台中來的。', '（一口氣念完前面的名字）江明軒。彰化，五點的客運。', '阿哲、芯慈、沛珊、明軒。許柏翰。新竹。', '（念完，一個都沒漏）凱文！台北人，土生土長！']
CAMP_OPTS = ['「臺北。我家就在這附近。」', '「臺北人。」']
MX_NEW, MX_OLD = '看起來很輕鬆，其實自己偷偷念；社團活動比上課重要；跟阿哲一起打球', '看起來完全沒念書，考試卻很高分'
ZQ3 = dict(pic='排行榜的截圖，她的名字在第三，第一是「王凱翔」', say='第三', cm=['恭喜！', '謝謝。第一是你室友，他寫得超漂亮'], dm=['第一是我室友？', '對 我要去問他那題怎麼寫'])
ZQP_LINES = ['你室友第一', '他都沒講？', '……他真的很不會講']
ZQP = {'他沒講。': ['欸 你幫我恭喜他 他那題寫得好漂亮'], '妳第三也很強。': ['謝謝', '下次換我教他一題']}
KAI_T = '系上那個練習賽，子晴第三。她跑來問我那題怎麼寫，問了一個小時。'
ZQL3_T = ['比賽的結果出來了。我們系拿了第二名。', '……我傳了恭喜。他們熬了三個禮拜，很值得。']
ZQL3_W = ['程式比賽的結果出來了。我們系拿了第二名。', '我沒去。……恭喜我傳了。真心的。大部分是。']
KX5 = dict(pic='宿舍交誼廳的白板，寫滿了期末考倒數', say='予樂寫的。她自己都還沒念。', cm=['妳呢？', '我念了。她寫的倒數我也用了。'])
KXMOOT = ['輸了。', '對方的律師是大三的。', '……我下次要寫得更好。']
KXMOOT_R = {'妳一定可以。': ['我知道。……你不用安慰我。'], '他講得很好嗎？': ['很好。好到我很生氣。'], '下次我去看。': ['不要。你在我會看你。……好啦，下次。']}
YULE135 = ['可昕輸了以後回宿舍 一句話都沒講 直接開始寫下一份', '她好認真']
PINYU137 = ['可昕說她模擬法庭沒過。她講的時候一直在笑，你知道那代表她很在意。']
KXWIN = ['贏了。', '對方是大一的。他們的書狀寫得很好。', '我們的也是。']
KXWIN_R = {'恭喜！': ['嗯。……我等一下再開心。現在先睡。'], '上次那個大三的呢？': ['他這次當法官。他說我講太快。'], '下次我去看。': ['好。你坐最後一排，不要讓我看到。']}
YULE141 = ['可昕贏了 回來第一件事是把上次輸的那份書狀拿出來看', '我問她幹嘛 她說要記得']
KX2D = dict(pic='宿舍書桌上一面小獎牌，旁邊予樂的手在比 YA', say='贏了。', dm=['對方是誰？', '大一的。他們準備得很好。……我很開心。'])
KX2E = dict(pic='討論室的白板，寫著「民總讀書會」，下面一排名字', say='我帶的。', cm=['學姊了。', '他們比我早到。我覺得很好。'])
# AA_546 列的舊句（遊戲改以前的原文，git show b76e835f7^／a68622d52^）：每一場都查全部
OLD = ['第二個。名字接龍，順便講你今天早餐吃什麼。要先把前面的人念一遍。', '張哲維，叫我阿哲。早餐……車上那包洋芋片算嗎？', '阿哲。我吳芯慈。早餐是我家樓下的燒餅，七點吃的。',
       '芯慈，謝謝。我是郭沛珊。早餐是我媽做的蛋餅，帶在車上吃的。', '（一口氣念完前面的名字）江明軒。沒吃，五點的客運。', '阿哲、芯慈、沛珊、明軒。許柏翰。早餐一個饅頭。',
       '（念完，一個都沒漏）凱文！早餐兩個飯糰，一個鮪魚一個肉鬆，還有一杯豆漿！', '「便利商店的飯糰。」', '「一杯豆漿，在車上喝完了。」', '「我媽塞給我的三明治。」',
       '第三不用恭喜', '對 你室友很恐怖', '欸 你幫我恭喜他 我講不出口', '第三就是第三', '下次',
       '系上那個練習賽，子晴第三。她一直說下次要贏我。', '……我傳了恭喜。真心的。只有一點點不真心。', '我國小的時候想要。我媽說考第一名才買。', '我沒考第一名。',
       '……我下次要贏他。', '大一的。贏大一的我有點不好意思。可是我很開心。', '對方是大一的。……不算。', '算啦。贏了就是贏了。', '我好怕她',
       '可昕說她模擬法庭輸給一個大三的。她講的時候一直在笑，你知道那代表她很生氣。', '緊張。……沒有輸給大三那一晚那麼緊張。', '他們比我早到。我很不服氣。', '我念了。我比她早開始三天。',
       '六份。你呢？……不要說比我多。', '「你讀到哪了？……三章？我才讀到第二章。」', MX_OLD]
COMPARE = re.compile(r'排名|第一名|第二名|誰比較強|贏他|贏我|輸給|比我|比她|不服氣|不真心')
ALLOW = set(ZQL3_T + ZQL3_W + [KX2E['cm'][1]])   # AA_546 新句（或留下的那一版）自己有的「第二名」「比我早到」
GRAY = ['真心的。大部分是。', '好到我很生氣。']   # AA_546 沒列、同一段裡的句子（只記，不判）


def is_old(x):
    return any(x == o or (len(o) >= 6 and o in x) for o in OLD)


def cmp_check(run, sid, lines):
    lines = [x for x in lines if x]
    bad = [x for x in lines if is_old(x)]
    run.check('%s：沒有 AA_546 列的舊句' % sid, not bad, J(bad))
    hits = [x for x in lines if COMPARE.search(x) and x not in ALLOW]
    run.check('%s：沒有別的比較字（排名、第一名、第二名、誰比較強、贏他、贏我、輸給、比我、比她、不服氣、不真心；新句留下的「第二名」「比我早到」不算）' % sid, not hits, J(hits))
    gray = [x for x in lines if any(g in x for g in GRAY)]
    if gray: run.note('%s 灰色（AA_546 沒列，只記不判）：%s' % (sid, J(gray)))


def has_seq(T, seq):
    k = 0; TT = [NOPAREN(x) for x in T]
    for x in TT:
        if k < len(seq) and x == NOPAREN(seq[k]): k += 1
    return k == len(seq)


def texts(log):
    return [x['t'] for x in log if x['n'] not in ('［選項］', '［字幕］', '［日期卡］')]


def choice_sets(log):
    return [json.loads(x['t']) for x in log if x['n'] == '［選項］']


async def log_len(pg):
    return len(await pg.evaluate("window.__LOG||[]"))


async def log_since(pg, n0):
    return (await pg.evaluate("window.__LOG||[]"))[n0:]


async def msgs(pg, th):
    return await pg.evaluate(MSGS + "(%s)" % json.dumps(th))


async def dayk(pg, key):
    return await pg.evaluate("STORY.dayOfKey('%s')" % key)


# ---------------------------------------------------------------- 玩家操作（同 xinci_probe.py）
async def opts(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


def pick_idx(ops, picks=None):
    """picks（要選的字，依序找）→ 起床選單、跳過時間「照樣跳過」、說話完的「就這樣」→ 別人的出遊「不去了」→ 第一個"""
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


async def drive(pg, cdp, run, picks=None, max_s=240, label='', shot_at=()):
    """點對話、選項照 picks，直到三輪都沒有對話、選項、忙；shot_at：對話框出現那幾個字時各截一張"""
    t0 = time.time(); idle = 0; ch = []; shot = set()
    while time.time() - t0 < max_s:
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if not ops: await pg.wait_for_timeout(500); continue
            k = pick_idx(ops, picks); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
            say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
            await run.shot(pg, '%s_choice%d' % (label, len(ch))); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); idle = 0; continue
        if s['dlg']:
            txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
            for w in shot_at:
                if w not in shot and w in txt: await pg.wait_for_timeout(900); await run.shot(pg, '%s_%d' % (label, len(shot))); shot.add(w)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); idle = 0; continue
        if s.get('busy'): await pg.wait_for_timeout(700); continue
        idle += 1
        if idle >= 3: break
        await pg.wait_for_timeout(900)
    return ch


async def wait_for(pg, cdp, run, cond, max_s=900, picks=None, label=''):
    """時間照走（不跳過時間），遇到對話、選項照 pick_idx 點，手機自己打開就收起來，直到 cond（JS）成立"""
    t0 = time.time(); ch = []
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if await pg.evaluate(cond) and not (s['dlg'] or s['choices'] or s['busy']): return True, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        if s['choices']:
            ops = await opts(pg)
            if ops:
                k = pick_idx(ops, picks); st = await pg.evaluate(STATE); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k]})
                say('   %s %s %.2f 選項 %s → %s' % (label, st['key'], st['h'], [o[:16] for o in ops], ops[k][:22]))
                await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return False, ch


async def wait_hour(pg, cdp, run, h, label, max_s=900):
    ok, ch = await wait_for(pg, cdp, run, "GAME.G.hour>=%s" % h, max_s=max_s, label=label)
    st = await pg.evaluate(STATE); run.note('%s 站著等到 %.2f：%s（%s；途中選項 %s）' % (label, h, '等到了' if ok else '沒等到', J(st), J(ch, 300)))
    return ok


async def talk(pg, cdp, run, ids, names, picks=None, label='', shot_at=()):
    """走到那個人旁邊，互動鈕是「和〇〇說話」才按，對話照 picks 點完；回傳（選項紀錄, 互動鈕的字）"""
    lab = ''; name = names[0]; hit = lambda s: '說話' in s and any(n in s for n in names)
    STOP = lambda s: s['dlg'] or s['choices'] or s['busy']   # 走近時事件就開始：go_to 沒給 stop 會自動點掉、選第一個
    for k in range(3):
        pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
        if not pos: say('   %s 不在這一區' % name); return None, ''
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.2, name, max_s=90, lv=pos[2], stop=STOP)
        for j in range(6):
            st = await L.state(pg)
            if st['dlg'] or st['choices'] or st['busy']:
                ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label, shot_at=shot_at); return ch, '（走近就開始）'
            lab = await pg.evaluate(LAB)
            if hit(lab): break
            pos = await pg.evaluate(NPC + "(%s)" % json.dumps(ids))
            if pos:   # 他跟一群人在一起、互動鈕抓到旁邊的人：繞著他換方向靠近（0.7 m，四個方向輪流）
                ang = j * math.pi / 2; tx, tz = pos[0] + 0.7 * math.cos(ang), pos[1] + 0.7 * math.sin(ang)
                await L.go_to(pg, cdp, run, tx, tz, 0.35, name, max_s=30, lv=pos[2], stop=STOP)
            await pg.wait_for_timeout(500)
        say('   %s 互動鈕：「%s」' % (label, lab))
        if hit(lab):
            await run.shot(pg, '%s_label' % label)
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            ch = await drive(pg, cdp, run, picks=picks, max_s=150, label=label, shot_at=shot_at)
            return ch, lab
    return None, lab


async def launch(p, run, base, key, h, zone, preflags=None, rels=None, flags=None, quiet=False, label='', groups=(), mems=(), cts=()):
    """使用者存檔深拷貝；key＝None 照存檔原樣（日子、時間、地點）。preflags 讀檔前寫進存檔（人物生成、區域照它），rels／flags／groups／mems／cts 讀檔後在頁面裡設。
    交往照存檔（存檔裡和可昕交往中，不動）"""
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']; G.pop('_stuck', None)
    if key:
        d = await dayk(pg, key)
        for k, kk in ROOMS:
            dd = await dayk(pg, kk)
            if dd <= d: F[k] = dd
        G.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    F['KX_DEC3_MIGRATED'] = True
    for k, v in (preflags or {}).items(): F[k] = (await dayk(pg, v['$day'])) if isinstance(v, dict) and '$day' in v else v
    G['money'] = max(G.get('money') or 0, 30000)
    await L.load_state(pg, G, quiet_events=quiet); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    r = await pg.evaluate(SETUP + "(%s)" % json.dumps([rels or {}, flags or {}, [list(g) for g in groups], [list(m) for m in mems], list(cts)]))
    s0 = await pg.evaluate(STATE)
    run.setup('[前置] %s：使用者存檔%s（%s）；讀檔前寫進存檔 %s；讀檔後關係 %s、旗標 %s、群組 %s、記憶 %s、聯絡方式 %s → %s' % (
        label, ('改到 %s %.2f %s' % (key, h, zone)) if key else '原樣', 'quiet_events' if quiet else '事件系統開著', J(preflags or {}), J(rels or {}), J(flags or {}), J(list(groups)), J(list(mems)), J(list(cts)), J(r, 600)))
    say('   %s 讀檔後：%s；%s' % (label, J(s0), J(r)))
    return b, pg, cdp, errs, r


async def reload_same(pg, run, key, h, zone, why):
    """【前置】同一份進度（GAME.snapshot()）重讀：關係、旗標設好以後人物重新生成（標籤、作息照新的）"""
    snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, key)
    snap.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(6000); await pg.evaluate(HOOK)
    run.setup('[前置] %s：同一份進度重讀 %s %.2f %s' % (why, key, h, zone))


async def jump(pg, cdp, run, key, h, zone=None, why=''):
    """【前置】同一份進度跳到另一個時間（原地或那一區的出生點）再讀；事件照開"""
    snap = await pg.evaluate("()=>GAME.snapshot()"); d = await dayk(pg, key)
    snap.update({'day': d, 'hour': h, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if zone: snap.update({'zone': zone, 'pos': None})
    await L.load_state(pg, snap, quiet_events=False); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    run.setup('[前置] 同一份進度跳到 %s %.2f %s%s' % (key, h, snap.get('zone'), ('（%s）' % why) if why else ''))


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


def guard(fn):
    async def w(p, run, base, sid, out):
        try: await fn(p, run, base, sid, out)
        except Exception as e: out.setdefault(sid, {})['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % sid, False, str(e)[:300])
    return w


async def finish_page(run, tag, res, errs, b):
    res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); await close(b)


# ---------------------------------------------------------------- 手機
async def feed_text(pg, cdp):
    return await B.phone_tab(pg, cdp, 'feed')


async def feed_tap(pg, cdp, run, sid, pid, kind):
    """手機「動態」上那一則的按鈕（留言＝cm、私訊問一句＝dm）；回傳 (按到沒, 按完的動態頁文字)"""
    await B.phone_tab(pg, cdp, 'feed')
    ok = await L.tap(pg, cdp, '#phoneBody [data-fd="%s|%s"]' % (pid, kind)); await pg.wait_for_timeout(1800)
    txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await run.shot(pg, '%s_%s_%s' % (sid, pid, kind))
    return ok, txt


async def new_msgs(pg, th, n0):
    return (await msgs(pg, th))[n0:]


async def thread_check(pg, cdp, run, sid, th, want, label, n0):
    """那一個對話串：新收到的訊息（讀檔以後的）照順序有 want 每一句（一字不差），手機畫面上也看得到；回傳新訊息"""
    t = await B.phone_thread(pg, cdp, th); await run.shot(pg, '%s_%s' % (sid, label))
    nm = await new_msgs(pg, th, n0); got = [m['text'] for m in nm]
    run.check('%s：%s（%s）照順序、一字不差，手機畫面上看得到' % (sid, '／'.join(want), th), t['ok'] and has_seq(got, want) and all(w in t['text'] for w in want), J({'new': got, 'asks': [a['t'] for a in t['asks']]}, 700))
    return nm, t


# ---------------------------------------------------------------- 第 0 節：宿營破冰
CAMPP = {'CAMP': ('坐阿哲旁邊', '「洋芋片給我一包。」', CAMP_OPTS[0]), 'CAMP2': ('坐明軒旁邊', None, CAMP_OPTS[1])}


@guard
async def s_camp(p, run, base, sid, out):
    res = out.setdefault(sid, {}); bus, snack, pick = CAMPP[sid]
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.goto(URL); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await pg.evaluate(HOOK)
        await L.tap(pg, cdp, '#btnNewLaw'); run.setup('%s：標題畫面按「從法律系開始」（新遊戲，不改狀態）' % sid)
        t0 = time.time(); picks = [bus] + ([snack] if snack else []) + [pick]; seen = []; shot = False; ok = False
        while time.time() - t0 < 900:
            lg = await pg.evaluate("window.__LOG||[]")
            if any(x['t'] == '記住了！' for x in lg) and await pg.evaluate(DONE + "('ev_camp_d1_ice')"): ok = True; break
            if await phone_open(pg): await L.phone_away(pg, cdp); continue
            s = await L.state(pg)
            if s['choices']:
                ops = await opts(pg)
                if not ops: await pg.wait_for_timeout(500); continue
                k = pick_idx(ops, picks); seen.append({'opts': ops, 'pick': ops[k]}); say('   %s 選項 %s → %s' % (sid, ops, ops[k]))
                await run.shot(pg, '%s_choice%d' % (sid, len(seen))); await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            if s['dlg']:
                txt = await pg.evaluate("((document.getElementById('dlg')||{}).innerText||'')")
                if not shot and '名字接龍' in txt: await pg.wait_for_timeout(900); await run.shot(pg, '%s_icebreak' % sid); shot = True
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            await pg.wait_for_timeout(800)
        lg = await pg.evaluate("window.__LOG||[]"); T = texts(lg); CS = choice_sets(lg); st = await pg.evaluate("(()=>{ try{ return {key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), bus:GAME.G.flags.CAMP_BUS||null}; }catch(e){ return null; } })()")
        res.update({'said': T, 'choices': CS, 'picked': seen, 'st': st})
        say('   %s 說的（最後 24 句）：%s' % (sid, J(T[-24:], 2500)))
        run.check('%s：新遊戲一路演到宿營破冰演完（ev_camp_d1_ice、凱文「記住了！」）' % sid, ok, J({'st': st, 'last': T[-3:]}))
        if bus == '坐阿哲旁邊':
            run.check('%s：遊覽車坐阿哲旁邊，阿哲「我阿哲。張哲維。高雄上來的。」照舊' % sid, '我阿哲。張哲維。高雄上來的。' in T, J(T[:12], 600))
        run.check('%s：破冰小隊輔＋六個人的接龍照 AA_546 第 0 節、照順序（%d 句）' % (sid, len(CAMP_ICE)), has_seq(T, CAMP_ICE), J([t for t in T if any(n in t for n in ('名字接龍', '阿哲', '芯慈', '沛珊', '明軒', '柏翰', '凱文'))][:14], 900))
        run.check('%s：祐廷的選項只有「臺北。我家就在這附近。」「臺北人。」（沒有早餐那三個）' % sid, any(c == CAMP_OPTS for c in CS), J(CS, 600))
        run.check('%s：選 %s → 小隊輔「好，七個人都記住了吧。」' % (sid, pick), any(x['pick'] == pick for x in seen) and has_seq(T, ['好，七個人都記住了吧。', '記住了！']), J(seen[-2:]))
        cmp_check(run, sid, T + [o for c in CS for o in c])
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 第 7 節：明軒的個性
@guard
async def s_mx7(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, None, None, None, quiet=True, label=sid + '（使用者存檔原樣：已經認識明軒；只看手機人物頁，條件事件關掉）')
    try:
        await drive(pg, cdp, run, max_s=40, label=sid); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
        known = await pg.evaluate("(()=>({known:(GAME.knownIds?GAME.knownIds():[]).includes('classmate_mingxuan'), layer:CHARACTERS.classmate_mingxuan.social_layer, reveal:SOCIAL.reveal('classmate_mingxuan'), personality:CHARACTERS.classmate_mingxuan.personality}))()")
        run.note('%s 存檔裡：%s' % (sid, J(known))); res['known'] = known
        txt = await B.person_page(pg, cdp, 'classmate_mingxuan'); await pg.wait_for_timeout(600); await run.shot(pg, '%s_person' % sid)
        res['page'] = (txt or '')[:800]; say('   %s 人物頁：%s' % (sid, J(txt, 800)))
        run.check('%s：手機「朋友」裡有江明軒（「資料」按得到）' % sid, txt is not None, J(known))
        run.check('%s：人物頁有「%s」' % (sid, MX_NEW), bool(txt) and MX_NEW in txt, J(txt, 500))
        run.check('%s：人物頁沒有「%s」' % (sid, MX_OLD), bool(txt) and MX_OLD not in txt, J(txt, 500))
        cmp_check(run, sid, (txt or '').split('\n'))
        await B.phone_close(pg, cdp)
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 第 3 節：子晴、阿凱
ZQ = 'heroine_04'


@guard
async def s_zq3(p, run, base, sid, out):
    res = out.setdefault(sid, {}); kind = 'cm' if sid == 'ZQ3_CM' else 'dm'; reply = '他沒講。' if kind == 'cm' else '妳第三也很強。'
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-11-15', 17.93, 'dorm', rels={ZQ: 'FRIEND'}, label=sid + '（大一上第 11 週週六 17:56 宿舍；子晴 FRIEND＋聯絡方式）')
    try:
        n0 = len(await msgs(pg, 'p:' + ZQ))
        f0 = await feed_text(pg, cdp); await B.phone_close(pg, cdp)
        ok = await wait_hour(pg, cdp, run, 18.02, sid)
        f1 = await feed_text(pg, cdp); await run.shot(pg, '%s_feed' % sid)
        run.check('%s：18:00 以前動態沒有；18:01 有子晴「（照片：%s）」「第三」' % (sid, ZQ3['pic']), ok and ZQ3['pic'] not in f0 and ZQ3['pic'] in f1 and '第三' in f1, J(f1, 500))
        okb, f2 = await feed_tap(pg, cdp, run, sid, 'zq3', kind); await B.phone_close(pg, cdp)
        nm = await new_msgs(pg, 'p:' + ZQ, n0); got = [m['text'] for m in nm]; res['feed'] = f2[:600]; res['reply'] = got
        L2 = ZQ3[kind]
        run.check('%s：按%s「%s」→ 子晴回「%s」（動態頁、私訊對話串都有，一字不差）' % (sid, '留言' if kind == 'cm' else '（私訊問一句）', L2[0], L2[1]), okb and has_seq(got, L2) and L2[1] in f2, J({'按到': okb, 'msgs': got, 'feed': f2[:300]}))
        await jump(pg, cdp, run, '2025-11-15', 23.43, why='子晴 23:30 的私訊之前')
        n1 = len(await msgs(pg, 'p:' + ZQ))
        ok2 = await wait_hour(pg, cdp, run, 23.52, sid)
        nm2, t = await thread_check(pg, cdp, run, sid, 'p:' + ZQ, ZQP_LINES, 'zq_practice', n1)
        run.check('%s：回覆鍵「他沒講。」「妳第三也很強。」「（回一張插座貓貼圖）」' % sid, [a['t'] for a in t['asks']][-3:] == ['他沒講。', '妳第三也很強。', '（回一張插座貓貼圖）'], J(t['asks']))
        await B.phone_close(pg, cdp)
        after = await B.phone_answer(pg, cdp, 'p:' + ZQ, reply); await run.shot(pg, '%s_zq_practice_answered' % sid); await B.phone_close(pg, cdp)
        nm3 = await new_msgs(pg, 'p:' + ZQ, n1); got3 = [m['text'] for m in nm3]; res['practice'] = got3
        run.check('%s：回「%s」→ %s（一字不差）' % (sid, reply, '／'.join(ZQP[reply])), bool(after) and has_seq(got3, [reply] + ZQP[reply]) and all(x in after for x in ZQP[reply]), J({'msgs': got3, 'text': (after or '(沒有那個鍵)')[-200:]}))
        cmp_check(run, sid, got + got3)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_kai203(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-11-18', 20.25, 'dorm', preflags={'DORM_FOUR': True}, rels={ZQ: 'ACQ'}, label=sid + '（大一上第 12 週週二 20:15 宿舍；【捷徑】DORM_FOUR＝203 四人房；認識子晴）')
    try:
        ups = await pg.evaluate(UPS + "(['kai'])"); run.setup('【前置】阿凱的升級門檻台詞當作說過了（SOCIAL.markUp）：%s' % J(ups))
        pre = await pg.evaluate("(()=>{ const G=GAME.G; return {era:!!(DORM203.era&&DORM203.era(G)), r203:!!(STORY.r203On&&STORY.r203On(G)), due:(HEARD.kaiDue&&(HEARD.kaiDue(G)||{}).id)||null, zq:G.flags.ZQ_PRACTICE||null, knowsZq:SOCIAL.has('heroine_04','FIRST_MET')}; })()")
        run.check('%s：前置——203 四人房時期、阿凱那一句輪到 h503_kai_third' % sid, pre['era'] and pre['due'] == 'h503_kai_third', J(pre)); res['pre'] = pre
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, ['kai'], ['阿凱'], label=sid, shot_at=('練習賽',))
        lg = await log_since(pg, n0); T = texts(lg); res.update({'said': T, 'lab': lab, 'ch': ch}); await run.shot(pg, '%s_after' % sid)
        say('   %s 說的：%s' % (sid, J(T[:8], 800)))
        run.check('%s：和阿凱說話 → 「%s」（一字不差）' % (sid, KAI_T), KAI_T in T, J({'lab': lab, 'said': T[:6]}, 600))
        cmp_check(run, sid, T)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_zql3(p, run, base, sid, out):
    res = out.setdefault(sid, {}); cd = sid == 'ZQL3'; key, h = '2026-05-12', 14.6
    b, pg, cdp, errs, r = await launch(p, run, base, key, h, 'campus', rels={ZQ: 'FAMILIAR'}, mems=([(ZQ, 'CONTEST_DAY')] if cd else []),
                                       label=sid + '（大一下第 12 週週二 14:36 校園；子晴 FAMILIAR%s）' % ('、記憶 CONTEST_DAY' if cd else '、沒有 CONTEST_DAY'))
    try:
        lad = await pg.evaluate("(()=>{ const G=GAME.G; G.social.ladder=G.social.ladder||{}; G.social.ladder['heroine_04@Y1S2']=2; G.social.ladderDay=G.social.ladderDay||{}; delete G.social.ladderDay.heroine_04; return {lad:G.social.ladder['heroine_04@Y1S2'], next:(STORY.ladNext&&(STORY.ladNext(G,'heroine_04')||{}).id)||null}; })()")
        run.setup('【捷徑】子晴大一下閒聊停在第 3 層（ladder heroine_04@Y1S2＝2、今天還沒聊過）：%s' % J(lad))
        ups = await pg.evaluate(UPS + "(['heroine_04'])"); run.setup('【前置】升級門檻台詞當作說過了（SOCIAL.markUp）：%s' % J(ups))
        await reload_same(pg, run, key, h, 'campus', '關係、記憶、閒聊進度設好以後（她生成時就認識）')
        w = await pg.evaluate("(()=>{ try{ const w=STORY.whereIs(GAME,'heroine_04'); return w?{zone:w.zone, act:w.act||null}:null; }catch(e){ return 'ERR '+e.message; } })()")
        nxt = await pg.evaluate("(()=>(STORY.ladNext&&(STORY.ladNext(GAME.G,'heroine_04')||{}).id)||null)()")
        pos = None
        for _ in range(12):   # 她在不在這一區（底模還沒下載完的會先藏）：每 5 秒看一次，最多 60 秒
            pos = await pg.evaluate(NPC + "(['heroine_04'])")
            if pos: break
            await pg.wait_for_timeout(5000)
        run.check('%s：前置——子晴在校園（作息 %s）、下一層是 Q2-L3' % (sid, J(w)), bool(pos) and nxt == 'Q2-L3', J({'pos': pos, 'next': nxt}))
        n0 = await log_len(pg)
        ch, lab = await talk(pg, cdp, run, [ZQ], ['子晴', '高子晴'], picks=['「妳還好嗎？」'], label=sid, shot_at=('第二名',))
        lg = await log_since(pg, n0); T = texts(lg); CS = choice_sets(lg); res.update({'said': T, 'choices': CS, 'lab': lab}); await run.shot(pg, '%s_after' % sid)
        say('   %s 說的：%s；選項 %s' % (sid, J(T[:10], 900), J(CS[-3:])))
        if cd:
            run.check('%s：和子晴說話＝Q2-L3（CONTEST_DAY）「%s」「%s」' % (sid, ZQL3_T[0], ZQL3_T[1]), has_seq(T, ZQL3_T), J({'lab': lab, 'said': T[:8]}, 700))
            run.check('%s：選「妳還好嗎？」→「還好啦。……幹嘛突然這樣問。」' % sid, has_seq(T, ['還好啦。……幹嘛突然這樣問。']), J(T[-3:]))
        else:
            run.check('%s：和子晴說話＝Q2-L3（第 10～16 週那一版）' % sid, has_seq(T, ZQL3_W) or has_seq(T, ZQL3_T), J({'lab': lab, 'said': T[:8]}, 700))
            run.note('%s 看到的那一版：%s（「真心的。大部分是。」AA_546 沒列，灰色）' % (sid, J([t for t in T if '第二名' in t or '恭喜' in t])))
        cmp_check(run, sid, T + [o for c in CS for o in c])
    finally: await finish_page(run, sid, res, errs, b)


# ---------------------------------------------------------------- 第 4 節：可昕
KX = 'kexin'


@guard
async def s_kx5(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2025-11-20', 23.77, 'dorm', rels={KX: 'FRIEND'}, label=sid + '（大一上第 12 週週四 23:46 宿舍；可昕 FRIEND 數值，存檔裡交往中）')
    try:
        n0 = len(await msgs(pg, 'p:' + KX))
        f0 = await feed_text(pg, cdp); await B.phone_close(pg, cdp)
        ok = await wait_hour(pg, cdp, run, 23.85, sid)
        f1 = await feed_text(pg, cdp); await run.shot(pg, '%s_feed' % sid)
        run.check('%s：23:50 以前沒有；23:51 有可昕「（照片：%s）」「%s」' % (sid, KX5['pic'], KX5['say']), ok and KX5['pic'] not in f0 and KX5['pic'] in f1 and KX5['say'] in f1, J(f1, 500))
        okb, f2 = await feed_tap(pg, cdp, run, sid, 'kx5', 'cm'); await B.phone_close(pg, cdp)
        got = [m['text'] for m in await new_msgs(pg, 'p:' + KX, n0)]; res.update({'feed': f2[:600], 'reply': got})
        run.check('%s：留言「妳呢？」→「%s」（一字不差）' % (sid, KX5['cm'][1]), okb and has_seq(got, KX5['cm']) and KX5['cm'][1] in f2, J({'按到': okb, 'msgs': got}))
        cmp_check(run, sid, got)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_kxy2s1(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2026-11-21', 22.43, 'dorm', preflags=TWF, rels={KX: 'FRIEND'}, cts=['yule'],
                                       label=sid + '（大二上第 11 週週六 22:26 宿舍；可昕 FRIEND 數值、【前置】有予樂的聯絡方式）')
    try:
        n0 = len(await msgs(pg, 'p:' + KX)); ny = len(await msgs(pg, 'p:yule'))
        ok = await wait_hour(pg, cdp, run, 22.52, sid)
        nm, t = await thread_check(pg, cdp, run, sid, 'p:' + KX, KXMOOT, 'kx_moot', n0)
        run.check('%s：回覆鍵「妳一定可以。」「他講得很好嗎？」「下次我去看。」' % sid, [a['t'] for a in t['asks']][-3:] == ['妳一定可以。', '他講得很好嗎？', '下次我去看。'], J(t['asks']))
        await B.phone_close(pg, cdp)
        after = await B.phone_answer(pg, cdp, 'p:' + KX, KXMOOT_PICK); await run.shot(pg, '%s_kx_moot_answered' % sid); await B.phone_close(pg, cdp)
        got = [m['text'] for m in await new_msgs(pg, 'p:' + KX, n0)]; res['kx_moot'] = got
        run.check('%s：回「%s」→ 她回 %s' % (sid, KXMOOT_PICK, '／'.join(KXMOOT_R.get(KXMOOT_PICK, []))), bool(after) and has_seq(got, [KXMOOT_PICK] + KXMOOT_R.get(KXMOOT_PICK, [])), J(got))
        await jump(pg, cdp, run, '2026-11-21', 23.77, why='予樂 23:50 的私訊之前')
        ok = await wait_hour(pg, cdp, run, 23.85, sid)
        nmy, ty = await thread_check(pg, cdp, run, sid, 'p:yule', YULE135, 'yule135', ny); await B.phone_close(pg, cdp)
        await jump(pg, cdp, run, '2026-11-24', 21.27, why='大二上第 12 週週二，品妤 21:20 在「走啦」群組之前')
        ng = len(await msgs(pg, 'g:econ_friends'))
        ok = await wait_hour(pg, cdp, run, 21.35, sid)
        nmg, tg = await thread_check(pg, cdp, run, sid, 'g:econ_friends', PINYU137, 'pinyu137', ng); await B.phone_close(pg, cdp)
        res.update({'yule': [m['text'] for m in nmy], 'pinyu': [m['text'] for m in nmg]})
        cmp_check(run, sid, got + [m['text'] for m in nmy] + [m['text'] for m in nmg])
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_kxwin(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-04-10', 22.43, 'dorm', preflags=TWF, rels={KX: 'FRIEND'}, cts=['yule'],
                                       label=sid + '（2027-04-10（六）22:26 宿舍；可昕 FRIEND 數值、【前置】有予樂的聯絡方式）')
    try:
        n0 = len(await msgs(pg, 'p:' + KX)); ny = len(await msgs(pg, 'p:yule'))
        ok = await wait_hour(pg, cdp, run, 22.52, sid)
        nm, t = await thread_check(pg, cdp, run, sid, 'p:' + KX, KXWIN, 'kx_win', n0); await B.phone_close(pg, cdp)
        after = await B.phone_answer(pg, cdp, 'p:' + KX, KXWIN_PICK); await run.shot(pg, '%s_kx_win_answered' % sid); await B.phone_close(pg, cdp)
        got = [m['text'] for m in await new_msgs(pg, 'p:' + KX, n0)]; res['kx_win'] = got
        run.check('%s：回「%s」→ 她回 %s' % (sid, KXWIN_PICK, '／'.join(KXWIN_R.get(KXWIN_PICK, []))), bool(after) and has_seq(got, [KXWIN_PICK] + KXWIN_R.get(KXWIN_PICK, [])), J(got))
        await jump(pg, cdp, run, '2027-04-10', 22.93, why='予樂 23:00 的私訊之前')
        ok = await wait_hour(pg, cdp, run, 23.02, sid)
        nmy, ty = await thread_check(pg, cdp, run, sid, 'p:yule', YULE141, 'yule141', ny); await B.phone_close(pg, cdp)
        await jump(pg, cdp, run, '2027-04-11', 12.93, why='可昕 4/11 13:00 的動態之前')
        n1 = len(await msgs(pg, 'p:' + KX))
        f0 = await feed_text(pg, cdp); await B.phone_close(pg, cdp)
        ok = await wait_hour(pg, cdp, run, 13.02, sid)
        f1 = await feed_text(pg, cdp); await run.shot(pg, '%s_feed' % sid)
        run.check('%s：4/11 13:00 以前沒有；13:01 有可昕「（照片：%s）」「%s」' % (sid, KX2D['pic'], KX2D['say']), ok and KX2D['pic'] not in f0 and KX2D['pic'] in f1, J(f1, 500))
        okb, f2 = await feed_tap(pg, cdp, run, sid, 'kx2d', 'dm'); await B.phone_close(pg, cdp)
        got2 = [m['text'] for m in await new_msgs(pg, 'p:' + KX, n1)]; res.update({'yule': [m['text'] for m in nmy], 'kx2d': got2, 'feed': f2[:600]})
        run.check('%s：（私訊問一句）「對方是誰？」→「%s」（一字不差）' % (sid, KX2D['dm'][1]), okb and has_seq(got2, KX2D['dm']) and KX2D['dm'][1] in f2, J({'按到': okb, 'msgs': got2}))
        cmp_check(run, sid, got + [m['text'] for m in nmy] + got2)
    finally: await finish_page(run, sid, res, errs, b)


@guard
async def s_kx2e(p, run, base, sid, out):
    res = out.setdefault(sid, {})
    b, pg, cdp, errs, r = await launch(p, run, base, '2027-10-02', 21.93, 'dorm', preflags=TWF, rels={KX: 'FRIEND'}, label=sid + '（大三上第 4 週週六 21:56 宿舍；可昕 FRIEND 數值）')
    try:
        n0 = len(await msgs(pg, 'p:' + KX))
        f0 = await feed_text(pg, cdp); await B.phone_close(pg, cdp)
        ok = await wait_hour(pg, cdp, run, 22.02, sid)
        f1 = await feed_text(pg, cdp); await run.shot(pg, '%s_feed' % sid)
        run.check('%s：22:00 以前沒有；22:01 有可昕「（照片：%s）」「%s」' % (sid, KX2E['pic'], KX2E['say']), ok and KX2E['pic'] not in f0 and KX2E['pic'] in f1, J(f1, 500))
        okb, f2 = await feed_tap(pg, cdp, run, sid, 'kx2e', 'cm'); await B.phone_close(pg, cdp)
        got = [m['text'] for m in await new_msgs(pg, 'p:' + KX, n0)]; res.update({'feed': f2[:600], 'reply': got})
        run.check('%s：留言「學姊了。」→「%s」（一字不差）' % (sid, KX2E['cm'][1]), okb and has_seq(got, KX2E['cm']) and KX2E['cm'][1] in f2, J({'按到': okb, 'msgs': got}))
        cmp_check(run, sid, got)
    finally: await finish_page(run, sid, res, errs, b)


SKIPPED = ['vac_activities.js:172 阿凱秋葉原（C05 大一暑假日本五天：7/15 報名私訊、8/24～28 出國那一趟的 2D 場景）——要報名＋出國行程，前置太長',
           'vac_activities.js:368 可昕視訊「六份。你呢？……多寫的那幾份，借我看。」（C17 事務所暑期實習：交履歷、面試、錄取、暑假實習中的視訊）——前置太長',
           'events.js:2719／story3d.js:3461 可昕重考那年「三章？好，我也要到第三章。」（經濟系前傳的重考讀書日，輪到第 2 句）——要經濟系路線的存檔',
           'feed_pg.js:50 畢業以後「緊張。……沒有第一次模擬法庭那麼緊張。」（2030-10-13，畢業以後篇站著不動跳時間、落地後才看得到）——要畢業後篇的最小存檔（pgdate_probe.py 的做法）',
           '這四處 Node（nocmp546_pre.js）已確認：新句在遊戲資料、舊句不在；feed_pg 那一則照時間走得到、私訊問的回答是新句']

ORDER = ['CAMP', 'CAMP2', 'MX7', 'ZQ3_CM', 'ZQ3_DM', 'KAI203', 'ZQL3', 'ZQL3_W', 'KX5', 'KXY2S1', 'KXWIN', 'KX2E']
FN = {'CAMP': s_camp, 'CAMP2': s_camp, 'MX7': s_mx7, 'ZQ3_CM': s_zq3, 'ZQ3_DM': s_zq3, 'KAI203': s_kai203, 'ZQL3': s_zql3, 'ZQL3_W': s_zql3,
      'KX5': s_kx5, 'KXY2S1': s_kxy2s1, 'KXWIN': s_kxwin, 'KX2E': s_kx2e}


async def main():
    run = L.Run('nocmp546', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    for x in SKIPPED: run.note('沒做：' + x)
    async with async_playwright() as p:
        for sid in ORDER:
            if SCEN and sid not in SCEN: continue
            say('== %s' % sid); t0 = time.time()
            await FN[sid](p, run, base, sid, out)
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'nocmp546.json'), 'w'), ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'))
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
