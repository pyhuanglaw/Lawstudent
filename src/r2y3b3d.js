/* ===== 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54＋第 3 節大三寒暑假的停留日（AA-C 定稿 e284d601；台詞照原文、不改字）=====
   事件（出遊、電話、視訊、在場景裡碰到的）在 src/data/r2y3b_events.js（R2Y3B_EVENTS）。這裡用掛勾接進去，不改 story3d.js：
   - STORY.PHONE_RULES：手機（邀約、出發提醒 OUT.plan、沒去的照片、結果）；
   - STORY.TICKS：時間到了自動演的 2D（日本路線的便利商店、河堤、宿舍大廳；回答.exe；美國路線退宿）；
   - 一天的作息（以安 3/9 椰林大道、小語 3/16 霖澤館一樓、芯慈 5/4 麵店）：載入時放到她們 daily_schedule 的最前面（同 AA_320 118 巷那一套的寫法）；
   - 寒暑假的停留日（AA_326 第 3 節）：HOME.BREAK_PTS 的 Y3W、Y3S（照路線過濾）＋摘要日旁白（包住 HOME.breakPts、HOME.breakArrive）；
   - 學期末專屬版（2-Y3-46 芷若 Z13、2-Y3-47 子晴 Q15）：TERMEND_LINES 的 over＋包住 TERMEND 的 planDinner、dinner、walkHome、missed、heartWhy。
   時間：日本路線在日本的場景（便利商店、河堤、町公所、宿舍大廳）用日本時間寫，遊戲時鐘是臺灣時間（STORY.tzOffset 日本 +1）：S.jp(h)＝日本 h 點在遊戲時鐘的時間。
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
  S.jp=h=>h-1;   /* 日本時間 h 點＝遊戲時鐘（臺灣時間）h−1 點（STORY.tzOffset 日本 +1）*/
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
  S.addSched=function(){ if(typeof CHARACTERS==='undefined') return; for(const id in S.SCHED){ const c=CHARACTERS[id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); for(const e of S.SCHED[id].slice().reverse()) if(!L.includes(e)) L.unshift(e); } };
  S.addSched();

  /* ===================== 麵店團的群戲：邀約（不在群組＝阿哲私訊）＋出發提醒＋沒去的照片（照 story3d.js 大二的 v3 清單）===================== */
  S.GROUP=[
    {id:'y3s2_first_meal',ev:'ev_y3s2_first_meal',key:'2028-02-22',inv:[0,17,['大三下第一頓 七點 長桌']],h:19,place:'阿鳳麵店',title:'開學第一頓（大三下）',travel:'走過去約 15 分鐘',travelH:0.25},   /* 2-Y3-26 */
    {id:'y3s2_228',ev:'ev_y3s2_228',key:'2028-02-28',inv:[-1,21,['明天放假 河濱 兩點','小語說要帶風箏']],h:14,place:'公館的河濱',title:'228 河濱',travel:'走過去約 15 分鐘',travelH:0.25} ];   /* 2-Y3-27 */
  S.groupPhone=function(G){ for(const q of S.GROUP){ const d=D(q.key); if(d==null) continue; const di=d+q.inv[0]; if(G.day<di||G.day>d) continue; if(q.when&&!q.when(G)) continue;
      if(now(G)<T(di,q.inv[1])||PHONE.sent(G,q.id+'_ask')) continue;
      const g=grp(G); if(!g&&!knows('zhe',G)) continue; const Z=M(g?NG:'p:zhe','zhe');
      PHONE.at(G,di,G.day===di?Math.max(q.inv[1],hh(G)):q.inv[1],q.inv[2].map(Z),q.id+'_ask');
      if(!outGet(G,q.id)&&(G.day<d||hh(G)<q.h+0.25)) plan(G,{id:q.id,ev:q.ev,day:d,h:q.h,late:0.25,place:q.place,title:q.title,travel:q.travel,travelH:q.travelH}); } };
  /* 2-Y3-26 沒去：21:30 群組（阿哲）*/
  S.firstMealPhoto=G=>{ const d=D('2028-02-22'); if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[{th:NG,from:'zhe',text:'（照片：長桌上六碗麵，以安那碗加了兩顆滷蛋）'}],'y3s2_first_meal_photo'); };
  /* 2-Y3-27 沒去：17:30 群組（小語）*/
  S.r228Photo=G=>{ const d=D('2028-02-28'); if(d!=null&&grp(G)) PHONE.at(G,d,17.5,[{th:NG,from:'yu',text:'（照片：河濱的天空，一個風箏卡在樹上）'},{th:NG,from:'yu',text:'是風的問題！！'}],'y3s2_228_photo'); };

  /* ===================== 2-Y3-28 杜鵑花第三張：12:40 以安在麵店團群組（不在群組、和她 FRIEND 以上＝私訊同兩則）===================== */
  S.azaleaPhone=function(G){ const d=D('2028-03-09'); if(d==null||G.day<d||G.day>d+7||now(G)<T(d,12+40/60)||PHONE.sent(G,'y3_azalea')||!knows('heroine_01',G)) return;
    const g=grp(G); if(!g&&!(stageAt('heroine_01','FRIEND')&&contact(G,'heroine_01'))) return; const A=M(g?NG:'p:heroine_01','heroine_01');
    PHONE.at(G,d,12+40/60,[A('（照片：杜鵑花。和前兩年同一個位置。）'),A('第三張。')],'y3_azalea'); };

  /* ===================== 2-Y3-29 C6 小語的社團經費 ===================== */
  /* 手機版（選「現在說？」）：照小語的訊息習慣拆開（不打句號、連發；AA_326 2-Y3-29），選項一樣 */
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
    if(F.YU_C6_DAY!=null&&now(G)>=T(d23,21+40/60)&&!PHONE.sent(G,'y3_yu_c6_bear')){ const Y=M('p:yu','yu');   /* 結果（AA_117 的結果，新寫成她的訊息）*/
      PHONE.at(G,d23,21+40/60,[Y('找到了！！'),Y('少的三千是場地押金 忘了報 還在'),Y('學弟傳了這個給我'),Y('（貼圖：一隻鞠躬的熊）')],'y3_yu_c6_bear');
      if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('yu','YU_CLUB_BEAR','學弟的熊'); } };

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

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    S.groupPhone(G); S.azaleaPhone(G); S.c6Phone(G); S.k18Phone(G); };
  let busy=false;
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(busy||!G||!G.flags||!law(G)) return false;
    return false; };
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) Object.assign(SOCIAL.MEMORY_LABEL,{AN3_AZALEA:'幫她拍了第三張杜鵑',YU_CLUB_BEAR:'學弟的熊'});   /* 人物面板的記憶名稱（AA_326 寫的那幾個）*/
  return S;
})();
