// AA_110 第 6-3 節的活動（AA 暫定，story:false）：總圖新生導覽、法律資料怎麼查、辯論社、登山社——不需要瀏覽器。
// 使用者 2026-10-13 試玩：「沒事做的時間太長了」「我第一週上課完完全沒事做一整週」——AA：空的是下課以後、晚上和週末（活動清單是空的）。
// 檢查：日期／星期／週次對（考試週、放假不辦）；導覽在總圖大廳的集合點參加（今天有才放互動點；時間到了才能參加，還沒到寫幾點集合）；
//   講習在法律學院圖書館討論室 A 坐下時可以參加；社課在博雅 201、普通 201 坐下時可以參加；第一次去社課記下 CLUB_<id>；
//   「去一次就好」的（導覽、講習）參加過一場，其他場不再列、公告欄不再貼。吉他社、法服讀書會、社團博覽會、系籃（6-8）在 tests/clubs_aa110_unit.js。
// 用法：node tests/activities_aa110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const said=[], caps=[], chose=[]; let answer=0;
const G={day:3,hour:15.3,weekday:5,zone:'library_hall',flags:{},energy:80};
const GM={G,E:{zone:null,interactables:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(){},caption:(a,t)=>caps.push(t),autosave(){},setGoal(){},
  choose:async o=>{ chose.push(o.map(q=>q.t)); return answer; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const A=id=>ACTIVITIES.list.find(a=>a.id===id);
const ids=['lib_tour_y1s1','lawlib_intro_y1s1','club_debate','club_hiking'];
check('活動清單有 AA_110 6-3 的四筆＋6-8 的吉他社、法服讀書會、博覽會、系籃（全部 story:false；6-8 的細節在 clubs_aa110_unit.js）',ids.concat(['club_guitar','lawclub_study','club_expo_y1s1','dept_basketball']).every(i=>A(i)&&A(i).story===false),ACTIVITIES.list.map(a=>a.id).join(','));
/* 導覽 */
const tourDays=['2025-09-19','2025-09-23','2025-09-25','2025-09-26'].map(dayOf);
check('總圖新生導覽：9/19、9/23、9/25、9/26 有，其他天沒有',tourDays.every(d=>ACTIVITIES.on(A('lib_tour_y1s1'),d))&&!ACTIVITIES.on(A('lib_tour_y1s1'),dayOf('2025-09-24'))&&!ACTIVITIES.on(A('lib_tour_y1s1'),dayOf('2025-09-20')));
const spots=day=>{ G.day=day; GM.E.interactables=[]; CLS.addActSpots(GM,'library_hall'); return GM.E.interactables.filter(i=>i.actSpot); };
check('有導覽的那天，總圖大廳有「新生導覽集合點」；沒有的那天沒有；別的區域沒有',spots(tourDays[0]).length===1&&spots(tourDays[0])[0].label==='新生導覽集合點'&&spots(dayOf('2025-09-24')).length===0&&(()=>{ G.day=tourDays[0]; GM.E.interactables=[]; CLS.addActSpots(GM,'campus'); return GM.E.interactables.length===0; })());
(async()=>{
  G.day=tourDays[0]; G.hour=14.0; caps.length=0; chose.length=0; await CLS.spotInteract(GM,A('lib_tour_y1s1'));
  check('還沒到時間按集合點：寫「今天 15:30 在這裡集合」，不給參加',!chose.length&&/15:30 在這裡集合/.test(caps[0]||''),caps[0]);
  G.hour=15.3; said.length=0; caps.length=0; chose.length=0; answer=0; await CLS.spotInteract(GM,A('lib_tour_y1s1'));
  check('15:18 按集合點：「參加：總圖新生導覽」→ 參加、時間到 16:20、記下到場',(chose[0]||[])[0]==='參加：總圖新生導覽'&&ACTIVITIES.attended(G,'lib_tour_y1s1',G.day)&&Math.abs(G.hour-(16+20/60))<0.01&&said.some(t=>/集合點等「總圖新生導覽」/.test(t)),JSON.stringify(chose[0])+' '+G.hour.toFixed(2));
  G.day=tourDays[1]; G.hour=15.3; caps.length=0; chose.length=0; await CLS.spotInteract(GM,A('lib_tour_y1s1'));
  check('去一次就好：之後的場次按集合點寫「你已經參加過了」，不再給參加',!chose.length&&/已經參加過了/.test(caps[0]||''),caps[0]);
  check('去過以後公告欄、手機的「這幾天」不再列導覽',!ACTIVITIES.upcoming(G,7).some(q=>q.a.id==='lib_tour_y1s1'));
  /* 講習：討論室 A 的座位 */
  const d924=dayOf('2025-09-24'); G.day=d924; G.hour=15.4;
  check('法律資料怎麼查：9/24 15:24 坐在討論室 A 可以參加（法律學院圖書館；同一天 13:20 的服務學習已經結束）',ACTIVITIES.atSeat(G,'lawlib','discA')&&ACTIVITIES.atSeat(G,'lawlib','discA').id==='lawlib_intro_y1s1'&&!ACTIVITIES.atSeat(G,'lawlib','discB'));
  /* 社課 */
  const tueOf=w=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===2) return d; } return null; };
  const thuOf=w=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===4) return d; } return null; };
  G.hour=19.2; G.day=tueOf(5);
  check('辯論社：第 5 週週二 19:12 坐在博雅 201 可以參加',(ACTIVITIES.atSeat(G,'boya','201')||{}).id==='club_debate');
  G.day=tueOf(4); const no4=!ACTIVITIES.atSeat(G,'boya','201'); G.day=tueOf(8); const no8=!ACTIVITIES.atSeat(G,'boya','201'); G.day=tueOf(17); const no17=!ACTIVITIES.atSeat(G,'boya','201');
  check('辯論社：第 4 週（社團還沒開始）、第 8 週（期中考）、第 17 週（期末）沒有',no4&&no8&&no17);
  G.day=thuOf(10); G.hour=19.6;
  check('登山社：第 10 週週四 19:36 坐在普通 201 可以參加',(ACTIVITIES.atSeat(G,'putong','201')||{}).id==='club_hiking');
  G.day=tueOf(6); G.hour=19.1; said.length=0; await CLS.attendActivity(GM,A('club_debate'));
  check('第一次去辯論社：記下 CLUB_club_debate（AA：第一次去社課就算加入）、時間到 21:00',G.flags.CLUB_club_debate===true&&Math.abs(G.hour-21)<0.01);
  /* 放假不辦（第 5、6 週的週一、第 6 週的週五——AA_110 6-3；這裡看辯論社所在的週二有沒有碰到假日：有的話不辦）*/
  const hol=[5,6,7,10,11,12,13,14,15,16].map(tueOf).filter(d=>CALENDAR.holiday(d));
  check('放假的週二不辦辯論社',hol.every(d=>{ G.day=d; G.hour=19.2; return !ACTIVITIES.atSeat(G,'boya','201'); }),'放假的週二：'+hol.map(d=>CALENDAR.dateOf(d).key).join(',')||'沒有');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
