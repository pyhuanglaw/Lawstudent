// DL-04（AA_160 3-4 D 第 3 點）：捷運出遊出發前，這一趟的時間裡有 B 表的短窗口劇情＝R1 列出來；有【必】（keep:'must'）＝不能出發——不需要瀏覽器。
//   1 大一上第 14 週週五 15:00 出發、回來超過 18:00：列「18:00 家族聚餐」；17:00 前回來＝不列；演過了＝不列
//   2 第 11 週週六 09:30：見過學姊（met_sis）＝列「10:00 法律問答攤」（預告時當作她會在）；沒見過＝不列
//   3 有【必】事件窗口＝不能出發，說「今天下午有一件事。」，不扣錢、不走
// 修改前（開發分支 b0e83b46c）：沒有 TRIP.evMiss——FAIL。用法：node tests/dl04_r1_trip_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/data/free_trips.js','src/freetrip3d.js']) vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_]+)\s*=/mg,'globalThis.$1='),{filename:f});
GM.toast=()=>{}; GM.caption=()=>{};
const X=typeof TRIP!=="undefined"?TRIP:null;
check('0. TRIP.evMiss 存在',!!X&&typeof X.evMiss==='function');
if(!X||typeof X.evMiss!=='function') H.done();
const TD=(term,w,wd)=>STORY.termDay(term,w,wd), keyOf=d=>CALENDAR.dateOf(d).key;
const at=(d,h,flags)=>{ const G=H.fresh(keyOf(d),h,'gongguan',flags||{}); G.weekday=CALENDAR.dateOf(d).wd%7; return G; };
(async()=>{
  { const FRI=TD('Y1S1',14,5); const G=at(FRI,15); const a=X.evMiss(G,19); const b=X.evMiss(G,17); G.events.done.ev_sis_family_dinner=1; const c=X.evMiss(G,19);
    check('1. 第 14 週週五 15:00 出發：回來 19:00＝列「18:00 家族聚餐」；17:00 回來＝不列；演過了＝不列',J(a.fixed.map(x=>x.t))===J(['18:00 家族聚餐'])&&!b.fixed.length&&!c.fixed.length&&!a.must.length,J({a,b,c})); }
  { const SAT=TD('Y1S1',11,6); const G=at(SAT,9.5,{met_sis:true}); const a=X.evMiss(G,15); const G2=at(SAT,9.5,{}); const b=X.evMiss(G2,15);
    check('2. 第 11 週週六 09:30：見過學姊＝列「10:00 法律問答攤」（當作她會在）；沒見過＝不列',J(a.fixed.map(x=>x.t))===J(['10:00 法律問答攤'])&&!b.fixed.length,J({a,b})); }
  { const FRI=TD('Y1S1',14,5); const G=at(FRI,13); const ev={id:'ev_test_must_r1',title:'（測試）一定要的事',participants:[],location:'campus',trigger:'auto',term:['Y1S1'],weeks:[14],weekday:[5],time:[13.25,14],once:true,keep:'must',dialogue:[{speaker:null,text:'x'}]};
    STORY_EVENTS.unshift(ev); let r=null, said; const m0=G.money;
    try{ const s=X.list().find(q=>X.check(G,q).ok); H.said=[]; r=s?await X.go(GM,s):'no-spot'; said=H.said.map(q=>q.t); } finally { STORY_EVENTS.shift(); }
    check('3. 有【必】事件的窗口：不能出發（「今天下午有一件事。」），錢不變、人還在公館',r===false&&said.includes('今天下午有一件事。')&&G.money===m0&&G.zone==='gongguan',J({r,said,money:[m0,G.money],zone:G.zone})); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
