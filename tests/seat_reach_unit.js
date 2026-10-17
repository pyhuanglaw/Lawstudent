// 座位的「坐下」玩家碰得到（2026-10-14 v9.6 發布回歸 reachability_all 抓到：法圖一樓靠窗座位、社科院閱覽長桌與閱報區、普通二樓長椅——
// 椅子後面是桌子、牆或欄杆，最近站得住的位置在互動範圍的邊上，玩家幾乎按不到「坐下」；法圖二樓 T7 的兩個座位則是 E.simWalk 的步數上限只看直線距離，
// 出生點在正下方的一樓、要繞樓梯走約 35 m，人還在走就算逾時）。
// 不需要瀏覽器：在 Node 裡建出每一個區域，照引擎 E.loadZone 的順序在導航格設好之後呼叫 E.fitSeatRadius，檢查：
//   1. 每一個座位：互動範圍內（和 reachability_all 相同：範圍－0.05 m、0.2 m 的格點）有人物（半徑 0.32 m）站得住、站在那裡時「最近的互動」就是它；
//   2. 其他互動點（門、出口、書架、公告…）不會因為座位的範圍變大被搶走：沒放大時碰得到的，放大後還碰得到；
//   3. 沒有放大的座位範圍不變（只動站不到的那幾個）；
//   4. 修正前（不呼叫 E.fitSeatRadius）至少 7 個座位不合格——這個測試在有 bug 的版本會失敗；
//   5. 法圖：從一樓出生點走到二樓 T7 座位旁站得住的位置，E.simWalk（dt 1/30、0.1）走得到；
//   6. 引擎的 E.loadZone 真的在導航格設好之後呼叫 fitSeatRadius（看原始碼）。
// 這是模擬（NPC 不在場：有人坐的位子在瀏覽器的 reachability_all 算說明、不算失敗），不是真實玩家流程。
// 用法：node tests/seat_reach_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const lvOf=(it)=>(E.levels&&it.lv!==undefined)?(it.lv|0):0;
// reachability_all 的規則：範圍－0.05 m 內、0.2 m 的格點，站得住而且「最近的互動」就是它（回傳那個位置，或 null）
function touchable(it){ const r=(it.radius||1.5)-0.05, lv=lvOf(it), P=E.player; if(E.levels) E.setLv(P,lv); else P.lv=0; const c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,lv)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [d,x,z] of c){ P.obj.position.set(x,E.heightAt?E.heightAt(x,z,lv):0,z); if(E.nearestInteractable()===it) return [x,z,lv]; } return null; }
const fmt=(it)=>(it.label||'?')+'('+it.x.toFixed(2)+','+it.z.toFixed(2)+(lvOf(it)?',lv'+lvOf(it):'')+')';
const ZONES=Object.keys(Z3.ZONES); let before=0, totalSeats=0, totalFit=0; const fitList=[];
for(const id of ZONES){ let z; try{ z=loadZone(id); }catch(e){ check(id+'：區域建得起來',false,e.message); continue; }
  const items=E.interactables.slice(), seats=items.filter(it=>it.seat); if(!seats.length) continue; totalSeats+=seats.length;
  const r0=new Map(items.map(it=>[it,it.radius]));
  const base=new Map(items.map(it=>[it,touchable(it)]));   // 修正前
  const badBefore=seats.filter(it=>!base.get(it)); before+=badBefore.length;
  const n=E.fitSeatRadius(); totalFit+=n;
  const after=new Map(items.map(it=>[it,touchable(it)]));
  const badSeats=seats.filter(it=>!after.get(it)), stolen=items.filter(it=>base.get(it)&&!after.get(it));
  const changed=items.filter(it=>it.radius!==r0.get(it)); for(const it of changed) fitList.push(id+' '+fmt(it)+' '+r0.get(it)+'→'+it.radius.toFixed(2));
  const wrongChange=changed.filter(it=>!it.seat||badBefore.indexOf(it)<0&&!(it.radiusFit!==undefined));
  check(id+'：'+seats.length+' 個座位都碰得到「坐下」（放大 '+n+' 個）',!badSeats.length,badSeats.map(fmt).join('、')+(badBefore.length?' 修正前不合格：'+badBefore.map(fmt).join('、'):''));
  check(id+'：其他互動點沒有被放大的座位搶走',!stolen.length,stolen.map(fmt).join('、'));
  check(id+'：只放大座位，其他互動點的範圍不變',!changed.some(it=>!it.seat),changed.filter(it=>!it.seat).map(fmt).join('、'));
  if(id==='lawlib'){ const L=LAWLIB_LAYOUT, sp=L.entrance.spawn; const t7=seats.filter(it=>lvOf(it)===1&&Math.abs(it.z-6.65)<0.3&&it.x>4);
    check('lawlib：二樓 T7 有兩個座位（出生點正上方）',t7.length===2,t7.map(fmt).join('、'));
    for(const it of t7){ const at=after.get(it); if(!at){ check('lawlib：'+fmt(it)+' 有站得住的位置',false); continue; }
      for(const dt of [1/30,0.1]){ const w=E.simWalk(sp.x,sp.z,at[0],at[1],{dt,lv0:sp.lv|0,lv1:1}); check('lawlib：一樓出生點走到二樓 '+fmt(it)+' 旁（dt '+dt.toFixed(3)+'）',w.ok,JSON.stringify(w).slice(0,200)); } } } }
console.log('座位 '+totalSeats+' 個；放大 '+totalFit+' 個：'+fitList.join('；'));
check('修正前至少 7 個座位碰不到「坐下」（v9.6 候選 12 的 reachability_all：法圖 2、社科院 4、普通 1）',before>=7,'修正前 '+before+' 個');
const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); const lz=eng.slice(eng.indexOf('E.loadZone=function'),eng.indexOf('function disposeGroup'));
check('引擎 E.loadZone 在導航格設好之後呼叫 fitSeatRadius',/E\.nav=z\.nav;[^\n]*fitSeatRadius\(\)/.test(lz));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
