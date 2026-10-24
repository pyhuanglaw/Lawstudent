// 阿德影印的兩種外觀＋一盞的貓碗（ART-WZ6；AA_420 第 3 節、第 9 節、12-1；LAWWW2-B 2026-10-24）——不需要瀏覽器。
// WZ_COPY_SHOP（wz_events.js 1-5）：'moved'＝A1 鐵捲門拉下＋遷址告示、轉角（A2 東側一樓、朝北巷）的小店開著、店門換到北巷 (3.9, 6.5)、從店裡出來站在轉角；
// 'stay'＝A1 玻璃門上多一張「本店續約三年」；還沒決定＝轉角是拉下鐵捲門、貼招租的空店面。wenzhou_street.glb 的 COPY_* 節點，zones3d.js 照旗標每一幀開關。
// 一盞前院的貓碗（wz_teahouse_interior.glb 的 WZ_CATBOWL）：WZ_CAT_FOUND 以後、PARK.catGone 以前。
// 修改前：WZ_SHOPS_LAYOUT.print 沒有 moved（第 1 項就失敗）。用法：node tests/wz_copy_shop_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
check('1. 影印店有搬到轉角以後的店門與出來的位置（WZ_SHOPS_LAYOUT.print.moved）',!!(WZ_SHOPS_LAYOUT.print.moved&&WZ_SHOPS_LAYOUT.print.moved.enterAt&&WZ_SHOPS_LAYOUT.print.moved.exitSpawn));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
global.GAME={G:{flags:{},day:30,hour:12,stage:'law'}};
const P=WZ_SHOPS_LAYOUT.print, MV=P.moved;
const door=()=>E.interactables.find(i=>i.exit&&i.exit.to==='wz_print');
{ GAME.G.flags={}; loadZone('wenzhou'); const d=door();
  check('2. 還沒決定：影印店的門在 A1 ('+P.enterAt.x+','+P.enterAt.z+')',!!d&&d.x===P.enterAt.x&&d.z===P.enterAt.z);
  check('2. 轉角的凹口在建築的導航阻擋裡（A2 東側 (2.5, 7.5) 站不住），北巷照舊走得到',!E.canStand(2.5,7.5,0.05,0)&&walk([0,0],[5.5,12]).ok);
  /* 每一幀照旗標：換狀態以後節點、店門跟著換（假節點代替 GLB 的 COPY_*）*/
  const Z=E.zone, mk=n=>({name:n,visible:true}), N=['COPY_CORNER_SHUT','COPY_CORNER_OPEN','COPY_A1_SHUT','COPY_A1_RENEW'].map(mk); Z.copyNodes.push(...N);
  const vis=()=>N.filter(o=>o.visible).map(o=>o.name.slice(5)).join(',');
  GAME.G.flags={WZ_COPY_SHOP:'stay'}; Z.update(0.016,E); const v1=vis(), d1=[door().x,door().z]; GAME.G.flags={WZ_COPY_SHOP:'moved'}; Z.update(0.016,E); const v2=vis(), d2=[door().x,door().z]; GAME.G.flags={}; Z.update(0.016,E); const v0=vis(), d0=[door().x,door().z];   /* 模型載入時是先清掉狀態再套一次（copyKey=null）；這裡用換狀態代替 */
  check('3. 還沒決定（從 moved 換回來也一樣）：只有轉角的鐵捲門（空店面）、門回到 A1',v0==='CORNER_SHUT'&&d0[0]===P.enterAt.x,v0);
  check('3. 留下來（stay）：轉角照舊是空店面＋A1 的續約告示；門在 A1',v1==='CORNER_SHUT,A1_RENEW'&&d1[0]===P.enterAt.x,v1);
  check('3. 搬走（moved）：轉角的店開著＋A1 鐵捲門拉下；店門換到北巷 ('+MV.enterAt.x+','+MV.enterAt.z+')',v2==='CORNER_OPEN,A1_SHUT'&&d2[0]===MV.enterAt.x&&d2[1]===MV.enterAt.z,v2+' '+d2); }
{ GAME.G.flags={WZ_COPY_SHOP:'moved'}; loadZone('wenzhou'); const d=door(); const p=d&&nearStand(d.x,d.z,d.radius-0.05); const r=p&&walk([0,0],p);
  check('4. 搬走以後重新進溫州街：店門一開始就在轉角，從主巷走得到',!!d&&d.x===MV.enterAt.x&&!!r&&r.ok,r?r.reason||'':'');
  const near=E.interactables.filter(i=>i!==d&&Math.hypot(i.x-d.x,i.z-d.z)<1.4).map(i=>i.label);
  check('4. 轉角的店門旁邊沒有別的互動點搶按鈕',!near.length,near.join('、'));
  const sp=MV.exitSpawn; check('4. 從轉角出來的位置 ('+sp.x+','+sp.z+') 站得住、離店門 ≤ 0.5 m 也不會自動再進去（按了才進）',E.canStand(sp.x,sp.z,0.32,0)&&Math.hypot(sp.x-d.x,sp.z-d.z)<=0.5); }
{ for(const [st,want] of [[{},P.exit.spawn],[{WZ_COPY_SHOP:'stay'},P.exit.spawn],[{WZ_COPY_SHOP:'moved'},MV.exitSpawn]]){ GAME.G.flags=st; loadZone('wz_print'); const ex=E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou');
    check('5. 影印店（'+(st.WZ_COPY_SHOP||'還沒決定')+'）：「'+(ex&&ex.label)+'」回到 ('+want.x+','+want.z+')',!!ex&&ex.exit.spawn.x===want.x&&ex.exit.spawn.z===want.z); } }
/* 模型：四個開關的節點、轉角的招牌（和 A1 同一張設計稿）、開關的節點裡沒有光暈（光暈整條街合成一批，不能跟著開關）；一盞的貓碗在前院、沓脫石旁邊的地上 */
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)); const l=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+l).toString('utf8')); };
{ const J=glb('assets/models/env/second_ai/wenzhou_street.glb'), N=J.nodes, byName=n=>N.findIndex(o=>o.name===n);
  const kids=i=>{ const out=[]; const st=[...(N[i].children||[])]; while(st.length){ const k=st.pop(); out.push(N[k].name); st.push(...(N[k].children||[])); } return out; };
  const ids=['COPY_CORNER_SHUT','COPY_CORNER_OPEN','COPY_A1_SHUT','COPY_A1_RENEW'].map(byName);
  check('6. 街景模型有四個開關的節點（COPY_CORNER_SHUT／OPEN、COPY_A1_SHUT／RENEW）',ids.every(i=>i>=0));
  check('6. 轉角的店有招牌（sk_sign_A2C，阿德影印的設計稿）',ids[1]>=0&&kids(ids[1]).some(n=>/sign_A2C/.test(n)));
  check('6. 開關的節點裡沒有光暈（GLOW_）',ids.every(i=>i<0||!kids(i).some(n=>/^GLOW_/.test(n)))); }
{ const J=glb('assets/models/env/second_ai/wz_teahouse_interior.glb'), N=J.nodes, i=N.findIndex(o=>o.name==='WZ_CATBOWL');
  let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const k of (i>=0?N[i].children||[]:[])){ const m=J.meshes[N[k].mesh]; for(const p of m.primitives){ const a=J.accessors[p.attributes.POSITION]; for(let c=0;c<3;c++){ mn[c]=Math.min(mn[c],a.min[c]); mx[c]=Math.max(mx[c],a.max[c]); } } }
  /* glTF 是 y 往上：遊戲座標同 (x, y, z) */
  check('7. 一盞的貓碗（WZ_CATBOWL）在前院、沓脫石右邊的地上（x 2.2～2.5、z 6.25～6.55、底 −0.40）',i>=0&&mn[0]>2.2&&mx[0]<2.5&&mn[2]>6.25&&mx[2]<6.55&&Math.abs(mn[1]+0.40)<0.01,JSON.stringify([mn.map(v=>+v.toFixed(3)),mx.map(v=>+v.toFixed(3))])); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
