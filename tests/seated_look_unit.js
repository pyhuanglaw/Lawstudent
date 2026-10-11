// 坐著的人「看著玩家」時上半身不能轉圈（使用者 2026-10-11 回報：第一天的室友在椅子上旋轉）。
// 原因：character3d.js 的注視（lookAt）每一幀在胸口（Spine1）「加」一點轉角；站著時動畫每一幀會把骨頭蓋回去，
// 坐姿（sit／read 是直接寫骨頭角度的靜態姿勢）沒有重設胸口 → 轉角一直累加，整個上半身繞著椅子轉。
// 對話（game3d.js 的 say）會把說話的人的 lookAt 設成玩家，所以只要和坐著的人講過話就會發生。
// 這個測試在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（不算圖），每種姿勢讓人物看著側面的一點 3 秒，
// 量胸口骨頭（真實骨架）朝向和身體朝向差多少：要一直在 0.45 rad（約 26°）以內，而且最後 1 秒不能再變。
// 用法：node tests/seated_look_unit.js [char.npc_m1]
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const key=process.argv[2]||'char.npc_m1';
const scene=new THREE.Scene();
const yawOf=(obj)=>{ const q=new THREE.Quaternion(); obj.getWorldQuaternion(q); const f=new THREE.Vector3(0,0,1).applyQuaternion(q); return Math.atan2(f.x,f.z); };
const wrap=(a)=>Math.atan2(Math.sin(a),Math.cos(a));
(async()=>{
  await preload([key]);
  let allOk=true;
  for(const pose of ['sit','read','idle','talk','wave']){
    const h=CHAR.build({model:key,height:1.72}); scene.add(h); const vrm=h.userData.vrm;
    const chest=vrm.humanoid.getRawBoneNode('chest')||vrm.humanoid.getRawBoneNode('spine'), hips=vrm.humanoid.getRawBoneNode('hips');
    h.position.set(1.8,0,2.2); h.rotation.y=Math.PI;   // 阿凱的座位（宿舍房間）
    const look=new THREE.Vector3(0.2,0,1.0);            // 玩家站在他的右前方
    const dt=1/30; let maxDev=0, lastDev=0, devAt2=null;
    // 先用沒有注視的同一個姿勢站穩，記下胸口本來的方向（各姿勢的胸口不一定正對前方）
    for(let i=0;i<15;i++) CHAR.animate(h,dt,{pose,speed:0}); scene.updateMatrixWorld(true);
    const base=wrap(yawOf(chest)-yawOf(hips));
    for(let i=0;i<90;i++){ CHAR.animate(h,dt,{pose,speed:0,lookAt:look}); scene.updateMatrixWorld(true);
      const dev=Math.abs(wrap(yawOf(chest)-yawOf(hips)-base)); maxDev=Math.max(maxDev,dev); lastDev=dev; if(i===59) devAt2=dev; }
    const ok=maxDev<0.45&&Math.abs(lastDev-devAt2)<0.05; allOk=allOk&&ok;
    console.log(`${key} ${pose.padEnd(5)}：胸口最多偏 ${(maxDev*180/Math.PI).toFixed(1)}°、最後 1 秒變化 ${(Math.abs(lastDev-devAt2)*180/Math.PI).toFixed(1)}°`, ok?'PASS':'FAIL');
    scene.remove(h); CHAR.release(h);
  }
  console.log(allOk?'ALL PASS':'FAILED','（門檻：胸口偏離 < 26°，最後 1 秒變化 < 3°）');
  process.exit(allOk?0:1);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
