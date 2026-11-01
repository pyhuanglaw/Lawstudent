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
    {id:'cafe',    zone:'cafe',         name:'兩點半 Café',  verb:'去兩點半 Café 坐坐',   kind:'reason', minStage:'ACQUAINTANCE', stay:1,    memory:'CAFE_AFTERNOON',  sitAct:'read'},
    {id:'library', zone:'library_hall', name:'總圖',         verb:'去總圖一起念書',       kind:'reason', minStage:'ACQUAINTANCE', stay:1.5,  memory:'STUDIED_TOGETHER', sitAct:'read'},
    {id:'noodle',  zone:'noodle',       name:'阿鳳麵店',     verb:'去阿鳳麵店吃飯', kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat'},
    {id:'wenzhou', zone:'wenzhou',      name:'溫州街',       verb:'去溫州街散步',         kind:'walk',   minStage:'FRIEND',       stay:0.75, memory:'WALKED_TOGETHER', sitAct:'wait', rainTo:'cafe'},
    /* 溫州街的新店（DL-12；AA_164 2-1、2-3，AA-B 定）：days＝星期幾可以約（0＝週日）、hours＝那段時間裡（開始到結束都要在裡面）*/
    {id:'brunch',  zone:'wz_brunch',    name:'半熟',         verb:'去半熟吃早午餐',       kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat', days:[0,6], hours:[8,13]},
    {id:'teahouse',zone:'wz_teahouse',  name:'一盞',         verb:'去一盞喝茶',           kind:'reason', minStage:'FRIEND',       stay:1.25, memory:'TEAHOUSE_TEA',    sitAct:'sit', days:[0,3,4,5,6], hours:[12,19]},
    /* 一起運動的約會（AA_126 6-6、AA_417 第 3 節，AA-B 2026-10-23 定稿；USER_WANTS D40）：kind 'sport'、sport:true＝見面照 sport 的「一起的時候」「結束」（src/invites3d.js S.meet）。
       羽球：新體育館 1F 羽球場，有點熟以上；hoursBy＝平日 12:00～21:00、週末 9:00～17:00。晨跑：椰林大道 06:30～07:30，朋友以上；times＝只能約 06:30；noRain＝下雨不能約；meetAt＝她在傅鐘前的椰林大道等 */
    {id:'gym_badminton',zone:'gym',   name:'新體育館羽球場', verb:'去新體育館打羽球',     kind:'sport',  minStage:'FAMILIAR',     stay:1,    memory:'SPORT_BADMINTON', sitAct:'wait', sport:true, hoursBy:{wk:[12,21],we:[9,17]}},
    {id:'run_avenue',  zone:'campus', name:'椰影大道',       verb:'去椰影大道晨跑',       kind:'sport',  minStage:'FRIEND',       stay:1,    memory:'SPORT_RUN',       sitAct:'wait', sport:true, hours:[6.5,7.5], times:[6.5], noRain:true, meetAt:[-36.8,6,-Math.PI/2]}
  ],
  /* 開場就有聯絡方式的（AA_124 1-7 第 3 點，2026-10-14）：阿哲（現有設定：已經熟）、阿凱（室友）、可昕（經濟系那一年就在一起）、學姊（直屬：開學前的家族群組，BB_70 3-1）。
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
    heroine_01:[{say:'「好。」'},{narr:'（她把手機遞過來，自己先掃了你的。）'},{say:'「加了。」'}],   /* AA_194 第 4 節（使用說明 → 她做的事）*/
    heroine_03:[{say:'「好。」'},{narr:'（她把手機推過來，畫面已經停在加好友那一頁。）'}],   /* AA_194 第 4 節（不用「嗯。」開頭）*/
    yu:[{say:'「欸你還不在我的群組裡？我拉你。三個。」'}],
    classmate_bohan:[{say:'「好。」'},{say:'「你有在看考古題嗎？有的話我傳給你。」'}],   /* AA_194 第 4 節 */
    classmate_xinci:[{say:'「我加你了。」'},{say:'「有缺講義的話跟我說，我都有拍。」'}],   /* AA_194 第 4 節 */
    /* BB 的人物（BB_120 1-7b，第②級）：每一句都是她／他在手機上的習慣 */
    heroine_02:[{say:'「好啊，你掃我。」'},{say:'「我上班的時候不太看手機，下班才會回，不要以為我不理你。」'}],   /* BB_172 Z1（10-2 第 12、15 點）*/
    heroine_04:[{say:'「你還沒有我的？好。我傳東西不解釋。」'}],
    classmate_peishan:[{say:'「好。上課有問題可以問你嗎？」'}],   /* BB_172 P1（10-2 第 13 點）*/
    classmate_mingxuan:[{say:'「好。二四六晚上我在家教，九點以後才會回。」'}],   /* BB_172 M1（10-2 第 15 點）*/
    npc_fangyt:[{say:'「好。」'},{narr:'（他的大頭貼是一棵樹。）'}],   /* BB_172 F1（10-2 第 15 點）*/
    classmate_youchen:[{say:'「好啊。週五我會丟一首歌，聽不聽隨你。」'}],
    npc_huangxh:[{say:'「好。我找受試者的時候，可以先問你嗎？」'}],
    npc_ta_chen:[{say:'「好。……有問題先問自己一次，再問我。」'}]
  },
  /* 這些作息的時候不能赴約（會說「改天」，附一個具體的時間）*/
  busyActs:['class','barista','help','club','ta'],
  /* 可以約的人：人物的分類（CHARACTERS 的 social_layer）——法律系熟同學 A、其他系 C、五位主角 D、學長姐 F；不熟的同學 B、教授 E 不行 */
  layers:['A','C','D','F'],
  /* 約的時間：今天這幾個時間（已經過去的不列）、明天這幾個時間 */
  times:[12+10/60,15.5,17.5,19,21],
  /* 子晴、芷若一起分手以後（MREL.zzRefusing：還不能重新開始、或重新開始的是另一位）拒絕 L2 的邀約，不說理由、兩句輪流（AA_227 6-6 @26357a440，AA_423 4-1「照 AA_227 6-6，不改」；BB_194 22-2）。L3（正式校外約會）在 multirel3d.js */
  mrelL2:{heroine_04:[['「這禮拜不行。」'],['「……下次吧。」']],heroine_02:[['「我這週班排滿了。」'],['「……不了，謝謝。」']]},
  /* 邀約的個性（被邀約時；AA_70 第 2 節＋BB_121 的建議欄、BB_70 第 1～7 節，AA、BB 2026-10-14 互審同意，第②級）。只用四個地點；改天的時間由系統算（INV.nextFree）。
     acc[地點]：答應時她／他說的話（A＝認識、有點熟；R＝朋友以上；不分的直接給陣列）。first[地點]：第一次約那個地方（散步）時說的話。
     here[地點]：照作息她那時候本來就在那裡（不算邀約、不接改天，玩家直接去）。plan[地點]：她已經有計畫（作息的 busy／booked）時說的話，之後系統問改天的時間。
     rule(G, ctx, INV)：個人規則（可以把答應改成改天／婉拒、把忙改成「就在那裡」），回傳 {res, lines, alt} 或 null。ctx：{pid, P, day, h, wd, band, year, term, first, w8, dating, r}
     台詞：「…」＝她／他說的話、（…）＝旁白、{me:'「…」'}＝祐廷說的話；{zh}＝改天的時間（「九點十分」，不是今天的加「明天」或日期）、{明天？}＝改天是明天才說。
     walk[地點／any／rain]：一起走過去的路上說的一句（照目的地，對不上的放 any；下雨先用 rain）。一個元素是一句話的陣列（可以有旁白），或 {if:(G,ctx)=>…, l:[…]}；同一個人輪流換。
     表上只寫描述、沒有台詞的格子（例：「答應；她點最便宜的那杯」）照舊用系統的旁白；看電影、唱歌、法服值班、系籃這幾列等系統有那個地點再接。*/
  people:{
    /* ---------- AA 的六位（AA_70 第 2 節） ---------- */
    heroine_01:{ walk:{cafe:['「你寫題目都先想要件，還是先想結論？我都先想結論，最近在改。」'],noodle:['「我手帳裡有一頁叫『想去但沒時間去的店』。公館有七家。」'],wenzhou:[{if:(G,c)=>c.year>=2,l:['「這條巷子我走過一百次。第一次看到那隻貓。」']}],any:['「宿舍門禁是十二點。我查過為什麼是十二點，沒有人說得出來。」']},   /* 以安：先講結論、要理由（2-1；BB_121 2-1）*/
      acc:{cafe:{A:['「可以。條件：我會帶東西來寫。」']},noodle:{A:['「……好。但我只吃一碗。」'],R:['「好。我要乾麵。」']},
        gym_badminton:['「羽球？好。我國中是校隊。……替補。」'],run_avenue:['「六點半？……好。我本來就六點起床。」']},   /* AA_417 3-3（第一次去也用這一句）*/   /* 認識約 Café、朋友約吃飯：AA 2026-10-14 改成她自己說的話（AA_70 2a0218d）*/
      here:{library:['「我本來就在總圖。二樓靠窗。」']},
      plan:{cafe:['「今天排滿了。……這個時間可以嗎？」'],noodle:(G,c)=>c.term&&c.term.id==='Y1S1'&&c.term.week<10?['「我跟 Alison 約了一起寫憲法作業。{明天？}」']:['「我跟 Alison 約了讀書會的事。{明天？}」']},   /* AA_238 5-7：公法讀書會大一上第 10 週才開始，以前是一起寫憲法作業 */
      rule:(G,c,I)=>{ if(c.P&&c.P.kind==='meal'&&c.r.res==='accept'&&c.wd===4&&c.h>=21.5&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.on&&(a=>!!a&&ACTIVITIES.on(a,c.day,G))(ACTIVITIES.list.find(x=>x.id==='public_law_group'))) return {lines:['「好。可是吃完我就回去。報告還沒寫完。」']};   /* 週四公法讀書會（20:00～21:30）散了以後約她吃飯：AA_227 3-1 的回覆，AA_434 第 3 節改成不寫鐘點（434e6d6d7）*/
        if(c.pid!=='wenzhou'||c.r.res!=='accept') return null;   /* 大一：散步要有目的——她在手帳排一個「沒有目的」的時段（改天，但她真的排了）；大二以後「今天想」也是理由 */
        if(c.year<=1&&!c.first) return {lines:['「好。」']};   /* AA_194 第 4 節（改規則）：大一只有第一次約散步（c.first）問「散步的目的是？」、改到隔天；之後照一般答應「好。」*/
        if(c.year<=1) return {res:'resched',why:'plan',lines:['「散步的目的是？」',{me:'「沒有目的。」'},'「……好。我在手帳排一個『沒有目的』的時段。」'],alt:I.nextFree(G,'heroine_01',c.P,c.day+1,10)};
        return {lines:['「好啊，剛好想走走。」']}; } },   /* AA_255 第 4 節第 7 點、AA_259 第 4 節第 7 點 */
    heroine_03:{ walk:{noodle:['「這條路我從國中走到現在。那家修鞋店的老闆，三十年沒換過招牌。」'],wenzhou:['「這間老屋以前是一個教授住的。阿姨說他每天來吃一碗乾麵，二十年。」'],any:[{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','SHARED_MEAL'),l:['「阿姨說你吃東西很像在考試。很認真，又很怕吃錯。」']}],rain:['（她撐傘，傘偏向你那一邊，自己的肩膀濕了一半。）','「沒事啦。」']},   /* walk.rain 第二句：AA_194 第 4 節 */   /* 語彤：週二、週四晚上在阿鳳麵店幫忙（作息 help），其他時間在總圖三樓（2-2；BB_121 2-2：系統沒有反邀、改地點，先當婉拒）*/
      acc:{noodle:{A:['「……我阿姨的店？」','「好。阿姨會多給你一顆滷蛋。」']},gym_badminton:['「……我不太會。」','「好。你不要笑。」'],run_avenue:['「早上我要幫阿姨備料。……七點半以前可以。」']},   /* 羽球、晨跑：AA_417 3-3 */
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='help') return c.pid==='noodle'?{res:'here',lines:['「我就在店裡。你來。」'],alt:null}:{res:'decline',why:'shop',lines:['「麵店。」','「你來店裡就好。」'],alt:null};
        if(r.res!=='accept') return null;
        if(c.pid==='cafe'&&c.band==='A') return {res:'decline',why:'pricey',lines:['「……那裡很貴。」','「總圖可以。」']};
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['「週六。我本來就在。」']}; return {res:'resched',why:'sat',lines:['「週六。我本來就在。」'],alt:I.nextSat(G,'heroine_03',c.P,c.day,15)}; }
        return null; } },
    zhe:{ walk:{any:[['「這家以前是賣雞排的。」'],['「那家的老闆會記得你點什麼，只要你去三次。」'],['「你知道公館哪家滷味十點後半價嗎？……我知道三家。」']]}, acc:{noodle:['「好啊！那家的乾麵我可以吃兩碗。」']} },   /* AA_194 第 4 節（和阿凱「好 我餓了」撞）*/   /* 阿哲（2-3；BB_121 2-3：揪人的那句等群體邀約）*/
    yu:{ acc:{library:['「總圖喔……好啊，可是我會一直想跟你講話。」']} },   /* Alison（2-4；大三以後「今天是我的晚上」等她那個晚上的作息）*/
    classmate_bohan:{   /* 柏翰：總圖秒答應；其他地方「我要念書」，改到念完的時間（2-5；BB_121 2-5）*/
      rule:(G,c,I)=>{ if(c.pid==='library'||c.r.res!=='accept'||c.h>=21+10/60) return null; const a=I.freeAt(G,'classmate_bohan',c.P,c.day,21+10/60)?{day:c.day,h:21+10/60}:I.nextFree(G,'classmate_bohan',c.P,c.day,21+10/60);
        return {res:'resched',why:'study',lines:[a?'「我要念書，{zh}可以。」':'「我要念書。」'],alt:a}; } },   /* AA_194 第 4 節：拿掉中間的「……」*/
    classmate_xinci:{   /* 芯慈：吃飯要提前一天約（2-6；BB_121 2-6，她個人的規則）*/
      rule:(G,c,I)=>{ if(c.pid!=='noodle'||c.r.res!=='accept') return null; if(c.day>G.day) return {lines:['「好，我記一下。」']};   /* AA_194 第 4 節（改規則，只改字；判斷不變）：約之後的日子／約今天 */
        return {res:'resched',why:'early',lines:['「今天的我都排好了，{zh}可以嗎？」'],alt:I.nextFree(G,'classmate_xinci',c.P,c.day+1,12+10/60)}; } },
    /* ---------- BB 的人物（BB_70 第 1～7 節） ---------- */
    heroine_02:{ walk:{noodle:[{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ZR_HOMETOWN'),l:['「這家影印一張一塊半欸。我媽那邊才一塊。」']},{if:G=>!(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','ZR_HOMETOWN')),l:['「這家影印一張一塊半欸，好貴。」']},   /* BB_172 Z2：聽過她家（閒聊 Z-L6，記憶 ZR_HOMETOWN）／沒聽過（10-2 第 5 點：不提家裡）*/
          ['（她看到騎樓下的電影海報。）','「欸這部，你不要去看喔。」','「預告很好看，正片超無聊。我上禮拜去看，浪費兩百多。」']],library:['「你背包那本是什麼？好厚喔。」','「我們的書都很薄，可是每本都要讀好幾遍。」'],   /* Z3、Z4 */
        wenzhou:[{once:'ZR_FILM_ASK',l:['「欸，你不覺得這條巷子很適合拍電影嗎？你猜我會拍什麼。」'],ch:[{t:'愛情片。',r:['「太簡單了啦。」']},{t:'恐怖片。',r:['「晚上是有一點啦，可是不是。」']},{t:'什麼都沒發生的片。',r:['「……你怎麼知道？」']}],after:['「我想拍一個人每天走這條巷子去上班，然後什麼事都沒發生。」','「……應該很難看吧。」']}],   /* BB_172 Z5（選項、once 照舊）*/   /* BB_70 Café → 溫州街（選項，見面前選）*/
        any:['「我們外文的報告都要用英文寫，寫久了講中文都會卡。」']},   /* BB_172 Z6 */   /* 芷若（1-4）：上班＝作息 barista */
      firstAt:{brunch:['（她點完餐，看了開放廚房很久。）','「她煎蛋的時候都不講話欸，好專心。」','「我拉花的時候也是，被叫一下就歪掉。」'],teahouse:['「我完全不懂茶欸。」','（店員說第一泡要等三分鐘。）','「三分鐘喔？好，我等。」']},   /* BB_172 Z7、Z8（10-2 第 7 點）*/ acc:{brunch:{A:['「半熟？……那家的蛋煎得比我們店的好。不要跟老闆說。」'],R:['「好。我點和上次一樣的。……你不知道上次是什麼？那你猜。」']},teahouse:{R:['「一盞？好。那裡安靜，我可以不用說話。」']},cafe:{A:['「我放假不太想來上班的地方。……好啦。但我不幫忙收杯子。」'],R:['「去我們家。我坐客人那一邊，看起來會很奇怪。」']},noodle:{A:['「……好。但我只吃一點點。」'],R:['「阿鳳阿姨記得我。我也記得她。」']},
        gym_badminton:['「羽球！好啊，我手腕很好。拉花練的。」'],run_avenue:['「早上？……我昨天上到兩點。」','「……好啦。我去。」']},   /* AA_417 3-3 */
      here:{cafe:(G,c)=>typeof STORY!=='undefined'&&STORY.zrNoShift&&STORY.zrNoShift(G,c.day)?['「我在 Café，今天是客人。你要來嗎？」']:['「我會在 Café 啊，你直接過來，我幫你做一杯。」']},   /* 上班的那一句：BB_172 Z16（10-2 第 3 點：約的是之後）*/   /* AA_375 第 1 項：6/3 是她最後一個班，6/4～9/2 她在 Café 是客人（作息 characters.js；STORY.zrNoShift）*/
      plan:{library:['「我在上班。十點下班，總圖也十點關。……你自己加油。」'],wenzhou:['「我在上班。……下班以後，走一段？」']},
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='barista'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_02',c.P,c.day,22.5); if(!a||a.day!==c.day) return null;
          return {lines:[c.dating?'「下班我請宵夜。{zh}。你可以多帶幾個人。」':'「下班我請你吃宵夜。{zh}。不要遲到。」'],alt:a}; }
        if(r.res!=='accept') return null;
        if(c.pid==='lawlib'&&INVITE_DATA.lv0('heroine_02')) return {res:'decline',why:'quiet',lines:['「法圖比總圖還安靜吧？……我會死掉。換 Café 好不好？」']};   /* AA_535b 2-1：認識階段婉拒、有點熟以上照約 */
        if(c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['「總圖太安靜了，我會想講話。」']};
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['「週六。我本來就要去。」']}; return {res:'resched',why:'sat',lines:['「週六。我本來就要去。」'],alt:I.nextSat(G,'heroine_02',c.P,c.day,14)}; }
        return null; } },
    heroine_04:{ walk:{noodle:[['「我們社團練團的地方就在B館旁邊。」','「你們法律系的人有沒有被我們吵到？」'],['「這家的珍珠超 Q。公館的我喝過快十家，這家最好。」']],   /* BB_172 Q2、Q3 */
        wenzhou:[{if:G=>typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_ziqing_secret_game']}),l:['「這邊機車停得好亂。做成關卡的話，玩家一定一直撞到。」','「……欸，我要把它做進去。」']},{if:G=>!(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_ziqing_secret_game']})),l:['「這邊機車停得好亂，走路都要側身。」']}],   /* Q4：看過 Q6（ev_ziqing_secret_game）才說遊戲；還沒看過＝10-2 第 6 點 */
        library:['「你們法律系考試是寫申論對吧？」','「我們寫程式有點像，只是改的是電腦，錯一個字就零分。」'],   /* Q5 */any:[['（她看到一隻松鼠。）','「那隻松鼠在看我。……牠在看我的餅乾。」'],
        {if:G=>typeof SOCIAL!=='undefined'&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))&&!SOCIAL.has('heroine_04','TOLD_HER_CHANGE'),once:'ZQ_CHANGE_ASK',l:['「欸，阿凱說你之前念經濟？那你怎麼會換來法律？」'],   /* BB_172 Q7（10-1 第 10 點）的問句；①的回答照 LIFE-LINE（念了一個多月）不動 */
         ch:[{t:'（說換方向的事）',mem:'TOLD_HER_CHANGE',r:[{me:'「念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。」'},'「……你換過？」',{me:'「嗯。」'},'「你家裡說什麼？」',{me:'「一開始不太懂。後來就懂了。」'},'（她走了好幾步沒說話。）','「……好。知道了。」']},
             {t:'下次再講。',r:['「好喔，那你欠我一次。」']}]}]},   /* Q7 ② */   /* BB_70 2-5（選項句：走到目的地、見面前；「下次再講」不記，Q10 第四個選項還有一次機會）*/   /* 子晴（2-4）：社團＝作息 club（週一、週三晚上）*/
      firstAt:{teahouse:['「地板是榻榻米。我要脫鞋？……我的襪子是貓的。不准看。」'],
        gym_badminton:['（她借了一支拍子，握的方向是反的。）','「這樣握比較帥。……不是嗎？」'],run_avenue:['（六點半，她穿著帽 T 出現，眼睛只開一半。）','「我起來了。……這件事你要記得。」']},   /* AA_417 3-1 的 first（第一次去，在那裡說）*/
      acc:{teahouse:{R:['「一盞？那裡不能大聲對吧。……好，這是挑戰模式。」']},cafe:{A:['「Café？……好啊，我要點最甜的。」']},library:{R:['（她答應了，條件是「二樓靠窗，有插座的那一排」。）']},
        gym_badminton:{A:['「羽球？……我很爛喔。先說好。」'],R:['「好。我很爛。你不要教我，讓我自己爛。」']},run_avenue:{R:['「早上我在睡。……好啦，一次。」']}},   /* AA_417 3-1（晨跑只有朋友以上）*/
      sport:{gym_badminton:{during:[['「那球出界了。……好啦，是我沒接到。」'],['「剛剛那一球，你有看到吧。我接到了。」'],['「你不要一直幫我撿球。……謝謝。」']],end:['「下次我會進步。……我不想輸給一顆球。」']},
        run_avenue:{during:[['「你跑太快了。……等我。」'],['「椰子樹一棵、兩棵……數到三十就好嗎？」'],['「早上的椰影大道沒有人。……原來長這樣。」']],end:['「早餐我請。……因為我活下來了。」']}},   /* AA_417 3-1：一起的時候三句輪流、結束 */
      first:{wenzhou:['「散步？散步是什麼？」','（你解釋了一下。）','「……好啦。但要有目的地。」']},
      rule:(G,c,I)=>{ const r=c.r;
        /* 大四（畢業，在臺北的工作室上班；BB_163 第 2 節；三句照 AA_312 B-5 拿掉「欸不是」）：平日 20:00 以前在工作室、總圖要辦校友證；其他照下面原本的規則 */
        if(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('heroine_04',{day:c.day}).kind==='taipei'&&(r.res==='accept'||r.why==='busy')){ const wk=c.wd>=1&&c.wd<=5, late=20+10/60;
          if(c.pid==='slowread'&&wk) return {res:'resched',why:'work',act:'work',lines:['「平日我在工作室。……週六下午，慢讀？」'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};
          if(c.pid==='lawlib'&&wk) return {res:'resched',why:'work',act:'work',lines:['「平日我在工作室。……週六下午可以。法圖週六開到五點對吧。」'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};   /* AA_535b 2-1 */   /* AA_535 4-2：大四平日的慢讀＝婉拒＋改到下一個週六 14:00 */
          if(c.pid==='library') return {res:'decline',why:'grad',lines:['「我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？」'],alt:null};
          if(c.pid==='teahouse'&&wk) return {res:'resched',why:'work',act:'work',lines:['「平日下午我在工作室。……週六下午可以嗎？」'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};   /* BB_163 第 2 節（BB-B 55509fe2）：平日（週三～週五下午）的一盞改到最近的週六下午 */
          const firstY4=c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='heroine_04'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&STORY.presence('heroine_04',{day:iv.day}).kind==='taipei');
          if(wk&&c.h<20&&['cafe','noodle','wenzhou'].includes(c.pid)){ const alt=I.freeAt(G,'heroine_04',c.P,c.day,late)?{day:c.day,h:late}:I.nextFree(G,'heroine_04',c.P,c.day,late);
            return {res:'resched',why:'work',act:'work',lines:c.pid==='cafe'?['「我八點才下班。……八點十分，兩點半。」']:(firstY4?['「好。……阿鳳阿姨還記得我嗎？」']:null),alt}; }
          if(firstY4&&r.res==='accept') return {lines:['「好。……阿鳳阿姨還記得我嗎？」']}; }
        if(c.pid==='brunch'&&(r.res==='accept'||r.res==='resched')){ const Q=I.place('cafe'); let a=null; for(let d=c.day;d<=c.day+3&&!a;d++) for(let hh=14;hh<=17;hh+=0.5) if(Q&&I.freeAt(G,'heroine_04',Q,d,hh)){ a={day:d,h:hh,place:'cafe'}; break; }   /* BB_158 第 2 節：週末 14:00 才起床（AA_137 8-5），半熟一律婉拒；改天指向 Café（下午）*/
          return {res:a?'resched':'decline',why:'sleep',lines:['「週末早上我在睡覺。……下午的話，Café。」'],alt:a}; }
        if(r.res==='resched'&&r.why==='busy'&&r.act==='club'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_04',c.P,c.day,21.5); if(!a||a.day!==c.day) return null; return {lines:['「社課完。{zh}。麵店。」'],alt:a}; }
        if(r.res==='accept'&&c.pid==='lawlib'&&INVITE_DATA.lv0('heroine_04')) return {res:'decline',why:'quiet',lines:['「法圖？比總圖還不能講話吧。……不要。」']};   /* AA_535b 2-1 */
        if(r.res==='accept'&&c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['「總圖不能講話。我會死。」']};
        return null; } },
    heroine_05:{ partnerSay:{teahouse:['「一盞……那裡太安靜了。Café 可以，帶你的筆記。」']},   /* 有伴侶時約一盞（AA_172 3b）：系統說明之後她自己的一句 */
      walk:{library:[{if:(G,c)=>c.year<3,l:['「B館的電梯很慢，走樓梯比較快。」','「總圖三樓靠窗的位子，九點以前就要去搶。」','「……我大一的時候，這些都沒人告訴我。」']},{if:(G,c)=>c.year>=3,l:['「B館的電梯還是很慢。」','「我現在比較常去法圖。總圖的位子，給你們搶。」']}],   /* 大三起：AA_259 (b) 第 3 點（AA_312 第 3 節 C；dd9b704aa）*/wenzhou:[{if:(G,c)=>c.postExam,l:['「這家鬆餅聽說很好吃，我每次經過都在趕時間。」']}],   /* BB_172 S3 */noodle:['「以前法服有個個案，就住在這附近。阿伯每次來都帶一袋橘子。」','「……我們不能收，他就放在桌上走掉。」'],any:['「我大一的時候以為四年很長。……我大一的時候也以為總圖的位子很好搶。」']},   /* 學姊（3-4）：平日 9–17 在總圖（作息 read，個人規則）；散步在 W8（ev_sis_collapse）以前婉拒、不給改天 */
      firstAt:{brunch:['「三分四十秒。老闆娘說的。……她每一顆都這樣計時？」'],teahouse:['「這裡不能讀書。……我很少去不能讀書的地方。」']}, acc:{brunch:{A:['「半熟。好。我九點就到，你不要遲到。」'],R:['「好。……這次我點鬆餅。」']},teahouse:{R:['「一盞。……好。那裡有一壺，我一直想再喝。」']},cafe:{A:['「好。帶你的筆記，我順便看。」'],R:['「今天不看筆記。」']},noodle:{A:['「好。阿鳳的菜我排過名次。……到了再告訴你。」'],R:['「這次你點。我想知道你喜歡吃什麼。」']},wenzhou:['「散步。好。……溫州街我只有路過，沒有真的走過。」'],
        gym_badminton:['「羽球。好。……我只會發球。」'],run_avenue:['「晨跑。好。跑完我直接去研究室。」']},   /* AA_417 3-3 */
      rule:(G,c,I)=>{ const r=c.r, lib=c.wd>=1&&c.wd<=5&&c.h>=9&&c.h<17;
        if((c.pid==='wenzhou'||c.pid==='lake')&&!c.postExam&&(r.res==='accept'||r.res==='resched')) return {res:'decline',why:'exam',lines:['「散步的話，等我考完。」','「週三晚上我在法圖。要讀書的話，可以一起。」'],alt:null};   /* 筆試（2026-02-02 17:00）以前婉拒散步（AA_284 1-3；原本綁作廢的 W8、到 11/30 連交往都拒）*/
        if(c.pid==='lawlib'&&r.res==='accept'&&typeof SISG!=='undefined'&&SISG.preExamStudy&&SISG.preExamStudy(G,c)) return {lines:['「好。法圖開到九點四十五，我們念到最後一分鐘。」']};   /* AA_535b 2-1 筆試前（照慢讀那一列的範圍：第 14 週～筆試）*/
        if(c.pid==='slowread'){ if(r.res==='accept'&&typeof SISG!=='undefined'&&SISG.preExamStudy&&SISG.preExamStudy(G,c)) return {lines:[SISG.STUDY_YES]};   /* AA_535 4-2：筆試前（第 14 週～筆試）約慢讀＝「好。我帶刑訴。……」（和 1-3 同一句）*/
          if((r.res==='accept'||r.why==='busy')&&lib&&c.year>=3) return {res:'resched',why:'busy',lines:['「平日我在法圖。……週六下午可以。」'],alt:I.nextSat(G,'heroine_05',c.P,c.day,14)}; }   /* AA_535 4-2：祐廷大三起平日 9～17 她在法圖＝婉拒＋改到下一個週六 14:00（慢讀 18:00 關，改到 17:00 坐不滿）*/
        { const q=typeof SISG!=='undefined'&&SISG.inviteCap?SISG.inviteCap(G,c,I):null; if(q) return q; }   /* 筆試以前的邀約上限（AA_284 2-1：一週一次 → 兩週一次 → 第 14 週起婉拒；平日午餐不算；src/sis_grad3d.js）*/
        if(r.res!=='accept'||!lib) return null;
        if(c.pid==='library'&&c.year>=3){ const carrel=c.h>=14&&typeof LUP!=='undefined'&&LUP.sisPeriod&&LUP.sisPeriod(Object.assign({},G,{day:c.day}));
          return {res:'resched',why:'busy',lines:[carrel?'「我在研究小間。五點以後過去找你。」':'「我在法圖。五點以後過去找你。」'],alt:I.nextFree(G,'heroine_05',c.P,c.day,17)}; }   /* 大三起她平日下午在法圖（AA_259 (b) 第 3 點 rule library，改 resched、17:00）；2028-02 起 14～17 在研究小間（AA_437 第 3 節）*/
        if(c.pid==='library') return {res:'here',lines:['「我就在總圖。三樓。不要講話，傳訊息。」'],alt:null};
        if(c.pid==='cafe'||c.pid==='wenzhou') return {res:'resched',why:'busy',lines:[c.pid==='cafe'?'「五點以後好不好？我要先把這段寫完。」':'「五點以後。……散步，我試試看。」'],alt:I.nextFree(G,'heroine_05',c.P,c.day,17)};
        return null; } },
    kai:{ walk:{any:[{if:(G,c)=>c.year<=1,l:['「我們那層的洗衣機又壞了，我衣服已經堆三天了。」']}],   /* BB_172 K1（當面說的加標點；不和宿舍隨機句撞）*/
        noodle:[{if:(G,c)=>c.year<=1,once:'KAI_SCOOTER_ASK',l:['「欸，你們法律系的，路邊機車停在騎樓擋路，可以告嗎？」'],ch:[{t:'不一定是告，可以請警察來看',r:['「喔，所以告跟叫警察不一樣。好，我學到了。」']},{t:'你想告誰',r:['「沒有啦，我只是想知道我能不能。」']},{t:'先讓我吃完',r:['「好，你吃。」','（過了十秒）','「……吃完了嗎？」']}]}]},   /* BB_172 K2 */   /* BB_70 4-5（大一上；「先讓我吃完」＝去吃飯的路上）*/   /* 阿凱（4-4）：他的句子沒有標點 */
      /* 手機／當面兩版（BB_172 第 10 節 10-1 第 17 點：手機照他的訊息體、沒有標點；當面加標點）：{phone, face}，INV.personal 照有沒有當面（c.face）選 */
      acc:{brunch:{phone:['「十二點 好 那是我的早餐」'],face:['「十二點？好，那是我的早餐。」']},teahouse:{phone:['「茶屋要脫鞋嗎 好 我襪子有洞」'],face:['「茶屋要脫鞋嗎？……好，我襪子有洞。」']},
        cafe:{A:{phone:['「那裡有插座嗎 我要帶電腦」'],face:['「那裡有插座嗎？我要帶電腦。」']}},noodle:{phone:['「走 我剛好還沒吃」'],face:['「走，我剛好還沒吃。」']}},   /* K3、K4（10-2 第 10 點）、K5、K6（10-1 第 15 點）*/
      first:{wenzhou:{phone:['「散步要幹嘛」','（你說那裡有貓。）','「好」'],face:['「散步要幹嘛？」','（你說那裡有貓。）','「好。」']}},   /* K7 */
      rule:(G,c,I)=>{ if(c.pid==='brunch'&&c.r.res==='accept'&&c.h<12){ const h2=12+10/60; return {res:'resched',why:'sleep',lines:c.face?['「早上不行，我在睡覺。」']:['「早上 不行 我在睡」'],alt:I.freeAt(G,'kai',c.P,c.day,h2)?{day:c.day,h:h2}:null}; }   /* BB_158 第 6 節：半熟早上改 12:10 */
        if(c.pid!=='library'||c.r.res!=='accept') return null; const ex=!!(c.term&&[7,8,9,15,16].includes(c.term.week));   /* BB_172 K9（AA_209 第 4 節）*/   /* 朋友以上：考前一週、考試週答應 */
        if(c.band==='R'&&ex) return null; return {res:'decline',why:'sleepy',lines:c.face?['「總圖我會睡著。」','「考前一週我會去，真的。」']:['「總圖我會睡著」','「考前一週我會去 真的」']}; } },   /* K8、K9 當面版（BB_172 10-1 第 17、8 點；週次 [7,8,9,15,16] 已經照改）*/
    classmate_mingxuan:{ walk:{any:[['「我家教那個學生問我，念法律是不是要背很多東西。」','「我跟他說，要背，背完還要會用。」'],['「我爸之前傳訊息問我『籃球的三分線是畫在哪裡』。」','「他在看我們比賽的直播。……到現在還是看不懂。」'],['「這條路我每個禮拜都走好幾次，去家教都走這邊。」']]},   /* BB_172 M2（10-1 第 16 點）、M3（10-1 第 7 點）、M4 */   /* 明軒（5-4）：二、四、六晚上 19–21 家教（個人規則）；Café 的「只能待一小時」朋友以後不說（BB_120 1-6）*/
      acc:{brunch:{phone:['「早午餐？哈哈 CP 值不高喔……好啦 週末可以」'],face:['「早午餐？CP 值不高喔……好啦，週末可以。」']},teahouse:{phone:['「一盞？哈哈 我很少喝茶 我爸喝 好啊」'],face:['「一盞？我很少喝茶，我爸才喝。……好啊。」']},
        cafe:{A:['「好。但我只能待一小時。」']},noodle:['「走啊，阿鳳便宜又大碗。」'],wenzhou:['「可以啊。走一走也好，我最近都坐著。」']},   /* BB_172 M5、M6（手機／當面，10-1 第 17 點）、M8、M9（10-2 第 1 點）*/
      rule:(G,c,I)=>{ const tut=[2,4,6].includes(c.wd)&&c.h+c.P.stay>19&&c.h<21; if(c.r.res!=='accept'||!tut) return null;
        if(c.pid==='cafe') return {res:'resched',why:'tutor',lines:[c.face?'「那時候我在家教，九點以後可以。」':'「那時候我在家教 九點以後可以」'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day,21)};   /* BB_172 M10（10-2 第 3 點）*/
        if(c.pid==='library') return {res:'resched',why:'tutor',lines:[c.face?'「我七點要家教，{zh}可以嗎？」':'「我七點要家教 {zh}可以嗎」'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day+1,10)};   /* M11（10-1 第 1 點：alt 只往後找，用 {zh}）*/
        if(c.pid==='noodle'){ const a=I.nextFree(G,'classmate_mingxuan',c.P,c.day,21.5); return {res:'resched',why:'tutor',lines:[a&&a.day===c.day?(c.face?'「家教完，{zh}，吃便宜的那家。」':'「家教完 {zh} 吃便宜的那家」'):(c.face?'「那天我要家教，{zh}可以嗎？」':'「那天我要家教 {zh}可以嗎」')],alt:a}; }   /* M12（10-1 第 2 點）*/
        return null; } },
    classmate_peishan:{ afterMeet:(G,iv,pid)=>pid==='library'&&typeof STORY!=='undefined'&&STORY.termAt&&STORY.termAt(iv.day)==='Y2S2'&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_p4b')?[G.flags.PS_P4B_GROUP?'（她遞過來一張便條：「今天念了 42 頁。你們呢？」）':'（她遞過來一張便條：「今天念了 42 頁。你呢？」）']:null,   /* P4b（BB_97 4-4）：大二下週末陪她在總圖念，每次一張便條（小組版寫「你們呢？」）*/
      walk:{any:[{once:'PS_LAW_ASK',l:['「剛剛路上那排機車，全都停在紅線上。」','「如果一條規定大家都不守，它還算數嗎？」'],   /* BB_172 P2（10-1 第 11 點：人已經在目的地；選項、after 照舊）*/
        ch:[{t:'還是法律，只是沒人守。',r:['「所以寫下來就算數喔？」','「那寫的人壓力好大。」']},{t:'那它可能該改了。',r:['「所以大家不守，算是在投票嗎？」']},{t:'要看大家為什麼不守。',r:['「……也是。有的人是不想守，有的人是沒辦法守。」']}],
        after:[{if:G=>typeof CALENDAR==='undefined'||!CALENDAR.TERMS||(T=>!T||CALENDAR.tOf(G.day)<T.t0)(CALENDAR.TERMS.find(t=>t.id==='Y1S2')),l:['「好。我要拿這題去問讀書會的人，看看他們怎麼說。」']},{l:['「好。我要拿這題去問課輔班的小孩，看看他們怎麼說。」']}]}]},
      firstAt:{brunch:['「她翻蛋的時候手腕都不動耶。我媽也是。」','「我到現在還學不會。」'],teahouse:['「這裡講話要很小聲對不對？」','「……那我小聲問，第一泡為什麼要倒掉？」']},   /* BB_172 P3、P4 */ acc:{brunch:{A:['「早餐店的女兒，去吃別人的早午餐。……好，我去研究。」'],R:['「好。我想看他們的蛋怎麼翻。」']},teahouse:{R:['「一盞？好。我可以帶問題去嗎？很多個。」']},cafe:{A:['「好。但我會一直問你問題。」']},noodle:{A:['「我吃很慢。你不能催我。」']},
        gym_badminton:['「好啊！！我要問你，你為什麼會打。」'],run_avenue:['「好啊！早上我很習慣，在家的時候四點半就要起來幫忙開店。」']},   /* AA_417 3-3 */ first:{wenzhou:['「散步是最好的思考。……我在書上看到的。」']}, rule:(G,c,I)=>{ const r=c.r;   /* 消失期（2026-12-18～2027-08-06）約她一律沒有回覆、不顯示她的句子（presence unreachable＝「沒有回覆。」；交往中照 AA_276 去台中）：大二下的婉拒句、大二下那一段刪（AA_255 (b-1) 第 20 條，52900eb23）*/
        const tp=typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('classmate_peishan',{day:c.day}).kind==='taipei'; if(!tp||!(r.res==='accept'||r.why==='busy')) return null;   /* 你那個時間有約、店沒開、下雨：照系統的說法 */   /* BB_163：重考那一學期（大二下）、大三起在別的學校；人在臺北 */
        const wkend=c.wd===6||c.wd===0;
        if(c.term&&c.term.id==='Y2S2'){   /* 1-1：週末在總圖念書，平日在家念。消失期 tp 不成立，這一段不會播（AA_255 (b-1) 第 20 條說可以刪；AA_415 ps30 等列還指著這幾句（build_replies.py 會核對），先留著）*/
          if(c.pid==='library') return wkend?{res:'accept',lines:['「好。我在老位子。……你坐著就好，不用說話。」']}:{res:'resched',why:'study',lines:['「平日我在家念，比較不會分心。……週末，總圖。」'],alt:I.nextSat(G,'classmate_peishan',c.P,c.day,10)};
          if(c.pid==='cafe') return {res:'decline',why:'study',lines:['「Café 我會想跟你聊天。……現在不行。週末來總圖，坐我旁邊。」'],alt:null};
          if(c.pid==='noodle') return {res:'decline',why:'study',lines:['「阿鳳阿姨的麵，考完我要吃兩碗。……現在我吃便當，十分鐘。」'],alt:null};
          if(c.pid==='wenzhou'){ if(G.flags&&G.flags.dating_classmate_peishan&&c.wd===0&&c.h>=14&&c.h<15) return {res:'here',lines:['「星期日下午本來就是你的。……不用約。」'],alt:null};
            return {res:'decline',why:'study',lines:['「散步會讓我想很多事。現在不能想太多。……考完，我們走遠一點。」'],alt:null}; }
          return null; }
        /* 1-2：大三起。週二三四 16～19 課輔班、週六 10～18／週日 13～18 書店 */
        const tutor=[2,3,4].includes(c.wd)&&c.h<19&&c.h+(c.P.stay||1)>16, shop=(c.wd===6&&c.h<18&&c.h+(c.P.stay||1)>10)||(c.wd===0&&c.h<18&&c.h+(c.P.stay||1)>13);
        const at=(h)=>I.freeAt(G,'classmate_peishan',c.P,c.day,h)?{day:c.day,h}:I.nextFree(G,'classmate_peishan',c.P,c.day,h);
        if(c.pid==='lawlib') return INVITE_DATA.toSlow(G,'classmate_peishan',c,I,['「法圖我現在進不去了。……慢讀好不好？」']);   /* AA_535b 2-1：大三起不在這裡念了 */
        if(c.pid==='lake'&&r.res==='accept'&&!c.first) return {lines:['「好。……我好久沒回去了。」']};   /* AA_535b 2-2：acc R 換這一句（校園誰都進得來）*/
        if(c.pid==='slowread'){ if(tutor||shop){ const wdD=d=>((G.weekday+(d-G.day))%7+7)%7, tpD=d=>STORY.presence('classmate_peishan',{day:d}).kind==='taipei'; let alt=null;
            for(let d=c.day+1; d<=c.day+14&&!alt; d++) if(wdD(d)!==6&&tpD(d)&&I.freeAt(G,'classmate_peishan',c.P,d,10)) alt={day:d,h:10};   /* 下一個她有空的早上 10:00（週六整天在書店；在臺北；慢讀週二休由 freeAt 擋）*/
            return {res:'resched',why:'work',act:'work',lines:[shop?'「那時候我在書店。……慢讀早上也開，早上好不好？」':'「那時候我在課輔班。……慢讀早上也開，早上好不好？」'],alt}; }   /* AA_535b 4-3：撞到書店、課輔班不用 plan 那句；慢讀 18:00 關門，不像 Café 改到下班以後 */
          return r.res==='accept'?{lines:['「好。慢讀不用學生證。……我帶作業去改。」']}:null; }   /* AA_535 4-2（大三起，在臺北）*/
        if(c.pid==='library') return {res:'decline',why:'school',lines:['「我現在進不去總圖了。……Café 好不好？我帶作業去改。」'],alt:null};
        if(c.pid==='cafe'){ if(shop) return {res:'resched',why:'work',act:'work',lines:['「書店六點打烊。……六點十分，兩點半。」'],alt:at(18+10/60)}; if(tutor) return {res:'resched',why:'work',act:'work',lines:['「七點下課。……七點半，我走過去。」'],alt:at(19.5)};
          return {res:'accept',lines:['「好。我帶作業去改，你念你的。」']}; }
        if(c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='classmate_peishan'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&/^Y[34]/.test((CALENDAR.termOf(iv.day)||{id:''}).id))&&r.res==='accept') return {lines:['「好。阿鳳阿姨一定會問我現在念什麼。……我要講很久。」']};
        if(c.pid==='wenzhou'&&tutor) return {res:'resched',why:'work',act:'work',lines:['「課輔班下課，剛好在溫州街。……七點，門口等我。」'],alt:at(19)};
        return null; } },   /* rule：BB_158 第 4 節，大二下重考那一學期半熟、一盞都婉拒（SYS-21 起她那學期休學、presence 先回 away：照樣換成她自己的這一句）*/   /* 沛珊（6-4）*/
    kexin:{ rule:(G,c,I)=>c.pid==='lawlib'&&c.r&&(c.r.res==='accept'||c.r.res==='resched')?INVITE_DATA.toSlow(G,'kexin',c,I,['「法圖？我是外校的，進不去吧。」','「……慢讀好不好？那裡不用證件。」']):null,   /* AA_535b 2-1：她是外校的，法圖進不去，改約慢讀 */
      acc:{brunch:{A:['「半熟？我從木柵大學過來要四十分鐘。好，我十點到。」'],R:['「好啊，我先查一下菜單。」']},teahouse:{R:['「一盞。安靜的地方。……我可能一個小時都不講話喔。」']},
        pasta118:['「好。我從木柵過去四十分鐘，你先點，我到了就吃。」'],teahouse_ceremony:['「茶席。……我要穿裙子嗎？」','「我穿。」'],   /* AA_535b 4-2（企劃線 b3e5bca3b）：茶席那句接茶席現場她「坐下來，又站起來，把裙子拉好再坐」（wzlines3d.js CEREMONY_LINES）*/
        /* AA_417 3-2（她是政大的學生：羽球場由祐廷用台大的帳號預約）；政大那幾年的句子，經濟系那一年不用 */
        gym_badminton:G=>(G.stage||'law')==='law'?{A:['「首都帝大的球場？好。……先說，我高中打過。」'],R:['「好。我從山上下來。拍子你負責借。」']}:null,
        run_avenue:G=>(G.stage||'law')==='law'?{R:['「椰影大道？從木柵大學過去要四十分鐘。」','「……好。你敢遲到試試看。」']}:null},
      sport:{gym_badminton:{during:[['「那一球你讓我？……不准讓。」'],['「再一局。這局不算，我鞋帶鬆了。」'],['「你們的球場比較亮。……這不是藉口。」']],end:['「下次在木柵大學打。……你要上山。」']},
        run_avenue:{during:[['「跑到晨思鐘不要停。跑回來才算。」'],['「我不喘。……我在講話，所以我不喘。」'],['「早上的首都帝大好安靜。山上的鳥比較吵。」']],end:['「早餐我知道一家。走。」']}},   /* AA_417 3-2：一起的時候三句輪流、結束 */   /* BB_158 第 5 節（她在政大：時間照她的作息；2026-10-17 BB-C 改稿：不再每句「假設」）*/
      firstAt:{gym_badminton:G=>(G.stage||'law')==='law'?['「我高中打過一學期。這是告知，不是警告。」']:null,run_avenue:G=>(G.stage||'law')==='law'?['「六點二十五分。我先到了。」']:null,   /* AA_417 3-2 的 first */
        brunch:['「蛋可以選熟度欸。……我要半熟。」'],teahouse:['「我們學校後山也有茶園欸。」','「不過這邊的院子比較安靜。」'],
        /* AA_535b 4-2：第一次和她到 Café、總圖、麵店、溫州街多說的（「你們學校」「我們學校山下」＝她在政大、祐廷在台大的那幾年，經濟系那一年不用，和羽球、晨跑同一把尺）*/
        cafe:G=>(G.stage||'law')==='law'?['（她看了一圈，在吧檯前面站了很久才點。）','「你們學校旁邊的咖啡店開到半夜喔。我們那邊十點就關了。」']:null,
        library:G=>(G.stage||'law')==='law'?['（她站在大廳，抬頭看了一圈。）','「好大。……我會迷路。你走前面。」']:null,
        noodle:G=>(G.stage||'law')==='law'?['「阿姨，乾麵加滷蛋。」','（她轉頭看你。）','「他說這樣點最好吃。」']:null,
        wenzhou:G=>(G.stage||'law')==='law'?['「這條街好多書店。……我們學校山下只有影印店。」']:null} },
    npc_fangyt:{ walk:{any:[['「椰影大道的大王椰子，葉子一片好幾公斤，掉下來會砸傷人。」','「走那邊我都走中間。」'],['「這棵是樟樹。這棵是菩提。那棵……我不知道欸，我回去查。」'],{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('npc_fangyt','FANG_HINT'),l:['「芷若高中就這樣，下課都是她在講。」']}]},   /* BB_172 F2（10-1 第 12 點）、F3、F4（10-1 第 9 點：改條件，看過 Z6「隔壁房的人記得的事」＝FANG_HINT 才放）*/ acc:{brunch:['「好。早上我本來就起得早。」'],teahouse:['「好。聽說那邊院子有一棵很老的樟樹，我想去看看。」'],cafe:['「好。順便看一下 Café 窗台那盆植物。」'],library:['「好。我在總圖門口等你。」'],wenzhou:['「溫州街有一棵很老的榕樹。我帶你去。」']} }   /* 方奕廷（7-4）；Café、總圖、一盞：BB_172 F6～F8（10-2 第 1 點）*/
  }
};
/* ---------- 慢讀咖啡（118 巷）當邀約地點（AA_535 第 4 節，AA-B 定稿 dbd49dca7，企劃線 docs/story_planning/AA_535_…；第②級；INVITE-OPTS-1030）----------
   地點（4-1）：念書＋喝咖啡、喝茶兩類（cats）；剛認識就可以約（reason，有伴侶也可以，和 Café、總圖一樣）；營業 09:00～18:00、週二休（off）；坐一個半小時＝最晚 16:30 開始（hours 是整段要在裡面）；
   只在法律系的年級（118 巷的場景本來就只在法律系）；時間：平日 12:10、15:30，週末多 10:00、14:00（timesBy）；下雨照常。見面兩個人一起坐下讀書（seatPose）。
   台詞（4-2，一字照稿）：first＝第一次約這裡、acc A＝認識和有點熟、R＝朋友以上、plan＝她那時候有事（系統接改天）、here＝她本來就在（3-1 的常客時段）、firstAt＝第一次和她到這裡多說的、walk＝一起走過去。
   芷若的 plan：上班照現有的 barista 規則（AA_415 表），不用這句。個人規則（子晴大四平日、學姊大三起平日與筆試前、沛珊大三起）寫在上面各人的 rule。見面旁白在 rel_lines.js 的 meet.slowread */
INVITE_DATA.places.push({id:'slowread',zone:'l118_cafe2',name:'慢讀咖啡',verb:'去慢讀咖啡念書',kind:'reason',minStage:'ACQUAINTANCE',stay:1.5,memory:'SLOWREAD_TOGETHER',sitAct:'read',seatPose:'read',cats:['study','sit'],
  days:[0,1,3,4,5,6],off:[2],hours:[9,18],timesBy:{wk:[12+10/60,15.5],we:[10,12+10/60,14,15.5]},show:G=>!!G&&(G.stage||'law')==='law'});
(function(){ const ytH8=G=>{ const o=G&&G.l118&&G.l118.once; return !!o&&typeof o==='object'&&o.H8!=null; };   /* 118 巷 H8 演過（滇香小館的老闆娘說語彤自己來問開店的事；lane118.js S.H8）。AA_535b 4-1 更正：稿上原本寫家常菜，H8 在滇香 */
  const SR={
    heroine_01:{first:['「慢讀？……那間我常去。窗邊有插座那張，我知道什麼時候會空。」'],acc:{A:['「好。我先去佔位子。」'],R:['「好啊。今天換你先到，位子你挑。」']},plan:['「那時候我手帳排了別的。{zh}可以嗎？」'],
      here:['「我已經在慢讀了。窗邊。」'],firstAt:['（店長看到她，直接去做一杯熱拿鐵，沒有問她要什麼。）','「……我每次都點一樣的。所以她不問了。」'],walk:['「蛋包飯研究所。……我每次經過都想問，他們研究出什麼了。」']},
    heroine_02:{first:['「慢讀？去別人家的咖啡店喔……好啊，我想看他們的拉花。」'],acc:{A:['「好啊。我坐那邊會很想去幫他們洗杯子，你要拉住我。」'],R:['「好啊，我帶小說去。這次真的會看。」']},
      plan:(G,c)=>c&&c.r&&c.r.act==='barista'?null:['「那時候我有事啦。{zh}好不好？」'],firstAt:['（拿鐵端上來，她先看了很久才喝。）','「……拉得比我好。」','「不要跟我們店長講。」'],walk:['「這條巷子的咖啡店，聽說一年會換一間。」','「慢讀撐那麼久，一定有什麼原因。」']},
    heroine_03:{first:['「慢讀……美式七十，可以坐一下午。」','「好。」'],acc:{A:['「好。我帶筆記。」'],R:['「好。我那天剛好要寫報告。」']},plan:['「那時候不行。{zh}。」'],here:['「我在慢讀。你來。」'],
      firstAt:['（她看了一圈書架，抽出一本，翻到中間又放回去。）','「這本我有。阿姨店裡也有一本，被湯滴到過。」'],walk:[{if:G=>ytH8(G),l:['「滇香小館的老闆娘人很好。我去問過她開店的事。」']},{if:G=>!ytH8(G),l:['「118 巷的店，老闆幾乎都住樓上。」','「你看二樓的窗戶，有曬衣服的就是。」']}]},
    heroine_04:{first:['「慢讀？……有插座嗎？」','（你說有。）','「好。」'],acc:{A:['「好啊。我要坐有插座的地方，不然我會很焦慮。」'],R:['「好。我寫程式，你念書。誰先分心誰請下一杯。」']},plan:['「那時候不行。{zh}？」'],
      firstAt:['（她把筆電插上電，看到電量開始跳，才把外套脫掉。）','「好。我活過來了。」'],walk:['「這條巷子好窄。做成地圖的話，鏡頭一定會卡牆。」']},
    heroine_05:{first:['「慢讀……我大一常去。」','「好。帶你的筆記。」'],acc:{A:['「可以。我只能待一個半小時。」'],R:['「好。今天我不趕。」']},plan:['「那時候我有安排了。{zh}，可以嗎？」'],
      firstAt:['（她坐下來，先用紙巾把桌上的水漬擦乾，才把書放上去。）','「這張桌子我大一坐過。……桌腳還是會晃。」'],
      walk:[{if:(G,c)=>c.year<=2,l:['「118 巷的店，我大一的時候只吃過兩間。」','「每天都在想要念什麼，沒在想要吃什麼。」']},{if:(G,c)=>c.year>=3,l:['「我現在比較常來了。」','「……念不下去的時候。」']}]},
    classmate_peishan:{first:['「慢讀？好啊！我一直想進去，可是一個人不敢。」'],acc:{A:['「好啊！我帶民總，有問題可以問你嗎？」'],R:['「好。你念你的，我念我的，念完一起吃飯。」']},plan:['「啊，那時候我有事！{zh}可以嗎？」'],
      firstAt:['（她進門先把整面書架看完一遍，才坐下來。）','「我們家店裡也有一面這種書架。……都是我媽在看。」'],walk:['「你看韓食小廚門口的菜單，手寫的。」','「我們家的菜單也是我寫的。字很醜，可是客人說看得懂。」']},
    kexin:{first:['「慢讀？名字取得很好。我念書就是很慢。」','「……好，我過去。四十分鐘。」'],acc:{A:['「好。我坐窗邊，你坐對面，不准講話。」'],R:['「好。我帶刑總，你負責讓我不要睡著。」']},plan:['「那時候不行。{zh}，不准再改。」'],
      firstAt:['（她點了美式，喝一口，看了一下價錢。）','「七十。我們學校旁邊要八十。」','「……你們這邊什麼都比較便宜，除了房租。」'],walk:['「你們學校旁邊的巷子都長得好像。我上次在這裡走錯兩次。」']} };
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
    heroine_01:{first:['「法圖？……那裡冷氣比總圖冷。我帶外套。」'],acc:{A:['「好。三樓，靠書架那排。」'],R:['「好。我幫你留位子。」']},plan:['「那時候我有課。{zh}可以嗎？」'],
      firstAt:['（她走到判解那一區，熟門熟路地抽出一本，連目錄都沒看。）','「大一上我在這裡迷路過一次。後來就記住了。」'],walk:['「法圖平日開到九點四十五。我手帳有寫。」']},
    heroine_02:{first:['「法圖？我可以進去喔？……那我要去看你們的書有多厚。」'],acc:{A:['「好。我帶小說，坐你旁邊，不吵你。」'],R:['「好。我帶小說，坐你旁邊，不吵你。」']},plan:['「那時候我有事啦。{zh}好不好？」'],   /* 有點熟（band A）也用 acc R 那句；認識階段在 rule 婉拒 */
      firstAt:['（她抽出一本很厚的書，翻開，又小心地放回去。）','「這本比我的頭還重。你們每天都在看這個喔？」'],walk:['「法律系的人走路都好快。你們是不是都在趕什麼？」']},
    heroine_03:{first:['「法圖……我沒進去過。」','「好。」'],acc:{A:['「好。我帶自己的書。」'],R:['「好。你們那邊比較安靜，我要寫報告。」']},plan:['「那時候不行。{zh}。」'],
      firstAt:['（她在入口的告示前面停下來，把開放時間抄進筆記本。）','「我們系的圖書室，五點就關了。」'],walk:['「你們系的人，好像都背很大的包包。」']},
    heroine_04:{first:['「法圖？我進去會不會被趕出來？」','（你說不會。）','「好。……有插座嗎？」'],acc:{A:['「好。我寫程式，你念書。我會很安靜。……大概。」'],R:['「好。我寫程式，你念書。我會很安靜。……大概。」']},plan:['「那時候不行。{zh}？」'],
      firstAt:['（她看到一整面的判決彙編，停住了。）','「這是你們的資料庫喔。……實體的。」'],walk:['「你們系館的電梯，是不是比我們的還慢。」']},
    heroine_05:{first:['「法圖。……好。那是我的地方，你要安靜。」'],acc:{A:['「可以。我坐我平常的位子，你坐旁邊。」'],R:['「好。今天我請你喝販賣機的。」']},plan:['「那時候我有安排了。{zh}，可以嗎？」'],here:['「我在法圖。三樓。你來。」'],
      firstAt:['（她走到三樓靠窗的位子，桌上已經有一疊她的書。）','「我常常忘了帶走。館員幫我留著。」'],walk:['「法圖的樓梯，我大一的時候數過。……不要問我幾階。」']},
    classmate_peishan:{first:['「法圖！我一直想問，你都坐哪裡？」'],acc:{A:['「好！我帶民總，有問題問你。」'],R:['「好。我們坐同一排就好，不用坐隔壁。……坐隔壁我會一直講話。」']},plan:['「啊，那時候我有事！{zh}可以嗎？」'],
      firstAt:['（她在借書櫃台問了館員三個問題，館員都回答了。）','「館員人好好。我以為法圖的人都很兇。」'],walk:['「你知道法圖幾點關嗎？我每次都記錯。」']} };
  const LAKE={
    heroine_01:{first:['「映月湖？……好。我還沒有晚上去過。」'],acc:['「好。手帳我放在家裡。」'],plan:['「那時候我有讀書會。{zh}可以嗎？」'],firstAt:['（湖面上有路燈的倒影。她站在木棧道上看了很久。）','「白天我都是走過去，沒有停下來過。」'],walk:['「湖心亭那邊，大一的時候有人在拍婚紗。……我記得，因為那天我遲到。」']},
    heroine_02:{first:['「映月湖！我超喜歡那裡晚上的樣子，很像電影。」'],acc:['「好啊。……你要不要我帶相機？」'],plan:(G,c)=>c&&c.r&&c.r.act==='barista'?null:['「那時候我有事啦。{zh}好不好？」'],firstAt:['（她拿手機對著湖心亭拍了好幾張，每一張都蹲得更低。）','「這個角度，可以當電影的最後一幕。」'],walk:['「有一部電影的告白，就是在湖邊。……我不講是哪一部，你自己猜。」']},
    heroine_03:{first:['「映月湖……晚上很安靜。好。」'],acc:['「好。我九點以前要回店裡。」'],plan:['「那時候不行。{zh}。」'],firstAt:['（她在木棧道邊蹲下來，看水裡的魚。）','「牠們不怕人。……大家都會餵。」'],walk:['「阿姨說，以前湖邊有一個賣豆花的。後來就不見了。」']},
    heroine_04:{first:['「映月湖？晚上去？……會不會有蚊子。」','「好啦。」'],acc:['「好。我帶防蚊液。這是條件。」'],plan:['「那時候不行。{zh}？」'],firstAt:['（她看著湖心亭的燈，拿出手機開了一個空白的檔案。）','「這個場景，我要做進下一關。」'],walk:['「湖的形狀要做成地圖的話，邊邊很難畫。」']},
    heroine_05:{first:['「映月湖。……好。我很久沒有不念書地走路了。」'],acc:['「好。散步不帶書。我試試看。」'],plan:['「那時候我有安排了。{zh}，可以嗎？」'],firstAt:['（她站在湖邊，沒拿手機，也沒拿便條。）','「……這裡比我記得的安靜。」'],walk:['「我大一的時候，常常繞這個湖背書。一圈背一條。」']},
    classmate_peishan:{first:['「映月湖！好啊，我想看湖心亭晚上有沒有開燈。」'],acc:['「好！走完我們去吃東西。」'],plan:['「啊，那時候我有事！{zh}可以嗎？」'],firstAt:['（她走到湖心亭，摸了一下欄杆。）','「這欄杆好舊。我們家店門口也有一個這麼舊的。」'],walk:['「你有沒有覺得，晚上的學校跟白天是兩個地方。」']},
    kexin:{first:['「映月湖？你們學校的湖？……好，我去看看有多大。」'],acc:['「好。我從木柵過去，你負責晚餐。」'],plan:['「那時候不行。{zh}，不准再改。」'],firstAt:['（她繞到湖的另一邊看了一下，又走回來。）','「比我們學校的大一點。……一點點。」'],walk:['「你們學校晚上的路燈比較亮。我們山上比較黑。」']} };
  INVITE_DATA.lawlibLines=LAW; INVITE_DATA.lakeLines=LAKE;
  for(const [pid,T] of [['lawlib',LAW],['lake',LAKE]]) for(const id in T){ const p=INVITE_DATA.people[id]||(INVITE_DATA.people[id]={}), x=T[id]; for(const k in x) (p[k]||(p[k]={}))[pid]=x[k]; } })();
