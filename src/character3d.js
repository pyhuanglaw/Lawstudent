/* ===== 人物層（CHARACTER LAYER）
   gameplay / engine 只呼叫 CHAR.build / CHAR.animate / CHAR.setExpr / CHAR.headY。
   driver 'glb'：rigged GLB（Mixamo 相容骨架，例如 Ready Player Me）＋ Mixamo 動畫（rest-pose 補償重定向）
   driver 'proc'：P3 程序化人物（PLACEHOLDER_CHARACTER） ===== */
'use strict';
const CHAR = (function(){
  const C={};
  const POSE_CLIP={idle:'idle',walk:'walk',run:'run',talk:'idle',wave:'idle',sit:null,read:null,ride:null,climb:'walk',climbdown:'walk',lie:null};   /* climb：爬宿舍上舖的梯子（走路片段＋手往前抓，CLIMB_VRM）；climbdown：從梯子下來（走路片段）；lie：躺在床上（靜態，LIE_VRM）——DORM-SLEEP-1030 */
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
  /* 爬梯子（climb）：走路片段跑完以後，兩隻手往前上方抓梯子／床欄（疊加姿勢，和 u.overlay 同一套：x、z 乘 sx），手肘彎一點 */
  const CLIMB_VRM={k:1,bones:{LeftArm:[0,-1.4,0.1],RightArm:[0,1.4,-0.1],LeftForeArm:[0,-0.5,0],RightForeArm:[0,0.5,0]}};
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
  function attachFar(key,model){ const c=typeof ASSETS!=='undefined'&&ASSETS.cache&&ASSETS.cache[key], L=c&&c.lod; if(!L) return null;
    const bones={}, inv={}; let ref=null; model.traverse(o=>{ if(o.isBone&&!bones[o.name]) bones[o.name]=o; if(o.isSkinnedMesh&&o.skeleton){ if(!ref) ref=o; o.skeleton.bones.forEach((b,i)=>{ if(!inv[b.name]) inv[b.name]=o.skeleton.boneInverses[i]; }); } });
    if(!ref||!ref.parent||L.names.some(n=>!bones[n])) return null; farMats(L,model);
    const near=[]; model.traverse(o=>{ if(o.isSkinnedMesh&&o.visible) near.push(o); });   /* 原本的網格（配件是一般網格，不在這裡：遠處照樣看得到）*/
    const parts=L.parts.map(p=>{ const sm=new THREE.SkinnedMesh(p.geo,p.toon); sm.name='npc_far'; sm.frustumCulled=false; sm.castShadow=false; sm.receiveShadow=false; sm.visible=false;
      sm.position.copy(ref.position); sm.quaternion.copy(ref.quaternion); sm.scale.copy(ref.scale);   /* 和原本的網格同一個父節點、同一個變換＝同一個綁定空間 */
      sm.bind(new THREE.Skeleton(L.names.map(n=>bones[n]),L.names.map((n,i)=>(inv[n]||L.ibm[i]).clone())),ref.bindMatrix.clone()); sm.bindMode=ref.bindMode; ref.parent.add(sm); return sm; });
    return {parts,near}; }
  C.setFar=function(h,far){ const u=h&&h.userData, f=u&&u.farLOD; if(!f) return false; far=!!far&&!C.farOff; if(!!u.isFar===far) return true; u.isFar=far; for(const o of f.near) o.visible=!far; for(const p of f.parts) p.visible=far; if(!far){ const sbm=u.vrm&&!u.vrm.lite&&u.vrm.springBoneManager; if(sbm) try{ sbm.reset(); }catch(e){} } return true; };   /* 切回近的：彈簧骨從靜止的樣子重新開始（遠的時候沒有跑，留著舊的狀態會甩一下）*/
  function buildVRM(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const e=ASSETS.acquireVRM(key); if(!e) throw new Error('no free VRM instance'); const vrm=e.vrm; const model=vrm.scene; const hide=m.hide||[]; const realShadow=!m.ambient; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=realShadow&&!FACE_PART.test((o.material&&o.material.name)||''); o.receiveShadow=false; o.frustumCulled=false; if(hide.some(h=>o.name===h||o.name.startsWith(h))) o.visible=false; } }); /* 衣服材質整體壓暗一點：MToon 的卡通明暗讓受光面拿到整個太陽亮度（不乘入射角），中午的淺色衣服（米白、淺灰）會曝成全白、看不出顏色。只動 _CLOTH 材質（皮膚、臉、頭髮、眼睛不動）；材質在 pool 裡共用，用 userData 記號避免重複壓暗 */ model.traverse(o=>{ if(!o.isMesh) return; for(const mt of (Array.isArray(o.material)?o.material:[o.material])){ if(!mt||!mt.name||mt.userData.clothK||!/_CLOTH/.test(mt.name)) continue; mt.userData.clothK=C.CLOTH_K; if(mt.color) mt.color.multiplyScalar(C.CLOTH_K); if(mt.shadeColorFactor) mt.shadeColorFactor.multiplyScalar(C.CLOTH_K); } });
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
    root.userData={driver:'vrm',spec,k:H/1.75,parts:{},model:wrap,vrm,key,v0,sx,tinted,props,full:!!e.full,armOut:(+e.armOut||0)*Math.PI/180,armBack:+e.armBack||0,armFwd:+e.armFwd||0,bones:B,look,headY,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0,blink:2+Math.random()*3,blinkT:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    // 彈簧骨（頭髮、馬尾）在人物自己的座標系模擬：瞬移、換區域、坐下起身時頭髮不會被甩飛（要在 root.userData 設定之後：three-vrm 把反矩陣快取放在 center.userData）
    /* 裙子的輔助骨頭（VRM 節點的 extras.drive；PS-SKIRT-LEG，LAWWW2 2026-10-22）：沛珊長裙前片中間的「第三條腿」skirt_F／skirt_F_lo＝兩條腿（真實骨架）相對靜止姿勢的旋轉做 slerp，
       偏向往前抬的那一條：t＝0.5＋(max−0.5)·tanh(dir·(抬起角度差)／sig)；後片 skirt_BL／BR（_lo）＝同一側的腿，只在腿往後時才轉（gate；坐下、腿往前時不轉，和原本一樣）。權重在 VRM 裡（tools/blender/char_second/peishan_skirt_bones.py）；沒有這種節點的模型不受影響 */
    { const hu=vrm.humanoid, raw=n=>hu.getRawBoneNode(n), hp=raw('hips'), drv=[]; if(hp){ model.updateMatrixWorld(true); const hq=hp.getWorldQuaternion(new THREE.Quaternion()).invert(), dn=new THREE.Vector3(0,-1,0).applyQuaternion(hq), fw=new THREE.Vector3(0,0,1).applyQuaternion(hq), i0=b=>b.quaternion.clone().invert();
      model.traverse(o=>{ const d=o.userData&&o.userData.drive; if(!d||!d.from) return; const lf=d.lift||d.from, A=raw(d.from[0]), Bb=d.from[1]?raw(d.from[1]):null, LA=raw(lf[0]), LB=lf[1]?raw(lf[1]):null; if(!A||!LA||(d.from[1]&&!Bb)||(lf[1]&&!LB)) return;
        const ch=d.net&&d.net.map(raw); if(d.net&&(!ch[0]||(d.from[1]&&!ch[1]))) return;
        drv.push({o,A,B:Bb,LA,LB,A0:i0(A),B0:Bb&&i0(Bb),LA0:i0(LA),LB0:LB&&i0(LB),CA:ch&&ch[0],CB:ch&&ch[1],CA0:ch&&i0(ch[0]),CB0:ch&&ch[1]&&i0(ch[1]),dn,fw,dir:d.dir||1,max:d.max==null?0.85:+d.max,sig:+d.sig||0.3,gate:Array.isArray(d.gate)&&d.gate.length===4?d.gate.map(Number):null}); }); }
      if(drv.length) root.userData.drive=drv; }
    const sbm=vrm.springBoneManager; if(sbm){ try{ sbm.reset(); sbm.joints.forEach(j=>{ j.center=root; }); root.updateMatrixWorld(true); sbm.setInitState(); }catch(err){ console.warn('spring bone center',err); } }
    root.userData.farLOD=attachFar(key,model);   /* 無名路人的遠距離版本（有的話；預設藏著）*/
    return root; }
  C.MODEL_PROPS={'char.classmate_bohan':[{name:'glasses',glb:'prop.glasses_bohan'},'backpack'],'char.classmate_peishan':[{name:'glasses',glb:'prop.glasses_peishan'}],'char.prof_wei':[{name:'glasses',glb:'prop.glasses_wei'}],'char.econ_weilun':['backpack',{name:'helmet',hang:'side'}],'char.econ_jiahao':['foodmap'],'char.econ_pinyu':['thermos'],'char.yu':['bag_yu'],   /* 許柏翰（?blchar）：方框眼鏡＋後背包（LAWWW2 VISUAL_REVIEW 32.4 的設定）*/
    'char.yuting':['backpack'],'char.heroine_01':['tote'],'char.heroine_02':['glasses','earrings','apron'],'char.heroine_03':[{name:'backpack',drop:-0.07,flat:[0.04,0.008],strap:[[0.075,0.05,0.086],[0.092,0.096,0.05],[0.1,0.117,0.0],[0.103,0.097,-0.03],[0.106,0.072,-0.062],[0.11,0.04,-0.086],[0.118,0.0,-0.112],[0.13,-0.045,-0.1],[0.145,-0.085,-0.055],[0.142,-0.115,0.0],[0.13,-0.2,0.06],[0.12,-0.27,0.09]]}],'char.heroine_04':[{name:'guitar',x:0.0,z:0.235,tilt:-0.05,flat:[0.042,0.008],straps:[[0.07,0.06,0.15],[0.1,0.128,0.075],[0.105,0.146,0.03],[0.105,0.136,0.0],[0.105,0.126,-0.03],[0.105,0.094,-0.062],[0.107,0.06,-0.088],[0.108,0.02,-0.12],[0.112,-0.04,-0.132],[0.13,-0.09,-0.127],[0.155,-0.13,-0.085],[0.172,-0.17,-0.02],[0.162,-0.25,0.07],[0.12,-0.33,0.15]]}],'char.heroine_05':['folder','hairtie']};
  // 切換配件（例：林芷若在 Café 工作時才穿圍裙）
  C.setProp=function(h,name,on){ const u=h&&h.userData; const o=u&&u.props&&u.props[name]; if(!o) return false; o.visible=!!on; (u.propOn=u.propOn||{})[name]=!!on; return true; };
  /* 身上帶著的東西（包、吉他、資料夾、圍裙、安全帽…；眼鏡、耳環、髮圈不算）先拿下來，回傳還原的函式（BADCLIP-BAG-1027：使用者 10-27 22:4x「打羽球男主角還背著背包什麼意思」）。
     還原照原本的開關：原本沒設過的（propOn 沒有這一項）拿掉設定、照原本看不看得到；還原時傳現在的人物（中途換過模型 C.upgrade 的話是新的那一個）*/
  C.CARRY=['backpack','tote','guitar','bag_yu','folder','apron','helmet','foodmap','thermos','camera_film','thermos_silver','sports_drink','recorder','cooler_bag','novel','notebook_q','handouts','audio_cable','ladle','mug','lawbook'];   /* 後面十二個：同學、標籤同伴的隨身道具（NPC-POOL-ART-1028、HEROINE-LIFE-NPC3D-1028）*/
  C.carryOff=function(h){ const u=h&&h.userData; if(!u||!u.props) return ()=>{}; const was=[];
    for(const k of C.CARRY){ const o=u.props[k]; if(!o) continue; const on=u.propOn&&Object.prototype.hasOwnProperty.call(u.propOn,k)?u.propOn[k]:undefined; was.push([k,on,o.visible]); C.setProp(h,k,false); }
    return h2=>{ const x=h2||h, v=x&&x.userData; if(!v) return; for(const [k,on,vis] of was){ if(on!==undefined){ C.setProp(x,k,on); continue; } if(v.propOn) delete v.propOn[k]; const o=v.props&&v.props[k]; if(o) o.visible=vis; } }; };
  /* 祐廷的經濟系系外套（X140 SK02-LINE-JACKET-1030，LAWWW2-B）：VRM 裡的 JACKET_ECON 網格（同一副骨架；manifest 的 hide 讓每次建模型都先藏起來）。
     穿上時後背包往外放 10%、往上 1.2 cm：外套比上衣厚 1.3 cm，背帶原本的位置會陷進肩膀。什麼時候穿由劇情決定；每次重建人物模型後要再呼叫一次（buildVRM 會重新藏）*/
  C.setJacket=function(h,on){ const u=h&&h.userData; if(!u||u.driver!=='vrm'||!u.model) return false; let n=0; u.model.traverse(o=>{ if(o.name==='JACKET_ECON'){ o.visible=!!on; n++; } }); if(!n) return false; u.jacket=!!on;
    const bp=u.props&&u.props.backpack; if(bp){ if(bp.userData.jk0==null) bp.userData.jk0=bp.position.y; bp.scale.set(on?1.1:1,1,on?1.1:1); bp.position.y=bp.userData.jk0+(on?0.012:0); } return true; };
  C.release=function(h){ const u=h&&h.userData; if(!u||u.driver!=='vrm') return; try{ if(u.farLOD){ for(const p of u.farLOD.parts){ if(p.parent) p.parent.remove(p); p.skeleton.dispose(); } if(u.isFar) for(const o of u.farLOD.near) o.visible=true; u.farLOD=null; u.isFar=false; }   /* 遠距離版本：拿掉、骨架貼圖放掉；原本的網格恢復顯示（第一個實例會被下一個人重用）*/ if(u.props&&typeof PROPS!=='undefined') PROPS.detach(u.props); u.props=null; const sbm=u.vrm.springBoneManager; if(sbm) sbm.joints.forEach(j=>{ j.center=null; }); }catch(e){} try{ for(const n in u.anim.actions) u.anim.actions[n].stop(); u.anim.mixer.stopAllAction(); u.vrm.humanoid.resetNormalizedPose(); if(u.vrm.expressionManager) u.vrm.expressionManager.expressions.forEach(ex=>u.vrm.expressionManager.setValue(ex.expressionName,0)); for(const t of (u.tinted||[])){ const cur=Array.isArray(t.mesh.material)?t.mesh.material:[t.mesh.material]; const orig=Array.isArray(t.orig)?t.orig:[t.orig]; cur.forEach((mt,i)=>{ if(mt!==orig[i]){ C.rimMats.delete(mt); if(mt.dispose) mt.dispose(); } }); t.mesh.material=t.orig; } u.tinted=[]; }catch(e){} ASSETS.releaseVRM(u.key,u.vrm); };
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
  const RA={}, SFV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  function sitFeet(h,u){ const hm=u.vrm.humanoid; const B=u.rawLegs||(u.rawLegs=(()=>{ const o={}; for(const L of LEGS) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(LEGS.some(L=>L.slice(0,3).some(n=>!B[n]))) return;
    const gy=h.getWorldPosition(SFV[0]).y, key=u.key||'_';
    if(!(u.anim&&u.anim.static)){   // 站著（不是坐姿）：記下腳踝離地的高度
      if(u.anim&&u.anim.cur==='idle'&&!u.ikDrop){ h.updateWorldMatrix(true,true); const a=Math.min(B.leftFoot.getWorldPosition(SFV[1]).y,B.rightFoot.getWorldPosition(SFV[2]).y)-gy; if(a>0.02&&a<0.2) RA[key]=RA[key]?Math.min(RA[key],a):a; }
      return; }
    if(u.sitFeet===false||u.ride||u.anim.staticKind==='lie') return;     // 躺著不調腳；騎車：腳在踏板上（rideIK）。階梯教室的座位（有平台高度、前面是桌子）：腳往前伸會從桌子下面、平台邊緣突出來，維持原樣（GAME.sitAt 設定）
    const ra=RA[key]||0.085*(u.k||1); h.updateWorldMatrix(true,true);
    for(const [a,b,c] of LEGS){ const hip=B[a].getWorldPosition(SFV[1]), knee=B[b].getWorldPosition(SFV[2]), ank=B[c].getWorldPosition(SFV[3]);
      const target=gy+ra; if(ank.y>=target-0.003) continue;
      B[c].getWorldQuaternion(IKQ[3]);   // 腳掌原本的方向
      { // 1. 大腿往上抬（最多抬到水平以上 17°），膝蓋同時反轉同樣的角度：小腿的方向不變、整段往上移（試過只補 85%：剩下 2 cm 要靠小腿斜 19° 才補得到——接近垂直時小腿要轉很多角度才抬得高一點）
        const tv=SFV[4].copy(knee).sub(hip), Lt=tv.length();
        if(Lt>1e-3){ const e0=Math.asin(Math.max(-1,Math.min(1,tv.y/Lt))), need=target-ank.y;
          const e1=Math.min(0.30,Math.asin(Math.max(-1,Math.min(1,(tv.y+need)/Lt)))), al=e1-e0;
          const ax=new THREE.Vector3().crossVectors(tv,new THREE.Vector3(0,1,0));
          if(al>1e-4&&ax.lengthSq()>1e-10){ ax.normalize(); rotWorld(B[a],ax,al); rotWorld(B[b],ax,-al);
            B[b].getWorldPosition(knee); B[c].getWorldPosition(ank); } } }
      const L=knee.distanceTo(ank); if(L<1e-3) continue;
      const ry=h.rotation.y, fwd=(ank.x-knee.x)*Math.sin(ry)+(ank.z-knee.z)*Math.cos(ry);   // 小腿往前（＋）還是往後（－）斜：坐姿的小腿本來略往後
      const ph0=Math.sign(fwd||1)*Math.acos(Math.max(-1,Math.min(1,(knee.y-ank.y)/L))), ph1=Math.acos(Math.max(0.17,Math.min(1,(knee.y-target)/L)));   // 最多往前伸到離垂直 80°
      const d=ph1-ph0;
      if(d>1e-4){ B[a].getWorldPosition(hip); const u1=SFV[4].copy(hip).sub(knee), v1=new THREE.Vector3().copy(ank).sub(knee), n=new THREE.Vector3().crossVectors(u1,v1);
        if(n.lengthSq()>1e-10){ n.normalize(); rotWorld(B[b],n,d); } }   // 2. 還差的部分：小腿往前伸（膝蓋角度變大）
      B[c].parent.getWorldQuaternion(IKQ[0]); B[c].quaternion.copy(IKQ[0].invert().multiply(IKQ[3])); B[c].updateWorldMatrix(false,true); } }
  /* 跪坐的高度：膝蓋、腳踝、腳趾（骨頭在腿的中間）最低的那一個放在坐墊頂＋5 cm（腿的半徑）。animateVRM 每一幀把高度重設成椅子的坐姿，這裡再往下移，不會累加 */
  function sitFloorFit(h,u){ if(!u.sitFloor||!(u.anim&&u.anim.static&&u.anim.staticKind==='sit')||u.ride) return; const hm=u.vrm.humanoid; const B=u.rawLegs||(u.rawLegs=(()=>{ const o={}; for(const L of LEGS) for(const n of L) o[n]=hm.getRawBoneNode(n); return o; })());
    if(LEGS.some(L=>L.slice(0,3).some(n=>!B[n]))) return; h.updateWorldMatrix(true,true); const gy=h.getWorldPosition(SFV[0]).y; let lo=Infinity;
    for(const L of LEGS) for(const n of L){ if(!B[n]||n===L[0]) continue; lo=Math.min(lo,B[n].getWorldPosition(SFV[1]).y); }
    if(!isFinite(lo)) return; const sc=h.getWorldScale(SFV[2]).y||1; u.model.position.y+=(gy+u.sitFloor+0.05-lo)/sc; u.model.updateWorldMatrix(false,true); }
  function animateVRM(h,dt,st){ const u=h.userData; const a=u.anim; a.t+=dt; const pose=st.pose||'idle'; const B=u.bones; const spd=st.speed||0; const vrm=u.vrm; const sx=u.sx||1;
    if(u.props){ const sitting=pose==='sit'||pose==='read', lying=pose==='lie'; for(const k in u.props){ const d=typeof PROPS!=='undefined'&&PROPS.DEF[k]; const o=u.props[k]; if(!o) continue; if(d&&d.sit==='only'){ o.visible=sitting&&!!(u.propOn&&u.propOn[k]===true); continue; } if(!(k==='backpack'||k==='guitar'||k==='bag_yu'||(d&&d.sit==='hide'))) continue; o.visible=!sitting&&!lying&&!(u.propOn&&u.propOn[k]===false); } }   /* 躺在床上也藏（後背包，DORM-SLEEP-1030）*/   /* 坐下時藏：後背包、吉他、側背包＋PROPS.DEF 的 sit:'hide'（垂著拿的東西）；sit:'only'＝坐下而且開了才看得到（NPC-POOL-ART-1028）*/
    u.ride=pose==='ride'?(st.ride||{crank:0}):null;
    if(pose!=='lie'&&u.model.rotation.x!==0) u.model.rotation.x=0;   /* 從躺姿起來：整個人轉回直立（DORM-SLEEP-1030）*/
    if(pose==='ride'){ if(!a.static||a.staticKind!=='ride'){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='ride'; a.cur=null; vrm.humanoid.resetNormalizedPose(); } u.ikDrop=0; u.ikSt=null; setBonesV(B,RIDE_VRM,sx); if(B.Head) B.Head.rotation.set(-0.22*sx,0,0); }   /* 頭往上抬，看前面的路（胸口、頭每一幀都由表重設，下面的注視「加」轉角不會累加）*/   /* 騎車：人物的高度、前後位置在 rideIK 依髖關節對座墊 */
    else if(pose==='sit'||pose==='read'){ if(!a.static||a.staticKind!=='sit'){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.staticKind='sit'; a.cur=null; vrm.humanoid.resetNormalizedPose(); } u.ikDrop=0; u.ikSt=null; u.model.position.y=(u.model.userData.baseY||0)-0.47*u.k; u.model.position.z=0; setBonesV(B,SIT_VRM,sx); if(u.sitFloor) setBonesV(B,SEIZA_VRM,sx); if(pose==='read'){ setBonesV(B,READ_VRM,sx); if(B.Head) B.Head.rotation.set((0.35+Math.sin(a.t*0.6)*0.02)*sx,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03*sx,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06*sx,0,0); if(B.Spine1) B.Spine1.rotation.set(0,0,0); }   /* 胸口每一幀也要重設：下面的注視是在胸口「加」轉角，坐姿沒有動畫把骨頭蓋回去，不重設就會一直累加、整個上半身在椅子上轉圈（使用者 2026-10-11 回報，tests/seated_look_unit.js）*/
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
      if(pose==='climb'){ for(const n in CLIMB_VRM.bones){ const bn=B[n]; if(!bn) continue; const r=CLIMB_VRM.bones[n]; OVE.set(r[0]*sx,r[1],r[2]*sx); OVQ.setFromEuler(OVE); bn.quaternion.copy(OVQ); } }   /* 爬梯子：手往前上方抓（CLIMB_VRM，和疊加姿勢同一套角度）*/
      if(u.overlay&&u.overlay.bones){ const o=u.overlay, k=o.k==null?1:Math.max(0,Math.min(1,o.k)); for(const n in o.bones){ const bn=B[n]; if(!bn) continue; const r=o.bones[n]; OVE.set(r[0]*sx,r[1],r[2]*sx); OVQ.setFromEuler(OVE); bn.quaternion.slerp(OVQ,k); } }   /* 疊加姿勢（羽球揮拍 BADMINTON-CLIP-1027，src/badminton_clip3d.js）：片段算完以後把幾根骨頭轉到指定角度（和 SIT_VRM 同一套角度：x、z 乘 sx），k＝比例；坐下、騎車不受影響 */
      if(u.posture||u.postQ){ const on=!(u.overlay&&u.overlay.bones)&&!!u.posture&&(pose==='idle'||pose==='walk'||pose==='run'||pose==='talk'), PQ=u.postQ||{};   /* 體態（D40 健身，src/fit3d.js 設 u.posture）：小角度疊在動作上（挺胸、肩膀往後）；坐、騎車、疊加姿勢（羽球、開門）的時候不加 */
        for(const n in PQ){ const bn=B[n], q=PQ[n]; if(bn&&bn.quaternion.equals(q.after)) bn.quaternion.multiply(q.inv); }   /* 這一格動畫沒蓋過的骨頭：先撤掉上一格加的（不然會一格一格累加）*/
        u.postQ=on?{}:null; if(on) for(const n in u.posture){ const bn=B[n]; if(!bn) continue; const r=u.posture[n]; OVE.set(r[0]*sx,r[1],r[2]*sx); const q=new THREE.Quaternion().setFromEuler(OVE); bn.quaternion.multiply(q); u.postQ[n]={after:bn.quaternion.clone(),inv:q.invert()}; } }
      u.ikSt=st; }  // VRM 的前臂軸向和程序化人物不同，說話時不轉前臂（舊版會把手舉到頭上）
    // 注視（眼睛＋頭）
    if(st.lookAt){ const local=h.worldToLocal(new THREE.Vector3(st.lookAt.x,u.headY,st.lookAt.z)); u.look.position.copy(local); if(B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.6; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; } } else { u.look.position.set(0,u.headY,3); }
    if(pose==='lie'&&!st.lookAt) u.look.position.set(0,1.6,-1.4);   /* 躺著：眼睛看天花板（不是看腳那邊）*/
    // 表情：眨眼、嘴型
    const em=vrm.expressionManager; if(em){ a.blink-=dt; if(a.blink<=0){ a.blinkT=0.14; a.blink=2.5+Math.random()*3.5; } if(a.blinkT>0){ a.blinkT-=dt; em.setValue('blink',a.blinkT>0.07?1:(a.blinkT/0.07)); } else em.setValue('blink',0); if(u.eyesShut) em.setValue('blink',1);   /* 睡著（story3d.js 的睡覺流程設 h.userData.eyesShut）*/ const target=pose==='talk'?(0.08+Math.abs(Math.sin(a.t*9))*0.3):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); em.setValue('aa',a.mouth); }
    updateVRM(vrm,dt,()=>{ footIK(h,u,u.ikSt,dt); sitFeet(h,u); sitFloorFit(h,u); if(u.ride) rideIK(h,u); if(u.drive) skirtDrive(u.drive); },u.isFar); }
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
    const p=h.parent; if(p){ p.add(nh); p.remove(h); } C.release(h); return nh; };
  function buildOne(spec){ spec=C.resolveModel(spec); if(C.canVRM(spec)){ try{ return buildVRM(spec); }catch(e){ console.error('VRM character failed, fallback',spec&&spec.model,e); C.failures.push((spec&&spec.model)+': '+e.message); } } else if(spec&&spec.model&&!spec.anonPick&&ASSETS.manifest[spec.model]&&ASSETS.manifest[spec.model].type==='vrm'){ C.failures.push(spec.model+': not loaded'); }   /* 路人底模還在背景下載：不算失敗 */ if(C.canGLB(spec)){ try{ return buildGLB(spec); }catch(e){ console.warn('GLB character failed, fallback to procedural',e); } } if(spec.fallbackModel){ const s2=Object.assign({},spec,{model:spec.fallbackModel,fallbackModel:null}); if(C.canGLB(s2)){ try{ return buildGLB(s2); }catch(e){ console.warn('fallback GLB failed',e); } } } const o=P3.build(spec); o.userData.driver='proc'; o.userData.placeholder=true; return o; };
  function buildGLB(spec){ const key=spec.model; const m=ASSETS.manifest[key]; const tpl=ASSETS.getRaw(key); const model=THREE_JSM.SkeletonUtils.clone(tpl.scene); const hide=m.hide||[]; let headMesh=null; model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.castShadow=true; o.receiveShadow=false; o.frustumCulled=false; if(hide.some(h=>o.name.includes(h))) o.visible=false; if(o.morphTargetDictionary&&o.morphTargetDictionary.mouthSmile!==undefined) headMesh=o; } });
    const root=new THREE.Group(); root.name='human'; const H=spec.height||m.height||1.75; const box=new THREE.Box3().setFromObject(model); const mh=box.max.y-box.min.y; const s=H/Math.max(0.1,mh); model.scale.setScalar(s); model.position.y=-box.min.y*s; model.userData.baseY=model.position.y; root.add(model);
    const bones={}; model.traverse(o=>{ if(o.isBone) bones[o.name]=o; }); const clips=clipsFor(key); const mixer=new THREE.AnimationMixer(model); const actions={}; for(const n in clips){ actions[n]=mixer.clipAction(clips[n]); actions[n].enabled=true; }
    root.userData={driver:'glb',spec,k:H/1.75,parts:{},model,bones,headMesh,anim:{t:Math.random()*10,expr:'normal',pose:'idle',mixer,actions,cur:null,static:false,mouth:0}}; if(actions.idle){ actions.idle.play(); root.userData.anim.cur='idle'; }
    return root; }
  // ---- 動畫 ----
  const SIT={LeftUpLeg:[1.45,0,0.08],RightUpLeg:[1.45,0,-0.08],LeftLeg:[1.5,0,0],RightLeg:[1.5,0,0],LeftFoot:[0,0,0],RightFoot:[0,0,0],LeftArm:[0.9,0,0.35],RightArm:[0.9,0,-0.35],LeftForeArm:[0,0,0],RightForeArm:[0,0,0]};
  const READ={LeftArm:[1.2,0,0.9],RightArm:[1.2,0,-0.9],LeftForeArm:[0,0,1.2],RightForeArm:[0,0,-1.2]};
  function setBones(bones,tab,blend){ for(const n in tab){ const b=bones[n]; if(!b) continue; const r=tab[n]; if(blend>=1){ b.rotation.set(r[0],r[1],r[2]); } else { b.rotation.x+=(r[0]-b.rotation.x)*blend; b.rotation.y+=(r[1]-b.rotation.y)*blend; b.rotation.z+=(r[2]-b.rotation.z)*blend; } } }
  C.animate=function(h,dt,st){ const u=h.userData; if(u.driver==='vrm'){ animateVRM(h,dt,st); return; } if(u.driver!=='glb'){ P3.animate(h,dt,st.pose==='lie'||st.pose==='climb'||st.pose==='climbdown'?Object.assign({},st,{pose:st.pose==='lie'?'idle':'walk'}):st); return; } const a=u.anim; a.t+=dt; const lie=st.pose==='lie', pose=lie?'idle':(st.pose==='climb'||st.pose==='climbdown'?'walk':(st.pose||'idle')); const B=u.bones; const spd=st.speed||0; u.model.rotation.x=lie?-Math.PI/2:0;   /* 備用 GLB 人物：躺＝站姿轉 −90°、爬梯子＝走路（DORM-SLEEP-1030）*/
    if(pose==='sit'||pose==='read'){ if(!a.static){ for(const n in a.actions) a.actions[n].stop(); a.static=true; a.cur=null; } u.model.position.y=(u.model.userData.baseY||0)-0.47*u.k; setBones(B,SIT,1); if(pose==='read'){ setBones(B,READ,1); if(B.Head) B.Head.rotation.set(0.35+Math.sin(a.t*0.6)*0.02,0,0); } else { if(B.Head) B.Head.rotation.set(Math.sin(a.t*0.7)*0.03,Math.sin(a.t*0.4)*0.15,0); } if(B.Spine) B.Spine.rotation.set(0.06,0,0); if(B.Spine1) B.Spine1.rotation.set(0,0,0); }   /* 同上：注視在胸口加轉角，坐姿要每一幀重設 */
    else { if(a.static){ a.static=false; u.model.position.y=u.model.userData.baseY||0; for(const n in B){ B[n].rotation.set(0,0,0); } } const clipName=POSE_CLIP[pose]||'idle'; if(a.cur!==clipName&&a.actions[clipName]){ const prev=a.cur&&a.actions[a.cur]; const next=a.actions[clipName]; next.reset().setEffectiveWeight(1).fadeIn(0.22).play(); if(prev) prev.fadeOut(0.22); a.cur=clipName; } const act=a.actions[a.cur]; if(act){ act.timeScale= a.cur==='walk'?Math.max(0.6,spd/1.45): (a.cur==='run'?Math.max(0.7,spd/4.1):1); } a.mixer.update(dt);
      if(pose==='wave'&&B.RightArm){ const g=Math.sin(a.t*7); B.RightArm.rotation.set(-0.2,0,-2.4+g*0.15); if(B.RightForeArm) B.RightForeArm.rotation.set(0.1,0,-0.5-Math.abs(g)*0.3); if(B.Head) B.Head.rotation.z+=0.08; }
      if(pose==='talk'&&B.Head){ B.Head.rotation.x+=Math.sin(a.t*1.4)*0.05; B.Head.rotation.y+=Math.sin(a.t*0.8)*0.08; if(B.RightArm){ const g=Math.sin(a.t*2.2); B.RightArm.rotation.z-=0.35+g*0.1; if(B.RightForeArm) B.RightForeArm.rotation.z-=0.9+g*0.15; } } }
    // 注視
    if(st.lookAt&&B.Head){ const dx=st.lookAt.x-h.position.x, dz=st.lookAt.z-h.position.z; let ang=Math.atan2(dx,dz)-h.rotation.y; ang=Math.atan2(Math.sin(ang),Math.cos(ang)); ang=Math.max(-0.7,Math.min(0.7,ang)); B.Head.rotation.y+=ang*0.8; if(B.Spine1) B.Spine1.rotation.y+=ang*0.15; }
    // 嘴型（說話時）與表情
    if(u.headMesh){ const d=u.headMesh.morphTargetDictionary, inf=u.headMesh.morphTargetInfluences; if(d.mouthOpen!==undefined){ const target=pose==='talk'?(0.15+Math.abs(Math.sin(a.t*9))*0.35):0; a.mouth+=(target-a.mouth)*Math.min(1,dt*14); inf[d.mouthOpen]=a.mouth; } } };
  C.setExpr=function(h,expr){ const u=h.userData; if(u.driver==='vrm'){ C.setExprVRM(h,expr); return; } if(u.driver!=='glb'){ P3.setExpr(h,expr); return; } u.anim.expr=expr; const hm=u.headMesh; if(!hm) return; const d=hm.morphTargetDictionary, inf=hm.morphTargetInfluences; if(d.mouthSmile!==undefined) inf[d.mouthSmile]=(expr==='smile'?0.55:(expr==='laugh'?0.9:(expr==='shy'?0.3:0))); };
  // 頭部高度（運鏡用）
  C.headY=function(h){ const u=h.userData; const k=u.k||1; const a=u.anim; const sit=a&&(a.pose==='sit'||a.pose==='read'); if(u.driver==='vrm'){ if(u.anim.staticKind==='lie') return 0.2*k; return (u.anim.static?u.headY-0.47*k:u.headY); }   /* 躺著：頭只比 root（床墊）高一點（運鏡 headOf 用）*/ if(u.driver==='glb'){ const st=(u.anim.static); return (st?1.16:1.62)*k; } return (sit?1.19:1.62)*k; };
  C.isGLB=function(h){ return h&&h.userData&&(h.userData.driver==='glb'||h.userData.driver==='vrm'); };
  return C;
})();
