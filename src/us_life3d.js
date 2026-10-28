/* ===== 美國交換那一學期：玩家每一週能做什麼（AA_340 第 5 節 S1～S12＋第 3、4 節；AA-C 2026-10-20 定稿 90f8faf9；D99 第三優先）=====
   台詞在 src/data/us_life_events.js（US_LIFE_EVENTS，照 AA 原文）。這裡是時間、系統、掛勾；不改 r2y4a3d.js／r2y4a_events.js（AA_327 2-Y4-16～22 的事件包），
   要接它的東西讀它的旗標（US1、US2、US3、US_TRIP_MODE…），ev_us3_lake 開頭／結尾多的兩句（AA_340 G1、G6）是在這裡插進去的（見 patchUS3）。
   「人在美國」＝美國路線、抵達以後、回臺灣以前（S.here）：
   S1  美國的學期日曆：開學 8/21、勞動節 9/4、秋假 10/9～10/13、感恩節 11/23～11/24、最後一堂 12/8、期末週 12/11～12/15、12/16 離開。台灣的節日提示不跳（CLS.dayLabel、todayLine、goalFor）。
   S2  一鍵上課（AA_291 1-1）：週一、三 10:00～11:15 Introduction、週二、四 13:00～14:15 Comparative、週五 09:00～11:50 Legal Writing；2D us_classroom，四句輪流；
       10/26 期中報告、12/8 最後一堂換旁白；出席不影響結果。入口：起床選單（CLS.wakeMenu）、公寓平台「去上課」、社區「搭公車（去學校）」、校園「進教室」。
   S3  快轉（照經濟系休學在家那一套）：床的「快轉」、到下一件有事的時候／過三天／過一週；停在 AA_340 第 1 節的事件、出遊、要回的訊息、交往中週末的 208、特別的課；
       日期卡寫「公寓」；摘要日（G1、G2、G6、AA_291 1-2）跳過時出在日期卡下面，沒跳過的那天到時間出一次。
   S4  學姊的作息（AA_340 4-1）：平日 09～12 法學院圖書館（3D us_lawlib）、週三 14:00～16:50 研討課、平日 18～21 C 棟 208（10 月起週二、四 19～21 會所自習室）、週末 14～21 C 棟 208；
       3D 裡照這份作息出現（us_lawlib、us_shared），「現在大概在」照同一份；SU 階梯從 8/3 起算（4-5）。
       AA_345 I5：SU 階梯多一個地方＝法學院圖書館，平日 11:30～12:00（她收書去吃午餐）演，開頭一句旁白（自習室、湖邊作廢）；圖書館 09:00～11:30 的一般閒聊多三句（交往中）。
   S5  會所（2D）：交誼廳＋自習室；自習室＝讀書；何俊朗平日 19～22 在（AA_291 3-1 招呼）；9/4 烤肉。12/14 晚餐照 r2y4a3d.js。
   S6  超市：買一樣東西＝時間 +20 分鐘、不做錢；「看」的字照 AA_287；換季（G5）。
   S7  台灣的大四上：不選課、不跳開學／期中／期末提示；成績單只有美國三門（2029-01-08「三門通過」）。
   S8  時差：可昕週年視訊（story3d.js）、12/11 讀書會群組（y34b3d.js）、阿凱的評鑑表、台灣朋友回訊息的時間（MSG.replyAt）照台灣時間換算；家人群組週四「這週回來吃飯嗎」在美國不問；
       媽媽每週日一則（AA_291 4-1）；舊金山 12/16～12/21 慢 16 小時（AA_291 4-2）。
   S9  在美國約台灣的朋友：「約」不出現、原因寫「你人在美國。」（不會變成爽約）。
   S10 回程：12/21 23:55 舊金山起飛 → 12/23 05:40 桃園入境大廳（airport_arr）→ 上午回家 → 19:00 409（exchange3d.js）。
   S11 何俊朗 1～5（AA_328 3-12）、自習室的招呼；何俊朗 6 是 r2y4a3d.js 的 12/16 道別。
   S12 湖邊：8/5 以後自由時間也可以去（社區出口旁「去湖邊」，2D）。
   AA_370（AA-A 2026-10-21 修正稿，企劃線 a1dc3e61）：M3 何俊朗只跑這一版（r3_3d.js 的 R3 版停用；MET_LONG 等記憶⇄旗標、舊存檔 R3 版演過的不再演，S.longMerge）；
       M8 亞利桑那（大峽谷 10/7～10/14）慢 15 小時、Q14 期限（S.canyonBack）；M9 學姊的作息扣掉芝加哥（11/11～12）、初雪那晚的小教堂台階（12/2 20:00～21:30）；
       L1 沒見過他＝「同一組的交換生」（上課旁白）；L4 秋假他不在自習室；L9 竹葉亞洲超市 10:00～21:00（AA_370 第 6 節第 2 題：照 AA_291）、週日公休（擋從草原超市過馬路）。
   測試：node tests/us_life_unit.js、node tests/aa370_us_unit.js */
'use strict';
const USL=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof US_LIFE_EVENTS==='undefined') return S;
  const X=US_LIFE_EVENTS.DATA, S5='heroine_05';
  const dk={}; const D=k=>{ if(k in dk) return dk[k]; return dk[k]=STORY.dayOfKey?STORY.dayOfKey(k):null; };
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour, hh=G=>((G.hour%24)+24)%24;
  const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };   /* 0＝週日 */
  const hm=x=>{ x=((x%24)+24)%24; const m=Math.round(x*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const WK=['日','一','二','三','四','五','六'];
  const dateLabel=t=>{ const d=Math.floor(t/24), x=CALENDAR.dateOf(d); return x.m+'/'+x.d+'（'+WK[wdOf(d)]+'）'+hm(t-d*24); };   /* 同 home3d.js 的快轉日期卡 */
  const law=G=>!!G&&(G.stage||'law')==='law';
  const isUS=G=>!!G&&!!G.flags&&law(G)&&!!STORY.route&&STORY.route(G)==='US';
  const dating=US_LIFE_EVENTS.dating, LONG=US_LIFE_EVENTS.LONG;
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);   /* 同 r2y4a3d.js */
  const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
  const run=(id,o)=>{ const e=evOf(id); return e&&typeof EVENTS!=='undefined'?EVENTS.run(e,o):Promise.resolve(); };
  const inUS=G=>typeof EXCH!=='undefined'&&!!EXCH.inUS&&EXCH.inUS(G);
  const P5=t=>({th:'p:'+S5,from:S5,text:t}), PL=t=>({th:'p:npc_long',from:'npc_long',name:'何俊朗',text:t});
  /* 美國這一學期的日子（出發日～回臺灣的前一天）；人在美國＝抵達以後、還沒回來 */
  S.dep=()=>D(STORY.ROUTE_DATES?STORY.ROUTE_DATES.US.dep:'2028-08-02'); S.ret=()=>D(STORY.ROUTE_DATES?STORY.ROUTE_DATES.US.ret:'2028-12-23');
  S.usDay=(G,day)=>isUS(G)&&!!G.flags.US_ARRIVED&&G.flags.US_RETURNED==null&&day!=null&&day>=S.dep()&&day<S.ret();
  S.here=G=>!!G&&S.usDay(G,G.day);
  S.rec=G=>{ if(!G.usLife||typeof G.usLife!=='object') G.usLife={}; const R=G.usLife; for(const k of ['cls','att','sum','greet','asia']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };   /* 存檔欄位（舊存檔沒有＝空的）：上過的課、每門上過幾次、出過的摘要日、何俊朗招呼輪到哪、去過亞洲超市的日子 */
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('USL',e)).finally(()=>{ busy=false; }); return true; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['us_life3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.isBusy=()=>busy;

  /* ======================= S1 美國的學期日曆（AA_340 S1、AA_291 第 1 節）======================= */
  S.CAL={start:'2028-08-21',labor:'2028-09-04',fall:['2028-10-09','2028-10-13'],thanks:['2028-11-23','2028-11-24'],last:'2028-12-08',finals:['2028-12-11','2028-12-15'],orient:['2028-08-14','2028-08-18'],leave:'2028-12-16'};
  const inR=(d,R)=>d!=null&&d>=D(R[0])&&d<=D(R[1]);
  S.holiday=day=>day===D(S.CAL.labor)?'勞動節':(inR(day,S.CAL.fall)?'秋假':(inR(day,S.CAL.thanks)?'感恩節':null));
  S.finals=day=>inR(day,S.CAL.finals);
  S.classDay=day=>{ if(day==null||day<D(S.CAL.start)||day>D(S.CAL.last)) return false; const w=wdOf(day); return w>=1&&w<=5&&!S.holiday(day); };
  const lab0=CLS.dayLabel, line0=CLS.todayLine, goal0=CLS.goalFor;
  CLS.dayLabel=function(G,day){ if(day==null&&G) day=G.day; if(!S.usDay(G,day)) return lab0.apply(this,arguments); const x=CALENDAR.dateOf(day), h=S.holiday(day);
    return x.m+'/'+x.d+' '+CLS.WD[x.wd]+(h?'・'+h:(S.finals(day)?'・期末週':'')); };   /* 美國路線：台灣的節日、學期週次不寫 */
  CLS.todayLine=function(G){ if(!S.here(G)) return line0.apply(this,arguments); const its=S.items(G); if(its.length) return '今天的課：'+its.map(it=>hm(it.t0)+' '+it.c.name).join('、');
    const h=S.holiday(G.day); return h?'今天放假（'+h+'），沒有課':'今天沒有課'; };
  /* HUD 第二行（#nextClass，classes3d.js S.updateHUD 照臺灣課表算）：人在美國照美國課表（BB-B 10-25：第一行「今天的課：09:00 Legal Writing」、第二行卻是「今天沒有課」；v9.10.9 就有）*/
  { const u0=CLS.updateHUD; CLS.updateHUD=function(GM){ const G=GM&&GM.G; if(!G||GM.titleIdle||!S.here(G)) return u0.apply(this,arguments); const el=typeof document!=='undefined'&&document.getElementById?document.getElementById('nextClass'):null; if(!el) return;
      const its=S.items(G), nx=its.find(it=>{ const st=S.status(G,it); return st==='open'||st==='upcoming'; }), s=nx?((S.status(G,nx)==='open'?'現在可以上課：':'下一堂 ')+hm(nx.t0)+' '+nx.c.name):(its.length?'今天的課都結束了':'今天沒有課');
      if(el.dataset.s!==s){ el.dataset.s=s; el.textContent=s; } el.classList.remove('hide'); }; }
  CLS.goalFor=function(G){ if(!S.here(G)) return goal0.apply(this,arguments); const nx=S.items(G).find(it=>{ const s=S.status(G,it); return s==='open'||s==='upcoming'; });
    return {text:CLS.todayLine(G)+(nx?'。上課、讀書或自由活動都可以':''),dest:null}; };

  /* ======================= S2 一鍵上課 ======================= */
  S.COURSES=[{id:'us_intro',name:'Introduction to the U.S. Legal System',days:[1,3],t0:10,t1:11.25},{id:'us_comp',name:'Comparative Constitutional Law',days:[2,4],t0:13,t1:14.25},{id:'us_writing',name:'Legal Writing for International Students',days:[5],t0:9,t1:11+50/60}];
  S.items=(G,day)=>{ const d=day==null?G.day:day; if(!S.usDay(G,d)||!S.classDay(d)) return []; const w=wdOf(d); return S.COURSES.filter(c=>c.days.includes(w)).map(c=>({c,t0:c.t0,t1:c.t1,day:d,key:d+':'+c.id})); };
  /* done 上過了／open 現在去來得及（開始前 1 小時起、下課前 15 分鐘以前）／upcoming／missed */
  S.status=(G,it)=>{ const R=S.rec(G); if(R.cls[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&G.hour>=24)) return 'missed'; if(it.day>G.day) return 'upcoming'; const h=hh(G); if(h>=it.t1-0.25) return 'missed'; return h>=it.t0-1?'open':'upcoming'; };
  S.openItem=G=>S.items(G).find(it=>S.status(G,it)==='open')||null;
  S.classLine=(id,n,G)=>{ const L=X.classLines[id]||[]; const v=L.length?L[((n|0)%L.length+L.length)%L.length]:''; return typeof v==='function'?v(G):v; };   /* 第一次上那門課＝第一句，之後輪流（AA_340 G2）；函式＝照旗標換（AA_370 L1）*/
  S.special=(G,it)=>it.c.id==='us_comp'&&it.day===D('2028-10-26')?'ev_usl_midterm':(it.c.id==='us_writing'&&it.day===D('2028-12-08')?'ev_usl_lastclass':null);
  const SPAWN0={us_outside:{x:-35,z:0,yaw:Math.PI/2},us_apartment:{x:2.4,z:-1,yaw:Math.PI/2},us_campus_class_out:{x:0,z:9.02,yaw:0},us_clubhouse:{x:-28,z:10.6,yaw:Math.PI},us_lawlib:{x:0,z:7.8,yaw:Math.PI},us_shared:{x:0.4,z:4,yaw:-Math.PI/2}};
  const SP=k=>Object.assign({},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN[k])||SPAWN0[k]||{x:0,z:2,yaw:Math.PI});
  S.attend=async function(GM,it){ const G=GM.G, R=S.rec(G); if(!it||R.cls[it.key]) return false; const st=S.status(G,it); if(st!=='open'&&!(st==='upcoming'&&it.day===G.day)) return false;
    const sp=S.special(G,it), n=R.att[it.c.id]|0; GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard(it.c.name,hm(it.t0)+'–'+hm(it.t1),2200);
      const arrive=Math.max(now(G)+(G.zone==='us_campus'?0:1/3),T(it.day,it.t0)); if(arrive>now(G)) GM.advance(arrive-now(G));   /* 公車約 20 分鐘；早到就等到上課 */
      R.cls[it.key]=1; R.att[it.c.id]=n+1;
      if(sp){ await GM.fade(false); await run(sp,{noTitle:true}); }
      else { if(typeof ADV!=='undefined') ADV.begin({background:typeof OUT!=='undefined'?OUT.bg('us_classroom'):'dark'}); await GM.fade(false); if(typeof ADV!=='undefined'&&ADV.log) ADV.log('',it.c.name); GM.caption('',it.c.name,2400); await GM.sleep(700);
        await GM.say(null,S.classLine(it.c.id,n,G)); if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); }
      await GM.fade(true); const end=T(it.day,it.t1); if(now(G)<end) GM.advance(end-now(G));
      await GM.enter('us_campus',SP('us_campus_class_out'),{noFade:true}); await GM.fade(false); }   /* 下課：法學院台階下（US3.SPAWN.us_campus_class_out）*/
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 起床選單（CLS.wakeMenu 在美國換成這一份）：今天的課，「直接去上課」一鍵 */
  S.wakeMenu=async function(GM){ const G=GM.G; if(CLS.wakeMenuOn&&!CLS.wakeMenuOn(GM)) return false; const list=S.items(G).filter(it=>{ const s=S.status(G,it); return s==='open'||s==='upcoming'; }); if(!list.length) return false;
    const it=list[0]; let k=1; GM.sceneBegin();
    try{ await GM.say(null,'早安。今天的課：'+list.map(q=>hm(q.t0)+'　'+q.c.name).join('　／　')); const more=CLS.todayMore?CLS.todayMore(G):[]; if(more.length) await GM.say(null,'今天還有：'+more.join('、'));
      k=await GM.choose([{t:'直接去上課：'+it.c.name,hint:hm(it.t0)+'–'+hm(it.t1)+'，法學院'},{t:'先起床再說'}]); }
    finally{ GM.sceneEnd(); }
    if(k===0) await S.attend(GM,it); return true; };
  { const w0=CLS.wakeMenu; CLS.wakeMenu=function(GM){ if(GM&&S.here(GM.G)) return S.wakeMenu(GM); return w0.apply(this,arguments); }; }
  /* 手機「今天」「課表」：美國的三門課（沒有「直接去上課」的按鈕：入口在起床選單、公寓平台、社區公車、校園教室）*/
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  { const t0=CLS.todayHTML, w0=CLS.weekHTML;
    CLS.todayHTML=function(G){ if(!S.here(G)) return t0.apply(this,arguments); const its=S.items(G), ST={done:'上過了',missed:'沒去',open:'現在可以進教室',upcoming:'還沒開始'};
      let h='<div class="item"><b>'+esc(CLS.dayLabel(G))+'</b><div class="muted">現在 '+hm(hh(G))+'</div></div>'+(CLS.slotHTML?CLS.slotHTML(G):'');
      if(!its.length) h+='<div class="item">'+esc(CLS.todayLine(G))+'</div>';
      for(const it of its) h+='<div class="item"><b>'+hm(it.t0)+'–'+hm(it.t1)+'</b> '+esc(it.c.name)+'<div class="muted">法學院・'+ST[S.status(G,it)]+'</div></div>';
      const h0=hh(G), late=G.hour>=24, nx=its.find(it=>S.status(G,it)==='upcoming'), skips=[]; if(!late&&nx&&nx.t0-1>h0+0.25) skips.push([nx.t0-1,'等到下一堂課前（'+hm(nx.t0-1)+'）']);
      for(const [t,l] of [[12,'等到中午'],[14,'等到下午'],[17.5,'等到傍晚'],[20,'等到晚上']]) if(!late&&t>h0+0.25&&!skips.some(q=>Math.abs(q[0]-t)<0.3)) skips.push([t,l+'（'+hm(t)+'）']);
      if(skips.length) h+='<div class="item"><b>跳過時間</b><div class="row2" style="flex-wrap:wrap;gap:6px;margin-top:6px">'+skips.map(([t,l])=>'<button class="btn" data-skip="'+t.toFixed(3)+'">'+esc(l)+'</button>').join('')+'</div></div>';
      return h; };
    CLS.weekHTML=function(G){ if(!S.here(G)) return w0.apply(this,arguments);
      return '<div class="item"><b>'+esc(CLS.termName('Y4S1'))+'</b></div>'+S.COURSES.map(c=>'<div class="item"><b>'+esc(c.name)+'</b><div class="muted">'+c.days.map(d=>CLS.WD[d]).join('、')+' '+hm(c.t0)+'–'+hm(c.t1)+'・法學院</div></div>').join(''); }; }
  /* 美國不讀台灣的課（自習選科目）：讀書照「這週的筆記」那一套 */
  { const p0=CLS.studyPick; CLS.studyPick=function(GM){ if(GM&&GM.G&&S.here(GM.G)) return Promise.resolve(null); return p0.apply(this,arguments); }; }

  /* ======================= S7 台灣的大四上：不選課、不跳提示；成績單只有美國三門 ======================= */
  S.markTW=G=>{ const R=CLS.rec(G); for(const k of ['sel_Y4S1','exam_Y4S1_mid','exam_Y4S1_final']) R.note[k]=1; R.note.termStart='Y4S1'; };
  { const m0=CLS.morning; CLS.morning=async function(GM){ const G=GM&&GM.G; if(G&&S.here(G)){ S.markTW(G); return; } return m0.apply(this,arguments); }; }
  S.usGrades=G=>isUS(G)&&!!G.flags.US_ARRIVED;
  S.GRADES={us_intro:'通過',us_comp:'通過',us_writing:'通過'};
  { const r0=CLS.reportFor, g0=CLS.showGrades;
    CLS.reportFor=function(G,termId){ if(termId==='Y4S1'&&S.usGrades(G)) return Object.assign({},S.GRADES); return r0.apply(this,arguments); };
    CLS.showGrades=async function(GM,termId,opts){ const G=GM.G; if(!(termId==='Y4S1'&&S.usGrades(G))) return g0.apply(this,arguments); opts=opts||{}; const R=CLS.rec(G); R.grades.Y4S1=Object.assign({},S.GRADES);
      if(!opts.inScene) GM.sceneBegin(); try{ await GM.say(null,CLS.termName('Y4S1')+'的成績出來了。'); await GM.say(null,'三門通過。'); } finally { if(!opts.inScene) GM.sceneEnd(); } return true; }; }   /* AA_291 第 1 節：2029-01-08（一）系統通知「三門通過」*/

  /* ======================= S9 在美國約台灣的朋友 ======================= */
  if(typeof INV!=='undefined'){ const w0=INV.whyNot, c0=INV.canInvite;
    const invitable=(G,id)=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; const L=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.layers)||[]; return !!c&&(L.includes(c.social_layer)||(!!INV.kxGF&&INV.kxGF(G,id))); };
    INV.whyNot=function(G,id){ if(S.here(G)&&invitable(G,id)) return '你人在美國。'; return w0.apply(this,arguments); };   /* AA_340 S9 的婉拒句；按鈕不出現（canInvite）*/
    INV.canInvite=function(G,id){ if(S.here(G)) return false; return c0.apply(this,arguments); }; }

  /* ======================= S8 時差 ======================= */
  /* 舊金山（12/16～12/21，交往中那一週）慢 16 小時（AA_291 4-2）；美東照 story3d.js（−12／11/5 起 −13）*/
  /* 亞利桑那（10/7～10/14，交往中的秋假大峽谷，r2y4b_events.js ev_us_canyon）慢 15 小時（AA_291 4-2、AA_370 M8）：去了才算（US_CANYON，或行事曆的那一趟 done）。
     那幾天不能用手機（整趟是一個出遊，時間直接跳到 10/14 18:00），臺灣傳來的訊息回來才看到、時間照亞利桑那；子晴 Q14 的期限延到回來隔天中午（y34b3d.js S.q14Until 讀 canyonBack）*/
  S.CANYON={from:'2028-10-07',to:'2028-10-14',backH:18,out:'y4_us_canyon'};
  S.canyonGone=G=>{ if(!G||!G.flags||!isUS(G)) return false; if(G.flags.US_CANYON) return true; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,S.CANYON.out):null; return !!q&&q.state==='done'; };
  S.canyonBack=G=>S.canyonGone(G)?T(D(S.CANYON.to),S.CANYON.backH):null;   /* 回到印第安納：10/14 18:00（ev_us_canyon 最後一段）*/
  { const tz0=STORY.tzOffset; STORY.tzOffset=function(G,day){ const d=day==null?(G&&G.day):day; const ab=()=>!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}));
      if(G&&isUS(G)&&G.flags.US_TRIP_MODE==='sf'&&d>=D(S.CAL.leave)&&d<=D(S.CAL.leave)+5&&ab()) return -16;
      if(G&&d!=null&&d>=D(S.CANYON.from)&&d<=D(S.CANYON.to)&&S.canyonGone(G)&&ab()) return -15;
      return tz0.apply(this,arguments); }; }
  /* 台灣的朋友回訊息的時間：照台灣時間算他們醒著、在忙（MSG.replyAt），再換回當地時間。學姊、何俊朗在美國，照當地 */
  if(typeof MSG!=='undefined'&&MSG.replyAt){ const r0=MSG.replyAt; MSG.replyAt=function(G,id){ if(!S.here(G)||id===S5||id==='npc_long') return r0.apply(this,arguments); const tz=STORY.tzOffset(G)||0; if(!tz) return r0.apply(this,arguments);
      const t=now(G)-tz, tw=Object.assign({},G); tw.day=Math.floor(t/24); tw.hour=t-tw.day*24; tw.weekday=wdOf(tw.day); const r=r0.call(this,tw,id); if(!r) return r;
      const lt=T(r.day,r.h)+tz, out=Object.assign({},r); out.day=Math.floor(lt/24); out.h=lt-out.day*24; out.tz=tz; return out;   /* tz：她照臺灣時間（msg3d.js S.herG 換回她那邊挑句子，MSG-ABROAD-SIT-TZ-1022）*/ }; }
  /* 家人群組（週四 20:00「這週回來吃飯嗎」）：人在美國不問（換成媽媽每週日一則，AA_291 4-1）*/
  if(typeof HOME!=='undefined'&&HOME.phoneRules){ const h0=HOME.phoneRules; HOME.phoneRules=function(GM){ if(GM&&S.here(GM.G)) return; return h0.apply(this,arguments); }; }
  /* 阿凱的泡麵評鑑表（每天的手機小事 kai_sheet，21:48）：照台灣時間 */
  { const L=STORY.DAILY_PHONE||[], d=L.find(x=>x.id==='kai_sheet'); if(d&&!d.uslTz){ const h0=d.h; d.h=G=>{ const v=h0(G); return S.here(G)?v+(STORY.tzOffset(G)||0):v; }; d.uslTz=true; } }

  /* ======================= S10 回程（exchange3d.js：12/21 23:55 起飛、airport_arr）——這裡沒有東西 ======================= */

  /* ======================= S4 學姊在美國的作息（AA_340 4-1）======================= */
  /* 回傳 {zone, act} 在 3D 的那一區；{away} 不在 3D（「現在大概在」寫 away）；null＝沒有固定行程 */
  /* AA_370 M9：作息扣掉她不在的兩段——11/11 07:00～11/12 21:45 芝加哥（r2y4a3d.js：巴士 07:00 出發、隔天晚上回程；祐廷沒去她也去）、12/2 20:00～21:30 小教堂前的台階（初雪，等你／挽回中 20:00 自動到場）*/
  S.SIS_AWAY=[{from:['2028-11-11',7],to:['2028-11-12',21.75],away:'芝加哥'},{from:['2028-12-02',20],to:['2028-12-02',21.5],away:'小教堂前的台階'}];
  S.sisAwayAt=t=>{ for(const a of S.SIS_AWAY){ const t0=T(D(a.from[0]),a.from[1]), t1=T(D(a.to[0]),a.to[1]); if(t>=t0&&t<t1) return {away:a.away,to:a.to[1],toDay:D(a.to[0])}; } return null; };
  S.sisAway=G=>S.sisAwayAt(now(G));
  S.lib2f=()=>typeof Z3!=='undefined'&&!!Z3.ZONES&&!!Z3.ZONES.us_lawlib_2f;   /* 法圖 2F 書庫（rooms_glb3d.js us_lawlib_2f，LAWWW2-B 10-24）有沒有 */
  S.sisAt=function(G){ if(!S.here(G)||!(G.day<D(S.CAL.leave))) return null; { const a=S.sisAway(G); if(a) return a.toDay===G.day?{away:a.away,to:a.to}:{away:a.away}; } const w=G.weekday, h=hh(G), oct=G.day>=D('2028-10-01');
    if(w>=1&&w<=5){ if(h>=9&&h<12){ if(S.lib2f()) return h<10.5?{zone:'us_lawlib',act:'read',to:10.5}:{zone:'us_lawlib_2f',act:'read',stand:true,to:12}; return {zone:'us_lawlib',act:'read',to:12}; }   /* AA_399 第 8 節：2F 書庫開了以後 9:00～10:30 一樓、10:30～12:00 二樓（站在書架之間翻判例彙編）*/ if(h>=12&&h<13) return null;   /* 草原超市旁的三明治店：3D 進來以前不出現 */
      if(w===3&&h>=14&&h<16+50/60) return {away:'研討課',to:16+50/60}; if(oct&&(w===2||w===4)&&h>=19&&h<21) return {away:'會所自習室',club:true,to:21}; if(h>=18&&h<21) return {zone:'us_shared',act:'sit',to:21}; return null; }
    return h>=14&&h<21?{zone:'us_shared',act:'sit',to:21}:null; };
  S.sisClub=G=>{ const a=S.sisAt(G); return !!(a&&a.club); };
  /* 手機「人」的「現在大概在」（game3d.js whereText：PLACES.names[zone]＋（看書，到 12:00））：美國的區域用 us3d.js 的區域名字 */
  if(typeof PLACES!=='undefined'&&PLACES.names&&typeof Z3!=='undefined'&&Z3.ZONES) for(const k of ['us_campus','us_lawlib','us_apartment','us_shared','us_outside','us_market','us_asian_market','us_market_street','us_lawlib_2f','us_bed_c']) if(!PLACES.names[k]&&Z3.ZONES[k]&&Z3.ZONES[k].name) PLACES.names[k]=Z3.ZONES[k].name;
  /* 「現在大概在」：法學院圖書館只在玩家人在校園或圖書館時給區域（「帶我去」指得到路：校園有往圖書館的門）；其他地方只寫地名（美國的區域沒有在 guide3d.js 的 LINKS 裡）*/
  { const wh0=STORY.whereIs; STORY.whereIs=function(GM,id){ const G=GM&&GM.G; if(id!==S5||!G||!S.here(G)) return wh0.apply(this,arguments); const a=S.sisAt(G); if(!a) return null; const until=a.to!=null?hm(a.to):null;
      if(a.away) return {zone:null,act:'',away:a.away,until}; if(a.zone==='us_shared') return {zone:null,act:'',away:'C 棟 208',until};
      if(a.zone==='us_lawlib_2f'&&G.zone!=='us_lawlib_2f') return {zone:null,act:'看書',away:'法學院圖書館 2F 書庫',until};   /* 2F 沒有在 guide 的路線裡：不在 2F 只寫地名 */
      const act=a.act==='read'?'看書':'坐著'; if(G.zone===a.zone||G.zone==='us_campus') return {zone:a.zone,room:null,act,until};
      return {zone:null,act,away:(typeof PLACES!=='undefined'&&PLACES.names&&PLACES.names[a.zone])||'法學院圖書館',until}; }; }
  /* 3D：她照作息在法學院圖書館（看書）、C 棟 208（客廳的沙發；9/13 傍晚 US2 在廚房）*/
  const seatOf=(E,zone)=>{ const st=(E&&E.zone&&E.zone.seats)||[]; if(zone==='us_lawlib') return st[3]||st[0]||null; if(zone==='us_shared') return st.find(s=>s.ap&&Math.abs(s.ap[0]+3.8)<0.01)||null;
    if(zone==='us_bed_c'){ const sp=E&&E.zone&&E.zone.spots&&E.zone.spots.sis; return sp?{x:sp.x,z:sp.z,yaw:sp.yaw||0,lv:sp.lv|0}:null; } return null; };   /* 臥室 C（rooms_glb3d.js，LAWWW2-B 10-24）：書桌前 spots.sis */
  /* AA_399 第 8 節：交往中、週末 14～21 她在房間的時候可以敲門，進去以後她坐在書桌前。作息照舊寫「C 棟 208」（us_shared）；玩家進了臥室 C（門開著＝Z3.roomGlbOpen）就在書桌前 */
  S.sisInRoom=(G,a)=>!!(a&&a.zone==='us_shared'&&G.zone==='us_bed_c'&&typeof Z3!=='undefined'&&Z3.roomGlbOpen&&Z3.roomGlbOpen('us_bed_c',G));
  S.sisSync=function(GM){ const G=GM.G, E=GM.E; if(!E||!GM.npc) return; const n=GM.npc[S5], a=S.sisAt(G), want=!!(a&&a.zone&&a.zone===G.zone)||S.sisInRoom(G,a);
    if(n&&n.uslSis&&!want){ const P=E.player&&E.player.obj&&E.player.obj.position, o=n.obj&&n.obj.position, d=P&&o?Math.hypot(P.x-o.x,P.z-o.z):99; if(d>5||(n.uslUntil!=null&&now(G)>n.uslUntil)) GM.removeNPC(S5); else if(n.uslUntil==null) n.uslUntil=now(G)+1/6; return; }
    if(!want||n||!GM.spawnCharacter||(typeof EVENTS!=='undefined'&&EVENTS.running)) return;
    const us2=G.zone==='us_shared'&&G.day===D('2028-09-13')&&hh(G)>=17.9&&hh(G)<19.5;   /* US2：她在廚房煮麵（r2y4a3d.js 的 ev_us2_kitchen）*/
    if(a.stand){ const sp=E.zone&&E.zone.spots&&E.zone.spots.sis; const m=sp?GM.spawnCharacter(S5,sp.x,sp.z,{yaw:sp.yaw||0}):null; if(m) m.uslSis=true; return; }   /* 2F 書庫：站在東邊迴廊的走道口（spots.sis）*/
    const seat=us2?null:seatOf(E,G.zone); const m=seat?GM.spawnCharacter(S5,seat.x,seat.z,{seat,pose:a.act==='read'?'read':'sit'}):GM.spawnCharacter(S5,us2?-3.2:0.4,us2?2.0:3.6,{yaw:us2?Math.PI:-Math.PI/2});
    if(m){ m.uslSis=true; if(seat&&a.act==='read') m.idlePose='read'; } };
  /* SU 閒聊階梯（AA_340 4-5）：美國路線從抵達隔天（8/3）就開始算（8/3～9/3 沒有台灣的學期也用大四上那一份）；L7、L8 的週次照大四上（11/6、11/27 以後）*/
  /* AA_345 I5：SU 那幾層的地點多法學院圖書館（us_lawlib），只在平日 11:30～12:00（ladder.js 是匯入的、不手改：這裡包一層，換成多了地點的副本）*/
  const SU_LIB={weekday:[1,2,3,4,5],time:[11.5,12]}, suCache=new WeakMap();
  const suLib=r=>{ if(!r||!r.L||!Array.isArray(r.L.steps)) return r; let L=suCache.get(r.L);
    if(!L){ L=Object.assign({},r.L,{steps:r.L.steps.map(st=>st&&/^SU-L/.test(st.id||'')&&Array.isArray(st.location)&&!st.location.includes('us_lawlib')?Object.assign({},st,{location:st.location.concat(['us_lawlib','us_lawlib_2f']),locTime:Object.assign({},st.locTime||{},{us_lawlib:SU_LIB,us_lawlib_2f:SU_LIB})}):st)}); suCache.set(r.L,L); }
    return Object.assign({},r,{L}); };
  { const ld0=STORY.ladData; STORY.ladData=function(G,id){ const r=ld0.apply(this,arguments); if(id!==S5||!S.here(G)) return r; if(r) return suLib(r); if(G.day<S.dep()+1) return r;
      const B=typeof LADDER!=='undefined'&&LADDER.byTerm; const L=B&&B.Y4S1&&B.Y4S1[S5]; return L?suLib({L,term:'Y4S1',key:S5+'@Y4S1'}):r; }; }
  /* 圖書館 09:00～11:30（AA_345 I5）：和她說話是圖書館的一般閒聊（SMALLTALK：原本的「……我沒事。只是沒睡。」＋三句，交往中；挽回中只有原本那一句）——
     不走階梯的招呼（原本 ladderTalk 沒有下一層就說 greet 的句子，像「我剛從圖書館回來。」，smallTalk 輪不到）*/
  S.libChat=G=>!!G&&S.here(G)&&(G.zone==='us_lawlib'||G.zone==='us_lawlib_2f')&&G.weekday>=1&&G.weekday<=5&&hh(G)>=9&&hh(G)<11.5;
  { const lt0=STORY.ladderTalk; STORY.ladderTalk=async function(GM,who,id,mode){ const G=GM&&GM.G; if(id===S5&&S.libChat(G)) return false; return lt0.apply(this,arguments); }; }
  /* 在圖書館演 SU 那一層：先一句旁白（她把書收進包包，走到外面才開口）*/
  { const lp0=STORY.ladPlay; STORY.ladPlay=async function(GM,who,id,st){ const G=GM&&GM.G; if(id===S5&&G&&S.here(G)&&(G.zone==='us_lawlib'||G.zone==='us_lawlib_2f')&&st&&/^SU-L/.test(st.id||'')) await GM.say(null,X.suLibOpen); return lp0.apply(this,arguments); }; }

  /* ======================= S5 會所（2D：交誼廳＋自習室）、S11 何俊朗的招呼 ======================= */
  S.clubOpen=G=>{ const h=hh(G); return h>=8&&h<23; };   /* AA_291 第 3 節：每天 08:00～23:00 */
  S.longHere=G=>{ if(!LONG(G)||!S.here(G)) return false; const h=hh(G), w=G.weekday; if(G.day===D('2028-12-09')) return h>=19&&h<22; return w>=1&&w<=5&&h>=19&&h<22&&G.day<D(S.CAL.leave)&&!inR(G.day,S.CAL.thanks)&&!inR(G.day,S.CAL.fall); };   /* 平日 19～22；12/9（六）在（G7）；秋假 10/9～10/13 他在芝加哥找朋友（AA_291 2-1、AA_370 L4）*/
  /* 何俊朗的招呼（AA_291 3-1；一天一句輪流）＋G5、G7、4-1 的變化 */
  S.longGreet=function(G){ const R=S.rec(G), F=G.flags||{}; if(G.day===D('2028-12-09')) return [X.long1209];
    const ok=X.longGreet.filter(q=>(!q.haihao||F.LONG_HAIHAO)&&(!q.thu||G.weekday===4)&&(!q.beforeDST||G.day<D('2028-11-05'))&&(!q.summer||G.day<D('2028-10-09'))
      &&(!q.from||G.day>=D(q.from))&&(!q.to||G.day<=D(q.to)));   /* summer：夏末那一季（10/8 以前；十月中以後室內開暖氣，AA_448 1-2）；from／to：照月份的那幾句（AA_521 第 3 節）*/
    const txt=q=>q.tail&&!F.LONG_HAIHAO&&q.t.endsWith(q.tail)?q.t.slice(0,q.t.length-q.tail.length):q.t;   /* tail：沒有 LONG_HAIHAO 的不說那個尾巴（AA_521 第 3 節）*/
    let g=R.greet; if(g.day!==G.day){ R.greet={day:G.day,n:((g.n|0)+(g.day!=null?1:0)),t:null}; g=R.greet; } if(!g.t) g.t=ok.length?txt(ok[g.n%ok.length]):X.longGreet[0].t;
    const out=[g.t]; if(G.day>=D('2028-11-13')&&G.day<=D('2028-11-21')){ out.push(X.longThanks); if(F.LONG_HAIHAO) out.push(X.longHaihao); }
    if(S.sisClub(G)&&dating(G)) out.push(X.longSisThere); return out; };
  S.club=async function(GM){ const G=GM.G; const R=S.rec(G); let k=1; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:typeof OUT!=='undefined'?OUT.bg('us_club_study'):'dark'}); GM.caption('','會所',2000); await GM.say(null,S.look(G,'us_outside','club'));
      const sp=CLS.slotPlan?CLS.slotPlan(G,1,'study'):{ok:true,hint:''}; k=await GM.choose([{t:'讀書',hint:sp.ok?'自習室。選讀多久（1～3 小時只算一次）。'+sp.hint:sp.why,dim:!sp.ok},{t:'離開'}]);
      if(k===0&&!sp.ok){ GM.toast(sp.why,3000); k=1; }
      if(k===0){ GM.caption('','會所自習室',2000); const sis=S.sisClub(G), gl=S.longHere(G)?S.longGreet(G):[];
        for(const t of gl){ if(t===X.longSisThere&&sis&&dating(G)) await GM.say(null,X.sisStudyDating); await GM.say({name:'何俊朗'},t); }   /* 交往中：她只點頭、把外套拿起來（AA_345 I3），何俊朗才說「你們台灣人讀書都不說話的嗎」*/
        if(sis&&dating(G)&&!gl.includes(X.longSisThere)) await GM.say(null,X.sisStudyDating);
        if(sis&&!dating(G)) await GM.say(null,X.sisStudyRepair);   /* 挽回中：她抬頭看了你一眼 */
        const L=CLS.chooseStudy?await CLS.chooseStudy(GM):{hours:1,uses:[]}; if(L){ await GM.studySession(false,L.hours); if(CLS.slotUse) CLS.slotUse(G,L.uses); if(CLS.queueJump) CLS.queueJump(G); } } }
    finally{ if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    return true; };

  /* ======================= 「看」的文字（AA_287、AA_340 G3／G5／G7、4-4）======================= */
  S.look=(G,zone,id)=>{ const Z=X.aa287[zone]||{}, v=Z[id]; return typeof v==='function'?v(G):(v||null); };
  const DOOR_IDS={us_apartment:(typeof US_APARTMENT_LAYOUT!=='undefined'?US_APARTMENT_LAYOUT.doors:[]),us_shared:(typeof US_SHARED_LAYOUT!=='undefined'?US_SHARED_LAYOUT.doors:[])};
  S.lookFor=function(G,it){ const z=G.zone; if(z==='us_market'||z==='us_asian_market'){ if(z==='us_asian_market'&&it.usMarket==='asia_checkout'&&G.day===D('2028-10-03')&&dating(G)&&G.flags.US_MOONCAKE_TALK&&!G.flags.USL_MOONCAKE){ G.flags.USL_MOONCAKE=true; return X.looks.mooncake; } return S.look(G,z,it.usMarket); }
    if(z==='us_apartment'||z==='us_shared'){ if(it.usShared==='chores'||/冰箱/.test(it.label||'')) return S.look(G,z,'fridge'); if(it.usShared==='stove'||it.label==='看爐子') return S.look(G,z,'range');
      const d=(DOOR_IDS[z]||[]).find(q=>q.closed&&q.label===it.label); if(d&&z==='us_shared'&&d.id==='bedC'&&!dating(G)) return X.looks.bedCOther; return d?S.look(G,z,d.id):null; }   /* AA_399 第 8 節：臥室 C（她的房間），不是交往中＝門上的課表 */
    if(z==='us_outside'&&it.label==='看信箱') return S.look(G,z,'mailboxes'); return null; };

  /* ======================= S12 湖邊（2D；8/5 以後自由時間也可以去）======================= */
  S.lakeOpen=G=>S.here(G)&&G.day>=D('2028-08-05')&&G.day<D(S.CAL.leave);
  /* 「看」（AA_340 4-4＋AA_345 I4）：8～9 月／10 月／11 月～12/1／12/2 以後。
     AA_454 2-1：改照窗景、校園模型的季節（US3.usSeasonKey：秋 10/9、初冬 11/1、雪 12/2）——原本照月份，10/1 起就說樹在變色，窗景 10/9 才換秋天；沒有 US3（只載這一支的測試）照舊照月份 */
  S.LAKE_SEASON={summer:'lakeSummer',autumn:'lakeOct',bare:'lakeNov',snow:'lakeSnow'};
  S.lakeLook=G=>{ const sk=typeof US3!=='undefined'&&US3.usSeasonKey?US3.usSeasonKey(G):null; if(sk&&S.LAKE_SEASON[sk]) return X.looks[S.LAKE_SEASON[sk]];
    const x=CALENDAR.dateOf(G.day); if(G.day>=D('2028-12-02')) return X.looks.lakeSnow; if(x.m===10) return X.looks.lakeOct; if(x.m===11||x.m===12) return X.looks.lakeNov; return X.looks.lakeSummer; };
  S.lake=async function(GM){ const G=GM.G, F=G.flags; const x=CALENDAR.dateOf(G.day); const t=S.lakeLook(G);
    if((x.m===8||x.m===9)&&!dating(G)&&!F.USL_LAKE_SOLO){ GM.sceneBegin(); try{ await GM.fade(true); GM.advance(0.25); await GM.fade(false); await run('ev_usl_lake_solo',{noTitle:true}); await GM.fade(true); GM.advance(0.75); await GM.fade(false); } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; }   /* 挽回中第一次自己去（G1；8～9 月，取代那一次的「看」）*/
    GM.sceneBegin(); try{ await GM.fade(true); GM.advance(0.25); if(typeof ADV!=='undefined') ADV.begin({background:typeof OUT!=='undefined'?OUT.bg('us_lake'):'dark'}); await GM.fade(false); GM.caption('','湖邊',2200); await GM.sleep(900); if(t) await GM.say(null,t);
      if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); await GM.fade(true); GM.advance(0.75); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };

  /* ======================= 互動（包住 STORY.interact）======================= */
  S.c208Open=function(G){ if(!S.here(G)) return true; const d13=D('2028-09-13'), h=hh(G);
    if(G.day===d13&&h>=17.9&&h<19.5&&dating(G)) return true;   /* US2（r2y4a3d.js）*/
    if(!dating(G)||G.day<d13||!(G.flags.US2||G.day>d13)) return false; if(S.sisAway(G)) return false; const w=G.weekday; return (w===6||w===0)&&h>=14&&h<21&&G.day<D(S.CAL.leave); };   /* AA_291 第 3 節：交往中、US2 以後，週六、日 14:00～21:00；她在芝加哥、小教堂台階的時候門關著（AA_370 M9）*/
  /* AA_345 I7：交往中、平日晚上＝「平日晚上她在寫論文」那一句；挽回中（和其他關著的時候）＝「（208 的門關著。）」*/
  S.c208Closed=G=>dating(G)&&G.weekday>=1&&G.weekday<=5&&G.hour>=18?X.looks.c208Eve:X.looks.c208;
  /* AA_444：臥室 C（學姊的房間）的「看」；窗外照日期（12/2 初雪起、11/1、10/1、8/2），去過她臺灣 5F 研究室（G.visited.linze_5f：研究室在 5F，只有她開門才上得去；5F 演的出遊也算）多一句 */
  S.roomCLook=function(G,label){ const R=X.looks.roomC; if(!R) return null; if(label==='她的書桌') return R.desk.slice(); if(label==='書架') return R.shelf.slice();
    if(label==='窗外'){ const K={snow:'2028-12-02',bare:'2028-11-01',autumn:'2028-10-01',summer:'2028-08-02'}, sk=typeof US3!=='undefined'&&US3.usSeasonKey?US3.usSeasonKey():null;   /* 窗外那句跟窗景圖同一個季節（us3d.js usSeasonKey：秋天 10/9 起；BB-B 10-24：10/1～10/8 字黃圖綠）*/
      const w=sk&&K[sk]?R.win.find(q=>q[0]===K[sk]):R.win.find(q=>G.day>=D(q[0])); if(!w) return null; return G.visited&&G.visited.linze_5f?[w[1],R.winLab]:[w[1]]; } return null; };
  S.interact=async function(it,GM){ const G=GM.G; if(!it||!G||!S.here(G)) return false;
    if(it.exit&&it.exit.to==='us_asian_market'&&typeof PLACES!=='undefined'&&PLACES.isOpen&&!PLACES.isOpen('us_asian_market',hh(G),G.day)){ GM.toast(PLACES.closedText('us_asian_market',hh(G),G.day),4500); return true; }   /* AA_370 L9：竹葉亞洲超市照台詞（「亞洲超市九點關。」「週日公休」）09:00～21:00、週日公休（src/data/places.js）；US1 抵達那晚是劇情帶進去的，不經過這裡 */
    if(it.uslClass){ const c=S.openItem(G); if(c){ await S.attend(GM,c); return true; } return false; }
    if(it.uslLake){ await S.lake(GM); return true; }
    if(it.usBus==='campus'){ const c=S.openItem(G); if(c){ let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'直接去上課：'+c.c.name,hint:hm(c.t0)+'–'+hm(c.t1)},{t:it.label||'搭公車（去學校）'}]); } finally { GM.sceneEnd(); } if(k===0){ await S.attend(GM,c); return true; } } return false; }
    if(it.usClass==='law'){ const c=S.openItem(G); if(c){ await S.attend(GM,c); return true; } return false; }
    if(G.zone==='us_lawlib_2f'&&X.looks.lib2f&&X.looks.lib2f[it.label]&&!it.exit){ GM.sceneBegin(); try{ for(const t of X.looks.lib2f[it.label]) await GM.say(null,t); } finally { GM.sceneEnd(); } return true; }   /* AA_444 第 4 節：往三樓的樓梯、木梯（各兩句）*/
    if(G.zone==='us_bed_c'){ const L=S.roomCLook(G,it.label); if(L){ GM.sceneBegin(); try{ for(const t of L) await GM.say(null,t); } finally { GM.sceneEnd(); } return true; } }   /* AA_444 第 2 節：書桌、書架、窗外 */
    if(it.usShared==='door'&&!S.c208Open(G)){ GM.caption('',S.c208Closed(G),4600); return true; }   /* 其他時間門關著（AA_291 第 3 節）；字是旁白（AA_345 I7）*/
    if(it.usClub==='door'){ const d4=D(S.CAL.labor), h=hh(G);
      if(G.day===d4&&h>=17&&h<19&&!done(G,'ev_usl_bbq')){ await run('ev_usl_bbq'); GM.advance(1); return true; }   /* G3 勞動節的烤肉 */
      if(G.day>=d4-3&&(G.day<d4||(G.day===d4&&h<19))){ GM.caption('',X.looks.bbqPoster,4600); return true; }   /* 9/1 起門口的公告 */
      return false; }   /* 12/14 會所晚餐（r2y4a3d.js）在 orig 裡；都不是＝會所選單（下面）*/
    if(it.look){ const t=S.lookFor(G,it); if(t){ if(it.usMarket) return S.shop(GM,t); GM.caption('',t,4600); return true; } }
    return false; };
  /* S6 超市：買一樣東西（時間 +20 分鐘，不做錢；旁白照 AA_287）*/
  S.shop=async function(GM,t){ const G=GM.G; let k=1; GM.sceneBegin(); try{ k=await GM.choose([{t:'買一樣東西',hint:'時間 +20 分鐘'},{t:'只看看'}]); } finally { GM.sceneEnd(); }
    if(k===0){ GM.sceneBegin(); try{ await GM.fade(true); GM.advance(1/3); await GM.fade(false); } finally { GM.sceneEnd(); } } GM.caption('',t,4600); if(k===0&&GM.autosave) GM.autosave(); return true; };
  if(STORY.interact&&!STORY._uslInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; if(await o0.apply(this,arguments)) return true;   /* o0：r2y4a3d.js 的 12/14 會所晚餐、story3d.js 原本的 */
      if(it&&it.usClub==='door'&&GM&&GM.G&&S.here(GM.G)){ if(S.clubOpen(GM.G)){ await S.club(GM); return true; } GM.caption('',S.look(GM.G,'us_outside','club'),4600); return true; } return false; }; STORY._uslInteract=true; }

  /* ======================= 進區域（包住 STORY.populate）：互動點、學姊 ======================= */
  S.populate=function(zoneId,GM){ const G=GM.G, E=GM.E; if(!G||!S.here(G)||!E) return; const IT=E.interactables||(E.interactables=[]);
    if(zoneId==='us_apartment') IT.push({x:0.4,z:4.0,radius:0.8,lv:0,uslClass:true,get label(){ const c=S.openItem(GM.G); return c?'去上課：'+c.c.name:'去上課'; },get hidden(){ return !S.openItem(GM.G); }});   /* 樓梯平台（從外面回來站的地方）*/
    if(zoneId==='us_outside'){ IT.push({x:-38.8,z:3.6,radius:1.2,lv:0,label:'去湖邊',uslLake:true,get hidden(){ return !S.lakeOpen(GM.G); }}); }   /* 社區出口（和「出門（去超市）」相距 3.6 m）*/
    if(zoneId==='us_asian_market'){ const R=S.rec(G); if(!R.asia[G.day]){ R.asia[G.day]=1; G.flags.USL_ASIA_N=Object.keys(R.asia).length; } }   /* 去過亞洲超市幾天（G4 萬聖節：三次以上＝小饅頭餅乾）*/
    try{ S.sisSync(GM); }catch(e){ console.warn('USL sis',e); } };
  if(STORY.populate&&!STORY._uslPopulate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('USL.populate',e); } return r; }; STORY._uslPopulate=true; }

  /* ======================= 床：8/2 晚上時差（04:30 醒來）、隔天有課照美國的第一堂 ======================= */
  { const b0=STORY.bedOptions; STORY.bedOptions=function(G){ const out=b0.apply(this,arguments); if(!S.here(G)||!out) return out; const h=hh(G), night=G.hour>=24||h>=17.5||h<5;
      if(night&&G.day===S.dep()&&!G.flags.USL_JETLAG) return [{kind:'sleep',wake:4.5,t:'睡覺',hint:'04:30'}].concat(out.filter(o=>o.kind==='stay'));   /* G1 8/3 04:30 時差 */
      /* US-JETLAG-BED-0803-1022（AA-B 10-23 07:50）：8/3 凌晨時差醒來以後，第一項多「再睡到早上（09:00）」（同一天，不跳過 8/3）；原本睡到明天早上的那項留著 */
      if(G.day===S.dep()+1&&G.flags.USL_JETLAG&&h<9) return [{kind:'nap',to:9,t:'再睡到早上（09:00）',hint:'09:00（8/3 是安頓的一天）'}].concat(out);   /* 同一天：照白天小睡（CLS.skipTo，跳過時間的停點照停）*/
      const its=night?S.items(G,G.day+1):[]; if(!its.length) return out; const w=Math.max(6.5,its[0].t0-1), k=out.findIndex(o=>o.kind==='sleep'&&/明天沒有課/.test(o.hint||''));
      if(k<0) return out; const why='第一堂 '+hm(its[0].t0)+' '+its[0].c.name+'前一小時';
      const a=(STORY.wakeAlarms?STORY.wakeAlarms(G,G.day+1):[]).find(q=>q.h<w), w1=a?Math.max(6.5,a.h):w;   /* BUG-US-BED-ALARM-1022：換了起床時間要再看一次鬧鐘（story3d.js 的 bedOptions 每一項都看），不然 07:30～第一堂前一小時之間的約會睡過去（可昕週年視訊 10/17 09:00）*/
      const lab=w1>=17?'睡到明天晚上':w1>=13?'睡到明天下午':w1>=11?'睡到明天中午':'睡到明天早上';
      out[k]=Object.assign({},out[k],{wake:w1,alarm:a?a.why:null,t:lab+'（'+hm(w1)+'）',hint:a?hm(w)+'（'+why+'）——但'+a.why+'，鬧鐘 '+hm(w1)+' 會叫醒你':hm(w)+'（'+why+'）'});
      return out.filter((o,i)=>i===k||o.kind!=='sleep'||Math.abs(o.wake-w1)>0.02); }; }

  /* ======================= S3 快轉、摘要日 ======================= */
  S.ffEnd=()=>T(D(S.CAL.leave),7);   /* 12/16 07:00 離開（之後是 r2y4a3d.js 的那一週）*/
  const FIXED=[ ['2028-08-03',4.5,G=>!G.flags.USL_JETLAG],['2028-08-05',17.5,G=>dating(G)],['2028-08-21',9,G=>!(S.rec(G).att.us_intro|0)],['2028-09-04',17,G=>!done(G,'ev_usl_bbq')],
    ['2028-09-13',18,G=>dating(G)],['2028-09-13',18.75,G=>!dating(G)],['2028-10-04',20.5,G=>S.long3Done(G)&&!done(G,'ev_usl_long4')&&!G.flags.LONG_NOTE],['2028-10-16',21,G=>S.oct16On(G)],['2028-10-26',12,()=>true],['2028-10-31',18,G=>!done(G,'ev_usl_halloween')],['2028-10-31',19,G=>done(G,'ev_usl_halloween')&&!done(G,'ev_usl_halloween2')],
    ['2028-11-22',21,()=>true],['2028-11-23',17,G=>!dating(G)&&!!G.flags.MET_LONG],['2028-12-02',18,()=>true],['2028-12-02',19.75,G=>!dating(G)],['2028-12-08',8,()=>true],['2028-12-16',7,()=>true] ];   /* AA_340 第 1 節的事件（出遊、要回的訊息另外停）*/
  /* 10/16 21:00 的停點（BUG-US-WKND-EMPTYSTOP-1025）：原本不看條件都停；改成那個時間真的有事才停——
     ① 學姊「改過的報告拿了 A。」（r2y4a3d.js R2Y4A.us2GradeOn：交往中、US2 是 there 或 missed；挽回中、US2 其他值＝不傳）
     ② 「大四要怎麼過？」再問一次（story3d.js STORY.y4Path2Due：上次選④，10/16 21:00 在公寓演）——原本的停點也讓這一場準時，不能一起拿掉
     沒載 r2y4a3d.js（單元測試）＝照舊停 */
  S.oct16On=function(G){ if(typeof R2Y4A==='undefined'||!R2Y4A.us2GradeOn) return true; if(R2Y4A.us2GradeOn(G)) return true;
    const d=D('2028-10-16'); if(d==null||!STORY.y4Path2Due) return false; return !!STORY.y4Path2Due(Object.assign({},G,{day:d,hour:21,weekday:wdOf(d)})); };
  S.nextStop=function(G,t0){ let best=null; const c=x=>{ if(x!=null&&x>t0+1e-6&&(best==null||x<best)) best=x; };
    for(const [k,h,f] of FIXED){ const d=D(k); if(d!=null&&(!f||f(G))) c(T(d,h)); }
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned') c(T(q.day,q.h)-(OUT.trip?OUT.trip(G,q).travelH:(q.travelH||0))-0.25);
    if(dating(G)&&(G.flags.US2||G.day>D('2028-09-13'))){ const d0=Math.floor(t0/24); for(let d=d0;d<=d0+7;d++){ const w=wdOf(d); if((w===6||w===0)&&d<D(S.CAL.leave)&&d>D('2028-09-13')&&!S.sisAwayAt(T(d,14))&&(typeof US208==='undefined'||!US208.stopAt||US208.stopAt(G,d))) c(T(d,14)); } }   /* 交往中週末的 208（她在芝加哥的週末不停，AA_370 M9）；
       只停在她那天 14:00 會傳私訊的時候（us208_3d.js US208.stopAt：有該演的那一場、這個週末還沒演；BUG-US-WKND-EMPTYSTOP-1025：原本每個週六、日都停，去過了的週日、10/7～8、11/4、七場演完以後停下來什麼都沒有）*/
    return best; };
  S.ffOpts=function(G){ if(!S.here(G)||!inUS(G)) return null; const t0=now(G), end=S.ffEnd(); if(end<=t0+0.5) return null; const nx=S.nextStop(G,t0), to=nx!=null&&nx<end?nx:end, d3=Math.min(T(G.day+3,8.5),end), d7=Math.min(T(G.day+7,8.5),end);
    return [{t:'到下一個有事的日子',hint:(nx!=null&&nx<end?'跳到 ':'沒有排定的事：到 ')+dateLabel(to),to},{t:'過三天',hint:'到 '+dateLabel(d3)+'（中間有事會先停）',to:d3},{t:'過一週',hint:'到 '+dateLabel(d7)+'（中間有事會先停）',to:d7},{t:'不用了',to:null}]; };
  const setTime=(G,E,tt)=>{ const d=Math.floor(tt/24); if(d>G.day){ G.day=d; G.weekday=wdOf(d); G.energy=100; if(G.flags) G.flags.companion=null; G.weather=Math.random()<0.7?'clear':'cloudy'; } G.hour=tt-d*24; if(E) E.hour=G.hour; };
  /* 摘要日：d 那天 h 點（預設 08:00）以後 */
  S.SUM=X.summary.map(s=>Object.assign({},s));
  S.sumLine=(G,s)=>typeof s.t==='function'?s.t(G):s.t;
  S.sumDue=(G,t0,t1)=>S.SUM.filter(s=>{ const d=D(s.d), x=d!=null?T(d,s.h!=null?s.h:8):null; return x!=null&&x>t0+1e-6&&x<=t1+1e-6&&!S.rec(G).sum[s.d]; });
  S.jump=async function(GM,t){ const G=GM.G, E=GM.E; await GM.fade(true); const tS=now(G); let tt=tS, n=0, why=null, mo=null; const P=typeof PHONE!=='undefined'?PHONE:null, p0=P&&P.pending?P.pending(G).length:0;
    { const nx=S.nextStop(G,tt); if(nx!=null&&nx<t) t=nx; }
    while(tt+0.25<=t+1e-6){ tt=Math.round((tt+0.25)*4)/4; setTime(G,E,tt);
      if(Math.abs(tt-Math.round(tt))<1e-6&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); mo=typeof STORY!=='undefined'&&STORY.fundsJoin?STORY.fundsJoin(mo,f):f; } }
      if(P){ try{ STORY.phoneRules(GM); P.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('USL jump phone',e); } }
      const nx=S.nextStop(G,tt); if(nx!=null&&nx<t) t=nx;
      if(P&&P.pending&&P.pending(G).length>p0){ why='msg'; break; } if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)){ why='out'; break; } }   /* 要回的訊息、該出發的出遊：停在那裡 */
    if(!why&&now(G)<t) setTime(G,E,t);
    const cards=S.sumDue(G,tS,now(G)); for(const s of cards) S.rec(G).sum[s.d]=1;
    if(E&&E.setWeather) E.setWeather(G.weather); if(GM.updateHUD) GM.updateHUD();
    if(GM.titleCard){ for(const s of cards) await GM.titleCard(dateLabel(T(D(s.d),s.h!=null?s.h:8)),S.sumLine(G,s),2800); await GM.titleCard(dateLabel(now(G)),'公寓',2200); }
    await GM.fade(false); if(mo&&GM.toast) GM.toast(mo.text,3800); if(n&&GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return why||'end'; };
  if(typeof HOME!=='undefined'){ const fo0=HOME.ffOpts, fm0=HOME.ffMenu;
    HOME.ffOpts=function(G){ if(G&&S.here(G)) return S.ffOpts(G); return fo0.apply(this,arguments); };
    HOME.ffMenu=async function(GM,where){ const G=GM&&GM.G; if(!G||!S.here(G)) return fm0.apply(this,arguments); const O=S.ffOpts(G); if(!O) return false; GM.sceneBegin();
      try{ const o=O[await GM.choose(O.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(!o||o.to==null||o.to<=now(G)) return false; await S.jump(GM,o.to); return true; }
      finally{ GM.sceneEnd(); } }; }

  /* ======================= AA_370 M3：何俊朗 1～5 只跑這一版（r3_3d.js 的 R3 版停用）=======================
     MET_LONG 兩邊互相認：記憶（R3 版記的、人物面板讀的）⇄ 旗標（這一版記的）——MET_LONG、LONG_HAIHAO、LONG_BBQ、LONG_MENU；R3 版 2a 演過＝LONG_2A；R3 版答應的中餐館（LONG_MENU_DAY）＝USL_LONG5。
     舊存檔（v9.10.3 兩版都排了）：R3 版已經演過的那一場，這一版不排（排了沒去＝取消）；R3 版 10/24 的約已經傳了，這一版不再傳；回公寓的筆記、聚餐的旁白看兩邊的旗標（tick）。*/
  const R3_PAIRS=[['ev_long_orientation',['usl_long1']],['ev_long_class',['usl_long2a']],['ev_long_dinner',['usl_long2b']],['ev_long_bbq',['usl_long3']],['ev_long_menu',['usl_long5','usl_long5b']]];
  const LONG_TAGS=['MET_LONG','LONG_HAIHAO','LONG_BBQ','LONG_MENU'];
  const memHas=(id,t)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,t);
  S.r3Did=(G,usl)=>R3_PAIRS.some(([r,u])=>u.includes(usl)&&done(G,r));   /* 這一場 R3 版已經演過 */
  S.long3Done=G=>done(G,'ev_usl_long3')||done(G,'ev_long_bbq');
  S.longMerge=function(G){ const F=G.flags; if(!F) return;
    for(const k of LONG_TAGS){ const m=memHas('npc_long',k); if(m&&!F[k]) F[k]=true; else if(F[k]&&!m&&typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('npc_long',k,''); }
    if(done(G,'ev_long_class')&&!F.LONG_2A) F.LONG_2A=true;
    if(F.USL_LONG5==null&&F.LONG_MENU_DAY) F.USL_LONG5=F.LONG_MENU_DAY==='2028-11-01'?'later':'go';
    if(typeof OUT!=='undefined'&&OUT.get) for(const [r,us] of R3_PAIRS) if(done(G,r)) for(const u of us){ const q=OUT.get(G,u); if(q&&q.state==='planned') q.state='cancelled'; } };

  /* ======================= 手機（STORY.PHONE_RULES；時間都是當地）======================= */
  const past=(G,d,h)=>d!=null&&now(G)>=T(d,h);
  const plan=(G,o)=>typeof OUT!=='undefined'&&!OUT.get(G,o.id)&&OUT.plan(G,Object.assign({travel:'',travelH:0,late:0.75,back:'回到社區。'},o));
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!isUS(G)) return; const F=G.flags, M=X.msgs, dt=dating(G);
    S.longMerge(G);   /* AA_370 M3：美國路線都跑（回臺灣以後的尾聲 r2y4b3d.js 也讀 MET_LONG）*/
    /* G1 8/2 台灣 08:00 Kevin 家族群組（玩家還在機場：臺灣時間；學姊不回，挽回中照發）*/
    { const d=S.dep(); if(d!=null&&G.day>=d&&G.day<=d+1&&past(G,d,8)&&PHONE.inGroup(G,'family_law')&&!PHONE.sent(G,'usl_kevin_0802')) PHONE.at(G,d,8,M.kevin0802.map(t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t})),'usl_kevin_0802'); }
    if(!S.here(G)) return;
    S.markTW(G);
    /* G1 8/3 05:10 學姊（交往中）*/
    { const d=D('2028-08-03'); if(dt&&G.day>=d&&G.day<=d+1&&past(G,d,5+10/60)&&!PHONE.sent(G,'usl_sis_0803')){   /* AA_479 第 1 點（企劃線 02428913b）：回覆期限 8/3 09:00——手續就在當天十點，睡到隔天才回會變成「手續是明天十點」*/ const L=M.sis0803.map(P5); L[L.length-1].ask={id:'usl_sis_0803',until:d*24+9,opts:M.sis0803ask.map(([t,r])=>({t,say:[{from:S5,text:r}]}))}; PHONE.at(G,d,5+10/60,L,'usl_sis_0803'); } }
    /* G1 8/4 10:00 國際學生辦公室（一鍵：出遊）*/
    plan(G,{id:'usl_office',ev:'ev_usl_office',day:D('2028-08-04'),h:10,late:1,place:'國際學生辦公室',title:'國際學生辦公室',alarm:true});
    /* G1 8/5 17:30 學姊「傍晚去湖邊走走。……」→ 18:30 湖邊（交往中）*/
    { const d=D('2028-08-05'); if(dt&&G.day===d&&past(G,d,17.5)&&hh(G)<19.25&&!PHONE.sent(G,'usl_lake_ask')){ PHONE.at(G,d,17.5,[P5(M.sis0805)],'usl_lake_ask'); plan(G,{id:'usl_lake1',ev:'ev_usl_lake1',day:d,h:18.5,late:0.5,place:'湖邊',title:'湖邊',travel:'走路 約 15 分鐘',travelH:0.25}); } }
    /* G1 8/10（四）芷若要地址（2-Y4-11 原句；台灣 21:00＝當地 09:00；和芷若 FAMILIAR 以上、有她的聯絡方式）。九～十二月寄到美國公寓的明信片是 2-Y4-11 本身（還沒做）*/
    { const d=D('2028-08-10'), Z='heroine_02', h=21+(STORY.tzOffset(G,d)||0); if(G.day>=d&&G.day<=d+1&&past(G,d,h)&&!PHONE.sent(G,'usl_zr_0810')&&stageAt(Z,'FAMILIAR')&&(!STORY.knows||STORY.knows(Z,G))&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,Z))){
        PHONE.at(G,d,h,[{th:'p:'+Z,from:Z,text:M.zr0810}],'usl_zr_0810'); F.USL_ZR_ADDR=true; } }
    /* 何俊朗 1（8/14 10:00 國際學生迎新）*/
    if(!S.r3Did(G,'usl_long1')) plan(G,{id:'usl_long1',ev:'ev_usl_long1',day:D('2028-08-14'),h:10,late:1,place:'法學院',title:'國際學生迎新',alarm:true});
    /* G2 8/26 可昕七夕（和可昕交往中；台灣 21:00＝當地 09:00，視訊）*/
    { const d=D('2028-08-26'); if(F.dating_kexin&&G.day<=d) plan(G,{id:'usl_qixi',ev:'ev_usl_qixi',day:d,h:21+(STORY.tzOffset(G,d)||0),late:0.75,place:'視訊',title:'可昕的視訊：七夕',verb:'接起來',no:'今天先不要',back:'視訊結束。'}); }
    /* 何俊朗 2a（9/8 12:00 Legal Writing 下課）、2b（9/15 18:30 新開的餐廳；2a 演過才有）*/
    if(!S.r3Did(G,'usl_long2a')) plan(G,{id:'usl_long2a',ev:'ev_usl_long2a',day:D('2028-09-08'),h:12,late:0.75,place:'法學院走廊',title:'Legal Writing 下課'});
    if(F.LONG_2A&&!S.r3Did(G,'usl_long2b')) plan(G,{id:'usl_long2b',ev:'ev_usl_long2b',day:D('2028-09-15'),h:18.5,late:0.75,place:'新開的餐廳',title:'新開的餐廳'});
    /* 9/16 學姊（交往中）：AA_340 第 1 節第 7 週；時間 AA 沒寫，排 12:10（她回訊息的時段）*/
    { const d=D('2028-09-16'); if(dt&&G.day>=d&&G.day<=d+1&&past(G,d,12+10/60)&&!PHONE.sent(G,'usl_sis_0916')) PHONE.at(G,d,12+10/60,[P5(M.sis0916)],'usl_sis_0916'); }
    /* 何俊朗 3（10/4 20:00 會所自習室；有 MET_LONG）。AA_450 1-11：前一天（10/3）起才排、才跳「排進行程」（原本見過他就排：8/14 迎新演完就提示七週以後的行程）；
       快轉跨過 10/3 的，跳的每一步都跑手機規則、排好以後 nextStop 就停在出發前（S.jump）*/
    if(F.MET_LONG&&!F.LONG_CHI&&G.day>=D('2028-10-03')&&!S.r3Did(G,'usl_long3')) plan(G,{id:'usl_long3',ev:'ev_usl_long3',day:D('2028-10-04'),h:20,late:1,place:'會所',title:'會所自習室'});   /* LONG_CHI：11/11 芝加哥才認識他的（AA_451 1-1），過期的 10/4 不補排 */
    /* 何俊朗 5：10/24 21:00 他約 → 10/25 19:00 中餐館；「明天不行。」＝11/1 同一時間 */
    { const d=D('2028-10-24'); if(F.MET_LONG&&G.day>=d&&G.day<=d+8&&past(G,d,21)&&!PHONE.sent(G,'usl_long_1024')&&!PHONE.sent(G,'r3_long_5')){   /* r3_long_5：舊存檔 R3 版已經約過（AA_370 M3）*/ const L=[PL(M.long1024)]; L[0].ask={id:'usl_long5',until:T(d+1,19),opts:[{t:M.long1024ask[0][0],say:[{from:'npc_long',name:'何俊朗',text:M.long1024ask[0][1]}],set:{USL_LONG5:'go'}},{t:M.long1024ask[1][0],say:[{from:'npc_long',name:'何俊朗',text:M.long1024ask[1][1]}],set:{USL_LONG5:'later'}}]}; PHONE.at(G,d,G.day===d?Math.max(21,G.hour):21,L,'usl_long_1024'); }
      if(F.USL_LONG5==='go'&&!S.r3Did(G,'usl_long5')) plan(G,{id:'usl_long5',ev:'ev_usl_long5',day:d+1,h:19,late:0.75,place:'中餐館',title:'中餐館'});
      if(F.USL_LONG5==='later'&&!S.r3Did(G,'usl_long5b')) plan(G,{id:'usl_long5b',ev:'ev_usl_long5',day:D('2028-11-01'),h:19,late:0.75,place:'中餐館',title:'中餐館'}); }
    /* G4 10/31 20:30 學姊（交往中）*/
    { const d=D('2028-10-31'); if(dt&&G.day>=d&&G.day<=d+1&&past(G,d,20.5)&&!PHONE.sent(G,'usl_sis_1031')) PHONE.at(G,d,20.5,M.sis1031.map(P5),'usl_sis_1031'); }
    /* G5 11/16 21:00 學姊（交往中）*/
    { const d=D('2028-11-16'); if(dt&&G.day>=d&&G.day<=d+1&&past(G,d,21)&&!PHONE.sent(G,'usl_sis_1116')){ const L=M.sis1116.map(P5); L[L.length-1].ask={id:'usl_sis_1116',opts:M.sis1116ask.map(([t,r])=>({t,say:[{from:S5,text:r}]}))}; PHONE.at(G,d,21,L,'usl_sis_1116'); } }
    /* G6 11/23：交往中＝US3「晚上來 C 棟。」→ 17:30 晚餐；19:30 何俊朗私訊（有 MET_LONG）。
       挽回中＋MET_LONG＝17:00 何俊朗私訊「感恩節。兩個沒地方去的人。」「七點，會所。」（AA_345 I6）→ 19:00 會所（原本 11/22 21:00 就排、沒有邀約；早上 US3 回到交往的不約）*/
    { const d=D('2028-11-23'); if(G.day>=d-1&&G.day<=d+1){
        if(F.US3==='two'&&dt) plan(G,{id:'usl_thanks',ev:'ev_usl_thanks',day:d,h:17.5,late:0.75,place:'C 棟 208',title:'感恩節的晚餐'});
        if(dt&&F.MET_LONG&&past(G,d,19.5)&&!PHONE.sent(G,'usl_long_1123')) PHONE.at(G,d,19.5,[PL(M.long1123)],'usl_long_1123');
        if(!dt&&F.MET_LONG&&G.day===d&&past(G,d,17)&&now(G)<T(d,20)&&!PHONE.sent(G,'usl_long_1123r')) PHONE.at(G,d,17,M.long1123r.map(PL),'usl_long_1123r');
        if(!dt&&F.MET_LONG&&PHONE.sent(G,'usl_long_1123r')) plan(G,{id:'usl_thanks_long',ev:'ev_usl_thanks_long',day:d,h:19,late:1,place:'會所',title:'感恩節'}); } }
    /* G7 12/6 21:00 學姊（交往中）*/
    { const d=D('2028-12-06'); if(dt&&G.day>=d&&G.day<=d+1&&past(G,d,21)&&!PHONE.sent(G,'usl_sis_1206')) PHONE.at(G,d,21,M.sis1206.map(P5),'usl_sis_1206'); }
    /* AA_291 4-1：每個星期天 台灣 21:00（＝當地 09:00，11/5 以後 08:00），媽媽一則（8/6 起）。AA_450 1-4：照日期那一則（X.mom 的 d；每一則只發一次，原本四句輪流）*/
    /* 旅行（大峽谷 10/7～10/14、舊金山那一週）字卡一天跳一天、跳過星期天的，回來照原本的時間補（BB 逐日劇本 trx_nolong3：10/8、12/17 沒發）；
       「太舊的不補」改成：第一次跑這條規則（抵達，或舊存檔讀進來）的前一天以前的不補（USL_MOM_FROM）*/
    { const first=D('2028-08-06'); if(F.USL_MOM_FROM==null) F.USL_MOM_FROM=G.day-1;
      for(let d=first; d<=G.day&&d<S.ret(); d+=7){ const tag='usl_mom_'+d; if(PHONE.sent(G,tag)) continue; const h=21+(STORY.tzOffset(G,d)||0); if(!past(G,d,h)) break; if(d<F.USL_MOM_FROM) continue;   /* 讀檔回來：太舊的不補 */
        const m=X.mom.find(x=>D(x.d)===d); if(m) PHONE.at(G,d,h,[{th:'p:mom',from:'mom',name:'媽媽',text:m.t}],tag); } }
  };

  /* ======================= 每 0.5 秒（STORY.TICKS）：回傳 true＝開始演了 ======================= */
  let sisT=0, lastZone=null;
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||busy||!S.here(G)) { if(G) lastZone=G.zone; return false; } const F=G.flags, z=G.zone, prev=lastZone; lastZone=z;
    sisT-=(dt||0.5); if(sisT<=0){ sisT=2; try{ S.sisSync(GM); }catch(e){ console.warn('USL sis',e); } }
    if(!free(GM)) return false; const h=hh(G);
    /* G1 8/3 04:30 時差（公寓醒來，只演一次）*/
    if(G.day===D('2028-08-03')&&z==='us_apartment'&&h>=4.5&&h<9&&!F.USL_JETLAG) return go(()=>run('ev_usl_jetlag',{noTitle:true}));
    /* 何俊朗 4：10/4 當晚回公寓（自動）*/
    if(z==='us_apartment'&&S.long3Done(G)&&!done(G,'ev_usl_long4')&&!done(G,'ev_long_note')&&!F.LONG_NOTE&&(G.day===D('2028-10-04')||(G.day===D('2028-10-05')&&h<12))) return go(()=>run('ev_usl_long4',{noTitle:true}));   /* 舊存檔：R3 版的會所自習室也算、R3 版的筆記寫過就不再寫（AA_370 M3）*/
    /* 10/6 20:00 秋假前的聚餐（人在社區時；不在就隔天早上補一句）*/
    { const d=D('2028-10-06'); if(F.MET_LONG&&!F.USL_PARTY&&!F.LONG_PARTY&&((G.day===d&&h>=20&&z==='us_outside')||(G.day===d+1&&h>=5&&h<12&&inUS(G)))) return go(()=>run('ev_usl_party',{noTitle:true})); }
    /* G4 10/31 18:00～20:00 萬聖節（公寓）*/
    if(G.day===D('2028-10-31')&&z==='us_apartment'&&h>=18&&h<20&&!done(G,'ev_usl_halloween')){ F.USL_HW1_T=now(G); return go(()=>run('ev_usl_halloween')); }
    /* 第二次門鈴（19:00；AA_345 I2）：第一次響過、隔至少 15 分鐘 */
    if(G.day===D('2028-10-31')&&z==='us_apartment'&&h>=19&&h<20&&done(G,'ev_usl_halloween')&&!done(G,'ev_usl_halloween2')&&now(G)>=(F.USL_HW1_T||0)+0.25) return go(()=>run('ev_usl_halloween2'));
    /* G6 挽回中、沒有 MET_LONG：感恩節晚上在公寓 */
    if(G.day===D('2028-11-23')&&z==='us_apartment'&&h>=18&&!dating(G)&&!F.MET_LONG&&!done(G,'ev_usl_thanks_alone')) return go(()=>run('ev_usl_thanks_alone',{noTitle:true}));
    /* 「看」：G7 12/3 走出公寓（樓梯扶手的雪）、G5 11/13～11/23 走進草原超市（南瓜和火雞）*/
    if(z==='us_bed_c'&&F.US_ROOM_C_SEEN==null&&X.looks.roomC){ F.US_ROOM_C_SEEN=G.day; GM.caption('',X.looks.roomC.first,4600); return false; }   /* AA_444 第 1 節：第一次進她的房間（只出一次；舊存檔沒有旗標＝下次進去出一次）*/
    if(prev==='us_apartment'&&z==='us_outside'&&G.day===D('2028-12-03')&&!F.USL_RAIL){ F.USL_RAIL=true; GM.caption('',X.looks.railSnow,4600); return false; }
    if(prev&&prev!=='us_market'&&z==='us_market'&&G.day>=D('2028-11-13')&&G.day<=D('2028-11-23')&&F.USL_FALL!==G.day){ F.USL_FALL=G.day; GM.caption('',X.looks.marketFall,4600); return false; }
    /* 摘要日：沒有跳過的那天，到時間出一次 */
    { const s=S.SUM.find(q=>D(q.d)===G.day&&!S.rec(G).sum[q.d]&&h>=(q.h!=null?q.h:8)); if(s&&inUS(G)){ S.rec(G).sum[s.d]=1; GM.caption('',S.sumLine(G,s),4800); } }
    return false; };

  /* ======================= US3 的湖邊（r2y4a_events.js 的 ev_us3_lake）多兩句：開頭（有 US_LAKE_FIRST）、交往中那一版的最後（「晚上來 C 棟。室友不在。」）======================= */
  S.patchUS3=function(){ const e=evOf('ev_us3_lake'); if(!e||!Array.isArray(e.dialogue)||e.uslPatched) return false; const L=e.dialogue;
    const i0=L.findIndex(l=>l&&l.scene==='湖邊'); L.splice(i0+1,0,{if:{flags:['US_LAKE_FIRST']},speaker:null,text:X.msgs.lakeFirst});
    const i1=L.findIndex(l=>l&&l.set&&l.set.US3==='two'); if(i1>=0) L.splice(i1,0,{speaker:S5,text:X.msgs.us3Tail}); e.uslPatched=true; return true; };
  S.patchUS3();

  /* 鬧鐘：沒有（一鍵的出遊用 OUT 的 alarm）。掛勾 */
  STORY.PHONE_RULES.push(G=>S.phone(G));
  STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  /* AA 稿沒有、所以沒有做的字（回報 AA）：原本的五項 AA_345 第 6 節 I1～I5 都補了（2026-10-21）*/
  S.GAPS=[];
  return S;
})();
