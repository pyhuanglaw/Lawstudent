// D118-B3（BB 07:01 ③）：學期中的快轉停在「考前一週」的系統提醒（週日 20:00）時，選單直接列「考前總複習」（一鍵）；
//   a 選總複習＝當場複習（3 小時、範圍內的卡都讀過），停下來不再快轉（不會跳過期末考）
//   b 選「繼續快轉」＝接著快轉，期末考那天一定停（考試是有劇情的課）
//   c 選「先停在這裡」＝停在提醒那一刻
// 修改前（6ba2a22ad）：快轉停在提醒時沒有這個選單，a、c FAIL。用法：node tests/semff_review_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); let src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/loans3d.js','src/y2b3d.js','src/r2y3a3d.js','src/r2y4b3d.js','src/semff3d.js','src/data/study_units.js','src/study3d.js']) load(f);
let picks=[], menus=[];
GM.choose=async o=>{ menus.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(want){ const k=o.findIndex(q=>String(q.t||q.text).includes(want)); if(k>=0) return k; } return 0; };
GM.toast=()=>{}; GM.caption=()=>{}; GM.phoneThread=async()=>{};
const wd=d=>CALENDAR.dateOf(d).wd;
const lbl=G=>CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2);
const run=async(pk)=>{ const sun=STUDY.remindDay('Y1S1'); H.fresh(CALENDAR.dateOf(sun-1).key,22,'dorm',{EXCHANGE_ROUTE:'TW'}); const G=H.G; G.weekday=wd(G.day)%7; menus=[]; picks=['到下一個有事的時候'].concat(pk);
  const r=await SEMFF.menu(GM); return {G,r,sun,menus:menus.slice()}; };
(async()=>{
  { const {G,r,sun,menus}=await run(['考前總複習']); const m=menus.find(x=>x.includes(STUDY.REVIEW_LABEL));
    check('a1. 快轉停在週日 20:00 的提醒：選單有「'+STUDY.REVIEW_LABEL+'」「繼續快轉」「先停在這裡」',!!m&&m.includes('繼續快轉')&&m.includes('先停在這裡'),J(menus));
    const info=STUDY.reviewInfo(G,'final'); const rd=info?info.courses.every(x=>x.units.every(u=>['read','got'].includes(STUDY.stateOf(G,u.id)))):false;
    check('a2. 選了就複習：範圍內的卡都讀過、時間是週日 23:00（20:00＋3 小時）、停下來（why review）',rd&&G.day===sun&&Math.abs(G.hour-23)<0.3&&r&&r.why==='review',J({at:lbl(G),why:r&&r.why,rd})); }
  { const {G,r,sun}=await run(['繼續快轉']); const ex=CLS.examList(G,'Y1S1').map(e=>e.day).sort((a,b)=>a-b)[0];
    check('b. 選「繼續快轉」：接著快轉，停在期末考那天或以前（不會跳過考試）',G.day>sun&&G.day<=ex&&r&&r.why!=='review',J({at:lbl(G),ex:CALENDAR.dateOf(ex).key,why:r&&r.why,stop:r&&r.stop&&r.stop.why})); }
  { const {G,r,sun}=await run(['先停在這裡']); check('c. 選「先停在這裡」：停在週日 20:00 左右',G.day===sun&&G.hour>=20&&G.hour<21&&r&&r.why==='review_stop',J({at:lbl(G),why:r&&r.why})); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
