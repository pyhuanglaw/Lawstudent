// ATTEND-ROLLCALL-1102（使用者 11-02「教授通常是隨機點名 一年只點名幾次」→ 選「改成隨機點名日」；AA_574 末節）——不需要瀏覽器。
//   a 看出席的課每學期 4 個點名週（第 2～7、10～15 週；照存檔種子；每門課不一樣；同一份存檔每次一樣）
//   b 新遊戲：只去不是點名的那幾堂（出席 10 次）、點名日全缺＝不及格
//   c 只去了 2 個點名日（出席只有 2 次）＝及格（缺 2 次，不到 3 次）
//   d 舊存檔（這學期在改規則以前就開始了）：出席 ≥3 照舊及格，不會突然被當
//   e 法律課不點名：沒有點名週
// 修改前（82f8d28c5）：a、b、c、e FAIL。用法：node tests/attend_rollcall_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const C=id=>COURSES.list.find(c=>c.id===id);
const itemsOf=(G,cid,term)=>{ const out=[]; for(let d=-500;d<900;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term) continue; for(const it of CLS.dayItems(G,d)) if(it.c.id===cid) out.push(it); } return out; };
const go=(G,its)=>{ const R=CLS.rec(G); for(const it of its){ R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; } };
const fresh=()=>{ const G=H.fresh('2025-09-01',8,'dorm',{examSeed:777}); CLS.rec(G); return G; };
/* a */
{ const G=fresh(); const w=CLS.rollWeeks?CLS.rollWeeks(G,C('chinese_y1'),'Y1S1'):null, w2=CLS.rollWeeks?CLS.rollWeeks(G,C('english_y1'),'Y1S1'):null;
  const ok=w&&w.length===4&&new Set(w).size===4&&w.every(x=>(x>=2&&x<=7)||(x>=10&&x<=15));
  check('a. 國文（上）4 個點名週，在第 2～7、10～15 週；同一份存檔再算一次一樣；和英文不一樣',!!ok&&J(w)===J(CLS.rollWeeks(G,C('chinese_y1'),'Y1S1'))&&J(w)!==J(w2),J({w,w2})); }
/* b */
{ const G=fresh(); G.courses.rollSince=-9999; const c=C('chinese_y1'), w=CLS.rollWeeks?CLS.rollWeeks(G,c,'Y1S1'):[]; const its=itemsOf(G,'chinese_y1','Y1S1');
  go(G,its.filter(it=>!w.includes(it.week))); const f=CLS.failedIn(G,'Y1S1').map(x=>x.id); const rep=CLS.reportFor(G,'Y1S1');
  check('b. 只去不是點名的那幾堂（出席 '+(CLS.rec(G).attend.chinese_y1||0)+' 次）、點名日全缺＝不及格',f.includes('chinese_y1')&&/^不及格/.test(rep.chinese_y1||''),J({f,rep:rep.chinese_y1,w})); }
/* c */
{ const G=fresh(); G.courses.rollSince=-9999; const c=C('chinese_y1'), w=CLS.rollWeeks?CLS.rollWeeks(G,c,'Y1S1'):[]; const its=itemsOf(G,'chinese_y1','Y1S1');
  go(G,its.filter(it=>w.slice(0,2).includes(it.week))); const f=CLS.failedIn(G,'Y1S1').map(x=>x.id); const rep=CLS.reportFor(G,'Y1S1');
  check('c. 只去了 2 個點名日（出席 2 次）＝及格（缺 2 次）',!f.includes('chinese_y1')&&rep.chinese_y1==='及格',J({f,rep:rep.chinese_y1,att:CLS.rec(G).attend.chinese_y1,w})); }
/* d */
{ const G=fresh(); G.courses.rollSince=PG.DK('2025-11-01'); const c=C('chinese_y1'), w=CLS.rollWeeks?CLS.rollWeeks(G,c,'Y1S1'):[]; const its=itemsOf(G,'chinese_y1','Y1S1');
  go(G,its.filter(it=>!w.includes(it.week)).slice(0,3)); const f=CLS.failedIn(G,'Y1S1').map(x=>x.id);
  check('d. 舊存檔（這學期在改規則以前就開始）：出席 3 次照舊及格，點名日缺了也不會突然被當',!f.includes('chinese_y1'),J({f,att:CLS.rec(G).attend.chinese_y1})); }
/* e */
{ const G=fresh(); const w=CLS.rollWeeks?CLS.rollWeeks(G,C('civ_general'),'Y1S1'):null;
  check('e. 法律課（考五題）不點名：沒有點名週',Array.isArray(w)&&w.length===0,J(w)); }
H.done();
