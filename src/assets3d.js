/* ===== 資產層（VISUAL ASSET LAYER）
   gameplay 只認 logical key（例如 'tree.palm'、'prop.bench'、'char.rpm_sample'）。
   每個 key 對應：外部 GLB/glTF（CC0 等）或 procedural fallback（W3 / P3 的 placeholder 產生器）。
   替換資產只需改 manifest，不影響 nav、碰撞、互動、NPC、事件與存檔。 ===== */
'use strict';
const ASSETS = (function(){
  const A={cache:{},clips:{},status:{},errors:[],loaded:false};
  // ---- Manifest：type gltf/glb；fit：讓模型高度符合 opts.height；ground：底部貼地；rotY：模型正面朝 +z 的修正 ----
  A.manifest={
    'tree.palm':      {url:'assets/models/env/palm-detailed-long.glb', source:'Kenney (via market.pmnd.rs)', license:'CC0', ground:true, fitHeight:true, tris:488},
    'tree.leafy':     {url:'assets/models/env/low-poly-tree.glb', source:'Sara Vieira (via market.pmnd.rs)', license:'CC0', ground:true, fitHeight:true, tris:9436},
    'tree.conifer':   {url:'assets/models/env/tree-big.glb', source:'Kenney (via market.pmnd.rs)', license:'CC0', ground:true, fitHeight:true, tris:556},
    'prop.bench':     {url:'assets/models/env/bench.glb', source:'Sara Vieira (via market.pmnd.rs)', license:'CC0', ground:true, fitWidth:1.8, tris:2048},
    'prop.cup':       {url:'assets/models/env/cup.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.09},
    'prop.cupSaucer': {url:'assets/models/env/cup-saucer.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.08},
    'prop.glass':     {url:'assets/models/env/glass.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.12},
    'prop.bottle':    {url:'assets/models/env/bottle.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.22},
    'prop.plate':     {url:'assets/models/env/plate.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.02},
    'prop.bowl':      {url:'assets/models/env/bowl-broth.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.09},
    'prop.riceBall':  {url:'assets/models/env/rice-ball.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.08},
    'prop.sodaCan':   {url:'assets/models/env/soda-can.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.12},
    'prop.sandwich':  {url:'assets/models/env/sandwich.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.08},
    'prop.pizzaBox':  {url:'assets/models/env/pizza-box.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.05},
    'prop.chopstick': {url:'assets/models/env/chopstick.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.01},
    'prop.bag':       {url:'assets/models/env/bag.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.35},
    'prop.bagFlat':   {url:'assets/models/env/bag-flat.glb', source:'market.pmnd.rs', license:'CC0', ground:true, fitHeight:0.25},
    // 人物：Ready Player Me 範例 avatar（three.js examples）＋ Mixamo 動畫（Xbot，僅保留骨架與 idle/walk/run/agree/headShake）
    'char.rpm_sample':{url:'assets/models/char/rpm_sample.glb', type:'character', role:'TEMP_PLAYER_DEV_MODEL', anims:'char.mixamo_clips', hide:['Beard','Headwear'], source:'three.js examples (readyplayer.me.glb)', license:'Ready Player Me sample — 原型測試用；正式版需自行產生 RPM avatar 或改用其他授權人物', height:1.8},
    'char.vrm_player':{url:'assets/models/char/vrm_player.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.75,instances:1,hide:['robo_arm','wear_2','wear_3','wear_5','wear_6','wear_7','wear_8','wear_9','wear_10','wear_11','wear_12'],source:'Seed-san（VirtualCast, Inc.）— vrm-c/vrm-specification samples；本專案修改：隱藏機械手臂／背包／配件、服裝貼圖改成素色 T-shirt＋長褲、貼圖縮小',license:'VRM Public License 1.0（allowRedistribution、modification: allowModificationRedistribution、creditNotation: required → 需標示「Seed-san by VirtualCast, Inc.」）',role:'PLAYER'},
    'char.vrm_sample':{url:'assets/models/char/vrm_sample.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.66,instances:2,source:'three-vrm examples VRM1_Constraint_Twist_Sample（pixiv Inc.）',license:'VRM Public License 1.0（allowRedistribution、modification: allowModificationRedistribution、credit unnecessary；貼圖已縮小）'},
    'char.mixamo_clips':{url:'assets/models/char/mixamo_clips.glb', type:'clips', source:'three.js examples (Xbot.glb, Mixamo)', license:'Mixamo 動畫（Adobe 條款：可用於專案，不可單獨再散布）'},
  };
  // ---- placeholder fallbacks（procedural；LEVEL_BLOCKOUT）----
  A.fallbacks={
    'tree.palm':(o)=>W3.palm(o.height||9), 'tree.leafy':(o)=>W3.banyan((o.height||6)/6), 'tree.conifer':(o)=>W3.banyan((o.height||6)/6), 'prop.bench':()=>W3.bench(),
  };
  const loader=()=>{ if(!A._loader){ A._loader=new THREE_JSM.GLTFLoader.GLTFLoader(); } return A._loader; };
  // VRM：另一個 loader 註冊 @pixiv/three-vrm 的 VRMLoaderPlugin（lib/three-vrm.bundle.js 沒載入時 VRM 資產視為失敗 → fallback）
  const vrmLoader=()=>{ if(typeof THREE_VRM==='undefined') return null; if(!A._vrmLoader){ A._vrmLoader=new THREE_JSM.GLTFLoader.GLTFLoader(); A._vrmLoader.register(p=>new THREE_VRM.VRMLoaderPlugin(p,{autoUpdateHumanBones:true})); } return A._vrmLoader; };
  A.parseVRM=function(buf){ return new Promise((res,rej)=>{ const l=vrmLoader(); if(!l) return rej(new Error('three-vrm not loaded')); l.parse(buf,'',g=>{ const vrm=g.userData.vrm; if(!vrm) return rej(new Error('not a VRM')); try{ THREE_VRM.VRMUtils.removeUnnecessaryVertices(g.scene); THREE_VRM.VRMUtils.combineSkeletons(g.scene); THREE_VRM.VRMUtils.rotateVRM0(vrm); }catch(e){} res({gltf:g,vrm}); },rej); }); };
  function normalize(key,gltf){ const m=A.manifest[key]; const root=gltf.scene; root.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(root); const size=box.getSize(new THREE.Vector3()); const wrap=new THREE.Group(); wrap.name='asset:'+key; let s=1; if(typeof m.fitHeight==='number') s=m.fitHeight/Math.max(1e-6,size.y); else if(m.fitWidth) s=m.fitWidth/Math.max(1e-6,size.x); root.scale.setScalar(s); root.updateMatrixWorld(true); const box2=new THREE.Box3().setFromObject(root); const c=box2.getCenter(new THREE.Vector3()); root.position.x-=c.x; root.position.z-=c.z; if(m.ground) root.position.y-=box2.min.y; wrap.add(root); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(o.material&&o.material.map) o.material.map.colorSpace=THREE.SRGBColorSpace; } }); wrap.userData.baseHeight=size.y*s; wrap.userData.key=key; return wrap; }
  A.loadOne=function(key){ const m=A.manifest[key]; if(!m) return Promise.reject(new Error('unknown asset '+key)); if(A.cache[key]) return Promise.resolve(A.cache[key]); if(A.status[key]) return A.status[key];
    const b64ToBuf=(data)=>{ const bin=atob(data); const buf=new ArrayBuffer(bin.length); const u8=new Uint8Array(buf); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); return buf; };
    A.status[key]=new Promise((res,rej)=>{ const done=(gltf)=>{ try{ if(m.type==='character'||m.type==='clips'){ A.cache[key]={gltf,scene:gltf.scene,animations:gltf.animations}; } else { A.cache[key]=normalize(key,gltf); } res(A.cache[key]); }catch(e){ rej(e); } }; const fail=(e)=>{ A.errors.push(key+': '+(e&&e.message||e)); rej(e); };
      if(m.type==='vrm'){ // VRM：解析 N 個實例放進 pool（three-vrm 沒有 clone；重新 parse 同一個 buffer）
        const parseAll=(buf)=>{ const n=m.instances||1; const ps=[]; for(let i=0;i<n;i++) ps.push(A.parseVRM(buf.slice(0))); return Promise.all(ps).then(list=>{ A.cache[key]={vrm:true,buffer:buf,pool:list.map(x=>({vrm:x.vrm,gltf:x.gltf,inUse:false}))}; res(A.cache[key]); }); };
        const dataV=window.ASSET_DATA&&window.ASSET_DATA[m.url]; if(dataV){ parseAll(b64ToBuf(dataV)).catch(fail); return; }
        fetch(m.url).then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.arrayBuffer(); }).then(parseAll).catch(()=>{ fetch(m.url+'.json').then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); }).then(j=>parseAll(b64ToBuf(j.b64))).catch(fail); }); return; }
      const data=window.ASSET_DATA&&window.ASSET_DATA[m.url]; if(data){ loader().parse((m.url.endsWith('.glb')||m.url.endsWith('.vrm'))?b64ToBuf(data):data,'',done,fail); return; }
      // 1) 直接抓 .glb；2) 失敗（例如平台不提供 .glb）改抓同名 .glb.json（{b64}）
      fetch(m.url).then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.arrayBuffer(); }).then(buf=>loader().parse(buf,'',done,fail)).catch(()=>{ fetch(m.url+'.json').then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); }).then(j=>loader().parse(b64ToBuf(j.b64),'',done,fail)).catch(fail); }); });
    return A.status[key]; };
  // 預載：每個資產有時間上限（預設 20 秒；VRM 30 秒）。逾時的資產先用 placeholder，背景繼續載，載好之後之後生成的人物／物件會自動用到
  A.preload=function(keys,onProgress,capMs){ let n=0; const total=keys.length; A.timedOut=[]; return Promise.all(keys.map(k=>{ const m=A.manifest[k]||{}; const cap=capMs||(m.type==='vrm'?30000:20000); const p=A.loadOne(k).catch(e=>null); const t=new Promise(res=>setTimeout(()=>res('__timeout'),cap)); return Promise.race([p,t]).then(r=>{ if(r==='__timeout'){ A.timedOut.push(k); console.warn('asset preload timeout → placeholder for now:',k); } n++; if(onProgress) onProgress(n/total,k); return r; }); })).then(r=>{ A.loaded=true; return r; }); };
  A.has=function(key){ return !!A.cache[key]; };
  // 取得一個實例（環境物件）。opts: {height, scale, rotY}
  A.get=function(key,opts){ opts=opts||{}; const t=A.cache[key]; if(!t||!t.isObject3D){ const f=A.fallbacks[key]; if(f){ const o=f(opts); o.userData.placeholder=true; return o; } return new THREE.Group(); } const inst=t.clone(); const m=A.manifest[key]; if(opts.height&&m.fitHeight===true){ inst.scale.setScalar(opts.height/Math.max(1e-6,t.userData.baseHeight)); } if(opts.scale) inst.scale.multiplyScalar(opts.scale); if(opts.rotY) inst.rotation.y=opts.rotY; inst.userData.asset=key; return inst; };
  A.getRaw=function(key){ return A.cache[key]; };
  // VRM 實例池
  A.acquireVRM=function(key){ const c=A.cache[key]; if(!c||!c.pool) return null; const e=c.pool.find(x=>!x.inUse); if(!e) return null; e.inUse=true; return e; };
  A.releaseVRM=function(key,vrm){ const c=A.cache[key]; if(!c||!c.pool) return; const e=c.pool.find(x=>x.vrm===vrm); if(e){ e.inUse=false; if(e.vrm.scene.parent) e.vrm.scene.parent.remove(e.vrm.scene); } };
  A.vrmFree=function(key){ const c=A.cache[key]; return c&&c.pool?c.pool.filter(x=>!x.inUse).length:0; };
  // 清單（給 REVIEW / LICENSES 用）
  A.report=function(){ const out=[]; for(const k in A.manifest){ const m=A.manifest[k]; out.push({key:k,url:m.url,loaded:!!A.cache[k],source:m.source,license:m.license}); } return out; };
  return A;
})();
