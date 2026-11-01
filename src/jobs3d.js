/* ===== 溫州街三家店的打工系統 JOBS（DL-10；USER_WANTS B06；AA_420 第 2 節＋AA_164 第 2、3、6、7 節＋AA_165）=====
   三家店：半熟早午餐（週六／週日 07:30～11:30，上午）、阿德影印輸出（週二～四 18:00～22:00，晚上；考試週可以加班 21:00～24:00）、一盞茶屋（週六／週日 13:00～17:00，下午）。
   - 應徵（第 6 條第 2 點）：大一下第 1 週起。早午餐、茶屋＝門上的告示（店裡的選單「應徵：…」）；或客人來過幾次以後老闆開口（吃三次／印三次／喝兩次，WZ_JOBS_DATA.ask）。
     答應時選班表；那一學期那一天、那個時段有課的不列（AA_420 第 12 條第 1 點）；一週最多兩班（所有打工加起來，家教也算；加班不算）。
     選了週六早午餐、去過法服週六值班的＝小米姐一句；選了週四影印、去過公法讀書會的＝阿德一句（AA_420 第 12 條第 3 點）。
   - 出門提醒（第 3 條）：開班前 30 分鐘（OUT.plan，goto 那一家店的室內），「出發」或「這週請假」。走進店裡、班的時間到了就開班（也可以按「開始上班」）。
     撞時段（第 12 條第 2 點）：同一天的週六早午餐＋法服值班、週四影印＋公法讀書會＝出門提醒兩個都列，選一個；另一個照各自的規則（請假／沒去），不扣分。
   - 一班（第 4 條）：第一班的那幾句 → 上週沒去的那一句 → ①開店／接單／院子 → 熟練描述 → ②尖峰的小狀況／做的時候的小狀況／泡茶 → ③收尾／交件／收席 →
     事件（S.SHIFT_EV，四條故事線在 src/wzlines3d.js）→ 薪水（時薪＝當年最低工資＋10：2025 年 200、2026 年 206、2027 年起 215；國定假日加倍，勞基法 §39）→ 下班。
     小選擇只改旁白；熟練每班 +1（0～10，不顯示數字）；一班填滿那個時段（CLS.slotFillSpan，AA_420 2-1）。
   - 沒去（第 6 條）：不扣分；下一班老闆一句（各店三句輪流）；連續三週一班都沒去＝老闆問「還要做嗎？」（有聯絡方式＝私訊；沒有＝下次走進店裡）。
   - 辭職（第 7 條）：店裡「找老闆」→「（辭職）」→「有空回來看看」→ 離開的時候（WZ-B6／C8／T6，房間物件）。
   - 寒暑假（第 13 條）：放假第一天 12:00 老闆私訊一次（第一班以後才有聯絡方式；沒有＝這個假先停）；「來。」＝照班表，那天有營隊、出遊、出國＝自動請假（不算沒去）；
     「放假先停。」＝停到開學第一週。還沒回之前不排班。
   - 出國（第 14 條）：日本路線大三下、美國路線大四上（STORY.movedOut～返台）自動暫停；回國以後第一次走進店裡老闆一句：「回來做。」（重選班表）／「先不了。」（離開的時候）。
   - 延畢（第 15 條）：交換路線（日本、美國）大五上（CALENDAR.termOfDelayed）照常做，最後一班＝離開的時候；臺灣路線照舊在大四下最後一班。
   - 第 9 條：期末考的時段不排班（考試那一格撞到＝那天自動請假）；颱風假不能打工（AA_160 3-4 D）。
   存檔：G.jobs＝{ brunch|copy|tea:{since, from, day:[週幾 1～7], shifts, skill, missedRun, quit, gone, missPend, missN, worked:[天], chk, wk:{}, brk:{假期:'go'|'stop'}, away, back, ask3, pendLeave, b5, b5next, ot:{} },
     _meta:{ n:{brunch,copy,tea,teaSat}, asked:{…} } }（AA_164 第 7 節；舊存檔沒有＝{}）。家教照舊是 JOB_TUTOR（story3d.js），JOBS.at(G,'tutor') 讀它；
     AA_289 3-3 家教補的那一件（第 6 堂以後「考卷的背面」）接在 ev_tutor_lesson 最後（S.patchTutor，旗標 TUTOR_DRAW、TUTOR_DRAW_ANS）。
   給別的檔案讀：JOBS.at(G,k)（k：brunch／copy／tea，或 wzshops3d.js 的 print／teahouse）→{lv, today, board, shiftNow, shifts, day} 或 null；JOBS.any(G)＝現在有在做的那一家；JOBS.summerPay＝暑假照班發薪（r3_3d.js）。
   測試：node tests/aa420_jobs_unit.js、node tests/aa289_jobs_ev_unit.js */
'use strict';
const JOBS=(function(){
  const S={};
  const D=()=>typeof WZ_JOBS_DATA!=='undefined'?WZ_JOBS_DATA:null;
  S.KEYS=['brunch','copy','tea','cafe','books','cvs','cram','office'];   /* cafe、books：兩點半 Café 外場、舊路書房（AA_431 第 2 節）；cvs、cram、office：便利商店夜班、補習班助教、事務所工讀（AA_433）——一班照 S.runShiftX */
  const ALIAS={brunch:'brunch',copy:'copy',print:'copy',tea:'tea',teahouse:'tea',cafe:'cafe',books:'books',bookstore:'books',cvs:'cvs',cram:'cram',office:'office'};
  S.key=k=>ALIAS[k]||null;
  S.ZONE_KEY={wz_brunch:'brunch',wz_print:'copy',wz_teahouse:'tea',cafe:'cafe',bookstore:'books',cvs:'cvs'};   /* 補習班、事務所沒有 3D（2D 的出遊）*/
  const T=(d,h)=>d*24+h;
  const now=G=>T(G.day,G.hour);
  const hasCal=()=>typeof CALENDAR!=='undefined';
  const wdOf=d=>CALENDAR.dateOf(d).wd;   /* 1＝週一 … 7＝週日 */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const shop=k=>D().shops[k];
  const whoOf=(G,who)=>who==='player'?{name:G.name}:(!who?null:(typeof CHARACTERS!=='undefined'&&CHARACTERS[who]&&typeof SOCIAL!=='undefined'&&SOCIAL.displayName?{name:SOCIAL.displayName(who),charId:who}:{name:who}));   /* 人物 id（芷若、沛珊）＝她的名字 */
  const say=async(GM,who,t)=>{ const G=GM.G; await GM.say(whoOf(G,who),String(t).replace(/\{name\}/g,G.name)); };
  /* 一串台詞：[說話的人, 字]（null＝旁白）、{choice:[{t,say}]} */
  S.play=async function(GM,L){ for(const x of (L||[])){ if(!x) continue; if(Array.isArray(x)) await say(GM,x[0],x[1]); else if(x.choice){ const k=await GM.choose(x.choice.map(c=>({t:c.t}))); const c=x.choice[k]||x.choice[0]; await S.play(GM,c.say); } } };

  // ---------- 存檔 ----------
  S.rec=function(G){ if(!G.jobs||typeof G.jobs!=='object'||Array.isArray(G.jobs)) G.jobs={}; const J=G.jobs; if(!J._meta||typeof J._meta!=='object') J._meta={}; const M=J._meta; if(!M.n||typeof M.n!=='object') M.n={}; if(!M.asked||typeof M.asked!=='object') M.asked={}; return J; };
  S.job=(G,k)=>{ k=S.key(k); if(!k||!G) return null; const j=S.rec(G)[k]; return j&&typeof j==='object'?j:null; };
  S.active=(G,k)=>{ const j=S.job(G,k); return !!j&&!j.gone; };
  const fix=j=>{ if(!Array.isArray(j.day)) j.day=[]; if(!Array.isArray(j.worked)) j.worked=[]; if(!j.wk||typeof j.wk!=='object') j.wk={}; if(!j.brk||typeof j.brk!=='object') j.brk={}; if(!j.ot||typeof j.ot!=='object') j.ot={}; return j; };

  // ---------- 日曆 ----------
  S.route=G=>typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null;   /* 交換延畢（日本、美國路線）*/
  S.finalTerm=G=>S.route(G)?'Y5S1':'Y4S2';   /* AA_420 第 15 條 */
  S.endDay=G=>{ const r=hasCal()&&CALENDAR.termDays?CALENDAR.termDays(S.finalTerm(G)):null; return r?r.to:1e9; };
  S.startDay=()=>{ const r=hasCal()&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return r?r.from:1e9; };   /* 大一下第 1 週起（AA_164 第 2 節）*/
  S.termAt=(G,d)=>{ if(!hasCal()) return null; const t=CALENDAR.termOf(d); if(t) return t; if(S.route(G)&&CALENDAR.termOfDelayed) return CALENDAR.termOfDelayed(d); return null; };
  /* 寒暑假：HOME.breakOf（大一～大四）；延畢的玩家大四下到大五上中間的暑假另外算（key 'Y4S'）*/
  S.breakAt=function(G,d){ if(!hasCal()||CALENDAR.termOf(d)) return null; if(typeof HOME!=='undefined'&&HOME.breakOf){ const b=HOME.breakOf(d); if(b) return b; }
    if(S.route(G)&&CALENDAR.termDays){ const a=CALENDAR.termDays('Y4S2'), b=CALENDAR.termDays('Y5S1'); if(a&&b&&d>a.to&&d<b.from) return {key:'Y4S',kind:'summer',year:'Y4',from:a.to+1,to:b.from-1,next:'Y5S1'}; }
    return null; };
  S.away=(G,d)=>{ if(typeof STORY==='undefined') return false; const g=Object.assign({},G,{day:d}); return !!((STORY.movedOut&&STORY.movedOut(g))||(STORY.abroad&&STORY.abroad(g))); };   /* 出國那一學期（X1 退宿～返台）*/
  S.year=(G,d)=>{ if(d==null) d=G.day; let t=S.termAt(G,d); for(let x=d-1;!t&&x>d-200;x--) t=S.termAt(G,x); const m=t?/^Y(\d)/.exec(t.id):null; return m?+m[1]:1; };   /* 寒暑假照前一個學期 */
  S.natHoliday=d=>{ if(!hasCal()) return false; const h=CALENDAR.holiday(d); if(!h) return false; const k=CALENDAR.dateOf(d).key; if(CALENDAR.SCHOOL&&CALENDAR.SCHOOL[k]) return false; if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return false; return true; };   /* 勞基法 §37 的休假日（校定假日、颱風假不算）*/
  S.wage=d=>{ const y=hasCal()?CALENDAR.dateOf(d).y:2025; return y<=2025?200:(y===2026?206:215); };   /* 當年最低工資＋10（BB_115 L439；2028 以後公告前先用 215）*/
  S.period=t=>t<12?'am':(t<18?'pm':'ev');
  /* 那一天的上班時間：Café、書店每一天不同（shops[k].hours：週幾→[開始, 結束]），溫州街三家照 t0、t1 */
  S.hrsWd=(k,wd)=>{ const s=shop(k); return (s.hours&&s.hours[wd])||[s.t0,s.t1]; };
  S.hrs=(k,d)=>S.hrsWd(k,hasCal()?wdOf(d):6);
  const weekOf=d=>d-(wdOf(d)-1);   /* 那一週的週一 */

  // ---------- 這一天有沒有班 ----------
  S.EXCUSE=[];   /* 事件包登記的「那天自動請假」：fn(G,k,d)→原因或 null（例：線一、線三的法服週六，早午餐自動請假；src/wzlines3d.js）*/
  S.overlap=(a0,a1,b0,b1)=>a0<b1-1e-6&&b0<a1-1e-6;
  /* 寒暑假的「來。」：那一天有營隊、活動、出遊、出國＝自動請假（AA_420 第 13 條）*/
  S.vacBusy=function(G,d,k){ if(typeof VAC!=='undefined'){ try{ if(VAC.abroadOn&&VAC.abroadOn(G,d)) return 'trip'; const R=VAC.rec?VAC.rec(G).reg:{}; if(VAC.all) for(const I of VAC.all()){ if(!['yes','done'].includes(R[I.key])) continue; if(d>=I.from&&d<=I.to) return 'vac'; } }catch(e){} }
    if(typeof OUT!=='undefined'&&OUT.rec){ const s=shop(k); const H0=S.hrs(k,d); for(const q of OUT.rec(G)){ if(q.day!==d||/^job_/.test(q.id||'')||q.state==='missed'||q.state==='cancelled') continue; const a=(q.h||0)-(q.travelH||0.5), b=(q.h||0)+(q.hours||2); if(S.overlap(a,b,H0[0],H0[1])) return 'out'; } }
    return null; };
  S.excused=function(G,k,d){ const H0=S.hrs(k,d); if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return 'typhoon';
    if(k!=='cvs'&&H0[0]<10&&S.active(G,'cvs')&&S.scheduled(G,'cvs',d-1)&&S.hrs('cvs',d-1)[1]>24) return 'night';   /* 前一晚便利商店夜班：隔天 10:00 以前在睡覺（AA_433 第 1 節）*/
    if(typeof CLS!=='undefined'&&CLS.dayItems&&!shop(k).classOk){ try{ for(const it of CLS.dayItems(G,d)) if(S.overlap(it.t0,it.t1,H0[0],H0[1])) return it.exam?'exam':'class'; }catch(e){} }   /* 第 9 條：期末考的時段；第 12 條：有課的時段 */
    if(!S.termAt(G,d)&&S.vacBusy(G,d,k)) return 'busy';
    for(const f of S.EXCUSE){ try{ const r=f(G,k,d); if(r) return r; }catch(e){ console.warn('JOBS.EXCUSE',e); } }
    return null; };
  /* 照班表、這一天該上班嗎（還沒算請假的理由）*/
  S.scheduled=function(G,k,d){ const j=S.job(G,k); if(!j||j.gone||!hasCal()||!law(G)) return false; fix(j); const s=shop(k);
    if(d<(j.since|0)||d>S.endDay(G)) return false; if(d===j.since&&j.from!=null&&T(d,S.hrs(k,d)[0])<=j.from) return false;
    if(!j.day.includes(wdOf(d))) return false; if(j.back||S.away(G,d)) return false;
    if(S.termAt(G,d)) return true;
    const b=S.breakAt(G,d); return !!b&&j.brk[b.key]==='go'; };
  S.due=(G,k,d)=>S.scheduled(G,k,d)&&!S.excused(G,k,d);
  S.worked=(G,k,d)=>{ const j=S.job(G,k); return !!j&&Array.isArray(j.worked)&&j.worked.includes(d); };
  S.shiftNow=function(G,k){ k=S.key(k); if(!S.active(G,k)) return false; const t0=S.hrs(k,G.day)[0], h=G.hour; return S.due(G,k,G.day)&&!S.worked(G,k,G.day)&&h>=t0-0.5&&h<=t0+0.75; };

  // ---------- 給別的檔案讀 ----------
  S.at=function(G,k){ if(!G) return null; if(k==='tutor'){ const F=G.flags||{}; if(!F.JOB_TUTOR||S.tutorEnded(G)) return null; const wd=F.TUTOR_WD===4?4:2;
      return {lv:F.TUTOR_N|0,shifts:F.TUTOR_N|0,since:F.tutorFromDay,day:[wd],today:G.weekday===wd&&S.tutorDayOk(G,G.day),board:null,shiftNow:false}; }   /* 家教（AA_164 第 7 節：tutor）：照舊 JOB_TUTOR；停了、會考以後＝null（AA_163 第 2 節）*/
    const kk=S.key(k); if(!kk||!S.active(G,kk)) return null; const j=fix(S.job(G,kk)), d=G.day, worked=S.worked(G,kk,d);
    let board=null; if(kk==='brunch'&&worked&&typeof WZS!=='undefined'&&WZS.BOARD){ const L=WZS.BOARD[wdOf(d)]||WZS.BOARD[2]; board=L&&L[0]||null; }   /* 有班那天的黑板：今天早上寫的那一句（今日推薦）*/
    return {lv:j.skill|0,skill:j.skill|0,shifts:j.shifts|0,day:j.day.slice(),today:S.due(G,kk,d),worked,board,shiftNow:S.shiftNow(G,kk)}; };
  S.paused=(G,k)=>{ const j=S.job(G,k); if(!j||j.gone) return true; if(G.day>S.endDay(G)||j.back||S.away(G,G.day)) return true; if(!S.termAt(G,G.day)){ const b=S.breakAt(G,G.day); if(b&&fix(j).brk[b.key]!=='go') return true; } return false; };
  S.any=G=>{ if(!G||!law(G)) return null; for(const k of S.KEYS) if(S.active(G,k)&&!S.paused(G,k)) return k; return null; };   /* 現在有在做的那一家（家教另外看 JOB_TUTOR）*/
  S.summerPay=true;   /* 暑假的班照班發薪（r3_3d.js 的 22000 不再另外給）*/

  // ---------- 一週最多兩班 ----------
  S.tutorWeekly=G=>S.tutorOn(G)?1:0;   /* 家教那一週算一班（大一下～大二下有在上的學期，AA_163 第 2 節）*/
  S.used=(G,except)=>{ let n=S.tutorWeekly(G); for(const k of S.KEYS){ if(k===except||!S.active(G,k)) continue; n+=fix(S.job(G,k)).day.length; } return n; };
  S.cap=(G,k)=>Math.max(0,2-S.used(G,k));
  /* 那一學期那一天、那個時段有課（AA_420 第 12 條第 1 點）*/
  S.classOn=function(G,k,wd){ if(typeof CLS==='undefined'||!CLS.termCourses||typeof COURSES==='undefined') return false; const t=S.termAt(G,G.day)||(()=>{ const b=S.breakAt(G,G.day); return b&&b.next?{id:b.next}:null; })(); if(!t) return false;
    const p=shop(k).hours?S.period(S.hrsWd(k,wd)[0]):shop(k).period; try{ for(const c of CLS.termCourses(G,t.id)) for(const s of (c.slots||[])){ if(s.wd!==wd) continue; const b=COURSES.blocks[s.block]; if(b&&S.period(b.t0)===p) return true; } }catch(e){} return false; };
  S.eligible=(G,k)=>{ if(!(law(G)&&hasCal()&&G.day>=S.startDay()&&G.day<=S.endDay(G))) return false; const f=k&&shop(k)&&shop(k).from; if(!f) return true; const r=CALENDAR.termDays&&CALENDAR.termDays(f); return !r||G.day>=r.from; };   /* from：補習班大二起、事務所大三起（AA_433）*/
  const WD=['','週一','週二','週三','週四','週五','週六','週日'];
  S.schedText=(k,days)=>{ const s=shop(k); if(!s.hours) return days.map(d=>WD[d]).join('、')+' '+hm(s.t0)+'～'+hm(s.t1); return days.map(d=>{ const h=S.hrsWd(k,d); return WD[d]+' '+hm(h[0])+'～'+hm(h[1]); }).join('、'); };   /* 班表的字（Café、書店每天時間不同）*/
  const hm=h=>{ const H=Math.floor(h), mm=Math.round((h-H)*60), hh=H%24; return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; };   /* 26＝隔天 02:00 */
  /* 選班表：早午餐、茶屋＝週六／週日／兩天；影印＝週二～四挑一天，還有名額可以再加一天 */
  S.pickDays=async function(GM,k){ const G=GM.G, s=shop(k), cap=S.cap(G,k); if(cap<=0){ if(GM.toast) GM.toast('一週最多兩班（所有打工加起來）',3200); return null; }
    const ok=s.days.filter(wd=>s.classOk||!S.classOn(G,k,wd));   /* 事務所：撞到必修課照樣可以選（AA_433 第 3 節）*/ if(!ok.length){ if(GM.toast) GM.toast('那個時段都有課',3000); return null; }
    const hint=hm(s.t0)+'～'+hm(s.t1), hintOf=wd=>{ const h=S.hrsWd(k,wd); return hm(h[0])+'～'+hm(h[1]); };
    if(k!=='copy'){ const O=ok.map(wd=>({t:WD[wd],hint:hintOf(wd),days:[wd]})); if(cap>=2&&ok.length===2) O.push({t:WD[ok[0]]+'和'+WD[ok[1]],hint:'一週兩班',days:ok.slice()}); O.push({t:'先不要'});
      const i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); return O[i]&&O[i].days?O[i].days:null; }
    const O=ok.map(wd=>({t:WD[wd],hint,days:[wd]})).concat([{t:'先不要'}]); const i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); if(!O[i]||!O[i].days) return null; const first=O[i].days[0];
    if(cap<2) return [first]; const O2=ok.filter(wd=>wd!==first).map(wd=>({t:'再加一天：'+WD[wd],hint,days:[first,wd]})).concat([{t:'就'+WD[first]+'一天',days:[first]}]);
    const i2=await GM.choose(O2.map(o=>({t:o.t,hint:o.hint}))); return (O2[i2]||O2[O2.length-1]).days.sort((a,b)=>a-b); };
  /* 撞時段的提醒（AA_420 第 12 條第 3 點：只有撞到的玩家）*/
  S.clashLine=(G,k,days)=>{ const F=G.flags||{}; if(k==='brunch'&&days.includes(6)&&(F.LAWCLUB_SAT_VISITS|0)>0) return D().clash.brunch;
    if(k==='copy'&&days.includes(4)&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group')) return D().clash.copy; return null; };
  /* 應徵（或出國回來重選班表）：選班表 → 撞時段那一句 → 記下來 */
  S.apply=async function(GM,k,o){ o=o||{}; const G=GM.G, J=S.rec(G); const days=await S.pickDays(GM,k); if(!days) return false;
    let j=J[k]; if(!j||j.gone) j=J[k]={since:G.day,from:now(G),day:[],shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:G.day-1,wk:{},brk:{},ot:{}};
    fix(j); j.day=days; j.since=o.since!=null?o.since:G.day; j.from=o.since!=null?T(o.since,0):now(G);   /* o.since：「下週開始」（補習班、事務所的面試）*/ j.back=false; j.away=false; j.chk=Math.max(j.chk|0,G.day-1); j.missedRun=0; j.missPend=false;
    const c=S.clashLine(G,k,days); if(c) await say(GM,c[0],c[1]);
    if(GM.toast) GM.toast('班表：'+shop(k).short+'　'+S.schedText(k,days),3600);
    if(GM.autosave) GM.autosave(); return true; };

  // ---------- 離開的時候（第 7 條；AA_420 第 15 條）----------
  S.ITEM_FLAG={timer:'WZ_ITEM_TIMER',notebook:'WZ_ITEM_NOTEBOOK',tea:'WZ_ITEM_TEA'};
  S.leave=async function(GM,k,why,pre){ const G=GM.G, j=S.job(G,k); if(!j) return false; const L=D().leave[k];   /* Café、書店沒有「離開的時候」（AA_431 沒寫）：只有辭職那一句 */
    if(pre) await S.play(GM,[pre]); if(L){ await say(GM,L.line[0],L.line[1]);
      G.flags[S.ITEM_FLAG[L.item]]=G.day; if(GM.toast){ const r=D().room[L.item]; if(r) GM.toast('（'+r[0]+'）',2800); } }
    j.gone=why||'quit'; j.quit=G.day; j.pendLeave=false; j.left=G.day; if(GM.autosave) GM.autosave(); return true; };
  S.quitLine=k=>(D().quitLines&&D().quitLines[k])||D().quitLine;   /* Café 的離職那一句（AA_519 3-2）*/
  S.quit=async function(GM,k){ await S.leave(GM,k,'quit',[shop(k).boss,S.quitLine(k)]); };

  // ---------- 一班 ----------
  S.SHIFT_EV=[];      /* 事件：async fn(GM,k,n,ctx)（三段工作之後、薪水之前；四條故事線，src/wzlines3d.js）*/
  S.SHIFT_LINES=[];   /* 多的一句旁白：fn(G,k,n,seg)→[一句…] 或 null（seg：'mid'＝第二段之後、'close'＝收尾之後）*/
  S.AFTER_SHIFT=[];   /* 下班以後：async fn(GM,k,n,ctx) */
  S.season=G=>{ const m=hasCal()?CALENDAR.dateOf(G.day).m:6; return m>=3&&m<=5?'spring':(m>=6&&m<=8?'summer':(m>=9&&m<=11?'autumn':'winter')); };
  S.skillLine=(k,v)=>{ let t=null; for(const [lv,s] of D()[k].skill) if(v>=lv) t=s; return t; };
  const pick=(L,n)=>L[((n-1)%L.length+L.length)%L.length];
  S.missLines=(k,j)=>{ const L=D()[k].miss, x=L[(j.missN|0)%L.length]; return x; };
  S.segs=function(G,k,n){ const P=D()[k]; if(k==='tea') return {a:P.yard[S.season(G)]||P.yard.spring,b:pick(P.mid,n),c:pick(P.close,n)};
    let b=pick(P.mid,n); if(b==='wall'){ const done=!!(G.events&&G.events.done&&G.events.done.ev_wz_c2); b=done?P.wall:pick(P.mid,n+1); }   /* 第 5 格：WZ-C2 那一次以後才有 */
    return {a:pick(P.open,n),b,c:pick(P.close,n)}; };
  const extra=(G,k,n,seg)=>{ const out=[]; for(const f of S.SHIFT_LINES){ try{ const r=f(G,k,n,seg); if(r) out.push(...r); }catch(e){ console.warn('JOBS.SHIFT_LINES',e); } } return out; };
  S.running=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['jobs3d:running']=()=>{ S.running=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.runShift=async function(GM,k){ if(shop(k).x) return S.runShiftX(GM,k); const G=GM.G, j=fix(S.job(G,k)); if(!j||S.running) return false; const s=shop(k), d=G.day, n=(j.shifts|0)+1, ctx={day:d,n};
    S.running=true; GM.sceneBegin();
    try{
      const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P);
      if(G.hour<s.t0){ if(GM.fade) await GM.fade(true); GM.advance(s.t0-G.hour); if(GM.fade) await GM.fade(false); }
      const end=T(d,s.t1), seg=Math.max(0,(end-now(G))/3);
      if(n===1) await S.play(GM,D().first[k]);   /* WZ-B1／C1／T1 */
      if(j.missPend){ await S.play(GM,S.missLines(k,j)); j.missN=(j.missN|0)+1; }   /* 上週沒去（第 6 條）*/
      const sg=S.segs(G,k,n);
      await S.play(GM,sg.a); GM.advance(seg);
      { const sl=S.skillLine(k,j.skill|0); if(sl) await say(GM,null,sl); }   /* 熟練描述（AA_165 1-4／2-5／3-4）*/
      await S.play(GM,sg.b); await S.play(GM,extra(G,k,n,'mid')); GM.advance(seg);
      if(k==='brunch'&&S.natHoliday(d)&&!j.b5) await S.b5(GM,j);   /* WZ-B5 國定假日的班（一次）*/
      await S.play(GM,sg.c);
      if(k==='brunch'&&j.b5next&&j.b5!==d){ await say(GM,null,D().b5.next); j.b5next=false; }   /* WZ-B5 的下一班 */
      await S.play(GM,extra(G,k,n,'close'));
      for(const f of S.SHIFT_EV){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.SHIFT_EV',e); } }
      const rest=end-now(G); if(rest>0) GM.advance(rest);
      const pay=S.wage(d)*(s.t1-s.t0)*(S.natHoliday(d)?2:1); if(GM.money) GM.money(pay); else G.money=(G.money|0)+pay; if(GM.toast) GM.toast(s.short+'的薪水 +'+pay+' 元',2800);
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,s.t0,s.t1);   /* 一班＝那個時段的一件主要的事（AA_420 2-1）*/
      j.shifts=n; j.skill=Math.min(10,(j.skill|0)+1); j.worked.push(d); if(j.worked.length>80) j.worked.splice(0,j.worked.length-80); j.missPend=false; j.missedRun=0; j.lastShift=d;
      if(n===1&&typeof INV!=='undefined'&&INV.addContact){ try{ INV.addContact(G,s.bossId); }catch(e){} }   /* 第一班以後有老闆的聯絡方式（AA_166 第 5 節）*/
      for(const f of S.AFTER_SHIFT){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.AFTER_SHIFT',e); } }
      if(S.lastShift(G,k,d)) await S.leave(GM,k,'grad');   /* 大四下（延畢：大五上）最後一班＝離開的時候 */
    } finally { GM.sceneEnd(); S.running=false; }
    if(GM.autosave) GM.autosave(); return true; };
  /* 最後一學期、之後這學期已經沒有班了 */
  S.lastShift=function(G,k,d){ const t=S.termAt(G,d); if(!t||t.id!==S.finalTerm(G)) return false; const r=CALENDAR.termDays(t.id); if(!r) return false; for(let x=d+1;x<=r.to;x++) if(S.due(G,k,x)) return false; return true; };
  S.b5=async function(GM,j){ const G=GM.G, B=D().b5; await say(GM,B.ask[0],B.ask[1]); await say(GM,'player',S.year(G)>=3?B.y3:B.y12); await say(GM,B.boss[0],B.boss[1]);
    if(GM.addNote) GM.addNote('NOTE_HOLIDAY_WAGE','國定假日的班',''); j.b5=G.day; j.b5next=true; };
  /* 考試週加班（影印店，21:00～24:00；加班不算在每週兩班裡；那天晚上已經做了別的主要活動就不問）*/
  S.otWeek=(G,d)=>{ const t=S.termAt(G,d); return t&&t.exam?t.id+':'+t.week:null; };
  S.otDay=function(G,d){ if(!S.active(G,'copy')) return false; const j=fix(S.job(G,'copy')), wk=S.otWeek(G,d); if(!wk||j.ot[wk]||j.back||S.away(G,d)) return false; const wd=wdOf(d); if(wd===7) return false;   /* 週日公休 */
    if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return false; return true; };
  S.runOT=async function(GM){ const G=GM.G, j=fix(S.job(G,'copy')), s=shop('copy'), wk=S.otWeek(G,G.day); if(!j||S.running) return false; S.running=true; GM.sceneBegin();
    try{ j.ot[wk]='done'; if(G.hour<s.ot.t0) GM.advance(s.ot.t0-G.hour); const n=(j.otN|0)+1; j.otN=n; await S.play(GM,pick(D().copy.ot,n)); const rest=T(G.day,s.ot.t1)-now(G); if(rest>0) GM.advance(rest);
      const pay=S.wage(G.day)*3*(S.natHoliday(G.day)?2:1); if(GM.money) GM.money(pay); else G.money=(G.money|0)+pay; if(GM.toast) GM.toast('加班的薪水 +'+pay+' 元',2800);
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,s.ot.t0,s.ot.t1); }
    finally { GM.sceneEnd(); S.running=false; } if(GM.autosave) GM.autosave(); return true; };

  // ---------- 兩點半 Café 外場、舊路書房的一班（AA_431 第 2 節，企劃線 f00b9e9f1；小事件 AA_289 3-1、3-2）----------
  /* 開始（2026-12-17 以後第一個週六的書店班：老闆「那個女生這學期沒來排班。」；第 1 件小事件 at:'start'）→ 三段工作：每段 熟練 0～4 新手／5 以上熟練 一句旁白 → 小選擇 → 那一句
     → 她在班上的一句（Café 打烊之後＝芷若、書店整理書架之後＝沛珊，輪流）→ 小事件（at:'end'）→ 書店「（你借了一本書回去。）」→ 薪水 784（toast）。
     小事件：第一班演第一件，之後每上兩班演下一件（j.xev＝{done:[id], at:第幾班}）；那一件要的人不在＝等下一個她在的班（沛珊 2026-12-16 以後不會再來：藍色的書跳過）。
     誰在班上：芷若＝Café 兩個班都在，2027-06-04～2028-02（她最後一個班到英國回來，AA_369、AA_431 2-1）、2028-09 以後不在；沛珊＝書店週六的班，到 2026-12-16。
     沒寫的照沒有：上週沒去那一句、放假的私訊、出國回來那一段、離開的時候（辭職照 AA_289「有空回來看看」）。國定假日不加倍（AA_431：四小時 784 元）。
     AA_519 3-2（企劃線 d75cd0228）：Café 補上第一班（D().first.cafe，第一班開始）、沒去（x.cafe.miss，下一班開始）、放假（D().brk.cafe.dm：放假第一天 12:00 一則私訊，這個假照舊先停）、
     出國回來（D().back.cafe；「先不了。」＝離職那一句）、離職（D().quitLines.cafe）；打工第 4 班以後打烊時一次的拉花（src/sup519_3d.js，S.SHIFT_EV，CAFE_LATTE_TRY）*/
  S.withOn=function(G,k,d){ const X=D().x&&D().x[k]; if(!X||!X.with) return false;
    if(X.with==='zr'){ const a=DK('2027-06-04'), b=DK('2028-02-29'), c=DK('2028-09-01'); if(a!=null&&d>=a&&d<=b) return false; if(c!=null&&d>=c) return false; return true; }
    if(X.with==='ps'){ const e=DK('2026-12-16'); return wdOf(d)===6&&(e==null||d<=e); } return false; };
  /* 小事件要的條件：zr／ps＝她在班上（S.withOn）；night＝夜班（過了午夜的班）；tyEve＝颱風假的前一天 */
  S.needOk=(G,k,d,need)=>{ if(!need) return true; if(need==='night') return S.hrs(k,d)[1]>24; if(need==='tyEve') return !!(CALENDAR.typhoon&&CALENDAR.typhoon(d+1)); return S.withOn(G,k,d); };
  S.xEvent=function(G,k,j,n,d){ const X=D().x[k], E=j.xev||(j.xev={done:[],at:0}); if(!Array.isArray(E.done)) E.done=[];
    if(E.done.length&&n-(E.at|0)<2) return null;   /* 每上兩班一件 */
    const e1=DK('2026-12-16'); for(const e of X.ev){ if(E.done.includes(e.id)) continue;
      if(e.need==='ps'&&e1!=null&&d>e1){ E.done.push(e.id); continue; }   /* 沛珊不會再來：跳過 */
      if(!S.needOk(G,k,d,e.need)) continue; return e; }
    return null; };
  S.runShiftX=async function(GM,k){ const G=GM.G, j=fix(S.job(G,k)); if(!j||S.running) return false; const s=shop(k), X=D().x[k], d=G.day, n=(j.shifts|0)+1, ctx={day:d,n}, H0=S.hrs(k,d), wth=S.withOn(G,k,d);
    S.running=true; GM.sceneBegin();
    try{
      const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P);
      if(G.hour<H0[0]){ if(GM.fade) await GM.fade(true); GM.advance(H0[0]-G.hour); if(GM.fade) await GM.fade(false); }
      const end=T(d,H0[1]), seg=Math.max(0,(end-now(G))/3);
      if(k==='books'){ const e1=DK('2026-12-16'); if(wdOf(d)===6&&wth) j.psSeen=d; else if(wdOf(d)===6&&e1!=null&&d>e1&&j.psSeen!=null&&!j.psGone){ j.psGone=d; await say(GM,X.gone[0],X.gone[1]); } }
      if(n===1&&D().first&&D().first[k]) await S.play(GM,D().first[k]);   /* 第一班（Café：AA_519 3-2）*/
      if(j.missPend&&X.miss){ await S.play(GM,X.miss[(j.missN|0)%X.miss.length]); j.missN=(j.missN|0)+1; }   /* 上次沒去（Café：AA_519 3-2）*/
      const ev=S.xEvent(G,k,j,n,d), E=j.xev; const playEv=async()=>{ E.done.push(ev.id); E.at=n; await S.play(GM,ev.lines); };
      if(ev&&ev.at==='start') await playEv();
      for(let i=0;i<X.segs.length;i++){ const sg=X.segs[i]; await say(GM,null,(j.skill|0)>=5?sg.exp:sg.nov);
        const c=await GM.choose(sg.ch.map(o=>({t:o[0]}))), o=sg.ch[c]||sg.ch[0]; const alt=o[2]&&k==='cafe'&&E.done.includes('cafe3'); await say(GM,null,alt?o[2]:o[1]);   /* Café 掃地：「忘記的筆」演過以後換一句 */
        if(wth&&i===X.withAfter){ await say(GM,null,X.withLines[(j.withN|0)%X.withLines.length]); j.withN=(j.withN|0)+1; }
        if(i<X.segs.length-1) GM.advance(seg); }
      if(ev&&ev.at!=='start') await playEv();
      if(ev&&ev.id==='cvs2') G.flags.JOB_CVS=d;   /* 颱風天店長留了兩碗：大四颱風夜（T4a）的回聲讀它 */
      if(X.night&&H0[1]>24){ await say(GM,null,X.night[(j.nightN|0)%X.night.length]); j.nightN=(j.nightN|0)+1; }   /* 夜班的最後一句（輪流）*/
      await S.play(GM,extra(G,k,n,'close'));
      for(const f of S.SHIFT_EV){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.SHIFT_EV',e); } }
      if(X.borrow) await say(GM,null,X.borrow);
      const rest=end-now(G); if(rest>0) GM.advance(rest);
      if(GM.money) GM.money(s.pay); else G.money=(G.money|0)+s.pay; if(GM.toast) GM.toast(s.payToast,2800);
      if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,H0[0],H0[1]);
      j.shifts=n; j.skill=Math.min(10,(j.skill|0)+1); j.worked.push(d); if(j.worked.length>80) j.worked.splice(0,j.worked.length-80); j.missPend=false; j.missedRun=0; j.lastShift=d;
      if(n===1&&typeof INV!=='undefined'&&INV.addContact){ try{ INV.addContact(G,s.bossId); }catch(e){} }
      for(const f of S.AFTER_SHIFT){ try{ await f(GM,k,n,ctx); }catch(e){ console.warn('JOBS.AFTER_SHIFT',e); } }
      if(S.lastShift(G,k,d)) await S.leave(GM,k,'grad');
    } finally { GM.sceneEnd(); S.running=false; }
    if(H0[1]>24) await S.nightSleep(GM,d);
    if(GM.autosave) GM.autosave(); return true; };
  /* 夜班（週五 22:00～02:00）：下班回宿舍睡到隔天 10:00（AA_433 第 1 節「隔天 10:00 以前祐廷在宿舍睡覺，不排別的」；隔天早上的班 S.excused 自動請假）*/
  S.nightSleep=async function(GM,d){ const G=GM.G; G.flags.JOB_NIGHT=d; if(typeof STORY==='undefined'||!STORY.sleepNow) return false; if(GM.E&&GM.E.player&&GM.E.player.busy) return false;
    G.flags.companion=null; if(G.zone!=='dorm'&&GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await STORY.sleepNow(GM,10); return true; };
  /* 客人：Café 點過第 3 次、書店來過第 2 次以後，結帳時老闆開口（AA_431；次數照 EAT 的「店員認得你」那個計數：src/eat3d.js 的 G.eat.n）*/
  S.EAT_KEY={'兩點半 Café':'cafe','舊路書房':'books','公館的便利商店':'cvs'};
  S.zrHere=G=>{ try{ return typeof STORY!=='undefined'&&!!STORY.ladWorking&&STORY.ladWorking(G,'heroine_02')&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_02'))>=SOCIAL.STAGES.indexOf('FAMILIAR'); }catch(e){ return false; } };
  S.visitX=async function(GM,k,key){ const G=GM.G, M=S.rec(G)._meta, A=D().ask[k]; if(!A||S.job(G,k)||M.asked[k]||!S.eligible(G,k)) return false;
    let n=typeof EAT!=='undefined'&&EAT.rec?(EAT.rec(G).n[key]|0):0;
    if(A.late){ const h=G.hour; if(!(h>=22||h<5)) return false; const Lt=M.late||(M.late={}); Lt[k]=(Lt[k]|0)+1; n=Lt[k]; }   /* 便利商店：22:00 以後買東西的次數（AA_433 第 1 節）*/
    if(n<A.n) return false; M.asked[k]=G.day; let c=1;
    GM.sceneBegin(); try{ await say(GM,A.line[0],A.line[1]); if(A.zr&&S.zrHere(G)) await say(GM,A.zr[0],A.zr[1]); c=await GM.choose([{t:A.yes},{t:A.no}]);
      if(c===0) await S.apply(GM,k); else await say(GM,A.noLine[0],A.noLine[1]); } finally { GM.sceneEnd(); }
    return true; };
  if(typeof EAT!=='undefined'&&typeof EAT.ordered==='function'&&!EAT._jobs){ const o0=EAT.ordered; EAT.ordered=async function(GM,key,item){ const r=await o0.apply(this,arguments);
      try{ const k=S.EAT_KEY[key]; if(k&&GM&&GM.G&&law(GM.G)) await S.visitX(GM,k,key); }catch(e){ console.warn('JOBS.visitX',e); } return r; }; EAT._jobs=true; }

  // ---------- 補習班、事務所（AA_433 第 2、3 節）：霖澤館一樓公布欄的徵才單 → 打電話／寄履歷 → 面試 → 選班表；上班是 2D 的出遊 ----------
  /* 公布欄（霖澤館 1F，lv 0，入口玻璃門內側的東牆邊（7.2, 1.2）：樓層簡介的「看」在 (−0.6, −5.85)，不要疊在一起；按鈕的字「看系上的公布欄」是系統字）：補習班大二上第 1 週起、事務所大三上第 1 週起貼；已經在做、面試排好的不列。
     補習班：「打電話問。」→ 班主任（電話）→ 下週一 18:00 面試（出遊，2D）→「改一張考卷給我看。……好，下週開始。」→ 選班表（從下週一起）。
     事務所：「寄履歷。」→ 一週後 14:00 助理私訊 →「可以。」＝下週二、「那天有課，週四可以嗎？」＝下週四 14:00 面談（2D）→ 律師三選一都錄取 →「好。下週開始。」→ 選班表。
     面試沒去（出遊 missed）＝可以重新從公布欄來。存檔：G.jobs._meta.ap2＝{cram|office:{st:'call'|'cv'|'iv', day, iv}}；事務所私訊的回覆 G.flags.JOB_OFFICE_DM（'tue'|'thu'）*/
  S.AP2=['cram','office'];
  S.board2=G=>{ if(!G||!law(G)) return []; const A=S.rec(G)._meta.ap2||{}; return S.AP2.filter(k=>S.eligible(G,k)&&!S.active(G,k)&&!A[k]); };
  /* 公布欄上的兩張徵才單（LAWWW2-B 10-24 fc86f7507：linze_interior.glb 的 L0_WALL_notice_job_cram／_office）：公布欄上有這一家（S.board2）才看得到。
     節點名稱有 WALL_＝會跟著東面淡出（engine3d.js 的 hideFaded 每一格改 Object3D.visible），所以開關用材質的 visible（attachFormal 已經每一片各自複製材質）*/
  S.POSTER={cram:'L0_WALL_notice_job_cram',office:'L0_WALL_notice_job_office'};
  S.posterSync=function(GM){ const E=GM&&GM.E, G=GM&&GM.G, z=E&&E.zone; if(!G||G.zone!=='linze'||!z||!z.formal) return;
    if(!z._jobPosters){ const m={}; const root=z.group||(E.scene); root.traverse(o=>{ for(const k in S.POSTER) if(o.name===S.POSTER[k]) (m[k]=m[k]||[]).push(o); }); z._jobPosters=m; }
    const b=S.board2(G); for(const k in S.POSTER) for(const n of (z._jobPosters[k]||[])) n.traverse(o=>{ if(o.isMesh&&o.material&&!Array.isArray(o.material)) o.material.visible=b.includes(k); }); };
  S.addBoard=function(GM){ const E=GM&&GM.E; if(!E||!Array.isArray(E.interactables)) return null; const Gf=()=>GM.G;
    const it={x:7.2,z:1.2,lv:0,radius:1.0,label:'看系上的公布欄',jobBoard:true,get hidden(){ return !S.board2(Gf()).length; }}; E.interactables.push(it); return it; };
  const monNext=d=>d-(wdOf(d)-1)+7;   /* 下週一 */
  S.board=async function(GM){ const G=GM.G, L=S.board2(G); if(!L.length) return false; const M=S.rec(G)._meta, A=M.ap2||(M.ap2={}); GM.sceneBegin();
    try{ const i=await GM.choose(L.map(k=>({t:D().notice[k]})).concat([{t:'不看了'}])); const k=L[i]; if(!k) return false; const P=D().apply2[k];
      const c=await GM.choose([{t:P.opt},{t:'（不用了）'}]); if(c!==0) return false;
      if(k==='cram'){ await say(GM,P.call[0],P.call[1]); const iv=monNext(G.day); A.cram={st:'iv',day:G.day,iv}; S.planIv(G,'cram',iv,18); }
      else { A.office={st:'cv',day:G.day}; if(typeof PHONE!=='undefined'){ const tag='job_office_dm_'+G.day, th='p:'+shop('office').bossId;
          PHONE.at(G,G.day+7,14,[{th,from:shop('office').bossId,text:P.dm,ask:{id:tag,opts:[{t:P.dmOpts[0],set:{JOB_OFFICE_DM:'tue'}},{t:P.dmOpts[1],set:{JOB_OFFICE_DM:'thu'}}]}}],tag); } }
      return true; } finally { GM.sceneEnd(); } };
  S.planIv=function(G,k,day,h){ if(typeof OUT==='undefined') return; const s=shop(k), P=D().apply2[k]; OUT.plan(G,{id:'job_iv_'+k+'_'+day,ev:'ev_job2d_'+k+'_iv',day,h,late:0.75,place:s.place,title:P.ivTitle,travel:s.travel,travelH:0.25,silent:false}); };
  S.ap2Phone=function(G){ const M=S.rec(G)._meta, A=M.ap2||{}, F=G.flags;
    if(A.office&&A.office.st==='cv'&&F.JOB_OFFICE_DM){ const dm=A.office.day+7, iv=monNext(dm)+(F.JOB_OFFICE_DM==='thu'?3:1); F.JOB_OFFICE_DM=null; A.office={st:'iv',day:A.office.day,iv}; S.planIv(G,'office',iv,14); }
    if(typeof OUT!=='undefined') for(const k of S.AP2){ const a=A[k]; if(!a||a.st!=='iv') continue; const q=OUT.get(G,'job_iv_'+k+'_'+a.iv); if(q&&(q.state==='missed'||q.state==='cancelled')) delete A[k]; } };   /* 面試沒去：可以重新來 */
  /* 面試（2D 事件裡）*/
  S.interview=async function(GM,k){ const G=GM.G, P=D().apply2[k], A=S.rec(G)._meta.ap2||{}; const a=A[k]; if(!a) return false;
    if(k==='cram') await say(GM,P.iv[0],P.iv[1]);
    else { await say(GM,P.q[0],P.q[1]); const c=await GM.choose(P.qOpts.map(t=>({t}))); G.flags.JOB_OFFICE_WHY=(c|0)+1; await say(GM,P.ok[0],P.ok[1]); }
    a.st='done'; const ok=await S.apply(GM,k,{since:monNext(G.day)}); if(!ok) delete A[k]; return ok; };   /* 選班表沒選（名額滿了、先不要）＝可以再從公布欄來 */
  /* 2D 的事件（出遊）：上班、面試。時間：上班照班表（S.runShiftX 走到下班），事件的 hours＝回程 15 分鐘；面試 30 分鐘 */
  S.EV2D=function(){ if(typeof STORY_EVENTS==='undefined') return; for(const k of S.AP2){ const sc=D().x[k].scene;
      if(!STORY_EVENTS.some(e=>e.id==='ev_job2d_'+k)) STORY_EVENTS.push({id:'ev_job2d_'+k,title:shop(k).title,participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:0.25,dialogue:[{scene:sc},{call:async(G,GM)=>{ await S.runShiftX(GM,k); }}]});
      if(!STORY_EVENTS.some(e=>e.id==='ev_job2d_'+k+'_iv')) STORY_EVENTS.push({id:'ev_job2d_'+k+'_iv',title:D().apply2[k].ivTitle,participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:0.5,dialogue:[{scene:sc},{call:async(G,GM)=>{ await S.interview(GM,k); }}]}); } };
  S.EV2D();

  // ---------- 沒去：每一天算過去（不靠出門提醒；睡過去的班也算）----------
  S.track=function(G){ if(!hasCal()) return; for(const k of S.KEYS){ const j=S.job(G,k); if(!j||j.gone) continue; fix(j);
      let d=j.chk==null?(j.since|0)-1:j.chk; const last=G.hour>=S.hrs(k,G.day)[0]+0.75?G.day:G.day-1; let guard=0;
      while(d<last&&guard++<800){ d++; const w=weekOf(d), W=j.wk[w]||(j.wk[w]={s:0,w:0});
        if(S.due(G,k,d)){ W.s++; if(j.worked.includes(d)) W.w++; else j.missPend=true; }
        if(wdOf(d)===7){ if(W.s>0){ if(W.w>0) j.missedRun=0; else j.missedRun=(j.missedRun|0)+1; } delete j.wk[w]; if((j.missedRun|0)>=3){ j.ask3=true; j.missedRun=0; } } }
      j.chk=d; } };

  // ---------- 出門提醒 ----------
  S.GOTO_X={cafe:{x:0,z:4.4,yaw:Math.PI},books:{x:0,z:4.0,yaw:Math.PI},cvs:{x:0,z:3.6,yaw:Math.PI}};   /* Café、書店：門口進去的地方（zones3d.js 的出口內側）*/
  S.goto=k=>{ const s=shop(k); if(S.GOTO_X[k]) return Object.assign({zone:s.zone},S.GOTO_X[k]); const L=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT[k==='copy'?'print':(k==='tea'?'teahouse':'brunch')]:null, sp=L&&L.spawn?L.spawn:{x:0,z:3.5,yaw:Math.PI}; return {zone:s.zone,x:sp.x,z:k==='copy'?Math.min(sp.z,3.3):sp.z,yaw:sp.yaw||Math.PI}; };
  S.plan=function(G){ if(typeof OUT==='undefined'||!hasCal()||!law(G)) return; const d=G.day;
    for(const k of S.KEYS){ if(!S.active(G,k)) continue; const s=shop(k), id='job_'+k+'_'+d, H0=S.hrs(k,d), title=s.hours?s.title+'（'+hm(H0[0])+'～'+hm(H0[1])+'）':s.title;
      if(!OUT.get(G,id)&&S.due(G,k,d)&&!S.worked(G,k,d)&&G.hour<=H0[0]+0.5) OUT.plan(G,Object.assign({id,day:d,h:H0[0],late:0.75,place:s.place,title,travel:s.travel,travelH:0.25,no:'這週請假',job:k,silent:true},s.d2?{ev:'ev_job2d_'+k}:{goto:S.goto(k)})); }   /* 補習班、事務所：2D 的出遊（S.EV2D）*/
    if(S.otDay(G,d)){ const s=shop('copy'), id='job_copyot_'+d; if(!OUT.get(G,id)&&G.hour<s.ot.t0-0.25) OUT.plan(G,{id,day:d,h:s.ot.t0,late:0.5,place:s.place,title:s.ot.title,travel:s.travel,travelH:0.25,no:'不加班',goto:S.goto('copy'),job:'copy',jobOt:true,silent:true}); } };
  /* 撞時段的另一個：週六早午餐＋法服值班（兩個出門提醒）、週四影印＋公法讀書會（讀書會沒有出門提醒，列在影印那一個）*/
  S.plgOn=(G,d)=>{ const F=G.flags||{}; if(!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group)||typeof ACTIVITIES==='undefined') return false; const a=ACTIVITIES.list.find(x=>x.id==='public_law_group'); return !!a&&!!ACTIVITIES.on&&ACTIVITIES.on(a,d,G)&&!(ACTIVITIES.attended&&ACTIVITIES.attended(G,'public_law_group',d)); };
  S.partner=function(G,q){ if(!q||q.state!=='planned'||typeof OUT==='undefined') return null; const L=OUT.rec(G);
    if((q.job==='brunch'||q.job==='books')&&!q.jobOt){ const f=L.find(x=>x.id==='fafu_'+q.day&&x.state==='planned'); return f?{q:f}:null; }   /* 書店週六 10:00～14:00 也撞法服值班（9:00～12:00）*/
    if(/^fafu_/.test(q.id||'')){ const b=L.find(x=>(x.id==='job_brunch_'+q.day||x.id==='job_books_'+q.day)&&x.state==='planned'); return b?{q:b}:null; }
    if((q.job==='copy'||q.job==='cafe')&&!q.jobOt&&wdOf(q.day)===4&&S.plgOn(G,q.day)) return {plg:true};   /* Café 週四 18:00～22:00 也撞公法讀書會（AA_431 2-1）*/
    return null; };
  const tt=t=>typeof OUT!=='undefined'&&OUT.tt?OUT.tt(t):t;
  S.prompt2=async function(GM,q,pr){ const G=GM.G, a=q.job?q:pr.q, b=q.job?pr.q:q; let k=3;
    const hint=x=>[x.place,hm(x.h),x.travel].filter(Boolean).join('　');
    GM.sceneBegin(); try{ const O=[{t:'出發：'+tt(a.title),hint:hint(a)}, pr.plg?{t:'去公法讀書會',hint:'法律系館B 研討室 A　20:00'}:{t:'出發：'+tt(b.title),hint:hint(b)}, {t:'晚一點（20 分鐘後再提醒）'}, {t:'這週都請假'}]; k=await GM.choose(O); } finally { GM.sceneEnd(); }
    const miss=x=>{ if(!x||x.state!=='planned') return; x.state='missed'; if(OUT.onMissed) OUT.onMissed(GM,x); };
    if(k===2){ const t0=now(G)+1/3; a.ask=t0; if(b) b.ask=t0; return 'later'; }
    if(k===0){ if(b) miss(b); await OUT.go(GM,a); return 'go'; }
    if(k===1){ miss(a); if(b) await OUT.go(GM,b); else if(GM.toast) GM.toast('今晚去公法讀書會（20:00，法律系館B 研討室 A）',3600); return pr.plg?'no':'go'; }
    miss(a); if(b) miss(b); return 'no'; };

  // ---------- 寒暑假、三週沒去、出國回來（手機）----------
  S.phone=function(G){ if(typeof PHONE==='undefined'||!hasCal()||!law(G)) return; const F=G.flags; S.track(G); S.tutorPhone(G); S.ap2Phone(G);
    for(const k of S.KEYS){ const j=S.job(G,k); if(!j||j.gone) continue; fix(j); const s=shop(k), id=s.bossId, th='p:'+id;
      /* 私訊的回覆（PHONE.answer 只能設旗標）：搬進 G.jobs */
      { const v=F['WZJOB_BRK_'+k]; if(typeof v==='string'){ const [bk,a]=v.split(':'); if(bk&&a) j.brk[bk]=a; F['WZJOB_BRK_'+k]=null; } }
      if(F['WZJOB_QUIT_'+k]!=null){ F['WZJOB_QUIT_'+k]=null; j.gone='quit'; j.quit=G.day; j.pendLeave=true; }   /* 私訊說不做了：下次走進店裡演離開的時候 */
      if(G.day>S.endDay(G)){ j.gone='grad'; j.quit=G.day; continue; }   /* 最後一班沒來：畢業以後就結束（沒有離開的那一段）*/
      if(S.away(G,G.day)) j.away=true; else if(j.away){ j.away=false; j.back=!!D().back[k]; }   /* Café、書店沒有「回來做」那一段：照原本的班表 */   /* 出國回來：等第一次走進店裡（第 14 條）*/
      const contact=(j.shifts|0)>=1;
      const b=S.breakAt(G,G.day); if(b&&!j.back&&!S.away(G,G.day)&&j.brk[b.key]==null){
        if(!contact) j.brk[b.key]='stop';   /* 還沒有聯絡方式：這個假先停 */
        else if(!D().brk[k]) j.brk[b.key]='stop';   /* 書店、便利商店：放假的私訊沒有寫（AA_431）＝這個假先停 */
        else if(D().brk[k].dm){ j.brk[b.key]='stop'; const tag='jobbrk_'+k+'_'+b.key; if(!PHONE.sent(G,tag)) PHONE.at(G,b.from,12,[{th,from:id,text:D().brk[k].dm}],tag); }   /* Café（AA_519 3-2）：老闆只有一句、不問來不來＝這個假照舊先停 */
        else { const tag='jobbrk_'+k+'_'+b.key, B=D().brk[k]; if(!PHONE.sent(G,tag)) PHONE.at(G,b.from,12,[{th,from:id,text:B.ask,ask:{id:tag,until:T(b.to+1,0),opts:[{t:'來。',say:[{th,from:id,text:B.go}],set:{['WZJOB_BRK_'+k]:b.key+':go'}},{t:'放假先停。',say:[{th,from:id,text:B.stop}],set:{['WZJOB_BRK_'+k]:b.key+':stop'}}]}}],tag); } }
      if(j.ask3&&contact&&!j.back){ j.ask3=false; const tag='job3_'+k+'_'+G.day; PHONE.at(G,G.day,Math.max(G.hour,12),[{th,from:id,text:D().stillAsk,ask:{id:tag,opts:[{t:'（繼續做）',post:false},{t:'（辭職）',post:false,say:[{th,from:id,text:S.quitLine(k)}],set:{['WZJOB_QUIT_'+k]:G.day}}]}}],tag); } } };

  // ---------- 走進店裡：出國回來那一句、當面問「還要做嗎？」、私訊辭職的離開 ----------
  S.ENTER=[];   /* 事件包：{due(G,k)→true＝要演, run:async (GM,k)}（例：線一 1-5 結果、線二 2-6 搬走以後蘇姨那一句）*/
  S.enterDue=function(G,k){ const j=S.job(G,k); if(j&&j.pendLeave) return true; if(j&&!j.gone&&(j.back||(j.ask3&&(j.shifts|0)===0))) return true;
    for(const e of S.ENTER){ try{ if(e.due(G,k)) return true; }catch(err){ console.warn('JOBS.ENTER',err); } } return false; };
  S.onEnter=async function(GM,k){ const G=GM.G, j=S.job(G,k);
    if(j&&j.pendLeave){ await S.leave(GM,k,j.gone||'quit'); return true; }
    if(j&&!j.gone&&j.back&&!D().back[k]){ j.back=false; return false; }   /* Café、書店：出國回來沒有寫那一段＝照原本的班表 */
    if(j&&!j.gone&&j.back){ const B=D().back[k]; let c=1; GM.sceneBegin(); try{ await S.play(GM,B.lines); c=await GM.choose([{t:'「回來做。」'},{t:'「先不了。」'}]); } finally { GM.sceneEnd(); }
      if(c===0){ j.back=false; GM.sceneBegin(); try{ if(!await S.apply(GM,k)){ j.day=[]; } } finally { GM.sceneEnd(); } }
      else { j.back=false; GM.sceneBegin(); try{ await S.leave(GM,k,'quit',B.no||[shop(k).boss,S.quitLine(k)]); } finally { GM.sceneEnd(); } }   /* Café 沒有另外的一句：離職那一句（AA_519 3-2）*/
      return true; }
    if(j&&!j.gone&&j.ask3&&(j.shifts|0)===0){ j.ask3=false; let c=0; GM.sceneBegin(); try{ await say(GM,shop(k).boss,D().stillAsk); c=await GM.choose([{t:'（繼續做）'},{t:'（辭職）'}]); if(c===1) await S.quit(GM,k); } finally { GM.sceneEnd(); } return true; }
    for(const e of S.ENTER){ try{ if(e.due(G,k)){ await e.run(GM,k); return true; } }catch(err){ console.warn('JOBS.ENTER',err); } }
    return false; };

  // ---------- 客人：來過幾次、老闆開口 ----------
  S.AFTER_VISIT=[];   /* 客人買完：async fn(GM,k,o)→true＝演了（o.bought、o.kind）（線二：週六下午來喝茶的玩家也遇得到呂老師）*/
  S.visit=async function(GM,k,kind,bought){ const G=GM.G, M=S.rec(G)._meta; if(bought){ M.n[k]=(M.n[k]|0)+1; if(k==='tea'&&wdOf(G.day)===6&&G.hour>=12&&G.hour<18) M.n.teaSat=(M.n.teaSat|0)+1; }
    for(const f of S.AFTER_VISIT){ try{ if(await f(GM,k,{bought,kind})) return true; }catch(e){ console.warn('JOBS.AFTER_VISIT',e); } }
    if(bought&&!S.job(G,k)&&!M.asked[k]&&S.eligible(G)&&(M.n[k]|0)>=D().ask[k].n){ M.asked[k]=G.day; const A=D().ask[k]; let c=1;
      GM.sceneBegin(); try{ await say(GM,A.line[0],A.line[1]); c=await GM.choose([{t:'（應徵）'},{t:'（先不要）'}]); if(c===0) await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }
    return false; };

  // ---------- 店裡的按鈕（STORY.populate）----------
  S.deskLabel=(G,k)=>{ if(!S.job(G,k)){ if(k==='copy') return '跟阿德說想打工'; return '應徵：'+D().notice[k]; } if(S.shiftNow(G,k)) return '開始上班'; return '找'+shop(k).boss; };
  S.deskHidden=(G,k)=>{ if(!G||!law(G)) return true; const j=S.job(G,k); if(!j) return !S.eligible(G,k)||(k==='copy'&&!S.rec(G)._meta.asked.copy); return !!j.gone&&!j.pendLeave; };
  S.addDesk=function(GM,zoneId){ const k=S.ZONE_KEY[zoneId], E=GM&&GM.E; if(!k||!E||!Array.isArray(E.interactables)) return null; const s=shop(k), Gf=()=>GM.G;
    const it={x:s.desk.x,z:s.desk.z,radius:1.0,wzJob:k,get label(){ return S.deskLabel(Gf(),k); },get hidden(){ return S.deskHidden(Gf(),k); }}; E.interactables.push(it); return it; };
  S.desk=async function(GM,k){ const G=GM.G, j=S.job(G,k);
    if(!j){ GM.sceneBegin(); try{ await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }
    if(j.pendLeave){ GM.sceneBegin(); try{ await S.leave(GM,k,j.gone||'quit'); } finally { GM.sceneEnd(); } return true; }
    if(j.gone) return true;
    if(S.shiftNow(G,k)) return S.runShift(GM,k);
    if(!fix(j).day.length){ GM.sceneBegin(); try{ await S.apply(GM,k); } finally { GM.sceneEnd(); } return true; }   /* 出國回來選了「回來做。」卻沒選班表 */
    let c=1; GM.sceneBegin(); try{ c=await GM.choose([{t:'（辭職）',hint:'班表：'+S.schedText(k,fix(j).day)},{t:'（算了）'}]); if(c===0) await S.quit(GM,k); } finally { GM.sceneEnd(); }
    return true; };

  // ---------- 每一格（STORY.TICKS）----------
  let lastZone=null, planT=-1;
  S.busy=GM=>{ const E=GM.E; return S.running||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||!!(E&&E.player&&E.player.busy)||(typeof EVENTS!=='undefined'&&!!EVENTS.running); };
  S.tick=function(GM){ const G=GM&&GM.G; if(G&&G.zone==='linze'){ try{ S.posterSync(GM); }catch(e){ console.warn('JOBS.poster',e); } } if(!G||!law(G)||!hasCal()) return false;
    const t=Math.floor(now(G)*4); if(t!==planT){ planT=t; try{ S.track(G); S.plan(G); }catch(e){ console.warn('JOBS.plan',e); } }
    const k=S.ZONE_KEY[G.zone]; const entered=G.zone!==lastZone; lastZone=G.zone;
    if(!k||S.busy(GM)) return false;
    if((entered||S._enterPend)&&S.enterDue(G,k)){ S._enterPend=false; S.running=true; S.onEnter(GM,k).catch(e=>console.warn('JOBS.onEnter',e)).finally(()=>{ S.running=false; }); return true; }
    S._enterPend=false;
    if(S.shiftNow(G,k)){ S.runShift(GM,k).catch(e=>console.warn('JOBS.runShift',e)); return true; }   /* 走進店裡、班的時間到了就開班 */
    if(k==='copy'&&S.otNow(G)){ S.runOT(GM).catch(e=>console.warn('JOBS.runOT',e)); return true; }
    return false; };
  S.otNow=G=>{ if(typeof OUT==='undefined') return false; const q=OUT.get(G,'job_copyot_'+G.day); if(!q||q.state!=='done') return false; const j=S.job(G,'copy'), wk=S.otWeek(G,G.day); return !!j&&!!wk&&j.ot[wk]!=='done'&&G.hour>=20.5&&G.hour<22; };

  // ---------- 房間物件（AA_420 第 9 節；STORY.ROOM_EXTRA）----------
  /* 房間裡現在有哪幾件（key 照 WZ_JOBS_DATA.room）：文字（S.room）和 3D 模型（zones3d.js 的 dorm_wz_items.glb，節點 ITEM_wz_<key>）都照這一份 */
  S.roomKeys=function(G){ const F=(G&&G.flags)||{}, K=[]; if(F.WZ_ITEM_TIMER) K.push('timer'); if(F.WZ_ITEM_NOTEBOOK) K.push('notebook'); if(F.WZ_ITEM_TEA&&!F.WZ_TEA_GIVEN) K.push('tea');
    if(F.WZ_CARD) K.push('card'); if(F.WZ_YE_DONE) K.push('board'); if(F.WZ_POSTER_ITEM) K.push('poster'); return K; };
  S.room=function(G,L){ const R=D().room; for(const k of S.roomKeys(G)) L.push(R[k].slice()); };

  // ---------- 家教（AA_163 第 2 節，企劃線 a06d3f545；V2-B32）＋補一件（AA_289 3-3「考卷的背面」）----------
  /* 家教的事件還是 data/events.js 的 ev_tutor_lesson（第 1～3 堂的內容、TUTOR_N＝上過幾堂）；排課、規則、多的台詞在這裡（story3d.js 原本只排大一下的最小版：有 JOBS 就讓給這裡，JOBS.TUTOR_PLAN）。
     ①週二或週四（TUTOR_WD）19:00～21:00，學生家在溫州街；出門提醒「出發」／「這週請假」。
     ②大一下（從答應那天以後）、大二上、大二下：寒暑假停；大二上、大二下開學第一天 12:00 明軒私訊「家長問你這學期還來嗎」——「來」＝這學期照排、「不了」＝停（明軒回 AA_163 停的那一句）；
       期末考週停（AA_163 a06d3f545「第 16 週」，CALENDAR exam 'final'），前一週（第 15 週）那一堂結尾學生的媽媽一句；國定假日、颱風假不排；
       會考（2027-05-15、16；AA_163「2027 年 5 月中旬，照當年公告的會考日期」）前的那一堂是最後一堂（學生一句），5/16 21:00 學生的訊息，家教結束（TUTOR_DONE）。
     ③沒去（「這週請假」或過了時間）：不扣分、不改關係；下一堂開場一句（三句輪流；換學期就不說）；連續三週沒去＝明軒私訊「還要做」／「先停」（一段連續只問一次）。
     ④第 4 堂（TUTOR_N 3）「為什麼要念法律」：三選一＝TUTOR_WHY 1～3、筆記「我認識的人：家教的學生」。⑤每堂結束 +1,200 元（toast「家教費 1,200 元」）。
     ⑥第 6 堂以後第一次（TUTOR_N≥5）：AA_289 3-3 考卷背面的貓法官＋那天晚上滷味攤明軒一句（TUTOR_DRAW、TUTOR_DRAW_ANS）。
     沒做：AA_163「玩家隨時可以不做：手機傳訊息給明軒，選『家教我想先停』」——手機沒有讓玩家主動選這一句的地方（傳訊息的話題在 msg3d.js）；停只有三週沒去、開學問的那兩個時候。
     存檔（G.flags）：TUTOR_TERM_Y2S1／TUTOR_TERM_Y2S2（'go'｜'stop'）、TUTOR_MISS_RUN、TUTOR_MISS_N、TUTOR_MISS_PEND（沒去那一堂的學期）、TUTOR_ASK3（回覆）、TUTOR_ASK3_SENT、
       TUTOR_STOP（停的那一天）、TUTOR_DONE（會考後學生傳訊息那一天）、TUTOR_WHY；出遊 tutor_<天> 的 tutorSeen＝算過有沒有去。舊存檔沒有＝照大一下開始的狀態 */
  S.TUTOR_PLAN=true;
  S.TUTOR_TERMS=['Y1S2','Y2S1','Y2S2'];
  const TU=()=>D()&&D().tutor;
  const dayKey=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const MX='classmate_mingxuan', mxMsg=t=>({th:'p:'+MX,from:MX,text:t});
  S.tutorKK=()=>TU()?dayKey(TU().kaokao):null;
  S.tutorStopped=G=>{ const F=(G&&G.flags)||{}; return F.TUTOR_STOP!=null||F.TUTOR_DONE!=null; };
  S.tutorEnded=G=>{ if(S.tutorStopped(G)) return true; const kk=S.tutorKK(); return kk!=null&&!!G&&G.day>=kk; };   /* 停了、會考以後（大三起一律沒有家教：home3d.js、r2y3b3d.js 讀 JOBS.at）*/
  S.tutorTermOk=(G,tid)=>{ const F=G.flags||{}; return S.TUTOR_TERMS.includes(tid)&&(tid==='Y1S2'||F['TUTOR_TERM_'+tid]==='go'); };
  S.tutorOn=(G,d)=>{ const F=(G&&G.flags)||{}; if(!F.JOB_TUTOR||S.tutorEnded(G)||!hasCal()) return false; if(d==null) d=G.day; const t=CALENDAR.termOf(d); if(!t||!S.tutorTermOk(G,t.id)) return false; const kk=S.tutorKK(); return kk==null||d<kk; };
  /* 這一天能不能上課：有在上的學期、不是期末考週、不是國定假日或颱風假、會考以前、答應那天以後 */
  S.tutorDayOk=(G,d)=>{ if(!S.tutorOn(G,d)) return false; const t=CALENDAR.termOf(d); if(t.exam==='final') return false; if(CALENDAR.holiday(d)||(CALENDAR.typhoon&&CALENDAR.typhoon(d))) return false; return !(t.id==='Y1S2'&&d<=((G.flags.tutorFromDay)|0)); };
  S.tutorPlan=function(G){ const F=G.flags; if(!F.JOB_TUTOR||typeof OUT==='undefined'||!hasCal()) return; const U=TU(); if(!U) return;
    for(const q of OUT.rec(G)) if(/^tutor_/.test(q.id)&&q.state==='planned'&&!S.tutorDayOk(G,q.day)) q.state=S.tutorEnded(G)?'cancelled':'skipped';   /* 停了、期末考週、學期以後（舊存檔排的）*/
    const T=CALENDAR.termOf(G.day); if(!T||!S.tutorOn(G)||typeof STORY==='undefined'||!STORY.termDayIn) return; const wd=F.TUTOR_WD===4?4:2, LW=STORY.termWeeks?STORY.termWeeks(T.id):16;
    for(let w=T.week;w<=LW;w++){ const d=STORY.termDayIn(T.id,w,wd); if(d==null||d*24+19<G.day*24+G.hour||!S.tutorDayOk(G,d)) continue; const id='tutor_'+d, q0=OUT.get(G,id); if(q0){ if(q0.state==='planned') break; continue; }   /* 這週的已經上過／沒去＝看下一週 */
      OUT.plan(G,{id,ev:'ev_tutor_lesson',day:d,h:19,place:U.place,title:'家教',travel:U.travel,travelH:1/6,no:U.no,back:'家教結束。',tutor:true}); break; } };
  /* 出遊的結果（去了／沒去）照日子算一次：沒去＝下一堂的開場一句、連續三週＝明軒私訊 */
  S.tutorTrack=function(G){ const F=G.flags; if(typeof OUT==='undefined') return; const U=TU(); if(!U) return;
    if(F.TUTOR_ASK3==='stop'){ F.TUTOR_ASK3=null; if(F.TUTOR_STOP==null) F.TUTOR_STOP=G.day; }
    else if(F.TUTOR_ASK3==='go'){ F.TUTOR_ASK3=null; F.TUTOR_MISS_RUN=0; F.TUTOR_ASK3_SENT=false; }
    for(const tid of ['Y2S1','Y2S2']) if(F['TUTOR_TERM_'+tid]==='stop'&&F.TUTOR_STOP==null) F.TUTOR_STOP=G.day;
    const L=OUT.rec(G).filter(q=>/^tutor_/.test(q.id)&&!q.tutorSeen&&(q.state==='missed'||q.state==='done')).sort((a,b)=>a.day-b.day);
    for(const q of L){ q.tutorSeen=true; if(q.state==='done'){ F.TUTOR_MISS_RUN=0; F.TUTOR_ASK3_SENT=false; continue; }
      F.TUTOR_MISS_RUN=(F.TUTOR_MISS_RUN|0)+1; const t=CALENDAR.termOf(q.day); F.TUTOR_MISS_PEND=t?t.id:null; }
    if((F.TUTOR_MISS_RUN|0)>=3&&!F.TUTOR_ASK3_SENT&&!S.tutorEnded(G)&&typeof PHONE!=='undefined'){ F.TUTOR_ASK3_SENT=true; const tag='tutor_ask3_'+G.day;
      PHONE.at(G,G.day,Math.max(G.hour,21),[Object.assign(mxMsg(U.ask3),{ask:{id:tag,opts:[{t:U.ask3Opts[0],set:{TUTOR_ASK3:'go'}},{t:U.ask3Opts[1],say:[mxMsg(U.stopReply)],set:{TUTOR_ASK3:'stop'}}]}})],tag); } };
  /* 大二上、大二下開學第一天 12:00：「家長問你這學期還來嗎」（上一個學期還在上的才問）*/
  S.tutorTermAsk=function(G){ const F=G.flags, U=TU(); if(!U||!F.JOB_TUTOR||S.tutorEnded(G)||typeof PHONE==='undefined') return; const T=CALENDAR.termOf(G.day); if(!T||(T.id!=='Y2S1'&&T.id!=='Y2S2')) return;
    if(F['TUTOR_TERM_'+T.id]!=null) return; if(T.id==='Y2S2'&&F.TUTOR_TERM_Y2S1!=='go') return; const kk=S.tutorKK(); if(kk!=null&&G.day>=kk) return;
    const R=CALENDAR.termDays(T.id), tag='tutor_term_'+T.id; if(!R||PHONE.sent(G,tag)) return; const late=G.day>R.from;
    PHONE.at(G,late?G.day:R.from,late?Math.max(G.hour,12):12,[Object.assign(mxMsg(U.termAsk),{ask:{id:tag,until:(R.to+1)*24,opts:[{t:U.termOpts[0],set:{['TUTOR_TERM_'+T.id]:'go'}},{t:U.termOpts[1],say:[mxMsg(U.stopReply)],set:{['TUTOR_TERM_'+T.id]:'stop'}}]}})],tag); };
  /* 會考以後：學生的訊息，家教結束（大二下還在上的）*/
  S.tutorEnd=function(G){ const F=G.flags, U=TU(), kk=S.tutorKK(); if(!U||kk==null||!F.JOB_TUTOR||S.tutorStopped(G)||G.day<kk||F.TUTOR_TERM_Y2S2!=='go'||typeof PHONE==='undefined') return;
    F.TUTOR_DONE=kk+1; if(!PHONE.sent(G,'tutor_done')) PHONE.at(G,kk+1,21,[{th:'p:'+U.kid.id,from:U.kid.id,text:U.doneMsg}],'tutor_done'); };
  S.tutorPhone=function(G){ if(!G||!G.flags||!G.flags.JOB_TUTOR) return; S.tutorTrack(G); S.tutorTermAsk(G); S.tutorEnd(G); S.tutorPlan(G); };
  S.tutorDrawDue=G=>{ const F=(G&&G.flags)||{}, T=TU(); return !!T&&!!F.JOB_TUTOR&&F.TUTOR_DRAW==null&&(F.TUTOR_N|0)>=T.drawAfter; };
  const sayAs=(GM,w,t)=>GM.say(w?{name:w}:null,t);
  /* 一堂的開頭（場景字幕之後）：上週沒去的那一句 */
  S.tutorOpen=async function(G,GM){ const F=G.flags, U=TU(); if(!U||!F.TUTOR_MISS_PEND) return; const t=CALENDAR.termOf(G.day), same=!!t&&t.id===F.TUTOR_MISS_PEND; F.TUTOR_MISS_PEND=null; if(!same) return;
    const L=U.miss[(F.TUTOR_MISS_N|0)%U.miss.length]; F.TUTOR_MISS_N=(F.TUTOR_MISS_N|0)+1; await sayAs(GM,L[0],L[1]); };
  /* 一堂的結尾：第 4 堂的問題 → 會考前最後一堂 → 期末考週前一堂 → 第 6 堂以後的考卷背面 → 家教費 */
  S.tutorClose=async function(G,GM,e){ const F=G.flags, U=TU(); if(!U) return; const n=F.TUTOR_N|0, t=CALENDAR.termOf(G.day), kk=S.tutorKK();
    if(n===3&&F.TUTOR_WHY==null){ await sayAs(GM,'國中生',U.why.ask); const k=await GM.choose(U.why.opts.map(o=>({t:'「'+o+'」'}))); const i=Math.max(0,Math.min(2,k|0)); F.TUTOR_WHY=i+1;
      await sayAs(GM,'國中生',U.why.reply); if(GM.addNote) GM.addNote(U.why.note.id,U.why.note.title,U.why.note.pre+U.why.opts[i]+U.why.note.post); }
    if(t&&kk!=null&&G.day<kk&&G.day+7>=kk) await sayAs(GM,'國中生',U.lastLesson);
    if(t&&typeof STORY!=='undefined'&&STORY.termWeeks&&t.week===STORY.termWeeks(t.id)-1) await sayAs(GM,U.examStop[0],U.examStop[1]);
    if(S.tutorDrawDue(G)&&typeof EVENTS!=='undefined'&&EVENTS.runLines){ F.TUTOR_DRAW=G.day; await EVENTS.runLines(U.draw,e); }
    if(GM.money) GM.money(U.pay); else G.money=(G.money|0)+U.pay; if(GM.toast) GM.toast(U.payToast,2800); };
  S.patchTutor=function(){ if(typeof STORY_EVENTS==='undefined') return false; const ev=STORY_EVENTS.find(e=>e.id==='ev_tutor_lesson'); if(!ev||!Array.isArray(ev.dialogue)||ev._aa289) return false; ev._aa289=true;
    const i=ev.dialogue.findIndex(l=>l.scene!==undefined); ev.dialogue.splice(i+1,0,{call:async(G,GM)=>{ await S.tutorOpen(G,GM); }});
    ev.dialogue.push({call:async(G,GM,e)=>{ await S.tutorClose(G,GM,e||ev); }}); return true; };
  S.patchTutor();

  // ---------- 接線 ----------
  if(typeof PORTRAIT_ONLY!=='undefined'){ for(const k of S.KEYS){ const s=D()&&shop(k); if(s&&!PORTRAIT_ONLY[s.bossId]) PORTRAIT_ONLY[s.bossId]={id:s.bossId,name:s.contact||s.boss,alias:[],gender:k==='brunch'||k==='tea'?'f':'m'}; } const K=D()&&D().tutor&&D().tutor.kid; if(K&&!PORTRAIT_ONLY[K.id]) PORTRAIT_ONLY[K.id]={id:K.id,name:K.name,alias:[],gender:'m'}; }   /* 手機聯絡人的名字（只登錄名字，同 sideq3d.js）*/
  if(typeof OUT!=='undefined'&&OUT.prompt&&!OUT._jobs){ const p0=OUT.prompt; OUT.prompt=async function(GM,q){ const G=GM&&GM.G;
      if(G&&q&&q.jobOt){ const R=typeof CLS!=='undefined'&&CLS.slotRec?CLS.slotRec(G):null; if(R&&(R.used.ev|0)>0){ q.state='cancelled'; return 'no'; } }   /* 那天晚上已經做了別的主要活動：阿德不問（AA_420 2-1）*/
      const pr=G?S.partner(G,q):null; let r;
      if(pr) r=await S.prompt2(GM,q,pr); else r=await p0.apply(this,arguments);
      if(G&&q&&q.jobOt&&r==='no'){ const j=S.job(G,'copy'), wk=S.otWeek(G,q.day); if(j&&wk) fix(j).ot[wk]='no'; }
      if(G&&q&&q.job&&r==='go') S._enterPend=true;
      return r; }; OUT._jobs=true; }
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(S.tick);
    if(STORY.PHONE_RULES) STORY.PHONE_RULES.push(S.phone);
    if(STORY.ROOM_EXTRA) STORY.ROOM_EXTRA.push(S.room);
    if(STORY.populate&&!STORY._jobsPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(S.ZONE_KEY[zoneId]) S.addDesk(GM,zoneId); if(zoneId==='linze') S.addBoard(GM); }catch(e){ console.warn('JOBS.populate',e); } return r; }; STORY._jobsPop=true; }
    if(STORY.interact&&!STORY._jobsInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.wzJob&&G) return S.desk(GM,it.wzJob);
        if(it&&it.jobBoard&&G) return S.board(GM);   /* 霖澤館一樓公布欄（補習班、事務所）*/
        const cust=it&&G&&it.wzShop&&((it.wzShop==='brunch'&&it.kind==='cashier')||(it.wzShop==='print'&&it.kind==='print')||(it.wzShop==='teahouse'&&it.kind==='tea'));
        const m0=G?G.money|0:0; const r=await o0.apply(this,arguments);
        if(cust){ try{ await S.visit(GM,S.key(it.wzShop),it.kind,(G.money|0)<m0); }catch(e){ console.warn('JOBS.visit',e); } }
        return r; }; STORY._jobsInteract=true; } }
  return S;
})();
if(typeof window!=='undefined') window.JOBS=JOBS;
