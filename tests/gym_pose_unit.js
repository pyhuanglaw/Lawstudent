// 健身房的動作（GYM-USE-1103；使用者 11-03「你就設計健身房真的有人在用很難嗎」、更早「健身房新增了人 但是都不太會動 更詭異」）：
// 在 Node 裡載入遊戲的路人人物（不算圖），每個動作跑 6 秒（每格 1/30 秒），量真實骨架的關節（人物座標：x 往左、y 往上、z 往前；器材照 gym_b1_props.py 的尺寸）：
//   gym_squat   ① 臀部上下 ≥ 20 cm（真的蹲下去再站起來）② 腳踩住：腳踝離站著的位置 ≤ 3 cm ③ 兩手在肩膀兩側、比肩膀高（扛槓的位置）
//   gym_curl    ① 每隻手上下 ≥ 20 cm ② 左右輪流（兩手高度的相關係數 ≤ −0.5）③ 手肘留在身體旁邊（上臂往下）
//   gym_press   ① 兩手一起從肩膀推到頭上（每隻手上下 ≥ 15 cm、兩手相關 ≥ 0.9、最高的時候手比頭高）② 坐在臥推椅的座墊上（大腿根在座面 0.46 m 上面 3～12 cm）③ 腳踩地
//   gym_bike    ① 腳在曲柄的圓周上踩（腳踝上下 ≥ 25 cm、前後 ≥ 20 cm、左右差半圈）② 手握把手（離握點 ≤ 8 cm）③ 坐在座墊上（大腿根比座墊 0.985 m 高、不超過 12 cm）
//   gym_row     ① 臀部在滑軌上前後 ≥ 25 cm、手前後 ≥ 35 cm ② 腳一直踩在踏板上（≤ 3 cm）③ 坐在座位高度（大腿根在 0.40 m 上面 3～12 cm）
//   gym_stretch ① 頭動 ≥ 10 cm（往前彎或側彎）② 坐在墊子上（大腿根離地 3～20 cm）、腳踝在地上（≤ 12 cm）
// 每一個：一直做的時候每一格關節移動 ≤ 8 cm（30 fps）、從站姿換過來的第一秒 ≤ 15 cm（不瞬移、不翻面）、沒有 NaN；兩個人同一個動作不同步（速度、相位不同）；換回站著（idle）時人物放回原本的高度、前後。
// 備用人物（程序化，沒有 VRM）用這些動作名稱不會壞（照坐下／站著）。
// 修改前（沒有這些動作：當成站著的 idle）：①全部失敗。用法：node tests/gym_pose_unit.js [char.npc_nm1 char.npc_nf1 ...]
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.npc_nm1','char.npc_nf1'];
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm', rng=a=>Math.max(...a)-Math.min(...a), mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const corr=(x,y)=>{ const mx=mean(x), my=mean(y); let sxy=0,sxx=0,syy=0; for(let i=0;i<x.length;i++){ sxy+=(x[i]-mx)*(y[i]-my); sxx+=(x[i]-mx)**2; syy+=(y[i]-my)**2; } return sxy/Math.sqrt(sxx*syy||1e-12); };
const POSES=['gym_squat','gym_curl','gym_press','gym_bike','gym_row','gym_stretch'];
const JOINTS=['hips','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftHand','rightHand','head'];
(async()=>{
  await preload(keys);
  const random0=Math.random; let sd=7; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };   /* 速度、相位、拉筋的做法用到亂數：固定種子 */
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.7, mk=(x,yaw)=>{ const h=CHAR.build({model:key,height}); scene.add(h); h.position.set(x,0,-3); h.rotation.y=yaw; h.updateMatrixWorld(true); return h; };
    const h=mk(4.2,0.7);   /* 不在原點、有轉向：確認是在人物座標裡算 */
    const R=n=>h.userData.vrm.humanoid.getRawBoneNode(n), Lc=n=>h.worldToLocal(R(n).getWorldPosition(new THREE.Vector3()));
    const run=(pose,n,hh)=>{ hh=hh||h; const F=[]; for(let i=0;i<n;i++){ CHAR.animate(hh,1/30,{pose,speed:0}); scene.updateMatrixWorld(true); const v=hh.userData.vrm, f={}; for(const j of JOINTS){ const p=v.humanoid.getRawBoneNode(j).getWorldPosition(new THREE.Vector3()); f[j]=hh.worldToLocal(p); } F.push(f); } return F; };
    const idle=run('idle',40), st=idle[idle.length-1], k=h.userData.k||1;
    console.log(`[${key}] VRM ${h.userData.v0?'0.x':'1.0'}、身高比例 ${k.toFixed(3)}`);
    const out={};
    for(const pose of POSES){
      for(const n of [1,2]){ const F=run(pose,180); let jump=0, nan=false, prev=st, at='';
        let jin=0, atIn='';   /* jin：換過來的前 1 秒（從站姿轉過去）；jump：之後一直做的時候 */
        F.forEach((f,i)=>{ for(const j of JOINTS){ if(!isFinite(f[j].x+f[j].y+f[j].z)) nan=true; const d=f[j].distanceTo(prev[j]); if(i<30){ if(d>jin){ jin=d; atIn='第 '+i+' 格 '+j; } } else if(d>jump){ jump=d; at='第 '+i+' 格 '+j; } } prev=f; });
        if(n===1) out[pose]={F:F.slice(30),jump,at,jin,atIn,nan,gym:Object.assign({},h.userData.gym)};
        run('idle',40); }   /* 每個動作之間站回去（也測換回站著）*/
      const back=h.userData.model.position, by=h.userData.model.userData.baseY||0;
      if(pose==='gym_squat'||pose==='gym_press') check(`${key} ${pose} 換回站著：人物放回原本的高度、前後`,Math.abs(back.y-by)<1e-6&&Math.abs(back.z)<1e-6,cm(back.y-by)+'、'+cm(back.z));
    }
    const ys=(F,j)=>F.map(f=>f[j].y), zs=(F,j)=>F.map(f=>f[j].z);
    for(const pose of POSES){ const o=out[pose]; check(`${key} ${pose} 平滑、沒有 NaN（一直做的時候每一格關節最多移動 8 cm；從站姿換過來的第一秒最多 15 cm：手臂從垂著轉到器材上，不瞬移、不翻面）`,!o.nan&&o.jump<=0.08&&o.jin<=0.15,'之後最大 '+cm(o.jump)+'（'+o.at+'）、換過來 '+cm(o.jin)+'（'+o.atIn+'）'); }
    { const F=out.gym_squat.F, an=F.flatMap(f=>[f.leftFoot.distanceTo(st.leftFoot)-0*0,f.rightFoot.distanceTo(st.rightFoot)]);
      const anY=Math.max(...F.flatMap(f=>[Math.abs(f.leftFoot.y-st.leftFoot.y),Math.abs(f.rightFoot.y-st.rightFoot.y)]));
      const handOK=F.every(f=>[['leftHand','leftUpperArm',1],['rightHand','rightUpperArm',-1]].every(([hn,sn,s])=>f[hn].y>=f[sn].y-0.03&&s*f[hn].x>s*f[sn].x+0.12));
      check(`① ${key} gym_squat 真的蹲：臀部上下 ≥ 20 cm`,rng(ys(F,'hips'))>=0.2,cm(rng(ys(F,'hips'))));
      check(`② ${key} gym_squat 腳踩住地板：腳踝高度不變（≤ 2 cm）、往兩側站寬一點（≤ 6 cm）`,anY<=0.02&&Math.max(...an)<=0.06,'高度 '+cm(anY)+'、位置 '+cm(Math.max(...an)));
      check(`③ ${key} gym_squat 兩手在肩膀兩側、不低於肩膀（扛槓）`,handOK); }
    { const F=out.gym_curl.F, L=ys(F,'leftHand'), Rr=ys(F,'rightHand'), c=corr(L,Rr), el=F.every(f=>f.leftLowerArm.y<f.leftUpperArm.y-0.12*k&&f.rightLowerArm.y<f.rightUpperArm.y-0.12*k);
      check(`① ${key} gym_curl 每隻手上下 ≥ 20 cm`,rng(L)>=0.2&&rng(Rr)>=0.2,'左 '+cm(rng(L))+'、右 '+cm(rng(Rr)));
      check(`② ${key} gym_curl 左右輪流（相關 ≤ −0.5）`,c<=-0.5,c.toFixed(2));
      check(`③ ${key} gym_curl 手肘留在身體旁邊（比肩膀低 ≥ 12 cm）`,el); }
    { const F=out.gym_press.F, L=ys(F,'leftHand'), Rr=ys(F,'rightHand'), c=corr(L,Rr), top=Math.max(...F.map(f=>Math.min(f.leftHand.y,f.rightHand.y)-f.head.y));
      const seat=F.map(f=>(f.leftUpperLeg.y+f.rightUpperLeg.y)/2-0.46), feet=Math.max(...F.flatMap(f=>[f.leftFoot.y,f.rightFoot.y]));
      check(`① ${key} gym_press 兩手一起從肩膀推到頭上（每隻手 ≥ 15 cm、相關 ≥ 0.9、最高時手比頭高）`,rng(L)>=0.15&&rng(Rr)>=0.15&&c>=0.9&&top>0,'左 '+cm(rng(L))+'、相關 '+c.toFixed(2)+'、最高比頭高 '+cm(top));
      check(`② ${key} gym_press 坐在座墊上（大腿根在座面 0.46 m 上面 3～12 cm）`,seat.every(v=>v>=0.03&&v<=0.12),cm(Math.min(...seat))+'～'+cm(Math.max(...seat)));
      check(`③ ${key} gym_press 腳踩地（腳踝 ≤ 15 cm）`,feet<=0.15,cm(feet)); }
    { const F=out.gym_bike.F, G=CHAR.GYM.bike, ly=ys(F,'leftFoot'), lz=zs(F,'leftFoot'), c=corr(ly,ys(F,'rightFoot'));
      const grip=Math.max(...F.flatMap(f=>[f.leftHand.distanceTo(new THREE.Vector3(G.grip[0],G.grip[1],G.grip[2])),f.rightHand.distanceTo(new THREE.Vector3(-G.grip[0],G.grip[1],G.grip[2]))]));
      const seat=F.map(f=>(f.leftUpperLeg.y+f.rightUpperLeg.y)/2-G.seat[1]);
      check(`① ${key} gym_bike 腳在踩（腳踝上下 ≥ 25 cm、前後 ≥ 20 cm、左右差半圈：相關 ≤ −0.8）`,rng(ly)>=0.25&&rng(lz)>=0.2&&c<=-0.8,'上下 '+cm(rng(ly))+'、前後 '+cm(rng(lz))+'、相關 '+c.toFixed(2));
      check(`② ${key} gym_bike 手握把手（手腕離握點 ≤ 8 cm）`,grip<=0.08,cm(grip));
      check(`③ ${key} gym_bike 坐在座墊上（大腿根比座墊頂高 0～12 cm）`,seat.every(v=>v>=0&&v<=0.12),cm(Math.min(...seat))+'～'+cm(Math.max(...seat))); }
    { const F=out.gym_row.F, G=CHAR.GYM.row, hz=zs(F,'hips'), hand=zs(F,'leftHand');
      const ft=Math.max(...F.flatMap(f=>[f.leftFoot.distanceTo(new THREE.Vector3(G.feet[0],G.feet[1],G.feet[2])),f.rightFoot.distanceTo(new THREE.Vector3(-G.feet[0],G.feet[1],G.feet[2]))]));
      const seat=F.map(f=>(f.leftUpperLeg.y+f.rightUpperLeg.y)/2-G.seatY);
      check(`① ${key} gym_row 臀部在滑軌上前後 ≥ 25 cm、手前後 ≥ 35 cm`,rng(hz)>=0.25&&rng(hand)>=0.35,'臀部 '+cm(rng(hz))+'、手 '+cm(rng(hand)));
      check(`② ${key} gym_row 腳一直踩在踏板上（≤ 3 cm）`,ft<=0.03,cm(ft));
      check(`③ ${key} gym_row 坐在座位的高度（大腿根在 0.40 m 上面 3～12 cm）`,seat.every(v=>v>=0.03&&v<=0.12),cm(Math.min(...seat))+'～'+cm(Math.max(...seat))); }
    { const F=out.gym_stretch.F, hd=F.map(f=>f.head), mv=Math.max(rng(hd.map(p=>p.x)),rng(hd.map(p=>p.y)),rng(hd.map(p=>p.z)));
      const hip=F.map(f=>(f.leftUpperLeg.y+f.rightUpperLeg.y)/2), an=Math.max(...F.flatMap(f=>[f.leftFoot.y,f.rightFoot.y]));
      check(`① ${key} gym_stretch 上身真的在動（頭移動 ≥ 10 cm；這一位：${out.gym_stretch.gym.v?'兩腿張開側彎':'坐姿體前彎'}）`,mv>=0.1,cm(mv));
      check(`② ${key} gym_stretch 坐在墊子上（大腿根離地 3～20 cm）、腳在地上（腳踝 ≤ 12 cm）`,hip.every(v=>v>=0.03&&v<=0.2)&&an<=0.12,cm(Math.min(...hip))+'～'+cm(Math.max(...hip))+'、腳踝 '+cm(an)); }
    { /* 兩種拉筋都量：強制另一種 */ const g=h.userData.gym; run('gym_stretch',2); h.userData.gym.v=1-h.userData.gym.v; const F=run('gym_stretch',180).slice(30), hd=F.map(f=>f.head), mv=Math.max(rng(hd.map(p=>p.x)),rng(hd.map(p=>p.y)),rng(hd.map(p=>p.z)));
      check(`① ${key} gym_stretch 另一種（${h.userData.gym.v?'兩腿張開側彎':'坐姿體前彎'}）也在動（頭移動 ≥ 10 cm）`,mv>=0.1,cm(mv)); run('idle',30); }
    { /* 兩個人同一個動作：不同步 */ const h2=mk(-4,0); const A=[], B=[]; for(let i=0;i<120;i++){ CHAR.animate(h,1/30,{pose:'gym_curl',speed:0}); CHAR.animate(h2,1/30,{pose:'gym_curl',speed:0}); scene.updateMatrixWorld(true);
        A.push(Lc('leftHand').y); B.push(h2.worldToLocal(h2.userData.vrm.humanoid.getRawBoneNode('leftHand').getWorldPosition(new THREE.Vector3())).y); }
      const g1=h.userData.gym, g2=h2.userData.gym, dif=Math.max(...A.map((v,i)=>Math.abs(v-B[i])));
      check(`${key} 兩個人做同一個動作不同步（速度、起始相位不同；同一時間手的高度最多差 ≥ 10 cm）`,Math.abs(g1.rate-g2.rate)>1e-3&&dif>=0.1,'速度 '+g1.rate.toFixed(2)+'／'+g2.rate.toFixed(2)+'、最多差 '+cm(dif)); CHAR.release(h2); scene.remove(h2); }
    CHAR.release(h); scene.remove(h);
  }
  { /* 備用人物（程序化，沒有 VRM）：收到的是坐下／站著（P3.animate 不認得健身房的動作名稱）*/ const P3a=P3.animate, got=[]; P3.animate=(hh,dt,st)=>got.push(st.pose);
    for(const pose of POSES) CHAR.animate({userData:{driver:'proc'}},1/30,{pose,speed:0}); P3.animate=P3a;
    check('備用人物（程序化）：坐在器材上的照坐下、站著的照站著',got.join(',')==='idle,idle,sit,sit,sit,sit',got.join(',')); }
  Math.random=random0;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
