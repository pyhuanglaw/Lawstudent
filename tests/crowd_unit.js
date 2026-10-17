// 人流（src/crowd3d.js；D55，使用者 2026-10-13「場景必須隨時間改變」）——不需要瀏覽器。
// 在 Node 裡建出遊戲真正的校園，檢查：
//   時段：共同教學館門口——上課日每一節前 20 分鐘有人等、下課後 10 分鐘有人出來，其他時間、週末、國定假日、寒假沒有；
//         大一女舍門口——平日早上出門、傍晚回來、晚上等人，深夜沒有；週末白天零星；
//   同一天、同一個時段的那一群人固定（重新進來看到同一批人、同一些位置、同一些外觀）；不同天不一樣；
//   每個人的位置、門口、馬路的點都站得住（一週裡每一個時段）；大一女舍門口都是女生；
//   進到區域時照現在的時間排好（沒有時段＝沒有人）；時段結束：走向門口或馬路（有路線）；時間跳了（跳過時間）：直接照新的時間重排。
// 用法：node tests/crowd_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/calendar.js','src/data/places.js','src/crowd3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|CALENDAR|PLACES|CROWD|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
// 外觀與人物：CHAR.build 換成空的群組（只測位置與時段）；extraSpec 只需要 id 與性別（偶數＝女生，和 story3d.js 一樣）
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
E.player={obj:{position:new THREE.Vector3(-112,0,0),rotation:{y:0}},radius:0.32,lv:0}; E.camera=null;
/* 引擎的 addNPC／removeNPC 要用到渲染場景（Node 裡沒有）：換成只記錄名單的版本（加人時的導航高度、路線用引擎真正的 moveTo） */
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };   /* 沒有鏡頭＝inView 一律 true；測試裡用「時間跳了」走直接重排 */
const SP=id=>CROWD.SPOTS.find(s=>s.id===id);
const mkG=(day,h)=>({day,hour:h,zone:'campus',flags:{}});
const slotKey=(id,day,h)=>{ const s=CROWD.slotAt(mkG(day,h),SP(id)); return s?s.key:null; };
const T=dayOf('2025-10-07'), SAT=dayOf('2025-10-11'), HOL=dayOf('2025-10-10'), BRK=dayOf('2026-01-14');
// ---------- 時段 ----------
check('共同教學館：上課日 08:55（第一節前）有人等、10:30（上課中）沒有、12:15（下課後）有人出來',slotKey('gongtong',T,8.92)&&!slotKey('gongtong',T,10.5)&&slotKey('gongtong',T,12.25),[slotKey('gongtong',T,8.92),slotKey('gongtong',T,10.5),slotKey('gongtong',T,12.25)].join(','));
check('共同教學館：週六、國慶日、寒假都沒有',!slotKey('gongtong',SAT,8.92)&&!slotKey('gongtong',HOL,8.92)&&!slotKey('gongtong',BRK,8.92));
check('大一女舍：平日 08:00 出門、18:00 回來、21:00 門口等人、03:00 沒有人',slotKey('fdorm',T,8)==='am'&&slotKey('fdorm',T,18)==='eve'&&slotKey('fdorm',T,21)==='night'&&!slotKey('fdorm',T,3),[slotKey('fdorm',T,8),slotKey('fdorm',T,18),slotKey('fdorm',T,21),slotKey('fdorm',T,3)].join(','));
check('大一女舍：週六白天零星（wkday）、晚上（wkeve）',slotKey('fdorm',SAT,12)==='wkday'&&slotKey('fdorm',SAT,20)==='wkeve');
// ---------- 同一群人 ----------
{ const g1=CROWD.group(mkG(T,8.92),SP('gongtong'),CROWD.slotAt(mkG(T,8.92),SP('gongtong'))), g2=CROWD.group(mkG(T,9.0),SP('gongtong'),CROWD.slotAt(mkG(T,9.0),SP('gongtong')));
  const g3=CROWD.group(mkG(T+1,8.92),SP('gongtong'),CROWD.slotAt(mkG(T+1,8.92),SP('gongtong')));
  check('同一天同一個時段：同一批人（人數、位置、外觀一樣；幾分鐘後再算一次也一樣）',JSON.stringify(g1)===JSON.stringify(g2)&&g1.length>=3,g1.length+' 人');
  check('不同天：不一樣的一群人',JSON.stringify(g1)!==JSON.stringify(g3)); }
// ---------- 站得住、女舍都是女生 ----------
{ const bad=[], male=[]; for(let d=T;d<T+7;d++) for(const spot of CROWD.SPOTS){ for(const sl of spot.slots(mkG(d,0))){ const g=CROWD.group(mkG(d,sl.t0),spot,sl); for(const p of g){ if(!E.canStand(p.x,p.z,0.3,0)) bad.push(spot.id+'/'+sl.key+'@'+d+' ('+p.x+','+p.z+')'); if(spot.female&&p.spec%2) male.push(p.spec); } } }
  check('一週裡每一個時段、每一個人的位置都站得住（不在牆裡、長椅上、腳踏車架上）',!bad.length,bad.slice(0,4).join(' | '));
  check('大一女舍門口的人都是女生（extraSpec 偶數）',!male.length,male.slice(0,5).join(','));
  const pts=[]; for(const s of CROWD.SPOTS){ pts.push([s.id+' door',s.door]); if(s.door2) pts.push([s.id+' door2',s.door2]); pts.push([s.id+' road',s.road]); }
  const b2=pts.filter(([,p])=>!E.canStand(p[0],p[1],0.3,0)).map(q=>q[0]); check('門口、馬路的點站得住（人從這裡走出來、走進去）',!b2.length,b2.join(',')); }
// ---------- 在遊戲裡 ----------
{ const G=mkG(T,8.92); const GM={G,E}; E.npcs=[]; CROWD.enter(GM,'campus'); const n1=E.npcs.filter(n=>n.crowd==='gongtong'); const pos1=n1.map(n=>[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.obj.userData.spec.id]);
  check('進到校園（08:55 上課日）：共同教學館門口直接有人（照現在的時間排好）',n1.length>=3,n1.length+' 人');
  for(const n of E.npcs.slice()) E.removeNPC(n); CROWD.enter(GM,'campus'); const pos2=E.npcs.filter(n=>n.crowd==='gongtong').map(n=>[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.obj.userData.spec.id]);
  check('出去再進來（同一時段）：同一批人、同一些位置',JSON.stringify(pos1)===JSON.stringify(pos2),JSON.stringify(pos2).slice(0,120));
  G.hour=9.0; CROWD.tick(GM,2); G.hour=9.18; CROWD.tick(GM,2);   /* 09:10 開始上課：等的人走進館裡 */
  const lv=E.npcs.filter(n=>n.crowd==='gongtong'); check('09:11（上課開始）：門口的人走向門口（有路線、標記離開），不是瞬間消失',lv.length>=3&&lv.every(n=>n.leaving&&n.path&&n.path.length),lv.map(n=>!!n.leaving+'/'+(n.path?n.path.length:0)).join(' '));
  G.hour=10.5; CROWD.tick(GM,2); const after=E.npcs.filter(n=>n.crowd==='gongtong'&&!n.leaving);
  check('跳過時間到 10:30（上課中）：直接重排，門口沒有人',!E.npcs.some(n=>n.crowd==='gongtong'),E.npcs.filter(n=>n.crowd==='gongtong').length+' 人');
  G.hour=12.25; CROWD.tick(GM,2); check('再跳到 12:15（下課後）：門口有剛下課的人',E.npcs.filter(n=>n.crowd==='gongtong').length>=2);
  G.hour=24+3; CROWD.tick(GM,2); check('跳到深夜 03:00：兩個門口都沒有人',!E.npcs.some(n=>n.crowd));
  G.day=T+1; G.hour=24+18; CROWD.tick(GM,2); const f=E.npcs.filter(n=>n.crowd==='fdorm'); check('隔天 18:00：大一女舍門口有傍晚回來的人',f.length>=2,f.length+' 人'); }
// ---------- 路人加倍（使用者 2026-10-17 P0「路人數量要再加倍」：STORY.CROWD_X）----------
{ const one=[], two=[], bad=[]; for(let d=T;d<T+7;d++) for(const spot of CROWD.SPOTS) for(const sl of spot.slots(mkG(d,0))){ STORY.CROWD_X=undefined; one.push(CROWD.group(mkG(d,sl.t0),spot,sl).length); STORY.CROWD_X=2; const g=CROWD.group(mkG(d,sl.t0),spot,sl); two.push(g.length); for(const p of g) if(!E.canStand(p.x,p.z,0.3,0)) bad.push(spot.id+'/'+sl.key+'@'+d+' ('+p.x+','+p.z+')'); }
  STORY.CROWD_X=undefined;
  check('STORY.CROWD_X＝2：每一群人數是原本的兩倍',one.length>0&&one.every((n,i)=>two[i]===n*2),JSON.stringify(one.slice(0,6))+' → '+JSON.stringify(two.slice(0,6)));
  check('STORY.CROWD_X＝2：一週裡多出來的人也都站得住',!bad.length,bad.slice(0,4).join(' | ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
