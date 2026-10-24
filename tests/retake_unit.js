// 被當、重修（D42：使用者 10-18 02:2x「沒有暑修」，被當的課下一學期再修；衝堂就開另一個老師的同一門課、放在不衝堂的時段）——不需要瀏覽器。
//   1  法律課期末 0 分（或缺考）＝被當：成績單「0 分（不及格，下學期重修）」，下學期課表多「○○（重修）」、期末一樣五題（原本那一學期的題庫）
//   2  時段：原本的時段在下學期沒衝堂＝照原本；衝堂＝換到空著的時段（另一位老師的班）
//   3  看出席的課不到三堂＝被當，下學期重修、出席重新算
//   4  重修又被當＝再下一學期，題庫還是最原本那一學期
//   5  人在國外的學期（美國路線大四上）不算被當；被當的課跳過國外那一學期；大四下被當沒有下學期（延畢還沒做，成績單寫「不及格」）
//   6  已經發過的成績單（舊存檔）不追溯
// 修改前（開發分支 e56ea5825）：沒有重修——FAIL。用法：node tests/retake_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const keyOf=d=>CALENDAR.dateOf(d).key;
const gradeDay=id=>CALENDAR.gradeDay(id);
const at=(d,h,flags)=>{ H.fresh(keyOf(d),h,'campus',flags); return H.G; };
const R=()=>CLS.rec(H.G);
const lawCs=id=>CLS.termCourses(H.G,id).filter(c=>CLS.isExamCourse(c)&&!c.rt);
const allPass=id=>{ const X=R(); X.exam=X.exam||{}; for(const c of lawCs(id)) X.exam[id+':'+c.id+':final']={status:'done',correct:4,score:90}; for(const c of CLS.termCourses(H.G,id)) if(CLS.attCourse(c)) X.attend[c.id]=3; };

(async()=>{
await sec(0,()=>{ check('0. CLS.planRetakes、failedIn、rtCourse、retakeTermAfter 有',typeof CLS.planRetakes==='function'&&typeof CLS.failedIn==='function'&&typeof CLS.rtCourse==='function'&&typeof CLS.retakeTermAfter==='function'); });
if(typeof CLS.planRetakes!=='function'){ H.done(); return; }

await sec(1,async()=>{ at(gradeDay('Y1S1'),8); allPass('Y1S1'); R().exam['Y1S1:civ_general:final']={status:'done',correct:0,score:0};
  check('1. 民法總則答對 0 題＝被當（failedIn）',CLS.failedIn(H.G,'Y1S1').map(c=>c.id).join()==='civ_general');
  await CLS.showGrades(GM,'Y1S1'); const L=H.lines(), rt=R().retake||[];
  check('1. 成績單「民法總則：0 分（不及格，下學期重修）」',L.some(t=>t.includes('民法總則：0 分（不及格，下學期重修）')),L.join(' | ').slice(0,300));
  check('1. 排進大一下：{civ_general, Y1S1 → Y1S2}；成績單後面一句「重修：民法總則，大一下，…」',rt.length===1&&rt[0].id==='civ_general'&&rt[0].from==='Y1S1'&&rt[0].base==='Y1S1'&&rt[0].term==='Y1S2'&&L.some(t=>/^重修：民法總則，大一下，/.test(t)),J(rt));
  const c2=CLS.termCourses(H.G,'Y1S2').find(c=>c.rt);
  check('1. 大一下的課表多「民法總則（重修）」',!!c2&&c2.name==='民法總則（重修）'&&c2.id==='civ_general'&&c2.term==='Y1S2',J(c2&&{n:c2.name,t:c2.term}));
  const p1=CLS.examPool('civ_general','Y1S1','final'), p2=CLS.examPool('civ_general','Y1S2','final'), n=x=>x.cls.length+x.bank.length+x.ai.length;
  check('1. 重修的期末考題目照大一上的題庫（夠 5 題）',n(p2)===n(p1)&&n(p2)>=5,J([n(p1),n(p2)]));
  const ex=CLS.examList(H.G,'Y1S2').find(e=>e.c.id==='civ_general'&&e.kind==='final');
  check('1. 大一下的考試表有民法總則（重修）的期末考',!!ex&&CALENDAR.termOf(ex.day).id==='Y1S2',J(ex&&{d:keyOf(ex.day),b:ex.block})); });

await sec(2,()=>{ const r=(R().retake||[])[0]; if(!r){ check('2. 沒有第 1 節的重修',false); return; }
  const base=CLS.termCourses(H.G,'Y1S2').filter(c=>!c.rt), used=new Set(); for(const c of base) for(const s of c.slots) used.add(s.wd+':'+s.block);
  const orig=CLS.byId('civ_general'), clash=orig.slots.some(s=>used.has(s.wd+':'+s.block));
  check('2. 時段不跟大一下的課衝堂',r.slots.every(s=>!used.has(s.wd+':'+s.block)),J(r.slots));
  check('2. 原本的時段'+(clash?'衝堂＝另一位老師的班（alt）':'沒衝堂＝照原本'),clash?(r.alt===true):(r.alt===false&&J(r.slots)===J(orig.slots.map(s=>({wd:s.wd,block:s.block})))),J({clash,alt:r.alt}));
  /* 硬造一個衝堂：把大一下某一門課放到原本民總的時段 */
  at(gradeDay('Y1S1'),8); allPass('Y1S1'); R().exam['Y1S1:civ_general:final']={status:'done',correct:0,score:0};
  const y2=CLS.termCourses(H.G,'Y1S2').filter(c=>!c.rt)[0], s0=y2.slots, os=orig.slots[0]; y2.slots=[{wd:os.wd,block:os.block}];
  const made=CLS.planRetakes(H.G,'Y1S1'); y2.slots=s0;
  check('2. 硬造衝堂：換到空著的時段、alt',made.length===1&&made[0].alt===true&&!made[0].slots.some(s=>s.wd===os.wd&&s.block===os.block),J(made)); });

await sec(3,async()=>{ at(gradeDay('Y1S1'),8); allPass('Y1S1'); const ch=CLS.termCourses(H.G,'Y1S1').find(c=>c.id==='chinese_y1'); R().attend.chinese_y1=2;
  check('3. 大一國文出席 2 堂＝被當',CLS.failedIn(H.G,'Y1S1').map(c=>c.id).join()==='chinese_y1');
  await CLS.showGrades(GM,'Y1S1'); const rt=R().retake||[];
  check('3. 下學期重修、出席歸零（重新算三堂）',rt.length===1&&rt[0].id==='chinese_y1'&&rt[0].term==='Y1S2'&&R().attend.chinese_y1===0,J({rt,att:R().attend.chinese_y1}));
  check('3. 成績單「'+ch.name+'：不及格（下學期重修）」',H.lines().some(t=>t.includes(ch.name+'：不及格（下學期重修）'))); });

await sec(4,async()=>{ at(gradeDay('Y1S2'),8); R().retake=[{id:'civ_general',from:'Y1S1',base:'Y1S1',term:'Y1S2',slots:[{wd:1,block:'pm2'}],alt:true}]; allPass('Y1S2');
  R().exam['Y1S2:civ_general:final']={status:'done',correct:0,score:0};
  const f=CLS.failedIn(H.G,'Y1S2'); check('4. 重修又 0 分＝又被當',f.length===1&&!!f[0].rt&&f[0].id==='civ_general');
  await CLS.showGrades(GM,'Y1S2'); const r=(R().retake||[]).find(x=>x.from==='Y1S2');
  check('4. 再下一學期（大二上）、題庫還是大一上',!!r&&r.term==='Y2S1'&&r.base==='Y1S1',J(r));
  check('4. 大二上抽題用大一上的題庫',CLS.rtTerm('civ_general','Y2S1')==='Y1S1'); });

await sec(5,async()=>{ at(gradeDay('Y4S1'),8,{EXCHANGE_ROUTE:'US'}); check('5. 美國路線大四上（人在國外）：台灣的課不算被當',CLS.failedIn(H.G,'Y4S1').length===0);
  at(gradeDay('Y3S2'),8,{EXCHANGE_ROUTE:'US'}); check('5. 美國路線大三下被當：跳過大四上，排大四下',CLS.retakeTermAfter(H.G,'Y3S2')==='Y4S2');
  at(gradeDay('Y4S2'),8); allPass('Y4S2'); const c=lawCs('Y4S2')[0]; R().exam['Y4S2:'+c.id+':final']={status:'done',correct:0,score:0};
  await CLS.showGrades(GM,'Y4S2'); check('5. 大四下被當：沒有下學期（不排重修），成績單「（不及格）」',!(R().retake||[]).length&&H.lines().some(t=>t.includes(c.name+'：0 分（不及格）')),H.lines().join(' | ').slice(0,200)); });

await sec(6,async()=>{ at(gradeDay('Y1S1'),8); allPass('Y1S1'); R().exam['Y1S1:civ_general:final']={status:'done',correct:0,score:0}; R().grades.Y1S1={civ_general:'0 分'};
  await CLS.showGrades(GM,'Y1S1'); check('6. 已經發過的成績單（R.grades 有了）：不排重修',!(R().retake||[]).length); });

H.done();
})();
