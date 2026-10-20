// 「紀錄」面板每句只有一次（BB-C 2026-10-20 c5001da8 回報：事件裡的手機句 events3d.js 先 ADV.log 一次，GM.say 在 ADV 開著時又記一次）——不需要瀏覽器。
//   1. events3d.js 的 phone／phoneMe 句：ADV 開著的時候不自己記（交給 GM.say）
//   2. game3d.js 的 say：ADV 開著才記（沒開的時候事件那邊記）
// 修改前：第 1 項 FAIL。用法：node tests/adv_log_once_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const ev=fs.readFileSync(path.join(ROOT,'src/events3d.js'),'utf8'), gm=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const raw=(ev.match(/ADV\.log\((G\.name|nm)\+'（手機）',text\)/g)||[]).length, guarded=(ev.match(/if\(!ADV\.active\) ADV\.log\((G\.name|nm)\+'（手機）',text\)/g)||[]).length;
check('1. 事件的手機句（phone、phoneMe）：ADV 開著時不自己記，兩處都有守門', raw===2&&guarded===2, raw+'/'+guarded);
check('1b. 事件的一般台詞（events3d.js runLines 的 text 句）、法律課堂（legal3d.js 兩處）：ADV 開著時不自己記', /if\(!ADV\.active\) ADV\.log\(who\?who\.name:'',text\); await GM\.say\(who,text/.test(ev)&&(()=>{ const lg=fs.readFileSync(path.join(ROOT,'src/legal3d.js'),'utf8'); return /if\(!ADV\.active\) ADV\.log\(byName,t\)/.test(lg)&&/if\(!ADV\.active\) ADV\.log\(cn,t\)/.test(lg); })());
check('2. GM.say 在 ADV 開著時記一次', /if\(typeof ADV!=='undefined'&&ADV\.active\)\{[^\n]*ADV\.log\(who\?\(who\.name\|\|''\):'',D\.full\)/.test(gm));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
