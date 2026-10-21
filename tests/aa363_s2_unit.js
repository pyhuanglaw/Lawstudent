// 經濟系休學搬回家以後的錢（AA_363 S2，BUG-ECON-MONEY-1020／AA363-S2-ECON-MONEY-1021）。
// AA 定：①搬回家以後每月 5,000，從搬回家的下一個月（11/1）起 ②重考班、衝刺班的學費不從祐廷的帳戶扣
//        ③搬回宿舍（法律系開學前住進宿舍）恢復每月 30,000 ④不設上限、不加旁白 ⑤舊存檔不扣回已經匯的錢。
// 不需要瀏覽器：載入 src/data/calendar.js、src/story3d.js，一天一天呼叫 STORY.monthlyFunds（和睡醒時一樣）。
// 修改前（搬回家以後照樣每月 30,000，進法律系時帳戶約 35 萬）這個測試會失敗。
// 用法：node tests/aa363_s2_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/calendar.js'),'utf8').replace(/^const CALENDAR\s*=/m,'global.CALENDAR='),{filename:'src/data/calendar.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').replace(/^const STORY\s*=/m,'global.STORY='),{filename:'src/story3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const K=k=>STORY.dayOfKey(k), ds=d=>{ const x=STORY.dateOf(d); return x.m+'/'+x.d; };
check('日曆載入（2024-10-31、2025-08-29 找得到）',K('2024-10-31')!=null&&K('2025-08-29')!=null);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 一天一天往前（睡醒呼叫一次）；at：某一天要做的事（搬回家、轉法律系）
function run(G,toDay,at){ const pays=[]; while(G.day<toDay){ G.day++; if(at&&at[G.day]) at[G.day](G); const f=STORY.monthlyFunds(G); if(f){ G.money+=f.amount; pays.push([ds(G.day),f.amount,f.text]); } } return pays; }
const sum=p=>p.reduce((s,x)=>s+x[1],0);
// ①③ 經濟系整條：10/1 還住宿舍 30,000；10/31 搬回家（Y0_MOVED_OUT）；11/1～8/1 每月 5,000；8/29 轉法律系、搬進宿舍；9/1 起 30,000
{ const G={stage:'econ',day:K('2024-09-30'),money:0,flags:{fundsV2:1,allowanceMonth:9}};
  const at={}; at[K('2024-10-31')]=g=>{ g.flags.Y0_MOVED_OUT=true; };
  let atLaw=null; at[K('2025-08-29')]=g=>{ atLaw=g.money; g.stage='law'; g.flags.fundsV2=1; g.flags.allowanceMonth=STORY.dateOf(g.day).m; };   /* S.startLawWeek1（經濟系轉過來）：allowanceMonth＝搬進來那個月 */
  const pays=run(G,K('2025-10-02'),at);
  const p=d=>pays.filter(x=>x[0]===d).map(x=>x[1]).join(',');
  check('10/1 還住宿舍：30,000',pays[0][0]==='10/1'&&pays[0][1]===30000,JSON.stringify(pays[0]));
  check('10/31 搬回家，下一個月（11/1）起 5,000',p('11/1')==='5000',p('11/1'));
  const home=pays.filter(x=>['11/1','12/1','1/1','2/1','3/1','4/1','5/1','6/1','7/1','8/1'].includes(x[0]));
  check('11/1～8/1 十個月都是 5,000',home.length===10&&home.every(x=>x[1]===5000),JSON.stringify(home.map(x=>x[0]+':'+x[1])));
  check('在家那十個月一共 50,000（原本 300,000）',sum(home)===50000,String(sum(home)));
  check('8/29 搬進法律系宿舍以後，9/1 恢復 30,000',p('9/1')==='30000',p('9/1'));
  check('10/1（法律系）30,000',pays.filter(x=>x[0]==='10/1').map(x=>x[1]).join(',')==='30000,30000',pays.filter(x=>x[0]==='10/1').map(x=>x[1]).join(','));
  check('每月只匯一次（11 月以後每個 1 日剛好一筆）',pays.every(x=>/\/1$/.test(x[0])),JSON.stringify(pays.map(x=>x[0])));
  check('匯款訊息照舊格式（不加旁白，只有金額不同）',pays.every(x=>x[2]==='家裡匯來這個月的生活費：'+x[1].toLocaleString('en-US')+' 元'),JSON.stringify(pays.map(x=>x[2])));
  check('8/29 進法律系的時候帳戶不會再是三十幾萬（10/1 起的匯款一共 80,000）',atLaw===80000,String(atLaw)); }
// 搬家那一場晚演（10/31 沒演到、11/2 才搬）：11/1 那時還住宿舍 → 30,000；12/1 起 5,000（「搬回家的下一個月」）
{ const G={stage:'econ',day:K('2024-10-30'),money:0,flags:{fundsV2:1,allowanceMonth:10}};
  const at={}; at[K('2024-11-02')]=g=>{ g.flags.Y0_MOVED_OUT=true; };
  const pays=run(G,K('2024-12-02'),at);
  check('11/2 才搬：11/1 照住宿舍 30,000、12/1 起 5,000',pays.map(x=>x[0]+':'+x[1]).join(',')==='11/1:30000,12/1:5000',pays.map(x=>x[0]+':'+x[1]).join(',')); }
// ⑤ 舊存檔：休學在家、11 月照舊規則已經匯了 30,000、帳戶 35 萬——讀檔不扣回，下一個月起照新規則
{ const G={stage:'econ',day:K('2024-11-20'),money:350000,flags:{fundsV2:1,allowanceMonth:11,Y0_MOVED_OUT:true}};
  const f0=STORY.monthlyFunds(G); check('舊存檔：同一個月再呼叫不補也不扣',f0===null&&G.money===350000,JSON.stringify(f0));
  const pays=run(G,K('2024-12-02'));
  check('舊存檔：12/1 起 5,000，原本的錢不扣回',pays.length===1&&pays[0][1]===5000&&G.money===355000,JSON.stringify(pays)+' money='+G.money); }
// 法律系的寒暑假回家（G.home.at）不受影響：還有宿舍，照舊 30,000
{ const G={stage:'law',day:K('2026-01-30'),money:0,home:{at:true},flags:{fundsV2:1,allowanceMonth:1,Y0_MOVED_OUT:true}};
  const pays=run(G,K('2026-02-02'));
  check('法律系寒假在家（經濟系那年搬回家過的玩家）：2/1 照舊 30,000',pays.length===1&&pays[0][1]===30000,JSON.stringify(pays)); }
// 還沒休學的經濟系（住 412）：照舊 30,000
{ const G={stage:'econ',day:K('2024-08-31'),money:0,flags:{fundsV2:1,allowanceMonth:8}};
  const pays=run(G,K('2024-09-02'));
  check('經濟系還住宿舍：9/1 30,000',pays.length===1&&pays[0][1]===30000,JSON.stringify(pays)); }
// ② 重考班、衝刺班的學費不從祐廷的帳戶扣：經濟系的事件沒有扣一萬以上的錢；重考在家的資料沒有錢的欄位
{ const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); const big=[];
  for(const blk of ev.split(/\n  \{ id:'/).slice(1)){ if(!/stage:'econ'/.test(blk.slice(0,300))) continue; for(const m of blk.matchAll(/money\(\s*-\s*(\d+)/g)) if(+m[1]>=10000) big.push(blk.slice(0,20)+':'+m[1]); }
  check('經濟系的事件沒有從帳戶扣一萬以上（學費）',big.length===0,big.join(' '));
  const rh=fs.readFileSync(path.join(ROOT,'src/data/retake_home.js'),'utf8'); check('重考在家（含衝刺班 RH-C0～）的資料沒有扣錢的欄位',!/"(money|fee|cost|pay)"\s*:/.test(rh));
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), hm=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8');
  const cram=[]; for(const [n,s] of [['story3d',st],['home3d',hm]]) for(const m of s.matchAll(/money\(\s*-\s*(\d+)/g)) if(+m[1]>=10000) cram.push(n+':'+m[1]);
  check('story3d／home3d 沒有扣一萬以上的地方',cram.length===0,cram.join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
