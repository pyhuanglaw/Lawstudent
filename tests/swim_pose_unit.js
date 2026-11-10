// 游泳池裡游泳的人（ART-GYM-POOL-SWIMMERS-1103，LAWWW2 帳號 A 11-10；使用者 11-03「游泳池完全沒人？」）：在 Node 裡載入遊戲的泳客人物（不算圖），
// swim_free（自由式）、swim_breast（蛙式）各跑 6 秒（每格 1/30 秒），量真實骨架的關節（人物座標：x 往左、y 往上、z 往前；人物原點＝池邊地面的高度，水面 W＝C.GYM.swim.water）：
//   ① 趴在水面上：頭、臀部差不多高（≤ 25 cm），頭在臀部前面 ≥ 站著時頭比臀部高的 80%（第一版寫死 50 cm：比這個人站著的頭到臀部 49 cm 還長，不可能）；臀部在水面下 0～35 cm、頭在水面附近（−30～+25 cm）、腳不沉到水面下 80 cm 以下
//   ② 自由式：每隻手前後 ≥ 80 cm（畫大圓）、伸到頭前面 ≥ 15 cm（第一版的示意圖看起來手縮在肩膀旁邊：量了是樣本手臂短，手腕已經在頭骨前 25 cm）、兩手輪流（相關 ≤ −0.3）、手會出水（從水面上回來，比水面高 5 cm）也會下去（水裡划，水面下 20 cm）；腳上下踢 ≥ 10 cm、兩腳輪流
//   ③ 蛙式：兩手左右對稱（相關 ≥ 0.9）、手前後 ≥ 40 cm、手會往外撥（左右 ≥ 30 cm）；腳收、踢的時候兩腳張開 ≥ 20 cm、腳不出水超過 10 cm（第一版收腳時腳跟出水 20 cm）；換氣時頭抬起來 ≥ 5 cm
//   ④ 每一格關節移動 ≤ 8 cm（30 fps；從站姿換過來的頭 2 秒 ≤ 15 cm：C.GYM.swim.blend，趴到水裡要移 1 m 多）、沒有 NaN；兩個人同一個動作不同步；換回站著（idle）時整個人轉回直立
//   ⑤ C.swimLap：在水道裡來回（不超出兩頭）、到池邊轉身半圈、方向輪流；⑥ manifest：四個泳客有檔案、不是 ambient（不會被抽去當街上的路人）
// 修改前（沒有這些動作：當成站著）：①全部失敗。用法：node tests/swim_pose_unit.js [char.swim_sm1 ...]
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.swim_sm1','char.swim_sf1'];
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm', rng=a=>Math.max(...a)-Math.min(...a), mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const corr=(x,y)=>{ const mx=mean(x), my=mean(y); let sxy=0,sxx=0,syy=0; for(let i=0;i<x.length;i++){ sxy+=(x[i]-mx)*(y[i]-my); sxx+=(x[i]-mx)**2; syy+=(y[i]-my)**2; } return sxy/Math.sqrt(sxx*syy||1e-12); };
const JOINTS=['hips','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftHand','rightHand','head'];
(async()=>{
  // ⑥ manifest
  { const ks=Object.keys(ASSETS.manifest).filter(k=>/^char\.swim_/.test(k)); const ROOT=path.resolve(__dirname,'..');
    check('⑥ manifest 有四個泳客（char.swim_*）、檔案都在、swim:true、不是 ambient',ks.length===4&&ks.every(k=>{ const m=ASSETS.manifest[k]; return m.type==='vrm'&&m.swim===true&&!m.ambient&&!m.anon&&fs.existsSync(path.join(ROOT,m.url)); }),ks.join(' ')); }
  check('C.GYM_POSES 有 swim_free、swim_breast',CHAR.GYM_POSES.includes('swim_free')&&CHAR.GYM_POSES.includes('swim_breast'));
  // ⑤ swimLap
  if(typeof CHAR.swimLap!=='function') check('⑤ C.swimLap 存在',false); else { const L=25, v=1.0, xs=[], bad=[]; let prev=null, flips=0, turnSeen=false;
    for(let t=0;t<120;t+=0.05){ const q=CHAR.swimLap(t,L,v); if(!q||!isFinite(q.x)||!isFinite(q.yaw)){ bad.push(t); continue; } xs.push(q.x); if(q.turn>0&&q.turn<1) turnSeen=true; if(prev&&prev.dir!==q.dir) flips++;
      if(prev&&Math.abs(q.x-prev.x)>v*0.05+1e-6) bad.push('jump@'+t.toFixed(2)); prev=q; }
    const q0=CHAR.swimLap(L/v+0.7,L,v), q1=CHAR.swimLap(L/v+1.39,L,v), q2=CHAR.swimLap(L/v+1.41,L,v);
    check('⑤ C.swimLap：在水道兩頭之間來回、位置連續、方向輪流（120 秒 ≥ 3 次）、到池邊轉身',Math.min(...xs)>=-L/2-1e-6&&Math.max(...xs)<=L/2+1e-6&&!bad.length&&flips>=3&&turnSeen&&Math.abs(Math.abs(q2.yaw-CHAR.swimLap(0,L,v).yaw)-Math.PI)<0.05&&q0.turn>0&&q0.turn<1,`flips ${flips} bad ${bad.slice(0,3)}`); }
  await preload(keys);
  const random0=Math.random; let sd=11; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.7, mk=(x,yaw)=>{ const h=CHAR.build({model:key,height}); scene.add(h); h.position.set(x,0,-3); h.rotation.y=yaw; h.updateMatrixWorld(true); return h; };
    const h=mk(4.2,0.7), h2=mk(-3,0.7);
    const run=(pose,n,hh)=>{ hh=hh||h; const F=[]; for(let i=0;i<n;i++){ CHAR.animate(hh,1/30,{pose,speed:0}); scene.updateMatrixWorld(true); const v=hh.userData.vrm, f={}; for(const j of JOINTS){ const p=v.humanoid.getRawBoneNode(j).getWorldPosition(new THREE.Vector3()); f[j]=hh.worldToLocal(p); } F.push(f); } return F; };
    const I0=run('idle',30); run('idle',30,h2); const stand=I0[I0.length-1].head.y-I0[I0.length-1].hips.y;
    for(const pose of ['swim_free','swim_breast']){
      const F=run(pose,180), F2=run(pose,180,h2), tag=`[${key} ${pose}]`;
      const nan=F.some(f=>JOINTS.some(j=>!isFinite(f[j].x+f[j].y+f[j].z)));
      let mx1=0, mx2=0; for(let i=1;i<F.length;i++) for(const j of JOINTS){ const d=F[i][j].distanceTo(F[i-1][j]); if(i<60) mx1=Math.max(mx1,d); else mx2=Math.max(mx2,d); }
      check(`${tag} ④ 沒有 NaN；換過來的頭 2 秒每格 ≤ 15 cm、之後 ≤ 8 cm`,!nan&&mx1<=0.15&&mx2<=0.08,`${cm(mx1)} ${cm(mx2)}`);
      const W=CHAR.GYM.swim.water, S=F.slice(60).map(f=>{ const o={}; for(const j in f) o[j]=new THREE.Vector3(f[j].x,f[j].y-W,f[j].z); return o; }), hd=S.map(f=>f.head), hp=S.map(f=>f.hips);   /* y 換成離水面多高 */
      const dh=Math.max(...S.map(f=>Math.abs(f.head.y-f.hips.y))), fwd=Math.min(...S.map(f=>f.head.z-f.hips.z));
      const hipY=hp.map(p=>p.y), headY=hd.map(p=>p.y), footY=S.flatMap(f=>[f.leftFoot.y,f.rightFoot.y]);
      check(`${tag} ① 趴著：頭和臀部差不多高、頭在前面 ≥ 站著時頭臀距離的 80%`,dh<=0.25&&fwd>=0.8*stand,`高差 ${cm(dh)}、頭在前 ${cm(fwd)}／站著 ${cm(stand)}`);
      check(`${tag} ① 在水面（水面 ${cm(W)}）：臀部在水面下 0～35 cm、頭 −30～+25 cm、腳不低於 −80 cm`,Math.min(...hipY)>=-0.35&&Math.max(...hipY)<=0.0&&Math.min(...headY)>=-0.30&&Math.max(...headY)<=0.25&&Math.min(...footY)>=-0.8,
        `臀部 ${cm(Math.min(...hipY))}～${cm(Math.max(...hipY))}、頭 ${cm(Math.min(...headY))}～${cm(Math.max(...headY))}、腳最低 ${cm(Math.min(...footY))}`);
      const lz=S.map(f=>f.leftHand.z-f.hips.z), rz=S.map(f=>f.rightHand.z-f.hips.z), ly=S.map(f=>f.leftHand.y), lx=S.map(f=>f.leftHand.x-f.hips.x), rx=S.map(f=>f.rightHand.x-f.hips.x);
      if(pose==='swim_free'){
        check(`${tag} ② 每隻手前後畫大圓 ≥ 80 cm、兩手輪流`,rng(lz)>=0.8&&rng(rz)>=0.8&&corr(lz,rz)<=-0.3,`左 ${cm(rng(lz))} 右 ${cm(rng(rz))} 相關 ${corr(lz,rz).toFixed(2)}`);
        const reach=Math.max(...S.map(f=>Math.max(f.leftHand.z,f.rightHand.z)-f.head.z)); check(`${tag} ② 手伸到頭前面 ≥ 15 cm`,reach>=0.15,cm(reach));
        check(`${tag} ② 手會出水（回來）、也會下到水裡（划水）`,Math.max(...ly)>0.05&&Math.min(...ly)<-0.2,`手 ${cm(Math.min(...ly))}～${cm(Math.max(...ly))}`);
        const lf=S.map(f=>f.leftFoot.y), rf=S.map(f=>f.rightFoot.y); check(`${tag} ② 腳上下踢 ≥ 10 cm、兩腳輪流`,rng(lf)>=0.1&&rng(rf)>=0.1&&corr(lf,rf)<=-0.3,`${cm(rng(lf))} ${cm(rng(rf))} 相關 ${corr(lf,rf).toFixed(2)}`); }
      else {
        check(`${tag} ③ 兩手對稱、前後 ≥ 40 cm、往外撥 ≥ 30 cm`,corr(lz,rz)>=0.9&&corr(lx,rx.map(v=>-v))>=0.9&&rng(lz)>=0.4&&rng(lx)>=0.3,`前後 ${cm(rng(lz))} 左右 ${cm(rng(lx))} 相關 ${corr(lz,rz).toFixed(2)}`);
        const sp=S.map(f=>Math.abs(f.leftFoot.x-f.rightFoot.x)); check(`${tag} ③ 腳收、踢的時候兩腳張開 ≥ 20 cm`,rng(sp)>=0.2,cm(rng(sp)));
        const fh=Math.max(...footY); check(`${tag} ③ 收腳時腳跟不出水超過 10 cm`,fh<=0.10,cm(fh));
        check(`${tag} ③ 換氣時頭抬起來 ≥ 5 cm`,rng(headY)>=0.05,cm(rng(headY))); }
      const a=F.slice(75).map(f=>f.leftHand.z), b=F2.slice(75).map(f=>f.leftHand.z); check(`${tag} ④ 兩個人不同步`,Math.abs(corr(a,b))<0.95,corr(a,b).toFixed(2));
    }
    const back=run('idle',60); const last=back[back.length-1];
    check(`[${key}] ④ 換回站著：整個人轉回直立（頭比臀部高 ≥ 40 cm）、模型沒有轉`,last.head.y-last.hips.y>=0.4&&h.userData.model.rotation.x===0,`${cm(last.head.y-last.hips.y)}`);
  }
  Math.random=random0;
  console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
