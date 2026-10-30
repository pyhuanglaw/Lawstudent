/* ===== 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54＋第 3 節大三寒暑假的停留日（AA-C 定稿 e284d601；台詞照原文、不改字）=====
   事件（出遊、電話、視訊、在場景裡碰到的）在 src/data/r2y3b_events.js（R2Y3B_EVENTS）。這裡用掛勾接進去，不改 story3d.js：
   - STORY.PHONE_RULES：手機（邀約、出發提醒 OUT.plan、沒去的照片、結果）；
   - STORY.TICKS：時間到了自動演的 2D（日本路線的便利商店、河堤、宿舍大廳；回答.exe；美國路線退宿）；
   - 一天的作息（以安 3/9 椰林大道、Alison 3/16 霖澤館一樓、芯慈 5/4 麵店）：載入時放到她們 daily_schedule 的最前面（同 AA_320 118 巷那一套的寫法）；
   - 寒暑假的停留日（AA_326 第 3 節）：HOME.BREAK_PTS 的 Y3W、Y3S（每條路線一樣的）＋HOME.STOPS（照路線的）＋摘要日、抽籤、信封的旁白（包住 HOME.breakArrive；不改快轉主邏輯）；
   - 學期末專屬版（2-Y3-46 芷若 Z13、2-Y3-47 子晴 Q15）：TERMEND_LINES.HEART 的 over＋包住 TERMEND 的 plan、planDinner、dinner、walkHome、missed（F3 另外包 heartWhy）；
     Z13 帶到場、Q15「回答.exe」：STORY.TICKS、在家＝STORY.y4HomeDue／y4HomeScene／y4FromHome 那一串（同 y34b3d.js）、STORY.WAKE_AT（23:00）、HOME.STOPS；
   - 主線 10 第四個房間多一件（2-Y3-54）：包住 STORY.roomY4Items、STORY.ROOM_Y4_TEXT 加三件。
   時間：日本路線在日本的場景（便利商店、河堤、町公所、宿舍大廳）用日本時間寫：S.jp(h)＝日本 h 點的臺灣時間。
     遊戲時鐘＝玩家所在地的時間（日本路線 3/25～8/5 人在日本＝日本時間：y34b3d.js 出發時把時鐘設成日本 16:00；AA_341 J-S7、J-S13；日本的據點在 src/jp3d.js）。
     所以排時間一律換成玩家手機的時間：臺灣那邊的時間用 lt(G,d,h)（人在日本 +1）、日本那邊的時間用 jt(G,d,h)（人在日本＝h；在臺灣＝h−1）。
   測試：node tests/r2y3b_events_unit.js */
'use strict';
const R2Y3B=(function(){
  const S={};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const past=(G,key,h)=>{ const d=D(key); return d!=null&&now(G)>=T(d,h); };
  const hh=G=>((G.hour%24)+24)%24;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const met=(G,id,lv)=>knows(id,G)&&stageAt(id,lv);   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段 */
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const datingAny=G=>LOVE.some(x=>dating(G,x));
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const law=G=>(G.stage||'law')==='law';
  const grp=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team');
  const dmOk=(G,id)=>contact(G,id)||grp(G);   /* 麵店團的人：在群組裡就私訊得到 */
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.route=route;
  const isJP=G=>route(G)==='JP', isUS=G=>route(G)==='US', isTW=G=>!isJP(G)&&!isUS(G);   /* 台灣路線＝不是 JP、也不是 US（未決定也算） */
  const abroad=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));
  const inJP=(G,day)=>isJP(G)&&abroad(G,day);
  S.inJP=inJP;
  S.anRepair=G=>isJP(G)&&!dating(G,'heroine_01');   /* 日本路線、和以安不在交往中＝挽回中（AA_253 第 5 節：志願表交了以後分手的照樣去日本）*/
  S.jp=h=>h-1;   /* 日本時間 h 點＝臺灣時間 h−1 點（STORY.tzOffset 日本 +1）；排時間用下面的 jt */
  const lt=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,d):0);   /* 臺灣時間 h → 那一天玩家手機的時間（人在日本 +1；AA_341 J-S7）*/
  const jt=(G,d,h)=>lt(G,d,S.jp(h));   /* 日本時間 h → 玩家手機的時間（人在日本＝h；在臺灣＝h−1）*/
  S.lt=lt; S.jt=jt;
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const out=()=>typeof OUT!=='undefined'?OUT:null;
  const plan=(G,o)=>{ const O=out(); return !!O&&O.plan(G,o); };
  const outGet=(G,id)=>{ const O=out(); return O?O.get(G,id):null; };
  const M=(th,from)=>t=>({th,from,text:t});
  const NG='g:noodle_team';
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const mark=(G,id)=>{ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const inc=(G,k,n)=>{ G.flags[k]=(+G.flags[k]||0)+(n==null?1:n); };
  S.kxRub=G=>inc(G,'KX_RUB');   /* 可昕「放鴿子」（AA_288 第 3 節：她排的見面改期或遲到超過 15 分鐘 +1）*/

  /* ===================== 一天的作息（放到最前面＝蓋過同時段的一般作息）===================== */
  S.SCHED={
    heroine_01:[{days:[4],from:12,to:12+40/60,zone:'campus',act:'wander',terms:['Y3S2'],weeks:[3],dates:[['2028-03-09','2028-03-09']],note:'AA_326 2-Y3-28：杜鵑花第三張，椰林大道（只有這一天）'}],
    yu:[{days:[4],from:12.5,to:13,zone:'linze',act:'linger',at:[5.0,3.0,Math.PI/2],label:'在霖澤館一樓等你',terms:['Y3S2'],weeks:[4],dates:[['2028-03-16','2028-03-16']],if:{flags:['YU_C6_MEET']},note:'AA_326 2-Y3-29：C6 社團的錢，回了「有。十二點半，霖澤館一樓。」才在'}] };
  S.addSched=function(){ if(typeof CHARACTERS==='undefined') return; for(const id in S.SCHED){ const c=CHARACTERS[id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); for(const e of S.SCHED[id].slice().reverse()) if(!L.includes(e)) L.unshift(e); } };   /* 檔尾（全部加完以後）叫一次 */

  /* ===================== 麵店團的群戲：邀約（不在群組＝阿哲私訊）＋出發提醒＋沒去的照片（照 story3d.js 大二的 v3 清單）===================== */
  S.GROUP=[
    {id:'y3s2_first_meal',ev:'ev_y3s2_first_meal',key:'2028-02-22',inv:[0,17,['大三下第一頓 七點 長桌']],h:19,place:'阿鳳麵店',title:'開學第一頓（大三下）',travel:'走過去約 15 分鐘',travelH:0.25},   /* 2-Y3-26 */
    {id:'y3s2_228',ev:'ev_y3s2_228',key:'2028-02-28',inv:[-1,21,['明天放假 河濱 兩點','Alison 說要帶風箏']],h:14,place:'公館的河濱',title:'228 河濱',travel:'走過去約 15 分鐘',travelH:0.25} ];   /* 2-Y3-27 */
  S.groupPhone=function(G){ for(const q of S.GROUP){ const d=D(q.key); if(d==null) continue; const di=d+q.inv[0]; if(G.day<di||G.day>d) continue; if(q.when&&!q.when(G)) continue;
      if(now(G)<T(di,q.inv[1])||PHONE.sent(G,q.id+'_ask')) continue;
      const g=grp(G); if(!g&&!knows('zhe',G)) continue; const Z=M(g?NG:'p:zhe','zhe');
      PHONE.at(G,di,G.day===di?Math.max(q.inv[1],hh(G)):q.inv[1],q.inv[2].map(Z),q.id+'_ask');
      if(!outGet(G,q.id)&&(G.day<d||hh(G)<q.h+0.25)) plan(G,{id:q.id,ev:q.ev,day:d,h:q.h,late:0.25,place:q.place,title:q.title,travel:q.travel,travelH:q.travelH}); } };
  /* 2-Y3-26 沒去：21:30 群組（阿哲）*/
  S.firstMealPhoto=G=>{ const d=D('2028-02-22'); if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[{th:NG,from:'zhe',text:'（照片：長桌上六碗麵，以安那碗加了兩顆滷蛋）'}],'y3s2_first_meal_photo'); };
  /* 2-Y3-27 沒去：17:30 群組（Alison）*/
  S.r228Photo=G=>{ const d=D('2028-02-28'); if(d!=null&&grp(G)) PHONE.at(G,d,17.5,[{th:NG,from:'yu',text:'（照片：河濱的天空，一個風箏卡在樹上）'},{th:NG,from:'yu',text:'是風的問題！！'}],'y3s2_228_photo'); };

  /* ===================== 2-Y3-28 杜鵑花第三張：12:40 以安在麵店團群組（不在群組、和她 FRIEND 以上＝私訊同兩則）===================== */
  S.azaleaPhone=function(G){ const d=D('2028-03-09'); if(d==null||G.day<d||G.day>d+7||now(G)<T(d,12+40/60)||PHONE.sent(G,'y3_azalea')||!knows('heroine_01',G)) return;
    const g=grp(G); if(!g&&!(stageAt('heroine_01','FRIEND')&&contact(G,'heroine_01'))) return; const A=M(g?NG:'p:heroine_01','heroine_01');
    PHONE.at(G,d,12+40/60,[A('（照片：杜鵑花。和前兩年同一個位置。）'),A('第三張。')],'y3_azalea'); };

  /* ===================== 2-Y3-29 C6 Alison 的社團經費 ===================== */
  /* 手機版（選「現在說？」）：照 Alison 的訊息習慣拆開（不打句號、連發；AA_326 2-Y3-29），選項一樣 */
  const YU_SPLIT=t=>t.split('。').map(x=>x.replace(/，/g,' ').trim()).filter(Boolean);
  S.C6_PHONE={open:['欸，成發的錢對不起來。少了三千。經手的是學弟。','我不想讓他覺得我在懷疑他。可是三千塊。'],
    opts:[{k:'pay',t:'要學弟賠。',r:'……他是學弟耶。我先不要這樣。'},{k:'open',t:'把帳攤開，請大家補單據。',r:'……好。這樣比較不像在抓人。'},{k:'rule',t:'社團的錢是大家的。先照社團的規則，把收支表和單據放在一起。',r:'對！我們社團有規則！……我去找出來。',assoc:true}],
    ask:'妳真正想要的是什麼？',ans:'……我想要帳對得起來，學弟也還會來社課。',last:'那先找社團的指導老師。這個不用去法服。'};
  S.c6PhoneItems=function(G){ const C=S.C6_PHONE, Y=t=>({from:'yu',text:t}), P=t=>({from:'player',text:t});
    const items=[].concat(...C.open.map(YU_SPLIT)).map(Y), opts=C.opts.filter(o=>!o.assoc||!!G.flags.U_ASSOC).map(o=>({t:o.t,set:{YU_C6:o.k},say:YU_SPLIT(o.r).map(Y).concat([P(C.ask)],YU_SPLIT(C.ans).map(Y),[P(C.last)])}));
    items[items.length-1]=Object.assign(items[items.length-1],{ask:{id:'y3_yu_c6_phone',opts}}); return items; };
  S.c6MeetDue=G=>{ const d=D('2028-03-16'); return d!=null&&G.day===d&&hh(G)>=12.5&&hh(G)<13&&G.flags.YU_C6_MEET===true&&!G.flags.YU_C6; };
  S.c6Phone=function(G){ const d15=D('2028-03-15'), d16=D('2028-03-16'), d23=D('2028-03-23'); if(d15==null||G.day<d15||G.day>d23+7) return; const F=G.flags;
    if(now(G)>=T(d15,21)&&!PHONE.sent(G,'y3_yu_c6')&&met(G,'yu','FAMILIAR')&&dmOk(G,'yu')&&G.day<=d16){ const Y=M('p:yu','yu');
      PHONE.at(G,d15,21,[Y('欸'),Y('你明天中午有空嗎'),Object.assign(Y('社團的錢的事 想問你'),{ask:{id:'y3_yu_c6',until:T(d16,12.5),opts:[
        {t:'有。十二點半，霖澤館一樓。',say:[{from:'yu',text:'好！！'}],set:{YU_C6_MEET:true}},{t:'現在說？',say:S.c6PhoneItems(G)}]}})],'y3_yu_c6'); }
    if(F.YU_C6&&F.YU_C6_DAY==null) F.YU_C6_DAY=G.day;   /* 手機版回了（當面版在事件裡 stamp）*/
    /* 結果：AA_497 3-6（企劃線 7a38216ca）改成照 C6 走的那一路、C6 之後第 14 天 21:00 她私訊三則（src/sup497_3d.js 的 yu_c6_after）。
       原本 3/23 21:40 不管選什麼都一樣的「找到了！！……（貼圖：一隻鞠躬的熊）」（AA_326，記 YU_CLUB_BEAR）拿掉；舊存檔已經收過的照舊在手機裡 */ };

  /* ===================== 2-Y3-30 可昕 K18「最輕鬆的一學期」===================== */
  S.k18Phone=function(G){ const d15=D('2028-03-15'), d18=D('2028-03-18'); if(d15==null||G.day<d15||G.day>d18+1||!dating(G,'kexin')) return; const F=G.flags, K=M('p:kexin','kexin');
    if(now(G)>=T(d15,21.5)&&now(G)<T(d18,8)&&!PHONE.sent(G,'y3_kx_k18'))
      PHONE.at(G,d15,21.5,[K('這週六早上八點，開車。去一個我們兩個都沒去過的地方。'),Object.assign(K('……地方你到了就知道。'),{ask:{id:'y3_kx_k18',until:T(d15+1,18),opts:[
        {t:'好。八點，政大校門口。',say:[{from:'kexin',text:'好。不要遲到。'}],set:{KX_K18_GO:true}},{t:'這週不行。',say:[{from:'kexin',text:'……好。那我跟予樂去。'}],set:{KX_K18:'missed'}}]}})],'y3_kx_k18');
    if(F.KX_K18_GO===true&&!outGet(G,'y3_kx_k18')&&now(G)<T(d18,8.25)) plan(G,{id:'y3_kx_k18',ev:'ev_kexin_k18',day:d18,h:8,late:0.25,place:'政大校門口（先回家取車）',title:'和可昕：開車去沒去過的地方',travel:'回家取車約 30 分鐘，再開到政大接她',travelH:40/60,back:'送她回政大，再把車開回家。'});
    { const m=PHONE.byAsk(G,'y3_kx_k18'); if(m&&m.ans==null&&now(G)>T(d15+1,18)&&!F.KX_K18) F.KX_K18='missed'; }   /* 沒回：她跟予樂去（不算放鴿子）*/
    if(F.KX_K18==='missed'&&now(G)>=T(d18,18)&&!PHONE.sent(G,'y3_kx_k18_photo')) PHONE.at(G,d18,18,[K('（照片：她和予樂在月台上）'),K('你的位子，予樂坐了。')],'y3_kx_k18_photo'); };
  /* 答應了、08:15 還沒到：演出來的電話＋18:00 那張照片；KX_RUB +1 */
  S.k18Missed=function(G,GM,q){ const F=G.flags; F.KX_K18='missed'; S.kxRub(G); const d=D('2028-03-18');
    plan(G,{id:'y3_kx_k18_call',ev:'ev_kexin_k18_call',day:G.day,h:Math.max(8.25,G.hour),late:0.5,must:true,place:'電話',title:'可昕打電話來',verb:'接起來',travel:'',travelH:0,back:'電話掛了。'});
    if(d!=null&&typeof PHONE!=='undefined') PHONE.at(G,d,18,[{th:'p:kexin',from:'kexin',text:'（照片：她和予樂在月台上）'},{th:'p:kexin',from:'kexin',text:'你的位子，予樂坐了。'}],'y3_kx_k18_photo'); };

  /* ===================== 2-Y3-31 SK13 阿勳的那條路：玩過經濟系那一年、認識阿勳（econ_zhengxun FIRST_MET）===================== */
  const silentContact=(G,id)=>{ if(typeof INV==='undefined') return; INV.rec(G); if(G.contacts[id]==null) G.contacts[id]=G.day; };
  S.xunPhone=function(G){ const d14=D('2028-03-14'), d22=D('2028-03-22'); if(d14==null||G.day<d14||G.day>d22+1||!knows('econ_zhengxun',G)) return; const F=G.flags, X=M('p:econ_zhengxun','econ_zhengxun');
    if(now(G)>=T(d14,21)&&now(G)<T(d22,15)&&!PHONE.sent(G,'y3_xun_path')){ silentContact(G,'econ_zhengxun');
      PHONE.at(G,d14,21,[Object.assign(X('下週三我報告。你可以坐後面，不用聽懂。'),{ask:{id:'y3_xun_path',until:T(d14+1,18),opts:[
        {t:'我去。',say:[{from:'econ_zhengxun',text:'嗯。三點，社科院。'}],set:{XUN_PATH_GO:true}},{t:'那天不行。',say:[{from:'econ_zhengxun',text:'嗯。'}],set:{XUN_PATH_GO:false}}]}})],'y3_xun_path'); }
    if(F.XUN_PATH_GO===true&&!outGet(G,'y3_xun_path')&&now(G)<T(d22,15.25)) plan(G,{id:'y3_xun_path',ev:'ev_xun_path',day:d22,h:15,late:0.25,place:'社科院',title:'阿勳的研究發表',travel:'走過去約 10 分鐘',travelH:1/6});
    if(PHONE.sent(G,'y3_xun_path')&&now(G)>=T(d22,16+40/60)&&!done(G,'ev_xun_path')&&!(outGet(G,'y3_xun_path')||{}).arrived) S.xunPhoto(G); };   /* 沒去（婉拒、沒回、沒到）：16:40 */
  S.xunPhoto=G=>{ const d=D('2028-03-22'); if(d!=null) PHONE.at(G,d,16+40/60,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'（照片：報告結束的投影幕）'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'沒人問問題。我很安全。'}],'y3_xun_photo'); };

  /* ===================== 2-Y3-33 語 4：第 3～6 週沒在傅鐘遇到＝4/2（日）21:00 她打來（日本路線 3/25 以後＝視訊，日本 22:00）===================== */
  S.yu4Phone=function(G){ const d=D('2028-04-02'); if(d==null||G.day!==d||hh(G)>=lt(G,d,21.5)||done(G,'ev_yu_alone_breakfast')||outGet(G,'y3_yu4_call')||!met(G,'yu','FAMILIAR')||!dmOk(G,'yu')) return; const v=inJP(G);
    plan(G,{id:'y3_yu4_call',ev:'ev_yu_alone_call',day:d,h:lt(G,d,21),late:0.5,place:v?'視訊':'電話',title:v?'Alison 打視訊來':'Alison 打電話來',verb:'接起來',no:'先不接',travel:'',travelH:0,back:v?'視訊結束。':'電話掛了。'}); };

  /* ===================== 日本路線在日本的場景（出遊的 2D：從日本的據點 src/jp3d.js 出發、演完回到據點；日本時間 jt）===================== */
  /* 2-Y3-34 J1 3/26 日本 22:00 便利商店（自動：只有「出發」）；2-Y3-35 G10 4/2 日本 15:00 河堤（修過日文：japanese_1／japanese_2 去上過課）*/
  S.tookJapanese=G=>{ const A=(typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G).attend:(G.courses&&G.courses.attend))||{}; return (A.japanese_1|0)>0||(A.japanese_2|0)>0; };
  S.jpPhone=function(G){ if(!inJP(G)) return; const d26=D('2028-03-26'), d02=D('2028-04-02');
    if(d26!=null&&G.day>=d26-1&&G.day<=d26&&!outGet(G,'y3_an_j1')&&now(G)<T(d26,jt(G,d26,22)+2)) plan(G,{id:'y3_an_j1',ev:'ev_an_konbini',day:d26,h:jt(G,d26,22),late:2,must:true,place:'大學城的便利商店',title:'晚上十點的便利商店（日本 22:00）',travel:'走過去約 5 分鐘',travelH:1/12,back:'回到宿舍。'});
    if(d02!=null&&G.day>=d02-1&&G.day<=d02&&S.tookJapanese(G)&&!outGet(G,'y3_liheng')&&now(G)<T(d02,jt(G,d02,15)+1)) plan(G,{id:'y3_liheng',ev:'ev_liheng_japan',day:d02,h:jt(G,d02,15),late:1,place:'大學城的河堤',title:'大學城的河堤（日本 15:00，櫻花季）',travel:'走過去約 10 分鐘',travelH:1/6,back:'回到宿舍。'}); };

  /* ===================== 2-Y3-36 清明 頂樓烤吐司：日本路線＝20:30 群組照片；台灣、美國路線沒去＝22:00 照片 ===================== */
  S.GROUP.push({id:'y3s2_roof_toast',ev:'ev_y3s2_roof_toast',key:'2028-04-03',inv:[0,17,['今晚頂樓 烤吐司','果醬自己帶']],h:20,place:'宿舍頂樓',title:'頂樓烤吐司',travel:'走上頂樓約 1 分鐘',travelH:1/60,when:G=>!isJP(G)});
  S.toastPhone=function(G){ const d=D('2028-04-03'); if(d==null||G.day<d||G.day>d+2||!isJP(G)||!grp(G)||now(G)<T(d,lt(G,d,20.5))) return;
    PHONE.at(G,d,lt(G,d,20.5),[{th:NG,from:'zhe',text:'（照片：頂樓，烤箱旁邊一排吐司）'},{th:NG,from:'zhe',text:'你那邊有吐司嗎'}],'y3s2_toast_jp'); };
  S.toastPhoto=G=>{ const d=D('2028-04-03'); if(d!=null&&grp(G)) PHONE.at(G,d,22,[{th:NG,from:'zhe',text:'（照片：烤箱旁邊一排烤焦的吐司）'}],'y3s2_toast_photo'); };

  S.isDay=(G,key)=>{ const d=D(key); return d!=null&&G.day===d; };
  S.before=(G,key)=>{ const d=D(key); return d!=null&&G.day<d; };

  /* ===================== 2-Y3-37 CG-23 春天的河堤（日本路線、和以安交往中）：4/7 日本 21:00 她約；4/8 日本 16:30 河堤；沒去＝日本 18:00 照片 ===================== */
  S.sakuraPhone=function(G){ const d7=D('2028-04-07'), d8=D('2028-04-08'); if(d7==null||G.day<d7||G.day>d8+1||!inJP(G,d8)) return; const F=G.flags, A=M('p:heroine_01','heroine_01');
    if(dating(G,'heroine_01')&&now(G)>=T(d7,jt(G,d7,21))&&now(G)<T(d8,jt(G,d8,16.5))&&!PHONE.sent(G,'y3_an_sakura'))
      PHONE.at(G,d7,jt(G,d7,21),[A('明天下午四點半，大學城的河堤。'),Object.assign(A('我帶書。你也帶。'),{ask:{id:'y3_an_sakura',until:T(d8,jt(G,d8,16.5)),opts:[
        {t:'好。',say:[{from:'heroine_01',text:'嗯。'}],set:{AN_SAKURA_GO:true}},{t:'明天不行。',say:[{from:'heroine_01',text:'好。……櫻花下週就謝了。我拍給你。'}],set:{AN_SAKURA_GO:false}}]}})],'y3_an_sakura');
    if(F.AN_SAKURA_GO===true&&!outGet(G,'y3_an_sakura')&&now(G)<T(d8,jt(G,d8,16.5)+0.5)) plan(G,{id:'y3_an_sakura',ev:'ev_an_sakura_riverbank',day:d8,h:jt(G,d8,16.5),late:0.5,place:'大學城的河堤',title:'和以安：大學城的河堤（日本 16:30）',travel:'走過去約 10 分鐘',travelH:1/6,back:'回到宿舍。'});
    if(PHONE.sent(G,'y3_an_sakura')&&now(G)>=T(d8,jt(G,d8,18))&&!done(G,'ev_an_sakura_riverbank')&&!(outGet(G,'y3_an_sakura')||{}).arrived) S.sakuraPhoto(G); };   /* 婉拒、沒回、沒到 */
  S.sakuraPhoto=G=>{ const d=D('2028-04-08'); if(G.flags.AN_SAKURA==null) G.flags.AN_SAKURA='missed'; if(d!=null) PHONE.at(G,d,jt(G,d,18),[{th:'p:heroine_01',from:'heroine_01',text:'（照片：河堤的櫻花，手帳攤在石階上）'},{th:'p:heroine_01',from:'heroine_01',text:'今天在這裡讀完一章。'}],'y3_an_sakura_photo'); };

  /* ===================== 2-Y3-38 主線 8「遠方」視訊（日本路線）：4/12 21:00 阿哲私訊；4/13 19:30 視訊（15 分鐘沒接＝沒接）===================== */
  S.farPhone=function(G){ const d12=D('2028-04-12'), d13=D('2028-04-13'); if(d12==null||G.day<d12||G.day>d13||!inJP(G,d13)) return; if(!(grp(G)||met(G,'zhe','FAMILIAR'))) return; const F=G.flags, Z=M('p:zhe','zhe');
    if(now(G)>=T(d12,lt(G,d12,21))&&now(G)<T(d13,lt(G,d13,19.5))&&!PHONE.sent(G,'y3_far_call'))
      PHONE.at(G,d12,lt(G,d12,21),[Object.assign(Z('明天七點半 視訊 麵店'),{ask:{id:'y3_far_call',until:T(d13,lt(G,d13,19.5)),opts:[{t:'好。',say:[{from:'zhe',text:'記得吃飯'}]},{t:'明天不行。',say:[{from:'zhe',text:'好啦 那下次'}],set:{FAR_CALL_NO:true}}]}})],'y3_far_call');
    if(G.day===d13&&PHONE.sent(G,'y3_far_call')&&F.FAR_CALL_NO!==true&&!outGet(G,'y3_far_call')&&hh(G)<lt(G,d13,19.75))
      plan(G,{id:'y3_far_call',ev:'ev_far_call_jp',day:d13,h:lt(G,d13,19.5),late:0.25,place:'視訊',title:'阿哲打視訊來（麵店，日本 20:30）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); };
  S.farPhoto=G=>{ const d=D('2028-04-13'); if(d==null) return; PHONE.at(G,d,lt(G,d,19.75),[{th:grp(G)?NG:'p:zhe',from:'zhe',text:'（照片：長桌上空著一個位子，前面放了一碗麵）'}],'y3_far_photo'); };
  /* 主線 8「遠方」美國版（AA_412 第 2 節）：9/20（三）臺灣 21:00＝美國 09:00 阿哲私訊；9/21（四）美國 07:30（臺灣 19:30）視訊（15 分鐘沒接＝沒接＝美國 07:45 照片）。
     照日本版 S.farPhone（條件：在麵店團，或和阿哲 FAMILIAR 以上；「明天不行。」記 FAR_CALL_NO、不演）；遊戲時鐘＝美國當地，臺灣的時間用 lt 換。
     日本版是晚上、美國版是早上：私訊到了就排（不等到當天），標 alarm——睡覺會在 07:00 醒（同可昕週年視訊 story3d.js kx_anniv4v：沒有鬧鐘就睡到中午錯過）；之後回「明天不行。」就取消 */
  const inUS=(G,day)=>isUS(G)&&abroad(G,day);
  S.farPhoneUS=function(G){ const d20=D('2028-09-20'), d21=D('2028-09-21'); if(d20==null||d21==null||G.day<d20||G.day>d21||!inUS(G,d21)) return; if(!(grp(G)||met(G,'zhe','FAMILIAR'))) return; const F=G.flags, Z=M('p:zhe','zhe');
    if(now(G)>=T(d20,lt(G,d20,21))&&now(G)<T(d21,lt(G,d21,19.5))&&!PHONE.sent(G,'us_far_call'))
      PHONE.at(G,d20,lt(G,d20,21),[Object.assign(Z('明天你那邊早上七點半 視訊 給我起床'),{ask:{id:'us_far_call',until:T(d21,lt(G,d21,19.5)),opts:[{t:'好。',say:[{from:'zhe',text:'記得吃飯'}]},{t:'明天不行。',say:[{from:'zhe',text:'好啦 那下次'}],set:{FAR_CALL_NO:true}}]}})],'us_far_call');
    const q=outGet(G,'us_far_call');
    if(F.FAR_CALL_NO===true){ if(q&&q.state==='planned') q.state='cancelled'; return; }
    if(PHONE.sent(G,'us_far_call')&&!q&&now(G)<T(d21,lt(G,d21,19.75)))
      plan(G,{id:'us_far_call',ev:'ev_far_call_us',day:d21,h:lt(G,d21,19.5),late:0.25,alarm:true,place:'視訊',title:'阿哲打視訊來（麵店，臺灣 19:30）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); };
  S.farPhotoUS=G=>{ const d=D('2028-09-21'); if(d==null) return; PHONE.at(G,d,lt(G,d,19.75),[{th:grp(G)?NG:'p:zhe',from:'zhe',text:'（照片：長桌上空著一個位子，前面放了一碗麵）'}],'us_far_photo'); };

  /* ===================== 2-Y3-39 語 5「一個人的電影」：4/22（六）21:00 她傳兩則；日本路線 4/24 10:00 視訊（日本 11:00）===================== */
  S.yu5Phone=function(G){ const d22=D('2028-04-22'), d24=D('2028-04-24'); if(d22==null||G.day<d22||G.day>d24||!met(G,'yu','FAMILIAR')||!dmOk(G,'yu')) return; const Y=M('p:yu','yu');
    if(now(G)>=T(d22,lt(G,d22,21))&&!PHONE.sent(G,'y3_yu5'))
      PHONE.at(G,d22,lt(G,d22,21),[Y('欸'),Object.assign(Y('我一個人在看電影。'),{ask:{id:'y3_yu5',until:T(d22+1,lt(G,d22+1,18)),opts:[{t:'哪一部？',say:[{from:'yu',text:'看完再說！！'}]}]}})],'y3_yu5');   /* 可以不回 */
    if(G.day===d24&&inJP(G)&&hh(G)<lt(G,d24,10.5)&&!has('yu','YU_ALONE')&&!outGet(G,'y3_yu5_video'))
      plan(G,{id:'y3_yu5_video',ev:'ev_yu_alone_movie_video',day:d24,h:lt(G,d24,10),late:0.5,place:'視訊',title:'Alison 打視訊來（日本 11:00）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); };
  S.SCHED.yu.push({days:[4],from:19,to:20,zone:'noodle',act:'eat',terms:['Y3S2'],weeks:[10],dates:[['2028-04-27','2028-04-27']],if:{notMemory:[{npc:'yu',tag:'YU_ALONE'}]},note:'AA_326 2-Y3-39：語 5 4/24 沒遇到，4/27 19:00 麵店長桌坐你旁邊說'});

  /* ===================== 2-Y3-40 芷若 Z11b：日本路線＝4/22 22:00 票根照片；選「那個女生是 Alison。」＝兩週後 5/8 22:07 ===================== */
  const herMate=(G,id)=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return !!(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn&&STORY.partnerOn(G,c.partner)); };
  S.z11bPhone=function(G){ const F=G.flags, d22=D('2028-04-22'), R=M('p:heroine_02','heroine_02');
    if(d22!=null&&G.day>=d22&&G.day<=d22+1&&isJP(G)&&now(G)>=T(d22,lt(G,d22,22))&&!PHONE.sent(G,'y3_zr_z11b_jp')&&met(G,'heroine_02','FAMILIAR')&&contact(G,'heroine_02')){
      const single=!datingAny(G)&&!herMate(G,'heroine_02'), v1=single&&stageAt('heroine_02','FRIEND');
      PHONE.at(G,d22,lt(G,d22,22),[R('（照片：倒數第三排的票根）'),R(v1?'今天坐這裡。旁邊空著。':'今天坐倒數第三排。那排的視角最好。')],'y3_zr_z11b_jp'); if(!F.ZR_Z11B) F.ZR_Z11B='photo'; }
    if(F.ZR_Z11B==='yu'&&F.ZR_Z11B_DAY!=null&&!PHONE.sent(G,'y3_zr_z11b_yu')){ const d8=D('2028-05-08'), d=Math.max(d8!=null?d8:0,F.ZR_Z11B_DAY+14);   /* 兩週後（4/24 那天選的＝5/8）*/
      if(now(G)>=T(d,lt(G,d,22+7/60))) PHONE.at(G,d,lt(G,d,22+7/60),[R('Alison 傳了一張票根給我。她說她也坐倒數第三排。')],'y3_zr_z11b_yu'); } };

  /* ===================== 2-Y3-41 可昕 生日（大三）===================== */
  /* KX_BDAY[3]：'met'／'video'／'declined'／'none'（'message'＝只傳了生日快樂、沒約到，同大一的值）；'none'、'declined'＝KX_RUB +1、4/25 09:00「我等了一天。」*/
  const bdRec=G=>{ const F=G.flags; if(!F.KX_BDAY||typeof F.KX_BDAY!=='object') F.KX_BDAY={}; return F.KX_BDAY; };
  S.kxBdayBoth=G=>{ const B=(G.flags&&G.flags.KX_BDAY)||{}; return B[1]!=null&&B[2]!=null&&B[1]!=='none'&&B[2]!=='none'; };   /* 大一、大二都記得 */
  S.kxBdayButton=function(G,bd){ const c=(G.msgs||[]).filter(m=>m.th==='p:kexin'&&m.day===bd&&m.ask&&/你晚上要/.test(m.text||'')); return c.find(m=>m.ans!=null)||null; };   /* 手機「生日快樂」的回問（msg2_pool 可昕 bday；AA_313 第 52 列）回了 */
  S.kxBdayPlan=(G,bd)=>plan(G,{id:'kx_bday_y3',ev:'ev_kexin_birthday_y3',day:bd,h:18,late:0.25,place:'公館',title:'可昕的生日：公館（三十分鐘）',travel:'走過去約 10 分鐘',travelH:1/6});
  S.kxBdayPhone=function(G){ const bd=D('2028-04-24'); if(bd==null||G.day<bd-1||G.day>bd+2||!dating(G,'kexin')) return; const F=G.flags, K=M('p:kexin','kexin'), B=bdRec(G), jp=inJP(G,bd);
    if(B[3]!=null) return;
    if(jp){ if(!outGet(G,'kx_bday_y3')&&now(G)<T(bd,lt(G,bd,21.5))) plan(G,{id:'kx_bday_y3',ev:'ev_kexin_birthday_y3',day:bd,h:lt(G,bd,21),late:0.5,place:'視訊',title:'可昕的生日：視訊（日本 22:00）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); }
    else {
      if(S.kxBdayBoth(G)&&now(G)>=T(bd-1,21)&&now(G)<T(bd,18)&&!PHONE.sent(G,'y3_kx_bday_ask'))
        PHONE.at(G,bd-1,21,[K('明天我生日。今年你不用想了，我想好了。'),...(F.KX_CAKE_YOU?[K('……蛋糕你挑。只有這個你挑。')]:[]),K('公館，三十分鐘，一片蛋糕。我們兩個都在趕報告。'),   /* AA_525 3-7（K-8）：大二下 K4-L5 選「下次換我挑。」（KX_CAKE_YOU）的多一句 */Object.assign(K('六點。'),{ask:{id:'y3_kx_bday_ask',until:T(bd,18),opts:[
          {t:'好。',say:[{from:'kexin',text:'好。'}],set:{KX_BDAY3_GO:true}},{t:'明天我不行。',say:[{from:'kexin',text:'……好。'}],set:{KX_BDAY3_NO:true}}]}})],'y3_kx_bday_ask');
      if(F.KX_BDAY3_GO===true&&now(G)<T(bd,18.25)) S.kxBdayPlan(G,bd);
      if(G.day===bd&&now(G)<T(bd,18.25)&&!F.KX_BDAY3_NO&&S.kxBdayButton(G,bd)) S.kxBdayPlan(G,bd);   /* 其他玩家：按了生日快樂、回了她的回問（兩個選項都排 18:00 公館，她下山）*/ }
    if(now(G)>=T(bd+1,0)){   /* 過了那一天 */
      const q=outGet(G,'kx_bday_y3'), sentBd=!!(G.msgChat&&G.msgChat.bday&&G.msgChat.bday['kexin:2028']!=null);
      const v=F.KX_BDAY3_NO?'declined':(q&&q.state==='missed'?'none':(sentBd?'message':'none')); B[3]=v;
      if(v==='none'||v==='declined'){ S.kxRub(G); PHONE.at(G,bd+1,lt(G,bd+1,9),[K(B[2]==='none'?'昨天我生日。……今年也等了一天。':'昨天我生日。……我等了一天。')],'y3_kx_bday_none'); } } };   /* 檔尾裁定 #38：大二也沒做的 */
  S.kxBdayDone=G=>{ const B=bdRec(G); B[3]=inJP(G)?'video':'met'; };
  S.kxBdayMissed=G=>{};   /* 過了那一天才結算（S.kxBdayPhone）*/

  /* ===================== 2-Y3-42 慈 6「第一名」：5/4（四）19:00～20:00 芯慈在麵店長桌（一天的作息）；日本路線＝21:40 視訊（讀書會 21:30 散了以後）===================== */
  S.SCHED.classmate_xinci=[{days:[4],from:19,to:20,zone:'noodle',act:'eat',terms:['Y3S2'],weeks:[11],dates:[['2028-05-04','2028-05-04']],note:'AA_326 2-Y3-42：慈 6，期中放榜後的第一個週四，麵店長桌'}];
  S.xcPhone=function(G){ const d=D('2028-05-04'); if(d==null||G.day!==d||!inJP(G)||hh(G)>=lt(G,d,22.25)||outGet(G,'y3_xc_video')||!met(G,'classmate_xinci','FAMILIAR')||!dmOk(G,'classmate_xinci')) return;
    plan(G,{id:'y3_xc_video',ev:'ev_xinci_first_place_video',day:d,h:lt(G,d,21+40/60),late:0.5,place:'視訊',title:'芯慈打視訊來（日本 22:40）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); };

  /* ===================== 2-Y3-43 J2 町公所的一張通知 ===================== */
  /* REPAIR（AA_254 第 10 節、BB_194 §8）：挽回的進度，一週最多 +1。G.flags.REPAIR＝{人物:n}、REPAIR_WK＝{人物:第幾週} */
  S.repairAdd=function(G,id){ const F=G.flags, R=F.REPAIR&&typeof F.REPAIR==='object'?F.REPAIR:(F.REPAIR={}), W=F.REPAIR_WK&&typeof F.REPAIR_WK==='object'?F.REPAIR_WK:(F.REPAIR_WK={}), wk=Math.floor(G.day/7);
    if(W[id]===wk) return false; W[id]=wk; R[id]=(R[id]|0)+1; return true; };
  S.noticePhone=function(G){ const d5=D('2028-05-05'), d6=D('2028-05-06'); if(d5==null||G.day<d5||G.day>d6+1||!knows('heroine_01',G)) return; const F=G.flags, A=M('p:heroine_01','heroine_01');
    if(inJP(G,d6)){
      if(dating(G,'heroine_01')){
        if(now(G)>=T(d5,jt(G,d5,21))&&now(G)<T(d6,jt(G,d6,15))&&!PHONE.sent(G,'y3_an_notice')){ PHONE.at(G,d5,jt(G,d5,21),[A('明天下午，町公所門口。有一張通知，我想給你看。')],'y3_an_notice');
          plan(G,{id:'y3_an_notice',ev:'ev_an_town_notice',day:d6,h:jt(G,d6,15),late:0.5,place:'町公所門口',title:'和以安：町公所門口（日本 15:00）',travel:'坐一站電車約 15 分鐘',travelH:0.25,back:'回到宿舍。'}); } }
      else if(S.anRepair(G)&&G.day===d6&&!outGet(G,'y3_an_notice_repair')&&hh(G)<jt(G,d6,22)+1)
        plan(G,{id:'y3_an_notice_repair',ev:'ev_an_town_notice_repair',day:d6,h:jt(G,d6,22),late:1,must:true,place:'宿舍大廳',title:'宿舍大廳（日本 22:00）',travel:'下樓',travelH:1/60,back:'回到房間。'});   /* 挽回中：祐廷在宿舍大廳 */
      return; }
    if(isJP(G)) return;
    if(grp(G)&&now(G)>=T(d6,20)&&!PHONE.sent(G,'y3_an_notice_group')){   /* 台灣、美國路線：20:00 麵店團群組 */
      PHONE.at(G,d6,20,[{th:NG,from:'heroine_01',text:'（照片：町公所的通知）'},{th:NG,from:'heroine_01',text:'這比命令可怕，還是比較好？'},{th:NG,from:'zhe',text:'所以要不要協力？'}],'y3_an_notice_group'); if(!F.AN_TOWN_NOTICE) F.AN_TOWN_NOTICE='group'; }
    if(dating(G,'heroine_01')&&F.AN_FAR_VIDEO&&now(G)>=T(d6,20)&&!PHONE.sent(G,'y3_an_notice_guess')) PHONE.at(G,d6,20+5/60,[A('最後一行，你那天猜對一半。')],'y3_an_notice_guess'); };   /* 4/13 視訊猜過最後一行的（2-Y3-53）*/
  S.noticePhoto=G=>{ const d=D('2028-05-06'); if(G.flags.AN_TOWN_NOTICE==null) G.flags.AN_TOWN_NOTICE='photo'; if(d!=null) PHONE.at(G,d,jt(G,d,20),['（照片：町公所的通知）','町公所請大家『協力』，沒有罰則，大家都照做。','這比命令可怕，還是比較好？'].map(M('p:heroine_01','heroine_01')),'y3_an_notice_photo'); };

  /* ===================== 2-Y3-44 可昕 K20：5/11 21:00 她約；5/12 19:00 公館河濱；沒去河濱、日本路線＝5/12 21:00 演出來的電話（她的方向只說一次：一定會打）===================== */
  S.kxDirHeard=G=>{ const F=G.flags; F.KX_DIR=Object.assign({},F.KX_DIR&&typeof F.KX_DIR==='object'?F.KX_DIR:{},{Y3:'heard'}); };
  S.k20Phone=function(G){ const d11=D('2028-05-11'), d12=D('2028-05-12'); if(d11==null||G.day<d11||G.day>d12+1||!dating(G,'kexin')) return; const F=G.flags, K=M('p:kexin','kexin'), jp=inJP(G,d12);
    if(!jp&&now(G)>=T(d11,21)&&now(G)<T(d12,19)&&!PHONE.sent(G,'y3_kx_k20'))
      PHONE.at(G,d11,21,[Object.assign(K('明天傍晚七點，河濱。我想跟你說一件實習遇到的事。'),{ask:{id:'y3_kx_k20',until:T(d12,18),opts:[
        {t:'好。',say:[{from:'kexin',text:'嗯。'}],set:{KX_K20_GO:true}},{t:'明天不行。',say:[{from:'kexin',text:'……好。那我明天晚上打給你。'}],set:{KX_K20_GO:false}}]}})],'y3_kx_k20');
    if(F.KX_K20_GO===true&&!outGet(G,'y3_kx_k20')&&now(G)<T(d12,19.25)) plan(G,{id:'y3_kx_k20',ev:'ev_kexin_k20',day:d12,h:19,late:0.25,place:'公館的河濱',title:'和可昕：河濱',travel:'走過去約 15 分鐘',travelH:0.25});
    if(G.day===d12&&now(G)>=T(d12,lt(G,d12,20.5))&&(jp||PHONE.sent(G,'y3_kx_k20'))&&!done(G,'ev_kexin_k20')&&!F.KX_K20&&!outGet(G,'y3_kx_k20_call')){ const q=outGet(G,'y3_kx_k20'); if(q&&q.state==='planned') return;
      plan(G,{id:'y3_kx_k20_call',ev:'ev_kexin_k20_call',day:d12,h:Math.max(lt(G,d12,21),hh(G)),late:1,must:true,place:'電話',title:'可昕打電話來'+(jp?'（日本 22:00）':''),verb:'接起來',travel:'',travelH:0,back:'電話掛了。'}); } };

  /* ===================== 2-Y3-45 方奕廷 F3「我買了」===================== */
  /* 5/29 21:00 判斷一次：和芷若交往中＝他傳「芷若跟我說了」三則；芷若的心意邀約條件那天已經全部成立（TERMEND.heartWhy，用 5/29 的數值算）＝延到 6/19 21:00 再判斷（FANG_F3_DELAY）；其他＝F3。
     F3：和方奕廷 FAMILIAR 以上＝演出來的電話；不到＝沒有電話，只有之後芷若那兩句。記 FANG_F3_DAY（芷若這學期不再發心意邀約：包住 TERMEND.heartWhy）*/
  S.zrHeartReady=G=>typeof TERMEND!=='undefined'&&!!TERMEND.heartWhy&&!!TERMEND.windowOf&&TERMEND.heartWhy(G,'heroine_02',TERMEND.windowOf('Y3S2'))===true;
  S.f3Congrats=function(G,d){ const F=G.flags; F.FANG_F3='congrats'; if(knows('npc_fangyt',G)) PHONE.at(G,d,lt(G,d,21),['芷若跟我說了。','恭喜。……你要記得她喝什麼。我只會記電影。','下次爬山，你們兩個一起來。'].map(M('p:npc_fangyt','npc_fangyt')),'y3_fang_congrats'); };
  S.f3Go=function(G,d){ const F=G.flags; F.FANG_F3_DAY=d;
    if(met(G,'npc_fangyt','FAMILIAR')) plan(G,{id:'y3_fang_f3',ev:'ev_fangyt_tickets',day:d,h:Math.max(lt(G,d,21),G.day===d?hh(G):lt(G,d,21)),late:1,must:true,place:'電話',title:'方奕廷打電話來',verb:'接起來',travel:'',travelH:0,back:'電話掛了。'});
    else F.FANG_F3='nocall'; };   /* 日本路線：原本芷若那兩句改成她 22:07 的私訊（y3_zr_f3_jp）；AA_296 2-3-1 ⑤（企劃線 3f406dbc）起不傳，8/5 回國以後第一次進 Café 當面說（S.f3CafeDue、ev_zhiruo_f3_cafe 的過去式那兩句）*/
  S.f3Phone=function(G){ const F=G.flags, d29=D('2028-05-29'), d19=D('2028-06-19'); if(d29==null||G.day<d29||G.day>d19+1) return;
    if(F.FANG_F3_J1==null&&now(G)>=T(d29,lt(G,d29,21))&&G.day<=d29+2){ F.FANG_F3_J1=G.day;
      if(dating(G,'heroine_02')) S.f3Congrats(G,d29); else if(S.zrHeartReady(G)) F.FANG_F3_DELAY=true; else S.f3Go(G,d29); }
    if(F.FANG_F3_DELAY&&F.FANG_F3==null&&F.FANG_F3_DAY==null&&now(G)>=T(d19,lt(G,d19,21))){ if(dating(G,'heroine_02')) S.f3Congrats(G,d19); else S.f3Go(G,d19); } };   /* 6/19：學期末接了她的心意邀約、交往＝不發生；沒接、沒去、「這杯我不能喝」＝照常（AA_334 第 3 節）*/
  S.F3_JP={from:'2028-08-05',to:'2028-09-01'};   /* AA_296 2-3-1 ⑤：日本路線 8/5 回國以後；9/1 以前都沒進 Café＝就沒有這一段（不補私訊）*/
  S.f3CafeDue=G=>{ const F=G.flags||{}; if(!(F.FANG_F3_DAY!=null&&G.day>=F.FANG_F3_DAY&&['direct','bought','self','nocall'].includes(F.FANG_F3))) return false;
    if(!isJP(G)) return true; const a=D(S.F3_JP.from), b=D(S.F3_JP.to); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };

  /* ===================== 2-Y3-49 主線 10 宿舍抽籤（大四的房間）：2028-07-15（六）10:00；順便補 2027 那一則 ===================== */
  S.lotteryPhone=function(G){ const F=G.flags;
    { const d=D('2027-07-15'), d9=D('2027-09-06'); if(d!=null&&now(G)>=T(d,10)&&(d9==null||G.day<d9)&&!PHONE.sent(G,'dorm_lottery_y3')){ PHONE.join(G,'dorm','宿舍系統'); PHONE.at(G,d,10,[{th:'g:dorm',text:'大三宿舍抽籤結果：已分配。請於 9/5 前完成入住。'}],'dorm_lottery_y3'); } }
    { const d=D('2028-07-15'), d9=D('2028-09-04'); if(d==null||now(G)<T(d,lt(G,d,10))||(d9!=null&&G.day>=d9)||PHONE.sent(G,'dorm_lottery_y4')) return;
      if(isJP(G)){ const S2=t=>({th:'p:sister',from:'sister',name:'姊姊',text:t});   /* 日本路線：人在日本，姊姊幫他填表（AA_181 2-1、AA_144 X3）*/
        PHONE.at(G,d,lt(G,d,10),[S2('宿舍的表我幫你填了。'),Object.assign(S2('抽到了，四樓。'),{ask:{id:'dorm_lottery_y4_sis',until:T(d+1,lt(G,d+1,18)),opts:[{t:'謝謝姊。',say:[{from:'sister',name:'姊姊',text:'回來請我吃飯。'}]}]}})],'dorm_lottery_y4'); F.DORM_Y4='sister'; }
      else { PHONE.join(G,'dorm','宿舍系統'); const L=[{th:'g:dorm',text:'大四宿舍抽籤結果：已分配。請於 9/3 前完成入住。'}]; if(isUS(G)) L.push({th:'g:dorm',text:'交換期間床位保留，12/23 起可以入住。'});
        PHONE.at(G,d,10,L,'dorm_lottery_y4'); F.DORM_Y4='self'; } } };

  /* ===================== 2-Y3-51 美國路線 X1 退宿：7/25（二）14:00 宿舍 507（暑假續住的）；暑假回家住的＝學期一結束搬家那一段多床墊那一句 ===================== */
  const X1_LINE='（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）';   /* AA_377 第 18 項：507 是大三才搬進去的 */
  S.x1Due=G=>{ const F=G.flags||{}, d=D('2028-07-25'), d2=D('2028-08-02'); if(!isUS(G)||F.X1_US!=null||d==null||now(G)<T(d,14)||(d2!=null&&G.day>=d2)) return false; const H=typeof HOME!=='undefined'&&HOME.rec?HOME.rec(G):{}; return !(H.stay&&H.stay.Y3S==='home'); };
  S.x1Go=async function(GM){ const G=GM.G, F=G.flags; if(!S.x1Due(G)) return false; const ev=evOf('ev_x1_moveout_us');
    if(G.zone!=='dorm'){ GM.sceneBegin(); try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','',1800); if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); } finally{ GM.sceneEnd(); } }   /* 人在外面：先帶回宿舍 */
    if(ev&&typeof EVENTS!=='undefined') await EVENTS.run(ev); F.X1_US=G.day;
    GM.sceneBegin(); try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('搬回臺北的家','計程車　約 30 分鐘',2400); GM.advance(0.5);
      if(typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; H.lbreak='Y3S'; H.brk='Y3S'; H.bskip={key:'Y3S',n:0,last:-1}; H.wakeAsk=null; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); }
      await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };   /* 之後到 8/2 出發住臺北的家（下一輪 STORY.tick 進家裡的選單）*/
  /* 暑假回家住（HOME.breakStart）：美國路線大三暑假，「暑假回家住。……四個紙箱。」後面接床墊那一句（同 home3d.js 的 S.breakStart，多一句、記 X1_US）*/
  S.usBreakStart=async function(GM,B){ const G=GM.G, H=HOME.rec(G), home=HOME.at(G); H.brk=B.key; H.lbreak=B.key; H.bskip={key:B.key,n:0,last:-1}; H.wakeAsk=null; H.stayMon=null; GM.sceneBegin();
    try{ await GM.say(null,HOME.BREAK_HOME_LINE[B.kind]); await GM.say(null,X1_LINE); G.flags.X1_US=G.day;
      if(!home){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); await GM.fade(false); }
      if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    return true; };
  if(typeof HOME!=='undefined'&&HOME.breakStart&&!HOME._r2y3b){ const orig=HOME.breakStart; HOME.breakStart=async function(GM){ const G=GM.G, B=HOME.lawBreak&&HOME.lawBreak(G);
      if(B&&B.key==='Y3S'&&isUS(G)&&HOME.breakStartDue(G)) return S.usBreakStart(GM,B); return orig.apply(this,arguments); }; HOME._r2y3b=true; }

  /* ===================== 2-Y3-53 台灣、美國路線：和以安交往中的遠距（AA_187 1-4）===================== */
  /* 3/14（二）白色情人節：交往中一律有（AA_343 D1：2/14 的系統還沒有；她出發前十一天）。開頭分兩版：2/14 送過（AN_VDAY_GIFT，以後 2/14 的系統記）／沒送過＝「不是回禮」那一版（r2y3b_events.js；AA_369 H2 改字）。
     3/13（一）21:00 她私訊 → 3/14 18:00 公館 */
  S.anVdayGift=G=>!!(G.flags&&G.flags.AN_VDAY_GIFT);
  S.whitePhone=function(G){ const d13=D('2028-03-13'), d14=D('2028-03-14'); if(d13==null||G.day<d13||G.day>d14||isJP(G)||!dating(G,'heroine_01')||!dmOk(G,'heroine_01')) return;
    if(now(G)>=T(d13,21)&&now(G)<T(d14,18)&&!PHONE.sent(G,'y3_an_white')) PHONE.at(G,d13,21,[{th:'p:heroine_01',from:'heroine_01',text:'明天傍晚六點，公館。'}],'y3_an_white');
    if(PHONE.sent(G,'y3_an_white')&&!outGet(G,'y3_an_white')&&now(G)<T(d14,18.25)) plan(G,{id:'y3_an_white',ev:'ev_an_white_day',day:d14,h:18,late:0.25,place:'公館',title:'和以安：公館（白色情人節）',travel:'走過去約 10 分鐘',travelH:1/6}); };
  /* 4/13（四）21:00 視訊（日本 22:00；AA_377 第 19 項：原本日本 23:30，她 22:30 以後不回——口氣表 1-1）：10 分鐘沒接＝沒接，沒有後續。選了哪一個記 AN_FAR_VIDEO（5/6 的群組照片多一則私訊，S.noticePhone）*/
  S.farVideoPhone=function(G){ const d=D('2028-04-13'); if(d==null||G.day!==d||isJP(G)||!dating(G,'heroine_01')||outGet(G,'y3_an_far_video')||hh(G)>=21) return;
    plan(G,{id:'y3_an_far_video',ev:'ev_an_far_video',day:d,h:21,late:1/6,place:'視訊',title:'以安打視訊來（日本 22:00）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'}); };

  /* ===================== 2-Y3-52 台灣、美國路線：以安在日本（3/25～8/5），還沒交往（AA_253 10-1、10-3；BB_204 9-1）=====================
     每週日 21:00（她那邊＝時鐘 20:00，S.jp）看一次段：T1 第 4 階以下＝兩週一則（第 1、3、5…週；3/26 是第 1 週）；T2 第 4 階、最近三則回了兩則以上＝每週一則（兩個回覆按鈕）；
     T3 第 5 階以上、最近三則回了兩則以上＝每週視訊（她和祐廷的戀愛各 +1）。最近三則回不到兩則＝下一週退一段（不扣分）。
     「回了」＝那一則之後到隔天 18:00，祐廷在她的對話串傳過話（T1、T2 的按鈕，或手機「傳訊息」；T1 的按鈕她回一句，AA_343 D3）；視訊沒接＝沒回。階＝DATE.stageNum（第 4 階好朋友、第 5 階她的戀愛 ≥30、第 6 階 ≥55）。
     約（6/29 以前最後一次視訊＝6/25 那一通）：第 6 階、出國前正式約會 ≥2、回覆率 ≥0.5、正在 T3；和別人交往中＝另外要她當時願意（TERMEND.willing，BB_203）。
     「我再看看」＝6/30 她那邊 21:00 再問一次（「我去。」／「這次不行。」）；7/6～7/10 飛去日本（出國旅遊 C13 的日本版：家裡出，不扣錢），7/7 告白＝交往（這一趟算 2 次正式約會、也算心願地點）；
     沒有這一趟＝7/7 竹子的照片。交往中的 8/5 出發選單「桃園機場（接以安）」；7/7 開始交往的 8/6 16:00 Café 手帳。
     記 G.flags.AN_ABROAD＝{log:[{day,h,kind,wk,tier,replied}],tier,wk,n1,n2,n3,asked}、AN_ABROAD_TIER、AN_JP_TRIP_ASK、AN_JP_TRIP、AN_TANABATA（'confess'／'photo'）。 */
  const AB_K={dep:'2028-03-25',sun1:'2028-03-26',ret:'2028-08-05',ask:'2028-06-29',re:'2028-06-30',go:'2028-07-06',tana:'2028-07-07',nb:'2028-08-06'};
  const ABE=()=>typeof R2Y3B_EVENTS!=='undefined'?R2Y3B_EVENTS:null;
  const romSt=(G,id)=>typeof ROM!=='undefined'&&ROM.get?ROM.get(G,id).status:'none';
  const stNum=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  const runL=async(L,ev)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(L,ev||{id:'r2y3b'}); };
  S.abRec=G=>{ const F=G.flags; if(!F.AN_ABROAD||typeof F.AN_ABROAD!=='object') F.AN_ABROAD={log:[],tier:1,wk:0,n1:0,n2:0,n3:0}; const R=F.AN_ABROAD; if(!Array.isArray(R.log)) R.log=[]; return R; };
  S.abOn=G=>!isJP(G)&&!dating(G,'heroine_01')&&romSt(G,'heroine_01')==='none'&&met(G,'heroine_01','ACQUAINTANCE')&&dmOk(G,'heroine_01');   /* 不到 ACQUAINTANCE、分手過（前任）＝沒有訊息池 */
  S.abOnDating=G=>!isJP(G)&&dating(G,'heroine_01')&&dmOk(G,'heroine_01');   /* AA_508 0-2 第 1 點（31a4c4002）：交往中的臺灣、美國玩家也收 T1 那十則，每週一則（第 4 階的頻率），外加現有交往版的幾場（4/13 視訊、4/20、5/6）；十則傳完以後的週日照她的動態（手機動態那一輪接）*/
  const said=(G,th,t0,t1)=>(G.msgs||[]).some(m=>m.th===th&&m.from==='player'&&T(m.day,m.h)>=t0-1e-6&&T(m.day,m.h)<=t1+1e-6);
  S.abSettle=function(G){ for(const e of S.abRec(G).log){ if(e.replied!=null||e.kind!=='msg') continue; const t1=T(e.day+1,18); if(said(G,'p:heroine_01',T(e.day,e.h),t1)) e.replied=true; else if(now(G)>t1) e.replied=false; } };
  S.abSundays=function(){ const d0=D(AB_K.sun1), d1=D(AB_K.ret), L=[]; if(d0==null||d1==null) return L; for(let d=d0,wk=1;d<d1;d+=7,wk++) L.push({day:d,wk}); return L; };
  S.abTier=function(G){ const R=S.abRec(G), st=stNum('heroine_01'), ok=R.log.slice(-3).filter(e=>e.replied===true).length>=2, elig=st>=5?3:(st>=4?2:1);
    return ok?elig:Math.max(1,Math.min(elig,(R.tier|0||1)-1)); };   /* 回不到兩則：退一段（不會因為這樣升）*/
  S.abDatesBefore=G=>{ const d0=D(AB_K.dep); return d0==null?0:(G.trips||[]).filter(t=>t&&t.counted&&t.who==='heroine_01'&&t.day!=null&&t.day<d0).length; };
  S.abRate=G=>{ const L=S.abRec(G).log.filter(e=>e.replied!=null); return L.length?L.filter(e=>e.replied).length/L.length:0; };
  /* AA_377 第 5 項：訊息池不看日期——3/26 就傳四月的櫻花、問大二上的行政法期中、7/30 還說「這禮拜的課很難」（她的課 7/21 結束）。照日子挑：
     櫻花那則只在 4 月；「你那邊期中考了嗎？」只在臺灣的第 8～9 週；「這禮拜的課很難。」那段視訊只在 7/21 以前；讀書會 Alison 那則只給參加過讀書會的（第 3 項）。
     挑法：先出還沒出過、今天可以出的（照原本的順序）；都出過了照輪到的順序找今天可以出的。R.n1／n2／n3＝下一個輪到第幾則、n1s／n2s／n3s＝出過的（舊存檔照原本的輪流補）*/
  const plgAny=G=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group');
  S.AB_WHEN={   /* t1（櫻花只在 4 月）改成 S.AB_T1_WHEN（AA_463 第 1 節十則）*/
    t2:{0:(G,d)=>{ const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null; return !!t&&(t.week===8||t.week===9); },2:G=>plgAny(G)},
    t3:{0:(G,d)=>{ const e=D('2028-07-21'); return e==null||d<e; }}};
  /* T1 十則（AA_463 第 1 節）：照順序各傳一次。有月份的（到的那週、四月櫻花、六月梅雨、七月底行李箱）照月份：今天在那個時段、而且之後的單週週日都不在那個時段（最後一次機會）＝先傳它；
     其他照順序補空的那一週；都傳過了（或剩下的今天都不能傳）＝這一週不傳。R.t1s＝傳過的（十則的位置）；舊存檔（原本四則的 n1／n1s）照 S.AB_T1_OLD 換成新的位置，舊的那幾則不再傳 */
  const mdOf=d=>{ const k=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).key:''; return k.slice(5); };   /* 'MM-DD' */
  S.AB_T1_WHEN={0:(G,d)=>{ const s=D(AB_K.sun1); return s!=null&&d>=s&&d<s+7; },   /* 到的那週 */
    2:(G,d)=>mdOf(d).slice(0,2)==='04', 7:(G,d)=>mdOf(d).slice(0,2)==='06', 9:(G,d)=>{ const m=mdOf(d); return m>='07-20'&&m<='07-31'; }};   /* 四月、六月、七月底 */
  S.AB_T1_OLD=[2,1,3,4];   /* 原本四則（櫻花、飯糰、洗衣機、號碼牌）在十則裡的位置 */
  S.abT1Sent=function(R){ if(!Array.isArray(R.t1s)){ const old=Array.isArray(R.n1s)?R.n1s:Array.from({length:Math.min(R.n1|0,S.AB_T1_OLD.length)},(_,k)=>k); R.t1s=[]; for(const i of old){ const j=S.AB_T1_OLD[i]; if(j!=null&&!R.t1s.includes(j)) R.t1s.push(j); } } return R.t1s; };
  S.abPickT1=function(G,R,day,n,weekly){ const W=S.AB_T1_WHEN, sent=S.abT1Sent(R), ok=(i,d)=>!W[i]||!!W[i](G,d), un=[]; for(let i=0;i<n;i++) if(!sent.includes(i)) un.push(i);
    const later=S.abSundays().filter(w=>(weekly||w.wk%2===1)&&w.day>day).map(w=>w.day);   /* weekly：交往中每週一則（AA_508 0-2 第 1 點），之後的每個週日都算機會 */
    let i=un.find(k=>!!W[k]&&ok(k,day)&&!later.some(d=>ok(k,d)));   /* 有月份的：最後一次機會 */
    if(i==null) i=un.find(k=>!W[k]);   /* 其他照順序 */
    if(i==null) i=un.find(k=>!!W[k]&&ok(k,day));
    if(i==null) return -1; sent.push(i); return i; };
  S.abPick=function(G,R,key,n,pool,day){ const W=S.AB_WHEN[pool]||{}, ok=i=>!W[i]||!!W[i](G,day), sk=key+'s';
    if(!Array.isArray(R[sk])) R[sk]=Array.from({length:Math.min(R[key]|0,n)},(_,k)=>k);
    let i=-1; for(let k=0;k<n;k++) if(ok(k)&&!R[sk].includes(k)){ i=k; break; }
    if(i<0) for(let k=0;k<n;k++){ const j=((R[key]|0)+k)%n; if(ok(j)){ i=j; break; } }
    if(i<0) return -1; R[key]=i+1; if(!R[sk].includes(i)) R[sk].push(i); return i; };
  S.abPhone=function(G){ const dt=S.abOnDating(G); if(!S.abOn(G)&&!dt) return; const R=S.abRec(G), X=ABE(), AB=X&&X.AB; if(!AB) return; const F=G.flags, A=M('p:heroine_01','heroine_01'); S.abSettle(G);
    for(const w of S.abSundays()){ if(w.wk<=(R.wk|0)) continue; const t=T(w.day,S.jp(21)); if(now(G)<t) break; R.wk=w.wk;
      if(now(G)>T(w.day+1,18)) continue;   /* 隔天 18:00 以後才跑到這一週（很久沒跑手機規則、讀檔）：不補 */
      if(dt){ const tag='y3_ab_w'+w.wk, i=S.abPickT1(G,R,w.day,AB.t1.length,true); if(i<0) continue; const L=AB.t1[i].map(A), O=(AB.t1O||[])[i];   /* 交往中：每週 T1 一則（照順序、有月份的照月份），兩個回覆按鈕她回一句；段（tier）不動 */
        if(O) L[L.length-1].ask={id:tag,until:T(w.day+1,18),opts:O.map(([t,r])=>({t,say:[{from:'heroine_01',text:r}]}))};
        PHONE.at(G,w.day,S.jp(21),L,tag); R.log.push({day:w.day,h:S.jp(21),kind:'msg',wk:w.wk,tier:1,dating:true}); continue; }
      const tier=S.abTier(G), tag='y3_ab_w'+w.wk; R.tier=tier; F.AN_ABROAD_TIER=tier;
      if(tier===1){ if(w.wk%2!==1) continue; const i=S.abPickT1(G,R,w.day,AB.t1.length); if(i<0) continue; const L=AB.t1[i].map(A), OF=(AB.t1OFriend||{})[i], O=OF?((AB.t1O||[])[i]||[]).map(([t,r])=>[t,OF[t]!=null?OF[t]:r]):(AB.t1O||[])[i];   /* AA_524 A10：沒交往的回覆（AB.t1OFriend）*/   /* T1 也有兩個回覆按鈕，她回一句（AA_343 D3）；十則照順序各一次、有月份的照月份（S.abPickT1，AA_463 第 1 節）*/
        if(O) L[L.length-1].ask={id:tag,until:T(w.day+1,18),opts:O.map(([t,r])=>({t,say:[{from:'heroine_01',text:r}]}))};
        PHONE.at(G,w.day,S.jp(21),L,tag); R.log.push({day:w.day,h:S.jp(21),kind:'msg',wk:w.wk,tier}); }
      else if(tier===2){ const i2=S.abPick(G,R,'n2',AB.t2.length,'t2',w.day); if(i2<0) continue; const x=AB.t2[i2], L=x.L.map(A); L[L.length-1].ask={id:tag,until:T(w.day+1,18),opts:x.O.map(o=>({t:o,say:[]}))}; PHONE.at(G,w.day,S.jp(21),L,tag); R.log.push({day:w.day,h:S.jp(21),kind:'msg',wk:w.wk,tier}); }   /* 她不再回（一來一回就停）*/
      else { const grp=S.abPick(G,R,'n3',AB.t3.length,'t3',w.day); if(grp<0) continue; const e={day:w.day,h:S.jp(21),kind:'video',wk:w.wk,tier,replied:null}; R.log.push(e);
        if(now(G)<T(w.day,S.jp(21)+0.5)) plan(G,{id:'y3_ab_v'+w.wk,ev:'ev_an_abroad_video',day:w.day,h:S.jp(21),late:0.5,place:'視訊',title:'以安打視訊來（日本 21:00）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。',abv:{wk:w.wk,grp,day:w.day}});
        else e.replied=false; } }
    if(dt) return;   /* 交往中只有每週那一則（再問、7/7 竹子的照片是還沒交往的流程）*/
    /* 「我再看看」：6/30（五）20:30（她那邊 21:30）再問一次（AA_343 D2）：「六月最後一天。」「七月七號。……你要不要來看？」；
       「我去。」→「好。機票你自己訂，行程我排。」（同第一次）→ 7/6～7/10；「這次不行。」→「好。我拍竹子給你看。」→ 7/7 照片；7/2（日）21:00 還沒回＝這次不行（沒有那句回話）*/
    { const dR=D(AB_K.re); if(dR!=null&&F.AN_JP_TRIP_ASK==='later'){
        if(now(G)>=T(dR,S.jp(21.5))&&G.day<=dR+2&&!PHONE.sent(G,'y3_ab_reask')){ const L=AB.reask.map(A); L[L.length-1].ask={id:'y3_ab_reask',until:T(dR+2,21),opts:[{t:'我去。',set:{AN_JP_TRIP_ASK:'go'},say:[{from:'heroine_01',text:AB.reaskYes}]},{t:'這次不行。',set:{AN_JP_TRIP_ASK:'no'},say:[{from:'heroine_01',text:AB.reaskNo}]}]}; PHONE.at(G,dR,S.jp(21.5),L,'y3_ab_reask'); }
        const m=PHONE.byAsk(G,'y3_ab_reask'); if(m&&m.ans==null&&now(G)>T(dR+2,21)) F.AN_JP_TRIP_ASK='none'; } }
    if(F.AN_JP_TRIP_ASK==='go') S.abTripPlan(G);
    /* 7/7 她那邊 21:00：沒有這一趟（條件沒到、這次不行、沒回、答應了沒出發）＝商店街竹子的照片 */
    { const d7=D(AB_K.tana); if(d7!=null&&!F.AN_JP_TRIP&&now(G)>=T(d7,S.jp(21))&&G.day<=d7+1&&!PHONE.sent(G,'y3_ab_tana_photo')){
        const L=[A('（照片：商店街的竹子，短冊在風裡）'),A('七夕。這邊的人很認真寫願望。')]; L[1].ask={id:'y3_ab_tana_photo',until:T(d7+1,18),opts:[{t:'妳寫了什麼？',say:[{from:'heroine_01',text:'不告訴你。'}]},{t:'好漂亮。',say:[{from:'heroine_01',text:'嗯。'}]}]};
        PHONE.at(G,d7,S.jp(21),L,'y3_ab_tana_photo'); if(!F.AN_TANABATA) F.AN_TANABATA='photo'; } } };
  S.abInviteDue=function(G,v){ const R=S.abRec(G), dA=D(AB_K.ask); if(R.asked!=null||!v||v.day==null||dA==null||!(v.day<dA&&v.day+7>=dA)) return false;   /* 6/29 以前最後一次視訊 */
    if(stNum('heroine_01')<6||S.abDatesBefore(G)<2||S.abRate(G)<0.5) return false;
    if(datingAny(G)&&typeof TERMEND!=='undefined'&&TERMEND.willing&&!TERMEND.willing(G,'heroine_01').ok) return false;   /* 和別人交往中：她當時願意才約（BB_203）*/
    return true; };
  S.anVideo=async function(GM,q){ const G=GM.G, F=G.flags, X=ABE(), AB=X&&X.AB, v=(q&&q.abv)||{}, ev=evOf('ev_an_abroad_video'); if(!AB) return false;
    await runL([{scene:'視訊',bg:'video'}].concat(AB.t3[(v.grp|0)%AB.t3.length]),ev);
    const R=S.abRec(G), e=R.log.find(x=>x.kind==='video'&&x.wk===v.wk); if(e) e.replied=true;
    if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust('heroine_01',{npcRom:1,rom:1});   /* 每次視訊她和祐廷的戀愛各 +1（算一次單獨相處）*/
    if(S.abInviteDue(G,Object.assign({day:q&&q.day},v))){ R.asked=G.day; await runL(AB.invite,ev); if(F.AN_JP_TRIP_ASK==='go') S.abTripPlan(G); }
    return true; };
  S.anVideoMissed=function(G,q){ const v=(q&&q.abv)||{}, e=S.abRec(G).log.find(x=>x.kind==='video'&&x.wk===v.wk); if(e&&e.replied==null) e.replied=false; };
  S.abTripPlan=function(G){ const d=D(AB_K.go); if(d==null||outGet(G,'y3_an_tanabata')||G.day>d) return false; G.flags.AN_JP_TRIP=true;
    return plan(G,{id:'y3_an_tanabata',ev:'ev_an_tanabata',day:d,h:8,late:1,place:'關西・大學城',title:'飛去日本找以安（7/6～7/10）',travel:'去機場 約 1 小時',travelH:1,back:'回到臺北。'}); };
  S.tanabataMissed=function(G){ const F=G.flags; F.AN_JP_TRIP=false; F.AN_JP_TRIP_MISSED=G.day;   /* 答應了、7/6 沒出發（AA_343 D4）：15:30「我在剪票口。」、18:00「……行程表我收起來了。」（臺灣時間；日本 16:30、19:00）→ 7/7 竹子的照片（AN_TANABATA 'photo'）*/
    const X=ABE(), AB=X&&X.AB, d6=D(AB_K.go), A=M('p:heroine_01','heroine_01'); if(!AB||!AB.tanaLate||d6==null) return; PHONE.at(G,d6,15.5,[A(AB.tanaLate[0])],'y3_ab_tana_late1'); PHONE.at(G,d6,18,[A(AB.tanaLate[1])],'y3_ab_tana_late2'); };
  /* 飛去日本：一天一段（日本時間 S.jp；中間的時間照出國旅遊的 VAC.jump 跳：每小時跑手機、日期字卡）。時間是 LAWWW 排的：7/6 15:00 剪票口、7/7 19:00 商店街、7/8 與 7/9 14:00 摘要日、7/10 10:00 剪票口 → 14:00 回到桃園 */
  S.abJump=async function(GM,t,place){ const G=GM.G; if(t<=now(G)+1e-6) return; if(typeof VAC!=='undefined'&&VAC.jump){ await VAC.jump(GM,t,place); return; } const d=Math.floor(t/24); if(d>G.day&&typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,d,t-d*24); else G.hour=t-G.day*24; };
  S.tanabataTrip=async function(GM,q){ const G=GM.G, F=G.flags, X=ABE(), AB=X&&X.AB, ev=evOf('ev_an_tanabata'), d6=D(AB_K.go), PL='關西・大學城'; if(!AB||d6==null) return false; F.AN_JP_TRIP_WENT=G.day;
    await S.abJump(GM,T(d6,S.jp(15)),PL); await runL(AB.d1,ev);
    await S.abJump(GM,T(d6+1,S.jp(19)),PL); await runL(AB.d2,ev); S.anTanabataYes(G);
    await S.abJump(GM,T(d6+2,S.jp(14)),PL); await runL(AB.d3,ev);
    await S.abJump(GM,T(d6+3,S.jp(14)),PL); await runL(AB.d4,ev);
    await S.abJump(GM,T(d6+4,S.jp(10)),PL); await runL(AB.d5,ev);
    await S.abJump(GM,T(d6+4,14),'桃園機場'); return true; };
  /* 7/7 告白：玩家說、她說都交往（ROM.start；她知道祐廷和別人交往還約了＝她同意，OPEN_OK）；這一趟算 2 次正式約會、也算她的心願地點（AA_253 第 10 節）*/
  S.romStart=function(G,id){ const F=G.flags, K=typeof TERMEND!=='undefined'&&TERMEND.knownOthers?TERMEND.knownOthers(G,id):[]; const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,id):((F['dating_'+id]=true),true);
    if(ok&&K.length){ const O=F.OPEN_OK||(F.OPEN_OK={}), Mx=O[id]||(O[id]={}); for(const y of K) Mx[y]=true; } if(ok) (F.confessed||(F.confessed={}))[id]=G.day; return ok; };
  S.anTanabataYes=function(G){ const F=G.flags; if(typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,'heroine_01'); L.count=(L.count|0)+2; L.wish=true; }
    if(F.AN_TANABATA_KNOW&&F.AN_TANABATA_KNOW!=='yes'){ F.AN_TANABATA='knows'; return false; }   /* AA_474 3b：她知道祐廷有別人、知情對話沒有答應＝不交往（d3～d5 照舊、不排 ev_an_notebook）*/
    if((F.AN_TANABATA_KNOW==='yes'&&dating(G,'heroine_01'))||S.romStart(G,'heroine_01')) F.AN_TANABATA='confess'; return F.AN_TANABATA==='confess'; };
  /* AA_474 第 4 節 3b：7/7 告白的那一刻她知道祐廷有別人（MREL.knownOthers 有人）＝先演她的知情對話（AB.d2 的 call）：
     玩家先說（p）＝她「……我知道。」接 KNOW.heroine_01.say；她先說（h）＝她原本三句接 KNOW.heroine_01.she；然後三個選項（MREL.knowGate，和心意邀約同一套）。
     接受＝照原本的交往（romStart：OPEN_OK、confessed）；記 AN_TANABATA_KNOW＝結果（yes／think／no／promise）*/
  S.knowsOther=(G,id)=>typeof MREL!=='undefined'&&!!MREL.knowsOther&&MREL.knowsOther(G,id);
  S.tanabataKnow=async function(GM,said){ const G=GM.G; if(typeof MREL==='undefined'||!MREL.knowGate) return null;
    const r=await MREL.knowGate(GM,'heroine_01',{said,at:'tanabata',start:G0=>S.romStart(G0,'heroine_01')}); G.flags.AN_TANABATA_KNOW=r||null; return r; };
  /* 8/5 她自己回來：交往中、人在臺灣（美國路線 8/2 起在國外）＝出發選單「桃園機場（接以安）」（時間 LAWWW 排 15:00）；7/7 開始交往的＝8/6（日）16:00 Café 窗邊的手帳 */
  S.anBackPhone=function(G){ const F=G.flags, d5=D(AB_K.ret), d6=D(AB_K.nb); if(d5==null||isJP(G)) return;
    const away=typeof STORY!=='undefined'&&STORY.abroad?STORY.abroad(Object.assign({},G,{day:d5})):false;
    if(dating(G,'heroine_01')&&!away&&G.day>=d5-1&&G.day<=d5&&!outGet(G,'y3_an_airport')&&now(G)<T(d5,16)) plan(G,{id:'y3_an_airport',ev:'ev_an_airport_y3',day:d5,h:15,late:1,place:'桃園機場・入境大廳',title:'桃園機場（接以安）',travel:'捷運 約 1 小時',travelH:1,back:'回到臺北。'});
    if(F.AN_TANABATA==='confess'&&dating(G,'heroine_01')&&!away&&d6!=null&&G.day>=d6-1&&G.day<=d6&&!outGet(G,'y3_an_notebook')&&now(G)<T(d6,16.5)) plan(G,{id:'y3_an_notebook',ev:'ev_an_notebook',day:d6,h:16,late:0.5,place:'兩點半 Café・窗邊',title:'和以安：兩點半 Café',travel:'走過去約 10 分鐘',travelH:1/6}); };

  /* ===================== 2-Y3-54 大三暑假（AA_185 1-3，AA_326 2-Y3-54）===================== */
  const rk=G=>isJP(G)?'JP':(isUS(G)?'US':'TW');   /* 路線（還沒定＝台灣）*/
  /* 回到家那天晚上，手機「這個暑假要做什麼？」三選一，都不扣分：台灣、美國路線 6/19（一）21:00。日本路線沒有三選一（AA_341 裁定 10、AA_349 L2：AA_343 D5 日本路線作廢）。
     回覆開到兩天後的 21:00（台灣、美國＝6/21 21:00，AA_343 D8）；還是沒回＝預設：有打工的 'work'、沒有的 'study'（不傳訊息，摘要日照預設那一套播）*/
  S.planY3At=G=>isJP(G)?null:{d:D('2028-06-19'),h:21};
  S.hasJob=G=>(typeof JOBS!=='undefined'&&JOBS.at?!!JOBS.at(G,'tutor'):!!(G.flags&&G.flags.JOB_TUTOR))||(typeof JOBS!=='undefined'&&!!JOBS.any&&!!JOBS.any(G));   /* 同 home3d.js 的 hasJob：家教看 JOBS.at（停了、會考以後＝沒有）；沒有 JOBS 照 JOB_TUTOR */
  S.summerDefault=G=>S.hasJob(G)?'work':'study';
  S.summerPlanPhone=function(G){ const a=S.planY3At(G); if(!a||a.d==null||now(G)<T(a.d,a.h)||G.flags.SUMMER_Y3) return;
    if(now(G)>T(a.d+2,21)){ const m=PHONE.byAsk(G,'y3_summer_plan'); if(!m||m.ans==null) G.flags.SUMMER_Y3=S.summerDefault(G); return; }   /* 沒回（或那一則錯過了）＝預設 */
    if(PHONE.sent(G,'y3_summer_plan')) return;
    PHONE.at(G,a.d,a.h,[{th:'sys',text:'這個暑假要做什麼？',ask:{id:'y3_summer_plan',until:T(a.d+2,21),opts:[{t:'法律服務中心的暑期實習',post:false,set:{SUMMER_Y3:'intern'}},{t:'打工',post:false,set:{SUMMER_Y3:'work'}},{t:'在家開始讀國考的書',post:false,set:{SUMMER_Y3:'study'}}]}}],'y3_summer_plan'); };
  /* 摘要日的旁白：台灣 6/26、7/24、8/21；美國 6/26、7/24、7/31（8/2 出發，第三句搬到 7/31）。HOME.sumSkip（那天在國外、有報名的活動）＝不播。
     日本路線沒有三選一：8/21 只有一句，不看三選一（AA_349 L2），在 src/jp3d.js 的 JP.SCH（8/5～9/3 住臺北的家是 JP.homeRound）；AA_343 D5 的三句作廢 */
  S.SUM_DAYS={TW:[['2028-06-26',0],['2028-07-24',1],['2028-08-21',2]],US:[['2028-06-26',0],['2028-07-24',1],['2028-07-31',2]],JP:[]};
  S.jobKind=G=>{ const j=typeof JOBS!=='undefined'&&JOBS.any?JOBS.any(G):null; return j&&j!=='tutor'&&j!==true?j:'tutor'; };   /* 大三下有在做的那一份；沒有的照家教（打工系統只有家教 JOB_TUTOR）*/
  const tutor=G=>S.jobKind(G)==='tutor';
  S.SUMMER_LINES={intern:['實習第一天，你負責影印。影印機比你還資深。','你第一次自己寫完一份初談紀錄。律師只改了兩個字。','最後一天，主任說：『明年考完，再來。』'],
    /* 打工（AA_343 D6）：家教那一套換字（6/26 在家／住宿舍各一句、8/21（美國 7/31）最後一堂課）；以後有其他打工（麵店、Café 店員）用原稿那三句，住宿舍的 6/26 照 D6 那一句；家教以外的 7/24 照 AA_350 M5 新寫的那一句 */
    work:[G=>tutor(G)?(atHome(G)?'暑假學生的課排得比學期中多。你從家裡搭捷運去。':'暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。'):(atHome(G)?'暑假的班比學期中多。你從家裡搭捷運去。':'暑假的班比學期中多。宿舍沒什麼人，你每天第一個出門。'),
      G=>tutor(G)?'學生問你，法律系是不是都在背。你說：『背完以後才開始。』':'七月最熱的那個禮拜，店裡的冷氣壞了三天。你學會一邊流汗，一邊說『歡迎光臨』。',   /* AA_350 M5：家教以外的打工 7/24（原本 null 不播）*/
      G=>tutor(G)?'最後一堂課，學生的媽媽塞了一盒水果給你。':'最後一班，老闆多給了一個便當。'],
    study:['你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。','七月。冷氣開著，你讀完第一本。','姊姊回家，看到你的筆記：『這是你寫的？字變小了。』']};
  S.sumLine=function(G,i){ const k=G.flags&&G.flags.SUMMER_Y3; const x=(S.SUMMER_LINES[k]||[])[i]; return typeof x==='function'?x(G):(x||null); };
  /* 7/9（日）12:00 語彤生日：照大一的寫法（home3d.js 2026 那一則）——麵店團群組 Alison＋按鈕「傳一句生日快樂」；不在群組、和語彤 FAMILIAR 以上＝她的私訊放同一個按鈕。日本路線也是同一則 */
  S.ytBdayPhone=function(G){ const d=D('2028-07-09'); if(d==null||now(G)<T(d,lt(G,d,12))||now(G)>=T(d+1,lt(G,d+1,0))||PHONE.sent(G,'yt_bday_y3')) return;
    const reply={from:'heroine_03',text:'……謝謝。今年的田野，訪問到第二十二個了。'}   /* AA_509 0-2 第 2 點：8/22 問阿姨才是第二十三個（9/7「阿姨是第二十三個」）；宜蘭的田野課不算 */, opt={t:'傳一句生日快樂',post:'生日快樂。',say:[reply],set:{YT_BDAY_Y3:true}};
    if(grp(G)) PHONE.at(G,d,lt(G,d,12),[{th:NG,from:'yu',text:'今天語彤生日！',ask:{id:'yt_bday_y3',until:T(d+1,lt(G,d+1,0)),opts:[Object.assign({},opt,{say:[Object.assign({th:NG},reply)]})]}}],'yt_bday_y3');
    else if(met(G,'heroine_03','FAMILIAR')) PHONE.at(G,d,lt(G,d,12),[{th:'p:heroine_03',text:'今天是語彤的生日。',ask:{id:'yt_bday_y3',until:T(d+1,lt(G,d+1,0)),opts:[opt]}}],'yt_bday_y3'); };
  /* 芷若「十二張點單」（BB_165 3-2 照 10-18 加註＝AA_343 D8；AA_326 2-Y3-54）：和芷若交往中。台灣路線 8/4（五）21:00 私訊（不用回）→ 8/5（六）14:00 兩點半（店休）；
     日本路線（8/5 當天才回來）改 8/11（五）21:00 → 8/12（六）14:00，台詞相同；美國路線（8/2 起在國外）沒有這一場。
     14:30 還沒到＝16:00 照片＋兩則，信封放在吧檯下面（ZR_SLIPS_WAIT 'bar'）→ 之後第一次在她上班的時候進 Café，她從吧檯下面拿出來（ev_zhiruo_slips_bar）；
     9/1 以前都沒拿（她 9/2 出國，AA_316 1B-06）＝9/1（五）21:00 兩則、信封交給老闆（'owner'）→ 之後第一次進 Café，老闆給（ev_zhiruo_slips_owner）。拿到＝ZR_TWELVE_SLIPS（去了 true、她給 'bar'、老闆給 'owner'）。
     AA_326 原本「8/21 信封寄到家裡」作廢（這一版以前寄出的舊存檔 ZR_SLIPS_MAIL＝當作放在吧檯下面）。時間照手機的時間 lt（日本路線 8/5 已經回臺灣＝不變）*/
  S.SLIPS_DAYS={TW:{inv:'2028-08-04',day:'2028-08-05'},JP:{inv:'2028-08-11',day:'2028-08-12'}};
  S.slipsPhone=function(G){ const F=G.flags, Z=M('p:heroine_02','heroine_02');
    if(F.ZR_SLIPS_MAIL!=null&&!F.ZR_TWELVE_SLIPS&&!F.ZR_SLIPS_WAIT) F.ZR_SLIPS_WAIT='bar';
    if(F.ZR_SLIPS_WAIT==='bar'&&!F.ZR_TWELVE_SLIPS){ const d1=D('2028-09-01'); if(d1!=null&&now(G)>=T(d1,lt(G,d1,21))&&!PHONE.sent(G,'y3_zr_slips_fly')){ PHONE.at(G,d1,lt(G,d1,21),[Z('我明天的飛機'),Z('信封交給老闆了，你去店裡跟他拿')],'y3_zr_slips_fly'); F.ZR_SLIPS_WAIT='owner'; } }
    if(!dating(G,'heroine_02')||isUS(G)) return; const K=S.SLIPS_DAYS[isJP(G)?'JP':'TW'], di=D(K.inv), d=D(K.day); if(di==null||d==null||G.day<di||G.day>d) return;
    if(now(G)>=T(di,lt(G,di,21))&&now(G)<T(d,lt(G,d,14.5))&&!PHONE.sent(G,'y3_zr_slips')) PHONE.at(G,di,lt(G,di,21),['明天店休。下午兩點，來店裡。','門會鎖著。敲三下。……我跟老闆借了一個下午。'].map(Z),'y3_zr_slips');
    if(PHONE.sent(G,'y3_zr_slips')&&!outGet(G,'y3_zr_slips')&&now(G)<T(d,lt(G,d,14.5))) plan(G,{id:'y3_zr_slips',ev:'ev_zhiruo_twelve_slips',day:d,h:lt(G,d,14),late:0.5,place:'兩點半（店休）',title:'和芷若：兩點半（店休）',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.slipsMissed=function(G,q){ const F=G.flags; if(F.ZR_TWELVE_SLIPS||F.ZR_SLIPS_WAIT) return; F.ZR_SLIPS_WAIT='bar'; const d=q&&q.day!=null?q.day:G.day, Z=M('p:heroine_02','heroine_02');
    PHONE.at(G,d,lt(G,d,16),[Z('（照片：十二張點單疊在一個信封裡）'),Z('第一部，我先一個人看了'),Z('信封放在吧檯下面。下次來拿')],'y3_zr_slips_photo'); };
  /* 主線 10 的房間物件（1A-09 拆箱，照三選一多一件；拿起來的旁白 AA_343 D7）：實習＝空白的初談紀錄表；打工・家教＝家教學生的卡片（家教以外的打工＝那家店的班表）；
     讀國考＝不另外放（和大一那本是同一本）：大一那本舊《民法》（y1_0）在第四個房間的說明換成 D7 那一句（STORY.ROOM_EXTRA）*/
  S.ROOM_SUMMER={intern:['sum_intern','空白的初談紀錄表','（實習帶回來的初談紀錄表，空白的。第一次自己寫完的那一份，交給律師了。）'],
    tutor:['sum_tutor','家教學生的卡片','（家教學生最後一堂課給的卡片。上面寫著：『老師，背完以後才開始，對嗎？』）'],
    work:['sum_work','那家店的班表','（暑假的班表。最後一班那一格，老闆畫了一個便當。）']};
  S.ROOM_SUMMER_OLD={sum_study:'翻捲了書角的《民法》'};   /* 這一版以前拆箱拆到的舊存檔：收拾時叫得出名字 */
  S.roomSummer=G=>{ const k=G&&G.flags&&G.flags.SUMMER_Y3; if(G&&isJP(G)) return null; return k==='intern'?S.ROOM_SUMMER.intern:(k==='work'?(tutor(G)?S.ROOM_SUMMER.tutor:S.ROOM_SUMMER.work):null); };   /* 日本路線 9/3 的房間沒有三選一的物件（AA_349 L2：D7 那一套只給台灣、美國路線）*/
  S.Y1_CIVIL_STUDY='（大一的《民法》。書角都翻捲了。這個暑假，又從第一頁讀起。）';
  if(typeof STORY!=='undefined'&&STORY.roomY4Items&&STORY.ROOM_Y4_TEXT&&!STORY._r2y3bRoom){ for(const k in S.ROOM_SUMMER){ const [id,n]=S.ROOM_SUMMER[k]; STORY.ROOM_Y4_TEXT[id]=[n,null]; } for(const id in S.ROOM_SUMMER_OLD) STORY.ROOM_Y4_TEXT[id]=[S.ROOM_SUMMER_OLD[id],null];
    const ri0=STORY.roomY4Items; STORY.roomY4Items=function(G){ const L=ri0.apply(this,arguments), r=S.roomSummer(G); if(r&&Array.isArray(L)&&!L.some(x=>x[0]===r[0])) L.push([r[0],r[1],[r[2]]]); return L; };
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>{ const F=(G&&G.flags)||{}; if(F.SUMMER_Y3==='study'&&F.ROOM_Y4!=null&&L[0]&&/舊《民法》/.test(L[0][0])) L[0]=[L[0][0],S.Y1_CIVIL_STUDY]; });   /* 第四個房間（9/3 搬進去以後）*/
    STORY._r2y3bRoom=true; }

  /* ===================== 第 3 節：大三寒暑假的停點（HOME.BREAK_PTS 的 Y3W、Y3S；照路線的放 HOME.STOPS）=====================
     不改快轉的主邏輯（home3d.js）：這裡只填表。BREAK_PTS 放每條路線都一樣的（除夕、初一＝主線 9 ev_family_land_y3 在家的第一個時段、語彤生日、抽籤、主線 10 第四個房間）；
     寒假最後一天 2/20 17:00 的 back 由 HOME.breakPts 自己補（表上沒有 back／room）。照路線的（日本 X1 退宿、三選一、摘要日、美國 X1 退宿）在 S.Y3_STOPS（HOME.STOPS）。
     到了那個時間要演的旁白（摘要日、抽籤「（最後一次抽籤。四樓。）」、8/21 的信封）：包住 HOME.breakArrive（原本的先跑）。 */
  S.BREAK_Y3={Y3W:[['2028-01-25',12,'eve'],['2028-01-26',11,'cny']],
    Y3S:[['2028-07-09',12,'ytbday'],['2028-07-15',10,'lottery4'],['2028-09-03',8.5,'room']]};   /* 9/3 美國路線不演（在美國；roomY4Due 等 12/23）*/
  S.Y3_STOPS=[['2028-02-20',14,['JP']],   /* out_jp：日本路線 X1 退宿（2-Y3-25）*/
    ['2028-06-19',21,['TW','US']],['2028-06-26',18.5,['TW','US'],'sum'],['2028-07-24',18.5,['TW','US'],'sum'],['2028-07-25',14,['US']],   /* plan3、摘要日、out_us（2-Y3-51）*/
    ['2028-07-31',18.5,['US'],'sum'],['2028-08-21',18.5,['TW'],'sum']];   /* 日本路線沒有 8/5 的三選一、8/21 的摘要日在 jp3d.js（AA_349 L2）*/
  if(typeof HOME!=='undefined'&&HOME.BREAK_PTS){ for(const k in S.BREAK_Y3) if(!HOME.BREAK_PTS[k]) HOME.BREAK_PTS[k]=S.BREAK_Y3[k]; }
  S.stops=function(G){ const B=typeof HOME!=='undefined'&&HOME.lawBreak?HOME.lawBreak(G):null; if(!B||(B.key!=='Y3W'&&B.key!=='Y3S')) return null; const r=rk(G), out=[];
    for(const [k,h,rs,kind] of S.Y3_STOPS){ const d=D(k); if(d==null||d<B.from||d>B.to||!rs.includes(r)) continue; if(kind==='sum'&&HOME.sumSkip&&HOME.sumSkip(G,d)) continue; out.push(T(d,h)); }
    return out; };
  const phoneNow=GM=>{ const G=GM.G; if(typeof PHONE==='undefined') return; try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ if(out.length&&GM.toast) GM.toast('手機｜'+PHONE.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('R2Y3B phone',e); } };
  S.breakArrive=async function(GM){ const G=GM.G, t=now(G), r=rk(G), at=(k,h)=>{ const d=D(k); return d!=null&&Math.abs(T(d,h)-t)<1e-6; };
    if(at('2028-07-15',10)&&r!=='JP'){ phoneNow(GM); await GM.say(null,'（最後一次抽籤。四樓。）'); }   /* lottery4（2-Y3-49；台灣、美國路線）*/
    for(const [k,i] of (S.SUM_DAYS[r]||[])){ if(!at(k,18.5)) continue; const d=D(k); if(typeof HOME!=='undefined'&&HOME.sumSkip&&HOME.sumSkip(G,d)) continue;
      const l=S.sumLine(G,i); if(l) await GM.say(null,l); } };   /* 8/21 的「信封到了」作廢（AA_343 D8）*/
  if(typeof HOME!=='undefined'&&!HOME._r2y3bBreak){ if(Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,nowT)=>S.stops(G,nowT));
    if(HOME.breakArrive){ const ba0=HOME.breakArrive; HOME.breakArrive=async function(GM){ const r=await ba0.apply(this,arguments); try{ await S.breakArrive(GM); }catch(e){ console.warn('R2Y3B breakArrive',e); } return r; }; }
    HOME._r2y3bBreak=true; }

  /* ===================== 2-Y3-46 芷若 Z13、2-Y3-47 子晴 Q15：大三下學期末（Y3S2，6/8～6/18）心意邀約的專屬版 =====================
     在 termend3d.js 的一般版之上包一層（不改 termend3d.js）：時段第一天排這學期的邀約（TERMEND.plan）時，心意邀約裡有她、而且這一版的前置也到齊＝記 plan.special（之後不重算，BB_203 第 5 節）。
     Z13 前置（BB_90 4-1 七環拿掉作廢的兩環，裁定 #25）：CAFE_VISITS ≥3、ASKED_HER_DRINK、REMEMBERED_HER、看過她的早場（WATCHED_FILM／WATCHED_FILM_GROUP）、POSTCARDS、不是日本路線、沒演過 ev_zhiruo_his_order。
     Q15 前置（BB_90 4-2）：CLAPPED、PLAYTESTED、ZQ_DAD_HEARD、ATTENDED_SHOW、不是日本路線。沒到齊＝AA_254 的一般版。
     TOLD_HER_CHANGE（祐廷說過自己換方向）不是必要：有沒有都照樣走，不加新句（AA_360 第 3 節，第②級：她的專業核心不是跟祐廷學的）。
     - Z13：邀約的字換（TERMEND_LINES.HEART 的 over）；飯排 6/15（四）22:00 兩點半打烊後（TERMEND.planDinner；22:15 還沒到＝22:30 她傳、窗口延到 23:00；23:00 再沒到＝帶到場 R4）；
       飯＝開場（AA_250 10-1）＋話題池兩句＋邀約鉤子，吃完接杯子（S.z13Dinner，不走回家的路）：喝下去／台階＝交往；「這杯我不能喝」＝這學期不交往（F3 照 6/19，AA_334 第 3 節）。
     - Q15：邀約、飯桌一句換（over）；回家路上（TERMEND.walkHome）前三個選項換成 BB_165 4-1 的三句：說出來＝她跑進巷子、隔天 12:00「回答.exe」（演一次＋手機檔案，回插座貓貼紙＝交往；
       收到檔案的隔天 21:00 以前沒回（AA_343 D11）＝她傳那一句、這學期不交往＝「讓我想想」，下學期她用第二次的邀約）；先不說＝照一般版她說（第二次＝she2）。記 ZQ_CONFESS_LINE。
     上學期選了「讓我想想」的：第二次也走專屬版，邀約換第二次的字（AA_343 D10）。 */
  S.z13Ready=G=>{ const F=G.flags||{}; return (+F.CAFE_VISITS||0)>=3&&has('heroine_02','ASKED_HER_DRINK')&&has('heroine_02','REMEMBERED_HER')&&(has('heroine_02','WATCHED_FILM')||has('heroine_02','WATCHED_FILM_GROUP'))&&has('heroine_02','POSTCARDS')&&!isJP(G)&&!done(G,'ev_zhiruo_his_order'); };
  S.q15Ready=G=>{ const F=G.flags||{}; return has('heroine_04','CLAPPED')&&(has('heroine_04','PLAYTESTED')||!!F.PLAYTESTED)&&(!!F.ZQ_DAD_HEARD||has('heroine_04','ZQ_DAD_HEARD'))&&!!F.ATTENDED_SHOW&&!isJP(G); };   /* AA_360 第 3 節：TOLD_HER_CHANGE 拿掉（不是必要）*/
  S.special=(G,id)=>{ const R=G&&G.termend&&G.termend.Y3S2, P=R&&R.plan; return P&&P.special?P.special[id]||null:null; };
  const XT=()=>{ const X=ABE(); return X?{Z13:X.Z13,Z13_TXT:X.Z13_TXT||{},Q15:X.Q15||{}}:null; };
  const TL=()=>typeof TERMEND_LINES!=='undefined'?TERMEND_LINES:null;
  /* 台詞表的 run（照 termend3d.js：字串＝她說、{narr}＝旁白、{who,text}）*/
  const runT=async(GM,who,arr)=>{ const G=GM.G, me={name:nm(who),charId:who}; for(let x of (Array.isArray(arr)?arr:[arr])){ if(typeof x==='function') x=x(G); if(x==null) continue; if(Array.isArray(x)){ await runT(GM,who,x); continue; }
      if(typeof x==='string') await GM.say(me,x); else if(x.cg!==undefined){ if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg(x.cg); } else if(x.narr) await GM.say(null,x.narr); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text); else if(x.text) await GM.say(x.who&&x.who!==who?{name:nm(x.who),charId:x.who}:me,x.text); } };
  /* 台詞表：邀約、飯桌一句照學期換（over，Y3S2；條件不到＝原本那一句）*/
  if(typeof TERMEND_LINES!=='undefined'&&TERMEND_LINES.HEART&&!TERMEND_LINES._r2y3b){ const H=TERMEND_LINES.HEART, rs=(x,G)=>typeof x==='function'?x(G):x;
    if(H.heroine_02){ const y3=(H.heroine_02.over||[]).find(v=>v&&v.terms&&v.terms.includes('Y3S2')), b={invite:(y3&&y3.invite)||H.heroine_02.invite,invite2:(y3&&y3.invite2)||H.heroine_02.invite2}, z=G=>S.special(G,'heroine_02')==='z13'&&XT();   /* 一般版：台詞表大三下那一版（AA_377 第 8 項：週四十點；沒有才用原本的）*/
      (H.heroine_02.over||(H.heroine_02.over=[])).push({terms:['Y3S2'],invite:G=>z(G)?XT().Z13_TXT.invite:rs(b.invite,G),invite2:G=>z(G)?(XT().Z13_TXT.invite2||XT().Z13_TXT.invite):rs(b.invite2,G)}); }   /* invite2：上學期「讓我想想」的第二次（AA_343 D10）*/
    if(H.heroine_04){ const b={invite:H.heroine_04.invite,invite2:H.heroine_04.invite2,table:H.heroine_04.table}, q=G=>S.special(G,'heroine_04')==='q15'&&XT();
      (H.heroine_04.over||(H.heroine_04.over=[])).push({terms:['Y3S2'],invite:G=>q(G)?XT().Q15.invite:rs(b.invite,G),invite2:G=>q(G)?(XT().Q15.invite2||XT().Q15.invite):rs(b.invite2,G),table:G=>q(G)?XT().Q15.table:rs(b.table,G)}); }
    TERMEND_LINES._r2y3b=true; }
  const Z13_ID='te_Y3S2';
  S.z13Out=G=>{ const q=outGet(G,Z13_ID); return q&&q.te&&q.te.special==='z13'?q:null; };
  if(typeof TERMEND!=='undefined'&&!TERMEND._r2y3bSP){
    const plan0=TERMEND.plan; TERMEND.plan=function(G,w){ const R=TERMEND.rec(G,w.id), had=!!R.plan, P=plan0.apply(this,arguments);
      if(!had&&P&&w&&w.id==='Y3S2'&&!P.special){ P.special={}; const hs=P.heart||[]; if(hs.includes('heroine_02')&&S.z13Ready(G)&&!S.knowsOther(G,'heroine_02')) P.special.heroine_02='z13'; if(hs.includes('heroine_04')&&S.q15Ready(G)&&!S.knowsOther(G,'heroine_04')) P.special.heroine_04='q15'; }   /* AA_474 3b：她知道祐廷有別人＝這學期不演特別版（一般的邀約、飯、知情版心意邀約）*/
      return P; };
    const pd0=TERMEND.planDinner; TERMEND.planDinner=function(G,w,who,kind){
      if(kind==='heart'&&w&&w.id==='Y3S2'&&S.special(G,who)==='z13'&&typeof OUT!=='undefined'){ const day=TERMEND.dinnerDay(G,w,{h:22,wd:4},who); if(day==null) return false;   /* 6/15（四）22:00（她 6 月照排週三、四晚班）*/
        return OUT.plan(G,{id:'te_'+w.id,ev:'ev_termend_dinner',day,h:22,late:1,place:'兩點半 Café 打烊以後',title:'學期末的飯：'+nm(who)+'（兩點半 Café 打烊以後）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:w.id,who,kind,special:'z13'}}); }
      const r=pd0.apply(this,arguments); if(kind==='heart'&&w&&w.id==='Y3S2'&&S.special(G,who)==='q15'){ const q=outGet(G,'te_'+w.id); if(q&&q.te&&q.te.who===who) q.te.special='q15'; } return r; };
    const dn0=TERMEND.dinner; S._dn0=dn0; TERMEND.dinner=async function(GM,q){ if(q&&q.te&&q.te.special==='z13') return S.z13Dinner(GM,q); return dn0.apply(this,arguments); };
    const wh0=TERMEND.walkHome; TERMEND.walkHome=async function(GM,who,term){ if(who==='heroine_04'&&term==='Y3S2'&&S.special(GM.G,who)==='q15'&&!S.knowsOther(GM.G,who)) return S.q15Walk(GM,who,term); return wh0.apply(this,arguments); };   /* 排好以後才知道（AA_474 3b）：一般的回家路上（知情版由 multirel3d.js 先接）*/
    const ms0=TERMEND.missed; TERMEND.missed=function(GM,q){ if(q&&q.te&&q.te.special==='z13') return; return ms0?ms0.apply(this,arguments):undefined; };   /* Z13 沒到：23:00 帶到場（S.z13Bring）*/
    TERMEND._r2y3bSP=true; }
  /* ---- Z13 的飯：開場、話題池兩句（祐廷回一句）、邀約鉤子 → 杯子 ---- */
  S.z13Dinner=async function(GM,q){ const G=GM.G, F=G.flags, Lx=TL(), X=XT(), te=(q&&q.te)||{term:'Y3S2',who:'heroine_02',kind:'heart',special:'z13'}, who='heroine_02'; if(!Lx||!X||!X.Z13||typeof TERMEND==='undefined') return false;
    if(S.knowsOther(G,who)&&S._dn0) return S._dn0.call(TERMEND,GM,Object.assign({},q||{},{te}));   /* AA_474 3b：排好以後她才知道祐廷有別人＝不演杯子，改走一般的飯＋知情版心意邀約（S.knowWalk 三問）*/
    const R=TERMEND.rec(G,te.term), Rt=TERMEND.rec(G), P=(Lx.PLACE&&Lx.PLACE.cafe)||{}, me={name:G.name||'祐廷'};
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark',right:{charId:who,expression:'neutral'}});
    if(P.open) await GM.say(null,P.open);
    const pool=(((Lx.POOL||{})[te.term]||{})[who]||[]).map(x=>typeof x==='function'?x(G):x).filter(x=>x!=null), n=Math.min(2,pool.length);
    for(let i=0;i<n;i++){ await runT(GM,who,[pool[i]]); if(i<n-1&&Lx.REPLY&&Lx.REPLY.length) await GM.say(me,Lx.REPLY[i%Lx.REPLY.length]); }
    if(X.Z13_TXT&&X.Z13_TXT.table) await runT(GM,who,[X.Z13_TXT.table]);   /* 飯桌一句（AA_254 第 4 節；AA_343 D9：吃飯的時候她說，杯子那一段的伏筆）＝一般版的位置：話題之後、鉤子之前 */
    if(TERMEND.hook) await TERMEND.hook(GM,te.term,who);   /* 邀約鉤子（AA_250 10-1：話題之後）*/
    R.done={who,kind:'heart',day:G.day};
    await runL(X.Z13,evOf('ev_termend_dinner'));
    const k=F.ZR_CUP;
    if(k==='drank'||k==='steps'){ if(!S.romStart(G,who)) return 'blocked'; delete Rt.think[who]; R.result='yes'; return 'yes'; }   /* 交往（照心意邀約的交往）*/
    R.result='declined'; return 'declined'; };   /* 這學期不交往（不是「讓我想想」：她 9/2 出國，大四沒有她的學期末）*/
  /* 22:15 還沒到：22:30 她傳；23:00 再沒到＝帶到場（R4：黑幕、旁白「店裡只剩吧檯一盞燈。她在等你。」接原台詞）*/
  S.z13Phone=function(G){ const q=S.z13Out(G); if(!q||q.arrived||q.state==='done') return; if(now(G)>=T(q.day,22.5)&&now(G)<T(q.day+1,6)&&!PHONE.sent(G,'y3_zr_z13_wait')) PHONE.at(G,q.day,22.5,[{th:'p:heroine_02',from:'heroine_02',text:XT().Z13_TXT.wait}],'y3_zr_z13_wait'); };
  S.z13BringDue=G=>{ const q=S.z13Out(G); return !!q&&!q.arrived&&q.state!=='done'&&now(G)>=T(q.day,23)&&now(G)<T(q.day+1,6)&&G.flags.Z13_BROUGHT==null; };
  S.z13Bring=async function(GM,o){ const G=GM.G, q=S.z13Out(G); if(!q||!S.z13BringDue(G)) return false; G.flags.Z13_BROUGHT=G.day; q.state='done';
    GM.sceneBegin(); try{ if(o&&o.fromHome&&typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=false; H.wakeAsk=null; }
      if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard(q.title||'兩點半 Café 打烊以後','',2000);
      if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark'}); await GM.fade(false);
      await GM.say(null,XT().Z13_TXT.bring);
      await S.z13Dinner(GM,q);
      await GM.fade(true); GM.advance(1.5); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
      if(o&&o.fromHome&&typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); }   /* 從家裡被帶過去：演完回家（HOME.tick 接著家裡的選單）*/
      await GM.fade(false); if(!(o&&o.fromHome)&&GM.caption) GM.caption('','回到台大。',2400); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* ---- Q15 回家的路上 ---- */
  S.q15Walk=async function(GM,who,term){ const G=GM.G, F=G.flags, Lx=TL(), X=XT(), h=TERMEND.heart(who,term), R=TERMEND.rec(G,term), Rt=TERMEND.rec(G); if(!h||!Lx||!X) return null;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark',right:{charId:who,expression:'neutral'}});
    await runT(GM,who,h.walk);
    const O=X.Q15.opts, k=await GM.choose(O.map(o=>o.t).concat([Lx.NOT_YET_OPT]).map(t=>({t})));
    if(k>=0&&k<O.length){ const o=O[k]; F.ZQ_CONFESS_LINE=o.k; F.ZQ_Q15={day:G.day,k:o.k};
      await runT(GM,who,[hasCG('cg_flustered_heroine04')?{cg:'cg_flustered_heroine04'}:null,X.Q15.sure,o.r].concat(X.Q15.run)); R.result='q15'; return 'q15'; }   /* 她跑進巷子：隔天 12:00 的「回答.exe」再決定。BCG-20 放在「欸不是……你認真的？」（cg_approved/ README；V6-B7）*/
    const again=Rt.think[who]!=null; await runT(GM,who,again?h.she2:h.she);   /* 先不說：照一般版她說（AA_254 第 5 節）*/
    const a=await GM.choose((h.answer||Lx.ANSWER).map(t=>({t})));
    if(a===0){ if(!S.romStart(G,who)) return 'blocked'; delete Rt.think[who]; R.result='sheSaid'; return 'sheSaid'; }
    await runT(GM,who,[h.think]); Rt.think[who]=term; R.result='think'; return 'think'; };
  /* ---- 隔天 12:00「回答.exe」：手機收到檔案（回插座貓貼紙＝交往；收到檔案的隔天 21:00 以前沒回＝她打來，AA_343 D11）＋演一次遊戲畫面（BCG-13 登錄了才放；沒有＝文字＋字卡疊那一行）。
     AA_296 2-3-1 ②（企劃線 3f406dbc）：有沒有在一起不再只靠手機回貼紙——最後那一行字疊完，直接在場面裡給兩個選項（Q15.exeOpts，不用另外開手機）：
       「（回一張插座貓貼紙）」＝照手機那顆按鈕（記 ZQ_EXE_REPLY、手機那段對話補上貼圖、交往），接著演她馬上打來（ev_ziqing_exe_call 的台詞；Q.call scene）；
       「（還沒想好怎麼回）」＝手機的按鈕照留到隔天 21:00；之後在手機回了貼紙＝她馬上打來（OUT 的電話 y3_zq_exe_call；Q.call out）。
       到期限還是沒回＝21:00 她打來（y3_zq_noreply_call：前 2 小時才排、不跳「排進行程」；回了貼紙就取消）；沒接（睡著、在忙，過了 30 分鐘）＝原本那一則私訊 y3_zq_noreply ---- */
  S.ZQ_CALL={sticker:'y3_zq_exe_call',none:'y3_zq_noreply_call',late:0.5,lead:2};
  /* 跳過時間停在她打來的時間（AA 10-22 08:41；睡覺照舊算沒接）：收到檔案的隔天 21:00 還沒回（Q.res 沒有值）*/
  if(typeof CLS!=='undefined'&&CLS.STOP_FNS) CLS.STOP_FNS.push(G=>{ const Q=G.flags&&G.flags.ZQ_Q15; if(!Q||Q.res!=null||Q.day==null||G.day!==Q.day+2) return []; const q=outGet(G,S.ZQ_CALL.none); if(q&&q.state!=='planned') return []; return [{h:21,why:'手機響了'}]; });
  S.exeDue=G=>{ const Q=G.flags&&G.flags.ZQ_Q15; return !!Q&&Q.seen==null&&Q.res!=='knows'&&now(G)>=T(Q.day+1,12)&&now(G)<T(Q.day+2,0); };
  S.exeScene=async function(GM){ const G=GM.G, Q=G.flags.ZQ_Q15, X=XT(); if(!Q||!X) return false; Q.seen=G.day; const o=(X.Q15.opts||[]).find(x=>x.k===Q.k)||{}, home=atHome(G), A=typeof ADV!=='undefined'?ADV:null;
    const bg=home&&typeof HOME!=='undefined'&&HOME.bgNow?HOME.bgNow():'dark';
    GM.sceneBegin(); try{ if(A&&A.begin) A.begin({background:bg});
      await GM.say(null,X.Q15.exe);
      if(hasCG('cg_answer_exe_heroine04')&&A&&A.cg) A.cg('cg_answer_exe_heroine04');   /* BCG-13（遊戲畫面）：登錄了才放 */
      const line=String(o.exe||'').replace(/\{name\}/g,G.name||'祐廷'); if(line&&GM.titleCard) await GM.titleCard(line,'',2600);   /* 最後一個畫面疊上那一行字 */
      const EO=X.Q15.exeOpts||[]; if(EO.length&&Q.res==null){ const k=await GM.choose(EO.map(t=>({t})));   /* AA_296 ②：場面裡的兩個選項 */
        if(k===0){ Q.call='scene'; S.exeSticker(G); const ev=evOf('ev_ziqing_exe_call'); if(ev&&Q.res!=='knows'){ await runL(ev.dialogue,ev); mark(G,ev.id); } } }   /* 回了貼紙：她馬上打來（同一段演完）；她這兩天才知道祐廷有別人＝不交往、不打（AA_474 3b，q15Knows）*/
      if(home){ if(A&&A.begin) A.begin({background:bg}); } else if(A&&A.active&&A.end) A.end(); }   /* 在家：回到家裡的畫面（HOME 的選單接著）*/
    finally{ GM.sceneEnd(); } return true; };
  /* 場面裡選了貼紙：照手機那顆按鈕回（手機那段對話補上「（貼圖：插座貓）」、記 ZQ_EXE_REPLY），再照 q15Phone 記交往 */
  S.exeSticker=function(G){ if(typeof PHONE!=='undefined'){ if(!PHONE.byAsk(G,'y3_zq_exe')){ S.q15Phone(G); PHONE.tick(G); } PHONE.answer(G,'y3_zq_exe',0); } G.flags.ZQ_EXE_REPLY=true; S.q15Phone(G); };
  /* AA_474 3b：Q15 的回家路上以後、交往以前她才知道祐廷有別人（回答.exe 還沒傳、或回貼紙那一刻）＝不演特別版剩下的：不傳檔案、回了貼紙也不交往、不打來；
     這學期算「讓我想想」，下學期她的心意邀約走一般的知情版（AA 沒有寫這一種她說的話：不傳字）*/
  S.q15Knows=function(G){ const Q=G.flags&&G.flags.ZQ_Q15; if(!Q||Q.res!=null||!S.knowsOther(G,'heroine_04')) return false; Q.res='knows';
    if(typeof TERMEND!=='undefined'){ TERMEND.rec(G).think.heroine_04='Y3S2'; TERMEND.rec(G,'Y3S2').result='think'; }
    for(const id of [S.ZQ_CALL.none,S.ZQ_CALL.sticker]){ const q=outGet(G,id); if(q&&q.state==='planned') q.state='cancelled'; } return true; };
  S.q15Phone=function(G){ const F=G.flags, Q=F.ZQ_Q15, X=XT(); if(!Q||!X) return; const d1=Q.day+1, Z=M('p:heroine_04','heroine_04'), C=S.ZQ_CALL, dl=T(d1+1,21);
    if(Q.res==null&&(F.ZQ_EXE_REPLY===true||now(G)>=T(d1,12))&&S.q15Knows(G)){ S.q15KnowsMsg(G); return; }
    if(Q.res==='knows'){ S.q15KnowsMsg(G); return; }
    if(now(G)>=T(d1,12)&&!PHONE.sent(G,'y3_zq_exe')){ const m=Z('（檔案：回答.exe）'); m.ask={id:'y3_zq_exe',until:dl,opts:[{t:'（回一張插座貓貼紙）',post:'（貼圖：插座貓）',set:{ZQ_EXE_REPLY:true}}]}; PHONE.at(G,d1,12,[m],'y3_zq_exe'); }
    if(F.ZQ_EXE_REPLY===true&&Q.res==null){ Q.res='sticker'; const R=TERMEND.rec(G,'Y3S2'), Rt=TERMEND.rec(G); if(S.romStart(G,'heroine_04')){ delete Rt.think.heroine_04; R.result='yes'; }   /* 回貼紙＝交往 */
      { const q=outGet(G,C.none); if(q&&q.state==='planned') q.state='cancelled'; }   /* 不回的那一通不打了 */
      if(Q.call==null){ Q.call='out'; plan(G,{id:C.sticker,ev:'ev_ziqing_exe_call',day:G.day,h:hh(G),late:C.late,must:true,place:'電話',title:'子晴打電話來',verb:'接起來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true}); } }   /* 手機回的：她馬上打來（AA_296 ②）*/
    if(Q.res==null){ if(!outGet(G,C.none)&&now(G)>=dl-C.lead&&now(G)<dl+C.late) plan(G,{id:C.none,ev:'ev_ziqing_noreply_call',day:d1+1,h:21,late:C.late,must:true,place:'電話',title:'子晴打電話來',verb:'接起來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true});
      if(now(G)>=dl) S.q15NoReply(G); }   /* 到期限：這學期不交往（電話接不接都一樣）*/
    if(Q.res==='none'){ const q=outGet(G,C.none); if(!q||q.state==='missed'||(q.state==='planned'&&now(G)>T(q.day,q.h)+C.late)){ if(q&&q.state==='planned') q.state='missed'; S.q15NoReplyDm(G); } } };   /* 沒接、沒排到（那一段沒跑到規則）＝原本那一則私訊；人在家的時候 OUT.tick 不跑：過了時間這裡自己記沒接 */
  /* AA_483 第 1 節第 6 點：她已經傳了回答.exe、玩家也回了貼紙，之後她才知道（res knows）＝玩家在等她打來：原本她打來的時間（回貼紙那一刻）改傳兩則（一次）。
     檔案還沒傳就知道的：玩家不知道有這個檔案，不用補 */
  S.q15KnowsMsg=function(G){ const F=G.flags, Q=F&&F.ZQ_Q15, X=XT(); if(!Q||Q.res!=='knows'||F.ZQ_EXE_REPLY!==true||typeof PHONE==='undefined'||!PHONE.sent(G,'y3_zq_exe')||PHONE.sent(G,'y3_zq_knows_msg')||!X||!X.Q15.knowsMsg) return false;
    const M=typeof MREL!=='undefined'?MREL:null, ys=M&&M.knownOthers?M.knownOthers(G,'heroine_04'):[], y=M&&M.newest?M.newest(G,'heroine_04',ys):ys[0], c=M&&M.ctx&&y?M.ctx(G,'heroine_04',y):{her:''}; if(!y) return false;   /* {她} 換不出名字（那一位已經不在交往）＝不傳半句 */
    const t=x=>M&&M.subst?M.subst(x,G,c):String(x).replace(/\{她\}/g,c.her||'');
    return PHONE.at(G,G.day,hh(G),X.Q15.knowsMsg.map(x=>({th:'p:heroine_04',from:'heroine_04',text:t(x)})),'y3_zq_knows_msg'); };
  S.q15NoReply=function(G){ const Q=G.flags&&G.flags.ZQ_Q15; if(!Q||Q.res!=null) return; Q.res='none'; if(typeof TERMEND!=='undefined'){ TERMEND.rec(G).think.heroine_04='Y3S2'; TERMEND.rec(G,'Y3S2').result='think'; } };   /* 不回＝「讓我想想」：這學期不交往，下學期她用第二次的邀約 */
  S.q15NoReplyDm=function(G){ const Q=G.flags&&G.flags.ZQ_Q15, X=XT(); if(!Q||!X) return; S.q15NoReply(G); if(Q.res!=='none'||typeof PHONE==='undefined') return; PHONE.at(G,Q.day+2,21,[{th:'p:heroine_04',from:'heroine_04',text:Q.k==='not_question'?X.Q15.noReplyNQ:X.Q15.noReply}],'y3_zq_noreply'); };
  /* 家裡（home3d.js 的 loop 問 STORY.y4HomeDue）：「回答.exe」在家演（stay）；Z13 帶到場＝先離開家 */
  S.homeDue=G=>{ if(!law(G)) return null; if(S.exeDue(G)) return 'stay'; if(S.z13BringDue(G)) return 'r2y3b_z13'; return null; };
  if(typeof STORY!=='undefined'&&!STORY._r2y3bHome){ const hd0=STORY.y4HomeDue, hs0=STORY.y4HomeScene, hf0=STORY.y4FromHome;
    STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; return r||S.homeDue(G); };
    STORY.y4HomeScene=function(GM){ if(S.homeDue(GM.G)==='stay'&&!(hd0&&hd0(GM.G))) return S.exeScene(GM); return hs0?hs0.apply(this,arguments):null; };
    STORY.y4FromHome=function(GM,k){ if(k==='r2y3b_z13') return S.z13Bring(GM,{fromHome:true}); return hf0?hf0.apply(this,arguments):null; };
    if(Array.isArray(STORY.WAKE_AT)) STORY.WAKE_AT.push(G=>{ const q=S.z13Out(G); return q&&!q.arrived&&q.state!=='done'&&G.day===q.day&&G.hour<23&&law(G)?23:null; });   /* Z13：睡著也會在 23:00 醒來（帶到場）*/
    STORY._r2y3bHome=true; }
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.STOPS)) HOME.STOPS.push(G=>{ const out=[], q=S.z13Out(G), Q=G.flags&&G.flags.ZQ_Q15; if(q&&!q.arrived&&q.state!=='done') out.push(T(q.day,23)); if(Q&&Q.seen==null) out.push(T(Q.day+1,12)); return out; });   /* 放假在家的快轉、睡覺停在帶到場、回答.exe */

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    S.groupPhone(G); S.azaleaPhone(G); S.c6Phone(G); S.k18Phone(G); S.xunPhone(G); S.yu4Phone(G); S.jpPhone(G); S.toastPhone(G);
    S.sakuraPhone(G); S.farPhone(G); S.farPhoneUS(G); S.yu5Phone(G); S.z11bPhone(G); S.kxBdayPhone(G);
    S.xcPhone(G); S.noticePhone(G); S.k20Phone(G); S.f3Phone(G); S.lotteryPhone(G);
    S.whitePhone(G); S.farVideoPhone(G); S.abPhone(G); S.anBackPhone(G);
    S.summerPlanPhone(G); S.ytBdayPhone(G); S.slipsPhone(G); S.z13Phone(G); S.q15Phone(G); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['r2y3b3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=(p,tag)=>{ busy=true; Promise.resolve(p).catch(e=>console.warn('R2Y3B '+tag,e)).finally(()=>{ busy=false; }); return true; };
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(busy||!G||!G.flags||!law(G)) return false; if(atHome(G)) return false;
    if(out()&&OUT.due&&OUT.due(G)) return false;   /* 出遊的「出發」先問 */
    if(S.x1Due(G)) return go(S.x1Go(GM),'x1');   /* 2-Y3-51 美國路線退宿 */
    if(S.z13BringDue(G)) return go(S.z13Bring(GM),'z13');   /* 2-Y3-46 23:00 帶到場 */
    if(S.exeDue(G)) return go(S.exeScene(GM),'exe');   /* 2-Y3-47 隔天 12:00「回答.exe」*/
    return false; };
  /* F3 發生以後，芷若這學期（大三下）不再發心意邀約（BB_98 5-4）*/
  if(typeof TERMEND!=='undefined'&&TERMEND.heartWhy&&!TERMEND._r2y3bF3){ const orig=TERMEND.heartWhy; TERMEND.heartWhy=function(G,id,w){ const F=(G&&G.flags)||{};
      if(id==='heroine_02'&&w&&w.id==='Y3S2'&&F.FANG_F3_DAY!=null&&F.FANG_F3_DAY<=w.from&&F.FANG_F3!=='congrats') return false; return orig.apply(this,arguments); }; TERMEND._r2y3bF3=true; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  S.addSched();
  /* 人物面板的記憶名稱：搬到 social3d.js 的 MEMORY_LABEL（AN3_AZALEA、YU_CLUB_BEAR、YU_ALONE＋四項照 AA_343 第 5 節定稿；人物面板的測試只讀那裡）*/
  return S;
})();
