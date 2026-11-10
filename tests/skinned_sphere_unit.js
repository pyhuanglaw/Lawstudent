// PERF-XS-NPC-1108 (D)：新的人物第一次出現時的卡頓（C.presetSphere）。LAWWW2-B 2026-11-09。
//   大口 1F CPU 效能紀錄（CC-B CPUTRACE_8172_dakou）兩次 117 ms＝projectObject → SkinnedMesh.computeBoundingSphere → applyBoneTransform。
//   three.js 畫面排序（renderer.sortObjects，預設開）在 SkinnedMesh 的 boundingSphere 還是 null 時呼叫 computeBoundingSphere()——frustumCulled=false 也一樣——
//   逐頂點套骨頭。CHAR.build 出來的 VRM（池裡第一個、新的 clone）每個蓋皮網格都是 null：第一次畫的那一幀每個人物約 40～60 ms。
//   在 Node 載入遊戲的 three.js／three-vrm／CHAR。主角＋四位女主角＋兩個路人底模＋兩個有遠距離版本的路人底模，每個建兩個（池裡第一個、clone），切到遠距離版本。
//   「第一次畫」照 three.js projectObject 的做法：看得到的 SkinnedMesh，boundingSphere 是 null 就 computeBoundingSphere()。
//   ① C.presetSphere 存在、預設 true；
//   ② 建好以後：每個看得到的不透明蓋皮網格（含遠距離版本）都已經有 boundingSphere；透明的（眉毛、眼線、高光、睫毛、後髮）一個都沒有動（還是 null）；
//   ③ 第一次畫：只有透明的網格要算，花的時間比原本（C.presetSphere=false）少 ≥ 75%；
//   ④ 透明網格第一次畫時算出來的包圍球和原本完全一樣（同一個姿勢、同一幀；畫的先後不變）；
//   ⑤ 給的包圍球包住那個網格每一個靜止頂點；同一個模型的 clone 拿到和池裡第一個一樣的（每個幾何只算一次）；
//   ⑥ 包圍球只拿來排先後：遊戲裡沒有對蓋皮網格做射線（character3d 的地面射線、門、對話牆都排除蓋皮網格），frustumCulled 全部是 false。
//   用法：node tests/skinned_sphere_unit.js [char.npc_f1 …]（harness 和 tests/sit_feet_fast_unit.js、npc_far_unit.js 同一套）
const fs=require('fs'), path=require('path');
const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const anonLod=Object.keys(ASSETS.manifest).filter(k=>ASSETS.manifest[k].anon&&ASSETS.lodUrl&&ASSETS.lodUrl(k)&&fs.existsSync(path.join(ROOT,ASSETS.lodUrl(k)))).slice(0,2);   // 有遠距離版本的路人底模
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_04','char.heroine_05','char.npc_f1','char.npc_m1',...anonLod];
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const scene=new THREE.Scene(); const ground=()=>0;
const transp=o=>[].concat(o.material).some(m=>m&&m.transparent);
const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
const skinned=h=>{ const a=[]; h.traverse(o=>{ if(o.isSkinnedMesh) a.push(o); }); return a; };
const SP=THREE.SkinnedMesh.prototype, cbs0=SP.computeBoundingSphere; let cbsMs=0, cbsN=0;
SP.computeBoundingSphere=function(){ const t=process.hrtime.bigint(); const r=cbs0.apply(this,arguments); cbsMs+=Number(process.hrtime.bigint()-t)/1e6; cbsN++; return r; };
const firstDraw=h=>{ scene.updateMatrixWorld(true); const m0=cbsMs, n0=cbsN, who=[]; for(const o of skinned(h)){ if(!shown(o)) continue; if(o.skeleton) o.skeleton.update(); if(o.boundingSphere===null){ o.computeBoundingSphere(); who.push(o); } } return {ms:cbsMs-m0,n:cbsN-n0,who}; };
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of keys){ const u=ASSETS.lodUrl&&ASSETS.lodUrl(k); if(u&&fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }   // 遠距離版本（同 npc_far_unit）
  await preload(keys.filter(k=>ASSETS.manifest[k]));
  check('① C.presetSphere 存在、預設 true',CHAR.presetSphere===true,String(CHAR.presetSphere));
  CHAR.ambRand=()=>0.37;
  const R={before:{ms:0,n:0},after:{ms:0,n:0}}; let opaqueNull=[], transTouched=[], afterOpaque=[], sphereDiff=0, sphereDiffAt='', contain=0, containAt='', cloneSame=true, nOpaque=0, nTrans=0, nFar=0, fc=[];
  for(const key of keys){ if(!ASSETS.manifest[key]){ console.log('跳過（manifest 沒有）',key); continue; }
    const height=ASSETS.manifest[key].height||1.65;
    // 原本的做法：建兩個（池裡第一個、clone），站好、走幾步，第一次畫；記下透明網格算出來的包圍球
    const run=(preset)=>{ CHAR.presetSphere=preset; const H=[CHAR.build({model:key,height}),CHAR.build({model:key,height})];
      H.forEach((h,i)=>{ scene.add(h); h.position.set(3+i*2,0,-2); h.rotation.set(0,0.7,0); });
      const pre=H.map(h=>skinned(h).map(o=>({o,had:o.boundingSphere!==null})));
      for(let f=0;f<20;f++) for(const h of H) CHAR.animate(h,1/30,{pose:f<10?'idle':'walk',speed:f<10?0:1.3,ground});
      const near=H.map(firstDraw); const far=H.map(h=>{ const ok=CHAR.setFar(h,true); const r=ok?firstDraw(h):{ms:0,n:0,who:[]}; if(ok) CHAR.setFar(h,false); return r; });
      const trans=H.map(h=>skinned(h).filter(o=>transp(o)&&o.boundingSphere).map(o=>({name:o.name,c:o.boundingSphere.center.clone(),r:o.boundingSphere.radius})));
      return {H,pre,near,far,trans}; };
    const clear=H=>{ for(const h of H){ for(const o of skinned(h)) o.boundingSphere=null; scene.remove(h); CHAR.release(h); } };   // 池裡的實例會重用：清掉包圍球，下一輪才是「新的」
    const A=run(false); for(const r of [...A.near,...A.far]){ R.before.ms+=r.ms; R.before.n+=r.n; } const transA=A.trans; clear(A.H);
    CHAR.ambRand=()=>0.37;
    const B=run(true);
    for(const r of [...B.near,...B.far]){ R.after.ms+=r.ms; R.after.n+=r.n; for(const o of r.who) if(!transp(o)) afterOpaque.push(`${key} ${o.name}`); }
    B.pre.forEach((list,i)=>{ for(const {o,had} of list){ if(!o.visible&&o.name!=='npc_far') continue; if(o.name==='npc_far') nFar++; if(transp(o)){ nTrans++; if(had) transTouched.push(`${key}#${i} ${o.name}`); } else { nOpaque++; if(!had) opaqueNull.push(`${key}#${i} ${o.name}`); } if(o.frustumCulled) fc.push(`${key} ${o.name}`); } });
    // ④ 透明網格的包圍球：和原本一模一樣（同一個姿勢序列、同一幀）
    B.trans.forEach((list,i)=>list.forEach((t,j)=>{ const a=transA[i]&&transA[i][j]; const d=a&&a.name===t.name?Math.max(a.c.distanceTo(t.c),Math.abs(a.r-t.r)):Infinity; if(d>sphereDiff){ sphereDiff=d; sphereDiffAt=`${key}#${i} ${t.name}`; } }));
    // ⑤ 包住每一個靜止頂點；clone 和池裡第一個一樣
    const s0=skinned(B.H[0]), s1=skinned(B.H[1]);
    for(const o of [...s0,...s1]){ if(transp(o)||!o.boundingSphere) continue; const p=o.geometry.attributes.position, v=new THREE.Vector3(); for(let k=0;k<p.count;k++){ const e=o.boundingSphere.center.distanceTo(v.fromBufferAttribute(p,k))-o.boundingSphere.radius; if(e>contain){ contain=e; containAt=`${key} ${o.name}`; } } }
    s0.forEach((o,k)=>{ const c=s1[k]; if(!c||transp(o)||!o.boundingSphere||!c.boundingSphere) return; if(c.geometry!==o.geometry||c.boundingSphere.center.distanceTo(o.boundingSphere.center)>0||c.boundingSphere.radius!==o.boundingSphere.radius) cloneSame=false; });
    clear(B.H); CHAR.presetSphere=true; }
  SP.computeBoundingSphere=cbs0;
  check('② 建好以後：不透明的蓋皮網格都有包圍球、透明的都沒動',opaqueNull.length===0&&transTouched.length===0&&nOpaque>0&&nTrans>0,
    `不透明 ${nOpaque} 個（遠距離版本 ${nFar}）沒有的 ${opaqueNull.length}${opaqueNull.length?'：'+opaqueNull.slice(0,4).join('、'):''}；透明 ${nTrans} 個被動到的 ${transTouched.length}${transTouched.length?'：'+transTouched.slice(0,4).join('、'):''}`);
  const red=R.before.ms?1-R.after.ms/R.before.ms:0;
  check('③ 第一次畫：只有透明的要算，時間少 ≥ 75%',afterOpaque.length===0&&red>=0.75,
    `原本 ${R.before.n} 個 ${R.before.ms.toFixed(0)} ms → ${R.after.n} 個 ${R.after.ms.toFixed(1)} ms（少 ${(red*100).toFixed(0)}%；${keys.length} 個模型 × 2 個實例＋遠距離版本）${afterOpaque.length?'；還在算的不透明：'+afterOpaque.slice(0,4).join('、'):''}`);
  check('④ 透明網格（臉、後髮）第一次畫時的包圍球和原本一樣（畫的先後不變）',sphereDiff<1e-9,`最大差 ${sphereDiff===Infinity?'對不上':sphereDiff.toExponential(1)}${sphereDiffAt?'（'+sphereDiffAt+'）':''}`);
  check('⑤ 包住每一個靜止頂點；同一個模型的 clone 和池裡第一個一樣',contain<1e-5&&cloneSame,`超出最多 ${contain.toExponential(1)} m${containAt?'（'+containAt+'）':''}；clone 一樣 ${cloneSame}`);
  // ⑥ 原始碼：蓋皮網格不做射線、frustumCulled 都關
  const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8'); const ch=src('src/character3d.js'), dr=src('src/door3d.js');
  const rayOk=/o\.isMesh&&!o\.isSkinnedMesh&&!o\.isInstancedMesh/.test(ch)&&/m\.isSkinnedMesh\|\|m\.isInstancedMesh/.test(dr);
  check('⑥ 包圍球只用來排先後：蓋皮網格不做射線、frustumCulled 全部 false',rayOk&&fc.length===0,`射線排除蓋皮網格 ${rayOk}；frustumCulled 開著的 ${fc.length}`);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
