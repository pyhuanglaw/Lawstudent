// X78（使用者 10-20「法律系的課不要都在霖澤館，萬才也要有」；AA_330 企劃 48845c36）——不需要瀏覽器。
//   1. 萬才館多功能教室五門必修（物權、身分法、公司法、保險法、強制執行法）、霖澤館 202 八門選修（原本 LINZE 門口上課）；大一、刑分、債各、刑訴、行政法、債總二、行政救濟、民訴照舊 201
//   2. 那一天的課表：教室名字、目標導航到那個區域（whole，不找「看看…」的門牌）、路程照那棟樓算（via）
//   3. 坐在那間教室的座位（rooms_glb3d.js 的座位 room＝multi／c202）＝這堂課可以上（CLS.seatClass）
//   4. 第一次在那間教室上課：一句旁白（AA_330 第 3 點），只演一次；考試不演
// 修改前：課程還在 L201／LINZE（第 1 項 FAIL）。用法：node tests/x78_rooms_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{},M:()=>({})}; global.THREE={Vector3:function(){}};
global.document={getElementById:()=>null,addEventListener(){}}; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|ACTIVITIES|LINZE_LAYOUT|WANCAI_LAYOUT|ROOM_GLB_LAYOUTS|CLS|COURSES|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/linze_layout.js','src/data/wancai_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const C=id=>COURSES.list.find(c=>c.id===id);
const W=['property','family_law','company_law','insurance','enforcement'], L=['legal_english','securities','negotiable','labor_law','ip_law','labor_social','tax_law','maritime'];
check('1. 萬才館多功能教室五門、霖澤館 202 八門', W.every(id=>C(id)&&C(id).room==='WMULTI')&&L.every(id=>C(id)&&C(id).room==='L202'), [...W,...L].map(id=>id+':'+(C(id)||{}).room).join(' '));
{ const stay=COURSES.list.filter(c=>c.term&&/^Y1/.test(c.term)&&/^(L201|LINZE)$/.test(c.room)).length, moved1=COURSES.list.filter(c=>/^Y1/.test(c.term||'')&&/^(WMULTI|L202)$/.test(c.room));
  const keep=['刑法分則','債法各論','刑事訴訟法','行政法','民事訴訟法']; const k2=COURSES.list.filter(c=>keep.some(n=>c.name.indexOf(n)===0)&&/^(WMULTI|L202)$/.test(c.room));
  check('1. 不搬的照舊：大一全部、刑分、債各、刑訴、行政法、民訴不在新教室', stay>0&&moved1.length===0&&k2.length===0, k2.map(c=>c.name).join('、')); }
check('1. 教室資料：萬才館 多功能教室＝wancai_multi／multi、霖澤館 202＝linze_202／c202（via 那棟樓、whole）', COURSES.rooms.WMULTI.zone==='wancai_multi'&&COURSES.rooms.WMULTI.room==='multi'&&COURSES.rooms.WMULTI.via==='wancai'&&COURSES.rooms.L202.zone==='linze_202'&&COURSES.rooms.L202.room==='c202'&&COURSES.rooms.L202.via==='linze');
// 2. 那一天的課表
const T0=CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; let day=null, it=null;
for(let d=T0?T0.from:1;T0&&d<=T0.to&&!it;d++){ const G={day:d,hour:8,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',flags:{},courses:null}; const its=CLS.dayItems(G).filter(q=>q.c.id==='property'); if(its.length){ day=d; it=its[0]; } }
check('2. 大二上民法物權的那一天：教室是「萬才館 多功能教室」', !!it&&it.room.name==='法律系館B 多功能教室', it?CALENDAR.dateOf(day).key:'找不到');
if(it){ const G={day,hour:it.t0-0.6,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',flags:{}}; const g=CLS.goalFor(G);
  check('2. 目標導航到 wancai_multi（整個區域就是教室，不找「看看…」）', g.dest&&g.dest.zone==='wancai_multi'&&!g.dest.label, JSON.stringify(g.dest)); }
// 3. 座位
{ const zl=ROOM_GLB_LAYOUTS.wancai_multi; const seat={x:zl.seats[0].x,z:zl.seats[0].z,room:zl.host_door.id};
  if(it){ const G={day,hour:it.t0+0.05,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',flags:{},zone:'wancai_multi'}; const sc=CLS.seatClass(G,seat);
    check('3. 坐在多功能教室的座位（room＝multi）＝這堂民法物權可以上', !!sc&&sc.c.id==='property', sc?sc.c.name:'null'); } }
// 4. 第一次的旁白
check('4. 第一次在那間教室上課的旁白（AA_330 第 3 點）', CLS.ROOM_FIRST&&CLS.ROOM_FIRST.wancai_multi==='（法律系館B一樓的多功能教室。椅子是可以移動的那種，大家坐得比在 201 鬆。）'&&CLS.ROOM_FIRST.linze_202==='（二樓的 202 是平面教室。長桌一排一排，沒有階梯。坐後面也看得到黑板。）');
{ const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
  check('4. attend：不是考試、不是遲到缺席、沒演過才演，演完記 ROOM_FIRST_<區域>', /line&&!exam&&!lateAbs&&G\.flags&&!G\.flags\['ROOM_FIRST_'\+zf\]\)\{ G\.flags\['ROOM_FIRST_'\+zf\]=true;/.test(src)); }
// 5. BB-C 10-21（36faaeec）：202 上課前 4 分鐘一個同學都沒有。GLB 教室（rooms_glb3d.js）的區域沒有 layout、座位沒有 kind，CLS.syncRooms 直接跳過＝只會有作息裡的熟人、沒有一般同學。
//    改：座位 kind:'class'、區域 glbRoom＝true，syncRoom／syncRooms 認得。修改前這兩項失敗。
{ const rg=fs.readFileSync(path.join(ROOT,'src/rooms_glb3d.js'),'utf8');
  check('5. rooms_glb3d：GLB 教室的區域標 glbRoom、座位有 kind（class）', /z\.glbRoom=true/.test(rg)&&/kind:s\.kind\|\|'class'/.test(rg));
  const zl=ROOM_GLB_LAYOUTS.linze_202, seats=zl.seats.map(s=>({x:s.x,z:s.z,yaw:s.yaw,lv:0,room:zl.host_door.id,kind:s.kind||'class'}));
  let day=null, it=null; const T1=CALENDAR.termDays('Y3S1');
  for(let d=T1.from;d<=T1.to&&!it;d++){ const G={day:d,hour:8,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',flags:{},courses:null}; const its=CLS.dayItems(G).filter(q=>q.room&&q.room.zone==='linze_202'&&!q.exam); if(its.length){ day=d; it=its[0]; } }
  const added=[]; const E={zone:{glbRoom:true,seats},npcs:[],addNPC(n){ added.push(n); this.npcs.push(n); },removeNPC(){}};
  const sv={CHAR:global.CHAR,STORY:global.STORY}; global.CHAR={build:()=>({position:{set(){}},rotation:{}})}; global.STORY=Object.assign({},global.STORY||{},{extraSpec:i=>({id:'x'+i})});
  let err=null; if(it){ const G={day,hour:it.t0-4/60,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',flags:{},zone:'linze_202',courses:null}; try{ CLS.syncRooms({G,E},{full:true,instant:true}); }catch(e){ err=e; } }
  global.CHAR=sv.CHAR; global.STORY=sv.STORY;
  check('5. 霖澤館 202 有選修課的那一天，上課前 4 分鐘：一般同學坐進 202（CLS.syncRooms 認得 glbRoom）', !!it&&!err&&added.length>0&&added.every(n=>n.clsStudent&&n.seat&&n.seat.room==='c202'), (it?CALENDAR.dateOf(day).key+' '+it.c.name:'找不到 202 的課')+' 人數 '+added.length+(err?' '+err.message:'')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
