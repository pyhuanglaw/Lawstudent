// JOURNAL-CALENDAR-1103（使用者 11-03：「日誌跟筆記同一頁太亂了 我希望日誌以月曆出現 發生什麼事就寫在當天日期那一格 可以查詢」）
// 選單多一個「日誌」分頁（src/journal3d.js）：月曆一個月一頁、那一天的事寫在那一格、點一格看全部、上面可以查詢；筆記頁不再列日誌。
// 修改前：JOURNAL 不存在、index.html 沒有「日誌」分頁、game3d.js 筆記頁還列日誌（FAIL）；修改後 ALL PASS。
// 用法：node tests/journal_calendar_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const {check}=H, J=JSON.stringify;
const jf=path.join(H.ROOT,'src/journal3d.js');
if(fs.existsSync(jf)) vm.runInThisContext(fs.readFileSync(jf,'utf8').replace(/^const JOURNAL\s*=/m,'globalThis.JOURNAL='),{filename:jf});
const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
(async()=>{
  const JR=typeof JOURNAL!=='undefined'?JOURNAL:null;
  check('1. JOURNAL 存在（src/journal3d.js）',!!JR);
  check('2. 選單有「日誌」分頁、日誌月曆的容器；journal3d.js 在 game3d.js 之前載入',/data-tab="journal">日誌</.test(idx)&&/id="tab-journal"/.test(idx)&&idx.indexOf('src/journal3d.js')>0&&idx.indexOf('src/journal3d.js')<idx.indexOf('src/game3d.js'));
  check('3. 筆記頁不再列日誌（game3d.js 沒有 <b>日誌</b>），打開選單時畫月曆',!/<b>日誌<\/b>/.test(g3)&&/JOURNAL\.render\(\$\('journalBox'\),G\)/.test(g3));
  if(!JR){ console.log('FAILED'); process.exit(1); }
  H.fresh('2025-08-24',20,'dorm',{}); const G=H.G, D=k=>STORY.dayOfKey(k);
  G.memo=[{day:D('2025-08-23'),t:'迎新宿營：法律闖關'},{day:D('2025-08-23'),t:'迎新宿營：水大地'},{day:D('2025-08-23'),t:'迎新宿營：烤肉'},{day:D('2025-08-24'),t:'迎新宿營：結業式'},{day:D('2025-08-24'),t:'ev_old_code'},{day:D('2025-09-01'),t:'開學第一天'}];
  check('4. 日期換算：2025/8/23 ↔ 遊戲日',JR.dayOfYMD(2025,8,23)===D('2025-08-23')&&JR.label(D('2025-08-23'))==='8/23');
  const M=JR.month(G,2025,8), cells=M.weeks.flat(), c23=cells.find(c=>c.inMonth&&c.d===23), c24=cells.find(c=>c.inMonth&&c.d===24);
  check('5. 2025 年 8 月：一週從週一開始（8/1 週五＝第 5 格）、每週 7 格',M.weeks.every(w=>w.length===7)&&cells.findIndex(c=>c.inMonth&&c.d===1)===4,J(cells.slice(0,7).map(c=>c.d)));
  check('6. 8/23 那一格有三件事、8/24 一件（ev_ 代號不顯示）',!!c23&&c23.items.map(e=>e.t).join('|')==='迎新宿營：法律闖關|迎新宿營：水大地|迎新宿營：烤肉'&&!!c24&&c24.items.length===1,J([c23&&c23.items,c24&&c24.items]));
  JR.reset(); let h=JR.html(G);
  check('7. 畫面：標題 2025 年 8 月、8/23 那一格寫兩件＋「＋1」、今天（8/24）框起來、下面列今天的紀錄',/2025 年 8 月/.test(h)&&/迎新宿營：法律闖關/.test(h)&&/＋1/.test(h)&&/jrNow/.test(h)&&/<div class="jrDay"><b>8\/24<\/b><div>· 迎新宿營：結業式<\/div>/.test(h),h.slice(0,300));
  JR.act(G,'day',D('2025-08-23')); h=JR.html(G);
  check('8. 點 8/23：下面列那一天的三件',/<div class="jrDay"><b>8\/23<\/b><div>· 迎新宿營：法律闖關<\/div><div>· 迎新宿營：水大地<\/div><div>· 迎新宿營：烤肉<\/div>/.test(h));
  JR.act(G,'next'); h=JR.html(G); check('9. 下個月：2025 年 9 月，9/1 有「開學第一天」',/2025 年 9 月/.test(h)&&/開學第一天/.test(h));
  JR.act(G,'prev'); JR.act(G,'prev'); h=JR.html(G); check('10. 往前兩個月：2025 年 7 月（沒有紀錄也畫得出來）',/2025 年 7 月/.test(h)&&!/迎新/.test(h.split('jrDay')[0]));
  JR.act(G,'today'); h=JR.html(G); check('11. 「今天」回到 2025 年 8 月',/2025 年 8 月/.test(h));
  const R=JR.search(G,'宿營'); check('12. 查詢「宿營」：四筆、由新到舊（結業式在最前面）',R.length===4&&R[0].t==='迎新宿營：結業式',J(R.map(e=>e.t)));
  check('13. 查詢日期「8/23」：三筆；查「烤肉 宿營」（兩個字都要有）：一筆；查不到的：空',JR.search(G,'8/23').length===3&&JR.search(G,'烤肉 宿營').length===1&&JR.search(G,'沒有這件事').length===0);
  JR.act(G,'q','烤肉'); h=JR.html(G); check('14. 搜尋框有字：列出結果（8/23　迎新宿營：烤肉），點結果跳到那一天',/8\/23<\/span>　迎新宿營：烤肉/.test(h)&&new RegExp('class="jrHit" data-jrday="'+D('2025-08-23')+'"').test(h),h.slice(0,400));
  JR.act(G,'day',D('2025-09-01')); const v=JR.view(); check('15. 點搜尋結果（9/1）：跳到 9 月、選那一天、搜尋框清空',v.y===2025&&v.m===9&&v.sel===D('2025-09-01')&&v.q==='',J(v));
  G.memo.push({day:D('2025-08-24'),t:'<script>x</script>'}); JR.reset(); h=JR.html(G); check('16. 紀錄的字會跳脫（不會被當成 HTML）',!h.includes('<script>x</script>')&&h.includes('&lt;script&gt;'));
  console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
