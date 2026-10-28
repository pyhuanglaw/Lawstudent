// MEMO-NO-EVID-1028（LAWWW-C 2026-10-28，AA_522 第 8 節子代理回報）：沒有標題的事件演完，原本 events3d.js 的 GM.memo(ev.title||ev.id) 把 ev_xxx 寫進筆記頁「日誌」（events.js 有 39 個標題空白的事件）。
// 改成：有標題才記；舊存檔裡已經寫進去的 ev_ 代號，日誌不顯示（STORY.memoShown，game3d.js 筆記頁用它）。
// 修改前（只拿掉 src 的改動：events3d.js、story3d.js、game3d.js）：FAILED 4、PASS 0；修改後 ALL PASS（4 項）。
// 用法：node tests/memo_no_evid_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const ev3=fs.readFileSync(path.join(H.ROOT,'src/events3d.js'),'utf8'), g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
(async()=>{
  check('1. events3d.js：有標題才寫日誌（沒有 GM.memo(ev.title||ev.id)）',!/memo\(ev\.title\|\|ev\.id\)/.test(ev3)&&/if\(ev\.title\) GM\.memo\(ev\.title\)/.test(ev3));
  H.fresh('2025-09-10',10,'campus',{}); H.G.memo=[];
  const memo0=GM.memo; GM.memo=t=>H.G.memo.push(t&&typeof t==='object'?Object.assign({day:H.G.day},t):{day:H.G.day,t});
  const A={id:'ev_memo_test_untitled',participants:[],location:'any',trigger:'manual',once:true,dialogue:[{speaker:null,text:'（測試）'}]}, B=Object.assign({},A,{id:'ev_memo_test_titled',title:'測試的標題'});
  try{ await EVENTS.run(A); await EVENTS.run(B); } finally { GM.memo=memo0; }
  check('2. 演一個沒有標題的事件＝日誌不多一筆；有標題的照舊記標題',H.G.memo.length===1&&H.G.memo[0].t==='測試的標題',J(H.G.memo));
  H.G.memo=[{day:H.G.day,t:'ev_prof_lin_nod'},{day:H.G.day,t:'和學姊吃了滷肉飯'},{day:H.G.day,t:''}];
  const shown=typeof STORY!=='undefined'&&STORY.memoShown?STORY.memoShown(H.G).map(m=>m.t):null;
  check('3. 舊存檔裡的 ev_ 代號、空白那一筆，日誌不顯示（STORY.memoShown）；一般的句子照舊',J(shown)===J(['和學姊吃了滷肉飯']),J(shown));
  check('4. game3d.js 筆記頁的日誌用 STORY.memoShown',/'<b>日誌<\/b>'\+\(typeof STORY!=='undefined'&&STORY\.memoShown\?STORY\.memoShown\(G\):G\.memo\)\.slice\(-8\)/.test(g3));
  if(H.fails){ console.log('FAILED '+H.fails); process.exit(1); } console.log('ALL PASS');
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
