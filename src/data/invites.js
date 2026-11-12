/* 邀約的資料（D54 ⑥「訊息、朋友、邀約」；使用者 2026-10-11 的七點，原文在企劃分支 AA_70 第 0 節）：
   1 手機可以聊天、看課表、地圖、筆記；2 認識的朋友才有聯絡方式；3 當面或用手機約去 Café、總圖、公館吃飯、溫州街散步；
   4 NPC 答不答應看日程、關係、個性、既有約定；5 答應後可以一起走過去；6 NPC 也會約、拒絕可以提改天；7 日常不一定推進戀愛或好感。
   一般規則在 src/invites3d.js。每個人的個性（AA_70、BB_70 的「被邀約時」「主動邀約」「一起走路時聊什麼」）是劇情內容，
   **使用者批准後才填 people**；沒填的人照一般規則，結果用旁白寫（不替人物編台詞）。 */
const INVITE_DATA={
  /* 可以約去的地方（使用者指定的四個）。minStage：關係至少要到哪一階（SOCIAL.STAGES）——
     有理由的（念書、寫報告、喝咖啡）剛認識就可以；吃飯要熟一點；散步這種「沒有理由的」要是朋友（使用者第 4 點的「關係」；AA_70 1-3 的方向）。
     stay：一起待多久（小時）；memory：留下的小記憶（SOCIAL 的記憶標籤）；rainTo：下雨時改去哪裡 */
  places:[
    {id:'cafe',    zone:'cafe',         name:'2:30 AM',  verb:'去 2:30 AM 坐坐',verbStudy:'去 2:30 AM 念書',   kind:'reason', minStage:'ACQUAINTANCE', stay:1,    memory:'CAFE_AFTERNOON',  sitAct:'read', cats:['sit','study']},   /* 念書那一類的選項字 verbStudy：AA_702（企劃線 0babfd524）；2:30 AM 也能約念書（使用者 2026-11-05「能約念書的地方 應該要有各咖啡館吧 連2.30都不能?」）*/
    {id:'library', zone:'library_hall', name:'總圖',         verb:'去總圖一起念書',       kind:'reason', minStage:'ACQUAINTANCE', stay:1.5,  memory:'STUDIED_TOGETHER', sitAct:'read', sitAt:{lead:true,lv:1,away:3,alt:'library'}},   /* sitAt（INV-SIT-TOGETHER-1104、AA_649）：到了大廳她帶路走到二樓（lv 1）的長桌、兩個人坐下才開演；離入口至少 3 m；二樓坐滿＝去三樓閱覽區（區域 library）*/
    {id:'noodle',  zone:'noodle',       name:'公館燒臘',     verb:'去公館燒臘吃飯', kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat'},
    {id:'wenzhou', zone:'wenzhou',      name:'溫州街',       verb:'去溫州街散步',         kind:'walk',   minStage:'FRIEND',       stay:0.75, memory:'WALKED_TOGETHER', sitAct:'wait', rainTo:'cafe'},
    /* 溫州街的新店（DL-12；AA_164 2-1、2-3，AA-B 定）：days＝星期幾可以約（0＝週日）、hours＝那段時間裡（開始到結束都要在裡面）*/
    {id:'brunch',  zone:'wz_brunch',    name:'SUNNY SIDE',   verb:'去 SUNNY SIDE 吃早午餐', kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat', days:[0,6], hours:[8,13]},
    {id:'teahouse',zone:'wz_teahouse',  name:'一盞',         verb:'去一盞喝茶',           kind:'reason', minStage:'FRIEND',       stay:1.25, memory:'TEAHOUSE_TEA',    sitAct:'sit', days:[0,3,4,5,6], hours:[12,19]},
    /* 一起運動的約會（AA_126 6-6、AA_417 第 3 節，AA-B 2026-10-23 定稿；USER_WANTS D40）：kind 'sport'、sport:true＝見面照 sport 的「一起的時候」「結束」（src/invites3d.js S.meet）。
       羽球：新體育館 1F 羽球場，有點熟以上；hoursBy＝平日 12:00～21:00、週末 9:00～17:00。晨跑：椰林大道 06:30～07:30，朋友以上；times＝只能約 06:30；noRain＝下雨不能約；meetAt＝她在傅鐘前的椰林大道等 */
    {id:'gym_badminton',zone:'gym',   name:'新體育館羽球場', verb:'去新體育館打羽球',     kind:'sport',  minStage:'FAMILIAR',     stay:1,    memory:'SPORT_BADMINTON', sitAct:'wait', sport:true, hoursBy:{wk:[12,21],we:[9,17]}},
    {id:'run_avenue',  zone:'campus', name:'椰影大道',       verb:'去椰影大道晨跑',       kind:'sport',  minStage:'FRIEND',       stay:1,    memory:'SPORT_RUN',       sitAct:'wait', sport:true, hours:[6.5,7.5], times:[6.5], noRain:true, meetAt:[-36.8,6,-Math.PI/2]}
  ],
  /* 開場就有聯絡方式的（AA_124 1-7 第 3 點，2026-10-14）：阿哲（現有設定：已經熟）、阿凱（室友）、學姊（直屬：開學前的家族群組，BB_70 3-1）。
     可昕還列在這張表上，但新設定的局不照這張表（CANON-1112；AA_856 第三版）：開局不認識，第一次見面互加手機才有（G.contacts.kexin）；舊存檔照舊一直有——判斷在 invites3d.js 的 INV.hasContact（這張表的資料不動：好幾支測試拿它和匯入以前逐格比）。
     其他人在劇情裡拿到（事件的後果 contact:'人物 id'，內容由 AA、BB 寫）；錯過了，到「有點熟」以後聊天多一個「交換聯絡方式」（下面的 exchange，story3d.js talkCharacter） */
  contacts0:['zhe','kai','kexin','heroine_05'],
  /* 約不了的原因（AA_125 第 1 節的表＋AA_124 1-7 第 4 點，AA 決定）：手機「朋友」、約人時選地點的說明。{pr}＝她／他；不寫數字 */
  why:{
    stranger:'你們只打過招呼。先在學校多聊幾次。',
    meal:'再熟一點，才約得出去吃飯。',
    walk:'散步要等你們變成朋友。',
    abroad:'{pr}這學期在國外。',
    graduated:'{pr}已經畢業了。',
    away:'這學期不在學校',
    booked:'你們已經約好了：{when}，{place}。',
    partner:'兩個人單獨出去不太好。約在 Café 或總圖吧。',
    partnerMeal:'兩個人單獨去吃飯不太好。約在 Café 或總圖吧。',   /* AA 2026-10-14：讓玩家知道現在能怎麼做（群約之後再做）*/
    partnerWalk:'兩個人單獨去散步不太好。約在 Café 或總圖吧。',
    partnerTea:'兩個人單獨去喝茶不太好。約在 Café 或總圖吧。',   /* AA_172 3b */
    noContact:'還沒有{pr}的聯絡方式。再熟一點，可以當面問{pr}。',
    noContactAsk:'還沒有{pr}的聯絡方式。可以當面問{pr}。',
    sport:'再熟一點，才約得出來打羽球。',   /* 羽球（有點熟以上）、晨跑（朋友以上）、下雨：系統字（AA_126 6-6 的規則）；AA_417 第 5 節（e24de240c）改字 */
    run:'晨跑要等你們變成朋友。',
    rain:'下雨了，不能晨跑。',
    rainOff:'下雨了，和{who}的晨跑取消。'
  },
  /* 一起運動的共用旁白（AA_417 3-3，其他人：以安、語彤、芷若、學姊、沛珊、男生朋友……）：一起的時候、結束 */
  sport:{gym_badminton:{during:['（你們打了一個小時。球場的燈很亮，地板吱吱響。）'],end:['（打完，你們坐在場邊喝水，誰都不想先站起來。）']},
    run_avenue:{during:['（椰影大道上只有你們和幾個跑步的人。椰子樹的影子很長。）'],end:['（跑完一圈，你們在晨思鐘前面停下來喘氣。）']}},
  /* 男生朋友（AA_417 3-3）：羽球、晨跑沒有自己的答應句＝旁白「（他答應了。）」*/
  sportPlain:['zhe','classmate_bohan','kai','classmate_mingxuan','npc_fangyt'],
  /* 兩個人單獨的邀約（BB_70 0-2：散步、吃飯）：任一方有伴侶時不約，改成一群人（AA_125 第 1 節）。Café、總圖是「有理由的」，照常 */
  soloKinds:['meal','walk'],
  soloPlaces:['teahouse'],   /* 一盞：kind 還是 reason（時段、熟度不變），但和散步、吃飯一樣「兩個人單獨」（AA_172 3b，回 BB_158 第 0 節）*/
  /* 保底的「交換聯絡方式」（AA_124 1-7）：對方的回應，每人一句（AA 的五位；BB 的人物 BB 寫，還沒有的用旁白，不替人物編台詞）*/
  exchange:{
    heroine_01:[{say:'好。'},{narr:'（她把手機遞過來，自己先掃了你的。）'},{say:'加了。'}],   /* AA_194 第 4 節（使用說明 → 她做的事）*/
    heroine_03:[{say:'好。'},{narr:'（她把手機推過來，畫面已經停在加好友那一頁。）'}],   /* AA_194 第 4 節（不用「嗯。」開頭）*/
    yu:[{say:'欸你還不在我的群組裡？我拉你。三個。'}],
    classmate_bohan:[{say:'好。'},{say:'你有在看考古題嗎？有的話我傳給你。'}],   /* AA_194 第 4 節 */
    classmate_xinci:[{say:'我加你了。'},{say:'有缺講義的話跟我說，我都有拍。'}],   /* AA_194 第 4 節 */
    /* BB 的人物（BB_120 1-7b，第②級）：每一句都是她／他在手機上的習慣 */
    heroine_02:[{say:'好啊，你掃我。'},{say:'我上班的時候不太看手機，下班才會回，不要以為我不理你。'}],   /* BB_172 Z1（10-2 第 12、15 點）*/
    heroine_04:[{say:'你還沒有我的？好。我傳東西不解釋。'}],
    classmate_peishan:[{say:'好。上課有問題可以問你嗎？'}],   /* BB_172 P1（10-2 第 13 點）*/
    classmate_mingxuan:[{say:'好。二四六晚上我在家教，九點以後才會回。'}],   /* BB_172 M1（10-2 第 15 點）*/
    npc_fangyt:[{say:'好。'},{narr:'（他的大頭貼是一棵樹。）'}],   /* BB_172 F1（10-2 第 15 點）*/
    classmate_youchen:[{say:'好啊。週五我會丟一首歌，聽不聽隨你。'}],
    npc_huangxh:[{say:'好。我找受試者的時候，可以先問你嗎？'}],
    npc_ta_chen:[{say:'好。……有問題先問自己一次，再問我。'}]
  },
  /* 這些作息的時候不能赴約（會說「改天」，附一個具體的時間）*/
  busyActs:['class','barista','help','club','ta'],
  /* 可以約的人：人物的分類（CHARACTERS 的 social_layer）——法律系熟同學 A、其他系 C、五位主角 D、學長姐 F；不熟的同學 B、教授 E 不行 */
  layers:['A','C','D','F'],
  /* 約的時間：今天這幾個時間（已經過去的不列）、明天這幾個時間 */
  times:[12+10/60,15.5,17.5,19,21],
  /* 子晴、芷若一起分手以後（MREL.zzRefusing：還不能重新開始、或重新開始的是另一位）拒絕 L2 的邀約，不說理由、兩句輪流（AA_227 6-6 @26357a440，AA_423 4-1「照 AA_227 6-6，不改」；BB_194 22-2）。L3（正式校外約會）在 multirel3d.js */
  mrelL2:{heroine_04:[['這禮拜不行。'],['……下次吧。']],heroine_02:[['我這週班排滿了。'],['……不了，謝謝。']]},
  /* 邀約的個性（被邀約時；AA_70 第 2 節＋BB_121 的建議欄、BB_70 第 1～7 節，AA、BB 2026-10-14 互審同意，第②級）。只用四個地點；改天的時間由系統算（INV.nextFree）。
     acc[地點]：答應時她／他說的話（A＝認識、有點熟；R＝朋友以上；不分的直接給陣列）。first[地點]：第一次約那個地方（散步）時說的話。
     here[地點]：照作息她那時候本來就在那裡（不算邀約、不接改天，玩家直接去）。plan[地點]：她已經有計畫（作息的 busy／booked）時說的話，之後系統問改天的時間。
     rule(G, ctx, INV)：個人規則（可以把答應改成改天／婉拒、把忙改成「就在那裡」），回傳 {res, lines, alt} 或 null。ctx：{pid, P, day, h, wd, band, year, term, first, w8, dating, r}
     台詞：沒有括號的＝她／他說的話（有名字的對話框，外面不加「」：AA-B 2026-11-08 00:21）、（…）＝旁白（整句是一對（）才是旁白）、{me:'…'}＝祐廷說的話；（小聲）、（走出法圖）這種動作在前面、後面還有字的是她說的話（invites3d.js S.narrLine）；{zh}＝改天的時間（「九點十分」，不是今天的加「明天」或日期）、{明天？}＝改天是明天才說。
     walk[地點／any／rain]：一起走過去的路上說的一句（照目的地，對不上的放 any；下雨先用 rain）。一個元素是一句話的陣列（可以有旁白），或 {if:(G,ctx)=>…, l:[…]}；同一個人輪流換。
     表上只寫描述、沒有台詞的格子（例：「答應；她點最便宜的那杯」）照舊用系統的旁白；看電影、唱歌、法服值班、系籃這幾列等系統有那個地點再接。*/
  people:{
    /* ---------- AA 的六位（AA_70 第 2 節） ---------- */
    heroine_01:{ walk:{cafe:['你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。'],noodle:['我手帳有一頁專門寫想去的店。公館就有七家。'],wenzhou:[{if:(G,c)=>c.year>=2,l:['這條巷子我走過一百次。第一次看到那隻貓。']}],any:['宿舍門禁是十二點。我問過舍監為什麼，她也不知道。']},   /* 以安：AA_565（2026-11-02 以安改稿照 AA_580 第 32～59 列，企劃線 759e5c000，BB_228 PASS；原本「先講結論、要理由」2-1、BB_121 2-1）*/
      acc:{cafe:{A:['好啊。我本來就想去。']},noodle:{A:['好。'],R:['好。我要叉燒飯。']},
        gym_badminton:['羽球？好。我國中是校隊。……替補。'],run_avenue:['六點半？好。我設兩個鬧鐘。']},   /* AA_417 3-3（第一次去也用這一句）*/   /* 認識約 Café、朋友約吃飯：AA 2026-10-14 改成她自己說的話（AA_70 2a0218d）*/
      here:{library:['我本來就在總圖。二樓靠窗。']},
      plan:{cafe:['今天排滿了。這個時間可以嗎？'],noodle:(G,c)=>c.term&&c.term.id==='Y1S1'&&c.term.week<10?['我跟 Alison 約了一起寫憲法作業。{明天？}']:['我跟 Alison 約了讀書會的事。{明天？}']},   /* AA_238 5-7：公法讀書會大一上第 10 週才開始，以前是一起寫憲法作業 */
      rule:(G,c,I)=>{ if(c.P&&c.P.kind==='meal'&&c.r.res==='accept'&&c.wd===4&&c.h>=21.5&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.on&&(a=>!!a&&ACTIVITIES.on(a,c.day,G))(ACTIVITIES.list.find(x=>x.id==='public_law_group'))) return {lines:['好。可是吃完我就回去。報告還沒寫完。']};   /* 週四公法讀書會（20:00～21:30）散了以後約她吃飯：AA_227 3-1 的回覆，AA_434 第 3 節改成不寫鐘點（434e6d6d7）*/
        if(c.pid!=='wenzhou'||c.r.res!=='accept') return null;   /* 大一第一次約散步：先答應、再說今天不行，改到隔天；大二以後直接答應（AA_576 第 11～13 列，AA_415@b10d0567f） */
        if(c.year<=1&&!c.first) return {lines:['好。']};   /* AA_194 第 4 節（改規則）：大一只有第一次約散步（c.first）改到隔天（AA_576：「好。」「……今天不行，明天。」）；之後照一般答應「好。」*/
        if(c.year<=1) return {res:'resched',why:'plan',lines:['好。','……今天不行，明天。'],alt:I.nextFree(G,'heroine_01',c.P,c.day+1,10)};   /* AA_576 第 11、12 列（AA_415@b10d0567f）：先答應、再說今天不行改到隔天；祐廷那句「沒有目的。」刪；改天的結果不動 */
        return {lines:['好。']}; } },   /* AA_255 第 4 節第 7 點、AA_259 第 4 節第 7 點 */
    heroine_03:{ walk:{noodle:['這條路我第一次走，是高三暑假去茶屋應徵那天。那家修鞋店的老闆，三十年沒換過招牌。'],wenzhou:['這間老屋以前是一個教授住的。蘇姨說他每天來喝一壺茶，二十年。'],any:[{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','SHARED_MEAL'),l:['秀琴姨說你吃東西很像在考試。很認真，又很怕吃錯。']}],rain:['（她撐傘，傘偏向你那一邊，自己的肩膀濕了一半。）','沒事啦。']},   /* walk.rain 第二句：AA_194 第 4 節 */   /* 語彤：週二、週四晚上在阿鳳麵店幫忙（作息 help），其他時間在總圖三樓（2-2；BB_121 2-2：系統沒有反邀、改地點，先當婉拒）*/
      acc:{noodle:{A:['燒臘店？','好。']},gym_badminton:['……我不太會。','好。你不要笑。'],run_avenue:['早上九點有課。七點半以前可以。']},   /* 羽球、晨跑：AA_417 3-3 */
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='help') return c.pid==='noodle'?{res:'here',lines:['我就在店裡。你來。'],alt:null}:{res:'decline',why:'shop',lines:['麵店。','你來店裡就好。'],alt:null};
        if(r.res!=='accept') return null;
        if(c.pid==='cafe'&&c.band==='A') return {res:'decline',why:'restless',lines:['……咖啡廳我坐不住。','總圖可以。']};   /* AA_415 c71772fbc（11-07）：語彤家裡不缺錢，原句「那裡很貴」改掉 */
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['週六。我本來就在。']}; return {res:'resched',why:'sat',lines:['週六。我本來就在。'],alt:I.nextSat(G,'heroine_03',c.P,c.day,15)}; }
        return null; } },
    zhe:{ walk:{any:[['這家以前是賣雞排的。'],['那家的老闆會記得你點什麼，只要你去三次。'],['你知道公館哪家滷味十點後半價嗎？……我知道三家。']]}, acc:{noodle:['好啊！那家的叉燒飯我可以吃兩盤。']} },   /* AA_194 第 4 節（和阿凱「好 我餓了」撞）*/   /* 阿哲（2-3；BB_121 2-3：揪人的那句等群體邀約）*/
    yu:{ acc:{library:['總圖喔？好啊，可是我會一直想跟你講話。']} },   /* Alison（2-4；大三以後「今天是我的晚上」等她那個晚上的作息）*/
    classmate_bohan:{   /* 柏翰：總圖秒答應；其他地方「我要念書」，改到念完的時間（2-5；BB_121 2-5）*/
      rule:(G,c,I)=>{ if(c.pid==='library'||c.r.res!=='accept'||c.h>=21+10/60) return null; const a=I.freeAt(G,'classmate_bohan',c.P,c.day,21+10/60)?{day:c.day,h:21+10/60}:I.nextFree(G,'classmate_bohan',c.P,c.day,21+10/60);
        return {res:'resched',why:'study',lines:[a?'我要念書，{zh}可以。':'我要念書。'],alt:a}; } },   /* AA_194 第 4 節：拿掉中間的「……」*/
    classmate_xinci:{   /* 芯慈：吃飯要提前一天約（2-6；BB_121 2-6，她個人的規則）*/
      rule:(G,c,I)=>{ if(c.pid!=='noodle'||c.r.res!=='accept') return null; if(c.day>G.day) return {lines:['好，我記一下。']};   /* AA_194 第 4 節（改規則，只改字；判斷不變）：約之後的日子／約今天 */
        return {res:'resched',why:'early',lines:['今天的我都排好了，{zh}可以嗎？'],alt:I.nextFree(G,'classmate_xinci',c.P,c.day+1,12+10/60)}; } },
    /* ---------- BB 的人物（BB_70 第 1～7 節） ---------- */
    heroine_02:{ walk:{noodle:[{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ZR_HOMETOWN'),l:['這家影印一張一塊半欸。我媽那邊才一塊。']},{if:G=>!(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ZR_HOMETOWN')),l:['這家影印一張一塊半欸，好貴。']},   /* BB_172 Z2：聽過她家（閒聊 Z-L6，記憶 ZR_HOMETOWN）／沒聽過（10-2 第 5 點：不提家裡）*/
          ['（她看到騎樓下的電影海報。）','欸這部，你不要去看喔。','預告很好看，正片超無聊。我上禮拜去看，浪費兩百多。']],library:['你背包那本是什麼？好厚喔。','我們的書都很薄，可是每本都要讀好幾遍。'],   /* Z3、Z4 */
        wenzhou:[{once:'ZR_FILM_ASK',l:['欸，你不覺得這條巷子很適合拍電影嗎？你猜我會拍什麼。'],ch:[{t:'愛情片。',r:['太簡單了啦。']},{t:'恐怖片。',r:['晚上是有一點啦，可是不是。']},{t:'什麼都沒發生的片。',r:['……你怎麼知道？']}],after:['我想拍一個人每天走這條巷子去上班，然後什麼事都沒發生。','……應該很難看吧。']}],   /* BB_172 Z5（選項、once 照舊）*/   /* BB_70 Café → 溫州街（選項，見面前選）*/
        any:['我們外文的報告都要用英文寫，寫久了講中文都會卡。']},   /* BB_172 Z6 */   /* 芷若（1-4）：上班＝作息 barista */
      firstAt:{brunch:['（她點完餐，看了開放廚房很久。）','她煎蛋的時候都不講話欸，好專心。','我拉花的時候也是，被叫一下就歪掉。'],teahouse:['我完全不懂茶欸。','（店員說第一泡要等三分鐘。）','三分鐘喔？好，我等。']},   /* BB_172 Z7、Z8（10-2 第 7 點）*/ acc:{brunch:{A:['SUNNY SIDE？那家的蛋煎得比我們店的好。不要跟老闆說。'],R:['好。我點和上次一樣的。你不知道上次是什麼？那你猜。']},teahouse:{R:['一盞？好。那裡安靜，我可以不用說話。']},cafe:{A:['我放假不太想來上班的地方。……好啦。但我不幫忙收杯子。'],R:['去我們家。我坐客人那一邊，看起來會很奇怪。']},noodle:{A:['好。但我只吃一點點。'],R:['阿鳳阿姨記得我。我也記得她。']},
        gym_badminton:['羽球！好啊，我手腕很好。拉花練的。'],run_avenue:['早上？我昨天上到兩點。','好啦。我去。']},   /* AA_417 3-3 */
      here:{cafe:(G,c)=>typeof STORY!=='undefined'&&STORY.zrNoShift&&STORY.zrNoShift(G,c.day)?['我在 Café，今天是客人。你要來嗎？']:['我會在 Café 啊，你直接過來，我幫你做一杯。']},   /* 上班的那一句：BB_172 Z16（10-2 第 3 點：約的是之後）*/   /* AA_375 第 1 項：6/3 是她最後一個班，6/4～9/2 她在 Café 是客人（作息 characters.js；STORY.zrNoShift）*/
      plan:{library:['我在上班。十點下班，總圖也十點關。你自己加油。'],wenzhou:['我在上班。下班以後，走一段？']},
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='barista'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_02',c.P,c.day,22.5); if(!a||a.day!==c.day) return null;
          return {lines:[c.dating?'下班我請宵夜。{zh}。你可以多帶幾個人。':'下班我請你吃宵夜。{zh}。不要遲到。'],alt:a}; }
        if(r.res!=='accept') return null;
        if(c.pid==='lawlib'&&INVITE_DATA.lv0('heroine_02')) return {res:'decline',why:'quiet',lines:['法圖比總圖還安靜吧？……我會死掉。換 Café 好不好？']};   /* AA_535b 2-1：認識階段婉拒、有點熟以上照約 */
        if(c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['總圖太安靜了，我會想講話。']};
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['週六。我本來就要去。']}; return {res:'resched',why:'sat',lines:['週六。我本來就要去。'],alt:I.nextSat(G,'heroine_02',c.P,c.day,14)}; }
        return null; } },
    heroine_04:{ walk:{noodle:[['我們社團練團的地方就在B館旁邊。','你們法律系的人有沒有被我們吵到？'],['這家的珍珠超 Q。公館的我喝過快十家，這家最好。']],   /* BB_172 Q2、Q3 */
        wenzhou:[{if:G=>typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_ziqing_secret_game']}),l:['這邊機車停得好亂。做成關卡的話，玩家一定一直撞到。','欸，我要把它做進去。']},{if:G=>!(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_ziqing_secret_game']})),l:['這邊機車停得好亂，走路都要側身。']}],   /* Q4：看過 Q6（ev_ziqing_secret_game）才說遊戲；還沒看過＝10-2 第 6 點 */
        library:['你們法律系考試是寫申論對吧？','我們寫程式有點像，只是改的是電腦，錯一個字就零分。'],   /* Q5 */any:[['（她看到一隻松鼠。）','那隻松鼠在看我。……牠在看我的餅乾。'],
        {if:G=>typeof SOCIAL!=='undefined'&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))&&!SOCIAL.has('heroine_04','TOLD_HER_CHANGE'),once:'ZQ_CHANGE_ASK',l:['欸，阿凱說你之前念經濟？那你怎麼會換來法律？'],   /* BB_172 Q7（10-1 第 10 點）的問句；①的回答照 LIFE-LINE（念了一個多月）不動 */
         ch:[{t:'（說換方向的事）',mem:'TOLD_HER_CHANGE',r:[{me:'念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。'},'你換過？',{me:'嗯。'},'你家裡說什麼？',{me:'一開始不太懂。後來就懂了。'},'（她走了好幾步沒說話。）','好。知道了。']},
             {t:'下次再講。',r:['好喔，那你欠我一次。']}]}]},   /* Q7 ② */   /* BB_70 2-5（選項句：走到目的地、見面前；「下次再講」不記，Q10 第四個選項還有一次機會）*/   /* 子晴（2-4）：社團＝作息 club（週一、週三晚上）*/
      firstAt:{teahouse:['地板是榻榻米。我要脫鞋？……我的襪子是貓的。不准看。'],
        gym_badminton:['（她借了一支拍子，握的方向是反的。）','這樣握比較帥。不是嗎？'],run_avenue:['（六點半，她穿著帽 T 出現，眼睛只開一半。）','我起來了。這件事你要記得。']},   /* AA_417 3-1 的 first（第一次去，在那裡說）*/
      acc:{teahouse:{R:['一盞？那裡不能大聲對吧。……好，這是挑戰模式。']},cafe:{A:['Café？好啊，我要點最甜的。']},library:{R:['（她答應了，條件是「二樓靠窗，有插座的那一排」。）']},
        gym_badminton:{A:['羽球？我很爛喔。先說好。'],R:['好。我很爛。你不要教我，讓我自己爛。']},run_avenue:{R:['早上我在睡。好啦，一次。']}},   /* AA_417 3-1（晨跑只有朋友以上）*/
      sport:{gym_badminton:{during:[['那球出界了。好啦，是我沒接到。'],['剛剛那一球，你有看到吧。我接到了。'],['你不要一直幫我撿球。謝謝。']],end:['我會進步的。我不想輸給一顆球。']},
        run_avenue:{during:[['你跑太快了。等我。'],['椰子樹一棵、兩棵……數到三十就好嗎？'],['早上的椰影大道沒有人。原來長這樣。']],end:['早餐我請。……因為我活下來了。']}},   /* AA_417 3-1：一起的時候三句輪流、結束 */
      first:{wenzhou:['散步？散步是什麼？','（你解釋了一下。）','好啦。但要有目的地。']},
      rule:(G,c,I)=>{ const r=c.r;
        /* 大四（畢業，在臺北的工作室上班；BB_163 第 2 節；三句照 AA_312 B-5 拿掉「欸不是」）：平日 20:00 以前在工作室、總圖要辦校友證；其他照下面原本的規則 */
        if(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('heroine_04',{day:c.day}).kind==='taipei'&&(r.res==='accept'||r.why==='busy')){ const wk=c.wd>=1&&c.wd<=5, late=20+10/60;
          if(c.pid==='slowread'&&wk) return {res:'resched',why:'work',act:'work',lines:['平日我在工作室。……週六下午，木曜日？'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};
          if(c.pid==='lawlib'&&wk) return {res:'resched',why:'work',act:'work',lines:['平日我在工作室。……週六下午可以。法圖週六開到五點對吧。'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};   /* AA_535b 2-1 */   /* AA_535 4-2：大四平日的慢讀＝婉拒＋改到下一個週六 14:00 */
          if(c.pid==='library') return {res:'decline',why:'grad',lines:['我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？'],alt:null};
          if(c.pid==='teahouse'&&wk) return {res:'resched',why:'work',act:'work',lines:['平日下午我在工作室。……週六下午可以嗎？'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};   /* BB_163 第 2 節（BB-B 55509fe2）：平日（週三～週五下午）的一盞改到最近的週六下午 */
          const firstY4=c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='heroine_04'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&STORY.presence('heroine_04',{day:iv.day}).kind==='taipei');
          if(wk&&c.h<20&&['cafe','noodle','wenzhou'].includes(c.pid)){ const alt=I.freeAt(G,'heroine_04',c.P,c.day,late)?{day:c.day,h:late}:I.nextFree(G,'heroine_04',c.P,c.day,late);
            return {res:'resched',why:'work',act:'work',lines:c.pid==='cafe'?['我八點才下班。……八點十分，兩點半。']:(firstY4?['好。……阿鳳阿姨還記得我嗎？']:null),alt}; }
          if(firstY4&&r.res==='accept') return {lines:['好。……阿鳳阿姨還記得我嗎？']}; }
        if(c.pid==='brunch'&&(r.res==='accept'||r.res==='resched')){ const Q=I.place('cafe'); let a=null; for(let d=c.day;d<=c.day+3&&!a;d++) for(let hh=14;hh<=17;hh+=0.5) if(Q&&I.freeAt(G,'heroine_04',Q,d,hh)){ a={day:d,h:hh,place:'cafe'}; break; }   /* BB_158 第 2 節：週末 14:00 才起床（AA_137 8-5），半熟一律婉拒；改天指向 Café（下午）*/
          return {res:a?'resched':'decline',why:'sleep',lines:['週末早上我在睡覺。……下午的話，Café。'],alt:a}; }
        if(r.res==='resched'&&r.why==='busy'&&r.act==='club'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_04',c.P,c.day,21.5); if(!a||a.day!==c.day) return null; return {lines:['社課完。{zh}。燒臘店。'],alt:a}; }
        if(r.res==='accept'&&c.pid==='lawlib'&&INVITE_DATA.lv0('heroine_04')) return {res:'decline',why:'quiet',lines:['法圖？比總圖還不能講話吧。……不要。']};   /* AA_535b 2-1 */
        if(r.res==='accept'&&c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['總圖不能講話。我會死。']};
        return null; } },
    heroine_05:{ partnerSay:{teahouse:['一盞……那裡太安靜了。去 Café 讀書吧。']},   /* 有伴侶時約一盞（AA_172 3b）：系統說明之後她自己的一句 */
      walk:{library:[{if:(G,c)=>c.year<3,l:['B館的電梯很慢，走樓梯比較快。','總圖三樓靠窗的位子，九點以前去才有。','……我大一的時候，這些都沒人告訴我。']},{if:(G,c)=>c.year>=3,l:['B館的電梯還是很慢。','我現在比較常去法圖。總圖的位子，給你們搶。']}],   /* 大三起：AA_259 (b) 第 3 點（AA_312 第 3 節 C；dd9b704aa）*/wenzhou:[{if:(G,c)=>c.postExam,l:['這家鬆餅聽說很好吃，我每次經過都在趕時間。']}],   /* BB_172 S3 */noodle:['以前法服有個個案，就住在這附近。阿伯每次來都帶一袋橘子。','我們不能收，他就放在桌上走掉。'],any:['我大一的時候以為四年很長。']},   /* 學姊（3-4）：平日 9–17 在總圖（作息 read，個人規則）；散步在 W8（ev_sis_collapse）以前婉拒、不給改天 */
      firstAt:{brunch:['三分四十秒。老闆娘說的。她每一顆都這樣計時？'],teahouse:['這裡不能讀書。我很少去不能讀書的地方。']}, acc:{brunch:{A:['SUNNY SIDE。好。我會準時到。'],R:['好。這次我點鬆餅。']},teahouse:{R:['一盞。好。那裡有一壺，我一直想再喝。']},cafe:{A:['好。'],R:['今天不看筆記。']},noodle:{A:['好啊。'],R:['好。我想吃阿鳳的叉燒。']},wenzhou:['散步。好。溫州街我只有路過，沒有真的走過。'],
        gym_badminton:['羽球？好，我只會發球。'],run_avenue:['晨跑。好。跑完我直接去研究室。']},   /* AA_417 3-3 */
      rule:(G,c,I)=>{ const r=c.r, lib=c.wd>=1&&c.wd<=5&&c.h>=9&&c.h<17;
        if((c.pid==='wenzhou'||c.pid==='lake')&&!c.postExam&&(r.res==='accept'||r.res==='resched')) return {res:'decline',why:'exam',lines:['散步的話，等我考完。','週三晚上我在法圖。要讀書的話，可以一起。'],alt:null};   /* 筆試（2026-02-02 17:00）以前婉拒散步（AA_284 1-3；原本綁作廢的 W8、到 11/30 連交往都拒）*/
        if(c.pid==='lawlib'&&r.res==='accept'&&typeof SISG!=='undefined'&&SISG.preExamStudy&&SISG.preExamStudy(G,c)) return {lines:['好。法圖開到九點四十五，我們念到最後一分鐘。']};   /* AA_535b 2-1 筆試前（照慢讀那一列的範圍：第 14 週～筆試）*/
        if(c.pid==='slowread'){ if(r.res==='accept'&&typeof SISG!=='undefined'&&SISG.preExamStudy&&SISG.preExamStudy(G,c)) return {lines:[SISG.STUDY_YES]};   /* AA_535 4-2：筆試前（第 14 週～筆試）約慢讀＝「好。我帶刑訴。……」（和 1-3 同一句）*/
          if((r.res==='accept'||r.why==='busy')&&lib&&c.year>=3) return {res:'resched',why:'busy',lines:['平日我在法圖。……週六下午可以。'],alt:I.nextSat(G,'heroine_05',c.P,c.day,14)}; }   /* AA_535 4-2：祐廷大三起平日 9～17 她在法圖＝婉拒＋改到下一個週六 14:00（慢讀 18:00 關，改到 17:00 坐不滿）*/
        { const q=typeof SISG!=='undefined'&&SISG.inviteCap?SISG.inviteCap(G,c,I):null; if(q) return q; }   /* 筆試以前的邀約上限（AA_284 2-1：一週一次 → 兩週一次 → 第 14 週起婉拒；平日午餐不算；src/sis_grad3d.js）*/
        if(r.res!=='accept'||!lib) return null;
        if(c.pid==='library'&&c.year>=3){ const carrel=c.h>=14&&typeof LUP!=='undefined'&&LUP.sisPeriod&&LUP.sisPeriod(Object.assign({},G,{day:c.day}));
          return {res:'resched',why:'busy',lines:[carrel?'我在研究小間。五點以後過去找你。':'我在法圖。五點以後過去找你。'],alt:I.nextFree(G,'heroine_05',c.P,c.day,17)}; }   /* 大三起她平日下午在法圖（AA_259 (b) 第 3 點 rule library，改 resched、17:00）；2028-02 起 14～17 在研究小間（AA_437 第 3 節）*/
        if(c.pid==='library') return {res:'here',lines:['好啊，我在總圖三樓。到了跟我說。'],alt:null};
        if(c.pid==='cafe'||c.pid==='wenzhou') return {res:'resched',why:'busy',lines:[c.pid==='cafe'?'五點以後好不好？我要先把這段寫完。':'五點以後。……散步，我試試看。'],alt:I.nextFree(G,'heroine_05',c.P,c.day,17)};
        return null; } },
    kai:{ walk:{any:[{if:(G,c)=>c.year<=1,l:['我們那層的洗衣機又壞了，我衣服已經堆三天了。']}],   /* BB_172 K1（當面說的加標點；不和宿舍隨機句撞）*/
        noodle:[{if:(G,c)=>c.year<=1,once:'KAI_SCOOTER_ASK',l:['欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？'],ch:[{t:'不一定是告，可以請警察來看',r:['喔，所以告跟叫警察不一樣。好，我學到了。']},{t:'你想告誰',r:['沒有啦，我只是想知道我能不能。']},{t:'先讓我吃完',r:['好，你吃。','（過了十秒）','吃完了嗎？']}]}]},   /* BB_172 K2 */   /* BB_70 4-5（大一上；「先讓我吃完」＝去吃飯的路上）*/   /* 阿凱（4-4）：他的句子沒有標點 */
      /* 手機／當面兩版（BB_172 第 10 節 10-1 第 17 點：手機照他的訊息體、沒有標點；當面加標點）：{phone, face}，INV.personal 照有沒有當面（c.face）選 */
      acc:{brunch:{phone:['早午餐 好 那是我的早餐'],face:['早午餐？好，那是我的早餐。']},teahouse:{phone:['茶屋要脫鞋嗎 好 我襪子有洞'],face:['茶屋要脫鞋嗎？……好，我襪子有洞。']},
        cafe:{A:{phone:['那裡有插座嗎 我要帶電腦'],face:['那裡有插座嗎？我要帶電腦。']}},noodle:{phone:['走 我剛好還沒吃'],face:['走，我剛好還沒吃。']}},   /* K3、K4（10-2 第 10 點）、K5、K6（10-1 第 15 點）*/
      first:{wenzhou:{phone:['散步要幹嘛','（你說那裡有貓。）','好'],face:['散步要幹嘛？','（你說那裡有貓。）','好。']}},   /* K7 */
      rule:(G,c,I)=>{ if(c.pid==='brunch'&&c.r.res==='accept'&&c.h<12){ const h2=12+10/60; return {res:'resched',why:'sleep',lines:c.face?['早上不行，我在睡覺。']:['早上 不行 我在睡'],alt:I.freeAt(G,'kai',c.P,c.day,h2)?{day:c.day,h:h2}:null}; }   /* BB_158 第 6 節：半熟早上改 12:10 */
        if(c.pid!=='library'||c.r.res!=='accept') return null; const ex=!!(c.term&&[7,8,9,15,16].includes(c.term.week));   /* BB_172 K9（AA_209 第 4 節）*/   /* 朋友以上：考前一週、考試週答應 */
        if(c.band==='R'&&ex) return null; return {res:'decline',why:'sleepy',lines:c.face?['總圖我會睡著。','考前一週我會去，真的。']:['總圖我會睡著','考前一週我會去 真的']}; } },   /* K8、K9 當面版（BB_172 10-1 第 17、8 點；週次 [7,8,9,15,16] 已經照改）*/
    classmate_mingxuan:{ walk:{any:[['我家教那個學生問我，念法律是不是要背很多東西。','我跟他說，要背，背完還要會用。'],['我爸之前傳訊息問我『籃球的三分線是畫在哪裡』。','他在看我們比賽的直播。……到現在還是看不懂。'],['這條路我每個禮拜都走好幾次，去家教都走這邊。']]},   /* BB_172 M2（10-1 第 16 點）、M3（10-1 第 7 點）、M4 */   /* 明軒（5-4）：二、四、六晚上 19–21 家教（個人規則）；Café 的「只能待一小時」朋友以後不說（BB_120 1-6）*/
      acc:{brunch:{phone:['早午餐？哈哈 CP 值不高喔 你請的話就可以'],face:['早午餐？CP 值不高喔。你請的話，我就去。']},teahouse:{phone:['一盞？哈哈 我很少喝茶 我爸喝 好啊'],face:['一盞？我很少喝茶，我爸才喝。好啊。']},
        cafe:{A:['好。但我只能待一小時。']},noodle:['走啊，阿鳳便宜又大碗。'],wenzhou:['可以啊。走一走也好，我最近都坐著。']},   /* BB_172 M5、M6（手機／當面，10-1 第 17 點）、M8、M9（10-2 第 1 點）*/
      rule:(G,c,I)=>{ const tut=[2,4,6].includes(c.wd)&&c.h+c.P.stay>19&&c.h<21; if(c.r.res!=='accept'||!tut) return null;
        if(c.pid==='cafe') return {res:'resched',why:'tutor',lines:[c.face?'那時候我在家教，九點以後可以。':'那時候我在家教 九點以後可以'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day,21)};   /* BB_172 M10（10-2 第 3 點）*/
        if(c.pid==='library') return {res:'resched',why:'tutor',lines:[c.face?'我七點要家教，{zh}可以嗎？':'我七點要家教 {zh}可以嗎'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day+1,10)};   /* M11（10-1 第 1 點：alt 只往後找，用 {zh}）*/
        if(c.pid==='noodle'){ const a=I.nextFree(G,'classmate_mingxuan',c.P,c.day,21.5); return {res:'resched',why:'tutor',lines:[a&&a.day===c.day?(c.face?'家教完，{zh}，吃便宜的那家。':'家教完 {zh} 吃便宜的那家'):(c.face?'那天我要家教，{zh}可以嗎？':'那天我要家教 {zh}可以嗎')],alt:a}; }   /* M12（10-1 第 2 點）*/
        return null; } },
    classmate_peishan:{ afterMeet:(G,iv,pid)=>pid==='library'&&typeof STORY!=='undefined'&&STORY.termAt&&STORY.termAt(iv.day)==='Y2S2'&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_p4b')?[G.flags.PS_P4B_GROUP?'（她遞過來一張便條：「今天念了 42 頁。你們呢？」）':'（她遞過來一張便條：「今天念了 42 頁。你呢？」）']:null,   /* P4b（BB_97 4-4）：大二下週末陪她在總圖念，每次一張便條（小組版寫「你們呢？」）*/
      walk:{any:[{once:'PS_LAW_ASK',l:['剛剛路上那排機車，全都停在紅線上。','如果一條規定大家都不守，它還算數嗎？'],   /* BB_172 P2（10-1 第 11 點：人已經在目的地；選項、after 照舊）*/
        ch:[{t:'還是法律，只是沒人守。',r:['所以寫下來就算數喔？','那寫的人壓力好大。']},{t:'那它可能該改了。',r:['所以大家不守，算是在投票嗎？']},{t:'要看大家為什麼不守。',r:['也是。有的人是不想守，有的人是沒辦法守。']}],
        after:[{if:G=>typeof CALENDAR==='undefined'||!CALENDAR.TERMS||(T=>!T||CALENDAR.tOf(G.day)<T.t0)(CALENDAR.TERMS.find(t=>t.id==='Y1S2')),l:['好。我要拿這題去問讀書會的人，看看他們怎麼說。']},{l:['好。我要拿這題去問課輔班的小孩，看看他們怎麼說。']}]}]},
      /* X327 沛珊重寫（AA_755_peishan_feed_misc@c5094495d，2026-11-11）：firstAt.brunch、acc.brunch.A／R、acc.run_avenue 四處照稿逐句換（原本「她翻蛋的時候…我媽也是」「早餐店的女兒…」「蛋怎麼翻」「四點半就要起來幫忙開店」）；invite_replies.js ps5、ps9 同句由 tools/invite/build_replies.py 跟著換 */
      firstAt:{brunch:['你看她翻蛋，手腕都不動欸。','我在家試過一次，蛋飛到抽油煙機上，我媽到現在還會講。'],teahouse:['這裡講話要很小聲對不對？','那我小聲問，第一泡為什麼要倒掉？']},   /* BB_172 P3、P4 */ acc:{brunch:{A:['早午餐！好啊，那種不用太早起的我最可以。'],R:['好啊。我想坐吧台，可以看他們做。']},teahouse:{R:['一盞？好。我可以帶問題去嗎？很多個。']},cafe:{A:['好。但我會一直問你問題。']},noodle:{A:['我吃很慢。你不能催我。']},
        gym_badminton:['好啊！！我要問你，你為什麼會打。'],run_avenue:['好啊！可是你要打給我，我鬧鐘要響三次才起得來。']},   /* AA_417 3-3 */ first:{wenzhou:['散步是最好的思考。……我在書上看到的。']}, rule:(G,c,I)=>{ const r=c.r;   /* 消失期（2026-12-18～2027-08-06）約她一律沒有回覆、不顯示她的句子（presence unreachable＝「沒有回覆。」；交往中照 AA_276 去台中）：大二下的婉拒句、大二下那一段刪（AA_255 (b-1) 第 20 條，52900eb23）*/
        const tp=typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('classmate_peishan',{day:c.day}).kind==='taipei'; if(!tp||!(r.res==='accept'||r.why==='busy')) return null;   /* 你那個時間有約、店沒開、下雨：照系統的說法 */   /* BB_163：重考那一學期（大二下）、大三起在別的學校；人在臺北 */
        const wkend=c.wd===6||c.wd===0;
        if(c.term&&c.term.id==='Y2S2'){   /* 1-1：週末在總圖念書，平日在家念。消失期 tp 不成立，這一段不會播（AA_255 (b-1) 第 20 條說可以刪；AA_415 ps30 等列還指著這幾句（build_replies.py 會核對），先留著）*/
          if(c.pid==='library') return wkend?{res:'accept',lines:['好。我在老位子。……你坐著就好，不用說話。']}:{res:'resched',why:'study',lines:['平日我在家念，比較不會分心。……週末，總圖。'],alt:I.nextSat(G,'classmate_peishan',c.P,c.day,10)};
          if(c.pid==='cafe') return {res:'decline',why:'study',lines:['Café 我會想跟你聊天。……現在不行。週末來總圖，坐我旁邊。'],alt:null};
          if(c.pid==='noodle') return {res:'decline',why:'study',lines:['阿鳳阿姨的叉燒，考完我要吃兩份。……現在我吃飯糰，十分鐘。'],alt:null};
          if(c.pid==='wenzhou'){ if(G.flags&&G.flags.dating_classmate_peishan&&c.wd===0&&c.h>=14&&c.h<15) return {res:'here',lines:['星期日下午本來就是你的。……不用約。'],alt:null};
            return {res:'decline',why:'study',lines:['散步會讓我想很多事。現在不能想太多。……考完，我們走遠一點。'],alt:null}; }
          return null; }
        /* 1-2：大三起。週二三四 16～19 課輔班、週六 10～18／週日 13～18 書店 */
        const tutor=[2,3,4].includes(c.wd)&&c.h<19&&c.h+(c.P.stay||1)>16, shop=(c.wd===6&&c.h<18&&c.h+(c.P.stay||1)>10)||(c.wd===0&&c.h<18&&c.h+(c.P.stay||1)>13);
        const at=(h)=>I.freeAt(G,'classmate_peishan',c.P,c.day,h)?{day:c.day,h}:I.nextFree(G,'classmate_peishan',c.P,c.day,h);
        if(c.pid==='lawlib') return INVITE_DATA.toSlow(G,'classmate_peishan',c,I,['法圖我現在進不去了。……木曜日好不好？']);   /* AA_535b 2-1：大三起不在這裡念了 */
        if(c.pid==='lake'&&r.res==='accept'&&!c.first) return {lines:['好。……我好久沒回去了。']};   /* AA_535b 2-2：acc R 換這一句（校園誰都進得來）*/
        if(c.pid==='slowread'){ if(tutor||shop){ const wdD=d=>((G.weekday+(d-G.day))%7+7)%7, tpD=d=>STORY.presence('classmate_peishan',{day:d}).kind==='taipei'; let alt=null;
            for(let d=c.day+1; d<=c.day+14&&!alt; d++) if(wdD(d)!==6&&tpD(d)&&I.freeAt(G,'classmate_peishan',c.P,d,19)) alt={day:d,h:19};   /* AA_772 rules：改約下一個她有空的 19:00（原本早上 10:00；木曜日 13:00 才開）*/   /* 下一個她有空的早上 10:00（週六整天在書店；在臺北；慢讀週二休由 freeAt 擋）*/
            return {res:'resched',why:'work',act:'work',lines:[shop?'那時候我在書店。……木曜日開到十點，改天晚上好不好？':'那時候我在課輔班。……木曜日開到十點，改天晚上好不好？'],alt}; }   /* AA_535b 4-3：撞到書店、課輔班不用 plan 那句；慢讀 18:00 關門，不像 Café 改到下班以後 */
          return r.res==='accept'?{lines:['好。木曜日不用學生證。……我帶作業去改。']}:null; }   /* AA_535 4-2（大三起，在臺北）*/
        if(c.pid==='library') return {res:'decline',why:'school',lines:['我現在進不去總圖了。……Café 好不好？我帶作業去改。'],alt:null};
        if(c.pid==='cafe'){ if(shop) return {res:'resched',why:'work',act:'work',lines:['書店六點打烊。……六點十分，兩點半。'],alt:at(18+10/60)}; if(tutor) return {res:'resched',why:'work',act:'work',lines:['七點下課。……七點半，我走過去。'],alt:at(19.5)};
          return {res:'accept',lines:['好。我帶作業去改，你念你的。']}; }
        if(c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='classmate_peishan'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&/^Y[34]/.test((CALENDAR.termOf(iv.day)||{id:''}).id))&&r.res==='accept') return {lines:['好。阿鳳阿姨一定會問我現在念什麼。……我要講很久。']};
        if(c.pid==='wenzhou'&&tutor) return {res:'resched',why:'work',act:'work',lines:['課輔班下課，剛好在溫州街。……七點，門口等我。'],alt:at(19)};
        return null; } },   /* rule：BB_158 第 4 節，大二下重考那一學期半熟、一盞都婉拒（SYS-21 起她那學期休學、presence 先回 away：照樣換成她自己的這一句）*/   /* 沛珊（6-4）*/
    kexin:{ rule:(G,c,I)=>c.pid==='lawlib'&&c.r&&(c.r.res==='accept'||c.r.res==='resched')?INVITE_DATA.toSlow(G,'kexin',c,I,['法圖？我是外校的，進不去吧。','……木曜日好不好？那裡不用證件。']):null,   /* AA_535b 2-1：她是外校的，法圖進不去，改約慢讀 */
      acc:{brunch:{A:['SUNNY SIDE？我從木柵大學過來要四十分鐘。好，我早一點出門。'],R:['好啊，我先查一下菜單。']},teahouse:{R:['一盞。安靜的地方。我可能一個小時都不講話喔。']},
        pasta118:['好。我從木柵過去四十分鐘，你先點，我到了就吃。'],teahouse_ceremony:['茶席。我要穿裙子嗎？','我穿。'],   /* AA_535b 4-2（企劃線 b3e5bca3b）：茶席那句接茶席現場她「坐下來，又站起來，把裙子拉好再坐」（wzlines3d.js CEREMONY_LINES）*/
        /* AA_417 3-2（她是政大的學生：羽球場由祐廷用台大的帳號預約）；政大那幾年的句子，經濟系那一年不用 */
        gym_badminton:G=>(G.stage||'law')==='law'?{A:['首都帝大的球場？好。……先說，我高中打過。'],R:['好，我從山上下來，拍子你負責借。']}:null,
        run_avenue:G=>(G.stage||'law')==='law'?{R:['椰影大道？從木柵大學過去要四十分鐘。','……好。你敢遲到試試看。']}:null},
      sport:{gym_badminton:{during:[['那一球你讓我？……不准讓。'],['再一局。這局不算，我鞋帶鬆了。'],['你們的球場比較亮。這不是藉口。']],end:['換你來木柵大學打。你要上山。']},
        run_avenue:{during:[['跑到晨思鐘不要停。跑回來才算。'],['我不喘。……我在講話，所以我不喘。'],['早上的首都帝大好安靜。山上的鳥比較吵。']],end:['早餐我知道一家。走。']}},   /* AA_417 3-2：一起的時候三句輪流、結束 */   /* BB_158 第 5 節（她在政大：時間照她的作息；2026-10-17 BB-C 改稿：不再每句「假設」）*/
      firstAt:{gym_badminton:G=>(G.stage||'law')==='law'?['我高中打過一學期。你不要放水。']:null,run_avenue:G=>(G.stage||'law')==='law'?['六點二十五分。我先到了。']:null,   /* AA_417 3-2 的 first */
        brunch:['蛋可以選熟度欸。我要半熟。'],teahouse:['我們學校後山也有茶園欸。','不過這邊的院子比較安靜。'],
        /* AA_535b 4-2：第一次和她到 Café、總圖、麵店、溫州街多說的（「你們學校」「我們學校山下」＝她在政大、祐廷在台大的那幾年，經濟系那一年不用，和羽球、晨跑同一把尺）*/
        cafe:G=>(G.stage||'law')==='law'?['（她看了一圈，在吧檯前面站了很久才點。）','你們學校旁邊的咖啡店開到半夜喔。我們那邊十點就關了。']:null,
        library:G=>(G.stage||'law')==='law'?['（她站在大廳，抬頭看了一圈。）','好大。我一定會迷路，你走前面。']:null,
        noodle:G=>(G.stage||'law')==='law'?['阿姨，叉燒飯加滷蛋。','（她轉頭看你。）','他說這樣點最好吃。']:null,
        wenzhou:G=>(G.stage||'law')==='law'?['這條街好多書店。……我們學校山下只有影印店。']:null} },
    npc_fangyt:{ walk:{any:[['椰影大道的大王椰子，葉子一片好幾公斤，掉下來會砸傷人。','走那邊我都走中間。'],['這棵是樟樹。這棵是菩提。那棵，我不知道欸，我回去查。'],{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('npc_fangyt','FANG_HINT'),l:['芷若高中就這樣，下課都是她在講。']}]},   /* BB_172 F2（10-1 第 12 點）、F3、F4（10-1 第 9 點：改條件，看過 Z6「隔壁房的人記得的事」＝FANG_HINT 才放）*/ acc:{brunch:['好。早上我本來就起得早。'],teahouse:['好。聽說那邊院子有一棵很老的樟樹，我想去看看。'],cafe:['好。順便看一下 Café 窗台那盆植物。'],library:['好。我在總圖門口等你。'],wenzhou:['溫州街有一棵很老的榕樹。我帶你去。']} }   /* 方奕廷（7-4）；Café、總圖、一盞：BB_172 F6～F8（10-2 第 1 點）*/
  }
};
/* ---------- 慢讀咖啡（118 巷）當邀約地點（AA_535 第 4 節，AA-B 定稿 dbd49dca7，企劃線 docs/story_planning/AA_535_…；第②級；INVITE-OPTS-1030）----------
   地點（4-1）：念書＋喝咖啡、喝茶兩類（cats）；剛認識就可以約（reason，有伴侶也可以，和 Café、總圖一樣）；營業 09:00～18:00、週二休（off）；坐一個半小時＝最晚 16:30 開始（hours 是整段要在裡面）；
   只在法律系的年級（118 巷的場景本來就只在法律系）；時間：平日 12:10、15:30，週末多 10:00、14:00（timesBy）；下雨照常。見面兩個人一起坐下讀書（seatPose）。
   台詞（4-2，一字照稿）：first＝第一次約這裡、acc A＝認識和有點熟、R＝朋友以上、plan＝她那時候有事（系統接改天）、here＝她本來就在（3-1 的常客時段）、firstAt＝第一次和她到這裡多說的、walk＝一起走過去。
   芷若的 plan：上班照現有的 barista 規則（AA_415 表），不用這句。個人規則（子晴大四平日、學姊大三起平日與筆試前、沛珊大三起）寫在上面各人的 rule。見面旁白在 rel_lines.js 的 meet.slowread */
/* 2026-11-11 AA_772 slowread_to_mokuyobi（L118-SHOPS-REDO-1111，使用者：慢讀咖啡的念書、常客、邀約整套搬到別區現有的咖啡店；AA 挑溫州街的木曜日）：
   地點 id slowread、記憶 SLOWREAD_TOGETHER 不改名（舊存檔照認）；區域換成 wz_mokuyobi、名字「木曜日」、營業 13:00～22:00、週二休（坐一個半小時＝最晚 20:30 開始）；
   時間：平日 15:30、19:00，週末 14:00、15:30、19:00。只列在「念書」那一類（木曜日原本那個地點 mokuyobi 留「坐坐」，它的 verbStudy 拿掉，選單上木曜日的念書只有這一組）。
   show：自己走去過木曜日一次才列（和 mokuyobi 那個地點同一個條件，AA_617 第 1 節；原本限法律系的年級拿掉）。七位的台詞下面照稿（tools/story/l118_fix772.py 換的字）*/
INVITE_DATA.places.push({id:'slowread',zone:'wz_mokuyobi',name:'木曜日',verb:'去木曜日念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1.5,memory:'SLOWREAD_TOGETHER',sitAct:'read',seatPose:'read',cats:['study'],
  days:[0,1,3,4,5,6],off:[2],hours:[13,22],timesBy:{wk:[15.5,19],we:[14,15.5,19]},show:G=>!!G&&!!G.visited&&!!G.visited.wz_mokuyobi});
(function(){ const ytH8=G=>{ const o=G&&G.l118&&G.l118.once; return !!o&&typeof o==='object'&&o.H8!=null; };   /* 118 巷 H8 演過（滇香小館的老闆娘說語彤自己來問開店的事；lane118.js S.H8）。AA_535b 4-1 更正：稿上原本寫家常菜，H8 在滇香 */
  const SR={
    heroine_01:{first:['木曜日？那間我常去。窗邊那桌什麼時候會空，我知道。'],acc:{A:['好。我先去占位子。'],R:['好。']},plan:['那時候我排了別的。{zh}可以嗎？'],
      here:['我已經在木曜日了。窗邊。'],firstAt:['（老闆看到她，直接去做一杯焙茶拿鐵，沒有問她要什麼。）','（小聲）我每次都點一樣的。所以他不問了。'],walk:['這條巷子每一棟都長得很像。我是認二樓窗外那棵樹。']},
    heroine_02:{first:['木曜日？離我們店才兩條巷子，好啊，我一直想進去偷看。'],acc:{A:['好啊。我坐那邊會很想去幫他們洗杯子，你要拉住我。'],R:['好啊，我帶小說去。這次真的會看。']},
      plan:(G,c)=>c&&c.r&&c.r.act==='barista'?null:['那時候我有事啦。{zh}好不好？'],firstAt:['（焙茶拿鐵端上來，她先看了很久才喝。）','（小聲）奶泡打得比我細。','（小聲）不要跟我們老闆講。'],walk:['溫州街的咖啡店，誰跟誰是朋友，我大概都知道。','只有木曜日的老闆，從來不出來串門子。']},
    heroine_03:{first:['木曜日……那裡很安靜，可以坐一下午。','好。'],acc:{A:['好。我帶筆記。'],R:['好。我那天剛好要寫報告。']},plan:['那時候不行。{zh}。'],here:['我在木曜日。你來。'],
      firstAt:['（她看了一圈牆上的唱片，停在其中一張前面。）','（小聲）這張茶屋也有。蘇姨只在打烊以後放。'],walk:[{if:G=>ytH8(G),l:['118 巷那間牛排的老闆娘人很好。我去問過她開店的事。']},{if:G=>!ytH8(G),l:['溫州街這些老房子，一樓開店的，老闆多半住樓上。','你看二樓的窗戶，有曬衣服的就是。']}]},
    heroine_04:{first:['木曜日？有插座嗎？','（你說沒有。）','好。我充飽再去。'],acc:{A:['好啊。那裡沒有插座，我帶行動電源，兩顆。'],R:['好。我寫程式，你念書。誰先分心誰請下一杯。']},plan:['那時候不行。{zh}？'],
      firstAt:['（她把筆電打開，先看了一眼電量，才把外套脫掉。）','（小聲）百分之九十八。夠我寫到打烊。'],walk:['這條巷子好窄。做成地圖的話，鏡頭一定會卡牆。']},
    heroine_05:{first:['木曜日……我大一常去。','好。'],acc:{A:['可以。我只能待一個半小時。'],R:['好。今天我不趕。']},plan:['那時候我有安排了。{zh}，可以嗎？'],
      firstAt:['（她坐下來，先用紙巾把桌上的水漬擦乾，才把書放上去。）','（小聲）這張桌子我大一坐過。……桌腳還是會晃。'],
      walk:[{if:(G,c)=>c.year<=2,l:['溫州街的店，我大一的時候只進過兩間。','每天都在想要念什麼，沒在想要去哪。']},{if:(G,c)=>c.year>=3,l:['我現在比較常來了。','念不下去的時候。']}]},
    classmate_peishan:{first:['木曜日？好啊！我一直想進去，可是那裡太安靜，我一個人會很想講話。'],acc:{A:['好啊！我帶課本，有問題我用寫的問你。'],R:['好。你念你的，我念我的，念完一起吃飯。']},plan:['啊，那時候我有事！{zh}可以嗎？'],
      firstAt:['（她進門先把每一桌的小檯燈看過一遍，才坐下來。）','（小聲）這種燈，我媽一定會先問一盞多少錢。'],walk:['你看那間門口的小黑板，手寫的。','我們家的菜單也是我寫的。字很醜，可是客人說看得懂。']},
    kexin:{first:['木曜日？那我星期四以外去，算不算違規。','好，我過去。四十分鐘。'],acc:{A:['好。我坐窗邊，你坐對面，不准講話。'],R:['好。我帶刑總，你負責讓我不要睡著。']},plan:['那時候不行。{zh}，不准再改。'],
      firstAt:['（她點了焙茶拿鐵，喝一口，看了一下價錢。）','（小聲）一百五。','（小聲）好喝。可是我要坐滿三個小時才划算。'],walk:['你們學校旁邊的巷子都長得好像。我上次在這裡走錯兩次。']} };
  INVITE_DATA.slowreadLines=SR;
  for(const id in SR){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}), x=SR[id]; for(const k in x) (p[k]||(p[k]={})).slowread=x[k]; } })();
/* ---------- AA_535b（INVITE-OPTS-1030 第二份，AA-B 定稿，企劃線 2dbcc5691；第②級）第 2 節：新的校內地點 ----------
   2-1 法律學院圖書館（法圖）：念書；剛認識就可以約（reason）；開放時間照 places.js 的 lawlib（學期中平日 08:10～21:45、週末 09:10～17:00；寒暑假照那裡的規則；hoursFrom），坐一個半小時＝最晚關門前 1.5 小時開始。
       選單、字幕寫「法律學院圖書館」，台詞說「法圖」。可昕（外校）、沛珊大三起（不在這裡念了）：婉拒、改提慢讀咖啡——同一時間慢讀有開就約到慢讀，沒開照系統的改天（INVITE_DATA.toSlow）；
       芷若、子晴：認識階段婉拒（太安靜），有點熟以上照約（芷若有點熟也用 acc R 那句；INVITE_DATA.lv0）；學姊：念書類不算上限、筆試前那一句、她本來就在法圖的時段＝here。
   2-2 映月湖（校園的湖）：散步類（兩個人單獨的規則照溫州街）、朋友以上、16:00～22:00（約 17:30、19:00、21:00）、下雨改 Café；在南岸木棧道口等（meetAt）；學姊筆試前照溫州街婉拒；只有朋友以上，台詞只寫 R。
   台詞一字照稿；見面旁白在 rel_lines.js 的 meet.lawlib／meet.lake */
INVITE_DATA.lv0=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&['STRANGER','ACQUAINTANCE'].includes(SOCIAL.friendLevel(id));   /* 認識階段（還沒到有點熟）*/
INVITE_DATA.toSlow=function(G,id,c,I,lines){ const Q=I.place('slowread'); if(!Q||(Q.show&&!Q.show(G,id))) return {res:'decline',why:'outsider',lines:lines.slice(),alt:null};
  const a=I.freeAt(G,id,Q,c.day,c.h)?{day:c.day,h:c.h}:I.nextFree(G,id,Q,c.day,c.h+0.5); return {res:a?'resched':'decline',why:'outsider',lines:lines.slice(),alt:a?{day:a.day,h:a.h,place:'slowread'}:null}; };   /* 法圖進不去＝改約慢讀（AA_535b 2-1）*/
INVITE_DATA.places.push({id:'lawlib',zone:'lawlib',name:'法律學院圖書館',verb:'去法圖一起念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1.5,memory:'LAWLIB_TOGETHER',sitAct:'read',seatPose:'read',cats:['study'],hoursFrom:'lawlib'});
INVITE_DATA.places.push({id:'lake',zone:'campus',name:'映月湖',verb:'去映月湖走走',kind:'walk',minStage:'FRIEND',stay:0.75,memory:'LAKE_WALK',sitAct:'wait',hours:[16,22],times:[17.5,19,21],rainTo:'cafe',meetAt:[-39,-97.6,Math.PI]});   /* meetAt：湖南岸步道、木棧道口（zones3d.js 的 lake：湖中心 (-36,-112)，木棧道接到南岸步道 z≈-98.6）*/
(function(){
  const LAW={
    heroine_01:{first:['法圖？那裡冷氣比總圖冷。我帶外套。'],acc:{A:['好。三樓，靠書架那排。'],R:['好。我幫你留位子。']},plan:['那時候我有課。{zh}可以嗎？'],
      firstAt:['（她走到判解那一區，熟門熟路地抽出一本，連目錄都沒看。）','判決都在這一區。大一我常來。'],walk:['法圖平日開到九點四十五。我查過了。']},
    heroine_02:{first:['法圖？我可以進去喔？那我要去看你們的書有多厚。'],acc:{A:['好。我帶小說，坐你旁邊，不吵你。'],R:['好。我帶小說，坐你旁邊，不吵你。']},plan:['那時候我有事啦。{zh}好不好？'],   /* 有點熟（band A）也用 acc R 那句；認識階段在 rule 婉拒 */
      firstAt:['（她抽出一本很厚的書，翻開，又小心地放回去。）','這本比我的頭還重。你們每天都在看這個喔？'],walk:['法律系的人走路都好快。你們是不是都在趕什麼？']},
    heroine_03:{first:['法圖……我沒進去過。','好。'],acc:{A:['好。我帶自己的書。'],R:['好。你們那邊比較安靜，我要寫報告。']},plan:['那時候不行。{zh}。'],
      firstAt:['（她在入口的告示前面停下來，把開放時間抄進筆記本。）','我們系的圖書室，五點就關了。'],walk:['你們系的人，好像都背很大的包包。']},
    heroine_04:{first:['法圖？我進去會不會被趕出來？','（你說不會。）','好。有插座嗎？'],acc:{A:['好。我寫程式，你念書。我會很安靜。……大概。'],R:['好。我寫程式，你念書。我會很安靜。……大概。']},plan:['那時候不行。{zh}？'],
      firstAt:['（她看到一整面的判決彙編，停住了。）','這是你們的資料庫喔。實體的。'],walk:['你們系館的電梯，是不是比我們的還慢。']},
    heroine_05:{first:['好。我在三樓。'],acc:{A:['好。我平常的位子旁邊有空位。'],R:['好。今天我請你喝販賣機的。']},plan:['那時候我有安排了。{zh}，可以嗎？'],here:['好啊，我在法圖三樓。到了跟我說。'],
      firstAt:['（她走到三樓靠窗的位子，桌上已經有一疊她的書。）','我常常忘了帶走。館員幫我留著。'],walk:['法圖的樓梯很陡。我大一常常爬到一半就喘。']},
    classmate_peishan:{first:['法圖！我一直想問，你都坐哪裡？'],acc:{A:['好！我帶民總，有問題問你。'],R:['好。我們坐同一排就好，不用坐隔壁。……坐隔壁我會一直講話。']},plan:['啊，那時候我有事！{zh}可以嗎？'],
      firstAt:['（她在借書櫃台問了館員三個問題，館員都回答了。）','（走出法圖）館員人好好。我以為法圖的人都很兇。'],walk:['你知道法圖幾點關嗎？我每次都記錯。']} };
  const LAKE={
    heroine_01:{first:['映月湖？好。我還沒有晚上去過。'],acc:['好。'],plan:['那時候我有讀書會。{zh}可以嗎？'],firstAt:['（湖面上有路燈的倒影。她站在木棧道上看了很久。）','白天我都是走過去，沒有停下來過。'],walk:['湖心亭那邊，大一的時候有人在拍婚紗。那天我趕著上課，只看了一眼。']},
    heroine_02:{first:['映月湖！我超喜歡那裡晚上的樣子，很像電影。'],acc:['好啊。你要不要我帶相機？'],plan:(G,c)=>c&&c.r&&c.r.act==='barista'?null:['那時候我有事啦。{zh}好不好？'],firstAt:['（她拿手機對著湖心亭拍了好幾張，每一張都蹲得更低。）','這個角度，可以當電影的最後一幕。'],walk:['有一部電影的告白，就是在湖邊。……我不講是哪一部，你自己猜。']},
    heroine_03:{first:['映月湖……晚上很安靜。好。'],acc:['好。我跟店裡說一聲。'],plan:['那時候不行。{zh}。'],firstAt:['（她在木棧道邊蹲下來，看水裡的魚。）','牠們不怕人。大家都會餵。'],walk:['蘇姨說，以前湖邊有一個賣豆花的。後來就不見了。']},
    heroine_04:{first:['映月湖？晚上去？會不會有蚊子。','好啦。'],acc:['好。我帶防蚊液。這是條件。'],plan:['那時候不行。{zh}？'],firstAt:['（她看著湖心亭的燈，拿出手機開了一個空白的檔案。）','這個場景，我要做進下一關。'],walk:['湖的形狀要做成地圖的話，邊邊很難畫。']},
    heroine_05:{first:['映月湖。好。我很久沒有不念書地走路了。'],acc:['好啊。'],plan:['那時候我有安排了。{zh}，可以嗎？'],firstAt:['（她站在湖邊，手上什麼都沒拿。）','這裡比我記得的安靜。'],walk:['我大一的時候，常常繞這個湖背書。一圈背一條。']},
    classmate_peishan:{first:['映月湖！好啊，我想看湖心亭晚上有沒有開燈。'],acc:['好！走完我們去吃東西。'],plan:['啊，那時候我有事！{zh}可以嗎？'],firstAt:['（她走到湖心亭，摸了一下欄杆。）','這欄杆好舊。我們家店門口也有一個這麼舊的。'],walk:['你有沒有覺得，晚上的學校跟白天是兩個地方。']},
    kexin:{first:['映月湖？你們學校的湖？好，我去看看有多大。'],acc:['好。我從木柵過去，你負責晚餐。'],plan:['那時候不行。{zh}，不准再改。'],firstAt:['（她繞到湖的另一邊看了一下，又走回來。）','比我們學校的大一點。……一點點。'],walk:['你們學校晚上的路燈比較亮。我們山上比較黑。']} };
  /* AA_595 1-D10（AA 11-02 22:30 定稿）：沛珊第一次去法圖的第二句前面加「（走出法圖）」——櫃台那句旁白照留，這一句走出去才說、不加（小聲）（LIBQ.isOut；INV.meet 從這句起到道別都不加）。
     她說的：動作在前面、說的話不加「」（「（走出法圖）館員人好好。……」，TEXT-QUOTE-UNIFY-1108 第六批，AA-B 11-08 11:50；S.narrLine 看整句是不是一對（））*/
  INVITE_DATA.lawlibLines=LAW; INVITE_DATA.lakeLines=LAKE;
  for(const [pid,T] of [['lawlib',LAW],['lake',LAKE]]) for(const id in T){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}), x=T[id]; for(const k in x) (p[k]||(p[k]={}))[pid]=x[k]; } })();
/* ---------- AA_118 第 2 節「一起走路聊什麼」× AA_555 第 1 節改稿（企劃線 56c11668d；AA555-WALK-TALK-1031；AA 六位每人每學年 6 句）----------
   台詞一字不改：AA_555 有列的照 AA_555 的「改」，沒列的照 AA_118 原句（舊稿的名字一律換 Alison，AA_380）；以安大二下交換說明會那句照 AA_185 3-14 的新寫（AA_118 該列標「→ 改字」）。
   接法（AA_555 第 4 節）：放進 walk（目的地對得上的放那個地點：「→ 麵店」noodle、「→ 總圖」library、「→ Café」cafe、「溫州街」wenzhou；其他放 any），和 AA_70 原有的句子一起輪（invites3d.js S.walkPick，同一個人輪流）；
   每句 one＝只說一次（AA_118 第 0 節「同一句只出現一次」）。條件：學年（學期中照學期、寒暑假照日期，9 月起算新學年）＋稿上的時機（AA_555 第 4 節「照學年、條件挑」；標「（某事件之後）」的＝那件事演過）。
   時機寫法的技術預設（稿沒寫死的，LAWWW 子代理照最保守的定，要問 AA 的寫在回報）：開學＝第 1～4 週；期中前＝第 5～8 週；期中放榜後＝第 10～13 週；期末前＝第 13～16 週；期末＝第 14～16 週；寒假前＝上學期第 14～16 週；
   冬天、寒流＝12～2 月；杜鵑花＝3 月；中秋（大三版）＝2027 中秋 9/15 前後三天；畢業前＝大四下第 10 週起；畢業典禮＝6/2～6/3；畢業典禮前一天／前一晚＝6/1；畢業典禮前＝大四下第 14～15 週、6/2 以前；
   二十三週年前＝2028-12-04～12-13（12/14 那一場，AA_181）；國考倒數兩百天＝2029-08-04 前 200 天（1/16）前後兩週；台灣路線＝STORY.route 是 TW；晚上＝18:00 以後、傍晚＝16:30～19:00、早上＝12:00 以前。 */
(function(){
  const C=()=>typeof CALENDAR!=='undefined'?CALENDAR:null;
  const tm=G=>{ const c=C(); return c&&c.termOf?c.termOf(G.day):null; };
  const ay=G=>{ const t=tm(G); if(t) return +String(t.id).charAt(1); const c=C(); if(!c||!c.dateOf) return null; const x=c.dateOf(G.day); return x.y-(x.m>=9?2024:2025); };   /* 學年：大一＝2025-09～2026-08；經濟系那一年＝0 */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const Y=n=>G=>ay(G)===n;
  const inT=(id,w0,w1)=>G=>{ const t=tm(G); return !!t&&t.id===id&&t.week>=(w0||1)&&t.week<=(w1||99); };
  const yrT=(n,w0,w1)=>G=>{ const t=tm(G); return !!t&&+String(t.id).charAt(1)===n&&t.week>=(w0||1)&&t.week<=(w1||99); };   /* 那一學年的上下學期都算 */
  const mon=(...ms)=>G=>{ const c=C(); return !!c&&ms.includes(c.dateOf(G.day).m); };
  const hr=(a,b)=>G=>{ const h=((G.hour%24)+24)%24; return h>=a&&h<(b==null?24:b); };
  const done=(...ids)=>G=>!!(G.events&&G.events.done&&ids.some(id=>G.events.done[id]));
  const has=(who,tag)=>()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(who,tag);
  const fl=f=>G=>!!(G.flags&&G.flags[f]!=null&&G.flags[f]!==false);
  const from=(k,h)=>G=>{ const d=DK(k); return d!=null&&G.day*24+G.hour>=d*24+(h||0); };   /* 那個時刻（含）以後 */
  const before=k=>G=>{ const d=DK(k); return d!=null&&G.day<d; };
  const on=(...ks)=>G=>ks.some(k=>DK(k)===G.day);
  const between=(a,b)=>G=>{ const x=DK(a), y=DK(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; };
  const tw=G=>(typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null)==='TW';
  const all=(...fs)=>(G,c)=>fs.every(f=>f(G,c));
  const not=f=>(G,c)=>!f(G,c);
  const moon3=between('2027-09-12','2027-09-18');   /* 2027 中秋 9/15（calendar.js LUNAR）前後三天 */
  const a23=between('2028-12-04','2028-12-13');
  const grad=on('2029-06-02','2029-06-03'), gradEve=on('2029-06-01'), gradPre=all(inT('Y4S2',14,15),before('2029-06-02')), gradNear=inT('Y4S2',10);
  const friend=id=>()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel(id));
  const club=id=>G=>{ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list||!ACTIVITIES.on) return false; const a=ACTIVITIES.list.find(x=>x.id===id); return !!a&&!!ACTIVITIES.on(a,G.day,G); };
  const disc=(rec,i)=>G=>{ const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):null; return !!R&&!!R.disc&&R.disc[rec]===i; };
  const att=spec=>G=>typeof CLS!=='undefined'&&!!CLS.attendedWeek&&CLS.attendedWeek(G,spec);
  const skipped7=G=>{ const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):null; if(!R||!R.note) return false; for(const k in R.note){ const m=/^skip_(-?\d+):/.exec(k); if(m&&+m[1]<=G.day&&G.day-(+m[1])<=7) return true; } return false; };   /* 這七天翹過課（classes3d.js skipNotes 記的 skip_<日>:<課>…）*/
  const W=(one,where,cond,lines)=>({one,where,if:cond,l:lines});
  const DATA={
    zhe:[
      W('w118_zhe_1','noodle',Y(1),['哥，第一排的人都在幹嘛？我坐後面只看得到他們的後腦勺在點頭。']),
      W('w118_zhe_2','any',inT('Y1S1',3,4),['椰影大道走到底要七分鐘。我量過。遲到的時候是四分鐘。']),   /* 開學第三週：第 3～4 週 */
      W('w118_zhe_3','any',Y(1),['意思表示，就是你說的話算不算數嘛。那我跟我媽說會早點回家，算嗎？']),
      W('w118_zhe_4','any',yrT(1,5,8),['「宵夜是讀書的一部分。這叫補充體力的權利。」「沒有這個權利。」「先有。」']),
      W('w118_zhe_5','any',all(Y(1),mon(12,1,2)),['寒流來我就想吃薑母鴨。這是反射動作，不是我能控制的。']),
      W('w118_zhe_6','any',all(inT('Y1S2'),mon(3)),['Alison 說要在杜鵑花前面拍照。我說好啊，她說『不是跟你』。那她幹嘛跟我說。']),   /* AA_555 1-1〔名〕*/
      W('w118_zhe_7','any',inT('Y2S1',1,4),['房東說押金是『好朋友的保證』。好朋友要押兩個月喔？']),
      W('w118_zhe_8','any',Y(2),['學長說我傳球太自私。我是覺得球在我手上比較安全。']),
      W('w118_zhe_9','any',inT('Y2S1',4),['小考我又沒過。可是這次我知道我錯在哪裡。這算進步吧。']),   /* 債總小考後：大二上第 4 週起 */
      W('w118_zhe_10','any',all(Y(2),done('ev_yu_together')),['哥，交女朋友以後，我第一次記得要回訊息。回得很慢，可是有回。']),   /* AA_555 1-1〔麵〕；語 3 之後 */
      W('w118_zhe_11','library',yrT(2,13,16),['我第一次在總圖坐滿三個小時。中間只出去買了兩次飲料。']),   /* AA_555 1-1〔模〕：期末前，總圖 */
      W('w118_zhe_12','any',all(Y(2),hr(18)),['這條路晚上很暗。我每次走都唱歌。……不要笑，這是安全措施。']),   /* AA_555 1-1〔三〕〔時〕：舟山路，晚上 */
      W('w118_zhe_13','any',all(Y(3),done('ev_zhe_captain')),['當隊長以後才知道，叫人來練球比自己練球難十倍。']),
      W('w118_zhe_14','any',inT('Y3S1'),['「證據要合法取得。那我偷看隊友的戰術本，算不算？」「那是隊友。」「喔對，那是團隊合作。」']),   /* 刑訴下課：刑訴在大三上 */
      W('w118_zhe_15','any',moon3,['中秋烤肉，我負責顧火。火很旺。肉沒有熟。']),   /* AA_555 1-1 */
      W('w118_zhe_16','any',all(Y(3),done('ev_yt_lease_renew')),['秀琴姨說續約五年。五年後我們都畢業了耶。那我們要去台中找她。']),
      W('w118_zhe_17','any',all(tw,between('2028-04-22','2028-04-28')),['我想練完再自己投一百球。你可以不用陪我。可是你可以陪我。']),   /* 冠軍賽 4/29（group3d.js 1C-04）前一週 */
      W('w118_zhe_18','any',all(tw,inT('Y3S2'),from('2028-04-29',21)),['我爸說我投籃的姿勢跟他年輕的時候一樣醜。他笑得很開心。']),
      W('w118_zhe_19','any',inT('Y4S1',1,4),['大四了。A館的樓梯，好像一下就走完了。']),
      W('w118_zhe_20','any',Y(4),['大家都在講國考。我只確定一件事：考試那天我要吃燒臘店的三寶飯。']),
      W('w118_zhe_21','any',a23,['蘇姨要我們幫忙辦十週年。我說好，然後發現我只會吃。']),
      W('w118_zhe_22','any',Y(4),['學弟問我法律系難不難。我說很難，他問那你怎麼還在。……對耶，我怎麼還在。']),
      W('w118_zhe_23','any',gradNear,['椰影大道走到底要七分鐘。我大一就量過。今天走了十分鐘，故意的。']),
      W('w118_zhe_24','any',gradEve,['我媽說要拍一百張。我說十張就好，她說那拍九十張。']) ],
    yu:[
      W('w118_yu_1','any',all(Y(1),hr(0,12),has('yu','BREAKFAST_YU')),['欸，今天也經過！','晨思鐘到底幾點會敲？不要查，我想先聽你猜。']),   /* AA_555 1-2〔實〕；AA_118：有 BREAKFAST_YU 的玩家先聽到「欸，今天也經過！」*/
      W('w118_yu_1','any',all(Y(1),hr(0,12),not(has('yu','BREAKFAST_YU'))),['晨思鐘到底幾點會敲？不要查，我想先聽你猜。']),
      W('w118_yu_2','any',all(Y(1),club('club_guitar'),hr(19)),['我今天學了三個和弦，又在學辯論的立論。現在我腦袋裡是 C 和弦在反駁 G 和弦。']),   /* AA_555 1-2〔口〕；吉他社社課後＝社課那天 19:00 以後 */
      W('w118_yu_3','any',all(Y(1),hr(18)),['我要回板橋了。欸，你陪我走到捷運站就好，到站我就可以自己。']),
      W('w118_yu_4','any',Y(1),['欸，十八歲生日那天跟前一天差在哪？……好啦，差在法律有寫。']),
      W('w118_yu_5','any',yrT(1,13,16),['總圖好安靜。安靜到我聽得到自己在想事情。……這很可怕好不好。']),
      W('w118_yu_6','any',all(inT('Y1S2'),mon(3)),['以安說要『每年同一個位置』拍杜鵑花。我說那我要每年同一個表情。']),
      W('w118_yu_7','any',all(inT('Y1S2'),fl('SIS_RESULT_OUT')),['學姊考上研究所了。我以後也要考，司法官。我說出來了，你要幫我記住。']),   /* AA_555 1-2〔時〕：搬到大一下、學姊放榜（3/23 SIS_RESULT_OUT）之後 */
      W('w118_yu_8','any',Y(2),['我們輸了。評審說我們『情緒很多、理由很少』。……欸，那是在說我嗎？']),
      W('w118_yu_9','any',all(inT('Y2S1'),hr(0,12),fl('YU2_PICK'),not(done('ev_yu_together'))),['阿哲最近一直剛好路過晨思鐘。他住公館耶。你不覺得很奇怪嗎？']),   /* AA_555 1-2〔口〕；語 2 之後（YU2_PICK）、還沒在一起 */
      W('w118_yu_10','any',Y(2),['我今天辦了一個活動、開了兩個會、回了八十則訊息。我很充實。我好累。兩句都是真的。']),
      W('w118_yu_11','any',all(Y(2),done('ev_yu_together')),['阿哲吃飯好快。我說吃飯不是比賽，他說『可是我贏了』。']),
      W('w118_yu_12','any',Y(2),['這學期換我出題。我出了一題我自己也答不出來的。']),   /* AA_555 1-2〔模〕*/
      W('w118_yu_13','any',inT('Y3S1'),['我把系學會交出去了。第一次一個星期只有兩個社團。好空。']),
      W('w118_yu_14','any',moon3,['今年中秋有月亮。去年下雨，我記得。']),   /* AA_555 1-2 */
      W('w118_yu_15','any',inT('Y3S1',13,16),['我開始覺得總圖安靜的樣子還不錯。不要跟阿哲說，他會很傷心。']),
      W('w118_yu_16','any',all(tw,inT('Y3S2'),done('ev_yu_alone_breakfast')),['練習一個人吃早餐，第三天。今天的豆漿特別甜。可能是因為我有在喝。']),   /* AA_555 1-2〔口〕*/
      W('w118_yu_17','any',all(tw,inT('Y3S2'),has('yu','YU_ALONE')),['中間有一段好好笑，我轉頭想跟人說，旁邊是一個不認識的阿伯。他也在笑。']),
      W('w118_yu_18','any',all(tw,inT('Y3S2'),(G,c)=>done('ev_yu_club_money')(G)||has('yu','YU_CLUB_BEAR')()),['學弟傳了一隻鞠躬的熊給我。我把它設成手機桌布了。']),
      W('w118_yu_19','library',all(inT('Y4S1'),has('yu','YU_ALONE')),['我的晚上變成每天了。一個人念書，我現在可以了。']),
      W('w118_yu_19','library',all(inT('Y4S1'),not(has('yu','YU_ALONE'))),['我在練習一個人念書。還不太習慣。']),
      W('w118_yu_20','any',inT('Y4S1'),['欸，今天有學妹說她怕一個人吃飯。我說我以前也是。然後我陪她吃了。']),
      W('w118_yu_21','any',a23,['阿哲寫了三張講稿。我看了，三張都在謝阿姨的滷蛋。']),
      W('w118_yu_22','any',between('2029-01-02','2029-01-30'),['倒數兩百天。阿哲每天傳一張燒臘店的照片，說是精神食糧。我好餓。']),   /* AA_555 1-2〔口〕 */
      W('w118_yu_23','any',gradNear,['我四年參加過七個社團。最後留下來陪我的，是我自己。……好啦，還有阿哲。']),
      W('w118_yu_24','any',grad,['你要跟我拍一張。不對，兩張：一張跟大家，一張我自己。']) ],   /* AA_555 1-2〔口〕 */
    classmate_bohan:[
      W('w118_bh_1','library',Y(1),['從A館到總圖，正常走六分鐘，快走四分鐘。我都快走。']),
      W('w118_bh_2','any',inT('Y1S1',10,13),['第三題我寫了原則。出題的人想考的是例外。下次我先找例外。']),   /* AA_555 1-3〔比〕 */
      W('w118_bh_3','any',all(Y(1),friend('classmate_bohan')),['我小時候養過一隻烏龜。牠每天只做一件事：曬太陽。我那時候覺得牠很浪費時間。']),   /* F-翰1：朋友以上 */
      W('w118_bh_4','library',all(Y(1),mon(12,1,2)),['閉館前最後二十分鐘，效率是平常的一半。我算過。所以我九點四十就走。']),
      W('w118_bh_5','any',inT('Y1S1',14,16),['回新竹要一個多小時。我哥說我在車上也念書很誇張。我說那是複習，不算念書。']),
      W('w118_bh_6','any',inT('Y1S2',13,16),['坐第一排的好處是，老師的口水會噴到你，你就不會睡著。']),
      W('w118_bh_7','any',Y(2),['學姊交接給我一本筆記。第一頁寫『不要讓學弟妹只會考試』。她是在說我嗎？']),   /* 柏翰大二是法服社長（固定設定）*/
      W('w118_bh_8','any',all(inT('Y2S1',10),done('ev_bohan_exam_group')),['小組有人退出了。他說壓力太大。我第一次想，是不是我太大聲了。']),   /* 翰 2（第 7 週）第三週之後 */
      W('w118_bh_9','any',inT('Y2S1',10),['這題我寫了三頁。教授批了一個『嗯』。一個『嗯』是幾分？']),
      W('w118_bh_10','any',all(Y(2),done('ev_bohan_exam_group')),['以安說報告先講最強的論點，我說先講最穩的。後來先講了最強的。她是對的。']),   /* AA_555 1-3〔模〕：考古題小組報告之後 */
      W('w118_bh_11','any',Y(2),['我哥說，坐第一排最大的收穫，是知道後排的人在想什麼。……他在後排待過嗎？']),
      W('w118_bh_12','any',inT('Y2S2',16),['「考完了，我在總圖門口站了五分鐘，不知道要去哪。你要去哪？」「燒臘店。」「……喔。好。那你去。」']),
      W('w118_bh_13','any',inT('Y3S1'),['這題沒有標準答案。我居然寫得很開心。']),
      W('w118_bh_14','any',all(Y(3),(G,c)=>fl('BH4_DONE')(G)||done('ev_bohan_third_floor')(G)),['那天在四樓說的話，你可以忘記。……不要真的忘記。']),
      W('w118_bh_15','any',all(Y(3),skipped7),['你沒來的那堂，我筆記多寫了一頁。那堂真的很重要。你拿去影印。']),
      W('w118_bh_16','any',inT('Y3S1',12),['我寫給下一屆的第一頁是『不要只教他們考試』。我抄學姊的。我現在懂了。']),
      W('w118_bh_17','any',all(tw,inT('Y3S2')),['讀書計畫我寫了三版。第一版全部是分數。']),
      W('w118_bh_18','any',all(tw,inT('Y3S2',13,16)),['我開始在休息的十分鐘講法律的事了。這樣是不是代表我沒在休息。']),
      W('w118_bh_19','any',all(Y(4),from('2028-10-26',10.5)),['教授問我為什麼想念研究所。我準備了一個漂亮的答案。我講了另一個。']),   /* 推甄面試 10/26（r2y4a_events.js 2-Y4-06）之後 */
      W('w118_bh_20','any',all(Y(4),from('2028-11-23',15)),['推甄上了。我傳給我哥，他回了一個烏龜的貼圖。……他記得那隻烏龜。']),   /* 放榜 11/23 15:00 之後 */
      W('w118_bh_21','any',Y(4),['考古題我給了。然後我跟他說：考古題只能告訴你，別人考過什麼。']),
      W('w118_bh_22','library',all(Y(4),mon(12,1,2)),['我還是九點四十離開總圖。現在是因為燒臘店十點打烊。']),
      W('w118_bh_23','any',gradNear,['四年我坐了一百多堂第一排。最後一堂，我想坐後面看看。']),
      W('w118_bh_24','any',grad,['我哥說他要坐後面。他說後面才看得到全部的人。']) ],
    classmate_xinci:[   /* AA_555 1-4（〔慈〕〔比〕：多數重寫，「照原句」的照 AA_118）*/
      W('w118_xc_1','library',Y(1),['紅筆寫要件，藍筆寫例外，綠筆寫老師的笑話。黑筆是我自己的話。……黑筆最少。']),
      W('w118_xc_2','any',Y(1),['老師說『原則上』，我就知道後面有例外。我爸講案子也是這樣，前面都很好聽。']),
      W('w118_xc_3','any',all(Y(1),done('ev_xinci_double')),['從A館走到財金那邊十分鐘。走到的時候，腦袋剛好換完。']),   /* 雙主修：她說過雙主修（ev_xinci_double）以後 */
      W('w118_xc_4','any',Y(1),['我昨天沒有在追劇。第八集很好看。']),
      W('w118_xc_5','library',yrT(1,13,16),['筆記借出去五次。有一次還回來多了一頁，是別人的字。寫得很好。我把那一頁影印起來了。']),
      W('w118_xc_6','any',inT('Y1S2'),['我媽今天打來，問我中午吃什麼。我說還沒吃，她就一直講到我去買。']),
      W('w118_xc_7','any',inT('Y2S1',8,9),['財管的期中考完，下午接債總。早上算利息，下午聽遲延利息。至少主題有連起來。']),
      W('w118_xc_8','any',all(Y(2),done('ev_xinci_second')),['那天在便利商店說的，數字對起來那個。我第一次跟同學講這個。']),   /* 慈 3 新版 */
      W('w118_xc_9','any',Y(2),['我爸今天出庭，傳了一張法院走廊的照片給我。沒有字。他每次順利都這樣。']),
      W('w118_xc_10','any',all(Y(2),G=>Array.isArray(G.flags&&G.flags.SK10_DONE)&&G.flags.SK10_DONE.length>0),['我問阿勳統計，他問我民法。交換了一個下午。這是我做過最划算的交易。']),   /* BB_106 SK10（bbpack3d.js SK10_DONE）之後 */
      W('w118_xc_11','library',Y(2),['這學期我把四色筆換成五色。多的那一色寫財金。']),
      W('w118_xc_12','any',inT('Y2S2',13,16),['期末前我會先把桌面清空。我媽說我跟她一樣，考試前一定要先整理。']),
      W('w118_xc_13','any',all(Y(3),from('2027-11-18',12)),['我不去交換。雙主修還要修二十幾個學分。……我其實有點想去。']),   /* 交換志願表截止 11/18 12:00 之後 */
      W('w118_xc_14','any',all(Y(3),done('ev_xinci_an_answers','ev_xinci_an_answers_far')),['那天對答案，以安有一題跟我寫得不一樣。我們吵了二十分鐘，最後發現兩種寫法都可以。']),
      W('w118_xc_15','any',inT('Y3S1'),['老師說程序不是要件，是規則的規則。這句我用黑筆寫。']),
      W('w118_xc_16','any',all(tw,inT('Y3S2')),['以安不在，讀書會的筆記換我整理。她說我的版本比較好讀。我收下了。']),
      W('w118_xc_17','any',all(inT('Y3S2'),done('ev_xinci_first_place','ev_xinci_first_place_video')),['暑假我想去事務所實習。不是我爸媽那間。他們聽到的時候笑得很開心。']),   /* 慈 6 之後 */
      W('w118_xc_18','any',all(tw,inT('Y3S2',14,16)),['財金的報告，我做了一個併購案的模型。數字全部對起來的時候，我在總圖小聲叫了一下。']),
      W('w118_xc_19','any',inT('Y4S1'),['我列了兩欄，優點和缺點。第三欄是『我想不想』。第三欄最難寫。']),
      W('w118_xc_20','library',all(Y(4),mon(12,1,2)),['筆用完第十二支了。四年。黑筆用得最快。']),
      W('w118_xc_21','any',Y(4),['我借了。然後跟她說，例外的部分，自己寫一次。']),
      W('w118_xc_22','any',Y(4),['以安帶了一本日本的筆記本給我。格子的。她記得我喜歡格子的。']),
      W('w118_xc_23','any',gradNear,['四年的筆記裝了三個箱子。要丟的時候，我一本都丟不下去。']),
      W('w118_xc_24','any',grad,['我媽問我四年最得意的是什麼。我說，是我跟以安變成朋友。……她以為我會說成績。']) ],
    heroine_03:[
      W('w118_yt_1','any',all(Y(1),hr(16.5,19)),['那個騎樓下的阿伯，每天五點來，坐到六點。我不知道他在等誰。']),
      W('w118_yt_2','noodle',Y(1),['老師說，每個人都在演一個角色。……秀琴姨演的是秀琴姨。']),
      W('w118_yt_3','wenzhou',Y(1),['這家冰店夏天才開。冬天老闆去哪裡？我每年都想問。']),
      W('w118_yt_4','any',all(Y(1),hr(19)),['今天客人比較少。蘇姨說是下雨。我覺得是隔壁開了新的店。']),
      W('w118_yt_5','library',yrT(1,13,16),['三樓靠窗那個位子，八點以前要到。我八點零五分到過一次。被坐走了。']),
      W('w118_yt_6','any',all(Y(1),done('ev_yutong_landlord')),['秀琴姨的房東來，她倒了一杯茶給他。他沒喝。']),
      W('w118_yt_7','any',Y(2),['今天茶屋那個阿伯講了半小時他的房東。我一直聽。……他走的時候，多付了一盤茶點的錢。']),   /* AA_555 1-5〔法服〕：原本要事件 7 新版（ev_yt_shift_chat）之後；AA_661 第 17 列：那一段退場（她不在麵店、不在法服），讀它的條件拿掉＝大二起 */
      W('w118_yt_8','any',all(Y(2),(G,c)=>done('ev_yt_lease_text')(G)||has('heroine_03','LAW_MEETS_LIFE')()),['買賣不破租賃。我抄在菜單背面了。']),   /* 事件 8 */
      W('w118_yt_9','any',all(Y(2),hr(16.5,19)),['我在練習寫田野筆記。今天寫修鞋店。老闆說他的手比他的腳還老。']),
      W('w118_yt_10','any',all(Y(2),has('heroine_03','RENT_CONSULTATION')),['那天秀琴姨講到一半就停了。我在旁邊，把她沒講完的記下來了。']),   /* AA_555 1-5〔法服〕：事件 9 新版（RENT_CONSULTATION）之後 */
      W('w118_yt_11','any',all(inT('Y2S2'),mon(3)),['蘇姨說她年輕的時候，有人在這裡跟她告白。她說『後來沒有後來』。']),
      W('w118_yt_12','any',inT('Y2S2',14,16),['我去社會系問了助教的事。他們說大三可以。我想試試看。']),
      W('w118_yt_13','any',all(inT('Y3S1',3),fl('YT_TA')),['學生寫的『田野』，有一半是在網路上找的。我寫了很長的評語。太長了，我刪掉一半。']),   /* 改作業之後：她說過當助教（YT_TA）、第 3 週起 */
      W('w118_yt_14','any',moon3,['中秋，茶屋休息一天。蘇姨說她也要去烤肉。她開店以來第一次休息。']),
      W('w118_yt_15','any',all(Y(3),done('ev_yt_lease_renew')),['五年。秀琴姨說五年後她六十歲。她說那時候再看看。']),
      W('w118_yt_16','any',all(Y(3),done('ev_yt_thursday_free')),['週四晚上沒有課。我不知道要做什麼。所以我去訪問了另一家店。']),
      W('w118_yt_17','any',all(tw,inT('Y3S2')),['今天那個老闆說，他開店三十年，最怕客人吃完什麼都不說。']),
      W('w118_yt_18','any',all(tw,inT('Y3S2',14,16)),['田野筆記寫滿兩本了。第一本的第一頁，是那個點兩碗的客人。']),
      W('w118_yt_19','any',a23,['蘇姨說不要辦十週年，太麻煩。我說熟客都在問。她想了一下，說那就簡單辦。']),
      W('w118_yt_20','any',inT('Y4S1',14,16),['報告寫了十五個老闆。最後一個是秀琴姨。']),
      W('w118_yt_21','any',all(Y(4),done('ev_yt_share_time')),['週末在茶屋，週四在田野。其他時間是我自己的。']),
      W('w118_yt_22','any',all(inT('Y4S2'),from('2029-04-19',18)),['秀琴姨傳了一張照片：她站在台中一間麵店前面，說『人家的麵比較貴』。']),   /* 事件 16b：4/19 18:00 阿姨的照片（r2y4b3d.js 2-Y4-37）之後 */
      W('w118_yt_23','any',gradNear,['畢業以後，我還是會週末去茶屋。……不是因為要上班。']),
      W('w118_yt_24','any',gradPre,['我媽說要坐第一排。我說社會系沒有第一排。她說那她站著。']) ],
    heroine_01:[
      W('w118_an_1','cafe',Y(1),['你剛剛在課上點頭。我想知道你是同意，還是想睡。']),
      W('w118_an_2','noodle',Y(1),['這家熟客可以先點。上次我排了二十分鐘，後面的阿伯先拿到。']),
      W('w118_an_3','any',all(Y(1),hr(19)),['宿舍規則我讀完了。第三十條很有趣：『特殊情形，得申請延長』。什麼是特殊情形？']),
      W('w118_an_4','any',all(Y(1),disc('B_Y1S1_const_1_w11',0)),['你上課說道歉不能用命令的。那名譽要怎麼回復？你講給我聽。']),   /* 新 2：那堂課選了「不行」（第 0 個選項）才有 */
      W('w118_an_5','library',Y(1),['總圖二樓靠窗那排，插座有一半是壞的。我一個一個試過。']),
      W('w118_an_6','any',all(inT('Y1S2'),done('ev_an_dorm_appeal_result')),['申訴結果出來了，部分成功。我本來以為會全部被駁回。']),
      W('w118_an_7','any',all(Y(2),done('ev_plg_rules')),['讀書會剩兩個人。好，是我規則訂太多了。改成三條。']),
      W('w118_an_8','any',all(inT('Y2S1'),att('Y2S1:admin_law:w12')),['你上課講的那個論點，我回去想了。你對。']),   /* 新 9：行政法第 12 週那堂有去 */
      W('w118_an_9','any',all(Y(2),done('ev_an_tutor_family_1')),['家教的學生今天沒寫作業，說家裡在忙一件事。我沒問。應該要問嗎？']),
      W('w118_an_10','any',all(Y(2),hr(18)),['我媽說，反駁以前，先把反方講得比反方自己還好。我今天試了。好難。']),
      W('w118_an_11','any',all(inT('Y2S2'),mon(3),done('ev_an_azalea_y1')),['第二張，同一個位置。你站歪了，往左一步。']),   /* 「第二張」：大一拍過第一張（ev_an_azalea_y1）*/
      W('w118_an_12','any',all(inT('Y2S2'),from('2027-03-18',13)),['說明會我坐第一排。日本是早就決定的，我只是想知道還有什麼選項。']),   /* AA_185 3-14 新寫；交換說明會 3/18 中午之後 */
      W('w118_an_13','any',all(inT('Y3S1'),from('2027-10-22')),['行政法院旁聽席人好少。原告自己一個人來，帶了一整袋文件。']),   /* 新 14（10/21）之後 */
      W('w118_an_14','any',all(inT('Y3S1'),from('2027-11-18',12)),['志願表交出去了。讀書計畫那頁你要看嗎？算了，不要看。我現在看都想改。']),
      W('w118_an_15','any',moon3,['我媽說中秋要一起烤肉。她烤肉前會先讀烤肉架的說明書。……我也會。']),
      W('w118_an_16','any',between('2027-11-08','2027-11-15'),['校慶園遊會的規則有十二條。第九條寫『不得喧嘩』。園遊會耶。']),   /* AA_555 1-6：校慶 2027-11-15 那一週 */
      W('w118_an_17','any',inT('Y3S1',13,16),['行李清單上有一條是『不准帶太多書』。我已經違反了。']),
      W('w118_an_18','any',inT('Y3S1',14,16),['讀書會下學期交給 Alison。我寫了交接文件，只有一頁。……我進步了。']),   /* AA_555 1-6〔名〕 */
      W('w118_an_19','any',inT('Y4S1'),['我住的那個町，公所貼了一張『請協力』，沒寫罰則，大家都照做。我還以為是我看漏了。']),
      W('w118_an_20','any',all(Y(4),fl('AN_CHOICE')),['我決定了。商法組。','我想知道公司那些規則是怎麼訂出來的。']),   /* 新 18（y34b3d.js AN_CHOICE 有值＝她說了）之後 */
      W('w118_an_21','any',all(inT('Y4S1'),before('2028-11-30')),['學弟妹問讀書會要準備什麼。我說，六法跟宵夜。']),   /* 新 19 交棒 11/30 以前 */
      W('w118_an_22','library',all(Y(4),mon(12,1,2)),['這張桌子我坐了四年。插座還是沒修好。']),
      W('w118_an_23','any',gradNear,['退宿規定我讀完了。最後一條又是『未盡事宜，另行公告』。四年了，每一份都這樣寫。']),
      W('w118_an_24','any',gradEve,['明天我媽會來。她說要穿得很普通。她每天都穿得很普通。']) ] };
  const one=v=>v==null?[]:(Array.isArray(v)&&v.length&&typeof v[0]==='string'?[v]:[].concat(v));   /* 和 invites3d.js 的 oneW 同一個規則：['一句'] 是一個元素 */
  for(const id in DATA){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}), w=p.walk||(p.walk={});
    for(const e of DATA[id]){ const k=e.where; w[k]=one(w[k]).concat([{one:e.one,if:e.if,l:e.l}]); } }
  INVITE_DATA.walk118=DATA; })();
/* ---------- 木曜日（溫州街 B4 二樓；AA_617 第 3 節、AA_618 1-6，使用者 11-03 同意、AA 定稿 D109）當邀約地點 ----------
   約人只給兩個人的約（這裡的邀約本來就是一對一；群約不列這裡）；有理由的（喝咖啡、念書，reason：和兩點半 Café 同一把尺）；營業 13:00～22:00、週二公休（off）、颱風天關（places.js）；
   自己走去過一次才列（show：G.visited.wz_mokuyobi；AA_617 第 1 節「兩家都要自己走去一次才出現」）。見面兩個人一起坐下（seatPose）。
   見面那一段（進門旁白、第一次的那一句、隨機一句、朋友一句）在 src/mokuyobi_sys3d.js（MOKS.meetScene；台詞照 AA_618 1-6 一字照抄）；答應、改天照一般規則（AA_618 沒有寫答應句：系統旁白）。
   可昕照現在的規則（只在她在臺北、約得到的時候）。沒有 MOKS（舊的測試環境）＝照一般的見面旁白。
   答應的那一句（AA_645 第 4 節，企劃線 ed6a4329d，一字照稿）：下面十人各一句（people[人].acc.mokuyobi）；沒列的人＝一般那句（MOKS.ACC0）；不答應照一般回覆表 */
INVITE_DATA.places.push({id:'mokuyobi',zone:'wz_mokuyobi',name:'木曜日',verb:'去木曜日坐坐',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'MOKUYOBI_TOGETHER',sitAct:'sit',seatPose:'sit',cats:['sit'],   /* AA_772：念書那一類搬給地點 slowread（原本這裡有 verbStudy、cats 也有 study）*/
  days:[0,1,3,4,5,6],off:[2],hours:[13,22],show:G=>!!G&&!!G.visited&&!!G.visited.wz_mokuyobi,
  scene:(GM,iv,who)=>typeof MOKS!=='undefined'&&MOKS.meetScene?MOKS.meetScene(GM,iv,who):GM.say(null,'你和'+((who&&who.name)||'')+'在木曜日坐坐。')});
(function(){ const ACC={heroine_01:'木曜日？好，我帶書。',heroine_02:'好。我想坐窗邊。',heroine_03:'好。我把報告帶去寫。',heroine_04:'那裡不能大聲說話吧。好啦。',heroine_05:'好。我很久沒去了。',
    classmate_peishan:'好！我想吃那個布丁。',kexin:'好啊。我想吃巴斯克。',zhe:'那裡我講話會被瞪吧。好啦。',classmate_bohan:'好，讀書。',classmate_mingxuan:'好。我帶筆電去。'};
  INVITE_DATA.mokuyobiAcc=ACC;
  for(const id in ACC){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={})).mokuyobi=[ACC[id]]; } })();
/* ---------- 日常失速（溫州街轉角；AA_617 第 3 節，使用者 11-03「日常失速是吃飯打屁桌遊」）當邀約地點 ----------
   吃飯那一類（meal：和公館燒臘同一把尺——有點熟以上；兩個人單獨吃飯的規則照舊）；AA_617「兩個人、一群人都可以」：這裡的邀約是一對一，群約另外（桌遊夜 src/bgnight3d.js、聚餐的群組）。
   每天 13:00～01:00（約的時間照一般 23:30 前結束）、颱風天關（places.js）；自己走去過一次才列（show）。見面兩個人一起坐下；台詞：AA_618 沒有寫約來的句子＝邀約一般的答應、見面旁白 */
INVITE_DATA.places.push({id:'offbeat',zone:'wz_offbeat',name:'日常失速',verb:'去日常失速吃東西',kind:'meal',minStage:'FAMILIAR',stay:1,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal','sit'],
  hours:[13,24],show:G=>!!G&&!!G.visited&&!!G.visited.wz_offbeat});
/* AA_648 第 3 節（企劃線 1ebf7a590，一字照稿）：約去日常失速答應的那一句——十三人各一句（people[人].acc.offbeat）；沒列的人＝一般那句（OFFB.ACC0）；不答應照一般回覆表 */
(function(){ const ACC={heroine_01:'好。我想吃明太子厚片。',heroine_02:'好。那家的貓會跳上桌，你不要嚇到。',heroine_03:'好。我晚一點到。',heroine_04:'日常失速？好，我要摸店長。',heroine_05:'好。我很久沒吃肉桂捲了。',
    classmate_peishan:'好！我上次外帶的那個很好吃。',kexin:'好啊。等我到台北。',zhe:'走！我要吃兩份厚片。',classmate_bohan:'好。吃完我要回去讀書。',classmate_mingxuan:'好。我帶一款新的桌遊。',
    yu:'Yes！日常失速！',classmate_xinci:'好。我報告寫完就去。'};
  INVITE_DATA.offbeatAcc=ACC;
  for(const id in ACC){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={})).offbeat=[ACC[id]]; } })();

/* ---------- afar café、Daybreak（公館第二批 G07、G14；GG-SHOPS2-1104，USER_WANTS X209）當邀約地點（AA_652 第 1、2 節「約去…答應的一句」、第 3 節接線備註；AA 定稿 D109，企劃線 303cded56，一字照稿）----------
   afar＝喝咖啡（reason：和兩點半 Café 同一把尺，剛認識就可以；AA_652 第 3 節「類型：咖啡、吃飯」＝只列在「喝咖啡、喝茶」），營業 11:00～21:00；
   Daybreak＝吃飯（meal：和半熟同一把尺，有點熟以上），早午餐只約得到 08:00～14:00（開始的時間；15:00 關門），14:00 以後選 Daybreak 先說那一句旁白（lateNote，src/invites3d.js S.flow），時間只列今天還沒過的、明天的。
   稿上沒有寫要先自己走去過一次（和兩點半 Café、公館燒臘一樣，不加 show）。可昕照現在的規則（只在她在臺北、約得到的時候：S.kxPlaceOk 認得 acc）。
   答應的那一句：七位各一句（people[人].acc.afar／daybreak）；沒列的人＝「一般」那句（src/gg2shops3d.js 的 GG2.ACC0）；不答應照一般回覆表。
   兩個人坐下以後的開場句：seatOpen.afar／daybreak（下面）。見面旁白照邀約一般的（AA_652 沒有寫約來的見面句）*/
INVITE_DATA.places.push({id:'afar',zone:'afar',name:'afar café',verb:'去 afar café 坐坐',verbStudy:'去 afar café 念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'CAFE_AFTERNOON',sitAct:'read',seatPose:'sit',cats:['sit','study'],hours:[11,21],
  prefTable:6});   /* prefTable：兩個人一起坐下先找窗邊長桌（afar_layout.js 的 table 6，有檯燈；DATE-SEAT-AFAR-1105）——那裡沒有兩個相鄰的空位、旁邊有人才找別桌（invites3d.js S.pairSeats）*/
INVITE_DATA.places.push({id:'daybreak',zone:'daybreak',name:'Daybreak',verb:'去 Daybreak 吃早午餐',kind:'meal',minStage:'FAMILIAR',stay:0.75,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hours:[8,14.75],times:[9,10,11.5,13],
  lateNote:G=>((((+G.hour||0)%24)+24)%24)>=14-1e-6?'（Daybreak 下午三點就關了。）':null});
(function(){ const AF={heroine_01:'好。我帶書去，你不要一直跟我講話。',heroine_02:'afar？好。窗邊那一排的燈很好看。',heroine_03:'好。我想吃他們的布丁。',heroine_04:'可以。那裡插座很多。',heroine_05:'好。我也剛好要寫東西。',
    classmate_peishan:'好！我上次經過就想進去了。',kexin:'好啊。我到公館再跟你說。'};
  const DB={heroine_01:'好。不要遲到。',heroine_02:'好。那家的鬆餅我只吃過一次，想再吃一次。',heroine_03:'Daybreak？好。我想吃法式吐司。',heroine_04:'Daybreak？好。我會起來。',heroine_05:'好。那天我空下來。',
    classmate_peishan:'好啊！那家的卡座好可愛。',kexin:'好啊。我早一點從木柵出發。'};
  INVITE_DATA.afarAcc=AF; INVITE_DATA.daybreakAcc=DB;
  for(const [pid,ACC] of [['afar',AF],['daybreak',DB]]) for(const id in ACC){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={}))[pid]=[ACC[id]]; } })();
/* ---------- 洋洋鹹酥雞（公館 G05，區域 yangyang；YANGYANG-IN-1107）當邀約地點（AA_724 第 8～10 節，AA 定稿 D109，企劃線 bf5c3e6c6，一字照稿）----------
   開放約：吃飯那一類（meal：有點熟以上、和 Daybreak 同一把尺；兩個人單獨吃飯＝partnerBlock 照吃飯的規則擋）；宵夜，19:00～23:00（約會在這段時間裡：19:00、20:00、21:00、22:00 開始，
   23:00 以後不排約會；營業到 01:00，深夜一個人來照常）。可昕只排到 21:00 開始（「十點以前，我還要回木柵」：whoLast，src/invites3d.js）；她照現在的規則（只在她在臺北、約得到的時候）。
   芷若：她的班表照現有作息（2:30 AM 上班＝busyActs 的 barista），有班的時間約不到（改天）。稿上沒寫要先自己走去過一次（不加 show，和 Daybreak 一樣）。
   兩個人一起坐下先找四人桌（prefTable 1～4：開場句第一則寫「你們在四人桌坐下」，那一則只在四人桌抽，onlyAt）。
   答應的那一句：七位各一句（people[人].acc.yangyang）；沒列的人＝「一般」那句（src/gg2shops3d.js 的 GG2.ACC0）；不答應照一般回覆表。*/
INVITE_DATA.places.push({id:'yangyang',zone:'yangyang',name:'洋洋鹹酥雞',verb:'去洋洋鹹酥雞吃宵夜',kind:'meal',minStage:'FAMILIAR',stay:0.75,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hours:[19,23],times:[19,20,21,22],
  whoLast:{kexin:21},prefTable:[1,2,3,4]});
(function(){ const YY={heroine_01:'宵夜？好。我只吃一點。',heroine_02:'好。我下班剛好餓。',heroine_03:'鹹酥雞？好。我沒有在店裡吃過。',heroine_04:'好！！我要雞皮。很多雞皮。',heroine_05:'好。讀完書，剛好。',
    classmate_peishan:'好啊！我要九層塔加很多！',kexin:'好。十點以前，我還要回木柵。'};
  INVITE_DATA.yangyangAcc=YY;
  for(const id in YY){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={})).yangyang=[YY[id]]; } })();
/* ---------- 轉角唱片（公館 G12，區域 corner_records；CORNER-IN-1107）當邀約地點（AA_725 第 8～9 節，AA 定稿 D109，企劃線 bf5c3e6c6，一字照稿）----------
   開放約：看電影、逛書店那一類（cats fun；類型照頁間書屋、山嵐：reason、認識以上、一小時，記憶照逛書店 BOOKSTORE_TOGETHER）；13:00～20:00（約會在這段時間裡：13:00～19:00 開始）。
   和同一類的頁間、山嵐、南洋一樣要自己走進去過一次才列（show：G.visited.corner_records；INVITE-PLACES-1107 那一批的做法）。一起的時候照 AA_708 書店第 N 次的中途（invites3d.js S.actKind：fun＝bookstore；故事線那一拍優先）。
   兩個人一起坐下先找試聽的高腳椅（prefTable 'listen'：zones3d.js 給的桌號）；開場句第二則「試聽區有兩副耳機……」只在那裡抽（onlyAt）。
   答應的那一句：七位各一句（people[人].acc.corner_records）；沒列的人＝「一般」那句（src/gg2shops3d.js 的 GG2.ACC0）；可昕照現在的規則（只在她在臺北、約得到的時候）。*/
INVITE_DATA.places.push({id:'corner_records',zone:'corner_records',name:'轉角唱片',verb:'去轉角唱片逛逛',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'BOOKSTORE_TOGETHER',sitAct:'sit',seatPose:'sit',cats:['fun'],hours:[13,20],times:[13,15.5,17.5,19],
  prefTable:'listen',whoDays:{kexin:[0,6]},show:G=>!!G&&!!G.visited&&!!G.visited.corner_records});   /* 可昕只排週末（AA-B 11-07 15:36：平日下午她在木柵上課；平日那一格不出現）*/
(function(){ const CR={heroine_01:'好。我不太懂音樂，你不要笑。',heroine_02:'轉角唱片？好。我想找一張電影原聲帶。',heroine_03:'好。我喜歡那間的味道。舊紙的味道。',heroine_04:'好！我要找遊戲配樂的靈感。',
    heroine_05:'好。讀累了，聽一點音樂也好。',classmate_peishan:'好啊！我想找動畫的原聲帶！',kexin:'好啊。我想找一張老唱片。'};
  INVITE_DATA.cornerAcc=CR;
  for(const id in CR){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={})).corner_records=[CR[id]]; } })();
/* ---------- 青木茶室（公館店面街 G01，區域 aoki；GG-SHOPS-REDO-1104，AA_653 第 3 節，企劃線 d26fecd2f，AA 定稿 D109）當邀約地點 ----------
   有理由的（喝茶、念書，reason：和木曜日同一把尺——認識以上）；每天 11:00～21:00、颱風假不開（places.js hours.aoki）；自己走去過一次才列（show，和木曜日、日常失速一樣）。
   座位照配置 canStudy 可以讀書（cats 有 study）；見面兩個人一起坐下（seatPose），坐下以後的開場句＝seatOpen.aoki（AA_653：店員把茶壺放下……「……你先喝。」）。
   答應的那一句（一字照稿）：七人各一句（people[人].acc.aoki）；沒列的人＝一般那句（INVITE_DATA.aokiAcc0，src/ggshops_sys3d.js 接）；可昕照現在的規則（只在她在臺北、約得到的時候）*/
INVITE_DATA.places.push({id:'aoki',zone:'aoki',name:'青木茶室',verb:'去青木茶室喝茶',verbStudy:'去青木茶室念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'AOKI_TOGETHER',sitAct:'sit',seatPose:'sit',cats:['sit','study'],
  hours:[11,21],show:G=>!!G&&!!G.visited&&!!G.visited.aoki});
(function(){ const ACC={heroine_01:'好。可以讀書嗎？可以就好。',heroine_02:'好。我想喝東方美人。',heroine_03:'青木？好。我想看看別人家的茶怎麼泡。',heroine_04:'茶室？好啊，我沒去過。',
    heroine_05:'好。那裡的白茶不錯。',classmate_peishan:'好！他們的桂花糕很好吃。',kexin:'好啊。等我到台北。'};
  INVITE_DATA.aokiAcc=ACC; INVITE_DATA.aokiAcc0='好。那裡很安靜。';
  for(const id in ACC){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}); (p.acc||(p.acc={})).aoki=[ACC[id]]; } })();

/* ===== 約念書走到桌子坐下（INV-SIT-TOGETHER-1104，USER_WANTS X207；台詞 AA_649，企劃線 37daf8027，D109 AA 定稿，一字照稿）=====
   使用者 2026-11-04 01:3x：「如果你們真的約一起念書的話，不可以一直走到圖書館門口然後約會就結束了，至少要走到桌子旁邊一起坐下來。」
   流程（系統 LAWWW，invites3d.js 的 S.leadStart／leadTick／leadScene）：門口會合（照現在的開場）→ lead（她帶路）→ 二樓長桌坐下（滿了：full 兩句 → 三樓閱覽區）
     → sit 旁白＋她一句（每段關係第一次用 first 表，之後隨機 sit）→ 中途 mid 隨機一則 → 收書（閉館 close／沒到閉館 pack）→ 走出大廳道別（第一次 first 表，之後隨機 bye）。
   說話的句子（小聲）照留、「」拿掉（AA-B 2026-11-08 00:05：全遊戲統一不加「」，和木曜日一樣；libquiet3d.js 的 needsPrefix 認得（小聲）開頭，不會再加一次）；道別 bye 這些有名字的也拿掉（AA-B 00:21）；旁白整句在（）裡。*/
INVITE_DATA.libStudy={
  lead:['（小聲）二樓靠窗那排比較安靜。'],
  full:['（二樓的長桌都坐滿了。）','（小聲）去三樓好了。三樓沒有人講話。'],
  seated:'（你們在長桌的一角坐下。她把書攤開，把手機翻過來蓋在桌上。）',
  mid:[['（她把一張便利貼推過來：「這一題你會嗎？」你在下面寫了答案推回去。她看了一眼，比了一個讚。）'],['（小聲）休息五分鐘。','（她趴在桌上。五分鐘後準時坐起來。）'],['（小聲）你的筆借我。我的沒水了。'],['（她讀到一半，把一顆喉糖放在你的書旁邊。）']],
  close:['（閉館前十分鐘的廣播響了。）'],
  pack:['（她闔上書，伸了一個懶腰。）','（小聲）走吧。'],
  sit:['（小聲）我讀到六點。你呢？','（小聲）手機先收起來。'],
  bye:['今天讀得比我想的多。','好累。……可是很好。'],
  first:{   /* AA_649 第 3 節：每段關係第一次約念書 */
    heroine_01:{sit:'（小聲）我讀我的，你讀你的。不懂再問我。',bye:'下次換你決定讀哪一科。'},
    heroine_02:{sit:'（小聲）我帶了兩支螢光筆，一支給你。',bye:'今天很安靜。我很喜歡。'},
    heroine_03:{sit:'（小聲）我讀民總。你讀什麼？',bye:'謝謝你陪我讀。下次我請你喝茶。'},
    heroine_04:{sit:'（小聲）圖書館的冷氣好冷。你外套借我。',bye:'我寫了一整頁的程式。你讀了幾頁？'},
    heroine_05:{sit:'（小聲）我寫我的報告，你有問題可以問我。',bye:'讀得不錯。下次我考你。'},
    classmate_peishan:{sit:'（小聲）我第一次在這裡讀書耶。',bye:'我今天讀了十頁，畫了十頁。效率很平均。'},
    kexin:{sit:'（小聲）你們的總圖好大。',bye:'我回木柵了。今天謝謝你。'} }
};
/* AA_649 第 4 節：其他約會兩個人一起坐下以後的開場句（每次隨機一則）。店自己有見面內容的（一盞、木曜日、日常失速、Pasta 118：地點的 scene／ownMeal）用店的，不加。
   電影、頁間書屋：現在還不是可以約的地點（INVITE_DATA.places 沒有），等地點加進來再接 */
/* 只在某些位子說的那一則（DATE-SEAT-AFAR-1105）：Object.assign([台詞…],{onlyAt:{table:桌號}})＝只在你們坐的位子符合時才抽（onlyAt.table＝區域座位的桌號，一個或陣列；invites3d.js S.seatAtOk）。
   台詞本身不動（AA 定稿）；onlyAt 是陣列外面多的屬性（不叫 at：陣列本來就有 at 這個方法），JSON、逐字對照看不到 */
INVITE_DATA.seatOpen={
  meal:[['（你們在靠窗的位子坐下。她先把菜單推到你面前。）','你先點。'],['（位子有點擠，你們的膝蓋碰在一起。她往旁邊挪了一點，又挪回來。）']],
  coffee:[['（你們點好飲料，在窗邊坐下。）','這裡的位子我喜歡。'],['（她把兩杯飲料的吸管都插好，一杯推給你。）']],
  movie:[['（你們找到位子坐下。燈還沒暗，她把爆米花放在中間的扶手上。）','（小聲）預告片開始了。']],
  movieEnd:[['（燈亮了。她還在看片尾的字幕。）','……等一下再走。']],
  bookstore:[['（你們在閱讀桌坐下。她從書牆上抽了一本書，放在你面前。）','（小聲）這本你會喜歡。']],
  /* afar café、Daybreak 自己的開場句（AA_652 第 1、2 節「和她坐下以後的開場句」；GG-SHOPS2-1104）*/
  afar:[Object.assign(['（你們在窗邊長桌坐下。她把桌上的小燈打開，又關掉，又打開。）','……這個燈好可愛。'],{onlyAt:{table:6}}),   /* 窗邊長桌（table 6）才有檯燈 */
    ['（她把兩杯咖啡的杯墊對齊，一杯推給你。）']],
  daybreak:[['（你們在窗邊坐下。陽光剛好照到她那一邊，她把椅子往你這邊挪了一點。）','好亮。'],['（餐點送來的時候，她先拿手機拍了一張。）','……好，可以吃了。']],
  byPlace:{cafe:'coffee',brunch:'coffee',noodle:'meal',afar:'afar',daybreak:'daybreak'}   /* 兩點半、半熟＝咖啡（AA_649 寫「咖啡（兩點半、半熟這種）」）；公館燒臘＝吃飯 */
};
INVITE_DATA.seatOpen.aoki=[['（店員把茶壺放下，她先幫你倒了第一杯。）','……你先喝。']]; INVITE_DATA.seatOpen.byPlace.aoki='aoki';   /* 青木茶室（AA_653 第 3 節：和她坐下以後的開場句）*/
/* 洋洋鹹酥雞（AA_724 第 9 節：吃飯那一類，用洋洋自己的句子）：第一則寫「四人桌」＝只在四人桌（table 1～4）抽 */
INVITE_DATA.seatOpen.yangyang=[Object.assign(['（你們在四人桌坐下。她把紙袋撕開攤平，當成盤子。）','這樣比較好拿。'],{onlyAt:{table:[1,2,3,4]}}),['（她先夾了一塊，吹了很久才放進嘴裡。）','……好燙。可是好好吃。']];
INVITE_DATA.seatOpen.byPlace.yangyang='yangyang';
/* 轉角唱片（AA_725 第 8 節「和她進去以後的開場句」，逛書店那一類用轉角自己的句子）：第二則（試聽區的兩副耳機）只在試聽的高腳椅（桌號 'listen'）抽 */
INVITE_DATA.seatOpen.corner_records=[['（她在唱片箱前面停下來，一張一張往後翻，翻得很慢。）','你看，這張的封面好好看。'],Object.assign(['（試聽區有兩副耳機。她戴上一副，把另一副遞給你。）','一起聽。'],{onlyAt:{table:'listen'}})];
INVITE_DATA.seatOpen.byPlace.corner_records='corner_records';
/* ---------- 更多可以約的地方（INVITE-PLACES-1107；使用者 11-07 試玩：「daybreak 不能約?」「社科院圖書館也可以唸書吧」「吃飯餐廳也新增很多了沒有每個放進來」「有的店面都可以約吧 看書或吃飯或聊天 南洋戲院可以約看電影」）----------
   系統的資料（地點、時間、哪一類）；答應的那一句、見面的台詞還沒有稿＝照一般的（「○○答應了。」、見面旁白；一起念書的第 N 場照 AA_707）。等 AA 補 acc／firstAt（登記在 INVITE-PLACES-1107）。
   - 都要自己走去過一次才列（show：G.visited，和木曜日、日常失速一樣）；開放時間照 places.js 那一區（hoursFrom）。
   - 「看電影、逛書店」是新的一類（invites3d.js S.CATS fun）：兩個人坐下的開場句照 AA_649 第 4 節 seatOpen.movie／bookstore；電影散場照 seatOpen.movieEnd。
   - 運動健身（健身房、游泳池）還沒開：等健身器材能用（GYM-FIT-1107）、AA 寫運動的台詞。118 巷的店另外排（巷子裡的店是同一區）。*/
(function(){ const V=z=>G=>!!G&&!!G.visited&&!!G.visited[z];
  const P=[
    {id:'soclib',zone:'soclib',name:'社科院圖書館',verb:'去社科圖一起念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1.5,memory:'SOCLIB_TOGETHER',sitAct:'read',seatPose:'read',cats:['study'],hoursFrom:'soclib',show:V('soclib')},
    {id:'wz_lin',zone:'wz_lin',name:'林家乾麵',verb:'去林家乾麵吃飯',kind:'meal',minStage:'FAMILIAR',stay:0.75,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hoursFrom:'wz_lin',show:V('wz_lin')},
    {id:'wz_teishoku',zone:'wz_teishoku',name:'小路',verb:'去小路吃晚餐',kind:'meal',minStage:'FAMILIAR',stay:1,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hoursFrom:'wz_teishoku',times:[18,19,20],show:V('wz_teishoku')},
    {id:'xs_dakou',zone:'xs_dakou',name:'大口漢堡',verb:'去大口漢堡吃東西',kind:'meal',minStage:'FAMILIAR',stay:1,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],hours:[8,23.5],show:V('xs_dakou')},   /* 只在吃飯（BB-B 11-07：放在念書那一類卻被「兩個人單獨去吃飯不太好」擋，選念書說吃飯）*/
    {id:'xs_nanyang',zone:'xs_nanyang',name:'南洋戲院',verb:'去南洋戲院看電影',kind:'reason',minStage:'FRIEND',stay:2,memory:'MOVIE_TOGETHER',sitAct:'sit',seatPose:'sit',cats:['fun'],hoursFrom:'xs_nanyang',times:[9.83,14,19.5],show:V('xs_nanyang')},   /* 早場 09:50（AA_707 芷若第 6 場「週六，早上九點五十」）*/
    {id:'bookstore',zone:'bookstore',name:'頁間書屋',verb:'去頁間書屋逛逛',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'BOOKSTORE_TOGETHER',sitAct:'read',seatPose:'read',cats:['fun'],hours:[10,22],show:V('bookstore')},
    {id:'xs_shanlan',zone:'xs_shanlan',name:'山嵐書店',verb:'去山嵐書店逛逛',kind:'reason',minStage:'ACQUAINTANCE',stay:1,memory:'BOOKSTORE_TOGETHER',sitAct:'read',seatPose:'read',cats:['fun'],hoursFrom:'xs_shanlan',show:V('xs_shanlan')}];
  for(const q of P) if(!INVITE_DATA.places.some(x=>x.id===q.id)) INVITE_DATA.places.push(q);
   /* Daybreak（「daybreak 不能約?」）：本來就在吃飯那一類（AA_652），不加念書；約不到是因為和可昕交往、她知道＝「兩個人單獨去吃飯不太好」（invites3d.js partnerBlock） */
  const B=INVITE_DATA.seatOpen.byPlace; B.xs_nanyang='movie'; B.bookstore='bookstore'; B.xs_shanlan='bookstore'; B.wz_lin='meal'; B.wz_teishoku='meal'; B.xs_dakou='meal';
})();
/* ---------- 約她去健身房、游泳池（GYM-FIT-1107；使用者 11-07「不能約運動健身嗎」；台詞 AA_715＝src/data/sport_invite_lines.js）----------
   新體育館 B1（gym_b1）。健身中心＝有點熟以上（和羽球一樣）、自己去辦過會員證才列（G.daily.gym.card，BB_124 7-4）；游泳池＝朋友以上（和晨跑一樣）、自己去過 B1 才列。
   開放時間照 BB_151（平日 8～22、週末 9 起；閉館前 30 分鐘清場；週日只到 18，這裡週末一律算到 17:30）；每月第四個星期一休館（avail）。
   一起的時候照羽球那一套（sport：答應句 A／R、第一次、一起的時候輪流、結束）；一起練完體能照自己去健身的規則加（invites3d.js S.sportAfter）。學姊 2026-06-15 以前約游泳池＝婉拒（beforeLearn，AA_504）*/
(function(){ const card=G=>!!(G&&G.daily&&G.daily.gym&&G.daily.gym.card), b1=G=>!!(G&&G.visited&&G.visited.gym_b1);
  const notFourthMon=(G,day)=>{ if(typeof CALENDAR==='undefined') return true; const d=CALENDAR.dateOf(day); return !(d.wd===1&&d.d>=22&&d.d<=28); };
  const P=[
    {id:'gym_fitness',zone:'gym_b1',name:'健身中心',verb:'去健身中心一起練',kind:'sport',minStage:'FAMILIAR',stay:1,memory:'SPORT_GYM',sitAct:'wait',sport:true,hoursBy:{wk:[8,21.5],we:[9,17.5]},avail:notFourthMon,show:G=>card(G)},
    {id:'gym_pool',zone:'gym_b1',name:'游泳池',verb:'去新體育館游泳',kind:'sport',minStage:'FRIEND',stay:1,memory:'SPORT_POOL',sitAct:'wait',sport:true,hoursBy:{wk:[8,21.5],we:[9,17.5]},avail:notFourthMon,show:G=>b1(G)}];
  for(const q of P) if(!INVITE_DATA.places.some(x=>x.id===q.id)) INVITE_DATA.places.push(q);
})();

/* ===== INVITE-PLACES-1107 第二批：118 巷的店也能約（使用者 11-07「約會、約念書、約吃飯…」；AA_721 b782e2c08 答應句、第一次一起去那一句，src/data/invite_place_lines.js）=====
   店 id＝區域 id。營業時間照 lane118_shops.js（AA_280）：一天兩段（午、晚）都能約、公休日灰掉（windows、off）；都要自己走進去過一次才列（G.visited）。
   一一八茶飲放「散步」（AA_721：買了邊走邊喝）。她不會去的（可昕平日在木柵、好家自助餐只開平日）＝那一格灰掉、說明是她那句（noWho，匯入時併進來）。*/
(function(){ const V=z=>G=>!!G&&!!G.visited&&!!G.visited[z];
  /* 營業時間照 LANE118_SHOPS（src/data/lane118_shops.js，index.html 在 invites.js 前面載入）*/
  const hrs=k=>{ const s=typeof LANE118_SHOPS!=='undefined'&&Array.isArray(LANE118_SHOPS.shops)&&LANE118_SHOPS.shops.find(x=>x.id===k); return (s&&s.hours)||{open:[[11,14],[17,20]],closed:[]}; };
  const H=(o,k)=>{ const h=hrs(k), c=h.closed||[]; return Object.assign(o,{windows:h.open.map(w=>w.slice()),off:c.slice(),days:[0,1,2,3,4,5,6].filter(d=>!c.includes(d))}); };
  const M=(k,name,verb)=>H({id:'l118_'+k,zone:'l118_'+k,name,verb,kind:'meal',minStage:'FAMILIAR',stay:0.75,memory:'SHARED_MEAL',sitAct:'eat',seatPose:'sit',cats:['meal'],times:[12,12.5,18,18.5],show:V('l118_'+k)},k);
  /* 2026-11-11 AA_772 invite_places（L118-SHOPS-REDO-1111，九間店改版）：店名、動詞照 src/data/l118_redo772.js 的 invitePlaces（tools/story/l118_fix772.py 產生），不寫在這裡。
     吃飯類八間（l118_tea 現在是辛亥韓食＝吃飯類；多 l118_cafe2 大學食堂；義大麵屋照舊走 L118.INVITE）；散步類兩間外帶飲料店（設定照原本的茶飲店：walk、朋友以上、半小時、14／16／19.5）。
     外帶店沒有室內：區域＝118 巷（lane118），走到過 118 巷、而且街上有那一間的位置（lane118_layout.js）才列 */
  const IP=(typeof L118_REDO!=='undefined'&&L118_REDO.invitePlaces)||{meal:[],walk:[]};
  const placed=k=>typeof LANE118_LAYOUT!=='undefined'&&Array.isArray(LANE118_LAYOUT.shops)&&LANE118_LAYOUT.shops.some(q=>q.id===k);
  /* 見面點＝那一間的店門口（配置的互動點再往路中間一點；LAWWW 2026-11-11：外帶店的邀約地點區域＝lane118、在各自的店門口見）*/
  const doorAt=k=>{ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null, q=L&&Array.isArray(L.shops)?L.shops.find(x=>x.id===k):null; if(!q) return null; const W=q.side==='W'; return [+(W?L.facade.west+1.6:L.facade.east-1.6).toFixed(2),(q.z0+q.z1)/2,W?Math.PI/2:-Math.PI/2]; };
  const WK=(k,name,verb)=>Object.defineProperty(H({id:'l118_'+k,zone:'lane118',name,verb,kind:'walk',minStage:'FRIEND',stay:0.5,memory:'WALKED_TOGETHER',sitAct:'wait',cats:['walk'],times:[14,16,19.5],show:G=>!!G&&!!G.visited&&!!G.visited.lane118&&placed(k)},k),'meetAt',{get:()=>doorAt(k)||undefined,enumerable:true,configurable:true});   /* meetAt 用到的時候才算（配置檔比這個檔晚載入也對）*/
  const P=IP.meal.map(([k,name,verb])=>M(k,name,verb)).concat(IP.walk.map(([k,name,verb])=>WK(k,name,verb)));
  for(const q of P) if(!INVITE_DATA.places.some(x=>x.id===q.id)) INVITE_DATA.places.push(q);
  const B=INVITE_DATA.seatOpen&&INVITE_DATA.seatOpen.byPlace; if(B) for(const [k] of IP.meal) if(!B['l118_'+k]) B['l118_'+k]='meal'; })();
