/* ===== 同弦樂器（吉他店）、加入吉他社要買吉他、吉他社社遊（AA_619，企劃線 c4b14a901〔22a6c4d43 第一版；bf0efded8 三處「公館」改「新生南路」；c4b14a901 頂樓「問了」那一句〕
   ＋同一個 commit 的 AA_693（回 LAWWW 的缺字 11 處、判斷 14 件：缺的字照表抄、兩句描述加括號、社長那一句加「買弦也有。」），AA-C 定稿 D109；
   任務 AA619-GUITAR-1104（系統，LAWWW）、GUITAR-SHOP-ZONE-1105（室內區域 xs_tongxian，LAWWW2，D108）；USER_WANTS X196）=====
   台詞照稿一字不改（S.L、S.D21、S.D21_OWN、S.D_ENC、S.EVENTS；AA_693 補的字註「AA_693 A○」）；稿上沒有的字不寫——介面字只用遊戲裡已經有的（「不用了」「錢不夠」、日誌的「買了○○」、開放時間的寫法、
   出遊的「走路 約 10 分鐘」「走到校門口約 10 分鐘」、地點字幕「遊覽車上」「宜蘭・民宿」「新生南路」）；稿上沒有、遊戲裡也沒有的列在報告的缺字。
   第 1 節　同弦樂器（新生南路那一排的二樓店面；AA-C 11-05 00:45：就是 src/data/xinsheng_layout.js 的 tongxian，不搬；室內區域 id xs_tongxian）
     - 營業：src/data/places.js 的 hours.xs_tongxian（12:00～21:30、週一休）、颱風天關（typhoonShops）；新生南路的店門在 story3d.js 的 onInteract 擋（LAWWW2-C）。S.isOpen／S.closedText。
       打烊時人還在店裡（S.closeOut）＝站起來、21:30 那一刻（到 22:00；那天有開、不是颱風天）或這一趟進來時開著＝老闆「我們今天要打烊了。」（AA_700，取代 AA_693 A3）、回到新生南路騎樓的樓梯口外面（TX3.streetOut()）、照現在寫開放時間；
       週一、颱風天、讀檔回到更晚＝不說那一句。
     - 室內區域 xs_tongxian＝src/tongxian3d.js（TX3，LAWWW2-C；配置 src/data/tongxian_layout.js）：區域只放座位和出口；這裡包住 TX3.zone.build 加按鈕（S.buttons，照木曜日的寫法）：
         看看＝吉他牆兩點（配置 interact 的 wall_n、wall_s，kind look_guitars）、烏克麗麗那面牆（ukes，kind look_ukes；AA_693 A2），各一句旁白；買東西＝櫃台（buy）。try（子晴 CG 的站位）不放按鈕。
         試彈＝坐上試琴椅（座位 try_w、try_e，區域的按鈕「試彈」；STORY.onSeat 照配置的 seats 對位置）＝旁白一句：去過一次吉他社社課＝稿上「社課教的 C 和弦」那一句、還沒去過＝AA_693 A5 那一句；櫃台前的木凳沒有字。
         老闆：開門的時候站在櫃台後面（TX3.OWNER；S.populate，照木曜日用路人底模、不說話）。
         買東西＝老闆一句（三句輪流，一次進店說一句）→ 選單：民謠吉他 入門款 3,800、面單款 6,500、一包弦 350、Pick 20、移調夾 300、「不用了」；
           吉他社成員（CLUB_club_guitar）九折（入門款 3,420、面單款 5,850……，選項小字「九折」）；錢不夠＝「錢不夠」，不扣錢；買了＝扣錢、時間 +0.15 小時（照 story3d.js 的 counter）；
           吉他＝OWN_GUITAR（'entry'｜'solid'）、送一個琴袋、一次調音（旁白用 2-3 那一句「（老闆幫你調好音，把琴裝進琴袋。）」）、日誌「買了○○」；同一款買過就不再列；
           小東西＝G.guitar.items 記數量、旁白一句（三樣共用，AA_693 A11）。S.look／S.lookUkes／S.tryPlay／S.shop（參數 GM）也可以直接叫；按鈕 it.guitar＝'look'|'ukes'|'shop' 由 STORY.interact 分派。
           舊序章那一年按鈕藏起來。
     - 偶遇子晴（S.encDue／S.encounter，STORY.TICKS）：大一上第 6、10、14 週週六 15:00～16:00 人在店裡、認識她（FIRST_MET）、她在臺北＝她兩句、旁白一句；一個存檔一次；
       2-3 排過（和她約過同弦，不管去了沒）就不演（稿是「你也來這家？」）。
   第 2 節　加入吉他社、買吉他
     2-1 第一次社課（S.clubIn，CLS.CLUB_IN）：這是第一次去吉他社社課（以前沒有出席紀錄）＝子晴的初遇（ev_ziqing_club）演完、入座那一句之後，社長學長那一段、兩個選項；
         那一次的旁白換成鏽弦那一句（輪流的六句不往前）。舊存檔：以前去過社課＝不補。第一次去的時候已經有自己的琴＝「你也舉了」那一版（S.D21_OWN，AA_693 A4）：
         沒有選項、這次的旁白照常（不換鏽弦那一句，也不出 2-4 有琴那一句）。（2b0fac3da 那一版記的 c21＝'own'＝那時候沒演，之後也不補。）
     2-2 第 6 週週三社課結束（事件 ev_guitar_zq_invite，afterActivity）：沒有琴、認識子晴、這不是第一次社課（稿：「你還在用那箱的？」）、她在臺北＝她三句、兩個選項；
         「好，禮拜六。」＝GUITAR_SHOP_WITH_ZQ、排出遊 guitar_zq_shop（第 6 週週六 15:00 同弦樂器）；「我自己去就好。」＝她一句。第 6 週過了＝不演（舊存檔一樣），可以自己去同弦買。
     2-3 第 6 週週六 15:00（出遊 guitar_zq_shop → 事件 ev_guitar_zq_shop）：稿的幾句 → 三個選項（錢不夠的那一把變灰，按了只出「錢不夠」再選一次）→ 她的回答 →
         買了＝九折（3,420／5,850）、調音裝袋那一句 → 出來以後她一句（買不買都說）。CG cg_tongxian_trial_heroine04「同弦的試琴椅」：登錄了才出（BB 照 D127 跟使用者要）。
         之前已經自己買了琴＝不取消、照約見面（AA_693 A10）：她看了一眼你背的琴袋、陪她買弦那幾句，跳過試琴、買琴（沒有選項、沒有 CG），出來以後那一句照說。
         有 xs_tongxian 區域＝演之前換到店裡、試琴椅（已經有琴＝站在進門點，子晴在櫃台前）、模糊的 3D（OUT.STAGE）；沒有＝深色底＋地點字幕。
     2-4 之後的社課（包 CLS.clubNarr，不加數值、不懲罰）：有琴＝這學期第 7 週起、阿凱還是室友（STORY.kaiRoommate）多一句（一學期一次，第一次符合的那一堂出）；
         沒有琴＝偶爾（照日期，約三分之一；第一次社課、上一堂剛出過的不算）換成第三弦那一句。兩種都不讓輪流的六句往前。
     宿舍「彈吉他」（房間裡的按鈕 S.dormButton，有 OWN_GUITAR；11-05 起不在「看看房間裡的東西」裡面）：轉暗、30 分鐘、旁白兩句隨機一句（阿凱不是室友了＝只有第二句）。
   第 3 節　吉他社社遊（群組 g:guitar；條件：吉他社成員、去過兩次以上社課；舊序章那一年、人在國外不排）
     3-1 宜蘭兩天一夜：大一上第 11 週週一 21:00（社課結束）社長學長在群組貼報名表，報名／不報名（回到出發為止）；報名＝扣 2,500、排出遊（11/22 08:00 校門口，只有「出發」）；
         錢不夠＝你在群組說「下次吧。」、沒有報名、不扣錢。不報名＝照選項傳出去。撞到同一天的活動＝人在宜蘭，那些照錯過處理（不懲罰）。
         事件 ev_guitar_trip_yilan：遊覽車上 → 14:00 外澳海邊 → 19:00 宜蘭・民宿（烤肉、輪到你：有琴＝拿出自己的琴，沒有＝子晴遞琴；AA_693 A6）→ 隔天 00:15「十二點多」上頂樓／回房間（A7）
         → 上頂樓＝民宿頂樓 → 08:30 卜肉、14:00 羅東（A8；沒有圖、稿上沒有地點字幕＝深色底）→ 15:00 回程遊覽車 → 17:00 回到學校。回房間＝那一句、沒有頂樓，回程用沒去的那一版。
         輪到你、沒有自己的琴、選了彈＝借子晴的（BORROWED_ZQ_GUITAR）；頂樓＝ZQ_ROOFTOP_TUNE、子晴的記憶 HEARD_HER_SONG；CG cg_yilan_roof_heroine04 登錄了才出。
     3-2 陽明山一日：大一下第 10 週週一 21:00 社長學長那一句＋報名；600；5/2 10:00 校門口（出發那一句，AA_693 A9）→ 14:00 擎天崗草原 → 18:00 回到學校（事件 ev_guitar_trip_yms）。
     3-3 和子晴交往中：頂樓最後一句換「……你明天坐我旁邊。」；在和別人交往的照樣去、照演。兩場的那段時間子晴的作息是「吉他社社遊」（STORY.SCHED_X），校園、公館遇不到她。
   存檔：G.guitar＝{items:{entry,solid:買的那天, strings,pick,capo,case:數量}, tuned:調音那天, boss:老闆說過幾句（輪到第幾句）, c21:第一次社課那天（舊版的 'own'）,
         enc:偶遇那天, narrX:{學期:有琴那句那天}, loanDay:第三弦那句那天, dorm:彈過幾次, trip:{y1s1,y1s2:'yes'|'no'|'poor'}}——舊存檔沒有＝game3d.js defaults 補 {items:{}}、S.rec 重設壞掉的欄位；
         旗標 OWN_GUITAR、GUITAR_SHOP_WITH_ZQ、BORROWED_ZQ_GUITAR、ZQ_ROOFTOP_TUNE；子晴的記憶 HEARD_HER_SONG（大一下「她在做的東西」ev_ziqing_secret_game 開頭一句，src/data/events.js；
         人物面板的名稱照 AA_693 A1「宜蘭民宿頂樓，她彈了自己寫的那一段」，src/social3d.js）。
   測試：node tests/aa619_guitar_unit.js */
'use strict';
const GUITAR=(function(){
  const S={};
  const ZQ='heroine_04', CLUB='club_guitar';
  S.ZONES=['xs_tongxian'];   /* 室內區域 id：xs_tongxian（src/tongxian3d.js；新生南路的店門照 'xs_'+店 id 接，LAWWW2-C）*/
  S.PLACE='xs_tongxian';   /* PLACES 的鍵（名稱、開放時間、颱風天）*/
  S.PRES='npc_guitar_pres';   /* 群組裡的社長學長（不在 CHARACTERS）*/
  const law=G=>!!G&&(G.stage||'law')==='law';
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const term=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const wd7=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:null;   /* 0＝週日（G.weekday 的寫法）*/
  const knows=G=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(ZQ,G):!!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(ZQ,'FIRST_MET'));
  const present=G=>typeof STORY==='undefined'||!STORY.present||!!STORY.present(ZQ,G);
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(G);
  const dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ZQ]===true||!!(R[ZQ]&&R[ZQ].status==='dating'); };
  const fmt=n=>Number(n).toLocaleString('en-US');
  const BOSS={name:'老闆'};
  S.rand=()=>Math.random();
  /* ---------- 台詞（AA_619，一字照抄）---------- */
  S.L={
    look:'（牆上的吉他從三千多到三萬多。最貴的那把，標籤寫「不賣，老闆的」。）',
    ukes:'（烏克麗麗掛成一排，顏色都不一樣。最小的那把，比你的手臂還短。）',   /* AA_693 A2：烏克麗麗那面牆的「看看」*/
    tryPlay:'（你拿下一把，彈了社課教的 C 和弦。老闆從櫃檯抬頭看了一眼，又低頭。）',
    tryNovice:'（你拿下一把，不知道手指要按哪裡，只撥了一下空弦。老闆從櫃檯抬頭看了一眼，又低頭。）',   /* AA_693 A5：試彈、還沒去過社課 */
    boss:['先買好彈的，不要先買好看的。','弦一個月換一次。你們學生都半年才換。','手指痛是正常的，痛兩個禮拜就不痛了。'],   /* 第 1 節：老闆的話（輪流）*/
    /* AA_693 A3 的打烊那一句（closeBoss）作廢，照 AA_700：老闆「我們今天要打烊了。」（XSCLOSE.say，下面 S.closeOut）*/
    tuned:'（老闆幫你調好音，把琴裝進琴袋。）',   /* 2-3；第 1 節「買了吉他送一個琴袋、一次調音」一個人來買也用這一句（AA_693 B：照現在）*/
    smallBag:'（老闆把東西裝進一個小紙袋，順手夾了一張收據。）',   /* AA_693 A11：買小東西（弦、Pick、移調夾）以後，三樣共用 */
    c21Narr:'（社團的吉他弦很鏽。按下去手指留了一條黑線。）',   /* 2-1：這次社課的旁白換成 */
    ownNarr:'（你的琴放在宿舍床邊。阿凱說你半夜彈太大聲。）', loanNarr:'（社團那把吉他的第三弦又鬆了。學長幫你調了兩次。）',   /* 2-4 */
    dorm:['（你練了刷法。阿凱戴上耳機。）','（你彈了一首社課教的歌，彈到副歌就忘了。）'], dormLabel:'彈吉他',   /* 2-4 宿舍房間 */
    yilanPost:'社遊 11/22–23 宜蘭，民宿兩天一夜，兩千五（含車、住、早餐）。要帶琴喔。', ymsPost:'這學期社遊一天就好，陽明山野餐。',   /* 3-1、3-2 */
    sign:'報名', noSign:'不報名', poor:'下次吧。',
    labels:{look:'看看',ukes:'看看',try:'試彈',shop:'買東西'} };   /* 烏克麗麗的按鈕也是「看看」（AA_693 A2）*/
  /* 對話（事件引擎的寫法，EVENTS.runLines）*/
  const N=t=>({speaker:null,text:t}), Z=(t,o)=>Object.assign({speaker:ZQ,expression:'neutral',text:t},o||{}), PR=t=>({speaker:'社長學長',text:t}), B=t=>({speaker:'老闆',text:t});
  const DH={custom:G=>dating(G)};
  S.D21=[ N('（社長學長拍拍手。）'), PR('有自己吉他的舉手。'), N('（一半的人舉手。你沒有。）'),
    PR('沒有的先用社團的，前面那箱。前兩個禮拜先借，之後最好自己買一把。……不用貴，三四千就有好彈的。'), PR('新生南路有一家同弦，報吉他社打九折。買弦也有。'),   /* AA_693 B：兩版都加「買弦也有。」*/
    {choice:[{text:'「好。」',goto:'c21_end'},{text:'「一定要買嗎？」',goto:'c21_must'}]},
    {label:'c21_must'}, PR('不買也可以啊，社團的琴一直都在。只是那箱弦有點鏽。'),
    {label:'c21_end'} ];
  /* AA_693 A4：第一次社課就已經有自己的琴＝「你也舉了」那一版，沒有選項 */
  S.D21_OWN=[ N('（社長學長拍拍手。）'), PR('有自己吉他的舉手。'), N('（一半的人舉手。你也舉了。）'),
    PR('沒有的先用社團的，前面那箱。前兩個禮拜先借，之後最好自己買一把。……不用貴，三四千就有好彈的。'), PR('新生南路有一家同弦，報吉他社打九折。買弦也有。'),
    N('（坐你旁邊借社團琴的人，伸手按了一下你的弦。）') ];
  S.D_ENC=[ Z('你也來這家？……這家老闆不會一直推銷，我喜歡。'), N('（她拿了一包弦就走。走到門口又回頭。）'), Z('0.12 的。不要買太細的，你手會更痛。') ];
  S.D_ZQPICK={entry:[Z('那就那把。……貴的你現在也彈不出差別。')],solid:[Z('嗯。你聽得出來，那就值得。')],none:[Z('好。不要讓別人幫你決定。我也是。')]};
  S.PICK_OPTS=[{t:'「三千八那把。」',id:'entry'},{t:'「六千五那把，聲音比較好聽。」',id:'solid'},{t:'「我再想想。」',id:null}];
  S.CG={trial:'cg_tongxian_trial_heroine04',roof:'cg_yilan_roof_heroine04'};   /* 2-3「同弦的試琴椅」、3-1「宜蘭民宿頂樓，子晴抱著吉他」（BB 照 D127 跟使用者要；CG_REGISTRY 有了才出）*/
  /* ---------- 存檔 ---------- */
  S.rec=function(G){ let r=G.guitar; if(!r||typeof r!=='object'||Array.isArray(r)) r=G.guitar={items:{}};
    if(!r.items||typeof r.items!=='object'||Array.isArray(r.items)) r.items={};
    if(typeof r.boss!=='number'||!(r.boss>=0)) r.boss=0; if(!r.narrX||typeof r.narrX!=='object'||Array.isArray(r.narrX)) r.narrX={}; if(!r.trip||typeof r.trip!=='object'||Array.isArray(r.trip)) r.trip={};
    return r; };
  /* ---------- 第 1 節：店 ---------- */
  S.isOpen=function(G){ G=G||(typeof GAME!=='undefined'?GAME.G:null); if(!G) return true; return typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(S.PLACE,hr(G),G.day); };
  S.closedText=G=>typeof PLACES!=='undefined'&&PLACES.closedText?PLACES.closedText(S.PLACE,hr(G),G.day):'';
  S.ITEMS=[{id:'entry',name:'民謠吉他 入門款',price:3800,guitar:true},{id:'solid',name:'民謠吉他 面單款',price:6500,guitar:true},{id:'strings',name:'一包弦',price:350},{id:'pick',name:'Pick',price:20},{id:'capo',name:'移調夾',price:300}];
  S.member=G=>!!(G&&G.flags&&G.flags.CLUB_club_guitar);   /* 九折條件＝吉他社成員（第 4 節第 2 點）*/
  S.price=function(G,id){ const it=S.ITEMS.find(q=>q.id===id); if(!it) return null; return S.member(G)?Math.round(it.price*0.9):it.price; };
  S.owns=(G,id)=>{ const r=G&&G.guitar&&G.guitar.items; return !!r&&r[id]!=null&&r[id]!==false; };
  S.hasGuitar=G=>!!(G&&G.flags&&G.flags.OWN_GUITAR);
  S.menu=G=>S.ITEMS.filter(it=>!(it.guitar&&S.owns(G,it.id))).map(it=>{ const p=S.price(G,it.id); return {t:it.name+'　'+fmt(p)+' 元',hint:S.member(G)?'九折':'',dim:(G.money|0)<p,id:it.id}; });
  /* 買（資料層，測試直接用）：'poor'＝錢不夠、'owned'＝這一款已經有了、true＝買了、false＝不能買 */
  S.buy=function(G,id,pay){ const it=S.ITEMS.find(q=>q.id===id); if(!it||!law(G)) return false; const r=S.rec(G), p=S.price(G,id);
    if(it.guitar&&S.owns(G,id)) return 'owned'; if((G.money|0)<p) return 'poor';
    if(pay) pay(-p); else G.money=(G.money|0)-p;
    if(it.guitar){ r.items[id]=G.day; G.flags.OWN_GUITAR=id; r.items.case=(r.items.case|0)+1; r.tuned=G.day; }   /* 送一個琴袋、一次調音（2-3 還沒去就自己買了：約不取消，見面演「你自己買了」那一版，AA_693 A10）*/
    else r.items[id]=(r.items[id]|0)+1;
    return true; };
  S.canTry=G=>S.attended(G,false)>0;   /* 「社課教的 C 和弦」*/
  let busy=false;
  let bossVisit=null;   /* 老闆這一次進店說過了（GM.enterN；不存檔：讀檔以後 enterN 從頭算）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['guitar3d:busy']=()=>{ busy=false; S.staged=null; bossVisit=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  const inShop=async(GM,f)=>{ const G=GM&&GM.G; if(!G||!law(G)) return false; if(busy) return true; if(!S.isOpen(G)){ if(GM.caption) GM.caption('',S.closedText(G),3600); return true; }
    busy=true; GM.sceneBegin(); try{ await f(G); } finally { busy=false; GM.sceneEnd(); } return true; };
  S.look=GM=>inShop(GM,async()=>{ await GM.say(null,S.L.look); });
  S.lookUkes=GM=>inShop(GM,async()=>{ await GM.say(null,S.L.ukes); });   /* AA_693 A2 */
  S.tryLine=G=>S.canTry(G)?S.L.tryPlay:S.L.tryNovice;   /* 去過社課＝C 和弦那一句；還沒去過＝AA_693 A5 */
  S.tryPlay=GM=>inShop(GM,async G=>{ await GM.say(null,S.tryLine(G)); });
  /* 老闆的話（輪流）：一次進店說一句（GM.enterN；測試沒有＝每次都說）*/
  S.bossLine=async function(GM){ const G=GM.G, r=S.rec(G), n=GM.enterN|0; if(n>0&&bossVisit===n) return null; bossVisit=n; const L=S.L.boss, t=L[(r.boss|0)%L.length]; r.boss=(r.boss|0)+1; await GM.say(BOSS,t); return t; };
  S.shop=GM=>inShop(GM,async G=>{ await S.bossLine(GM);
    const hO=typeof GIFTH!=='undefined'&&GIFTH.shopOpt?GIFTH.shopOpt(G,'xs_tongxian'):null;   /* 買禮物（GIFT-HOLIDAY-1110，src/gifthol3d.js）*/
    const opts=S.menu(G), k=await GM.choose(opts.concat(hO?[hO]:[],[{t:'不用了'}])), o=opts[k]; if(hO&&k===opts.length){ await GIFTH.pick(GM,hO); return; } if(!o) return;
    const it=S.ITEMS.find(q=>q.id===o.id), res=S.buy(G,o.id,GM.money?d=>GM.money(d):null);
    if(res==='poor'){ if(GM.toast) GM.toast('錢不夠'); return; } if(res!==true) return;
    if(GM.advance) GM.advance(0.15);
    if(it.guitar){ await GM.say(null,S.L.tuned); if(GM.memo) GM.memo('買了'+it.name); }
    else await GM.say(null,S.L.smallBag);   /* 弦、Pick、移調夾共用一句（AA_693 A11）*/
    if(GM.autosave) GM.autosave(); });
  /* ---------- 區域接線（xs_tongxian＝src/tongxian3d.js 的 TX3，LAWWW2-C；配置 src/data/tongxian_layout.js）----------
     區域只放座位（試琴椅 try_w／try_e「試彈」、櫃台前的木凳 counter_stool「坐下」）和出口；「看看」「買東西」的按鈕這裡加（照木曜日 mokuyobi_sys3d.js：包住 zone.build，
     點的位置照 TX3.INTERACT()＝配置的 interact）：look_guitars（wall_n、wall_s）＝「看看」、look_ukes（ukes，烏克麗麗那面牆；AA_693 A2）＝「看看」、buy＝「買東西」；try＝子晴 CG 的站位，不放按鈕。
     試彈＝坐上試琴椅（STORY.onSeat：配置的 seats 照位置對到 try_w／try_e）。營業時間的店門在 story3d.js 的 onInteract 擋（places.js 的 hours.xs_tongxian）；
     打烊時人還在店裡＝站起來、21:30 那一刻老闆「我們今天要打烊了。」（AA_700）、走到新生南路騎樓的樓梯口外面（TX3.streetOut()）；颱風、讀檔回到打烊以後＝不說、寫開放時間（PLACES.closedText）。*/
  S.BTN={look_guitars:'look',look_ukes:'ukes',buy:'shop'};
  S.layout=()=>typeof TONGXIAN_LAYOUT!=='undefined'&&TONGXIAN_LAYOUT&&TONGXIAN_LAYOUT.shop?TONGXIAN_LAYOUT.shop:null;
  S.buttons=function(E){ if(!E||!Array.isArray(E.interactables)||typeof TX3==='undefined'||!TX3.INTERACT) return 0; let n=0;
    for(const q of TX3.INTERACT()){ const k=S.BTN[q.kind]; if(!k) continue; E.interactables.push({x:q.x,z:q.z,lv:0,radius:0.9,label:S.L.labels[k],guitar:k,tongxian:q.id}); n++; }
    return n; };
  /* 舊序章那一年：店裡的按鈕藏起來（STORY.populate 換區域的時候）*/
  S.install=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!Array.isArray(E.interactables)||!S.ZONES.includes(G.zone)) return 0; let n=0;
    for(const it of E.interactables) if(it&&it.guitar){ it.hidden=!law(G); n++; } return n; };
  /* 老闆：開門的時候站在櫃台後面（TX3.OWNER＝配置的 npc.owner；照木曜日 MOKS.populate：路人底模、不說話——他的話用「老闆」那幾句）*/
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.isOpen(G)||!S.ZONES.includes(G.zone)) return null; if((E.npcs||[]).some(n=>n&&n.guitarBoss)) return null;
    const at=typeof TX3!=='undefined'?TX3.OWNER:null; if(!at) return null; const sp=Object.assign({},typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(93):{}); sp.bag=null;   /* 站櫃台不背包 */
    const o=CHAR.build(sp); if(!o) return null; o.position.set(at.x,0,at.z); o.rotation.y=at.yaw||0;
    return E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,guitarBoss:true}); };
  /* 試彈：坐上試琴椅（try_w、try_e）。去過一次社課＝「社課教的 C 和弦」那一句、還沒去過＝AA_693 A5 那一句；打烊以後不演 */
  S.seatId=function(seat){ const L=S.layout(); if(!L||!seat) return null; let bi=null, bd=0.3; for(const s of (L.seats||[])){ const d=Math.hypot(s.x-seat.x,s.z-seat.z); if(d<bd){ bd=d; bi=s.id||null; } } return bi; };
  S.TRY_SEATS=['try_w','try_e'];
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!G||!S.ZONES.includes(G.zone)||!law(G)||S.staged) return false; if(!S.TRY_SEATS.includes(S.seatId(seat))||!S.isOpen(G)) return false;
    await GM.say(null,S.tryLine(G)); return true; };
  /* 打烊（21:30、週一、颱風天、讀檔回到晚上）：人還在店裡＝出去。21:30 那一刻（到 22:00；那天有開、不是颱風天）＝老闆先說一句（AA_693 A3），之後照現在寫開放時間 */
  S.closingNow=G=>{ const h=hr(G); if(h<21.5-1e-6||h>=22) return false; const ws=typeof PLACES!=='undefined'&&PLACES.windowsOf?PLACES.windowsOf(S.PLACE,G.day):null;
    return !!(ws&&ws.length)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(S.PLACE,G.day)); };
  S.closeOut=async function(GM){ const G=GM.G, P=GM.E&&GM.E.player, h=G.hour, d=G.day, g0=S.closingNow(G), gen=typeof XSCLOSE!=='undefined'&&XSCLOSE.gen?XSCLOSE.gen(GM,S.PLACE,g0):g0; if(P&&P.seat&&GM.standUp) GM.standUp(P);
    if(gen){ GM.sceneBegin(); try{ if(typeof XSCLOSE!=='undefined'&&XSCLOSE.say) await XSCLOSE.say(GM,'老闆'); else await GM.say(BOSS,'我們今天要打烊了。'); } finally { GM.sceneEnd(); } }   /* AA_700：老闆一句、走出去，不另外出字 */
    const out=typeof TX3!=='undefined'&&TX3.streetOut?TX3.streetOut():null; if(GM.enter) await GM.enter('xinsheng',out?Object.assign({},out):undefined);
    if(!gen&&GM.toast&&typeof PLACES!=='undefined'&&PLACES.closedText) GM.toast(PLACES.closedText(S.PLACE,h,d),5000); return true; };
  /* ---------- 偶遇子晴（第 1 節）---------- */
  S.ENC_WEEKS=[6,10,14];
  S.ZQ_OUT='guitar_zq_shop';
  S.zqShopPlanned=G=>typeof OUT!=='undefined'&&!!OUT.get&&!!OUT.get(G,S.ZQ_OUT);
  S.encDue=function(G){ if(!G||!law(G)||!S.ZONES.includes(G.zone)||S.staged) return false; const r=S.rec(G); if(r.enc!=null) return false;
    const t=term(G); if(!t||t.id!=='Y1S1'||!S.ENC_WEEKS.includes(t.week)||wd7(G.day)!==6) return false; const h=hr(G); if(h<15||h>=16) return false;
    if(!S.isOpen(G)||!knows(G)||!present(G)||abroad(G)) return false; return !S.zqShopPlanned(G); };
  S.encounter=async function(GM){ const G=GM.G; S.rec(G).enc=G.day; GM.sceneBegin({adv:{charId:ZQ,expression:'neutral'}}); try{ await EVENTS.runLines(S.D_ENC,{id:'guitar_enc',participants:[ZQ]}); } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* 每 0.5 秒（STORY.TICKS）：人在店裡——打烊優先（請你出來），再來偶遇子晴；別的對話、事件、該出發的出遊還在＝等它結束（照 ggshops_sys3d.js 的 sceneFree）*/
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||busy||S.staged||GM.titleIdle||!S.ZONES.includes(G.zone)||!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(G)) p=S.closeOut(GM); else if(S.encDue(G)) p=S.encounter(GM); if(!p) return false;
    busy=true; p.catch(e=>console.warn('GUITAR.tick',e)).finally(()=>{ busy=false; }); return true; };
  /* ---------- 第 2 節：社課 ---------- */
  /* 去過幾次吉他社社課（出席紀錄 G.acts.att 的 club_guitar@天，聽完或中途離開都算）；exToday＝不算今天 */
  S.attended=function(G,exToday){ const A=(G&&G.acts&&G.acts.att)||{}, p=CLUB+'@'; let n=0; for(const k in A){ if(!k.startsWith(p)||!A[k]) continue; if(exToday&&+k.slice(p.length)===G.day) continue; n++; } return n; };
  /* 今天以前去過社課（舊存檔：出席紀錄以外，初遇記的 guitarFirstDay、ev_ziqing_club 演過的那天在今天以前也算）*/
  S.beenBefore=function(G){ if(S.attended(G,true)>0) return true; const F=G.flags||{}, L=(G.events&&G.events.last)||{}; return (F.guitarFirstDay!=null&&F.guitarFirstDay<G.day)||(L.ev_ziqing_club!=null&&L.ev_ziqing_club<G.day); };
  S.c21Due=G=>law(G)&&S.rec(G).c21==null&&!S.beenBefore(G);
  S.clubIn=async function(GM,a,ev){ const G=GM&&GM.G; if(!a||a.id!==CLUB||!G||!S.c21Due(G)) return null; const r=S.rec(G);
    r.c21=G.day; if(typeof ADV!=='undefined'&&ADV.begin&&!ADV.active) ADV.begin({background:'blur'});
    if(S.hasGuitar(G)){ await EVENTS.runLines(S.D21_OWN,{id:'guitar_2_1'}); return null; }   /* 第一次去就有自己的琴：「你也舉了」那一版（AA_693 A4），這次的旁白照常（不換鏽弦那一句）*/
    await EVENTS.runLines(S.D21,{id:'guitar_2_1'}); return {narr:S.L.c21Narr}; };
  S.kaiMate=G=>typeof STORY==='undefined'||!STORY.kaiRoommate||!!STORY.kaiRoommate(G);
  const hash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  S.loanRoll=d=>hash('guitar_loan:'+d)%3===0;   /* 「偶爾」：照日期約三分之一 */
  S.lastClub=G=>{ const A=(G&&G.acts&&G.acts.att)||{}, p=CLUB+'@'; let best=null; for(const k in A){ if(!k.startsWith(p)||!A[k]) continue; const d=+k.slice(p.length); if(d<G.day&&(best==null||d>best)) best=d; } return best; };
  S.narrX=function(G,a){ if(!a||a.id!==CLUB||!G||!law(G)) return null; const t=term(G); if(!t) return null; const r=S.rec(G);
    if(r.c21===G.day) return null;   /* 第一次社課（2-1）那一天不換（沒有琴＝2-1 已經換成鏽弦那一句；有琴＝照常輪流，AA_693 A4）*/
    if(S.hasGuitar(G)){ if(t.week>=7&&r.narrX[t.id]==null&&S.kaiMate(G)){ r.narrX[t.id]=G.day; return S.L.ownNarr; } return null; }
    const prev=S.lastClub(G); if(r.loanDay!=null&&r.loanDay===prev) return null;
    if(S.loanRoll(G.day)){ r.loanDay=G.day; return S.L.loanNarr; } return null; };
  /* 2-2：第 6 週週三社課結束 */
  S.c22Ok=G=>law(G)&&!S.hasGuitar(G)&&S.beenBefore(G)&&present(G)&&!abroad(G);
  S.planZqShop=function(G){ if(typeof OUT==='undefined'||!OUT.plan) return false; const d=TD('Y1S1',6,6); if(d==null||now(G)>=T(d,15.75)) return false;
    return OUT.plan(G,{id:S.ZQ_OUT,ev:'ev_guitar_zq_shop',day:d,h:15,place:'同弦樂器',title:'和子晴去同弦',travel:'走路 約 10 分鐘',travelH:1/6,alarm:true}); };
  /* 2-3：三個選項（錢不夠的那一把：「錢不夠」，再選一次）→ 她的回答 → 買了＝九折、調音裝袋 */
  S.zqPick=async function(GM){ const G=GM.G; let o=null;
    for(let n=0;n<6;n++){ const opts=S.PICK_OPTS.map(q=>({t:q.t,id:q.id,dim:!!q.id&&(G.money|0)<S.price(G,q.id)})); const k=await GM.choose(opts); o=opts[k]||opts[2];
      if(o.id&&(G.money|0)<S.price(G,o.id)){ if(GM.toast) GM.toast('錢不夠'); o=null; continue; } break; }
    if(!o) o={id:null,t:S.PICK_OPTS[2].t};
    if(typeof ADV!=='undefined'&&ADV.log) ADV.log(G.name,'▶ '+o.t);
    await EVENTS.runLines(S.D_ZQPICK[o.id||'none'],{id:'ev_guitar_zq_shop',participants:[ZQ]});
    if(o.id&&S.buy(G,o.id,GM.money?d=>GM.money(d):null)===true){ await GM.say(null,S.L.tuned); if(GM.memo) GM.memo('買了'+S.ITEMS.find(q=>q.id===o.id).name); }
    return o.id; };
  /* 2-3 的 3D：有 xs_tongxian 區域＝演之前換到店裡（試琴椅、子晴站在旁邊），畫面模糊；演完回到原本的地方（OUT.STAGE，照 b1story3d.js）*/
  S.staged=null;
  S.stageZone=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[G.zone]) return null; const z=S.ZONES.find(id=>Z3.ZONES[id]); if(!z) return null;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return null; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null; if(E.player.riding||(G.flags&&G.flags.companion)) return null; return z; };
  S.outingStage=async function(GM,q,ev){ if(!ev||ev.id!=='ev_guitar_zq_shop') return null; const z=S.stageZone(GM); if(!z) return null; const G=GM.G, P=GM.E.player, own=S.hasGuitar(G);
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const L=S.layout()||{}, ls=(L.seats||[]).find(s=>s.id==='try_w'), by=(L.interact||[]).find(s=>s.id==='buy'), zq=own?(by?{x:by.x,z:by.z,yaw:by.yaw||0}:null):(L.npc&&L.npc.ziqing_cg);
    /* 配置：CG「同弦的試琴椅」祐廷坐 try_w，子晴站在 ziqing_cg；已經自己買了琴（AA_693 A10：跳過試琴、陪她買弦）＝祐廷站在進門點、子晴在櫃台前（interact 的 buy）*/
    S.staged=z; await GM.enter(z,undefined,{noFade:true,deferStory:true,noAutosave:true});   /* 站在區域的進門點（店門內），接著坐上試琴椅 */
    const seat=own?null:(((GM.E.zone&&GM.E.zone.seats)||[]).find(s=>s&&s.tongxian==='try_w')||(ls?{x:ls.x,z:ls.z,yaw:ls.yaw||0,lv:0}:null));   /* 區域的座位（照座面抬高的 lift）；沒有就照配置 */
    if(zq&&GM.spawnCharacter){ if(GM.npc&&GM.npc[ZQ]&&GM.removeNPC) GM.removeNPC(ZQ); const n=GM.spawnCharacter(ZQ,zq.x,zq.z,{yaw:zq.yaw||0,pose:'idle'}); if(n) n.frozen=true; }
    if(seat&&GM.sitAt) GM.sitAt(P,seat);
    let done=false; return {restore:async()=>{ if(done) return; done=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P); await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  /* 宿舍「彈吉他」（2-4）*/
  S.playDorm=async function(GM){ const G=GM.G, L=S.kaiMate(G)?S.L.dorm:S.L.dorm.slice(1), t=L[Math.min(L.length-1,Math.floor(S.rand()*L.length))];
    await GM.fade(true); if(GM.advance) GM.advance(0.5); await GM.fade(false); await GM.say(null,t); const r=S.rec(G); r.dorm=(r.dorm|0)+1; if(GM.autosave) GM.autosave(); return t; };
  /* 宿舍房間的「彈吉他」（BB-C 11-05：原本在「看看房間裡的東西」裡面，找不到）：有琴＝房間裡多一個按鈕（和「坐在書桌前」「睡覺」「看看房間裡的東西」同一層），動作照舊 S.playDorm。
     位置：自己書桌前、往走道 0.6 m（站在書桌前照舊是「坐在書桌前」；離「看看房間裡的東西」、紙箱、梯子都超過它們的範圍）。3D 的琴還沒有（LAWWW2）：先只有互動點 */
  S.dormOn=G=>!!(G&&G.flags&&G.zone==='dorm'&&S.hasGuitar(G)&&law(G));
  S.dormSpot=function(){ const R=typeof DORM_ROOM!=='undefined'?DORM_ROOM:null, U=R&&R.units?R.units.find(u=>u.id===(R.player_unit||'L2')):null;
    if(U&&U.seat_approach&&U.seat) return [Math.round((U.seat_approach[0]+0.5)*1000)/1000,U.seat.z]; return [-0.05,0.142]; };
  S.dormButton=function(GM){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!Array.isArray(E.interactables)||!G||G.zone!=='dorm') return null; let it=E.interactables.find(q=>q&&q.guitar==='dorm'); if(it) return it;
    const p=S.dormSpot(); it={x:p[0],z:p[1],radius:0.5,lv:0,label:S.L.dormLabel,guitar:'dorm',get hidden(){ return !S.dormOn(GM.G); }}; E.interactables.push(it); return it; };
  /* ---------- 第 3 節：社遊 ---------- */
  S.TRIPS={ y1s1:{term:'Y1S1',ann:[11,1,21],day:[12,6],h:8,cost:2500,post:S.L.yilanPost,ev:'ev_guitar_trip_yilan',title:'宜蘭兩天一夜',out:'guitar_trip_yilan'},
            y1s2:{term:'Y1S2',ann:[10,1,21],day:[10,6],h:10,cost:600,post:S.L.ymsPost,ev:'ev_guitar_trip_yms',title:'陽明山一日',out:'guitar_trip_yms'} };
  S.tripDay=k=>{ const P=S.TRIPS[k]; return P?TD(P.term,P.day[0],P.day[1]):null; };
  S.annDay=k=>{ const P=S.TRIPS[k]; return P?TD(P.term,P.ann[0],P.ann[1]):null; };
  S.tripOk=G=>law(G)&&S.member(G)&&S.attended(G,false)>=2&&!abroad(G);   /* 加入吉他社、去過兩次以上社課（3-2：條件同上）*/
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const k in S.TRIPS){ const P=S.TRIPS[k], a=S.annDay(k), d=S.tripDay(k), tag='guitar_trip_'+k; if(a==null||d==null||PHONE.sent(G,tag)) continue;
      if(now(G)<T(a,P.ann[2])||now(G)>=T(d,P.h)||!S.tripOk(G)) continue;
      PHONE.join(G,'guitar','吉他社');
      PHONE.at(G,a,P.ann[2],[{th:'g:guitar',from:S.PRES,name:'社長學長',text:P.post,ask:{id:tag,until:T(d,P.h),opts:[{t:S.L.sign,post:false,gTrip:k,sign:true},{t:S.L.noSign,gTrip:k}]}}],tag); } };
  /* 回了報名表（PHONE.ON_ANSWER）：報名＝錢夠扣錢、排出遊；錢不夠＝你說「下次吧。」、沒有報名 */
  S.onAnswer=function(G,m,o){ if(!o||!o.gTrip||!S.TRIPS[o.gTrip]) return; const k=o.gTrip, P=S.TRIPS[k], r=S.rec(G), th=typeof PHONE!=='undefined'&&PHONE.th?PHONE.th(m):'g:guitar';
    if(!o.sign){ r.trip[k]='no'; return; }
    if((G.money|0)<P.cost){ PHONE.post(G,{th,from:'player',who:null,text:S.L.poor}); r.trip[k]='poor'; return; }
    if(typeof GAME!=='undefined'&&GAME.money&&GAME.G===G) GAME.money(-P.cost); else G.money=(G.money|0)-P.cost;
    PHONE.post(G,{th,from:'player',who:null,text:o.t}); r.trip[k]='yes'; S.planTrip(G,k); };
  S.planTrip=function(G,k){ const P=S.TRIPS[k], d=S.tripDay(k); if(!P||d==null||typeof OUT==='undefined'||!OUT.plan) return false;
    return OUT.plan(G,{id:P.out,ev:P.ev,day:d,h:P.h,place:'校門口',title:P.title,travel:'走到校門口約 10 分鐘',travelH:1/6,must:true,alarm:true}); };
  /* 跳到出發那天的隔天某個時間（日期、星期、天氣一起換；只往後；給事件的 advance 用，回傳 0）*/
  S.jump=function(G,day,h){ if(day==null||T(day,h)<=now(G)) return false; if(typeof PG!=='undefined'&&PG.setT) PG.setT(G,null,day,h); else { if(day!==G.day){ G.day=day; G.weekday=wd7(day); G.weather='clear'; if(G.flags) G.flags.companion=null; } G.hour=h; } if(G.flags) G.flags.nightKai=false; return true; };
  const toH=h=>G=>{ const hh=hr(G); return h>hh?h-hh+1e-6:0; };
  /* 換到沒有圖、稿上也沒有地點字幕的一段（宜蘭第二天早上、羅東，AA_693 A8）：深色底、清掉立繪（照事件引擎換場景的做法，不出字幕）*/
  S.darkBg=()=>{ if(typeof ADV==='undefined') return; if(ADV.setBg) ADV.setBg('dark'); if(ADV.hide){ ADV.hide('left'); ADV.hide('right'); } };
  const nextDay=(k,h)=>G=>{ const d=S.tripDay(k); if(d!=null) S.jump(G,d+1,h); return 0; };
  /* 子晴社遊那段時間的作息（STORY.SCHED_X）：不在校園、公館 */
  S.sched=function(c,G){ if(!c||c.id!==ZQ||!G||!law(G)) return null; const h=+G.hour||0;
    const y=S.tripDay('y1s1'), m=S.tripDay('y1s2'), ent=(from,to)=>({days:[wd7(G.day)],from,to,zone:null,act:'out',away:'吉他社社遊',note:'AA_619 第 3 節（src/guitar3d.js）'});
    if(y!=null&&G.day===y&&h>=8) return ent(8,24); if(y!=null&&G.day===y+1&&h<17) return ent(0,17); if(m!=null&&G.day===m&&h>=10&&h<18) return ent(10,18); return null; };   /* 陽明山 10:00～18:00（AA_693 A9）*/
  /* ---------- 事件 ---------- */
  S.EVENTS=[
    /* 2-2 子晴說要陪你去（第 6 週週三社課結束；還沒買吉他、認識子晴）*/
    { id:'ev_guitar_zq_invite', participants:[ZQ], location:'any', trigger:'activity', afterActivity:CLUB, term:['Y1S1'], weeks:[6], weekday:[3], once:true, background:'blur',
      prereq:{notFlags:['OWN_GUITAR'],memory:[{npc:ZQ,tag:'FIRST_MET'}],custom:G=>S.c22Ok(G)},
      dialogue:[ Z('你還在用那箱的？'), Z('……禮拜六我要去同弦買弦。你要來就來。'), Z('我陪你去，但我不幫你選。你自己彈彈看，你的手比我知道。'),
        {choice:[{text:'「好，禮拜六。」',set:{GUITAR_SHOP_WITH_ZQ:true},goto:'go'},{text:'「我自己去就好。」',goto:'alone'}]},
        {label:'go'},{call:G=>{ S.planZqShop(G); }},{end:true},
        {label:'alone'}, Z('好。0.12 的弦，記得。') ] },
    /* 2-3 和子晴去同弦（第 6 週週六 15:00）*/
    { id:'ev_guitar_zq_shop', title:'和子晴去同弦', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', portraitLater:true, hours:0.75,
      dialogue:[ {if:{custom:()=>!S.staged},scene:'同弦樂器',bg:'tongxian_shop'}, {if:{custom:()=>!!S.staged},scene:'同弦樂器',bg:false},
        {if:{flags:['OWN_GUITAR']},goto:'own'},   /* 之前已經自己買了琴（AA_693 A10）：照約見面、跳過試琴和買琴 */
        N('（子晴已經在樓梯口了，耳機掛在脖子上。）'), Z('走。'), N('（老闆看到子晴，點了一下頭。）'), B('又來了。0.12？'), Z('嗯。……他要買琴。'),
        N('（你拿下兩把試。一把三千八，一把六千五。）'), {cg:S.CG.trial},
        Z('彈 G。……換 C。……再彈一次 G。'), Z('哪一把比較好按？'),
        {call:async(G,GM)=>{ await S.zqPick(GM); }}, {goto:'out'},
        {label:'own'}, N('（子晴已經在樓梯口了，耳機掛在脖子上。她看了一眼你背的琴袋。）'), Z('……你自己買了。'), Z('好。那陪我買弦。'),
        N('（老闆看到子晴，點了一下頭。）'), B('又來了。0.12？'), Z('嗯。'),
        {label:'out'}, {scene:'新生南路',bg:false}, Z('有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。') ] },   /*「出來以後」那一句：買不買、自己買了都說 */
    /* 3-1 宜蘭兩天一夜（第 12 週週六～週日）*/
    { id:'ev_guitar_trip_yilan', title:'宜蘭兩天一夜', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', portraitLater:true, hours:2,
      dialogue:[ {scene:'遊覽車上',bg:'tour_bus'}, N('（車上有人彈吉他，後面的人跟著唱。唱到一半，司機把收音機關了。）'),
        {advance:toH(14)}, {scene:'外澳海邊',bg:'trip_sea'}, N('（大家在沙灘上排成一圈彈唱。風很大，譜一直被吹走。）'), N('（子晴坐在圈子外面一點的地方，沒有彈，在看海。）'),   /* AA_693 B：加括號（旁白一律用（））*/
        {choice:[{text:'「去跟子晴說話。」',goto:'sea_talk'},{text:'「留在圈子裡唱。」',goto:'sea_sing'}]},
        {label:'sea_talk'}, Z('我在聽浪。……它的節奏一直在變。'), {goto:'night'},
        {label:'sea_sing'}, N('（你唱了三首。子晴回來的時候，手機在錄浪的聲音。）'),
        {label:'night'}, {advance:toH(19)}, {scene:'宜蘭・民宿',bg:'yilan_minsu_night'},
        N('（晚上在民宿的院子烤肉。吃完大家擠進客廳，一個一個上去彈一首。）'), N('（輪到你了。）'),   /* AA_693 A6：烤肉、輪流上台、輪到你 */
        Object.assign(N('（你把自己的琴從琴袋裡拿出來。）'),{if:{flags:['OWN_GUITAR']}}),
        Object.assign(N('（子晴把她的琴遞給你。）'),{unless:{flags:['OWN_GUITAR']}}), Z('弦剛換過。',{unless:{flags:['OWN_GUITAR']}}),
        {choice:[{text:'「彈社課教的那首。」',goto:'play'},{text:'「我不彈，我幫大家拍照。」',goto:'photo'}]},
        {label:'play'}, {unless:{flags:['OWN_GUITAR']},set:{BORROWED_ZQ_GUITAR:true}}, N('（你彈錯了兩個地方。大家照樣拍手。）'), {goto:'late'},   /* 借子晴的琴只在選了彈的時候記（AA_693 B：照現在）*/
        {label:'photo'}, N('（你拍了很多張。子晴那張，她剛好在笑。）'),
        {label:'late'}, {advance:nextDay('y1s1',0.25)}, N('（十二點多，樓下還在唱歌。）'),   /* AA_693 A7：頂樓去不去 */
        {choice:[{text:'「上頂樓透氣。」',goto:'roof'},{text:'「回房間睡覺。」',goto:'bed'}]},
        {label:'bed'}, N('（你回房間躺下。樓下的歌隔著地板，一首接一首。）'), {goto:'morning'},   /* 回房間：沒有頂樓，回程用沒去的那一版 */
        {label:'roof'}, {scene:'民宿頂樓',bg:'yilan_minsu_roof'},
        N('（你上頂樓透氣，子晴已經在了，抱著吉他。）'), {cg:S.CG.roof},   /* AA_693 A7：原稿第一句改成這一句（「十二點多」那半句在選項前）*/
        N('（她彈了一段你沒聽過的旋律。很短，彈完就停了。）'),
        {choice:[{text:'「那是什麼歌？」',goto:'r_ask'},{text:'（不說話，坐在旁邊聽。）',goto:'r_listen'}]},
        {label:'r_ask'}, Z('……沒有名字。我自己寫的。'), Z('還沒寫完。結尾我還沒想到。'), {goto:'r_tune'},   /* AA_693 C（AA_619 c4b14a901 同步改）*/
        {label:'r_listen'}, N('（她又彈了一次，彈到同一個地方停下來。）'), Z('……這邊我一直寫不下去。'),
        {label:'r_tune'}, {set:{ZQ_ROOFTOP_TUNE:true},mem:[{npc:ZQ,tag:'HEARD_HER_SONG',note:''}]},
        {choice:[{text:'「我覺得很好聽。」',goto:'r_nice'},{text:'「慢慢寫就好。」',goto:'r_slow'}]},
        {label:'r_nice'}, Z('你又聽不出來好不好。'), N('（停一下）'), Z('……謝了。',{unless:DH}), Z('……你明天坐我旁邊。',{if:DH}), {goto:'morning'},
        {label:'r_slow'}, Z('嗯。'), N('（她把吉他收進琴袋）'), Z('明天要早起，學長說要去吃卜肉。',{unless:DH}), Z('……你明天坐我旁邊。',{if:DH}),
        {label:'morning'}, {advance:nextDay('y1s1',8.5)}, {call:()=>{ S.darkBg(); }},   /* AA_693 A8：第二天早上、羅東（深色底，沒有地點字幕）→ 接原本回程那一句 */
        N('（第二天早上，學長帶大家去吃卜肉。剛起鍋很燙，大家站在店門口邊吹邊吃。）'),
        {advance:toH(14)}, N('（下午經過羅東，大家去買伴手禮。你買了一盒牛舌餅。）'),
        {advance:toH(15)}, {scene:'遊覽車上',bg:'tour_bus'},
        Object.assign(N('（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）'),{if:{flags:['ZQ_ROOFTOP_TUNE']}}),
        Object.assign(N('（回程車上大家都睡了。）'),{unless:{flags:['ZQ_ROOFTOP_TUNE']}}) ] },
    /* 3-2 陽明山一日（大一下第 10 週週六 10:00～18:00）*/
    { id:'ev_guitar_trip_yms', title:'陽明山一日', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', portraitLater:true, hours:4,   /* 14:00 演完 → 傍晚 18:00 回到校門口（AA_693 A9）*/
      dialogue:[ N('（早上十點，校門口。社長學長租了一台小巴，後車廂塞滿琴袋。）'),   /* AA_693 A9：10:00 校門口出發那一句 */
        {advance:toH(14)}, {scene:'擎天崗草原',bg:'yms_grassland'}, N('（子晴這次在圈子裡彈。）'),   /* AA_693 B：加括號 */
        Z('今天彈別人的歌。……我的還沒好。',{if:{flags:['ZQ_ROOFTOP_TUNE']}}), Z('今天風好舒服。',{unless:{flags:['ZQ_ROOFTOP_TUNE']}}),
        {choice:[{text:'「陪她去旁邊走走。」',goto:'walk'},{text:'「留下來彈。」',goto:'stay'}]},
        {label:'walk'}, N('（你們走到步道口。牛在遠一點的地方吃草。）'), Z('我爸說彈吉他不能當飯吃。'), Z('……我沒有要當飯吃。我只是想做一個東西出來。'), {goto:'end'},
        {label:'stay'}, N('（你們彈到太陽快下山。子晴說：「你換和弦比上學期快了。」）'),
        {label:'end'} ] } ];
  /* ---------- 接到遊戲 ---------- */
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x&&x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof OUT!=='undefined'&&OUT.BG){   /* 2D 背景：還沒有圖＝深色底＋地點字幕（BB 照 D127 跟使用者要）*/
    for(const [k,l] of [['tongxian_shop','同弦樂器'],['yilan_minsu_roof','民宿頂樓'],['yms_grassland','擎天崗草原']]) if(!OUT.BG[k]) OUT.BG[k]={label:l,image:null};
    if(Array.isArray(OUT.STAGE)&&!OUT.STAGE.includes(S.outingStage)) OUT.STAGE.push(S.outingStage); }
  if(typeof PHONE!=='undefined'){ if(PHONE.NAMES&&!PHONE.NAMES[S.PRES]) PHONE.NAMES[S.PRES]='社長學長'; if(Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER.includes(S.onAnswer)) PHONE.ON_ANSWER.push(S.onAnswer); }
  if(typeof CLS!=='undefined'){
    if(Array.isArray(CLS.CLUB_IN)&&!CLS.CLUB_IN.includes(S.clubIn)) CLS.CLUB_IN.push(S.clubIn);
    if(CLS.clubNarr&&!CLS.clubNarr._guitar){ const n0=CLS.clubNarr; CLS.clubNarr=Object.assign(function(G,a){ try{ const x=S.narrX(G,a); if(x) return x; }catch(e){ console.warn('GUITAR.narrX',e); } return n0.apply(this,arguments); },{_guitar:true}); } }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(Array.isArray(STORY.PHONE_RULES)&&!STORY.PHONE_RULES.includes(S.phone)) STORY.PHONE_RULES.push(S.phone);
    if(Array.isArray(STORY.SCHED_X)&&!STORY.SCHED_X.includes(S.sched)) STORY.SCHED_X.push(S.sched);
    if(!STORY._guitar){ STORY._guitar=true;
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(S.ZONES.includes(zoneId)){ S.install(GM); S.populate(GM); } if(zoneId==='dorm') S.dormButton(GM); }catch(e){ console.warn('GUITAR.install',e); } return r; }; }
      if(STORY.interact){ const i0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.guitar&&G){ if(it.guitar==='look') await S.look(GM); else if(it.guitar==='ukes') await S.lookUkes(GM); else if(it.guitar==='try') await S.tryPlay(GM); else if(it.guitar==='shop') await S.shop(GM); else if(it.guitar==='dorm'){ if(!S.dormOn(G)) return true; GM.sceneBegin(); try{ await S.playDorm(GM); } finally { GM.sceneEnd(); } } return true; }   /* 新生南路的店門（營業時間外、颱風天）在 story3d.js 的 onInteract 擋 */
        return i0.apply(this,arguments); }; }
      { const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&S.ZONES.includes(GM.G.zone)) await S.onSeat(GM,seat); }catch(e){ console.warn('GUITAR.onSeat',e); } return r; }; } } }   /* 試彈＝坐上試琴椅 */
  /* 店裡的「看看」「買東西」按鈕（照木曜日 mokuyobi_sys3d.js：包住區域的 build；沒有 TX3＝什麼都不做）*/
  if(typeof TX3!=='undefined'&&TX3.zone&&!TX3.zone._guitar){ TX3.zone._guitar=true; const b0=TX3.zone.build; TX3.zone.build=function(E){ const z=b0.apply(this,arguments); try{ S.buttons(E); }catch(e){ console.warn('GUITAR.buttons',e); } return z; }; }
  return S;
})();
