/* ===== 人物層（CHARACTER LAYER）
   gameplay / engine 只呼叫 CHAR.build / CHAR.animate / CHAR.setExpr / CHAR.headY。
   driver 'glb'：rigged GLB（Mixamo 相容骨架，例如 Ready Player Me）＋ Mixamo 動畫（rest-pose 補償重定向）
   driver 'proc'：P3 程序化人物（PLACEHOLDER_CHARACTER） ===== */
'use strict';
const CHAR = (function(){
  const C={};
  const POSE_CLIP={idle:'idle',walk:'walk',run:'run',talk:'idle',wave:'idle',sit:null,read:null};
  // ---- 重定向：以兩個骨架的 rest pose 世界旋轉補償 bind pose 差異（來源：Mixamo 命名 mixamorigX → 目標 X）----
  function restMap(root){ root.updateMatrixWorld(true); const m=new Map(); root.traverse(o=>{ const wq=new THREE.Quaternion(); o.getWorldQuaternion(wq); m.set(o.name,{wq,node:o}); }); return m; }
  C.retargetClipSimple=function(clip,srcRoot,dstRoot,opts){ opts=opts||{}; const S=restMap(srcRoot), D=restMap(dstRoot); const tracks=[]; const tmpQ=new THREE.Quaternion(), q=new THREE.Quaternion();
    for(const t of clip.tracks){ const m=t.name.match(/^(.+)\.(quaternion|position)$/); if(!m) continue; const srcName=m[1]; const dstName=srcName.replace(/^mixamorig:?/,''); const s=S.get(srcName), d=D.get(dstName); if(!s||!d) continue;
      if(m[2]==='position'){ if(dstName!=='Hips') continue; const sp=s.node.position, dp=d.node.position; const sc=opts.posScale||1; const vals=new Float32Array(t.values.length); for(let i=0;i<t.times.length;i++){ vals[i*3]=dp.x; vals[i*3+1]=dp.y+(t.values[i*3+1]-sp.y)*sc; vals[i*3+2]=dp.z; } tracks.push(new THREE.VectorKeyframeTrack(dstName+'.position',Array.from(t.times),Array.from(vals))); continue; }
      const spW=new THREE.Quaternion(); if(s.node.parent) s.node.parent.getWorldQuaternion(spW); const dpW=new THREE.Quaternion(); if(d.node.parent) d.node.parent.getWorldQuaternion(dpW); const sInv=s.wq.clone().invert(); const dpInv=dpW.clone().invert();
      const vals=new Float32Array(t.values.length); for(let i=0;i<t.times.length;i++){ q.set(t.values[i*4],t.values[i*4+1],t.values[i*4+2],t.values[i*4+3]); tmpQ.copy(spW).multiply(q).multiply(sInv); tmpQ.premultiply(dpInv).multiply(d.wq); vals[i*4]=tmpQ.x; vals[i*4+1]=tmpQ.y; vals[i*4+2]=tmpQ.z; vals[i*4+3]=tmpQ.w; }
      tracks.push(new THREE.QuaternionKeyframeTrack(dstName+'.quaternion',Array.from(t.times),Array.from(vals))); }
    return new THREE.AnimationClip(clip.name,clip.duration,tracks); };
  /* 重定向 v2：來源（Mixamo，T-pose、骨頭沿 +X）→ 目標（例如 Ready Player Me，A-pose、骨頭沿 +Y）。
     方法：每個 frame 沿階層計算來源骨頭的世界旋轉，乘上每根骨頭固定的補償 C = inv(Bs) · A · Bd，
     其中 Bs/Bd 是兩邊的 rest 世界旋轉，A 是把目標 rest 骨頭方向轉到來源 rest 骨頭方向的最小旋轉（消除 T-pose／A-pose 差異與軸向慣例差異），
     再用目標父骨頭「動畫中」的世界旋轉換回 local。Hips 位置 = 目標 rest 位置 + 來源位移 × posScale。 */
  const CHAIN_CHILD={Hips:'Spine',Spine:'Spine1',Spine1:'Spine2',Spine2:'Neck',Neck:'Head',Head:'HeadTop_End',LeftShoulder:'LeftArm',LeftArm:'LeftForeArm',LeftForeArm:'LeftHand',LeftHand:'LeftHandMiddle1',RightShoulder:'RightArm',RightArm:'RightForeArm',RightForeArm:'RightHand',RightHand:'RightHandMiddle1',LeftUpLeg:'LeftLeg',LeftLeg:'LeftFoot',LeftFoot:'LeftToeBase',LeftToeBase:'LeftToe_End',RightUpLeg:'RightLeg',RightLeg:'RightFoot',RightFoot:'RightToeBase',RightToeBase:'RightToe_End'};
  function sampleQuat(track,t,out){ const T=track.times, V=track.values; const n=T.length; if(t<=T[0]){ out.fromArray(V,0); return out; } if(t>=T[n-1]){ out.fromArray(V,(n-1)*4); return out; } let lo=0, hi=n-1; while(hi-lo>1){ const mid=(lo+hi)>>1; if(T[mid]<=t) lo=mid; else hi=mid; } const a=new THREE.Quaternion().fromArray(V,lo*4), b=new THREE.Quaternion().fromArray(V,hi*4); const f=(t-T[lo])/Math.max(1e-6,T[hi]-T[lo]); out.copy(a).slerp(b,f); return out; }
  function sampleVec(track,t,out){ const T=track.times, V=track.values; const n=T.length; if(t<=T[0]){ out.fromArray(V,0); return out; } if(t>=T[n-1]){ out.fromArray(V,(n-1)*3); return out; } let lo=0, hi=n-1; while(hi-lo>1){ const mid=(lo+hi)>>1; if(T[mid]<=t) lo=mid; else hi=mid; } const a=new THREE.Vector3().fromArray(V,lo*3), b=new THREE.Vector3().fromArray(V,hi*3); const f=(t-T[lo])/Math.max(1e-6,T[hi]-T[lo]); out.copy(a).lerp(b,f); return out; }
  C.retargetClip=function(clip,srcRoot,dstRoot,opts){ opts=opts||{}; const fps=opts.fps||30; const prefix=/^mixamorig:?/;
    srcRoot.updateMatrixWorld(true); dstRoot.updateMatrixWorld(true);
    // 來源／目標骨頭表（rest 世界旋轉、位置）
    const src={}, dst={}; srcRoot.traverse(o=>{ if(prefix.test(o.name)) src[o.name.replace(prefix,'')]=o; }); dstRoot.traverse(o=>{ if(o.isBone||src[o.name]) if(src[o.name]||o.isBone) dst[o.name]=o; });
    const wq=o=>{ const q=new THREE.Quaternion(); o.getWorldQuaternion(q); return q; }; const wp=o=>{ const v=new THREE.Vector3(); o.getWorldPosition(v); return v; };
    const Bs={}, Bd={}, Ps={}, Pd={}; for(const n in src){ Bs[n]=wq(src[n]); Ps[n]=wp(src[n]); } for(const n in dst){ Bd[n]=wq(dst[n]); Pd[n]=wp(dst[n]); }
    // 補償 C
    const Cq={}; for(const n in dst){ if(!src[n]) continue; const cn=CHAIN_CHILD[n]; let A=new THREE.Quaternion(); if(cn&&src[cn]&&dst[cn]){ const ds=Ps[cn].clone().sub(Ps[n]).normalize(), dd=Pd[cn].clone().sub(Pd[n]).normalize(); if(ds.lengthSq()>0.5&&dd.lengthSq()>0.5) A.setFromUnitVectors(dd,ds); } Cq[n]=Bs[n].clone().invert().multiply(A).multiply(Bd[n]); }
    // 來源軌道
    const qTracks={}, pTracks={}; for(const t of clip.tracks){ const m=t.name.match(/^(.+)\.(quaternion|position)$/); if(!m) continue; const n=m[1].replace(prefix,''); if(m[2]==='quaternion') qTracks[n]=t; else pTracks[n]=t; }
    // 階層順序（父在前）
    const order=[]; dstRoot.traverse(o=>{ if(dst[o.name]) order.push(o.name); });
    const nF=Math.max(2,Math.round(clip.duration*fps)+1); const times=new Float32Array(nF); const outQ={}; for(const n of order) if(src[n]) outQ[n]=new Float32Array(nF*4);
    const hipsPos=(pTracks.Hips&&dst.Hips)?new Float32Array(nF*3):null; const sc=opts.posScale||1; const srcHipRest=src.Hips?src.Hips.position.clone():new THREE.Vector3(); const dstHipRest=dst.Hips?dst.Hips.position.clone():new THREE.Vector3();
    const Ws={}, Wd={}; const q=new THREE.Quaternion(), v=new THREE.Vector3();
    for(let i=0;i<nF;i++){ const t=Math.min(clip.duration,i/fps); times[i]=t;
      // 來源世界旋轉（沿階層）
      srcRoot.traverse(o=>{ if(!prefix.test(o.name)) return; const n=o.name.replace(prefix,''); const tr=qTracks[n]; const lq=tr?sampleQuat(tr,t,q).clone():o.quaternion.clone(); const par=o.parent; const pn=par&&prefix.test(par.name)?par.name.replace(prefix,''):null; const pw=pn&&Ws[pn]?Ws[pn]:(par?wq(par):new THREE.Quaternion()); Ws[n]=pw.clone().multiply(lq); });
      for(const n of order){ const o=dst[n]; const par=o.parent; const pn=par&&dst[par.name]?par.name:null; const pw=pn&&Wd[pn]?Wd[pn]:(par?wq(par):new THREE.Quaternion());
        let w; if(src[n]&&Ws[n]) w=Ws[n].clone().multiply(Cq[n]); else w=pw.clone().multiply(o.quaternion); Wd[n]=w;
        if(outQ[n]){ const lq=pw.clone().invert().multiply(w); outQ[n][i*4]=lq.x; outQ[n][i*4+1]=lq.y; outQ[n][i*4+2]=lq.z; outQ[n][i*4+3]=lq.w; } }
      if(hipsPos){ sampleVec(pTracks.Hips,t,v); hipsPos[i*3]=dstHipRest.x+(v.x-srcHipRest.x)*sc*(opts.hipXZ?1:0); hipsPos[i*3+1]=dstHipRest.y+(v.y-srcHipRest.y)*sc; hipsPos[i*3+2]=dstHipRest.z+(v.z-srcHipRest.z)*sc*(opts.hipXZ?1:0); } }
    const tracks=[]; for(const n in outQ) tracks.push(new THREE.QuaternionKeyframeTrack(n+'.quaternion',Array.from(times),Array.from(outQ[n]))); if(hipsPos) tracks.push(new THREE.VectorKeyframeTrack('Hips.position',Array.from(times),Array.from(hipsPos)));
    return new THREE.AnimationClip(clip.name,clip.duration,tracks); };
  // 每個人物模板只重定向一次
  function clipsFor(modelKey){ if(ASSETS.clips[modelKey]) return ASSETS.clips[modelKey]; const m=ASSETS.manifest[modelKey]; const tpl=ASSETS.getRaw(modelKey); const src=ASSETS.getRaw(m.anims); if(!tpl||!src) return null; let hips=null; src.scene.traverse(o=>{ if(/Hips$/.test(o.name)&&!hips) hips=o; }); const sc=hips?hips.parent.getWorldScale(new THREE.Vector3()).y:1; const out={}; for(const a of src.animations){ out[a.name]=C.retargetClip(a,src.scene,tpl.scene,{posScale:sc}); } ASSETS.clips[modelKey]=out; return out; }
  C.canGLB=function(spec){ return !!(spec&&spec.model&&ASSETS.has(spec.model)&&ASSETS.manifest[spec.model].type!=='vrm'&&ASSETS.has(ASSETS.manifest[spec.model].anims)); };
  C.useModels=true;
  C.canVRM=function(spec){ return !!(C.useModels!==false&&spec&&spec.model&&typeof THREE_VRM!=='undefined'&&ASSETS.has(spec.model)&&ASSETS.manifest[spec.model].type==='vrm'&&ASSETS.has(ASSETS.manifest[spec.model].anims)&&ASSETS.vrmFree(spec.model)>0); };
  /* ---- VRM driver（@pixiv/three-vrm；VRM 0.x/1.0）----
     動畫：Mixamo clip → normalized humanoid bones（官方 loadMixamoAnimation 作法：來源 rest 世界旋轉補償；normalized rig 本身是 T-pose、identity）。
     靜態姿勢（sit/read/wave/talk）直接寫 normalized bone rotation；表情用 expressionManager；注視用 vrm.lookAt.target。 */
  const VRM_BONE={Hips:'hips',Spine:'spine',Spine1:'chest',Spine2:'upperChest',Neck:'neck',Head:'head',LeftShoulder:'leftShoulder',LeftArm:'leftUpperArm',LeftForeArm:'leftLowerArm',LeftHand:'leftHand',LeftHandThumb1:'leftThumbMetacarpal',LeftHandThumb2:'leftThumbProximal',LeftHandThumb3:'leftThumbDistal',LeftHandIndex1:'leftIndexProximal',LeftHandIndex2:'leftIndexIntermediate',LeftHandIndex3:'leftIndexDistal',LeftHandMiddle1:'leftMiddleProximal',LeftHandMiddle2:'leftMiddleIntermediate',LeftHandMiddle3:'leftMiddleDistal',LeftHandRing1:'leftRingProximal',LeftHandRing2:'leftRingIntermediate',LeftHandRing3:'leftRingDistal',LeftHandPinky1:'leftLittleProximal',LeftHandPinky2:'leftLittleIntermediate',LeftHandPinky3:'leftLittleDistal',RightShoulder:'rightShoulder',RightArm:'rightUpperArm',RightForeArm:'rightLowerArm',RightHand:'rightHand',RightHandThumb1:'rightThumbMetacarpal',RightHandThumb2:'rightThumbProximal',RightHandThumb3:'rightThumbDistal',RightHandIndex1:'rightIndexProximal',RightHandIndex2:'rightIndexIntermediate',RightHandIndex3:'rightIndexDistal',RightHandMiddle1:'rightMiddleProximal',RightHandMiddle2:'rightMiddleIntermediate',RightHandMiddle3:'rightMiddleDistal',RightHandRing1:'rightRingProximal',RightHandRing2:'rightRingIntermediate',RightHandRing3:'rightRingDistal',RightHandPinky1:'rightLittleProximal',RightHandPinky2:'rightLittleIntermediate',RightHandPinky3:'rightLittleDistal',LeftUpLeg:'leftUpperLeg',LeftLeg:'leftLowerLeg',LeftFoot:'leftFoot',LeftToeBase:'leftToes',RightUpLeg:'rightUpperLeg',RightLeg:'rightLowerLeg',RightFoot:'rightFoot',RightToeBase:'rightToes'};
  function mixamoToVRM(clip,srcScene,vrm){ const tracks=[]; const restInv=new THREE.Quaternion(), parentRest=new THREE.Quaternion(), q=new THREE.Quaternion(); srcScene.updateMatrixWorld(true); const srcHips=srcScene.getObjectByName('mixamorigHips')||srcScene.getObjectByName('mixamorig:Hips'); const hipsScale=srcHips?(vrm.humanoid.normalizedRestPose.hips.position[1]/(srcHips.position.y||1)):1; const v0=vrm.meta&&vrm.meta.metaVersion==='0';
    for(const t of clip.tracks){ const [name,prop]=t.name.split('.'); const bone=VRM_BONE[name.replace(/^mixamorig:?/,'')]; const node=bone&&vrm.humanoid.getNormalizedBoneNode(bone); const src=srcScene.getObjectByName(name); if(!node||!src) continue; src.getWorldQuaternion(restInv).invert(); src.parent.getWorldQuaternion(parentRest);
      if(t instanceof THREE.QuaternionKeyframeTrack){ const vals=new Float32Array(t.values.length); for(let i=0;i<t.values.length;i+=4){ q.fromArray(t.values,i); q.premultiply(parentRest).multiply(restInv); vals[i]=q.x; vals[i+1]=q.y; vals[i+2]=q.z; vals[i+3]=q.w; } if(v0){ for(let i=0;i<vals.length;i+=4){ vals[i]=-vals[i]; vals[i+2]=-vals[i+2]; } } tracks.push(new THREE.QuaternionKeyframeTrack(node.name+'.'+prop,Array.from(t.times),Array.from(vals))); }
      else if(t instanceof THREE.VectorKeyframeTrack&&bone==='hips'){ const vals=[]; for(let i=0;i<t.values.length;i+=3){ vals.push(node.position.x, t.values[i+1]*hipsScale, node.position.z); } tracks.push(new THREE.VectorKeyframeTrack(node.name+'.'+prop,Array.from(t.times),vals)); } }
    return new THREE.AnimationClip(clip.name,clip.duration,tracks); }
  const SIT_VRM={LeftUpLeg:[-1.45,0,0],RightUpLeg:[-1.45,0,0],LeftLeg:[1.5,0,0],RightLeg:[1.5,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[0,0,-1.25],RightArm:[0,0,1.25],LeftForeArm:[0,0,0],RightForeArm:[0,0,0]};
  const READ_VRM={LeftArm:[0,0,-1.1],RightArm:[0,0,1.1],LeftForeArm:[0,-1.3,0],RightForeArm:[0,1.3,0]};
  const EXPR_VRM={smile:['happy',0.7],laugh:['happy',1.0],shy:['relaxed',0.8],surprise:['surprised',1.0],worried:['sad',0.7],angry:['angry',0.8],normal:null};
  // VRM 0.x（VRoid）在 normalized rig 裡面朝 -Z（three-vrm 用整個 scene 轉 180° 修正），所以直接寫骨頭旋轉時 x、z 要反號
  function setBonesV(B,tab,sx){ for(const n in tab){ const b=B[n]; if(!b) continue; const r=tab[n]; b.rotation.set(r[0]*sx,r[1],r[2]*sx); } }
  // 每個角色的顏色（路人共用底模，用材質顏色相乘；貼圖共用）
  const TINT_PAT={hair:/HAIR/i,top:/Tops/,bottom:/Bottoms/,shoes:/Shoes/};
  function applyTint(model,m,tint,list){ const base=m.tintBase||{}; const fac={}; for(const k in tint){ if(!tint[k]||!base[k]) continue; const t=new THREE.Color(tint[k]), b0=new THREE.Color(base[k]); fac[k]=new THREE.Color(Math.min(1.35,t.r/Math.max(0.05,b0.r)),Math.min(1.35,t.g/Math.max(0.05,b0.g)),Math.min(1.35,t.b/Math.max(0.05,b0.b))); }
    if(!Object.keys(fac).length) return; model.traverse(o=>{ if(!o.isMesh) return; const mats=Array.isArray(o.material)?o.material:[o.material]; let changed=false; const nm=mats.map(mt=>{ if(!mt||!mt.name) return mt; for(const k in fac){ if(TINT_PAT[k].test(mt.name)){ const c=mt.clone(); if(c.color) c.color.multiply(fac[k]); if(c.shadeColorFactor) c.shadeColorFactor.multiply(fac[k]); changed=true; return c; } } return mt; }); if(changed){ list.push({mesh:o,orig:o.material}); o.material=Array.isArray(o.material)?nm:nm[0]; } }); }
  let _blobMat=null; function blobShadow(){ if(!_blobMat){ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'); const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(0,0,0,0.42)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); _blobMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}); } const m=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9),_blobMat); m.rotation.x=-Math.PI/2; m.position.y=0.02; m.renderOrder=-1; m.name='blobShadow'; return m; }
  C.CLOTH_K=0.8;
  // 皮膚、頭髮、衣服的明暗（2026-10-10 人物外觀驗收 C1／C5：VRoid 原本的陰影色是 #f8d0dc，幾乎和受光面一樣白，臉沒有明暗、像一張貼紙，皮膚偏慘白；
  // 參考圖是溫暖膚色＋柔和的立體陰影）。look-dev 比較了四組（docs/art-rebuild/CHARACTER_REVIEW.md 第 3 節），這是選定的一組。材質在 VRM pool 裡共用，用 userData.lookK 避免重複套用。
  // 眼睛的動畫式高光（EyeHighlight、EyeExtra）不畫：參考圖的眼睛沒有大塊高光。C.LOOK=null 可以關掉比較
  C.LOOK={skin:{color:0xffeee2,shade:0xcf967f,toony:0.15,shift:0.05,gi:0.7},cloth:{shadeK:0.74,gi:0.7},hair:{shadeK:0.62},outlineK:0.5,hideEye:/EyeHighlight|EyeExtra/};
  function applyLook(model){ const L=C.LOOK; if(!L) return; model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.name) continue; const nm=mt.name;
      if(L.hideEye&&L.hideEye.test(nm)){ mt.visible=false; continue; }   /* 只藏這個材質（同一個網格裡還有臉的其他部分）*/
      if(mt.userData.lookK||!mt.shadeColorFactor) continue; mt.userData.lookK=true;
      if(typeof mt.outlineWidthFactor==='number') mt.outlineWidthFactor*=L.outlineK;
      const skin=/_SKIN/.test(nm)||/FaceMouth/.test(nm), cloth=/_CLOTH/.test(nm), hair=/HAIR/.test(nm); const p=skin?L.skin:(cloth?L.cloth:(hair?L.hair:null)); if(!p) continue;
      if(p.color!==undefined) mt.color.multiply(new THREE.Color(p.color)); if(p.shade!==undefined) mt.shadeColorFactor.set(p.shade); if(p.shadeK) mt.shadeColorFactor.multiplyScalar(p.shadeK);
      if(p.toony!==undefined) mt.shadingToonyFactor=p.toony; if(p.shift!==undefined) mt.shadingShiftFactor=p.shift; if(p.gi!==undefined) mt.giEqualizationFactor=p.gi; } }); }
  // 黃昏的暖色輪廓光（參考圖 07：逆光把頭髮、肩膀的邊緣染成金色）：用 MToon 的 parametric rim（看邊緣的 fresnel），
  // 只在黃昏把 rim 顏色調成暖色，其他時間還原成模型原本的值；不動 rimLightingMix（matcap 也走 rim，改它會讓白天變亮）。只加在頭髮與上衣
  C.rimMats=new Set(); C.rimK=0; const _rimC=new THREE.Color();
  C.setDuskRim=function(k,col){ C.rimK=k; C.lastRimCol=col; for(const m of C.rimMats){ const r0=m.userData.rim0; if(!r0) continue; m.parametricRimColorFactor.setRGB(r0.c.r,r0.c.g,r0.c.b); if(k<=0.001){ m.parametricRimFresnelPowerFactor=r0.p; m.parametricRimLiftFactor=r0.l; continue; } const w=Math.min(1,k*1.5); _rimC.copy(col).multiplyScalar(0.3*k*r0.w); m.parametricRimColorFactor.lerp(_rimC,w); m.parametricRimFresnelPowerFactor=r0.p+(3.2-r0.p)*w; m.parametricRimLiftFactor=r0.l; } };
  function collectRim(model){ model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.isMToonMaterial||C.rimMats.has(mt)) continue; if(/FACE|EYE|Face|Eye|MOUTH|BROW|Outline/.test(mt.name||'')) continue; const rw=/HAIR/i.test(mt.name||'')?1:(/Tops/.test(mt.name||'')?0.45:0); if(!rw) continue;   /* 頭髮全強度、上衣一半；褲子、鞋子、皮膚不加（深色褲子加了會變成偏棕的塑膠光澤）*/ /* 原始值：路人換色時 clone 會連 userData 一起複製，所以黃昏時才 clone 的材質也拿得到「改之前」的值 */ if(!mt.userData.rim0){ const c=mt.parametricRimColorFactor; mt.userData.rim0={c:{r:c.r,g:c.g,b:c.b},p:mt.parametricRimFresnelPowerFactor,l:mt.parametricRimLiftFactor,w:rw}; } C.rimMats.add(mt); } }); }
  function buildVRM(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const e=ASSETS.acquireVRM(key); if(!e) throw new Error('no free VRM instance'); const vrm=e.vrm; const model=vrm.scene; const hide=m.hide||[]; const realShadow=!m.ambient; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=realShadow; o.receiveShadow=false; o.frustumCulled=false; if(hide.some(h=>o.name===h||o.name.startsWith(h))) o.visible=false; } }); /* 衣服材質整體壓暗一點：MToon 的卡通明暗讓受光面拿到整個太陽亮度（不乘入射角），中午的淺色衣服（米白、淺灰）會曝成全白、看不出顏色。只動 _CLOTH 材質（皮膚、臉、頭髮、眼睛不動）；材質在 pool 裡共用，用 userData 記號避免重複壓暗 */ model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.name||mt.userData.clothK||!/_CLOTH/.test(mt.name)) continue; mt.userData.clothK=C.CLOTH_K; if(mt.color) mt.color.multiplyScalar(C.CLOTH_K); if(mt.shadeColorFactor) mt.shadeColorFactor.multiplyScalar(C.CLOTH_K); } });
    applyLook(model);
    const v0=!!(vrm.meta&&vrm.meta.metaVersion==='0'); const sx=v0?-1:1;
    // 外層 wrap：縮放與坐下時的高度都改 wrap，VRM 本身的 180° 修正（VRM 0.x）保持不動
    const root=new THREE.Group(); root.name='human'; const wrap=new THREE.Group(); wrap.name='vrmWrap'; wrap.add(model); const H=spec.height||m.height||1.6; vrm.humanoid.resetNormalizedPose(); vrm.humanoid.update(); wrap.updateMatrixWorld(true);
    // 身高用身體（不含頭髮：馬尾、翹髮會讓人被縮太矮）
    const box=new THREE.Box3(); model.traverse(o=>{ if(!o.isMesh) return; const nm=(o.name||'')+'|'+((o.parent&&o.parent.name)||''); if(/(^|\|)Hair/i.test(nm)) return; box.expandByObject(o); }); if(box.isEmpty()) box.setFromObject(model); const mh=(box.max.y-box.min.y)+0.03; const s=H/Math.max(0.1,mh); wrap.scale.setScalar(s); wrap.position.y=-box.min.y*s; wrap.userData.baseY=wrap.position.y; root.add(wrap);
    const tinted=[]; if(spec.tint) applyTint(model,m,spec.tint,tinted);
    collectRim(model); if(C.rimK>0.001&&C.lastRimCol) C.setDuskRim(C.rimK,C.lastRimCol);
    if(!realShadow){ root.add(blobShadow()); }
    const B={}; for(const n in VRM_BONE){ const node=vrm.humanoid.getNormalizedBoneNode(VRM_BONE[n]); if(node) B[n]=node; }
    const ck=key+':vrm'; if(!ASSETS.clips[ck]){ const src=ASSETS.getRaw(m.anims); const out={}; for(const a of src.animations) out[a.name]=mixamoToVRM(a,src.scene,vrm); ASSETS.clips[ck]=out; }
    // clip 的 track 名稱是 normalized node 名稱；同一模型的每個實例（含 clone）名稱相同，可共用
    const clips=ASSETS.clips[ck]; const mixer=new THREE.AnimationMixer(model); const actions={}; for(const n in clips){ actions[n]=mixer.clipAction(clips[n]); actions[n].enabled=true; }
    const look=new THREE.Object3D(); look.position.set(0,H*0.9,2); root.add(look); if(vrm.lookAt) vrm.lookAt.target=look;
    const headNode=B.Head; let headY=H*0.9; if(headNode){ root.updateMatrixWorld(true); const wp=new THREE.Vector3(); headNode.getWorldPosition(wp); headY=root.worldToLocal(wp).y; }
    // 隨身配件（後背包、托特包、眼鏡…）：依模型（＝角色）決定，spec.props 可覆寫；掛在骨頭上跟著動
    let props=null; const plist=spec.props||C.MODEL_PROPS[key]; if(plist&&plist.length&&typeof PROPS!=='undefined'){ try{ props=PROPS.attach(vrm,plist,{shadow:realShadow}); }catch(err){ console.warn('props failed',key,err); } }
    root.userData={driver:'vrm',spec,k:H/1.75,parts:{},model:wrap,vrm,key,v0,sx,tinted,props,full:!!e.full,bones:B,look,headY,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0,blink:2+Math.random()*3,blinkT:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    // 彈簧骨（頭髮、馬尾）在人物自己的座標系模擬：瞬移、換區域、坐下起身時頭髮不會被甩飛（要在 root.userData 設定之後：three-vrm 把反矩陣快取放在 center.userData）
    const sbm=vrm.springBoneManager; if(sbm){ try{ sbm.reset(); sbm.joints.forEach(j=>{ j.center=root; }); root.updateMatrixWorld(true); sbm.setInitState(); }catch(err){ console.warn('spring bone center',err); } }
    return root; }
  C.MODEL_PROPS={'char.yuting':['backpack'],'char.heroine_01':['tote'],'char.heroine_02':['glasses','earrings','apron'],'char.heroine_03':['backpack'],'char.heroine_04':['guitar'],'char.heroine_05':['folder','hairtie']};
  // 切換配件（例：林芷若在 Café 工作時才穿圍裙）
  C.setProp=function(h,name,on){ const u=h&&h.userData; const o=u&&u.props&&u.props[name]; if(!o) return false; o.visible=!!on; (u.propOn=u.propOn||{})[name]=!!on; return true; };
  C.release=function(h){ const u=h&&h.userData; if(!u||u.driver!=='vrm') return; try{ if(u.props&&typeof PROPS!=='undefined') PROPS.detach(u.props); u.props=null; const sbm=u.vrm.springBoneManager; if(sbm) sbm.joints.forEach(j=>{ j.center=null; }); }catch(e){} try{ for(const n in u.anim.actions) u.anim.actions[n].stop(); u.anim.mixer.stopAllAction(); u.vrm.humanoid.resetNormalizedPose(); if(u.vrm.expressionManager) u.vrm.expressionManager.expressions.forEach(ex=>u.vrm.expressionManager.setValue(ex.expressionName,0)); for(const t of (u.tinted||[])){ const cur=Array.isArray(t.mesh.material)?t.mesh.material:[t.mesh.material]; const orig=Array.isArray(t.orig)?t.orig:[t.orig]; cur.forEach((mt,i)=>{ if(mt!==orig[i]){ C.rimMats.delete(mt); if(mt.dispose) mt.dispose(); } }); t.mesh.material=t.orig; } u.tinted=[]; }catch(e){} ASSETS.releaseVRM(u.key,u.vrm); };
  // 走樓梯、台階時的腳步貼合（v9.4，D36；使用者：「人物在樓梯上不能滑動、漂浮或腳穿進階梯」）。
  // 走路動畫是平地做的：腳底永遠在「身體所在那一階」的高度。這裡依每隻腳底下那一階的實際高度把腳移上去／移下來：
  // 兩段式 IK（大腿轉向目標、膝蓋彎曲角用餘弦定理），腳掌維持動畫原本的方向；比身體低的那隻腳搆不到時，整個身體先往下沉。
  // st.ground(x,z)＝那一層的地面高度（遊戲給，平地區域不給）。腳下和身體同高（平地）時完全不動。C.footIK=false 可以關掉比較。
  C.footIK=true;
  const IKV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()], IKQ=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()];
  const LEGS=[['leftUpperLeg','leftLowerLeg','leftFoot','leftToes'],['rightUpperLeg','rightLowerLeg','rightFoot','rightToes']];   /* 真實骨架（raw）：three-vrm 的 normalized 骨架世界座標不是真的關節位置，不能拿來算長度 */
  function rotWorld(b,axis,ang){ if(!(Math.abs(ang)>1e-5)) return; b.parent.getWorldQuaternion(IKQ[0]); IKQ[1].setFromAxisAngle(axis,ang); IKQ[2].copy(IKQ[0]).invert(); b.quaternion.premultiply(IKQ[0]).premultiply(IKQ[1]).premultiply(IKQ[2]); b.updateWorldMatrix(false,true); }
  function footIK(h,u,st,dt){ const g=C.footIK&&st&&st.ground, w=u.model; const base=w.userData.baseY||0; const hm=u.vrm.humanoid; const B=u.rawLegs||(u.rawLegs=(()=>{ const o={}; for(const L of LEGS) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    const relax=()=>{ if(u.ikDrop){ u.ikDrop+=(0-u.ikDrop)*Math.min(1,dt*12); if(Math.abs(u.ikDrop)<1e-3) u.ikDrop=0; w.position.y=base-u.ikDrop; } };
    if(!g||LEGS.some(L=>L.slice(0,3).some(n=>!B[n]))){ relax(); return; }
    const P0=h.getWorldPosition(IKV[0]), y=P0.y, ry=h.rotation.y, fx=Math.sin(ry), fz=Math.cos(ry);
    // 平地（身體、前後 0.4 m 都和身體同高）：不做
    if(Math.abs(g(P0.x,P0.z)-y)<0.01&&Math.abs(g(P0.x+fx*0.4,P0.z+fz*0.4)-y)<0.01&&Math.abs(g(P0.x-fx*0.4,P0.z-fz*0.4)-y)<0.01){ relax(); return; }
    w.position.y=base-(u.ikDrop||0); h.updateWorldMatrix(true,true);
    const legs=LEGS.map(([a,b,c,t])=>{ const an=B[c].getWorldPosition(new THREE.Vector3()); let gy=g(an.x,an.z); if(B[t]){ const tp=B[t].getWorldPosition(IKV[1]); gy=Math.max(gy,g(tp.x,tp.z)); }   /* 腳跟和腳尖底下比較高的那一階：腳尖不會插進下一階的立面 */
      return {a:B[a],b:B[b],c:B[c],an:an.setY(an.y+(u.ikDrop||0)),off:gy-y}; });   /* an＝身體沒有下沉時的腳踝位置 */
    const want=Math.min(0.32,Math.max(0,-Math.min(legs[0].off,legs[1].off))); u.ikDrop=(u.ikDrop||0)+(want-(u.ikDrop||0))*Math.min(1,dt*20); w.position.y=base-u.ikDrop; h.updateWorldMatrix(true,true);
    for(const L of legs){ const T=IKV[1].set(L.an.x,L.an.y+L.off,L.an.z); L.c.getWorldQuaternion(IKQ[3]);   /* 腳掌原本的方向 */
      const hip=L.a.getWorldPosition(IKV[2]), knee=L.b.getWorldPosition(IKV[3]), ank=L.c.getWorldPosition(IKV[4]); const la=hip.distanceTo(knee), lb=knee.distanceTo(ank); if(la<1e-3||lb<1e-3) continue;
      { const R=(la+lb)*0.995, hx=T.x-hip.x, hz=T.z-hip.z, hh=hx*hx+hz*hz; if(hip.distanceToSquared(T)>R*R&&hh<R*R) T.y=Math.max(T.y,hip.y-Math.sqrt(R*R-hh)); }   /* 腿伸不到：腳留在原本的水平位置、只少下去一點（寧可懸空一點，不要被拉歪插進台階）*/
      const c=Math.min(la+lb-1e-3,Math.max(Math.abs(la-lb)+1e-3,hip.distanceTo(T)));
      const u1=IKV[5].copy(hip).sub(knee), v1=new THREE.Vector3().copy(ank).sub(knee); const cur=u1.angleTo(v1), tgt=Math.acos(Math.max(-1,Math.min(1,(la*la+lb*lb-c*c)/(2*la*lb))));
      const n=new THREE.Vector3().crossVectors(u1,v1); if(n.lengthSq()<1e-8) n.set(-Math.cos(ry),0,Math.sin(ry)); n.normalize(); rotWorld(L.b,n,tgt-cur);   /* 膝蓋（腿完全打直時用「人物的左方」當彎曲軸：膝蓋往前彎）*/
      const a2=L.c.getWorldPosition(IKV[4]).sub(hip), t2=new THREE.Vector3().copy(T).sub(hip); const ax=new THREE.Vector3().crossVectors(a2,t2); if(ax.lengthSq()>1e-10){ ax.normalize(); rotWorld(L.a,ax,a2.angleTo(t2)); }   /* 大腿 */
      L.c.parent.getWorldQuaternion(IKQ[0]); L.c.quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); L.c.updateWorldMatrix(false,true); } }   /* 腳掌照原本的方向（踩平） */
  function animateVRM(h,dt,st){ const u=h.userData; const a=u.anim; a.t+=dt; const pose=st.pose||'idle'; const B=u.bones; const spd=st.speed||0; const vrm=u.vrm; const sx=u.sx||1;
    if(u.props){ const sitting=pose==='sit'||pose==='read'; for(const k of ['backpack','guitar']){ const o=u.props[k]; if(o) o.visible=!sitting&&!(u.propOn&&u.propOn[k]===false); } }
    if(pose==='sit'||pose==='read'){ if(!a.static){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.cur=null; vrm.humanoid.resetNormalizedPose(); } u.ikDrop=0; u.ikSt=null; u.model.position.y=(u.model.userData.baseY||0)-0.47*u.k; setBonesV(B,SIT_VRM,sx); if(pose==='read'){ setBonesV(B,READ_VRM,sx); if(B.Head) B.Head.rotation.set((0.35+Math.sin(a.t*0.6)*0.02)*sx,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03*sx,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06*sx,0,0); }
    else { if(a.static){ a.static=false; u.model.position.y=u.model.userData.baseY||0; vrm.humanoid.resetNormalizedPose(); } const clipName=POSE_CLIP[pose]||'idle'; if(a.cur!==clipName&&a.actions[clipName]){ const prev=a.cur&&a.actions[a.cur]; const next=a.actions[clipName]; next.reset().setEffectiveWeight(1).fadeIn(0.22).play(); if(prev) prev.fadeOut(0.22); a.cur=clipName; } const act=a.actions[a.cur]; if(act){ act.timeScale= a.cur==='walk'?Math.max(0.6,spd/1.45): (a.cur==='run'?Math.max(0.7,spd/4.1):1); } a.mixer.update(dt);
      if(pose==='wave'&&B.RightArm){ const g=Math.sin(a.t*7); B.RightArm.rotation.set(0,0,-0.9*sx); if(B.RightForeArm) B.RightForeArm.rotation.set(0,0,(-1.6+g*0.25)*sx); if(B.Head) B.Head.rotation.z+=0.08*sx; }
      if(pose==='talk'&&B.Head){ B.Head.rotation.x+=Math.sin(a.t*1.4)*0.05*sx; B.Head.rotation.y+=Math.sin(a.t*0.8)*0.08; if(B.Spine1) B.Spine1.rotation.y+=Math.sin(a.t*0.6)*0.03; }
      u.ikSt=st; }  // VRM 的前臂軸向和程序化人物不同，說話時不轉前臂（舊版會把手舉到頭上）
    // 注視（眼睛＋頭）
    if(st.lookAt){ const local=h.worldToLocal(new THREE.Vector3(st.lookAt.x,u.headY,st.lookAt.z)); u.look.position.copy(local); if(B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.6; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; } } else { u.look.position.set(0,u.headY,3); }
    // 表情：眨眼、嘴型
    const em=vrm.expressionManager; if(em){ a.blink-=dt; if(a.blink<=0){ a.blinkT=0.14; a.blink=2.5+Math.random()*3.5; } if(a.blinkT>0){ a.blinkT-=dt; em.setValue('blink',a.blinkT>0.07?1:(a.blinkT/0.07)); } else em.setValue('blink',0); const target=pose==='talk'?(0.08+Math.abs(Math.sin(a.t*9))*0.3):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); em.setValue('aa',a.mouth); }
    updateVRM(vrm,dt,()=>footIK(h,u,u.ikSt,dt)); }
  // VRM 更新：彈簧骨（頭髮、馬尾）用固定小步長。低幀率（SwiftShader 1–4 fps、手機突然卡頓）時一次積分太大，馬尾會失穩往上翹
  // 彈簧骨前先更新整個 VRM 的 world matrix：three-vrm 用「子骨頭的 matrixWorld」算骨長，人物移動／瞬移／動畫之後子骨頭還停在上一幀，
  // 低幀率時一幀差幾十公分 → 骨長算錯、頭髮被甩到耳朵高度往外翹（林芷若走路截圖；30 fps 時也會讓髮尾抖）
  function updateVRM(vrm,dt,post){ const sbm=vrm.springBoneManager; if(!sbm||vrm.lite){ vrm.update(dt); if(post) post(); return; } vrm.humanoid.update(); if(post) post();   /* post：腳步貼合（真實骨架） */ if(vrm.lookAt) vrm.lookAt.update(dt); if(vrm.expressionManager) vrm.expressionManager.update(); if(vrm.nodeConstraintManager) vrm.nodeConstraintManager.update(); vrm.scene.updateWorldMatrix(true,true); const T=Math.min(dt,0.2), n=Math.min(6,Math.max(1,Math.ceil(T/(1/30)))); for(let i=0;i<n;i++) sbm.update(T/n); if(vrm.materials) vrm.materials.forEach(m=>{ if(m.update) m.update(dt); }); }
  C.setExprVRM=function(h,expr){ const u=h.userData; u.anim.expr=expr; const em=u.vrm.expressionManager; if(!em) return; for(const k in EXPR_VRM){ const e=EXPR_VRM[k]; if(e) em.setValue(e[0],0); } const e=EXPR_VRM[expr]; if(e) em.setValue(e[0],e[1]); };
  // ---- 建立 ----
  // 建立順序：VRM（spec.model）→ GLB（spec.model 或 spec.fallbackModel，例如主角的 TEMP_PLAYER_DEV_MODEL）→ 程序化 placeholder
  /* 角色 → 正式 3D 模型（VRoid CC0 改作）。主要角色各自一個模型；其他人（含路人、教授、不熟同學）用路人底模，
     顏色沿用各自原本的穿搭設定（髮色、上衣、褲裙），用材質顏色相乘。這裡只決定「外觀」，不影響移動、碰撞、存檔。 */
  C.CAST={hero_m:{model:'char.yuting'},an:{model:'char.heroine_01'},hero_f:{model:'char.heroine_01'},heroine_01:{model:'char.heroine_01'},zhe:{model:'char.zhe'},heroine_02:{model:'char.heroine_02'},heroine_03:{model:'char.heroine_03'},heroine_04:{model:'char.heroine_04'},heroine_05:{model:'char.heroine_05'},sis:{model:'char.heroine_05'}};
  const AMB={f:['char.npc_f1','char.npc_f2'],m:['char.npc_m1','char.npc_m2']};
  function hashId(s){ let h=7; for(const ch of String(s)) h=(h*31+ch.charCodeAt(0))>>>0; return h; }
  C.resolveModel=function(spec){ if(!spec||C.useModels===false) return spec; if(spec.model&&ASSETS.has(spec.model)) return spec; const cast=C.CAST[spec.id]; if(cast&&ASSETS.has(cast.model)) return Object.assign({},spec,cast); const sex=spec.sex==='f'?'f':'m'; const list=AMB[sex].filter(k=>ASSETS.has(k)); if(!list.length) return spec; const key=spec.ambientModel&&ASSETS.has(spec.ambientModel)?spec.ambientModel:list[hashId(spec.id||spec.name||'x')%list.length]; const o=spec.outfit||{}; const tint={hair:spec.hair&&spec.hair.color,top:o.top&&o.top.color,bottom:o.bottom&&o.bottom.color}; return Object.assign({},spec,{model:key,tint}); };
  C.failures=[];
  // 人物「想要」的正式模型：spec.model，或主要角色在 CAST 的模型；路人沒有（用路人底模）
  C.wantModel=function(spec){ if(!spec||C.useModels===false) return null; if(spec.model&&ASSETS.manifest[spec.model]) return spec.model; const c=C.CAST[spec.id]; return c?c.model:null; };
  // 建立時記下原本的 spec、想要的模型、建立時自己有哪些子物件（之後外面掛上去的，例如腳踏車，換模型時要搬過去）
  C.build=function(spec){ const h=buildOne(spec); const u=h.userData; u.buildSpec=spec; u.wantModel=C.wantModel(spec); u.ownKids=new Set(h.children); return h; };
  // 晚到的正式模型（2026-10-10 線上實玩：手機網速慢，VRM 30 秒內沒下載完 → 主角、NPC 用程序化備用人物，而且下載完也不會換回來）：
  // 需要換的情況＝現在是程序化備用人物、但正式模型已經可以用；或主要角色暫時借用了路人底模、自己的模型已經到了
  C.needsUpgrade=function(h){ const u=h&&h.userData; if(!u||!u.buildSpec||C.useModels===false) return false; if(u.driver!=='proc'&&u.driver!=='vrm') return false; if(u.driver==='vrm'&&(!u.wantModel||u.key===u.wantModel)) return false;
    const r=C.resolveModel(u.buildSpec); if(!C.canVRM(r)) return false; if(u.driver==='proc') return true; return !!(u.wantModel&&u.key!==u.wantModel&&r.model===u.wantModel); };
  // 用同一個 spec 重新建立，放在原本的位置（位置、朝向、姿勢、表情、配件開關、外面掛上去的東西都帶過去），舊的釋放。回傳新的（失敗回 null，舊的不動）
  C.upgrade=function(h){ const u=h.userData; let nh; try{ nh=C.build(u.buildSpec); }catch(e){ console.warn('model upgrade failed',e); return null; } if(nh.userData.driver==='proc'){ return null; }
    nh.position.copy(h.position); nh.quaternion.copy(h.quaternion); nh.scale.copy(h.scale); nh.visible=h.visible;
    for(const c of [...h.children]) if(!u.ownKids||!u.ownKids.has(c)) nh.add(c);
    const a=u.anim, na=nh.userData.anim; if(a&&na&&a.pose) na.pose=a.pose; if(a&&a.expr&&a.expr!=='normal') C.setExpr(nh,a.expr);
    if(u.propOn) for(const k in u.propOn) C.setProp(nh,k,u.propOn[k]);
    const p=h.parent; if(p){ p.add(nh); p.remove(h); } C.release(h); return nh; };
  function buildOne(spec){ spec=C.resolveModel(spec); if(C.canVRM(spec)){ try{ return buildVRM(spec); }catch(e){ console.error('VRM character failed, fallback',spec&&spec.model,e); C.failures.push((spec&&spec.model)+': '+e.message); } } else if(spec&&spec.model&&ASSETS.manifest[spec.model]&&ASSETS.manifest[spec.model].type==='vrm'){ C.failures.push(spec.model+': not loaded'); } if(C.canGLB(spec)){ try{ return buildGLB(spec); }catch(e){ console.warn('GLB character failed, fallback to procedural',e); } } if(spec.fallbackModel){ const s2=Object.assign({},spec,{model:spec.fallbackModel,fallbackModel:null}); if(C.canGLB(s2)){ try{ return buildGLB(s2); }catch(e){ console.warn('fallback GLB failed',e); } } } const o=P3.build(spec); o.userData.driver='proc'; o.userData.placeholder=true; return o; };
  function buildGLB(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const tpl=ASSETS.getRaw(key); const model=THREE_JSM.SkeletonUtils.clone(tpl.scene); const hide=m.hide||[]; let headMesh=null; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=true; o.receiveShadow=false; o.frustumCulled=false; if(hide.some(h=>o.name.includes(h))) o.visible=false; if(o.morphTargetDictionary&&o.morphTargetDictionary.mouthSmile!==undefined) headMesh=o; } });
    const root=new THREE.Group(); root.name='human'; const H=spec.height||m.height||1.75; const box=new THREE.Box3().setFromObject(model); const mh=box.max.y-box.min.y; const s=H/Math.max(0.1,mh); model.scale.setScalar(s); model.position.y=-box.min.y*s; model.userData.baseY=model.position.y; root.add(model);
    const bones={}; model.traverse(o=>{ if(o.isBone) bones[o.name]=o; }); const clips=clipsFor(key); const mixer=new THREE.AnimationMixer(model); const actions={}; for(const n in clips){ actions[n]=mixer.clipAction(clips[n]); actions[n].enabled=true; }
    root.userData={driver:'glb',spec,k:H/1.75,parts:{},model,bones,headMesh,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    return root; }
  // ---- 動畫 ----
  const SIT={LeftUpLeg:[1.45,0,0.08],RightUpLeg:[1.45,0,-0.08],LeftLeg:[1.5,0,0],RightLeg:[1.5,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[0.9,0,0.35],RightArm:[0.9,0,-0.35],LeftForeArm:[0,0,0],RightForeArm:[0,0,0]};
  const READ={LeftArm:[1.2,0,0.9],RightArm:[1.2,0,-0.9],LeftForeArm:[0,0,1.2],RightForeArm:[0,0,-1.2]};
  function setBones(bones,tab,blend){ for(const n in tab){ const b=bones[n]; if(!b) continue; const r=tab[n]; if(blend>=1){ b.rotation.set(r[0],r[1],r[2]); } else { b.rotation.x+=(r[0]-b.rotation.x)*blend; b.rotation.y+=(r[1]-b.rotation.y)*blend; b.rotation.z+=(r[2]-b.rotation.z)*blend; } } }
  C.animate=function(h,dt,st){ const u=h.userData; if(u.driver==='vrm'){ animateVRM(h,dt,st); return; } if(u.driver!=='glb'){ P3.animate(h,dt,st); return; } const a=u.anim; a.t+=dt; const pose=st.pose||'idle'; const B=u.bones; const spd=st.speed||0;
    if(pose==='sit'||pose==='read'){ if(!a.static){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.cur=null; } u.model.position.y=(u.model.userData.baseY||0)-0.47*u.k; setBones(B,SIT,1); if(pose==='read'){ setBones(B,READ,1); if(B.Head) B.Head.rotation.set(0.35+Math.sin(a.t*0.6)*0.02,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06,0,0); }
    else { if(a.static){ a.static=false; u.model.position.y=u.model.userData.baseY||0; for(const n in B){ B[n].rotation.set(0,0,0); } } const clipName=POSE_CLIP[pose]||'idle'; if(a.cur!==clipName&&a.actions[clipName]){ const prev=a.cur&&a.actions[a.cur]; const next=a.actions[clipName]; next.reset().setEffectiveWeight(1).fadeIn(0.22).play(); if(prev) prev.fadeOut(0.22); a.cur=clipName; } const act=a.actions[a.cur]; if(act){ act.timeScale= a.cur==='walk'?Math.max(0.6,spd/1.45): (a.cur==='run'?Math.max(0.7,spd/4.1):1); } a.mixer.update(dt);
      if(pose==='wave'&&B.RightArm){ const g=Math.sin(a.t*7); B.RightArm.rotation.set(-0.2,0,-2.4+g*0.15); if(B.RightForeArm) B.RightForeArm.rotation.set(0.1,0,-0.5-Math.abs(g)*0.3); if(B.Head) B.Head.rotation.z+=0.08; }
      if(pose==='talk'&&B.Head){ B.Head.rotation.x+=Math.sin(a.t*1.4)*0.05; B.Head.rotation.y+=Math.sin(a.t*0.8)*0.08; if(B.RightArm){ const g=Math.sin(a.t*2.2); B.RightArm.rotation.z-=0.35+g*0.1; if(B.RightForeArm) B.RightForeArm.rotation.z-=0.9+g*0.15; } } }
    // 注視
    if(st.lookAt&&B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.8; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; }
    // 嘴型（說話時）與表情
    if(u.headMesh){ const d=u.headMesh.morphTargetDictionary, inf=u.headMesh.morphTargetInfluences; if(d.mouthOpen!==undefined){ const target=pose==='talk'?(0.15+Math.abs(Math.sin(a.t*9))*0.35):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); inf[d.mouthOpen]=a.mouth; } } };
  C.setExpr=function(h,expr){ const u=h.userData; if(u.driver==='vrm'){ C.setExprVRM(h,expr); return; } if(u.driver!=='glb'){ P3.setExpr(h,expr); return; } u.anim.expr=expr; const hm=u.headMesh; if(!hm) return; const d=hm.morphTargetDictionary, inf=hm.morphTargetInfluences; if(d.mouthSmile!==undefined) inf[d.mouthSmile]=(expr==='smile'?0.55:(expr==='laugh'?0.9:(expr==='shy'?0.3:0))); };
  // 頭部高度（運鏡用）
  C.headY=function(h){ const u=h.userData; const k=u.k||1; const a=u.anim; const sit=a&&(a.pose==='sit'||a.pose==='read'); if(u.driver==='vrm'){ return (u.anim.static?u.headY-0.47*k:u.headY); } if(u.driver==='glb'){ const st=(u.anim.static); return (st?1.16:1.62)*k; } return (sit?1.19:1.62)*k; };
  C.isGLB=function(h){ return h&&h.userData&&(h.userData.driver==='glb'||h.userData.driver==='vrm'); };
  return C;
})();
