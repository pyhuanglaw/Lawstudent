/* 假期活動（VAC；AA_199 第 3 節活動卡、7-2／7-4／7-5；任務 HOLIDAY-SYS／VAC-C08-12）——資料表。流程在 src/vac3d.js。
   **台詞照 AA 定稿照抄，這裡不改字、不自己寫**：大一暑假 AA_241（企劃線 claude/magical-albattani-bk7b4n）；出國 C08～C12 AA_242（18fe1b6a）。選項裡的（交申請書）（報名）是操作，不是台詞。
   每一張活動卡：
     id、title、cat（類別）、season（summer／winter）、
     year：只有某一年（例：C05 阿凱那一團＝Y1，之後是 C13 出國旅遊）；沒寫＝每個同季的假期都開（AA_199 7-5 第 1 點），日期用 days（月-日）照那一年換；
     days：起訖（'MM-DD'）、wd（每週固定的星期，0＝日）、slot（am／pm／eve／day／night）、place（{kind:'taipei'|'domestic'|'abroad', name}）、
     cost（{payer:'family'|'self'|'none'}）、free（期間能不能自由操作：yes／partial／no）、
     signup：怎麼報名（phone＝手機邀約、ask 的選項；until＝最後報名日 'MM-DD'）、
     keys：關鍵事件 [{day:'MM-DD', h, place, bg, lines:[…], choice}]（其他日子寫進日誌）；hall:true＝出國那一趟進 3D 出境大廳就演（E08，AA_478 第 2 節）；hallLines：進大廳演一次的幾句（T03，AA_478 第 3 節）、
     fly：登機以後的「飛往〇〇」字卡（檔尾，AA_478 第 1 節）、
     trip：連續好幾天人不在（整段當一趟出遊：出發 → 中間的關鍵事件 → 回來）、
     miss：沒參加的那一則（時間、誰、訊息）。
   第二批（C16～C18，AA_242 第 9～11 節 ede67b34）多的欄位：work（連續數週的平日上班：{h0,h1,travel,travelH}，每個平日一趟）、pay（實習津貼：{hourly,hours}，照去了的天數）、
     gate（報名的門檻：engScore＝要有英文檢定成績，narr＝沒有的那句旁白）、select.needI／pre[].setI（這一次報名自己的「寫了申請表」「去了面試」，不跨年份）、
     select.fam（錄取時家人群組換的句子）、select.reject（沒錄取的通知：sys 換的信、noGroup＝不傳阿哲那句）、blockPre（面試那天人在國外也不能報）、kx（交往中的可昕那一場）。
   AA_242 第 12 節（56a36a4d）多的欄位：work.diary（沒有關鍵事件的上班日一天一行）、work.diaryLastWeek（固定在最後一週第一個上班日的那一句）、work.lunch（上班日的午餐錢）、
     關鍵事件的 again（第二次參加時，第二次的日誌一句後面照演的）、select.noFail（那一學期有被當的科目＝沒錄取）、select.brief（錄取以後排的行前說明會）、signup.again（去過的人公告多的那個選項）。
   行的寫法同 termend_lines.js：字串＝說話的人；{narr:'（…）'}＝旁白；{who, text}＝別人說；choice＝[{t, say:[行…], set:{旗標}, rel:{id:{…}}}]。 */
const VAC_DATA=(function(){
  const Y=G=>G&&G.flags||{};
  /* 以安那一年真的有去（AA_369 M4）：C03 日語課只有大一、大二；C11 東京、C12 京都只有大二。年份照那一場的日子（暑假＝2025＋n 年、寒假的一月＝2025＋n 年）*/
  const AN_YR=(G,yks)=>{ const y=typeof CALENDAR!=='undefined'&&G?CALENDAR.dateOf(G.day).y:0; return yks.includes('Y'+(y-2025)); };
  /* VAC-C03 日語課的三場（AA_241 第 2 節）：日子照每年的週二、四（AA_369 M4）——第一堂、中間那一堂（第 ⌊n/2⌋＋1 堂）、最後一堂：2026＝7/7、7/16、7/23；2027＝7/8、7/15、7/22；2028＝7/11、7/18、7/20。
     以安只有大一、大二在（AN_C03）；其他年份拿掉她的句子，教室旁白換成「（教室裡都是不認識的人。）」，小考、最後一堂沒有句子＝不開畫面（vac3d.js S.hasLines）*/
  const AN_C03=G=>AN_YR(G,['Y1','Y2'])&&(typeof STORY!=='undefined'&&STORY.knows?STORY.knows('heroine_01',G):!!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_01','FIRST_MET')));   /* AA_313 第 4-1 節第 6 點：還不認識她（公告欄報名）的不聽到「你也來了。」，照其他年份的旁白 */
  const C03_KEYS=([d1,d2,d3])=>[
    {day:d1,h:19,title:'第一堂',bg:'classroom_small',lines:[G=>AN_C03(G)?[{narr:'（教室很小，十二個位子。以安坐在第一排正中間，筆記本已經畫好格子。）'},{who:'heroine_01',text:'你也來了。'},{who:'heroine_01',text:'老師說第一堂要自我介紹，用日文。'}]:{narr:'（教室裡都是不認識的人。）'}],
      choiceIf:AN_C03, choice:[{t:'「我只會說名字。」',say:[{who:'heroine_01',text:'我上學期在學校上過，自我介紹會。……後面就不行了。'}]},{t:'「妳準備好了？」',say:[{who:'heroine_01',text:'寫在筆記本上了。……不要看。'}]}]},
    {day:d2,h:19,title:'小考',bg:'classroom_small',lines:[G=>AN_C03(G)?[{who:'heroine_01',text:'九十二。片假名寫錯一個。'},{who:'heroine_01',text:'ツ跟シ。我每次都分不清楚。'}]:null],
      choiceIf:AN_C03, choice:[{t:'「那兩個真的很像。」',say:[{who:'heroine_01',text:'很像不是理由。'},{narr:'（她在筆記本上把兩個字各寫了十遍。）'}]},{t:'「我錯了五個。」',say:[{who:'heroine_01',text:'……那下課一起練。十分鐘。'}],rel:{heroine_01:{fam:2}}}]},
    {day:d3,h:19,title:'最後一堂',bg:'classroom_small',lines:[G=>AN_C03(G)?[{who:'heroine_01',text:'這禮拜六我回台中，8 號回來。'},{who:'heroine_01',text:'日文我會繼續背。'}]:null],
      choiceIf:AN_C03, choice:[{t:'「好，我也背。」',say:[{who:'heroine_01',text:'說好了。'}]},{t:'「回來要考我嗎？」',say:[{who:'heroine_01',text:'第三課的單字，你自己背。'}]}]} ];
  /* VAC-C04 的共用部分（第一堂 Kevin 那段分寒暑假；模擬考、累到不行、正式考試；AA_241 第 9、10 節、AA_264 第 2 節）*/
  const KV=t=>({who:'kevin',name:'Kevin',text:t});
  const C04_REP={ keys2:['補習班第一堂。櫃台的人說：「又來了喔。」','模擬考。聽力比上次多對了幾題。','單字本寫到第三本了。','考場是同一間學校。這次你知道廁所在哪裡。'],
                  keys3:['第一堂。你坐到上次同一個位子。','模擬考。閱讀的時間終於夠用了。','你背單字背到睡著，燈沒關。','考完，你在校門口吃了一個飯糰。'] };
  const C04_SIGNUP=(term,flag)=>({kind:'board', term, week:12, wd:1, h:12, flag, famMsgs:['補習費轉過去了。','上課不要坐最後一排。'], famReply:{t:'收到，謝謝。',say:['👍']}});
  const C04_REMIND={key:3,before:7,h:21,who:'kevin',name:'Kevin',msgs:['考前一週了','不要熬夜 前一天背的單字都會忘','考完請我喝飲料'],opts:[{t:'好，考完請學長。',say:['說好了喔']},{t:'學長也是熬夜背的吧。',say:['所以我知道會忘']}]};   /* 9-3：考試日前七天 21:00 */
  const C04_KEYS=(season,[d0,dm,dt,de])=>[
    season==='winter'
      ?{day:d0,h:19,title:'第一堂',bg:'cram_class',lines:[{narr:'（發講義的助教抬起頭，是 Kevin。）'},KV('欸，學弟？你也來這裡補？'),KV('坐前面，後面聽不清楚。講義多給你一份，上一期的。')],
        choice:[{t:'「學長在這裡打工？」',say:[KV('寒假班的助教。時薪還可以，順便練聽力。')]},{t:'「謝謝學長。」',say:[KV('不用謝。不要跟老師說我多給的。')]}], set:{KEVIN_TA_MET:true}}
      :{day:d0,h:19,title:'第一堂',bg:'cram_class',lines:[{narr:'（發講義的助教是 Kevin。他看到你，把講義往你桌上一放。）'},Object.assign(KV(''),{text:G=>G.flags.KEVIN_TA_MET?'暑假也來？坐前面，冷氣比較不吵。這期老師講比較快，跟不上就問我。':'欸，學弟？你也來這裡補？這期老師講比較快，跟不上就問我。'})],   /* 暑假版只給寒假見過他的（KEVIN_TA_MET），暑假才第一次來的用另一句（8c76052b）*/
        choice:[{t:'「學長暑假也在？」',say:[KV('暑假班人多，老闆說我不能請假。')]},{t:'「謝謝學長。」',say:[KV('下課教室我還要掃，你們走慢一點沒關係。')]}], set:{KEVIN_TA_MET:true}},
    {day:dm,h:19,title:'模擬考',bg:'cram_class',lines:[{narr:'第一次模擬考。聽力的速度比你想的快很多。'}]},
    {day:dt,h:19,title:'累到不行的一天',bg:null,lines:[G=>({narr:typeof HOME!=='undefined'&&HOME.rec&&HOME.rec(G).at?'回到家，單字本攤在胸口就睡著了。':'補完習回宿舍，單字本攤在胸口就睡著了。'})]},   /* 住家裡的玩家換一句 */
    {day:de,h:9,title:'正式考試',bg:null,place:'考場（別的學校）',travel:'捷運約 30 分鐘',travelH:0.5,lines:[{narr:'考場在別的學校。你提早半小時到，還是找了一下教室。'}]} ];
  /* ===== 第二批（AA_199 7-7 7915ac9d；台詞 AA_242 第 9～11 節 ede67b34 照抄；AA-C 10-21 12:10；任務 VAC-C16-C18-1021）：C16 法扶實習、C17 律所暑期實習、C18 海外見習團 =====
     單位、團名、事務所、新 NPC（韓律師、馮律師、團長姚思穎、同期的實習生、面試的律師、帶隊老師、當地學生）全部虛構，不做 3D、不取名的照稿寫職稱；不寫真實案件、不給法律意見（台詞只寫看得到的）。
     C16、C17 是「連續數週、平日白天」（AA_199 3-4、7-7「平日白天不行，晚上、週末可以」）：work＝每個平日 h0～h1 是一趟上班（OUT 出遊，src/vac3d.js S.workDay），
       關鍵事件在它那一天的那個時間演；其他平日一天一行日誌（work.diary，AA_242 12-2：照順序用、用完以後只有日期卡；C17 第 12 句 diaryLastWeek 固定在最後一週的第一個上班日）；晚上、週末照常。
     AA_242 第 12 節（AA-C 2026-10-21 56a36a4d，回 LAWWW-C 13:29 的七項＋補字 a～e）：12-1 的裁定寫在各張卡；第二次以後的日誌（12-3）＝rep.keys2／keys3；阿哲寒假版（12-4）在 src/vac3d.js；
       C18 行前說明會（12-5）＝select.brief；思穎回國後的訊息（12-6）＝follow。
     日子照 7-7 的模板換算（16 週制，暑假從第 16 週後的週一算第 1 週）：C16＝暑假第 2 週起兩週（週一～五）、C17＝暑假第 2 週起 8 週、C18 暑假團＝暑假第 6 週起 9 天、寒假團＝寒假第 2 週起 7 天。
     關鍵事件的日子 AA 只寫到「第一週週四」「第二週」「第四週」：LAWWW 暫排——C16 第一天（週一 9:00）、陪同晤談（第一週週四 14:00）、整理卷宗（第二週週二 15:00）、最後一天（第二週週五 17:00）；
       C17 第一天（週一 9:00）、第一次被改（第一週週五 17:00）、跟開庭（第四週週三 11:00）、最後一天（第八週週五 17:00）；C18 參訪法院（第二天 10:00）、座談（第四天 14:00）、最後一晚（回來前一天 20:00）。 */
  const HAN=t=>({who:'npc_lawyer_han',name:'韓律師',text:t}), FENG=t=>({who:'npc_lawyer_feng',name:'馮律師',text:t}), SY=t=>({who:'npc_siying',name:'思穎',text:t});
  const LAW=t=>({who:'npc_firm_lawyer',name:'律師',text:t}), SGT=t=>({who:'npc_sg_teacher',name:'帶隊老師',text:t});
  const YT_KNOWN=G=>typeof STORY!=='undefined'&&STORY.knows?STORY.knows('heroine_03',G):!!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has('heroine_03','FIRST_MET'));   /* 「你認識的名字」：認識語彤才有她那幾句 */
  /* C16 四場（AA_242 9-3～9-6）；yt＝語彤那年也報了（9-3、9-6「語彤也報了／也在的」；AA_242 12-1 第 1 點：大三暑假）。
     again：第二次參加（大二去過、大三再來）的那一天，第二次的日誌一句（rep.keys2）後面照演的（12-1 第 1 點：語彤那兩段照演，只換第一句「……你又來了。」；9-6「我明年還要來。」照舊）*/
  const C16_KEYS=([d1,d2,d3,d4],yt)=>{ const YT=G=>!!yt&&YT_KNOWN(G); return [
    {day:d1,h:9,title:'第一天',bg:'legal_aid_office',lines:[{narr:'（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）'},HAN('先簽這個。保密約定。'),HAN('在這裡聽到的事，就留在這裡。')],
      choice:[{t:'「好。」',say:[HAN('卷宗在那邊，從最上面那疊開始。')]},{t:'「連家人也不能講？」',say:[HAN('不能。你可以跟他們說，今天很累。')]}],
      after:[G=>YT(G)?[{narr:'（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）'},{who:'heroine_03',text:'……你也來了。'}]:null],
      again:[G=>YT(G)?[{narr:'（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）'},{who:'heroine_03',text:'……你又來了。'}]:null]},
    {day:d2,h:14,title:'陪同晤談',bg:'legal_aid_office',lines:[{narr:'（會議室很小。當事人是一位中年的女士，手上一直捏著一張收據。）'},{narr:'（韓律師問，你記。她講到一半停下來，看了你一眼。）'},HAN('他是實習生，在做筆記。妳慢慢講。'),
      {narr:'（你把她說的每一個日期都寫下來。走出會議室，筆記寫了四頁。）'},HAN('日期寫得很好。她講到一半停下來的時候，你不用抬頭。')]},   /* 沒有選項（9-4）*/
    {day:d3,h:15,title:'整理卷宗',bg:'legal_aid_office',lines:[{narr:'（影印機第三次卡紙。同期的實習生把手伸進去，拉出一張皺掉的紙。）'},{who:'npc_intern',name:'實習生',text:'這台每年都這樣吧。'},
      {narr:'（韓律師經過，拿走你整理好的那疊，翻了兩頁，放回來，沒有說話。）'},{narr:'（隔天早上，那疊最上面貼了一張便利貼：「OK」。）'}]},
    {day:d4,h:17,title:'最後一天',bg:'legal_aid_office',lines:[HAN('兩個禮拜，你最常看到的是什麼？')],
      choice:[{t:'「收據。」',say:[HAN('對。大家都把收據留得很好。……常常留錯張。')]},{t:'「不太確定。」',say:[HAN('那就明年再來看一次。')]}],
      after:[{narr:'（她把你的筆記還給你，旁邊有幾行她用鉛筆補的字。）'},G=>YT(G)?[{narr:'（走出大樓，語彤停下來。）'},{who:'heroine_03',text:'我明年還要來。'}]:null],
      again:[G=>YT(G)?[{narr:'（走出大樓，語彤停下來。）'},{who:'heroine_03',text:'我明年還要來。'}]:null],
      set:{INTERN_LEGALAID:true}} ]; };   /* INTERN_LEGALAID：BB_202 職涯傾向 A＋5 只記錄（STORY.careerLean 讀 C16 去過的次數）*/
  /* C17 四場（AA_242 10-3～10-6）；面試 10-2 在 pre */
  const C17_KEYS=([d1,d2,d3,d4])=>[
    {day:d1,h:9,title:'第一天',bg:'law_firm_office',lines:[{narr:'（一張門禁卡、一個靠走道的位子、一台筆電，還有一份資料夾：研究備忘錄，週五交。）'},FENG('題目不難，你先查。'),FENG('查不到的地方寫「查不到」，不要猜。')]},
    {day:d2,h:17,title:'第一次被改',bg:'law_firm_office',lines:[{narr:'（備忘錄發回來，紅字比黑字多。第一頁最上面寫著：「結論放第一段。」）'}],
      choice:[{t:'「好，我重寫。」',say:[FENG('週一給我。')]},{t:'「每一頁都要改嗎？」',say:[FENG('第三頁不用。第三頁是對的。')]}]},
    {day:d3,h:11,title:'跟開庭',place:'法院（旁聽席）',bg:'court_gallery',lines:[{narr:'（旁聽席第二排。馮律師在前面講話，比在辦公室慢很多。）'},{narr:'（散庭以後，電梯裡。）'},FENG('剛剛法官問到一半，停了五秒。你有注意到嗎？')],
      choice:[{t:'「有。你那時候沒講話。」',say:[FENG('對。那五秒不要講話。')]},{t:'「沒有。」',say:[FENG('下次看一下。')]}]},   /* 法庭裡講了什麼不寫（10-5）*/
    {day:d4,h:17,title:'最後一天',bg:'law_firm_office',lines:[FENG('後來那幾份備忘錄，結論都放第一段了。'),FENG('明年想再來，直接寄信給我。')],set:{INTERN_FIRM:true}} ];
  /* C18：公告（11-1，暑假團、寒假團同一則）、面試（11-2）、三場（11-3～11-5）。「團長姚思穎〔地理系大三，新 NPC〕」的〔〕是稿上的註，不是旁白 */
  const C18_MSG=[{from:'sysoffice',name:'系辦',text:'【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。'}];
  const C18_INT=(term,week)=>({term,week,wd:3,h:19,title:'面試',place:'霖澤館的研討室',bg:'classroom_small',setI:'INT',lines:[SGT('英文不用很好。去了敢問就好。'),SGT('你會問嗎？')],
    choice:[{t:'「會。」',say:[SGT('好。到時候我會看。')]},{t:'「我會試試看。」',say:[SGT('試試看也可以。')]}]});   /* 面試的日子 AA 沒寫：LAWWW 暫排截止後一週的週三 19:00（同 C09 的面試）*/
  const C18_TRIP=(d0,d1)=>({ start:{day:d0,h:8}, end:{day:d1,h:18}, placeName:'新加坡', home:'auto' });
  const C18_KEYS=([d2,d4,dl])=>[
    {day:d2,h:10,title:'參訪法院',bg:'intl_sg_court',lines:[{narr:'（法庭比你想的小。法官、律師都講英文，講得很快。）'},{narr:'（團長姚思穎在你旁邊小聲翻了兩句，後來也跟不上了。）'},SY('……我只聽懂 adjourned。')],
      choice:[{t:'「休庭。」',say:[SY('對，休庭。我就聽懂這個。')]},{t:'「我也是。」',say:[{narr:'（出來以後，兩個人坐在法院外面的長椅上，把剛剛記下來的單字對了一遍。）'}]}]},
    {day:d4,h:14,title:'座談',bg:'intl_sg_campus',lines:[{narr:'（當地法律系的學生問你們：上課要不要點名？）'}],
      choice:[{t:'「要，而且要坐前面。」',say:[{narr:'（對面三個人一起笑了。）'}]},{t:'「看老師。」',say:[{who:'npc_sg_student',name:'當地學生',text:'我們也是。'}]}]},
    {day:dl,h:20,title:'最後一晚',bg:'intl_sg_hawker',lines:[{narr:'（旅館樓下的小吃中心，桌上一堆盤子。）'},SY('回去以後，報告誰寫？')],
      choice:[{t:'「我寫法院那一段。」',say:[SY('好。那我寫吃的。')]},{t:'「抽籤。」',say:[{narr:'（抽到你。）'}]}], set:{STUDYTOUR_SG:true}} ];
  /* 第二次以後（AA_242 12-3，AA_264 的表；暑假團、寒假團合計第幾次）：三場各一句日誌。思穎第二次以後不在團裡（她只在第一次的那一團）*/
  const C18_REP={ keys2:['（法院裡還是講得很快。這次你多聽懂了幾個字。）','（當地學生又問要不要點名。這次你先問他們。）','（小吃中心。報告這次你先說要寫法院那段。）'],
                  keys3:['（旁聽席，你坐到第一排。）','（座談。對面有一個人，你上次就見過。）','（小吃中心。你點菜的時候，團員說你很熟。）'] };
  /* 行前說明會（AA_242 12-5；暑假團第 15 週週三 12:20、寒假團第 14 週週三 12:20＝select.briefAt；系館的小教室，2D）：錄取的時候排（src/vac3d.js）。
     first＝第一次參加多的三行（思穎在這裡第一次出現）；第二次以後只有前三行。沒有選項。沒去：照樣出發（行程表在錄取通知裡，不扣東西）*/
  const C18_BRIEF={ title:'行前說明會', place:'系館的小教室', bg:'classroom_small',
    lines:[{narr:'（系館的小教室。桌上一疊行程表，第一頁是新加坡的地圖。）'},SGT('護照、轉接頭、一件薄外套。法院裡冷氣很強。'),SGT('每個人選一天寫紀錄。不用寫得很好，寫你看到的。')],
    first:[{narr:'（坐你旁邊的人把名牌轉過來給你看：姚思穎，地理系。）'},SY('我是團長。'),SY('……其實是因為沒人要當。')] };
  /* 思穎回國後的訊息（AA_242 12-6；第一次參加的那一團才有）：回國一週後 20:00；不回也可以，不計數值，只有這一則 */
  const C18_FOLLOW=[{dayFn:I=>I.to+7,h:20,who:'npc_siying',name:'思穎',msgs:G=>['報告我那段寫完了。三頁，都是吃的。'],
    opts:[{t:'我的也寫完了。',say:['好。那我交出去了。']},{t:'還沒。',say:['禮拜五以前喔。團長會催你。','……我就是團長。']}]}];
  const A={
    /* VAC-C02 法律生活營隊輔（系學會高中生營隊，虛構名稱）：AA_241 第 1 節。每年 7/1～7/5（大二起可以當小隊長，台詞下一批）*/
    C02:{ id:'C02', title:'法律生活營隊輔', cat:'社團志工', season:'summer', years:['Y1','Y2','Y3'], days:['07-01','07-05'],
      /* 每年重開（AA_264 77c7f3db）：第二次＝小隊長（第一天三句、CAMP_LEADER，其他天日誌）；第三次以後＝日誌；大二以後才第一次參加＝換人版（芯慈、沛珊不在）*/
      rep:{ prep2:'籌備會。流程表上的紅色比去年少一點。', prep3:'籌備會。你幫學弟妹把流程表的顏色重新分了一次。',
        keys2:['報到。有個學員說他哥哥去年也來過，在你那一組。','晚會。這次換你站在旁邊數人頭。','最後一天。卡片比去年多兩張。'],
        keys3:['報到。你知道充電線要多帶三條。','晚會。學員問法律系難不難，你這次回答得比較快。','最後一天。你把卡片收進放去年那疊卡片的信封。'],
        leader:{lines:[{narr:'（報到處。你的名牌這次多了一行字：「小隊長」。）'},{who:'npc_jr',name:'隊輔學弟',text:'學長，第二天下午的案例討論，你去年帶過對不對？'},{who:'npc_jr',name:'隊輔學弟',text:'可以教我怎麼帶嗎？'}],
          choice:[{t:'「先讓他們吵。」',say:[{who:'npc_jr',name:'隊輔學弟',text:'吵完呢？'},{narr:'（你說吵完再問他們為什麼吵。他寫在手背上。）'}]},{t:'「第一場我帶，你在旁邊看。」',say:[{who:'npc_jr',name:'隊輔學弟',text:'好。'},{narr:'（那天下午，他一直站在你後面。）'}]}],set:{CAMP_LEADER:true}},
        late:{prep:'籌備會。流程表貼在白板上，紅色的格子比你想的多。', day1:'報到。有個學員拖著兩個行李箱，你幫她搬上樓。',
          eveOpt2:[{who:'npc_camper',name:'學員',text:'……學長你也還在想喔？'},{who:'player',text:'對。'},{who:'npc_camper',name:'學員',text:'那我比較不怕了。'}],
          last:[{narr:'（學員寫卡片給隊輔。你那一疊最上面那張寫著：「謝謝學長第二天下午沒有放棄我們這組。」）'}],
          miss:{th:'g:law_class',from:'sysclub',name:'系學會',text:'📷（營隊的大合照）'}},
        recruit2:{from:'sysclub',name:'系學會',text:'去年當過隊輔的，可以直接報小隊長。'} }, slot:'night', place:{kind:'taipei',name:'校內'}, cost:{payer:'none'}, free:'partial',
      signup:{kind:'group', th:'g:law_class', term:'S2', week:12, wd:1, h:21, until:{term:'S2',week:13,wd:0}, flag:'CAMP_Y1_STAFF',
        msgs:[{from:'sysclub',name:'系學會',text:'【法律生活營 隊輔招募】7/1～7/5，高中生營隊，五天四夜，在校內。籌備會第 13～15 週週三晚上。有興趣的填表單。'},{from:'classmate_xinci',text:'我報了'},{from:'classmate_xinci',text:'有人要一起嗎'},{from:'classmate_peishan',text:'我也報了'}],
        yes:{t:'我也報。',say:[{from:'classmate_xinci',text:'好，我記下來'}]} },
      prep:{ term:'S2', week:14, wd:3, h:19, place:'萬才館研討室', bg:'classroom_small', who:'classmate_xinci',
        lines:[{narr:'（研討室的白板上貼了一張流程表。五天，每一格一個顏色。）'},{who:'classmate_xinci',text:'綠色是課程，橘色是活動，灰色是吃飯和睡覺。'},{who:'classmate_peishan',text:'紅色呢？'},{who:'classmate_xinci',text:'可能會出事的時間。'},{who:'classmate_peishan',text:'……為什麼有這麼多紅色。'},{who:'classmate_xinci',text:'因為是高中生。'}],
        choice:[{t:'「我負責哪一格？」',say:[{who:'classmate_xinci',text:'第二天下午，案例討論。你帶一組。'}]},
                {t:'「紅色那幾格我可以幫忙。」',say:[{who:'classmate_xinci',text:'好。'},{narr:'（她把你的名字寫進紅色那一格。）'},{who:'classmate_xinci',text:'寫上去了，不能改。'}],rel:{classmate_xinci:{trust:2}}}] },
      trip:{ start:{day:'07-01',h:8.5}, end:{day:'07-05',h:17}, placeName:'營隊（校內）', home:'dorm' },
      keys:[
        {day:'07-01',h:9,title:'第一天：報到',bg:'camp_school',lines:[{narr:'（報到處排了一整排高中生。有人拖著行李箱，有人只背一個書包。）'},{who:'classmate_peishan',text:'那個女生從進來到現在都沒講話。'},{who:'classmate_peishan',text:'……我去跟她說一下哪裡可以充電。'},{narr:'（她走過去，蹲在那個女生的行李箱旁邊。）'}]},
        {day:'07-03',h:20,title:'晚會',bg:'camp_school',lines:[{narr:'（小隊表演完，學員圍在操場邊吃點心。你那一組的一個男生走過來。）'},{who:'npc_camper',name:'學員',text:'學長，法律系很難嗎？'}],
          choice:[{t:'「很難，可是很好玩。」',say:[{who:'npc_camper',name:'學員',text:'好玩在哪？'},{narr:'（你想了一下。）'},{who:'npc_camper',name:'學員',text:'學長你想太久了。'},{narr:'（他笑著跑回去。）'}]},
                  {t:'「我也還在想。」',say:[{who:'npc_camper',name:'學員',text:'……學長你大一喔？'},{who:'player',text:'對。'},{who:'npc_camper',name:'學員',text:'那我比較不怕了。'}]}]},
        {day:'07-05',h:15,title:'最後一天',bg:'camp_school',lines:[{narr:'（學員寫卡片給隊輔。你那一疊最上面那張寫著：「謝謝學長第二天下午沒有放棄我們這組。」）'},{who:'classmate_xinci',text:'（把流程表從白板上撕下來，摺好）紅色的那幾格，最後都沒出事。'},{who:'classmate_xinci',text:'下次可以少塗一點。'},
          {who:'classmate_peishan',text:G=>Y(G).PS_ODD_Q_Y1S2?'欸，問你一件事。':'問你一件事。'},{who:'classmate_peishan',text:'你覺得他們五天以後，會記得什麼？'}],   /* 沛珊「我可以問一個奇怪的問題嗎」大一下的額度用過＝「欸，問你一件事。」（AA_188 2-6）*/
          choice:[{t:'「記得認識了誰。」',say:[{who:'classmate_peishan',text:'……嗯。我也是這樣覺得。'}],set:{PS_CAMP_REMEMBER:true}},
                  {t:'「記得案例討論那組吵贏了。」',say:[{who:'classmate_peishan',text:'（笑）那一組真的很想贏。'}]}]} ],
      miss:{day:'07-05',h:21,who:'classmate_xinci',min:'ACQUAINTANCE',msgs:['營隊結束了','📷（操場上一排高中生和隊輔，比著不同的手勢）','少一個人排班。下次來喔']} },
    /* VAC-C03 日語課（以安也在上）：AA_241 第 2 節。7/7～7/23 週二、四 19:00～21:00，公館的語言中心（虛構）；三個關鍵事件，其他堂寫進日誌 */
    C03:{ id:'C03', title:'日語課（暑期密集班）', cat:'學習考試', season:'summer', years:['Y1','Y2','Y3'], days:['07-07','07-23'],
      rep:{ keys2:['第一堂。老師記得你，說你去年的作業字很工整。','小考。助詞還是錯在同一個地方。','最後一堂。老師發了一張中級班的報名表。'], keys3:['第一堂。這次你坐第一排。','小考。你比隔壁的人先寫完。','最後一堂。老師問你要不要去考日檢。'] },   /* 大二起沒有以安的私訊：行事曆報名（AA_264 第 3 節）*/ wd:[2,4], slot:'eve', place:{kind:'taipei',name:'公館的語言中心'}, cost:{payer:'family'}, free:'yes',
      signup:{kind:'dm', who:'heroine_01', min:'FAMILIAR', day:'06-20', h:21, until:'06-26', flag:'VAC_C03',
        msgs:['我暑假要上日語課，公館那間，週二四晚上','三個禮拜，在我回台中以前上完','你如果也想學，報名到這個禮拜五'], yes:{t:'我也報。',say:[]}, board:true },   /* 不熟的玩家：公館語言中心的公告欄（行事曆）照樣報得到 */
      keys:C03_KEYS(['07-07','07-16','07-23']),
      byYear:{ Y2:{ keys:C03_KEYS(['07-08','07-15','07-22']) }, Y3:{ keys:C03_KEYS(['07-11','07-18','07-20']) } } },   /* AA_369 M4：日子照每年的週二、四 */
    /* VAC-C04 托福／多益補習＋考試（AA_199 7-2；台詞 AA_241 第 9、10 節、AA_264 第 2 節）：公館二樓的英語補習班（BB_176 2-5 那塊招牌），每週一、三晚上；
       助教是 Kevin（BB-C 定不新增補習班同學 NPC）。日子：大一暑假 7/6～8/12、考試 8/22（六）；大二寒假考 2027-01-23（六）、大二暑假 2027-08-28（六）、大三寒假多益 2028-01-16（日）。
       之後各假期的上課日 LAWWW 照「放假後第一個週一～考前那週的週三」排。寒假是另一張卡 C04W（series 同一系列，第二次以後的日誌照 AA_264 算在一起）。
       報名：手機假期行事曆（board）；當晚 21:00 家人群組媽媽兩則。關鍵事件：第一堂（第一次＝Kevin 那段，之後日誌）、模擬考、累到不行的一天、正式考試（別的學校）；考完 10 天後系統字「成績出來了。」 */
    C04:{ id:'C04', series:'C04', title:'托福補習（暑期班）', cat:'學習考試', season:'summer', years:['Y1','Y2'], days:['07-06','08-12'], wd:[1,3], slot:'eve', place:{kind:'taipei',name:'公館的英語補習班'}, cost:{payer:'family'}, free:'yes',
      signup:C04_SIGNUP('S2','VAC_C04'), rep:C04_REP, keys:C04_KEYS('summer',['07-06','07-22','08-03','08-22']),
      byYear:{ Y2:{ days:['07-12','08-18'], keys:C04_KEYS('summer',['07-12','07-28','08-09','08-28']) } },
      remind:C04_REMIND, score:{days:10,h:21,test:'toefl',name:'托福'} },
    C04W:{ id:'C04W', series:'C04', title:'托福補習（寒假班）', cat:'學習考試', season:'winter', years:['Y2','Y3'], days:['12-28','01-20'], wd:[1,3], slot:'eve', place:{kind:'taipei',name:'公館的英語補習班'}, cost:{payer:'family'}, free:'yes',
      signup:C04_SIGNUP('S1','VAC_C04W'), rep:C04_REP, keys:C04_KEYS('winter',['12-28','01-06','01-11','01-23']),
      byYear:{ Y3:{ title:'多益補習（寒假班）', days:['12-27','01-12'], keys:C04_KEYS('winter',['12-27','01-05','01-10','01-16']), score:{days:10,h:21,test:'toeic',name:'多益'} } },   /* 大三寒假考多益（Alison 也考這一天）*/
      remind:C04_REMIND, score:{days:10,h:21,test:'toefl',name:'托福'} },
    /* VAC-C05 日本五天（阿凱那一團）：AA_241 第 3 節。只有大一暑假（之後是 C13 出國旅遊）；機票家裡出、當地自己出 */
    C05:{ id:'C05', title:'日本五天（阿凱那一團）', cat:'海外交流', season:'summer', year:'Y1', days:['08-24','08-28'], slot:'night', place:{kind:'abroad',name:'日本',tz:1}, cost:{payer:'family',local:'self'}, free:'partial',
      mates:['kai'],   /* 同行的人（AA_369 H4）：出國期間的訊息、回國重逢、回來的招呼不算他 */
      signup:{kind:'dm', who:'kai', day:'07-15', h:21, until:'07-19', flag:'VAC_C05',
        msgs:['8/24 要不要去日本','我跟兩個同學 去秋葉原','機票我看過了 現在買還好'],
        yes:{t:'去。',say:[{from:'kai',text:'好 我拉你進群'}],family:'機票多少？我轉給你。'},
        later:{t:'我問一下家裡。',say:[{from:'kai',text:'好 這禮拜內跟我說'}]},
        no:{t:'這次不行。',say:[{from:'kai',text:'OK 我帶伴手禮'}]} },
      trip:{ start:{day:'08-24',h:6}, end:{day:'08-28',h:18}, placeName:'日本', travel:'機場', home:'auto' },
      keys:[
        {day:'08-24',h:6,title:'出發',bg:null,hall:true,lines:[{narr:'（早上六點的機場。阿凱的背包比行李箱還大。）'},{who:'kai',text:'裡面是空的。回來會滿。'}]},   /* hall：進 3D 出境大廳就演（AA_478 第 2 節）*/
        {day:'08-25',h:14,title:'秋葉原',bg:'jp_street_night',lines:[{narr:'（二手遊戲店的樓梯很窄。一層一層往上，每一層賣的東西都比下面那層舊。）'},{who:'kai',text:'（在玻璃櫃前面停下來）這台。'},{who:'kai',text:'我國小的時候想要。我媽說考第一名才買。'},{who:'kai',text:'我沒考第一名。'}],
          choice:[{t:'「現在買給自己。」',say:[{who:'kai',text:'……對。'},{narr:'（他把店員叫過來。）'}]},{t:'「多少錢？」',say:[{who:'kai',text:'（看了一下標籤）……我再想一下。走到下一層再決定。'},{narr:'（走到下一層，他又走回來了。）'}]}],
          after:[{narr:'（之後他的背包裡多了一個盒子。）'}]},
        {day:'08-26',h:12,title:'中間一天',bg:null,lines:[{narr:'（便利商店的飯糰有二十幾種。阿凱每一種都拍了照。）'},{who:'kai',text:'回去給我室友看。'},{who:'kai',text:'……喔，你就是我室友。'}]},
        {day:'08-27',h:20,title:'最後一晚',bg:'jp_street_night',lines:[{who:'kai',text:'下次換你排行程。我排的都是店。'}],
          choice:[{t:'「好，我排。」',say:[{who:'kai',text:'不要排博物館。'}]},{t:'「下次叫阿哲一起。」',say:[{who:'kai',text:'他會一直問哪裡可以吃。……好啊。'}]}]} ],
      back:{day:'08-28'},   /* 阿哲「伴手禮咧」（AA_241；出國第幾次照 AA_242 0-3）*/
      miss:{day:'08-28',h:21,who:'kai',msgs:['📷（秋葉原的街，招牌一層一層疊上去）','買到了']} },
    /* ===== 朋友揪團出國（C13 的一種；BB_200 第 8 節、台詞 AA_244 3-2 b667820f）：每個暑假一位、要和揪的人 FAMILIAR 以上 ===== */
    /* 大二暑假：方奕廷，日本的山（8/1～8/4）；7/10 21:00 私訊、週五（7/16）前回 */
    T02:{ id:'T02', title:'日本的山（方奕廷那一團）', cat:'海外旅遊', season:'summer', years:['Y2'], days:['08-01','08-04'], slot:'night', place:{kind:'abroad',name:'日本',tz:1}, cost:{payer:'family',local:'self'}, free:'partial', mates:['npc_fangyt'],   /* AA_369 H4 */
      signup:{kind:'dm', who:'npc_fangyt', min:'FAMILIAR', day:'07-10', h:21, until:'07-16', flag:'VAC_T02',
        msgs:['八月一號到四號，去日本爬山。','登山社兩個人。你要的話，第四個位子。','機票我查過了，下禮拜會漲。'],
        yes:{t:'去。',say:[{from:'npc_fangyt',text:'好。鞋子要能走八個小時的。'}],family:'機票多少？我轉給你。'},
        later:{t:'我體力不太行。',say:[{from:'npc_fangyt',text:'第二天有纜車。……我不坐，你可以坐。週五前跟我說。'}]},
        no:{t:'這次不行。',say:[{from:'npc_fangyt',text:'好。有拍到樹，再給你看。'}]} },
      trip:{ start:{day:'08-01',h:5}, end:{day:'08-04',h:20}, placeName:'日本的山', home:'auto' }, back:{},
      keys:[
        {day:'08-01',h:5,title:'出發',bg:null,hall:true,lines:[{narr:'（早上五點的機場。方奕廷的背包上掛著一個水壺，已經裝滿了。）'},{who:'npc_fangyt',text:'山上這幾天有霧。'},{who:'npc_fangyt',text:'……霧裡的樹比較好看。'}]},   /* hall：進 3D 出境大廳就演（AA_478 第 2 節）；方奕廷兩句接在水壺旁白後面（AA_478 第 3 節）*/
        {day:'08-02',h:10,title:'山上第一天',bg:null,lines:[{narr:'（步道上的霧很濃。方奕廷走在最前面，每隔一段就停下來看一棵樹。）'},{who:'npc_fangyt',text:'這棵，台灣沒有。'}]},
        {day:'08-02',h:21,title:'山屋那晚',bg:null,lines:[{narr:'（山屋的燈九點就關了。黑暗裡有人在打呼。）'},{who:'npc_fangyt',text:'（小聲）明天四點起來，看日出。'}]},
        {day:'08-03',h:20,title:'下山那晚',bg:'trip_jp_onsen',lines:[{narr:'（溫泉街的燈籠一路亮到坡底。）'},{who:'npc_fangyt',text:'這座山還有一條路沒走。'}]} ],
      miss:{day:'08-03',h:20,who:'npc_fangyt',min:'FAMILIAR',msgs:['📷（山頂的雲海）','到了']} },
    /* 大三暑假：子晴，曼谷（7/3～7/7）；6/10 21:00 私訊。日本路線的玩家人在日本（到 8/5）收不到，7/5 改傳照片。芷若×子晴交往中的版本（BB_194 §23）等那條線做好再接 */
    T03:{ id:'T03', title:'曼谷（子晴那一團）', cat:'海外旅遊', season:'summer', years:['Y3'], days:['07-03','07-07'], slot:'night', place:{kind:'abroad',name:'曼谷',tz:-1}, cost:{payer:'family',local:'self'}, free:'partial', mates:['heroine_04','kai'],   /* AA_369 H4：子晴＋阿凱 */
      signup:{kind:'dm', who:'heroine_04', min:'FAMILIAR', day:'06-10', h:21, until:'06-16', flag:'VAC_T03', unless:G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='JP',
        msgs:['欸 七月三號到七號 曼谷','有個獨立遊戲展 我想去看','阿凱也去'],
        yes:{t:'去。',say:[{from:'heroine_04',text:'好 機票我來比價'}],family:'機票多少？我轉給你。'},
        later:{t:'遊戲展是什麼？',say:[{from:'heroine_04',text:'去了就知道'},{from:'heroine_04',text:'這禮拜回我'}]},
        no:{t:'這次不行。',say:[{from:'heroine_04',text:'好吧 帶東西給你'}]} },
      alt:{day:'07-05',h:21,who:'heroine_04',min:'FAMILIAR',if:G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='JP',msgs:['📷（遊戲展的入口）','你不在 好可惜']},
      trip:{ start:{day:'07-03',h:8}, end:{day:'07-07',h:18}, placeName:'曼谷', home:'auto' }, back:{},
      hallLines:[{who:'heroine_04',text:'我在飛機上要睡覺。到了再叫我。'},{who:'kai',text:'遊戲展第一天要排隊。……我查過了，九點開門。'}],   /* 進 3D 出境大廳演一次、不用選項（AA_478 第 3 節；src/vac3d.js S.hallKeys）*/
      keys:[
        {day:'07-04',h:14,title:'遊戲展',bg:null,lines:[{narr:'（展場很小，攤位一個挨著一個。子晴在一個攤位前站了二十分鐘，一直玩同一關。）'},{who:'heroine_04',text:'這關設計得很爛。……可是我停不下來。'}]},
        {day:'07-05',h:20,title:'夜市',bg:'trip_th_nightmarket',lines:[{narr:'（阿凱一個人吃了三份炒河粉。）'},{who:'kai',text:'……還有一攤。'}]},
        {day:'07-06',h:21,title:'最後一晚',bg:null,lines:[{who:'heroine_04',text:'回去我就要進工作室了。……先吃這一攤。'}]} ],
      miss:{day:'07-07',h:21,who:'heroine_04',min:'FAMILIAR',msgs:['📷（夜市）','阿凱吃了三份'],unless:G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='JP'} },
    /* ===== 出國的活動（AA_242 18fe1b6a 照抄；AA_199 7-4）：學校、團隊、新 NPC 全部虛構；海外的關鍵事件是 2D 場景（底圖等使用者給，先用暗底）=====
       沒錄取（BB-C 13:03，AA_199 3-5／3-7「限制玩家的是時間」）：C08、C11 要用掉一個時段寫申請資料（報名隔天 20:00 宿舍書桌）、C09 面試人要到；沒做＝公布那天「很遺憾」＋阿哲一句，可以改報別的。日子 BB 確認（C08 說明會第 14 週週三 12:20、C09 面試第 7 週週三 19:00、C11 結果第 8 週週一 12:00）。 */
    /* VAC-C08 姊妹校邀請交流（首爾）：AA_242 第 1 節。大一暑假 7/13～7/24 */
    C08:{ id:'C08', title:'姊妹校暑期交流（首爾）', cat:'海外交流', season:'summer', years:['Y1','Y2','Y3'], days:['07-13','07-24'],
      rep:{ keys2:[null,'歡迎晚會。智恩來幫忙接待，中文比去年快了一點。','市場。賣醬的老闆認出你，又多塞了一小包。','報告。你又講了麵店，這次有人問阿姨幾歲。','最後一晚。你們在宿舍門口拍照，站的位置跟去年一樣。'],
        keys3:[null,'歡迎晚會。這次換你跟新來的臺大同學說哪一道不辣。','市場。那家醬的攤位換成她女兒在顧。','報告。麵店講過兩次了，這次你講總圖。','最後一晚。你幫學弟妹把行李搬上巴士。'],
        recruit2:{from:'sysoffice',name:'系辦',text:'去過的同學也可以再報，名額一樣十個。'} }, slot:'night', place:{kind:'abroad',name:'首爾',tz:1}, cost:{payer:'family',local:'self'}, free:'partial',
      signup:{kind:'group', th:'g:law_class', term:'S2', week:6, wd:1, h:12, until:{term:'S2',week:9,wd:5}, flag:'VAC_C08', board:true,
        msgs:[{from:'sysoffice',name:'系辦',text:'【交流計畫】姊妹校暑期交流（首爾），7/13～7/24，對方學校負擔食宿。名額 10 名，需系上推薦，第 9 週週五前交申請書。'}],
        yes:{t:'（交申請書）',say:[]} },
      select:{term:'S2',week:12,wd:1,h:12,name:'姊妹校暑期交流（首爾）',briefAt:{term:'S2',week:14,wd:3,h:12+20/60},need:'VAC_C08_APP'},
      pre:[{afterSignup:1,h:20,title:'寫申請資料',place:'宿舍書桌',bg:'dorm_desk',lines:[],advance:2,set:{VAC_C08_APP:true}}],   /* BB-C 13:03：第 9 週截止以前要用掉一個時段寫申請資料，沒寫＝第 12 週「沒上」*/
      depart:{zhe:'記得吃炸雞',yu:'幫我看有沒有好看的筆'}, back:{},
      trip:{ start:{day:'07-13',h:8}, end:{day:'07-24',h:18}, placeName:'首爾', home:'auto' },
      keys:[
        {day:'07-13',h:8,title:'出發',bg:'airport_departure',hall:true,lines:[{narr:'（報到櫃台前，九個不認識的臺大學生，每個人的行李都比你小。）'},{who:'npc_leader',name:'帶隊老師',text:'法律系的？好，十個到齊了。'}]},   /* hall：進 3D 出境大廳就演，大廳就是那個地方（AA_478 第 2 節；bg 只剩沒有 3D 機場的時候用）*/
        {day:'07-13',h:19,title:'歡迎晚會',bg:'intl_seoul_dinner',lines:[{narr:'（長桌上擺了一整排小菜。對面的女生拿起一個小碟子，放到你前面。）'},{who:'npc_jieun',name:'智恩',text:'這個，不辣。我試過。'},{who:'npc_jieun',name:'智恩',text:'你是……法律？'}],
          choice:[{t:'「對，法律系。」',say:[{who:'npc_jieun',name:'智恩',text:'我的朋友說，法律系的人，很會吵架。'},{narr:'（她說完自己笑了。）'}]},{t:'「妳中文好好。」',say:[{who:'npc_jieun',name:'智恩',text:'我學三年了。……可是你們說話太快。'}]}]},
        {day:'07-18',h:14,title:'傳統市場',bg:'intl_seoul_market',lines:[{narr:'（市場很窄，兩邊的攤位往中間擠。智恩走在前面，每到一個攤位就回頭講一句。）'},{who:'npc_jieun',name:'智恩',text:'這個是做年糕的。那個是賣魚的。那個……我也不知道。'},{who:'npc_jieun',name:'智恩',text:'（問了老闆）她說是她媽媽做的醬。賣了四十年。'}],
          choice:[{t:'「買一罐。」',say:[{narr:'（老闆多塞了一小包給你。智恩翻譯：「她說，帶回去給家裡的人。」）'}]},{t:'「四十年喔。」',say:[{who:'npc_jieun',name:'智恩',text:'嗯。她說她女兒不想接。'}]}]},
        {day:'07-22',h:14,title:'分組報告',bg:'intl_seoul_campus',lines:[{narr:'（分組報告的題目是「兩國的大學生，一天怎麼過」。你們這組的投影片只做好一半。）'},{who:'npc_jieun',name:'智恩',text:'你的部分，可以講你們的……麵店嗎？你一直在說的那個。'}],
          choice:[{t:'「好，我講麵店。」',say:[{narr:'（報告的時候，講到週二週四的麵店，下面有人笑了。）'}]},{t:'「我講宿舍。」',say:[{narr:'（你講到宿舍規則有十七頁，對方的學生睜大眼睛。）'}]}]},
        {day:'07-23',h:20,title:'最後一晚',bg:'intl_seoul_night',lines:[{who:'npc_jieun',name:'智恩',text:'明天你們走了以後，我要寫報告。'},{who:'npc_jieun',name:'智恩',text:'老師說要寫「交流的心得」。……我不知道要寫什麼。'}],
          choice:[{t:'「寫市場那個阿姨。」',say:[{who:'npc_jieun',name:'智恩',text:'……好。那個可以寫。'}]},{t:'「寫你們的炸雞。」',say:[{who:'npc_jieun',name:'智恩',text:'（笑）老師會生氣。'}],set:{C08_CHICKEN:true}}]} ],
      /* 7-1 智恩：回國一週後、那年中秋（2026-09-25）*/
      follow:[
        {day:'07-31',h:20,who:'npc_jieun',name:'智恩',msgs:G=>[(G.name||'祐廷')+'，你好。我是智恩。',G.flags.C08_CHICKEN?'我的中文報告，老師給我 A。……因為我寫了炸雞。':'我的中文報告，老師給我 A。謝謝你們。'],
          opts:[{t:'恭喜！',say:['謝謝。有空來首爾，我請你吃炸雞。這次不辣。']},{t:'炸雞有用。',say:['（笑）對。炸雞有用。']}]},
        {day:'09-25',h:20,who:'npc_jieun',name:'智恩',msgs:G=>['今天是秋夕。韓國的中秋。','台灣也吃月餅嗎？'],
          opts:[{t:'吃，還會烤肉。',say:['烤肉？……下次我要去台灣看。']},{t:'吃柚子。',say:['柚子……要查一下。']}]} ] },
    /* VAC-C09 海外志工（柬埔寨的鄉村小學，虛構團隊「暖陽服務隊」）：AA_242 第 2 節。大一暑假 7/27～8/5；說明會第 5 週週三、面試第 7 週（LAWWW 排週三 19:00）、第 10 週公布、行前訓練 6/13 */
    C09:{ id:'C09', title:'海外志工（暖陽服務隊）', cat:'社團志工', season:'summer', years:['Y1','Y2','Y3'], days:['07-27','08-05'],
      rep:{ pre2:[null,null,'行前訓練。家睿讓你帶新隊員折紙。'], pre3:[null,null,'行前訓練。新隊員問你村子裡熱不熱，你說很熱。'],
        keys2:['到村子。去年那個不講話的小男生，先跑過來牽你的手。','（第二次來，你已經知道洗手歌怎麼唱了。）','又停電了。這次大家都帶了頭燈。','最後一天。去年畫的那張還貼在教室的牆上。'],
        keys3:['到村子。家睿畢業了，今年的隊長是去年的新隊員。','上課。小朋友唱洗手歌的時候，換他們教新隊員。','停電。你把多帶的頭燈分給新隊員。','最後一天。村長說，明年學校要加蓋一間教室。'],
        noSelect:true },   /* 第二次以後：家睿直接邀（7-1），不用再面試 */ slot:'night', place:{kind:'abroad',name:'柬埔寨',tz:-1}, cost:{payer:'family'}, free:'partial',
      signup:{kind:'board', term:'S2', week:3, wd:1, h:9, until:{term:'S2',week:5,wd:3}, flag:'VAC_C09', board:true, yes:{t:'（報名）',say:[]} },
      pre:[
        {term:'S2',week:5,wd:3,h:19,title:'說明會',place:'社科院教室',bg:'classroom_small',lines:[{narr:'（投影片上是一間鐵皮屋頂的教室，二十幾個孩子擠在三張長桌。）'}]},
        {term:'S2',week:7,wd:3,h:19,title:'面試',place:'社科院教室',bg:'classroom_small',set:{VAC_C09_INT:true},lines:[{who:'npc_jiarui',name:'家睿',text:'為什麼想去？'}],
          choice:[{t:'「想看看不一樣的地方。」',say:[{who:'npc_jiarui',name:'家睿',text:'好。……那邊很熱，蚊子很多，沒有冷氣。你可以嗎？'},{who:'player',text:'可以。'}]},{t:'「想教小朋友。」',say:[{who:'npc_jiarui',name:'家睿',text:'教英文跟衛教，十天。教不了太多，但可以教一點。'}]}]},
        {day:'06-13',h:10,title:'行前訓練',place:'社科院教室',bg:'classroom_small',lines:[{who:'npc_jiarui',name:'家睿',text:'洗手歌，每個人都要會。我們會唱一百次。'},{narr:'（他真的唱了一次。全隊跟著唱。）'}]} ],
      select:{term:'S2',week:10,wd:1,h:12,name:'海外志工（暖陽服務隊）',briefAt:{day:'06-13',h:10},need:'VAC_C09_INT'},   /* BB-C 13:03：面試人要到，沒到＝第 10 週「沒上」*/
      depart:{zhe:'防蚊液帶了沒',yu:'要拍小朋友的照片喔'}, back:{},
      trip:{ start:{day:'07-27',h:7}, end:{day:'08-05',h:18}, placeName:'柬埔寨', home:'auto', signalAfter:22, dark:'08-02', endLines:[{narr:'（你把那張畫夾進書桌前的軟木板。）'}] },
      keys:[
        {day:'07-28',h:15,title:'到村子第一天',bg:'intl_cambodia_classroom',lines:[{narr:'（車開了四個小時，最後一段是紅土路。學校的鐵皮屋頂曬得發燙。）'},{narr:'（孩子從教室門口探頭，看到你們，又縮回去。）'},{who:'npc_jiarui',name:'家睿',text:'第一天都這樣。明天就會黏上來了。'}]},
        {day:'07-30',h:10,title:'上課',bg:'intl_cambodia_classroom',lines:[{narr:'（你負責教數字。寫到 7 的時候，前排一個小男孩舉手，用很慢的英文說他七歲。）'}],
          choice:[{t:'（寫一個大大的 7，指他）',say:[{narr:'（他笑得很開心，跑去跟旁邊的人講。）'}]},{t:'（問他叫什麼名字）',say:[{who:'npc_dara',name:'小男孩',text:'Dara。'},{narr:'（之後每一堂，他都坐第一排。）'}],set:{C09_DARA:true}}]},
        {day:'08-02',h:21,title:'停電的一晚',bg:'intl_cambodia_night',lines:[{narr:'（晚上下大雨，停電。隊員擠在宿舍的走廊，點了兩支蠟燭。）'},{who:'npc_jiarui',name:'家睿',text:'每年都會停一次。去年停了兩天。'},{who:'npc_jiarui',name:'家睿',text:'……明天如果還沒來電，就帶孩子在外面上課。'}],
          choice:[{t:'「在樹下上。」',say:[{who:'npc_jiarui',name:'家睿',text:'好。你負責找一棵夠大的。'}]},{t:'「那洗手歌還唱嗎？」',say:[{who:'npc_jiarui',name:'家睿',text:'唱啊。洗手歌不用電。'}]}]},
        {day:'08-04',h:15,title:'最後一天',bg:'intl_cambodia_classroom',lines:[{narr:'（孩子把一張畫塞進你手裡。畫上是一棟房子，旁邊站著很多個火柴人。）'},{narr:'（最旁邊那個火柴人比別人高，頭上寫著你的名字，拼錯了一個字母。）'}]} ],
      /* 7-1 家睿：8/20 21:00（隔年說明會那週的那一則，等每年重開時接）*/
      follow:[
        {day:'08-20',h:21,who:'npc_jiarui',name:'家睿',msgs:G=>['📷（村子小學的教室，牆上貼著你們那天畫的洗手歌）','村長傳來的。他們還在唱。'],
          opts:[{t:'我也還會唱。',say:['我知道。你唱得最大聲。']},{t:'謝謝你傳。',say:['應該的。大家都有。']}]},
        /* 隔年大一下（或大二下）第 5 週週一 12:00：「今年服務隊還缺兩個人。」（AA_242 7-1；AA_264 第 0 節第 3 點：報了不重演、照第二次的日誌）*/
        {next:{term:'S2',week:5,wd:1},h:12,who:'npc_jiarui',name:'家睿',msgs:G=>['今年服務隊還缺兩個人。','你要不要再來一次？不勉強。'],
          opts:[{t:'我想想。',say:['好。說明會在禮拜三。'],set:{C09_AGAIN:true}},{t:'今年不行。',say:['好。我幫你跟小朋友說。']}]} ] },
    /* VAC-C10 海外大學暑期課（加州的大學，虛構）：AA_242 第 3 節。大二暑假 6/21～7/31（六週、兩門）；大二下第 10～13 週報名，報名隔天去系辦送課程大綱＝C10_CREDIT_FILED；回來大三上第 2 週系辦學分採計 */
    C10:{ id:'C10', title:'海外大學暑期課（加州）', cat:'學習考試', season:'summer', years:['Y2','Y3'], days:['06-21','07-31'],
      rep:{ pre2:[null], keys2:['第二次飛加州。這次你在飛機上睡得著。','第一堂。教授問誰去年來過，你舉了手。','報告。這次你沒有先寫好講稿。','週末。你帶同組的人去去年那家漢堡店。','期末考。考場的冷氣一樣冷，你帶了外套。'],
        post2:'學分採計。系辦的人說這次你的表格填得很快。' },   /* 最多兩次（大二、大三暑假）；第二次沒有成績信、Priya */ slot:'night', place:{kind:'abroad',name:'加州',tz:-15}, cost:{payer:'family'}, free:'partial',
      signup:{kind:'board', term:'S2', week:10, wd:1, h:9, until:{term:'S2',week:13,wd:5}, flag:'VAC_C10', board:true, yes:{t:'（報名）',say:[]} },
      pre:[{afterSignup:1,h:14,title:'系辦（學分採計）',place:'法律系辦',bg:'classroom_small',lines:[{who:'npc_office',name:'系辦助理',text:'要採計的話，先把課程大綱給我，系上審過才算。出國前送，回來帶成績單。'},{who:'npc_office',name:'系辦助理',text:'……國外的課不一定都抵得掉。先問清楚比較好。'}],set:{C10_CREDIT_FILED:true}}],
      select:{name:'海外大學暑期課（加州）'},
      depart:{zhe:'你要去六個禮拜喔？？',yu:'時差多少'}, back:{},
      trip:{ start:{day:'06-21',h:7}, end:{day:'07-31',h:20}, placeName:'加州', home:'auto', missWeek:3, videoWd:0, videoH:10 },
      keys:[
        {day:'06-21',h:7,title:'抵達',bg:'us_airport',lines:[{narr:'（飛機飛了十二個小時。下飛機的時候，手機的時間往回跳了一天。）'}]},   /* AA_478 第 2 節：留在下飛機以後（「出發」改「抵達」；背景＝美國路線的機場大廳 us_airport，原本是出境的 airport_departure）。順序：飛往美國字卡 → 抵達 → 6/23 第一堂課 */
        {day:'06-23',h:9,title:'第一堂課',bg:'intl_ca_classroom',lines:[{narr:'（教室比霖澤館的小。教授穿短褲，第一句話是「叫我名字就好」。）'},{narr:'（旁邊的女生轉過來，自我介紹她叫 Priya，從印度來，念經濟。）'},{who:'npc_priya',name:'Priya',text:'Law? In Taiwan? ……You have a lot of reading, right?'}],
          choice:[{t:'「Yes. Too much.」',say:[{who:'npc_priya',name:'Priya',text:'Same.'},{narr:'（她把讀本攤開給你看，滿滿的螢光筆。）'}]},{t:'「I used to study economics.」',say:[{who:'npc_priya',name:'Priya',text:'Really? Why did you switch?'},{narr:'（你想了一下，只說「Long story.」她點頭，沒有再問。）'}]}]},
        {day:'07-02',h:10,title:'第一次報告',bg:'intl_ca_classroom',lines:[{narr:'（輪到你報告。講到第二張投影片，你忘了一個字。教授等了三秒，幫你接下去。）'},{who:'npc_prof_ca',name:'教授',text:'Take your time.'}]},
        {day:'07-11',h:13,title:'週末',bg:'intl_ca_beach',lines:[],
          choice:[{t:'海邊',say:[{narr:'（風很大。Priya 說她第一次看到太平洋的另一邊。）'}]},{t:'校園的圖書館',say:[{narr:'（週末的圖書館沒什麼人。你在窗邊讀了一下午，窗外的草地有人在丟飛盤。）'}],set:{C10_STUDY:true}}]},   /* 成績 A／B＋：AA「照讀書的次數」——遊戲沒有假期日誌，這一版看週末有沒有去圖書館（C10_STUDY，等 BB 定）*/
        {day:'07-30',h:9,title:'期末考',bg:'intl_ca_classroom',lines:[{narr:'（考卷四題，三小時。你寫完第三題的時候，旁邊的 Priya 已經在檢查了。）'}]} ],
      /* 成績（AA_242 3-6 79adc9f2）：8/10 學校的信；A 版截圖傳家人群組、媽媽兩句；B＋版不傳。Priya 8/10 問成績、2027-09-14 問學分（7-1）*/
      grades:{day:'08-10',h:9,mail:'（學校的信）Final grades are now available.',A:{narr:'（兩門課都是 A。你截了圖，傳到家人群組。）',mom:['好棒！','那邊吃得飽嗎']},B:{narr:'（一門 A−，一門 B＋。B＋那門的期末考，你寫到第三題，時間就到了。）'}},
      follow:[
        {day:'08-10',h:22,who:'npc_priya',name:'Priya',msgs:G=>['Back in Mumbai. It\'s raining every day.','Did you get your grades?'],optsFn:G=>G.flags.C10_STUDY?[{t:'A.',say:['Show-off. I got an A-minus.']}]:[{t:'B+.',say:['B+ is fine. The final was too long anyway.']}]},
        {abs:'2027-09-14',h:21,who:'npc_priya',name:'Priya',msgs:G=>['Did your school count the credits?'],opts:[{t:'One of them.',say:['One is good. Economics says: better than zero.']},{t:'Both.',say:['Lucky. Mine only took one.']}]} ],
      post:{ if:'C10_CREDIT_FILED', yk:yk=>'Y'+(+String(yk).slice(1)+1), term:'S1', week:2, wd:1, h:14, afterClass:true, title:'系辦（學分採計）', place:'法律系辦', bg:'classroom_small',
        lines:[{who:'npc_office',name:'系辦助理',text:'兩門都過了。一門抵選修，一門……老師說內容和我們的課重疊，只能抵一半。'},{who:'npc_office',name:'系辦助理',text:'還是不錯啦。'}] } },
    /* VAC-C11 臺大提名的姊妹校短期課程（東京）：AA_242 第 4 節＋AA_244 第 1 節以安版。大二寒假 1/17～1/30；大二上第 5 週公告、第 6 週截止（甄審結果 LAWWW 排第 8 週週一 12:00）*/
    C11:{ id:'C11', title:'姊妹校冬季短期課程（東京）', cat:'海外交流', season:'winter', years:['Y2','Y3','Y4'], days:['01-17','01-30'],
      rep:{ keys2:['第一堂。這次你聽得懂老師的玩笑。','參訪。去年那間法院的導覽員換人了。'], keys3:['第一堂。同團的學弟妹問你要坐哪裡。','參訪。你在同一個地方等大家集合。'] }, slot:'night', place:{kind:'abroad',name:'東京',tz:1}, cost:{payer:'family'}, free:'partial',
      mates:{Y2:['heroine_01']},   /* 以安只有大二寒假報了東京（AA_369 H4、M4）*/
      signup:{kind:'board', term:'S1', week:5, wd:1, h:9, until:{term:'S1',week:6,wd:5}, flag:'VAC_C11', board:true, yes:{t:'（報名）',say:[]} },
      select:{term:'S1',week:8,wd:1,h:12,name:'姊妹校冬季短期課程（東京）',need:'VAC_C11_APP'},
      pre:[{afterSignup:1,h:20,title:'寫申請書',place:'宿舍書桌',bg:'dorm_desk',lines:[],advance:2,set:{VAC_C11_APP:true}}],   /* BB-C 13:03：第 6 週截止以前寫申請書，沒寫就沒上 */
      depart:{zhe:'冬天的東京欸',yu:'帶暖暖包'}, back:{},
      trip:{ start:{day:'01-17',h:7}, end:{day:'01-30',h:18}, placeName:'東京', home:'auto' },
      keys:[
        {day:'01-18',h:9,title:'第一堂',bg:'intl_tokyo_classroom',lines:[{narr:'（教室的暖氣很強，窗戶上都是霧。老師在黑板上寫了今天的主題：「大學生與地方社區」。）'},{narr:'（同團的臺大學生小聲說：「好像通識課。」）'},
          G=>!AN_YR(G,['Y2'])?{narr:'（教室裡都是不認識的人。）'}:(typeof STORY!=='undefined'&&STORY.knows&&STORY.knows('heroine_01',G)?{narr:'（休息時間，以安坐在你斜前方，回頭用嘴型說：好冷。）'}:null)]},   /* 以安報了東京（AA_244 第 1 節大二寒假）；大三、大四她沒去（AA_369 M4：拿掉她的句子、教室旁白換這一句）*/
        {day:'01-23',h:14,title:'參訪',bg:'intl_tokyo_shotengai',lines:[{narr:'（參訪的是一個商店街的協會。會長是一位七十幾歲的伯伯，講話很快，翻譯跟不上。）'},{narr:'（最後他拿出一張商店街五十年前的照片。照片裡人很多。）'}]} ] },
    /* VAC-C12 海外語言文化課程（京都，虛構語言學校）：AA_242 第 5 節。大二暑假 8/9～8/27；大二下 3～5 月直接報名（第 3～12 週）。以安七月考完日檢也去（AA_244），FAMILIAR 以上才演同班那版 */
    C12:{ id:'C12', title:'海外語言文化課程（京都）', cat:'學習考試', season:'summer', years:['Y2','Y3'], days:['08-09','08-27'],
      rep:{ keys2:['第一堂。分班考這次分到中級。','茶道課。你記得茶碗要轉兩次。','最後一天。你在車站買了去年那家的點心。'], keys3:['第一堂。同班的人大多比你小。','茶道課。老師讓你示範給新同學看。','最後一天。你寄了一張明信片回麵店。'] }, slot:'night', place:{kind:'abroad',name:'京都',tz:1}, cost:{payer:'family',local:'self'}, free:'partial',
      mates:{Y2:['heroine_01']},   /* 以安只有大二暑假在京都（AA_350 S8 presence 2027-08-09～08-27；AA_369 H4、M4）*/
      signup:{kind:'board', term:'S2', week:3, wd:1, h:9, until:{term:'S2',week:12,wd:5}, flag:'VAC_C12', board:true, yes:{t:'（報名）',say:[]} },
      select:{name:'海外語言文化課程（京都）'},
      depart:{zhe:'又去日本',yu:'你是不是住在日本了'}, back:{},
      trip:{ start:{day:'08-09',h:7}, end:{day:'08-27',h:22}, placeName:'京都', home:'auto' },
      keys:[
        {day:'08-10',h:9,title:'第一堂',bg:'intl_kyoto_school',lines:[G=>AN_C12(G)?[{narr:'（休息時間，走廊另一頭有人叫你的名字。是以安，她在中級班。）'},{who:'heroine_01',text:'你也來了？'},{who:'heroine_01',text:'我七月考完日檢，想說趁暑假多練口說。'}]:[{narr:'（教室裡有十二個人，來自八個國家。老師用日文說了一句話，大家都笑了，你沒聽懂。）'}]],
          choiceIf:G=>AN_C12(G), choice:[{t:'「妳是中級喔。」',say:[{who:'heroine_01',text:'分班考分的。……你不要叫我老師。'}]},{t:'「下課一起吃飯？」',say:[{who:'heroine_01',text:'好。我知道一間便宜的，我查過了。'}]}]},
        {day:'08-19',h:14,title:'文化課：茶道',bg:'intl_kyoto_tearoom',lines:[{narr:'（跪坐十分鐘以後，你的腳麻了。老師說，茶碗要轉兩次。）'},{narr:'（你轉了三次。老師看了一眼，沒說話，笑了一下。）'}]},
        {day:'08-27',h:15,title:'最後一天',bg:'intl_kyoto_school',lines:[{narr:'（老師發了結業證書，上面的名字用片假名寫，你念了兩次才念對。）'},G=>AN_C12(G)?[{who:'heroine_01',text:'你的名字片假名好長。'},{who:'heroine_01',text:'……我幫你念一次。'}]:null]} ] },
    /* VAC-C16 法扶實習（法律扶助的基金會台北分會，辦公室和人物虛構）：AA_242 第 9 節。大二暑假起（大一不能報）、大四下以後沒有；暑假第 2 週起兩週、週一～五 9:00～18:00（80 小時），沒有薪水。
       報名：下學期第 10 週週一 12:00 全班群組系辦公告（行事曆也報得到）→ 第 12 週週五截止 → 第 14 週週一 12:00 結果。
       名額有限（「超過時看成績」）：遊戲照 C08、C11 的做法（BB-C 13:03「限制玩家的是時間」），報名隔天 20:00 要用掉一個時段寫申請表，沒寫＝系辦的信「名額已滿，明年可以再報。」（9-2：不用 0-1 的群組那句）；
       AA_242 12-1 第 4 點再加：上學期有被當的科目＝沒錄取（select.noFail＝看哪一學期：S1＝這一學年的上學期；用「看成績」的字面意思，不另設分數門檻；被當＝期末考 0 分，src/vac3d.js S.failedTerm）。
       錄取：0-1 的通知，家人群組換成媽媽一句（9-2）。語彤（社會系、雙主修法律）「她那年也報了才在」：大三暑假（AA_242 12-1 第 1 點；她大二暑假是田野＋店裡；最後一天她說「我明年還要來」＝她延畢的那一年）。
       大二去過、大三再來（第二次）：不重演，關鍵日換成 rep.keys2 的一句（12-3）；語彤那兩段照演（C16_KEYS 的 again）。午餐每天 −100（work.lunch，兩週 −1,000；12-1）*/
    C16:{ id:'C16', title:'法扶實習（台北分會）', cat:'打工實習', season:'summer', years:['Y2','Y3'], days:['06-21','07-02'], wd:[1,2,3,4,5], slot:'day',
      place:{kind:'taipei',name:'法律扶助基金會台北分會'}, cost:{payer:'none',note:'沒有薪水'}, free:'partial',
      work:{h0:9,h1:18,travel:'捷運約 20 分鐘',travelH:1/3,lunch:100,
        diary:['（影印、分類、再影印。中午在樓下的便當店吃。）','（電話一直響。櫃台的姐姐把聽筒夾在肩膀上，繼續寫字。）','（下午有人來問能不能申請。韓律師請他先填表，表格比他想的長。）',
          '（你學會怎麼用那台影印機。它只是需要先拍兩下。）','（整理卷宗，把收據照日期排好。有幾張日期寫錯了。）','（下班的時候，等候區還有兩個人在等。）']},   /* AA_242 12-2：10 天裡沒有關鍵事件的 6 天 */
      rep:{keys2:['（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）','（陪同晤談。她講到一半停下來的時候，你沒有抬頭。）','（影印機還是會卡紙。你先拍兩下。）','（最後一天。韓律師把筆記還給你，這次鉛筆補的字比較少。）']},   /* 12-3：只有大二、大三兩次 */
      signup:{kind:'group', th:'g:law_class', term:'S2', week:10, wd:1, h:12, until:{term:'S2',week:12,wd:5}, flag:'VAC_C16', board:true,
        msgs:[{from:'sysoffice',name:'系辦',text:'【暑期實習】法律扶助基金會台北分會，暑假兩週（80 小時），名額有限。第 12 週週五前交申請表。'}],
        yes:{t:'（交申請表）',say:[]} },
      pre:[{afterSignup:1,h:20,title:'寫申請表',place:'宿舍書桌',bg:'dorm_desk',lines:[],advance:2,setI:'APP'}],
      select:{term:'S2',week:14,wd:1,h:12,name:'法律扶助基金會台北分會暑期實習',needI:'APP',noFail:'S1',fam:['兩個禮拜都要穿正式一點嗎'],reject:{sys:[{name:'系辦（信）',text:'名額已滿，明年可以再報。'}],noGroup:true}},
      keys:C16_KEYS(['06-21','06-24','06-29','07-02']),
      byYear:{ Y3:{ days:['06-19','06-30'], keys:C16_KEYS(['06-19','06-22','06-27','06-30'],true) } } },   /* 大三暑假：日本路線人在日本（到 8/5）不能報；美國路線 7/25 才退宿，可以 */
    /* VAC-C17 律所暑期實習（虛構的青嶺法律事務所，8 週）：AA_242 第 10 節。只有大二、大三暑假；要有英文檢定成績（C04 托福或多益考過、成績出來了）才報得了：沒有＝公告後一句旁白（10-1），行事曆沒有報名鈕。
       甄選：下學期第 4 週週一 12:00 公告 → 第 9 週週五截止 → 第 12 週面試（週三 19:00，事務所的會議室；AA_242 12-1 第 3 點照暫排）→ 第 14 週週一 12:00 結果（沒去面試＝事務所的信「謝謝您的申請」，不用 0-1 的群組那句；寄信人照現在＝事務所，12-1 第 6 點）。
       第二次免面試（12-1 第 5 點）：大二去過的玩家，大三那年第 4 週的公告多一個選項 signup.again「寄信給馮律師」——選了不用交履歷、不面試，第 14 週直接錄取（英文檢定大二已經有）；行事曆的報名照舊是交履歷那一條。
       有薪（實習津貼記進生活費）：2026 基本工資時薪 196 元（研究表二）× 每天 8 小時 × 去了的天數，8 週結束那天 18:00 以後一次入帳（12-1 第 7 點照暫排）。
       日誌：沒有關鍵事件的上班日照順序 11 句、用完只有日期卡，第 12 句固定在最後一週的第一個上班日（work.diary、diaryLastWeek，12-2）；第二次（大三）的關鍵日 rep.keys2（12-3）。
       大三暑假：日本路線 8/5 才回台、美國路線 7/25 退宿 8/2 出發，8 週都排不下（S.blocked）。大二暑假跨過 8/6 沛珊放榜、8/7～8 可昕 KH、8/8 七夕：都是晚上或週末，照演（上班到 18:00、週末不上班）。
       可昕（交往中、大二暑假她也在別的事務所實習，BB_97 K14）：最後一天 22:00 視訊（10-6）*/
    C17:{ id:'C17', title:'律所暑期實習（青嶺）', cat:'打工實習', season:'summer', years:['Y2','Y3'], days:['06-21','08-13'], wd:[1,2,3,4,5], slot:'day',
      place:{kind:'taipei',name:'青嶺法律事務所'}, cost:{payer:'none',note:'有實習津貼'}, free:'partial', pay:{hourly:196,hours:8},
      work:{h0:9,h1:18,travel:'捷運約 30 分鐘',travelH:0.5,
        diary:['（門禁卡要刷兩次，第一次總是紅燈。）','（中午大家一起訂便當。你還不知道每個人愛吃什麼。）','（你查了一整天的資料，寫了半頁。查不到的地方寫「查不到」。）',
          '（馮律師經過你的位子，把一本書放在你桌上：「這本找得到。」）','（晚上九點，辦公室還有一半的燈亮著。）','（影印室的紙用完了。你知道要去哪裡拿了。）',
          '（這週的備忘錄，結論寫在第一段。）','（另一個實習生問你期末考考得怎樣。你們都不太想講。）','（下雨。你在捷運站等到雨小一點才出來。）',
          '（週五下午，有人帶了一盒蛋糕。沒有人說是誰生日。）','（你的位子旁邊多了一小盆植物。不知道是誰放的。）'],
        diaryLastWeek:'（最後一週。你把桌上的東西收進一個紙箱，比來的時候多。）'},   /* AA_242 12-2：第 12 句固定在最後一週的第一個上班日；其他照順序 */
      rep:{keys2:['（門禁卡還是同一張。位子換到靠窗了。）','（第一份備忘錄發回來。紅字比去年少，結論在第一段。）','（跟開庭。法官停下來的時候，你在心裡數到五。）',FENG('畢業以後，履歷寄給我。')]},   /* 12-3：只有大二、大三兩次；最後一天是馮律師說的話 */
      gate:{engScore:true,narr:'（你翻了一下，你還沒有英文檢定的成績。）'},
      signup:{kind:'group', th:'g:law_class', term:'S2', week:4, wd:1, h:12, until:{term:'S2',week:9,wd:5}, flag:'VAC_C17', board:true,
        msgs:[{from:'sysoffice',name:'系辦',text:'【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。'}],
        yes:{t:'（交履歷）',say:[]}, again:{t:'寄信給馮律師'} },
      pre:[{term:'S2',week:12,wd:3,h:19,title:'面試',place:'青嶺法律事務所',bg:'law_firm_meeting',travel:'捷運約 30 分鐘',travelH:0.5,setI:'INT',
        lines:[{narr:'（會議室的窗戶看得到整條忠孝東路。對面坐著兩位律師。）'},LAW('你為什麼想來事務所？')],
        choice:[{t:'「想看真的案子怎麼做。」',say:[LAW('好。真的案子，很多時間是在等。')]},{t:'「想知道自己適不適合。」',say:[LAW('這個很誠實。……我們也想知道。')]}]}],
      select:{term:'S2',week:14,wd:1,h:12,name:'青嶺法律事務所暑期實習',needI:'INT',fam:['有錢可以領喔？'],reject:{sys:[{name:'青嶺法律事務所（信）',text:'謝謝您的申請'}],noGroup:true}},
      keys:C17_KEYS(['06-21','06-25','07-14','08-13']),
      kx:{yk:'Y2',h:22,title:'可昕的視訊',bg:'video',lines:[{who:'kexin',text:'你們那邊也是週五交東西喔？'},{who:'kexin',text:'我們律師一直說，結論放第一段。'}],
        choice:[{t:'「我們律師也這樣講。」',say:[{who:'kexin',text:'……全台灣的律師都在講這句吧。'}/* AA_506 第 0 節第 3 點（010515370）：她那時在高雄實習，「全台北」改「全台灣」*/]},{t:'「妳寫幾份了？」',say:[{who:'kexin',text:'六份。你呢？……不要說比我多。'}]}]},
      byYear:{ Y3:{ days:['06-19','08-11'], keys:C17_KEYS(['06-19','06-23','07-12','08-11']) } } },
    /* VAC-C18 海外見習團【虛構：法律與社會見習團，新加坡；時差 0】：AA_242 第 11 節。暑假團 C18、寒假團 C18W，同一系列（第幾次照兩團合計）；不限年級（AA_199 7-5），大四下以後沒有。
       甄選＋獎學金一起審：暑假團下學期第 6 週週一 12:00 公告、第 10 週週五截止、第 11 週面試、第 13 週週一 12:00 結果、行前說明會第 15 週週三 12:20；
       寒假團上學期第 6 週公告、第 9 週截止、第 10 週面試、第 12 週結果、說明會第 14 週週三 12:20（面試、結果、說明會的日子照暫排，AA_242 12-1 第 3 點）。面試人要到：美國路線大四上人在美國＝寒假團不能報（blockPre）。
       寒假團大一寒假不開、大二寒假起照開（12-1 第 2 點：大一上第 6 週才剛入學；寒假第 2 週撞跨年、麵店團海邊，座談那天是元旦）。
       行前說明會（12-5）：錄取的時候排一趟（select.brief，src/vac3d.js），第一次參加的多三行（思穎第一次出現）；沒去照樣出發。
       團費、機票家裡出（獎學金補一部分；不扣生活費，AA_199 3-7），當地零用自己出。出國期間的訊息、回來重逢、回來後的招呼照 AA_242 第 6、8 節（和 C08～C12 同一套）；出發那天麵店團 0-2、回來 0-3。
       第二次、第三次以後（兩團合計）：三場換成 rep 的日誌一句（12-3）。思穎回國後一則（12-6，第一次參加的那一團）。
       沒錄取照 0-1；寒假團的阿哲換寒假版「沒差啦 過年比較重要」（12-4，src/vac3d.js 照季節）*/
    C18:{ id:'C18', series:'C18', title:'海外見習團（新加坡）・暑假團', cat:'海外交流', season:'summer', years:['Y1','Y2','Y3'], days:['07-20','07-28'], slot:'night',
      place:{kind:'abroad',name:'新加坡',tz:0}, cost:{payer:'family',local:'self',note:'獎學金補一部分'}, free:'partial', blockPre:true,
      rep:C18_REP,
      signup:{kind:'group', th:'g:law_class', term:'S2', week:6, wd:1, h:12, until:{term:'S2',week:10,wd:5}, flag:'VAC_C18', board:true, msgs:C18_MSG, yes:{t:'（報名）',say:[]} },
      pre:[C18_INT('S2',11)],
      select:{term:'S2',week:13,wd:1,h:12,name:'法律與社會海外見習團（新加坡）',briefAt:{term:'S2',week:15,wd:3,h:12+20/60},brief:C18_BRIEF,needI:'INT'},
      depart:{zhe:'新加坡很熱喔',yu:'聽說口香糖不能帶'}, back:{}, follow:C18_FOLLOW,
      trip:C18_TRIP('07-20','07-28'), keys:C18_KEYS(['07-21','07-23','07-27']),
      byYear:{ Y2:{ days:['07-19','07-27'], trip:C18_TRIP('07-19','07-27'), keys:C18_KEYS(['07-20','07-22','07-26']) },
               Y3:{ days:['07-17','07-25'], trip:C18_TRIP('07-17','07-25'), keys:C18_KEYS(['07-18','07-20','07-24']) } } },   /* 大三暑假：日本路線人在日本、美國路線 7/25 退宿＝都不能報 */
    C18W:{ id:'C18W', series:'C18', title:'海外見習團（新加坡）・寒假團', cat:'海外交流', season:'winter', years:['Y2','Y3','Y4'], days:['01-04','01-10'], slot:'night',   /* 大二寒假起（AA_242 12-1 第 2 點）*/
      place:{kind:'abroad',name:'新加坡',tz:0}, cost:{payer:'family',local:'self',note:'獎學金補一部分'}, free:'partial', blockPre:true,
      rep:C18_REP,
      signup:{kind:'group', th:'g:law_class', term:'S1', week:6, wd:1, h:12, until:{term:'S1',week:9,wd:5}, flag:'VAC_C18W', board:true, msgs:C18_MSG, yes:{t:'（報名）',say:[]} },
      pre:[C18_INT('S1',10)],
      select:{term:'S1',week:12,wd:1,h:12,name:'法律與社會海外見習團（新加坡）',briefAt:{term:'S1',week:14,wd:3,h:12+20/60},brief:C18_BRIEF,needI:'INT'},
      depart:{zhe:'新加坡很熱喔',yu:'聽說口香糖不能帶'}, back:{}, follow:C18_FOLLOW,
      trip:C18_TRIP('01-04','01-10'), keys:C18_KEYS(['01-05','01-07','01-09']),   /* 大二寒假 */
      byYear:{ Y3:{ days:['01-03','01-09'], trip:C18_TRIP('01-03','01-09'), keys:C18_KEYS(['01-04','01-06','01-08']) },
               Y4:{ days:['01-01','01-07'], trip:C18_TRIP('01-01','01-07'), keys:C18_KEYS(['01-02','01-04','01-06']) } } } };
  /* ===== 出國期間的訊息（台詞 AA_242 第 6、8 節 18fe1b6a；頻率、時差、柬埔寨只有晚上有訊號、停電、加州第 3 週、可昕週末視訊照 BB_200 第 2～3 節）=====
     陣列裡一個元素＝一則訊息；「（照片：…）」寫成 📷（…）（手機的寫法）。dep 出發那天、mid 中間一則、back 回來那天；pool 每天輪播（8 則，用完第二圈只用前半）；rep 兩個回覆（她不再回）。
     freq：h＝她那邊的時間（她在臺灣＝遊戲時間）；every＝幾天一則；tt＝週二、週四那天的時間（語彤顧店晚一點）；nextDay＝凌晨（隔天 0:40）。 */
  const ZR_NOSHIFT=['2027-06-04','2027-09-03'];   /* 芷若不上班：2027-06-04～09-02（含頭尾；6/3 是她最後一個班、9/2 出發去英國）——AA_369 第 8 節第 8 題。tp.noShift、reunion 的 noShift 都用這一段 */
  const TRIP_MSG={
    gf:{
      heroine_01:{freq:{h:21.5},dep:['到了傳一張照片。一張就好。'],mid:['你那邊現在幾點？……吃飯了沒？'],back:['明天有空的話，一起吃飯。'],   /* AA_369 L3：不分目的地；第 7 節第 6 題：整句換（原本只換了引號裡的那段）*/
        pool:[['今天讀了四十頁。你那邊天氣好嗎？'],['手帳今天只寫了一行：等你回來那天。……不要笑。'],['我媽問你吃得習不習慣。她沒問我。'],['Alison 說你不在，宵夜沒人跟她搶。'],['📷（總圖三樓靠窗的位子）','這裡沒人坐。'],['今天背單字背到「おかえり」。……先存著。'],['你吃過了嗎？'],['睡前跟你說一聲。晚安。']],rep:['好。','我也想妳。'],   /* AA_369 M3：寒暑假沒有讀書會（Alison 那句換掉）；第 7 節第 6 題：「…應該在吃早餐。」整句換；第 8 節第 6 題：「你吃過了嗎？」開頭不要刪節號 */
        tp:{pool:[4],backNext:true},   /* AA_369 M3：總圖的照片只在她人在臺北的日子用（vac3d.js S.tripMsgs）；第 7 節第 7 題：回來那天的「明天見。……」限臺北＝隔天她在臺北才傳（隔天她在台中＝改第 2 題那句，reunionHome）*/
        dark:['今天沒有回。……你那邊還好嗎？'],darkAns:'好。……下次停電，也先跟我說。',miss:['手帳翻到你回來那天了。……我先夾一張便利貼。']},
      heroine_03:{freq:{h:22.5,tt:23},dep:['落地跟我說'],mid:['📷（麵店的鍋子）','今天也有開'],back:['回來了嗎','阿姨說幫你留一碗'],
        shopOpen:{mid:true,pool:[0,1,2,3,4,5],back:true},   /* 講店裡生意的那幾則（中間那則「今天也有開」、池子：店裡很忙、客人的乾麵、修鞋的阿伯、店裡的蛋、收店了、沒什麼客人；回來那天「阿姨說幫你留一碗」）：
                                                               麵店過年店休那幾天（noodle_closed3d.js）不傳——AA_369 第 7 節第 7 題、第 8 節第 5 題（套 H5 ④，店休不說有開）*/
        shut:{first:['店休第一天，我睡到十點。……阿姨說我很難得。'],pool:[['店休。阿姨叫我去迪化街買年貨。人好多。'],['今天在家幫阿姨包餃子。我包的都站不起來。']],back:['回來了嗎','店休。阿姨說等開店，第一碗留給你。'],
          rep:['好好休息。','開店我第一個去。']},   /* rep＝店休那幾天玩家能回的（取代「辛苦了。」「想吃乾麵。」，AA_369 第 9 節第 3 題）*/
          /* 店休那幾天換的句子（AA_369 第 8 節第 5 題，AA 20:3x）：first＝店休第一天；pool＝初一以前的店休日子各一次（照順序）；back＝回國那天是店休（取代「阿姨說幫你留一碗」）。
             三句都用過、或過了初一：用池子裡不講店裡的那兩則（你那邊在吃什麼、……晚安）。vac3d.js S.tripMsgs */
        pool:[['今天店裡很忙','阿姨問你什麼時候回來'],['📷（一碗加蛋的乾麵）','不是你的 是客人的'],['今天店裡來了一個修鞋的阿伯','他講了四十分鐘'],['阿姨說你不在 店裡的蛋用得比較少'],['收店了','好累'],['今天下雨 沒什麼客人'],['你那邊在吃什麼'],['……晚安']],rep:['辛苦了。','想吃乾麵。'],
        dark:['你今天怎麼沒回','……沒事就好'],darkAns:'好',miss:['今天收店的時候 我把你的位子擦了兩次']},
      heroine_02:{freq:{h:22},dep:['落地跟我說一聲。'],mid:['今天店裡放的歌，你應該會喜歡。……回來放給你聽。'],back:['你回來那天我早班。下班去找你。'],
        pool:[['下班了。今天放的是一部老片的原聲帶。'],['有個客人點了你都點的那杯。……我差點以為是你。'],['📷（Café 打烊後的吧台）','收好了。'],['今天看了一部電影，結局我先不講。'],['店裡很安靜。……我有點不習慣。'],['你那邊的咖啡怎麼樣？不用騙我。'],['我媽打來，問你回來了沒。'],['晚安。……早點睡。']],rep:['好。','回去第一杯給我。'],
        tp:{pool:[0,1,2,4],mid:true,back:true,noShift:ZR_NOSHIFT},   /* AA_369 M3：Café 的班（下班、客人、打烊的吧台、店裡、店裡放的歌、早班）只在她人在臺北的日子用；回台中的日子用其他幾則、回來那天的「早班」不傳。
                                                                       第 8 節第 8 題：2027-06-04～09-02 她不上班（noShift），人在臺北也一樣不傳 */
        dark:['今天沒收到你的訊息。我等到一點。'],darkAns:'……那就好。',miss:['今天放的那首歌，你應該會喜歡。……我放了三次。']},
      heroine_04:{freq:{h:0+40/60,nextDay:true},dep:['到了沒'],mid:['我今天寫了三百行 你在幹嘛'],back:['回來了喔','明天請我吃飯'],
        pool:[['📷（截圖：寫到一半的程式）','你看這個'],['我今天又熬夜了','不要罵'],['你那邊幾點 我這邊還沒睡'],   /* AA_369 L3 */G=>Q6(G)?['📷（截圖：一個小遊戲的畫面）','試玩一下 回來給你玩']:['📷（截圖：一片黑的畫面，只有一行字）','這是 bug 不是藝術'],['欸 你有沒有吃飯'],['好無聊','我要去寫 code 了'],['我把你的位子坐走了 健身房那台'],['睡了 掰']],rep:['快去睡。','回去給我玩。'],
        dark:['欸你怎麼沒回','還活著嗎'],darkAns:'嚇死',miss:['欸','我有點想你','不准截圖']},
      heroine_05:{freq:{h:21,every:2},dep:['到了說一聲。'],mid:['我今天在法圖待到閉館。你那邊現在幾點。'],back:['回來了？……好。'],   /* AA_369 L3：「你那邊應該是早上」→「你那邊現在幾點。」*/
        pool:[['今天在法圖待到閉館。'],['今天讀完一章。你那邊還好嗎。'],['研究所的書比我想的難。……還好。'],['出門記得帶外套。我媽說的。'],['今天經過你常坐的位子，有人坐了。'],['我睡了。你也早點。'],['報告寫完了。'],['……回來說一聲。']],rep:['好。','妳也早點睡。'],
        dark:['今天沒有消息。明天再說。'],darkAns:'好。',miss:['……今天有點想你。說完了。']},
      classmate_peishan:{freq:{h:21,every:2},off:['2026-12-17','2027-08-06'],   /* 隔天一則（AA_281 第 8 節 M20，和學姊一樣）*/dep:['到了跟我說喔'],mid:['你那邊天氣好嗎？這邊一直下雨'],back:['回來了！要講給我聽'],
        pool:[['問你一件事','那邊的小朋友上學要走多久'],['今天幫表妹改作業 她國小三年級'],['📷（書店角落的童書區）'],['你那邊天氣好嗎 這邊一直下雨'],['我今天想了一下以後要做什麼','還沒想完'],['你吃飯了沒'],['好想聽你講那邊的事'],['晚安喔']],rep:['回去講給妳聽。','吃了。'],
        dark:['怎麼沒回 你還好嗎'],darkAns:'樹下上課？好好喔',miss:['好想你喔 還要三個禮拜']},   /* 重考消失期（2026-12-17 P4 以後到 2027-08-06 放榜，BB_194 §19）：不傳 */
      kexin:{freq:{h:22},dep:['我算過了，你降落的時候我還在睡，醒來看手機'],mid:['高雄今天出大太陽。你那邊呢'],back:['你幾點落地？落地第一個傳給我。'],   /* AA_369 L3：不分目的地、星期、季節（「你那邊現在幾點」「這個週末記得視訊」「高雄今天出大太陽」）*/
        pool:[['你那邊現在幾點'],['我在家念書','我在筆記上畫了一隻貓'],['📷（愛河邊）','這裡少一個人'],['你有沒有好好吃飯'],['今天懶得出門'],['這個週末記得視訊'],['我把你的課表也算進來了 你那邊的'],['晚安 我先睡']],rep:['好。','我也想妳。'],   /* AA_369 第 7 節第 6 題：整句換——「我算了一下 你那邊現在幾點」→「你那邊現在幾點」、「今天熱到不想出門」→「今天懶得出門」*/
        dark:['你今天沒回','我查了 那邊下大雨','你沒事吧'],darkAns:'好 那今天要多傳一則',miss:['我算了一下 還有二十一天','不是在算 是剛好看到'],
        video:['你那邊亮亮的。','……你頭髮變長了。','好，我要去睡了。下禮拜同一個時間。']} },
    darkRep:['昨天停電，整晚沒電。','沒事。在樹下上課。'], missRep:['我也是。','快了。'],
    /* 朋友：回來後第一次在 3D 遇到（AA_242 8-7；BB_200 第 4 節：FAMILIAR 以上、沒有交往，閒聊前多一句，每趟一次）*/
    backGreet:{heroine_01:'回來了？……曬黑了。',heroine_03:'……回來了喔。',yu:'你回來了！伴手禮咧！',zhe:'欸 回來了喔',classmate_bohan:'回來了。時差調好了嗎。',classmate_xinci:'回來了？我把你不在的那幾天的筆記整理好了。',heroine_02:'回來了？……那邊的咖啡，好喝嗎。',heroine_04:'回來了喔。東西咧。',heroine_05:'回來了？',classmate_peishan:'回來了！好玩嗎？',kai:'回來了。宿舍又變吵了。',classmate_mingxuan:'回來啦。',npc_fangyt:'回來了。……那邊的樹，有拍嗎？'},
    /* 回來重逢（AA_242 8-6 79adc9f2；BB_200 第 4 節）：回國當天 21:00 她約、隔天她平常的地方；不算正式約會；記 REUNION_<卡>。沒到＝隔天她傳一則 */
    /* 寒暑假她在老家（presence home；沛珊消失期交往中也一樣）：回國當天 21:00 只傳私訊，不排臺北的見面（AA_278 第 2 節第 1 點，6bcb154b）*/
    reunionHome:{kexin:['回來了？……我在高雄。要來的話，先跟我說幾點的車。'],classmate_peishan:['歡迎回來！我在台中，開學前才上去。……好想聽你講那邊的事。'],
      /* AA_369 第 7 節第 2 題（AA 19:5x）：芷若、以安那幾趟各一句（{那一趟的 I.key: 句子}；沒列到的那一趟＝不傳、不約，同 M3）。
         以安 2026 首爾 7/24 回來、她 7/25 回台中：那句寫「我今天回台中」＝她回台中那一天才傳（vac3d.js；第 8 節第 4 題：15:00）*/
      heroine_02:{'C11@Y2':['回來了喔？我在台中。……東京好玩嗎？開學再跟我講。'],'C12@Y2':['回來了喔？我在台中收行李，箱子關不起來。……京都好玩嗎？傳照片給我。']},
      heroine_01:{'C08@Y1':{h:15,lines:['你回來了。我今天回台中，八號回臺北。……到時候再約。']}}},   /* 第 8 節第 4 題：15:00，和沒交往版 va02_3「回台中了。8 號回去。」同一個時間（{h, lines}＝那一則的時間；沒寫＝21:00）*/
    /* 那一天起換的句子（{from, lines}）：沛珊放榜（2027-08-06）以後開學是回台南、不是上臺北（AA_349 K7：「我在台中，開學前才回台南。」後半照原文；大二以前照舊）*/
    reunionHomeAfter:{classmate_peishan:{from:'2027-08-06',lines:['歡迎回來！我在台中，開學前才回台南。……好想聽你講那邊的事。']}},
    /* 回國「那一天」她在老家（看回國當天的 presence，不看隔天）：那天晚上兩則，不約見面、不約下次（AA_350 S5：以安交往中，C08、C09、2027 C10、T02）*/
    reunionHomeBack:{heroine_01:['到了嗎？','……好。我在台中，沒辦法去接你。行李先放著，先睡。']},
    reunion:{
      heroine_01:{invite:['明天下午三點，總圖門口。','時差調不過來的話，四點也可以。'],h:15,place:'總圖門口',bg:'library_gate_day',lines:[{narr:'（她站在門口，手上拿著手帳。）'},{who:'heroine_01',text:'你回來了。'},{who:'heroine_01',text:'……行程表上寫你今天會到。我沒有算錯。'}],miss:['昨天等你等到總圖關門。……你還在調時差嗎？']},
      heroine_03:{invite:['明天收店以後','九點'],h:21,place:'麵店',bg:'noodle_table',lines:[{narr:'（她把一碗乾麵放在你前面，坐到對面。）'},{who:'heroine_03',text:'回來了。'},{who:'heroine_03',text:'……加蛋了。'}],miss:['昨天的麵我自己吃了']},
      heroine_02:{invite:['明天我九點下班。','……你來的話，我晚一點關燈。'],h:21,place:'兩點半 Café',bg:'cafe_night',lines:[{narr:'（她把最後一張椅子倒扣在桌上。）'},{who:'heroine_02',text:'回來了。'},{who:'heroine_02',text:'……第一杯，我還是做給你。坐。'}],miss:['昨天的那杯，我自己喝了。'],away:{until:'2026-08-25',text:'回來了？……我 26 號回臺北。'},   /* 大一暑假她 7/1～8/25 在台中（BB_171 C1）：回臺北那天補一場 */
        noShift:{from:ZR_NOSHIFT[0],to:ZR_NOSHIFT[1],invite:['回來了喔？明天下午我在 Café。……這次是當客人。來嗎？'],h:15,
          lines:[{narr:'（她坐在窗邊的位子，面前一杯喝了一半的冰咖啡。）'},{who:'heroine_02',text:'回來了。'},{who:'heroine_02',text:'……今天的咖啡不是我做的，學妹做的。你喝喝看。比我好喝的話，我會生氣。'}],miss:['昨天那個位子，我坐到打烊。']},
        byDate:[{to:'2027-06-04',invite:['明天我十點下班。','……你來的話，我晚一點關燈。'],h:22}]},   /* AA_373 第 6 節第 9 題（企劃線 bdab2f42）：她晚班到 22:00——見面那天在 2027-06-04 以前（她還在上班）＝「九點」改「十點」、22:00；台詞、沒去的那句照原本。之後照 AA_375（noShift）*/
          /* AA_369 第 8 節第 8 題：見面那天在她不上班的日子（2027-06-04～09-02）＝這一句、隔天下午（15:00，LAWWW 排的）；
             第 9 節第 2 題：那一場的台詞（不再是倒扣椅子、做第一杯）、沒去的隔天那句也換（vac3d.js S.reNS）*/
      heroine_04:{invite:['回來了喔','明天晚上 公館 宵夜','十點'],h:22,place:'公館',bg:'gongguan',lines:[{who:'heroine_04',text:'欸！'},{narr:'（她跑過來，停在你面前一步。）'},{who:'heroine_04',text:'……曬黑了。好醜。'},{who:'heroine_04',text:'……走，吃東西。'}],miss:['欸你昨天放我鳥']},
      heroine_05:{invite:['明天五點，法圖門口。'],h:17+5/60,place:'法圖門口',bg:'law_library_gate',lines:[{who:'heroine_05',text:'回來了？'},{who:'heroine_05',text:'……好。'},{narr:'（她把一本書遞給你。）'},{who:'heroine_05',text:'你不在的時候出的，先借你看。'}],miss:['昨天沒等到你。……沒關係。']},
      classmate_peishan:{invite:['歡迎回來！','明天下午兩點，舊路書房好不好？'],h:14,place:'舊路書房',bg:'oldroad_bookstore',lines:[{who:'classmate_peishan',text:'你回來了！'},{who:'classmate_peishan',text:'快講，那邊的小朋友是怎樣的？'}],miss:['你昨天是不是睡著了']},
      kexin:{invite:['明天五點半 河堤','我在老地方等'],h:17.5,place:'河堤',bg:'riverside',lines:[{who:'kexin',text:'你回來了。'},{who:'kexin',text:'我算過了，你在那邊三十二天。……好，我不算了。'}],miss:['我昨天在河堤等了一下','你還好嗎']} },
    /* 朋友（FAMILIAR 以上、沒有交往）整趟一兩則：day＝出發後第幾天（'mid' 中間、'end' 回來前一天）*/
    friend:{
      heroine_01:[{day:1,h:21.5,ms:['那邊的便利商店，真的比較好吃嗎？']}],
      heroine_03:[{day:'mid',h:22.5,ms:['📷（麵店今天的長桌）'],shut:['📷（拉下來的鐵門，貼著紅紙）']}],   /* shut＝那天麵店過年店休（朋友版，AA_369 第 9 節第 3 題：2028-01-23 那張）*/
      heroine_02:[{day:2,h:22,ms:['那邊的咖啡怎麼樣？']}],
      heroine_04:[{day:1,h:0+40/60,nextDay:true,ms:G=>Q6(G)?['📷（遊戲截圖）']:['📷（截圖：寫到一半的程式）']},{day:'end',h:22,ms:['回來帶東西給我']}],
      heroine_05:[{day:0,h:'dep',ms:['一路順風。']}],
      classmate_peishan:[{day:'mid',h:21,ms:['問你一件事','那邊的人早餐吃什麼']}],
      kai:[{day:2,h:23,ms:['宿舍好安靜']},{day:'end',h:21,ms:['要不要帶零食回來 我給你錢']}],
      classmate_mingxuan:[{day:'mid1',h:21,ms:['我家教的學生問：國外的大學也要點名嗎']}],
      npc_fangyt:[{day:'mid-1',h:20,ms:['📷（一片葉子）','這是什麼？那邊有沒有長一樣的。']},{day:3,h:20,only:'C09',ms:['雨林是不是真的很吵。']}] } };
  /* ===== C01 麵店團海邊：大二起每年寒假（AA_264 第 2、3 節；大一照 AA_204，在 story3d.js 的 va03）=====
     日子照 AA_275 第 3 節（寒假第二週：第 8 天以後的第一個週一，大四元旦挪到週二）；阿哲前一個週五 21:05 在麵店團群組揪（那個週五是 12/31、1/1 就改前一個週三，AA_264 第 5 節）；
     去過一次＝第二次的句子與日誌，去過兩次以上＝第三次以後；askTue＝那一年是週二（大四），first＝大二以後才第一次去的阿哲那句（AA_264 第 5 節第 3 點）*/
  const C01={ ask:{2:['今年還去海邊嗎','一樣禮拜一'],3:['海邊','照舊']}, askTue:{2:['今年還去海邊嗎','禮拜一元旦 改禮拜二'],3:['海邊','照舊 禮拜二']}, first:{1:'禮拜一去海邊？過幾天我就回高雄了',2:'禮拜二去海邊？過幾天我就回高雄了'}, opts:['我去','我那天不行'],
    diary:{2:['第二次去海邊。阿哲說他記得帶防曬，結果帶的是乳液。','浪比去年大。柏翰坐在離海最遠的地方看書。','回程的車上，一半的人睡著了。'],3:['Alison 在車上先把大家的零食分好了。','大家在去年那塊石頭上又拍了一張。','回程阿哲說明年還要來，沒有人說不要。']} };
  /* ===== 出國旅遊（C13，自己排；AA_244 第 2 節、3-1 b667820f；機制 BB_200 第 7 節）=====
     手機活動頁「安排出國旅遊」：目的地 → 和誰 → 幾天 → 哪天出發。亞洲 3～7 天；歐洲、美國 7～14 天、只有暑假。
     和戀人：交往滿 28 天、正式約會 2 次以上、那幾天兩個人都在臺灣；歐美再加滿 90 天、第一次約她說「下次」；算一次正式約會（dateLog +1）；過夜照 BB_173 VB-12（雙床房，旁白「燈關了」）。 */
  const TRAVEL={
    fam:['要去哪？','機票我買給你，到那邊自己顧好'],
    /* 同一個目的地第二次、第三次以後（AA_264 第 2 節 C05／C13 那一列；阿凱那一團算一次日本）*/
    again:{2:{dep:'機場。這次你記得先把行動電源拿出來。',arr:'第二次來。你沒看地圖就找到了住的地方。',mid:'你去了上次沒排到的地方。',last:'最後一晚。伴手禮買得比上次少，因為知道誰會吃。'},
           3:{dep:'機場。你排隊的時候已經在查第一天的路線了。',arr:'你到了以後，先去吃上次那一家。',mid:'你什麼都沒排，走到哪裡算哪裡。',last:'最後一晚。你幫阿哲多買了一包。'}},
    dest:{
      jp:{name:'日本（東京）',tz:1,far:false,keys:['（車站的轉乘圖像一張電路板。你看了三分鐘，決定跟著前面的人走。）','（便利商店的飯糰有二十幾種，你一種一種看完，最後買了鮭魚的。）','（晚上的商店街，鐵捲門一家一家拉下來。）']},
      kr:{name:'韓國（首爾）',tz:1,far:false,keys:['（機場快線上，旁邊的阿姨一直在講電話，講到一半突然笑出來。）','（傳統市場的炸物攤，老闆多塞了一個給你，用手比了一個「吃」。）','（漢江邊很多人坐在草地上，吃外送的炸雞。）']},
      th:{name:'泰國（曼谷）',tz:-1,far:false,keys:['（一下飛機，熱氣直接貼到臉上。）','（嘟嘟車司機開得很快，轉彎的時候你抓緊旁邊的扶手。）','（夜市的果汁一杯一杯排在冰上，你挑了顏色最奇怪的那杯。）']},
      vn:{name:'越南（河內）',tz:-1,far:false,keys:['（馬路上的機車像水一樣流過去。你等了很久，還是不知道什麼時候可以過。）','（小板凳很低，河粉的湯很燙。隔壁桌的大叔示範給你看，要先加檸檬。）','（湖邊的燈亮了，有人在跳廣場舞。）']},
      hk:{name:'香港',tz:0,far:false,keys:['（地鐵的門關得很快。你差一點被夾到。）','（茶餐廳的阿姐收菜單收得很快，你還沒講完她就走了。……東西倒是很快就來了。）','（渡輪上的風很大，對岸的大樓一棟一棟亮起來。）']},
      eu:{name:'歐洲',tz:-6,far:true,keys:['（老城的石板路，行李箱的輪子一路響。）','（火車月台上的時刻表是翻牌的，一翻，所有人一起抬頭。）','（廣場上有人在拉手風琴，一直拉到餐廳都關了。）']},
      us:{name:'美國',tz:-15,far:true,keys:['（海關排了一個多小時。出來的時候，天已經黑了。）',G=>{ const B=typeof HOME!=='undefined'&&HOME.breakOf?HOME.breakOf(G.day):null; return B&&B.kind==='winter'?'（街口在下雪，咖啡店的玻璃上都是霧。）':'（海邊的公路一直往前，路邊的招牌越來越少。）'; },'（街口的熱狗攤收得很晚。你們站著吃完。）']} },
    /* 和朋友去：最後一晚多一句朋友的話 */
    friend:{kai:'下次換你排行程。',zhe:'伴手禮要買到哪個時候。',yu:'我們拍一張合照啦。',classmate_bohan:'明天幾點的飛機？我算一下要幾點出門。',classmate_xinci:'我把明天的行程再看一次。'},
    /* 和戀人：被問「要不要一起出國？」（next＝隔天她再傳一則）、最後一晚、婉拒、歐美的「下次」 */
    gf:{
      heroine_01:{yes:['哪裡？……給我三天，我排一份行程給你看。'],last:'行程表上的都走完了。……多出來的那一個小時，我沒寫。',no:'出國……我們先在臺北多走幾個地方。好不好？',later:'歐洲……我想去。可是要排十天以上，我們下次。'},
      heroine_03:{yes:['店裡要找人顧。……我問阿姨。'],next:['阿姨說好。她叫我多拍照。'],last:'……阿姨傳訊息問我們吃了什麼。我拍給她看了。',no:'出國喔……先不要啦。先去近一點的地方。',later:'那麼遠喔……店裡要找人顧十天。下次啦。'},
      heroine_02:{yes:['好啊。……我想去有老電影院的地方。'],last:'明天就要回去了。……我想再坐一次那個渡輪。',lastNot:'明天就要回去了。……我想再坐一次那條路。',no:'……先在國內吧。我還想先跟你看幾部電影。',later:'……我也想去。下次好不好，我想慢慢排。'},
      heroine_04:{yes:['去！機票我來比價。'],last:'這趟花的錢我算好了。……你不要看，看了會心痛。',no:'出國？太快了啦。先去夜市練習。',later:'美國？！……下次啦，我先存一點錢買遊戲。'},
      heroine_05:{yes:['……我要先看研究所的時間。'],next:['那幾天可以。'],last:'好久沒有一整天不想研究所的事。',no:'……先在國內。出國的話，我要先排好時間。',later:'十天以上，我要先跟研究所請好。下次。',eve:['我跟我媽說了。','她叫我多帶一件外套。']},
      kexin:{yes:['我算一下。……飛三個多小時的話，第一天下午就能玩。'],last:'我算了一下，我們這五天走了六萬多步。',no:'我排了一下……先在國內，出國我要多排一點時間。',later:'歐洲要排很久……下次，我先做一份行程表給你看。'},
      classmate_peishan:{yes:['真的嗎？我沒出過國。……你要教我怎麼過海關。'],last:'我第一次出國耶。……好好玩。',no:'先在國內走走吧，我們還沒一起去過很多地方。',later:'好遠喔……下次！我先查一下。'} } };
  function Q6(G){ return !!(G&&G.events&&G.events.done&&G.events.done.ev_ziqing_secret_game); }   /* 子晴的遊戲秘密：看過 Q6 才傳遊戲截圖（AA_242 375b91dd）*/
  /* 以安也在京都的語言課：FAMILIAR 以上（AA_242 5-1；她的假期計畫 AA_244 第 1 節大二暑假）*/
  function AN_IN(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.has||!SOCIAL.has('heroine_01','FIRST_MET')) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage('heroine_01'))>=A.indexOf('FAMILIAR'); }
  function AN_C12(G){ return AN_IN(G)&&AN_YR(G,['Y2']); }   /* 她只有大二暑假在京都（大三暑假她在日本交換、剛回來：AA_369 M4）*/
  /* ===== VA-09 芯慈大二暑假在爸爸的事務所（AA_256 第 1 節，AA-C 71b184ba；2027-07-05～08-27 平日 9:00～17:00）=====
     她傳（和她 FAMILIAR 以上）；回覆兩個照順序，第 2、3 則多一個「要不要一起吃午餐？」（一次）→ 最近的平日 12:00；她不講案子的細節 */
  const VA09={who:'classmate_xinci',min:'FAMILIAR',
    msgs:[{tag:'va09_1',day:'2027-07-05',h:18+10/60,ms:['第一天。我負責影印。','影印機會卡紙，卡在第三格。我已經會修了。']},
          {tag:'va09_2',day:'2027-07-14',h:21.5,ms:['今天幫忙排一個查帳的時間表。很長。','我爸說排得很好。……他說的時候沒有看我。'],c14:['今天幫忙排一個查帳的時間表。很長。','就是你上次來，白板上那種。現在是我排的。'],lunch:true},
          {tag:'va09_3',day:'2027-07-28',h:12+40/60,ms:['（照片：便當，旁邊是一疊卷宗的側面，看不到字）','午餐。'],lunch:true},
          {tag:'va09_4',day:'2027-08-27',h:18,ms:['最後一天。','我把我的位子擦乾淨了。……明年還要不要來，我還沒想。']}],
    replies:[{t:'辛苦了。',r:['還好。']},{t:'好厲害。',r:['沒有，只是照著做。']}],
    lunchAsk:{t:'要不要一起吃午餐？',r:['平日十二點到一點。事務所樓下有一間。']},
    lunchFrom:'2027-07-05',lunchTo:'2027-08-27'};
  /* ===== VA-10 麵店團出國：香港（AA_256 第 2 節，71b184ba；大二暑假 2027-08-25～08-28 三天兩夜）=====
     麵店團群組 7/20 21:00 揪；回「我也去。」排進行事曆；「我那幾天不行。」阿哲一句；不回：8/1 阿哲私訊，再不回（8/3 以後）算不去。
     三場用 C13 香港的旁白＋麵店團的句子；8/28 晚上群組四則（沒去的另外多 Alison 在地鐵門外的照片、阿哲最後一句）*/
  /* AA_369 H1（AA 2026-10-21）：以安 8/9～8/27 在京都上語言課（AA_350 S8），不去香港——7/20 群組她改「我那幾天在京都。你們去，拍照給我。」；排行程的兩句改柏翰說（拿掉「可以。」）；
     8/25、8/27 她那兩句改柏翰說、交往版那句拿掉；和以安交往中的：8/27 21:00 她私訊京都車站的照片（datingMsg，vac3d.js S.va10Trip）。mates＝同行的人（H4：出國期間的訊息不算他們）*/
  const VA10={from:'2027-08-25',to:'2027-08-28',mates:['zhe','yu','classmate_bohan'],
    ask:{day:'2027-07-20',h:21,ms:[['zhe','8/21 我回去 然後我們去香港啦'],['zhe','25 到 28 我查好了 便宜的那班'],['yu','我要去！！我要吃蛋塔！！'],['classmate_bohan','25 號可以。我 24 號晚上上來。'],['heroine_01','我那幾天在京都。你們去，拍照給我。'],['classmate_bohan','行程我來排？'],['zhe','不要 這次不排 走到哪吃到哪'],['classmate_bohan','……好。我只排第一天。'],['classmate_xinci','我請不到假。幫我買蛋塔。'],['heroine_03','店裡走不開。……你們拍麵給我看。']]},
    datingMsg:{heroine_01:{day:'2027-08-27',h:21,ms:['📷（京都車站的月台）','明天回去。……香港好玩嗎？']}},
    yes:'我也去。', no:{t:'我那幾天不行。',r:[['zhe','靠 好啦 下次']]},
    nudge:{day:'2027-08-01',h:20,ms:['香港 你到底要不要'],until:'2027-08-03'},
    steps:[{d:0,h:15,lines:[{narr:'（地鐵的門關得很快。你差一點被夾到。）'},{who:'yu',text:'（在門外）欸——！'},{narr:'（門關了。Alison 在月台上揮手，越來越遠。）'},{who:'classmate_bohan',text:'……下一站等她。我第一天的行程有寫「走散的話在下一站等」。'}]},
           {d:1,h:14,lines:[{narr:'（茶餐廳的阿姐收菜單收得很快，你還沒講完她就走了。……東西來得也很快。）'},{who:'zhe',text:'這個奶茶比我們的濃。'},{who:'classmate_bohan',text:'甜度沒有比較高。是茶比較濃。'},{who:'zhe',text:'你喝個奶茶也要分析喔。'}]},
           {d:2,h:20,lines:[{narr:'（海邊的步道，對岸的大樓一棟一棟亮起來。）'},{who:'yu',text:'蛋塔買了沒？芯慈的。'},{who:'zhe',text:'買了。我買了兩盒，一盒在路上吃掉了。'},{who:'classmate_bohan',text:'（看著對岸）……第二天以後都沒排，結果也走完了。'}]}],
    back:{h:21,ms:[['zhe','（照片：兩盒蛋塔，一盒是空的）'],['classmate_xinci','空的那盒是我的嗎？'],['zhe','……明天補給妳'],['heroine_03','（照片：麵店的長桌，空著）……你們不在，今天的蛋用得比較少。']]},
    missPhoto:{d:0,h:16,ms:[['zhe','（照片：隔著地鐵的車門玻璃，Alison 站在月台上，手舉得很高）'],['zhe','第一天就丟一個'],['yu','是門自己關的！！']]},   /* 沒去的玩家看到的第一天照片（AA_256@247198e8 AA 定稿）*/
    missTail:[['zhe','下次你一定要來 欠一次']]};
  /* 大一暑假的訊息（AA_241 第 4、6、7 節）：VA-05 Alison 的營隊、VA-02 返鄉回臺北、VA-11 交往中的反應 */
  const MSGS=[
    {tag:'va05_1',day:'2026-07-06',h:21.5,th:'g:noodle_team',ms:[{from:'yu',text:'📷（山上的營地，一排帳篷）'},{from:'yu',text:'隊輔第一天 我已經沒聲音了'}]},
    {tag:'va05_2',day:'2026-07-10',h:22,th:'g:noodle_team',ms:[{from:'yu',text:'📷（白板上小朋友畫的老虎，歪歪的）'},{from:'yu',text:'這是我'},{from:'zhe',text:'很像'}]},
    {tag:'va05_3',day:'2026-07-14',h:23+10/60,th:'g:noodle_team',ms:[{from:'yu',text:'晚會我被叫上去跳舞'},{from:'yu',text:'沒有影片 不要找'}]},
    {tag:'va05_4',day:'2026-07-18',h:20,th:'g:noodle_team',ms:[{from:'yu',text:'回來了'},{from:'yu',text:'明天要睡十二個小時'}]},
    {tag:'va02_1',day:'2026-06-27',h:20,th:'g:noodle_team',ms:[{from:'classmate_bohan',text:'我回新竹了。週四在總圖三樓。'}]},
    {tag:'va02_2',day:'2026-06-30',h:22,th:'g:noodle_team',ms:[{from:'zhe',text:'明天回高雄'},{from:'zhe',text:'麵店團不能斷喔'}]},
    {tag:'va02_3',day:'2026-07-25',h:15,th:'p:heroine_01',min:['heroine_01','FAMILIAR'],ms:[{from:'heroine_01',text:'📷（高鐵窗外的田）'},{from:'heroine_01',text:'回台中了。8 號回去。'}]},
    {tag:'va02_4',day:'2026-08-08',h:21,th:'p:heroine_01',min:['heroine_01','FAMILIAR'],ms:[{from:'heroine_01',text:'回臺北了。台中好熱。'}]},
    {tag:'va02_5',day:'2026-08-21',h:19,th:'g:noodle_team',ms:[{from:'zhe',text:'我回來了'},{from:'zhe',text:'誰要吃麵'}]},
    /* VA-11 交往中的反應（以安、語彤；她也講自己在做什麼，不吃醋）*/
    {tag:'va11_camp_an',day:'2026-07-03',h:22.5,th:'p:heroine_01',dating:'heroine_01',vac:'C02',ms:[{from:'heroine_01',text:'營隊第三天了。你有睡覺嗎？'},{from:'heroine_01',text:'……我是問真的。'}]},
    {tag:'va11_camp_yt',day:'2026-07-03',h:22.5,th:'p:heroine_03',dating:'heroine_03',vac:'C02',ms:[{from:'heroine_03',text:'營隊結束來店裡'},{from:'heroine_03',text:'阿姨問你去哪了'}]},
    /* C05 日本五天的 va11_jp_an、va11_jp_yt、va11_jpb_yt 拿掉（AA_313 4-3、4-4「拿掉 va11_jp_*」）：出國輪播（TRIP_MSG）照樣跑，8/24「到了傳一張照片。一張就好。」、8/28「回來了嗎」原本同一天收到兩次；
       輪播保留（AA_369 第 7 節第 7 題：日本五天回來那天以安「明天有空的話，一起吃飯。」照傳）*/
    {tag:'va11_video_an',day:'2026-07-30',h:21.5,th:'p:heroine_01',dating:'heroine_01',ms:[{from:'heroine_01',text:'我媽在後面。……她說嗨。'},{from:'heroine_01',text:'她問你吃飽了沒。我說你一定吃了。'}]},
    {tag:'va11_exam_yt',day:'2026-06-18',h:18,th:'p:heroine_03',dating:'heroine_03',ms:[{from:'heroine_03',text:'考完了'},{from:'heroine_03',text:'憲法最後一題我寫不完'},{from:'heroine_03',text:'……不要問我分數 7/3 才知道'}]},
    /* va11_exam_yt：雙主修筆試 6/18 考完那天傍晚（AA_313 4-4，原本 6/19 中午）；收過這則的人，期末飯她只說「成績單七月三號才寄。」（termend_lines.js POOL.Y1S2）*/
    {tag:'va11_idle_an',day:'2026-07-31',h:21,th:'p:heroine_01',dating:'heroine_01',idle:true,ms:[{from:'heroine_01',text:'你這個暑假在做什麼？'},{from:'heroine_01',text:'我不是在檢查。我在想要不要排一天一起去哪裡。'}]},
    {tag:'va11_idle_yt',day:'2026-07-31',h:21,th:'p:heroine_03',dating:'heroine_03',idle:true,ms:[{from:'heroine_03',text:'你暑假是不是很閒'},{from:'heroine_03',text:'那明天下午陪我去進貨'}]} ];
  /* ===== 登機以後的「飛往〇〇」字卡（AA_478 第 1 節、1-1，企劃線 f1afaf4f1）：E08 3D 出境大廳「登機」（或一小時以後自動登機）以後、第一張日期卡以前出（src/vac3d.js S.flyCard），
     格式同日本路線的 GM.titleCard('飛往日本','關西　約 3 小時')：[第一行, 第二行]，第二行地名和「約」中間是全形空白。
     T02 的稿子沒寫到哪一座山、飛哪一個機場：第二行只寫時間，不編地名。C13（手機自己排的出國旅遊）照目的地：TRAVEL.dest 的 fly；和女朋友、朋友一起去的字卡一樣 */
  const FLY={ C05:['飛往日本','東京　約 3 小時'], T02:['飛往日本','約 3 小時'], T03:['飛往泰國','曼谷　約 4 小時'], C08:['飛往韓國','首爾　約 2 小時半'], C09:['飛往柬埔寨','約 4 小時'],
    C10:['飛往美國','加州　約 12 小時'], C11:['飛往日本','東京　約 3 小時'], C12:['飛往日本','關西　約 3 小時'], C18:['飛往新加坡','約 4 小時半'], C18W:['飛往新加坡','約 4 小時半'] };
  for(const id in FLY) if(A[id]) A[id].fly=FLY[id];
  const FLY13={ jp:['飛往日本','東京　約 3 小時'], kr:['飛往韓國','首爾　約 2 小時半'], th:['飛往泰國','曼谷　約 4 小時'], vn:['飛往越南','河內　約 3 小時'], hk:['飛往香港','約 1 小時半'], eu:['飛往歐洲','約 14 小時'], us:['飛往美國','約 12 小時'] };
  for(const k in FLY13) if(TRAVEL.dest[k]) TRAVEL.dest[k].fly=FLY13[k];
  VA10.fly=['飛往香港','約 1 小時半'];
  return {A,MSGS,TRIP_MSG,TRAVEL,C01,VA09,VA10,src:'AA_241（企劃線 c524b61e 以前的版本；第 1～7 節）＋AA_242（AA 分支 18fe1b6a：C08～C12；ede67b34 第 9～11 節：C16～C18；56a36a4d 第 12 節：C16～C18 的裁定與補字）'};
})();
