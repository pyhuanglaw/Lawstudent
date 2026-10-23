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
JPF = {'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'AN_SENDOFF': 'together'}
USF = dict(B['USF'], Y4_PATH='other')
Y4 = "G.flags.Y4_PATH_DAY=D('2028-06-08');"
JPJS = "G.flags.X1_JP=D('2028-02-20'); G.flags.JP_DEPARTED=D('2028-03-25'); G.flags.JP_RETURNED=D('2028-08-05');"
HEART = ("LV('heroine_02',45,30,0); SOCIAL.rel('heroine_02').npcRom=40; const Lg=DATE.log(G,'heroine_02'); Lg.count=4; Lg.wish=true;"
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
    ks = ['2026-09-06', '2027-09-05', '2028-09-03', '2029-06-01', '2029-06-02', '2029-06-28', sc['key']]
    dk = await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })(%s)" % json.dumps(ks))
    F = {'KX_DEC3_MIGRATED': True, 'Y4_PATH': 'other', 'BAR_REG': False, 'PACKED_Y4': dk['2029-06-01'], 'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'],
         'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True,
         'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'PG': {'done': {'grad': 1}}}
    F.update(sc.get('flags', {}))
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk[sc['key']], 'hour': sc['h'], 'energy': 100, 'money': 22000, 'zone': sc.get('zone', 'campus'), 'pos': sc.get('pos'), 'weather': 'clear', 'flags': F,
          'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1, 'ev_sis_w1': 1}, 'last': {}, 'count': 0}}
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
SCENS = SCENS + EXTRA

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
                await pg.evaluate(BGHOOK)
                cond = await pg.evaluate("(()=>{ try{ return ZRLAST.cond(GAME.G,true); }catch(e){ return 'ERR '+e; } })()")
                say('   【讀資料】讀檔後 ZRLAST.cond：%s' % json.dumps(cond, ensure_ascii=False))
                for st in sc['steps']:
                    if st[0] == 'until': await B['play_until'](pg, cdp, run, st[1], sc)
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
                    elif st[0] == 'sendchat': await sendchat(pg, st[1], st[2], sc)
                    elif st[0] == 'addday':   # [捷徑] 日子往後撥 st[1] 天（同一個時間、同一個地方）
                        await pg.evaluate("(n=>{ const G=GAME.G; G.day+=n; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; if(GAME.updateHUD) GAME.updateHUD(); })(%d)" % st[1])
                        run.setup('[捷徑] %s：日子往後撥 %d 天' % (sc['id'], st[1])); await pg.wait_for_timeout(1500)
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
            except Exception as e:
                say('   例外：%r' % e); bad.append('%s 例外 %r' % (sc['id'], e)); await run.shot(pg, 'ev_err_' + sc['id'])
            say('[%s] %s（這一段新增問題 %d 項，%.0f 秒）' % ('PASS' if len(bad) == n0 else 'FAIL', sc['id'], len(bad) - n0, time.time() - t0))
            json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'zrlast.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('ZRLAST：芷若出國前的最後一場（AA_387 第 9 節）', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
