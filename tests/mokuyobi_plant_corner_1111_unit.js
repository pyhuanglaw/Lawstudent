/* MOKU-PLANT-CORNER-1111（LAWWW 11-11 14:37 派給 LAWWW2，P0；BB V25_STAIR_run10、線上 779 就有）：木曜日二樓
   ① 小孤島：衣帽架 (−2.7,2.75)、落地植物 (−2.15,3.75)、樓梯間東邊隔間牆、隔間牆前的書櫃圍出兩條比人窄的縫，導航格是空的，只有接角那一格 (−2.54,3.33) 剛好站得住，
     進去以後往哪推都出不來（40 秒）；779 也卡在縫口 (−2.49,3.04)。
   ② 植物東南角：站在 (−1.82,4.00) 往樓梯方向（202°～247°）斜推一步不動。
   修法（src/mokuyobi3d.js、src/engine3d.js）：兩條縫補成阻擋（只有導航；同一次掃到的 (−3.75,1.0) 小孤島一起擋）；引擎 stepEntity 加 cornerSlip（只有區域開了、只有玩家）：推進家具外角一步都動不了時往旁邊讓開、繞過去。
   這支：在 Node 建出真的木曜日區域，用引擎真的 stepEntity 照搖桿推（和 tests/mokuyobi_stair_top_1111_unit.js 同一個做法）：
     1 兩層的小孤島（tools/dev_scratch/nav_islands.py 同一個掃法：canStand 0.3、每 0.1 m，和最大那一塊不相連、面積 < 0.5 m² 的）：沒有
     2 (−2.54,3.33)、(−2.49,3.04) 已經在阻擋裡（站不進去）；萬一人在那裡（舊存檔），E.unstick 拉出來的位置在大區
     3 三個點（縫口那兩點換成拉出來的位置、(−1.82,4.00)）往樓梯方向推、往回推：3 秒內離開 0.5 m 以上（走／跑 × 30／10 fps），每一步都站在站得住的地方
     4 (−1.82,4.00) 往樓梯方向一直推：走得到樓梯口（店門 x −3.0 那一帶）
     5 牆角（內角）往角裡推：停住、不會被 cornerSlip 推著跑
     6 CC 14:37 的走法（(−1.97,1.05) 直線推往樓梯底，10 fps 跑步停在小孤島）：停下來的地方站得住、往回／左／右都推得出來
     7 找路的路線用 stepEntity 實際走（E.simWalk）：從那些位置走到樓梯底
   修改前（開發分支 566ff8b5b）：1、2、3 FAIL。這是模擬，不是真實玩家流程（D131）。用法：node tests/mokuyobi_plant_corner_1111_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); const cerr=console.error, cwarn=console.warn; console.warn=()=>{}; console.error=()=>{};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=MOKUYOBI_LAYOUT, S=L.stairWell, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.wz_mokuyobi.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
if(!E.stepEntity){ console.log("（修改前沒有 E.stepEntity）"); }
check('0. 引擎有 E.stepEntity、木曜日兩層；區域開了 cornerSlip',typeof E.stepEntity==='function'&&E.levels.length===2&&z.cornerSlip===true);
const R=0.32;
function push(x,zz,lv,dir,{sp=E.SPD.walk,dt=1/30,secs=30,until}){ const ent={obj:{position:new THREE.Vector3(x,0,zz),rotation:{y:0}},radius:R,lv}; E.player=ent; let bad=0;
  const d=Math.hypot(dir[0],dir[1]), dx=dir[0]/d, dz=dir[1]/d; const N=Math.ceil(secs/dt);
  for(let i=0;i<N;i++){ E.stepEntity(ent,dx,dz,sp,dt); const o=ent.obj.position; if(!E.levels[ent.lv|0].clear(o.x,o.z,R-0.02)) bad++; if(until(ent)) return {ok:true,steps:i+1,lv:ent.lv,x:+o.x.toFixed(2),z:+o.z.toFixed(2),bad}; }
  const o=ent.obj.position; return {ok:false,lv:ent.lv,x:+o.x.toFixed(2),z:+o.z.toFixed(2),bad}; }

const MODES=[[E.SPD.walk,1/30,'走30'],[E.SPD.walk,0.1,'走10'],[E.SPD.run,1/30,'跑30'],[E.SPD.run,0.1,'跑10']];
// 1 小孤島（nav_islands.py 的掃法，兩層各掃一次）
{ const out=[]; for(let lv=0;lv<2;lv++){ const n=E.levels[lv]; E.player={obj:{position:new THREE.Vector3(0,0,0)},lv,radius:R}; const a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1), minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]);
    const h=0.1, W=Math.floor((maxx-minx)/h)+1, H=Math.floor((maxz-minz)/h)+1, S2=new Uint8Array(W*H); for(let j=0;j<H;j++) for(let i=0;i<W;i++) S2[j*W+i]=E.canStand(minx+i*h,minz+j*h,0.3,lv)?1:0;
    const lab=new Int32Array(W*H).fill(-1), comps=[], q=new Int32Array(W*H);
    for(let s=0;s<W*H;s++){ if(!S2[s]||lab[s]>=0) continue; let qh=0, qt=0, cnt=0, sx=0, sz=0; q[qt++]=s; lab[s]=comps.length; while(qh<qt){ const c=q[qh++]; cnt++; const ci=c%W, cj=(c/W)|0; sx+=ci; sz+=cj; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=W||nj>=H) continue; const t=nj*W+ni; if(S2[t]&&lab[t]<0){ lab[t]=comps.length; q[qt++]=t; } } }
      comps.push({n:cnt,x:+(minx+sx/cnt*h).toFixed(2),z:+(minz+sz/cnt*h).toFixed(2)}); }
    comps.sort((p,q2)=>q2.n-p.n); for(const c of comps.slice(1)) if(c.n<50) out.push('第'+lv+'層 ('+c.x+','+c.z+') '+c.n+' 格'); }
  check('1. 兩層都沒有小孤島（和最大那一塊不相連、面積 < 0.5 m²；nav_islands.py 的掃法）',!out.length,out.join('、')); }
// 2 縫口那兩點
const n1=E.levels[1]; const near=(x,zz)=>{ for(let d=0.05;d<1.5;d+=0.05) for(let k=0;k<16;k++){ const a=k*Math.PI/8, px=x+Math.sin(a)*d, pz=zz+Math.cos(a)*d; if(n1.clear(px,pz,R)) return [+px.toFixed(3),+pz.toFixed(3)]; } return null; };
const GAP=[[-2.54,3.33],[-2.49,3.04]];
{ const st=GAP.map(p=>n1.clear(p[0],p[1],R)), un=GAP.map(p=>{ const ent={obj:{position:new THREE.Vector3(p[0],Y1L(),p[1]),rotation:{y:0}},radius:R,lv:1}; E.player=ent; E.unstick(ent,16); return [+ent.obj.position.x.toFixed(2),+ent.obj.position.z.toFixed(2)]; });
  check('2. (−2.54,3.33)、(−2.49,3.04) 站不進去（縫補成阻擋）；E.unstick 從那裡拉出來站得住',st.every(v=>!v)&&un.every(p=>n1.clear(p[0],p[1],R)),JSON.stringify({站得住:st,unstick:un})); }
function Y1L(){ return n1.heightAt?n1.heightAt(0,0):0; }
// 3 往樓梯方向推、往回推
const ST=L.stairTop, pts=[['縫口 (−2.54,3.33) 旁',near(-2.54,3.33)],['縫口 (−2.49,3.04) 旁',near(-2.49,3.04)],['植物東南角 (−1.82,4.00)',[-1.82,4.0]]];
{ const out=[]; let bad=0; for(const [nm,p] of pts){ if(!p){ bad++; out.push(nm+'找不到站得住的點'); continue; } const tx=ST.x-p[0], tz=ST.z-p[1];
    for(const [dir,tag] of [[[tx,tz],'往樓梯'],[[-tx,-tz],'往回']]) for(const [sp,dt,mt] of MODES){ const r=push(p[0],p[1],1,dir,{sp,dt,secs:3,until:e=>Math.hypot(e.obj.position.x-p[0],e.obj.position.z-p[1])>0.5}); if(!r.ok||r.bad){ bad++; out.push(nm+tag+mt+':'+JSON.stringify(r)); } } }
  check('3. 三個點往樓梯方向推、往回推：3 秒內離開 0.5 m 以上、每一步都站得住（走／跑 × 30／10 fps；'+pts.length*2*MODES.length+' 趟）',!bad,out.slice(0,4).join('｜')); }
// 4 植物東南角往樓梯方向一直推：走得到樓梯口
{ const out=[]; let bad=0; const p=[-1.82,4.0], tx=ST.x-p[0], tz=ST.z-p[1]; for(const [sp,dt,mt] of MODES){ const r=push(p[0],p[1],1,[tx,tz],{sp,dt,secs:12,until:e=>e.obj.position.x<-2.6&&e.obj.position.z<2.6}); out.push(mt+':'+(r.ok?(r.steps*dt).toFixed(1)+' 秒':'沒到 '+JSON.stringify(r))); if(!r.ok||r.bad) bad++; }
  check('4. (−1.82,4.00) 往樓梯方向一直推：12 秒內走到樓梯口（x < −2.6、z < 2.6）',!bad,out.join('｜')); }
// 5 牆角（內角）不會被 cornerSlip 推著跑：樓梯頂平台西北角（西牆 x −4.5、北牆 z 1.54）往西北推 3 秒——和關掉 cornerSlip 推的結果一樣、最後 1 秒不動
{ const run=(sp,dt,on)=>{ z.cornerSlip=on; const ent={obj:{position:new THREE.Vector3(-3.8,0,2.1),rotation:{y:0}},radius:R,lv:1}; E.player=ent; const a=225*Math.PI/180, N=Math.ceil(3/dt), M=Math.ceil(1/dt); let p2=null;
    for(let i=0;i<N;i++){ if(i===N-M) p2=ent.obj.position.clone(); E.stepEntity(ent,Math.sin(a),Math.cos(a),sp,dt); } const o=ent.obj.position; return {x:o.x,z:o.z,mv:Math.hypot(o.x-p2.x,o.z-p2.z),lv:ent.lv|0}; };
  const out=[]; let bad=0; for(const [sp,dt,mt] of MODES){ const a=run(sp,dt,true), b=run(sp,dt,false); out.push(mt+':('+a.x.toFixed(2)+','+a.z.toFixed(2)+') 最後 1 秒 '+a.mv.toFixed(3)+' m'); if(!(Math.hypot(a.x-b.x,a.z-b.z)<0.02&&a.mv<0.02&&a.lv===1)) bad++; }
  z.cornerSlip=true;
  check('5. 牆角（樓梯頂平台西北角）往角裡推：和沒有 cornerSlip 時停在同一點、最後 1 秒不動（只繞外角，不會被推著跑）',!bad,out.join('｜')); }
// 6 CC 14:37 的走法（V25_STAIR_run10：二樓 (−1.97,1.05) 搖桿直線推往樓梯底 (−3.35,5.60)；修改前 10 fps 跑步停在小孤島 (−2.54,3.333)）：
//   推 8 秒，停下來的地方站得住；從那裡往回、往左、往右推，3 秒內離開 0.5 m 以上
const CCEND=[];
{ const out=[]; let bad=0; const A=[-1.97,1.05], B=[-3.35,5.60], dl=Math.hypot(B[0]-A[0],B[1]-A[1]), dir=[(B[0]-A[0])/dl,(B[1]-A[1])/dl];   /* 搖桿方向（單位向量） */
  for(const [sp,dt,mt] of MODES){ const ent={obj:{position:new THREE.Vector3(A[0],0,A[1]),rotation:{y:0}},radius:R,lv:1}; E.player=ent; for(let i=0;i<Math.ceil(8/dt);i++) E.stepEntity(ent,dir[0],dir[1],sp,dt); const o=ent.obj.position, e=[+o.x.toFixed(3),+o.z.toFixed(3)], lv=ent.lv|0; CCEND.push([e,lv]);
    const st=E.levels[lv].clear(e[0],e[1],R); let esc=0; const d=Math.hypot(dir[0],dir[1]), ux=dir[0]/d, uz=dir[1]/d;
    for(const v of [[-ux,-uz],[uz,-ux],[-uz,ux]]){ const r=push(e[0],e[1],lv,v,{sp,dt,secs:3,until:q=>Math.hypot(q.obj.position.x-e[0],q.obj.position.z-e[1])>0.5}); if(r.ok&&!r.bad) esc++; }
    out.push(mt+':停在('+e+') 第'+lv+'層、往回／左／右離開 '+esc+'/3'); if(!st||esc<3) bad++; }
  check('6. CC 的走法（(−1.97,1.05) 直線推往樓梯底 8 秒）：停下來的地方站得住、往回／左／右都 3 秒內離開（走／跑 × 30／10 fps）',!bad,out.join('｜')); }
// 7 找路（E.pathTo）的路線用引擎的 stepEntity 實際走（E.simWalk）：從 6 停下來的地方、縫口兩點被拉出來的位置，走到樓梯底 (−3.35,5.60) 第 0 層
//   （修改前從小孤島 pathTo 有路、照著走卻出不去：小孤島四周沒有「人站得住」的路，找路退回只看格子是空的那種路，路線穿過比人窄的縫——小孤島沒了就不會發生）
{ const out=[]; let bad=0; const starts=CCEND.map(([e,lv])=>[e,lv]).concat([[[-1.85,2.65],1],[[-2.15,2.55],1]]);
  for(const [e,lv] of starts) for(const dt of [1/30,0.1]){ const r=E.simWalk(e[0],e[1],-3.35,5.6,{lv0:lv,lv1:0,dt}); if(!r||!r.ok){ bad++; out.push('('+e+')'+(dt>0.05?'10':'30')+'fps:'+JSON.stringify(r).slice(0,120)); } }
  check('7. 找路的路線實際走得到：6 停下來的地方、(−1.85,2.65)、(−2.15,2.55) → 樓梯底 (−3.35,5.60) 第 0 層（E.simWalk，30／10 fps）',!bad,out.slice(0,4).join('｜')); }
console.warn=cwarn; console.error=cerr;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
