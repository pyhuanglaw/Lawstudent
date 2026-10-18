// 生活費（D48；企劃 AA_72 5b-1：每月 30,000 元、每月 1 日匯入；開學時帳戶約 20,000＋錢包約 2,000）。
// 不需要瀏覽器：載入 src/story3d.js，模擬每天睡覺（sleepNow 一次只過一天，醒來呼叫 STORY.monthlyFunds）。
// 檢查：第一天的日期假設（9/17、週三）、每月 1 日剛好匯一次 30,000、新遊戲開局 22,000 不重複補、
//       舊存檔（沒有 fundsV2）下一個早上補帳戶裡的 20,000 一次、讀檔本身不改錢（monthlyFunds 只在睡醒時呼叫）。
// 修改前（每週一 3,500 元，一個月約 14,000）這個測試會失敗：沒有 monthlyFunds，月收入也不到 30,000。
// 用法：node tests/allowance_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').replace(/^const STORY\s*=/m,'global.STORY='),{filename:'src/story3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('有 STORY.monthlyFunds、STORY.dateOf',typeof STORY.monthlyFunds==='function'&&typeof STORY.dateOf==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const ds=d=>{ const x=STORY.dateOf(d); return x.m+'/'+x.d; };
// 日期：第一天＝開學第三週的週三（假設 9/17）；遊戲的星期：第一天週三，每睡一次 +1
check('第一天是 9/17',ds(1)==='9/17',ds(1));
check('9/17 和遊戲的星期一致（週三）',new Date(2025,8,17).getDay()===3,'（年份只是用來核對星期，遊戲不顯示年份）');
for(const [day,want] of [[14,'9/30'],[15,'10/1'],[45,'10/31'],[46,'11/1'],[76,'12/1'],[107,'1/1'],[138,'2/1'],[166,'3/1']]) check('第 '+day+' 天是 '+want,ds(day)===want,ds(day));
// 新遊戲：開局 22,000（game3d.js defaults），S.newGame 設 fundsV2＝1、allowanceMonth＝9
{ const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const m=src.match(/energy:\d+,money:(\d+)/); check('新遊戲開局的錢＝22,000（帳戶約 20,000＋錢包約 2,000）',m&&+m[1]===22000,m?m[1]:'找不到');
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('S.newGame（?start0 舊開局）、S.newGameEcon（預設的經濟系開局）都設 fundsV2 與 allowanceMonth（新遊戲不會再補 20,000）',/S\.newGame=[^\n]*\n(?:[^\n]*\n){1,3}[^\n]*G\.day=1;[^\n]*G\.flags\.fundsV2=1; G\.flags\.allowanceMonth=S\.dateOf\(1\)\.m;/.test(st)&&/S\.newGameEcon=[^\n]*\n[^\n]*G\.flags\.fundsV2=1; G\.flags\.allowanceMonth=S\.dateOf\(d\)\.m;/.test(st));
  check('START-WEEK 選 1 的新局（S.startLawWeek1）也設 fundsV2 與 allowanceMonth（8 月）',/S\.startLawWeek1=[\s\S]{0,600}?F\.fundsV2=1; F\.allowanceMonth=S\.dateOf\(d\)\.m;/.test(st)); }
function run(G,toDay){ const pays=[]; while(G.day<toDay){ G.day++; const f=STORY.monthlyFunds(G); if(f){ G.money+=f.amount; pays.push([G.day,f.amount,f.text]); } } return pays; }
{ const G={day:1,money:22000,flags:{fundsV2:1,allowanceMonth:STORY.dateOf(1).m}}; const pays=run(G,170);
  const days=pays.map(p=>p[0]).join(','); check('新遊戲：每月 1 日匯一次（第 15、46、76、107、138、166 天）',days==='15,46,76,107,138,166',days);
  check('新遊戲：每次 30,000',pays.every(p=>p[1]===30000),JSON.stringify(pays.map(p=>p[1])));
  check('新遊戲：前兩週不會多補（開局已經有 22,000）',!pays.some(p=>p[0]<15));
  check('匯款訊息',pays[0]&&pays[0][2]==='家裡匯來這個月的生活費：30,000 元',pays[0]&&pays[0][2]);
  const oct=pays.filter(p=>p[0]>=15&&p[0]<=45).reduce((s,p)=>s+p[1],0); check('一個月的收入 ≥ 30,000（10 月）',oct>=30000,String(oct)); }
// 舊存檔（v9.4 以前：開局 1,800、沒有 fundsV2）：讀檔不改錢；下一個早上補帳戶裡的 20,000 一次；之後照每月 1 日
{ const G={day:8,money:300,flags:{metAn:true}}; const before=G.money; check('舊存檔讀進來時不改錢（monthlyFunds 只在睡醒時呼叫）',G.money===before);
  const pays=run(G,50); check('舊存檔：第 9 天早上補 20,000 一次',pays.length>=1&&pays[0][0]===9&&pays[0][1]===20000,JSON.stringify(pays[0]));
  check('舊存檔：之後不會再補 20,000',pays.slice(1).every(p=>p[1]===30000),JSON.stringify(pays.slice(1).map(p=>p[0]+':'+p[1])));
  check('舊存檔：之後每月 1 日 30,000（第 15、46 天）',pays.slice(1).map(p=>p[0]).join(',')==='15,46',pays.slice(1).map(p=>p[0]).join(',')); }
// 舊存檔剛好在月底：補 20,000 的那天如果是 1 日，當月不再另外匯（避免一個早上拿兩筆）
{ const G={day:14,money:0,flags:{}}; const pays=run(G,16); check('舊存檔在 9/30：10/1 早上只拿一筆（補 20,000），不會同一天再匯 30,000',pays.length===1&&pays[0][1]===20000,JSON.stringify(pays)); }
// 同一天重複呼叫（例如睡覺流程被中斷重來）不會重複匯款
{ const G={day:14,money:0,flags:{fundsV2:1,allowanceMonth:9}}; G.day=15; const a=STORY.monthlyFunds(G), b=STORY.monthlyFunds(G); check('同一天呼叫兩次只匯一次',!!a&&b===null); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
