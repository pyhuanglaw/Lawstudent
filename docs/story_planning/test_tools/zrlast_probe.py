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
  dict(id='QX28_US', key='2028-08-25', h=16.8, zone='us_apartment', flags=dict(USF, USL_JETLAG=True), js=B['USJS'] + Y4 + B['DATE'] + SIS_D + R0 + B['PLAT'],
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
          steps=[('until', 23.0), ('bedpick', '睡到明天早上'), ('until', 11.3)], pref=['出發：接機', '「先回家睡覺。」'],
          want=['美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。', '我想吃滷肉飯。現在。', '……好。明天。明天一定。'] + w,
          none=['三件事。一，美國的雞蛋', '學姊妳終於講超過三句了！', '……四，我想你。'] + nw, wantMsg=['滷肉飯。今天。不要再說明天。'], noneMsg=['滷肉飯。今天。這不是三件事。'],
          nothree=True, cflags=['SIS_PICKUP', 'SIS_PICKUP_TMR'], eqflags={'SIS_PICKUP_TMR': True})
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
  dict(id='B6_V', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + GF729, steps=[('until', 10.7), ('ffloop', '2028-08-20', 10.7), ('ffloop', '2028-09-03', 10.7)],
       pref=['接起來：和書瑀視訊', '「給我看。」', '「那是好問題的意思嗎？」'], want=V1 + ['三本是今天借的。', VNARR, V2], none=['你在忙。下週。'], nothree=True, jsok=[('交往版視訊的排程（y4_sa_g_*）', GFQ, lambda x: isinstance(x, list) and len(x) >= 3)]),
  # 2. 第 1 節：沒接——8/13、8/20 都不接 →「你在忙。下週。」兩次；8/27 她不打「這週我先不打了。你有空打給我。」；9/3 照常排
  dict(id='B6_VMISS', key='2028-08-13', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + GF729, steps=[('until', 11.2), ('ffloop', '2028-08-20', 11.2), ('ffloop', '2028-08-27', 11.2), ('ffloop', '2028-09-03', 10.2)],
       pref=['先不接', '今天先不要', '不接'], wantMsg=['你在忙。下週。', '這週我先不打了。你有空打給我。'], countMsg={'你在忙。下週。': 2}, none=V1, nothree=True,
       jsok=[('9/3 照常排視訊', GFQ, lambda x: isinstance(x, list) and any(e.startswith('2028-09-03') for e in x)), ('8/27 沒有排視訊', GFQ, lambda x: isinstance(x, list) and not any(e.startswith('2028-08-27') for e in x))]),
  # 3. 第 1 節：大峽谷才交往（10/13；[前置] 讀檔就是交往中＋SIS_GF_CANYON）——10/22 從 V1 開始；中秋那組（V3）不演：10/29 V2、11/5 V4
  dict(id='B6_VCANYON', key='2028-10-22', h=9.8, zone='dorm', flags=dict(TWF), js=Y4 + CANYON, steps=[('until', 10.7), ('ffloop', '2028-10-29', 10.7), ('ffloop', '2028-11-05', 10.7)],
       pref=['接起來：和書瑀視訊', '「給我看。」', '「那是好問題的意思嗎？」', '「我也是。」'], want=V1 + [V2, V4], none=[V3], nothree=True, jsok=[('視訊排程', GFQ, lambda x: isinstance(x, list))]),
  # 4. 第 2 節：送機（期末聚餐說了「那天我去送學姊。」＝HOOK_SIS_SENDOFF）：7/26 21:05 私訊＋選項；群組那則沒有 Kevin 的「我送妳。我有車。」
] + [dict(id='B6_SEND_' + k, key='2028-07-26', h=20.9, zone='dorm', flags=dict(TWF, HOOK_SIS_SENDOFF=True, **({'SAID_HAS_CAR': True} if car else {})), js=Y4 + (SIS_D if k == 'AIR_D' else SISF),
          asks={'y4_sis_hook_dm': t}, steps=[('until', 21.4)] + ([('ffloop', '2028-08-02', 11.5)] if k != 'CAR' else []), pref=['出發：到機場送學姊', '出發：載學姊去機場'],
          wantMsg=['八月二號早上八點，我家樓下。', '你說要送我。'] + wm, want=w, none=nw, nothree=True,
          jsok=[('私訊的選項', HOOKDM, opts), ('群組沒有 Kevin 的「我送妳。我有車。」按鈕', KEVBTN, False)] + jk, cflags=['SIS_RIDE_ASK', 'SIS_SENDOFF'], eqflags=ef)
     for k, car, t, opts, wm, w, nw, jk, ef in [
       ('CAR', True, '我開車去載妳', ['我開車去載妳。', '我到機場等妳。', '那天我去不了了。'], [], [], [], [('排了 8/2 08:00「載學姊去機場」', "!!(typeof OUT!=='undefined'&&OUT.get(GAME.G,'y4_sis_airport'))", True)], {'SIS_RIDE_ASK': 'yes'}),
       ('AIR', False, '我到機場等妳', ['我到機場等妳。', '那天我去不了了。'], [], AIRW, ['到了先在群組說，再打給你。'], [], {'SIS_RIDE_ASK': 'airport', 'SIS_SENDOFF': 'airport'}),
       ('AIR_D', False, '我到機場等妳', ['我到機場等妳。', '那天我去不了了。'], [], AIRW + ['到了先在群組說，再打給你。'], [], [], {'SIS_RIDE_ASK': 'airport', 'SIS_SENDOFF': 'airport'}),
       ('NO', False, '那天我去不了了', ['我到機場等妳。', '那天我去不了了。'], ['說好的那個，沒關係。', '出發了。'], [], AIRW, [], {'SIS_RIDE_ASK': 'no', 'SIS_SENDOFF': 'bus'})]] + [
  # 5. 第 3 節：交往中、口試（2029-05-29 16:00）沒到——18:30 私訊；不按＝21:00「書瑀打電話來」；按「（打給她）」＝馬上打過去；接了 → 5/30 12:20 研究室的蛋糕
  dict(id='B6_DEF_WAIT', key='2029-05-29', h=15.0, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, steps=[('until', 21.6), ('bedpick', '睡到明天早上'), ('until', 13.2)],
       pref=['接起來：書瑀打電話來', '「恭喜。」', '出發：研究室的蛋糕'], wantMsg=['過了。', '……你今天在忙？好。晚上打給我。'], want=M9C + [M9K], nothree=True,
       cflags=['SIS_DEFENSE', 'SIS_DEFENSE_CALL', 'SIS_DEFENSE_CAKE'], eqflags={'SIS_DEFENSE': 'missed', 'SIS_DEFENSE_CALL': True, 'SIS_DEFENSE_CAKE': 'went'}),
  dict(id='B6_DEF_CALL', key='2029-05-29', h=15.0, zone='dorm', flags=dict(TWF), js=Y4 + SIS_D, asks={'y4_m9_callme': '（打給她）'}, steps=[('until', 19.6), ('bedpick', '睡到明天早上'), ('until', 13.2)],
       pref=['打過去：打給書瑀', '「恭喜。」', '出發：研究室的蛋糕'], want=M9C + [M9K], nothree=True, cflags=['SIS_DEF_CALL_ME', 'SIS_DEFENSE_CALL', 'SIS_DEFENSE_CAKE'],
       eqflags={'SIS_DEF_CALL_ME': True, 'SIS_DEFENSE_CALL': True, 'SIS_DEFENSE_CAKE': 'went'}),
  # 6. 第 4 節：便條（交往中，大二上 9/21 21:00 私訊 → 9/22 12:20 研究室搬書）；對照：朋友版沒有這一行
  dict(id='B6_NOTE', key='2026-09-21', h=20.9, zone='dorm', js=SIS_D, asks={'sisy23_lab': '好'}, steps=[('until', 21.4), ('ffloop', '2026-09-22', 14.0)], pref=['出發：', '「照顏色排？」'],
       want=[NOTE6, '……你的。'], nothree=True, cflags=['SIS_LAB_DESK'], eqflags={'SIS_LAB_DESK': 'went'}),
  dict(id='B6_NOTE_F', key='2026-09-21', h=20.9, zone='dorm', js=SISF, asks={'sisy23_lab': '好'}, steps=[('until', 21.4), ('ffloop', '2026-09-22', 14.0)], pref=['出發：', '「照顏色排？」'],
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
  dict(id='B6_LIB_GO', key='2028-07-31', h=10.5, zone='library_hall', gset={'pos': LIB2F}, flags=dict(TWF), js=Y4 + SISF, steps=[('use', '^樓梯間：往 3F')], pref=[],
       want=LIBL, none=[LIBD], nothree=True, cflags=['SIS_LIB_LAST'], eqflags={'SIS_LIB_LAST': True}),
  dict(id='B6_LIB_GO_D', key='2028-07-31', h=10.5, zone='library_hall', gset={'pos': LIB2F}, flags=dict(TWF), js=Y4 + GF729, steps=[('use', '^樓梯間：往 3F')], pref=[],
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
       ('MISS', '好', ['先不接'], ['明天早上的飛機。十二月見。'], [], ['你五號回來，我二號走。錯開三天。'], 'missed')]] + [
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
    for k in range(4):
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
    lab = ''
    for k in range(4):
        lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
        if lab: break
        await pg.wait_for_timeout(800)
    say('   互動：%s（按鈕「%s」）' % (it[2], lab)); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    cs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"); say('   選單：%s' % ' / '.join(c[:24] for c in cs))
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
                    elif st[0] == 'ffloop': await B['ffloop'](pg, cdp, run, sc, st[1], st[2])
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
                    elif st[0] == 'phonego':   # 手機「今天」→「今天約好的」那一筆「前往」
                        await pg.evaluate("(()=>{ const b=document.getElementById('btnPhone'); if(b) b.click(); })()"); await pg.wait_for_timeout(1200)
                        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(1000)
                        c = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-invgo]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim(),(e.closest('.phrow')||e.parentElement).innerText]; })()")
                        await run.shot(pg, 'phonego_%s' % sc['id'])
                        if not c: bad.append('%s：手機「今天約好的」沒有「前往」' % sc['id'])
                        else:
                            say('   手機「今天約好的」：%s →「%s」' % (c[3].replace('\n', '｜')[:80], c[2])); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(4000)
                            await B['drain'](pg, cdp, pref=sc.get('pref', []), secs=120)
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
