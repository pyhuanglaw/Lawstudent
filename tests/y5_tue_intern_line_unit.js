// BB 11:20 P3（K1 子代理留下的）：大五上週二有重修、也有實習——今日頁那一行兩個都寫（原本只寫課，實習不見）。
// 修改前：第 1 項 FAIL。用法：node tests/y5_tue_intern_line_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H; const fs=require('fs'), vm=require('vm'), path=require('path');
for(const f of ['src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js']){ const src=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const (Y5|R2Y4B)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
H.fresh('2029-09-03',8,'dorm',{}); let d=PG.DK('2029-09-03'); while(CALENDAR.dateOf(d).wd!==2) d++;
const c0=Y5.classItems, i0=Y5.internOn, t0=Y5.term;
Y5.term=()=>({id:'Y5S1',week:1}); Y5.internOn=()=>true; Y5.classItems=()=>[{t0:13+10/60,label:'重修：刑事訴訟法'}];
try{
  const L=Y5.dayLine(H.G,d); check('1. 週二有重修＋實習：兩個都寫',/重修：刑事訴訟法/.test(L)&&L.indexOf(Y5.INTERN_TEXT)>=0,L);
  Y5.classItems=()=>[]; check('2. 週二只有實習：照舊「今天：法律實習…」',Y5.dayLine(H.G,d)==='今天：'+Y5.INTERN_TEXT,Y5.dayLine(H.G,d));
  Y5.internOn=()=>false; Y5.classItems=()=>[{t0:9+10/60,label:'重修：保險法'}]; check('3. 沒有實習：只寫課',!/實習/.test(Y5.dayLine(H.G,d)),Y5.dayLine(H.G,d));
} finally { Y5.classItems=c0; Y5.internOn=i0; Y5.term=t0; }
H.done();
