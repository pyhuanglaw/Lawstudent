// 爬宿舍上舖梯子的手勢（CLIMB-POSE-1102；使用者 11-02「走上床手為什麼要往上抬高阿 好像殭屍」）：
// 在 Node 裡載入遊戲的人物（不算圖），用 pose 'climb' 跑兩個走路循環多（每格 1/30 秒，和 story3d.js 爬梯子時一樣是走路片段），每一格量兩隻手（人物座標：x 往左、y 往上、z 往前）：
//   ① 兩手會換：每一隻手的高度上下變化 ≥ 25 cm；
//   ② 兩手交替、不是同一個姿勢：左右手高度的相關係數 ≤ −0.5，平均高度差 ≥ 12 cm；
//   ③ 跟腳一致：左膝在前（左腳往上踩）的那幾格右手比較高，反過來也一樣（≥ 90% 的格子）；
//   ④ 手肘明顯彎：手肘角度（上臂和前臂的夾角）最大 ≤ 135°（舊版 147°、直直往前伸）；
//   ⑤ 抓在梯子兩側：手離身體中線 12～30 cm、左手在左邊、右手在右邊（舊版兩手在胸前中間碰在一起）；
//   ⑥ 高度在胸口到頭頂之間：肩膀下 25 cm ～ 頭頂（頭骨＋20 cm）；在肩膀前面 15～50 cm（往前抓梯子，沒有縮進身體）；
//   ⑦ 平滑：每一格手最多移動 6 cm（30 fps；從站姿換成爬梯子那一刻也一樣，沒有跳格）；
//   ⑧ 上身往前靠：頭比站著的時候往前 ≥ 3 cm。
// 修改前（CLIMB_VRM：兩隻手固定往前平舉）：①②③④⑤ 失敗。
// 用法：node tests/climb_pose_unit.js [char.yuting ...]（不給就祐廷：只有玩家會爬宿舍的梯子）
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting'];
const scene=new THREE.Scene();
(async()=>{
  await preload(keys);
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.75;
    const h=CHAR.build({model:key,height}); scene.add(h); const vrm=h.userData.vrm; const R=n=>vrm.humanoid.getRawBoneNode(n);
    h.position.set(-1.06,0.32,1.5); h.rotation.y=-Math.PI/2; h.updateMatrixWorld(true);   /* 宿舍 L2 梯子的第一階、面向梯子（−x）：不在原點、有轉向，確認是在人物座標裡算 */
    const Lc=n=>{ const p=new THREE.Vector3(); R(n).getWorldPosition(p); return h.worldToLocal(p); };
    for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true);
    const head0=Lc('head'), hips0=Lc('hips'), lean0=head0.z-hips0.z;
    const F=[]; let prev=[Lc('leftHand'),Lc('rightHand')], jump=0;
    for(let i=0;i<100;i++){ CHAR.animate(h,1/30,{pose:'climb',speed:0}); scene.updateMatrixWorld(true);
      const hand=[Lc('leftHand'),Lc('rightHand')], el=[Lc('leftLowerArm'),Lc('rightLowerArm')], sh=[Lc('leftUpperArm'),Lc('rightUpperArm')];
      jump=Math.max(jump,hand[0].distanceTo(prev[0]),hand[1].distanceTo(prev[1])); prev=hand;
      const elbow=[0,1].map(k=>sh[k].clone().sub(el[k]).angleTo(hand[k].clone().sub(el[k]))*180/Math.PI);
      const knee=(Lc('leftLowerLeg').z-Lc('leftUpperLeg').z)-(Lc('rightLowerLeg').z-Lc('rightUpperLeg').z);
      F.push({i,hand,sh,elbow,knee,head:Lc('head'),hips:Lc('hips')}); }
    const S=F.slice(15);   /* 換成爬梯子 0.5 秒以後（剛開始那幾格只量平滑）*/
    const yL=S.map(f=>f.hand[0].y), yR=S.map(f=>f.hand[1].y), rng=a=>Math.max(...a)-Math.min(...a), mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
    const corr=(()=>{ const mx=mean(yL), my=mean(yR); let sxy=0,sxx=0,syy=0; for(let i=0;i<yL.length;i++){ sxy+=(yL[i]-mx)*(yR[i]-my); sxx+=(yL[i]-mx)**2; syy+=(yR[i]-my)**2; } return sxy/Math.sqrt(sxx*syy||1e-12); })();
    const gap=mean(S.map(f=>Math.abs(f.hand[0].y-f.hand[1].y)));
    const big=S.filter(f=>Math.abs(f.knee)>0.15), contra=big.filter(f=>f.knee>0?f.hand[1].y>f.hand[0].y:f.hand[0].y>f.hand[1].y).length/Math.max(1,big.length);
    const elMax=Math.max(...S.map(f=>Math.max(...f.elbow))), elMin=Math.min(...S.map(f=>Math.min(...f.elbow)));
    const xs=S.flatMap(f=>[f.hand[0].x,-f.hand[1].x]);
    const headTop=Math.max(...S.map(f=>f.head.y))+0.2*(height/1.75);
    const lowOK=S.every(f=>[0,1].every(k=>f.hand[k].y>=f.sh[k].y-0.25&&f.hand[k].y<=headTop)), fw=S.flatMap(f=>[0,1].map(k=>f.hand[k].z-f.sh[k].z));
    const lean=mean(S.map(f=>f.head.z-f.hips.z))-lean0;
    const cm=v=>(v*100).toFixed(1)+' cm';
    console.log(`[${key}] 左手高 ${cm(Math.min(...yL))}～${cm(Math.max(...yL))}、右手高 ${cm(Math.min(...yR))}～${cm(Math.max(...yR))}、肩膀 ${cm(S[0].sh[0].y)}`);
    check(`① ${key} 兩手會上下換（每隻手高度變化 ≥ 25 cm）`,rng(yL)>=0.25&&rng(yR)>=0.25,'左 '+cm(rng(yL))+'、右 '+cm(rng(yR)));
    check(`② ${key} 兩手交替、不是同一個姿勢（高度相關 ≤ −0.5、平均高度差 ≥ 12 cm）`,corr<=-0.5&&gap>=0.12,'相關 '+corr.toFixed(2)+'、平均差 '+cm(gap));
    check(`③ ${key} 跟腳一致：左腳在前時右手在上、右腳在前時左手在上（≥ 90%）`,big.length>=10&&contra>=0.9,(contra*100).toFixed(0)+'%（'+big.length+' 格）');
    check(`④ ${key} 手肘明顯彎（最大 ≤ 135°）`,elMax<=135,'手肘 '+elMin.toFixed(0)+'°～'+elMax.toFixed(0)+'°');
    check(`⑤ ${key} 兩手抓在梯子兩側（離中線 12～30 cm，左手在左、右手在右）`,xs.every(x=>x>=0.12&&x<=0.30),'離中線 '+cm(Math.min(...xs))+'～'+cm(Math.max(...xs)));
    check(`⑥ ${key} 高度在胸口到頭頂之間、在肩膀前面 15～50 cm`,lowOK&&fw.every(z=>z>=0.15&&z<=0.5),'往前 '+cm(Math.min(...fw))+'～'+cm(Math.max(...fw))+'、頭頂 '+cm(headTop));
    check(`⑦ ${key} 平滑：每一格手最多移動 6 cm（含從站姿換過來那一刻）`,jump<=0.06,'最大 '+cm(jump));
    check(`⑧ ${key} 上身往前靠向梯子（頭比站著往前 ≥ 3 cm）`,lean>=0.03,'往前 '+cm(lean));
    scene.remove(h); CHAR.release(h);
  }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
