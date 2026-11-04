// 坐著做事的循環動作（NPC-ANIM-LOOPS-1104，LAWWW2-C 2026-11-04）：用遊戲自己的換算（character3d.js 的 ambClip／sitAmbient）
// 把 assets/models/char/second_ai/ual_sit_tasks.glb 的片段套到 VRoid 人物上、坐著跑，量手腕的位置，和產生片段的 tools/anim/sit_task_loops.py
// 在 VRoid 骨架上算的位置（ual_sit_tasks.json 的 expect）比——證明「遊戲換算回來就是我擺的樣子」，不需要瀏覽器。
//   ① 片段載得到：14 個（7 種 × 女生、男生）、每個 5 秒
//   ② 女生（char.npc_f1）、男生（char.npc_m1）打字、喝飲料、寫字，0／1／2.35 秒：兩手手腕、右手中指根和預期的差 ≤ 2.5 cm（頭照遊戲自己的偏擺，不比）
//   ③ 打字的時候兩手手腕在桌面（0.75 m）上面 0～6 cm；喝飲料 2.35 秒右手腕比 0 秒高 6 cm 以上、杯緣靠嘴那一點離嘴 ≤ 1.5 cm（產生片段時在同一個骨架上量的，ual_sit_tasks.json 的 sip；②證明遊戲的骨架和那個一樣）
// 量的時候把每個人自己的坐姿偏移、小動作、速度差關掉（只看片段本身）。測試用的掛勾：CHAR.SIT_AMB、CHAR._ambReset、ASSETS.manifest['char.ual_sit_clips']。
// 用法（開發分支）：node tests/sit_task_loops_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const GLB='assets/models/char/second_ai/ual_sit_tasks.glb', JS=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/char/second_ai/ual_sit_tasks.json'),'utf8'));
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm';
const DT=1/30;
(async()=>{
  const KEYS={F:'char.npc_f1',M:'char.npc_m1'};
  await preload(Object.values(KEYS));
  const K=CHAR.SIT_AMB; if(!K||!CHAR._ambReset){ check('0 遊戲有 NPC-AMBIENT-ANIM（CHAR.SIT_AMB）',false,'這個分支還沒有坐姿動作片段'); process.exit(1); }
  const man=ASSETS.manifest['char.ual_sit_clips']; man.url=GLB; window.ASSET_DATA[GLB]=fs.readFileSync(path.join(ROOT,GLB)).toString('base64');
  await ASSETS.loadOne('char.ual_sit_clips');
  const raw=ASSETS.getRaw('char.ual_sit_clips'), names=raw&&raw.animations?raw.animations.map(a=>a.name):[];
  check('① 片段載得到（14 個、每個 5 秒）',names.length===14&&raw.animations.every(a=>Math.abs(a.duration-5)<0.02),names.length+' 個：'+names.slice(0,3).join('、')+'…');
  Object.assign(K,{baseRate:1,rate:0,headYaw:0,first:[1e9,1e9],gap:[1e9,1e9],posture:{lean:[0,0],side:[0,0],twist:[0,0],speed:K.posture.speed}});
  const E=JS.expect.pos;
  for(const B of ['F','M']){
    for(const kind of ['type','drink','write']){
      const clip='Sit_'+kind[0].toUpperCase()+kind.slice(1)+'_'+B+'_Loop'; K.base=[clip]; CHAR._ambReset(); man.url=GLB;
      const h=CHAR.build({model:KEYS[B],height:JS.bodies[B].height}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
      const u=h.userData; for(let i=0;i<60;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); }
      let worst=0, wb='', hy={};
      for(const t of [0,1,2.35]){ const m=u.amb; m.t=t-DT; m.inW=1; CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
        const exp=E[B+'_'+kind+'_'+t.toFixed(2)];
        for(const [b,vb] of [['hand_r','rightHand'],['hand_l','leftHand'],['middle_01_r','rightMiddleProximal']]){
          const p=u.vrm.humanoid.getRawBoneNode(vb).getWorldPosition(new THREE.Vector3()); const e=exp[b]; const d=Math.hypot(p.x-e[0],p.y-e[1],p.z-e[2]);
          if(d>worst){ worst=d; wb=b+' @'+t+'s 遊戲 ('+[p.x,p.y,p.z].map(v=>v.toFixed(3)).join(',')+') 預期 ('+e.join(',')+')'; }
          if(b==='hand_r'||b==='hand_l') hy[b+t]=p.y; } }
      check('② '+B+' '+kind+'：手腕、中指根和預期的差 ≤ 2.5 cm',worst<=0.025,'最大 '+cm(worst)+'（'+wb+'）');
      if(kind==='type') check('③ '+B+' 打字：手腕在桌面上面 0～6 cm',[0,1,2.35].every(t=>['hand_r','hand_l'].every(b=>hy[b+t]-0.75>=0&&hy[b+t]-0.75<=0.06)),'右手 '+cm(hy['hand_r0']-0.75)+'、左手 '+cm(hy['hand_l0']-0.75));
      if(kind==='drink'){ const sp=JS.expect.sip&&JS.expect.sip[B]; check('③ '+B+' 喝飲料：拿起來（2.35 秒右手腕比 0 秒高 6 cm 以上）、杯緣碰到嘴（≤ 1.5 cm）',hy['hand_r2.35']-hy['hand_r0']>=0.06&&sp&&sp.rim_near<=0.015,'手腕高了 '+cm(hy['hand_r2.35']-hy['hand_r0'])+'、杯緣離嘴 '+(sp?cm(sp.rim_near):'？')); }
      scene.remove(h); CHAR.release&&CHAR.release(h);
    }
  }
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
