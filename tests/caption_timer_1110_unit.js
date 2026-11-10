// 字幕計時（BB 11-10 P1 X199_ANROUTE r2、P2 GUIDE_063）
//   1. 連續兩句間隔 3250／3300／3350 ms：第二句顯示期間 #caption 沒有被上一句的 300 ms hide 藏掉（舊版 3300 FAIL）
//   2. caption.until＝這一句淡完的時間
//   3. story3d.js 環境字幕（AMBIENT）在畫面還有字幕時先不播（看 GM.caption.until）
// 用法：node tests/caption_timer_1110_unit.js [src/game3d.js 的路徑]
'use strict';
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const gsrc=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
const ssrc=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info!==undefined?'　'+info:'')); if(!ok) fails++; };
const m=gsrc.match(/function caption\(who,text,ms\)\{[^\n]*?\},ms\|\|3200\); \}/);
check('0. 找得到 game3d.js 的 caption()',!!m);
function make(){ let now=0, q=[], id=0;
  const st=(fn,ms)=>{ const o={id:++id,at:now+ms,fn}; q.push(o); return o.id; }, ct=i=>{ q=q.filter(o=>o.id!==i); };
  const run=to=>{ for(;;){ q.sort((a,b)=>a.at-b.at); const o=q[0]; if(!o||o.at>to) break; q.shift(); now=o.at; o.fn(); } now=to; };
  const cls=new Set(['hide']); const el={innerHTML:'',style:{opacity:0},classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c)}};
  const DateS={now:()=>now};
  const f=new Function('setTimeout','clearTimeout','Date','$','dlgHSync','subst','GM',m[0]+'; return caption;')(st,ct,DateS,()=>el,()=>{},t=>t,{});
  return {cap:f,run,el,now:()=>now}; }
if(m){
  for(const gap of [3250,3300,3350,3500]){ const T=make(); T.cap('','第一句',3000); T.run(gap); T.cap('','第二句',3000);
    let hidden=false; for(let t=gap;t<=gap+2900;t+=50){ T.run(t); if(T.el.classList.contains('hide')||T.el.style.opacity===0) hidden=true; }
    check('1. 間隔 '+gap+' ms：第二句顯示的 2.9 秒裡沒被藏掉',!hidden&&T.el.innerHTML==='第二句');
    T.run(gap+3400); check('1. 間隔 '+gap+' ms：第二句時間到照常收起來',T.el.classList.contains('hide')); }
  const T=make(); T.cap('','一句',4600); check('2. caption.until＝4600＋300',T.cap.until===4900,T.cap.until);
}
const i=ssrc.indexOf('for(const a of AMBIENT)'); const pre=ssrc.slice(Math.max(0,i-600),i+80);
check('3. 環境字幕看 GM.caption.until，畫面還有字幕就先不播',i>0&&/GM\.caption\.until>Date\.now\(\)/.test(pre)&&/if\(capBusy\) break;/.test(pre));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
