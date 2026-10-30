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
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const TREES=[]; { const orig=TK.tree; TK.tree=(...a)=>{ const t=orig(...a); TREES.push(t); return t; }; }   /* 記下校園上每一棵闊葉樹（檢查方案 A 留下的樹）*/
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
CLS.addDoors({E},'campus');
const stand=(x,zz)=>E.canStand(x,zz,0.32,0);
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.6],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const GATE=[-112,0], LINZE=[34,-98];
const near=(it)=>{ for(let rr=0;rr<=(it.radius||1.5)-0.05;rr+=0.1) for(let a=0;a<24;a++){ const x=it.x+Math.cos(a/24*Math.PI*2)*rr, zz=it.z+Math.sin(a/24*Math.PI*2)*rr; if(stand(x,zz)) return [x,zz]; } return null; };
const LM=PLACES.landmarks.campus, QL=PLACES.quickList();
for(const [label,lm,foots] of [['共同教學館','共同教學館',[[2,33,24,14]]],['普通教學館','普通教學館',[[-38,-58.5,34,16]]],['博思教學館','博思教學館',[[-38,-83,34,18]]],['大一女舍 A 棟（傳達室）','大一女舍',[[-108,68,24,12]]],['大一女舍 B 棟','大一女舍',[[-78,66,24,12]]]]){   /* 普通、博雅：方案 A（D55）*/
  const it=E.interactables.find(i=>i.label===label); check(label+'：有入口互動點、有名牌（mark）',!!it&&!!it.mark,it?`(${it.x},${it.z})`:'');
  if(!it) continue; const p=near(it); check(label+'：入口旁邊站得住',!!p,JSON.stringify(p)); if(!p) continue;
  let r=walk(GATE,p); check(label+'：從校門走得到（走路 30 fps、跑步＋低幀率）',r.ok,JSON.stringify(r).slice(0,180));
  r=walk(LINZE,p); check(label+'：從霖澤館前走得到',r.ok,JSON.stringify(r).slice(0,180));
  for(const [cx,cz,w,d] of foots){ const inside=[[cx,cz],[cx-w/2+1.5,cz],[cx+w/2-1.5,cz],[cx,cz-d/2+3.6],[cx,cz+d/2-1.2]].filter(q=>stand(q[0],q[1]));   /* 正面一樓的拱廊（套件 arcade，約 2.4–3 m 深）走得進去，是設計；量拱廊後面 */ check(label+'：建築本體走不進去（不會穿牆）',!inside.length,JSON.stringify(inside)); }
  check(label+'：大地圖有地名「'+lm+'」',LM.some(q=>q[0]===lm)); }
{ /* 走出教學館的落點離門口的互動點 ≥ 半徑＋0.2 m：一出來不會又跳出「共同教學館」「博雅教學館」（2026-10-13 審查：博雅原本 1.4 m）*/
  const bad=[]; for(const [k,LAY] of [['common',GONGTONG_LAYOUT],['putong',PUTONG_LAYOUT],['boya',BOYA_LAYOUT]]){ const d=CLS.DOORS[k], c=LAY.entrance.campus; const dist=Math.hypot(c.x-d.x,c.z-d.z); if(dist<d.radius+0.2||!stand(c.x,c.z)) bad.push(k+' '+dist.toFixed(2)+' m'); }
  check('走出共同、普通、博思：落點站得住、離門口的互動點 ≥ 半徑＋0.2 m',!bad.length,bad.join(' | ')); }
check('大一女舍：A、B 兩棟之間（2 樓天橋下）走得過去',stand(-93,67)&&walk([-93,57],[-93,78]).ok,JSON.stringify(walk([-93,57],[-93,78])).slice(0,160));
{ const s=(z.seats||E.seats||[]).find(q=>/大一女舍門口的長椅/.test(q.label||'')); check('大一女舍門口有等人用的長椅（坐得到：長椅前站得住、從校門走得到）',!!s&&stand(s.x,s.z+0.75)&&walk(GATE,[s.x,s.z+0.75]).ok,JSON.stringify(s)); }
{ const bad=QL.filter(q=>q[0]==='campus'&&/共同教學館|大一女舍/.test(q[1])).filter(q=>!stand(q[2].x,q[2].z)); check('快速前往的落點（共同教學館、大一女舍）在門口前、站得住',QL.some(q=>/大一女舍/.test(q[1]))&&!bad.length,JSON.stringify(bad)); }
{ const it=E.interactables.find(i=>i.door==='common'); check('課表的共同教學館上課點＝共同教學館的正門（不是另一棟無名系館）',!!it&&Math.abs(it.x-2)<1&&Math.abs(it.z-22.8)<1,it?`(${it.x},${it.z})`:''); }
// 方案 A：普通在文學院正後方、博雅在普通北邊、醉月湖在博雅北邊（D55，docs/campus/TEACHING_BUILDINGS_PLAN.md）
{ const P=E.interactables.find(i=>i.door==='putong'), B=E.interactables.find(i=>i.door==='boya');
  check('方案 A 的南北順序：文學院（z -34）→ 普通（門口 z≈-49）→ 博思（門口 z≈-73）→ 映月湖（湖心亭 z≈-111）',!!P&&!!B&&P.z<-43&&B.z<P.z-15&&stand(-39,-111.4)&&!stand(-25,-112),P&&B?`普通 ${P.z}、博雅 ${B.z}`:'');
  check('進館互動點通到室內（exit.to：目標導航找得到）',P&&P.exit&&P.exit.to==='putong'&&B&&B.exit&&B.exit.to==='boya');
  const r1=walk([P.x,P.z+1.2],[B.x,B.z+1.4]); check('普通門口 → 博思門口（兩棟之間的路）走得到',r1.ok,JSON.stringify(r1).slice(0,160));
  const r2=walk([B.x,B.z+1.4],[-39,-111.4]); check('博思門口 → 映月湖湖心亭（新的湖南岸步道＋木棧道）走得到',r2.ok,JSON.stringify(r2).slice(0,160));
  const bad=QL.filter(q=>q[0]==='campus'&&/普通教學館|博思教學館/.test(q[1])).filter(q=>!stand(q[2].x,q[2].z)); check('快速前往：普通、博思的落點在門口前、站得住',QL.filter(q=>/普通教學館|博思教學館/.test(q[1])).length===2&&!bad.length,JSON.stringify(bad));
  check('大地圖：映月湖的地名跟著湖搬到北邊',LM.some(q=>q[0]==='映月湖'&&q[2]<-100)); }
// 方案 A 留下的樹（2026-10-13 審查第 5 項）：原本「湖北邊」那一排樹在博雅建築裡、往湖的小路上（沒有導航阻擋，人會穿過樹幹）
{ const ps=TREES.map(t=>{ const v=new THREE.Vector3(); t.getWorldPosition(v); return [+v.x.toFixed(1),+v.z.toFixed(1)]; });
  const inBoya=ps.filter(([x,zz])=>x>-55.5&&x<-20.5&&zz>-92.5&&zz<-73.5), onPath=ps.filter(([x,zz])=>x>-15&&x<-9&&zz>-97&&zz<-46), loose=ps.filter(([x,zz])=>x>-62&&x<-5&&zz>-92&&zz<-80&&stand(x,zz));
  check('湖北邊那排樹拿掉了：博思裡面、x=-12 往湖的小路上沒有樹，博思附近站得住的地方沒有穿得過去的樹幹',TREES.length>20&&!inBoya.length&&!onPath.length&&!loose.length,JSON.stringify({inBoya,onPath,loose})); }
// 系籃球場（LAWWW2 9428f9f，位置 A 醉月湖東側 (-4,-113)，2026-10-14；zones3d.js 的 bballCourt）：場地可以走，只擋籃架柱子和兩張長椅；活動點從校門、霖澤館前走得到
{ const S=[3.3,-112.7]; const inC=[[-4,-113],[-10,-118],[2,-108],[-4,-106.5],[-11.5,-110]].filter(q=>stand(q[0],q[1]));
  check('系籃球場：場地中間和四周都站得住（鋪面可以走）',inC.length===5,JSON.stringify(inC));
  check('系籃球場：籃架柱子、兩張長椅擋住（站不上去）',!stand(-4,-120.85)&&!stand(4.05,-115.2)&&!stand(4.05,-110.2));
  let r=walk(GATE,S); check('系籃球場：活動點（兩張長椅中間）站得住、從校門走得到（走路、跑步＋低幀率）',stand(S[0],S[1])&&r.ok,JSON.stringify(r).slice(0,180));
  r=walk(LINZE,S); check('系籃球場：活動點從霖澤館前走得到',r.ok,JSON.stringify(r).slice(0,180));
  r=walk(S,[-4,-117]); check('系籃球場：從活動點走到籃框前（場內走得通）',r.ok,JSON.stringify(r).slice(0,180));
  const lamps=(z.lamps||[]).filter(l=>Math.abs(l.position.x+4)<9.5&&Math.abs(l.position.z+113)<9.5); check('系籃球場：四個角各一盞路燈（晚上練球）',lamps.length===4,String(lamps.length)); }
// 社團博覽會（LAWWW2 479b7fc，九頂帳篷；2026-10-14）：只有社博那天擺（CLUBFAIR-REAL-1027：新局 9/6；這裡沒有載入 STORY＝照 activities 的 dates）；那天公告欄、招生攤位收起來；帳篷擋住、前面站得住、博覽會的互動點走得到
{ const DAY=(k)=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
  const build=day=>{ global.GAME={G:{day}}; E.interactables=[]; const zz=Z3.ZONES.campus.build(E); E.zone=zz; E.levels=zz.levels||null; E.nav=zz.nav; if(E.levels) for(const n of E.levels) n._cm=null; delete global.GAME; return zz; };
  const fz=build(DAY('2025-09-06')); const tentsF=fz.group.children.find(o=>o.name==='fair_fallback');
  const booth=E.interactables.find(i=>/招生攤位/.test(i.label||''));
  check('博覽會那天（9/6）：九頂帳篷擺出來、招生攤位收起來',!!tentsF&&tentsF.children.length===9&&!booth,JSON.stringify({tents:tentsF&&tentsF.children.length,booth:!!booth}));
  check('博覽會那天：帳篷擋住（站不進帳篷裡）、帳篷前面 z 13 站得住',![-21.3,-13.5,3.4,14.8].some(x=>stand(x,15.1))&&[-21.3,-13.5,-9.7,3.4].every(x=>stand(x,13.0)));
  const r=walk(GATE,[-13.5,13.0]); check('博覽會那天：服務台前（博覽會的互動點 (-13.5,13.6) 旁邊）從校門走得到',r.ok,JSON.stringify(r).slice(0,160));
  check('博覽會那天：晨思鐘廣場、長椅前留空（(-25,12)、(0,12) 站得住）',stand(-25,12)&&stand(0,12));
  const nz=build(DAY('2025-10-07')); const tentsN=nz.group.children.find(o=>o.name==='fair_fallback'); const booth2=E.interactables.find(i=>/招生攤位/.test(i.label||''));
  check('平常（10/7）：沒有帳篷，招生攤位、公告欄照舊',!tentsN&&!!booth2&&!stand(-13.5,14.6),JSON.stringify({tents:!!tentsN,booth:!!booth2}));
  { const zz=Z3.ZONES.campus.build(E); E.zone=zz; E.nav=zz.nav; E.levels=zz.levels||null; if(E.levels) for(const n of E.levels) n._cm=null; } }
// 萬才館研討室 A：大四研討課的門（2026-10-13 審查第 9 項）
{ E.interactables=[]; const wz=Z3.ZONES.wancai.build(E); const sem=E.interactables.find(i=>i.door==='wancai_seminar'); check('法律系館B二樓的研討室 A 是上課的門（門口上課：大四的法律倫理、判決研討）',!!sem&&sem.lv===1&&sem.label==='研討室 A'&&typeof sem.onInteract==='function',sem?`${sem.label} lv${sem.lv}`:'沒有'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
