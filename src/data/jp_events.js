/* ===== 日本那一學期的補稿 G0～G9（AA_341 第 3 節，AA-C 2026-10-20 定稿，企劃線 c2c5a66e；第①級，台詞照抄不改字）＋入境大廳（AA_253 9-2）＋挽回第 4、5 步（AA_253 第 5 節、AA_254 第 10 節）
   ＋大四下補修班的第一堂（AA_349 L8）。挽回中交換生群組每週那一則、便利商店點頭（AA_349 L1、L3）是手機與據點的一句，在 src/jp3d.js =====
   什麼時候演、誰演在 src/jp3d.js（JP.SCH 的表、JP.phone 的私訊）；這裡只有台詞（STORY_EVENTS，EVENTS.run 照一般事件演）。
   - 交往中＝和以安交往中（dating_heroine_01）；挽回中＝日本路線、不是交往中（AA_253 第 5 節：日本路線的玩家只有這兩種）。
   - AA 稿裡「以安：……」寫在旁白後面同一行的，拆成旁白一句、以安一句（字不改）；寫成一整句描述的（G7 偷看、G6 挽回中）照原樣當旁白一句。
   - 沒有背景圖的地方：深色底＋地點字幕（{scene}）；入境大廳沒有圖＝深色底。以安約的那一頓原本用商店街 jp_street_night（AA_341 第 5 節），AA_355 1-1 改成深色底＋「日本・學校後面的小餐館」。
   - 摘要日的一句（G0、G1 3/28、G4 挽回中、G7 6/28、G8 期末週、8/1、8/12）、一鍵上課的旁白（AA_185 1-5、G2 第一堂）、X2 回家那一句（AA_144）在 src/jp3d.js。 */
'use strict';
const JP_EVENTS=(function(){
  if(typeof STORY_EVENTS==='undefined') return [];
  const C=f=>({custom:f});
  const dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F.dating_heroine_01===true||!!(R.heroine_01&&R.heroine_01.status==='dating'); };
  const repair=G=>!dating(G);
  const memWinter=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_01','AN_L10_WINTER');
  const j2=G=>{ const v=G&&G.flags&&G.flags.AN_TOWN_NOTICE; return v==='there'||v==='photo'; };   /* 5/6 町公所那張通知（AA_326 2-Y3-43 的旗標：去了、或收到她的照片）*/
  const repairOk=G=>{ const R=G&&G.flags&&G.flags.REPAIR; return !!R&&typeof R==='object'&&(R.heroine_01|0)>=3; };   /* AA_254 第 10 節：REPAIR ≥ 3（G.flags.REPAIR.heroine_01，和 r2y3b3d.js 町公所那一步同一個；說謊歸零：日本這學期沒有說謊的事件）*/
  /* G0 3/11（六）14:00 公館：行李箱（交往中；3/10 21:00 她私訊、排出遊在 jp3d.js）*/
  const SUITCASE=[ {scene:'公館',bg:'gongguan'},
    {speaker:null,text:'（行李箱的店。她把每一個都推了一圈，聽輪子的聲音。）'},
    {speaker:'heroine_01',text:'這個比較安靜。公寓的走廊晚上會有回音。'},   /* AA_377 第 4 項：以安在大學城隔壁的小鎮租公寓（AA_341 裁定 1）；AA_426 第 5 節（967b4273a）拿掉「理由：」*/
    {choice:[{text:'「那我也買這個。」',goto:'g0_a'},{text:'「妳連這個都查了？」',goto:'g0_b'}]},
    {label:'g0_a'},{speaker:'heroine_01',text:'好。……兩個一樣的，在機場不要拿錯。'},{goto:'g0_end'},
    {label:'g0_b'},{speaker:'heroine_01',text:'交換生的論壇有寫。'},
    {label:'g0_end'},{set:{AN_JP_SUITCASE:true}} ];
  /* G1 3/27（一）10:00 國際學生辦公室報到（一鍵，地點字幕；入住是 3/25 抵達那天，AA_377 第 17 項）*/
  const OFFICE=[ {scene:'國際學生辦公室'},
    {speaker:null,text:'（國際學生辦公室。你們排在一列交換生的最後面。輪到你的時候，職員用很慢的日文說了一句話，你只聽懂「宿舍」。）'},
    {if:C(dating),speaker:null,text:'（以安在旁邊小聲翻譯。翻完她說：「我也只聽懂一半。剩下一半是猜的。」）'},
    {if:C(repair),speaker:null,text:'（以安排在你前面兩個人。她辦完，沒有回頭。）'},
    {set:{JP_OFFICE:true}},{advance:1} ];
  /* G3 4/19（三）18:30 宿舍的共用廚房（交往中；17:00 她私訊）*/
  const KITCHEN=[ {scene:'宿舍・共用廚房',bg:'jp_kitchen'},
    {speaker:null,text:'（宿舍的共用廚房。她把一袋菜放在流理台上，綁起頭髮。）'},
    {unless:C(memWinter),speaker:'heroine_01',text:'寒假我媽教我的那一道。'},
    {if:C(memWinter),speaker:'heroine_01',text:'寒假我媽教的那一道。你那時候問過。'},   /* 有 AN_L10_WINTER（知道媽媽寒假要教她一道菜）：第二句換這一句 */
    {speaker:'heroine_01',text:'……第一次一個人做。'},
    {choice:[{text:'「好吃。」',goto:'g3_a'},{text:'「跟妳媽做的比呢？」',goto:'g3_b'}]},
    {label:'g3_a'},{speaker:'heroine_01',text:'……哪裡好吃？'},{speaker:null,text:'（你說了一個地方。她點點頭，記在手帳上。）'},   /* AA_435 第 0 節（企劃線 0bb6e2fe6）：說出口的「理由」換掉 */{goto:'g3_end'},
    {label:'g3_b'},{speaker:'heroine_01',text:'我媽的比較鹹。……我的比較對。'},{speaker:null,text:'（她自己笑了一下。）'},
    {label:'g3_end'},{set:{AN_JP_KITCHEN:true}},{advance:1.5} ];
  /* G4 5/3（三）14:00 河邊（交往中；5/2 21:00 她私訊）*/
  const RIVER=[ {scene:'河邊',bg:'jp_riverbank'},
    {speaker:null,text:'（河邊的草地上坐滿了野餐的人。你們找到一棵樹的影子，她拿出一本書。）'},
    {speaker:'heroine_01',text:'你讀你的。我讀我的。'},
    {advance:1},{speaker:null,text:'（一個小時以後，她把書闔上。）'},
    {speaker:'heroine_01',text:'……這裡比總圖吵。可是我讀得比較快。'},
    {set:{AN_JP_RIVER:true}},{advance:1} ];
  /* G5 5/18（四）13:00 比較行政法：以安的報告（一鍵上課那一天換成這一段；挽回中只有報告那一段，下課後她先走）*/
  const ADMIN=[ {scene:'大學・教室',bg:'classroom_small'},
    {speaker:null,text:'（比較行政法。這一週的報告是以安。題目是行政指導。）'},
    {speaker:'heroine_01',text:'日本的行政指導，沒有強制力。可是大家都照做。'},
    {speaker:'heroine_01',text:'所以我想問的是：它到底是不是法律？'},
    {speaker:null,text:'（教授沒有回答。他說：「這一題，下一週大家都要想。」）'},
    {set:{AN_JP_REPORT:true}},
    {if:C(repair),end:true},
    {choice:[{text:'「妳的答案呢？」',goto:'g5_a'},{text:'「講得很好。」',goto:'g5_b'}]},
    {label:'g5_a'},{if:C(j2),speaker:'heroine_01',text:'還沒有。……五月六號那張通知以後，我一直在想。'},{unless:C(j2),speaker:'heroine_01',text:'還沒有。'},{goto:'g5_end'},   /* 有 J2 的才說後半 */
    {label:'g5_b'},{speaker:'heroine_01',text:'……哪一段？'},   /* AA_435 第 0 節 */
    {label:'g5_end'} ];
  /* G7 以安約的那一頓（AA_250 6-2 的三句）。AA_355 1-1（AA-C 2026-10-21）：6/9（五）21:00 她私訊約、「好。」＝6/10（六）18:30 出遊（src/jp3d.js 的 S.dinnerPhone；交往中或 FRIEND 以上），
     地點字幕「日本・學校後面的小餐館」、深色底（原本 AA_341 G7：6/16（五）19:00 自動演、商店街 jp_street_night）。不算學期末的飯（BB_203 第 9 點）。出遊演完照 hours 往後。
     AA_355 第 5 節（2f1aaa22）：4b 第一句「今天」改「昨天」（台大 6/9 考完，她 6/10 說）；4c 挽回中、冷靜中不約（jp3d.js）*/
  const DINNER=[ {scene:'日本・學校後面的小餐館'},
    {speaker:'heroine_01',text:'首都帝大昨天考完了。Alison 在群組說她要睡三天。'},
    {speaker:'heroine_01',text:'我們這邊七月底才考，還有一個多月。'},
    {speaker:'heroine_01',text:'八月五號那班，我跟你一起訂好了。'},
    {set:{AN_JP_DINNER:true}} ];
  /* G7 6/24（六）16:00 挽回第 4 步：河邊（AA_253 第 5 節第 4 步；REPAIR 照 AA_254 第 10 節）*/
  const REPAIR4=[ {scene:'河邊',bg:'jp_riverbank'},
    {speaker:'heroine_01',text:'那時候我很生氣，生氣到不想聽你講。'},
    {speaker:'heroine_01',text:'……現在可以聽了。你說。'},
    {choice:[{text:'「對不起。我那時候不知道怎麼說。」',goto:'r4_a'},{text:'「我知道。我不會再這樣。」',goto:'r4_b'}]},
    {label:'r4_a'},{speaker:'heroine_01',text:'……嗯。你那時候應該要說的。'},{set:{AN_REPAIR4:'sorry'}},{goto:'r4_end'},   /* REPAIR +1（jp3d.js 的 after，一週最多 +1）*/
    {label:'r4_b'},{speaker:'heroine_01',text:'你上次也是這樣想的吧。'},{set:{AN_REPAIR4:'promise'}},
    {label:'r4_end'},{advance:1} ];
  /* G7 7/7（五）七夕，交往中（本檔補；AA_253 第 5 節只寫了挽回的版本）*/
  const TANABATA=[ {scene:'宿舍門口',bg:'jp_dorm_gate'},
    {speaker:null,text:'（宿舍門口立了一枝竹子，掛滿了短冊。）'},
    {speaker:'heroine_01',text:'一人一張。寫願望。'},
    {speaker:'heroine_01',text:'……我寫好了。你不要看。'},
    {choice:[{text:'寫「下學期也一起讀書」',goto:'t7_a'},{text:'寫「明年也來」',goto:'t7_b'},{text:'（偷看她的）',goto:'t7_c'}]},
    {label:'t7_a'},{speaker:'heroine_01',text:'這個不用許願。'},{goto:'t7_end'},
    {label:'t7_b'},{speaker:'heroine_01',text:'……明年我們在臺灣。'},{goto:'t7_end'},
    {label:'t7_c'},{speaker:null,text:'她把短冊按住：「說了不要看。」（過了一下，她把手移開。）短冊上寫著：「明年的七夕，在臺灣。」'},
    {label:'t7_end'},{set:{AN_TANABATA_JP:true}} ];
  /* G7 7/7 挽回中（AA_253 第 5 節第 5 步）：REPAIR 到了＝短冊「再一次。理由：我想。」→ 重新交往（jp3d.js 的 after）；沒到＝只演前兩句（她把短冊掛上去，沒有給你看）*/
  const TANABATA_R=[ {scene:'宿舍門口',bg:'jp_dorm_gate'},
    {speaker:null,text:'（宿舍門口的竹子上掛滿了短冊。以安拿著一張，寫了很久。）'},
    {speaker:'heroine_01',text:'你要看嗎？'},
    {unless:C(repairOk),set:{AN_TANABATA_JP_REPAIR:'hung'}},{unless:C(repairOk),end:true},
    {speaker:null,text:'（短冊上只有一行：「再一次。理由：我想。」）'},
    {speaker:'heroine_01',text:'……不准賴。'},
    {set:{AN_TANABATA_JP_REPAIR:'again',AN_JP_RECONCILED:true}} ];
  /* G8 7/17（一）海之日（交往中；7/16 21:00 她私訊）：摘要一段，2D 深色底＋字幕「海邊」*/
  const SEA=[ {scene:'海邊'},
    {speaker:null,text:'（你們搭了一個小時的電車。她在海邊脫了鞋，走到水剛好淹過腳踝的地方。）'},
    {speaker:'heroine_01',text:'比淡水的冷。'},
    {speaker:null,text:'（回來的時候，兩個人的手臂都曬紅了。）'},
    {set:{AN_JP_SEA:true}},{advance:G=>Math.max(0,18-((G.hour%24)))} ];
  /* G8 8/4（五）22:00 最後一個晚上的便利商店（交往中、挽回成功；接 3/26 J1）。jp_konbini 的窗外有雪（3 月底那一張），8 月不用：深色底＋字幕 */
  const LAST=[ {scene:'便利商店'},
    {speaker:null,text:'（宿舍附近的便利商店。和第一個晚上同一間。）'},
    {speaker:'heroine_01',text:'第一個晚上，你在這裡看不懂標籤。'},
    {speaker:'heroine_01',text:'……現在看得懂了嗎？'},
    {choice:[{text:'「看得懂一半。」',goto:'l8_a'},{text:'「妳教我的。」',goto:'l8_b'}]},
    {label:'l8_a'},{speaker:'heroine_01',text:'一半夠了。另一半，明年再來看。'},{goto:'l8_end'},
    {label:'l8_b'},{speaker:'heroine_01',text:'我只教你看字。標籤是你自己看懂的。'},   /* AA_435 第 0 節 */{speaker:null,text:'（她把兩個飯糰放進籃子。）'},
    {label:'l8_end'},{set:{AN_JP_LASTNIGHT:'together'}} ];
  const LAST_ALONE=[ {scene:'便利商店'},
    {speaker:null,text:'（最後一個晚上。你一個人去了便利商店。冷藏櫃的燈，和第一個晚上一樣亮。）'},
    {set:{AN_JP_LASTNIGHT:'alone'}} ];
  /* 8/5 入境大廳（AA_253 9-2 日本欄；AA_341 裁定 3：「……好熱。」）。挽回不成的：旁白一句 */
  const HALL=[ {scene:'桃園機場・入境大廳',bg:'airport_arrival'},
    {if:C(dating),speaker:null,text:'（自動門一打開，臺灣的熱氣撲過來。）'},
    {if:C(dating),speaker:'heroine_01',text:'……好熱。'},
    {if:C(dating),speaker:'heroine_01',text:'明天有空的話，打給我。'},
    {if:C(dating),speaker:null,text:'（她媽媽在出口等。她跑過去，又回頭跟你揮手。）'},
    {if:C(repair),speaker:null,text:'（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）'},
    {set:{JP_HALL:true}} ];
  /* 大四下補修班的第一堂（AA_349 L8，AA-C 2026-10-21 新寫；AA_144 X4）：classes3d.js 的 beforeClass（第一次去上那一門、開始以前；之後的補修課照一般上課）。
     民訴甲下＝週一上午；保險法＝AA_144 寫週三上午（會撞選修海商法，courses.js 換到沒撞課的週四上午），第一堂照樣是這一句。以安不延畢（AA_285），補修班裡沒有她 */
  const REDO_CIVPRO=[
    {speaker:null,text:'（補修班。教室裡都是大三的學弟妹。你坐在最後一排，旁邊的學弟看了你兩次。）'},
    {speaker:'學弟',text:'學長，你也來補這門喔？'},
    {choice:[{text:'「交換回來補的。」',goto:'re_a'},{text:'「嗯。」',goto:'re_b'}]},
    {label:'re_a'},{speaker:'學弟',text:'喔，日本！那邊的民訴也這樣上嗎？'},{speaker:null,text:'（你想了一下，說不出一樣還是不一樣。）'},{goto:'re_end'},
    {label:'re_b'},{speaker:null,text:'（他沒有再問，把講義往你這邊推了一點。）'},
    {label:'re_end'},{set:{JP_REDO_CIVPRO:true}} ];
  const REDO_INS=[ {speaker:null,text:'（保險法。老師點名點到你，停了一下：「交換回來的？」你點頭。他在名單上打了一個勾。）'},{set:{JP_REDO_INS:true}} ];
  const ev=(id,title,dialogue,o)=>Object.assign({id,title,participants:[],location:'any',trigger:'manual',once:true,background:'dark',dialogue},o||{});
  const EV=[
    ev('ev_jp_suitcase','行李箱',SUITCASE,{participants:['heroine_01'],trigger:'outing',hours:1.5}),
    ev('ev_jp_office','國際學生辦公室',OFFICE),
    ev('ev_jp_kitchen','共用廚房',KITCHEN,{participants:['heroine_01']}),
    ev('ev_jp_goldenweek','黃金週',RIVER,{participants:['heroine_01']}),
    ev('ev_jp_admin_report','比較行政法',ADMIN),
    ev('ev_jp_dinner','以安約的那一頓',DINNER,{participants:['heroine_01'],trigger:'outing',hours:1.5}),   /* AA_355 1-1：出遊（6/10 18:30）*/
    ev('ev_jp_repair_river','河邊',REPAIR4),
    ev('ev_jp_tanabata','七夕',TANABATA,{participants:['heroine_01']}),
    ev('ev_jp_tanabata_repair','七夕',TANABATA_R),
    ev('ev_jp_sea','海之日',SEA,{participants:['heroine_01']}),
    ev('ev_jp_lastnight','最後一個晚上',LAST,{participants:['heroine_01']}),
    ev('ev_jp_lastnight_alone','最後一個晚上',LAST_ALONE),
    ev('ev_jp_return_hall','入境大廳',HALL),
    ev('ev_jp_redo_civpro','補修班',REDO_CIVPRO,{trigger:'class',beforeClass:'civpro_2_re',term:['Y4S2'],background:'blur'}),
    ev('ev_jp_redo_insurance','補修班',REDO_INS,{trigger:'class',beforeClass:'insurance_re',term:['Y4S2'],background:'blur'}) ];
  for(const e of EV){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
  return EV.map(e=>e.id);
})();
