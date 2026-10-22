// 排進行程的提示（UX-GROUP-NOTICE-1018；使用者：「河濱烤肉有看到通知但不知道怎麼去」）——不需要瀏覽器。
// 檢查：答應了活動、OUT.plan 排進行程時出提示——第一次說「時間到會跳出『出發』，手機的『今天』也看得到」，之後只說排進了什麼；
//       已經過了的時間、標題畫面、經濟系 30 分鐘版（事件接事件直接帶過去）、同一個 id 再排一次都不說；早上的「今天還有」寫「時間到會跳出『出發』」。
// 修改前：OUT.plan 不出任何提示，第 1、2 項 FAIL。用法：node tests/plan_toast_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const toasts=[]; global.GAME={titleIdle:false,toast:(t)=>toasts.push(t)}; global.INV={hhmm:h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0')};
global.CALENDAR={dateOf:d=>({m:9,d:d,wd:(d+1)%7})};
const G={day:20,hour:21,flags:{},outings:[]};
OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:23,h:15,place:'河濱',title:'中秋烤肉'});
check('1. 第一次排進行程：說日期、時間、活動，和「時間到會跳出『出發』，手機的『今天』也看得到」',toasts.length===1&&/9\/23（.）\s*15:00\s+中秋烤肉/.test(toasts[0])&&/時間到會跳出「出發」/.test(toasts[0])&&/今天/.test(toasts[0]),JSON.stringify(toasts));
G.hour=21.25; OUT.plan(G,{id:'y2_mid',ev:'ev_y2_midautumn',day:20,h:22,place:'公館的河濱',title:'中秋（河濱）'});
check('2. 之後再排：只說排進了什麼（今天 22:00），不再重複說明',toasts.length===2&&/^排進行程：今天 22:00/.test(toasts[1])&&!/跳出/.test(toasts[1]),JSON.stringify(toasts[1]));
OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:23,h:15,place:'河濱',title:'中秋烤肉'});
check('3. 同一個 id 再排一次（已經排過）：不說',toasts.length===2);
OUT.plan(G,{id:'past',ev:'ev_x',day:20,h:9,title:'早上的事'});
check('4. 時間已經過了：不說',toasts.length===2);
GAME.titleIdle=true; OUT.plan(G,{id:'t1',ev:'ev_t',day:25,h:10,title:'標題畫面'}); GAME.titleIdle=false;
check('5. 標題畫面：不說',toasts.length===2);
global.ECONFF={short:()=>true,cutId:()=>false}; OUT.plan(G,{id:'e1',ev:'ev_y0_e08',day:24,h:17,title:'中秋系烤'}); delete global.ECONFF;
check('6. 經濟系 30 分鐘版（事件接事件直接帶過去）：不說',toasts.length===2);
G.hour=21.5; OUT.plan(G,{id:'v1',ev:'ev_vac_key',day:26,h:14,title:'寒假活動第一天'}); OUT.plan(G,{id:'v2',ev:'ev_vac_key',day:27,h:14,title:'寒假活動第二天'}); OUT.plan(G,{id:'v3',ev:'ev_vac_key',day:28,h:14,title:'寒假活動第三天'});
check('6b. 同一個時間點一次排好幾個（寒暑假活動的重點日）：只說第一個，不一直蓋掉',toasts.length===3&&/寒假活動第一天/.test(toasts[2]),JSON.stringify(toasts.slice(2)));
const cls=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
check('7. 早上的「今天還有」：約好的出遊後面寫「（時間到會跳出「出發」）」',/S\.todayMore=[\s\S]{0,400}時間到會跳出「出發」/.test(cls));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
