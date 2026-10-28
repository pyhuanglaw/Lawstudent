/* ===== 臺灣路線逐週補空白的接線：大二上、大三下、大四（AA_342 第 2-1、3-2、4 節；任務 AA342-COVERAGE-1021）=====
   台詞在 src/data/twfill_events.js（TWFILL_LINES、TWFILL_EVENTS，照 AA_342 不改字）。這個檔只接線：
   - STORY.PHONE_RULES：群組（麵店團、家人、公法讀書會）在那一天一開始就排好（PHONE.at），晚兩天以上才讀到的不補（同 y3fill3d.js）；私訊（阿凱、媽媽、柏翰）；
     5/10 家人群組回「回。」＝5/14 18:00 臺北的家（出遊）；4/26 回「去。」＝4/28 10:00 椰林大道（出遊），沒去＝4/28 12:30 群組照片；5/4 畢業紀念冊三選一記 F.YEARBOOK_LINE。
   - STORY.TICKS：在學期間的摘要日（4/12、5/26、11/3、12/8）：那一天 18:30 以後第一個空檔出日期卡＋一行旁白（同 y3fill3d.js）；只出一次（G.flags.TW_SUMS）；那一天過了不補。
   - 服務學習（二）10/7、11/18 那一堂的旁白（CLS.attend 外面包一層，那一堂把 serviceLines 換成這一句；同 fit3d.js 包 CLS.attend 的做法）；11/18 那句接 10/7（看過 10/7 才換）。
   - 海商法期中考 4/11 的旁白：CLS.runExam 外面包一層，考卷前先說。
   - 「臺灣路線」（AA_342 第 3-2、4-1 節）＝那時候人在臺灣（STORY.abroad 不成立）：大三下日本路線、大四上美國路線不出；美國路線大三下、日本路線大四上人在臺灣，照出。
   - 4-2 第 4 週 3/13 法律實習那一句（TWFILL_LINES.practice0313）：CLS.OFFSITE_LINES（classes3d.js 校外上課 S.goOffsite，COURSE-PRACTICE-Y4-1024）。
   存檔：G.flags 的 Y2_SVC_CHESS（10/7 那一堂的日子）、Y3_MOM_DAY（'go'／'no'／'went'）、Y4_GRAD_PHOTO（'go'／'went'／'missed'）、YEARBOOK_LINE（'auntie'／'thursday'／'notyet'）、TW_SUMS（{日期:出了的那一天}）；訊息照 PHONE 的 tag。
   測試：node tests/aa342_twfill_unit.js */
'use strict';
const TWFILL=(function(){
  const S={};
  const L=typeof TWFILL_LINES!=='undefined'?TWFILL_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const atLeast=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!SOCIAL.STAGES) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(min); };
  const member=G=>{ const F=(G&&G.flags)||{}; return !!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group); };   /* 參加公法讀書會的（同 y3fill3d.js）*/
  const tw=G=>!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G));   /* 人在臺灣 */
  const msg=th=>([from,text])=>Object.assign({th,from,text},th==='g:home'&&from==='sister'?{name:'姊姊'}:{});
  const contactOf=(G,id)=>{ if(typeof INV!=='undefined'&&INV.rec){ INV.rec(G); if(G.contacts&&G.contacts[id]==null) G.contacts[id]=G.day; } };   /* 他傳訊息給你＝有你的聯絡方式（同 y2r2_3d.js 的柏翰）*/

  /* ===================== 群組 ===================== */
  const NG='g:noodle_team';
  S.GROUPS=[
    /* 2-1 大二上 */
    {tag:'tw_y2_teachers',day:'2026-09-28',h:21,th:NG,ms:L.teachersY2},
    {tag:'tw_y2_long_weekend',day:'2026-10-08',h:21,th:NG,ms:L.longWeekend},
    /* 3-2 大三下 */
    {tag:'tw_y3_mom_day_ask',day:'2028-05-10',h:21,th:'g:home',ms:[['sister',L.momAsk]],if:tw,
      ask:{until:['2028-05-14',17],opts:[{t:L.momYes,set:{Y3_MOM_DAY:'go'}},{t:L.momNo,set:{Y3_MOM_DAY:'no'},say:[{from:'sister',name:'姊姊',text:L.momNoReply}]}]}},
    {tag:'tw_y3_summer',day:'2028-05-18',h:21,th:NG,ms:L.summerY3,if:tw},
    /* 4-1 大四上 */
    {tag:'tw_y4_teachers',day:'2028-09-28',h:21,th:NG,ms:L.teachersY4,if:tw},
    {tag:'tw_y4_mid_1027',day:'2028-10-27',h:21,th:NG,ms:L.mid1027,if:tw},
    {tag:'tw_y4_mid_1031',day:'2028-10-31',h:22,th:NG,ms:L.mid1031,if:tw},
    {tag:'tw_y4_plg_1101',day:'2028-11-01',h:21,th:'g:public_law',ms:[['heroine_01',L.plg1101]],if:G=>tw(G)&&member(G)},
    /* 4-2 大四下 */
    {tag:'tw_y4s2_last_mid',day:'2029-04-13',h:22,th:NG,ms:L.lastMid},
    {tag:'tw_y4s2_grad_ask',day:'2029-04-26',h:21,th:NG,ms:L.gradAsk,ask:{until:['2029-04-28',9.75],opts:[{t:L.gradGo,set:{Y4_GRAD_PHOTO:'go'}}]}},
    {tag:'tw_y4s2_yearbook',day:'2029-05-04',h:21,th:NG,ms:[['classmate_bohan',L.yearbook]],
      ask:{until:['2029-05-04',24],opts:(L.yearbookOpts||[]).map(([t,k,r])=>Object.assign({t,set:{YEARBOOK_LINE:k}},r?{say:[{from:'classmate_bohan',text:r}]}:{}))}},
    {tag:'tw_y4s2_seats',day:'2029-05-17',h:21,th:NG,ms:L.seatsY4} ];
  const gOf=th=>th.slice(2);
  S.groups=function(G){ for(const g of S.GROUPS){ if(!g.ms||PHONE.sent(G,g.tag)) continue; const d=D(g.day); if(d==null||G.day<d||G.day>d+1||!inGrp(G,gOf(g.th))) continue;
      try{ if(g.if&&!g.if(G)) continue; }catch(e){ continue; }
      const M=g.ms.map(msg(g.th)); if(g.ask){ const u=D(g.ask.until[0]); M[M.length-1].ask={id:g.tag,until:u!=null?T(u,g.ask.until[1]):null,opts:g.ask.opts.map(o=>Object.assign({},o,{set:Object.assign({},o.set)}))}; }
      PHONE.at(G,d,g.h,M,g.tag); } };

  /* ===================== 私訊 ===================== */
  S.DMS=[
    /* 3-2 第 14 週 5/27（六）22:00 阿凱：兩個回覆（不影響 6/11 暑住、7/15 抽籤）*/
    {tag:'tw_y3_kai_dorm',day:'2028-05-27',h:22,who:'kai',ms:[L.kaiDorm],if:G=>tw(G)&&knows('kai'),
      ask:{until:['2028-05-29',22],opts:(L.kaiDormOpts||[]).map(([t,r])=>({t,say:[{from:'kai',text:r}]}))}},
    /* 3-2 第 14 週 5/28（日）端午 12:00 媽媽；5/25 週四家人群組「端午回來嗎 粽子買好了」回了「會回去」＝那個週末回家，不傳（AA_463 第 3 節；S.zongziHome）*/
    {tag:'tw_y3_zongzi',day:'2028-05-28',h:12,who:'mom',name:'媽媽',ms:[L.zongzi],if:G=>tw(G)&&!S.zongziHome(G)},
    /* 4-1 第 11 週 11/17（五）21:00 柏翰（和他有點熟以上；AA_342 沒寫門檻，照 2-2 那則柏翰私訊）*/
    {tag:'tw_y4_bohan_1117',day:'2028-11-17',h:21,who:'classmate_bohan',ms:L.bohan1117,if:G=>tw(G)&&knows('classmate_bohan')&&atLeast('classmate_bohan','FAMILIAR'),contact:true},
    /* 4-2 第 14 週 5/25（五）22:00 阿凱 */
    {tag:'tw_y4s2_kai_move',day:'2029-05-25',h:22,who:'kai',ms:L.kaiMove,if:()=>knows('kai')} ];
  S.dms=function(G){ for(const m of S.DMS){ if(!m.ms||PHONE.sent(G,m.tag)) continue; const d=D(m.day); if(d==null||G.day<d||G.day>d+1) continue;
      try{ if(m.if&&!m.if(G)) continue; }catch(e){ continue; }
      if(m.contact) contactOf(G,m.who);
      const M=m.ms.map(t=>Object.assign({th:'p:'+m.who,from:m.who,text:t},m.name?{name:m.name}:{}));
      if(m.ask){ const u=D(m.ask.until[0]); M[M.length-1].ask={id:m.tag,until:u!=null?T(u,m.ask.until[1]):null,opts:m.ask.opts.map(o=>Object.assign({},o))}; }
      PHONE.at(G,d,m.h,M,m.tag); } };

  /* AA_463 第 2、3 節（home3d.js S.grpPick 問這裡）：
     sisMom：媽媽週四的母親節那一則（day＝那個週四），那一年姊姊 5/10 已經在家人群組問過（tw_y3_mom_day_ask）＝回了「回。」（Y3_MOM_DAY go／went）'yes'、「這週不行。」或還沒回 'no'；不是那一週、沒有那一則＝null
     zongziShip：那個週四之後的端午，媽媽會把粽子寄去宿舍（tw_y3_zongzi 那一年、人在臺灣）
     zongziHome：那個週四（home_ask_<日>，種類 dragon）回了「會回去」＝不寄 */
  S.MOM_DAY='2028-05-14'; S.ZONGZI_DAY='2028-05-28';
  S.sisMom=function(G,day){ const dm=D(S.MOM_DAY); if(dm==null||day==null||dm-day<1||dm-day>7||typeof PHONE==='undefined'||!PHONE.sent(G,'tw_y3_mom_day_ask')) return null;
    const f=G.flags&&G.flags.Y3_MOM_DAY; return f==='go'||f==='went'?'yes':'no'; };
  S.zongziShip=function(G,day){ const dz=D(S.ZONGZI_DAY); return dz!=null&&day!=null&&dz-day>=1&&dz-day<=7&&tw(G); };
  S.zongziHome=function(G){ const dz=D(S.ZONGZI_DAY); if(dz==null) return false; return (G.msgs||[]).some(m=>!!m&&!!m.ask&&m.ask.k==='dragon'&&/^home_ask_/.test(m.ask.id||'')&&m.day<dz&&dz-m.day<=7&&m.ans===0); };

  /* ===================== 出遊 ===================== */
  const plan=(G,q)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,q.id)) return; OUT.plan(G,q); };
  /* 3-2 母親節：5/10 回「回。」＝5/14（日）18:00 臺北的家；「這週不行。」或沒回：沒有後續 */
  S.momDay=function(G){ const F=G.flags, d=D('2028-05-14'); if(d==null||F.Y3_MOM_DAY!=='go'||now(G)>=T(d,18.5)) return;
    plan(G,{id:'tw_y3_mom_day',ev:'ev_y3_mothers_day',day:d,h:18,late:0.5,place:'臺北的家',title:'母親節（臺北的家）',travel:'捷運＋公車 約 40 分鐘',travelH:2/3,back:'回到宿舍。'}); };
  /* 4-2 學士服拍照：4/26 回「去。」＝4/28（六）10:00 椰林大道；沒去（沒回、沒出發、遲到太久）＝12:30 Alison 在群組傳照片 */
  S.gradPhoto=function(G){ const F=G.flags, d=D('2029-04-28'); if(d==null) return;
    if(F.Y4_GRAD_PHOTO==='go'&&now(G)<T(d,10.25)) plan(G,{id:'tw_y4_grad_photo',ev:'ev_y4_grad_photo',day:d,h:10,late:0.25,place:'椰林大道',title:'學士服拍照（椰林大道）',travel:'走過去約 10 分鐘',travelH:1/6});
    if(PHONE.sent(G,'tw_y4s2_grad_ask')&&!done(G,'ev_y4_grad_photo')&&!PHONE.sent(G,'tw_y4s2_grad_miss')&&now(G)>=T(d,12.5)&&G.day<=d+1&&inGrp(G,'noodle_team')){
      PHONE.at(G,d,12.5,(L.gradMiss||[]).map(msg(NG)),'tw_y4s2_grad_miss'); if(F.Y4_GRAD_PHOTO!=='went') F.Y4_GRAD_PHOTO='missed'; } };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.groups,S.dms,S.momDay,S.gradPhoto]){ try{ f(G); }catch(e){ console.warn('TWFILL phone',e); } } };

  /* ===================== 在學期間的摘要日：那一天 18:30 以後第一個空檔，日期卡＋一行旁白（同 y3fill3d.js）===================== */
  S.SUM_H=18.5;
  S.SUMS=[{date:'2028-04-12',line:L.sum0412,if:tw},{date:'2028-05-26',line:L.sum0526,if:tw},{date:'2028-11-03',line:L.sum1103,if:tw},
    {date:'2028-12-08',line:L.sum1208,if:G=>tw(G)&&!member(G)}];   /* 12/8＝沒參加讀書會的（參加的 12/7 有最後一次讀書會）*/
  S.sumDue=function(G){ if(!law(G)) return null; const R=(G.flags&&G.flags.TW_SUMS)||{};
    for(const s of S.SUMS){ const d=D(s.date); if(d==null||G.day!==d||hh(G)<S.SUM_H||R[s.date]!=null||!s.line) continue; try{ if(s.if&&!s.if(G)) continue; }catch(e){ continue; } return s; }
    return null; };
  const WD=['日','一','二','三','四','五','六'];
  S.cardTitle=G=>{ if(typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(G.day), h=hh(G), m=Math.round((h-Math.floor(h))*60); return x.m+'/'+x.d+'（'+WD[x.wd%7]+'）'+String(Math.floor(h)).padStart(2,'0')+':'+String(m).padStart(2,'0'); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['twfill3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.sumShow=async function(GM,s){ const F=GM.G.flags; (F.TW_SUMS||(F.TW_SUMS={}))[s.date]=GM.G.day; if(GM.titleCard) await GM.titleCard(S.cardTitle(GM.G),s.line,3200); return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!G.flags||busy) return false;
    const free=typeof EVENTS!=='undefined'&&!EVENTS.running&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy);
    if(!free) return false;
    const s=S.sumDue(G); if(!s) return false; busy=true; S.sumShow(GM,s).catch(e=>console.warn('TWFILL 摘要日',e)).finally(()=>{ busy=false; }); return true; };
  S.reset=()=>{ busy=false; };   /* 測試用 */

  /* ===================== 上課那一堂的一句 ===================== */
  /* 2-1 服務學習（二）：10/7（第 5 週）、11/18（第 11 週，接 10/7：看過 10/7 那一堂才換）*/
  S.SVC=[{date:'2026-10-07',line:L.svc1007,mark:'Y2_SVC_CHESS'},{date:'2026-11-18',line:L.svc1118,need:'Y2_SVC_CHESS'}];
  S.svcFor=(G,it)=>{ if(!G||!it||!it.c||it.c.id!=='service_2') return null; for(const x of S.SVC){ if(D(x.date)!==G.day||!x.line) continue; if(x.need&&!(G.flags&&G.flags[x.need]!=null)) continue; return x; } return null; };
  /* 4-2 海商法期中考（4/11）：考卷前一句 */
  S.EXAM=[{date:'2029-04-11',course:'maritime',kind:'mid',line:L.maritime0411}];
  S.examLine=(G,it)=>{ if(!G||!it||!it.c) return null; const x=S.EXAM.find(q=>q.course===it.c.id&&q.kind===it.exam&&D(q.date)===G.day); return x?x.line:null; };
  S.install=function(){ if(typeof CLS==='undefined') return false;
    if(CLS.attend&&!CLS.attend._twfill){ const a0=CLS.attend;
      CLS.attend=Object.assign(async function(GM,it){ const G=GM&&GM.G, x=S.svcFor(G,it); if(!x) return a0.apply(this,arguments);
        const c=it.c, had=Object.prototype.hasOwnProperty.call(c,'serviceLines'), keep=c.serviceLines; c.serviceLines=[x.line];
        try{ const r=await a0.apply(this,arguments); if(x.mark&&CLS.rec&&CLS.rec(G).done[it.key]&&G.flags[x.mark]==null) G.flags[x.mark]=G.day; return r; }
        finally{ if(had) c.serviceLines=keep; else delete c.serviceLines; } },a0,{_twfill:true}); }
    if(CLS.runExam&&!CLS.runExam._twfill){ const r0=CLS.runExam;
      CLS.runExam=Object.assign(async function(GM,it){ const l=GM&&GM.G?S.examLine(GM.G,it):null; if(l&&GM.say) await GM.say(null,l); return r0.apply(this,arguments); },r0,{_twfill:true}); }
    return true; };
  S.install();

  /* ===================== 掛勾 ===================== */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.OFFSITE_LINES)) CLS.OFFSITE_LINES.push((G,it)=>it&&it.c&&it.c.id==='legal_practice'&&typeof STORY!=='undefined'&&STORY.dayOfKey&&it.day===STORY.dayOfKey('2029-03-13')&&typeof TWFILL_LINES!=='undefined'?TWFILL_LINES.practice0313:null);   /* 4-2 第 4 週法律實習 */
  return S;
})();
