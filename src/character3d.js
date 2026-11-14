/* ===== 人物層（CHARACTER LAYER）
   gameplay / engine 只呼叫 CHAR.build / CHAR.animate / CHAR.setExpr / CHAR.headY。
   driver 'glb'：rigged GLB（Mixamo 相容骨架，例如 Ready Player Me）＋ Mixamo 動畫（rest-pose 補償重定向）
   driver 'proc'：P3 程序化人物（PLACEHOLDER_CHARACTER） ===== */
'use strict';
const CHAR = (function(){
  const C={};
  const POSE_CLIP={idle:'idle',walk:'walk',run:'run',talk:'idle',wave:'idle',sit:null,read:null,ride:null,climb:'walk',climbdown:'walk',lie:null,gym_squat:'idle',gym_curl:'idle',kneel:'idle'};   /* climb：爬宿舍上舖的梯子（走路片段＋手往前抓，CLIMB_VRM）；climbdown：從梯子下來（走路片段）；lie：躺在床上（靜態，LIE_VRM）——DORM-SLEEP-1030 */
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
  /* 跪坐（坐墊：茶屋的和室、緣側；QA-W1 座位檢查）：大腿往前放平、小腿整個折到大腿下面、腳背貼地；手放在大腿上。高度由 sitFloorFit 依膝蓋、腳踝量（坐墊頂＋腿的厚度）*/
  const SEIZA_VRM={LeftUpLeg:[-1.5,0,0.04],RightUpLeg:[-1.5,0,-0.04],LeftLeg:[2.75,0,0],RightLeg:[2.75,0,0],LeftFoot:[0.9,0,0],RightFoot:[0.9,0,0],LeftArm:[0,-0.35,-1.15],RightArm:[0,0.35,1.15],LeftForeArm:[0,-0.8,0],RightForeArm:[0,0.8,0]};
  /* 騎腳踏車的底子（使用者：「我應該要可以騎腳踏車」、路上騎士要真的踩踏板）：上身前傾、大腿抬起、手往前；腳和手的確切位置由 rideIK 在真實骨架上對到踏板、把手 */
  const RIDE_VRM={Hips:[0.18,0,0],Spine:[0.16,0,0],Spine1:[0.1,0,0],Spine2:[0.04,0,0],Neck:[-0.12,0,0],LeftUpLeg:[-1.0,0,0],RightUpLeg:[-1.0,0,0],LeftLeg:[1.3,0,0],RightLeg:[1.3,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[0,-0.9,-1.0],RightArm:[0,0.9,1.0],LeftForeArm:[0,-0.4,0],RightForeArm:[0,0.4,0]};   /* 骨頭名稱是 Mixamo 的（Spine1＝chest、Spine2＝upperChest，VRM_BONE）；骨盆＋脊椎一起往前傾約 25°（淑女車的直立騎姿，肩膀才搆得到把手）*/
  /* 躺在床上（DORM-SLEEP-1030，使用者 10-30「宿舍睡覺要真的有畫面」）：整個人（vrmWrap）繞人物自己的左右軸轉 −90°＝仰躺、臉朝上、頭朝人物的 −z（story3d.js 把 root 放在腳的位置、朝向＝頭的方向＋π）；
     骨頭：手放在身體兩側、手肘微彎，膝蓋微彎，腳背微微伸直，頭往胸口收一點（枕頭）。LIE_UP＝整個人往上抬多少（背貼床墊：背在站姿的 z≈−0.12）*/
  const LIE_VRM={Hips:[0,0,0],Spine:[0,0,0],Spine1:[0,0,0],Spine2:[0,0,0],Neck:[0.08,0,0],LeftUpLeg:[-0.04,0,0.03],RightUpLeg:[-0.04,0,-0.03],LeftLeg:[0.1,0,0],RightLeg:[0.1,0,0],LeftFoot:[0.35,0,0],RightFoot:[0.35,0,0],LeftArm:[0,0,-1.36],RightArm:[0,0,1.36],LeftForeArm:[0,0,0],RightForeArm:[0,0,0]};
  const LIE_UP=0.11;
  /* 爬梯子（climb）：走路片段＋兩手抓梯子、交替往上換手、上身往前靠（climbIK，真實骨架；CLIMB-POSE-1102）。
     舊版（DORM-SLEEP-1030）是 CLIMB_VRM＝兩隻上臂、前臂固定成往前平舉的同一個角度、蓋掉片段的手：兩手在胸前碰在一起、整段不動（使用者 11-02「好像殭屍」）*/
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
  /* 臉上的小零件（眼白、虹膜、高光、睫毛、眼線、眉毛、嘴）：包在頭裡，影子被頭和頭髮蓋住；不投影＝每個 VRM 人物陰影那一輪少 8 次 draw call（2026-10-16 溫州街效能）*/
  const FACE_PART=/(FaceMouth|FaceBrow|FaceEyelash|FaceEyeline|EyeIris|EyeHighlight|EyeWhite|EyeExtra)/;
  /* 描邊不進影子那一輪（PERF-WZ-DC-1107，LAWWW2-B；LAWWW-B 11-07 09:04 同意）：three-vrm 的 MToon 描邊是同一個網格的第二個材質（同一份幾何、名字 "...(Outline)"），
     影子那一輪 three.js 每個 group 用深度材質各畫一次——描邊那一份和本體的深度完全一樣（深度材質不會把描邊往外推），畫出來的影子一模一樣、白畫一次。
     主角、女主角這種會投影的人物每人 5 個（臉、身體、上衣、褲子、鞋；路人本來就不投影）。建 VRM 時記下描邊材質；engine3d.js 的 shadowLevels 在畫影子之前暫時藏起來、畫完還原。
     測試：node tests/char_outline_shadow_unit.js */
  C.OUTLINE_MATS=new Set();
  const isOutline=mt=>!!mt&&(mt.isOutline===true||/\(Outline\)$/.test(mt.name||''));
  C.shadowPassBegin=function(){ const hid=[]; for(const m of C.OUTLINE_MATS){ if(m.visible){ m.visible=false; hid.push(m); } } return hid; };
  C.shadowPassEnd=function(hid){ if(hid) for(const m of hid) m.visible=true; };
  /* 遠距離版本（PERF-CROWD-LOD-1021，LAWWW2）：無名路人離鏡頭 18 m 外（室外；原本 30 m，PERF-PATROL-ECON-1025 改）換成 tools/lod/npc_lod.py 做的低面數網格
     （2 個網格、約 6,400 三角形；原本 13～14 個網格＋描邊、約 3 萬）。綁在這個人自己的骨頭上（照骨頭名字；反向綁定矩陣用他自己 skeleton 的），
     動作、位置、朝向完全跟著原本的模型走；18 m 內完全是原本的模型。遠近由 engine3d.js 的 NPC 迴圈決定（C.setFar）；網址加 ?nofar 整個關掉（比較用）。
     明暗照 MToon 算：MToon 的直射光是 mix(陰影色, 受光色, linearstep(-1+toony, 1-toony, dotNL+shift))，陰影色＝受光色×r 時，就是 MeshToonMaterial 的漸層 r+(1-r)·linearstep(…)
     （環境光兩邊都是 irradiance×受光色）。r、toony、shift 從這個人自己的 MToon 材質讀（已經套過 C.LOOK）：身體用衣服的平均、頭髮用頭髮的。
     頂點顏色是貼圖原本的顏色：衣服和 MToon 的衣服一樣乘 CLOTH_K，皮膚乘 C.LOOK 的膚色（從皮膚材質讀）*/
  C.FAR_OUT=18; C.FAR_IN=16.5; C.FAR_OUT_IN=7; C.FAR_IN_IN=6.5; C.FAR_K=1.0;   /* 室外 18 m 外換、16.5 m 內換回來（PERF-PATROL-ECON-1025，LAWWW2-B 2026-10-25，LAWWW-B 看 18／24／30 m 並排比較圖定案：18 m 看不出差別；椰林大道往東 0.9→1.2 fps、80.6→62.6 萬三角形）。室內（教室、圖書館）7 m 外就換、6.5 m 內換回來（LAWWW2-B 2026-10-24：博雅一樓階梯教室一整班路人 361 calls、76 萬三角形 → 271、50 萬；engine3d.js 的 farWant）*/ C.farOff=typeof location!=='undefined'&&/[?&]nofar\b/.test(location.search||'');
  function farRamp(sh){ const N=32, a=new Uint8Array(N), lo=-1+sh.toony, w=Math.max(1e-3,2-2*sh.toony); for(let i=0;i<N;i++){ const s=Math.min(1,Math.max(0,((i+0.5)/N*2-1+sh.shift-lo)/w)); a[i]=Math.round(255*(sh.r+(1-sh.r)*s)); }
    const t=new THREE.DataTexture(a,N,1,THREE.RedFormat); t.minFilter=t.magFilter=THREE.LinearFilter; t.generateMipmaps=false; t.needsUpdate=true; return t; }
  function farShade(model,re){ let n=0,r=0,toony=0,shift=0, col=null; const lum=c=>0.2126*c.r+0.7152*c.g+0.0722*c.b;
    model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.isMToonMaterial||mt.isOutline||!re.test(mt.name||'')) continue;
      r+=Math.min(1,lum(mt.shadeColorFactor)/Math.max(1e-3,lum(mt.color))); toony+=mt.shadingToonyFactor; shift+=mt.shadingShiftFactor; if(!col) col=mt.color.clone(); n++; } });
    return n?{r:r/n,toony:toony/n,shift:shift/n,col}:{r:0.55,toony:0.2,shift:-0.2,col:null}; }
  function farMats(L,model){ if(L.toonReady) return; L.toonReady=true;
    const body=farShade(model,/_CLOTH/), hair=farShade(model,/HAIR/), skin=farShade(model,/_SKIN/).col; L.shade={body,hair};
    for(const p of L.parts){ const g=p.geo, cl=g.attributes._cloth, col=g.attributes.color;
      if(cl&&col&&!g.userData.clothK){ g.userData.clothK=C.CLOTH_K; g.userData.skinK=skin?[skin.r,skin.g,skin.b]:null; for(let i=0;i<col.count;i++){ const c=cl.getX(i)>0.5, kr=c?C.CLOTH_K:(skin?skin.r:1), kg=c?C.CLOTH_K:(skin?skin.g:1), kb=c?C.CLOTH_K:(skin?skin.b:1); col.setXYZ(i,col.getX(i)*kr,col.getY(i)*kg,col.getZ(i)*kb); } col.needsUpdate=true; }
      const s=p.mat; p.toon=new THREE.MeshToonMaterial({name:'npc_far',color:s.color.clone().multiplyScalar(C.FAR_K),vertexColors:!!col,map:s.map||null,alphaTest:s.alphaTest||0,side:s.side,gradientMap:farRamp(col?body:hair)}); } }
  /* 卡頓 (D)（PERF-XS-NPC-1108，LAWWW2-B 11-09；大口 1F CPU 紀錄兩次 117 ms＝projectObject → SkinnedMesh.computeBoundingSphere）：
     three.js 畫面排序（renderer.sortObjects）在每個 SkinnedMesh 第一次畫的時候呼叫 computeBoundingSphere()——frustumCulled=false 也一樣——
     逐頂點套骨頭算包圍球（頭髮 1.2～1.5 萬個頂點）：每個新的人物（池裡的新 clone、遠距離版本）第一次出現約 40～60 ms。
     不透明的網格：包圍球只拿來排先後（有深度測試，畫面一樣），先給它「靜止網格」的包圍球（每個幾何算一次、不套骨頭，同一個模型的 clone 共用）。
     透明的（眉毛、眼線、眼睛高光、睫毛、後髮）不動：它們之間的先後會影響畫面，照舊讓 three.js 第一次畫時用當下的姿勢算（頂點少，合計幾 ms）。
     C.presetSphere=false＝原本的做法。測試：node tests/skinned_sphere_unit.js */
  C.presetSphere=true; const RSPH=new WeakMap(), _rsv=new THREE.Vector3();
  function presetSphere(o){ if(!C.presetSphere||!o.isSkinnedMesh||o.boundingSphere||[].concat(o.material).some(m=>!m||m.transparent)) return;
    const g=o.geometry, p=g&&g.attributes.position; if(!p) return; let s=RSPH.get(g);
    if(!s){ s=new THREE.Sphere(); new THREE.Box3().setFromBufferAttribute(p).getCenter(s.center); let r2=0; for(let i=0;i<p.count;i++){ const d=s.center.distanceToSquared(_rsv.fromBufferAttribute(p,i)); if(d>r2) r2=d; } s.radius=Math.sqrt(r2); RSPH.set(g,s); }
    o.boundingSphere=s.clone(); }
  function attachFar(key,model){ const c=typeof ASSETS!=='undefined'&&ASSETS.cache&&ASSETS.cache[key], L=c&&c.lod; if(!L) return null;
    const bones={}, inv={}; let ref=null; model.traverse(o=>{ if(o.isBone&&!bones[o.name]) bones[o.name]=o; if(o.isSkinnedMesh&&o.skeleton){ if(!ref) ref=o; o.skeleton.bones.forEach((b,i)=>{ if(!inv[b.name]) inv[b.name]=o.skeleton.boneInverses[i]; }); } });
    if(!ref||!ref.parent||L.names.some(n=>!bones[n])) return null; farMats(L,model);
    const near=[]; model.traverse(o=>{ if(o.isSkinnedMesh&&o.visible) near.push(o); });   /* 原本的網格（配件是一般網格，不在這裡：遠處照樣看得到）*/
    const parts=L.parts.map(p=>{ const sm=new THREE.SkinnedMesh(p.geo,p.toon); sm.name='npc_far'; sm.frustumCulled=false; presetSphere(sm); sm.castShadow=false; sm.receiveShadow=false; sm.visible=false;
      sm.position.copy(ref.position); sm.quaternion.copy(ref.quaternion); sm.scale.copy(ref.scale);   /* 和原本的網格同一個父節點、同一個變換＝同一個綁定空間 */
      sm.bind(new THREE.Skeleton(L.names.map(n=>bones[n]),L.names.map((n,i)=>(inv[n]||L.ibm[i]).clone())),ref.bindMatrix.clone()); sm.bindMode=ref.bindMode; ref.parent.add(sm); return sm; });
    return {parts,near}; }
  C.setFar=function(h,far){ const u=h&&h.userData, f=u&&u.farLOD; if(!f) return false; far=!!far&&!C.farOff; if(!!u.isFar===far) return true; u.isFar=far; for(const o of f.near) o.visible=!far; for(const p of f.parts) p.visible=far; if(!far){ const sbm=u.vrm&&!u.vrm.lite&&u.vrm.springBoneManager; if(sbm) try{ sbm.reset(); }catch(e){} } return true; };   /* 切回近的：彈簧骨從靜止的樣子重新開始（遠的時候沒有跑，留著舊的狀態會甩一下）*/
  /* 坐下往下移多少（SIT-HEIGHT-1104，LAWWW2-C 11-04；LAWWW-C 22:57Z、BB-C 22:43「坐的高度不對，桌子在胸口、頭埋到碗上」、22:55「階梯教室大腿陷進椅面」）：
     原本一律往下 0.47 m×身高比例（照 vroid_npc_m1 校的）。在遊戲自己的骨架、靜態坐姿量（tools/anim/sit_fit_survey.js）：大腿底部（坐姿時椅面後段最低的那一點）
     原本離座位地面 0.32～0.48 m（中位數 0.37）——椅面 0.45～0.485，女生、女主角陷進去 10～15 cm，連 npc_m1 也陷 6 cm（椅面 0.485）。
     改成照每個模型自己的比例：C.SIT_FIT['檔名']＝[ul, bt]（ul＝大腿根離腳底 ÷ 身高、bt＝坐姿大腿根到大腿底部 ÷ 身高；裙子量不到大腿的用 0.06），
     往下＝身高×(ul−bt)−(SIT_TOP−SIT_PRESS) → 每個人的大腿底部都在座位地面上 0.465 m：遊戲的椅子 0.45～0.485（教室翻椅、Café 0.47～0.475），
     0.485 的椅子陷 2 cm、0.45 的長椅浮 1.5 cm。表裡沒有的（GLB、vrm_player）照舊 0.47×身高比例。
     知道座面高度的位子（高腳椅、鞦韆、腳踏車後座）：人物往上抬＝座面－SIT_TOP（C.sitButtOf＝坐下以後大腿底部離座位地面多高）。
     改了靜態坐姿的腿（SIT_VRM）、人物縮放、VRM 檔：重跑 node tools/anim/sit_fit_survey.js 出.json --js 表.js，貼回 C.SIT_FIT。測試：node tests/sit_height_unit.js */
  C.SIT_FIT={'bl_classmate_bohan.vrm':[0.5469,0.059],'bl_classmate_peishan.vrm':[0.5511,0.06],'bl_classmate_xinci.vrm':[0.5511,0.06],'bl_heroine_02.vrm':[0.5627,0.0574],'bl_kexin.vrm':[0.5627,0.0861],'bl_npc_nf1.vrm':[0.5627,0.0703],'bl_npc_nf10.vrm':[0.5627,0.06],'bl_npc_nf11.vrm':[0.5504,0.0735],'bl_npc_nf12.vrm':[0.5504,0.06],'bl_npc_nf13.vrm':[0.5627,0.0703],'bl_npc_nf14.vrm':[0.5504,0.06],'bl_npc_nf15.vrm':[0.5504,0.0735],'bl_npc_nf16.vrm':[0.5627,0.06],'bl_npc_nf17.vrm':[0.5504,0.06],'bl_npc_nf18.vrm':[0.5504,0.0735],'bl_npc_nf19.vrm':[0.5627,0.06],'bl_npc_nf2.vrm':[0.5504,0.0597],'bl_npc_nf20.vrm':[0.5504,0.06],'bl_npc_nf3.vrm':[0.5627,0.0591],'bl_npc_nf4.vrm':[0.5504,0.0735],'bl_npc_nf5.vrm':[0.5504,0.0735],'bl_npc_nf6.vrm':[0.5504,0.0735],'bl_npc_nf7.vrm':[0.5627,0.0591],'bl_npc_nf8.vrm':[0.5504,0.0597],'bl_npc_nf9.vrm':[0.5504,0.06],'bl_npc_nm1.vrm':[0.5463,0.0589],'bl_npc_nm10.vrm':[0.5791,0.0482],'bl_npc_nm11.vrm':[0.5463,0.071],'bl_npc_nm12.vrm':[0.5791,0.0482],'bl_npc_nm13.vrm':[0.5463,0.0589],'bl_npc_nm14.vrm':[0.5791,0.0558],'bl_npc_nm15.vrm':[0.5463,0.0589],'bl_npc_nm16.vrm':[0.5791,0.0482],'bl_npc_nm17.vrm':[0.5463,0.0589],'bl_npc_nm18.vrm':[0.5791,0.0482],'bl_npc_nm19.vrm':[0.5463,0.0589],'bl_npc_nm2.vrm':[0.5791,0.0482],'bl_npc_nm20.vrm':[0.5791,0.0558],'bl_npc_nm3.vrm':[0.5463,0.0589],'bl_npc_nm4.vrm':[0.5791,0.0482],'bl_npc_nm5.vrm':[0.5463,0.0589],'bl_npc_nm6.vrm':[0.5791,0.0482],'bl_npc_nm7.vrm':[0.5463,0.0589],'bl_npc_nm8.vrm':[0.5791,0.0482],'bl_npc_nm9.vrm':[0.5463,0.0589],'bl_prof_wei.vrm':[0.5475,0.0614],'bl_su.vrm':[0.5627,0.0703],'bl_su_apron.vrm':[0.5627,0.0703],'bl_xiuqin.vrm':[0.5497,0.06],'bl_xiuqin_apron.vrm':[0.5497,0.06],'bl_yu.vrm':[0.5408,0.06],'bl_zhe.vrm':[0.5785,0.0481],'vrm_sample.vrm':[0.5333,0.0534],'vroid_heroine_01.vrm':[0.5363,0.0661],'vroid_heroine_03.vrm':[0.5349,0.0643],'vroid_heroine_04.vrm':[0.5516,0.0731],'vroid_heroine_05.vrm':[0.5402,0.0632],'vroid_npc_f1.vrm':[0.5402,0.0632],'vroid_npc_f2.vrm':[0.5562,0.0599],'vroid_npc_m1.vrm':[0.5751,0.0648],'vroid_npc_m2.vrm':[0.5417,0.0589],'vroid_yuting.vrm':[0.5417,0.0634]};
  C.SIT_TOP=0.47; C.SIT_PRESS=0.005;
  const sitFit=url=>url&&C.SIT_FIT[String(url).split('/').pop()];
  C.sitDropOf=function(url,H){ const f=sitFit(url); return f?+(H*(f[0]-f[1])-(C.SIT_TOP-C.SIT_PRESS)).toFixed(4):0.47*H/1.75; };
  C.sitButtOf=function(spec){ const m=spec&&typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.manifest[spec.model], H=(spec&&spec.height)||(m&&m.height)||1.7; return m&&sitFit(m.url)?C.SIT_TOP-C.SIT_PRESS:0.47*H/1.75; };   /* 坐下以後大腿底部離座位地面多高（鞦韆這種知道座面的位子：抬高＝座面－這個）；表裡沒有的照舊（原本的鞦韆算法）*/
  const sitDrop=u=>u.sitDrop!=null?u.sitDrop:0.47*(u.k||1);
  C.sitDrop=h=>sitDrop((h&&h.userData)||{});   /* 測試用 */
  function buildVRM(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const e=ASSETS.acquireVRM(key); if(!e) throw new Error('no free VRM instance'); const vrm=e.vrm; const model=vrm.scene; const hide=m.hide||[]; const realShadow=!m.ambient; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=realShadow&&!FACE_PART.test((o.material&&o.material.name)||''); if(o.castShadow&&Array.isArray(o.material)) for(const mt of o.material) if(isOutline(mt)) C.OUTLINE_MATS.add(mt); o.receiveShadow=false; o.frustumCulled=false; presetSphere(o); if(hide.some(h=>o.name===h||o.name.startsWith(h))) o.visible=false; } }); /* 衣服材質整體壓暗一點：MToon 的卡通明暗讓受光面拿到整個太陽亮度（不乘入射角），中午的淺色衣服（米白、淺灰）會曝成全白、看不出顏色。只動 _CLOTH 材質（皮膚、臉、頭髮、眼睛不動）；材質在 pool 裡共用，用 userData 記號避免重複壓暗 */ model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.name||mt.userData.clothK||!/_CLOTH/.test(mt.name)) continue; mt.userData.clothK=C.CLOTH_K; if(mt.color) mt.color.multiplyScalar(C.CLOTH_K); if(mt.shadeColorFactor) mt.shadeColorFactor.multiplyScalar(C.CLOTH_K); } });
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
    let props=null; const mf=typeof ASSETS!=='undefined'&&ASSETS.manifest[key]; const plist=spec.props||(mf&&mf.blProps&&mf.url===mf.blUrl?mf.blProps:null)||C.MODEL_PROPS[key];   /* ?blchar 用 Blender 版時可以換一組配件（blProps：溫書瑀的 Blender 頭髮自己有髮圈，不再掛遊戲的髮圈） */ if(plist&&plist.length&&typeof PROPS!=='undefined'){ try{ props=PROPS.attach(vrm,plist,{shadow:realShadow}); }catch(err){ console.warn('props failed',key,err); } }
    root.userData={driver:'vrm',spec,k:H/1.75,sitDrop:C.sitDropOf(m.url,H),parts:{},model:wrap,vrm,key,v0,sx,tinted,props,full:!!e.full,armOut:(+e.armOut||0)*Math.PI/180,armBack:+e.armBack||0,armFwd:+e.armFwd||0,bones:B,look,headY,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0,blink:2+Math.random()*3,blinkT:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    // 彈簧骨（頭髮、馬尾）在人物自己的座標系模擬：瞬移、換區域、坐下起身時頭髮不會被甩飛（要在 root.userData 設定之後：three-vrm 把反矩陣快取放在 center.userData）
    /* 體態第二階段（GYM-FIT-1107，LAWWW2-B 11-07；使用者 11-07「肌肉線條更明顯」）：玩家 VRM 的身體＋衣服（含系外套）有 morph target「fit」（tools/anim/fit_body_morph.py：
       沿上臂、前臂、肩、胸、大腿、小腿往外撐，二頭肌、三角肌、胸肌、小腿肚有隆起；腰微收；和離骨頭軸的距離成比例，衣服在外面撐得多一點，不會穿模）。
       強度 u.fitBody（0～1，fit3d.js 照體能四階設；下面 animate 套上）；骨頭長度不變：動作、腳步貼合、坐姿不受影響。沒有這個 morph 的模型不受影響 */
    { const fm=[]; model.traverse(o=>{ const d=o.isMesh&&o.morphTargetDictionary; if(d&&d.fit!=null&&o.morphTargetInfluences) fm.push([o,d.fit]); }); if(fm.length){ root.userData.fitMorph=fm; root.userData.fitMorphW=0; } }
    /* 裙子的輔助骨頭（VRM 節點的 extras.drive；PS-SKIRT-LEG，LAWWW2 2026-10-22）：沛珊長裙前片中間的「第三條腿」skirt_F／skirt_F_lo＝兩條腿（真實骨架）相對靜止姿勢的旋轉做 slerp，
       偏向往前抬的那一條：t＝0.5＋(max−0.5)·tanh(dir·(抬起角度差)／sig)；後片 skirt_BL／BR（_lo）＝同一側的腿，只在腿往後時才轉（gate；坐下、腿往前時不轉，和原本一樣）。權重在 VRM 裡（tools/blender/char_second/peishan_skirt_bones.py）；沒有這種節點的模型不受影響 */
    { const hu=vrm.humanoid, raw=n=>hu.getRawBoneNode(n), hp=raw('hips'), drv=[]; if(hp){ model.updateMatrixWorld(true); const hq=hp.getWorldQuaternion(new THREE.Quaternion()).invert(), dn=new THREE.Vector3(0,-1,0).applyQuaternion(hq), fw=new THREE.Vector3(0,0,1).applyQuaternion(hq), i0=b=>b.quaternion.clone().invert();
      model.traverse(o=>{ const d=o.userData&&o.userData.drive; if(!d||!d.from) return; const lf=d.lift||d.from, A=raw(d.from[0]), Bb=d.from[1]?raw(d.from[1]):null, LA=raw(lf[0]), LB=lf[1]?raw(lf[1]):null; if(!A||!LA||(d.from[1]&&!Bb)||(lf[1]&&!LB)) return;
        const ch=d.net&&d.net.map(raw); if(d.net&&(!ch[0]||(d.from[1]&&!ch[1]))) return;
        drv.push({o,A,B:Bb,LA,LB,A0:i0(A),B0:Bb&&i0(Bb),LA0:i0(LA),LB0:LB&&i0(LB),CA:ch&&ch[0],CB:ch&&ch[1],CA0:ch&&i0(ch[0]),CB0:ch&&ch[1]&&i0(ch[1]),dn,fw,dir:d.dir||1,max:d.max==null?0.85:+d.max,sig:+d.sig||0.3,gate:Array.isArray(d.gate)&&d.gate.length===4?d.gate.map(Number):null}); }); }
      if(drv.length) root.userData.drive=drv; }
    const sbm=vrm.springBoneManager; if(sbm){ try{ sbm.reset(); sbm.joints.forEach(j=>{ j.center=root; }); root.updateMatrixWorld(true); sbm.setInitState(); }catch(err){ console.warn('spring bone center',err); } }
    root.userData.farLOD=attachFar(key,model);   /* 無名路人的遠距離版本（有的話；預設藏著）*/
    /* 坐下用的裙子形狀（SKIRT-BENCH-CLIP-1105，LAWWW2-B 11-07）：裙子網格的 morph target「skirt_sit」（tools/anim/skirt_sit_morph.js 照遊戲的坐姿算：跟大腿、膝蓋以下垂下、攤在椅面上），
       靜態坐姿時開、其他時候關（下面 animate）；遠距離版本（npc_far）同一份位移，GLTFLoader 沒有把名字放在幾何上：只有一個 morph 的就是它 */
    { const sm=[]; model.traverse(o=>{ const ma=o.isMesh&&o.geometry&&o.geometry.morphAttributes&&o.geometry.morphAttributes.position; if(!ma||!ma.length) return; const d=o.morphTargetDictionary, i=d&&d.skirt_sit!=null?d.skirt_sit:(o.name==='npc_far'&&ma.length===1?0:-1); if(i>=0&&o.morphTargetInfluences) sm.push([o,i]); }); if(sm.length){ root.userData.sitMorph=sm; root.userData.sitMorphW=0; } }
    return root; }
  C.MODEL_PROPS={'char.xiuqin':[{name:'glasses',glb:'prop.glasses_xiuqin'}],'char.xiuqin_apron':[{name:'glasses',glb:'prop.glasses_xiuqin'}],   /* 秀琴姨（LAWWW2 d2a809aa4）：圍裙在 VRM 裡（xiuqin_apron 那一支），兩支都戴老花眼鏡 */'char.classmate_bohan':[{name:'glasses',glb:'prop.glasses_bohan'},'backpack'],'char.classmate_peishan':[{name:'glasses',glb:'prop.glasses_peishan'}],'char.us_long':[{name:'glasses',glb:'prop.glasses_long'},'backpack','keychain_milktea'],'char.limao_shangshi':[{name:'glasses',glb:'prop.glasses_shangshi'}],   /* 禮貌生財上師（LAWWW2 LIMAO-SHANGSHI-3D-1111）：帽子、鬍子、圍巾在 VRM 裡，只有圓框細金屬眼鏡是配件 */   /* 何俊朗（LAWWW2 US-LONG-3D-1110）：圓框眼鏡、後背包、背包上的奶茶杯鑰匙圈（AA_80 5-2）*/'char.prof_wei':[{name:'glasses',glb:'prop.glasses_wei'}],'char.yu':['bag_yu'],   /* 許柏翰（?blchar）：方框眼鏡＋後背包（LAWWW2 VISUAL_REVIEW 32.4 的設定）*/
    'char.yuting':['backpack'],'char.heroine_01':['tote'],'char.heroine_02':['glasses','earrings','apron'],'char.heroine_03':[{name:'backpack',drop:-0.07,flat:[0.04,0.008],strap:[[0.075,0.05,0.086],[0.092,0.096,0.05],[0.1,0.117,0.0],[0.103,0.097,-0.03],[0.106,0.072,-0.062],[0.11,0.04,-0.086],[0.118,0.0,-0.112],[0.13,-0.045,-0.1],[0.145,-0.085,-0.055],[0.142,-0.115,0.0],[0.13,-0.2,0.06],[0.12,-0.27,0.09]]}],'char.heroine_04':[{name:'guitar',x:0.0,z:0.235,tilt:-0.05,flat:[0.042,0.008],straps:[[0.07,0.06,0.15],[0.1,0.128,0.075],[0.105,0.146,0.03],[0.105,0.136,0.0],[0.105,0.126,-0.03],[0.105,0.094,-0.062],[0.107,0.06,-0.088],[0.108,0.02,-0.12],[0.112,-0.04,-0.132],[0.13,-0.09,-0.127],[0.155,-0.13,-0.085],[0.172,-0.17,-0.02],[0.162,-0.25,0.07],[0.12,-0.33,0.15]]},'laptop_lap'],'char.heroine_05':['folder','hairtie']};
  // 切換配件（例：林芷若在 Café 工作時才穿圍裙）
  C.setProp=function(h,name,on){ const u=h&&h.userData; const o=u&&u.props&&u.props[name]; if(!o) return false; o.visible=!!on; (u.propOn=u.propOn||{})[name]=!!on; return true; };
  /* 身上帶著的東西（包、吉他、資料夾、圍裙、安全帽…；眼鏡、耳環、髮圈不算）先拿下來，回傳還原的函式（BADCLIP-BAG-1027：使用者 10-27 22:4x「打羽球男主角還背著背包什麼意思」）。
     還原照原本的開關：原本沒設過的（propOn 沒有這一項）拿掉設定、照原本看不看得到；還原時傳現在的人物（中途換過模型 C.upgrade 的話是新的那一個）*/
  C.CARRY=['backpack','tote','guitar','bag_yu','folder','apron','helmet','foodmap','thermos','camera_film','thermos_silver','sports_drink','recorder','cooler_bag','novel','notebook_q','handouts','audio_cable','ladle','mug','lawbook'];   /* 後面十二個：同學、標籤同伴的隨身道具（NPC-POOL-ART-1028、HEROINE-LIFE-NPC3D-1028）*/
  C.carryOff=function(h){ const u=h&&h.userData; if(!u||!u.props) return ()=>{}; const was=[];
    for(const k of C.CARRY){ const o=u.props[k]; if(!o) continue; const on=u.propOn&&Object.prototype.hasOwnProperty.call(u.propOn,k)?u.propOn[k]:undefined; was.push([k,on,o.visible]); C.setProp(h,k,false); }
    return h2=>{ const x=h2||h, v=x&&x.userData; if(!v) return; for(const [k,on,vis] of was){ if(on!==undefined){ C.setProp(x,k,on); continue; } if(v.propOn) delete v.propOn[k]; const o=v.props&&v.props[k]; if(o) o.visible=vis; } }; };
  /* 祐廷的健身短袖運動服（GYM-FIT-1107 ③，LAWWW2-B 11-07；LAWWW-B 05:46 定案，人物外觀 D128）：VRM 裡的 GYM_TOP、GYM_SHORTS（tools/gym_wear.py；同一副骨架、一樣有 fit 形狀；manifest 的 hide 先藏）。
     穿上＝顯示運動服，藏原本的上衣（Body 的 _Tops_ 那一塊）、褲子（_Bottoms_），拿下後背包；脫下＝照原樣（後背包照穿之前的狀態）。鞋子照舊。
     什麼時候穿由 FIT.gymWearSync 決定（B1、體育課）；每次重建人物模型後要再呼叫一次（buildVRM 照 manifest hide 先藏；CHAR.upgrade 會帶過去）*/
  C.setGymWear=function(h,on){ const u=h&&h.userData; if(!u||u.driver!=='vrm'||!u.model) return false; on=!!on; let n=0;
    u.model.traverse(o=>{ if(o.isMesh&&(o.name==='GYM_TOP'||o.name==='GYM_SHORTS')){ o.visible=on; n++; } }); if(!n) return false;
    u.model.traverse(o=>{ if(!o.isMesh||!o.parent||o.parent.name!=='Body') return; const mn=((Array.isArray(o.material)?o.material[0]:o.material)||{}).name||''; if(/_(Tops|Bottoms)_\d+_CLOTH/.test(mn)) o.visible=!on; });
    const was=!!u.gymWear; u.gymWear=on;
    const bp=u.props&&u.props.backpack;
    if(bp&&on&&!was){ u.gymBp=u.propOn&&Object.prototype.hasOwnProperty.call(u.propOn,'backpack')?u.propOn.backpack:null; C.setProp(h,'backpack',false); }   /* null＝原本沒設過（照角色預設顯示）*/
    else if(bp&&!on&&was){ if(u.gymBp==null){ if(u.propOn) delete u.propOn.backpack; bp.visible=true; } else C.setProp(h,'backpack',u.gymBp); u.gymBp=undefined; }
    return true; };
  C.release=function(h){ const u=h&&h.userData; if(!u||u.driver!=='vrm') return; try{ if(u.farLOD){ for(const p of u.farLOD.parts){ if(p.parent) p.parent.remove(p); p.skeleton.dispose(); } if(u.isFar) for(const o of u.farLOD.near) o.visible=true; u.farLOD=null; u.isFar=false; }   /* 遠距離版本：拿掉、骨架貼圖放掉；原本的網格恢復顯示（第一個實例會被下一個人重用）*/ if(u.props&&typeof PROPS!=='undefined') PROPS.detach(u.props); u.props=null; if(u.taskProps){ for(const k in u.taskProps){ const o=u.taskProps[k]; if(o&&o.parent) o.parent.remove(o); } u.taskProps=null; u.taskPropOn=null; } if(u.gymProp){ for(const k in u.gymProp) for(const o of u.gymProp[k]) if(o.parent) o.parent.remove(o); u.gymProp=null; u.gymPropOn=null; }   /* 健身房手上的道具（GYM-FIT-PROPS-1103）*/   /* 坐著做事的配件（掛在真實骨頭上：VRM 的第一個實例會被下一個人重用）*/ const sbm=u.vrm.springBoneManager; if(sbm) sbm.joints.forEach(j=>{ j.center=null; }); }catch(e){} try{ for(const n in u.anim.actions) u.anim.actions[n].stop(); u.anim.mixer.stopAllAction(); u.vrm.humanoid.resetNormalizedPose(); if(u.vrm.expressionManager) u.vrm.expressionManager.expressions.forEach(ex=>u.vrm.expressionManager.setValue(ex.expressionName,0)); for(const t of (u.tinted||[])){ const cur=Array.isArray(t.mesh.material)?t.mesh.material:[t.mesh.material]; const orig=Array.isArray(t.orig)?t.orig:[t.orig]; cur.forEach((mt,i)=>{ if(mt!==orig[i]){ C.rimMats.delete(mt); if(mt.dispose) mt.dispose(); } }); t.mesh.material=t.orig; } u.tinted=[]; }catch(e){} ASSETS.releaseVRM(u.key,u.vrm); };
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
  // 坐姿的腳（2026-10-10）：坐姿把人物往下移 0.47 m×身高比例讓臀部對到椅面、小腿用固定角度垂下——小腿加腳比椅面高的人物（六位主要人物都是），
  // 腳底沉到地面下 12～14 cm（tests/sit_feet_unit.js），穿短褲的高子晴看起來小腿斷在地面。這裡在真實骨架上讓腳踝停在「站著時腳踝離地的高度」：
  // 先把大腿往上抬（膝蓋比臀部高一點，像坐在比較矮的椅子上；小腿維持原本的方向），抬到上限還不夠才讓小腿往前伸；腳掌保持原本的方向。
  //（SIT-HEIGHT-1104 以後往下多少照每個模型的大腿厚度（C.sitDropOf），沉下去的少很多；腿比較短的人坐 0.47 m 以上的椅子腳會懸空：反過來把大腿往下放。）
  // （第一版只把小腿往前伸：麵店的椅子上小腿斜 45°、腳伸到桌子底下 70 cm，像半躺著。）站著時量腳踝高度（同一個模型共用），沒量過就用 0.085×身高比例。
  /* 騎腳踏車（rideIK）：車在人物的父節點（玩家的控制器）底下、和人物同一個座標——車頭朝 +z、地面 y=0、中心線 x=0（LAWWW2 bike_ride.glb 的尺寸表，
     VISUAL_REVIEW（second_ai）第 19 節）。在真實骨架上：①整個人物往上、往後移，髖關節在座墊上方（坐骨在座墊頂後面 3–5 cm；腿伸不到最下面的踏板時座位放低一點）；
     ②兩段式 IK：腳踝到踏板（曲柄角度 u.ride.crank，0＝右曲柄朝前；往前騎角度變大），膝蓋往前；手腕到把手握點，手肘往外下。 */
  const BIKE_G={saddle:[0,0.935,-0.31], grip:[0.29,1.06,0.083], bb:[0,0.285,-0.045], crank:0.165, pedalX:0.115};
  const ARMS=[['leftUpperArm','leftLowerArm','leftHand'],['rightUpperArm','rightLowerArm','rightHand']];
  const ARMQ=new THREE.Quaternion(), ARMZ=new THREE.Vector3(0,0,1), ARMX=new THREE.Vector3(1,0,0), ARMV=new THREE.Vector3();
  const OVQ=new THREE.Quaternion(), OVE=new THREE.Euler();   /* 疊加姿勢 u.overlay（羽球揮拍，src/badminton_clip3d.js）*/
  /* 裙子的輔助骨頭（見建立 VRM 的地方）：在腳步貼合之後（真實骨架的腿已經是最後的角度） */
  const SKQ=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()], SKV=new THREE.Vector3();
  function skirtLift(b,q0,d){ SKQ[2].copy(b.quaternion).multiply(q0); SKV.copy(d.dn).applyQuaternion(SKQ[2]); return Math.atan2(SKV.dot(d.fw),SKV.dot(d.dn)); }
  /* gate＝[a,b,kmin,kmax]：只跟一部分（kmin～kmax），照那條腿往 dir 抬多少（弧度，sstep(a,b,dir·抬起角度)）；例：後片只在腿往後時跟著腿 */
  /* net＝[大腿,…]：下半段照「大腿×小腿」合起來的方向（相對臀部）算，再扣掉上半段那根骨頭已經轉的：gate 只跟一部分時，坐下（大腿往前 90°、小腿往回 90°）後片照樣垂直往下 */
  function skirtDrive(D){ for(const d of D){ const la=skirtLift(d.LA,d.LA0,d), lb=d.LB?skirtLift(d.LB,d.LB0,d):la; SKQ[0].copy(d.A.quaternion).multiply(d.A0); if(d.CA) SKQ[0].premultiply(SKQ[2].copy(d.CA.quaternion).multiply(d.CA0));
      if(d.B){ const t=0.5+(d.max-0.5)*Math.tanh(d.dir*(la-lb)/d.sig); SKQ[1].copy(d.B.quaternion).multiply(d.B0); if(d.CB) SKQ[1].premultiply(SKQ[2].copy(d.CB.quaternion).multiply(d.CB0)); d.o.quaternion.slerpQuaternions(SKQ[1],SKQ[0],t); } else d.o.quaternion.copy(SKQ[0]);
      if(d.gate){ const g=d.gate, L=d.dir>0?Math.max(la,lb):Math.min(la,lb), x=Math.min(1,Math.max(0,(d.dir*L-g[0])/(g[1]-g[0]))); d.o.quaternion.slerp(SKQI,1-(g[2]+(g[3]-g[2])*x*x*(3-2*x))); }
      if(d.CA) d.o.quaternion.premultiply(SKQ[2].copy(d.o.parent.quaternion).invert()); } }
  const SKQI=new THREE.Quaternion(); C._skirtDrive=skirtDrive;   // 單元測試用（tests/skirt_drive_unit.js）
  const RV=[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3());
  function ik2(a,b,c,T,pole){ const A=a.getWorldPosition(RV[0]), K=b.getWorldPosition(RV[1]), C0=c.getWorldPosition(RV[2]); const la=A.distanceTo(K), lb=K.distanceTo(C0); if(la<1e-4||lb<1e-4) return false;
    const d=Math.min(la+lb-1e-4,Math.max(Math.abs(la-lb)+1e-4,A.distanceTo(T)));
    const u1=RV[3].copy(A).sub(K), v1=RV[4].copy(C0).sub(K), cur=u1.angleTo(v1), tgt=Math.acos(Math.max(-1,Math.min(1,(la*la+lb*lb-d*d)/(2*la*lb))));
    let n=new THREE.Vector3().crossVectors(u1,v1); if(n.lengthSq()<1e-10) n.crossVectors(RV[5].copy(pole).sub(A),RV[6].copy(T).sub(A)); if(n.lengthSq()<1e-10) return false; n.normalize(); rotWorld(b,n,tgt-cur);   /* 中間的關節（膝蓋、手肘）*/
    const c2=c.getWorldPosition(RV[2]).sub(a.getWorldPosition(RV[0])), t2=RV[5].copy(T).sub(RV[0]); const ax=new THREE.Vector3().crossVectors(c2,t2); if(ax.lengthSq()>1e-12){ ax.normalize(); rotWorld(a,ax,c2.angleTo(t2)); }   /* 根（大腿、上臂）對準 */
    const axis=RV[6].copy(T).sub(a.getWorldPosition(RV[0])).normalize(), kb=b.getWorldPosition(RV[1]).sub(RV[0]), pp=RV[7].copy(pole).sub(RV[0]);   /* 繞根到目標的軸轉：中間的關節轉向 pole 那一邊 */
    kb.addScaledVector(axis,-kb.dot(axis)); pp.addScaledVector(axis,-pp.dot(axis)); if(kb.lengthSq()>1e-10&&pp.lengthSq()>1e-10){ let ang=kb.angleTo(pp); if(new THREE.Vector3().crossVectors(kb,pp).dot(axis)<0) ang=-ang; rotWorld(a,axis,ang); }
    return true; }
  function rideIK(h,u){ const hm=u.vrm.humanoid; const R=u.rawRide||(u.rawRide=(()=>{ const o={hips:hm.getRawBoneNode('hips')}; for(const L of LEGS.concat(ARMS)) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(!R.hips||LEGS.concat(ARMS).some(L=>L.slice(0,3).some(n=>!R[n]))) return; const w=u.model, base=w.userData.baseY||0, cr=u.ride.crank||0;
    // ① 髖關節對座墊：先放回原位量一次（腿長、髖關節在控制器座標裡的位置）
    w.position.set(w.position.x,base,0); h.updateWorldMatrix(true,true);
    const hip0=h.worldToLocal(R.hips.getWorldPosition(RV[0]).clone()), lup=R.leftUpperLeg.getWorldPosition(RV[1]), llo=R.leftLowerLeg.getWorldPosition(RV[2]), lft=R.leftFoot.getWorldPosition(RV[3]);
    const sc=h.getWorldScale(RV[4]).y||1, leg=(lup.distanceTo(llo)+llo.distanceTo(lft))/sc, hipDown=h.worldToLocal(lup.clone()).y-hip0.y;   /* 大腿根和 hips 骨頭的高度差（通常略低）*/
    const k=u.ride.scale||1, bb=[0,BIKE_G.bb[1]*k,BIKE_G.bb[2]*k], cl=BIKE_G.crank*k, sd=[0,BIKE_G.saddle[1]*k,BIKE_G.saddle[2]*k];   /* 車的尺寸（k：bike3d.js 依身高選，矮的人騎小一號的車）；腳踝離踏板軸的偏移是腳的大小，不縮放 */
    const ankBot=[0,bb[1]-cl+0.07,bb[2]-0.05], hz=sd[2]-0.025;   /* 坐骨在座墊頂後面一點 */
    const reach=Math.sqrt(Math.max(0,Math.pow(leg*0.985,2)-Math.pow(hz-ankBot[2],2)))+ankBot[1];   /* 腿伸直時髖關節最高能到哪裡（踏板在最下面）*/
    const hipY=Math.min(sd[1]+0.08,reach-hipDown);
    w.position.y=base+(hipY-hip0.y); w.position.z=hz-hip0.z; h.updateWorldMatrix(true,true);
    // ② 腳：腳踝到踏板（右曲柄角度 cr、左邊差 180°）；膝蓋往前、往外一點
    const fwd=new THREE.Vector3(0,0,1).applyQuaternion(h.getWorldQuaternion(new THREE.Quaternion()));
    for(const [i,side] of [[0,1],[1,-1]]){ const L=LEGS[i], th=side<0?cr:cr+Math.PI; const pl=new THREE.Vector3(side*BIKE_G.pedalX*k,bb[1]-Math.sin(th)*cl+0.07,bb[2]+Math.cos(th)*cl-0.05);
      const T=h.localToWorld(pl), hipW=R[L[0]].getWorldPosition(new THREE.Vector3()); const pole=hipW.clone().addScaledVector(fwd,1.0).add(h.localToWorld(new THREE.Vector3(side*0.15,0,0)).sub(h.getWorldPosition(new THREE.Vector3())));
      R[L[2]].getWorldQuaternion(IKQ[3]); ik2(R[L[0]],R[L[1]],R[L[2]],T,pole); R[L[2]].parent.getWorldQuaternion(IKQ[0]); R[L[2]].quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); R[L[2]].updateWorldMatrix(false,true); }   /* 腳掌保持底子的方向 */
    // ③ 手：手腕到把手握點；手肘往外、往下
    for(const [i,side] of [[0,1],[1,-1]]){ const L=ARMS[i], g=u.ride.grips&&u.ride.grips[i]; const T=h.localToWorld(g?new THREE.Vector3(g[0],g[1],g[2]):new THREE.Vector3(side*BIKE_G.grip[0]*k,(BIKE_G.grip[1]+0.01)*k,(BIKE_G.grip[2]-0.03)*k));   /* 把手轉了：bike3d.js 給轉過的握點（已經含車的尺寸）*/
      const sh=R[L[0]].getWorldPosition(new THREE.Vector3()); const pole=h.localToWorld(h.worldToLocal(sh.clone()).add(new THREE.Vector3(side*0.6,-0.5,-0.2)));
      ik2(R[L[0]],R[L[1]],R[L[2]],T,pole); } }
  /* 爬宿舍上舖的梯子（pose climb；CLIMB-POSE-1102，使用者 11-02「走上床手為什麼要往上抬高阿 好像殭屍」）：在真實骨架上、和 rideIK 同一套兩段式 IK（ik2）。
     ① 上身往前靠向梯子（脊椎 lean、胸口 chest，繞人物的左右軸），頭抬回來一點看上面（neck）；
     ② 兩手各抓梯子的一側：離身體中線 side，高度在肩膀下 lo（胸口）到肩膀上 hi（額頭）之間、在肩膀前面 fwdLo～fwdHi；手肘往下、往外彎（pole）；
     ③ 兩手交替往上換手、跟腳一致：走路片段裡哪一隻腳在前面（往上一階踩），對側的手就在上面——左右膝蓋（相對大腿根）的前後差換算成 0～1，
        兩端飽和一點（手在最上面、最下面停一下＝抓住），中間平滑變化；
     ④ 剛開始爬（從站姿換過來）blend 秒內從片段的手漸漸抓上去（緩進緩出；一般是踩上第一階的時候抓到），不跳格。數值都乘身高比例 u.k。
     u.climbTop（世界座標的高度，story3d.js 爬宿舍梯子時設＝床欄頂）：手最高只到這裡（上面幾階兩手都在床欄頂附近，高的那隻高 8 cm）。
     ⑤ 手指往掌心彎（grip：指根、中節、末節的弧度）＝握住梯子，不是張開手掌。
     u.climbHi＝[左手, 右手] 的高度（0＝胸口、1＝最上面），測試用（tests/climb_pose_unit.js）。C.climbIK=false 可以關掉比較（手照走路片段擺）*/
  C.climbIK=true;
  C.CLIMB={side:0.2,lo:-0.12,hi:0.27,fwdLo:0.24,fwdHi:0.3,amp:0.3,lean:0.14,chest:0.06,neck:-0.16,blend:0.7,grip:[0.75,0.9,0.6]};
  const CLQ=new THREE.Quaternion(), CLV=[0,1,2,3,4,5].map(()=>new THREE.Vector3());
  /* part：'lean'＝① 上身＋③ 換手的節奏（在 headFit 以前）、'arms'＝② 手＋⑤ 握住（在 headFit 以後：彎腰、蹲低以後手照肩膀新的位置抓）。
     權重 u.climbW 在 animateVRM 算（換成爬梯子 blend 秒內 0→1、換成別的姿勢 1→0：爬到最上面換成跪上床時手慢慢放開，不跳格；DORM-LADDER-STOOP-1103）*/
  function climbIK(h,u,part){ if(!C.climbIK) return; const hm=u.vrm.humanoid, K=C.CLIMB, k=u.k||1;
    const R=u.rawClimb||(u.rawClimb=(()=>{ const o={}; for(const n of ['spine','chest','neck']) o[n]=hm.getRawBoneNode(n); for(const L of LEGS.concat(ARMS)) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(LEGS.concat(ARMS).some(L=>L.slice(0,3).some(n=>!R[n]))) return;
    const w0=u.climbW||0; if(!(w0>0)) return; const w=w0*w0*(3-2*w0);   /* 緩進緩出 */
    { const LS=u.ladder||u.ladLast, G=LS?ladGeo(LS):null;   /* 宿舍的梯子（u.ladder＝sleep_scene）：手抓扶手、腳踩踏階（下面 ladderLean／ladderArms，CLIMB-GRIPS-FEET-1105）*/
      if(G){ u.ladLast=LS; if(part==='lean') ladderLean(h,u,G,R,w); else if(u.ladSt&&u.ladSt.hp) ladderArms(h,u,R,u.ladSt); return; } }
    h.updateWorldMatrix(true,true); const left=CLV[0].set(1,0,0).applyQuaternion(h.getWorldQuaternion(CLQ)).normalize();   /* 人物的左方（人物座標 +x）：繞它轉正的角度＝往前傾 */
    const Lc=b=>h.worldToLocal(b.getWorldPosition(new THREE.Vector3()));
    if(part==='lean'){
    // ③ 換手的節奏：左膝比右膝前面多少（人物座標 z 往前）
    const d=(Lc(R.leftLowerLeg).z-Lc(R.leftUpperLeg).z)-(Lc(R.rightLowerLeg).z-Lc(R.rightUpperLeg).z), s=Math.max(-1,Math.min(1,d/(K.amp*k)));
    const hiR=0.5+0.5*Math.sin(s*Math.PI/2), hi=[1-hiR,hiR]; u.climbHi=hi;   /* 左腳在前（往上踩）→ 右手在上 */
    // ① 上身
    if(R.spine) rotWorld(R.spine,left,K.lean*w); if(R.chest) rotWorld(R.chest,left,K.chest*w); if(R.neck) rotWorld(R.neck,left,K.neck*w);
    return; }
    const hi=u.climbHi||[0.5,0.5];
    // ② 手
    for(const [i,side] of [[0,1],[1,-1]]){ const L=ARMS[i], sh=Lc(R[L[0]]), cur=Lc(R[L[2]]), t=hi[i];
      const T=CLV[1].set(side*K.side*k, sh.y+(K.lo+(K.hi-K.lo)*t)*k, sh.z+(K.fwdLo+(K.fwdHi-K.fwdLo)*t)*k); if(w<1) T.lerp(cur,1-w);
      const pole=h.localToWorld(CLV[2].set(sh.x+side*0.5*k, sh.y-0.6*k, sh.z-0.1*k)), Tw=h.localToWorld(CLV[3].copy(T)); if(w<1) pole.lerp(R[L[1]].getWorldPosition(CLV[4]),1-w);   /* 權重小（剛開始爬、爬完換成跪）：手肘照原本的方向，權重歸零那一格不翻 */
      if(u.climbTop!=null){ const top=u.climbTop-(1-t)*0.08; if(Tw.y>top) Tw.y=top+(Tw.y-top)*(1-w); }   /* 最上面抓得到的高度（世界座標；story3d.js 給＝床欄頂）：爬到上面幾階，手不伸到床欄上面的空中 */
      ik2(R[L[0]],R[L[1]],R[L[2]],Tw,pole);
      // ⑤ 握住：四根手指往掌心彎（繞指根那一排的連線＝食指根→小指根；左手轉負的、右手轉正的＝往掌心，和 VRM 0.x／1.0 無關：用真實骨架的位置算）；大拇指不動
      const pre=i?'right':'left', F=u.rawFing||(u.rawFing={}), fb=F[pre]||(F[pre]=['Index','Middle','Ring','Little'].map(f=>['Proximal','Intermediate','Distal'].map(j=>hm.getRawBoneNode(pre+f+j))));
      if(fb[0][0]&&fb[3][0]&&K.grip){ const ax=fb[0][0].getWorldPosition(CLV[4]).sub(fb[3][0].getWorldPosition(CLV[5])); if(ax.lengthSq()>1e-8){ ax.normalize(); const sg=i?1:-1;
        for(const row of fb) for(let j=0;j<3;j++){ const b=row[j]; if(b) rotWorld(b,ax,sg*K.grip[j]*w); } } } } }
  /* ===== 爬宿舍上舖的梯子：兩手抓扶手（sleep_scene.grips）、兩腳踩在踏階上（CLIMB-GRIPS-FEET-1105）=====
     起因：上面通用的 climbIK（CLIMB-POSE-1102）手抓「梯子兩側」的固定位置（靠床那一側抓在空中），腿照走路片段——最上面兩階腳伸進牆（爬上 28／49 cm、爬下 23／44 cm）。
     LAWWW2 DORM-LADDER-HEAD-GRIP-1102 ② 加了靠床那一側的扶手，sleep_scene 多了 grips（每一階 [左手, 右手] 抓的點 p、扶手方向 dir；最上面一階 null）、rails。
     u.ladder＝sleep_scene（story3d.js 爬宿舍梯子、上下床的時候設，站回梯子前拿掉）：有的話 climb（爬上去）、climbdown（爬下來）都走這一段；沒有＝照舊（climb 通用的兩手交替、climbdown 走路片段）。
     路線：N0＝梯子前（approach，地上）→ N1…Nn＝每一階的踏點（steps）→ 最上面一階 Nn ↔ 上床點 B（bed_entry）。人在哪一段、走到幾成（e）：root 投影到路線上（story3d.js 的 bedTween 沿直線移，一階 0.38 秒）。
     每一段（爬上去 N(k−1)→Nk、爬下來 Nk→N(k−1)）：
       前半段（時間的前一半，t 0～0.5；root 是緩進緩出）帶頭的那隻腳（到第奇數階＝左腳、偶數＝右腳）從原本那一階踩到下一階，對側的手換到下一階的點；後半段另一隻腳跟上、另一隻手換過去。
       ① 腳（ladderLean）：兩段式 IK（ik2，膝蓋往前），腳掌放平（綁定姿勢的腳底朝下）、腳尖朝前方往外 splay；踩在踏階上＝腳底在踏面的高度、
          整個腳的輪廓（綁定姿勢量的腳尖 toe、腳跟 heel、半寬 hw：footRef）在那一階前緣（下一階的立面；最上面一階＝牆）後面 toeM。爬上去先往上（高過踏面 lift）再往前、腳尖微微翹；
          爬下來先往前（腳跟越過踏階的邊）再往下。後面那隻腳搆不到：整個人往下沉（drop，和 footIK 一樣是移 u.model；下一格 fitOff 放回去）。爬上去的第一段：起點＝開始爬那一格兩腳的位置（不跳格）。
       ② 手（ladderArms，headFit 以後）：抓的點 p 在扶手中心線上（離扶手轉折太近的往直的那一段裡面移 bendM：ladGrip）——四指根那一排沿著扶手（大拇指朝上；水平的扶手大拇指朝前），
          手繞著扶手轉到手腕在靠肩膀那一邊、四指從另一邊包過去；握的中心（指根中間往掌心 palm、往指尖 palmF）放在 p，手腕照這個方向擺（readIK 的 palmFrame／basisQ）；
          四指每一節彎到剛好貼著扶手（ladWrap：扶手半徑＋手指半厚的切線）。
          換手：先往手背那邊拿開（away）、手指打開（open），移到下一階的點再貼上去、包起來（中間沒有手的方向的時候往肩膀收 pull）。第 0 階（地上）＝片段的手；null（最上面一階）＝兩手放在大腿上（和跪姿 kneelArms 同一個位置）：
          爬上去最後一段兩手從扶手放到大腿上、爬下來第一段從大腿（跪姿）直接移到第 4 階的點。
       ③ 上身：爬上去照通用的往前靠（up）；爬下來（面向房間）只微微往前、低頭看腳下（down）。
     最上面一階轉身、跪上床（kneel）、從床上起來（kneel→climbdown）、下到地上（idle）：權重照舊是 climbW（慢慢變）——腳照 root 的高度站（轉身時跟著轉、不進牆），跪姿照舊（kneelBody／kneelArms）。
     C.LADDER 是參數；u.ladSt＝現在的狀態（ph：段、e、帶頭的腳；tg：兩腳的目標；hp：兩手；drop；測試用）。C.climbIK=false：整個關掉（照舊的走路片段）。測試：node tests/climb_grips_feet_unit.js */
  C.LADDER={sep:0.09,splay:0.08,toeM:0.015,lift:0.04,leadEnd:0.5,trailStart:0.5,swUp:[0.4,1,0,0.5,0,0.5],swDn:[0,0.55,0.4,1,0,0.5],pitchUp:0.12,pitchDn:0.1,reach:0.985,dropMax:0.38,off:0.35,band:0.06,kneeR:0.065,kneeMax:1.2,kneeOut:0.12,kneeBack:0.12,kneeUp:0.2,kneeIn:0.35,elbowR:0.05,elbowMax:1.2,handR:0.05,wallM:0.015,wallMax:0.3,palm:0.033,palmF:0.01,away:0.045,railR:0.016,fingR:0.0085,wrapMax:[1.2,1.6,1.4],wrapOpen:0.9,bendM:0.025,bendT:0.025,bendFar:0.08,armReach:0.97,wristOff:0.085,slideMax:0.15,handMinR:0.17,handWide:[0.85,0.15],pull:0.15,open:0.6,thigh:0.25,
    up:{lean:0.14,chest:0.06,neck:-0.16},down:{lean:0.05,chest:0.03,neck:0.16},leanWall:[0.12,0.35],sideW:0.21,headSoft:1.2,squatBack:0.6,crouchTurn:9,heelUp:0.3,shAcc:12,wallSoft:0.04,closeR:[0.34,0.22],closeRate:6,plateY:-0.85,railClear:0.03,elbowDir:[0.55,-0.6,-0.55],elbowKeep:0.7};
  const LADG=new WeakMap(), LDV=[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3()), LDQ=[new THREE.Quaternion(),new THREE.Quaternion()], LDM=[new THREE.Matrix4(),new THREE.Matrix4()], LDUP=new THREE.Vector3(0,1,0);
  const lsm=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
  /* 路線（每個 sleep_scene 算一次）：N[0]＝梯子前（地上）、N[1..n]＝踏點；ax＝往上爬的水平方向（往牆）；T[j]＝第 j 階的中心、踏面高度、前緣 front（沿 ax：下一階的立面，最上面一階＝牆）。
     踏階深度＝相鄰兩個踏點的水平距離（宿舍的階梯收納櫃：一階 0.21 m、踏點在踏面中間）*/
  function ladGeo(sc){ if(!sc||typeof sc!=='object'||!Array.isArray(sc.steps)||!sc.steps.length||!Array.isArray(sc.approach)) return null; let G=LADG.get(sc); if(G) return G;
    const st=sc.steps, n=st.length, N=[new THREE.Vector3(+sc.approach[0],0,+sc.approach[1])].concat(st.map(s=>new THREE.Vector3(+s[0],+s[1],+s[2]))), Lie=sc.lie||{};
    if(N.some(v=>!isFinite(v.x+v.y+v.z))) return null;
    const be=sc.bed_entry||(Lie.feet?[Lie.feet[0],Lie.mattress_top_y!=null?Lie.mattress_top_y:Lie.feet[1],Lie.feet[2]]:null);
    const ax=new THREE.Vector3().subVectors(N[n],N[n>1?1:0]).setY(0); if(ax.lengthSq()<1e-8) ax.set(0,0,1); ax.normalize();
    const T=[null]; for(let j=1;j<=n;j++){ const d=n>1?Math.abs((j<n?N[j+1].clone().sub(N[j]):N[j].clone().sub(N[j-1])).dot(ax)):0.25; T.push({c:N[j],y:N[j].y,front:N[j].dot(ax)+d/2,d}); }
    G={n,N,B:be?new THREE.Vector3(+be[0],+be[1],+be[2]):null,ax,T,grips:{up:(sc.grips&&sc.grips.up)||[],down:(sc.grips&&sc.grips.down)||[]},rails:sc.rails||null,adj:new Map()}; G.railP=G.rails?Object.keys(G.rails).filter(k=>Array.isArray(G.rails[k])&&G.rails[k].length>1).map(k=>G.rails[k].map(v=>new THREE.Vector3(+v[0],+v[1],+v[2]))):[];
    /* 床尾板：上緣（rails.footboard_top）往下到床板頂（床墊頂 − 床墊厚，沒有就上緣下 0.42 m）的一片板子：換手的途中手也不穿過它 */
    const FBt=G.rails&&G.rails.footboard_top; G.plates=Array.isArray(FBt)&&FBt.length>1?[{a:new THREE.Vector3(+FBt[0][0],+FBt[0][1],+FBt[0][2]),b:new THREE.Vector3(+FBt[1][0],+FBt[1][1],+FBt[1][2]),y0:Lie.mattress_top_y!=null?+Lie.mattress_top_y-0.16:+FBt[0][1]-0.42}]:[]; LADG.set(sc,G); return G; }
  /* 板子（上緣 a→b、往下到 y0）上離 v 最近的點 */
  function ladPlate(P,v){ const ab=P.b.clone().sub(P.a), L2=ab.lengthSq(), t=L2>1e-12?Math.max(0,Math.min(1,v.clone().sub(P.a).dot(ab)/L2)):0, q=P.a.clone().addScaledVector(ab,t); q.y=Math.max(P.y0,Math.min(P.a.y+(P.b.y-P.a.y)*t,v.y)); return q; }
  /* 抓的點搆不到（人還在兩階中間、身體還低，或扶手在腰旁邊、比肩膀低一個手臂長）：手沿著扶手往肩膀那邊滑到剛好搆得到的地方（手腕在扶手靠肩膀那一邊 wristOff；最多滑 slideMax）。
     每一格照現在的肩膀算：身體上來，手就慢慢滑回抓的點（爬梯子的時候手順著扶手往上滑）；抓的點本身搆得到＝不動 */
  function ladReachOn(G,A,sh,Ra){ const K=C.LADDER, P=A.poly, off=K.wristOff, need=p=>{ const e=sh.clone().sub(p), d=e.length(); return Math.sqrt(Math.max(0,d*d-Math.pow(e.dot(A.dir),2)))>off?p.distanceTo(sh)-off:d; };
    if(!P||need(A.p)<=Ra) return A; const S=[0]; for(let i=1;i<P.length;i++) S.push(S[i-1]+P[i].distanceTo(P[i-1])); const tot=S[S.length-1];
    const at=t=>{ t=Math.max(0,Math.min(tot,t)); let i=0; while(i<P.length-2&&S[i+1]<t) i++; const L=S[i+1]-S[i], d=P[i+1].clone().sub(P[i]); return {p:P[i].clone().addScaledVector(d,L>1e-9?(t-S[i])/L:0),d:L>1e-9?d.multiplyScalar(1/L):A.dir.clone()}; };
    let s0=0, bd=Infinity; for(let i=0;i+1<P.length;i++){ const ab=P[i+1].clone().sub(P[i]), L2=ab.lengthSq(); if(L2<1e-12) continue; const t=Math.max(0,Math.min(1,A.p.clone().sub(P[i]).dot(ab)/L2)), d=P[i].clone().addScaledVector(ab,t).distanceTo(A.p); if(d<bd){ bd=d; s0=S[i]+t*Math.sqrt(L2); } }
    const sg=need(at(s0+0.01).p)<need(at(s0-0.01).p)?1:-1; let lo=0, hi=null; for(let x=0.01;x<=K.slideMax+1e-9;x+=0.01){ if(need(at(s0+sg*x).p)<=Ra){ hi=x; break; } lo=x; }
    if(hi==null) hi=K.slideMax; else for(let it=0;it<5;it++){ const m=(lo+hi)/2; if(need(at(s0+sg*m).p)<=Ra) hi=m; else lo=m; }
    const c=at(s0+sg*hi); return {p:c.p,dir:c.d.dot(A.dir)<0?c.d.negate():c.d,poly:P}; }
  /* 抓的點離扶手的轉折太近（例：門那一側扶手直段和斜段的轉角、上下床扶手頂上的彎）：四指根那一排沿著直的那一段，轉過去的那一段會穿過手指——
     沿著扶手（sleep_scene.rails 的中心線）找離原本最近、小指那一邊 bendM、大拇指那一邊 bendT 以內都是直的（離那一段的直線 ≤ 4 mm）的點（最多移 bendFar）。
     旁邊別的扶手的中心線離握的中心不到 railClear（門那一側扶手頂上的彎：正下面是門邊立柱 door_post 的頂端，只差 2 cm，四指包不過去）也一樣往旁邊移。回傳 {p, dir}（世界座標；dir＝那裡的方向）*/
  function ladGrip(G,g){ let A=G.adj.get(g); if(A) return A; const p=new THREE.Vector3(+g.p[0],+g.p[1],+g.p[2]), dir=new THREE.Vector3().fromArray(Array.isArray(g.dir)?g.dir:[0,1,0]); if(dir.lengthSq()<1e-8) dir.set(0,1,0); dir.normalize(); A={p,dir};
    const P=G.rails&&Array.isArray(G.rails[g.on])?G.rails[g.on].map(v=>new THREE.Vector3(+v[0],+v[1],+v[2])):null, M=C.LADDER.bendM, FAR=C.LADDER.bendFar;
    if(P&&P.length>1){ const S=[0]; for(let i=1;i<P.length;i++) S.push(S[i-1]+P[i].distanceTo(P[i-1])); const tot=S[S.length-1];
      const at=t=>{ t=Math.max(0,Math.min(tot,t)); let i=0; while(i<P.length-2&&S[i+1]<t) i++; const L=S[i+1]-S[i]; const d=P[i+1].clone().sub(P[i]); return {p:P[i].clone().addScaledVector(d,L>1e-9?(t-S[i])/L:0),d:L>1e-9?d.multiplyScalar(1/L):dir.clone()}; };
      let s0=0, bd=Infinity; for(let i=0;i+1<P.length;i++){ const ab=P[i+1].clone().sub(P[i]), L2=ab.lengthSq(); if(L2<1e-12) continue; const t=Math.max(0,Math.min(1,p.clone().sub(P[i]).dot(ab)/L2)), d=P[i].clone().addScaledVector(ab,t).distanceTo(p); if(d<bd){ bd=d; s0=S[i]+t*Math.sqrt(L2); } }
      /* 大拇指那一邊（大拇指朝上：扶手往上的那一頭；水平的照 dir）要直的長一點（食指、大拇指伸出去 bendT），小指那一邊 M */
      const up=at(s0).d, tu=Math.abs(up.y)>0.1?(up.y>0?1:-1):(up.dot(dir)>=0?1:-1), MT=C.LADDER.bendT, lo=t=>t-(tu>0?M:MT), hi=t=>t+(tu>0?MT:M);
      const dev=(c,t)=>{ let m=0; for(let x=Math.max(0,lo(t));x<=Math.min(tot,hi(t))+1e-9;x+=0.004){ const q=at(x).p.sub(c.p); q.addScaledVector(c.d,-q.dot(c.d)); m=Math.max(m,q.length()); } return m; };
      /* 旁邊別的扶手離手握的那一段太近（例：門那一側扶手頂上的彎，正下面就是門邊的立柱 door_post 的頂端，中心線只差 2 cm）：四指包不過去、會插進那一根——也算不能抓，往直的、旁邊沒有扶手的地方移 */
      const OT=Object.keys(G.rails).filter(k=>k!==g.on&&Array.isArray(G.rails[k])&&G.rails[k].length>1).map(k=>G.rails[k].map(v=>new THREE.Vector3(+v[0],+v[1],+v[2]))), CL=C.LADDER.railClear;
      const clear=t=>{ const q=at(t).p; for(const RP of OT) if(ladNear(RP,q).distanceTo(q)<CL) return false; return true; }, straight=t=>dev(at(t),t)<=0.004&&clear(t);
      if(bd<0.01&&!straight(s0)){ let best=null; for(let k=1;k*0.004<=FAR;k++){ for(const t of [s0-k*0.004,s0+k*0.004]){ if(t<0||t>tot) continue; if(straight(t)){ best=t; break; } } if(best!=null) break; }
        if(best!=null){ const c=at(best); A={p:c.p,dir:c.d.dot(dir)<0?c.d.clone().negate():c.d.clone()}; } }
      else if(bd<0.01){ const c=at(s0); A={p,dir:c.d.dot(dir)<0?c.d.clone().negate():c.d.clone()}; } }
    if(P) A.poly=P; G.adj.set(g,A); return A; }
  /* 這一段裡第 i 隻手換到幾成（0＝還在上一階的點、1＝抓到下一階的點）：先動的手（帶頭那隻腳的對側）時間的前半（t 0～0.5）、另一隻後半；
     一頭是地上（片段的手）或最上面一階（大腿）的那一段，手要移 0.6～0.9 m：兩隻手都拉長（先動的 0～handWide[0]、另一隻 handWide[1]～1），先動的還是先動、先到
     （搆不到的時候手沿著扶手往肩膀那邊滑：ladReachOn）*/
  function ladHandS(ph,i,G){ const f=i!==ph.lead, t=ph.t, c=x=>Math.max(0,Math.min(1,x)), W=C.LADDER.handWide; if(ph.src===0||ph.dst===0||ph.src===G.n||ph.dst===G.n) return f?c(t/W[0]):c((t-W[1])/(1-W[1])); return f?c(t/0.5):c((t-0.5)/0.5); }
  /* root 在路線的哪一段、走到幾成：投影到每一段（N[s−1]→N[s]、最上面一階→上床點）取最近的；離路線超過 off＝不在梯子上（null）。
     src／dst＝這一段從哪一階到哪一階（0＝地上）；lead＝帶頭的腳（0 左、1 右：到第奇數階＝左腳）。兩段接起來的那一點兩邊算出來的姿勢一樣（兩腳都在那一階、手在那一階的點）*/
  function ladPhase(h,G,up){ const p=h.getWorldPosition(LDV[0]); let best=null;
    const seg=(A,B,s,bed)=>{ const ab=LDV[1].subVectors(B,A), L2=ab.lengthSq(), t=L2>1e-9?Math.max(0,Math.min(1,LDV[2].subVectors(p,A).dot(ab)/L2)):0, d=LDV[2].copy(A).addScaledVector(ab,t).distanceTo(p); if(!best||d<best.d-1e-6) best={s,t,d,bed}; };
    for(let s=1;s<=G.n;s++) seg(G.N[s-1],G.N[s],s,false); if(G.B) seg(G.N[G.n],G.B,G.n+1,true);
    if(!best||best.d>C.LADDER.off) return null;
    const e=up?best.t:1-best.t, t=e<0.5?Math.sqrt(e/2):1-Math.sqrt((1-e)/2);   /* t＝時間的比例：bedTween 沿直線是緩進緩出（二次），e＝位置的比例 */
    if(best.bed) return {bed:true,up,e,t,src:G.n,dst:G.n,lead:0};
    const src=up?best.s-1:best.s, dst=up?best.s:best.s-1; return {bed:false,up,e,t,src,dst,lead:up?0:1}; }
  C._ladder={geo:ladGeo,grip:(sc,g)=>{ const G=ladGeo(sc); return G?ladGrip(G,g):null; }};   /* 測試用（tests/climb_grips_feet_unit.js）*/
  /* 腳的輪廓（綁定姿勢＝T 字、腳底平放；腳踝骨頭的座標）：fwd／up／lat＝往前（腳尖的水平方向）、往上、往左；toe、heel＝腳尖往前、腳跟往後多遠，hw＝半寬，sole＝腳踝離腳底（腳踝以下的頂點）；
     toeQ＝腳趾骨頭在綁定姿勢的本地旋轉（踩平時腳趾放直）。每個人物量一次（只有爬梯子的玩家用得到）*/
  function footRef(u){ if(u.footRef!==undefined) return u.footRef; const hm=u.vrm.humanoid, out=[];
    for(const [fn,tn] of [['leftFoot','leftToes'],['rightFoot','rightToes']]){ const fb=hm.getRawBoneNode(fn), tb=hm.getRawBoneNode(tn); if(!fb) return (u.footRef=null);
      let bindF=null, bindT=null; const V=[];
      u.vrm.scene.traverse(o=>{ if(!o.isSkinnedMesh||!o.skeleton) return; const bs=o.skeleton.bones, fi=bs.indexOf(fb), ti=tb?bs.indexOf(tb):-1; if(fi<0) return;
        const inv=o.skeleton.boneInverses[fi]; if(!bindF) bindF=inv.clone().invert(); if(ti>=0&&!bindT) bindT=o.skeleton.boneInverses[ti].clone().invert();
        const g=o.geometry, ps=g.attributes.position, si=g.attributes.skinIndex, sw=g.attributes.skinWeight; if(!ps||!si||!sw) return; const M=new THREE.Matrix4().multiplyMatrices(inv,o.bindMatrix);
        for(let i=0;i<ps.count;i++){ let bw=0,bi=-1; for(let c=0;c<4;c++){ const w=sw.getComponent(i,c); if(w>bw){ bw=w; bi=si.getComponent(i,c); } } if(bi!==fi&&(ti<0||bi!==ti)) continue; V.push(new THREE.Vector3().fromBufferAttribute(ps,i).applyMatrix4(M)); } });
      if(!bindF||V.length<8) return (u.footRef=null);
      const qF=new THREE.Quaternion(); bindF.decompose(LDV[0],qF,LDV[1]); const qI=qF.clone().invert(), up=new THREE.Vector3(0,1,0).applyQuaternion(qI).normalize();
      const tl=bindT?new THREE.Vector3().setFromMatrixPosition(bindT).sub(LDV[0].setFromMatrixPosition(bindF)):new THREE.Vector3(0,0,1); tl.y=0; if(tl.lengthSq()<1e-10) tl.set(0,0,1);   /* 綁定空間（y 朝上）：腳踝→腳趾的水平方向 */
      const fwd=tl.applyQuaternion(qI); fwd.addScaledVector(up,-fwd.dot(up)).normalize(); const lat=new THREE.Vector3().crossVectors(up,fwd);
      let toe=0,heel=0,hw=0,sole=0; for(const v of V){ const y=v.dot(up); if(y>0) continue; const f=v.dot(fwd); if(f>toe) toe=f; if(-f>heel) heel=-f; const l=Math.abs(v.dot(lat)); if(l>hw) hw=l; if(-y>sole) sole=-y; }
      let toeQ=null; if(bindT&&tb.parent===fb){ toeQ=new THREE.Quaternion(); LDM[0].copy(bindF).invert().multiply(bindT).decompose(LDV[0],toeQ,LDV[1]); }
      const ball=bindT?new THREE.Vector3().setFromMatrixPosition(bindT).applyMatrix4(LDM[0].copy(bindF).invert()):fwd.clone().multiplyScalar(toe*0.6).addScaledVector(up,-sole*0.7);   /* 腳趾骨頭（腳掌前面著地那一點）在腳踝座標的位置 */
      out.push({fwd,up,lat,toe,heel,hw,sole,toeQ,ball,B:new THREE.Matrix4().makeBasis(fwd,up,lat)}); }
    return (u.footRef=out); }
  /* 站在第 j 階（0＝地上）：腳踝＝踏點往左右 sep、踏面＋sole；腳尖朝 F 往外 splay；整個腳的輪廓沿 ax 不超過那一階的前緣（− toeM）。root 給了＝照 root 的高度站（轉身、跪上床那幾格），前緣用最上面一階 */
  function ladStand(G,j,i,F,Lt,R,k,root){ const K=C.LADDER, side=i?-1:1, p=(root?root.clone():(j>0?G.T[j].c.clone():G.N[0].clone())).addScaledVector(Lt,side*K.sep*k); p.y+=R.sole*R.s;
    const d=F.clone().applyAxisAngle(LDUP,side*K.splay), tr=root?G.T[G.n]:(j>0?G.T[j]:null);
    if(tr){ const da=d.dot(G.ax), ex=p.dot(G.ax)+Math.max(R.toe*da,-R.heel*da)*R.s+Math.abs(d.z*G.ax.x-d.x*G.ax.z)*R.hw*R.s-(tr.front-K.toeM*k); if(ex>0) p.addScaledVector(G.ax,-ex); }
    return {p,d,pitch:0}; }
  /* 一隻腳從 A 踩到 B（s 0～1）：swUp／swDn＝[水平開始, 水平結束, 垂直開始, 垂直結束, 往回縮多少, 往回縮到 s 幾]——爬上去先往上再往前（腳尖先高過上一階的踏面再往前）、腳尖翹一點；
     爬下來先往前（腳跟越過踏階的邊）再往下、腳尖朝下一點；中間多抬 lift；往回縮＝一開始先把腳往後收一點（腳尖離開立面，可以早一點往前）*/
  function ladSwing(A,B,s,up,k){ const K=C.LADDER, W=up?K.swUp:K.swDn, hs=lsm((s-W[0])/(W[1]-W[0])), vs=lsm((s-W[2])/(W[3]-W[2])), b=Math.sin(Math.PI*s);
    const p=A.p.clone(); p.x+=(B.p.x-A.p.x)*hs; p.z+=(B.p.z-A.p.z)*hs; p.y+=(B.p.y-A.p.y)*vs+K.lift*k*b; if(W[4]){ const bk=Math.sin(Math.PI*Math.min(1,s/W[5]))*W[4]*k, d=LDV[4].set(B.p.x-A.p.x,0,B.p.z-A.p.z); if(d.lengthSq()>1e-8) p.addScaledVector(d.normalize(),-bk); }
    const ap=(A.pitch||0)*(1-lsm(s/0.4)); return {p,d:A.d.clone().lerp(B.d,hs).normalize(),pitch:ap+(up?-K.pitchUp:K.pitchDn)*b,toeTh:A.toeFlat?ap:0}; }
  /* 墊腳：腳掌繞著腳趾下面的腳底往下轉 th（腳跟抬起來、腳趾平放）：腳踝跟著往上、往前一點 */
  function ladHeel(A,R,th){ if(!(th>1e-4)) return A; const d=A.d, lat=new THREE.Vector3(d.z,0,-d.x).normalize(), q=ladFootQ(R,d,0,new THREE.Quaternion()), bl=R.ball.clone().addScaledVector(R.up,-(R.ball.dot(R.up)+R.sole)), b=bl.multiplyScalar(R.s).applyQuaternion(q), ball=A.p.clone().add(b);   /* 支點＝腳趾骨頭正下方的腳底 */
    return {p:ball.clone().add(b.clone().negate().applyAxisAngle(lat,th)),d,pitch:th,toeFlat:true,toeTh:th}; }
  /* 腳掌的世界方向：腳的 fwd→d（繞左右軸 pitch：正＝腳尖朝下）、up→世界的上 */
  function ladFootQ(R,d,pitch,out){ const lat=LDV[5].set(d.z,0,-d.x).normalize(), fw=LDV[6].copy(d), up=LDV[7].set(0,1,0); if(pitch){ fw.applyAxisAngle(lat,pitch); up.applyAxisAngle(lat,pitch); }
    LDM[0].makeBasis(fw,up,lat); LDM[1].copy(R.B).transpose(); return out.setFromRotationMatrix(LDM[0].multiply(LDM[1])); }
  /* 關節（膝蓋、手肘）往前的上限（沿 ax）：在高度 y、半徑 r 的關節，前面最先碰到的那一階的立面（踏面高過 y−r 的最低那一階的後緣）；都過了＝牆。
     關節比踏面高 band 以內的那一段慢慢放寬（從這一階的立面換到上一階的）：上限連續，膝蓋越過踏階的邊不會跳 */
  function ladLimit(G,y,r){ const band=C.LADDER.band; let lim=G.T[G.n].front-r; for(let j=G.n;j>=1;j--){ const T=G.T[j], back=T.front-T.d-r, t=(y-r-T.y)/band; if(t<1) lim=t<=0?back:back+(lim-back)*t; } return lim; }
  /* 中間的關節（膝蓋、手肘）和兩段（大腿／小腿、上臂／前臂）碰到踏階的立面或牆：繞「根→末端」的軸往 out 那一邊轉（最多 maxA 弧度）到剛好不碰，照新的方向再做一次 ik2。
     量的點：關節（半徑 r）、往末端 SEG 的幾點、往根 SEG 的幾點（[比例, 半徑倍數]）——每一點＋半徑都要在 ladLimit 以內。回傳轉了多少 */
  const SEGC=[[0.35,0.85],[0.7,0.7]], SEGA=[[0.5,1.1]];
  function ladFit(a,b,c,T,G,r,out,maxA){ const A=a.getWorldPosition(new THREE.Vector3()), Bp=b.getWorldPosition(new THREE.Vector3()), Cp=c.getWorldPosition(new THREE.Vector3()), ax=Cp.clone().sub(A), L=ax.length(); if(L<1e-4) return 0; ax.multiplyScalar(1/L);
    const A0=A.clone().addScaledVector(ax,Bp.clone().sub(A).dot(ax)), d0=Bp.clone().sub(A0), rr=d0.length(); if(rr<1e-4) return 0; d0.multiplyScalar(1/rr);
    const d1=new THREE.Vector3().crossVectors(ax,d0); if(d1.dot(out)<0) d1.negate();
    const P=new THREE.Vector3(), Q=new THREE.Vector3(), lim=(v,rad)=>v.dot(G.ax)+rad-ladLimit(G,v.y,rad);
    const over=al=>{ P.copy(d0).multiplyScalar(Math.cos(al)).addScaledVector(d1,Math.sin(al)).multiplyScalar(rr).add(A0); let m=lim(P,r);
      for(const [t,f] of SEGC){ Q.copy(P).lerp(Cp,t); m=Math.max(m,lim(Q,r*f)); } for(const [t,f] of SEGA){ Q.copy(P).lerp(A,t); m=Math.max(m,lim(Q,r*f)); } return m; };
    if(over(0)<=0) return 0; let lo=0, hi=null, best=0, bv=over(0);
    for(let al=0.05;al<=maxA+1e-6;al+=0.05){ const v=over(al); if(v<=0){ hi=al; break; } if(v<bv){ bv=v; best=al; } lo=al; }
    if(hi==null) hi=best; else for(let it=0;it<6;it++){ const m=(lo+hi)/2; if(over(m)<=0) hi=m; else lo=m; }
    if(hi>1e-4) ik2(a,b,c,T,A0.clone().addScaledVector(d0.clone().multiplyScalar(Math.cos(hi)).addScaledVector(d1,Math.sin(hi)),1)); return hi; }
  /* 中間的關節繞「根→末端」的軸再往 out 那一邊轉 ang（ladFit 之後，慢慢轉回來用）*/
  function ladTwist(a,b,c,T,out,ang){ const A=a.getWorldPosition(new THREE.Vector3()), Bp=b.getWorldPosition(new THREE.Vector3()), ax=c.getWorldPosition(new THREE.Vector3()).sub(A), L=ax.length(); if(L<1e-4) return; ax.multiplyScalar(1/L);
    const A0=A.clone().addScaledVector(ax,Bp.clone().sub(A).dot(ax)), d0=Bp.clone().sub(A0); if(d0.lengthSq()<1e-8) return; d0.normalize(); const d1=new THREE.Vector3().crossVectors(ax,d0); if(d1.dot(out)<0) d1.negate();
    ik2(a,b,c,T,A0.clone().addScaledVector(d0.clone().multiplyScalar(Math.cos(ang)).addScaledVector(d1,Math.sin(ang)),1)); }
  /* 兩腳：腳踝到 T[i]（膝蓋往前、往外一點；碰到立面或牆＝往外轉 ladFit）、腳掌的世界方向 Q[i] */
  function ladLegs(h,u,G,R,F,Lt,T,Q){ const K=C.LADDER, k=u.k||1;
    const S=u.ladSt, kf=S&&(S.kf||(S.kf=[0,0]));
    for(let i=0;i<2;i++){ const L=LEGS[i], side=i?-1:1, c=R[L[2]]; ik2(R[L[0]],R[L[1]],c,T[i],R[L[1]].getWorldPosition(new THREE.Vector3()).addScaledVector(F,1).addScaledVector(Lt,side*K.kneeOut));
      /* 膝蓋碰到立面、牆就往外轉（ladFit）；轉的角度照時間慢慢變（每一格最多 kneeUp、轉回來 kneeBack），不在一格裡甩過去、彈回去 */
      const ko=()=>LDV[5].copy(Lt).multiplyScalar(side).addScaledVector(G.ax,-0.5), wo=Lt.dot(G.ax)*side;   /* 往外、往後；轉身的時候靠牆那一隻腳的「外」是牆：只轉一點（不往裡面甩過另一隻腳），靠 ladWallFit 把人往外移 */
      const a=ladFit(R[L[0]],R[L[1]],c,T[i],G,K.kneeR*k,ko(),wo>0.3?K.kneeIn:K.kneeMax);
      if(kf){ const want=Math.min(kf[i]+K.kneeUp,Math.max(a,kf[i]-K.kneeBack)); let got=a;   /* 每一格最多轉 kneeUp、轉回 kneeBack（弧度）：膝蓋不在一格裡甩過去 */
        if(Math.abs(want-a)>1e-4){ const pen=()=>{ const kn=R[L[1]].getWorldPosition(LDV[3]); return kn.dot(G.ax)+K.kneeR*k-ladLimit(G,kn.y,K.kneeR*k); }, p0=pen(); ladTwist(R[L[0]],R[L[1]],c,T[i],ko(),want-a);
          if(pen()>Math.max(0,p0)+0.003) ladTwist(R[L[0]],R[L[1]],c,T[i],ko(),a-want); else got=want; }   /* 慢慢轉回來的角度會讓膝蓋插進立面、牆（轉身的時候）＝不留 */
        kf[i]=got; }
      if(Q[i]){ c.parent.getWorldQuaternion(LDQ[1]); c.quaternion.copy(LDQ[1].invert().multiply(Q[i])); c.updateWorldMatrix(false,true); } } }
  /* 後面那隻腳搆不到（髖關節到腳踝 > 腿長 × reach）＝要往下沉多少；hipOff＝髖關節要再加的位移（算「走到一半」的樣子）*/
  function ladReach(R,tg,hipOff){ const K=C.LADDER; let drop=0;
    for(let i=0;i<2;i++){ const L=LEGS[i], H=R[L[0]].getWorldPosition(new THREE.Vector3()), la=H.distanceTo(R[L[1]].getWorldPosition(LDV[2])), lb=LDV[2].distanceTo(R[L[2]].getWorldPosition(LDV[4])), Lr=(la+lb)*K.reach;
      if(hipOff) H.add(hipOff); const T=tg[i].p, hd=Math.hypot(H.x-T.x,H.z-T.z); if(hd<Lr){ const nd=(H.y-T.y)-Math.sqrt(Lr*Lr-hd*hd); if(nd>drop) drop=nd; } }
    return drop; }
  /* ① 腳、往下沉、上身（headFit 以前）；兩手的計畫存在 u.ladSt.hp（ladderArms 用）*/
  function ladderLean(h,u,G,R,w){ const K=C.LADDER, k=u.k||1, pose=u.ladPose, act=pose==='climb'||pose==='climbdown';
    let S=u.ladSt; if(!S||S.G!==G) S=u.ladSt={G,dir:null,cap:null,first:true}; if(act) S.dir=pose==='climb'?'up':'down';
    const up=S.dir!=='down', ph=ladPhase(h,G,up), first=S.first; S.first=false; S.ph=ph; S.hp=null; if(!ph) return;
    const Fr=footRef(u); if(!Fr) return;
    h.updateWorldMatrix(true,true); const F=LDV[3].set(0,0,1).applyQuaternion(h.getWorldQuaternion(LDQ[0])).setY(0).normalize().clone(), Lt=new THREE.Vector3(F.z,0,-F.x);   /* 人物的前方、左方（水平）*/
    const RF=Fr.map((r,i)=>Object.assign({s:R[LEGS[i][2]].getWorldScale(LDV[4]).x||1},r));
    /* 爬上去的第一段（地上→第 1 階）：起點＝開始爬的前一格兩腳的位置（u.ladCap0：animateVRM 在片段換成走路以前量的；沒有就用這一格的）——之後兩腳照 IK、權重 1，不從片段慢慢換、不跳格 */
    if(first&&up&&pose==='climb'&&!ph.bed&&ph.dst===1&&ph.e<0.3){ const C0=u.ladCap0; S.cap=[0,1].map(i=>{ const c=R[LEGS[i][2]], q=C0?C0[i].q.clone():c.getWorldQuaternion(new THREE.Quaternion()), d=RF[i].fwd.clone().applyQuaternion(q).setY(0); if(d.lengthSq()<1e-6) d.copy(F); return {p:C0?C0[i].p.clone():c.getWorldPosition(new THREE.Vector3()),d:d.normalize(),pitch:0}; }); }
    u.ladCap0=null;
    const stand=(j,i)=>j===0&&up&&S.cap?S.cap[i]:ladStand(G,j,i,F,Lt,RF[i],k,null);
    let tg, Dh=0; if(ph.bed){ const rp=h.getWorldPosition(new THREE.Vector3()); tg=[0,1].map(i=>ladStand(G,G.n,i,F,Lt,RF[i],k,rp)); }
    else { const hu=up?K.heelUp:0, lift=(A,i)=>i!==ph.lead&&hu>0?ladHeel(A,RF[i],hu*lsm(Math.min(1,ph.t/K.trailStart))):A;   /* 爬上去：後面那隻腳在前半段慢慢墊腳（推上去），後半段從墊腳的樣子抬起來 */
      tg=[0,1].map(i=>{ const A=lift(stand(ph.src,i),i), B=stand(ph.dst,i), s=i===ph.lead?ph.t/K.leadEnd:(ph.t-K.trailStart)/(1-K.trailStart); return s<=0?A:s>=1?B:ladSwing(A,B,s,up,k); });
      const ts=K.trailStart, es=ts<0.5?2*ts*ts:1-2*(1-ts)*(1-ts); Dh=ladReach(R,[0,1].map(i=>i===ph.lead?(ts>=K.leadEnd?stand(ph.dst,i):ladSwing(stand(ph.src,i),stand(ph.dst,i),ts/K.leadEnd,up,k)):ladHeel(stand(ph.src,i),RF[i],hu)),G.N[ph.src].clone().lerp(G.N[ph.dst],es).sub(h.getWorldPosition(new THREE.Vector3()))); }   /* 後面那隻腳要離開那一階的那一刻（帶頭的腳差不多踩到了）要沉多少 */
    let WL=act&&(S.full||(up&&S.cap))?1:(ph.bed&&!up&&act?Math.max(w,lsm(ph.e/0.6)):w); if(act&&WL>=0.999){ WL=1; S.full=true; }   /* 到了 1 就一直是 1（爬到最後一階、站回地上以前不再看時間的權重：不跳）*/   /* 從床上下來（上床點→最上面一階）：照走到幾成換成站在踏階上（跪姿的腳背朝下，慢慢換的話腳尖會插進最上面那一階）*/
    /* 往下沉：照這一格兩腳的目標要沉多少（後面那隻腳搆得到），和「走到一半要沉的 Dh」的曲線（照時間 t：前半段 smoothstep 上去、後半段 smoothstep 下來；兩頭、中間都是平的）取大的——
       身體跟著換腳慢慢沉下去、再推上來，不會在後腳離開那一格突然彈起來，一階接一階的地方也不頓 */
    /* 最上面一階站直頭頂會高過天花板的限制（u.headMax）：最後一段爬上去的後半段不完全站起來、停在剛好的蹲低 Dt；爬下來第一段從 Dt 開始（上床點、轉身那幾格也是 Dt）——
       不要等站上去才讓 headFit 一下子往前彎（頭往牆那邊去、整個人被往後推）*/
    const faceAng=Math.acos(Math.max(-1,Math.min(1,F.dot(G.ax))));   /* 轉離牆幾度（0＝面向牆）：蹲、屁股往後照這個角度線性變（照 cos 變的話轉身轉到一半變最快，整個人一兩格就移二三十 cm）*/
    /* 每一階站直頭頂高過限制多少就先蹲多少（天花板矮的版面不只最上面一階；遊戲的版面只有最上面一階）：照時間在兩階之間慢慢換，不等 headFit 一下子往前彎（頭往牆那邊去）*/
    let atStep=()=>0; if(C.headFitOn&&u.headMax!=null&&headPts(u)){ const HR=C.HEADROOM, stand=headTopW(h,u)-h.getWorldPosition(LDV[4]).y, lim=u.headMax-HR.margin-HR.soft*k*K.headSoft, fac=Math.max(0,1-faceAng/K.crouchTurn);   /* 面向牆才蹲（側身、背對牆＝headFit 往前彎，頭沿著牆、往房間那邊去，膝蓋不往牆那邊頂）*/
      atStep=j=>j>0?Math.min(K.dropMax*k,Math.max(0,G.T[j].y+stand-lim))*fac:0; }
    const Dt=atStep(G.n), atTop=atStep, t=ph.t;
    /* 兩階之間：蹲的量從這一階的換到下一階的（base），中間（後面那隻腳離開那一刻 t＝0.5）再多沉到 Dh（hump：0、0.5、1 三點斜率都是 0）——一條曲線，不分情況（分情況的話切換那一格會頓）*/
    let plan; if(ph.bed) plan=Dt*(up?1-lsm(ph.e/0.6):lsm(ph.e/0.6));
    else { const a0=atTop(ph.src), a1=atTop(ph.dst), base=x=>a0+(a1-a0)*lsm(x), hump=t<0.5?lsm(t/0.5):1-lsm((t-0.5)/0.5); plan=base(t)+Math.max(0,Dh-base(0.5))*hump; }
    let drop=Math.max(ladReach(R,tg,null),plan);
    drop=Math.min(drop,K.dropMax*k)*WL; if(drop>1e-4){ u.model.position.y-=drop; u.fitOff=true; h.updateWorldMatrix(true,true); }
    /* 蹲下去的時候屁股往後（面向梯子、牆的時候）：重心留在腳上面，膝蓋不往前頂進立面、牆（不然 ladFit 要把膝蓋往外轉很多，像青蛙腿）*/
    const sb=K.squatBack*drop*Math.max(0,1-faceAng/(Math.PI/2)); if(sb>1e-4){ u.model.position.z-=sb; u.fitOff=true; h.updateWorldMatrix(true,true); } S.sb=sb;
    /* 兩腳：腳踝到目標（權重 WL 小＝從原本的位置慢慢過去）、腳掌放平、腳趾放直 */
    const T2=[], Q2=[]; for(let i=0;i<2;i++){ const c=R[LEGS[i][2]], q0=c.getWorldQuaternion(new THREE.Quaternion()), T=tg[i].p.clone(); if(WL<1) T.lerp(c.getWorldPosition(LDV[1]),1-WL); T2.push(T);
      const q=ladFootQ(RF[i],tg[i].d,tg[i].pitch,new THREE.Quaternion()); if(WL<1) q.slerp(q0,1-WL); Q2.push(q);
      const t=R[LEGS[i][3]]; if(t&&RF[i].toeQ){ t.quaternion.slerp(RF[i].toeQ,WL); t.updateWorldMatrix(false,true); } }
    const TF=[0,1].map(i=>(tg[i].toeTh||0)*WL);   /* 墊腳的那隻腳：腳趾往回轉同樣的角度（腳趾平貼踏面；抬起來的時候慢慢放回）*/
    ladLegs(h,u,G,R,F,Lt,T2,Q2);
    for(let i=0;i<2;i++){ const t=R[LEGS[i][3]]; if(t&&TF[i]>0){ const d=tg[i].d; rotWorld(t,LDV[4].set(d.z,0,-d.x).normalize(),-TF[i]); } }
    /* ③ 上身 */
    /* 爬上去越接近牆（最上面一階離牆只有 10 cm）越站直：往前靠的上身會把頭、胸口推進牆（ladWallFit 就要把整個人往後移很多）*/
    const Kd=up?K.up:K.down, fw=up?lsm(F.dot(G.ax)/0.7):0, wl=1-(1-lsm((G.T[G.n].front-h.getWorldPosition(LDV[4]).dot(G.ax)-K.leanWall[0])/K.leanWall[1]))*fw, lw=w*wl;   /* 轉身的時候照面向牆多少慢慢換（不在某一格突然往前靠）*/
    if(R.spine) rotWorld(R.spine,Lt,Kd.lean*lw); if(R.chest) rotWorld(R.chest,Lt,Kd.chest*lw); if(R.neck) rotWorld(R.neck,Lt,Kd.neck*lw);
    /* 兩手的計畫：第 0 階＝片段的手（clip）、null＝大腿（thigh）、其他＝抓的點（grip）；先動的手＝帶頭那隻腳的對側 */
    const E=(j,i)=>{ if(j===0) return {k:'clip'}; const row=(up?G.grips.up:G.grips.down)[j-1], g=row&&row[i]; return g&&Array.isArray(g.p)?{k:'grip',g}:{k:'thigh'}; };
    S.hp=[0,1].map(i=>ph.bed?{A:{k:'thigh'},B:{k:'thigh'},s:1}:{A:E(ph.src,i),B:E(ph.dst,i),s:ladHandS(ph,i,G)});
    S.tg=tg; S.drop=drop; S.Dh=Dh; S.WL=WL; S.WH=act?1:w; S.F=F; S.Lt=Lt; }
  /* 上半身（臀部、脊椎、胸口、脖子、頭、頭髮、大腿根、肩膀；不含再下去的手腳）的頂點，在綁定姿勢取 96 個方向上最外面的那幾點（每一點記蒙皮的骨頭、骨頭座標、權重；同 headPts）：量上半身往牆那邊最遠到哪裡 */
  function bodyPts(u){ if(u.bodySup!==undefined) return u.bodySup; const hm=u.vrm.humanoid, hips=hm.getRawBoneNode('hips'); if(!hips) return (u.bodySup=null);
    const ex=new Set(), root=new Map(); for(const [n,rad] of [['leftUpperLeg',0.13],['rightUpperLeg',0.13],['leftUpperArm',0.1],['rightUpperArm',0.1]]){ const b=hm.getRawBoneNode(n); if(!b) continue; b.traverse(o=>ex.add(o)); root.set(b,rad); }
    const inc=new Set(); hips.traverse(o=>{ if(!ex.has(o)) inc.add(o); }); const V=[], L=[];   /* 大腿根、上臂根（綁定姿勢離關節 rad 以內：屁股、肩膀那一圈，跟著身體）也算；再下去的大腿、上臂由 ladFit 量 */
    u.vrm.scene.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible||!o.skeleton) return; const g=o.geometry, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, ps=g.attributes.position; if(!si||!sw||!ps) return; const bs=o.skeleton.bones, bi=o.skeleton.boneInverses;
      const jp=new Map(); for(const [b,rad] of root){ const ix=bs.indexOf(b); if(ix>=0) jp.set(b,[new THREE.Vector3().setFromMatrixPosition(LDM[0].copy(bi[ix]).invert()),rad]); }
      for(let i=0;i<ps.count;i+=2){ let bw=0,bk=-1; for(let c=0;c<4;c++){ const w=sw.getComponent(i,c); if(w>bw){ bw=w; bk=si.getComponent(i,c); } } if(bk<0||!bs[bk]) continue;
        const vb=new THREE.Vector3().fromBufferAttribute(ps,i).applyMatrix4(o.bindMatrix), J=jp.get(bs[bk]); if(!inc.has(bs[bk])&&!(J&&vb.distanceTo(J[0])<J[1])) continue; const parts=[]; for(let c=0;c<4;c++){ const wt=sw.getComponent(i,c); if(!(wt>0)) continue; const kk=si.getComponent(i,c); if(!bs[kk]) continue; parts.push(bs[kk],vb.clone().applyMatrix4(bi[kk]),wt); }
        V.push(vb); L.push(parts); } });
    if(V.length<4) return (u.bodySup=null); const N=96, out=[], seen=new Set();
    for(let d=0;d<N;d++){ const y=1-2*(d+0.5)/N, r=Math.sqrt(1-y*y), th=d*2.399963, dx=Math.cos(th)*r, dz=Math.sin(th)*r; let bi=0, bv=-Infinity; for(let i=0;i<V.length;i++){ const t=V[i].x*dx+V[i].y*y+V[i].z*dz; if(t>bv){ bv=t; bi=i; } } if(!seen.has(bi)){ seen.add(bi); out.push(L[bi]); } }
    return (u.bodySup=out); }
  /* 上半身不進牆（headFit 以後）：上半身往牆那邊最遠的點超過「牆 − wallM」＝整個人往後移（u.model；最多 wallMax），兩腳照原本的位置、方向重新 IK（腳不動）*/
  function ladWallFit(h,u,G,R,S){ const K=C.LADDER, k=u.k||1, P=bodyPts(u); if(!P) return; h.updateWorldMatrix(true,true); let mx=-Infinity;
    for(const parts of P){ let x=0, z=0; for(let c=0;c<parts.length;c+=3){ const e=parts[c].matrixWorld.elements, q=parts[c+1], wt=parts[c+2]; x+=wt*(e[0]*q.x+e[4]*q.y+e[8]*q.z+e[12]); z+=wt*(e[2]*q.x+e[6]*q.y+e[10]*q.z+e[14]); } const a=x*G.ax.x+z*G.ax.z; if(a>mx) mx=a; }
    /* 側身對著牆（最上面一階轉身、從床上下來）：身體的半寬 sideW 要在牆外面——照 root 離牆多遠、側過來多少（|左方·往牆|）先算好要往外移多少（跟著轉身慢慢移，不靠量到才推）*/
    const rd=G.T[G.n].front-h.getWorldPosition(LDV[2]).dot(G.ax), plan=S.Lt?K.sideW*k*Math.abs(S.Lt.dot(G.ax))-(rd-K.wallM*k):0;
    const def=Math.max(mx-(G.T[G.n].front-K.wallM*k),plan); S.wall=def; const sm=K.wallSoft*k; let s0=Math.min(def>=sm?def:def<=-sm?0:(def+sm)*(def+sm)/(4*sm),K.wallMax*k);   /* 快碰到牆以前就開始慢慢往外移（平滑的 max(def,0)，永遠 ≥ def）：不會某一格突然開始推 */
    /* 要往外移的量變少的時候（轉身、站起來：往前彎的頭從牆前面轉開）不一格就放回去：放回去的速度每秒最多改 shAcc（m/s²），整個人慢慢回到 root 上面（變多＝照量到的，不進牆）*/
    { const dt=Math.min(0.1,u.ladDt||1/30), pv=S.shP, vv=S.shV||0; if(pv!=null&&s0<pv){ const v=Math.max(s0-pv,Math.min(0,vv)-K.shAcc*dt*dt); s0=pv+v; } S.shV=pv!=null?s0-pv:0; S.shP=s0; }
    const sh=s0*S.WH; if(!(sh>1e-4)) return;
    const keepT=[0,1].map(i=>R[LEGS[i][2]].getWorldPosition(new THREE.Vector3())), keepQ=[0,1].map(i=>R[LEGS[i][2]].getWorldQuaternion(new THREE.Quaternion()));
    const d=LDV[1].copy(G.ax).multiplyScalar(-sh).applyQuaternion(h.getWorldQuaternion(LDQ[0]).invert()); u.model.position.add(d); u.fitOff=true; h.updateWorldMatrix(true,true); S.shift=sh;
    ladLegs(h,u,G,R,S.F,S.Lt,keepT,keepQ); }
  /* ② 兩手（headFit 以後：照彎腰、蹲低以後肩膀的位置抓）*/
  function ladderArms(h,u,R,S){ const K=C.LADDER, k=u.k||1, hm=u.vrm.humanoid, WH=S.WH, Lt=S.Lt, G=S.G; S.shift=0; ladWallFit(h,u,G,R,S); h.updateWorldMatrix(true,true);
    for(let i=0;i<2;i++){ const P=S.hp[i], L=ARMS[i], side=i?-1:1, pre=i?'right':'left', hand=R[L[2]];
      const FG=u.rawFing||(u.rawFing={}), fb=FG[pre]||(FG[pre]=['Index','Middle','Ring','Little'].map(f=>['Proximal','Intermediate','Distal'].map(j=>hm.getRawBoneNode(pre+f+j))));
      const sh=R[L[0]].getWorldPosition(new THREE.Vector3()), cur=hand.getWorldPosition(new THREE.Vector3()), fc=new THREE.Vector3(), nc=new THREE.Vector3();
      const pf=palmFrame(hand,fb[0][0],fb[1][0],fb[3][0],i===0,fc,nc), qc=pf?basisQ(fc,nc,new THREE.Quaternion()):null;
      const Ra=(sh.distanceTo(R[L[1]].getWorldPosition(LDV[1]))+LDV[1].distanceTo(cur))*K.armReach;   /* 手腕最遠搆得到 */
      const kn=pf?(()=>{ const v=new THREE.Vector3(); let m=0; for(const row of fb) if(row[0]){ v.add(row[0].getWorldPosition(LDV[1])); m++; } return v.multiplyScalar(1/m); })():null;   /* 四個指根的中間 */
      const ev=D=>{ if(D.k==='clip') return {p:cur.clone(),q:null,c:0};
        if(D.k==='thigh'){ const Q=C.KNEEL, T=R[LEGS[i][0]].getWorldPosition(new THREE.Vector3()).lerp(R[LEGS[i][1]].getWorldPosition(LDV[1]),Q.handF); T.y+=Q.handUp*k; T.addScaledVector(Lt,side*Q.handOut*k); return {p:T,q:null,c:K.thigh}; }
        const G0=ladGrip(G,D.g), GA=ladReachOn(G,G0,sh,Ra), p=GA.p.clone(); if(C._dbgArm) (P.dbg||(P.dbg={}))[D===P.A?'A':'B']={slide:GA.p.distanceTo(G0.p),need:G0.p.distanceTo(sh),Ra}; if(!pf) return {p,q:null,c:1};
        const a=GA.dir.clone(), v=LDV[2].subVectors(p,sh).normalize(); if(a.y<-0.1||(Math.abs(a.y)<=0.1&&a.dot(v)<0)) a.negate();   /* 大拇指朝上；水平的扶手朝前（沿著伸手的方向）*/
        /* 手繞著扶手轉到「手腕在扶手靠肩膀那一邊」（四指從另一邊包過去）：握的中心（指根中間往掌心 palm、往指尖 palmF）在 p，手腕離肩膀最近（搆得到、手腕不用硬折）。
           手掌座標（f＝手指、n＝掌心）裡手腕→握的中心＝(cf, cn, ca)；f 在垂直扶手的平面上轉 γ：手腕的方向＝肩膀的方向 e1 */
        const ac=i===0?new THREE.Vector3().crossVectors(nc,fc):new THREE.Vector3().crossVectors(fc,nc), kc=kn.clone().sub(cur), cf=kc.dot(fc)+K.palmF*k, cn=kc.dot(nc)+K.palm*k, ca=kc.dot(ac);
        const e1=sh.clone().sub(p); e1.addScaledVector(a,-e1.dot(a)); if(e1.lengthSq()<1e-8){ e1.copy(Lt).multiplyScalar(-side); e1.addScaledVector(a,-e1.dot(a)); } e1.normalize();
        /* 抓的點離肩膀很近（扶手就在肩膀旁邊）：手腕在靠肩膀那一邊會擠到肩膀上（手臂折不了那麼緊）——手繞著扶手往前下方轉（最多 90°），手腕離肩膀遠一點 */
        /* 往哪一邊轉：這一次爬梯子第一次用到這個點的時候照「往前下方」定好，之後都轉同一邊（每一格重新判斷的話，肩膀剛好在前下方那幾格會左右翻）*/
        { let c=Math.max(0,Math.min(1,(K.closeR[0]*k-p.distanceTo(sh))/((K.closeR[0]-K.closeR[1])*k)));
          const e2=new THREE.Vector3().crossVectors(a,e1), M=S.sgM||(S.sgM=new Map()); let sg=M.get(D.g); const sgNew=sg==null; if(sgNew) sg=e2.dot(LDV[2].copy(S.F).addScaledVector(LDUP,-1))>=0?1:-1;
          const e0=e1.clone(), rot=g2=>e1.copy(e0).multiplyScalar(Math.cos(g2)).addScaledVector(e2,sg*Math.sin(g2)).normalize();
          /* 抓的是床尾板的上緣（底下是板子）：手腕不轉到板子的那一面（e1 往下＝手掌貼進板子裡；轉過以後 e1.y ≥ plateY）——在下面限速以前先限制轉多少，轉的量照樣慢慢變 */
          if(c>0&&D.g.on==='footboard_top'&&G.plates.length){ let gm=c*Math.PI/2; while(gm>0&&rot(gm).y<K.plateY) gm=Math.max(0,gm-0.01); c=gm/(Math.PI/2); }
          /* 身體一格移十幾 cm、肩膀擦過抓的點的時候變得很快：每秒最多改 closeRate（手繞著扶手慢慢轉過去）*/
          { const CM=S.cM||(S.cM=new Map()), key=i+':'+(D.g.on||'')+(D.g.p||[]).join(','), now=u.anim?u.anim.t:0, o=CM.get(key), dt=Math.min(0.1,u.ladDt||1/30); if(o&&now-o.t<0.12){ const r=K.closeRate*dt; c=o.c+Math.max(-r,Math.min(r,c-o.c)); } CM.set(key,{c,t:now}); }
          if(c>0){ if(sgNew) M.set(D.g,sg); rot(c*Math.PI/2); } else e1.copy(e0); if(C._dbgArm) (P.dbg||(P.dbg={}))['c'+(D===P.A?'A':'B')]=c; }
        const e2=new THREE.Vector3().crossVectors(a,e1);
        const ga=i===0?-Math.atan2(cn,-cf):-Math.atan2(-cn,-cf), f=e1.clone().multiplyScalar(Math.cos(ga)).addScaledVector(e2,Math.sin(ga)).normalize();
        const n=i===0?new THREE.Vector3().crossVectors(f,a):new THREE.Vector3().crossVectors(a,f); n.normalize();
        return {p:p.addScaledVector(f,-cf).addScaledVector(n,-cn).addScaledVector(a,-ca),q:basisQ(f,n,new THREE.Quaternion()),n,f,c:1}; };
      /* 換手：先把手從扶手上拿開（往手背那邊 away，一開始就拿開、快到才貼上去：bump 中間是平的），再移到下一個點；手指一開始就打開、快到才包起來 */
      const A=ev(P.A), B=ev(P.B), m=lsm(P.s), bump=lsm(Math.min(1,P.s/0.3))*lsm(Math.min(1,(1-P.s)/0.3)), T=A.p.clone().lerp(B.p,m);
      if(bump>0){ const aw=new THREE.Vector3(); if(A.n) aw.addScaledVector(A.n,-(1-m)); if(B.n) aw.addScaledVector(B.n,-m); if(aw.lengthSq()>1e-8) T.addScaledVector(aw.normalize(),K.away*k*bump); else T.lerp(sh,K.pull*bump);
        /* 換手的途中別穿過旁邊的扶手（例：床尾板頂→上下床扶手）：手腕、指根、指尖附近（沿手指方向 0、6、10 cm）離每一根扶手的中心線至少 扶手半徑＋5／3／2 cm，不夠就往外推（貼上去的那一刻 bump＝0：不推）*/
        const r0=(G.rails&&+G.rails.r)||K.railR, fd=new THREE.Vector3(); if(A.f) fd.addScaledVector(A.f,1-m); if(B.f) fd.addScaledVector(B.f,m); if(fd.lengthSq()<1e-8) fd.copy(T).sub(sh); fd.normalize();
        for(let it=0;it<3;it++){ let best=null, bd=0; for(const [o,c] of [[0,K.handR],[0.06,0.03],[0.1,0.02]]){ const hc=T.clone().addScaledVector(fd,o*k); for(const RP of G.railP){ const q=ladNear(RP,hc), d=q.distanceTo(hc), need=r0+c*k-d; if(need>bd&&d>1e-5){ bd=need; best=hc.clone().sub(q).multiplyScalar(1/d); } }
            for(const PL of G.plates){ const q=ladPlate(PL,hc), d=q.distanceTo(hc), need=0.0125+c*k-d; if(need>bd&&d>1e-5){ bd=need; best=hc.clone().sub(q).multiplyScalar(1/d); } } }
          if(!best) break; T.addScaledVector(best,bd*bump); } }
      { const d=T.distanceTo(sh), mr=K.handMinR*k, sm=0.05*k, x=d-mr, d2=x>=sm?d:mr+(x<=-sm?0:(x+sm)*(x+sm)/(4*sm)); if(C._dbgArm) (P.dbg||(P.dbg={})).minR=d2-d; if(d2>d+1e-6&&d>1e-5) T.sub(sh).multiplyScalar(d2/d).add(sh); }   /* 平滑的 max（手臂折到最緊以前就慢慢撐開，不在某一格突然推）*/   /* 手腕不經過肩膀旁邊（手臂折太緊，手肘會繞一圈）*/
      if(WH<1) T.lerp(cur,1-WH);
      /* 手肘的方向：往外下（p1）、往外後（p2），各取垂直「肩膀→手腕」的部分，照 p1 有多垂直混（手腕在肩膀外下方、扶手在腰旁邊的時候 p1 和手臂幾乎平行，只用 p1 手肘會繞一圈）*/
      const ax3=T.clone().sub(sh), al=ax3.length(), hq=h.getWorldQuaternion(LDQ[0]); let pole;
      if(al>1e-4){ ax3.multiplyScalar(1/al); const wa=Math.max(0,side*Lt.dot(G.ax)), so=side*(1-0.8*wa);   /* 這隻手臂那一側是牆（跪上床、轉身）：手肘不往外（牆）那邊，往下、往後 */
        /* 手肘往外、下、後（K.elbowDir，人物座標）：爬梯子的手都在肩膀的前面、上面、旁邊或大腿上，不會在外下後方——這個方向不會和手臂平行（兩個方向混的話，兩個垂直分量方向相反的那幾格手肘會翻）*/
        const ed=K.elbowDir, q1=LDV[6].set(so*ed[0],ed[1],ed[2]-0.3*wa).normalize().applyQuaternion(hq); q1.addScaledVector(ax3,-q1.dot(ax3)); if(C._dbgArm) (P.dbg||(P.dbg={})).w1=q1.length();
        /* 上一格手肘的方向（人物座標存的）也算進來（ elbowKeep）：手臂剛好和偏好的方向平行的那幾格不會翻 */
        const EP=S.ep||(S.ep=[null,null]); if(EP[i]){ const pv=LDV[2].copy(EP[i]).applyQuaternion(hq); pv.addScaledVector(ax3,-pv.dot(ax3)); if(pv.lengthSq()>1e-6){ pv.normalize(); if(q1.lengthSq()>1e-8) q1.normalize(); q1.multiplyScalar(1-K.elbowKeep).addScaledVector(pv,K.elbowKeep); } }
        if(q1.lengthSq()<1e-6) q1.set(0,-1,0).addScaledVector(ax3,-ax3.y); pole=sh.clone().addScaledVector(q1.normalize(),0.6*k); }
      else pole=h.localToWorld(h.worldToLocal(sh.clone()).add(LDV[2].set(side*0.5*k,-0.6*k,-0.1*k)));
      if(WH<1) pole.lerp(R[L[1]].getWorldPosition(LDV[3]),1-WH);
      { const ov=T.dot(G.ax)+K.handR*k-ladLimit(G,T.y,K.handR*k); if(ov>0) T.addScaledVector(G.ax,-ov); }   /* 手（大腿、片段的位置）不伸進牆、立面 */
      ik2(R[L[0]],R[L[1]],hand,T,pole); { const fa=ladFit(R[L[0]],R[L[1]],hand,T,G,K.elbowR*k,LDV[5].copy(G.ax).negate(),K.elbowMax); if(C._dbgArm) (P.dbg||(P.dbg={})).fit=fa; }   /* 手肘、上臂、前臂碰到牆、立面：往後轉 */
      if(pf&&(A.q||B.q)&&palmFrame(hand,fb[0][0],fb[1][0],fb[3][0],i===0,fc,nc)){ const qn=basisQ(fc,nc,new THREE.Quaternion()), qt=(A.q||qn).clone().slerp(B.q||qn,m); if(WH<1) qt.slerp(qn,1-WH); rotWorldQ(hand,qt.multiply(qn.invert())); }   /* 手掌方向 */
      let cu=(A.c+(B.c-A.c)*m)*(A.q||B.q?1-K.open*bump:1)*WH;   /* 手指彎多少（0＝片段、1＝握住）*/
      /* 握住：四指沿著扶手包起來（ladWrap）；還在換手（離扶手遠）照通用的 ⑤ 彎法（C.CLIMB.grip），越接近抓的那一刻越照包的角度 */
      const D=P.s<0.5?P.A:P.B, gr=D.k==='grip'?D.g:null, wq=gr?1-bump:0;
      if(cu>1e-3&&fb[0][0]&&fb[3][0]){ const ax=fb[0][0].getWorldPosition(LDV[4]).sub(fb[3][0].getWorldPosition(LDV[5])); if(ax.lengthSq()>1e-8){ ax.normalize();
        ladWrap(u,G,pre,fb,ax,i?1:-1,gr?ladGrip(G,gr):null,((G.rails&&+G.rails.r)||K.railR)+K.fingR*k,wq,cu,C.CLIMB.grip); } }
      { const EP=S.ep||(S.ep=[null,null]), sp=R[L[0]].getWorldPosition(LDV[3]), el=R[L[1]].getWorldPosition(new THREE.Vector3()), wr=hand.getWorldPosition(LDV[4]), axw=wr.sub(sp); if(axw.lengthSq()>1e-8){ axw.normalize(); el.sub(sp); el.addScaledVector(axw,-el.dot(axw)); if(el.lengthSq()>1e-8) EP[i]=el.normalize().applyQuaternion(h.getWorldQuaternion(LDQ[1]).invert()); } }   /* 這一格手肘的方向（人物座標）*/
      P.T=T; P.cu=cu; } }
  /* 指尖在遠節骨頭座標的位置（綁定姿勢的手指是直的：遠節＋中節→遠節的 0.85 倍）：每個人物量一次 */
  function fingTips(u,pre,fb){ const F=u.fingTip||(u.fingTip={}); if(F[pre]) return F[pre]; const out=[];
    for(const row of fb){ const I=row[1], Dd=row[2]; let t=null; if(I&&Dd){ u.vrm.scene.traverse(o=>{ if(t||!o.isSkinnedMesh||!o.skeleton) return; const bs=o.skeleton.bones, ii=bs.indexOf(I), di=bs.indexOf(Dd); if(ii<0||di<0) return;
        const pI=new THREE.Vector3().setFromMatrixPosition(LDM[0].copy(o.skeleton.boneInverses[ii]).invert()), pD=new THREE.Vector3().setFromMatrixPosition(LDM[0].copy(o.skeleton.boneInverses[di]).invert());
        t=pD.clone().addScaledVector(pD.clone().sub(pI),0.85).applyMatrix4(o.skeleton.boneInverses[di]); }); } out.push(t); }
    return (F[pre]=out); }
  /* 四指包住扶手：每一節（指根→中節→遠節，依序）繞指根那一排的連線 ax 轉 sg×θ（θ＞0＝往掌心彎）。每一根扶手（抓的那一根＝g 的直線；旁邊的＝G.railP 的中心線離這一節最近的那一段）
     都算一個 θ：這一節的骨頭線從現在的方向彎到「剛好碰到」那根扶手（中心線外 rho＝扶手半徑＋手指半厚）的那條切線（已經插進去＝往回打開到切線，最多 wrapOpen：片段的手指本來就半彎），
     取最小的＝最多可以彎到哪裡。抓著（wq 1）＝彎到 θ（貼著扶手）；放開、換手的途中＝通用的 gen×cu，但不超過 θ；附近沒有扶手＝通用的 */
  function ladWrap(u,G,pre,fb,ax,sg,g,rho,wq,cu,gen){ const MX=C.LADDER.wrapMax, OP=C.LADDER.wrapOpen, tips=fingTips(u,pre,fb), near=rho+0.04;
    const lim=(Bp,Cw,j,sgn)=>{ const c=Cw.clone().sub(Bp); c.addScaledVector(ax,-c.dot(ax)); const L=c.length(); if(L<1e-4) return null; const e1=c.multiplyScalar(1/L), e2=new THREE.Vector3().crossVectors(ax,e1), mid=Bp.clone().lerp(Cw,0.5);
      const obs=[]; if(g) obs.push([g.p,g.dir]); for(const RP of G.railP){ const q=ladNear(RP,mid,LDV[6]); if(q.distanceTo(mid)<near) obs.push([q.clone(),LDV[6].clone()]); }
      let t=null; for(const [O,Dr] of obs){ const o=O.clone().addScaledVector(Dr,Bp.clone().sub(O).dot(Dr)).sub(Bp); o.addScaledVector(ax,-o.dot(ax)); const Dd=Math.hypot(o.dot(e1),o.dot(e2)); if(Dd>near+L) continue;
        const psi=Math.atan2(sgn*o.dot(e2),o.dot(e1)), be=Dd>rho?Math.asin(rho/Dd):Math.PI/2; let tt=psi-be; if(psi+be<0) tt=MX[j]; tt=Math.max(-OP,Math.min(MX[j],tt)); if(t==null||tt<t) t=tt; }
      return t; };
    fb.forEach((row,r)=>{ for(let j=0;j<3;j++){ const b=row[j]; if(!b) break; let ph=gen[j]*cu;
      const Bp=b.getWorldPosition(new THREE.Vector3()), Cw=j<2&&row[j+1]?row[j+1].getWorldPosition(new THREE.Vector3()):(tips[r]?b.localToWorld(tips[r].clone()):null);
      const t=Cw?lim(Bp,Cw,j,sg):null; if(t!=null){ const lo=Math.min(ph,t); ph=lo+(t-lo)*(g?wq:0); }
      if(Cw&&G.railP.length){ const v0=Cw.clone().sub(Bp), L=v0.length(), NR=G.railP.filter(RP=>ladNear(RP,Bp).distanceTo(Bp)<L+rho+0.02);   /* 再檢查一次（扶手和手指彎的平面斜交、旁邊的扶手）：這一節的中間、末端離每一根扶手中心線 ≥ rho，不夠就換一個角度 */
        const pen=phi=>{ const v=v0.clone().applyAxisAngle(ax,sg*phi); for(const t2 of [0.5,1]){ const P=Bp.clone().addScaledVector(v,t2); for(const RP of NR) if(ladNear(RP,P).distanceTo(P)<rho) return true; } return false; };
        if(NR.length&&pen(ph)){ for(let k2=1;k2<=26;k2++){ const a1=ph-k2*0.06, a2=ph+k2*0.06; if(a1>=-OP&&!pen(a1)){ ph=a1; break; } if(a2<=MX[j]&&!pen(a2)){ ph=a2; break; } } } }   /* 往兩邊找最近的不碰的角度（旁邊的扶手在手指張開的那一邊＝多彎一點）*/
      rotWorld(b,ax,sg*ph); } });
    /* 大拇指：整根（掌骨）繞 ax 轉到「根→指尖」這條線剛好貼著抓的那根扶手（兩條切線裡轉得少的那一條；本來就沒碰到＝不動）；
       再看大拇指的關節、指尖離每一根扶手中心線最近的那一點（扶手在那裡轉彎、旁邊別的扶手），往外轉到剛好不碰（一次最多 0.6 弧度）*/
    const hm=u.vrm.humanoid, t0=hm.getRawBoneNode(pre+'ThumbMetacarpal')||hm.getRawBoneNode(pre+'ThumbProximal'), tip=thumbTip(u,pre); if(!t0||!tip) return;
    if(g){ const Bp=t0.getWorldPosition(new THREE.Vector3()), c=tip.b.localToWorld(tip.v.clone()).sub(Bp); c.addScaledVector(ax,-c.dot(ax)); const L=c.length();
      if(L>1e-4){ const e1=c.multiplyScalar(1/L), e2=new THREE.Vector3().crossVectors(ax,e1), o=g.p.clone().addScaledVector(g.dir,Bp.clone().sub(g.p).dot(g.dir)).sub(Bp); o.addScaledVector(ax,-o.dot(ax));
        const Dd=Math.hypot(o.dot(e1),o.dot(e2)), psi=Math.atan2(o.dot(e2),o.dot(e1)), be=Dd>rho?Math.asin(rho/Dd):Math.PI/2;
        if(Math.abs(psi)<be){ const tt=Math.abs(psi-be)<Math.abs(psi+be)?psi-be:psi+be; rotWorld(t0,ax,tt); } } }
    const ch=['ThumbProximal','ThumbDistal'].map(n=>hm.getRawBoneNode(pre+n)).filter(b=>b&&b!==t0);
    for(let it=0;it<3;it++){ let tw=null, q=null, d=Infinity; for(const P of ch.map(b=>b.getWorldPosition(new THREE.Vector3())).concat([tip.b.localToWorld(tip.v.clone())])) for(const RP of G.railP){ const qq=ladNear(RP,P), dd=qq.distanceTo(P); if(dd<d){ d=dd; tw=P; q=qq.clone(); } }
      if(!(d<rho-1e-4)) break; const Bp2=t0.getWorldPosition(new THREE.Vector3()), td=tw.clone().sub(Bp2), aw=tw.clone().sub(q), axr=new THREE.Vector3().crossVectors(td,aw); if(axr.lengthSq()<1e-12||td.lengthSq()<1e-8) break; axr.normalize();
      rotWorld(t0,axr,Math.min(0.6,(rho-d+0.002)/td.length())); } }
  /* 折線 P 上離 v 最近的點（dir 給了＝放那一段的方向）*/
  function ladNear(P,v,dir){ let bd=Infinity; const out=new THREE.Vector3(), ab=new THREE.Vector3(), c=new THREE.Vector3(); for(let i=0;i+1<P.length;i++){ ab.subVectors(P[i+1],P[i]); const L2=ab.lengthSq(); const t=L2>1e-12?Math.max(0,Math.min(1,c.subVectors(v,P[i]).dot(ab)/L2)):0; c.copy(P[i]).addScaledVector(ab,t); const d=c.distanceToSquared(v); if(d<bd){ bd=d; out.copy(c); if(dir&&L2>1e-12) dir.copy(ab).multiplyScalar(1/Math.sqrt(L2)); } } return out; }
  /* 大拇指尖在大拇指遠節座標的位置（綁定姿勢：遠節＋前一節→遠節的 0.85 倍）*/
  function thumbTip(u,pre){ const F=u.thumbTipC||(u.thumbTipC={}); if(F[pre]!==undefined) return F[pre]; const hm=u.vrm.humanoid, ch=['ThumbMetacarpal','ThumbProximal','ThumbDistal'].map(n=>hm.getRawBoneNode(pre+n)).filter(Boolean); let out=null;
    if(ch.length>=2){ const I=ch[ch.length-2], Dd=ch[ch.length-1]; u.vrm.scene.traverse(o=>{ if(out||!o.isSkinnedMesh||!o.skeleton) return; const bs=o.skeleton.bones, ii=bs.indexOf(I), di=bs.indexOf(Dd); if(ii<0||di<0) return;
      const pI=new THREE.Vector3().setFromMatrixPosition(LDM[0].copy(o.skeleton.boneInverses[ii]).invert()), pD=new THREE.Vector3().setFromMatrixPosition(LDM[0].copy(o.skeleton.boneInverses[di]).invert());
      out={b:Dd,v:pD.clone().addScaledVector(pD.clone().sub(pI),0.85).applyMatrix4(o.skeleton.boneInverses[di])}; }); }
    return (F[pre]=out); }
  /* ===== 天花板低的地方彎腰、跪上床（DORM-LADDER-STOOP-1103；使用者 11-03「宿舍天花板太低了 走上去都撞到頭 不合理」「至少微微彎腰不要整個頭卡進去天花板」）=====
     u.headMax（世界座標的高度；story3d.js 爬宿舍梯子、上下床時設＝sleep_scene.head_max，沒有就天花板高度 − 0.08 m）：頭頂（含頭髮）不高過它。
       只在 climb、climbdown、kneel（和剛從這幾個換出來、權重還沒歸零的那幾格）有用；坐、躺、騎車（靜態姿勢）不管——舊的值留著也不會讓人在別的地方蹲著走。
     頭頂＝頭（含頭髮）的頂點在頭骨座標裡的支撐點（headPts）照骨頭現在的矩陣蒙皮以後最高的那一個＋margin：頭往前低、往旁邊歪、頭髮甩起來都照樣算。
     超過多少（e）就：① 膝蓋彎一點蹲低（腳踝留在原本的位置：腳照樣踩在那一階；crouchShare 的比例、最多 crouchMax）；② 上身往前彎（脊椎、胸口，繞人物的左右軸；解出剛好的角度，最多 leanMax）；
     ③ 還不夠再蹲（最多 crouchMax×2）；④ 最後低頭（neckMax）。每一格照當下的 e 算（e 跟著人的位置、片段連續變化）＝彎腰的程度連續變化，沒有跳格。跪著（kneel）只彎腰不蹲（腿已經跪在床墊上）。
     kneel（跪上床、從床上起來）：站著的片段（idle）為底，在真實骨架上：大腿根放到膝蓋上方（大腿往前傾 thigh）、兩膝跪在 root 的高度（床墊頂；kneeY＝膝蓋中心離床墊）、小腿往後平放、腳背貼著床墊；
       上身往前傾 lean、兩手放在大腿上。權重 u.kneelW（KNEEL.blend 秒內 0→1、換成別的姿勢 1→0）：目標點從原本的位置慢慢移過去（同 gymIK）。
     C.headTop(h)＝頭頂的高度（世界座標，測試用）；C.HEADROOM、C.KNEEL 是參數；C.headFitOn=false 可以關掉比較。測試：node tests/ladder_headroom_unit.js */
  C.headFitOn=true;
  C.HEADROOM={margin:0.04,soft:0.035,crouchShare:0.4,crouchMax:0.14,leanMax:0.75,neckMax:0.4,poses:{climb:1,climbdown:1,kneel:1}};
  C.KNEEL={blend:0.55,kneeX:0.1,kneeY:0.055,kneeZ:0.12,thigh:0.22,lean:0.42,neck:-0.12,handF:0.62,handUp:0.075,handOut:0.04};
  const HTV=[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3()), HTQ=[new THREE.Quaternion(),new THREE.Quaternion()], HTM=new THREE.Matrix4();
  /* 頭頂的量法：頭（頭骨和它底下的骨頭：臉、頭髮的彈簧骨）的頂點，在頭骨的本地座標裡取 128 個方向上最外面的那一點（凸包的支撐點，約 50～100 個頂點）；
     每一格頭頂＝這些頂點照骨頭現在的矩陣蒙皮以後最高的那一個（頭髮的彈簧骨甩起來、頭往前低、往旁邊歪、後腦勺翹起來都照樣算）。
     蒙皮自己算（Σ 權重 × 骨頭世界矩陣 × 反綁定矩陣 × bindMatrix × 頂點）：three 的 getVertexPosition 經過 bindMatrixInverse，那個只在 updateMatrixWorld 更新，人物這一格移動過就會多算一次位移。
     第一次要用的時候量（每個人物自己一份，只有爬梯子的玩家用得到）*/
  function headPts(u){ if(u.headSup!==undefined) return u.headSup; const hd=u.vrm.humanoid.getRawBoneNode('head'); if(!hd) return (u.headSup=null);
    u.vrm.scene.updateWorldMatrix(true,true); HTM.copy(hd.matrixWorld).invert(); const V=[], L=[], v=new THREE.Vector3(), q=new THREE.Vector3(), M=new THREE.Matrix4();
    u.vrm.scene.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible||!o.skeleton) return; const g=o.geometry, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, ps=g.attributes.position; if(!si||!sw||!ps) return;
      const bs=o.skeleton.bones, bi=o.skeleton.boneInverses, hs=new Set(); bs.forEach((b,i)=>{ for(let p=b;p;p=p.parent) if(p===hd){ hs.add(i); break; } }); if(!hs.size) return;
      for(let i=0;i<ps.count;i++){ let w=0; for(let c=0;c<4;c++) if(hs.has(si.getComponent(i,c))) w+=sw.getComponent(i,c); if(w<0.5) continue;
        const vb=new THREE.Vector3().fromBufferAttribute(ps,i).applyMatrix4(o.bindMatrix), parts=[]; v.set(0,0,0);
        for(let c=0;c<4;c++){ const wt=sw.getComponent(i,c); if(!(wt>0)) continue; const k=si.getComponent(i,c), b=bs[k]; if(!b) continue; const qq=vb.clone().applyMatrix4(bi[k]); parts.push(b,qq,wt); v.addScaledVector(q.copy(qq).applyMatrix4(b.matrixWorld),wt); }
        V.push(v.clone().applyMatrix4(HTM)); L.push(parts); } });
    if(V.length<4) return (u.headSup=null); const N=128, out=[], seen=new Set();
    for(let d=0;d<N;d++){ const y=1-2*(d+0.5)/N, r=Math.sqrt(1-y*y), th=d*2.399963, dx=Math.cos(th)*r, dz=Math.sin(th)*r; let bi=0, bv=-Infinity; for(let i=0;i<V.length;i++){ const t=V[i].x*dx+V[i].y*y+V[i].z*dz; if(t>bv){ bv=t; bi=i; } } if(!seen.has(bi)){ seen.add(bi); out.push(L[bi]); } }
    return (u.headSup=out); }
  /* 頭頂（世界座標的高度）；pt 給了就放最高的那一點（世界座標）*/
  function headTopW(h,u,pt){ const A=headPts(u); if(!A) return null; let best=-Infinity, bp=null;
    for(const parts of A){ let y=0; for(let c=0;c<parts.length;c+=3){ const e=parts[c].matrixWorld.elements, q=parts[c+1]; y+=parts[c+2]*(e[1]*q.x+e[5]*q.y+e[9]*q.z+e[13]); } if(y>best){ best=y; bp=parts; } }
    if(pt&&bp){ pt.set(0,0,0); for(let c=0;c<bp.length;c+=3) pt.addScaledVector(HTV[7].copy(bp[c+1]).applyMatrix4(bp[c].matrixWorld),bp[c+2]); } return best; }
  C.headTop=function(h){ const u=h&&h.userData; if(!u||u.driver!=='vrm') return null; h.updateWorldMatrix(true,true); return headTopW(h,u); };
  function fitRaw(u){ return u.rawFit||(u.rawFit=(()=>{ const hm=u.vrm.humanoid, o={}; for(const n of ['hips','spine','chest','neck','head']) o[n]=hm.getRawBoneNode(n); for(const L of LEGS.concat(ARMS)) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })()); }
  /* 蹲低 c 公尺：腳踝留在原本的位置、腳掌照原本的方向，膝蓋往前彎 */
  function fitCrouch(h,u,R,c){ if(!(c>1e-4)) return; h.updateWorldMatrix(true,true); const fwd=HTV[2].set(0,0,1).applyQuaternion(h.getWorldQuaternion(HTQ[0])).normalize();
    const keep=LEGS.map(L=>({a:R[L[2]].getWorldPosition(new THREE.Vector3()),q:R[L[2]].getWorldQuaternion(new THREE.Quaternion())}));
    u.model.position.y-=c; u.fitOff=true; h.updateWorldMatrix(true,true);
    LEGS.forEach((L,i)=>{ const pole=R[L[1]].getWorldPosition(new THREE.Vector3()).addScaledVector(fwd,1.0); ik2(R[L[0]],R[L[1]],R[L[2]],keep[i].a,pole); R[L[2]].parent.getWorldQuaternion(HTQ[1]); R[L[2]].quaternion.copy(HTQ[1].invert().multiply(keep[i].q)); R[L[2]].updateWorldMatrix(false,true); }); }
  /* 上身往前彎到頭頂低 need 公尺（最多 cap 弧度）：以脊椎為支點解出角度（頭頂的球心繞支點轉：y'＝r_up·cosδ − r_fw·sinδ），脊椎、胸口各分一部分，量一次再補（最多 4 次）。回傳用掉的角度 */
  function fitLean(h,u,R,lim,cap){ const left=HTV[3].set(1,0,0).applyQuaternion(h.getWorldQuaternion(HTQ[0])).normalize(), fwd=HTV[4].set(0,0,1).applyQuaternion(HTQ[0]).normalize(), piv=R.spine||R.hips; let used=0;
    for(let it=0;it<5;it++){ const e=headTopW(h,u,HTV[5])-lim; if(!(e>0.001)||used>=cap-1e-4) break; const c=HTV[5].sub(piv.getWorldPosition(HTV[6]));
      const ru=c.y, rf=c.dot(fwd), Rr=Math.hypot(ru,rf), be=Math.atan2(rf,ru); let d=Math.acos(Math.max(-1,Math.min(1,(ru-e)/Math.max(1e-4,Rr))))-be; if(!(d>0)) d=0.05; d=Math.min(d,cap-used);
      if(R.spine) rotWorld(R.spine,left,d*0.6); if(R.chest) rotWorld(R.chest,left,d*0.4); else if(R.spine) rotWorld(R.spine,left,d*0.4); used+=d; }
    return used; }
  function headFit(h,u,crouchK){ if(!C.headFitOn||u.headMax==null||!headPts(u)) return; const R=fitRaw(u), K=C.HEADROOM, k=u.k||1; if(!R.head||LEGS.some(L=>L.slice(0,3).some(n=>!R[n]))) return;
    h.updateWorldMatrix(true,true); const L0=u.headMax-K.margin, raw=headTopW(h,u), sf=K.soft*k, x=(L0-raw)/sf, lim=x<-20?L0:raw-sf*Math.log1p(Math.exp(-x)), drop=raw-lim;   /* 軟的上限：頭頂＝L0 − soft·ln(1+e^((L0−raw)/soft))——離上限還遠＝照原本，接近時慢慢開始彎（不是撞到才突然停住），再高也不超過 L0 */
    let e=drop; u.fitE=raw-L0; if(!(e>1e-3)){ u.fitR=0; return; }
    if(crouchK>0){ fitCrouch(h,u,R,Math.min(K.crouchMax*k,e*K.crouchShare)*crouchK); e=headTopW(h,u)-lim; }   /* ① */
    if(e>0) fitLean(h,u,R,lim,K.leanMax);   /* ② */
    e=headTopW(h,u)-lim; if(e>0&&crouchK>0){ fitCrouch(h,u,R,Math.min(K.crouchMax*k,e)*crouchK); e=headTopW(h,u)-lim; }   /* ③ */
    if(e>0&&R.neck){ const left=HTV[3].set(1,0,0).applyQuaternion(h.getWorldQuaternion(HTQ[0])).normalize(); for(let it=0;it<3&&e>0.001;it++){ rotWorld(R.neck,left,Math.min(K.neckMax/3,e*4)); e=headTopW(h,u)-lim; } }   /* ④ */
    u.fitR=e; }
  /* 跪：腿、臀部、上身（headFit 以前）*/
  function kneelBody(h,u,wt){ const R=fitRaw(u), Q=C.KNEEL, k=u.k||1, w=u.model; if(!R.hips||LEGS.concat(ARMS).some(L=>L.slice(0,3).some(n=>!R[n]))) return;
    h.updateWorldMatrix(true,true); const Lc=b=>h.worldToLocal(b.getWorldPosition(new THREE.Vector3())), Wd=v=>h.localToWorld(v.clone());
    const la=R.leftUpperLeg.getWorldPosition(HTV[0]).distanceTo(R.leftLowerLeg.getWorldPosition(HTV[1])), lb=R.leftLowerLeg.getWorldPosition(HTV[0]).distanceTo(R.leftFoot.getWorldPosition(HTV[1])), sc=w.getWorldScale(HTV[2]).y||1;
    const r0=Lc(R.leftUpperLeg).add(Lc(R.rightUpperLeg)).multiplyScalar(0.5), ky=Q.kneeY*k, kz=Q.kneeZ*k;
    const ry=ky+la*Math.cos(Q.thigh), rz=kz-la*Math.sin(Q.thigh);   /* 大腿根的位置：膝蓋上方、往後一點（大腿往前傾 thigh）*/
    w.position.y+=(ry-r0.y)*wt; w.position.z+=(rz-r0.z)*wt; u.fitOff=true; h.updateWorldMatrix(true,true);
    const left=HTV[3].set(1,0,0).applyQuaternion(h.getWorldQuaternion(HTQ[0])).normalize(), a=Q.lean*wt;
    if(R.spine) rotWorld(R.spine,left,a*0.6); if(R.chest) rotWorld(R.chest,left,a*0.4); if(R.neck) rotWorld(R.neck,left,Q.neck*wt);
    for(const [i,s] of [[0,1],[1,-1]]){ const L=LEGS[i], Kw=Wd(new THREE.Vector3(s*Q.kneeX*k,ky,kz)), Aw=Wd(new THREE.Vector3(s*Q.kneeX*0.9*k,ky+0.012*k,kz-lb*0.985));
      const cur=R[L[2]].getWorldPosition(new THREE.Vector3()); if(wt<1) Aw.lerp(cur,1-wt);
      const pole=Kw.clone().addScaledVector(HTV[4].set(0,0,1).applyQuaternion(HTQ[0]),0.3);   /* 膝蓋往前（膝蓋的目標點再往前一點：大腿、小腿折得很緊時方向才穩）*/ if(wt<1) pole.lerp(R[L[1]].getWorldPosition(HTV[5]),1-wt);   /* 權重小：膝蓋照原本的方向 */
      ik2(R[L[0]],R[L[1]],R[L[2]],Aw,pole);
      const toe=R[L[3]]; if(toe){ const fd=toe.getWorldPosition(new THREE.Vector3()).sub(R[L[2]].getWorldPosition(HTV[5])), sd=R[L[2]].getWorldPosition(new THREE.Vector3()).sub(R[L[1]].getWorldPosition(HTV[6]));   /* 腳背貼床墊：腳尖的方向轉到小腿的方向（往後）*/
        const ax=new THREE.Vector3().crossVectors(fd,sd); if(ax.lengthSq()>1e-10){ ax.normalize(); rotWorld(R[L[2]],ax,fd.angleTo(sd)*wt*wt*0.92); } } }   /* ×wt²：權重小（剛要跪、快站起來）腳掌還是平的，腳尖不往下插進那一階 */
    u.kneelLa=la; }
  /* 跪：兩手放在大腿上（headFit 以後）*/
  function kneelArms(h,u,wt){ const R=fitRaw(u), Q=C.KNEEL, k=u.k||1; if(ARMS.some(L=>L.some(n=>!R[n]))) return; h.updateWorldMatrix(true,true);
    for(const [i,s] of [[0,1],[1,-1]]){ const L=ARMS[i], LG=LEGS[i], r=R[LG[0]].getWorldPosition(new THREE.Vector3()), kn=R[LG[1]].getWorldPosition(new THREE.Vector3());
      const T=r.lerp(kn,Q.handF); T.y+=Q.handUp*k; const lf=HTV[3].set(1,0,0).applyQuaternion(h.getWorldQuaternion(HTQ[0])).normalize(); T.addScaledVector(lf,s*Q.handOut*k);
      const cur=R[L[2]].getWorldPosition(new THREE.Vector3()); if(wt<1) T.lerp(cur,1-wt);
      const sh=R[L[0]].getWorldPosition(new THREE.Vector3()), fwd=HTV[4].set(0,0,1).applyQuaternion(HTQ[0]); const pole=sh.clone().addScaledVector(lf,s*0.45).addScaledVector(fwd,-0.25); pole.y-=0.3;
      if(wt<1) pole.lerp(R[L[1]].getWorldPosition(HTV[5]),1-wt);   /* 權重小的時候手肘照原本的方向（pole＝手肘現在的位置）：權重歸零那一格手肘不會翻回去 */
      ik2(R[L[0]],R[L[1]],R[L[2]],T,pole); } }
  /* 坐著讀書（pose 'read'；READ-POSE-BOOK-1103，使用者 11-03 附 Café 截圖：「不管事咖啡廳 還是圖書館 都給我這樣念書 會笑出來 書在哪」——舊版只有 READ_VRM 的手臂角度：兩手往前下方張開、手上沒有書）。
     每一個讀書的人（VRM、GLB driver 都一樣；Café 沙發、總圖書桌、教室）手上捧一本打開的書（PROPS.readBook：tools/blender/char_second/book_open.py 的 GLB），在真實骨架上：
     ① 書：在兩條大腿根中間的正前方——hips 往上 dy、往前 dz（乘身高比例 u.k；書本身是真實尺寸、不縮放），頁面朝向眼睛（兩眼骨頭的中點；沒有眼睛骨頭用頭往上、往前一點；再往讀的人那邊立起來一點 tilt：只朝眼睛的話沙發上的書幾乎是平的、像端盤子，2026-11-03 截圖），
        左頁在人物的左邊；書掛在 vrmWrap（u.model）底下、每一幀照骨頭放（世界矩陣換成 wrap 的座標，wrap 的縮放抵掉）。
     ② 兩手：和 rideIK／climbIK 同一套兩段式 IK（ik2）：手腕放到書的左右外緣、偏下半部、在封面後面（手掌貼著封底、手指往書溝、往上，大拇指在書的外緣）；手肘往下、往外、往後（pole）。
     ③ 手掌方向：手指（手腕→中指根）＝書的「往內＋往上」，掌心＝朝向書（書的 +z，也就是朝讀的人）；掌心方向用真實骨架算（食指根→小指根 × 手指方向，左右手號相反：和 VRM 0.x／1.0 無關）。
     ④ 手指貼著封底、往掌心微彎（grip＝指根、中節和掌心那一面的夾角，弧度）＝扶著封底。頭往下看書（READ_VRM、Head 0.35 rad）。
     C.READ_BOOK 的長度都是公尺；書的尺寸照 book_open.json（W＝單頁寬、back＝外緣封底的 z）。C.readIK=false：不放書、手照 READ_VRM（比較用）。u.readHands＝[左手腕, 右手腕] 的目標（世界座標，測試用：tests/read_book_unit.js）*/
  C.readIK=true;
  C.READ_BOOK={dy:0.24,dz:0.3,tilt:0.2,W:0.15,H:0.1065,back:-0.0005,palmIn:0.035,palmY:-0.035,palmOff:0.022,palm:0.045,fx:0.5,fy:0.85,grip:[0.06,0.16]};
  const RBV=[0,1,2,3,4,5,6,7,8].map(()=>new THREE.Vector3()), RBM=[new THREE.Matrix4(),new THREE.Matrix4(),new THREE.Matrix4()], RBQ=[new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()];
  /* 手掌的世界方向：f＝手腕→中指根、n＝掌心（左手 +(f×a)、右手 −(f×a)，a＝食指根→小指根的反方向＝小指根→食指根）；回傳正交化的 [f, n] 或 null */
  function palmFrame(hand,idx,mid,lit,left,f,n){ if(!hand||!idx||!mid||!lit) return false; const p=hand.getWorldPosition(RBV[6]); f.copy(mid.getWorldPosition(RBV[7])).sub(p); const a=idx.getWorldPosition(RBV[8]).sub(lit.getWorldPosition(RBV[7]));
    if(f.lengthSq()<1e-10||a.lengthSq()<1e-10) return false; f.normalize(); n.crossVectors(f,a); if(!left) n.negate(); n.addScaledVector(f,-n.dot(f)); if(n.lengthSq()<1e-10) return false; n.normalize(); return true; }
  /* 把 b 在世界座標轉 q（左乘）*/
  function rotWorldQ(b,q){ b.parent.getWorldQuaternion(RBQ[0]); RBQ[1].copy(RBQ[0]).invert(); b.quaternion.premultiply(RBQ[0]).premultiply(q).premultiply(RBQ[1]); b.updateWorldMatrix(false,true); }
  function basisQ(f,n,out){ const s=RBV[5].crossVectors(f,n); RBM[2].makeBasis(f,n,s); return out.setFromRotationMatrix(RBM[2]); }
  /* 讀書的人前面有沒有桌子：從書的位置（中間、左右、再往前一點）往下打 5 條射線，找高度在髖關節上方 6～55 cm 之間、看得到的面（人物、透明的東西不算）；
     回傳最高的那個面在人物座標的高度，沒有＝null。只在換位置（坐到別的座位、轉向）時算，之後 1.5 秒、5 秒各再算一次（區域的正式模型可能晚一點才載好），其他時候用存下來的。*/
  const RTR=new THREE.Raycaster(), RTV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()], RTDN=new THREE.Vector3(0,-1,0);
  function readTable(h,u,cx,hp,cz,k){ const T=u.readTbl, now=(u.anim&&u.anim.t)||0, wp=h.getWorldPosition(RTV[0]);
    const key=Math.round(wp.x*20)+','+Math.round(wp.y*20)+','+Math.round(wp.z*20)+','+Math.round(h.rotation.y*20);
    if(T&&T.key===key&&(T.n>=3||now<T.next)) return T.y;
    const n=T&&T.key===key?T.n+1:1; let root=h; while(root.parent) root=root.parent;
    const list=[]; const walk=o=>{ if(!o.visible||(o!==root&&o.userData&&o.userData.driver)) return; if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh){ const m=Array.isArray(o.material)?o.material[0]:o.material; if(m&&m.visible!==false&&!(m.transparent&&m.opacity<0.3)) list.push(o); } for(const c of o.children) walk(c); };
    for(const c of root.children) if(c!==h) walk(c);
    let best=null; const lo=hp.y+0.06*k, hi=hp.y+0.55*k;
    if(list.length) for(const [dx,dz] of [[0,-0.06],[0,0.04],[0,0.14],[0.12,0.04],[-0.12,0.04]]){ const o=h.localToWorld(RTV[1].set(cx+dx*k,hi+0.05,cz+dz*k)); RTR.set(o,RTDN); RTR.far=(hi-lo)+0.05;
      for(const hit of RTR.intersectObjects(list,false)){ const y=h.worldToLocal(RTV[2].copy(hit.point)).y; if(y>=lo&&y<=hi){ if(best==null||y>best) best=y; break; } } }
    u.readTbl={key,y:best,n,next:now+(n===1?1.5:3.5)}; return best; }
  /* get(名稱)：VRM humanoid 骨頭名稱（leftUpperArm…）→ 真實骨架的節點 */
  /* 手上拿的不是書（SEAT-ACTIVITY-1104，使用者 11-04「有可能會出現筆記型電腦、平板或者單純在滑手機」；src/seatact3d.js）：CHAR.setReadItem(人物, 'phone'／'tablet'／'book')。
     同一套 readIK（pose 'read'：坐著、低頭、兩手捧著），換成 C.READ_ITEM 的尺寸：東西的座標和書一樣（x＝人物的右邊、y＝往上、+z＝朝讀的人），手腕在兩側下半部的背面；
     手上的東西是 desk_props.glb 的單件（PROPS.readHeld：item_phone_on；平板＝item_tablet，模型還沒有＝照拿書）。載入失敗＝照拿書 */
  C.READ_ITEM={ phone:{dy:0.27,dz:0.25,tilt:0.32,W:0.036,H:0.073,back:-0.0045,palmIn:0.004,palmY:-0.032,palmOff:0.017,palm:0.042,fx:0.72,fy:0.69,grip:[0.32,0.5]},
    tablet:{dy:0.25,dz:0.29,tilt:0.26,W:0.125,H:0.085,back:-0.0045,palmIn:0.02,palmY:-0.03,palmOff:0.018,palm:0.045,fx:0.55,fy:0.83,grip:[0.12,0.25]} };
  const readKind=u=>{ const k=u.readItem; if(!k||k==='book'||!C.READ_ITEM[k]) return 'book'; const hd=u.readHeld&&u.readHeld[k]; return hd&&hd.userData.failed?'book':k; };
  C.setReadItem=function(h,kind){ const u=h&&h.userData; if(!u) return false; u.readItem=kind&&kind!=='book'?kind:null; readVis(u); return true; };
  function readVis(u){ const on=!!u.readOn, kd=readKind(u); if(u.readBook) u.readBook.visible=on&&kd==='book'; if(u.readHeld) for(const k in u.readHeld) u.readHeld[k].visible=on&&kd===k; }
  function readIK(h,u,get){ const k=u.k||1; const hips=get('hips'), lUL=get('leftUpperLeg'), rUL=get('rightUpperLeg'), head=get('head');
    const AR=[['leftUpperArm','leftLowerArm','leftHand'],['rightUpperArm','rightLowerArm','rightHand']].map(L=>L.map(get));
    if(!hips||!head||AR.some(L=>L.some(b=>!b))) return;
    let kd=readKind(u); if(kd!=='book'){ const H=u.readHeld||(u.readHeld={}); if(!H[kd]){ const o=typeof PROPS!=='undefined'&&PROPS.readHeld?PROPS.readHeld(kd):null; if(o){ H[kd]=o; u.model.add(o); } } if(!H[kd]||H[kd].userData.failed) kd='book'; }
    const K=kd==='book'?C.READ_BOOK:C.READ_ITEM[kd];
    if(kd==='book'&&!u.readBook){ if(typeof PROPS==='undefined'||!PROPS.readBook) return; u.readBook=PROPS.readBook(); u.model.add(u.readBook); }
    readVis(u);
    h.updateWorldMatrix(true,true); const Lc=(b,v)=>h.worldToLocal(b.getWorldPosition(v));
    // ① 書的位置、方向（人物座標：x 往左、y 往上、z 往前）
    const hp=Lc(hips,RBV[0]); const cx=lUL&&rUL?(Lc(lUL,RBV[1]).x+Lc(rUL,RBV[2]).x)/2:hp.x;
    const ctr=RBV[3].set(cx,hp.y+K.dy*k,hp.z+K.dz*k);
    const eL=get('leftEye'), eR=get('rightEye'); let eye; if(eL&&eR){ eye=Lc(eL,new THREE.Vector3()).add(Lc(eR,RBV[2])).multiplyScalar(0.5); } else { eye=Lc(head,new THREE.Vector3()).add(RBV[2].set(0,0.06*k,0.06*k)); }
    const Z=RBV[4], X=RBV[2], Y=RBV[1]; const frame=()=>{ Z.copy(eye).sub(ctr).normalize(); Z.z-=K.tilt; Z.normalize(); X.set(-1,0,0); X.addScaledVector(Z,-X.dot(Z)).normalize(); Y.crossVectors(Z,X); };   /* X＝書的右邊＝人物的右邊（−x）*/
    frame();
    /* 前面有桌子（Café 的桌子、總圖的長桌）：書整本抬到桌面上方（最低的那一邊離桌面 ≥ 4.5 cm：手在封底後面、比書低一點，手也不碰桌面），不穿進桌子、不藏在桌子底下（readTable：桌面在人物座標的高度，沒有桌子＝null）*/
    const tY=readTable(h,u,cx,hp,ctr.z,k), lowNow=()=>ctr.y-Math.abs(Y.y)*K.H-Math.abs(Z.y)*0.004;
    let lift=0; if(tY!=null) for(let it=0;it<3;it++){ const d=tY+0.045-lowNow(); if(d<=0.001) break; ctr.y+=d; lift+=d; frame(); }
    u.readLift=lift;
    const ML=RBM[0].makeBasis(X,Y,Z).setPosition(ctr), MW=RBM[1].multiplyMatrices(h.matrixWorld,ML);
    const bk=kd==='book'?u.readBook:u.readHeld[kd]; u.model.updateWorldMatrix(true,false); bk.matrix.copy(u.model.matrixWorld).invert().multiply(MW); bk.matrix.decompose(bk.position,bk.quaternion,bk.scale); bk.updateMatrixWorld(true);
    const bookQ=RBQ[2].setFromRotationMatrix(MW); const nW=new THREE.Vector3(0,0,1).applyQuaternion(bookQ);
    // ② 兩手
    const hands=[];
    for(const [i,side] of [[0,1],[1,-1]]){ const L=AR[i], bx=-side, pre=i?'right':'left';   /* 左手（人物 +x）在書的 −x */
      const fB=new THREE.Vector3(-bx*K.fx,K.fy,0).normalize(), pc=new THREE.Vector3(bx*(K.W-K.palmIn),K.palmY,K.back-K.palmOff);
      const wB=pc.addScaledVector(fB,-K.palm), T=wB.applyMatrix4(MW); hands.push(T.clone());
      const sh=Lc(L[0],new THREE.Vector3()); const pole=h.localToWorld(sh.add(new THREE.Vector3(side*0.45*k,-0.6*k,-0.2*k)));
      ik2(L[0],L[1],L[2],T,pole);
      // ③ 手掌方向
      const F=u.rawFingRead||(u.rawFingRead={}), fb=F[pre]||(F[pre]=['Index','Middle','Ring','Little'].map(f=>['Proximal','Intermediate','Distal'].map(j=>get(pre+f+j))));
      const fc=new THREE.Vector3(), nc=new THREE.Vector3();
      if(palmFrame(L[2],fb[0][0],fb[1][0],fb[3][0],i===0,fc,nc)){ const fw=fB.clone().transformDirection(MW), nw=nW.clone(); nw.addScaledVector(fw,-nw.dot(fw)).normalize();
        const qc=basisQ(fc,nc,new THREE.Quaternion()), qd=basisQ(fw,nw,new THREE.Quaternion()); rotWorldQ(L[2],qd.multiply(qc.invert()));
        // ④ 手指貼著封底、往掌心微彎：每一節手指（指根、中節）的方向和掌心那一面的夾角設成 grip（累積；不管模型原本的手指是直的還是彎的：GLB 的綁定姿勢手指本來就彎）
        if(K.grip){ const nn=nw; for(const row of fb) for(let j=0;j<2;j++){ const b=row[j], c=row[j+1]; if(!b||!c) continue; const d=c.getWorldPosition(RBV[5]).sub(b.getWorldPosition(RBV[6])); const ln=d.length(); if(ln<1e-5) continue;
            const cur=Math.asin(Math.max(-1,Math.min(1,d.dot(nn)/ln))), ax=RBV[7].crossVectors(d,nn); if(ax.lengthSq()<1e-12) continue; ax.normalize(); rotWorld(b,ax,K.grip[j]-cur); } } } }
    u.readHands=hands;
    if(u.readTurn>0&&kd==='book') readTurnFx(u,get,MW,K); else if(u.readScroll>0&&kd!=='book') readScrollFx(u,get,MW);   /* 坐著的小動作：翻頁、滑手機（NPC-AMBIENT-ANIM-1104）*/ }
  const RA={}, SFV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  /* sitFeet 的矩陣（PERF-XS-NPC-1108 (A)，LAWWW2-B 2026-11-09；大口 1F CPU 效能紀錄：sitFeet 佔整幀 9.1%，其中整個人物的 h.updateWorldMatrix(true,true) 5.9%）：
     原本先把整個人物（頭髮彈簧骨、手指、配件、網格都算）更新一次，再對每根腿骨 getWorldPosition（每次都往上走到根）。這裡只用到兩條腿：
     髖部往上那一條鏈更新一次，再更新兩條腿（大腿以下）的子樹；讀位置、旋轉直接從 matrixWorld 拿（剛更新過，和 getWorld* 一樣）。
     算出來的結果和原本一樣（node tests/sit_feet_fast_unit.js：兩個相同的人物同步坐下，一個舊做法一個新做法，腿骨位置差 < 1e-6 m）。
     後面的 readIK、headFit、lookAt 都自己更新矩陣；畫面前 updateVRM 也會整個再更新一次，不靠這裡。C.sitFeetFast=false＝原本的做法（PERFAB 前後對照）。 */
  C.sitFeetFast=true; const SFS=new THREE.Vector3(), SFP=new THREE.Vector3();
  function legsWM(h,B){ if(!C.sitFeetFast){ h.updateWorldMatrix(true,true); return; } const hips=B[LEGS[0][0]].parent; hips.updateWorldMatrix(true,false); for(const L of LEGS){ const t=B[L[0]]; if(t.parent!==hips) t.parent.updateWorldMatrix(true,false); t.updateWorldMatrix(false,true); } }
  function wpos(b,v){ return C.sitFeetFast?v.setFromMatrixPosition(b.matrixWorld):b.getWorldPosition(v); }
  function wquat(b,q){ if(!C.sitFeetFast) return b.getWorldQuaternion(q); b.matrixWorld.decompose(SFP,q,SFS); return q; }
  function sitFeet(h,u){ const hm=u.vrm.humanoid; const B=u.rawLegs||(u.rawLegs=(()=>{ const o={}; for(const L of LEGS) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(LEGS.some(L=>L.slice(0,3).some(n=>!B[n]))) return;
    const gy=h.getWorldPosition(SFV[0]).y, key=u.key||'_';
    if(!(u.anim&&u.anim.static)){   // 站著（不是坐姿）：記下腳踝離地的高度
      if(u.anim&&u.anim.cur==='idle'&&!u.ikDrop&&!u.gym){ legsWM(h,B); const a=Math.min(wpos(B.leftFoot,SFV[1]).y,wpos(B.rightFoot,SFV[2]).y)-gy; if(a>0.02&&a<0.2) RA[key]=RA[key]?Math.min(RA[key],a):a; }
      return; }
    if(u.sitFeet===false||u.ride||u.gym||u.anim.staticKind==='lie') return;     // 躺著不調腳；騎車：腳在踏板上（rideIK）。階梯教室的座位（有平台高度、前面是桌子）：腳往前伸會從桌子下面、平台邊緣突出來，維持原樣（GAME.sitAt 設定）
    const ra=RA[key]||0.085*(u.k||1); legsWM(h,B);
    for(const [a,b,c] of LEGS){ const hip=wpos(B[a],SFV[1]), knee=wpos(B[b],SFV[2]), ank=wpos(B[c],SFV[3]);
      const target=gy+ra;
      if(ank.y>target+0.003){   /* 腳懸空（SIT-HEIGHT-1104：照大腿底部坐在椅面上以後，腿比較短的人坐 0.47 m 以上的椅子腳會離地 1～2 cm）：大腿往下放（最多到水平以下 26°），
           膝蓋反轉同樣的角度——小腿的方向不變、整段往下，腳踩到地（和下面往上抬對稱；腳掌照原本的方向）*/
        wquat(B[c],IKQ[3]); const tv=SFV[4].copy(knee).sub(hip), Lt=tv.length();
        if(Lt>1e-3){ const e0=Math.asin(Math.max(-1,Math.min(1,tv.y/Lt))), e1=Math.max(-0.45,Math.asin(Math.max(-1,Math.min(1,(tv.y-(ank.y-target))/Lt)))), al=e1-e0;
          const ax=new THREE.Vector3().crossVectors(tv,new THREE.Vector3(0,1,0));
          if(al<-1e-4&&ax.lengthSq()>1e-10){ ax.normalize(); rotWorld(B[a],ax,al); rotWorld(B[b],ax,-al); wquat(B[c].parent,IKQ[0]); B[c].quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); B[c].updateWorldMatrix(false,true); } }
        continue; }
      if(ank.y>=target-0.003) continue;
      wquat(B[c],IKQ[3]);   // 腳掌原本的方向
      { // 1. 大腿往上抬（最多抬到水平以上 17°），膝蓋同時反轉同樣的角度：小腿的方向不變、整段往上移（試過只補 85%：剩下 2 cm 要靠小腿斜 19° 才補得到——接近垂直時小腿要轉很多角度才抬得高一點）
        const tv=SFV[4].copy(knee).sub(hip), Lt=tv.length();
        if(Lt>1e-3){ const e0=Math.asin(Math.max(-1,Math.min(1,tv.y/Lt))), need=target-ank.y;
          const e1=Math.min(0.30,Math.asin(Math.max(-1,Math.min(1,(tv.y+need)/Lt)))), al=e1-e0;
          const ax=new THREE.Vector3().crossVectors(tv,new THREE.Vector3(0,1,0));
          if(al>1e-4&&ax.lengthSq()>1e-10){ ax.normalize(); rotWorld(B[a],ax,al); rotWorld(B[b],ax,-al);
            wpos(B[b],knee); wpos(B[c],ank); } } }
      const L=knee.distanceTo(ank); if(L<1e-3) continue;
      const ry=h.rotation.y, fwd=(ank.x-knee.x)*Math.sin(ry)+(ank.z-knee.z)*Math.cos(ry);   // 小腿往前（＋）還是往後（－）斜：坐姿的小腿本來略往後
      const ph0=Math.sign(fwd||1)*Math.acos(Math.max(-1,Math.min(1,(knee.y-ank.y)/L))), ph1=Math.acos(Math.max(0.17,Math.min(1,(knee.y-target)/L)));   // 最多往前伸到離垂直 80°
      const d=ph1-ph0;
      if(d>1e-4){ wpos(B[a],hip); const u1=SFV[4].copy(hip).sub(knee), v1=new THREE.Vector3().copy(ank).sub(knee), n=new THREE.Vector3().crossVectors(u1,v1);
        if(n.lengthSq()>1e-10){ n.normalize(); rotWorld(B[b],n,d); } }   // 2. 還差的部分：小腿往前伸（膝蓋角度變大）
      wquat(B[c].parent,IKQ[0]); B[c].quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); B[c].updateWorldMatrix(false,true); } }
  /* 跪坐的高度：膝蓋、腳踝、腳趾（骨頭在腿的中間）最低的那一個放在坐墊頂＋5 cm（腿的半徑）。animateVRM 每一幀把高度重設成椅子的坐姿，這裡再往下移，不會累加 */
  function sitFloorFit(h,u){ if(!u.sitFloor||!(u.anim&&u.anim.static&&u.anim.staticKind==='sit')||u.ride) return; const hm=u.vrm.humanoid; const B=u.rawLegs||(u.rawLegs=(()=>{ const o={}; for(const L of LEGS) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(LEGS.some(L=>L.slice(0,3).some(n=>!B[n]))) return; h.updateWorldMatrix(true,true); const gy=h.getWorldPosition(SFV[0]).y; let lo=Infinity;
    for(const L of LEGS) for(const n of L){ if(!B[n]||n===L[0]) continue; lo=Math.min(lo,B[n].getWorldPosition(SFV[1]).y); }
    if(!isFinite(lo)) return; const sc=h.getWorldScale(SFV[2]).y||1; u.model.position.y+=(gy+u.sitFloor+0.05-lo)/sc; u.model.updateWorldMatrix(false,true); }
  /* ===== 健身房的動作（GYM-USE-1103；使用者 11-03「你就設計健身房真的有人在用很難嗎」、更早「都不太會動 更詭異」）=====
     沒有運動的動畫片段（mixamo_clips 只有走、跑、站），這裡用程式擺骨頭：一個循環一個循環地動，每個人的速度（±15%）、起始相位不同（不會同步）。
     做法和騎腳踏車（rideIK）、爬梯子（climbIK）同一套：在真實骨架上用兩段式 IK（ik2），目標點寫在人物自己的座標裡（+z 前、+x 左、y 上、地面 0）；
     器材的尺寸照 BB-B 的 gym_b1_props.py：坐在器材上的人，人物的原點放在器材的原點（底面中心）、面向器材正面 +z。
       gym_squat   深蹲（深蹲架前面、面向鏡子）：站著的片段為底，臀部往下往後、上身前傾、腳踩住地板（腳掌照原本的方向）、兩手在肩膀兩側（扛槓的位置）。
       gym_curl    啞鈴彎舉（啞鈴架前面、面向鏡子）：站著的片段為底，上臂貼著身體、前臂左右輪流往上彎、手握住。
       gym_press   坐姿肩推（臥推椅的座墊上、面向鏡子）：兩手從肩膀兩側推到頭上再放下來，腳踩地。
       gym_bike    飛輪：坐在座墊上、上身前傾、手握把手、腳在曲柄的圓周上踩（左右差半圈）。
       gym_row     划船機：腳踩踏板、座位前後滑——推腿 → 上身往後 → 手拉到胸口下，回來時倒過來（手 → 上身 → 腿）。
       gym_stretch 墊子上拉筋：坐在墊子上，一半的人兩腿伸直往前彎（坐姿體前彎），一半的人兩腿張開、左右輪流側彎（手越過頭頂）。
     手上沒有啞鈴、槓、拉把（器材模型是固定的）：美術缺口，交 LAWWW2。GLB、程序化備用人物沒有這些動作：坐著的（press、bike、row、stretch）照坐下、站著的照站著（C.animate）。
     C.GYM：每個動作一個循環幾秒、幅度、器材上的位置；C.gymIK=false 可以關掉比較。測試：node tests/gym_pose_unit.js */
  C.gymIK=true;
  C.GYM={ blend:0.9, squat:{T:2.8,depth:0.36,back:0.13,lean:0.5,stance:0.13},
    curl:{T:2.4,lo:0.15,hi:2.25},
    press:{T:3.0,seat:[0,0.46,0.28],feet:[0.22,0.78]},
    bike:{T:0.9,seat:[0,0.985,-0.31],axle:[0,0.36,-0.02],crank:0.17,pedalX:0.12,grip:[0.25,1.14,0.31],lean:0.85},
    row:{T:3.2,seatY:0.40,zCatch:0.03,zFinish:-0.36,feet:[0.12,0.34,0.43],handle:[0.12,0.50,0.53]},
    stretch:{T:6.0,T2:5.0},
    swim:{T:1.5,TB:1.8,roll:0.5,kick:0.13,water:-0.14,y:-0.14,tilt:0.10,blend:2.0} };   /* water：水面比人物原點（池邊的地面）低多少（gym_b1.glb 的 b1_water 在 −0.14）；y：臀部骨頭在水面下多少；tilt：身體頭高腳低的角度（弧度）。
     2026-11-11 改（POOL-SWIM-LOOK-1110，LAWWW 角色驗收「近看像趴在水上」）：原本 y −0.09、沒有 tilt＝整個人水平、背和臀部浮在水面上，腳一直踢出水面。
     改成臀部低一點（−0.14）、頭高腳低 0.10 弧度（約 6°）：背和臀部剛好在水面下，頭頂、划回來的手臂出水，腳踢到水面附近（真的自由式也是這樣：頭在水面、臀部略低、腳在水裡踢）*/
  /* 游泳（ART-GYM-POOL-SWIMMERS-1103，LAWWW2 帳號 A 11-10；使用者 11-03「游泳池完全沒人？」）：swim_free 自由式、swim_breast 蛙式。和上面的器材動作同一套（真實骨架、ik2、每個人速度相位不同）：
     先照直立的人擺好手腳（人物座標 +z 前、+y 上），最後整個人轉成趴著（上方 → 前方、臉朝下）、臀部放在人物原點正上方、背在水面（人物原點＝池邊地面的高度，和其他路人一樣；水面 swim.water）。
       自由式：兩手輪流畫大圓（頭上 → 身體下面往後划 → 從水面上回來，划水時手肘彎、回來時手肘高），身體跟著左右滾（roll），腳一個手的循環踢三下（上下 kick m），
               每兩個循環往右換氣一次（頭跟著轉向側面）。
       蛙式：兩手從頭上往外撥、收到胸口下面、再往前推出去，接著滑行；划水的時候上身抬起來換氣；手推出去時腳收（腳跟往屁股、膝蓋往外）→ 往外往後踢 → 併攏滑行。
     人物原點＝水道上的位置（遊戲照 C.swimLap 來回游）；人群（crowd3d 的游泳池）LAWWW 接。測試：node tests/swim_pose_unit.js */
  C.GYM_POSES=['gym_squat','gym_curl','gym_press','gym_bike','gym_row','gym_stretch','swim_free','swim_breast'];
  const SWIM={swim_free:1,swim_breast:1};
  /* 水道上來回游：t 秒（每個人自己的時間）、L 水道長（m）、v 速度（m/s）→ {x：離水道中間多遠（−L/2～L/2）、dir：往 +x（1）或 −x（−1）、yaw：人物朝向、turn：正在池邊轉身（0～1）}。
     游到池邊停 TURN 秒轉身（yaw 轉半圈），再往回游 */
  C.swimLap=function(t,L,v){ const TURN=1.4, run=L/v, lap=run+TURN, n=Math.floor(t/lap), f=t-n*lap, dir=n%2?-1:1, d=Math.min(f,run)*v, x=dir*(d-L/2);
    const tr=f>run?Math.min(1,(f-run)/TURN):0, e=tr*tr*(3-2*tr), yaw0=dir>0?Math.PI/2:-Math.PI/2; return {x,dir,turn:tr,yaw:yaw0+Math.PI*e}; };
  const GYM_SEATED={gym_press:1,gym_bike:1,gym_row:1,gym_stretch:1,swim_free:1,swim_breast:1};   /* 靜態的底子（不放片段）；深蹲、彎舉用站著的片段當底子 */
  const GYM_BASE=Object.assign({},SIT_VRM,{Hips:[0,0,0],Spine:[0,0,0],Spine1:[0,0,0],Spine2:[0,0,0],Neck:[0,0,0],Head:[0,0,0],LeftForeArm:[0,-0.6,0],RightForeArm:[0,0.6,0],LeftHand:[0,0,0],RightHand:[0,0,0]});   /* 手肘先微彎（往前）：IK 從打直的手臂開始時，往哪邊彎不穩定 */
  const SWIM_BASE=Object.assign({},GYM_BASE,{LeftUpLeg:[0,0,0],RightUpLeg:[0,0,0],LeftLeg:[0.05,0,0],RightLeg:[0.05,0,0]});   /* 游泳：兩腿伸直（坐姿的底子是大腿往前 1.45）*/
  const GYV=[0,1,2,3,4,5,6,7,8,9,10,11].map(()=>new THREE.Vector3()), GYQ=new THREE.Quaternion();
  const sm01=(x,a,b)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  function gymRaw(u){ return u.rawGym||(u.rawGym=(()=>{ const hm=u.vrm.humanoid, o={}; for(const n of ['hips','spine','chest','upperChest','neck','head']) o[n]=hm.getRawBoneNode(n); for(const L of LEGS.concat(ARMS)) for(const n of L) o[n]=hm.getRawBoneNode(n);
    for(const s of ['left','right']) o[s+'F']=['Index','Middle','Ring','Little'].map(f=>['Proximal','Intermediate','Distal'].map(j=>hm.getRawBoneNode(s+f+j))); return o; })()); }
  /* 手握住（啞鈴、把手）：四根手指往掌心彎（和 climbIK 的 ⑤ 同一個算法）*/
  function gymGrip(R,i,amt){ const fb=R[i?'rightF':'leftF']; if(!fb||!fb[0][0]||!fb[3][0]||!(amt>0)) return; const ax=fb[0][0].getWorldPosition(GYV[10]).sub(fb[3][0].getWorldPosition(GYV[11])); if(ax.lengthSq()<1e-8) return; ax.normalize(); const sg=i?1:-1, G=[0.75,0.95,0.65];
    for(const row of fb) for(let j=0;j<3;j++){ const b=row[j]; if(b) rotWorld(b,ax,sg*G[j]*amt); } }
  function gymIK(h,u,dt){ if(!C.gymIK) return; const g=u.gym, R=gymRaw(u), P=C.GYM, k=u.k||1, w=u.model, base=w.userData.baseY||0;
    if(LEGS.concat(ARMS).some(L=>L.slice(0,3).some(n=>!R[n]))||!R.hips) return;
    g.w=Math.min(1,(g.w||0)+(dt>0?dt/(SWIM[g.pose]?C.GYM.swim.blend:C.GYM.blend):0));   /* 游泳：從站姿換成趴到水裡要移 1 m 多，慢一點（2 秒）*/ const wt=g.w*g.w*(3-2*g.w), t=g.t;   /* 剛換成這個動作：C.GYM.blend 秒內從原本的姿勢過去（不跳格；坐著的動作底子也一起轉，animateVRM）*/
    const Lc=(b,v)=>h.worldToLocal(b.getWorldPosition(v||new THREE.Vector3())), Wd=v=>h.localToWorld(v.clone());
    h.getWorldQuaternion(GYQ); const LEFT=new THREE.Vector3(1,0,0).applyQuaternion(GYQ).normalize(), FWD=new THREE.Vector3(0,0,1).applyQuaternion(GYQ).normalize();   /* 人物的左方、前方（世界座標）：繞左方轉正的角度＝往前傾 */
    const lean=parts=>{ for(const [n,a] of parts) if(R[n]&&Math.abs(a)>1e-5) rotWorld(R[n],LEFT,a*wt); };
    const tilt=parts=>{ for(const [n,a] of parts) if(R[n]&&Math.abs(a)>1e-5) rotWorld(R[n],FWD,a*wt); };
    const limb=(L,T,pole,keepFoot)=>{ const Tw=Wd(T), Pw=Wd(pole), A=R[L[0]].getWorldPosition(new THREE.Vector3()); if(wt<1) Tw.lerp(R[L[2]].getWorldPosition(new THREE.Vector3()),1-wt);   /* 換過來的時候：目標點從原本的位置慢慢移過去（試過把骨頭角度 slerp 過去：手臂要轉 180° 時路徑不定，會整隻甩到另一邊）*/
      const ll=len(L), mx=(ll[0]+ll[1])*0.985, dd=Tw.distanceTo(A); if(dd>mx) Tw.sub(A).multiplyScalar(mx/dd).add(A);   /* 搆不到：停在快伸直的地方（完全打直時膝蓋、手肘往哪邊彎不穩，會抖）*/
      if(keepFoot) R[L[2]].getWorldQuaternion(IKQ[3]); ik2(R[L[0]],R[L[1]],R[L[2]],Tw,Pw);
      if(keepFoot){ R[L[2]].parent.getWorldQuaternion(IKQ[0]); R[L[2]].quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); R[L[2]].updateWorldMatrix(false,true); } };
    const len=L=>{ const a=R[L[0]].getWorldPosition(GYV[2]), b=R[L[1]].getWorldPosition(GYV[3]), c=R[L[2]].getWorldPosition(GYV[4]); return [a.distanceTo(b),b.distanceTo(c)]; };
    /* 身體的座標（上身傾斜以後）：up＝臀部 → 脖子、lf＝人物的左方、fw＝lf×up */
    const torso=()=>{ const hp=Lc(R.hips), nk=Lc(R.neck||R.chest||R.spine), up=nk.clone().sub(hp).normalize(), lf=new THREE.Vector3(1,0,0), fw=new THREE.Vector3().crossVectors(lf,up).normalize(); lf.crossVectors(up,fw).normalize(); return {hp,up,lf,fw}; };
    const place=(hy,hz)=>{ w.position.y=base; w.position.z=0; h.updateWorldMatrix(true,true); const h0=Lc(R.hips); w.position.y=base+(hy-h0.y)*wt; w.position.z=(hz-h0.z)*wt; h.updateWorldMatrix(true,true); };   /* hips 骨頭放到人物座標的 (0, hy, hz) */
    const legRootDrop=()=>{ w.position.y=base; w.position.z=0; h.updateWorldMatrix(true,true); return Lc(R.hips).y-0.5*(Lc(R.leftUpperLeg).y+Lc(R.rightUpperLeg).y); };   /* hips 骨頭比大腿根高多少 */
    const cyc=T=>2*Math.PI*t/T;
    const arms=(fn,grip)=>{ const sh=[Lc(R.leftUpperArm),Lc(R.rightUpperArm)], tf=torso(); for(const [i,s] of [[0,1],[1,-1]]){ const q=fn(i,s,sh[i],tf,sh); if(q) limb(ARMS[i],q[0],q[1],false); if(grip) gymGrip(R,i,grip*wt); } };
    const SEAT_UP=0.075*k, V=(x,y,z)=>new THREE.Vector3(x,y,z);   /* 坐著：大腿根在座面上面多少（坐骨＋肉的厚度）*/
    const kind=g.pose; g.ph=null;
    if(kind==='gym_squat'){ const Q=P.squat, ph=0.5-0.5*Math.cos(cyc(Q.T)), d=Q.depth*k*ph; g.ph=ph;
      w.position.y=base; w.position.z=0; h.updateWorldMatrix(true,true);
      const an=[Lc(R.leftFoot),Lc(R.rightFoot)]; an.forEach((a,i)=>{ const s=i?-1:1; a.x=s*Math.max(s*a.x,Q.stance*k); });   /* 腳踩在站著的地方（站寬一點）*/
      w.position.y=base-d*wt; w.position.z=-Q.back*k*ph*wt; h.updateWorldMatrix(true,true);
      const ln=Q.lean*ph; lean([['spine',ln*0.6],['chest',ln*0.4],['neck',-ln*0.55]]);
      for(const [i,s] of [[0,1],[1,-1]]){ const L=LEGS[i]; limb(L,an[i],Lc(R[L[0]]).add(V(s*0.3*k,0,1.0)),true); }
      arms((i,s,S,tf,sh)=>{ const mid=sh[0].clone().add(sh[1]).multiplyScalar(0.5); const T=mid.addScaledVector(tf.lf,s*0.40*k).addScaledVector(tf.up,0.03*k).addScaledVector(tf.fw,-0.07*k);
        return [T,S.clone().addScaledVector(tf.lf,s*0.35).addScaledVector(tf.up,-0.45).addScaledVector(tf.fw,-0.2)]; },1); }
    else if(kind==='gym_curl'){ const Q=P.curl; w.position.y=base; w.position.z=0; h.updateWorldMatrix(true,true);
      const [la,lb]=len(ARMS[0]); g.ph=[0,1].map(i=>0.5-0.5*Math.cos(cyc(Q.T)+i*Math.PI));
      arms((i,s,S,tf)=>{ const al=Q.lo+(Q.hi-Q.lo)*g.ph[i];
        const E=S.clone().addScaledVector(tf.up,-la*0.985).addScaledVector(tf.fw,la*0.14).addScaledVector(tf.lf,s*0.02*k);
        const H=E.clone().addScaledVector(tf.up,-Math.cos(al)*lb*0.97).addScaledVector(tf.fw,Math.sin(al)*lb*0.97);
        return [H,E.clone().addScaledVector(tf.fw,-0.12)]; },1); }
    else if(kind==='gym_press'){ const Q=P.press, q=(0.5-0.5*Math.cos(cyc(Q.T)))*wt, dr=legRootDrop(); g.ph=q;   /* ×wt：換過來時從最下面（手在肩膀旁邊）開始，手走的路短 */
      place(Q.seat[1]+SEAT_UP+dr,Q.seat[2]); lean([['spine',-0.04],['neck',0.04]]);
      const ra=RA[u.key||'_']||0.085*k;
      for(const [i,s] of [[0,1],[1,-1]]){ const L=LEGS[i]; limb(L,V(s*Q.feet[0],ra,Q.feet[1]),Lc(R[L[0]]).add(V(s*0.2,0.3,1.0)),true); }
      const [la,lb]=len(ARMS[0]);
      arms((i,s,S,tf)=>{ const bot=S.clone().addScaledVector(tf.lf,s*la*0.92).addScaledVector(tf.up,lb*0.9-la*0.3).addScaledVector(tf.fw,0.03*k), top=S.clone().addScaledVector(tf.lf,s*0.09*k).addScaledVector(tf.up,(la+lb)*0.94).addScaledVector(tf.fw,0.02*k);
        return [bot.lerp(top,q),S.clone().addScaledVector(tf.lf,s*0.5).addScaledVector(tf.up,-0.3).addScaledVector(tf.fw,-0.25)]; },1); }   /* 手肘往外、稍微往後：pole 不在手走的平面上（換過來時手從下面舉到肩膀旁邊，會掃過正側面）*/
    else if(kind==='gym_bike'){ const Q=P.bike, th=cyc(Q.T), dr=legRootDrop(); g.ph=th;
      const [l1,l2]=len(LEGS[0]), leg=l1+l2, ank=[0,Q.axle[1]-Q.crank+0.1,Q.axle[2]-0.035], hz=Q.seat[2], aoff=a=>0.0875-0.0125*Math.cos(a);   /* 腳踝在踏板上面 7.5（最上面）～10 cm（最下面：腳尖往下踩）*/
      const reach=Math.sqrt(Math.max(0,Math.pow(leg*0.99,2)-Math.pow(hz-ank[2],2)))+ank[1];   /* 腿伸直時大腿根最高能到哪裡（踏板在最下面）：腿短的人＝座位調低一點 */
      const ly=Math.max(Q.seat[1]+0.03*k,Math.min(Q.seat[1]+SEAT_UP,reach-0.015))+0.006*Math.sin(2*th);   /* 腿短的人：寧可最下面腳尖差一點點踩到，也不要坐進座墊裡 */   /* 踩到最下面膝蓋還微彎（腿打直時膝蓋的方向不穩、會抖）*/
      place(ly+dr,hz); lean([['hips',Q.lean*0.4],['spine',Q.lean*0.35],['chest',Q.lean*0.25],['neck',-Q.lean*0.45],['head',-Q.lean*0.2]]);
      for(const [i,s] of [[0,1],[1,-1]]){ const L=LEGS[i], a=th+(i?Math.PI:0);
        limb(L,V(s*Q.pedalX,Q.axle[1]+Math.cos(a)*Q.crank+aoff(a),Q.axle[2]+Math.sin(a)*Q.crank-0.035),Lc(R[L[0]]).add(V(s*0.12,0.2,1.0)),true); }
      arms((i,s,S,tf)=>[V(s*Q.grip[0],Q.grip[1],Q.grip[2]),S.clone().addScaledVector(tf.lf,s*0.5).addScaledVector(tf.up,-0.4)],1); }
    else if(kind==='gym_row'){ const Q=P.row, s0=((t/Q.T)%1+1)%1, p=s0<0.38?sm01(s0,0,0.38):1-sm01(s0,0.38,1), dr=legRootDrop(); g.ph=p;   /* p：0＝前面（膝蓋彎、手往前伸）、1＝後面（腿伸直、手拉到胸口）；推 38%、回 62% */
      const [l1,l2]=len(LEGS[0]), lgL=(l1+l2)*0.965, dy=Q.seatY+SEAT_UP-Q.feet[1], zMin=Q.feet[2]-Math.sqrt(Math.max(0,lgL*lgL-dy*dy));   /* 腿短的人：座位往後滑到腿伸直為止（腳不離開踏板）*/
      const lg=sm01(p,0,0.6), bk=sm01(p,0.3,0.85), am=sm01(p,0.6,1.0), hz=Math.max(Q.zCatch+(Q.zFinish-Q.zCatch)*lg,Math.min(Q.zCatch,zMin));
      place(Q.seatY+SEAT_UP+dr,hz); const ln=0.4+(-0.28-0.4)*bk; lean([['hips',ln*0.5],['spine',ln*0.3],['chest',ln*0.2],['neck',-ln*0.3]]);
      for(const [i,s] of [[0,1],[1,-1]]){ const L=LEGS[i]; limb(L,V(s*Q.feet[0],Q.feet[1],Q.feet[2]),Lc(R[L[0]]).add(V(s*0.15,1.0,0.4)),false); }
      const [la,lb]=len(ARMS[0]);
      arms((i,s,S,tf)=>{ const rest=V(s*Q.handle[0],Q.handle[1],Q.handle[2]), st=S.clone().add(rest.sub(S).normalize().multiplyScalar((la+lb)*0.96));
        const pull=tf.hp.clone().addScaledVector(tf.up,0.30*k).addScaledVector(tf.fw,0.17*k).addScaledVector(tf.lf,s*0.15*k);
        return [st.lerp(pull,am),S.clone().addScaledVector(tf.lf,s*0.45).addScaledVector(tf.up,-0.25).addScaledVector(tf.fw,-0.35)]; },1); }
    else if(SWIM[kind]){ const Q=P.swim, breast=kind==='swim_breast';
      w.rotation.x=0; w.position.set(0,base,0); h.updateWorldMatrix(true,true);   /* 先直立擺好（上一格的趴姿先轉回來），最後整個人轉成趴著 */
      const UPW=new THREE.Vector3(0,1,0).applyQuaternion(GYQ).normalize(), roll=parts=>{ for(const [n,a] of parts) if(R[n]&&Math.abs(a)>1e-5) rotWorld(R[n],UPW,a*wt); };   /* 繞身體的長軸轉（趴著時＝左右滾）*/
      const [la,lb]=len(ARMS[0]), Ra=(la+lb)*0.96, [l1,l2]=len(LEGS[0]), leg=(l1+l2)*0.975, roots=[Lc(R.leftUpperLeg),Lc(R.rightUpperLeg)];
      const legPole=(i,s,out)=>roots[i].clone().add(V(s*out,-0.5,1.0));
      if(!breast){ const th=cyc(Q.T); g.ph=th;
        const rl=Q.roll*Math.sin(th); roll([['hips',rl*0.45],['spine',rl*0.3],['chest',rl*0.25]]);
        const br=Math.pow(Math.max(0,Math.sin(cyc(2*Q.T)-0.6)),3); roll([['neck',-0.55*br],['head',-0.45*br]]);   /* 每兩個循環往右換氣一次（右手從水面上回來的時候）*/
        arms((i,s,S,tf)=>{ const ph=th+(i?Math.PI:0), c=Math.cos(ph), sn=Math.sin(ph), pull=sn>0, r=Ra*(pull?1-0.24*sn:1-0.32*(-sn));   /* ph 0＝頭上、π/2＝身體下面（水裡）、π＝大腿旁邊、3π/2＝從水面上回來 */
          const T=S.clone().addScaledVector(tf.up,c*r).addScaledVector(tf.fw,sn*r*(pull?0.75:0.9)).addScaledVector(tf.lf,s*(pull?0.04:0.04+0.16*(-sn))*k);
          const bk=Math.max(0,-sn); return [T,S.clone().addScaledVector(tf.lf,s*(0.45+0.55*bk)).addScaledVector(tf.fw,-0.75*(1-0.65*bk)).addScaledVector(tf.up,0.15)]; },0);   /* 手肘一直朝上（趴著的時候朝水面）：划水是「高手肘」、回來也是；手繞到背後時參考點往外側移（手和參考點在同一側、一直線時手肘會翻過去：第一版每次在那裡跳 15 cm）*/
        for(const [i,s] of [[0,1],[1,-1]]){ const kb=Q.kick*k*Math.sin(cyc(Q.T/3)+(i?Math.PI:0)); limb(LEGS[i],roots[i].clone().add(V(s*0.035*k,-leg,kb)),legPole(i,s,0.1),false); } }
      else { const Tb=Q.TB, p=((t/Tb)%1+1)%1; g.ph=p;
        const a1=sm01(p,0,0.16), a2=sm01(p,0.16,0.36), a3=sm01(p,0.36,0.56), b=sm01(p,0.12,0.3)*(1-sm01(p,0.4,0.56));   /* 手：往外撥、收到胸口、推出去；b＝抬頭換氣 */
        lean([['spine',-0.3*b],['chest',-0.18*b],['neck',-0.28*b],['head',-0.18*b]]);
        arms((i,s,S,tf)=>{ const O=S.clone().addScaledVector(tf.up,Ra*0.95).addScaledVector(tf.lf,-s*0.03*k), Wd_=S.clone().addScaledVector(tf.up,Ra*0.55).addScaledVector(tf.lf,s*Ra*0.55).addScaledVector(tf.fw,0.18*k),
            Ch=S.clone().addScaledVector(tf.up,-0.16*k).addScaledVector(tf.fw,0.3*k).addScaledVector(tf.lf,-s*0.13*k);   /* 收到胸口下面（肩膀往下 16 cm）*/
          const T=a3>0?Ch.clone().lerp(O,a3):(a2>0?Wd_.clone().lerp(Ch,a2):O.clone().lerp(Wd_,a1));
          return [T,S.clone().addScaledVector(tf.lf,s*0.6).addScaledVector(tf.fw,0.25).addScaledVector(tf.up,-0.1)]; },0);   /* 手肘往外 */
        const r1=sm01(p,0.34,0.58), r2=sm01(p,0.58,0.76), r3=sm01(p,0.76,0.98);   /* 腳：收（腳跟往屁股、膝蓋往外；腳跟到水面為止——第一版往後 30 cm，腳跟出水 20 cm）→ 往外往後踢 → 併攏 */
        for(const [i,s] of [[0,1],[1,-1]]){ const St=roots[i].clone().add(V(s*0.03*k,-leg,0)), Rc=roots[i].clone().add(V(s*0.22*k,-0.42*k,-0.17*k)), Kk=roots[i].clone().add(V(s*0.36*k,-leg*0.88,-0.04*k));
          const F=r3>0?Kk.clone().lerp(St,r3):(r2>0?Rc.clone().lerp(Kk,r2):St.clone().lerp(Rc,r1)); limb(LEGS[i],F,legPole(i,s,0.7),false); } }
      lean([['leftFoot',1.15],['rightFoot',1.15]]);   /* 腳背打直（腳尖往後：趴著的時候順著身體）*/
      const hy=Lc(R.hips).y-base, tl=Q.tilt||0; w.rotation.x=(Math.PI/2-tl)*wt; w.position.set(0,base+(Q.water+Q.y-base-hy*Math.sin(tl))*wt,-hy*Math.cos(tl)*wt); h.updateWorldMatrix(true,true); }   /* 趴下：上方轉到前方、臉朝下（少轉 tilt：頭高腳低）；臀部在人物原點正上方、背在水面下一點（tilt＝0 時和原本一樣）*/
    else if(kind==='gym_stretch'){ const dr=legRootDrop(); place(0.012+SEAT_UP*1.1+dr,0); const [l1,l2]=len(LEGS[0]), leg=(l1+l2)*0.985, ay=0.012+0.05*k;
      const roots=[Lc(R.leftUpperLeg),Lc(R.rightUpperLeg)];
      if(!g.v){   /* 坐姿體前彎：兩腿伸直往前、上身慢慢往前彎再起來，手沿著腿往前伸 */
        const f=(0.5-0.5*Math.cos(cyc(P.stretch.T)))*wt, ln=0.25+0.75*f; g.ph=f; lean([['hips',ln*0.55],['spine',ln*0.3],['chest',ln*0.15],['neck',0.08]]);
        const an=roots.map((r,i)=>V((i?-1:1)*0.1*k,ay,r.z+Math.sqrt(Math.max(0,leg*leg-Math.pow(r.y-ay,2)))));
        for(const [i,s] of [[0,1],[1,-1]]) limb(LEGS[i],an[i],roots[i].clone().add(V(s*0.05,1.0,0.3)),false);
        arms((i,s,S,tf)=>[roots[i].clone().lerp(an[i],0.4+0.42*f).add(V(s*0.03*k,0.07*k,0)),S.clone().addScaledVector(tf.lf,s*0.4).addScaledVector(tf.up,-0.3)],0.6); }
      else {   /* 兩腿張開、左右輪流側彎：彎向哪一邊，那一邊的手沿著腿滑出去、另一隻手越過頭頂 */
        const sb=Math.sin(cyc(P.stretch.T2))*wt, ang=0.5*sb; g.ph=sb;   /* ×wt：換過來時從中間（兩手撐地）開始 */ lean([['hips',0.18],['spine',0.06]]); tilt([['spine',-ang*0.6],['chest',-ang*0.4]]);
        const an=roots.map((r,i)=>{ const s=i?-1:1, n=Math.hypot(0.62,0.78); return V(r.x+s*leg*0.62/n,ay,r.z+leg*0.78/n); });
        for(const [i,s] of [[0,1],[1,-1]]) limb(LEGS[i],an[i],roots[i].clone().add(V(s*0.1,1.0,0.2)),false);
        const [la,lb]=len(ARMS[0]);
        arms((i,s,S,tf)=>{ const toward=s*sb>0;   /* 這一隻手那一邊是彎下去的那一邊 */
          const m=sb*sb, rest=roots[i].clone().add(V(s*0.2*k,0.06*k,0.12*k));   /* 兩邊都沒彎（sb＝0）時兩隻手都撐在大腿旁邊的地上：兩種目標在這裡接起來，不跳 */
          const over=S.clone().addScaledVector(tf.up,(la+lb)*0.8).addScaledVector(tf.lf,-s*0.22*k), ctl=S.clone().addScaledVector(tf.lf,s*(la+lb)*0.9).addScaledVector(tf.up,0.1*k);   /* 舉過頭：從旁邊繞上去（二次曲線；直線會穿過肩膀，手肘翻面）*/
          const T=toward?rest.lerp(roots[i].clone().lerp(an[i],0.6).add(V(0,0.08*k,0)),m):rest.multiplyScalar((1-m)*(1-m)).addScaledVector(ctl,2*m*(1-m)).addScaledVector(over,m*m);
          const pA=S.clone().addScaledVector(tf.lf,s*0.4).addScaledVector(tf.up,-0.3), pB=S.clone().addScaledVector(tf.lf,s*0.15).addScaledVector(tf.fw,-0.5);   /* 舉過頭那隻：手肘往後（pole 在手走的那個面外面，不會和目標排成一直線）*/
          return [T,toward?pA:pA.lerp(pB,Math.min(1,m*3))]; },0.3); } } }
  C._gymIK=gymIK;
  /* ===== 健身中心手上的道具（GYM-FIT-PROPS-1103；GYM-FIT-ACTIVE-1103 合併後的缺點：彎舉、推舉、深蹲、划船都是空手）=====
     assets/models/char/second_ai/gym_hand_props.glb（ASSETS 'prop.gym_hand'，lazy；tools/blender/env_second/gym_hand_props.py）：gym_dumbbell、gym_barbell、gym_row_handle，
     原點＝握把中心、軸沿 +x。gymIK 擺好骨頭以後每一格照手的位置擺（掛在人物的根節點 h 底下，複製節點、網格材質共用）：
       gym_curl、gym_press＝每隻手一個啞鈴：握把中心＝手骨頭往中指根部 55%、軸線＝食指根部 → 小指根部（橫過掌心）；
       gym_squat＝槓鈴、gym_row＝拉把：中心＝兩隻手掌心的中間、軸線＝右手 → 左手；飛輪、拉筋手上沒東西。
     沒載好、載入失敗（最多 3 次）、遠距離版本（u.isFar，手指不算）＝不放；換成別的動作、C.release＝藏起來／拿掉。每一格不配置新物件。測試：node tests/gym_hand_props_unit.js */
  C.GYM_PROP_KEY='prop.gym_hand'; const GPROP={scene:null,loading:false,failed:0}; C._gymProps=GPROP;
  const GYM_PROP_OF={gym_curl:'dd',gym_press:'dd',gym_squat:'bar',gym_row:'row'}, GPN={dd:'gym_dumbbell',bar:'gym_barbell',row:'gym_row_handle'};
  const GPV=[0,1,2,3,4,5].map(()=>new THREE.Vector3()), GPQ=[new THREE.Quaternion(),new THREE.Quaternion()], GPX=new THREE.Vector3(1,0,0), GPS=new THREE.Vector3();
  function gymPropLoad(){ if(GPROP.scene||GPROP.loading||GPROP.failed>2||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[C.GYM_PROP_KEY]) return; GPROP.loading=true;
    ASSETS.loadOne(C.GYM_PROP_KEY).then(c=>{ GPROP.scene=c&&c.scene||null; GPROP.loading=false; if(!GPROP.scene) GPROP.failed++; },()=>{ GPROP.loading=false; GPROP.failed++; }); }
  function gymPropHide(u){ const P=u&&u.gymProp; if(!P) return; for(const k in P) for(const o of P[k]) o.visible=false; u.gymPropOn=null; }
  function gymPropGet(h,u,key){ const P=u.gymProp||(u.gymProp={}); if(P[key]) return P[key]; const src=GPROP.scene&&GPROP.scene.getObjectByName(GPN[key]); if(!src) return null;
    const n=key==='dd'?2:1, out=[]; for(let i=0;i<n;i++){ const o=src.clone(true); o.name='gymProp:'+key+i; o.traverse(x=>{ if(x.isMesh){ x.castShadow=false; x.receiveShadow=false; x.frustumCulled=false; } }); o.visible=false; h.add(o); out.push(o); } return (P[key]=out); }
  /* 掌心（世界座標）和橫過掌心的方向：手骨頭往中指根部 55%；食指根部 → 小指根部 */
  function gymPalm(R,i,pos,ax){ const hand=R[i?'rightHand':'leftHand'], fb=R[i?'rightF':'leftF']; hand.getWorldPosition(pos); if(fb&&fb[1]&&fb[1][0]) pos.lerp(fb[1][0].getWorldPosition(GPV[4]),0.55);
    if(ax){ if(fb&&fb[0][0]&&fb[3][0]) ax.copy(fb[3][0].getWorldPosition(GPV[5])).sub(fb[0][0].getWorldPosition(GPV[4])); else ax.set(i?-1:1,0,0).applyQuaternion(GPQ[1]); if(ax.lengthSq()<1e-8) ax.set(1,0,0); ax.normalize(); } return pos; }
  function gymPropSet(h,o,pos,ax){ h.updateWorldMatrix(true,false); h.getWorldQuaternion(GPQ[1]); o.position.copy(h.worldToLocal(GPV[3].copy(pos))); const sc=h.getWorldScale(GPS);   /* 不能用 GPV[2]：槓鈴、拉把的軸線就放在 GPV[2] */ o.scale.set(1/(sc.x||1),1/(sc.y||1),1/(sc.z||1));
    GPQ[0].setFromUnitVectors(GPX,ax); o.quaternion.copy(GPQ[1].invert().multiply(GPQ[0])); o.visible=true; }
  function gymProps(h,u){ const g=u.gym, key=g&&C.gymIK&&!u.isFar?GYM_PROP_OF[g.pose]:null; if(!key){ gymPropHide(u); return; }
    if(!GPROP.scene){ gymPropLoad(); return; } const R=u.rawGym; if(!R||!R.leftHand||!R.rightHand) return; const L=gymPropGet(h,u,key); if(!L) return;
    if(u.gymPropOn!==key){ gymPropHide(u); u.gymPropOn=key; } h.getWorldQuaternion(GPQ[1]);
    if(key==='dd'){ for(const i of [0,1]) gymPropSet(h,L[i],gymPalm(R,i,GPV[0],GPV[1]),GPV[1]); }
    else { const a=gymPalm(R,0,GPV[0],null), b=gymPalm(R,1,GPV[1],null), ax=GPV[2].copy(a).sub(b); if(ax.lengthSq()<1e-6) ax.set(1,0,0).applyQuaternion(GPQ[1]); ax.normalize(); gymPropSet(h,L[0],a.add(b).multiplyScalar(0.5),ax); } }
  C._gymPropsStep=gymProps;
  const GYM_FALL={gym_squat:'idle',gym_curl:'idle',gym_press:'sit',gym_bike:'sit',gym_row:'sit',gym_stretch:'sit',swim_free:'idle',swim_breast:'idle'};
  /* ===== 坐著的人會動、在做事（NPC-AMBIENT-ANIM-1104，USER_WANTS X222；使用者 11-04 13:5x「就算只是拿著書和拿著手機都太不自然了一個人坐在那裡什麼都不做」）=====
     舊版：pose sit／read 是靜態姿勢（每一格寫一樣的 SIT_VRM、READ_VRM），只剩頭 0.02～0.15 弧度的 sin 晃動和眨眼＝坐著的人凍住。
     動作片段：assets/models/char/ual_sit_clips.glb（Quaternius「Universal Animation Library」1／2，CC0 1.0；tools/anim/extract_ual.py 抽出骨架＋旋轉軌道；LICENSES.md）。
       來源的骨頭是 UE 人體模型式的名字（pelvis、spine_01～03、neck_01、Head、clavicle_l、upperarm_l…；UAL_BONE 對到 u.bones 的名字，VRM_BONE 再對到 VRM humanoid）。
       兩邊的靜止姿勢都是 T 字、面向 +z、左手在 +x（來源量過；和 VRM 1.0 的 normalized 骨架一樣）：每一根骨頭的「世界旋轉差」D＝動畫中的世界旋轉 × 靜止世界旋轉的反矩陣，
       VRM 的本地旋轉＝（VRM 自己階層裡的）父骨頭的 D 的反矩陣 × 自己的 D——和 mixamoToVRM 同一個做法；VRM 少一根骨頭（例：沒有 upperChest）照樣對。VRM 0.x 的 x、z 反號（同 mixamoToVRM）。
       試過照骨頭方向補償（retargetClip v2 的 A）：鎖骨的方向兩邊差 41°，補償以後肩膀聳起來；兩邊都是 T 字就不補償。只取旋轉、不取骨盆位移（坐姿的高度照 C.sitDropOf：每個模型自己的大腿厚度，SIT-HEIGHT-1104）。
       第一次有人坐下才下載（manifest lazy）；每一個片段第一次用到才換算（30 fps 取樣，所有模型共用一份）。還沒載好、載入失敗（30 秒後再試，最多 3 次）、C.sitAmb=false（網址 ?nositamb）＝照舊的靜態坐姿；
       片段晚一點才好的時候，已經坐著的人 0.8 秒內從靜態坐姿慢慢換過去（不跳格）。
     每一格（pose sit／read，VRM driver；GLB、程序化的備用人物照舊靜止）：
       ① 坐姿循環（C.SIT_AMB.base＝Sitting_Idle_Loop）：脊椎、胸口、脖子、頭（呼吸、身體微微前後）；每個人的速度 ±15%、起始相位不同（不會同步）；
          片段原本 1.7 秒一個循環＝一分鐘呼吸 36 次，太急：放慢成一半（baseRate）。每個人還有自己的坐姿（前後、左右、轉身各幾度，m.pst）。
          （另外兩個「Sitting_Idle」不是發呆：Idle02 是頭左右各轉 45° 看一圈、Idle03 是手撥頭髮——量過，拿來當下面的小動作，不當循環）
          腿、骨盆照舊 SIT_VRM（椅子的高度、sitFeet、裙子的輔助骨頭、階梯教室的座位都不受影響；片段的腿本來就不動）；
       ② 手臂：sit、手上沒有東西（不是腿上開著筆電、不是跪坐、手上沒有掛著配件）＝片段的手臂（手放在大腿上）；
          read（手上拿書、手機、平板）、腿上的筆電、跪坐、手上拿著小說／馬克杯…＝照舊（READ_VRM＋readIK、SIT_VRM、SEIZA_VRM），肩膀、手、手指也不吃片段（遮罩）；
          用筆電、寫筆記、看桌上的書的路人（SEATACT 標的 u.sitFocus＝桌上那一組的位置）：頭低下來（deskPitch）、眼睛看著那裡；
          桌子合得上參考的（NPC-ANIM-LOOPS-1104，下面 C.SIT_TASK）：換成打字、寫字、翻書、滑手機、吃飯的循環（手在桌上做事；合不上的、片段沒載好的＝手照舊放在大腿上）；
       ③ 小動作（每個人每 C.SIT_AMB.gap＝8～25 秒一個；一個做完才開始算下一個）：看看四周（片段 Sitting_Idle02_Loop 一次：頭往左右轉）、往一邊看一下（程式：頭轉過去、停一下）、
          抬頭（read：從書／手機上抬起頭看前面）、伸一下脖子（側彎＋往後仰）、撥頭髮（片段 Sitting_Idle03_Loop 一次；sit、手上沒東西）、換坐姿（m.pst 換一組，1 秒左右慢慢換過去）、
          拿書的翻頁（右手拇指從書的外緣掃過右頁、手腕往書溝轉，readIK 之後）；滑手機、平板：另外每 2～6 秒右手拇指滑一下（readIK 之後）。
          眼睛跟著頭看過去；讀書、滑手機的人眼睛看手上的東西。有人跟他說話、聊天（st.lookAt）的時候頭不做小動作（0.5 秒內收回來，頭照注視轉過去）；
          玩家自己只做換坐姿、翻頁、滑手機（不會自己東張西望）。
       ④ 同桌聊天（SEATACT 標的 u.sitChat＝{pair}：兩個人一組）：說話的人疊 Sitting_Talking_Loop（上半身、手比劃）、聽的人疊 Sitting_Nodding_Loop（點頭），每 3～7 秒換人；頭照舊轉向對方（st.lookAt）。
     沒有每一格配置新物件（暫存的四元數、陣列都是共用的）；遠距離版本（u.isFar）不算手指。C.ambRand＝亂數（測試可以換成固定種子）。測試：node tests/seat_ambient_unit.js */
  C.sitAmb=!(typeof location!=='undefined'&&/[?&]nositamb\b/.test(location.search||''));
  C.SIT_AMB_KEY='char.ual_sit_clips';
  C.SIT_AMB={ base:['Sitting_Idle_Loop'], baseRate:0.5, look:'Sitting_Idle02_Loop', hair:'Sitting_Idle03_Loop', talk:'Sitting_Talking_Loop', nod:'Sitting_Nodding_Loop',
    rate:0.15, gap:[8,25], first:[3,18], fade:0.9, ovFade:0.6, turn:[3,7], readPitch:0.3, deskPitch:0.32, scroll:[2,6], headYaw:0.18, blendIn:0.8,
    posture:{lean:[-0.07,0.05],side:[-0.05,0.05],twist:[-0.06,0.06],speed:2.5} };   /* headYaw：每個人平常頭往左右偏多少（±弧度，扣掉片段本身的 11°）；posture：每個人的坐姿（弧度：往前＋、往左右、轉身），speed＝換坐姿的快慢（1/秒）*/
  C.ambRand=Math.random;
  const UAL_BONE={pelvis:'Hips',spine_01:'Spine',spine_02:'Spine1',spine_03:'Spine2',neck_01:'Neck',Head:'Head'};
  for(const [s,S] of [['l','Left'],['r','Right']]){ Object.assign(UAL_BONE,{['clavicle_'+s]:S+'Shoulder',['upperarm_'+s]:S+'Arm',['lowerarm_'+s]:S+'ForeArm',['hand_'+s]:S+'Hand',['thigh_'+s]:S+'UpLeg',['calf_'+s]:S+'Leg',['foot_'+s]:S+'Foot',['ball_'+s]:S+'ToeBase'});
    for(const [f,F] of [['thumb','Thumb'],['index','Index'],['middle','Middle'],['ring','Ring'],['pinky','Pinky']]) for(let i=1;i<=3;i++) UAL_BONE[f+'_0'+i+'_'+s]=S+'Hand'+F+i; }
  C.UAL_BONE=UAL_BONE;
  const AMB_FPS=30, SITA={raw:null,src:null,clips:{},failed:false,loading:false};
  C._amb=SITA; C.sitAmbReady=()=>!!SITA.src;
  C._ambReset=function(){ SITA.raw=null; SITA.src=null; SITA.clips={}; SITA.failed=false; SITA.loading=false; SITA.broken=false; SITA.tries=0; SITA.failT=0; };   /* 測試用 */
  /* 來源的骨架（一次）：深度優先（父在前）、父節點、靜止的本地旋轉、靜止世界旋轉的反矩陣 */
  function ambSrc(raw){ const sc=raw.scene; sc.updateMatrixWorld(true); const list=[]; sc.traverse(o=>{ if(o!==sc) list.push(o); }); const ix=new Map(list.map((o,i)=>[o,i]));
    return {sc,list,ix,par:list.map(o=>ix.has(o.parent)?ix.get(o.parent):-1),rest:list.map(o=>o.quaternion.clone()),bsi:list.map(o=>o.getWorldQuaternion(new THREE.Quaternion()).invert()),base:sc.getWorldQuaternion(new THREE.Quaternion()),name:list.map(o=>UAL_BONE[o.name]||null)}; }
  /* 一個片段（第一次用到才算）：每一根對得到的骨頭每一格的世界旋轉差 D（Float32Array，x y z w；正負號連續）*/
  function ambClip(name){ return clipOf(SITA,name); }
  /* SR＝片段的來源（SITA：坐姿循環 ual_sit_clips；SITT：做事的循環 ual_sit_tasks，NPC-ANIM-LOOPS-1104），各自的骨架、各自的快取 */
  function clipOf(SR,name){ const got=SR.clips[name]; if(got!==undefined) return got; const S=SR.src, clip=S&&SR.raw.animations.find(a=>a.name===name); if(!clip){ if(S) SR.clips[name]=null; return null; }
    const ip=S.list.map(()=>null); for(const t of clip.tracks){ const mm=t.name.match(/^(.+)\.quaternion$/); if(!mm) continue; const o=S.sc.getObjectByName(mm[1]); if(o&&S.ix.has(o)) ip[S.ix.get(o)]=t.createInterpolant(); }
    const nF=Math.max(2,Math.round(clip.duration*AMB_FPS)+1), D={}, W=S.list.map(()=>new THREE.Quaternion()), q=new THREE.Quaternion(), d=new THREE.Quaternion();
    for(let i=0;i<S.list.length;i++) if(S.name[i]) D[S.name[i]]=new Float32Array(nF*4);
    for(let f=0;f<nF;f++){ const t=clip.duration*f/(nF-1);
      for(let i=0;i<S.list.length;i++){ if(ip[i]){ const r=ip[i].evaluate(t); q.set(r[0],r[1],r[2],r[3]).normalize(); } else q.copy(S.rest[i]);
        if(S.par[i]<0) W[i].copy(S.base).multiply(q); else W[i].copy(W[S.par[i]]).multiply(q);
        const n=S.name[i]; if(!n) continue; d.copy(W[i]).multiply(S.bsi[i]); const A=D[n], o=f*4; if(f&&A[o-4]*d.x+A[o-3]*d.y+A[o-2]*d.z+A[o-1]*d.w<0){ d.x=-d.x; d.y=-d.y; d.z=-d.z; d.w=-d.w; } A[o]=d.x; A[o+1]=d.y; A[o+2]=d.z; A[o+3]=d.w; } }
    /* 頭的平均左右（世界旋轉差的 yaw）：坐姿片段的頭一直往左轉 11°（來源量過）——每個人都往同一邊看。sitAmbient 扣掉它、換成每個人自己的方向（m.hy）*/
    let hy=0; const HD=D.Head; if(HD){ const e=new THREE.Euler(); for(let f=0;f<nF;f++){ q.fromArray(HD,f*4); e.setFromQuaternion(q,'YXZ'); hy+=e.y; } hy/=nF; }
    return (SR.clips[name]={name,dur:clip.duration,nF,D,hy}); }
  /* 片段可以用了嗎（還沒＝第一次叫的時候開始下載）。下載失敗＝照舊靜止，30 秒後再試（最多 3 次；手機網路斷一下不會整場都不動）；檔案壞了（解析失敗、沒有循環）＝不再試 */
  const AMB_RETRY_MS=30000, AMB_RETRIES=3;
  function ambReady(){ if(SITA.src) return true; if(!C.sitAmb||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[C.SIT_AMB_KEY]) return false;
    if(SITA.failed){ if(SITA.broken||(SITA.tries|0)>=AMB_RETRIES||Date.now()-(SITA.failT||0)<AMB_RETRY_MS) return false; SITA.failed=false; SITA.loading=false; if(ASSETS.status) delete ASSETS.status[C.SIT_AMB_KEY]; }
    const raw=ASSETS.getRaw&&ASSETS.getRaw(C.SIT_AMB_KEY);
    if(raw&&raw.scene&&raw.animations){ try{ SITA.raw=raw; SITA.src=ambSrc(raw); if(!ambClip(C.SIT_AMB.base[0])) throw new Error('沒有 '+C.SIT_AMB.base[0]); if(C.sitTaskPrefetch) C.sitTaskPrefetch(); return true; }   /* 坐著做事的片段也開始下載（NPC-ANIM-LOOPS-1104：到咖啡廳、圖書館以前多半就好了）*/catch(e){ SITA.raw=null; SITA.src=null; SITA.clips={}; SITA.failed=true; SITA.broken=true; console.warn('坐姿動作片段不能用（照舊靜止）',e); return false; } }
    if(!SITA.loading&&ASSETS.loadOne){ SITA.loading=true; SITA.tries=(SITA.tries|0)+1; const fail=e=>{ SITA.failed=true; SITA.failT=Date.now(); console.warn('坐姿動作片段載入失敗（照舊靜止，'+AMB_RETRY_MS/1000+' 秒後再試）',e&&e.message||e); };
      try{ Promise.resolve(ASSETS.loadOne(C.SIT_AMB_KEY)).catch(fail); }catch(e){ fail(e); } }
    return false; }
  /* ===== 坐在桌前做事的循環（NPC-ANIM-LOOPS-1104；LAWWW2-C 交件 2962616ac，說明 docs/art-rebuild/second_ai/wip/npc_anim_loops_1104/README.md）=====
     使用者 11-04 13:5x「就算只是拿著書和拿著手機都太不自然了一個人坐在那裡什麼都不做」：SEATACT（src/seatact3d.js）決定要用筆電、寫筆記、看桌上的書、滑手機、吃飯的路人，
     坐著播「正在做那件事」的循環（C.setSitTask；有名字的人不改）。
     片段 assets/models/char/second_ai/ual_sit_tasks.glb（ASSETS 'char.ual_sit_tasks'，lazy）：Sit_<Type|TypePad|Write|Phone|Page|Drink|Eat>_<F|M>_Loop，每個 5 秒、頭尾接得起來；
       格式和 ual_sit_clips 一樣（UAL 骨架名字、只有旋轉軌道），用同一套 ambSrc／clipOf 換算；骨架和 ual_sit_clips 一模一樣，但分開載（各自失敗、各自重試：lazyGet）。
       速度 1（坐姿循環的 baseRate 0.5 是給 1.7 秒那一個的；這裡已經是 5 秒、手指的節奏照 1 倍做）；每個人起始相位不同（不會同步）。
     動到的骨頭：脊椎、脖子、頭（片段裡已經前傾、低頭：不再加 deskPitch，也不加每個人自己的坐姿偏移——手要對準桌上的東西）、鎖骨到 30 根手指（grp 2，全部吃片段）；骨盆、腿照舊 SIT_VRM。
     女生／男生兩份（F＝vroid_npc_f1 那種骨架、M＝vroid_npc_m1）：照骨架分——右前臂／右上臂的長度比（量過：女生 0.977、男生 1.13；本作所有 VRoid 路人底模都是這兩種；LAWWW2 的「前臂 0.214／0.249」換成比例、不受身高影響）。
       不像這兩種的骨架、VRM 1.0（骨頭方向不一樣，配件掛不對）＝不用片段（照舊）。
     桌子：片段照參考的桌子擺手（總圖自習桌：桌面離座位的地面 0.75 m、桌緣在座位前面 0.30 m；女生身高 1.62、男生 1.74：ual_sit_tasks.json 的 ref、bodies）。
       C.sitTaskFit 在這個人自己的骨架上量手會落在哪裡（taskDev，和參考骨架的手 HANDS 比），再看這張桌子：
       手和桌面的高低合不上（往上下坐一點補完還差太多：下面 liftMax、TOLV；矮桌、太高的桌子、手比參考高或低很多的人；吧台的高腳椅 SEATACT 另外擋）＝不用；
       桌緣比該在的地方遠＝整個人往前坐（最多 12 cm、手太前面的往後 3 cm；跟著片段的權重慢慢挪過去：u.model；骨盆、腿的姿勢不變）；挪完還是太遠、或比 WIN 近＝不用
       （太遠：手按在桌子外面；太近：女生的前臂穿進桌子、指尖伸過筆電的鉸鏈——量過的範圍在 WIN，女生、男生各一組）。
     手上的配件 assets/models/char/second_ai/hand_props.glb（ASSETS 'prop.hand_props'，lazy）：hand_pen（寫字）、hand_phone（滑手機）、hand_cup（喝飲料）、hand_chopsticks（吃飯，LAWWW2-C 補件：片段照筷子尖擺手），已經擺在右手骨頭（J_Bip_R_Hand）的座標裡：
       複製節點掛到右手的真實骨頭、位置 0、不轉（網格、材質和快取共用）；一次只開一個；換掉、起身、拿掉就藏；C.release 拿下來（VRM 的第一個實例會被下一個人重用）。配件還沒好＝要拿東西的那幾種先不用（照舊）。
     眼睛：用筆電、寫筆記、看書＝看桌上那一組（SEATACT 的 sitFocus）；滑手機＝看手上的手機；吃飯＝看碗（LOOK）。
     換過去、換回來：片段的權重 0.5 秒（blend）慢慢換（手從大腿上慢慢放到桌上；往前、往後、往上下坐也跟著慢慢挪）。滑手機從拿著手機（pose read，readIK）換過來那一格手會跳（量過 18 cm）：只有片段晚到才會這樣——
       片段在第一個人坐下、坐姿循環好了的時候就開始下載（ambReady），SEATACT 量骨架時滑手機的人不排隊（urgent），同一個模型量過就不再量（TDEV）。
     沒載好、載入失敗（30 秒後再試，最多 3 次）、片段缺、網址 ?nositask＝照舊（坐姿循環＋手放大腿上／拿著手機）、不報錯。遠距離版本（u.isFar）照舊不算手指；每一格不配置新物件。
     測試：node tests/sit_task_wire_unit.js、node tests/sit_task_loops_unit.js */
  C.sitTask=!(typeof location!=='undefined'&&/[?&]nositask\b/.test(location.search||''));
  C.SIT_TASK_KEY='char.ual_sit_tasks'; C.HAND_PROP_KEY='prop.hand_props';
  C.SIT_TASK={ CLIP:{type:'Type',typepad:'TypePad',write:'Write',phone:'Phone',page:'Page',drink:'Drink',eat:'Eat'},
    PROP:{write:'hand_pen',phone:'hand_phone',drink:'hand_cup',eat:'hand_chopsticks'},
    REF:{desk:0.75,edge:0.30}, H:{F:1.62,M:1.74,F2:1.65,M2:1.74,F_E20:1.62,M_E20:1.74}, shiftMax:0.12, blend:0.5,
    /* 參考的桌子有兩種（CAFE-EDGE-1105，LAWWW2-C 11-05；LAWWW-C 11-04 21:42Z 的 3）：總圖自習桌（桌緣離座位 0.30）、近的桌子（0.20：afar、Daybreak、木曜日、林家、社科圖的桌緣 0.14～0.25，
       原本往後坐最多 3 cm 也合不上）。近的那一組片段名字多 _E20、HANDS／WIN 的鍵是 F_E20、M_E20（只做 F、M：坐高改了以後 F2、M2 只多補幾個人）；先試桌緣比較接近的那一組 */
    REFS:[{edge:0.30,sfx:''},{edge:0.20,sfx:'_E20'}],
    /* F2、M2（LAWWW2-C 補件 2）：同一種骨架（前臂÷上臂）裡，手臂比較短的女生（Victoria_Rubin 改的 nf1、3、7、10、13、16、19：手臂÷身高 0.251，F 0.262）、
       手臂比較長、肩膀比較低的男生（HairSample_Male 改的 nm1、3…19、m2：0.266，M 0.244）的片段（參考骨架 bl_npc_nf10 1.65 m、bl_npc_nm11 1.74 m）。
       先試 F（M），合不上再試 F2（M2）：比較高的 HairSample_Female／Darkness_Shibu（nf15、nf17）用 F2 反而合得上，所以不用手臂÷身高分，兩種都量（taskDev 每個片段量一次、有快取；
       一格量骨架的人數有上限 probesPer，第二種身材常常要等下一次 SEATACT）。WIN 的 F2 和 F 一樣（量到的都比 F 寬）；M2 照量到的收緊（手臂長：前臂越過桌緣的地方比較低）*/
    ALT:{F:['F','F2'],M:['M','M2']},
    /* 挪完以後桌緣（參考身材的座標）可以在哪裡，女生／男生各一組（在遊戲裡量過，tests/sit_task_wire_unit.js 會再量一次）：
       _E20（桌緣 0.20 那一組，CAFE-EDGE-1105，坐高改了以後在遊戲裡量的）：近＝前臂離桌面 1.5 cm、肚子（桌面高度最前面 0.125）＋2 cm、打字指尖不過鉸鏈（0.16）三個裡面最大的（打字、吃飯 0.16，其他 0.145）；
       遠＝放在桌上的手腕往前 3 cm 還在桌上（打字＋觸控板照參考那一組收 3.5 cm、喝飲料照參考的 0.335）；
       近：前臂伸到桌面上的那一段離桌面不到 1.5 cm 就算穿進桌子——女生（SIT-HEIGHT-1104 以前肩膀只比桌面高 9 cm）在參考的桌子就已經貼著桌緣，桌子再近就穿進去：女生最近 0.29（坐下高度改了以後肩膀高 21 cm，這一格還沒重量，可以再放寬）；
           男生照量到的（打字另外要指尖不過筆電的鉸鏈：筆電中心離桌緣 0.11、深 0.21）；
       遠：放在桌上的手（打字兩手、寫字兩手、滑手機、翻書、吃飯、喝飲料的左手）手腕往前 3 cm（手掌根）還在桌上；喝飲料的杯子放得在桌上；打字＋觸控板：右手摸得到觸控板 */
    WIN:{type:{F:[0.29,0.365],M:[0.26,0.365],F2:[0.29,0.365],M2:[0.27,0.365],F_E20:[0.16,0.271],M_E20:[0.16,0.271]},typepad:{F:[0.29,0.33],M:[0.26,0.33],F2:[0.29,0.33],M2:[0.27,0.33],F_E20:[0.16,0.236],M_E20:[0.16,0.236]},write:{F:[0.29,0.395],M:[0.29,0.395],F2:[0.29,0.395],M2:[0.29,0.395],F_E20:[0.145,0.304],M_E20:[0.145,0.309]},phone:{F:[0.29,0.37],M:[0.27,0.37],F2:[0.29,0.37],M2:[0.28,0.37],F_E20:[0.145,0.276],M_E20:[0.145,0.275]},
      page:{F:[0.29,0.375],M:[0.24,0.375],F2:[0.29,0.375],M2:[0.26,0.375],F_E20:[0.145,0.28],M_E20:[0.145,0.279]},drink:{F:[0.28,0.335],M:[0.24,0.335],F2:[0.28,0.335],M2:[0.245,0.335],F_E20:[0.145,0.335],M_E20:[0.145,0.335]},eat:{F:[0.29,0.39],M:[0.29,0.39],F2:[0.29,0.39],M2:[0.29,0.39],F_E20:[0.16,0.294],M_E20:[0.16,0.293]}},
    LOOK:{eat:[0,0.06,0.15]},   /* 沒有 sitFocus 的眼睛看哪裡（人物座標：x 左手邊、y 桌面以上、z 桌緣往裡面）*/
    RATIO:{F:[0.93,1.03],M:[1.08,1.19]},
    /* 參考骨架（vroid_npc_f1 1.62 m、vroid_npc_m1 1.74 m：產生片段用的）坐在參考桌子前、片段 0 秒的兩手手腕（人物座標 x 左、y 上、z 前；遊戲裡量的，和 ual_sit_tasks.json 的 expect 一樣）。
       每個人的骨架不一樣（LAWWW2 的路人底模分好幾種比例：手臂÷身高 0.251／0.264（女）、0.246／0.266（男），肩膀高低也不同）：同一個片段，手會差到 6 cm。
       所以每個人第一次要用某一個片段的時候，在他自己的骨架上照片段 0 秒擺一次（taskDev，量完放回去），手腕和這裡差多少＝他的偏差：
       上下差（扣掉桌子本身的高低）：整個人往上／往下坐一點補（最多 liftMax 1.5 cm，像坐墊的厚薄），補完手和桌面還差超過 TOLV（打字 3 cm：手腕本來就離桌面 5 cm；
       寫字 1 cm：筆尖要碰到紙；其他 1.5 cm：手放在桌上、書上、杯子在桌上）＝不用（LAWWW2 README 的「桌高差 3 cm」：手和桌面合起來差 3 cm 以內）；
       前後差用往前／往後坐補（shiftBack～shiftMax），補完桌緣還要在 WIN 裡；左右差超過 tolX＝不用。
       合不上的人（手臂比較長、肩膀比較低或高的那幾組底模）照舊——要 LAWWW2 照那幾種骨架再出一份片段（量到的結果：tests/sit_task_wire_unit.js、交件報告）*/
    HANDS:{F:{type:{l:[0.0957,0.7996,0.3465],r:[-0.0901,0.802,0.3512]},typepad:{l:[0.0957,0.7996,0.3465],r:[-0.0901,0.802,0.3512]},write:{l:[0.1385,0.7819,0.3864],r:[-0.0605,0.7963,0.3816]},phone:{l:[0.1367,0.7806,0.3458],r:[-0.0792,0.8205,0.3028]},page:{l:[0.1179,0.8045,0.35],r:[-0.1179,0.8045,0.35]},drink:{l:[0.1467,0.7806,0.3108],r:[-0.2338,0.812,0.3668]},eat:{l:[0.0368,0.7796,0.3654],r:[-0.127,0.8435,0.3207]}},
      M:{type:{l:[0.096,0.8002,0.3457],r:[-0.0903,0.8025,0.3505]},typepad:{l:[0.096,0.8002,0.3457],r:[-0.0903,0.8025,0.3505]},write:{l:[0.1388,0.7824,0.3857],r:[-0.058,0.7934,0.387]},phone:{l:[0.1371,0.7812,0.3451],r:[-0.0768,0.8232,0.3036]},page:{l:[0.1181,0.8051,0.3493],r:[-0.1181,0.8051,0.3493]},drink:{l:[0.1471,0.7812,0.3101],r:[-0.2288,0.81,0.3685]},eat:{l:[0.0393,0.7778,0.3648],r:[-0.1109,0.8957,0.351]}},
      F2:{type:{l:[0.0955,0.7991,0.3473],r:[-0.0898,0.8015,0.352]},typepad:{l:[0.0955,0.7991,0.3473],r:[-0.0898,0.8015,0.352]},write:{l:[0.1381,0.7813,0.3871],r:[-0.0597,0.7954,0.3831]},phone:{l:[0.1364,0.7801,0.3466],r:[-0.0792,0.8198,0.3053]},page:{l:[0.1176,0.8039,0.3508],r:[-0.1176,0.8039,0.3508]},drink:{l:[0.1464,0.7801,0.3116],r:[-0.2323,0.812,0.3673]},eat:{l:[0.0364,0.7802,0.3662],r:[-0.1243,0.8428,0.3234]}},
      M2:{type:{l:[0.0969,0.8024,0.3425],r:[-0.0912,0.8048,0.3473]},typepad:{l:[0.0969,0.8024,0.3425],r:[-0.0912,0.8048,0.3473]},write:{l:[0.1405,0.7846,0.3827],r:[-0.0613,0.7965,0.3812]},phone:{l:[0.1385,0.7835,0.3421],r:[-0.0774,0.8234,0.2979]},page:{l:[0.1193,0.8075,0.3462],r:[-0.1193,0.8075,0.3462]},drink:{l:[0.1485,0.7835,0.3071],r:[-0.2343,0.8099,0.3666]},eat:{l:[0.0413,0.7798,0.3605],r:[-0.1369,0.903,0.3652]}},
      'F_E20':{type:{l:[0.0957,0.7996,0.2465],r:[-0.0901,0.802,0.2512]},typepad:{l:[0.0957,0.7996,0.2465],r:[-0.0901,0.802,0.2512]},write:{l:[0.1385,0.7819,0.2864],r:[-0.0605,0.7963,0.2816]},phone:{l:[0.1367,0.7806,0.2458],r:[-0.0763,0.8316,0.1925]},page:{l:[0.1179,0.8045,0.25],r:[-0.1179,0.8045,0.25]},drink:{l:[0.1467,0.7806,0.3108],r:[-0.2338,0.812,0.2668]},eat:{l:[0.0385,0.786,0.2641],r:[-0.127,0.8435,0.2207]}},
      'M_E20':{type:{l:[0.096,0.8002,0.2457],r:[-0.0903,0.8025,0.2505]},typepad:{l:[0.096,0.8002,0.2457],r:[-0.0903,0.8025,0.2505]},write:{l:[0.1388,0.7824,0.2857],r:[-0.058,0.7934,0.287]},phone:{l:[0.1371,0.7812,0.2451],r:[-0.0741,0.8339,0.1944]},page:{l:[0.1181,0.8051,0.2493],r:[-0.1181,0.8051,0.2493]},drink:{l:[0.1471,0.7812,0.3101],r:[-0.2288,0.81,0.2685]},eat:{l:[0.0413,0.7875,0.263],r:[-0.1109,0.8957,0.251]}}},
    tolX:0.04, liftMax:0.015, tolV:0.015, TOLV:{type:0.03,typepad:0.03,write:0.01}, shiftBack:0.03, probesPer:3 };
  const SITT={raw:null,src:null,clips:{},failed:false,loading:false}, HPROP={scene:null,failed:false,loading:false};
  C._task=SITT; C._handProps=HPROP;
  C._taskReset=function(){ Object.assign(SITT,{raw:null,src:null,clips:{},failed:false,loading:false,broken:false,tries:0,failT:0,done:false}); Object.assign(HPROP,{scene:null,failed:false,loading:false,broken:false,tries:0,failT:0,done:false}); };   /* 測試用 */
  /* lazy 的檔（還沒＝第一次叫的時候開始下載）：下載失敗 30 秒後再試（最多 3 次）、內容不對＝不再試（同 ambReady）；ok(raw)＝檢查、記下來 */
  function lazyGet(S,key,ok){ if(S.done) return true; if(typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[key]) return false;
    if(S.failed){ if(S.broken||(S.tries|0)>=AMB_RETRIES||Date.now()-(S.failT||0)<AMB_RETRY_MS) return false; S.failed=false; S.loading=false; if(ASSETS.status) delete ASSETS.status[key]; }
    const raw=ASSETS.getRaw&&ASSETS.getRaw(key);
    if(raw&&raw.scene){ try{ if(!ok(raw)) throw new Error('內容不對'); S.done=true; return true; }catch(e){ S.failed=true; S.broken=true; console.warn(key+' 不能用（坐著做事照舊）',e&&e.message||e); return false; } }
    if(!S.loading&&ASSETS.loadOne){ S.loading=true; S.tries=(S.tries|0)+1; const fail=e=>{ S.failed=true; S.failT=Date.now(); console.warn(key+' 載入失敗（坐著做事照舊，'+AMB_RETRY_MS/1000+' 秒後再試）',e&&e.message||e); };
      try{ Promise.resolve(ASSETS.loadOne(key)).catch(fail); }catch(e){ fail(e); } }
    return false; }
  const taskOk=raw=>{ if(!raw.animations||!raw.animations.some(a=>/^Sit_\w+_[FM]_Loop$/.test(a.name))) return false; SITT.raw=raw; SITT.src=ambSrc(raw); SITT.clips={}; return true; };
  const propOk=raw=>{ if(!['hand_cup','hand_phone','hand_pen'].some(n=>raw.scene.getObjectByName(n))) return false; HPROP.scene=raw.scene; return true; };
  const taskReady=()=>!!C.sitTask&&lazyGet(SITT,C.SIT_TASK_KEY,taskOk);
  const propReady=nm=>lazyGet(HPROP,C.HAND_PROP_KEY,propOk)&&!!HPROP.scene.getObjectByName(nm);
  const taskClip=name=>SITT.src?clipOf(SITT,name):null;
  C.sitTaskReady=()=>!!SITT.src;
  C.sitTaskPrefetch=function(){ if(!C.sitTask||!C.sitAmb) return; taskReady(); lazyGet(HPROP,C.HAND_PROP_KEY,propOk); };   /* SEATACT 進到有座位的地方就先下載（第一個人坐下以前）*/
  /* 女生／男生的骨架：右前臂÷右上臂（真實骨頭的距離，和姿勢、縮放無關）；一個人算一次 */
  const TBV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  function taskBody(h,u){ if(u.taskBody!==undefined) return u.taskBody; let b=null;
    try{ const H=u.vrm&&u.vrm.humanoid, ua=H&&H.getRawBoneNode('rightUpperArm'), la=H&&H.getRawBoneNode('rightLowerArm'), hd=H&&H.getRawBoneNode('rightHand');
      if(ua&&la&&hd){ h.updateWorldMatrix(true,true); const a=la.getWorldPosition(TBV[0]).distanceTo(ua.getWorldPosition(TBV[1])), f=hd.getWorldPosition(TBV[2]).distanceTo(TBV[0]), r=a>1e-4?f/a:0, RT=C.SIT_TASK.RATIO;
        b=r>=RT.F[0]&&r<=RT.F[1]?'F':(r>=RT.M[0]&&r<=RT.M[1]?'M':null); u.taskRatio=+r.toFixed(4); } }catch(e){ b=null; }
    return (u.taskBody=b); }
  /* 這個人的骨架照片段 0 秒擺一次、量兩手手腕（人物座標），量完骨頭全部放回去（正規化的和真實的：不會留下一格錯的畫面）；一個人、一個片段量一次（u.taskDev）。
     一次最多量 probesPer 個（20 ms 內）：一進區域二十幾個人不會同一格全部量（其他人下一次 SEATACT 再來）*/
  const PRB={t0:-1e9,n:0}, PRV=new THREE.Vector3(), PRQ=[], TDEV=new Map();   /* TDEV：模型＋縮放＋片段 → 量到的手（同一個模型、同一個縮放＝同一副骨架，所有用它的人共用）*/
  const prbNow=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  C._taskDevCache=TDEV;   /* 測試用 */
  function taskDev(h,u,c,urgent){ const D=u.taskDev||(u.taskDev={}); if(D[c.name]!==undefined) return D[c.name];   /* 量過了（量不出來的記 false，不再量）*/
    const key=(u.key||'?')+'|'+(+u.k||1).toFixed(4)+'|'+c.name; if(TDEV.has(key)) return (D[c.name]=TDEV.get(key));
    if(u.anim&&!u.anim.static&&u.anim.cur) return null;   /* 正在播站著、走路的片段（骨盆被動畫轉過）：量出來不準，等坐下（靜態坐姿，或還沒動過）再量——結果整個模型共用，不能量錯 */
    const now=prbNow(); if(now-PRB.t0>20){ PRB.t0=now; PRB.n=0; } if(!urgent&&PRB.n>=C.SIT_TASK.probesPer) return null; PRB.n++;
    const R=ambRig(u), H=u.vrm&&u.vrm.humanoid; if(!R.order.length||!H) return null; const n=R.order.length;
    const raw=[]; for(const b in VRM_BONE){ const o=H.getRawBoneNode(VRM_BONE[b]); if(o) raw.push(o); }
    let k=0; const keep=q=>{ const s=PRQ[k]||(PRQ[k]=new THREE.Quaternion()); k++; s.copy(q); };
    for(let i=0;i<n;i++) keep(R.nodes[i].quaternion); for(const o of raw) keep(o.quaternion); const mz=u.model.position.z, my=u.model.position.y;
    let out=null;
    try{ for(let i=0;i<n;i++){ if(R.grp[i]===0) continue; ambSample(c,0,true,R.order[i],AW,i*4); }
      for(let i=0;i<n;i++){ if(R.grp[i]===0) continue; const p=R.par[i], q=AQ[0].fromArray(AW,i*4); if(p>=0) q.premultiply(AQ[1].fromArray(AW,p*4).invert()); if(u.v0){ q.x=-q.x; q.z=-q.z; } R.nodes[i].quaternion.copy(q); }
      u.model.position.z=0; u.model.position.y=(u.model.userData.baseY||0)-sitDrop(u); H.update(); h.updateMatrixWorld(true);
      const lw=h.worldToLocal(H.getRawBoneNode('leftHand').getWorldPosition(PRV)).clone(), rw=h.worldToLocal(H.getRawBoneNode('rightHand').getWorldPosition(PRV)).clone(); out={l:lw,r:rw}; }
    catch(e){ out=null; }
    k=0; for(let i=0;i<n;i++) R.nodes[i].quaternion.copy(PRQ[k++]); for(const o of raw) o.quaternion.copy(PRQ[k++]); u.model.position.z=mz; u.model.position.y=my; h.updateMatrixWorld(true);
    if(out) TDEV.set(key,out); return (D[c.name]=out||false); }
  C._taskDev=(h,clip)=>{ const u=h&&h.userData, c=taskClip(clip); return u&&c?taskDev(h,u,c):null; };   /* 測試用 */
  /* 這個人、這張桌子能不能做 kind（type／typepad／write／phone／page／drink／eat）：desk＝{h：桌面離這個人的根（座位的地面＋lift）多高, edge：座位到桌緣, depth}；
     回傳 null（照舊）或 {kind, clip, body, prop, shift（往前坐幾公尺；負的＝往後）, lift（往上坐幾公尺；負的＝往下）, deskH, edge}。片段、配件還沒下載的會開始下載；第一次會在他的骨架上量一次（taskDev；urgent＝不排隊）*/
  C.sitTaskFit=function(h,kind,desk,urgent){ const u=h&&h.userData, K=C.SIT_TASK; if(!C.sitTask||!C.sitAmb||!u||u.driver!=='vrm'||!u.v0||!K.CLIP[kind]||!desk) return null;
    if(!taskReady()) return null;
    const fam=taskBody(h,u); if(!fam){ u.taskWhy='skeleton'; return null; }
    const prop=K.PROP[kind]||null; if(prop&&!propReady(prop)) return null;   /* 寫字、滑手機、喝飲料、吃飯要拿東西：配件還沒好＝照舊 */
    const refs=(K.REFS||[{edge:K.REF.edge,sfx:''}]).slice().sort((a,b)=>Math.abs(+desk.edge-a.edge)-Math.abs(+desk.edge-b.edge));   /* 桌緣比較接近的那一組先試（CAFE-EDGE-1105）*/
    let why='clip';   /* 合不上的原因（最後一個試的那一組；SEATACT 的 state 看 u.taskWhy：low／high＝手比桌面低／高太多、near／far＝桌緣太近／太遠、wide＝肩膀寬、clip＝片段檔沒有這一種、probe＝量不出來）*/
    for(const rf of refs) for(const b0 of (K.ALT&&K.ALT[fam])||[fam]){ const body=b0+rf.sfx;   /* 同一種骨架的幾種身材：第一個合得上的（F2、M2，LAWWW2-C 補件 2）*/
      const clip='Sit_'+K.CLIP[kind]+'_'+body+'_Loop', c=taskClip(clip), R0=K.HANDS[body]&&K.HANDS[body][kind]; if(!c||!R0) continue;   /* 片段檔沒有這一種（舊的 GLB）＝試下一種 */
      const dv=taskDev(h,u,c,urgent); if(dv===null){ u.taskWhy='queue'; return null; } if(!dv){ why='probe'; continue; }   /* null＝還沒量（這一格量不到、排隊）：下次 SEATACT 再來；false＝量不出來 */
      const dl=[dv.l.x-R0.l[0],dv.l.y-R0.l[1],dv.l.z-R0.l[2]], dr=[dv.r.x-R0.r[0],dv.r.y-R0.r[1],dv.r.z-R0.r[2]];
      if(Math.max(Math.abs(dl[0]),Math.abs(dr[0]))>K.tolX){ why='wide'; continue; }   /* 手往旁邊差太多（肩膀寬很多）*/
      const dy=(dl[1]+dr[1])/2, dz=(dl[2]+dr[2])/2;
      const dyE=dy-(+desk.h-K.REF.desk), lift=Math.min(K.liftMax,Math.max(-K.liftMax,-dyE)); if(!(Math.abs(dyE+lift)<=(K.TOLV[kind]||K.tolV)+1e-6)){ why=dyE+lift<0?'low':'high'; continue; }   /* 手的高低和這張桌子合不上（吧台、矮桌、手比參考高或低很多的人）；lift＝往上（＋）／往下坐多少 */
      const e0=+desk.edge-dz, sh=Math.min(K.shiftMax,Math.max(-K.shiftBack,e0-rf.edge)), e2=e0-sh, w=K.WIN[kind]&&K.WIN[kind][body]; if(!w||!(e2>=w[0]-1e-6&&e2<=w[1]+1e-6)){ why=w&&e2<w[0]?'near':'far'; continue; }
      u.taskWhy=null; return {kind,clip,body,prop,shift:+sh.toFixed(4),lift:+lift.toFixed(4),deskH:+desk.h,edge:+desk.edge,ref:rf.edge}; }
    u.taskWhy=why; return null; };
  /* 套上／拿掉（fit＝C.sitTaskFit 的結果；null＝拿掉）：片段在 sitAmbient 裡慢慢換過去；配件馬上換（SEATACT 同一格把桌上那件藏起來／放回去）*/
  C.setSitTask=function(h,fit){ const u=h&&h.userData; if(!u) return false; if(!fit){ u.sitTask=null; propVis(u,null); return false; }
    const T=u.sitTask; if(!T||T.clip!==fit.clip||T.prop!==fit.prop||T.kind!==fit.kind||Math.abs((T.shift||0)-(fit.shift||0))>1e-4||Math.abs((T.lift||0)-(fit.lift||0))>1e-4||T.deskH!==fit.deskH) u.sitTask=Object.assign({},fit); return true; };
  C.sitTaskOf=function(h){ if(h&&!h.userData&&h.obj&&h.obj.userData) h=h.obj;   /* 傳 NPC（E3.npcs 的那一筆）也可以：SEATACT-LIB3F-R2，探針 cc_lib3f_sets_probe 傳 n、不是 n.obj，三樓每個人都量成沒有片段 */
    const u=h&&h.userData, m=u&&u.amb; return u&&u.sitTask?{kind:u.sitTask.kind,clip:u.sitTask.clip,body:u.sitTask.body,prop:u.taskPropOn||null,playing:m&&m.tc||null,w:m&&m.tc?m.tw||0:0,rate:1,shift:u.sitTask.shift,lift:u.sitTask.lift||0,ref:u.sitTask.ref}:null; };   /* 測試用（ref＝用了哪一張參考桌子的片段：0.30／0.20，CAFE-EDGE-1105）*/
  /* 右手的配件：只開 nm（null＝全部藏）；第一次用到才從 hand_props 複製一份掛上去 */
  function propVis(u,nm){ if((u.taskPropOn||null)===nm) return; u.taskPropOn=nm||null;
    if(u.taskProps) for(const k in u.taskProps) u.taskProps[k].visible=k===nm;
    if(nm&&!(u.taskProps&&u.taskProps[nm])){ const src=HPROP.scene&&HPROP.scene.getObjectByName(nm), bone=u.vrm&&u.vrm.humanoid&&u.vrm.humanoid.getRawBoneNode('rightHand');
      if(!src||!bone){ u.taskPropOn=null; return; }
      const o=src.clone(true); o.name='taskProp:'+nm; o.position.set(0,0,0); o.quaternion.set(0,0,0,1); o.scale.set(1,1,1); o.visible=true;
      o.traverse(x=>{ if(x.isMesh){ x.castShadow=false; x.receiveShadow=false; x.frustumCulled=false; } }); bone.add(o); (u.taskProps||(u.taskProps={}))[nm]=o; } }
  /* 每一格（sitAmbient 裡）：要播哪一個片段、權重、時間；回傳片段（沒有＝null）。free＝sit、手上沒東西（不是跪坐、腿上沒有筆電）*/
  function taskStep(u,m,dt,pose,free){ const T=u.sitTask, K=C.SIT_TASK, inc=dt>0?dt/K.blend:0;
    const want=T&&free&&pose==='sit'&&C.sitTask&&taskClip(T.clip)?T.clip:null;
    if(m.tc&&m.tc!==want){ m.tw=Math.max(0,(m.tw||0)-inc); if(m.tw<=0) m.tc=null; }
    if(!m.tc&&want){ m.tc=want; m.tw=0; m.tt=ambRnd(0,5); }
    if(m.tc&&m.tc===want){ m.tw=Math.min(1,(m.tw||0)+inc); m.tShift=T.shift||0; m.tLift=T.lift||0; }
    if(m.tc) m.tt=(m.tt||0)+dt;
    propVis(u,want&&m.tc===want?(T.prop||null):null);
    return m.tc?taskClip(m.tc):null; }
  /* 這個人的骨頭（一次）：照 VRM normalized 階層排（父在前），par＝階層裡最近的、有對到的父骨頭（-1＝骨盆：骨盆照舊 SIT_VRM＝不轉）；grp 0＝腿（不吃片段）、1＝脊椎到頭、2＝肩膀到手指（看姿勢）*/
  function ambRig(u){ if(u.ambRig) return u.ambRig; const B=u.bones, nm=new Map(); for(const n in B) nm.set(B[n],n); const order=[];
    const walk=o=>{ const n=nm.get(o); if(n&&n!=='Hips') order.push(n); for(const c of o.children) walk(c); }; if(B.Hips) walk(B.Hips);
    const par=order.map(n=>{ let p=B[n].parent; while(p&&!nm.has(p)) p=p.parent; const pn=p?nm.get(p):null; return !pn||pn==='Hips'?-1:order.indexOf(pn); });
    const grp=order.map(n=>/(UpLeg|Leg|Foot|ToeBase)$/.test(n)?0:(/(Shoulder|Arm)$|Hand/.test(n)?2:1));
    return (u.ambRig={order,par,grp,finger:order.map(n=>/Hand[A-Z]/.test(n)),tab:order.map(n=>/^(Left|Right)(Fore)?Arm$/.test(n)),nodes:order.map(n=>B[n])}); }   /* tab：上臂、前臂（靜態坐姿的表會寫）*/
  const ambRnd=(a,b)=>a+(b-a)*C.ambRand();
  const ambPosture=()=>{ const P=C.SIT_AMB.posture; return [ambRnd(P.lean[0],P.lean[1]),ambRnd(P.side[0],P.side[1]),ambRnd(P.twist[0],P.twist[1])]; };
  function ambInit(){ const K=C.SIT_AMB, ps=ambPosture(); return {base:K.base[Math.floor(C.ambRand()*K.base.length)%K.base.length],t:ambRnd(0,10),rate:K.baseRate*ambRnd(1-K.rate,1+K.rate),orate:ambRnd(1-K.rate,1+K.rate),prev:null,pt:0,prate:1,fw:1,
    ov:null,ovWant:null,ovLoop:true,ot:0,ow:0,fx:null,next:ambRnd(K.first[0],K.first[1]),n:0,kinds:{},sc:0,scT:ambRnd(K.scroll[0],K.scroll[1]),head:[0,0,0],hy:ambRnd(-K.headYaw,K.headYaw),pst:ps.slice(),pstTo:ps}; }
  const AW=new Float32Array(64*4), AS=new Float32Array(4), AQ=[new THREE.Quaternion(),new THREE.Quaternion()], AE=new THREE.Euler(), AMBV=new THREE.Vector3();
  function ambSample(c,t,loop,n,out,o){ const D=c.D[n]; if(!D){ out[o]=0; out[o+1]=0; out[o+2]=0; out[o+3]=1; return; } let x=t/c.dur; x=loop?x-Math.floor(x):Math.min(1,Math.max(0,x)); const f=x*(c.nF-1), i=Math.min(c.nF-2,Math.floor(f)); THREE.Quaternion.slerpFlat(out,o,D,i*4,D,i*4+4,f-i); }
  /* 小動作的時間軸：頭（脖子＋頭）往上下 p、左右 y、側彎 r（弧度）。keys＝[[時間, p, y, r],…]，中間平滑內插 */
  const amb01=x=>x<=0?0:(x>=1?1:x*x*(3-2*x));
  const AK=[0,0,0];
  function ambKeys(keys,t){ const o=AK; o[0]=0; o[1]=0; o[2]=0; if(!keys||!keys.length) return o; if(t<=keys[0][0]) return o; for(let i=1;i<keys.length;i++){ const a=keys[i-1], b=keys[i]; if(t<=b[0]){ const s=amb01((t-a[0])/Math.max(1e-3,b[0]-a[0])); for(let j=0;j<3;j++) o[j]=a[j+1]+(b[j+1]-a[j+1])*s; return o; } } return o; }
  /* 挑一個小動作（kind）：看姿勢、手上拿什麼、是不是玩家 */
  function ambPick(u,pose,kd,armsFree,focus,task){ const player=!!(u.spec&&u.spec.id==='hero_m'); const W=[];
    if(task){ if(!player) W.push(['glance',3],['side',1],['stretch',1]); }   /* 正在做事（NPC-ANIM-LOOPS-1104）：只做頭的小動作（抬頭、往一邊看、伸脖子）——看四周、撥頭髮、換坐姿會動到身體和手，手就離開桌上的東西 */
    else if(pose==='read'){ if(kd==='book') W.push(['page',4]); if(!player) W.push(['glance',kd==='book'?3:2],['look',1],['side',1],['stretch',1]); W.push(['posture',2]); }
    else if(focus){ if(!player){ W.push(['glance',3],['look',1],['side',1],['stretch',1]); if(armsFree) W.push(['hair',1]); } W.push(['posture',2]); }   /* 看著桌上的筆電、筆記：抬頭看一下最多 */
    else { if(!player){ W.push(['look',2],['side',2],['up',2],['stretch',1]); if(armsFree) W.push(['hair',2]); } W.push(['posture',player?1:3]); }
    let s=0; for(const w of W) s+=w[1]; let r=C.ambRand()*s; for(const w of W){ r-=w[1]; if(r<=0) return w[0]; } return W.length?W[W.length-1][0]:null; }
  /* 片段疊一次（看看四周、撥頭髮）：從 0 慢慢疊上去，片段快完的時候慢慢放掉 */
  function ambOnce(m,name,kind){ const c=ambClip(name); if(!c) return false; m.ovWant=name; m.ovLoop=false; if(m.ov!==name){ m.ov=name; m.ow=0; } m.ot=0; m.fx={kind,t:0,dur:c.dur/Math.max(0.5,m.orate||1)+0.3,keys:null}; return true; }
  function ambStart(m,u,kind,armsFree){ const K=C.SIT_AMB, sd=C.ambRand()<0.5?1:-1;
    if(kind==='hair'&&!armsFree) kind='side';   /* 手上有東西：撥不了頭髮＝往一邊看 */
    if((kind==='hair'||kind==='look')&&!ambClip(kind==='hair'?K.hair:K.look)) kind='side';
    m.n++; m.kinds[kind]=(m.kinds[kind]|0)+1; m.lastKind=kind;
    if(kind==='posture'){ const L=K.base.filter(b=>b!==m.base); if(L.length&&C.ambRand()<0.5){ m.prev=m.base; m.pt=m.t; m.prate=m.rate; m.fw=0; m.base=L[Math.floor(C.ambRand()*L.length)%L.length]; m.t=ambRnd(0,5); }   /* 有不只一個坐姿循環的時候：換一個 */
      m.pstTo=ambPosture(); m.fx={kind,t:0,dur:1.6,keys:null}; return; }
    if(kind==='hair'){ ambOnce(m,K.hair,kind); return; }
    if(kind==='look'){ ambOnce(m,K.look,kind); return; }
    if(kind==='page'){ m.fx={kind,t:0,dur:1.1,keys:[[0,0,0,0],[0.35,-0.04,0.05,0],[0.8,-0.04,0.05,0],[1.1,0,0,0]]}; return; }
    if(kind==='glance'){ const d=ambRnd(1.4,2.6), p=-ambRnd(0.35,0.5), y=ambRnd(-0.25,0.25); m.fx={kind,t:0,dur:d+0.9,keys:[[0,0,0,0],[0.45,p,y,0],[0.45+d,p,y*0.7,0],[d+0.9,0,0,0]]}; return; }
    if(kind==='up'){ const d=ambRnd(1.2,2.2), p=-ambRnd(0.15,0.25), y=ambRnd(-0.2,0.2); m.fx={kind,t:0,dur:d+1,keys:[[0,0,0,0],[0.5,p,y,0],[0.5+d,p,y,0],[d+1,0,0,0]]}; return; }
    if(kind==='stretch'){ const r=sd*ambRnd(0.22,0.32); m.fx={kind,t:0,dur:2.6,keys:[[0,0,0,0],[0.7,-0.12,0,r],[1.6,-0.18,0,r],[2.6,0,0,0]]}; return; }
    /* side：往一邊看、停一下，一半的時候再往另一邊看 */
    const y1=sd*ambRnd(0.45,0.85), h1=ambRnd(0.8,1.6), two=C.ambRand()<0.5, y2=-sd*ambRnd(0.35,0.7), h2=ambRnd(0.6,1.2), p=ambRnd(-0.08,0.06);
    const keys=[[0,0,0,0],[0.6,p,y1,0],[0.6+h1,p,y1,0]]; let t=0.6+h1; if(two){ keys.push([t+0.8,p,y2,0],[t+0.8+h2,p,y2,0]); t+=0.8+h2; } keys.push([t+0.7,0,0,0]); m.fx={kind,t:0,dur:t+0.7,keys}; }
  /* 手上拿著東西（小說、法典、馬克杯…：配件掛在前臂、手上，而且看得到）＝手臂照舊（不放到大腿上、不撥頭髮）*/
  function handHeld(u){ const P=u.props; if(!P||typeof PROPS==='undefined'||!PROPS.DEF) return false;
    if(!u.ambHandKeys){ u.ambHandKeys=[]; for(const k in P){ const d=PROPS.DEF[k]; if(d&&/LowerArm$|Hand$/.test(d.bone||'')&&k!=='bandage') u.ambHandKeys.push(k); } }
    for(const k of u.ambHandKeys){ const o=P[k]; if(o&&o.visible) return true; } return false; }
  /* 剛開始動的那一下（坐著等片段下載的人，u.ambWasStatic）：0.8 秒內從靜態坐姿慢慢換過去，不跳格。靜態坐姿的值（每一格從這裡開始內插，不累加）*/
  function ambStatic(nd,name,pose,sx){ if(name==='Spine') nd.rotation.set(0.06*sx,0,0); else if(name==='Head') nd.rotation.set(pose==='read'?0.35*sx:0,0,0); else nd.quaternion.set(0,0,0,1); }
  /* 每一格：①～④ 都在這裡；回傳 false＝片段還沒好（照舊靜止）*/
  function sitAmbient(h,u,dt,st,pose){ if(!C.sitAmb||!ambReady()) return false; const K=C.SIT_AMB, R=ambRig(u); if(!R.order.length) return false; const m=u.amb||(u.amb=ambInit());
    u.ambPose=pose; const kd=pose==='read'?readKind(u):null, armsFree=pose==='sit'&&!u.sitFloor&&!(u.props&&u.props.laptop_lap&&u.props.laptop_lap.visible)&&!handHeld(u), talked=!!st.lookAt;
    const tc=taskStep(u,m,dt,pose,armsFree), tw=tc?amb01(m.tw||0):0;   /* 坐在桌前做事的片段（NPC-ANIM-LOOPS-1104，上面）：只有手上沒東西的 sit；tw＝它的權重（0.5 秒慢慢換）*/
    const focus=pose==='sit'&&!!u.sitFocus;   /* 看著桌上的筆電、筆記、書（SEATACT 標的 u.sitFocus）：低頭 deskPitch、眼睛看那裡 */
    if(m.inW==null) m.inW=u.ambWasStatic?0:1; if(m.inW<1){ m.inW=Math.min(1,m.inW+(dt>0?dt/K.blendIn:0)); if(m.inW>=1) u.ambWasStatic=false; } const bw=amb01(m.inW);
    // 時間：坐姿循環、換循環的交叉淡入
    m.t+=dt*m.rate; if(m.prev){ m.pt+=dt*m.prate; m.fw=Math.min(1,m.fw+(dt>0?dt/K.fade:0)); if(m.fw>=1) m.prev=null; }
    // ④ 同桌聊天：說話／點頭輪流（兩個人共用 pair 的時鐘；兩個人都在動的時候各加一半）
    const P=u.sitChat&&u.sitChat.pair;
    if(P){ P.t=(P.t||0)+dt*0.5; if(P.t>=(P.dur||4)){ P.t=0; P.turn=(P.turn|0)^1; P.dur=ambRnd(K.turn[0],K.turn[1]); } const role=P.na&&P.na.obj===h?0:1; m.ovWant=(P.turn|0)===role?K.talk:K.nod; m.ovLoop=true; m.chatRole=m.ovWant===K.talk?'talk':'nod'; if(m.fx&&m.fx.kind!=='page') m.fx=null; }
    else { m.chatRole=null; if(m.ovWant===K.talk||m.ovWant===K.nod) m.ovWant=null; }
    // ③ 小動作
    if(m.fx){ m.fx.t+=dt; const once=m.ov&&!m.ovLoop&&m.ov===m.ovWant; if(once){ const oc=ambClip(m.ov); if(!oc||m.ot>=oc.dur-K.ovFade*(m.orate||1)) m.ovWant=null; }   /* 疊一次的片段快完了：慢慢放掉 */
      if(m.fx.t>=m.fx.dur){ m.fx=null; if(m.ovWant&&!m.ovLoop) m.ovWant=null; } }
    else if(!P){ m.next-=dt; if(m.next<=0){ m.next=ambRnd(K.gap[0],K.gap[1]); const kind=ambPick(u,pose,kd,armsFree,focus,tw>0); if(kind&&!(talked&&kind!=='posture')) ambStart(m,u,kind,armsFree); } }
    /* 有人跟他說話（對話、聊天的注視）：頭的小動作在 0.5 秒內收回來（權重 fxW），收完就結束；沒有人說話＝權重回到 1 */
    m.fxW=Math.max(0,Math.min(1,(m.fxW==null?1:m.fxW)+(dt>0?(talked?-dt:dt)/0.5:0))); if(talked&&m.fxW<=0&&m.fx&&m.fx.keys&&m.fx.kind!=='page') m.fx=null;
    if(talked&&m.ov&&!m.ovLoop){ m.ovWant=null; if(m.fx&&(m.fx.kind==='look'||m.fx.kind==='hair')) m.fx=null; }   /* 疊一次的片段（看看四周、撥頭髮）也放掉（ovFade 秒）*/
    // 疊加片段（聊天、撥頭髮）的權重
    if(m.ov!==m.ovWant){ m.ow-=dt>0?dt/K.ovFade:0; if(m.ow<=0){ m.ow=0; m.ov=m.ovWant; m.ot=m.ovLoop?ambRnd(0,3):0; } }
    else if(m.ov){ m.ow=Math.min(1,m.ow+(dt>0?dt/K.ovFade:0)); }
    if(m.ov) m.ot+=dt*(m.orate||1);
    // 片段 → 世界旋轉差（AW）
    const cur=ambClip(m.base), prv=m.prev?ambClip(m.prev):null, ov=m.ov&&m.ow>0?ambClip(m.ov):null; if(!cur) return false;
    const far=!!u.isFar, n=R.order.length, full=!!tc&&tw>=1;
    for(let i=0;i<n;i++){ const g=R.grp[i]; if(g===0||(g===2&&!armsFree)||(far&&R.finger[i])) continue; const nm=R.order[i], o=i*4;
      if(full){ ambSample(tc,m.tt,true,nm,AW,o); continue; }   /* 做事的片段完全換過去了：坐姿循環這幾根不用算 */
      ambSample(cur,m.t,true,nm,AW,o); if(prv){ ambSample(prv,m.pt,true,nm,AS,0); THREE.Quaternion.slerpFlat(AW,o,AS,0,AW,o,m.fw); }
      if(ov){ ambSample(ov,m.ot,m.ovLoop,nm,AS,0); THREE.Quaternion.slerpFlat(AW,o,AW,o,AS,0,m.ow); }
      if(tc&&tw>0){ ambSample(tc,m.tt,true,nm,AS,0); THREE.Quaternion.slerpFlat(AW,o,AW,o,AS,0,tw); } }   /* 做事的片段（速度 1）疊上去 */
    // 世界旋轉差 → 本地旋轉（VRM 0.x：x、z 反號）
    const sx=u.sx||1, B=u.bones;
    for(let i=0;i<n;i++){ const g=R.grp[i]; if(g===0||(g===2&&!armsFree)||(far&&R.finger[i])) continue; const p=R.par[i], q=AQ[0].fromArray(AW,i*4); if(p>=0) q.premultiply(AQ[1].fromArray(AW,p*4).invert()); if(u.v0){ q.x=-q.x; q.z=-q.z; }
      const nd=R.nodes[i]; if(bw<1){ if(!R.tab[i]) ambStatic(nd,R.order[i],pose,sx); nd.quaternion.slerp(q,bw); } else nd.quaternion.copy(q); }   /* 上臂、前臂的靜態值＝外面剛寫的 SIT_VRM */
    // 手臂不吃片段（read、腿上的筆電、跪坐、手上拿著東西）：肩膀、手、手指回到靜止；上臂、前臂照 SIT_VRM／SEIZA_VRM（外面先寫好了）、READ_VRM（外面之後寫）
    if(!armsFree) for(let i=0;i<n;i++) if(R.grp[i]===2&&!R.tab[i]) R.nodes[i].quaternion.set(0,0,0,1);
    // 每個人自己的坐姿（往前、往左右、轉身；脊椎、胸口各一半）：換坐姿的時候慢慢換過去
    { const ps=m.pst, pt=m.pstTo, k=dt>0?Math.min(1,dt*K.posture.speed):0; for(let j=0;j<3;j++) ps[j]+=(pt[j]-ps[j])*k;
      const pw=bw*(1-tw); AE.set(ps[0]*0.5*sx*pw,ps[2]*0.5*pw,ps[1]*0.5*sx*pw); AQ[0].setFromEuler(AE); if(B.Spine) B.Spine.quaternion.multiply(AQ[0]); if(B.Spine1) B.Spine1.quaternion.multiply(AQ[0]); }   /* 正在做事：不加（身體一轉，手就離開桌上的東西）*/
    // 頭的小動作（脖子 40%、頭 60%）＋讀書低頭
    const hk=m.fx&&m.fx.keys?ambKeys(m.fx.keys,m.fx.t):null;
    if(hk&&m.fx.kind!=='page'){ hk[0]*=m.fxW; hk[1]*=m.fxW; hk[2]*=m.fxW; }
    m.head[0]=hk?hk[0]:0; m.head[1]=hk?hk[1]:0; m.head[2]=hk?hk[2]:0;
    if(hk&&B.Neck){ AE.set(hk[0]*0.4*sx*bw,hk[1]*0.4*bw,hk[2]*0.4*sx*bw); B.Neck.quaternion.multiply(AQ[0].setFromEuler(AE)); }
    if(B.Head){ const rp=pose==='read'?K.readPitch:(focus?K.deskPitch*(1-tw):0), cyB=((cur.hy||0)*(prv?m.fw:1)+(prv?(prv.hy||0)*(1-m.fw):0))*(ov?1-m.ow:1)+(ov?(ov.hy||0)*m.ow:0), cy=tc?cyB*(1-tw)+(tc.hy||0)*tw:cyB;   /* 片段本身的頭的平均左右（扣掉）；做事的片段自己就低頭了（不再加 deskPitch）*/
      AE.set(((hk?hk[0]*0.6:0)+rp)*sx*bw,((hk?hk[1]*0.6:0)-cy+m.hy*(1-(ov?m.ow:0)))*bw,(hk?hk[2]*0.6:0)*sx*bw); B.Head.quaternion.multiply(AQ[0].setFromEuler(AE)); }
    // 翻頁、滑手機（readIK 之後在真實骨架上做：u.readTurn、u.readScroll）
    u.readTurn=m.fx&&m.fx.kind==='page'?Math.min(1,m.fx.t/m.fx.dur):0;
    if(pose==='read'&&kd&&kd!=='book'&&!talked){ m.scT-=dt; if(m.scT<=0&&m.sc<=0){ m.sc=ambRnd(0.8,1.6); m.scT=ambRnd(K.scroll[0],K.scroll[1]); } } if(m.sc>0) m.sc=Math.max(0,m.sc-dt);
    u.readScroll=m.sc>0?m.sc:0; u.readScrollT=(u.readScrollT||0)+dt;
    // 做事的片段：桌子比參考遠的位子整個人往前坐（外面每一格先把 u.model 放回 0）；眼睛看手上的手機、碗（有 sitFocus 的看桌上那一組，外面照舊）
    if(tc){ u.model.position.z=(m.tShift||0)*tw; u.model.position.y+=(m.tLift||0)*tw; }   /* 外面每一格先把 y 放回坐姿的高度：加上去不會累加 */
    u.taskLook=null; if(tc&&tw>0.3&&!u.sitFocus){ const T=u.sitTask, hp=u.taskProps&&u.taskProps.hand_phone;
      if(T&&T.prop==='hand_phone'&&hp&&hp.visible) u.taskLook=hp;
      else { const L=T&&C.SIT_TASK.LOOK[T.kind]; if(L){ const v=u.taskLookP||(u.taskLookP=new THREE.Vector3()), RF=C.SIT_TASK.REF; v.set(L[0],(T.deskH!=null?T.deskH:RF.desk)+L[1],(T.edge!=null?T.edge:RF.edge)+L[2]); u.taskLook=v; } } }
    return true; }
  C._sitAmbient=sitAmbient;
  /* 馬上做某一個小動作（測試、錄影用；瀏覽器主控台：CHAR.sitAmbFidget(E3.npcs[0].obj,'look')）：kind＝look、side、up、glance、stretch、hair、posture、page；坐著、片段好了才有用 */
  C.sitAmbFidget=function(h,kind){ const u=h&&h.userData; if(!u||u.driver!=='vrm'||!u.anim||!u.anim.static||!u.ambOn) return false; const m=u.amb||(u.amb=ambInit()); const pose=u.ambPose||'sit';
    const armsFree=pose==='sit'&&!u.sitFloor&&!(u.props&&u.props.laptop_lap&&u.props.laptop_lap.visible); m.fx=null; m.fxW=1; ambStart(m,u,kind,armsFree); return true; };
  /* 翻頁（readIK 之後，只有拿書）：右手拇指從書的右外緣掃過右頁（在頁面前面）、手腕往書溝轉一點；p＝0～1 */
  const PGQ=new THREE.Quaternion(), PGV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  function readTurnFx(u,get,MW,K){ const p=u.readTurn; if(!(p>0)) return; const b=Math.sin(Math.PI*Math.min(1,p)), w=b*b; if(w<1e-3) return;
    const hand=get('rightHand'), t1=get('rightThumbMetacarpal')||get('rightThumbProximal'), t3=get('rightThumbDistal'); if(!hand) return;
    const yAx=PGV[0].set(0,1,0).transformDirection(MW); rotWorld(hand,yAx,0.35*w);   /* 手腕往書溝轉（書的 y 軸）*/
    if(t1&&t3){ const base=t1.getWorldPosition(PGV[1]), tip=t3.getWorldPosition(PGV[2]).sub(base); const tg=PGV[3].set(K.W*(0.85-0.55*Math.min(1,p*1.6)),0.01,0.015).applyMatrix4(MW).sub(base);   /* 目標：右頁前面、從外緣往書溝 */
      if(tip.lengthSq()>1e-8&&tg.lengthSq()>1e-8){ PGQ.setFromUnitVectors(tip.normalize(),tg.normalize()); PGQ.slerp(IKQ[0].set(0,0,0,1),1-w); rotWorldQ(t1,PGQ); } } }
  /* 滑手機（readIK 之後，手機、平板）：右手拇指在螢幕上下滑（拇指根繞「拇指方向 × 螢幕往上」轉）*/
  function readScrollFx(u,get,MW){ const s=u.readScroll; if(!(s>0)) return; const t1=get('rightThumbMetacarpal')||get('rightThumbProximal'), t3=get('rightThumbDistal'); if(!t1||!t3) return;   /* 整根拇指從根部轉（中間那一節轉，指尖只動 0.7 cm，看不出來）*/
    const env=Math.min(1,s/0.25)*Math.min(1,(1.6-Math.min(1.6,s))/0.25+0.0001), up=PGV[0].set(0,1,0).transformDirection(MW), dir=t3.getWorldPosition(PGV[1]).sub(t1.getWorldPosition(PGV[2]));
    const ax=PGV[3].crossVectors(dir,up); if(ax.lengthSq()<1e-10) return; ax.normalize(); rotWorld(t1,ax,0.3*Math.sin((u.readScrollT||0)*2*Math.PI*1.6)*Math.min(1,env)); }
  function animateVRM(h,dt,st){ const u=h.userData; const a=u.anim; a.t+=dt; const pose=st.pose||'idle'; const B=u.bones; const spd=st.speed||0; const vrm=u.vrm; const sx=u.sx||1;
    if(u.taskPropOn&&(pose!=='sit'||!u.sitTask)) propVis(u,null);   /* 坐著做事的配件（NPC-ANIM-LOOPS-1104）：起身、拿掉了就藏（sitAmbient 沒跑的時候也一樣）*/
    if(u.props){ const sitting=pose==='sit'||pose==='read', lying=pose==='lie'||C.GYM_POSES.includes(pose); for(const k in u.props){ const d=typeof PROPS!=='undefined'&&PROPS.DEF[k]; const o=u.props[k]; if(!o) continue; if(d&&d.sit==='only'){ o.visible=sitting&&!!(u.propOn&&u.propOn[k]===true); continue; } if(!(k==='backpack'||k==='guitar'||k==='bag_yu'||(d&&d.sit==='hide'))) continue; o.visible=!sitting&&!lying&&!(u.propOn&&u.propOn[k]===false); } }   /* 躺在床上也藏（後背包，DORM-SLEEP-1030）*/   /* 坐下時藏：後背包、吉他、側背包＋PROPS.DEF 的 sit:'hide'（垂著拿的東西）；sit:'only'＝坐下而且開了才看得到（NPC-POOL-ART-1028）*/
    u.readOn=pose==='read'&&C.readIK&&!(u.props&&u.props.laptop_lap&&u.props.laptop_lap.visible); readVis(u);   /* 讀書：手上那本打開的書（readIK；腿上開著筆電的時候不拿書）*/
    if(u.props&&pose==='read'!==!!u.readHeldOff){ u.readHeldOff=pose==='read'; for(const k in u.props){ const d=typeof PROPS!=='undefined'&&PROPS.DEF[k], o=u.props[k]; if(!o||!d||!/LowerArm$|Hand$/.test(d.bone)||k==='bandage'||d.sit) continue; o.visible=!u.readHeldOff&&!(u.propOn&&u.propOn[k]===false); } }   /* 讀書的時候手上原本拿的東西（小說、法典、講義、馬克杯…）先收起來：兩手在捧書。繃帶照舊；sit:'hide'／'only' 上面已經處理 */
    if(pose==='climb'&&!(u.climbW>0)&&C.climbIK&&u.ladder&&u.vrm){ const hm=u.vrm.humanoid; u.ladCap0=['leftFoot','rightFoot'].map(n=>{ const b=hm.getRawBoneNode(n); if(!b) return null; const p=new THREE.Vector3(), q=new THREE.Quaternion(); b.matrixWorld.decompose(p,q,LDV[0]); return {p,q}; }); if(u.ladCap0.some(x=>!x)) u.ladCap0=null; }   /* 爬梯子的第一格：兩腳在前一格（片段換成走路以前）的位置（matrixWorld 還是上一格的）*/
    u.ride=pose==='ride'?(st.ride||{crank:0}):null;   u.climbOn=pose==='climb'||(pose==='climbdown'&&C.climbIK&&!!ladGeo(u.ladder)); u.ladPose=pose; u.ladDt=dt;   /* 爬梯子：手、上身在 climbIK（真實骨架）；權重 climbW 在下面（updateVRM 以前）。爬下來（climbdown）只有宿舍的梯子（u.ladder，CLIMB-GRIPS-FEET-1105）才用 climbIK，其他照舊是走路片段 */
    if(pose!=='lie'&&!SWIM[pose]&&u.model.rotation.x!==0) u.model.rotation.x=0;   /* 游泳：趴著（gymIK 每一格自己轉）*/
    if(u.fitMorph){ const w=Math.max(0,Math.min(1,+u.fitBody||0)); if(u.fitMorphW!==w){ u.fitMorphW=w; for(const [o,i] of u.fitMorph) o.morphTargetInfluences[i]=w; } }   /* 體態第二階段（見建立 VRM 的地方）*/
    if(C.GYM_POSES.includes(pose)){ const g=u.gym||(u.gym={}); if(g.pose!==pose){ g.pose=pose; g.t=Math.random()*20; g.rate=0.85+Math.random()*0.3; g.v=Math.random()<0.5?1:0; g.w=0; } g.t+=dt*g.rate; }   /* 健身房（GYM-USE-1103）：每個人自己的節奏（rate）、起始相位、拉筋的做法（v）*/
    else if(u.gym){ u.gym=null; if(!a.static){ u.model.position.y=u.model.userData.baseY||0; u.model.position.z=0; } }   /* 深蹲改了站姿的高度、前後：換回一般動作時放回去 */   /* 從躺姿起來：整個人轉回直立（DORM-SLEEP-1030）*/
    if(pose==='ride'){ if(!a.static||a.staticKind!=='ride'){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='ride'; a.cur=null; vrm.humanoid.resetNormalizedPose(); } u.ikDrop=0; u.ikSt=null; setBonesV(B,RIDE_VRM,sx); if(B.Head) B.Head.rotation.set(-0.22*sx,0,0); }   /* 頭往上抬，看前面的路（胸口、頭每一幀都由表重設，下面的注視「加」轉角不會累加）*/   /* 騎車：人物的高度、前後位置在 rideIK 依髖關節對座墊 */
    else if(pose==='sit'||pose==='read'){ if(!a.static||a.staticKind!=='sit'){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='sit'; a.cur=null; vrm.humanoid.resetNormalizedPose(); if(u.amb){ const m=u.amb; m.fx=null; m.ov=null; m.ovWant=null; m.ow=0; m.prev=null; m.fw=1; m.sc=0; } } u.ikDrop=0; u.ikSt=null; u.model.position.y=(u.model.userData.baseY||0)-sitDrop(u); u.model.position.z=0; setBonesV(B,SIT_VRM,sx); if(u.sitFloor) setBonesV(B,SEIZA_VRM,sx);
      /* 坐著也會動（NPC-AMBIENT-ANIM-1104，上面 sitAmbient）：脊椎、胸口、脖子、頭每一幀由坐姿循環重寫（注視在胸口「加」的轉角照樣不累加）；手上沒有東西的 sit 連手臂也是片段的；片段還沒好＝下面舊的靜態坐姿 */
      if(sitAmbient(h,u,dt,st,pose)){ u.ambOn=true; if(pose==='read') setBonesV(B,READ_VRM,sx); }
      else { if(u.ambOn){ u.ambOn=false; vrm.humanoid.resetNormalizedPose(); setBonesV(B,SIT_VRM,sx); if(u.sitFloor) setBonesV(B,SEIZA_VRM,sx); } u.readTurn=0; u.readScroll=0; u.ambWasStatic=true; if(u.amb) u.amb.inW=0; u.taskLook=null; if(u.taskPropOn) propVis(u,null);   /* 之後片段好了：從這個靜態坐姿慢慢換過去 */
        if(pose==='read'){ setBonesV(B,READ_VRM,sx); if(B.Head) B.Head.rotation.set((0.35+Math.sin(a.t*0.6)*0.02)*sx,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03*sx,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06*sx,0,0); if(B.Spine1) B.Spine1.rotation.set(0,0,0); } }   /* 胸口每一幀也要重設：下面的注視是在胸口「加」轉角，坐姿沒有動畫把骨頭蓋回去，不重設就會一直累加、整個上半身在椅子上轉圈（使用者 2026-10-11 回報，tests/seated_look_unit.js）*/
    else if(GYM_SEATED[pose]){ if(!a.static||a.staticKind!=='gym'){ const from={}; for(const n in B) from[n]=B[n].quaternion.clone(); u.gym.from=from; for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='gym'; a.cur=null; vrm.humanoid.resetNormalizedPose(); }   /* 換過來那一刻的骨頭角度（站著的片段）：底子從它慢慢轉到坐姿，不跳格 */
      u.ikDrop=0; u.ikSt=null; setBonesV(B,SWIM[pose]?SWIM_BASE:GYM_BASE,sx); const fr=u.gym.from; if(fr){ const x=Math.min(1,u.gym.w||0), wb=x*x*(3-2*x); if(wb>=1) u.gym.from=null; else for(const n in fr) if(B[n]) B[n].quaternion.slerpQuaternions(fr[n],B[n].quaternion.clone(),wb); } }   /* 健身房坐著的動作：底子是坐姿（每一幀由表重設），臀部、手腳在 gymIK（真實骨架）*/
    else if(pose==='lie'){ if(!a.static||a.staticKind!=='lie'){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='lie'; a.cur=null; vrm.humanoid.resetNormalizedPose(); } u.ikDrop=0; u.ikSt=null; u.model.position.y=(u.model.userData.baseY||0)+LIE_UP*u.k; u.model.position.z=0; u.model.rotation.x=-Math.PI/2; setBonesV(B,LIE_VRM,sx); if(B.Head) B.Head.rotation.set(0.2*sx,0,0); }   /* 躺在床上（LIE_VRM；胸口、頭每一幀由表重設，下面的注視「加」轉角不會累加）*/
    else { if(a.static){ a.static=false; a.staticKind=null; u.model.position.y=u.model.userData.baseY||0; u.model.position.z=0; vrm.humanoid.resetNormalizedPose(); } const clipName=POSE_CLIP[pose]||'idle'; if(a.cur!==clipName&&a.actions[clipName]){ const prev=a.cur&&a.actions[a.cur]; const next=a.actions[clipName]; next.reset().setEffectiveWeight(1).fadeIn(0.22).play(); if(prev) prev.fadeOut(0.22); a.cur=clipName; } const act=a.actions[a.cur]; if(act){ act.timeScale= a.cur==='walk'?Math.max(0.6,spd/1.45): (a.cur==='run'?Math.max(0.7,spd/4.1):1); } a.mixer.update(dt);
      /* 上臂往外張 armOut（manifest，度；ART-PS-SKIRT-HAND，LAWWW2-C 2026-10-21）：長 A 字裙的人走路、上樓梯時，手往後擺會伸進裙子後面鼓起來的地方（裙子綁在大腿上、不跟手臂動）。
         動畫每一幀把上臂設回片段的角度，這裡在身體座標（正規化骨架的父座標）繞前後軸再轉一點，不會累加；坐下、騎車是別的分支，不受影響 */
      if(u.armOut){ for(const [n,s_] of [['LeftArm',1],['RightArm',-1]]){ const b=B[n]; if(!b) continue;
          /* 往後擺收小：上臂（正規化骨架 T 字姿勢沿 ±x）現在指向 d，往前／往後擺的角度 α＝atan2(d.z, −d.y)；往後（α·sx<0：VRM 1.0 面向 +z、0.x 面向 −z）收掉 armBack、往前收掉 armFwd（比例；繞左右軸轉回去） */
          const d=ARMV.set(s_,0,0).applyQuaternion(b.quaternion), al=Math.atan2(d.z,-d.y); ARMQ.setFromAxisAngle(ARMX,al*(al*sx<0?u.armBack:u.armFwd)); b.quaternion.premultiply(ARMQ);
          ARMQ.setFromAxisAngle(ARMZ,s_*u.armOut*sx); b.quaternion.premultiply(ARMQ); } }
      if(pose==='wave'&&B.RightArm){ const g=Math.sin(a.t*7); B.RightArm.rotation.set(0,0,-0.9*sx); if(B.RightForeArm) B.RightForeArm.rotation.set(0,0,(-1.6+g*0.25)*sx); if(B.Head) B.Head.rotation.z+=0.08*sx; }
      if(pose==='talk'&&B.Head){ B.Head.rotation.x+=Math.sin(a.t*1.4)*0.05*sx; B.Head.rotation.y+=Math.sin(a.t*0.8)*0.08; if(B.Spine1) B.Spine1.rotation.y+=Math.sin(a.t*0.6)*0.03; }
      if(u.overlay&&u.overlay.bones){ const o=u.overlay, k=o.k==null?1:Math.max(0,Math.min(1,o.k)); for(const n in o.bones){ const bn=B[n]; if(!bn) continue; const r=o.bones[n]; OVE.set(r[0]*sx,r[1],r[2]*sx); OVQ.setFromEuler(OVE); bn.quaternion.slerp(OVQ,k); } }   /* 疊加姿勢（羽球揮拍 BADMINTON-CLIP-1027，src/badminton_clip3d.js）：片段算完以後把幾根骨頭轉到指定角度（和 SIT_VRM 同一套角度：x、z 乘 sx），k＝比例；坐下、騎車不受影響 */
      if(u.posture||u.postQ){ const on=!(u.overlay&&u.overlay.bones)&&!!u.posture&&(pose==='idle'||pose==='walk'||pose==='run'||pose==='talk'), PQ=u.postQ||{};   /* 體態（D40 健身，src/fit3d.js 設 u.posture）：小角度疊在動作上（挺胸、肩膀往後）；坐、騎車、疊加姿勢（羽球、開門）的時候不加 */
        for(const n in PQ){ const bn=B[n], q=PQ[n]; if(bn&&bn.quaternion.equals(q.after)) bn.quaternion.multiply(q.inv); }   /* 這一格動畫沒蓋過的骨頭：先撤掉上一格加的（不然會一格一格累加）*/
        u.postQ=on?{}:null; if(on) for(const n in u.posture){ const bn=B[n]; if(!bn) continue; const r=u.posture[n]; OVE.set(r[0]*sx,r[1],r[2]*sx); const q=new THREE.Quaternion().setFromEuler(OVE); bn.quaternion.multiply(q); u.postQ[n]={after:bn.quaternion.clone(),inv:q.invert()}; } }
      u.ikSt=st; }  // VRM 的前臂軸向和程序化人物不同，說話時不轉前臂（舊版會把手舉到頭上）
    // 注視（眼睛＋頭）
    if(st.lookAt){ const local=h.worldToLocal(new THREE.Vector3(st.lookAt.x,u.headY,st.lookAt.z)); u.look.position.copy(local); if(B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.6; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; } }
    else { const hd=u.ambOn&&a.static&&u.amb&&u.amb.head;   /* 坐著的小動作（NPC-AMBIENT-ANIM-1104）：眼睛跟著頭往左右、上下看；讀書、滑手機的人眼睛看手上的東西（上一格的位置）*/
      if(hd&&(Math.abs(hd[0])>1e-3||Math.abs(hd[1])>1e-3)){ const hy=u.headY-sitDrop(u); u.look.position.set(Math.sin(hd[1])*3,hy-Math.tan(Math.max(-0.6,Math.min(0.6,hd[0])))*3,Math.cos(hd[1])*3); }
      else if(u.ambOn&&a.static&&pose==='read'&&u.readOn){ const kd=readKind(u), it=kd==='book'?u.readBook:(u.readHeld&&u.readHeld[kd]); if(it&&it.visible){ u.look.position.copy(h.worldToLocal(it.getWorldPosition(AMBV))); } else u.look.position.set(0,u.headY,3); }
      else if(u.ambOn&&a.static&&pose==='sit'&&u.sitFocus){ const f=u.sitFocus; u.look.position.copy(h.worldToLocal(AMBV.set(f.x,f.y,f.z))); }   /* 看著桌上的筆電、筆記 */
      else if(u.ambOn&&a.static&&pose==='sit'&&u.taskLook){ const L=u.taskLook; if(L.isObject3D) u.look.position.copy(h.worldToLocal(L.getWorldPosition(AMBV))); else u.look.position.copy(L); }   /* 做事的片段：看手上的手機（上一格的位置）、碗 */
      else u.look.position.set(0,u.headY,3); }
    if(pose==='lie'&&!st.lookAt) u.look.position.set(0,1.6,-1.4);   /* 躺著：眼睛看天花板（不是看腳那邊）*/
    // 表情：眨眼、嘴型
    const em=vrm.expressionManager; if(em){ a.blink-=dt; if(a.blink<=0){ a.blinkT=0.14; a.blink=2.5+Math.random()*3.5; } if(a.blinkT>0){ a.blinkT-=dt; em.setValue('blink',a.blinkT>0.07?1:(a.blinkT/0.07)); } else em.setValue('blink',0); if(u.eyesShut) em.setValue('blink',1);   /* 睡著（story3d.js 的睡覺流程設 h.userData.eyesShut）*/ const target=pose==='talk'?(0.08+Math.abs(Math.sin(a.t*9))*0.3):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); em.setValue('aa',a.mouth); }
    /* 爬梯子（climbW）、跪（kneelW）的權重：換成這個姿勢 blend 秒內 0→1、換成別的（不是靜態的）姿勢 1→0（爬到最上面換成跪上床、從床上起來換成爬下來，手腳慢慢過去）；
       坐、躺這種靜態姿勢＝直接歸零（換的時候都在黑幕裡）。頭頂不高過 u.headMax（headFit）只在爬梯子、跪、和還在換過來的那幾格（DORM-LADDER-STOOP-1103）*/
    { const stat=!!a.static, stp=(v,on,T)=>stat?0:Math.max(0,Math.min(1,(v||0)+(on?1:-1)*(dt>0?dt/T:0))); u.climbW=stp(u.climbW,u.climbOn,C.CLIMB.blend); u.kneelW=stp(u.kneelW,pose==='kneel',C.KNEEL.blend); if(!(u.climbW>0)){ u.ladLast=null; u.ladSt=null; }   /* 爬完、權重歸零：梯子的狀態清掉（u.ladLast＝站回梯子前 u.ladder 拿掉以後，權重還沒歸零那幾格照梯子的路線慢慢放開）*/
      if(u.kneelSnap){ u.kneelSnap=false; if(pose==='kneel'&&!stat) u.kneelW=1; }   /* 黑幕裡直接跪好（story3d.js 從床上起來：躺 → 跪）*/
      if(u.fitOff&&stat) u.fitOff=false; }
    if(u.sitMorph){ const w=a.static&&a.staticKind==='sit'&&!u.sitFloor?1:0; if(u.sitMorphW!==w){ u.sitMorphW=w; for(const [o,i] of u.sitMorph) o.morphTargetInfluences[i]=w; } }   /* 裙子坐下的形狀（見建立 VRM 的地方；跪坐 sitFloor、健身器材、騎車、躺著不用）*/
    const sm=x=>x*x*(3-2*x), kw=sm(u.kneelW||0), fit=!a.static&&u.headMax!=null&&(C.HEADROOM.poses[pose]||u.climbW>0||u.kneelW>0);
    updateVRM(vrm,dt,()=>{ if(u.fitOff){ u.fitOff=false; u.model.position.y=(u.model.userData.baseY||0)-(u.ikDrop||0); u.model.position.z=0; u.model.position.x=0; }   /* 上一格蹲低、跪的位移先放回去（不累加）*/
      footIK(h,u,u.ikSt,dt); sitFeet(h,u); sitFloorFit(h,u); if(u.ride) rideIK(h,u);
      if(kw>0) kneelBody(h,u,kw); if(u.climbW>0) climbIK(h,u,'lean'); if(fit) headFit(h,u,1-kw); else u.fitE=null; if(u.climbW>0) climbIK(h,u,'arms'); if(kw>0) kneelArms(h,u,kw);
      if(u.gym){ gymIK(h,u,dt); gymProps(h,u); } else if(u.gymPropOn) gymPropHide(u); if(u.readOn) readIK(h,u,u.rawGet||(u.rawGet=n=>vrm.humanoid.getRawBoneNode(n))); if(u.drive) skirtDrive(u.drive); },u.isFar); }
  // VRM 更新：彈簧骨（頭髮、馬尾）用固定小步長。低幀率（SwiftShader 1–4 fps、手機突然卡頓）時一次積分太大，馬尾會失穩往上翹
  // 彈簧骨前先更新整個 VRM 的 world matrix：three-vrm 用「子骨頭的 matrixWorld」算骨長，人物移動／瞬移／動畫之後子骨頭還停在上一幀，
  // 低幀率時一幀差幾十公分 → 骨長算錯、頭髮被甩到耳朵高度往外翹（林芷若走路截圖；30 fps 時也會讓髮尾抖）
  function updateVRM(vrm,dt,post,far){ const sbm=vrm.springBoneManager; if(!sbm||vrm.lite||far){ if(far&&!vrm.lite) vrm.humanoid.update(); else vrm.update(dt); if(post) post(); return; }   /* far：30 m 外的路人換成遠距離版本時不跑彈簧骨、表情、視線（PERF-CROWD-LOD-1021；切回近的時候 setFar 重設彈簧骨）*/ vrm.humanoid.update(); if(post) post();   /* post：腳步貼合（真實骨架） */ if(vrm.lookAt) vrm.lookAt.update(dt); if(vrm.expressionManager) vrm.expressionManager.update(); if(vrm.nodeConstraintManager) vrm.nodeConstraintManager.update(); vrm.scene.updateWorldMatrix(true,true); const T=Math.min(dt,0.2), n=Math.min(6,Math.max(1,Math.ceil(T/(1/30)))); for(let i=0;i<n;i++) sbm.update(T/n); if(vrm.materials) vrm.materials.forEach(m=>{ if(m.update) m.update(dt); }); }
  C.setExprVRM=function(h,expr){ const u=h.userData; u.anim.expr=expr; const em=u.vrm.expressionManager; if(!em) return; for(const k in EXPR_VRM){ const e=EXPR_VRM[k]; if(e) em.setValue(e[0],0); } const e=EXPR_VRM[expr]; if(e) em.setValue(e[0],e[1]); };
  // ---- 建立 ----
  // 建立順序：VRM（spec.model）→ GLB（spec.model 或 spec.fallbackModel，例如主角的 TEMP_PLAYER_DEV_MODEL）→ 程序化 placeholder
  /* 角色 → 正式 3D 模型（VRoid CC0 改作）。主要角色各自一個模型；其他人（含路人、教授、不熟同學）用路人底模，
     顏色沿用各自原本的穿搭設定（髮色、上衣、褲裙），用材質顏色相乘。這裡只決定「外觀」，不影響移動、碰撞、存檔。 */
  C.CAST={hero_m:{model:'char.yuting'},an:{model:'char.heroine_01'},hero_f:{model:'char.heroine_01'},heroine_01:{model:'char.heroine_01'},zhe:{model:'char.zhe'},heroine_02:{model:'char.heroine_02'},heroine_03:{model:'char.heroine_03'},heroine_04:{model:'char.heroine_04'},heroine_05:{model:'char.heroine_05'},sis:{model:'char.heroine_05'},classmate_xinci:{model:'char.classmate_xinci'},classmate_peishan:{model:'char.classmate_peishan'},classmate_bohan:{model:'char.classmate_bohan'},kexin:{model:'char.kexin'},yu:{model:'char.yu'}};   /* 芯慈：manifest 有才用（?blchar，blOnly）*/
  const AMB={f:['char.npc_f1','char.npc_f2'],m:['char.npc_m1','char.npc_m2']};
  /* 沒有名字的路人（STORY.extraSpec 的 id 'x0'、'x1'…：教室聽眾、自習區、路上的人）另外一組：LAWWW2 的路人底模（各自的臉與穿搭、不換色；網址加 ?npcnew 才載入，assets3d.js）。
     有名字的人物（方奕廷、教授、不熟同學…）照舊用 AMB＋自己的顏色（tint），不會因為分到新模型失去穿搭（CLAUDE.md：角色不能因為共用路人模型而失去識別）*/
  /* 2026-10-17 使用者 P0（「長得很像的路人真的太多了」「路人數量要再加倍」）：無名路人只用 LAWWW2 的路人底模（manifest 的 anon），不再用舊的四個樣本。
     C.anonPool：每次換區域（STORY.populate 開頭呼叫 refresh）從全部的底模輪流挑最多 4 女＋4 男——沒下載的在背景下載（到了由 upgradeModels 換上；在那之前路人先藏起來，不露出備用方塊人），
     上一個區域用過、這次沒挑到、也沒有人在用的放掉（ASSETS.unloadVRM）。同一個區域裡每個路人分到「目前分得最少」的那一個（同一個底模盡量不重複）；換區域重算。
     底模越多（LAWWW2 第二～四批），池子輪得越廣；size 調大會多佔記憶體（手機）*/
  const ANON_KEYS=()=>Object.keys(ASSETS.manifest).filter(k=>ASSETS.manifest[k].anon);
  /* 一個底模的貼圖約 3 MB（512² 以下 20 張）：4＋4 約 25～32 MB。畫質「低」（弱的手機；路人數量也打五折）用 3＋3（sizeLow）*/
  C.anonPool={ size:{f:4,m:4}, sizeLow:{f:3,m:3}, cur:[], rot:0, pick:{}, uses:{},
    refresh(zoneId,level){ const P=this, all=ANON_KEYS(), sz=level==='low'?P.sizeLow:P.size; P.pick={}; P.uses={}; if(!all.length){ P.cur=[]; return P.cur; }
      const by=s=>all.filter(k=>ASSETS.manifest[k].sex===s), take=(L,n)=>{ if(L.length<=n) return L.slice(); const o=[]; for(let i=0;i<n;i++) o.push(L[(P.rot+i)%L.length]); return o; };
      const next=take(by('f'),sz.f).concat(take(by('m'),sz.m)); P.rot++;   /* 每次換區域只往後移一格（PERF-NPC-POOL-1022，LAWWW2 量測）：女、男各換 1 個新的、其他留著——原本 8 個全部換新，新的 VRM 到了同一格一起換上，是換區域以後最大的卡；走四個區域就全部換過一輪 */
      for(const k of next) if(!ASSETS.has(k)) ASSETS.loadOne(k).then(()=>{ if(!P.cur.includes(k)&&ASSETS.unloadVRM) ASSETS.unloadVRM(k); }).catch(e=>{ console.warn('anon pool load',k,e&&e.message); if(ASSETS.status) delete ASSETS.status[k]; });   /* 下載到的時候池子已經換了（換區域很快）：直接放掉；下載失敗：下次輪到再試 */
      for(const k of all) if(!next.includes(k)&&ASSETS.unloadVRM) ASSETS.unloadVRM(k);   /* 全部掃一次（不只上一輪的）：換區域太快時晚到的那幾個也會放掉；還有人在用的 unloadVRM 不會放 */
      P.cur=next; return next; },
    choose(id,sex){ const P=this; if(P.pick[id]) return P.pick[id]; if(!P.cur.length) P.refresh(); const L=P.cur.filter(k=>ASSETS.manifest[k]&&ASSETS.manifest[k].sex===sex); if(!L.length) return null;
      let best=L[0]; for(const k of L) if((P.uses[k]|0)<(P.uses[best]|0)) best=k; P.uses[best]=(P.uses[best]|0)+1; P.pick[id]=best; return best; } };
  /* 一模一樣的路人站在旁邊（2026-10-18 使用者「蠻常有 2 個一模一樣穿搭的人在附近或者就在旁邊」；BUG-NPC-DUP-1018）：分底模時不知道位置，game3d.js 的 dedupAnon 事後檢查，
     旁邊有人用同一個底模就換成附近沒人用、已經下載好的那一個（記在這個人自己的 buildSpec.anonKey，同一個 id 的別人不受影響）*/
  C.anonKeyOf=function(h){ const u=h&&h.userData; if(!u||!u.buildSpec||!/^x\d+$/.test(String(u.buildSpec.id))) return null; return u.buildSpec.anonKey||(u.spec&&u.spec.anonPick?u.spec.model:null)||(u.driver==='vrm'&&u.key&&ASSETS.manifest[u.key]&&ASSETS.manifest[u.key].anon?u.key:null); };
  C.anonPool.alt=function(h,avoid){ const P=this, u=h.userData, sex=u.buildSpec.sex==='f'?'f':'m'; const L=P.cur.filter(k=>ASSETS.manifest[k]&&ASSETS.manifest[k].sex===sex&&ASSETS.has(k)&&!avoid.has(k)); if(!L.length) return null; let best=L[0]; for(const k of L) if((P.uses[k]|0)<(P.uses[best]|0)) best=k; return best; };
  C.reAnon=function(h,k){ const u=h.userData, old=C.anonKeyOf(h); const prev=u.buildSpec.anonKey; u.buildSpec.anonKey=k; const nh=C.upgrade(h); if(!nh){ u.buildSpec.anonKey=prev; return null; } const P=C.anonPool; if(old) P.uses[old]=Math.max(0,(P.uses[old]|0)-1); P.uses[k]=(P.uses[k]|0)+1; return nh; };
  function hashId(s){ let h=7; for(const ch of String(s)) h=(h*31+ch.charCodeAt(0))>>>0; return h; }
  C.resolveModel=function(spec){ if(!spec||C.useModels===false) return spec; if(spec.model&&ASSETS.has(spec.model)) return spec; const cast=C.CAST[spec.id]; if(cast&&ASSETS.has(cast.model)) return Object.assign({},spec,cast); const sex=spec.sex==='f'?'f':'m'; const anon=typeof spec.id==='string'&&/^x\d+$/.test(spec.id); if(anon&&spec.anonKey&&ASSETS.has(spec.anonKey)) return Object.assign({},spec,{model:spec.anonKey,anonPick:true}); if(anon&&ANON_KEYS().length){ const k=C.anonPool.choose(spec.id,sex); if(k) return Object.assign({},spec,{model:k,anonPick:true}); }   /* 無名路人：池子裡分到的底模（還沒下載完＝先藏起來，到了再換上）*/
    const list=AMB[sex].filter(k=>ASSETS.has(k)); if(!list.length) return spec; const key=spec.ambientModel&&ASSETS.has(spec.ambientModel)?spec.ambientModel:list[hashId(spec.id||spec.name||'x')%list.length]; const o=spec.outfit||{}; const tint={hair:spec.hair&&spec.hair.color,top:o.top&&o.top.color,bottom:o.bottom&&o.bottom.color}; return Object.assign({},spec,{model:key,tint}); };
  C.failures=[];
  // 人物「想要」的正式模型：spec.model，或主要角色在 CAST 的模型；路人沒有（用路人底模）
  C.wantModel=function(spec){ if(!spec||C.useModels===false) return null; if(spec.model&&ASSETS.manifest[spec.model]) return spec.model; const c=C.CAST[spec.id]; return c?c.model:null; };
  // 建立時記下原本的 spec、想要的模型、建立時自己有哪些子物件（之後外面掛上去的，例如腳踏車，換模型時要搬過去）
  C.build=function(spec){ const h=buildOne(spec); const u=h.userData; u.buildSpec=spec; u.wantModel=C.wantModel(spec); u.ownKids=new Set(h.children);
    /* 不准退化成醜模型（使用者 2026-10-17）：正式模型還沒到時建出來的備用人物（程序化方塊人、主要角色借用的路人底模、主角的開發用模型）先整個隱藏，
       模型到了由 upgradeModels 原地換成正式的（新的一開始就看得到）。設定裡關掉人物模型（useModels false）時照舊顯示程序化人物 */
    if(C.isDegraded(h)){ u.degradedHidden=true; for(const c of h.children) c.visible=false; }
    return h; };
  C.isDegraded=function(h){ const u=h&&h.userData; if(!u||C.useModels===false||C.hideDegraded===false) return false; if(u.driver==='proc') return true; const got=u.driver==='vrm'?u.key:(u.spec&&u.spec.model); return !!(u.wantModel&&got!==u.wantModel); };
  // 晚到的正式模型（2026-10-10 線上實玩：手機網速慢，VRM 30 秒內沒下載完 → 主角、NPC 用程序化備用人物，而且下載完也不會換回來）：
  // 需要換的情況＝現在是程序化備用人物、但正式模型已經可以用；或主要角色暫時借用了路人底模、自己的模型已經到了
  C.needsUpgrade=function(h){ const u=h&&h.userData; if(!u||!u.buildSpec||C.useModels===false) return false; if(u.driver!=='proc'&&u.driver!=='vrm'&&!(u.driver==='glb'&&u.wantModel&&(u.spec&&u.spec.model)!==u.wantModel)) return false; if(u.driver==='vrm'&&(!u.wantModel||u.key===u.wantModel)) return false; if(u.driver==='glb'){ const r=C.resolveModel(u.buildSpec); return C.canVRM(r)&&r.model===u.wantModel; }   /* 主角的開發用模型（GLB 備用）：正式 VRM 到了也要換 */
    const r=C.resolveModel(u.buildSpec); if(!C.canVRM(r)) return false; if(u.driver==='proc') return true; return !!(u.wantModel&&u.key!==u.wantModel&&r.model===u.wantModel); };
  // 用同一個 spec 重新建立，放在原本的位置（位置、朝向、姿勢、表情、配件開關、外面掛上去的東西都帶過去），舊的釋放。回傳新的（失敗回 null，舊的不動）
  C.upgrade=function(h){ const u=h.userData; let nh; try{ nh=C.build(u.buildSpec); }catch(e){ console.warn('model upgrade failed',e); return null; } if(nh.userData.driver==='proc'){ return null; }
    nh.position.copy(h.position); nh.rotation.copy(h.rotation); nh.scale.copy(h.scale); nh.visible=h.visible;   /* 用 Euler 複製，不要 quaternion.copy（2026-10-18 使用者「人走路會往後走、往左後方走，動作是往前走」）：朝向超過 ±90° 時四元數換回 Euler 會變成 (π, π−y, π)，引擎之後只改 rotation.y，看起來的方向變成 π−y（往後、斜後方走）*/
    for(const c of [...h.children]) if(!u.ownKids||!u.ownKids.has(c)) nh.add(c);
    const a=u.anim, na=nh.userData.anim; if(a&&na&&a.pose) na.pose=a.pose; if(a&&a.expr&&a.expr!=='normal') C.setExpr(nh,a.expr);
    if(u.propOn) for(const k in u.propOn) C.setProp(nh,k,u.propOn[k]);
    if(u.readItem) nh.userData.readItem=u.readItem;   /* 手上拿的是手機、平板（SEAT-ACTIVITY-1104）：換成正式模型以後照樣 */
    if(u.sitChat) nh.userData.sitChat=u.sitChat;   /* 同桌聊天的那一組（NPC-AMBIENT-ANIM-1104）：換模型以後照樣輪流說話 */
    if(u.sitFocus) nh.userData.sitFocus=u.sitFocus;   /* 看著桌上的筆電、筆記（SEATACT 標的）*/
    if(u.sitTask) nh.userData.sitTask=u.sitTask;   /* 坐著做事的片段（NPC-ANIM-LOOPS-1104）：接著做；配件在新的骨頭上再掛一份（第一格），女生／男生照新的骨架重算（SEATACT 下一次會再對）*/
    if(u.amb){ nh.userData.amb=u.amb; nh.userData.ambWasStatic=u.ambWasStatic; }   /* 坐著的動作接著做（循環的相位、小動作、坐姿；沒有對模型的資料，換模型沒關係）*/
    if(u.gymWear){ C.setGymWear(nh,true); nh.userData.gymBp=u.gymBp; }   /* 健身運動服（GYM-FIT-1107 ③）：換成正式模型時照樣穿著；脫下時後背包照穿之前的狀態 */
    const p=h.parent; if(p){ p.add(nh); p.remove(h); } C.release(h); return nh; };
  function buildOne(spec){ spec=C.resolveModel(spec); if(C.canVRM(spec)){ try{ return buildVRM(spec); }catch(e){ console.error('VRM character failed, fallback',spec&&spec.model,e); C.failures.push((spec&&spec.model)+': '+e.message); } } else if(spec&&spec.model&&!spec.anonPick&&ASSETS.manifest[spec.model]&&ASSETS.manifest[spec.model].type==='vrm'&&!ASSETS.manifest[spec.model].lazy){ C.failures.push(spec.model+': not loaded'); }   /* 路人底模還在背景下載：不算失敗；lazy 的（用到才下載）還沒下載也不算（BB-B 11-07 20:0x：標題畫面背景 pool_14 開機就記一筆 char.npc_nm17: not loaded，之後換上了也不清）*/ if(C.canGLB(spec)){ try{ return buildGLB(spec); }catch(e){ console.warn('GLB character failed, fallback to procedural',e); } } if(spec.fallbackModel){ const s2=Object.assign({},spec,{model:spec.fallbackModel,fallbackModel:null}); if(C.canGLB(s2)){ try{ return buildGLB(s2); }catch(e){ console.warn('fallback GLB failed',e); } } } const o=P3.build(spec); o.userData.driver='proc'; o.userData.placeholder=true; return o; };
  function buildGLB(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const tpl=ASSETS.getRaw(key); const model=THREE_JSM.SkeletonUtils.clone(tpl.scene); const hide=m.hide||[]; let headMesh=null; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=true; o.receiveShadow=false; o.frustumCulled=false; presetSphere(o); if(hide.some(h=>o.name.includes(h))) o.visible=false; if(o.morphTargetDictionary&&o.morphTargetDictionary.mouthSmile!==undefined) headMesh=o; } });
    const root=new THREE.Group(); root.name='human'; const H=spec.height||m.height||1.75; const box=new THREE.Box3().setFromObject(model); const mh=box.max.y-box.min.y; const s=H/Math.max(0.1,mh); model.scale.setScalar(s); model.position.y=-box.min.y*s; model.userData.baseY=model.position.y; root.add(model);
    const bones={}; model.traverse(o=>{ if(o.isBone) bones[o.name]=o; }); const clips=clipsFor(key); const mixer=new THREE.AnimationMixer(model); const actions={}; for(const n in clips){ actions[n]=mixer.clipAction(clips[n]); actions[n].enabled=true; }
    root.userData={driver:'glb',spec,k:H/1.75,parts:{},model,bones,headMesh,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    return root; }
  // ---- 動畫 ----
  /* VRM humanoid 骨頭名稱 → Mixamo 相容骨架（GLB driver 的 readIK 用）*/
  const GLB_BONE={hips:'Hips',head:'Head',leftEye:'LeftEye',rightEye:'RightEye',leftUpperLeg:'LeftUpLeg',rightUpperLeg:'RightUpLeg'};
  for(const [s,S] of [['left','Left'],['right','Right']]){ Object.assign(GLB_BONE,{[s+'UpperArm']:S+'Arm',[s+'LowerArm']:S+'ForeArm',[s+'Hand']:S+'Hand'}); for(const [f,F] of [['Index','Index'],['Middle','Middle'],['Ring','Ring'],['Little','Pinky']]) ['Proximal','Intermediate','Distal'].forEach((j,i)=>{ GLB_BONE[s+f+j]=S+'Hand'+F+(i+1); }); }
  const SIT={LeftUpLeg:[1.45,0,0.08],RightUpLeg:[1.45,0,-0.08],LeftLeg:[1.5,0,0],RightLeg:[1.5,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[0.9,0,0.35],RightArm:[0.9,0,-0.35],LeftForeArm:[0,0,0],RightForeArm:[0,0,0]};
  const READ={LeftArm:[1.2,0,0.9],RightArm:[1.2,0,-0.9],LeftForeArm:[0,0,1.2],RightForeArm:[0,0,-1.2]};
  function setBones(bones,tab,blend){ for(const n in tab){ const b=bones[n]; if(!b) continue; const r=tab[n]; if(blend>=1){ b.rotation.set(r[0],r[1],r[2]); } else { b.rotation.x+=(r[0]-b.rotation.x)*blend; b.rotation.y+=(r[1]-b.rotation.y)*blend; b.rotation.z+=(r[2]-b.rotation.z)*blend; } } }
  C.animate=function(h,dt,st){ const u=h.userData; if(u.driver==='vrm'){ animateVRM(h,dt,st); return; } if(st&&GYM_FALL[st.pose]) st=Object.assign({},st,{pose:GYM_FALL[st.pose]});   /* 備用人物（GLB、程序化）沒有健身房的動作：坐著的照坐下、站著的照站著 */ if(u.driver!=='glb'){ P3.animate(h,dt,st.pose==='lie'||st.pose==='kneel'||st.pose==='climb'||st.pose==='climbdown'?Object.assign({},st,{pose:st.pose==='lie'||st.pose==='kneel'?'idle':'walk'}):st); return; } const a=u.anim; a.t+=dt; const lie=st.pose==='lie', pose=lie||st.pose==='kneel'?'idle':(st.pose==='climb'||st.pose==='climbdown'?'walk':(st.pose||'idle')); const B=u.bones; const spd=st.speed||0; u.model.rotation.x=lie?-Math.PI/2:0;   /* 備用 GLB 人物：躺＝站姿轉 −90°、爬梯子＝走路（DORM-SLEEP-1030）*/
    if(pose==='sit'||pose==='read'){ if(!a.static){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.cur=null; } u.model.position.y=(u.model.userData.baseY||0)-sitDrop(u); setBones(B,SIT,1); if(pose==='read'){ setBones(B,READ,1); if(B.Head) B.Head.rotation.set(0.35+Math.sin(a.t*0.6)*0.02,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06,0,0); if(B.Spine1) B.Spine1.rotation.set(0,0,0); }   /* 同上：注視在胸口加轉角，坐姿要每一幀重設 */
    else { if(a.static){ a.static=false; u.model.position.y=u.model.userData.baseY||0; for(const n in B){ B[n].rotation.set(0,0,0); } } const clipName=POSE_CLIP[pose]||'idle'; if(a.cur!==clipName&&a.actions[clipName]){ const prev=a.cur&&a.actions[a.cur]; const next=a.actions[clipName]; next.reset().setEffectiveWeight(1).fadeIn(0.22).play(); if(prev) prev.fadeOut(0.22); a.cur=clipName; } const act=a.actions[a.cur]; if(act){ act.timeScale= a.cur==='walk'?Math.max(0.6,spd/1.45): (a.cur==='run'?Math.max(0.7,spd/4.1):1); } a.mixer.update(dt);
      if(pose==='wave'&&B.RightArm){ const g=Math.sin(a.t*7); B.RightArm.rotation.set(-0.2,0,-2.4+g*0.15); if(B.RightForeArm) B.RightForeArm.rotation.set(0.1,0,-0.5-Math.abs(g)*0.3); if(B.Head) B.Head.rotation.z+=0.08; }
      if(pose==='talk'&&B.Head){ B.Head.rotation.x+=Math.sin(a.t*1.4)*0.05; B.Head.rotation.y+=Math.sin(a.t*0.8)*0.08; if(B.RightArm){ const g=Math.sin(a.t*2.2); B.RightArm.rotation.z-=0.35+g*0.1; if(B.RightForeArm) B.RightForeArm.rotation.z-=0.9+g*0.15; } } }
    // 注視
    if(st.lookAt&&B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.8; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; }
    // 讀書：手上那本打開的書（readIK，和 VRM 同一套；骨頭名稱照 Mixamo）
    u.readOn=pose==='read'&&C.readIK; readVis(u); if(u.readOn) readIK(h,u,u.glbGet||(u.glbGet=n=>B[GLB_BONE[n]]||null));
    // 嘴型（說話時）與表情
    if(u.headMesh){ const d=u.headMesh.morphTargetDictionary, inf=u.headMesh.morphTargetInfluences; if(d.mouthOpen!==undefined){ const target=pose==='talk'?(0.15+Math.abs(Math.sin(a.t*9))*0.35):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); inf[d.mouthOpen]=a.mouth; } } };
  C.setExpr=function(h,expr){ const u=h.userData; if(u.driver==='vrm'){ C.setExprVRM(h,expr); return; } if(u.driver!=='glb'){ P3.setExpr(h,expr); return; } u.anim.expr=expr; const hm=u.headMesh; if(!hm) return; const d=hm.morphTargetDictionary, inf=hm.morphTargetInfluences; if(d.mouthSmile!==undefined) inf[d.mouthSmile]=(expr==='smile'?0.55:(expr==='laugh'?0.9:(expr==='shy'?0.3:0))); };
  // 頭部高度（運鏡用）
  C.headY=function(h){ const u=h.userData; const k=u.k||1; const a=u.anim; const sit=a&&(a.pose==='sit'||a.pose==='read'); if(u.driver==='vrm'){ if(u.anim.staticKind==='lie') return 0.2*k; return (u.anim.static?u.headY-sitDrop(u):u.headY); }   /* 躺著：頭只比 root（床墊）高一點（運鏡 headOf 用）*/ if(u.driver==='glb'){ const st=(u.anim.static); return (st?1.16:1.62)*k; } return (sit?1.19:1.62)*k; };
  C.isGLB=function(h){ return h&&h.userData&&(h.userData.driver==='glb'||h.userData.driver==='vrm'); };
  return C;
})();
