/* ===== 可昕「個性磨合不了，慢慢分手」（AA_351 事件包，企劃線 c29c49eb；AA-C 2026-10-21 定稿，取代 AA_288 第 3～6 節；任務 AA351-KX-DRIFT-1021、USER_WANTS C23）=====
   使用者 10-18 選的四題（AA_288 檔首）：她生氣的來源＝她確實知道的事＋她自己的不安；做對了就避得掉；分手只在學期末；分開以後只能當朋友、不能復合（第⑤題照 AA：大二上起）。
   台詞一字不改（D109：AA 寫的才演），這個檔不補台詞。程式自己加的只有系統字：出遊的標題（「可昕打電話來」那種）、D0 不說的那個選項「（不說）」——回報給 AA 確認。
   AA_384（企劃線 b6588bf5，AA 2026-10-22 回 LAWWW 的十四題；AA_351 本文同一個 commit 跟著改）：第 1～3、7 項的句子在 S.LF（朋友層的訊息回覆、尾聲的朋友版、一學期一次的午餐、畢業典禮那天 12:00）；
     第 4 項 D6 拿掉「祐廷的生日」、第 5 項 D0／D1／D1b 只看玩家自己約的、第 6 項 D1 拿掉 118 巷；第 8～14 項照舊（第 10 項：D1b 說了也算）。
   - 誰會走（第 1 節）：法律系、和可昕交往中、而且只和她一位（ROM.partners 只有 kexin）、大二上（2026-09-07）到大四下（畢業典禮那一週）。中途開始了另一段＝停住、數字凍結（21 天也不算）。
     交換那一學期（日本路線大三下、美國路線大四上；人在國外的日子也算）：D1、D1b、D2 的見面、D4、D5 不演，等回臺灣以後；D3 照演；21 天不算。寒暑假（她在高雄）：不算 21 天，D4、D5 不演。大四下不演 D4、D5（數字照記）。
   - 計數 KX_CRACK（第 2 節；ROM.crack，最低 0）：
       +：D1 的選項（+0／+1／+2）、D1 沒接 +1、D1b「妳想太多了。」+1、D2「週六還是去山下那家嗎」到隔天 21:00 沒回 +1、D2／D3 的第二個選項 +1、
          和她約好的出遊沒到或遲到超過 15 分鐘 +1（K5、畢業後的格子照 KXOD／PGDATE 原本那一套；這裡管其他的：她的出遊、和她的校外約會、去高雄找她、期末約會、D2 的見面）、連續 21 天沒見面也沒視訊 +1（一段一次）；
       −：D0「跟可昕說一聲」−1、和她約好的出遊準時到 −1（一週最多一次，K5 也在同一個上限裡：包住 PGDATE.kxArrive；只在大二上～大四下，畢業以後的格子照 PGDATE 原本那一套、不設上限）、祐廷主動約她（約她去校外、寒暑假去高雄找她）−1（一週最多一次）。
     數字到 2、4、6 各演一次 D2、D3、D4（第一次到；降下去再上來不重演）；修補成功以後又到 6＝直接 D5。
   - 場（第 3 節；事件 ev_kx_drift_r1、_r1b、_r2、_r3、_r4、_r5、_r5_call、_r6）：
       D0 答應（或約）另一位女主角單獨出去的那一刻（邀約的吃飯／散步／一盞、校外約會、去她的縣市）：多一個選單「（跟可昕說一聲）」→ 祐廷傳一則、她照順序回、−1，那一次不會有 D1；
         只算玩家自己約的（AA_384 第 5 項）：劇情裡在手機答應的出遊（OUT.plan 的事件）、她們約你的邀約（INV.offer，by:'npc'）D0、D1、D1b 都不看；
       D1 沒說、地點在公館／溫州街（118 巷沒有可以單獨約的地點，AA_384 第 6 項拿掉）、這學期第一次：那天 21:00（出遊還沒結束＝結束後 30 分鐘）她打來；沒接＝隔天 12:00 兩則＋D2；
       D1b 14 天內和同一位單獨出去兩次以上：下一次和可昕見面（出遊、約會、K5）開頭她直接問，一學期一次；
       D2 D1 吵起來（+1、+2、沒接）或第一次到 2：之後兩天她回訊息只回短的；第三天 21:00 問週六；週六 18:30 政大山下；
       D3 第一次到 4、大二下起：那週的平日 22:00（臺灣時間）她打視訊；23:00 予樂私訊（有她的聯絡方式才有）；
       D4 第一次到 6：她約週五 19:00 山下那家（不行＝週六；再不行＝「好。」等 D5）；選項＝修補（歸零）／修補（不歸零）／等 D5；
       修補期 35 天：結束那天 <6＝KX_REPAIRED，下一次「我們的日子」見面她說「這個月你都有先講。」；
       D5 只在學期末：期末考最後一天（祐廷自己的最後一科，CLS.lastExamEnd）21:00 她傳，隔天 19:00 政大宿舍樓下；沒到＝21:00 她打來；也沒接＝隔天 12:00 文字版。
         記 ROM.end(G,'kexin','drift')、KX_ENDED='drift'、KX_ENDED_ON；已經排好的她的出遊、校外約會、排在手機裡還沒送的她的訊息都取消；
       D6 前 60 天她不傳、回訊息只回短的；第 61 天起第一個自然的日子（祐廷放榜考上；都沒有＝她自己的好消息。祐廷的生日 AA_384 第 4 項拿掉）她先傳，接著約那個週六 12:30 公館吃午餐；之後照朋友。
   - 分開以後：ROM.canStart(G,'kexin') 一律 false（不能復合）；學期末心意邀約、女朋友的期末約會沒有她（TERMEND.plan 的 kx 也關掉）；K5、K7、交往版閒聊階梯照原本的規則停（看 dating_kexin）；
     尾聲不用前任那一版（PG.exLines 回 null），用朋友版：她坐在同一桌、EPI_ORDER 最後一個（AA_384 第 2 項，PG.epiPresent／epiLine）；
     照朋友（D6 那頓午餐以後，沒約成＝照朋友那天起）以後（AA_384 第 1、3、7 項；第 61 天到那頓午餐之間照舊只回短的）：
       訊息回覆用朋友層 R（S.LF.msg、S.LF.msg2；包住 MSG.pick／pick2／topics／replyAt：情況版先〔在國外 → 放假、在高雄 → 考試週 → 深夜〕、沒有才用一般版、同一種輪流；
         晚安兩則輪流、不看熟悉度；第二批只開她的生日 4/24、新年；祐廷在國外＝她照臺灣的時間回，她那邊 23:30 以後用 L 層那兩則〔MSG_POOL 可昕的「祐廷在國外」，美國、日本各一〕）；
       一學期一次的午餐（S.r7Rule：照朋友的下一個學期起到大四下，第 6 週週四 21:00 她約、週六 12:30 公館，三套輪流；交換那一學期不排；那天不行＝「好。下次。」那學期不排；沒到＝她傳一則、不扣任何數字）；
       畢業典禮那天 12:00 的訊息換成朋友版（PG.MSGS 的 pg_kx_ex；被發現、劈腿那一條照舊「恭喜。」）。
   - 存檔：G.flags.KX_DRIFT（下面 S.rec）、KX_REPAIRED、KX_ENDED、KX_ENDED_ON；KX_CRACK 舊存檔沒有＝0；大三以後才讀進來的存檔從讀檔那天開始算（21 天、出遊紀錄不往回補）。
   測試：node tests/aa351_kx_drift_unit.js、node tests/aa384_kx_friend_unit.js */
'use strict';
const KXDRIFT=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof CALENDAR==='undefined') return S;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const wdOf=d=>CALENDAR.dateOf(d).wd%7;   /* 0＝週日 … 6＝週六 */
  const monOf=d=>d-((wdOf(d)+6)%7);   /* 那一週的週一 */
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const termOf=d=>CALENDAR.termOf(d);
  const termAt=d=>{ const t=termOf(d); if(t) return t.id; return STORY.termAt?STORY.termAt(d):null; };   /* 寒暑假算前一個學期 */
  const tz=(G,day)=>STORY.tzOffset?(+STORY.tzOffset(G,day)||0):0;
  const local=(G,twDay,twH)=>{ const t=T(twDay,twH)+tz(G,twDay), d=Math.floor(t/24+1e-9); return {day:d,h:+(t-d*24).toFixed(4)}; };   /* 臺灣時間 → 遊戲時鐘（人在國外＝當地時間，同 KXOD）*/
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const KX='kexin', TH='p:kexin';
  const K=t=>({th:TH,from:KX,text:t});
  S.HER=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];   /* 另一位女主角（DATE.HEROINES 去掉可昕）*/
  S.TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.R1B_COUNT_TOLD=true;   /* D1b：說了一聲的那一次也算（第 3 節 D1b「有沒有先說都算——說了她就知道」；AA_384 第 10 項確認，AA_351 D0 那半句「D1b 也不算那一次」已刪）*/
  S.R1B_DAYS=14;   /* D1b：14 天內（兩次出去相差不到 14 天）*/
  S.GAP=21;   /* 連續 21 天沒見面、也沒視訊 */
  S.REPAIR=35;   /* 修補期 */
  S.D6_QUIET=60;   /* D6：前 60 天 */
  S.D6_LOOK=30;   /* D6：第 61 天起看多久以內有沒有「自然的日子」（祐廷放榜考上）；沒有＝第 61 天傳她自己的好消息（LAWWW 暫定，回報 AA）。祐廷的生日那一種拿掉（AA_384 第 4 項：人物設定，留給使用者）*/
  S.INTERN_KEY='2028-11-23';   /* 她的實習上了（r2y4a_events.js ev_kexin_intern_result：「我事務所的實習也上了」）：這天以前＝還沒到實習的年份 */
  /* 祐廷放榜、考上的事（D6「祐廷有放榜、考上的事」）：track＝他在等這一場的結果，ok＝考上 */
  S.PASS=[{key:'2028-11-23',h:15,track:G=>typeof R2Y4A!=='undefined'&&!!R2Y4A.pushOn&&R2Y4A.pushOn(G)&&G.flags.Y4_PUSH==null,ok:G=>G.flags.Y4_PUSH==='pass'},   /* 推甄放榜（r2y4a3d.js）*/
    {key:'2029-03-22',h:15,track:G=>G.flags.GRAD_EXAM_2029===true&&G.flags.GRAD_EXAM_RESULT==null,ok:G=>G.flags.GRAD_EXAM_RESULT==='pass'}];   /* 研究所筆試放榜（r2y4b3d.js 2-Y4-34）*/

  /* ---------- 台詞（AA_351 第 3 節原文，一字不改；「（…）」＝旁白，其他＝可昕說）---------- */
  S.L={
    d0:{opt:'（跟可昕說一聲）',no:'（不說）',say:'週六我跟{她}去{地點}吃飯。',reply:['好。吃完跟我說好不好吃。','好啊。不要吃太晚。','好啦。幫我看一下那家的菜單，我下次要去。']},
    r1:{ring:'（手機響了。可昕。）',where:{'公館':'你今天在公館？','溫州街':'你今天在溫州街？'},lines:['予樂說看到你，跟一個女生。','她是誰不重要。你為什麼沒跟我講？'],
      opts:[{t:'「我忘了講。對不起。」',say:['……好。下次講。','（電話掛得很快。）'],n:0},{t:'「只是一起吃飯。」',say:['我又沒說你們怎樣。','我是問你為什麼沒講。','……算了，我要去洗澡。'],n:1},{t:'「妳想太多了吧。」',say:['操。','好，我想太多。晚安。'],n:2}],
      missed:['你昨天在公館。','打給你也不接。']},
    r1b:{lines:['你最近常跟{她}出去耶。','……我沒有怎樣，我只是問。'],
      opts:[{t:'「下次三個人一起吃飯？」',say:['……好啊。你約。'],n:0},{t:'「妳想太多了。」',say:['我說了，我只是問。','……算了。吃飯。'],n:1},{t:'「那我少跟她出去。」',say:['我不是要你少出去。','……算了，先點餐。'],n:0}]},
    r2:{short:['嗯','在忙','嗯'],ask:'週六還是去山下那家嗎',askOpts:['好。','（不回）'],scene:'政大・山下的小吃街',
      lines:['（她點了兩碗酸辣湯餃。吃飯的時候，她幾乎沒說話。）','（回去的路上，走到第二個路口，她才開口。）','上次那個，我還有一點氣。'],
      opts:[{t:'「我知道。」',say:['……嗯。','（她勾住你的手臂。）'],n:0},{t:'「都過兩天了耶。」',say:['兩天不夠。','（她把手放進自己的口袋。）'],n:1}]},
    r3:{first:'今天讀書會吵到九點。邵鈞跟予樂為了一題，一個說要先講結論，一個說……',shao:'邵鈞',noShao:'我們讀書會一個人',
      lines:['（你在看明天的考古題。她講到一半停下來。）','你剛剛在看別的東西。','……沒關係。我也累了。今天先這樣。'],
      opts:[{t:'「我在聽，妳說。」',say:['（她講完了。後面那一段講得很快。）','……好，晚安。'],n:0},{t:'「好，早點睡。」',say:['（畫面黑掉。）'],n:1}],yule:'你們最近還好嗎'},
    r4:{ask:'週五晚上，山下那家。有事要講。',askOpts:['好。','那天不行。'],sat:'那週六。',ok:'好。',scene:'政大・山下的小吃街',
      lines:['我們最近是不是一直在吵？','我知道我脾氣不好。','可是你也一直讓我猜。猜你在哪、跟誰、會不會遲到。','……我不想再猜了。'],
      opts:[{t:'「我會改。先講、準時、妳生氣我當天就打給妳。」',say:['你講的喔。','（她把你碗裡的湯餃夾走一顆。）']},{t:'「我們都太忙了。」',say:['對。……那怎麼辦？','（你答不出來。）','……先吃吧。湯餃要冷了。']},{t:'「是妳太容易生氣。」',say:['……好。','（她付完錢就走了。）']}]},
    repair:'這個月你都有先講。',
    r5:{ask:'明天晚上七點，我宿舍樓下。',scene:'政大・宿舍樓下',talk:['我想了一個禮拜。','我們分開好不好。','我不想每次見面，都在算你又遲到幾分鐘。','你應該也不想每次都在猜我為什麼生氣。'],
      opts:[{t:'「再試一次？」',say:['我們試過了。','……試了一整個學期。']},{t:'「……好。」',say:['嗯。','（她點頭，很久沒說話。）']},{t:'（不說話）',say:['你看，你又不講話。','（她笑了一下，眼睛是紅的。）']}],
      close:['我先上去了。','到家傳一下。這個我還是想知道。'],home:['到了。','嗯。'],callOpen:['我在樓下等了一個小時。','……那我在電話裡講。'],callClose:['我要上去了。','……晚安。'],text:'昨天的事，我寫在這裡。'},
    r6:{short:['嗯','最近很忙','嗯'],pass:['欸。','恭喜。'],news:['欸。','我實習上了。……想說跟你講一下。'],newsEarly:['欸。','我們讀書會的考古題終於做完了。……想說跟你講一下。'],
      lunch:'週六中午，公館。吃個飯。',lunchOpts:['好。','那天不行。'],scene:'公館',lines:['（你到的時候，她已經坐好了。）','你遲到了。','（她看了一下手機。）','……三分鐘。算了。','先點餐。這頓我請。']} };
  /* ---------- 分開以後當朋友的句子（AA_384 第 1、2、3、7 項原文，一字不改）----------
     msg：朋友層 R 的訊息回覆，格式同 MSG_POOL 的可昕（BB_178 第 5 節）；msgs＝一個框一則泡泡，照順序。「祐廷在國外」不另寫：照 L 層那兩則（MSG_POOL 可昕 variant「祐廷在國外」，S.frAbroad）。
     msg2：第二批話題（格式同 MSG2_POOL）：生日快樂（她的生日 4/24）、新年快樂；謝謝、還好嗎不開（分開以後沒有對應的事件）。
     epi：尾聲的朋友版（[說話的人, 台詞]，null＝旁白；同 POSTGRAD_LINES）。lunch：一學期一次的午餐（sets＝三套，旁白＋她一句）。grad：畢業典禮那天 12:00 她傳的 */
  S.LF={
    msg:[{topic:'chat',tier:'R',variant:null,msgs:['在爬坡。','你呢？又在總圖？'],tags:[],ask:null,src:'AA_384 第 1 項 chat 平常（三則輪流）'},
      {topic:'chat',tier:'R',variant:null,msgs:['在宿舍寫報告。','予樂在旁邊唱歌，很難聽。'],tags:[],ask:null,src:'AA_384 第 1 項 chat 平常（三則輪流）'},
      {topic:'chat',tier:'R',variant:null,msgs:['在等公車。','幹嘛？'],tags:[],ask:null,src:'AA_384 第 1 項 chat 平常（三則輪流）'},
      {topic:'chat',tier:'R',variant:'考試週',msgs:['在念。考完再說。'],tags:[],ask:null,src:'AA_384 第 1 項 chat 考試週'},
      {topic:'chat',tier:'R',variant:'放假、在高雄',msgs:['在高雄。','（照片：一碗很大的肉燥飯）'],tags:[],ask:null,src:'AA_384 第 1 項 chat 放假、在高雄'},
      {topic:'chat',tier:'R',variant:'深夜',msgs:['還沒睡。報告寫不完。','你也早點睡。'],tags:[],ask:null,src:'AA_384 第 1 項 chat 深夜'},
      {topic:'share_cat',tier:'R',variant:null,msgs:['政大的貓還是比較胖。'],tags:[],ask:null,src:'AA_384 第 1 項 share_cat'},
      {topic:'share_food',tier:'R',variant:null,msgs:['看起來不錯。','下次跟予樂去吃。'],tags:[],ask:null,src:'AA_384 第 1 項 share_food'},
      {topic:'share_notes',tier:'R',variant:null,msgs:['你的字還是一樣醜。'],tags:[],ask:null,src:'AA_384 第 1 項 share_notes'},
      {topic:'night',tier:'R',variant:null,msgs:['晚安。'],tags:[],ask:null,src:'AA_384 第 1 項 night（兩則輪流）'},
      {topic:'night',tier:'R',variant:null,msgs:['嗯，晚安。'],tags:[],ask:null,src:'AA_384 第 1 項 night（兩則輪流）'}],
    msg2:[{topic:'bday',cond:null,tier:'R',msgs:['謝謝。','……你還記得喔。'],tags:[],src:'AA_384 第 1 項 第二批 生日快樂（她的生日 4/24）'},
      {topic:'newyear',cond:null,tier:'R',msgs:['新年快樂。','（長頸鹿貼圖）'],tags:[],src:'AA_384 第 1 項 第二批 新年快樂'}],
    epi:[[null,'（可昕最後一個到，外套還沒脫。）'],[KX,'我遲到了。'],[KX,'……這次換我。']],
    lunch:{ask:'週六中午，公館。予樂也來。',opts:['好。','那天不行。'],no:'好。下次。',
      sets:[['（予樂一坐下就開始講她的報告。可昕一直吐槽她，偶爾也吐槽你。）','你還是點一樣的。'],['（可昕先到，已經幫三個人點好了。）','予樂說要減肥，所以我幫她點了大碗的。'],['（予樂遲到了。可昕看了一下手機。）','……十二分鐘。她比你還誇張。']],
      missed:'我們吃完了。予樂說你欠她一頓。'},
    grad:['恭喜。','下禮拜六換我。……予樂會拍一百張。'] };

  /* ---------- 存檔（G.flags.KX_DRIFT；舊存檔沒有＝第一次用到時建，from＝那一天）----------
     from 開始算的那一天；th 第一次到 2／4／6 的時間；outs 單獨出去的紀錄 [{k:'inv'|'date'|'hv', id, who, place, area, day, told, st:'live'|'done'|'gone', end}]；
     r1Term／r1bTerm 演過 D1、D1b 的學期；r1 這一次 D1 的電話；r1bPend 等著演的 D1b；r2～r6 各場的狀態；r4Pick D4 選了哪一個（0、1、2、'decline'、'noshow'）；repairEnd 修補期結束那天；
     seen 最後一次見面／視訊那天，gapDay／gapN／gapHit 21 天的計數；wk 一週一次的上限（arrive 準時到、invite 主動約她：那一週的週一）；log 數字的變化（最近 40 筆）*/
  S.rec=function(G){ const F=G.flags||(G.flags={}); if(F.KX_CRACK==null) F.KX_CRACK=0; let R=F.KX_DRIFT;
    if(!R||typeof R!=='object'){ const sp=S.span(); R=F.KX_DRIFT={v:1,from:sp?Math.max(G.day,sp[0]):G.day,r1Term:null,r1bTerm:null,r2:null,r3:null,r4:null,r4Pick:null,repairEnd:null,r5:null,r6:null}; }
    if(!R.th||typeof R.th!=='object') R.th={}; if(!Array.isArray(R.outs)) R.outs=[]; if(!R.wk||typeof R.wk!=='object') R.wk={}; if(!Array.isArray(R.log)) R.log=[];
    if(R.from==null) R.from=G.day; if(R.gapDay==null) R.gapDay=R.from; if(R.gapN==null) R.gapN=0; if(!R.tripSeen||typeof R.tripSeen!=='object') R.tripSeen={};
    return R; };
  /* ---------- 誰會走、什麼時候 ---------- */
  S.span=()=>{ const a=CALENDAR.termDays('Y2S1'), b=CALENDAR.termDays('Y4S2'); return a&&b?[a.from,b.to]:null; };
  S.inRange=(G,day)=>{ const s=S.span(), d=day==null?G.day:day; return !!s&&d>=s[0]&&d<=s[1]; };   /* 大二上到大四下（畢業以後不演，數字照 PGDATE 原本那一套）*/
  S.solo=G=>{ const P=typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):[]; return P.length===1&&P[0]===KX; };
  S.on=G=>!!G&&!!G.flags&&law(G)&&G.flags.dating_kexin===true&&S.solo(G)&&S.inRange(G);
  /* 交換那一學期（日本路線大三下、美國路線大四上），人在國外的日子也算 */
  S.exch=function(G,day){ const r=STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null; if(!r) return false; const t=termOf(day);
    if(t&&((r==='JP'&&t.id==='Y3S2')||(r==='US'&&t.id==='Y4S1'))) return true; return !!(STORY.abroad&&STORY.abroad(Object.assign({},G,{day}))); };
  S.inTerm=(G,d)=>!!termOf(d)&&!S.exch(G,d);   /* 學期中、不在交換那一學期（D2 的見面、21 天）*/
  S.okD4=(G,d)=>{ const t=termOf(d); return !!t&&t.id!=='Y4S2'&&!S.exch(G,d); };   /* D4、D5：不在寒暑假、交換、大四下 */
  S.idx=t=>S.TERMS.indexOf(t);
  /* ---------- 數字 ---------- */
  S.crack=G=>+((G.flags||{}).KX_CRACK)||0;
  S.add=function(G,n,why){ if(!n||typeof ROM==='undefined'||!ROM.crack) return 0; const c=S.crack(G); let d=n; if(n<0){ d=-Math.min(c,-n); if(!d) return 0; }   /* 最低 0 */
    ROM.crack(G,KX,d); const R=S.rec(G); R.log.push({d:G.day,h:+(+G.hour||0).toFixed(2),n:d,why:why||''}); if(R.log.length>40) R.log.splice(0,R.log.length-40); S.th(G,R); return d; };
  S.capUsed=(G,k)=>S.rec(G).wk[k]===monOf(G.day);
  S.minus=function(G,k,why){ if(S.crack(G)<=0||S.capUsed(G,k)) return 0; const d=S.add(G,-1,why); if(d) S.rec(G).wk[k]=monOf(G.day); return d; };   /* 一週最多一次（已經是 0 不用掉這一週的次數）*/
  /* 第一次到 2、4、6（降下去再上來不重演）；修補成功以後又到 6＝直接 D5 */
  S.th=function(G,R){ if(!S.on(G)) return; R=R||S.rec(G); const c=S.crack(G), t=now(G);
    if(c>=2&&R.th[2]==null){ R.th[2]=t; S.r2Start(G,R,'th'); }
    if(c>=4&&R.th[4]==null){ R.th[4]=t; if(!R.r3) R.r3={st:'pending',at:t}; }
    if(c>=6&&R.th[6]==null){ R.th[6]=t; if(!R.r4) R.r4={st:'pending',at:t}; }
    if(c>=6&&G.flags.KX_REPAIRED&&!R.r5) R.r5={st:'pending',at:t,via:'again'}; };
  const takePick=(G,key)=>{ const v=G.flags.KXD_PICK; delete G.flags.KXD_PICK; if(typeof v!=='string') return null; const [a,b]=v.split(':'); return a===key?+b:null; };

  /* ---------- D0：跟可昕說一聲（答應或約另一位女主角單獨出去的那一刻）---------- */
  S.dayWord=(G,day)=>day===G.day?'今天':(day===G.day+1?'明天':'週'+'日一二三四五六'[wdOf(day)]);
  S.d0Text=(G,x)=>S.L.d0.say.replace('週六',S.dayWord(G,x.day)).replace('{她}',nm(x.who)).replace('{地點}',x.place||'');   /* 日子照實際那天：今天／明天／週○ */
  S.replyAt=G=>typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,KX):{day:G.day,h:(+G.hour||0)%24+0.1};
  S.register=function(G,o){ const R=S.rec(G); let x=R.outs.find(y=>y.k===o.k&&y.id===o.id); if(x) return x; x=Object.assign({told:false,st:'live',at:now(G)},o); R.outs.push(x);
    R.outs=R.outs.filter(y=>y.st==='live'||G.day-y.day<=40); return x; };
  S.offerTell=async function(GM,o){ const G=GM.G; if(!S.on(G)||!S.HER.includes(o.who)) return null; const R=S.rec(G); if(R.outs.some(y=>y.k===o.k&&y.id===o.id)) return null;
    const x=S.register(G,o); const k=await GM.choose([{t:S.L.d0.opt},{t:S.L.d0.no}]); if(k===0) await S.tell(GM,x); return x; };
  S.tell=async function(GM,x){ const G=GM.G, R=S.rec(G), text=S.d0Text(G,x); x.told=true; x.toldAt=now(G);
    if(typeof PHONE!=='undefined'){ PHONE.post(G,{th:TH,from:'player',who:null,text}); const L=S.L.d0.reply, i=(R.d0n|0)%L.length, at=S.replyAt(G); R.d0n=(R.d0n|0)+1; PHONE.at(G,at.day,at.h,[K(L[i])],null); }   /* 她回：照順序輪 */
    await GM.say({name:(G.name||'祐廷')+'（手機）'},text); S.add(G,-1,'d0'); return true; };
  /* 邀約（吃飯、散步、一盞＝INVITE_DATA 的「兩個人單獨」；Café、總圖是有理由的、不算）。D1 只看公館、溫州街（AA_384 第 6 項：118 巷沒有可以單獨約的地點，拿掉）*/
  S.AREA=z=>(z==='noodle'||z==='gongguan')?'公館':((z==='wenzhou'||/^wz_/.test(String(z||''))||z==='cafe')?'溫州街':null);
  /* 只算玩家自己約的（AA_384 第 5 項）：她們約你的（INV.offer 的 by:'npc'，劇情事件發的）不算——兩個人都在那裡直接開始（INV.autoStart → startTogether）也一樣 */
  S.invSolo=function(iv){ if(typeof INV==='undefined'||!iv||iv.by==='npc') return false; const P=INV.place(iv.place), D=typeof INVITE_DATA!=='undefined'?INVITE_DATA:{};
    return !!P&&S.HER.includes(iv.who)&&((D.soloKinds||[]).includes(P.kind)||(D.soloPlaces||[]).includes(P.id)); };
  S.invTell=async function(GM,iv){ if(!iv||iv.kxd) return null; iv.kxd=1; const G=GM.G; if(!S.on(G)||!S.invSolo(iv)) return null; const P=INV.place(iv.place);
    return S.offerTell(GM,{k:'inv',id:iv.id,who:iv.who,place:P.name,area:S.AREA(P.zone),day:iv.day}); };
  /* 校外約會：約另一位＝D0；約可昕（她答應）＝主動約她 −1 */
  S.dateTell=async function(GM,t){ const G=GM.G; if(!t||!t.who) return null; if(t.who===KX){ if(S.on(G)) S.minus(G,'invite','invite_date'); return null; }
    if(!S.on(G)||!S.HER.includes(t.who)) return null; const names=(t.locs||[]).map(l=>(typeof DATE!=='undefined'&&DATE.loc&&(DATE.loc(l)||{}).name)||l).join('、');
    return S.offerTell(GM,{k:'date',id:t.trip,who:t.who,place:names,area:null,day:t.day}); };
  /* 去她的縣市（hometown3d.js）：可昕（寒暑假去高雄找她）＝主動約她 −1；另一位＝D0 */
  S.hvTell=async function(GM,id,day){ const G=GM.G; if(day==null) return null; if(id===KX){ if(S.on(G)) S.minus(G,'invite','invite_hv'); return null; } if(!S.on(G)||!S.HER.includes(id)) return null;
    const key=typeof HV!=='undefined'&&HV.key?HV.key(G,id,day):id, HL=typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES:{}, C=HL[key]||HL[id]||{};
    return S.offerTell(GM,{k:'hv',id:'hv_'+id+'_'+day,who:id,place:C.city||'',area:null,day}); };

  /* ---------- 單獨出去的那一次真的去了（每次手機規則看一次）：D1、D1b ---------- */
  S.scanOuts=function(G,R){ for(const x of R.outs){ if(x.st!=='live') continue; let st=null, end=null;
      if(x.k==='inv'){ const iv=typeof INV!=='undefined'&&INV.byId?INV.byId(G,x.id):null; if(!iv) st='gone'; else if(iv.state==='done'){ const P=INV.place(iv.place)||{}; st='done'; x.day=iv.day; end=T(iv.day,(+iv.h||0)+(P.stay||1)); } else if(['missed','cancelled','declined'].includes(iv.state)) st='gone'; else if(iv.day!==x.day) x.day=iv.day; }
      else if(x.k==='date'){ const t=typeof DATE!=='undefined'&&DATE.trip?DATE.trip(G,x.id):null, q=typeof OUT!=='undefined'?OUT.get(G,'date_'+x.id):null; if(!t) st='gone';
        else if(t.status==='done'||(q&&q.state==='done')){ st='done'; x.day=t.day; end=T(t.day+(t.kind==='overnight'?(t.nights||1):0),+t.back||20); } else if(t.status==='missed'||t.status==='cancelled') st='gone'; else if(t.day!==x.day) x.day=t.day; }
      else if(x.k==='hv'){ const q=typeof OUT!=='undefined'?OUT.get(G,x.id):null; if(!q) st='gone'; else if(q.state==='done'){ st='done'; end=T(q.day,17+(+q.travelH||1)); } else if(q.state==='missed'||q.state==='skipped') st='gone'; }
      if(st==='gone'){ x.st='gone'; continue; } if(st==='done'){ x.st='done'; x.end=end; S.soloDone(G,R,x); } } };
  S.soloDone=function(G,R,x){ if(!S.on(G)||S.exch(G,x.day)) return;
    if(!x.told&&x.area){ const tk=termAt(x.day); if(R.r1Term!==tk&&typeof OUT!=='undefined'){   /* D1：每學期只演第一次（之後同一學期再沒說，不演、不加）*/
        R.r1Term=tk; const at=Math.max(T(x.day,21),(x.end!=null?x.end:T(x.day,21))+0.5), d=Math.floor(at/24+1e-9); R.r1={area:x.area,day:x.day,st:'planned',out:x.id};
        OUT.plan(G,S.callOut('kx_drift_r1_'+x.day,'ev_kx_drift_r1',d,+(at-d*24).toFixed(3))); } }
    const cnt=R.outs.filter(y=>y.st==='done'&&y.who===x.who&&(S.R1B_COUNT_TOLD||!y.told)&&Math.abs(x.day-y.day)<S.R1B_DAYS).length;
    if(cnt>=2&&!R.r1bPend&&R.r1bTerm!==termAt(G.day)) R.r1bPend={who:x.who,day:x.day}; };
  S.callOut=(id,ev,day,h)=>({id,ev,day,h,late:0.5,place:'電話',verb:'接起來',no:'先不接',title:'可昕打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',alarm:true,silent:true});
  /* 她曖昧中的那一位（劈腿那一條，D1b 不演）：DATE 的第 5 階以上 */
  S.ambig=(G,id)=>typeof DATE!=='undefined'&&!!DATE.stageNum&&DATE.stageNum(id)>=5;

  /* ---------- 和可昕的出遊：哪一種（見面／視訊／電話）---------- */
  S.isKx=function(G,q,ev){ if(!q) return false; const id=String(q.id||'');
    if(q.dateTrip) return !!(typeof DATE!=='undefined'&&DATE.trip&&(DATE.trip(G,q.dateTrip)||{}).who===KX);
    if(q.hv) return q.hv.id===KX; if(q.te) return q.te.who===KX; if(q.kxod||q.pgWho===KX||/^kx_/.test(id)) return true;
    const e=ev||evOf(q.ev); return !!(e&&(e.participants||[]).includes(KX)); };
  S.kind=function(G,q,ev){ if(!S.isKx(G,q,ev)) return null; const e=ev||evOf(q.ev), d0=e&&Array.isArray(e.dialogue)?e.dialogue.find(l=>l&&l.scene!==undefined):null;
    if(q.call||(d0&&d0.scene==='電話')) return 'call'; if(q.verb==='接起來'||q.place==='視訊'||q.odPlace==='video') return 'video'; return 'meet'; };
  S.seen=G=>{ const R=S.rec(G); R.seen=G.day; R.gapN=0; R.gapHit=false; };
  /* 那一天已經有她的別的出遊（她排的、週年、生日、和她的校外約會）：D2、D4、D5 的見面不排在那一天（K5 的固定格不算：KXOD 看到她那一週有出遊會自己讓開）*/
  S.herBusy=(G,day)=>(typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q&&q.day===day&&(q.state==='planned'||q.state==='done')&&!/^kx_drift_/.test(String(q.id||''))&&!q.kxod&&!/^kx_od_/.test(String(q.id||''))&&S.isKx(G,q,null)))
    ||((G.trips||[]).some(t=>t&&t.who===KX&&(t.status==='booked'||t.status==='going')&&typeof DATE!=='undefined'&&DATE.onDay&&DATE.onDay(t,day)));
  /* 準時到 −1（一週最多一次）、遲到超過 15 分鐘 +1 */
  S.arrive=function(G,q){ const late=now(G)-T(q.day,q.h); if(late>0.25+1e-6) return S.add(G,1,'late'); return S.minus(G,'arrive','ontime'); };
  S.OD_SCENE={nccu:['政大・山下的小吃街','nccu_food'],ntu:['台大・社科院門口','ntu_soc'],gongguan:['公館','gongguan'],wenzhou:['溫州街','wenzhou'],river:['河濱','riverside']};   /* K5 的地點（events.js ev_kexin_our_day_wk）*/
  S.sceneOf=function(G,q,ev){ if(!q||q.dateTrip) return null; const a=q.odPlace&&S.OD_SCENE[q.odPlace]; if(a) return {scene:a[0],bg:a[1]};
    for(const l of ((ev&&ev.dialogue)||[])){ if(!l||l.scene===undefined) continue; if(l.if&&!(typeof EVENTS!=='undefined'&&EVENTS.cond&&EVENTS.cond(l.if))) continue; if(l.unless&&typeof EVENTS!=='undefined'&&EVENTS.cond&&EVENTS.cond(l.unless)) continue; return {scene:l.scene,bg:l.bg}; }
    return null; };
  /* D1b：見面的時候她直接問（出遊的開頭，OUT.BEFORE）*/
  S.r1bPlay=async function(GM,q,ev){ const G=GM.G, R=S.rec(G), p=R.r1bPend; if(!p||!S.on(G)||S.exch(G,G.day)) return false; const tk=termAt(G.day);
    if(R.r1bTerm===tk||!S.HER.includes(p.who)||S.ambig(G,p.who)){ R.r1bPend=null; return false; }   /* 一學期最多一次；她和祐廷真的在曖昧（劈腿那一條）不演 */
    R.r1bPend=null; R.r1bTerm=tk; const sc=S.sceneOf(G,q,ev);
    if(sc&&typeof ADV!=='undefined'){ if(ADV.setBg&&sc.bg&&typeof OUT!=='undefined') ADV.setBg(OUT.bg(sc.bg)); if(GM.caption) GM.caption('',sc.scene,2400); }
    const E=evOf('ev_kx_drift_r1b'); if(!E||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; G.flags.KXD_HER=nm(p.who);
    try{ await EVENTS.runLines(E.dialogue,E); } finally { delete G.flags.KXD_HER; }
    if(takePick(G,'r1b')===1) S.add(G,1,'r1b'); return true; };
  S.before=async function(GM,q,ev){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return; const kind=S.kind(G,q,ev); if(!kind||kind==='call') return; const id=String(q.id||'');
    if(G.flags.dating_kexin===true&&S.inRange(G)) S.seen(G);   /* 見面、視訊：21 天重新算 */
    if(kind!=='meet'||!S.on(G)) return;
    if(!q.kxod&&!/^kx_od_/.test(id)&&!/^kx_drift_(r4|r5|r6)/.test(id)) S.arrive(G,q);   /* K5、畢業後的格子：KXOD／PGDATE 自己算（包住的 kxArrive 一樣一週一次）；D4、D5 不算 */
    if(!/^kx_drift_/.test(id)) await S.r1bPlay(GM,q,ev); };
  /* 說了「晚一點」最後沒到（她排的出遊）、校外約會和去高雄找她（他約的）沒到：+1；K5、畢業後的格子照 KXOD／PGDATE；D 系列的場次在各自的 outingMissed */
  S.missed=function(G,q){ if(!G||!q||!S.on(G)) return 0; const id=String(q.id||''); if(q.kxod||/^kx_od_/.test(id)||/^kx_drift_/.test(id)||q.dateTrip) return 0; if(S.kind(G,q,null)!=='meet') return 0;
    if(q.hv&&q.hv.id===KX) return S.add(G,1,'missed_hv'); if(q.ask!=null) return S.add(G,1,'missed'); return 0; };
  /* 和可昕的校外約會沒去（今天不去了、過了時間）：+1 */
  S.scanTrips=function(G,R){ for(const t of ((G&&G.trips)||[])){ if(!t||t.who!==KX||R.tripSeen[t.trip]) continue;
      if(t.status==='missed'||t.status==='cancelled'){ R.tripSeen[t.trip]=1; if(t.day<=G.day&&t.day>=R.from) S.add(G,1,'missed_date'); } else if(t.status==='done') R.tripSeen[t.trip]=1; } };
  /* 連續 21 天沒見面、也沒視訊（寒暑假、交換不算＝那幾天不數；一段只算一次）*/
  S.gapTick=function(G,R){ let n=0; while(R.gapDay<G.day&&n++<800){ const d=R.gapDay; R.gapDay++; if(R.seen===d){ R.gapN=0; R.gapHit=false; continue; }
      if(!S.inRange(G,d)||!S.inTerm(G,d)) continue; R.gapN++; if(R.gapN>=S.GAP&&!R.gapHit){ R.gapHit=true; S.add(G,1,'gap21'); } } };

  /* ---------- D2 冷一陣子 ---------- */
  S.r2Busy=R=>!!R.r2&&['short','asked','planned'].includes(R.r2.st);
  S.r2Start=function(G,R,src){ R=R||S.rec(G); if(S.r2Busy(R)) return false; R.r2={st:'short',src,at:now(G),day:G.day,until:T(G.day+2,24),n:((R.r2&&R.r2.n)|0)+1}; return true; };   /* 之後兩天只回短的；第三天 21:00 問 */
  S.firstOk=(G,d0,ok,lim)=>{ for(let d=d0;d<=d0+(lim||400);d++) if(ok(d)) return d; return null; };
  S.nextSat=(G,d0,ok)=>{ for(let d=d0+1;d<=d0+400;d++) if(wdOf(d)===6&&(!ok||ok(d))) return d; return null; };
  S.r2Rule=function(G,R){ const r=R.r2; if(!r) return; const F=G.flags;
    if(r.st==='short'){ const askDay=S.firstOk(G,r.day+3,d=>S.inTerm(G,d)); if(askDay==null||now(G)<T(askDay,21)) return;   /* 寒暑假、交換中：等她回臺北、你回臺灣 */
      const sat=S.nextSat(G,askDay,d=>S.inTerm(G,d)&&!S.herBusy(G,d)); if(sat==null) return; const until=Math.min(T(askDay+1,21),T(sat,18.5)-0.75), tag='kx_drift_r2_ask_'+r.n;
      PHONE.at(G,askDay,21,[Object.assign(K(S.L.r2.ask),{ask:{id:tag,until,opts:[{t:S.L.r2.askOpts[0],set:{KXD_R2_ANS:'yes'}},{t:S.L.r2.askOpts[1],post:false,set:{KXD_R2_ANS:'no'}}]}})],tag);
      Object.assign(r,{st:'asked',askDay,sat,untilAsk:until}); return; }
    if(r.st==='asked'){ const a=F.KXD_R2_ANS;
      if(a==='yes'){ delete F.KXD_R2_ANS; r.st='planned'; OUT.plan(G,{id:'kx_drift_r2_'+r.n,ev:'ev_kx_drift_r2',day:r.sat,h:18.5,late:0.75,place:S.L.r2.scene,title:'和可昕：'+S.L.r2.scene,travel:'開車約 30 分鐘',travelH:0.5,alarm:true}); return; }
      if(now(G)>r.untilAsk){ delete F.KXD_R2_ANS; r.st='noreply'; S.add(G,1,'r2_noreply'); } } };   /* 到隔天 21:00 沒回＝+1，那個週六沒有 */
  /* ---------- D3 各自忙（視訊）---------- */
  S.r3Rule=function(G,R){ const r=R.r3; if(!r||r.st!=='pending'||S.idx(termAt(G.day))<S.idx('Y2S2')) return;   /* 大二下起 */
    for(let d=G.day;d<=G.day+8;d++){ const w=wdOf(d); if(w<1||w>5) continue; const at=local(G,d,22); if(T(at.day,at.h)<now(G)+0.25) continue;   /* 那週的平日 22:00（臺灣時間）*/
      OUT.plan(G,{id:'kx_drift_r3',ev:'ev_kx_drift_r3',day:at.day,h:at.h,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title:'可昕打視訊來',travel:'',travelH:0,back:'視訊結束。',alarm:true,silent:true,twDay:d});
      r.st='planned'; r.day=d; return; } };
  S.metShao=G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(KX,'ENC_D13_KX');   /* 見過邵鈞（ENC_D13_KX，淡水的偶遇）*/
  S.yuleContact=G=>(typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,'yule'))||((G.msgs||[]).some(m=>m&&(m.th==='p:yule'||(m.who==='yule'&&!m.th))));   /* 予樂私訊過（她是只有立繪的人物，沒有 contacts 那一筆）*/
  /* ---------- D4 講開 ---------- */
  S.r4Rule=function(G,R){ const r=R.r4; if(!r) return; const F=G.flags;
    if(r.st==='pending'){ if(S.r2Busy(R)) return; const d0=now(G)<=T(G.day,21)?G.day:G.day+1; if(!S.okD4(G,d0)) return;
      let fri=null; for(let d=d0+1;d<=d0+7;d++) if(wdOf(d)===5){ fri=d; break; } if(fri==null||!S.okD4(G,fri)||!S.okD4(G,fri+1)) return;
      for(let k=0,f=fri;k<4;k++,f+=7){ if(!S.okD4(G,f)||!S.okD4(G,f+1)) break; if(!S.herBusy(G,f)&&!S.herBusy(G,f+1)){ fri=f; break; } }   /* 那個週五、週六已經有她的別的出遊：下一週 */
      PHONE.at(G,d0,21,[Object.assign(K(S.L.r4.ask),{ask:{id:'kx_drift_r4_ask',until:T(fri,18),opts:[{t:S.L.r4.askOpts[0],set:{KXD_R4_ANS:'fri'}},{t:S.L.r4.askOpts[1],set:{KXD_R4_ANS:'no1'}}]}})],'kx_drift_r4_ask');
      Object.assign(r,{st:'asked',fri,askDay:d0}); return; }
    if(r.st==='asked'){ const a=F.KXD_R4_ANS;
      if(a==='fri'){ delete F.KXD_R4_ANS; S.r4Plan(G,r,r.fri); return; }
      if(a==='no1'||now(G)>T(r.fri,18)){ delete F.KXD_R4_ANS; r.st='asked2';   /* 不行（沒回也一樣）＝「那週六。」*/
        PHONE.post(G,Object.assign(K(S.L.r4.sat),{ask:{id:'kx_drift_r4_ask2',until:T(r.fri+1,18),opts:[{t:S.L.r4.askOpts[0],set:{KXD_R4_ANS:'sat'}},{t:S.L.r4.askOpts[1],set:{KXD_R4_ANS:'no2'},say:[{from:KX,text:S.L.r4.ok}]}]}})); }
      return; }
    if(r.st==='asked2'){ const a=F.KXD_R4_ANS;
      if(a==='sat'){ delete F.KXD_R4_ANS; S.r4Plan(G,r,r.fri+1); return; }
      if(a==='no2'||now(G)>T(r.fri+1,18)){ delete F.KXD_R4_ANS; if(a!=='no2') PHONE.post(G,K(S.L.r4.ok)); r.st='declined'; R.r4Pick='decline'; if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; } } };   /* 再不行＝她「好。」，直接等 D5 */
  S.r4Plan=(G,r,day)=>{ r.st='planned'; r.day=day; OUT.plan(G,{id:'kx_drift_r4',ev:'ev_kx_drift_r4',day,h:19,late:0.75,place:S.L.r4.scene,title:'和可昕：'+S.L.r4.scene,travel:'開車約 30 分鐘',travelH:0.5,alarm:true}); };
  /* 修補期（D4 之後 35 天）：結束那天 <6＝不分手（KX_REPAIRED）；還在 6 以上＝D5 */
  S.repairTick=function(G,R){ if(R.repairEnd==null||R.repairDone!=null||G.day<R.repairEnd) return; R.repairDone=G.day;
    if(S.crack(G)<6) G.flags.KX_REPAIRED=true; else if(!R.r5) R.r5={st:'pending',at:now(G),via:'repair'}; };
  /* ---------- D5 分開（只在學期末）---------- */
  S.examDay=function(G,term){ const R=S.rec(G), C=R.ex&&typeof R.ex==='object'?R.ex:(R.ex={}); if(C[term]!=null) return C[term]; const r=CALENDAR.termDays(term); if(!r) return null; let d=null;
    try{ const e=typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,term,'final'):null; if(e&&e.day!=null) d=e.day; }catch(e){ d=null; }
    if(d==null||d<r.to-9) d=r.to-2; if(d>r.to-1) d=r.to-1; C[term]=d; return d; };   /* 祐廷自己期末考的最後一天（沒有＝期末考週的週五）；隔天她還在臺北 */
  S.r5Rule=function(G,R){ const r=R.r5; if(!r) return;
    if(r.st==='pending'){ const t=termOf(G.day); if(!t||t.id==='Y4S2'||S.exch(G,G.day)||r.skip===t.id||t.week<S.termWeeks(t.id)-1) return;   /* 寒暑假、交換、大四下不演 */
      const ex=S.examDay(G,t.id), to=(CALENDAR.termDays(t.id)||{}).to; if(ex==null||to==null) return;
      let m=null, m0=null; for(let d=ex+1;d<=to;d++){ if(T(d,18)<=now(G)||T(d-1,21)<(r.at||0)-0.5) continue; if(m0==null) m0=d; if(!S.herBusy(G,d)){ m=d; break; } }   /* 隔天晚上七點；那一天已經有她的別的出遊＝再隔一天（她回高雄以前）；她傳的那一則不早於 D5 成立的時候 */
      if(m0==null){ r.skip=t.id; return; }   /* 那學期來不及＝下一個學期末 */
      if(m==null) m=m0; if(now(G)<T(m-1,21)) return;   /* 期末考最後一天 21:00 起（前一晚 21:00 她傳）*/
      if(S.herBusy(G,m)) for(const q of OUT.rec(G)) if(q.state==='planned'&&q.day===m&&!/^kx_drift_/.test(String(q.id||''))&&S.isKx(G,q,null)) q.state='skipped';   /* 都排滿了：那一天她的別的出遊取消（她已經想好了）*/
      PHONE.at(G,m-1,21,[K(S.L.r5.ask)],'kx_drift_r5_msg_'+t.id);
      OUT.plan(G,{id:'kx_drift_r5',ev:'ev_kx_drift_r5',day:m,h:19,late:1,place:S.L.r5.scene,title:'和可昕：'+S.L.r5.scene,travel:'開車約 30 分鐘',travelH:0.5,alarm:true});
      Object.assign(r,{st:'planned',term:t.id,day:m}); return; }
    if(r.st==='text'&&(G.msgs||[]).some(m=>m&&m.tag==='kx_drift_r5_text')) S.end(G,'text'); };
  S.termWeeks=t=>STORY.termWeeks?STORY.termWeeks(t):16;
  /* 分開：ROM.end、旗標；她已經排好的交往版出遊、校外約會、還沒送的訊息取消 */
  S.end=function(G,how){ const F=G.flags, R=S.rec(G); if(F.KX_ENDED==='drift'||F.dating_kexin!==true||typeof ROM==='undefined') return false;
    ROM.end(G,KX,'drift'); F.KX_ENDED='drift'; F.KX_ENDED_ON=G.day; if(R.r5){ R.r5.st='done'; R.r5.how=how; } else R.r5={st:'done',how}; R.r6={st:'wait'}; S.cancelHer(G); return true; };
  S.cancelHer=function(G){ if(typeof OUT!=='undefined') for(const q of OUT.rec(G)){ if(q.state!=='planned'||/^kx_drift_r6/.test(String(q.id||''))) continue; if(S.isKx(G,q,null)) q.state='skipped'; }
    for(const t of (G.trips||[])) if(t&&t.who===KX&&(t.status==='booked'||t.status==='going')) t.status='cancelled';
    if(typeof PHONE!=='undefined'){ const P=PHONE.rec(G), mine=it=>!!it&&(PHONE.th?PHONE.th(it):(it.th||''))===TH;   /* 只拿掉她那一段（p:kexin）排著的；群組裡她的照送 */
      P.q=P.q.filter(q=>{ if(/^kx_drift_/.test(String(q.tag||''))) return true; const its=q.items||[], keep=its.filter(it=>!mine(it)); if(keep.length===its.length) return true; q.items=keep; return keep.length>0; }); } };
  /* ---------- D6 朋友 ---------- */
  S.occasions=function(G,E){ const lo=E+S.D6_QUIET+1, hi=lo+S.D6_LOOK, C=[];   /* 自然的日子：祐廷放榜、考上（AA_384 第 4 項：祐廷的生日拿掉）*/
    S.PASS.forEach((p,i)=>{ const d=DK(p.key); let on=false; try{ on=d!=null&&d>=lo&&d<=hi&&!!p.track(G); }catch(e){ on=false; } if(on) C.push({day:d,kind:'pass',i}); });
    return C.sort((a,b)=>a.day-b.day); };
  /* AA_384 E 節（企劃線 1a4f2eb3；AA 10-22 09:45 選①）：午餐那個週六她在高雄（D5 在春季學期末＝第 61 天落在暑假；AA_276 寒暑假回高雄）——
     第 61 天那一則照傳（手機在哪裡都收得到），午餐順延到開學以後第一個週六（她回臺北），那週週四 21:00 她傳「週六中午，公館。吃個飯。」；
     選項、不行照 D6（S.r6No）；不在高雄另外約、不加新地點 */
  S.herHome=(G,d)=>{ if(typeof STORY==='undefined'||!STORY.presence) return false; const p=STORY.presence(KX,Object.assign({},G,{day:d,hour:12,weekday:wdOf(d)})); return !!p&&p.here===false&&p.kind==='home'; };
  S.r6Thu=function(G,day){ const sat=S.nextSat(G,day); if(sat==null||!S.herHome(G,sat)) return null;
    const i=S.TERMS.indexOf(termAt(day)), nx=i>=0?S.TERMS[i+1]:null, r=nx&&CALENDAR.termDays?CALENDAR.termDays(nx):null; if(!r) return null;
    const s2=S.nextSat(G,r.from-1,d=>!S.herHome(G,d)); return s2!=null&&s2-2>day?s2-2:null; };   /* 開學以後第一個週六（她在臺北）的週四；沒有下一個學期＝照舊 */
  S.r6Send=function(G,r,L,day,h){ PHONE.at(G,day,h,L.map(K),'kx_drift_r6_msg'); r.st='sent'; r.msgDay=day; const thu=S.r6Thu(G,day); if(thu!=null){ r.post=thu; S.r6Ask(G,r,thu,21,1); } else S.r6Ask(G,r,day,h+1/6,1); };
  S.r6Ask=function(G,r,day,h,n){ const sat=S.nextSat(G,day), tag='kx_drift_r6_ask'+n, until=T(sat,11.5);
    PHONE.at(G,day,h,[Object.assign(K(S.L.r6.lunch),{ask:{id:tag,until,opts:[{t:S.L.r6.lunchOpts[0],set:{KXD_R6_ANS:'yes'}},{t:S.L.r6.lunchOpts[1],set:{KXD_R6_ANS:'no'}}]}})],tag);
    Object.assign(r,{st:'asked',sat,untilAsk:until,n}); };
  S.r6No=function(G,r){ if((r.n|0)<2) S.r6Ask(G,r,r.sat+1,21,(r.n|0)+1); else { r.st='friend'; r.friend=G.day; } };   /* 不行就下一個週六，再不行就不約、照朋友 */
  S.r6Rule=function(G){ const F=G.flags, R=S.rec(G), r=R.r6||(R.r6={st:'wait'}), E=F.KX_ENDED_ON; if(E==null||typeof PHONE==='undefined') return;
    if(r.st==='wait'&&G.day>=E+S.D6_QUIET+1){ r.cand=S.occasions(G,E); r.st='occ'; }
    if(r.st==='occ'){ const h=Math.max(21,(+G.hour||0)%24); let c=r.cand[0];
      while(c&&c.kind==='pass'&&now(G)>=T(c.day,21)&&!S.PASS[c.i].ok(G)){ r.cand.shift(); c=r.cand[0]; }   /* 放榜那天 21:00（結果 15:00 出來）沒考上：不是可以恭喜的日子 */
      if(!c){ if(now(G)>=T(G.day,21)||G.day>E+S.D6_QUIET+1) S.r6Send(G,r,G.day>=DK(S.INTERN_KEY)?S.L.r6.news:S.L.r6.newsEarly,G.day,h); return; }   /* 都沒有＝她自己的好消息 */
      if(G.day<c.day||now(G)<T(c.day,21)) return; S.r6Send(G,r,S.L.r6.pass,G.day,h); return; }
    if(r.st==='asked'){ const a=F.KXD_R6_ANS;
      if(a==='yes'){ delete F.KXD_R6_ANS; r.st='planned'; OUT.plan(G,{id:'kx_drift_r6_'+r.sat,ev:'ev_kx_drift_r6',day:r.sat,h:12.5,late:0.75,place:S.L.r6.scene,title:'和可昕：'+S.L.r6.scene,travel:'騎車約 10 分鐘',travelH:1/6,alarm:true}); return; }
      if(a==='no'||now(G)>r.untilAsk){ delete F.KXD_R6_ANS; S.r6No(G,r); } } };

  /* ---------- 分開以後當朋友（AA_384）----------
     S.drift：這個存檔是「慢慢分手」分開的（KX_ENDED drift、現在沒有和她交往）；S.frOn：而且已經照朋友了（D6 那頓午餐以後；午餐沒約成＝照朋友那天起，AA_384 第 1 項）*/
  S.drift=G=>!!G&&!!G.flags&&G.flags.KX_ENDED==='drift'&&G.flags.dating_kexin!==true&&law(G);
  S.frOn=G=>{ if(!S.drift(G)) return false; const R=G.flags.KX_DRIFT; return !!R&&!!R.r6&&R.r6.st==='friend'; };
  S.frRot=(G,k,c)=>{ const R=S.rec(G), W=R.fr&&typeof R.fr==='object'?R.fr:(R.fr={}), i=(W[k]|0)%c.length; W[k]=i+1; return c[i]; };   /* 同一種輪流（三則、兩則輪流）*/
  /* 祐廷在國外（日本、美國；遊戲的時鐘是當地時間）：她照她那邊（臺灣）的時間回——可昕沒有自己的回覆時間（MSG 的預設：5～30 分鐘、00:30～08:00 睡了）。
     不在國外＝null（照 MSG 原本的 replyAt）*/
  S.frReplyAt=function(G){ const z=tz(G,G.day); if(!z||typeof MSG==='undefined'||!MSG.timing) return null; const Tm=MSG.timing(KX), tw=now(G)-z, d=Math.floor(tw/24+1e-9), h=tw-d*24, sm=(a,b)=>a+((G.day*37+11)%(Math.max(1,b-a+1)));
    const asleep=Tm.sleep!=null&&(Tm.sleep>=12?(h>=Tm.sleep||h<Tm.wake):(h>=Tm.sleep&&h<Tm.wake)); let at, late=false, imm=false;
    if(asleep){ at=T((Tm.sleep>=12&&h>=Tm.sleep)?d+1:d,Tm.wake+sm(0,20)/60); late=true; } else { const m=sm(Tm.free[0],Tm.free[1]); at=tw+m/60; imm=m<=2; }
    const loc=at+z, ld=Math.floor(loc/24+1e-9); return {day:ld,h:+(loc-ld*24).toFixed(4),late,immediate:imm,kxTw:true}; };
  /* 她回的那一刻、她那邊（臺灣）的時間：情況版照這個判斷（深夜、考試週、放假在高雄）——隔天早上才回的，不用「還沒睡」那一則 */
  S.frHerG=function(G){ const at=typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,KX):{day:G.day,h:+G.hour||0}, t=T(at.day,at.h)-tz(G,G.day), d=Math.floor(t/24+1e-9);
    return {G:Object.assign({},G,{day:d,hour:+(t-d*24).toFixed(4),weekday:wdOf(d)}),at}; };
  S.FR_ORDER=['放假、在高雄','考試週','深夜'];   /* 情況版的順序（msg3d.js：在國外 → 放假 → 考試週 → 深夜；在國外是 S.frAbroad）*/
  S.frAbroad=function(G,Gh,at){ const r=STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null; if(!r||!(STORY.abroad&&STORY.abroad(G))||(at&&at.late)) return null;
    const h=(+Gh.hour||0)%24; if(!(h>=23.5||h<5)) return null;   /* 只在她那邊 23:30 以後（MSG_POOL 那兩則的 variantNote）*/
    const tag=r==='US'?'美國路線':'日本路線', P=typeof MSG_POOL!=='undefined'&&MSG_POOL.people&&MSG_POOL.people[KX];
    return ((P&&P.replies)||[]).find(e=>e&&e.topic==='chat'&&e.variant==='祐廷在國外'&&(e.tags||[]).includes(tag))||null; };   /* 照 L 層那兩則（美國、日本各一），朋友也用 */
  S.frPick=function(G,topic,sub){ const keys=topic==='share'?['share_'+(sub||'cat'),'share']:[topic], all=S.LF.msg.filter(e=>keys.includes(e.topic)); if(!all.length) return null;
    const H=S.frHerG(G), Gh=H.G;
    if(topic==='chat'){ const ab=S.frAbroad(G,Gh,H.at); if(ab) return ab; }
    for(const v of S.FR_ORDER){ const c=all.filter(e=>e.variant===v&&typeof MSG!=='undefined'&&MSG.sitOk&&MSG.sitOk(Gh,KX,v,{late:!!H.at.late},e)===true); if(c.length) return S.frRot(G,topic+'|'+v,c); }
    const gen=all.filter(e=>!e.variant); return gen.length?S.frRot(G,topic,gen):null; };
  S.frPick2=function(G,topic){ const e=S.LF.msg2.find(x=>x.topic===topic); return e?{e,act:null}:null; };   /* 生日快樂、新年快樂（謝謝、還好嗎不開）*/

  /* ---------- 「她會約」：一學期一次的午餐（AA_384 第 3 項）----------
     照朋友的下一個學期起（照朋友那天在寒暑假＝前一個學期的下一個）、到大四下；交換那一學期不排（寒暑假本來就不是第 6 週）。
     第 6 週週四 21:00 她傳「週六中午，公館。予樂也來。」（好。／那天不行。）；那天不行＝她回「好。下次。」、那學期不排；到週六 11:30 都沒回＝那學期也不排（不傳）。
     週六 12:30 公館（出遊，當面）：三套輪流（演過一套換下一套，R.r7.n）；沒到＝她傳一則，不扣任何數字。記錄 KX_DRIFT.r7＝{n, t:{學期:{st, thu, sat, until}}} */
  S.r7From=G=>{ const r=S.rec(G).r6; if(!r||r.st!=='friend') return null; const i=S.idx(termAt(r.friend!=null?r.friend:G.day)); return i<0?0:i+1; };
  S.r7Set=G=>((S.rec(G).r7||{}).n|0)%S.LF.lunch.sets.length;
  S.r7Rule=function(G){ const F=G.flags, R=S.rec(G), t=termOf(G.day); if(!t||typeof PHONE==='undefined'||typeof OUT==='undefined') return; const i=S.idx(t.id), i0=S.r7From(G); if(i0==null||i<0||i<i0) return;   /* S.TERMS 只到大四下 */
    const X=R.r7&&typeof R.r7==='object'?R.r7:(R.r7={n:0,t:{}}); if(!X.t||typeof X.t!=='object') X.t={}; const x=X.t[t.id], LL=S.LF.lunch;
    if(!x){ const thu=STORY.termDay?STORY.termDay(t.id,6,4):null; if(thu==null) return; const sat=thu+2, until=T(sat,11.5);
      if(S.exch(G,thu)||S.exch(G,sat)){ X.t[t.id]={st:'exch'}; return; }   /* 交換那一學期不排 */
      if(now(G)<T(thu,21)) return; if(now(G)>until){ X.t[t.id]={st:'late',thu,sat}; return; }   /* 讀進來的時候那一週已經過了：這學期不排 */
      const tag='kx_drift_r7_ask_'+t.id;
      PHONE.at(G,thu,21,[Object.assign(K(LL.ask),{ask:{id:tag,until,opts:[{t:LL.opts[0],set:{KXD_R7_ANS:t.id+':yes'}},{t:LL.opts[1],set:{KXD_R7_ANS:t.id+':no'},say:[{from:KX,text:LL.no}]}]}})],tag);
      X.t[t.id]={st:'asked',thu,sat,until}; return; }
    if(x.st==='asked'){ let a=F.KXD_R7_ANS; if(a!=null&&String(a).split(':')[0]!==t.id){ delete F.KXD_R7_ANS; a=null; }   /* 別的學期留下來的答案不算 */
      if(a===t.id+':yes'){ delete F.KXD_R7_ANS; x.st='planned'; OUT.plan(G,{id:'kx_drift_r7_'+t.id,ev:'ev_kx_drift_r7',day:x.sat,h:12.5,late:0.75,place:S.L.r6.scene,title:'和可昕、予樂：'+S.L.r6.scene,travel:'騎車約 10 分鐘',travelH:1/6,alarm:true,term:t.id}); return; }
      if(a===t.id+':no'||now(G)>x.until){ if(a===t.id+':no') delete F.KXD_R7_ANS; x.st=a===t.id+':no'?'declined':'noreply'; } } };

  /* ---------- 規則（STORY.PHONE_RULES：空下來的每一格、跳過時間每小時）---------- */
  S.rule=function(G){ if(!G||!G.flags||!law(G)||typeof OUT==='undefined'||typeof PHONE==='undefined') return; const F=G.flags;
    if(F.KX_ENDED==='drift'&&F.dating_kexin!==true){ S.r6Rule(G); S.r7Rule(G); return; }
    if(F.dating_kexin!==true||!S.inRange(G)) return; const R=S.rec(G);
    if(!S.on(G)){ R.gapDay=Math.max(R.gapDay,G.day); S.freeze(G,R); return; }   /* 中途開始了另一段：停住、數字凍結 */
    S.scanOuts(G,R); S.scanTrips(G,R); S.gapTick(G,R); S.th(G,R); S.repairTick(G,R); S.r2Rule(G,R); S.r3Rule(G,R); S.r4Rule(G,R); S.r5Rule(G,R); };
  /* 停住的時候：排好的 D 場次不演（之後能繼續的退回等著）*/
  S.freeze=function(G,R){ for(const q of OUT.rec(G)){ const id=String(q.id||''); if(q.state!=='planned'||!/^kx_drift_r[2-5]/.test(id)) continue; q.state='skipped';
      if(/^kx_drift_r2/.test(id)&&R.r2) R.r2.st='void'; if(id==='kx_drift_r3'&&R.r3) R.r3.st='pending'; if(id==='kx_drift_r4'&&R.r4) R.r4.st='pending'; if(id==='kx_drift_r5'&&R.r5) R.r5.st='pending'; } };
  /* 到家以後：手機自動打開她那一段，祐廷傳「到了。」，她回「嗯。」（STORY.TICKS：出遊演完、空下來的第一格）*/
  let homeBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['kxdrift3d:homeBusy']=()=>{ homeBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G, R=G&&G.flags&&G.flags.KX_DRIFT; if(homeBusy||!R||!R.r5||!R.r5.home||typeof PHONE==='undefined') return false; R.r5.home=false; homeBusy=true;
    S.homePhone(GM).catch(e=>console.warn('KXDRIFT.homePhone',e)).finally(()=>{ homeBusy=false; }); return true; };
  S.homePhone=async function(GM){ const G=GM.G; PHONE.post(G,{th:TH,from:'player',who:null,text:S.L.r5.home[0]}); PHONE.post(G,Object.assign(K(S.L.r5.home[1]),{tag:'kx_drift_r5_home'}));
    if(GM.phoneBadge) GM.phoneBadge(); if(GM.phoneThread) await GM.phoneThread(TH); return true; };

  /* ---------- 各場的結果（事件的 afterOuting／outingMissed）---------- */
  S.after=async function(G,GM,q,key){ const R=S.rec(G), k=takePick(G,key);
    if(key==='r1'){ if(R.r1) R.r1.st='done'; if(k===1||k===2){ S.add(G,k,'r1'); S.r2Start(G,R,'r1'); } return; }   /* +0／+1／+2；吵起來＝D2 */
    if(key==='r2'){ if(R.r2) R.r2.st='done'; if(k===1) S.add(G,1,'r2'); return; }
    if(key==='r3'){ if(R.r3) R.r3.st='done'; if(k===1) S.add(G,1,'r3');
      if(S.yuleContact(G)){ const y=local(G,q&&q.twDay!=null?q.twDay:G.day,23); PHONE.at(G,y.day,y.h,[{th:'p:yule',from:'yule',name:'予樂',text:S.L.r3.yule}],'kx_drift_r3_yule'); } return; }   /* 同一個晚上 23:00（臺灣時間），只有這一次 */
    if(key==='r4'){ if(R.r4) R.r4.st='done'; R.r4Pick=k;
      if(k===0&&typeof ROM!=='undefined'&&ROM.mend) ROM.mend(G,KX);   /* 歸零、進修補期 */
      if(k===0||k===1) R.repairEnd=(q?q.day:G.day)+S.REPAIR; else if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; return; }
    if(key==='r5'){ S.end(G,'meet'); R.r5.home=true; return; }
    if(key==='r5c'){ S.end(G,'call'); return; }
    if(key==='r6'){ const r=R.r6||(R.r6={}); r.st='friend'; r.friend=G.day; r.lunch=G.day; return; }
    if(key==='r7'){ const X=R.r7||(R.r7={n:0,t:{}}), x=X.t&&q&&X.t[q.term]; X.n=(X.n|0)+1; if(x) x.st='done'; } };   /* 演過一套換下一套 */
  S.miss=function(G,GM,q,key){ const R=S.rec(G);
    if(key==='r1'){ if(R.r1) R.r1.st='missed'; if(!S.on(G)) return; S.add(G,1,'r1_missed'); const a=(R.r1&&R.r1.area)||'公館', L=S.L.r1.missed.slice(); if(a!=='公館') L[0]=L[0].replace('公館',a);   /* 「你昨天在公館。」：地點照實際那一個 */
      PHONE.at(G,q.day+1,12,L.map(K),'kx_drift_r1_missed_'+q.day); S.r2Start(G,R,'r1'); return; }
    if(key==='r2'){ if(R.r2) R.r2.st='missed'; if(S.on(G)) S.add(G,1,'r2_missed'); return; }   /* 約好的出遊沒到 */
    if(key==='r3'){ if(R.r3) R.r3.st='missed'; return; }
    if(key==='r4'){ if(R.r4) R.r4.st='missed'; R.r4Pick='noshow'; PHONE.at(G,G.day,Math.max(+G.hour||0,q.h+0.75),[K(S.L.r4.ok)],'kx_drift_r4_noshow'); if(!R.r5) R.r5={st:'pending',at:now(G),via:'r4'}; return; }   /* 沒到：她傳「好。」，等 D5（+0）*/
    if(key==='r5'){ if(R.r5) R.r5.st='call'; OUT.plan(G,S.callOut('kx_drift_r5_call','ev_kx_drift_r5_call',q.day,21)); return; }   /* 20:00 還沒來：21:00 她打來 */
    if(key==='r5c'){ if(R.r5) R.r5.st='text'; PHONE.at(G,q.day+1,12,[K(S.L.r5.text)].concat(S.L.r5.talk.map(K)),'kx_drift_r5_text'); return; }   /* 電話也沒接：隔天 12:00 文字版 */
    if(key==='r6'){ const r=R.r6; if(r&&r.st==='planned') S.r6No(G,r); return; }
    if(key==='r7'){ const X=R.r7, x=X&&X.t&&q?X.t[q.term]:null; if(x) x.st='missed';   /* 沒到：她傳一則，不扣任何數字（AA_384 第 3 項）*/
      PHONE.at(G,q.day,Math.max(q.day===G.day?(+G.hour||0):0,q.h+(q.late!=null?q.late:0.75)),[K(S.LF.lunch.missed)],'kx_drift_r7_missed_'+(q.term||q.day)); } };

  /* ---------- 事件（STORY_EVENTS；trigger 'outing'，由這個檔排）---------- */
  const say=t=>/^（/.test(t)?{speaker:null,text:t}:{speaker:KX,text:t};
  const choiceBlock=(key,opts)=>{ const out=[{choice:opts.map((o,i)=>({text:o.t,set:{KXD_PICK:key+':'+i},goto:key+'_'+i}))}];
    opts.forEach((o,i)=>{ out.push({label:key+'_'+i}); for(const t of o.say) out.push(say(t)); out.push({goto:key+'_end'}); }); out.push({label:key+'_end'}); return out; };
  const area=G=>((G.flags.KX_DRIFT||{}).r1||{}).area||'公館';
  const L=S.L, base=(id,title,hours,key,dlg)=>({id,title,participants:[KX],location:'any',trigger:'outing',background:'dark',hours,kxAway:true,
    dialogue:dlg,afterOuting:(G,GM,q)=>S.after(G,GM,q,key),outingMissed:(G,GM,q)=>S.miss(G,GM,q,key)});   /* kxAway：結尾不接她的閒聊階梯、沒回的訊息（outings3d.js）；title＝稿上那一場的名字（開場字幕、筆記本）*/
  S.EVS=[
    base('ev_kx_drift_r1','予樂看到你',0.25,'r1',[{scene:'電話'},say(L.r1.ring)].concat(Object.keys(L.r1.where).map(a=>Object.assign({if:{custom:G=>area(G)===a}},say(L.r1.where[a]))),L.r1.lines.map(say),choiceBlock('r1',L.r1.opts))),
    Object.assign(base('ev_kx_drift_r1b','她自己的不安',0,'r1b',L.r1b.lines.map(t=>say(t.replace('{她}','{flag:KXD_HER}'))).concat(choiceBlock('r1b',L.r1b.opts))),{afterOuting:undefined,outingMissed:undefined}),   /* 不排出遊：見面的開頭用 EVENTS.runLines 演（S.r1bPlay）*/
    base('ev_kx_drift_r2','冷一陣子',1.5,'r2',[{scene:L.r2.scene,bg:'nccu_food'}].concat(L.r2.lines.map(say),choiceBlock('r2',L.r2.opts))),
    base('ev_kx_drift_r3','各自忙',0.5,'r3',[{scene:'視訊',bg:'video'},Object.assign({if:{custom:G=>S.metShao(G)}},say(L.r3.first)),Object.assign({unless:{custom:G=>S.metShao(G)}},say(L.r3.first.replace(L.r3.shao,L.r3.noShao)))].concat(L.r3.lines.map(say),choiceBlock('r3',L.r3.opts))),   /* 還沒見過邵鈞：「邵鈞」換成「我們讀書會一個人」*/
    base('ev_kx_drift_r4','講開',1.5,'r4',[{scene:L.r4.scene,bg:'nccu_food'}].concat(L.r4.lines.map(say),choiceBlock('r4',L.r4.opts))),
    base('ev_kx_drift_r5','分開',0.5,'r5',[{scene:L.r5.scene,bg:'nccu_dorm'}].concat(L.r5.talk.map(say),choiceBlock('r5',L.r5.opts),L.r5.close.map(say))),
    base('ev_kx_drift_r5_call','分開',0.25,'r5c',[{scene:'電話'}].concat(L.r5.callOpen.map(say),L.r5.talk.map(say),choiceBlock('r5c',L.r5.opts),L.r5.callClose.map(say))),
    base('ev_kx_drift_r6','朋友',1.5,'r6',[{scene:L.r6.scene,bg:'gongguan'}].concat(L.r6.lines.map(say))),
    base('ev_kx_drift_r7','她會約',1.5,'r7',[{scene:L.r6.scene,bg:'gongguan'}].concat(...S.LF.lunch.sets.map((set,k)=>set.map(t=>Object.assign({if:{custom:G=>S.r7Set(G)===k}},say(t)))))) ];   /* AA_384 第 3 項：一學期一次的午餐（三套輪流：S.r7Set）*/
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);

  /* ---------- 掛上去（包住別的系統；不改那些檔）---------- */
  const once=!STORY._kxd; STORY._kxd=true;   /* 同一頁只掛一次（重複載入也不會算兩次）*/
  if(once&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.rule(G));
  if(once&&Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
  if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM._kxd){ ROM._kxd=true; const cs0=ROM.canStart; ROM.canStart=function(G,id){ if(id===KX&&G&&G.flags&&G.flags.KX_ENDED==='drift') return false; return cs0.apply(this,arguments); }; }   /* 不能復合 */
  if(typeof OUT!=='undefined'){
    if(once&&Array.isArray(OUT.BEFORE)) OUT.BEFORE.push((GM,q,ev)=>S.before(GM,q,ev));
    if(once&&Array.isArray(OUT.AFTER)) OUT.AFTER.push(async(GM,q,ev)=>{ const G=GM&&GM.G, F=(G&&G.flags)||{}, R=F.KX_DRIFT; if(!R||!F.KX_REPAIRED||R.repairSaid!=null||F.dating_kexin!==true) return;   /* 修補成功：下一次「我們的日子」見面，她說一次 */
      if(!q||!(q.kxod||/^kx_od_/.test(String(q.id||'')))||S.kind(G,q,ev)!=='meet') return; R.repairSaid=G.day; await GM.say({name:nm(KX),charId:KX},L.repair); });
    if(OUT.onMissed&&!OUT._kxd){ OUT._kxd=true; const m0=OUT.onMissed; OUT.onMissed=function(GM,q){ try{ S.missed(GM&&GM.G,q); }catch(e){ console.warn('KXDRIFT.missed',e); } return m0.apply(this,arguments); }; } }
  if(typeof PGDATE!=='undefined'&&PGDATE.kxArrive&&!PGDATE._kxd){ PGDATE._kxd=true; const ka0=PGDATE.kxArrive;   /* 準時到 −1：一週最多一次（AA_351 第 2 節；K5 也在同一個上限裡）。只管大二上～大四下：畢業以後的格子照 PGDATE 原本那一套、不設上限（AA_351 第 1 節「最晚：大四下」）*/
    PGDATE.kxArrive=function(G,q){ const cap=!!(q&&G&&G.flags&&law(G)&&S.inRange(G)); if(cap&&!(now(G)-T(q.day,q.h)>0.25+1e-6)&&S.crack(G)>0&&S.capUsed(G,'arrive')) return 0; const r=ka0.apply(this,arguments); if(r===-1&&cap) S.rec(G).wk.arrive=monOf(G.day); if(r===1) S.th(G); return r; };
    const km0=PGDATE.kxMissed; if(km0) PGDATE.kxMissed=function(G){ const r=km0.apply(this,arguments); if(r===1&&G&&G.flags) S.th(G); return r; }; }
  if(typeof INV!=='undefined'&&INV.flow&&!INV._kxd){ INV._kxd=true; const fl0=INV.flow, st0=INV.startTogether;
    INV.flow=async function(GM,id,n,together){ const r=await fl0.apply(this,arguments); try{ if(r&&typeof r==='object'&&/^iv/.test(String(r.id||''))&&(r.state==='accepted'||r.state==='going')) await S.invTell(GM,r); }catch(e){ console.warn('KXDRIFT.flow',e); } return r; };
    if(st0) INV.startTogether=async function(GM,iv,n){ try{ if(iv&&!iv.kxd) await S.invTell(GM,iv); }catch(e){ console.warn('KXDRIFT.startTogether',e); } return st0.apply(this,arguments); }; }   /* 約「現在」、兩個人都在那裡＝直接開始：開始以前先問 */
  if(typeof DATE!=='undefined'&&DATE.menu&&!DATE._kxd){ DATE._kxd=true; const dm0=DATE.menu; DATE.menu=async function(GM,id,n){ const t=await dm0.apply(this,arguments); try{ if(t&&t.ok&&t.trip) await S.dateTell(GM,t); }catch(e){ console.warn('KXDRIFT.date',e); } return t; }; }
  if(typeof HV!=='undefined'&&HV.ask&&!HV._kxd){ HV._kxd=true; const ha0=HV.ask, hm0=HV.museumAsk;
    HV.ask=async function(GM,id){ const d=await ha0.apply(this,arguments); try{ if(typeof d==='number') await S.hvTell(GM,id,d); }catch(e){ console.warn('KXDRIFT.hv',e); } return d; };
    if(hm0) HV.museumAsk=async function(GM,id){ const d=await hm0.apply(this,arguments); try{ if(typeof d==='number') await S.hvTell(GM,id,d); }catch(e){ console.warn('KXDRIFT.hv',e); } return d; }; }
  if(typeof TERMEND!=='undefined'&&TERMEND.plan&&!TERMEND._kxd){ TERMEND._kxd=true; const tp0=TERMEND.plan;   /* 分開了、或這個學期末要演 D5：可昕的學期末約會不排 */
    TERMEND.plan=function(G,w){ const P=tp0.apply(this,arguments); try{ if(P&&P.kx){ const F=G.flags||{}, r5=F.KX_DRIFT&&F.KX_DRIFT.r5;
        if(F.KX_ENDED==='drift'||(r5&&r5.st!=='pending'&&r5.term===w.id)) P.kx=false; } }   /* D5 在期末考最後一天 21:00 排定（她的學期末約會那一則在隔天 20:45 以後才傳）*/catch(e){ console.warn('KXDRIFT.termend',e); } return P; }; }
  /* K5 的「那一週有她自己的事件」（KXOD.herWeek，AA_354 第 1 節「她的出遊」）：D1、D5 她打來的電話、D3 的視訊不是出遊，不讓那一週的「我們的日子」停掉 */
  if(typeof KXOD!=='undefined'&&KXOD.herWeek&&!KXOD._kxd){ KXOD._kxd=true; const hw0=KXOD.herWeek;
    KXOD.herWeek=function(G){ const hide=typeof OUT!=='undefined'?OUT.rec(G).filter(q=>/^kx_drift_(r1_|r3$|r5_call$)/.test(String(q.id||''))&&(q.state==='planned'||q.state==='done')):[]; const st=hide.map(q=>q.state);
      for(const q of hide) q.state='kxd_hide'; try{ return hw0.apply(this,arguments); } finally { hide.forEach((q,i)=>{ q.state=st[i]; }); } }; }
  if(typeof PG!=='undefined'&&PG.exLines&&!PG._kxd){ PG._kxd=true; const ex0=PG.exLines; PG.exLines=function(G,id){ if(id===KX&&G&&G.flags&&G.flags.KX_ENDED==='drift') return null; return ex0.apply(this,arguments); };   /* 尾聲不用前任那一版 */
    /* 尾聲的朋友版（AA_384 第 2 項）：她坐在同一桌，照 EPI_ORDER 現在的位置（最後一個）；旁白＋兩句 */
    const ep0=PG.epiPresent, el0=PG.epiLine;
    if(ep0) PG.epiPresent=function(G,id){ if(id===KX&&S.drift(G)) return true; return ep0.apply(this,arguments); };
    if(el0) PG.epiLine=function(G,id){ if(id===KX&&S.drift(G)) return S.LF.epi.map(x=>x.slice()); return el0.apply(this,arguments); };
    /* 畢業典禮那天 12:00 她傳的（AA_384 第 7 項；PG.MSGS 的 pg_kx_ex＝POSTGRAD_LINES.PHONE.kexinEx）：分開以後當朋友的換成兩句；被發現、劈腿那一條照舊「恭喜。」*/
    const gm=Array.isArray(PG.MSGS)?PG.MSGS.find(m=>m&&m.tag==='pg_kx_ex'):null;
    if(gm&&typeof gm.items==='function'){ const it0=gm.items; gm.items=function(G){ if(S.drift(G)) return S.LF.grad.map(K); return it0.apply(this,arguments); }; } }
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._kxd){ MSG._kxd=true; const op0=MSG.open, tp0=MSG.topics, sd0=MSG.send, pk0=MSG.pick, p20=MSG.pick2, ra0=MSG.replyAt;
    MSG.open=function(G,id){ if(id===KX&&S.drift(G)) return {ok:true,mode:'kxdrift'}; return op0.apply(this,arguments); };   /* 分開以後照樣傳得到（原本「分開以後不開」）*/
    /* 話題：照朋友以前（前 60 天、到 D6 那頓午餐）沒有晚安；照朋友以後是朋友層——晚安（兩則輪流）照時間開、不看熟悉度（MSG 原本的晚安要第 4 階；她知道祐廷和別人交往中照 MSG 不開）*/
    MSG.topics=function(G,id){ const r=tp0.apply(this,arguments); if(id!==KX||!S.drift(G)) return r; if(!S.frOn(G)) return r.filter(q=>q.k!=='night'&&q.k!=='course');
      const out=r.filter(q=>q.k!=='course'), h=(+G.hour||0)%24, nt=(MSG.TOPICS||[]).find(q=>q.k==='night');
      if(nt&&!out.some(q=>q.k==='night')&&!(h<21.5&&h>=5)&&!(MSG.takenFor&&MSG.takenFor(G,KX))){ const i=out.findIndex(q=>!!MSG.isT2&&MSG.isT2(q.k)); out.splice(i<0?out.length:i,0,nt); }
      return out; };
    /* 回什麼：照朋友以後用朋友層（S.LF）；第二批只有生日快樂、新年快樂 */
    if(pk0) MSG.pick=function(G,id,topic,sub,ctx){ if(id===KX&&S.frOn(G)) return S.frPick(G,topic,sub); return pk0.apply(this,arguments); };
    if(p20) MSG.pick2=function(G,id,topic,peek){ if(id===KX&&S.frOn(G)) return S.frPick2(G,topic); return p20.apply(this,arguments); };
    if(ra0) MSG.replyAt=function(G,id){ if(id===KX&&S.frOn(G)){ const r=S.frReplyAt(G); if(r) return r; } return ra0.apply(this,arguments); };   /* 祐廷在國外：照她那邊的時間回 */
    MSG.send=function(G,id,topic,sub){ if(id===KX&&G&&G.flags){ const s=S.shortNow(G); if(s){ const r=S.shortSend(G,id,topic,sub,s.lines,s.key); if(r) return r; } } return sd0.apply(this,arguments); }; }
  /* 只回短的：D2 之後兩天（交往中）、D6 分開以後到吃完那頓午餐（照順序）*/
  S.shortNow=function(G){ const F=G.flags||{}, R=F.KX_DRIFT; if(!R) return null;
    if(F.dating_kexin===true&&R.r2&&now(G)>=R.r2.at&&now(G)<R.r2.until) return {lines:L.r2.short,key:'r2si'};
    if(F.KX_ENDED==='drift'&&F.dating_kexin!==true&&!(R.r6&&R.r6.st==='friend')) return {lines:L.r6.short,key:'r6si'}; return null; };
  S.shortSend=function(G,id,topic,sub,lines,key){ if(typeof MSG==='undefined'||typeof PHONE==='undefined'||!MSG.canSend(G,id)||!MSG.topics(G,id).some(q=>q.k===topic)) return null;
    const text=MSG.playerText(G,id,topic,sub), R=S.rec(G), i=(R[key]|0)%lines.length; R[key]=(R[key]|0)+1; PHONE.post(G,{th:TH,from:'player',who:null,text}); MSG.rec(G).sent[id]=G.day;
    const at=S.replyAt(G); PHONE.at(G,at.day,at.h,[K(lines[i])],null); return {ok:true,text,at,short:true}; };
  return S;
})();
