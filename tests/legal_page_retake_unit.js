// BUG-LEGALPAGE-RETAKE-ROW-1102（CC M6、BB 10:07）：選單「法律」頁——不需要瀏覽器。
//   1. 大一上的法律課被當、大二上重修：大一上一列、大二上（這學期）另一列，名字「（重修）」、學期是大二上（原本只有一列，留在大一上，這學期那一筆被擋掉）
//   2. game3d.js 的 have 照「課號＋學期」比（STUDY.courses 的這學期那一筆不會被大一上那一列擋掉）；學期那一行補「・重修」（名字沒寫重修的時候）
//   3. 大一上只在讀書會碰過刑訴題庫（LEGAL 的狀態 learned）：不建「刑事訴訟法」那一列（還沒修）；大三上修了刑訴：照常列
// 修改前（781bd3039）：1、3 FAIL。用法：node tests/legal_page_retake_unit.js
const H=require('./pg_harness.js'); const {check}=H; const fs=require('fs'), path=require('path');
const SRC=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); const vm=require('vm');
for(const f of ['src/data/study_units.js','src/study3d.js']){ const src=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
(async()=>{
  H.fresh('2026-10-05',10,'campus',{});
  const G=H.G, R=CLS.rec(G); R.done=R.done||{}; R.abs=R.abs||{};
  const c=CLS.termCourses(G,'Y1S1').find(x=>CLS.isExamCourse(x)&&/法/.test(x.name)); check('0. 找得到大一上的法律課',!!c,c&&c.id);
  const d1=STORY.termDay('Y1S1',3,c.slots[0].wd), d2=STORY.termDay('Y2S1',3,c.slots[0].wd);
  R.done[d1+':'+c.id+':0']=1;
  G.courses.retake=[{id:c.id,from:'Y1S1',term:'Y2S1',slots:c.slots.map(s=>Object.assign({},s))}];
  R.done[d2+':'+c.id+':0']=1; G.day=d2+1;
  const LC=CLS.legalCourses(G).filter(e=>e.c.id===c.id);
  check('1. 兩列：大一上、大二上（這學期，名字有「（重修）」）',LC.length===2&&LC.some(e=>e.term==='Y1S1'&&!e.current)&&LC.some(e=>e.term==='Y2S1'&&e.current&&/（重修）/.test(e.c.name)),JSON.stringify(LC.map(e=>[e.term,e.current,e.c.name])));
  check('2. game3d.js：have 照課號＋學期；學期那一行補「・重修」',/const have=new Set\(LC\.map\(e=>e\.c\.id\+'\|'\+e\.term\)\)/.test(SRC)&&/!have\.has\(e\.c\.id\+'\|'\+e\.term\)/.test(SRC)&&/'・重修'/.test(SRC));
  /* 3 */
  H.fresh('2025-10-20',10,'campus',{});
  const G2=H.G; G2.legal=G2.legal||{}; G2.legal.q=G2.legal.q||{}; const q=(typeof QBANK!=='undefined'?QBANK:[])[0]; if(q) G2.legal.q[q.id]={state:'learned'};
  const has=()=>STUDY.courses(G2).some(e=>e.c.id==='crimpro');
  check('3. 大一上只在讀書會碰過刑訴題庫：法律頁沒有「刑事訴訟法」（還沒修）',!!q&&!has());
  const cp=CLS.byId('crimpro'); if(cp){ G2.day=STORY.termDay(cp.term,5,1); check('3. 到了修刑訴的學期（'+cp.term+'）：照常列',has()); }
  H.done();
})();
