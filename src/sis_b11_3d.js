/* ===== 學姊第十一批：大四下的朋友版——摘要、口試的日子（AA_455，企劃線 2de70709f；D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b11_events.js（照稿不改字）。這個檔：
   - 條件（兩場都一樣，AA_455 第 1、3 節）：法律系、認識她（met_sis）、熟悉以上、沒在和她交往、不是前任（同 sis_b10_3d.js pgEv 那一組）、人在臺灣、有她的聯絡方式；
     和別人交往中也有（她是朋友）。
   - 11-1 摘要：3/20（二）21:00 她私訊兩則（要回；那一天一開始就排好，快轉停在要回的訊息）→「有。」＝出遊「法圖 12:30」（3/21（三）12:30 法圖二樓，alarm）；
     「明天不行。」、沒回＝不排。SIS_ABS_GO（回了什麼）、SIS_ABSTRACT（went／missed）；記憶 SIS_ABSTRACT。
   - 11-2 五月二十九日：4/16～4/27 平日 17:00～17:30 人在校園的總圖門口（大門 15 m 以內，同 sis_b9_3d.js 1-1）就演（S.tick）；
     快轉停一次：4/18 那天排一個「去：總圖」（goto 總圖門口 17:00、沒有車程、不提示「排進行程」）＝OUT.due 16:45，學期中的快轉（semff3d.js）停在那裡問「去／晚一點／不去了」；
     不加 alarm（alarm 會在 16:30 先停）。4/16、4/17 已經遇到＝不排；排了以後遇到＝收掉。
     4/27 以前都沒遇到＝4/27 21:00 她私訊一則（只講資訊，不約）。SIS_DEF_DATE＝congrats／nervous／wait（選項一）、msg（只收到私訊）；記憶 SIS_DEFENSE_DATE。
   - 接 5/29（y34b3d.js 1B-25 M9）：家族群組裡的照舊（Kevin 那一則，M9 自己排）；選了「那天我去門口等。」又不在家族群組的＝5/28 21:00 她私訊一則 →
     排 M9 那一趟「學姊的口試」（同一個 id y4_m9、同一組參數）；沒到 18:30 記 SIS_DEFENSE missed（同 M9；熟悉還不到朋友的，M9 那邊不管）。
   測試：node tests/aa455_sis_unit.js */
'use strict';
const SISB11=(function(){
  const S={}, ID='heroine_05', L=typeof SISB11_LINES!=='undefined'?SISB11_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const contact=G=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,o); };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const wd=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0;
  /* 朋友版（AA_455 第 3 節）*/
  S.ok=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FAMILIAR')&&!abroad(G)&&contact(G);

  /* ---------------- 11-1 3/20 21:00 私訊 → 3/21 12:30 法圖二樓 ---------------- */
  S.ABS={ask:'2029-03-20',day:'2029-03-21'};
  S.ABS_OUT={id:'sisb11_abs',ev:'ev_sis_abstract',h:12.5,late:0.25,place:'法圖・二樓',title:'法圖 12:30',travel:'走路 約 10 分鐘',travelH:1/6,alarm:true};   /* alarm：跳過時間、睡覺都停在出發前（同 sis_y2y3_3d.js）*/
  S.abs=function(G){ const F=G.flags, a=D(S.ABS.ask), d=D(S.ABS.day), tag='sisb11_abs_ask', h=S.ABS_OUT.h; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&F.SIS_ABSTRACT==null&&now(G)<T(d,h)&&S.ok(G)){ const M=(L.absAsk||[]).map(dm);   /* 那一天一開始就排好（21:00 才送到）*/
      M[M.length-1].ask={id:tag,until:T(d,h),opts:(L.absOpts||[]).map(o=>({t:o.t,set:{SIS_ABS_GO:o.k},say:[{from:ID,text:o.r}]}))}; PHONE.at(G,a,21,M,tag); }
    if(F.SIS_ABS_GO===true&&F.SIS_ABSTRACT==null&&now(G)<T(d,h+S.ABS_OUT.late)) plan(G,Object.assign({},S.ABS_OUT,{day:d})); };   /* 「明天不行。」、沒回＝不排 */

  /* ---------------- 11-2 4/16～4/27 平日 17:00～17:30 總圖門口 ---------------- */
  S.DEF={from:'2029-04-16',to:'2029-04-27',stop:'2029-04-18',m9ask:'2029-05-28',door:{x:86.4,z:0,r:15}};
  S.STOP_OUT={id:'sisb11_lib',goto:{zone:'campus',x:80,z:0,yaw:-Math.PI/2},h:17,late:0.25,place:'總圖門口',title:'總圖',verb:'去',travel:'',travelH:0,silent:true};   /* 總圖門口（library3d.js 從總圖出去的位置）；OUT.due＝17:00−0.25＝16:45 */
  const inWin=G=>{ const a=D(S.DEF.from), b=D(S.DEF.to), w=wd(G); return a!=null&&b!=null&&G.day>=a&&G.day<=b&&w>=1&&w<=5; };
  const nearDoor=(G,E)=>{ if(G.zone!=='campus') return false; const p=E&&E.player&&E.player.obj&&E.player.obj.position, d=S.DEF.door; return !!p&&Math.hypot(p.x-d.x,p.z-d.z)<=d.r; };
  S.defOpen=G=>G.flags.SIS_DEF_DATE==null&&!done(G,'ev_sis_defense_date');
  S.defDue=(G,E)=>!!G&&law(G)&&inWin(G)&&hh(G)>=17&&hh(G)<17.5&&S.defOpen(G)&&S.ok(G)&&nearDoor(G,E);
  S.def=function(G){ const F=G.flags, s=D(S.DEF.stop), b=D(S.DEF.to), m=D(S.DEF.m9ask);
    if(s!=null&&G.day===s&&typeof OUT!=='undefined'){ const q=OUT.get(G,S.STOP_OUT.id);
      if(q&&q.state==='planned'&&!S.defOpen(G)) q.state='done';   /* 4/18 自己走去先遇到了：不再問 */
      else if(!q&&S.defOpen(G)&&now(G)<T(s,S.STOP_OUT.h)&&S.ok(G)) plan(G,Object.assign({},S.STOP_OUT,{day:s})); }
    if(b!=null&&m!=null&&G.day>=b&&G.day<m&&now(G)>=T(b,21)&&S.defOpen(G)&&!sent(G,'sisb11_def_dm')&&S.ok(G)){ PHONE.at(G,b,21,[dm(L.defDm)],'sisb11_def_dm'); F.SIS_DEF_DATE='msg'; } };   /* 4/27 21:00（跳過時間的照原本的時間補進去）*/

  /* ---------------- 11-2 接 5/29：5/28 21:00 私訊 → M9 那一趟 ---------------- */
  S.M9_OUT={id:'y4_m9',ev:'ev_sis_defense',h:16,late:2,place:'法律系館A・研究室的走廊',title:'學姊的口試',travel:'',travelH:1/6,hours:1};   /* 同 y34b3d.js S.m9Phone 那一趟（同一個 id：那邊排過就不再排）*/
  S.m9=function(G){ const F=G.flags, a=D(S.DEF.m9ask), d=a==null?null:a+1, tag='sisb11_m9_dm'; if(a==null||G.day<a||G.day>d+1) return;
    if(!sent(G,tag)&&F.SIS_DEF_DATE==='wait'&&F.SIS_DEFENSE==null&&!inGrp(G,'family_law')&&now(G)>=T(a,21)&&now(G)<T(d,16)&&S.ok(G)) PHONE.at(G,a,21,[dm(L.m9Dm)],tag);   /* 在家族群組的：Kevin 那一則照舊（M9）*/
    if(!sent(G,tag)) return;
    if(F.SIS_DEFENSE==null&&now(G)<T(d,17.5)) plan(G,Object.assign({},S.M9_OUT,{day:d}));
    if(F.SIS_DEFENSE==null&&now(G)>=T(d,18.5)) F.SIS_DEFENSE='missed'; };

  /* ---------------- 每 0.5 秒、手機規則 ---------------- */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['sis_b11_3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=f=>{ busy=true; Promise.resolve().then(f).catch(e=>console.warn('SISB11',e)).finally(()=>{ busy=false; }); return true; };
  S.tick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(busy||!G||!G.flags||!S.defDue(G,E)) return false; const ev=evOf('ev_sis_defense_date'); if(!ev||typeof EVENTS==='undefined') return false;
    G.flags.SIS_DEF_DATE='met';   /* 先記下（選項一會換成 congrats／nervous／wait）：演到一半出錯也不會每 0.5 秒重開 */
    const q=typeof OUT!=='undefined'?OUT.get(G,S.STOP_OUT.id):null; if(q&&q.state==='planned') q.state='done';
    return go(()=>EVENTS.run(ev)); };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.abs,S.def,S.m9]){ try{ f(G); }catch(e){ console.warn('SISB11 phone',e); } } };
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM)); }
  return S;
})();
