// 建築裡的教室上課（D55：大一國文在博雅教學館 101 階梯教室——AA_103 第 8 節、方案 A；之前暫時在共同 101）——不需要瀏覽器。
// 檢查：坐在 101 的座位、課開始前後 30 分鐘內 → 坐下的第一個選項是這堂課；坐在 102 → 不是；
//       起床的目標導航指到「看看共同 101 教室」（館裡找得到這個互動點）；
//       上課時 101 坐了一部分同學（位子照課程與日期固定，再算一次一樣；坐在那一排的高度）、102 沒有；下課後同學離開；
//       校園上共同教學館的門：課在館內的教室 → 按門就進館（不上門口的 2D 課），提示教室在哪。
// AA_489 第 3 節（8f3d4d2f9）：提早坐下、轉暗時多一句「（你在座位上等。教室慢慢坐滿了。）」（同學在這句以後坐好）——「上課時」從這句以後的第一句算。
// 用法：node tests/teach_class_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}}; global.STORY={extraSpec:i=>({id:'x'+i})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.boya.build(E);   /* 大一國文在博雅教學館 101（AA_103 第 8 節；方案 A 之前暫時在共同 101）*/ E.zone=z; E.levels=z.levels; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
E.addNPC=n=>{ E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const TUE=dayOf('2025-09-23');   /* 週二：09:10 大一國文（共同教學館 101）、13:20 通識（同一間）*/
const mkG=h=>({day:TUE,hour:h,zone:'boya',flags:{},weekday:2});
const s101=z.seats.find(q=>q.room==='101'), s102=z.seats.find(q=>q.room==='102');
{ const it=CLS.seatClass(mkG(9.0),s101); check('09:00 坐在 101：第一個選項是「大一國文」（課在博思教學館 101）',it&&it.c.id==='chinese_y1'&&it.room.name==='博思教學館 101',it?it.c.name+'／'+it.room.name:'null');
  check('09:00 坐在 102：沒有課',!CLS.seatClass(mkG(9.0),s102));
  check('坐在沙發、自習小桌：不是上課的位子',!CLS.seatClass(mkG(9.0),z.seats.find(q=>q.kind==='sofa'))&&!CLS.seatClass(mkG(9.0),z.seats.find(q=>q.kind==='study')));
  check('09:50（開始超過 30 分鐘）坐在 101：遲到，照樣可以上（使用者 2026-10-15）',!!CLS.seatClass(mkG(9.84),s101));
  check('11:45（下課前 30 分鐘以後）坐在 101：已經算沒來，不能上',!CLS.seatClass(mkG(11.75),s101)); }
{ const g=CLS.goalFor(mkG(8.0)); const it=E.interactables.find(i=>g.dest&&(i.label||'').startsWith(g.dest.label));
  check('起床的目標：導航指到博思教學館 101（館裡有「看看博思 101 階梯教室」這個互動點）',g.dest&&g.dest.zone==='boya'&&!!it,JSON.stringify(g.dest)+' → '+(it&&it.label)); }
{ const GM={G:mkG(9.25),E}; CLS.syncRooms(GM); const a=E.npcs.filter(n=>n.clsStudent).map(n=>n.seat.room+':'+n.seat.x+','+n.seat.z);
  check('上課時（09:15）：101 坐了一部分同學（5～16 人）、102 沒有',a.length>=5&&a.length<=16&&a.every(q=>q.startsWith('101:')),a.length+' 人');
  const st=E.npcs.filter(n=>n.clsStudent); check('同學坐在那一排的高度（階梯教室：0.3～1.5 m，和座位一樣）',st.length&&st.every(n=>n.seat.kind==='lecture'&&Math.abs(n.obj.position.y-n.seat.y)<0.001&&n.seat.y>0.29),st.map(n=>n.obj.position.y.toFixed(1)).join(' '));
  E.npcs=[]; CLS.syncRooms(GM); const b=E.npcs.filter(n=>n.clsStudent).map(n=>n.seat.room+':'+n.seat.x+','+n.seat.z);
  check('出去再進來（同一堂課）：同一些位子',JSON.stringify(a)===JSON.stringify(b));
  GM.G.hour=12.4; CLS.syncRooms(GM); check('下課後（12:24）：同學離開',!E.npcs.some(n=>n.clsStudent),E.npcs.filter(n=>n.clsStudent).length+' 人'); }
(async()=>{ const G=Object.assign(mkG(8.95),{zone:'campus'});   /* 校園上博雅教學館的門（方案 A）*/ let entered=null; const toasts=[]; const GM={G,E,enter:async zid=>{ entered=zid; },toast:t=>toasts.push(t),sceneBegin(){},sceneEnd(){},choose:async()=>0};
  await CLS.doorInteract(GM,'boya'); check('08:57 在校園按博思教學館的門：直接進館（不上門口的 2D 課）、提示教室在 101',entered==='boya'&&toasts.some(t=>/博思教學館 101/.test(t)),entered+' '+toasts.join('|'));
  /* 玩家坐著上完課（快轉到下課）：同學站起來走出去，不是在黑畫面裡一起消失（keepCrowd）。修改前：時間一跳超過 0.6 小時就當成「跳過時間」直接移除 */
  { global.CROWD={seatSide:(E,st)=>[st.x,st.z+(Math.cos(st.yaw||0)>0?-0.6:0.6)]};   // 座位旁站得起來的位置（測試用；遊戲裡是 crowd3d.js）
    E.npcs=[]; const G2=mkG(9.2); const GM2={G:G2,E,say:async()=>{},choose:async()=>0,fade:async()=>{},advance:h=>{ G2.hour+=h; },energy(){},caption(){},sceneBegin(){},sceneEnd(){},autosave(){},setGoal(){},toast(){}};
    CLS.syncRooms(GM2); const n0=E.npcs.filter(n=>n.clsStudent).length; const it=CLS.dayItems(G2).find(q=>q.c.id==='chinese_y1');
    await CLS.attend(GM2,it,{inScene:true}); CLS.syncRooms(GM2); const out=E.npcs.filter(n=>n.leaving), left=E.npcs.filter(n=>n.clsStudent);
    check('坐著上完大一國文（09:12 → 12:10）：同學站起來往出口走（不是一起消失）',n0>=5&&out.length>=n0-1&&!left.length&&out.every(n=>n.path&&n.path.length),`上課 ${n0} 人、走出去 ${out.length} 人、還坐著 ${left.length} 人`);
    E.npcs=[]; G2.hour=9.2; CLS.syncRooms(GM2); G2.hour=12.4; CLS.syncRooms(GM2); check('跳過時間（不是坐著上完課）：照舊直接移除，不從遠處走回來',!E.npcs.length,E.npcs.length+' 人'); }
  /* 提早坐下上課（2026-10-18 BB-C：經濟系共同教學館的課整堂只有祐廷一個人）：開始前 30 分鐘就能坐下、課馬上開始，同學 10 分鐘前才陸續進來。
     修改前：08:42 坐下，上課的對話裡 0 個同學 */
  { E.npcs=[]; const G3=mkG(8.7); let seen=null; const GM3={G:G3,E,say:async(w,t)=>{ if(seen==null&&!/教室慢慢坐滿了/.test(t||'')) seen=E.npcs.filter(n=>n.clsStudent).length; },choose:async()=>0,fade:async()=>{},advance:h=>{ G3.hour+=h; },energy(){},caption(){},sceneBegin(){},sceneEnd(){},autosave(){},setGoal(){},toast(){}};
    CLS.syncRooms(GM3); const n0=E.npcs.filter(n=>n.clsStudent).length; const it=CLS.dayItems(G3).find(q=>q.c.id==='chinese_y1');
    await CLS.attend(GM3,it,{inScene:true}); check('08:42（開始前 28 分鐘）坐下上大一國文：上課的時候同學都坐好了（不是只有祐廷一個人）',n0===0&&seen>=5,`坐下時 ${n0} 人、上課時 ${seen} 人`); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
