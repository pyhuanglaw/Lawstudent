/* ===== 同弦樂器（吉他店）、加入吉他社要買吉他、吉他社社遊（AA_619，企劃線 bf0efded8〔22a6c4d43 第一版；bf0efded8 只把三處「公館」改「新生南路」〕，AA-C 定稿 D109；
   任務 AA619-GUITAR-1104（系統，LAWWW）、GUITAR-SHOP-ZONE-1105（室內區域 xs_tongxian，LAWWW2，D108）；USER_WANTS X196）=====
   台詞照稿一字不改（S.L、S.D21、S.D_ENC、S.EVENTS）；稿上沒有的字不寫——介面字只用遊戲裡已經有的（「不用了」「錢不夠」「買了○○」、開放時間的寫法、
   出遊的「走路 約 10 分鐘」「走到校門口約 10 分鐘」、地點字幕「遊覽車上」「宜蘭・民宿」「新生南路」）；稿上沒有、遊戲裡也沒有的列在報告的缺字。
   第 1 節　同弦樂器（新生南路那一排的二樓店面；AA-C 11-05 00:45：就是 src/data/xinsheng_layout.js 的 tongxian，不搬；室內區域 id xs_tongxian）
     - 營業：PLACES.hours.xs_tongxian（12:00～21:30、週一休）、颱風天關（PLACES.typhoonShops）。S.isOpen／S.closedText；新生南路的店門（exit.to＝xs_tongxian）營業時間外擋下來（寫開放時間）。
     - 店裡三個互動（S.look／S.tryPlay／S.shop，參數都是 GM；區域的互動點也可以直接叫）：
         看看＝旁白一句；試彈＝旁白一句（稿寫「社課教的 C 和弦」：去過一次吉他社社課才出現）；
         買東西＝老闆一句（三句輪流，一次進店說一句）→ 選單：民謠吉他 入門款 3,800、面單款 6,500、一包弦 350、Pick 20、移調夾 300、「不用了」；
           吉他社成員（CLUB_club_guitar）九折（入門款 3,420、面單款 5,850……，選項小字「九折」）；錢不夠＝「錢不夠」，不扣錢；買了＝扣錢、時間 +0.15 小時（照 story3d.js 的 counter）；
           吉他＝OWN_GUITAR（'entry'｜'solid'）、送一個琴袋、一次調音（旁白用 2-3 那一句「（老闆幫你調好音，把琴裝進琴袋。）」）、日誌「買了○○」；同一款買過就不再列；
           小東西＝G.guitar.items 記數量、「買了○○」。
     - 區域接線（沒有 xs_tongxian 區域＝什麼都不做、不會出錯）：進店（STORY.populate）時 S.install——區域放的互動點寫了 guitar:'look'|'try'|'shop' 的照用；
       配置 interact 的 kind look_guitars／try／buy 的也接上；都沒有＝照 TONGXIAN_LAYOUT.shop.interact 補三個。按鈕字一律換成稿上的「看看」「試彈」「買東西」。
       烏克麗麗那一點（look_ukes）稿上沒有字＝藏起來（沒有自己的動作的話）。STORY.interact 照 it.guitar 分派。
     - 偶遇子晴（S.encDue／S.encounter，STORY.TICKS）：大一上第 6、10、14 週週六 15:00～16:00 人在店裡、認識她（FIRST_MET）、她在臺北＝她兩句、旁白一句；一個存檔一次；
       2-3 排過（和她約過同弦，不管去了沒）就不演（稿是「你也來這家？」）。
   第 2 節　加入吉他社、買吉他
     2-1 第一次社課（S.clubIn，CLS.CLUB_IN）：這是第一次去吉他社社課（以前沒有出席紀錄）＝子晴的初遇（ev_ziqing_club）演完、入座那一句之後，社長學長那一段、兩個選項；
         那一次的旁白換成鏽弦那一句（輪流的六句不往前）。舊存檔：以前去過社課＝不補；第一次去的時候已經有自己的琴＝不演（稿是「你沒有」；c21＝'own'）。
     2-2 第 6 週週三社課結束（事件 ev_guitar_zq_invite，afterActivity）：沒有琴、認識子晴、這不是第一次社課（稿：「你還在用那箱的？」）、她在臺北＝她三句、兩個選項；
         「好，禮拜六。」＝GUITAR_SHOP_WITH_ZQ、排出遊 guitar_zq_shop（第 6 週週六 15:00 同弦樂器）；「我自己去就好。」＝她一句。第 6 週過了＝不演（舊存檔一樣），可以自己去同弦買。
     2-3 第 6 週週六 15:00（出遊 guitar_zq_shop → 事件 ev_guitar_zq_shop）：稿的幾句 → 三個選項（錢不夠的那一把變灰，按了只出「錢不夠」再選一次）→ 她的回答 →
         買了＝九折（3,420／5,850）、調音裝袋那一句 → 出來以後她一句（買不買都說）。CG cg_tongxian_trial_heroine04「同弦的試琴椅」：登錄了才出（BB 照 D127 跟使用者要）。
         之前已經自己買了琴＝這個出遊取消（state missed，不演）。有 xs_tongxian 區域＝演之前換到店裡、試琴椅、模糊的 3D（OUT.STAGE）；沒有＝深色底＋地點字幕。
     2-4 之後的社課（包 CLS.clubNarr，不加數值、不懲罰）：有琴＝這學期第 7 週起、阿凱還是室友（STORY.kaiRoommate）多一句（一學期一次，第一次符合的那一堂出）；
         沒有琴＝偶爾（照日期，約三分之一；第一次社課、上一堂剛出過的不算）換成第三弦那一句。兩種都不讓輪流的六句往前。
     宿舍「彈吉他」（STORY.ROOM_EXTRA，有 OWN_GUITAR）：轉暗、30 分鐘、旁白兩句隨機一句（阿凱不是室友了＝只有第二句）。
   第 3 節　吉他社社遊（群組 g:guitar；條件：吉他社成員、去過兩次以上社課；經濟系那一年、人在國外不排）
     3-1 宜蘭兩天一夜：大一上第 11 週週一 21:00（社課結束）社長學長在群組貼報名表，報名／不報名（回到出發為止）；報名＝扣 2,500、排出遊（11/22 08:00 校門口，只有「出發」）；
         錢不夠＝你在群組說「下次吧。」、沒有報名、不扣錢。不報名＝照選項傳出去。撞到同一天的活動＝人在宜蘭，那些照錯過處理（不懲罰）。
         事件 ev_guitar_trip_yilan：遊覽車上 → 14:00 外澳海邊 → 19:00 宜蘭・民宿 → 隔天 00:15 民宿頂樓 → 15:00 回程遊覽車 → 17:00 回到學校。
         輪到你彈、沒有自己的琴＝借子晴的（BORROWED_ZQ_GUITAR）；頂樓＝ZQ_ROOFTOP_TUNE、子晴的記憶 HEARD_HER_SONG；CG cg_yilan_roof_heroine04 登錄了才出。
     3-2 陽明山一日：大一下第 10 週週一 21:00 社長學長那一句＋報名；600；5/2 12:00 校門口 → 14:00 擎天崗草原 → 19:30 回到學校（事件 ev_guitar_trip_yms）。
     3-3 和子晴交往中：頂樓最後一句換「……你明天坐我旁邊。」；在和別人交往的照樣去、照演。兩場的那段時間子晴的作息是「吉他社社遊」（STORY.SCHED_X），校園、公館遇不到她。
   存檔：G.guitar＝{items:{entry,solid:買的那天, strings,pick,capo,case:數量}, tuned:調音那天, boss:老闆說過幾句, bossN:說過的那一次進店, c21:第一次社課那天（'own'）,
         enc:偶遇那天, narrX:{學期:有琴那句那天}, loanDay:第三弦那句那天, dorm:彈過幾次, trip:{y1s1,y1s2:'yes'|'no'|'poor'}}——舊存檔沒有＝game3d.js defaults 補 {items:{}}、S.rec 重設壞掉的欄位；
         旗標 OWN_GUITAR、GUITAR_SHOP_WITH_ZQ、BORROWED_ZQ_GUITAR、ZQ_ROOFTOP_TUNE；子晴的記憶 HEARD_HER_SONG（大一下「她在做的東西」ev_ziqing_secret_game 開頭一句，src/data/events.js；
         人物面板的名稱稿上沒有，src/social3d.js 暫用稿上那張 CG 的名稱「宜蘭民宿頂樓，子晴抱著吉他」，等 AA 定）。
   測試：node tests/aa619_guitar_unit.js */
'use strict';
const GUITAR=(function(){
  const S={};
  const ZQ='heroine_04', CLUB='club_guitar';
  S.ZONES=['xs_tongxian','tongxian'];   /* 室內區域 id：xs_tongxian（新生南路店門照 'xs_'+店 id 接，LAWWW2-C）；tongxian 當備用 */
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
    tryPlay:'（你拿下一把，彈了社課教的 C 和弦。老闆從櫃檯抬頭看了一眼，又低頭。）',
    boss:['先買好彈的，不要先買好看的。','弦一個月換一次。你們學生都半年才換。','手指痛是正常的，痛兩個禮拜就不痛了。'],   /* 第 1 節：老闆的話（輪流）*/
    tuned:'（老闆幫你調好音，把琴裝進琴袋。）',   /* 2-3；第 1 節「買了吉他送一個琴袋、一次調音」一個人來買也用這一句 */
    c21Narr:'（社團的吉他弦很鏽。按下去手指留了一條黑線。）',   /* 2-1：這次社課的旁白換成 */
    ownNarr:'（你的琴放在宿舍床邊。阿凱說你半夜彈太大聲。）', loanNarr:'（社團那把吉他的第三弦又鬆了。學長幫你調了兩次。）',   /* 2-4 */
    dorm:['（你練了刷法。阿凱戴上耳機。）','（你彈了一首社課教的歌，彈到副歌就忘了。）'], dormLabel:'彈吉他',   /* 2-4 宿舍房間 */
    yilanPost:'社遊 11/22–23 宜蘭，民宿兩天一夜，兩千五（含車、住、早餐）。要帶琴喔。', ymsPost:'這學期社遊一天就好，陽明山野餐。',   /* 3-1、3-2 */
    sign:'報名', noSign:'不報名', poor:'下次吧。',
    labels:{look:'看看',try:'試彈',shop:'買東西'} };
  /* 對話（事件引擎的寫法，EVENTS.runLines）*/
  const N=t=>({speaker:null,text:t}), Z=(t,o)=>Object.assign({speaker:ZQ,expression:'neutral',text:t},o||{}), PR=t=>({speaker:'社長學長',text:t}), B=t=>({speaker:'老闆',text:t});
  const DH={custom:G=>dating(G)};
  S.D21=[ N('（社長學長拍拍手。）'), PR('有自己吉他的舉手。'), N('（一半的人舉手。你沒有。）'),
    PR('沒有的先用社團的，前面那箱。前兩個禮拜先借，之後最好自己買一把。……不用貴，三四千就有好彈的。'), PR('新生南路有一家同弦，報吉他社打九折。'),
    {choice:[{text:'「好。」',goto:'c21_end'},{text:'「一定要買嗎？」',goto:'c21_must'}]},
    {label:'c21_must'}, PR('不買也可以啊，社團的琴一直都在。只是那箱弦有點鏽。'),
    {label:'c21_end'} ];
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
  S.buy=function(G,id,pay,o){ o=o||{}; const it=S.ITEMS.find(q=>q.id===id); if(!it||!law(G)) return false; const r=S.rec(G), p=S.price(G,id);
    if(it.guitar&&S.owns(G,id)) return 'owned'; if((G.money|0)<p) return 'poor';
    if(pay) pay(-p); else G.money=(G.money|0)-p;
    if(it.guitar){ r.items[id]=G.day; G.flags.OWN_GUITAR=id; r.items.case=(r.items.case|0)+1; r.tuned=G.day; if(!o.zqShop) S.cancelZqShop(G); }   /* 送一個琴袋、一次調音；2-3 還沒去就自己買了＝那個約取消 */
    else r.items[id]=(r.items[id]|0)+1;
    return true; };
  S.canTry=G=>S.attended(G,false)>0;   /* 「社課教的 C 和弦」*/
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['guitar3d:busy']=()=>{ busy=false; S.staged=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  const inShop=async(GM,f)=>{ const G=GM&&GM.G; if(!G||!law(G)) return false; if(busy) return true; if(!S.isOpen(G)){ if(GM.caption) GM.caption('',S.closedText(G),3600); return true; }
    busy=true; GM.sceneBegin(); try{ await f(G); } finally { busy=false; GM.sceneEnd(); } return true; };
  S.look=GM=>inShop(GM,async()=>{ await GM.say(null,S.L.look); });
  S.tryPlay=GM=>{ const G=GM&&GM.G; if(!G||!S.canTry(G)) return Promise.resolve(false); return inShop(GM,async()=>{ await GM.say(null,S.L.tryPlay); }); };
  /* 老闆的話（輪流）：一次進店說一句（GM.enterN；測試沒有＝每次都說）*/
  S.bossLine=async function(GM){ const G=GM.G, r=S.rec(G), n=GM.enterN|0; if(n>0&&r.bossN===n) return null; r.bossN=n; const L=S.L.boss, t=L[(r.boss|0)%L.length]; r.boss=(r.boss|0)+1; await GM.say(BOSS,t); return t; };
  S.shop=GM=>inShop(GM,async G=>{ await S.bossLine(GM);
    const opts=S.menu(G), k=await GM.choose(opts.concat([{t:'不用了'}])), o=opts[k]; if(!o) return;
    const it=S.ITEMS.find(q=>q.id===o.id), res=S.buy(G,o.id,GM.money?d=>GM.money(d):null);
    if(res==='poor'){ if(GM.toast) GM.toast('錢不夠'); return; } if(res!==true) return;
    if(GM.advance) GM.advance(0.15);
    if(it.guitar){ await GM.say(null,S.L.tuned); if(GM.memo) GM.memo('買了'+it.name); }
    else if(GM.toast) GM.toast('買了'+(/^[A-Za-z]/.test(it.name)?' ':'')+it.name,2400);
    if(GM.autosave) GM.autosave(); });
  /* ---------- 區域接線（xs_tongxian）---------- */
  S.KIND={look_guitars:'look',try:'try',buy:'shop'};
  S.layout=()=>typeof TONGXIAN_LAYOUT!=='undefined'&&TONGXIAN_LAYOUT&&TONGXIAN_LAYOUT.shop?TONGXIAN_LAYOUT.shop:null;
  S.install=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!Array.isArray(E.interactables)||!S.ZONES.includes(G.zone)) return 0; const IT=E.interactables; let n=0;
    for(const it of IT){ if(!it) continue; if(!it.guitar&&(it.kind==='look_ukes'||it.txKind==='look_ukes')&&!it.onInteract&&!it.look&&!it.exit&&!it.seat){ it.hidden=true; continue; }   /* 稿上沒有烏克麗麗的字 */
      const k=it.guitar||S.KIND[it.kind]||S.KIND[it.txKind]; if(!k||!S.L.labels[k]) continue; it.guitar=k; it.label=S.L.labels[k]; n++; }
    if(!n){ const L=S.layout(); for(const q of ((L&&L.interact)||[])){ const k=S.KIND[q.kind]; if(!k) continue; IT.push({x:q.x,z:q.z,lv:q.lv|0,radius:q.radius||0.9,label:S.L.labels[k],guitar:k}); n++; } }
    for(const it of IT) if(it&&it.guitar) it.hidden=!law(G)||(it.guitar==='try'&&!S.canTry(G));
    return n; };
  /* ---------- 偶遇子晴（第 1 節）---------- */
  S.ENC_WEEKS=[6,10,14];
  S.ZQ_OUT='guitar_zq_shop';
  S.zqShopPlanned=G=>typeof OUT!=='undefined'&&!!OUT.get&&!!OUT.get(G,S.ZQ_OUT);
  S.encDue=function(G){ if(!G||!law(G)||!S.ZONES.includes(G.zone)||S.staged) return false; const r=S.rec(G); if(r.enc!=null) return false;
    const t=term(G); if(!t||t.id!=='Y1S1'||!S.ENC_WEEKS.includes(t.week)||wd7(G.day)!==6) return false; const h=hr(G); if(h<15||h>=16) return false;
    if(!S.isOpen(G)||!knows(G)||!present(G)||abroad(G)) return false; return !S.zqShopPlanned(G); };
  S.encounter=async function(GM){ const G=GM.G; S.rec(G).enc=G.day; GM.sceneBegin({adv:{charId:ZQ,expression:'neutral'}}); try{ await EVENTS.runLines(S.D_ENC,{id:'guitar_enc',participants:[ZQ]}); } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||busy||!S.encDue(G)) return false; busy=true; S.encounter(GM).catch(e=>console.warn('GUITAR.encounter',e)).finally(()=>{ busy=false; }); return true; };
  /* ---------- 第 2 節：社課 ---------- */
  /* 去過幾次吉他社社課（出席紀錄 G.acts.att 的 club_guitar@天，聽完或中途離開都算）；exToday＝不算今天 */
  S.attended=function(G,exToday){ const A=(G&&G.acts&&G.acts.att)||{}, p=CLUB+'@'; let n=0; for(const k in A){ if(!k.startsWith(p)||!A[k]) continue; if(exToday&&+k.slice(p.length)===G.day) continue; n++; } return n; };
  /* 今天以前去過社課（舊存檔：出席紀錄以外，初遇記的 guitarFirstDay、ev_ziqing_club 演過的那天在今天以前也算）*/
  S.beenBefore=function(G){ if(S.attended(G,true)>0) return true; const F=G.flags||{}, L=(G.events&&G.events.last)||{}; return (F.guitarFirstDay!=null&&F.guitarFirstDay<G.day)||(L.ev_ziqing_club!=null&&L.ev_ziqing_club<G.day); };
  S.c21Due=G=>law(G)&&S.rec(G).c21==null&&!S.beenBefore(G);
  S.clubIn=async function(GM,a,ev){ const G=GM&&GM.G; if(!a||a.id!==CLUB||!G||!S.c21Due(G)) return null; const r=S.rec(G);
    if(S.hasGuitar(G)){ r.c21='own'; return null; }   /* 第一次去就有自己的琴：稿是「你沒有」＝不演 */
    r.c21=G.day; if(typeof ADV!=='undefined'&&ADV.begin&&!ADV.active) ADV.begin({background:'blur'});
    await EVENTS.runLines(S.D21,{id:'guitar_2_1'}); return {narr:S.L.c21Narr}; };
  S.kaiMate=G=>typeof STORY==='undefined'||!STORY.kaiRoommate||!!STORY.kaiRoommate(G);
  const hash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  S.loanRoll=d=>hash('guitar_loan:'+d)%3===0;   /* 「偶爾」：照日期約三分之一 */
  S.lastClub=G=>{ const A=(G&&G.acts&&G.acts.att)||{}, p=CLUB+'@'; let best=null; for(const k in A){ if(!k.startsWith(p)||!A[k]) continue; const d=+k.slice(p.length); if(d<G.day&&(best==null||d>best)) best=d; } return best; };
  S.narrX=function(G,a){ if(!a||a.id!==CLUB||!G||!law(G)) return null; const t=term(G); if(!t) return null; const r=S.rec(G);
    if(S.hasGuitar(G)){ if(t.week>=7&&r.narrX[t.id]==null&&S.kaiMate(G)){ r.narrX[t.id]=G.day; return S.L.ownNarr; } return null; }
    if(r.c21===G.day) return null; const prev=S.lastClub(G); if(r.loanDay!=null&&r.loanDay===prev) return null;
    if(S.loanRoll(G.day)){ r.loanDay=G.day; return S.L.loanNarr; } return null; };
  /* 2-2：第 6 週週三社課結束 */
  S.c22Ok=G=>law(G)&&!S.hasGuitar(G)&&S.beenBefore(G)&&present(G)&&!abroad(G);
  S.planZqShop=function(G){ if(typeof OUT==='undefined'||!OUT.plan) return false; const d=TD('Y1S1',6,6); if(d==null||now(G)>=T(d,15.75)) return false;
    return OUT.plan(G,{id:S.ZQ_OUT,ev:'ev_guitar_zq_shop',day:d,h:15,place:'同弦樂器',title:'和子晴去同弦',travel:'走路 約 10 分鐘',travelH:1/6,alarm:true}); };
  S.cancelZqShop=function(G){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,S.ZQ_OUT):null; if(q&&q.state==='planned'){ q.state='missed'; q.cancel='own'; return true; } return false; };
  /* 2-3：三個選項（錢不夠的那一把：「錢不夠」，再選一次）→ 她的回答 → 買了＝九折、調音裝袋 */
  S.zqPick=async function(GM){ const G=GM.G; let o=null;
    for(let n=0;n<6;n++){ const opts=S.PICK_OPTS.map(q=>({t:q.t,id:q.id,dim:!!q.id&&(G.money|0)<S.price(G,q.id)})); const k=await GM.choose(opts); o=opts[k]||opts[2];
      if(o.id&&(G.money|0)<S.price(G,o.id)){ if(GM.toast) GM.toast('錢不夠'); o=null; continue; } break; }
    if(!o) o={id:null,t:S.PICK_OPTS[2].t};
    if(typeof ADV!=='undefined'&&ADV.log) ADV.log(G.name,'▶ '+o.t);
    await EVENTS.runLines(S.D_ZQPICK[o.id||'none'],{id:'ev_guitar_zq_shop',participants:[ZQ]});
    if(o.id&&S.buy(G,o.id,GM.money?d=>GM.money(d):null,{zqShop:true})===true){ await GM.say(null,S.L.tuned); if(GM.memo) GM.memo('買了'+S.ITEMS.find(q=>q.id===o.id).name); }
    return o.id; };
  /* 2-3 的 3D：有 xs_tongxian 區域＝演之前換到店裡（試琴椅、子晴站在旁邊），畫面模糊；演完回到原本的地方（OUT.STAGE，照 b1story3d.js）*/
  S.staged=null;
  S.stageZone=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[G.zone]) return null; const z=S.ZONES.find(id=>Z3.ZONES[id]); if(!z) return null;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return null; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null; if(E.player.riding||(G.flags&&G.flags.companion)) return null; return z; };
  S.outingStage=async function(GM,q,ev){ if(!ev||ev.id!=='ev_guitar_zq_shop') return null; const z=S.stageZone(GM); if(!z) return null; const G=GM.G, P=GM.E.player;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const L=S.layout()||{}, seat=(L.seats||[]).find(s=>s.label==='試彈'), zq=L.npc&&L.npc.ziqing_cg;
    S.staged=z; await GM.enter(z,seat?{x:seat.x,z:seat.z+0.6,yaw:seat.yaw||0}:(L.spawn?Object.assign({},L.spawn):undefined),{noFade:true,deferStory:true,noAutosave:true});
    if(zq&&GM.spawnCharacter){ if(GM.npc&&GM.npc[ZQ]&&GM.removeNPC) GM.removeNPC(ZQ); const n=GM.spawnCharacter(ZQ,zq.x,zq.z,{yaw:zq.yaw||0,pose:'idle'}); if(n) n.frozen=true; }
    if(seat&&GM.sitAt) GM.sitAt(P,{x:seat.x,z:seat.z,yaw:seat.yaw||0,lv:0});
    let done=false; return {restore:async()=>{ if(done) return; done=true; S.staged=null; if(P.seat&&GM.standUp) GM.standUp(P); await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  /* 宿舍「彈吉他」（2-4）*/
  S.playDorm=async function(GM){ const G=GM.G, L=S.kaiMate(G)?S.L.dorm:S.L.dorm.slice(1), t=L[Math.min(L.length-1,Math.floor(S.rand()*L.length))];
    await GM.fade(true); if(GM.advance) GM.advance(0.5); await GM.fade(false); await GM.say(null,t); const r=S.rec(G); r.dorm=(r.dorm|0)+1; if(GM.autosave) GM.autosave(); return t; };
  S.room=function(G,L){ if(G&&G.flags&&S.hasGuitar(G)&&law(G)) L.push([S.L.dormLabel,[],GM=>S.playDorm(GM)]); };
  /* ---------- 第 3 節：社遊 ---------- */
  S.TRIPS={ y1s1:{term:'Y1S1',ann:[11,1,21],day:[12,6],h:8,cost:2500,post:S.L.yilanPost,ev:'ev_guitar_trip_yilan',title:'宜蘭兩天一夜',out:'guitar_trip_yilan'},
            y1s2:{term:'Y1S2',ann:[10,1,21],day:[10,6],h:12,cost:600,post:S.L.ymsPost,ev:'ev_guitar_trip_yms',title:'陽明山一日',out:'guitar_trip_yms'} };
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
  const nextDay=(k,h)=>G=>{ const d=S.tripDay(k); if(d!=null) S.jump(G,d+1,h); return 0; };
  /* 子晴社遊那段時間的作息（STORY.SCHED_X）：不在校園、公館 */
  S.sched=function(c,G){ if(!c||c.id!==ZQ||!G||!law(G)) return null; const h=+G.hour||0;
    const y=S.tripDay('y1s1'), m=S.tripDay('y1s2'), ent=(from,to)=>({days:[wd7(G.day)],from,to,zone:null,act:'out',away:'吉他社社遊',note:'AA_619 第 3 節（src/guitar3d.js）'});
    if(y!=null&&G.day===y&&h>=8) return ent(8,24); if(y!=null&&G.day===y+1&&h<17) return ent(0,17); if(m!=null&&G.day===m&&h>=12&&h<19.5) return ent(12,19.5); return null; };
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
        N('（子晴已經在樓梯口了，耳機掛在脖子上。）'), Z('走。'), N('（老闆看到子晴，點了一下頭。）'), B('又來了。0.12？'), Z('嗯。……他要買琴。'),
        N('（你拿下兩把試。一把三千八，一把六千五。）'), {cg:S.CG.trial},
        Z('彈 G。……換 C。……再彈一次 G。'), Z('哪一把比較好按？'),
        {call:async(G,GM)=>{ await S.zqPick(GM); }},
        {scene:'新生南路',bg:false}, Z('有自己的琴以後，回家才會彈。……社團的琴你不會帶回家。') ] },
    /* 3-1 宜蘭兩天一夜（第 12 週週六～週日）*/
    { id:'ev_guitar_trip_yilan', title:'宜蘭兩天一夜', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', portraitLater:true, hours:2,
      dialogue:[ {scene:'遊覽車上',bg:'tour_bus'}, N('（車上有人彈吉他，後面的人跟著唱。唱到一半，司機把收音機關了。）'),
        {advance:toH(14)}, {scene:'外澳海邊',bg:'trip_sea'}, N('（大家在沙灘上排成一圈彈唱。風很大，譜一直被吹走。）'), N('子晴坐在圈子外面一點的地方，沒有彈，在看海。'),
        {choice:[{text:'「去跟子晴說話。」',goto:'sea_talk'},{text:'「留在圈子裡唱。」',goto:'sea_sing'}]},
        {label:'sea_talk'}, Z('我在聽浪。……它的節奏一直在變。'), {goto:'night'},
        {label:'sea_sing'}, N('（你唱了三首。子晴回來的時候，手機在錄浪的聲音。）'),
        {label:'night'}, {advance:toH(19)}, {scene:'宜蘭・民宿',bg:'yilan_minsu_night'},
        {choice:[{text:'「彈社課教的那首。」',goto:'play'},{text:'「我不彈，我幫大家拍照。」',goto:'photo'}]},
        {label:'play'}, {unless:{flags:['OWN_GUITAR']},set:{BORROWED_ZQ_GUITAR:true}}, N('（你彈錯了兩個地方。大家照樣拍手。）'), {goto:'roof'},
        {label:'photo'}, N('（你拍了很多張。子晴那張，她剛好在笑。）'),
        {label:'roof'}, {advance:nextDay('y1s1',0.25)}, {scene:'民宿頂樓',bg:'yilan_minsu_roof'},
        N('（十二點多，樓下還在唱歌。你上頂樓透氣，子晴已經在了，抱著吉他。）'), {cg:S.CG.roof},
        N('（她彈了一段你沒聽過的旋律。很短，彈完就停了。）'),
        {choice:[{text:'「那是什麼歌？」',goto:'r_ask'},{text:'（不說話，坐在旁邊聽。）',goto:'r_listen'}]},
        {label:'r_ask'}, Z('……沒有名字。我自己寫的。'), Z('還沒寫完。你不要跟別人說。'), {goto:'r_tune'},
        {label:'r_listen'}, N('（她又彈了一次，彈到同一個地方停下來。）'), Z('……這邊我一直寫不下去。'),
        {label:'r_tune'}, {set:{ZQ_ROOFTOP_TUNE:true},mem:[{npc:ZQ,tag:'HEARD_HER_SONG',note:''}]},
        {choice:[{text:'「我覺得很好聽。」',goto:'r_nice'},{text:'「慢慢寫就好。」',goto:'r_slow'}]},
        {label:'r_nice'}, Z('你又聽不出來好不好。'), N('（停一下）'), Z('……謝了。',{unless:DH}), Z('……你明天坐我旁邊。',{if:DH}), {goto:'back'},
        {label:'r_slow'}, Z('嗯。'), N('（她把吉他收進琴袋）'), Z('明天要早起，學長說要去吃卜肉。',{unless:DH}), Z('……你明天坐我旁邊。',{if:DH}),
        {label:'back'}, {advance:nextDay('y1s1',15)}, {scene:'遊覽車上',bg:'tour_bus'},
        Object.assign(N('（回程車上大家都睡了。你旁邊的子晴把耳機分了一邊給你，沒說是什麼歌。）'),{if:{flags:['ZQ_ROOFTOP_TUNE']}}),
        Object.assign(N('（回程車上大家都睡了。）'),{unless:{flags:['ZQ_ROOFTOP_TUNE']}}) ] },
    /* 3-2 陽明山一日（大一下第 10 週週六）*/
    { id:'ev_guitar_trip_yms', title:'陽明山一日', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', portraitLater:true, hours:5.5,
      dialogue:[ {advance:toH(14)}, {scene:'擎天崗草原',bg:'yms_grassland'}, N('子晴這次在圈子裡彈。'),
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
    if(Array.isArray(STORY.ROOM_EXTRA)&&!STORY.ROOM_EXTRA.includes(S.room)) STORY.ROOM_EXTRA.push(S.room);
    if(Array.isArray(STORY.SCHED_X)&&!STORY.SCHED_X.includes(S.sched)) STORY.SCHED_X.push(S.sched);
    if(!STORY._guitar){ STORY._guitar=true;
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(S.ZONES.includes(zoneId)) S.install(GM); }catch(e){ console.warn('GUITAR.install',e); } return r; }; }
      if(STORY.interact){ const i0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.guitar&&G){ if(it.guitar==='look') await S.look(GM); else if(it.guitar==='try') await S.tryPlay(GM); else if(it.guitar==='shop') await S.shop(GM); return true; }
        if(it&&it.exit&&G&&S.ZONES.includes(it.exit.to)&&!S.isOpen(G)){ if(GM.toast) GM.toast(S.closedText(G),4500); return true; }   /* 新生南路的店門：營業時間外、颱風天上不去（寫開放時間）*/
        return i0.apply(this,arguments); }; } } }
  return S;
})();
