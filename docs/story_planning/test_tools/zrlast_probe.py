"""BB-B 2026-10-23：BB119-Y4-1017（USER_WANTS D53）芷若「出國前的最後一場」（AA_387 定稿，企劃線 608b9adc；src/zr_last3d.js、src/data/zr_last_events.js）瀏覽器實玩。
框架借 us_life_probe.py（[前置] 使用者 9/25 存檔改日期、旗標、區域 → 遊戲時間照走 → 台詞、手機、旗標、記憶記下來 → 檢查）；這支只換情境和多兩種檢查。
[前置] 她的心意條件（ZRZQ.heartOk＝TERMEND.cond＋C8）：朋友（熟 45／信任 30）、她的戀愛 40、正式校外約會 4 次、去過她的心願地點——遊戲裡要一整年的約會，讀檔後在頁面裡直接寫
  （同 tests/aa387_zr_last_unit.js 的 heart()）；有她的聯絡方式；Y4_PATH other（6/8 已選）。臺灣路線＝EXCHANGE_ROUTE TW；日本路線＝JP（3/25 出發、8/5 回國）；美國路線＝US（8/2 出發）。
之後都是玩家的操作：8/24 20:45 宿舍站著 → 21:00 她私訊，打開手機 → 她的對話串 → 點回覆；宿舍的床「快轉 → 到下一個有事的日子」；停在出發前就按「出發：和芷若：公館二輪戲院」；
  散場的兩個選項照情境點；「晚一點」照情境按；收到訊息停下來就收起手機（快轉接著跳）。
AA_387 第 9 節 BB 測試：
  ZL_WAIT      臺灣路線：回「好。」→ 8/26 出發 → 第 3、4 節逐句 →「我等妳回來。」＝交往（ROM）、ZR_LAST wait、記憶 ZR_LAST_SCREENING、房間有票根 → 23:00 兩則（等妳版）→ 9/1（五）21:00 兩則
  ZL_KEEP      同上，「我先收著。」＝ZR_LAST keep、沒有交往、學期末「讓我想想」（TERMEND think）、房間有票根 → 23:00 兩則（收著版）→ 9/1 沒有飛機那兩則
  ZL_NO        回「那天不行。」→ 她「好。……那我一個人看完它。」、ZR_LAST no、沒有出遊、沒有房間物件、沒有 19:45／22:00 那兩則
  ZL_NOREPLY   不回 → 8/25（五）18:00 她傳「好。……那我一個人看完它。」、ZR_LAST no
  ZL_LATE      回「好。」→ 8/26 出發前「晚一點」一直按到不能出發（答應了沒到）→ 19:45「要開演了。……我先進去。」、22:00「散場了。票根我先收著。」、ZR_LAST missed、沒有房間物件、沒有演
  ZL_JP        日本路線（8/5 回國）：8/24 照樣有邀約 → 回「好。」→ 8/26 照演 →「我等妳回來。」
  ZL_US        美國路線（人在美國）：8/24 沒有邀約
  ZL_CUP       6/15 杯子選了「這杯我不能喝」（ZR_CUP declined）：8/24 沒有邀約
  ZL_TAKEN     第 10 節 A2：祐廷有交往對象（可昕）：8/24 沒有邀約
第 10 節（AA387-S10-1022，開發分支 36d84def 起）：
  ZL_AGAIN_KEEP  A1：最後一場「我先收著。」、2029-09-01（六）15:00 溫州街 Café 門口 → 走進 Café →「票根，還在嗎？」→「我一直收著。」＝交往、ZR_LAST2 back、票根還在
  ZL_AGAIN_GIVE  A1：同上，「還給妳。」＝ZR_LAST2 closed、沒有交往、房間物件「她的票根」拿掉
  ZL_AGAIN_TAKEN A1：同上，但祐廷那時和可昕交往中＝她兩句「好久不見。」「……票根，你留著就好。」、沒有選項、ZR_LAST2 wait、票根留著
  ZL_FANG        A4：她因為祐廷拒絕方奕廷（ZR_F3_NO＝6/19）、接到他電話（FANG_F3 direct）：6/21 21:00 方奕廷兩則
  ZL_FANG_NOCALL A4 對照：FANG_F3 nocall＝不傳
LAWWW-B 10-23 08:09 派的（開發分支 b32ee2c4 起；同一支、SCEN 選）：
  ZS_GO／ZS_NO／ZS_LATE／ZS_NOHOOK／ZS_STUB  芷若 2027-09-02 送機（ZR-SENDOFF-L-1023，AA_390 第 6 節第 6 點）：[前置] 期末聚餐選了「出發那天我去送妳」＝HOOK_ZR_SENDOFF（期末聚餐那一場另外測）
     → 9/1 21:00 她私訊、照情境回 → 宿舍床快轉 → 9/2 出發前「出發：芷若出發」→ 機場一場／「晚一點」到不能出發；ZS_STUB＝6/3 最後一班沒到（機場給票根、10:00 沒有三則）
  USJ_0803   美國路線 8/3 時差（US-JETLAG-BED-0803-1022）：8/2 21:40 睡 → 04:30 時差 → 學姊 05:10 私訊回「醒了。」→「再睡一下。手續是明天十點。」→ 床第一項「再睡到早上（09:00）」→ 8/3 09:00 醒 → 快轉停 8/4 09:45（國際學生辦公室）
  KX29_BDAY  可昕 2029-04-24（大四下，交往中）手機傳「生日快樂」（AA389-L-1023 第 5 點）：她回三則、最後「今天在圖書館過 國考的書比蛋糕還厚」、沒有上山下山的問題；KX28_BDAY 對照（2028 照舊，只記下來）
LAWWW-B 10-23 08:26 加派（開發分支 75101a10 起）：
  INV_GO     約小安 15:00 兩點半 Café（UX-INV-GO-1023）：[前置] 讀檔後直接寫一筆已答應的約；14:33 人在宿舍 → 跳「直接過去：和…約在兩點半 Café（15:00）」→ 選直接過去＝到 cafe；她 14:45 以後在那裡就開始
  INV_WALK   同上選「自己走過去」：不移動、同一個約不再問
  INV_PHONE  同上不選（[前置] 讀檔前就標 goAsked，選單不跳）→ 手機「今天」→「今天約好的」那一筆按「前往」＝到 cafe
  BOOK_NO    總圖借書逾期關掉（BUG-BOOK-OVERDUE-1023）：法律系第 6 天以後，四次（隔 8 天，[捷徑] 撥日子）從大廳二樓走樓梯進 3F 閱覽區，都沒有「你有一本《民法總則》逾期三天」
  BOOK_OLD   舊存檔選過「我明天拿來」（book_overdue、隔天）：進總圖＝「（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）」、−40
LAWWW-B 10-23 08:41 加派第 8 項（開發分支 64ac4855 起；AA_388 第 3 節第 4 點；學姊＝D111 優先）：
  QX26_GO／QX26_NO   2026（交往中）：8/17 21:00 私訊 → 回「好。」→ 8/19 19:00 溫州街定食店 1-1、SIS_QIXI met、她的戀愛 +5／回「那天不行。」＝她回「好。」、不排、不扣
  QX27_LAST／QX27_MET 2027：去年沒一起過＝第一則「七夕。去年你在幹嘛？」→ 回了接後面三則 → 8/8 20:00 霖澤館 1-2／去年有＝第一則「週日七夕。」
  QX28_US           2028 美國路線：8/25 17:00 以後在公寓＝她當面一句 → 8/26 09:00 市集 1-3
  QX28_TW／QX28_TWMISS 2028 臺灣路線：8/25 21:00 訊息 → 8/26 21:00 視訊（接）／不接＝21:30「你在忙。那我先去圖書館了。」
  QX_NODATE         沒交往：8/17 沒有私訊；QX_KX 也和可昕交往中：只有可昕的（學姊 8/17 沒有私訊）
  [前置] 交往中＝讀檔後寫 dating_heroine_05、met_sis、關係、她的聯絡方式（前一年就有）；她的戀愛先記下來，演完比差多少。
  A1 是畢業以後：最小存檔（aa382_probe.py 的做法：stage law、GRADUATED、PG done grad、MOVED_OUT、臺灣路線），站在溫州街 Café 門口；A4 的 F3 狀態用旗標直接寫（[前置]，F3 本身單元測試有）。
F3（6/19 方奕廷那一段）不在這支：單元測試 tests/aa387_zr_last_unit.js 第 8 節有；瀏覽器版要從 6/15 起玩，另外排。
【讀資料】的檢查（玩家看不到、只能讀狀態）：ZR_LAST／ZR_LAST_GO、出遊紀錄、ROM 交往、TERMEND think、房間物件清單（宿舍書桌「看看房間裡的東西」用的同一個 STORY.roomItemList）。
不是 iPhone 實機：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests SHA=<sha> [SCEN=ZL_WAIT,...] python3 zrlast_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'us_life_probe.py'), encoding='utf-8').read()
src = src[:src.rindex('asyncio.run(main())')]   # 只借框架（不跑它的 main）
B = {'__name__': 'us_life_base', '__file__': os.path.join(HERE, 'us_life_probe.py')}
exec(compile(src, 'us_life_probe.py', 'exec'), B)
L, say, bad, results, SNAP = B['L'], B['say'], B['bad'], B['results'], B['SNAP']
from playwright.async_api import async_playwright
URL, OUT, SAVE, SCEN = B['URL'], B['OUT'], B['SAVE'], B['SCEN']

# ---- AA_387 原文（企劃線 608b9adc；同 tests/aa387_zr_last_unit.js 抄的那一份）----
ASK = ['週六晚上七點半，二輪戲院。我出國前的最後一場。', '……票的事你不用管。']; YES = '嗯。……不要遲到。片頭很短。'; NO = '好。……那我一個人看完它。'
SEC3 = ['（二輪戲院的最後一場。觀眾不到十個人。她坐在第七排靠走道，旁邊的位子放著她的外套。）', '（把外套拿起來）……你的。', '（今天放的是一部很老的片子，《候鳥》。燈暗下來以前，她一直在看手上的兩張票根。）',
        '（片子演到最後一段，她小聲說了一句。）', '這一段，我看過四次。每次都在這裡哭。', '……今天不會。', '（燈亮的時候，她在擦眼睛。）', '……我說了今天不會。']
SEC4A = ['（散場了。騎樓下，她把兩張票根分開，一張放進自己的口袋，一張遞給你。）', '這張是你的。', '（票根背面有字。她的字，鉛筆寫的。）', '熱可可＋濃縮。', '先寄放在你這裡。']
ASKED_N = '（是她自己的點法。）'; NOASK_N = '（是她的點法。她在吧檯後面做給自己喝的那一杯。）'
SEC4B = ['（你抬頭的時候，她看著騎樓外面，沒有看你。）', '……一年。']
WAIT = ['（她轉過來，把口袋裡那一張票根拿出來，和你那張對在一起。）', '一年。……你說的喔。']; KEEP = ['好。……那就先收著。', '（她笑了一下，把自己那一張放回口袋。）']
CLOSE = '（她往捷運站走。走到路口，回頭揮了一下手。）'
N_WAIT = ['到家了。', '票根不要弄丟。……寄放的，要還。']; N_KEEP = ['到家了。', '今天謝謝你。……片子很好看。']; FLY = ['明天早上的飛機。', '……到了打給你。一年，從明天開始算。']
LATE = '要開演了。……我先進去。'; AFTER = '散場了。票根我先收著。'
ROOM = '她的票根'
AG = {'n0': '（她在吧檯後面。看到你，停了一下。）', 'hi': '……好久不見。', 'ask': '票根，還在嗎？', 'me': '還在。', 'take': '寄放的，要拿回來了。……還是，你要一直收著？', 'keepT': '「我一直收著。」', 'giveT': '「還給妳。」',
      'keepN': '（她做了一杯熱可可，加了一份濃縮，推到你面前。）', 'keep': '……那這杯，也是你的。', 'giveN': '（你把票根放在吧檯上。她把它夾進牆上班表的夾板裡。）', 'give': '……謝謝你幫我收了一年。', 'hiNo': '好久不見。', 'no': '……票根，你留著就好。'}   # AA_387 第 10 節 A1
FANG = ['她說不行。', '我一個人去看了。……片子很好。']   # 第 10 節 A4

TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'Y4_PATH': 'other'}
# BB-B 10-23 09:3x：使用者的存檔（9/25）祐廷和可昕交往中（dating_kexin、romance.kexin dating，經濟系那一年起）＝學姊的七夕、M2 以外很多事件會照「祐廷有別的交往對象」走。
#   學姊那幾個情境讀檔後先把可昕的交往拿掉（當作沒交往過；不是分手，不會有收拾那一段）。qx1023 第一次（64ac4855）QX26_GO 等就是這樣 FAIL 的（8/17 只有可昕的七夕視訊）。
NOKX = "G.flags.dating_kexin=false; if(G.flags.romance) delete G.flags.romance.kexin; G.flags.ROMANCE_HISTORY=(G.flags.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete G.flags.DATED_1_kexin;"
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'AN_SENDOFF': 'together'}
USF = dict(B['USF'], Y4_PATH='other')
Y4 = "G.flags.Y4_PATH_DAY=D('2028-06-08');"
JPJS = "G.flags.X1_JP=D('2028-02-20'); G.flags.JP_DEPARTED=D('2028-03-25'); G.flags.JP_RETURNED=D('2028-08-05');"
HEART = (NOKX + " LV('heroine_02',45,30,0); SOCIAL.rel('heroine_02').npcRom=40; const Lg=DATE.log(G,'heroine_02'); Lg.count=4; Lg.wish=true;"
         " G.contacts=G.contacts||{}; if(G.contacts.heroine_02==null) G.contacts.heroine_02=D('2025-09-24');")
OUTQ = "(()=>{ const q=typeof OUT!=='undefined'?OUT.get(GAME.G,'zr_last_screening'):null; return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title||'',alarm:!!q.alarm}:null; })()"
DATING = "(()=>{ const F=GAME.G.flags, R=(F.romance||{}).heroine_02; return F.dating_heroine_02===true||!!(R&&R.status==='dating'); })()"
HASROOM = "STORY.roomItemList(GAME.G).some(r=>r&&r[0]==='她的票根')"
PARTNERS = "(()=>{ try{ return ROM.partners(GAME.G); }catch(e){ return 'ERR '+e; } })()"
KX_DATE = "LV('kexin',70,60,60); try{ ROM.start(G,'kexin'); }catch(e){} G.flags.dating_kexin=true;"
FANG_JS = "G.flags.ZR_F3_NO=D('2028-06-19'); G.flags.FANG_F3_DAY=D('2028-06-19'); LV('npc_fangyt',25,10,10); G.contacts=G.contacts||{}; if(G.contacts.npc_fangyt==null) G.contacts.npc_fangyt=D('2026-03-02');"
CAFE_OUT = {'x': 51.8, 'z': 0.6, 'yaw': 1.5708, 'lv': 0}   # 溫州街 Café 門口（互動點 54.2, 0）往西 2.4 m
AGAIN_F = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'ZR_LAST': 'keep', 'ZR_LAST_GO': True}
AGAIN_JS = HEART + "try{ TERMEND.rec(G).think.heroine_02='Y3S2'; }catch(e){} SOCIAL.remember('heroine_02','ZR_LAST_SCREENING','');"   # 最後一場收著的那個狀態（ZRLAST.result keep 的結果）
THINK = "(()=>{ try{ return !!((TERMEND.rec(GAME.G).think||{}).heroine_02); }catch(e){ return 'ERR '+e; } })()"
BGHOOK = """(()=>{ if(window.__BGH||typeof ADV==='undefined') return; window.__BGH=1; const s=b=>typeof b==='string'?b:JSON.stringify(b||null);
  if(ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ try{ window.__LOG.push({n:'BG',t:'BG:'+s(o&&o.background),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return b0.apply(this,arguments); }; }
  if(GAME.choose&&!GAME.choose.__bb){ const c0=GAME.choose; const f=function(o){ try{ window.__LOG.push({n:'CHOICE',t:'CHOICE:'+(o||[]).map(x=>x&&x.t||'').join('｜'),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return c0.apply(this,arguments); }; f.__bb=1; GAME.choose=f; }
  if(ADV.setBg){ const b1=ADV.setBg; ADV.setBg=function(b){ try{ window.__LOG.push({n:'BG',t:'BG:'+s(b),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return b1.apply(this,arguments); }; } })()"""

ZS_ASK = ['明天八點半，第二航廈。', '你說要來的。']
ZS_EV = ['（八點半。她推著一個很大的行李箱，旁邊站著一個比她矮一點的阿姨。）', '我媽。', '你好。她說有同學要來，我還不信。', '……媽。', '（她從外套口袋拿出一張摺好的紙。）', '那邊的地址。', '電影看完，寫的那一句寄這裡。']
ZS_STUBL = ['（她又拿出一張電影票根。）', '這個本來放在櫃台。你沒來拿。']
ZS_A = '那邊我只寄明信片。……傳訊息的話，我會一直看手機。'; ZS_C = '查過了，比臺北冷十度。我帶了兩件外套。……我媽又塞了一件。'
ZS_END = ['（廣播叫了她那班飛機。她把行李箱推給櫃台以後，只剩一個背包。）', '好。', '（她走到出境的門口，回頭揮了一下手，進去了。）', '我搭十點的客運回台中。你呢？', '好。路上小心。']
ZS_DEPART10 = ['今天出發去英國了。']
ZS_HOOK = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'HOOK_ZR_SENDOFF': True}
ZS_JS = "LV('heroine_02',45,30,10); G.contacts=G.contacts||{}; if(G.contacts.heroine_02==null) G.contacts.heroine_02=D('2025-09-24');"
ZS_SHIFT = "G.events=G.events||{done:{}}; G.events.done=G.events.done||{}; G.events.done.ev_zhiruo_last_shift=1; G.flags.ZR_LAST_SHIFT='seen';"
KX_L = "LV('kexin',70,60,60); try{ ROM.start(G,'kexin'); }catch(e){} G.flags.dating_kexin=true; G.contacts=G.contacts||{}; if(G.contacts.kexin==null) G.contacts.kexin=D('2025-09-24');"
KX29 = ['謝謝！！', '（長頸鹿貼圖）', '今天在圖書館過 國考的書比蛋糕還厚']
EXTRA = [
  dict(id='ZS_GO', key='2027-09-01', h=20.75, flags=ZS_HOOK, js=ZS_JS + ZS_SHIFT, asks={'zr_sendoff_ask_2027': '會到'},
       steps=[('until', 21.2), ('ffloop', '2027-09-02', 10.6)], pref=['出發：芷若出發', '「到了傳訊息給我。」', '「我回學校。」'],
       want=ZS_EV + [ZS_A] + ZS_END + ['BG:airport_departure'], order=ZS_EV + [ZS_A] + ZS_END, none=ZS_STUBL + [ZS_C, '二月回來。……第一張明信片寄給你。'],
       msgAt={ZS_ASK[0]: ('2027-09-01', 21.0, 0.1), ZS_ASK[1]: ('2027-09-01', 21.0, 0.1)}, noneMsg=['我要進去了。', '我出發了。'] + ZS_DEPART10,
       cflags=['ZR_SENDOFF_2027', 'ZR_SENDOFF_GO', 'ZR_LAST_SHIFT'], eqflags={'ZR_SENDOFF_2027': 'met', 'ZR_SENDOFF_GO': True}, cmem=[['heroine_02', 'ZR_SAW_OFF']], eqmem={'heroine_02/ZR_SAW_OFF': '她出發那天，你去了機場'},
       jsok=[('出遊 zr_sendoff_2027：9/2 08:30、done', "(()=>{ const q=OUT.get(GAME.G,'zr_sendoff_2027'); return q?{d:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title}:null; })()", lambda q: bool(q) and q['d'] == '2027-09-02' and abs(q['h'] - 8.5) < 0.01 and q['state'] == 'done')]),
  dict(id='ZS_NO', key='2027-09-01', h=20.75, flags=ZS_HOOK, js=ZS_JS + ZS_SHIFT, asks={'zr_sendoff_ask_2027': '明天臨時有事'},
       steps=[('until', 21.2), ('ffloop', '2027-09-02', 10.0)], pref=[], none=ZS_EV[:1],
       msgAt={'我出發了。': ('2027-09-02', 9.667, 0.05)}, noneMsg=['我要進去了。'] + ZS_DEPART10, cflags=['ZR_SENDOFF_2027'], eqflags={'ZR_SENDOFF_2027': 'declined'}),
  dict(id='ZS_LATE', key='2027-09-01', h=20.75, flags=ZS_HOOK, js=ZS_JS + ZS_SHIFT, asks={'zr_sendoff_ask_2027': '會到'},
       steps=[('until', 21.2), ('ffloop', '2027-09-02', 10.0)], pref=['晚一點'], none=ZS_EV[:1],
       msgAt={'我要進去了。': ('2027-09-02', 9.667, 0.05)}, noneMsg=['我出發了。'] + ZS_DEPART10, cflags=['ZR_SENDOFF_2027', 'ZR_SENDOFF_GO'], eqflags={'ZR_SENDOFF_2027': 'missed', 'ZR_SENDOFF_GO': True}),
  dict(id='ZS_NOHOOK', key='2027-09-01', h=20.75, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, js=ZS_JS + ZS_SHIFT,
       steps=[('until', 21.4)], pref=[], noneMsg=ZS_ASK, cflags=['ZR_SENDOFF_2027'], eqflags={'ZR_SENDOFF_2027': '(undefined)'}),
  dict(id='ZS_STUB', key='2027-09-01', h=20.75, flags=ZS_HOOK, js=ZS_JS, asks={'zr_sendoff_ask_2027': '會到'},
       steps=[('until', 21.2), ('ffloop', '2027-09-02', 10.6)], pref=['出發：芷若出發', '「妳那邊冷嗎？」', '「我送您到客運站。」'],
       want=ZS_EV + ZS_STUBL + [ZS_C, '（你們走到客運站。她上車以前，跟你點了一下頭。）'], order=ZS_EV + ZS_STUBL + [ZS_C], none=[ZS_A], noneMsg=ZS_DEPART10,
       cflags=['ZR_SENDOFF_2027', 'ZR_LAST_SHIFT'], eqflags={'ZR_SENDOFF_2027': 'met', 'ZR_LAST_SHIFT': 'airport'}, cmem=[['heroine_02', 'TICKET_STUB']], eqmem={'heroine_02/TICKET_STUB': '她出發那天，在機場給的電影票根'}),
  dict(id='USJ_0803', key='2028-08-02', h=21.67, zone='us_apartment', flags=dict(USF, Y4_PATH='bar'), js=B['USJS'] + B['DATE'] + B['BED'], asks={'sis0803': '醒了。'},
       steps=[('bedpick', '睡覺', ['睡覺', '再撐一下']), ('until', 5.5), ('bedfirst', '再睡到早上（09:00）'), ('at', '2028-08-03', 9.0, 0.3), ('ffloop', '2028-08-04', 10.5), ('stopchk', [('2028-08-04', 9.75)])],
       pref=['出發', '去'], wantMsg=['再睡一下。手續是明天十點。'], cflags=['USL_JETLAG']),
  dict(id='KX29_BDAY', key='2029-04-24', h=20.0, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'Y4_PATH': 'other'}, js="G.flags.Y4_PATH_DAY=D('2028-06-08');" + KX_L,
       steps=[('sendchat', 'kexin', 'bday'), ('until', 20.4)], pref=[], replyHas={'kexin': KX29[2]}, replyAll={'kexin': KX29}, replyNone={'kexin': ['上山', '下山']}),
  dict(id='KX28_BDAY', key='2028-04-24', h=20.0, flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}, js=KX_L, obs=True,
       steps=[('sendchat', 'kexin', 'bday'), ('until', 20.4)], pref=[]),
]

def played(pick):   # 去了＝第 3、4 節依序（pick：WAIT／KEEP）
    return SEC3 + SEC4A + [NOASK_N] + SEC4B + pick + [CLOSE]
GO_CHK = [('出遊 zr_last_screening：8/26 19:30、「和芷若：公館二輪戲院」、alarm、done', OUTQ, lambda q: bool(q) and q['d'] == '2028-08-26' and abs(q['h'] - 19.5) < 0.01 and q['title'] == '和芷若：公館二輪戲院' and q['alarm'] and q['state'] == 'done')]
SCENS = [
  dict(id='ZL_WAIT', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2), ('ffloop', '2028-09-01', 21.5)], pref=['出發：和芷若', '「我等妳回來。」'],
       want=played(WAIT) + ['BG:gongguan_cinema'], none=[ASKED_N] + KEEP, order=played(WAIT),
       msgAt={ASK[0]: ('2028-08-24', 21.0, 0.1), ASK[1]: ('2028-08-24', 21.0, 0.1), YES: ('2028-08-24', 21.2, 0.25), N_WAIT[0]: ('2028-08-26', 23.0, 0.1), N_WAIT[1]: ('2028-08-26', 23.0, 0.1), FLY[0]: ('2028-09-01', 21.0, 0.1), FLY[1]: ('2028-09-01', 21.0, 0.1)},
       noneMsg=[NO, LATE, AFTER] + N_KEEP, cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'wait', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': '(空)'},
       jsok=GO_CHK + [('「我等妳回來。」＝和她交往（ROM／dating）', DATING, True), ('房間物件「她的票根」', HASROOM, True)]),
  dict(id='ZL_KEEP', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2), ('ffloop', '2028-09-01', 21.5)], pref=['出發：和芷若', '「我先收著。」'],
       want=played(KEEP) + ['BG:gongguan_cinema'], none=[ASKED_N] + WAIT, order=played(KEEP),
       msgAt={N_KEEP[0]: ('2028-08-26', 23.0, 0.1), N_KEEP[1]: ('2028-08-26', 23.0, 0.1)}, noneMsg=[NO, LATE, AFTER] + N_WAIT[1:] + FLY,
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'keep', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': '(空)'},
       jsok=GO_CHK + [('「我先收著。」＝沒有交往', DATING, False), ('「我先收著。」＝學期末心意邀約的「讓我想想」（TERMEND think）', THINK, True), ('房間物件「她的票根」', HASROOM, True)]),
  dict(id='ZL_NO', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '那天不行'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 22.5)], pref=[],
       none=SEC3[:1] + SEC4A[:1], msgAt={NO: ('2028-08-24', 21.2, 0.25)}, noneMsg=[YES, LATE, AFTER] + N_WAIT[1:] + N_KEEP[1:],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'no'}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': None},
       jsok=[('沒有排出遊', OUTQ, None), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_NOREPLY', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART,
       steps=[('until', 21.2), ('ffloop', '2028-08-25', 18.5)], pref=[],
       none=SEC3[:1], msgAt={ASK[1]: ('2028-08-24', 21.0, 0.1), NO: ('2028-08-25', 18.0, 0.1)}, noneMsg=[YES, LATE, AFTER],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'no'}, jsok=[('沒有排出遊', OUTQ, None), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_LATE', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 22.2)], pref=['晚一點'],
       none=SEC3[:1] + SEC4A[:1], msgAt={YES: ('2028-08-24', 21.2, 0.25), LATE: ('2028-08-26', 19.75, 0.1), AFTER: ('2028-08-26', 22.0, 0.1)}, noneMsg=N_WAIT[1:] + N_KEEP[1:],
       cflags=['ZR_LAST', 'ZR_LAST_GO'], eqflags={'ZR_LAST': 'missed', 'ZR_LAST_GO': True}, cmem=[['heroine_02', 'ZR_LAST_SCREENING']], eqmem={'heroine_02/ZR_LAST_SCREENING': None},
       jsok=[('出遊沒有 done（答應了沒到）', OUTQ, lambda q: bool(q) and q['state'] != 'done'), ('沒有房間物件', HASROOM, False)]),
  dict(id='ZL_JP', key='2028-08-24', h=20.75, flags=JPF, js=Y4 + JPJS + HEART, asks={'zr_last_ask': '好'},
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.0), ('until', 23.2)], pref=['出發：和芷若', '「我等妳回來。」'],
       want=played(WAIT), order=played(WAIT), msgAt={ASK[0]: ('2028-08-24', 21.0, 0.1), N_WAIT[1]: ('2028-08-26', 23.0, 0.1)},
       cflags=['ZR_LAST'], eqflags={'ZR_LAST': 'wait'}, jsok=GO_CHK + [('交往', DATING, True)]),
  dict(id='ZL_US', key='2028-08-24', h=20.75, zone='us_apartment', flags=USF, js=B['USJS'] + Y4 + HEART + B['BED'],
       steps=[('until', 21.4)], pref=[], noneMsg=ASK, cflags=['ZR_LAST'], eqflags={'ZR_LAST': '(undefined)'}, jsok=[('沒有排出遊', OUTQ, None)]),
  dict(id='ZL_CUP', key='2028-08-24', h=20.75, flags=dict(TWF, ZR_CUP='declined'), js=Y4 + HEART,
       steps=[('until', 21.4)], pref=[], noneMsg=ASK, cflags=['ZR_LAST'], eqflags={'ZR_LAST': '(undefined)'}),
  dict(id='ZL_TAKEN', key='2028-08-24', h=20.75, flags=TWF, js=Y4 + HEART + KX_DATE,
       steps=[('until', 21.4)], pref=[], noneMsg=ASK, cflags=['ZR_LAST'], eqflags={'ZR_LAST': '(undefined)'}, jsok=[('前置：祐廷和可昕交往中（ROM.partners）', PARTNERS, lambda x: 'kexin' in (x or []))]),
  dict(id='ZL_AGAIN_KEEP', minimal=True, key='2029-09-01', h=15.0, zone='wenzhou', pos=CAFE_OUT, flags=AGAIN_F, js=AGAIN_JS,
       steps=[('use', '^進入兩點半 Café')], pref=[AG['keepT']],
       want=[AG['n0'], AG['hi'], AG['ask'], AG['me'], AG['take'], AG['keepN'], AG['keep']], order=[AG['n0'], AG['hi'], AG['ask'], AG['me'], AG['take'], AG['keepN'], AG['keep']], none=[AG['giveN'], AG['no']],
       cflags=['ZR_LAST', 'ZR_LAST2'], eqflags={'ZR_LAST': 'keep', 'ZR_LAST2': 'back'}, wantZone='cafe',
       jsok=[('「我一直收著。」＝交往', DATING, True), ('票根還在房間', HASROOM, True)]),
  dict(id='ZL_AGAIN_GIVE', minimal=True, key='2029-09-01', h=15.0, zone='wenzhou', pos=CAFE_OUT, flags=AGAIN_F, js=AGAIN_JS,
       steps=[('use', '^進入兩點半 Café')], pref=[AG['giveT']],
       want=[AG['n0'], AG['ask'], AG['giveN'], AG['give']], order=[AG['n0'], AG['hi'], AG['ask'], AG['me'], AG['take'], AG['giveN'], AG['give']], none=[AG['keepN'], AG['no']],
       cflags=['ZR_LAST', 'ZR_LAST2'], eqflags={'ZR_LAST': 'keep', 'ZR_LAST2': 'closed'}, wantZone='cafe',
       jsok=[('「還給妳。」＝沒有交往', DATING, False), ('房間物件「她的票根」拿掉', HASROOM, False)]),
  dict(id='ZL_AGAIN_TAKEN', minimal=True, key='2029-09-01', h=15.0, zone='wenzhou', pos=CAFE_OUT, flags=AGAIN_F, js=AGAIN_JS + KX_DATE,
       steps=[('use', '^進入兩點半 Café')], pref=[],
       want=[AG['hiNo'], AG['no']], order=[AG['hiNo'], AG['no']], none=[AG['n0'], AG['ask'], AG['keepN'], AG['giveN']],
       cflags=['ZR_LAST', 'ZR_LAST2'], eqflags={'ZR_LAST': 'keep', 'ZR_LAST2': 'wait'}, wantZone='cafe',
       jsok=[('沒有和她交往', DATING, False), ('票根留在房間', HASROOM, True), ('前置：祐廷和可昕交往中', PARTNERS, lambda x: 'kexin' in (x or []))]),
  dict(id='ZL_FANG', key='2028-06-21', h=20.75, flags=dict(TWF, FANG_F3='direct'), js=Y4 + HEART + FANG_JS,
       steps=[('until', 21.3)], pref=[], msgAt={FANG[0]: ('2028-06-21', 21.0, 0.1), FANG[1]: ('2028-06-21', 21.0, 0.1)}, countMsg={FANG[0]: 1, FANG[1]: 1}),
  dict(id='ZL_FANG_NOCALL', key='2028-06-21', h=20.75, flags=dict(TWF, FANG_F3='nocall'), js=Y4 + HEART + FANG_JS,
       steps=[('until', 21.3)], pref=[], noneMsg=FANG),
]

async def load_min(pg, sc, run):
    """畢業以後的最小存檔（aa382_probe.py launch 的 pg_mode）：sc zone／pos 照情境"""
    ks = ['2025-09-24', '2026-09-06', '2027-09-05', '2028-09-03', '2029-06-01', '2029-06-02', '2029-06-28', sc['key']]
    dk = await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })(%s)" % json.dumps(ks))
    F = {'KX_DEC3_MIGRATED': True, 'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'],
         'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True,
         'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'PG': {'done': {'grad': 1}}}
    if sc.get('pregrad'):   # BB-B 10-23：畢業典禮當天早上（aa381_probe.py launch_min 的做法）＝還沒畢業、還沒搬走
        for k in ('GRADUATED', 'GRAD_DONE', 'MOVED_OUT', 'HOME_AFTER', 'PG'): F.pop(k, None)
        F.update({'met_sis': True, 'SIS_W1': True})
    F.update(sc.get('flags', {}))
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[sc['key']], 'hour': sc['h'], 'energy': 100, 'money': 22000, 'zone': sc.get('zone', 'campus'), 'pos': sc.get('pos'), 'weather': 'clear', 'flags': F,
          'events': {'done': ({'ev_sis_w1': 1} if sc.get('pregrad') else {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1, 'ev_sis_w1': 1}), 'last': {}, 'count': 0}}
    if sc.get('pregrad'): st['contacts'] = {'heroine_05': dk['2025-09-24'] if '2025-09-24' in dk else 0}
    st['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % st['day'])
    await L.load_state(pg, st); await pg.wait_for_timeout(3000)
    await pg.evaluate(B['HOOK']); await pg.evaluate('window.__LOG=[]; window.__M0=GAME.G.money')
    if sc.get('js'): await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k), LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; %s })()" % sc['js'])
    run.setup('[前置] %s：最小存檔（畢業以後，aa382_probe 的做法）%s %.2f %s %s；旗標 %s；console：%s' % (sc['id'], sc['key'], sc['h'], st['zone'], json.dumps(sc.get('pos')), json.dumps(sc.get('flags', {}), ensure_ascii=False), sc.get('js', '')))

async def sendchat(pg, pid, topic, sc):
    """主動傳訊息（手機 → 朋友 → 那個人的「訊息」→「傳訊息」→ 話題；照 us_life_probe 的 sendchat），記下送之前 G.msgs 的長度"""
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(900)
    ok1 = await pg.evaluate("(id=>{ const b=[...document.querySelectorAll('#phoneBody [data-msg]')].find(x=>x.dataset.msg===id); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
    ok2 = await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-msgto=\"'+id+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid)); await pg.wait_for_timeout(900)
    tops = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-msgt]')].map(b=>b.dataset.msgt+'='+b.textContent.trim())")
    n0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    ok3 = await pg.evaluate("(k=>{ const b=document.querySelector('#phoneBody [data-msgt=\"'+k+'\"]'); if(!b) return false; b.click(); return true; })(%s)" % json.dumps(pid + '|' + topic)); await pg.wait_for_timeout(1500)
    say('   傳給 %s（%s）：朋友頁「訊息」%s、「傳訊息」%s、話題 %s → %s' % (pid, topic, ok1, ok2, tops, ok3))
    chs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
    if chs: say('   傳完出現選項：%s' % chs)
    sc['_choices_after_send'] = chs
    await B['close_phone'](pg)
    if ok3: sc.setdefault('_sent', {})[pid] = n0
    else: bad.append('%s：傳不了訊息給 %s（%s）' % (sc['id'], pid, tops))

IV_JS = ("LV('heroine_01',45,30,20); G.contacts=G.contacts||{}; if(G.contacts.heroine_01==null) G.contacts.heroine_01=D('2025-09-03'); G.invites=G.invites||[];"
         " const P=INV.place('cafe')||{}; G.invites.push({id:'iv_bb1023',who:'heroine_01',place:'cafe',zone:P.zone,day:G.day,h:15,state:'accepted',accepted:true,by:'player',label:'和小安約在'+(P.name||'')});")
IVQ = "(()=>{ const iv=(GAME.G.invites||[]).find(x=>x.id==='iv_bb1023'); return iv?{state:iv.state,goAsked:iv.goAsked||0,zone:GAME.G.zone}:null; })()"
GO_LINE = '約在兩點半 Café（15:00）'
BOOK_POP = '櫃台叫住你：「同學，你有一本《民法總則》逾期三天。」'; BOOK_RET = '（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）'
LIB2F = {'x': 10.8, 'z': -6.0, 'yaw': -1.5708, 'lv': 1}
EXTRA += [
  dict(id='INV_GO', key='2025-10-08', h=14.55, flags={}, js=IV_JS, steps=[('until', 15.3)], pref=['直接過去：和'], want=['CHOICE:' + GO_LINE], wantZone='cafe',
       jsok=[('選直接過去：到兩點半 Café、約已經開始（不是 accepted）', IVQ, lambda x: bool(x) and x['zone'] == 'cafe' and x['state'] != 'accepted')]),
  dict(id='INV_WALK', key='2025-10-08', h=14.55, flags={}, js=IV_JS, steps=[('until', 14.95)], pref=['自己走過去'], want=['CHOICE:' + GO_LINE],
       jsok=[('選自己走過去：還在宿舍、goAsked＝1（不再問：上面「演了 N 次」會抓）', IVQ, lambda x: bool(x) and x['zone'] != 'cafe' and x['goAsked'] == 1)]),
  dict(id='INV_PHONE', key='2025-10-08', h=14.55, flags={}, js=IV_JS + " G.invites[G.invites.length-1].goAsked=1;", steps=[('until', 14.6), ('phonego',), ('until', 15.2)], pref=[], none=['CHOICE:' + GO_LINE], wantZone='cafe',
       jsok=[('手機「前往」：到兩點半 Café', IVQ, lambda x: bool(x) and x['zone'] == 'cafe')]),
  dict(id='BOOK_NO', key='2025-10-15', h=13.0, zone='library_hall', gset={'pos': LIB2F}, flags={},
       steps=[('use', '^樓梯間：往 3F'), ('use', '^樓梯間：下樓'), ('addday', 8), ('use', '^樓梯間：往 3F'), ('use', '^樓梯間：下樓'), ('addday', 8), ('use', '^樓梯間：往 3F'), ('use', '^樓梯間：下樓'), ('addday', 8), ('use', '^樓梯間：往 3F')],
       pref=[], none=[BOOK_POP], wantZone='library', cflags=['book_overdue'], eqflags={'book_overdue': '(undefined)'}),
  dict(id='BOOK_OLD', key='2025-10-15', h=13.0, zone='library_hall', gset={'pos': LIB2F}, flags={'book_overdue': True}, js="G.flags.book_overdue_day=G.day-1;",
       steps=[('until', 13.1), ('use', '^樓梯間：往 3F')], pref=[], want=[BOOK_RET], none=[BOOK_POP], dmoney=-40, cflags=['book_overdue'], eqflags={'book_overdue': False}),
]
SIS_D = (NOKX + " G.flags.met_sis=true; G.flags.SIS_W1=true; LV('heroine_05',70,60,60); SOCIAL.rel('heroine_05').npcRom=60; SOCIAL.rel('heroine_05').rom=60;"
         " try{ ROM.start(G,'heroine_05'); }catch(e){} G.flags.dating_heroine_05=true; G.contacts=G.contacts||{}; G.contacts.heroine_05=D('2025-09-10');")
SIS_N = NOKX + " G.flags.met_sis=true; G.flags.SIS_W1=true; LV('heroine_05',50,40,35); G.contacts=G.contacts||{}; G.contacts.heroine_05=D('2025-09-10');"
R0 = " window.__QX0=(r=>({fam:r.fam,comf:r.comf,npcRom:r.npcRom}))(SOCIAL.rel('heroine_05'));"
QXD = "(()=>{ const r=SOCIAL.rel('heroine_05'), o=window.__QX0||{}; return {fam:r.fam-o.fam, comf:r.comf-o.comf, npcRom:r.npcRom-o.npcRom}; })()"
QXL = "(()=>{ try{ return DATE.log(GAME.G,'heroine_05').count|0; }catch(e){ return 'ERR'; } })()"
Q26 = ['（店裡只有兩桌客人。她已經坐在靠牆的位子，菜單沒有翻開。）', '這家今天不會客滿。我查過了。', '鯖魚。你呢？', '好。兩份鯖魚。', '（吃到一半，她問你暑假在做什麼，你講了，她聽得很認真。）',
       '我九月開學。研究室的位子已經分好了，靠門。', '……開學以後，平日晚上我大概都在那裡。', '七點以後。七點以前我不理人。', '（巷口的花店門口擺了一排包好的玫瑰。她看了一眼，沒有停。）']
Q27 = ['（八點零五分，她從研究室出來，手上拿著一疊印好的稿子。）', '第三節寫完了。……第二節被我刪了一半。', '（你們坐在霖澤館門口的台階上吃便當。暑假的晚上，校園裡沒什麼人。）',
       '算。刪掉的那一半本來就不該寫。', '明年八月，我就在美國了。', '（她把便當盒蓋起來，收進袋子裡。）', '走吧。我送你到路口。']
Q28US = ['明天早上九點，我在宿舍門口等你。這邊週六有市集。', '（週六早上的市集，攤子上堆著桃子和玉米。）', '這邊沒有七夕。', '臺灣那邊快過完了。……我早上算過時差。', '這邊的七夕是什麼？', '買桃子。', '……好。那就買桃子。']
Q28V = ['我這邊是早上。你那邊是七夕。', '我剛起來。頭髮很亂，不要截圖。', '……我說了不要。', '好，你截這個。', '十二月我就回去了。']
TW2 = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
EXTRA = [
  dict(id='QX26_GO', key='2026-08-17', h=20.75, flags=TW2, js=SIS_D + R0, asks={'sisqx_2026_ask': '好。'},
       steps=[('until', 21.2), ('ffloop', '2026-08-19', 20.0)], pref=['出發：七夕', '「跟妳一樣。」', '「那我去研究室找妳。」'],
       want=Q26, order=Q26, msgAt={'後天七夕。': ('2026-08-17', 21.0, 0.1), '我想去溫州街那家定食。七點。': ('2026-08-17', 21.0, 0.1)},
       cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2026': 'met'}},
       jsok=[('當面三場＝她的戀愛 +5（熟悉、自在另外會因為別的事加，只看戀愛）', QXD, lambda x: x['npcRom'] == 5), ('不算正式校外約會（DATE.log 次數 0）', QXL, 0)]),
  dict(id='QX26_NO', key='2026-08-17', h=20.75, flags=TW2, js=SIS_D + R0, asks={'sisqx_2026_ask': '那天不行'},
       steps=[('until', 21.2), ('ffloop', '2026-08-19', 20.5)], pref=[], none=Q26[:1],
       cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2026': 'declined'}},
       jsok=[('回「那天不行。」：不扣關係（她的戀愛差 0）', QXD, lambda x: x['npcRom'] == 0), ('沒有排出遊', "(()=>{ const q=OUT.get(GAME.G,'sisqx_2026'); return q?q.state:null; })()", None)]),
  dict(id='QX27_LAST', key='2027-08-06', h=20.75, flags=TW2, js=SIS_D + R0, asks={'sisqx_2027_last': '妳呢？', 'sisqx_2027_ask': '好，我帶'},
       steps=[('until', 21.4), ('ffloop', '2027-08-08', 21.0)], pref=['出發：七夕', '「刪了一半還算寫完嗎？」'],
       want=Q27, order=Q27, wantMsg=['七夕。去年你在幹嘛？', '讀書。', '我那天在研究室寫到八點。', '晚餐你帶。'], noneMsg=['週日七夕。'],
       cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2027': 'met'}}, jsok=[('她的戀愛 +5', QXD, lambda x: x['npcRom'] == 5)]),
  dict(id='QX27_MET', key='2027-08-06', h=20.75, flags=dict(TW2, SIS_QIXI={'2026': 'met'}), js=SIS_D + R0,
       steps=[('until', 21.3)], pref=[], wantMsg=['週日七夕。', '我那天在研究室寫到八點。', '你可以八點來接我。', '晚餐你帶。'], noneMsg=['七夕。去年你在幹嘛？']),
  # BB-B 16:5x：[前置] 一開始就站在床邊（B['BED']；原本 PLAT＝門口，負載 25 時 421 秒只跑 97 格，走到床就逾時、整段沒跑）
  dict(id='QX28_US', key='2028-08-25', h=16.8, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D + R0 + B['BED'],
       steps=[('until', 17.6), ('ffloop', '2028-08-26', 10.0)], pref=['出發：七夕', '「那我們過這邊的。」'],
       want=Q28US, order=Q28US, cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2028': 'met'}}, jsok=[('她的戀愛 +5', QXD, lambda x: x['npcRom'] == 5)]),
  dict(id='QX28_TW', key='2028-08-25', h=20.75, flags=dict(TWF), js=Y4 + SIS_D + R0,
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.6)], pref=['接起來', '（截圖）'],
       want=Q28V, order=Q28V, msgAt={'明天你那邊晚上九點，我視訊給你。': ('2028-08-25', 21.0, 0.1)}, noneMsg=['你在忙。那我先去圖書館了。'],
       cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2028': 'video'}}, jsok=[('視訊＝她的戀愛 +3', QXD, lambda x: x['npcRom'] == 3)]),
  dict(id='QX28_TWMISS', key='2028-08-25', h=20.75, flags=dict(TWF), js=Y4 + SIS_D + R0,
       steps=[('until', 21.2), ('ffloop', '2028-08-26', 21.7)], pref=['今天先不要'], none=Q28V[1:2],
       msgAt={'你在忙。那我先去圖書館了。': ('2028-08-26', 21.5, 0.1)}, cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': {'2028': 'missed'}}, jsok=[('沒接：不扣關係', QXD, lambda x: x['npcRom'] == 0)]),
  dict(id='QX_NODATE', key='2026-08-17', h=20.75, flags=TW2, js=SIS_N, steps=[('until', 21.4)], pref=[], noneMsg=['後天七夕。'], cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': '(undefined)'}),
  dict(id='QX_KX', key='2026-08-17', h=20.75, flags=TW2, js=SIS_D + KX_L, steps=[('until', 21.4)], pref=[], noneMsg=['後天七夕。'], cflags=['SIS_QIXI'], eqflags={'SIS_QIXI': '(undefined)'}),
] + EXTRA
SCENS = SCENS + EXTRA

# ---------------------------------------------------------------- SIS-NO-THREE-1023（LAWWW-B 09:14 第 9 項，開發分支 bc1c8cd0b）：AA_398 第 5 節「BB-B 測試」那幾處
# 學姊不數件數（使用者 10-23）。每一個 S3_* 都另外查（nothree）：學姊說的話、旁白、她傳的訊息（讀檔以後才有的）不能有
#   /[一兩二三四]件事|第三件|第三格|第三點/、不能用「一，」「二，」「三，」開頭；全部的台詞＋新訊息不能有別人拿這個開玩笑的那幾句（BAN3）。
# 新句子照遊戲 bc1c8cd0b 的字（＝AA_398 第 1、1-7 節的新句）。志願表兩版、大四排法、重新開始＋答應：aa386_probe.py／aa386c_probe.py（預期句子這次換成新字）；
# 2/3 筆試前的便條照片（r3 photo）：aa378_probe.py NOTE23_*（同上）。陽明山心願（AA_398 第 3 節）：遊戲裡沒有這一場（LAWWW-B 09:0x：wish_bb 沒匯入），不測。
SISB = NOKX + " G.flags.met_sis=true; G.flags.SIS_W1=true; G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_sis_w1=G.events.done.ev_sis_w1||1; G.contacts=G.contacts||{}; if(G.contacts.heroine_05==null) G.contacts.heroine_05=D('2025-09-10');"
SISF = SISB + " LV('heroine_05',50,40,35);"
FLV = "(()=>{ try{ return SOCIAL.friendLevel('heroine_05'); }catch(e){ return 'ERR '+e; } })()"
NOTE = '（她推過來一張便條。'
BAN3 = ['那是我的句型', '你在用我的句型', '越來越像你們那個學姊', '三件都一樣', '學姊妳終於講超過三句了', '這不是三件事', '我多講了一件']
S3 = [
  # 1. 大一 Café 的四種便條（AA_398 第 1 列）：2025-10-13（一）19:24 在 Café（她週一 19～22 在 Café），找她說話（同一晚第二次＝「我在念。十點再說。」；第一次如果是關係升級的台詞，第二次才是 Café 這一場）
  dict(id='S3_CAFE_A', key='2025-10-13', h=19.4, zone='cafe', js=SISB + " LV('heroine_05',8,0,0);", steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=[],
       want=[NOTE + '便條只有一行：「第二題的爭點抓錯了。」字很小。）'], none=['三件事', '第三件'], nothree=True, jsok=[('她的關係＝ACQUAINTANCE', FLV, 'ACQUAINTANCE')]),
  dict(id='S3_CAFE_F', key='2025-10-13', h=19.4, zone='cafe', js=SISB + " LV('heroine_05',25,10,5);", steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=[],
       want=[NOTE + '便條上寫：「下次帶筆記來。」）'], none=['三件事', '第三件'], nothree=True, jsok=[('她的關係＝FAMILIAR', FLV, 'FAMILIAR')]),
  dict(id='S3_CAFE_R', key='2025-10-13', h=19.4, zone='cafe', js=SISB + " LV('heroine_05',45,30,20);", steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=[],
       want=[NOTE + '便條上寫：「這段寫得好。」「好」被劃掉，改成「可以」。）'], none=['只剩兩件', '三件事'], nothree=True, jsok=[('她的關係＝FRIEND', FLV, 'FRIEND')]),
  dict(id='S3_CAFE_C', key='2025-10-13', h=19.4, zone='cafe', js=SISB + " LV('heroine_05',65,50,45);", steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=[],
       want=[NOTE + '便條上只寫：「回去小心。」）'], none=['只有一件', '三件事'], nothree=True, jsok=[('她的關係＝CLOSE_FRIEND', FLV, 'CLOSE_FRIEND')]),
  # 2. 家聚（第 4、5 列）：大一上第 14 週週五 17:54 在公館，時間照走（18:00～19:30 自動演）
  dict(id='S3_FAMDIN', key='TERMDAY:Y1S1:14:5', h=17.9, zone='gongguan', js=SISB + " LV('heroine_05',30,15,10);", steps=[('until', 18.6)], pref=[],
       want=['周老師歷年的考古題。我整理過，錯的地方用紅筆改了。', '下學期的書，開學前我會分。書上標紅的地方是修法了，自己查新的。', '還有傳統！直屬學姊要講一個自己大一的糗事！'],
       none=['三件事。', '三是傳統！'], nothree=True),
  # 3. M2 換題目（第 12～14 列）：2027-01-20（三）21:00 家族群組；三個回覆各一次＋沒人回＝隔天 9:00 Kevin
] + [dict(id='S3_M2_' + k, key='2027-01-20', h=20.8, zone='dorm', js=SISF + (" SOCIAL.remember('heroine_05','FAMILY_DINNER','');" if k == 'CURRY' else ''),
          asks=({'sis_m2': t} if t else {}), steps=[('until', 21.4)] + ([('ffloop', '2027-01-21', 9.4)] if k == 'NONE' else []), pref=[],
          wantMsg=['這次的題目是我自己選的。法律扶助制度。', 'Kevin 幫我看第一段，學弟看第二段。', '計畫本最後一格還空著。你們想寫什麼，就寫。'] + w,
          noneMsg=['三件事。', '你在用我的句型管我。', '三，考完請吃飯！'], none=['三件事。'], nothree=True, cflags=['SIS_M2'], eqflags={'SIS_M2': f})
     for k, t, w, f in [('CURRY', '考完全家族', ['……好。考完那天我請。你們不要跟我搶。'], 'curry'), ('SLEEP', '考前一天不要熬夜', ['……你在管我。', '……好。收到。'], 'sleep'),
                        ('TELL', '不管考得怎樣', ['好。放榜那天就說。'], 'tell'), ('NONE', None, ['那我寫：考完請吃飯！'], 'none')]] + [
  # M3（第 52 列）：2027-03-19（五）20:00 家族群組、22:00 最後那一則
  dict(id='S3_M3', key='2027-03-19', h=19.8, zone='dorm', js=SISF, steps=[('until', 22.3)], pref=[], wantMsg=['計畫本最後那一格，我寫好了。聚餐那天說。'],
       noneMsg=['這次的第三件，我想好了。聚餐那天說。'], nothree=True),
  # 4. 美國篇 US0（第 29 列）：臺灣路線 2028-08-03 09:00，她到美國；送機兩個人（私訊）／家族（群組）
  dict(id='S3_US0_TWO', key='2028-08-03', h=8.8, zone='dorm', flags=dict(TWF, SIS_SENDOFF='two'), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['到了。', '這裡的天空很大。', '還有，那天我不講話，不是因為不想講。'], noneMsg=['到了。三件事。', '……算了，一件：這裡的天空很大。'], nothree=True),
  dict(id='S3_US0_FAM', key='2028-08-03', h=8.8, zone='dorm', flags=dict(TWF, SIS_SENDOFF='family'), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['到了。天空很大。', '學姊妳可以多講兩個字', '這裡的天空很大，大家保重。'], noneMsg=['到了。三件事。……算了，一件：這裡的天空很大。'], nothree=True),
  # 湖邊（第 31 列）：美國路線、交往中；11/22 21:00 她私訊 → 11/23 09:00 會所門口出發
  dict(id='S3_LAKE', key='2028-11-22', h=20.8, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D + B['PLAT'],
       steps=[('until', 21.3), ('ffloop', '2028-11-23', 12.5)], pref=['出發：感恩節的湖邊'],
       want=['放假要做的事，我寫在備忘錄了。', '（她把手機給你看。備忘錄上只有一行：「睡到自然醒」。）', '其他的想不到。', '穿暖。不要帶筆電。', '（愣住，然後笑出來）……你在管我。', '好。那再加一行：看雪。'],
       none=['第三件想不到。', '兩件事。一，穿暖。', '那是我的句型', '第三件就'], nothree=True, cflags=['US3'], eqflags={'US3': 'two'}),
  # 10:5x 第二次：第一次用快轉，停在 11/23 08:45（出遊開始的那一刻）「出發」沒有跳出來，再快轉一次停在 09:15（時間窗最後）＝錯過。照玩家睡到早上、時間照走等「出發」
  dict(id='S3_LAKE2', key='2028-11-22', h=20.8, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D + B['PLAT'],
       steps=[('until', 21.3), ('bedpick', '睡到明天早上'), ('until', 12.5)], pref=['出發：感恩節的湖邊'],
       want=['放假要做的事，我寫在備忘錄了。', '（她把手機給你看。備忘錄上只有一行：「睡到自然醒」。）', '其他的想不到。', '穿暖。不要帶筆電。', '（愣住，然後笑出來）……你在管我。', '好。那再加一行：看雪。'],
       none=['第三件想不到。', '兩件事。一，穿暖。', '那是我的句型', '第三件就'], nothree=True, cflags=['US3'], eqflags={'US3': 'two'}),
  # 11:4x 第三次：S3_LAKE2 時間照走太慢（07:30→07:58 用了 420 秒，沒走到 08:45）＝腳本。改成睡到早上、再「小睡 1 小時」到 08:30，時間照走最多 15 分鐘等「出發」
  dict(id='S3_LAKE3', key='2028-11-22', h=20.8, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D + B['PLAT'],
       steps=[('until', 21.3), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 1 小時'), ('until', 9.6, 900)], pref=['出發：感恩節的湖邊'],
       want=['放假要做的事，我寫在備忘錄了。', '（她把手機給你看。備忘錄上只有一行：「睡到自然醒」。）', '其他的想不到。', '穿暖。不要帶筆電。', '（愣住，然後笑出來）……你在管我。', '好。那再加一行：看雪。'],
       none=['第三件想不到。', '兩件事。一，穿暖。', '那是我的句型', '第三件就'], nothree=True, cflags=['US3'], eqflags={'US3': 'two'}),
  # 舊金山（第 32 列）：[捷徑] 直接開演 ev_sf1（交往中、美國路線；離開美國那一段另外測過），選「第一天：睡到自然醒。」
  dict(id='S3_SF1', key='2028-12-16', h=20.0, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D,
       steps=[('runev', 'ev_sf1')], pref=['「第一天：睡到自然醒。」'],
       want=['以前出門，我會先把每一天都排好。', '……這一頁我不寫。', '……這也算行程嗎。', '好。算。', '（她在那一頁寫下：「第一天：睡到自然醒。」然後把筆蓋起來。）'],
       none=['以前出門，我會先寫三件事。', '這可以算一件事嗎', '一，睡到自然醒'], nothree=True),
  # 5. 接機＋隔天（第 35、36 列）：臺灣路線 2028-12-23（六）19:36 宿舍；家族共乘版／交往中版；選「先回家睡覺。」→ 12/24 11:00 那一則
] + [dict(id='S3_PICK_' + k, key='2028-12-23', h=19.6, zone='dorm', flags=dict(TWF, SIS_PICKUP_V=v), js=Y4 + (SIS_D if k == 'LOVER' else SISF),
          steps=[('until', 23.0), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 2 小時'), ('bedpick', '小睡 2 小時'), ('until', 11.3, 900), ('until', 11.8, 600)], pref=['出發：接機', '「先回家睡覺。」'],   # 11:32 醒來再站一下（BB-B 14:1x：11:32 一醒就讀，那一則還沒出來＝還在佇列？）   # 7:30 起床後照走到 11:00 要四十分鐘以上（負載高時 420 秒只走 0.6 小時）→ 床上小睡兩次
          want=['美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。', '我想吃滷肉飯。現在。', '……好。明天。明天一定。'] + w,
          none=['三件事。一，美國的雞蛋', '學姊妳終於講超過三句了！', '……四，我想你。'] + nw, wantMsg=['滷肉飯。今天。不要再說明天。'], noneMsg=['滷肉飯。今天。這不是三件事。'],
          nothree=True, cflags=['SIS_PICKUP', 'SIS_PICKUP_TMR'], eqflags={'SIS_PICKUP_TMR': True},
          jsok=[('【讀資料】隔天那一則：PHONE 佇列／已傳／家族群組／phoneY4c 條件', "(()=>{ const G=GAME.G, P=PHONE.rec(G); return {sent:PHONE.sent(G,'y4_pickup_tmr'), q:(P.q||[]).filter(x=>x.tag).map(x=>x.tag+'@'+CALENDAR.dateOf(x.day).key+' '+x.h), inGroup:PHONE.inGroup(G,'family_law'), day:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(2)}; })()", lambda x: bool(x) and x['sent'])])
     for k, v, w, nw in [('FAM', 'family', ['學姊妳今天話好多！'], ['……還有，我想你。']), ('LOVER', 'lover', ['……還有，我想你。'], ['學姊妳今天話好多！'])]] + [
  # 6. 三張「你可以」：10/25 推甄前的便條照片（第 34 列）、2/3 考場門口（第 37 列）、國考前一天的照片（第 39 列；畢業以後，最小存檔、和可昕交往中＝照片版）
  dict(id='S3_PUSH', key='2028-10-25', h=20.8, zone='dorm', flags=dict(TWF, Y4_PATH='grad'), js=Y4 + SISF, asks={'y4_push_note': '只有一句'}, steps=[('until', 21.5)], pref=[],
       wantMsg=['📷（一張手寫的便條）', '（便條：「你可以。」）', '一句就夠了。'], noneMsg=['（便條：「一，你可以。二，你可以。三，你可以。」）', '對。'], nothree=True),
  dict(id='S3_EXAMNOTE', key='2029-02-03', h=7.95, zone='dorm', flags=dict(TWF, Y4_PATH='grad'), js=Y4 + SISF, steps=[('until', 8.6)], pref=[],
       want=['（教學館門口。她把一張摺好的便條放進你手裡。）', '（便條：「你可以。」）', '只有一句。', '一句就夠了。'], none=['三件都一樣。', '一，你可以。'], nothree=True,
       cflags=['SIS_NOTE_GRAD'], eqflags={'SIS_NOTE_GRAD': 'door'}),
  dict(id='S3_BARNOTE', minimal=True, key='2029-08-03', h=20.8, zone='campus', flags={'BAR_REG': True, 'Y4_PATH': 'bar', 'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1},
       js=SISF + " " + KX_L, steps=[('until', 21.4)], pref=[], wantMsg=['你可以。', '……只有一句？', '一句就夠了。'], noneMsg=['一，你可以。', '二，你可以。', '三，你可以。', '三件都一樣。'], nothree=True),
  # 7. 舊存檔的記憶名稱（第 27、48、49、50 列）＋CG 標題（第 41、54、55 列，【讀資料】）：手機「朋友」→ 學姊那一頁（最近五筆記憶）
  dict(id='S3_MEM', key='2027-10-20', h=20.0, zone='dorm', js=SISF + " for(const t of ['FAMILY_THREE_THINGS','SIS_ADV_PICK','SIS5_NOT_BUSY','SIS_REBUILD']) SOCIAL.remember('heroine_05',t,'');",
       steps=[('person', 'heroine_05')], pref=[], personHas=['家聚那晚她在群組說的話', '她看了你的志願表', '學姊說碩士生不閒', '她說：等她說好的那天'],
       personNone=['家族群組的三件事', '志願表的三件事', '學姊的第三件事', '她的三件事'],
       jsok=[('CG 標題 cg_three_things_heroine05', "ADV&&ADV.CG_REGISTRY?ADV.CG_REGISTRY.cg_three_things_heroine05.title:(typeof CG_REGISTRY!=='undefined'?CG_REGISTRY.cg_three_things_heroine05.title:null)", '沒有念的便條'),
             ('CG 標題 cg_airport_send_heroine05', "ADV&&ADV.CG_REGISTRY?ADV.CG_REGISTRY.cg_airport_send_heroine05.title:(typeof CG_REGISTRY!=='undefined'?CG_REGISTRY.cg_airport_send_heroine05.title:null)", '回到家，傳訊息給我。'),
             ('CG 標題 cg_last_dinner_heroine05', "ADV&&ADV.CG_REGISTRY?ADV.CG_REGISTRY.cg_last_dinner_heroine05.title:(typeof CG_REGISTRY!=='undefined'?CG_REGISTRY.cg_last_dinner_heroine05.title:null)", '謝謝你們這一學期。')]),
]
SCENS = SCENS + S3

# ---------------------------------------------------------------- BB-TEST-SIS-B6-1023（LAWWW-B 09:42；學姊第六批 AA_392 第 1～9 節，開發分支 4cf513b52／7b29d13dd；清單 docs/handoff/bb_checklists/BB_SIS_B6_1023.md）
# 每一段也查學姊不數件數（nothree）。交往中＝SIS_D（讀檔後 ROM.start；第 1 節另外把交往起點改成 7/29＝她出國前就交往）。
GF729 = SIS_D + " { const R=G.flags.romance&&G.flags.romance.heroine_05; if(R){ R.sinceDay=D('2028-07-29'); (R.history||[]).forEach(h=>{ if(h&&h.ev==='start') h.day=D('2028-07-29'); }); } }"
CANYON = SIS_D + " G.flags.SIS_GF_CANYON=D('2028-10-13'); G.flags.SIS_CANYON='went'; { const R=G.flags.romance&&G.flags.romance.heroine_05; if(R){ R.sinceDay=D('2028-10-13'); (R.history||[]).forEach(h=>{ if(h&&h.ev==='start') h.day=D('2028-10-13'); }); } }"
GFQ = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^y4_sa_g_/.test(q.id||'')).map(q=>CALENDAR.dateOf(q.day).key+' '+q.state+' set'+((q.sa||{}).gset)))()"
V1 = ['到這邊一個禮拜了。', '房間的書桌，比研究室那張還小。']; VNARR = '（視訊。她那邊是週六晚上。你們講到她那邊快十二點，她說要睡了，鏡頭又開了三分鐘才關。）'
V2 = '這邊上課，大家一直舉手。'; V3 = '這邊沒有中秋。'; V4 = '這邊五點就天黑了。'
HOOKDM = "(()=>{ const m=(GAME.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_hook_dm'); return m?m.ask.opts.map(o=>o.t):null; })()"
KEVBTN = "(GAME.G.msgs||[]).some(m=>m.ask&&(m.ask.opts||[]).some(o=>String(o.t||'').includes('我送妳')))"
AIRW = ['（八點半。她從客運站那邊走過來，戴著口罩，一個行李箱。）', '……你說你會來。', '回程喝。', '……回到家，傳訊息給我。']
M9C = ['（電話那頭有人在笑。研究室的人在幫她慶祝。）', '等一下。……好，我走到外面了。', '過了。委員問了兩個小時。', '……謝謝。他們買的蛋糕把我的名字寫錯了。明天中午你來，我給你看。']
M9K = '（蛋糕上寫著『溫書玉』。她用叉子把那個字刮掉了。）'
NOTE6 = '（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，總圖三樓。研究室我只放書。」）'
LIBL = ['（她坐在三樓靠窗那個位子。桌上沒有書，只有一個保溫瓶。）', '最後一天了。……坐。', '好。可以走了。']; LIBD = '（她在桌子底下碰了一下你的手，又縮回去。這裡是閱覽室。）'
DAD = ['（典禮結束，她身邊站著一個頭髮有一點白的男人。）', '我爸。', '……上次的飯沒吃到。畢業快樂。']; DADLATER = '我爸叫我跟你說：恭喜。'
B6 = [
  # 1. 第 1 節：交往中的每週視訊（臺灣路線、7/29 起交往）：8/13 V1、8/20 只有旁白、9/3 V2
  dict(id='B6_V', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + GF729, steps=[('until', 10.7), ('ffloop', '2028-08-20', 9.7), ('until', 10.7), ('ffloop', '2028-08-27', 9.7), ('until', 10.7), ('ffloop', '2028-09-03', 9.7), ('until', 10.7)],   # 8/27 也是旁白（SA_VD 第二組 9/3 起；BB-B 13:3x：原本 ffloop 停在 8/27 床邊的視訊選項就中斷、沒到 9/3）
       pref=['接起來：和書瑀視訊', '「給我看。」', '「那是好問題的意思嗎？」'], want=V1 + ['三本是今天借的。', VNARR, V2], once=V1 + ['三本是今天借的。', V2], none=['你在忙。下週。'], nothree=True, jsok=[('交往版視訊的排程（y4_sa_g_*）', GFQ, lambda x: isinstance(x, list) and len(x) >= 3)]),
  # 2. 第 1 節：沒接——8/13、8/20 都不接 →「你在忙。下週。」兩次；8/27 她不打「這週我先不打了。你有空打給我。」；9/3 照常排
  dict(id='B6_VMISS', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + GF729, steps=[('until', 11.2), ('ffloop', '2028-08-20', 9.7), ('until', 11.2), ('ffloop', '2028-08-27', 9.7), ('until', 11.2), ('ffloop', '2028-09-03', 9.7), ('until', 10.2)],   # 同 B6_V：每週先到 9:42 再等（ffloop 遇到床邊的視訊選項會中斷）；選項是「接起來／晚一點／不去了」（原本找「先不接」，按成接起來）
       pref=['不去了'], wantMsg=['你在忙。下週。', '這週我先不打了。你有空打給我。'], countMsg={'你在忙。下週。': 2}, none=V1, nothree=True,
       jsok=[('9/3 照常排視訊', GFQ, lambda x: isinstance(x, list) and any(e.startswith('2028-09-03') for e in x)), ('8/27 沒有排視訊', GFQ, lambda x: isinstance(x, list) and not any(e.startswith('2028-08-27') for e in x))]),
  # 3. 第 1 節：大峽谷才交往（10/13；[前置] 讀檔就是交往中＋SIS_GF_CANYON）——10/22 從 V1 開始；中秋那組（V3）不演：10/29 V2、11/5 V4
  dict(id='B6_VCANYON', key='2028-10-22', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + CANYON, steps=[('until', 10.7), ('ffloop', '2028-10-29', 9.7), ('until', 10.7), ('ffloop', '2028-11-05', 9.7), ('until', 10.7)],
       pref=['接起來：和書瑀視訊', '「給我看。」', '「那是好問題的意思嗎？」', '「我也是。」'], want=V1 + [V2, V4], none=[V3], nothree=True, jsok=[('視訊排程', GFQ, lambda x: isinstance(x, list))]),
  # 4. 第 2 節：送機（期末聚餐說了「那天我去送學姊。」＝HOOK_SIS_SENDOFF）：7/26 21:05 私訊＋選項；群組那則沒有 Kevin 的「我送妳。我有車。」
] + [dict(id='B6_SEND_' + k, key='2028-07-26', h=20.9, zone='dorm', flags=dict(TWF, HOOK_SIS_SENDOFF=True, **({'SAID_HAS_CAR': True} if car else {})), js=Y4 + (SIS_D if k == 'AIR_D' else SISF),
          asks={'y4_sis_hook_dm': t}, steps=[('until', 21.4)] + ([('ffloop', '2028-08-02', 7.0), ('until', 9.5, 900)] if k != 'CAR' else []),   # BB-B 15:0x：ffloop 到 8/2 07:16 床邊有「約好的時間：到機場送學姊」，原本再按快轉就跳過了（AIR_D 停到 8/6）→ 到 07:00 就停、照走等出發 pref=['出發：到機場送學姊', '出發：載學姊去機場'],
          wantMsg=['八月二號早上八點，我家樓下。', '你說要送我。'] + wm, want=w, none=nw, nothree=True,
          jsok=[('私訊的選項', HOOKDM, opts), ('群組沒有 Kevin 的「我送妳。我有車。」按鈕', KEVBTN, False)] + jk, cflags=['SIS_RIDE_ASK', 'SIS_SENDOFF'], eqflags=ef)
     for k, car, t, opts, wm, w, nw, jk, ef in [
       ('CAR', True, '我開車去載妳', ['我開車去載妳。', '我到機場等妳。', '那天我去不了了。'], [], [], [], [('排了 8/2 08:00「載學姊去機場」', "!!(typeof OUT!=='undefined'&&OUT.get(GAME.G,'y4_sis_airport'))", True)], {'SIS_RIDE_ASK': 'yes'}),
       ('AIR', False, '我到機場等妳', ['我到機場等妳。', '那天我去不了了。'], [], AIRW, ['到了先在群組說，再打給你。'], [], {'SIS_RIDE_ASK': 'airport', 'SIS_SENDOFF': 'airport'}),
       ('AIR_D', False, '我到機場等妳', ['我到機場等妳。', '那天我去不了了。'], [], AIRW + ['到了先在群組說，再打給你。'], [], [], {'SIS_RIDE_ASK': 'airport', 'SIS_SENDOFF': 'airport'}),
       ('NO', False, '那天我去不了了', ['我到機場等妳。', '那天我去不了了。'], ['說好的那個，沒關係。', '出發了。'], [], AIRW, [], {'SIS_RIDE_ASK': 'no', 'SIS_SENDOFF': 'bus'})]] + [
  # 5. 第 3 節：交往中、口試（2029-05-29 16:00）沒到——18:30 私訊；不按＝21:00「書瑀打電話來」；按「（打給她）」＝馬上打過去；接了 → 5/30 12:20 研究室的蛋糕
  dict(id='B6_DEF_WAIT', key='2029-05-29', h=15.0, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, steps=[('bedpick', '睡到傍晚'), ('bedpick', '小睡 2 小時'), ('until', 21.6, 1500), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 2 小時'), ('bedpick', '小睡 2 小時'), ('until', 13.2, 1200)],   # BB-B 15:0x：負載高時 ('until', 21.6) 從 15:00 只走到 15:37 就逾時 → 床上睡到傍晚、小睡縮短照走的時間
       pref=['接起來：書瑀打電話來', '「恭喜。」', '出發：研究室的蛋糕'], wantMsg=['過了。', '……你今天在忙？好。晚上打給我。'], want=M9C + [M9K], nothree=True,
       cflags=['SIS_DEFENSE', 'SIS_DEFENSE_CALL', 'SIS_DEFENSE_CAKE'], eqflags={'SIS_DEFENSE': 'missed', 'SIS_DEFENSE_CALL': True, 'SIS_DEFENSE_CAKE': 'went'}),
  dict(id='B6_DEF_CALL', key='2029-05-29', h=15.0, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, asks={'y4_m9_callme': '（打給她）'}, steps=[('bedpick', '睡到傍晚'), ('until', 19.6, 1500), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 2 小時'), ('bedpick', '小睡 2 小時'), ('until', 13.2, 1200)],
       pref=['打過去：打給書瑀', '「恭喜。」', '出發：研究室的蛋糕'], want=M9C + [M9K], nothree=True, cflags=['SIS_DEF_CALL_ME', 'SIS_DEFENSE_CALL', 'SIS_DEFENSE_CAKE'],
       eqflags={'SIS_DEF_CALL_ME': True, 'SIS_DEFENSE_CALL': True, 'SIS_DEFENSE_CAKE': 'went'}),
  # 6. 第 4 節：便條（交往中，大二上 9/21 21:00 私訊 → 9/22 12:20 研究室搬書）；對照：朋友版沒有這一行
  dict(id='B6_NOTE', key='2026-09-21', h=20.9, zone='dorm', js=SIS_D, asks={'sisy23_lab': '好'}, steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 2 小時'), ('bedpick', '小睡 2 小時'), ('until', 14.0, 1500)], pref=['出發：', '「照顏色排？」'],   # BB-B 15:0x：隔天中午有約，床邊沒有快轉（只有睡到明天早上／中午／再撐一下），ffloop 按了「再撐一下」就停
       want=[NOTE6, '……你的。'], nothree=True, cflags=['SIS_LAB_DESK'], eqflags={'SIS_LAB_DESK': 'went'}),
  dict(id='B6_NOTE_F', key='2026-09-21', h=20.9, zone='dorm', js=SISF, asks={'sisy23_lab': '好'}, steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('bedpick', '小睡 2 小時'), ('bedpick', '小睡 2 小時'), ('until', 14.0, 1500)], pref=['出發：', '「照顏色排？」'],   # BB-B 15:0x：隔天中午有約，床邊沒有快轉（只有睡到明天早上／中午／再撐一下），ffloop 按了「再撐一下」就停
       want=['靠門的位子。每個人進來都會撞到我。'], none=[NOTE6], nothree=True, cflags=['SIS_LAB_DESK'], eqflags={'SIS_LAB_DESK': 'went'}),
  # 7. 第 5 節：第一次訪談選「下次還要記嗎？」（10/15 21:00 → 10/16）＝SIS_IV_AGAIN；第二次：11/24 21:00 私訊 → 11/27 10:00 社區活動中心／不行＝13:00「記完了。」
  dict(id='B6_IV1', key='2027-10-15', h=20.9, zone='dorm', js=SISF, asks={'sisy23_iv_ask': '好'}, steps=[('until', 21.4), ('ffloop', '2027-10-16', 13.0)], pref=['出發：', '「下次還要記嗎？」'],
       want=['要。', '……你有空的話。'], nothree=True, cflags=['SIS_IV_AGAIN'], eqflags={'SIS_IV_AGAIN': True}),
  dict(id='B6_IV2_YES', key='2027-11-24', h=20.9, zone='dorm', flags={'SIS_IV_AGAIN': True, 'SIS_INTERVIEW': 'went'}, js=SISF, asks={'sisy23_iv2': '好'},
       steps=[('until', 21.4), ('ffloop', '2027-11-27', 13.5)], pref=['出發：陪學姊去第二次訪談', '「他太太那段。」'],
       wantMsg=['週六早上十點，有第二次訪談。這次是當事人。', '你說要記的。', '十點，社區活動中心。我傳地址給你。'],
       want=['（一個五十幾歲的男人，手上一直轉著一支原子筆。）', '他同意錄音。你一樣要記。', '……那段我不會寫進論文。', '今天的工資。'], nothree=True, cflags=['SIS_INTERVIEW2'], eqflags={'SIS_INTERVIEW2': 'went'}),
  dict(id='B6_IV2_NO', key='2027-11-24', h=20.9, zone='dorm', flags={'SIS_IV_AGAIN': True, 'SIS_INTERVIEW': 'went'}, js=SISF, asks={'sisy23_iv2': '那天不行'},
       steps=[('until', 21.4), ('ffloop', '2027-11-27', 13.5)], pref=[], wantMsg=['好。我自己記。', '記完了。'], none=['他同意錄音。你一樣要記。'], nothree=True),
  # 8. 第 6 節：荷花池（交往中、大二情人節植物園約過）：7/1 21:00 → 7/3 09:00；2 月有來／沒來，第一個選項不同
  dict(id='B6_LOTUS_W', key='2027-07-01', h=20.9, zone='dorm', flags={'SIS_VDAY_Y2': 'went'}, js=SIS_D, asks={'sisb4_lotus': '好'}, steps=[('until', 21.4), ('ffloop', '2027-07-03', 12.0)],
       pref=['出發：荷花池', '「妳說妳喜歡什麼都還沒長出來的時候。」'], wantMsg=['荷花開了。', '週六早上九點，植物園。早上開得比較好。'],
       want=['（整片都是葉子，花不多，開了幾朵。）', '二月的時候，這裡只有水。', '長出來也不錯。'], none=['「上次我沒來。」'], nothree=True, cflags=['SIS_LOTUS'], eqflags={'SIS_LOTUS': 'went'}),
  dict(id='B6_LOTUS_M', key='2027-07-01', h=20.9, zone='dorm', flags={'SIS_VDAY_Y2': 'missed'}, js=SIS_D, asks={'sisb4_lotus': '好'}, steps=[('until', 21.4), ('ffloop', '2027-07-03', 12.0)],
       pref=['出發：荷花池', '「上次我沒來。」'], want=['二月的時候，這裡只有水。', '所以這次是補的。……你遲到四個月。'], none=['「妳說妳喜歡什麼都還沒長出來的時候。」'], nothree=True, cflags=['SIS_LOTUS'], eqflags={'SIS_LOTUS': 'went'}),
  # 9. 第 7 節：7/30 21:00 家族群組提示；7/31（一）10:00～16:00 自己走進總圖三樓（[前置] 讀檔站在大廳二樓，走樓梯上去）；交往中多「桌子底下」那一行
  dict(id='B6_LIB_HINT', key='2028-07-30', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + SISF, steps=[('until', 21.4)], pref=[], wantMsg=['明天我在總圖三樓。最後一天。'], nothree=True),
  # BB-B 16:2x：ev_sis_lib_last 是 auto（她在 3F 才開始）——原本一進 3F 腳本就結束（89 秒），等到 11:00
  dict(id='B6_LIB_GO', key='2028-07-31', h=10.5, zone='library_hall', gset={'pos': LIB2F}, flags=dict(TWF), js=Y4 + SISF, steps=[('use', '^樓梯間：往 3F'), ('until', 11.0, 400)], pref=[],
       want=LIBL, none=[LIBD], nothree=True, cflags=['SIS_LIB_LAST'], eqflags={'SIS_LIB_LAST': True}),
  dict(id='B6_LIB_GO_D', key='2028-07-31', h=10.5, zone='library_hall', gset={'pos': LIB2F}, flags=dict(TWF), js=Y4 + GF729, steps=[('use', '^樓梯間：往 3F'), ('until', 11.0, 400)], pref=[],
       want=LIBL + [LIBD], nothree=True, cflags=['SIS_LIB_LAST'], eqflags={'SIS_LIB_LAST': True}),
  # 10. 第 8 節：交往中、3/17 她爸爸的晚餐沒吃到（SIS_FATHER_ASKED 有值、沒有 MET_SIS_FATHER）——6/2 畢業典禮拍照，保溫瓶那一段前面是她爸爸；後面沒有轉述那一句。對照：見過她爸爸＝有轉述、沒有這一段
  dict(id='B6_DAD', minimal=True, pregrad=True, key='2029-06-02', h=7.3, zone='dorm', flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'SIS_FATHER_ASKED': 'missed'},
       js=GF729 + " delete G.flags.MET_SIS_FATHER;", steps=[('until', 14.0)], pref=['「伯父好。」'], want=DAD + ['（她還穿著碩士服，手上拿著一個新的保溫瓶。）'], none=[DADLATER], nothree=True,
       cflags=['MET_SIS_FATHER'], eqflags={'MET_SIS_FATHER': 'grad'}),
  dict(id='B6_DAD_MET', minimal=True, pregrad=True, key='2029-06-02', h=7.3, zone='dorm', flags={'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'SIS_FATHER_ASKED': 'went', 'MET_SIS_FATHER': True},
       js=GF729, steps=[('until', 14.0)], pref=[], want=['（她還穿著碩士服，手上拿著一個新的保溫瓶。）', DADLATER], none=[DAD[2]], nothree=True),
]
SCENS = SCENS + B6

# ---------------------------------------------------------------- 同一份清單第 11～14 項：學姊第七批（AA_393，日本路線，ea8a653a4）、第 15～17 項：第八批（AA_394，大二整年，a49bc0ed0）——LAWWW-B 09:56
# 日本路線：3/25 出發、8/5 回來；人在日本時遊戲時鐘＝臺灣 +1（STORY.tzOffset）。在日本的情境＝JP_DEPARTED 有、JP_RETURNED 空的（MX 那次的教訓）。
JPF7 = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'AN_SENDOFF': 'together'}
JPPRE = "G.flags.X1_JP=D('2028-02-20');"
JPIN = "G.flags.X1_JP=D('2028-02-20'); G.flags.JP_DEPARTED=D('2028-03-25'); G.flags.JP_RETURNED=null;"
JPV = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^sisjp_/.test(q.id||'')).map(q=>q.id+' '+CALENDAR.dateOf(q.day).key+' '+(+q.h).toFixed(2)+' '+q.state))()"
B78 = [
  # 11. 第 1 節：3/22 21:00 提示；3/23（四）19:30～21:30 在 Café 找她說話＝便條（交往中便條不同＋圍巾那一行）；不去＝3/24 09:00 照片
  dict(id='B7_HINT', key='2028-03-22', h=20.9, zone='dorm', flags=JPF7, js=JPPRE + SISF, steps=[('until', 21.4)], pref=[], wantMsg=['明天晚上我在 Café。你後天走，對吧。'], nothree=True),
  dict(id='B7_NOTE', key='2028-03-23', h=19.6, zone='cafe', flags=JPF7, js=JPPRE + SISF, steps=[('talk', 'heroine_05')], pref=['「寫不完呢？」'],
       want=['明天是以安的餞行，我知道。所以今天。', '（便條只有一句：「那邊三月還冷。外套不要收進行李箱最下面。」）', '寫不完你會知道，因為我不會拍。', '走吧。我也要回去了。'],
       none=['外套我放了一件在你背包裡，不要問。', '（走到路口，她把你的圍巾拉好，才轉身走。）'], nothree=True, cflags=['SIS_JP_NOTE'], eqflags={'SIS_JP_NOTE': True}),
  dict(id='B7_NOTE_D', key='2028-03-23', h=19.6, zone='cafe', flags=JPF7, js=JPPRE + SIS_D, steps=[('talk', 'heroine_05')], pref=['「妳也要照顧自己。」'],
       want=['（便條只有一句：「那邊三月還冷。外套我放了一件在你背包裡，不要問。」）', '我在臺灣。……要照顧自己的是你。', '（走到路口，她把你的圍巾拉好，才轉身走。）'],
       none=['（便條只有一句：「那邊三月還冷。外套不要收進行李箱最下面。」）'], nothree=True, cflags=['SIS_JP_NOTE', 'SIS_JP_NOTE_GF'], eqflags={'SIS_JP_NOTE': True, 'SIS_JP_NOTE_GF': True}),
  dict(id='B7_PHOTO', key='2028-03-24', h=8.8, zone='dorm', flags=JPF7, js=JPPRE + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['📷（一張手寫的便條：那邊三月還冷。外套不要收進行李箱最下面。）', '昨天沒遇到。照片也算。'], nothree=True, cflags=['SIS_JP_NOTE'], eqflags={'SIS_JP_NOTE': 'photo'}),
  # 12. 第 2 節：人在日本，臺灣週一 20:00（日本 21:00）兩週一則：4/3 熱水壺、4/17 第四章
  dict(id='B7_MSGS', key='2028-04-03', h=20.8, zone='jp_room', flags=JPF7, js=JPIN + SISF, steps=[('until', 21.4), ('ffloop', '2028-04-17', 21.4)], pref=[],
       wantMsg=['（照片：Café 的熱水壺）', '換新的了。按一次就出水。', '（照片：電腦螢幕，論文第四章，第 38 頁）', '第四章。……說好拍給你看。'],
       countMsg={'換新的了。按一次就出水。': 1}, nothree=True, cflags=['SIS_JP_MSG']),
  # 13. 第 3 節：7/31 臺灣 21:00（日本 22:00）約 → 8/1 日本 22:00 視訊；「可能在外面」＝文字版；不接＝「明天早上的飛機。十二月見。」
] + [dict(id='B7_EVE_' + k, key='2028-07-31', h=21.8, zone='jp_room', flags=JPF7, js=JPIN + (SIS_D if k == 'D' else SISF), asks={'sisjp_eve_ask': t},
          steps=[('until', 22.4), ('ffloop', '2028-08-01', 22.7)], pref=p, wantMsg=['明天晚上九點，視訊。你那邊十點。'] + wm, want=w, none=nw, nothree=True, cflags=['SIS_JP_EVE'], eqflags={'SIS_JP_EVE': ef},
          jsok=[('出遊紀錄（sisjp_*）', JPV, lambda x: isinstance(x, list))])
     for k, t, p, wm, w, nw, ef in [
       ('YES', '好', ['接起來：學姊打視訊來', '「十二月見。」'], [], ['明天早上的飛機。', '你五號回來，我二號走。錯開三天。', '十二月二十三號。……到時候群組會說。'], ['……我算過了。晚一個禮拜走，就碰得到。', '「我知道。」'], 'video'),
       ('D', '好', ['接起來：書瑀打視訊來', '「我知道。」'], [], ['……我算過了。晚一個禮拜走，就碰得到。', '可是論文的時間是排好的。我不想改。', '嗯。……謝謝你知道。'], [], 'video'),
       ('TEXT', '我那天可能在外面', [], ['好。那我傳訊息。', '好。我要去把第三箱收完。', '📷（行李箱，上面放著那件外套）'], [], ['你五號回來，我二號走。錯開三天。'], 'text'),
       ('MISS', '好', ['先不接', '照樣'], ['明天早上的飛機。十二月見。'], [], ['你五號回來，我二號走。錯開三天。'], 'missed')]] + [   # BB-B 10-24 04:0x（b7br4）：日本據點沒有「先不接」，選「睡覺」會先問「會錯過：22:00 學姊打視訊來。照樣／先不要」，原本退到「先不要」一直繞；這個情境要錯過＝選「照樣」
  # 14. 第 4、5 節：人在日本時傳「晚安」＝日本版（只出一次）；交往中 4/9 臺灣 21:00（日本 22:00）第一組視訊
  dict(id='B7_REPLY', key='2028-04-12', h=0.4, zone='jp_room', flags=JPF7, js=JPIN + SISF, steps=[('sendchat', 'heroine_05', 'night'), ('until', 1.4)], pref=[],
       replyHas={'heroine_05': '晚安。你那邊已經過十二點了，快睡。'}, nothree=True),
  dict(id='B7_REPLY_D', key='2028-04-12', h=0.4, zone='jp_room', flags=JPF7, js=JPIN + SIS_D, steps=[('sendchat', 'heroine_05', 'night'), ('until', 1.4)], pref=[],
       replyHas={'heroine_05': '晚安。你那邊比較早天亮，窗簾記得拉。'}, nothree=True),
  dict(id='B7_JPV', key='2028-04-09', h=21.8, zone='jp_room', flags=JPF7, js=JPIN + SIS_D, steps=[('until', 22.7)], pref=['接起來：和書瑀視訊', '「剛整理過。」'],
       want=['你房間給我看。', '……比你宿舍乾淨。', '為了視訊整理的。我看得出來。'], nothree=True, jsok=[('出遊紀錄（sisjp_*）', JPV, lambda x: isinstance(x, list) and any(e.startswith('sisjp_v_0') for e in x))]),
  # 15. 第八批第 1 節＋2-2＋第 4 節：有約的三場（熟悉以上）
  dict(id='B8_COURSE', key='2026-08-12', h=20.9, zone='dorm', js=SISF, asks={'sisb8_course_ask': '好'}, steps=[('until', 21.4), ('ffloop', '2026-08-14', 16.5)], pref=['出發：兩點半 Café（學姊幫你看課表）', '「妳大二修了什麼？」'],
       wantMsg=['選課系統下禮拜開。', '週五下午三點，Café。課表帶來，我幫你看。'], want=['（她把你的課表印出來，用紅筆在上面畫。）', '債總選周老師那班。他會點人，你會被逼著想。', '剩下的你自己決定。我只看我看得出來的。'],
       nothree=True, cflags=['SIS_COURSE_Y2'], eqflags={'SIS_COURSE_Y2': True}),
  dict(id='B8_COURSE_NO', key='2026-08-12', h=20.9, zone='dorm', js=SISF, asks={'sisb8_course_ask': '那天不行'}, steps=[('until', 21.4), ('ffloop', '2026-08-14', 20.5)], pref=[],
       wantMsg=['好。截圖傳給我。', '債總選周老師那班。他會點人，你會被逼著想。'], none=['（她把你的課表印出來，用紅筆在上面畫。）'], nothree=True),
  dict(id='B8_LUNCH', key='2026-11-04', h=20.9, zone='dorm', js=SISF, asks={'sisb8_lunch_ask': '好'}, steps=[('until', 21.4), ('ffloop', '2026-11-06', 13.6)], pref=['出發：直屬的午餐', '「債總。」'],
       wantMsg=['週五中午有空嗎。直屬要請一次飯。', '系上的規矩，不是我想的。……也有一點是我想的。'],
       want=['（她夾菜很快，三樣青菜、一塊魚，排隊的時候已經算好價錢。）', '大二到現在，哪一科最難？', '下次你當直屬的時候，記得也要請。'], none=['……下次你請。'],
       nothree=True, cflags=['SIS_LUNCH_Y2'], eqflags={'SIS_LUNCH_Y2': True}),
  dict(id='B8_LUNCH_NO', key='2026-11-04', h=20.9, zone='dorm', js=SISF, asks={'sisb8_lunch_ask': '那天不行'}, steps=[('until', 21.4)], pref=[], wantMsg=['好。下次。'], nothree=True),
  dict(id='B8_CH1', key='2027-07-20', h=20.9, zone='dorm', js=SISF, asks={'sisb8_ch1_ask': '我看得懂嗎'}, steps=[('until', 21.4), ('ffloop', '2027-07-22', 17.0)], pref=['出發：研究室（幫學姊讀論文第一章）', '「第二頁那段，我讀了三次。」'],
       wantMsg=['論文第一章寫完了。', '看不懂的地方，就是我要改的地方。'], want=['看不懂的地方畫線。不要客氣。', '……那段我也寫了三次。'], nothree=True, cflags=['SIS_CH1_READ'], eqflags={'SIS_CH1_READ': 'went'}),
  dict(id='B8_CH1_NO', key='2027-07-20', h=20.9, zone='dorm', js=SISF, asks={'sisb8_ch1_ask': '那天不行'}, steps=[('until', 21.4), ('ffloop', '2027-07-25', 21.5)], pref=[],
       wantMsg=['好。我寄給你，看不懂的劃起來。', '收到了。你劃的三個地方，我改了兩個。'], nothree=True, cflags=['SIS_CH1_READ'], eqflags={'SIS_CH1_READ': 'mail'}),
  # 16. 第八批：週三晚上在法圖找她說話先演（同一天只演一場；演完照常閒聊）
] + [dict(id='B8_LAW_' + k, key=d, h=h, zone='lawlib', js=SISF + js, steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=pf, want=w, nothree=True, cflags=[f], eqflags={f: v})
     for k, d, h, js, pf, w, f, v in [
       ('1014', '2026-10-14', 19.6, '', ['「為什麼要看前後兩審？」'], ['你們刑分的報告要找判決吧。……坐。', '一份判決只是結果。前後放在一起，才看得出來誰在哪裡改變了想法。'], 'SIS_DB_TAUGHT', True),
       ('1209', '2026-12-09', 19.6, " G.events.done.ev_sis_adv_exch=1; G.events.last=G.events.last||{}; G.events.last.ev_sis_adv_exch=D('2026-12-01');", ['「右邊。」'],
        ['你幫我看一下。不是看對錯，對錯我看。', '嗯。右邊寫得比較像在跟人講話。', '謝謝。……這不算洩題，你們大二早就考過了。'], 'SIS_TA_PAPERS', True),
       ('0407', '2027-04-07', 19.6, '', ['「考完還妳。」'], ['我大二債各的筆記。字很醜。', '不用還。……傳給你下一個直屬。'], 'SIS_OLD_NOTES', True),
       ('0526', '2027-05-26', 21.6, '', ['（拿她的保溫瓶去飲水機裝熱水）'], ['（她趴在桌上。保溫瓶倒在旁邊，空的。）', '……熱水。'], 'SIS_HOT_WATER_BACK', 'water')]] + [
  # 17. 那張圖的兩種（2027-03-10 週三）：念完經濟系那一年（ECON_PAST_SHARED full）有「講給她聽」；法律系開局（沒有 Y0_LEFT）只有「我也忘得差不多了。」；教了以後隔天在 Café 找她＝熱拿鐵
  dict(id='B8_GRAPH_ECON', key='2027-03-10', h=19.6, zone='lawlib', js=SISF + " G.flags.ECON_PAST_SHARED='full';", steps=[('talk', 'heroine_05')], pref=['（講給她聽'],
       want=['你念過經濟。這張圖，我看了二十分鐘。', '好。我懂了。……我欠你一杯咖啡。'], nothree=True, cflags=['SIS_ECON_GRAPH'], eqflags={'SIS_ECON_GRAPH': 'taught'}),
  dict(id='B8_GRAPH_LAW', key='2027-03-10', h=19.6, zone='lawlib', js=SISF + " delete G.flags.Y0_LEFT; delete G.flags.ECON_PAST_SHARED;", steps=[('talk', 'heroine_05')], pref=['（講給她聽'],
       want=['你念過經濟。這張圖，我看了二十分鐘。', '那一起看。'], none=['（講給她聽：橫軸是什麼、曲線往哪裡移）'], nothree=True, cflags=['SIS_ECON_GRAPH'], eqflags={'SIS_ECON_GRAPH': 'together'}),
  dict(id='B8_LATTE', key='2027-03-11', h=19.6, zone='cafe', js=SISF + " G.flags.SIS_ECON_GRAPH='taught'; G.events.done.ev_sis_econ_graph=1; G.events.last=G.events.last||{}; G.events.last.ev_sis_econ_graph=D('2027-03-10');",
       steps=[('talk', 'heroine_05')], pref=[], want=['（桌上多一杯熱拿鐵。她說：『上次的。』）'], nothree=True, cflags=['SIS_ECON_LATTE'], eqflags={'SIS_ECON_LATTE': True}),
]
SCENS = SCENS + B78

# ---------------------------------------------------------------- 同一份清單第 18～21 項：學姊第九批（AA_395，c0ea66350）、第 22～25 項：第十批（AA_396，2c4b4bf92）、第 26 項：家族聖誕（AA_406，9dcbb19d6）——LAWWW-B 10:12、10:16
# 台詞照遊戲 5c105df8a 的字（src/data/sis_b9_events.js、sis_b10_events.js、src/family_xmas3d.js）；每一段也查學姊不數件數（nothree）。
TW3 = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
USP = dict(B['USF_PRE'])   # 美國路線、還沒出發（8/2 走）
SISC = SISB + " LV('heroine_05',65,50,45); SOCIAL.rel('heroine_05').npcRom=0; SOCIAL.rel('heroine_05').rom=0;"   # 好朋友、她的戀愛低（第 4 階＝她在美國時 T2）
SIS5 = SISB + " LV('heroine_05',45,30,25); SOCIAL.rel('heroine_05').npcRom=43; SOCIAL.rel('heroine_05').rom=10; DATE.log(G,'heroine_05').count=2;"   # 「乙」：第 5 階、她的戀愛 43、約會 2 次（BB_221）
def EXJS(day): return SIS_D + (" ROM.end(G,'heroine_05','apart_talk'); { const R=ROM.get(G,'heroine_05'), h=((R&&R.history)||[]).filter(x=>x.ev==='end'); if(h.length) h[h.length-1].day=D('%s'); }" % day)
FAMJ = " PHONE.join(G,'family_law','法律系直屬家族');"
ROOMX = "(t=>{ const L=[]; for(const f of (STORY.ROOM_EXTRA||[])){ try{ f(GAME.G,L); }catch(e){} } return L.map(x=>x[0]).filter(x=>x.includes(t)); })(%s)"
ASKOPT = "(id=>{ const m=(GAME.G.msgs||[]).find(m=>m.ask&&m.ask.id===id); return m?m.ask.opts.map(o=>o.t):null; })(%s)"
SHORTQ = "(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^y4_sa_[sv]_/.test(q.id||'')).map(q=>q.id+' '+CALENDAR.dateOf(q.day).key+' '+q.state))()"
HERLAST = "(window.__LOG||[]).filter(x=>/學姊|書瑀/.test(x.n||'')&&String(x.t).includes('最後')).map(x=>x.t)"
RAIN0 = ['（雨下得很大。她站在屋簷下，看著手機上的天氣。）', '……計畫本上有寫「帶傘」。', '寫在下禮拜那一頁。']
RAIN_GF = ['（她看到你，沒有說話，直接走到你的傘下面。）', '（傘不大。她勾著你的手臂。）']; RAIN_FR = '（傘不大。她走在靠馬路那一邊，你把傘往她那邊偏。）'
BOOK0 = ['（她的桌上沒有筆電。只有兩本書，並排放著。）', '（一本是很舊的刑事訴訟法，書背用膠帶補過。一本是小說，書籤夾在快一半的地方。）', '行李只放得下一本。', '你幫我選。']
BOOK_GF = '另外一本，放你那邊。……回來跟你拿。'; BOOK_FR = '另外一本，回來再看。'
MAPLE0 = ['（門口的信箱裡有一個信封，寄件地址是英文的。）', '（信封裡沒有信。只有一片壓乾的楓葉，護貝過，剪成書籤的形狀。）']
MAPLE_F = '（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——溫書瑀」）'; MAPLE_C = '（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——書瑀」）'
CANYON_INV = ['十月有一個禮拜的秋假。我想開車去大峽谷。', '……一個人開太遠。你要不要來？']
B9 = [
  # 18. 1-1 雨天：大三下 4/24（一）～5/5（五）下雨的平日 16:50～17:20 在總圖門口或總圖大廳（[前置] 讀檔站在總圖大廳、天氣設成下雨）
  dict(id='B9_RAIN_SHARE', key='2028-04-24', h=16.7, zone='library_hall', gset={'weather': 'rain'}, flags=dict(TW3), js=SISF, steps=[('until', 17.4)], pref=['「一起撐吧。」', '「今天那頁寫什麼？」'],
       want=RAIN0 + [RAIN_FR, '你肩膀濕了。', '十七點，回家。', '……寫得很清楚。是我沒看。', '謝謝。……下次我會看今天。'], none=RAIN_GF, nothree=True, cflags=['SIS_Y3S2_RAIN'], eqflags={'SIS_Y3S2_RAIN': 'share'}),
  dict(id='B9_RAIN_BUY', key='2028-04-24', h=16.7, zone='library_hall', gset={'weather': 'rain'}, flags=dict(TW3), js=SISF, steps=[('until', 17.4)], pref=['「我去便利商店買一把。」'],
       want=RAIN0 + ['……好。錢我給你。', '下次換我帶兩把。', '八月以後，那邊也會下雨吧。', '……我會記得帶。'], none=[RAIN_FR], nothree=True, cflags=['SIS_Y3S2_RAIN'], eqflags={'SIS_Y3S2_RAIN': 'buy'}),
  dict(id='B9_RAIN_D', key='2028-04-24', h=16.7, zone='library_hall', gset={'weather': 'rain'}, flags=dict(TW3), js=SIS_D, steps=[('until', 17.4)], pref=['「一起撐吧。」', '（不說話，走慢一點）'],
       want=RAIN_GF + RAIN0[1:] + ['（你們走到捷運站，誰都沒有說話。她把濕掉的那一角袖子捲起來。）'], none=[RAIN_FR], nothree=True, cflags=['SIS_Y3S2_RAIN'], eqflags={'SIS_Y3S2_RAIN': 'share'}),
  # 兩週都沒下雨：5/3（三）12:00 起改成雨天（[前置] 讀檔天氣晴、站在總圖大廳，時間照走到 17:00）
  dict(id='B9_RAIN_FORCE', key='2028-05-03', h=11.8, zone='library_hall', gset={'weather': 'clear'}, flags=dict(TW3), js=SISF, steps=[('until', 12.4), ('until', 17.4)], pref=['「一起撐吧。」'],
       want=RAIN0, nothree=True, cflags=['SIS_Y3S2_RAIN', 'SIS_RAIN_FORCED', 'SIS_RAIN_SEEN'], eqflags={'SIS_Y3S2_RAIN': 'share'}, jsok=[('12:00 以後的天氣（記錄）', "GAME.G.weather", lambda x: True)]),
  # 撐過傘的「傘帶了。」：臺灣路線 7/31 22:00、美國路線 8/1 22:00；沒撐過的沒有
  dict(id='B9_UMB', key='2028-07-31', h=21.8, zone='dorm', flags=dict(TWF, SIS_Y3S2_RAIN='share'), js=Y4 + SISF, steps=[('until', 22.4)], pref=[], wantMsg=['傘帶了。'], msgAt={'傘帶了。': ('2028-07-31', 22.0, 0.1)}, nothree=True),
  dict(id='B9_UMB_US', key='2028-08-01', h=21.8, zone='dorm', flags=dict(USP, SIS_Y3S2_RAIN='buy'), js=Y4 + SISF, steps=[('until', 22.4)], pref=[], wantMsg=['傘帶了。'], msgAt={'傘帶了。': ('2028-08-01', 22.0, 0.1)}, nothree=True),
  dict(id='B9_UMB_NO', key='2028-07-31', h=21.8, zone='dorm', flags=dict(TWF), js=Y4 + SISF, steps=[('until', 22.4)], pref=[], noneMsg=['傘帶了。'], nothree=True),
  # 19. 1-2 帶哪一本：5/18（四）19:30 以後在 Café 找她說話（說話前接演）；1-3 三種的訊息
  dict(id='B9_BOOK_LAW', key='2028-05-18', h=19.6, zone='cafe', flags=dict(TW3), js=SISF, steps=[('talk', 'heroine_05')], pref=['「刑訴。」'],
       want=BOOK0 + ['……這是我大一的課本。', '（她翻開一頁給你看。邊邊寫滿了問號。）', '好。帶這本。到了那邊，問號多的時候可以看。', BOOK_FR], none=[BOOK_GF], nothree=True, cflags=['SIS_BOOK'], eqflags={'SIS_BOOK': 'law'}),
  dict(id='B9_BOOK_NOV_D', key='2028-05-18', h=19.6, zone='cafe', flags=dict(TW3), js=SIS_D, steps=[('talk', 'heroine_05')], pref=['「小說。」'],
       want=BOOK0 + ['這本我高中就開始看。一直沒看完。', '好。帶這本。在那邊看完。', BOOK_GF], none=[BOOK_FR], nothree=True, cflags=['SIS_BOOK'], eqflags={'SIS_BOOK': 'novel'}),
  dict(id='B9_BOOK_BOTH', key='2028-05-18', h=19.6, zone='cafe', flags=dict(TW3), js=SISF, steps=[('talk', 'heroine_05')], pref=['「兩本都帶。'],
       want=BOOK0 + ['寄到美國很貴。', '……你真的會寄？', BOOK_FR], nothree=True, cflags=['SIS_BOOK'], eqflags={'SIS_BOOK': 'both'}),
  # 美國路線只有兩個選項（偏好先選「兩本都帶」，沒有就「小說」）
  dict(id='B9_BOOK_US', key='2028-05-18', h=19.6, zone='cafe', flags=dict(USP), js=SISF, steps=[('talk', 'heroine_05')], pref=['「兩本都帶。', '「小說。」'],
       want=BOOK0, nothree=True, cflags=['SIS_BOOK'], eqflags={'SIS_BOOK': 'novel'}),
  # 那天已經演過她別的說話前接演（[前置] 1-4 記成今天演過）＝5/18 不演；[捷徑] 日子撥到 5/25 再找她一次＝演
  dict(id='B9_BOOK_525', key='2028-05-18', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + " G.events.done.ev_sis_adv_y4=1; G.events.last=G.events.last||{}; G.events.last.ev_sis_adv_y4=G.day;",
       steps=[('talk', 'heroine_05'), ('stopchk_book',), ('addday', 7), ('talk', 'heroine_05')], pref=['「刑訴。」'], want=BOOK0, nothree=True, cflags=['SIS_BOOK'], eqflags={'SIS_BOOK': 'law'}),
  # 兩本都帶：8/14（一）21:00 手機提醒 → 按「去公館郵局寄」→ 出發 → 扣 900 元；9/4 照片
  dict(id='B9_MAIL', key='2028-08-14', h=20.9, zone='dorm', flags=dict(TWF, SIS_BOOK='both'), js=Y4 + SISF, asks={'sisb9_book_remind': '去公館郵局寄'}, steps=[('until', 21.9)], pref=['出發：寄書給學姊'],
       wantMsg=['要寄給學姊的書'], dmoney=-900, cflags=['SIS_BOOK_GO', 'SIS_BOOK_SENT'], eqflags={'SIS_BOOK_SENT': True}),
  dict(id='B9_BOOK_SENT', key='2028-09-04', h=8.9, zone='dorm', flags=dict(TWF, SIS_BOOK='both', SIS_BOOK_SENT=True), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['（照片：拆開的包裹，書上面放著一張你寫的紙條）', '到了。……紙條比書先看。'], noneMsg=['書的事不用了。這邊的圖書館有。'], nothree=True),
  dict(id='B9_BOOK_NOTSENT', key='2028-09-04', h=8.9, zone='dorm', flags=dict(TWF, SIS_BOOK='both'), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['書的事不用了。這邊的圖書館有。'], noneMsg=['到了。……紙條比書先看。'], nothree=True),
  dict(id='B9_BOOK_LAWMSG', key='2028-09-18', h=8.9, zone='dorm', flags=dict(TWF, SIS_BOOK='law'), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['（照片：那本刑訴，翻開在某一頁，旁邊一杯咖啡）', '今天問號很多。看了一頁我大一寫的。……我那時候比現在敢問。'], nothree=True),
  dict(id='B9_BOOK_NOVMSG', key='2028-11-20', h=8.9, zone='dorm', flags=dict(TWF, SIS_BOOK='novel'), js=Y4 + SISF, steps=[('until', 9.4)], pref=[],
       wantMsg=['（照片：小說，最後一頁）', '看完了。結局我高中就猜到了。……還是看完了。'], nothree=True),
  # 20. 2-1 短視訊：臺灣路線、她在美國、T2（好朋友、她的戀愛低）——8/13、8/27、9/10 週日 10:00 三組；不接＝10:20「你在忙。下次。」
  dict(id='B9_SHORT', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + SISC, steps=[('until', 10.6), ('ffloop', '2028-08-27', 10.6), ('ffloop', '2028-09-10', 10.6)],
       pref=['接起來：和學姊視訊（十分鐘）', '「十二分鐘要聊什麼？」', '「好。妳走慢一點。」', '「（說這禮拜的課）」'],
       want=['（她背後是一排洗衣機，有一台在轉。）', '洗衣機還有十二分鐘。', '好了。……下次也挑洗衣服的時候。', '（畫面一直在晃。她在走路，背後是很少的路燈。）', '剛從圖書館出來。這條路燈很少。',
             '我走很快的時候，是因為冷。', '（打字）這邊不能講話。', '（你講了十分鐘。她一直在點頭，中間打了一行：「這個老師我知道。」）', '（打字）十分鐘到了。……謝謝你沒掛。'],
       nothree=True, jsok=[('她在美國時的段（SIS_ABROAD_TIER）＝2', "GAME.G.flags.SIS_ABROAD_TIER", 2), ('短視訊排程（y4_sa_s_）', SHORTQ, lambda x: isinstance(x, list) and sum(1 for e in x if e.startswith('y4_sa_s_')) >= 3)]),
  dict(id='B9_SHORT_MISS', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + SISC, steps=[('until', 10.8)], pref=['先不接', '今天先不要', '不去了'],
       wantMsg=['你在忙。下次。'], msgAt={'你在忙。下次。': ('2028-08-13', 10.33, 0.1)}, none=['洗衣機還有十二分鐘。'], nothree=True),
  # 21. 2-2 楓葉書籤：10/26（四）18:00 以後在自己的房間（朋友＝署名「溫書瑀」、很熟＝「書瑀」）；演完可以傳她一則；房間多一件
  dict(id='B9_MAPLE', key='2028-10-26', h=17.9, zone='dorm', flags=dict(TWF), js=Y4 + SISF, steps=[('until', 18.4), ('until', 23.8)], pref=['傳給她：「書籤收到了。」'],
       want=MAPLE0 + [MAPLE_F], none=[MAPLE_C], wantMsg=['書籤收到了。', '十天。比我想的快。'], nothree=True, cflags=['SIS_MAPLE', 'SIS_MAPLE_MSG'], eqflags={'SIS_MAPLE': True, 'SIS_MAPLE_MSG': 'got'},
       jsok=[('房間多一件「學姊寄來的楓葉書籤」', ROOMX % json.dumps('楓葉'), ['學姊寄來的楓葉書籤'])]),
  dict(id='B9_MAPLE_C', key='2028-10-26', h=17.9, zone='dorm', flags=dict(TWF), js=Y4 + SISC, steps=[('until', 18.4), ('until', 23.8)], pref=['傳給她：「妳那邊冷了嗎？」'],
       want=MAPLE0 + [MAPLE_C], none=[MAPLE_F], wantMsg=['妳那邊冷了嗎？', '早上有霜了。我買了一件很厚的外套。……很醜。'], nothree=True, cflags=['SIS_MAPLE_MSG'], eqflags={'SIS_MAPLE_MSG': 'cold'}),
  # 12/23 接機車上：有書籤、傳過「書籤收到了。」才有「書籤，你有用嗎。」
  dict(id='B9_MAPLE_PICK', key='2028-12-23', h=19.6, zone='dorm', flags=dict(TWF, SIS_PICKUP_V='family', SIS_MAPLE=True, SIS_MAPLE_MSG='got'), js=Y4 + SISF, steps=[('until', 23.5)],
       pref=['出發：接機', '「捨不得用。」', '「先回家睡覺。」'], want=['書籤，你有用嗎。', '……用啊。不然寄它幹嘛。'], nothree=True),
  dict(id='B9_MAPLE_PICK_NO', key='2028-12-23', h=19.6, zone='dorm', flags=dict(TWF, SIS_PICKUP_V='family', SIS_MAPLE=True, SIS_MAPLE_MSG='cold'), js=Y4 + SISF, steps=[('until', 23.5)],
       pref=['出發：接機', '「先回家睡覺。」'], want=['美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。'], none=['書籤，你有用嗎。'], nothree=True),
  # 2-3 大峽谷（乙）：臺灣路線、朋友以後每兩週約她一次的狀態（8/6 第 5 階、她的戀愛 43、約會 2 次）；8/6～9/30 每週日 10:00 視訊都接 → 9/30 以前最後一次視訊約大峽谷
  dict(id='B9_CANYON_B', key='2028-08-06', h=7.9, zone='dorm', flags=dict(TWF), js=Y4 + SIS5,
       steps=[('until', 10.7), ('ffloop', '2028-08-27', 10.7), ('ffloop', '2028-09-10', 10.7), ('ffloop', '2028-09-24', 10.9)], pref=['接起來：和學姊視訊', '「我去。」'],
       want=CANYON_INV + ['好。我去機場接你。'], nothree=True, cflags=['SIS_CANYON_ASK'], eqflags={'SIS_CANYON_ASK': 'go'},
       jsok=[('她在美國時的段＝3（T3 視訊）', "GAME.G.flags.SIS_ABROAD_TIER", 3), ('9 月接過的 T3 視訊（sisSepVideos）≥ 2', "R2Y4B.sisSepVideos(GAME.G)", lambda x: isinstance(x, int) and x >= 2),
             ('視訊排程（記錄）', SHORTQ, lambda x: True), ('第幾階（DATE.stageNum）≥ 5', "DATE.stageNum('heroine_05')", lambda x: isinstance(x, int) and x >= 5)]),
]
SCENS = SCENS + B9
NYE2 = ['（湖邊沒有幾個人。遠遠的，聽得到椰林大道那邊有人在倒數。）', '我每年這時候都在家，寫明年的計畫本。', '今年寫到一半就出來了。']
NYE3 = ['（總圖的燈已經關了，只剩門口那兩盞。她穿著很厚的外套，手上拿著一杯便利商店的熱飲。）', '讀書計畫寫完了。英文的。', '寫到最後一段，要寫為什麼想去。……那段寫了很久。']
NYE4 = ['（她穿著睡衣，外面套了一件很厚的外套。）', '我十點就睡著了。鬧鐘設十一點半。', '……時差沒有調好。']
ROOFQ = "(y=>!!(typeof OUT!=='undefined'&&OUT.get(GAME.G,'nye_y'+y)))(%d)"
B10 = [
  # 22. 交往中的跨年：12/24（大四 12/26）21:00 她私訊兩個選項；去找她＝那年沒有頂樓；頂樓＝零點電話（大四祐廷打過去）；沒接、答應了沒去＝00:05 各一則
  dict(id='B10_NYE2_DATE', key='2026-12-24', h=20.9, zone='dorm', js=SIS_D, asks={'sisb10_nye_ask_y2': '沒有。'}, steps=[('until', 21.4), ('ffloop', '2026-12-31', 22.9), ('until', 24.6)],
       pref=['出發：跨年：醉月湖', '「寫到哪裡？」'], wantMsg=['三十一號晚上，你有事嗎。', '十一點半，醉月湖。人比較少。'], want=NYE2 + ['一月。……二月以後，等你一起排。', '新年快樂。'],
       nothree=True, cflags=['SIS_NYE', 'SIS_NYE_PICK'], eqflags={'SIS_NYE': {'2': 'date'}}, jsok=[('那年沒有頂樓（OUT nye_y2）', ROOFQ % 2, False)]),
  dict(id='B10_NYE3_DATE', key='2027-12-24', h=20.9, zone='dorm', js=SIS_D, asks={'sisb10_nye_ask_y3': '我去找妳。'}, steps=[('until', 21.4), ('ffloop', '2027-12-31', 22.7), ('until', 24.4)],
       pref=['出發：跨年：總圖前', '「寄出去了嗎？」'], wantMsg=['三十一號我要寫交換的讀書計畫，會寫到很晚。', '……十一點以後有空。', '十一點十五分，總圖前面。'],
       want=NYE3 + ['還沒。十一點五十九分寄。', '……我想讓它是今年的事。', '新年快樂。', '（她把熱飲換到另一隻手，空出來的那隻，放進你的手裡。）'],
       nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'3': 'date'}}, jsok=[('那年沒有頂樓（OUT nye_y3）', ROOFQ % 3, False)]),
  dict(id='B10_NYE4_DATE', key='2028-12-26', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, asks={'sisb10_nye_ask_y4': '我去妳家附近找妳。'}, steps=[('until', 21.4), ('ffloop', '2028-12-31', 22.7), ('until', 24.7)],
       pref=['出發：跨年：學姊家的巷口', '「那件外套好醜。」'], wantMsg=['三十一號，我時差應該調好了。', '……應該。', '十一點四十，巷口的便利商店。我傳位置給你。'],
       want=NYE4 + ['美國買的。……很暖，所以醜一點沒關係。', '新年快樂。……今年在同一個時區了。'], none=['我說過很醜。', '新年快樂。……臺灣比較暖。'],
       nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'4': 'date'}}, jsok=[('那年沒有頂樓（OUT nye_y4）', ROOFQ % 4, False), ('大四那一場她沒有說「最後」', HERLAST, [])]),
  dict(id='B10_NYE2_ROOF', key='2026-12-24', h=20.9, zone='dorm', js=SIS_D, asks={'sisb10_nye_ask_y2': '阿哲他們揪頂樓。'}, steps=[('until', 21.4), ('ffloop', '2026-12-31', 22.9), ('until', 24.8)],
       pref=['出發：跨年：宿舍頂樓', '接起來：書瑀打電話來'], wantMsg=['好。那你去。零點我打給你。'], want=['新年快樂。……你們那邊好吵。', '我在寫明年的計畫本。好，你回去。'], none=NYE2[:1],
       nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'2': 'call'}}),
  dict(id='B10_NYE4_ROOF', key='2028-12-26', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, asks={'sisb10_nye_ask_y4': '我去頂樓。'}, steps=[('until', 21.4), ('ffloop', '2028-12-31', 22.9), ('until', 24.8)],
       pref=['出發：跨年：宿舍頂樓', '打過去：打給書瑀'], wantMsg=['好。我會醒著。'], want=['……喂。我醒著。', '新年快樂。你們那邊好吵。好，你回去。'],
       nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'4': 'call'}}, jsok=[('大四那一場她沒有說「最後」', HERLAST, [])]),
  # 12/31 21:00 以前沒回＝頂樓（零點她打來）
  dict(id='B10_NYE3_NOREPLY', key='2027-12-24', h=20.9, zone='dorm', js=SIS_D, steps=[('until', 21.4), ('ffloop', '2027-12-31', 20.9), ('until', 24.8)],
       pref=['出發：跨年：宿舍頂樓', '接起來：書瑀打電話來'], want=['新年快樂。讀書計畫寄出去了。', '……十一點五十九分寄的。'], none=NYE3[:1], nothree=True, cflags=['SIS_NYE', 'SIS_NYE_PICK'], eqflags={'SIS_NYE': {'3': 'call'}}),
  dict(id='B10_NYE2_CMISS', key='2026-12-24', h=20.9, zone='dorm', js=SIS_D, asks={'sisb10_nye_ask_y2': '阿哲他們揪頂樓。'}, steps=[('until', 21.4), ('ffloop', '2026-12-31', 22.9), ('until', 25.0)],
       pref=['先不接', '出發：跨年：宿舍頂樓'], wantMsg=['新年快樂。'], none=['新年快樂。……你們那邊好吵。'], nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'2': 'missed'}}),
  dict(id='B10_NYE3_DMISS', key='2027-12-24', h=20.9, zone='dorm', js=SIS_D, asks={'sisb10_nye_ask_y3': '我去找妳。'}, steps=[('until', 21.4), ('ffloop', '2027-12-31', 22.7), ('until', 24.6)],
       pref=['不去了'], wantMsg=['新年快樂。……我先回去了。'], none=NYE3[:2], nothree=True, cflags=['SIS_NYE'], eqflags={'SIS_NYE': {'3': 'missed'}}),
  # 23. 除夕電話（交往中）：21:30「書瑀打電話來」；不接＝21:40；朋友沒有
  dict(id='B10_CNY27', key='2027-02-05', h=21.2, zone='dorm', js=SIS_D, steps=[('until', 22.0)], pref=['接起來：書瑀打電話來', '「妳家幾個人？」'],
       want=['我在陽台。裡面在打麻將，我被趕出來了。', '……我不會打，只會算台。他們說我算太快，不好玩。', '十二個。今年多一個，表姊的小孩。……一直哭。', '我進去了。我媽在叫。'],
       nothree=True, cflags=['SIS_CNY'], eqflags={'SIS_CNY': {'2027': 'call'}}),
  dict(id='B10_CNY28', key='2028-01-25', h=21.2, zone='dorm', flags=dict(TW3), js=SIS_D, steps=[('until', 22.0)], pref=['接起來：書瑀打電話來', '「我也算過了。」'],
       want=['我媽問我，如果去交換，過年回不回來。', '我說十二月就回來了。她算了一下，說那就好。', '……你算了什麼。', '十二月二十三號。', '嗯。我也是算這一天。'],
       nothree=True, cflags=['SIS_CNY'], eqflags={'SIS_CNY': {'2028': 'call'}}),
  dict(id='B10_CNY29', key='2029-02-12', h=21.2, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, steps=[('until', 22.0)], pref=['接起來：書瑀打電話來', '「最左邊那顆？」'],
       want=['（照片：一盤水餃）', '我包的。', '……最醜的那顆是我包的。不用找，你看得出來。', '……你看得出來。', '明年，你來包一顆。'],
       nothree=True, cflags=['SIS_CNY'], eqflags={'SIS_CNY': {'2029': 'call'}}),
  dict(id='B10_CNY_MISS', key='2027-02-05', h=21.2, zone='dorm', js=SIS_D, steps=[('until', 22.0)], pref=['先不接'],
       wantMsg=['新年快樂。……我先進去了。'], msgAt={'新年快樂。……我先進去了。': ('2027-02-05', 21.67, 0.1)}, none=['我在陽台。裡面在打麻將，我被趕出來了。'], nothree=True, cflags=['SIS_CNY'], eqflags={'SIS_CNY': {'2027': 'missed'}}),
  dict(id='B10_CNY_F', key='2027-02-05', h=21.2, zone='dorm', js=SISF, steps=[('until', 22.0)], pref=[], none=['我在陽台。裡面在打麻將，我被趕出來了。'], noneMsg=['新年快樂。……我先進去了。'],
       nothree=True, jsok=[('朋友沒有除夕電話（OUT sisb10_cny_2027）', "!!OUT.get(GAME.G,'sisb10_cny_2027')", False)]),
  # 24. 前任四場（大二下 2/10 分手）：滿 3 週以後，週三晚上法圖（她在）→ 隔 3 週以上 Café 的椅子 → 霖澤館一樓大廳週一～四 14:00 前後；2028-08-01 21:00 私訊
  dict(id='B10_EX1', key='2027-03-17', h=19.2, zone='lawlib', js=EXJS('2027-02-10'), steps=[('until', 19.9)], pref=['「妳最近好嗎？」'],
       want=['（她看到你，停了一下，從包包拿出一個牛皮紙袋。）', '你的東西。一直在我那裡。', '（紙袋裡是你的筆記本，還有一支你以為弄丟的筆。）', '在寫論文。', '……你也好好念。', '（她回到自己的位子。整個晚上，她沒有再抬頭。）'],
       nothree=True, cflags=['SIS_EX_SEEN', 'SIS_EX_LAST'], eqflags={'SIS_EX_SEEN': 1}),
  dict(id='B10_EX1_EARLY', key='2027-03-17', h=19.2, zone='lawlib', js=EXJS('2027-03-01'), steps=[('until', 19.9)], pref=[], none=['你的東西。一直在我那裡。'], nothree=True, cflags=['SIS_EX_SEEN'], eqflags={'SIS_EX_SEEN': '(undefined)'}),
  dict(id='B10_EX_ORDER', key='2027-04-08', h=19.2, zone='cafe', js=EXJS('2027-02-10'), steps=[('until', 19.9)], pref=[], none=['（她在老位子。對面的椅子上放著她的包包。）'], nothree=True, cflags=['SIS_EX_SEEN'], eqflags={'SIS_EX_SEEN': '(undefined)'}),
  dict(id='B10_EX2', key='2027-04-08', h=19.2, zone='cafe', js=EXJS('2027-02-10') + " G.flags.SIS_EX_SEEN=1; G.flags.SIS_EX_LAST=D('2027-03-17');", steps=[('until', 19.9)], pref=['（坐到吧檯）'],
       want=['（她在老位子。對面的椅子上放著她的包包。）', '（她看到你，點了一下頭。包包沒有拿起來。）', '（你在吧檯坐了一個小時。十點，她收好書，經過你旁邊。）', '……回去小心。'],
       nothree=True, cflags=['SIS_EX_SEEN', 'SIS_EX_CAFE'], eqflags={'SIS_EX_SEEN': 2, 'SIS_EX_CAFE': True}),
  dict(id='B10_EX3', key='2027-05-03', h=13.8, zone='linze', js=EXJS('2027-02-10') + " G.flags.SIS_EX_SEEN=2; G.flags.SIS_EX_LAST=D('2027-04-08');", steps=[('until', 14.3)], pref=['「不太好。」'],
       want=['（她從樓上下來，抱著一疊影印稿。看到你，腳步慢了一點。）', '……最近好嗎。', '要吃飯，要睡覺。', '……不要學我以前那樣。', '（她往下走。到轉角的時候，回頭看了一下，沒有說話。）'],
       nothree=True, cflags=['SIS_EX_SEEN'], eqflags={'SIS_EX_SEEN': 3}),
  dict(id='B10_EX4', key='2028-08-01', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + EXJS('2028-03-01'), asks={'sisb10_ex_last': '到了說一聲。'}, steps=[('until', 21.6)], pref=[],
       wantMsg=['明天走了。', '……你也保重。', '群組會說。'], msgAt={'明天走了。': ('2028-08-01', 21.0, 0.1)}, nothree=True, cflags=['SIS_EX_SEEN'], eqflags={'SIS_EX_SEEN': 4}),
  dict(id='B10_EX4_US', key='2028-08-01', h=20.9, zone='dorm', flags=dict(USP), js=Y4 + EXJS('2028-03-01'), asks={'sisb10_ex_last': '一路順風。'}, steps=[('until', 21.6)], pref=[],
       wantMsg=['明天走了。', '……你也保重。', '謝謝。'], nothree=True),
  # 25. 畢業以後每季一次（熟悉以上、沒和她交往；最小存檔＝畢業以後）：週一二四 19:30 以後在 Café 找她說話
  dict(id='B10_PG1', minimal=True, key='2029-10-01', h=19.6, zone='cafe', js=SISF, steps=[('talk', 'heroine_05')], pref=['「計畫本還在用嗎？」'],
       want=['（她換了一個新的包包。筆電旁邊放著一張識別證，背面朝上。）', '你也還在來。', '上班以後，晚上反而比較有時間。……很奇怪。', '週末我不排了。……在試。', '好。我把這段看完。你坐。'],
       nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': 1}),
] + [dict(id='B10_PG2_' + k, minimal=True, key='2030-01-03', h=19.6, zone='cafe', flags=({'SIS_Y3S2_RAIN': v} if v else {}), js=SISF, steps=[('talk', 'heroine_05')], pref=['「過年回家嗎？」'],
          want=['（外面在下雨。她的桌腳靠著兩把傘。）', w, '回。我媽說今年要我包水餃。', '……我包得很醜。'], none=nw, nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': 2})
     for k, v, w, nw in [('BUY', 'buy', '我現在都帶兩把。……說過的。', ['下雨天，這裡人比較少。']), ('SHARE', 'share', '今天這一頁我有看。……寫的是「Café，帶傘」。', ['我現在都帶兩把。……說過的。']),
                         ('NONE', None, '下雨天，這裡人比較少。', ['我現在都帶兩把。……說過的。'])]] + [
  dict(id='B10_PG3', minimal=True, key='2030-04-01', h=19.6, zone='cafe', js=SISF, steps=[('talk', 'heroine_05')], pref=['「沒有，很有用。」'],
       want=['（她在改一份東西。紅筆。不是她的字。）', '單位裡來了一個新人。他的報告我在改。', '……我以前改你的筆記，你是不是很討厭。', '那我以前改太少了。'], nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': 3}),
  dict(id='B10_PG4', minimal=True, key='2030-09-02', h=19.6, zone='cafe', js=SISF, steps=[('talk', 'heroine_05')], pref=['「下次換個位子？」'],
       want=['（Café 的熱水壺又換了一個。她倒了兩杯，推一杯過來。）', '熱水。不是咖啡。', '你們畢業一年多了。我每次來，都還是坐這裡。', '不要。這個位子看得到門口。'], nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': 4}),
  dict(id='B10_PG_KX', minimal=True, key='2029-10-01', h=19.6, zone='cafe', js=SISF + " " + KX_L, steps=[('talk', 'heroine_05')], pref=[], want=['你也還在來。'], nothree=True, eqflags={'SIS_PG_Q': 1}),
  dict(id='B10_PG_D', minimal=True, key='2029-10-01', h=19.6, zone='cafe', js=SIS_D, steps=[('talk', 'heroine_05')], pref=[], none=['你也還在來。'], nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': '(undefined)'}),
  dict(id='B10_PG_EX', minimal=True, key='2029-10-01', h=19.6, zone='cafe', js=EXJS('2029-01-10'), steps=[('talk', 'heroine_05')], pref=[], none=['你也還在來。'], nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': '(undefined)'}),
  dict(id='B10_PG_LATE', minimal=True, key='2029-11-05', h=19.6, zone='cafe', js=SISF, steps=[('talk', 'heroine_05')], pref=[], none=['你也還在來。'], nothree=True, cflags=['SIS_PG_Q'], eqflags={'SIS_PG_Q': '(undefined)'}),
]
SCENS = SCENS + B10
XM0 = ['（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）', '好，交換！直屬送直屬，學弟先！', '（學姊坐在你對面。她把一個用牛皮紙包的小東西放在桌上，等你先拿出來。）']
XM_PEN = '（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）'; XM_END = '明年也是直屬送直屬。……你記得。'
XMGRP = ['家族聖誕交換禮物！期末考完那天，12/28 晚上六點半，公館那家火鍋。', '聖誕節晚三天過沒差啦，考試比較重要。', '家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。', '收到。']
def XMJ(k): return SISF + FAMJ + ((" G.flags.SIS_FAMXMAS_BUY='%s'; G.flags.SIS_FAMXMAS_PAID=true;" % k) if k else '')
XM = [
  # 26. 大二 12/14（一）21:00 家族群組＋手機「買給學姊的聖誕禮物」（沒演過熱水那一場＝沒有手寫券；買了就扣錢）
  dict(id='XM_GRP', key='2026-12-14', h=20.9, zone='dorm', js=SISF + FAMJ, asks={'famx_y2_gift': '一盒鉛筆'}, steps=[('until', 21.5)], pref=[], wantMsg=XMGRP, dmoney=-60,
       cflags=['SIS_FAMXMAS_BUY'], eqflags={'SIS_FAMXMAS_BUY': 'pencil'}, nothree=True,
       jsok=[('禮物選項（沒有手寫券，四樣）', ASKOPT % json.dumps('famx_y2_gift'), lambda x: isinstance(x, list) and len(x) == 4 and not any('今天先不改了' in t for t in x)),
             ('排了 12/28 18:30「家族聖誕：公館的火鍋店」', "(q=>q?CALENDAR.dateOf(q.day).key+' '+q.h:null)(OUT.get(GAME.G,'famx_y2'))", '2026-12-28 18.5')]),
  dict(id='XM_GRP_HW', key='2026-12-14', h=20.9, zone='dorm', js=SISF + FAMJ + " G.events.done.ev_sis_hot_water=1;", asks={'famx_y2_gift': '手寫的「今天先不改了」券'}, steps=[('until', 21.5)], pref=[], dmoney=0,
       cflags=['SIS_FAMXMAS_BUY'], eqflags={'SIS_FAMXMAS_BUY': 'coupon'}, nothree=True,
       jsok=[('禮物選項（演過熱水＝五樣，有手寫券）', ASKOPT % json.dumps('famx_y2_gift'), lambda x: isinstance(x, list) and len(x) == 5 and any('今天先不改了' in t for t in x))]),
  # 12/28 18:30 火鍋（[前置] 讀檔 18:12、買好的禮物直接記上）：五樣的反應、沒準備、交往中送花、前任、她送的鉛筆兩版
  dict(id='XM_PENCIL', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('pencil'), steps=[('until', 21.6)], pref=['出發：家族聖誕', '「名字是妳刻的？」'],
       want=XM0 + ['……鉛筆。', '我說過用鉛筆，你記得。這盒夠我用到畢業。', XM_PEN, '鉛筆。寫錯可以擦。', '刻壞了兩支。這是第三支。', '好！大家都送完了，吃！', XM_END],
       nothree=True, cflags=['SIS_FAMXMAS_Y2'], eqflags={'SIS_FAMXMAS_Y2': 'pencil'}, cmem=[('heroine_05', 'SIS_XMAS_PENCIL')], eqmem={'heroine_05/SIS_XMAS_PENCIL': '(空)'},
       jsok=[('房間多一件「學姊送的鉛筆（刻了你的名字）」', ROOMX % json.dumps('鉛筆'), ['學姊送的鉛筆（刻了你的名字）'])]),
  dict(id='XM_NOTEBOOK', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('notebook'), steps=[('until', 21.6)], pref=['出發：家族聖誕', '「謝謝學姊。」'],
       want=XM0 + ['我有很多本了。……這本我留著，不排東西。', XM_PEN, '（她低頭吃了一口菜。耳朵有一點紅。）', XM_END], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'notebook'}),
  dict(id='XM_LEMON', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('lemon'), steps=[('until', 21.6)], pref=['出發：家族聖誕'],
       want=XM0 + ['考完了才喝得到。……很好，我現在終於有時間喝。', XM_PEN], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'lemon'}),
  dict(id='XM_COUPON', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('coupon') + " G.events.done.ev_sis_hot_water=1;", steps=[('until', 21.6)], pref=['出發：家族聖誕'],
       want=XM0 + ['……這是什麼。', '好。我收下。不保證會用。', XM_PEN], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'coupon'}),
  dict(id='XM_FLOWER_F', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('flowers'), steps=[('until', 21.6)], pref=['出發：家族聖誕'],
       want=XM0 + ['……謝謝。', '齁——', XM_PEN], none=['我第一次收到不是畢業典禮的花。'], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'flowers'}),
  dict(id='XM_FLOWER_D', key='2026-12-28', h=18.2, zone='dorm', js=SIS_D + FAMJ + " G.flags.SIS_FAMXMAS_BUY='flowers'; G.flags.SIS_FAMXMAS_PAID=true;", steps=[('until', 21.6)], pref=['出發：家族聖誕', '「謝謝。」'],
       want=XM0 + ['我第一次收到不是畢業典禮的花。', XM_PEN], none=['齁——'], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'flowers'}),
  dict(id='XM_NONE', key='2026-12-28', h=18.2, zone='dorm', js=XMJ(None), steps=[('until', 21.6)], pref=['出發：家族聖誕'],
       want=XM0 + ['（你兩手空空。桌上的人都看著你。）', '學弟——', '沒關係。剛考完，忘記很正常。', '……下次補。', XM_PEN], nothree=True, eqflags={'SIS_FAMXMAS_Y2': 'none'}),
  dict(id='XM_EX', key='2026-12-28', h=18.2, zone='dorm', js=EXJS('2026-11-01') + FAMJ + " G.flags.SIS_FAMXMAS_BUY='pencil'; G.flags.SIS_FAMXMAS_PAID=true;", steps=[('until', 21.6)], pref=['出發：家族聖誕', '「謝謝學姊。」'],
       want=XM0 + ['……謝謝。', '（牛皮紙裡是一支鉛筆。）', '……回去小心。'], none=[XM_PEN, '……鉛筆。', '刻壞了兩支。這是第三支。', XM_END, '（她低頭吃了一口菜。耳朵有一點紅。）'], nothree=True,
       jsok=[('前任的鉛筆不放房間', ROOMX % json.dumps('鉛筆'), [])]),
  dict(id='XM_READ', key='2026-12-28', h=18.2, zone='dorm', js=XMJ('pencil') + " G.events.done.ev_grad_reading=1;", steps=[('until', 21.6)], pref=['出發：家族聖誕'],
       want=XM0 + [XM_PEN, '用鉛筆寫你不同意的地方。我說過。'], none=['鉛筆。寫錯可以擦。'], nothree=True),
  # 手寫券：2027-01-10（日）21:00「我用了。昨天。」
  dict(id='XM_COUPON_USE', key='2027-01-10', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y2': 'coupon'}, js=SISF + FAMJ, steps=[('until', 21.4)], pref=[], wantMsg=['我用了。昨天。'], nothree=True),
  # 大三聖誕夜（交往中，ev_sis_xmas_y3；[捷徑] 直接開演）：送過禮物的多「去年的禮物，我還在用。」；沒準備的沒有
  dict(id='XM_Y3', key='2027-12-24', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y2': 'pencil'}, js=SIS_D + FAMJ, steps=[('runev', 'ev_sis_xmas_y3')], pref=[],
       want=['隔壁的學妹放的。她回家了，叫我幫她顧。', '去年的禮物，我還在用。', '……樹要怎麼顧。'], nothree=True),
  dict(id='XM_Y3_NONE', key='2027-12-24', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y2': 'none'}, js=SIS_D + FAMJ, steps=[('runev', 'ev_sis_xmas_y3')], pref=[],
       want=['隔壁的學妹放的。她回家了，叫我幫她顧。', '……樹要怎麼顧。'], none=['去年的禮物，我還在用。'], nothree=True),
]
SCENS = SCENS + XM
# AA_406 改版（企劃 895496a7，10:2x）：改到大一 2025-12-22，事件 ev_family_xmas_y1、旗標 SIS_FAMXMAS_Y1；交往中、前任拿掉；回聲改成大一下 ev_grad_reading、大二 Café 門口。
# 台詞先照 AA_406 第 1～4 節的字；LAWWW-B 實作以後照程式核一次 id、旗標、選項字（還沒排進佇列）。上面大二那一版 XM_* 作廢、不跑。
XM1G = ['家族聖誕交換禮物！期末考完那天，12/22 晚上六點半，公館那家火鍋。', '家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。', '收到。']
XM1_0 = ['（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）', '（學姊坐在你對面。她的碗裡只有白飯和青菜。）', '她二月要考試，不吃辣，不吃肉丸。不要問。', '好，交換！直屬送直屬，學弟先！',
         '（她把一個用牛皮紙包的小東西放在桌上，等你先拿出來。）']
XM1_PEN = ['（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）', '鉛筆。寫錯可以擦。']; XM1_END = ['好！大家都送完了，吃！', '（她九點就先走了。說要回去念書。走到門口，又回頭跟你說了一句。）', '鉛筆用完了，再跟我說。']
def XM1J(k): return SISF + FAMJ + ((" G.flags.SIS_FAMXMAS_BUY='%s'; G.flags.SIS_FAMXMAS_PAID=true;" % k) if k else '')
XM1 = [
  dict(id='XM1_GRP', key='2025-12-15', h=20.9, zone='dorm', js=SISF + FAMJ, asks={'famx': '一盒鉛筆'}, steps=[('until', 21.5)], pref=[], wantMsg=XM1G, dmoney=-60, nothree=True,
       jsok=[('排了 12/22 18:30「家族聖誕：公館的火鍋店」', "(()=>{ const q=OUT.rec(GAME.G).find(q=>q.ev==='ev_family_xmas_y1'); return q?CALENDAR.dateOf(q.day).key+' '+q.h:null; })()", '2025-12-22 18.5')]),
  dict(id='XM1_GRP_HW', key='2025-12-15', h=20.9, zone='dorm', js=SISF + FAMJ + " G.events.done.ev_sis_hot_water=1;", asks={'famx': '手寫的「今天先不改了」券'}, steps=[('until', 21.5)], pref=[], dmoney=0, nothree=True),
  dict(id='XM1_NOGRP', key='2025-12-15', h=20.9, zone='dorm', js=SISF + " { const P=PHONE.rec(G); if(P.groups) delete P.groups.family_law; }", steps=[('until', 21.5)], pref=[], noneMsg=XM1G[:1], nothree=True),
] + [dict(id='XM1_' + (k or 'none').upper(), key='2025-12-22', h=18.2, zone='dorm', js=XM1J(k), steps=[('until', 21.6)], pref=['出發：家族聖誕', '「名字是妳刻的？」'],
          want=XM1_0 + w + XM1_PEN + ['刻壞了兩支。這是第三支。'] + XM1_END, none=nw, nothree=True, cflags=['SIS_FAMXMAS_Y1'], eqflags={'SIS_FAMXMAS_Y1': k or 'none'},
          jsok=[('房間多一件鉛筆', ROOMX % json.dumps('鉛筆'), ['學姊送的鉛筆（刻了你的名字）'])])
     for k, w, nw in [('pencil', ['……鉛筆。', '我讀判決都用鉛筆。這盒夠我用到考完。'], []), ('notebook', ['我有很多本了。……這本我留著，考完再用。'], []), ('lemon', ['考前喝這個。……你很懂。'], []),
                      ('flowers', ['……謝謝。', '（Kevin：「齁——」她把花放在腳邊，整晚沒有再看它。）'], []),
                      (None, ['（你兩手空空。桌上的人都看著你。）', '學弟——', '沒關係。剛考完，忘記很正常。'], ['……鉛筆。'])]] + [
  dict(id='XM1_COUPON', key='2025-12-22', h=18.2, zone='dorm', js=XM1J('coupon') + " G.events.done.ev_sis_hot_water=1;", steps=[('until', 21.6)], pref=['出發：家族聖誕', '「謝謝學姊。」'],
       want=XM1_0 + ['……這是什麼。', '好。我收下。不保證會用。'] + XM1_PEN + ['（她低頭吃了一口青菜。）'] + XM1_END, nothree=True, eqflags={'SIS_FAMXMAS_Y1': 'coupon'}),
  dict(id='XM1_COUPON_USE', key='2026-01-18', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'coupon'}, js=SISF + FAMJ, steps=[('until', 21.4)], pref=[], wantMsg=['我用了。昨天。'], nothree=True),
  dict(id='XM1_COUPON_USE_NO', key='2026-01-18', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'pencil'}, js=SISF + FAMJ, steps=[('until', 21.4)], pref=[], noneMsg=['我用了。昨天。'], nothree=True),
  # 回聲：[捷徑] 直接開演
  dict(id='XM1_READ', key='2026-03-10', h=20.0, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'pencil'}, js=SISF + FAMJ, steps=[('runev', 'ev_grad_reading')], pref=[], want=['用我給你的那支。'], nothree=True),
  dict(id='XM1_CAFE', key='2026-12-24', h=21.9, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'pencil'}, js=SIS_D + FAMJ, steps=[('runev', 'ev_sis_xmas_y2')], pref=[], want=['去年是你先送。今年換我先拿出來。'], nothree=True),
  dict(id='XM1_CAFE_NONE', key='2026-12-24', h=21.9, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'none'}, js=SIS_D + FAMJ, steps=[('runev', 'ev_sis_xmas_y2')], pref=[], none=['去年是你先送。今年換我先拿出來。'], nothree=True),
  dict(id='XM1_Y3', key='2027-12-24', h=20.9, zone='dorm', flags={'SIS_FAMXMAS_Y1': 'pencil'}, js=SIS_D + FAMJ, steps=[('runev', 'ev_sis_xmas_y3')], pref=[], none=['去年的禮物，我還在用。'], want=['隔壁的學妹放的。她回家了，叫我幫她顧。'], nothree=True),
]
SCENS = SCENS + XM1

# ---------------------------------------------------------------- 同一份清單第 27～34 項（LAWWW-B 10:41／10:45，開發分支 a5b298318 起；c822b4efc）：AA_400～403、AA_313 第 4、5 節抽看
# 台詞照遊戲 c822b4efc 的字（src/zq_testbuild3d.js、src/data/termend_lines.js KX_ASK、src/kx_khh3d.js、src/data/events.js AA_402／AA_403、AA_313 那幾場）。
# 新步驟：talk 照情境的 pref 選（原本只選「聊／說」）、usep（同 use，選項照 pref）、jsrun／jump／meet／ffout（見 main），都是【前置／捷徑】或照玩家操作，各段註解寫明。
ZQ = 'heroine_04'
ZQB = NOKX + " G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_ziqing_secret_game=1; G.contacts=G.contacts||{}; if(G.contacts.heroine_04==null) G.contacts.heroine_04=D('2026-03-01');"
ZQF = ZQB + " LV('heroine_04',45,30,20);"
ZQD = ZQB + " LV('heroine_04',70,60,60); SOCIAL.rel('heroine_04').npcRom=60; SOCIAL.rel('heroine_04').rom=60; try{ ROM.start(G,'heroine_04'); }catch(e){} G.flags.dating_heroine_04=true;"
HOOKZ = " G.flags.HOOK_ZQ_GAME=true;"; JIUF = " SOCIAL.remember('heroine_04','ENC_D18_ZQ','');"
CUTASK = " { const P=PHONE.rec(G); P.cut=P.cut||[]; if(!P.cut.includes('zqtb_ask')) P.cut.push('zqtb_ask'); }"   # [前置] 3/7 那一則算傳過（讀檔在 3/8 以後的情境）
ZQ0 = ['（她坐在靠窗那排。筆電開著，旁邊插著一個貼了貓貼紙的隨身碟。）', '你坐。用我的筆電，玩第一關就好。', '（螢幕上，一隻橘白色的貓在總圖二樓走來走去。牠走到窗邊，聞了一下插座。）']
ZQEND = ['隨身碟給你。全部玩完，跟我說哪裡卡住。', '不要跟我說好玩。']
ZQ_HAND = '（她把隨身碟放進你手心。貓貼紙有一角翹起來了。）'; ZQ_HAND_D = '（她把隨身碟放進你手心，手指在你掌心停了一下才收回去。）'
ZQ_JF = '第三關是九份，燈籠那關。你回去自己玩。'
ZQPLAY = ['（第一關，總圖二樓那排插座全部是亮的。）', '（第三關是九份。燈籠一個一個亮起來，貓要在燈全部熄掉以前爬到最上面。你掉下去六次。）',
          '（第四關是一個沒有路的屋頂。你卡了很久，才發現貓可以跳到旁邊的招牌上。）', '（最後一關還沒做。畫面上寫著：「這裡還沒有路。」）']
ZQM = ['測試版好了。', '明天中午，總圖二樓。靠窗那排。']
KXJ = " LV('kexin',70,60,60); SOCIAL.rel('kexin').npcRom=90; G.flags.dating_kexin=true;"   # 使用者存檔本來就和可昕交往中（不套 NOKX）
def KXD(t): return "(t=>{ void (async()=>{ GAME.sceneBegin(); try{ await TERMEND.kexinDinner(GAME,{term:t,who:'kexin',kind:'kexin'}); }catch(e){ console.warn('KXD',e); } finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GAME.sceneEnd(); } })(); return true; })(%s)" % json.dumps(t)
HVP = "(()=>{ void (async()=>{ GAME.sceneBegin(); try{ await HV.play(GAME,{id:'hv_kexin_t',ev:'ev_hv_kx',day:GAME.G.day,h:10,hv:{id:'kexin',key:'kexin'}}); }catch(e){ console.warn('HVP',e); } finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GAME.sceneEnd(); } })(); return true; })()"
KXR = "(()=>{ const G=GAME.G; if(typeof KXKHH==='undefined') return null; for(let d=G.day-40; d<G.day+120; d++){ const R=KXKHH.run(G,d); if(R&&R.b>=G.day-1) return R; } return null; })()"
KXRQ = "(R=>R?{a:CALENDAR.dateOf(R.a).key,b:CALENDAR.dateOf(R.b).key,key:R.key}:null)(%s)" % KXR
KXCALL = "(()=>{ let s=null; try{ s=(PGDATE.kxList(GAME.G)||[]).find(x=>x.kind==='call'); }catch(e){} return s?s.day:null; })()"
SIS_GD = " G.flags.W3_STANCE='no'; G.events.done.ev_grad_debate=1; G.events.last=G.events.last||{}; G.events.last.ev_grad_debate=D('2026-04-10');"
GD0 = ['（她把那篇文章攤開在第二節。你上次用鉛筆寫的字，旁邊多了幾個她的問號。）', '上次說好的。這一段，你講給我聽。', '當我沒讀過。']
GDEND = ['（她用鉛筆在你的字旁邊，把一個問號擦掉了。）', '好。文章你留著。']; GD_D = '（她把文章推過來的時候，手指在你的鉛筆字上停了一下。）'
BHNEW = ['「法服的值班表，我排到十二月了。」', '「這學期我週三晚上空出來了。要讀書的話，可以找我。」', '「法服這學期的個案，比上學期多一倍。」', '「你下學期修幾學分。我在看要不要多修一門。」',
         '「社長交出去了。週六早上我還是會去。習慣了。」', '「四樓樓梯間，下午兩點以後就沒有人了。」', '「推甄的書面資料，我寫到第四版了。」', '「暑假我不回新竹。總圖暑假也開。」',
         '「面試的問題，我準備了四十題。」', '「推甄上了。……我媽在電話裡哭了，我沒有。」', '「國考讀書會的考古題，我排到七月了。」', '「研究所九月開學。國考在那之前。時間剛好。」']
XCNEW = ['「經濟系的課跟法律系的撞了一堂，我改修晚上那一班。」', '「我每天早上七點的公車。永和過來要四十分鐘。」', '「上禮拜的筆記我做了兩份，一份給以安。……她沒有要，是我自己給的。」',
         '「週四晚上我借了一間討論室。你要來的話，我多印一份。」', '「期末考完那天晚上，有空嗎？我先問，你不用現在回答。」', '「我爸說寒假可以去事務所幫忙。……我還沒決定。」',
         '「以安的交換，你知道她選哪裡嗎？……我只是問。」', '「以安不在，第一排的位子我坐了。……沒有比較好。」', '「暑假我在我爸的事務所。九點到六點，跟上班一樣。」', '「國考跟研究所，我兩個都報了。」',
         '「我最近在追一部日劇。你不要問我名字，我會講兩個小時。」', '「畢業典禮那天，我媽要請假。她說要坐第一排。」', '「國考那天，我叫我媽不要來。……她說她會在外面等。」']
def STUSED(cid, keep):   # [前置] 他／她 AA_402 以前的閒聊句都當作說過了（smallTalk 照清單順序挑第一句沒說過的；不先記掉，一次說話不一定輪到新句）
    return " { const R=G.social.small||(G.social.small={}), r=R[%s]||(R[%s]={day:0,used:[],last:null}), keep=%s; r.used=(SMALLTALK[%s]||[]).map(e=>typeof e==='string'?e:e.t).filter(t=>!keep.includes(t)); r.day=0; }" % (json.dumps(cid), json.dumps(cid), json.dumps(keep, ensure_ascii=False), json.dumps(cid))
NARRQ = "(t=>(window.__LOG||[]).filter(x=>x.t===t).map(x=>x.n||''))(%s)"
YTD = NOKX + " LV('heroine_03',65,50,45); SOCIAL.rel('heroine_03').npcRom=60; SOCIAL.rel('heroine_03').rom=60; try{ ROM.start(G,'heroine_03'); }catch(e){} G.flags.dating_heroine_03=true;"
NOODLE = " PHONE.join(G,'noodle_team','麵店團'); LV('heroine_01',25,10,10); LV('yu',25,10,10); LV('zhe',45,30,20);"
R4 = [
  # 27. AA_400 子晴的測試版：看過 Q6＋大三上期末選「做出來給我玩。」（HOOK_ZQ_GAME）或九份偶遇（記憶 ENC_D18_ZQ）；2028-03-07（二）21:00 私訊 → 3/8 12:10 總圖二樓
  #     [前置] 讀檔 3/7 20:54 宿舍、Q6 記成演過；之後照玩家：回訊息、睡到早上、時間照走等「出發」
  dict(id='R27_OK', key='2028-03-07', h=20.9, zone='dorm', flags=dict(TW3, FIRST_BUG=True), js=ZQF + HOOKZ, asks={'zqtb_ask': '好。'},
       steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('until', 13.6)], pref=['出發：總圖二樓：子晴的測試版', '「第一關好難。」'],
       wantMsg=ZQM + ['十二點十分。我下午有課。'], want=ZQ0 + ['（插座亮了。）', '你說壞的那個，我在遊戲裡修好了。現實的還沒。', '欸不是，你才玩兩分鐘。', '……好，我記下來。第一關太難。'] + ZQEND + [ZQ_HAND],
       none=[ZQ_JF, ZQ_HAND_D], cflags=['ZQ_TESTBUILD', 'ZQ_TB_FROM', 'ZQ_TB_GO'], eqflags={'ZQ_TESTBUILD': True, 'ZQ_TB_FROM': 'lib'}, cmem=[(ZQ, 'ZQ_TESTBUILD')],
       jsok=[('房間多一件「子晴的測試版（貓貼紙的隨身碟）」、可以玩', ROOMX % json.dumps('測試版'), ['玩子晴的測試版（60 分）', '子晴的測試版（貓貼紙的隨身碟）'])]),
  # 交往中＋九份那一條（沒有 HOOK）：九份那一句、手心那一行；回「傳檔案給我就好？」
  dict(id='R27_D_JF', key='2028-03-07', h=20.9, zone='dorm', flags=dict(TW3), js=ZQD + JIUF, asks={'zqtb_ask': '傳檔案給我就好？'},
       steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('until', 13.6)], pref=['出發：總圖二樓：子晴的測試版', '「可以上架了吧。」'],
       wantMsg=ZQM + ['不要。我要看你第一關卡在哪裡。'], want=ZQ0 + [ZQ_JF, '還差很多。音效是暫時的，存檔會壞。', '五月發表會以前要弄好。'] + ZQEND + [ZQ_HAND_D],
       none=['（插座亮了。）', ZQ_HAND], eqflags={'ZQ_TESTBUILD': True, 'ZQ_TB_FROM': 'lib'}),
  # 沒回＝3/8 11:00「那我放在 Café 櫃台。」；答應了沒到＝12:40「我去上課了。隨身碟在 Café 櫃台。」
  dict(id='R27_NOREPLY', key='2028-03-07', h=20.9, zone='dorm', flags=dict(TW3), js=ZQF + HOOKZ, steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('until', 11.4)], pref=[],
       wantMsg=ZQM + ['那我放在 Café 櫃台。'], msgAt={'那我放在 Café 櫃台。': ('2028-03-08', 11.0, 0.1)}, cflags=['ZQ_TB_CAFE'], eqflags={'ZQ_TB_CAFE': True}),
  dict(id='R27_NOSHOW', key='2028-03-07', h=20.9, zone='dorm', flags=dict(TW3), js=ZQF + HOOKZ, asks={'zqtb_ask': '好。'}, steps=[('until', 21.4), ('bedpick', '睡到明天早上'), ('until', 13.2)],
       pref=['不去了'], wantMsg=['我去上課了。隨身碟在 Café 櫃台。'], msgAt={'我去上課了。隨身碟在 Café 櫃台。': ('2028-03-08', 12.67, 0.1)}, none=ZQ0[:1], cflags=['ZQ_TB_CAFE'], eqflags={'ZQ_TB_CAFE': True}),
  # Café 櫃台（3/8～3/14 走進 Café）：[前置] 讀檔 3/9 15:00 直接在 Café、記成「放在櫃台」
  dict(id='R27_CAFE', key='2028-03-09', h=15.0, zone='cafe', flags=dict(TW3, ZQ_TB_CAFE=True), js=ZQF + HOOKZ + CUTASK, steps=[('until', 15.4)], pref=[],
       want=['子晴放的。她說你一定會忘記來拿。'], eqflags={'ZQ_TESTBUILD': True, 'ZQ_TB_FROM': 'cafe'}),
  # 對照：沒看過 Q6＝沒有私訊
  dict(id='R27_NOQ6', key='2028-03-07', h=20.9, zone='dorm', flags=dict(TW3), js=NOKX + " LV('heroine_04',45,30,20);" + HOOKZ + " if(G.events&&G.events.done) delete G.events.done.ev_ziqing_secret_game;",
       steps=[('until', 21.4)], pref=[], noneMsg=ZQM[:1]),
  # 28. 玩測試版：拿到以後在自己房間「看看房間裡的東西」→「玩子晴的測試版（60 分）」→ 旁白 → 傳她一則（照她的回覆時間回）
  dict(id='R28_PLAY', key='2028-03-10', h=19.5, zone='dorm', flags=dict(TW3, ZQ_TESTBUILD=True, ZQ_TB_FROM='lib', FIRST_BUG=True), js=ZQF + HOOKZ + JIUF + CUTASK,
       steps=[('usep', '^看看房間裡的東西'), ('until', 23.5)], pref=['玩子晴的測試版', '傳給她：「第四關的屋頂，我卡了二十分鐘。」'],
       want=ZQPLAY, wantMsg=['第四關的屋頂，我卡了二十分鐘。', '……那是設計。', '好啦，那是 bug。謝謝。'], cflags=['ZQ_TB_PLAYED', 'ZQ_TB_FB'], eqflags={'ZQ_TB_FB': 'roof'},
       jsok=[('玩過以後：房間只剩「子晴的測試版（貓貼紙的隨身碟）」', ROOMX % json.dumps('測試版'), ['子晴的測試版（貓貼紙的隨身碟）'])]),
  # 3/14 沒玩＝3/15 21:00「玩了沒。」；回「今天玩。」＝那天還可以玩；回「還沒。」＝「……好。」、不能玩了
  dict(id='R28_ASK2', key='2028-03-15', h=20.9, zone='dorm', flags=dict(TW3, ZQ_TESTBUILD=True, ZQ_TB_FROM='cafe'), js=ZQF + HOOKZ + CUTASK, asks={'zqtb_ask2': '今天玩。'},
       steps=[('until', 21.3), ('usep', '^看看房間裡的東西'), ('until', 23.8)], pref=['玩子晴的測試版', '傳給她：「好玩。」'],
       wantMsg=['玩了沒。', '我說不要跟我說好玩。', '……好啦。謝謝。'], want=ZQPLAY[2:], none=ZQPLAY[:2], eqflags={'ZQ_TB_LATE': 'today', 'ZQ_TB_FB': 'fun'}),
  dict(id='R28_ASK2_NO', key='2028-03-15', h=20.9, zone='dorm', flags=dict(TW3, ZQ_TESTBUILD=True, ZQ_TB_FROM='cafe'), js=ZQF + HOOKZ + CUTASK, asks={'zqtb_ask2': '還沒。'},
       steps=[('until', 21.4)], pref=[], wantMsg=['玩了沒。', '……好。'], eqflags={'ZQ_TB_LATE': 'no'},
       jsok=[('回「還沒。」：房間沒有「玩子晴的測試版」', ROOMX % json.dumps('玩子晴'), [])]),
  # 發表會（Q12）：測試版回她「屋頂」的多一句；[捷徑] 直接開演 ev_ziqing_q12
  dict(id='R28_Q12_ROOF', key='2028-05-20', h=14.0, zone='dorm', flags=dict(TW3, ZQ_TESTBUILD=True, ZQ_TB_FB='roof'), js=ZQF + HOOKZ, steps=[('runev', 'ev_ziqing_q12')], pref=[],
       want=['第四關的屋頂，我加了一條路。']),
  dict(id='R28_Q12_FUN', key='2028-05-20', h=14.0, zone='dorm', flags=dict(TW3, ZQ_TESTBUILD=True, ZQ_TB_FB='fun'), js=ZQF + HOOKZ, steps=[('runev', 'ev_ziqing_q12')], pref=[],
       none=['第四關的屋頂，我加了一條路。']),
  # 29. AA_401 可昕的學期末約會：table 兩句後面的二選一（[捷徑] 直接演 TERMEND.kexinDinner 那一學期；R29_REAL 照真的時段跑一次）
] + [dict(id='R29_' + k, key=key, h=18.0, zone='dorm', flags=fl, js=KXJ, steps=[('jsrun', KXD(term), '可昕的學期末約會（%s）' % term)], pref=[pick],
          want=w, cflags=['KX_KHH', 'KX_Y5_CALL', 'KX_TERMEND'], eqflags=ef)
     for k, key, term, fl, pick, w, ef in [
       ('Y2S1_NO', '2026-12-30', 'Y2S1', dict(TW3), '「寒假我可能沒空。」', ['我們期末考完，你寒假來高雄。', '我家附近那個夜市，你還沒去過。', '……好。那夜市我自己去，拍給你看。'], {'KX_KHH': {'Y2W': 'no'}}),
       ('Y2S1_YES', '2026-12-30', 'Y2S1', dict(TW3), '「好。哪幾天？」', ['我家附近那個夜市，你還沒去過。', '你自己挑。我那幾天都在。'], {'KX_KHH': {'Y2W': 'yes'}}),
       ('Y2S2', '2027-06-25', 'Y2S2', dict(TW3), '「我盡量。」', ['你每次都說盡量。'], {'KX_KHH': {'Y2S': 'maybe'}}),
       ('Y3S1', '2027-12-28', 'Y3S1', dict(TW3), '「題目哪裡奇怪？」', ['老師說大家都寫大問題，只有我寫一個房間。', '……我覺得房間就是大問題。'], {'KX_KHH': {'Y3W': 'yes'}}),
       ('Y3S2_US', '2028-06-25', 'Y3S2', dict(USP), '「十二月就回來。」', ['八月你就去美國了。', '我知道。……我還是會算。'], {'KX_KHH': {'Y3S': 'count'}}),
       ('Y3S2_TW', '2028-06-25', 'Y3S2', dict(TW3), '「視訊也很好。」', ['你說的喔。每天十點，不准遲到。'], {'KX_KHH': {'Y3S': 'video'}}),
       ('Y4S1', '2028-12-28', 'Y4S1', dict(TWF), '「妳念妳的，我不吵妳。」', ['大四了。……我們期末考完，就剩一個學期。', '你不來，我才會一直傳訊息吵你。'], {'KX_KHH': {'Y4W': 'no'}}),
       ('Y5S1', '2030-01-10', 'Y5S1', dict(TWF), '「週末一定打。」', ['十四號以後，我就是律師了。……還要受訓。', '週六晚上十點。超過十點我就睡了。'], {'KX_Y5_CALL': 'sat'})]] + [
  # 真的時段（大二上）：[捷徑] 日子撥到 Y2S1 學期末時段第一天 20:36 → 20:45 她傳邀約、排出遊 → 快轉到那一天、時間照走、出發
  dict(id='R29_REAL', key='2026-12-01', h=12.0, zone='dorm', flags=dict(TW3), js=KXJ, steps=[('jump', "(w=>w?w.from:null)(TERMEND.windowOf('Y2S1'))", 20.6, '大二上學期末時段第一天'), ('until', 21.0), ('ffout', 'te_kx_Y2S1', 20)],
       pref=['出發：和可昕的學期末約會', '「好。哪幾天？」'], wantMsg=['考完了！', '這次換山上 政大正門六點', '我請'], want=['我家附近那個夜市，你還沒去過。', '你自己挑。我那幾天都在。'],
       cflags=['KX_KHH', 'KX_TERMEND'], eqflags={'KX_KHH': {'Y2W': 'yes'}}, jsok=[('出遊 te_kx_Y2S1', "(q=>q?CALENDAR.dateOf(q.day).key+' '+q.h+' '+q.state:null)(OUT.get(GAME.G,'te_kx_Y2S1'))", lambda x: isinstance(x, str) and x.endswith('done'))]),
  # 30. 寒假來高雄：答應了（Y2W yes）＝她回高雄第 3 天 21:00；最後一天還沒去＝那一則；「沒空」（no）＝第 5 天夜市照片；去了高雄第一次接人多一句
  #     [捷徑] 找她這一段在高雄的日子（KXKHH.run），日子撥過去
  dict(id='R30_D3', key='2026-12-26', h=12.0, zone='dorm', flags=dict(TW3), js=KXJ + " G.flags.KX_KHH={Y2W:'yes'};", steps=[('jump', "(R=>R?R.a+2:null)(%s)" % KXR, 20.9, '可昕回高雄第 3 天'), ('until', 21.4)], pref=[],
       wantMsg=['夜市週二、週五才有。', '你說要來的。'], jsok=[('她這一段在高雄（記錄）', KXRQ, lambda x: isinstance(x, dict) and x.get('key') == 'Y2W')]),
  dict(id='R30_LAST', key='2026-12-26', h=12.0, zone='dorm', flags=dict(TW3), js=KXJ + " G.flags.KX_KHH={Y2W:'yes'};", steps=[('jump', "(R=>R?R.b:null)(%s)" % KXR, 20.9, '可昕在高雄的最後一天'), ('until', 21.4)], pref=[],
       wantMsg=['（照片：夜市的燈）', '我自己來了。']),
  dict(id='R30_NO', key='2026-12-26', h=12.0, zone='dorm', flags=dict(TW3), js=KXJ + " G.flags.KX_KHH={Y2W:'no'};", steps=[('jump', "(R=>R?R.a+4:null)(%s)" % KXR, 20.9, '可昕回高雄第 5 天'), ('until', 21.4)], pref=[],
       wantMsg=['（照片：夜市的燈）', '這是你說沒空的那個夜市。'], noneMsg=['你說要來的。']),
  # 去了高雄：[捷徑] 直接演 HV.play（去高雄那一天）兩次——第一次接人以後多「夜市晚上才有。…」、第二次沒有（同一句只能演一次＝dup 檢查）
  dict(id='R30_PICK', key='2026-12-26', h=12.0, zone='dorm', flags=dict(TW3), js=KXJ + " G.flags.KX_KHH={Y2W:'yes'};", steps=[('jump', "(R=>R?R.a+3:null)(%s)" % KXR, 9.5, '可昕回高雄第 4 天'),
       ('jsrun', HVP, '去高雄找可昕（第一次）'), ('jsrun', HVP, '去高雄找可昕（第二次）')], pref=[], want=['夜市晚上才有。白天先帶你去別的地方。'], cflags=['KX_KHH_PICKED']),
  # 31. 大五上「週末一定打。」：受訓第一個週六（我們的日子第一格電話）22:00 手機提醒「打給可昕」；「受訓加油。」沒有
  #     [前置] 最小存檔（畢業以後）、和可昕交往中、KX_OUR_DAY 週六；[捷徑] 日子撥到 PGDATE.kxList 第一格電話那天 21:54
  dict(id='R31_SAT', minimal=True, key='2030-02-01', h=12.0, zone='campus', flags={'KX_Y5_CALL': 'sat', 'KX_OUR_DAY': {'day': 'sat', 'mode': 'call'}}, js=KX_L, steps=[('jump', KXCALL, 21.9, '受訓第一格電話那天'), ('until', 22.4)], pref=[],
       wantMsg=['打給可昕'], jsok=[('我們的日子（PGDATE.kxList，記錄）', "(()=>{ try{ return (PGDATE.kxList(GAME.G)||[]).slice(0,4).map(x=>(x.kind||'')+' '+CALENDAR.dateOf(x.day).key); }catch(e){ return 'ERR '+e; } })()", lambda x: True)]),
  dict(id='R31_CHEER', minimal=True, key='2030-02-01', h=12.0, zone='campus', flags={'KX_Y5_CALL': 'cheer', 'KX_OUR_DAY': {'day': 'sat', 'mode': 'call'}}, js=KX_L, steps=[('jump', KXCALL, 21.9, '受訓第一格電話那天'), ('until', 22.4)], pref=[],
       noneMsg=['打給可昕']),
  # 32. AA_402 柏翰、芯慈的閒聊：[前置] AA_402 以前的閒聊句記成說過；[前置／捷徑] meet＝照作息表找他／她在場景裡的時間、日子撥過去、直接進那一區；走過去說話（真的操作）
  dict(id='R32_BH_Y2S1', key='2026-10-15', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_bohan',45,30,10);" + STUSED('classmate_bohan', BHNEW),
       steps=[('meet', 'classmate_bohan', '2026-10-19', '2026-11-06'), ('talk', 'classmate_bohan'), ('meet', 'classmate_bohan', '+1', '+14'), ('talk', 'classmate_bohan'), ('meet', 'classmate_bohan', '+1', '+14'), ('talk', 'classmate_bohan')],
       pref=[], want=BHNEW[0:2]),
  dict(id='R32_BH_Y3S1', key='2027-09-20', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_bohan',45,30,10);" + STUSED('classmate_bohan', BHNEW),
       steps=[('meet', 'classmate_bohan', '2027-09-27', '2027-10-15'), ('talk', 'classmate_bohan'), ('meet', 'classmate_bohan', '+1', '+14'), ('talk', 'classmate_bohan')], pref=[], want=BHNEW[4:5], none=BHNEW[5:6]),
  dict(id='R32_BH_Y3S1_H4', key='2027-09-20', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_bohan',45,30,10); G.events.done.ev_bohan_third_floor=1;" + STUSED('classmate_bohan', BHNEW),
       steps=[('meet', 'classmate_bohan', '2027-09-27', '2027-10-15'), ('talk', 'classmate_bohan'), ('meet', 'classmate_bohan', '+1', '+14'), ('talk', 'classmate_bohan')], pref=[], want=BHNEW[4:6]),
  dict(id='R32_BH_Y4S2', key='2029-02-15', h=12.0, zone='dorm', flags=dict(TWF), js=Y4 + NOKX + " LV('classmate_bohan',45,30,10);" + STUSED('classmate_bohan', BHNEW),
       steps=[('meet', 'classmate_bohan', '2029-02-19', '2029-02-28'), ('talk', 'classmate_bohan'), ('meet', 'classmate_bohan', '2029-03-02', '2029-03-16'), ('talk', 'classmate_bohan')], pref=[],
       want=[BHNEW[11], BHNEW[10]], order=[BHNEW[11], BHNEW[10]]),
  dict(id='R32_XC_Y2S1', key='2026-09-14', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_xinci',45,30,10); if(G.events&&G.events.done) delete G.events.done.ev_xinci_double;" + STUSED('classmate_xinci', XCNEW),
       steps=[('meet', 'classmate_xinci', '2026-09-14', '2026-09-30'), ('talk', 'classmate_xinci'), ('meet', 'classmate_xinci', '+1', '+14'), ('talk', 'classmate_xinci')], pref=[], want=XCNEW[1:3], none=XCNEW[0:1]),
  dict(id='R32_XC_Y2S1_DBL', key='2026-09-14', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_xinci',45,30,10); G.events.done.ev_xinci_double=1;" + STUSED('classmate_xinci', XCNEW),
       steps=[('meet', 'classmate_xinci', '2026-09-14', '2026-09-30'), ('talk', 'classmate_xinci')], pref=[], want=XCNEW[0:1], none=XCNEW[1:2]),
  dict(id='R32_XC_Y3S2', key='2028-03-27', h=12.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_xinci',45,30,10);" + STUSED('classmate_xinci', XCNEW),
       steps=[('meet', 'classmate_xinci', '2028-03-27', '2028-04-14'), ('talk', 'classmate_xinci')], pref=[], want=XCNEW[7:8]),
  # 33. AA_403 這一段你來講：ev_grad_debate 選「不同意」（W3_STANCE no）演完 3 天以後，在 Café／總圖／萬才館找她說話先演；[前置] 4/10 演過 ev_grad_debate；週一 19:36 Café
  dict(id='R33_ORDER', key='2026-04-13', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD, steps=[('talk', 'heroine_05')], pref=['「先講他想保護什麼，再講他跳過哪一步。」'],
       want=GD0 + ['（你講了八分鐘。她一次都沒有打斷。）', '……順序對了。', '我第一次講給許老師聽的時候，是先講他錯在哪。老師說，那樣聽的人會先想反駁。'] + GDEND, none=[GD_D],
       nothree=True, cflags=['W3_TAUGHT'], eqflags={'W3_TAUGHT': 'order'}, cmem=[('heroine_05', 'W3_TAUGHT')]),
  dict(id='R33_DIRECT_D', key='2026-04-13', h=19.6, zone='cafe', flags=dict(TW3), js=SIS_D + SIS_GD, steps=[('talk', 'heroine_05')], pref=['「直接講他跳過的那一步。」'],
       want=GD0 + ['（你三分鐘就講完了。）', '快。', '……可是聽的人會問：那他為什麼要跳？下次你先想好這一題。'] + GDEND + [GD_D], nothree=True, eqflags={'W3_TAUGHT': 'direct'}),
  dict(id='R33_EARLY', key='2026-04-16', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD.replace("D('2026-04-10')", "D('2026-04-14')"), steps=[('talk', 'heroine_05')], pref=[], none=GD0[1:2], eqflags={'W3_TAUGHT': '(undefined)'}),
  dict(id='R33_DIFF', key='2026-04-13', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD.replace("W3_STANCE='no'", "W3_STANCE='diff'"), steps=[('talk', 'heroine_05')], pref=[], none=GD0[1:2], eqflags={'W3_TAUGHT': '(undefined)'}),
  dict(id='R33_LATE', key='2027-03-08', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD, steps=[('talk', 'heroine_05')], pref=[], none=GD0[1:2], eqflags={'W3_TAUGHT': '(undefined)'}),
  # 34. AA_313 第 4、5 節抽看五場（照 tests/aa313_s4s5_unit.js）
  #   ① 語彤總圖門口（[捷徑] 直接開演 ev_library_door_phone）：「你看了一下手機，告訴她時間。」是旁白；「點個頭就走」沒有自我介紹
  dict(id='R34_YT_DOOR', key='2025-10-01', h=18.2, zone='campus', js='', steps=[('runev', 'ev_library_door_phone')], pref=['「要不要先進去等？裡面有冷氣。」'],
       want=['總圖門口有個女生一直在看手機，看一眼、收起來、再看一眼。', '……不好意思，現在幾點？', '你看了一下手機，告訴她時間。', '她又遲到了。高中同學，每次都這樣。', '陳語彤。……你是法律系的吧。你們系的人走路都很快。'],
       jsok=[('「你看了一下手機，告訴她時間。」是旁白（說話的人空白）', NARRQ % json.dumps('你看了一下手機，告訴她時間。'), lambda x: isinstance(x, list) and len(x) >= 1 and all(not n for n in x))]),
  dict(id='R34_YT_DOOR_NOD', key='2025-10-01', h=18.2, zone='campus', js='', steps=[('runev', 'ev_library_door_phone')], pref=['（點個頭就走）'],
       want=['你看了一下手機，告訴她時間。'], none=['陳語彤。……你是法律系的吧。你們系的人走路都很快。']),
  #   ② 語彤大三跨年（交往中）：00:01 她打電話來（接起來）
  dict(id='R34_YT_NYE3', key='2027-12-31', h=22.8, zone='dorm', flags=dict(TW3), js=YTD, steps=[('until', 24.4)], pref=['接起來', '出發：跨年：宿舍頂樓'],
       want=['（電話。她那邊很安靜。）', '……新年快樂。', '店裡今天提早收。阿姨說跨年沒有人吃麵。', '你那邊好吵。……好，你去看。我掛了。'], cflags=['YT_NYE_CALL_Y3'], eqflags={'YT_NYE_CALL_Y3': True},
       jsok=[('電話排在 1/1 00:01', "(q=>q?CALENDAR.dateOf(q.day).key+' '+(+q.h).toFixed(3)+' '+q.verb:null)(OUT.get(GAME.G,'yt_nye_call_y3'))", '2028-01-01 0.017 接起來')]),
  #   ③ 阿哲叫「哥」（大二初一 11:00 麵店團群組；ZHE_CALLS_GE 有／沒有）
  dict(id='R34_ZHE_GE', key='2027-02-06', h=10.9, zone='dorm', flags=dict(TW3, ZHE_CALLS_GE=True), js=NOODLE, asks={'cny_noodle_y2_reply': '（傳家裡的年夜飯照片）'}, steps=[('until', 11.5)], pref=[],
       wantMsg=['我包到第四十個就被趕出廚房。……你們在幹嘛？', '哥，你家也太多菜！', '左下角那盤是什麼？'], noneMsg=['你家也太多菜！']),
  dict(id='R34_ZHE_NOGE', key='2027-02-06', h=10.9, zone='dorm', flags=dict(TW3), js=NOODLE + " delete G.flags.ZHE_CALLS_GE;", asks={'cny_noodle_y2_reply': '新年快樂。Alison'}, steps=[('until', 11.5)], pref=[],
       wantMsg=['連你也！', '懂我。'], noneMsg=['哥懂我。']),
  #   ④ 語 3：2026-12-19 22:00 Alison 打電話來（認識 Alison、這天沒去麵店）
  dict(id='R34_YU_CALL', key='2026-12-19', h=21.4, zone='dorm', flags=dict(TW3, met_yu=True), js=NOKX + NOODLE, steps=[('until', 22.4)], pref=['接起來：Alison 打電話來', '「恭喜。」'],
       want=['（電話。她那邊很吵，有人在唱歌。）', '欸欸欸你今天怎麼沒來！', '……跟你說一件事。我跟阿哲在一起了。', '你不要笑。我聽得到。', '謝謝！！……阿哲在旁邊，他叫你明天來麵店。'],
       cflags=['YU_ZHE_TOLD'], eqflags={'YU_ZHE_TOLD': 'call'}, cmem=[('yu', 'IMPORTANT_CONVERSATION')]),
  #   ⑤ 開學第一週阿哲問吃什麼（[捷徑] 直接開演 ev_zhe_w1_dorm）：選項「校門對面那排有一間麵店，便宜，份量也夠。」
  dict(id='R34_ZHE_W1', key='2025-09-01', h=7.5, zone='dorm', js='', steps=[('runev', 'ev_zhe_w1_dorm')], pref=['「校門對面那排有一間麵店，便宜，份量也夠。」'],
       want=['中午吃什麼？我這三天都吃便利商店。', '校門對面那排有一間麵店，便宜，份量也夠。', '麵店喔，好。在哪？'], none=['阿鳳麵店'], cflags=['ZHE_W1_NOODLE'], eqflags={'ZHE_W1_NOODLE': True}),
]
SCENS = SCENS + R4
# ---------------------------------------------------------------- 清單第 38～42 項（LAWWW-B BB_SIS_B6_1023.md；開發分支 d23380d5e；BB-B 10-23）
#   38 順手的事（系統）、39 八則（瀏覽器走得完的：SQ01、SQ02、SQ03、SQ08）、40 公園的貓被子晴收養、41 總圖借書、42 跨年認識判斷＋Alison 大二探班
NGRP = " PHONE.join(G,'noodle_team','麵店團');"   # [前置] 在麵店團群組
SQROLL = " SIDEQ.roll=()=>0;"   # 【捷徑】「偶爾」（35%）固定抽中：每一則都要在一次裡出得來（機率本身 tests/aa397_sideq_unit.js 測）
def EATN(key, n): return " EAT.rec(G).n[%s]=%d;" % (json.dumps(key, ensure_ascii=False), n)   # [前置] 這間店點過 n 次（這一次點完＝第 n+1 次；5 次起店員認得你）
CATN = " PARK.rec(G).catName='麻糬';"   # [前置] 公園的貓取過名字（麻糬）
SQ08DONE = " SIDEQ.rec(G).SQ08={state:'done',step:'done',day:D('2026-10-05'),posted:D('2026-10-09'),doneDay:D('2026-10-09')};"   # [前置] SQ08 餵貓表早就貼了
TODAYQ = "(async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms)); const p=document.getElementById('phone'); if(!p||p.classList.contains('hide')||getComputedStyle(p).display==='none'){ const b=document.getElementById('btnPhone'); if(b) b.click(); await W(1200); } const t=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(t) t.click(); await W(1200); const body=document.getElementById('phoneBody'); const s=body?body.innerText:''; const c=document.getElementById('btnPhoneClose'); if(c) c.click(); await W(500); return s; })()"   # 手機「今天」那一頁的字（打開手機、點「今天」、讀完關掉）
def SQST(i): return "(r=>r?r.state+'/'+r.step:null)(SIDEQ.get(GAME.G,%s))" % json.dumps(i)
ENTER = "(async([k,h,z])=>{ const G=GAME.G; G.day=STORY.dayOfKey(k); G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); try{ if(G.zone!==z) await GAME.enter(z); }catch(e){ return 'ERR '+e; } return true; })(%s)"   # 【捷徑】日子撥到 k h、直接進 z（中間幾天不走）
def ENT(k, h, z): return ('jsrun', ENTER % json.dumps([k, h, z]), '日子撥到 %s %.2f、直接進 %s' % (k, h, z))
SQ01_OPEN = ['有人給我一顆星。說湯是冷的。', '……我們乾麵沒有湯。']; SQ01_REV = '★☆☆☆☆　湯是冷的。等了十分鐘。不推。'
SQ_YN = '「要我幫忙嗎？」｜「……加油。」'; SQ01_R = '「謝謝指教，乾麵本來就沒有湯，下次可以點餛飩湯。」｜「您點的是乾麵。」｜不回。'
SQ01_DONE = ['★★★★☆　原來乾麵沒有湯，是我點錯了。老闆回得好有禮貌。', '（他的上一則評價寫的是：『大一，第一次自己來公館吃飯。』）']
SQ02_OPEN = ['（她把一張紙壓在收銀機下面。）', '老闆說上禮拜打破的杯子，要從我薪水扣。三個，四百五。']
SQ08_OPEN = ['你也是買給公園那隻的？', '今天你是第四個。']
LIN = ('usep', '^點餐$')   # wz_lin 裡的按鈕（zones3d.js CUST.lin）
TEA = ('usep', '^買一杯飲料$'); CVS = ('usep', '^結帳'); NOTICE = ('usep', '^看公布欄$')
SQ2 = " { const R=SIDEQ.rec(G), t=SIDEQ.termKey(G); R.SQ02={state:'open',step:'wait',day:G.day-3,term:t,wait:G.day+30}; R.SQ04={state:'open',step:'ask',day:G.day-3,term:t}; }"   # [前置] 已經掛著兩則（別家店）
FAFUD = "(()=>{ const q=(OUT.rec(GAME.G)||[]).find(x=>x.ev==='ev_sq02_fafu'); return q?q.day:null; })()"
FAFUD1 = "(()=>{ const q=(OUT.rec(GAME.G)||[]).find(x=>x.ev==='ev_sq02_fafu'); return q?q.day+1:null; })()"
CAT_EV0 = ['（鞦韆旁邊，子晴蹲在石桌前面，手機的手電筒照著桌子底下。）', '牠三天沒吃了。我每天都有看那張表。', '……我家有電暖器。']
CAT_EVB = ['（牠很輕。比你記得的輕很多。）', '（她把外套脫下來，把牠包起來。牠沒有掙扎。）', '我做的那隻貓，是照牠畫的。你知道嗎。', '（她沒有等你回答。）']
CAT_COLD = '（牠縮在石桌下面，沒有出來。罐頭放在牠面前，牠只聞了一下。）'; CAT_FUR = '（圓椅上有一點橘白色的毛，被風吹掉了一半。）'
CAT_VET = ['（照片：獸醫院的診療台，牠縮在毛巾裡）', '感冒，老了。醫生說冬天不要待在外面。']
ADOPT = '「麻糬已經被領養了。謝謝大家這幾年的照顧。牠現在在一個有電暖器的家。——里長」'; ADOPT_CHESS = '被一個常來盪鞦韆的女生帶走了。'
TREE = ('usep', '^坐在老樹下的圓椅$')   # 走進公園、在老樹下坐一下（20 分鐘）再站起來＝人在公園裡
L1_LINE = '這週的案例不用買書。總圖有一本《民法案例演習：總則篇》，看第二章就好。'; DESK = ('usep', '^服務台$')
DESK_LOOK = '服務台：借書、還書、預約、館際合作都在這裡辦。館員抬頭看了你一眼，又低頭繼續處理一疊還回來的書。'
LATE1 = '這本逾期了喔。還了就好。'
def LKNOW(*ids): return ''.join(" G.flags.LOAN_KNOW_%s=G.day-10;" % i for i in ids)
def LOANS_(*bd): return " G.loans=[%s];" % ','.join("{book:'%s',day:G.day-%d}" % (b, d) for b, d in bd)   # [前置] 借了的書（d＝幾天前借的）
L1IN = "(()=>{ void (async()=>{ GAME.sceneBegin(); try{ await LOANS.inClass(GAME,{c:{id:'civ_general'},week:4},{name:'周教授'},{}); }catch(e){ console.warn('L1',e); } finally{ GAME.sceneEnd(); } })(); return true; })()"
LOANQ = "(()=>(GAME.G.loans||[]).map(l=>l.book+'@'+(GAME.G.day-l.day)+(l.late!=null?'/late'+(GAME.G.day-l.late):'')))()"
FORGET2 = " for(const id of ['heroine_01','classmate_xinci']){ const M=G.social.mem[id]; if(M) G.social.mem[id]=M.filter(m=>m.tag!=='FIRST_MET'); } G.flags.dating_heroine_01=false;"   # [前置] 不認識以安、芯慈
KNOW2 = " LV('heroine_01',45,30,20); SOCIAL.remember('classmate_xinci','FIRST_MET','');"   # [前置] 認識以安、芯慈（芯慈：使用者存檔本來就認識）
NYEG = "(t=>(GAME.G.msgs||[]).filter(m=>m.tag===t).map(m=>(m.from||'')+'：'+m.text))(%s)"
NY3_ASKK = ['十一點半，頂樓。以安說她要來。', '我會到。', '我家吃完飯就過去，可能晚一點。']
NY3_XC = ['（十一點五十，芯慈從樓梯間上來，還有點喘。）', '捷運好多人。', '我要趕捷運。']; NY3_AN = ['以安，妳行李收了嗎？', '還沒。三月才走。', '我也回去了。']
NY3_ALL = ['（十一點半。阿哲和 Alison 已經在了，地上放著一袋鹹酥雞。）', '（倒數是 Alison 起的頭，數到三，大家才跟上。）', '下禮拜吃飯喔。']
NY3_PH = ['📷（頂樓的合照，五個人，芯慈站在最旁邊）', '今年人到得最齊']
NY4_XC = ['（十一點半。芯慈比你們都早到，已經把野餐墊鋪好了。）', '去年我就覺得這裡很冷。', '每年都冷。', '（倒數是芯慈起的頭，比電視早了一秒。）']
NY4_ALL = ['今年看得到嗎？', '看得到一點。', '回去睡覺。']; NY4_PH = ['📷（野餐墊上的五個人，芯慈坐在正中間）', '今年我最早到。']
NY4_ASK = ['十一點半，頂樓。', '宿委會今年也開頂樓。訪客一樓登記，十二點半前要走。', '最後一年了耶', '所以要來']
YUD = "(()=>{ void (async()=>{ GAME.sceneBegin(); try{ await TERMEND.dinner(GAME,{te:{who:'yu',kind:'friend',term:'Y2S2'}}); }catch(e){ console.warn('YUD',e); } finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GAME.sceneEnd(); } })(); return true; })()"
YUQ = "(q=>q?CALENDAR.dateOf(q.day).key+' '+q.h+' '+q.state:null)(OUT.get(GAME.G,'c15_yu_camp2'))"
C02Q = "(typeof VAC!=='undefined'&&VAC.enrolled)?!!VAC.enrolled(GAME.G,'C02','Y2'):'沒有 VAC'"
CAMP2 = ['（操場上，一隊小朋友排成一排，跟在 Alison 後面。她脖子上掛著一個哨子。）', '我是小隊長了！……他們都不聽我的。', '（午餐的時候，一個小朋友伸手要拿她的雞塊。她早就把雞塊藏在碗底。）']
CAMP_JUMP = ('jump', "STORY.dayOfKey('2027-07-17')", 11.0, '探班那天早上')
R5 = [
  # 38. 順手的事（系統）：店員認得你（第 5 次）才出；「要我幫忙嗎？」＝手機「今天」多一格；「……加油。」＝這學期不再出；一天一則；最多兩則；過期不扣數值
  dict(id='SQ38_KNOW4', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 3) + SQROLL, steps=[LIN], pref=['乾麵（小）', '「要我幫忙嗎？」'],
       none=SQ01_OPEN + [SQ_YN], jsok=[('SQ01 沒有掛（第 4 次，店員還不認得你）', SQST('SQ01'), None)]),
  dict(id='SQ38_HELP', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL, steps=[LIN], pref=['乾麵（小）', '「要我幫忙嗎？」', '「謝謝指教'],
       want=SQ01_OPEN + [SQ_YN, SQ01_REV, SQ01_R, 'TOAST:📝 順手的事：林家乾麵：一星評價'],
       jsok=[('SQ01 掛著、等下次去', SQST('SQ01'), 'open/wait'),
             ('手機「今天」多一格「順手的事」：標題、下一步', TODAYQ, lambda s: isinstance(s, str) and '順手的事' in s and '林家乾麵：一星評價' in s and '下次去林家乾麵' in s)]),
  dict(id='SQ38_NO', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL, steps=[LIN, ('addday', 1), LIN], pref=['乾麵（小）', '「……加油。」'],
       want=SQ01_OPEN + [SQ_YN], none=['TOAST:📝 順手的事', SQ01_REV],
       jsok=[('「……加油。」＝不掛（declined）、隔天同一學期不再出', SQST('SQ01'), lambda x: isinstance(x, str) and x.startswith('declined')),
             ('手機「今天」沒有「順手的事」', TODAYQ, lambda s: isinstance(s, str) and '順手的事' not in s)]),
  dict(id='SQ38_DAYONCE', key='2026-10-06', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + EATN('巷口茶飲', 4) + SQROLL,
       steps=[LIN, ('usep', '^離開林家乾麵$'), TEA], pref=['乾麵（小）', '「要我幫忙嗎？」', '「謝謝指教', '紅茶'],
       want=SQ01_OPEN, none=SQ02_OPEN, jsok=[('同一天別家店（巷口茶飲）不再問', SQST('SQ02'), None)]),
  dict(id='SQ38_MAX2', key='2026-10-06', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL + SQ2, steps=[LIN], pref=['乾麵（小）', '「要我幫忙嗎？」'],
       none=SQ01_OPEN, jsok=[('已經兩則：林家不出第三則', SQST('SQ01'), None), ('手機「今天」兩則都在', TODAYQ, lambda s: isinstance(s, str) and s.count('☐') == 2)]),
  dict(id='SQ38_LAPSE', key='2026-10-25', h=21.0, zone='cvs', flags=dict(TW3), js=EATN('公館的便利商店', 5) + SQROLL + CATN + " SIDEQ.rec(G).SQ08={state:'open',step:'board',day:D('2026-10-05'),term:'Y2S1',by:D('2026-10-19')};",
       steps=[CVS, CVS], pref=['飯糰'], want=['餵貓那張表，我自己貼了。'], dmoney=-70,
       jsok=[('過了期限＝lapsed（店員交代一次）', SQST('SQ08'), lambda x: isinstance(x, str) and x.startswith('lapsed'))]),   # 兩個飯糰 70 元，沒有別的扣錢
  # 39. 八則：SQ01（林家）、SQ02（巷口茶飲＋法服）、SQ03（冰菓室價目板）、SQ08（便利商店＋公布欄＋象棋阿伯＋蘇姨）；SQ04～SQ07（118 巷四家）這一版沒寫
  dict(id='SQ39_SQ01', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL,
       steps=[LIN, ('addday', 1), LIN, ('addday', 1), LIN, ('usep', '^看菜單$')], pref=['乾麵（小）', '「要我幫忙嗎？」', '「謝謝指教'],
       want=SQ01_OPEN + [SQ01_REV] + SQ01_DONE + ['小的，不加辣。……字是我寫的，醜。', '「乾麵沒有湯」', 'TOAST:📝 順手的事：林家乾麵：一星評價（做完了）'],
       jsok=[('SQ01 做完', SQST('SQ01'), 'done/done')]),
  dict(id='SQ39_SQ01_CURT', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL, steps=[LIN, ('addday', 1), LIN], pref=['乾麵（小）', '「要我幫忙嗎？」', '「您點的是乾麵。」'],
       want=['★★☆☆☆　好吧。'], none=SQ01_DONE),
  dict(id='SQ39_SQ01_NONE', key='2026-03-03', h=12.0, zone='wz_lin', flags=dict(TW3), js=EATN('林家乾麵', 4) + SQROLL, steps=[LIN, ('addday', 1), LIN], pref=['乾麵（小）', '「要我幫忙嗎？」', '不回。'],
       want=['（隔天，評價下面多了一則老闆的回覆，三個字：『沒有湯。』）'], none=SQ01_DONE),
  dict(id='SQ39_SQ02', key='2026-10-05', h=15.0, zone='wenzhou', flags=dict(TW3), js=EATN('巷口茶飲', 4) + SQROLL,
       steps=[TEA, ('jump', FAFUD, 9.0, '法服初談那天早上'), ('until', 10.4), ('jump', FAFUD1, 15.0, '法服隔天下午'), TEA], pref=['紅茶', '「要我幫忙嗎？」', '「要不要帶去法服問？」', '出發：法服'],
       want=SQ02_OPEN + ['可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。', '（她回去跟老闆說了。老闆說：「我只是嚇嚇妳，誰叫妳一直講手機。」最後沒扣。）', '半糖少冰，對吧。……今天不算錢。'],
       dmoney=-30, jsok=[('SQ02 做完', SQST('SQ02'), 'done/done')]),   # 第一杯 30 元，法服之後那一杯不算錢
  dict(id='SQ39_SQ03', key='2027-07-10', h=14.0, zone='wenzhou', flags=dict(TW3), js=EATN('夏日冰菓室', 4) + SQROLL, steps=[('usep', '^買一碗冰$'), ('usep', '^看價目板$')], pref=['紅豆牛奶冰', '「要我幫忙嗎？」'],
       want=['價目板曬到看不到了。你們讀書人字好看，幫我寫一下。', '（你寫到芒果冰那一行，老闆娘從冰櫃後面探出頭。）', '今年芒果貴。……可是寫上去不好看，你寫原來的價錢。', '（價目板是新的，芒果冰的價錢是舊的。）',
             'TOAST:📝 順手的事：夏日冰菓室：褪色的價目板（做完了）'],
       jsok=[('SQ03 做完、自己寫（以安不在）', "(r=>r?r.state+'/'+r.writer:null)(SIDEQ.get(GAME.G,'SQ03'))", 'done/me')]),
  dict(id='SQ39_SQ08', key='2026-10-05', h=21.0, zone='cvs', flags=dict(TW3), js=EATN('公館的便利商店', 5) + SQROLL + CATN + " G.daily.catCansN=2;",
       steps=[CVS, ENT('2026-10-06', 16.0, 'wenzhou'), NOTICE, ENT('2026-10-07', 9.0, 'wenzhou'), ('usep', '象棋'), ENT('2026-10-07', 14.0, 'wz_teahouse'), ('usep', '^喝茶$'),
              ENT('2026-10-08', 21.0, 'cvs'), CVS, ENT('2026-10-09', 16.0, 'wenzhou'), NOTICE, ENT('2026-10-10', 16.0, 'wenzhou'), NOTICE],
       pref=['1:小罐貓罐頭', '「要我幫忙嗎？」', '餵貓表', '不看了'],   # BB-B 19:4x：每次結帳只買一罐（買完會再問，原本一直買）
       want=SQ08_OPEN + ['（沒有任何餵貓的說明。）', '貓？我每天帶一點魚乾。牠比我準時。', '我中午會放一碗水。……牠不吃我的飯，只喝水。', '（大家都在餵。）', '我做一張表，你拿去貼。', '（你把表貼在公布欄的角落，用了四個圖釘。）',
             'TOAST:📝 順手的事：便利商店：誰在餵公園的貓（做完了）', '（一格一天，誰餵誰簽名。）', '（有人在表的最下面加了一行：「星期日我來。——里長」）'],
       once=SQ08_OPEN + ['（沒有任何餵貓的說明。）', '（大家都在餵。）', '我做一張表，你拿去貼。', '（你把表貼在公布欄的角落，用了四個圖釘。）'],
       jsok=[('SQ08 做完', SQST('SQ08'), 'done/done')]),
  # 40. 公園的貓被子晴收養（2028-12-11～17）
  dict(id='CAT40_COLD', key='2028-12-12', h=16.0, zone='wenzhou', flags=dict(TWF), js=Y4 + NOKX + CATN + SQ08DONE, steps=[('usep', '^麻糬$'), NOTICE], pref=['餵貓表'],
       want=[CAT_COLD, '（那一週的格子都寫著「沒吃」。）'], once=[CAT_COLD],
       jsok=[('寒流：catCold、catUnder（3D 縮在石桌下）', "[PARK.catCold(GAME.G),PARK.catUnder(GAME.G)]", [True, True])]),
  dict(id='CAT40_NIGHT_B', key='2028-12-14', h=21.75, zone='wenzhou', flags=dict(TWF), js=Y4 + ZQF + CATN + SQ08DONE,
       steps=[TREE, ('until', 22.75), ('jump', "STORY.dayOfKey('2028-12-15')", 11.8, '隔天中午前'), ('until', 12.3), ('jump', "STORY.dayOfKey('2028-12-17')", 16.0, '12/17 下午'), NOTICE, ('usep', '^看圓椅$')],
       pref=['「我幫妳抱。」', '領養'], want=CAT_EV0 + CAT_EVB + [ADOPT, CAT_FUR], wantMsg=CAT_VET, none=['先帶去看醫生。……之後再說。'], once=CAT_EV0 + CAT_EVB + [CAT_FUR],
       cflags=['ZQ_CAT_NIGHT'], eqflags={'ZQ_CAT_NIGHT': True},
       jsok=[('收養以後：catGone、按鈕「看圓椅」、看過一次就藏起來', "[PARK.catGone(GAME.G),PARK.catLabel(GAME.G),PARK.catHidden(GAME.G)]", [True, '看圓椅', True])]),
  dict(id='CAT40_NIGHT_A', key='2028-12-14', h=21.75, zone='wenzhou', flags=dict(TWF), js=Y4 + ZQF + CATN + SQ08DONE, steps=[TREE, ('until', 22.75)], pref=['「妳要帶牠回去？」'],
       want=CAT_EV0 + ['先帶去看醫生。……之後再說。'] + CAT_EVB[1:], none=CAT_EVB[:1], cflags=['ZQ_CAT_NIGHT'], eqflags={'ZQ_CAT_NIGHT': True}),
  dict(id='CAT40_STRANGER', key='2028-12-14', h=21.75, zone='wenzhou', flags=dict(TWF), js=Y4 + NOKX + CATN + SQ08DONE,
       steps=[TREE, ('until', 22.75), ('jump', "STORY.dayOfKey('2028-12-17')", 9.0, '12/17 早上'), ('usep', '象棋'), NOTICE], pref=['領養'],
       want=[ADOPT_CHESS, ADOPT], none=CAT_EV0[:1], noneMsg=CAT_VET, once=[ADOPT_CHESS],
       jsok=[('不認識子晴：12/14 23:00 以後貓也不在了（按鈕「看圓椅」）', "[PARK.catGone(GAME.G),PARK.catLabel(GAME.G)]", [True, '看圓椅'])]),
  dict(id='CAT40_PHOTO_D', key='2029-02-03', h=11.8, zone='dorm', flags=dict(TWF), js=Y4 + ZQD + CATN + " G.flags.ZQ_CAT_NIGHT=true;", asks={'sqcat_visit': '（去看貓）'}, steps=[('until', 12.3), ('until', 12.7)], pref=[],
       wantMsg=['牠睡在電暖器前面一整天。我也是。'],
       jsok=[('交往中：回「（去看貓）」＝隔天 14:00「去看貓」（她家）', "(q=>q?CALENDAR.dateOf(q.day).key+' '+q.h+' '+q.place:null)(OUT.get(GAME.G,'sq_cat_visit2'))", '2029-02-04 14 子晴的家')]),
  dict(id='CAT40_PHOTO_F', key='2029-02-03', h=11.8, zone='dorm', flags=dict(TWF), js=Y4 + ZQF + CATN + " G.flags.ZQ_CAT_NIGHT=true;", steps=[('until', 12.3)], pref=[],
       wantMsg=['牠睡在電暖器前面一整天。我也是。'], jsok=[('沒交往：照片不能回「（去看貓）」', ASKOPT % json.dumps('sqcat_visit1'), None)]),
  # 41. 總圖借書（總圖大廳的服務台）
  dict(id='LOAN41_NONE', key='2025-10-08', h=14.0, zone='library_hall', flags=dict(TW3), js='', steps=[DESK], pref=[], want=[DESK_LOOK], none=['借《', 'TOAST:借了'],
       jsok=[('舊存檔（沒有 G.loans）＝沒借過', LOANQ, [])]),
  dict(id='LOAN41_L1', key='TERMDAY:Y1S1:4:4', h=13.0, zone='library_hall', flags=dict(TW3), js='', steps=[('jsrun', L1IN, 'LOANS.inClass（大一上民總第 4 週課堂那一句）'), DESK], pref=['借《民法案例演習'],
       want=[L1_LINE, 'TOAST:借了《民法案例演習：總則篇》'],
       jsok=[('借了 L1（今天）', LOANQ, ['L1@0']), ('房間書桌多一本', ROOMX % json.dumps('借來的《民法案例演習：總則篇》'), lambda x: isinstance(x, list) and len(x) == 1)]),
  dict(id='LOAN41_MAX2', key='2026-10-15', h=14.0, zone='library_hall', flags=dict(TW3), js=LKNOW('L1', 'L2', 'L3') + LOANS_(('L1', 5), ('L2', 5)), steps=[DESK], pref=['借《判決怎麼讀》'],
       want=['還《民法案例演習：總則篇》', '還《憲法解釋的故事》', 'TOAST:一次最多借兩本。'], jsok=[('還是兩本', LOANQ, ['L1@5', 'L2@5'])]),
  dict(id='LOAN41_DUE', key='2026-10-15', h=8.7, zone='dorm', flags=dict(TW3), js=LKNOW('L2') + LOANS_(('L2', 25)), steps=[('until', 9.3)], pref=[],
       wantMsg=['總圖：《憲法解釋的故事》三天後到期。'], countMsg={'總圖：《憲法解釋的故事》三天後到期。': 1}),
  dict(id='LOAN41_LATE_LEAVE', key='2026-10-15', h=14.0, zone='library_hall', flags=dict(TW3), js=LKNOW('L1') + LOANS_(('L1', 30)), steps=[DESK, DESK], pref=['（離開）'],
       want=[LATE1], dmoney=0, jsok=[('逾期記一次、書還在', LOANQ, ['L1@30/late0'])]),
  dict(id='LOAN41_LATE_RET', key='2026-10-15', h=14.0, zone='library_hall', flags=dict(TW3), js=LKNOW('L1') + LOANS_(('L1', 30)), steps=[DESK], pref=['還《民法案例演習'],
       want=[LATE1, '這本這學期很多人借。下一個已經在等了。', 'TOAST:還了《民法案例演習：總則篇》'], dmoney=0,
       jsok=[('還了（LOAN_RET.L1＝今天）', "(r=>r&&r.L1!=null?GAME.G.day-r.L1:null)(GAME.G.flags.LOAN_RET)", 0), ('手上沒有書', LOANQ, [])]),
  dict(id='LOAN41_L2_KNOW', key='2025-11-12', h=21.5, zone='wancai', flags=dict(TW3), js=" LV('heroine_01',45,30,20);", steps=[('runev', 'ev_loan_l2_know')], pref=[],
       want=['總圖有一本《憲法解釋的故事》。我高中就讀過。很好讀。'], jsok=[('知道 L2', "!!LOANS.known(GAME.G,'L2')", True)]),
  dict(id='LOAN41_L2_BACK', key='2025-11-19', h=21.5, zone='wancai', flags=dict(TW3), js=" LV('heroine_01',45,30,20);" + LKNOW('L2') + " G.flags.LOAN_RET={L2:G.day-2};", steps=[('runev', 'ev_loan_l2_back')], pref=[],
       want=['讀完了？……第六章那個案子，我想下次講。'],
       jsok=[('【讀資料】條件：還書以後（今天 > 還書那天）', "!!STORY_EVENTS.find(e=>e.id==='ev_loan_l2_back').prereq.custom(GAME.G)", True)]),
  dict(id='LOAN41_L3_KNOW', key='2026-10-14', h=15.0, zone='lawlib', flags=dict(TW3), js=SISF, steps=[('runev', 'ev_sis_db_taught')], pref=[],
       want=['總圖有一本《判決怎麼讀》。借舊版，新版把第三章刪了。'], jsok=[('知道 L3', "!!LOANS.known(GAME.G,'L3')", True)]),
  dict(id='LOAN41_L3_BACK_A', key='2027-03-08', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD + LKNOW('L3') + " G.flags.LOAN_RET={L3:G.day-7};", steps=[('talk', 'heroine_05'), ('talk', 'heroine_05')], pref=['「讀了。」'],
       want=['第三章讀了嗎。', '嗯。那章是我大一讀的。'], none=['那你借太早了。'], jsok=[('只問一次（LOAN_L3_ASKED）', "GAME.G.flags.LOAN_L3_ASKED===GAME.G.day", True)]),
  dict(id='LOAN41_L3_BACK_B', key='2027-03-08', h=19.6, zone='cafe', flags=dict(TW3), js=SISF + SIS_GD + LKNOW('L3') + " G.flags.LOAN_RET={L3:G.day-7};", steps=[('talk', 'heroine_05')], pref=['「還沒。」'],
       want=['第三章讀了嗎。', '那你借太早了。'], none=['嗯。那章是我大一讀的。']),
  dict(id='LOAN41_L4_KNOW', key='2026-10-20', h=20.6, zone='dorm', flags=dict(TW3), js=" LV('heroine_02',45,30,20); G.contacts=G.contacts||{}; G.contacts.heroine_02=D('2026-09-20'); SOCIAL.remember('heroine_02','ZR3_SUBTITLE','');",
       steps=[('until', 21.3)], pref=[], wantMsg=['總圖有一本講字幕的書。《一行十四個字》。', '……我大一借了三次。'], jsok=[('知道 L4', "!!LOANS.known(GAME.G,'L4')", True)]),
  dict(id='LOAN41_L4_BACK', key='2026-11-10', h=19.5, zone='library_hall', flags=dict(TW3), js=" LV('heroine_02',45,30,20); G.contacts=G.contacts||{}; G.contacts.heroine_02=D('2026-09-20');" + LKNOW('L4') + LOANS_(('L4', 9)),
       steps=[DESK, ('until', 21.3)], pref=['還《一行十四個字》'], want=['TOAST:還了《一行十四個字》'], wantMsg=['你真的借了。……第八章是我最喜歡的。']),
  dict(id='LOAN41_L4_UK', key='2027-10-12', h=19.5, zone='library_hall', flags=dict(TW3), js=" LV('heroine_02',45,30,20); G.contacts=G.contacts||{}; G.contacts.heroine_02=D('2026-09-20');" + LKNOW('L4') + LOANS_(('L4', 9)),
       steps=[DESK, ('until', 21.3)], pref=['還《一行十四個字》'], want=['TOAST:還了《一行十四個字》'], noneMsg=['你真的借了。……第八章是我最喜歡的。']),   # 她在英國（2027-09-02～2028-02-18）不傳
  # 42. 跨年認識判斷（大三、大四）：不認識以安、芯慈＝群組只有阿哲兩則、頂樓沒有她們的句子、沒有寫著芯慈的照片；認識＝照舊
  dict(id='NY42_Y3_KNOW_GO', key='2027-12-31', h=20.9, zone='dorm', flags=dict(TW3), js=NOKX + NGRP + KNOW2, steps=[('until', 24.3)], pref=['出發：跨年'],
       wantMsg=NY3_ASKK, want=NY3_ALL + NY3_AN + NY3_XC),
  dict(id='NY42_Y3_STRANGER_GO', key='2027-12-31', h=20.9, zone='dorm', flags=dict(TW3), js=NOKX + NGRP + FORGET2, steps=[('until', 24.3)], pref=['出發：跨年'],
       want=NY3_ALL, none=NY3_AN + NY3_XC, noneMsg=NY3_ASKK,
       jsok=[('群組只有阿哲兩則', NYEG % json.dumps('nye_y3_ask'), ['zhe：十一點半，頂樓。', 'zhe：宿委會今年也開頂樓。訪客一樓登記，十二點半前要走。'])]),
  dict(id='NY42_Y3_KNOW_MISS', key='2027-12-31', h=20.9, zone='dorm', flags=dict(TW3), js=NOKX + NGRP + KNOW2, steps=[('until', 24.3)], pref=['不去了'],
       wantMsg=NY3_ASKK + NY3_PH, none=NY3_ALL[:1]),
  dict(id='NY42_Y3_STRANGER_MISS', key='2027-12-31', h=20.9, zone='dorm', flags=dict(TW3), js=NOKX + NGRP + FORGET2, steps=[('until', 24.3)], pref=['不去了'],
       noneMsg=NY3_ASKK + NY3_PH, jsok=[('沒有寫著芯慈的照片', NYEG % json.dumps('nye_y3_photo'), [])]),
  dict(id='NY42_Y4_KNOW_GO', key='2028-12-31', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + NOKX + NGRP + KNOW2, steps=[('until', 24.3)], pref=['出發：跨年'],
       wantMsg=NY4_ASK, want=NY4_XC + NY4_ALL),
  dict(id='NY42_Y4_STRANGER_GO', key='2028-12-31', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + NOKX + NGRP + FORGET2, steps=[('until', 24.3)], pref=['出發：跨年'],
       wantMsg=NY4_ASK, want=NY4_ALL, none=NY4_XC),
  dict(id='NY42_Y4_KNOW_MISS', key='2028-12-31', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + NOKX + NGRP + KNOW2, steps=[('until', 24.2), ('bedpick', '睡到')], pref=['不去了'],
       wantMsg=NY4_PH, none=NY4_XC[:1]),
  dict(id='NY42_Y4_STRANGER_MISS', key='2028-12-31', h=20.9, zone='dorm', flags=dict(TWF), js=Y4 + NOKX + NGRP + FORGET2, steps=[('until', 24.2), ('bedpick', '睡到')], pref=['不去了'],
       noneMsg=NY4_PH, jsok=[('沒有寫著芯慈的照片', NYEG % json.dumps('nye_y4_photo'), [])]),
  # 42. Alison 大二下期末吃飯「暑假營隊我當小隊長。」→「我去探班。」→ 2027-07-17 12:00 營地；沒去＝21:00「小隊長還活著！」；不會被報名系學會的高中營 C02
  dict(id='AL42_GO', key='2027-06-11', h=19.0, zone='campus', flags=dict(TW3, met_yu=True), js=NOKX, steps=[('jsrun', YUD, 'TERMEND.dinner（Alison 大二下期末吃飯）'), CAMP_JUMP, ('until', 12.9)], pref=['「我去探班。」'],
       want=['暑假營隊我當小隊長。'] + CAMP2 + ['他們最會偷雞塊。要先藏好。'], none=['去年被偷過，今年學乖了。'],
       jsok=[('C15 探班 7/17 12:00（演完）', YUQ, lambda x: isinstance(x, str) and x.startswith('2027-07-17 12 ')), ('不報名系學會的高中營 C02', C02Q, False)]),
  dict(id='AL42_GO_Y1', key='2027-06-11', h=19.0, zone='campus', flags=dict(TW3, met_yu=True), js=NOKX + " G.flags.C15_DONE=Object.assign(G.flags.C15_DONE||{},{yu_camp:D('2026-07-11')});",
       steps=[('jsrun', YUD, 'TERMEND.dinner（Alison 大二下期末吃飯）'), CAMP_JUMP, ('until', 12.9)], pref=['「我去探班。」'],
       want=CAMP2 + ['去年被偷過，今年學乖了。'], none=['他們最會偷雞塊。要先藏好。']),   # [前置] 大一去過 yu_camp
  dict(id='AL42_MISS', key='2027-06-11', h=19.0, zone='campus', flags=dict(TW3, met_yu=True), js=NOKX, steps=[('jsrun', YUD, 'TERMEND.dinner（Alison 大二下期末吃飯）'), CAMP_JUMP, ('until', 21.3)], pref=['「我去探班。」', '不去了'],
       wantMsg=['📷（一排小朋友比著勝利手勢，Alison 站在最前面拿著哨子）', '小隊長還活著！'], none=CAMP2[:1], jsok=[('不報名系學會的高中營 C02', C02Q, False)]),
]
SAYH = " if(!GAME.say.__bbs){ const s0=GAME.say; const f=function(w,t){ try{ if(!(typeof ADV!=='undefined'&&ADV.active)) window.__LOG.push({n:(w&&(w.name||w.charId))||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return s0.apply(this,arguments); }; f.__bbs=1; GAME.say=f; } if(!window.__TOBS){ const te=document.getElementById('toast'); if(te&&window.MutationObserver){ window.__TOBS=1; let lt=''; new MutationObserver(()=>{ const s=(te.textContent||'').trim(); if(s&&s!==lt){ lt=s; try{ window.__LOG.push({n:'TOASTD',t:'TOASTD:'+s,h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} } }).observe(te,{childList:true,characterData:true,subtree:true}); } }"   # BB-B 15:4x：畫面上的提示框也記（TOASTD）：game3d.js 的 addNote 叫內部的 toast()，不經過 GAME.toast，📓 筆記那一則原本記不到｜3D 對話框（不是 ADV）的台詞也記下來：店員、館員、公園（ADV 裡的照舊由 ADV.log 記，不重記）
for _sc in R5: _sc['js'] = SAYH + _sc.get('js', '')
SCENS = SCENS + R5
# ---------------------------------------------------------------- 清單第 43、44、48 項（LAWWW-B BB_SIS_B6_1023.md；開發分支 375e90903；BB-B 10-23）
#   48 期中晚餐柏翰算麵錢三句（AA_409 第 1 節 c42a0dd3 更正）、44 沛珊大一上期末交往＝交往中的大一下（AA_409 第 1～3 節）、43 芷若 9/2 桃園機場送機（AA_390）
PSD = " G.flags.dating_classmate_peishan=true;"   # [前置] 和沛珊交往中（大一上期末告白交往的存檔：使用者存檔沒有，這裡直接設旗標）
PSBASE = " LV('classmate_peishan',55,45,40); LV('yu',45,30,20); LV('zhe',45,30,20);"   # [前置] 認識沛珊（朋友）、Alison、阿哲
BHK = " LV('classmate_bohan',45,30,20);"   # [前置] 認識柏翰
BHFORGET = " { const M=G.social&&G.social.mem&&G.social.mem.classmate_bohan; if(M) G.social.mem.classmate_bohan=M.filter(m=>m.tag!=='FIRST_MET'); const r=SOCIAL.rel('classmate_bohan'); r.fam=0; r.trust=0; r.comf=0; }"   # [前置] 不認識柏翰
PSTOLD = " ROM.learn(G,'zhe','classmate_peishan','present'); ROM.learn(G,'yu','classmate_peishan','present');"   # [前置] 麵店團之前就知道了（別的事件公開過）
PS_EGG = ['（沛珊坐在你旁邊。她把碗裡的滷蛋夾了一半，放到你碗裡。）', '……喔。', '全桌安靜三秒。', '對。你們吃你們的。', '（Alison 在桌子底下踢了阿哲一腳。）']
PS_BHCOST = ['（柏翰把每個人的麵錢算好，寫在餐巾紙上。）', '一個人一百一十五。阿哲你多一顆蛋，一百二十五。', '……你連這個都算。']
PS_PUB = ['柏翰幫沛珊把滷蛋切成兩半。', '對，我們在一起了。你們吃你們的。', '上禮拜的事。', '（他把另一半滷蛋推回她碗裡。）']
PS_TOLDL = '（沛珊把碗裡的滷蛋夾了一半，放到你碗裡。沒有人說話。）'
PS_W4D = ['（讀書會結束。你收白板的時候，沛珊站在門口等。）', '下週那一題，你報。……我想聽你講。', '（你們一起走出萬才館。柏翰走在前面，一個人。）']
PS_W4F = ['（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）', '（你在後面收白板。）']
WED_UNLESS = "(()=>{ const e=SMALLTALK.classmate_bohan.find(x=>typeof x==='object'&&/週三晚上空出來/.test(x.t)); return e?!!EVENTS.cond(e.unless):'沒有那一句'; })()"   # true＝不說
SPLIT_OK = "(()=>{ const e=STORY_EVENTS.find(x=>x.id==='ev_peishan_split'); return e?!!EVENTS.check(e):'沒有 ev_peishan_split'; })()"
ZR43 = " G.flags.HOOK_ZR_SENDOFF=D('2027-06-11'); G.contacts=G.contacts||{}; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,'heroine_02'); LV('heroine_02',55,45,40);"   # [前置] 大二下期末聚餐答應了「出發那天我去送妳。」（HOOK_ZR_SENDOFF；選項本身 tests/termend_unit.js 第 12 項）、有她的聯絡方式、朋友
ZR_STUBSEEN = " SOCIAL.remember('heroine_02','TICKET_STUB','最後一個班，她給的電影票根'); G.flags.ZR_LAST_SHIFT='seen'; G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done.ev_zhiruo_last_shift=1;"   # [前置] 6/3 最後一班去了、拿到票根
ZR_AWAY = " G.trips=(G.trips||[]).concat([{status:'booked',day:D('2027-09-01'),depart:9,back:20,kind:'overnight',nights:1,who:'heroine_01',locs:[]}]);"   # [前置] 9/1～9/2 兩天一夜的校外約會（人在外地）
ZR_ASK = ['明天八點半，第二航廈。', '你說要來的。']
ZR_HEAD = ['（八點半。她推著一個很大的行李箱，旁邊站著一個比她矮一點的阿姨。）', '我媽。', '你好。她說有同學要來，我還不信。', '……媽。', '（她從外套口袋拿出一張摺好的紙。）', '那邊的地址。']
ZR_ADDR = '電影看完，寫的那一句寄這裡。'; ZR_ADDR_GF = '二月回來。……第一張明信片寄給你。'
ZR_STUB = ['（她又拿出一張電影票根。）', '這個本來放在櫃台。你沒來拿。']
ZR_GO = ['（廣播叫了她那班飛機。她把行李箱推給櫃台以後，只剩一個背包。）']; ZR_WAVE = '（她走到出境的門口，回頭揮了一下手，進去了。）'; ZR_HAND = '（她在門口停了一下，抓了一下你的手，才進去。）'
ZR_MOM = '我搭十點的客運回台中。你呢？'
ZRSTEPS = [('until', 21.3), ('bedpick', '睡到明天早上'), ('until', 10.6, 1200)]
R6 = [
  # 48＋44 期中晚餐（大一下第 8 週週三 4/15 19:00 阿鳳麵店長桌；[捷徑] 直接開演 ev_midterm_supper_y1s2——排程是「刑總二期中考完、麵店團群組」那一套，另外測過）
  dict(id='PS48_DT_BH', key='TERMDAY:Y1S2:8:3', h=19.0, zone='noodle', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHK, steps=[('runev', 'ev_midterm_supper_y1s2')], pref=['（繼續吃麵）'],
       want=PS_EGG + PS_BHCOST, order=PS_EGG + PS_BHCOST, none=PS_PUB + [PS_TOLDL]),
  dict(id='PS48_DT_NOBH', key='TERMDAY:Y1S2:8:3', h=19.0, zone='noodle', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHFORGET, steps=[('runev', 'ev_midterm_supper_y1s2')], pref=['（繼續吃麵）'],
       want=PS_EGG, none=PS_BHCOST + PS_PUB),
  dict(id='PS48_DT_TOLD', key='TERMDAY:Y1S2:8:3', h=19.0, zone='noodle', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHK + PSTOLD, steps=[('runev', 'ev_midterm_supper_y1s2')], pref=['（繼續吃麵）'],
       want=[PS_TOLDL] + PS_BHCOST, order=[PS_TOLDL] + PS_BHCOST, none=[PS_EGG[0], PS_EGG[3], PS_EGG[4]] + PS_PUB),
  dict(id='PS48_NODATE', key='TERMDAY:Y1S2:8:3', h=19.0, zone='noodle', flags=dict(TW3), js=NOKX + PSBASE + BHK + " G.flags.dating_classmate_peishan=false;", steps=[('runev', 'ev_midterm_supper_y1s2')], pref=['（繼續吃麵）'],
       want=PS_PUB, none=PS_BHCOST + [PS_EGG[0], PS_EGG[4], PS_TOLDL]),
  # 44 大一下第 4 週週四公法讀書會散場（[捷徑] 直接開演 ev_peishan_bohan_w4：afterActivity，讀書會本身另外測過）
  dict(id='PS44_W4_DT', key='TERMDAY:Y1S2:4:4', h=18.0, zone='wancai', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHK, steps=[('runev', 'ev_peishan_bohan_w4')], want=PS_W4D, order=PS_W4D, none=PS_W4F),
  dict(id='PS44_W4_NODATE', key='TERMDAY:Y1S2:4:4', h=18.0, zone='wancai', flags=dict(TW3), js=NOKX + PSBASE + BHK + " G.flags.dating_classmate_peishan=false;", steps=[('runev', 'ev_peishan_bohan_w4')], want=PS_W4F, none=PS_W4D),
  # 44 大二上：柏翰不說「這學期我週三晚上空出來了。」、沒有柏翰×沛珊分手那一段（【讀資料】閒聊句、事件條件；閒聊是隨機抽，瀏覽器裡抽不到也不代表沒有）
  dict(id='PS44_Y2_DT', key='TERMDAY:Y2S1:8:2', h=12.0, zone='linze', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHK, steps=[],
       jsok=[('【讀資料】交往中：柏翰「週三晚上空出來了」不說（unless 成立）', WED_UNLESS, True)]),
  dict(id='PS44_Y2_NODATE', key='TERMDAY:Y2S1:8:2', h=12.0, zone='linze', flags=dict(TW3), js=NOKX + PSBASE + BHK + " G.flags.dating_classmate_peishan=false;", steps=[],
       jsok=[('【讀資料】沒交往：柏翰那一句照舊可以說（unless 不成立）', WED_UNLESS, False)]),
  dict(id='PS44_SPLIT_DT', key='TERMDAY:Y2S1:6:1', h=12.3, zone='linze', flags=dict(TW3), js=NOKX + PSD + PSBASE + BHK, steps=[],
       jsok=[('【讀資料】交往中：柏翰×沛珊分手那一段（ev_peishan_split）不成立', SPLIT_OK, False)]),
  # 43 芷若 9/2 桃園機場（2027-09-01 20:30 宿舍起；21:00 她私訊、回覆；9/2 08:30 第二航廈＝機場捷運約 1 小時）
  dict(id='ZR43_GO', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43, asks={'zr_sendoff_ask_2027': '會到。'}, steps=ZRSTEPS,
       pref=['出發', '「到了傳訊息給我。」', '「我回學校。」'], want=ZR_ASK + ['嗯。'] + ZR_HEAD + [ZR_ADDR] + ZR_STUB + ['那邊我只寄明信片。……傳訊息的話，我會一直看手機。'] + ZR_GO + [ZR_WAVE, ZR_MOM, '好。路上小心。'],
       order=ZR_HEAD + [ZR_ADDR] + ZR_STUB, none=[ZR_HAND, ZR_ADDR_GF], noneMsg=['我要進去了。', '我出發了。', '今天出發去英國了。'],
       cflags=['ZR_SENDOFF_2027', 'ZR_LAST_SHIFT'], eqflags={'ZR_SENDOFF_2027': 'met', 'ZR_LAST_SHIFT': 'airport'}, cmem=[('heroine_02', 'ZR_SAW_OFF'), ('heroine_02', 'TICKET_STUB')]),
  dict(id='ZR43_SEEN', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43 + ZR_STUBSEEN, asks={'zr_sendoff_ask_2027': '妳東西收好了嗎？'}, steps=ZRSTEPS,
       pref=['出發', '「電影我還沒看。」', '「我送您到客運站。」'], want=['收了三次。每次都多一件。'] + ZR_HEAD + [ZR_ADDR, '九月才開始。慢慢看。', ZR_WAVE, ZR_MOM, '（你們走到客運站。她上車以前，跟你點了一下頭。）'],
       none=ZR_STUB + [ZR_HAND], eqflags={'ZR_SENDOFF_2027': 'met'}, cmem=[('heroine_02', 'ZR_SAW_OFF')]),
  dict(id='ZR43_GF', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43 + " ROM.start(G,'heroine_02');", asks={'zr_sendoff_ask_2027': '會到。'}, steps=ZRSTEPS,
       pref=['出發', '「到了傳訊息給我。」', '「我回學校。」'], want=ZR_HEAD + [ZR_ADDR_GF, ZR_HAND, ZR_MOM], none=[ZR_ADDR, ZR_WAVE], eqflags={'ZR_SENDOFF_2027': 'met'}),
  dict(id='ZR43_LATE', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43, asks={'zr_sendoff_ask_2027': '會到。'}, steps=[('until', 21.3), ('bedpick', '睡到明天早上'), ('until', 9.8, 1200)],
       pref=['晚一點'], wantMsg=['我要進去了。'], noneMsg=['我出發了。'], none=[ZR_HEAD[0]], eqflags={'ZR_SENDOFF_2027': 'missed'}),
  dict(id='ZR43_DECL', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43, asks={'zr_sendoff_ask_2027': '明天臨時有事，沒辦法去。'}, steps=[('until', 21.3), ('bedpick', '睡到明天早上'), ('until', 9.8, 1200)],
       pref=[], wantMsg=['好。', '我出發了。'], noneMsg=['我要進去了。'], none=[ZR_HEAD[0]], eqflags={'ZR_SENDOFF_2027': 'declined'}),
  dict(id='ZR43_AWAY', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43 + ZR_AWAY, steps=[('until', 21.4)], noneMsg=ZR_ASK),
  dict(id='ZR43_NOHOOK', key='2027-09-01', h=20.5, zone='dorm', flags=dict(TW3), js=NOKX + ZR43 + " delete G.flags.HOOK_ZR_SENDOFF;", steps=[('until', 21.4)], noneMsg=ZR_ASK),
]
for _sc in R6: _sc['js'] = SAYH + _sc.get('js', ''); _sc.setdefault('once', [w for w in _sc.get('want', []) if len(w) > 6])   # 「嗯。」「……喔。」這種短句別的場合也會說，不算重複演
SCENS = SCENS + R6
# ===================== R7（BB-B 10-23）：LAWWW-B 清單 BB_SIS_B6_1023.md 第 50、51、45＋52、53、54 項（開發分支 c0443d650）=====================
# 50 公園的 3D 貓（WZ-CAT-LIFE-1023，LAWWW2 32e9ddf3）：讀場景裡的 wz_cat（在不在、visible、石桌下、姿勢）＋截圖
# 51 她們各自喜歡吃的（FOOD-FAV-1023，AA_410）：一起吃時也幫她點；點對＝專屬句＋筆記本＋熟悉 +2（每人一次）；點錯＝照舊；沒一起吃的照舊
# 45＋52 店員支線第二三批 SQ10～SQ20（沒有 SQ16）＋AA_408 第 6 節補字；過期以後下一次來店員說一句（AA_408 第 1 節）；SQ14、SQ18 做完公園告示、名牌多一行
# 53 做完的痕跡 3D 道具（SQ-TRACES-1023，LAWWW2 ed65a78e）：做完當天沒有、隔天再進店有；讀 TRACE_SQxx 節點＋截圖
# 54 SQ16 輪轉單車（AA_405＋第 3 節 f923751c）：「找車行老闆」第 5 次起開口 → 普通 201 門口週四晚上「問登山社的人」→ 回車行 → 紙條（3D）→ 每學期換名字；過期
# 新步驟（main 的 elif，只有 R7 用；原本的步驟不動）：
#   ('shot', 名稱, 目標, 等待條件 js, 秒)＝等條件成立（正式模型載入）→【捷徑】主角放到目標旁邊、鏡頭轉過去 → 藏 HUD 和主角截圖 → 還原
#   ('chk', 說明, js, 期望值或 lambda)＝中途【讀資料】；('wait', js, 秒, 說明)＝等到成立（等不到記一個問題）
#   ('pref', [...])＝之後的選單換一組偏好（同一個情境前後點不一樣的東西）；('mark', js)＝記下現在的台詞位置、熟悉、錢（不改遊戲）
SQL = {   # SIDEQ.LINES（src/sideq3d.js，開發分支 c0443d650；AA_404、AA_405、AA_408 第 1、6 節）照抄
  'SQ10': {'open': ['乳扇沒有了。我們家鄉的那種，臺北只有中和那條街買得到。', '……我這個月走不開。你週末有空嗎？'], 'noteN': '（她多給一張摺好的紙條。）', 'note': '拿給老闆娘。', 'read': '（雜貨店的老闆娘看了紙條，愣了一下。）', 'who': '阿梅？……她在臺北開店？', 'past': '（她們是小時候在緬甸同一個村子長大的，三十年沒聯絡。）', 'giveN': '（雜貨店的老闆娘多塞了一包東西和一張寫了電話的紙。）', 'give': '乳扇是她的，這包是我的。叫她打給我。', 'handN': '（你把那包乳扇和紙條交給老闆娘。她先看紙條，看了很久。）', 'hand': '……她還記得我叫阿梅。', 'menu': '（滇香的菜單多一行手寫「炸乳扇（限量）」。）', 'greet': '下禮拜我要去中和。……她說要教我做她媽媽的那道。', 'lapse': '乳扇我託客人去中和買了。……那間店的老闆娘，我沒見到。'},
  'SQ11': {'open': [[None, '（老闆娘從櫃台下面拿出一個鞋盒。）'], ['老闆娘', '客人不要的發票，我都留著。'], ['老闆娘', '……字太小了，我看不到。同學，你幫我對。']], 'winN': '（對到一張中了兩百塊。老闆娘看了很久。）', 'win': '……二十年了，第一次中。', 'cat': ['兩百塊，拿去買罐頭。給公園那隻。', '我每天收攤經過，牠都在那張椅子上。'], 'noCat': '兩百塊。今天你的排骨我請。', 'box': '（櫃台多一個紙盒，上面手寫「發票請投這裡」。）', 'boxCat': '（下面多一行小字「中了買貓罐頭」。）', 'adopt': '（那行小字劃掉，改成「中了捐給動物之家」。）', 'lapse': '發票我叫我女兒對了。……都沒中。'},
  'SQ12': {'open': ['下禮拜一公休。……我想請你來當客人。', '我要跟我女朋友求婚。店裡只有她一個人，她會發現。'], 'inN': '（女朋友進門，看了一下店裡唯一一桌客人，走過來小聲說。）', 'in': '你是他找來的吧。', 'inPair': '你們是他找來的吧。', 'pair': {'heroine_01': '……我們很明顯嗎？', 'heroine_03': '……對不起。我們演得不好。', 'heroine_04': '我們很認真在演耶。', 'heroine_05': '……我就說點兩份太刻意。', 'kexin': '我就說不要坐窗邊。'}, 'knew': '（她早就知道了。她看到他訂了一個戒指盒，盒子放在廚房的抽屜裡兩個禮拜。）', 'yesN': '（她坐回吧檯，等甜點上來，打開，說「好」，然後轉頭問你。）', 'photo': '可以幫我們拍一張嗎？', 'free': '（老闆那一晚沒收錢。）', 'wall': '（吧檯後面的牆多一張照片（兩個人，後面是窗邊那一桌）。）', 'greet': '一位嗎？吧檯老位子。', 'her': '窗邊也有位子喔。', 'lapse': '那天我一個人顧店。……她說好。'},
  'SQ13': {'open': ['我太太回韓國照顧她媽媽，要三個月。泡菜都是她醃的。', '我照她的方法醃了一罐。……你幫我吃吃看。'], 'ask': '這罐怎樣？', 'opts': ['比上次好。', '比上次差。', '一樣。'], 'reveal': '這罐是她從韓國寄來的。', 'better': ['……你分得出來。', '我分不出來。我吃了三個月自己的，已經忘記她的是什麼味道了。'], 'other': [['老闆', '……我也分不出來。'], [None, '（他笑了。）'], ['老闆', '那就好。我醃得還可以。']], 'back': ['（老闆娘回來了。）', '（櫃台旁邊多一個人在切菜。）'], 'jar': '（小菜櫃多一個玻璃罐，貼著手寫的標籤「她的」。）', 'greet': '小菜可以續喔。……那罐不行。', 'lapse': '泡菜我自己吃完了。……還是分不出來。'},
  'SQ14': {'open': ['牠的腳好了。獸醫說要回診，順便打預防針。', '……我走不開。外出籠在後面。'], 'cage': '（牠沒有掙扎，只是一直看著你。）', 'chip': ['（獸醫掃晶片，螢幕上跳出登記資料：十二年前登記的，飼主是一位陳先生，地址就是茶屋那一號。）', '（名字欄寫「豆花」。）'], 'backN': '（回到茶屋，蘇姨看了單子很久。）', 'back': ['……是我先生。他走了五年了。', '他說要帶牠去打晶片。我以為他沒去。', '他走了以後，牠不肯待在屋子裡，每天跑去公園。我就讓牠去。'], 'tea': '（蘇姨把那張單子收進櫃台的抽屜，請你喝一壺茶，不收錢。）', 'photo': '（茶屋櫃台多一張貓的照片，照片很舊，背景是茶屋的院子。）', 'greet': '豆花今天有去公園嗎？', 'zq': ['牠有晶片。醫生說飼主是茶屋的人。', '我去問了。阿姨簽了一張單子給我。……她說牠叫豆花。'], 'notice': '（豆花）', 'lapse': '回診我請隔壁幫忙帶了。'},
  'SQ15': {'open': ['有人拿來一箱法律系的書。我分不出哪些版本太舊、不能賣了。', '……你是法律系的吧。幫我看一下。'], 'look': '（六法全書兩本、刑法總則一本、一本很舊的民法總則。）', 'find': ['（民法總則的封面內頁，寫著「溫書瑀」。）', '（每一頁的邊邊都寫滿了字。很多問號，有些問號後來被劃掉了。）'], 'dinner': '（翻到善意第三人那一頁，她用紅筆圈起來，旁邊寫：「善意＝不知道。不是心地善良。」）', 'who': '一個女生拿來的，很瘦，講話很快。她說這箱不用算錢。', 'opts': ['這本我買。', '幫我留著，我問問她。', '這幾本修法了，不能賣。'], 'reply': ['八十。……你認識她？', '好。留一個禮拜。', '那這本我拿去回收。'], 'sis': {'put': '（你把那本民法總則放在她桌上。）', 'how': '……這本怎麼會在你這裡。', 'bought': '我賣掉的時候，以為不會再看到。', 'asked': '書店老闆打電話問我？……不是。是你在那裡整理。', 'ugly': '裡面的字很醜。問號很多。', 'keep': '……你留著吧。裡面錯的地方，你現在用得到。'}, 'buy': '她說給你的？好。', 'item': '學姊大一的民法總則', 'shelf': '（學姊大一的民法總則。封面內頁寫著『溫書瑀』，字比現在圓一點。）', 'eve': '（最後一頁，她寫了一行小字：『考完了。下次不要熬夜。』）', 'lapse': '那箱書，我拿去回收了。'},
  'SQ16': {'open': ['這台送來修，兩年了，沒人來牽。', '……電話打不通。你是台大的吧，幫我看看那張貼紙。'], 'look': '（一張很舊的校內停車證，只看得到一半的號碼，旁邊貼著一張社團的貼紙「登山社」。）', 'ask': '請問一下，這張貼紙是你們社團的嗎？', 'club': ['……這是我們以前社長的車。他畢業了，在新竹上班。', '我問他。'], 'msg': ['（她傳了訊息。過了一下，她的手機震了，她把畫面轉給你看。）', '（「那台車我以為被偷了。……修好就好。送給學弟妹吧，新生沒車很麻煩。」）'], 'back': '送給新生？……好。那我把它修好。', 'note': '（車頭掛了一張紙：『免費借給新生，一學期』。）', 'greet': ['打氣筒在門口，自己來。', '今天沒什麼車要修。……坐一下可以。'], 'names': ['陳品叡', '黃郁婷', '張宇翔', '劉思妤', '鄭凱文'], 'rename': '（車籃那張紙上，借車的名字換成了：{名字}。）', 'lent': '那台車這學期也借出去了。……第{N}個。', 'lapse': '那台車我拆了，零件給別台用。'},
  'SQ17': {'open': ['我在申請交換。下禮拜英文面試。', '你可以問我問題嗎？我一邊做飲料一邊答。'], 'qs': ['為什麼想去？', '去了想學什麼？', '如果沒上呢？'], 'ans': [['我想去一個沒有人認識我的地方。……先在那邊點一次飲料，看他們會不會記得我。', 'I want to see if I can start over somewhere no one knows me.'], ['日文。還有……怎麼一個人吃飯。', 'Japanese. And how to eat alone.'], ['如果沒上，我明年再申請。……這題我本來不想準備，因為我怕。', "If I don't get in, I'll apply again next year."]], 'en': '（她說英文的時候，手上的封膜機停了。）', 'give': ['上了跟我說。', '加油。'], 'call': '……那你給我電話。', 'contact': '一一八茶飲的店員', 'result': '上了。京都。', 'trace': '（窗口換了一個新的店員。牆上貼一張京都的照片，旁邊寫「她說：甜度冰塊記得問清楚」。）', 'an': ['今天在學校的交流會遇到一個臺灣人。她說她以前在一一八茶飲打工。', '她說你幫她練過面試。……你的人緣比我以為的好。'], 'lapse': '面試完了。結果四月才知道。'},
  'SQ18': {'open': ['週日早上有一張二十杯的訂單，要送到溫州街的小公園。', '我店裡走不開。你幫我送，運費算你一杯。'], 'clean': '（公園裡十幾個人在掃落葉、清水溝，是里民的清掃日。）', 'chief': '（訂飲料的是在涼亭下象棋的那位阿伯。他從口袋拿出一疊零錢付給你，戴上一頂寫著「里長」的帽子。）', 'who': '怎麼，你以為里長是誰？', 'sheet': '餵貓那張表，是你貼的吧。……星期日那一格，是我。', 'papers': '公布欄那些紙，都是我貼的。', 'stay': '（你留下來掃了半小時落葉。阿伯讓你一子，下了一盤。）', 'cup': '這杯是你的。茶行說，運費算你一杯。', 'knows': '（你認得這個字。）', 'tag': '（阿伯的字。）', 'lapse': '那二十杯，我自己送了。'},
  'SQ19': {'open': ['昨天有個女生把筆記本忘在這裡。封面寫法律系。', '……你認識嗎？'], 'look': '（封面寫著「吳芯慈」，裡面每一頁都是三種顏色的筆，像印刷的。）', 'last': ['（筆記本最後一頁不是筆記。是一張兩欄的表，左邊寫「以安」，右邊寫「我」。一格一格是考試、報告、發言的次數。）', '（表的最下面另外寫了一行，字比較小：「下次換我先約她。」）'], 'ret': '（她接過筆記本，第一件事是翻到最後一頁。）', 'ask': '……你看了嗎？', 'opts': ['看了最後一行。', '沒有。'], 'seen': [['xc', '……喔。'], [None, '（她把那一頁摺起來。）'], ['xc', '那一行，我會自己去做。']], 'no': [['xc', '……謝謝。'], [None, '（她看了你一下，好像不太相信。）']], 'group': [['xc', '週四晚上我借了一間討論室，讀這週的進度。要來的跟我說。'], ['xc', '@以安 妳要來嗎？'], ['an', '好。']], 'basket': '（定食店的櫃台多一個小籃子，寫著「失物」。）', 'greet': '今天沒有人忘東西。', 'lapse': '筆記本那個女生，自己回來拿了。'},
  'SQ20': {'open': ['小蕙下個月要考證照，烘焙的。', '她每次練習都超時。我在煎蛋，沒辦法幫她計時。你可以嗎？'], 'bohanOpt': '我找一個更會計時的人。', 'bohan': '每個步驟我分開計。你們看這張表。', 'self1': [[None, '（你用手機的碼錶。小蕙每做完一步，就看你一眼。）'], ['小蕙', '……超過了嗎？'], ['小米姐', '（從煎台那邊）她每次都超過在烤箱那一步。']], 'self2': '（這次她在烤箱那一步沒有看你。）', 'apronN': '（第二個週末練完，小米姐把圍裙脫下來。）', 'apron': ['……我也報了。', '我考過兩次，都沒過。那時候在上班，沒時間練。', '這次跟她一起考。不要告訴她，她會緊張。'], 'pass': '（一個月以後，兩個人都過了。小蕙先知道小米姐也有考，是在考場遇到的。）', 'certs': '（櫃台後面的牆上多兩張證書，並排掛著，一張寫小米姐的名字，一張寫小蕙的。）', 'greet': '今天的蛋，三分四十秒。……這是我考試的時候練出來的。', 'lapse': '小蕙自己計時。她說手機的碼錶很吵。'},
}
FAVL = {   # FOOD_FAV_LINES（src/data/food_fav_lines.js；AA_410）照抄
  'note': {'heroine_01': '以安：咖哩蛋包飯。她只吃得下半份，多要一個盤子。', 'heroine_02': '芷若：熱可可，加一份濃縮。', 'heroine_03': '語彤：滇香的酸辣河粉，多加辣。看不出來。', 'heroine_04': '子晴：美式，冰的。十二月也是。', 'heroine_05': '學姊：無糖綠茶，去冰。從來沒換過。', 'classmate_peishan': '沛珊：番茄醬蛋包飯。她每次都點一樣的。', 'kexin': '可昕：青茶，無糖。她只喝無糖的。'},
  'heroine_01': {'right': [['heroine_01', '……你記得。'], ['heroine_01', '那這一半給你。不准說吃不下。']], 'rightDating': [[None, '（她把一半撥到空盤子上，推過來的時候，順手把湯匙也放好。）']], 'itemOnly': [['heroine_01', '（看了一下盤子）……我吃不完。你要幫我吃。']], 'wrong': {'番茄醬蛋包飯': [['heroine_01', '番茄醬的。……好，我吃吃看。']]}},
  'classmate_peishan': {'right': [['classmate_peishan', '你幫我點好了？'], ['classmate_peishan', '……番茄醬的。嗯。不要笑。']], 'wrong': {'咖哩蛋包飯': [['classmate_peishan', '咖哩的？……好，今天換一次。'], ['classmate_peishan', '（吃了兩口）……下次還是番茄醬。']]}},
  'heroine_03': {'know': [['老闆娘', '那個社會系的妹妹，每次都叫我多放辣。'], ['老闆娘', '看不出來吧。']], 'right': [['heroine_03', '……嗯。'], ['heroine_03', '我們家的不敢做這麼辣。阿姨說客人會跑掉。']], 'itemOnly': [['heroine_03', '……嗯，謝謝。'], [None, '（她跟老闆娘要了一小碟辣椒。）']], 'wrong': {'*': [['heroine_03', '謝謝。……我吃這個也可以。']]}},
  'heroine_05': {'right': [['heroine_05', '……誰跟你說的。'], ['heroine_05', '她記性比我好。……謝謝。']], 'rightAgain': [['heroine_05', '又是她說的。'], ['heroine_05', '……好。下次換我。']], 'rightGuess': [['heroine_05', '……你怎麼知道。'], ['heroine_05', '我沒跟你說過吧。'], [None, '（她喝了一口，沒有再問。）']], 'itemOnly': [['heroine_05', '謝謝。……冰塊我等一下倒掉。']], 'wrong': {'*': [['heroine_05', '謝謝。我喝。']]}},
  'heroine_04': {'know': [[None, '（外面很冷。她的美式裡還是一大堆冰塊。）']], 'right': [['heroine_04', '你知道喔。'], ['heroine_04', '……十二月也是冰的。不要問。']], 'itemOnly': [['heroine_04', '熱的？……好啦。我等它涼。']], 'wrong': {'拿鐵': [['heroine_04', '拿鐵？……好啦，我也喝。']], '熱可可': [['heroine_04', '熱可可是芷若在喝的。……好啦，我也喝。']], '紅茶': [['heroine_04', '紅茶。……可以。']], '手沖': [['heroine_04', '手沖？你很捨得欸。……謝謝。']]}},
  'kexin': {'know': [['kexin', '……有糖。'], ['kexin', '我只喝無糖的。你下次記得。']], 'right': [['kexin', '無糖。……你記得。'], ['kexin', '我以為你只記得考試的東西。']], 'itemOnly': [['kexin', '半糖？……你上次明明知道。']], 'wrong': {'珍珠奶茶': [['kexin', '珍奶。……你是故意的吧。'], [None, '（她還是插了吸管。）']], '紅茶': [['kexin', '紅茶。……也可以。']], '冬瓜檸檬': [['kexin', '冬瓜檸檬？這個甜死了。'], [None, '（她還是喝了半杯。）']]}},
}
SQT = {'SQ10': '滇香小館：華新街的乳扇', 'SQ11': '巷口家常菜：對發票', 'SQ12': 'Pasta 118：週一公休的那一晚', 'SQ13': '韓食小廚：第三罐泡菜', 'SQ14': '一盞茶屋：回診', 'SQ15': '舊路書房：一箱法律系的舊書', 'SQ16': '輪轉單車：兩年沒人來牽的車', 'SQ17': '一一八茶飲：英文面試', 'SQ18': '清葉茶行：二十杯的訂單', 'SQ19': '巷子裡定食：忘在桌上的筆記本', 'SQ20': '半熟早午餐：計時'}   # 手機「今天」、提示的標題（SIDEQ.Q[id].title）
def R7T(a): return [x[1] if isinstance(x, (list, tuple)) else x for x in a]   # [誰, 台詞] → 台詞（旁白、說話框都只比對字）
def TOASTS(i): return ['TOAST:📝 順手的事：' + SQT[i], 'TOAST:📝 順手的事：' + SQT[i] + '（做完了）']
def SQB(key): return NOKX + SQROLL + EATN(key, 4)   # [前置] 這間店點過 4 次（這一次＝第 5 次，店員認得你）；【捷徑】「偶爾」固定抽中
def ORDER(n): return ('usep', '^點餐（%s）$' % n)   # 118 巷店裡的點餐（src/l118_shops3d.js）
TEAH = ('usep', '^喝茶$'); WZORD = ('usep', '^點餐$')   # 一盞茶屋；巷子裡定食、半熟早午餐（zones3d.js CUST 的「點餐」）
GGTEA = ('usep', '^買一杯飲料$')   # 公館的清葉茶行（溫州街巷口茶飲的窗口同名，在溫州街照舊用 TEA）
BOOKB = ('usep', '^看看法律書與文具$'); BIKE = ('usep', '^找車行老闆$'); ROOMI = ('usep', '^看看房間裡的東西$'); CAFEC = ('usep', '^到吧檯點餐$')
def NEXT(n, h): return ('jump', 'GAME.G.day+%d' % n, h, '%d 天後（人在原地）' % n)
def OUTD(ev): return "(()=>{ const q=(OUT.rec(GAME.G)||[]).find(x=>x.ev===%s&&x.state==='planned'); return q?q.day:null; })()" % json.dumps(ev)   # 排好的出遊那一天
def WAITNPC(i): return ('wait', "(n=>!!n&&!n.leaving)(GAME.npc&&GAME.npc[%s])" % json.dumps(i), 60, '%s 在這裡' % i)   # BB-B 16:1x：負載高時 25 秒不夠（FOOD51_ZQ 第一次等不到，之後她其實在）
def VISIT(n, pre, h, i): return [NEXT(n, pre), ('jump', 'GAME.G.day', h, '同一天 %.2f' % h), WAITNPC(i)]   # 【捷徑】隔幾天再來同一間店（先撥到她不在的時間、再撥到她的時段，等她坐下）
def MK(i): return ('mark', "window.__LN=(window.__LOG||[]).length; window.__FA=SOCIAL.rel(%s).fam; window.__MA=GAME.G.money|0;" % json.dumps(i))
def FAMD(i): return "(id=>{ const G=GAME.G, r=SOCIAL.rel(id), D=G.social&&G.social.daily, a=(D&&D.day===G.day&&D.p&&D.p[id])?(D.p[id].fam||0):0; return r.fam-(window.__FA|0)-a; })(%s)" % json.dumps(i)   # 這一次點完熟悉多了多少（扣掉「一起吃飯」本身那一筆 SOCIAL.activity）
def LNQ(t): return "(t=>(window.__LOG||[]).slice(window.__LN|0).filter(x=>String(x.t).includes(t)).length)(%s)" % json.dumps(t, ensure_ascii=False)   # mark 之後含這幾個字的台詞／選單幾次
def LOGN(t): return "(t=>(window.__LOG||[]).filter(x=>String(x.t)===t).length)(%s)" % json.dumps(t, ensure_ascii=False)
MONEYD = "(GAME.G.money|0)-(window.__MA|0)"
def FAVR(i): return "!!FAV.right(GAME.G,%s)" % json.dumps(i)
def NOTEQ(i): return "(GAME.G.notes||[]).some(n=>n.id==='fav_'+%s)" % json.dumps(i)
def MEMQ(i, tag): return "!!SOCIAL.has(%s,%s)" % (json.dumps(i), json.dumps(tag))
def NOTE_T(i): return '📓 筆記：' + FAVL['note'][i]   # TOAST（GAME.toast）或 TOASTD（畫面上的提示框）都算
GE1 = lambda n: isinstance(n, int) and n >= 1
R7_ENTD = "(async([h,z])=>{ const G=GAME.G, d=(%s); if(d==null) return false; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); try{ if(G.zone!==z) await GAME.enter(z); }catch(e){ return 'ERR '+e; } return true; })(%s)"
def ENTD(dx, h, z, desc): return ('jsrun', R7_ENTD % (dx, json.dumps([h, z])), '日子撥到 %s %.2f、直接進 %s' % (desc, h, z))   # 【捷徑】同 ENT，日子是頁面裡算的
# BB-B 18:2x：先試互動半徑以內的距離（4F「往 5F 以上」半徑 0.6 m、日本宿舍的床 0.6 m：原本第一個試 0.8 m＝站在半徑外面，互動鈕不出來）
R7_NEAR = "(p=>{ const E=GAME.E, P=E.player, it=(E.interactables||[]).find(i=>!i.hidden&&(p.label==null||i.label===p.label)&&(p.room==null||i.room===p.room)&&(p.park==null||i.park===p.park)&&(p.sleep==null||!!(i.sleep||i.label==='睡覺')===p.sleep)); if(!it) return false; const lv=it.lv|0; try{ if(P.seat&&GAME.standUp) GAME.standUp(P); }catch(e){} const R=it.radius||1.4, DS=[R*0.5,R*0.7,R*0.85].concat([0.8,1.1,1.5,0.5,2.0].filter(d=>d<R)).concat([0.8,1.1,1.5,2.0]); const fr=(x,z)=>!E.nav||!E.nav.free||E.nav.free(x,z); for(const d of [0.2,0.35].concat(DS)) for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=it.x+Math.sin(a)*d, z=it.z+Math.cos(a)*d; if(E.placeAt) E.placeAt(P,x,z,lv); if(fr(x,z)&&(!E.nearestInteractable||E.nearestInteractable()===it)) return [+x.toFixed(2),+z.toFixed(2),lv]; } for(const d of DS) for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=it.x+Math.sin(a)*d, z=it.z+Math.cos(a)*d; if(E.placeAt) E.placeAt(P,x,z,lv); if(fr(x,z)) return [+x.toFixed(2),+z.toFixed(2),lv,'按鈕不是它']; } return false; })(%s)"
# BB-B 20:1x：先找「站在那裡按鈕就是它」的位置（E.nearestInteractable()===it）。原本只看站不站得住：118 巷慢讀咖啡、蛋包飯研究所的點餐點離椅子 0.8 m，
#   放到 0.4 m 處按鈕是「坐下」（椅子 prio 0.3），sq39c 的 SQ04、SQ07 因此沒點到餐（腳本問題；點餐會贏的可站範圍兩家都有一半左右，玩家按得到）。找不到才照舊、回傳多一個「按鈕不是它」。
def NEAR(desc, **p): return ('jsrun', R7_NEAR % json.dumps(p, ensure_ascii=False), '主角直接放到「%s」旁邊（不從區域入口走過去：機器負載高，從入口走幾十公尺會逾時）' % desc)   # 【捷徑】
NBIKE = NEAR('找車行老闆', label='找車行老闆'); NGGTEA = NEAR('清葉茶行 買一杯飲料', label='買一杯飲料'); N201 = NEAR('普通 201 門口', room='201')
NWZTEA = NEAR('溫州街巷口茶飲的窗口', label='買一杯飲料'); NTREE = NEAR('老樹下的圓椅', label='坐在老樹下的圓椅'); NNOTICE = NEAR('公園公布欄', label='看公布欄'); NCAT = NEAR('公園的貓', park='cat')
for _sc in R5:   # BB-B 16:2x：SQ38_DAYONCE 負載高從林家乾麵走到巷口茶飲（21 m）走不到＝第二家店根本沒點，「同一天別家不再問」等於沒驗 → 先放到窗口旁【捷徑】
    if _sc['id'] == 'SQ38_DAYONCE' and NWZTEA not in _sc['steps']: _sc['steps'].insert(_sc['steps'].index(TEA), NWZTEA)
NWZICE = NEAR('夏日冰菓室的窗口', label='買一碗冰'); NBED = NEAR('床', sleep=True)
for _sc in R5 + B78:   # BB-B 17:0x：負載 25 時走 7 m 也逾時（SQ39_SQ03 515 秒 98 格：走不到冰菓室窗口、後面全沒跑；B7_MSGS 日本房間走不到床、快轉沒開始）→ 先放到旁邊【捷徑】
    if _sc['id'] == 'SQ39_SQ03' and NWZICE not in _sc['steps']: _sc['steps'].insert(_sc['steps'].index(('usep', '^買一碗冰$')), NWZICE)
    if _sc['id'] == 'B7_MSGS' and NBED not in _sc['steps']: _sc['steps'].insert(0, NBED)
    # BB-B 17:5x：b7b 七個都沒跑到——日本房間走不到床（B7_EVE_*）、等不到時間（REPLY_D 00:52、JPV 22:29，負載 25）
    if _sc['id'].startswith('B7_') and _sc.get('zone') == 'jp_room' and any(x[0] == 'ffloop' for x in _sc['steps']) and NBED not in _sc['steps']: _sc['steps'].insert(0, NBED)
    if _sc['id'] in ('B7_REPLY', 'B7_REPLY_D', 'B7_JPV'): _sc['steps'] = [((x[0], x[1], 1500) if x[0] == 'until' and len(x) == 2 else x) for x in _sc['steps']]
    if _sc['id'] == 'B7_REPLY' and 'LV(\'heroine_05\',65,50,45)' not in _sc['js']: _sc['js'] += " LV('heroine_05',65,50,45);"   # [前置] 晚安要 CLOSE_FRIEND 以上（msg3d.js：stageNum≥4 或交往中）；原本 50/40/35 只到 FRIEND，話題裡本來就沒有晚安
    if _sc['id'] == 'SQ39_SQ08' and NNOTICE not in _sc['steps']:   # BB-B 17:5x：負載 25 走不到公布欄（從溫州街入口 14 m）、涼亭的象棋（20 m）→ 每一次都先放到旁邊【捷徑】
        _st = []
        for _x in _sc['steps']:
            if _x == NOTICE: _st.append(NNOTICE)
            elif _x == ('usep', '象棋'): _st.append(NEAR('涼亭的象棋', label='涼亭的象棋（08:00～11:00）'))
            elif _x == ('usep', '^喝茶$'): _st.append(NEAR('茶館的「喝茶」', label='喝茶'))
            _st.append(_x)
        _sc['steps'] = _st
# ---- 3D：痕跡道具（TRACE_SQxx，zones3d.js traceVis）、貓（wz_cat，zones3d.js buildWzPark）----
R7_TRQ = """(id=>{ const out=[], R=new RegExp('^TRACE_'+id); GAME.E.scene.traverse(o=>{ if(!R.test(o.name||'')) return; let w=true; for(let p=o;p;p=p.parent) if(p.visible===false){ w=false; break; }
  let op=1; o.traverse(m=>{ if(m.isMesh) for(const mt of [].concat(m.material)) if(mt&&mt.opacity!=null) op=Math.min(op,mt.opacity); }); o.updateWorldMatrix(true,true); const bx=new THREE.Box3().setFromObject(o), v=new THREE.Vector3(); if(!bx.isEmpty()) bx.getCenter(v); else o.getWorldPosition(v);
  out.push({n:o.name,vis:o.visible,wvis:w,op:+op.toFixed(2),x:+v.x.toFixed(2),y:+v.y.toFixed(2),z:+v.z.toFixed(2)}); }); return out; })(%s)"""   # wvis＝自己和上面每一層都 visible（真的畫出來）
def TRACEQ(i): return R7_TRQ % json.dumps(i)
def TRACEN(i): return "(id=>{ let n=0; const R=new RegExp('^TRACE_'+id); GAME.E.scene.traverse(o=>{ if(R.test(o.name||'')) n++; }); return n>0; })(%s)" % json.dumps(i)
def TRWAIT(i): return ('wait', TRACEN(i), 60, '場景裡有 TRACE_%s 節點（正式模型載入）' % i)
ANYVIS = lambda x: isinstance(x, list) and len(x) > 0 and any(n.get('wvis') for n in x)
NOVIS = lambda x: isinstance(x, list) and len(x) > 0 and not any(n.get('wvis') for n in x)
def TRCHK(i, on, why): return ('chk', why, TRACEQ(i), ANYVIS if on else NOVIS)
def TT(i, **k): d = {'re': '^TRACE_' + i, 'dist': 1.6, 'pitch': 0.15}; d.update(k); return d   # 截圖的目標：那個痕跡節點
R7_CAT = """(()=>{ const E=GAME.E, G=GAME.G, P=typeof PARK!=='undefined'?PARK:null; let c=null; E.scene.traverse(o=>{ if(!c&&o.name==='wz_cat') c=o; });
  const btn=(E.interactables||[]).find(i=>i.park==='cat'); const st={adopted:!!(P&&P.catAdopted(G)),cold:!!(P&&P.catCold(G)),under:!!(P&&P.catUnder(G)),btn:btn?{label:btn.label,hidden:!!btn.hidden}:null};
  if(!c) return Object.assign({found:false},st); let w=true; for(let p=c;p;p=p.parent) if(p.visible===false){ w=false; break; }
  const poses={}; let model=null; c.traverse(o=>{ const m=/^CAT_(sit|lie|walk|curl)$/.exec(o.name||''); if(m){ poses[m[1]]=o.visible; if(o.visible&&!model) model=o; } });
  const v=new THREE.Vector3(); (model||c.children[0]||c).getWorldPosition(v); const L=typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT.items:[], pav=L.find(i=>i.kind==='pavilion'), ring=L.find(i=>i.kind==='ring_bench');
  return Object.assign({found:true,visible:c.visible,shown:w,groupUnder:!!c.userData.under,glb:Object.keys(poses).length>0,pose:Object.keys(poses).filter(k=>poses[k]).join(',')||null,
    x:+v.x.toFixed(2),y:+v.y.toFixed(2),z:+v.z.toFixed(2),dTable:pav?+Math.hypot(v.x-pav.x-0.3,v.z-pav.z-0.05).toFixed(2):null,dBench:ring?+Math.hypot(v.x-ring.x,v.z-ring.z-(ring.r||1.45)).toFixed(2):null},st); })()"""
CATGLB = "(()=>{ let c=null; GAME.E.scene.traverse(o=>{ if(!c&&o.name==='wz_cat') c=o; }); let g=false; if(c) c.traverse(o=>{ if(/^CAT_(sit|lie|walk|curl)$/.test(o.name||'')) g=true; }); return g; })()"   # 正式模型（bldg.wz_cat，lazy）載入了
CATT = {'name': 'wz_cat', 'child': '^CAT_(lie|curl|sit|walk)$', 'visOnly': True, 'first': True, 'd': 2.0, 'dist': 1.4, 'pitch': 0.35}
def CATSHOT(tag): return ('shot', tag, CATT, CATGLB, 45)
def CATOK(under, pose): return lambda c: bool(c) and c.get('found') and c.get('visible') and c.get('shown') and c.get('groupUnder') == under and c.get('pose') == pose and (c.get('dTable') if under else c.get('dBench')) is not None and (c.get('dTable') if under else c.get('dBench')) < 0.35
CATGONE = lambda c: bool(c) and c.get('found') and not c.get('visible') and not c.get('shown') and c.get('adopted')
CAT_JS = Y4 + NOKX + CATN
INPARK = "(p=>!!PARK.inPark(p.x,p.z))(GAME.E.player.obj.position)"
R7_HIDE = """(on=>{ const cv=GAME.E.renderer.domElement; for(const e of document.body.children){ if(e===cv||e.contains(cv)) continue; e.style.visibility=on?'hidden':''; }
  if(cv.parentElement&&cv.parentElement!==document.body) for(const e of cv.parentElement.children){ if(e!==cv) e.style.visibility=on?'hidden':''; }
  GAME.E.player.obj.visible=!on; })"""   # 同 window47_probe.py 的 HIDEUI
# 主角站到目標 d 公尺外走得到的格子；鏡頭在主角後面（目標在畫面中間偏遠）——face：鏡頭改在目標那一側（看牆淡出）。目標位置＝包圍盒中心（TRACE_* 的變換烘在幾何裡，節點位置是原點）
R7_SHOTAT = """(t=>{ const E=GAME.E, P=E.player; try{ if(P.seat&&GAME.standUp) GAME.standUp(P); }catch(e){} let o=null; if(t.name||t.re){ const R=t.re?new RegExp(t.re):null; E.scene.traverse(x=>{ if(!o&&(x.name===t.name||(R&&R.test(x.name||'')))) o=x; }); }
  let O=null; if(o){ let q=null; if(t.child){ const R2=new RegExp(t.child); o.traverse(x=>{ if(!q&&x!==o&&R2.test(x.name||'')&&(x.visible||!t.visOnly)) q=x; }); } if(!q&&t.first&&o.children.length) q=o.children[0]; const tg=q||o; tg.updateWorldMatrix(true,true); const bx=new THREE.Box3().setFromObject(tg); O=new THREE.Vector3(); if(!bx.isEmpty()) bx.getCenter(O); else tg.getWorldPosition(O); }
  else if(t.x!=null) O=new THREE.Vector3(t.x,0,t.z); if(!O) return null;
  const free=(x,z)=>!E.nav||!E.nav.free||E.nav.free(x,z); let best=null; const ds=(t.d?[t.d]:[]).concat([2.2,1.8,2.6,3.0,1.4,3.6]);
  for(const d of ds){ for(let k=0;k<24&&!best;k++){ const a=(t.a0||0)+k*Math.PI/12, x=O.x+Math.sin(a)*d, z=O.z+Math.cos(a)*d; if(free(x,z)) best={x,z,d}; } if(best) break; }
  if(!best) return {O:[O.x,O.z],placed:false}; if(E.placeAt) E.placeAt(P,best.x,best.z); else P.obj.position.set(best.x,0,best.z);
  const c=E.cam, yaw=t.face?Math.atan2(O.x-best.x,O.z-best.z):Math.atan2(best.x-O.x,best.z-O.z); c.yaw=yaw; c.distTarget=t.dist||1.6; c.dist=c.distTarget; c.pitch=t.pitch!=null?t.pitch:0.3; c.manualT=60;
  return {O:[+O.x.toFixed(2),+O.y.toFixed(2),+O.z.toFixed(2)],P:[+best.x.toFixed(2),+best.z.toFixed(2)],yaw:+yaw.toFixed(2),face:!!t.face}; })(%s)"""
# ---- 51 用 ----
KXPLAN = " OUT.plan(G,{id:'te_kx_Y2S1',ev:'ev_termend_dinner',day:G.day,h:18,late:0.25,place:'政大正門',title:'和可昕的學期末約會（政大正門）',travel:'開車約 40 分鐘',travelH:2/3,te:{term:'Y2S1',who:'kexin',kind:'kexin'}});"   # [前置] 學期末約會已經約好（TERMEND 排的那一筆，同 tests/aa410_food_fav_unit.js 第 6 節）
KXKNOW = " FAV.rec(G).know.kexin=G.day-30; SOCIAL.remember('kexin','KNOW_FAV_KX','');"   # [前置] 上一次已經帶過有糖的（知道她只喝無糖）
KXQ = "(k=>k?k.item+'/'+k.oi:null)(FAV.rec(GAME.G).kx)"
AN_D = NOKX + " LV('heroine_01',70,60,60); try{ ROM.start(G,'heroine_01'); }catch(e){} G.flags.dating_heroine_01=true;"   # [前置] 和以安交往中
def WRONG(i, item): return R7T(FAVL[i]['wrong'][item])
AN_REG = '這間的咖哩，我只吃得下半份。'; PS_REG = '我每次都點一樣的。……你們不要笑。'; YT_REG = '下午我回社會系館。……這間比我們家的辣。'; SIS_REG = '我等一下還要回去讀，先走了。'   # 常客吃完的那一句（lane118_shops.js）
H1L = ['剛剛那個學姊，你認識喔？', '她每天這個時間來。無糖綠茶，去冰。從來沒換過。']; H1_FIX = '對啊。我都在她走到窗口以前就做好了。'   # AA_311 H1（lane118.js）
ZR_TREAT = ['拿鐵。……我已經在做了。', '她把杯子放下，很久以後說：', '……你記得。']   # 芷若點餐事件 ev_cafe_barista_zhiruo（第 5 次起、點對那一支）
# ---- 45、52、53、54 用 ----
LAPSE5 = " { const R=SIDEQ.rec(G), t=SIDEQ.termKey(G); for(const [id,step] of %s) R[id]={state:'open',step,day:G.day-10,term:t,by:G.day-1}; }"   # [前置] 掛著、要玩家去做的那一步昨天到期
def DONEJS(i): return " SIDEQ.rec(G).%s={state:'done',step:'done',day:G.day-20,term:SIDEQ.termKey(G),doneDay:G.day};" % i   # [前置] 今天做完
LAPSEDJS = " { const R=SIDEQ.rec(G), t=SIDEQ.termKey(G); for(const id of ['SQ12','SQ13','SQ19','SQ20']) R[id]={state:'lapsed',step:'x',day:G.day-20,term:t,lapseDay:G.day-3,told:G.day-1}; }"   # [前置] 過期、店員昨天交代過
SQ14DONE = " SIDEQ.rec(G).SQ14={state:'done',step:'done',day:D('2028-03-08'),term:'Y3S2',doneDay:D('2028-03-08')};"   # [前置] 大三下演過 SQ14 回診
LAPSEQ = "(ids=>ids.map(id=>{ const r=SIDEQ.get(GAME.G,id); return id+':'+(r?r.state+(r.told!=null?'/told':''):'-'); }))(%s)"
HIKEQ = "(GAME.E.interactables||[]).some(i=>i.room==='201'&&i.label==='問登山社的人')"
SQ16_BTN = "(GAME.E.interactables||[]).some(i=>i.label==='找車行老闆'&&!i.hidden)"
SQ16_RENAME = SQL['SQ16']['rename'].replace('{名字}', SQL['SQ16']['names'][0]); SQ16_LENT = SQL['SQ16']['lent'].replace('{N}', '一')
def TRSCN(i, key, h, zone, via, nxt, extra=None):   # 53：做完當天進店（沒有）→ 出去 → 隔天再進店（有）
    return dict(id='SQ53_' + i, key=key, h=h, zone=zone, flags=dict(TW3), js=NOKX + DONEJS(i),
                steps=[TRWAIT(i), ('shot', 'day0', TT(i), None), TRCHK(i, False, '做完當天：沒有'), ENT(nxt, h, via), ENT(nxt, h, zone),
                       TRWAIT(i), ('shot', 'day1', TT(i), None), TRCHK(i, True, '隔天再進店：有')] + (extra or []), pref=[], want=[], jsok=[('traceOn（隔天）', "!!SIDEQ.traceOn(GAME.G,%s)" % json.dumps(i), True)])
SA = SQL['SQ15']['sis']
R7 = [
  # ======== 50. 溫州街小公園的 3D 貓 ========
  dict(id='CAT50_NORMAL', key='2028-11-20', h=14.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS, steps=[CATSHOT('cat')], pref=[], want=[],
       jsok=[('平常：在圓椅上趴著（正式模型 CAT_lie、visible、不在石桌下）', R7_CAT, CATOK(False, 'lie'))]),
  dict(id='CAT50_EVE', key='2028-12-10', h=14.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS, steps=[CATSHOT('cat')], pref=[], want=[],
       jsok=[('寒流前一天（12/10）：照舊趴在圓椅上', R7_CAT, CATOK(False, 'lie'))]),
  dict(id='CAT50_COLD', key='2028-12-12', h=14.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS, steps=[CATSHOT('cat'), NCAT, ('usep', '^麻糬$')],   # BB-B 15:2x：負載高走不到石桌下（路是通的：半徑 1.4 m 內 69 格可站、找得到路）→ NCAT【捷徑】 pref=[], want=[CAT_COLD],
       jsok=[('寒流（12/11～12/14）：縮成一團（CAT_curl）在涼亭石桌底下', R7_CAT, CATOK(True, 'curl')), ('高度在涼亭地台上（y < 0.35）', "(c=>c&&c.y)(%s)" % R7_CAT, lambda y: isinstance(y, (int, float)) and y < 0.35)]),
  dict(id='CAT50_STAY', key='2028-12-14', h=22.25, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS + "G.flags.ANNIV23='there';", pref=[], want=[],   # BB-B 15:2x：12/14 是阿鳳麵店二十三週年（一定會發生：19:30 還沒到就打電話帶去，y34b3d.js a23CallDue）；22:15 在公園的玩家已經去過了＝前置 ANNIV23＝there
       steps=[NTREE, TREE, CATSHOT('2245'), ('chk', '23:00 以前：還縮在石桌下', R7_CAT, CATOK(True, 'curl')), ('chk', '人在公園裡', INPARK, True), ('until', 23.1),
              ('chk', '待在公園裡過 23:00：還在公園裡', INPARK, True), ('shot', '2306', CATT, None)],
       jsok=[('23:00 以後：公園沒有貓（不顯示）', R7_CAT, CATGONE), ('12/15～16 以前沒有「看圓椅」按鈕', "(c=>c&&c.btn&&c.btn.hidden)(%s)" % R7_CAT, True)]),
  dict(id='CAT50_ZQ', key='2028-12-14', h=21.75, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=Y4 + ZQF + CATN + SQ08DONE + "G.flags.ANNIV23='there';", pref=['「我幫妳抱。」'],   # 同上：麵店週年前置
       steps=[NTREE, TREE, ('until', 22.75), ('shot', 'after', CATT, None)], want=CAT_EV0 + CAT_EVB, cflags=['ZQ_CAT_NIGHT'], eqflags={'ZQ_CAT_NIGHT': True},
       jsok=[('子晴帶走那一場演完（23:00 以前）：公園沒有貓', R7_CAT, CATGONE), ('現在還不到 23:00', "GAME.G.hour<23", True)]),
  dict(id='CAT50_AFTER', key='2028-12-14', h=23.5, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS, steps=[CATSHOT('cat')], pref=[], want=[],
       jsok=[('12/14 23:30 進公園：沒有貓', R7_CAT, CATGONE), ('沒有「看圓椅」按鈕（12/17 起才有）', "(c=>c&&c.btn&&c.btn.hidden)(%s)" % R7_CAT, True)]),
  dict(id='CAT50_NEXT', key='2028-12-15', h=14.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS, steps=[CATSHOT('cat')], pref=[], want=[],
       jsok=[('12/15 14:00：沒有貓', R7_CAT, CATGONE), ('沒有按鈕', "(c=>c&&c.btn&&c.btn.hidden)(%s)" % R7_CAT, True)]),
  dict(id='CAT50_FUR', key='2028-12-17', h=16.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=CAT_JS,
       steps=[CATSHOT('cat'), ('chk', '12/17：按鈕「看圓椅」', "(c=>c&&c.btn&&!c.btn.hidden?c.btn.label:null)(%s)" % R7_CAT, '看圓椅'), ('usep', '^看圓椅$')], pref=[], want=[CAT_FUR],
       jsok=[('還是沒有貓', R7_CAT, CATGONE), ('「看圓椅」看過一次就藏起來', "(c=>c&&c.btn&&c.btn.hidden)(%s)" % R7_CAT, True)]),
  # ======== 51. 她們各自喜歡吃的東西（一起吃時也幫她點）========
  dict(id='FOOD51_AN', key='TERMDAY:Y1S1:6:5', h=11.9, zone='l118_omu', flags=dict(TW3), js=NOKX + " LV('heroine_01',45,30,20);", pref=['番茄醬蛋包飯', '也幫以安點一份'],
       steps=[('jump', 'GAME.G.day', 12.3, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_01'), MK('heroine_01'), ORDER('蛋包飯研究所'),
              ('chk', '點錯（番茄醬）：她那一句', LNQ(WRONG('heroine_01', '番茄醬蛋包飯')[0]), GE1), ('chk', '點錯：熟悉沒有 +2', FAMD('heroine_01'), 0), ('chk', '點錯：還沒算點對', FAVR('heroine_01'), False),
              ('chk', '常客那一句照舊（＝知道她的點法：筆記本多一行）', LNQ(AN_REG), GE1), ('chk', '筆記本有以安那一行', NOTEQ('heroine_01'), True),
              ('pref', ['咖哩蛋包飯', '也幫以安點一份', '不用'])] + VISIT(7, 10.0, 12.3, 'heroine_01') + [MK('heroine_01'), ORDER('蛋包飯研究所'),
              ('chk', '只點品項（不多要盤子）：她那一句', LNQ(R7T(FAVL['heroine_01']['itemOnly'])[0]), GE1), ('chk', '只點品項：熟悉沒有 +2', FAMD('heroine_01'), 0), ('chk', '只點品項：還沒算點對', FAVR('heroine_01'), False),
              ('pref', ['咖哩蛋包飯', '也幫以安點一份', '多要一個盤子'])] + VISIT(7, 10.0, 12.3, 'heroine_01') + [MK('heroine_01'), ORDER('蛋包飯研究所'),
              ('chk', '點對：熟悉 +2', FAMD('heroine_01'), 2), ('chk', '點對：FAV.right', FAVR('heroine_01'), True), ('chk', '記憶 REMEMBERED_HER_FOOD', MEMQ('heroine_01', 'REMEMBERED_HER_FOOD'), True),
              ('chk', '點對的那一次常客那一句不說（她剛才那兩句代替）', LNQ(AN_REG), 0)] + VISIT(7, 10.0, 12.3, 'heroine_01') + [MK('heroine_01'), ORDER('蛋包飯研究所'),
              ('chk', '第二次：不再問「也幫以安點一份」', LNQ('也幫以安點一份'), 0), ('chk', '第二次：熟悉不再加', FAMD('heroine_01'), 0), ('chk', '常客那一句回來', LNQ(AN_REG), GE1)],
       want=WRONG('heroine_01', '番茄醬蛋包飯') + R7T(FAVL['heroine_01']['itemOnly']) + R7T(FAVL['heroine_01']['right']) + [AN_REG, NOTE_T('heroine_01'), 'CHOICE:也幫以安點一份｜（就這樣）', 'CHOICE:多要一個盤子｜不用'],
       none=R7T(FAVL['heroine_01']['rightDating']), rep=[AN_REG], dmoney=-820),   # 110×2＋120×2＋120×2＋120
  dict(id='FOOD51_AN_DATING', key='TERMDAY:Y1S1:6:5', h=11.9, zone='l118_omu', flags=dict(TW3), js=AN_D, pref=['咖哩蛋包飯', '也幫以安點一份', '多要一個盤子'],
       steps=[('jump', 'GAME.G.day', 12.3, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_01'), MK('heroine_01'), ORDER('蛋包飯研究所')], want=R7T(FAVL['heroine_01']['right']) + R7T(FAVL['heroine_01']['rightDating']), none=[AN_REG], dmoney=-240,
       jsok=[('點對：熟悉 +2', FAMD('heroine_01'), 2), ('FAV.right', FAVR('heroine_01'), True)]),
  dict(id='FOOD51_PS', key='TERMDAY:Y1S1:6:3', h=11.9, zone='l118_omu', flags=dict(TW3), js=NOKX + " LV('classmate_peishan',45,30,20);", pref=['咖哩蛋包飯', '也幫沛珊點一份'],
       steps=[('jump', 'GAME.G.day', 12.3, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('classmate_peishan'), MK('classmate_peishan'), ORDER('蛋包飯研究所'), ('chk', '點錯（咖哩）：熟悉沒有 +2', FAMD('classmate_peishan'), 0), ('chk', '常客那一句照舊', LNQ(PS_REG), GE1),
              ('pref', ['番茄醬蛋包飯', '也幫沛珊點一份'])] + VISIT(7, 10.0, 12.3, 'classmate_peishan') + [MK('classmate_peishan'), ORDER('蛋包飯研究所'),
              ('chk', '點對：熟悉 +2', FAMD('classmate_peishan'), 2), ('chk', '點對：FAV.right', FAVR('classmate_peishan'), True), ('chk', '記憶 REMEMBERED_HER_FOOD', MEMQ('classmate_peishan', 'REMEMBERED_HER_FOOD'), True),
              ('chk', '點對的那一次常客那一句不說', LNQ(PS_REG), 0)],
       want=WRONG('classmate_peishan', '咖哩蛋包飯') + R7T(FAVL['classmate_peishan']['right']) + [PS_REG, NOTE_T('classmate_peishan'), 'CHOICE:也幫沛珊點一份｜（就這樣）'], none=['CHOICE:多要一個盤子'], dmoney=-460),   # 沛珊沒有小選項
  dict(id='FOOD51_PS_LATE', key='TERMDAY:Y2S2:3:3', h=12.3, zone='l118_omu', flags=dict(TW3), js=NOKX + " LV('classmate_peishan',45,30,20);", pref=['番茄醬蛋包飯', '也幫沛珊點一份'],
       steps=[ORDER('蛋包飯研究所')], none=['CHOICE:也幫沛珊點一份', PS_REG], dmoney=-110, jsok=[('2026-12-16 以後：沛珊不在蛋包飯研究所', "!(GAME.npc&&GAME.npc.classmate_peishan)", True)]),
  dict(id='FOOD51_YT', key='TERMDAY:Y2S1:3:1', h=11.9, zone='l118_dian', flags=dict(TW3), js=NOKX + " LV('heroine_03',45,30,20);", pref=['椒麻雞飯', '也幫語彤點一份', '不加'],
       steps=[('jump', 'GAME.G.day', 12.3, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_03'), MK('heroine_03'), ORDER('滇香小館'), ('chk', '點錯（椒麻雞飯）：熟悉沒有 +2', FAMD('heroine_03'), 0), ('chk', '還不知道', NOTEQ('heroine_03'), False),
              NEXT(1, 12.3), ORDER('滇香小館'), ('chk', '一起吃過以後，隔天自己來：老闆娘兩句＝知道（記憶 KNOW_FAV_YT）', MEMQ('heroine_03', 'KNOW_FAV_YT'), True), ('chk', '筆記本有語彤那一行', NOTEQ('heroine_03'), True),
              ('pref', ['酸辣河粉', '也幫語彤點一份', '不加'])] + VISIT(6, 10.0, 12.3, 'heroine_03') + [MK('heroine_03'), ORDER('滇香小館'), ('chk', '只點品項：熟悉沒有 +2', FAMD('heroine_03'), 0),
              ('pref', ['酸辣河粉', '也幫語彤點一份', '多加辣'])] + VISIT(7, 10.0, 12.3, 'heroine_03') + [MK('heroine_03'), ORDER('滇香小館'),
              ('chk', '點對：熟悉 +2', FAMD('heroine_03'), 2), ('chk', '點對：FAV.right', FAVR('heroine_03'), True), ('chk', '記憶 REMEMBERED_HER_FOOD', MEMQ('heroine_03', 'REMEMBERED_HER_FOOD'), True), ('chk', '點對的那一次常客那一句不說', LNQ(YT_REG), 0)],
       want=WRONG('heroine_03', '*') + R7T(FAVL['heroine_03']['know']) + R7T(FAVL['heroine_03']['itemOnly']) + R7T(FAVL['heroine_03']['right']) + [YT_REG, NOTE_T('heroine_03')], rep=[YT_REG], dmoney=-730),   # 110×2＋110＋100×2＋100×2
  dict(id='FOOD51_YT_Y1', key='TERMDAY:Y1S2:3:1', h=12.3, zone='l118_dian', flags=dict(TW3), js=NOKX + " LV('heroine_03',45,30,20);", pref=['椒麻雞飯', '也幫語彤點一份'],
       steps=[ORDER('滇香小館')], none=['CHOICE:也幫語彤點一份'] + R7T(FAVL['heroine_03']['know']), dmoney=-110, jsok=[('大一：語彤不在滇香', "!(GAME.npc&&GAME.npc.heroine_03)", True)]),
  dict(id='FOOD51_SIS', key='TERMDAY:Y1S1:5:2', h=12.3, zone='l118_tea', flags=dict(TW3), js=SISF, pref=['紅茶拿鐵', '也幫學姊點一杯', '去冰', '「她很固定。」'],
       steps=[('jump', 'GAME.G.day', 12.52, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_05'), MK('heroine_05'), ORDER('一一八茶飲'), ('chk', '點錯：熟悉沒有 +2', FAMD('heroine_05'), 0), ('chk', '店員 H1 那兩句＝知道（SIS_TEA_ORDER）', "!!GAME.G.flags.SIS_TEA_ORDER", True), ('chk', '筆記本有學姊那一行', NOTEQ('heroine_05'), True),
              ('pref', ['無糖綠茶', '也幫學姊點一杯', '正常冰'])] + VISIT(1, 10.0, 12.52, 'heroine_05') + [MK('heroine_05'), ORDER('一一八茶飲'), ('chk', '只點品項（正常冰）：熟悉沒有 +2', FAMD('heroine_05'), 0),
              ('pref', ['無糖綠茶', '也幫學姊點一杯', '去冰'])] + VISIT(1, 10.0, 12.52, 'heroine_05') + [MK('heroine_05'), ORDER('一一八茶飲'),
              ('chk', '點對：熟悉 +2', FAMD('heroine_05'), 2), ('chk', '點對：FAV.right', FAVR('heroine_05'), True), ('chk', '記憶 REMEMBERED_HER', MEMQ('heroine_05', 'REMEMBERED_HER'), True)],
       want=WRONG('heroine_05', '*') + H1L + [H1_FIX] + R7T(FAVL['heroine_05']['itemOnly']) + R7T(FAVL['heroine_05']['right']) + [SIS_REG, NOTE_T('heroine_05')], none=R7T(FAVL['heroine_05']['rightGuess'])[:1], rep=[SIS_REG], dmoney=-220),
  dict(id='FOOD51_SIS_GUESS', key='TERMDAY:Y1S1:5:2', h=12.3, zone='l118_tea', flags=dict(TW3), js=SISF, pref=['無糖綠茶', '也幫學姊點一杯', '去冰', '「她很固定。」'],
       steps=[('jump', 'GAME.G.day', 12.52, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_05'), MK('heroine_05'), ORDER('一一八茶飲')], want=R7T(FAVL['heroine_05']['rightGuess']), none=R7T(FAVL['heroine_05']['right'])[:1], dmoney=-60,
       jsok=[('沒聽過 H1 就猜對：熟悉 +2', FAMD('heroine_05'), 2), ('FAV.right', FAVR('heroine_05'), True)]),   # 猜對以後 H1 照程式還是會演（只記錄，不判）
  dict(id='FOOD51_ZQ', key='2028-12-05', h=20.0, zone='cafe', flags=dict(TWF), js=Y4 + ZQF, pref=['熱可可', '也幫子晴點一杯', '冰的', '拿鐵'],
       steps=[('jump', 'GAME.G.day', 20.4, '她的時段（讀檔、寫好前置以後她才進店：名字照認識的顯示）'), WAITNPC('heroine_04'), MK('heroine_04'), CAFEC, ('chk', '12 月第一次：看到她的杯子＝知道（KNOW_FAV_ZQ）', MEMQ('heroine_04', 'KNOW_FAV_ZQ'), True), ('chk', '點錯（熱可可）：熟悉沒有 +2', FAMD('heroine_04'), 0),
              ('pref', ['紅茶', '也幫子晴點一杯', '冰的', '拿鐵'])] + VISIT(1, 19.0, 20.4, 'heroine_04') + [MK('heroine_04'), CAFEC,
              ('pref', ['手沖', '也幫子晴點一杯', '冰的'])] + VISIT(1, 19.0, 20.4, 'heroine_04') + [MK('heroine_04'), CAFEC, ('chk', '手沖：錢照價錢扣（自己的手沖咖啡 150＋她的手沖 150）', MONEYD, -300),
              ('pref', ['美式', '也幫子晴點一杯', '熱的', '拿鐵'])] + VISIT(1, 19.0, 20.4, 'heroine_04') + [MK('heroine_04'), CAFEC, ('chk', '只點品項（熱的）：熟悉沒有 +2', FAMD('heroine_04'), 0),
              ('pref', ['美式', '也幫子晴點一杯', '冰的', '拿鐵'])] + VISIT(3, 19.0, 20.4, 'heroine_04') + [MK('heroine_04'), CAFEC,
              ('chk', '點對：熟悉 +2', FAMD('heroine_04'), 2), ('chk', '點對：FAV.right', FAVR('heroine_04'), True), ('chk', '記憶 REMEMBERED_HER', MEMQ('heroine_04', 'REMEMBERED_HER'), True)]
              + VISIT(1, 19.0, 20.4, 'heroine_04') + [MK('heroine_04'), CAFEC, ('chk', '之後不再問', LNQ('也幫子晴點一杯'), 0)],
       want=R7T(FAVL['heroine_04']['know']) + WRONG('heroine_04', '熱可可') + WRONG('heroine_04', '紅茶') + WRONG('heroine_04', '手沖') + R7T(FAVL['heroine_04']['itemOnly']) + R7T(FAVL['heroine_04']['right']) + [NOTE_T('heroine_04')],
       dmoney=-1380),   # 240＋240＋300＋240＋240＋120
  dict(id='FOOD51_ZQ_ABSENT', key='2028-12-09', h=20.4, zone='cafe', flags=dict(TWF), js=Y4 + ZQF, pref=['拿鐵'], steps=[CAFEC],
       none=['CHOICE:也幫子晴點一杯'] + R7T(FAVL['heroine_04']['know']), dmoney=-120, jsok=[('週六晚上：子晴不在店裡', "!(GAME.npc&&GAME.npc.heroine_04)", True)]),
  dict(id='FOOD51_KX_RIGHT', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ + KXPLAN, pref=['青茶', '帶一杯給可昕', '無糖'],
       steps=[NWZTEA, MK('kexin'), TEA, ('chk', '帶給她的那一杯：錢照價錢扣（30＋30）', MONEYD, -60), ('chk', '記下帶了哪一杯', KXQ, '青茶/0'), ('until', 19.0)],
       want=R7T(FAVL['kexin']['right']) + ['CHOICE:帶一杯給可昕｜（就這樣）'], none=R7T(FAVL['kexin']['know']),
       jsok=[('FAV.right', FAVR('kexin'), True), ('記憶 REMEMBERED_HER', MEMQ('kexin', 'REMEMBERED_HER'), True), ('筆記本有可昕那一行', NOTEQ('kexin'), True), ('約會演完：那一杯用掉了', KXQ, None)]),
  dict(id='FOOD51_KX_KNOW', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ + KXPLAN, pref=['青茶', '帶一杯給可昕', '半糖'],
       steps=[NWZTEA, MK('kexin'), TEA, ('chk', '記下帶了哪一杯', KXQ, '青茶/1'), ('until', 19.0)], want=R7T(FAVL['kexin']['know']), none=R7T(FAVL['kexin']['right'])[:1] + R7T(FAVL['kexin']['itemOnly']),
       jsok=[('第一次帶有糖的＝知道（KNOW_FAV_KX）', MEMQ('kexin', 'KNOW_FAV_KX'), True), ('筆記本有可昕那一行', NOTEQ('kexin'), True), ('還沒算點對', FAVR('kexin'), False)]),
  dict(id='FOOD51_KX_HALF', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ + KXPLAN + KXKNOW, pref=['青茶', '帶一杯給可昕', '半糖'],
       steps=[NWZTEA, TEA, ('until', 19.0)], want=R7T(FAVL['kexin']['itemOnly']), none=R7T(FAVL['kexin']['know']), jsok=[('還沒算點對', FAVR('kexin'), False)]),
  dict(id='FOOD51_KX_RED', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ + KXPLAN, pref=['紅茶', '帶一杯給可昕', '無糖'],
       steps=[NWZTEA, TEA, ('chk', '記下帶了哪一杯', KXQ, '紅茶/0'), ('until', 19.0)], want=WRONG('kexin', '紅茶'), none=R7T(FAVL['kexin']['right'])[:1], jsok=[('點錯：沒算點對', FAVR('kexin'), False)]),
  dict(id='FOOD51_KX_MELON', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ + KXPLAN, pref=['冬瓜檸檬', '帶一杯給可昕', '無糖'],
       steps=[NWZTEA, MK('kexin'), ('until', 16.8, 300), NWZTEA, TEA, ('chk', '錢照價錢扣（45＋45）', MONEYD, -90), ('until', 19.0)], want=WRONG('kexin', '冬瓜檸檬'), none=R7T(FAVL['kexin']['right'])[:1], jsok=[('點錯：沒算點對', FAVR('kexin'), False)]),   # BB-B 10-24 04:0x（f51dr4）：窗口前站了一個路人（林采潔，UNFAMILIAR_POOL），按鈕變「和林采潔說話」＝腳本放的位置剛好被擋；等 12 分鐘遊戲時間再放一次
  dict(id='FOOD51_KX_NOTRIP', key='TERMDAY:Y2S1:17:4', h=16.6, zone='wenzhou', flags=dict(TW3), js=KXJ, pref=['青茶', '帶一杯給可昕'], steps=[NWZTEA, TEA],
       none=['CHOICE:帶一杯給可昕'], dmoney=-30),   # 沒有排學期末約會：沒有「帶一杯給可昕」
  # BB-B 16:1x：芷若在吧檯後面，負載高時從門口走 131 秒走不到 → steps 先放到吧檯前【捷徑】
  dict(id='FOOD51_ZR_SAME', key='TERMDAY:Y1S2:5:2', h=19.5, zone='cafe', flags=dict(TW3),
       js=NOKX + " LV('heroine_02',45,30,20); SOCIAL.remember('heroine_02','ASKED_HER_DRINK',''); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵';", pref=['也幫芷若點一杯', '熱可可', '加一份濃縮'],
       steps=[NEAR('兩點半 Café 的吧檯', label='到吧檯點餐'), ('talk', 'heroine_02')], want=ZR_TREAT + ['CHOICE:也幫芷若點一杯｜（就這樣）'], jsok=[('芷若點對照舊：REMEMBERED_HER', MEMQ('heroine_02', 'REMEMBERED_HER'), True)]),   # [前置] 問過她喝什麼（Z3）、點過 6 次
  # ======== 45＋52. 店員支線第二、三批（SQ10～SQ20，沒有 SQ16）＋AA_408 第 6 節補字 ========
  dict(id='SQ45_SQ10', key='2027-03-09', h=12.3, zone='l118_dian', flags=dict(TW3), js=SQB('滇香小館'), pref=['椒麻雞飯', '「要我幫忙嗎？」', '出發：中和'],
       steps=[ORDER('滇香小館'), ('jump', OUTD('ev_sq10_hwaxin'), 13.0, '華新街那天（週六）13:00'), ('until', 16.2), ('chk', '華新街回來：還沒做完（AA_408 6：下一次來滇香先交乳扇）', SQST('SQ10'), 'open/give'),
              NEXT(2, 12.3), ORDER('滇香小館'), ('chk', '交乳扇兩行以後才算做完', SQST('SQ10'), 'done/done'), NEXT(1, 12.3), ORDER('滇香小館'), NEXT(1, 12.3), ORDER('滇香小館')],
       want=SQL['SQ10']['open'] + [SQL['SQ10'][k] for k in ('noteN', 'note', 'read', 'who', 'past', 'giveN', 'give', 'handN', 'hand', 'menu', 'greet')] + TOASTS('SQ10'), dmoney=-500),   # 110×4＋來回 60
  dict(id='SQ45_SQ10_EARLY', key='2026-10-06', h=12.3, zone='l118_dian', flags=dict(TW3), js=SQB('滇香小館'), pref=['椒麻雞飯', '「要我幫忙嗎？」'], steps=[ORDER('滇香小館')],
       none=SQL['SQ10']['open'][:1], jsok=[('大二上：還沒有 SQ10（大二下起）', SQST('SQ10'), None)]),
  dict(id='SQ45_SQ11', key='2026-11-25', h=12.3, zone='l118_home', flags=dict(TW3), js=SQB('巷口家常菜'), pref=['排骨飯', '「要我幫忙嗎？」'],
       steps=[ORDER('巷口家常菜'), NEXT(1, 12.3), ORDER('巷口家常菜'), NEXT(1, 12.3), ORDER('巷口家常菜')],
       want=R7T(SQL['SQ11']['open']) + [SQL['SQ11'][k] for k in ('winN', 'win', 'noCat', 'box')] + TOASTS('SQ11'), none=SQL['SQ11']['cat'] + [SQL['SQ11']['boxCat']], dmoney=-190,
       jsok=[('SQ11 做完、這一餐請客（退 95）', "(r=>r?r.state+'/'+r.free:null)(SIDEQ.get(GAME.G,'SQ11'))", 'done/95')]),   # 95＋0＋95
  dict(id='SQ45_SQ11_CAT', key='2026-11-25', h=12.3, zone='l118_home', flags=dict(TW3), js=SQB('巷口家常菜') + CATN + SQ08DONE, pref=['排骨飯', '「要我幫忙嗎？」'],
       steps=[ORDER('巷口家常菜'), NEXT(1, 12.3), ORDER('巷口家常菜'), NEXT(1, 12.3), ORDER('巷口家常菜')],
       want=[SQL['SQ11']['win']] + SQL['SQ11']['cat'] + [SQL['SQ11']['box'], SQL['SQ11']['boxCat']], none=[SQL['SQ11']['noCat']], dmoney=-285),   # [前置] SQ08 餵貓表貼了＝餵過公園的貓
  dict(id='SQ45_SQ11_EVEN', key='2026-10-27', h=12.3, zone='l118_home', flags=dict(TW3), js=SQB('巷口家常菜'), pref=['排骨飯', '「要我幫忙嗎？」'], steps=[ORDER('巷口家常菜')],
       none=R7T(SQL['SQ11']['open'])[:1], jsok=[('雙數月：不開口（單數月 25 日以後才有）', SQST('SQ11'), None)]),
  dict(id='SQ45_SQ12', key='2027-10-05', h=12.3, zone='l118_pasta', flags=dict(TW3), js=SQB('Pasta 118'), pref=['白醬雞肉麵', '「要我幫忙嗎？」', '出發：Pasta'],
       steps=[ORDER('Pasta 118'), ('jump', OUTD('ev_sq12_pasta'), 18.5, '下禮拜一 18:30'), ('until', 21.0), ('chk', '週一那一晚演完＝做完', SQST('SQ12'), 'done/done'),
              TRWAIT('SQ12'), TRCHK('SQ12', False, '做完當天：吧檯後面還沒有照片（3D）'), NEXT(1, 12.3), ORDER('Pasta 118'), TRCHK('SQ12', True, '隔天：吧檯後面兩人照（3D）'), ('shot', 'photo', TT('SQ12'), None),
              ('jump', "STORY.dayOfKey('2028-03-07')", 12.3, '下學期（大三下）'), ORDER('Pasta 118')],
       want=R7T(SQL['SQ12']['open']) + [SQL['SQ12'][k] for k in ('inN', 'in', 'knew', 'yesN', 'photo', 'free', 'wall', 'greet', 'her')] + TOASTS('SQ12'), none=[SQL['SQ12']['inPair']], dmoney=-390),   # 130×3（那一晚沒收錢）
  dict(id='SQ52_SQ12_PAIR', key='2027-10-05', h=12.3, zone='l118_pasta', flags=dict(TW3), js=SQB('Pasta 118') + AN_D, pref=['白醬雞肉麵', '「要我幫忙嗎？」', '以安一起去）', '出發：Pasta'],
       steps=[ORDER('Pasta 118'), ('jump', OUTD('ev_sq12_pasta'), 18.5, '下禮拜一 18:30'), ('until', 21.0)],
       want=['CHOICE:（一個人去）｜（約', '以安一起去）', SQL['SQ12']['inPair'], SQL['SQ12']['pair']['heroine_01']], none=[SQL['SQ12']['in'], '沛珊一起去）', '芷若一起去）'],
       jsok=[('一起去的是以安', "(r=>r?r.partner:null)(SIDEQ.get(GAME.G,'SQ12'))", 'heroine_01'), ('【讀資料】可選名單（芷若、沛珊大三上不在臺北：不在選項）', "Object.keys(SIDEQ.LINES.SQ12.pair).sort()", ['heroine_01', 'heroine_03', 'heroine_04', 'heroine_05', 'kexin'])]),
  dict(id='SQ45_SQ12_Y3S2', key='2028-03-07', h=12.3, zone='l118_pasta', flags=dict(TW3), js=SQB('Pasta 118'), pref=['白醬雞肉麵', '「要我幫忙嗎？」'], steps=[ORDER('Pasta 118')],
       none=R7T(SQL['SQ12']['open'])[:1], jsok=[('大三下：不開口（只有大三上）', SQST('SQ12'), None)]),
  dict(id='SQ45_SQ13', key='2026-10-13', h=12.3, zone='l118_korea', flags=dict(TW3), js=SQB('韓食小廚'), pref=['海苔飯捲', '「要我幫忙嗎？」', '「比上次好。」'],
       steps=[ORDER('韓食小廚'), NEXT(1, 12.3), ORDER('韓食小廚'), NEXT(1, 12.3), ORDER('韓食小廚'), ('chk', '第三次＝她從韓國寄來的那一罐；等老闆娘回來', SQST('SQ13'), 'open/wait'),
              ('chk', '「這罐怎樣？」問了三次', LOGN(SQL['SQ13']['ask']), lambda n: isinstance(n, int) and n >= 3),
              NEXT(88, 12.3), ORDER('韓食小廚'), ('chk', '三個月後老闆娘回來＝做完', SQST('SQ13'), 'done/done'), TRWAIT('SQ13'), TRCHK('SQ13', False, '做完當天：小菜櫃頂上還沒有罐子（3D）'),
              NEXT(1, 12.3), ORDER('韓食小廚'), TRCHK('SQ13', True, '隔天：小菜櫃頂上「她的」罐子（3D）'), ('shot', 'jar', TT('SQ13'), None), NEXT(1, 12.3), ORDER('韓食小廚')],
       want=SQL['SQ13']['open'] + [SQL['SQ13']['ask'], SQL['SQ13']['reveal']] + SQL['SQ13']['better'] + SQL['SQ13']['back'] + [SQL['SQ13']['jar'], SQL['SQ13']['greet']] + TOASTS('SQ13'),
       none=R7T(SQL['SQ13']['other']), rep=[SQL['SQ13']['ask']], dmoney=-420),   # 70×6
  dict(id='SQ45_SQ13_SAME', key='2026-10-13', h=12.3, zone='l118_korea', flags=dict(TW3), js=SQB('韓食小廚'), pref=['海苔飯捲', '「要我幫忙嗎？」', '「一樣。」'],
       steps=[ORDER('韓食小廚'), NEXT(1, 12.3), ORDER('韓食小廚'), NEXT(1, 12.3), ORDER('韓食小廚')], want=[SQL['SQ13']['reveal']] + R7T(SQL['SQ13']['other']), none=SQL['SQ13']['better'][:1], rep=[SQL['SQ13']['ask']]),
  dict(id='SQ45_SQ13_EARLY', key='TERMDAY:Y1S2:5:2', h=12.3, zone='l118_korea', flags=dict(TW3), js=SQB('韓食小廚'), pref=['海苔飯捲', '「要我幫忙嗎？」'], steps=[ORDER('韓食小廚')],
       none=SQL['SQ13']['open'][:1], jsok=[('大一：不開口（大二上起）', SQST('SQ13'), None)]),
  dict(id='SQ45_SQ14', key='2028-03-08', h=14.0, zone='wz_teahouse', flags=dict(TW3), js=SQB('溫州街・一盞') + CATN, pref=['凍頂烏龍', '「要我幫忙嗎？」', '出發：回診'],
       steps=[TEAH, ('chk', '掛著：兩週內把貓放進外出籠', SQST('SQ14'), 'open/cage'), ENT('2028-03-08', 15.0, 'wenzhou'), NCAT, ('usep', '^看麻糬$'), ('until', 17.2), ('chk', '動物醫院回來＝做完', SQST('SQ14'), 'done/done'),
              ENT('2028-03-09', 14.0, 'wz_teahouse'), TEAH, TRWAIT('SQ14'), TRCHK('SQ14', True, '隔天：水屋上的舊貓照片（3D）'), ('shot', 'photo', TT('SQ14'), None), ENT('2028-03-10', 14.0, 'wz_teahouse'), TEAH],
       want=SQL['SQ14']['open'] + [SQL['SQ14']['cage']] + SQL['SQ14']['chip'] + [SQL['SQ14']['backN']] + SQL['SQ14']['back'] + [SQL['SQ14'][k] for k in ('tea', 'photo', 'greet')] + TOASTS('SQ14'), dmoney=-840),   # 280×3
  dict(id='SQ52_SQ14_NOTICE', key='2028-12-14', h=21.75, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=Y4 + ZQF + CATN + SQ08DONE + SQ14DONE, pref=['「我幫妳抱。」', '領養'],
       steps=[NTREE, TREE, ('until', 22.75), ('jump', "STORY.dayOfKey('2028-12-15')", 11.8, '隔天中午前'), ('until', 12.3), ('jump', "STORY.dayOfKey('2028-12-17')", 16.0, '12/17 下午'), NNOTICE, NOTICE],
       wantMsg=CAT_VET + SQL['SQ14']['zq'], want=[ADOPT, SQL['SQ14']['notice']], once=CAT_EV0),   # 做完 SQ14：12/15 子晴的照片多兩句、12/17 領養告示多「（豆花）」
  dict(id='SQ52_SQ14_NO', key='2028-12-17', h=16.0, zone='wenzhou', flags=dict(TWF), gset={'weather': 'clear'}, js=Y4 + NOKX + CATN + SQ08DONE + " G.flags.ZQ_CAT_NIGHT=true;", pref=['領養'],
       steps=[NNOTICE, NOTICE], want=[ADOPT], none=[SQL['SQ14']['notice']], once=[]),   # [前置] 那一場演過、沒有 SQ14
  dict(id='SQ45_SQ15', key='2026-10-06', h=15.0, zone='bookstore', flags=dict(TW3), js=SQB('舊路書房') + SISF, pref=['只是看看', '「要我幫忙嗎？」', '「這本我買。」', '學姊大一的民法總則'],
       steps=[BOOKB, ('chk', '掛著：一週內去整理', SQST('SQ15'), 'open/sort'), ENT('2026-10-07', 15.0, 'bookstore'), BOOKB, ('chk', '買下來＝做完', SQST('SQ15'), 'done/done'),
              ('meet', 'heroine_05', '+1', '+6'), ('talk', 'heroine_05'), ENT('2026-10-20', 14.0, 'dorm'), ROOMI],
       want=SQL['SQ15']['open'] + [SQL['SQ15']['look']] + SQL['SQ15']['find'] + [SQL['SQ15']['who'], SQL['SQ15']['reply'][0], SA['put'], SA['how'], SA['bought'], SA['ugly'], SA['keep'], SQL['SQ15']['shelf']] + TOASTS('SQ15'),
       none=[SA['asked'], SQL['SQ15']['eve']], dmoney=-80, jsok=[('房間多一件「學姊大一的民法總則」', ROOMX % json.dumps('學姊大一的民法總則'), lambda x: isinstance(x, list) and len(x) == 1)]),
  dict(id='SQ52_SQ15_ASK', key='2026-10-06', h=15.0, zone='bookstore', flags=dict(TW3), js=SQB('舊路書房') + SISF, pref=['只是看看', '「要我幫忙嗎？」', '「幫我留著，我問問她。」'],
       steps=[BOOKB, ENT('2026-10-07', 15.0, 'bookstore'), BOOKB, ('chk', '幫我留著：一週內找學姊', SQST('SQ15'), 'open/sis'), ('meet', 'heroine_05', '+1', '+6'), ('talk', 'heroine_05'),
              ('chk', '問過她：下一次去買', SQST('SQ15'), 'open/buy'), ENT('2026-10-14', 15.0, 'bookstore'), BOOKB],
       want=[SQL['SQ15']['reply'][1], SA['put'], SA['asked'], SA['keep'], SQL['SQ15']['buy']] + TOASTS('SQ15'), none=[SA['bought']], dmoney=-80, jsok=[('做完', SQST('SQ15'), 'done/done')]),
  dict(id='SQ52_SQ15_RECYCLE', key='2026-10-06', h=15.0, zone='bookstore', flags=dict(TW3), js=SQB('舊路書房') + SISF, pref=['只是看看', '「要我幫忙嗎？」', '「這幾本修法了，不能賣。」'],
       steps=[BOOKB, ENT('2026-10-07', 15.0, 'bookstore'), BOOKB], want=[SQL['SQ15']['reply'][2]], none=[SA['put']], dmoney=0,
       jsok=[('做完、書拿去回收', "[%s, GAME.G.flags.SQ15_BOOK]" % SQST('SQ15'), ['done/done', 'recycled']), ('房間沒有那本書', ROOMX % json.dumps('學姊大一的民法總則'), [])]),
  dict(id='SQ45_SQ15_NOSIS', key='2026-10-06', h=15.0, zone='bookstore', flags=dict(TW3), js=SQB('舊路書房'), pref=['只是看看', '「要我幫忙嗎？」'], steps=[BOOKB],
       none=SQL['SQ15']['open'][:1], jsok=[('不認識學姊：不開口', SQST('SQ15'), None)]),
  dict(id='SQ45_SQ17', key='2027-03-09', h=15.0, zone='l118_tea', flags=dict(TW3), js=SQB('一一八茶飲') + " LV('heroine_01',45,30,20); G.contacts=G.contacts||{}; G.contacts.heroine_01=D('2025-09-10');",
       pref=['紅茶拿鐵', '「要我幫忙嗎？」', '「為什麼想去？」', '「去了想學什麼？」', '「如果沒上呢？」', '「上了跟我說。」'],
       steps=[ORDER('一一八茶飲'), NEXT(1, 15.0), ORDER('一一八茶飲'), ('chk', '前兩題沒有封膜機那一句', LOGN(SQL['SQ17']['en']), 0), NEXT(1, 15.0), ORDER('一一八茶飲'),
              ('chk', '給了號碼：聯絡人多「一一八茶飲的店員」', "!!(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(GAME.G,'tea118_staff'))", True),
              ('jump', "STORY.dayOfKey('2027-04-25')", 20.8, '4/25 晚上'), ('until', 21.3), ('chk', '私訊「上了。京都。」到了＝做完', SQST('SQ17'), 'done/done'),
              ('jump', "STORY.dayOfKey('2028-03-07')", 15.0, '大三下'), ORDER('一一八茶飲'), ('jump', "STORY.dayOfKey('2028-04-20')", 20.8, '2028-04-20 晚上'), ('until', 21.3)],
       want=R7T(SQL['SQ17']['open']) + [t for a in SQL['SQ17']['ans'] for t in a] + [SQL['SQ17']['en'], SQL['SQ17']['call'], SQL['SQ17']['trace'],
             'CHOICE:「為什麼想去？」｜「去了想學什麼？」', 'CHOICE:「去了想學什麼？」', 'CHOICE:「如果沒上呢？」', 'CHOICE:「上了跟我說。」｜「加油。」'] + TOASTS('SQ17'),
       wantMsg=[SQL['SQ17']['result']] + SQL['SQ17']['an'], msgAt={SQL['SQ17']['result']: ('2027-04-25', 21.0, 0.1)}, dmoney=-200),   # 50×4
  dict(id='SQ52_SQ17_CHEER', key='2027-03-09', h=15.0, zone='l118_tea', flags=dict(TW3), js=SQB('一一八茶飲'), pref=['紅茶拿鐵', '「要我幫忙嗎？」', '「為什麼想去？」', '「去了想學什麼？」', '「如果沒上呢？」', '「加油。」'],
       steps=[ORDER('一一八茶飲'), NEXT(1, 15.0), ORDER('一一八茶飲'), NEXT(1, 15.0), ORDER('一一八茶飲'), ('jump', "STORY.dayOfKey('2027-04-26')", 15.0, '4/26（四月底以後）'), ORDER('一一八茶飲')],
       want=[SQL['SQ17']['en'], SQL['SQ17']['result']], none=[SQL['SQ17']['call']], noneMsg=[SQL['SQ17']['result']], dmoney=-200,
       jsok=[('沒給號碼：沒有聯絡人', "!!(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(GAME.G,'tea118_staff'))", False), ('四月底以後當面說＝做完', SQST('SQ17'), 'done/done')]),
  dict(id='SQ45_SQ17_MAY', key='2027-05-11', h=15.0, zone='l118_tea', flags=dict(TW3), js=SQB('一一八茶飲'), pref=['紅茶拿鐵', '「要我幫忙嗎？」'], steps=[ORDER('一一八茶飲')],
       none=SQL['SQ17']['open'][:1], jsok=[('五月：不開口（大二下 3～4 月）', SQST('SQ17'), None)]),
  dict(id='SQ45_SQ18', key='2027-10-05', h=15.0, zone='gongguan', flags=dict(TW3), js=SQB('清葉茶行') + CATN + SQ08DONE, pref=['青茶 微糖', '「要我幫忙嗎？」', '出發：週日早上', '餵貓表', '摸摸麻糬'],
       steps=[NGGTEA, GGTEA, ('jump', OUTD('ev_sq18_park'), 8.0, '週日早上'), ('until', 9.8), ('chk', '清掃日演完＝做完', SQST('SQ18'), 'done/done'), ENT('2027-10-12', 16.0, 'wenzhou'), NNOTICE, NOTICE, NCAT, ('usep', '^摸摸麻糬$')],
       want=SQL['SQ18']['open'] + [SQL['SQ18'][k] for k in ('clean', 'chief', 'who', 'sheet', 'stay', 'cup', 'knows', 'tag')] + TOASTS('SQ18'), none=[SQL['SQ18']['papers']], rep=[SQL['SQ18']['knows']], dmoney=-40),   # 運費＝一杯，錢沒變
  dict(id='SQ45_SQ18_NO08', key='2027-10-05', h=15.0, zone='gongguan', flags=dict(TW3), js=SQB('清葉茶行'), pref=['青茶 微糖', '「要我幫忙嗎？」', '出發：週日早上'],
       steps=[NGGTEA, GGTEA, ('jump', OUTD('ev_sq18_park'), 8.0, '週日早上'), ('until', 9.8)], want=[SQL['SQ18']['papers'], SQL['SQ18']['cup']], none=[SQL['SQ18']['sheet']], dmoney=-40),   # 沒貼過餵貓表
  dict(id='SQ45_SQ19', key='2026-10-07', h=12.3, zone='wz_teishoku', flags=dict(TW3), js=SQB('巷子裡定食'), pref=['炸雞定食', '「要我幫忙嗎？」', '「看了最後一行。」'],
       steps=[WZORD, ('chk', '掛著：一週內還她', SQST('SQ19'), 'open/ret'), ENT('2026-10-08', 12.1, 'l118_home'), WAITNPC('classmate_xinci'), ('talk', 'classmate_xinci'), ('chk', '還了＝做完', SQST('SQ19'), 'done/done'),
              ENT('2026-10-09', 12.3, 'wz_teishoku'), WZORD, TRWAIT('SQ19'), TRCHK('SQ19', True, '隔天：結帳台的失物竹籃（3D）'), ('shot', 'basket', TT('SQ19'), None), NEXT(1, 12.3), WZORD,
              ENT('2026-10-22', 8.8, 'dorm'), ('until', 9.3)],
       want=SQL['SQ19']['open'] + [SQL['SQ19']['look']] + SQL['SQ19']['last'] + [SQL['SQ19']['ret'], SQL['SQ19']['ask']] + R7T(SQL['SQ19']['seen']) + [SQL['SQ19']['basket'], SQL['SQ19']['greet']] + TOASTS('SQ19'),
       dmoney=-510, jsok=[('兩週以後班上群組：芯慈兩則＋以安「好。」', NYEG % json.dumps('sq19_group'), ['classmate_xinci：' + SQL['SQ19']['group'][0][1], 'classmate_xinci：' + SQL['SQ19']['group'][1][1], 'heroine_01：' + SQL['SQ19']['group'][2][1]])]),
  dict(id='SQ52_SQ19_NO', key='2026-10-07', h=12.3, zone='wz_teishoku', flags=dict(TW3), js=SQB('巷子裡定食'), pref=['炸雞定食', '「要我幫忙嗎？」', '「沒有。」'],
       steps=[WZORD, ENT('2026-10-08', 12.1, 'l118_home'), WAITNPC('classmate_xinci'), ('talk', 'classmate_xinci'), ENT('2026-10-22', 8.8, 'dorm'), ('until', 9.3)],
       want=R7T(SQL['SQ19']['no']), none=R7T(SQL['SQ19']['seen'])[1:], jsok=[('做完', SQST('SQ19'), 'done/done'), ('選「沒有。」：兩週以後沒有群組那三則', NYEG % json.dumps('sq19_group'), [])]),
  dict(id='SQ45_SQ20', key='2027-10-06', h=10.0, zone='wz_brunch', flags=dict(TW3), js=SQB('溫州街・半熟') + BHFORGET, pref=['半熟蛋吐司套餐', '「要我幫忙嗎？」', '出發：半熟'],
       steps=[WZORD, ('jump', OUTD('ev_sq20_s1'), 7.5, '週六早上（第 1 次）'), ('until', 9.9), ('chk', '第 1 次練完：排第 2 次', SQST('SQ20'), 'open/s2'),
              ('jump', OUTD('ev_sq20_s2'), 7.5, '下週六早上（第 2 次）'), ('until', 9.9), ('chk', '第 2 次練完：等考試', SQST('SQ20'), 'open/wait'),
              ('jump', "(r=>r&&r.wait!=null?r.wait+1:null)(SIDEQ.get(GAME.G,'SQ20'))", 10.0, '一個月以後（週一公休，隔天）'), WZORD, ('chk', '一個月以後兩個人都過了＝做完', SQST('SQ20'), 'done/done'),
              NEXT(1, 10.0), WZORD, TRWAIT('SQ20'), TRCHK('SQ20', True, '隔天：東牆兩張證書（3D）'), ('shot', 'certs', TT('SQ20'), None), NEXT(1, 10.0), WZORD],
       want=SQL['SQ20']['open'] + R7T(SQL['SQ20']['self1']) + [SQL['SQ20']['self2'], SQL['SQ20']['apronN']] + SQL['SQ20']['apron'] + [SQL['SQ20'][k] for k in ('pass', 'certs', 'greet')] + TOASTS('SQ20'),
       none=[SQL['SQ20']['bohan']], dmoney=-760),   # [前置] 不認識柏翰（沒有「找柏翰」的選項）；190×4
  dict(id='SQ52_SQ20_BOHAN', key='2027-10-06', h=10.0, zone='wz_brunch', flags=dict(TW3), js=SQB('溫州街・半熟') + BHK, pref=['半熟蛋吐司套餐', '「要我幫忙嗎？」', '「我找一個更會計時的人。」', '出發：半熟'],
       steps=[WZORD, ('jump', OUTD('ev_sq20_s1'), 7.5, '週六早上（第 1 次）'), ('until', 9.9), ('jump', OUTD('ev_sq20_s2'), 7.5, '下週六早上（第 2 次）'), ('until', 9.9)],
       want=['CHOICE:（自己幫她計時）｜「我找一個更會計時的人。」', SQL['SQ20']['bohan'], SQL['SQ20']['apronN']] + SQL['SQ20']['apron'], none=R7T(SQL['SQ20']['self1'])[:1] + [SQL['SQ20']['self2']],
       jsok=[('找了柏翰', "!!(SIDEQ.get(GAME.G,'SQ20')||{}).bohan", True)]),
  # 過期以後下一次來，店員交代一句（AA_408 第 1 節；一次、不扣分）：三區各一個情境
  dict(id='SQ45_LAPSE_L118', key='2027-10-05', h=12.3, zone='l118_dian', flags=dict(TW3), js=NOKX + SQROLL + LAPSE5 % json.dumps([['SQ10', 'go'], ['SQ11', 'check'], ['SQ12', 'go'], ['SQ13', 'taste'], ['SQ17', 'ask']]),
       pref=['椒麻雞飯', '排骨飯', '白醬雞肉麵', '海苔飯捲', '紅茶拿鐵'],
       steps=[ORDER('滇香小館'), ENT('2027-10-05', 12.3, 'l118_home'), ORDER('巷口家常菜'), ENT('2027-10-05', 12.3, 'l118_pasta'), ORDER('Pasta 118'), ENT('2027-10-05', 12.3, 'l118_korea'), ORDER('韓食小廚'),
              ENT('2027-10-05', 15.0, 'l118_tea'), ORDER('一一八茶飲'), ENT('2027-10-07', 12.3, 'l118_korea'), ORDER('韓食小廚'), TRWAIT('SQ13'), TRCHK('SQ13', True, 'SQ13 過期：「她的」罐子照樣有（3D）'),
              ENT('2027-10-07', 12.3, 'l118_dian'), ORDER('滇香小館')],
       want=[SQL[i]['lapse'] for i in ('SQ10', 'SQ11', 'SQ12', 'SQ13', 'SQ17')] + [SQL['SQ13']['jar']], none=[SQL['SQ10']['menu'], SQL['SQ13']['greet']], dmoney=-635,
       jsok=[('五則都過期、店員都交代過', LAPSEQ % json.dumps(['SQ10', 'SQ11', 'SQ12', 'SQ13', 'SQ17']), ['SQ10:lapsed/told', 'SQ11:lapsed/told', 'SQ12:lapsed/told', 'SQ13:lapsed/told', 'SQ17:lapsed/told'])]),
  dict(id='SQ45_LAPSE_WZ', key='2027-10-06', h=13.0, zone='wz_teahouse', flags=dict(TW3), js=NOKX + SQROLL + CATN + LAPSE5 % json.dumps([['SQ14', 'cage'], ['SQ19', 'ret'], ['SQ20', 's1']]),
       pref=['凍頂烏龍', '炸雞定食', '半熟蛋吐司套餐'],
       steps=[TEAH, ENT('2027-10-06', 13.0, 'wz_teishoku'), WZORD, ENT('2027-10-06', 13.0, 'wz_brunch'), WZORD, ENT('2027-10-07', 13.0, 'wz_brunch'), WZORD, TRWAIT('SQ20'), TRCHK('SQ20', True, 'SQ20 過期：兩張證書照樣有（3D）'),
              ENT('2027-10-07', 13.0, 'wz_teishoku'), WZORD, TRWAIT('SQ19'), TRCHK('SQ19', False, 'SQ19 過期：沒有失物籃（3D）')],
       want=[SQL[i]['lapse'] for i in ('SQ14', 'SQ19', 'SQ20')] + [SQL['SQ20']['certs']], none=[SQL['SQ19']['basket'], SQL['SQ20']['greet']], dmoney=-1000,
       jsok=[('三則都過期、店員都交代過', LAPSEQ % json.dumps(['SQ14', 'SQ19', 'SQ20']), ['SQ14:lapsed/told', 'SQ19:lapsed/told', 'SQ20:lapsed/told'])]),
  dict(id='SQ45_LAPSE_GG', key='2027-10-05', h=15.0, zone='gongguan', flags=dict(TW3), js=NOKX + SQROLL + LAPSE5 % json.dumps([['SQ15', 'sort'], ['SQ18', 'go']]), pref=['青茶 微糖', '只是看看'],
       steps=[NGGTEA, GGTEA, ENT('2027-10-05', 15.0, 'bookstore'), BOOKB], want=[SQL['SQ18']['lapse'], SQL['SQ15']['lapse']], dmoney=-40,
       jsok=[('兩則都過期、店員都交代過', LAPSEQ % json.dumps(['SQ15', 'SQ18']), ['SQ15:lapsed/told', 'SQ18:lapsed/told']), ('SQ15 過期＝書拿去回收', "GAME.G.flags.SQ15_BOOK", 'recycled')]),
  # ======== 53. 做完的痕跡 3D 道具（五家店）========
  TRSCN('SQ12', '2027-10-11', 12.3, 'l118_pasta', 'lane118', '2027-10-12'),
  TRSCN('SQ13', '2026-10-13', 12.3, 'l118_korea', 'lane118', '2026-10-14'),
  TRSCN('SQ14', '2028-03-08', 14.0, 'wz_teahouse', 'wenzhou', '2028-03-09'),
  TRSCN('SQ19', '2026-10-08', 12.3, 'wz_teishoku', 'wenzhou', '2026-10-09'),
  TRSCN('SQ20', '2027-11-16', 10.0, 'wz_brunch', 'wenzhou', '2027-11-17',
        extra=[('shot', 'fade', TT('SQ20', face=True, d=1.0, dist=3.2, pitch=0.1), None), ('chk', '鏡頭在東牆那一側（牆淡出）：證書的狀態（只記錄，看截圖）', TRACEQ('SQ20'), lambda x: True)]),
  dict(id='SQ53_LAPSE', key='2026-10-14', h=12.3, zone='l118_korea', flags=dict(TW3), js=NOKX + LAPSEDJS, pref=[], want=[],
       steps=[TRWAIT('SQ13'), ('shot', 'korea', TT('SQ13'), None), TRCHK('SQ13', True, 'SQ13 過期：罐子照樣有'), ENT('2026-10-14', 10.0, 'wz_brunch'), TRWAIT('SQ20'), ('shot', 'brunch', TT('SQ20'), None), TRCHK('SQ20', True, 'SQ20 過期：證書照樣有'),
              ENT('2026-10-15', 12.3, 'wz_teishoku'), TRWAIT('SQ19'), ('shot', 'teishoku', TT('SQ19'), None), TRCHK('SQ19', False, 'SQ19 過期：沒有失物籃'),
              ENT('2026-10-19', 12.3, 'l118_pasta'), TRWAIT('SQ12'), ('shot', 'pasta', TT('SQ12'), None), TRCHK('SQ12', False, 'SQ12 過期：沒有照片')]),
  dict(id='SQ53_NONE', key='2026-10-14', h=12.3, zone='l118_korea', flags=dict(TW3), js=NOKX, pref=[], want=[],
       steps=[TRWAIT('SQ13'), ('shot', 'korea', TT('SQ13'), None), TRCHK('SQ13', False, '沒做：韓食沒有罐子'), ENT('2026-10-15', 10.0, 'wz_brunch'), TRWAIT('SQ20'), ('shot', 'brunch', TT('SQ20'), None), TRCHK('SQ20', False, '沒做：半熟沒有證書'),
              ENT('2026-10-15', 12.3, 'wz_teishoku'), TRWAIT('SQ19'), ('shot', 'teishoku', TT('SQ19'), None), TRCHK('SQ19', False, '沒做：定食沒有失物籃'),
              ENT('2026-10-15', 14.0, 'wz_teahouse'), TRWAIT('SQ14'), ('shot', 'teahouse', TT('SQ14'), None), TRCHK('SQ14', False, '沒做：一盞沒有貓照片'),
              ENT('2026-10-19', 12.3, 'l118_pasta'), TRWAIT('SQ12'), ('shot', 'pasta', TT('SQ12'), None), TRCHK('SQ12', False, '沒做：Pasta 沒有照片')]),
  # ======== 54. SQ16 輪轉單車 ========
  dict(id='SQ54_BIKE', key='2026-09-28', h=15.0, zone='gongguan', flags=dict(TW3), js=NOKX + SQROLL, pref=['「要我幫忙嗎？」', '「請問一下，這張貼紙是你們社團的嗎？」'],
       steps=[('chk', '公館多「找車行老闆」（SIDEQ.bikeShop 有了才顯示）', SQ16_BTN, True), NBIKE, BIKE, NEXT(1, 15.0), BIKE, NEXT(1, 15.0), BIKE, NEXT(1, 15.0), BIKE,
              ('chk', '前四次（一天一次）：沒有開口', SQST('SQ16'), None), ('chk', '算了 4 次', "SIDEQ.bikeN(GAME.G)", 4), NEXT(1, 15.0), BIKE, ('chk', '第 5 次開口 →「要我幫忙嗎？」＝掛進去（兩週內）', SQST('SQ16'), 'open/ask'),
              ('chk', '手機「今天」：輪轉單車那一則＋「問登山社的人」', TODAYQ, lambda s: isinstance(s, str) and SQT['SQ16'] in s and '問登山社的人' in s),
              ENT('2026-10-08', 19.6, 'putong'), ('chk', '週四 19:36：201 門口的字變「問登山社的人」', HIKEQ, True), N201, ('usep', '^問登山社的人$'), ('chk', '問到了：下一步回車行', SQST('SQ16'), 'open/back'),
              ENT('2026-10-09', 15.0, 'gongguan'), NBIKE, BIKE, ('chk', '回車行＝做完', SQST('SQ16'), 'done/done'), ('shot', 'day0', TT('SQ16'), None), TRCHK('SQ16', False, '做完當天：還沒有紙條（3D）'),
              NEXT(1, 15.0), BIKE, ('shot', 'day1', TT('SQ16'), None), TRCHK('SQ16', True, '隔天：騎樓淑女車籃子上的紙條（3D）'), NEXT(10, 15.0), BIKE,
              ('jump', "STORY.dayOfKey('2027-02-23')", 15.0, '下學期開學（大二下第 1 週）'), BIKE, NEXT(6, 15.0), BIKE],
       want=SQL['SQ16']['greet'] + SQL['SQ16']['open'] + [SQL['SQ16']['look'], 'CHOICE:「' + SQL['SQ16']['ask'] + '」｜（先不要）'] + SQL['SQ16']['club'] + SQL['SQ16']['msg'] + [SQL['SQ16']['back'], SQL['SQ16']['note'], SQ16_RENAME, SQ16_LENT] + TOASTS('SQ16'),
       none=[SQL['SQ16']['lapse']], rep=SQL['SQ16']['greet'], dmoney=0, jsok=[('下學期第二次來：不再換名字', LOGN(SQ16_RENAME), lambda n: isinstance(n, int) and n >= 1 and n <= 2)]),
  dict(id='SQ54_LAPSE', key='2026-10-05', h=15.0, zone='gongguan', flags=dict(TW3), js=NOKX + SQROLL + " G.flags.BIKE_SHOP={n:4,day:G.day-1,g:0};", pref=['「要我幫忙嗎？」'],
       steps=[NBIKE, BIKE, ('chk', '開口、掛進去', SQST('SQ16'), 'open/ask'), ENT('2026-10-26', 15.0, 'gongguan'), BIKE, ('chk', '兩週內沒去問＝過期', SQST('SQ16'), lambda x: isinstance(x, str) and x.startswith('lapsed')),
              NEXT(1, 15.0), BIKE, ('shot', 'lapsed', TT('SQ16'), None), TRCHK('SQ16', False, '過期：沒有紙條（3D）')],
       want=[SQL['SQ16']['lapse']], none=[SQL['SQ16']['note'], SQL['SQ16']['back']], rep=SQL['SQ16']['greet'], dmoney=0),   # [前置] 前四次已經來過（第 5 次＝今天）
  dict(id='SQ54_HIKE_TIME', key='2026-10-07', h=19.75, zone='putong', flags=dict(TW3), js=NOKX + " SIDEQ.rec(G).SQ16={state:'open',step:'ask',day:D('2026-10-02'),term:'Y2S1',by:D('2026-10-16')};", pref=[], want=[],
       steps=[('chk', '週三 19:45：201 門口不是「問登山社的人」', HIKEQ, False), ENT('2026-10-08', 18.0, 'putong'), ('chk', '週四 18:00：也不是', HIKEQ, False),
              ('jump', 'GAME.G.day', 19.75, '同一天 19:45'), ('chk', '週四 19:45：是', HIKEQ, True), ('jump', 'GAME.G.day', 21.1, '同一天 21:06'), ('chk', '21:00 以後：又不是', HIKEQ, False)]),   # [前置] SQ16 掛著（問登山社那一步）
  dict(id='SQ54_Y1', key='2026-04-06', h=15.0, zone='gongguan', flags=dict(TW3), js=NOKX + SQROLL + " G.flags.BIKE_SHOP={n:9,day:G.day-1,g:0};", pref=['「要我幫忙嗎？」'], steps=[NBIKE, BIKE],
       none=SQL['SQ16']['open'][:1], dmoney=0, jsok=[('大一：不開口（大二起）', SQST('SQ16'), None), ('平常的招呼', "(window.__LOG||[]).some(x=>%s.includes(x.t))" % json.dumps(SQL['SQ16']['greet'], ensure_ascii=False), True)]),
]
for _sc in R7:
    _sc['js'] = SAYH + _sc.get('js', '')
    _sc.setdefault('once', [w for w in _sc.get('want', []) if len(w) > 6 and not w.startswith('CHOICE:') and w not in _sc.get('rep', [])])   # 同 R6；選單、說好會重複的（rep）不算
SCENS = SCENS + R7
# ---- R8：清單第 57～60 項（LAWWW-B 10-23 17:30 派，開發分支 9c71e004a）——霖澤館 5F 研究室（CLOSED-SPACES-1023，src/lab5f3d.js）＋交往中叫「書瑀」（AA_411）----
#   57 4F 刷卡門「往 5F 以上」：她在研究室（碩一～碩三週一～週四 12:20～14:00）＋見過她＝「傳訊息給學姊／算了」→ 兩分鐘後照關係開門一句 → 進 5F；一天一次；其他時候只有門上那一句
#   58 14:00 她說「我要去總圖了。」→ 回 4F 樓梯間、不卡、不重複
#   59 研究室出遊改在 5F 演：校園／宿舍出發＝ADV 底圖 blur、人在 linze_5f；家裡出發照舊 2D；聖誕夜只亮她的燈、口試中門牌、兩張書桌坐旁邊；演完回原處
#   60 交往中三句＋按鈕、標題卡、系統提醒換「書瑀」；沒交往、分手以後照舊「學姊」
CAP2 = " if(GAME.caption&&!GAME.caption.__c2){ const c0=GAME.caption; const f=function(a,b){ try{ window.__LOG.push({n:'CAPTION2',t:'CAPTION2:'+(b==null?'':String(b)),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return c0.apply(this,arguments); }; f.__c2=1; GAME.caption=f; }"   # 門上那一句（GM.caption 的第二個參數；舊的 CAPTION 只記第一個）
ZHK = (" if(!window.__ZH){ window.__ZH=1; window.__ZL=[]; window.__LZ=[]; const s0=GAME.say; GAME.say=function(w,t){ try{ const P=GAME.E.player; window.__ZL.push({z:GAME.G.zone,seat:!!P.seat,t:String(t).slice(0,24)}); }catch(e){} return s0.apply(this,arguments); };"
       " if(typeof LZUP!=='undefined') for(const k of ['examSign','labLights']){ const f0=LZUP[k]; if(typeof f0==='function') LZUP[k]=function(){ try{ window.__LZ.push(k+':'+[...arguments].join(',')); }catch(e){} return f0.apply(this,arguments); }; } }")   # 每一句話當時在哪一區、有沒有坐著；研究室的燈和口試門牌叫了什麼
R8H = SAYH + CAP2 + ZHK + " " + BGHOOK + ";"
LOWLV = " LV('heroine_05',25,10,10);"   # 有點熟（FAMILIAR）
LAB_DOOR = '5 樓以上是研究室，樓梯間的門要刷教職員證。'
OPEN = {'low': '……有事嗎。進來。', 'friend': '你來了。進來，小聲一點。', 'lover': '（她開了門，沒有說話，拉你的袖子進去。）'}
N4UP = NEAR('4F 樓梯間「往 5F 以上」', label='往 5F 以上'); DOOR = ('usep', '^往 5F 以上$')
N5DN = NEAR('5F 樓梯間「走樓梯下樓（4F）」', label='走樓梯下樓（4F）'); DOWN = ('usep', '^走樓梯下樓（4F）$')
NSIS = ('jsrun', "(()=>{ const E=GAME.E, P=E.player; if(E.placeAt) E.placeAt(P,-5.65,4.2,0); else P.obj.position.set(-5.65,0,4.2); return [-5.65,4.2]; })()", '主角直接放到學姊的位子旁邊（不從樓梯間走過去：負載高會逾時）')   # 【捷徑】
IN5 = ('wait', "GAME.G.zone==='linze_5f'", 120, '進到 5F')
SISDESK = "(n=>!!n&&Math.hypot(n.obj.position.x+5.65,n.obj.position.z-5.45)<0.8)(GAME.npc&&GAME.npc.heroine_05)"
CHN = lambda t: "(t=>(window.__LOG||[]).filter(x=>String(x.t).startsWith('CHOICE:')&&String(x.t).includes(t)).length)(%s)" % json.dumps(t, ensure_ascii=False)
FREEQ = "(()=>{ const P=GAME.E.player; return !P.busy&&!(GAME.D&&GAME.D.active); })()"
SCHEDZ = "(()=>{ const e=STORY.schedEnt(CHARACTERS.heroine_05,GAME.G); return e?e.zone:null; })()"
CAPQ = LNQ('CAPTION2:' + LAB_DOOR)
def LABS(i, key, h, js, tier, more=None, extra=None):
    st = [N4UP, MK('heroine_05'), DOOR, IN5, ('chk', '她坐在 5F 研究室靠窗的位子（sis_desk）', SISDESK, True), NSIS, ('talk', 'heroine_05')] + (more or [])
    ok = [('「傳訊息給學姊／算了」出現一次', CHN('傳訊息給學姊'), 1), ('今天按過（LAB5_DOOR＝今天）', "GAME.G.flags.LAB5_DOOR===GAME.G.day", True)] + (extra or [])
    return dict(id=i, key=key, h=h, zone='linze_4f', flags=dict(TW3), js=R8H + js, pref=['傳訊息給學姊'], steps=st,
                want=[OPEN[tier]], none=[v for k, v in OPEN.items() if k != tier], jsok=ok)
def LABX(i, key, h, flags, js, why):   # 只有門上那一句
    return dict(id=i, key=key, h=h, zone='linze_4f', flags=flags, js=R8H + js, pref=['算了'], steps=[N4UP, DOOR, ('wait', CAPQ + '>0', 60, '門上那一句')],
                none=list(OPEN.values()), jsok=[(why + '：沒有「傳訊息給學姊」', CHN('傳訊息給學姊'), 0), (why + '：門上那一句', CAPQ, lambda n: isinstance(n, int) and n >= 1), (why + '：還在 4F', "GAME.G.zone", 'linze_4f')])
R8 = [
  # 57＋58：有點熟（2026-09-22 週二 12:27，碩一）→ 開門一句（有點熟）→ 5F → 說話 →【捷徑】撥到 13:55 → 14:00「我要去總圖了。」回 4F
  LABS('LAB57_LOW', '2026-09-22', 12.45, SISB + LOWLV, 'low',
       more=[('jump', 'GAME.G.day', 13.92, '同一天 13:55（在研究室等到 14:00）'), ('wait', "GAME.G.zone==='linze_4f'", 1800, '14:00 她去總圖、祐廷回到 4F'), ('until', 14.15, 600)],
       extra=[('「我要去總圖了。」只說一次', LOGN('我要去總圖了。'), 1), ('回到 4F、恢復控制', FREEQ, True), ('14:00 以後她的作息不在 5F', SCHEDZ, lambda z: z != 'linze_5f'), ('LAB5_IN 清掉', "GAME.G.flags.LAB5_IN==null", True)]),
  # 57：朋友 → 開門一句（朋友）；同一天再下樓、再按一次＝只有門上那一句
  LABS('LAB57_FRIEND', '2026-09-22', 12.45, SISF, 'friend',
       more=[N5DN, DOWN, ('wait', "GAME.G.zone==='linze_4f'", 120, '回到 4F'), ('pref', ['算了']), N4UP, DOOR, ('wait', CAPQ + '>0', 60, '第二次：門上那一句')],
       extra=[('第二次：門上那一句', CAPQ, lambda n: isinstance(n, int) and n >= 1), ('第二次：還在 4F', "GAME.G.zone", 'linze_4f')]),
  # 57：交往中 → 旁白「拉你的袖子進去」
  LABS('LAB57_LOVER', '2026-09-22', 12.45, SIS_D, 'lover'),
  LABX('LAB57_1500', '2026-09-22', 15.0, dict(TW3), SISF, '15:00'),
  LABX('LAB57_FRI', '2026-09-25', 12.5, dict(TW3), SISF, '週五'),
  LABX('LAB57_US', '2028-09-26', 12.5, dict(TWF), Y4 + SISF, '她在美國（2028-09-26 週二）'),
]
# 59：出遊改在 5F（[前置] OUT.plan 寫一筆和遊戲同欄位的出遊；從校園／宿舍站著等「出發」）
def PLAN(o): return " OUT.plan(G,Object.assign(%s,{day:G.day}));" % json.dumps(o, ensure_ascii=False)   # 和遊戲同欄位，日子＝今天
def OUT5(i, key, h, zone, js, o, pref, ev, extra=None, home=False, want=None):
    st = ([('jsrun', "(()=>{ void HOME.arriveQuiet(GAME); return true; })()", '直接到臺北的家（家裡的選單）')] if home else []) + [('until', o['h'] + 0.6, 1500)]
    ok = [('演了 %s' % ev, "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done[%s])" % json.dumps(ev), True)]
    if home: ok += [('從家裡出發：照舊 2D（沒有進 5F）', "(window.__ZL||[]).some(x=>x.z==='linze_5f')", False), ('從家裡出發：沒有 blur 底圖', LNQ('BG:blur'), 0),
                    ('從家裡出發：研究室走廊的照片', "(window.__LOG||[]).filter(x=>/^BG:.*(linze_prof_hall|ra_lab)/.test(String(x.t))).length", lambda n: isinstance(n, int) and n >= 1)]
    else: ok += [('演的時候人在 5F', "(window.__ZL||[]).filter(x=>x.z==='linze_5f').length", lambda n: isinstance(n, int) and n >= 2), ('底圖是模糊的 3D（BG:blur）', LNQ('BG:blur'), lambda n: isinstance(n, int) and n >= 1),
                ('沒有研究室走廊的照片', "(window.__LOG||[]).filter(x=>/^BG:.*(linze_prof_hall|ra_lab)/.test(String(x.t))).length", 0), ('演完回到原本的地方', "GAME.G.zone", zone)]
    return dict(id=i, key=key, h=h, zone=zone, flags=dict(TWF), js=R8H + Y4 + js + PLAN(o), pref=pref, steps=st, want=want or [], jsok=ok + (extra or []))
O_DESK = {'id': 'sisy23_lab', 'ev': 'ev_sis_lab_desk', 'day': 0, 'h': 12 + 20 / 60, 'late': 0.25, 'place': '霖澤館・研究室', 'title': '研究室（幫學姊搬書）', 'travel': '走路 約 10 分鐘', 'travelH': 1 / 6}
O_XMAS = {'id': 'sisb4_xmas_y3', 'ev': 'ev_sis_xmas_y3', 'day': 0, 'h': 21, 'late': 0.25, 'place': '霖澤館・研究室', 'title': '聖誕夜（霖澤館・研究室）', 'travel': '走路 約 10 分鐘', 'travelH': 1 / 6}
O_PLAN = {'id': 'r3_sis_plan_lab', 'ev': 'ev_sis_plan_lab', 'day': 0, 'h': 19, 'late': 0.5, 'place': '霖澤館・研究室', 'title': '研究室', 'travel': '走路 約 10 分鐘', 'travelH': 1 / 6}
O_DESKS = {'id': 'r3_desk_2029-03-07', 'ev': 'ev_sis_y4_desks', 'day': 0, 'h': 21, 'late': 0.75, 'place': '霖澤館・研究室', 'title': '研究室', 'travel': '走路 約 10 分鐘', 'travelH': 1 / 6}
O_DEF = {'id': 'y4_m9', 'ev': 'ev_sis_defense', 'day': 0, 'h': 16, 'late': 2, 'place': '霖澤館・研究室的走廊', 'title': '學姊的口試', 'travel': '', 'travelH': 1 / 6, 'hours': 1}
O_BDAY = {'id': 'pg_sis_bday', 'ev': 'ev_pg_sis_bday', 'day': 0, 'h': 20.5, 'late': 0.5, 'place': '霖澤館・研究室', 'title': '學姊的生日：研究室，八點半', 'travel': '走過去約 10 分鐘', 'travelH': 1 / 6}
DESK_NOTE = '（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，我在這裡。」）'
R8 += [
  OUT5('LAB59_DESK_CAMPUS', '2026-09-22', 11.8, 'campus', SISF, O_DESK, ['出發：研究室', '「照顏色排？」'], 'ev_sis_lab_desk', want=['（研究室有八張桌子。她的在門邊，門一開就撞到椅背。）']),
  OUT5('LAB59_DESK_DORM_D', '2026-09-22', 11.8, 'dorm', SIS_D, O_DESK, ['出發：研究室', '「照顏色排？」'], 'ev_sis_lab_desk', want=[DESK_NOTE]),
  OUT5('LAB59_XMAS_DORM', '2027-12-24', 20.5, 'dorm', SIS_D, O_XMAS, ['出發：聖誕夜'], 'ev_sis_xmas_y3', extra=[('只亮她那一盞燈（labLights:sis）', "(window.__LZ||[]).includes('labLights:sis')", True), ('演完燈恢復（labLights:all）', "(window.__LZ||[]).slice(-1)[0]", 'labLights:all')]),
  OUT5('LAB59_XMAS_HOME', '2027-12-24', 20.62, 'dorm', SIS_D, O_XMAS, ['出發：聖誕夜'], 'ev_sis_xmas_y3', home=True),   # 已經到出發時間才回家（家裡選單一出來就有「出發」）
  OUT5('LAB59_PLAN_CAMPUS', '2029-01-10', 18.5, 'campus', SISF, O_PLAN, ['出發：研究室'], 'ev_sis_plan_lab'),
  OUT5('LAB59_DESKS_DORM_D', '2029-03-07', 20.5, 'dorm', SIS_D, O_DESKS, ['出發：研究室'], 'ev_sis_y4_desks', extra=[('兩張書桌：祐廷坐她旁邊（演的時候坐著）', "(window.__ZL||[]).filter(x=>x.z==='linze_5f'&&x.seat).length", lambda n: isinstance(n, int) and n >= 1)]),
  OUT5('LAB59_DEF_CAMPUS', '2029-05-29', 15.6, 'campus', SISF, O_DEF, ['出發：學姊的口試', '出發'], 'ev_sis_defense', extra=[('口試中門牌：演的時候顯示、演完拿掉', "(window.__LZ||[]).filter(x=>x.startsWith('examSign')).join('｜')", lambda s: isinstance(s, str) and s.startswith('examSign:true') and s.endswith('examSign:false'))]),
  OUT5('LAB59_BDAY_DORM_D', '2029-06-02', 20.0, 'dorm', SIS_D, O_BDAY, ['出發：書瑀的生日', '出發：學姊的生日'], 'ev_pg_sis_bday',
       extra=[('出遊按鈕寫「書瑀的生日」（交往中）', CHN('出發：書瑀的生日'), lambda n: isinstance(n, int) and n >= 1), ('出遊按鈕沒有「學姊的生日」', CHN('出發：學姊的生日'), 0), ('標題卡寫「書瑀的生日」', LNQ('CARD:書瑀的生日'), lambda n: isinstance(n, int) and n >= 1)]),
]
# 59 的分開談話（2029-05-30 17:00，ev_choice_apart_heroine_05；BB-B 18:4x 補）：【前置】和學姊交往中、5/29「選一個人」選了可昕——用遊戲自己的
# R2Y4B.apartSchedule 排（日子先撥回 5/29 排、再撥回 5/30：學姊固定 5/30，fix29 只排在「今天以後」）。祐廷二選一選「我喜歡上別人了。」
APART = (" const d0=G.day; G.day=d0-1; try{ R2Y4B.apartSchedule(G,2029,'kexin',['heroine_05']); }finally{ G.day=d0; }"
         " window.__AP=(()=>{ try{ const R=R2Y4B.apartRound(G,2029); return R&&R.at.heroine_05?JSON.stringify(R.at.heroine_05):null; }catch(e){ return 'ERR '+e; } })();")
O_APART = {'h': 17}
def APART5(i, zone):
    d = OUT5(i, '2029-05-30', 16.4, zone, SIS_D, O_APART, ['出發', '「我喜歡上別人了。」'], 'ev_choice_apart_heroine_05',
             extra=[('【前置】排好了 5/30（apartSchedule）', "window.__AP", lambda s: isinstance(s, str) and '"st":"plan"' in s),   # 讀檔時記下的（演完會變 done）
                    ('談完：不再交往（dating_heroine_05 不是 true）', "GAME.G.flags.dating_heroine_05===true", False)],
             want=['（研究室的走廊。口試的資料還堆在她桌上，一疊一疊用夾子夾好。）', '謝謝你。……畢業快樂，先說了。'])
    d['js'] = R8H + Y4 + SIS_D + APART   # 不用 PLAN：出遊由 apartSchedule 自己排
    return d
R8 += [APART5('LAB59_APART_CAMPUS', 'campus'), APART5('LAB59_APART_DORM_D', 'dorm')]
# 60：交往中叫「書瑀」
NTEA = NEAR('一一八茶飲 點餐', label='點餐（一一八茶飲）')
def SY_TEA(i, js, name, other):
    # BB-B 19:3x：她在一一八茶飲的常客時段只有大一上第 2 週～大一下（lane118_shops.js regulars：平日 12:30～12:40）；原本寫大二上＝她根本不會來（腳本）
    return dict(id=i, key='TERMDAY:Y1S2:5:2', h=12.3, zone='l118_tea', flags=dict(TW3), js=R8H + js, pref=['紅茶拿鐵', '也幫' + name + '點一杯', '無糖綠茶', '去冰'],
                steps=[('jump', 'GAME.G.day', 12.52, '她的時段'), ('wait', "(n=>!!n&&!n.leaving)(GAME.npc&&GAME.npc.heroine_05)", 300, 'heroine_05 在這裡'), NTEA, ORDER('一一八茶飲')],
                jsok=[('選項「也幫%s點一杯」' % name, CHN('也幫' + name + '點一杯'), lambda n: isinstance(n, int) and n >= 1), ('沒有「也幫%s點一杯」' % other, CHN('也幫' + other + '點一杯'), 0)])
EXJS0 = SIS_D + " G.flags.dating_heroine_05=false; try{ const R=G.flags.romance&&G.flags.romance.heroine_05; if(R) R.status='ended'; }catch(e){}"   # [前置] 交往過、分手了
HOOKRUN = ('jsrun', "(()=>{ void (async()=>{ GAME.sceneBegin(); try{ await TERMEND.hook(GAME,'Y3S2','heroine_05'); }catch(e){ console.warn('HOOKRUN',e); } finally{ GAME.sceneEnd(); } })(); return true; })()", '直接叫大三下期末女朋友版約會的鉤子（TERMEND.hook Y3S2 學姊）')   # 【捷徑】
N4STUDY = NEAR('4F 窗邊自習座位', label='坐窗邊（自習）'); STUDY = ('usep', '^坐窗邊（自習）$')
def SY_STUDY(i, js, name):
    return dict(id=i, key='2029-03-06', h=15.0, zone='linze_4f', flags=dict(TWF, grad_reading=True), js=R8H + Y4 + js, pref=['讀書', '讀 1 小時', '讀' + name + '給的那篇文章'],   # BB-B 20:5x：讀多久的選項是「讀 1 小時」（原本寫「一小時」＝沒對到、退到「算了」，sy60b）
                steps=[N4STUDY, STUDY, ('until', 15.4, 400)],
                jsok=[('讀書選單「讀%s給的那篇文章」' % name, CHN('讀' + name + '給的那篇文章'), lambda n: isinstance(n, int) and n >= 1)] + ([('沒有「讀學姊給的那篇文章」', CHN('讀學姊給的那篇文章'), 0)] if name != '學姊' else []))
def SY_BTN(i, js, name):   # 出遊按鈕：三筆 OUT.plan（標題照遊戲的寫法），選「晚一點」
    o = [{'id': 'sy_t1', 'ev': 'ev_none_sy1', 'day': 0, 'h': 0, 'late': 0.5, 'place': '學姊家的巷口', 'title': '跨年：學姊家的巷口', 'travel': '捷運 約 30 分鐘', 'travelH': 0.5},
         {'id': 'sy_t2', 'ev': 'ev_none_sy2', 'day': 0, 'h': 0, 'late': 0.5, 'place': '桃園機場', 'title': '接機（學姊）', 'travel': '開車 約 1 小時', 'travelH': 1}]
    # BB-B 20:5x：原本先排在 day 0／0 點（過去）再改時間＝OUT.planToast 照設計不跳「排進行程」（排的時間 ≤ 現在就不說），sy60b 那一項驗不到。改成一開始就排在 30 分鐘後
    plan = ''.join(" OUT.plan(G,Object.assign(%s,{day:G.day,h:+G.hour+0.3}));" % json.dumps(x, ensure_ascii=False) for x in o)
    return dict(id=i, key='2027-12-31', h=19.0, zone='dorm', flags=dict(TWF), js=R8H + js + plan, pref=['晚一點'], steps=[('until', 19.5, 900)],
                jsok=[('「出發：跨年：%s家的巷口」' % name, CHN('出發：跨年：' + name + '家的巷口'), lambda n: isinstance(n, int) and n >= 1), ('「出發：接機（%s）」' % name, CHN('出發：接機（' + name + '）'), lambda n: isinstance(n, int) and n >= 1),
                      ('排進行程的系統提醒用「%s」' % name, "(window.__LOG||[]).filter(x=>/排進行程/.test(String(x.t))&&String(x.t).includes(%s)).length" % json.dumps('跨年：' + name, ensure_ascii=False), lambda n: isinstance(n, int) and n >= 1)])
R8 += [
  SY_TEA('SY60_TEA_D', SIS_D, '書瑀', '學姊'), SY_TEA('SY60_TEA_F', SISF, '學姊', '書瑀'), SY_TEA('SY60_TEA_EX', EXJS0, '學姊', '書瑀'),
  dict(id='SY60_HOOK_D', key='2028-06-12', h=20.0, zone='dorm', flags=dict(TWF), js=R8H + SIS_D, pref=['不'], steps=[HOOKRUN],
       jsok=[('鉤子的選項「「那天我去送妳。」」', CHN('「那天我去送妳。」'), lambda n: isinstance(n, int) and n >= 1), ('沒有「送學姊」', CHN('「那天我去送學姊。」'), 0)]),
  dict(id='SY60_HOOK_F', key='2028-06-12', h=20.0, zone='dorm', flags=dict(TWF), js=R8H + SISF, pref=['不'], steps=[HOOKRUN],
       jsok=[('沒交往：「「那天我去送學姊。」」或沒有鉤子', "(()=>{ const a=%s, b=%s; return a>0&&b===0?'學姊版':(a===0&&b===0?'沒有鉤子（條件不到）':'錯：'+a+'/'+b); })()" % (CHN('「那天我去送學姊。」'), CHN('「那天我去送妳。」')), lambda s: s in ('學姊版', '沒有鉤子（條件不到）'))]),
  SY_STUDY('SY60_STUDY_D', SIS_D, '書瑀'), SY_STUDY('SY60_STUDY_F', SISF, '學姊'),
  SY_BTN('SY60_BTN_D', SIS_D, '書瑀'), SY_BTN('SY60_BTN_F', SISF, '學姊'), SY_BTN('SY60_BTN_EX', EXJS0, '學姊'),
  dict(id='SY60_LADDER', key='2029-03-06', h=15.0, zone='dorm', flags=dict(TWF), js=R8H + Y4 + SIS_D, steps=[],
       # BB-B 18:3x：原本直接拿 shuyuT 算台詞＝檢查寫錯（shuyuT 是標題、字卡、手機系統提醒用的，social3d.js:148；台詞不經過它）。
       # 改成：階梯的台詞資料照原文、遊戲裡只有標題／字卡／系統提醒三處呼叫 shuyuT（events3d.js titleCard、game3d.js sysT、outings3d.js S.tt）
       jsok=[('交往中：階梯台詞「妳變成學姊了。」照原文（台詞不經過 shuyuT）', "JSON.stringify(LADDER).includes('妳變成學姊了。')", True),
             ('交往中：標題才換（shuyuT「學姊的研究室」→「書瑀的研究室」）', "SOCIAL.shuyuT?SOCIAL.shuyuT('學姊的研究室'):'(沒有 shuyuT)'", '書瑀的研究室'),
             ('交往中：「直屬學姊」不換', "SOCIAL.shuyuT?SOCIAL.shuyuT('直屬學姊'):'(沒有 shuyuT)'", '直屬學姊')]),
]
SCENS = SCENS + R8
# ---- 第 39 項 SQ04～SQ07（118 巷四家；BB-B 18:1x 補，原本這一版沒寫）：照 src/sideq3d.js（d23380d5e）的步驟走一次「接下來→做完」----
#   店員認得你（第 5 次點）＋「偶爾」固定抽中（SQB）；店門口先放到點餐處【捷徑】；隔幾天用 addday【捷徑】
def NORD(n): return NEAR('118 巷%s 點餐' % n, label='點餐（%s）' % n)
SQ39B = [
  # SQ04 慢讀咖啡（大二下起）：交給派出所 → 出遊「送筆電去派出所」→ 兩週後國考生來道謝 → 做完
  dict(id='SQ39_SQ04', key='TERMDAY:Y2S2:3:2', h=15.0, zone='l118_cafe2', flags=dict(TW3), js=SQB('慢讀咖啡'),
       pref=['美式咖啡', '「要我幫忙嗎？」', '交給派出所。', '出發：送筆電去派出所'],
       steps=[NORD('慢讀咖啡'), ORDER('慢讀咖啡'), ('until', 15.9, 900), ('addday', 15), NORD('慢讀咖啡'), ORDER('慢讀咖啡'), ('until', 17.6, 900), ('addday', 15), NORD('慢讀咖啡'), ORDER('慢讀咖啡')],   # BB-B 10-24 03:4x（sq39c2）：選「交給派出所」排的出遊在 15 分鐘後（S.police04），演完才 setWait 14 天；原本選完就停＝派出所、道謝都沒演。補：等出遊（pref「出發：送筆電去派出所」）→ 撥 15 天 → 再點一次
       want=['（店長把一台筆電放在吧檯上。）', '這台放在插座那一桌三個禮拜了。', '……要怎麼辦。', '（警察登記，說會找失主。）', '（兩個禮拜後，一個很瘦的男生來店裡道謝。他是國考生，那天胃出血被送急診，住院兩週。筆電裡是他三年的筆記。）', '（他每天來同一個插座位子讀書，店長幫他留。）'],
       jsok=[('SQ04 做完', SQST('SQ04'), 'done/done')]),
  # SQ05 六張犁麵舖（大三上）：公休的紙選第一張 → 兩週後重新開店「大碗加蛋。……今天不收錢。」、退錢 → 做完
  dict(id='SQ39_SQ05', key='TERMDAY:Y3S1:3:2', h=12.3, zone='l118_noodle2', flags=dict(TW3), js=SQB('六張犁麵舖'),
       pref=['牛肉麵', '「要我幫忙嗎？」', '「老闆去修膝蓋，兩週後見。」', '老闆去修膝蓋'],
       steps=[NORD('六張犁麵舖'), ORDER('六張犁麵舖'), ('addday', 15), NORD('六張犁麵舖'), ORDER('六張犁麵舖')],
       want=['膝蓋要開刀。要休兩個禮拜。', '……公休的紙，你幫我寫，寫得好看一點。', '大碗加蛋。……今天不收錢。'],
       jsok=[('SQ05 做完、紙是第一張', "(r=>r?r.state+'/'+r.note:null)(SIDEQ.get(GAME.G,'SQ05'))", lambda x: isinstance(x, str) and x.startswith('done/老闆去修膝蓋'))]),
  # SQ06 好家自助餐（大二上起）：幫忙找家教 → 三天後 → 再去點＝孫子想學吉他 →「不用了」（不帶去社課）→ 做完
  dict(id='SQ39_SQ06', key='TERMDAY:Y2S1:5:2', h=12.3, zone='l118_self', flags=dict(TW3), js=SQB('好家自助餐'),
       pref=['自助餐（三菜一肉）', '「要我幫忙嗎？」', '不用了'],
       steps=[NORD('好家自助餐'), ORDER('好家自助餐'), ('addday', 4), ('until', 13.3, 900), NORD('好家自助餐'), ORDER('好家自助餐'), ('addday', 1), NORD('好家自助餐'), ORDER('好家自助餐')],   # BB-B 10-24 03:4x（sq39c2）：家教回報送出以後，下一次手機規則才把 step 改 twist（S.phone），13:32 那一次點餐還是 lesson；隔天再點一次才演「孫子想學的是吉他」
         # BB-B 20:1x：跳日子以後要讓手機規則跑兩次（家教回報 21:00 → step 改 twist），原本 until 12.6 時已經 12.98＝沒等
       want=['我孫子國二，數學不及格。', '你們有沒有同學在當家教？', '（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）'],
       jsok=[('SQ06 做完', SQST('SQ06'), 'done/done'), ('家教是誰（明軒／以安／自己）', "(r=>r?r.tutor:null)(SIDEQ.get(GAME.G,'SQ06'))", lambda x: x in ('classmate_mingxuan', 'heroine_01', 'me') or bool(x))]),
  # SQ07 蛋包飯研究所（大三下）：讀書計畫「第二段太長。」→ 三週後考上 → 一週後最後一天的蛋包飯 → 做完
  dict(id='SQ39_SQ07', key='TERMDAY:Y3S2:3:2', h=12.3, zone='l118_omu', flags=dict(TW3), js=SQB('蛋包飯研究所'),
       pref=['咖哩蛋包飯', '「要我幫忙嗎？」', '「第二段太長。」', '第二段太長'],
       steps=[NORD('蛋包飯研究所'), ORDER('蛋包飯研究所'), ('addday', 21), NORD('蛋包飯研究所'), ORDER('蛋包飯研究所'), ('addday', 7), NORD('蛋包飯研究所'), ORDER('蛋包飯研究所')],
       want=['跟你說，我要考研究所。真的那種。', '（第一句寫著：『我想知道，為什麼同一顆蛋，煎三分鐘和三分半，吃起來是兩種東西。』）', '第二段是我最想寫的。……好，砍一半。', '（她考上了，可是要搬去台中。）', '本所所長要畢業了。'],
       jsok=[('SQ07 做完', SQST('SQ07'), 'done/done')]),
]
for _sc in SQ39B: _sc['js'] = SAYH + _sc['js']
SCENS = SCENS + SQ39B
# ===== R9：第 72 項 七位女主角的邀約回覆（AA_415；開發分支 791685e10 起；LAWWW-B 清單）=====
# 手機「朋友」→「約」（真的點手機）→ 地點 → 時間 → 她的回覆（GAME.say，說話的人「○○（手機）」）。回覆要在 AA_415 的表上（INVITE_REPLIES，逐字）、同一個人連續兩次不同。
# 日子【捷徑】撥過去（addday／jsrun）；約好的出遊不去（不影響回覆的挑法：AA_415 0-3 看階段、地點、時段、條件、來過）。舊存檔＝使用者 9/25 存檔本身（10-23 以前、沒有 G.invReply）
def PINV(who, place, when, tag): return ('phoneinv', who, [place, when], tag)
CAFE, LIB, ZH19, ZH12 = '去兩點半 Café 坐坐', '去總圖一起念書', '明天 19:00', '明天 12:10'
INVJ = lambda who, f, t, c, extra='': " LV('%s',%d,%d,%d); G.contacts=G.contacts||{}; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,'%s');%s" % (who, f, t, c, who, extra)
# 找日子：明天 h 點她的作息（STORY.schedEnt，和 invites3d.js 的 entAt 同一個呼叫）符合 want 的第一天，撥到那天 12:00（【捷徑】）
FINDDAY = """(([id,h,want,wk])=>{ const G=GAME.G, wd=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; }, E=(d,hh)=>STORY.schedEnt(CHARACTERS[id],{day:d,hour:hh,weekday:wd(d),flags:G.flags||{},noInvite:true});
  for(let d=G.day; d<G.day+60; d++){ const e=E(d+1,h), a=e&&e.act||'', t=CALENDAR.termOf?CALENDAR.termOf(d+1):null;
    const ok = want==='barista'? a==='barista' : want==='class'? (!!a && a!=='barista' && /class|lecture|seminar|course/.test(a)) : want==='exam'? !!(t&&t.exam) : false;
    if(ok){ G.day=d; G.hour=12; if(GAME.E) GAME.E.hour=12; G.weekday=wd(d); if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key+' 明天 '+h+' '+a; } }
  return false; })"""
def FIND(who, h, want, note): return ('jsrun', FINDDAY + "(%s)" % json.dumps([who, h, want, 0]), note)
AN3 = INVJ('heroine_01', 45, 30, 10)
R9 = [
  dict(id='INV72_AN_CAFE3', key='TERMDAY:Y1S1:6:2', h=12.0, zone='dorm', flags=dict(TW3), js=AN3,
       steps=[PINV('heroine_01', CAFE, ZH19, 'c1'), ('addday', 2), PINV('heroine_01', CAFE, ZH19, 'c2'), ('addday', 2), PINV('heroine_01', CAFE, ZH19, 'c3'),
              ('invchk', 'heroine_01', ['c1', 'c2', 'c3'], {'distinct': True})]),
  dict(id='INV72_AN_PLACE', key='TERMDAY:Y1S1:6:2', h=12.0, zone='dorm', flags=dict(TW3), js=AN3,
       steps=[PINV('heroine_01', LIB, ZH19, 'l1'), ('addday', 2), PINV('heroine_01', CAFE, ZH19, 'c1'), ('invchk', 'heroine_01', ['l1', 'c1'], {'distinct': True})]),
  dict(id='INV72_ZR_SHIFT', key='TERMDAY:Y1S1:6:1', h=12.0, zone='dorm', flags=dict(TW3), js=INVJ('heroine_02', 45, 30, 10),
       steps=[FIND('heroine_02', 19.0, 'barista', '撥到「明天 19:00 芷若在 Café 上班」的前一天 12:00'), PINV('heroine_02', LIB, ZH19, 's1'),
              ('invchk', 'heroine_02', ['s1'], {'sub': '我在上班'})]),
  dict(id='INV72_ZR_CLASS', key='TERMDAY:Y1S1:6:1', h=12.0, zone='dorm', flags=dict(TW3), js=INVJ('heroine_02', 45, 30, 10),
       steps=[FIND('heroine_02', 12 + 10 / 60, 'class', '撥到「明天 12:10 芷若在上課」的前一天 12:00'), PINV('heroine_02', LIB, ZH12, 'k1'),
              ('invchk', 'heroine_02', ['k1'], {'nosub': '我在上班', 'narr': True})]),
  dict(id='INV72_EXAM_YT', key='TERMDAY:Y1S1:14:1', h=12.0, zone='dorm', flags=dict(TW3), js=INVJ('heroine_03', 65, 50, 45),
       steps=[FIND('heroine_03', 19.0, 'exam', '撥到「明天是考試週」的前一天 12:00'), PINV('heroine_03', CAFE, ZH19, 'e1'), ('invchk', 'heroine_03', ['e1'], {'tag': '考試週'})]),
  dict(id='INV72_EXAM_ZQ', key='TERMDAY:Y2S1:14:1', h=12.0, zone='dorm', flags=dict(TW3), js=INVJ('heroine_04', 65, 50, 45),
       steps=[FIND('heroine_04', 19.0, 'exam', '撥到「明天是考試週」的前一天 12:00'), PINV('heroine_04', CAFE, ZH19, 'e1'), ('invchk', 'heroine_04', ['e1'], {'tag': '考試週'})]),
  dict(id='INV72_DATING_AN', key='TERMDAY:Y1S2:6:2', h=12.0, zone='dorm', flags=dict(TW3),
       js=INVJ('heroine_01', 65, 50, 45, " SOCIAL.rel('heroine_01').npcRom=60; SOCIAL.rel('heroine_01').rom=40; try{ ROM.start(G,'heroine_01'); }catch(e){} G.flags.dating_heroine_01=true;"),
       steps=[PINV('heroine_01', CAFE, ZH19, 'd1'), ('invchk', 'heroine_01', ['d1'], {})],
       jsok=[('交往中（dating_heroine_01）', "GAME.G.flags.dating_heroine_01===true", True)]),
  dict(id='INV72_OLDSAVE', key='2025-10-08', h=12.0, zone='dorm', flags=dict(TW3), js=" delete G.invReply;" + INVJ('heroine_01', 25, 10, 5),
       steps=[PINV('heroine_01', CAFE, ZH19, 'o1'), ('invchk', 'heroine_01', ['o1'], {})],
       jsok=[('舊存檔：讀檔前沒有 G.invReply，約過以後有了', "!!GAME.G.invReply", True)]),
]
SCENS = SCENS + R9
# ===== R10：第 62、67、71 項（CLOSED-SPACES-1023、AA_413、AA_399 第 2 節；開發分支 8cfc1b7de；事實照子代理 19:3x 讀程式：closed3d.js、wzshops3d.js、b1story3d.js）=====
def PLACEAT(x, z, note, lv=0): return ('jsrun', "(()=>{ const E=GAME.E, P=E.player; if(E.placeAt) E.placeAt(P,%s,%s,%d); else P.obj.position.set(%s,0,%s); return true; })()" % (x, z, lv, x, z), note)
SETH = lambda v: ('jsrun', "(()=>{ window.%s=GAME.G.hour+GAME.G.day*24; return true; })()" % v, '記下現在的時間（讀資料用）')
SEQ = lambda arr: "(A=>(window.__LOG||[]).map(x=>String(x.t).replace(/^CAPTION2:/,'')).filter(t=>A.includes(t)))(%s)" % json.dumps(arr, ensure_ascii=False)
EXACT = lambda t: "(t=>(window.__LOG||[]).slice(window.__LN|0).filter(x=>String(x.t).replace(/^CAPTION2:/,'')===t).length)(%s)" % json.dumps(t, ensure_ascii=False)
TA = ['（小窗裡：她站在黑板前面。一年級的學弟妹低著頭在寫。她寫字很快，寫完會停下來等。）', '（她在黑板上畫了一張圖，有人舉手，她點了一下頭。）', '（她在上課。）']
TA_CLOSED = '101 教室。今天這個時段沒有課，門鎖著。'
N101 = NEAR('霖澤館 1F 101 教室', label='101 教室'); U101 = ('usep', '^101 教室$')
SISMET = " G.flags.met_sis=true; G.flags.SIS_W1=true;"
R10 = [
  # 62-①：小窗三句照「看過幾個不同的週」（TA101_N）；同一週第二次＝（她在上課。）
  dict(id='TA62_WIN', key='2026-09-22', h=19.0, zone='linze', flags=dict(TW3), js=SISF + SISMET,
       steps=[N101, U101, U101, ('addday', 7), N101, U101, ('addday', 7), N101, U101],
       jsok=[('小窗的句子依序：第一週、同一週再看、第二週、第三週', SEQ(TA), [TA[0], TA[2], TA[1], TA[2]]), ('TA101_N＝看過 3 個週', "GAME.G.flags.TA101_N", 3)]),
  # 62-②：期中週（第 8 週）、週三：照舊「今天這個時段沒有課」
  dict(id='TA62_MID', key='2026-10-27', h=19.0, zone='linze', flags=dict(TW3), js=SISF + SISMET,
       steps=[N101, ('mark', 'window.__LN=(window.__LOG||[]).length;'), U101, ('chk', '期中週：門鎖著那一句', LNQ(TA_CLOSED), lambda n: isinstance(n, int) and n >= 1),
              ('jump', "STORY.dayOfKey('2026-09-23')", 19.0, '換到週三 2026-09-23 19:00'), N101, ('mark', 'window.__LN=(window.__LOG||[]).length;'), U101,
              ('chk', '週三：門鎖著那一句', LNQ(TA_CLOSED), lambda n: isinstance(n, int) and n >= 1)],
       none=TA),
  # 62-③：20:20～20:40 她站在 101 門口；第一次說話多一句（朋友／交往中），第二次沒有
  dict(id='TA62_DOOR_F', key='2026-09-22', h=20.35, zone='linze', flags=dict(TW3), js=SISF + SISMET, pref=['就這樣'],
       steps=[('wait', "!!(GAME.npc&&GAME.npc.heroine_05)", 600, '她從 101 出來'), PLACEAT(-3, -4.4, '主角放到 101 門口前'), ('talk', 'heroine_05'), ('talk', 'heroine_05')],
       jsok=[('第一次多一句「……你在外面看了多久。」（只一次）', LNQ('……你在外面看了多久。'), 1), ('TA101_TALK 記了', "GAME.G.flags.TA101_TALK!=null", True)]),
  dict(id='TA62_DOOR_D', key='2026-09-22', h=20.35, zone='linze', flags=dict(TW3), js=SIS_D + SISMET, pref=['就這樣'],
       steps=[('wait', "!!(GAME.npc&&GAME.npc.heroine_05)", 600, '她從 101 出來'), PLACEAT(-3, -4.4, '主角放到 101 門口前'), ('talk', 'heroine_05'), ('talk', 'heroine_05')],
       jsok=[('交往中第一次多一句「我在上課的時候，不要從窗戶看我。……我會分心。」（只一次）', LNQ('我在上課的時候，不要從窗戶看我。……我會分心。'), 1), ('沒有朋友版那一句', LNQ('……你在外面看了多久。'), 0)]),
  # 62-④：洗衣間（大一週日 21:00～22:00 第一次阿凱一句；之後、大二沒有；一次 40 分鐘）
  dict(id='LAUNDRY62_Y1', key='2025-09-28', h=21.1, zone='dorm_hall', flags=dict(TW3), js='', pref=['洗衣服'],
       steps=[NEAR('宿舍一樓洗衣間', label='洗衣間'), SETH('__H0'), ('usep', '^洗衣間$'), ('chk', '洗一次 40 分鐘', "(GAME.G.hour+GAME.G.day*24)-window.__H0", lambda v: isinstance(v, (int, float)) and 0.6 <= v <= 0.8),
              NEAR('宿舍一樓洗衣間', label='洗衣間'), ('usep', '^洗衣間$')],
       jsok=[('阿凱「這台烘衣機要投兩次。第一次是騙你的。」只一次', LNQ('這台烘衣機要投兩次。第一次是騙你的。'), 1), ('KAI_LAUNDRY 記了', "GAME.G.flags.KAI_LAUNDRY!=null", True),
             ('第二次是「衣服洗好了。」', LNQ('衣服洗好了。'), lambda n: isinstance(n, int) and n >= 1)]),
  dict(id='LAUNDRY62_Y2', key='2026-09-27', h=21.1, zone='dorm_hall', flags=dict(TW3), js='', pref=['洗衣服'],
       steps=[NEAR('宿舍一樓洗衣間', label='洗衣間'), ('usep', '^洗衣間$')],
       jsok=[('大二：沒有阿凱那一句', LNQ('這台烘衣機要投兩次'), 0), ('衣服洗好了。', LNQ('衣服洗好了。'), lambda n: isinstance(n, int) and n >= 1)]),
]
# 67：溫州街日日便利、阿忠水果、自助洗衣
NCVS = NEAR('溫州街日日便利門口', label='進入日日便利'); UCVS = ('usep', '^進入日日便利$')
NCHK = NEAR('日日便利櫃台', label='結帳：飯糰／咖啡／飲料'); UCHK = ('usep', '^結帳')
NOUT = NEAR('日日便利門口', label='離開便利商店'); UOUT = ('usep', '^離開便利商店$')
WCVS = ('wait', "GAME.G.zone==='cvs'", 300, '進到日日便利（cvs）'); WWZ = ('wait', "GAME.G.zone==='wenzhou'", 300, '回到溫州街')
FRUIT_N = lambda n: " try{ EAT.rec(G).n['阿忠水果']=%d; }catch(e){}" % n
NFR = NEAR('阿忠水果', label='買水果'); UFR = ('usep', '^買水果$')
R10 += [
  dict(id='WZ67_CVS_DAY', key='2026-10-06', h=14.0, zone='wenzhou', flags=dict(TW3), js='', pref=['不用了'],
       steps=[NCVS, UCVS, WCVS, ('mark', 'window.__LN=(window.__LOG||[]).length;'), NCHK, UCHK, ('chk', '白天第一次：「歡迎光臨。要袋子嗎？」', EXACT('歡迎光臨。要袋子嗎？'), 1),
              ('chk', '是從溫州街進來（CVS_FROM）', "GAME.G.flags.CVS_FROM", 'wenzhou'), NOUT, UOUT, WWZ],
       jsok=[('離開回到溫州街日日便利門口（44, 2.4 附近）', "(p=>Math.hypot(p.x-44,p.z-2.4)<2.5)(GAME.E.player.obj.position)", True), ('CVS_FROM 清掉', "!GAME.G.flags.CVS_FROM", True), ('WZ_CVS_N＝1', "GAME.G.flags.WZ_CVS_N", 1)]),
  dict(id='WZ67_CVS_NIGHT', key='2026-10-06', h=23.0, zone='wenzhou', flags=dict(TW3), js='', pref=['不用了'],
       steps=[NCVS, UCVS, WCVS, ('mark', 'window.__LN=(window.__LOG||[]).length;'), NCHK, UCHK, ('chk', '半夜第一次：「要袋子嗎？」（不是白天那句）', EXACT('要袋子嗎？'), 1),
              ('chk', '沒有白天那句', EXACT('歡迎光臨。要袋子嗎？'), 0)]),
  dict(id='WZ67_CVS_5TH', key='2026-10-06', h=14.0, zone='wenzhou', flags=dict(TW3), js=" G.flags.WZ_CVS_N=4;", pref=['不用了'],
       steps=[NCVS, UCVS, WCVS, ('mark', 'window.__LN=(window.__LOG||[]).length;'), NCHK, UCHK, ('chk', '第 5 次起白天：「歡迎光臨。」', EXACT('歡迎光臨。'), 1),
              ('jump', 'GAME.G.day', 23.0, '同一天 23:00'), ('mark', 'window.__LN=(window.__LOG||[]).length;'), NCHK, UCHK, ('chk', '第 5 次起半夜：「又這麼晚。」', EXACT('又這麼晚。'), 1)]),
  dict(id='WZ67_CVS_EXAM', key='TERMDAY:Y2S1:8:2', h=21.5, zone='wenzhou', flags=dict(TW3), js=" G.money=Math.max(G.money|0,5000);", pref=['1:咖啡'],
       steps=[NCVS, UCVS, WCVS, NCHK, UCHK, NCHK, UCHK],
       jsok=[('考試週 21:00 以後：「考試週喔。咖啡第二杯半價。」一天一次', LNQ('考試週喔。咖啡第二杯半價。'), 1), ('WZ_CVS_EXAM＝今天', "GAME.G.flags.WZ_CVS_EXAM===GAME.G.day", True)]),
  dict(id='WZ67_CVS_GG', key='2026-10-06', h=14.0, zone='gongguan', flags=dict(TW3), js='', pref=['不用了'],
       steps=[NEAR('公館便利商店門口', label='進入便利商店'), ('usep', '^進入便利商店$'), WCVS, ('chk', '公館進來（CVS_FROM＝gongguan）', "GAME.G.flags.CVS_FROM", 'gongguan'),
              NCHK, UCHK, NOUT, UOUT, ('wait', "GAME.G.zone==='gongguan'", 300, '回到公館')],
       jsok=[('公館進去的照舊回公館', "GAME.G.zone", 'gongguan')], none=['歡迎光臨。要袋子嗎？']),
  dict(id='FRUIT67_JUN', key='2027-06-10', h=15.0, zone='wenzhou', flags=dict(TW3), js=" G.money=Math.max(G.money|0,5000);", pref=['「送人。」', '1:芒果'],
       steps=[('mark', 'window.__LN=(window.__LOG||[]).length; window.__MA=GAME.G.money|0;'), NFR, UFR],
       jsok=[('第一次：「要吃還是要送人？」', LNQ('要吃還是要送人？'), 1), ('送人：「那我幫你挑漂亮的。」', LNQ('那我幫你挑漂亮的。'), 1), ('6 月有芒果', LNQ('芒果（一盒）'), lambda n: isinstance(n, int) and n >= 1),
             ('錢扣 150', "(GAME.G.money|0)-(window.__MA|0)", -150)]),
  dict(id='FRUIT67_OCT', key='2026-10-14', h=15.0, zone='wenzhou', flags=dict(TW3), js=" G.money=Math.max(G.money|0,5000);", pref=['「自己吃。」', '1:芭樂'],
       steps=[NFR, UFR], jsok=[('10 月沒有芒果、草莓、柳丁', "['芒果','草莓','柳丁'].map(t=>(window.__LOG||[]).filter(x=>String(x.t).startsWith('CHOICE:')&&String(x.t).includes(t)).length)", [0, 0, 0]),
                              ('有芭樂', LNQ('芭樂（一袋三顆）'), lambda n: isinstance(n, int) and n >= 1)]),
  dict(id='FRUIT67_DEC', key='2026-12-10', h=15.0, zone='wenzhou', flags=dict(TW3), js=" G.money=Math.max(G.money|0,5000);", pref=['「自己吃。」', '1:草莓'],
       steps=[NFR, UFR], jsok=[('12 月有草莓、柳丁', "['草莓（一盒）','柳丁（一袋）'].map(t=>(window.__LOG||[]).filter(x=>String(x.t).startsWith('CHOICE:')&&String(x.t).includes(t)).length>0)", [True, True])]),
  dict(id='FRUIT67_5TH', key='2027-06-10', h=15.0, zone='wenzhou', flags=dict(TW3), js=" G.money=Math.max(G.money|0,5000);" + FRUIT_N(4), pref=['1:芒果'],
       steps=[NFR, UFR, ('jump', "STORY.dayOfKey('2026-10-14')", 15.0, '換到 10 月'), NFR, UFR],
       jsok=[('第 5 次起 6～8 月：「今天的芒果很甜，要不要？」', LNQ('今天的芒果很甜，要不要？'), 1), ('其他月：「學生仔，今天的芭樂很脆。」', LNQ('學生仔，今天的芭樂很脆。'), 1), ('不再問要吃還是送人', LNQ('要吃還是要送人？'), 0)]),
  dict(id='FRUIT67_CLOSED', key='2026-10-14', h=23.0, zone='wenzhou', flags=dict(TW3), js='',
       steps=[NFR, UFR], jsok=[('23:00：「阿忠水果：09:00～22:00」', LNQ('阿忠水果：09:00～22:00'), lambda n: isinstance(n, int) and n >= 1), ('沒有開問', LNQ('要吃還是要送人？'), 0)]),
  dict(id='BOARD67', key='2026-09-15', h=15.0, zone='wenzhou', flags=dict(TW3), js='',
       steps=[NEAR('自助洗衣布告欄', label='看布告欄'), ('usep', '^看布告欄$'), ('jump', "STORY.dayOfKey('2027-03-10')", 15.0, '換到 3 月'), NEAR('自助洗衣布告欄', label='看布告欄'), ('usep', '^看布告欄$')],
       jsok=[('9 月：家教', LNQ('（家教徵求：國二數學，週三晚上。下面的電話紙條撕走了一半。）'), 1), ('3 月：租屋', LNQ('（租屋：溫州街五樓，雅房，限女性。旁邊有人用鉛筆補了一行：有貓嗎？）'), 1)]),
]
# 71：總圖 B1
BOH = " LV('classmate_bohan',45,30,10); LV('classmate_xinci',45,30,10);"
R10 += [
  # ①考古題小組：週六 16:00 出發 → B1 討論室 1（模糊 3D），柏翰站白板前、芯慈坐著；演完回到出發的地方
  dict(id='B1_71_GROUP', key='TERMDAY:Y2S1:5:6', h=15.6, zone='campus', flags=dict(TW3), js=BOH + " G.flags.BOHAN_GROUP='yes'; G.flags.BOHAN_GROUP_DAY=G.day-3;" + R8H, pref=['出發：考古題小組', '出發'],
       steps=[('until', 16.8, 1800)],
       jsok=[('演了考古題小組', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_bohan_group_session)", True), ('演的時候人在 B1（library_b1）', "(window.__ZL||[]).filter(x=>x.z==='library_b1').length", lambda n: isinstance(n, int) and n >= 1),
             ('底圖是模糊的 3D（BG:blur）', LNQ('BG:blur'), lambda n: isinstance(n, int) and n >= 1), ('演完回到校園', "GAME.G.zone", 'campus')]),
  # ②國考讀書會：3/1（四）19:40 走到 B1 討論室 2：人已經坐好；19:45 起才有「參加：國考讀書會」
  dict(id='B1_71_BAR', key='2029-03-01', h=19.6, zone='library_b1', flags=dict(TW3, Y4_PATH='bar'), js=BOH + " LV('zhe',45,30,10);" + R8H, pref=['參加：國考讀書會'],
       steps=[('wait', "!!(GAME.npc&&GAME.npc.zhe&&GAME.npc.zhe.b1Bar)", 600, '19:30 以後阿哲、柏翰坐進討論室 2'),
              ('chk', '柏翰也在（b1Bar）', "!!(GAME.npc&&GAME.npc.classmate_bohan&&GAME.npc.classmate_bohan.b1Bar)", True),
              NEAR('討論室 2 集合點', label='國考讀書會（討論室 2）'), ('mark', 'window.__LN=(window.__LOG||[]).length;'), ('usep', '^國考讀書會'),
              ('chk', '19:45 以前按：「國考讀書會：今天 20:00 在這裡集合。」', LNQ('國考讀書會：今天 20:00 在這裡集合。'), lambda n: isinstance(n, int) and n >= 1),
              ('jump', 'GAME.G.day', 19.8, '同一天 19:48'), NEAR('討論室 2 集合點', label='國考讀書會（討論室 2）'), ('usep', '^國考讀書會'), ('until', 20.2, 1500)],
       jsok=[('有「參加：國考讀書會」', LNQ('CHOICE:參加：國考讀書會'), lambda n: isinstance(n, int) and n >= 1)]),
  # ③期末前一週 22:30 從總圖門口「從側門下 B1」→ 柏翰在自習室；23:30 以後在自習室裡＝那一句；同一學期再去不說
  dict(id='B1_71_NIGHT', key='TERMDAY:Y2S1:15:3', h=22.5, zone='campus', flags=dict(TW3), js=BOH + R8H, pref=['從側門下 B1'],
       steps=[NEAR('總圖門口', label='進入總圖書館'), ('usep', '^進入總圖書館$'), ('wait', "GAME.G.zone==='library_b1'", 300, '下到 B1'),
              ('wait', "!!(GAME.npc&&GAME.npc.classmate_bohan&&GAME.npc.classmate_bohan.b1Night)", 600, '柏翰在自習室（b1Night）'),
              PLACEAT(0, -5, '主角放到 24 小時自習室中間'), ('jump', 'GAME.G.day', 23.45, '同一天 23:27'),
              ('wait', LNQ('十一點四十。你還有二十分鐘可以決定要不要回宿舍。') + '>0', 900, '23:30 以後那一句'),
              ('addday', 1), ('jump', 'GAME.G.day', 23.45, '隔天 23:27（同一學期）'), PLACEAT(0, -5, '主角還在自習室'), ('until', 23.6, 900)],
       jsok=[('那一句同一學期只說一次', LNQ('十一點四十。你還有二十分鐘可以決定要不要回宿舍。'), 1), ('B1_NIGHT 記了這學期', "!!(GAME.G.flags.B1_NIGHT&&GAME.G.flags.B1_NIGHT.Y2S1!=null)", True)]),
  # ④大廳關門以後走 B1 樓梯：回到校園總圖門口
  dict(id='B1_71_STAIRS', key='TERMDAY:Y2S1:6:3', h=23.0, zone='library_b1', flags=dict(TW3), js='',
       steps=[NEAR('B1 樓梯', label='走樓梯上 1F'), ('usep', '^走樓梯上 1F$'), ('wait', "GAME.G.zone==='campus'", 300, '回到校園')],
       jsok=[('「大廳已經關了，從樓梯間的側門出去。」', LNQ('大廳已經關了，從樓梯間的側門出去。'), lambda n: isinstance(n, int) and n >= 1), ('在總圖門口（80, 0 附近）', "(p=>Math.hypot(p.x-80,p.z)<3)(GAME.E.player.obj.position)", True)]),
  # ⑤知道 L1 那本書以後：自助借還書機借得到、還書口還得了
  dict(id='B1_71_LOAN', key='TERMDAY:Y1S1:6:3', h=14.0, zone='library_b1', flags=dict(TW3), js=" try{ LOANS.know(G,'L1'); }catch(e){}", pref=['1:借《'],
       steps=[NEAR('自助借還書機', label='自助借還書機'), ('usep', '^自助借還書機$'), ('chk', '借到 L1', "(GAME.G.loans||[]).some(l=>l.book==='L1')", True),
              ('pref', ['1:還《']), NEAR('還書口', label='還書口'), ('usep', '^還書口$')],
       jsok=[('還了：G.loans 沒有 L1', "(GAME.G.loans||[]).some(l=>l.book==='L1')", False), ('LOAN_RET.L1 記了', "!!(GAME.G.flags.LOAN_RET&&GAME.G.flags.LOAN_RET.L1!=null)", True),
             ('借、還的提示', "[(window.__LOG||[]).some(x=>String(x.t).includes('借了《')),(window.__LOG||[]).some(x=>String(x.t).includes('還了《'))]", [True, True])]),
]
for _s in R10:   # 台詞、字卡、底圖、區域都要記（CAP2、ZHK、BGHOOK）
    if 'R8H' not in str(_s.get('_h', '')) and R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R10
# ===== R11：第 73、74、75、79 項（AA_417、psresults3d.js、faildelay3d.js、zr_uk3d.js；開發分支 b68e97874；事實照子代理 19:5x 讀程式）=====
GE = lambda v: "(GAME.G.msgs||[]).some(m=>String(m.text||'').includes(%s))" % json.dumps(v, ensure_ascii=False)   # 手機裡有沒有這一句
ENTER = lambda z, x=None, zz=None, note='': ('jsrun', "(()=>{ void GAME.enter(%s%s); return true; })()" % (json.dumps(z), ('' if x is None else ",{x:%s,z:%s,yaw:0}" % (x, zz))), '直接進 %s%s（【捷徑】：負載高走不過去）' % (z, note))
GE1 = lambda t: lambda n: isinstance(n, int) and n >= 1
BAD, RUN = '去新體育館打羽球', '去椰林大道晨跑'
FAM = lambda who: INVJ(who, 25, 10, 5)
FRI = lambda who: INVJ(who, 45, 30, 10)
R11 = [
  # 73-①：子晴有點熟約羽球 → 第一次借拍子、一起的時候一句、最後一句；再約一次沒有第一次那段、一起的時候換一句
  dict(id='SP73_ZQ_BAD', key='TERMDAY:Y2S1:5:2', h=10.5, zone='dorm', flags=dict(TW3), js=FAM('heroine_04'), pref=['就這樣'],
       steps=[PINV('heroine_04', BAD, '今天 12:10', 'b1'), ('chk', '有點熟答應：「羽球？……我很爛喔。先說好。」', LNQ('羽球？……我很爛喔。先說好。'), GE1(1)),
              ('jump', 'GAME.G.day', 12.0, '約好的 12:10 以前'), ENTER('gym'), ('wait', LNQ('下次我會進步。不是因為你。是因為我不想輸給一顆球。') + '>0', 1500, '打完最後一句'),
              PINV('heroine_04', BAD, '明天 12:10', 'b2'), ('addday', 1), ('jump', 'GAME.G.day', 12.0, '隔天 12:00'), ENTER('gym'),
              ('wait', LNQ('下次我會進步。不是因為你。是因為我不想輸給一顆球。') + '>1', 1500, '第二次打完')],
       jsok=[('第一次才有借拍子那一段（兩次只出現一次）', LNQ('（她借了一支拍子，握的方向是反的。）'), 1), ('第一次一起的時候：「那球出界了。……」', LNQ('那球出界了。……好啦，是我沒接到。'), GE1(1)),
             ('第二次換一句：「剛剛那一球，你有看到吧。我接到了。」', LNQ('剛剛那一球，你有看到吧。我接到了。'), GE1(1))]),
  # 73-②：有點熟約晨跑約不到；朋友以後約隔天 06:30 → 傅鐘前「我起來了。……這件事你要記得。」
  dict(id='SP73_ZQ_RUN_NO', key='TERMDAY:Y2S1:5:2', h=20.0, zone='dorm', flags=dict(TW3), js=FAM('heroine_04'),
       steps=[PINV('heroine_04', '1:' + RUN, '明天 06:30', 'r0')], jsok=[('有點熟：「晨跑要等你們變成朋友。」', LNQ('晨跑要等你們變成朋友。'), GE1(1))]),
  dict(id='SP73_ZQ_RUN', key='TERMDAY:Y2S1:5:2', h=20.0, zone='dorm', flags=dict(TW3), js=FRI('heroine_04'),
       steps=[PINV('heroine_04', '1:' + RUN, '明天 06:30', 'r1'), ('chk', '朋友答應：「早上我在睡。……好啦，一次。」', LNQ('早上我在睡。……好啦，一次。'), GE1(1)),
              ('addday', 1), ('jump', 'GAME.G.day', 6.3, '隔天 06:18'), ENTER('campus', -37.6, 6.6, '・傅鐘前'),
              ('wait', LNQ('我起來了。……這件事你要記得。') + '>0', 1500, '晨跑開始')],
       jsok=[('最後一句「早餐我請。……因為我活下來了。」', LNQ('早餐我請。……因為我活下來了。'), GE1(1))]),
  # 73-③：下雨天約當天晨跑：約不到；約隔天、隔天早上下雨：手機說晨跑取消
  dict(id='SP73_RAIN_TODAY', key='TERMDAY:Y2S1:5:3', h=5.8, zone='dorm', flags=dict(TW3), js=FRI('heroine_04') + " G.weather='rain';",
       steps=[PINV('heroine_04', '1:' + RUN, '今天 06:30', 'rt')], jsok=[('「下雨了，不能晨跑。」', LNQ('下雨了，不能晨跑。'), GE1(1))]),
  dict(id='SP73_RAIN_NEXT', key='TERMDAY:Y2S1:5:2', h=20.0, zone='dorm', flags=dict(TW3), js=FRI('heroine_04'),
       steps=[PINV('heroine_04', '1:' + RUN, '明天 06:30', 'rn'), ('addday', 1), ('jump', 'GAME.G.day', 5.7, '隔天 05:42'),
              ('jsrun', "(()=>{ GAME.G.weather='rain'; try{ if(GAME.E&&GAME.E.setWeather) GAME.E.setWeather('rain'); }catch(e){} return true; })()", '隔天早上下雨'), ('until', 6.4, 1500)],
       jsok=[('手機：「下雨了，和○○的晨跑取消。」', GE('的晨跑取消。'), True)]),
  # 73-④：可昕（法律系那幾年）約羽球：她的句子，沒有「假設」
  dict(id='SP73_KX', key='TERMDAY:Y2S1:5:2', h=10.5, zone='dorm', flags=dict(TW3), js=NOKX + FRI('kexin'),
       steps=[PINV('kexin', BAD, '今天 12:10', 'k1')], jsok=[('可昕朋友答應：「好。我從山上下來。拍子你負責借。」', LNQ('好。我從山上下來。拍子你負責借。'), GE1(1))], none=['假設']),
  # 73-⑤：以安、語彤、芷若、學姊、沛珊各約一次羽球：答應那一句
  dict(id='SP73_FIVE', key='TERMDAY:Y2S1:5:1', h=10.0, zone='dorm', flags=dict(TW3),
       js=FRI('heroine_01') + FRI('heroine_03') + FRI('heroine_02') + FRI('heroine_05') + FRI('classmate_peishan') + " G.flags.met_sis=true;",
       steps=[PINV('heroine_01', BAD, '明天 19:00', 'a'), ('addday', 1), PINV('heroine_03', BAD, '明天 19:00', 'y'), ('addday', 1), PINV('heroine_02', BAD, '明天 12:10', 'z'), ('addday', 1),
              PINV('heroine_05', BAD, '明天 19:00', 's'), ('addday', 1), PINV('classmate_peishan', BAD, '明天 19:00', 'p')],
       jsok=[('以安「羽球？好。我國中是校隊。……替補。」', LNQ('羽球？好。我國中是校隊。……替補。'), GE1(1)), ('語彤「……我不太會。」', LNQ('……我不太會。'), GE1(1)),
             ('芷若「羽球！好啊，我手腕很好。拉花練的。」', LNQ('羽球！好啊，我手腕很好。拉花練的。'), GE1(1)), ('學姊「羽球。好。……我只會發球。」', LNQ('羽球。好。……我只會發球。'), GE1(1)),
             ('沛珊「好啊！！我要問你，你為什麼會打。」', LNQ('好啊！！我要問你，你為什麼會打。'), GE1(1))]),
  # 73-⑥：學姊筆試（2026-02-02）以前：照上限規則婉拒（大一上第 14 週起一律婉拒）
  dict(id='SP73_SIS_CAP', key='2025-12-10', h=10.0, zone='dorm', flags=dict(TW3), js=FRI('heroine_05') + " G.flags.met_sis=true;",
       steps=[PINV('heroine_05', BAD, '明天 19:00', 'c')], none=['羽球。好。……我只會發球。']),
]
# 74：沛珊放榜那天（交往中、消失期每晚有收到訊息＝PS_KEPT；暑假在家）
PSJ = " LV('classmate_peishan',65,50,45); G.flags.dating_classmate_peishan=true; G.flags.PS_KEPT=true; G.flags.PS_KEEP_N=60; G.contacts=G.contacts||{}; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,'classmate_peishan');"
HOMEQ = ('jsrun', "(()=>{ void HOME.arriveQuiet(GAME); return true; })()", '直接到臺北的家（暑假，家裡的選單）')
R11 += [
  dict(id='PS74_GO', key='2027-08-06', h=11.3, zone='dorm', flags=dict(TW3), js=PSJ, asks={'ps_results_where': '在家。'}, pref=['出發：總圖外面的台階', '先講妳為什麼想當老師。'],
       steps=[HOMEQ, ('until', 12.6, 2400)],
       jsok=[('10:00「你現在在哪？」', GE('你現在在哪？'), True), ('「我現在去搭客運。」', GE('我現在去搭客運。'), True), ('「到總圖外面的台階。我中午到。」', GE('到總圖外面的台階。我中午到。'), True),
             ('演了 ev_peishan_results', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_peishan_results)", True), ('「上了。我要去當老師了。」', LNQ('上了。我要去當老師了。'), GE1(1)),
             ('PS_KEPT 那一句', LNQ('那半年，每天晚上十一點，我都傳一則給你。'), GE1(1)), ('「……你幫我想想，第一堂課要講什麼。」', LNQ('……你幫我想想，第一堂課要講什麼。'), GE1(1)),
             ('PS_RESULTS＝met', "GAME.G.flags.PS_RESULTS", 'met')]),
  dict(id='PS74_LATE', key='2027-08-06', h=12.1, zone='dorm', flags=dict(TW3), js=PSJ, pref=['1:快轉', '1:到下一個有事的日子', '1:快轉', '1:到下一個有事的日子', '先講妳為什麼想當老師。'],
       steps=[HOMEQ, ('until', 13.3, 2400)],
       jsok=[('12:15「我到了。台階這邊，樹蔭下面。」', GE('我到了。台階這邊，樹蔭下面。'), True), ('13:00 被帶到場，第一句旁白', LNQ('（八月的午後。她坐在台階上，看到你，才站起來。）'), GE1(1)),
             ('PS_RESULTS＝brought', "GAME.G.flags.PS_RESULTS", 'brought'),
             ('在家的快轉停點有 10:00、12:15、13:00', "(()=>{ const hs=[]; for(const f of (HOME.STOPS||[])){ try{ for(const t of ([].concat(f(GAME.G)||[]))) hs.push(+((((+t)%24)+24)%24).toFixed(2)); }catch(e){} } return [10,12.25,13].map(h=>hs.some(x=>Math.abs(x-h)<0.02)); })()", [True, True, True])]),
  dict(id='PS74_NONE', key='2027-08-06', h=9.5, zone='dorm', flags=dict(TW3), js=" LV('classmate_peishan',45,30,10); G.flags.dating_classmate_peishan=false;",
       steps=[HOMEQ, ('jump', 'GAME.G.day', 13.5, '同一天 13:30')],
       jsok=[('沒交往：沒有「你現在在哪？」', GE('你現在在哪？'), False), ('沒有排總圖外面的台階', "!!(typeof OUT!=='undefined'&&OUT.get&&OUT.get(GAME.G,'ps_results'))", False)]),
]
# 75：大四下被當延畢
FDSET = (" const R=CLS.rec(G); R.exam=R.exam||{}; R.attend=R.attend||{}; if(R.grades) delete R.grades.Y4S2; let f=null;"
         " for(const c of CLS.termCourses(G,'Y4S2')){ if(c.kind==='service') continue; if(CLS.isExamCourse(c)){ R.exam['Y4S2:'+c.id+':final']={status:'done',correct:f?4:0}; if(!f) f=c.id; } else if(CLS.attCourse(c)) R.attend[c.id]=3; }"
         " window.__FDC=f; G.flags.GRADUATED=true; G.flags.PG=Object.assign({done:{},lines:{}},G.flags.PG||{}); G.flags.PG.done=Object.assign(G.flags.PG.done||{},{grad:G.day-16}); LV('zhe',45,30,10);")
SHOWG = ('jsrun', "(()=>{ void CLS.showGrades(GAME,'Y4S2'); return true; })()", '直接發大四下成績單（6/18 那一刻）')
R11 += [
  dict(id='FD75_GRADES', key='2029-06-18', h=9.0, zone='dorm', flags=dict(TW3, BAR_REG=True), js=Y4 + FDSET,
       steps=[SHOWG, ('chk', '「（{課名}，不及格。）」', "(window.__LOG||[]).filter(x=>/^（.+，不及格。）$/.test(String(x.t))).length", GE1(1)),
              ('chk', '「（證書要等下學期。九月，你要回學校重修。）」', LNQ('（證書要等下學期。九月，你要回學校重修。）'), 1),
              ('chk', '報名國考：「（今年的國考，考不成了。明年再報。）」', LNQ('（今年的國考，考不成了。明年再報。）'), 1), ('until', 22.2, 2400)],
       jsok=[('FAIL_DELAY', "GAME.G.flags.FAIL_DELAY===true", True), ('FAIL_DELAY_COURSES 一門', "(GAME.G.flags.FAIL_DELAY_COURSES||[]).length", 1), ('BAR_REG 改 false', "GAME.G.flags.BAR_REG===true", False),
             ('22:00 阿哲「聽說了。」「九月我還在總圖 B1。你來，我幫你占位子。」', "[%s,%s]" % (GE('聽說了。'), GE('九月我還在總圖 B1。你來，我幫你占位子。')), [True, True])]),
  dict(id='FD75_Y5', key='2029-06-18', h=9.0, zone='dorm', flags=dict(TW3), js=Y4 + FDSET,
       steps=[SHOWG, ('jump', "STORY.dayOfKey('2029-09-10')", 9.0, '大五上第一週')],
       jsok=[('大五上的課有「重修：{課名}」', "(()=>{ const G=GAME.G, out=[]; for(let d=G.day; d<G.day+7; d++){ try{ for(const it of (Y5.classItems(G,d)||[])) out.push(String(it.label||it.name||it.t||'')); }catch(e){ out.push('ERR '+e); } } return out.some(t=>t.includes('重修：')); })()", True)]),
  dict(id='FD75_EXCH', key='2029-06-18', h=9.0, zone='dorm', flags=dict(JPF), js=Y4 + FDSET,
       steps=[SHOWG], jsok=[('交換路線：不記 FAIL_DELAY', "GAME.G.flags.FAIL_DELAY===true", False), ('交換路線：課照記（FAIL_DELAY_COURSES）', "(GAME.G.flags.FAIL_DELAY_COURSES||[]).length>=1", True)],
       none=['（證書要等下學期。九月，你要回學校重修。）']),
]
# 79：芷若英國視訊（「好朋友」＝第 5 階：熟 60、信任 45、自在 40、她的戀愛 30 以上，沒有人在交往）
ZRC = (" for(const k of Object.keys(G.flags)) if(/^dating_/.test(k)) G.flags[k]=false; LV('heroine_02',65,50,45); SOCIAL.rel('heroine_02').npcRom=35;"
       " G.contacts=G.contacts||{}; if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,'heroine_02');")
ZRD = ZRC + " SOCIAL.rel('heroine_02').npcRom=60; SOCIAL.rel('heroine_02').rom=40; try{ ROM.start(G,'heroine_02'); }catch(e){} G.flags.dating_heroine_02=true;"
ZR_CLOSERS = ['好。我要去上課了。……下個月見。', '你那邊快十一點了。去睡覺。', '下個月同一個時間。我會記得。']
R11 += [
  dict(id='ZR79_MONTH', key='2027-10-02', h=20.8, zone='dorm', flags=dict(TW3), js=ZRC, asks={'zruk_m_ask_2027-10': '好。'}, pref=['接起來'],
       steps=[('until', 21.3, 1500), ('jump', "STORY.dayOfKey('2027-10-03')", 21.85, '隔天 21:51'), ('until', 22.6, 1500)],
       jsok=[('10/2 21:00「明天晚上十點？」', GE('明天晚上十點？'), True), ('10/3 22:00 視訊演了（三段的收尾有一句）', "(A=>(window.__LOG||[]).some(x=>A.includes(String(x.t))))(%s)" % json.dumps(ZR_CLOSERS, ensure_ascii=False), True)]),
  dict(id='ZR79_MONTH_NO', key='2027-10-02', h=20.8, zone='dorm', flags=dict(TW3), js=ZRC, asks={'zruk_m_ask_2027-10': '這次不行。'}, pref=['接起來'],
       steps=[('until', 21.3, 1500), ('jump', "STORY.dayOfKey('2027-10-03')", 21.85, '隔天 21:51'), ('until', 22.6, 1500)],
       jsok=[('「好。下個月。」', GE('好。下個月。'), True), ('那個月不打（沒有收尾那幾句）', "(A=>(window.__LOG||[]).some(x=>A.includes(String(x.t))))(%s)" % json.dumps(ZR_CLOSERS, ensure_ascii=False), False)]),
  dict(id='ZR79_WEEK', key='2028-09-10', h=21.85, zone='dorm', flags=dict(TWF), js=Y4 + ZRD, pref=['接起來', '早點睡。'],
       steps=[('until', 22.6, 1500), ('jump', "STORY.dayOfKey('2028-09-17')", 21.85, '下一個週日 21:51'), ('until', 22.6, 1500)],
       jsok=[('兩次都選「早點睡。」：「好。……晚安。」兩次', LNQ('好。……晚安。'), lambda n: isinstance(n, int) and n >= 2), ('連兩次「早點睡。」：裂縫 +1（ZR_CRACK）', "GAME.G.flags.ZR_CRACK|0", GE1(1))]),
  dict(id='ZR79_BDAY_CLOSE', key='2027-09-28', h=12.0, zone='dorm', flags=dict(TW3), js=ZRC,
       steps=[('sendchat', 'heroine_02', 'bday'), ('wait', GE('謝謝！今天我給自己放假，一個人去看電影。'), 1500, '她回生日快樂')], none=['我剛起床。']),
  dict(id='ZR79_BDAY_DATING', key='2028-09-28', h=20.85, zone='dorm', flags=dict(TWF), js=Y4 + ZRD, pref=['接起來', '生日快樂。', '我等妳。'],
       steps=[('until', 21.6, 1500)],
       jsok=[('「……明年的生日，我要回去過。」', LNQ('……明年的生日，我要回去過。'), GE1(1)), ('「我等妳。」→「嗯。你說的喔。」', LNQ('嗯。你說的喔。'), GE1(1)), ('記憶 HOL_BDAY_2028', MEMQ('heroine_02', 'HOL_BDAY_2028'), True)]),
  dict(id='ZR79_NEWYEAR', key='2028-01-01', h=10.0, zone='dorm', flags=dict(TW3), js=ZRC,
       steps=[('sendchat', 'heroine_02', 'newyear'), ('jump', 'GAME.G.day', 16.3, '同一天 16:18（她英國時間早上）'), ('until', 17.5, 1500)],
       jsok=[('「新年快樂！這邊也過了。」「昨天跨年，街上好多人。」', "[%s,%s]" % (GE('新年快樂！這邊也過了。'), GE('昨天跨年，街上好多人。')), [True, True])]),
  dict(id='ZR79_US', key='2028-10-08', h=9.85, zone='us_apartment', flags=dict(USF), js=Y4 + ZRD, pref=['接起來', '要去了。'],
       steps=[('until', 10.6, 1500)], jsok=[('美國路線：收尾「你那邊才早上吧。……要去上課了？」', LNQ('你那邊才早上吧。……要去上課了？'), GE1(1)), ('有「要去了。」', LNQ('要去了。'), GE1(1))]),
]
for _s in R11:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R11
# ===== R12：第 77、80 項（AA_207 大一上改稿、AA_420 溫州街打工；開發分支 cecd9eb98；事實照子代理 20:4x 讀 ab65_2_unit／aa420_jobs_unit／aa420_wz_unit 與原始碼）=====
#   和清單字面不一樣、照程式寫的：77-③ 明軒「家裡的事」ev_mingxuan_money 標了 off（交接包 v1 關閉），遊戲不會自己觸發＝只用 runev 看台詞，另外記 off；
#   77-④ 沒見過學姊就不演的是校慶的法律問答攤 ev_sis_festival_booth（prereq met_sis），不是社博（社博 ev_sis_club_expo 沒見過的照樣演）。
UNMEET = lambda i: " { const M=G.social&&G.social.mem; if(M&&M[%s]) M[%s]=M[%s].filter(m=>m.tag!=='FIRST_MET'); delete G.flags['met_'+%s]; }" % ((json.dumps(i),) * 4)
EVDONE = lambda i, k=None: " G.events=G.events||{}; G.events.done=G.events.done||{}; G.events.done[%s]=%s;" % (json.dumps(i), "D(%s)" % json.dumps(k) if k else 'G.day-1')
EVUNDO = lambda i: " if(G.events&&G.events.done) delete G.events.done[%s];" % json.dumps(i)
ORD2 = lambda a, b: "(()=>{ const L=(window.__LOG||[]).map(x=>String(x.t)); const i=L.findIndex(t=>t.includes(%s)), j=L.findIndex(t=>t.includes(%s)); return i>=0&&j>i; })()" % (json.dumps(a, ensure_ascii=False), json.dumps(b, ensure_ascii=False))
RND = lambda v: " Math.random=()=>%s;" % v   # 【捷徑】固定亂數（ZR_CUP_NOTE_P=0.1 的那一下）
ZRBELL = ['圖我看得懂啦，是老師講太快。', '上週那張圖我只抄到一半，下次借我看。']
GEL = ['標錯價喔？我看過那種新聞。原來你們上課會講這個。', '好，那我把你拉進群組，報告的事群組講。']
CUP = '（紙杯上多了一行字，寫的是一部電影裡的一個場景。）'
BOOTH = ['你。過來。', '幫我顧十分鐘。不會的不要亂答，叫我就好。']
R12 = [
  # 77-① 芷若傅鐘：經原分組演過＝選項①「週五的經原……」有自己的回答，不接「對啊。下一堂三點，懶得走。」
  dict(id='AB77_BELL_GE', key='2025-09-30', h=15.0, zone='campus', flags=dict(TW3), js=" LV('heroine_02',30,10,5);" + EVDONE('ev_zhiruo_ge_group', '2025-09-26'),
       steps=[('runev', 'ev_zhiruo_bell')], pref=['週五的經原，妳聽得懂供給曲線嗎？'], want=ZRBELL, none=['對啊。下一堂三點，懶得走。'],
       jsok=[('選項①出現', CHN('週五的經原，妳聽得懂供給曲線嗎？'), GE1(1))]),
  dict(id='AB77_BELL_NOGE', key='2025-09-30', h=15.0, zone='campus', flags=dict(TW3), js=" LV('heroine_02',30,10,5);" + EVUNDO('ev_zhiruo_ge_group'),
       steps=[('runev', 'ev_zhiruo_bell')], pref=['妳上完課都在這裡發呆？'], want=['對啊。下一堂三點，懶得走。'],
       jsok=[('經原沒演過：沒有選項①', CHN('週五的經原，妳聽得懂供給曲線嗎？'), 0)]),
  # 77-① 經原分組：在 Café 見過（FIRST_MET）＝「欸，是你。你也修經原喔？」、不自我介紹；沒見過＝「不好意思，你是法律系的嗎？……」＋「林芷若，外文二。」
  dict(id='AB77_GE_MET', key='2025-09-26', h=12.3, zone='dorm', flags=dict(TW3), js=" LV('heroine_02',20,5,5); SOCIAL.remember('heroine_02','FIRST_MET','cafe');" + EVUNDO('ev_zhiruo_ge_group'),
       steps=[('runev', 'ev_zhiruo_ge_group')], pref=['好。網拍標錯價算不算？'], want=['欸，是你。你也修經原喔？'] + GEL,
       none=['林芷若，外文二。', '不好意思，你是法律系的嗎？', '一千元的相機那種', '組員裡有一個法律系的']),
  dict(id='AB77_GE_NEW', key='2025-09-26', h=12.3, zone='dorm', flags=dict(TW3), js=UNMEET('heroine_02') + EVUNDO('ev_zhiruo_ge_group'),
       steps=[('runev', 'ev_zhiruo_ge_group')], pref=['好。網拍標錯價算不算？'], want=['不好意思，你是法律系的嗎？剛剛點名有聽到。', '林芷若，外文二。'] + GEL,
       none=['欸，是你。你也修經原喔？', '一千元的相機那種', '組員裡有一個法律系的']),
  # 77-② 子晴公館的晚上：第一句「你怎麼這麼晚還在公館？」，沒有「欸不是」
  dict(id='AB77_ZQ_NIGHT', key='2025-10-15', h=21.5, zone='gongguan', flags=dict(TW3), js=" LV('heroine_04',25,10,5);" + EVUNDO('ev_ziqing_gongguan_night'),
       steps=[('runev', 'ev_ziqing_gongguan_night')], pref=[], want=['你怎麼這麼晚還在公館？', '我剛從網咖出來，打了三小時。你室友還活著嗎？他三天沒回訊息。'], none=['欸不是'],
       jsok=[('「你怎麼這麼晚還在公館？」在網咖那一句前面', ORD2('你怎麼這麼晚還在公館？', '我剛從網咖出來'), True)]),
  # 77-③ 明軒家裡的事：最後一句「嗯，謝了。」，沒有「不要跟阿哲講」（事件 off＝遊戲不會自己演，記下來）
  dict(id='AB77_MX_MONEY', key='2025-11-20', h=19.0, zone='dorm', flags=dict(TW3), js=" LV('classmate_mingxuan',45,30,10);",
       steps=[('runev', 'ev_mingxuan_money')], pref=[], want=['我下學期家教可能要再多接。家裡……嗯。', '只是球可能要少打一點。', '嗯，謝了。'], none=['不要跟阿哲講', '他會請我吃一個月的麵'],
       jsok=[('ev_mingxuan_money 標了 off（遊戲裡不會自己觸發；回報 LAWWW-B）', "(ev=>ev?!!ev.off:null)(STORY_EVENTS.find(e=>e.id==='ev_mingxuan_money'))", True)]),
  # 77-④ 沒見過學姊（met_sis 沒有）：校慶法律問答攤不演；對照組 met_sis＝演
  dict(id='AB77_BOOTH_NO', key='2025-11-15', h=10.2, zone='campus', flags=dict(TW3), js=" SOCIAL.meet('heroine_05','test'); delete G.flags.met_sis;" + EVUNDO('ev_sis_festival_booth'),
       steps=[PLACEAT(-17.8, 13.0, '【捷徑】放到法律問答攤前（-17.8,13.0）'), ('until', 10.9, 900)], pref=[], none=BOOTH,
       jsok=[('prereq（met_sis）不成立', "EVENTS.cond((STORY_EVENTS.find(e=>e.id==='ev_sis_festival_booth')||{}).prereq)", False)]),
  dict(id='AB77_BOOTH_YES', key='2025-11-15', h=10.2, zone='campus', flags=dict(TW3, met_sis=True), js=" LV('heroine_05',25,10,5); G.flags.met_sis=true;" + EVUNDO('ev_sis_festival_booth'),
       steps=[PLACEAT(-17.8, 13.0, '【捷徑】放到法律問答攤前（-17.8,13.0）'), ('until', 11.5, 1500)], pref=[], want=BOOTH[:1],
       jsok=[('對照組：見過學姊＝攤位演了', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_sis_festival_booth)", True)]),
  # 77-⑤ 可昕：跨年邀約的選項「我想在臺北跟麵店團跨年。」→「好。那你幫我跟阿哲說新年快樂。」；成績公布「……都過了。好，這次才是真的放假。」
  dict(id='AB77_KX_NYE', key='2025-12-24', h=20.8, zone='dorm', flags=dict(TW3, dating_kexin=True), js=" LV('kexin',65,50,45); G.flags.dating_kexin=true;",
       steps=[('until', 21.3, 900),
              ('chk', '12/24 21:00 可昕私訊、兩個選項', "(m=>m&&m.ask?m.ask.opts.map(o=>o.t):null)((GAME.G.msgs||[]).find(x=>x.text==='跨年要不要來高雄？這邊河邊人比較少。'))", ['好。', '我想在臺北跟麵店團跨年。']),
              ('jsrun', "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.text==='跨年要不要來高雄？這邊河邊人比較少。'); if(!m||!m.ask) return false; return PHONE.answer(GAME.G,m.ask.id,1)!=null; })()", '【捷徑】手機回第二個選項（PHONE.answer）'),
              ('wait', GE('好。那你幫我跟阿哲說新年快樂。'), 60, '她回')],
       jsok=[('回「好。那你幫我跟阿哲說新年快樂。」', GE('好。那你幫我跟阿哲說新年快樂。'), True), ('KX_NYE_PICK＝roof', "GAME.G.flags.KX_NYE_PICK", 'roof'), ('沒有「我答應麵店團要去頂樓了。」', GE('我答應麵店團要去頂樓了。'), False)]),
  dict(id='AB77_KX_GRADES', key='2026-01-23', h=21.0, zone='dorm', flags=dict(TW3, dating_kexin=True), js=" LV('kexin',65,50,45); G.flags.dating_kexin=true;",
       steps=[('runev', 'ev_kexin_grades_open')], pref=[], want=['三、二、一——', '……都過了。好，這次才是真的放假。'], none=['寒假開始']),
  # 77-⑥ 芷若紙杯上的電影：第一次一定有（亂數 0.99 也有）；之後 10%（0.5＝沒有、0.05＝有）
  dict(id='AB77_CUP_FIRST', key='2025-10-20', h=15.0, zone='cafe', flags=dict(TW3, CAFE_VISITS=2), js=" LV('heroine_02',70,50,45); G.flags.CAFE_VISITS=2; delete G.flags.zhiruoCupNote;" + RND(0.99),
       steps=[('runev', 'ev_cafe_barista_zhiruo')], pref=['拿鐵'], want=[CUP], jsok=[('演完記 zhiruoCupNote', "!!GAME.G.flags.zhiruoCupNote", True)]),
  dict(id='AB77_CUP_AGAIN_NO', key='2025-10-20', h=15.0, zone='cafe', flags=dict(TW3, CAFE_VISITS=2, zhiruoCupNote=True), js=" LV('heroine_02',70,50,45); G.flags.CAFE_VISITS=2; G.flags.zhiruoCupNote=true;" + RND(0.5),
       steps=[('runev', 'ev_cafe_barista_zhiruo')], pref=['拿鐵'], none=[CUP]),
  dict(id='AB77_CUP_AGAIN_YES', key='2025-10-20', h=15.0, zone='cafe', flags=dict(TW3, CAFE_VISITS=2, zhiruoCupNote=True), js=" LV('heroine_02',70,50,45); G.flags.CAFE_VISITS=2; G.flags.zhiruoCupNote=true;" + RND(0.05),
       steps=[('runev', 'ev_cafe_barista_zhiruo')], pref=['拿鐵'], want=[CUP]),
]
# ---- 80：溫州街三家店的打工（jobs3d.js、wzlines3d.js、wzpark3d.js、data/wz_events.js）----
def HIRE(k, days, **o):   # 照 tests/aa420_jobs_unit.js 的 hire（G.jobs[k]）；【前置】已經應徵好
    extra = ''.join(" J0[%s][%s]=%s;" % (json.dumps(k), json.dumps(a), json.dumps(v)) for a, v in o.items())
    return " { const J0=JOBS.rec(G); J0[%s]={since:G.day-1,from:(G.day-1)*24,day:%s,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:G.day-1,wk:{},brk:{},ot:{}};%s }" % (json.dumps(k), json.dumps(days), extra)
MONEY0 = ('mark', "window.__MA=GAME.G.money|0; window.__LN=(window.__LOG||[]).length;")
NOLOSS = ('錢沒有被扣（另一個不扣分）', "(GAME.G.money|0)>=(window.__MA|0)", True)
def JUMPK(k, h, z, note=''): return ('jsrun', "(async([k,h,z])=>{ const G=GAME.G; G.day=STORY.dayOfKey(k); G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); try{ if(G.zone!==z) await GAME.enter(z); }catch(e){ return 'ERR '+e; } return true; })(%s)" % json.dumps([k, h, z]), '【捷徑】日子撥到 %s %s、直接進 %s%s' % (k, h, z, note))
SHIFT = lambda k: ('jsrun', "(()=>{ void JOBS.runShift(GAME,%s); return true; })()" % json.dumps(k), '【捷徑】直接開班（JOBS.runShift；走進店裡在時段內也會自動開）')
ANS = lambda th, k, note: ('jsrun', "(()=>{ const m=(GAME.G.msgs||[]).find(x=>x.th===%s&&x.ask); if(!m) return false; return PHONE.answer(GAME.G,m.ask.id,%d)!=null; })()" % (json.dumps(th), k), '【捷徑】手機回 %s（PHONE.answer）' % note)
LEASE1 = '爸，你可以問他啊。他是法律系的。'
YTL = '（你想起阿德那封信。學長第一個問的，是租約寫了幾年。）'
R12 += [
  # 80-① 週六早午餐＋法服值班：出門提醒兩個都列，選法服＝早午餐這週請假（missed）、到萬才館、不扣錢
  dict(id='JOB80_SAT', key='TERMDAY:Y2S1:3:6', h=6.9, zone='dorm', flags=dict(TW3, lawclub=True), js=" G.flags.lawclub=true;" + HIRE('brunch', [6], shifts=2),
       steps=[MONEY0, ('until', 7.4, 900)], pref=['出發：法服值班'], wantZone='wancai',
       jsok=[('列了「出發：半熟的班（07:30～11:30）」', CHN('出發：半熟的班（07:30～11:30）'), GE1(1)), ('列了「出發：法服值班（萬才館一樓 9:00）」', CHN('出發：法服值班（萬才館一樓 9:00）'), GE1(1)),
             ('早午餐這週＝missed', "(q=>q?q.state:null)(OUT.get(GAME.G,'job_brunch_'+GAME.G.day))", 'missed'), NOLOSS]),
  # 80-① 週四影印＋公法讀書會：兩個都列，選讀書會＝影印這週請假、提示「今晚去公法讀書會……」
  dict(id='JOB80_THU', key='TERMDAY:Y2S1:3:4', h=17.3, zone='dorm', flags=dict(TW3, CLUB_public_law_group=True), js=" G.flags.CLUB_public_law_group=true;" + HIRE('copy', [4], shifts=2),
       steps=[MONEY0, ('until', 17.9, 900)], pref=['去公法讀書會'],
       jsok=[('列了「出發：阿德影印的班（18:00～22:00）」', CHN('出發：阿德影印的班（18:00～22:00）'), GE1(1)), ('列了「去公法讀書會」', CHN('去公法讀書會'), GE1(1)),
             ('提示「今晚去公法讀書會（20:00，萬才館研討室 A）」', LNQ('今晚去公法讀書會（20:00，萬才館研討室 A）'), GE1(1)), ('影印這週＝missed', "(q=>q?q.state:null)(OUT.get(GAME.G,'job_copy_'+GAME.G.day))", 'missed'), NOLOSS]),
  # 80-② 暑假第一天 12:00 三家各問一次；早午餐「放假先停。」＝暑假不排、開學第一週恢復；茶屋「來。」＝照排
  dict(id='JOB80_VAC', key='2026-06-15', h=11.8, zone='dorm', flags=dict(TW3), js=HIRE('brunch', [6], shifts=1) + HIRE('tea', [7], shifts=1) + HIRE('copy', [3], shifts=1),
       steps=[('until', 12.3, 900), ANS('p:wz_mi', 1, '小米姐「放假先停。」'), ANS('p:wz_su', 0, '蘇姨「來。」'), ANS('p:wz_ade', 0, '阿德「來。」'), ('wait', GE('好。開學見。'), 60, '小米姐回')],
       jsok=[('小米姐「放假了。週末早上還來嗎？」', GE('放假了。週末早上還來嗎？'), True), ('阿德「放假了，晚上比較閒。還要來嗎？」', GE('放假了，晚上比較閒。還要來嗎？'), True), ('蘇姨「放假了。院子還是要掃。」', GE('放假了。院子還是要掃。'), True),
             ('小米姐回「好。開學見。」', GE('好。開學見。'), True),
             ('「放假先停」：暑假的週六不排、早午餐 paused', "(()=>{ const G=GAME.G; let s=G.day; while(CALENDAR.dateOf(s).wd!==6) s++; return [JOBS.due(G,'brunch',s), JOBS.paused(G,'brunch')]; })()", [False, True]),
             ('「來。」：暑假的週日茶屋照排', "(()=>{ const G=GAME.G; let s=G.day; while(CALENDAR.dateOf(s).wd!==7) s++; return JOBS.due(G,'tea',s); })()", True),
             ('開學第一週恢復', "(()=>{ const G=GAME.G; let s=CALENDAR.termDays('Y2S1').from; while(CALENDAR.dateOf(s).wd!==6) s++; return JOBS.due(G,'brunch',s); })()", True)]),
  # 80-③ 日本路線大三下暫停；回國第一次進店，阿德一句；選「先不了」
  dict(id='JOB80_JP_BACK', key='2028-03-01', h=12.0, zone='dorm', flags=dict(EXCHANGE_ROUTE='JP', EXCH_RULE=1), js=HIRE('copy', [3], shifts=3),
       steps=[('jsrun', "(()=>{ JOBS.phone(GAME.G); return true; })()", '人在國外的期間跑一次 JOBS.phone（記 away）'),
              ('chk', '日本路線大三下：暫停', "(()=>{ const G=GAME.G; let s=G.day+3; while(CALENDAR.dateOf(s).wd!==3) s++; return !JOBS.due(G,'copy',s)&&!!JOBS.away(G,s); })()", True),
              JUMPK('2028-08-10', 12.0, 'dorm', '（回國以後）'), ('jsrun', "(()=>{ GAME.G.flags.JP_RETURNED=STORY.dayOfKey('2028-08-05'); JOBS.phone(GAME.G); return true; })()", '回國以後再跑一次 JOBS.phone（記 back）'),
              JUMPK('2028-08-10', 15.0, 'wz_print', '（第一次走進阿德影印）'), ('wait', LNQ('回來了喔。阿芃一直問你去哪了。還要來嗎？') + '>0', 300, '老闆那一句')],
       pref=['「先不了。」'], want=['回來了喔。阿芃一直問你去哪了。還要來嗎？', '好。有東西要印就來。', '書背對齊了。']),
  # 80-④ 延畢：美國路線大五上最後一個週日的茶屋＝「離開的時候」
  dict(id='JOB80_GRAD', key='2029-12-23', h=12.9, zone='wz_teahouse', flags=dict(EXCHANGE_ROUTE='US', EXCH_RULE=1), js=Y4 + HIRE('tea', [7], shifts=20),
       steps=[('chk', '這天是週日、在大五上的最後一週', "(()=>{ const G=GAME.G, r=CALENDAR.termDays('Y5S1'); return [CALENDAR.dateOf(G.day).wd, !!r&&G.day<=r.to&&G.day>r.to-7]; })()", [7, True]), SHIFT('tea'),
              ('wait', LNQ('你泡得最好的那一種。') + '>0', 1500, '最後一班')],
       pref=[], want=['你泡得最好的那一種。'], jsok=[('gone＝grad', "(j=>j?j.gone:null)(JOBS.job(GAME.G,'tea'))", 'grad')]),
  # 80-⑤ 線一 1-2：影印班、大二上第 6～10 週才有（第 8 週有；第 5、11 週沒有）
  dict(id='WZ80_LEASE1_W8', key='TERMDAY:Y2S1:8:2', h=17.95, zone='wz_print', flags=dict(TW3), js=HIRE('copy', [2], shifts=2),
       steps=[SHIFT('copy'), ('wait', LNQ(LEASE1) + '>0', 1500, '1-2')], pref=['我可以陪你去'], want=[LEASE1], jsok=[('選陪他去＝WZ_COPY_LEASE 1', "GAME.G.flags.WZ_COPY_LEASE", 1)]),
  dict(id='WZ80_LEASE1_W5', key='TERMDAY:Y2S1:5:2', h=17.95, zone='wz_print', flags=dict(TW3), js=HIRE('copy', [2], shifts=2),
       steps=[SHIFT('copy'), ('until', 22.1, 1500)], pref=[], none=[LEASE1]),
  dict(id='WZ80_LEASE1_W11', key='TERMDAY:Y2S1:11:2', h=17.95, zone='wz_print', flags=dict(TW3), js=HIRE('copy', [2], shifts=2),
       steps=[SHIFT('copy'), ('until', 22.1, 1500)], pref=[], none=[LEASE1]),
  # 80-⑤ 語彤租約的訊息：WZ_COPY_LEASE≥2 才多一句
  dict(id='WZ80_YT_LEASE2', key='TERMDAY:Y2S2:5:3', h=21.0, zone='dorm', flags=dict(TW3, WZ_COPY_LEASE=2), js=" LV('heroine_03',45,30,10); G.flags.WZ_COPY_LEASE=2;",
       steps=[('runev', 'ev_yt_lease_text')], pref=[], want=[YTL], jsok=[('那一句在「……房東想把整棟賣掉。還沒確定。」之後', ORD2('房東想把整棟賣掉。還沒確定。', YTL), True)]),
  dict(id='WZ80_YT_LEASE0', key='TERMDAY:Y2S2:5:3', h=21.0, zone='dorm', flags=dict(TW3), js=" LV('heroine_03',45,30,10); delete G.flags.WZ_COPY_LEASE;",
       steps=[('runev', 'ev_yt_lease_text')], pref=[], none=[YTL]),
  # 80-⑥ 線二 2-4：萬才館研討室 A
  dict(id='WZ80_T_STUDY', key='2027-09-16', h=20.0, zone='wancai', flags=dict(TW3, WZ_YE=2), js=" G.flags.WZ_YE=2; G.flags.CLUB_public_law_group=true;",
       steps=[('runev', 'ev_wz_t_study')], pref=[], want=['可是這樣不公平吧！'],
       jsok=[('研討室 A 那一句', LNQ('週四晚上，萬才館研討室 A。'), GE1(1)), ('九點半管理員敲門', LNQ('九點半，管理員來敲門。'), GE1(1)), ('背景 wancai_seminar', "JSON.stringify(window.__BG||[]).includes('wancai_seminar')", True)]),
  # 80-⑦ 線四：走失單只在大三上第 10 週
  dict(id='WZ80_CAT_W10', key='TERMDAY:Y3S1:10:2', h=15.0, zone='wenzhou', flags=dict(TW3), js='',
       steps=[NNOTICE, ('usep', '^看公布欄$')], pref=['走失的貓'], want=['「走失：所長／麻糬／常客（都是牠）。橘白色，很胖。見到請告訴里長。」'], jsok=[('公布欄有「走失的貓」', CHN('走失的貓'), GE1(1))]),
  dict(id='WZ80_CAT_W9', key='TERMDAY:Y3S1:9:2', h=15.0, zone='wenzhou', flags=dict(TW3), js='',
       steps=[NNOTICE, ('usep', '^看公布欄$')], pref=['算了', '不看了'], jsok=[('第 9 週沒有「走失的貓」', CHN('走失的貓'), 0)]),
  # 80-⑧ 學姊在早午餐店：朋友以上叫名字（不是「學弟？」）；沒那麼熟＝「學弟？你在這裡打工喔。」
  dict(id='WZ80_SIS_NAME_F', key='TERMDAY:Y3S1:5:6', h=9.0, zone='wz_brunch', flags=dict(TW3), js=" LV('heroine_05',45,30,10); G.flags.met_sis=true;" + HIRE('brunch', [6], shifts=4),
       steps=[('runev', 'ev_wz_b4')], pref=[], jsok=[('朋友以上：「○○？你在這裡打工喔。」', LNQ('？你在這裡打工喔。'), GE1(1)), ('不是「學弟？」', LNQ('學弟？你在這裡打工喔。'), 0), ('{name} 有換成名字', LNQ('{name}'), 0)]),
  dict(id='WZ80_SIS_NAME_f', key='TERMDAY:Y3S1:5:6', h=9.0, zone='wz_brunch', flags=dict(TW3), js=" LV('heroine_05',25,10,5); G.flags.met_sis=true;" + HIRE('brunch', [6], shifts=4),
       steps=[('runev', 'ev_wz_b4')], pref=[], want=['學弟？你在這裡打工喔。']),
]
for _s in R12:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R12
# ===== R13：第 76、78 項（AA_416 節日、AA_194／BB_172 邀約台詞；fest3d.js、invites3d.js；開發分支 cecd9eb98；事實照子代理 20:5x）=====
#   和清單不一樣、照程式寫的（回報 LAWWW-B）：76-①「她約」只給交往中（第 6 階不約）；76-④ 學姊在美國 FEST 沒做；76-⑦ 學姊考試前手機仍列「約她過節：聖誕節」、選了才婉拒；
#   78-⑤ 節日選項只有手機約有（當面約 together＝不列）。76-⑤ 可昕交往中 2026 七夕兩通 21:00 視訊＝遊戲（Node 重現）。76-⑥ 子晴跨年接在頂樓之後：這一批沒寫（OUT.AFTER，要整場頂樓）。
S6J = lambda i: " Object.assign(SOCIAL.rel(%s),{fam:65,trust:50,comf:45,npcRom:60,rom:35}); SOCIAL.remember(%s,'FIRST_MET',''); G.contacts=G.contacts||{}; G.contacts[%s]=G.day-60;" % ((json.dumps(i),) * 3)
DATEJ = lambda i: " G.flags['dating_'+%s]=true; try{ ROM.get(G,%s).status='dating'; }catch(e){}" % (json.dumps(i), json.dumps(i))
FACE = lambda i: ('jsrun', "(id=>{ let n=GAME.E.npcs.find(x=>x&&x.charId===id); if(!n&&GAME.spawnCharacter){ const P=GAME.E.player.obj.position; n=GAME.spawnCharacter(id,P.x+1,P.z,{}); } void STORY.offerInvite(GAME,id,n); return !!n; })(%s)" % json.dumps(i), '【捷徑】當面：直接叫 %s 的「說話以後的選單」（STORY.offerInvite；負載高走不過去）' % i)
SAIDBY = lambda who, t: "(window.__LOG||[]).filter(x=>String(x.n).includes(%s)&&String(x.t)===%s).length" % (json.dumps(who, ensure_ascii=False), json.dumps(t, ensure_ascii=False))
BLOCKED = "(window.__LOG||[]).filter(x=>/那天已經|中午場已經|晚上場已經|那段時間已經有別的約了/.test(String(x.t))).length"
ZQW = '白色情人節要回禮。我回你一首歌。……很短。'
R13 = [
  # 76-①＋78-⑤ 子晴第 6 階：手機「約她過節：白色情人節」→ 中午場 → Café；再按一次是灰的「已經約好了。」；3/14 見面先演節日那一段
  dict(id='FEST76_ZQ_WHITE', key='2026-03-13', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + S6J('heroine_04'),
       steps=[('phoneinv', 'heroine_04', ['約她過節：白色情人節', '中午場', '兩點半 Café'], 'w1'), ('chk', '她答應（AA_415 節日句）', LNQ('那天是什麼日子我知道。你不用解釋。'), GE1(1)),
              ('phoneinv', 'heroine_04', ['約她過節：白色情人節'], 'w2'), ('chk', '再按一次：「已經約好了。」', LNQ('已經約好了'), GE1(1)),
              ('jump', "STORY.dayOfKey('2026-03-14')", 11.75, '3/14 11:45'), ('phonego',), ('wait', LNQ(ZQW) + '>0', 1500, '見面先演節日那一段')],
       pref=[], jsok=[('見面先演「白色情人節要回禮。我回你一首歌。……很短。」', LNQ(ZQW), GE1(1)), ('fest.done＝meet', "((GAME.G.fest||{}).done||{})['heroine_04:white:2026']", 'meet'), ('記憶 HOL_WHITE_2026', MEMQ('heroine_04', 'HOL_WHITE_2026'), True)]),
  # 76-① 照程式：第 6 階的子晴不會在情人節前一天傳邀約；交往中才會（前一天 21:00）
  dict(id='FEST76_ZQ_S6_NOASK', key='2026-02-13', h=20.8, zone='dorm', flags=dict(TW3), js=NOKX + S6J('heroine_04'),
       steps=[('until', 21.4, 900)], pref=[], jsok=[('第 6 階：沒有「明天下午一點」（照程式；清單寫第 6 階會約）', GE('明天下午一點'), False)]),
  dict(id='FEST76_ZQ_DATE_ASK', key='2026-02-13', h=20.8, zone='dorm', flags=dict(TW3), js=NOKX + S6J('heroine_04') + DATEJ('heroine_04'),
       steps=[('until', 21.4, 900)], pref=[], jsok=[('交往中：前一天 21:00「明天下午一點」', GE('明天下午一點'), True), ('「溫州街的公園 我起得來」', GE('溫州街的公園 我起得來'), True)]),
  # 76-① 芷若第 6 階生日（2025-09-28）：見面送禮——四樣＋「（沒有準備）」，選海報 400 元
  dict(id='FEST76_ZR_BDAY_GIFT', key='2025-09-27', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + S6J('heroine_02') + " G.money=Math.max(G.money|0,3000);",
       steps=[('phoneinv', 'heroine_02', ['約她過節：生日', '中午場', '兩點半 Café'], 'b1'), ('jump', "STORY.dayOfKey('2025-09-28')", 11.75, '9/28 11:45'),
              ('mark', "window.__MA=GAME.G.money|0;"), ('phonego',), ('wait', CHN('（沒有準備）') + '>0', 1500, '送禮的選單')],
       pref=['一張老電影的海報'],
       jsok=[('禮物四樣都列', "[%s,%s,%s,%s]" % (CHN('一本絕版的電影書'), CHN('一張老電影的海報'), CHN('一個新的馬克杯'), CHN('一包咖啡豆')), lambda a: isinstance(a, list) and all(x >= 1 for x in a)),
             ('有「（沒有準備）」', CHN('（沒有準備）'), GE1(1)), ('錢至少少了 400 元', "(window.__MA|0)-(GAME.G.money|0)", lambda n: isinstance(n, (int, float)) and n >= 400),
             ('送過的記在 G.fest.gifts', "JSON.stringify(((GAME.G.fest||{}).gifts||{}).heroine_02||null)", lambda x: isinstance(x, str) and x not in ('null', '[]', '{}'))]),
  # 76-② 一天兩場：子晴中午、以安晚上可以；語彤第三個約不到
  dict(id='FEST76_TWO', key='2026-03-13', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + S6J('heroine_04') + S6J('heroine_01') + S6J('heroine_03'),
       steps=[('phoneinv', 'heroine_04', ['約她過節：白色情人節', '中午場', '兩點半 Café'], 't1'), ('phoneinv', 'heroine_01', ['約她過節：白色情人節', '晚上場', '阿鳳麵店'], 't2'),
              ('phoneinv', 'heroine_03', ['約她過節：白色情人節', '中午場', '晚上場'], 't3')],
       pref=[], jsok=[('中午、晚上各約到一位', "(()=>{ const d=STORY.dayOfKey('2026-03-14'); return ['heroine_04','heroine_01'].map(id=>(GAME.G.invites||[]).some(v=>v.who===id&&v.day===d&&v.state==='accepted')); })()", [True, True]),
                      ('語彤沒約到', "(GAME.G.invites||[]).filter(v=>v.who==='heroine_03'&&v.day===STORY.dayOfKey('2026-03-14')&&v.state==='accepted').length", 0), ('有擋下的那一句', BLOCKED, GE1(1))]),
  # 76-③ 沛珊情人節回台中：開車去（油錢 900、車程），背景台中
  dict(id='FEST76_PS_DRIVE', key='2026-02-13', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + S6J('classmate_peishan') + " G.money=Math.max(G.money|0,3000);",
       steps=[('phoneinv', 'classmate_peishan', ['約她過節：情人節', '開車去台中找她'], 'p1'),
              ('chk', '排了「情人節（開車去台中找郭沛珊）」', "(OUT.rec(GAME.G)||[]).filter(q=>/開車去台中找郭沛珊/.test(q.title||'')).map(q=>[q.h,q.travelH])", lambda a: isinstance(a, list) and len(a) == 1),
              ('jump', "STORY.dayOfKey('2026-02-14')", 8.6, '2/14 早上'), ('mark', "window.__MA=GAME.G.money|0;"), ('wait', CHN('出發：情人節（開車去台中找郭沛珊）') + '>0', 1500, '出發鈕'),
              ('wait', "JSON.stringify(window.__BG||[]).includes('tc_')", 900, '到台中')],
       pref=['出發：情人節（開車去台中找郭沛珊）'], jsok=[('油錢扣 900 元', "(window.__MA|0)-(GAME.G.money|0)", lambda n: isinstance(n, (int, float)) and n >= 900), ('背景是台中（tc_eatery）', "JSON.stringify(window.__BG||[]).includes('tc_eatery')", True)]),
  # 76-④ 芷若在倫敦、交往中：2029-02-14 21:00 她打視訊來
  dict(id='FEST76_ZR_UK_VDAY', key='2029-02-14', h=20.75, zone='dorm', flags=dict(TW3), js=NOKX + Y4 + S6J('heroine_02') + DATEJ('heroine_02'),
       steps=[('until', 21.5, 1500)], pref=['接起來：林芷若打視訊來'], want=['這裡下午一點。外面在下雨。', '……倫敦的情人節也在下雨。'],
       jsok=[('出發鈕「接起來：林芷若打視訊來」', CHN('接起來：林芷若打視訊來'), GE1(1))]),
  # 76-⑤ 可昕交往中 2026 七夕：應該只有一通 21:00 視訊（Node：kx_qixi_2026＋fest_kexin_qixi_2026_video 兩通＝遊戲）
  dict(id='FEST76_KX_QIXI_ONE', key='2026-08-19', h=20.5, zone='dorm', flags=dict(TW3, dating_kexin=True), js=" LV('kexin',70,55,50); G.flags.dating_kexin=true;",
       steps=[('until', 21.6, 1500)], pref=['接起來', '出發'],
       jsok=[('那天 21:00 的視訊只排一通', "(OUT.rec(GAME.G)||[]).filter(q=>q.day===STORY.dayOfKey('2026-08-19')&&Math.abs(q.h-21)<0.01).map(q=>q.id)", lambda a: isinstance(a, list) and len(a) == 1)]),
  # 76-⑦ 學姊 2026-02-02 以前：節日約不到（照程式：選單仍列、選了婉拒）
  dict(id='FEST76_SIS_PRE', key='2025-12-23', h=10.0, zone='dorm', flags=dict(TW3, met_sis=True), js=NOKX + S6J('heroine_05') + " G.flags.met_sis=true;",
       steps=[('phoneinv', 'heroine_05', ['約她過節：聖誕節', '中午場', '晚上場', '兩點半 Café'], 's1')],
       pref=[], jsok=[('婉拒「溫書瑀客氣地說下次吧。」', LNQ('溫書瑀客氣地說下次吧。'), GE1(1)), ('12/24 沒有約到學姊', "(GAME.G.invites||[]).filter(v=>v.who==='heroine_05'&&v.day===STORY.dayOfKey('2025-12-24')&&v.state==='accepted').length", 0),
                      ('（照程式）選單仍列「約她過節：聖誕節」', CHN('約她過節：聖誕節'), lambda n: isinstance(n, int))]),
  # 78-① 阿凱：手機約（沒有標點）／當面約（有標點）
  dict(id='INV78_KAI_PHONE', key='2025-10-06', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('kai',30,10,5); G.contacts=G.contacts||{}; G.contacts.kai=G.day-30;",
       steps=[PINV('kai', '去公館吃飯', '今天 12:10', 'k1')], pref=[], jsok=[('手機版「走 我剛好還沒吃」', LNQ('走 我剛好還沒吃'), GE1(1)), ('沒有標點版', LNQ('走，我剛好還沒吃。'), 0)]),
  dict(id='INV78_KAI_FACE', key='2025-10-06', h=10.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('kai',30,10,5);",
       steps=[FACE('kai')], pref=['約他去', '去公館吃飯', '今天 12:10', '就這樣'], jsok=[('當面版「走，我剛好還沒吃。」', LNQ('走，我剛好還沒吃。'), GE1(1)), ('當面第一句「你等一下有空嗎？」', LNQ('你等一下有空嗎？'), GE1(1))]),
  # 78-② 芷若：交換聯絡方式；上班時約 Café；78-③ 沛珊交換聯絡方式
  dict(id='INV78_ZR_EX', key='2025-10-07', h=15.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('heroine_02',25,10,5); if(G.contacts) delete G.contacts.heroine_02;",
       steps=[FACE('heroine_02')], pref=['交換聯絡方式'], want=['好啊，你掃我。', '我上班的時候不太看手機，下班才會回，不要以為我不理你。'],
       jsok=[('加了聯絡方式', "INV.hasContact(GAME.G,'heroine_02')", True)]),
  dict(id='INV78_ZR_SHIFT', key='2025-10-07', h=15.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('heroine_02',45,30,10); G.contacts=G.contacts||{}; G.contacts.heroine_02=G.day-30;",
       steps=[PINV('heroine_02', '去兩點半 Café', '今天 19:00', 'zs')], pref=[],
       jsok=[('上班時段：「我會在 Café 啊，你直接過來，我幫你做一杯。」', LNQ('我會在 Café 啊，你直接過來，我幫你做一杯。'), GE1(1)), ('不排邀約', "(GAME.G.invites||[]).filter(v=>v.who==='heroine_02'&&v.day===GAME.G.day&&v.state==='accepted').length", 0)]),
  dict(id='INV78_PS_EX', key='2025-10-07', h=15.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('classmate_peishan',25,10,5); if(G.contacts) delete G.contacts.classmate_peishan;",
       steps=[FACE('classmate_peishan')], pref=['交換聯絡方式'], want=['好。上課有問題可以問你嗎？']),
  # 78-④ 以安大一：第一次約散步才問「散步的目的是？」，之後只說「好。」
  dict(id='INV78_AN_WALK', key='2025-10-08', h=14.0, zone='dorm', flags=dict(TW3), js=NOKX + " LV('heroine_01',45,30,10); G.contacts=G.contacts||{}; G.contacts.heroine_01=G.day-30;",
       steps=[PINV('heroine_01', '去溫州街散步', '今天 15:30', 'a1'), ('chk', '第一次：「散步的目的是？」', LNQ('散步的目的是？'), 1),
              PINV('heroine_01', '去溫州街散步', '明天 19:00', 'a2')],
       pref=['好，就', '沒有目的'], jsok=[('「散步的目的是？」只有一次', LNQ('散步的目的是？'), 1), ('第二次她只說「好。」', SAIDBY('以安', '好。'), GE1(1))]),
]
for _s in R13:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R13
# ===== R14：第 84 項 BB 事件包（日文班 G1／G6、普通教學館門口的舊同學、文學院長椅、SK08 迎新；bbpack3d.js、data/bbpack_events.js；開發分支 23bba7c8d 起）=====
# 上課：手機「今天」的「直接去上課」【捷徑：DOM click，同 aa373 S7 的點法】→ 教室裡照選單坐下、上課；校園的偶遇：主角放到觸發點旁邊【捷徑】、時間照走。
PHONECLASS = lambda cid: ('jsrun', "(c=>{ void (async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms)); const open=()=>!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()); const b=document.getElementById('btnPhone'); if(!open()&&b) b.click(); await W(1200); if(!open()&&b){ b.click(); await W(1200); } const t=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(t) t.click(); await W(1200); const g=[...document.querySelectorAll('#phoneBody [data-go]')].find(x=>String(x.dataset.go).indexOf(c)>=0); if(g) g.click(); })(); return true; })(%s)" % json.dumps(cid), '手機「今天」→「直接去上課」（%s；手機已經自己打開＝不再按手機鍵，10-24 JP84_G6 按了反而關掉）' % cid)
JPPREF = ['直接去上課', '還是去', '坐', 'はじめまして。我只會說', '「大丈夫」']
INGRP = lambda g: "(typeof PHONE!=='undefined'&&PHONE.inGroup)?PHONE.inGroup(GAME.G,%s):'沒有 PHONE'" % json.dumps(g)
R14 = [
  # G1：第一次去上日文（日文上第 1 週＝課表的自我介紹那一句已經說了，老師開頭那句不重複）
  dict(id='JP84_G1_W1', key='TERMDAY:Y2S1:1:1', h=12.9, zone='dorm', flags=dict(TW3), js='', pref=JPPREF, steps=[PHONECLASS('japanese_1'), ('until', 15.3, 1500)],
       want=['はじめまして！獸醫系三年級！我想看懂日劇不用字幕！'], none=['一人ずつ、自己紹介をお願いします。……用中文補充也可以。'],
       jsok=[('JP_MET', "!!GAME.G.flags.JP_MET", True), ('加入日文班群組', INGRP('jp_class'), True), ('ev_jp_g1 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_jp_g1)", True)]),
  # G1：第一次去就不是第 1 週（第 3 週）＝老師開頭那一句
  dict(id='JP84_G1_W3', key='TERMDAY:Y2S1:3:1', h=12.9, zone='dorm', flags=dict(TW3), js='', pref=JPPREF, steps=[PHONECLASS('japanese_1'), ('until', 15.3, 1500)],
       want=['一人ずつ、自己紹介をお願いします。……用中文補充也可以。'], jsok=[('JP_MET', "!!GAME.G.flags.JP_MET", True)]),
  # G6：日文下第 10 週（見過日文班的人；G5 先設成演過，只看 G6）
  dict(id='JP84_G6', key='TERMDAY:Y2S2:10:1', h=12.9, zone='dorm', flags=dict(TW3, JP_MET=True), js=EVDONE('ev_jp_g1') + EVDONE('ev_jp_g5'), pref=JPPREF, steps=[PHONECLASS('japanese_2'), ('until', 15.3, 1500)],
       want=['老師點到你。', '同一句「大丈夫です」，可以是「沒關係」，也可以是「不用了」。'], jsok=[('ev_jp_g6 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_jp_g6)", True)]),
  # P5：普通教學館門口的舊同學（9/14 那天照日子擲的數＝0.104、輪到唐睿；BBPACK.roll／p5Pick 在 Node 先算好）
  dict(id='P5_84_TR', key='2026-09-14', h=12.4, zone='campus', flags=dict(TW3), js='', pref=[], steps=[PLACEAT(-38, -47.2, '主角放到普通教學館門口（PUTONG 觸發點 (-38,-48.4) 半徑 4 m）'), ('until', 13.0, 900)],
       want=[], jsok=[('ev_putong_oldmate 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_putong_oldmate)", True), ('P5_USED 有唐睿、P5_TERMS 有 Y2S1', "JSON.stringify([GAME.G.flags.P5_USED,GAME.G.flags.P5_TERMS])", lambda x: isinstance(x, str) and '"tr"' in x and 'Y2S1' in x)]),
  # L4a：文學院門口的長椅（大一、第 6 週起、週二四 9～12，芷若認識）
  dict(id='L4A_84', key='2025-10-07', h=9.4, zone='campus', flags=dict(TW3), js=" LV('heroine_02',25,15,10);", pref=[], steps=[PLACEAT(-38, -20.3, '主角放到文學院門口（ARTS (-38,-21.5)）'), ('until', 10.0, 900)],
       want=['文學院門口的長椅上，芷若在讀一本很舊的英文劇本，用鉛筆在空白處寫中文。'], jsok=[('ev_l4a_pencil 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_l4a_pencil)", True)]),
  # L4b：交換說明會的海報（大二上、平日 10～16、12/10 以前）→「要去聽嗎？」
  dict(id='L4B_84', key='2026-09-15', h=10.4, zone='campus', flags=dict(TW3), js=" LV('heroine_02',25,15,10);", pref=['「要去聽嗎？」'], steps=[PLACEAT(-38, -20.3, '主角放到文學院門口'), ('until', 11.0, 900)],
       want=['布告欄貼著交換說明會的海報，芷若站在前面看了很久。', '……我只是在看海報的字體。'], jsok=[('ev_l4b_poster 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_l4b_poster)", True)]),
  # SK08：大二上第 1 週週三：12:00 阿勳私訊（認識他：MET_XUN）→ 13:00 以後到社科院 → 迎新，選第一個介紹
  dict(id='SK08_84', key='2026-09-09', h=11.9, zone='campus', flags=dict(TW3, MET_XUN=True), js='', pref=['「我是『沉沒成本』'], steps=[('until', 13.05, 900), PLACEAT(16, -83.6, '主角放到社科院門口（SOC (16,-85)）'), ('until', 13.8, 900)],
       want=['我們那年有一個人這樣介紹自己，我一直記得。今年改成每個人都要。'], jsok=[('12:00 阿勳私訊（bb_sk08_dm）', "(typeof PHONE!=='undefined'&&PHONE.sent)?PHONE.sent(GAME.G,'bb_sk08_dm'):'沒有 PHONE'", True), ('SK08_WORD＝sunk', "GAME.G.flags.SK08_WORD||null", 'sunk')]),
]
for _s in R14:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R14
# ===== R15：第 86 項 BB 事件包第 2 輪（日文班三位在 3D 教室、阿凱的鍵盤三種結尾、Kevin 跨年；①交換展在 aa375_probe 的 EXPO86_*）=====
NPCS3D = "(GAME.E.npcs||[]).filter(n=>n&&n.obj&&n.charId&&n.obj.visible!==false&&!n.hidden).map(n=>n.charId)"
GRPMSG = lambda th, rx: "(GAME.G.msgs||[]).filter(m=>m.th===%s&&new RegExp(%s).test(String(m.text))).map(m=>m.text)" % (json.dumps(th), json.dumps(rx, ensure_ascii=False))
DMSENT = lambda tag: "(typeof PHONE!=='undefined'&&PHONE.sent)?PHONE.sent(GAME.G,%s):'沒有 PHONE'" % json.dumps(tag)
R15 = [
  # ② 共同 102 週一 13:05～15:10：采蓁、立衡、宇恆在教室裡（大二）；立衡大三不在（在日本念研究所）
  # 10-24 09:2x：讀檔直接放進 gongtong 那一次 3D 一個人都沒有（連路人都沒有）——改成照玩家：站在共同教學館門口（gongtong_front）13:00，走進去（GAME.enter，和按門一樣），等到 13:54 再看；
  #   另外記 STORY.presence 說她們在哪（daily_schedule：週一 13:05～15:10 gongtong 102，Y2S1／Y2S2）
  dict(id='JP86_ROOM_Y2', key='TERMDAY:Y2S1:4:1', h=13.0, zone='gongtong_front', flags=dict(TW3), js='', pref=[], steps=[ENTER('gongtong'), ('wait', "GAME.G.zone==='gongtong'&&!GAME.E.player.busy", 60, '進到共同教學館'), ('until', 13.9, 900),
              ('chk', 'STORY.presence：采蓁、立衡、宇恆在哪', "['jp_caizhen','jp_liheng','jp_yuheng'].map(id=>{ try{ const p=STORY.presence(id,GAME.G); return id+':'+JSON.stringify(p).slice(0,80); }catch(e){ return id+':ERR'; } })", lambda L: isinstance(L, list)),
              ('chk', '3D 裡所有的人', NPCS3D, lambda L: isinstance(L, list))],
       want=[], jsok=[('3D 教室裡有采蓁、立衡、宇恆', NPCS3D, lambda L: isinstance(L, list) and all(i in L for i in ('jp_caizhen', 'jp_liheng', 'jp_yuheng')))]),
  dict(id='JP86_ROOM_Y3', key='TERMDAY:Y3S1:4:1', h=13.6, zone='gongtong', flags=dict(TW3), js='', pref=[], steps=[('until', 13.9, 600)],
       want=[], jsok=[('大三：沒有立衡', NPCS3D, lambda L: isinstance(L, list) and 'jp_liheng' not in L)]),
  # ③ 阿凱的鍵盤（大一下第 6～7 週週一～四 22:00 以後在房間）：沒去過法服＝「我問學長」→ 23:00 家族群組 Kevin 三句＋23:05 阿凱私訊
  dict(id='KAI86_KEVIN', key='TERMDAY:Y1S2:6:1', h=21.9, zone='dorm', flags=dict(TW3), js=" if(!PHONE.inGroup(G,'family_law')) PHONE.join(G,'family_law','法律系直屬家族');", pref=['「我也還不會。我們一起查。」'], steps=[('until', 23.4, 1500)],
       want=['阿凱的鍵盤聲停了。他把椅子轉過來。', '所以 網拍買的鍵盤少一顆鍵 賣家說不退 可以告嗎', '我問學長。'],
       jsok=[('KAI_KB_ASK＝kevin', "GAME.G.flags.KAI_KB_ASK||null", 'kevin'), ('bb_kai_kb_kevin 送出', DMSENT('bb_kai_kb_kevin'), True),
             ('阿凱私訊「你們法律系的人原來要查這麼久」', GRPMSG('p:kai', '原來要查這麼久'), lambda L: isinstance(L, list) and len(L) >= 1),
             ('家族群組 Kevin 三句（在群組才有）', "(()=>{ const ing=PHONE.inGroup(GAME.G,'family_law'); const n=(GAME.G.msgs||[]).filter(m=>m.th==='g:family_law'&&/先截圖賣場頁面|少一顆鍵算不算|週六早上去法服問/.test(String(m.text))).length; return ing?(n===3?'在群組、三句':'在群組、'+n+' 句'):'不在群組'; })()", '在群組、三句'),
             ('記憶 KAI_KEYBOARD', "SOCIAL.has('kai','KAI_KEYBOARD')", True)]),
  # 去過法服（LAWCLUB_SAT_VISITS≥1）＝「週六法服。」
  dict(id='KAI86_FAFU_ASK', key='TERMDAY:Y1S2:6:2', h=21.9, zone='dorm', flags=dict(TW3, LAWCLUB_SAT_VISITS=1), js='', pref=['「我也還不會。我們一起查。」'], steps=[('until', 22.6, 1200)],
       want=['週六法服。'], jsok=[('KAI_KB_ASK＝fafu', "GAME.G.flags.KAI_KB_ASK||null", 'fafu')]),
  # 第 7 週週六 9～12 在萬才館＝社長三件事（【前置】KAI_KB_ASK＝fafu、KAI_KB_DAY）
  dict(id='KAI86_FAFU_SAT', key='TERMDAY:Y1S2:7:6', h=9.4, zone='wancai', flags=dict(TW3, KAI_KB_ASK='fafu'), js=" G.flags.KAI_KB_DAY=G.day-4;", pref=[], steps=[('until', 10.2, 1200)],
       want=['阿凱抱著鍵盤坐下。社長看了一眼少掉的那一顆。', '三件事。'], jsok=[('ev_kai_keyboard_fafu 演過', "!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_kai_keyboard_fafu)", True)]),
  # 那個週六沒去：12:30 阿凱私訊兩句
  dict(id='KAI86_FAFU_MISS', key='TERMDAY:Y1S2:7:6', h=12.2, zone='dorm', flags=dict(TW3, KAI_KB_ASK='fafu'), js=" G.flags.KAI_KB_DAY=G.day-4;", pref=[], steps=[('until', 12.9, 900)],
       want=[], jsok=[('12:30 阿凱私訊「你沒來 我自己去了 社長講了三分鐘」', GRPMSG('p:kai', '你沒來 我自己去了'), lambda L: isinstance(L, list) and len(L) >= 1), ('記憶 KAI_KEYBOARD', "SOCIAL.has('kai','KAI_KEYBOARD')", True)]),
  # ④ 2026-01-01 00:00 家族群組 Kevin「📷（信義區的煙火）」「新年快樂」（在群組才有；1/1～1/3 讀檔也會補）
  dict(id='NYE86_KEVIN', key='2026-01-01', h=9.0, zone='dorm', flags=dict(TW3), js=" if(!PHONE.inGroup(G,'family_law')) PHONE.join(G,'family_law','法律系直屬家族');", pref=[], steps=[('until', 9.3, 600)],
       want=[], jsok=[('家族群組兩則（在群組才有）', "(()=>{ const ing=PHONE.inGroup(GAME.G,'family_law'); const L=(GAME.G.msgs||[]).filter(m=>m.th==='g:family_law'&&(m.text==='📷（信義區的煙火）'||m.text==='新年快樂')).map(m=>m.text); return ing?(L.length===2?'在群組、兩則':'在群組、'+JSON.stringify(L)):'不在群組'; })()", '在群組、兩則')]),
]
for _s in R15:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R15
# ===== R16：第 85 項 裂縫到 3 的談話（cracktalk3d.js；語彤的週四；開發分支 23bba7c8d 起）=====
#   交往中【前置：DATEJ】、她的週四是自己的（YT_EV13）。① 12:10 她傳「斜對面的位子我留了」，17:00～20:00 沒去、沒回「今天不行」＝YT_CRACK +1。
#   ② 這學期到 3（【前置】先 2、前一天 ROM.crack +1＝cracktalk 排談話）→ 下一個週四 12:10 兩句私訊 → 17:30 人到總圖三樓【捷徑：直接進 library】＝談話；選第一個（修補）＝歸零。
YTC = DATEJ('heroine_03') + " G.flags.YT_EV13=true;"
R16 = [
  dict(id='CRACK85_YT_SEAT', key='2026-10-01', h=11.9, zone='dorm', flags=dict(TW3), js=YTC + " G.flags.YT_CRACK=0; G.flags.YT_CRACK_TERM='Y2S1';", pref=[], steps=[('until', 12.4, 900), ('until', 20.3, 3000)],
       want=[], jsok=[('12:10 她傳「斜對面的位子我留了」', GRPMSG('p:heroine_03', '斜對面的位子我留了'), lambda L: isinstance(L, list) and len(L) >= 1), ('沒去、沒回＝YT_CRACK 1', "GAME.G.flags.YT_CRACK|0", 1)]),
  dict(id='CRACK85_YT_TALK', key='2026-10-07', h=20.0, zone='dorm', flags=dict(TW3), js=YTC + " G.flags.YT_CRACK=2; G.flags.YT_CRACK_TERM='Y2S1'; ROM.crack(G,'heroine_03',1);", pref=['斜對面'],
       steps=[('jump', "STORY.dayOfKey('2026-10-08')", 12.0, '隔天 10/8（四）12:00'), ('until', 12.4, 900), ('until', 17.4, 2400), ENTER('library', note='總圖三樓'), ('until', 18.6, 1500)],
       want=['今天週四。我在三樓。', '……我想問你一件事。', '我分給你的時間，你好像不太需要。……沒關係，我只是想問清楚。'],
       jsok=[('談過（CRACKTALK.r.heroine_03.talked 有 Y2S1）', "JSON.stringify(((GAME.G.flags.CRACKTALK||{}).r||{}).heroine_03||null)", lambda x: isinstance(x, str) and 'Y2S1' in x), ('還在交往', "!!GAME.G.flags.dating_heroine_03", True)]),
]
for _s in R16:
    if R8H not in _s.get('js', ''): _s['js'] = R8H + _s.get('js', '')
SCENS = SCENS + R16

# ---------- R17（BB-B 10-24 08:3x）：美國臥室 C（學姊的房間，us_bed_c；LAWWW-B 08:11 測試請求＋08:20 AA_444 fd9ad6574）----------
# 進得去的條件（room_glb_layouts.js open、us_life3d.js 239 行）：交往中（dating_heroine_05）、US2 以後（9/13 以後）、週六日 14:00～21:00、她不在外面。
# 「看」的字（us_life_events.js looks.roomC）：第一次進去一句（US_ROOM_C_SEEN）、書桌／書架各兩句、窗外照日期四版（8/2 綠、10/1 黃、11/1 剩幾片葉子、12/2 雪）＋去過臺灣 5F 研究室多一句。
# 窗景圖（rooms_glb3d.js view_season:'us' → us3d.js usSeasonKey）：10/9 起 autumn、11/1 起 bare、12/2 起 snow。10/1～10/8 字是「變黃了」、圖還是 summer＝BEDC_OCT07 會看出來。
CAPH = " if(!window.__COBS){ const ce=document.getElementById('caption'); if(ce&&window.MutationObserver){ window.__COBS=1; let lc=''; new MutationObserver(()=>{ const s=(ce.textContent||'').trim(); if(s&&s!==lc){ lc=s; try{ window.__LOG.push({n:'CAPD',t:'CAPD:'+s,h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} } }).observe(ce,{childList:true,characterData:true,subtree:true}); } }"   # 畫面中間的字幕（GM.caption：第一次進房間那一句）也記下來
USC = dict(USF, US_ARRIVED_DAY='2028-08-02', US1='together', US2=True, dating_heroine_05=True)
USC_NO = dict(USF, US_ARRIVED_DAY='2028-08-02', US1='alone', US2=True)
RC = {'first': '（第一次進她的房間。東西很少，床鋪得很平。書桌靠著窗。）',
      'desk': ['（書桌上疊著三本很厚的判例教科書，公司法那一本貼滿了便利貼。筆電旁邊，螢光筆照顏色排好。）', '（牆上貼著一張讀書計畫，鉛筆寫的，一天一格。週六、週日下午那兩格是空白的。）'],
      'shelf': ['（書架下面兩層是判例彙編，書背貼著圖書館的標籤。上面一層是筆記本，側邊都寫了科目。）', '（最旁邊夾著幾本中文書：從臺灣帶來的民法、公司法，還有一本書角翻軟了的小說。）'],
      'win_sum': '（窗外是一棵很大的樹，葉子擋住半個窗戶。）', 'win_oct': '（窗外那棵樹變黃了。靠窗的那一邊先變。）',
      'win_nov': '（窗外的樹只剩幾片葉子，看得到對面那棟樓的窗戶了。）', 'win_dec': '（窗外的樹枝上留著一點雪。窗台上也有。）',
      'winLab': '（她臺灣研究室的窗外，也有一棵樹，在差不多的位置。）', 'other': '（門上貼著一張手寫的課表。）'}
DOORC = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/臥室 C/.test(String(i.label||''))); return it?it.label:null; })()"
WINTEX = "(()=>{ const out=new Set(); GAME.E.scene.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms){ const im=m&&m.map&&m.map.image; const s=im&&(im.currentSrc||im.src||''); if(s&&/views\\/us_bed_c/.test(s)) out.add(s.replace(/^.*views\\//,'').replace(/\\?.*$/,'')); } }); return [...out].join(','); })()"
SISAT = "(()=>{ const n=(GAME.E.npcs||[]).find(n=>n&&n.charId==='heroine_05'&&n.obj&&n.obj.visible!==false&&!n.hidden); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null; })()"
CAPNOW = "((document.getElementById('caption')||{}).textContent||'').trim()"
INC = ('wait', "GAME.G.zone==='us_bed_c'&&!GAME.E.player.busy", 60, '進到臥室 C')
OUTC = ('wait', "GAME.G.zone==='us_shared'&&!GAME.E.player.busy", 60, '回到 208 的走道')
KNOCK = ('usep', '^敲門（臥室 C）')
def PAUSE(n, note): return ('wait', "(window.__PZ=(window.__PZ||0)+1)%%%d===0" % n, n + 2, note)   # 等 n 秒（計數到 n 才成立；不算問題）
def BEDC_WIN(sid, key, line, tex, note):
    return dict(id=sid, key=key, h=14.6, zone='us_shared', flags=dict(USC), js='', pref=[],
                steps=[('chk', '門口是「敲門（臥室 C）」', DOORC, '敲門（臥室 C）'), KNOCK, INC, ('usep', '^窗外'),
                       ('chk', '窗景圖：%s（%s）' % (tex, note), WINTEX, lambda s, t=tex: isinstance(s, str) and t in s)],
                want=[line], none=[RC['winLab']])
R17 = [
  # ① 第一次進去：一句旁白、她坐在書桌前、書桌／書架／窗外、說話、離開；第二次進去不再出第一次那句
  dict(id='BEDC_FIRST', key='2028-09-16', h=14.6, zone='us_shared', flags=dict(USC), js=CAPH, pref=[],
       steps=[('chk', '門口是「敲門（臥室 C）」（交往中、週六 14:36）', DOORC, '敲門（臥室 C）'), KNOCK, INC,
              ('chk', '第一次進去記 US_ROOM_C_SEEN', "GAME.G.flags.US_ROOM_C_SEEN!=null", True),
              ('chk', '她在房間裡（3D）', NPCS3D, lambda L: isinstance(L, list) and 'heroine_05' in L),
              ('chk', '她在書桌前（spots.sis 0.86,-0.1 附近）', SISAT, lambda p: isinstance(p, list) and abs(p[0] - 0.86) < 0.7 and abs(p[1] + 0.1) < 0.7),
              ('chk', '窗景圖：夏天白天（9/16）', WINTEX, lambda s: isinstance(s, str) and 'us_bed_c_summer_day' in s),
              ('shot', 'bedc_first', None, 'true', 2),
              ('usep', '^她的書桌'), ('usep', '^書架'), ('usep', '^窗外'), ('talk', 'heroine_05'),
              ('usep', '^離開房間'), OUTC,
              ('chk', '回到走道以後門還是「敲門（臥室 C）」', DOORC, '敲門（臥室 C）'),
              KNOCK, INC, PAUSE(6, '第二次進去等 6 秒（看會不會再出第一次那句）'),
              ('chk', '第二次進去：字幕沒有第一次那句', CAPNOW, lambda t: RC['first'] not in str(t))],
       want=['CAPD:' + RC['first']] + RC['desk'] + RC['shelf'] + [RC['win_sum']], none=[RC['winLab'], RC['other']]),
  # ② 窗外四季（字＋圖）。10/7：字已經是「變黃」、圖要 10/9 才換 autumn
  BEDC_WIN('BEDC_OCT07', '2028-10-07', RC['win_oct'], 'autumn', '10/7 的字是「變黃了」；圖 10/9 才換，這裡會看出字和圖對不對得上'),
  BEDC_WIN('BEDC_OCT21', '2028-10-21', RC['win_oct'], 'autumn', '10/21'),
  BEDC_WIN('BEDC_NOV18', '2028-11-18', RC['win_nov'], 'bare', '11/18'),
  BEDC_WIN('BEDC_DEC09', '2028-12-09', RC['win_dec'], 'snow', '12/9'),
  # ③ 晚上 20:30：窗景換夜景
  dict(id='BEDC_NIGHT', key='2028-09-16', h=20.4, zone='us_shared', flags=dict(USC), js='', pref=[],
       steps=[KNOCK, INC, ('chk', '窗景圖：夏天晚上（20:30）', WINTEX, lambda s: isinstance(s, str) and 'us_bed_c_summer_night' in s), ('shot', 'bedc_night', None, 'true', 2)],
       want=[]),
  # ④ 去過她臺灣 5F 研究室（G.visited.linze_5f）：窗外多一句
  dict(id='BEDC_LAB', key='2028-09-16', h=14.6, zone='us_shared', flags=dict(USC), js=" G.visited=G.visited||{}; G.visited.linze_5f=true;", pref=[],
       steps=[KNOCK, INC, ('usep', '^窗外')], want=[RC['win_sum'], RC['winLab']]),
  # ⑤ 不是交往中：門的「看」＝課表那一句；進不去
  dict(id='BEDC_OTHER', key='2028-09-16', h=14.6, zone='us_shared', flags=dict(USC_NO), js='', pref=[],
       steps=[('chk', '門口不是「敲門」', DOORC, lambda s: isinstance(s, str) and not s.startswith('敲門')), ('usep', '臥室 C'),
              PAUSE(4, '按門以後等 4 秒'), ('chk', '還在 208 的走道', "GAME.G.zone", 'us_shared')],
       want=[RC['other']]),
  # ⑥ 交往中、平日晚上（週三 20:00）：門關著
  dict(id='BEDC_WEEKDAY', key='2028-09-20', h=20.0, zone='us_shared', flags=dict(USC), js='', pref=[],
       steps=[('chk', '門口不是「敲門」（週三晚上）', DOORC, lambda s: isinstance(s, str) and not s.startswith('敲門')), ('usep', '臥室 C'),
              PAUSE(4, '按門以後等 4 秒'), ('chk', '還在 208 的走道', "GAME.G.zone", 'us_shared')],
       want=[], none=[RC['first']]),
  # ⑦ 交往中、週六 21:10（時段過了）：門關著
  dict(id='BEDC_2110', key='2028-09-16', h=21.15, zone='us_shared', flags=dict(USC), js='', pref=[],
       steps=[('chk', '門口不是「敲門」（週六 21:10）', DOORC, lambda s: isinstance(s, str) and not s.startswith('敲門'))],
       want=[]),
]
for _s in R17:
    if SAYH not in _s.get('js', ''): _s['js'] = SAYH + _s.get('js', '')
SCENS = SCENS + R17

# ---------- R18（BB-B 10-24 08:5x）：美國交換那一學期的逐日劇本（LAWWW-B 08:32，QA-TRANSCRIPT-1018 延伸）——不是驗收測試 ----------
# 8/2 21:40 公寓床尾 → 睡覺 → 一路「快轉→到下一個有事的日子」到 12/23（中間有「去上課」就去上課；選項照 pref、手機要回的照 asks）；每個月底存一次劇本（dumplog）。
# 交往中＝us_life_probe 的 USA_dating 設定（DATE）；挽回中＝USB_alone（ALONE）。整理成 md：transcript_md.py。
def TRX(sid, js, pref, asks):
    st = [('bedpick', '睡覺', ['睡覺', '再撐一下'])]
    for k in ['2028-08-31', '2028-09-30', '2028-10-31', '2028-11-30', '2028-12-23']:
        st += [('ffloop', k, 23.9 if k != '2028-12-23' else 12.0, 120), ('dumplog', sid)]
    return dict(id=sid, key='2028-08-02', h=21.67, zone='us_apartment', flags=dict(USF, Y4_PATH='bar'), js=B['USJS'] + js + B['BED'], steps=st, pref=pref, asks=asks, want=[])
R18 = [TRX('TRX_US_DATING', B['DATE'], ['出發', '去', '「好。」'], {'sis0803': '醒了。'}),
       TRX('TRX_US_ALONE', B['ALONE'], ['出發', '去'], {})]
SCENS = SCENS + R18

# ---------- R19（BB-B 10-24 09:5x）：美國法學院圖書館 2F 書庫（b43a86cdf＋AA_444 第 4 節 f23a5b948；v9.10.8 之後那一版）----------
# 一樓樓梯口（stair_rope）在 2F 開的時候變成「上 2F（書庫）」、紅絨繩三個節點藏起來；學姊平日 9:00～10:30 一樓、10:30～12:00 二樓站在東邊走道口（spots.sis 8.45,-0.9）；
# 2F 的「看」：書架一句（rooms_glb3d.js LOOK）、木梯兩句、樓梯（三樓）兩句（us_life_events.js looks.lib2f）；交往中 9:00～11:30 的閒聊 libTalk 在 2F 也有；
# 11:30～12:00 在 1F／2F 跟她說話＝SU-L 階梯，先一句「她把書收進包包……」（X.suLibOpen）。
LB = {'stacks': '（書架很高，最上層要用梯子。整排都是很舊的判例彙編。）',
      'ladder': ['（東邊那一架書靠著一把木梯，踏板磨得發亮。）', '（最上層那一排判例彙編，書背印的年份是一九六〇年代。）'],
      'stair3': ['（往三樓的樓梯口拉著一條紅色絨繩。立牌上只畫了一張卡片和一把鎖。）', '（三樓要刷法學院自己學生的卡。你的卡刷不過。）'],
      'talk': ['（她把螢幕轉過來給你看：第四章，第三節。）「……還差一節。」', '（她小聲）「三明治店十二點人很多。你先去占位子。」', '（她指了一下桌上的紙杯）「圖書館的咖啡機又壞了。這杯是外面買的。」'],
      'suOpen': '（她把書收進包包，跟你走到圖書館外面才開口。）', 'su1': '今天回去清。灰會掉一整片，你會嚇到。'}
LABS = "(GAME.E.interactables||[]).filter(i=>i&&!i.hidden).map(i=>String(i.label||''))"
ROPE = "(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(/^usll_(rope|rope_sign|stanchions)$/.test(o.name)) out.push(o.name+':'+o.visible); }); return out.sort().join(','); })()"
PLAYERAT = "(()=>{ const P=GAME.E.player.obj.position; return [+P.x.toFixed(2),+P.z.toFixed(2)]; })()"
SISPRES = "(()=>{ try{ return JSON.stringify(STORY.presence('heroine_05',GAME.G)).slice(0,160); }catch(e){ return 'ERR '+e; } })()"
UP2 = [('usep', '^上 2F（書庫）'), ('wait', "GAME.G.zone==='us_lawlib_2f'&&!GAME.E.player.busy", 60, '上到 2F 書庫')]
SIS2F = ('chk', '她在 2F 東邊走道口（spots.sis 8.45,-0.9 附近）', SISAT, lambda p: isinstance(p, list) and abs(p[0] - 8.45) < 0.8 and abs(p[1] + 0.9) < 0.8)
R19 = [
  # ① 交往中、週二 10:15 一樓 → 10:40 她上二樓 → 玩家上樓、三個「看」、說話（閒聊）、下樓回一樓樓梯口
  dict(id='LIB2F_WALK', key='2028-09-12', h=10.25, zone='us_lawlib', flags=dict(USC), js='', pref=[],
       steps=[('chk', '一樓樓梯口是「上 2F（書庫）」、沒有「樓梯（樓上書庫）」', LABS, lambda L: isinstance(L, list) and '上 2F（書庫）' in L and '樓梯（樓上書庫）' not in L),
              ('chk', '紅絨繩、小立牌、黃銅柱藏起來（三個節點都是 false）', ROPE, lambda s: isinstance(s, str) and s.count(':false') == 3 and ':true' not in s),
              ('chk', '10:15 她在一樓（3D）', NPCS3D, lambda L: isinstance(L, list) and 'heroine_05' in L),
              ('until', 10.7, 1500),
              ('chk', '10:42 一樓沒有她了', NPCS3D, lambda L: isinstance(L, list) and 'heroine_05' not in L),
              ('chk', 'STORY.presence（記下來）', SISPRES, lambda s: isinstance(s, str)),
              ] + UP2 + [SIS2F, ('shot', 'lib2f_sis', None, 'true', 2),
              ('usep', '^書架'), ('usep', '^木梯'), ('usep', '^樓梯（三樓）'),
              ('chk', '按了「樓梯（三樓）」還在 2F', "GAME.G.zone", 'us_lawlib_2f'),
              ('talk', 'heroine_05'),
              ('usep', '^下樓（一樓）'), ('wait', "GAME.G.zone==='us_lawlib'&&!GAME.E.player.busy", 60, '回到一樓'),
              ('chk', '回到一樓樓梯口（back_spawn 6.4,5.6 附近）', PLAYERAT, lambda p: isinstance(p, list) and abs(p[0] - 6.4) < 1.2 and abs(p[1] - 5.6) < 1.2)],
       want=[LB['stacks']] + LB['ladder'] + LB['stair3'],
       jsok=[('2F 跟她說話有一句閒聊（libTalk 三句之一）', "JSON.stringify((window.__LOG||[]).map(x=>x.t))", lambda s: isinstance(s, str) and any(t in s for t in LB['talk']))]),
  # ② 交往中、週二 11:33：上 2F 跟她說話＝SU-L1（先一句收書的旁白）
  dict(id='LIB2F_SU', key='2028-09-12', h=11.5, zone='us_lawlib', flags=dict(USC), js='', pref=['「我那台也沒清過。」'],
       steps=UP2 + [SIS2F, ('talk', 'heroine_05')],
       want=[LB['suOpen'], LB['su1']], none=LB['talk']),
  # ③ 挽回中（不是交往中）、週二 10:50：她照樣在 2F，說話沒有交往中的閒聊和收書那一句
  dict(id='LIB2F_ALONE', key='2028-09-12', h=10.8, zone='us_lawlib', flags=dict(USC_NO), js=B['ALONE'], pref=[],
       steps=UP2 + [SIS2F, ('talk', 'heroine_05')],
       want=[], none=LB['talk'] + [LB['suOpen']]),
  # ④ 週六 10:50：2F 照樣開（沒有開館時段），她不在書庫
  dict(id='LIB2F_SAT', key='2028-09-16', h=10.8, zone='us_lawlib', flags=dict(USC), js='', pref=[],
       steps=[('chk', '週六一樓樓梯口也是「上 2F（書庫）」', LABS, lambda L: isinstance(L, list) and '上 2F（書庫）' in L)] + UP2 +
             [('chk', '週六 2F 沒有她', SISAT, None), ('usep', '^書架')],
       want=[LB['stacks']]),
]
SCENS = SCENS + R19

# ---------- R20（BB-B 10-24 10:0x）：LAWWW-B 08:16 兩件舊的 BUG（使用者 10-15）——截圖給人看，不是自動判定 ----------
# BUG-03 博雅 101 的同學披頭散髮：大一上週二上午大一國文（博雅 101，9:10～12:10）上課中走進去，近拍坐著的人（完整人物、7 m 內的替身）的頭髮。
# BUG-04 學姊兩個臉（大一上週三晚上、總圖外）：先記她週三 17:00～23:00 的日程，到她在校園的時候近拍；另外數她有幾個人物實體、臉的網格幾個。
SHOTNPC = lambda who, dist=1.2, pitch=0.12: ("(()=>{ const E=GAME.E, P=E.player.obj.position; const ok=n=>n&&n.obj&&n.obj.visible!==false&&!n.hidden; "
    "const L=(E.npcs||[]).filter(n=>ok(n)&&(%s)).sort((a,b)=>Math.hypot(a.obj.position.x-P.x,a.obj.position.z-P.z)-Math.hypot(b.obj.position.x-P.x,b.obj.position.z-P.z)); "
    "const n=L[0]; if(!n) return null; const p=n.obj.position; return " % ("n.charId===%s" % json.dumps(who) if who != 'seated' else "!!n.seat") + (R7_SHOTAT % "{x:p.x,z:p.z,face:true,dist:%s,pitch:%s}" % (dist, pitch)) + "; })()")
FIGNEAR = "(()=>{ const E=GAME.E, P=E.player.obj.position; let n=0, near=null; E.scene.traverse(o=>{ if(o.isInstancedMesh&&/seated|fig/i.test(o.name||(o.parent&&o.parent.name)||'')) n++; }); return {instancedFig:n}; })()"
SIS_COUNT = "(()=>{ const L=(GAME.E.npcs||[]).filter(n=>n&&n.charId==='heroine_05'); return L.map(n=>{ let faces=0, meshes=0; n.obj.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ meshes++; if(/face/i.test(o.name||'')) faces++; } }); return {vis:n.obj.visible!==false&&!n.hidden, faces, meshes, at:[+n.obj.position.x.toFixed(1),+n.obj.position.z.toFixed(1)]}; }); })()"
SIS_WED = """(()=>{ const G=GAME.G, c=CHARACTERS.heroine_05, out=[]; for(let h=17; h<=23; h+=0.5){ const g=Object.assign({},G,{hour:h}); let e=null; try{ e=STORY.schedEnt(c,g); }catch(x){ e={err:String(x)}; } out.push(h+':'+(e?((e.zone||'')+'/'+(e.act||'')+(e.away?'/'+e.away:'')):'-')); } return out; })()"""
def BUG04_AT(h): return [('until', h, 900), ('chk', '%.1f 學姊人物實體＋臉網格（記下來）' % h, SIS_COUNT, lambda L: isinstance(L, list)),
                         ('jsrun', SHOTNPC('heroine_05', 1.0, 0.1), '%.1f 主角站到學姊前面 1 m、鏡頭對她的臉' % h), ('shot', 'bug04_%02d' % int(h * 10), None, 'true', 2)]
R20 = [
  dict(id='BUG03_BOYA', key='TERMDAY:Y1S1:3:2', h=9.2, zone='campus', flags={}, js='', pref=[],
       steps=[ENTER('boya', note='（大一國文上課中）'), ('wait', "GAME.G.zone==='boya'&&!GAME.E.player.busy", 60, '進到博雅'), ('until', 9.6, 600),
              ('chk', '坐著的人（完整人物）', "(GAME.E.npcs||[]).filter(n=>n&&n.seat&&n.obj&&n.obj.visible!==false).map(n=>n.charId||n.id).slice(0,30)", lambda L: isinstance(L, list)),
              ('chk', '替身', FIGNEAR, lambda d: isinstance(d, dict)),
              ('shot', 'bug03_room', None, 'true', 2),
              ('jsrun', SHOTNPC('seated', 1.1, 0.15), '主角站到最近一個坐著的人前面、鏡頭對頭髮'), ('shot', 'bug03_near', None, 'true', 2),
              ('jsrun', SHOTNPC('seated', 0.8, 0.45), '同一個人，從上面一點拍頭頂'), ('shot', 'bug03_top', None, 'true', 2)],
       want=[]),
  dict(id='BUG04_SIS_WED', key='TERMDAY:Y1S1:5:3', h=17.0, zone='campus', flags={}, js='', pref=[],
       steps=[('chk', '學姊週三 17:00～23:00 的日程（STORY.schedEnt）', SIS_WED, lambda L: isinstance(L, list))] + BUG04_AT(18.5) + BUG04_AT(20.0) + BUG04_AT(21.5),
       want=[]),
]
SCENS = SCENS + R20
# BB-B 10-23 19:1x：芷若送機（ZR43_*，第 43 項）在 375e90903 那次全部「等不到 21.30」：她 21:00 才私訊（zr_sendoff3d.js S.phone），讀檔 20:30，
# 負載 25 時 420 秒走不到半小時。SEEN、GF、LATE、DECL 沒回到訊息或沒走到出發＝腳本 FAIL。改：讀檔 20:54、等訊息最多 1500 秒；送機那天等到 10:36 最多 2400 秒；
# LATE、DECL 起床以後【捷徑】撥到 09:33（過了 08:30＋1 小時＝沒來；09:40 那一則照遊戲自己發），再等到 09:48
for _s in SCENS:
    if _s['id'].startswith('ZR43_'):
        _s['h'] = 20.9
        _st = []
        for st in _s['steps']:
            if st == ('until', 21.3): _st.append(('until', 21.3, 1500))
            elif st == ('until', 21.4): _st.append(('until', 21.4, 1500))
            elif st == ('until', 10.6, 1200): _st.append(('until', 10.6, 2400))
            elif st == ('until', 9.8, 1200): _st += [('jump', "STORY.dayOfKey('2027-09-02')", 9.55, '9/2 起床以後撥到 09:33（機器負載高，07:30→09:40 照真實時間要一小時以上）'), ('until', 9.8, 1500)]
            elif st == ('bedpick', '睡到明天早上'): _st.append(('jump', "STORY.dayOfKey('2027-09-02')", 7.0, '睡過一晚＝直接撥到 9/2 07:00（這個情境測送機，不測睡覺）'))
            else: _st.append(st)
        _s['steps'] = _st
        # BB-B 21:0x：zr43r 第二次：SEEN 走到床邊點到「看房間裡的東西」、LATE 床的選單是空的、DECL 那天其實住臺北的家（9/5 才入住大三宿舍，床是家裡的選單），
        #   bedpick 沒睡成、LATE／DECL 的 jump 又用 GAME.G.day＝撥回 9/1 早上。改成 9/2 直接指定日子、睡覺用【捷徑】撥過去。
        #   GF：整段演完了但 ZR_SENDOFF_2027 是 null（after 才設 met）——加查事件有沒有中途出錯（EVENTS.failed）、done 次數，分清楚是遊戲還是檢查
        _s.setdefault('jsok', []).extend([('送機事件沒有中途出錯（EVENTS.failed）', "!!(EVENTS.failed&&EVENTS.failed['ev_zr_sendoff_2027'])", False),
                                          ('送機事件 done 次數', "((GAME.G.events||{}).done||{})['ev_zr_sendoff_2027']|0", (lambda n: n >= 1) if _s['id'] in ('ZR43_SEEN', 'ZR43_GF') else 0)])
# BB-B 10-23 18:3x：可昕的「帶一杯」（FOOD51_KX_*）買完飲料 16:40，學期末約會 18:00 出發。負載 25 時遊戲時間 420 秒只走 0.2 小時（f51dr2：「等不到 19.00」，
# 約會根本沒開始，她的反應句當然沒有）→ 買完以後【捷徑】撥到 17:55（出發前 5 分鐘，那一杯已經記在 FAV.rec），再照走到 19:00、最多等 1500 秒
for _s in SCENS:
    if _s['id'].startswith('FOOD51_KX_') and _s['id'] != 'FOOD51_KX_NOTRIP':
        _s['steps'] = [x for st in _s['steps'] for x in ([('jump', 'GAME.G.day', 17.92, '約會出發前（飲料已經買好；機器負載高，16:40→18:00 照真實時間要一小時以上）'), ('until', 19.0, 1500)] if st == ('until', 19.0) else [st])]
MEET = """(([id,a,b])=>{ const G=GAME.G, c=(typeof CHARACTERS!=='undefined'?CHARACTERS:{})[id]; if(!c||!STORY.schedEnt) return null; const K=k=>typeof k==='string'&&k[0]==='+'?G.day+(+k.slice(1)):STORY.dayOfKey(k); const A=K(a), Bd=K(b);
  for(let d=A; d<=Bd; d++){ const w=CALENDAR.dateOf(d).wd%7; for(let h=9; h<=21; h+=0.5){ const g=Object.assign({},G,{day:d,hour:h,weekday:w}); let e=null;
    try{ const p=STORY.presence?STORY.presence(id,g):null; if(p&&p.here===false) continue; e=STORY.schedEnt(c,g); }catch(x){ e=null; }
    if(e&&e.zone&&e.act!=='class'&&!/^(us_|jp_)/.test(e.zone)) return {day:d,h:h+0.1,zone:e.zone,act:e.act||'',key:CALENDAR.dateOf(d).key}; } } return null; })(%s)"""
NOTHREE = r"""((ban)=>{ const RE=/[一兩二三四]件事|第三件|第三格|第三點/, HEAD=/^[「（(]?[一二三]，/, O=window.__OLDM||new WeakSet(), out=[];
  const her=n=>/學姊|書瑀/.test(n||'');
  for(const x of (window.__LOG||[])){ const t=String(x.t||''); if((her(x.n)||!x.n)&&(RE.test(t)||HEAD.test(t))) out.push((x.n||'旁白')+'：'+t); for(const b of ban) if(t.includes(b)) out.push('［玩笑］'+(x.n||'')+'：'+t); }
  for(const m of (GAME.G.msgs||[])){ if(O.has(m)) continue; const t=String(m.text||''); const mine=m.from==='heroine_05'||(String(m.th||'')==='p:heroine_05'&&!m.from);
    if(mine&&(RE.test(t)||HEAD.test(t))) out.push('訊息 '+(m.from||'')+'：'+t); for(const b of ban) if(t.includes(b)) out.push('［玩笑］訊息 '+(m.from||'')+'：'+t); }
  return out; })"""

async def talkp(pg, cdp, run, who, pref):
    """同 us_life_probe 的 talk（走到那個人旁邊、按「和○○說話」），選項先照情境的 pref、再「聊／說」"""
    p = await pg.evaluate("(id=>{ const n=GAME.E.npcs.find(n=>n&&n.charId===id&&n.obj&&n.obj.visible!==false&&!n.hidden); return n?[n.obj.position.x,n.obj.position.z]:null; })(%s)" % json.dumps(who))
    if not p: say('   ⚠ 這裡沒有 %s' % who); bad.append('找不到 %s（不在這個區域）' % who); return False
    if not await L.go_to(pg, cdp, run, p[0], p[1], 1.4, who, max_s=120): say('   ⚠ 走不到 %s' % who); bad.append('走不到 %s' % who); return False
    lab = ''
    for k in range(25):   # 同 usep：互動鈕要等下一格（負載 25 時 3 秒以上）
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if '說話' in lab: break
        await pg.wait_for_timeout(800)
    say('   互動鈕：%s' % lab); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    await B['drain'](pg, cdp, pref=list(pref or []) + ['聊', '說'], secs=150); return True
async def usep(pg, cdp, run, pat, pref):
    """同 us_life_probe 的 use（走到最近、名字符合 pat 的互動點按下去），選項照情境的 pref"""
    it = await pg.evaluate("(p=>{ const R=new RegExp(p), P=GAME.E.player.obj.position; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden&&R.test(i.label||'')); its.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=its[0]; return i?[i.x,i.z,i.label]:null; })(%s)" % json.dumps(pat))
    if not it: say('   ⚠ 找不到互動點 /%s/' % pat); bad.append('找不到互動點 /%s/' % pat); return False
    if not await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=150): say('   ⚠ 走不到 %s' % it[2]); bad.append('走不到 %s' % it[2]); return False
    lab = ''; cs = []
    for att in range(3):   # BB-B 10-23 19:1x：機器很慢的時候（f51dr3 後段每秒 0.1 格）按鈕 20 秒還沒出來、按了選單 37 秒沒出來（KX_MELON、KX_NOTRIP）＝最多試三次
        for k in range(40):   # 互動鈕下一格才出來（負載 25 時一格 3～10 秒）
            lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
            if lab: break
            await pg.wait_for_timeout(800)
        say('   互動：%s（按鈕「%s」%s）' % (it[2], lab, '' if att == 0 else '，第 %d 次' % (att + 1)))
        if not lab: continue
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
        got = False
        for k in range(30):   # 按下去以後選單也要等
            cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
            s_ = await L.state(pg)
            if cs or s_['dlg']: got = True; break
            await pg.wait_for_timeout(1500)
        if got: break
    say('   選單：%s' % ' / '.join(c[:24] for c in cs))
    await B['drain'](pg, cdp, pref=list(pref or []), secs=240); return True

def in_order(T, exp):
    i = 0
    for e in exp:
        while i < len(T) and T[i] != e: i += 1
        if i >= len(T): return e
        i += 1
    return None

async def main():
    run = L.Run('zrlast', OUT); base = json.load(open(SAVE, encoding='utf-8')); sha = os.environ.get('SHA', '?')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); B['cdp_g'][0] = cdp
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for sc in SCENS:
            if SCEN and sc['id'] not in SCEN: continue
            say('== %s（%s）' % (sc['id'], sha)); t0 = time.time(); n0 = len(bad)
            B['MID'].update({'n': 0, 'run': run, 'keys': [w[:8] for w in sc.get('want', [])], 'id': sc['id']})
            try:
                if sc.get('minimal'): await load_min(pg, sc, run)
                else: await B['load_at'](pg, base, sc, run)
                await pg.evaluate(BGHOOK); await pg.evaluate("window.__OLDM=new WeakSet(GAME.G.msgs||[])")   # 讀檔前就有的訊息（nothree 只查之後的）
                cond = await pg.evaluate("(()=>{ try{ return ZRLAST.cond(GAME.G,true); }catch(e){ return 'ERR '+e; } })()")
                say('   【讀資料】讀檔後 ZRLAST.cond：%s' % json.dumps(cond, ensure_ascii=False))
                for st in sc['steps']:
                    if st[0] == 'until': await B['play_until'](pg, cdp, run, st[1], sc, *(st[2:3]))   # ('until', h[, 最多等幾秒])
                    elif st[0] == 'ffloop': await B['ffloop'](pg, cdp, run, sc, st[1], st[2], *(st[3:4]))   # ('ffloop', key, h[, 最多快轉幾次])
                    elif st[0] == 'dumplog':   # R18（QA-TRANSCRIPT）：把到現在為止畫面上的每一句（__LOG）＋手機訊息（G.msgs）存成 OUT/<st[1]>.json，給 transcript_md 整理
                        J = await pg.evaluate("JSON.stringify({log:window.__LOG||[], msgs:(GAME.G.msgs||[]).map(m=>({th:m.th||'',from:m.from||'',name:m.name||'',text:String(m.text||''),day:m.day,key:(m.day!=null?CALENDAR.dateOf(m.day).key:''),h:m.h,ask:!!m.ask})), at:{d:CALENDAR.dateOf(GAME.G.day).key,h:GAME.G.hour}})")
                        open(os.path.join(OUT, st[1] + '.json'), 'w', encoding='utf-8').write(J); say('   存劇本：%s（%d 字）' % (st[1], len(J)))
                    elif st[0] == 'use': await B['use'](pg, cdp, run, st[1])
                    elif st[0] == 'bedpick': await B['bedpick'](pg, cdp, run, st[1], sc, st[2] if len(st) > 2 else None)
                    elif st[0] == 'bedfirst':   # 床的選單第一項要是 st[1]，按它
                        await pg.wait_for_timeout(2500); await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
                        cs = await B['bed_menu'](pg, cdp, run)
                        if not cs or not cs[0].startswith(st[1]): bad.append('%s：床的選單第一項應該是「%s」（實際 %s）' % (sc['id'], st[1], cs))
                        t = await B['tap_start'](pg, cdp, st[1])
                        if t: say('   ▶ 床：%s' % t[:30]); await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=240)
                        else: bad.append('%s：床的選單沒有「%s」' % (sc['id'], st[1]))
                    elif st[0] == 'at':   # 現在要是 st[1] st[2]（±st[3] 小時）
                        sn = await pg.evaluate(SNAP)
                        if sn['key'] != st[1] or abs(sn['h'] - st[2]) > st[3]: bad.append('%s：這時候應該是 %s %.2f（實際 %s %.2f）' % (sc['id'], st[1], st[2], sn['key'], sn['h']))
                    elif st[0] == 'stopchk': B['check_stops'](sc, st[1])
                    elif st[0] == 'stopchk_book':   # B9_BOOK_525：第一次說話（那天已經演過別的說話前接演）不應該是「帶哪一本」；記下以後把台詞紀錄清掉，第二次再看
                        L0 = await pg.evaluate("(window.__LOG||[]).map(x=>x.t)")
                        if any(BOOK0[2] in t for t in L0): bad.append('%s：5/18 那天已經演過別的說話前接演，卻又演了「帶哪一本」' % sc['id'])
                        say('   第一次說話：%s' % ('沒有「帶哪一本」（對）' if not any(BOOK0[2] in t for t in L0) else '演了「帶哪一本」（不對）')); await pg.evaluate("window.__LOG=[]")
                    elif st[0] == 'sendchat': await sendchat(pg, st[1], st[2], sc)
                    elif st[0] == 'addday':   # [捷徑] 日子往後撥 st[1] 天（同一個時間、同一個地方）
                        await pg.evaluate("(n=>{ const G=GAME.G; G.day+=n; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); })(%d)" % st[1])
                        run.setup('[捷徑] %s：日子往後撥 %d 天' % (sc['id'], st[1])); await pg.wait_for_timeout(1500)
                    elif st[0] == 'talk': await talkp(pg, cdp, run, st[1], sc.get('pref', []))   # 走到那個人旁邊、按「和○○說話」（BB-B 10-23：選項照情境的 pref，原本 B['talk'] 只選「聊／說」）
                    elif st[0] == 'usep': await usep(pg, cdp, run, st[1], sc.get('pref', []))   # 同 use（走到互動點按下去），選項照情境的 pref（房間「看看房間裡的東西」的選單）
                    elif st[0] == 'jsrun':   # [捷徑] 在頁面裡直接叫一段遊戲函式（st[2] 是說明），演完照 pref 選
                        run.setup('[捷徑] %s：直接叫 %s' % (sc['id'], st[2])); ok = await pg.evaluate(st[1]); await pg.wait_for_timeout(2000)
                        if ok is False: bad.append('%s：%s 沒有開始' % (sc['id'], st[2]))
                        await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=300)
                    elif st[0] == 'jump':   # [捷徑] 日子撥到 st[1]（頁面裡算出來的日子編號）、時間 st[2]（st[3] 說明）
                        d = await pg.evaluate(st[1])
                        if d is None: bad.append('%s：%s：頁面裡算不出日子（%s）' % (sc['id'], st[3], st[1][:120]))
                        else:
                            k = await pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); return CALENDAR.dateOf(d).key; })(%s)" % json.dumps([d, st[2]]))
                            run.setup('[捷徑] %s：日子撥到 %s %.2f（%s）' % (sc['id'], k, st[2], st[3])); await pg.wait_for_timeout(2500); await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
                    elif st[0] == 'meet':   # [前置／捷徑] 照作息表（STORY.schedEnt）找 st[1] 在 st[2]～st[3]（'+N'＝今天往後 N 天）第一個在遊戲場景裡、不是上課的時間，日子時間撥過去、直接進那一區（GAME.enter）
                        m = await pg.evaluate(MEET % json.dumps([st[1], st[2], st[3]]))
                        if not m: bad.append('%s：%s 在 %s～%s 找不到作息格（不在場景裡）' % (sc['id'], st[1], st[2], st[3]))
                        else:
                            await pg.evaluate("(([d,h])=>{ const G=GAME.G; G.day=d; G.hour=h; if(GAME.E) GAME.E.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % json.dumps([m['day'], m['h']]))
                            z = await pg.evaluate("(async z=>{ try{ if(GAME.G.zone!==z) await GAME.enter(z); }catch(e){ return 'ERR '+e; } return GAME.G.zone; })(%s)" % json.dumps(m['zone']))
                            run.setup('[前置／捷徑] %s：%s 的作息 %s %.2f 在 %s（%s）→ 日子撥過去、直接進 %s' % (sc['id'], st[1], m['key'], m['h'], m['zone'], m['act'], z))
                            await pg.wait_for_timeout(5000); await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=90)
                    elif st[0] == 'ffout':   # 快轉到出遊 st[1]（OUT id）那一天：當天就時間照走、等「出發」（不在出遊那一刻再快轉，見 S3_LAKE）；演完／錯過就停
                        for i in range(st[2] if len(st) > 2 else 25):
                            q = await pg.evaluate("(id=>{ const q=typeof OUT!=='undefined'?OUT.get(GAME.G,id):null; return q?{day:q.day,h:q.h,state:q.state,key:CALENDAR.dateOf(q.day).key,now:GAME.G.day}:null; })(%s)" % json.dumps(st[1]))
                            if q and q['state'] != 'planned': say('   出遊 %s：%s %s %s' % (st[1], q['key'], q['h'], q['state'])); break
                            if q and q['day'] == q['now']: await B['play_until'](pg, cdp, run, q['h'] + 0.8, sc); continue
                            await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=60)
                            if not await B['ff_once'](pg, cdp, run, sc): break
                        else: bad.append('%s：快轉 %d 次還沒等到出遊 %s' % (sc['id'], st[2] if len(st) > 2 else 25, st[1]))
                    elif st[0] == 'runev':   # [捷徑] 直接開演 st[1]（manual 事件；前置照情境）
                        run.setup('[捷徑] %s：直接開演 %s（EVENTS.run）' % (sc['id'], st[1]))
                        ok = await pg.evaluate("(id=>{ const ev=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).find(e=>e.id===id); if(!ev) return false; void EVENTS.run(ev); return true; })(%s)" % json.dumps(st[1])); await pg.wait_for_timeout(2000)
                        if not ok: bad.append('%s：STORY_EVENTS 沒有 %s' % (sc['id'], st[1]))
                        await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=300)
                    elif st[0] == 'person':   # 手機 →「朋友」→ 那個人的頁面：記下畫面上的字（人物頁的記憶名稱）
                        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1000)
                        c = await pg.evaluate("(id=>{ const e=[...document.querySelectorAll('#phoneBody [data-person]')].find(b=>b.dataset.person===id); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(st[1]))
                        if not c: bad.append('%s：手機「朋友」沒有 %s' % (sc['id'], st[1]))
                        else:
                            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
                            sc['_person'] = await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); return b?b.innerText:''; })()")
                            say('   人物頁：%s' % sc['_person'].replace('\n', '｜')[:500]); await run.shot(pg, 'person_%s' % sc['id'])
                        if await B['phone_open'](pg): await B['close_phone'](pg)
                    elif st[0] == 'phoneinv':   # R9（第 72 項）：手機「朋友」→ st[1] 那個人的「約」（INV.flow，手機那條）→ 選項照 st[2] → 她的回覆記在 sc['_inv'][st[3]]
                        n0 = len(await pg.evaluate("window.__LOG||[]"))
                        await pg.evaluate("(()=>{ const p=document.getElementById('phone'); if(!(p&&!p.classList.contains('hide'))){ const b=document.getElementById('btnPhone'); if(b) b.click(); } })()"); await pg.wait_for_timeout(1500)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"friends\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1500)
                        c = await pg.evaluate("(id=>{ const e=document.querySelector('#phoneBody [data-inv=\"'+id+'\"]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps(st[1]))
                        if not c:
                            bad.append('%s：手機「朋友」沒有 %s 的「約」' % (sc['id'], st[1])); await run.shot(pg, 'noinv_%s' % sc['id'])
                            if await B['phone_open'](pg): await B['close_phone'](pg)
                        else:
                            await L.touch_tap(cdp, c[0], c[1])
                            for k in range(40):
                                s_ = await L.state(pg)
                                if s_['choices'] or s_['dlg']: break
                                await pg.wait_for_timeout(1500)
                            await B['drain'](pg, cdp, pref=list(st[2]) + ['算了'], secs=240)
                            if await B['phone_open'](pg): await B['close_phone'](pg)
                            lg = (await pg.evaluate("window.__LOG||[]"))[n0:]
                            sc.setdefault('_inv', {})[st[3]] = [x['t'] for x in lg if str(x.get('n', '')).endswith('（手機）')]
                            sc.setdefault('_invn', {})[st[3]] = [x['t'] for x in lg if not x.get('n') and not str(x.get('t', '')).startswith(('CHOICE:', 'TOAST', 'BG:', 'CARD'))]
                            say('   手機約 %s（%s）→ 回覆 %s；旁白 %s' % (st[1], st[3], json.dumps(sc['_inv'][st[3]], ensure_ascii=False)[:200], json.dumps(sc['_invn'][st[3]], ensure_ascii=False)[:160]))
                    elif st[0] == 'invchk':   # R9（第 72 項）：('invchk', 人, [標記…], {distinct, tag, sub, nosub, narr})＝回覆在 AA_415 的表上、照條件
                        rows = await pg.evaluate("(id=>(typeof INVITE_REPLIES!=='undefined'&&INVITE_REPLIES.people[id]||[]).map(r=>({id:r.id,k:r.k,tags:r.tags||[],cond:r.cond,lines:(r.lines||[]).filter(x=>typeof x==='string')})))(%s)" % json.dumps(st[1]))
                        nrm = lambda t: ''.join(ch for ch in str(t) if ch not in '「」 \u3000\n')
                        tbl = {}
                        for r_ in rows:
                            for l_ in r_['lines']: tbl.setdefault(nrm(l_), []).append(r_)
                        opt = st[3] if len(st) > 3 else {}; got = [(t, (sc.get('_inv') or {}).get(t)) for t in st[2]]; probs = []
                        for t, rep in got:
                            if not rep: probs.append('%s 沒有回覆' % t); continue
                            hit = [tbl[nrm(l_)] for l_ in rep if nrm(l_) in tbl]
                            if not hit: probs.append('%s 的回覆不在 AA_415 表上：%s' % (t, json.dumps(rep, ensure_ascii=False)[:120]))
                            if opt.get('tag') and not any(opt['tag'] in r_['tags'] for h_ in hit for r_ in h_): probs.append('%s 不是「%s」那一列：%s' % (t, opt['tag'], json.dumps(rep, ensure_ascii=False)[:120]))
                            if opt.get('sub') and not any(opt['sub'] in l_ for l_ in rep): probs.append('%s 沒有「%s」：%s' % (t, opt['sub'], json.dumps(rep, ensure_ascii=False)[:120]))
                            if opt.get('nosub') and any(opt['nosub'] in l_ for l_ in rep): probs.append('%s 不該有「%s」：%s' % (t, opt['nosub'], json.dumps(rep, ensure_ascii=False)[:120]))
                            if opt.get('narr') and not (sc.get('_invn') or {}).get(t): probs.append('%s 沒有系統旁白' % t)
                        if opt.get('distinct'):
                            for (a, ra), (b_, rb) in zip(got, got[1:]):
                                if ra and rb and [nrm(x) for x in ra] == [nrm(x) for x in rb]: probs.append('%s、%s 連續兩次同一句：%s' % (a, b_, json.dumps(ra, ensure_ascii=False)[:80]))
                        say('   【讀資料】%s 回覆 %s → %s' % (st[1], json.dumps([g[1] for g in got], ensure_ascii=False)[:400], 'OK' if not probs else 'NG ' + '；'.join(probs)))
                        for q in probs: bad.append('%s：%s' % (sc['id'], q))
                    elif st[0] == 'phonego':   # 手機「今天」→「今天約好的」那一筆「前往」
                        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1000)
                        c = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-invgo]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim(),(e.closest('.phrow')||e.parentElement).innerText]; })()")
                        await run.shot(pg, 'phonego_%s' % sc['id'])
                        if not c: bad.append('%s：手機「今天約好的」沒有「前往」' % sc['id'])
                        else:
                            say('   手機「今天約好的」：%s →「%s」' % (c[3].replace('\n', '｜')[:80], c[2])); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(4000)
                            await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
                    elif st[0] == 'shot':   # R7：('shot', 名稱, 目標, 等待條件 js, 秒)＝等條件 →【捷徑】主角放到目標旁邊、鏡頭轉過去 → 藏 HUD 和主角截圖 → 還原
                        if len(st) > 3 and st[3]:
                            for _ in range(int(st[4] if len(st) > 4 else 30)):
                                if await pg.evaluate(st[3]): break
                                await pg.wait_for_timeout(1000)
                            else: say('   ⚠ 截圖前等不到條件：%s' % st[3][:100])
                        if st[2]:
                            run.setup('[捷徑] %s：截圖「%s」——主角放到目標旁邊、鏡頭轉過去（藏 HUD 和主角）' % (sc['id'], st[1]))
                            say('   鏡頭：%s' % json.dumps(await pg.evaluate(R7_SHOTAT % json.dumps(st[2], ensure_ascii=False)), ensure_ascii=False))
                        await pg.evaluate(R7_HIDE + '(true)'); await pg.wait_for_timeout(3000)
                        say('   截圖：%s' % await run.shot(pg, '%s_%s' % (sc['id'], st[1]))); await pg.evaluate(R7_HIDE + '(false)'); await pg.wait_for_timeout(500)
                    elif st[0] == 'chk':   # R7：('chk', 說明, js, 期望值或 lambda)＝中途【讀資料】
                        got = await pg.evaluate(st[2]); ok = st[3](got) if callable(st[3]) else got == st[3]
                        say('   【讀資料・中途】%s：%s → %s' % (st[1], json.dumps(got, ensure_ascii=False)[:400], 'OK' if ok else 'NG'))
                        if not ok: bad.append('%s：%s（實際 %s）' % (sc['id'], st[1], json.dumps(got, ensure_ascii=False)[:300]))
                    elif st[0] == 'wait':   # R7：('wait', js, 秒, 說明)＝等到成立；等不到記一個問題
                        ok = False
                        for _ in range(int(st[2])):
                            if await pg.evaluate(st[1]): ok = True; break
                            await pg.wait_for_timeout(1000)
                        say('   等：%s → %s' % (st[3], 'OK' if ok else '等不到'))
                        if not ok: bad.append('%s：等不到「%s」' % (sc['id'], st[3]))
                    elif st[0] == 'pref':   # R7：之後的選單換一組偏好
                        sc['pref'] = list(st[1]); say('   選項偏好改成：%s' % ' / '.join(st[1]))
                    elif st[0] == 'mark':   # R7：記下現在的台詞位置、熟悉、錢（不改遊戲）
                        await pg.evaluate("(()=>{ %s })()" % st[1])
                    sn = await pg.evaluate(SNAP); say('   %s → 現在 %s %.2f %s' % (st, sn['key'], sn['h'], sn['zone']))
                await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
                if sc.get('wantZone'):
                    z = await pg.evaluate("GAME.G.zone"); say('   最後在：%s' % z)
                    if z != sc['wantZone']: bad.append('%s：最後在 %s（應該 %s）' % (sc['id'], z, sc['wantZone']))
                await B['verify'](pg, run, sc)
                lines = (await pg.evaluate("(window.__LOG||[]).map(x=>x.t)"))
                if sc.get('order'):
                    miss = in_order(lines, sc['order'])
                    say('   依序（AA_387 第 3、4 節）：%s' % ('OK' if miss is None else '缺或順序不對：「%s」' % miss))
                    if miss is not None: bad.append('%s：第 3、4 節依序缺「%s」' % (sc['id'], miss))
                for pid, want in sc.get('replyAll', {}).items():
                    n0 = (sc.get('_sent') or {}).get(pid)
                    rep = await pg.evaluate("((a)=>(GAME.G.msgs||[]).slice(a[1]).filter(m=>m.from===a[0]).map(m=>String(m.text||'')))(%s)" % json.dumps([pid, n0 or 0]))
                    if rep[:len(want)] != want: bad.append('%s：%s 回的應該是 %s（實際 %s）' % (sc['id'], pid, want, rep[:5]))
                    for w in sc.get('replyNone', {}).get(pid, []):
                        if any(w in x for x in rep) or any(w in x for x in (sc.get('_choices_after_send') or [])): bad.append('%s：%s 回的／選項不應該有「%s」' % (sc['id'], pid, w))
                if sc.get('obs'):
                    n0 = (sc.get('_sent') or {}).get('kexin', 0)
                    rep = await pg.evaluate("((a)=>(GAME.G.msgs||[]).slice(a[1]).map(m=>(m.from||'')+'：'+String(m.text||'')+(m.ask?'［選項 '+m.ask.opts.map(o=>o.t).join('／')+'］':'')))(%s)" % json.dumps(['kexin', n0]))
                    say('   【對照，只記錄】傳完以後的訊息：%s｜選項：%s' % (json.dumps(rep[:6], ensure_ascii=False), sc.get('_choices_after_send')))
                for lab, js, want in sc.get('jsok', []):
                    got = await pg.evaluate(js); ok = want(got) if callable(want) else got == want
                    say('   【讀資料】%s：%s → %s' % (lab, json.dumps(got, ensure_ascii=False), 'OK' if ok else 'NG'))
                    if not ok: bad.append('%s：%s（實際 %s）' % (sc['id'], lab, json.dumps(got, ensure_ascii=False)))
                if sc.get('nothree'):
                    hit = await pg.evaluate(NOTHREE + "(%s)" % json.dumps(BAN3, ensure_ascii=False))
                    say('   學姊不數件數（AA_398）：%s' % ('OK' if not hit else json.dumps(hit, ensure_ascii=False)[:600]))
                    for x in hit: bad.append('%s：學姊又數件數／拿這個開玩笑（要人工看是不是自然說法）：%s' % (sc['id'], x[:120]))
                if 'personHas' in sc or 'personNone' in sc:
                    P = sc.get('_person') or ''
                    for w in sc.get('personHas', []):
                        if w not in P: bad.append('%s：人物頁應該有「%s」，沒有' % (sc['id'], w))
                    for w in sc.get('personNone', []):
                        if w in P: bad.append('%s：人物頁不應該有「%s」' % (sc['id'], w))
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('[%s] %s（這一段新增問題 %d 項，%.0f 秒）' % ('PASS' if len(bad) == n0 else 'FAIL', sc['id'], len(bad) - n0, time.time() - t0))
            json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'zrlast.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('ZRLAST：芷若出國前的最後一場（AA_387 第 9 節）', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
