// 溫州街小公園擴大版（ART-WZ1，LAWWW2-B；WZ_PARK_LAYOUT）接進遊戲——不需要瀏覽器。
// 在 Node 裡建出真正的溫州街區域：主巷走得進入口段、走得到主園區（老樹、涼亭、遊戲場、鞦韆），從北巷的入口 B 也進得來；
// 每個座位（鞦韆以外）都有互動點、旁邊站得住而且從主巷走得到；花籬、涼亭、遊戲場、樹圍座椅擋住；西北角（巷底那棟 F1）不能走；入口 A 前面沒有機車擋路；
// 季節節點：3 月杜鵑 _on、12～1 月楓香 _on，其他月份 _off；NPC 坐的長椅照配置檔。這是模擬，不是真實玩家流程（真實流程在 tests/touch_flow_wenzhou.py）。
// 修改前：沒有擴大版（主園區 (26,21) 站不住，第 2 項失敗）。用法：node tests/wz_park_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
check('1. 配置檔載入（WZ_PARK_LAYOUT v2）',typeof WZ_PARK_LAYOUT!=='undefined'&&WZ_PARK_LAYOUT.version===2);
const z=loadZone('wenzhou'); const L=WZ_PARK_LAYOUT;
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
const LANE=[26,0];
check('2. 入口段步道 (26,8)、主園區環狀步道 (26,17.6)、往入口 B 的步道 (12,18.8) 站得住',E.canStand(26,8,0.32,0)&&E.canStand(26,17.6,0.32,0)&&E.canStand(12,18.8,0.32,0));
{ const r=walk(LANE,[26,17.6]); check('2. 從主巷走進入口 A、走到老樹前面',r.ok,r.reason||''); }
{ const r=walk(LANE,[33.4,23.0]); check('2. 走得到鞦韆旁邊（主園區東邊）',r.ok,r.reason||''); }
{ const r=walk(LANE,[14.6,22.8]); check('2. 走得到涼亭前面（主園區西邊）',r.ok,r.reason||''); }
{ const r=walk([5.75,15],[10,19]); check('2. 從北巷經入口 B 走進主園區',r.ok,r.reason||''); }
check('3. 擋住的：樹圍座椅中心、涼亭、遊戲場、北側花籬、入口兩側花籬',!E.canStand(26,21.2,0.1,0)&&!E.canStand(14.6,25.2,0.1,0)&&!E.canStand(15.2,19.4,0.1,0)&&!E.canStand(24,28.7,0.1,0)&&!E.canStand(21.4,5.4,0.1,0)&&!E.canStand(30.6,5.4,0.1,0));
check('3. 西北角（巷底那棟 F1，x<11.8、z>21）不能走；公園外面（z 30、x 37）不能走',!E.canStand(10,24,0.1,0)&&!E.canStand(26,30.5,0.1,0)&&!E.canStand(37,22,0.1,0));
{ const seats=E.interactables.filter(i=>i.seat&&i.x>8&&i.x<37&&i.z>5&&i.z<30); const want=L.seats;
  check('4. 座位的互動點：'+want.length+' 個（老樹下的圓椅＝坐在樹下、鞦韆＝20:00 以後；AA_171）',seats.length===want.length&&want.every(s=>seats.some(i=>Math.abs(i.x-s.x)<1e-6&&Math.abs(i.z-s.z)<1e-6&&i.seat.yaw===s.yaw&&i.label===s.label)),seats.length+'/'+want.length);
  const bad=[]; for(const i of seats){ const p=nearStand(i.x,i.z,i.radius-0.05); const r=p&&walk(LANE,p); if(!r||!r.ok) bad.push(i.label+'('+i.x+','+i.z+')'+(r?r.reason:'旁邊站不住')); }
  check('4. 每個座位旁邊站得住、從主巷走得到',!bad.length,bad.join('、')); }
check('4. 小公園的互動（AA_171）：樹下 3、鞦韆 2、公布欄、象棋、土地公、直飲台各 1；貓在圓椅北邊',['tree','swing','notice','chess','shrine','fountain','cat'].map(k=>E.interactables.filter(i=>i.park===k).length).join()==='3,2,1,1,1,1,1',['tree','swing','notice','chess','shrine','fountain','cat'].map(k=>k+':'+E.interactables.filter(i=>i.park===k).length).join(' '));
  const reach=(i,from)=>{ const R=i.radius-0.05, pts=[]; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; if(E.canStand(i.x+dx,i.z+dz,0.32,0)) pts.push([i.x+dx,i.z+dz]); } pts.sort((a,b)=>Math.hypot(a[0]-from[0],a[1]-from[1])-Math.hypot(b[0]-from[0],b[1]-from[1])); for(const q of pts.slice(0,30)) if(walk(from,q).ok) return true; return false; };
  { const bad=[]; for(const i of E.interactables.filter(q=>q.park&&!q.seat)){ if(!reach(i,LANE)) bad.push(i.label); } check('4. 公布欄、象棋、土地公、直飲台、貓：旁邊站得住、從主巷走得到',!bad.length,bad.join('、')); }
check('4. 舊的小公園座位（大樹下 (26,11.82)、長椅 (23.6,7.94)）不在了',!E.interactables.some(i=>i.seat&&((Math.abs(i.seat.x-26)<0.01&&Math.abs(i.seat.z-11.82)<0.01)||(Math.abs(i.seat.x-23.6)<0.01&&Math.abs(i.seat.z-7.94)<0.01))));
{ let blocked=0; for(let x=22.8;x<=29.2;x+=0.2) if(!E.canStand(x,4.3,0.32,0)) blocked++; check('5. 入口 A 前面（z 4.3、x 22.8～29.2）沒有機車擋路',blocked===0,'擋住 '+blocked+' 格'); }
{ const fb=z.group?null:null; let n=0; E.scene.traverse(o=>{ if(o.userData&&o.userData.wzParkFb) n++; }); const g=Z3.ZONES.wenzhou; let m=0; (E.zone.group||E.scene).traverse(o=>{ if(o.userData&&o.userData.wzParkFb) m++; }); check('6. 備用外觀（模型載入前、失敗時）有標記，模型載入後會藏起來',Math.max(n,m)>=10,String(Math.max(n,m))); }
// 季節
{ const mk=()=>{ const r=new THREE.Group(); for(const nm of ['SEASON_AZALEA_on','SEASON_AZALEA_off','SEASON_SWEETGUM_on_1','SEASON_SWEETGUM_off_1','bench']){ const o=new THREE.Object3D(); o.name=nm; r.add(o); } return r; };
  const vis=r=>r.children.filter(o=>o.visible).map(o=>o.name).join(',');
  const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  const at=ds=>{ global.GAME={G:{day:dayOf(ds)}}; const r=mk(); Z3.wzParkSeason(r); return vis(r); };
  check('7. 3 月：杜鵑開（AZALEA_on）、楓香平常',at('2026-03-12')==='SEASON_AZALEA_on,SEASON_SWEETGUM_off_1,bench',at('2026-03-12'));
  check('7. 12 月：楓香紅葉（SWEETGUM_on）、杜鵑平常',at('2025-12-10')==='SEASON_AZALEA_off,SEASON_SWEETGUM_on_1,bench',at('2025-12-10'));
  check('7. 10 月：兩個都是平常（_off）',at('2025-10-10')==='SEASON_AZALEA_off,SEASON_SWEETGUM_off_1,bench',at('2025-10-10'));
  delete global.GAME; }
{ const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('8. NPC 坐小公園的長椅照配置檔（WZ_PARK_LAYOUT 的「坐在小公園的長椅」）',/WZ_PARK_LAYOUT\.seats\.filter\(q=>q\.label==='坐在小公園的長椅'\)/.test(st));
  const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('8. index.html 在 zones3d 之前載入 wz_park_layout.js',ih.indexOf('src/data/wz_park_layout.js')>0&&ih.indexOf('src/data/wz_park_layout.js')<ih.indexOf('src/zones3d.js')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
