// 兩點半 Café 外場、舊路書房（AA_431 第 2 節，企劃線 f00b9e9f1；小事件 AA_289 3-1、3-2）——不需要瀏覽器。src/jobs3d.js（JOBS：cafe、books）＋src/data/wz_jobs.js
//   1  應徵：門上的告示（大一下起；店裡的「應徵：…」）；Café 點過第 3 次、書店來過第 2 次以後結帳時老闆開口（Café：和芷若有點熟以上、她在班上＝她多一句）；「我想一下。」老闆一句、只問一次
//   2  班表：Café 週四 18:00～22:00、週六 14:30～18:30；書店週六 10:00～14:00、週日 13:00～17:00（一週最多兩班照算）；出門提醒照那一天的時間
//   3  一班：三段工作（熟練 0～4 新手、5 以上熟練）＋小選擇＋那一句；Café 打烊之後芷若一句、書店整理書架之後沛珊一句（輪流）；書店借一本書；薪水 784（toast）；時段
//   4  小事件：第一班演第一件，之後每上兩班一件；要的人不在＝等（芷若在英國）；沛珊 2026-12-16 以後＝藍色的書跳過；Café 掃地那一句在「忘記的筆」以後換掉；
//      2026-12-17 以後第一個週六的書店班：老闆「那個女生這學期沒來排班。」（和她一起上過週六班的玩家）
//   5  撞時段：Café 週四＋公法讀書會、書店週六＋法服值班（兩個出門提醒）；放假沒有私訊＝先停；辭職「有空回來看看」
//      （2026-10-28 AA_519 3-2 改：Café 的辭職換成「好。……告示我再貼回去。」，書店照舊；Café 放假多一則私訊、這個假照舊先停——tests/aa519_support2_unit.js 查）
// 修改前（開發分支 HEAD）：JOBS 只有溫州街三家——FAIL。用法：node tests/aa431_jobs_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); toasts.length=0; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const said=t=>H.said.some(s=>s.t===t);
const saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w);
const L=()=>H.lines();
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
/* 上一班：那一天的開始時間，在店裡 */
const shift=async(k,d,picks)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,k==='cafe'?'cafe':'bookstore'); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); toasts.length=0; const m0=H.G.money; await JOBS.runShift(GM,k); return H.G.money-m0; };
const CAFE1='芷若給祐廷一張紙，上面是常客的名字和點法：「以安，冰美式。阿哲，最大杯的那個。溫學姊，黑咖啡，不用問。」';

(async()=>{
check('0. 載得到：JOBS 有 cafe、books；Café、書店的區域',ok&&JOBS.KEYS.includes('cafe')&&JOBS.KEYS.includes('books')&&JOBS.ZONE_KEY.cafe==='cafe'&&JOBS.ZONE_KEY.bookstore==='books',err);

await sec(1,async()=>{ fresh('2025-11-08',15,'cafe'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'cafe');
  check('1. Café 門上的告示：大一上還沒有',!!it&&it.hidden===true);
  fresh(key(TD('Y1S2',1,6)),15,'cafe'); H.E.interactables=[]; const it2=JOBS.addDesk(GM,'cafe'); H.E.interactables=[]; const it3=JOBS.addDesk(GM,'bookstore');
  check('1. 大一下第 1 週起：「應徵：徵外場夥伴　週四晚上、週六下午　意者洽櫃台」、書店「應徵：週末缺人。會搬書、不怕灰塵。」',it2.hidden===false&&it2.label==='應徵：徵外場夥伴　週四晚上、週六下午　意者洽櫃台'&&it3.label==='應徵：週末缺人。會搬書、不怕灰塵。',it2.label+'｜'+it3.label);
  /* 第 3 次點餐：老闆開口 */
  fresh(key(TD('Y1S2',2,3)),15,'cafe'); const lw=STORY.ladWorking; STORY.ladWorking=(G,id)=>id==='heroine_02'; H.FAMILIAR('heroine_02');
  try{ H.said=[]; await EAT.ordered(GM,'兩點半 Café','拿鐵'); await EAT.ordered(GM,'兩點半 Café','拿鐵'); check('1. Café 點兩次：老闆還沒開口',!said('同學，你常來。週六缺一個外場，有沒有興趣？'));
    H.picks=['「好。」','週六']; await EAT.ordered(GM,'兩點半 Café','拿鐵');
    check('1. 第 3 次結帳：老闆「同學，你常來。週六缺一個外場，有沒有興趣？」；芷若（有點熟、在班上）「他每次點一樣的，記性應該不錯。」',saidBy('老闆','同學，你常來。週六缺一個外場，有沒有興趣？')&&said('他每次點一樣的，記性應該不錯。'),J(L()));
    check('1. 選項「好。」「我想一下。」；班表：週四 18:00～22:00、週六 14:30～18:30、兩天',J(H.opts[0])===J(['「好。」','「我想一下。」'])&&J(H.opts[1])===J(['週四','週六','週四和週六','先不要']),J(H.opts));
    check('1. 選週六：班表記下、toast「班表：Café　週六 14:30～18:30」',J(JOBS.job(H.G,'cafe').day)===J([6])&&toasts.includes('班表：Café　週六 14:30～18:30'),J(toasts)); } finally { STORY.ladWorking=lw; }
  fresh(key(TD('Y1S2',2,3)),15,'cafe'); for(let i=0;i<2;i++) await EAT.ordered(GM,'兩點半 Café','拿鐵'); H.said=[]; H.picks=['「我想一下。」']; await EAT.ordered(GM,'兩點半 Café','拿鐵');
  check('1. 「我想一下。」：老闆「好，告示會一直貼著。」；沒有芷若那句（不熟）',saidBy('老闆','好，告示會一直貼著。')&&!said('他每次點一樣的，記性應該不錯。')&&!JOBS.job(H.G,'cafe'));
  H.said=[]; await EAT.ordered(GM,'兩點半 Café','拿鐵'); check('1. 只問一次',!said('同學，你常來。週六缺一個外場，有沒有興趣？'));
  fresh(key(TD('Y1S2',2,3)),15,'bookstore'); H.said=[]; H.picks=['只是看看']; await STORY.bookshop(GM); check('1. 書店第 1 次：老闆還沒開口',!said('你又來了。……週末要不要來幫忙？薪水不多，書可以借回去看。'));
  H.picks=['只是看看','「好。」','週日']; H.opts=[]; await STORY.bookshop(GM);
  check('1. 書店第 2 次結帳：老闆「你又來了。……週末要不要來幫忙？薪水不多，書可以借回去看。」；班表週六 10:00～14:00、週日 13:00～17:00',saidBy('老闆','你又來了。……週末要不要來幫忙？薪水不多，書可以借回去看。')&&H.opts.some(o=>J(o)===J(['週六','週日','週六和週日','先不要']))&&J(JOBS.job(H.G,'books').day)===J([7]),J(H.opts));
  fresh(key(TD('Y1S2',2,3)),15,'bookstore'); H.picks=['只是看看','只是看看','「我想一下。」']; await STORY.bookshop(GM); H.said=[]; await STORY.bookshop(GM); check('1. 書店「我想一下。」：老闆「好。」',saidBy('老闆','好。')); });

await sec(2,async()=>{ const d=TD('Y1S2',3,4); fresh(key(d),17,'dorm'); hire('cafe',[4,6]); JOBS.plan(H.G); const q=OUT.get(H.G,'job_cafe_'+d);
  check('2. 週四的班：出門提醒 18:00、「Café 的班（18:00～22:00）」、帶到 Café',!!q&&q.h===18&&q.title==='Café 的班（18:00～22:00）'&&q.goto.zone==='cafe'&&q.no==='這週請假',J(q));
  at(d+2,13.5); JOBS.plan(H.G); const q2=OUT.get(H.G,'job_cafe_'+(d+2)); check('2. 週六：14:30、「Café 的班（14:30～18:30）」',!!q2&&q2.h===14.5&&q2.title==='Café 的班（14:30～18:30）');
  at(d+2,14.2,'cafe'); check('2. 週六 14:12 在店裡：開班的時間',JOBS.shiftNow(H.G,'cafe')); at(d+2,13.5,'cafe'); check('2. 13:30：還沒',!JOBS.shiftNow(H.G,'cafe'));
  fresh(key(d),17,'dorm'); hire('brunch',[6,7]); H.picks=['「好。」']; const a=await JOBS.pickDays(GM,'cafe'); check('2. 一週最多兩班（早午餐已經兩班）：不能再選',a===null&&toasts.some(t=>/一週最多兩班/.test(t)));
  fresh(key(TD('Y1S2',3,6)),9,'dorm'); hire('books',[6,7]); JOBS.plan(H.G); const qb=OUT.get(H.G,'job_books_'+H.G.day); check('2. 書店週六 10:00（「舊路書房的班（10:00～14:00）」）',!!qb&&qb.h===10&&qb.title==='舊路書房的班（10:00～14:00）'&&qb.goto.zone==='bookstore',J(qb)); });

await sec(3,async()=>{ const s1=TD('Y1S2',3,6); fresh(key(s1),14,'cafe'); hire('cafe',[6]); const pay=await shift('cafe',s1,['「先送靠窗那桌。」','「慢慢走。」','「掃地。」']);
  const i0=H.said.findIndex(s=>s.t===CAFE1), i1=H.said.findIndex(s=>s.t==='（你把點單夾在吧檯邊。字寫得有點歪。）');
  check('3. 第一班：「背人」在一開始（AA_289 3-1 第 1 件），然後三段',i0>=0&&i1>i0,J(L()));
  check('3. 三段（新手）＋選了的那一句',said('（靠窗的客人說了謝謝，沒有抬頭。）')&&said('（兩杯拿鐵，你走得很慢。拉花在晃。）')&&said('（拉花到桌上的時候還是完整的。）')&&said('（椅子一張一張倒扣在桌上。你搞不清楚哪一張要放哪裡。）')&&said('（掃到角落，撿到一枝藍色的筆。）'));
  check('3. 選項',J(H.opts)===J([['「先送靠窗那桌。」','「先收門口那桌。」'],['「慢慢走。」','「快一點。」'],['「擦吧檯。」','「掃地。」']]),J(H.opts));
  const k=H.said.findIndex(s=>s.t==='（掃到角落，撿到一枝藍色的筆。）'); check('3. 打烊之後芷若那一句（第一句）',H.said[k+1]&&H.said[k+1].t==='（她把最後一盞燈關掉，說「明天見」。）',J(L()));
  check('3. 薪水 784、toast「Café 薪水 784 元」、到 18:30、下午的時段',pay===784&&toasts.includes('Café 薪水 784 元')&&Math.abs(H.G.hour-18.5)<1e-6&&CLS.slotRec(H.G).used.pm>0,pay+' '+J(toasts)+' '+H.G.hour);
  await shift('cafe',s1+7,['「先收門口那桌。」','「快一點。」','「擦吧檯。」']); check('3. 第二班：沒有小事件；芷若換第二句',!said('一整天都在聞咖啡，最後只想喝白開水。')&&said('（她在算今天的零錢，算到一半抬頭問你：「你剛剛那桌，有收到小費嗎？」）')&&said('（門口那桌的杯子底還有一點冰塊。）')&&said('（吧檯擦到看得到燈的倒影。）'));
  await shift('cafe',s1+14); const e2=H.said.findIndex(s=>s.t==='（打烊。老闆讓每個人做一杯給自己。芷若倒了一杯熱水，切一片檸檬丟進去。）'), seg3=H.said.findIndex(s=>s.t==='（椅子一張一張倒扣在桌上。你搞不清楚哪一張要放哪裡。）');
  check('3. 第三班：第 2 件「關店前的一杯」在三段之後',e2>seg3&&seg3>=0&&said('一整天都在聞咖啡，最後只想喝白開水。')&&said('你要做什麼？……做壞了自己喝。'),J(L()));
  await shift('cafe',s1+21); check('3. 第四班：沒有',!said('客人忘的。'));
  await shift('cafe',s1+28,['「先送靠窗那桌。」','「慢慢走。」','「掃地。」']); check('3. 第五班：第 3 件「忘記的筆」（含那個週五那一句）',said('（櫃台下面有一個玻璃罐，裝滿了筆。）')&&said('客人忘的。')&&said('最上面那枝藍的，是週五那位先生的。他每次都忘，下次再來拿。')&&said('（那個週五，那位先生進門，芷若已經把筆放在他常坐的桌上。）'));
  await shift('cafe',s1+35,['「先送靠窗那桌。」','「慢慢走。」','「掃地。」']);
  check('3. 熟練 5 以上：熟練那句；「忘記的筆」以後掃地＝「（掃到角落，什麼都沒有。）」',said('（你已經不用看點單上的桌號了。）')&&said('（你一手兩杯，繞過那張老是擋路的椅子。）')&&said('（椅子倒扣上去，剛好排成一直線。）')&&said('（掃到角落，什麼都沒有。）')&&!said('（掃到角落，撿到一枝藍色的筆。）'),J(L())); });

await sec(4,async()=>{ /* 芷若在英國的學期：沒有她那一句、Café 的小事件等她回來 */
  const sU=DK('2027-10-16'); fresh(key(sU),14,'cafe'); hire('cafe',[6]); await shift('cafe',sU); check('4. 芷若在英國（2027-10）：沒有她那一句、第一件不演',!said(CAFE1)&&!said('（她把最後一盞燈關掉，說「明天見」。）'),J(L()));
  const sB=DK('2028-03-18'); await shift('cafe',sB); check('4. 她回來（2028-03）：第一件照演',said(CAFE1)&&said('（她把最後一盞燈關掉，說「明天見」。）'));
  /* 書店 */
  const b1=TD('Y1S2',3,6); fresh(key(b1),9.5,'bookstore'); hire('books',[6,7]); const pay=await shift('books',b1,['「照作者排。」','「幫他找。」','「先擦乾淨。」']);
  const k=H.said.findIndex(s=>s.t==='（老闆經過，看了一眼，沒有說話。）');
  check('4. 書店週六（沛珊在）：整理書架之後沛珊一句；第 1 件「藍色的書」（三段之後）',H.said[k+1]&&H.said[k+1].t==='（她蹲在最下面一排，小聲念書名給自己聽。）'&&said('我記得是藍色的封面。……書名忘了。')&&saidBy('郭沛珊','（小聲）他剛剛說，他媽媽以前常煮這道。'),J(L()));
  check('4. 書店：三段、借一本書、薪水 784（toast「舊路書房 薪水 784 元」）',said('（有人問有沒有一本書。你翻了三本目錄。）')&&said('（找到的時候，他已經在看別本了。）')&&said('（擦完的書放在門口那一格，下午就賣掉兩本。）')&&said('（你借了一本書回去。）')&&pay===784&&toasts.includes('舊路書房 薪水 784 元'),J(L()));
  await shift('books',b1+1); check('4. 週日：只有老闆（沒有沛珊那一句）',!said('（她蹲在最下面一排，小聲念書名給自己聽。）')&&!said('（她把一本書抽出來給你看：「這本封面好可愛。……我沒有要買，我只是給你看。」）'));
  await shift('books',b1+7); check('4. 第三班：第 2 件「老闆的規則」',saidBy('老闆','在這裡看書不用買，坐著看也可以。')&&said('不要把書弄濕就好。……上次有人邊看邊吃剉冰。'));
  const g=DK('2026-12-19'); await shift('books',g); check('4. 2026-12-17 以後第一個週六的班：老闆「那個女生這學期沒來排班。」',saidBy('老闆','那個女生這學期沒來排班。'));
  await shift('books',g+7); check('4. 只說一次',!said('那個女生這學期沒來排班。'));
  const s0=DK('2027-01-03'); fresh(key(s0),12.5,'bookstore'); hire('books',[7]); await shift('books',s0); check('4. 2026-12-16 以後才開始（只上週日）：藍色的書跳過，第一班＝「老闆的規則」；沒有「那個女生」那一句',said('在這裡看書不用買，坐著看也可以。')&&!said('我記得是藍色的封面。……書名忘了。')&&!said('那個女生這學期沒來排班。'));
  await shift('books',s0+7); await shift('books',s0+14); check('4. 再兩班：第 3 件「一直沒人來拿的書」',said('（櫃台後面有一本包著牛皮紙的書，上面貼著一張發黃的訂單。）')&&said('一年前訂的。電話打不通。')&&said('再放一陣子。')); });

await sec(5,async()=>{ const thu=TD('Y1S2',4,4); fresh(key(thu),17,'dorm'); hire('cafe',[4]); const p0=JOBS.plgOn; JOBS.plgOn=()=>true;
  try{ check('5. Café 週四＋公法讀書會：出門提醒兩個都列（和影印同一個做法）',J(JOBS.partner(H.G,{job:'cafe',day:thu,state:'planned'}))===J({plg:true})); } finally { JOBS.plgOn=p0; }
  const sat=TD('Y1S2',4,6); fresh(key(sat),8.5,'dorm',{lawclub:true}); hire('books',[6]); OUT.plan(H.G,{id:'fafu_'+sat,day:sat,h:9,place:'萬才館',title:'法服值班'}); JOBS.plan(H.G);
  const pr=JOBS.partner(H.G,OUT.get(H.G,'job_books_'+sat)); check('5. 書店週六＋法服值班：兩個出門提醒一起列',!!pr&&pr.q&&pr.q.id==='fafu_'+sat,J(pr));
  const s2=DK('2026-07-11'); fresh(key(s2),12,'dorm'); hire('books',[6]); JOBS.phone(H.G); check('5. 暑假：老闆沒有私訊、這個假先停（不排班）',!JOBS.scheduled(H.G,'books',s2)&&Object.values(JOBS.job(H.G,'books').brk).includes('stop')&&!(H.G.msgs||[]).some(m=>m.th==='p:books_boss'));
  fresh(key(TD('Y1S2',5,3)),15,'cafe'); hire('cafe',[6]); H.said=[]; H.picks=['（辭職）']; await JOBS.desk(GM,'cafe'); check('5. 辭職：老闆「好。……告示我再貼回去。」（AA_519 3-2 的 Café 離職那一句，原本「有空回來看看」；沒有離開的時候那一段）',saidBy('老闆','好。……告示我再貼回去。')&&!saidBy('老闆','有空回來看看')&&JOBS.job(H.G,'cafe').gone==='quit',J(L()));
  check('5. 手機上的名字：兩點半的老闆、舊路書房的老闆',typeof PORTRAIT_ONLY==='undefined'||(PORTRAIT_ONLY.cafe_boss&&PORTRAIT_ONLY.cafe_boss.name==='兩點半的老闆'&&PORTRAIT_ONLY.books_boss.name==='舊路書房的老闆')); });

H.done();
})();
