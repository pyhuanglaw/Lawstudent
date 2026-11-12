// D118-B7-1102（docs/handoff/D118_PLAN.md 第 4 節 D118-B7、第 1 節 ③-3／③-4、第 2 節第四點 'bar'、第 8 節第 7 點）：國考題目範圍＋國考總複習——不需要瀏覽器。
//   a 成績單上沒有證交法的存檔：CLS.takenCourses 沒有它、PG.poolFor 沒有它的題、2029 一試 20 題裡沒有 securities（換 40 個 examSeed 都沒有；對照組成績單上有＝抽得到）
//   a2 日本路線（大三下在日本）：票據法、勞動法沒修＝不抽；民訴甲下、保險法大四下補修（civpro_2_re／insurance_re）＝算原課、抽得到
//   b 美國路線：大四上（人在美國）那一學期的課不會被抽（強制執行法、法律倫理、刑事／公法判決研討）；舊存檔留著大四上的成績單也不算
//   c 已經存下 PG.exam[2029].qs 的存檔（舊題池抽的、有證交法和強制執行法）不重抽：作答過、還沒作答都照存下的那 20 題；2030 換一組照新題池、不重複；
//     還沒作答、有海商法的舊題組（BB 11-02 22:15 的補抽）：只換海商法那兩題、補的題照新題池
//   d 國考總複習只有在一試前 30 天起才出現：2029 一試 8/4＝7/5 起；2030（重考、交換延畢、司法官重考）8/3＝7/4 起；2031 8/2＝7/3 起；一試開考（08:00）以後、考完、沒報名、學期中都沒有（也不在存檔多寫東西）；
//     家裡的選單（畢業以後住家裡）也有、按了地點記「家」；開放以前直接叫 STUDY.review(GM,'bar') 不做
//   e 按一次：6 小時（不跨天＝18:00 以後不給、會跨過一試 08:00 不給、閉館前讀不完不給）、stats.study +6、照常 STORY.onStudy；範圍＝一試題池每一題的觀念卡全部讀過、抽到的 20 題不變；
//     翻頁閱讀和期末總複習同一套（一科一節、答錯過的排最前面、先讀到這裡、結束字幕每科一行「國考範圍」——國考只列這一次翻到的科、最多 8 科）；入口：座位／書桌（STUDY.reviewOpt 帶 kind）、家裡的選單
//   f BB 驗收那一條：2029-07-10 做國考總複習 → 8/4 作答（讀過的卡出 cue）→ BAR_SCORE＝答對題數、9/7 放榜照答對題數；卡片回寫（答對＝答對過、答錯＝miss）
//   g 舊存檔（v9.10 結構：有成績單、期末考紀錄、PG、沒有 G.study）讀進來不報錯；沒有成績單的存檔＝題池退回全部、抽到的題和修改前一模一樣
//   h 題池不到 40 題＝退回全部（只有大一上的成績單：39 題）；夠 40 題＝只收修過的
// 修改前（開發分支 530a72ff4）：FAILED 41（CLS.takenCourses、PG.poolFor、STUDY.reviewInfo(G,'bar') 都沒有）；修改後 ALL PASS。用法：node tests/d118_b7_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js']) load(f);   /* jp3d.js：日本路線的大三下（JP.skipTerm＝CLS.termAway）*/
let caps=[], toasts=[], picks=[];
GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
GM.caption=(who,t)=>{ caps.push(String(t)); };
GM.toast=t=>{ toasts.push(String(t)); };
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='number') return want; if(want){ const k=o.findIndex(q=>String(q.t||q.text).includes(want)); if(k>=0) return k; } return 0; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fn=(o,k)=>!!o&&typeof o[k]==='function';
const has=(o,k)=>fn(o,k);
const taken=G=>has(CLS,'takenCourses')?CLS.takenCourses(G).map(c=>c.id):null;
const poolFor=G=>has(PG,'poolFor')?PG.poolFor(G):null;
const binfo=G=>{ try{ return STUDY.reviewInfo(G,'bar'); }catch(e){ return 'ERR'; } };
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
/* 有成績單的存檔：每一學期（不在國外的）的期末考照 CLS.drawExam 抽、答對 k 題，成績單照 CLS.reportFor 發（和遊戲裡學期結束一樣）。skip＝那幾門不在成績單上、沒有考試紀錄 */
const transcripts=(G,o)=>{ o=o||{}; const R=CLS.rec(G); R.exam=R.exam||{}; const k=o.k==null?3:o.k;
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; if(o.terms&&!o.terms.includes(t)) continue;
    for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)||(o.skip||[]).includes(c.id)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<k?q.answer:wrongOf(q)),correct:k,score:CLS.scoreOf(k),status:'done'}; }
    R.grades[t]=CLS.reportFor(G,t); for(const id of (o.skip||[])) delete R.grades[t][id]; }
  return R; };
const fresh29=(key,h,flags,zone)=>{ const G=H.fresh(key||'2029-07-10',h==null?10:h,zone||'library_b1',Object.assign({BAR_REG:true},flags||{})); graduated(G); caps=[]; toasts=[]; picks=[]; G.notes=[]; G.stats={classes:0,study:0}; return G; };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });   /* 前 k 題答對（同 bar_exam_unit）*/
const Y4S1=['enforcement','legal_ethics','ip_law','labor_social','tax_law','crim_judgment_sem','public_judgment_sem'];
/* 修改前的抽題（530a72ff4 的 PG.draw 新抽那一段，照抄）：沒有成績單的存檔要抽到一模一樣的題 */
const hashStr=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const legacyDraw=(seed,y,used)=>{ const r=rng(hashStr(seed+'|bar|'+y)), a=PG.pool().filter(q=>!(used||new Set()).has(q.id)); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a.slice(0,20).map(q=>q.id); };
(async()=>{
  check('0. CLS.takenCourses、PG.poolFor、PG.barReview 存在；STUDY.reviewInfo 認得 \'bar\'',has(CLS,'takenCourses')&&has(PG,'poolFor')&&has(PG,'barReview')&&(()=>{ const G=fresh29('2029-07-10',10); const i=binfo(G); return !!i&&i!=='ERR'&&i.kind==='bar'; })());
  /* ---------- a 沒修過證交法 ---------- */
  await sec('a',async()=>{ const G=fresh29(); transcripts(G,{skip:['securities']}); const tk=taken(G);
    check('a1. 成績單上沒有證交法：CLS.takenCourses 沒有 securities；大一到大四其他考五題的法律課都在（照課程順序）',!!tk&&!tk.includes('securities')&&['const_1','civ_general','crim_gen2','admin_law','crimpro','company_law','civpro_2','negotiable','enforcement','legal_ethics','crim_judgment_sem','maritime'].every(id=>tk.includes(id))&&!tk.includes('public_judgment_sem')&&!tk.includes('tax_law')&&J(tk)===J(COURSES.list.filter(c=>tk.includes(c.id)).map(c=>c.id)),J(tk));
    const pf=poolFor(G); check('a2. PG.poolFor：沒有任何一題 securities；其他修過的課照收（刑訴題庫 QBANK＝刑事訴訟法也在）；海商法、智財等一試不考的四科照舊不收',!!pf&&pf.length>=300&&!pf.some(q=>q.course==='securities')&&pf.some(q=>!q.course)&&pf.some(q=>q.course==='enforcement')&&!pf.some(q=>PG.POOL_EXCLUDE_COURSES.includes(q.course)),pf&&J({n:pf.length}));
    const qs=PG.draw(G,2029); check('a3. 2029 一試 20 題裡沒有 securities 的題（題目、答案照題庫原物件）',qs.length===20&&!qs.some(q=>q.course==='securities')&&qs.every(q=>(EXAM_BANK.questions.find(x=>x.id===q.id)||QBANK.find(x=>x.id===q.id))===q),J(qs.map(q=>q.id)));
    let bad=[], ctl=0; for(let s=1;s<=40;s++){ const G1=fresh29('2029-07-10',10,{examSeed:1000+s}); transcripts(G1,{skip:['securities']}); if(PG.draw(G1,2029).some(q=>q.course==='securities')) bad.push(s);
      const G2=fresh29('2029-07-10',10,{examSeed:1000+s}); transcripts(G2); if(PG.draw(G2,2029).some(q=>q.course==='securities')) ctl++; }
    check('a4. 換 40 個 examSeed：沒修證交法的 40 份都抽不到 securities；對照組（成績單上有證交法）抽得到（'+ctl+'／40 份有）',!bad.length&&ctl>=10,J({bad,ctl})); });
  /* ---------- a2 日本路線 ---------- */
  await sec('a2',async()=>{ const G=fresh29('2030-07-10',10,{EXCHANGE_ROUTE:'JP',BAR_REG:false,BAR_REG_2030:true}); transcripts(G); const tk=taken(G);
    check('a2-1. 日本路線：大三下（在日本）沒修的票據法、勞動法不算；大四下補修的民訴甲下、保險法算原課（civpro_2、insurance）',!!tk&&!tk.includes('negotiable')&&!tk.includes('labor_law')&&tk.includes('civpro_2')&&tk.includes('insurance')&&!tk.includes('civpro_2_re')&&tk.includes('securities'),J(tk));
    const pf=poolFor(G); check('a2-2. 題池沒有票據法、勞動法；有民訴甲下、保險法',!!pf&&!pf.some(q=>q.course==='negotiable'||q.course==='labor_law')&&pf.some(q=>q.course==='civpro_2')&&pf.some(q=>q.course==='insurance'));
    let bad=0; for(let s=1;s<=20;s++){ const G1=fresh29('2030-07-10',10,{EXCHANGE_ROUTE:'JP',BAR_REG:false,BAR_REG_2030:true,examSeed:2000+s}); transcripts(G1); if(PG.draw(G1,2030).some(q=>q.course==='negotiable'||q.course==='labor_law')) bad++; }
    check('a2-3. 交換延畢的 2030 一試（20 個 examSeed）：都沒有票據法、勞動法',bad===0,String(bad)); });
  /* ---------- b 美國路線大四上 ---------- */
  await sec('b',async()=>{ const G=fresh29('2030-07-10',10,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true}); transcripts(G); const tk=taken(G);
    check('b1. 美國路線：CLS.takenCourses 沒有大四上的任何一門（人在美國）；大三、大四下的照算',!!tk&&!tk.some(id=>Y4S1.includes(id))&&tk.includes('securities')&&tk.includes('negotiable')&&tk.includes('crimpro'),J(tk));
    const pf=poolFor(G); check('b2. 題池沒有大四上的課（強制執行法、法律倫理、刑事判決研討、公法判決研討）',!!pf&&!pf.some(q=>Y4S1.includes(q.course))&&pf.length>=300,pf&&String(pf.length));
    let bad=[]; for(let s=1;s<=40;s++){ const G1=fresh29('2030-07-10',10,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true,examSeed:3000+s}); transcripts(G1); const q=PG.draw(G1,2030).filter(x=>Y4S1.includes(x.course)); if(q.length) bad.push(s+':'+q.map(x=>x.id).join('/')); }
    check('b3. 美國路線 2030 一試（40 個 examSeed）：20 題裡都沒有大四上的課',!bad.length,J(bad.slice(0,5)));
    const R=CLS.rec(G); R.grades.Y4S1={enforcement:'缺考',legal_ethics:'缺考',crim_judgment_sem:'缺考'}; R.exam['Y4S1:enforcement:final']={qs:[],ans:[],correct:0,score:0,status:'done'};   /* 舊存檔：美國路線還沒排除大四上以前發過的成績單、考試紀錄 */
    const tk2=taken(G); check('b4. 舊存檔留著大四上的成績單、考試紀錄（人在國外的學期）：照樣不算',!!tk2&&!tk2.some(id=>Y4S1.includes(id)),J(tk2));
    /* BB-C 11-04 23:46（D118-B7 ①）：大五上補修的強制執行法、法律倫理（Y5.MAKEUP）在遊戲裡上過＝算修過 */
    { const G2=fresh29('2030-07-10',10,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true}); transcripts(G2); const d0=STORY.dayOfKey('2029-09-03'); G2.y5={cls:{[(d0+7)+':enforcement']:1}};
      const t5=taken(G2), p5=poolFor(G2);
      check('b5. 美國路線大五上補修上過強制執行法（G.y5.cls 有一堂）：算修過、題池有強制執行法；沒上過的法律倫理照樣不算（BB-C 23:46：遊戲裡上過就算）',J(CLS.Y5_MAKEUP)===J(['enforcement','legal_ethics'])&&!!t5&&t5.includes('enforcement')&&!t5.includes('legal_ethics')&&!!p5&&p5.some(q=>q.course==='enforcement')&&!p5.some(q=>q.course==='legal_ethics'),J({t5,enf:p5&&p5.filter(q=>q.course==='enforcement').length}));
      G2.y5.cls[(d0+9)+':legal_ethics']=1; const t6=taken(G2);
      check('b6. 兩門都上過：強制執行法、法律倫理都算；大四上其他課（判決研討、智財、勞社、稅法）照樣不算',!!t6&&t6.includes('enforcement')&&t6.includes('legal_ethics')&&!t6.some(id=>Y4S1.filter(x=>x!=='enforcement'&&x!=='legal_ethics').includes(id)),J(t6)); } });
  /* ---------- c 已經存下的題不重抽 ---------- */
  await sec('c',async()=>{ const old=legacyDraw(424242,2029); const all=new Map(PG.pool(true).map(q=>[q.id,q]));
    let ids=old.slice(); const sec1=PG.pool().filter(q=>q.course==='securities').slice(0,2).map(q=>q.id), enf=PG.pool().filter(q=>q.course==='enforcement').slice(0,2).map(q=>q.id);
    ids=sec1.concat(enf,ids.filter(id=>!sec1.includes(id)&&!enf.includes(id))).slice(0,20);   /* 舊題池抽的 20 題：有證交法、強制執行法（這份存檔都沒修）*/
    const G=fresh29('2029-08-04',8,{examSeed:424242}); transcripts(G,{skip:['securities','enforcement']});
    PG.rec(G).exam={2029:{qs:ids.slice()}}; const qs=PG.draw(G,2029);
    check('c1. 存檔裡已經有 PG.exam[2029].qs（還沒作答）：照存下的 20 題、順序一樣，不換成新題池（沒修的證交法、強制執行法照舊在裡面）',J(qs.map(q=>q.id))===J(ids)&&J(PG.rec(G).exam[2029].qs)===J(ids)&&qs.every(q=>all.get(q.id)===q),J(qs.map(q=>q.id)));
    const ans=qs.map(q=>q.answer); PG.rec(G).exam[2029].ans=ans; const qs2=PG.draw(G,2029);
    check('c2. 作答過（ans 記了）：照存下的那一份',J(qs2.map(q=>q.id))===J(ids));
    const q30=PG.draw(G,2030), pf=new Set((poolFor(G)||[]).map(q=>q.id));
    check('c3. 2030 新抽的一組：20 題、和 2029 不重複、都在新題池（只收修過的課）',q30.length===20&&q30.every(q=>!ids.includes(q.id))&&q30.every(q=>pf.has(q.id))&&!q30.some(q=>q.course==='securities'||q.course==='enforcement'),J(q30.map(q=>q.id)));
    /* 抽好還沒作答、裡面有一試不考的四科（BB 2026-11-02 22:15 的補抽）：四科那幾題換掉，補的題照新題池（只收修過的課）；其他存下的題（含沒修過的證交法）照舊、順序不變 */
    const mar=PG.pool(true).filter(q=>q.course==='maritime').slice(0,2).map(q=>q.id), ids4=sec1.concat(mar,old.filter(id=>!sec1.includes(id))).slice(0,20);
    const G4=fresh29('2029-08-04',8,{examSeed:424243}); transcripts(G4,{skip:['securities']}); PG.rec(G4).exam={2029:{qs:ids4.slice()}}; const q4=PG.draw(G4,2029).map(q=>q.id);
    const keep4=ids4.filter(id=>!mar.includes(id)), add4=q4.filter(id=>!keep4.includes(id)), pf4=new Set((poolFor(G4)||[]).map(q=>q.id));
    check('c4. 還沒作答、有海商法的舊題組：海商法兩題換掉、補的兩題在新題池（沒有證交法）；其他 18 題照存下的（證交法那兩題也留著）',q4.length===20&&!q4.some(id=>mar.includes(id))&&J(q4.filter(id=>keep4.includes(id)))===J(keep4)&&add4.length===2&&add4.every(id=>pf4.has(id)&&all.get(id).course!=='securities'),J({add4,keep:keep4.length})); });
  /* ---------- d 什麼時候出現 ---------- */
  await sec('d',async()=>{ const G=fresh29('2029-07-04',23);
    check('d1. 2029-07-04 23:00（一試 8/4 的 31 天前）：沒有國考總複習（reviewInfo null、座位選單沒有那一項）',binfo(G)===null&&STUDY.reviewOpt(G)===null,J(binfo(G)));
    H.at('2029-07-05',0); const i1=binfo(G); const o1=STUDY.reviewOpt(G);
    check('d2. 2029-07-05 00:00 起（30 天前）：有；座位選單「考前總複習」，kind bar',!!i1&&i1!=='ERR'&&i1.kind==='bar'&&i1.year===2029&&!!o1&&o1.t==='考前總複習'&&o1.kind==='bar'&&o1.review===true,J({i:i1&&i1.kind,o1}));
    H.at('2029-08-04',7.9); check('d3. 8/4 07:54（開考前）：還有，但讀六個小時會跨過 08:00 開考＝變灰',!!binfo(G)&&STUDY.reviewOpt(G).dim===true&&STUDY.reviewOpt(G).hint===STUDY.BAR_TEXT.miss.replace('{x}',STUDY.BAR_TEXT.exam),J(STUDY.reviewOpt(G)));
    H.at('2029-08-04',8); check('d4. 8/4 08:00（開考）以後：沒有',binfo(G)===null&&STUDY.reviewOpt(G)===null);
    H.at('2029-08-10',10); PG.rec(G).done.exam_2029=1; check('d5. 考完（exam_2029 演過）：沒有',binfo(G)===null);
    const Gn=fresh29('2029-07-10',10,{BAR_REG:false}); check('d6. 沒報名：一試前一個月也沒有',binfo(Gn)===null);
    const Gt=fresh29('2027-03-10',10,{BAR_REG:null}); delete Gt.flags.GRADUATED; delete Gt.flags.PG; const before=J(Gt.flags);
    check('d7. 學期中（大二下）：沒有，也不在存檔多寫東西（不建 flags.PG）',binfo(Gt)===null&&STUDY.reviewOpt(Gt)===null&&J(Gt.flags)===before);
    /* 2030（2029 一試不到 12 題的重考）：8/3＝7/4 起 */
    const Gr=fresh29('2030-07-03',23,{BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none'}); PG.rec(Gr).done.exam_2029=1; PG.rec(Gr).done.r1_2029=1;
    const r0=binfo(Gr); H.at('2030-07-04',9); const r1=binfo(Gr);
    check('d8. 2029 一試不到 12 題、2030 重考：7/3 沒有、7/4（一試 8/3 的 30 天前）起有（year 2030）',r0===null&&!!r1&&r1!=='ERR'&&r1.year===2030,J({r0,r1:r1&&r1.year}));
    /* 交換延畢（美國）2030 */
    const Gu=fresh29('2030-07-04',9,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true}); const u1=binfo(Gu); H.at('2029-07-20',10); const u0=binfo(Gu);
    check('d9. 交換延畢（美國路線）：2029 的那一段沒有（2029 不考）、2030-07-04 起有',u0===null&&!!u1&&u1!=='ERR'&&u1.year===2030,J({u0,u1:u1&&u1.year}));
    /* 司法官重考那一年（2030，已經是律師）*/
    const Gj=fresh29('2030-07-04',9,{BAR_SIT_2029:true,BAR_SCORE_2029:17,BAR_STAGE_2029:'both',BAR_YEAR:2029,JUDGE_RETAKE:true,JUDGE_RETAKE_Y:2030}); for(const k of ['exam_2029','r1_2029','e2a_2029','e2b_2029','r2_2029']) PG.rec(Gj).done[k]=1;
    const j1=binfo(Gj); H.at('2030-07-03',12); const j0=binfo(Gj);
    check('d10. 司法官重考那一年（2030）：一樣是一試前 30 天起（7/4）',j0===null&&!!j1&&j1!=='ERR'&&j1.year===2030,J({j0,j1:j1&&j1.year}));
    /* 2031（2030 一試也沒過、報了 2031）：8/2＝7/3 起 */
    const G31=fresh29('2031-07-03',9,{BAR_SIT_2029:true,BAR_SCORE_2029:9,BAR_STAGE_2029:'none',BAR_REG_2030:true,BAR_SIT_2030:true,BAR_SCORE_2030:8,BAR_STAGE_2030:'none',BAR_REG_2031:true});
    for(const k of ['exam_2029','r1_2029','exam_2030','r1_2030','reg_2031']) PG.rec(G31).done[k]=1; const y1=binfo(G31); H.at('2031-07-02',20); const y0=binfo(G31);
    check('d11. 2031 一試（8/2）：7/2 沒有、7/3 起有',y0===null&&!!y1&&y1!=='ERR'&&y1.year===2031,J({y0,y1:y1&&y1.year}));
    /* 家裡的選單 */
    const Gh=fresh29('2029-07-12',10,{},'dorm'); Gh.home={at:true}; const ho=HOME.MENU_OPTS.map(f=>{ try{ return f(Gh); }catch(e){ return null; } }).find(x=>x&&x.t==='考前總複習');
    check('d12. 住家裡的（畢業以後）：家裡的選單有「考前總複習」（國考；提示照 AA_690「一試要考的…」）',!!ho&&typeof ho.run==='function'&&/^一試要考的/.test(ho.hint||''),J(ho&&ho.hint));
    { let calls=[]; const on0=STORY.onStudy; STORY.onStudy=function(GM2,hrs){ calls.push([hrs,GM2.G.zone]); }; picks=['先讀到這裡'];
      try{ if(ho) await ho.run(GM); } finally { STORY.onStudy=on0; }
      check('d13. 家裡那一項按下去＝國考總複習：6 小時（10:00 → 16:00）、STORY.onStudy 的地點記「家」（之後恢復）',!!ho&&Gh.hour===16&&calls.length===1&&calls[0][0]===6&&calls[0][1]==='home'&&Gh.zone==='dorm',J({h:Gh.hour,calls,zone:Gh.zone})); }
    const Go=fresh29('2029-07-04',20); toasts=[]; const ro=await STUDY.review(GM,'bar');
    check('d14. 開放以前（7/4）直接叫 STUDY.review(GM,\'bar\')：不做（false）、不耗時間',ro===false&&Go.hour===20&&!(Go.study&&Object.keys(Go.study.u||{}).length),J({ro,h:Go.hour})); });
  /* ---------- e 按一次 ---------- */
  await sec('e',async()=>{ const G=fresh29('2029-07-10',9); transcripts(G,{k:3}); G.flags.examSeed=777; const R=CLS.rec(G);
    const info=binfo(G); const scope=new Set(); for(const x of (info&&info!=='ERR'?info.courses:[])) for(const u of x.units) scope.add(u.id);
    const want=new Set(); for(const q of (poolFor(G)||[])) for(const u of STUDY.unitsOfQ(q.id)) want.add(u.id);
    check('e1. 範圍＝一試題池（只收修過的課）每一題的觀念卡；一科一節、照課程順序',!!info&&info!=='ERR'&&scope.size>100&&J([...scope].sort())===J([...want].sort())&&J(info.courses.map(x=>x.c.id))===J(COURSES.list.filter(c=>info.courses.some(x=>x.c.id===c.id)).map(c=>c.id)),J({n:scope.size,m:want.size}));
    const d0=J(PG.draw(JSON.parse(J(G)),2029).map(q=>q.id)), ex0=J(R.exam), seed0=G.flags.examSeed;
    let calls=[]; const on0=STORY.onStudy; STORY.onStudy=function(GM2,hrs){ calls.push([hrs,GM2.G.zone]); };
    try{ G.slots={day:G.day,used:{am:3,pm:3,ev:3}}; const opt=STUDY.reviewOpt(G);
      check('e2. 選項可以按（不變灰）；提示：「國考要考的 n 科，m 張觀念卡。要六個小時…」（暫定字 STUDY.BAR_TEXT）',!!opt&&!opt.dim&&opt.kind==='bar'&&opt.hint.indexOf(STUDY.BAR_TEXT.what+' '+info.courses.length+' 科，'+scope.size+' 張觀念卡。'+STUDY.BAR_TEXT.hint)===0,J(opt));
      const h0=G.hour, day0=G.day, s0=G.stats.study; picks=['先讀到這裡']; const r=await STUDY.review(GM,'bar');
      check('e3. 耗 6 小時（09:00 → 15:00）、同一天、G.stats.study +6、時段次數不扣',!!r&&r.kind==='bar'&&Math.abs(G.hour-h0-6)<1e-9&&G.day===day0&&G.stats.study===s0+6&&J(G.slots.used)===J({am:3,pm:3,ev:3}),J({r,h:G.hour,study:G.stats.study}));
      check('e4. 照常觸發 STORY.onStudy（讀 6 小時，地點＝實際讀書的地方）',calls.length===1&&calls[0][0]===6&&calls[0][1]==='library_b1',J(calls));
      const bad=[...scope].filter(id=>STUDY.rank(G,id)<2);
      check('e5. 第一張就「先讀到這裡」：範圍內每一張卡都讀過（跳過也算）',!bad.length,J(bad.slice(0,5)));
      const qs=PG.draw(JSON.parse(J(G)),2029); const nr=qs.filter(q=>STUDY.unitsOfQ(q.id).some(u=>STUDY.rank(G,u)<2)).map(q=>q.id);
      check('e6. 做完以後：一試會抽到的 20 題，每一題的卡都是「讀過」以上；抽到的題號和總複習之前一樣（R.exam、examSeed 不動）',J(qs.map(q=>q.id))===d0&&!nr.length&&J(CLS.rec(G).exam)===ex0&&G.flags.examSeed===seed0,J({nr}));
      /* 不能開始 */
      H.at('2029-07-11',18.5); toasts=[]; calls=[]; const o2=STUDY.reviewOpt(G); const r2=await STUDY.review(GM,'bar');
      check('e7. 18:30：變灰「要讀六個小時。18:00 以後開始就太晚了。」（暫定字）、按了不耗時間',!!o2&&o2.dim&&o2.hint===STUDY.BAR_TEXT.late&&r2===false&&G.hour===18.5&&!calls.length&&toasts.includes(STUDY.BAR_TEXT.late),J({o2,r2}));
      H.at('2029-07-11',17.5); const o3=STUDY.reviewOpt(G); check('e8. 17:30（做完 23:30）：可以',!!o3&&!o3.dim,J(o3));
      G.zone='library_hall'; H.at('2029-07-11',17); const o4=STUDY.reviewOpt(G); check('e9. 總圖（22:00 閉館）17:00：變灰「快閉館了，讀不完六個小時。」（暫定字）',!!o4&&o4.dim&&o4.hint===STUDY.BAR_TEXT.closed,J(o4));
      H.at('2029-07-11',15.5); const o5=STUDY.reviewOpt(G); check('e10. 總圖 15:30（做完 21:30）：可以',!!o5&&!o5.dim,J(o5));
      G.zone='library_b1';
    } finally { STORY.onStudy=on0; }
    /* 翻頁閱讀：答錯過的排最前面 */
    const G2=fresh29('2029-07-15',9); transcripts(G2,{k:5}); const i2=binfo(G2); const c0=i2.courses[0], c1=i2.courses[1]; const last=c0.units[c0.units.length-1]; STUDY.miss(G2,last.id);
    H.said=[]; caps=[]; picks=['下一張','跳到下一科','先讀到這裡']; const rr=await STUDY.review(GM,'bar'); const L=H.said.map(s=>s.t), cards=L.filter(t=>/^【/.test(t));
    const open=STUDY.BAR_TEXT.open.replace('{what}',STUDY.BAR_TEXT.what).replace('{n}',i2.courses.length).replace('{m}',i2.courses.reduce((a,x)=>a+x.units.length,0));
    check('e11. 開始的字幕：「（你把四年的筆記攤開。國考要考的 n 科，一共 m 張觀念卡。）」（暫定字）',L[0]===open,J(L[0]));
    check('e12. 一科一節：第一張是第一科答錯過的那張（排最前面、標「（之前答錯過）」）；「跳到下一科」＝第三張是下一科的第一張',!!rr&&cards.length===3&&cards[0].includes(c0.c.name)&&cards[0].includes(STUDY.view(last).title)&&cards[0].includes('（之前答錯過）')&&cards[2].includes(c1.c.name)&&cards[2].includes('1／'),J(cards));
    const menu=H.opts.slice(-3); check('e13. 每張卡下面：下一張、跳到下一科、先讀到這裡（AA_638 照用）',menu.every(o=>o.includes('下一張')&&o.some(t=>t.startsWith('先讀到這裡'))),J(menu));
    const lines=[c0,c1].map(x=>STUDY.barLine(G2,x.c,x.units));
    check('e14. 結束字幕：這一次翻到的每一科一行「<課名>　一試範圍：學過 x／y・答對過 z」（AA_690 第 1 節；翻到兩科＝兩行，讀過的照範圍算）',lines.every(t=>t.includes('　一試範圍：學過 '))&&lines[0].includes('學過 '+c0.units.length+'／'+c0.units.length)&&caps.length>0&&caps[caps.length-1]===lines.join('<br>'),J({lines,cap:(caps[caps.length-1]||'').slice(0,200)}));
    /* 一路跳到最後一科：字幕最多 8 行（二十幾科全列會超出手機畫面）*/
    const G3=fresh29('2029-07-16',9); const i3=binfo(G3); caps=[]; picks=[]; for(let i=0;i<80;i++) picks.push('跳到下一科'); const r3=await STUDY.review(GM,'bar'); picks=[];
    const capL=(caps[caps.length-1]||'').split('<br>'), want3=i3.courses.slice(-STUDY.BAR_CAP_LINES).map(x=>STUDY.barLine(G3,x.c,x.units)).concat(['（另外還翻了 '+(i3.courses.length-STUDY.BAR_CAP_LINES)+' 科。）']);
    check('e16. 一路「跳到下一科」翻完 '+i3.courses.length+' 科：結束字幕只列翻到的最後 '+STUDY.BAR_CAP_LINES+' 科（STUDY.BAR_CAP_LINES；二十幾行在手機直向、橫向都會超出畫面），最後一行「（另外還翻了 k 科。）」（AA_690 第 2 節）',!!r3&&i3.courses.length>STUDY.BAR_CAP_LINES&&STUDY.BAR_CAP_LINES===8&&J(capL)===J(want3),J({n:capL.length,courses:i3.courses.length}));
    /* 入口：座位、Café、宿舍書桌（程式碼）*/
    const gs=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), ss=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('e15. 讀書座位、Café（seatMenu）、宿舍書桌（deskScene）選了「考前總複習」照那一項的 kind 跑 STUDY.review（國考＝bar）',/opts\[i\]\.review\)\{[^}]*STUDY\.review\(GM,opts\[i\]\.kind\|\|'final'\)/.test(gs)&&/async function deskScene[\s\S]{0,3000}STUDY\.reviewOpt\(G\)[\s\S]{0,1500}STUDY\.review\(GM,opts\[i\]\.kind\|\|'final'\)/.test(ss)); });
  /* ---------- f BB 驗收：7/10 總複習 → 8/4 作答 → 9/7 放榜 ---------- */
  await sec('f',async()=>{ const G=fresh29('2029-07-10',9,{examSeed:5150}); transcripts(G,{k:4}); PHONE.join(G,'noodle_team','桌遊團');
    picks=['先讀到這裡']; const rv=await STUDY.review(GM,'bar'); check('f1. 2029-07-10 做國考總複習',!!rv&&rv.kind==='bar');
    H.at('2029-08-04',8); const s=PG.due(G); check('f2. 8/4 08:00 一試',!!s&&s.id==='exam_2029');
    const qs=PG.draw(G,2029); const cue=qs.map(q=>STUDY.cueFor(G,q)); const k=13; picks=answerK(qs,k); H.said=[];
    await PG.runStep(GM,s);
    const L=H.said.map(x=>x.t); const cueShown=qs.map((q,i)=>{ const j=L.indexOf((i+1)+'／20　'+q.q); return j>0&&L[j-1].startsWith(STUDY.CUE_PREFIX)?L[j-1]:null; });
    check('f3. 讀過那張卡的題目前面多一行「（你想起筆記上寫的：…）」（照期末考的 cue，不點出答案的才出）；不出的就沒有',cue.some(Boolean)&&J(cueShown)===J(cue),J({cue:cue.filter(Boolean).length,shown:cueShown.filter(Boolean).length}));
    check('f4. 不影響計分：BAR_SCORE_2029＝答對題數 '+k+'、PG.exam[2029].ans 記了 20 個',G.flags.BAR_SCORE_2029===k&&PG.rec(G).exam[2029].ans.length===20&&PG.rec(G).exam[2029].ans.filter((a,i)=>String(a)===String(qs[i].answer)).length===k,String(G.flags.BAR_SCORE_2029));
    const st=qs.map(q=>STUDY.unitsOfQ(q.id).map(u=>STUDY.status(G,u))[0]), mi=STUDY.rec(G).miss;
    check('f5. 卡片回寫：答對的 '+k+' 題那張卡＝答對過；答錯的進 miss（下一次總複習排前面）、狀態不降',st.slice(0,k).every(x=>x==='got')&&qs.slice(k).every(q=>STUDY.unitsOfQ(q.id).every(u=>mi.includes(u.id)&&STUDY.rank(G,u)>=2)),J({st,miss:qs.slice(k).map(q=>STUDY.unitsOfQ(q.id).map(u=>mi.includes(u.id))[0])}));
    H.at('2029-09-07',15.1); H.said=[]; await H.run('r1_2029');
    check('f6. 9/7 放榜照答對題數：13 題＝「律師一試：通過。司法官一試：未通過。」、BAR_STAGE_2029 lawyer',G.flags.BAR_STAGE_2029==='lawyer'&&H.has(POSTGRAD_LINES.R1.sys.lawyer),J(H.said.slice(0,2)));
    /* 沒有做總複習、沒讀過書：一張卡都沒讀過＝一行 cue 都沒有 */
    const G0=fresh29('2029-08-04',8,{examSeed:5150}); const q0=PG.draw(G0,2029); picks=answerK(q0,5); H.said=[]; await PG.runStep(GM,PG.byId('exam_2029'));
    check('f7. 沒讀過的（新存檔、沒有成績單）：作答照舊、沒有 cue；BAR_SCORE＝5',!H.said.some(x=>x.t.startsWith(STUDY.CUE_PREFIX))&&G0.flags.BAR_SCORE_2029===5&&H.said.some(x=>x.t.startsWith('1／20　'))); });
  /* ---------- g 舊存檔 ---------- */
  await sec('g',async()=>{ /* v9.10 結構的存檔（2029-07-20，已經畢業、報了名；有成績單、期末考紀錄、PG；沒有 G.study、沒有 PG.exam）*/
    const G=fresh29('2029-07-20',10); transcripts(G,{k:2}); delete G.study; const R=CLS.rec(G); R.grades.Y2S2.legal_english='未修（2026-10-14 課程調整）'; R.grades.Y1S1.law_society='80 分';   /* 舊存檔的怪紀錄 */
    const S0=JSON.parse(J(G)); H.G=S0; let err=null, o=null, tk=null;
    try{ STUDY.rec(S0); tk=CLS.takenCourses(S0); o=STUDY.reviewOpt(S0); }catch(e){ err=String(e&&e.stack||e); }
    check('g1. v9.10 的存檔讀進來（沒有 G.study）：觀念卡 backfill、CLS.takenCourses、國考總複習的選項都不報錯',!err&&!!tk&&tk.length>20&&!!o&&o.kind==='bar'&&!tk.includes('law_society'),err||J(o&&o.hint));
    picks=['先讀到這裡']; let r=null; try{ r=await STUDY.review(GM,'bar'); }catch(e){ err=String(e&&e.stack||e); } check('g2. 做一次國考總複習不報錯',!err&&!!r,err);
    /* 沒有成績單的存檔（舊的測試存檔、開發版的捷徑存檔）：題池＝全部、抽到的題和修改前一模一樣 */
    const Gx=fresh29('2029-08-04',8,{examSeed:31337}); const pf=poolFor(Gx);
    check('g3. 沒有成績單（G.courses 都沒有）：PG.poolFor＝PG.pool()（同一份、同一個順序）',!!pf&&J(pf.map(q=>q.id))===J(PG.pool().map(q=>q.id))&&Gx.courses===undefined);
    const qx=PG.draw(Gx,2029).map(q=>q.id); check('g4. 抽到的 20 題和修改前（530a72ff4 的 PG.draw）一模一樣',J(qx)===J(legacyDraw(31337,2029)),J(qx.slice(0,4)));
    const q30=PG.draw(Gx,2030).map(q=>q.id); check('g5. 第二年也一樣（和修改前一樣換一組）',J(q30)===J(legacyDraw(31337,2030,new Set(qx)))); });
  /* ---------- h 不到 40 題＝全部 ---------- */
  await sec('h',async()=>{ const G=fresh29('2029-07-10',10); transcripts(G,{terms:['Y1S1']}); const pf=poolFor(G), tk=taken(G);
    const n1=PG.pool().filter(q=>['const_1','crim_gen1','civ_general'].includes(q.course)).length;
    check('h1. 只有大一上的成績單（憲法上、刑總一、民總＝'+n1+' 題，不到 40）：題池退回全部',n1<40&&!!tk&&J(tk)===J(['const_1','crim_gen1','civ_general'])&&!!pf&&pf.length===PG.pool().length,J({tk,n:pf&&pf.length}));
    const G2=fresh29('2029-07-10',10); transcripts(G2,{terms:['Y1S1','Y1S2']}); const p2=poolFor(G2), ok=new Set(['const_1','crim_gen1','civ_general','const_2','crim_gen2','oblig_gen1']);
    check('h2. 大一上下的成績單（40 題以上）：題池只有這六門',!!p2&&p2.length>=40&&p2.every(q=>ok.has(q.course)),p2&&String(p2.length));
    const q=PG.draw(G2,2029); check('h3. 抽 20 題都在這六門裡',q.length===20&&q.every(x=>ok.has(x.course))); });
  /* ---------- r 國考總複習的兩則提醒（D118-B7-REMIND-1104：BB-C 23:46 時間與停點；字 AA_690 第 3 節，企劃線 c860ff820）---------- */
  await sec('r',async()=>{
    check('r0. 介面字照 AA_690 第 1 節：what「一試要考的」、line「{c}　一試範圍：…」、more「（另外還翻了 {k} 科。）」；其他照定稿（hint、open、late、closed、exam）',
      STUDY.BAR_TEXT.what==='一試要考的'&&STUDY.BAR_TEXT.line==='{c}　一試範圍：學過 {x}／{y}・答對過 {z}'&&STUDY.BAR_TEXT.more==='（另外還翻了 {k} 科。）'&&STUDY.BAR_TEXT.hint==='要六個小時，今天其他的事照常可以做。'&&STUDY.BAR_TEXT.open==='（你把四年的筆記攤開。{what} {n} 科，一共 {m} 張觀念卡。）'&&STUDY.BAR_TEXT.exam==='一試',J(STUDY.BAR_TEXT));
    const K=d=>d==null?null:CALENDAR.dateOf(d).key, sys=G=>(G.msgs||[]).filter(m=>m.th==='sys'&&/^【國考】/.test(m.text||'')).map(m=>[K(m.day),m.h,m.text]);
    const ruleAt=(G,k,h)=>{ H.at(k,h); STORY.phoneRules(GM); PHONE.tick(G); };
    const T1='【國考】8/4 一試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。', T2='【國考】8/4（六）一試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。';
    { const G=fresh29('2029-07-01',10); ruleAt(G,'2029-07-05',11.9); const before=sys(G).length; ruleAt(G,'2029-07-05',12.05); const a=sys(G);
      check('r1. 2029 報了一試：7/5（總複習開放那天）12:00 系統訊息一則（BB-C 11-05 01:48：開放那天改 12:00，當天做得到；原本 20:00），字照 AA_690 ①；12:00 以前沒有',before===0&&a.length===1&&a[0][0]==='2029-07-05'&&a[0][2]===T1,J(a));
      ruleAt(G,'2029-07-06',20.1); check('r2. 隔天不再發',sys(G).length===1,J(sys(G)));
      ruleAt(G,'2029-07-29',19.9); const b0=sys(G).length; ruleAt(G,'2029-07-29',20.05); const b=sys(G);
      check('r3. 一試前一週的週日（2029-07-29）20:00 第二則，字照 AA_690 ②（8/4（六），不寫「這禮拜六」）',b0===1&&b.length===2&&b[1][0]==='2029-07-29'&&CALENDAR.dateOf(STORY.dayOfKey('2029-07-29')).wd%7===0&&b[1][2]===T2,J(b));
      ruleAt(G,'2029-08-01',20.1); check('r4. 之後不再發（各一次）',sys(G).length===2,J(sys(G))); }
    { const G=fresh29('2029-07-01',10,{BAR_REG:false}); for(const k of ['2029-07-05','2029-07-29']) ruleAt(G,k,20.1);
      check('r5. 沒報 2029 一試：兩則都沒有（AA_690「報了那一年一試的才有」）',!sys(G).length,J(sys(G))); }
    { const G=fresh29('2029-07-01',10); H.at('2029-07-01',10); const t=PG.nextStop(G);
      check('r6. 畢業以後篇「跳到下一件事」停在提醒的時間：7/1 10:00 的下一個停點不晚於 7/5 12:00（PG.stops；開放那天 12:00，BB-C 01:48）',t!=null&&t<=STORY.dayOfKey('2029-07-05')*24+12+1e-6,J({t,want:STORY.dayOfKey('2029-07-05')*24+12}));
      ruleAt(G,'2029-07-05',20.05); H.at('2029-07-06',10); const t2=PG.nextStop(G);
      check('r7. 第一則傳了以後，下一個停點不晚於 7/29 20:00（第二則）',t2!=null&&t2<=STORY.dayOfKey('2029-07-29')*24+20+1e-6,J({t2,want:STORY.dayOfKey('2029-07-29')*24+20})); }
    { const G=fresh29('2030-07-01',10,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true}); ruleAt(G,'2030-07-04',20.05); ruleAt(G,'2030-07-28',20.05); const c=sys(G);
      check('r8. 交換延畢（美國路線）2030 一試 8/3：7/4 12:00「【國考】8/3 一試。…」、7/28（日）20:00「【國考】8/3（六）一試。…」',c.length===2&&c[0][0]==='2030-07-04'&&c[0][2]===T1.replace('8/4','8/3')&&c[1][0]==='2030-07-28'&&c[1][2]===T2.replace('8/4','8/3'),J(c)); }
  });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
