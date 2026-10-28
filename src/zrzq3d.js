/* ===== 林芷若 × 高子晴：從摯友到戀人（條件式 NPC 感情線）——接線 =====
   台詞：src/data/zrzq_events.js（ZRZQ_LINES，照 AA_232 088556ed、AA_385 028dc128 不改字）；機制：BB_194 §23（a90e8569）；4-4 的甲：AA_243 第 2 節（20d5734f）。
   任務：USER_WANTS C22、AA243-P02、AA290-INTAKE（AA_232 部分）。這個檔大多用掛勾接進去（story3d.js 只有 talkCharacter 問 S.preTalk 那兩行、invites3d.js 只看 partner.soloOk）：
   - STORY.PHONE_RULES（S.sync，每一輪；在家、在日本、快轉也會跑）：建 ZZ、記每學期「她自己條件成立」、F3 的結果、祐廷不在台灣時世界照樣發生（seen:false）、F3 婉拒的訊息；
   - STORY.TICKS（S.tick，每 0.5 秒）：時間到了帶到場自動演（4-2、4-3、4-4、4-2b、4-7）；人在家＝包住 STORY.y4HomeDue／y4FromHome（同 y34b3d.js）先離開家；
   - 4-5（Café 自動）、4-6（找子晴說話）、第三節 Café 那四句：data 的事件，條件問這裡（dailyOk、ukOk、f3ToldDue、f3Away）；
   - 其中一人自己告訴祐廷（AA_385 第 4 節，ZZ_TOLD_YT）：story3d.js talkCharacter 問 S.preTalk——說話前面接演、演完照常閒聊（同 AA_379 2-3）；
   - 尾聲 PG.epiLine：結局 C、芷若選了方奕廷（AA_385 第 2 節）——子晴那一句後面多一句旁白，芷若、奕廷照 zr.fy、fy.zr；
   - 和祐廷的互斥（23-5）：芷若、子晴的 CHARACTERS.partner＝{zz, soloOk}，包住 STORY.partnerOn——她們交往中（dating）時，校外約會（L2／L3）、期末的心意邀約、告白照「她有交往的對象」那一套
     （termend_lines.js 的 NOPE.partner 本來就有芷若、子晴那一句，BB_203 5-1 C5）；吃飯、散步、一盞照常（AA_385 第 6 節：只擋 L2／L3，soloOk）；mutual_interest 以前照常；
   - F3（r2y3b3d.js）婉拒的存檔：包住 R2Y3B.f3CafeDue（不演「……我說好。」）、收回日本路線那則「我說好」；
   - MSG.tok 的「兩人是朋友」「兩人是好朋友」「兩人交往中」（子晴「芷若在英國」那三則；msg3d.js 原本「兩人是朋友」一律 true）：照 ZZ 的狀態（AA_385 第 9 節）；尾聲 PG.EPI_AFTER_CG：結局 B／C 那一行。
   存檔：G.flags.ZZ＝{state, since（建立的那天；舊存檔讀檔那天以前的場次不補演）, ev:{事件 id:{day,seen,…}}, yt（祐廷知道多少：none／hint／mutual／confirmed）,
     sem:{學期:{zr,zq}}（A／B 誰先開口）, fy（方奕廷：declined／went／seeing）, f3（none／dating／mutual／first／friends／yt＝AA_387 第 8 節因為祐廷拒絕）, forceB, held（uk／fy）, version, datingDay, datingTerm, lastDay, month, ending}；
     G.flags.ZZ_STATE（狀態的鏡像，給階梯、事件條件用 flagIs）、ZZ_DATING（交往中＝true，閒聊階梯的 notFlags 用，AA_385 第 3 項）、YT_SAW_ZZ_1、YT_SAW_ZZ_2、YT_HEARD_ZZ、YT_ZZ_FEEL；
     告訴祐廷的那一位記憶 ZZ_TOLD_YT。舊存檔沒有＝第一次跑到時建 {state:'friends'}，不改任何既有欄位。
     ZR_F3_NO（AA_387 第 8 節：她因為祐廷拒絕方奕廷＝F3 那天；S.f3Sync）。
   測試：node tests/zrzq_line_unit.js、node tests/aa385_zz_unit.js、node tests/aa387_zr_last_unit.js（第 8 節）*/
'use strict';
const ZRZQ=(function(){
  const S={}, ZR='heroine_02', ZQ='heroine_04', BOTH=[ZR,ZQ];
  const L=typeof ZRZQ_LINES!=='undefined'?ZRZQ_LINES:null;
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>(((+G.hour||0)%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.CAND=TERMS.slice(1);   /* 三場從大一下開始排（路線 A：最早大一下）*/
  const termDay=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const termAt=d=>typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(d):null;   /* 寒暑假算前一個學期 */
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:null;   /* 1＝週一…7＝週日 */
  const monthKey=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).key.slice(0,7):'m'+Math.floor(d/30);
  const knows=(G,id)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const met=(G,id,lv)=>knows(G,id)&&(!lv||stageAt(id,lv));   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段 */
  const presence=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const inTaipei=(G,id,day)=>{ const p=presence(G,id,day)||{here:true}; return p.here!==false||p.kind==='taipei'; };   /* 子晴畢業以後在臺北上班（kind taipei）也算在 */
  const inUK=(G,day)=>{ const p=presence(G,ZR,day)||{}; return p.here===false&&/英國/.test(p.away||''); };
  const abroad=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));   /* 祐廷交換（日本、美國）人在國外 */
  const route=G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null;
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const romOf=(G,id)=>((G.flags&&G.flags.romance)||{})[id]||null;   /* 只讀（不替沒有紀錄的人建一筆）*/
  const datingYT=(G,id)=>{ const F=G.flags||{}, R=romOf(G,id); return F['dating_'+id]===true||!!(R&&(R.status==='dating'||R.status==='paused')); };   /* paused＝對質後「等你說清楚」，還沒分開 */
  const lt=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);   /* 臺灣時間 → 玩家手機的時間（人在日本 +1）*/
  const evs=G=>{ if(!G.events||typeof G.events!=='object') G.events={done:{},last:{},count:0}; if(!G.events.done) G.events.done={}; if(!G.events.last) G.events.last={}; return G.events; };

  /* ---------- 存檔 ---------- */
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.ZZ;
    if(!R||typeof R!=='object'){ R=F.ZZ={v:1,state:'friends',since:G.day,ev:{},yt:'none',sem:{},fy:null,f3:null,forceB:false,held:null,version:null,month:null,ending:null};
      /* 23-10：F3 已經過了的舊存檔，照當時方奕廷的結果：芷若接受了＝seeing；和祐廷交往中（他傳恭喜）＝null */
      if(F.FANG_F3_DAY!=null&&['direct','bought','self','nocall'].includes(F.FANG_F3)){ R.fy='seeing'; R.f3='old'; R.f3Day=F.FANG_F3_DAY; }
      else if(F.FANG_F3==='congrats'){ R.f3='none'; R.f3Day=F.FANG_F3_DAY; } }
    if(!R.ev||typeof R.ev!=='object') R.ev={}; if(!R.sem||typeof R.sem!=='object') R.sem={}; if(!R.yt) R.yt='none';
    return R; };
  S.state=G=>S.rec(G).state;
  S.dating=G=>!!(G&&G.flags&&G.flags.ZZ&&G.flags.ZZ.state==='dating');
  const LV=['none','hint','mutual','confirmed'];
  S.raise=(R,lv)=>{ if(LV.indexOf(lv)>LV.indexOf(R.yt||'none')) R.yt=lv; };   /* 23-4：祐廷知道多少只會變多 */
  /* 狀態的鏡像：ZZ_STATE（flagIs 用）、ZZ_DATING（交往中＝true；企劃線閒聊階梯的 notFlags 用，AA_385 第 3 項：NO_DATE_ZZ、NO_ZZ_YET、4-1 第 5 句）*/
  const mirror=(G,R)=>{ G.flags.ZZ_STATE=R.state; G.flags.ZZ_DATING=R.state==='dating'; if(R.fy==='seeing') G.flags.ZR_FY=true; };   /* ZR_FY：芷若選了方奕廷（尾聲 postgrad3d.js 的 zr.fy／fy.zr、2029 明信片「另一種筆跡」那一行，AA_345 F3、AA_331）——原本整個遊戲沒有地方設（AA_385 子代理 10-22 回報），照 ZZ.fy='seeing' 記，只會變 true */

  /* ---------- 三場的日子（4-0、23-2）：那學期的第幾週、星期幾、幾點；她們畢業以後（2028-06-03 以後）換地點與時間（4-0 第二張表）----------
     h＝觸發、meet＝事件時間（4-2 九點半離開總圖、21:50 相遇）、end＝時段結束（祐廷在別的事件、約會、睡覺：結束時還在時段內才演，過了就順延到下一個學期的同一天）*/
  S.GRAD='2028-06-03';   /* 她們同一天畢業（G5，大三下第 15 週週六）*/
  S.afterGrad=d=>{ const g=D(S.GRAD); return g!=null&&d>g; };
  const CAFE_FRONT={zone:'wenzhou',x:51.7,z:0,yaw:Math.PI/2}, PARK_GATE={zone:'wenzhou',x:26,z:2.5,yaw:0};   /* 溫州街：Café 門口（面向門）、小公園入口（面向公園）*/
  S.SLOTS={
    home:{key:'home',ev:'ev_zz_home_together',week:3,wd:3,h:21.5,meet:21+50/60,end:24,need:['friends'],at:CAFE_FRONT,
      grad:{h:21.5,meet:21+50/60,end:24,at:CAFE_FRONT}},
    next:{key:'next',ev:'ev_zz_next_time',week:10,wd:4,h:16+40/60,end:18,need:['feelings_emerging'],at:{zone:'gongguan',x:-35.6,z:13.2,yaw:0},
      grad:{h:18,end:20,at:{zone:'gongguan',x:-42,z:18,yaw:Math.PI}}},   /* 畢業以後：公館的書店待到六點（舊路書房門口）*/
    serious:{key:'serious',ev:'ev_zz_serious',week:15,wd:5,h:14.5,end:18,need:['mutual_interest','held'],at:{zone:'campus',x:-34.5,z:-97.2,yaw:Math.PI},
      grad:{h:17.5,end:19.5,at:PARK_GATE}} };   /* 醉月湖南岸步道；畢業以後：溫州街的小公園（傍晚，去麵店買晚餐）*/
  S.ORDER=['home','next','serious'];
  S.nextKey=R=>{ if(R.state==='friends') return 'home'; if(R.state==='feelings_emerging') return 'next'; if(R.state==='mutual_interest'||(R.state==='held'&&R.held==='uk')) return 'serious'; return null; };
  S.slotOf=function(key,term){ const sp=S.SLOTS[key]; if(!sp) return null; const d=termDay(term,sp.week,sp.wd); if(d==null) return null; const g=S.afterGrad(d), t=g?sp.grad:sp;
    return {key,term,day:d,h:t.h,meet:t.meet!=null?t.meet:t.h,end:t.end,at:t.at,grad:g}; };

  /* ---------- 那天的條件（23-2；全部成立才演，演了就推進）---------- */
  /* 這學期和祐廷分手（§22 兩人一起離開、23-1 的凍結；只和其中一人分手＝那一位那學期不推進）*/
  S.frozenTerm=function(G,id,term){ const R=romOf(G,id), days=[];
    for(const h of ((R&&R.history)||[])){ if(!h||h.ev!=='end') continue; let d=typeof h.day==='number'?h.day:null;
      if(d==null&&typeof h.at==='string'){ const m=/^(Y\dS\d)W(\d+)$/.exec(h.at), m2=/^D(-?\d+)$/.exec(h.at); if(m) d=termDay(m[1],+m[2],1); else if(m2) d=+m2[1]; }
      if(d!=null) days.push(d); }
    if(R&&R.status==='friend_after_catch'&&R.restartDay!=null) days.push(R.restartDay-14);   /* 被發現退回朋友（r2y4b3d.js toFriend：restartDay＝那天＋14）*/
    if(G.flags&&G.flags.ZQ_ZR_ENDED_DAY!=null) days.push(+G.flags.ZQ_ZR_ENDED_DAY);   /* §22 攤牌、兩人一起離開那天 */
    return days.some(d=>d<=G.day&&termAt(d)===term); };
  /* 甲（AA_243 第 2 節、23-2 條件 5）：那學期到 4-4 那天為止，和芷若或子晴有過正式校外約會，或她到第 4 階以上＝祐廷正在追她們其中一人 */
  S.pursuing=function(G,term,day){ const t0=termDay(term,1,1);
    const dated=(G.trips||[]).some(t=>t&&t.counted&&BOTH.includes(t.who)&&t.day!=null&&t0!=null&&t.day>=t0&&t.day<=day);
    const st=BOTH.some(id=>knows(G,id)&&typeof DATE!=='undefined'&&!!DATE.stageNum&&DATE.stageNum(id)>=4);
    return dated||st; };
  S.cond=function(G,key,s,why){ const R=S.rec(G), sp=S.SLOTS[key], out=r=>why?{ok:r===true,why:r===true?'':r}:r===true;
    if(!sp.need.includes(R.state)) return out('前一場還沒演（'+R.state+'）');
    if(R.state==='held'&&R.held!=='uk') return out('芷若選了方奕廷');
    if(!BOTH.every(id=>inTaipei(G,id,s.day))) return out('有人不在臺北（芷若在英國、回台中）');
    if(BOTH.some(id=>datingYT(G,id))) return out('有人在和祐廷交往');
    if(R.fy==='seeing') return out('芷若和方奕廷在一起');
    if(BOTH.some(id=>S.frozenTerm(G,id,s.term))) return out('和祐廷分手的那一學期');
    if(key==='serious'&&S.pursuing(G,s.term,s.day)) return out('甲：這學期祐廷在追她們其中一人');
    return out(true); };
  /* 祐廷看不看得到：人在台灣、至少認識其中一人（兩個都不認識＝世界裡照樣發生，他不在場）*/
  S.canSee=(G,s)=>!abroad(G,s.day)&&(knows(G,ZR)||knows(G,ZQ));
  /* 現在該演（或該照樣發生）的那一場：{key, term, day, h, …, mode:'play'|'unseen'} */
  S.due=function(G){ if(!law(G)) return null; const R=S.rec(G), key=S.nextKey(R); if(!key) return null;
    const term=termAt(G.day); if(!S.CAND.includes(term)) return null; const s=S.slotOf(key,term); if(!s||s.day<R.since||s.day>G.day) return null;
    if(R.lastDay!=null&&s.day<=R.lastDay) return null;   /* 同一天不演兩場（4-4「先這樣」以後，下一次是下一個學期）*/
    if(now(G)<T(s.day,s.h)) return null; const see=S.canSee(G,s);
    if(see&&now(G)>=T(s.day,s.end)) return null;   /* 過了時段：順延到下一個學期的同一天 */
    if(!S.cond(G,key,s)) return null;
    return Object.assign({kind:'main',mode:see?'play':'unseen'},s); };

  /* ---------- 4-4 演哪一個版本（23-2）----------
     again：芷若交換回來以後（大三下起）＝ev_zz_serious_again（七-4 的開頭），一律交往；held：她出國前的最後一個學期、最後一個班（Z9 2027-06-03）以後、出發（2027-09-02）以前＝「那就先這樣」；
     A／B：數 4-4 之前「她自己條件成立」的學期（從大一上算），芷若比子晴多＝B（芷若先開口），其他＝A；4-2b 演的是「知道自己在意」那一版＝一律 B */
  S.Z9='2027-06-03'; S.UK_DEP='2027-09-02';
  S.heldTime=d=>{ const a=D(S.Z9), b=D(S.UK_DEP); return a!=null&&b!=null&&d>a&&d<b; };
  S.herOk=(G,id,t,d)=>inTaipei(G,id,d)&&!datingYT(G,id)&&!(id===ZR&&S.rec(G).fy==='seeing')&&!S.frozenTerm(G,id,t);
  S.semSync=function(G){ const R=S.rec(G); for(const t of TERMS){ if(R.sem[t]) continue; const d=termDay(t,15,5); if(d==null) continue; if(now(G)<T(d,14.5)) break; if(d<R.since) continue;
      R.sem[t]={zr:S.herOk(G,ZR,t,d),zq:S.herOk(G,ZQ,t,d)}; } };   /* 每學期第 15 週週五 14:30（4-4 那一刻）記一次；讀檔以前的學期不算（23-10）*/
  S.semCounts=function(G,term){ const R=S.rec(G); let zr=0, zq=0; const i1=TERMS.indexOf(term);
    for(let i=0;i<i1;i++){ const e=R.sem[TERMS[i]]; if(e){ if(e.zr) zr++; if(e.zq) zq++; } }
    return {zr:zr+1,zq:zq+1}; };   /* 這一學期：兩個人的條件都成立才會演，各算一 */
  S.version=function(G,term){ const R=S.rec(G); if(R.forceB) return 'B'; const c=S.semCounts(G,term); return c.zr>c.zq?'B':'A'; };
  S.seriousCtx=function(G,s){ const again=S.CAND.indexOf(s.term)>=S.CAND.indexOf('Y3S2'); return {again,held:!again&&S.heldTime(s.day),v:S.version(G,s.term)}; };
  S.seriousLines=function(G,c){ const Q=L.SERIOUS; let a=[];
    if(c.again){ a=a.concat(Q.AGAIN); a=c.v==='B'?a.concat(Q.B.slice(Q.fromB)):a.concat(Q.AGAIN_A,Q.A.slice(Q.fromA)); }
    else if(c.held) a=a.concat(c.v==='B'?Q.B.slice(0,Q.cutB):Q.A.slice(0,Q.cutA),Q.HELD);
    else a=a.concat(c.v==='B'?Q.B:Q.A);
    return a.concat(Q.END); };
  /* 他對其中一人有感情（曾經和她交往，或她到第 4 階以上）：4-4 結尾多一個內心選擇（七；23-4），只記 YT_ZZ_FEEL，不影響她們 */
  S.feelOk=G=>BOTH.some(id=>{ const R=romOf(G,id); return !!(G.flags&&G.flags['EX_'+id])||!!(R&&(R.history||[]).some(h=>h&&h.ev==='start'))||(knows(G,id)&&typeof DATE!=='undefined'&&!!DATE.stageNum&&DATE.stageNum(id)>=4); });

  /* ---------- 推進 ---------- */
  S.resolve=function(G,key,s,seen,ctx){ const R=S.rec(G), F=G.flags, sp=S.SLOTS[key]; ctx=ctx||{}; const id=key==='serious'&&ctx.again?'ev_zz_serious_again':sp.ev, E=evs(G);
    if(!seen){ E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; }   /* 祐廷沒看到（人在國外、兩個都不認識）：世界裡照樣發生（23-2），閒聊階梯的 notEvents 也照這個 */
    R.ev[id]={day:s.day,seen:!!seen,term:s.term}; R.lastDay=s.day;
    if(key==='home'){ R.state='feelings_emerging'; if(seen){ F.YT_SAW_ZZ_1=true; S.raise(R,'hint'); } }
    else if(key==='next'){ R.state='mutual_interest'; if(seen){ F.YT_SAW_ZZ_2=true; S.raise(R,'hint'); } }
    else { R.version=ctx.v||null; R.ev[id].v=ctx.v||null;
      if(ctx.held){ R.state='held'; R.held='uk'; R.ev[id].held=true; if(seen) R.heldSeen=true; }
      else { R.state='dating'; R.datingDay=s.day; R.datingTerm=s.term; }
      if(seen){ F.YT_HEARD_ZZ=true; S.raise(R,'mutual'); } }
    mirror(G,R); };

  /* ---------- 4-2b：方奕廷 F3 那一晚（23-6）----------
     F3（r2y3b3d.js f3Go 記 FANG_F3_DAY：5/29，或延到 6/19）那時的狀態決定芷若的回答（ZZ.fy）和 4-2b 演哪一種：
     dating＝婉拒、情侶版；mutual_interest／held（先這樣）＝婉拒、跟子晴說了、「知道自己在意」版、之後 4-4 一律 B；feelings_emerging 兩人都單身＝接受、去看了、「第一次在意」版、之後選方奕廷（seeing、held）；
     friends、其中一人和祐廷交往中或在分手的那學期＝照原本的方奕廷路線（她接受＝seeing），不演。
     AA_387 第 8 節（企劃線 608b9adc）：原本會接受（went、seeing）的，F3 那天先看她心裡是不是祐廷（S.ytHeart）——是＝她拒絕方奕廷（fy declined、f3 'yt'、記 ZR_F3_NO＝F3 那天；
     不記 ZR_FY、不演 4-2b）；方奕廷那通電話照演（r2y3b3d.js f3Go 照舊排）；之後在 Café 她說的是拒絕版（r2y3b_events.js ev_zhiruo_f3_cafe）。
     和子晴交往中（dating）、曖昧（mutual_interest／held uk）的照上面原本的婉拒；只在 F3 新發生的那一刻判斷，舊存檔已經過了的 F3 不改（R.f3Day 已經是那一天）*/
  /* AA_387 第 1 節第 2 點：她的心意條件＝學期末心意邀約那一套（TERMEND.cond：C1 戀愛 30、C2 正式約會 4 次含心願地點、C4～C6、C10）＋C8（ROM.canStart）；C7（國外）不看——她 9/2 才走。
     C9（另一位先和祐廷重新交往）程式裡沒有這一項（TERMEND.heartWhy 也沒有），照現在。最後一場的條件（src/zr_last3d.js）也用這一個 */
  S.heartOk=function(G){ if(!G||!G.flags||typeof TERMEND==='undefined'||!TERMEND.cond) return false; const c=TERMEND.cond(G,ZR); if(!c||!c.ok) return false;
    return !(typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,ZR)); };
  /* 第 8 節的三條：杯子那一場沒有演過（ZR_CUP 沒有值）、沒和祐廷交往、上面的心意條件 ok */
  S.ytHeart=G=>!!G&&!!G.flags&&G.flags.ZR_CUP==null&&!datingYT(G,ZR)&&route(G)!=='US'&&!(typeof ROM!=='undefined'&&ROM.partners&&ROM.partners(G).length)&&S.heartOk(G);   /* AA_387 第 8 節第 4 條（第 10 節 A5）：美國路線、祐廷有交往對象＝F3 照現在 */
  S.f3Sync=function(G){ const F=G.flags, R=S.rec(G); if(F.FANG_F3_DAY==null||R.f3Day===F.FANG_F3_DAY) return; R.f3Day=F.FANG_F3_DAY;
    if(F.FANG_F3==='congrats'){ R.f3='none'; return; }   /* 和祐廷交往中：F3 不發生 */
    const st=R.state, t=termAt(F.FANG_F3_DAY), clear=!BOTH.some(id=>datingYT(G,id))&&!BOTH.some(id=>S.frozenTerm(G,id,t));
    if(st==='dating'){ R.fy='declined'; R.f3='dating'; }
    else if(clear&&(st==='mutual_interest'||(st==='held'&&R.held==='uk'))){ R.fy='declined'; R.f3='mutual'; R.forceB=true; }
    else if(S.ytHeart(G)){ R.fy='declined'; R.f3='yt'; F.ZR_F3_NO=F.FANG_F3_DAY; }   /* AA_387 第 8 節：她心裡是祐廷＝拒絕方奕廷 */
    else if(clear&&st==='feelings_emerging'){ R.fy='went'; R.f3='first'; }
    else { R.fy='seeing'; R.f3='friends'; } };
  /* 看電影那天＝F3 之後的第一個週三：5/31 萬才館門口（吉他社練完，21:00）；F3 延到 6/19＝6/21（三）21:30 溫州街的小公園（她們已經畢業）*/
  S.mindSlot=function(G){ const F=G.flags||{}, R=S.rec(G); if(F.FANG_F3_DAY==null||!['dating','mutual','first'].includes(R.f3)) return null;
    let d=null; for(let k=1;k<=7;k++) if(wdOf(F.FANG_F3_DAY+k)===3){ d=F.FANG_F3_DAY+k; break; } if(d==null) return null;
    const park=S.afterGrad(d); return {kind:'mind',day:d,h:park?21.5:21,meet:park?21.5:21,end:24,park,ver:R.f3,at:park?PARK_GATE:{zone:'campus',x:93.8,z:-98.4,yaw:0}}; };
  S.mindDue=function(G){ const R=S.rec(G); if(R.ev.ev_zz_zq_mind) return null; const s=S.mindSlot(G); if(!s||now(G)<T(s.day,s.h)) return null;
    const see=!abroad(G,s.day)&&knows(G,ZQ)&&inTaipei(G,ZQ,s.day);   /* 祐廷不在台灣就不演 */
    if(!see||now(G)>=T(s.day,s.end)) return Object.assign({mode:'skip'},s);   /* 4-2b 只在那一晚：沒演到就沒有 */
    return Object.assign({mode:'play'},s); };
  S.mindLines=function(G,s){ const M=L.MIND, a=M[s.ver==='dating'?'dating':(s.ver==='mutual'?'mutual':'first')]; return s.park?a.map(([w,t])=>[w,M.park[t]||t]):a; };
  S.mindSync=function(G){ const R=S.rec(G), m=S.mindDue(G); if(m&&m.mode==='skip') R.ev.ev_zz_zq_mind={day:m.day,seen:false,v:m.ver,park:!!m.park};
    if(R.fy==='went'){ const s=S.mindSlot(G); if(s&&G.day>s.day){ R.fy='seeing'; R.state='held'; R.held='fy'; mirror(G,R); } } };   /* 看完電影以後：芷若選方奕廷（結局 C）*/
  /* 第三節：婉拒（已經和子晴在交往）——Café 那四句（ev_zz_f3_told）；方奕廷之後傳給祐廷三則。
     日本路線（F3 那天祐廷在日本，f3Away）＝AA_385 第 7 項改當面：同 AA_296 ⑤（r2y3b3d.js S.F3_JP）——8/5 回國以後、9/1 以前第一次在 Café 找她說話，第一句前面加「你不在的時候，」；
     那段時間都沒找她＝就沒有這一段（不補訊息）。原本第七節第 6 點的訊息版（zz_f3_jp）拿掉；舊存檔已經收到那四則的＝她已經說了，不再當面說 */
  S.F3_JP={from:'2028-08-05',to:'2028-09-01'};   /* r2y3b3d.js 沒有 S.F3_JP 時的備用（同一組日子）*/
  S.f3Away=G=>{ const F=G.flags||{}; return route(G)==='JP'&&F.FANG_F3_DAY!=null&&abroad(G,F.FANG_F3_DAY); };
  S.f3ToldDue=G=>{ const F=G.flags||{}, R=F.ZZ; if(!(law(G)&&!!R&&R.fy==='declined'&&R.f3==='dating'&&F.FANG_F3_DAY!=null&&G.day>=F.FANG_F3_DAY&&!abroad(G))) return false;
    if((G.msgs||[]).some(m=>m&&m.tag==='zz_f3_jp')) return false; if(!S.f3Away(G)) return true;
    const W=(typeof R2Y3B!=='undefined'&&R2Y3B.F3_JP)||S.F3_JP, a=D(W.from), b=D(W.to); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.f3Told=G=>{ const R=S.rec(G); S.raise(R,'confirmed'); S.coupleMem(G); };   /* 她自己說了「我跟子晴在一起」＝祐廷知道（23-4）*/
  S.cutMsg=function(G,tag){ if(typeof PHONE==='undefined'||!PHONE.rec) return false; if((G.msgs||[]).some(m=>m&&m.tag===tag)) return false;   /* 已經送到的不收回 */
    const P=PHONE.rec(G); let n=0; for(let i=P.q.length-1;i>=0;i--) if(P.q[i]&&P.q[i].tag===tag){ P.q.splice(i,1); n++; }
    if(!Array.isArray(P.cut)) P.cut=[]; if(!P.cut.includes(tag)) P.cut.push(tag); return n>0; };
  S.f3MsgSync=function(G){ const F=G.flags, R=S.rec(G); if(R.fy!=='declined'||F.FANG_F3_DAY==null||typeof PHONE==='undefined') return; const d=F.FANG_F3_DAY;
    S.cutMsg(G,'y3_zr_f3_jp');   /* r2y3b3d.js f3Go 日本路線那則「……我說好。」：婉拒的存檔不傳 */
    S.cutMsg(G,'zz_f3_jp');   /* AA_385 第 7 項：日本路線改回國以後當面說（上面 f3ToldDue）；舊存檔排著還沒收到的那四則收回（已經收到的不收回）*/
    if(R.f3==='dating'&&met(G,'npc_fangyt','FAMILIAR')){ const fang=day=>PHONE.at(G,day,Math.max(21,day===G.day?(+G.hour||0)%24+1/12:0),L.F3_FANG.map(t=>({th:'p:npc_fangyt',from:'npc_fangyt',text:t})),'zz_f3_fang');
      if(!S.f3Away(G)) fang(d+1);   /* 臺灣：F3 隔天 21:00 */
      else { const td=evs(G).last.ev_zz_f3_told; if(td!=null) fang(td); } }   /* 日本路線（AA_385 第 10 節，企劃線 946b1b72）：芷若在 Café 當面說完的那天 21:00 才送；當面那場沒演到（9/1 以前）＝不送（祐廷沒聽她說過，「她跟我說了」接不上）*/
    if(R.yt!=='confirmed'&&(G.msgs||[]).some(m=>m&&m.tag==='zz_f3_jp')){ S.raise(R,'confirmed'); S.coupleMem(G); } };   /* 舊存檔已經收到那四則＝她說了，祐廷知道 */

  /* ---------- 4-7 祐廷得知（只在她們真的交往以後；23-3）----------
     4-4 之後的下一個學期第 2 週週五 14:30（入場同 4-4 的表）；4-4 在大三下 6/2（畢業前一天）＝6/3 畢業典禮（總圖前面）；祐廷不在台灣＝他回來以後的第一個週五；
     那天沒演到（不在、睡著、她們不在臺北、祐廷不認識她們兩個）＝下一個學期的第 2 週週五；她們畢業以後改在溫州街（4-0 第二張表的 4-4）*/
  S.returnDay=G=>{ const r=route(G), RD=typeof STORY!=='undefined'&&STORY.ROUTE_DATES?STORY.ROUTE_DATES[r]:null; return RD?D(RD.ret):null; };
  S.learnCands=function(G){ const R=S.rec(G); if(R.state!=='dating'||R.datingDay==null) return []; const out=[], g=D(S.GRAD), ti=TERMS.indexOf(R.datingTerm);
    let primary=null, from=ti+2;
    if(g!=null&&R.datingDay===g-1){ primary={day:g,h:14.5,end:18,special:'gradDay'}; from=ti+1; }
    else if(ti>=0&&ti+1<TERMS.length){ const d=termDay(TERMS[ti+1],2,5); if(d!=null) primary={day:d,h:14.5,end:18}; }
    if(primary){ out.push(primary); if(abroad(G,primary.day)){ const r=S.returnDay(G); if(r!=null){ let d=r; while(wdOf(d)!==5) d++; out.push({day:d,h:14.5,end:18,afterReturn:true}); } } }
    for(let i=Math.max(from,0);i<TERMS.length;i++){ const d=termDay(TERMS[i],2,5); if(d!=null) out.push({day:d,h:14.5,end:18}); }
    return out.map(c=>{ const gr=!c.special&&S.afterGrad(c.day); return Object.assign({kind:'learn',meet:gr?17.5:c.h},c,gr?{h:17.5,end:19.5,grad:true,meet:17.5}:{},{at:c.special?{zone:'campus',x:80,z:0,yaw:-Math.PI/2}:(gr?PARK_GATE:S.SLOTS.serious.at)}); }); };
  S.learnDue=function(G){ const R=S.rec(G); if(R.state!=='dating'||R.ev.ev_zz_yt_learns||R.yt==='confirmed') return null; if(abroad(G)||!BOTH.every(id=>knows(G,id))) return null;
    const c=S.learnCands(G).find(x=>x.day===G.day&&now(G)>=T(x.day,x.h)&&now(G)<T(x.day,x.end)); if(!c||!BOTH.every(id=>inTaipei(G,id,c.day))) return null;
    return Object.assign({mode:'play'},c); };
  S.coupleMem=function(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.remember) return; if(!SOCIAL.has||!SOCIAL.has(ZR,'ZR_WITH_ZQ')) SOCIAL.remember(ZR,'ZR_WITH_ZQ',''); if(!SOCIAL.has||!SOCIAL.has(ZQ,'ZQ_WITH_ZR')) SOCIAL.remember(ZQ,'ZQ_WITH_ZR',''); };   /* 人物頁：她們的關係（knows）*/

  /* ---------- 其中一人自己告訴祐廷（AA_385 第 4 節，ZZ_TOLD_YT）----------
     不放進閒聊階梯：找她說話時先演，演完照常閒聊（story3d.js talkCharacter 問這裡，同 AA_379 2-3 的 SISY23.preTalk；芷若在吧檯上班也一樣，演完照常點餐）。
     條件：她們在交往中；祐廷還不知道（yt 不是 confirmed）；和她 FRIEND 以上；兩人沒有一起被祐廷傷害過（ZQ_ZR_ENDED_DAY：她們不會主動告訴他）；
     祐廷兩個都認識（子晴那一句說「芷若」、人物頁兩人各記一條，同 4-7）。誰先遇到就誰講，只講一次：記在講的那一位（記憶 ZZ_TOLD_YT）＝祐廷知道（confirmed，S.sync 也認）*/
  S.TOLD_EV={[ZR]:'ev_zz_told_zr',[ZQ]:'ev_zz_told_zq'};
  S.toldDue=function(G,id){ if(!law(G)||!S.TOLD_EV[id]||typeof SOCIAL==='undefined'||!SOCIAL.has) return false; const R=G.flags.ZZ;   /* 只讀（說話時每次都問，不替沒有 ZZ 的存檔建一筆）*/
    if(!R||typeof R!=='object'||R.state!=='dating'||R.yt==='confirmed'||G.flags.ZQ_ZR_ENDED_DAY!=null) return false;
    if(BOTH.some(x=>SOCIAL.has(x,'ZZ_TOLD_YT'))) return false;
    return BOTH.every(x=>knows(G,x))&&stageAt(id,'FRIEND'); };
  S.preTalk=async function(GM,id,o){ const G=GM&&GM.G; if(!G||!S.toldDue(G,id)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false;
    const eid=S.TOLD_EV[id], ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===eid):null; if(!ev) return false;
    const R=S.rec(G), E=evs(G); E.done[eid]=(E.done[eid]||0)+1; E.last[eid]=G.day; R.ev[eid]={day:G.day,seen:true};
    SOCIAL.remember(id,'ZZ_TOLD_YT',''); S.raise(R,'confirmed'); S.coupleMem(G);   /* 先記（同 SISY23.preTalk）：演到一半出錯也不會每次說話都重來 */
    const sc=!!(o&&o.scene); if(sc&&GM.sceneBegin) GM.sceneBegin({adv:id});   /* scene：吧檯的店員那一條路還沒開對話（story3d.js 的點餐在後面）*/
    try{ await EVENTS.runLines(ev.dialogue,ev); } finally { if(sc&&GM.sceneEnd) GM.sceneEnd(); }
    return true; };

  /* ---------- 4-5、4-6：交往以後（沒有固定日子；4-5、4-6 合起來一個月最多一則，照順序，條件不到的先跳過）---------- */
  S.monthOk=G=>S.rec(G).month!==monthKey(G.day);
  const night=G=>hh(G)>=21||(+G.hour||0)>=24||hh(G)<5;
  S.DAILY_IF=[()=>true,()=>true,G=>G.weather==='rain'&&(hh(G)>=18||(+G.hour||0)>=24),()=>true,()=>true];   /* 第 3 則：Café 下雨的晚上 */
  S.SUPPER=G=>G.zone==='gongguan'&&hh(G)>=22&&(+G.hour||0)<24;   /* 公館宵夜（23:00 前後，倫敦是下午）：祐廷在公館、子晴在公館的時段（characters.js 平日 22～24 點）*/
  S.UK_IF=[S.SUPPER,night,night,night];   /* 第 1 則：AA_385 第 5 項改到公館宵夜（原本她那邊晚上九點＝臺灣凌晨四、五點，子晴的作息到 24:00 演不到）；其他：一起熬夜 */
  const firstOk=(G,pre,conds,n)=>{ for(let i=1;i<=conds.length;i++){ if(G.events&&G.events.done&&G.events.done[pre+i]) continue; if(!conds[i-1](G)) continue; return i===n; } return false; };
  S.dailyOk=function(G,n){ if(!law(G)) return false; const R=S.rec(G); if(R.state!=='dating'||!S.monthOk(G)||abroad(G)||!inTaipei(G,ZQ)) return false; if(G.flags&&G.flags.companion) return false;   /* 和別人一起來的（約好的見面）不插進來 */
    return firstOk(G,'ev_zz_daily_',S.DAILY_IF,n); };
  S.ukOk=function(G,n){ if(!law(G)) return false; const R=S.rec(G); if(R.state!=='dating'||!S.monthOk(G)||abroad(G)||!inUK(G)||!inTaipei(G,ZQ)) return false; return firstOk(G,'ev_zz_uk_',S.UK_IF,n); };
  S.dailyDone=function(G){ const R=S.rec(G); R.month=monthKey(G.day); S.raise(R,'hint'); };   /* 23-4：4-7 以前的 4-5＝只覺得有點曖昧 */

  /* ---------- 曼谷（大三暑假 T03，子晴揪的那一團；AA_244、23-4）：她們交往中＝芷若也去 ----------
     6/10 私訊多「芷若也去」（包住 VAC.phone，只在送出那一刻）；同行的人加芷若（她不再傳「那邊的咖啡怎麼樣？」）；
     夜市那天（7/5）多一句椰子汁的旁白——祐廷第一次看到她們這樣（4-7 還沒演）＝這一場算 4-7，照 4-7 那一版接（S.bkkLines，vac3d.js 的關鍵事件照台詞跑）*/
  S.BKK_D0='2028-07-03';
  S.bkkWith=function(G){ const R=G&&G.flags&&G.flags.ZZ; if(!R||typeof R!=='object'||R.state!=='dating') return false; const d=D(S.BKK_D0); return R.datingDay==null||d==null||R.datingDay<=d; };   /* 芷若那幾天在不在曼谷（characters.js 芷若 absentDates 的 when）：7/3 那天她們交往中（交往不會分開，datingDay 在 7/3 以前）。只讀存檔、不建 ZZ（presence 每一格都問）*/
  S.bkkCard=()=>typeof VAC_DATA!=='undefined'&&VAC_DATA.A?VAC_DATA.A.T03||null:null;
  const curG=()=>(typeof GAME!=='undefined'&&GAME&&GAME.G)||S._G||null;
  S.learnBkk=function(G,hurt){ const R=S.rec(G), E=evs(G); if(R.ev.ev_zz_yt_learns) return; R.ev.ev_zz_yt_learns={day:G.day,seen:true,v:hurt?'hurt':'friend',bkk:true};
    E.done.ev_zz_yt_learns=(E.done.ev_zz_yt_learns||0)+1; E.last.ev_zz_yt_learns=G.day; S.raise(R,'confirmed'); S.coupleMem(G); };
  S.bkkLines=function(G){ if(!G||!S.dating(G)) return null; const R=S.rec(G), out=[{narr:L.BKK.coconut}];
    if(R.ev.ev_zz_yt_learns||R.yt==='confirmed'||!BOTH.every(id=>knows(G,id))) return out;   /* 4-7 已經演過：普通的旅行場景 */
    const F=G.flags, hurt=F.ZQ_ZR_ENDED_DAY!=null, nm=String(G.name||'祐廷'); let lines=(hurt?L.LEARN.hurt:L.LEARN.friend).slice(); if(F.YT_HEARD_ZZ) lines[0]=[lines[0][0],L.LEARN.heard];
    const conv=ZRZQ_TOLINES(lines).map(l=>{ const t=l.text.replace(/\{name\}/g,nm); return l.speaker==='player'?{who:'player',text:t}:(l.speaker?{who:l.speaker,text:t}:{narr:t}); });
    const t0=conv[0].text; conv[0].text=G2=>{ S.learnBkk(G2,hurt); return t0; };   /* 真的演到這一句才記（vac3d.js 的 yields 只問有沒有東西演，不跑 text）*/
    return out.concat(conv); };

  /* ---------- 結局（第五節；23-7：遊戲結束時判定，尾聲加一行）---------- */
  S.ending=function(G){ const st=S.rec(G).state; if(st==='dating') return 'B'; if(['held','mutual_interest','feelings_emerging'].includes(st)) return 'C'; return 'A'; };
  S.endLine=function(G){ const R=S.rec(G), e=S.ending(G); R.ending=e;
    if(e==='A'){ if(R.state==='friends'){ R.state='remain_friends'; mirror(G,R); } return null; }   /* 始終是最好的朋友：照兩人原本的尾聲，不加遺憾句 */
    if(e==='B') return L.END.B;   /* 祐廷沒看過任何一場也一樣有（23-7）*/
    if(R.state==='held'&&R.held==='uk') return L.END.C_UK;
    if(R.fy==='seeing') return null;   /* 選了方奕廷的 C：那一句旁白接在子晴那一句後面（下面包住的 PG.epiLine，AA_385 第 2 節），CG 以後不再加 */
    return L.END.C; };
  /* 結局 C、芷若選了方奕廷（AA_385 第 2 節；英國那一版「她回來再說」優先，同上）：尾聲芷若、奕廷照他們自己那一版、子晴那一句後面多一句旁白 */
  S.fyEnd=function(G){ const R=G&&G.flags&&G.flags.ZZ; return !!R&&typeof R==='object'&&R.fy==='seeing'&&!(R.state==='held'&&R.held==='uk')&&S.ending(G)==='C'; };

  /* ---------- 帶到場 ---------- */
  S.zoneCat=function(G){ const z=G.zone||''; if(atHome(G)) return 'home'; if(z==='cafe') return 'cafe'; if(['library','library_hall','lawlib','soclib'].includes(z)) return 'lib';
    if(/^dorm/.test(z)) return 'dorm'; if(['gongguan','noodle','bookstore','cvs','wenzhou','lane118'].includes(z)||/^l118|^wz_/.test(z)) return 'town'; return 'campus'; };
  /* {課名}：那天實際上的最後一堂課（有去上的、在現在以前下課的；am＝只看上午）*/
  S.lastClass=function(G,o){ if(typeof CLS==='undefined'||!CLS.dayItems) return null; const Dn=(G.courses&&G.courses.done)||{};
    const Lc=CLS.dayItems(G,G.day).filter(it=>Dn[it.key]&&it.t1<=o.upTo+1e-6&&(!o.am||it.t1<=12.5)); return Lc.length?Lc[Lc.length-1]:null; };
  S.courseName=c=>!c?'':(c.retake?String(c.name).replace(/（[上下一二]）$/,'')+'（重修）':String(c.name));   /* 「經濟學原理（重修）」只在那學期真的有時用（第九節）*/
  S.intro=function(G,key,s){ const I=L.IN, cat=S.zoneCat(G);
    if(key==='home') return s.grad?I.home.grad:I.home[{lib:'lib',dorm:'dorm',town:'town',cafe:'cafe',campus:'campus',home:'town'}[cat]];
    if(key==='next'){ if(s.grad) return I.next.grad; if(cat==='town') return I.next.none; const c=S.lastClass(G,{upTo:+G.hour||0}); return c?I.next.cls.replace('{課名}',S.courseName(c.c)):I.next.none; }
    if(s.grad) return I.serious.grad; if(cat!=='campus'&&cat!=='lib') return I.serious.out;
    const c=S.lastClass(G,{upTo:+G.hour||0,am:true}); return c?I.serious.cls.replace('{課名}',S.courseName(c.c)):I.serious.campus; };
  const leaveHome=G=>{ if(typeof HOME==='undefined'||!HOME.rec) return; const H=HOME.rec(G); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; H.stayMon=null; };   /* 同 y34b3d.js */
  /* 入場旁白先出（畫面帶到現場前的第一句，23-3），黑幕、時鐘到相遇的時間、走到那個地點旁邊的站位 */
  S.bring=async function(GM,intro,s,o){ o=o||{}; const G=GM.G, A=typeof ADV!=='undefined'?ADV:null;
    let dark=false; GM.sceneBegin(); try{ if(o.fromHome) leaveHome(G);
      if(intro){ if(A&&A.begin) A.begin({background:o.fromHome&&typeof HOME!=='undefined'&&HOME.bgNow?HOME.bgNow():'dark'}); try{ await GM.say(null,intro); } finally{ if(A&&A.end) A.end(); } }
      if(GM.fade){ dark=true; await GM.fade(true); }
      const meet=s.meet!=null?s.meet:s.h; if(G.day===s.day&&(+G.hour||0)<meet){ G.hour=meet; if(GM.E) GM.E.hour=G.hour; }
      const at=s.at||{}, P=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position, near=G.zone===at.zone&&!!P&&Math.hypot((P.x||0)-at.x,(P.z||0)-at.z)<6&&!o.fromHome;
      if(at.zone&&GM.enter&&!near) await GM.enter(at.zone,{x:at.x,z:at.z,yaw:at.yaw,lv:0},{noFade:true,deferStory:true});   /* 同一區也走過去（同 quickGo）；deferStory：不讓那一區的進場事件先開演 */
      if(GM.fade){ await GM.fade(false); dark=false; }
    } finally { if(dark&&GM.fade){ try{ await GM.fade(false); }catch(e){} } GM.sceneEnd(); } };   /* 出錯也把黑幕拿掉，不讓畫面停在全黑 */
  /* 4-2b、4-7 沒有《》標題：字幕用 AA 寫的地點（萬才館門口／溫州街的小公園／醉月湖／6/3 畢業典禮）*/
  S.placeTitle=s=>s.special==='gradDay'?L.TITLE.grad:(s.park||s.grad?L.TITLE.park:(s.kind==='mind'?L.TITLE.wancai:L.TITLE.lake));
  S.playEv=async function(GM,id,lines,extra,after,over){ if(typeof EVENTS==='undefined'||!EVENTS.run) return false;
    const base=(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.find(e=>e.id===id))||{id,participants:[],background:'blur'};
    const ev=Object.assign({},base,over||{},{dialogue:ZRZQ_TOLINES(lines).concat(extra||[]),after:G2=>{ try{ if(after) after(G2); }catch(e){ console.warn('ZRZQ after',id,e); } }});   /* over：依地點換標題（標題會出字幕、寫進筆記本的日誌）*/
    await EVENTS.run(ev); return true; };
  S.runMain=async function(GM,s,o){ const G=GM.G, key=s.key; let lines, ctx={}; const extra=[];
    if(key==='home') lines=L.HOME;
    else if(key==='next'){ ctx.friend=BOTH.every(id=>met(G,id,'FRIEND')); lines=(ctx.friend?L.NEXT_FRIEND:[]).concat(L.NEXT,ctx.friend?L.NEXT_END.friend:L.NEXT_END.plain); }   /* 祐廷和兩人都是朋友以上＝朋友版（不會同場兩次打招呼）*/
    else { ctx=S.seriousCtx(G,s); lines=S.seriousLines(G,ctx); if(S.feelOk(G)) extra.push({choice:L.SERIOUS.FEEL.map(([t,v])=>({text:t,set:{YT_ZZ_FEEL:v}}))}); }
    const id=key==='serious'&&ctx.again?'ev_zz_serious_again':S.SLOTS[key].ev;
    await S.bring(GM,S.intro(G,key,s),s,o);
    return S.playEv(GM,id,lines,extra,G2=>S.resolve(G2,key,s,true,ctx)); };
  S.runMind=async function(GM,s,o){ const G=GM.G, intro=s.park?L.IN.mindPark:(G.flags&&G.flags.CLUB_club_guitar?null:'（'+L.IN.mindPass+'。）');   /* 吉他社的玩家：練完出來；不是：你經過萬才館 */
    await S.bring(GM,intro,s,o);
    return S.playEv(GM,'ev_zz_zq_mind',S.mindLines(G,s),[],G2=>{ const R=S.rec(G2); R.ev.ev_zz_zq_mind={day:s.day,seen:true,v:s.ver,park:!!s.park}; S.raise(R,'hint'); },{title:S.placeTitle(s)}); };   /* 勾手臂那一下不算 4-7（23-4）*/
  S.runLearn=async function(GM,c,o){ const G=GM.G, F=G.flags, hurt=F.ZQ_ZR_ENDED_DAY!=null; let lines=(hurt?L.LEARN.hurt:L.LEARN.friend).slice();
    if(F.YT_HEARD_ZZ) lines[0]=[lines[0][0],L.LEARN.heard];   /* 聽過 4-4 的玩家第一句改「妳們……真的在一起了？」*/
    await S.bring(GM,c.special==='gradDay'?L.IN.learnGrad:S.intro(G,'learn',c),c,o);
    return S.playEv(GM,'ev_zz_yt_learns',lines,[],G2=>{ const R=S.rec(G2); R.ev.ev_zz_yt_learns={day:c.day,seen:true,v:hurt?'hurt':'friend'}; S.raise(R,'confirmed'); S.coupleMem(G2); },{title:S.placeTitle(c)}); };
  S.run=(GM,n,o)=>n.kind==='mind'?S.runMind(GM,n,o):(n.kind==='learn'?S.runLearn(GM,n,o):S.runMain(GM,n,o));
  /* 現在要帶到場的那一場（4-2b、三場、4-7）*/
  S.next=function(G){ if(!law(G)) return null; const m=S.mindDue(G); if(m&&m.mode==='play') return m; const d=S.due(G); if(d&&d.mode==='play') return d; return S.learnDue(G); };

  /* ---------- 每一輪（PHONE_RULES：在家、在日本、快轉也會跑）---------- */
  S.sync=function(G){ if(!G||!G.flags) return; S._G=G; const R=S.rec(G); if(!law(G)){ mirror(G,R); return; }
    S.semSync(G); S.f3Sync(G); S.mindSync(G);
    const d=S.due(G); if(d&&d.mode==='unseen') S.resolve(G,d.key,d,false,d.key==='serious'?S.seriousCtx(G,d):{});
    S.f3MsgSync(G);
    if(R.state==='dating'&&R.yt!=='confirmed'&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&BOTH.some(id=>knows(G,id)&&SOCIAL.has(id,'ZZ_TOLD_YT'))){ S.raise(R,'confirmed'); S.coupleMem(G); }   /* 23-4：其中一人自己告訴他（記憶 ZZ_TOLD_YT；AA_385 第 4 節，上面的 S.preTalk）*/
    mirror(G,R); };
  /* ---------- 每 0.5 秒（STORY.TICKS）：回傳 true＝開始演了 ---------- */
  let busy=false; S._fail={};
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['zrzq3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=(id,f)=>{ busy=true; S._p=Promise.resolve().then(f).catch(e=>{ console.warn('ZRZQ',id,e); S._fail[id]=true; }).finally(()=>{ busy=false; }); return true; };   /* S._p：測試等它演完；帶到場出錯＝這次遊戲不再試（不每 0.5 秒重來）*/
  const failed=id=>!!S._fail[id]||(typeof EVENTS!=='undefined'&&!!EVENTS.failed&&!!EVENTS.failed[id]);
  const evIdOf=n=>n.kind==='mind'?'ev_zz_zq_mind':(n.kind==='learn'?'ev_zz_yt_learns':S.SLOTS[n.key].ev);
  /* 結束玩家目前的動作就演；在其他事件、對話、約會、一起走路、自由出行裡＝等它結束（還在時段內才演）*/
  S.free=function(GM){ const G=GM.G, E=GM.E, F=G.flags||{};
    if(E&&E.player&&E.player.busy) return false; if(GM.D&&GM.D.active) return false; if(typeof ADV!=='undefined'&&ADV.active) return false;
    if(typeof EVENTS!=='undefined'&&EVENTS.running) return false; if(GM.isEntering&&GM.isEntering()) return false;
    if(F.companion) return false; if((G.invites||[]).some(v=>v&&v.state==='going')) return false; if(typeof TRIP!=='undefined'&&TRIP.at&&TRIP.at(G)) return false;
    return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!law(G)) return false; S.sync(G); if(atHome(G)||abroad(G)) return false;
    const n=S.next(G); if(!n||failed(evIdOf(n))||!S.free(GM)) return false; return go(evIdOf(n),()=>S.run(GM,n)); };
  /* 在家（home3d.js 的 loop 問 STORY.y4HomeDue）：該帶到場了＝先離開家 */
  S.homeDue=G=>{ if(!law(G)||abroad(G)) return null; S.sync(G); const n=S.next(G); return n&&!failed(evIdOf(n))?'zrzq':null; };
  /* 之後會帶到場的時間（跳過時間、寒暑假快轉停在那裡，不會一跳就錯過；睡覺照 23-3 不叫醒）：[{day,h}] */
  S.upcoming=function(G){ if(!law(G)) return []; const R=S.rec(G), out=[];
    const key=S.nextKey(R), term=termAt(G.day); if(key&&S.CAND.includes(term)){ const s=S.slotOf(key,term);
      if(s&&s.day>=G.day&&s.day>=R.since&&(R.lastDay==null||s.day>R.lastDay)&&S.canSee(G,s)&&S.cond(G,key,s)) out.push({day:s.day,h:s.h}); }
    if(!R.ev.ev_zz_zq_mind){ const m=S.mindSlot(G); if(m&&m.day>=G.day&&!abroad(G,m.day)&&knows(G,ZQ)) out.push({day:m.day,h:m.h}); }
    if(R.state==='dating'&&!R.ev.ev_zz_yt_learns&&R.yt!=='confirmed'&&BOTH.every(id=>knows(G,id))) for(const c of S.learnCands(G)) if(c.day>=G.day&&!abroad(G,c.day)) out.push({day:c.day,h:c.h});
    return out; };

  /* ---------- 掛上去 ---------- */
  if(typeof CHARACTERS!=='undefined') for(const [a,b] of [[ZR,ZQ],[ZQ,ZR]]) if(CHARACTERS[a]&&!CHARACTERS[a].partner) CHARACTERS[a].partner={zz:b,soloOk:true};   /* 23-5：她們交往中＝「她有交往的對象」；
     soloOk：只擋 L2／L3（校外約會）和告白，祐廷約她們吃飯、散步、一盞（invites3d.js 的 partnerBlock）照常——她們是朋友（AA_385 第 6 節；婉拒照系統現成那幾句，不換）*/
  if(typeof STORY!=='undefined'){
    if(STORY.partnerOn&&!STORY._zrzqPartner){ const p0=STORY.partnerOn; STORY.partnerOn=function(G,p){ if(p&&p.zz) return S.dating(G); return p0.apply(this,arguments); }; STORY._zrzqPartner=true; }
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.sync(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(!STORY._zrzqHome){ const hd0=STORY.y4HomeDue, hf0=STORY.y4FromHome;
      STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; return r||S.homeDue(G); };
      STORY.y4FromHome=function(GM,k){ if(k==='zrzq'){ const n=S.next(GM.G); return n?S.run(GM,n,{fromHome:true}):false; } return hf0?hf0.apply(this,arguments):null; };
      STORY._zrzqHome=true; } }
  /* 跳過時間（classes3d.js 的 skipTo）停在要帶到場的那一刻；寒暑假的快轉（HOME.STOPS）也停 */
  if(typeof CLS!=='undefined'&&CLS.skipStops&&!CLS._zrzq){ const k0=CLS.skipStops; CLS.skipStops=function(GM,h1){ const out=k0.apply(this,arguments)||[]; const G=GM&&GM.G;
      try{ if(G){ const h0=(+G.hour||0); for(const u of S.upcoming(G)) if(u.day===G.day&&u.h>h0+1e-6&&u.h<h1) out.push({h:u.h,why:'有事發生'}); out.sort((a,b)=>a.h-b.h); } }catch(e){ console.warn('ZRZQ skipStops',e); }
      return out; }; CLS._zrzq=true; }
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,t)=>S.upcoming(G).map(u=>T(u.day,u.h)).filter(x=>t==null||x>t));
  /* F3 婉拒的存檔：「奕廷約我去看電影。……我說好。」那一場不演（第三節：婉拒，取代「我想試試看」）。
     AA_387 第 8 節：因為祐廷拒絕的（ZR_F3_NO）照演這一場，換拒絕版（r2y3b_events.js ev_zhiruo_f3_cafe 照 ZR_F3_NO 分支）*/
  if(typeof R2Y3B!=='undefined'&&R2Y3B.f3CafeDue&&!R2Y3B._zrzq){ const f0=R2Y3B.f3CafeDue; R2Y3B.f3CafeDue=function(G){ const R=G&&G.flags&&G.flags.ZZ; if(R&&R.fy==='declined'&&G.flags.ZR_F3_NO==null) return false; return f0.apply(this,arguments); }; R2Y3B._zrzq=true; }
  /* 手機子晴「芷若在英國」那三則（BB_178 第 2 節；AA_385 第 9 節選③，企劃線 028dc128）：friends、feelings_emerging、mutual_interest、held＝好朋友（「芷若這個月打來了」）、
     dating＝交往中；「兩人是朋友」（下雨的照片）只給沒有 ZZ 的舊存檔當備援 */
  S.GOOD=['friends','feelings_emerging','mutual_interest','held','remain_friends'];
  if(typeof MSG!=='undefined'&&MSG.tok&&!MSG._zrzq){ const t0=MSG.tok; MSG.tok=function(G,id,p){ const R=G&&G.flags&&G.flags.ZZ&&typeof G.flags.ZZ==='object'?G.flags.ZZ:null;
      if(p==='兩人是朋友') return !R; if(p==='兩人是好朋友') return !!R&&S.GOOD.includes(R.state); if(p==='兩人交往中') return S.dating(G); return t0.apply(this,arguments); }; MSG._zrzq=true; }   /* 「兩人交往中」：BB_178 第 2 節交往中那一句進回覆池時用（tools/msg/build_pool.py 還沒收）*/
  /* 曼谷（T03）：私訊多一句、同行的人、夜市那天的椰子汁 */
  { const A=S.bkkCard();
    if(A&&A.signup&&typeof VAC!=='undefined'&&VAC.phone&&!VAC._zrzq){ const v0=VAC.phone; VAC.phone=function(GM){ const s=A.signup, keep=s.msgs, G=GM&&GM.G;
        if(G&&S.dating(G)&&Array.isArray(keep)&&!keep.includes(L.BKK.dm)) s.msgs=keep.concat([L.BKK.dm]); try{ return v0.apply(this,arguments); } finally{ s.msgs=keep; } }; VAC._zrzq=true; }
    if(A&&Array.isArray(A.mates)&&!A._zrzq){ const base=A.mates.slice(); Object.defineProperty(A,'mates',{configurable:true,enumerable:true,get(){ const G=curG(); return G&&S.dating(G)?base.concat([ZR]):base; }}); A._zrzq=true; }
    const k=A&&Array.isArray(A.keys)?A.keys.find(x=>x&&x.day==='07-05'):null; if(k&&Array.isArray(k.lines)&&!k._zrzq){ k.lines.push(G=>S.bkkLines(G)); k._zrzq=true; } }
  /* 尾聲：結局 B（明信片）、C（她回來再說／我們還沒想好）那一行 */
  if(typeof PG!=='undefined'&&Array.isArray(PG.EPI_AFTER_CG)) PG.EPI_AFTER_CG.push(async GM=>{ const t=S.endLine(GM.G); if(t) await GM.say(null,t); });
  /* 尾聲：結局 C、芷若選了方奕廷（S.fyEnd；AA_385 第 2 節）——芷若、奕廷照他們自己那一版（postgrad3d.js epiLine 的 ZR_FY 那一列：zr.fy、fy.zr；問他們那一句時當成 ZR_FY，存檔不改）；
     子晴那一句後面多一句旁白（L.END.C_FY；子晴不說破、不寫遺憾）——旁白寫的是三個人坐在一起：芷若、奕廷也在那一桌（epiPresent）、她們都不是祐廷的伴侶才加 */
  if(typeof PG!=='undefined'&&PG.epiLine&&!PG._zrzq){ const e0=PG.epiLine; PG.epiLine=function(G,id){ const fy=(id===ZR||id===ZQ||id==='npc_fangyt')&&S.fyEnd(G), F=G.flags;
      if(fy&&id!==ZQ&&!PG.dating(G,ZR)&&F.ZR_FY!==true){ const had=Object.prototype.hasOwnProperty.call(F,'ZR_FY'), old=F.ZR_FY; F.ZR_FY=true;
        try{ return e0.apply(this,arguments); } finally { if(had) F.ZR_FY=old; else delete F.ZR_FY; } }
      const out=e0.apply(this,arguments);
      if(fy&&id===ZQ&&Array.isArray(out)&&!PG.dating(G,ZR)&&!PG.dating(G,ZQ)&&PG.epiPresent(G,ZR)&&PG.epiPresent(G,'npc_fangyt')) return out.concat([[null,L.END.C_FY]]);
      return out; }; PG._zrzq=true; }
  return S;
})();
