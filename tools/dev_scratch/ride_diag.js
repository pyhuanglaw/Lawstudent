// 騎車姿勢診斷（開發用）：肩膀、手臂長度、到握點的距離
const {preload}=require('../dev_scratch/spring_sim/harness.js');
const key=process.argv[2]||'char.yuting';
(async()=>{ await preload([key]); const scene=new THREE.Scene(); const ground=()=>0; const height=ASSETS.manifest[key].height||1.6;
  const h=CHAR.build({model:key,height}); scene.add(h); const vrm=h.userData.vrm; const R=n=>vrm.humanoid.getRawBoneNode(n); const W=b=>{ const p=new THREE.Vector3(); b.getWorldPosition(p); return p; };
  for(let i=0;i<10;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
  for(let i=0;i<6;i++) CHAR.animate(h,1/30,{pose:'ride',speed:0,ground,ride:{crank:0}}); scene.updateMatrixWorld(true);
  const f=v=>`(${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)})`;
  for(const s of ['left','right']){ const sh=W(R(s+'UpperArm')), el=W(R(s+'LowerArm')), wr=W(R(s+'Hand')); const la=sh.distanceTo(el)+el.distanceTo(wr); const g=new THREE.Vector3(s==='left'?0.29:-0.29,1.07,0.053);
    console.log(s,'肩',f(sh),'肘',f(el),'腕',f(wr),'手臂長',la.toFixed(3),'肩到握點',sh.distanceTo(g).toFixed(3)); }
  console.log('hips',f(W(R('hips'))),'spine',f(W(R('spine'))),'chest',f(W(R('chest'))),'neck',f(W(R('neck'))),'head',f(W(R('head'))));
  for(const s of ['left','right']){ console.log(s,'髖',f(W(R(s+'UpperLeg'))),'膝',f(W(R(s+'LowerLeg'))),'踝',f(W(R(s+'Foot')))); }
  process.exit(0); })();
