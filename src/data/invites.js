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
    {id:'noodle',  zone:'noodle',       name:'阿鳳麵店',     verb:'去公館吃飯（阿鳳麵店）', kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat'},
    {id:'wenzhou', zone:'wenzhou',      name:'溫州街',       verb:'去溫州街散步',         kind:'walk',   minStage:'FRIEND',       stay:0.75, memory:'WALKED_TOGETHER', sitAct:'wait', rainTo:'cafe'},
    /* 溫州街的新店（DL-12；AA_164 2-1、2-3，AA-B 定）：days＝星期幾可以約（0＝週日）、hours＝那段時間裡（開始到結束都要在裡面）*/
    {id:'brunch',  zone:'wz_brunch',    name:'半熟',         verb:'去半熟吃早午餐',       kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat', days:[0,6], hours:[8,13]},
    {id:'teahouse',zone:'wz_teahouse',  name:'一盞',         verb:'去一盞喝茶',           kind:'reason', minStage:'FRIEND',       stay:1.25, memory:'TEAHOUSE_TEA',    sitAct:'sit', days:[0,3,4,5,6], hours:[12,19]}
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
    noContactAsk:'還沒有{pr}的聯絡方式。可以當面問{pr}。'
  },
  /* 兩個人單獨的邀約（BB_70 0-2：散步、吃飯）：任一方有伴侶時不約，改成一群人（AA_125 第 1 節）。Café、總圖是「有理由的」，照常 */
  soloKinds:['meal','walk'],
  soloPlaces:['teahouse'],   /* 一盞：kind 還是 reason（時段、熟度不變），但和散步、吃飯一樣「兩個人單獨」（AA_172 3b，回 BB_158 第 0 節）*/
  /* 保底的「交換聯絡方式」（AA_124 1-7）：對方的回應，每人一句（AA 的五位；BB 的人物 BB 寫，還沒有的用旁白，不替人物編台詞）*/
  exchange:{
    heroine_01:[{say:'「好。……我傳給你的第一則會是筆記。不要回貼圖。」'}],
    heroine_03:[{say:'「嗯。」'},{narr:'（她把手機推過來，畫面已經停在加好友那一頁。）'}],
    yu:[{say:'「欸你還不在我的群組裡？我拉你。三個。」'}],
    classmate_bohan:[{say:'「好。我只傳考古題。……還有時間表。」'}],
    classmate_xinci:[{say:'「好。我會傳讀書計畫表，你不用每一張都回。」'}],
    /* BB 的人物（BB_120 1-7b，第②級）：每一句都是她／他在手機上的習慣 */
    heroine_02:[{say:'「好。……上班時間我不回。下班一次回完。」'}],
    heroine_04:[{say:'「你還沒有我的？好。我傳東西不解釋。」'}],
    classmate_peishan:[{say:'「好。我睡前常常想到問題。……你可以不回。」'}],
    classmate_mingxuan:[{say:'「好啊。二四六晚上我在家教，九點以後回。哈哈」'}],
    npc_fangyt:[{say:'「好。上山的時候沒有訊號，下山會一次回。」'}],
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
  /* 邀約的個性（被邀約時；AA_70 第 2 節＋BB_121 的建議欄、BB_70 第 1～7 節，AA、BB 2026-10-14 互審同意，第②級）。只用四個地點；改天的時間由系統算（INV.nextFree）。
     acc[地點]：答應時她／他說的話（A＝認識、有點熟；R＝朋友以上；不分的直接給陣列）。first[地點]：第一次約那個地方（散步）時說的話。
     here[地點]：照作息她那時候本來就在那裡（不算邀約、不接改天，玩家直接去）。plan[地點]：她已經有計畫（作息的 busy／booked）時說的話，之後系統問改天的時間。
     rule(G, ctx, INV)：個人規則（可以把答應改成改天／婉拒、把忙改成「就在那裡」），回傳 {res, lines, alt} 或 null。ctx：{pid, P, day, h, wd, band, year, term, first, w8, dating, r}
     台詞：「…」＝她／他說的話、（…）＝旁白、{me:'「…」'}＝祐廷說的話；{zh}＝改天的時間（「九點十分」，不是今天的加「明天」或日期）、{明天？}＝改天是明天才說。
     walk[地點／any／rain]：一起走過去的路上說的一句（照目的地，對不上的放 any；下雨先用 rain）。一個元素是一句話的陣列（可以有旁白），或 {if:(G,ctx)=>…, l:[…]}；同一個人輪流換。
     表上只寫描述、沒有台詞的格子（例：「答應；她點最便宜的那杯」）照舊用系統的旁白；看電影、唱歌、法服值班、系籃這幾列等系統有那個地點再接。*/
  people:{
    /* ---------- AA 的六位（AA_70 第 2 節） ---------- */
    heroine_01:{ walk:{cafe:['「周老師今天那題，你是先想要件還是先想結論？……我都先想結論。我在改。」'],noodle:['「我手帳裡有一頁叫『想去但沒時間去的店』。公館有七家。」'],wenzhou:[{if:(G,c)=>c.year>=2,l:['「這條巷子我走過一百次。第一次看到那隻貓。」']}],any:['「宿舍門禁是十二點。我查過為什麼是十二點，沒有人說得出來。」']},   /* 以安：先講結論、要理由（2-1；BB_121 2-1）*/
      acc:{cafe:{A:['「可以。條件：我會帶東西來寫。」']},noodle:{A:['「……好。但我只吃一碗。」'],R:['「好。我要乾麵。」']}},   /* 認識約 Café、朋友約吃飯：AA 2026-10-14 改成她自己說的話（AA_70 2a0218d）*/
      here:{library:['「我本來就在總圖。二樓靠窗。」']},
      plan:{cafe:['「今天排滿了。……這個時間可以嗎？」'],noodle:(G,c)=>c.term&&c.term.id==='Y1S1'&&c.term.week<10?['「我跟 Alison 約了一起寫憲法作業。{明天？}」']:['「我跟 Alison 約了讀書會的事。{明天？}」']},   /* AA_238 5-7：公法讀書會大一上第 10 週才開始，以前是一起寫憲法作業 */
      rule:(G,c,I)=>{ if(c.pid!=='wenzhou'||c.r.res!=='accept') return null;   /* 大一：散步要有目的——她在手帳排一個「沒有目的」的時段（改天，但她真的排了）；大二以後「今天想」也是理由 */
        if(c.year<=1) return {res:'resched',why:'plan',lines:['「散步的目的是？」',{me:'「沒有目的。」'},'「……好。我在手帳排一個『沒有目的』的時段。」'],alt:I.nextFree(G,'heroine_01',c.P,c.day+1,10)};
        return {lines:['「好啊，剛好想走走。」']}; } },   /* AA_255 第 4 節第 7 點、AA_259 第 4 節第 7 點 */
    heroine_03:{ walk:{noodle:['「這條路我從國中走到現在。那家修鞋店的老闆，三十年沒換過招牌。」'],wenzhou:['「這間老屋以前是一個教授住的。阿姨說他每天來吃一碗乾麵，二十年。」'],any:[{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','SHARED_MEAL'),l:['「阿姨說你吃東西很像在考試。很認真，又很怕吃錯。」']}],rain:['（她撐傘，傘偏向你那一邊，自己的肩膀濕了一半。）','「……沒事。我習慣了。」']},   /* 語彤：週二、週四晚上在阿鳳麵店幫忙（作息 help），其他時間在總圖三樓（2-2；BB_121 2-2：系統沒有反邀、改地點，先當婉拒）*/
      acc:{noodle:{A:['「……我阿姨的店？」','「好。阿姨會多給你一顆滷蛋。」']}},
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='help') return c.pid==='noodle'?{res:'here',lines:['「我就在店裡。你來。」'],alt:null}:{res:'decline',why:'shop',lines:['「麵店。」','「你來店裡就好。」'],alt:null};
        if(r.res!=='accept') return null;
        if(c.pid==='cafe'&&c.band==='A') return {res:'decline',why:'pricey',lines:['「……那裡很貴。」','「總圖可以。」']};
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['「週六。我本來就在。」']}; return {res:'resched',why:'sat',lines:['「週六。我本來就在。」'],alt:I.nextSat(G,'heroine_03',c.P,c.day,15)}; }
        return null; } },
    zhe:{ walk:{any:[['「這家以前是賣雞排的。」'],['「那家的老闆會記得你點什麼，只要你去三次。」'],['「你知道公館哪家滷味十點後半價嗎？……我知道三家。」']]}, acc:{noodle:['「好啊！我餓了。」']} },   /* 阿哲（2-3；BB_121 2-3：揪人的那句等群體邀約）*/
    yu:{ acc:{library:['「總圖喔……好啊，可是我會一直想跟你講話。」']} },   /* Alison（2-4；大三以後「今天是我的晚上」等她那個晚上的作息）*/
    classmate_bohan:{   /* 柏翰：總圖秒答應；其他地方「我要念書」，改到念完的時間（2-5；BB_121 2-5）*/
      rule:(G,c,I)=>{ if(c.pid==='library'||c.r.res!=='accept'||c.h>=21+10/60) return null; const a=I.freeAt(G,'classmate_bohan',c.P,c.day,21+10/60)?{day:c.day,h:21+10/60}:I.nextFree(G,'classmate_bohan',c.P,c.day,21+10/60);
        return {res:'resched',why:'study',lines:[a?'「我要念書。……{zh}可以。」':'「我要念書。」'],alt:a}; } },
    classmate_xinci:{   /* 芯慈：吃飯要提前一天約（2-6；BB_121 2-6，她個人的規則）*/
      rule:(G,c,I)=>{ if(c.pid!=='noodle'||c.r.res!=='accept') return null; if(c.day>G.day) return {lines:['「我要先算時間。……好，可以。」']};
        return {res:'resched',why:'early',lines:['「我要先算時間。……好，可以。」'],alt:I.nextFree(G,'classmate_xinci',c.P,c.day+1,12+10/60)}; } },
    /* ---------- BB 的人物（BB_70 第 1～7 節） ---------- */
    heroine_02:{ walk:{noodle:[['「我每次經過那家影印店都會看一眼。我家也是影印店。台中的。」','「……我媽一張一塊，這家一張一塊半。」'],['（她看到騎樓下的電影海報。）','「這部不要看。……好啦你可以看，但不要跟我說你喜歡。」']],library:['「你們法律系的書好厚。我們的書很薄，但要讀三遍。」'],
        wenzhou:[{once:'ZR_FILM_ASK',l:['「我覺得這條巷子很適合拍電影。你覺得要拍什麼？……猜錯三次我就說我的答案。」'],ch:[{t:'愛情片。',r:['「太簡單了。」']},{t:'恐怖片。',r:['「晚上確實有一點。不是。」']},{t:'什麼都沒發生的片。',r:['「……你偷看我的筆記本？」']}],after:['「一個人每天走這條巷子去上班。什麼都沒發生。只是每天的光不一樣。」']}],   /* BB_70 Café → 溫州街（選項，見面前選）*/
        any:['「外文系的人都說英文很好，其實我們在比誰的字典比較舊。」']},   /* 芷若（1-4）：上班＝作息 barista */
      firstAt:{brunch:['（她點完餐，看了開放廚房很久。）','「……她做蛋的時候，跟我拉花一樣，不說話。」'],teahouse:['「我不懂茶。可是我喜歡等它的那三分鐘。」']}, acc:{brunch:{A:['「半熟？……那家的蛋煎得比我們店的好。不要跟老闆說。」'],R:['「好。我點和上次一樣的。……你不知道上次是什麼？那你猜。」']},teahouse:{R:['「一盞？好。那裡安靜，我可以不用說話。」']},cafe:{A:['「我放假不太想來上班的地方。……好啦。但我不幫忙收杯子。」'],R:['「去我們家。我坐客人那一邊，看起來會很奇怪。」']},noodle:{A:['「……好。但我只吃一點點。」'],R:['「阿鳳阿姨記得我。我也記得她。」']}},
      here:{cafe:(G,c)=>typeof STORY!=='undefined'&&STORY.zrNoShift&&STORY.zrNoShift(G,c.day)?['「我在 Café，今天是客人。你要來嗎？」']:['「我就在 Café 啊。你來，我做給你。」']},   /* AA_375 第 1 項：6/3 是她最後一個班，6/4～9/2 她在 Café 是客人（作息 characters.js；STORY.zrNoShift）*/
      plan:{library:['「我在上班。十點下班，總圖也十點關。……你自己加油。」'],wenzhou:['「我在上班。……下班以後，走一段？」']},
      rule:(G,c,I)=>{ const r=c.r;
        if(r.res==='resched'&&r.why==='busy'&&r.act==='barista'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_02',c.P,c.day,22.5); if(!a||a.day!==c.day) return null;
          return {lines:[c.dating?'「下班我請宵夜。{zh}。你可以多帶幾個人。」':'「下班我請你吃宵夜。{zh}。不要遲到。」'],alt:a}; }
        if(r.res!=='accept') return null;
        if(c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['「總圖太安靜了，我會想講話。」']};
        if(c.pid==='wenzhou'&&c.first){ if(c.wd===6) return {lines:['「週六。我本來就要去。」']}; return {res:'resched',why:'sat',lines:['「週六。我本來就要去。」'],alt:I.nextSat(G,'heroine_02',c.P,c.day,14)}; }
        return null; } },
    heroine_04:{ walk:{noodle:[['「你知道我們社團為什麼在萬才館旁邊嗎？因為法律系的人都太安靜，我們負責吵。」'],['「這家飲料店的珍珠是全公館最 Q 的。我做過統計。樣本數十二。」']],wenzhou:['「這裡的機車停得好亂。如果做成遊戲，玩家一定會一直撞到。……我要把它做進去。」'],library:['「你們法律系考試是寫申論對吧？我寫程式也是申論。」','「只是讀的人是電腦，它不會給我同情分。」'],any:[['（她看到一隻松鼠。）','「那隻松鼠在看我。……牠在看我的餅乾。」'],
        {if:G=>typeof SOCIAL!=='undefined'&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))&&!SOCIAL.has('heroine_04','TOLD_HER_CHANGE'),once:'ZQ_CHANGE_ASK',l:['「欸不是，阿凱說你念過經濟？那你為什麼換？」'],
         ch:[{t:'（說換方向的事）',mem:'TOLD_HER_CHANGE',r:[{me:'「念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。」'},'「……你換過？」',{me:'「嗯。」'},'「你家裡說什麼？」',{me:'「一開始不太懂。後來就懂了。」'},'（她走了好幾步沒說話。）','「……好。知道了。」']},
             {t:'下次再講。',r:['「好。那你欠我一次。」']}]}]},   /* BB_70 2-5（選項句：走到目的地、見面前；「下次再講」不記，Q10 第四個選項還有一次機會）*/   /* 子晴（2-4）：社團＝作息 club（週一、週三晚上）*/
      firstAt:{teahouse:['「地板是榻榻米。我要脫鞋？……我的襪子是貓的。不准看。」']}, acc:{teahouse:{R:['「一盞？那裡不能大聲對吧。……好，這是挑戰模式。」']},cafe:{A:['「Café？……好啊，我要點最甜的。」']},library:{R:['（她答應了，條件是「二樓靠窗，有插座的那一排」。）']}},
      first:{wenzhou:['「散步？散步是什麼？」','（你解釋了一下。）','「……好啦。但要有目的地。」']},
      rule:(G,c,I)=>{ const r=c.r;
        /* 大四（畢業，在臺北的工作室上班；BB_163 第 2 節）：平日 20:00 以前在工作室、總圖要辦校友證；其他照下面原本的規則 */
        if(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('heroine_04',{day:c.day}).kind==='taipei'&&(r.res==='accept'||r.why==='busy')){ const wk=c.wd>=1&&c.wd<=5, late=20+10/60;
          if(c.pid==='library') return {res:'decline',why:'grad',lines:['「欸不是，我畢業了。總圖要辦校友證，我還沒辦。……兩點半？」'],alt:null};
          if(c.pid==='teahouse'&&wk) return {res:'resched',why:'work',act:'work',lines:['「欸不是，平日下午我在工作室。……週六下午？這是問句。」'],alt:I.nextSat(G,'heroine_04',c.P,c.day,14)};   /* BB_163 第 2 節（BB-B 55509fe2）：平日（週三～週五下午）的一盞改到最近的週六下午 */
          const firstY4=c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='heroine_04'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&STORY.presence('heroine_04',{day:iv.day}).kind==='taipei');
          if(wk&&c.h<20&&['cafe','noodle','wenzhou'].includes(c.pid)){ const alt=I.freeAt(G,'heroine_04',c.P,c.day,late)?{day:c.day,h:late}:I.nextFree(G,'heroine_04',c.P,c.day,late);
            return {res:'resched',why:'work',act:'work',lines:c.pid==='cafe'?['「欸不是，我八點才下班。……八點十分，兩點半。」']:(firstY4?['「好。……阿鳳阿姨還記得我嗎？」']:null),alt}; }
          if(firstY4&&r.res==='accept') return {lines:['「好。……阿鳳阿姨還記得我嗎？」']}; }
        if(c.pid==='brunch'&&(r.res==='accept'||r.res==='resched')){ const Q=I.place('cafe'); let a=null; for(let d=c.day;d<=c.day+3&&!a;d++) for(let hh=14;hh<=17;hh+=0.5) if(Q&&I.freeAt(G,'heroine_04',Q,d,hh)){ a={day:d,h:hh,place:'cafe'}; break; }   /* BB_158 第 2 節：週末 14:00 才起床（AA_137 8-5），半熟一律婉拒；改天指向 Café（下午）*/
          return {res:a?'resched':'decline',why:'sleep',lines:['「週末早上我在睡覺。……下午的話，Café。」'],alt:a}; }
        if(r.res==='resched'&&r.why==='busy'&&r.act==='club'&&c.pid==='noodle'){ const a=I.nextFree(G,'heroine_04',c.P,c.day,21.5); if(!a||a.day!==c.day) return null; return {lines:['「社課完。{zh}。麵店。」'],alt:a}; }
        if(r.res==='accept'&&c.pid==='library'&&c.band==='A') return {res:'decline',why:'quiet',lines:['「總圖不能講話。我會死。」']};
        return null; } },
    heroine_05:{ partnerSay:{teahouse:['「一盞……那裡太安靜了。Café 可以，帶你的筆記。」']},   /* 有伴侶時約一盞（AA_172 3b）：系統說明之後她自己的一句 */
      walk:{library:['「萬才館的電梯很慢，走樓梯比較快。」','「總圖三樓靠窗的位子，九點以前就要去搶。」','「……我大一的時候，這兩件都沒人告訴我。」'],wenzhou:[{if:(G,c)=>c.postExam,l:['「這家早午餐的鬆餅很好吃。我一直知道。只是從來沒有時間進去。」']}],noodle:['「以前法服有個個案，就住在這附近。阿伯每次來都帶一袋橘子。」','「……我們不能收，他就放在桌上走掉。」'],any:['「我大一的時候以為四年很長。……我大一的時候也以為總圖的位子很好搶。」']},   /* 學姊（3-4）：平日 9–17 在總圖（作息 read，個人規則）；散步在 W8（ev_sis_collapse）以前婉拒、不給改天 */
      firstAt:{brunch:['「三分四十秒。老闆娘說的。……她每一顆都這樣計時？」'],teahouse:['「這裡不能讀書。……我很少去不能讀書的地方。」']}, acc:{brunch:{A:['「半熟。好。我九點就到，你不要遲到。」'],R:['「好。……這次我點鬆餅。」']},teahouse:{R:['「一盞。……好。那裡有一壺，我一直想再喝。」']},cafe:{A:['「好。帶你的筆記，我順便看。」'],R:['「今天不看筆記。」']},noodle:{A:['「好。阿鳳的菜我排過名次。一……」'],R:['「這次你點。我想知道你喜歡吃什麼。」']},wenzhou:['「散步。好。……溫州街我只有路過，沒有真的走過。」']},
      rule:(G,c,I)=>{ const r=c.r, lib=c.wd>=1&&c.wd<=5&&c.h>=9&&c.h<17;
        if(c.pid==='wenzhou'&&!c.postExam&&(r.res==='accept'||r.res==='resched')) return {res:'decline',why:'exam',lines:['「散步的話，等我考完。」','「週三晚上我在法圖。要讀書的話，可以一起。」'],alt:null};   /* 筆試（2026-02-02 17:00）以前婉拒散步（AA_284 1-3；原本綁作廢的 W8、到 11/30 連交往都拒）*/
        { const q=typeof SISG!=='undefined'&&SISG.inviteCap?SISG.inviteCap(G,c,I):null; if(q) return q; }   /* 筆試以前的邀約上限（AA_284 2-1：一週一次 → 兩週一次 → 第 14 週起婉拒；平日午餐不算；src/sis_grad3d.js）*/
        if(r.res!=='accept'||!lib) return null;
        if(c.pid==='library') return {res:'here',lines:['「我就在總圖。三樓。不要講話，傳訊息。」'],alt:null};
        if(c.pid==='cafe'||c.pid==='wenzhou') return {res:'resched',why:'busy',lines:[c.pid==='cafe'?'「五點以後好不好？我要先把這段寫完。」':'「五點以後。……散步，我試試看。」'],alt:I.nextFree(G,'heroine_05',c.P,c.day,17)};
        return null; } },
    kai:{ walk:{any:[{if:(G,c)=>c.year<=1,l:['「宿舍網路又斷了 你們有教這個嗎」']}],
        noodle:[{if:(G,c)=>c.year<=1,once:'KAI_SCOOTER_ASK',l:['「所以你們法律系的，路邊的機車擋住騎樓可以告嗎」'],ch:[{t:'不一定是告，可以請警察來看',r:['「所以告跟叫警察不一樣 好 我學到一件事」']},{t:'你想告誰',r:['「沒有 我只是想知道我有沒有這個能力」']},{t:'先讓我吃完',r:['「好 你吃 ……吃完了嗎」']}]}]},   /* BB_70 4-5（大一上；「先讓我吃完」＝去吃飯的路上）*/   /* 阿凱（4-4）：他的句子沒有標點 */
      acc:{brunch:['「十二點 好 那是我的早餐」'],teahouse:['「茶屋要脫鞋嗎 好 我襪子有洞」'],cafe:{A:['「那裡沒有插座給我嗎」']},noodle:['「好 我餓了」']},
      first:{wenzhou:['「散步要幹嘛」','（你說那裡有貓。）','「好」']},
      rule:(G,c,I)=>{ if(c.pid==='brunch'&&c.r.res==='accept'&&c.h<12){ const h2=12+10/60; return {res:'resched',why:'sleep',lines:['「早上 不行 我在睡」'],alt:I.freeAt(G,'kai',c.P,c.day,h2)?{day:c.day,h:h2}:null}; }   /* BB_158 第 6 節：半熟早上改 12:10 */
        if(c.pid!=='library'||c.r.res!=='accept') return null; const ex=!!(c.term&&[7,8,9,15,16].includes(c.term.week));   /* BB_172 K9（AA_209 第 4 節）*/   /* 朋友以上：考前一週、考試週答應 */
        if(c.band==='R'&&ex) return null; return {res:'decline',why:'sleepy',lines:['「總圖我會睡著」','「考前一週我會去 真的」']}; } },
    classmate_mingxuan:{ walk:{any:[['「我家教的學生問我，念法律是不是要背很多東西。」','「我說，要背，但更要會吵架。他說那他適合。」'],['「我爸昨天傳訊息問我『籃球的三分線是畫在哪裡』。」','「他在看我們比賽的直播。……他還是看不懂。」'],['「這條路我每週走三次。家教、宿舍、家教。……好啦，還有籃球場。」']]},   /* 明軒（5-4）：二、四、六晚上 19–21 家教（個人規則）；Café 的「只能待一小時」朋友以後不說（BB_120 1-6）*/
      acc:{brunch:['「早午餐？哈哈 CP 值不高喔……好啦 週末可以」'],teahouse:['「一盞？哈哈 我很少喝茶 我爸喝 好啊」'],cafe:{A:['「好。但我只能待一小時。」']},noodle:['「阿鳳是公館 CP 值第一名。我研究過。」'],wenzhou:['「散步不用錢，好。」']},
      rule:(G,c,I)=>{ const tut=[2,4,6].includes(c.wd)&&c.h+c.P.stay>19&&c.h<21; if(c.r.res!=='accept'||!tut) return null;
        if(c.pid==='cafe') return {res:'resched',why:'tutor',lines:['「九點以後」'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day,21)};
        if(c.pid==='library') return {res:'resched',why:'tutor',lines:['「七點家教，六點半前可以」'],alt:I.nextFree(G,'classmate_mingxuan',c.P,c.day+1,10)};
        if(c.pid==='noodle'){ const a=I.nextFree(G,'classmate_mingxuan',c.P,c.day,21.5); return {res:'resched',why:'tutor',lines:[a&&a.day===c.day?'「家教完，{zh}，便宜的那家」':'「九點以後」'],alt:a}; }
        return null; } },
    classmate_peishan:{ afterMeet:(G,iv,pid)=>pid==='library'&&typeof STORY!=='undefined'&&STORY.termAt&&STORY.termAt(iv.day)==='Y2S2'&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_p4b')?[G.flags.PS_P4B_GROUP?'（她遞過來一張便條：「今天念了 42 頁。你們呢？」）':'（她遞過來一張便條：「今天念了 42 頁。你呢？」）']:null,   /* P4b（BB_97 4-4）：大二下週末陪她在總圖念，每次一張便條（小組版寫「你們呢？」）*/
      walk:{any:[{once:'PS_LAW_ASK',l:['「如果一條法律大家都不遵守，它還是法律嗎？」'],
        ch:[{t:'還是法律，只是沒人守。',r:['「所以寫下來的那一刻就算數。」','「……那寫下來的人責任好大。」']},{t:'那它可能該改了。',r:['「所以大家不遵守，也是一種投票？」']},{t:'要看大家為什麼不守。',r:['「……對。不想守，和守不起，是兩件事。」']}],
        after:[{if:G=>typeof CALENDAR==='undefined'||!CALENDAR.TERMS||(T=>!T||CALENDAR.tOf(G.day)<T.t0)(CALENDAR.TERMS.find(t=>t.id==='Y1S2')),l:['「好。我要拿這題去問讀書會的人，看看他們怎麼說。」']},{l:['「好。我要拿這題去問課輔班的小孩，看看他們怎麼說。」']}]}]},
      firstAt:{brunch:['「她翻蛋的時候，手腕不動。我媽也是。……我還學不會。」'],teahouse:['「這裡好安靜。……我的問題，會不會太大聲？」']}, acc:{brunch:{A:['「早餐店的女兒，去吃別人的早午餐。……好，我去研究。」'],R:['「好。我想看他們的蛋怎麼翻。」']},teahouse:{R:['「一盞？好。我可以帶問題去嗎？很多個。」']},cafe:{A:['「好。但我會一直問你問題。」']},noodle:{A:['「我吃很慢。你不能催我。」']}}, first:{wenzhou:['「散步是最好的思考。……我在書上看到的。」']}, rule:(G,c,I)=>{ const r=c.r, ok=r.res==='accept'||r.res==='resched'||r.why==='away';
        if((c.pid==='brunch'||c.pid==='teahouse')&&c.term&&c.term.id==='Y2S2'&&ok) return {res:'decline',why:'exam',lines:['「我在念書。……考完再去。你先幫我記住菜單。」'],alt:null};
        const tp=typeof STORY!=='undefined'&&STORY.presence&&STORY.presence('classmate_peishan',{day:c.day}).kind==='taipei'; if(!tp||!(r.res==='accept'||r.why==='busy')) return null;   /* 你那個時間有約、店沒開、下雨：照系統的說法 */   /* BB_163：重考那一學期（大二下）、大三起在別的學校；人在臺北 */
        const wkend=c.wd===6||c.wd===0;
        if(c.term&&c.term.id==='Y2S2'){   /* 1-1：週末在總圖念書，平日在家念 */
          if(c.pid==='library') return wkend?{res:'accept',lines:['「好。我在老位子。……你坐著就好，不用說話。」']}:{res:'resched',why:'study',lines:['「平日我在家念，比較不會分心。……週末，總圖。」'],alt:I.nextSat(G,'classmate_peishan',c.P,c.day,10)};
          if(c.pid==='cafe') return {res:'decline',why:'study',lines:['「Café 我會想跟你聊天。……現在不行。週末來總圖，坐我旁邊。」'],alt:null};
          if(c.pid==='noodle') return {res:'decline',why:'study',lines:['「阿鳳阿姨的麵，考完我要吃兩碗。……現在我吃便當，十分鐘。」'],alt:null};
          if(c.pid==='wenzhou'){ if(G.flags&&G.flags.dating_classmate_peishan&&c.wd===0&&c.h>=14&&c.h<15) return {res:'here',lines:['「星期日下午本來就是你的。……不用約。」'],alt:null};
            return {res:'decline',why:'study',lines:['「散步會讓我想很多事。現在不能想太多。……考完，我們走遠一點。」'],alt:null}; }
          return null; }
        /* 1-2：大三起。週二三四 16～19 課輔班、週六 10～18／週日 13～18 書店 */
        const tutor=[2,3,4].includes(c.wd)&&c.h<19&&c.h+(c.P.stay||1)>16, shop=(c.wd===6&&c.h<18&&c.h+(c.P.stay||1)>10)||(c.wd===0&&c.h<18&&c.h+(c.P.stay||1)>13);
        const at=(h)=>I.freeAt(G,'classmate_peishan',c.P,c.day,h)?{day:c.day,h}:I.nextFree(G,'classmate_peishan',c.P,c.day,h);
        if(c.pid==='library') return {res:'decline',why:'school',lines:['「我現在進不去總圖了。……Café 好不好？我帶作業去改。」'],alt:null};
        if(c.pid==='cafe'){ if(shop) return {res:'resched',why:'work',act:'work',lines:['「書店六點打烊。……六點十分，兩點半。」'],alt:at(18+10/60)}; if(tutor) return {res:'resched',why:'work',act:'work',lines:['「七點下課。……七點半，我走過去。」'],alt:at(19.5)};
          return {res:'accept',lines:['「好。我帶作業去改，你念你的。」']}; }
        if(c.pid==='noodle'&&!(G.invites||[]).some(iv=>iv.who==='classmate_peishan'&&iv.place==='noodle'&&['done','accepted','going'].includes(iv.state)&&/^Y[34]/.test((CALENDAR.termOf(iv.day)||{id:''}).id))&&r.res==='accept') return {lines:['「好。阿鳳阿姨一定會問我現在念什麼。……我要講很久。」']};
        if(c.pid==='wenzhou'&&tutor) return {res:'resched',why:'work',act:'work',lines:['「課輔班下課，剛好在溫州街。……七點，門口等我。」'],alt:at(19)};
        return null; } },   /* rule：BB_158 第 4 節，大二下重考那一學期半熟、一盞都婉拒（SYS-21 起她那學期休學、presence 先回 away：照樣換成她自己的這一句）*/   /* 沛珊（6-4）*/
    kexin:{ acc:{brunch:{A:['「半熟？我從政大過來要四十分鐘。好，我十點到。」'],R:['「好啊，我先查一下菜單。」']},teahouse:{R:['「一盞。安靜的地方。……我可能一個小時都不講話喔。」']}},   /* BB_158 第 5 節（她在政大：時間照她的作息；2026-10-17 BB-C 改稿：不再每句「假設」）*/
      firstAt:{brunch:['「蛋可以選熟度欸。……我要半熟。」'],teahouse:['「我們學校後山也有茶園欸。」','「不過這邊的院子比較安靜。」']} },
    npc_fangyt:{ walk:{any:[['「椰林大道的大王椰子，一年會掉好幾次葉子。很重。所以不要站在樹下講太久的話。」'],['「這棵是樟樹。這棵是菩提。那棵……我不知道。我會去查。」'],{if:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_02','FIRST_MET'),l:['「芷若高中的時候……算了。你自己問她。」']}]}, acc:{brunch:['「好。早上我本來就起得早。」'],teahouse:['「好。安靜的地方，我比較會說話。」'],cafe:['「Café 的窗台有一盆植物快死了。我一直想去救它。好。」'],library:['「總圖前面的樟樹是我最喜歡的。我在樹下等你。」'],wenzhou:['「溫州街有一棵很老的榕樹。我帶你去。」']} }   /* 方奕廷（7-4）*/
  }
};
