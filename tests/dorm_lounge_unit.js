// 男生宿舍交誼廳的家具（ART-DORM-LOUNGE-1021，LAWWW2 2026-10-22）：不需要瀏覽器，在 Node 裡建出遊戲真正的 dorm_hall 區域。
//   1. 新加的資源回收桶（src/data/dorm_layout.js 的 type 'bins'，正式模型 tools/blender/dorm_hall.py）在導航格上擋住：
//      原本 dorm3d.js 沒有這一種家具，配置寫了、模型畫了，遊戲卻照樣走得穿過去（看得到的東西人會穿過去）
//   2. 新加的盆栽（東南角，type 'planter'，dorm3d.js 原本就會擋）擋住
//   3. 原本的家具（沙發、矮桌、電視櫃、販賣機、飲水機、長桌、門廳的東西）導航阻擋不變：和拿掉新家具的配置一格一格比，新家具的格子以外完全相同
//   4. 交誼廳的互動點（坐沙發、看電視、看販賣機、看飲水機、長桌的座位）從大門都走得到（引擎的找路＋移動碰撞 E.simWalk，dt 1/30 與 0.1）
//   5. 備用模型（正式模型載入失敗時）也有回收桶：不會變成看不見的牆
// 這是模擬，不是真實玩家流程；真實流程在 tests/flow_dorm_hall.py。
// 用法：node tests/dorm_lounge_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
const fmt=(r)=>JSON.stringify(r).slice(0,200);

const L=DORM_LAYOUT, FULL=L.furniture.slice();
const bins=FULL.find(f=>f.type==='bins'), plant=FULL.find(f=>f.type==='planter'&&f.lv===0&&f.x>10);
check('配置：交誼廳有資源回收桶（type bins）和東南角的盆栽',!!bins&&!!plant,bins&&plant?`回收桶 (${bins.x},${bins.z}) 寬 ${bins.w}；盆栽 (${plant.x},${plant.z})`:'');
const NEW=new Set([bins,plant].filter(Boolean));
// 拿掉新家具建一次（原本的阻擋）、全部建一次（現在的阻擋）
L.furniture=FULL.filter(f=>!NEW.has(f)); const zOld=loadZone('dorm_hall'); const bOld=zOld.levels[0].b.slice(), nav=zOld.levels[0];
L.furniture=FULL; const z=loadZone('dorm_hall'); const bNew=z.levels[0].b, IT=E.interactables, EN=L.entrance.spawn;
const inFoot=(cx,cz)=>{ const [x,zz]=nav.toWorld(cx,cz); for(const f of NEW){ if(f.type==='bins'){ if(Math.abs(x-f.x)<=f.w/2+0.3&&Math.abs(zz-f.z)<=0.25+0.3) return true; } else if(Math.hypot(x-f.x,zz-f.z)<=f.r+0.4) return true; } return false; };
let changedOut=[], addedIn=0, freedIn=0;
for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const i=cz*nav.cols+cx; if(bOld[i]===bNew[i]) continue; if(!inFoot(cx,cz)) changedOut.push(nav.toWorld(cx,cz).map(v=>+v.toFixed(2)).join(',')); else if(bNew[i]) addedIn++; else freedIn++; }
check('原本的家具導航阻擋不變：新家具的格子以外，一格都沒變（沙發、矮桌、電視櫃、販賣機、飲水機、長桌、門廳）',!changedOut.length&&!freedIn,changedOut.length?changedOut.slice(0,6).join(' | '):`新家具多擋 ${addedIn} 格`);
if(bins){ const pts=[]; for(const dx of [-0.4,0,0.4]) for(const dz of [-0.1,0.1]) pts.push([bins.x+dx,bins.z+dz]);
  check('回收桶在導航格上擋住（桶身的位置站不住）',pts.every(p=>!E.canStand(p[0],p[1],0.32,0)),pts.filter(p=>E.canStand(p[0],p[1],0.32,0)).map(p=>p.join(',')).join(' | '));
  let fbGroups=0; z.group.traverse(o=>{ if(o.isGroup&&Math.abs(o.position.x-bins.x)<1e-6&&Math.abs(o.position.z-bins.z)<1e-6) fbGroups++; });
  check('回收桶有備用模型（正式模型載入失敗時看得到，不會變成看不見的牆）',fbGroups>0,`群組 ${fbGroups}`); }
if(plant) check('東南角的盆栽擋住',!E.canStand(plant.x,plant.z,0.32,0));
// 交誼廳的互動點：從大門走得到（坐沙發、看電視、看販賣機、看飲水機、長桌的座位）
const LG=L.lounge, lounge=IT.filter(i=>(i.lv|0)===0&&i.x>=LG.x0-0.5&&i.x<=LG.x1+0.5&&i.z>=LG.z0-0.5&&i.z<=LG.z1+0.5);
let bad=[]; for(const it of lounge){ const r=both([EN.x,EN.z,0],[it.x,it.z,0]); if(!r.ok) bad.push((it.label||'?')+' '+fmt(r)); }
check(`交誼廳的 ${lounge.length} 個互動點從大門都走得到（模擬走路，dt 1/30 與 0.1）`,lounge.length>=8&&!bad.length,bad.slice(0,3).join(' | '));
const lab=new Set(lounge.map(i=>i.label)); check('交誼廳的互動點都還在：坐在沙發上、看電視、看自動販賣機、看飲水機、坐下（長桌）',['坐在沙發上','看電視','看自動販賣機','看飲水機','坐下'].every(s=>lab.has(s)),[...lab].join('、'));
// 飲水機和回收桶中間不留比人窄的縫（滑進去出不來的小孤島）
if(bins){ const W=FULL.find(f=>f.type==='water'&&f.lv===0); let island=[]; for(let x=W.x;x<=bins.x-bins.w/2;x+=0.1) for(let zz=W.z-0.3;zz<=L.lounge.z1-0.1;zz+=0.1){ if(!E.canStand(x,zz,0.32,0)) continue; const r=sim([x,zz,0],[EN.x,EN.z,0],1/30); if(!r.ok) island.push(x.toFixed(1)+','+zz.toFixed(1)); }
  check('飲水機和回收桶中間沒有走得進去、走不出來的小縫',!island.length,island.slice(0,4).join(' | ')); }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
