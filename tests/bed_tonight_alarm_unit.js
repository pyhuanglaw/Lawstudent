// BUG-BED-TONIGHT-ALARM-1022：晚上上床，床的選項只算明天的鬧鐘（S.wakeAlarms(G,day+1)），今天晚上還沒到、答應了的約沒算——
//   3/15 21:00 上床「睡到明天早上」，21:30 學姊的電話睡過去就記 SIS_US_RESULT missed（學姊 21:10 台階、19:00 生日同一個情況）。不需要瀏覽器。
//   1 2028-03-15 21:00（朋友，學姊 21:30 打電話來已經排好）：床的選項沒有睡到明天的；「睡一下」鬧鐘 21:00（出發前 30 分鐘），提示寫打電話來
//   2 照選項真的睡（CLS.skipTo nap，和遊戲同一條）：醒來還是 3/15、21:00，電話還排著（planned）
//   3 21:15 上床（30 分鐘前的鬧鐘已經過了）：出發前 10 分鐘 21:20 叫醒（和跳過時間同一個停點）
//   4 一般的出遊：今天 19:00 標 alarm 的，17:45 上床＝18:30 叫醒；答應了的約（invites）20:00＝19:30 叫醒
//   5 沒有今晚的約、電話已經過了（22:00）、不是 alarm 的出遊：照舊睡到明天（選項和修改前一樣）
// 修改前（開發分支 a9a1a172）：1～4 FAIL。用法：node tests/bed_tonight_alarm_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load('src/data/sis_y2y3_events.js'); load('src/sis_y2y3_3d.js');
const J=JSON.stringify, ID='heroine_05';
const kinds=G=>STORY.bedOptions(G).map(o=>o.kind+(o.to!=null?':'+(+o.to.toFixed(3)):'')+(o.wake!=null?'@'+(+o.wake.toFixed(2)):''));
const sisDay=h=>{ const G=H.fresh('2028-03-15',h,'dorm',{met_sis:true,SIS_W1:true}); H.FRIEND(ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; SISY23.phone(G); PHONE.tick(G); return G; };
(async()=>{
  { const G=sisDay(21); const q=OUT.get(G,'sisy23_result'); const o=STORY.bedOptions(G), sl=o.filter(x=>x.kind==='sleep'||x.kind==='nap');
    check('0. 前置：3/15 21:00 朋友，學姊 21:30 的電話排好了（出遊 sisy23_result，alarm）',!!q&&q.state==='planned'&&q.alarm&&q.h===21.5,J(q&&{state:q.state,h:q.h,alarm:q.alarm}));
    check('1. 21:00 上床：沒有睡到明天的選項，只有「睡一下」鬧鐘 21:00、提示寫打電話來',sl.length===1&&sl[0].kind==='nap'&&Math.abs(sl[0].to-21)<1e-6&&/打電話來/.test(sl[0].hint)&&/21:00/.test(sl[0].t+sl[0].hint),J(o.map(x=>[x.t,x.hint])));
    check('1. 「再撐一下」還在',o.some(x=>x.kind==='stay'),J(kinds(G)));
    if(sl[0]&&sl[0].kind==='nap'){ const ok=await CLS.skipTo(H.GM,sl[0].to,{nap:true}); const q2=OUT.get(H.G,'sisy23_result');
      check('2. 照選項睡：醒來還是 3/15 21:00，電話還排著、沒有記 missed',ok!==false&&H.G.day===H.D('2028-03-15')&&Math.abs(H.G.hour-21)<0.02&&q2&&q2.state==='planned'&&H.G.flags.SIS_US_RESULT==null,J({ok,day:H.G.day,hour:H.G.hour,state:q2&&q2.state,res:H.G.flags.SIS_US_RESULT})); }
    else check('2. 照選項睡：醒來還是 3/15 21:00，電話還排著',false,'沒有「睡一下」'); }
  { const G=sisDay(21.25); const sl=STORY.bedOptions(G).filter(x=>x.kind==='sleep'||x.kind==='nap');
    check('3. 21:15 上床（21:00 的鬧鐘過了）：21:20 叫醒（出發前 10 分鐘）',sl.length===1&&sl[0].kind==='nap'&&Math.abs(sl[0].to-(21.5-1/6))<1e-6&&/21:20/.test(sl[0].t),J(kinds(G))); }
  { const G=H.fresh('2027-10-06',17.75,'dorm',{}); OUT.plan(G,{id:'t_out',ev:'ev_t_out',day:G.day,h:19,place:'溫州街',title:'測試的約',travel:'',travelH:0,alarm:true});
    const sl=STORY.bedOptions(G).filter(x=>x.kind==='sleep'||x.kind==='nap');
    check('4. 今天 19:00 標 alarm 的出遊，17:45 上床＝18:30 叫醒、提示寫那個約',sl.length===1&&sl[0].kind==='nap'&&Math.abs(sl[0].to-18.5)<1e-6&&/測試的約/.test(sl[0].hint),J(STORY.bedOptions(G).map(x=>[x.t,x.hint]))); }
  { const G=H.fresh('2027-10-06',18,'dorm',{}); G.invites=[{who:'zhe',day:G.day,h:20,accepted:true,done:false,label:'和阿哲吃晚餐'}];
    const sl=STORY.bedOptions(G).filter(x=>x.kind==='sleep'||x.kind==='nap');
    check('4. 答應了的約 20:00，18:00 上床＝19:30 叫醒',sl.length===1&&sl[0].kind==='nap'&&Math.abs(sl[0].to-19.5)<1e-6&&/阿哲/.test(sl[0].hint),J(kinds(G))); }
  { const base=kinds(H.fresh('2027-10-06',22,'dorm',{}));
    check('5. 沒有今晚的約：照舊睡到明天（早上、中午、下午、晚上）',base.filter(k=>k.startsWith('sleep@')).length>=3&&!base.some(k=>k.startsWith('nap')),J(base));
    const G=H.fresh('2027-10-06',22,'dorm',{}); OUT.plan(G,{id:'t_out2',ev:'ev_t_out',day:G.day,h:21,place:'溫州街',title:'已經過了的約',travel:'',travelH:0,alarm:true});
    check('5. 約已經過了（21:00，現在 22:00）：照舊',J(kinds(G))===J(base),J(kinds(G)));
    const G2=H.fresh('2027-10-06',18,'dorm',{}); OUT.plan(G2,{id:'t_out3',ev:'ev_t_out',day:G2.day,h:20,place:'溫州街',title:'沒有鬧鐘的約',travel:'',travelH:0});
    check('5. 不是 alarm 的出遊：照舊（和 18:00 沒有約一樣）',J(kinds(G2))===J(kinds(H.fresh('2027-10-06',18,'dorm',{}))),J(kinds(G2)));
    const G3=sisDay(22); check('5. 3/15 22:00（電話的時間過了）：照舊睡到明天',kinds(G3).some(k=>k.startsWith('sleep@'))&&!kinds(G3).some(k=>k.startsWith('nap')),J(kinds(G3))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
