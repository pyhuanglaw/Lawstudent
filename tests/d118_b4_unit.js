// D118-B4-1102（docs/handoff/D118_PLAN.md 第 4 節 D118-B4）：考試裡的 cue、考後訂正——不需要瀏覽器。
//   a 同一組答案：R.prep 0／100、stats.study 0／500、卡片全空／全讀過 → 答對題數、分數完全相同（讀書次數不進分數）
//   b 讀過（read 以上）那張卡的題目前面多一行「（你想起筆記上寫的：…）」；沒讀過的不出
//   c 答錯的題寫成一則「考後訂正」筆記（題目、答案、考點），那張卡進 miss；全對不寫
//   d 提示的字只出現在正確選項、錯誤選項都沒有＝不出（BUG-B4-CUE-LEAK-1102）；e 筆記頁 pre-line
// 修改前（f57e3ac75）：b、c FAIL；（a2e466ee7）：d、e FAIL。用法：node tests/d118_b4_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/data/study_units.js','src/study3d.js']){ const src=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let ansPick=null, said=[];
GM.say=async(who,t)=>{ said.push(String(t)); };
GM.choose=async o=>ansPick?ansPick(o):0;
GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
const clone=o=>JSON.parse(JSON.stringify(o));
const TERM='Y1S1';
const setup=()=>{ H.fresh('2025-12-15',8,'linze',{examSeed:4242}); const G=H.G; CLS.rec(G); G.notes=[]; const e=CLS.examList(G,TERM).find(x=>{ const p=CLS.examPool(x.c.id,TERM,'final'); return p.cls.length+p.bank.length+p.ai.length>=5; }); return {G,e}; };
const run=async(G,e,pickFn)=>{ H.G=G; said=[]; ansPick=pickFn||null; const r=await CLS.runExam(GM,{c:e.c,exam:'final',term:TERM}); return {r,said:said.slice()}; };
(async()=>{
  const {G:G0,e}=setup(); check('0. 有一科期末考（'+(e&&e.c.name)+'）',!!e); if(!e){ H.done(); return; }
  const base=clone(G0);
  /* a */
  { const out=[]; for(const [prep,study,allRead] of [[0,0,false],[100,500,true]]){ const G=clone(base); const R=CLS.rec(G); R.prep=prep; G.stats=G.stats||{}; G.stats.study=study;
      if(allRead) for(const u of STUDY.units(G,e.c,TERM,'final')) STUDY.mark(G,u.id,'read','test');
      const {r}=await run(G,e); out.push([r.correct,r.score]); }
    check('a. 同一組答案：prep 0／100、study 0／500、卡片全空／全讀過 → 答對題數、分數一樣',J(out[0])===J(out[1]),J(out)); }
  /* b */
  { const G=clone(base); const qs=CLS.drawExam(clone(G),e.c.id,TERM,'final').qs; const q0=qs[0], us=STUDY.unitsOfQ(q0.id);
    for(const u of us) STUDY.mark(G,u.id,'read','test'); const {said:s1}=await run(G,e);
    const cues=s1.filter(t=>t.startsWith(STUDY.CUE_PREFIX)); const i0=s1.findIndex(t=>t.startsWith('1／5'));
    check('b1. 第 1 題的卡讀過：題目前一行是 cue（'+(cues[0]||'無')+'）',us.length>0&&i0>0&&s1[i0-1].startsWith(STUDY.CUE_PREFIX),J(s1.slice(0,4)));
    const others=qs.slice(1).filter(q=>!STUDY.unitsOfQ(q.id).some(u=>us.includes(u))).length;
    check('b2. 其他沒讀過的題不出 cue（cue 只有 '+cues.length+' 行）',cues.length===5-others,J({cues:cues.length,others}));
    const G2=clone(base); const {said:s2}=await run(G2,e); check('b3. 卡片全空：一行 cue 都沒有',!s2.some(t=>t.startsWith(STUDY.CUE_PREFIX))); }
  /* c */
  { const G=clone(base); const qs=CLS.drawExam(clone(G),e.c.id,TERM,'final').qs; let i=-1;
    const {r}=await run(G,e,o=>{ i++; const q=qs[i]; const want=i===0?'wrong':'right'; const opts=o.map(x=>x.t);       for(let k=0;k<o.length;k++){ const t=String(o[k].t); const ok=t.startsWith('（'+q.answer+'）')||t.startsWith(q.answer+'.')||t.startsWith(q.answer+' '); if(want==='right'&&ok) return k; if(want==='wrong'&&!ok) return k; } return 0; });
    const n=(G.notes||[]).find(x=>x.id.startsWith('examfix_'));
    check('c1. 答錯的題（'+(5-r.correct)+' 題）寫成「考後訂正」筆記：有題目、答案',r.correct<5&&!!n&&n.body.includes(qs[0].q)&&/答案：/.test(n.body),J({correct:r.correct,n:n&&n.title}));
    const miss=STUDY.rec(G).miss; check('c2. 第 1 題的卡進 miss',STUDY.unitsOfQ(qs[0].id).some(u=>miss.includes(u.id)),J({miss:miss.slice(0,5)}));
    check('c3. 一則訂正筆記一次考試只有一則（id examfix_<學期:課:final>）',(G.notes||[]).filter(x=>x.id.startsWith('examfix_')).length===1); }
  /* d BUG-B4-CUE-LEAK-1102：提示的字只出現在正確選項＝不出；掃全部題庫列出被擋下的題 */
  { const blocked=[]; let n=0; for(const q of EXAM_BANK.questions.concat(typeof QBANK!=='undefined'?QBANK:[])){ for(const u of STUDY.unitsOfQ(q.id)){ const t=(u.cue||'').trim()||u.title; if(!t) continue; n++; if(STUDY.cueLeaks(q,t)) blocked.push(q.id+'「'+t+'」'); } }
    console.log('    被擋下的題（提示字只在正確選項）'+blocked.length+'／'+n+'：'+blocked.join('、'));
    check('d1. CRIM45_34「因果關係」只在 (B)：擋下',blocked.some(x=>x.startsWith('CRIM45_34')),J(blocked.length));
    const q=EXAM_BANK.questions.find(x=>x.id==='CRIM45_34'), G=clone(base); for(const u of STUDY.unitsOfQ(q.id)) STUDY.mark(G,u.id,'read','test');
    check('d2. 讀過那張卡，CRIM45_34 也不出提示',STUDY.cueFor(G,q)===null,STUDY.cueFor(G,q));
    const fake={id:'X',type:'mc',options:{A:'因果關係',B:'因果關係中斷'},answer:'B'}; check('d3. 提示字錯誤選項也有＝不算指答案（照出）',!STUDY.cueLeaks(fake,'因果關係'));
    check('d4. 是非題、沒有選項的題：不擋',!STUDY.cueLeaks({type:'tf',answer:'O'},'因果關係')); }
  /* e 訂正筆記用 \n 分段：筆記頁的內文要 pre-line */
  { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); check('e. 筆記頁內文 white-space:pre-line（訂正筆記不擠成一段）',/<div style=\\?"white-space:pre-line\\?">'\+WN\(n\.body\)/.test(g)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
