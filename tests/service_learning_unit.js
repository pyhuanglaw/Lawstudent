// 服務學習（一）（AA_110 第 6-1 節，AA 暫定）——不需要瀏覽器。
// 使用者 2026-10-13 試玩：「每週至少要有大一的必修」——AA 查過台大法律系大一必修都有，漏的是服務學習（0 學分、一學期 18 小時）。
// 規則：大一上週三下午一（13:20–15:10）在法律學院圖書館櫃台報到，第 4～7、10～14 週共 9 次；0 學分、不進成績單、只記次數；
// 缺的可以在第 15、16 週同一時段補；2D 每次一句（不帶人物），第 n 次報到用第 n 句（第 1、9 句在第一次和最後一次）。
// 檢查：哪幾週有、考試週沒有、補做週只在次數不夠時有；報到的句子照次數；不記「準備」、不進成績單、不能自學；手機課表寫週次與次數；
//   櫃台：有報到時段時選項是「報到：服務學習（一）」，沒有時照舊只是櫃台的說明；服務學習（二）的集合點只在大二上出現。
// 用法：node tests/service_learning_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const said=[], caps=[], chose=[]; let answer=0;
const G={day:3,hour:13.0,weekday:3,zone:'lawlib',flags:{},energy:80,goal:'',goalDest:null};
const GM={G,E:{zone:null,interactables:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},titleIdle:false,
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(){},caption:(a,t)=>caps.push(t),autosave(){},setGoal(){},enter:async()=>{},
  choose:async o=>{ chose.push(o.map(q=>q.t)); return answer; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const svc=COURSES.list.find(c=>c.id==='service_1');
check('課表有服務學習（一）：大一上、週三下午一、法律學院圖書館櫃台、9 次、第 15–16 週補做',!!svc&&svc.term==='Y1S1'&&svc.slots.length===1&&svc.slots[0].wd===3&&svc.slots[0].block==='pm1'&&COURSES.rooms[svc.room]&&COURSES.rooms[svc.room].zone==='lawlib'&&svc.weeks.length===9&&(svc.makeupWeeks||[]).join()==='15,16'&&(svc.serviceLines||[]).length===9);
if(!svc){ console.log('FAILED '+fails); process.exit(1); }
/* 大一上每一個週三 */
const weds=[]; for(let d=1; d<200; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1') continue; if(CALENDAR.dateOf(d).wd===3) weds.push({day:d,week:t.week,hol:!!CALENDAR.holiday(d),key:CALENDAR.dateOf(d).key}); }
const has=(day)=>{ G.day=day; return CLS.dayItems(G).some(it=>it.c.id==='service_1'); };
const want=weds.filter(w=>svc.weeks.includes(w.week)&&!w.hol);
check('第 4～7、10～14 週的週三都有（AA 的 9 個日期：9/24、10/1、10/8、10/15、11/5、11/12、11/19、11/26、12/3）',want.length===9&&want.every(w=>has(w.day))&&want.map(w=>w.key.slice(5)).join(',')==='09-24,10-01,10-08,10-15,11-05,11-12,11-19,11-26,12-03',want.map(w=>w.key.slice(5)).join(','));
check('其他週沒有（第 3 週、考試週 8、9、17、18）',weds.filter(w=>[3,8,9,17,18].includes(w.week)).every(w=>!has(w.day)));
check('考試週以外的課照常（同一天的刑法總則還在）',(()=>{ G.day=want[0].day; return CLS.dayItems(G).some(it=>it.c.id==='crim_gen1'); })());
const w15=weds.find(w=>w.week===15), w16=weds.find(w=>w.week===16);
check('次數還沒滿：第 15、16 週有補做',has(w15.day)&&has(w16.day));
(async()=>{
  /* 報到 9 次：句子照次數 */
  const R=CLS.rec(G); const seen=[];
  for(let i=0;i<want.length;i++){ G.day=want[i].day; G.hour=13.0; said.length=0; caps.length=0; const it=CLS.dayItems(G).find(q=>q.c.id==='service_1'); await CLS.attend(GM,it,{door:true}); seen.push(said[0]); }
  check('9 次報到依序用第 1～9 句（第一次「第一次報到」、最後一次「十八小時。辛苦了」）',seen.every((t,i)=>t===svc.serviceLines[i]),seen.map(t=>t.slice(0,8)).join('｜'));
  check('只記次數：出席 9、沒有「準備」（不影響成績）',R.attend.service_1===9&&!R.prep.service_1,JSON.stringify({attend:R.attend.service_1,prep:R.prep.service_1}));
  check('最後一次的提示寫「時數滿了」',caps.some(t=>/9／9/.test(t)&&/時數滿了/.test(t)),caps.join(' / '));
  check('次數滿了：第 15、16 週沒有補做',!has(w15.day)&&!has(w16.day));
  check('成績單不列服務學習（只記次數）',!('service_1' in CLS.reportFor(G,'Y1S1')),JSON.stringify(CLS.reportFor(G,'Y1S1')));
  /* 學期結束的成績單：服務學習寫次數，不寫「過了／不錯／很好」（2026-10-13 這個測試抓到：原本寫成「服務學習（一）：undefined」）*/
  { let dEnd=null; for(let d=60; d<260&&!dEnd; d++){ const a=CALENDAR.termOf(d-1), b=CALENDAR.termOf(d); if(a&&a.id==='Y1S1'&&(!b||b.id!=='Y1S1')) dEnd=d; }
    G.day=CALENDAR.gradeDay('Y1S1'); G.hour=7.5; said.length=0; await CLS.morning(GM);   /* 16 週制：成績公布日（放假後第 3 個週一 1/5）才發 */ const msg=said.find(t=>/憲法/.test(t))||'';
    check('大一上的成績單：服務學習（一）寫「9／9 次」、沒有 undefined',/服務學習（一）：9／9 次/.test(msg)&&!/undefined/.test(msg),msg.slice(0,160)); }
  /* 補做：缺兩次的玩家 */
  G.courses={}; const R2=CLS.rec(G); said.length=0;
  for(const i of [0,1,2,3,4,6,8]){ G.day=want[i].day; G.hour=13.0; const it=CLS.dayItems(G).find(q=>q.c.id==='service_1'); await CLS.attend(GM,it,{door:true}); }
  check('缺兩次：第 15、16 週有補做',has(w15.day)&&has(w16.day),'出席 '+R2.attend.service_1);
  said.length=0; G.day=w15.day; G.hour=13.0; await CLS.attend(GM,CLS.dayItems(G).find(q=>q.c.id==='service_1'),{door:true});
  check('第 15 週補做＝第 8 次：用第 8 句（還沒看過的）',said[0]===svc.serviceLines[7],said[0]);
  said.length=0; G.day=w16.day; G.hour=13.0; await CLS.attend(GM,CLS.dayItems(G).find(q=>q.c.id==='service_1'),{door:true});
  check('第 16 週補做＝第 9 次：最後一句、出席 9',said[0]===svc.serviceLines[8]&&R2.attend.service_1===9,said[0]);
  /* 自學、手機課表 */
  G.day=want[0].day; G.hour=19; chose.length=0; await CLS.studyPick(GM); const opts=chose[0]||[];
  check('自學的科目不列服務學習',opts.length>0&&!opts.some(t=>/服務學習/.test(t)),opts.join('、'));
  const wh=CLS.weekHTML(G);
  check('手機「課表」：週三下午一寫服務學習（一）、第 4–7、10–14 週；出席寫「9／9 次」',/服務學習（一）/.test(wh)&&/第 4–7、10–14 週/.test(wh)&&/服務學習（一） 9／9 次/.test(wh));
  /* 櫃台 */
  G.courses={}; G.day=want[1].day; G.hour=13.25; chose.length=0; caps.length=0; answer=0;
  await CLS.doorInteract(GM,'lawlib_desk',{look:'櫃台：說明'});
  check('有報到時段時按櫃台：選項是「報到：服務學習（一）」，選了就報到',(chose[0]||[])[0]==='報到：服務學習（一）'&&CLS.rec(G).attend.service_1===1,JSON.stringify(chose[0]));
  G.day=want[1].day+1; G.hour=13.25; chose.length=0; caps.length=0;
  await CLS.doorInteract(GM,'lawlib_desk',{look:'櫃台：說明'});
  check('沒有報到時段時按櫃台：照舊只是櫃台的說明（不寫「今天沒有你在這裡的課」）',!chose.length&&caps[0]==='櫃台：說明',JSON.stringify(caps));
  /* 服務學習（二）的集合點：只在大二上 */
  const its=[]; const GM2=Object.assign({},GM,{E:{interactables:its}}); G.day=want[0].day; CLS.addDoors(GM2,'campus');
  check('大一上：校園沒有服務學習（二）的集合點',!its.some(i=>i.door==='campus_service'),its.map(i=>i.door).join(','));
  let dY2=null; for(let d=300; d<1200&&!dY2; d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y2S1'&&t.week===4&&CALENDAR.dateOf(d).wd===3) dY2=d; }
  its.length=0; G.day=dY2; CLS.addDoors(GM2,'campus');
  check('大二上：校園有服務學習（二）的集合點；那一週週三下午二有服務學習（二）',its.some(i=>i.door==='campus_service')&&CLS.dayItems(G).some(it=>it.c.id==='service_2'&&it.slot.block==='pm2'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
