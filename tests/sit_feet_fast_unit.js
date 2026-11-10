// PERF-XS-NPC-1108 (A)：sitFeet 只更新兩條腿的矩陣（C.sitFeetFast）——結果和原本每幀整個人物更新一樣，矩陣更新的節點數少很多。LAWWW2-B 2026-11-09。
//   大口 1F CPU 效能紀錄（CC-B CPUTRACE_8172_dakou）：sitFeet 佔整幀 9.1%，其中整個人物的 h.updateWorldMatrix(true,true) 5.9%、getWorldPosition 往上走到根 1.6%。
//   在 Node 載入遊戲的 three.js／three-vrm／CHAR、坐姿小動作片段（ual_sit_clips）。同一個模型建兩個人物 A、B，放在同一個位置、同一個方向，
//   每一幀 A 用原本的做法（C.sitFeetFast=false）、B 用新的（true），一起跑：站 → 坐（座位 1）→ 換座位（座位 2：別的高度、方向、樓層）→ 站起來 → 再坐下、讀書。
//   ① 每一幀兩條腿的骨頭（髖、大腿、小腿、腳、腳趾）世界座標差 < 1e-6 m（LAWWW-B 的要求是 < 1 mm）；
//   ② 換座位、站起來、再坐下：腿照新的位置重算（和 A 一樣；座位 2 椅子矮 7 cm，大腿的上下差和座位 1 不同）；
//   ③ 坐著時每幀 updateWorldMatrix 的呼叫數（Object3D.prototype.updateWorldMatrix 的次數，含遞迴；同一個人物先舊後新各 20 幀）：新的比原本少 ≥ 30%；
//   ④ C.sitFeetFast 存在、預設 true；⑤ 測試真的有用到 sitFeet（關掉 sitFeet 腳的位置會差 > 1 mm）。
//   坐姿小動作的亂數換成固定值（C.ambRand），A、B 的動作才會一樣。修改前 ④ FAIL（沒有 C.sitFeetFast：A、B 都是原本的做法，③ 也 FAIL）。
//   用法：node tests/sit_feet_fast_unit.js [char.heroine_04 …]（不給就主角＋四位女主角＋兩個路人底模）
const fs=require('fs'), path=require('path');
const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_04','char.heroine_05','char.npc_f1','char.npc_m1'];
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const scene=new THREE.Scene(); const ground=()=>0;
const LEG=['hips','leftUpperLeg','leftLowerLeg','leftFoot','leftToes','rightUpperLeg','rightLowerLeg','rightFoot','rightToes'];
(async()=>{
  await preload(keys.filter(k=>ASSETS.manifest[k]));
  { const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  check('④ C.sitFeetFast 存在、預設 true',CHAR.sitFeetFast===true,String(CHAR.sitFeetFast));
  CHAR.ambRand=()=>0.37;
  const P=THREE.Object3D.prototype, uwm0=P.updateWorldMatrix; let nUWM=0; P.updateWorldMatrix=function(){ nUWM++; return uwm0.apply(this,arguments); };
  let worst=0, worstAt='', calls={slow:0,fast:0,frames:0}, reseat=[], active=[];
  for(const key of keys){ if(!ASSETS.manifest[key]){ console.log('跳過（manifest 沒有）',key); continue; }
    const height=ASSETS.manifest[key].height||1.65;
    const A=CHAR.build({model:key,height}), B=CHAR.build({model:key,height}); scene.add(A); scene.add(B);
    const bonesOf=h=>LEG.map(n=>h.userData.vrm.humanoid.getRawBoneNode(n));
    const bA=bonesOf(A), bB=bonesOf(B);
    const place=(x,y,z,ry)=>{ for(const h of [A,B]){ h.position.set(x,y,z); h.rotation.set(0,ry,0); } };
    const step=(pose,n,tag)=>{ for(let i=0;i<n;i++){ let c0=nUWM; CHAR.sitFeetFast=false; CHAR.animate(A,1/30,{pose,speed:0,ground}); const cs=nUWM-c0;
        c0=nUWM; CHAR.sitFeetFast=true; CHAR.animate(B,1/30,{pose,speed:0,ground}); const cf=nUWM-c0;
        CHAR.sitFeetFast=true; scene.updateMatrixWorld(true);
        for(let j=0;j<LEG.length;j++){ if(!bA[j]||!bB[j]) continue; const d=bA[j].getWorldPosition(new THREE.Vector3()).distanceTo(bB[j].getWorldPosition(new THREE.Vector3()));
          if(d>worst){ worst=d; worstAt=`${key} ${tag} 第 ${i} 幀 ${LEG[j]}`; } } } };
    const kneeY=h=>{ scene.updateMatrixWorld(true); const v=h.userData.vrm.humanoid; return v.getRawBoneNode('leftLowerLeg').getWorldPosition(new THREE.Vector3()).y-v.getRawBoneNode('leftUpperLeg').getWorldPosition(new THREE.Vector3()).y; };   /* 大腿的上下差（膝蓋 − 髖關節）：腳踩地、小腿直，膝蓋高度不隨椅子變，變的是大腿的角度 */
    const footW=h=>{ scene.updateMatrixWorld(true); const v=h.userData.vrm.humanoid; return ['leftFoot','rightFoot'].map(n=>v.getRawBoneNode(n).getWorldPosition(new THREE.Vector3())); };
    place(3.1,0,-2.4,0.7); step('idle',20,'站');
    place(3.1,0,-2.4,0.7); for(const h of [A,B]) h.userData.sitDrop=0.47*(h.userData.k||1); step('sit',40,'座位 1');
    const a1=kneeY(B);
    { B.userData.sitFeet=false; CHAR.animate(B,1/30,{pose:'sit',speed:0,ground}); const off=footW(B); B.userData.sitFeet=undefined; CHAR.animate(B,1/30,{pose:'sit',speed:0,ground}); CHAR.animate(A,1/30,{pose:'sit',speed:0,ground}); const on=footW(B);
      active.push({key,d:Math.max(off[0].distanceTo(on[0]),off[1].distanceTo(on[1]))}); }
    place(-12.5,4.2,8.3,-2.3); for(const h of [A,B]) h.userData.sitDrop=0.40*(h.userData.k||1); step('sit',40,'座位 2（二樓、轉向、矮一點的椅子）');
    const a2=kneeY(B), a2s=kneeY(A);
    place(-12.5,4.2,8.3,-2.3); step('idle',20,'站起來');
    place(0.6,0,1.9,1.4); for(const h of [A,B]) h.userData.sitDrop=0.47*(h.userData.k||1); step('read',40,'再坐下、讀書');
    reseat.push({key,a1,a2,a2s});
    // ③ 同一個人物（A、B 各自）先用原本的做法坐 20 幀、再用新的做法坐 20 幀，比 updateWorldMatrix 的呼叫數（兩個實例的節點數不一樣：池裡第一個是模板，不能 A 比 B）
    for(const h of [A,B]){ for(const fast of [false,true]){ CHAR.sitFeetFast=fast; for(let i=0;i<5;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0,ground}); const c0=nUWM; for(let i=0;i<20;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0,ground}); calls[fast?'fast':'slow']+=nUWM-c0; } calls.frames+=20; }
    CHAR.sitFeetFast=true;
    scene.remove(A); scene.remove(B); CHAR.release(A); CHAR.release(B); }
  P.updateWorldMatrix=uwm0;
  check('① 每一幀兩條腿的骨頭位置：新做法和原本一樣（差 < 1e-6 m）',worst<1e-6,`最大差 ${worst.toExponential(2)} m（${worstAt||'—'}）`);
  const chg=reseat.filter(r=>Math.abs(r.a2-r.a1)>1e-4&&Math.abs(r.a2-r.a2s)<1e-6);
  check('② 換座位：腿照新的座位重算（座位 2 大腿的上下差和座位 1 不同、和原本做法一樣）',reseat.length>0&&chg.length===reseat.length,reseat.map(r=>`${r.key.replace('char.','')} ${(r.a1*100).toFixed(1)}→${(r.a2*100).toFixed(1)} cm`).join('、'));
  check('⑤ 測試真的有用到 sitFeet：同一個座位關掉 sitFeet，腳的位置差 > 1 mm（每個人物）',active.length>0&&active.every(a=>a.d>1e-3),active.map(a=>`${a.key.replace('char.','')} ${(a.d*100).toFixed(1)} cm`).join('、'));
  const red=calls.frames?1-calls.fast/calls.slow:0;
  check('③ 坐著時每幀 updateWorldMatrix 呼叫數少 ≥ 30%',red>=0.3,`原本 ${(calls.slow/Math.max(1,calls.frames)).toFixed(0)}、新 ${(calls.fast/Math.max(1,calls.frames)).toFixed(0)} 次／人／幀（少 ${(red*100).toFixed(0)}%）`);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
