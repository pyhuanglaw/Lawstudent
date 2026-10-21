// 美國超市街 us_market_street（US-MARKET-STREET，LAWWW2 2026-10-21）——不需要瀏覽器。
// 使用者 2026-10-17：「超市一個大的超市對面有一個小的亞洲超市」，選「做停車場和馬路」（原本：超市「過馬路」直接跳到亞洲超市門口）。
// 在 Node 建出遊戲真正的區域（src/us3d.js），用引擎的找路＋移動碰撞（E.simWalk，dt 1/30 與 0.1，人物半徑 0.32 m；跑步 4.1 m/s）走：
//   1. 區域登錄；出生點（公車站、草原超市 OUT 門外、亞洲超市門外）站得住；US3.SPAWN 有
//   2. 三個出入口：進草原超市（→ us_market）、進竹葉亞洲超市（→ us_asian_market）、搭公車回社區（→ us_outside、usBus）
//   3. 走得到：公車站 → IN 門；OUT 門 → 亞洲超市的門；亞洲超市 → 公車站；每個互動點從出生點走得到
//   4. 過馬路只能在路口（斑馬線）：中央分隔島（路口以外）站不住；從北側人行道到南側人行道，找到的路線跨過分隔島那一段在路口裡
//   5. 停著的車、等紅燈的車擋住（車身中心站不住）
//   6. 燈桿、路燈、號誌桿、行人燈、消防栓、車阻：人物中心在桿子 0.4 m 內站不住（BUG-NAV-LAMPPOST-1021 那種一格都沒擋到的不能再發生）
//   7. 接線：社區「出門（去超市）」→ 超市街的公車站；草原超市「離開超市」→ OUT 門外，不再有「過馬路」；亞洲超市只有一個「出門」→ 門外
//   8. 交換系統把超市街算在美國（exchange3d.js 的 US_ZONES）；手機「現在大概在」有名字（us_life3d.js）
//   9. 正式模型（有 assets/models/env/second_ai/us_market_street.glb 時）：晚上亮的燈（GLOW_*lamp）、店內景（GLOW_*interior）、四季（SEASON_MATS、四季的陳列、雪堆）
// 修改前（沒有 us_market_street）1、2、3、7、8 FAIL。這是模擬（證明路走得通），不是真實玩家流程。
// 用法：node tests/us_market_street_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|US3|US_[A-Z0-9_]+|AIRPORT_T2_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const R=0.32, stand=(x,z)=>E.canStand(x,z,R,0);
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r.ok?{ok:true}:Object.assign({run:true},r); };
const fmt=(r)=>JSON.stringify(r).slice(0,200);
function spotsOf(it){ const r=(it.radius||1.2)-0.05, out=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; if(stand(it.x+dx,it.z+dz)) out.push([d,it.x+dx,it.z+dz]); } return out.sort((a,b)=>a[0]-b[0]).map(q=>[q[1],q[2]]); }
function firstReach(from,pts){ let last=null; for(const p of pts.slice(0,12)){ const r=both(from,p); if(r.ok) return {ok:true,at:p}; last=r; } return last||{ok:false,reason:'沒有站得住的位置'}; }

const has=!!(Z3.ZONES.us_market_street&&typeof US_MARKET_STREET_LAYOUT!=='undefined');
check('1. 區域 us_market_street 已登錄、有配置 US_MARKET_STREET_LAYOUT',has);
if(has){
  const L=US_MARKET_STREET_LAYOUT, z=loadZone('us_market_street'), S=z.spawn;
  const sp=[['公車站（出生點）',L.spawn_bus],['草原超市 OUT 門外',L.spawn_pb_out],['亞洲超市門外',L.spawn_am_out]];
  check('1. 三個出生點都站得住；US3.SPAWN 有超市街（公車站、OUT 門外、亞洲超市門外）',sp.every(([n,p])=>stand(p.x,p.z))&&!!US3.SPAWN.us_market_street&&!!US3.SPAWN.us_market_street_pb_out&&!!US3.SPAWN.us_market_street_am_out,
    sp.filter(([n,p])=>!stand(p.x,p.z)).map(([n,p])=>n+'('+p.x+','+p.z+')').join('；'));
  const IT=E.interactables, pbIn=IT.find(i=>i.exit&&i.exit.to==='us_market'), amIn=IT.find(i=>i.exit&&i.exit.to==='us_asian_market'), bus=IT.find(i=>i.exit&&i.exit.to==='us_outside');
  check('2. 出入口：進草原超市 → us_market、進竹葉亞洲超市 → us_asian_market、搭公車 → us_outside（usBus）',!!pbIn&&!!amIn&&!!bus&&bus.usBus==='community',[pbIn,amIn,bus].map(i=>i?i.label:'沒有').join('／'));
  if(pbIn&&amIn&&bus){
    const B=[L.spawn_bus.x,L.spawn_bus.z], O=[L.spawn_pb_out.x,L.spawn_pb_out.z], A=[L.spawn_am_out.x,L.spawn_am_out.z];
    let r=firstReach(B,spotsOf(pbIn)); check('3. 公車站 → 停車場 → 草原超市的 IN 門',r.ok,fmt(r));
    r=firstReach(O,spotsOf(amIn)); check('3. 草原超市 OUT 門 → 停車場 → 斑馬線 → 竹葉亞洲超市的門',r.ok,fmt(r));
    r=firstReach(A,spotsOf(bus)); check('3. 竹葉亞洲超市 → 斑馬線 → 公車站',r.ok,fmt(r));
    const bad=[]; for(const it of IT){ const s=spotsOf(it); if(!s.length){ bad.push(it.label+'：範圍內站不住'); continue; } const q=firstReach(B,s); if(!q.ok) bad.push(it.label+' '+fmt(q)); }
    check(`3. ${IT.length} 個互動點都站得到、從公車站走得到`,!bad.length,bad.join('；'));
  }
  // 4. 過馬路：分隔島
  const med=L.road.median, cx0=L.cross[0].x0, cx1=L.cross[1].x1, mz=(med[0]+med[1])/2;
  const medOn=[]; for(let x=L.bounds.x0+1;x<=L.bounds.x1-1;x+=0.5) if(stand(x,mz)&&!(x>cx0-0.3&&x<cx1+0.3)) medOn.push(+x.toFixed(1));
  check('4. 中央分隔島（路口以外）站不住',!medOn.length,JSON.stringify(medOn.slice(0,8)));
  const crossBad=[]; for(const [a,b] of [[[-30,12.6],[-30,33.0]],[[30,12.6],[30,33.0]],[[-4.5,12.6],[-4.5,33.0]]]){ const p=E.pathTo(a[0],a[1],0,b[0],b[1],0); if(!p){ crossBad.push('找不到路 '+a); continue; } let px=a[0], pz=a[1];
    for(const q of p){ if((pz-mz)*(q[1]-mz)<=0&&pz!==q[1]){ const t=(mz-pz)/(q[1]-pz), x=px+(q[0]-px)*t; if(x<cx0-0.5||x>cx1+0.5) crossBad.push(`從 (${a}) 走：在 x ${x.toFixed(1)} 跨過分隔島`); } px=q[0]; pz=q[1]; } }
  check('4. 從北側人行道走到南側人行道（西段、東段、正中間）：路線都在路口過馬路',!crossBad.length,crossBad.join('；'));
  // 5. 車
  const carIn=L.cars.filter(c=>stand(c.x,c.z)).map(c=>[c.x,c.z]);
  check(`5. ${L.cars.length} 台車（停著的、等紅燈的 ${L.cars.filter(c=>c.waiting).length} 台）的車身中心都站不住`,!carIn.length,JSON.stringify(carIn.slice(0,5)));
  // 6. 桿子
  const POLE=['street_lamp','signal_mast','ped_signal','bus_sign','hydrant','bollard'], poles=L.props.filter(p=>POLE.includes(p.type)).map(p=>[p.type,p.x,p.z]).concat(L.poles.map(p=>['lot_pole',p.x,p.z]));
  const thru=[]; for(const [t,x,zz] of poles){ let worst=null; for(let k=0;k<32;k++){ const a=k/32*Math.PI*2; for(const d of [0,0.1,0.2,0.3,0.4]) if(stand(x+Math.cos(a)*d,zz+Math.sin(a)*d)&&(worst==null||d<worst)) worst=d; } if(worst!=null) thru.push(`${t}(${x},${zz}) ${worst}`); }
  check(`6. ${poles.length} 支桿子（燈桿、路燈、號誌、行人燈、站牌、消防栓、車阻）：人物中心在 0.4 m 內站不住`,!thru.length,thru.slice(0,5).join('；'));
}
// 7. 接線
{ const zo=loadZone('us_outside'), go=E.interactables.find(i=>i.usGoOut);
  check('7. 社區「出門（去超市）」→ 超市街的公車站',!!go&&!!go.exit&&go.exit.to==='us_market_street'&&has&&go.exit.spawn.x===US_MARKET_STREET_LAYOUT.spawn_bus.x,go?JSON.stringify(go.exit):'沒有'); }
{ const zm=loadZone('us_market'), out=E.interactables.find(i=>i.label==='離開超市'), cross=E.interactables.find(i=>/過馬路/.test(i.label||''));
  check('7. 草原超市「離開超市」→ 超市街 OUT 門外；沒有「過馬路」直接跳',!!out&&!!out.exit&&out.exit.to==='us_market_street'&&has&&out.exit.spawn.x===US_MARKET_STREET_LAYOUT.spawn_pb_out.x&&!cross,out?JSON.stringify(out.exit):'沒有'); }
{ const za=loadZone('us_asian_market'), ex=E.interactables.filter(i=>i.exit);
  check('7. 竹葉亞洲超市只有一個「出門」→ 超市街的亞洲超市門外',ex.length===1&&ex[0].exit.to==='us_market_street'&&has&&ex[0].exit.spawn.x===US_MARKET_STREET_LAYOUT.spawn_am_out.x,JSON.stringify(ex.map(i=>[i.label,i.exit.to]))); }
// 8. 交換系統、手機
{ const ex=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8'), ul=fs.readFileSync(path.join(ROOT,'src/us_life3d.js'),'utf8');
  const m=/const US_ZONES=\[([^\]]*)\]/.exec(ex), m2=/for\(const k of \[([^\]]*)\]\) if\(!PLACES\.names\[k\]/.exec(ul);
  check('8. exchange3d.js 的 US_ZONES 有 us_market_street（人在超市街＝在美國）',!!m&&/'us_market_street'/.test(m[1]));
  check('8. us_life3d.js 手機「現在大概在」的區域名字清單有 us_market_street',!!m2&&/'us_market_street'/.test(m2[1])); }
// 9. 正式模型
{ const fn=path.join(ROOT,'assets/models/env/second_ai/us_market_street.glb');
  if(!fs.existsSync(fn)) console.log('SKIP 9. 沒有 us_market_street.glb（稀疏工作樹）');
  else { const b=fs.readFileSync(fn); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString()); const mats=(J.materials||[]).map(m=>m.name), nodes=(J.nodes||[]).map(n=>n.name);
    const need=['GLOW_usms_lamp','GLOW_usms_store_interior','GLOW_usms_lightbox_lamp','GLOW_usms_letters_lamp','GLOW_usms_signal'];
    check('9. 正式模型：晚上亮的燈、店內景、燈箱、招牌字、號誌的材質都在',need.every(n=>mats.includes(n)),need.filter(n=>!mats.includes(n)).join(','));
    const sea=['SEASON_MATS','SEASON_GEO_tree_core','SEASON_GEO_snow_piles'];
    check('9. 正式模型：四季（換材質的 SEASON_MATS、樹芯、雪堆、四季的門口陳列）',sea.every(n=>nodes.includes(n))&&['summer','autumn','bare','snow'].every(s=>nodes.some(n=>n.startsWith('SEASON_GEO_disp_'+s))),sea.filter(n=>!nodes.includes(n)).join(','));
    check('9. 正式模型：網格 ≤ 70 個（每個＝一次 draw call）',(J.meshes||[]).length<=70,'網格 '+(J.meshes||[]).length); } }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
