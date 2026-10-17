// 博雅教學館的講座人潮（D55：「講座前後人潮變化」「演講與一般課程共用場景」）——不需要瀏覽器。
// 活動資料在遊戲裡是空的（內容等 AA、BB）；這裡用測試資料：某一天 18:30–20:30 在博雅 101 的演講，crowd.n＝14。
// 檢查（建出遊戲真正的博雅區域）：開始前 15 分鐘以前沒有人；18:20 起 101 坐了 14 個聽眾、坐在那一排的高度、102 沒有人；
//       出去再進來（同一場演講）同一些位子；演講結束（20:31）聽眾離開；別天沒有；公告欄的螢幕列出這場演講（只列博雅的）。
// 用法：node tests/boya_lecture_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}}; global.STORY={extraSpec:i=>({id:'x'+i})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.boya.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
E.addNPC=n=>{ if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };   /* 和引擎的 addNPC 一樣：坐著的放在座位的高度 */
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
check('遊戲裡排在博雅 101 的活動只有 B4（交接包 v2 C13 的博雅午後講座，大一下第 11 週週四）和 EXPO_Y2（交接包 v3 的交換說明會，大二下第 4 週週四中午；AA_177 4-2）；其他是 AA_110 6-3 的一般活動',ACTIVITIES.list.filter(a=>a.zone==='boya'&&a.room==='101').map(a=>a.id).join(',')==='B4,EXPO_Y2',ACTIVITIES.list.map(a=>a.id+':'+a.zone+'/'+(a.room||'-')).join(','));
const LD=dayOf('2025-10-22');   /* 週三 */
ACTIVITIES.list=[{id:'t_boya',title:'測試演講',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:['2025-10-22'],t0:18.5,t1:20.5,poster:{daysBefore:4},crowd:{n:14}}];
const GM={G:{day:LD,hour:18.0,zone:'boya',flags:{},weekday:3},E}; const aud=()=>E.npcs.filter(n=>n.clsStudent);
CLS.syncRooms(GM); check('18:00（開始前 30 分鐘）：還沒有聽眾',!aud().length,aud().length+' 人');
GM.G.hour=18.3; CLS.syncRooms(GM); const a=aud(); check('18:18（開始前 15 分鐘內）：博雅 101 坐了 14 個聽眾、102 沒有',a.length===14&&a.every(n=>n.seat.room==='101'),a.length+' 人');
check('聽眾坐在那一排的高度（0.3～1.8 m，和座位一樣）',a.every(n=>n.seat.kind==='lecture'&&Math.abs(n.obj.position.y-n.seat.y)<0.001&&n.seat.y>0.29),a.map(n=>n.obj.position.y.toFixed(1)).join(' '));
const pos=a.map(n=>n.seat.x+','+n.seat.z).join('|'); E.npcs=[]; CLS.syncRooms(GM); check('出去再進來（同一場演講）：同一些位子',aud().map(n=>n.seat.x+','+n.seat.z).join('|')===pos);
GM.G.hour=19.5; CLS.syncRooms(GM); check('19:30（演講中）：人數不變、沒有重複加人',aud().length===14,aud().length+' 人');
GM.G.hour=20.52; CLS.syncRooms(GM); check('20:31（結束）：聽眾離開',!aud().length,aud().length+' 人');
GM.G.day=LD+1; GM.G.hour=19.0; CLS.syncRooms(GM); check('隔天同一時間：沒有演講、沒有聽眾',!aud().length);
{ const scr=E.interactables.find(i=>i.board&&/講座資訊/.test(i.label)); global.GAME={G:{day:LD-2,hour:10}}; const t=scr.look; check('講座資訊螢幕：列出這場演講（10/22（三）18:30–20:30、博雅 101）',/10\/22（三） 18:30–20:30　測試演講（博雅 101）/.test(t),t);
  ACTIVITIES.list.push({id:'t_other',title:'別棟的活動',kind:'club',zone:'wancai',dates:['2025-10-21'],t0:19,t1:21,poster:{daysBefore:4}}); check('螢幕只列博雅的（萬才館的社團不列）',!/別棟的活動/.test(scr.look),scr.look); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
