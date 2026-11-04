#!/usr/bin/env node
/* CC-C（帳號 C）11-04：D118_B7 題池補驗（BB-C 23:52）——大四選修照遊戲自己的選課（CLS.selectTerm，選單照玩家選）跑，選了「修」的那一門要進一試題池、「不修」的不要進。
   BB-C 原文：「D124 說大四下選課時問，預設是修，所以 2029-07-10 已經畢業的玩家，照預設應該修過海商法。成績單照遊戲本身的大四下選課跑，選『修』（預設），看海商法有沒有進題池；
              選『不修』，就不要進。……智財、勞社、稅法用同樣方法檢查：玩家實際選修了才進，沒修就不進。」
   做法：臺灣路線、2029-07-10。大四上、大四下的選課（CLS.choiceGroups）每一組、每一個選項各跑一次：CLS.selectTerm(GM,學期) 的選單照那個選項選（其他組選預設＝選單第一個），
     成績單照 tests/d118_b7_unit.js 的 transcripts 發（期末考照 CLS.drawExam、成績單照 CLS.reportFor），再看 CLS.takenCourses、PG.poolFor。
   期望（BB-C 23:56 更正 23:52）：海商法、智財、勞動社會法、財稅法是律師二試的選試科目、一試本來就不考＝照 BUG-BAR-POOL-PREFIX（BB 11-02 22:15）不管修沒修都不在一試題池；
     其他選修：修了（takenCourses 有）＝題池有它的題、沒修＝題池沒有。選修照「修了才進」的是二試選試科目題池（D118-B7-FOLLOW-1104，P3，之後再驗）。
   用法：LW_ROOT=<checkout> [SHA=…] node cc_d118_electives.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js']) load(f);
GM.addNote=()=>true; GM.caption=()=>{}; GM.toast=()=>{};
let want=[]; GM.choose=async o=>{ const ts=o.map(q=>q.t||q.text); const w=want.shift(); if(w==null) return 0; const k=ts.findIndex(t=>t===w||t.startsWith(w)); return k>=0?k:0; };
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
const transcripts=G=>{ const R=CLS.rec(G); R.exam=R.exam||{};
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue;
    for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; }
    R.grades[t]=CLS.reportFor(G,t); } };
const EXC=new Set(['maritime','ip_law','labor_social','tax_law']);   /* BUG-BAR-POOL-PREFIX（BB 11-02 22:15）：二試選試科目，一試不考（BB-C 23:56）*/
const nm=id=>{ const c=(COURSES.list||[]).find(x=>x.id===id); return c?c.name:id; };
(async()=>{
console.log('cc_d118_electives　LW_ROOT='+ROOT+'　SHA='+(process.env.SHA||'?'));
info('PG.POOL_EXCLUDE_COURSES（一試不收的科）＝'+J(PG.POOL_EXCLUDE_COURSES||null));
const TERMS=['Y4S1','Y4S2'], GROUPS=[]; for(const t of TERMS) for(const g of CLS.choiceGroups(t)) GROUPS.push(Object.assign({term:t},g));
info('大四的選修組（CLS.choiceGroups）：'+J(GROUPS.map(g=>({term:g.term,group:g.group,def:g.def,none:g.none,opts:g.opts.map(c=>c.id+' '+c.name)}))));
const run=async(term,pickTxt)=>{ const G=H.fresh('2029-07-10',10,'library_b1',{BAR_REG:true,examSeed:4242}); G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; G.stats={classes:0,study:0};
  for(const t of TERMS){ want=t===term?pickTxt.slice():[]; H.said=[]; await CLS.selectTerm(GM,t); }
  transcripts(G); const tk=CLS.takenCourses(G).map(c=>c.id), pool=PG.poolFor(G)||[], inP=new Set(pool.map(q=>q.course).filter(Boolean)); return {G,tk,inP,el:J(CLS.rec(G).electives||{})}; };
/* 預設（選單第一個＝預設那一個） */
{ const r=await run(null,[]); info('預設：electives '+r.el+'；修過的大四選修 '+J(GROUPS.flatMap(g=>g.opts.map(c=>c.id)).filter(id=>r.tk.includes(id))));
  for(const g of GROUPS) for(const c of g.opts){ const t=r.tk.includes(c.id), p=r.inP.has(c.id); { const x=EXC.has(c.id), w=x?false:t; check('預設（'+g.term+' '+g.group+'）：'+c.name+'——'+(t?'修了':'沒修')+'＝'+(x?'二試選試科目、一試不收':(t?'要進題池':'不進題池'))+'（現在：'+(p?'在':'不在')+'）',p===w,J({taken:t,inPool:p})); } } }
/* 每一組的每一個選項 */
for(const g of GROUPS){ const L=g.opts.map(c=>c.name).concat(g.none?['這學期不修']:[]);
  for(const pickName of L){ const picks=[]; for(const g2 of GROUPS.filter(x=>x.term===g.term)) picks.push(g2===g?pickName:null);   /* 同一學期其他組＝預設（null→第一個）*/
    const r=await run(g.term,picks); info(g.term+' '+g.group+' 選「'+pickName+'」：electives '+r.el);
    for(const c of g.opts){ const t=r.tk.includes(c.id), p=r.inP.has(c.id); { const x=EXC.has(c.id), w=x?false:t; check(g.term+' '+g.group+' 選「'+pickName+'」：'+c.name+'——'+(t?'修了':'沒修')+'＝'+(x?'二試選試科目、一試不收':(t?'要進題池':'不進題池'))+'（現在：'+(p?'在':'不在')+'）',p===w,J({taken:t,inPool:p})); } } } }
console.log('\n'+(FAILS?'FAILED '+FAILS:'ALL PASS '+PASSES)+'（判定歸 BB）');
process.exit(FAILS?1:0);
})();
