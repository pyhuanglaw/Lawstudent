// 路人的遠距離版本（PERF-CROWD-LOD-1021，LAWWW2 2026-10-21）：在 Node 裡載入遊戲的 three.js／three-vrm／ASSETS／CHAR（不算圖），檢查
//   ① 無名路人底模載入時一起載到 lod/<檔名>.lod.glb；
//   ② CHAR.build 出來的每個人（第一個實例＝原本的 VRM、之後＝骨架複製品）都綁上遠距離版本，預設藏著；
//   ③ 綁對骨頭：走路動畫走一段以後，遠距離版本的每個頂點（CPU 算蒙皮）都貼在原本模型的頂點上（減面只拿掉頂點、不搬動，綁錯骨頭或反向綁定矩陣會差幾公分到幾十公分）；
//   ④ CHAR.setFar 切換：遠＝原本的網格藏起來、遠距離版本顯示，近＝反過來；CHAR.farOff（網址 ?nofar）時一律近；
//   ⑤ CHAR.release：遠距離版本拿掉、原本的網格恢復顯示；同一個 VRM 再借出去時不會留下舊的遠距離網格；
//   ⑥ engine3d.js 的 NPC 迴圈（路人 isExtra）和騎車的路人（E.extras）照距離切換、16.5／18 m 兩個門檻（PERF-PATROL-ECON-1025，原本 28／30 m）；
//   ⑦ 每個 anon 底模都有遠距離版本的檔案，網格 2 個、三角形 ≤ 原本的 30%。
//   ⑧ 明暗照 MToon：遠距離版本的明暗漸層（MeshToonMaterial 的 gradientMap）每一格＝用這個人自己的 MToon 材質（套過 C.LOOK）在同一個入射角算的 mix(陰影色, 受光色, shading)÷受光色；
//      皮膚的頂點乘皮膚材質的顏色（C.LOOK 的膚色）。
// 用法：node tests/npc_far_unit.js [char.npc_nf1 char.npc_nm3 …]
const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.npc_nf1','char.npc_nm3'];
const scene=new THREE.Scene();
function skinned(meshes){ const out=[]; const v=new THREE.Vector3(); for(const m of meshes){ m.updateMatrixWorld(true); m.skeleton.update(); const n=m.geometry.attributes.position.count; for(let i=0;i<n;i++){ m.getVertexPosition(i,v); v.applyMatrix4(m.matrixWorld); out.push(v.x,v.y,v.z); } } return new Float32Array(out); }
function nearestStats(A,B){ // A 的每個點到 B 最近的點（格子加速）
  const cell=0.02, grid=new Map(), key=(x,y,z)=>x+','+y+','+z; for(let j=0;j<B.length;j+=3){ const k=key(Math.floor(B[j]/cell),Math.floor(B[j+1]/cell),Math.floor(B[j+2]/cell)); let a=grid.get(k); if(!a) grid.set(k,a=[]); a.push(j); }
  let max=0, sum=0, n=0; for(let i=0;i<A.length;i+=3){ const cx=Math.floor(A[i]/cell), cy=Math.floor(A[i+1]/cell), cz=Math.floor(A[i+2]/cell); let best=1e9;
    for(let r=1;r<=6&&best>(r-1)*cell;r++){ best=1e9; for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++) for(let dz=-r;dz<=r;dz++){ const a=grid.get(key(cx+dx,cy+dy,cz+dz)); if(!a) continue; for(const j of a){ const d=Math.hypot(A[i]-B[j],A[i+1]-B[j+1],A[i+2]-B[j+2]); if(d<best) best=d; } } }
    if(best>=1e9) best=1; max=Math.max(max,best); sum+=best; n++; }
  return {max,mean:sum/Math.max(1,n)}; }
(async()=>{
  // ⑦ 每個 anon 底模都有遠距離版本
  const anon=Object.keys(ASSETS.manifest).filter(k=>ASSETS.manifest[k].anon); let miss=[], bad=[];
  for(const k of anon){ const u=ASSETS.lodUrl&&ASSETS.lodUrl(k); const f=u&&path.join(ROOT,u); if(!f||!fs.existsSync(f)){ miss.push(k); continue; }
    const b=fs.readFileSync(f), n=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+n).toString()); const prims=J.meshes.reduce((s,m)=>s+m.primitives.length,0); const tris=J.meshes.reduce((s,m)=>s+m.primitives.reduce((t,p)=>t+J.accessors[p.indices].count/3,0),0);
    const vb=fs.readFileSync(path.join(ROOT,ASSETS.manifest[k].url)), vn=vb.readUInt32LE(12), VJ=JSON.parse(vb.slice(20,20+vn).toString()); const vt=VJ.meshes.reduce((s,m)=>s+m.primitives.reduce((t,p)=>t+VJ.accessors[p.indices].count/3,0),0);
    if(prims!==2||tris>0.3*vt) bad.push(`${k} ${prims} 個網格 ${tris}/${vt} 三角形`); }
  check(`每個 anon 底模（${anon.length} 個）都有遠距離版本的檔案`,anon.length>0&&!miss.length,miss.slice(0,4).join('、'));
  check('遠距離版本都是 2 個網格、三角形 ≤ 原本的 30%',!bad.length,bad.slice(0,3).join('；'));
  // ① 載入
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of keys){ const u=ASSETS.lodUrl&&ASSETS.lodUrl(k); if(u&&fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }
  await preload(keys);
  for(const k of keys){
    const c=ASSETS.cache[k]; check(`${k}：載入時一起載到遠距離版本`,!!(c&&c.lod),c&&c.lod?`${c.lod.parts.length} 個網格、${c.lod.names.length} 根骨頭`:'沒有');
    const hs=[CHAR.build({id:'x901',model:k,height:1.65,sex:'f'}),CHAR.build({id:'x902',model:k,height:1.65,sex:'f'})];
    // ⑧ 明暗照 MToon（用另一套算法：每個材質各算一條再平均）
    if(c&&c.lod){ const mats=[]; hs[0].traverse(o=>{ if(o.isMesh) for(const mt of [].concat(o.material)) if(mt&&mt.isMToonMaterial&&!mt.isOutline) mats.push(mt); });
      const lum=x=>0.2126*x.r+0.7152*x.g+0.0722*x.b, ls=(a,b,t)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
      const want=(re,d)=>{ const ms=mats.filter(mt=>re.test(mt.name)); let v=0; for(const mt of ms){ const s=ls(-1+mt.shadingToonyFactor,1-mt.shadingToonyFactor,d+mt.shadingShiftFactor), r=lum(mt.shadeColorFactor)/lum(mt.color); v+=r+(1-r)*s; } return ms.length?v/ms.length:NaN; };
      let worst=0; const info=[]; for(const p of c.lod.parts){ const g=p.toon&&p.toon.gradientMap; if(!g){ worst=9; continue; } const a=g.image.data, N=g.image.width, body=!!p.geo.attributes.color, re=body?/_CLOTH/:/HAIR/;
        for(let i=0;i<N;i++){ const d=(i+0.5)/N*2-1, w=want(re,d); worst=Math.max(worst,isNaN(w)?9:Math.abs(a[i]/255-w)); } info.push(`${body?'身體':'頭髮'}陰影面 ${(a[0]/255).toFixed(2)}`); }
      const skinMat=mats.find(mt=>/_SKIN/.test(mt.name)), sk=c.lod.parts[0].geo.userData.skinK;
      const okSkin=!!skinMat&&!!sk&&Math.abs(sk[0]-skinMat.color.r)<1e-6&&Math.abs(sk[1]-skinMat.color.g)<1e-6&&Math.abs(sk[2]-skinMat.color.b)<1e-6;
      check(`${k}：遠距離版本的明暗＝這個人 MToon 材質算出來的（每一格差 ≤ 0.02）、皮膚乘 C.LOOK 的膚色`,worst<=0.02&&okSkin,`最大差 ${worst.toFixed(3)}；${info.join('、')}；皮膚 ${sk?sk.map(x=>x.toFixed(3)).join(','):'沒有'}`); }
    for(const [i,h] of hs.entries()){ const who=`${k} 第 ${i+1} 個（${h.userData.full?'原本的 VRM':'骨架複製品'}）`; const u=h.userData, f=u.farLOD;
      check(`${who}：綁上遠距離版本、預設藏著`,!!f&&f.parts.length===2&&f.near.length>=10&&f.parts.every(p=>!p.visible)&&f.near.every(o=>o.visible),f?`遠 ${f.parts.length}、原本 ${f.near.length} 個網格`:'沒有');
      if(!f) continue;
      // ③ 綁對骨頭：走一段路（走路動畫）再比頂點
      h.position.set(i*3,0,0); h.rotation.y=0.7; scene.add(h); for(let t=0;t<1.35;t+=1/30) CHAR.animate(h,1/30,{pose:'walk',speed:1.4}); scene.updateMatrixWorld(true);
      const far=skinned(f.parts), near=skinned(f.near); const st=nearestStats(far,near);
      check(`${who}：走路時遠距離版本貼在原本模型上（每個頂點離原本的頂點 < 1 cm）`,st.max<0.01,`最遠 ${(st.max*100).toFixed(2)} cm、平均 ${(st.mean*1000).toFixed(2)} mm、${far.length/3} 個頂點`);
      // ④ 切換
      if(!CHAR.setFar){ check(`${who}：CHAR.setFar 存在`,false); continue; }
      CHAR.setFar(h,true); const okFar=u.isFar&&f.near.every(o=>!o.visible)&&f.parts.every(p=>p.visible); CHAR.setFar(h,false); const okNear=!u.isFar&&f.near.every(o=>o.visible)&&f.parts.every(p=>!p.visible);
      CHAR.farOff=true; CHAR.setFar(h,true); const okOff=!u.isFar&&f.near.every(o=>o.visible); CHAR.farOff=false;
      check(`${who}：setFar 遠／近切換；farOff（?nofar）時一律近`,okFar&&okNear&&okOff);
      // ⑦ 遠的不跑彈簧骨（LAWWW 10-21 20:55 同意的做法）：只有原本的 VRM 有彈簧骨（骨架複製品本來就沒有）
      if(u.full&&u.vrm&&u.vrm.springBoneManager&&!u.vrm.lite){ const sbm=u.vrm.springBoneManager, orig=sbm.update; let n=0; sbm.update=function(){ n++; return orig.apply(this,arguments); };
        CHAR.setFar(h,true); for(let t=0;t<10;t++) CHAR.animate(h,1/30,{pose:'walk',speed:1.4}); const nFar=n; CHAR.setFar(h,false); n=0; for(let t=0;t<10;t++) CHAR.animate(h,1/30,{pose:'walk',speed:1.4}); const nNear=n; sbm.update=orig;
        check(`${who}：遠的時候不跑彈簧骨（10 格 0 次）、近的時候照跑`,nFar===0&&nNear>0,`遠 ${nFar} 次、近 ${nNear} 次`); }
    }
    // ⑤ 放掉：遠距離網格拿掉、原本的網格恢復顯示；同一個 VRM 再借出去不會留下舊的遠距離網格
    if(!CHAR.setFar||hs.some(h=>!h.userData.farLOD)){ check(`${k}：release／再借出去（沒有遠距離版本，不能檢查）`,false); hs.forEach(h=>{ scene.remove(h); CHAR.release(h); }); continue; }
    const kept=hs.map(h=>{ CHAR.setFar(h,true); return {parts:h.userData.farLOD.parts,near:h.userData.farLOD.near}; }); hs.forEach(h=>{ scene.remove(h); CHAR.release(h); });
    check(`${k}：release 以後遠距離網格拿掉、原本的網格恢復顯示`,kept.every(x=>x.parts.every(p=>!p.parent)&&x.near.every(o=>o.visible)));
    const h3=CHAR.build({id:'x903',model:k,height:1.65,sex:'f'}); let nFar=0; h3.traverse(o=>{ if(o.name==='npc_far') nFar++; });
    check(`${k}：同一個 VRM 再借出去，遠距離網格剛好 2 個（沒有留下上一個人的）`,nFar===2&&!!h3.userData.farLOD,`${nFar} 個`); CHAR.release(h3);
  }
  // ⑥ engine3d.js 的接法（原始碼）：路人 isExtra、騎車的路人都照距離切換，兩個門檻
  const e=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
  check('engine3d.js：NPC 迴圈的路人照鏡頭距離切換（室外遠 18 m、回到 16.5 m 才換回來——PERF-PATROL-ECON-1025，原本 30／28 m；室內 7／6.5 m 見 crowd_far_indoor_unit.js）',/if\(n\.isExtra&&o\.userData\.farLOD\) CHAR\.setFar\(o,farWant\(!!o\.userData\.isFar,cd,!!E\.indoor\)\)/.test(e)&&CHAR.FAR_OUT===18&&CHAR.FAR_IN===16.5);
  check('engine3d.js：騎腳踏車的路人（E.extras）同一套',/const rd=x\.rider; if\(rd&&rd\.userData&&rd\.userData\.farLOD&&x\.obj\)\{[^}]*CHAR\.setFar\(rd,rd\.userData\.isFar\?cd>CHAR\.FAR_IN:cd>CHAR\.FAR_OUT\)/.test(e));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
