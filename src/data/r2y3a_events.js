/* ===== 第 2 輪之二：大三（含大二暑假、大三寒假）的事件——2-Y3-01～2-Y3-25（AA_326，AA-C 2026-10-20 定稿 e284d601；第②級，台詞照原文、不改字）=====
   這裡是用事件系統演的段落（出遊、電話、視訊、人在場景裡碰到的）；手機、出發、作息（人放在哪裡）、課堂段、日本路線退宿在 src/r2y3a3d.js。
   2-Y3-01 ev_kexin_trip_summer_y2（8/7 左營→旗津）→ ev_kexin_qixi_y2（8/8 港邊的山上）；ev_kexin_kh_missed_call（答應了沒出發）；ev_kexin_qixi_video（其他年份、沒去的七夕視訊）
   2-Y3-02 ev_fangyt_mountain　2-Y3-03 ev_y3_welcome　2-Y3-04 ev_y3_first_meal　2-Y3-05 ev_zhe_captain　2-Y3-06 ev_kexin_30min
   2-Y3-07 ev_kexin_lecture_ntu（一起聽）、ev_kexin_lecture_table（她自己聽、博雅一樓的小桌子）　2-Y3-08 ev_ziqing_dad_stuck（id 一定用這個：閒聊階梯在讀）
   2-Y3-09 ev_typhoon_y3_noodle（T3a）、ev_typhoon_y3_family（T3b 選「我會上線」的 10/14 線上那一段）　2-Y3-10 ev_kexin_call_helper（id 一定用這個）、ev_kexin_call_helper2
   2-Y3-11 ev_crimpro_court_visit　2-Y3-12 ev_xinci_bad_line　2-Y3-13 ev_an_admin_court　2-Y3-14 ev_bohan_third_floor　2-Y3-15 ev_fair_booth_y3、ev_fair_booth_y3_pass
   2-Y3-16 ev_zhe_scooter　2-Y3-17 ev_yt_lease_renew、ev_yt_lease_retell　2-Y3-18 ev_xinci_an_answers、ev_xinci_an_answers_far　2-Y3-19 ev_kexin_tutor_practice、ev_kexin_juniors_dinner、ev_kexin_juniors_video
   2-Y3-20 ev_yt_thursday_free　2-Y3-21 ev_kexin_xmas_y3　2-Y3-22 已在 AA_321（1B-11）　2-Y3-23 只有手機（r2y3a3d.js）　2-Y3-24 ev_kexin_valentine_y3　2-Y3-25 退宿是 r2y3a3d.js 的 S.x1Jp（記 ev_x1_moveout_jp）
   CG：這一批用到的（可昕七夕、CG-16 起立）都沒有登錄、也不放（AA_326 第 5 節第 1 點、裁定 #36）。測試：node tests/r2y3a_events_unit.js */
'use strict';
const R2Y3A_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const kn=(...ids)=>({custom:G=>ids.every(id=>knows(id,G))});
  const nkn=id=>({custom:G=>!knows(id,G)});
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const dt=id=>({custom:G=>dating(G,id)}), ndt=id=>({custom:G=>!dating(G,id)});
  const stAt=(G,id,st)=>knows(id,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=(id,st)=>({custom:G=>stAt(G,id,st||'FAMILIAR')});
  const hh=G=>((G.hour%24)+24)%24;
  const on=(G,key,h0,h1)=>{ const d=D(key), x=hh(G); return d!=null&&G.day===d&&x>=h0&&x<h1; };
  const toH=h=>G=>{ const x=hh(G); return h>x?h-x+1e-6:0; };   /* advance：跳到當天的某個時間（已經過了就不動）*/
  const R=()=>typeof R2Y3A!=='undefined'?R2Y3A:null;
  const mem=(npc,tag,note)=>({mem:[{npc,tag,note:note||''}]});
  const fl=(k,v)=>({flagIs:{[k]:v}});

  /* ---------- 2-Y3-01 可昕 KH「高雄的兩天」＋七夕（裁定 #35、#36、#29）：接人照「去她的縣市」的 pick／pickAgain（hometown_lines.js，不重寫）----------
     去過高雄（HV_N.kexin，含這一趟以前的一般「去她的縣市」）用 pickAgain。first／again 輪流那一套這一次不用（AA_326 第 6 節第 1 點）*/
  const KHL=(typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES.kexin)||null;
  const khAgain=G=>!!(G.flags&&G.flags.HV_N&&(G.flags.HV_N.kexin|0)>0);
  const pickLines=(P,cond)=>((P&&P.lines)||[]).map(x=>typeof x==='string'?{if:cond,speaker:'kexin',expression:'neutral',text:x}:{if:cond,speaker:null,text:x.narr});
  const KH_A={ id:'ev_kexin_trip_summer_y2', title:'高雄的兩天', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5, kxAway:true,   /* hours：回程的高鐵；kxAway：最後她在閘門外，不接她的閒聊階梯 */
    beforeOuting:async(G,GM,q)=>{ const r=R(); if(r) r.khPay(G,GM); },   /* 高鐵（2980）、旅館一晚 */
    dialogue:[ {scene:'左營站',bg:'kh_station'},
      ...pickLines(KHL&&KHL.pick,{custom:G=>!khAgain(G)}), ...pickLines(KHL&&(KHL.pickAgain||KHL.pick),{custom:khAgain}),
      {speaker:'kexin',expression:'tired',text:'這週我影印了一千兩百頁。今天不要有紙。'},
      {speaker:'kexin',expression:'teasing',text:'……行程表除外。'},
      {speaker:null,text:'（她把手機轉過來。今天的行程表只有三行：渡輪、燈塔、吃東西。）'},
      {scene:'高雄・旗津',bg:'kh_cijin'},   /* 地點字幕；旗津的背景還沒有，kh_cijin＝港邊的圖（outings3d.js）*/
      {speaker:null,text:'（渡輪只開十分鐘。她站在船邊，頭髮一直被風吹到臉上，她也不管。）'},
      {speaker:null,text:'（太陽很大。她把防曬乳擠了兩次，一次給你。）'},
      {speaker:null,text:'（燈塔在山坡上。爬到一半，她停下來喘氣。）'},
      {speaker:'kexin',expression:'thinking',text:'我住高雄二十年，沒上來過。'},
      {speaker:'kexin',expression:'neutral',text:'國中的時候覺得，這是觀光客來的地方。'},
      {choice:[{text:'「那今天妳是觀光客。」',goto:'k1'},{text:'「上面風好大。」',goto:'k2'},{text:'（陪她看海，不說話）',goto:'k3'}]},
      {label:'k1'},{speaker:'kexin',expression:'smile',text:'對。觀光客要拍照。'},{speaker:null,text:'（她把手機塞給你。）'},{speaker:'kexin',expression:'serious',text:'拍我，還有後面的海。不要拍到別人。'},{goto:'eve'},
      {label:'k2'},{speaker:'kexin',expression:'smile',text:'下面更熱。……再站一下。'},{speaker:null,text:'（她靠著欄杆，看了很久的海。）'},{goto:'eve'},
      {label:'k3'},{speaker:null,text:'（你們站在欄杆邊。過了很久，她才開口。）'},{speaker:'kexin',expression:'smile',text:'……好。下次換你。去一個你也沒去過的地方。'},
      {label:'eve'},{advance:toH(18)},
      {speaker:null,text:'（她騎車送你到旅館門口，沒有熄火。）'},
      {speaker:'kexin',expression:'teasing',text:'明天下午四點，我開車來。……今天早點睡，不要滑手機。'},
      {set:{KX_KH_DAY1:true}} ],
    after:(G,GM)=>{ const r=R(); if(r) r.khNight(G,GM); },   /* 旅館一晚（不演室內）：日期往後到 8/8 16:00 */
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.khMissed(G,q); },   /* C：09:30 還沒到左營＝她打來；18:00 燈塔的照片；8/8 照 D 的視訊；KX_RUB +1 */
    next_event:'ev_kexin_qixi_y2' };
  const KH_B={ id:'ev_kexin_qixi_y2', title:'七夕', participants:['kexin'], location:'any', trigger:'manual', once:true, background:'dark',
    prereq:{custom:G=>!!(G.flags&&G.flags.KX_KH_DAY1)&&G.day===D('2027-08-08')},
    dialogue:[ {speaker:null,text:'（下午四點，一台舊舊的家用車停在旅館門口。她沒有下車，按了一下喇叭。）'},
      {speaker:'kexin',expression:'teasing',text:'上車。……音樂你管。'},
      {advance:toH(19.5)},
      {scene:'高雄・港邊的山上',bg:'kh_river_night'},   /* BG-DARK-70-1021（BB_220★）：晚上那 7 句先用 kh_river_night 暫代（河邊步道，不是山上；之後換新圖 kh_hill_harbor_night）；原本：背景沒有：深色底＋字幕（第 5 節）；可昕七夕 CG 還沒生成（構圖要改高雄港），沒有以前不放 */
      {speaker:null,text:'（天黑以後，整個港口的燈都亮了。船慢慢開進來。）'},
      {speaker:'kexin',expression:'thinking',text:'牛郎織女要等一年。'},
      {speaker:'kexin',expression:'smile',text:'……我們有車。'},
      {choice:[{text:'「還有高鐵。」',goto:'q1'},{text:'「明年也來？」',goto:'q2'},{text:'（把頭靠在她肩上）',goto:'q3'}]},
      {label:'q1'},{speaker:'kexin',expression:'smile',text:'高鐵要錢。車也要錢。……好啦，都算。'},{goto:'back'},
      {label:'q2'},{speaker:'kexin',expression:'serious',text:'明年我在哪裡還不知道。……你先記著。'},{goto:'back'},
      {label:'q3'},{speaker:'kexin',expression:'embarrassed',text:'……很重。'},{speaker:null,text:'（她沒有推開。）'},
      {label:'back'},{advance:toH(21.5)},
      {scene:'左營站',bg:'kh_station'},
      {speaker:null,text:'（九點半，左營站。她把車停在下客處，沒有熄火。）'},
      {speaker:'kexin',expression:'smile',text:'到了傳給我。……這次有住一晚。很好。'},
      {speaker:null,text:'（她等你走進閘門，才把車開走。）'} ],
    after:(G,GM)=>{ const r=R(); if(r) r.khDone(G); } };
  /* C. 答應了、沒出發（8/7 09:30 還沒到左營）：演出來的電話（AA_313 2-3 的做法）*/
  const KH_CALL={ id:'ev_kexin_kh_missed_call', title:'電話', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.05, kxAway:true,   /* 電話：之後不接她的閒聊階梯（BB_130 只在見面、視訊推進）*/
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊很吵，是車站的廣播。）'},
      {speaker:'kexin',expression:'serious',text:'你在哪。'},
      {speaker:'player',text:'……還在臺北。'},
      {speaker:'kexin',expression:'annoyed',text:'……好。行程表我自己走。'},
      {speaker:null,text:'（她掛掉了。）'} ] };
  /* D. 其他年份的七夕、或這一趟沒去的（她在高雄，視訊）：2026-08-19、2027-08-08、2028-08-26 21:00（r2y3a3d.js 排）。不是 once：每一年用同一個事件 */
  const QIXI_VIDEO={ id:'ev_kexin_qixi_video', title:'七夕', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'七夕。……牛郎織女要等一年。'},
      {speaker:'kexin',expression:'teasing',text:'我們等兩個禮拜。開學前兩天我就上去了。'} ],
    after:G=>{ const r=R(); if(r) r.qixiVideoDone(G); } };

  /* ---------- 2-Y3-02 方奕廷 F2「山上沒有訊號」（裁定 #1、#2）：7/24（或 8/21）06:30 臺北車站的客運站出發，傍晚在紅檜前面；19:00 前回到臺北 ---------- */
  const F_HINT={memory:[{npc:'npc_fangyt',tag:'FANG_HINT'}]}, Z_REM={memory:[{npc:'heroine_02',tag:'REMEMBERED_HER'}]};
  const MOUNTAIN={ id:'ev_fangyt_mountain', title:'山上沒有訊號', participants:['npc_fangyt'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'中部的山・檜木林步道',bg:'cypress_trail'},
      {speaker:null,text:'（客運坐了三個多小時，再走兩個小時的步道。手機在半路就沒有訊號了。）'},
      {advance:toH(16.5)},
      {speaker:null,text:'（傍晚，一棵很粗的樹前面。方奕廷把背包放下來。）'},
      {speaker:'npc_fangyt',text:'這棵紅檜大概一千歲。'},
      {speaker:'npc_fangyt',text:'它長得很慢。樹幹一年粗不到一公分。'},
      {speaker:'npc_fangyt',text:'我有時候覺得，有些事慢一點也沒關係。'},
      {choice:[{text:'「你是在說芷若嗎？」',if:F_HINT,goto:'f1'},{text:'「你是在說我嗎？」',goto:'f2'},{text:'（看著樹，不說話）',goto:'f3'}]},
      {label:'f1'},{speaker:null,text:'（他笑了，很久沒講話。）'},{speaker:'npc_fangyt',text:'……我在說樹。'},{speaker:null,text:'（走了十步。）'},{speaker:'npc_fangyt',text:'好啦。也有一點。'},{goto:'zr'},
      {label:'f2'},{speaker:'npc_fangyt',text:'你？你是那種走很快的人。'},
      {choice:[{text:'「我其實換過一次跑道。」',goto:'f2a'},{text:'「也許吧。」',goto:'f2b'}]},
      {label:'f2a'},{speaker:'npc_fangyt',text:'……所以你也慢過。'},{speaker:null,text:'（他想了一下。）'},{speaker:'npc_fangyt',text:'我比較羨慕你。'},
        (mem('npc_fangyt','FANG_KNOWS_ECON')),{goto:'zr'},
      {label:'f2b'},{speaker:'npc_fangyt',text:'偶爾慢一點也沒關係。'},{goto:'zr'},
      {label:'f3'},{speaker:null,text:'（兩個人看到天色暗下來。下山時他說：）'},{speaker:'npc_fangyt',text:'下次帶你去看更老的。'},
      {label:'zr'},
      {if:Z_REM,speaker:'npc_fangyt',text:'芷若最近跟我說，有人記得她喝什麼。'},
      {if:Z_REM,speaker:'npc_fangyt',text:'我只記得她看什麼電影。喝什麼，我不知道。'},
      {if:Z_REM,speaker:'npc_fangyt',text:'……這樣很好。'},
      {advance:toH(18.5)},
      {speaker:null,text:'（下山的時候，手機一直跳出訊息。你一則都沒點開。）'},
      {set:{FANG_F2:'went'}},(mem('npc_fangyt','MOUNTAIN_DAY')) ],
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.f2Missed(G,q); } };

  /* ---------- 2-Y3-03 迎新（大三版）：9/4（六）13:00 社科院旁的草地，大三是關主。大二當過小隊輔（Y2_WELCOME＋MENTOR_WHY）＝去年那個學弟；沒有＝隔壁阿哲的口號（認識阿哲才有）---------- */
  const WHY=typeof MENTOR_WHY_TEXT!=='undefined'?MENTOR_WHY_TEXT:{};
  const mentor={flags:['Y2_WELCOME','MENTOR_WHY']}, noMentor={custom:G=>!(G.flags&&G.flags.Y2_WELCOME&&G.flags.MENTOR_WHY)};
  const WELCOME={ id:'ev_y3_welcome', title:'迎新（大三版）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'社科院旁的草地',bg:'ntu_soc'},
      {speaker:null,text:'（社科院旁的草地。新生一隊一隊經過，脖子上掛著名牌。）'},
      {speaker:null,text:'（你這一關在草地最裡面：一張桌子、一疊題目卡。）'},
      {speaker:'新生',text:'學長，這一關要做什麼？'},
      {choice:[{text:'「抽一張，答對就過。」',goto:'w1'},{text:'「先自我介紹。」',goto:'w2'}]},
      {label:'w1'},{speaker:null,text:'（第一張卡：「民法第一條寫什麼？」新生想了很久。）'},{speaker:'新生',text:'……學長，可以換一張嗎？'},{goto:'w3'},
      {label:'w2'},{speaker:null,text:'（他們一個一個講名字。講到第四個，你已經忘了第一個。）'},
      {label:'w3'},
      {if:mentor,speaker:null,text:'（有人從後面拍你的肩。是去年你那一隊的學弟，脖子上掛著「小隊輔」的名牌。）'},
      {if:mentor,speaker:'學弟',text:'學長。我今年帶隊了。'},
      ...Object.keys(WHY).map(k=>({if:{flags:['Y2_WELCOME'],flagIs:{MENTOR_WHY:k}},speaker:'學弟',text:'去年你說「'+WHY[k]+'」……我還在想我的。'})),   /* MENTOR_WHY_TEXT（events.js）＝大二選的那一句；它本身有句號，引號外面不再加（AA_343 B2）*/
      {if:mentor,choice:[{text:'「慢慢想。」',goto:'m1'},{text:'「想到了跟我說。」',goto:'m2'}]},
      {if:mentor,goto:'end'},
      {if:{custom:G=>!(G.flags.Y2_WELCOME&&G.flags.MENTOR_WHY)&&knows('zhe',G)},speaker:null,text:'（隔壁那一關是阿哲。他在教新生喊口號。）'},
      {if:{custom:G=>!(G.flags.Y2_WELCOME&&G.flags.MENTOR_WHY)&&knows('zhe',G)},speaker:'zhe',text:'大碗！'},
      {if:{custom:G=>!(G.flags.Y2_WELCOME&&G.flags.MENTOR_WHY)&&knows('zhe',G)},speaker:'新生',text:'……大碗。'},
      {goto:'end'},
      {label:'m1'},{speaker:'學弟',text:'好。……學長，你們這關太難了，我的組員在抱怨。'},{goto:'end'},
      {label:'m2'},{speaker:'學弟',text:'好。'},{speaker:null,text:'（他跑回他那一隊。）'},
      {label:'end'},
      {speaker:null,text:'（三點半，最後一隊走了。你把題目卡收回盒子裡，少了兩張。）'} ],
    consequences:{flags:{Y3_WELCOME:true},memo:'大三的迎新（關主）'},
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.welcomePhoto(G); } };

  /* ---------- 2-Y3-04 開學第一頓（大三上）：9/9（四）19:00 長桌；只有認識的人說話。語彤 13b 還沒演、和她 FRIEND 以上＝她端麵過來的時候先演 13b（1B-08 的那一段，y2b_events.js）---------- */
  const TA_SRC=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_yt_ta_news'):null;
  const TA_DUE={custom:G=>!(G.flags&&G.flags.YT_TA)&&!done(G,'ev_yt_ta_news')&&!done(G,'ev_yt_ta_news_lib')&&stAt(G,'heroine_03','FRIEND')};
  const TA_LINES=((TA_SRC&&TA_SRC.dialogue)||[]).map(l=>l.label?Object.assign({},l):Object.assign({},l,{if:TA_DUE}));   /* 標籤照原本的（t1～t3），這裡的標籤用 fm_ 開頭不撞 */
  const FIRST_MEAL={ id:'ev_y3_first_meal', title:'開學第一頓', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:50/60,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的長桌。阿姨換了新的菜單，每一樣多五塊。）'},
      {if:kn('zhe'),speaker:'zhe',text:'五塊。……大三就是這種感覺。'},
      {if:kn('yu'),speaker:'yu',text:'欸，這學期刑訴，聽說林教授點名都點後面。'},
      {if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'後面三排。我問過學長了。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（翻開手帳）讀書會八點。……我們先走。'},   /* AA_376 #7：讀書會當晚 20:00 就開；19:40 以安、Alison、柏翰一起先走（下面 fm_end 以後，同 10/21 那一場）*/
      ...TA_LINES,
      {if:kn('heroine_03'),speaker:'heroine_03',text:'（端麵過來）……今天乾麵剩四碗。'},
      {choice:[{text:'「先吃。」',goto:'fm_a'},{text:'「真的點後面三排？」',if:kn('classmate_bohan'),goto:'fm_b'}]},
      {label:'fm_a'},{if:kn('zhe'),speaker:'zhe',text:'對。先吃。'},{goto:'fm_end'},
      {label:'fm_b'},{speaker:'classmate_bohan',text:'真的。所以我坐第一排。'},
      {label:'fm_end'},{advance:toH(19+40/60)} ],   /* AA_376 #7：19:40 以安、Alison、柏翰先走（照 10/21 ev_an_admin_court 的做法）；之後只剩留下來的人，坐到 20:30（hours 照剩下的 50 分鐘）*/
    consequences:{flags:{Y3_FIRST_MEAL:true},memo:'大三的開學第一頓'},
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.firstMealPhoto(G); } };

  /* ---------- 2-Y3-05 哲 3「隊長」（裁定 #3）：9/10（五）17:30～19:00 新體育館旁的籃球場（作息在 r2y3a3d.js：阿哲、明軒站在場上）；和阿哲 FAMILIAR 以上，走到他旁邊就演 ---------- */
  const Z2NS={flagIs:{ZHE2:['notes','study']}};
  const CAPTAIN={ id:'ev_zhe_captain', title:'隊長', participants:['zhe'], location:'campus', trigger:'auto', once:true, background:'blur', near:{npc:'zhe',r:6},
    prereq:{custom:G=>on(G,'2027-09-10',17.5,19)&&stAt(G,'zhe','FAMILIAR')},
    dialogue:[ {speaker:'zhe',text:'（把隊長臂章在手上轉）學長說，現在我是隊長。'},
      {speaker:'zhe',text:'很好笑吧。我自己的民法差點被當。'},
      {if:kn('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'（運球經過）你民法過了啦。'},
      {if:nkn('classmate_mingxuan'),speaker:null,text:'（有人運球經過，說了一句什麼，阿哲笑了。）'},
      {speaker:'zhe',text:'……對。過了。（對祐廷）你看，他都知道。'},
      {if:{custom:G=>G.flags.MX_3ON3==='missed'},speaker:'zhe',text:'對了。三對三那次，你欠的。'},   /* AA_356 1-2：大二下三對三沒去（「你欠我們一次」）的下文 */
      {if:{custom:G=>G.flags.MX_3ON3==='missed'},speaker:null,text:'（你去球場旁邊的販賣機，買了三罐運動飲料。阿哲拿了兩罐，一罐丟給剛剛運球經過的人。）'},
      {if:{custom:G=>G.flags.MX_3ON3==='missed'},speaker:'zhe',text:'好。清了。',consequences:{money:-75},set:{MX_3ON3:'repaid'}},
      {if:Z2NS,speaker:'zhe',text:'我民法是靠你過的。這季的記分板，你來。'},
      {if:fl('ZHE2','self'),speaker:'zhe',text:'你那時候叫我自己來。……我自己來了。'},
      {choice:[{text:'「恭喜，隊長。」',goto:'c1'},{text:'「記分要記什麼？」',if:Z2NS,goto:'c2'}]},
      {label:'c1'},{speaker:'zhe',text:'不要叫隊長。……好啦，今天可以。'},{goto:'c3'},
      {label:'c2'},{speaker:'zhe',text:'記我投進幾顆。少記一顆，你請。'},
      {label:'c3'} ],
    consequences:{flags:{ZHE3:true},memo:'阿哲當上隊長'} };

  /* ---------- 2-Y3-06 可昕 K15「三十分鐘的晚餐」：9/22（三）18:00～18:30 公館。吃什麼：麵店／便利商店／水餃（背景跟著換）---------- */
  const THIRTY={ id:'ev_kexin_30min', title:'三十分鐘的晚餐', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5, kxAway:true,   /* 最後她先走了 */
    dialogue:[ {scene:'公館',bg:'gongguan'},
      {choice:[{text:'「麵店。阿姨的麵三分鐘就來。」',goto:'e1'},{text:'「便利商店。」',goto:'e2'},{text:'「妳選。」',goto:'e3'}]},
      {label:'e1'},{scene:'阿鳳麵店・長桌',bg:'noodle_table'},{speaker:'kexin',expression:'surprised',text:'你們的麵店？好。我還沒在週三來過。'},{goto:'t'},
      {label:'e2'},{speaker:'kexin',expression:'teasing',text:'……我們大三了，可以吃好一點。'},{speaker:null,text:'（她還是買了兩個飯糰。）'},{goto:'t'},
      {label:'e3'},{scene:'公館・水餃店',bg:'y0_dumpling'},{speaker:'kexin',expression:'thinking',text:'三十分鐘的話，水餃。數得出來吃了幾顆。'},
      {label:'t'},
      {speaker:null,text:'（她看了三次手錶。第三次：）'},
      {speaker:'kexin',expression:'serious',text:'還有九分鐘。……你說一件今天的事。只說一件。'},
      {choice:[{text:'「刑訴老師昨天點了後面三排。」',goto:'s1'},   /* AA_376 #12：刑訴在週二、五（K15 是週三）*/{text:'「阿哲當隊長了。」',if:{flags:['ZHE3']},goto:'s2'},{text:'「今天沒什麼事。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'thinking',text:'你坐第幾排？'},{speaker:'player',text:'第四排。'},{speaker:'kexin',expression:'laugh',text:'……好險。'},{goto:'end'},
      {label:'s2'},{speaker:'kexin',expression:'laugh',text:'他？……他會每場都請全隊吃麵吧。'},{goto:'end'},
      {label:'s3'},{speaker:'kexin',expression:'teasing',text:'那就說你中午吃什麼。……現在這碗不算。'},
      {label:'end'},
      {speaker:null,text:'（六點半整，她站起來，拿了外套就走。走到門口又回頭。）'},
      {speaker:'kexin',expression:'smile',text:'到了跟你說。'},
      {set:{KX_SHORT_MEET:true,KX_K15:'met'}} ],
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.k15Missed(G,q); } };

  /* ---------- 2-Y3-07 可昕 K11「她來台大聽講座」（裁定 #30）：9/29（三）19:00～20:30 博雅的大教室。一起聽＝出遊；她自己聽＝20:30～21:00 在博雅一樓的小桌子（作息在 r2y3a3d.js）---------- */
  const LECTURE={ id:'ev_kexin_lecture_ntu', title:'她來台大聽講座', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'博雅教學館',bg:'linze_auditorium'},   /* 講座在博雅 101（3D 區域的大教室）；出遊的 2D 沒有這張圖：深色底＋字幕 */
      {speaker:null,text:'（博雅的大教室。講座的題目是「平台、新創與新的規則」。可昕坐第三排，筆記寫了兩頁。）'},
      {speaker:null,text:'（講者一直說「彈性」。）'},
      {advance:toH(20.5)},
      {speaker:'kexin',expression:'serious',text:'你先說。我想知道台大的人怎麼聽。'},
      {choice:[{text:'「講者的例子太少。」',goto:'l1'},{text:'「例子很好，可是規則誰來訂沒講。」',goto:'l2'},{text:'「我在看妳的筆記。」',goto:'l3'}]},
      {label:'l1'},{speaker:'kexin',expression:'serious',text:'我在意的是別的：他一直說『彈性』，沒說是誰的彈性。'},{speaker:'kexin',expression:'smile',text:'我們聽到的不一樣。很好。'},{goto:'end'},
      {label:'l2'},{speaker:'kexin',expression:'surprised',text:'……那是我想問的。你先問到了。'},{goto:'end'},
      {label:'l3'},{speaker:'kexin',expression:'embarrassed',text:'那你聽到的是我。……下次你要聽講者。'},
      {label:'end'},{set:{KX_K11:'together'}} ],
    after:G=>{ const r=R(); if(r) r.lectureAttended(G); },   /* attended B6c（BB_105）*/
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.lectureMissed(G); } };
  const LECTURE_TABLE={ id:'ev_kexin_lecture_table', title:'她來台大聽講座', participants:['kexin'], location:'boya', trigger:'auto', once:true, background:'blur', npcNear:'kexin', nearDist:3,
    prereq:{custom:G=>on(G,'2027-09-29',20.5,21)&&G.flags.KX_K11!=='together'&&!!G.flags.KX_K11_SELF&&dating(G,'kexin')},
    dialogue:[ {speaker:'kexin',expression:'tired',text:'講完了。我坐一下再走。'},
      {speaker:'kexin',expression:'thinking',text:'他一直說「彈性」，沒說是誰的彈性。……你沒聽到，我先記著。'},
      {set:{KX_K11:'table'}} ] };

  /* ---------- 2-Y3-08 子晴 Q8b「爸爸卡關了」（裁定 #4、#5）：10/6～10/8 22:00～23:30 公館（她平日 22～24 點在公館，作息照舊）；走到她旁邊才演。id 一定用這個 ---------- */
  const Q6=G=>done(G,'ev_ziqing_secret_game')||has('heroine_04','PLAYTESTED');   /* 看過 Q6（同 y2b_events.js）*/
  const Q6c={custom:Q6}, nQ6c={custom:G=>!Q6(G)};
  const DAD_STUCK={ id:'ev_ziqing_dad_stuck', title:'爸爸卡關了', participants:['heroine_04'], location:'gongguan', trigger:'auto', once:true, background:'blur', npcNear:'heroine_04', nearDist:3,
    prereq:{custom:G=>{ const a=D('2027-10-06'), x=hh(G); return a!=null&&G.day>=a&&G.day<=a+2&&x>=22&&x<23.5&&stAt(G,'heroine_04','FAMILIAR')&&!(G.flags&&G.flags.ZQ_Q8B_PHONE); }},
    dialogue:[ {speaker:'heroine_04',text:'你看。（把手機轉過來）'},
      {speaker:'heroine_04',text:'我爸傳的。「第三關怎麼過。」'},
      {if:Q6c,speaker:'heroine_04',text:'他在玩《找插座的貓》。我上個月丟到網路上的。他自己找到的。'},
      {if:nQ6c,speaker:'heroine_04',text:'他在玩《找插座的貓》。……我做的。大一就開始做了，上個月丟到網路上，他自己找到的。'},
      {speaker:'heroine_04',text:'……他卡了三天。他三天都在玩。'},
      {speaker:'heroine_04',expression:'laugh',text:'（笑到彎腰）他真的很爛。跟我五歲的時候一模一樣。'},
      {choice:[{text:'「妳要教他嗎？」',goto:'d1'},{text:'「妳爸很可愛。」',goto:'d2'},{text:'「我第三關也卡很久。」',if:Q6c,goto:'d3'},{text:'「妳做的？」',if:nQ6c,goto:'d4'}]},
      {label:'d1'},{speaker:'heroine_04',text:'不要。讓他自己卡。……好啦，給他一個提示。'},{goto:'end'},
      {label:'d2'},{speaker:'heroine_04',expression:'embarrassed',text:'……他會得意。我已經看到他得意的臉了。'},{goto:'end'},
      {label:'d3'},{speaker:'heroine_04',text:'你們兩個是同一個等級的。'},{goto:'end'},
      {label:'d4'},{speaker:'heroine_04',text:'對。我沒跟什麼人說。……現在全世界都可以玩了。'},
      {label:'end'},(mem('heroine_04','DAD_PLAYS')) ] };

  /* ---------- 2-Y3-09 颱風假（10/13）T3a「泡麵之夜」：20:00～23:00 人在宿舍房間（不在的，回宿舍時演）。和子晴 FAMILIAR 以上＝視訊版（TESTER 分兩種）；不到＝只有阿凱 ---------- */
  const ZQF=fam('heroine_04'), nZQF={custom:G=>!stAt(G,'heroine_04','FAMILIAR')};
  const TST={custom:G=>!!(G.flags&&G.flags.TESTER)}, nTST={custom:G=>!(G.flags&&G.flags.TESTER)};
  const and=(...cs)=>({custom:(G,GM)=>cs.every(c=>typeof EVENTS==='undefined'||EVENTS.cond(c))});
  const TY_NOODLE={ id:'ev_typhoon_y3_noodle', title:'泡麵之夜', participants:['kai'], location:'dorm', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>on(G,'2027-10-13',20,23)&&stAt(G,'kai','FAMILIAR')&&typeof CALENDAR!=='undefined'&&!!CALENDAR.typhoon&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:null,text:'（二十分鐘後，阿凱抱著一箱泡麵站在門口，雨衣在滴水。柏翰在靠窗那張桌子念書，看了一眼，戴上耳塞。）'},
      {if:ZQF,speaker:null,text:'（阿凱把筆電架在你的書桌上，打視訊給子晴。）'},
      {if:ZQF,speaker:'heroine_04',name:'子晴（視訊）',text:'颱風天最適合修 bug。沒人會來吵我。'},
      {if:ZQF,speaker:'kai',text:'我們在吵妳。'},
      {if:and(ZQF,TST),speaker:'heroine_04',text:'你們不算人。你們是測試員。'},
      {if:and(ZQF,TST),speaker:'heroine_04',text:'我說過的。測試員。'},
      {if:and(ZQF,nTST),speaker:'heroine_04',text:'你們不算人。你們是背景音。'},
      {if:and(ZQF,TST),speaker:'kai',text:'（舉起泡麵）測試員需要補給。'},
      {if:and(ZQF,nTST),speaker:'kai',text:'（舉起泡麵）背景音需要補給。'},
      {if:ZQF,speaker:'heroine_04',text:'……好啦。我也去泡一碗。'},
      {if:ZQF,choice:[{text:'陪她修到半夜（視訊開著，各做各的）',goto:'v1'},{text:'「颱風天也要睡覺。」',goto:'v2'},{text:'吃掉阿凱的泡麵',goto:'v3'}]},
      {if:nZQF,speaker:'kai',text:'我們那棟停電了。你們這棟還有電。'},   /* AA_376 #8：大二起他住別棟 */
      {if:nZQF,speaker:null,text:'（他拆了第一包。）'},
      {if:nZQF,choice:[{text:'「一人一包。」',goto:'k1'},{text:'「你可以待到幾點？」',goto:'k2'}]},
      {label:'v1'},{advance:toH(24)},{goto:'end'},   /* 訪客規定：同性訪客可以進房間到 24:00（AA_185 1-8）*/
      {label:'v2'},{speaker:'heroine_04',text:'……好，十二點。'},{goto:'end'},
      {label:'v3'},{speaker:'kai',text:'這是不可抗力嗎？'},{speaker:'player',text:'這是看情況。'},{goto:'end'},
      {label:'k1'},{speaker:'kai',text:'兩包。颱風天。'},{goto:'end'},
      {label:'k2'},{speaker:'kai',text:'十二點。我知道規定。'},
      {label:'end'} ],
    consequences:{flags:{TYPHOON_Y3:true}} };
  /* T3b「照常的讀書會」：家族群組選「我會上線」＝10/14（四）19:00～19:50 線上，只有學姊和祐廷，各讀各的，鏡頭關著（AA_343 B4 的旁白）。
     七點五十分她先打一行字：在公法讀書會的（大一去過，或這學期有去）＝「八點你們有讀書會。下線吧。」，其他＝「七點五十了。我先下線。」；兩版都接「……颱風天這樣讀，剛好。」。
     答應了、19:10 還沒上線：什麼都不發生，她不追人（沒有 outingMissed；SIS_TYPHOON_Y3 照記 'online'）*/
  const plgThisTerm=G=>{ const A=(G.acts&&G.acts.att)||{}, C=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR:null, t0=C?C.termOf(G.day):null; if(!t0) return false;
    for(const k in A){ const m=/^public_law_group@(-?\d+)$/.exec(k); if(!m) continue; const t=C.termOf(+m[1]); if(t&&t.id===t0.id) return true; } return false; };
  const PLG={custom:G=>(typeof STORY!=='undefined'&&!!STORY.plgY1Count&&STORY.plgY1Count(G)>0)||plgThisTerm(G)};
  const TY_FAMILY={ id:'ev_typhoon_y3_family', title:'照常的讀書會', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:50/60,
    dialogue:[ {speaker:null,text:'（七點整，線上讀書室只有兩格。兩格的鏡頭都關著。）'},
      {speaker:null,text:'（她的麥克風沒有關。翻頁的聲音、螢光筆的蓋子，偶爾一聲很小的「……嗯。」）'},
      {speaker:null,text:'（七點五十分，她那一格先打了一行字。）'},
      {if:PLG,speaker:'heroine_05',text:'八點你們有讀書會。下線吧。'},
      {unless:PLG,speaker:'heroine_05',text:'七點五十了。我先下線。'},
      {speaker:'heroine_05',text:'……颱風天這樣讀，剛好。'},
      {set:{SIS_TYPHOON_Y3_ONLINE:'went'}} ] };

  /* ---------- 2-Y3-10 可昕「主線 4 的那通電話」：10/18（一）22:00 演出來的電話；轉移話題的 10/22（五）22:00 再一次。id 一定用 ev_kexin_call_helper ---------- */
  const CALL1={ id:'ev_kexin_call_helper', title:'電話', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊很安靜，像是在宿舍的走廊。）'},
      {speaker:'kexin',expression:'serious',text:'你這禮拜幫了幾個人？'},
      {speaker:'kexin',expression:'annoyed',text:'搬家、改報告、修電腦。……我都有聽說。'},
      {speaker:'kexin',expression:'serious',text:'那你自己的事，誰幫？'},
      {choice:[{text:'「……是我。」',set:{KX_HELPER_CALL:'admit'},goto:'c1'},{text:'（轉移話題）',set:{KX_HELPER_CALL:'dodge'},goto:'c2'},{text:'「那妳呢？誰幫妳？」',set:{KX_HELPER_CALL:'ask_back'},goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'我知道。我只是想聽你自己說。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'neutral',text:'好。……今天先不問。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'smile',text:'我？我讓予樂幫我。……你也可以讓我幫你。'},
      {label:'end'},{speaker:'kexin',expression:'smile',text:'好。早點睡。'},{speaker:null,text:'（她掛掉了。）'} ],
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.helperMissed(G); } };
  const CALL2={ id:'ev_kexin_call_helper2', title:'電話', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。）'},
      {speaker:'kexin',expression:'serious',text:'你感冒的話，會跟誰說？'},
      {choice:[{text:'「跟妳說。」',set:{KX_HELPER_CALL2:'tell'},goto:'c1'},{text:'「應該不會感冒。」',set:{KX_HELPER_CALL2:'never'},goto:'c2'},{text:'「我自己會好。」',set:{KX_HELPER_CALL2:'self'},goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'……好。那我等你說。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'annoyed',text:'每個人感冒以前都這樣講。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'sad',text:'……嗯。'},{speaker:null,text:'（她沒有再問。）'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'好。早點睡。'},{speaker:null,text:'（她掛掉了。）'} ] };

  /* ---------- 2-Y3-11 刑訴旁聽作業（AA_252 5-1；第 7～11 週平日下午自己去地院旁聽一場刑事庭）：約了誰在 r2y3a3d.js 的 F.CRIMPRO_WITH；這一趟跟誰去在出遊的 q.crWith ---------- */
  const CW=v=>({custom:G=>!!G.flags&&G.flags._CR_WITH===v});
  const COURT={ id:'ev_crimpro_court_visit', title:'旁聽作業', participants:[], location:'any', trigger:'outing', background:'dark', hours:2,
    beforeOuting:async(G,GM,q)=>{ G.flags._CR_WITH=(q&&q.crWith)||'self'; },
    dialogue:[ {scene:'地方法院',bg:'court_gallery'},   /* 法院走廊、旁聽席的 2D（AA_252 5-1）開發分支沒有：深色底＋字幕。CG-16「起立」這一版不放（AA 審稿第 1 點）*/
      {speaker:null,text:'（法院的走廊很長，椅子上坐滿了等開庭的人。有一個阿姨一直在看手上的通知單。）'},
      {speaker:null,text:'（法庭比你想的小。旁聽席三排，坐了不到一半。）'},
      {speaker:null,text:'（法官進來的時候，大家站起來。坐下的時候，有人的椅子響了一聲。）'},
      {speaker:null,text:'（檢察官念起訴的事實，念得很快。被告坐在前面，背對著你們，一直低著頭。）'},
      {speaker:null,text:'（辯護人問證人：「你那天站在哪裡？」證人想了很久。）'},
      {if:CW('an'),speaker:'heroine_01',text:'證人想那麼久，是在想答案，還是在想怎麼說。'},
      {if:CW('an'),speaker:'heroine_01',text:'答辯狀我今天晚上就寫。你呢？'},
      {if:CW('bohan'),speaker:'classmate_bohan',text:'……和考古題完全不一樣。'},
      {if:CW('zhe'),speaker:'zhe',text:'我一直在看那個阿姨。'},
      {if:CW('self'),speaker:null,text:'（走出法院，你在門口站了一下，才去搭車。）'},
      {speaker:null,text:'（你照作業的格式，用辯護律師的口氣寫了一份答辯狀。寫到半夜，第二天交了出去。）'} ],
    after:G=>{ const r=R(); if(r) r.courtDone(G); },
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.courtMissed(G,q); } };

  /* ---------- 2-Y3-12 慈 4「很爛的那一句」：10/20（三）12:10～12:40 霖澤館二樓走廊（作息在 r2y3a3d.js），和芯慈 FAMILIAR 以上、在二樓就演 ---------- */
  const onLv=lv=>(G,GM)=>!GM||!GM.E||!GM.E.player||(GM.E.player.lv|0)===lv;
  const BAD_LINE={ id:'ev_xinci_bad_line', title:'很爛的那一句', participants:['classmate_xinci'], location:'linze', trigger:'auto', once:true, background:'blur', npcPresent:'classmate_xinci',
    prereq:{custom:(G,GM)=>on(G,'2027-10-20',12+10/60,12+40/60)&&stAt(G,'classmate_xinci','FAMILIAR')&&onLv(1)(G,GM)},
    dialogue:[ {speaker:'classmate_xinci',text:'你聽說了吧。'},
      {if:{memory:[{npc:'classmate_xinci',tag:'XINCI_SECOND'}]},speaker:'classmate_xinci',text:'你知道第二名的事。所以你大概懂。'},
      {speaker:'classmate_xinci',text:'我跟她說，「妳什麼都不用努力就有」。'},
      {speaker:'classmate_xinci',text:'那句話很爛。我說的時候就知道很爛。'},
      {speaker:'classmate_xinci',text:'（很久）……我只是想讓她也痛一次。'},
      {choice:[{text:'「她對自己比對別人嚴。」',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.plgY1Count&&STORY.plgY1Count(G)>0},set:{CI4:'strict'},goto:'x1'},
        {text:'「妳要跟她道歉嗎？」',set:{CI4:'sorry'},goto:'x2'},{text:'「妳也很累。」',set:{CI4:'tired'},goto:'x3'}]},
      {label:'x1'},{speaker:null,text:'（芯慈愣住。）'},{speaker:'classmate_xinci',text:'……我知道。'},{speaker:null,text:'（她看著窗外。）'},{speaker:'classmate_xinci',text:'所以那句話更爛。'},{goto:'end'},
      {label:'x2'},{speaker:'classmate_xinci',text:'要。'},{speaker:null,text:'（她說得很快。）'},{speaker:'classmate_xinci',text:'可是還不是現在。現在道歉，我會一邊道歉一邊想她會怎麼回。'},{goto:'end'},
      {label:'x3'},{speaker:null,text:'（她轉頭看你，沒說話。過了一下：）'},{speaker:'classmate_xinci',text:'……嗯。'},   /* 旁白是第二人稱：「看你」（AA_343 B6）*/
      {label:'end'} ] };

  /* ---------- 2-Y3-13 以安新 14「她選了行政法院」（LEGAL_REVIEW_REQUIRED：告區公所的行政訴訟由哪一級法院審，旁白只寫「行政法院」）：10/21（四）17:30～19:40 麵店（作息在 r2y3a3d.js），走到她旁邊就演 ---------- */
  const ADMIN={ id:'ev_an_admin_court', title:'她選了行政法院', participants:['heroine_01'], location:'noodle', trigger:'auto', once:true, background:'blur', npcNear:'heroine_01', nearDist:3,
    prereq:{custom:G=>on(G,'2027-10-21',17.5,19+40/60)&&stAt(G,'heroine_01','FAMILIAR')&&!(G.flags&&G.flags.AN14)},
    dialogue:[ {speaker:null,text:'（麵店的長桌。以安比平常晚到，手帳裡夾著一張開庭表。）'},
      {speaker:'heroine_01',text:'今天下午，我先去了一趟行政法院。'},   /* AA_462 第 8 節③：「我自己去了」換字（同 an14Phone 那一則，AA_462 第 1 節）*/
      {speaker:'heroine_01',text:'一個人告區公所。他坐左邊，區公所的人坐右邊。'},
      {speaker:'heroine_01',text:'他帶了一個資料夾，裡面全部是收據。區公所來了兩個人，一人一台筆電。'},
      {if:kn('zhe'),speaker:'zhe',text:'刑訴的作業不是要去地院嗎？'},
      {if:kn('zhe'),speaker:'heroine_01',text:'那個禮拜五去。今天這個是我自己想看的。'},
      {if:nkn('zhe'),speaker:'heroine_01',text:'刑訴那場還是禮拜五。這個是我自己想看的。'},   /* AA_462 第 8 節③：不認識阿哲（上面兩句不出）她自己補一句 */
      {choice:[{text:'「一個人對兩台筆電？」',goto:'a1'},{text:'「妳怎麼不去刑事庭？」',goto:'a2'},{text:'「下次我也想去。」',goto:'a3'}]},
      {label:'a1'},{speaker:'heroine_01',text:'嗯。可是法官一直讓他講完。'},{speaker:null,text:'（她把開庭表摺起來。）'},{speaker:'heroine_01',expression:'thinking',text:'……我在想，那是規定，還是那個法官。'},{goto:'end'},
      {label:'a2'},{speaker:'heroine_01',text:'禮拜五去。'},{speaker:null,text:'（她停了一下。）'},{speaker:'heroine_01',text:'刑事庭的旁聽席，有人會認得我。行政法院不會。'},
        {if:kn('zhe'),speaker:'zhe',text:'認得妳？妳是明星喔。'},{if:kn('zhe'),speaker:'heroine_01',text:'……不是。麵要糊了。'},{goto:'end'},
      {label:'a3'},{speaker:'heroine_01',text:'好。開庭表我傳給你。……要早到，旁聽席很小。'},
      {label:'end'},{advance:toH(19+40/60)},
      {speaker:null,text:'（七點四十，她看了一下錶，把麵吃完。）'},
      {speaker:'heroine_01',text:'讀書會。我先走。'},
      {set:{AN14:'there'}},(mem('heroine_01','AN_ADMIN_COURT')) ] };

  /* ---------- 2-Y3-14 翰 4「四樓的樓梯間」（裁定 #8）：第 10 週（11/8～11/12）平日 12:10～13:00，霖澤館 4F（linze_4f）樓梯間，他坐在往五樓那扇刷卡門前的台階上（「5 樓以上是研究室，樓梯間的門要刷教職員證。」；作息在 r2y3a3d.js），和柏翰 FAMILIAR 以上。
     三、四樓已經開放、沒有整修的樓梯口了（AA_343 B7，569621e0 改四樓；第一版的 202 門口作廢：202 已做成正式教室）：標題改、id 不變；「台階」、選項、「走了兩階」照原文 ---------- */
  const THIRD={ id:'ev_bohan_third_floor', title:'四樓的樓梯間', participants:['classmate_bohan'], location:'linze_4f', trigger:'auto', once:true, background:'blur', npcNear:'classmate_bohan', nearDist:3,
    term:['Y3S1'], weeks:[10], weekday:[1,2,3,4,5], time:[12+10/60,13],
    prereq:{custom:(G,GM)=>stAt(G,'classmate_bohan','FAMILIAR')},   /* linze_4f 只有一層 */
    dialogue:[ {speaker:'classmate_bohan',expression:'tired',text:'（看到祐廷，沒有站起來）……你不要說話。'},
      {speaker:'classmate_bohan',expression:'serious',text:'刑訴。我最喜歡的一科。平均以下。'},
      {speaker:'classmate_bohan',text:'你知道我為什麼每天念六小時嗎。'},
      {speaker:'classmate_bohan',text:'不是因為我很認真。是因為我不念，就跟不上你們。'},
      {speaker:'classmate_bohan',text:'我哥念電機，一天念兩小時。我們家只有我需要六小時。'},
      {speaker:'classmate_bohan',text:'我問大家考幾分，是想確定我沒有輸太多。'},
      {if:{memory:[{npc:'classmate_bohan',tag:'ASKED_BACK'}]},speaker:'classmate_bohan',text:'……那天你反問我。我回家想了很久，為什麼我不敢反問別人。'},
      {choice:[{text:'「六小時也是你的。」',goto:'b1'},{text:'「你跟上了啊。你還坐在第一排。」',goto:'b2'},{text:'（在他旁邊的台階坐下）',goto:'b3'}]},
      {label:'b1'},{speaker:null,text:'（他看著那扇刷卡的門很久。）'},{speaker:'classmate_bohan',text:'……我的。'},{speaker:null,text:'（他笑了一下，很小。）'},{goto:'end'},
      {label:'b2'},{speaker:'classmate_bohan',text:'第一排是因為我怕坐後面聽不到。'},{speaker:null,text:'（他說完自己笑了。）'},{goto:'end'},
      {label:'b3'},{speaker:null,text:'（兩個人坐到下一節課的鐘響。他站起來：）'},{speaker:'classmate_bohan',text:'今天的事，……就到這裡。'},{speaker:null,text:'（走了兩階又停下來：）'},{speaker:'classmate_bohan',text:'……下次我考好了，那個你可以說。'},
      {label:'end'},(mem('classmate_bohan','BOHAN_HONEST')),{set:{BH4_DONE:true}} ] };   /* BH4_DONE＝翰 4 演完（AA_496 第 9 節第 1 點）：推甄面試「我是真的想知道」那一版（r2y4a_events.js）、尾聲 bh4（postgrad3d.js）讀它；舊存檔沒有＝照沒演過 */

  /* ---------- 2-Y3-15 校慶（大三版）：11/13（六）10:00～16:00 椰林大道，和大二同一個帳篷。法服成員＝攤位版；不是＝路過版。學姊那段只在 12:00～12:30；不改 GRANDMA_TREE_Y2 ---------- */
  const GM_Y2={custom:G=>!!(G.flags&&G.flags.GRANDMA_TREE_Y2)};
  const SIS_PASS={custom:G=>{ const x=hh(G); return x>=12&&x<12.5&&stAt(G,'heroine_05','FAMILIAR'); }};
  const STICKERS={if:kn('heroine_04','kai'),speaker:null,text:'（隔壁吉他社的攤位，子晴在賣自己畫的插座貓貼紙。賣了三張，三張都是阿凱買的。）'};
  const member=G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G);
  const BOOTH={ id:'ev_fair_booth_y3', title:'法律問答攤（大三）', participants:[], location:'campus', trigger:'auto', term:['Y3S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5}, background:'blur',
    prereq:{custom:G=>member(G)},
    dialogue:[ {speaker:null,text:'（椰林大道。法服的攤位在第三個帳篷。柏翰把「法律問答」的牌子立好，又調了兩次角度。）'},
      {if:GM_Y2,speaker:'阿嬤',text:'少年欸，你又在這。'},
      {if:GM_Y2,speaker:'阿嬤',text:'那棵芭樂，隔壁說過年前要剪。我在等他。'},
      {if:GM_Y2,choice:[{text:'「這次妳跟他講了？」',goto:'g1'},{text:'「芭樂還有掉嗎？」',goto:'g2'},{text:'（請她坐一下）',goto:'g3'}]},
      {goto:'sis'},
      {label:'g1'},{speaker:'阿嬤',text:'講了。他說好。……好不好，過年就知道。'},{goto:'sis'},
      {label:'g2'},{speaker:'阿嬤',text:'有啊。我都先撿起來放著。……你們說要問，我還沒去問。'},{goto:'sis'},
      {label:'g3'},{speaker:null,text:'（她坐下來，喝了半杯你倒的水，又起來去逛下一攤。）'},
      {label:'sis'},
      {if:SIS_PASS,speaker:'heroine_05',text:'（抱著一疊訪談稿，從攤位前面經過）今天人好多。'},
      {if:SIS_PASS,speaker:'heroine_05',text:'學弟妹不會的，會跑去問你吧。……我回研究室了。'},
      STICKERS,
      {set:{FAIR_Y3:'booth'}} ] };
  const BOOTH_PASS={ id:'ev_fair_booth_y3_pass', title:'法律問答攤（路過）', participants:[], location:'campus', trigger:'auto', term:['Y3S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5}, background:'blur',
    prereq:{custom:G=>!member(G)&&!done(G,'ev_fair_booth_y3')},
    dialogue:[ {speaker:null,text:'（法服的攤位前，柏翰在跟一個人講話，筆記寫了半頁。）'},
      {if:GM_Y2,speaker:null,text:'（攤位旁邊的阿嬤看到你，揮了一下手。）'},
      {if:SIS_PASS,speaker:'heroine_05',text:'你。……算了，今年不抓你。'},
      STICKERS,
      {set:{FAIR_Y3:'pass'}} ] };

  /* ---------- 2-Y3-16 C4 阿哲的機車：11/19（五）21:00 的訊息在 r2y3a3d.js；回了的（記 ZHE_SCOOTER）＝之後第一次在麵店遇到阿哲（11/23 起的週二、週四 17:30～20:30）---------- */
  const SCOOTER={ id:'ev_zhe_scooter', title:'阿哲的機車', participants:['zhe'], location:'noodle', trigger:'auto', once:true, background:'blur', npcNear:'zhe', nearDist:3, weekday:[2,4], time:[17.5,20.5],
    prereq:{memory:[{npc:'zhe',tag:'ZHE_SCOOTER'}],custom:G=>{ const d=D('2027-11-23'); return d!=null&&G.day>=d; }},
    dialogue:[ {if:{flagIs:{YU_C4:'visit'}},speaker:null,text:'（Alison 坐在旁邊剝橘子，剝好了也沒有吃。）'},   /* AA_497 3-5：11/19 23:40 Alison 的私訊回「我明天去看他。」（YU_C4 visit；src/sup497_3d.js）＝開頭多一句旁白 */
      {speaker:'zhe',text:'修車行估了價。對方照估價付了。'},
      {speaker:'zhe',expression:'smile',text:'（把他碗裡的滷蛋夾一半給你）法律系的好處是，有人陪你不簽字。'} ] };

  /* ---------- 2-Y3-17 語彤事件 14「續約」（LEGAL_REVIEW_REQUIRED：只寫租約到期前受保護、續約是雙方談的）：11/24（三）14:30 麵店；RENT_RENEWED 一律記（story3d.js S.y3Facts）---------- */
  const GF_YT=dt('heroine_03'), FAFU_REC={custom:G=>member(G)&&!dating(G,'heroine_03')};
  const RENEW={ id:'ev_yt_lease_renew', title:'續約', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的鐵門拉起一半。桌上有兩樣東西：一張二十年的繳租時間表，和語彤的筆記本，上面抄著老客人說的話。）'},
      {if:{flags:['YT_LEASE_HELP']},speaker:null,text:'（那張時間表是你排的。）'},
      {speaker:null,text:'（新屋主三十多歲，穿西裝，看著時間表和語彤的筆記，沒說話。）'},
      {speaker:null,text:'（阿姨端了一碗麵給他：「先吃。」）'},
      {speaker:null,text:'（他吃了兩口，停住。）'},
      {speaker:'新屋主',text:'……我高中的時候來過。補習完。'},
      {speaker:'新屋主',text:'我那時候都點餛飩湯。'},
      {speaker:'阿姨',text:'你點的是乾麵加滷蛋。你記錯了。'},
      {speaker:'新屋主',text:'（笑出來）……對。乾麵。'},
      {speaker:'新屋主',text:'五年。租金照市價調一點，可以嗎？'},
      {speaker:'阿姨',text:'……可以。'},
      {speaker:'阿姨',text:'（轉身，手在發抖，拿起刀）不要看我，蔥要切。'},
      {speaker:'阿姨',text:'我也要學休息。妳也是。'},
      {if:GF_YT,speaker:'阿姨',text:'（看你）你也是。禮拜四把她帶走，不要讓她來店裡。'},
      {if:GF_YT,speaker:'heroine_03',expression:'embarrassed',text:'阿姨。'},
      {choice:[{text:'（把紀錄存好）',if:FAFU_REC,goto:'r1'},{text:'（看語彤）',goto:'r2'}]},
      {label:'r1'},{speaker:'律師',text:'紀錄給我一份。'},{goto:'end'},
      {label:'r2'},{speaker:null,text:'（語彤低著頭，在筆記本最後一頁寫了一行字，沒有給你看。）'},
      {label:'end'},{set:{YT_EV14:'there'}} ] };
  /* 轉述（她之後第一次在麵店的班，11/25～12/14；和她 FAMILIAR 以上、不在場的）*/
  const RETELL={ id:'ev_yt_lease_retell', title:'續約', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:9, once:true, background:'blur',
    prereq:{custom:G=>{ const a=D('2027-11-25'), b=D('2027-12-14'); return a!=null&&G.day>=a&&G.day<=b&&!(G.flags&&G.flags.YT_EV14)&&!done(G,'ev_yt_lease_renew')&&stAt(G,'heroine_03','FAMILIAR'); }},
    dialogue:[ {speaker:'heroine_03',text:'阿姨續約了。五年，寫成書面的。'},
      {speaker:'heroine_03',text:'……新屋主說，他高中的時候也來這裡吃過麵。'},   /* AA_376 #10：和現場（「我高中的時候來過。」）一致 */
      {speaker:'heroine_03',text:'阿姨要請一個工讀生。禮拜四。'},
      {if:{memory:[{npc:'heroine_03',tag:'RENT_CONSULTATION'}]},speaker:'heroine_03',text:'法服那次說的，後來都用上了。'},
      {set:{YT_EV14:'heard'}} ] };

  /* ---------- 2-Y3-18 慈 5「對答案」：第 13 週週一～週三 18:00～21:00、週四 18:00～19:45，總圖三樓（兩個人坐同一張桌子；作息在 r2y3a3d.js）。走近＝近的版本；只進三樓＝遠遠看到 ---------- */
  const ANS_TIME=G=>{ const x=hh(G); return G.weekday>=1&&G.weekday<=3?(x>=18&&x<21):(G.weekday===4&&x>=18&&x<19.75); };
  const ANSWERS={ id:'ev_xinci_an_answers', title:'對答案', participants:['heroine_01','classmate_xinci'], location:'library', trigger:'auto', once:true, background:'blur', npcNear:['heroine_01','classmate_xinci'], nearDist:3, term:['Y3S1'], weeks:[13],
    prereq:{custom:G=>ANS_TIME(G)&&knows('heroine_01',G)&&knows('classmate_xinci',G)&&!(G.flags&&G.flags.CI5==='near')},
    dialogue:[ {speaker:'heroine_01',text:'第三題妳比我好。'},
      {speaker:'classmate_xinci',text:'（停了一下）……嗯。'},
      {speaker:'heroine_01',text:'對了。補習班那個第二名，是妳吧。吳芯慈。'},
      {speaker:'classmate_xinci',expression:'surprised',text:'……妳記得？'},
      {speaker:'heroine_01',text:'一直都記得。開學那天，我假裝不記得。'},
      {speaker:'heroine_01',text:'我每次看排名，都先找那個名字。我怕她追上來。'},
      {speaker:'classmate_xinci',expression:'laugh',text:'（很久，然後笑出來）……我們兩個都很笨。'},
      {if:{memory:[{npc:'classmate_xinci',tag:'ECON_TOGETHER'}]},speaker:'classmate_xinci',text:'（轉頭看祐廷）大一你陪我讀經濟。這次換我們陪你對刑訴。'},
      {if:{memory:[{npc:'classmate_xinci',tag:'ECON_TOGETHER'}]},choice:[{text:'「好。第二題我錯了。」',goto:'e1'}]},
      {unless:{memory:[{npc:'classmate_xinci',tag:'ECON_TOGETHER'}]},speaker:null,text:'（她們把考卷攤在中間，一題一題對下去。）'},
      {goto:'end'},
      {label:'e1'},{speaker:'heroine_01',text:'我看一下。……你錯的地方跟我一樣。'},
      {label:'end'},{set:{CI5:'near',XC5_RECONCILE:true}} ] };   /* XC5_RECONCILE＝慈 5 演完、兩人和好（近、遠兩版都算，AA_496 第 9 節第 1 點）：尾聲「以安上個月搬家……」那一組讀它（postgrad3d.js）*/
  const ANSWERS_FAR={ id:'ev_xinci_an_answers_far', title:'對答案', participants:[], location:'library', trigger:'enter', once:true, background:'blur', npcZone:['heroine_01','classmate_xinci'], term:['Y3S1'], weeks:[13],
    prereq:{custom:G=>ANS_TIME(G)&&knows('heroine_01',G)&&knows('classmate_xinci',G)&&!(G.flags&&G.flags.CI5)},
    dialogue:[ {speaker:null,text:'（總圖三樓，靠窗那張桌子。以安和芯慈坐在一起，中間攤著兩份考卷。芯慈笑了一下。）'},{set:{CI5:'far',XC5_RECONCILE:true}} ] };

  /* ---------- 2-Y3-19 可昕 K17「學弟妹的練習對象」（裁定 #9、#10）：12/9（四）21:45 視訊；大三下 4/26（三）18:30 政大山下（日本路線＝19:30 視訊被看）---------- */
  const TUTOR={ id:'ev_kexin_tutor_practice', title:'學弟妹的練習對象', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {unless:{memory:[{npc:'kexin',tag:'KX5_HYPO_SENIOR'}]},speaker:'kexin',expression:'smile',text:'我開始帶大一的民總讀書會了。我先講一次給你聽，你當學弟妹。'},
      {if:{memory:[{npc:'kexin',tag:'KX5_HYPO_SENIOR'}]},speaker:'kexin',expression:'smile',text:'民總讀書會，我先講一次給你聽。'},   /* AA_376 #5：視訊的閒聊階梯 K5-L3 已經宣布過「我開始帶大一的民總讀書會了」（記憶 KX5_HYPO_SENIOR）；K17 演過以後 K5-L3 直接算過（src/y3fill3d.js）*/
      {choice:[{text:'（聽懂了）',set:{KX_K17:'heard'},goto:'p1'},{text:'（假裝聽懂）',set:{KX_K17:'fake'},goto:'p2'},{text:'（故意問一個怪問題）',set:{KX_K17:'odd'},goto:'p3'}]},
      {label:'p1'},{speaker:'kexin',expression:'teasing',text:'真的？那你講一次給我聽。'},{goto:'end'},
      {label:'p2'},{speaker:'kexin',expression:'teasing',text:'你假裝聽懂的時候，會點頭點兩次。'},{goto:'end'},
      {label:'p3'},{speaker:null,text:'（她把那題放進講義。）'},{speaker:'kexin',expression:'smile',text:'這題是一個法律系的學弟問的。'},
      {label:'end'} ] };
  const JUNIORS={ id:'ev_kexin_juniors_dinner', title:'學弟妹的飯', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:null,text:'（政大山下的小吃店。三個大一的學弟妹坐在對面，一直在看你。）'},
      {speaker:'學妹',text:'學姊說你都坐第四排。'},
      {speaker:'kexin',expression:'embarrassed',text:'我沒說。'},
      {speaker:'學弟',text:'學姊說過兩次。'},
      {speaker:'kexin',expression:'embarrassed',text:'……吃你的。'},
      {speaker:null,text:'（回去的路上，她都沒有看你。走到公車站，她才開口。）'},
      {speaker:'kexin',expression:'embarrassed',text:'……他們很吵吧。'},
      {choice:[{text:'「還好。」',goto:'j1'},{text:'「他們很喜歡妳。」',goto:'j2'}]},
      {label:'j1'},{speaker:'kexin',expression:'laugh',text:'還好就是很吵。'},{goto:'end'},
      {label:'j2'},{speaker:'kexin',expression:'embarrassed',text:'……他們喜歡的是這頓免費的飯。'},
      {label:'end'},{set:{KX_JUNIORS:'came'}} ],
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.juniorsPhoto(G); } };
  const JUNIORS_VIDEO={ id:'ev_kexin_juniors_video', title:'視訊被看', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（螢幕裡三個學弟妹擠在一起揮手。可昕把手機拿回去：「好，看完了。」）'},
      {set:{KX_JUNIORS:'video'}} ] };

  /* ---------- 2-Y3-20 語彤事件 13「空出來的週四」（裁定 #11）：12/16（四）18:00～19:45 總圖三樓（作息在 r2y3a3d.js），和語彤 FRIEND 以上，走到她旁邊就演。YT_EV13 一律記（S.y3Facts）；演過的另外記 YT_EV13_SEEN ---------- */
  const NGF_YT=ndt('heroine_03');
  const THU={ id:'ev_yt_thursday_free', title:'空出來的週四', participants:['heroine_03'], location:'library', trigger:'auto', once:true, background:'blur', npcNear:'heroine_03', nearDist:3,
    prereq:{custom:G=>on(G,'2027-12-16',18,19.75)&&stAt(G,'heroine_03','FRIEND')&&!!(G.flags&&G.flags.RENT_RENEWED)},
    dialogue:[ {speaker:'heroine_03',text:'阿姨請了一個工讀生。今天第一天。'},
      {if:NGF_YT,speaker:'heroine_03',text:'她叫我今天不要去。……我不知道週四晚上要幹嘛。'},
      {if:NGF_YT,speaker:'heroine_03',text:'我在這裡坐了一個小時。只是坐著。'},
      {if:GF_YT,speaker:'heroine_03',text:'她叫我今天不要去。……我第一個想到的是你。第二個想到的是，我不知道週四晚上要幹嘛。'},
      {if:GF_YT,speaker:'heroine_03',text:'所以我先來這裡坐。等你下課。'},
      {if:{flags:['JOB_NOODLE']},speaker:'heroine_03',text:'……你週二來切蔥，週四來陪我發呆。很忙喔。'},
      {choice:[{text:'「那就坐著。我陪妳。」',set:{YT_EV13_SEEN:'sat'},goto:'y1'},{text:'「去溫州街走走？」',set:{YT_EV13_SEEN:'walk'},goto:'y2'},{text:'「妳要不要寫點什麼？」',set:{YT_EV13_SEEN:'write'},goto:'y3'}]},
      {label:'y1'},{speaker:null,text:'（兩個人坐到閉館。走出總圖時她說：）'},{advance:toH(22)},{speaker:'heroine_03',text:'好安靜。我平常這時候在切蔥。'},
        {if:GF_YT,speaker:'heroine_03',text:'下禮拜四也這樣。'},{goto:'end'},
      {label:'y2'},{speaker:'heroine_03',text:'我從小住公館，沒有在週四晚上走過溫州街。'},{if:NGF_YT,speaker:null,text:'（她站起來。）'},{if:GF_YT,speaker:null,text:'（她站起來，把手伸過來。）'},
        {speaker:null,text:'（你們從總圖走到溫州街，又走回來。她一路沒講什麼，走得很慢。）'},{goto:'end'},
      {label:'y3'},{speaker:'player',text:'妳暑假訪問的那些，要不要整理成自己的東西？'},{speaker:'heroine_03',text:'整理成什麼？'},{speaker:'player',text:'不是給阿姨的。給妳自己的。'},
        {speaker:'heroine_03',text:'……我可以拿去問老師，能不能當專題。'},{if:GF_YT,speaker:'heroine_03',text:'寫好了，給你讀。'},(mem('heroine_03','FIELD_NOTES_IDEA')),
      {label:'end'} ] };

  /* ---------- 2-Y3-21 可昕 聖誕「她還在趕報告」：12/25（六）21:00 視訊（10 分鐘沒接＝沒接）；禮物在學期末那一場換（termend_lines.js KX.Y3S1，不另外做）---------- */
  const XMAS={ id:'ev_kexin_xmas_y3', title:'她還在趕報告', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'tired',text:'聖誕快樂。我還差兩頁。……你們考完了吧。'},
      {speaker:'kexin',expression:'smile',text:'……螢幕開著。你陪我就好。'},
      {speaker:null,text:'（她低頭打字。你看著螢幕裡她的頭頂，看了一個多小時。）'},
      {advance:toH(22.5)},
      {speaker:null,text:'（十點半，她把螢幕轉過來：最後一頁。）'},
      {speaker:'kexin',expression:'surprised',text:'寫完了。……你還在喔。'},
      {choice:[{text:'「一直都在。」',goto:'x1'},{text:'「妳寫了一個半小時。」',goto:'x2'}]},
      {label:'x1'},{speaker:'kexin',expression:'smile',text:'……好。禮物等我考完再換。'},{goto:'end'},
      {label:'x2'},{speaker:'kexin',expression:'teasing',text:'你有算喔。……好，算你陪了一個半小時。'},
      {label:'end'} ],
    after:G=>{ const r=R(); if(r) r.kxYear(G,'KX_XMAS','video'); },
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.xmasMissed(G); } };

  /* ---------- 2-Y3-23 可昕 除夕 KN（裁定 #12）：1/25 22:00 的訊息在 r2y3a3d.js；回「打給妳。」＝演出來的短電話（三句）---------- */
  const KN_CALL={ id:'ev_kexin_kn_call_y3', title:'電話', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊的電視開得很大聲。）'},
      {speaker:'kexin',expression:'surprised',text:'……你真的打喔。'},
      {speaker:'kexin',expression:'laugh',text:'好啦。新年快樂。我媽在叫我去洗碗。'} ] };

  /* ---------- 2-Y3-24 可昕 情人節（大三寒假；裁定 #13）：2/14（一）20:00～20:30 視訊（她在高雄）。沒接（20:30 還沒接）＝兩則 ---------- */
  const VDAY={ id:'ev_kexin_valentine_y3', title:'情人節', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（視訊。她那邊是高雄的房間，窗戶開著。）'},
      {speaker:'kexin',expression:'smile',text:'情人節快樂。三十分鐘。……我們越來越會了。'},
      {choice:[{text:'「三十分鐘夠嗎？」',goto:'v1'},{text:'「妳那邊好吵。」',goto:'v2'},{text:'（把窗外轉給她看）',goto:'v3'}]},
      {label:'v1'},{speaker:'kexin',expression:'teasing',text:'不夠。……這禮拜六我就上去了。'},{goto:'end'},
      {label:'v2'},{speaker:'kexin',expression:'laugh',text:'是我媽在陽台澆花。她說你好。'},{goto:'end'},
      {label:'v3'},{speaker:'kexin',expression:'teasing',text:'臺北又在下雨。……我就知道。'},
      {label:'end'},{speaker:null,text:'（三十分鐘一到，她真的掛了。三秒後，她傳來一張長頸鹿的貼圖。）'} ],
    after:G=>{ const r=R(); if(r){ r.kxYear(G,'KX_VDAY','video'); r.vdayGiraffe(G); } },
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.vdayMissed(G); } };

  return [KH_A,KH_B,KH_CALL,QIXI_VIDEO,MOUNTAIN,WELCOME,FIRST_MEAL,CAPTAIN,THIRTY,LECTURE,LECTURE_TABLE,DAD_STUCK,TY_NOODLE,TY_FAMILY,CALL1,CALL2,COURT,BAD_LINE,ADMIN,THIRD,BOOTH,BOOTH_PASS,SCOOTER,RENEW,RETELL,ANSWERS,ANSWERS_FAR,TUTOR,JUNIORS,JUNIORS_VIDEO,THU,XMAS,KN_CALL,VDAY];
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y3A_EVENTS);
