/* ===== PLAN-1016-ROM 剩下的三場（BB_165，企劃線 a54ec2b4a：第 3～5、9 節 AA-C 2026-10-18 審過、BB-C 2026-10-21 照 AA_360 標註；台詞照原文、不改字）=====
   ev_zhiruo_his_order　3-1 玩家先說的版本：你點的那一杯（大三下、Z13 以前，兩點半 Café 她在吧檯；觸發在 src/rom1016_3d.js 的點餐選項）
   ev_peishan_waited　5-1 被等的感覺（大三上 2027-11-19（五）18:40 台南・課輔班門口；交往中；邀約、沒到、改期在 src/rom1016_3d.js）
   ev_peishan_red_pen　5-2 她的紅筆（大四上 2028-11-17（五）19:30 台南・她學校附近的咖啡店；交往中、祐廷在台灣）
   可昕 K7 第一年週年卡片的後面幾頁（第 9 節）是宿舍的房間物件，不是事件：頁面在 PAGES（src/rom1016_3d.js 的 STORY.ROOM_EXTRA）。
   沛珊 5-1：AA_360 第 3 節拿掉「她用祐廷對她的方式」的錨點，場面台詞不動（她會等學生問完，是因為她國中的老師這樣等過她）。
   測試：node tests/rom1016_unit.js */
'use strict';
const ROM1016_EVENTS=(function(){
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const cg=id=>({if:{custom:()=>hasCG(id)},cg:id});   /* CG 登錄了才放（同 r2y3b_events.js）*/
  const X=()=>typeof ROM1016!=='undefined'?ROM1016:null;
  const to=h=>({advance:G=>Math.max(0,h-G.hour)});

  /* ---------- 3-1 你點的那一杯（BB_165 3-1；BB_167 L5 已改進原檔）：她做好、正要推過來——你推回去。兩個選項結果一樣：交往、ZR_HE_ORDERED；Z13 不再觸發（r2y3b3d.js 的 z13Ready 看這個事件演過沒有）。
     CG：BCG-08「杯子上的字」同一張（杯身的疊字「熱可可＋濃縮」「你點的」還沒做，同 Z13）；放在她看著杯子那一句 ---------- */
  const HIS_ORDER={ id:'ev_zhiruo_his_order', title:'你點的那一杯', participants:['heroine_02'], location:'cafe', trigger:'manual', once:true, background:'blur',
    dialogue:[ {consequences:{money:-120,inc:{CAFE_VISITS:1}}},   /* 點的是她那一杯（照 Z1「也幫芷若點」的價錢 120）；點餐次數 +1 */
      {speaker:null,text:'（她做好，正要推到你面前。你把杯子推回她那一邊。）'},
      {speaker:'heroine_02',text:'……這是我的點法。'},
      {speaker:'player',text:'嗯。這杯是給妳的。'},
      cg('cg_cup_words_heroine02'),
      {speaker:null,text:'（她看著杯子很久。）'},
      {speaker:'heroine_02',text:'……你怎麼記得。'},
      {speaker:'heroine_02',text:'這個我只做給你喝過。'},
      {choice:[{text:'「我沒有要還妳。」',goto:'a'},{text:'「妳不喝，我就自己喝。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（她笑出來，眼眶紅了一下。）'},{speaker:'heroine_02',text:'……那我喝了。'},{speaker:'heroine_02',text:'很幼稚耶。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（她把杯子拿起來，雙手捧著）'},{speaker:'heroine_02',text:'……不行，這杯我的。'},
      {label:'end'},{set:{ZR_HE_ORDERED:true}},{call:G=>{ const x=X(); if(x) x.hisOrderStart(G); }} ] };

  /* ---------- 5-1 被等的感覺（BB_165 5-1；BB_167 L1、L2 已改進原檔）：18:40 到，隔著玻璃門看她上課；19:00 下課 ---------- */
  const WAITED={ id:'ev_peishan_waited', title:'被等的感覺', participants:['classmate_peishan'], location:'any', trigger:'outing', background:'dark', hours:1.75,   /* 九點送到車站以後的高鐵（1 小時 45 分，同 ev_hv_ps_tn）*/
    beforeOuting:(G,GM,q)=>{ const x=X(); if(x) x.fare(GM); },
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.waitedMissed(G,q); },
    dialogue:[ {scene:'台南・課輔班',bg:'cram_class'},   /* 2D：cram_class 借用（bg_approved 用途欄寫了「其他補習班的場景」）*/
      {speaker:null,text:'（隔著玻璃門。她站在白板前面，一個小男生舉手問了什麼。她沒有回答，蹲下來，和他一樣高，等。）'},
      {speaker:null,text:'（你在門外看了三分鐘。她一句答案都沒有說。最後小男生自己說了一句，她在他的作業本上畫了一個紅筆笑臉。）'},
      to(19),
      {speaker:'classmate_peishan',text:'（下課，走出來）你看到了嗎？'},
      {speaker:'classmate_peishan',text:'他問我，為什麼負負得正。我沒有回答。我問他：「你覺得呢？」'},
      {speaker:'classmate_peishan',text:'他想了三分鐘。……答錯了。可是他自己想了三分鐘。'},
      {speaker:null,text:'（她把紅筆蓋上，看了你一眼。）'},
      {speaker:'classmate_peishan',text:'你怎麼都不講話？'},
      {choice:[{text:'「他後來有算對嗎？」',goto:'a'},{text:'「下次換我問，妳等我。」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_peishan',text:'還沒。他說下禮拜要再問一次。'},{goto:'c'},
      {label:'b'},{speaker:'classmate_peishan',text:'好。……那你要問難一點的。太簡單的我會忍不住回答。'},
      {label:'c'},{speaker:'classmate_peishan',text:'走吧，我好餓。'},
      {call:(G,GM)=>{ const x=X(); return x?x.ladder(GM):null; }},   /* 私下約那一天推進一層閒聊階梯（AA_349 K4；hometown3d.js 的 HV.ladder）*/
      to(21),
      {speaker:null,text:'（晚餐在她學校後門的小麵店。九點，她送你到車站。）'},
      {set:{PS_WAITED:true}} ],
    after:G=>{ const x=X(); if(x) x.visit(G); } };

  /* ---------- 5-2 她的紅筆（BB_165 5-2；BB_167 L4 已改進原檔）：底圖缺（AA_282 第 5 節），沒有以前用深色底＋地點字幕 ---------- */
  const RED_PEN={ id:'ev_peishan_red_pen', title:'她的紅筆', participants:['classmate_peishan'], location:'any', trigger:'outing', background:'dark', hours:1.75,
    beforeOuting:(G,GM,q)=>{ const x=X(); if(x) x.fare(GM); },
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.redPenMissed(G,q); },
    dialogue:[ {scene:'台南・她學校附近的咖啡店',bg:'dark'},
      {speaker:null,text:'（她改完第十二本作業，抬頭看你的筆記。）'},
      {speaker:'classmate_peishan',text:'欸，你的可以給我改嗎？'},
      {speaker:null,text:'（她拿走你寫了一半的那一題。她看不懂法律，紅筆在第三段停住。）'},
      {speaker:'classmate_peishan',text:'這裡你寫得特別快。'},
      {speaker:'classmate_peishan',text:'我學生寫快的地方，通常是還沒想清楚。'},
      {speaker:null,text:'（你看了第三段。……她說對了。）'},
      {speaker:null,text:'（她在旁邊畫了一個笑臉，沒有說話，把本子推回來。）'},
      {choice:[{text:'「妳比我的老師還準。」',goto:'a'},{text:'「那妳的作業，換我改一本。」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_peishan',text:'我又看不懂法律。我只是看你哪裡寫得快。'},{goto:'c'},
      {label:'b'},{speaker:'classmate_peishan',text:'不行。……好啦，你改一本。只能畫笑臉，不能打分數。'},
      {label:'c'},{call:(G,GM)=>{ const x=X(); return x?x.ladder(GM):null; }},
      to(21.5),
      {speaker:null,text:'（九點半，她陪你走到車站。）'},
      {set:{PS_RED_PEN:true}} ],
    after:G=>{ const x=X(); if(x) x.visit(G); } };

  /* 5-2 沒到的短版（「這裡你寫得特別快」到畫笑臉那幾句）：下一次當面的私下約（去台南、台中；台南的學期末飯、公開課）在送上車以前演（src/rom1016_3d.js，OUT.AFTER）*/
  const RED_PEN_SHORT=[ {who:'classmate_peishan',text:'這裡你寫得特別快。'},{who:'classmate_peishan',text:'我學生寫快的地方，通常是還沒想清楚。'},
    {narr:'（你看了第三段。……她說對了。）'},{narr:'（她在旁邊畫了一個笑臉，沒有說話，把本子推回來。）'} ];

  /* 手機（私訊；BB_165 原文，句尾不加標點）。opts：祐廷的回答→她的回覆 */
  const MSG={
    waitedAsk:['這週五你會來嗎','課輔班七點下課。你可以早二十分鐘到嗎','想讓你看一個東西，不是什麼大事'],
    waitedYes:['好。我搭下午的高鐵。','好！！'], waitedNo:['這週可能不行。','好，沒關係～'],
    waitedMiss1:['你沒來得及','沒關係，下週五同一個時間，他說要再問一次'],
    waitedMiss2:['上禮拜那個小朋友今天又問了一次，我還是叫他自己想','想了三分鐘，答錯，可是他很得意'],
    redPenAsk:['週五七點下課，七點半在我們學校後門那間咖啡店','我帶作業，你帶你的'],
    redPenYes:['好。','好！！'], redPenNo:['這週不行。','好～那下次'],
    redPenMiss:['📷（十二本作業疊好，最上面一本畫了一個笑臉。）','十二本改完了','你的那一題下次帶來，我幫你改'] };   /* 照片＝「📷（…）」（同 story3d.js 的週年卡片照片）*/

  /* 可昕 K7 第一年週年卡片的後面幾頁（第 9 節，AA-C 10-18 重寫）：第 1 頁是房間物件原本那一句（AA_303 第 2 節 9），這裡是第 2 頁起；第 5 頁照 7/24 的選擇（KH_GO）。
     最後一頁一直空白（口氣表 0-4：週年卡片最後一頁手寫那句不算「假設」的次數）*/
  const PAGES={ p2:'2024.8.23　遊覽車。你睡了一個小時。我手上那張名單，其實早就背好了。',
    p3:'2024.10.17　你說：說完妳可以下車。……想得美。',
    p4:'2025.2.2　蓮池潭。你說一起重考的時候，風把我的頭髮全吹到臉上。',   /* AA_529 第 4 節：「一起重考」現在是 2/2 高雄蓮池潭說的（AA_303 第 15 列）；原本「2025.2.13　水餃店。……筷子掉了兩次。」*/
    p5bus:'2025.7.25　我說我先回家。其實我在客運站對面坐了一個下午，六點半才傳給你。',
    p5home:'2025.7.25　掛掉電話以後，那幾句我打了又刪，刪到十點半。',
    last:'假設明年的今天，你還在——', blank:'（下面空白。）' };

  const ALL=[HIS_ORDER,WAITED,RED_PEN];
  ALL.RED_PEN_SHORT=RED_PEN_SHORT; ALL.MSG=MSG; ALL.PAGES=PAGES;
  return ALL;
})();
Array.prototype.push.apply(STORY_EVENTS,ROM1016_EVENTS);
