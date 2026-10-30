/* ===== 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54（AA-C 定稿 e284d601，第②級；台詞照原文、不改字）=====
   這裡是用事件系統演的段落（出遊、在場景裡碰到的、電話、視訊）；手機、時間窗、出發選單、寒暑假的停留日、學期末專屬版在 src/r2y3b3d.js（R2Y3B）。
   2-Y3-26 ev_y3s2_first_meal　27 ev_y3s2_228　28 ev_an_azalea_y3　29 ev_yu_club_money　30 ev_kexin_k18（＋ev_kexin_k18_call）
   2-Y3-31 ev_xun_path　33 ev_yu_alone_breakfast（＋_call）　34 ev_an_konbini　35 ev_liheng_japan　36 ev_y3s2_roof_toast　37 ev_an_sakura_riverbank
   2-Y3-38 ev_far_call_jp（美國版 ev_far_call_us：AA_412 第 2 節）　39 ev_yu_alone_movie（傅鐘／麵店／視訊）　40 ev_zhiruo_third_row　41 ev_kexin_birthday_y3　42 ev_xinci_first_place（＋_video）
   2-Y3-43 ev_an_town_notice（＋ev_an_town_notice_repair）　44 ev_kexin_k20（＋_call）　45 ev_fangyt_tickets（電話）、ev_zhiruo_f3_cafe
   2-Y3-51 ev_x1_moveout_us　52 ev_an_abroad_video、ev_an_tanabata、ev_an_airport_y3、ev_an_notebook　53 ev_an_white_day、ev_an_far_video
   2-Y3-54 ev_zhiruo_twelve_slips（BB_165 3-2，AA-C 10-18 審過的台詞）、沒到的 ev_zhiruo_slips_bar（她從吧檯下面拿）／ev_zhiruo_slips_owner（老闆給；AA_343 D8）；46 Z13 杯子的台詞（ALL.Z13、Z13_TXT）、47 Q15 的台詞（ALL.Q15）在檔尾，流程在 r2y3b3d.js 接 TERMEND；
   47 Q15 的兩通電話 ev_ziqing_exe_call（回了貼紙）、ev_ziqing_noreply_call（到期限沒回）在檔尾（AA_296 2-3-1 ②）。
   不重做：32（AA_322）、48（AA_317）、50（AA_322、AA_323）。測試：node tests/r2y3b_events_unit.js */
'use strict';
const R2Y3B_EVENTS=(function(){
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const kn=(...ids)=>({custom:G=>ids.every(id=>knows(id,G))});
  const stAt=(G,id,st)=>knows(id,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=(id,st)=>({custom:G=>stAt(G,id,st||'FAMILIAR')});
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const dt=id=>({custom:G=>dating(G,id)});
  const strainedAn=G=>{ const R=(G&&G.flags&&G.flags.romance&&G.flags.romance.heroine_01)||null; return !dating(G,'heroine_01')&&!!R&&['ex','paused','friend_after_catch'].includes(R.status); };   /* 和以安挽回中、冷靜中（同 jp3d.js 的 strained；AA_377 第 7 項）*/
  const plg=G=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group');   /* 參加過公法讀書會（AA_377 第 3 項）*/
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const JP={custom:G=>route(G)==='JP'};
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const cg=id=>({if:{custom:()=>hasCG(id)},cg:id});   /* CG 登錄了才放（CG_REGISTRY；沒有就照原背景演）*/
  const X=()=>typeof R2Y3B!=='undefined'?R2Y3B:null;
  const AN_KNOWS={custom:G=>{ const x=X(); return !!x&&!!x.knowsOther&&x.knowsOther(G,'heroine_01'); }};   /* 以安知道祐廷正在和別人交往（MREL.knownOthers，沒有 OPEN_OK）：七夕告白先演知情對話（AA_474 3b）*/
  const fl=(k,v)=>({custom:G=>(G.flags||{})[k]===v});

  /* ---------- 2-Y3-26 開學第一頓（大三下）：2028-02-22（二）19:00 麵店長桌（17:00 阿哲揪；沒去＝21:30 群組照片）---------- */
  const FIRST_MEAL={ id:'ev_y3s2_first_meal', title:'開學第一頓（大三下）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的長桌。語彤在廚房門口，圍裙還沒脫。）'},
      {if:kn('zhe','heroine_01'),speaker:'zhe',text:'這學期以安只吃一個月。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'一個月又三天。三月二十五號的飛機。'},
      {if:kn('yu','heroine_01'),speaker:'yu',text:'那三月以前每一頓都要來喔。'},
      {if:kn('heroine_01','yu'),speaker:'heroine_01',text:'……好。週二、週四。'},
      {if:{custom:G=>route(G)==='JP'&&knows('zhe',G)&&knows('heroine_01',G)},speaker:'zhe',text:'（轉向你）你也是。一個月又三天。'},   /* 日本路線多一句 */
      {if:kn('heroine_03'),speaker:'heroine_03',text:'（端麵過來）……今天週二。週四我不在店裡了。'},
      {if:kn('heroine_03','zhe'),speaker:'zhe',text:'她週四有自己的事了。'},
      {choice:[{text:'「先吃。」',goto:'a'},{text:'「週四妳去哪？」',if:kn('heroine_03'),goto:'b'}]},
      {label:'a'},{if:kn('zhe'),speaker:'zhe',text:'對。先吃。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'……去問人問題。'},{speaker:null,text:'（她回廚房了。）'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_FIRST_MEAL:true},memo:'大三下的開學第一頓（麵店）'},
    outingMissed:G=>{ const x=X(); if(x) x.firstMealPhoto(G); } };

  /* ---------- 2-Y3-27 228 河濱：2028-02-28（一）14:00～17:00 公館河濱（2/27 21:00 阿哲揪；沒去＝17:30 Alison 在群組）---------- */
  const R228={ id:'ev_y3s2_228', title:'228 河濱', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（新店溪的河濱。Alison 的風箏飛了三次，掉了三次。）'},
      {if:kn('yu'),speaker:'yu',text:'風不對！不是我的問題！'},
      {if:kn('zhe','yu'),speaker:'zhe',text:'（躺在草地上）妳的問題。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（坐在階梯上，手帳攤開）三月二十五號以前，還有四個週末。'},
      {if:kn('classmate_bohan','heroine_01'),speaker:'classmate_bohan',text:'三個半。今天放假，不算。'},
      {choice:[{text:'「我來放。」',goto:'k'},{text:'（坐到以安旁邊）',if:kn('heroine_01'),goto:'a'},{text:'（躺到阿哲旁邊）',if:kn('zhe'),goto:'z'}]},
      {label:'k'},{if:kn('yu'),speaker:null,text:'（風箏飛起來了。Alison 把線搶過去：「看吧！是風的問題！」）'},{goto:'end'},
      {label:'a'},{if:{custom:G=>strainedAn(G)},speaker:null,text:'（以安看了你一眼，又低頭寫。）'},{if:{custom:G=>strainedAn(G)},goto:'end'},   /* AA_377 第 7 項：挽回中（和以安分手、冷靜中）不接話 */
      {speaker:'heroine_01',text:'……你也要算嗎？'},{speaker:null,text:'（她把手帳轉過來：四個週末，每一格都還空著。）'},{goto:'end'},
      {label:'z'},{speaker:'zhe',text:'這就對了。放假就是要躺。'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_228:true},memo:'228 的河濱（風箏）'},
    outingMissed:G=>{ const x=X(); if(x) x.r228Photo(G); } };

  /* ---------- 2-Y3-28 杜鵑花第三張：2028-03-09（四）12:00～12:40 椰林大道（以安的作息只有這一天，r2y3b3d.js 加）；和以安 FAMILIAR 以上、走過去和她說話 ---------- */
  const AZALEA={ id:'ev_an_azalea_y3', title:'四年，四張（第三張）', participants:['heroine_01'], location:'campus', trigger:'interact', priority:8, once:true, term:['Y3S2'], weeks:[3], weekday:[4], time:[12,12+40/60], background:'blur',
    prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}},
    dialogue:[ {speaker:null,text:'（椰林大道的杜鵑開了。以安拿著手機，站在和前兩年同一個位置。）'},
      {speaker:'heroine_01',text:'第三張。你幫我拍。'},
      {speaker:null,text:'（你拍了兩張。她看了一下。）'},
      {speaker:'heroine_01',text:'可以。花有拍到。'},
      {if:dt('heroine_01'),speaker:'heroine_01',text:'出發前我把這三張印出來帶走。'},   /* AA_71 2-9 原文 */
      {mem:[{npc:'heroine_01',tag:'AN3_AZALEA',note:''}]} ] };

  /* ---------- 2-Y3-29 C6 Alison 的社團經費：3/16（四）12:30～13:00 霖澤館一樓（3/15 21:00 她私訊、回「有。」才約；手機版在 r2y3b3d.js）---------- */
  const C6_OPTS=[{text:'「要學弟賠。」',set:{YU_C6:'pay'},goto:'p'},{text:'「把帳攤開，請大家補單據。」',set:{YU_C6:'open'},goto:'o'},
    {text:'「社團的錢是大家的。先照社團的規則，把收支表和單據放在一起。」',if:{flags:['U_ASSOC']},set:{YU_C6:'rule'},goto:'r'}];   /* U_ASSOC（民總的法人、社團；AA_117 第 2 節）才有第三個 */
  const C6={ id:'ev_yu_club_money', title:'社團的錢', participants:['yu'], location:'linze', trigger:'auto', once:true, npcPresent:'yu', background:'blur',
    prereq:{custom:G=>{ const x=X(); return !!x&&x.c6MeetDue(G); }},
    dialogue:[ {speaker:'yu',text:'欸，成發的錢對不起來。少了三千。經手的是學弟。'},
      {speaker:'yu',text:'我不想讓他覺得我在懷疑他。可是三千塊。'},
      {choice:C6_OPTS},
      {label:'p'},{speaker:'yu',text:'……他是學弟耶。我先不要這樣。'},{goto:'q'},
      {label:'o'},{speaker:'yu',text:'……好。這樣比較不像在抓人。'},{goto:'q'},
      {label:'r'},{speaker:'yu',expression:'laugh',text:'對！我們社團有規則！……我去找出來。'},
      {label:'q'},
      {speaker:'player',text:'妳真正想要的是什麼？'},
      {speaker:'yu',text:'……我想要帳對得起來，學弟也還會來社課。'},
      {speaker:'player',text:'那先找社團的指導老師。這個不用去法服。'},
      {stamp:['YU_C6_DAY']} ] };

  /* ---------- 2-Y3-30 可昕 K18「最輕鬆的一學期」：3/18（六）08:00 政大校門口出發，開車一天（3/15 21:30 她約）；沒到＝08:15 電話 ---------- */
  const wishKx=G=>!!(G.flags&&G.flags.WISH_DONE_kexin)||(typeof DATE!=='undefined'&&!!DATE.log&&!!DATE.log(G,'kexin').wish);   /* 去過外澳（她的心願地點） */
  const K18={ id:'ev_kexin_k18', title:'最輕鬆的一學期', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:11,
    dialogue:[ {scene:'車上',bg:'car_morning'},
      {unless:{custom:wishKx},speaker:'kexin',expression:'smile',text:'這次不排行程表。'},
      {if:{custom:wishKx},speaker:'kexin',expression:'smile',text:'這次也不排。跟外澳那次一樣。'},
      {scene:'山裡的舊車站',bg:'trip_oldrail'},   /* 2D trip_oldrail 待生成（G5-09）：沒有圖＝深色底＋地點字幕 */
      {speaker:null,text:'（山裡的舊車站。月台還在，鐵軌已經不走火車了。遠一點，是一座只剩橋墩的紅磚橋。）'},
      {speaker:'kexin',expression:'thinking',text:'這裡的火車，很久以前就不來了。'},
      {speaker:'kexin',expression:'sad',text:'……可是月台還在等。'},
      {choice:[{text:'「月台在等誰？」',goto:'a'},{text:'「走到那座斷橋？」',goto:'b'},{text:'（在月台上坐一下）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'embarrassed',text:'……不知道。我亂講的。'},{speaker:null,text:'（她笑了一下。）'},{speaker:'kexin',expression:'smile',text:'走啦，去看那座橋。'},{goto:'back'},
      {label:'b'},{speaker:null,text:'（你們走了四十分鐘。她在橋墩下站了很久。）'},{speaker:'kexin',expression:'tired',text:'……腳好痠。回去我要在車上睡。'},{goto:'back'},
      {label:'c'},{speaker:null,text:'（她把頭靠在你肩上，說了一句「好安靜」，就沒有再說話。）'},
      {label:'back'},{scene:'車上',bg:'car_night'},
      {speaker:'kexin',expression:'laugh',text:'下一站要去哪裡，回去再想。……不對，不想。'},
      {set:{KX_K18:'trip'}} ],
    consequences:{memo:'和可昕去山裡的舊車站（一天）'},
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.k18Missed(G,GM,q); } };
  /* 答應了、08:15 還沒到：演出來的電話（新寫）*/
  const K18_CALL={ id:'ev_kexin_k18_call', title:'可昕', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.05, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊有車子經過的聲音。）'},
      {speaker:'kexin',expression:'serious',text:'你在哪。'},
      {speaker:'player',text:'……還在家。'},
      {speaker:'kexin',expression:'annoyed',text:'……我叫予樂了。'},
      {speaker:null,text:'（她掛掉了。）'} ] };

  /* ---------- 2-Y3-31 SK13 阿勳的那條路：3/22（三）15:00～16:30 社科院的小教室（3/14 21:00 他私訊、回「我去。」才排；沒去＝16:40 照片）---------- */
  const XUN={ id:'ev_xun_path', title:'阿勳的那條路', participants:['econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'社科院的小教室',bg:'soc_classroom'},
      {speaker:null,text:'（社科院的小教室，坐了不到十個人。阿勳站在投影幕旁邊，手上拿著一張寫滿字的紙。）'},
      {speaker:null,text:'（你坐在最後一排。前二十分鐘，你聽懂了三張投影片。）'},
      {choice:[{text:'舉手問：「你怎麼確定那個數字是原因，不是巧合？」',set:{XUN_PATH_Q:'ask'},goto:'a'},{text:'散場後問他：「累不累？」',set:{XUN_PATH_Q:'tired'},goto:'b'},{text:'不問，報告結束時第一個鼓掌',set:{XUN_PATH_Q:'clap'},goto:'c'}]},
      {label:'a'},{speaker:'econ_zhengxun',text:'（愣了一下）……這是今天最好的問題。'},{goto:'end'},
      {label:'b'},{speaker:'econ_zhengxun',text:'累。可是我喜歡。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'（他看了你一眼，把那張紙摺起來。）'},   /* 新寫 */
      {label:'end'},
      {speaker:'econ_zhengxun',text:'你留下來的話，現在應該坐我旁邊。'},
      {speaker:'econ_zhengxun',text:'不過你現在的樣子比較好看。'},
      {if:{flags:['XUN_WARM']},speaker:'econ_zhengxun',text:'算出來那一下，還是很爽。'},
      {mem:[{npc:'econ_zhengxun',tag:'XUN_PATH',note:'聽了他的研究發表'}]} ],
    consequences:{memo:'阿勳的研究發表（社科院）'},
    outingMissed:G=>{ const x=X(); if(x) x.xunPhoto(G); } };

  /* ---------- 2-Y3-33 語 4「一個人的晚上」：第 3～6 週平日 9:30～12:00 傅鐘旁的長椅（經過就演）；沒遇到＝4/2（日）21:00 她打來（日本路線＝視訊）---------- */
  const YU4_TAIL=[ {speaker:'yu',text:'我算過了，我兩年沒有一個晚上是一個人。有社團，有阿哲，有麵店。'},
    {speaker:'yu',text:'我要考司法官。那個考試，要一個人坐在總圖一整年。'},
    {speaker:'yu',text:'所以我跟阿哲說，我想每週留一個晚上給自己。'},
    {speaker:'yu',text:'他說好。然後他問我要不要他幫我找好看的電影。'},
    {speaker:'yu',expression:'laugh',text:'（笑出來）我說，你幫我找，那就不是一個人了啊。'} ];
  /* AA_497 3-3：大二下「一個人的早餐」選了什麼（YU_BKF；src/sup497_3d.js），語 4 在她第一句前面多一句（當面、電話、視訊都一樣；沒演過＝照舊）*/
  const YU4_BKF=[ {if:{flagIs:{YU_BKF:'STAY'}},speaker:'yu',text:'你大二陪我吃過一次早餐。我那時候就在想，不能一直等別人來。'},
    {if:{flagIs:{YU_BKF:'WAKE'}},speaker:'yu',text:'阿哲現在起得來了。……可是我還是想要一個晚上，只有我。'},
    {if:{flagIs:{YU_BKF:'ALONE'}},speaker:'yu',text:'你大二說一個人吃也不錯。我那時候覺得你很怪。'} ];
  const YU4_W=[ {label:'w'},{speaker:'yu',text:'對。'},{speaker:null,text:'（她笑。）'},{speaker:'yu',text:'他昨天傳了十二部電影給我。……我一部都不要看他選的。'},{goto:'end'},
    {label:'q'},{speaker:'yu',text:'……還不知道。'},{speaker:null,text:'（她看著傅鐘。）'},{speaker:'yu',text:'所以才要留一個晚上。'},{goto:'end'} ];   /* 檔尾裁定 #17 */
  const YU4={ id:'ev_yu_alone_breakfast', title:'一個人的晚上', participants:['yu'], location:'campus', trigger:'auto', once:true, term:['Y3S2'], weeks:[3,4,5,6], weekday:[1,2,3,4,5], time:[9.5,12], npcNear:'yu', background:'blur',
    prereq:{stage:{npc:'yu',min:'FAMILIAR'},custom:G=>{ const x=X(); return !!x&&!x.inJP(G); }},
    dialogue:[ {speaker:null,text:'（她一個人在吃早餐。這次她沒有戴耳機。）'} ].concat(YU4_BKF,[
      {speaker:'yu',text:'欸，我在練習。一個人吃早餐。'} ],YU4_TAIL,[
      {choice:[{text:'「他很怕妳無聊。」',set:{YU4:'worry'},goto:'w'},{text:'「妳一個人的晚上要做什麼？」',set:{YU4:'what'},goto:'q'},{text:'（坐下來，一起吃，不說話）',set:{YU4:'sat',YU4_ALONE:true},mem:[{npc:'yu',tag:'YU4_SAT',note:'她練習一個人吃早餐，你坐下來一起吃'}],goto:'s'}]}],
      YU4_W,[
      {label:'s'},{speaker:null,text:'（兩個人把早餐吃完。她站起來。）'},{speaker:'yu',text:'欸，你剛剛都沒講話。'},{speaker:'yu',text:'……我也沒有。'},{speaker:null,text:'（她把早餐的紙袋摺成一小塊。）'},   /* 檔尾裁定 #17 */
      {label:'end'} ]) };   /* YU4_ALONE：尾聲 Alison 那一句「語 4 坐下來一起吃」（postgrad3d.js 讀，AA_319 1A-20）*/
  const YU4_CALL={ id:'ev_yu_alone_call', title:'Alison', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {if:JP,scene:'視訊',bg:'video'},{unless:JP,scene:'電話'} ].concat(YU4_BKF,[
      {speaker:'yu',text:'欸，我在練習。今天早上一個人吃早餐。'} ],YU4_TAIL,[
      {choice:[{text:'「他很怕妳無聊。」',goto:'w'},{text:'「妳一個人的晚上要做什麼？」',goto:'q'},{text:'（聽她講完）',goto:'l'}]}],
      YU4_W,[
      {label:'l'},{speaker:null,text:'（她又講了五分鐘社團的事，才說要去念書了。）'},
      {label:'end'},{set:{YU4:'call'}} ]) };

  /* ---------- 2-Y3-34 日本 J1「異鄉的便利商店」：3/26（日）日本 22:00，大學城的便利商店（日本路線；交往中＝全文＋CG-13、挽回中＝點頭）---------- */
  const J1={ id:'ev_an_konbini', title:'異鄉的便利商店', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'大學城的便利商店',bg:'jp_konbini'},   /* 日本便利商店的 2D（AA_31）沒有＝深色底＋字幕 */
      {if:{custom:G=>!dating(G,'heroine_01')},goto:'repair'},
      {speaker:null,text:'（晚上十點，便利商店。以安站在飯糰櫃前面，十分鐘沒有動。）'},
      {speaker:'heroine_01',text:'……我在決定。'},
      {speaker:'heroine_01',text:'這裡有三十幾種飯糰，有一半我看不懂。'},
      cg('cg_japan_konbini_heroine01'),   /* CG-13 在這一句出現 */
      {speaker:'heroine_01',text:'（一本正經）標籤只寫給看得懂的人。'},
      {choice:[{text:'「隨便拿一個。」',goto:'a'},{text:'「我幫妳翻譯。」',goto:'b'},{text:'「我們一人拿一個，交換吃。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',text:'……你說的。如果難吃，算你的。'},{speaker:null,text:'（她閉眼拿了一個。）'},{goto:'d'},
      {label:'b'},{speaker:'heroine_01',text:'你日文比我差。'},{speaker:'player',text:'對。'},{speaker:'heroine_01',text:'……那我們兩個一起看不懂。'},{goto:'d'},
      {label:'c'},{speaker:null,text:'（她想了一下。）'},{speaker:'heroine_01',text:'好。你先挑。'},   /* 原稿重複的「（她想了一下）」留一次（檔尾裁定 #31）*/
      {label:'d'},{set:{AN_J1:'dating'}},{end:true},
      {label:'repair'},
      {speaker:null,text:'（晚上十點，便利商店。以安站在飯糰櫃前面。）'},
      {speaker:null,text:'（她看到你，點了一下頭，拿了一個飯糰就去結帳。）'},
      {set:{AN_J1:'repair'}} ] };   /* 挽回中：沒有 CG、沒有選項、REPAIR 不加（AA_254 第 10 節）*/

  /* ---------- 2-Y3-35 日文班 G10「在日本遇到立衡」：4/2（日）日本 15:00 大學城的河堤（日本路線、修過日文）---------- */
  const told=v=>({custom:G=>(G.flags||{}).LIHENG_TOLD===v}), toldAny={custom:G=>!!(G.flags||{}).LIHENG_TOLD};
  const G10={ id:'ev_liheng_japan', title:'在日本遇到立衡', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'大學城的河堤',bg:'jp_riverbank'},   /* 2D jp_riverbank 沒有＝深色底＋字幕（CG-23 的河堤是另一張，不借）*/
      {if:toldAny,speaker:null,text:'（河堤上一排櫻花，樹下鋪著藍色的塑膠布。有人叫了你的名字。）'},
      {if:toldAny,speaker:'立衡',text:'……{name}？'},
      {if:toldAny,speaker:'立衡',text:'我去年秋天來的。這附近只有這條河，大家都來這裡。'},
      {unless:toldAny,speaker:null,text:'（河堤上一排櫻花，樹下鋪著藍色的塑膠布。有一個人一直看著你。）'},   /* 沒遇過 G7（檔尾裁定 #18）*/
      {unless:toldAny,speaker:'立衡',text:'……你是日文課的？'},
      {unless:toldAny,speaker:'立衡',text:'鄒立衡。機械系的。去年秋天來這裡念研究所。'},
      {if:told('wish'),speaker:'立衡',text:'你說要寄照片。……我一直沒寄。'},
      {if:told('ask'),speaker:'立衡',text:'你上次聽我講了十分鐘的計畫。現在換你講你的交換。'},
      {choice:[{text:'「要不要一起吃飯？」',set:{LIHENG_JP:'meal'},goto:'m'},{text:'「下次再約。」',set:{LIHENG_JP:'later'},goto:'l'}]},
      {label:'m'},{speaker:'立衡',text:'好。我知道一家便宜的。'},{goto:'end'},
      {label:'l'},{speaker:'立衡',text:'好。我加你。'},
      {label:'end'} ] };

  /* ---------- 2-Y3-36 清明 頂樓烤吐司：4/3（一）20:00～22:00 宿舍頂樓（台灣、美國路線；17:00 阿哲揪；日本路線＝20:30 照片；沒去＝22:00 照片）---------- */
  const TOAST={ id:'ev_y3s2_roof_toast', title:'頂樓烤吐司', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {speaker:null,text:'（宿舍頂樓。阿哲從家裡帶了一台小烤箱，延長線接了兩條。）'},
      {if:kn('zhe'),speaker:'zhe',text:'期中考版的春假。只有兩個小時。'},
      {if:kn('yu','heroine_01'),speaker:'yu',text:'（把吐司排好）欸，以安在日本有沒有吃早餐。'},
      {if:kn('classmate_bohan','heroine_01'),speaker:'classmate_bohan',text:'她傳了照片。日本的吐司比較厚。'},
      {if:kn('yu','heroine_01'),speaker:null,text:'（Alison 把手機拿給大家看：一片很厚的吐司，旁邊攤著一本手帳。）'},
      {if:kn('classmate_xinci'),speaker:'classmate_xinci',text:'……我們的比較薄。可是我們有四種果醬。'},
      {choice:[{text:'「我來烤。」',goto:'a'},{text:'（拍一張傳給以安）',if:fam('heroine_01','FRIEND'),goto:'b'},{text:'「期中考完再來一次？」',goto:'c'}]},
      {label:'a'},{speaker:null,text:'（第一片烤焦了。阿哲：「焦的給我。」）'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（十分鐘後，以安回了一張照片：同一片厚吐司，咬了一口。）'},{phone:'heroine_01',text:'這邊也是晚上。'},{goto:'end'},
      {label:'c'},{if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'期中考完是第十週。我記一下。'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_ROOF_TOAST:true},memo:'清明，宿舍頂樓烤吐司'},
    outingMissed:G=>{ const x=X(); if(x) x.toastPhoto(G); } };

  /* ---------- 2-Y3-37 日本 CG-23「春天的河堤」：4/8（六）日本 16:30 大學城的河堤（日本路線、和以安交往中；4/7 她約）---------- */
  const SAKURA={ id:'ev_an_sakura_riverbank', title:'春天的河堤', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'大學城的河堤',bg:'jp_riverbank'},
      {speaker:null,text:'（河堤的石階上，櫻花一直在掉。以安坐著讀書，旁邊放著字典和一個保溫杯。）'},
      cg('cg_sakura_riverbank_heroine01'),   /* CG-23 在這一句出現 */
      {speaker:'heroine_01',text:'（在手帳寫一行，轉過來給你看）'},
      {speaker:'手帳',text:'理由：櫻花只開一個禮拜。'},   /* 手帳上的字（AA_121：遊戲疊在 CG 上；疊字還沒做，先用一行顯示）*/
      {speaker:'heroine_01',text:'……所以這週的讀書會，改在這裡。'},
      {choice:[{text:'「那下週呢？」',goto:'a'},{text:'（坐下來，翻開書）',goto:'b'}]},
      {label:'a'},{speaker:'heroine_01',text:'下週就謝了。下週回圖書館。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（她看了你一眼，繼續讀。過了一頁，她把保溫杯推過來一點。）'},
      {label:'end'},{set:{AN_SAKURA:'went'}} ],
    outingMissed:G=>{ const x=X(); if(x) x.sakuraPhoto(G); } };

  /* ---------- 2-Y3-38 主線 8「遠方」視訊（日本路線）：4/13（四）19:30（日本 20:30），麵店長桌打給在日本的祐廷（4/12 21:00 阿哲私訊）---------- */
  const inG={custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')};
  const gk=(...ids)=>({custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&ids.every(id=>knows(id,G))});
  const FAR={ id:'ev_far_call_jp', title:'遠方', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'zhe',text:'你那邊幾點？……你吃什麼？給我看。'},
      {speaker:null,text:'（祐廷舉起一個便利商店的飯糰。）'},
      {speaker:'zhe',text:'就這樣？'},
      {if:gk('yu'),speaker:'yu',text:'你瘦了！……不對，是鏡頭。'},
      {if:gk('classmate_bohan'),speaker:'classmate_bohan',text:'你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。'},   /* AA_377 第 14 項：日本路線（原「這週的筆記我留了。回來再給你。」是臺灣的說法）*/
      {if:{custom:G=>gk('classmate_xinci').custom(G)&&plg(G)},speaker:'classmate_xinci',text:'讀書會你的位子，我們沒有人坐。'},   /* AA_377 第 3 項：玩家參加過讀書會才說 */
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&stAt(G,'heroine_03','FAMILIAR')},speaker:'heroine_03',text:'（她從廚房探出頭，舉起田野筆記，沒說話。）'},
      {if:inG,speaker:'阿姨',name:'阿姨（畫面外）',text:'滷蛋要不要！隔著螢幕也要問！'},
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&stAt(G,'heroine_01','FRIEND')},speaker:null,text:'（手機亮了一下，以安傳來：「他吃飯糰。便利商店比較近。」）'},   /* 原稿「理由：」拿掉（檔尾裁定 #19）*/
      {speaker:'zhe',text:'好了，麵要糊了。……你自己也要吃飯。'},
      {speaker:null,text:'（畫面關掉。房間比剛才安靜。）'},
      {set:{FAR_CALL:'jp'}} ],   /* 不在麵店團、和阿哲 FAMILIAR 以上：阿哲一個人在宿舍頂樓打來，只留阿哲的台詞（上面群組那幾行都不出）*/
    outingMissed:G=>{ const x=X(); if(x) x.farPhoto(G); } };
  /* ---------- 主線 8「遠方」美國版（AA_412 第 2 節，AA-B 2026-10-23；台詞照 AA_185 1-2，標【美】的照 AA_412）：9/21（四）美國 07:30（臺灣 19:30）麵店長桌打給在美國的祐廷（9/20 美國 09:00＝臺灣 21:00 阿哲私訊）----------
     照日本版 FAR 的條件：Alison、柏翰、芯慈（參加過讀書會）、語彤、阿姨都要在麵店團；何俊朗經過只在見過他（MET_LONG：旗標或記憶，AA_370 M3 兩邊互相認）；以安那一則美國版沒有。
     不在麵店團、和阿哲 FAMILIAR 以上：只留阿哲的三句、看麥片的旁白和最後一句旁白（同日本版：群組那幾行、何俊朗都不出）*/
  const longMet=G=>!!(G&&G.flags&&G.flags.MET_LONG)||(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('npc_long','MET_LONG'));
  const FAR_US={ id:'ev_far_call_us', title:'遠方', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（早上七點半。你端著一碗麥片，走到門外的平台上。這裡的收訊比房間好。）'},
      {speaker:'zhe',text:'你那邊幾點？……你吃什麼？給我看。'},
      {speaker:null,text:'（你舉起那碗麥片。）'},
      {speaker:'zhe',text:'就這樣？'},
      {if:gk('yu'),speaker:'yu',text:'你瘦了！……不對，是鏡頭。'},
      {if:gk('classmate_bohan'),speaker:'classmate_bohan',text:'強制執行法的筆記，我留了一份。你大五補修用得到。'},
      {if:{custom:G=>gk('classmate_xinci').custom(G)&&plg(G)},speaker:'classmate_xinci',text:'讀書會你的位子，我們沒有人坐。'},
      {if:{custom:G=>inG.custom(G)&&stAt(G,'heroine_03','FAMILIAR')},speaker:null,text:'（語彤從廚房探出頭，舉起田野筆記，沒說話。）'},
      {if:inG,speaker:'阿姨',name:'阿姨（畫面外）',text:'滷蛋要不要！隔著螢幕也要問！'},
      {if:{custom:G=>inG.custom(G)&&longMet(G)},speaker:null,text:'（樓下有人經過，是何俊朗，手上提著一袋早餐。他抬頭看到你在講視訊。）'},
      {if:{custom:G=>inG.custom(G)&&longMet(G)},speaker:'何俊朗',text:'Hello，台灣！'},
      {speaker:'zhe',text:'好了，麵要糊了。……你自己也要吃飯。'},
      {speaker:null,text:'（畫面關掉。平台上很安靜，遠處有人在割草。）'},
      {set:{FAR_CALL:'us'}} ],
    outingMissed:G=>{ const x=X(); if(x) x.farPhotoUS(G); } };

  /* ---------- 2-Y3-39 語 5「一個人的電影」：4/24（一）9:30～12:00 傅鐘長椅當面；日本路線 4/24 10:00 視訊；台灣路線沒遇到＝4/27（四）19:00 麵店（她坐你旁邊說）---------- */
  const YU5_TAIL=[ {speaker:'yu',text:'旁邊坐一個也是一個人來的女生。她說一個人看電影的人，都坐倒數第三排。'},
    {speaker:'yu',text:'她說她高中每天都這樣。……好酷。'},
    {speaker:'yu',text:'看完我打給阿哲講劇情。講了一個小時。他沒睡著。'},
    {choice:[{text:'「看了哪一部？」',goto:'a'},{text:'「妳也坐倒數第三排？」',goto:'b'}]},
    {label:'a'},{speaker:'yu',text:'一部很安靜的。……我差點睡著，可是沒有。'},{goto:'end'},
    {label:'b'},{speaker:'yu',expression:'laugh',text:'對！下次我還要坐那裡。'},
    {label:'end'},{mem:[{npc:'yu',tag:'YU_ALONE',note:''}]} ];
  const yu5Pre=G=>{ const x=X(); return !!x&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has('yu','YU_ALONE')); };
  const YU5={ id:'ev_yu_alone_movie', title:'一個人的電影', participants:['yu'], location:'campus', trigger:'auto', once:true, npcNear:'yu', time:[9.5,12], background:'blur',
    prereq:{stage:{npc:'yu',min:'FAMILIAR'},custom:G=>{ const x=X(); return yu5Pre(G)&&!!x&&x.isDay(G,'2028-04-24')&&!x.inJP(G); }},
    dialogue:[ {speaker:'yu',text:'週六我一個人去看電影。'} ].concat(YU5_TAIL) };
  const YU5_NOODLE={ id:'ev_yu_alone_movie_noodle', title:'一個人的電影', participants:['yu'], location:'noodle', trigger:'auto', once:true, time:[19,21], background:'blur',
    prereq:{stage:{npc:'yu',min:'FAMILIAR'},custom:G=>{ const x=X(); return yu5Pre(G)&&!!x&&x.isDay(G,'2028-04-27')&&!x.inJP(G)&&!(G.events&&G.events.done&&G.events.done.ev_yu_alone_movie); }},
    dialogue:[ {speaker:'yu',text:'欸，跟你說。週六我一個人去看電影。'} ].concat(YU5_TAIL) };   /* 麵店版第一句（新寫）*/
  const YU5_VIDEO={ id:'ev_yu_alone_movie_video', title:'一個人的電影', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},{speaker:'yu',text:'週六我一個人去看電影。'} ].concat(YU5_TAIL) };

  /* ---------- 2-Y3-40 芷若 Z11b「倒數第三排」：4/24 起第一次在 Café 點餐（她在班；台灣、美國路線；FAMILIAR 以上）。日本路線＝4/22 22:00 票根照片（r2y3b3d.js）---------- */
  const early={custom:G=>{ const x=X(); return !!x&&x.before(G,'2028-05-01'); }};
  const Z11B={ id:'ev_zhiruo_third_row', title:'倒數第三排', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:9, once:true, term:['Y3S2'], background:'blur',
    prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>{ const x=X(); return !!x&&!x.before(G,'2028-04-24')&&x.route(G)!=='JP'; }},
    dialogue:[ {if:early,speaker:'heroine_02',text:'上週在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。'},
      {unless:early,speaker:'heroine_02',text:'前陣子在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。'},   /* 5/1 以後才第一次去（新寫）*/
      {speaker:'heroine_02',text:'散場的時候，她說她在練習一個人。'},
      {speaker:'heroine_02',text:'我說，我練了六年了。'},
      {speaker:'heroine_02',text:'……她問我練好了沒。我說，練好了。所以最近想換一種：兩個人看。'},
      {speaker:null,text:'（她把杯子推過來，轉身去洗杯子。）'},
      {choice:[{text:'「那個女生是 Alison。」',if:{memory:[{npc:'yu',tag:'YU_ALONE'}]},set:{ZR_Z11B:'yu'},consequences:{stamp:['ZR_Z11B_DAY']},goto:'y'},{text:'「那妳想跟誰看？」',set:{ZR_Z11B:'who'},goto:'w'},{text:'「下次我陪妳。」',set:{ZR_Z11B:'with'},goto:'c'}]},
      {label:'y'},{speaker:null,text:'（她愣住。）'},{speaker:'heroine_02',text:'……阿哲的那個 Alison？'},{speaker:'player',text:'嗯。'},{speaker:null,text:'（她想了一下。）'},{speaker:'heroine_02',text:'那下次遇到她，我請她一杯。'},
        {mem:[{npc:'heroine_02',tag:'ZHIRUO_MET_YU',note:''}]},{goto:'end'},
      {label:'w'},{speaker:'heroine_02',text:'……還在想。'},{speaker:null,text:'（她看著門口，笑了一下。）'},{speaker:'heroine_02',text:'想好了再跟你說。'},{goto:'end'},
      {label:'c'},{speaker:'heroine_02',text:'好啊。'},{speaker:null,text:'（她說得很快，然後自己愣了一下。）'},{speaker:'heroine_02',text:'……那你要坐倒數第三排喔。我習慣那裡。'},
      {label:'end'} ] };

  /* ---------- 2-Y3-41 可昕 生日（大三）：4/24（一）18:00～18:30 公館，三十分鐘＋一片蛋糕；日本路線＝21:00 視訊（日本 22:00）。邀約、沒做的在 r2y3b3d.js ---------- */
  const KXV={custom:G=>{ const x=X(); return !!x&&x.inJP(G); }};
  const KX_BD={ id:'ev_kexin_birthday_y3', title:'她的生日（大三）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {if:KXV,scene:'視訊',bg:'video'},{unless:KXV,scene:'公館',bg:'gongguan_cake'},   /* 公館的甜點店 2D 沒有＝深色底＋字幕 */
      {if:KXV,speaker:null,text:'（她把一片蛋糕舉到鏡頭前。）'},{if:KXV,speaker:'kexin',expression:'teasing',text:'這片是你的。我幫你吃。'},
      {speaker:'kexin',expression:'smile',text:'生日願望。一，報告寫完。二，你的報告也寫完。'},
      {speaker:'kexin',expression:'laugh',text:'三……三十分鐘到了。第三個明年說。'},{set:{KX_WISH3:true}},   /* AA_525 3-3（K-4）：2029-04-23 21:00 她的私訊多兩句（r2y4b3d.js）*/
      {if:{custom:G=>KXV.custom(G)&&!!(G.flags&&G.flags.KX_EXCHANGE_ASKED)},speaker:'kexin',expression:'smile',text:'沒關係，你先睡。填交換志願的時候，你有先問我。'},   /* AA_344 ⑤：日本路線視訊的最後（三十分鐘到了、她掛之前），交換志願表那一場先問過她的（KX_EXCHANGE_ASKED，story3d.js 1A-05）；BB_98 9-5 */
      {unless:KXV,speaker:null,text:'（她把最後一口蛋糕吃完，拿了包包就走。走到門口又回頭。）'},   /* 收尾（新寫）：當面那一版 */
      {unless:KXV,speaker:'kexin',expression:'smile',text:'報告寫完了跟我說。'} ],
    after:G=>{ const x=X(); if(x) x.kxBdayDone(G); },
    outingMissed:G=>{ const x=X(); if(x) x.kxBdayMissed(G); } };

  /* ---------- 2-Y3-42 慈 6「第一名」：5/4（四）19:00～20:00 麵店長桌（芯慈在；一天的作息）；日本路線＝21:40 視訊（日本 22:40）---------- */
  const XC_LINES=[ {speaker:'classmate_xinci',text:'以安不在的這學期，我第一次考第一。'},
    {speaker:'classmate_xinci',text:'一點都不好玩。'},
    /* AA_497 2-5：照記憶多一句，可以疊（影印機猜拳 XC_RPS、她爸爸那一場選的 XC_DAD_*；src/sup497_3d.js）；沒演到慈 6 的＝隔天 12:00 私訊 */
    {if:{flags:['XC_RPS']},speaker:'classmate_xinci',text:'我上一次贏她，是大一在影印機前面猜拳。'},
    {if:{flags:['XC_DAD_AN']},speaker:'classmate_xinci',text:'我打電話跟我爸說了。他問：那沈以安第幾？'},
    {if:{flags:['XC_DAD_XC']},speaker:'classmate_xinci',text:'我打電話跟我爸說了。他說，你那個同學早就說了。'},
    {if:{flags:['XC_DAD_NO']},speaker:null,text:'（她看著手機很久，最後沒有打給任何人。）'},
    {speaker:'classmate_xinci',text:'我把雙主修改成輔系了。經濟我還是喜歡。只是不用拿第一了。'},
    {speaker:'classmate_xinci',text:'昨天晚上追劇追到兩點。……那部劇真的很好看。'},
    {choice:[{text:'「恭喜。」',goto:'a'},{text:'「哪一部劇？」',goto:'b'}]},
    {label:'a'},{speaker:'classmate_xinci',text:'嗯。……第二句你也聽到了吧。'},{goto:'end'},
    {label:'b'},{speaker:'classmate_xinci',text:'你要聽嗎？'},
    {unless:JP,speaker:null,text:'（她講了十分鐘。阿哲吃完了兩碗。）'},   /* 視訊版沒有阿哲在旁邊：只到「你要聽嗎？」 */
    {label:'end'},{set:{XINCI_FIRST:true}},{mem:[{npc:'classmate_xinci',tag:'XINCI_FIRST',note:''}]} ];   /* XINCI_FIRST：記憶＋旗標（events.js 大四上 R1 讀旗標）*/
  const XC={ id:'ev_xinci_first_place', title:'第一名', participants:['classmate_xinci'], location:'noodle', trigger:'auto', once:true, time:[19,20], npcPresent:'classmate_xinci', background:'blur',
    prereq:{stage:{npc:'classmate_xinci',min:'FAMILIAR'},custom:G=>{ const x=X(); return !!x&&x.isDay(G,'2028-05-04')&&!x.inJP(G); }},
    dialogue:XC_LINES };
  const XC_VIDEO={ id:'ev_xinci_first_place_video', title:'第一名', participants:['classmate_xinci'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'} ].concat(XC_LINES) };

  /* ---------- 2-Y3-43 日本 J2「町公所的一張通知」（以安新 17；CG-17）：日本路線交往中＝5/6 日本 15:00 町公所門口；挽回中＝日本 22:00 宿舍大廳；台灣、美國路線＝20:00 群組（r2y3b3d.js）---------- */
  const J2={ id:'ev_an_town_notice', title:'町公所的一張通知', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'町公所門口',bg:'jp_town_hall'},   /* 2D 沒有＝深色底＋字幕 */
      {speaker:'heroine_01',text:'你看這張。寫的是『請協力』。沒有罰則。'},
      cg('cg_japan_notice_heroine01'),   /* CG-17 在這一句出現 */
      {speaker:'heroine_01',text:'可是整條街都照做。……這比命令可怕，還是比較好？'},
      {choice:[{text:'「是信任。」',goto:'a'},{text:'「是壓力。」',goto:'b'},{text:'「兩個都有。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',text:'信任誰？町公所，還是隔壁鄰居？'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',text:'那沒照做的那一家，鄰居會怎麼看他？'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',text:'（把這句抄進手帳）……好。那我想研究的，就是這兩個中間的線。'},
      {label:'end'},
      {speaker:null,text:'（她把那張通知拍下來。這次，沒有傳到麵店團。）'},   /* AA_187 1-5 交往中的結尾 */
      {speaker:'heroine_01',text:'這張不用傳給麵店團了。'},
      {set:{AN_TOWN_NOTICE:'there'}} ],   /* 法律：旁白不說這張通知是行政指導（AA_30 J2）*/
    outingMissed:G=>{ const x=X(); if(x) x.noticePhoto(G); } };
  const J2_REPAIR={ id:'ev_an_town_notice_repair', title:'町公所的一張通知', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍大廳',bg:'jp_dorm_lobby'},   /* 2D 沒有＝深色底＋字幕；沒有 CG-17 */
      {speaker:'heroine_01',text:'……你看得懂這個字嗎？'},
      {speaker:'player',text:'（看了一下）這是「截止日」。後面那個是「本人到場」。'},
      {speaker:'heroine_01',text:'……謝謝。'},
      {speaker:'heroine_01',text:'我不是在跟你和好。我只是看不懂。'},
      {choice:[{text:'「……好。」',goto:'a'},{text:'「那我們可以談一下嗎？」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（她把通知折好，收進手帳。）'},{speaker:'heroine_01',text:'晚安。'},{set:{AN_NOTICE_REPAIR_OK:true}},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',text:'我說了，我只是看不懂。'},{speaker:null,text:'（她拿起字典走了。）'},
      {label:'end'},{set:{AN_TOWN_NOTICE:'repair'}} ],
    after:G=>{ const x=X(); if(x&&G.flags.AN_NOTICE_REPAIR_OK) x.repairAdd(G,'heroine_01'); } };   /* 「……好。」＝REPAIR +1（AA_254 第 10 節）*/

  /* ---------- 2-Y3-44 可昕 K20「一個人聽懂了自己的處境」：5/12（五）19:00 公館河濱（5/11 她約）；沒去河濱、日本路線＝21:00 演出來的電話 ---------- */
  const K20_AB=[ {label:'a'},{speaker:'kexin',expression:'surprised',text:'你怎麼知道？'},{speaker:'player',text:'妳每次都先等我講完。'},{goto:'end'},
    {label:'b'},{speaker:'kexin',expression:'teasing',text:'會。所以你要負責宵夜。'},{if:fl('KX_SUMMER','tired'),speaker:'kexin',expression:'laugh',text:'……這句我大二說過了。好，這次換你說一句。'},{goto:'end'} ];   /* KX_SUMMER 'tired'：大二 K14 選過「會不會很累？」*/
  const K20={ id:'ev_kexin_k20', title:'一個人聽懂了自己的處境', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（公館的河濱。她靠著欄杆，看了很久的河才開口。）'},
      {speaker:'kexin',expression:'serious',text:'有個人聽懂了自己的處境，就不那麼怕了。'},
      {speaker:'kexin',expression:'serious',text:'我想做這個。'},
      {choice:[{text:'「那妳會很適合。」',goto:'a'},{text:'「做這個要很累。」',goto:'b'},{text:'（不說話，陪她看河）',goto:'c'}]} ].concat(K20_AB,[
      {label:'c'},{speaker:null,text:'（她靠著欄杆。）'},{speaker:'kexin',expression:'smile',text:'你不問，很好。那個人的事是他的。'},
      {label:'end'},{set:{KX_K20:'river'}} ]),
    after:G=>{ const x=X(); if(x) x.kxDirHeard(G); } };
  const K20_CALL={ id:'ev_kexin_k20_call', title:'可昕', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊很安靜。）'},
      {if:JP,speaker:'kexin',expression:'serious',text:'這學期我在實習。今天有一個來問問題的人，聽懂了自己的處境。'},
      {unless:JP,speaker:'kexin',expression:'serious',text:'本來想在河濱講的。實習那邊，有個來問問題的人聽懂了自己的處境。'},   /* 沒去河濱（BB_98 10-1 原文）*/
      {speaker:'kexin',expression:'serious',text:'我想做這個。'},
      {choice:[{text:'「那妳會很適合。」',goto:'a'},{text:'「做這個要很累。」',goto:'b'},{text:'（聽她說完）',goto:'l'}]} ].concat(K20_AB,[
      {label:'l'},{speaker:'kexin',expression:'smile',text:'……嗯。我講完了。早點睡。'},
      {label:'end'},{set:{KX_K20:'call'}} ]),
    after:G=>{ const x=X(); if(x) x.kxDirHeard(G); } };

  /* ---------- 2-Y3-45 方奕廷 F3「我買了」：5/29（一）21:00 演出來的電話（芷若的心意邀約條件那天已到＝延到 6/19）；之後第一次在 Café 點餐，芷若的兩句（日本路線＝8/5 回國以後、9/1 以前第一次進 Café，過去式那兩句）---------- */
  const F3={ id:'ev_fangyt_tickets', title:'方奕廷', participants:['npc_fangyt'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。他那邊有風的聲音，像是在陽台。）'},
      {speaker:'npc_fangyt',text:'有一部很老的片，《秋天的晚飯》，在二輪重映。'},   /* 片名、導演虛構（檔尾裁定 #24）*/
      {speaker:'npc_fangyt',text:'我要約芷若。'},
      {speaker:'npc_fangyt',text:'我六年沒約過任何人。要怎麼約。'},
      {choice:[{text:'「直接說。」',set:{FANG_F3:'direct'},goto:'a'},{text:'「說你剛好有兩張票。」',set:{FANG_F3:'bought'},goto:'b'},{text:'「要我幫你問嗎？」',set:{FANG_F3:'self'},goto:'c'}]},
      {label:'a'},{speaker:'npc_fangyt',text:'直接說。'},{speaker:null,text:'（他重複一次。）'},{speaker:'npc_fangyt',text:'……好。我試試看。'},{goto:'end'},
      {label:'b'},{speaker:'npc_fangyt',text:'我沒有剛好。'},{speaker:'npc_fangyt',text:'我買了。'},{goto:'end'},
      {label:'c'},{speaker:'npc_fangyt',text:'不要。這個我要自己來。'},
      {label:'end'} ] };
  /* 拒絕版（AA_387 第 8 節，企劃線 608b9adc；台詞照稿）：F3 那天她心裡是祐廷（ZR_F3_NO，src/zrzq3d.js 的 f3Sync）——臺灣路線兩句＋兩個選項；日本路線（8/5 回國以後第一次進 Café）過去式三句、沒有選項 */
  const ZR_NO={custom:G=>(G.flags||{}).ZR_F3_NO!=null};
  const F3_CAFE={ id:'ev_zhiruo_f3_cafe', title:'很老的那部', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:9, once:true, background:'blur',
    prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>{ const x=X(); return !!x&&x.f3CafeDue(G); }},
    dialogue:[ {if:ZR_NO,goto:'no'},
      {unless:JP,speaker:'heroine_02',text:'奕廷約我去看電影。很老的那部，《秋天的晚飯》。'},
      {unless:JP,speaker:'heroine_02',text:'他連我高中看過哪幾部都記得。……我說好。'},
      {if:JP,speaker:'heroine_02',text:'奕廷約我去看了一部電影。很老的那部，《秋天的晚飯》。'},   /* 日本路線：8/5 回國以後第一次進 Café，句子改成過去式（AA_296 2-3-1 ⑤，企劃線 3f406dbc；原本是 22:07 的私訊）*/
      {if:JP,speaker:'heroine_02',text:'他連我高中看過哪幾部都記得。……那時候，我說好了。'},
      {goto:'end'},
      {label:'no'},{if:JP,goto:'no_jp'},
      {speaker:'heroine_02',text:'奕廷約我去看電影。很老的那部，《秋天的晚飯》。'},
      {speaker:'heroine_02',text:'……我說不行。'},
      {choice:[{text:'「為什麼？」',goto:'no_a'},{text:'「他一定很失望。」',goto:'no_b'}]},
      {label:'no_a'},{speaker:'heroine_02',text:'……你不要問。'},{goto:'end'},
      {label:'no_b'},{speaker:'heroine_02',text:'他說「好」，然後跟我講了十分鐘那部電影的導演。……他人很好。'},{goto:'end'},
      {label:'no_jp'},
      {speaker:'heroine_02',text:'你不在的時候，奕廷約我去看一部很老的電影。'},
      {speaker:'heroine_02',text:'……我說不行。'},
      {speaker:'heroine_02',text:'你不要問為什麼。'},
      {label:'end'} ] };

  /* ---------- 2-Y3-51 美國路線 X1 退宿：2028-07-25（二）14:00 宿舍 507（暑假續住的；回家住的接在學期結束搬家那一段，r2y3b3d.js）---------- */
  const X1US={ id:'ev_x1_moveout_us', title:'退宿', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（七月底。507 只剩你這半邊還有東西。柏翰白天在補習班，他的桌上堆滿了講義。）'},   /* 新寫的開頭；AA_370 M10：柏翰大三暑假只在新竹待 6/28～7/2，7/3 起回臺北補習（原「柏翰暑假回新竹了，他的桌子空著。」）*/
      {speaker:null,text:'（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'} ] };   /* AA_144 X1 原文；AA_377 第 18 項：507 是大三才搬進去的（「大一的」改「不知道誰的」，和日本路線 2/20 退宿同一句）*/

  /* ---------- 2-Y3-52 台灣、美國路線：以安在日本（3/25～8/5）——訊息、視訊、七夕告白（AA_253 10-1、10-3 原句；AA 審稿補）。每週的段、邀約、行程在 r2y3b3d.js ---------- */
  const AB={
    /* T1：十則，照順序各傳一次（AA_463 第 1 節：原本四則輪、每則兩三次；「我研究了三天」是她到日本第二天收到的）。原本四則（櫻花、飯糰、洗衣機、號碼牌）留著、放到第 3、2、4、5 則；
       到的那週、四月（櫻花）、六月（梅雨）、七月底（行李箱）照月份，其他照順序補空的那一週（r2y3b3d.js S.abPickT1）；十則傳完就不再傳 */
    t1:[['（照片：公寓房間，箱子還沒拆）','到了。箱子明天拆。'],   /* 第 1 則、第 8 則回覆①照 AA_463 第 7 節改字（她在日本住公寓，AA_377）*/['（照片：便利商店的飯糰架）','飯糰的海苔要自己拉開。我研究了三天。'],['（照片：大學的櫻花）','四月。這邊的櫻花開得比較晚。'],
        ['（照片：公寓的投幣洗衣機）','一次一百圓。我記在手帳了。'],['（照片：町公所的排隊號碼牌）','排了一個小時。'],['（照片：垃圾分類的月曆，貼在冰箱上）','星期二可燃，星期五資源。我貼在冰箱上了。'],
        ['（照片：電車的月台，人排成兩排）','這邊排隊會排成兩排。我第一天排錯了。'],['（照片：窗外一片灰）','梅雨。衣服三天沒乾。'],['（照片：教室的黑板，寫滿日文）','今天上課被點到。我用日文答完，全班安靜了一下。'],
        ['（照片：行李箱，攤開在床上）','八月五號。我開始收了。']],
    t1O:[[['累嗎？','還好。……床比宿舍軟。'],['房間多大？','六疊。我量過了。']],[['照 1、2、3 的順序拉。','……你早點說。'],['拉破了也能吃。','我知道。我吃了三個破的。']],
        [['臺北的已經謝了。','嗯。這邊才剛開。'],['好看。','嗯。']],[['一百圓是多少？','二十幾塊。我記了匯率。'],['手帳記幾頁了？','十一頁。']],[['辛苦了。','嗯。'],['排到了嗎？','排到了。辦完只要五分鐘。']],
        [['比臺灣難嗎？','比較難。可是規則寫得很清楚。'],['妳一定都記得。','記得。上禮拜鄰居還問我。']],[['後來呢？','後面的阿姨帶我換過去。沒說話。'],['妳也會排錯？','會。只有一次。']],
        [['公寓有烘衣機嗎？','樓下有。一次一百圓。我又記了一筆。'],['臺北也在下。','那我們一樣。']],[['一定是答對了。','下次我問老師。'],['安靜是好的意思嗎？','我也不知道。我查了。']],
        [['我去機場接妳。','好。……我記在手帳了。'],['東西變多了嗎？','多了一本手帳。寫滿了。']]],   /* T1 也有回覆按鈕（AA_343 D3）：每則兩個，她回一句；原本四則的回覆照舊 */
    /* AA_524 A10：沒交往的朋友（r2y3b3d.js 的 tier 1）沒有接機那一場——「我去機場接妳。」她的回覆換這一句；交往中照上面（8/5 接機）*/
    t1OFriend:{9:{'我去機場接妳。':'不用。我爸會來。……謝謝。'}},
    t2:[{L:['上課聽懂七成了。剩下三成，我回房間查字典。','你那邊期中考了嗎？'],O:['考了。','下禮拜。']},{L:['町公所前面的阿伯一直跟我講話，我只聽懂『學生』兩個字。','你最近都去哪裡讀書？'],O:['總圖。','麵店。']},
        {L:['讀書會 Alison 有沒有好好排題目？……你不要幫她排。讓她自己排。','你那邊還好嗎？'],O:['她排得很好。','還好。']},{L:['這邊下了一整天的雨。','你那邊在下雨嗎？'],O:['也在下。','晴天。']}],   /* 回覆按鈕新寫，每則兩個 */
    t3:[ [ {speaker:null,text:'（畫面裡是她房間的書桌，手帳攤在旁邊。）'},{speaker:'heroine_01',text:'你那邊幾點？……我算了一下，你應該剛吃完晚餐。'},{speaker:'heroine_01',text:'這禮拜的課很難。先不講課了，你那邊最近怎樣？'},{speaker:'heroine_01',text:'好，我要去睡了。下禮拜同一個時間。'} ],
      [ {speaker:'heroine_01',text:'（她把手帳翻到這一週）這禮拜好滿，日文小考考了兩次。'},{speaker:'heroine_01',text:'你那邊呢？'},{speaker:'heroine_01',text:'好，我要去睡了。下禮拜同一個時間。'} ],
      [ {speaker:'heroine_01',text:'（畫面晃了一下，她把手機靠在字典上）你那邊幾點？'},{speaker:'heroine_01',text:'……我只是想看一下你。好，可以了。'},{speaker:'heroine_01',text:'你先掛。'} ] ],
    invite:[ {speaker:'heroine_01',text:'七月七號，這邊是七夕。商店街會掛很多竹子。'},{speaker:'heroine_01',text:'……你要不要來看？'},
      {choice:[{text:'「我去。」',set:{AN_JP_TRIP_ASK:'go'},goto:'iy'},{text:'「我再看看。」',set:{AN_JP_TRIP_ASK:'later'},goto:'il'}]},
      {label:'iy'},{speaker:'heroine_01',text:'好。機票你自己訂，行程我排。'},{goto:'ie'},
      {label:'il'},{speaker:'heroine_01',text:'好。六月底以前跟我說。'},
      {label:'ie'} ],
    reask:['六月最後一天。','七月七號。……你要不要來看？'],   /* 「我再看看」的 6/30 那兩則（AA_343 D2）*/
    reaskYes:'好。機票你自己訂，行程我排。', reaskNo:'好。我拍竹子給你看。',
    tanaLate:['我在剪票口。','……行程表我收起來了。'],   /* 答應了、7/6 沒出發（AA_343 D4）：15:30、18:00（臺灣時間）*/
    d1:[ {scene:'關西・大學城',bg:'jp_station'},{speaker:null,text:'（她在車站的剪票口等，手上拿著一張手寫的行程表。）'},{speaker:'heroine_01',text:'這裡。行程表我印了兩份，這份給你。'} ],
    d2:[ {scene:'關西・大學城',bg:'jp_street_night'},{speaker:null,text:'（商店街掛滿了竹子，短冊在風裡一直響。）'},{speaker:'heroine_01',text:'你要寫一張嗎？'},{speaker:null,text:'（你寫了。她沒有看，把自己的那張掛在旁邊。）'},
      {choice:[{text:'「以安，我喜歡妳。」',set:{AN_TANABATA_SAID:'player'},goto:'p'},{text:'（把短冊掛上去）',set:{AN_TANABATA_SAID:'her'},goto:'h'}]},
      {label:'p'},{goto:'pk',if:AN_KNOWS},{speaker:'heroine_01',text:'……我知道。我等你說，等了三個月。'},{speaker:'heroine_01',text:'好。'},{goto:'e'},
      {label:'pk'},{speaker:'heroine_01',text:'……我知道。'},{call:async(G,GM)=>{ const x=X(); if(x) await x.tanabataKnow(GM,true); }},{goto:'e'},   /* AA_474 3b：她知道祐廷有別人＝「……我知道。」接 KNOW.say、三個選項（R2Y3B.tanabataKnow）*/
      {label:'h'},{speaker:'heroine_01',text:'你不說，那我說。'},{speaker:'heroine_01',text:'我喜歡你。理由我寫在手帳裡，回臺灣再給你看。'},{speaker:'heroine_01',text:'……你不准賴。'},
      {if:AN_KNOWS,call:async(G,GM)=>{ const x=X(); if(x) await x.tanabataKnow(GM,false); }},   /* AA_474 3b：她原本三句接 KNOW.she、三個選項 */
      {label:'e'} ],
    d3:[ {scene:'關西・大學城',bg:'jp_street_day'},{speaker:null,text:'（她排的行程表上，每一格都有時間。你們只走完一半。）'} ],   /* 7/8、7/9 兩個摘要日（新寫）*/
    d4:[ {scene:'大學城的河堤',bg:'jp_riverbank'},{speaker:null,text:'（大學城的河堤。她讀書，你坐在旁邊看河。）'} ],
    d5:[ {scene:'關西・大學城',bg:'jp_station'},{speaker:null,text:'（剪票口。她把自己那份行程表折好，塞進你的口袋。）'},{speaker:'heroine_01',text:'八月五號，你來接我。'} ] };
  const AB_VIDEO={ id:'ev_an_abroad_video', title:'以安的視訊', participants:['heroine_01'], location:'any', trigger:'outing', background:'dark', hours:0.25, dialogue:[],   /* 每週一次（T3）：beforeOuting 照輪到的那一組演 */
    beforeOuting:async(G,GM,q)=>{ const x=X(); if(x) await x.anVideo(GM,q); },
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.anVideoMissed(G,q); } };   /* 沒接＝這一則沒回（BB_204 9-1）*/
  const TANABATA={ id:'ev_an_tanabata', title:'日本的七夕', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5, dialogue:[],   /* 7/6～7/10 五天：beforeOuting 一天一段（STORY.travelOvernight 換日）*/
    beforeOuting:async(G,GM,q)=>{ const x=X(); if(x) await x.tanabataTrip(GM,q); },
    outingMissed:G=>{ const x=X(); if(x) x.tanabataMissed(G); } };   /* 答應了、7/6 沒出發：照條件沒到那一版（7/7 竹子的照片）*/
  const AN_AIRPORT={ id:'ev_an_airport_y3', title:'接以安', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'桃園機場・入境大廳',bg:'airport_arr'},{speaker:null,text:'（她一出來就看到你。行李箱上貼著一張商店街的七夕貼紙。）'},{speaker:'heroine_01',text:'……你真的來了。'} ] };
  const AN_NOTEBOOK={ id:'ev_an_notebook', title:'理由欄', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'兩點半 Café・窗邊',bg:'cafe_window'},{speaker:'heroine_01',text:'（從包包拿出一本日本的手帳）給你。'},{speaker:null,text:'（第一頁寫著：「理由欄。空著，給你。」）'},{set:{AN_NOTEBOOK_GIFT:true}} ] };

  /* ---------- 2-Y3-53 台灣、美國路線：和以安交往中的遠距（AA_187 1-4 原句）：3/14（二）白色情人節公館當面（交往中一律有，AA_343 D1）；4/13（四）22:30 視訊（日本 23:30）---------- */
  const VDAY={custom:G=>!!(G.flags&&G.flags.AN_VDAY_GIFT)};
  const VDAY_BUSY=G=>{ const v=G.flags&&G.flags.AN_VDAY_Y3; return v==='no'||v==='missed'; };   /* 2028-02-13 21:00 她約 2/14 總圖門口（an_yt_hol3d.js an_y3）：拒絕＝no、答應了沒到＝missed */   /* 2/14 送過（以後 2/14 的系統做好、那一場記 AN_VDAY_GIFT）；沒送過＝現在所有玩家：「不是回禮」那一版（AA_369 H2：2028 寒假她只回台中 1/24～1/28，2/14 在臺北；「理由欄」不說出口）*/
  const WHITE={ id:'ev_an_white_day', title:'白色情人節', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'公館',bg:'gongguan'},
      {speaker:'heroine_01',text:'日本的白色情人節，是收到巧克力的人要回禮。'},
      {if:VDAY,speaker:'heroine_01',text:'（她拿出一個小紙袋）一個月前你送的。這是回禮。'},
      {if:{custom:G=>!VDAY.custom(G)&&VDAY_BUSY(G)},speaker:'heroine_01',text:'二月十四號那天，你有事。我在讀書。'},   /* AA_508 0-2 第 8 點（31a4c4002）：2/13 她約過、玩家拒絕（no）或答應了沒到（missed）——原本也走「你也沒說什麼」，接不上 */
      {if:{custom:G=>!VDAY.custom(G)&&!VDAY_BUSY(G)},speaker:'heroine_01',text:'二月十四號那天，我在讀書。……你也沒說什麼。'},   /* 沒約到（不是交往中、沒回 noreply）照舊 */
      {unless:VDAY,speaker:'heroine_01',text:'（她拿出一個小紙袋）回禮要先收到才算。……這個，是我自己想送。'},   /* AA_508 0-2 第 8 點：原本「所以這個不是回禮。……是我自己想送的。」是禁用句型（口氣表 0-3「不是X。是Y。」），兩個版本都換 */
      {choice:[{text:'「謝謝。」',set:{AN_WHITE_DAY:'thanks'},goto:'a'},{text:'「台灣是反過來的吧？」',set:{AN_WHITE_DAY:'reverse'},goto:'b'},{text:'「十一天以後妳就走了。」',set:{AN_WHITE_DAY:'eleven'},goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',text:'嗯。……打開以前先猜。'},{goto:'end'},   /* 三個回覆她各回一句（新寫）*/
      {label:'b'},{speaker:'heroine_01',text:'我查過了。所以我送。'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',text:'十一天。……我算過了。'},
      {label:'end'} ] };
  const FAR_VIDEO={ id:'ev_an_far_video', title:'以安的視訊', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'heroine_01',text:'（拿著一張照片對著鏡頭）町公所門口的通知。'},
      {speaker:'heroine_01',text:'最後一行我還是看不懂。……你幫我想。'},
      {choice:[{text:'「應該是叫大家準時倒垃圾。」',set:{AN_FAR_VIDEO:'trash'},goto:'a'},{text:'「把照片傳給我，我查。」',set:{AN_FAR_VIDEO:'check'},goto:'b'},{text:'「我也看不懂。」',set:{AN_FAR_VIDEO:'same'},goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',text:'……那我這三個禮拜都倒錯了。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',text:'好。查到了先跟我說。'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',text:'好。那我們兩個一起看不懂。'},   /* 回聲 J1 */
      {label:'end'} ] };

  /* ---------- 2-Y3-54 芷若「十二張點單」（BB_165 3-2，AA-C 10-18 審過、照 10-18 加註＝AA_343 D8；AA_185 1-3、AA_326 2-Y3-54）：8/5（六）14:00 兩點半（店休），和芷若交往中；日本路線 8/12 ---------- */
  const SLIPS={ id:'ev_zhiruo_twelve_slips', title:'十二張點單', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'兩點半 Café（店休）',bg:'cafe_closed'},   /* 打烊的兩點半，窗簾拉下來，只開吧檯燈（2D 沒有＝深色底＋字幕）*/
      {speaker:'heroine_02',text:'（開門）你敲了四下。……算了，進來。'},
      {speaker:'heroine_02',text:'吧檯借我們一個下午。投影機是二輪戲院的老闆借我的。他說，九月以前要還。'},
      {speaker:null,text:'（吧檯上排著十二張點單，每一張寫著一部電影的片名，最後一張是空白的。）'},
      {speaker:'heroine_02',text:'我不在的時候，一個月一部。看完，在點單背面寫一句，寄給我。'},
      {speaker:'heroine_02',text:'……我在那邊，也跟你同一天看。時差七個小時。算同一天。'},
      {speaker:'heroine_02',text:'第一部，我們現在看。'},
      {speaker:null,text:'（兩個人坐在吧檯前，看第一部。牆上的光照到她的側臉。片子演完，她沒有開燈。）'},
      {speaker:'heroine_02',text:'第十二張是空的。'},
      {speaker:'heroine_02',text:'那一部，等我回來，一起寫。'},
      {choice:[{text:'「空白那張，我可以先寫一個字嗎？」',goto:'a'},{text:'「十一部，我每一部都寫最長的。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',text:'不行。'},{speaker:null,text:'（她把那張收進自己的口袋）'},{speaker:'heroine_02',text:'那張我回來再拿出來。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'不要寫太長。我會在課堂上看，看到哭。'},{speaker:'heroine_02',text:'……好，寫長一點也可以。'},
      {label:'end'},{set:{ZR_TWELVE_SLIPS:true}} ],
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.slipsMissed(G,q); } };   /* 14:30 還沒到：16:00 照片＋「信封放在吧檯下面。下次來拿」（r2y3b3d.js）*/
  /* 沒到的：之後第一次在她上班的時候進 Café＝她從吧檯下面拿出信封；9/1 以前都沒拿（她 9/2 出國）＝之後第一次進 Café，老闆給（BB_165 3-2 的 10-18 加註，AA_343 D8）*/
  const SLIPS_BAR={ id:'ev_zhiruo_slips_bar', title:'吧檯下面的信封', participants:['heroine_02'], location:'cafe', trigger:'auto', once:true, npcPresent:'heroine_02', background:'blur',
    prereq:{custom:G=>{ const F=G.flags||{}; return F.ZR_SLIPS_WAIT==='bar'&&!F.ZR_TWELVE_SLIPS; }},
    dialogue:[ {speaker:'heroine_02',text:'下一部，你不准先看。'},{set:{ZR_TWELVE_SLIPS:'bar'}} ] };
  const SLIPS_OWNER={ id:'ev_zhiruo_slips_owner', title:'老闆給的信封', participants:[], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags||{}; return F.ZR_SLIPS_WAIT==='owner'&&!F.ZR_TWELVE_SLIPS; }},
    dialogue:[ {speaker:null,text:'（信封上是她的字：下一部，你不准先看。）'},{set:{ZR_TWELVE_SLIPS:'owner'}} ] };

  /* ---------- 2-Y3-46 芷若 Z13「杯子上的字」：6/15（四）22:00 兩點半 Café 打烊後吃完，她回吧檯收店（林芷若_角色企劃 Z13 原文；結果照 BB_98 3-4；台階那一段 AA 新寫）。
     飯的開場、話題池照 termend3d.js（r2y3b3d.js 的 S.z13Dinner）；這裡是吃完以後的杯子。ZR_CUP：'drank'／'steps'／'declined'（交往在 S.z13Dinner 照心意邀約的交往）---------- */
  const Z13=[ {speaker:null,text:'（她回到吧檯，收完機器，又做了一杯。是你的老樣子。可是杯子上用麥克筆寫的不是你的名字。）'},
    {speaker:null,text:'（是她自己的點法：「熱可可＋濃縮」。）'},
    cg('cg_cup_words_heroine02'),   /* BCG-08「杯子上的字」在這一句出現（CG_REGISTRY 登錄了才放；杯身的手寫字由遊戲疊，疊字還沒做）*/
    {speaker:null,text:'（她把杯子推過來，轉身去擦機器，沒有看你。）'},
    {speaker:'player',text:'……這不是我的。'},
    {speaker:'heroine_02',text:'（背對著他）我知道。'},
    {speaker:'heroine_02',text:'……'},
    {speaker:'heroine_02',text:'（很久，沒有轉過來）我的點法，我只給過一個人。'},
    {choice:[{text:'（喝下去）',set:{ZR_CUP:'drank'},goto:'d'},{text:'「芷若。」',set:{ZR_CUP:'steps'},goto:'s'},{text:'「這杯我不能喝。」',set:{ZR_CUP:'declined'},goto:'n'}]},
    {label:'d'},{speaker:null,text:'（她轉過來，看到你在喝，沒有說話。過了很久。）'},{speaker:'heroine_02',text:'……好喝嗎？'},{speaker:'player',text:'很幼稚。'},{speaker:'heroine_02',text:'對。'},{speaker:null,text:'（她笑出來，眼眶紅了一下。）'},{goto:'end'},   /* BB_98 3-4 改的結果；芷若／祐廷／芷若，「很久以後」寫成旁白（AA_343 D9 定稿）*/
    {label:'s'},{speaker:null,text:'（她停住。）'},{speaker:'heroine_02',text:'……你要說什麼，等一下再說。我現在沒辦法看你。'},
      {speaker:null,text:'（她把店收完，關了燈。你們坐在店門口的台階上。）'},{speaker:'heroine_02',text:'……好。你說。'},   /* 台階（AA_326 新寫）*/
      {choice:[{text:'「我喜歡妳。」',goto:'s1'},{text:'「那杯，我想喝。」',goto:'s2'}]},
      {label:'s1'},{speaker:'heroine_02',text:'……我知道。杯子上寫了。'},{speaker:null,text:'（她把臉埋在膝蓋上，過了一下才抬頭。）'},{speaker:'heroine_02',text:'好。'},{goto:'end'},
      {label:'s2'},{speaker:'heroine_02',text:'……已經冷了。'},{speaker:'player',text:'沒關係。'},{speaker:'heroine_02',text:'……好。'},{speaker:null,text:'（她回店裡把杯子拿出來。）'},{goto:'end'},
    {label:'n'},{speaker:'heroine_02',text:'……嗯。'},{speaker:null,text:'（她把杯子收回去，捧在手裡。）'},{speaker:'heroine_02',text:'那這杯我自己喝。我們還是朋友。'},{speaker:null,text:'（她笑了，是真的笑。）'},   /* BB_98 3-4 原文 */
    {label:'end'} ];
  const Z13_TXT={invite:['畢業以後我還有幾個班。','下禮拜四打烊以後，你要不要來？……店裡只剩我。'],   /* 6/8 邀約（BB_98 3-4，AA 的句子）；婉拒照 AA_254 第 4 節（同一般版）*/
    invite2:['畢業以後我還有幾個班。','下禮拜四打烊以後，你要不要來？……上次那句，你想好了嗎？'],   /* 上學期選了「讓我想想」的：第二次（AA_343 D10；杯子那一段不改）*/
    table:'我這學期翻了一本小說，翻到一半。……主角還沒說出口。',   /* AA_254 第 4 節的飯桌一句，放在 Z13 的飯裡（杯子那一段的伏筆，AA_343 D9）*/
    wait:'我多留半小時。……杯子已經寫好了。',   /* 22:15 還沒到：22:30 她傳（BB_98 10-1 第 9 項）*/
    bring:'（店裡只剩吧檯一盞燈。她在等你。）' };   /* 23:00 再沒到＝帶到場（R4）的旁白 */

  /* ---------- 2-Y3-47 子晴 Q15「存檔點」：邀約照 AA_254 第 5 節大四上那一版；飯桌一句（新寫，裁定 #26）；回家路上前三個選項換成 BB_165 4-1 的三句；隔天 12:00「回答.exe」（高子晴_角色企劃 原文）---------- */
  const Q15={ invite:['欸 你考完了吧 宵夜','只有我們兩個 不要找阿凱'],
    invite2:['欸 你考完了吧 宵夜','上次那個 你想好沒'],   /* 上學期選了「讓我想想」的：第二次（AA_343 D10；「先不說」那一支照一般版的 she2「我上次講的，沒有收回。……換你。」）*/
    table:'發表會那天的錄影，我爸看了三遍。……第三遍他在做筆記。',
    opts:[{k:'first_player',t:'「妳下一個遊戲，我也要當第一個玩的。」',r:'……第一個玩的要負責找 bug 喔。很多。',exe:'第一個玩家：{name}'},
      {k:'like_long',t:'「我喜歡妳。喜歡很久了。」',r:'……你不要現在講啦。',exe:'我也是。'},
      {k:'not_question',t:'「我喜歡妳。這不是問句。」',r:'……那是我的台詞。',exe:'這不是問句。'}],
    sure:'欸不是……你認真的？',   /* 說出來的三支都是這一句（這一場「欸不是」一次）*/
    run:['（她講話變快）我、我家到了。我先上去。',{narr:'（她跑進巷子。）'}],   /* BB_98 4-6 原文 */
    exe:'（《找插座的貓》的新關卡。貓找到了插座，插座旁邊坐著另一隻貓。兩隻貓一起充電。）',
    noReply:'好，我收到你的不回答了。我們還是最好的朋友。這次是直述句。', noReplyNQ:'好，我收到你的不回答了。我們還是最好的朋友。',   /* 選「這不是問句」的那一支拿掉「這次是直述句。」（裁定 #27）；AA_296 2-3-1 ② 起是不回的那通電話沒接的替代版 */
    exeOpts:['（回一張插座貓貼紙）','（還沒想好怎麼回）'] };   /* AA_296 2-3-1 ②（企劃線 3f406dbc）：回答.exe 最後那一行字疊完，直接在場面裡給的兩個選項 */
  /* ---------- 2-Y3-47 Q15 的兩通電話（AA_296 2-3-1 ②，企劃線 3f406dbc；新寫）：有沒有在一起不再只靠手機回貼紙 ----------
     回了貼紙＝她馬上打來（場面裡選的＝回答.exe 演完接著演；手機回的＝OUT 的電話）；到期限（收到檔案的隔天 21:00）還是沒回＝21:00 她打來（沒接＝原本那一則私訊，r2y3b3d.js 的 q15NoReplyDm）*/
  const NQ={custom:G=>((G.flags||{}).ZQ_Q15||{}).k==='not_question'};
  const EXE_CALL={ id:'ev_ziqing_exe_call', title:'電話', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（手機震了。是她打來的。）'},
      {speaker:'heroine_04',text:'……你回貼紙喔。'},
      {speaker:'heroine_04',text:'插座貓的意思，你知道吧。'},
      {speaker:'player',text:'知道。'},
      {speaker:'heroine_04',text:'……好啦。'},
      {speaker:'heroine_04',text:'那、那明天見。'},
      {speaker:null,text:'（她先掛了。）'} ] };
  const NOREPLY_CALL={ id:'ev_ziqing_noreply_call', title:'電話', participants:['heroine_04'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（晚上九點。她打來了。）'},
      {speaker:'heroine_04',text:'……你沒回耶。'},
      {speaker:'heroine_04',text:'好，我收到你的不回答了。'},
      {speaker:'heroine_04',text:'我們還是最好的朋友。'},
      {unless:NQ,speaker:'heroine_04',text:'這次是直述句。'},   /* not_question 那一支一樣拿掉最後一句（裁定 #27）*/
      {speaker:null,text:'（她沒有等你說話，就掛了。）'} ],
    after:G=>{ const x=X(); if(x) x.q15NoReply(G); },
    outingMissed:G=>{ const x=X(); if(x) x.q15NoReplyDm(G); } };

  const ALL=[FIRST_MEAL,R228,AZALEA,C6,K18,K18_CALL,XUN,YU4,YU4_CALL,J1,G10,TOAST,SAKURA,FAR,FAR_US,YU5,YU5_NOODLE,YU5_VIDEO,Z11B,KX_BD,XC,XC_VIDEO,J2,J2_REPAIR,K20,K20_CALL,F3,F3_CAFE,X1US,AB_VIDEO,TANABATA,AN_AIRPORT,AN_NOTEBOOK,WHITE,FAR_VIDEO,SLIPS,SLIPS_BAR,SLIPS_OWNER,EXE_CALL,NOREPLY_CALL];
  ALL.AB=AB;   /* 以安在日本的訊息池、視訊、七夕的五段（r2y3b3d.js 用）*/
  ALL.Z13=Z13; ALL.Z13_TXT=Z13_TXT; ALL.Q15=Q15;   /* 學期末專屬版（r2y3b3d.js 包住 TERMEND）*/
  return ALL;
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y3B_EVENTS);
