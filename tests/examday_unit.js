// BUG-RETAKE-NOEXAM-1102、BUG-EXAMDAY-MEMO-1102（BB 08:58，CC N1 cc-testing c19e01ff）——不需要瀏覽器。
//   a 重修課排在任何一個時段（週一～五 × 每一節）、三條路線（TW／JP／US）、大一下～大四下：考五題的課一定有期末考日（examDay 不是 null），而且在期末週
//   b 同一頁讀兩份存檔（兩個 G）：同一門重修課時段不同 → 各自的考試日（不會拿到上一份的）；同一份存檔改了重修時段 → 重算
//   c CLS.resetExamMemo 存在；讀檔、開新遊戲會呼叫（game3d.js）
//   a2 CC N1 的重現：planRetakes 排出來的重修（全部被當／只當一門 × 三條路線）都有期末考日
// 修改前（a4abf3172）：a2、b1、c FAIL（a 在舊版因為快取不分存檔，結果不可靠）。用法：node tests/examday_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify; const fs=require('fs'), path=require('path');
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const blocks=Object.keys(COURSES.blocks);
const mk=(route,termId,rt)=>{ const G=H.fresh('2025-09-01',8,'dorm',{EXCHANGE_ROUTE:route,examSeed:7}); const R=CLS.rec(G); R.retake=rt?[rt]:[]; return G; };
const finalDays=termId=>{ const out=[]; for(let d=1;d<1600;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===termId&&t.exam==='final') out.push(d); } return out; };
/* a */
{ let n=0, bad=[]; const clash=[]; for(const route of ['TW','JP','US']) for(let i=1;i<TERMS.length;i++){ const term=TERMS[i], prev=TERMS[i-1]; const G0=mk(route,term,null); if(CLS.termAway&&CLS.termAway(G0,term)) continue;
    const fd=new Set(finalDays(term)); const cands=CLS.termCourses(G0,prev).filter(c=>CLS.isExamCourse(c)).slice(0,6);
    for(const c of cands) for(let wd=1;wd<=5;wd++) for(const b of blocks){ const G=mk(route,term,{id:c.id,from:prev,base:c.term||prev,term,slots:[{wd,block:b}],alt:false});
      const rc=CLS.termCourses(G,term).find(x=>x.id===c.id); if(!rc||!CLS.isExamCourse(rc)) continue; const overlap=CLS.termCourses(G,term).some(x=>x!==rc&&x.slots.some(q=>q.wd===wd&&q.block===b)); n++; const d=CLS.examDay(G,rc,term,'final');
      if(!d||!fd.has(d.day)) bad.push([route,term,c.id,wd,b,d&&CALENDAR.dateOf(d.day).key]);
      const ex=CLS.examList(G,term), seen={}; for(const e of ex){ const k=e.day+'|'+e.block; if(seen[k]&&!overlap) clash.push([route,term,seen[k],e.c.id,CALENDAR.dateOf(e.day).key,e.block]); seen[k]=e.c.id; } } }
  console.log('    組合 '+n+' 個');
  check('a. 三條路線、重修排在每一個時段：考五題的課一定有期末考日、在期末週',n>100&&bad.length===0,J(bad.slice(0,8))+(bad.length>8?'…共 '+bad.length:''));
  check('a3. 同上（重修時段不和別的課重疊的那些——遊戲排重修本來就不會重疊）：這學期所有考試（含重修）沒有兩場同一天同一節（BB 09:01）',clash.length===0,J(clash.slice(0,6))+(clash.length>6?'…共 '+clash.length:'')); }
/* a2 CC N1 的重現：某學期全部被當（含看出席的課）→ CLS.planRetakes 排到下一學期 → 每一門考五題的課（含重修）都有期末考日；只當一門也一樣 */
{ const LAW=TERMS; let n=0; const bad=[], clash2=[];
  for(const route of ['TW','JP','US']) for(const F of LAW.slice(0,-1)) for(const mode of ['all','exam'].concat(COURSES.list.filter(c=>c.term===F&&CLS.isExamCourse(c)).map(c=>'only:'+c.id))){
    const G=H.fresh('2025-09-01',8,'dorm',{EXCHANGE_ROUTE:route,examSeed:7}); if(CLS.termAway&&CLS.termAway(G,F)) continue; const R=CLS.rec(G); R.exam=R.exam||{}; const ap=CLS.attPass;
    if(mode!=='all') CLS.attPass=()=>true; if(mode.startsWith('only:')){ const only=mode.slice(5); for(const c of CLS.termCourses(G,F).filter(CLS.isExamCourse)) if(c.id!==only) R.exam[F+':'+c.id+':final']={status:'done',correct:3}; }
    let made=[]; try{ made=CLS.planRetakes(G,F); } finally { CLS.attPass=ap; }
    for(const T of new Set(made.map(r=>r.term))){ const fd=new Set(finalDays(T)); for(const c of CLS.termCourses(G,T).filter(CLS.isExamCourse)){ n++; const d=CLS.examDay(G,c,T,'final'); if(!d||!fd.has(d.day)) bad.push([route,F+'→'+T,mode,c.id]); }
      const seen={}; for(const e of CLS.examList(G,T)){ const k=e.day+'|'+e.block; if(seen[k]) clash2.push([route,F+'→'+T,mode,seen[k],e.c.id,CALENDAR.dateOf(e.day).key,e.block]); seen[k]=e.c.id; } } }
  console.log('    planRetakes 之後的考五題課 '+n+' 門次');
  check('a2. CC N1 情境（全部被當／只有考試課被當／只當一門 × 三條路線）：重修以後每一門考五題的課都有期末考日（例：債總（一）重修排週五下午二、12/25 放假）',n>50&&bad.length===0,J(bad.slice(0,8))+(bad.length>8?'…共 '+bad.length:''));
  check('a4. 同上：所有考試（含重修）沒有兩場同一天同一節（BB 09:01）',clash2.length===0,J(clash2.slice(0,6))+(clash2.length>6?'…共 '+clash2.length:'')); }
/* b */
{ const term='Y2S1', prev='Y1S2'; const G1=mk('TW',term,null); const c=CLS.termCourses(G1,prev).find(x=>CLS.isExamCourse(x));
  const rtA={id:c.id,from:prev,base:prev,term,slots:[{wd:1,block:'am'}],alt:false}, rtB={id:c.id,from:prev,base:prev,term,slots:[{wd:4,block:'pm2'}],alt:false};
  const GA=mk('TW',term,rtA), GB=mk('TW',term,rtB); const cA=CLS.termCourses(GA,term).find(x=>x.id===c.id), cB=CLS.termCourses(GB,term).find(x=>x.id===c.id);
  const dA=CLS.examDay(GA,cA,term,'final'), dB=CLS.examDay(GB,cB,term,'final');
  check('b1. 同一頁兩份存檔、重修時段不同（週一上午／週四下午二）：考試日各自照自己的時段',!!dA&&!!dB&&(dA.day!==dB.day||dA.block!==dB.block)&&CALENDAR.dateOf(dA.day).wd===1&&dA.block==='am',J({dA,dB}));
  CLS.rec(GA).retake=[rtB]; const cA2=CLS.termCourses(GA,term).find(x=>x.id===c.id); const dA2=CLS.examDay(GA,cA2,term,'final');
  check('b2. 同一份存檔改了重修時段：重算（不是舊的）',!!dA2&&dA2.day===dB.day&&dA2.block===dB.block,J({dA2,dB})); }
/* c */
{ const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  check('c. CLS.resetExamMemo；讀檔（loadFrom）、開新遊戲（newGameAbort）都清',typeof CLS.resetExamMemo==='function'&&/async function loadFrom\(s\)\{ if\(typeof CLS!=='undefined'&&CLS\.resetExamMemo\) CLS\.resetExamMemo\(\)/.test(g)&&/function newGameAbort\(\)\{ if\(typeof CLS!=='undefined'&&CLS\.resetExamMemo\) CLS\.resetExamMemo\(\)/.test(g)); }
/* d BUG-RETAKE-OVERFLOW-1102（BB 09:45，CC M3）：下一學期一週 15 個時段都排滿＝重修順延到再下一學期（不消失）、手機教務處通知 */
{ const G=mk('TW','Y2S1',null); const prev='Y1S2', to='Y2S1'; const tc0=CLS.termCourses; const full={id:'__full',term:to,kind:'law',slots:[]}; for(let wd=1;wd<=5;wd++) for(const b of blocks) full.slots.push({wd,block:b});
  const c=CLS.termCourses(G,prev).find(x=>CLS.isExamCourse(x)); const ap=CLS.attPass, fi=CLS.failedIn; CLS.failedIn=(g,t)=>t===prev?[c]:fi(g,t);
  CLS.termCourses=function(g,t){ const L=tc0.apply(this,arguments); return t===to?L.concat([full]):L; }; let made=[];
  try{ made=CLS.planRetakes(G,prev); } finally { CLS.termCourses=tc0; CLS.failedIn=fi; }
  const r=made.find(x=>x.id===c.id); H.G=G; const sys=H.msgs('sys').some(t=>String(t).includes(c.name)&&/重修/.test(t));
  check('d. 大二上排滿：'+c.name+' 的重修順延到大二下（不消失）、手機有教務處通知',!!r&&r.term==='Y2S2'&&r.deferred===true&&sys,J({r,sys})); }
H.done();
