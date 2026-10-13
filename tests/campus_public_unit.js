// 台大總校區的公共場景（使用者 2026-10-13：普通、共同、博雅教學館、大一女舍；docs/campus/TEACHING_BUILDINGS_PLAN.md）——不需要瀏覽器。
// 在 Node 裡建出遊戲真正的校園，檢查：
//   每棟（共同、普通、博雅、大一女舍）的入口互動點站得住、從校門與霖澤館前都走得到；方案 A 的南北順序、湖心亭走得到（引擎真正的找路＋移動碰撞，走路與跑步＋低幀率）；
//   建築本體走不進去（不會穿牆）；大一女舍 A、B 兩棟之間（2 樓天橋下）走得過去；門口長椅坐得到；
//   入口有名牌（mark）、大地圖有地名、快速前往的落點在門口前。
// 這是模擬，不是真實玩家流程；真實流程在 tests/flow_teaching_buildings.py。
// 用法：node tests/campus_public_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
CLS.addDoors({E},'campus');
const stand=(x,zz)=>E.canStand(x,zz,0.32,0);
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.6],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const GATE=[-112,0], LINZE=[34,-98];
const near=(it)=>{ for(let rr=0;rr<=(it.radius||1.5)-0.05;rr+=0.1) for(let a=0;a<24;a++){ const x=it.x+Math.cos(a/24*Math.PI*2)*rr, zz=it.z+Math.sin(a/24*Math.PI*2)*rr; if(stand(x,zz)) return [x,zz]; } return null; };
const LM=PLACES.landmarks.campus, QL=PLACES.quickList();
for(const [label,lm,foots] of [['共同教學館','共同教學館',[[2,33,24,14]]],['普通教學館','普通教學館',[[-38,-58.5,34,16]]],['博雅教學館','博雅教學館',[[-38,-83,34,18]]],['大一女舍 A 棟（傳達室）','大一女舍',[[-108,68,24,12]]],['大一女舍 B 棟','大一女舍',[[-78,66,24,12]]]]){   /* 普通、博雅：方案 A（D55）*/
  const it=E.interactables.find(i=>i.label===label); check(label+'：有入口互動點、有名牌（mark）',!!it&&!!it.mark,it?`(${it.x},${it.z})`:'');
  if(!it) continue; const p=near(it); check(label+'：入口旁邊站得住',!!p,JSON.stringify(p)); if(!p) continue;
  let r=walk(GATE,p); check(label+'：從校門走得到（走路 30 fps、跑步＋低幀率）',r.ok,JSON.stringify(r).slice(0,180));
  r=walk(LINZE,p); check(label+'：從霖澤館前走得到',r.ok,JSON.stringify(r).slice(0,180));
  for(const [cx,cz,w,d] of foots){ const inside=[[cx,cz],[cx-w/2+1.5,cz],[cx+w/2-1.5,cz],[cx,cz-d/2+3.6],[cx,cz+d/2-1.2]].filter(q=>stand(q[0],q[1]));   /* 正面一樓的拱廊（套件 arcade，約 2.4–3 m 深）走得進去，是設計；量拱廊後面 */ check(label+'：建築本體走不進去（不會穿牆）',!inside.length,JSON.stringify(inside)); }
  check(label+'：大地圖有地名「'+lm+'」',LM.some(q=>q[0]===lm)); }
check('大一女舍：A、B 兩棟之間（2 樓天橋下）走得過去',stand(-93,67)&&walk([-93,57],[-93,78]).ok,JSON.stringify(walk([-93,57],[-93,78])).slice(0,160));
{ const s=(z.seats||E.seats||[]).find(q=>/大一女舍門口的長椅/.test(q.label||'')); check('大一女舍門口有等人用的長椅（坐得到：長椅前站得住、從校門走得到）',!!s&&stand(s.x,s.z+0.75)&&walk(GATE,[s.x,s.z+0.75]).ok,JSON.stringify(s)); }
{ const bad=QL.filter(q=>q[0]==='campus'&&/共同教學館|大一女舍/.test(q[1])).filter(q=>!stand(q[2].x,q[2].z)); check('快速前往的落點（共同教學館、大一女舍）在門口前、站得住',QL.some(q=>/大一女舍/.test(q[1]))&&!bad.length,JSON.stringify(bad)); }
{ const it=E.interactables.find(i=>i.door==='common'); check('課表的共同教學館上課點＝共同教學館的正門（不是另一棟無名系館）',!!it&&Math.abs(it.x-2)<1&&Math.abs(it.z-22.8)<1,it?`(${it.x},${it.z})`:''); }
// 方案 A：普通在文學院正後方、博雅在普通北邊、醉月湖在博雅北邊（D55，docs/campus/TEACHING_BUILDINGS_PLAN.md）
{ const P=E.interactables.find(i=>i.door==='putong'), B=E.interactables.find(i=>i.door==='boya');
  check('方案 A 的南北順序：文學院（z -34）→ 普通（門口 z≈-49）→ 博雅（門口 z≈-73）→ 醉月湖（湖心亭 z≈-111）',!!P&&!!B&&P.z<-43&&B.z<P.z-15&&stand(-39,-111.4)&&!stand(-25,-112),P&&B?`普通 ${P.z}、博雅 ${B.z}`:'');
  check('進館互動點通到室內（exit.to：目標導航找得到）',P&&P.exit&&P.exit.to==='putong'&&B&&B.exit&&B.exit.to==='boya');
  const r1=walk([P.x,P.z+1.2],[B.x,B.z+1.4]); check('普通門口 → 博雅門口（兩棟之間的路）走得到',r1.ok,JSON.stringify(r1).slice(0,160));
  const r2=walk([B.x,B.z+1.4],[-39,-111.4]); check('博雅門口 → 醉月湖湖心亭（新的湖南岸步道＋木棧道）走得到',r2.ok,JSON.stringify(r2).slice(0,160));
  const bad=QL.filter(q=>q[0]==='campus'&&/普通教學館|博雅教學館/.test(q[1])).filter(q=>!stand(q[2].x,q[2].z)); check('快速前往：普通、博雅的落點在門口前、站得住',QL.filter(q=>/普通教學館|博雅教學館/.test(q[1])).length===2&&!bad.length,JSON.stringify(bad));
  check('大地圖：醉月湖的地名跟著湖搬到北邊',LM.some(q=>q[0]==='醉月湖'&&q[2]<-100)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
