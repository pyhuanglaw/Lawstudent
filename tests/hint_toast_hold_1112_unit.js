// 新手提示至少顯示 6 秒，別的通知排在後面（BB 11-12 HELP-GUIDE FAIL P2：「花錢」那則 1.7 秒就被下一則通知換掉）。
// 用法：node tests/hint_toast_hold_1112_unit.js。把 game3d.js 的通知條那一段（toastShow／toastPump／toast）抽出來，在假的時鐘和假的 #toast 上跑；不是瀏覽器。
const fs=require('fs'), path=require('path'), src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const a=src.indexOf('const TQ=[];'), b=src.indexOf('GM.toast=toast;'); const seg=src.slice(a,b).split('\n').filter(l=>/TQ|toastShow|toastPump|function toast|tHide=setTimeout/.test(l)).join('\n');
let now=0; const timers=[]; const el={textContent:'',style:{},classList:{remove(){},add(){}}}; const shown=[];
const env={ $:()=>el, Date:{now:()=>now}, setTimeout:(f,ms)=>{ const t={f,at:now+ms}; timers.push(t); return t; }, clearTimeout:t=>{ const i=timers.indexOf(t); if(i>=0) timers.splice(i,1); } };
const toast=new Function('$','Date','setTimeout','clearTimeout',seg+'\nreturn toast;')(env.$,env.Date,env.setTimeout,env.clearTimeout);
const adv=ms=>{ const end=now+ms; for(;;){ timers.sort((x,y)=>x.at-y.at); const t=timers[0]; if(!t||t.at>end) break; timers.shift(); now=t.at; t.f(); if(el.textContent!==shown[shown.length-1]?.t) shown.push({t:el.textContent,at:now}); } now=end; };
const say=(t,ms,hold)=>{ toast(t,ms,hold); if(el.textContent!==shown[shown.length-1]?.t) shown.push({t:el.textContent,at:now}); };
say('提示',6500,6000); adv(1700); say('別的通知',2200); adv(100);
check('1. 提示出現 1.7 秒時來了別的通知：畫面上還是提示',el.textContent==='提示');
adv(4100); check('1. 5.9 秒：還是提示',el.textContent==='提示');
adv(300); check('1. 6 秒以後換成排著的那一則',el.textContent==='別的通知',JSON.stringify(shown));
now+=10000; timers.length=0; shown.length=0; say('一般 A',2200); adv(1000); say('一般 B',2200); adv(100);
check('2. 一般通知照舊：前一則不到 1.5 秒＝排著；滿 1.5 秒就換',el.textContent==='一般 A'); adv(500); check('2. 1.6 秒換成 B',el.textContent==='一般 B');
const h=fs.readFileSync(path.join(__dirname,'..','src/hints3d.js'),'utf8');
check('3. hints3d.js 出提示時帶 HOLD_MS（6000）',/S\.HOLD_MS=6000/.test(h)&&/GM\.toast\(txt,S\.SHOW_MS,S\.HOLD_MS\)/.test(h));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
