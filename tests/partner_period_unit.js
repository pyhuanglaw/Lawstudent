// 伴侶期間（AA 2026-10-14：照劇情事件結束、不照整學期；事件沒發生照日期保底；小語從「語 3」起和阿哲交往）——兩個人單獨的邀約（吃飯、散步）照這個擋。不需要瀏覽器：
//   1. 學姊：大一上就有伴侶；大三上第 9 週還有、第 10 週起沒有（保底）；結束的事件演過了就沒有（endEvent）；
//   2. 沛珊：大一上沒有、大一下第 7 週（2026-04-06，AA_373 #3）起有；大二上第 6 週還有、第 7 週起沒有；
//   3. 小語：大二上第 14 週沒有、第 15 週（12/19 系籃賽後的語 3，AA_143 通則、AA_177 4-4；原本第 13 週）起有、到大四下都有；開始的事件演過了就有（startEvent）；
//   4. 舊格式 {from, until}（整學期）照舊；5. 邀約：大三上第 10 週以後約學姊吃飯不再被「兩個人單獨」擋。修正前（沒有 STORY.partnerOn）這個測試會失敗。
// 用法：node tests/partner_period_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{set(){}},rotation:{y:0},userData:{}}),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.EVENTS={cond:()=>false,habit(){},onInteract:()=>false,npcOf:()=>null,onEnter(){},tick(){}};
const load=(f,names)=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const ('+names+')\\s*=','mg'),'global.$1='),{filename:f});
load('src/data/calendar.js','CALENDAR'); load('src/data/places.js','PLACES'); load('src/data/characters.js','CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS'); load('src/social3d.js','SOCIAL');
for(const f of ['src/data/rel_lines.js','src/data/courses.js','src/data/invites.js','src/invites3d.js','src/story3d.js']) load(f,'REL_LINES|COURSES|INVITE_DATA|INV|STORY');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('STORY.partnerOn 存在',typeof STORY.partnerOn==='function'); if(typeof STORY.partnerOn!=='function'){ console.log('FAILED: '+fails); process.exit(1); }
const dayOf=(term,week)=>{ for(let d=1;d<2200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week) return d; } return null; };
const at=(term,week,done)=>({day:dayOf(term,week),events:{done:done||{}},flags:{}});
const on=(id,G)=>STORY.partnerOn(G,CHARACTERS[id].partner);
check('1. 學姊沒有伴侶設定（characters.js 沒有 partner）（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）',!CHARACTERS.heroine_05.partner);
const SISP={from:'Y1S1',untilWeek:{term:'Y3S1',week:9},endEvent:null};   /* 原本學姊的格式，留著測 untilWeek／endEvent 的機制 */
check('1. untilWeek：大三上第 9 週還有（保底到第 9 週結束）',STORY.partnerOn(at('Y3S1',9),SISP));
check('1. untilWeek：第 10 週沒有了',!STORY.partnerOn(at('Y3S1',10),SISP));
{ const p=Object.assign({},SISP,{endEvent:'ev_test_sis_breakup'}); check('1. 結束的事件（「一件事。我上週分手了。」）演過了：大二就沒有了',!STORY.partnerOn(at('Y2S2',3,{ev_test_sis_breakup:1}),p)&&STORY.partnerOn(at('Y2S2',3),p)); }
check('2. 沛珊大一上：沒有',!on('classmate_peishan',at('Y1S1',8)));
check('2. 沛珊大一下第 7 週（2026-04-06）起有、第 6 週還沒有（AA_373 #3：原本大一下第 1 週起）',!on('classmate_peishan',at('Y1S2',6))&&on('classmate_peishan',at('Y1S2',7))&&on('classmate_peishan',at('Y1S2',12)));
check('2. 沛珊大二上第 6 週：還有；第 7 週：沒有了',on('classmate_peishan',at('Y2S1',6))&&!on('classmate_peishan',at('Y2S1',7)));
check('3. 小語大二上第 14 週：沒有；第 15 週（12/19 系籃賽後的語 3）：有',!on('yu',at('Y2S1',14))&&on('yu',at('Y2S1',15)),String(CALENDAR.dateOf(dayOf('Y2S1',15)).m)+'月');
check('3. 小語大四下：還有（到尾聲）',on('yu',at('Y4S2',5)));
{ const p=Object.assign({},CHARACTERS.yu.partner,{startEvent:'ev_test_yu3'}); check('3. 開始的事件（語 3）演過了：第 12 週就有',STORY.partnerOn(at('Y2S1',12,{ev_test_yu3:1}),p)&&!STORY.partnerOn(at('Y2S1',12),p)); }
check('4. 舊格式 {from, until}（整學期）照舊',STORY.partnerOn(at('Y2S1',16),{from:'Y1S2',until:'Y2S1'})&&!STORY.partnerOn(at('Y2S2',1),{from:'Y1S2',until:'Y2S1'})&&!STORY.partnerOn(at('Y1S1',5),{from:'Y1S2',until:'Y2S1'}));
{ const G=Object.assign({rel:{},social:null,weekday:1,hour:10,contacts:{},invites:[],msgs:[]},at('Y3S1',10)); SOCIAL.bind(G); const P=INV.place('noodle');
  const G9=Object.assign({rel:{},social:null,weekday:1,hour:10,contacts:{},invites:[],msgs:[]},at('Y3S1',9)); SOCIAL.bind(G9); const b9=INV.partnerBlock(G9,'heroine_05',P); SOCIAL.bind(G); const b10=INV.partnerBlock(G,'heroine_05',P);
  check('5. 邀約：學姊任何時候吃飯都不被「有伴侶」擋（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）',b9===false&&b10===false,JSON.stringify({b9,b10})); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
