// 新手提示至少顯示 6 秒，別的通知排在後面（BB 11-12 HELP-GUIDE FAIL P2：「花錢」那則 1.7 秒就被下一則通知換掉）。
// 用法：node tests/hint_toast_hold_1112_unit.js。把 game3d.js 的通知條那一段（toastShow／toastPump／toast）抽出來，在假的時鐘和假的 #toast 上跑；不是瀏覽器。
const fs=require('fs'), path=require('path'), src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const a=src.indexOf('const TQ=[];'), b=src.indexOf('GM.toast=toast;'); const seg=src.slice(a,b).split('\n').filter(l=>/TQ|toastShow|toastPump|function toast|tHide=setTimeout|tHeld|isPhone|tWatch|if\(t===tCur\)/.test(l)).join('\n');
let now=0; const timers=[]; const el={textContent:'',style:{},classList:{remove(){},add(){}}}; const shown=[];
const env={ $:()=>el, Date:{now:()=>now}, setTimeout:(f,ms)=>{ const t={f,at:now+ms}; timers.push(t); return t; }, clearTimeout:t=>{ const i=timers.indexOf(t); if(i>=0) timers.splice(i,1); } };
const ivs=[]; const setIv=(f,ms)=>{ const o={dead:false}; const tick=()=>{ if(o.dead) return; f(); if(!o.dead) env.setTimeout(tick,ms); }; env.setTimeout(tick,ms); ivs.push(o); return o; }, clrIv=o=>{ if(o) o.dead=true; };
global.JOBS={running:false};
const toast=new Function('$','Date','setTimeout','clearTimeout','setInterval','clearInterval',seg+'\nreturn toast;')(env.$,env.Date,env.setTimeout,env.clearTimeout,setIv,clrIv);
const adv=ms=>{ const end=now+ms; for(;;){ timers.sort((x,y)=>x.at-y.at); const t=timers[0]; if(!t||t.at>end) break; timers.shift(); now=t.at; t.f(); if(el.textContent!==shown[shown.length-1]?.t) shown.push({t:el.textContent,at:now}); } now=end; };
const say=(t,ms,hold)=>{ toast(t,ms,hold); if(el.textContent!==shown[shown.length-1]?.t) shown.push({t:el.textContent,at:now}); };
say('提示',6500,6000); adv(1700); say('別的通知',2200); adv(100);
check('1. 提示出現 1.7 秒時來了別的通知：畫面上還是提示',el.textContent==='提示');
adv(4100); check('1. 5.9 秒：還是提示',el.textContent==='提示');
adv(300); check('1. 6 秒以後換成排著的那一則',el.textContent==='別的通知',JSON.stringify(shown));
now+=10000; timers.length=0; shown.length=0; say('一般 A',2200); adv(1000); say('一般 B',2200); adv(100);
check('2. 一般通知照舊：前一則不到 1.5 秒＝排著；滿 1.5 秒就換',el.textContent==='一般 A'); adv(500); check('2. 1.6 秒換成 B',el.textContent==='一般 B');
now+=10000; timers.length=0; shown.length=0; el.textContent='';
JOBS.running=true; say('手機｜可昕：我們這一天。',3800); say('一般通知',2200); adv(5000);
check('4. 上班中：手機訊息橫幅不出（一般通知照出）',!shown.some(x=>/^手機｜/.test(x.t))&&shown.some(x=>x.t==='一般通知'),JSON.stringify(shown));
JOBS.running=false; adv(3000); check('4. 下班以後一秒內補出那一則',shown.some(x=>x.t==='手機｜可昕：我們這一天。'),JSON.stringify(shown));
shown.length=0; say('手機｜平常的訊息',3800); check('4. 不上班的時候照舊馬上出',el.textContent==='手機｜平常的訊息');
/* 上班前一刻出的橫幅（CC 11-12 SHIFT_SHOTS_72fc：南洋上班第一句上面掛著「手機｜可昕：我們選一天…」） */
adv(10000); shown.length=0; JOBS.running=false; say('手機｜上班前一刻',3800); const before=el.textContent; JOBS.running=true; adv(300);
check('5. 橫幅在畫面上的時候開始上班：0.3 秒內收起來（修改前：照樣掛到 3.8 秒）',before==='手機｜上班前一刻'&&el.textContent==='',JSON.stringify([before,el.textContent]));
adv(5000); check('5. 上班中不再出現',el.textContent===''); JOBS.running=false; adv(1500); check('5. 下班以後補出',el.textContent==='手機｜上班前一刻',el.textContent);
adv(10000); shown.length=0; say('提示 X',6500,6000); say('手機｜排著的',3800); JOBS.running=true; adv(7000);
check('5. 排著還沒出的手機橫幅，上班開始以後也不出',!shown.some(x=>x.t==='手機｜排著的'),JSON.stringify(shown)); JOBS.running=false; adv(1500); check('5. 下班以後補出排著的那一則',el.textContent==='手機｜排著的',el.textContent);
const h=fs.readFileSync(path.join(__dirname,'..','src/hints3d.js'),'utf8');
check('3. hints3d.js 出提示時帶 HOLD_MS（6000）',/S\.HOLD_MS=6000/.test(h)&&/GM\.toast\(txt,S\.SHOW_MS,S\.HOLD_MS\)/.test(h));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
