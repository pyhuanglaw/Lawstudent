// 手機對話裡可以回的那一則不被固定的表頭蓋住（BB-B 11-07 AA716 學姊第 3 拍 P3；10:00 285c05052 PARTIAL：第一次點進對話串沒套用）——不需要瀏覽器（D131）。
// 檢查：1 askBelowHead 的算法（假的 DOM：那一則的頂端在表頭下面以上＝往上捲回來）；2 第一次點進對話串（列表 data-th、人物頁 data-msg）、自動打開（openPhone 帶 th）、
//       傳完訊息、對話裡重畫（捲在最下面）都會呼叫它。修改前 1、2 FAIL。用法：node tests/phone_ask_head_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const m=src.match(/  function askBelowHead\(body\)\{[^\n]*\n/);
check('1. game3d.js 有 askBelowHead',!!m);
if(m){ const fn=new Function('phoneThread','phoneTab',m[0]+'; return askBelowHead;');
  const mk=(itemTop,headH)=>{ const it={getBoundingClientRect:()=>({top:itemTop})}; const body={scrollTop:500,getBoundingClientRect:()=>({top:100}),querySelectorAll:q=>q==='[data-ask]'?[{closest:()=>it}]:[],querySelector:q=>q==='.thHead'?{offsetHeight:headH}:null}; return body; };
  const f=fn('p:heroine_05','msg'); const a=mk(120,60); f(a); const b=mk(200,60); f(b);
  const g=fn(null,'msg'); const c=mk(120,60); g(c);
  check('1. 那一則頂端被表頭蓋住 40 px＝往上捲 40；沒蓋住＝不動；不在對話裡＝不動',a.scrollTop===460&&b.scrollTop===500&&c.scrollTop===500,JSON.stringify([a.scrollTop,b.scrollTop,c.scrollTop])); }
const has=re=>re.test(src);
check('2. 列表點進對話串（data-th）：捲到最下面以後 askBelowHead',has(/\[data-th\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{ phoneThread=b\.dataset\.th;[^\n]*pb\.scrollTop=pb\.scrollHeight; askBelowHead\(pb\);/));
check('2. 人物頁傳訊息（data-msg）：同上',has(/\[data-msg\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{ phoneTab='msg'; phoneThread='p:'\+b\.dataset\.msg;[^\n]*askBelowHead\(pb\);/));
check('2. 自動打開某一段對話（openPhone 帶 th）：同上',has(/function openPhone\(tab,th\)\{[^\n]*if\(th\) askBelowHead\(pb\);/));
check('2. 對話裡重畫（捲在最下面）照舊',has(/if\(inTh&&phoneTab==='msg'&&phoneThread&&atEnd\) askBelowHead\(body\);/));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
