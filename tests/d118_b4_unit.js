// D118-B4-1102（docs/handoff/D118_PLAN.md 第 4 節 D118-B4）：考試裡的 cue、考後訂正——不需要瀏覽器。
//   a 同一組答案：R.prep 0／100、stats.study 0／500、卡片全空／全讀過 → 答對題數、分數完全相同（讀書次數不進分數）
//   b 讀過（read 以上）那張卡的題目前面多一行「（你想起筆記上寫的：…）」；沒讀過的不出
//   c 答錯的題寫成一則「考後訂正」筆記（題目、答案、考點），那張卡進 miss；全對不寫
//   d 提示的字只出現在正確選項、錯誤選項都沒有＝不出（BUG-B4-CUE-LEAK-1102）；第二輪看詞（CC N3 的 A、B 級全擋）、是非題一律不出；e 筆記頁 pre-line
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
    check('c1b. 訂正筆記標題有學期：「'+(n&&n.title)+'」（BB 09:31：<課名>・<學期>期末考訂正；補考＝補考訂正）',!!n&&n.title===e.c.name+'・大一上期末考訂正'&&STUDY.FIX_TITLE('海商法','Y4S2:maritime:makeup')==='海商法・大四下補考訂正',n&&n.title);
    const miss=STUDY.rec(G).miss; check('c2. 第 1 題的卡進 miss',STUDY.unitsOfQ(qs[0].id).some(u=>miss.includes(u.id)),J({miss:miss.slice(0,5)}));
    check('c3. 一則訂正筆記一次考試只有一則（id examfix_<學期:課:final>）',(G.notes||[]).filter(x=>x.id.startsWith('examfix_')).length===1); }
  /* d BUG-B4-CUE-LEAK-1102：提示的字只出現在正確選項＝不出；掃全部題庫列出被擋下的題 */
  { const blocked=[]; let n=0; for(const q of EXAM_BANK.questions.concat(typeof QBANK!=='undefined'?QBANK:[])){ for(const u of STUDY.unitsOfQ(q.id)){ const t=(u.cue||'').trim()||u.title; if(!t) continue; n++; if(STUDY.cueLeaks(q,t)) blocked.push(q.id+'「'+t+'」'); } }
    console.log('    被擋下的題（提示字只在正確選項）'+blocked.length+'／'+n+'：'+blocked.join('、'));
    check('d1. CRIM45_34「因果關係」只在 (B)：擋下',blocked.some(x=>x.startsWith('CRIM45_34')),J(blocked.length));
    const q=EXAM_BANK.questions.find(x=>x.id==='CRIM45_34'), G=clone(base); for(const u of STUDY.unitsOfQ(q.id)) STUDY.mark(G,u.id,'read','test');
    check('d2. 讀過那張卡，CRIM45_34 也不出提示',STUDY.cueFor(G,q)===null,STUDY.cueFor(G,q));
    const fake={id:'X',type:'mc',options:{A:'因果關係',B:'因果關係中斷'},answer:'B'}; check('d3. 提示字錯誤選項也有＝不算指答案（照出）',!STUDY.cueLeaks(fake,'因果關係'));
    check('d4. 是非題、沒有選項的題：一律不出提示（BB 08:54 ②）',STUDY.cueLeaks({type:'tf',answer:'O'},'因果關係')===true);
    /* 第二輪（BB 08:54，CC N3）：看詞——CC 的 A、B 級（最長命中 ≥3 字或占正確選項 1/4 以上）沒擋的要是 0 */
    let ab=0, tot=0; const tiers={}; for(const u of STUDY_UNITS.units){ const t=(u.cue||'').trim()||u.title; for(const qid of u.qids){ const q=EXAM_BANK.questions.find(x=>x.id===qid)||(typeof QBANK!=='undefined'?QBANK.find(x=>x.id===qid):null); if(!q||q.type==='tf'||!q.options) continue; tot++;
      const h=STUDY.cueHits(q,[t,u.title]); tiers[h.tier]=(tiers[h.tier]||0)+1; if((h.tier==='A'||h.tier==='B')&&!STUDY.cueLeaks(q,t,u.title)) ab++; } }
    console.log('    選擇題×卡 '+tot+' 組，等級分布 '+J(tiers));
    check('d5. CC N3 的 A、B 級命中：全部不出提示（沒擋 0）',ab===0,J({ab}));
    const must=['CIVS_12','CIV40_06','ADM20_17','Y4_ENF_02'].filter(id=>EXAM_BANK.questions.some(x=>x.id===id)||(typeof QBANK!=='undefined'&&QBANK.some(x=>x.id===id)));
    const G4=clone(base); for(const id of must) for(const u of STUDY.unitsOfQ(id)) STUDY.mark(G4,u.id,'read','test');
    check('d6. BB 舉的例子（'+must.join('、')+'）讀過卡也不出提示',must.length>0&&must.every(id=>STUDY.cueFor(G4,id)===null),J(must.map(id=>[id,STUDY.cueFor(G4,id)]))); }
  /* e 訂正筆記用 \n 分段：筆記頁的內文要 pre-line */
  { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); check('e. 筆記頁內文 white-space:pre-line（訂正筆記不擠成一段）',/<div style=\\?"white-space:pre-line\\?">'\+WN\(n\.body\)/.test(g)); }
  /* AA 10:26：有 cue＝只看 cue 會不會洩題（標題常常就是答案術語）；沒有 cue＝檢查標題 */
  { const q={id:'zz_t1',q:'測試題',options:{A:'緊急避難',B:'正當防衛',C:'依法令之行為',D:'業務上正當行為'},answer:'A'};
    const u1={id:'zz_u1',qids:['zz_t1'],title:'緊急避難',cue:'兩害相權，取其輕。'}, u2={id:'zz_u2',qids:['zz_t1'],title:'緊急避難',cue:''};
    const o1=STUDY.unitsOfQ, o2=STUDY.stateOf, o3=STUDY.view; STUDY.stateOf=()=>'read'; STUDY.view=u=>({title:u.title});
    STUDY.unitsOfQ=()=>[u1]; const c1=STUDY.cueFor(H.G,q); STUDY.unitsOfQ=()=>[u2]; const c2=STUDY.cueFor(H.G,q);
    STUDY.unitsOfQ=o1; STUDY.stateOf=o2; STUDY.view=o3;
    check('c2. 有 cue（不洩題）、標題剛好是答案術語：照樣出提示（cue 那一句）',c1===STUDY.CUE_PREFIX+u1.cue+'）',String(c1));
    check('c2. 沒有 cue：標題本身當提示＝會洩題就不出',c2===null,String(c2)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
