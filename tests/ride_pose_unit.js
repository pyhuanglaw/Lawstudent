// 騎腳踏車的姿勢（character3d.js 的 pose 'ride'＋rideIK）：在 Node 裡載入遊戲的人物（不算圖），用遊戲的身高騎上 LAWWW2 bike_ride.glb 的尺寸
// （VISUAL_REVIEW（second_ai）第 19 節：座墊頂 (0,0.935,-0.31)、把手握點 (±0.29,1.06,0.083)、五通 (0,0.285,-0.045)、曲柄 0.165、踏板 x ±0.115），
// 曲柄轉一圈（每 45°）量：
//   ① 腳踝到踏板的距離（目標：踏板軸往上 7 cm、往後 5 cm）≤ 4 cm——腳在踏板上，沒有懸空或踩進踏板；
//   ② 手腕到握點 ≤ 4 cm；
//   ③ 髖關節在座墊上方：比座墊頂高 −2～+12 cm、前後在座墊頂後面 0～10 cm（坐在座墊上，沒有浮在空中或沉進車架）；
//   ④ 膝蓋在前面：膝蓋比髖關節前面 5 cm 以上、在「髖關節→腳踝」那條線的前上方（腿往前踩，不是膝蓋往後折）；左右不超過 32 cm（沒有大外八）；
//   ⑤ 把手轉到最大（bike3d.js 的 STEER_MAX 0.22 rad）時手跟著把手走（bike3d.js 給轉過的握點）。
// 車的尺寸照 bike3d.js 的 BIKE.scaleFor：175 cm 以上原尺寸、矮的人小一號（最小 0.88 倍）——原尺寸時 159 cm 的陳語彤腿伸直也只到座墊頂下面 5 cm（③ 失敗）。
// 修改前（沒有 pose 'ride'）：人物站著、腳踝離踏板 40 cm 以上，① ② ③ 都會失敗。
// 用法：node tests/ride_pose_unit.js [char.yuting ...]（不給就六位主要人物）
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_03','char.heroine_04','char.heroine_05'];
const scene=new THREE.Scene(); const ground=()=>0;
const G={saddle:[0,0.935,-0.31], grip:[0.29,1.06,0.083], bb:[0,0.285,-0.045], crank:0.165, pedalX:0.115};
const GRIPS=[[0.29,1.07,0.053],[-0.29,1.07,0.053]];
function steerGrips(a,bk){ const p=new THREE.Vector3(0,0.7,0.3732), d=new THREE.Vector3(0,0.9397,-0.342).normalize(); return GRIPS.map(g=>{ const v=new THREE.Vector3(...g).sub(p).applyAxisAngle(d,a).add(p).multiplyScalar(bk); return [v.x,v.y,v.z]; }); }
const scaleFor=hm=>Math.max(0.88,Math.min(1,(hm||1.75)/1.75)), STEER_MAX=0.22;   /* 和 src/bike3d.js 一樣 */
(async()=>{
  await preload(keys);
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.6;
    const h=CHAR.build({model:key,height}); scene.add(h); const vrm=h.userData.vrm; const R=n=>vrm.humanoid.getRawBoneNode(n);
    const W=b=>{ const p=new THREE.Vector3(); b.getWorldPosition(p); return p; };
    h.position.set(3,0,-2); h.rotation.y=0.7; h.updateMatrixWorld(true);   /* 不在原點、有轉向：確認是在人物控制器的座標裡算 */
    const L=v=>h.worldToLocal(v.clone());
    for(let i=0;i<20;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
    let ankMax=0, wrMax=0, hipLo=9, hipHi=-9, hipZlo=9, hipZhi=-9, kneeFront=true, kneeX=0; const rows=[]; const bk=scaleFor(height);
    for(let k=0;k<8;k++){ const cr=k*Math.PI/4, grips=steerGrips(0,bk);
      for(let i=0;i<6;i++) CHAR.animate(h,1/30,{pose:'ride',speed:0,ground,ride:{crank:cr,grips,scale:bk}}); scene.updateMatrixWorld(true);
      const tgt=side=>{ const th=side<0?cr:cr+Math.PI; return new THREE.Vector3(side*G.pedalX*bk,G.bb[1]*bk-Math.sin(th)*G.crank*bk+0.07,G.bb[2]*bk+Math.cos(th)*G.crank*bk-0.05); };
      const aL=L(W(R('leftFoot'))), aR=L(W(R('rightFoot'))), dL=aL.distanceTo(tgt(1)), dR=aR.distanceTo(tgt(-1));
      const wL=L(W(R('leftHand'))), wR=L(W(R('rightHand'))), gL=wL.distanceTo(new THREE.Vector3(...grips[0])), gR=wR.distanceTo(new THREE.Vector3(...grips[1]));
      const hip=L(W(R('hips'))), kL=L(W(R('leftLowerLeg'))), kR=L(W(R('rightLowerLeg'))), uL=L(W(R('leftUpperLeg'))), uR=L(W(R('rightUpperLeg')));
      ankMax=Math.max(ankMax,dL,dR); wrMax=Math.max(wrMax,gL,gR);
      const seat=Math.min(uL.y,uR.y)-G.saddle[1]*bk; hipLo=Math.min(hipLo,seat); hipHi=Math.max(hipHi,seat); const bz=G.saddle[2]*bk-(uL.z+uR.z)/2; hipZlo=Math.min(hipZlo,bz); hipZhi=Math.max(hipZhi,bz);
      /* 側面看（z 往前、y 往上）：膝蓋在「髖關節→腳踝」那條線的前上方（叉積 ≥ −0.5 cm）＝腿往前踩；踏板在前面時膝蓋大約在踏板正上方，是正常的 */
      const kneeSide=(u,k,a)=>{ const az=a.z-u.z, ay=a.y-u.y, kz=k.z-u.z, ky=k.y-u.y; return (az*ky-ay*kz)/Math.hypot(az,ay); };
      if(!(kL.z>uL.z+0.05&&kR.z>uR.z+0.05&&kneeSide(uL,kL,aL)>=-0.005&&kneeSide(uR,kR,aR)>=-0.005)) kneeFront=false; kneeX=Math.max(kneeX,Math.abs(kL.x),Math.abs(kR.x));
      rows.push(`${(cr*180/Math.PI).toFixed(0)}°:腳${(Math.max(dL,dR)*100).toFixed(1)}/手${(Math.max(gL,gR)*100).toFixed(1)}`); }
    const tag=`${key}（${(height*100).toFixed(0)} cm，車 ${bk.toFixed(2)} 倍）`;
    check(tag+' ① 腳踝在踏板上（每 45° 量一次，最大誤差 ≤ 4 cm）',ankMax<=0.04,(ankMax*100).toFixed(1)+' cm｜'+rows.join(' '));
    check(tag+' ② 手腕在把手握點（≤ 4 cm）',wrMax<=0.04,(wrMax*100).toFixed(1)+' cm');
    check(tag+' ③ 坐在座墊上：大腿根比座墊頂高 −2～+12 cm、在座墊頂後面 0～10 cm',hipLo>=-0.02&&hipHi<=0.12&&hipZlo>=0&&hipZhi<=0.10,`高 ${(hipLo*100).toFixed(1)}～${(hipHi*100).toFixed(1)} cm、後 ${(hipZlo*100).toFixed(1)}～${(hipZhi*100).toFixed(1)} cm`);
    check(tag+' ④ 膝蓋往前（比髖關節、腳踝前面）、左右 ≤ 32 cm',kneeFront&&kneeX<=0.32,'膝蓋 |x| 最大 '+(kneeX*100).toFixed(1)+' cm');
    { let e=0; for(const a of [STEER_MAX,-STEER_MAX]){ const grips=steerGrips(a,bk); for(let i=0;i<6;i++) CHAR.animate(h,1/30,{pose:'ride',speed:0,ground,ride:{crank:0.5,grips,scale:bk}}); scene.updateMatrixWorld(true);
        e=Math.max(e,L(W(R('leftHand'))).distanceTo(new THREE.Vector3(...grips[0])),L(W(R('rightHand'))).distanceTo(new THREE.Vector3(...grips[1]))); }
      check(tag+' ⑤ 把手往左、往右轉到最大（'+STEER_MAX+' rad）：手跟著握點（≤ 4 cm）',e<=0.04,(e*100).toFixed(1)+' cm'); }
    // 下車：回到站姿，人物模型回到原本的高度、前後位置
    for(let i=0;i<10;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground}); const m=h.userData.model||h.children[0];
    check(tag+' ⑥ 下車回到站姿：模型的高度、前後位置回到原位',Math.abs(m.position.z)<1e-6&&Math.abs(m.position.y-(m.userData.baseY||0))<1e-6,`y ${m.position.y.toFixed(3)} z ${m.position.z.toFixed(3)}`);
    scene.remove(h); CHAR.release(h);
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
