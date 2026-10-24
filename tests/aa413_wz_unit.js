// 溫州街剩下三家（AA_413，企劃線 9f6a848c；USER_WANTS B09 收尾）——不需要瀏覽器。
//   1  溫州街多五個按鈕：進入日日便利、買水果、看阿忠水果、看自助洗衣、看布告欄
//   2  阿忠水果：09:00～22:00；第一次的招呼＋二選一；菜單照月份（6 月芒果、12 月草莓柳丁、10 月都沒有）；扣錢；第 5 次起認得你（芒果季換一句）
//   3  自助洗衣：布告欄照月份（9 月、3 月不一樣）
//   4  日日便利：從溫州街進去（CVS_FROM）；店員招呼兩段時間、第 5 次起認得你；考試週 21:00 以後結帳一句（一天一次）；出口回溫州街；公館的門進去、去別的地方＝清掉
// 修改前（開發分支 27b5e58bf）：沒有 WZS.AA413——FAIL。用法：node tests/aa413_wz_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|CLOSED)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/closed3d.js']) load(f);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
let money=[]; GM.money=d=>{ money.push(d); H.G.money=(H.G.money|0)+d; };
const fresh=(k,h,zone)=>{ const G=H.fresh(k,h,zone||'wenzhou'); toasts.length=0; money=[]; return G; };
const A=()=>WZS.AA413;

(async()=>{
await sec(1,()=>{ const L=WZS.windowItems().map(x=>x.label);
  check('1. 溫州街多五個按鈕',['進入日日便利','買水果','看阿忠水果','看自助洗衣','看布告欄'].every(l=>L.includes(l)),J(L)); });

await sec(2,async()=>{ fresh('2026-06-10',8);
  await WZS.interact(GM,{wzShop:'fruit',kind:'window'}); check('2. 08:00 還沒開：提示營業時間',toasts.includes('阿忠水果：09:00～22:00')&&!H.said.length);
  fresh('2026-06-10',10); H.picks=['「送人。」','芒果']; await WZS.interact(GM,{wzShop:'fruit',kind:'window'});
  check('2. 第一次：「要吃還是要送人？」→「送人。」→「那我幫你挑漂亮的。」（他把袋子裡的一顆換掉了。）',H.has('要吃還是要送人？')&&H.has('那我幫你挑漂亮的。')&&H.has('（他把袋子裡的一顆換掉了。）'),J(H.lines()));
  const m6=H.opts[1]||[]; check('2. 6 月：有芒果、西瓜、鳳梨，沒有柳丁、草莓',m6.some(t=>/芒果/.test(t))&&m6.some(t=>/西瓜/.test(t))&&m6.some(t=>/鳳梨/.test(t))&&!m6.some(t=>/柳丁|草莓/.test(t)),J(m6));
  check('2. 買了芒果：扣 150',money.includes(-150),J(money));
  fresh('2026-12-10',10); const m12=WZS.fruitMenu(H.G).map(x=>x[0]); check('2. 12 月：草莓、柳丁有，芒果、西瓜沒有',m12.some(t=>/草莓/.test(t))&&m12.some(t=>/柳丁/.test(t))&&!m12.some(t=>/芒果|西瓜/.test(t)),J(m12));
  fresh('2026-10-10',10); const m10=WZS.fruitMenu(H.G).map(x=>x[0]); check('2. 10 月：芒果、草莓、柳丁都沒有；芭樂、香蕉、木瓜牛奶整年',!m10.some(t=>/芒果|草莓|柳丁/.test(t))&&['芭樂（一袋三顆）','香蕉（一串）','現打木瓜牛奶'].every(t=>m10.includes(t)),J(m10));
  fresh('2026-07-10',10); EAT.rec(H.G).n['阿忠水果']=4; H.picks=['芭樂']; await WZS.interact(GM,{wzShop:'fruit',kind:'window'});
  check('2. 第 5 次（7 月芒果季）：「今天的芒果很甜，要不要？」，沒有二選一',H.has('今天的芒果很甜，要不要？')&&!H.has('要吃還是要送人？'),J(H.lines()));
  fresh('2026-10-10',10); EAT.rec(H.G).n['阿忠水果']=6; H.picks=['芭樂']; await WZS.interact(GM,{wzShop:'fruit',kind:'window'}); check('2. 認得你（10 月）：「學生仔，今天的芭樂很脆。」',H.has('學生仔，今天的芭樂很脆。')); });

await sec(3,async()=>{ fresh('2026-09-10',15); await WZS.interact(GM,{wzShop:'laundry',kind:'board'}); const a=H.said.slice(-1)[0].t;
  fresh('2027-03-10',15); await WZS.interact(GM,{wzShop:'laundry',kind:'board'}); const b=H.said.slice(-1)[0].t;
  check('3. 布告欄：9 月家教徵求、3 月租屋（有貓嗎？）',a==='（家教徵求：國二數學，週三晚上。下面的電話紙條撕走了一半。）'&&b==='（租屋：溫州街五樓，雅房，限女性。旁邊有人用鉛筆補了一行：有貓嗎？）',J([a,b]));
  const look=WZS.windowItems().find(x=>x.label==='看自助洗衣'); check('3. 看自助洗衣',!!look&&look.look==='（投幣式洗衣機轉著，裡面沒有人。長椅上放著一本沒有封面的雜誌。）'); });

await sec(4,async()=>{ fresh('2025-10-08',23); await WZS.interact(GM,{wzShop:'cvs413',kind:'enter'});
  check('4. 進入日日便利：到 cvs、CVS_FROM wenzhou',H.entered.slice(-1)[0]==='cvs'&&H.G.flags.CVS_FROM==='wenzhou');
  check('4. 23:00 第一次：「要袋子嗎？」',WZS.cvsGreet(H.G)==='要袋子嗎？');
  H.G.hour=10; check('4. 10:00 第一次：「歡迎光臨。要袋子嗎？」',WZS.cvsGreet(H.G)==='歡迎光臨。要袋子嗎？');
  H.G.flags.WZ_CVS_N=4; H.G.hour=23; check('4. 第 5 次起：23:00「又這麼晚。」、10:00「歡迎光臨。」',WZS.cvsGreet(H.G)==='又這麼晚。'&&(H.G.hour=10,WZS.cvsGreet(H.G))==='歡迎光臨。');
  const exit={label:'離開便利商店',exit:{to:'gongguan',spawn:{x:0,z:0}}}; H.G.zone='cvs';
  const r=await STORY.interact(exit,GM); check('4. 出口：回溫州街（日日便利門口）、CVS_FROM 清掉',r===true&&H.entered.slice(-1)[0]==='wenzhou'&&H.G.flags.CVS_FROM==null,J(H.entered));
  fresh('2025-10-08',12,'gongguan'); await STORY.interact({label:'進入便利商店',exit:{to:'cvs',spawn:{x:0,z:3.4}}},GM); check('4. 公館的門：CVS_FROM gongguan（出口照舊回公館）',H.G.flags.CVS_FROM==='gongguan');
  fresh('2025-10-08',12); H.G.flags.CVS_FROM='wenzhou'; try{ STORY.populate('campus',GM); }catch(e){ /* 假的 GM 沒有 3D：清旗標在呼叫原本的 populate 以前 */ } check('4. 到別的地方：清掉',H.G.flags.CVS_FROM==null);
  /* 考試週 21:00 以後結帳一句（一天一次）：期中第 8 週 */
  const d=(()=>{ for(let x=STORY.dayOfKey('2025-10-01');x<STORY.dayOfKey('2025-12-31');x++){ const t=CALENDAR.termOf(x); if(t&&t.exam==='mid') return x; } return null; })();
  fresh(CALENDAR.dateOf(d).key,21.5,'cvs'); H.G.flags.CVS_FROM='wenzhou'; H.picks=[0]; await STORY.interact({label:'結帳',shop:'cvs'},GM);
  check('4. 考試週 21:30 結帳：多「考試週喔。咖啡第二杯半價。」、次數 +1',H.has('考試週喔。咖啡第二杯半價。')&&H.G.flags.WZ_CVS_N===1,J(H.lines().slice(-3)));
  const n=H.said.length; H.picks=[0]; await STORY.interact({label:'結帳',shop:'cvs'},GM); check('4. 同一天第二次沒有',H.said.slice(n).every(s=>s.t!=='考試週喔。咖啡第二杯半價。'));
  fresh(CALENDAR.dateOf(d).key,21.5,'cvs'); H.G.flags.CVS_FROM='gongguan'; H.picks=[0]; await STORY.interact({label:'結帳',shop:'cvs'},GM); check('4. 從公館進來的：沒有溫州街的店員句子',!H.has('考試週喔。咖啡第二杯半價。')&&!H.has('要袋子嗎？')); });

H.done();
})();
