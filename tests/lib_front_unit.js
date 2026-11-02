// 總圖前（LIB-FRONT-1102，LAWWW2 帳號 A 2026-11-02；使用者 11-02 08:45 五張照片、08:55「總圖前的台階要做出來」、09:4x「台階下方還有磁磚 蠻寬的 之後才是草坪」、
//   10:4x「仔細看我給你的圖 總圖出來還有個平台 之後才是階梯往下」→ 拱廊前面 6 m 深的平台，台階在平台前面）
// ——不需要瀏覽器：在 Node 裡建出遊戲真正的校園（兩個正式模型都在 manifest：LIBF），用引擎真正的找路＋移動碰撞（E.simWalk）走：
//   ①高度：廣場 0、台階一階 0.18 m 連續往上、平台 0.9；畫面上一階一階（visualHeightAt）；拱廊正面前面整片 6 m 都是平台
//   ②從大道（小椰林道路口）→ 草坪西端 → 草坪 → 廣場 → 走上台階 → 平台 → 中間的拱 → 大門口（門口互動點 (86.4,0) 的範圍裡），走路、跑步＋低幀率都要到
//   ③LAWWW 11-02 09:11 指定要走得到、站得住的點：(80,0)＝從總圖出來的位置（library3d.js CAMPUS、sis_b11_3d.js STOP_OUT、zrzq3d.js）、(82,0)＝門廊前（flow_library_floors、guide_flow）
//   ④龍柏籬、花台、拱和拱之間的牆、方塔、平台兩端的矮牆站不住；兩側步道、花台後面的平台、白石翼的拱走得到
//   ⑤下台階回到大道、從北側步道走到廣場；「進入總圖書館」照舊在 (86.4,0)
// 這是模擬（證明路走得通、高度對），不是真實玩家流程（瀏覽器的 flow_library_floors、guide_flow、reachability_all 另外跑）。
// 用法：node tests/lib_front_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const LAY=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_library.layout.json'),'utf8'));
const LAWN=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lib_lawn.json'),'utf8')).layout;
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const H=(x,zz)=>E.nav.heightAt(x,zz), V=(x,zz)=>E.nav.visualHeightAt(x,zz), stand=(x,zz)=>E.canStand(x,zz,0.32,0);
const fmt=r=>JSON.stringify(r).slice(0,200);
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:1/30}); };
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:4.1}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const ST=LAY.steps, P=LAY.podium;
// ① 高度
check('① 廣場 0、台階最下面一階的前緣 0、台階中間連續、最上面一階＝平台 0.9、平台和拱廊走道 0.9',
  H(72,0)===0&&Math.abs(H(ST.x0+0.01,0))<0.01&&Math.abs(H((ST.x0+ST.x1)/2,0)-P/2)<0.02&&Math.abs(H(ST.x1-0.01,0)-P)<0.01&&H(84,0)===P&&H(84,20)===P,
  `廣場 ${H(72,0)}、台階底 ${H(ST.x0+0.01,0).toFixed(3)}、中 ${H((ST.x0+ST.x1)/2,0).toFixed(3)}、頂 ${H(ST.x1-0.01,0).toFixed(3)}、平台 ${H(84,0)}`);
const vis=[0,1,2,3,4].map(k=>V(ST.x0+ST.tread*(k+0.5),0));
check('① 畫面上一階一階（每一階 0.18 m，五階）',vis.every((y,k)=>Math.abs(y-(k+1)*ST.rise)<1e-6),vis.map(y=>y.toFixed(2)).join('、'));
const AF=81.6, terr=[ST.x1+0.4,(ST.x1+AF)/2,AF-0.6].flatMap(x=>[0,-12,12,-25,25].map(zz=>[x,zz]));
check('① 走出總圖先是平台（使用者 11-02 10:4x）：拱廊正面前面 x '+ST.x1+'～'+AF+'（'+(AF-ST.x1).toFixed(2)+' m）整片都是平台高度 0.9，之後才是台階往下',
  AF-ST.x1>=5.5&&terr.every(([x,zz])=>H(x,zz)===P&&Math.abs(V(x,zz)-P)<1e-6&&stand(x,zz)),`平台深 ${(AF-ST.x1).toFixed(2)} m、${terr.length} 點`);
// ② 從大道走到大門
const door=E.interactables.find(i=>i.label==='進入總圖書館');
check('⑤「進入總圖書館」照舊在 (86.4,0)',!!door&&Math.abs(door.x-86.4)<1e-6&&Math.abs(door.z)<1e-6,door?`(${door.x},${door.z}) r ${door.radius}`:'');
let r=both([30,0],[86.0,0]); check('② 大道（小椰林道路口）→ 草坪 → 廣場 → 台階 → 平台 → 中間的拱 → 大門口（模擬走路，dt 1/30 和 0.1）',r.ok&&Math.abs(r.y-P)<0.05&&Math.hypot(r.x-86.4,r.z)<door.radius,fmt(r));
r=run([30,0],[86.0,0]); check('② 同一段用跑的（4.1 m/s）＋低幀率（dt 0.1：一步 0.41 m）',r.ok,fmt(r));
// ③ LAWWW 指定的點
check('③ (80,0)（從總圖出來的位置）在平台上：站得住、高度＝平台 0.9（離台階頂 '+(80-ST.x1).toFixed(2)+' m）',stand(80,0)&&H(80,0)===P&&Math.abs(V(80,0)-P)<1e-6,`畫面 ${V(80,0).toFixed(3)}、找路 ${H(80,0).toFixed(3)}`);
check('③ (82,0)（門廊前：中間拱的開口裡）站得住',stand(82,0),`高度 ${H(82,0)}`);
r=both([80,0],[60,0]); check('③ (80,0) → 走下台階 → 草坪',r.ok&&Math.abs(r.y)<0.06,fmt(r));
r=both([60,0],[82,0]); check('③ 草坪 → 走上台階 → (82,0)',r.ok&&Math.abs(r.y-P)<0.05,fmt(r));
// ④ 擋住的、走得到的
const [h0,h1,ha,hb]=LAWN.hedges;
check('④ 龍柏籬站不住（南北兩邊、頭尾）',[(h0+h1)/2,h0+0.6,h1-0.6].every(x=>!stand(x,(ha+hb)/2)&&!stand(x,-(ha+hb)/2)));
check('④ 草坪、兩側紅磚步道、廣場站得住',stand(52,0)&&stand(52,-17)&&stand(52,17)&&stand(72,-15)&&stand(72,15));
r=both([36,-17],[70,-17]); check('④ 北側步道從頭走到廣場',r.ok,fmt(r));
r=both([36,17],[70,17]); check('④ 南側步道從頭走到廣場（腳踏車、路人走這裡）',r.ok,fmt(r));
const PL=(ST.x0+ST.x1)/2; check('④ 花台站不住（台階兩旁）',!stand(PL,24)&&!stand(PL,-24)&&!stand(ST.x1-0.4,19));
r=both([ST.x1+0.3,0],[81.1,24]); check('④ 台階頂 → 平台 → 花台後面（白石翼最外面那個拱前面）',r.ok&&Math.abs(r.y-P)<0.05,fmt(r));
check('④ 拱和拱之間的牆（紅磚段、白石翼）站不住',!stand(82.1,3.1)&&!stand(82.3,-9.5)&&!stand(82.3,17));
r=both([81,12.2],[85,12.2]); check('④ 白石翼的拱（z 12.2）走得進拱廊',r.ok,fmt(r));
r=both([85,-20],[85,20]); check('④ 拱廊走道從北走到南',r.ok,fmt(r));
check('④ 拱廊後牆（大門兩旁）、總圖裡面站不住',!stand(86.7,5)&&!stand(90,0)&&!stand(100,0));
const T=LAY.tower; check('④ 北邊的方塔站不住',!stand(T.x,T.z)&&!stand(T.x-T.s/2+0.4,T.z));
check('④ 平台兩端（落差 0.9）：平台邊外面是地面、邊上有白石矮牆擋住（走不出平台邊）',H(81,31)===0&&H(81,29.5)===P&&[ST.x1+0.3,78,80.5].every(x=>!stand(x,29.8)&&!stand(x,-29.8)));
// ⑤ 回到大道
r=both([84,0],[0,0]); check('⑤ 拱廊 → 台階 → 草坪 → 回到大道（往校門）',r.ok&&Math.abs(r.y)<0.05,fmt(r));
check('⑤ 平台、台階點得到（點地面移動的透明地面 2 片）',(z.walkMeshes||[]).filter(m=>m.position.x>ST.x0-1&&m.position.x<90&&Math.abs(m.position.z)<1).length>=2);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
