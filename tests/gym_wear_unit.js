// 祐廷的健身短袖運動服（GYM-FIT-1107 ③，LAWWW2-B 2026-11-07；LAWWW-B 05:46 定案，人物外觀 D128）——不需要瀏覽器。
// 使用者 11-07「肌肉線條更明顯」：平常的長袖毛衣只看得到輪廓；B1 健身中心、體育課換短袖運動服，露出手臂、小腿，體態 fit 形狀看得到。
// 模型：vroid_yuting.vrm 的 GYM_TOP、GYM_SHORTS（tools/gym_wear.py，從身體皮膚切出來、往外推、平滑；同一副骨架；一樣有 fit morph）。
// 檢查（第二版 11-07：CC 遊戲內截圖的領口灰色、衣襬黑點、深色襪子加 ⑥⑦）：① VRM 有兩塊運動服、和身體同一副骨架、有 fit、材質是 _CLOTH；manifest 先藏
//       ② CHAR.setGymWear：穿上＝運動服顯示、毛衣褲子藏、舊的外套網格一直藏著、後背包拿下；脫下＝照原樣；CHAR.upgrade 帶過去
//       ③ fit 形狀：運動服跟著身體一起撐（u.fitBody＝1 時 morph 開）
//       ④ 不穿模：站、跑、坐 × 體態普通、經常鍛鍊——上臂、軀幹、大腿的皮膚跑到運動服外面的頂點 ≤ 1%（和同一根骨頭、同一段、同一個角度的衣服比離軸距離）
//       ⑤ 什麼時候穿：FIT.gymWearOn——B1（gym_b1）、上體育課（CLS.peWear）穿，其他地方不穿；FIT.sync 照這個換；體育課 attend 設 CLS.peWear、下課清掉
// 修改前（開發 c82a39be1＋fit_body_1107.patch）：① FAIL（沒有運動服）、② FAIL（沒有 setGymWear）、⑤ FAIL（沒有 gymWearOn）。用法：node tests/gym_wear_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); };
(async()=>{
  // ① VRM
  const J=glb('assets/models/char/vroid_yuting.vrm'), node=n=>J.nodes.find(x=>x.name===n), body=J.nodes.find(x=>x.mesh!=null&&/^Body/.test(J.meshes[x.mesh].name));
  const gym=['GYM_TOP','GYM_SHORTS'].map(node);
  const okNodes=gym.every(n=>n&&n.mesh!=null&&n.skin===body.skin);
  const okFit=okNodes&&gym.every(n=>((J.meshes[n.mesh].extras||{}).targetNames||[]).includes('fit'));
  const okMat=okNodes&&gym.every(n=>J.meshes[n.mesh].primitives.every(p=>/_CLOTH$/.test(J.materials[p.material].name)));
  check('① VRM 有 GYM_TOP、GYM_SHORTS（和身體同一副骨架）',okNodes);
  check('① 運動服有 fit 形狀、材質是 _CLOTH（衣服壓暗、描邊照毛衣）',okFit&&okMat);
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/fit3d.js'),'utf8').replace(/^const FIT\s*=/m,'globalThis.FIT='),{filename:'src/fit3d.js'});
  await preload(['char.yuting']);
  { const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }   /* 坐姿用遊戲的動作片段（Node 沒有 fetch）*/
  const hide=(ASSETS.manifest['char.yuting'].hide||[]);
  check('① manifest 先藏運動服（每次建模型都先藏）',hide.includes('GYM_TOP')&&hide.includes('GYM_SHORTS'),JSON.stringify(hide));
  const h=CHAR.build({id:'player',model:'char.yuting',height:1.75,sex:'m'}), u=h.userData;
  if(u.driver!=='vrm'){ check('（前提）祐廷的 VRM 載得到',false,u.driver); console.log('FAILED '+fails); process.exit(1); }
  const meshes=(re)=>{ const a=[]; h.traverse(o=>{ if(!o.isMesh) return; const mn=((Array.isArray(o.material)?o.material[0]:o.material)||{}).name||''; if(re.test(o.name)||re.test(mn)) a.push(o); }); return a; };
  const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const G=meshes(/^GYM_(TOP|SHORTS)$/), TB=meshes(/_(Tops|Bottoms)_\d+_CLOTH/).filter(o=>o.parent&&o.parent.name==='Body'), SK=meshes(/Body_00_SKIN|Shoes_01/), JK=meshes(/^JACKET_ECON$/), bp=u.props&&u.props.backpack;
  check('② 剛建好：運動服藏著、毛衣褲子在',G.length===2&&G.every(o=>!vis(o))&&TB.length===2&&TB.every(vis),'運動服 '+G.length+'、毛衣褲子 '+TB.length);
  const can=typeof CHAR.setGymWear==='function';
  check('② 有 CHAR.setGymWear',can);
  if(can){
    CHAR.setGymWear(h,true);
    check('② 穿上：運動服顯示、毛衣褲子藏、皮膚鞋子照舊',G.every(vis)&&TB.every(o=>!vis(o))&&SK.every(vis));
    check('② 穿上：舊的外套網格照舊藏著、後背包拿下（setJacket（CANON-NO-ECON-1112 第三批：這一項拿掉））',JK.every(o=>!vis(o))&&(!bp||!bp.visible),'背包 '+(bp?bp.visible:'無'));
    CHAR.setGymWear(h,false);
    check('② 脫下：毛衣褲子、後背包回來，運動服藏；舊的外套網格照舊藏著（CANON-NO-ECON-1112 第三批：這一項拿掉）',G.every(o=>!vis(o))&&TB.every(vis)&&JK.every(o=>!vis(o))&&(!bp||bp.visible));
    CHAR.setProp(h,'backpack',false); CHAR.setGymWear(h,true); CHAR.setGymWear(h,false);
    check('② 原本沒背後背包：脫下運動服後也不背',!bp||!bp.visible); CHAR.setProp(h,'backpack',true);
  }
  const src=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8');
  check('② CHAR.upgrade 換正式模型時照樣穿著運動服',/if\(u\.gymWear\)\{ C\.setGymWear\(nh,true\)/.test(src));
  // ③ fit
  if(can) CHAR.setGymWear(h,true);
  const step=(n,st)=>{ for(let i=0;i<n;i++) CHAR.animate(h,1/30,st||{pose:'idle',speed:0}); h.updateMatrixWorld(true); };
  u.fitBody=1; step(2); const fm=(u.fitMorph||[]).filter(([o])=>/^GYM_/.test(o.name));
  check('③ 運動服跟著體態撐（u.fitBody＝1 時 morph 開）',fm.length===2&&fm.every(([o,i])=>o.morphTargetInfluences[i]===1),'運動服 fit 網格 '+fm.length);
  // ④ 穿模：皮膚和運動服，同一根骨頭、同一段（8 段）、同一個角度（30°）比離軸距離
  const H=u.vrm.humanoid, bw=n=>new THREE.Vector3().setFromMatrixPosition(H.getRawBoneNode(n).matrixWorld), V=new THREE.Vector3();
  const domBone=(o,i)=>{ const si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, acc={}; for(let c=0;c<4;c++){ const w=sw.getComponent(i,c); if(w>0){ const n=o.skeleton.bones[si.getComponent(i,c)].name; acc[n]=(acc[n]||0)+w; } } let b=null,m=0; for(const k in acc) if(acc[k]>m){ m=acc[k]; b=k; } return b; };
  const skin=meshes(/Body_00_SKIN/)[0], tee=G.find(o=>o.name==='GYM_TOP'), sh=G.find(o=>o.name==='GYM_SHORTS');
  const AX={ arm:{bones:/^J_Bip_L_UpperArm$/, a:'leftUpperArm', b:'leftLowerArm', t:[0.06,0.36]}, torso:{bones:/^J_Bip_C_(Spine|Chest|UpperChest)$/, a:'hips', b:'neck', t:[0.30,0.80]}, thigh:{bones:/^J_Bip_L_UpperLeg$/, a:'leftUpperLeg', b:'leftLowerLeg', t:[0.10,0.50]} };
  const poke=(pose,lv)=>{ u.fitBody=lv; u.anim.t=0; step(pose==='sit'?40:(pose==='run'?17:12),{pose,speed:pose==='run'?4.5:0}); const out={};
    for(const k in AX){ const A=AX[k], a=bw(A.a), b=bw(A.b), d=b.clone().sub(a), L=d.length(); d.normalize(); const up=Math.abs(d.y)>0.9?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0), e1=new THREE.Vector3().crossVectors(d,up).normalize(), e2=new THREE.Vector3().crossVectors(d,e1);
      const cell=p=>{ const r=p.clone().sub(a), t=r.dot(d)/L; if(t<A.t[0]||t>A.t[1]) return null; const rr=r.clone().sub(d.clone().multiplyScalar(r.dot(d))); return {k:Math.floor((t-A.t[0])/(A.t[1]-A.t[0])*8)+'|'+Math.floor((Math.atan2(rr.dot(e2),rr.dot(e1))+Math.PI)/(Math.PI/6)), r:rr.length()}; };
      const cloth=k==='thigh'?sh:tee, bins={}; const used=o=>new Set(o.geometry.index?o.geometry.index.array:[]);
      for(const i of used(cloth)){ if(!A.bones.test(domBone(cloth,i)||'')) continue; cloth.getVertexPosition(i,V); cloth.localToWorld(V); const c=cell(V); if(c) bins[c.k]=Math.max(bins[c.k]||0,c.r); }
      let n=0,tot=0; for(const i of used(skin)){ if(!A.bones.test(domBone(skin,i)||'')) continue; skin.getVertexPosition(i,V); skin.localToWorld(V); const c=cell(V); if(!c||bins[c.k]==null) continue; tot++; if(c.r>bins[c.k]+0.002) n++; }
      out[k]=[n,tot]; } return out; };
  if(can){ for(const pose of ['idle','run','sit']) for(const lv of [0,1]){ const r=poke(pose,lv), bad=Object.keys(r).filter(k=>r[k][1]<10||r[k][0]>Math.max(1,0.01*r[k][1]));
    check('④ 不穿模：'+pose+'、體態 '+lv+'（皮膚跑到運動服外面 ≤ 1%）',!bad.length,Object.keys(r).map(k=>k+' '+r[k][0]+'／'+r[k][1]).join('，')); } }
  // ⑥ 短褲在上衣裡面：下襬和腰頭重疊那一段，短褲（骨盆、腰的頂點）離脊椎軸不能比同一段、同一個角度的上衣遠（第一版髖骨那兩點穿出來：CC 截圖「衣襬前面兩個小黑點」）
  if(can){ const shOut=(pose,lv)=>{ u.fitBody=lv; u.anim.t=0; step(pose==='sit'?40:(pose==='run'?17:12),{pose,speed:pose==='run'?4.5:0});
      const a=bw('hips'), b=bw('neck'), d=b.clone().sub(a), L=d.length(); d.normalize(); const e1=new THREE.Vector3().crossVectors(d,new THREE.Vector3(1,0,0)).normalize(), e2=new THREE.Vector3().crossVectors(d,e1);
      const cell=p=>{ const r=p.clone().sub(a), t=r.dot(d)/L; const rr=r.clone().sub(d.clone().multiplyScalar(r.dot(d))); return {k:Math.floor(t*40)+'|'+Math.floor((Math.atan2(rr.dot(e2),rr.dot(e1))+Math.PI)/(Math.PI/12)), r:rr.length()}; };
      const used=o=>new Set(o.geometry.index?o.geometry.index.array:[]), BN=/^J_Bip_C_(Hips|Spine)$/, bins={};
      for(const i of used(tee)){ if(!BN.test(domBone(tee,i)||'')) continue; tee.getVertexPosition(i,V); tee.localToWorld(V); const c=cell(V); bins[c.k]=Math.max(bins[c.k]||0,c.r); }
      let n=0,tot=0; for(const i of used(sh)){ if(!BN.test(domBone(sh,i)||'')) continue; sh.getVertexPosition(i,V); sh.localToWorld(V); const c=cell(V); if(bins[c.k]==null) continue; tot++; if(c.r>bins[c.k]+0.001) n++; } return [n,tot]; };
    for(const pose of ['idle','run','sit']) for(const lv of [0,1]){ const [n,tot]=shOut(pose,lv); check('⑥ 短褲在上衣裡面（下襬重疊那一段）：'+pose+'、體態 '+lv,tot>=10&&n<=Math.max(1,0.01*tot),'跑到上衣外面 '+n+'／'+tot); } }
  // ⑦ 皮膚貼圖：VRoid 原本畫的灰色背心、深色襪子，運動服露出來的地方要是皮膚色（CC 截圖「領口裡面露一塊灰色」「深咖啡色長襪」）；腳踝（鞋口以上 3 cm）白襪
  { const zlib=require('zlib'), b=fs.readFileSync(path.join(ROOT,'assets/models/char/vroid_yuting.vrm')), jl=b.readUInt32LE(12), bin=b.slice(20+jl+8);
    const skinMat=J.materials.findIndex(m=>/Body_00_SKIN/.test(m.name)), ti=J.materials[skinMat].pbrMetallicRoughness.baseColorTexture.index, im=J.images[J.textures[ti].source], bv=J.bufferViews[im.bufferView];
    const png=bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength);
    const decode=buf=>{ let o=8, W=0,H=0,ct=0,idat=[]; while(o<buf.length){ const len=buf.readUInt32BE(o), type=buf.toString('ascii',o+4,o+8), d=buf.slice(o+8,o+8+len); if(type==='IHDR'){ W=d.readUInt32BE(0); H=d.readUInt32BE(4); ct=d[9]; } else if(type==='IDAT') idat.push(d); o+=12+len; }
      const ch=ct===6?4:3, raw=zlib.inflateSync(Buffer.concat(idat)), px=Buffer.alloc(W*H*ch), st=W*ch; let p=0;
      for(let y=0;y<H;y++){ const f=raw[p++]; for(let x=0;x<st;x++){ const a=x>=ch?px[y*st+x-ch]:0, up=y?px[(y-1)*st+x]:0, c=(x>=ch&&y)?px[(y-1)*st+x-ch]:0; let v=raw[p++];
        if(f===1) v+=a; else if(f===2) v+=up; else if(f===3) v+=(a+up)>>1; else if(f===4){ const q=a+up-c, pa=Math.abs(q-a), pb=Math.abs(q-up), pc=Math.abs(q-c); v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?up:c); } px[y*st+x]=v&255; } } return {W,H,ch,px}; };
    let T=null; try{ T=/png/.test(im.mimeType||'png')?decode(png):null; }catch(e){ T=null; }
    if(!T) check('⑦ （前提）讀得到皮膚貼圖（PNG）',false,im.mimeType);
    else { const prim=J.meshes[body.mesh].primitives.find(p=>p.material===skinMat), acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type]; return new Float32Array(bin.buffer.slice(bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0),bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0)+a.count*n*4)); };
      const P=acc(prim.attributes.POSITION), UV=acc(prim.attributes.TEXCOORD_0), I=(()=>{ const a=J.accessors[prim.indices], v=J.bufferViews[a.bufferView], C=a.componentType===5125?Uint32Array:Uint16Array; return new C(bin.buffer.slice(bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0),bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0)+a.count*C.BYTES_PER_ELEMENT)); })();
      const usedV=new Set(I), col=i=>{ const x=Math.min(T.W-1,Math.floor(UV[i*2]*T.W)), y=Math.min(T.H-1,Math.floor(UV[i*2+1]*T.H)), o=(y*T.W+x)*T.ch; return [T.px[o]/255,T.px[o+1]/255,T.px[o+2]/255]; };
      let gray=0,nt=0,dark=0,nl=0,white=0,na=0;
      for(const i of usedV){ const y=P[i*3+1], c=col(i), mx=Math.max(...c), mn=Math.min(...c), ax=Math.abs(P[i*3]);
        if(y>1.25&&y<1.47&&ax<0.2){ nt++; if(mx-mn<0.11&&mx>0.45&&mx<0.85) gray++; }   // 胸口、上背、肩膀（灰色背心那一帶）
        if(y>0.14&&y<0.55&&ax>0.04){ nl++; if(mx<0.4) dark++; }   // 小腿：短褲下面到鞋口上面
        if(y>0.108&&y<0.125&&ax>0.04){ na++; if(mn>0.8) white++; } }   // 腳踝：白襪
      check('⑦ 皮膚貼圖：胸口、肩膀沒有灰色背心',nt>50&&gray===0,'灰色 '+gray+'／'+nt+' 個頂點');
      check('⑦ 皮膚貼圖：小腿沒有深色襪子、腳踝是白襪',nl>30&&dark===0&&na>5&&white>=0.6*na,'深色 '+dark+'／'+nl+'、白襪 '+white+'／'+na); } }
  // ⑤ 什麼時候穿
  const has=typeof FIT.gymWearOn==='function';
  check('⑤ 有 FIT.gymWearOn、FIT.gymWearSync',has&&typeof FIT.gymWearSync==='function');
  if(has&&can){ const GM=z=>({G:{zone:z,day:30,daily:{gym:{fit:90}},flags:{}},E:{player:{obj:h}}});
    globalThis.CLS={peWear:null}; const b1=FIT.gymWearOn(GM('gym_b1')), gy=FIT.gymWearOn(GM('gym')), cp=FIT.gymWearOn(GM('campus')); CLS.peWear='pe@w3'; const pe=FIT.gymWearOn(GM('gym')); CLS.peWear=null;
    check('⑤ B1 穿、1F 球場（沒上課）和校園不穿、上體育課穿',b1&&!gy&&!cp&&pe,JSON.stringify({b1,gy,cp,pe}));
    CHAR.setGymWear(h,false); FIT.sync(GM('gym_b1')); const on=!!u.gymWear&&G.every(vis); FIT.sync(GM('campus')); const off=!u.gymWear&&G.every(o=>!vis(o))&&TB.every(vis);
    check('⑤ FIT.sync 照區域換：進 B1 穿上、出來換回',on&&off); }
  const cls=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
  check('⑤ 體育課：attend 的 inGym 設 CLS.peWear、下課（finally）清掉',/if\(o\.inGym\)\{ S\.peWear=it\.key;/.test(cls)&&/finally \{[^}]*if\(S\.peWear===it\.key\)\{ S\.peWear=null;/.test(cls));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
