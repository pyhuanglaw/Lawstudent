// 跪坐（坐墊座位，QA-W1-VISUAL 座位檢查 2026-10-16）：茶屋「一盞」的和室、緣側是坐墊（座面 0.08 m），原本用坐椅子的姿勢，人浮在坐墊上方約 0.4 m。
// 在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（不算圖），讓每個人物 sitFloor＝0.08 坐下（pose 'sit'），量：
//   ① 膝蓋、腳踝、腳尖骨頭（在腿的中間）都在坐墊頂上 2～10 cm（不沉進坐墊、不浮在空中）；② 髖關節離地 0.25～0.55 m（跪坐，不是椅子高度 0.75 以上）；
//   ③ 小腿折到大腿下面：腳踝在膝蓋後面（往人物背後）至少 0.2 m；④ 站起來（idle）以後高度回到原本（不殘留）。
// 修正前（沒有 sitFloor，坐椅子的姿勢）：髖關節在 0.5 m（坐在看不見的椅子上）、小腿直直往下插進地面 10 cm，①③ FAIL。用法：node tests/sit_floor_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=['char.yuting','char.heroine_01','char.heroine_02','char.heroine_03','char.heroine_04','char.heroine_05'];
const scene=new THREE.Scene(); const ground=()=>0;
(async()=>{
  await preload(keys);
  let allOk=true;
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.6;
    const h=CHAR.build({model:key,height}); scene.add(h); const vrm=h.userData.vrm;
    const B=n=>vrm.humanoid.getRawBoneNode(n);
    const wp=n=>{ scene.updateMatrixWorld(true); const b=B(n); if(!b) return null; const p=new THREE.Vector3(); b.getWorldPosition(p); return p; };
    h.position.set(0,0,0); h.rotation.y=0; h.userData.sitFeet=false; h.userData.sitFloor=0.08;
    for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
    const hip0=wp('hips').y;
    for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0,ground});
    const low=['leftLowerLeg','rightLowerLeg','leftFoot','rightFoot','leftToes','rightToes'].map(wp).filter(Boolean).map(p=>p.y);
    const lo=Math.min(...low), hip=wp('hips').y;
    const back=Math.min(...[['leftLowerLeg','leftFoot'],['rightLowerLeg','rightFoot']].map(([k,f])=>wp(k).z-wp(f).z));   // 人物面向 +z：腳踝的 z 比膝蓋小＝在後面
    const ok1=lo>=0.08+0.02&&lo<=0.08+0.10, ok2=hip>=0.25&&hip<=0.55, ok3=back>=0.2;
    h.userData.sitFloor=0; for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
    const ok4=Math.abs(wp('hips').y-hip0)<0.03;
    allOk=allOk&&ok1&&ok2&&ok3&&ok4;
    console.log(`${key}（${(height*100).toFixed(0)} cm）跪坐：腿最低的骨頭 ${(lo*100).toFixed(1)} cm${ok1?' PASS':' FAIL'}；髖關節 ${(hip*100).toFixed(0)} cm${ok2?' PASS':' FAIL'}；腳踝在膝蓋後面 ${(back*100).toFixed(0)} cm${ok3?' PASS':' FAIL'}；站起來髖關節回到 ${(wp('hips').y*100).toFixed(0)}／${(hip0*100).toFixed(0)} cm${ok4?' PASS':' FAIL'}`);
    scene.remove(h); CHAR.release(h);
  }
  console.log(allOk?'ALL PASS':'FAILED'); process.exit(allOk?0:1);
})();
