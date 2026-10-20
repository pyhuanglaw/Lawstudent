/* ===== 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54（AA-C 定稿 e284d601，第②級；台詞照原文、不改字）=====
   這裡是用事件系統演的段落（出遊、在場景裡碰到的、電話、視訊）；手機、時間窗、出發選單、寒暑假的停留日、學期末專屬版在 src/r2y3b3d.js（R2Y3B）。
   2-Y3-26 ev_y3s2_first_meal　27 ev_y3s2_228　28 ev_an_azalea_y3　29 ev_yu_club_money　30 ev_kexin_k18（＋ev_kexin_k18_call）
   2-Y3-31 ev_xun_path　33 ev_yu_alone_breakfast（＋_call）　34 ev_an_konbini　35 ev_liheng_japan　36 ev_y3s2_roof_toast　37 ev_an_sakura_riverbank
   2-Y3-38 ev_far_call_jp　39 ev_yu_alone_movie（傅鐘／麵店／視訊）　40 ev_zhiruo_third_row　41 ev_kexin_birthday_y3　42 ev_xinci_first_place（＋_video）
   2-Y3-43 ev_an_town_notice（＋ev_an_town_notice_repair）　44 ev_kexin_k20（＋_call）　45 ev_fangyt_tickets（電話）、ev_zhiruo_f3_cafe
   2-Y3-51 ev_x1_moveout_us　52 ev_an_abroad_video、ev_an_tanabata、ev_an_airport_y3、ev_an_notebook　53 ev_an_white_day、ev_an_far_video
   2-Y3-54 ev_zhiruo_twelve_slips（BB_165 3-2，AA-C 10-18 審過的台詞）；46、47（學期末專屬版）在 r2y3b3d.js 接 TERMEND。
   不重做：32（AA_322）、48（AA_317）、50（AA_322、AA_323）。測試：node tests/r2y3b_events_unit.js */
'use strict';
const R2Y3B_EVENTS=(function(){
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const kn=(...ids)=>({custom:G=>ids.every(id=>knows(id,G))});
  const stAt=(G,id,st)=>knows(id,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=(id,st)=>({custom:G=>stAt(G,id,st||'FAMILIAR')});
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const dt=id=>({custom:G=>dating(G,id)});
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const JP={custom:G=>route(G)==='JP'};
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const cg=id=>({if:{custom:()=>hasCG(id)},cg:id});   /* CG 登錄了才放（CG_REGISTRY；沒有就照原背景演）*/
  const X=()=>typeof R2Y3B!=='undefined'?R2Y3B:null;
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

  /* ---------- 2-Y3-27 228 河濱：2028-02-28（一）14:00～17:00 公館河濱（2/27 21:00 阿哲揪；沒去＝17:30 小語在群組）---------- */
  const R228={ id:'ev_y3s2_228', title:'228 河濱', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（新店溪的河濱。小語的風箏飛了三次，掉了三次。）'},
      {if:kn('yu'),speaker:'yu',text:'風不對！不是我的問題！'},
      {if:kn('zhe','yu'),speaker:'zhe',text:'（躺在草地上）妳的問題。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（坐在階梯上，手帳攤開）三月二十五號以前，還有四個週末。'},
      {if:kn('classmate_bohan','heroine_01'),speaker:'classmate_bohan',text:'三個半。今天放假，不算。'},
      {choice:[{text:'「我來放。」',goto:'k'},{text:'（坐到以安旁邊）',if:kn('heroine_01'),goto:'a'},{text:'（躺到阿哲旁邊）',if:kn('zhe'),goto:'z'}]},
      {label:'k'},{if:kn('yu'),speaker:null,text:'（風箏飛起來了。小語把線搶過去：「看吧！是風的問題！」）'},{goto:'end'},
      {label:'a'},{speaker:'heroine_01',text:'……你也要算嗎？'},{speaker:null,text:'（她把手帳轉過來：四個週末，每一格都還空著。）'},{goto:'end'},
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
      {mem:[{npc:'heroine_01',tag:'AN3_AZALEA',note:'幫她拍了第三張杜鵑'}]} ] };

  /* ---------- 2-Y3-29 C6 小語的社團經費：3/16（四）12:30～13:00 霖澤館一樓（3/15 21:00 她私訊、回「有。」才約；手機版在 r2y3b3d.js）---------- */
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
      {unless:{custom:wishKx},speaker:'kexin',text:'這次不排行程表。'},
      {if:{custom:wishKx},speaker:'kexin',text:'這次也不排。跟外澳那次一樣。'},
      {scene:'山裡的舊車站',bg:'trip_oldrail'},   /* 2D trip_oldrail 待生成（G5-09）：沒有圖＝深色底＋地點字幕 */
      {speaker:null,text:'（山裡的舊車站。月台還在，鐵軌已經不走火車了。遠一點，是一座只剩橋墩的紅磚橋。）'},
      {speaker:'kexin',text:'這裡的火車，很久以前就不來了。'},
      {speaker:'kexin',text:'……可是月台還在等。'},
      {choice:[{text:'「月台在等誰？」',goto:'a'},{text:'「走到那座斷橋？」',goto:'b'},{text:'（在月台上坐一下）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',text:'……不知道。我亂講的。'},{speaker:null,text:'（她笑了一下。）'},{speaker:'kexin',text:'走啦，去看那座橋。'},{goto:'back'},
      {label:'b'},{speaker:null,text:'（你們走了四十分鐘。她在橋墩下站了很久。）'},{speaker:'kexin',text:'……腳好痠。回去我要在車上睡。'},{goto:'back'},
      {label:'c'},{speaker:null,text:'（她把頭靠在你肩上，說了一句「好安靜」，就沒有再說話。）'},
      {label:'back'},{scene:'車上',bg:'car_night'},
      {speaker:'kexin',text:'下一站要去哪裡，回去再想。……不對，不想。'},
      {set:{KX_K18:'trip'}} ],
    consequences:{memo:'和可昕去山裡的舊車站（一天）'},
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.k18Missed(G,GM,q); } };
  /* 答應了、08:15 還沒到：演出來的電話（新寫）*/
  const K18_CALL={ id:'ev_kexin_k18_call', title:'可昕', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.05, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊有車子經過的聲音。）'},
      {speaker:'kexin',text:'你在哪。'},
      {speaker:'player',text:'……還在家。'},
      {speaker:'kexin',text:'……我叫予樂了。'},
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
  const YU4_W=[ {label:'w'},{speaker:'yu',text:'對。'},{speaker:null,text:'（她笑。）'},{speaker:'yu',text:'他昨天傳了十二部電影給我。……我一部都不要看他選的。'},{goto:'end'},
    {label:'q'},{speaker:'yu',text:'……還不知道。'},{speaker:null,text:'（她看著傅鐘。）'},{speaker:'yu',text:'所以才要留一個晚上。'},{goto:'end'} ];   /* 檔尾裁定 #17 */
  const YU4={ id:'ev_yu_alone_breakfast', title:'一個人的晚上', participants:['yu'], location:'campus', trigger:'auto', once:true, term:['Y3S2'], weeks:[3,4,5,6], weekday:[1,2,3,4,5], time:[9.5,12], npcNear:'yu', background:'blur',
    prereq:{stage:{npc:'yu',min:'FAMILIAR'},custom:G=>{ const x=X(); return !!x&&!x.inJP(G); }},
    dialogue:[ {speaker:null,text:'（她一個人在吃早餐。這次她沒有戴耳機。）'},
      {speaker:'yu',text:'欸，我在練習。一個人吃早餐。'} ].concat(YU4_TAIL,[
      {choice:[{text:'「他很怕妳無聊。」',set:{YU4:'worry'},goto:'w'},{text:'「妳一個人的晚上要做什麼？」',set:{YU4:'what'},goto:'q'},{text:'（坐下來，一起吃，不說話）',set:{YU4:'sat',YU4_ALONE:true},mem:[{npc:'yu',tag:'YU4_SAT',note:'她練習一個人吃早餐，你坐下來一起吃'}],goto:'s'}]}],
      YU4_W,[
      {label:'s'},{speaker:null,text:'（兩個人把早餐吃完。她站起來。）'},{speaker:'yu',text:'欸，你剛剛都沒講話。'},{speaker:'yu',text:'……我也沒有。'},{speaker:null,text:'（她把早餐的紙袋摺成一小塊。）'},   /* 檔尾裁定 #17 */
      {label:'end'} ]) };   /* YU4_ALONE：尾聲小語那一句「語 4 坐下來一起吃」（postgrad3d.js 讀，AA_319 1A-20）*/
  const YU4_CALL={ id:'ev_yu_alone_call', title:'小語', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {if:JP,scene:'視訊',bg:'video'},{unless:JP,scene:'電話'},
      {speaker:'yu',text:'欸，我在練習。今天早上一個人吃早餐。'} ].concat(YU4_TAIL,[
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
      {if:kn('yu','heroine_01'),speaker:null,text:'（小語把手機拿給大家看：一片很厚的吐司，旁邊攤著一本手帳。）'},
      {if:kn('classmate_xinci'),speaker:'classmate_xinci',text:'……我們的比較薄。可是我們有四種果醬。'},
      {choice:[{text:'「我來烤。」',goto:'a'},{text:'（拍一張傳給以安）',if:fam('heroine_01','FRIEND'),goto:'b'},{text:'「期中考完再來一次？」',goto:'c'}]},
      {label:'a'},{speaker:null,text:'（第一片烤焦了。阿哲：「焦的給我。」）'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（十分鐘後，以安回了一張照片：同一片厚吐司，咬了一口。）'},{phone:'heroine_01',text:'這邊也是晚上。'},{goto:'end'},
      {label:'c'},{if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'期中考完是第十週。我記一下。'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_ROOF_TOAST:true},memo:'清明，宿舍頂樓烤吐司'},
    outingMissed:G=>{ const x=X(); if(x) x.toastPhoto(G); } };

  return [FIRST_MEAL,R228,AZALEA,C6,K18,K18_CALL,XUN,YU4,YU4_CALL,J1,G10,TOAST];
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y3B_EVENTS);
