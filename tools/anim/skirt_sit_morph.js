// 坐下用的裙子形狀（SKIRT-BENCH-CLIP-1105，LAWWW2-B 2026-11-07；使用者 11-05「路人裙子卡進椅子（體育館一樓長椅截圖）」）
// 起因：路人的 A 字裙（npc_layered.py＋x_xinci_clothes.skirt_weights）只綁臀部＋大腿：前片 0.9、側邊 0.5、後片 0.15 跟大腿，其餘留在臀部（走路時兩腿之間的布才不會被拉開）。
//   坐下時大腿往前 85°，留在臀部的那一份照樣直直往下垂——量過（Node、遊戲自己的坐姿、體育館長椅 0.42～0.47 m）：八個穿裙子的路人，
//   裙子在椅面範圍裡低於椅面的頂點 265～301 個、最深 31～57 cm（從椅面一路穿到地上），側邊斜 45° 變成一個大喇叭。
// 這裡不改權重（走路、上下樓梯完全不變），在裙子網格加一個 morph target「skirt_sit」：遊戲坐下（靜態坐姿）時開 1、站起來關 0（character3d.js 的 patch）。
// 目標形狀照遊戲自己的坐姿算（CHAR.build＋CHAR.animate pose sit 40 格，和 sit_pose_export.js 一樣）：
//   ① 髖關節以下的頂點跟同一側的大腿（剛體），膝蓋上 6 cm～膝蓋下 10 cm 漸漸換成跟小腿（從膝蓋垂下）；左右在中線 ±3.5 cm 漸變；
//      髖關節上 4 cm～下 10 cm 從「現在的位置」漸漸換成上面這個（裙頭、腰不動）。
//   ② A 字往外放的部分：前面收到 KF（0.25；不然坐下時放寬的量全部往上翹，在腿上鼓成一個圓頂、把放在腿上的手蓋住）；
//   ③ 大腿外側（|x| 超過髖關節＋大腿半徑 RTH）往下垂到椅面（斜率 DROOP），不是水平伸出去；
//   ④ 椅面：人物座標（x 左、y 上、z 前，原點＝座位的地面）z＜ZE、y＜YS、|x|＜XB 的盒子裡的點推到最近的面（上面＝攤在椅面、前面＝從椅子前緣垂下）。
//      YS＝0.478（遊戲的椅面 0.45～0.485，坐下的高度讓大腿底部在 0.465：C.SIT_FIT）、ZE＝0.26（教室翻椅前緣 0.25、椅子 0.22、體育館長椅 0.19）、XB＝0.40。
//   然後反推綁定空間的位移：同一組權重的蒙皮是仿射的，位移＝(蒙皮的線性部分)⁻¹·(目標−現在)。
// 遠距離版本（lod/*.lod.glb，tools/lod/npc_lod.py：同一副骨架、同一個綁定空間；頂點是原本頂點的子集）：位置一樣的頂點用同一份位移。
// 用法（開發分支的根目錄；不覆蓋原檔）：node tools/anim/skirt_sit_morph.js <輸出資料夾> char.npc_nf9,char.npc_nf10,... [--obj] [--params '{"kf":0.25}']
//   輸出：<輸出>/<檔名>.vrm、<輸出>/lod/<檔名>.lod.glb（有的話）、--obj 時 <輸出>/obj/<名字>_{before,after}.obj（給 Blender 拍）、<輸出>/report.json
const path=require('path'), fs=require('fs');
const ROOTDIR=path.resolve(__dirname,'../..');
const {preload}=require(path.join(ROOTDIR,'tools/dev_scratch/spring_sim/harness.js'));
const argv=process.argv.slice(2), OUT=argv[0], KEYS=(argv[1]||'').split(',').filter(Boolean), OBJ=argv.includes('--obj');
const P=argv.includes('--params')?JSON.parse(argv[argv.indexOf('--params')+1]):{};
const C0={ys:0.478,ze:0.26,xb:0.40,kf:0.25,kb:1.0,droop:1.5,rth:0.075,lo0:0.06,lo1:-0.10,hip0:0.04,hip1:-0.10};
const K=Object.assign({},C0,P);
const BENCH={top:0.47,bot:0.42,z0:-0.31,z1:0.19,x:0.30};   // 體育館一樓長椅（gym_interior.py：椅面 0.42～0.47、深 0.5；人物坐在中心前 6 cm）
const sstep=(a,b,x)=>{ let t=(x-a)/(b-a); t=t<0?0:t>1?1:t; return t*t*(3-2*t); };
const NAME='skirt_sit';

// ---------- glTF（GLB）讀寫 ----------
function readGLB(file){ const b=fs.readFileSync(file); let off=12, J=null, BIN=null; while(off<b.length){ const len=b.readUInt32LE(off), typ=b.readUInt32LE(off+4); const d=b.subarray(off+8,off+8+len); if(typ===0x4E4F534A) J=JSON.parse(d.toString('utf8')); else if(typ===0x004E4942) BIN=Buffer.from(d); off+=8+len; } return {J,BIN}; }
function writeGLB(file,J,BIN){ let js=Buffer.from(JSON.stringify(J),'utf8'); const pj=(4-js.length%4)%4; js=Buffer.concat([js,Buffer.alloc(pj,0x20)]); const pb=(4-BIN.length%4)%4; const bin=Buffer.concat([BIN,Buffer.alloc(pb,0)]);
  const h=Buffer.alloc(12); h.writeUInt32LE(0x46546C67,0); h.writeUInt32LE(2,4); h.writeUInt32LE(12+8+js.length+8+bin.length,8); const c1=Buffer.alloc(8); c1.writeUInt32LE(js.length,0); c1.writeUInt32LE(0x4E4F534A,4); const c2=Buffer.alloc(8); c2.writeUInt32LE(bin.length,0); c2.writeUInt32LE(0x004E4942,4);
  fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,Buffer.concat([h,c1,js,c2,bin])); }
function accRead(J,BIN,i){ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type]; if(a.componentType!==5126||(v.byteStride&&v.byteStride!==n*4)) throw new Error('accessor '+i+' 不是緊密的 float');
  const off=(v.byteOffset||0)+(a.byteOffset||0); return new Float32Array(BIN.buffer.slice(BIN.byteOffset+off,BIN.byteOffset+off+a.count*n*4)); }
function idxRead(J,BIN,i){ const a=J.accessors[i], v=J.bufferViews[a.bufferView], off=(v.byteOffset||0)+(a.byteOffset||0), T={5121:Uint8Array,5123:Uint16Array,5125:Uint32Array}[a.componentType]; return new T(BIN.buffer.slice(BIN.byteOffset+off,BIN.byteOffset+off+a.count*T.BYTES_PER_ELEMENT)); }
const key3=(x,y,z)=>Math.fround(x)+','+Math.fround(y)+','+Math.fround(z);
// 加（或換掉）mesh 的 morph target：getDelta(primitive, POSITION 陣列) → Float32Array（同樣長度）或 null（全部 0：不佔資料，accessor 沒有 bufferView）
function addTarget(J,BINref,mi,getDelta){ const mesh=J.meshes[mi]; const cache=new Map(); let moved=0;
  for(const p of mesh.primitives){ const pa=p.attributes.POSITION; let acc=cache.get(pa);
    if(acc==null){ const pos=accRead(J,BINref.BIN,pa), d=getDelta(p,pos), cnt=J.accessors[pa].count;
      if(d){ const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(let i=0;i<cnt;i++) for(let k=0;k<3;k++){ const x=d[i*3+k]; if(x<mn[k]) mn[k]=x; if(x>mx[k]) mx[k]=x; } for(let i=0;i<cnt;i++) if(Math.abs(d[i*3])+Math.abs(d[i*3+1])+Math.abs(d[i*3+2])>1e-6) moved++;
        let B=BINref.BIN; const pad=(4-B.length%4)%4; if(pad) B=Buffer.concat([B,Buffer.alloc(pad)]); const off=B.length; B=Buffer.concat([B,Buffer.from(d.buffer,d.byteOffset,d.byteLength)]); BINref.BIN=B;
        J.bufferViews.push({buffer:0,byteOffset:off,byteLength:d.byteLength}); J.accessors.push({bufferView:J.bufferViews.length-1,componentType:5126,count:cnt,type:'VEC3',min:mn,max:mx}); }
      else J.accessors.push({componentType:5126,count:cnt,type:'VEC3',min:[0,0,0],max:[0,0,0]});
      acc=J.accessors.length-1; cache.set(pa,acc); }
    const old=(mesh.extras&&mesh.extras.targetNames)||[]; const ti=old.indexOf(NAME); p.targets=p.targets||[]; if(ti>=0) p.targets[ti]={POSITION:acc}; else p.targets.push({POSITION:acc}); }
  const names=(mesh.extras&&mesh.extras.targetNames)||[]; if(!names.includes(NAME)){ mesh.extras=Object.assign({},mesh.extras,{targetNames:names.concat([NAME])}); mesh.weights=(mesh.weights||names.map(()=>0)).concat([0]); }
  J.buffers[0].byteLength=BINref.BIN.length; return moved; }

// ---------- 坐姿、目標位置 ----------
function benchStats(h,o,morph){ const V=new THREE.Vector3(), PA=o.geometry.attributes.position, used=new Set(o.geometry.index.array); if(o.morphTargetInfluences&&morph!=null) o.morphTargetInfluences[morph.i]=morph.w;
  let inSeat=0, below=0, maxD=0; for(const i of used){ o.getVertexPosition(i,V); o.localToWorld(V); h.worldToLocal(V); if(Math.abs(V.x)>BENCH.x||V.z<BENCH.z0||V.z>BENCH.z1||V.y>=BENCH.top-0.003) continue; inSeat++; if(V.y<BENCH.bot) below++; maxD=Math.max(maxD,BENCH.top-V.y); }
  return {inSeat,below,maxDepth:+maxD.toFixed(3)}; }
function seatedDelta(h,o){ const bones=o.skeleton.bones, bi=n=>bones.findIndex(b=>b.name===n), UL=[bi('J_Bip_L_UpperLeg'),bi('J_Bip_R_UpperLeg')], LL=[bi('J_Bip_L_LowerLeg'),bi('J_Bip_R_LowerLeg')];
  if([...UL,...LL].some(i=>i<0)) throw new Error('裙子網格沒有綁到腿的骨頭');
  const bindInv=o.bindMatrix.clone().invert(), restOf=i=>new THREE.Vector3().applyMatrix4(o.skeleton.boneInverses[i].clone().invert()).applyMatrix4(bindInv);
  const hipL=restOf(UL[0]), hipR=restOf(UL[1]), knL=restOf(LL[0]), knR=restOf(LL[1]), hipY=(hipL.y+hipR.y)/2, kneeY=(knL.y+knR.y)/2, sgn=Math.sign(hipL.x-hipR.x), cz=(hipL.z+hipR.z)/2;
  const M=new THREE.Matrix4(), rigid=(b,v)=>{ M.multiplyMatrices(bones[b].matrixWorld,o.skeleton.boneInverses[b]); return v.clone().applyMatrix4(o.bindMatrix).applyMatrix4(M).applyMatrix4(o.bindMatrixInverse).applyMatrix4(o.matrixWorld); };
  const skinW=(i,v)=>{ const t=v.clone(); o.applyBoneTransform(i,t); return t.applyMatrix4(o.matrixWorld); };
  const G=o.geometry, PA=G.attributes.position, used=[...new Set(G.index.array)], n=PA.count, delta=new Float32Array(n*3);
  // ② 每個方向（48 等分）臀圍線（髖關節下 10 cm）的半徑
  const NB=48, r0=new Array(NB).fill(null), dy0=new Array(NB).fill(1e9), ang=v=>Math.atan2(v.x,-(v.z-cz)), binOf=t=>((Math.round(t/(2*Math.PI)*NB)%NB)+NB)%NB;
  for(const i of used){ const v=new THREE.Vector3().fromBufferAttribute(PA,i), dy=Math.abs(v.y-(hipY-0.10)), b=binOf(ang(v)); if(dy<dy0[b]-1e-6){ dy0[b]=dy; r0[b]=Math.hypot(v.x,v.z-cz); } }
  for(let b=0;b<NB;b++) if(r0[b]==null) r0[b]=r0[(b+1)%NB]||r0[(b+NB-1)%NB]||0;
  const hipLs=h.worldToLocal(bones[UL[0]].getWorldPosition(new THREE.Vector3())), hipRs=h.worldToLocal(bones[UL[1]].getWorldPosition(new THREE.Vector3())), XO=Math.max(Math.abs(hipLs.x),Math.abs(hipRs.x))+K.rth;
  let moved=0, maxd=0;
  for(const i of used){ const v=new THREE.Vector3().fromBufferAttribute(PA,i), a=sstep(hipY+K.hip0,hipY+K.hip1,v.y); if(a<=0) continue;
    const sL=sstep(-0.035,0.035,sgn*v.x), wl=sstep(kneeY+K.lo0,kneeY+K.lo1,v.y);
    const t=ang(v), r=Math.hypot(v.x,v.z-cz), f=Math.cos(t), e=Math.max(0,r-r0[binOf(t)]), k=f>0?1-f*(1-K.kf):1+f*(1-K.kb), rr=r-e+e*k;
    const vv=r>1e-6?new THREE.Vector3(Math.sin(t)*rr,v.y,cz-Math.cos(t)*rr):v.clone();
    const th=rigid(UL[0],vv).multiplyScalar(sL).add(rigid(UL[1],vv).multiplyScalar(1-sL)), sh=rigid(LL[0],vv).multiplyScalar(sL).add(rigid(LL[1],vv).multiplyScalar(1-sL));
    const c0=skinW(i,v), T=c0.clone().multiplyScalar(1-a).add(th.multiplyScalar(1-wl).add(sh.multiplyScalar(wl)).multiplyScalar(a));
    const L=h.worldToLocal(T.clone());
    { const ex=Math.abs(L.x)-XO; if(ex>0&&a>0.5&&wl<0.5) L.y=Math.max(Math.min(L.y,K.ys),L.y-K.droop*ex*(1-wl)); }
    if(L.z<K.ze&&L.y<K.ys&&Math.abs(L.x)<K.xb){ if(K.ys-L.y<K.ze-L.z) L.y=K.ys; else L.z=K.ze; }
    h.localToWorld(T.copy(L));
    const cols=[[1,0,0],[0,1,0],[0,0,1]].map(ev=>skinW(i,v.clone().add(new THREE.Vector3(...ev))).sub(c0));
    const A=new THREE.Matrix3().set(cols[0].x,cols[1].x,cols[2].x, cols[0].y,cols[1].y,cols[2].y, cols[0].z,cols[1].z,cols[2].z); if(Math.abs(A.determinant())<1e-8) continue; A.invert();
    const d=T.sub(c0).applyMatrix3(A); delta[i*3]=d.x; delta[i*3+1]=d.y; delta[i*3+2]=d.z; if(d.length()>1e-5){ moved++; maxd=Math.max(maxd,d.length()); } }
  return {delta,moved,maxd,hipY,kneeY}; }
function exportOBJ(h,file){ const V=new THREE.Vector3(); let obj='mtllib '+path.basename(file,'.obj')+'.mtl\n', mtl='', nv=0; const mats={};
  const COL=n=>{ n=String(n||''); if(/HAIR/i.test(n)) return [0.30,0.22,0.17]; if(/SKIN|FACE|Face_/i.test(n)) return [0.93,0.80,0.71]; if(/EYE|Iris|Brow|lash|line|Mouth/i.test(n)) return [0.25,0.2,0.2]; if(/Shoe|Loafer|Sneaker|Boot/i.test(n)) return [0.18,0.18,0.2]; if(/Bottom|Pants|Skirt|Jeans/i.test(n)) return [0.25,0.32,0.48]; return [0.78,0.80,0.84]; };
  h.traverse(x=>{ if(!x.isMesh||/blobShadow|npc_far/i.test(x.name||'')) return; let vis=true; for(let p=x;p;p=p.parent) if(p.visible===false) vis=false; if(!vis) return;
    const ms=Array.isArray(x.material)?x.material:[x.material], g=x.geometry, pa=g.attributes.position;
    for(let v=0;v<pa.count;v++){ x.getVertexPosition(v,V); x.localToWorld(V); obj+='v '+V.x.toFixed(4)+' '+V.y.toFixed(4)+' '+V.z.toFixed(4)+'\n'; }
    const idx=g.index?g.index.array:null, groups=g.groups&&g.groups.length?g.groups:[{start:0,count:idx?idx.length:pa.count,materialIndex:0}];
    for(const gr of groups){ const mt=ms[gr.materialIndex]||ms[0], mn=(mt&&mt.name)||'m'; if(/\(Outline\)/.test(mn)) continue; if(!mats[mn]){ mats[mn]='m'+Object.keys(mats).length; mtl+='newmtl '+mats[mn]+'\nKd '+COL(mn).join(' ')+'\n'; }
      obj+='usemtl '+mats[mn]+'\n'; for(let k=gr.start;k<gr.start+gr.count;k+=3){ const a=idx?idx[k]:k, b=idx?idx[k+1]:k+1, c=idx?idx[k+2]:k+2; obj+='f '+(nv+a+1)+' '+(nv+b+1)+' '+(nv+c+1)+'\n'; } }
    nv+=pa.count; });
  fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file,obj); fs.writeFileSync(file.replace(/\.obj$/,'.mtl'),mtl); }

(async()=>{
  if(!OUT||!KEYS.length){ console.error('用法：node tools/anim/skirt_sit_morph.js <輸出資料夾> char.npc_nf9,... [--obj] [--params json]'); process.exit(2); }
  fs.mkdirSync(OUT,{recursive:true}); await preload(KEYS);
  { const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOTDIR,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOTDIR,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  const scene=new THREE.Scene(), report={params:K,bench:BENCH,models:{}};
  for(const key of KEYS){ let sd=7; CHAR.ambRand=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; }; if(CHAR._ambReset) CHAR._ambReset();
    const m=ASSETS.manifest[key], file=path.basename(m.url), h=CHAR.build({model:key,height:m.height}); scene.add(h);
    for(let i=0;i<4;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); for(let i=0;i<40;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    let o=null; h.traverse(x=>{ if(x.isSkinnedMesh&&x.name!=='npc_far'&&/Bottom|Skirt/.test((Array.isArray(x.material)?x.material[0]:x.material).name)) o=x; });
    if(!o){ console.log(key,'沒有 Bottom 網格，跳過'); scene.remove(h); continue; }
    const had=o.morphTargetDictionary&&o.morphTargetDictionary[NAME]!=null; if(had) o.morphTargetInfluences[o.morphTargetDictionary[NAME]]=0;   // 已經有的話：從原本的形狀重算（坐姿的 patch 會把它打開）
    if(OBJ) exportOBJ(h,path.join(OUT,'obj',key.replace(/^char\./,'')+'_before.obj'));
    const before=benchStats(h,o,null), R=seatedDelta(h,o);
    // 套回去量（不用寫檔）：位置 → 位移的對照表（遠距離版本、寫 VRM 用）
    const G=o.geometry, PA=G.attributes.position, byPos=new Map(); for(const i of new Set(G.index.array)) byPos.set(key3(PA.getX(i),PA.getY(i),PA.getZ(i)),[R.delta[i*3],R.delta[i*3+1],R.delta[i*3+2]]);
    const keep={pos:G.morphAttributes.position,rel:G.morphTargetsRelative}; G.morphAttributes.position=[new THREE.BufferAttribute(R.delta,3)]; G.morphTargetsRelative=true; const dict=o.morphTargetDictionary, inf=o.morphTargetInfluences; o.updateMorphTargets(); o.morphTargetInfluences[0]=1;
    const after=benchStats(h,o,null); if(OBJ) exportOBJ(h,path.join(OUT,'obj',key.replace(/^char\./,'')+'_after.obj'));
    G.morphAttributes.position=keep.pos||[]; G.morphTargetsRelative=keep.rel; o.morphTargetDictionary=dict; o.morphTargetInfluences=inf;
    // VRM：Bottom 的 mesh 加 morph target
    const src=readGLB(path.join(ROOTDIR,m.url)), J=src.J, ref={BIN:src.BIN}; const mi=J.meshes.findIndex(me=>me.primitives.some(p=>p.material!=null&&/Bottom|Skirt/.test(J.materials[p.material].name||'')));
    let miss=0; const vrmMoved=addTarget(J,ref,mi,(p,pos)=>{ if(!(p.material!=null&&/Bottom|Skirt/.test(J.materials[p.material].name||''))&&!J.meshes[mi].primitives.some(q=>q!==p&&q.attributes.POSITION===p.attributes.POSITION)) return null;
      const used=new Set(idxRead(J,ref.BIN,J.meshes[mi].primitives.find(q=>q.attributes.POSITION===p.attributes.POSITION&&/Bottom|Skirt/.test(J.materials[q.material].name||'')).indices)); const d=new Float32Array(pos.length);
      for(const i of used){ const r=byPos.get(key3(pos[i*3],pos[i*3+1],pos[i*3+2])); if(!r){ miss++; continue; } d[i*3]=r[0]; d[i*3+1]=r[1]; d[i*3+2]=r[2]; } return d; });
    writeGLB(path.join(OUT,file),J,ref.BIN);
    // 遠距離版本
    let lod=null; const lu=ASSETS.lodUrl&&ASSETS.lodUrl(key);
    if(lu&&fs.existsSync(path.join(ROOTDIR,lu))){ const L=readGLB(path.join(ROOTDIR,lu)), lref={BIN:L.BIN}; let match=0; const lmi=L.J.meshes.findIndex(me=>me.primitives.some(p=>/body/i.test((L.J.materials[p.material]||{}).name||'')));
      const lm=addTarget(L.J,lref,lmi,(p,pos)=>{ if(!/body/i.test((L.J.materials[p.material]||{}).name||'')) return null; const d=new Float32Array(pos.length); for(let i=0;i<pos.length/3;i++){ const r=byPos.get(key3(pos[i*3],pos[i*3+1],pos[i*3+2])); if(r){ match++; d[i*3]=r[0]; d[i*3+1]=r[1]; d[i*3+2]=r[2]; } } return d; });
      writeGLB(path.join(OUT,'lod',path.basename(lu)),L.J,lref.BIN); lod={file:'lod/'+path.basename(lu),skirtVerts:match,moved:lm}; }
    report.models[key]={file,height:m.height,hipY:+R.hipY.toFixed(3),kneeY:+R.kneeY.toFixed(3),moved:R.moved,maxDelta:+R.maxd.toFixed(3),vrmMoved,missing:miss,before,after,lod,replaced:had};
    console.log(key.padEnd(16),'椅面裡',before.inSeat,'→',after.inSeat,'（最深',before.maxDepth,'→',after.maxDepth,'m）','位移',R.moved,'個、最大',R.maxd.toFixed(3),'VRM',vrmMoved,miss?('對不到 '+miss):'','LOD',lod?lod.skirtVerts:'-');
    scene.remove(h); if(CHAR.release) CHAR.release(h); }
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,1));
})().catch(e=>{ console.error(e); process.exit(2); });
