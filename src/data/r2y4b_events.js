/* ===== 事件包第 2 輪之三（後半）：大四下、畢業後篇、尾聲（AA_327 2-Y4-31～61；AA-C 定稿 e284d601，第②級，台詞照原文、不改字）=====
   這裡是用事件系統演的段落（在場景裡碰到的、出遊、讀書會）；手機、時間、場景表（畢業後篇）、尾聲的掛勾在 src/r2y4b3d.js（R2Y4B）。
   31 ev_azalea_y4（3/8 12:25～12:55 椰林大道）　32 ev_mingxuan_saved（3/8 19:00 麵店）　33 ev_bar_study_first／_w14／_week（國考讀書會，活動 act_bar_study）
   34 ev_an_grad_pass（3/22 19:00 麵店）、ev_grad_result（21:00 宿舍二選一）　35 ev_spring_y4（4/3～4/4 宜蘭）、ev_kexin_trip_spring_y4（和可昕）
   36 ev_peishan_open_class（4/14 台南）　38 ev_kexin_bday_visit_y4（4/24 開車上山）　39 ev_last_game_y4、ev_concert_y4（5/12）
   40 ev_kexin_last_study_night（5/16）　43 ev_last_meal_y4（6/22）　44 ev_kexin_after_grad（7/7）　46 ev_heart_july（7/14；R2Y4B.julyScene）
   47 ev_zhiruo_back_cafe（9/1 22:00）、ev_zhiruo_back_ex（分開過：9/1～9/7 第一次進 Café）　48 ev_mingxuan_depart（9/2 機場）
   50 ev_an_columbia（2030-03-28 麵店）、ev_an_ny_sendoff（2030-08-11 機場）　56 ev_us_canyon（美國路線）　57 ev_sis_canyon（台灣、日本路線）
   58 ev_bar_group_start（2/23）、ev_bar_group_night（麵店）、ev_bar_group_video（視訊）、ev_bar_group_three（6/23）　61 ev_ps_termend_y4s2（6/8 台南；R2Y4B.psDinner）
   AA_346 ev_choice_apart_<id>（2-Y4-54「選一個人」之後其他人各一場分開的談話；R2Y4B.apartScene）
   沒有的字（AA 稿沒寫）不補；CG 只在 CG_REGISTRY 有登錄時放（hasCG 守門）。測試：node tests/r2y4b_events_unit.js */
'use strict';
/* AA_468 第 2 節（AA-B 2026-10-25，企劃線 cd2dc7646；第②級）：律師讀書小組第一輪（k1～k4、y1～y4 各一次）以後換成旁白，每句一次、照順序；週六那幾句只在週六；用完只留收尾那一句。
   台詞照 2-1、2-2 的表一字不改。第幾句在 src/r2y4b3d.js 的 R2Y4B.narrLine。測試：node tests/aa468_evdup2_unit.js
   AA_468 第 4 節（企劃線 8a7f797ec）：三個人一起讀（kind three，都在麵店）另一組六句（three；when：'wd'＝平日、'sat'＝週六、null＝都可以），R2Y4B.threeLine；
   旁白另開計數（BAR_GROUP_KN／KNS、YN／YNS、三個人 BAR_GROUP_3U），舊存檔從第 1 句看起 */
const R2Y4B_BAR_NARR={
  kexin:{   /* 2-1 可昕（視訊；週六在政大）*/
    wd:['（視訊開著。兩個人都沒說話，只有翻頁的聲音。）','（她把今天的考古題拍給你，紅筆圈了三題。）','（十點半，她說要去倒水。回來的時候拿著兩杯，看了一下螢幕，自己笑了。）','（她讀到一半睡著了。你等了十分鐘才叫她。）',
      '（你們互相出了五題。她錯兩題，你錯三題。）','（今天讀民訴。她說民訴讀起來像在排隊。）','（掛之前，她把桌上的日曆翻給你看：又劃掉一格。）'],
    sat:['（政大山上的自習室。她占了靠窗的兩個位子。）','（山下買的便當，你們坐在自習室外面的樓梯吃完。）'],
    wdEnd:'（讀到十一點。）', satEnd:'（讀到傍晚。）' },
  yutong:{   /* 2-2 語彤（麵店；週六在總圖）*/
    wd:['（十點，阿姨把燈關掉一半，留長桌那一盞。）','（語彤把今天讀的抄在一張小卡上，放進圍裙口袋。）','（你講完一段，她說：「再一次。」你又講了一次。）','（阿姨端了兩碗湯過來，沒說話，又走回廚房。）',
      '（她在你筆記的邊邊寫了一個字：「慢」。）','（收桌的時候，她把你的筆蓋蓋好，放回你的筆袋。）'],
    sat:['（總圖的長桌。她讀社會系的書，你讀你的，中間隔一個位子放水壺。）','（她問了一題你答不出來的。你們一起查到閉館。）'],
    wdEnd:'（讀到十點半，鐵門拉下來。）', satEnd:'（讀到閉館。）' },
  three:{   /* 第 4 節 三個人一起讀（都在麵店）*/
    list:['（可昕出題，語彤計時。你答完，兩個人一起看你。）','（語彤把麵推到長桌另一頭，可昕把考古題推回來。）','（可昕問了一題，語彤說她社會系也學過。兩個人講了五分鐘，你在旁邊寫答案。）',
      '（十點，阿姨把燈關掉一半。可昕說：「再一題。」語彤說：「最後一題。」）','（週六的長桌。三疊考古題，一盤沒人動的滷味。）','（可昕和語彤交換了筆記。兩個人的字，一個圓一個方。）'],
    when:[null,null,null,'wd','sat',null],
    wdEnd:'（讀到十點半，鐵門拉下來。）', satEnd:'（讀到傍晚。）' } };
const R2Y4B_EVENTS=(function(){
  const R=()=>typeof R2Y4B!=='undefined'?R2Y4B:null;
  const SIS_KNOWS={custom:G=>{ const r=R(); return !!r&&!!r.knowsOther&&r.knowsOther(G,'heroine_05'); }};   /* 學姊知道祐廷正在和別人交往（MREL.knownOthers，沒有 OPEN_OK）：大峽谷告白先演知情對話（AA_474 3b）*/
  const CANYON_KNEW={custom:G=>{ const v=(G.flags||{}).SIS_CANYON; return v==='knows'||v==='confess'; }};   /* 知情對話演過了（R2Y4B.canyonKnow 記 SIS_CANYON）*/
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const kn=(...ids)=>({custom:G=>ids.every(id=>knows(id,G))});
  const dating=id=>G=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return F['dating_'+id]===true||!!(Rm[id]&&Rm[id].status==='dating'); };
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const toH=h=>G=>{ const hh=((G.hour%24)+24)%24; return h>hh?h-hh+1e-6:0; };   /* advance：跳到當天的某個時間（已經過了就不動）*/
  const toDay=(k,h)=>G=>{ const r=R(); if(r) r.jumpTo(G,k,h); return 0; };   /* 跳到某一天的某個時間：日期、星期一起換（R2Y4B.jumpTo；只加小時的話 G.hour 會超過 24、日期不動）*/
  const ex=id=>({custom:G=>!!(G.flags&&G.flags['EX_'+id])});
  const sawJP={custom:G=>{ const v=G&&G.flags&&G.flags.AN_SENDOFF; return v==='went'||v==='together'; }};   /* 2028-03-25 送過她去日本（ev_an_sendoff 演完＝went；日本路線一起出發＝together）*/
  const jpGo={custom:G=>!!(G&&G.flags&&G.flags.AN_JP_TRIP_ASK==='go')};   /* 2028 年答應過去日本看七夕 */
  const SAW={any:[{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}]},{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_TRY'}]}]};
  const BN=R2Y4B_BAR_NARR, narrRows=(who,p,force)=>{ const N=BN[who], gl=G=>R().groupLine(G,force);
    return N.wd.map((t,i)=>({if:{custom:G=>gl(G)===p+'w'+(i+1)},speaker:null,text:t})).concat(N.sat.map((t,i)=>({if:{custom:G=>gl(G)===p+'s'+(i+1)},speaker:null,text:t})),
      [{if:{custom:G=>gl(G)===p+'we'},speaker:null,text:N.wdEnd},{if:{custom:G=>gl(G)===p+'se'},speaker:null,text:N.satEnd}]); };   /* AA_468 第 2 節：第一輪以後的旁白（R2Y4B.narrLine）*/
  const threeRows=()=>{ const N=BN.three, gl=G=>R().groupLine(G); return N.list.map((t,i)=>({if:{custom:G=>gl(G)==='t'+(i+1)},speaker:null,text:t})).concat([{if:{custom:G=>gl(G)==='twe'},speaker:null,text:N.wdEnd},{if:{custom:G=>gl(G)==='tse'},speaker:null,text:N.satEnd}]); };   /* AA_468 第 4 節：三個人（R2Y4B.threeLine）*/
  return [
  /* ---------- 2-Y4-31 杜鵑花第四張（2029-03-08（四）12:25～12:55，椰林大道；AA_71 2-9）。有點熟以上＝第四張；不熟或分開過＝Alison 拍；交往中＝兩個人入鏡（CG-18）---------- */
  { id:'ev_azalea_y4', title:'杜鵑花第四張', participants:['heroine_01'], location:'campus', trigger:'auto', once:true, background:'blur',
    prereq:{custom:(G,GM)=>{ const r=R(); return !!r&&r.azaleaDue(G,GM); }},
    dialogue:[ {if:{custom:G=>R().azaleaNow(G)==='two'},goto:'two'},
      {if:{custom:G=>R().azaleaNow(G)==='yu'},goto:'yu'},
      {speaker:null,text:'（杜鵑開了。她站在同一棵樹前面。）'},
      {speaker:'heroine_01',text:'（把手機遞給你）第四張。'},
      {speaker:null,text:'（她把四張照片排在一起給你看。同一棵樹，同一個位置。）'},
      {choice:[{text:'「每一張都一樣。」',goto:'s1'},{text:'「明年還拍嗎？」',goto:'s2'},{text:'（把手機還給她）',goto:'s3'}]},
      {label:'s1'},{speaker:'heroine_01',text:'一樣才對。'},{goto:'shot'},
      {label:'s2'},{speaker:'heroine_01',text:'看三月二十二號。'},{goto:'shot'},   /* 研究所放榜那天（2-Y4-34）*/
      {label:'s3'},{speaker:null,text:'（她看了很久，才把手機收起來。）'},
      {label:'shot'},{set:{AZALEA_Y4:'shot'}},{end:true},
      {label:'yu'},{speaker:null,text:'（她請 Alison 拍。）'},   /* AA_71 2-9（大一那一張的同一句旁白）*/
      {if:kn('yu'),speaker:'yu',text:'笑一個嘛！'},{speaker:'heroine_01',text:'不要。'},{set:{AZALEA_Y4:'yu'}},{end:true},
      {label:'two'},{speaker:null,text:'（她把手機交給路過的人。）'},
      {speaker:'heroine_01',text:'麻煩你。……兩個人。'},
      {if:{custom:()=>hasCG('cg_azalea_fourth_heroine01')},cg:'cg_azalea_fourth_heroine01'},   /* CG-18 在拍下去的那一刻（AA_327 2-Y4-31 第 2 節；cg_approved/ README 寫「寫完那一行之後」，照 AA_327 較新的定稿，見回報）*/
      {speaker:null,text:'（她翻開手帳，在這一張照片的旁邊寫了一行字：「這一張要有兩個人。」）'},   /* 拍完：手帳上的字，她沒有說出口（裁定 #41）*/
      {set:{AZALEA_Y4:'two'}} ],
    after:G=>{ const r=R(); delete G.flags.AZALEA_VER; if(r&&G.flags.AZALEA_Y4==='yu') r.azaleaPhoto(G); } },
  /* ---------- 2-Y4-32 明軒 M4「存夠了」（3/8 19:00 麵店；BB_40 M4 改寫版）。不在麵店＝21:00 群組（R2Y4B）---------- */
  { id:'ev_mingxuan_saved', title:'存夠了', participants:['classmate_mingxuan'], location:'noodle', trigger:'auto', once:true, background:'blur',
    spawn:{npc:'classmate_mingxuan',dist:1.6},   /* 他衝進來、坐下來（不在作息裡也放進場景）：那句耳語要 npcNear（AA_327 2-Y4-32 第 1 節），放在玩家旁邊 */
    prereq:{custom:G=>{ const r=R(); return !!r&&r.mxSavedDue(G); }},
    dialogue:[ {speaker:'classmate_mingxuan',expression:'laugh',text:'（衝進來，手機舉得很高）我存夠了！'},
      {speaker:'classmate_mingxuan',text:'德國，一年。九月走。……錢是我自己存的。'},
      {speaker:'classmate_mingxuan',text:'（喘氣）家教三年、暑假打工兩次。都沒跟你們說。'},   /* 裁定 #39 */
      {if:kn('zhe'),speaker:'zhe',text:'……我恨你。'},
      {if:kn('zhe'),speaker:'classmate_mingxuan',text:'我知道。'},
      {if:SAW,speaker:'classmate_mingxuan',text:'你有看到一點點。'},   /* 他坐下來以後小聲說（AA 審稿 #10：不算口頭禪）*/
      {set:{MX_SAVED:'there'}} ] },
  /* ---------- 2-Y4-33 國考讀書會（每週四 20:00～22:00，總圖 B1；活動 act_bar_study 在 R2Y4B）：第一次、第 14 週、之後每次一句（輪流）---------- */
  { id:'ev_bar_study_first', title:'國考讀書會', participants:[], location:'any', trigger:'manual', clubEvent:'act_bar_study', once:true, background:'dark',
    dialogue:[ {scene:'總圖 B1',bg:'ntu_lib_b1'},
      {speaker:null,text:'（總圖 B1。阿哲把四個人的位子用講義占好了。）'},
      {if:kn('zhe'),speaker:'zhe',text:'每週四。八點到十點。誰遲到誰買飲料。'},
      {if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'我研究所上了，國考還是要考。一起念吧。'},   /* AA_97 2-2 原句 */
      {choice:[{text:'「好。」',goto:'a'},{text:'「十點太早了。」',goto:'b'}]},
      {label:'a'},{if:kn('yu'),speaker:'yu',text:'那今天誰買飲料？'},{if:kn('zhe'),speaker:'zhe',text:'……我。我剛剛遲到。'},{goto:'end'},
      {label:'b'},{if:kn('classmate_bohan'),speaker:'classmate_bohan',text:'十點以後，你回宿舍自己讀。'},
      {label:'end'} ],
    consequences:{inc:{BAR_STUDY_N:1}} },
  { id:'ev_bar_study_w14', title:'國考的人', participants:[], location:'any', trigger:'manual', clubEvent:'act_bar_study', once:true, background:'dark',
    prereq:{events:['ev_bar_study_first'],custom:G=>{ const r=R(); return !!r&&r.isDay(G,'2029-05-24'); }},
    dialogue:[ {scene:'總圖 B1',bg:'ntu_lib_b1'},
      {speaker:null,text:'（B1 的長桌。四個人的考古題疊得一樣高。）'},
      {if:kn('yu'),speaker:'yu',text:'還有七十二天。'},
      {if:kn('zhe'),speaker:'zhe',text:'不要倒數。'},
      {if:kn('yu'),speaker:'yu',text:'……我只是剛好算到。'},
      {choice:[{text:'「下禮拜畢業典禮。」',goto:'a'},{text:'（繼續寫題目）',goto:'b'}]},
      {label:'a'},{if:kn('zhe'),speaker:'zhe',text:'典禮那天不讀。說好了。'},{goto:'end'},
      {label:'b'},{if:kn('zhe'),speaker:null,text:'（十點，阿哲先站起來：「走了。明天還要上課。」）'},
      {label:'end'},{set:{BAR_STUDY_W14:true}} ],
    consequences:{inc:{BAR_STUDY_N:1}} },
  { id:'ev_bar_study_week', title:'國考讀書會', participants:[], location:'any', trigger:'manual', clubEvent:'act_bar_study', background:'dark',
    prereq:{events:['ev_bar_study_first'],custom:G=>{ const r=R(); return !!r&&r.barLine(G)>=0; }},
    dialogue:[ {scene:'總圖 B1',bg:'ntu_lib_b1'},
      {if:{custom:G=>R().barLine(G)===0},speaker:'zhe',text:'我第二週就只看一堂函授。我在培養感覺。'},   /* AA_97 2-2 */
      {if:{custom:G=>R().barLine(G)===1},speaker:'yu',text:'民訴那本我借你。我畫的重點是紫色的，不要問為什麼。'},
      {if:{custom:G=>R().barLine(G)===2},speaker:'classmate_bohan',text:'這週我讀了十八個小時。……你不用告訴我你讀了幾個。'},
      {if:{custom:G=>R().barLine(G)===3},speaker:'zhe',text:'麵店吃完再來，剛好消化。'},
      {if:{custom:G=>R().barLine(G)===4},speaker:'yu',text:'十點了。我要回板橋。'} ],
    consequences:{inc:{BAR_STUDY_N:1}} },
  /* ---------- 2-Y4-34 研究所放榜：以安商法組（3/22 19:00 麵店長桌，窗口 18:45～19:15；AA_285 第 4 節①）＋選②的祐廷 ---------- */
  { id:'ev_an_grad_pass', title:'商法組放榜', participants:['heroine_01'], location:'noodle', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ const r=R(); return !!r&&r.anPassDue(G); }},
    dialogue:[ {speaker:null,text:'（長桌。以安最後一個到，坐下來，先把手機蓋在桌上。）'},
      {speaker:'heroine_01',text:'商法組放榜。上了。'},
      {speaker:'heroine_01',text:'八月還有司法官。一樣，先考上。'},
      {if:kn('yu'),speaker:'yu',text:'恭喜！！'},
      {if:{custom:G=>knows('zhe',G)&&R().anFarewell(G)},speaker:'zhe',text:'（舉起塑膠杯）敬以安。……又一次。'},   /* 接大三下 3/24 餞行（AA_322 1B-12，AN_FAREWELL）*/
      {if:{custom:G=>knows('zhe',G)&&!R().anFarewell(G)},speaker:'zhe',text:'（舉起塑膠杯）敬以安。'},
      {if:{flagIs:{GRAD_EXAM_RESULT:'pass'}},speaker:'heroine_01',text:'（轉向你）你的呢？'},
      {if:{flagIs:{GRAD_EXAM_RESULT:'pass'}},choice:[{text:'「上了。」'}]},
      {if:{flagIs:{GRAD_EXAM_RESULT:'pass'}},speaker:'heroine_01',text:'……那九月，同一棟。'},
      {if:{flagIs:{GRAD_EXAM_RESULT:'fail'}},speaker:null,text:'（她看了你一眼，沒有問。）'},
      {choice:[{text:'「恭喜。」',goto:'c1'},{text:'「司法官也會上的。」',goto:'c2'}]},
      {label:'c1'},{speaker:'heroine_01',text:'嗯。'},{goto:'walk'},
      {label:'c2'},{speaker:'heroine_01',text:'先考。'},
      {label:'walk'},{unless:{flagIs:{GRAD_EXAM_RESULT:'fail'}},goto:'end'},   /* 祐廷沒上：散的時候她走在你旁邊 */
      {speaker:'heroine_01',text:'二月那張考卷，第二節很難。'},
      {speaker:'heroine_01',text:'我也寫到鐘響。'},
      {label:'end'},{mem:[{npc:'heroine_01',tag:'AN_GRAD_PASS',note:''}]},{set:{AN_GRAD_PASS_SEEN:true}} ] },
  /* 祐廷沒上：21:00 以後第一次在宿舍房間（AA_181 2-4 二選一）。明年再考＝2030-02-16 筆試、3/15 放榜（照 2-Y4-52 的做法，台灣路線也一樣；多準備一年就上）*/
  { id:'ev_grad_result', title:'研究所放榜', participants:[], location:['dorm'], trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ const r=R(); return !!r&&r.gradResultDue(G); }},
    dialogue:[ {speaker:null,text:'（書桌上，二月那份考古題還攤著。）'},
      {choice:[{text:'「明年再考。」',set:{GRAD_RETRY:true}},{text:'「不考了。」',set:{GRAD_QUIT:true}}]} ] },
  /* ---------- 2-Y4-35 春假（最後一次）：麵店團兩天一夜（4/3～4/4 宜蘭；2D）。三選一在 R2Y4B（照 1C-01）---------- */
  { id:'ev_spring_y4', title:'春假・宜蘭', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'車上',bg:'car_morning'},
      {if:kn('heroine_01'),speaker:null,text:'（以安坐副駕，腿上是行程表第四版。理由欄只寫了四個字：「最後一次」。）'},   /* 行程表上的字是她寫的，她沒有說出口 */
      {if:kn('zhe'),speaker:'zhe',text:'（後座）司機，我要聽歌。'},
      {if:kn('yu'),speaker:'yu',text:'不要放他的歌。'},
      {advance:toH(20)},
      {scene:'宜蘭・民宿',bg:'dark'},   /* 民宿（夜）沒有底圖：dark＋字幕 */
      {speaker:null,text:'（民宿的老闆送了一大盤水果。大家坐在榻榻米上，有人說要講大一的事。）'},
      {if:kn('yu','classmate_bohan'),speaker:'yu',text:'大一迎新，柏翰說我講了四個社團。'},
      {if:kn('yu','classmate_bohan'),speaker:'classmate_bohan',text:'妳講了四個。'},   /* 接 AA_71 2-1 大一迎新 */
      {choice:[{text:'「大一中秋，火一直熄。」',goto:'m1'},{text:'「第一次去麵店。」',goto:'m2'},{text:'（聽大家講）',goto:'m3'}]},
      {label:'m1'},{if:kn('zhe'),speaker:'zhe',text:'那是你顧的。'},{goto:'night'},
      {label:'m2'},{if:kn('heroine_01'),speaker:'heroine_01',text:'你點了招牌乾麵。大家都是。'},{goto:'night'},
      {label:'m3'},{if:kn('yu'),speaker:null,text:'（你沒有說話。Alison 講到一半自己笑出來。）'},
      {label:'night'},{if:{custom:dating('heroine_01')},speaker:'heroine_01',text:'明天早上空了一格。……你排。'},   /* 睡前她把行程表推過來 */
      {advance:toDay('2029-04-04',16)},
      {scene:'高速公路',bg:'car_night'},
      {speaker:null,text:'（回程的高速公路。後座的人都睡著了。以安沒有睡，一直看窗外。）'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（小聲）……謝謝你開車。'} ],
    consequences:{memo:'最後一個春假：開車載麵店團去宜蘭'},
    outingMissed:G=>{ const r=R(); if(r) r.springPhoto(G); } },
  /* 和可昕開車（照 AA_324 1C-01 可昕那一選：目的地從還沒去過的裡面選；都去過＝迷路到的地方；沒有假設題）。車上開場、回程照 AA_345 G3。記 KX_TRIP.Y4S2 */
  { id:'ev_kexin_trip_spring_y4', title:'春假：開車旅行（大四）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:13.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'沒有行程表。音樂我管，方向你管。'},   /* 車上開場、回程：大四版（AA_345 G3 新寫），不沿用大一、大二；三個地方都去過（迷路那一版）也一樣（AA_350 N3）*/
      {speaker:'kexin',expression:'smile',text:'……目的地也你管。我只是想坐在車上。'},
      {if:{custom:G=>R().kxAllSeen(G)},goto:'lost'},
      {choice:[{text:'海邊',if:{custom:G=>!R().kxSeen(G).includes('sea')},set:{KX_TRIP_Y4S2:'sea'},goto:'d_sea'},{text:'別的城市的老街',if:{custom:G=>!R().kxSeen(G).includes('oldtown')},set:{KX_TRIP_Y4S2:'oldtown'},goto:'d_old'},{text:'山上看星星',set:{KX_TRIP_Y4S2:'stars'},goto:'d_star'}]},   /* 「山上看星星」一定在（AA_336 C7 改的 1C-01 做法；只照「還沒去過的」的話「今天看得到。……」永遠不會出現）*/
      {label:'d_sea'},{scene:'海邊',bg:'y0_sea_blue'},{speaker:'kexin',expression:'teasing',text:'水比我想的冷。……你先下去。'},{goto:'back'},
      {label:'d_old'},{scene:'老街',bg:'trip_oldtown'},{speaker:'kexin',expression:'embarrassed',text:'第三家了。我們只是來看看的。'},{goto:'back'},
      {label:'d_star'},{scene:'山上',bg:'trip_mountain'},{if:{custom:G=>R().kxStarsBefore(G)},speaker:'kexin',expression:'smile',text:'今天看得到。……上次那顆，真的是星星。'},{unless:{custom:G=>R().kxStarsBefore(G)},speaker:'kexin',expression:'smile',text:'好安靜。手機收不到訊號，剛好。'},
      {label:'back'},{scene:'車上',bg:'car'},{speaker:null,text:'（回程她沒有睡。過了收費站，她把音樂關小。）'},{speaker:'kexin',expression:'smile',text:'……畢業以後，還是要開。'},{goto:'fin'},
      {label:'lost'},{set:{KX_TRIP_Y4S2:'lost'}},   /* AA_350 N3：開場、回程用大四版，中間迷路的那一段照用（原本的開場「這次我不出行程表……」、回程「行程表我回去再補……」是大一、大二版）*/
      {scene:'迷路到的地方',bg:'country_road'},
      {speaker:null,text:'（開了一個多小時，轉錯三次彎。路的盡頭是一片田，一間沒有招牌的雜貨店，門口一台舊的投幣販賣機。）'},
      {speaker:'kexin',expression:'surprised',text:'這間店沒有招牌欸。'},{speaker:'kexin',expression:'thinking',text:'……我們到底在哪。'},
      {choice:[{text:'「買兩罐汽水。」',goto:'l1'},{text:'「下次再來？」',goto:'l2'},{text:'（坐在店門口的長椅）',goto:'l3'}]},
      {label:'l1'},{speaker:null,text:'（販賣機吃了你的硬幣。）'},{speaker:'kexin',expression:'laugh',text:'……十塊。回去再記。'},{goto:'lb'},   /* AA_350 R0：大四版開場說「沒有行程表」，這一拍不再說記在行程表上 */
      {label:'l2'},{speaker:'kexin',expression:'laugh',text:'你記得路嗎？我完全不知道我們在哪。'},{goto:'lb'},
      {label:'l3'},{speaker:null,text:'（田裡的風吹過來。她拍了一張照片，照片裡只有路。）'},
      {label:'lb'},{goto:'back'},
      {label:'fin'} ],
    after:G=>{ const k=G.flags.KX_TRIP_Y4S2; if(k){ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; T.Y4S2=k; G.flags.KX_TRIP=T; } } },
  /* ---------- 2-Y4-36 沛珊 P6 媽媽來看她的公開課（4/14（六）14:00 台南的課輔班；BB_99 5-4）---------- */
  { id:'ev_peishan_open_class', title:'公開課', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'台南車站',bg:'tn_station'},
      {speaker:null,text:'（台南車站。你照她傳的地址，搭公車到課輔班。她已經在上課了。）'},   /* 裁定 #44 */
      {scene:'台南・課輔班',bg:'cram_class'},
      {speaker:null,text:'（教室後門，一個穿著早餐店圍裙外套的中年女性偷偷往裡面看。）'},
      {speaker:'沛珊媽媽',text:'（小聲）你是她大學的同學？'},
      {speaker:'沛珊媽媽',text:'她說她要去當老師。我本來不懂。'},
      {speaker:'沛珊媽媽',text:'可是她站在前面的樣子，跟她高中講法律的時候不一樣。'},
      {speaker:'沛珊媽媽',text:'……我們家的榜單還貼著。旁邊多貼了一張。'},
      {if:{custom:()=>hasCG('cg_whiteboard_why_peishan')},cg:'cg_whiteboard_why_peishan'},   /* BCG-05「白板上的為什麼」：媽媽最後一句之後 */
      {speaker:'classmate_peishan',text:'你真的來了！！'},
      {speaker:'classmate_peishan',text:'……我剛剛手一直在抖。你有看到嗎？'},
      {choice:[{text:'「沒有。」',goto:'a'},{text:'「妳媽媽坐最後一排。」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_peishan',text:'你騙人。……好，我當你沒看到。'},{goto:'send'},
      {label:'b'},{speaker:'classmate_peishan',text:'……我知道。我一進教室就看到了。'},
      {label:'send'},{advance:toH(17)},
      {speaker:null,text:'（下課以後，她把老師的外套脫掉，陪你坐車到高鐵站。）'},   /* AA_282 3-1；AA_447 1-2：和去台南找她的送行分開寫 */
      {if:{custom:dating('classmate_peishan')},speaker:'classmate_peishan',text:'你坐最後一排，我一直看到你。……害我講錯一題。'},
      {unless:{custom:dating('classmate_peishan')},speaker:'classmate_peishan',text:'謝謝你來看我上課！到臺北傳給我喔。'},
      {set:{PS_OPEN_CLASS:'went'}} ],
    consequences:{memo:'去台南看沛珊的公開課'},
    beforeOuting:(G,GM)=>{ const r=R(); if(r) r.payFare(GM,'tainan'); },   /* 高鐵票錢照扣（AA_282 第 3 節）*/
    outingMissed:G=>{ const r=R(); if(r) r.psOpenMissed(G); } },
  /* ---------- 2-Y4-38 可昕的生日「今年不要慶祝」：開車上山，送一碗山下那家的酸辣湯餃，不進去（4/24 晚上；nccu_dorm）---------- */
  { id:'ev_kexin_bday_visit_y4', title:'生日（大四）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2/3, kxAway:true,
    dialogue:[ {scene:'政大・宿舍樓下',bg:'nccu_dorm'},
      {speaker:'kexin',expression:'surprised',text:'……你開上山就為了這個？'},
      {speaker:'kexin',expression:'smile',text:'湯還是熱的。'} ],
    after:G=>{ const r=R(); if(r) r.kxBdaySet(G,'visit'); },   /* KX_BDAY:{4:'visit'}（AA_327 2-Y4-38 第 4 節）*/
    outingMissed:G=>{ const r=R(); if(r) r.kxBdayMissed(G); } },
  /* ---------- 2-Y4-39 系籃最後一場（5/12（六）10:00 新體育館）＋吉他社成發（19:00）---------- */
  { id:'ev_last_game_y4', title:'系籃最後一場', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'新體育館・球場',bg:'dark'},
      {speaker:null,text:'（新體育館。阿哲在場邊綁鞋帶，綁了三次。）'},
      {choice:[{text:'拍手',goto:'c'},{text:'記分',goto:'s'},{text:'送水',goto:'w'}]},
      {label:'c'},{speaker:null,text:'（你在觀眾席拍到手掌發紅。阿哲進球，轉身指著你：「有聽到！」）'},{goto:'end'},
      {label:'s'},{speaker:null,text:'（你坐到記分台，這次一分都沒翻錯。）'},{goto:'end'},
      {label:'w'},{speaker:null,text:'（中場你把一箱水搬到場邊。阿哲喝了一口：「後勤部長，最後一次。」）'},
      {label:'end'},
      {if:kn('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'最後一場。'},
      {if:kn('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'……這次我不先走。'},   /* 接大三 M3「我九點家教。我先走。」*/
      {speaker:'zhe',text:'（坐在場邊，把護膝拿下來）四年。……好，吃午餐。'},
      {set:{BALL_Y4:'went'}} ],
    outingMissed:G=>{ const r=R(); if(r) r.ballMissed(G); } },
  { id:'ev_concert_y4', title:'吉他社成發', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'萬才館大廳',bg:'dark'},   /* 場地照 AA_13 G3（大一的成發在萬才館大廳，activities.js guitar_show_y1s2）；沒有 2D 底圖＝dark＋字幕 */
      {speaker:null,text:'（Alison 拿著流程表跑來跑去。）'},
      {if:kn('yu'),speaker:'yu',text:'最後一首！最後一首！誰把麥克風拿走了！'},
      {if:{custom:G=>R().friendUp(G,'heroine_04')&&R().has('heroine_04','CLAPPED')},speaker:'heroine_04',text:'原來坐這裡是這種感覺。你以前都這麼大聲喔？'},   /* 子晴回來當評審（BB_70 8d）*/
      {if:{custom:G=>R().friendUp(G,'heroine_04')&&!R().has('heroine_04','CLAPPED')},speaker:'heroine_04',text:'原來坐這裡是這種感覺。'},
      {speaker:'kai',text:'我還是沒入社。'},
      {set:{CONCERT_Y4:'went'}} ],
    outingMissed:G=>{ const r=R(); if(r) r.concertMissed(G); } },
  /* ---------- 2-Y4-40 可昕 K25 讀書會的最後一晚（5/16（三）21:00；BB_99 9-16）：開車送宵夜（政大）／視訊。互考的比數拿掉（AA_263）---------- */
  { id:'ev_kexin_last_study_night', title:'讀書會的最後一晚', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {if:{flagIs:{KX_K25:'video'}},goto:'v'},
      {scene:'政大・宿舍樓下',bg:'nccu_dorm'},
      {speaker:'予樂',text:'司機升級成外送員。'},{goto:'shelf'},
      {label:'v'},{scene:'視訊',bg:'video'},
      {speaker:null,text:'（邵鈞對著鏡頭點頭致意。）'},
      {label:'shelf'},
      {speaker:null,text:'（散場前，她帶你看讀書會的書架。最右邊空了一格。）'},
      {speaker:'kexin',expression:'thinking',text:'這一格空著。還不知道要放什麼。'},
      {set:{KX_SHELF:true}},
      {if:{flagIs:{KX_K25:'video'}},end:true},
      {scene:'河濱',bg:'riverside'},   /* 回程（開車的版本）*/
      {if:{custom:G=>R().kxInBarGroup(G)},speaker:'kexin',expression:'serious',text:'明天開始，讀書會的人各自讀。……我們兩個照表。'},
      {unless:{custom:G=>R().kxInBarGroup(G)},speaker:'kexin',expression:'serious',text:'明天開始，各自讀。'} ],
    outingMissed:G=>{ const r=R(); if(r) r.k25Missed(G); } },
  /* ---------- 2-Y4-43 期末最後一頓（2029-06-22（五）19:00 麵店；不佔學期末的飯）---------- */
  { id:'ev_last_meal_y4', title:'期末最後一頓', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的牆上貼滿了照片。四年來，大家在長桌拍的。）'},
      {speaker:'阿姨',text:'照片我貼起來了。你們自己找，找不到的下次帶一張來。'},   /* 交接包_v5 3b。AA_519 1-5：「二十三週年那一張。」原本讀 ANNIVERSARY_23（沒有人設），改讀 y34b3d.js 設的 ANNIV23（'there'＝那天在場；美國路線的遠端版 'remote' 不在照片裡）*/
      {choice:[{text:'「大一第一次來的那一張。」',goto:'p1'},{text:'「二十三週年那一張。」',if:{flagIs:{ANNIV23:'there'}},goto:'p2'},{text:'「找不到。」',goto:'p3'}]},
      {label:'p1'},{speaker:null,text:'（照片裡的你，坐在最旁邊，筷子還沒拆。）'},{goto:'end'},
      {label:'p2'},{speaker:null,text:'（長桌坐滿，你被擠在角落，只照到半張臉。）'},{goto:'end'},
      {label:'p3'},{speaker:'阿姨',text:'找不到就下次帶一張來。'},
      {label:'end'},
      {if:kn('yu'),speaker:'yu',text:'這是最後一頓了。'},
      {if:kn('zhe'),speaker:'zhe',text:'這不是最後一頓。下週二還是麵店。'},   /* AA_71 2-13 */
      {set:{LAST_MEAL_Y4:'went'}} ],
    consequences:{memo:'期末最後一頓（麵店）'},
    outingMissed:G=>{ const r=R(); if(r) r.lastMealMissed(G); } },
  /* ---------- 2-Y4-44 可昕 K26（7/7（六）15:00「老地方」；BB_99 9-18、10-1 第 18 項；AA 審稿 #47）---------- */
  /* 地點＝約會紀錄裡次數最多的那一個（背景跟著換），所以整段在 R2Y4B.k26Scene 演（台詞在 R2Y4B.K26）*/
  { id:'ev_kexin_after_grad', title:'老地方', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ const r=R(); if(r) await r.k26Scene(GM,q); },
    outingMissed:G=>{ const r=R(); if(r) r.k26Missed(G); } },
  /* ---------- 2-Y4-46 七月最後一次的心意邀約（7/14；AA_266）：飯和回家的路在 R2Y4B.julyScene（照 AA_254 第 0 節的格式；沒有飯桌一句、不放 CG、沒有「讓我想想」）---------- */
  { id:'ev_heart_july', title:'最後一次的邀約', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ const r=R(); if(r) await r.julyScene(GM,q); } },
  /* ---------- 2-Y4-47 芷若回國：畢業時和她交往中＝9/1（六）22:00 打烊後的 Café（BB_99 6b-1）；分開過的＝她回 Café 的第一週第一次進 Café（BB_119 第 4 節）---------- */
  { id:'ev_zhiruo_back_cafe', title:'一年', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'兩點半 Café（打烊以後）',bg:'dark'},   /* Z13 那張 2D 還沒有：dark＋字幕 */
      {speaker:null,text:'（她做了一杯熱拿鐵，不加糖。杯子上用麥克筆寫著：「熱拿鐵・不加糖」。下面一行小字：「一年。」）'},
      {speaker:'heroine_02',text:'我回來了。'},
      {set:{ZR_CUP_Y5:'there'}} ],
    outingMissed:G=>{ const r=R(); if(r) r.zrCupMissed(G); } },
  { id:'ev_zhiruo_back_ex', title:'好久不見', participants:['heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>{ const r=R(); return !!r&&r.zrExDue(G); }},
    dialogue:[ {speaker:'heroine_02',text:'好久不見。……老樣子？'} ] },   /* BB_119 第 4 節（分開後第一次見面）*/
  /* 伴侶版沒到（ZR_CUP_Y5 'later'）：之後第一次進 Café，她照樣把那個杯子拿出來 */
  { id:'ev_zhiruo_cup_later', title:'一年', participants:['heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{flagIs:{ZR_CUP_Y5:'later'},custom:G=>{ const r=R(); return !!r&&r.zrBackHere(G); }},
    dialogue:[ {speaker:null,text:'（她照樣把那個杯子拿出來。）'} ] },
  /* ---------- 2-Y4-48 明軒出發去德國（9/2（日）07:00 桃園機場；BB_99 6b-2）---------- */
  { id:'ev_mingxuan_depart', title:'明軒出發', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'機場・出境',bg:'airport_departure'},
      {speaker:null,text:'（出境的門口。明軒的行李只有一個，背包很大。）'},
      {speaker:'classmate_mingxuan',text:'我說不用來。'},
      {if:kn('zhe'),speaker:'zhe',text:'（把一袋東西塞給他）滷味。上飛機前吃完。'},
      {if:kn('yu'),speaker:'yu',text:'德國香腸！！回來要帶！！'},
      {speaker:'classmate_mingxuan',text:'……好。'},
      {choice:[{text:'「一路順風。」',goto:'a'},{text:'「錢夠嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_mingxuan',text:'好。八月見。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_mingxuan',text:'……我算過了。CP 值很高的一年。'},
      {label:'end'},{set:{MX_DEPART:'airport'}} ],
    outingMissed:G=>{ const r=R(); if(r) r.mxDepartMissed(G); } },
  /* ---------- 2-Y4-50 以安：哥大（2030-03-28（四）19:00 麵店，她約的；AA_285 第 4 節④）＋紐約送機（2030-08-11（日）10:00；④⑤）---------- */
  { id:'ev_an_columbia', title:'哥大', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'},
      {speaker:null,text:'（麵店。長桌的人還沒到，她坐在角落那張兩人桌。）'},
      {speaker:'heroine_01',text:'哥大上了。我要去。'},
      {speaker:'heroine_01',text:'司法官學院，我寫信說不去報到。研究所辦休學。'},
      {speaker:'heroine_01',text:'我媽聽了一個小時。最後她說：你講得比我想的清楚。'},
      {choice:[{text:'「為什麼都不要？」',goto:'a'},{text:'「妳確定？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_01',text:'都考上，是要知道我做得到。……可是我想做的是公司、證券那些案子。法官很少遇到。'},{goto:'d'},
      {label:'b'},{speaker:'heroine_01',text:'確定。寫信的時候手有一點抖。'},   /* AA_447 1-4：「抖的是手，不是我」拿掉 */
      {label:'d'},{unless:{custom:dating('heroine_01')},goto:'end'},
      {speaker:'heroine_01',text:'八月走。一年。'},
      {speaker:null,text:'（她看著你，等你說話。）'},
      {choice:[{text:'「我等妳。」',goto:'w'},{text:'「我去紐約找妳。」',goto:'n'}]},
      {label:'w'},{speaker:'heroine_01',text:'……嗯。'},{goto:'end'},
      {label:'n'},{if:jpGo,speaker:'heroine_01',text:'好。跟上次一樣，機票你自己訂，行程我排。'},{unless:jpGo,speaker:'heroine_01',text:'好。機票你自己訂，行程我排。'},   /* AA_447 1-3：答應過日本七夕那一次的換句 */
      {label:'end'},{mem:[{npc:'heroine_01',tag:'AN_COLUMBIA',note:''}]} ],
    outingMissed:G=>{ const r=R(); if(r) r.anColumbiaMissed(G); } },
  { id:'ev_an_ny_sendoff', title:'紐約', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'桃園機場・出境',bg:'airport_departure'},
      {if:{custom:dating('heroine_01')},goto:'gf'},
      {unless:sawJP,speaker:null,text:'（桃園機場，出境的門口。麵店團站成一排。）'},
      {unless:sawJP,speaker:'heroine_01',text:'（看了一下手錶）你們不用全部都來的。'},
      {unless:sawJP,if:kn('zhe'),speaker:'zhe',text:'要。'},
      {if:sawJP,speaker:null,text:'（桃園機場，出境的門口。兩年多前送她去日本，也是這個門口。）'},   /* AA_447 1-1：看過 2028-03-25 那一場的（送過機或日本路線一起出發）*/
      {if:sawJP,speaker:'heroine_01',text:'（看了一下手錶）……我上次也說過。你們不用全部都來的。'},
      {if:sawJP,unless:{custom:G=>!knows('zhe',G)},speaker:'zhe',text:'上次你也知道我們會來。'},
      {speaker:'heroine_01',text:'……好。'},
      {speaker:'heroine_01',text:'（轉向你）回來的時候，我會在事務所。你來找我，要預約。'},
      {choice:[{text:'「好。我預約。」',goto:'f1'},{text:'（揮手）',goto:'f2'}]},
      {label:'f1'},{speaker:'heroine_01',text:'……嗯。'},{speaker:null,text:'（她走進去。）'},{goto:'end'},
      {label:'f2'},{speaker:null,text:'（她走到一半，回頭揮了一下。）'},{goto:'end'},
      {label:'gf'},
      {unless:sawJP,speaker:null,text:'（桃園機場，出境的門口。麵店團站成一排。）'},
      {unless:sawJP,speaker:'heroine_01',text:'（看了一下手錶）你們不用全部都來的。'},   /* 她先跟大家說完，再轉過來；交往版的那幾句是大家看不到的時候說的（不演公開戀情）*/
      {unless:sawJP,if:kn('zhe'),speaker:'zhe',text:'要。'},
      {if:sawJP,speaker:null,text:'（桃園機場，出境的門口。兩年多前送她去日本，也是這個門口。）'},
      {if:sawJP,speaker:'heroine_01',text:'（看了一下手錶）……我上次也說過。你們不用全部都來的。'},
      {if:sawJP,unless:{custom:G=>!knows('zhe',G)},speaker:'zhe',text:'上次你也知道我們會來。'},
      {speaker:'heroine_01',text:'……好。'},
      {speaker:null,text:'（她的行李有兩個。手帳在外套口袋裡。）'},
      {speaker:'heroine_01',text:'紐約比臺北慢十二個小時。……我算過了，你早上起床，我剛好要睡。'},
      {speaker:'heroine_01',text:'每天一句就好。'},
      {speaker:'heroine_01',text:'回來的時候，我會在事務所。你來找我，要預約。'},
      {speaker:'heroine_01',text:'……你不用預約。'},
      {choice:[{text:'「每天一句。」',goto:'g1'},{text:'（抱她一下）',goto:'g2'}]},
      {label:'g1'},{speaker:'heroine_01',text:'嗯。……寫你自己的事就好。'},{goto:'end'},
      {label:'g2'},{speaker:null,text:'（她很快地回抱了一下，轉身走進去。走到一半回頭，揮了一下手。）'},
      {label:'end'},{set:{AN_NY_SENDOFF:'went'}} ],
    outingMissed:G=>{ const r=R(); if(r) r.anSendoffMissed(G); } },
  /* ---------- 2-Y4-56 美國路線、和學姊交往中：秋假大峽谷（美東 10/7～10/14；AA_291 2-1）---------- */
  { id:'ev_us_canyon', title:'秋假：大峽谷', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'亞利桑那',bg:'dark'},   /* gc_roadside_car 沒有：dark＋字幕 */
      {speaker:null,text:'（她靠在租來的車旁邊，手上拿著一張列印的地圖。）'},
      {speaker:'heroine_05',text:'路線我排好了。上車。'},
      {advance:toDay('2028-10-08',12)},{titleCard:'10/8（日）',sub:'亞利桑那'},{speaker:null,text:'（沙漠裡的加油站，她買了兩瓶很大的水。）'},
      {advance:toDay('2028-10-09',12)},{titleCard:'10/9（一）',sub:'亞利桑那'},{speaker:null,text:'（第一眼看到峽谷的時候，你們兩個都沒說話。）'},
      {advance:toDay('2028-10-10',12)},{titleCard:'10/10（二）',sub:'亞利桑那'},{speaker:null,text:'（她在步道上走得比你快。走到一半，她回頭把手伸給你。）'},
      {advance:toDay('2028-10-11',21)},{titleCard:'10/11（三）',sub:'汽車旅館'},{scene:'汽車旅館',bg:'trip_hotel_twin'},{speaker:null,text:'（汽車旅館的電視只有三台。她轉到氣象台，看了很久。）'},
      {advance:toDay('2028-10-12',12)},{titleCard:'10/12（四）',sub:'亞利桑那'},{speaker:null,text:'（她的論文第四章帶來了，還在背包最下面。）'},
      {advance:toDay('2028-10-13',18)},{scene:'峽谷',bg:'dark'},   /* gc_rim_sunset 沒有：dark＋字幕 */
      {speaker:null,text:'（太陽慢慢沉到峽谷另一邊。風很大，她把外套拉鍊拉到最上面。）'},
      {speaker:'heroine_05',text:'第四章，我本來想在這裡寫完。'},
      {speaker:'heroine_05',text:'……結果一個字都沒寫。'},
      {choice:[{text:'「那就不要寫。」',goto:'a'},{text:'（把你的外套也披到她身上）',goto:'b'}]},
      {label:'a'},{speaker:'heroine_05',text:'嗯。今天不寫。'},{speaker:null,text:'（她把頭靠在你肩上。）'},{goto:'back'},
      {label:'b'},{speaker:'heroine_05',text:'你會冷。'},{speaker:null,text:'（她拉開外套，把你也包進來。）'},
      {label:'back'},{advance:toDay('2028-10-14',18)},
      {speaker:null,text:'（車還回去的時候，里程表多了一千兩百哩。）'},
      {set:{US_CANYON:true}} ],
    after:G=>{ const r=R(); if(r) r.canyonAfter(G,'us'); } },
  /* ---------- 2-Y4-57 學姊在美國的視訊（T3；她那邊週日 21:00＝臺灣週一早上）：三組輪換；9/30 以前最後一次視訊、條件到了＝約大峽谷（AA_253 10-2）---------- */
  { id:'ev_sis_video', title:'視訊', participants:['heroine_05'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {if:{custom:G=>R().sisVideoSet(G)===0},goto:'v0'},{if:{custom:G=>R().sisVideoSet(G)===1},goto:'v1'},
      {if:{custom:G=>R().sisVideoSet(G)===4},goto:'t4'},{if:{custom:G=>R().sisVideoSet(G)===5},goto:'t5'},{if:{custom:G=>R().sisVideoSet(G)===6},goto:'t6'},{if:{custom:G=>R().sisVideoSet(G)===7},goto:'t7'},   /* AA_516 第 3 節（企劃線 a9b87c588）：v0～v2 用完以後再補四組（R().SA_VT：9/17、10/22、11/19、12/17 起；口氣是朋友，講她自己的事）*/
      {if:{custom:G=>R().sisVideoSet(G)>=3},goto:'vn'},   /* AA_378 S1：三組各一次，之後只有一行旁白 */
      {speaker:'heroine_05',text:'你那邊是早上吧。……我這邊剛下雨。'},
      {speaker:'heroine_05',text:'今天沒什麼事。……只是想打給你。'},
      {speaker:'heroine_05',text:'好。下禮拜同一個時間。'},{goto:'inv'},
      {label:'v0'},{speaker:null,text:'（畫面裡她的背後是一面白牆，桌上一杯咖啡。）'},
      {speaker:'heroine_05',text:'你那邊是早上吧。……我這邊剛寫完報告。'},
      {speaker:'heroine_05',text:'今天有人問我臺灣在哪裡。我畫了一張地圖給他。'},
      {speaker:'heroine_05',text:'好，我去睡了。你去吃早餐。'},{goto:'inv'},
      {label:'v1'},{speaker:'heroine_05',text:'（畫面裡是她的計畫本）這一格寫的是你的考試。……你考完要跟我說。'},
      {speaker:'heroine_05',text:'好，我去睡了。你去吃早餐。'},{goto:'inv'},
      {label:'t4'},{speaker:'heroine_05',text:'研究小間隔壁的人，每天都比我早到。',aa516:true},{speaker:'heroine_05',text:'今天我比他早了十分鐘。……他看到我，愣了一下。',aa516:true},
      {choice:[{text:'「妳贏了。」',goto:'t4a',aa516:true},{text:'「你們有說話嗎？」',goto:'t4b',aa516:true}]},
      {label:'t4a'},{speaker:'heroine_05',text:'嗯。明天他會更早。',aa516:true},{goto:'inv'},
      {label:'t4b'},{speaker:'heroine_05',text:'沒有。點頭。這樣剛好。',aa516:true},{goto:'inv'},
      {label:'t5'},{speaker:'heroine_05',text:'葉子全紅了。',aa516:true},{speaker:'heroine_05',text:'……我寄了一片回去。應該快到了。',aa516:true},   /* 10/26 楓葉書籤（ev_sis_maple）前面 */
      {choice:[{text:'「寄給誰？」',goto:'t5a',aa516:true},{text:'「拍給我看。」',goto:'t5b',aa516:true}]},
      {label:'t5a'},{speaker:'heroine_05',text:'到了你就知道。',aa516:true},{goto:'inv'},
      {label:'t5b'},{speaker:null,text:'（她把鏡頭轉向窗外：一棵紅的樹。）',aa516:true},{speaker:'heroine_05',text:'這棵。',aa516:true},{goto:'inv'},
      {label:'t6'},{speaker:'heroine_05',text:'感恩節，同學的媽媽要請我吃飯。',aa516:true},{speaker:'heroine_05',text:'我在練習說謝謝。英文的，要說得像真的。',aa516:true},
      {choice:[{text:'「說一次給我聽。」',goto:'t6a',aa516:true},{text:'「妳本來就說得很真。」',goto:'t6b',aa516:true}]},
      {label:'t6a'},{speaker:null,text:'（她說了一次。很標準。）',aa516:true},{speaker:'heroine_05',text:'……這樣可以嗎。',aa516:true},{goto:'inv'},
      {label:'t6b'},{speaker:'heroine_05',text:'中文的才是。',aa516:true},{goto:'inv'},
      {label:'t7'},{speaker:'heroine_05',text:'最後一通。下週六回去。',aa516:true},{speaker:'heroine_05',text:'回去以後，這個時間我應該在睡覺。',aa516:true},
      {choice:[{text:'「回來見。」',goto:'t7a',aa516:true},{text:'「那換我打給妳。」',goto:'t7b',aa516:true}]},
      {label:'t7a'},{speaker:'heroine_05',text:'嗯。回去見。',aa516:true},{goto:'inv'},
      {label:'t7b'},{speaker:'heroine_05',text:'……白天打。我會醒著。',aa516:true},{goto:'inv'},
      {label:'vn'},{speaker:null,text:'（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）'},   /* R().SA_V_NARR */
      {label:'inv'},{unless:{custom:G=>R().sisInviteDue(G)},end:true},
      {speaker:'heroine_05',text:'十月有一個禮拜的秋假。我想開車去大峽谷。'},
      {speaker:'heroine_05',text:'……一個人開太遠。你要不要來？'},
      {choice:[{text:'「我去。」',set:{SIS_CANYON_ASK:'go'},goto:'go'},{text:'「我再看看。」',set:{SIS_CANYON_ASK:'wait'},goto:'wait'}]},
      {label:'go'},{speaker:'heroine_05',text:'好。我去機場接你。'},{end:true},
      {label:'wait'},{speaker:'heroine_05',text:'九月底以前跟我說。'} ],
    after:G=>{ const r=R(); if(r) r.sisVideoAfter(G); } },
  /* ---------- AA_392 第 1 節（SIS-B6-L-1023）：交往中（臺灣、日本路線，她在美國）每週日 10:00 的視訊——六組照順序、各一次（R().SA_VD；同 AA_378 S1 不輪播），
     沒到那一組的週次、用完以後只有一行旁白；沒接＝outingMissed「你在忙。下週。」（連兩週沒接，第三週她不打，r2y4b3d.js saGf）---------- */
  { id:'ev_sis_video_gf', title:'視訊', participants:['heroine_05'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      /* AA_516 1-3（企劃線 a9b87c588）：臺灣路線 10/13 大峽谷才交往的（SIS_GF_CANYON），開始交往後第一次女朋友視訊開頭多一句（一次；src/sis_b14_3d.js canyonOpenDue）*/
      {if:{custom:G=>typeof SISB14!=='undefined'&&SISB14.canyonOpenDue(G)},speaker:'heroine_05',text:'峽谷回來以後，第一次這樣打給你。',set:{SIS14_CANYON_OPEN:true},aa516:true},
      /* AA_512 第 2 節第 6、9 點（企劃線 c444f0757）：開頭多的話（條件在 src/sis_b13_3d.js；aa512：tests/aa512_sis_b13_unit.js 對稿）——
         除夕電話問過「妳會想家嗎？」的，第四十天那一週（9/10）的視訊；上一次 g3 選「我這邊也還沒吃。」、g2 選「那是好問題的意思嗎？」的，下一次視訊 */
      {if:{custom:G=>typeof SISB13!=='undefined'&&SISB13.day40Video(G)},speaker:'heroine_05',text:'你之前問我會不會想家。……會。今天第四十天。',set:{SIS13_DAY40:'video'},aa512:true},
      {if:{custom:G=>typeof SISB13!=='undefined'&&SISB13.g3Due(G)},speaker:null,text:'（她把另一半月餅拿到鏡頭前。）',aa512:true},
      {if:{custom:G=>typeof SISB13!=='undefined'&&SISB13.g3Due(G)},speaker:'heroine_05',text:'說好的。……你的呢？',set:{SIS13_G3_SAID:true},aa512:true},
      {if:{custom:G=>typeof SISB13!=='undefined'&&SISB13.g2Due(G)},speaker:'heroine_05',text:'我又舉手了。……教授說「下課來找我」。',aa512:true},
      {if:{custom:G=>typeof SISB13!=='undefined'&&SISB13.g2Due(G)},speaker:'heroine_05',text:'我去了。聊了半小時。……原來那真的是好問題。',set:{SIS13_G2_SAID:true},aa512:true},
      {if:{custom:G=>R().sisGfSet(G)===0},goto:'g1'},{if:{custom:G=>R().sisGfSet(G)===1},goto:'g2'},{if:{custom:G=>R().sisGfSet(G)===2},goto:'g3'},
      {if:{custom:G=>R().sisGfSet(G)===3},goto:'g4'},{if:{custom:G=>R().sisGfSet(G)===4},goto:'g5'},{if:{custom:G=>R().sisGfSet(G)===5},goto:'g6'},
      /* AA_516 2-2（企劃線 a9b87c588）：h1～h9（R().SA_VH，gset 7～15；6＝旁白照舊）*/
      {if:{custom:G=>R().sisGfSet(G)===7},goto:'h1'},{if:{custom:G=>R().sisGfSet(G)===8},goto:'h2'},{if:{custom:G=>R().sisGfSet(G)===9},goto:'h3'},
      {if:{custom:G=>R().sisGfSet(G)===10},goto:'h4'},{if:{custom:G=>R().sisGfSet(G)===11},goto:'h5'},{if:{custom:G=>R().sisGfSet(G)===12},goto:'h6'},
      {if:{custom:G=>R().sisGfSet(G)===13},goto:'h7'},{if:{custom:G=>R().sisGfSet(G)===14},goto:'h8'},{if:{custom:G=>R().sisGfSet(G)===15},goto:'h9'},
      {speaker:null,text:'（視訊。她那邊是週六晚上。你們講到她那邊快十二點，她說要睡了，鏡頭又開了三分鐘才關。）'},{end:true},   /* R().SA_VG_NARR */
      {label:'g1'},{speaker:'heroine_05',text:'到這邊一個禮拜了。'},{speaker:'heroine_05',text:'房間的書桌，比研究室那張還小。'},
      {choice:[{text:'「給我看。」',goto:'g1a'},{text:'「妳吃飯了嗎？」',goto:'g1b'}]},
      {label:'g1a'},{speaker:null,text:'（她把鏡頭轉過去：一張桌子，上面已經疊了三本書。）'},{speaker:'heroine_05',text:'三本是今天借的。'},{end:true},
      {label:'g1b'},{speaker:'heroine_05',text:'吃了。三明治。這邊的三明治都很大，我吃一半，另一半當明天早餐。'},{end:true},
      {label:'g2'},{speaker:'heroine_05',text:'這邊上課，大家一直舉手。'},{speaker:'heroine_05',text:'我今天舉了一次。……講完教授說「好問題」，然後就換下一個人了。'},
      {choice:[{text:'「那是好問題的意思嗎？」',consequences:{stamp:['SIS13_G2_DAY']},goto:'g2a'},{text:'「妳問了什麼？」',goto:'g2b'}]},   /* AA_512 第 2 節第 9 點：記那一天（SIS13_G2_DAY），下一次視訊開頭兌現 */
      {label:'g2a'},{speaker:'heroine_05',text:'我也在想。……下禮拜再舉一次，看他怎麼說。'},{end:true},
      {label:'g2b'},{speaker:'heroine_05',text:'臺灣的法律扶助要等多久。他們那邊等更久。'},{end:true},
      {label:'g3'},{speaker:'heroine_05',text:'這邊沒有中秋。'},{speaker:null,text:'（她把一個小紙盒舉到鏡頭前，裡面是一顆月餅。）'},
      {speaker:'heroine_05',text:'亞洲超市買的。一顆就要五塊美金。'},{speaker:'heroine_05',text:'……我切一半給你看。另一半留到星期二。'},
      {choice:[{text:'「我這邊也還沒吃。」',consequences:{stamp:['SIS13_G3_DAY']},goto:'g3a'},{text:'（把你桌上的柚子拿起來給她看）',goto:'g3b'}]},   /* AA_512 第 2 節第 9 點：記那一天（SIS13_G3_DAY），下一次視訊開頭兌現 */
      {label:'g3a'},{speaker:'heroine_05',text:'那星期二一起吃。你那邊早上，我這邊晚上。'},{end:true},
      {label:'g3b'},{speaker:'heroine_05',text:'……不公平。'},{end:true},
      {label:'g4'},{speaker:'heroine_05',text:'這邊五點就天黑了。'},{speaker:'heroine_05',text:'從圖書館走回來，路上都沒有人。'},{speaker:null,text:'（她停了一下。）'},
      {speaker:'heroine_05',text:'……天黑得早，我就比較常想到你。說完了，換你講。'},   /* 這一段裡唯一一句講感情的話（AA_202 3-1 第 7 點）*/
      {choice:[{text:'「我也是。」',goto:'g4a'},{text:'「妳要早點回去。」',goto:'g4b'}]},
      {label:'g4a'},{speaker:'heroine_05',text:'嗯。'},{speaker:null,text:'（她低頭整理了一下桌上的書）'},{end:true},
      {label:'g4b'},{speaker:'heroine_05',text:'好。我會。'},{end:true},
      {label:'g5'},{if:{custom:G=>R().sisGfThanksPhoto(G)},speaker:'heroine_05',text:'照片你看到了吧。'},{unless:{custom:G=>R().sisGfThanksPhoto(G)},speaker:'heroine_05',text:'同學的媽媽請我去吃感恩節。'},
      {speaker:'heroine_05',text:'火雞很乾。她多煮了一碗白飯給我。……我吃完了。'},
      {choice:[{text:'「妳有說謝謝嗎？」',goto:'g5a'},{text:'「白飯好吃嗎？」',goto:'g5b'}]},
      {label:'g5a'},{speaker:'heroine_05',text:'說了三次。第三次她抱了我一下。'},{end:true},
      {label:'g5b'},{speaker:'heroine_05',text:'是電鍋煮的。……我差點哭。沒有，沒哭。'},{end:true},
      {label:'g6'},{speaker:'heroine_05',text:'二十三號晚上八點落地。',aa516:true},{speaker:'heroine_05',text:'班次，回去前傳給你。',aa516:true},   /* AA_516 1-1（企劃線 a9b87c588）：原本「二十三號早上到。」「機場的班次我傳給你了。」和接機（12/23 20:30 入境大廳、12/20 那一則）對不上 */
      {choice:[{text:'「我去接妳。」',goto:'g6a'},{text:'「要我帶什麼？」',goto:'g6b'}]},
      {label:'g6a'},{speaker:'heroine_05',text:'好。……我會在出口那邊找你。'},{end:true},
      {label:'g6b'},{speaker:'heroine_05',text:'外套。我的那件在行李最下面。'},{end:true},
      /* ---- AA_516 2-2 h1～h9（台詞照稿；h5 選「好吃嗎？」記 SIS14_CURRY_PROMISE＝2-5 12/31 她家的咖哩）---- */
      {label:'h1'},{speaker:'heroine_05',text:'這邊的雞蛋，盒子上的日期是月份寫在前面。',aa516:true},{speaker:'heroine_05',text:'我第一次看反了，以為過期了，丟掉一盒。',aa516:true},
      {choice:[{text:'「妳丟了一整盒？」',goto:'h1a',aa516:true},{text:'「下次看清楚。」',goto:'h1b',aa516:true}]},
      {label:'h1a'},{speaker:'heroine_05',text:'十八顆。……我現在每天早上吃兩顆，補回來。',aa516:true},{end:true},
      {label:'h1b'},{speaker:'heroine_05',text:'嗯。我寫在計畫本最前面了。',aa516:true},{end:true},
      {label:'h2'},{speaker:'heroine_05',text:'這邊的游泳池是五十公尺的。',aa516:true},{speaker:'heroine_05',text:'我游一趟，中間要停一次。在臺灣不用。',aa516:true},
      {choice:[{text:'「會習慣的。」',goto:'h2a',aa516:true},{text:'「那就停一次。」',goto:'h2b',aa516:true}]},
      {label:'h2a'},{speaker:'heroine_05',text:'嗯。救生員已經記得我了。……他說我每天都是第一個。',aa516:true},{end:true},
      {label:'h2b'},{speaker:'heroine_05',text:'……好。停一次，不算輸。',aa516:true},{end:true},
      {label:'h3'},{speaker:'heroine_05',text:'研討課的同學，都叫我 Shu。',aa516:true},{speaker:'heroine_05',text:'書瑀太難念了。他們念了三次，我說 Shu 就好。',aa516:true},
      {choice:[{text:'「那我也叫妳 Shu？」',goto:'h3a',aa516:true},{text:'「Shu 很好聽。」',goto:'h3b',aa516:true}]},
      {label:'h3a'},{speaker:'heroine_05',text:'不要。……你叫原本那個。',aa516:true},{end:true},
      {label:'h3b'},{speaker:'heroine_05',text:'嗯。可是回去以後，就沒有人這樣叫了。',aa516:true},{end:true},
      {label:'h4'},{speaker:'heroine_05',text:'這邊的葉子全紅了。',aa516:true},{speaker:'heroine_05',text:'我寄了一個東西回去。……不要問，到了就知道。',aa516:true},   /* 10/26 楓葉書籤（ev_sis_maple）前面 */
      {choice:[{text:'「給我一個提示。」',goto:'h4a',aa516:true},{text:'「好。我等。」',goto:'h4b',aa516:true}]},
      {label:'h4a'},{speaker:'heroine_05',text:'很輕。……好，提示結束。',aa516:true},{end:true},
      {label:'h4b'},{speaker:'heroine_05',text:'嗯。',aa516:true},{end:true},
      {label:'h5'},{speaker:'heroine_05',text:'宿舍廚房的鍋子太薄了，咖哩會黏底。',aa516:true},{speaker:'heroine_05',text:'我今天站在旁邊攪了四十分鐘。',aa516:true},
      {choice:[{text:'「好吃嗎？」',set:{SIS14_CURRY_PROMISE:true},goto:'h5a',aa516:true},{text:'「換一個鍋子。」',goto:'h5b',aa516:true}]},   /* 2-5：回臺灣以後 12/31 中午她家（src/sis_b14_3d.js）*/
      {label:'h5a'},{speaker:'heroine_05',text:'好吃。……下次回去，用家裡的鍋子煮給你。',aa516:true},{end:true},
      {label:'h5b'},{speaker:'heroine_05',text:'鍋子很貴。……我再攪四十分鐘就好。',aa516:true},{end:true},
      {label:'h6'},{speaker:'heroine_05',text:'第四章第一節，教授在旁邊寫了一個字。',aa516:true},{speaker:null,text:'（她把螢幕轉過來：紅色的，「好」。）',aa516:true},
      {choice:[{text:'「跟第二章一樣。」',goto:'h6a',aa516:true},{text:'「恭喜。」',goto:'h6b',aa516:true}]},   /* 「第二章旁邊寫了一個字：好」是 AA_508 0-1 的事；沒有那段記憶的玩家照用（稿 2-2）*/
      {label:'h6a'},{speaker:'heroine_05',text:'……你記得。嗯，一樣。',aa516:true},{end:true},
      {label:'h6b'},{speaker:'heroine_05',text:'還有三節。……先恭喜這一節。',aa516:true},{end:true},
      {label:'h7'},{speaker:'heroine_05',text:'宿舍的烘衣機壞了一台。大家都在排隊。',aa516:true},{speaker:'heroine_05',text:'我帶論文下去排。排到的時候，剛好寫完一段。',aa516:true},
      {choice:[{text:'「效率很好。」',goto:'h7a',aa516:true},{text:'「衣服乾了嗎？」',goto:'h7b',aa516:true}]},
      {label:'h7a'},{speaker:'heroine_05',text:'嗯。烘衣機壞掉的那一台，我希望它不要修。',aa516:true},{end:true},
      {label:'h7b'},{speaker:'heroine_05',text:'……還沒。我又要下去一次。',aa516:true},{end:true},
      {label:'h8'},{speaker:'heroine_05',text:'下雪了。這次積起來了。',aa516:true},{speaker:null,text:'（她把鏡頭轉向窗外：路燈下，白的。）',aa516:true},{speaker:'heroine_05',text:'你沒看過雪吧。',aa516:true},   /* 對齊 1-8、1-9（家族群組 12/3、12/6 的照片）*/
      {choice:[{text:'「沒有。」',goto:'h8a',aa516:true},{text:'「看過，在合歡山。」',goto:'h8b',aa516:true}]},
      {label:'h8a'},{speaker:'heroine_05',text:'那我拍給你。……有腳印的那種。',aa516:true},{end:true},   /* 家族群組 12/6（三）的照片就是 1-9 那一張（不另外送）*/
      {label:'h8b'},{speaker:'heroine_05',text:'……那不一樣。這邊是一整片。',aa516:true},{end:true},
      {label:'h9'},{speaker:'heroine_05',text:'最後一通了。',aa516:true},{speaker:'heroine_05',text:'下禮拜六，就不用開鏡頭了。',aa516:true},
      {choice:[{text:'「我會去接妳。」',set:{SIS14_RIGHT:true},goto:'h9a',aa516:true},{text:'「還是開一下。」',goto:'h9b',aa516:true}]},   /* AA_516 第 8 節第 2 點（企劃線 3cd10909b）：記 SIS14_RIGHT＝12/23 接機戀人版第一句旁白前面多一句「（你站在出口的右邊。）」（r2y4a_events.js ev_sis_pickup）*/
      {label:'h9a'},{speaker:'heroine_05',text:'嗯。……出口那邊，你站右邊。我出來先看右邊。',aa516:true},{end:true},
      {label:'h9b'},{speaker:'heroine_05',text:'……好。在車上開。你開車，我拍你。',aa516:true} ],
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.post(G,{th:'p:heroine_05',from:'heroine_05',text:'你在忙。下週。',tag:'y4_sa_gmiss_'+((q.sa&&q.sa.k)|0)}); } },
  /* ---------- 2-Y4-57 台灣、日本路線：學姊在美國，秋假大峽谷（告白；AA_253 10-2、10-3）。10/7 早上桃園起飛 → 10/13 日落 → 10/14 起飛、10/15 晚上回到臺北 ---------- */
  { id:'ev_sis_canyon', title:'秋假：大峽谷', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'亞利桑那',bg:'dark'},
      {speaker:null,text:'（她靠在租來的車旁邊，手上拿著一張列印的地圖。）'},
      {speaker:'heroine_05',text:'路線我排好了。你坐副駕，負責放音樂。'},
      {advance:toDay('2028-10-09',3)},{titleCard:'10/8（日）',sub:'亞利桑那'},{speaker:null,text:'（沙漠裡的加油站，她買了兩瓶很大的水。）'},
      {advance:toDay('2028-10-10',3)},{titleCard:'10/9（一）',sub:'亞利桑那'},{speaker:null,text:'（第一眼看到峽谷的時候，你們兩個都沒說話。）'},
      {advance:toDay('2028-10-11',3)},{titleCard:'10/10（二）',sub:'亞利桑那'},{speaker:null,text:'（她在步道上走得比你快。走到一半，她停下來等你。）'},   /* 裁定 #50：還沒交往，不牽手 */
      {advance:toDay('2028-10-12',12)},{titleCard:'10/11（三）',sub:'汽車旅館'},{scene:'汽車旅館',bg:'trip_hotel_twin'},{speaker:null,text:'（汽車旅館的電視只有三台。她轉到氣象台，看了很久。）'},
      {advance:toDay('2028-10-13',3)},{titleCard:'10/12（四）',sub:'亞利桑那'},{speaker:null,text:'（她的論文第四章帶來了，還在背包最下面。）'},
      {advance:toDay('2028-10-14',9)},{scene:'峽谷',bg:'dark'},   /* 亞利桑那 10/13 傍晚＝臺灣 10/14 早上 */
      {speaker:null,text:'（太陽慢慢沉到峽谷另一邊。風很大，她把外套拉鍊拉到最上面。）'},
      {choice:[{text:'「學姊，我喜歡妳。」',goto:'say'},{text:'（看著峽谷，不說話）',goto:'she'}]},
      {label:'say'},{if:SIS_KNOWS,call:async(G,GM)=>{ const r=R(); if(r) await r.canyonKnow(GM,true); }},{goto:'air',if:CANYON_KNEW},   /* AA_474 3b：她知道祐廷正在和別人交往＝告白那一刻接 KNOW.heroine_05（R2Y4B.canyonKnow）*/
      {speaker:'heroine_05',text:'……我以為我要先說。'},{speaker:'heroine_05',text:'好。'},{goto:'yes'},
      {label:'she'},{speaker:'heroine_05',text:'那我先說。'},
      {speaker:'heroine_05',text:'我喜歡你。……我想了很久，要不要在這裡說。'},
      {speaker:'heroine_05',text:'你要說好，還是要我再說一次。'},
      {if:SIS_KNOWS,call:async(G,GM)=>{ const r=R(); if(r) await r.canyonKnow(GM,false); }},{goto:'air',if:CANYON_KNEW},
      {label:'yes'},{set:{SIS_CANYON:'confess',CALLED_SHUYU:true}},
      {label:'air'},   /* 知情對話演過（SIS_CANYON 由 canyonKnow 記：答應＝confess，不交往＝knows）*/
      {advance:toDay('2028-10-15',3)},{scene:'鳳凰城的機場',bg:'us_airport'},   /* BB_220★：鳳凰城機場→us_airport（AA_370 合併以後接，BG-DARK-70-1021 最後一列）*/
      {speaker:'heroine_05',text:'十二月二十三號，晚上八點落地。你來接我。'},   /* 接 2-Y4-23 M7 戀人版 */
      {advance:toDay('2028-10-15',20)} ],
    after:G=>{ const r=R(); if(r) r.canyonAfter(G,'tw'); },
    outingMissed:G=>{ const r=R(); if(r) r.sisCanyonMissed(G); } },
  /* ---------- 2-Y4-58 律師讀書小組（AA_253 第 11 節、11-1）：2/23 成立（三種）、每週一三五晚上＋週六（麵店／視訊）、6/23 三個人的長桌 ---------- */
  { id:'ev_bar_group_start', title:'律師讀書小組', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {if:{flagIs:{BAR_GROUP_START:'kexin'}},goto:'kx'},{if:{flagIs:{BAR_GROUP_START:'yutong'}},goto:'yt'},
      {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（開學第一個週五晚上，麵店打烊以後。長桌上多了一張手寫的表，可昕寫的。）'},
      {speaker:'kexin',expression:'serious',text:'每週一、三、五晚上，週六整天。……有意見現在說。'},
      {speaker:'heroine_03',text:'週二我在店裡。你們在這裡讀，我順便考你們。'},
      {speaker:'kexin',expression:'smile',text:'……好。那表上多一格。'},{end:true},
      {label:'kx'},{scene:'視訊',bg:'video'},
      {if:{custom:G=>R().kxVday(G)},speaker:'kexin',expression:'teasing',text:'情人節那張表，我把八月以前都排完了。'},
      {unless:{custom:G=>R().kxVday(G)},speaker:'kexin',expression:'serious',text:'我排了一張表，到八月，一天三科。'},   /* 沒有 2/14 那張表（KX_VDAY[4] 不是 'video'）*/
      {speaker:'kexin',expression:'smile',text:'你那一欄不喜歡的地方圈起來，我改。'},{end:true},
      {label:'yt'},{scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:'heroine_03',text:'我今年不考。……可是你考的那幾科，我也要修。'},
      {speaker:'heroine_03',text:'所以你讀的時候，我也在旁邊讀我的。'} ] },   /* 成立那一晚不算讀書（BAR_GROUP_N＝讀的次數，從 2/26 第一次讀書算起；三個人的那一晚先輪到可昕）*/
  /* 讀書的那一晚（麵店）：一晚一句，輪流；只有語彤的第一次是那三句（AA_253 第 11 節）。只出題、不給答案、不寫條號 */
  { id:'ev_bar_group_night', title:'律師讀書小組', participants:[], location:['noodle','library','library_hall'], trigger:'auto', background:'blur',   /* 週六只有語彤的那幾天在總圖 */
    prereq:{custom:G=>{ const r=R(); return !!r&&r.groupNightDue(G); }},
    dialogue:[ {if:{custom:G=>R().groupLine(G)==='yt_first'},goto:'first'},
      {if:{custom:G=>R().groupLine(G)==='k1'},speaker:'kexin',expression:'serious',text:'刑總那題，你先講結論，再講理由。講完我再問。'},
      {if:{custom:G=>R().groupLine(G)==='k2'},speaker:'kexin',expression:'teasing',text:'這題你上禮拜錯過。……我記得。再一次。'},
      {if:{custom:G=>R().groupLine(G)==='k3'},speaker:'kexin',expression:'teasing',text:'你講得太快了。慢一點，講給一個不懂法律的人聽。……就是我那個室友。'},
      {if:{custom:G=>R().groupLine(G)==='k4'},speaker:'kexin',expression:'smile',text:'好，換你出題。出一題你自己也不確定的。'},   /* 裁定 #49 */
      {if:{custom:G=>R().groupLine(G)==='y1'},speaker:'heroine_03',text:'押租金那個，你講給我聽。不要講條號。'},
      {if:{custom:G=>R().groupLine(G)==='y2'},speaker:'heroine_03',text:'……這個詞我在社會系也學過，可是意思不一樣。你講你們的。'},
      {if:{custom:G=>R().groupLine(G)==='y3'},speaker:'heroine_03',text:'你剛剛那一段，跟上禮拜講的不一樣。哪一個對？'},
      {if:{custom:G=>R().groupLine(G)==='y4'},speaker:'heroine_03',text:'我出一題我自己不會的。你答完，我抄下來。'},
      ...narrRows('yutong','y'),
      ...threeRows(),
      {end:true},
      {label:'first'},
      {unless:{custom:G=>{ const r=R(), x=r&&r.session(G,G.day); return !!x&&x.mode==='library'; }},speaker:null,text:'（十點，麵店拉下一半的鐵門。語彤把兩碗麵推到長桌另一頭，她自己那一份不在桌上。）'},
      {if:{custom:G=>{ const r=R(), x=r&&r.session(G,G.day); return !!x&&x.mode==='library'; }},speaker:null,text:'（星期六下午，總圖的長桌。語彤把自己的書收進包包，桌上只剩你的。）'},   /* AA_350 N1 白天版 */
      {speaker:'heroine_03',text:'我今年不考。……可是我可以考你。'},
      {speaker:'heroine_03',text:'買賣不破租賃那一條。你講給我聽，講到我聽得懂。'} ],
    after:G=>{ const r=R(); if(r) r.groupNightDone(G,'noodle'); } },
  { id:'ev_bar_group_video', title:'律師讀書小組（視訊）', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:2, kxAway:true,
    dialogue:[ {if:{custom:G=>R().isSat(G)},scene:'政大・宿舍樓下',bg:'nccu_dorm'},{unless:{custom:G=>R().isSat(G)},scene:'視訊',bg:'video'},   /* 只有可昕：週六在政大（AA_253 第 11 節）*/
      {if:{custom:G=>R().groupLine(G,'kexin')==='k1'},speaker:'kexin',expression:'serious',text:'刑總那題，你先講結論，再講理由。講完我再問。'},
      {if:{custom:G=>R().groupLine(G,'kexin')==='k2'},speaker:'kexin',expression:'teasing',text:'這題你上禮拜錯過。……我記得。再一次。'},
      {if:{custom:G=>R().groupLine(G,'kexin')==='k3'},speaker:'kexin',expression:'teasing',text:'你講得太快了。慢一點，講給一個不懂法律的人聽。……就是我那個室友。'},
      {if:{custom:G=>R().groupLine(G,'kexin')==='k4'},speaker:'kexin',expression:'smile',text:'好，換你出題。出一題你自己也不確定的。'},
      ...narrRows('kexin','k','kexin') ],
    after:G=>{ const r=R(); if(r) r.groupNightDone(G,'video'); } },
  { id:'ev_bar_group_three', title:'三個人的長桌', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（長桌上攤著三疊考古題。語彤在收碗，可昕在算時間。）'},
      {speaker:'kexin',expression:'serious',text:'還有四十二天。'},
      {speaker:'heroine_03',text:'先吃，麵要糊了。'} ] },
  /* ---------- 2-Y4-61 沛珊大四下的學期末（2029-06-08（五）18:30 台南；AA_254 第 6 節、AA_282 第 5 節第 5 點）：飯與回家的路在 R2Y4B.psDinner ---------- */
  { id:'ev_ps_termend_y4s2', title:'學期末的飯：沛珊（台南）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ const r=R(); if(r) await r.psDinner(GM,q); } },
  /* ---------- AA_346「選一個人」之後，和其他人的分開談話（2029-05、2030-05；一位一場，每一場是一個出遊）：台詞、地點、知不知道、二選一在 R2Y4B.apartScene；
     沒到（延到隔天同一時間，最多兩次；第三次 22:00 私訊＋電話版）在 R2Y4B.apartMissed（src/r2y4b3d.js）。participants 空的：演完不接見面的閒聊階梯（OUT.go）---------- */
  ...['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'].map(id=>({ id:'ev_choice_apart_'+id, title:'分開的談話', participants:[], location:'any', trigger:'outing', background:'dark', hours:id==='classmate_peishan'?0.5:1, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ const r=R(); if(r) await r.apartOuting(GM,q); },
    outingMissed:(G,GM,q)=>{ const r=R(); if(r) r.apartMissed(G,q); } }))
  ];
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y4B_EVENTS);
