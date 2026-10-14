/* ===== STORY EVENT DATA PACK v1（schema 見 STORY_EVENT_SCHEMA.md）
   trigger: 'auto'（條件成立且玩家在 near 範圍）/ 'interact'（與 participants[0] 對話時）/ 'enter'（進入區域時）
   對話行：{speaker, text, expression, position} / {choice:[{text,hint,consequences,goto,next,set,mem,rel,choiceKey,value}]} / {legal:{context,by,pick|qid,chorus}} / {label} / {goto} / {if} / {set,mem,rel,note,advance}
   所有人物與故事皆為虛構。 ===== */
'use strict';
/* 群戲「只有認識的人在場」（交接包 v1 交付清單第 0 節第 1 點）：if:EV_KNOWS('id')／if:EV_KNOWS('a','b')＝都認識了（STORY.knows：FIRST_MET；小語 met_yu；阿哲開場就熟）*/
const EV_KNOWS=(...ids)=>({custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G))});
/* 聖誕交換禮物（A20）：可能在場的七個人（AA_71 2-6）；在場＝玩家認識的；祐廷抽到誰的：明軒和小語都在時小語的玩偶已經是明軒的，盡量不和抽到祐廷禮物的是同一個人 */
const XMAS_WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];
const XMAS_HERE=G=>typeof STORY==='undefined'||!STORY.knows?[]:XMAS_WHO.filter(id=>STORY.knows(id,G));
/* 明軒抽到小語的玩偶（AA 的「和祐廷無關的一句」）＝明軒和小語都在、抽到祐廷禮物的不是明軒（是明軒的話，他抽到的是祐廷的，小語的玩偶祐廷也抽得到）*/
const XMAS_MX_YU=G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('yu')&&G.flags.XMAS_TO!=='classmate_mingxuan'; };
const XMAS_FROM_POOL=G=>{ const h=XMAS_HERE(G); const p=h.filter(id=>!(id==='yu'&&XMAS_MX_YU(G))); const q=p.filter(id=>id!==G.flags.XMAS_TO); return q.length?q:p; };
/* 可昕自己讀書時傳的書桌照片（BB_95 9-5：婉拒、沒回、沒接）*/
const KX_DESK_PHOTO=[{th:'p:kexin',from:'kexin',text:'📷（她的書桌）'},{th:'p:kexin',from:'kexin',text:'我自己讀了。你欠我一次。'}];
const STORY_EVENTS=[
  // ────────────────────────────────────────── 語彤：雨天圖書館門口（Vertical Slice）
  { id:'ev_rain_library_door', title:'雨天的總圖門口', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:7}, trigger:'auto', time:[18,23], weather:'rain', day_min:3, once:true, prereq:{notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]},   /* AA_120 7-5 第 1 項：不下雨的版本（ev_library_door_phone）認識以後，下雨天不再演一次初遇；對話一個字都不動 */
    spawn:{npc:'heroine_03',at:{x:80.5,z:2.6},pose:'idle'}, background:'blur', cg_id:'cg_library_rain_heroine03',
    dialogue:[
      {speaker:null,text:'總圖門口的屋簷下站著一個人。雨很大，她看著雨，沒有要走的意思。'},
      {speaker:'heroine_03',expression:'neutral',text:'……'},
      {speaker:'heroine_03',expression:'neutral',text:'……我沒帶傘。'},
      {speaker:null,text:'你在圖書館看過她幾次。社會系的樣子，總是坐在靠窗那排，很安靜。'},
      {choice:[
        {text:'「一起走吧。」',hint:'你有傘',consequences:{mem:[{npc:'heroine_03',tag:'SHARED_UMBRELLA',note:'雨天總圖門口'},{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:8,comf:6,trust:4}},flags:{rain_umbrella:'share'}},goto:'share'},
        {text:'「我的給你，我等等搭車。」',consequences:{mem:[{npc:'heroine_03',tag:'HELPED',note:'把傘給她'},{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:6,trust:7,resp:4}},flags:{rain_umbrella:'give'},energy:-6},goto:'give'},
        {text:'「便利商店應該有賣。」',consequences:{mem:[{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:3}},flags:{rain_umbrella:'cvs'}},goto:'cvs'},
        {text:'「我也沒帶。」',consequences:{mem:[{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:4,comf:3}},flags:{rain_umbrella:'none'}},goto:'none'} ]},
      {label:'share'},
      {speaker:'heroine_03',expression:'surprised',text:'……可以嗎？'},
      {speaker:'player',text:'反正我也要往校門走。'},
      {speaker:'heroine_03',expression:'smile',text:'嗯。'},
      {speaker:null,text:'一把傘兩個人，走到椰林大道的時候你的左肩已經濕了。她一路沒說話，到校門口才開口。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。社會系。……你是法律系的吧，我看過你在三樓。'},
      {speaker:'heroine_03',expression:'smile',text:'謝謝。改天還你一把傘。'},
      {goto:'end'},
      {label:'give'},
      {speaker:'heroine_03',expression:'surprised',text:'那你怎麼辦？'},
      {speaker:'player',text:'公車站就在對面。'},
      {speaker:'heroine_03',expression:'thinking',text:'……你會濕掉。'},
      {speaker:null,text:'她接過傘，看了你三秒，像在決定要不要記住你的臉。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。傘我會還。你哪一系？'},
      {goto:'end'},
      {label:'cvs'},
      {speaker:'heroine_03',expression:'neutral',text:'……嗯。我知道。'},
      {speaker:null,text:'她沒有動。你忽然意識到她不是不知道便利商店在哪。'},
      {speaker:'heroine_03',expression:'tired',text:'今天不想再花錢了。'},
      {speaker:null,text:'你們在屋簷下站了一會。雨小了一點，她說了聲謝謝就走進雨裡。'},
      {goto:'end'},
      {label:'none'},
      {speaker:'heroine_03',expression:'smile',text:'……那我們兩個都很慘。'},
      {speaker:null,text:'她笑了一下，很短。你們並肩看了十分鐘的雨，聊了圖書館三樓哪一排的燈最亮。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。社會系的。你呢？'},
      {label:'end'},
      {speaker:null,text:'（她會記得今天。）'} ],
    consequences:{memo:'雨天在總圖門口遇到陳語彤',goal:'自由行動'}, despawn:20, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='route'; n.waypoints=[[70,-2.5],[40,-2.5],[30,-6]]; n.pauseAt=false; n.talk=null; } } },
  // 沒下雨的另一種初遇
  { id:'ev_library_door_phone', title:'總圖門口', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:6}, trigger:'auto', time:[17,22], not_weather:'rain', day_min:3, once:true, random_weight:20, prereq:{notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, spawn:{npc:'heroine_03',at:{x:79.5,z:3.2},pose:'idle'}, background:'blur',
    dialogue:[ {speaker:null,text:'總圖門口有個女生一直在看手機，看一眼、收起來、再看一眼。'},{speaker:'heroine_03',expression:'neutral',text:'……不好意思，現在幾點？'},{speaker:'player',text:'{name}看了一下手機，告訴她時間。'},{speaker:'heroine_03',expression:'tired',text:'她又遲到了。高中同學，每次都這樣。'},{choice:[{text:'「要不要先進去等？裡面有冷氣。」',consequences:{rel:{heroine_03:{fam:4,comf:3}}}},{text:'「你是社會系的？我好像在三樓看過你。」',consequences:{rel:{heroine_03:{fam:5}},mem:[{npc:'heroine_03',tag:'PLAYER_ASKED_QUESTION'}]}},{text:'（點個頭就走）',consequences:{rel:{heroine_03:{fam:1}}}}]},{speaker:'heroine_03',expression:'smile',text:'陳語彤。……你是法律系的吧。你們系的人走路都很快。'} ], despawn:30, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='idle'; n.talk=null; } } },
  // 麵店：語彤在幫忙（她阿姨的店）
  { id:'ev_noodle_yutong', title:'阿鳳麵店', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:5, prereq:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, cooldown_days:2, background:'blur',
    dialogue:[ {speaker:'heroine_03',expression:'surprised',text:'……你？'},{speaker:'heroine_03',expression:'neutral',text:'這是我阿姨的店。二、四晚上我來幫忙。'},{if:{memory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'}]},speaker:'heroine_03',expression:'smile',text:'傘還在我這。你還記得那天嗎？雨大到看不見校門。'},{if:{memory:[{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'smile',text:'你的傘我帶來了，放在櫃台後面。……那天你到底有沒有淋濕？'},{unless:{memory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'},{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'neutral',text:'圖書館那天之後就沒再看到你。你都幾點去？'},{choice:[{text:'「乾麵，加滷蛋。」',consequences:{rel:{heroine_03:{fam:3,comf:2}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL',note:'她端來的乾麵'}],money:-75,energy:20,advance:0.5}},{text:'「你阿姨的店？那你從小就在公館？」',consequences:{rel:{heroine_03:{fam:4,trust:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'她從小在麵店長大'}]},goto:'family'},{text:'「今天忙嗎？我改天再來。」',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{goto:'end'},{label:'family'},{speaker:'heroine_03',expression:'thinking',text:'嗯。我媽身體不太好，我阿姨一個人顧不來。'},{speaker:'heroine_03',expression:'neutral',text:'……你不用那個表情。我從小就在這裡剝蒜頭，習慣了。乾麵？'},{speaker:'player',text:'乾麵。加滷蛋。'},{set:{},rel:{heroine_03:{comf:3}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL'}],advance:0.5},{label:'end'},{speaker:'heroine_03',expression:'smile',text:'慢慢吃。碗放著就好。'} ] },
  // ────────────────────────────────────────── 芷若：咖啡廳店員／通識課
  { id:'ev_cafe_barista_zhiruo', title:'兩點半的店員', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:5, cooldown_days:1, background:'blur',
    /* 芷若 Z1（BB_95 2-2，交接包 v1，2026-10-14）：點餐次數 CAFE_VISITS（每次點餐 +1；BB_90 芷若支線用同一個）。
       第 1 次才自我介紹（「林芷若，外文二」只說這一次）；已經在經原分組（ev_zhiruo_ge_group）認識的，第 1 次也不說名字；第 2～4 次「老樣子？」（SHARED_SECRET 的開場優先）；
       第 5 次起不問、直接做第一次點的東西（zhiruoFirstOrder；第一次點的東西也寫在 SHARED_MEAL 的備註）；第 5 次給集點卡和店裡的聯絡方式（加了：zhiruoShopContactDay，手機 4-2 照這一天排）。
       舊存檔（點過、沒有計數）：讀檔時補成 1（game3d.js 的 migrate）*/
    dialogue:[ {if:{flagNum:{CAFE_VISITS:{max:0}}},unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'歡迎光臨——喔，法律系的。你們系的人點餐都像在念條文。'},{if:{flagNum:{CAFE_VISITS:{max:0}},memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'……經原那組的。法律系的。你們系的人點餐都像在念條文。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'又來了。今天要「老樣子」嗎？我記得你的。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}}},unless:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'老樣子？'},{if:{flagNum:{CAFE_VISITS:{min:4}}},goto:'auto'},{choice:[{text:'「拿鐵。妳怎麼知道我是法律系？」',consequences:{rel:{heroine_02:{fam:4,comf:2}},money:-120,energy:10,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'拿鐵'}},goto:'how'},{text:'「手沖。妳推薦哪一支？」',consequences:{rel:{heroine_02:{fam:4,resp:3}},money:-150,energy:12,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'手沖'}},goto:'rec'},{text:'「檸檬塔。然後——妳是外文系的？」',unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},consequences:{rel:{heroine_02:{fam:5,trust:3}},money:-110,energy:14,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'檸檬塔'}},goto:'dept'},{text:'「只是看看。」',consequences:{rel:{heroine_02:{fam:1}}},end:true}]},{goto:'end'},{label:'how'},{speaker:'heroine_02',expression:'laugh',text:'你背包上掛著法學院的識別證啊，福爾摩斯。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。這裡一、三、五下午和晚上。你想念書的話，窗邊那桌最安靜。'},{goto:'end'},{label:'rec'},{speaker:'heroine_02',expression:'thinking',text:'今天的是衣索比亞，有點像……看《愛在黎明破曉時》那種早上。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。外文系的，看太多電影。林芷若。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。'},{goto:'end'},{label:'dept'},{speaker:'heroine_02',expression:'surprised',text:'……你怎麼知道？'},{speaker:'player',text:'櫃台後面那本《電影理論》。'},{speaker:'heroine_02',expression:'smile',text:'好，你贏了。林芷若，外文二。要不要一起修下學期的「法律與電影」？聽說老師會放《十二怒漢》。'},{set:{zhiruo_film_invite:true},mem:[{npc:'heroine_02',tag:'INVITED_CLUB',note:'邀你修法律與電影'}]},{goto:'end'},
      {label:'auto'},{unless:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'{flag:zhiruoFirstOrder|拿鐵}。……我已經在做了。'},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'檸檬塔。……我已經在切了。'},{if:{flagIs:{zhiruoFirstOrder:'手沖'}},consequences:{rel:{heroine_02:{fam:3}},money:-150,energy:12,advance:0.15}},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},consequences:{rel:{heroine_02:{fam:3}},money:-110,energy:14,advance:0.15}},{unless:{flagIs:{zhiruoFirstOrder:['手沖','檸檬塔']}},consequences:{rel:{heroine_02:{fam:3}},money:-120,energy:10,advance:0.15}},{inc:{CAFE_VISITS:1}},{if:{flagNum:{CAFE_VISITS:{max:5}}},goto:'card'},{goto:'end'},
      {label:'card'},{speaker:null,text:'她遞過來一張集點卡。集十點送一杯——前四次她也補蓋了，蓋到第五格。'},{speaker:null,text:'卡片背面寫著店裡的聯絡方式：「點餐可以先傳。」'},{choice:[{text:'（加店裡的帳號）',consequences:{stamp:['zhiruoShopContactDay'],memo:'加了兩點半的帳號（點餐可以先傳）'}},{text:'（把卡片收進錢包）'}]},
      {label:'end'},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'拿鐵'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了拿鐵'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'手沖'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了手沖'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'檸檬塔'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了檸檬塔'}]},{speaker:'heroine_02',expression:'smile',text:'杯子放著就好，慢慢來。'} ] },
  /* AA_120 7-5 第 3 項（BB 2026-10-13 的最小改字；已知資訊矛盾）：芷若的經原在週五、和祐廷同一堂，週二、週四在傅鐘附近是剛下外文系的課。經原那個選項要有 Z2（ev_zhiruo_ge_group）之後才有 */
  /* AA 2026-10-13 P1-2：傅鐘這段是「已經認識」的日常（她直接講下課的事），要先見過芷若（兩點半或經原分組）；沒見過時在傅鐘找她說話只有旁白（story3d.js 的 talkCharacter），也不會變成第一次見面 */
  { id:'ev_zhiruo_bell', title:'傅鐘旁邊', participants:['heroine_02'], location:'campus', trigger:'interact', priority:3, cooldown_days:1, prereq:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'smile',text:'剛下外文系的課。今天一句詩翻了一整堂。'},{choice:[{text:'「週五的經原，妳聽得懂供給曲線嗎？」',if:{events:['ev_zhiruo_ge_group']},consequences:{rel:{heroine_02:{fam:3,comf:3}}}},{text:'「妳上完課都在這裡發呆？」',consequences:{rel:{heroine_02:{fam:3}}}},{text:'「妳的交換申請交了嗎？」',if:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},consequences:{rel:{heroine_02:{trust:4}}},goto:'ex'}]},{speaker:'heroine_02',expression:'laugh',text:'發呆是下課最重要的部分。'},{goto:'end'},{label:'ex'},{speaker:'heroine_02',expression:'embarrassed',text:'……還沒。你不要每次都問這個。'},{speaker:'heroine_02',expression:'serious',text:'我會交。這週。大概。'},{mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'催她交交換申請'}]},{label:'end'} ] },
  { id:'ev_zhiruo_secret', title:'週末的咖啡廳', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:8, once:true, weekday:[6,0], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'neutral',text:'週末沒排班，我還是來了。這裡的人不會問我週末在幹嘛。'},{speaker:'heroine_02',expression:'thinking',text:'我跟你講一件事，你不要跟別人說。'},{speaker:'heroine_02',expression:'serious',text:'交換的申請我拖了兩個月。不是懶。是我媽問我「去了誰顧店」，我答不出來。'},{choice:[{text:'「妳想去嗎？」',consequences:{rel:{heroine_02:{trust:8,aff:3}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'交換申請與家裡的店'}]},goto:'want'},{text:'「先交件再說，錄取了再煩惱。」',consequences:{rel:{heroine_02:{trust:5,resp:4}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'交換申請與家裡的店'}]},goto:'do'},{text:'「家裡的事比較重要吧。」',consequences:{rel:{heroine_02:{trust:2,comf:-3}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'你說家裡比較重要'}]},goto:'fam'}]},{label:'want'},{speaker:'heroine_02',expression:'sad',text:'……想。想到每天看那間學校的網站。'},{speaker:'heroine_02',expression:'smile',text:'好，我知道了。謝謝你問「想不想」，大家都只問「怎麼辦」。'},{goto:'end'},{label:'do'},{speaker:'heroine_02',expression:'laugh',text:'你講話真的像法律系的。好，這週交。你作證。'},{goto:'end'},{label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'……嗯。也許吧。'},{speaker:null,text:'她把杯子收走的時候，沒有看你。'},{label:'end'} ] },
  // ────────────────────────────────────────── 子晴：室友的同學、吉他社
  { id:'ev_zhiruo_ge_final', title:'期末的短片', participants:[], location:['dorm','campus','putong'], trigger:'enter', term:['Y1S1'], once:true, prereq:{flags:['ge_group_zhiruo'],custom:G=>{ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=18; }}, background:'freeze',   /* BB_95 2-4 期末：旁白一行帶過（AA_108 第 4 節 #27：不排「第一個」）*/
    dialogue:[ {speaker:null,text:'三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'} ] },
  { id:'ev_kai_mentions_ziqing', title:'室友的同學', participants:['kai'], location:'dorm', trigger:'interact', priority:6, once:true, day_min:6,   /* BB_95 2-3：落在第 4 週（9/22 週一＝第 6 天），社團博覽會（第 5 週）之前；台詞全部保留 */ time:[18,26], prereq:{notMemory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* 已經認識子晴就不用轉述（BB 6-1）*/
    dialogue:[ {speaker:'kai',expression:'smile',text:'欸，我們系有個學姊，高子晴，吉他社的。她說社團缺人，問我有沒有朋友想來。'},{speaker:'kai',expression:'neutral',text:'我說我室友是法律系的，她說「法律系也可以啊，只要不會告我們」。'},{choice:[{text:'「什麼時候？」',consequences:{flags:{guitar_invite:true},rel:{heroine_04:{fam:2}},goal:'吉他社：第 5 週起，週一、週三 19:00，萬才館一樓多功能教室'},goto:'when'},{text:'「我不會彈吉他。」',consequences:{flags:{guitar_invite:true}},goto:'no'},{text:'「你去就好。」',consequences:{rel:{kai:{fam:-1}}},end:true}]},{label:'when'},{speaker:'kai',expression:'smile',text:'第五週開始，週一、週三晚上七點，在萬才館一樓的多功能教室。她說不用會彈。'},{goto:'end'},{label:'no'},{speaker:'kai',expression:'laugh',text:'她說一年級的沒有人會。週一、週三晚上七點，萬才館。'},{label:'end'} ] },
  /* AA_110 6-8 (a)（AA 暫定）：還沒認識子晴的玩家第一次去吉他社社課，社課一開始自動播這一段的初遇（classes3d.js 的 clubEvent）；之後玩家自己去找她才播「又來了」，最多一週一次（冷卻 1 → 7 天）；
     「阿凱說妳系上第一名」那個選項寫 ARGUED_ABOUT_CAREER（她的劇情點）：整個存檔只出現一次。台詞不動。 */
  { id:'ev_ziqing_club', title:'吉他社', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:5, cooldown_days:7, background:'blur',
    dialogue:[ {if:{flags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'欸不是，你就是阿凱的室友？法律系那個？'},{if:{notFlags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'新人？……法律系的？放心，我們社團沒有人會告人。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'laugh',text:'我高子晴。資工二。先講好：我們社團沒有人會彈，都是來吃東西的。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'neutral',text:'今天系上有程式比賽。我沒去。我來這裡彈吉他。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},stamp:['guitarFirstDay']},{if:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'又來了。今天要學 C 和弦還是要吃洋芋片？'},{choice:[{text:'「教我一個和弦。」',consequences:{rel:{heroine_04:{fam:5,comf:3}},mem:[{npc:'heroine_04',tag:'INVITED_CLUB'}],energy:-4,advance:1},goto:'chord'},{text:'「為什麼不去比賽？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},unless:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]},consequences:{rel:{heroine_04:{fam:3}},mem:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER',note:'問她為什麼不比賽'}]},goto:'why'},{text:'「妳們平常都在幹嘛？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'what'}]},{label:'chord'},{speaker:'heroine_04',expression:'laugh',text:'手指這樣——不對，那是 F，你會痛死。C。壓好。'},{speaker:null,text:'一個小時後你會了一個和弦，還有手指上兩條紅痕。'},{goto:'end'},{label:'why'},{speaker:'heroine_04',expression:'serious',text:'因為那是別人覺得我「應該」去的地方。我家已經有一個「應該」了，我不想再多一個。'},{speaker:'heroine_04',expression:'smile',text:'C 和弦再按一次。手指不要放。'},{goto:'end'},{label:'what'},{speaker:'heroine_04',expression:'smile',text:'吃東西、彈錯、笑別人彈錯。期末有成發，到時候你負責拍手。'},{label:'end'} ] },
  // ────────────────────────────────────────── 溫學姊：法服讀書會（刑訴）＋ 法研所
  /* AA_110 6-8 (a)（AA 暫定）：這個事件就是法服讀書會本身——時間對齊活動（週三 19:00，原本 18:48）、地點研討室 A：玩家在研討室 A 門口參加讀書會（ACTIVITIES 的 lawclub_study）時
     第一次播整段（classes3d.js 的 clubEvent；trigger 'activity'＝不會因為走進萬才館就自己開始），第二次以後只有旁白＋題庫兩三題。學姊研究計畫那段（GRAD_SCHOOL_DISCUSSION）只有一次。台詞不動。 */
  { id:'ev_studygroup_wed', title:'法服讀書會', participants:['heroine_05','classmate_bohan'], location:'wancai', trigger:'activity', weekday:[3], time:[19,21], cooldown_days:6, prereq:{flags:['lawclub']}, background:'blur', player_seat:null,
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）學姊每次都說沒關係，然後每次都點人。'},{legal:{context:'study',by:'heroine_05',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'thinking',text:'（舉手，停了一下）……我們為什麼要背這個？'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'smile',text:'（笑）好。這是一個答案。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'heroine_05',expression:'neutral',text:'……好問題。下週回答。'},{unless:{flags:['PEISHAN_ASKED_WHY']},set:{PEISHAN_ASKED_WHY:true,peishanAskedNow:true},stamp:['peishanAskedDay']},{legal:{context:'study',by:'heroine_05',pick:{section:'訊問、自白、緘默權'}}},{legal:{context:'study',by:'heroine_05',pick:{}}},{speaker:'heroine_05',expression:'tired',text:'今天先到這裡。……我下週要交大專生研究計畫。你們大三就會知道那是什麼東西。'},{choice:[{text:'「研究計畫是什麼？」',consequences:{grad:{bump:'學姊提到研究計畫',field:'公法'},rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「學姊為什麼想念研究所？」',consequences:{grad:{bump:'問學姊為什麼念研究所'},rel:{heroine_05:{trust:4}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'why'},{text:'（收書包）',consequences:{rel:{heroine_05:{fam:1}}},goto:'end'}]},{label:'grad'},{speaker:'heroine_05',expression:'serious',text:'一份你想研究什麼、為什麼、怎麼做的文件。教授看那個決定要不要你。'},{speaker:'heroine_05',expression:'thinking',text:'大部分人寫不出「為什麼」。'},{goto:'end'},{label:'why'},{speaker:'heroine_05',expression:'thinking',text:'……這個問題最近有人問我第三次了。'},{speaker:'heroine_05',expression:'neutral',text:'以前我會說「因為我對公法有興趣」。現在我會說：先不要問我。'},{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'她不確定為什麼念研究所'}]},{label:'end'},{speaker:null,text:'散會時，學姊把你的筆記還給你，裡面夾了一張便條：「一，論點不清。二，引用錯頁。三，字太醜。」'},{if:{flags:['peishanAskedNow']},unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。法律一。剛剛那個問題是我問的。',meet:'classmate_peishan'},{set:{peishanAskedNow:false},stamp:['studyGroupFirstDay']} ],   /* BB_95 2-5：沛珊 P1（第一次一起出席；PEISHAN_ASKED_WHY 給 ev_studygroup_p1b）、F-W1 便條、散會後 22:30 讀書會群組的訊息（phoneRules）；「大專生研究計畫」的時程需查證 */
    consequences:{mem:[{npc:'heroine_05',tag:'STUDIED_TOGETHER',note:'法服讀書會'},{npc:'classmate_bohan',tag:'STUDIED_TOGETHER'}],rel:{classmate_bohan:{fam:4}},advance:1.5,energy:-8,memo:'參加了法服讀書會（刑訴）'} },
  // ────────────────────────────────────────── 林教授：刑事訴訟法（週二 10:20）
  { id:'ev_class_crimpro', term:['Y3S1'], title:'刑事訴訟法', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], cooldown_days:6, background:'freeze', mainSide:'right', player_seat:[1,3],
    dialogue:[ {speaker:null,text:'霖澤館二樓。林教授把判決影本放在講台上，聲音不大，但沒有人講話。'},{speaker:'prof_lin',expression:'neutral',text:'「上週我們談了刑事訴訟的目的。有人以為就是『把壞人抓到』——今天我們從被告的位置看一次。」'},{legal:{context:'class',by:'prof_lin',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{speaker:'prof_lin',expression:'neutral',text:'「下一個問題比較實務。警察局的訊問室裡發生的事，法院要怎麼看？」'},{legal:{context:'class',by:'prof_lin',pick:{section:'訊問、自白、緘默權'}}},{speaker:'prof_lin',expression:'smile',text:'「這兩題會出現在期中。不是威脅，是預告。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她每學期都這樣說，然後真的出。'} ],
    consequences:{mem:[{npc:'classmate_bohan',tag:'SHARED_CLASS'},{npc:'prof_lin',tag:'SHARED_CLASS'}],rel:{classmate_bohan:{fam:3}},advance:1.7,energy:-6,memo:'上了刑事訴訟法',flags:{crimpro_attended:true}} },
  // ────────────────────────────────────────── 許教授：研究所的種子（辦公時間）
  { id:'ev_prof_xu_office', title:'許教授', participants:['prof_xu'], location:'wancai', trigger:'interact', priority:5, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},speaker:'prof_xu',expression:'neutral',text:'一年級的？我是許志遠，教行政法，你們大二會遇到我。'},{if:{memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},speaker:'prof_xu',expression:'neutral',text:'又是你。有問題？'},{choice:[{text:'「老師，法研所是在做什麼的？」',consequences:{grad:{bump:'問許教授法研所'},prof:{prof_xu:{kind:'office',delta:2,note:'問法研所'}},mem:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「老師推薦一本一年級可以讀的書嗎？」',consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'book_xu',title:'許教授推薦的書','body':'《法學方法論》入門——「先學會問問題，再學答案」。'}},goto:'book'},{text:'「沒事，路過。」',end:true}]},{label:'grad'},{speaker:'prof_xu',expression:'thinking',text:'「讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。」'},{speaker:'prof_xu',expression:'smile',text:'「你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。」'},{goto:'end'},{label:'book'},{speaker:'prof_xu',expression:'neutral',text:'「先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。」'},{label:'end'} ] },
  // ────────────────────────────────────────── 熟同學：小事件
  { id:'ev_xinci_notes', title:'借筆記', participants:['classmate_xinci'], location:['classroom','library'], trigger:'interact', priority:4, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]},speaker:'classmate_xinci',expression:'neutral',text:'你是……周老師點過的那個？我吳芯慈。同班。'},{speaker:'classmate_xinci',expression:'thinking',text:'我上週民總請假，你筆記可以借我看一下嗎？我明天還你。'},{choice:[{text:'「可以，給。」',consequences:{rel:{classmate_xinci:{fam:5,trust:4}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},goto:'yes'},{text:'「我的筆記很亂，你確定？」',consequences:{rel:{classmate_xinci:{fam:3}}},goto:'messy'},{text:'「不太方便，我自己要用。」',consequences:{rel:{classmate_xinci:{fam:1,trust:-2}},mem:[{npc:'classmate_xinci',tag:'REFUSED_HELP'}]},goto:'no'}]},{label:'yes'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。……我會重新排版再還你，你不要介意。'},{goto:'end'},{label:'messy'},{speaker:'classmate_xinci',expression:'laugh',text:'越亂越好，我喜歡整理。'},{rel:{classmate_xinci:{fam:2,trust:2}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},{goto:'end'},{label:'no'},{speaker:'classmate_xinci',expression:'neutral',text:'好。沒關係。'},{speaker:null,text:'她轉向另一個同學。你不確定她有沒有把這件事記下來。'},{label:'end'} ] },
  { id:'ev_bohan_kaogu', title:'考古題', participants:['classmate_bohan'], location:['library','classroom'], trigger:'interact', priority:4, cooldown_days:2, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。你有周老師前年的考古題嗎？'},{if:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'你來得正好。我在看刑總的題目，有一題我跟芯慈吵了半小時。'},{speaker:'classmate_bohan',expression:'thinking',text:'……我覺得我念得太少。你一天念幾小時？'},{choice:[{text:'「兩、三小時吧。」',consequences:{rel:{classmate_bohan:{fam:3,comf:2}}}},{text:'「看心情。」',consequences:{rel:{classmate_bohan:{fam:2,resp:-1}}}},{text:'「你已經是全班最認真的了。」',consequences:{rel:{classmate_bohan:{fam:4,trust:3}},mem:[{npc:'classmate_bohan',tag:'HELPED',note:'安慰他'}]}}]},{speaker:'classmate_bohan',expression:'neutral',text:'嗯。……好。'} ] },
  /* 沛珊 P2：為什麼念法律（BB_95 第 2-8 節完整版；使用者 2026-10-14 解除大一上交接包暫緩、AA 轉達）：只發生一次（once）；第一個選項換成 BB 寫好的（祐廷念法律是自己選的）；結尾不再用模板句、三個分支各說一次；週三晚上在萬才館（讀書會那天）才提讀書會。三個選項的數值、選項三的記憶照舊（記憶的備註照 BB_95 改成「她在想別的路」）*/
  { id:'ev_peishan_doubt', title:'為什麼念法律', participants:['classmate_peishan'], location:['library','wancai','campus'], trigger:'interact', priority:4, once:true, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。'},{unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},if:{custom:G=>G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5},speaker:'classmate_peishan',expression:'neutral',text:'你也在等讀書會？……不是。好。'},{speaker:'classmate_peishan',expression:'thinking',text:'你為什麼念法律？……這個問題很普通。我想聽普通以外的答案。'},{choice:[{text:'「我想知道事情『應該』怎麼處理。」',consequences:{rel:{classmate_peishan:{fam:3,comf:3}}},goto:'should'},{text:'「想幫人。」',consequences:{rel:{classmate_peishan:{fam:3,resp:2}}},goto:'help'},{text:'「妳呢？」',consequences:{rel:{classmate_peishan:{fam:4,trust:3}},mem:[{npc:'classmate_peishan',tag:'IMPORTANT_CONVERSATION',note:'她在想別的路'}]},goto:'her'}]},{label:'should'},{speaker:'classmate_peishan',expression:'thinking',text:'應該。'},{text:'她重複一次。'},{speaker:'classmate_peishan',expression:'smile',text:'我喜歡這個詞。……可是我常常想，是誰說的應該。'},{goto:'end'},{label:'help'},{speaker:'classmate_peishan',expression:'thinking',text:'我以前也這樣說。後來發現想幫人的方法很多，不一定要背條文。'},{goto:'end'},{label:'her'},{speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館兩個月都自在。'},{speaker:'classmate_peishan',expression:'neutral',text:'……我還沒跟家裡說。'},{text:'她停了一下。'},{speaker:'classmate_peishan',expression:'thinking',text:'好奇怪。我第一次講出來，聲音比我想的還大。'},{label:'end'},{text:'她把書包背起來。'},{if:{custom:G=>G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5},speaker:'classmate_peishan',expression:'neutral',text:'讀書會要開始了。'},{unless:{custom:G=>(G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5)||G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我要去上課了。'},{if:{custom:G=>!(G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5)&&(G.hour%24>=18||G.hour>=24)},speaker:'classmate_peishan',expression:'neutral',text:'我先回去了。'},{speaker:'classmate_peishan',expression:'smile',text:'剛剛那個問題，當作我們兩個都還在找。'} ] },
  { id:'ev_zhe_dinner', title:'公館吃什麼', participants:['zhe'], location:['campus','gongguan'], trigger:'interact', priority:2, time:[17,20], cooldown_days:1, random_weight:0.7, background:'blur',
    dialogue:[ {speaker:'zhe',expression:'smile',text:'公館吃什麼？我在麵店、滷味、便利商店之間掙扎二十分鐘了。'},{choice:[{text:'「麵店。」',consequences:{rel:{zhe:{fam:2}},mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'一起去麵店'}],goal:'公館 阿鳳麵店'}},{text:'「我還有東西要讀，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]}},{text:'「便利商店，快。」',consequences:{rel:{zhe:{fam:1}}}}]},{speaker:'zhe',expression:'laugh',text:'好啦。走。'} ] },
  { id:'ev_mingxuan_ball', title:'系籃', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:3, cooldown_days:2, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_mingxuan',tag:'FIRST_MET'}]},speaker:'classmate_mingxuan',expression:'smile',text:'江明軒。阿哲的隊友。他說你上課很敢講。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'週五練球缺人，來不來？不會打也可以，來當經理。'},{choice:[{text:'「好。」',consequences:{rel:{classmate_mingxuan:{fam:4,comf:3},zhe:{fam:2}},flags:{ball_invite:true}}},{text:'「我運動白痴。」',consequences:{rel:{classmate_mingxuan:{fam:2}}}},{text:'「你看起來都沒在念書，成績怎麼那麼好？」',if:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'}},consequences:{rel:{classmate_mingxuan:{fam:3,trust:2}}},goto:'study'}]},{goto:'end'},{label:'study'},{speaker:'classmate_mingxuan',expression:'laugh',text:'上課專心，回家不念。……還有我沒錢補習，只好上課專心。'},{label:'end'} ] },
  // ────────────────────────────────────────── 生活小事件（auto / enter）
  { id:'ev_rain_no_umbrella', title:'下雨了', participants:[], location:'campus', trigger:'enter', weather:'rain', day_min:3, cooldown_days:2, random_weight:0.6, background:'freeze',
    dialogue:[ {speaker:null,text:'走出建築的瞬間，雨。你的傘在宿舍的桌上。'},{choice:[{text:'跑去便利商店買一把（150 元）',consequences:{money:-150,energy:-3,memo:'買了第三把傘'}},{text:'淋回去',consequences:{energy:-8,memo:'淋雨'}},{text:'在屋簷下等十分鐘',consequences:{advance:0.2}}]} ] },
  { id:'ev_library_outlet', title:'插座', participants:[], location:'library', trigger:'enter', time:[13,21], day_min:3, cooldown_days:3, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'閱覽室裡每一個靠插座的位子都有人。有人把充電線拉到桌子中央，像在宣示主權。'},{choice:[{text:'問旁邊的人能不能分一格',consequences:{energy:-1},goto:'ask'},{text:'算了，用電池',consequences:{}}]},{label:'ask'},{speaker:null,text:'對方看了你一眼，把充電線往旁邊挪了三公分。'} ] },
  // ────────────────────────────────────────── 交接包 v1 第 4 批（BB_95 第 3 節：新事件）
  /* 方奕廷 F1：黃金葛（BB_95 3-1）。他平日 12–13 在校園走走（characters.js 的日程）；和他說話就觸發，只一次。植物知識需查證（BB）。
     之後：宿舍書桌旁多一盆黃金葛（POTHOS；story3d.js 的 dormItems、pothosScene：每週澆一次就夠，沒澆也不會枯，只是不長大——v1 只有一個大小）*/
  { id:'ev_fangyt_pothos', title:'黃金葛', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:6, weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    dialogue:[ {speaker:'npc_fangyt',expression:'neutral',text:'你是隔壁房的吧。我經過的時候看到，你們房間沒有綠色的東西。'},{speaker:'npc_fangyt',expression:'smile',text:'（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'莖節會長氣根，所以可以水耕，也可以土耕，而且——'},{speaker:'npc_fangyt',expression:'neutral',text:'……總之，很好養。忘記澆也不會死。'},{speaker:'npc_fangyt',expression:'smile',text:'跟你室友一樣。'},
      {choice:[{text:'「謝謝學長。」',goto:'thanks'},{text:'「我會養死。」',goto:'die'},{text:'「你袋子裡還有幾盆？」',goto:'bag'}]},
      {label:'thanks'},{speaker:'npc_fangyt',expression:'smile',text:'不用謝。它比較需要謝謝你。'},{goto:'end'},
      {label:'die'},{speaker:'npc_fangyt',expression:'neutral',text:'不會。我說過了，它很難死。'},{goto:'end'},
      {label:'bag'},{speaker:'npc_fangyt',expression:'laugh',text:'（笑）七盆。整層樓都要有。'},
      {label:'end'},{speaker:'npc_fangyt',expression:'neutral',text:'死掉的話傳照片給我。'} ],
    consequences:{flags:{POTHOS:true},stamp:['pothosDay'],contact:'npc_fangyt'} },   /* BB_95 4-4：送盆栽時留了聯絡方式（之後「新葉。你的。」用）*/
  /* 阿凱 K1：凌晨三點的螢幕（BB_95 3-2）。睡覺觸發（trigger:'sleep'：story3d.js 的 sleepNow 在睡著之後、天亮之前演，畫面是凌晨三點的房間）：
     大一上第 3～4 週、平日晚上、隔天早上真的有課（「你明天第一堂就有課」只在隔天有早上的課時出現：這裡直接當條件；BB 2026-10-14 把「早八」改成「第一堂」，654f5dd）、只一次。
     三個選項都會換鍵盤，不懲罰：說了＝隔天晚上（ev_kai_keyboard_quiet）；蓋棉被、戴耳塞＝一週後他自己發現（ev_kai_dark_circles），再隔天換。現有的「法無明文」（ev_dorm_late_kai）保留 */
  { id:'ev_kai_late_screen', title:'凌晨三點的螢幕', participants:['kai'], location:'dorm', trigger:'sleep', term:['Y1S1'], weeks:[3,4], weekday:[1,2,3,4,5], time:[17.5,27], day_min:3, once:true, background:'blur',
    prereq:{custom:G=>typeof CLS!=='undefined'&&CLS.dayItems(G,G.day+1).some(it=>!it.exam&&it.t0<12)},
    dialogue:[ {speaker:null,text:'凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'},
      {choice:[{text:'「阿凱，我明天第一堂有課。」',set:{kaiScreenChoice:0},goto:'said'},{text:'（翻身，用棉被蓋住頭）',set:{kaiScreenChoice:1},end:true},{text:'（戴耳塞）',set:{kaiScreenChoice:2},end:true}]},
      {label:'said'},{speaker:'kai',expression:'neutral',text:'（頭沒回）……喔。'} ],
    consequences:{stamp:['kaiScreenDay']} },
  /* K1 之後（蓋棉被、戴耳塞）：一週後的晚上，阿凱自己發現。要在房間裡（他的日程 18–32 在宿舍）*/
  { id:'ev_kai_dark_circles', title:'黑眼圈', participants:['kai'], location:'dorm', trigger:'enter', npcPresent:'kai', time:[18,27], once:true, background:'blur',
    prereq:{flagIs:{kaiScreenChoice:[1,2]},custom:G=>G.flags.kaiScreenDay!=null&&G.day>=G.flags.kaiScreenDay+7},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'你黑眼圈好重，是我嗎。'} ],
    consequences:{stamp:['kaiDarkDay']} },
  /* K1 之後換鍵盤：說了「我明天第一堂有課」的隔天晚上；或黑眼圈的隔天晚上。書桌下的盒子可以看（story3d.js 的 kaiBoxScene：看了才記 HELPED）*/
  { id:'ev_kai_keyboard_quiet', title:'安靜的鍵盤', participants:[], location:'dorm', trigger:'enter', time:[18,27], once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; return (F.kaiScreenChoice===0&&F.kaiScreenDay!=null&&G.day>=F.kaiScreenDay+1)||(F.kaiDarkDay!=null&&G.day>=F.kaiDarkDay+1); }},
    dialogue:[ {speaker:null,text:'螢幕調暗了，鍵盤換成很安靜的一把。'} ],
    consequences:{flags:{KAI_SILENT_KB:true}} },
  /* 讀書會的下一週：學姊的回答（BB_95 3-4）：P1（讀書會上沛珊問「我們為什麼要背這個？」）之後 7 天內的下一次讀書會，讀書會一開始就演（classes3d.js 的 clubEvent；
     沛珊在場、只一次）。學姊四年主題「條列越來越短」的第一個伏筆（BB_90 第 2b 節）。SIS_ANSWERED_WHY：大二上 P3 她決定重考時會讀。
     隔週沒來的玩家沒有這一場：之後第一次去讀書會，沛珊小聲說一句（ev_studygroup_p1b_missed）。舊存檔沒有 P1 的日期（peishanAskedDay）＝當作沒來 */
  { id:'ev_studygroup_p1b', title:'學姊的回答', participants:['heroine_05','classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'上週的問題。我想了一週。三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，因為會考。'},{speaker:'heroine_05',expression:'neutral',text:'二，因為背了，才有東西可以吵。'},{speaker:'heroine_05',expression:'neutral',text:'三……'},{speaker:null,text:'她停住。'},
      {speaker:'heroine_05',expression:'neutral',text:'三我還在想。今天讀刑訴。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}},
      {speaker:'classmate_peishan',expression:'thinking',text:'（小聲）她第一次沒講完三件。'} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  { id:'ev_studygroup_p1b_missed', title:'法服讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],notEvents:['ev_studygroup_p1b'],custom:G=>{ const d=G.flags.peishanAskedDay; return d==null||G.day-d>7; }}, background:'blur',
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（小聲）學姊上週回答了。她說她還在想。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  /* 沛珊 P2b：溫州街的三段論（BB_95 3-5）：P2（ev_peishan_doubt）之後、大一上第 6～7 週（期中前），平日 16–19 在總圖和她說話（她的日程本來就在總圖）。
     交往中（v1 一開始都是）：「去外面講」（總圖門口的階梯），她不說「我請你」（AA_112 8-1）；單身：「去 Café？我請你。」。ADV 背景（Café 窗邊、總圖門口的階梯）還沒有，先用目前畫面。
     法律說明需法律審查（LEGAL_REVIEW_REQUIRED）。「我小時候翻民法」只用 AA_12 的原意（翻得到、看不懂）。影響：筆記的第一頁第一次改寫（NOTE_PAGE1，AA_12 0-3 第 3 點；措辭需法律審查）、沛珊記憶 NOT_FOR_ME */
  { id:'ev_peishan_syllogism', title:'三段論', participants:['classmate_peishan'], location:['library','library_hall'], trigger:'interact', priority:5, weekday:[1,2,3,4,5], time:[16,19], term:['Y1S1'], weeks:[6,7], once:true, prereq:{events:['ev_peishan_doubt']}, background:'blur',
    dialogue:[ {if:{flags:['dating_kexin']},speaker:'classmate_peishan',expression:'neutral',text:'總圖不能講話。去外面講。'},{unless:{flags:['dating_kexin']},speaker:'classmate_peishan',expression:'smile',text:'總圖不能講話。去 Café？我請你。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'老師說法律的推理是三段論。大前提是法條，小前提是事實，結論是……把事實放進法條。'},
      {speaker:'player',text:'（在紙上畫了三個框）所以先找規則，再看這件事符不符合，最後才說結果。'},{speaker:'player',text:'……我小時候翻民法，就是少了中間那一步。'},
      {speaker:'classmate_peishan',expression:'smile',text:'（看著那三個框）你講得很開心耶。'},{speaker:'classmate_peishan',expression:'thinking',text:'我聽完的感覺是，人被放進一個框裡。'},{speaker:'classmate_peishan',expression:'thinking',text:'……我是不是不適合念這個。'},
      {choice:[{text:'「框是用來想清楚的，不是用來關人的。」',goto:'frame'},{text:'「妳可以不喜歡。」',goto:'dislike'},{text:'「我們再寫一題。」',goto:'again'}]},
      {label:'frame'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。'},{speaker:null,text:'她想了很久。'},{speaker:'classmate_peishan',expression:'thinking',text:'我懂你的意思。可是我比較想知道框外面的人在想什麼。'},{goto:'end'},
      {label:'dislike'},{speaker:'classmate_peishan',expression:'surprised',text:'……可以不喜歡？'},{speaker:null,text:'她重複一次，好像第一次聽到有這個選項。'},{speaker:'classmate_peishan',expression:'smile',text:'好，我先記著。'},{goto:'end'},
      {label:'again'},{speaker:null,text:'兩人又寫了一題。她寫得很好。'},{speaker:'classmate_peishan',expression:'thinking',text:'我寫得出來。可是我不想寫。好奇怪。'},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_peishan',tag:'NOT_FOR_ME',note:'三段論那天'}],flags:{NOTE_PAGE1:1},toast:'📓 筆記的第一頁：你改寫了一行'} },
  /* 明軒 M1：公車站的筆記（BB_95 3-6，v1 版）：週二、週四 21–22 點，他家教完剛下公車，在公館騎樓的公車站把民總筆記畫完（characters.js 的日程：linger）。
     和他至少 ACQUAINTANCE、大一上第 7 週（期中前一週）起、只一次。SAW_HIM_STUDY：期中後麵店團的聚餐（A15）阿哲說「明軒從來不念書」時多一個選項。
     解鎖他的聯絡方式；「公館一百元以內」的店家清單（地圖小標，BB_70 F-M1）還沒做。公車站的長椅還沒有（站著）——環境細節那一批（D70） */
  { id:'ev_mingxuan_notes', title:'公車站的筆記', participants:['classmate_mingxuan'], location:'gongguan', trigger:'interact', priority:6, weekday:[2,4], time:[21,22], term:['Y1S1'], once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'},custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.week>=7; }}, background:'blur',
    dialogue:[ {speaker:null,text:'明軒戴著耳機，膝蓋上攤著民總的筆記，三種顏色的螢光筆。'},{speaker:null,text:'他看到你，把筆記蓋起來。'},{speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你沒看到。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（笑）我是說，你什麼都沒看到喔。我是在看漫畫。'},
      {choice:[{text:'「我什麼都沒看到。」',goto:'nothing'},{text:'「你從哪裡回來？」',goto:'where'},{text:'（坐到他旁邊，也拿出筆記）',goto:'sit'}]},
      {label:'nothing'},{speaker:'classmate_mingxuan',expression:'smile',text:'很好。'},{speaker:null,text:'他把筆記打開，繼續畫。'},{speaker:null,text:'走到校門口。'},{speaker:'classmate_mingxuan',expression:'smile',text:'明天見。你什麼都沒看到。'},{goto:'end'},
      {label:'where'},{speaker:'classmate_mingxuan',expression:'neutral',text:'……家教。三個。'},{speaker:null,text:'他看馬路。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我爸的店最近比較忙不過來，我多接一點。'},{speaker:null,text:'然後轉回來，笑了。'},{speaker:'classmate_mingxuan',expression:'smile',text:'好，這個話題結束。你要不要看漫畫？'},{mem:[{npc:'classmate_mingxuan',tag:'SHARED_SECRET',note:'他多接了家教'}]},{goto:'end'},
      {label:'sit'},{speaker:null,text:'兩個人一路沒講話。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'你的螢光筆只有一種顏色？很可憐耶。'},{speaker:null,text:'他給你一支綠色的。'},{set:{GREEN_HIGHLIGHTER:true}},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],contact:'classmate_mingxuan',memo:'在公館的公車站遇到明軒'} },
  /* 校慶：法服的法律問答攤（BB_95 3-7）：大一上第 11 週週六（11/15，校慶日期需查證）10–12 點，走近椰林大道上法服的帳篷（zones3d.js：校慶那天擺出社團博覽會的同一排帳篷；
     學姊的日程那兩小時站在攤前）。沒加入法服的玩家經過也會被她叫住；攤位上還有阿嬤和法服的人，不是兩個人單獨相處。主線不會主動把玩家帶過去（BB_90 第 1 節）。
     阿嬤的問題只引導到「先溝通、再來法服」，不給法律結論、不引用條號（需法律審查；學生不能獨立給法律意見）。
     小插曲（都可以沒有）：芷若——有她的聯絡方式、FAMILIAR 以上：手機問一題（學姊從旁邊看到螢幕）；子晴——INVITED_CLUB：吉他社群組傳攤位照片（story3d.js 的 phoneRules）*/
  { id:'ev_sis_festival_booth', title:'法律問答攤', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[11], weekday:[6], time:[10,12], once:true, npcPresent:'heroine_05', near:{x:-17.8,z:13.0,r:4.5}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'你。過來。'},{speaker:'heroine_05',expression:'neutral',text:'兩件事。一，顧十分鐘。二，不會的不要亂答，叫我。'},
      {speaker:'阿嬤',text:'少年仔，隔壁的樹長到我家這邊，我可以自己剪嗎？'},
      {choice:[{text:'「阿嬤，我幫妳問學姊。」',consequences:{rel:{heroine_05:{fam:2}}},goto:'ask'},{text:'（翻民總的筆記）',consequences:{rel:{heroine_05:{fam:2}}},goto:'notes'},{text:'「我也還不會，我們一起查。」',consequences:{rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'HELPED',note:'一起幫阿嬤查'}]},goto:'search'}]},
      {label:'ask'},{speaker:'heroine_05',expression:'neutral',text:'阿嬤，先跟鄰居講，請他剪。講了一直沒剪，週三晚上來萬才館，我們一起看。'},{goto:'side'},
      {label:'notes'},{speaker:null,text:'翻了半天找不到。學姊探頭。'},{speaker:'heroine_05',expression:'neutral',text:'那是物權。你們大二才上。'},{speaker:'阿嬤',text:'物權是什麼？'},{speaker:'heroine_05',expression:'neutral',text:'……阿嬤，週三晚上來。'},{speaker:null,text:'原來法律是分科的。'},{goto:'side'},
      {label:'search'},{speaker:null,text:'你和阿嬤用手機一起查。學姊在旁邊看完。'},{speaker:'heroine_05',expression:'smile',text:'……還可以。'},
      {label:'side'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'聽說你在顧法律問答攤。問一題：電影裡偷看別人的信，算犯罪嗎。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'（從旁邊看到螢幕）哪部電影？'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'……很多部。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'那要一部一部看。'} ],
    consequences:{stamp:['festivalBoothDay'],memo:'校慶，在法服的攤位顧了十分鐘'} },
  /* 學姊 M1：家族聚餐（BB_95 3-8）：大一上第 14 週週五 18:18–19:00 在公館（學姊週五 18:30–20:30 本來就在公館），阿鳳麵店。ADV 背景（麵店）先用目前畫面。
     前一週 Kevin 在家族群組約（phoneRules）；當晚 22:30 學姊在群組訂正考古題；沒去的玩家：Kevin 貼資料夾照片、學姊說書會留給學弟（phoneRules）。
     「善意」的說明需法律審查。三個選項都有 SHARED_MEAL；問「收到」那一題設 SIS_NO_STICKER（同一學期的跨年夜，她第一次在群組貼貼圖，BB_108）。
     第一個選項接第二天的課堂（被周老師點名）；那天沒去上課的玩家沒有這個選項；第二個選項要在家族群組裡（看得到她都回「收到」） */
  { id:'ev_sis_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'gongguan', trigger:'auto', term:['Y1S1'], weeks:[14], weekday:[5], time:[18.3,19], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'18:31。她跑進來，有點喘。'},{speaker:'heroine_05',expression:'surprised',text:'抱歉。抱歉。……抱歉，我遲到了。'},{speaker:'Kevin 學長',text:'一分鐘。學姊，一分鐘。'},{speaker:'heroine_05',expression:'neutral',text:'一分鐘也是遲到。'},
      {speaker:null,text:'她坐下，從包包拿出一個資料夾。'},{speaker:'heroine_05',expression:'neutral',text:'三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，周老師歷年的考古題。我整理過，錯的地方用紅筆改了。'},{speaker:'heroine_05',expression:'neutral',text:'二，下學期的書，開學前我會分。書上標紅的地方是修法了，自己查新的。'},{speaker:'heroine_05',expression:'neutral',text:'三——'},
      {speaker:'Kevin 學長',text:'三是傳統！直屬學姊要講一個自己大一的糗事！'},{speaker:'heroine_05',expression:'neutral',text:'……'},{speaker:'heroine_05',expression:'neutral',text:'我大一第一次被點名，老師問什麼是「善意第三人」。我說：心地善良的第三人。'},{speaker:'heroine_05',expression:'neutral',text:'老師說：「那心地不好的第三人，是不是就不用保護了？」'},
      {speaker:null,text:'全桌笑。她也笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'重點是，「善意」在法律上是「不知道」的意思。下學期你們就會學到。'},
      {choice:[{text:'「我第三週被周老師點名。到現在還記得那時候手心的汗。」',unless:{flagIs:{classAnswer:'absent'}},consequences:{rel:{heroine_05:{comf:3}}},goto:'called'},{text:'「學姊在群組為什麼都只回『收到』？」',if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law')},consequences:{rel:{heroine_05:{fam:3}}},set:{SIS_NO_STICKER:true},goto:'sticker'},{text:'（默默把考古題資料夾收進書包）',consequences:{rel:{heroine_05:{resp:2}}},goto:'folder'}]},
      {label:'called'},{speaker:'heroine_05',expression:'smile',text:'那一題大家都會卡。重點是你有回答。'},{goto:'end'},
      {label:'sticker'},{speaker:'heroine_05',expression:'neutral',text:'因為收到了。'},{speaker:'Kevin 學長',text:'她連過年都回收到。'},{speaker:'heroine_05',expression:'neutral',text:'……不然要回什麼？'},{speaker:'Kevin 學長',text:'貼圖啊！'},{speaker:'heroine_05',expression:'neutral',text:'我沒有貼圖。'},{goto:'end'},
      {label:'folder'},{speaker:null,text:'學姊看了一眼。'},{speaker:'heroine_05',expression:'neutral',text:'資料夾回去再看。現在吃麵。'},{speaker:'Kevin 學長',text:'學姊說吃麵耶！'},
      {label:'end'},{speaker:'heroine_05',expression:'smile',text:'下學期的書，我會留給你。'} ],
    consequences:{mem:[{npc:'heroine_05',tag:'SHARED_MEAL',note:'家族聚餐'}],stamp:['familyDinnerDay'],memo:'直屬家族聚餐（阿鳳麵店）'} },
  /* 哲 1：不用約，來就有人（AA_40 哲 1；交付清單 A9）：大一上第 4 週週四起（遊戲裡的第二個週四），週二、週四傍晚在阿鳳麵店遇到阿哲（他的日程 17:30–20:30）——
     第 4 週週四沒去的玩家，順延到之後第一次在麵店遇到他（BB_95 第 5 節第 4 點：不能永久錯過）；只一次。麵店的長桌從這裡開始：
     阿哲建「麵店團」群組（AA_70 2-3），之後每個上課週的週二、週四 17:30 他在群組裡揪（story3d.js 的 phoneRules）。阿姨＝麵店的老闆娘（店員是路人模型，沒有名字）*/
  { id:'ev_zhe_long_table', title:'不用約，來就有人', participants:['zhe'], location:'noodle', trigger:'auto', near:{npc:'zhe',r:6}, term:['Y1S1'], weekday:[2,4], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S1',4,4)},
    dialogue:[ {speaker:'zhe',expression:'smile',text:'（把兩張桌子併起來）阿姨，我們以後週二週四都來。'},{speaker:'阿姨',text:'你們？你們是誰？'},
      {speaker:'zhe',expression:'laugh',text:'法律系一年級。現在是四個，之後會更多。'},{speaker:'zhe',expression:'smile',text:'（對你）規矩很簡單：週二週四，麵店。不用約，來就有人。'} ],
    consequences:{stamp:['noodleTableDay']} },
  /* 語 1：傅鐘旁邊的早餐（AA_40 語 1；交付清單 A10）：大一上第 3～5 週的早上，小語坐在傅鐘旁邊的長椅（她的日程 9:30–12:00），找她說話時；
     要先認識她（第一次說話是 talkYu 的自我介紹），而且不是認識的同一天（自我介紹已經講過三個社團）；只一次。
     「坐下來一起吃」記憶 BREAKFAST_YU（之後早上經過傅鐘她會先揮手：AA_118，之後再做）。吉他社的入口之一（另一個是阿凱）*/
  { id:'ev_yu_breakfast', title:'傅鐘旁邊的早餐', participants:['yu'], location:'campus', trigger:'interact', priority:6, term:['Y1S1'], weeks:[3,4,5], time:[9.5,12], once:true, background:'blur',
    prereq:{flags:['met_yu'],custom:G=>G.flags.metYuDay==null||G.flags.metYuDay<G.day},
    dialogue:[ {speaker:'yu',expression:'smile',text:'欸，你要不要坐？'},{speaker:'yu',expression:'neutral',text:'我一個人吃很怪。……不是怪，是很安靜。我不喜歡安靜。'},
      {speaker:'yu',expression:'smile',text:'對了，你有參加社團嗎？我有三個。你要不要加一個？吉他社缺人，辯論社也缺人，系學會永遠缺人。'},
      {choice:[{text:'（坐下來一起吃）',consequences:{mem:[{npc:'yu',tag:'BREAKFAST_YU',note:'傅鐘旁邊的早餐'}],advance:0.25},goto:'sit'},{text:'「我上課要遲到了。」',goto:'rush'},{text:'「三個社團不會累嗎？」',goto:'tired'}]},
      {label:'sit'},{speaker:null,text:'她講了十五分鐘，關於三個社團。'},{speaker:'yu',expression:'smile',text:'明天你也會經過嗎？'},{goto:'end'},
      {label:'rush'},{speaker:'yu',expression:'smile',text:'喔，好！'},{speaker:null,text:'她揮手。等你走遠，她把耳機戴上。'},{goto:'end'},
      {label:'tired'},{speaker:'yu',expression:'laugh',text:'累啊。'},{speaker:'yu',expression:'smile',text:'可是累就不會想東想西。'},
      {label:'end'} ] },
  /* 以安的報告分工（交接包 v1 第 3 節，AA 2026-10-14 補台詞；交付清單 A12；AA_113 9-1「分組報告是合作」）：大一上第 4 週週四民總下課後（第 4 週沒去上課的話，第 5 週那堂）——
     classes3d.js 的 afterClassEvent：那堂課上完就在教室裡接著演（afterClass＝課的 id；trigger 'class' 不會被別的地方觸發）。
     條件：第二天和以安一起度過下午（Café 或總圖：afternoonDone，cafeView 兩邊都有）；沒有的玩家沒有這一段，以安自己寫。舊存檔已經演過「報告的結論」（她自己寫完了）的也沒有。
     「好，一起寫。」＝記憶 REPORT_PARTNER、照第二天的看法分工；「我已經有組了。」不扣分。之後：沒有一起寫的，她寫完在總圖給你看（ev_an_report_followup）；第 6 週報告發回來兩種都接得上 */
  { id:'ev_an_report_split', title:'民總的報告', participants:['heroine_01'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[4,5], weekday:[4], once:true, npcPresent:'heroine_01', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_followup']},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（把講義收好）民總的報告，兩人一組。我還沒找人。'},{speaker:'heroine_01',expression:'neutral',text:'你那天講的，我想放進去。'},
      {choice:[{text:'「好，一起寫。」',consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'民總報告一起寫'}]},goto:'yes'},{text:'「我已經有組了。」',goto:'no'}]},
      {label:'yes'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'那結論你寫。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'smile',text:'那反方你寫。'},
      {if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'那判斷標準你寫，你比我會講。'},{goto:'end'},
      {label:'no'},{speaker:'heroine_01',expression:'neutral',text:'好。那我自己寫，寫完給你看。'},
      {label:'end'} ] },
  /* 迎新（交接包 v1 A11：AA_71 2-1＋沛珊 P0 BB_95 3-3）：參加法律系迎新的活動時演（src/data/activities.js 的 welcome_y1s1：第 4 週週六傅鐘前；classes3d.js 的 attendActivity 讀活動的 event）。
     只有認識的人在場（交付清單第 0 節第 1 點）：小語、柏翰沒見過就跳過那兩句；以安見過才算在場（說了經濟系那一年，她記得 KNOWS_ECON_YEAR）。
     自我介紹由玩家選說多少（不能替玩家說出經濟系那一年，AA_12 0-4）：只有「念過一年經濟」設 ECON_PAST_SHARED='full'；「大一歲」不設；說過的事不會變成沒說過（重修經原已經說過的照舊）。
     沛珊 P0：大地遊戲同一組、「奇怪的問題」只在這裡一次；記 FIRST_MET（participants）＋聯絡方式（迎新的群組）。第一句、「輪到你。」、大地遊戲那句是 LAWWW 加的場景說明（等 AA 看）*/
  { id:'ev_welcome_y1s1', title:'迎新', participants:['classmate_peishan'], location:'campus', trigger:'activity', term:['Y1S1'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'傅鐘前面，法律系的迎新。學長姊帶隊，大家先輪流自我介紹。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'小語自我介紹講了三分鐘她的三個社團。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',expression:'neutral',text:'（小聲）她剛剛講了四個。'},
      {speaker:null,text:'輪到你。'},
      {choice:[{text:'「我叫{name}，嘉義人。」',goto:'game'},{text:'「我比大家大一歲。」',goto:'older'},{text:'「我二十歲。念過一年經濟。」',goto:'econ'}]},
      {label:'older'},{speaker:'zhe',expression:'laugh',text:'那我們叫你哥？'},{speaker:'player',text:'不要。'},{goto:'game'},
      {label:'econ'},{set:{ECON_PAST_SHARED:'full'}},{if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','FIRST_MET')},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'迎新的自我介紹：你說念過一年經濟'}]},
      {speaker:null,text:'全場「喔——」。'},{speaker:'zhe',expression:'laugh',text:'哥！'},
      {label:'game'},{speaker:null,text:'大地遊戲，你和沛珊同一組。最後一關：用一句話說為什麼念法律。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我可以問一個奇怪的問題嗎。……如果答不出來，可以算過關嗎？'},
      {choice:[{text:'（替她答）「她想知道法律外面還有什麼。」',goto:'answer'},{text:'「我也還在找。」',goto:'search'}]},
      {label:'answer'},{speaker:null,text:'她看了你一眼。'},{speaker:'classmate_peishan',expression:'surprised',text:'……你怎麼知道。'},{speaker:null,text:'關主讓你們過了。'},{goto:'end'},
      {label:'search'},{speaker:'classmate_peishan',expression:'smile',text:'好。那我們兩個都還在找。'},
      {label:'end'} ],
    consequences:{contact:'classmate_peishan',stamp:['welcomeDay']} },
  /* 可昕 K1 導遊：第一次開車去政大（BB_95 9-1）：出遊事件（trigger 'outing'：src/outings3d.js 在約好的時間問「出發」，出發才演）；政大的 2D 背景還沒有圖（深色底＋地點字幕）。
     影子那一題三個選項都不記憶（BB 2026-10-14）；小吃街記 K1_ORDER（hers／mine／let_her）；記憶 OUR_SHOP_FIRST；NCCU_VISITED。只一次。
     v1 不放經濟系大一的回聲（「上次是假裝的導遊。這次是真的。」）*/
  { id:'ev_kexin_tour_nccu', title:'導遊', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'校門口。她在揮手，只戴一邊的耳環，今天是一顆小骰子。'},
      {speaker:'kexin',expression:'smile',text:'歡迎來到政大。我是今天的導遊。'},
      {speaker:'kexin',expression:'smile',text:'我在這裡念了{flag:kxTourWeeks|三}個禮拜，所以比你懂這裡{flag:kxTourWeeks|三}個禮拜。'},   /* AA 審 9-1 第 2 點：K1 延後時照實際的週數（排出遊時記下：story3d.js）*/
      {speaker:null,text:'她指了左邊、右邊、後面。'},
      {speaker:'kexin',expression:'laugh',text:'法學院。山。也是山。政大的地圖重點就是：山。'},
      {speaker:'kexin',expression:'teasing',text:'假設你的影子先到政大，它可以幫你點餐嗎？'},
      {choice:[{text:'「可以，它跟我點一樣的。」',goto:'s1'},{text:'「不行，影子不會講話。」',goto:'s2'},{text:'「它會先幫妳點。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'laugh',text:'那它也要付錢。……好，影子請客。'},{goto:'food'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'那它比你安靜。我考慮一下要帶哪一個。'},{goto:'food'},
      {label:'s3'},{speaker:'kexin',expression:'smile',text:'……這題你答得太快了。'},{speaker:null,text:'她先走進校門。'},
      {label:'food'},{scene:'政大・山下的小吃街',bg:'nccu_food'},
      {choice:[{text:'（吃她推薦的）',set:{K1_ORDER:'hers'},goto:'o1'},{text:'（自己挑一家）',set:{K1_ORDER:'mine'},goto:'o2'},{text:'「妳幫我點。」',set:{K1_ORDER:'let_her'},goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好，信任導遊。'},{speaker:null,text:'她點了兩碗酸辣湯餃。'},{goto:'park'},
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'你挑的那家，我還沒吃過。……好，今天換你當導遊。'},{goto:'park'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'讓我點的人，第三次老闆就會記得你。'},
      {label:'park'},{scene:'政大・停車場',bg:'nccu_park'},
      {speaker:'kexin',expression:'smile',text:'以後你開車來找我，我負責選宵夜。'},
      {speaker:'kexin',expression:'neutral',text:'……這是分工，不是命令。'} ],
    consequences:{flags:{NCCU_VISITED:true},mem:[{npc:'kexin',tag:'OUR_SHOP_FIRST',note:'政大山下的小吃街'}],memo:'第一次去政大：可昕當導遊'} },
  /* 可昕 K1b 予樂說：及格（BB_95 9-2）：K1 之後第 6～8 週，她在平日下午傳「明天晚上有空嗎？……」（story3d.js 的 phoneRules）；答應＝隔天 19:30、晚一點＝21:00 去政大（出遊）。
     流程照 AA_112 第 12 節：校門 → 山下的小吃街（予樂先到；予樂的第一句三選一＝YL_IMPRESSION）→ 可昕到了 → 河堤（假設題，玩笑、不給結論）→ 圖書館 → 停車場（約下一次）；
     隔天中午她傳予樂的紙條照片「及格。」（phoneRules）。「這週不行」：她自己去，隔天傳予樂戴紙巾皇冠的照片，予樂的第一句延到第一次見面。
     旁白「可昕到了……」「她在桌下踢你一下……」、圖書館那一句、停車場的兩個選項之後沒有回應，是照 BB 的流程寫成的（等 BB 看）*/
  { id:'ev_kexin_yule_pass', title:'予樂說：及格', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'停車場只剩最邊邊的一格。'},
      {phone:'kexin',text:'再十分鐘！你先去山下那間，幫我點酸辣湯餃。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:'予樂',text:'你就是那個……開車的？'},
      {speaker:'予樂',text:'我問你，台大法律系是不是都很難聊？'},
      {choice:[{text:'「司機兼男朋友。」',set:{YL_IMPRESSION:'funny'},goto:'y1'},{text:'「是。所以我來政大聊。」',set:{YL_IMPRESSION:'honest'},goto:'y2'},{text:'「妳好，我是{name}。」',set:{YL_IMPRESSION:'polite'},goto:'y3'}]},
      {label:'y1'},{speaker:'予樂',text:'好。司機。我記住了。'},{goto:'arrive'},
      {label:'y2'},{speaker:'予樂',text:'……可以，你很老實。'},{goto:'arrive'},
      {label:'y3'},{speaker:'予樂',text:'好客氣。可昕，他好客氣。'},
      {label:'arrive'},{speaker:null,text:'可昕到了。桌上聊報告、老師、學校的八卦。'},{speaker:null,text:'她在桌下踢你一下——意思是「你剛剛那句很好笑」。'},
      {scene:'政大・河堤',bg:'nccu_river'},
      {speaker:'kexin',expression:'teasing',text:'假設我把你的筆記借給予樂，算無權處分嗎？'},
      {choice:[{text:'「要先問我。」',goto:'r1'},{text:'「借吧，反正她看不懂。」',goto:'r2'},{text:'（笑）',goto:'r3'}]},
      {label:'r1'},{speaker:'kexin',expression:'smile',text:'好。我現在問了：可以嗎？'},{goto:'lib'},
      {label:'r2'},{speaker:'kexin',expression:'teasing',text:'……這句我會轉告她。'},{goto:'lib'},
      {label:'r3'},{speaker:'kexin',expression:'laugh',text:'笑也是一種回答。我當你答應了。'},
      {label:'lib'},{scene:'政大・圖書館',bg:'nccu_lib'},
      {speaker:null,text:'她要寫完一段報告。你坐下來一起讀。'},
      {speaker:'kexin',expression:'neutral',text:'你翻頁好大聲。'},
      {scene:'政大・停車場',bg:'nccu_park'},
      {choice:[{text:'「週末換妳來台大？」',set:{KX_NTU_ASKED:true},goto:'p1'},{text:'「明天考完傳訊息給我。」',goto:'p2'}]},
      {label:'p1'},{speaker:'kexin',expression:'smile',text:'好。我先去找品妤，再去抓你。'},{goto:'pend'},
      {label:'p2'},{speaker:'kexin',expression:'teasing',text:'好。考爛了也要傳。'},
      {label:'pend'} ],
    consequences:{stamp:['yulePassDay'],memo:'在政大見到予樂'} },
  /* 中秋烤肉（交付清單 A13：AA_71 2-2、AA_109 7-3）＋可昕 K3 第一次見麵店團（BB_95 9-4）：大一上第 5 週週六 15:00 河濱（出遊；阿哲在麵店團群組、沒有群組的私訊揪，story3d.js）。
     只有認識的人在場（交付清單第 0 節第 1 點）：AA 的「小事」每一句看那個人認識了沒；語彤不在就沒有阿姨醃的肉那一段。可昕：前一天她問，回「來我們這邊」才來（KX_BBQ_COME）。
     介紹她三選一（BB 2026-10-14）：只有第三個、而且原本不是 full 才把 ECON_PAST_SHARED 升成 full（以安在場加 KNOWS_ECON_YEAR）；之後阿哲和她比冷笑話，玩家選誰贏。
     AA 的「小事」是條列，旁白照條列的字寫成句子。AA 2026-10-14：沒有麵店團群組的玩家第一句是「大家借了」；加「你被分到顧火。火一直熄。」；
     只記 MIDAUTUMN_Y1，不加數值、不記 SHARED_MEAL */
  { id:'ev_mid_autumn_bbq', title:'中秋烤肉', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。麵店團借了一個烤肉架。'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。大家借了一個烤肉架。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤，小語負責吃。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤。'},
      {cg:'cg_midautumn_riverside'},   /* CG-14 中秋的河濱（BB 2026-10-14 ART_APPROVED）：去烤肉的玩家都有，從這一句起 */
      {speaker:null,text:'你被分到顧火。火一直熄。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:null,text:'以安帶了一張「烤肉時間表」。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'語彤帶了阿姨醃的肉。全場最好吃。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰帶了考古題，被沒收了。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},set:{BBQ_BOHAN_SEIZED:true}},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:null,text:'隔壁房的方奕廷也來了，一直在講河邊的植物。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'阿姨醃的肉被搶光了。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'zhe',expression:'laugh',text:'可以叫阿姨開一個烤肉的菜單嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'不行。她會真的開。'},
      {unless:{flags:['KX_BBQ_COME']},goto:'end'},
      {speaker:null,text:'可昕來了。'},
      {choice:[{text:'「這是可昕，我女朋友。」',set:{KX_INTRO:'gf'},goto:'i1'},{text:'「她會出題考你們。」',set:{KX_INTRO:'quiz'},goto:'i2'},{text:'「讓她說我們怎麼認識的。」',set:{KX_INTRO:'story'},goto:'i3'}]},
      {label:'i1'},{speaker:'zhe',expression:'smile',text:'哪間學校的？'},{speaker:'kexin',expression:'smile',text:'政大的。考古題可以交換。'},{goto:'joke'},
      {label:'i2'},{speaker:'kexin',expression:'teasing',text:'是假設題。假設你是一塊烤肉——'},{speaker:'zhe',expression:'laugh',text:'我拒絕回答。'},{goto:'joke'},
      {label:'i3'},{speaker:'kexin',expression:'smile',text:'杜可昕。政大法律。我們以前是經濟系的同學。……他重考的時候，坐我對面。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'known'},
      {speaker:'zhe',expression:'surprised',text:'等一下。經濟系？重考？'},{speaker:'player',text:'……嗯。一年。'},
      {set:{ECON_PAST_SHARED:'full'}},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'中秋烤肉：可昕說了你們以前是經濟系的同學'}]},{goto:'joke'},
      {label:'known'},{speaker:'zhe',expression:'laugh',text:'喔——就是那一年。'},
      {label:'joke'},{speaker:null,text:'之後阿哲和她比冷笑話。'},
      {choice:[{text:'（阿哲贏）',set:{KX_JOKE:'zhe'},goto:'zw'},{text:'（可昕贏）',set:{KX_JOKE:'kexin'},goto:'kw'}]},
      {label:'zw'},{speaker:'kexin',expression:'smile',text:'好，我回去練。'},{goto:'end'},
      {label:'kw'},{speaker:'kexin',expression:'laugh',text:'我練過。經濟系有一個人，冷笑話講到全營地睡著。'},
      {label:'end'} ],
    consequences:{flags:{MIDAUTUMN_Y1:true},stamp:['bbqDay'],memo:'中秋烤肉（河濱）'},
    after:(G)=>{ if(G.flags.KX_BBQ_COME) G.flags.KX_MET_NOODLE_TEAM=true; } },
  /* 以安新 3 宿舍的規則（交付清單 A14；交接包_v1 第 3 節、AA_113 事件 3）：祐廷不在，轉述。麵店團群組的訊息在 story3d.js 的 phoneRules（第 7 週週二晚上）；
     沒有加入麵店團群組的玩家，改成沛珊當面說同樣的內容（第 7 週起找她說話；要認識她）。只記旗標 AN_DORM_RULES（聽說，不寫成玩家在場）*/
  { id:'ev_an_dorm_rules_peishan', title:'宿舍的規則', participants:['classmate_peishan'], location:'any', trigger:'interact', priority:3, term:['Y1S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],custom:G=>{ if(G.flags.AN_DORM_RULES||typeof STORY==='undefined'||!STORY.termDay) return false; const g=G.phone&&G.phone.groups&&G.phone.groups.noodle_team; return !(g&&g.day<=STORY.termDay('Y1S1',7,2))&&G.day>=STORY.termDay('Y1S1',7,1); }},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'} ],
    consequences:{flags:{AN_DORM_RULES:'peishan'}} },
  /* G1 考完試走出教室（交付清單 A15：AA_13 G1）：大一上民總期中考考完，在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'mid'）；一定會發生。
     只有認識的人在場：柏翰沒見過＝第一句變成旁白（有人在問第二題）、他和芯慈的那段（和祐廷無關的一句）兩個人都認識才有；小語、明軒、以安沒見過就跳過。
     第一個選項要第一天讀過案例（readCase 不是 none）。只改變誰跟你走；記憶 SHARED_CLASS（在場、認識的同學）。考題不出題庫，只說「第二題」*/
  { id:'ev_midterm_walkout', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'civ_general', afterExam:'mid', term:['Y1S1'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'第二題，你們是寫要約之引誘還是要約？'},
      {unless:EV_KNOWS('classmate_bohan'),speaker:null,text:'有人在問：第二題，是寫要約之引誘還是要約？'},
      {speaker:'zhe',expression:'surprised',text:'……有第二題？'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'我寫要約。我覺得是要約。（停）完了，我寫要約。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'（小聲）我寫引誘，然後補了一段反對意見。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'反對意見誰的？'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'我自己的。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'……可以這樣寫嗎？'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',expression:'neutral',text:'不要對了啦，去吃飯。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'（從教室出來，把筆收進筆袋）對答案沒有用。考完了就是考完了。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'……我寫引誘。'},
      {choice:[{text:'「我寫引誘，第二天那個案子就是這個。」',unless:{flagIs:{readCase:['none',undefined]}},set:{G1_PICK:'case'},goto:'c1'},{text:'「我寫要約。」',set:{G1_PICK:'offer'},goto:'c2'},{text:'「去吃飯。」',set:{G1_PICK:'eat'},goto:'c3'}]},
      {label:'c1'},{if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'surprised',text:'你也讀了判決？'},{goto:'end'},
      {label:'c2'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'同一國的！'},{goto:'end'},
      {label:'c3'},{if:EV_KNOWS('classmate_mingxuan'),speaker:'阿哲、明軒',text:'走！'},{unless:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'走！'},
      {label:'end'},
      /* 考完的宵夜（A15，AA 2026-10-14）：沒有麵店團群組的玩家，阿哲當面問；有群組的在群組揪（story3d.js 的 phoneRules）*/
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:'zhe',expression:'smile',text:'晚上滷味，來不來？'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID1:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID1:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','民總期中考'); } },
  /* 翰 1 你考幾分（交付清單 A16：AA_40 翰 1，接 ev_bohan_kaogu；AA 2026-10-14）：大一上期中放榜——第 10 週的民總下課（第 10 週沒去上課的話第 11 週那堂），霖澤館走廊。
     遊戲不顯示分數（AA_104 第 10 節）：「（告訴他分數）」只有旁白「你說了分數。」，比他高／低照民總的準備程度（很好＝比他高，不錯以下＝比他低：CLS.gradeOf）。
     記憶 TOLD_SCORE（備註寫比他高／低；分數高於他的玩家，大二的翰 2 會被邀請）、ASKED_BACK（翰 4 多一句）；BOHAN_SCORE：higher／lower／no（「不想說。」翰 2 不邀請）。
     沒見過他：先用 ev_bohan_kaogu 的自我介紹那句 */
  { id:'ev_bohan_score', title:'你考幾分', participants:['classmate_bohan'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[10,11], once:true, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。'},
      {speaker:'classmate_bohan',expression:'serious',text:'你民總幾分？'},
      {speaker:'classmate_bohan',expression:'neutral',text:'我問了十四個人。你是第十五個。'},
      {choice:[{text:'（告訴他分數）',goto:'tell'},{text:'「不想說。」',set:{BOHAN_SCORE:'no'},goto:'no'},{text:'「你考幾分？」',set:{BOHAN_SCORE:'asked'},consequences:{mem:[{npc:'classmate_bohan',tag:'ASKED_BACK',note:'期中放榜，反問他考幾分'}]},goto:'back'}]},
      {label:'tell'},{speaker:null,text:'你說了分數。'},
      {if:{custom:G=>typeof CLS!=='undefined'&&CLS.gradeOf(((CLS.rec(G)||{}).prep||{}).civ_general||0)==='很好'},goto:'hi'},
      {set:{BOHAN_SCORE:'lower'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他低）'}]},
      {speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他也寫進手機的備忘錄。'},{goto:'end'},
      {label:'hi'},{set:{BOHAN_SCORE:'higher'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他高）'}]},
      {speaker:null,text:'他點頭，寫進手機的備忘錄。'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{goto:'end'},
      {label:'no'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他沒有生氣，只是把「15」改成「14」。'},{goto:'end'},
      {label:'back'},{speaker:null,text:'他停了一下。'},{speaker:'classmate_bohan',expression:'neutral',text:'……八十一。第六。'},{speaker:null,text:'第一次有人反問他。'},
      {label:'end'} ] },
  /* 考完的宵夜（交付清單 A15：AA_71 2-4、BB_95 3-6，AA 2026-10-14）：民總期中考那天晚上 20:30 公館滷味攤。公館有 3D 區域，滷味攤還沒有：先用出遊（轉場＋深色底，
     背景 gongguan_luwei 在 MISSING_EXTERNAL_ART）。誰揪：有麵店團群組＝阿哲在群組「考完了。滷味。」；沒有＝G1 結束時當面問。去不去由玩家選，不去不扣分。
     只有認識的人在場：明軒認識才有阿哲那句（考完當晚還沒有成績：「成績出來一定比我高」）；有 SAW_HIM_STUDY 多一個選項「……他有念啦。」→ 明軒瞪你一眼、請你一顆滷蛋；
     柏翰、芯慈、小語三個人都認識才有吵第三題那段。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  { id:'ev_midterm_supper', title:'考完的宵夜', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館・滷味攤',bg:'gongguan_luwei'},
      {speaker:null,text:'公館的滷味攤前，大家在對答案。'},
      {speaker:null,text:'有人只想吃，不想對：「不要跟我講第二題。」'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'明軒從來不念書，成績出來一定比我高。我恨他。'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},choice:[{text:'「……他有念啦。」',set:{SUPPER_MX_EGG:true},goto:'egg'},{text:'（繼續吃滷味）',goto:'tri'}]},
      {goto:'tri'},
      {label:'egg'},{speaker:null,text:'明軒瞪了你一眼。'},{speaker:null,text:'然後請你一顆滷蛋。'},
      {label:'tri'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:null,text:'柏翰和芯慈為了第三題的答案吵到滷味都冷了。'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:'yu',expression:'neutral',text:'你們兩個要不要結婚。'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:'柏翰、芯慈',text:'不要。'} ],
    consequences:{stamp:['supperMid1Day'],memo:'考完的宵夜（公館滷味攤）'} },
  /* 聖誕交換禮物（交付清單 A20：AA_71 2-6「大一的實作」，AA 2026-10-14 回 LAWWW）：第 17 週週三 12/24 中午 12:20～13:10 在霖澤館一樓；只有麵店團的玩家有（阿哲兩天前在群組揪，
     story3d.js 的 phoneRules），沒去不扣分。在場的人＝XMAS_WHO 裡玩家認識的（交付清單第 0 節第 1 條）。祐廷送什麼由玩家選（XMAS_GIFT）；
     抽到祐廷禮物的人（XMAS_TO）、祐廷抽到誰的（XMAS_FROM）從在場的人裡隨機挑（pick）；明軒和小語都在、抽到祐廷禮物的不是明軒＝小語的玩偶是明軒抽到（「和祐廷無關的一句」），祐廷就抽不到；
     柏翰的考古題由以安沒收（以安在場才有那一句；旁白的「又」只給中秋烤肉看過沒收的玩家：MIDAUTUMN_Y1＋BBQ_BOHAN_SEIZED，AA 交付清單 A20）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT（AA_11 事件 16）。
     明軒的禮物（BB_95 3-6b，2026-10-14）：三色螢光筆；祐廷抽到＝「多買的。……我用不到啦。」＋（綠色螢光筆）「上次那支綠的還在嗎？……」或（SAW_HIM_STUDY）「……你什麼都沒看到。」，記道具 XMAS_HL3；
     別人抽到＝阿哲、明軒各一句。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  { id:'ev_xmas_exchange', title:'聖誕交換禮物', participants:[], location:'linze', trigger:'auto', term:['Y1S1'], weeks:[17], weekday:[3], time:[12+20/60,13+10/60], once:true, background:'blur',
    prereq:{custom:(G,GM)=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&!(GM&&GM.E&&GM.E.player&&(GM.E.player.lv|0)!==0)&&XMAS_HERE(G).length>0},
    dialogue:[ {speaker:null,text:'抽籤交換禮物。'},{speaker:null,text:'每個人的禮物都很像他們自己。'},
      {speaker:null,text:'你帶來的禮物是——'},
      {choice:[{text:'一本小筆記本',set:{XMAS_GIFT:'notebook'}},{text:'一包咖啡豆',set:{XMAS_GIFT:'coffee'}},{text:'一張手寫卡片',set:{XMAS_GIFT:'card'}}]},
      {pick:{flag:'XMAS_TO',from:G=>XMAS_HERE(G)}},
      {if:{flagIs:{XMAS_TO:'heroine_01'}},speaker:null,text:'抽到你禮物的是以安。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'notebook'}},speaker:'heroine_01',expression:'smile',text:'剛好。手帳的理由欄不夠寫了。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'coffee'}},speaker:'heroine_01',expression:'neutral',text:'我不喝咖啡。……期末會喝。好。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'card'}},speaker:'heroine_01',expression:'neutral',text:'字很工整。我收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03'}},speaker:null,text:'抽到你禮物的是語彤。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},speaker:'heroine_03',expression:'neutral',text:'嗯。……我還不知道要寫什麼。先收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'coffee'}},speaker:'heroine_03',expression:'neutral',text:'我帶去店裡。阿姨會好奇。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'card'}},speaker:'heroine_03',expression:'neutral',text:'嗯。我會看兩次。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},mem:[{npc:'heroine_03',tag:'GIFT_NOTEBOOK_YT',note:'聖誕交換禮物：抽到你送的筆記本，還不知道要寫什麼'}]},
      {if:{flagIs:{XMAS_TO:'zhe'}},speaker:null,text:'抽到你禮物的是阿哲。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'notebook'}},speaker:'zhe',expression:'laugh',text:'好，我拿來寫菜單。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'coffee'}},speaker:'zhe',expression:'neutral',text:'可以配滷味嗎？'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'card'}},speaker:'zhe',expression:'laugh',text:'你寫這麼多字，我會哭耶。……沒事啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan'}},speaker:null,text:'抽到你禮物的是柏翰。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'notebook'}},speaker:'classmate_bohan',expression:'neutral',text:'我拿來整理考古題。……這次不會被沒收吧。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'coffee'}},speaker:'classmate_bohan',expression:'neutral',text:'期末很需要。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'card'}},speaker:'classmate_bohan',expression:'neutral',text:'……沒有人寫卡片給我過。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci'}},speaker:null,text:'抽到你禮物的是芯慈。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'notebook'}},speaker:'classmate_xinci',expression:'neutral',text:'格線的嗎？……空白的也好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'coffee'}},speaker:'classmate_xinci',expression:'smile',text:'追劇的時候剛好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'card'}},speaker:'classmate_xinci',expression:'smile',text:'你寫得比我整齊。……騙你的，我比較整齊。'},
      {if:{flagIs:{XMAS_TO:'yu'}},speaker:null,text:'抽到你禮物的是小語。'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'notebook'}},speaker:'yu',expression:'laugh',text:'我要拿來寫三個社團的行事曆！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'coffee'}},speaker:'yu',expression:'laugh',text:'我拿去社辦泡給大家喝！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'card'}},speaker:'yu',expression:'laugh',text:'卡片！我要貼在牆上！'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan'}},speaker:null,text:'抽到你禮物的是明軒。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:'classmate_mingxuan',expression:'neutral',text:'……我不念書的。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:null,text:'他很快把它收進書包。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'coffee'}},speaker:'classmate_mingxuan',expression:'neutral',text:'家教的時候喝。謝啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'card'}},speaker:'classmate_mingxuan',expression:'neutral',text:'卡片喔。……我帶回家。'},
      {pick:{flag:'XMAS_FROM',from:G=>XMAS_FROM_POOL(G)}},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:null,text:'你抽到以安的禮物：一本空白的手帳。'},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'neutral',text:'一頁行程，一頁理由欄。理由要自己寫。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的禮物：一包阿姨的辣椒醬。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:'heroine_03',expression:'neutral',text:'很辣。不要一次吃完。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:null,text:'你抽到阿哲的禮物：一盒滷味。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:'zhe',expression:'laugh',text:'冷掉了，但很好吃。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的禮物：一疊考古題。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'},custom:G=>XMAS_HERE(G).includes('heroine_01')},speaker:'heroine_01',expression:'neutral',text:'沒收。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的禮物：一張劇單。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:'classmate_xinci',expression:'smile',text:'十二部。看完跟我說。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:null,text:'你抽到小語的禮物：一個巨大的玩偶。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:'yu',expression:'smile',text:'我一個人在家的時候抱的那種。……送你。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:null,text:'你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的。……我用不到啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan',GREEN_HIGHLIGHTER:true}},speaker:'classmate_mingxuan',expression:'smile',text:'上次那支綠的還在嗎？……這樣你有四種了。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'},memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>!G.flags.GREEN_HIGHLIGHTER},speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你什麼都沒看到。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},set:{XMAS_HL3:true}},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，又被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'zhe',expression:'laugh',text:'你送螢光筆？你？'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的啦。'},
      {if:{custom:G=>XMAS_MX_YU(G)},speaker:null,text:'明軒抽到小語的巨大玩偶，揹著它去搭公車。'} ],
    consequences:{flags:{XMAS_Y1:true},memo:'聖誕交換禮物（霖澤館一樓）'} },
  /* 颱風假 T1a「泡麵之夜」（BB_110 第 2 節、交付清單 B3，2026-10-14 第 2 級 AA×BB）：颱風假（calendar.js 的 TYPHOON：第 7 週週一）晚上 18–23 點在宿舍房間。
     阿凱囤了泡麵；隔壁的方奕廷抱著植物過來——玩家見過他才有和他有關的三句（交付清單第 0 節第 1 條：沒見過的人不出現）。
     「不可抗力」只當玩笑、沒有人下結論（BB 2026-10-14 法律查核，BB_115 L436）。「看情況。」記 SAID_DEPENDS（大二 F2 阿凱的聊天機器人多一句）。
     生活 CG BCG-18「颱風夜的泡麵」（BB 2026-10-14 ART_APPROVED）在方奕廷進來那一句出現、之後的台詞和選項都用同一張；沒見過他的玩家不放（圖裡有他，BB 同意）。
     跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_typhoon_noodles_y1', title:'颱風夜的泡麵', participants:['kai'], location:'dorm', trigger:'auto', term:['Y1S1'], weeks:[7], weekday:[1], time:[18,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'kai',expression:'laugh',text:'我囤了二十包。這是我人生最正確的決定。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},cg:'cg_typhoon_noodles'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'（抱著一盆植物進來）它在陽台會死。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'kai',expression:'surprised',text:'……你帶一盆植物來吃泡麵？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'它不吃。它看。'},
      {speaker:'kai',expression:'smile',text:'法律系的，颱風天泡麵算不算「不可抗力」？'},
      {choice:[{text:'「算。所以你要分我。」',goto:'yes'},{text:'「不算。這是你自己囤的。」',goto:'no'},{text:'「看情況。」',goto:'dep'}]},
      {label:'yes'},{speaker:'kai',expression:'smile',text:'這個推論有問題，但我接受。'},{goto:'end'},
      {label:'no'},{speaker:'kai',expression:'sad',text:'你好無情。……拿去。'},{goto:'end'},
      {label:'dep'},{speaker:'kai',expression:'laugh',text:'你們法律系每次都這樣。'},{mem:[{npc:'kai',tag:'SAID_DEPENDS',note:'颱風夜的泡麵：「不可抗力？」「看情況。」'}]},
      {label:'end'} ],
    consequences:{flags:{TYPHOON_Y1:true},memo:'颱風假：宿舍的泡麵之夜'} },
  /* 跨年（交付清單 A21：交接包_v1 第 3 節、AA_71 2-7、BB_95 9-7）：第 18 週 12/31（期末考中間）。一週前可昕問「跨年要不要去人少的地方？」（story3d.js 的 phoneRules）：
     「好。」＝河堤（出遊，和 K1b 的河堤共用背景；回宿舍的路上麵店團群組傳頂樓的照片）；「我答應麵店團要去頂樓了。」＝宿舍頂樓，零點前一分鐘她打視訊來（不扣分；她不在這裡和麵店團見面）。
     沒有回她、在麵店團群組裡的玩家照 AA 的群戲去頂樓（沒有視訊）。記 KX_NYE:{1:'river'|'roof'}（BB_107 第 13 節：節日每年一筆）*/
  { id:'ev_nye_river', title:'跨年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'河堤',bg:'nccu_river'},
      {speaker:null,text:'河堤上的人不多。煙火在很遠的地方，聲音晚了好幾秒才到。'},
      {speaker:'kexin',expression:'smile',text:'今年我們不去人多的地方。'},
      {speaker:'kexin',expression:'teasing',text:'假設煙火的聲音永遠晚幾秒，那我們聽到的最後一聲，是今年的還是明年的？'},
      {choice:[{text:'「今年的。」',goto:'a'},{text:'「明年的。」',goto:'b'},{text:'「妳的問題比煙火難。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那我先說：新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'那我們再等幾秒。'},{speaker:null,text:'她數到三。'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'smile',text:'那就不要回答。新年快樂。'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'十分鐘。然後回去念書。我們都還有考試。'} ],
    consequences:{flags:{NYE_DONE:'river'},memo:'跨年：和可昕在河堤'} },
  { id:'ev_nye_roof', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {cg:'cg_nye_rooftop'},   /* CG-15 頂樓的跨年（BB 2026-10-14 ART_APPROVED）：第一句旁白起；可昕的視訊排在這張之後；河堤版（ev_nye_river）不放 */
      {speaker:null,text:'大家本來想去看煙火，最後發現人太多，跑回宿舍頂樓看遠方的煙火。'},
      {speaker:'zhe',expression:'laugh',text:'我們就說有看到。'},
      {unless:{custom:G=>!!(G.flags.KX_NYE&&G.flags.KX_NYE[1]==='roof')},goto:'end'},
      {speaker:null,text:'零點前一分鐘，可昕打視訊來。你走到頂樓的角落接。'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:null,text:'訊號慢了一秒，她的「新年快樂」晚到。'},
      {speaker:'kexin',expression:'smile',text:'……我們的新年差一秒。明年再對時。'},
      {speaker:null,text:'你轉告阿哲。阿哲對著天空喊——'},
      {if:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'可昕新年快樂！'},
      {unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'政大的那位，新年快樂！'},
      {label:'end'} ],
    consequences:{flags:{NYE_DONE:'roof'},memo:'跨年：宿舍頂樓'} },
  /* 期末最後一頓（交付清單 A22：AA_71 2-13）：這學期最後一科考完以後（classes3d.js 的 lastExamEnd），走進阿鳳麵店（傍晚到晚上）；麵店團才有（哲 1 之後）。只一次。
     「麵店團一定吃一頓」那句旁白照 2-13 的字；阿姨的一句原文 */
  { id:'ev_term_last_meal', title:'期末最後一頓', participants:[], location:'noodle', trigger:'enter', term:['Y1S1'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {speaker:null,text:'期末最後一科考完。麵店團一定吃一頓。'},{speaker:null,text:'阿姨多送了一盤小菜。'},{speaker:'阿姨',text:'考完了，吃好一點。'} ],
    consequences:{memo:'期末最後一頓（阿鳳麵店）'} },
  /* 可昕 K2 她第一次來台大（BB_95 9-3）：第 6 週週五 20:00 她傳「這次換我去台大。我先去找品妤，再去霖澤館抓你。」，週六 16:00 在社科院門口（story3d.js 的 phoneRules；出遊）。
     最小版本（BB_95 第 9 節）：依序換背景——社科院門口（她和品妤；品妤第一次出現＝重新介紹自己，之前遇過＝「你來了。」）→ 霖澤館前（假設題三選一）→ 椰林大道（旁白帶過去公館吃晚餐）。
     K1 還沒去過＝分開時「下次換你來，我當導遊。」。沒去（不去了、過了時間）＝她傳兩個人在社科院門口的照片（outingMissed）。記 MET_PINYU */
  { id:'ev_kexin_visits_ntu', title:'她第一次來台大', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; PHONE.at(G,G.day,Math.max(G.hour,q.h+0.75),[{th:'p:kexin',from:'kexin',text:'📷（她和品妤在社科院門口）'},{th:'p:kexin',from:'kexin',text:'品妤說你們系館很好認，最高的那棟。'}],'kx_ntu_photo'); },
    dialogue:[ {scene:'台大・社科院門口',bg:'ntu_soc'},
      {speaker:null,text:'社科院門口，可昕和品妤已經在等你。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。……一個暑假沒見，你不會忘了吧。'},
      {if:{flags:['MET_PINYU']},speaker:'品妤',text:'你來了。'},
      {speaker:'kexin',expression:'teasing',text:'這是我的舊系館。你的新系館在對面，我知道。'},
      {scene:'台大・霖澤館前',bg:'ntu_linze'},
      {speaker:'kexin',expression:'neutral',text:'所以這就是你每天說的霖澤館。……比照片高。'},
      {speaker:'kexin',expression:'teasing',text:'假設霖澤館會說話，它看到你每天第一堂遲到，第一句會說什麼？'},
      {choice:[{text:'「又是你。」',goto:'a'},{text:'「今天也辛苦了。」',goto:'b'},{text:'「我沒有每天遲到。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'對，它一定很熟你。'},{goto:'e'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'……你對建築物比對我溫柔。'},{speaker:null,text:'她笑。'},{goto:'e'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'它會說：『證據呢？』'},
      {label:'e'},
      {scene:'台大・椰林大道',bg:'ntu_avenue'},
      {speaker:null,text:'品妤先回去了。你們沿著椰林大道，一路走到公館吃晚餐。'},
      {unless:{events:['ev_kexin_tour_nccu']},speaker:'kexin',expression:'smile',text:'下次換你來，我當導遊。'} ],
    consequences:{flags:{MET_PINYU:true},memo:'可昕第一次來台大'} },
  /* 可昕 K4 第一次視訊一起讀書（BB_95 9-5）：第 16 週週二 20:00 她問（story3d.js 的 phoneRules）；「好，九點開。」＝當天 21:00 視訊（出遊：接起來）。
     開始前先選讀哪一科（和自學一樣算進期末準備：兩個小時＝兩次）；每半小時她出一題假設題（照順序，玩笑，不給結論），回她＝「你分心了。很好。」、
     不回＝「你今天好認真。我有點寂寞。……繼續。」（各自第一次才說，不重複）。沒接、今天先不要＝23:00 她傳書桌的照片（outingMissed）。記 VIDEO_STUDY（AA_112 第 6 節：和見面一樣算數）*/
  { id:'ev_kexin_video_study', title:'視訊一起讀書', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    beforeOuting:async(G,GM)=>{ G.flags.kxVideoCourse=null; if(typeof CLS==='undefined'||!CLS.studyPick) return; await GM.say(null,'今天讀哪一科？'); const r=await CLS.studyPick(GM); if(r&&r.course) G.flags.kxVideoCourse=r.course.id; },
    afterOuting:async(G,GM)=>{ const c=G.flags.kxVideoCourse; if(c&&typeof CLS!=='undefined'){ const R=CLS.rec(G); R.prep[c]=(R.prep[c]||0)+1; }   /* 第二個小時（studyPick 已經算了第一個小時）*/
      if(GM.energy) GM.energy(-16); if(G.stats) G.stats.study=(G.stats.study||0)+2; },
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; const late=G.day>q.day||G.hour>=23; PHONE.at(G,late?G.day:q.day,late?G.hour:23,KX_DESK_PHOTO,'kx_video_photo'); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'視訊接通。各讀各的。'},
      {speaker:'kexin',expression:'teasing',text:'假設你的螢光筆會說話，它會說你畫太多了嗎？'},
      {choice:[{text:'（回她）',goto:'r1'},{text:'（不回，繼續讀）',goto:'n1'}]},
      {label:'r1'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q1'},
      {label:'n1'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q1'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設期末考可以帶一個人進去，但他不能講話。你帶誰？'},
      {choice:[{text:'（回她）',goto:'r2'},{text:'（不回，繼續讀）',goto:'n2'}]},
      {label:'r2'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q2'},
      {label:'n2'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q2'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設咖啡有法律人格，你喝它算不算……算了，你讀你的。'},
      {choice:[{text:'（回她）',goto:'r3'},{text:'（不回，繼續讀）',goto:'n3'}]},
      {label:'r3'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q3'},
      {label:'n3'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q3'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設我們現在同時睡著，誰會先發現？'},
      {choice:[{text:'（回她）',goto:'r4'},{text:'（不回，繼續讀）',goto:'n4'}]},
      {label:'r4'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q4'},
      {label:'n4'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q4'} ],
    consequences:{mem:[{npc:'kexin',tag:'VIDEO_STUDY',note:'第一次視訊一起讀書'}],flags:{KX_VIDEO_DONE:true},memo:'和可昕視訊一起讀書'} },
  /* 可昕的生日（BB_95 9-6，2026-10-14 同意 LAWWW 的提案）：12/3（第 14 週週三）。早上跳「行事曆：今天是可昕的生日。」；她的對話串多一則「祐廷的草稿」（「生日快樂。」當天 23:59 前可以傳）；
     18:00 出遊提示「開車去政大」（story3d.js 的 phoneRules）。這是去的那一段：校門 → 山下的小吃街。「問予樂的。」只有見過予樂（K1b）才有；
     予樂見過：「好，我先走。司機，載好她。」；沒見過：她看了祐廷一眼才說「好，我先走。」（予樂的第一句留到第一次正式見面）。
     K1、K1b 都去過、K1 讓她點（K1_ORDER:'let_her'）＝第三次去，老闆記得點法。記 KX_BDAY_VISIT（phoneRules 換成 KX_BDAY:{1:'visit'}）*/
  { id:'ev_kexin_birthday_y1', title:'她的生日', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'政大的晚上，山上的風比台大冷一點。'},
      {speaker:null,text:'她和予樂下課走出來，看到車，停下來。'},
      {speaker:'kexin',expression:'surprised',text:'……你怎麼知道我幾點下課？'},
      {choice:[{text:'「妳的課表在我手機裡。」',goto:'a'},{text:'「問予樂的。」',if:{events:['ev_kexin_yule_pass']},goto:'b'},{text:'「猜的。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那張是我開玩笑傳給你的。……你真的存了。'},{goto:'yl'},
      {label:'b'},{speaker:'予樂',text:'我什麼都沒說。'},{speaker:'kexin',expression:'teasing',text:'她說了。她每次說謊都先撥頭髮。'},{goto:'yl'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'假設你猜錯了，你要在這裡等多久？'},{speaker:'player',text:'等到猜對。'},{speaker:'kexin',expression:'smile',text:'……這題算你過。'},
      {label:'yl'},
      {if:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。司機，載好她。'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:null,text:'予樂看了你一眼，對可昕說：'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {if:{flagIs:{K1_ORDER:'let_her'},events:['ev_kexin_tour_nccu','ev_kexin_yule_pass']},speaker:null,text:'老闆記得你的點法。'},
      {speaker:'kexin',expression:'smile',text:'生日願望有三個。第一個：明年也這樣。第二個：不能說。'},
      {speaker:'kexin',expression:'smile',text:'第三個……今天你點餐。'} ],
    consequences:{flags:{KX_BDAY_VISIT:true},memo:'可昕的生日（政大）'} },
  /* 期末成績：寒假第一天晚上和可昕視訊一起打開（BB_95 9-8）。等的玩家：她數完以後成績單接著出來；先看的玩家：照樣一起打開。沒接（錯過、今天先不要）：成績隔天早上照常出來 */
  { id:'ev_kexin_grades_open', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:'kexin',expression:'smile',text:'……都過了。好，寒假開始。'} ],
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S1) await CLS.showGrades(GM,'Y1S1'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S1) R.note.gradesDue='Y1S1'; } } },
  { id:'ev_dorm_late_kai', title:'半夜', participants:['kai'], location:'dorm', trigger:'enter', time:[23,26], day_min:3, cooldown_days:2, random_weight:0.7, background:'blur',
    dialogue:[ {speaker:'kai',expression:'neutral',text:'（頭沒回）欸，你回來了。我這個 bug 追到第三小時。'},{choice:[{text:'「去睡啦。」',consequences:{rel:{kai:{fam:1,comf:1}}}},{text:'「什麼 bug？」',consequences:{rel:{kai:{fam:2,trust:1}}},goto:'bug'},{text:'（戴上耳機）',consequences:{}}]},{goto:'end'},{label:'bug'},{speaker:'kai',expression:'tired',text:'一個值應該是 0 結果是 undefined。……你們法律系有這種東西嗎？'},{speaker:'player',text:'有。叫「法無明文」。'},{speaker:'kai',expression:'laugh',text:'幹，好爛。'},{label:'end'} ] },
  { id:'ev_library_closing', title:'閉館', participants:[], location:'library', trigger:'auto', time:[21.6,22.2], cooldown_days:1, background:'freeze',
    dialogue:[ {speaker:null,text:'「本館將於十分鐘後閉館——」廣播響起，整個閱覽室同時發出收東西的聲音。'} ], consequences:{goal:'總圖要閉館了'} },
  { id:'ev_pool_greet', title:'好像認識的人', participants:[], location:['campus','library'], trigger:'auto', time:[8,22], day_min:3, cooldown_days:1, random_weight:1.2, prereq:{custom:(G,GM)=>{ return Object.keys(GM.npc).some(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]); }}, background:'freeze',
    dialogue:[ {speaker:null,text:'迎面走來一個人，你確定在教室看過。對方也放慢了一步。'},{choice:[{text:'點頭',consequences:{flags:{pool_greeted:true}}},{text:'假裝看手機',consequences:{}}]},{speaker:null,text:'（有些人就是這樣，從「好像認識」開始的。）'} ], after:(G,GM)=>{ for(const id in GM.npc){ if(id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]){ G.flags['greet_'+id]=true; if(G.flags.pool_greeted){ SOCIAL.adjust(id,{fam:3}); } break; } } } },
  { id:'ev_an_report_followup', title:'報告的結論', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['afternoonDone'],events:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]}, day_min:3, background:'blur',   /* 交接包 v1 A12 之後（LAWWW 2026-10-14，等 AA 確認）：報告分工問過、你說「我已經有組了」——她寫完在總圖給你看。一起寫的、沒有分工那一段的玩家沒有這一場 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）報告我寫完了。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'（小聲）結論用了那天你說的「無過失」。周老師如果打槍我，我就說是你的主意。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'（小聲）我把你說的「後果自己承擔」寫進反方。寫的時候一直想到你那天的表情。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'（小聲）「不能讓人因為一個手誤賠十倍」——我放在結論。'},{unless:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'neutral',text:'（小聲）……謝謝你那天陪我。'},{choice:[{text:'「妳寫得出來，我只是坐在旁邊。」',consequences:{rel:{heroine_01:{comf:4,aff:2}},mem:[{npc:'heroine_01',tag:'HELPED_WITH_REPORT'}]}},{text:'「下次換我請。」',consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說下次換你請'}]}}]},{speaker:'heroine_01',expression:'smile',text:'（小聲）好。'} ] },
];
// 同一人物的一般閒聊（沒有事件可觸發時）。一句可以是字串，或 {t:'台詞', if:{條件，和事件的 if 一樣}}；story3d.js 的 S.smallTalk 輪流說、一天一句
/* 閒聊（S.smallTalk）：一句可以是字串，或 {t, 條件}。條件（AA_120 2-2，2026-10-13）：if／unless（EVENTS.cond）、term（學期）、week:[a,b]（學期第幾週）、
   location（區域）、time:[a,b]、weekday、once（true＝一輩子一次；'term'＝每學期一次）。條件照 AA_120 第 1、2 節（第①級：只加條件、不改字）；
   改字（第 5 節：柏翰「二十一天」、芯慈「經濟系」、黃教授「電影」、小語的內層引號）等使用者批准，字先不動。 */
const SMALLTALK={
  heroine_02:[{t:'「今天的豆子很酸，我不推。」',location:'cafe'},'「你有看過《東京物語》嗎？沒有？那我們沒得聊了——開玩笑。」',{t:'「外文系的期中是報告，法律系呢？……我聽說你們要寫到手斷掉。」',week:[6,9]}],
  heroine_03:['「……嗯。」',{t:'「三樓靠窗的燈壞了，你知道嗎。」',location:'library'},{t:'「我阿姨說你上次的麵沒吃完。」',if:{events:['ev_noodle_yutong']}}],
  heroine_04:[{t:'「欸不是，你手指好了沒？」',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}]}},{t:'「阿凱昨天又通宵，你室友要看好他。」',if:{events:['ev_ziqing_club']}},
              {t:'「期末成發你要來。這不是問句。」',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}],stage:{npc:'heroine_04',min:'FAMILIAR'}},term:['Y1S2','Y2S2'],week:[10,13]}],   /* 手指痛＝學過和弦；成發在大一下、大二下第 14 週（AA_120 第 1 節、BB_96 4-4）*/
  heroine_05:['「判決要看事實，不要只背結論。」',{t:'「法服週三晚上。來不來都可以，先來看一次。」',if:{notFlags:['lawclub']}},{t:'「……我沒事。只是沒睡。」',if:{stage:{npc:'heroine_05',min:'FAMILIAR'}}}],
  classmate_bohan:['「你有看今天的判決嗎？」',{t:'「我算過了，離第一科期中考還有{n}天。……我不是在倒數，是在排進度。」',midterm:[7,14],once:'term'}],   /* AA_120 7-1 第 1 項：{n}＝到這學期第一個期中考時段的天數（照課表和日曆，story3d.js 的 smallTalk），7～14 天才說、每學期一次 */
  classmate_xinci:[{t:'「筆記我還你了，你有收到嗎？」',if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},once:true},/* AA_120 7-1 第 2 項：雙主修三個版本照她知道多少（ECON_PAST_SHARED）；到了雙主修事件就不再說 */
    {t:'「雙主修經濟要多修好多學分。我把每學期排了三個版本……每一版都排得進去，每一版都沒有睡覺的時間。」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double']},unless:{flagIs:{ECON_PAST_SHARED:['full','half']}}},
    {t:'「你說你自學過一點經濟。個經和總經，你覺得哪一個比較會卡住人？我排課表就卡在這一格。」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'half'}}},
    {t:'「你念過一年經濟系，我只問一件事：經濟系的期中，會不會跟法律系的撞在同一週？」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'full'}}}],
  classmate_mingxuan:['「阿哲說週五練球。」',{t:'「你看起來很累。睡飽比較重要。」',if:{energy:{max:40}}}],
  classmate_youchen:[{t:'「……現在幾點？我昨天四點才睡。」',time:[8,13]},{t:'「公館那間 bar 週五我放歌，來嗎？」',if:{notEvents:['ev_youchen_dj']}}],
  classmate_peishan:['「我今天旁聽了倫理學。」',{t:'「讀書會週三，萬才館。」',if:{notFlags:['lawclub']}}],
  npc_fangyt:[{t:'「森林系的野外實習，下週去溪頭。」',once:'term'},{t:'「芷若跟你講過我嗎？她高中就這樣，什麼都不講。」',if:{events:['ev_fangyt_z6']}}],   /* 第二句在 Z6（BB_96 3-6，大一下）之後才說；Z6 還沒做，先不說（BB 2026-10-13）*/
  npc_huangxh:['「心理系的統計比你們的民法可怕。」',{t:'「語彤最近很累，你有注意到嗎？」',if:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}}],
  npc_ta_chen:['「論文寫到第三章。……別問我第四章。」',{t:'「林老師的考題，看判決就對了。」',term:['Y2S2','Y3S1']}],
  prof_zhou:['「有問題就來研究室。法律不是背的，是想的。」'],prof_lin:['「判決要整個讀，不要只讀結論。」'],prof_zhang:[{t:'「講義第三十頁，自己回去看。」',if:{course:{const_1:{min:1}}}}],prof_wu:[{t:'「這個概念我們下週再講兩小時。」',if:{course:{crim_gen1:{min:1}}},term:['Y1S1','Y1S2','Y2S1']}],prof_huang:[{t:'「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」',if:{course:{law_society:{min:1}}}}],   /* AA_120 7-1 第 4 項：那是書不是電影；上過她的課以後 */prof_xu:[{t:'「行政法大二再說。先把民總讀好。」',if:{course:{admin_law:{max:0}}}}],prof_tsai:['「民訴的題目很長，因為人生很長。」'],prof_chen:['「國際法的 seminar 隨時歡迎旁聽。」'],
  kai:[{t:'「所以那個賣家可以告嗎？……不能？那法律系在幹嘛。」',if:{flags:['classDone']}},{t:'「宿舍網路又斷了。你們有教這個嗎？」',location:'dorm'}],
  zhe:[{t:'「系籃週五練球，來坐也可以。」',if:{notFlags:['ball_invite']}},'「公館那家滷味晚上十點後半價。」'],
  yu:[{t:'「辯論社下週辯『網拍標錯價要不要出貨』。」',term:['Y1S1'],week:[4,6],once:true,if:{flags:['classDone']}},   /* AA_120 7-1 第 5 項：引號；辯論社第 5 週開始，第 4～6 週說「下週」才對 */'「溫州街的貓你有看到嗎？」'],
  /* AA_120 7-2（使用者 2026-10-13 批准）：20 位不熟同學各三句，整個存檔各只說一次；第 3 句要對方說過心事（SHARED_SECRET）以後。說完以後只點頭或短招呼（story3d.js 的 smallTalk）。台詞【虛構】 */
  pool_1:[{t:'「我在看一本推理小說，兇手是律師。……我還沒看完，你不要猜。」',once:true},{t:'「總圖那一區的推理小說，我大概看完一半了。剩下那一半都被借走。」',once:true},{t:'「我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？」',once:true,if:{memory:[{npc:'pool_1',tag:'SHARED_SECRET'}]}}],
  pool_2:[{t:'「財金系的報告都在算錢，法律系的報告都在算誰要賠錢。差不多。」',once:true},{t:'「我這學期修了二十五學分。不要學我。」',once:true},{t:'「我在學日文。五十音背了三次，第三次終於記住了。」',once:true,if:{memory:[{npc:'pool_2',tag:'SHARED_SECRET'}]}}],
  pool_3:[{t:'「台北的豆花太甜了。……好啦，是台南的太甜，台北的剛好。」',once:true},{t:'「我媽又寄了一箱虱目魚丸上來。冰箱塞不下，你要不要分一點？」',once:true},{t:'「每次搭高鐵回台南，過了嘉義就開始想吃早餐。」',once:true,if:{memory:[{npc:'pool_3',tag:'SHARED_SECRET'}]}}],
  pool_4:[{t:'「系學會又要辦活動了。你有什麼想玩的，可以跟我說。」',once:true},{t:'「活動組就是：大家在玩的時候，我在數人數。」',once:true},{t:'「書記官的考試科目，我偷偷查過了。你不要說出去。」',once:true,if:{memory:[{npc:'pool_4',tag:'SHARED_SECRET'}]}}],
  pool_5:[{t:'「社辦的吉他有一把斷了一根弦，大家都假裝沒看到。」',once:true},{t:'「我們社課有一半的時間在吃東西，另一半在找誰帶了撥片。」',once:true},{t:'「上次社辦有一隻蟑螂，我在走廊站了二十分鐘。不要笑。」',once:true,if:{memory:[{npc:'pool_5',tag:'SHARED_SECRET'}]}}],
  pool_6:[{t:'「椰林大道下午四點的光最好看。你下次經過可以看一下。」',once:true},{t:'「系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。」',once:true},{t:'「上次那張醉月湖的照片，我拿去投比賽。沒得獎，可是我很開心。」',once:true,if:{memory:[{npc:'pool_6',tag:'SHARED_SECRET'}]}}],
  pool_7:[{t:'「我六點就到傅鐘旁邊吃早餐了。那時候的校園很安靜，你應該來看一次。」',once:true},{t:'「早起的祕訣是早睡。……好，我知道這不算祕訣。」',once:true},{t:'「我想當律師，可是我還不知道要幫誰。你呢？」',once:true,if:{memory:[{npc:'pool_7',tag:'SHARED_SECRET'}]}}],
  pool_8:[{t:'「辯論最難的不是反駁，是計時器響的時候閉嘴。」',once:true},{t:'「下次辯論賽我當計時。……對，我每次都當計時。」',once:true},{t:'「上台之前我都要去洗三次手。今天洗了四次。」',once:true,if:{memory:[{npc:'pool_8',tag:'SHARED_SECRET'}]}}],
  pool_9:[{t:'「我最近在聽一個講冷知識的 podcast。昨天那集在講醬油。」',once:true},{t:'「窗邊這個位子下午很曬，可是我還是會坐這裡。」',once:true},{t:'「我在查國外的研究所。查了一個月，還沒跟我媽講。」',once:true,if:{memory:[{npc:'pool_9',tag:'SHARED_SECRET'}]}}],
  pool_10:[{t:'「冠廷學長說，讀書不要只畫重點，要問自己為什麼。他說了三次。」',once:true},{t:'「助教的研究室有一台很好喝的咖啡機。這是我知道的唯一祕密。」',once:true},{t:'「我想念研究所。……現在講這個好像太早了，對吧？」',once:true,if:{memory:[{npc:'pool_10',tag:'SHARED_SECRET'}]}}],
  pool_11:[{t:'「吉他袋很重。可是背著它走在路上，會覺得自己很會彈。」',once:true},{t:'「萬才館那邊晚上很安靜，彈錯也沒人聽到。」',once:true},{t:'「上次跟你說我不會換和弦……我昨天換成功了一次。只有一次。」',once:true,if:{memory:[{npc:'pool_11',tag:'SHARED_SECRET'}]}}],
  pool_12:[{t:'「系籃的水是我買的，毛巾是我洗的，比分是我記的。球是他們打的。」',once:true},{t:'「系服我有三件。不是因為愛系，是因為不用想要穿什麼。」',once:true},{t:'「翹課那幾次，我是去球場幫大家占位子。……好啦，也有一次是睡過頭。」',once:true,if:{memory:[{npc:'pool_12',tag:'SHARED_SECRET'}]}}],
  pool_13:[{t:'「廣播社這週的節目在講校園裡的貓。你有推薦的貓嗎？」',once:true},{t:'「錄音的時候最怕咳嗽。剪掉一聲要花十分鐘。」',once:true},{t:'「上次跟你說我想跑司法新聞。……我現在看新聞，都會先想記者有沒有把判決講錯。」',once:true,if:{memory:[{npc:'pool_13',tag:'SHARED_SECRET'}]}}],
  pool_14:[{t:'「從校門騎到總圖，我的紀錄是一分四十秒。不要學，很危險。」',once:true},{t:'「腳踏車社週末要騎去河堤。來的話記得帶水。」',once:true},{t:'「我一章讀十分鐘，可是隔天就忘了。所以我現在一章讀三次。」',once:true,if:{memory:[{npc:'pool_14',tag:'SHARED_SECRET'}]}}],
  pool_15:[{t:'「哲學系的課上了一學期，我學到的是：問題比答案多。」',once:true},{t:'「讀書會上我問了一個問題，大家安靜了五秒。我很喜歡那五秒。」',once:true},{t:'「我最後沒轉系。法律也在問『為什麼』，只是問得比較慢。」',once:true,if:{memory:[{npc:'pool_15',tag:'SHARED_SECRET'}]}}],
  pool_16:[{t:'「宥辰說我混音太吵。他說得對，可是我不改。」',once:true},{t:'「週五晚上公館那間，我偶爾去幫忙搬音響。」',once:true},{t:'「我背法條是配節奏的。……你不要叫我唱，我會害羞。」',once:true,if:{memory:[{npc:'pool_16',tag:'SHARED_SECRET'}]}}],
  pool_17:[{t:'「我的筆記借出去之前都會先拍照。上次有一本回來的時候多了咖啡漬。」',once:true},{t:'「考前一週，我的筆記會被借走五次。我自己都要排隊。」',once:true},{t:'「考前我都睡不著。所以才一直寫筆記，寫下來比較不怕。」',once:true,if:{memory:[{npc:'pool_17',tag:'SHARED_SECRET'}]}}],
  pool_18:[{t:'「早上的課我都坐最後一排。不是不想聽，是要給自己一點時間開機。」',once:true},{t:'「刑法的案例很像推理小說，只是兇手都先寫好了。」',once:true},{t:'「大家說我刑法很強。其實我每次考前都怕得要命。」',once:true,if:{memory:[{npc:'pool_18',tag:'SHARED_SECRET'}]}}],
  pool_19:[{t:'「我去旁聽社工系的課。有時候跟法律系在講同一件事，只是用不同的字。」',once:true},{t:'「週末我在社福中心當志工。有個小朋友問我『法律可以保護我嗎』，我還不會回答。」',once:true},{t:'「我家以前也被社工幫過。所以我想站在另一邊看看。」',once:true,if:{memory:[{npc:'pool_19',tag:'SHARED_SECRET'}]}}],
  pool_20:[{t:'「法服的攤位每年都擺在同一個位置。不是因為傳統，是因為那裡有插座。」',once:true},{t:'「法服的器材是我管的。延長線、名牌、那台很老的影印機。影印機最難管。」',once:true},{t:'「當幹部是抽籤抽到的。……可是我現在不想交出去了。」',once:true,if:{memory:[{npc:'pool_20',tag:'SHARED_SECRET'}]}}],
};

// ══════════════════════════════════════ 事件包 v1.1：女主角 arc、教授、同學、生活小事、考試、研究所
const STORY_EVENTS_V11=[
  // ── 小安 arc ──
  { id:'ev_an_library_study', title:'總圖的早上', term:['Y1S1'], participants:['heroine_01'], location:'library', trigger:'interact', priority:6, cooldown_days:2, day_min:3,   /* 交接包 v1 第 1 節（AA 2026-10-14）：大一沒有刑訴，選項改刑總；兩個選項都是大一上的課 → 只在大一上 */ prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）這裡有位子。你要讀什麼？'},{choice:[{text:'「民總。周老師下週要講錯誤。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀民總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「刑總。吳老師說期中會考。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀刑總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「我只是來吹冷氣。」',consequences:{rel:{heroine_01:{fam:1}}},goto:'ac'}]},{label:'study'},{speaker:null,text:'一個半小時。她翻頁的速度是你的兩倍，但每二十分鐘會停下來看窗外一次。'},{if:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}]},speaker:'heroine_01',expression:'smile',text:'（小聲）比咖啡廳安靜吧。……但那天比較好玩。'},{goto:'end'},{label:'ac'},{speaker:'heroine_01',expression:'annoyed',text:'（小聲）那你去三樓，那邊冷氣比較強。'},{label:'end'} ] },
  { id:'ev_an_report_feedback', title:'報告發回來了', participants:['heroine_01'], location:['campus','library','cafe'], trigger:'interact', priority:8, once:true, day_min:9, prereq:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}],custom:G=>typeof STORY==='undefined'||!STORY.termDay||G.day>=STORY.termDay('Y1S1',6,1)}, background:'blur',   /* 交付清單 A4：第 6 週（報告交出去之後）；舊存檔過了第 6 週的照舊 */
    dialogue:[ {speaker:'heroine_01',expression:'surprised',text:'報告發回來了。周老師在我的結論旁邊寫了一行字。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'laugh',text:'「無過失的判斷標準寫得好。」——所以我說了，是你的主意，他信了。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'「兩邊的利益都有看到。」……那是你那天講的。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'「反方意見比正方精彩。」——那段是照你講的寫的。'},{choice:[{text:'「下次也一起寫。」',if:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「下次一起寫。」',unless:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「那是妳寫的，不是我。」',consequences:{rel:{heroine_01:{resp:4,fam:2}}}}]},{speaker:'heroine_01',expression:'smile',text:'……嗯。'} ] },
  { id:'ev_an_mother', title:'書記官的女兒', retired:'D60（使用者 2026-10-14）：以安新版——母親是法官，停用書記官的舊事件。定義留著：已經演過的舊存檔（events.done、TALKED_FAMILY 記憶）照樣讀得到', participants:['heroine_01'], location:'campus', trigger:'interact', priority:7, once:true, time:[17.5,20.5], prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我媽今天打來，問我期中考幾分。還沒考。'},{speaker:'heroine_01',expression:'thinking',text:'她是書記官。從我小學開始，她每天回家都會講法院發生什麼事——誰哭、誰吵、誰被帶走。'},{speaker:'heroine_01',expression:'serious',text:'我念法律，一半是因為她。另一半是想知道，坐在那個位置上的人，到底看得到什麼。'},{choice:[{text:'「妳現在看到什麼？」',consequences:{rel:{heroine_01:{trust:7,aff:4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'see'},{text:'「妳可以不用一直想這個。」',consequences:{rel:{heroine_01:{comf:5,trust:3}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'rest'},{text:'「書記官很穩定啊。」',consequences:{rel:{heroine_01:{comf:-4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'你說書記官很穩定'}]},goto:'stable'}]},{label:'see'},{speaker:'heroine_01',expression:'sad',text:'……看到很多人不是壞人，只是沒有人幫他們把話講清楚。'},{speaker:'heroine_01',expression:'smile',text:'謝謝你問。大家都只問我成績。'},{goto:'end'},{label:'rest'},{speaker:'heroine_01',expression:'tired',text:'我知道。……可是不想的時候，就不知道為什麼要念這些。'},{goto:'end'},{label:'stable'},{speaker:'heroine_01',expression:'annoyed',text:'……我媽也這樣說。'},{speaker:null,text:'她沒有再說話。你們並肩走了一段，她在傅鐘前面說要回宿舍。'},{label:'end'} ] },
  // ── 芷若 arc ──
  { id:'ev_zhiruo_ge_group', title:'經原分組', participants:['heroine_02'], location:'putong', term:['Y1S1'], trigger:'auto', near:{npc:'heroine_02',r:5}, time:[12.1,13], weekday:[5], once:true, day_min:10, background:'blur',   /* AA_120 7-5 第 2 項：使用者已定 Z2 在重修的經原第 4 週週五（AA_110 1-5）——只改觸發：大一上、週五經原下課後、普通教學館、第 4 週起（2025-09-26＝第 10 天）；對話不動 */   /* 可以是第一次見面（BB 6-1、AA_120 3-1）：還沒見過的話她先報名字 */
    dialogue:[ {speaker:'heroine_02',expression:'surprised',text:'欸！法律系！你也修「經濟學原理」？'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。'},{speaker:'heroine_02',expression:'smile',text:'剛剛分組，我們那組缺一個人。要不要？期末報告是「一件你覺得不合理的定價」。'},{choice:[{text:'「好。網拍標錯價算不算？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:6,resp:3}},flags:{ge_group_zhiruo:true}},goto:'price'},{text:'「我報告很爛，妳確定？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:5,comf:3}},flags:{ge_group_zhiruo:true}}},{text:'「我已經有組了。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE'}]},end:true}]},{goto:'join'},{label:'price'},{speaker:'heroine_02',expression:'surprised',text:'（眼睛一亮）一千元的相機那種？你們法律系上課講這個？'},{speaker:'heroine_02',expression:'smile',text:'……好，這個可以拍成短片。我剪片。你負責講。'},{label:'join'},{speaker:'heroine_02',expression:'laugh',text:'太好了。組員裡有一個法律系的，老師會怕我們。'},{stamp:['geGroupDay']} ] },   /* BB_95 2-4：「網拍標錯價」之後的接點（法律說法需法律審查：遊戲裡只當報告題目、不給結論）；加入小組群組（geGroupDay，phoneRules）*/
  { id:'ev_zhiruo_film_night', title:'週末看片', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:7, once:true, weekday:[5,6], time:[18,23], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'smile',text:'明天店休。我要一個人去看《東京物語》的重映，早場。'},{speaker:'heroine_02',expression:'embarrassed',text:'……「一個人」是說本來。你要來嗎？不來也沒關係，真的。'},{choice:[{text:'「幾點？」',consequences:{rel:{heroine_02:{aff:6,fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》'}],flags:{zhiruo_film_date:true}},goto:'yes'},{text:'「早場我起不來。」',consequences:{rel:{heroine_02:{fam:1,aff:-2}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE',note:'看片邀約'}]},goto:'no'},{text:'「我看過了。結局是——」',consequences:{rel:{heroine_02:{comf:2}}},goto:'spoil'}]},{label:'yes'},{speaker:'heroine_02',expression:'smile',text:'十點。公館的那間。你遲到我就自己進去。'},{goto:'end'},{label:'no'},{speaker:'heroine_02',expression:'neutral',text:'好啊。那我自己去。'},{speaker:null,text:'她轉身擦杯子。你覺得剛才那句「沒關係」不是真的。'},{goto:'end'},{label:'spoil'},{speaker:'heroine_02',expression:'annoyed',text:'不准講！'},{speaker:'heroine_02',expression:'laugh',text:'……好啦，那部電影沒有結局可以劇透。你這樣算答應了嗎？'},{set:{zhiruo_film_date:true},rel:{heroine_02:{aff:4,fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》'}]},{label:'end'} ] },
  { id:'ev_zhiruo_applied', title:'她交件了', participants:['heroine_02'], location:['cafe','campus'], trigger:'interact', priority:9, once:true, day_min:6, prereq:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],events:['ev_zhiruo_secret']}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'serious',text:'我交了。交換申請。昨天晚上十一點五十九分。'},{speaker:'heroine_02',expression:'embarrassed',text:'交完手在抖。跟我媽還沒說。'},{choice:[{text:'「恭喜。錄取再煩惱。」',consequences:{rel:{heroine_02:{trust:5,resp:3}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你說恭喜'}]}},{text:'「什麼時候跟家裡說？」',consequences:{rel:{heroine_02:{trust:4,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你問家裡'}]},goto:'fam'}]},{goto:'end'},{label:'fam'},{speaker:'heroine_02',expression:'thinking',text:'錄取通知來的那天。如果沒錄取，就永遠不用說。……很懦弱吧。'},{speaker:'player',text:'不會。'},{label:'end'},{speaker:'heroine_02',expression:'smile',text:'謝謝。今天的咖啡我請。'} ] },
  // ── 語彤 arc ──
  { id:'ev_yutong_customer', title:'麵店的糾紛', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:9, once:true, prereq:{memory:[{npc:'heroine_03',tag:'SHARED_MEAL'}]}, background:'blur',
    /* 語彤事件 3 改寫版（AA_11 事件 3；交接包 v1 第 1 節，2026-10-14）：大一的祐廷誠實地「不知道」。不出任何法律題目、不給錄音證據的法律結論。
       選「我知道誰會知道」：祐廷第一次私訊學姊（yutongAskSisDay），學姊當晚 22:30 回（BB_95 4-3），截圖轉給語彤：「……法服是什麼？」（大二她加入法服的伏筆；story3d.js 的 phoneRules）。
       裝懂：她記得（BLUFFED；大二在法服第一次看到玩家時會問「這次你會說不知道嗎？」）。結果三種都一樣：阿姨週三去了法服（ev_yutong_customer_after）*/
    dialogue:[ {speaker:'heroine_03',expression:'serious',text:'……你是法律系的，我問你一件事。'},{speaker:'heroine_03',expression:'neutral',text:'上週有客人說他在我們店吃壞肚子，要我阿姨賠三萬。'},{speaker:'heroine_03',expression:'neutral',text:'他還錄了跟我阿姨吵架的聲音，說要拿去告。'},{speaker:'heroine_03',expression:'thinking',text:'我阿姨嚇到睡不著。那個錄音……他自己偷錄的，可以用嗎？'},
      {choice:[{text:'「我不知道。我才大一。但我知道誰會知道。」',consequences:{rel:{heroine_03:{trust:8,resp:5,fam:4}},mem:[{npc:'heroine_03',tag:'HELPED',note:'幫阿姨問了法服的學姊'}],stamp:['yutongAskSisDay']},goto:'know'},{text:'「這種人通常只是嚇人。」',consequences:{rel:{heroine_03:{fam:3,trust:2}},mem:[{npc:'heroine_03',tag:'HELPED',note:'說客人只是嚇人'}]},goto:'scare'},{text:'「我覺得不能用吧……」',consequences:{rel:{heroine_03:{fam:2,trust:2}},mem:[{npc:'heroine_03',tag:'BLUFFED',note:'錄音的事裝懂，被她看出來'}]},goto:'bluff'}]},
      {label:'know'},{speaker:null,text:'你拿出手機，傳訊息給溫學姊。'},{goto:'end'},
      {label:'scare'},{speaker:'heroine_03',expression:'neutral',text:'嗯。我阿姨也這樣說。可是她還是睡不著。'},{goto:'end'},
      {label:'bluff'},{speaker:null,text:'語彤看了你三秒。'},{speaker:'heroine_03',expression:'serious',text:'你剛剛停頓了。'},{speaker:'player',text:'……對，我不知道。'},{speaker:'heroine_03',expression:'neutral',text:'嗯。那你一開始就說不知道就好。'},
      {label:'end'},{speaker:'heroine_03',expression:'smile',text:'今天的麵不用錢。……阿姨問的話，我就說你洗了碗。'} ], consequences:{money:0,stamp:['yutongCustomerDay']} },
  /* 語彤事件 3 之後：學姊的回覆，在麵店當面給她看（沒有她的聯絡方式時；有的話是手機截圖，story3d.js 的 phoneRules）*/
  { id:'ev_yutong_fwd', title:'學姊的回覆', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:10, once:true, prereq:{flags:['yutongFwdInPerson']}, background:'blur',
    dialogue:[ {speaker:null,text:'你把學姊的回覆給語彤看。'},{speaker:'heroine_03',expression:'thinking',text:'……法服是什麼？'} ] },
  /* 語彤事件 3 的結果（AA_11：三種選擇都一樣）：那一週的週三之後，第一次走進麵店 */
  { id:'ev_yutong_customer_after', title:'阿姨去了法服', participants:[], location:'noodle', trigger:'enter', once:true, prereq:{events:['ev_yutong_customer'],custom:G=>{ const d=G.flags.yutongCustomerDay; if(d==null||typeof CALENDAR==='undefined') return false; const w=CALENDAR.dateOf(d).wd, wed=d+(((3-w)+7)%7||7); return G.day>wed; }}, background:'freeze',
    dialogue:[ {speaker:null,text:'阿姨週三去了法服。溫學姊幫她把那天的進貨單、發票、監視器的時間整理好。'},{speaker:null,text:'客人看到阿姨準備得這麼齊，就沒有再來了。'} ] },
  { id:'ev_yutong_absent', title:'她今天沒來', term:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], participants:['heroine_03'],   /* 交接包 v1：大一下以後才觸發（AA_11 事件 4 延後） */ location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true, day_min:8, prereq:{memory:[{npc:'heroine_03',tag:'TALKED_FAMILY'}]}, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台後面沒有語彤。阿姨一邊撈麵一邊說：「語彤今天帶她媽去醫院，回診。」'},{speaker:null,text:'「那孩子什麼都不講。你是她同學？下次叫她不要什麼都自己扛。」'},{set:{yutong_hospital:true},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨說她帶媽媽去醫院'}]} ] },
  { id:'ev_yutong_thanks', title:'圖書館三樓', term:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], participants:['heroine_03'],   /* 交接包 v1：大一下以後才觸發（AA_11 事件 5 延後） */ location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['yutong_hospital']}, background:'blur',
    dialogue:[ {speaker:'heroine_03',expression:'tired',text:'……阿姨跟你講了吧。'},{speaker:'heroine_03',expression:'neutral',text:'她每次都這樣。沒事，回診而已。'},{choice:[{text:'（什麼都不問，把自己的筆記推過去）',consequences:{rel:{heroine_03:{comf:8,trust:5,aff:3}},mem:[{npc:'heroine_03',tag:'HELPED',note:'什麼都沒問，把筆記給她'}]},goto:'notes'},{text:'「妳可以講。我不會跟別人說。」',consequences:{rel:{heroine_03:{trust:6,comf:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'你說她可以講'}]},goto:'talk'},{text:'「妳看起來很累，回去睡吧。」',consequences:{rel:{heroine_03:{comf:2}}},goto:'sleep'}]},{label:'notes'},{speaker:'heroine_03',expression:'surprised',text:'……'},{speaker:'heroine_03',expression:'smile',text:'你的字很醜。……謝謝。'},{goto:'end'},{label:'talk'},{speaker:'heroine_03',expression:'sad',text:'講了也不會好。……但謝謝。'},{goto:'end'},{label:'sleep'},{speaker:'heroine_03',expression:'neutral',text:'睡不著才來圖書館的。'},{label:'end'} ] },
  // ── 子晴 arc ──
  { id:'ev_ziqing_gongguan_night', title:'公館的晚上', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:6, cooldown_days:2, time:[21,25], prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'laugh',text:'欸不是，你怎麼這麼晚在這？法律系不是都早睡？'},{speaker:'heroine_04',expression:'smile',text:'我剛從網咖出來。不是打遊戲——好啦是打遊戲。你室友還活著嗎？他三天沒回訊息。'},{choice:[{text:'「活著。在追 bug。」',consequences:{rel:{heroine_04:{fam:3,comf:2},kai:{fam:1}}}},{text:'「妳們資工系的都不睡覺？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'sleep'},{text:'「要不要吃宵夜？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},consequences:{rel:{heroine_04:{fam:4,comf:4}},mem:[{npc:'heroine_04',tag:'SHARED_MEAL',note:'公館宵夜'}],money:-80,energy:8,advance:0.6},goto:'food'}]},{goto:'end'},{label:'sleep'},{speaker:'heroine_04',expression:'laugh',text:'睡覺是弱者的行為——騙你的，我下午睡了四小時。'},{goto:'end'},{label:'food'},{if:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。阿凱也在，他在排隊。'},{unless:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。我知道一家十點後半價的。'},{speaker:null,text:'她點的東西是你的三倍。'},{unless:{flags:['ZIQING_MAKING_SOMETHING']},goto:'photo'},{goto:'end'},{label:'photo'},{speaker:null,text:'滷味點完，她拿手機拍了一張照片。'},{speaker:'player',text:'拍什麼？'},{speaker:'heroine_04',expression:'neutral',text:'素材。我在做一個東西。……你不要問。'},{speaker:'heroine_04',expression:'thinking',text:'（三秒後）你可以問一點點。'},{speaker:'heroine_04',expression:'embarrassed',text:'……不行，還是不要問。'},{if:{flags:['dating_kexin']},speaker:'kai',expression:'smile',text:'她每次都拍，從來不給看。'},{set:{ZIQING_MAKING_SOMETHING:true}},{label:'end'} ] },   /* BB_95 2-7：交往中（AA_112 8-1：不放兩個人單獨的夜晚約會型場面）阿凱也在、三個人一起吃；拍照只一次（ZIQING_MAKING_SOMETHING，大一下 Q6 的伏筆）*/
  { id:'ev_ziqing_secret_game', title:'她在做的東西', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:9, once:true, prereq:{stage:{npc:'heroine_04',min:'FRIEND'}}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'serious',text:'我給你看一個東西。不准笑。'},{speaker:null,text:'她打開筆電。一個像素風的小遊戲，主角是一隻在校園裡找插座的貓。'},{speaker:'heroine_04',expression:'embarrassed',text:'做了半年。沒有人知道。系上覺得我在混。'},{choice:[{text:'「妳應該把它交出去。」',consequences:{rel:{heroine_04:{trust:6,resp:5}},mem:[{npc:'heroine_04',tag:'SHARED_SECRET',note:'她做的遊戲'}]},goto:'submit'},{text:'「貓為什麼要找插座？」',consequences:{rel:{heroine_04:{fam:5,comf:5,aff:3}},mem:[{npc:'heroine_04',tag:'SHARED_SECRET',note:'她做的遊戲'}]},goto:'cat'},{text:'「這比比賽有用多了。」',consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'SHARED_SECRET',note:'她做的遊戲'}]},goto:'better'}]},{label:'submit'},{speaker:'heroine_04',expression:'annoyed',text:'又來了。「應該」。'},{speaker:'heroine_04',expression:'smile',text:'……但你是第一個說「交出去」而不是「去比賽」的人。我想一下。'},{goto:'end'},{label:'cat'},{speaker:'heroine_04',expression:'laugh',text:'因為牠的主人是我室友，永遠在搶插座。'},{goto:'end'},{label:'better'},{speaker:'heroine_04',expression:'surprised',text:'……'},{speaker:'heroine_04',expression:'smile',text:'你不要突然講這種話，我會當真。'},{label:'end'} ] },
  { id:'ev_ziqing_contest_day', title:'比賽那天', participants:['heroine_04'], location:'cafe', trigger:'interact', priority:9, once:true, weekday:[6], prereq:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'tired',text:'……今天是那個比賽。系上的人現在都在會場。'},{speaker:'heroine_04',expression:'neutral',text:'我在這裡喝第三杯咖啡。你說，我是不是很爛。'},{choice:[{text:'「不是。妳只是不想被別人決定。」',consequences:{rel:{heroine_04:{trust:8,aff:5,comf:4}},mem:[{npc:'heroine_04',tag:'IMPORTANT_CONVERSATION',note:'比賽那天你陪她喝咖啡'}]}},{text:'「有一點。但明年還有。」',consequences:{rel:{heroine_04:{resp:4,trust:3,comf:-2}},mem:[{npc:'heroine_04',tag:'IMPORTANT_CONVERSATION',note:'比賽那天你說她有一點爛'}]}},{text:'（陪她坐著，不說話）',consequences:{rel:{heroine_04:{comf:7,aff:3}},mem:[{npc:'heroine_04',tag:'IMPORTANT_CONVERSATION',note:'比賽那天你陪她坐著'}]},advance:1}]},{speaker:'heroine_04',expression:'smile',text:'……第四杯。你請。'} ], consequences:{money:-120} },
  // ── 溫學姊 arc ──
  { id:'ev_sis_collapse', title:'她撐不住的那天', off:'交接包 v1 關閉（改寫版在之後的交接包）', participants:['heroine_05'], location:'cafe', trigger:'interact', priority:10, once:true, time:[20,24], prereq:{stage:{npc:'heroine_05',min:'FRIEND'},memory:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'tired',text:'……你來得剛好。或者剛不好。'},{speaker:'heroine_05',expression:'sad',text:'研究計畫被退回來。許老師說「你自己不相信這個題目」。他說對了。'},{speaker:'heroine_05',expression:'serious',text:'我做了三年法服、社長、公法組……然後我今天在這裡想，我是不是根本不想念法律。'},{choice:[{text:'「那妳想做什麼？」',consequences:{rel:{heroine_05:{trust:9,aff:4,comf:5}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她不確定要不要繼續念法律'}]},goto:'what'},{text:'「休息一天再想。」',consequences:{rel:{heroine_05:{comf:6,trust:4}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她不確定要不要繼續念法律'}]},goto:'rest'},{text:'「學姊，妳只是累了。」',consequences:{rel:{heroine_05:{comf:-3,trust:2}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'你說她只是累了'}]},goto:'tired'}]},{label:'what'},{speaker:'heroine_05',expression:'thinking',text:'……我不知道。這是三年來第一次有人問我這個，而不是問我「下一步」。'},{goto:'end'},{label:'rest'},{speaker:'heroine_05',expression:'tired',text:'我不會休息。……好吧，一天。'},{goto:'end'},{label:'tired'},{speaker:'heroine_05',expression:'annoyed',text:'每個人都這樣說。'},{speaker:'heroine_05',expression:'sad',text:'……對不起。你沒有錯。'},{label:'end'},{speaker:'heroine_05',expression:'neutral',text:'不要跟法服的人講。我明天還是社長。'} ] },
  { id:'ev_sis_office_together', title:'許教授的研究室', participants:['heroine_05','prof_xu'], location:'wancai', trigger:'interact', priority:8, once:true, prereq:{memory:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}],grad:{min:'CURIOUS'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'我等一下要去許老師那邊。你要跟嗎？他喜歡一年級的問笨問題。'},{choice:[{text:'「好。」',consequences:{grad:{bump:'跟學姊去許教授研究室',field:'公法'},prof:{prof_xu:{kind:'office',delta:3,note:'跟溫書瑀來研究室'}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'一起去研究室'},{npc:'prof_xu',tag:'FIRST_MET'}]},goto:'go'},{text:'「我還沒準備好問問題。」',consequences:{rel:{heroine_05:{fam:1}}},end:true}]},{label:'go'},{speaker:'prof_xu',expression:'neutral',text:'「書瑀，這位是？……一年級。你為什麼來？」'},{choice:[{text:'「想知道研究所在做什麼。」',consequences:{prof:{prof_xu:{kind:'research',delta:2}}}},{text:'「學姊叫我來的。」',consequences:{prof:{prof_xu:{kind:'office',delta:1}}}}]},{speaker:'prof_xu',expression:'smile',text:'「好。研究所在做的事就是：找到一個你不問會睡不著的問題。你有嗎？」'},{speaker:'player',text:'……還沒有。'},{speaker:'prof_xu',expression:'neutral',text:'「那就先上課。有了再來。」'},{speaker:'heroine_05',expression:'smile',text:'（小聲）他對你算客氣了。'} ] },
  // ── 教授 ──
  { id:'ev_prof_zhou_office', title:'周教授的研究室', participants:['prof_zhou'], location:'wancai', trigger:'interact', priority:6, cooldown_days:6, weekday:[4], time:[15.2,16.5], background:'blur',
    dialogue:[ {if:{flags:['classAnswerPlus']},speaker:'prof_zhou',expression:'neutral',text:'「你上次答得不錯。有問題？」'},{unless:{flags:['classAnswerPlus']},speaker:'prof_zhou',expression:'neutral',text:'「有問題就問。沒問題就回去讀。」'},{choice:[{text:'「老師，錯誤的『無過失』要怎麼判斷？」',consequences:{prof:{prof_zhou:{kind:'office',delta:3,note:'問無過失'}},note:{id:'zhou_88',title:'周教授：無過失的判斷','body':'看表意人有沒有「合理的注意可能」：能不能發現、有沒有時間改、金額落差多大。'},knowledge:{qid:null}},goto:'q'},{text:'「老師推薦一本書？」',consequences:{prof:{prof_zhou:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'zhou_book',title:'周教授推薦','body':'王澤鑑《民法總則》——「先讀例題，再讀本文」。'}},goto:'book'},{text:'「沒事。」',end:true}]},{label:'q'},{speaker:'prof_zhou',expression:'smile',text:'「好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。」'},{goto:'end'},{label:'book'},{speaker:'prof_zhou',expression:'neutral',text:'「一年級不用讀太多。一本，讀三遍。」'},{label:'end'} ] },
  { id:'ev_prof_lin_after', term:['Y3S1'], title:'下課後', participants:['prof_lin'], location:'classroom', trigger:'interact', priority:6, cooldown_days:6, weekday:[2], time:[11.8,12.6], background:'blur',
    dialogue:[ {speaker:'prof_lin',expression:'smile',text:'「你剛剛那題——」'},{if:{knowledge:[{qid:'Q001',min:'confused'}]},speaker:'prof_lin',expression:'neutral',text:'「很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。」'},{legal:{context:'classmate',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},{speaker:'prof_lin',expression:'neutral',text:'「來研究室也可以。週二下午。」'} ], consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'下課後問問題'}}} },
  // ── 同學 ──
  { id:'ev_zhe_ball', title:'系籃練球', participants:['zhe'], location:'campus', trigger:'interact', priority:5, weekday:[5], time:[16.5,18.5], cooldown_days:6, prereq:{flags:['ball_invite']}, background:'blur',
    dialogue:[ {speaker:'zhe',expression:'smile',text:'來了？明軒在場上等。你當經理，記分。'},{choice:[{text:'「記分可以。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（記分）'},{npc:'classmate_mingxuan',tag:'SHARED_CLASS',note:'系籃練球'}],rel:{zhe:{fam:5,comf:4},classmate_mingxuan:{fam:5}},energy:-10,advance:1.5,memo:'去系籃當了一次記分員'}},{text:'「我上場。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（上場被電）'}],rel:{zhe:{fam:6,comf:5},classmate_mingxuan:{fam:6,resp:2}},energy:-22,advance:1.5,memo:'系籃練球被電了一小時'}},{text:'「今天不行。」',consequences:{mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]},end:true}]},{speaker:'zhe',expression:'laugh',text:'結束去公館吃麵，我請。'} ] },
  { id:'ev_youchen_dj', title:'週五晚上', participants:['classmate_youchen'], location:'gongguan', trigger:'interact', priority:6, weekday:[5], time:[21,26], cooldown_days:6, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_youchen',tag:'FIRST_MET'}]},speaker:'classmate_youchen',expression:'smile',text:'你……民總同班的？賴宥辰。你大概沒看過我，我通常在睡覺。'},{speaker:'classmate_youchen',expression:'smile',text:'我十一點在巷子裡那間放歌。來嗎？不用錢，法律系的算朋友價。'},{choice:[{text:'「去。」',consequences:{rel:{classmate_youchen:{fam:6,comf:4}},mem:[{npc:'classmate_youchen',tag:'SHARED_MEAL',note:'去聽他放歌'}],energy:-8,advance:2,memo:'去聽宥辰放歌到凌晨'}},{text:'「明天要早起。」',consequences:{rel:{classmate_youchen:{fam:2}}}}]},{speaker:'classmate_youchen',expression:'laugh',text:'考前我就會消失，別找我。'} ] },
  { id:'ev_xinci_double', title:'雙主修', participants:['classmate_xinci'], location:'library', trigger:'interact', priority:6, once:true, term:['Y1S2'], day_min:195, day_max:208, prereq:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]}, background:'blur',   /* AA_120 7-1 第 3 項：大一下第 6～7 週（2026-03-30～04-12），期中前；債總週四、經原週五 */
    dialogue:[ {speaker:'classmate_xinci',expression:'tired',text:'（小聲）經濟的期中在債總的隔天。兩科我都還沒念完……我可能要放棄一科。'},{choice:[{text:'「放經濟。妳民法比較強。」',consequences:{rel:{classmate_xinci:{trust:4,resp:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你建議她放經濟'}]}},{text:'「兩科都考，考爛也是經驗。」',consequences:{rel:{classmate_xinci:{fam:3,comf:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你說兩科都考'}]}},{text:'「妳為什麼要雙主修？」',consequences:{rel:{classmate_xinci:{trust:5,fam:3}},mem:[{npc:'classmate_xinci',tag:'TALKED_FAMILY',note:'雙主修是家裡要的'}]},goto:'why'}]},{goto:'end'},{label:'why'},{speaker:'classmate_xinci',expression:'neutral',text:'（小聲）我爸說法律系畢業沒有第二專長會餓死。他是會計師。'},{label:'end'},{speaker:'classmate_xinci',expression:'smile',text:'（小聲）謝謝。我要繼續讀了。'} ] },
  { id:'ev_mingxuan_money', title:'家裡的事', off:'交接包 v1 關閉（BB_95 2-9；改寫版在之後的交接包）', participants:['classmate_mingxuan'], location:['campus','gongguan'], trigger:'interact', priority:7, once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'我下學期可能要去打工。家裡……嗯。'},{speaker:'classmate_mingxuan',expression:'smile',text:'不用那個表情，我又不是要休學。只是球可能不打了。'},{choice:[{text:'「法服有工讀，我問學姊。」',consequences:{rel:{classmate_mingxuan:{trust:6,fam:4}},mem:[{npc:'classmate_mingxuan',tag:'HELPED',note:'幫他問工讀'}],flags:{mingxuan_job_ask:true}}},{text:'「阿哲知道嗎？」',consequences:{rel:{classmate_mingxuan:{fam:3}},mem:[{npc:'classmate_mingxuan',tag:'TALKED_FAMILY'}]}},{text:'「加油。」',consequences:{rel:{classmate_mingxuan:{fam:1}}}}]},{speaker:'classmate_mingxuan',expression:'smile',text:'……嗯。謝了。不要跟阿哲講，他會請我吃一個月的麵。'} ] },
  // ── 生活小事 ──
  { id:'ev_wrong_coffee', title:'咖啡買錯', participants:[], location:'cafe', trigger:'enter', day_min:3, cooldown_days:4, random_weight:0.35, background:'freeze',
    dialogue:[ {speaker:null,text:'你點了拿鐵，拿到的是手沖。店員說「啊」，然後看著你。'},{choice:[{text:'「沒關係，這杯也好。」',consequences:{energy:5,memo:'喝了一杯不是自己點的咖啡'}},{text:'「我點的是拿鐵。」',consequences:{advance:0.15}}]} ] },
  { id:'ev_almost_late', title:'快遲到', participants:[], location:'campus', trigger:'enter', weekday:[2], time:[9.9,10.25], day_min:3, cooldown_days:6, background:'freeze',
    dialogue:[ {speaker:null,text:'十點二十的課。你看了一眼手機，開始用走的假裝自己沒有在跑。'} ], consequences:{goal:'霖澤館：上課'} },
  { id:'ev_course_selection', title:'選課結果', participants:[], location:'dorm', trigger:'enter', day_min:5, once:true, time:[7,12], background:'freeze',
    dialogue:[ {speaker:null,text:'選課結果出來了。通識「城市與散步」——沒選上。備取十七。'},{choice:[{text:'加簽。下週去教室堵老師。',consequences:{flags:{ge_walk_waitlist:true},memo:'通識「城市與散步」備取，打算加簽'}},{text:'算了，下學期再選。',consequences:{memo:'通識「城市與散步」沒選上，下學期再選'}}]} ] },   /* 交接包 v1 第 1 節：祐廷本來就要重修經原（必修），不設 ge_econ */
  { id:'ev_forgot_book', title:'忘記還書', participants:[], location:'library', trigger:'enter', day_min:6, cooldown_days:7, random_weight:0.4, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台叫住你：「同學，你有一本《民法總則》逾期三天。」'},{choice:[{text:'繳罰款（30 元）',consequences:{money:-30}},{text:'「我明天拿來。」',consequences:{flags:{book_overdue:true}}}]} ] },
  { id:'ev_midnight_snack', title:'考前宵夜', participants:['zhe'], location:'dorm', trigger:'enter', day_min:10, time:[22,24.5], cooldown_days:5, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'手機震了一下。阿哲：「宵夜。公館。現在。明軒也在。」'},{choice:[{text:'「來了。」',consequences:{mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'考前宵夜'}],rel:{zhe:{fam:3,comf:3}},energy:-6,money:-90,advance:1,memo:'考前跟阿哲他們去吃宵夜'}},{text:'「我明天要上台報告，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE',note:'考前宵夜'}]}},{text:'「我晚點去找你們。」',consequences:{rel:{zhe:{fam:1}},advance:0.5}}]} ] },
  { id:'ev_bike_flat', title:'腳踏車沒氣', participants:[], location:'campus', trigger:'enter', day_min:4, cooldown_days:6, random_weight:0.3, time:[7,20], background:'freeze',
    dialogue:[ {speaker:null,text:'腳踏車架旁邊有人蹲著看自己的後輪。沒氣。他抬頭看你，像在問你有沒有打氣筒。'},{choice:[{text:'「校門口有打氣筒。」',consequences:{energy:-1}},{text:'（假裝沒看到）',consequences:{}}]} ] },
  // ── 考試：刑訴小考（第三週起的週二）──
  { id:'ev_quiz_crimpro', term:['Y3S1'], title:'刑訴小考', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], day_min:13, cooldown_days:13, prereq:{flags:['crimpro_attended']}, background:'freeze', mainSide:'right', player_seat:[1,3], priority:20,
    dialogue:[ {speaker:'prof_lin',expression:'neutral',text:'「今天先小考。三題，不算分，但我會記得誰寫對。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她說不算分的時候，都很算分。'},{legal:{context:'quiz',by:'prof_lin',pick:{prefer:'confused'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{section:'強制處分'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{},quiet:true}},{speaker:'prof_lin',expression:'smile',text:'「收卷。下週講強制處分。」'} ],
    consequences:{advance:1.7,energy:-8,memo:'刑訴小考',flags:{crimpro_quiz_done:true}} },
  // ── 研究所：說明會 ──
  { id:'ev_grad_info_session', title:'法研所說明會', participants:['npc_ta_chen','heroine_05'], location:'wancai', trigger:'enter', weekday:[5], time:[14.8,16.2], day_min:5, once:true, background:'blur',
    dialogue:[ {speaker:null,text:'萬才館大廳擺了二十張椅子。海報：「法律學研究所 招生說明會」。坐了七個人，大部分是大三。'},{speaker:'npc_ta_chen',expression:'neutral',text:'「我是碩二的陳冠廷，刑事法組。先講結論：研究所不是延長大學，是換一種讀法。」'},{speaker:'heroine_05',expression:'serious',text:'「一年級的也可以留下來聽，不會有人趕你。」'},{speaker:'npc_ta_chen',expression:'thinking',text:'「筆試考申論，口試問你的研究計畫。最常被問倒的問題是：你為什麼要研究這個？」'},{choice:[{text:'留下來聽完',consequences:{grad:{bump:'聽了法研所說明會'},advance:1,energy:-4,mem:[{npc:'npc_ta_chen',tag:'FIRST_MET'},{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'說明會'}],memo:'聽了法研所說明會'}},{text:'聽十分鐘就走',consequences:{advance:0.2}}]} ] },
  { id:'ev_grad_reading', title:'學姊給的文章', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:7, once:true, prereq:{grad:{min:'CONSIDERING'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'你真的在想研究所？……好。這篇。三十頁。讀完再來找我，我們吵一次。'},{set:{grad_reading:true},note:{id:'grad_reading',title:'學姊給的文章','body':'一篇公法的期刊論文。三十頁。讀書時可以選「讀研究所準備的文章」，讀三次才算讀完。'}},{speaker:'heroine_05',expression:'smile',text:'不要用螢光筆。用鉛筆，寫你不同意的地方。'} ], consequences:{mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'給你一篇文章'}]} },
  { id:'ev_grad_debate', title:'和溫學姊吵一次', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, prereq:{flags:['grad_read_done']}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'讀完了？好。第二節，作者說比例原則在這個案型「只能」這樣用。你同意嗎？'},
      {choice:[
        {text:'「不同意。他把『必要性』直接跳過了。」',hint:'你的鉛筆字',rel:{heroine_05:{resp:6,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'跟她吵了必要性審查'}],goto:'agree_no'},
        {text:'「同意，但理由跟他寫的不一樣。」',rel:{heroine_05:{resp:4,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'同意結論、不同意理由'}],goto:'agree_diff'},
        {text:'「老實說，我不確定我讀懂了。」',rel:{heroine_05:{trust:4,fam:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'承認沒讀懂'}],goto:'unsure'} ]},
      {label:'agree_no'},{speaker:'heroine_05',expression:'smile',text:'……對。他跳過了。我第一次讀的時候沒看出來，是許老師指出來的。'},{speaker:'heroine_05',expression:'serious',text:'研究所就是這樣：找作者跳過的那一步，然後自己補。你可以。'},{consequences:{prof:{prof_xu:{kind:'research',delta:1,note:'學姊提到你讀了那篇文章'}}}},{goto:'end'},
      {label:'agree_diff'},{speaker:'heroine_05',expression:'thinking',text:'講你的理由。'},{speaker:'player',text:'（你講了十分鐘。她中間打斷你三次。）'},{speaker:'heroine_05',expression:'smile',text:'三次裡有一次你是對的。第一年能這樣就夠了。'},{goto:'end'},
      {label:'unsure'},{speaker:'heroine_05',expression:'neutral',text:'那你比大部分人誠實。大部分人會假裝懂，然後在口試的時候被問倒。'},{speaker:'heroine_05',expression:'smile',text:'再讀一次。這次我陪你讀第二節。'},{consequences:{advance:1}},
      {label:'end'},{speaker:'heroine_05',expression:'tired',text:'……我自己的研究計畫還沒改完。走了。'} ],
    consequences:{grad:{bump:'和學姊為一篇文章吵了一次',field:'公法'}} }
];
Array.prototype.push.apply(STORY_EVENTS,STORY_EVENTS_V11);
