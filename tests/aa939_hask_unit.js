// AA_939（企劃線 bfe0185431，AA-C 2026-11-13，BB-C 照用；DLG-FULL-REVIEW-1110／CANON-NO-ECON-1112）：「她們主動約你」（src/data/heroine_asks.js）裡的舊設定句子——不需要瀏覽器。
//   1. 22 列（可昕 5、沛珊 8、以安 2、語彤 7）：新句在遊戲資料裡、舊句不在；新句都在 AA_939 稿上（tests/aa939_doc.js）
//   2. 可昕：日常、貓空不再有外校前提（首都帝大辦事、我在公館、我們學校後山、後山）
//   3. 沛珊：brunch 交往前那一句照留（AA_939：她在意菜怎麼做）
//   4. 以安：晨跑那一格換映月湖（invites.js lake）、傍晚 17:30；沒有 run_avenue 了（AA_565 S2）
//   5. 語彤：第一格一盞（here）、週六 15:00；寒暑假那一筆也是一盞、週六 15:00；yesBy 換一盞；沒有燒臘店（noodle）了
//      （她真的在一盞、傳得出去、答應的回覆、見面第一句：tests/heroine_asks_unit.js 第 9 項、tests/aa549_vacgap_unit.js 3-6）
// 修改前（開發分支 3cf99b0c73）：第 1、2、4、5 項 FAIL。用法：node tests/aa939_hask_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const SRC=fs.readFileSync(path.join(ROOT,'src/data/heroine_asks.js'),'utf8');
const ctx={}; vm.runInNewContext(SRC.replace(/^const HASK_DATA\s*=/m,'this.HASK_DATA='),ctx); const P=ctx.HASK_DATA.people;
const A=require('./aa939_doc.js');
const linesOf=id=>{ const p=P[id], L=[p.later,p.no,p.yes,p.yesOut].concat(Object.values(p.yesBy||{})); for(const e of p.daily.concat(p.out)) for(const v of ['pre','dat']) if(e[v]){ L.push(e[v].line); if(e[v].vac) L.push(e[v].vac.line); for(const a of e[v].alt||[]) L.push(a.line); }
  for(const k in (p.vacTerm||{})){ const x=p.vacTerm[k].v; L.push(x.line,x.first); } return L.filter(Boolean); };

// 1
check('1. 讀得到 AA_939（'+A.SHA+'）；表 22 列（可昕 5、沛珊 8、以安 2、語彤 7）',A.text.length>1000&&A.ROWS.length===22&&J(['kexin','classmate_peishan','heroine_01','heroine_03'].map(id=>A.ROWS.filter(r=>r[0]===id).length))===J([5,8,2,7]),A.text?'':'git fetch origin claude/magical-albattani-bk7b4n');
{ const bad=A.ROWS.filter(([id,o,n])=>!linesOf(id).includes(n)||SRC.includes(o)||(A.text&&!(A.has(n)&&A.has(o)))).map(r=>r.join('｜'));
  check('1. 每一列：新句在她的資料裡、舊句不在 heroine_asks.js、新舊都在 AA_939 稿上',!bad.length,J(bad)); }

// 2
{ const L=linesOf('kexin');
  check('2. 可昕：沒有外校前提（首都帝大辦事、我在公館、學校後山、從後山上去）',!L.some(t=>/首都帝大辦事|我在公館|學校後山|後山上去/.test(t)),J(L.filter(t=>/首都帝大|公館|後山/.test(t)))); }

// 3
check('3. 沛珊 brunch 交往前照留：「週六早上 SUNNY SIDE！我上次沒看清楚他們怎麼翻蛋。」',P.classmate_peishan.daily.find(e=>e.place==='brunch').pre.line==='週六早上 SUNNY SIDE！我上次沒看清楚他們怎麼翻蛋。');

// 4
{ const e=P.heroine_01.daily.find(q=>q.place==='lake'), inv=fs.readFileSync(path.join(ROOT,'src/data/invites.js'),'utf8');
  check('4. 以安：映月湖那一格（lake、門檻 5、明天傍晚 17:30）；沒有晨跑那一格',!!e&&e.th===5&&e.pre.d==='next'&&J(e.pre.h)==='[17.5]'&&e.dat.d==='next'&&J(e.dat.h)==='[17.5]'&&!P.heroine_01.daily.some(q=>q.place==='run_avenue'),J(e));
  check('4. invites.js 的 lake：17:30 是可以約的時間（times 有 17.5）',/\{id:'lake',[^\n]*times:\[17\.5,/.test(inv)); }

// 5
{ const p=P.heroine_03, e=p.daily[0];
  check('5. 語彤第一格：一盞、here、門檻 3、週六 15:00（交往前、交往中）',e.place==='teahouse'&&e.here===true&&e.th===3&&e.pre.d==='sat'&&J(e.pre.h)==='[15]'&&e.dat.d==='sat'&&J(e.dat.h)==='[15]',J(e));
  check('5. 語彤寒暑假：都是一盞、週六 15:00',['summer','winter'].every(k=>p.vacTerm[k].place==='teahouse'&&p.vacTerm[k].v.d==='sat'&&J(p.vacTerm[k].v.h)==='[15]'),J(p.vacTerm));
  check('5. 語彤 yesBy 只有一盞「好。……我跟蘇姨說。」；資料裡沒有燒臘店（noodle）',J(p.yesBy)===J({teahouse:'好。……我跟蘇姨說。'})&&!p.daily.some(q=>q.place==='noodle')&&!Object.values(p.vacTerm).some(v=>v.place==='noodle'));
  check('5. 註解不再寫「她顧店的麵店」',!/她顧店的麵店|語彤顧店的麵店/.test(SRC)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
