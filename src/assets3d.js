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
    'prop.bench':     {url:'assets/models/env/bench.glb', source:'Sara Vieira (via market.pmnd.rs)', license:'CC0', ground:true, fitWidth:1.35, tris:2048},   /* 寬 1.35 m：座面約 0.46 m 高（1.8 m 時座面 0.61 m，坐下的人物腳碰不到地、像坐在空中）*/
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
    // 人物（正式）：VRoid 官方 CC0 樣本模型（pixiv，VRoid Studio β 版樣本；檔內 meta licenseName=CC0），
    // 用 tools/vroid_build.py 改成本作角色：移植衣物、換色、縮貼圖。主要角色各一個檔；路人用 4 個底模＋材質顏色相乘。
    'char.yuting':     {url:'assets/models/char/vroid_yuting.vrm', blUrl:'assets/models/char/bl_yuting.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.75,role:'PLAYER',source:'VRoid CC0 樣本「HairSample_Male」（pixiv）；本作修改：拿掉帽子／抽繩／口袋線的淺灰上衣、深灰直筒褲、白球鞋、拿掉呆毛、眼睛縮小；後背包是 src/props3d.js',license:'CC0'},
    'char.heroine_01': {url:'assets/models/char/vroid_heroine_01.vrm', blUrl:'assets/models/char/bl_heroine_01.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.66,source:'VRoid CC0 樣本「HairSample_Female」＋「HairSample_Male」的上衣與長褲＋「Sendagaya Shino」的樂福鞋（pixiv）；本作修改：單一高馬尾、米白針織衫、藍灰直筒寬褲；托特包是 src/props3d.js',license:'CC0'},
    'char.heroine_02': {url:'assets/models/char/vroid_heroine_02.vrm',blUrl:'assets/models/char/bl_heroine_02.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.61,source:'VRoid CC0 樣本「Victoria Rubin」＋「HairSample_Female」的亞麻上衣（剪成圓領）＋「Sendagaya Shino」的樂福鞋＋「HairSample_Male」的長褲（pixiv）；眼鏡、耳環、圍裙是 src/props3d.js',license:'CC0'},
    'char.zhe':        {url:'assets/models/char/vroid_zhe.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.78,source:'VRoid CC0 樣本「Sakurada Fumiriya」＋「HairSample_Male」的連帽上衣（pixiv）',license:'CC0'},
    'char.heroine_03': {url:'assets/models/char/vroid_heroine_03.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.59,source:'VRoid CC0 樣本「Sendagaya Shibu」＋「HairSample_Male」的長褲＋「HairSample_Female」的球鞋（pixiv）；本作修改：拿掉制服、深色 T 恤、牛仔褲；後背包是 src/props3d.js',license:'CC0'},
    'char.heroine_04': {url:'assets/models/char/vroid_heroine_04.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.69,source:'VRoid CC0 樣本「Vita」＋「HairSample_Male」的連帽上衣與短褲＋「HairSample_Female」的球鞋＋「Sendagaya Shibu」的虹膜（pixiv）；吉他袋是 src/props3d.js',license:'CC0'},
    'char.heroine_05': {url:'assets/models/char/vroid_heroine_05.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.72,source:'VRoid CC0 樣本「Sendagaya Shino」（長直髮改成低馬尾）＋「Sakurada Fumiriya」的襯衫（袖子接長成反摺長袖）＋「HairSample_Male」的長褲（pixiv）；判決節錄資料夾、髮圈是 src/props3d.js',license:'CC0'},
    'char.npc_f1':     {url:'assets/models/char/vroid_npc_f1.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.62,ambient:true,sex:'f',tintBase:{hair:'#8a6a52',top:'#e6e3de',bottom:'#cfcbc4'},source:'VRoid CC0 樣本「Sendagaya Shino」＋長褲（pixiv）',license:'CC0'},
    'char.npc_f2':     {url:'assets/models/char/vroid_npc_f2.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.64,ambient:true,sex:'f',tintBase:{hair:'#8a6a52',top:'#e6e3de',bottom:'#cfcbc4'},source:'VRoid CC0 樣本「Victoria Rubin」＋上衣、長褲（pixiv）',license:'CC0'},
    'char.npc_m1':     {url:'assets/models/char/vroid_npc_m1.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.74,ambient:true,sex:'m',tintBase:{hair:'#8a6a52',top:'#e6e3de',bottom:'#cfcbc4'},source:'VRoid CC0 樣本「Sakurada Fumiriya」＋連帽上衣（pixiv）',license:'CC0'},
    'char.npc_m2':     {url:'assets/models/char/vroid_npc_m2.vrm',type:'vrm',anims:'char.mixamo_clips',height:1.74,ambient:true,sex:'m',tintBase:{hair:'#8a6a52',top:'#e6e3de',bottom:'#cfcbc4'},source:'VRoid CC0 樣本「HairSample_Male」＋襯衫背心（pixiv）',license:'CC0'},
    // 舊人物模型：不再預載（v8 以前的玩家／小安；保留檔案與授權紀錄）
    'char.rpm_sample':{url:'assets/models/char/rpm_sample.glb', type:'character', lazy:true, role:'TEMP_PLAYER_DEV_MODEL（v8 以前；已停用）', anims:'char.mixamo_clips', hide:['Beard','Headwear'], source:'three.js examples (readyplayer.me.glb)', license:'Ready Player Me sample — 原型測試用', height:1.8},
    'char.vrm_player':{url:'assets/models/char/vrm_player.vrm',type:'vrm',lazy:true,anims:'char.mixamo_clips',height:1.75,hide:['robo_arm','wear_2','wear_3','wear_5','wear_6','wear_7','wear_8','wear_9','wear_10','wear_11','wear_12'],source:'Seed-san（VirtualCast, Inc.）— v8 以前的玩家模型（已停用）',license:'VRM Public License 1.0（creditNotation: required → 「Seed-san by VirtualCast, Inc.」）'},
    'char.vrm_sample':{url:'assets/models/char/vrm_sample.vrm',type:'vrm',lazy:true,anims:'char.mixamo_clips',height:1.66,source:'three-vrm examples VRM1_Constraint_Twist_Sample（pixiv Inc.）— v8 以前的小安模型（已停用）',license:'VRM Public License 1.0'},
    // 建築正式模型（v9.4，D36）：Blender 腳本產生（tools/blender/），進那個區域時才載入；載入失敗就用程序化備用模型
    'bldg.linze_interior':{url:'assets/models/env/linze_interior.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/linze_interior.py（配置 src/data/linze_layout.js；貼圖 Poly Haven CC0）', license:'本作；貼圖 CC0'},
    'bldg.linze_exterior':{url:'assets/models/env/linze_exterior.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/linze_exterior.py（照使用者照片概略重建；量體同 CK.lawhall；貼圖 Poly Haven CC0；窗用 EXT_mesh_gpu_instancing）', license:'本作；貼圖 CC0'},
    'bldg.classroom_201':{url:'assets/models/env/classroom_201.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/classroom_201.py（配置 src/data/classroom_layout.js；貼圖 Poly Haven CC0；48 張椅子用 EXT_mesh_gpu_instancing）', license:'本作；貼圖 CC0'},
    // ==== 第二個 AI（環境美術）的資產：只在這兩行標記之間增減（docs/SECOND_AI_HANDOFF.md）。key 用 bldg. 開頭＋type:'building', lazy:true（網址 ?nobldg 可以看舊的程序化版本）；檔案放 assets/models/env/second_ai/ ====
    'bldg.cafe_exterior':{url:'assets/models/env/second_ai/cafe_exterior.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/env_second/cafe_exterior.py（兩點半 Café 外觀＋窗內店面＋門口道具；建築座標同 TK.apartment；貼圖 Poly Haven CC0、葉片貼圖本作程式產生；鐵窗、冷氣、雨遮、椅子用 EXT_mesh_gpu_instancing）', license:'本作；貼圖 CC0'},
    'bldg.cafe_interior':{url:'assets/models/env/second_ai/cafe_interior.glb', type:'building', lazy:true, source:'本作 Blender 腳本 tools/blender/env_second/cafe_interior.py（兩點半 Café 室內；配置 cafe_layout.py 和外觀共用；貼圖 Poly Haven CC0；桌椅用 EXT_mesh_gpu_instancing）', license:'本作；貼圖 CC0'},
    // ==== 第二個 AI 區塊結束 ====
    'char.mixamo_clips':{url:'assets/models/char/mixamo_clips.glb', type:'clips', source:'three.js examples (Xbot.glb, Mixamo)', license:'Mixamo 動畫（Adobe 條款：可用於專案，不可單獨再散布）'},
  };
  // 網址加 ?nobldg：不載入建築的正式模型（Blender GLB），只看程序化備用模型（新舊比較、載入失敗時的樣子）
  if(typeof location!=='undefined'&&/[?&]nobldg\b/.test(location.search||'')) for(const k of Object.keys(A.manifest)) if(k.startsWith('bldg.')) delete A.manifest[k];
  // 網址加 ?blchar：有 Blender 正式製作版本的人物（manifest 的 blUrl）改用 Blender 版（v9.4 起；沈以安是示範角色）。
  // 使用者驗收美術方向之前，預設仍是 VRoid 加工版；這個參數讓使用者在實際遊戲（包括手機）裡看 Blender 版
  if(typeof location!=='undefined'&&/[?&]blchar\b/.test(location.search||'')) for(const k of Object.keys(A.manifest)) if(A.manifest[k].blUrl) A.manifest[k].url=A.manifest[k].blUrl;
  // ---- placeholder fallbacks（procedural；LEVEL_BLOCKOUT）----
  A.fallbacks={
    'tree.palm':(o)=>W3.palm(o.height||9), 'tree.leafy':(o)=>W3.banyan((o.height||6)/6), 'tree.conifer':(o)=>W3.banyan((o.height||6)/6), 'prop.bench':()=>W3.bench(),
  };
  const loader=()=>{ if(!A._loader){ A._loader=new THREE_JSM.GLTFLoader.GLTFLoader(); } return A._loader; };
  // VRM：另一個 loader 註冊 @pixiv/three-vrm 的 VRMLoaderPlugin（lib/three-vrm.bundle.js 沒載入時 VRM 資產視為失敗 → fallback）
  const vrmLoader=()=>{ if(typeof THREE_VRM==='undefined') return null; if(!A._vrmLoader){ A._vrmLoader=new THREE_JSM.GLTFLoader.GLTFLoader(); A._vrmLoader.register(p=>new THREE_VRM.VRMLoaderPlugin(p,{autoUpdateHumanBones:true})); } return A._vrmLoader; };
  A.parseVRM=function(buf){ return new Promise((res,rej)=>{ const l=vrmLoader(); if(!l) return rej(new Error('three-vrm not loaded')); l.parse(buf,'',g=>{ const vrm=g.userData.vrm; if(!vrm) return rej(new Error('not a VRM')); try{ THREE_VRM.VRMUtils.removeUnnecessaryVertices(g.scene); THREE_VRM.VRMUtils.combineSkeletons(g.scene); THREE_VRM.VRMUtils.rotateVRM0(vrm); }catch(e){} res({gltf:g,vrm}); },rej); }); };
  function normalize(key,gltf){ const m=A.manifest[key]; const root=gltf.scene; root.updateMatrixWorld(true); const box=new THREE.Box3().setFromObject(root); const size=box.getSize(new THREE.Vector3()); const wrap=new THREE.Group(); wrap.name='asset:'+key; let s=1; if(typeof m.fitHeight==='number') s=m.fitHeight/Math.max(1e-6,size.y); else if(m.fitWidth) s=m.fitWidth/Math.max(1e-6,size.x); root.scale.setScalar(s); root.updateMatrixWorld(true); const box2=new THREE.Box3().setFromObject(root); const c=box2.getCenter(new THREE.Vector3()); root.position.x-=c.x; root.position.z-=c.z; if(m.ground) root.position.y-=box2.min.y; wrap.add(root); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(o.material&&o.material.map) o.material.map.colorSpace=THREE.SRGBColorSpace; } }); wrap.userData.baseHeight=size.y*s; wrap.userData.key=key; return wrap; }
  // 下載（給載入畫面顯示「已下載幾 MB」）：A.bytes.done 累計所有資產已收到的位元組
  A.bytes={done:0};
  function fetchBuf(url){ return fetch(url).then(r=>{ if(!r.ok) throw new Error('http '+r.status); if(!r.body||!r.body.getReader) return r.arrayBuffer().then(b=>{ A.bytes.done+=b.byteLength; return b; });
    const rd=r.body.getReader(), parts=[]; let len=0; const pump=()=>rd.read().then(({done,value})=>{ if(done){ const u8=new Uint8Array(len); let o=0; for(const c of parts){ u8.set(c,o); o+=c.length; } return u8.buffer; } parts.push(value); len+=value.length; A.bytes.done+=value.length; return pump(); }); return pump(); }); }
  A.loadOne=function(key){ const m=A.manifest[key]; if(!m) return Promise.reject(new Error('unknown asset '+key)); if(A.cache[key]) return Promise.resolve(A.cache[key]); if(A.status[key]) return A.status[key];
    const b64ToBuf=(data)=>{ const bin=atob(data); const buf=new ArrayBuffer(bin.length); const u8=new Uint8Array(buf); for(let i=0;i<bin.length;i++) u8[i]=bin.charCodeAt(i); return buf; };
    A.status[key]=new Promise((res,rej)=>{ const done=(gltf)=>{ try{ if(m.type==='character'||m.type==='clips'||m.type==='building'){ A.cache[key]={gltf,scene:gltf.scene,animations:gltf.animations}; }   /* building：建築正式模型（遊戲座標、不縮放）*/ else { A.cache[key]=normalize(key,gltf); } res(A.cache[key]); }catch(e){ rej(e); } }; const fail=(e)=>{ A.errors.push(key+': '+(e&&e.message||e)); rej(e); };
      if(m.type==='vrm'){ // VRM：只 parse 一次。第一個實例用原本的 VRM（表情、彈簧骨、視線）；之後的實例用骨架 clone（共用幾何與貼圖，手機記憶體才夠）
        const setup=(buf)=>A.parseVRM(buf).then(x=>{ const rest=THREE_JSM.SkeletonUtils.clone(x.vrm.scene); copyColliderShapes(x.vrm.scene,rest); const rig=rest.getObjectByName('VRMHumanoidRig'); if(rig&&rig.parent) rig.parent.remove(rig); A.cache[key]={vrm:true,tpl:{vrm:x.vrm,gltf:x.gltf,inUse:false,full:true},rest,clones:[]}; res(A.cache[key]); });
        const dataV=window.ASSET_DATA&&window.ASSET_DATA[m.url]; if(dataV){ setup(b64ToBuf(dataV)).catch(fail); return; }
        fetchBuf(m.url).then(setup).catch(()=>{ fetch(m.url+'.json').then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); }).then(j=>setup(b64ToBuf(j.b64))).catch(fail); }); return; }
      const data=window.ASSET_DATA&&window.ASSET_DATA[m.url]; if(data){ loader().parse((m.url.endsWith('.glb')||m.url.endsWith('.vrm'))?b64ToBuf(data):data,'',done,fail); return; }
      // 1) 直接抓 .glb；2) 失敗（例如平台不提供 .glb）改抓同名 .glb.json（{b64}）
      fetchBuf(m.url).then(buf=>loader().parse(buf,'',done,fail)).catch(()=>{ fetch(m.url+'.json').then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); }).then(j=>loader().parse(b64ToBuf(j.b64),'',done,fail)).catch(fail); }); });
    return A.status[key]; };
  // 預載：每個資產有時間上限（預設 20 秒；VRM 30 秒；capMs 可覆寫）。逾時的資產先用 placeholder，背景繼續載；載好之後從 timedOut 拿掉，
  // 已經用 placeholder 建立的人物由 game3d.js 的 upgradeModels 原地換成正式模型（2026-10-10：原本下載完也不會換回來）
  A.timedOut=[];
  A.preload=function(keys,onProgress,capMs){ keys=keys.filter(k=>!(A.manifest[k]||{}).lazy); let n=0; const total=keys.length; return Promise.all(keys.map(k=>{ const m=A.manifest[k]||{}; const cap=capMs||(m.type==='vrm'?30000:20000); const p=A.loadOne(k).then(r=>{ const i=A.timedOut.indexOf(k); if(i>=0) A.timedOut.splice(i,1); return r; }).catch(e=>null); const t=new Promise(res=>setTimeout(()=>res('__timeout'),cap)); return Promise.race([p,t]).then(r=>{ if(r==='__timeout'&&!A.cache[k]){ if(!A.timedOut.includes(k)) A.timedOut.push(k); console.warn('asset preload timeout → placeholder for now:',k); } n++; if(onProgress) onProgress(n/total,k); return r; }); })).then(r=>{ A.loaded=true; return r; }); };
  A.has=function(key){ return !!A.cache[key]; };
  // 取得一個實例（環境物件）。opts: {height, scale, rotY}
  A.get=function(key,opts){ opts=opts||{}; const t=A.cache[key]; if(!t||!t.isObject3D){ const f=A.fallbacks[key]; if(f){ const o=f(opts); o.userData.placeholder=true; return o; } return new THREE.Group(); } const inst=t.clone(); const m=A.manifest[key]; if(opts.height&&m.fitHeight===true){ inst.scale.setScalar(opts.height/Math.max(1e-6,t.userData.baseHeight)); } if(opts.scale) inst.scale.multiplyScalar(opts.scale); if(opts.rotY) inst.rotation.y=opts.rotY; inst.userData.asset=key; return inst; };
  A.getRaw=function(key){ return A.cache[key]; };
  // VRM 實例池
  // 骨架 clone：新的 VRMHumanoid（normalized rig）＋共用的幾何／材質；沒有彈簧骨與表情（給路人與重複出現的底模）
  // 彈簧骨碰撞體（VRMSpringBoneCollider）用 Object3D.clone 複製時不會帶 shape，之後 updateWorldMatrix 會讀 shape.offset 而丟錯
  // （v9.4 的腳步貼合在樓梯、階梯教室會對整個人物 updateWorldMatrix(true,true)）：照同樣的樹狀結構把 shape 帶過去（只讀，共用沒關係）
  function copyColliderShapes(a,b){ if(a.shape&&!b.shape&&a.constructor===b.constructor) b.shape=a.shape; const n=Math.min(a.children.length,b.children.length); for(let i=0;i<n;i++) copyColliderShapes(a.children[i],b.children[i]); }
  function cloneVRM(c){ const tv=c.tpl.vrm; const scene=THREE_JSM.SkeletonUtils.clone(c.rest); copyColliderShapes(c.rest,scene); scene.position.set(0,0,0); scene.rotation.set(0,0,0); scene.scale.set(1,1,1); scene.updateMatrixWorld(true);
    const hb={}; const raw=tv.humanoid.humanBones; for(const name in raw){ const node=raw[name]&&raw[name].node; if(!node) continue; const cn=scene.getObjectByName(node.name); if(cn) hb[name]={node:cn}; }
    const humanoid=new THREE_VRM.VRMHumanoid(hb,{autoUpdateHumanBones:true}); scene.add(humanoid.normalizedHumanBonesRoot);
    if(tv.meta&&tv.meta.metaVersion==='0') scene.rotation.y=Math.PI;
    return {scene,humanoid,meta:tv.meta,expressionManager:null,lookAt:null,lite:true,update(){ humanoid.update(); }}; }
  A.acquireVRM=function(key){ const c=A.cache[key]; if(!c||!c.tpl) return null; if(!c.tpl.inUse){ c.tpl.inUse=true; return c.tpl; } try{ const e={vrm:cloneVRM(c),inUse:true,full:false}; c.clones.push(e); return e; }catch(err){ console.error('VRM clone failed',key,err); A.errors.push(key+': clone '+err.message); return null; } };
  A.releaseVRM=function(key,vrm){ const c=A.cache[key]; if(!c) return; if(c.tpl.vrm===vrm){ c.tpl.inUse=false; } else { c.clones=c.clones.filter(e=>e.vrm!==vrm); } if(vrm.scene.parent) vrm.scene.parent.remove(vrm.scene); };
  A.vrmFree=function(key){ const c=A.cache[key]; return c&&c.tpl?99:0; };
  // 清單（給 REVIEW / LICENSES 用）
  A.report=function(){ const out=[]; for(const k in A.manifest){ const m=A.manifest[k]; out.push({key:k,url:m.url,loaded:!!A.cache[k],source:m.source,license:m.license}); } return out; };
  return A;
})();
