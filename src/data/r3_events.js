/* ===== 事件包第 3 輪：大二到畢業後篇的小事件（AA_328，AA-C 2026-10-20 定稿 5ae6a133；第②級，台詞照原文、不改字）=====
   這裡是用事件系統演的段落（3D 場景裡碰到的、出遊的 2D 場面）；手機、時間窗、鬧鐘、人物放到場景裡、包住別人的函式在 src/r3_3d.js。
   3-02 ev_kai_sunday_supper（events.js）裡 12/6 那一晚換成 F2：本檔最下面把 F2 那一段接進去（不改 events.js 那一行；對不到就不接，tests/r3_events_unit.js 會失敗）
   3-04 ev_fangyt_6am（3/13 06:00 椰林大道，方奕廷站著、阿凱坐在長椅上）　3-05 ev_zhiruo_latte_contest（5/7 Café 拉花比賽）＋ev_cafe_barista_zhiruo 投她的兩週內「這次有脖子了」
   3-08 ev_sk12_soclib_table（12/20～12/23 社科圖）、ev_sk12_lawlib_hint（同一週晚上先進法圖的旁白）　3-15 ev_ziqing_3am_call（選了直接打電話）
   3-11 ev_sis_plan_us（美國路線 10/18 會所）、ev_sis_plan_lab（研究室）、ev_sis_exam_note（2/3 考場門口）　3-13 ev_fangyt_chiayi（1/27 嘉義）
   3-14 ev_sis_y4_desks（每週三研究室）、ev_sis_y4_father（3/17 公館）、ev_sis_y4_dayoff_river／_tea（4/28）
   測試：node tests/r3_events_unit.js */
'use strict';
const R3_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  /* 絕對時間（熬夜過了午夜 G.day 還是前一天、G.hour 超過 24）：[k 那天 h0, k 那天 h1) */
  const at=(G,k,h0,h1)=>{ const d=D(k); if(d==null) return false; const t=G.day*24+G.hour; return t>=d*24+h0&&t<d*24+h1; };
  const toH=h=>G=>{ const hh=((G.hour%24)+24)%24; return h>hh?h-hh+1e-6:0; };   /* advance：跳到當天的某個時間（已經過了就不動）*/
  const R3x=()=>typeof R3!=='undefined'?R3:null;

  /* ---------- 3-04 方奕廷 F3 早上六點（BB_110 F3）：3/13（六）06:00 椰林大道。r3_3d.js 在 05:50～06:30 把方奕廷（站著）、阿凱（坐在長椅上）放好，走過去（npcNear）才演 ---------- */
  const FANG_6AM={ id:'ev_fangyt_6am', title:'早上六點', participants:['npc_fangyt','kai'], location:'campus', trigger:'auto', once:true, npcNear:'npc_fangyt', background:'blur',
    prereq:{custom:G=>G.flags.FANG_6AM_GO===true&&!G.flags.FANG_6AM&&at(G,'2027-03-13',5+50/60,6.5)},
    dialogue:[ {speaker:'npc_fangyt',text:'這是大王椰子。'},
      {speaker:'kai',text:'我知道。椰子。'},
      {speaker:'npc_fangyt',text:'它不會長椰子。'},
      {speaker:'kai',text:'……那它為什麼叫椰子？'},
      {speaker:'npc_fangyt',text:'因為人取名字的時候，沒有問它。'},
      {speaker:'npc_fangyt',text:'（指著地上）這片葉子掉下來很大聲。不要站在下面。'},
      {speaker:'player',text:'會砸到人嗎？'},
      {speaker:'npc_fangyt',text:'會。你們法律系應該知道要找誰。'},
      {speaker:null,text:'（阿凱坐在長椅上，睡著了。）'},
      {choice:[{text:'「要找誰？」',goto:'a'},{text:'（拍一張阿凱睡著的照片）',set:{FANG_6AM_PHOTO:true},goto:'end'},{text:'「下次換我帶你看法學院的樹。」',goto:'c'}]},
      {label:'a'},{speaker:'npc_fangyt',text:'我不知道。我只知道要站旁邊。'},{goto:'end'},
      {label:'c'},{speaker:'npc_fangyt',text:'法學院有樹？'},{speaker:'player',text:'有一棵。'},{speaker:'npc_fangyt',text:'好。'},{mem:[{npc:'npc_fangyt',tag:'FANG_LAWTREE',note:''}]},
      {label:'end'},{advance:toH(7)},{speaker:null,text:'（七點，太陽照到大道上。阿凱醒來，問你們講到哪裡了。）'},
      {set:{FANG_6AM:'went'}} ] };

  /* ---------- 3-05 芷若 F4 拉花比賽（BB_110 F4）：2027-05-07（五）19:00～22:00 兩點半 Café，她在班；走到櫃台前（npcNear）才開始，只一次。去過 Café 就有（常客都會被拉去投票）---------- */
  const LATTE={ id:'ev_zhiruo_latte_contest', title:'拉花比賽', participants:['heroine_02'], location:'cafe', trigger:'auto', once:true, npcNear:'heroine_02', background:'blur',
    prereq:{custom:G=>at(G,'2027-05-07',19,22)},
    dialogue:[ {speaker:'老闆',text:'今天的拉花比賽，客人投票。一包糖一票。'},
      {speaker:'heroine_02',text:'（端出一杯）這是天鵝。'},
      {speaker:'player',text:'……它的脖子在哪裡？'},
      {speaker:'heroine_02',text:'它在低頭。它在想事情。'},
      {speaker:null,text:'（老闆端出一杯脖子很長的天鵝。）'},
      {speaker:'heroine_02',text:'老闆，你這樣不公平。你練了十五年。'},
      {speaker:'老闆',text:'所以妳要練十五年。'},
      {choice:[{text:'「投芷若。」',set:{ZR_SWAN_VOTE:'her'},mem:[{npc:'heroine_02',tag:'ZR_SWAN',note:''}],goto:'h'},{text:'「投老闆。」',set:{ZR_SWAN_VOTE:'boss'},goto:'b'},{text:'（把糖倒進咖啡，不投）',set:{ZR_SWAN_VOTE:'sugar'},goto:'s'}]},
      {label:'h'},{speaker:'heroine_02',text:'同情票不算。……算了，算。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'你很誠實。'},{speaker:null,text:'（她笑了。）'},{speaker:'heroine_02',text:'……下次我會贏。'},{goto:'end'},
      {label:'s'},{speaker:'heroine_02',text:'你把選票喝掉了。這在選舉裡叫什麼？'},{speaker:'player',text:'……廢票？'},{speaker:'heroine_02',text:'叫好喝。'},
      {label:'end'} ] };

  /* ---------- 3-08 SK12 辜振甫圖書館的那張桌子（BB_106 SK12；台詞新寫的是 AA 補的）：大三上第 16 週（期末考週）12/20～12/23 19:00～21:00 第一次走進社科圖，
     品妤坐在最裡面那張長桌的桌角（r3_3d.js 放好），走過去（npcNear）演。法律系時期沒見過她（MET_PINYU 沒有）先照 events.js:851 自我介紹 ---------- */
  const sk12Win=(G,h0,h1)=>['2027-12-20','2027-12-21','2027-12-22','2027-12-23'].some(k=>at(G,k,h0,h1));
  const SK12={ id:'ev_sk12_soclib_table', title:'那張桌子', participants:['econ_pinyu'], location:'soclib', trigger:'auto', once:true, npcNear:'econ_pinyu', background:'blur',
    prereq:{custom:G=>!G.flags.SK12&&sk12Win(G,19,21)},
    dialogue:[ {speaker:null,text:'（期末考週。社科圖的長桌坐滿了。最裡面那張，品妤坐在桌角，攤著一本很厚的書，封面寫著「機率」。）'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},
      {if:{flags:['ECON_NIGHT']},speaker:'品妤',text:'上次經濟系之夜，你收椅子收得很好。今天換我收你的書。'},
      {speaker:'品妤',text:'（沒抬頭）坐。這張桌子，我們一年級常坐。'},
      {speaker:'品妤',text:'精算要一科一科考。可能要好幾年。'},
      {speaker:'品妤',text:'我媽說，畢業先去銀行。比較穩。'},
      {speaker:null,text:'（她翻了一頁，又翻回來。）'},
      {speaker:'品妤',text:'考不過我不怕。'},
      {speaker:'品妤',text:'我怕考了三年，才發現自己不喜歡。'},
      {choice:[{text:'「我陪妳讀到閉館。」',set:{PINYU_WORRY:'stay'},goto:'s'},{text:'「先考一科看看，不喜歡再說。」',set:{PINYU_WORRY:'one'},goto:'o'},{text:'「先去問考過的學長姊？」',set:{PINYU_WORRY:'ask'},goto:'a'},{text:'「妳可以兩個都試，只是不要同時。」',set:{PINYU_WORRY:'both'},goto:'b'}]},
      {label:'s'},{advance:toH(22)},{speaker:null,text:'（你們讀到十點。閉館的音樂響起來的時候，她出了一題機率題考你。你算錯了。）'},{speaker:'品妤',text:'很好。你還是法律系的。'},{goto:'end'},   /* 快轉到 22:00：社科圖閉館（story3d.js 的閉館照常請你離館）*/
      {label:'o'},{speaker:'品妤',text:'……一科。好。一科我算得出來。'},{goto:'tail'},
      {label:'a'},{speaker:'品妤',text:'……系上有一個。我明天去問。'},{goto:'tail'},
      {label:'b'},{speaker:'品妤',text:'你們法律系也懂排程？'},
      {label:'tail'},{speaker:null,text:'（你回到自己的位子。九點半，她先收書走了。）'},
      {label:'end'},{mem:[{npc:'econ_pinyu',tag:'PINYU_WORRY',note:''}]},{set:{SK12:true}} ] };   /* 記憶 PINYU_WORRY 的值記在旗標 PINYU_WORRY（stay／one／ask／both）*/
  /* 提示（BB_106「法律學院圖書館滿了的那幾晚會有一句旁白提示」）：同一週 18:00 以後第一次走進法圖，多一句旁白（SK12 還沒演才有）*/
  const SK12_HINT={ id:'ev_sk12_lawlib_hint', title:'期末考週的法圖', participants:[], location:'lawlib', trigger:'enter', once:true, background:'freeze',
    prereq:{custom:G=>!G.flags.SK12&&sk12Win(G,18,24)},
    dialogue:[ {speaker:null,text:'（法律學院圖書館的位子全滿了。窗外，對面社科院的燈還亮著。）'} ] };

  /* ---------- 3-15 子晴：凌晨三點的 build（BB_165 4-2）：醒著的玩家選「（直接打電話給她）」＝這一段電話（r3_3d.js 在手機回完以後演）---------- */
  const ZQ_CALL={ id:'ev_ziqing_3am_call', title:'凌晨三點的電話', participants:['heroine_04'], location:'any', trigger:'manual', once:true, background:'blur',   /* 人在自己的房間講電話：背景照現場（不換成路邊）*/
    dialogue:[
      {speaker:'heroine_04',text:'……你打來幹嘛。'},
      {speaker:'heroine_04',text:'……好啦。我在。'},
      {advance:0.5},{speaker:null,text:'（她講了半小時第二關的事。後來鍵盤聲停了，電話那頭只剩呼吸聲。）'},
      {speaker:null,text:'（你沒有掛。）'} ] };

  /* ---------- 學姊的台詞：交往中照程式的稱呼規則顯示「書瑀」（SOCIAL.datingName；AA_313 6-5 第 8 點）——對話框的名字用 getter，演的當下才算 ---------- */
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const SIS=(text,o)=>{ const l={speaker:'heroine_05',text,get name(){ return typeof SOCIAL!=='undefined'&&SOCIAL.datingName?(SOCIAL.datingName('heroine_05')||undefined):undefined; }}; if(o) for(const k in o) l[k]=o[k]; return l; };
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const abroadRoute=G=>{ const r=route(G); return r==='JP'||r==='US'; };

  /* ---------- 3-11 學姊：大四選擇那一週的讀書計畫（BB_99 2-4、10-1 第 4 項）：B 美國路線會所版、C 研究室版、D 研究所筆試的便條（當面）。訊息、出遊在 r3_3d.js ---------- */
  const PLAN_LINES=[ SIS('你週六排了十二個小時。'), SIS('改成八個。剩下四個拿去睡覺。') ];
  const SIS_PLAN_US={ id:'ev_sis_plan_us', title:'讀書計畫', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'會所・自習室',bg:'dark'},   /* 會所裡面不做 3D、2D 沒有（us3d.js:225）*/
      {speaker:null,text:'（會所的自習室。她把你的讀書計畫從頭看到尾。）'}, ...PLAN_LINES,
      {choice:[{text:'「好。」',goto:'a'},{text:'「妳自己呢？」',goto:'b'}]},
      {label:'a'},SIS('好。我會檢查。'),{goto:'end'},
      {label:'b'},SIS('……我也改。我們一起改。'),
      {label:'end'},{set:{SIS_PLAN_SEEN:'us'}} ],
    outingMissed:G=>{ if(typeof R3!=='undefined') R3.sisPlanMissed(G,'us'); } };
  const SIS_PLAN_LAB={ id:'ev_sis_plan_lab', title:'讀書計畫', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'研究室',bg:'linze_prof_hall'},   /* 研究室裡面沒有：研究室的走廊＋字幕 */
      ...PLAN_LINES,
      {choice:[{text:'「好。」',goto:'a'},{text:'「學姊自己呢？」',unless:{custom:G=>dating(G,'heroine_05')},goto:'b'},{text:'「妳自己呢？」',if:{custom:G=>dating(G,'heroine_05')},goto:'b'}]},   /* 交往當天起叫她書瑀，不叫學姊（裁定 12）*/
      {label:'a'},SIS('好。我會檢查。'),{goto:'end'},
      {label:'b'},SIS('……我也改。我們一起改。'),
      {label:'end'},{set:{SIS_PLAN_SEEN:'lab'}} ],
    outingMissed:G=>{ if(typeof R3!=='undefined') R3.sisPlanMissed(G,'lab'); } };
  /* D：2029-02-03（六）08:30 考場門口（交往中，或雙方都單身）；接著 08:40 是 AA_327 2-Y4-27 以安在門口那一段（r3_3d.js 照時間演，背景照國考便條的做法）*/
  const SIS_NOTE={ id:'ev_sis_exam_note', title:'研究所筆試', participants:['heroine_05'], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'考場',bg:'ntu_avenue'},
      {speaker:null,text:'（教學館門口。她把一張摺好的便條放進你手裡。）'},
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.sent(G,'y4_push_note')},goto:'same'},   /* AA_378 S3：收過 10/25 推甄前那一張的，這一張只寫「同上。」*/
      {speaker:null,text:'（便條：「你可以。」）'},
      {speaker:'player',text:'只有一句。'},SIS('一句就夠了。'),{goto:'yes'},   /* AA_398 第 37 列（「同上。」那一支照舊「對。」）*/
      {label:'same'},{speaker:null,text:'（便條只有兩個字：「同上。」）'},{speaker:'player',text:'……同上。'},SIS('對。'),
      {label:'yes'},
      SIS('我在對面的便利商店等。考完先傳訊息。',{if:{custom:G=>dating(G,'heroine_05')}}),   /* 戀人版（BB_99 2-4）*/
      {set:{SIS_NOTE_GRAD:'door'}} ] };

  /* ---------- 3-13 方奕廷 F4 兩千歲的紅檜（BB_99 5-2）：2029-01-27（六）07:00 從臺北的家開車南下，中午到嘉義的山上，當天回臺北（約 15 小時）---------- */
  const CHIAYI={ id:'ev_fangyt_chiayi', title:'兩千歲的紅檜', participants:['npc_fangyt'], location:'any', trigger:'outing', once:true, background:'dark', hours:1/60,
    dialogue:[ {scene:'臺北的家',bg:'home_living_day'},
      {speaker:'媽媽',text:'你交了什麼朋友，會約人開半個台灣去看樹。'},   /* 說話的人改媽媽（裁定 15）*/
      {titleCard:'開車南下',sub:'約五個小時',advance:G=>{ const hh=((G.hour%24)+24)%24; return hh<12?12-hh:0; }},   /* 中午到 */
      {scene:'嘉義・山上的工作站',bg:'trip_mountain'},
      {speaker:null,text:'（山上的工作站。霧剛散，雲海在腳下。）'},
      {speaker:'npc_fangyt',text:'到了。……你開了五個小時。'},
      {speaker:'npc_fangyt',text:'走吧。二十分鐘，路很好走。'},
      {scene:'檜木林步道',bg:'cypress_trail',advance:1/3},
      {speaker:null,text:'（紅檜。很粗，三個人圍不起來。）'},
      {speaker:'npc_fangyt',text:'兩千歲。……我每天上班都經過它。'},   /* 裁定 16 */
      {choice:[{text:'「它看過很多人吧。」',goto:'a'},{text:'「你在這裡習慣嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'npc_fangyt',text:'嗯。看過很多人來，也看過很多人走。……我還沒走。'},{goto:'down'},
      {label:'b'},{speaker:'npc_fangyt',text:'習慣。這裡講話的人少。我剛好。'},
      {label:'down'},{speaker:'npc_fangyt',text:'下次天氣好，再來。……不用約。你來，我就在。'},
      {advance:toH(22)},{speaker:null,text:'（回到臺北，已經晚上十點。）'},
      {set:{FANG_F4:'went',CHIAYI_TREE:true},mem:[{npc:'npc_fangyt',tag:'CHIAYI_TREE',note:''}]} ],   /* 旗標 CHIAYI_TREE：postgrad3d.js 尾聲方奕廷讀它 */
    outingMissed:G=>{ if(typeof R3!=='undefined') R3.chiayiMissed(G); } };

  /* ---------- 3-14 學姊：交往中的大四（BB_99 2-7a～c；她 12/23 才回來，三件都在大四下）---------- */
  /* 2-7a 兩張書桌：每週三 21:00 研究室（一律研究室，裁定 17）；第一次全演、之後旁白三句輪流（時間快轉到 23:30）。3/14 那晚人在研究室＝21:10 她當面說爸爸的晚餐（裁定 18）*/
  const deskN=G=>G.flags.SIS_DESK_NIGHTS|0;
  const farY4S1=G=>{ const F=G.flags||{}, d=D('2028-12-23'); let s=F.SIS_DATING_D; if(s==null&&typeof ROM!=='undefined'&&ROM.get) s=ROM.get(G,'heroine_05').sinceDay; return route(G)!=='US'&&s!=null&&d!=null&&s<d; };   /* 上學期是遠距離交往（台灣、日本路線，12/23 以前就和她交往）*/
  const FATHER_HERE={custom:G=>G.day===D('2029-03-14')&&G.flags.SIS_FATHER_ASKED==null};
  const DESKS={ id:'ev_sis_y4_desks', title:'兩張書桌', participants:['heroine_05'], location:'any', trigger:'outing', background:'dark', hours:1/60,
    dialogue:[ {scene:'研究室',bg:'linze_prof_hall'},
      {if:FATHER_HERE,advance:toH(21+10/60)},
      SIS('我爸週六會過來，他要請吃飯。',{if:FATHER_HERE}),
      SIS('……你要不要來。六點半，公館。',{if:FATHER_HERE}),
      {if:FATHER_HERE,choice:[{text:'「好。」',set:{SIS_FATHER_GO:true,SIS_FATHER_ASKED:'face'},goto:'fy'},{text:'「那天不行。」',set:{SIS_FATHER_GO:false,SIS_FATHER_ASKED:'face'},goto:'fn'}]},
      {goto:'desk'},
      {label:'fy'},SIS('好。不用穿太正式。'),{goto:'desk'},
      {label:'fn'},SIS('好。我跟他說。'),
      {label:'desk'},
      {if:{custom:G=>deskN(G)>0},goto:'again'},
      {advance:toH(23.5)},
      {speaker:null,text:'（晚上十一點半。她還在打字，螢幕上是「第四章　第二節」。）'},
      SIS('上學期都是視訊。……這樣比較好。',{if:{custom:G=>farY4S1(G)}}),
      {choice:[{text:'「十一點半了。」',goto:'d1'},{text:'（把一杯熱水放到她手邊）',goto:'d2'},{text:'（繼續寫自己的）',goto:'d3'}]},
      {label:'d1'},SIS('我知道。再一段。'),{speaker:null,text:'（五分鐘後她自己關掉螢幕。）'},SIS('……好。今天到這裡。'),{goto:'end'},
      {label:'d2'},{speaker:null,text:'（她喝了一口，沒有停下來打字。）'},SIS('……謝謝。'),{goto:'end'},
      {label:'d3'},{advance:toH(24)},{speaker:null,text:'（十二點，她先收。）'},SIS('你今天比我晚。燈你關。'),{goto:'end'},
      {label:'again'},
      {if:{custom:G=>deskN(G)%3===1},speaker:null,text:'（十一點。她的螢幕上還是第四章。你的筆記寫到第三頁。）'},
      {if:{custom:G=>deskN(G)%3===2},speaker:null,text:'（她起來倒水，順便把你的杯子也加滿，沒說話。）'},
      {if:{custom:G=>deskN(G)%3===0},speaker:null,text:'（十一點半，她伸了一個懶腰。「今天到這裡。」）'},
      {advance:toH(23.5)},
      {label:'end'},{inc:{SIS_DESK_NIGHTS:1}} ],
    outingMissed:(G,GM,q)=>{ if(typeof R3!=='undefined') R3.deskMissed(G,q); } };   /* 第一次沒去的那一週：23:10 照片 */
  /* 2-7b 她爸爸的晚餐：3/17（六）18:30 公館的餐廳（出遊）。照實說大四選擇（Y4_PATH；兩次都「還沒決定」的沒有這個選項）*/
  const pathKey=G=>{ const F=G.flags||{}, p=F.Y4_PATH, ab=abroadRoute(G); if(p==='bar') return ab?'bar_next':'bar'; if(p==='grad'){ if(ab) return 'grad_next'; return (F.Y4_PUSH==='pass'||F.GRAD_ADMIT==='push')?'grad_push':'grad_exam'; } if(p==='other') return 'other'; return null; };
  const PK=k=>({custom:G=>pathKey(G)===k});
  const FATHER={ id:'ev_sis_y4_father', title:'她爸爸的晚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館・餐廳',bg:'gongguan_hotpot'},
      {speaker:'她爸爸',text:'你念法律，以後要做什麼？'},
      {choice:[{text:'「我在準備國考。」',if:PK('bar'),goto:'p'},{text:'「我明年考國考。」',if:PK('bar_next'),goto:'p'},{text:'「我推甄上了研究所。」',if:PK('grad_push'),goto:'p'},{text:'「我考了研究所，月底放榜。」',if:PK('grad_exam'),goto:'p'},{text:'「我明年考研究所。」',if:PK('grad_next'),goto:'p'},{text:'「我想先去實習。」',if:PK('other'),goto:'p'},
        {text:'「我還在想。」',goto:'t'},{text:'「我想做對別人有用的事。」',goto:'u'}]},
      {label:'p'},{speaker:'她爸爸',text:'……想清楚了就好。'},{goto:'out'},
      {label:'t'},SIS('爸，他還在想。……先吃飯。'),{goto:'out'},
      {label:'u'},{speaker:null,text:'（她爸爸看了她一眼。）'},{speaker:'她爸爸',text:'……妳以前也這樣說過。現在還這樣想嗎？'},SIS('嗯。'),
      {label:'out'},{speaker:'她爸爸',text:'下次再來。'},
      {speaker:null,text:'（她送爸爸上計程車。回來的路上她沒有說話，過了一個路口才說：）'},
      SIS('他很少請人吃飯。'),
      {set:{MET_SIS_FATHER:true},mem:[{npc:'heroine_05',tag:'MET_SIS_FATHER',note:''}]} ],
    outingMissed:(G,GM,q)=>{ if(typeof R3!=='undefined') R3.fatherMissed(G,q); } };   /* 19:30 還沒到：「我們吃完了。我爸說下次。」*/   /* 旗標 MET_SIS_FATHER：postgrad3d.js 畢業典禮那天她轉交「恭喜。」*/
  /* 2-7c 她自己放的一天假：4/28（六）河堤 10:00／貓空 13:00（出遊）；「哪裡都不去」只有訊息 */
  const DAYOFF_END=[ {speaker:null,text:'（回去的路上，她在計畫本 4/28 那一格畫了一條線，什麼都沒寫。）'}, SIS('今天就這樣。'),
    {set:{SIS_DAY_OFF:true},mem:[{npc:'heroine_05',tag:'SIS_DAY_OFF',note:''}]} ];
  const DAYOFF_RIVER={ id:'ev_sis_y4_dayoff_river', title:'她自己放的一天假', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（四月的河堤，風很大。她真的騎很慢。你騎到前面，停下來等。）'},
      SIS('……你真的在等。'),
      ...DAYOFF_END ],
    outingMissed:G=>{ if(typeof R3!=='undefined') R3.dayOffMissed(G,'river'); } };
  const DAYOFF_TEA={ id:'ev_sis_y4_dayoff_tea', title:'她自己放的一天假', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'貓空',bg:'trip_mountain'},
      {speaker:null,text:'（到了山上，她第一個先說了論文。）'},
      {choice:[{text:'「纜車上不談論文。」',goto:'a'},{text:'（聽她說完）',goto:'b'}]},
      {label:'a'},SIS('……我們已經下纜車了。'),{goto:'end'},
      {label:'b'},{speaker:null,text:'（她講完第四章的第二節，茶已經涼了。）'},SIS('……好。現在開始不談。'),
      {label:'end'},...DAYOFF_END ],
    outingMissed:G=>{ if(typeof R3!=='undefined') R3.dayOffMissed(G,'tea'); } };

  /* 3-12 何俊朗 1～5 的 R3 版（ev_long_orientation、ev_long_class、ev_long_dinner、ev_long_bbq、ev_long_note、ev_long_party、ev_long_menu）：AA_370 M3 停用、第 6 節第 9 題刪掉（演不到的舊稿留著會被誤認成現行內容）；美國路線只跑 us_life3d.js 的 USL 版，舊存檔演過的紀錄（G.events.done）照舊在 USL.longMerge 互相認 */
  return [FANG_6AM,LATTE,SK12,SK12_HINT,ZQ_CALL,SIS_PLAN_US,SIS_PLAN_LAB,SIS_NOTE,CHIAYI,DESKS,FATHER,DAYOFF_RIVER,DAYOFF_TEA];
})();
Array.prototype.push.apply(STORY_EVENTS,R3_EVENTS);

/* ===== 接進現有事件的段落（AA_328 第 6 節「給 LAWWW」：取代那一晚的輪流句、點餐多一句）。對不到原本的那一行就不接（測試會抓到）===== */
(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const ev=id=>STORY_EVENTS.find(e=>e.id===id);
  /* ---- 3-02 阿凱 F2 聊天機器人（BB_110 F2）：2026-12-06（日）第 13 週的週日宵夜，那一晚演這一場、取代輪流句；第一次去宵夜的＝先演 K3 第一次那一段，再接「（吃到一半，阿凱打開筆電。）」 ---- */
  const F2N={custom:G=>G.day===D('2026-12-06')&&!G.flags.KAI_F2};
  const BOT={custom:G=>typeof R3!=='undefined'&&R3.kaiBotReplied(G)};   /* 主線 4 的 kai_bot 那一則回過 */
  const F2=[ {label:'r3_f2'},
    {if:BOT,speaker:'kai',text:'你上次說它不能給法律結論。'},
    {if:BOT,speaker:'kai',text:'所以我改了。現在它不回答問題，只會吵架。'},
    {unless:BOT,speaker:'kai',text:'我的作業。一個會吵架的聊天機器人。'},
    {speaker:'kai',text:'我用法律系的口氣訓練它。資料是你。'},
    {speaker:'player',text:'我？'},
    {speaker:'kai',text:'你大一傳給我的訊息。全部。'},
    {speaker:null,text:'（手機螢幕）使用者：今天宵夜吃什麼？'},
    {speaker:null,text:'（手機螢幕）機器人：看情況。'},
    {speaker:null,text:'（手機螢幕）使用者：鹹酥雞可以嗎？'},
    {speaker:null,text:'（手機螢幕）機器人：原則上可以。但有例外。'},
    {speaker:'kai',text:'它已經學會了。'},
    {if:{memory:[{npc:'kai',tag:'SAID_DEPENDS'}]},speaker:'kai',text:'「看情況」是你大一颱風天說的。它記得。'},
    {choice:[{text:'「問它：你喜歡法律嗎？」',goto:'r3_f2a'},{text:'「把我刪掉。」',goto:'r3_f2b'},{text:'「教它說：先吃飯。」',goto:'r3_f2c'}]},
    {label:'r3_f2a'},{speaker:'機器人',text:'這個問題，學說上有爭議。'},{speaker:'kai',text:'你看，連它都不確定。'},{goto:'r3_f2e'},
    {label:'r3_f2b'},{speaker:'kai',text:'不行。你是唯一的資料。'},{goto:'r3_f2e'},
    {label:'r3_f2c'},{speaker:'機器人',text:'先吃飯。其他的，看情況。'},{speaker:'kai',text:'……它比你還像人。'},{mem:[{npc:'kai',tag:'KAI_BOT',note:''}]},
    {label:'r3_f2e'},{set:{KAI_F2:'went'}} ];
  const sup=ev('ev_kai_sunday_supper');
  if(sup&&!sup._r3f2){ const L=sup.dialogue, iN=L.findIndex(l=>l.text==='（週日晚上，滷味攤。阿凱的籃子永遠比你的滿。）'), iE=L.findIndex(l=>l.label==='end');
    if(iN>=0&&iE>iN){ L.splice(iE,0,{if:F2N,speaker:null,text:'（吃到一半，阿凱打開筆電。）'},{unless:F2N,goto:'end'},...F2); L.splice(iN+1,0,{if:F2N,goto:'r3_f2'}); sup._r3f2=true; } }   /* 第二次以後：旁白之後直接跳 F2（不演輪流句）；第一次：K3 第一次那一段演完接旁白、F2；收尾照 K3（快轉到 00:00）*/
  /* ---- 3-05 投她的（ZR_SWAN）：5/8～5/21 第一次在 Café 跟她點餐（ev_cafe_barista_zhiruo）＝最後那句「杯子放著就好，慢慢來。」前面多兩句 ---- */
  const SWAN={custom:G=>{ const a=D('2027-05-08'), b=D('2027-05-21'); return a!=null&&G.day>=a&&G.day<=b&&!G.flags.ZR_SWAN_SEEN&&has('heroine_02','ZR_SWAN'); }};
  const bar=ev('ev_cafe_barista_zhiruo');
  if(bar&&!bar._r3swan){ const L=bar.dialogue, i=L.findIndex(l=>l.text==='杯子放著就好，慢慢來。');
    if(i>=0){ L.splice(i,0,{if:SWAN,speaker:null,text:'（拿鐵上面是一隻天鵝。這次有脖子。）'},{if:SWAN,speaker:'heroine_02',text:'這次有脖子了。'},{if:SWAN,set:{ZR_SWAN_SEEN:true}}); bar._r3swan=true; } }
})();
