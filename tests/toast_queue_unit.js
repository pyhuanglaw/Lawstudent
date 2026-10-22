// 提示一次一則（UI-MONEY-TOAST-ADV-1021；BB 10-21 經濟系天天睡覺：12/13 生活費的提示 24 次有 1 次看不到）——不需要瀏覽器。
// 檢查（假的時鐘、假的 DOM，跑 game3d.js 的 toast 那一段）：
//   1. 生活費的提示出來 0.3 秒就有新的提示：生活費那句還在（至少 1.5 秒），新的排在後面、之後才出來；
//   2. 同一句還在畫面上又來一次＝延長，不排第二次；同一句已經在排＝不重複；
//   3. 前一則已經出現超過 1.5 秒：新的直接換上（不用等）。
// 修改前：新的提示直接蓋掉，第 1 項 FAIL。用法：node tests/toast_queue_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
/* 取出 toast 函式（新版是 TQ…toast.queue 那一段；舊版只有 function toast 一行）*/
let body; { const i=src.indexOf('  const TQ=[];'); if(i>=0){ const j=src.indexOf('toast.queue=()=>',i); body=src.slice(i,src.indexOf('\n',j)); } else { const k=src.indexOf('  function toast(t,ms)'); body=src.slice(k,src.indexOf('\n',k)); } }
let now=0; const timers=[];
const setT=(f,ms)=>{ const t={at:now+(ms||0),f}; timers.push(t); return t; }, clearT=t=>{ const k=timers.indexOf(t); if(k>=0) timers.splice(k,1); };
const el={textContent:'',style:{},classList:{h:true,remove(){this.h=false},add(){this.h=true}}};
const toast=new Function('$','setTimeout','clearTimeout','Date',body+'; return toast;')(()=>el,setT,clearT,{now:()=>now});
const run=ms=>{ const end=now+ms; for(;;){ timers.sort((a,b)=>a.at-b.at); const t=timers[0]; if(!t||t.at>end) break; timers.shift(); now=t.at; t.f(); } now=end; };
const shown=()=>el.classList.h?'':el.textContent;
const A='家裡匯來這個月的生活費：5,000 元', B='📓 筆記：補習班';
toast(A,3800); run(300); toast(B,2200); run(100);
const at400=shown(); run(1200); const at1600=shown();
check('1. 生活費的提示出來 0.3 秒就有新的：生活費那句還在（至少 1.5 秒），新的之後才出來',at400===A&&at1600===B,JSON.stringify({at400,at1600}));
run(5000); toast(A,2000); run(500); toast(A,2000); run(100); const q1=toast.queue?toast.queue():[]; toast(B,2000); toast(B,2000); const q2=toast.queue?toast.queue():[];
check('2. 同一句還在畫面上又來一次＝延長、不排第二次；同一句已經在排＝不重複',shown()===A&&q1.length===0&&q2.filter(x=>x===B).length===1,JSON.stringify({q1,q2}));
run(5000); toast(A,4000); run(2000); toast(B,2000); const at=shown();
check('3. 前一則已經出現超過 1.5 秒：新的直接換上',at===B,at);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
