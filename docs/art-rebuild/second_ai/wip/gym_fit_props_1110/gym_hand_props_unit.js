// 健身中心手上的道具（GYM-FIT-PROPS-1103；GYM-FIT-ACTIVE-1103 合併後子代理截圖：彎舉、推舉、深蹲、划船都是空手）——不需要瀏覽器（D131）。
// 在 Node 裡載入遊戲的路人人物（npc_nm1 男、npc_nf1 女，spring_sim harness），照 character3d.js 的 gymIK 每一格擺骨頭，道具（gym_hand_props.glb）照手的位置擺：
//   1 彎舉、坐姿推舉：兩隻手各一個啞鈴、看得到；握把中心離手骨頭 ≤ 10 cm；啞鈴的軸線橫過拳頭（和前臂的夾角 ≥ 60°）；手上下動，啞鈴跟著動（上下 ≥ 15 cm）
//   2 深蹲：槓鈴一支、看得到；在兩手中間、肩膀後面（離兩肩中點 ≤ 25 cm）；水平、左右方向（和人物左方的夾角 ≤ 25°）
//   3 划船：拉把一支、看得到；中心離兩手中點 ≤ 3 cm；跟著手前後動（≥ 30 cm）
//   4 飛輪、拉筋：手上沒有東西；換回站著（idle）：全部藏起來；CHAR.release：拿掉（VRM 會被下一個人重用）
// 修改前（開發分支 9d4c54c16）：1～3 FAIL（沒有道具）。用法：node tests/gym_hand_props_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=['char.npc_nm1','char.npc_nf1'];
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm', rng=a=>Math.max(...a)-Math.min(...a);
const tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  await preload(keys.concat(ASSETS.manifest['prop.gym_hand']?['prop.gym_hand']:[]));   /* 道具的 GLB 也先讀進 ASSET_DATA（Node 沒有 fetch）*/
  const random0=Math.random; let sd=7; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.7, h=CHAR.build({model:key,height}); scene.add(h); h.position.set(4.2,0,-3); h.rotation.y=0.7; h.updateMatrixWorld(true);
    const R=n=>h.userData.vrm.humanoid.getRawBoneNode(n), W=n=>R(n).getWorldPosition(new THREE.Vector3());
    const props=()=>{ const o=[]; h.traverse(x=>{ if(/^gymProp:/.test(x.name||'')) o.push(x); }); return o; };
    const vis=()=>props().filter(x=>x.visible);
    const axisOf=o=>new THREE.Vector3(1,0,0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const LEFT=()=>new THREE.Vector3(1,0,0).applyQuaternion(h.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const run=async(pose,n,fn)=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose,speed:0}); if(i%10===0) await tick(); scene.updateMatrixWorld(true); if(fn) fn(i); } };
    await run('idle',20);
    await run('gym_curl',30); for(let i=0;i<60&&!(CHAR._gymProps&&CHAR._gymProps.scene);i++){ await tick(); await new Promise(r=>setTimeout(r,20)); }   /* 道具 lazy 載入 */
    console.log(`[${key}] 道具 ${CHAR._gymProps&&CHAR._gymProps.scene?'載好了':'沒載好'}`);
    for(const pose of ['gym_curl','gym_press']){ let far=0, cross=1, n=0; const ys=[]; let cnt=0;
      await run(pose,90,i=>{ const V=vis().filter(o=>/dd/.test(o.name)); cnt=Math.max(cnt,V.length); if(V.length<2||i<30) return; n++;
        for(const [j,side] of [[0,'left'],[1,'right']]){ const o=V[j], c=o.getWorldPosition(new THREE.Vector3()), hd=W(side+'Hand'); const d=Math.min(...V.map(q=>q.getWorldPosition(new THREE.Vector3()).distanceTo(hd))); far=Math.max(far,d);
          const fa=hd.clone().sub(W(side+'LowerArm')).normalize(), ax=axisOf(o); cross=Math.min(cross,1-Math.abs(fa.dot(ax))); if(j===0) ys.push(c.y); } });
      check(`1 [${key}] ${pose}：兩隻手各一個啞鈴、握在手上、橫過拳頭、跟著手動`, cnt===2&&n>0&&far<=0.10&&cross>=0.5&&rng(ys)>=0.15, `啞鈴 ${cnt} 個；離手骨頭最遠 ${cm(far)}；和前臂的夾角最小 ${(Math.acos(Math.max(0,Math.min(1,1-cross)))*180/Math.PI).toFixed(0)}°；上下 ${ys.length?cm(rng(ys)):'—'}`); }
    { let cnt=0, dmax=0, amin=1, n=0; await run('gym_squat',90,i=>{ const V=vis().filter(o=>/bar/.test(o.name)); cnt=Math.max(cnt,V.length); if(!V.length||i<30) return; n++; const c=V[0].getWorldPosition(new THREE.Vector3()), sh=W('leftUpperArm').add(W('rightUpperArm')).multiplyScalar(0.5);
        dmax=Math.max(dmax,c.distanceTo(sh)); amin=Math.min(amin,Math.abs(axisOf(V[0]).dot(LEFT()))); });
      check(`2 [${key}] 深蹲：槓鈴扛在肩膀後面、左右水平`, cnt===1&&n>0&&dmax<=0.25&&amin>=Math.cos(25*Math.PI/180), `槓鈴 ${cnt} 支；離兩肩中點最遠 ${cm(dmax)}；和左右方向的夾角最大 ${(Math.acos(Math.min(1,amin))*180/Math.PI).toFixed(0)}°`); }
    { let cnt=0, dmax=0, n=0; const zs=[]; await run('gym_row',120,i=>{ const V=vis().filter(o=>/row/.test(o.name)); cnt=Math.max(cnt,V.length); if(!V.length||i<30) return; n++; const c=V[0].getWorldPosition(new THREE.Vector3()), mid=W('leftHand').add(W('rightHand')).multiplyScalar(0.5);
        dmax=Math.max(dmax,c.distanceTo(mid)); zs.push(h.worldToLocal(c.clone()).z); });
      check(`3 [${key}] 划船：拉把在兩手中間、跟著前後拉`, cnt===1&&n>0&&dmax<=0.10&&rng(zs)>=0.30, `拉把 ${cnt} 支；離兩手中點最遠 ${cm(dmax)}（掌心比手骨頭往前一點）；前後 ${zs.length?cm(rng(zs)):'—'}`); }
    { let bad=0; for(const pose of ['gym_bike','gym_stretch']){ await run(pose,40,()=>{ if(vis().length) bad++; }); } await run('idle',10); const left=vis().length; CHAR.release(h); const after=props().length;
      check(`4 [${key}] 飛輪、拉筋手上沒東西；換回站著藏起來；release 拿掉`, bad===0&&left===0&&after===0, `飛輪、拉筋看得到道具 ${bad} 格；站著 ${left} 個；release 以後 ${after} 個`); }
    scene.remove(h); }
  Math.random=random0; console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
