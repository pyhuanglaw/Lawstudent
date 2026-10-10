// 彈簧骨回歸檢查：每位角色站著 vs 走路（人物移動）vs 瞬移之後，頭髮末端相對頭骨的平均高度。
// 走路、低幀率（0.3 秒一幀）時髮尾不應該比站著高很多（v9.3 #25：修正前林芷若高 12–16 cm）。
// 用法：node tools/dev_scratch/spring_sim/sim_hair.js [char.heroine_02 ...]
const {preload}=require('./harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_03','char.heroine_04','char.heroine_05'];
const scene=new THREE.Scene(); let worstAll=0;
(async()=>{
  await preload(keys);
  for(const key of keys){ const res=[];
    for(const dt of [1/30,0.3]){
      const h=CHAR.build({model:key}); scene.add(h); const vrm=h.userData.vrm, sbm=vrm.springBoneManager; const head=vrm.humanoid.getRawBoneNode('head');
      const tips=[...sbm.joints].filter(j=>!j.child&&!/Bust|Skirt|Sleeve/.test(j.bone.name));
      const mean=()=>{ scene.updateMatrixWorld(true); const hp=new THREE.Vector3(); head.getWorldPosition(hp); const ys=tips.map(j=>{ const p=new THREE.Vector3(); j.bone.getWorldPosition(p); return p.y-hp.y; }); return ys.reduce((a,b)=>a+b,0)/ys.length; };
      let t=0; while(t<2){ CHAR.animate(h,dt,{pose:'idle',speed:0}); t+=dt; } const idle=mean();
      h.position.set(3,0,-2); h.rotation.y=-1.57; CHAR.animate(h,dt,{pose:'idle',speed:0}); const tele=mean();
      let worst=-9; t=0; while(t<3){ h.position.x-=1.35*dt; CHAR.animate(h,dt,{pose:'walk',speed:1.35}); t+=dt; worst=Math.max(worst,mean()); }
      worstAll=Math.max(worstAll,worst-idle,tele-idle);
      res.push(`dt ${dt.toFixed(3)}: 站著 ${idle.toFixed(3)} 瞬移後 ${tele.toFixed(3)} 走路最高 ${worst.toFixed(3)}`);
      scene.remove(h); CHAR.release(h);
    }
    console.log(key.padEnd(16), res.join(' | '));
  }
  console.log(worstAll<0.02?'PASS':'FAIL', '走路／瞬移時髮尾最多比站著高', worstAll.toFixed(3),'m');
  process.exit(worstAll<0.02?0:1);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
