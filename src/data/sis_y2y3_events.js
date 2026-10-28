/* ===== 學姊大二到大三的空窗（AA_379 第 2 節，企劃線 30ab5142；AA 2026-10-22 定稿；任務 AA379-SIS-Y2Y3-1021；使用者 10-21 22:5x「學姊才是真正的女主角」）=====
   她碩一、碩二那兩年補八場。台詞照 AA_379 一字不改（SISY23_LINES）；事件在 SISY23_EVENTS。手機、出遊、說話前接演的接線在 src/sis_y2y3_3d.js。
   2-1 ev_sis_lab_desk（大二上 9/21 私訊 → 9/22 12:20 研究室）　2-2 ev_sis_seminar_y2（11/17 私訊 → 11/18 19:00 法圖討論室）
   2-3 想寫的東西（大二下第 5～10 週，在法圖或 Café 第一次找她說話時接在前面演；第 11 週週三 21:00 私訊 → ev_sis_topic_steps 法圖外面的台階）
   2-4 她的生日 6/2（2026、2027）：ev_sis_bday_y1／ev_sis_bday_y2（當天晚上在她讀書的地方找她說話）、ev_sis_bday_date_y1／y2（交往中：前一天約、法圖旁邊那家）
   2-5 ev_sis_interview（大三上 10/15 私訊 → 10/16 09:00 法扶）　2-6 明年夏天（11/1～11/9 第一次找她說話時接在前面演；都沒遇到 11/11 私訊 → ev_sis_us_told_steps 11/12 12:20 總圖門口的台階）
   2-7 ev_sis_us_result（大三下 3/15 21:30 她打電話來）
   3-2 ev_sis_predepart（臺灣路線，2028-07-28 21:00 私訊 → 7/29 15:00 公館買行李箱的鎖；AA_379 3-2，企劃線 d037c668）
   每一場都分「一般」「交往中」；沒有熟悉（FAMILIAR）以上就不演（2-3、2-5、2-7 是朋友以上），不加門檻、不鎖線；錯過都不扣關係。
   測試：node tests/aa379_sis_y2y3_unit.js */
'use strict';
const SISY23_LINES={
  /* 2-1 研究室靠門的位子（大二上第 3 週，碩一）*/
  labAsk:['明天中午有空嗎。','研究室分到位子了。書有兩箱，電梯在修。'], labYes:'好。', labNoT:'明天中午有課。', labNo:'好。我自己搬兩趟。',
  labMissed:['📷（排好的書架）','搬完了。'],
  /* 2-2 第一次 seminar 報告（大二上第 11 週，碩一）*/
  semAsk:['明天晚上七點，法圖的討論室。','我要練一次 seminar 的報告。需要一個不是法研所的人聽。'], semYes:'好。', semNoT:'明天晚上不行。', semNo:'好。那我對著牆講。',
  semMissed:'講完了。牆沒有意見。',
  /* 2-3 想寫的東西（大二下第 5～10 週，碩一）：第 10 週還沒遇到＝第 11 週週三 21:00 私訊 */
  topicAsk:'法圖外面的台階。等你十分鐘。',
  /* 2-4 她的生日（6/2）：12:10 家族群組 Kevin；交往中前一天 21:00 私訊 */
  bdayKevin:'今天溫學姊生日🎂', bdayKevin2:'今天溫學姊生日🎂🎂 去年一個蛋糕，今年兩個。',   /* bdayKevin2：2027 那一則（AA_461 第 2 節：大一下、大二下原本一字不差；2026 照舊）*/
  bdayAsk:['明天我生日。','晚上七點，法圖旁邊那家。我訂了。'],
  /* 2-5 訪談（大三上第 6 週，碩二）*/
  ivAsk:['明天早上九點，我要去訪談一位法扶的律師。','需要一個人幫我做筆記。你打字比我快。'], ivYes:'好。', ivNoT:'明天早上不行。', ivNo:'好。我錄音。',
  ivMissed:'訪談完了。錄音有雜音，我自己聽了兩遍。',
  /* 2-6 明年夏天：11/1～11/9 都沒遇到＝11/11（四）21:00 私訊 */
  usAsk:'明天中午，總圖門口的台階。',
  /* 3-2 出國前最後一個週六（2028-07-29；AA_379 3-2，企劃線 d037c668）：7/28（五）21:00 私訊 */
  preAsk:['明天下午有空嗎。','我要去買行李箱的鎖。……順便走一走。'], preYes:'好。', preNoT:'明天下午不行。', preNo:'好。我自己去。',
  preMissed:['📷（一個普通的行李箱鎖）','買好了。'],
  /* AA_392 第 5 節（企劃線 e81a1afe1）：第二次訪談——第一次選了「下次還要記嗎？」的（SIS_IV_AGAIN）*/
  iv2Ask:['週六早上十點，有第二次訪談。這次是當事人。','你說要記的。'], iv2Yes:'好。', iv2YesSay:'十點，社區活動中心。我傳地址給你。', iv2NoT:'那天不行。', iv2No:'好。我自己記。',
  iv2Missed:'記完了。' };
const SISY23_EVENTS=(function(){
  const L=SISY23_LINES, ID='heroine_05';
  const dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const dt={custom:G=>dating(G)}, SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t});
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  /* 2-3 的台詞（說話前接演、台階那一版共用）*/
  const TOPIC=[ SIS('我想寫的東西，找到了。'),
    SIS('債務清理案件的法律扶助。……題目還要再改，方向不會變了。'),
    {if:{flagIs:{SIS_SEMINAR_Y2:'asked'}},speaker:ID,text:'你上次問我為什麼。……我想好怎麼講了。'},   /* 2-2 問過「妳為什麼選這個題目？」的 */
    SIS('我大二在法服的時候，有一個阿姨拿著一袋信來。全部是銀行寄的。最舊的那一封，是我國小的時候寄的。'),
    SIS('我只能跟她說，這個要去找法扶。'),
    SIS('她說她去過了。排了很久。'),
    SIS('我想知道『很久』是多久。……還有為什麼要那麼久。'),
    {choice:[{text:'「那妳查到了嗎？」',goto:'tp_a'},{text:'「那個阿姨後來呢？」',goto:'tp_b'}]},
    {label:'tp_a'},SIS('還沒。所以要寫兩年。'),{goto:'tp_end'},
    {label:'tp_b'},SIS('……我不知道。那天以後，就沒再見過她。'),
    {label:'tp_end'},{if:dt,speaker:ID,text:'我爸媽還不知道。……他們會問，寫這個以後要做什麼。'},
    {mem:[{npc:ID,tag:'SIS_TOPIC',note:''}]},{set:{SIS_TOPIC_Y2:true}} ];
  /* AA_386 第 2 節（企劃線 e848154a；AA_379 2-6 已加註）：聽過她提美國的——大二下閒聊階梯學姊的進度已經過了 S4-Lx（「碩三上，我想去美國交換一學期。」）、
     或有記憶 SIS5_EXCHANGE_APP（大三上 S5-L1「我在寫交換的申請。」）、或 AA_386 1-2 選了「學姊現在還可以去啊。」（SIS_ADV_EXCH go）——一般版那一句換成兩句；都沒聽過的照原句 */
  const heardUS=G=>{ const F=(G&&G.flags)||{}; if(F.SIS_ADV_EXCH==='go') return true; if(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(ID,'SIS5_EXCHANGE_APP')) return true;
    const St=typeof LADDER!=='undefined'&&LADDER.byTerm&&LADDER.byTerm.Y2S2&&LADDER.byTerm.Y2S2[ID]&&LADDER.byTerm.Y2S2[ID].steps, i=Array.isArray(St)?St.findIndex(s=>s&&s.id==='S4-Lx'):-1, P=G&&G.social&&G.social.ladder;
    return i>=0&&!!P&&(P[ID+'@Y2S2']|0)>i; };   /* 階梯的進度＝G.social.ladder['heroine_05@Y2S2']（下一層的位置；story3d.js ladData 的 key）*/
  /* 2-6 的台詞（說話前接演、台階那一版共用）*/
  const US=[ SIS('明年夏天，我想去美國待一個學期。研究交換。'),
    SIS('八月走，十二月回來。論文的第四章，要在那邊寫。'),   /* AA_509 0-2 第 1 點（691a26400）：她上飛機前看完第三章（r2y4a_events）*/
    {unless:{custom:G=>dating(G)||heardUS(G)},speaker:ID,text:'計畫本上寫了很久。今天才決定要跟人說。'},
    {if:{custom:G=>!dating(G)&&heardUS(G)},speaker:ID,text:'之前跟你提過。'},
    {if:{custom:G=>!dating(G)&&heardUS(G)},speaker:ID,text:'……申請送出去了。今天才覺得是真的。'},
    {unless:dt,choice:[{text:'「去啊。」',goto:'us_a'},{text:'「那妳會回來吧？」',goto:'us_b'}]},
    {if:dt,speaker:ID,text:'你們系的交換名單，美國那間我查過了。跟我同一個學期。'},
    {if:dt,speaker:ID,text:'你如果去，我們同一班飛機。'},
    {if:dt,choice:[{text:'「好。」',goto:'us_c'},{text:'（握住她的手）',goto:'us_d'}]},
    {label:'us_a'},SIS('嗯。'),N('（她把計畫本闔上）'),SIS('……你說得好簡單。'),{goto:'us_end'},
    {label:'us_b'},SIS('十二月。回程的日子，計畫本上寫好了。我不會改。'),{goto:'us_end'},
    {label:'us_c'},SIS('……好。志願表十八號截止。'),{goto:'us_end'},
    {label:'us_d'},N('（她沒有說話。手翻過來，握回去。）'),
    {label:'us_end'},{mem:[{npc:ID,tag:'SIS_US_TOLD',note:''}]} ];
  /* 2-4 生日的一段（一般、交往中共用；year＝2026 'y1'／2027 'y2'）*/
  const bday=(year,date)=>[ ...(date?[SIS('我自己訂的。我知道你會想訂，可是你會訂錯家。')]:[N('（她在讀書。保溫瓶旁邊多了一小盒蛋糕，還沒拆。）')]),
    SIS('群組那則看到了吧。Kevin 每年都發。'),
    ...(year==='y1'?[SIS('下禮拜畢業。……之後還是在這裡讀書，只是換一張學生證。')]:[{if:{flagIs:{SIS_LAB_DESK:'went'}},speaker:ID,text:'碩一過完一年了。研究室那張靠門的椅子，我換了一個坐墊。'}]),
    {choice:[{text:'「生日快樂。」',goto:'bd_a'},{text:'（遞給她一包茶葉）',goto:'bd_b'},{text:'（把她的保溫瓶拿去裝滿熱水）',goto:'bd_c'}]},
    {label:'bd_a'},SIS(date?'謝謝。……你今天穿得比平常好看。':'謝謝。……蛋糕分你一半，我吃不完。'),{set:{['SIS_BDAY_'+year.toUpperCase()]:'there'}},{goto:'bd_end'},
    {label:'bd_b'},SIS('（看了一下包裝）這家我喝過。……你怎麼知道。'),{speaker:'player',text:'妳保溫瓶的味道。'},SIS('……好。'),N('（她收進包包）'),{set:{['SIS_BDAY_'+year.toUpperCase()]:'tea'}},{goto:'bd_end'},
    {label:'bd_c'},SIS('這不算禮物。'),SIS('……算。'),{set:{['SIS_BDAY_'+year.toUpperCase()]:'water'}},
    {label:'bd_end'},...(date?[N('（回去的路上，她走得比平常慢。）')]:[]) ];
  const X=()=>typeof SISY23!=='undefined'?SISY23:null;
  return [
    /* ---------- 2-1 9/22（二）12:20 霖澤館・研究室（地點、背景照 ev_sis_plan_lab）---------- */
    { id:'ev_sis_lab_desk', title:'研究室靠門的位子', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'霖澤館・研究室',bg:'linze_prof_hall'},
        N('（研究室有八張桌子。她的在門邊，門一開就撞到椅背。）'),
        SIS('靠門的位子。每個人進來都會撞到我。'),
        SIS('……也好。誰來了我都知道。'),
        N('（你把兩箱書搬上桌。她一本一本排上書架，照顏色。）'),
        {choice:[{text:'「照顏色排？」',goto:'a'},{text:'（幫她把最重的那一排推進去）',goto:'b'}]},
        {label:'a'},SIS('照顏色好找。照作者，我會一直想要不要調整。'),{goto:'end'},
        {label:'b'},SIS('……謝謝。你比電梯可靠。'),
        {label:'end'},{if:dt,speaker:null,text:'（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，我在這裡。」）'},   /* AA_392 第 4 節乙：研究室樓層（5F～8F）3D 還走不到、她的作息平日白天在總圖三樓——便條寫她真的在的地方 */{if:dt,speaker:ID,text:'……你的。'},
        {set:{SIS_LAB_DESK:'went'}} ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'lab'); } },
    /* ---------- 2-2 11/18（三）19:00 法圖・討論室（她週三晚上本來就在法圖）---------- */
    { id:'ev_sis_seminar_y2', title:'第一次 seminar', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'法圖・討論室'},
        N('（白板上寫著她的報告題目，字很小。她站在白板前，手上是幾張講稿。）'),
        SIS('二十分鐘。中間不要問，最後再問。'),
        N('（她講了十九分鐘。講到一半，停下來喝了一口保溫瓶。）'),
        SIS('好了。……哪裡聽不懂？'),
        {choice:[{text:'「中間那段，數字太多了。」',goto:'a'},{text:'「都聽得懂。」',goto:'b'},{text:'「妳為什麼選這個題目？」',goto:'c'}]},
        {label:'a'},SIS('（在講稿上劃掉一整段）……我也覺得。只是捨不得。'),{set:{SIS_SEMINAR_Y2:'went'}},{goto:'end'},
        {label:'b'},SIS('（看了你一眼）你上課也都說聽得懂。'),{set:{SIS_SEMINAR_Y2:'went'}},{goto:'end'},
        {label:'c'},SIS('……這是最後才要問的問題。你先問了。'),SIS('下次再回答你。我還沒想好怎麼講。'),{set:{SIS_SEMINAR_Y2:'asked'}},
        {label:'end'},{if:dt,speaker:ID,text:'你坐第一排，我比較不會看錯地方。'},
        SIS('好。我回去改。……你先回宿舍，很晚了。') ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'sem'); } },
    /* ---------- 2-3 第 11 週週三：法圖外面的台階（第 5～10 週沒遇到的，私訊來；可以略過）---------- */
    { id:'ev_sis_topic_steps', title:'想寫的東西', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'法圖外面的台階'} ].concat(TOPIC) },
    /* ---------- 2-4 6/2 晚上：在她讀書的地方找她說話（2026 週二＝Café、2027 週三＝法圖）；熟悉以上、沒在交往 ---------- */
    { id:'ev_sis_bday_y1', title:'她的生日', participants:[ID], location:['cafe','lawlib'], trigger:'interact', priority:9, once:true, background:'blur',
      prereq:{custom:G=>{ const x=X(); return !!x&&x.bdayTalkDue(G,'y1'); }}, dialogue:bday('y1',false) },
    { id:'ev_sis_bday_y2', title:'她的生日', participants:[ID], location:['cafe','lawlib'], trigger:'interact', priority:9, once:true, background:'blur',
      prereq:{custom:G=>{ const x=X(); return !!x&&x.bdayTalkDue(G,'y2'); }}, dialogue:bday('y2',false) },
    /* ---------- 2-4 交往中：前一天 21:00 她約，6/2 19:00 法圖旁邊那家 ---------- */
    { id:'ev_sis_bday_date_y1', title:'她的生日', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'法圖旁邊的簡餐'} ].concat(bday('y1',true)),
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'bday_y1'); } },
    { id:'ev_sis_bday_date_y2', title:'她的生日', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'法圖旁邊的簡餐'} ].concat(bday('y2',true)),
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'bday_y2'); } },
    /* ---------- 2-5 10/16（六）09:00 法扶・臺北的辦公室 → 便利商店門口的桌子 ---------- */
    { id:'ev_sis_interview', title:'訪談', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:'法扶・臺北的辦公室',bg:'legal_aid_office'},
        N('（會議室很小。律師講了一個半小時，你打了十一頁。）'),
        {scene:'便利商店門口的桌子',bg:'dark'},
        N('（她把你的筆記從頭滑到尾。）'),
        SIS('你多寫了一句：『他講到這裡，停了很久。』'),
        SIS('……這句我要。錄音裡聽不到這個。'),
        {choice:[{text:'「他停下來的時候，在想什麼？」',goto:'a'},{text:'「下次還要記嗎？」',goto:'b'}]},
        {label:'a'},SIS('在想一個當事人。他沒說是誰。'),SIS('……我也沒問。'),{goto:'end'},
        {label:'b'},SIS('要。'),SIS('……你有空的話。'),{set:{SIS_IV_AGAIN:true}},   /* AA_392 第 5 節：記下來，11/24 約第二次訪談 */
        {label:'end'},{if:dt,speaker:null,text:'（她把你的筆記存進雲端，資料夾的名字是「{name}記的」。）'},
        {mem:[{npc:ID,tag:'SIS_INTERVIEW',note:''}]},{set:{SIS_INTERVIEW:'went'}} ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'iv'); } },
    /* ---------- AA_392 第 5 節：2027-11-27（六）10:00 社區活動中心・小房間（第二次訪談，當事人）；不寫訪談內容的法律細節（AA_188）---------- */
    { id:'ev_sis_interview2', title:'第二次訪談', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:'社區活動中心・小房間',bg:'community_room'},
        N('（一個五十幾歲的男人，手上一直轉著一支原子筆。）'),
        SIS('他同意錄音。你一樣要記。'),
        N('（他講了一個多小時。講到他太太的時候，原子筆停了。）'),
        {scene:'社區活動中心門口',bg:'dark'},
        SIS('你記到哪裡？'),
        {choice:[{text:'「他太太那段。」',goto:'a'},{text:'「他的原子筆。」',goto:'b'}]},
        {label:'a'},SIS('……那段我不會寫進論文。'),SIS('可是我要記得。'),{goto:'end'},
        {label:'b'},N('（她看了一下你的筆記。）'),SIS('我也看到了。'),
        {label:'end'},N('（她去便利商店買了兩杯咖啡，一杯給你。）'),SIS('今天的工資。'),
        {set:{SIS_INTERVIEW2:'went'}} ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'iv2'); } },
    /* ---------- 2-6 11/12（五）12:20 總圖門口的台階（第一次見面的那個台階；11/1～11/9 都沒遇到的）---------- */
    { id:'ev_sis_us_told_steps', title:'明年夏天', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'總圖門口的台階'} ].concat(US,[{set:{SIS_US_TOLD:'steps'}}]) },
    /* ---------- 2-7 3/15（三）21:30 她打電話來（朋友以上；臺灣、美國路線，日本路線 3/25 才出發）---------- */
    /* 3-2 出國前最後一個週六：7/29（六）15:00 公館（AA_379 3-2）；結尾照 7/26 群組那則有沒有按「我送妳。我有車。」（SIS_RIDE_ASK）*/
    { id:'ev_sis_predepart', title:'出國前最後一個週六', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'公館・騎樓',bg:'gongguan'},
        N('（騎樓下。她挑鎖挑了很久，最後買了最普通的那一個。）'),
        /* AA_512 第 2 節第 4 點（企劃線 c444f0757）：3/15 結果的電話選過「要慶祝嗎？」（SIS_US_CELEB）的，買完鎖以後多一段（aa512：tests/aa512_sis_b13_unit.js 對稿）*/
        {unless:{flags:['SIS_US_CELEB']},goto:'cel_e'},
        Object.assign(SIS('三月你說要慶祝。……我排完了。'),{aa512:true}), Object.assign(SIS('今天這樣，算嗎？'),{aa512:true}),
        {choice:[{text:'「算。」',goto:'cel_a',aa512:true},{text:'「不算，要吃飯。」',goto:'cel_b',aa512:true}]},
        {label:'cel_a'}, Object.assign(SIS('好。……那我請你喝一杯。'),{aa512:true}), {goto:'cel_e'},
        {label:'cel_b'}, Object.assign(SIS('……那現在去吃。你選。'),{aa512:true}),   /* AA_512 第 7 節第 11 點：鎖已經買了 */
        {label:'cel_e'},
        SIS('那邊沒有騎樓。下雨要自己撐傘。'), SIS('……我傘帶了兩把。一把會忘在某個地方。'),
        {choice:[{text:'「四個多月很快。」',goto:'pa'},{text:'「會想回來嗎？」',goto:'pb'}]},
        {label:'pa'}, SIS('嗯。……計畫本排到十二月了，排完就覺得很快。'), {goto:'pc'},
        {label:'pb'}, SIS('會想 Café 的熱水。……那邊的飲水機要按很久。'),
        {label:'pc'},
        {if:dt,speaker:ID,text:'四個多月。……視訊我排好了，每個禮拜一次。'}, {if:dt,speaker:ID,text:'時差你不要算，我來算。'},   /* 交往中（臺灣路線，2027-11-18 以後才在一起的）*/
        {if:{custom:G=>!!G.flags&&G.flags.SIS_RIDE_ASK==='yes'},goto:'ride'},
        SIS('群組那則，是寫給大家的。'), N('（她看了你一眼，沒有再說。）'), {goto:'pe'},
        {label:'ride'}, SIS('你說要載我。……早上八點，我家樓下。不要遲到。'),
        {label:'pe'}, {set:{SIS_PREDEPART:'went'}} ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'pre'); } },
    { id:'ev_sis_us_result', title:'結果', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
      dialogue:[ {scene:'電話'},
        SIS('……上了。'),
        {unless:dt,speaker:ID,text:'信是下午來的。我看了好幾遍，確定沒有看錯，才打給你。'},
        {unless:dt,speaker:ID,text:'八月二號的飛機。……還沒訂，先把日子想好。'},
        {unless:dt,choice:[{text:'「恭喜。」',goto:'a'},{text:'「要慶祝嗎？」',set:{SIS_US_CELEB:true},goto:'b'}]},   /* AA_512 第 2 節第 4 點：選「要慶祝嗎？」記 SIS_US_CELEB（7/29 買鎖那天兌現，ev_sis_predepart）*/
        {if:{custom:G=>dating(G)&&route(G)==='US'},speaker:ID,text:'八月二號。我們同一班。'},
        {if:{custom:G=>dating(G)&&route(G)!=='US'},speaker:ID,text:'八月二號。……你要來送我。'},
        {if:dt,choice:[{text:'「恭喜。」',goto:'c'},{text:'「我現在過去。」',goto:'d'}]},
        {label:'a'},SIS('嗯。……我以為我會比較高興。現在只想到，要在那邊待四個多月。'),{goto:'end'},
        {label:'b'},SIS('要。……等我把八月以前的事排完。'),{goto:'end'},
        {label:'c'},SIS('嗯。……你先不要掛。我想再聽一下你那邊的聲音。'),{goto:'end'},
        {label:'d'},SIS('很晚了。……明天中午，研究室。'),
        {label:'end'},{set:{SIS_US_RESULT:'call'}} ],
      outingMissed:G=>{ if(G.flags.SIS_US_RESULT==null) G.flags.SIS_US_RESULT='missed'; } } ].concat([
    /* 說話前接演的兩段（src/sis_y2y3_3d.js 的 preTalk 用 EVENTS.runLines 演；這兩筆只放台詞，不會自己觸發）*/
    { id:'ev_sis_topic', title:'想寫的東西', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:TOPIC },
    { id:'ev_sis_us_told', title:'明年夏天', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:US.concat([{set:{SIS_US_TOLD:'here'}}]) } ]);
})();
for(const e of SISY23_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
