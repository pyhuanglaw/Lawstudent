/* 大四下被當的延畢（D14-T5B；AA_421 第 1 節，企劃線 42c87f4f，AA-B 2026-10-23；台詞一字不改）
   - 誰：2029-06-18 大四下成績單（CLS.showGrades 'Y4S2'）出來的那一刻，大四下有一門不及格（含大四下的重修又被當；照 classes3d.js 的被當規則）。
     記 FAIL_DELAY_COURSES＝[課 id…]；沒有交換的記 FAIL_DELAY＝true（交換路線又被當的：本來就延畢，只是大五上多那一門重修）。
   - 從那一刻起 PG.delayed 成立（2029 不考、2030 問報名、日期卡照延畢）；「只屬於交換」的句子用 PG.exchDelayed 擋（postgrad3d.js、termend3d.js、r2y4b3d.js、y5s1_3d.js）。
     6/2 典禮照一般畢業生（那天沒有人知道，包括他自己）；6/3～6/17 的日期卡照一般畢業生。
   - 6/18 成績單之後：旁白兩句；已經報名 2029 國考的多一句、BAR_REG＝false；22:00 阿哲私訊兩則。
   - 大五上：重修那一門在原本的時段（衝堂換時段），今日頁、家裡選單「重修：{課名}」＋一鍵上課（y5s1_3d.js 的 classItems 讀 FD.items）；
     第一次上課，課名字卡後面老師一句；沒有期末考，及格＝出席三堂以上（12/24 算）。不到三堂：證書延到 2030-06（FAIL_DELAY_CERT）；
     AA_471 第 5 節：12/26（三）09:00 旁白兩句、2030-06-17（一）10:00 系辦領證書（PG.STEPS fd_late_note、fd_late_cert；6 月的日期卡 06-18 起）。
   - 畢業後篇的成績單：大四下的成績在 6/18 一定要發（PG 的跳日期停在 6/18 09:00；CLS.morning 已經發過就不再發）。 */
const FD=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const exch=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G);
  S.LINES={ fail:'（{課名}，不及格。）', cert:'（證書要等下學期。九月，你要回學校重修。）', bar:'（今年的國考，考不成了。明年再報。）',
    zhe:['聽說了','九月我還在總圖 B1 你來，我幫你占位子'], teacher:'延畢的同學，期末交一份報告就好。……課要來。',
    plan1:'（這學期，只要重修{課名}。其他的日子——）', plan2:'（這學期，要重修兩門課。其他的日子——）',
    lateNote:['（{課名}的重修，出席不到三堂。）','（證書，要等到六月。）'], lateCert:'延了兩個學期。……這次是真的恭喜。' };   /* AA_471 第 5 節（企劃線 763993620）：12/26（三）09:00 旁白兩句；2030-06-17（一）10:00 系辦助教那一句 */
  S.on=G=>law(G)&&!!(G.flags&&G.flags.FAIL_DELAY);   /* 被當延畢（沒有交換）*/
  S.courses=G=>{ const L=G&&G.flags&&G.flags.FAIL_DELAY_COURSES; return Array.isArray(L)?L:[]; };
  const course=id=>typeof CLS!=='undefined'&&CLS.byId?CLS.byId(id):(typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(c=>c.id===id):null);
  S.cname=id=>{ const c=course(id); return c?String(c.name).replace(/（重修）/g,''):id; };   /* 「{課名}」不寫「（重修）」*/
  S.names=G=>S.courses(G).map(S.cname).join('、');
  S.fill=(G,t)=>String(t).replace(/\{課名\}/g,S.names(G));
  S.lp=G=>S.courses(G).includes('legal_practice');   /* 被當的是法律實習：週二實習照交換那一版（這門課現在不會被當：不是考試的課、也不看出席）*/
  S.certLate=G=>!!(G&&G.flags&&G.flags.FAIL_DELAY_CERT);
  /* ---------- 6/18 成績單 ---------- */
  S.check=async function(GM,o){ o=o||{}; const G=GM.G, F=G.flags; if(!law(G)||F.FAIL_DELAY_COURSES!=null||typeof CLS==='undefined'||!CLS.failedIn) return false;
    const fails=CLS.failedIn(G,'Y4S2'); F.FAIL_DELAY_COURSES=fails.map(c=>c.id); if(!fails.length) return false;
    if(exch(G)) return true;   /* 交換路線又被當：大五上多那一門重修，其他照交換版 */
    F.FAIL_DELAY=true; F.FAIL_DELAY_DAY=G.day;
    const bar=F.BAR_REG===true; if(bar) F.BAR_REG=false;
    if(!o.inScene) GM.sceneBegin(); try{ await GM.say(null,S.fill(G,S.LINES.fail)); await GM.say(null,S.LINES.cert); if(bar) await GM.say(null,S.LINES.bar); } finally { if(!o.inScene) GM.sceneEnd(); }
    if(typeof PHONE!=='undefined'&&(typeof STORY==='undefined'||!STORY.knows||STORY.knows('zhe',G))) PHONE.at(G,G.day,22,S.LINES.zhe.map(t=>({th:'p:zhe',from:'zhe',text:t})),'fd_zhe');
    return true; };
  /* ---------- 大五上的重修（y5s1_3d.js 的 classItems 接這裡）---------- */
  S.slots=function(G){ const out=[], used={}; const ORDER=['am','pm1','pm2'];
    for(const id of S.courses(G)){ if(id==='legal_practice') continue; const c=course(id); if(!c) continue; const ss=(c.slots&&c.slots.length?c.slots:[{wd:1,block:'am'}]);
      for(const s0 of ss){ let s={wd:s0.wd,block:s0.block}; if(used[s.wd+':'+s.block]){ const alt=ORDER.find(b=>!used[s.wd+':'+b]); if(alt) s={wd:s.wd,block:alt}; }   /* 衝堂：同一天換時段 */
        used[s.wd+':'+s.block]=1; out.push({c,slot:s}); } }
    return out; };
  S.items=function(G,day){ if(typeof Y5==='undefined'||!Y5.term) return []; const d=day==null?G.day:day, t=Y5.term(G,d); if(!t||typeof CALENDAR==='undefined'||CALENDAR.holiday(d)||!S.courses(G).length) return [];
    const wd=CALENDAR.dateOf(d).wd, B=(typeof COURSES!=='undefined'&&COURSES.blocks)||{}, out=[];
    for(const x of S.slots(G)){ if(x.slot.wd!==wd) continue; const b=B[x.slot.block]||{t0:9+10/60,t1:12+10/60}; out.push({key:d+':'+x.c.id,c:x.c,label:'重修：'+S.cname(x.c.id),t0:b.t0,t1:b.t1,day:d,week:t.week,term:'Y5S1',slot:x.slot,bg:'classroom_small',fd:true}); }
    return out; };
  S.attended=(G,id)=>{ const R=G.y5&&G.y5.cls; if(!R) return 0; let n=0; for(const k in R){ const p=k.split(':'); if(p[1]===id&&R[k]) n++; } return n; };
  S.firstLine=function(G,it){ const F=G.flags, L=F.FD_TEACHER||(F.FD_TEACHER={}); if(!it||!it.fd||L[it.c.id]) return null; L[it.c.id]=G.day; return S.LINES.teacher; };
  /* 12/24：重修過了沒（出席三堂以上）*/
  S.result=function(G){ const F=G.flags; if(F.FAIL_DELAY_PASS!=null||!S.courses(G).length) return; const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y5S1'):null; if(!r||G.day<=r.to) return;
    const att=typeof CLS!=='undefined'&&CLS.ATT_PASS?CLS.ATT_PASS:3, ok=S.courses(G).filter(id=>id!=='legal_practice').every(id=>S.attended(G,id)>=att); F.FAIL_DELAY_PASS=ok; if(!ok&&S.on(G)) F.FAIL_DELAY_CERT='2030-06'; };
  /* ---------- AA_471 第 5 節：重修不到三堂（證書延到六月）——12/26（三）09:00 旁白兩句、2030-06-17（一）10:00 系辦領證書（照 r2y4b3d.js 的 S.cert）---------- */
  const ATT=()=>typeof CLS!=='undefined'&&CLS.ATT_PASS?CLS.ATT_PASS:3;
  S.short=G=>S.courses(G).filter(id=>id!=='legal_practice'&&S.attended(G,id)<ATT());   /* 出席不到三堂的那幾門 */
  S.lateFill=(G,t)=>{ const L=S.short(G); return L.length?String(t).replace(/\{課名\}/g,L.map(S.cname).join('、')):S.fill(G,t); };   /* {課名}＝不到三堂的那一門（只有一門被當＝FD.fill 同一門）*/
  S.lateLikely=G=>{ const F=G.flags||{}; if(F.FAIL_DELAY_PASS!=null) return S.certLate(G); return S.on(G)&&S.courses(G).length>0&&S.short(G).length>0; };   /* 12/24 以前照目前的出席算（跳到下一件事的途中不會多上課；後面還有課的，那一堂的停點比較早）*/
  S.NOTE_AT=['2029-12-26',9]; S.CERT_AT=['2030-06-17',10];
  S.lateNote=async function(GM){ const G=GM.G; GM.sceneBegin(); try{ for(const t of S.LINES.lateNote) await GM.say(null,S.lateFill(G,t)); } finally { GM.sceneEnd(); } return true; };
  S.lateCert=async function(GM){ if(typeof R2Y4B==='undefined'||!R2Y4B.cert) return false; return R2Y4B.cert(GM,{key:S.CERT_AT[0],ta:S.LINES.lateCert,tag:'fd'}); };   /* 手機「畢業證書已可領取。」、12:00 媽媽那一則照 S.cert（tag fd_cert_sys、fd_cert_mom）*/
  /* ---------- 掛上去 ---------- */
  if(typeof CLS!=='undefined'&&CLS.showGrades&&!CLS._fdWrap){ const sg0=CLS.showGrades; CLS.showGrades=async function(GM,termId,opts){ const r=await sg0.apply(this,arguments); if(termId==='Y4S2'&&GM&&GM.G){ try{ await S.check(GM,opts); }catch(e){ console.warn('FD.check',e); } } return r; }; CLS._fdWrap=true; }
  if(typeof PG!=='undefined'&&Array.isArray(PG.STEPS)&&!PG.STEPS.some(s=>s.id==='fd_grades_y4s2')){ const gd=()=>typeof CALENDAR!=='undefined'&&CALENDAR.gradeDay?CALENDAR.gradeDay('Y4S2'):null;
    PG.STEPS.push({id:'fd_grades_y4s2',at:G=>{ const d=gd(); return d==null?null:T(d,9); },until:G=>{ const d=gd(); return d==null?null:T(d+2,24); },cond:G=>law(G)&&typeof CLS!=='undefined'&&!!CLS.rec&&!CLS.rec(G).grades.Y4S2,run:GM=>CLS.showGrades(GM,'Y4S2')}); }   /* 畢業後篇跳日期：停在 6/18 發成績單 */
  if(typeof PG!=='undefined'&&Array.isArray(PG.STEPS)&&!PG.STEPS.some(s=>s.id==='fd_late_note')){ const at=A=>{ const d=DK(A[0]); return d==null?null:T(d,A[1]); };
    PG.STEPS.push({id:'fd_late_note',at:G=>at(S.NOTE_AT),until:G=>{ const d=DK('2030-01-20'); return d==null?null:T(d,24); },cond:G=>S.on(G)&&S.certLate(G),run:GM=>S.lateNote(GM)},   /* AA_471 第 5 節 1（記號 12/24 記下以後第一次停）*/
      {id:'fd_late_cert',at:G=>at(S.CERT_AT),until:G=>{ const d=DK('2030-06-30'); return d==null?null:T(d,24); },cond:G=>S.on(G)&&S.certLate(G),run:GM=>S.lateCert(GM)});   /* AA_471 第 5 節 2 */
    if(Array.isArray(PG.stops)) PG.stops.push(G=>{ if(!S.on(G)||(PG.done&&PG.done(G,'fd_late_note'))||!S.lateLikely(G)) return null; const t=at(S.NOTE_AT); return t!=null&&t>now(G)?t:null; }); }   /* 12/24 記號還沒記的時候就排好 12/26 09:00 的停點（長跳每 6 小時看一次，不然會停在 11:00）*/
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ if(law(G)) S.result(G); });
  return S;
})();
if(typeof window!=='undefined') window.FD=FD;
