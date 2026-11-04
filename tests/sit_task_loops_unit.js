// 坐著做事的循環動作（NPC-ANIM-LOOPS-1104，LAWWW2-C 2026-11-04）：用遊戲自己的換算（character3d.js 的 ambClip／sitAmbient）
// 把 assets/models/char/second_ai/ual_sit_tasks.glb 的片段套到 VRoid 人物上、坐著跑，量手腕的位置，和產生片段的 tools/anim/sit_task_loops.py
// 在 VRoid 骨架上算的位置（ual_sit_tasks.json 的 expect）比——證明「遊戲換算回來就是我擺的樣子」，不需要瀏覽器。
//   ① 片段載得到：7 種 × 每一種身材（女生 F、男生 M、手臂短的女生骨架 F2、手臂長的男生骨架 M2；ual_sit_tasks.json 的 bodies）、每個 5 秒
//   ② 每一種身材的底模（F char.npc_f1、M char.npc_m1、F2 char.npc_nf10、M2 char.npc_nm11）打字、喝飲料、寫字、吃飯，0／1／2.35 秒：兩手手腕、右手中指根和預期的差 ≤ 2.5 cm（頭照遊戲自己的偏擺，不比）
//   ③ 打字的時候兩手手腕在桌面（0.75 m）上面 0～6 cm；喝飲料 2.35 秒右手腕比 0 秒高 6 cm 以上、杯緣靠嘴那一點離嘴 ≤ 1.5 cm（產生片段時在同一個骨架上量的，ual_sit_tasks.json 的 sip；②證明遊戲的骨架和那個一樣）
//   ④ 手上配件（assets/models/char/second_ai/hand_props.glb）：杯子、手機、筆、筷子四個都在；照遊戲的掛法（character3d.js propVis：複製到右手的真實骨頭、位置 0、不轉）掛上去量——
//      吃飯：筷子尖（GLB 裡離手腕最遠的那幾個頂點）和預期的差 ≤ 1.5 cm；1 秒（送到嘴邊）離嘴 ≤ 2.5 cm；0、2.35 秒在碗裡夾麵的那一點 ≤ 1.5 cm（碗：SEATACT S_meal 的麵碗，桌緣往裡 0.16）
//      寫字（NPC-ANIM-LOOPS 補件，LAWWW-C 11-04 21:42Z「筆尖壓進紙約 4～5 mm」）：2.35 秒（筆尖碰紙的那一格）筆最低的一點在紙面（桌面＋4.1 mm）下面不超過 1.5 mm、上面不超過 6 mm
// 量的時候把每個人自己的坐姿偏移、小動作、速度差關掉（只看片段本身）。測試用的掛勾：CHAR.SIT_AMB、CHAR._ambReset、ASSETS.manifest['char.ual_sit_clips']、ASSETS.manifest['prop.hand_props']。
// 用法（開發分支）：node tests/sit_task_loops_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const GLB='assets/models/char/second_ai/ual_sit_tasks.glb', JS=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/char/second_ai/ual_sit_tasks.json'),'utf8'));
const PGLB='assets/models/char/second_ai/hand_props.glb';
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm', mm=v=>(v*1000).toFixed(1)+' mm';
const DT=1/30, DESK=0.75, PAPER=0.0041;
const V3=a=>new THREE.Vector3(a[0],a[1],a[2]);
(async()=>{
  const KEYS={F:'char.npc_f1',M:'char.npc_m1',F2:'char.npc_nf10',M2:'char.npc_nm11'}, BODIES=Object.keys(JS.bodies).filter(b=>KEYS[b]);
  await preload(BODIES.map(b=>KEYS[b]));
  const K=CHAR.SIT_AMB; if(!K||!CHAR._ambReset){ check('0 遊戲有 NPC-AMBIENT-ANIM（CHAR.SIT_AMB）',false,'這個分支還沒有坐姿動作片段'); process.exit(1); }
  const man=ASSETS.manifest['char.ual_sit_clips']; man.url=GLB; window.ASSET_DATA[GLB]=fs.readFileSync(path.join(ROOT,GLB)).toString('base64');
  await ASSETS.loadOne('char.ual_sit_clips');
  const raw=ASSETS.getRaw('char.ual_sit_clips'), names=raw&&raw.animations?raw.animations.map(a=>a.name):[];
  const NCLIP=7*Object.keys(JS.bodies).length;
  check('① 片段載得到（'+NCLIP+' 個＝7 種 × '+Object.keys(JS.bodies).join('、')+'，每個 5 秒）',names.length===NCLIP&&raw.animations.every(a=>Math.abs(a.duration-5)<0.02),names.length+' 個：'+names.slice(0,3).join('、')+'…');
  /* 手上配件：遊戲的 ASSETS 那一筆（prop.hand_props）指到這個 GLB */
  let HP=null; const pm=ASSETS.manifest['prop.hand_props'];
  if(pm){ pm.url=PGLB; window.ASSET_DATA[PGLB]=fs.readFileSync(path.join(ROOT,PGLB)).toString('base64'); await ASSETS.loadOne('prop.hand_props'); const r=ASSETS.getRaw('prop.hand_props'); HP=r&&r.scene; }
  const PROPS=['hand_cup','hand_phone','hand_pen','hand_chopsticks'];
  check('④ 配件載得到（杯子、手機、筆、筷子）',!!HP&&PROPS.every(n=>HP.getObjectByName(n)),HP?PROPS.map(n=>n+(HP.getObjectByName(n)?'':'（沒有）')).join('、'):'沒有 prop.hand_props');
  const attach=(u,nm)=>{ const src=HP&&HP.getObjectByName(nm), bone=u.vrm&&u.vrm.humanoid.getRawBoneNode('rightHand'); if(!src||!bone) return null;
    const o=src.clone(true); o.position.set(0,0,0); o.quaternion.set(0,0,0,1); o.scale.set(1,1,1); bone.add(o); return o; };   /* 和遊戲 character3d.js propVis 一樣 */
  const verts=o=>{ const out=[]; o.updateMatrixWorld(true); o.traverse(m=>{ if(!m.isMesh) return; const pa=m.geometry.attributes.position; for(let i=0;i<pa.count;i++) out.push(new THREE.Vector3().fromBufferAttribute(pa,i).applyMatrix4(m.matrixWorld)); }); return out; };
  const tipOf=(o,bone)=>{ const bp=bone.getWorldPosition(new THREE.Vector3()), vs=verts(o); let mx=0; for(const v of vs) mx=Math.max(mx,v.distanceTo(bp));
    const far=vs.filter(v=>v.distanceTo(bp)>mx-0.006); return far.reduce((a,v)=>a.add(v),new THREE.Vector3()).multiplyScalar(1/far.length); };   /* 筷子尖＝離手腕最遠的那幾個頂點（兩支的尖端） */
  Object.assign(K,{baseRate:1,rate:0,headYaw:0,first:[1e9,1e9],gap:[1e9,1e9],posture:{lean:[0,0],side:[0,0],twist:[0,0],speed:K.posture.speed}});
  const E=JS.expect.pos, CH=JS.expect.chop||{};
  for(const B of BODIES){
    for(const kind of ['type','drink','write','eat']){
      const clip='Sit_'+kind[0].toUpperCase()+kind.slice(1)+'_'+B+'_Loop'; K.base=[clip]; CHAR._ambReset(); man.url=GLB;
      const h=CHAR.build({model:KEYS[B],height:JS.bodies[B].height}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
      const u=h.userData; for(let i=0;i<60;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); }
      const prop=kind==='eat'?attach(u,'hand_chopsticks'):(kind==='write'?attach(u,'hand_pen'):null), bone=u.vrm.humanoid.getRawBoneNode('rightHand');
      let worst=0, wb='', hy={}, tips={}, low={};
      for(const t of [0,1,2.35]){ const m=u.amb; m.t=t-DT; m.inW=1; CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
        const exp=E[B+'_'+kind+'_'+t.toFixed(2)]; if(!exp){ worst=9; wb='ual_sit_tasks.json 沒有 '+B+'_'+kind+'_'+t.toFixed(2); continue; }
        for(const [b,vb] of [['hand_r','rightHand'],['hand_l','leftHand'],['middle_01_r','rightMiddleProximal']]){
          const p=u.vrm.humanoid.getRawBoneNode(vb).getWorldPosition(new THREE.Vector3()); const e=exp[b]; const d=Math.hypot(p.x-e[0],p.y-e[1],p.z-e[2]);
          if(d>worst){ worst=d; wb=b+' @'+t+'s 遊戲 ('+[p.x,p.y,p.z].map(v=>v.toFixed(3)).join(',')+') 預期 ('+e.join(',')+')'; }
          if(b==='hand_r'||b==='hand_l') hy[b+t]=p.y; }
        if(prop&&kind==='eat') tips[t]=tipOf(prop,bone);
        if(prop&&kind==='write') low[t]=Math.min(...verts(prop).map(v=>v.y)); }
      check('② '+B+' '+kind+'：手腕、中指根和預期的差 ≤ 2.5 cm',worst<=0.025,'最大 '+cm(worst)+'（'+wb+'）');
      if(kind==='type') check('③ '+B+' 打字：手腕在桌面上面 0～6 cm',[0,1,2.35].every(t=>['hand_r','hand_l'].every(b=>hy[b+t]-DESK>=0&&hy[b+t]-DESK<=0.06)),'右手 '+cm(hy['hand_r0']-DESK)+'、左手 '+cm(hy['hand_l0']-DESK));
      if(kind==='drink'){ const sp=JS.expect.sip&&JS.expect.sip[B]; check('③ '+B+' 喝飲料：拿起來（2.35 秒右手腕比 0 秒高 6 cm 以上）、杯緣碰到嘴（≤ 1.5 cm）',hy['hand_r2.35']-hy['hand_r0']>=0.06&&sp&&sp.rim_near<=0.015,'手腕高了 '+cm(hy['hand_r2.35']-hy['hand_r0'])+'、杯緣離嘴 '+(sp?cm(sp.rim_near):'？')); }
      if(kind==='eat'){ const c=CH[B]||{}; let dTip=0, info=[];
        for(const t of [0,1,2.35]){ const e=c[t.toFixed(2)], g=tips[t]; if(!e||!g){ dTip=1; continue; } const d=g.distanceTo(V3(e.tip)); dTip=Math.max(dTip,d); info.push(t+'s 差 '+cm(d)); }
        check('④ '+B+' 吃飯：掛在右手的筷子尖和預期的差 ≤ 1.5 cm',!!prop&&dTip<=0.015,info.join('、')||'沒有筷子');
        const e1=c['1.00'], e0=c['0.00'], e2=c['2.35'];
        const dm=e1&&tips[1]?tips[1].distanceTo(V3(e1.mouth)):9, db0=e0&&tips[0]?tips[0].distanceTo(V3(e0.bowl)):9, db2=e2&&tips[2.35]?tips[2.35].distanceTo(V3(e2.bowl)):9;
        check('④ '+B+' 吃飯：1 秒筷子尖到嘴邊（≤ 2.5 cm）、0／2.35 秒在碗裡夾麵（≤ 1.5 cm）',dm<=0.025&&db0<=0.015&&db2<=0.015,'離嘴 '+cm(dm)+'、離碗裡那一點 '+cm(db0)+'／'+cm(db2)); }
      if(kind==='write'){ const g=low[2.35]; const dv=g!=null?g-(DESK+PAPER):9;
        check('④ '+B+' 寫字：筆尖碰紙那一格（2.35 秒）筆最低的一點在紙面下 ≤ 1.5 mm、上 ≤ 6 mm',!!prop&&dv>=-0.0015&&dv<=0.006,'紙面以上 '+mm(dv)+'（0、1 秒抬筆：'+[0,1].map(t=>low[t]!=null?mm(low[t]-DESK-PAPER):'？').join('、')+'）'); }
      if(prop&&prop.parent) prop.parent.remove(prop);
      scene.remove(h); CHAR.release&&CHAR.release(h);
    }
  }
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
