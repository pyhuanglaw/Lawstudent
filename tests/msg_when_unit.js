// 手機訊息的時間字（game3d.js msgWhen）過了半夜照實際的那一天比（BB-B 10-31 n27 NIGHT_REAL）——不需要瀏覽器。
//   過了半夜 G.day 不換、G.hour 超過 24（例：25.5＝隔天 01:30）。原本拿訊息的 m.day 和 G.day 比：一路玩過午夜時，01:31 傳的訊息（m.day＝隔天）寫成「3/14 01:31」；
//   直接跳到 01:15（G.day 換了）才寫「今天 01:31」。修改後兩種一樣是「今天」，前一晚 23:00 的是「昨天」。
//   修改前第 1 項 FAIL。用法：node tests/msg_when_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const ctx={console}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,'src/data/calendar.js'),'utf8').replace(/^const CALENDAR\s*=/m,'this.CALENDAR='),ctx);
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), i=g.indexOf('const msgWhen='), j=g.indexOf('\n',i);
check('0. game3d.js 有 msgWhen',i>0);
const src=g.slice(i,j).replace(/\/\*[\s\S]*?\*\/\s*$/,'');
ctx.INV={hhmm:h=>{ const hh=Math.floor(h), mm=Math.round((h-hh)*60); return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }};
vm.runInContext('var G=null;'+src+'\nthis.msgWhen=msgWhen; this.setG=x=>{ G=x; };',ctx);
const d=100, md=k=>{ const q=ctx.CALENDAR.dateOf(k); return q.m+'/'+q.d; };
ctx.setG({day:d,hour:25.5});
check('1. 一路玩過午夜（G.day 不換、G.hour 25.5）：01:31 的訊息（m.day＝隔天）寫「今天 01:31」',ctx.msgWhen({day:d+1,h:1.52})==='今天 01:31',ctx.msgWhen({day:d+1,h:1.52}));
check('1. 同一個時候，前一晚 23:00 的訊息寫「昨天 23:00」',ctx.msgWhen({day:d,h:23})==='昨天 23:00',ctx.msgWhen({day:d,h:23}));
ctx.setG({day:d+1,hour:1.25});
check('2. 直接跳到 01:15（G.day 換了）：一樣是「今天 01:31」「昨天 23:00」',ctx.msgWhen({day:d+1,h:1.52})==='今天 01:31'&&ctx.msgWhen({day:d,h:23})==='昨天 23:00');
ctx.setG({day:d,hour:15});
check('3. 白天照舊：今天、昨天、更早寫日期',ctx.msgWhen({day:d,h:12})==='今天 12:00'&&ctx.msgWhen({day:d-1,h:9})==='昨天 09:00'&&ctx.msgWhen({day:d-3,h:9})===md(d-3)+' 09:00',ctx.msgWhen({day:d-3,h:9}));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
