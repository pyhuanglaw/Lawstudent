// 校門照使用者的參考圖改（GATE-REF-1114，使用者 2026-11-14 對 LAWWW2-B：「學校裡的校門，請依照我的參考圖改」）——導航和模型同一套尺寸。不需要瀏覽器（D131）。
// 新配置（tools/blender/env_second/campus_gate.py v2）：正中間切角的紅磚門房（x ±2.7、z −2.6～2.0）、門房前半圓花圃（半徑 3.5、圓心 z 1.7）、
//   外側兩座大石柱（x ±8.1；舊版內側 ±2.45 那兩座拿掉）、石柱外側小石墩（±8.95）、兩條通道（中心 ±5.5）。
// 檢查（在 Node 建出遊戲真正的公館、校園區域；公館校門在 (0,−46) 不轉，校園校門在 (−124,0) 轉 −90°）：
//   ① 花圃擋得住：花圃裡三個點走不進去（修改前花圃不存在，走得過去）
//   ② 門房加寬：門房裡靠邊的點 (±2.4) 走不進去（修改前門房只到 ±1.7）
//   ③ 兩條通道走得通：通道中心從校外到校內每 0.5 m 都站得住；找路從校外走到校內不繞遠（公館區域只到校門內 4 m）
//   ④ CK.gate 的尺寸和模型的 JSON（campus_gate.json：house、planter、pillars、piers）一致
//   ⑤ 校園那一側（轉 −90°）：通道站得住、花圃擋得住
//   ⑥ 出口互動點放在通道上、站得住
// 用法：node tests/gate_ref_1114_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/載入失敗|LOD|Missing/.test(String(a[0]))) return; _warn(...a); };
const src0=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const files=eval(src0.match(/const files=(\[[^\]]*\])/)[1]);
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const plen=(a,p)=>{ if(!p||!p.length) return 0; let len=Math.hypot(p[0][0]-a[0],p[0][1]-a[1]); for(let i=1;i<p.length;i++) len+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]); return len; };   // 路徑長（從起點算）
function build(zone){ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster(); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[];
  global.GAME={G:{zone,day:10,hour:14,flags:{},weather:'clear',visited:{}}}; const z=Z3.ZONES[zone].build(E); return {z,nav:z.nav,inter:E.interactables.slice()}; }
const J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_gate.json'),'utf8'));
const gk=CK.gate().userData.gate;

// ---- 公館：校門 (0,−46)，本地 +z（校外）＝世界 +z ----
{ const {nav,inter}=build('gongguan'); const W=(lx,lz)=>[lx,-46+lz];
  const inPl=[[0,3.0],[2.4,2.4],[-2.8,1.2]].map(p=>nav.free(...W(...p)));
  check('① 花圃擋得住（公館側）：(0,3.0)、(2.4,2.4)、(−2.8,1.2) 都走不進去', inPl.every(f=>!f), JSON.stringify(inPl));
  const inH=[[2.4,0],[-2.4,-1.5]].map(p=>nav.free(...W(...p)));
  check('② 門房加寬到 ±2.7：(2.4,0)、(−2.4,−1.5) 走不進去', inH.every(f=>!f), JSON.stringify(inH));
  let bad=[]; for(const lx of gk.lanes) for(let lz=6;lz>=-3.5;lz-=0.5){ if(!nav.free(...W(lx,lz))) bad.push([lx,lz]); }   // 公館區域只到校門內 4 m
  check('③ 兩條通道（中心 '+gk.lanes.join('、')+'）從校外 6 m 到校內 3.5 m 每 0.5 m 都站得住', bad.length===0, JSON.stringify(bad.slice(0,6)));
  for(const lx of gk.lanes){ const a=W(lx,7), b=W(lx,-3.5); const p=nav.path(...a,...b); const len=plen(a,p);
    check('③ 找路：通道 x '+lx+' 從校外 7 m 走到校內 3.5 m 不繞遠（直線 10.5 m）', !!p&&len>9.5&&len<12.5, p?len.toFixed(1)+' m':'找不到路'); }
  const ex=inter.filter(i=>Math.abs(i.z+46)<6&&gk.lanes.some(lx=>Math.abs(i.x-lx)<0.6));
  check('⑥ 出口互動點在通道上、站得住（公館側）', ex.length>=2&&ex.every(i=>nav.free(i.x,i.z)), ex.map(i=>'('+i.x.toFixed(1)+','+i.z.toFixed(1)+')').join(' ')); }

// ---- ④ 尺寸和模型一致 ----
{ const H=gk.house, JH=J.house||{};
  check('④ 門房尺寸和 campus_gate.json 一致', JH.x1!==undefined&&Math.abs((H.w-0.2)-(JH.x1-JH.x0))<0.02&&Math.abs((H.d-0.2)-(JH.z1-JH.z0))<0.02, JSON.stringify(JH));
  const pl=gk.blocks.filter(b=>b[1]>0.9&&Math.abs(b[0])<0.01); const maxZ=Math.max(...pl.map(b=>b[1]+b[3]/2)), maxW=Math.max(...pl.map(b=>b[2]));
  const JP=J.planter||{};
  check('④ 花圃阻擋的範圍和模型的半圓（半徑 r、圓心 zc）一致', JP.r!==undefined&&pl.length>=3&&Math.abs(maxZ-(JP.zc+JP.r))<0.2&&Math.abs(maxW-2*JP.r)<0.2, '最遠 z '+maxZ+'、最寬 '+maxW+'；模型 '+JSON.stringify(JP));
  const px=gk.blocks.filter(b=>b[1]===0&&Math.abs(b[2]-1.24)<0.01).map(b=>b[0]).sort((a,b)=>a-b);
  check('④ 大石柱只有外側兩座，位置和模型一致', JSON.stringify(px)===JSON.stringify((J.pillars||[]).slice().sort((a,b)=>a-b)), JSON.stringify(px)+' vs '+JSON.stringify(J.pillars));
  const qx=gk.blocks.filter(b=>b[1]===0&&Math.abs(b[2]-0.7)<0.01).map(b=>b[0]).sort((a,b)=>a-b);
  check('④ 小石墩位置和模型一致', JSON.stringify(qx)===JSON.stringify((J.piers||[]).slice().sort((a,b)=>a-b)), JSON.stringify(qx)+' vs '+JSON.stringify(J.piers)); }

// ---- ⑤ 校園：校門 (−124,0) 轉 −90°：本地 (lx,lz) → 世界 (−124−lz, lx)（校外＝−x）----
{ const {nav}=build('campus'); const W=(lx,lz)=>[-124-lz,lx];
  let bad=[]; for(const lx of gk.lanes) for(let lz=3;lz>=-6;lz-=0.5){ if(!nav.free(...W(lx,lz))) bad.push([lx,lz]); }
  check('⑤ 校園側：兩條通道從校門外 3 m 到校內 6 m 都站得住', bad.length===0, JSON.stringify(bad.slice(0,6)));
  for(const lx of gk.lanes){ const a=W(lx,2.5), b=W(lx,-6); const p=nav.path(...a,...b); const len=plen(a,p);
    check('⑤ 校園側找路：通道 x '+lx+' 從校門外 2.5 m 走到校內 6 m 不繞遠（直線 8.5 m）', !!p&&len>7.5&&len<10.5, p?len.toFixed(1)+' m':'找不到路'); }
  const inPl=[[0,3.0],[2.4,2.4],[2.4,0]].map(p=>nav.free(...W(...p)));
  check('⑤ 校園側：花圃、門房走不進去', inPl.every(f=>!f), JSON.stringify(inPl)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
