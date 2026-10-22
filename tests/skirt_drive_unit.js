// 裙子的輔助骨頭（PS-SKIRT-LEG，LAWWW2 2026-10-22；character3d.js 的 skirtDrive＋沛珊 VRM 節點的 extras.drive）——不需要瀏覽器。
// 在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（tools/dev_scratch/spring_sim/harness.js），檢查：
//   ①沛珊的 VRM 有 6 根會動的輔助骨頭（skirt_F、skirt_F_lo、skirt_BL(_lo)、skirt_BR(_lo)），沒有這種節點的人物（祐廷）沒有；
//   ②靜止姿勢（bind pose）裙子每個頂點都在模型原本的位置（誤差 < 0.1 mm）——新骨頭的位置、inverseBindMatrices 對；
//   ③抬左腳（左大腿往前 70°、右腳不動）：skirt_F 往前轉 50°～70°（偏向抬起來那條）、裙子前片中間的頂點跟著往前（不留在原地）；
//   ④坐下（兩條大腿往前 90°、小腿往回 90°）：後片的 skirt_BL／BR（_lo）不轉（gate），蒙皮矩陣和臀部完全一樣＝後片多的那一份等於留在臀部＝和加骨頭以前一樣；
//   ⑤左腳往後 30°（走路的後腳）：skirt_BL 跟著往後轉（> 15°），skirt_BR（右腳不動）不轉。
// 用法：node tests/skirt_drive_unit.js
const path=require('path'), fs=require('fs');
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const KEY='char.classmate_peishan', DEG=Math.PI/180;
(async()=>{
  await preload([KEY,'char.yuting']);
  const scene=new THREE.Scene();
  const build=()=>{ const h=CHAR.build({model:KEY,height:1.63}); scene.add(h); return h; };
  const h=build(), u=h.userData, vrm=u.vrm, raw=n=>vrm.humanoid.getRawBoneNode(n);
  const names=(u.drive||[]).map(d=>d.o.name).sort();
  check('①沛珊有 6 根會動的輔助骨頭',names.join(',')==='skirt_BL,skirt_BL_lo,skirt_BR,skirt_BR_lo,skirt_F,skirt_F_lo',names.join(','));
  const y=CHAR.build({model:'char.yuting',height:1.75}); check('①祐廷（沒有這種節點）沒有 drive',!y.userData.drive); CHAR.release(y);
  if(names.length!==6){ console.log('FAIL '+fails+'（沛珊的 VRM 沒有輔助骨頭，或 character3d.js 沒有 skirtDrive：後面不測）'); process.exit(1); }
  let skirt=null; vrm.scene.traverse(o=>{ if(o.isSkinnedMesh){ const m=[].concat(o.material)[0]; if(/Skirt/.test(m.name||'')) skirt=o; } });
  const V=new THREE.Vector3();
  const posed=(sk)=>{ scene.updateMatrixWorld(true); sk.skeleton.update(); const P=sk.geometry.attributes.position, out=new Float32Array(P.count*3); for(let i=0;i<P.count;i++){ V.fromBufferAttribute(P,i); sk.applyBoneTransform(i,V); V.applyMatrix4(sk.matrixWorld); out[i*3]=V.x; out[i*3+1]=V.y; out[i*3+2]=V.z; } return out; };
  // 擺姿勢：直接設真實骨架（normalized 先歸零），再跑 skirtDrive（CHAR 內部；用 animate 的 post 會被動畫蓋掉，這裡呼叫 CHAR._skirtDrive）
  const setPose=(hh,q)=>{ const v=hh.userData.vrm; v.humanoid.resetNormalizedPose(); v.humanoid.update(); for(const n in q){ const b=v.humanoid.getRawBoneNode(n); if(b) b.quaternion.setFromEuler(new THREE.Euler(...q[n])); } if(hh.userData.drive) CHAR._skirtDrive(hh.userData.drive); };
  if(typeof CHAR._skirtDrive!=='function'){ check('character3d.js 有 CHAR._skirtDrive（測試用的入口）',false); console.log('FAIL '+fails); process.exit(1); }
  // VRM 0.x：人物面向 −z；大腿往前抬＝繞 x 軸轉正的角度（(0,−1,0) 轉成 (0,−cos,−sin)：膝蓋往 −z）
  const fwd=a=>[a*DEG,0,0];
  // ② bind pose
  setPose(h,{}); const bindNew=posed(skirt);
  { const P0=skirt.geometry.attributes.position; let mx=0; for(let i=0;i<P0.count;i++){ V.fromBufferAttribute(P0,i).applyMatrix4(skirt.matrixWorld); mx=Math.max(mx,Math.abs(V.x-bindNew[i*3]),Math.abs(V.y-bindNew[i*3+1]),Math.abs(V.z-bindNew[i*3+2])); }
    check('②靜止姿勢裙子每個頂點都在模型原本的位置',mx<1e-4,'最大差 '+(mx*1000).toFixed(3)+' mm'); }
  // ③ 抬左腳 70°
  setPose(h,{leftUpperLeg:fwd(70)}); const F=u.drive.find(d=>d.o.name==='skirt_F');
  const ang=q=>{ V.set(0,-1,0).applyQuaternion(q); return Math.atan2(-V.z,-V.y)/DEG; };
  const fa=ang(F.o.quaternion); check('③抬左腳 70°：skirt_F 往前 50°～70°',fa>50&&fa<70.5,fa.toFixed(1)+'°');
  const pUp=posed(skirt); const P=skirt.geometry.attributes.position; let moved=0, n=0;
  for(let i=0;i<P.count;i++){ const x=P.getX(i), yy=P.getY(i), z=P.getZ(i); if(Math.abs(x)<0.02&&z<-0.12&&yy>0.3&&yy<0.6){ n++; const dz=Math.hypot(pUp[i*3]-bindNew[i*3],pUp[i*3+1]-bindNew[i*3+1],pUp[i*3+2]-bindNew[i*3+2]); if(dz>0.08) moved++; } }
  check('③前片中間（膝蓋高度、|x|＜2 cm）跟著往前',n>0&&moved===n,moved+'／'+n+' 個頂點移動超過 8 cm');
  // ④ 坐下
  const sitQ={leftUpperLeg:fwd(90),rightUpperLeg:fwd(90),leftLowerLeg:[-90*DEG,0,0],rightLowerLeg:[-90*DEG,0,0]};
  setPose(h,sitQ); const BL=u.drive.find(d=>d.o.name==='skirt_BL'), BR=u.drive.find(d=>d.o.name==='skirt_BR');
  const rot=q=>2*Math.acos(Math.min(1,Math.abs(q.w)))/DEG;
  check('④坐下：後片的 skirt_BL／BR 不轉',rot(BL.o.quaternion)<0.5&&rot(BR.o.quaternion)<0.5,rot(BL.o.quaternion).toFixed(2)+'°／'+rot(BR.o.quaternion).toFixed(2)+'°');
  { scene.updateMatrixWorld(true); const sk=skirt.skeleton, hi=sk.bones.indexOf(raw('hips')), M1=new THREE.Matrix4(), M2=new THREE.Matrix4(); M2.multiplyMatrices(sk.bones[hi].matrixWorld,sk.boneInverses[hi]); let mx=0;
    for(const nm of ['skirt_BL','skirt_BL_lo','skirt_BR','skirt_BR_lo']){ const k=sk.bones.findIndex(b=>b.name===nm); M1.multiplyMatrices(sk.bones[k].matrixWorld,sk.boneInverses[k]); for(let e=0;e<16;e++) mx=Math.max(mx,Math.abs(M1.elements[e]-M2.elements[e])); }
    check('④坐下：後片四根的蒙皮矩陣和臀部一樣（多的那一份＝留在臀部）',mx<1e-5,'最大差 '+mx.toExponential(1)); }
  // ⑤ 左腳往後 30°
  setPose(h,{leftUpperLeg:fwd(-30)});
  check('⑤左腳往後 30°：skirt_BL 往後轉 > 15°、skirt_BR 不轉',rot(BL.o.quaternion)>15&&rot(BR.o.quaternion)<0.5,rot(BL.o.quaternion).toFixed(1)+'°／'+rot(BR.o.quaternion).toFixed(2)+'°');
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
