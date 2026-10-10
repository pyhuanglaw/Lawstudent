// 坐姿的腳（v9.4.1 之後）：在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（不算圖），讓每個人物用遊戲的身高坐下（pose 'sit'），
// 量腳底（腳踝、腳尖骨頭的高度減掉站著時離地的高度）和地面（y=0）的距離：負的＝腳沉到地面下（畫面上小腿斷在腳踝、鞋子不見）。
// 2026-10-10 發現：高子晴（169 cm）坐長椅時腳和鞋子沉到草地下面（線上 VRoid 版、Blender 版都一樣）。
// 用法：node tests/sit_feet_unit.js [char.heroine_04 ...]（不給就六位主要人物）；CHAR_FILE＝試作版 VRM（只套用在第一個人物）
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_03','char.heroine_04','char.heroine_05'];
const scene=new THREE.Scene(); const ground=()=>0;
(async()=>{
  await preload(keys);
  let allOk=true;
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.6;
    const h=CHAR.build({model:key,height}); scene.add(h); const vrm=h.userData.vrm;
    const bones=['leftFoot','rightFoot','leftToes','rightToes'].map(n=>vrm.humanoid.getRawBoneNode(n));
    const wy=()=>{ scene.updateMatrixWorld(true); return bones.map(b=>{ const p=new THREE.Vector3(); b.getWorldPosition(p); return p.y; }); };
    h.position.set(0,0,0); for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
    const rest=wy(); const restAnkle=Math.min(rest[0],rest[1]), restToe=Math.min(rest[2],rest[3]);
    for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0,ground});
    const s=wy(); const sole=Math.min(s[0]-restAnkle,s[1]-restAnkle), toe=Math.min(s[2]-restToe,s[3]-restToe);
    const low=Math.min(sole,toe), ok=low>-0.02;
    allOk=allOk&&ok;
    console.log(`${key}（${(height*100).toFixed(0)} cm）坐下：腳底最低 ${(low*100).toFixed(1)} cm（腳跟 ${(sole*100).toFixed(1)}、腳尖 ${(toe*100).toFixed(1)}）`+(ok?' PASS':' FAIL（腳沉到地面下）'));
    scene.remove(h); CHAR.release(h);
  }
  console.log(allOk?'ALL PASS （門檻：腳底不低於地面 2 cm）':'FAILED'); process.exit(allOk?0:1);
})();
