// 共同教學館關著的房間（洗手間、203）的門＝furniture_study.glb 的門模組（ART-02）——不需要瀏覽器。
// 原本：src/teach3d.js 在牆的走廊那一面貼一塊木板（BoxGeometry），沒有門框、門牌。共同教學館沒有正式室內殼，所以玩家看到的一直是那塊板。
// 做法：寬 1.2 m 的門換成模組的門框＋關著的門片＋門牌（字由遊戲畫）；牆沒有開口，門片貼在走廊那一面、門框往走廊移，門片凹進門框 1.5 cm。
// 這裡在 Node 建出三棟教學館（程序化備用＋從 GLB 讀出門模組的真正網格），檢查：
//  ①換上門模組、木板藏起來（修改前沒有門模組＝FAIL）②每扇門的門片、門框、門牌和牆的相對位置（沒有插進牆、沒有凸到房間裡、門片在門洞寬度裡、門牌在牆上）
//  ③門牌的字 ④導航、互動點和沒換之前一樣 ⑤門模組放在備用模型群組裡（博雅、普通的正式室內殼載入後跟著藏起來）。
// 用法：node tests/teach_doors_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; let tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
/* furniture_study.glb 的網格（只讀位置和索引；貼圖在 Node 讀不了）：照 glTF 的 accessor 自己讀 */
function glbMeshes(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8), out={};
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  for(const nd of J.nodes){ if(nd.mesh==null) continue; const g=new THREE.BufferGeometry(); const pr=J.meshes[nd.mesh].primitives[0]; g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial()); m.name=nd.name; out[nd.name]=m; } return out; }
const GLB=path.join(ROOT,'assets/models/env/second_ai/furniture_study.glb'), meshes=glbMeshes(GLB);
const scene=new THREE.Group(); for(const k in meshes) scene.add(meshes[k]);
let loads=[]; ASSETS.loadOne=k=>{ if(k!=='prop.furniture_study') return new Promise(()=>{}); const p=Promise.resolve({scene}); loads.push(p); return p; };   /* 只給家具模組；正式室內殼不載（＝共同教學館的實際情況）*/
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const WT=0.2, wb=new THREE.Box3(), vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
(async()=>{
  for(const id of ['gongtong','boya','putong']){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; loads=[];
    const L=Z3.ZONES[id].build?null:null; const z=Z3.ZONES[id].build(E); const Ly=z.layout; tag='['+Ly.name+'] '; if(P3.mergeStatic&&!Z3.ZONES[id].noMerge) P3.mergeStatic(z.group);
    const doors=Ly.rooms.filter(r=>r.kind==='closed'&&Math.abs(r.door[1]-r.door[0]-1.2)<0.02);
    const navBefore=[]; for(const r of doors){ const dz=r.doorZ!=null?r.doorZ:r.z0, out=Math.abs(dz-r.z1)<1e-6?1:-1; navBefore.push(E.canStand((r.door[0]+r.door[1])/2,dz+out*0.9,0.32,r.lv)); }
    const itBefore=E.interactables.length;
    await Promise.all(loads); await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
    const glbs=[]; z.group.traverse(o=>{ if(o.name==='doors_glb') glbs.push(o); }); const fbs=[]; z.group.traverse(o=>{ if(o.name==='door_fallback') fbs.push(o); });
    if(id==='gongtong') check('關著的門換成門模組（'+doors.map(r=>r.id).join('、')+'）、木板藏起來',doors.length===3&&glbs.length===2&&fbs.length===2&&fbs.every(f=>!f.visible)&&glbs.every(vis),`門 ${doors.length}、門模組群組 ${glbs.length}、木板群組 ${fbs.length}（看得到 ${fbs.filter(vis).length}）`);
    else check('寬 1.2 m 的關門（'+doors.length+' 扇）有門模組',glbs.reduce((n,g)=>n+g.children.filter(c=>c.isInstancedMesh&&c.name==='door_leaf_closed').reduce((a,c)=>a+c.count,0),0)===doors.length);
    /* 每扇門：照實例矩陣算出門框、門片、門牌在世界座標的範圍，和牆比 */
    /* 門片本身（不含兩面的把手、觀景窗、踢腳板）：門片是一個方塊，頂點只在上下緣——取離地 1.8 cm 以下、2.33 m 以上的頂點（踢腳板從 2 cm 起、把手在 1 m）*/
    const coreBox=g=>{ const P=g.attributes.position, bx=new THREE.Box3(), v=new THREE.Vector3(); for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i); if(v.y<0.018||v.y>2.33) bx.expandByPoint(v); } return bx; };
    const inst={}; for(const g of glbs) for(const c of g.children) if(c.isInstancedMesh){ for(let i=0;i<c.count;i++){ const M=new THREE.Matrix4(); c.getMatrixAt(i,M); M.premultiply(c.matrixWorld); const bx=c.geometry.boundingBox||(c.geometry.computeBoundingBox(),c.geometry.boundingBox); (inst[c.name]=inst[c.name]||[]).push(bx.clone().applyMatrix4(M));
      if(c.name==='door_leaf_closed') (inst.leaf_core=inst.leaf_core||[]).push(coreBox(c.geometry).applyMatrix4(M)); } }
    const texts=[]; for(const g of glbs) for(const c of g.children) if(c.name==='door_plate_text') texts.push(c);
    let bad=[]; for(const r of doors){ const dz=r.doorZ!=null?r.doorZ:r.z0, out=Math.abs(dz-r.z1)<1e-6?1:-1, dx=(r.door[0]+r.door[1])/2, y0=r.lv?Ly.floors[1].y:0, wf=dz+out*WT/2, wbk=dz-out*WT/2;
      const near=bs=>(bs||[]).find(b=>{ const c=b.getCenter(new THREE.Vector3()); return Math.abs(c.z-dz)<0.4&&Math.abs(c.y-(y0+1.2))<1.5&&Math.abs(c.x-dx)<1.3; });
      const lfAll=near(inst.door_leaf_closed), lf=near(inst.leaf_core), fr=near(inst.door_frame), pl=near(inst.door_plate); if(!lfAll||!lf||!fr||!pl){ bad.push(r.id+'：找不到門片／門框／門牌'); continue; }
      const zin=b=>out>0?b.min.z:-b.max.z, zout=b=>out>0?b.max.z:-b.min.z, f=v=>out>0?v:-v;   /* 沿著「往走廊」的方向量 */
      if(zin(lf)<f(wf)+0.001) bad.push(r.id+'：門片插進牆裡（門片背面 '+(zin(lf)-f(wf)).toFixed(4)+' m）');
      if(zout(fr)-zout(lf)<0.01) bad.push(r.id+'：門片沒有凹進門框（差 '+(zout(fr)-zout(lf)).toFixed(4)+' m）');
      if(zin(fr)<f(wbk)+0.005) bad.push(r.id+'：門框凸到房間那一面');
      if(zin(lfAll)<f(wbk)+0.005) bad.push(r.id+'：門片背面的把手穿到房間那一面');
      if(lf.min.x<r.door[0]-0.001||lf.max.x>r.door[1]+0.001) bad.push(r.id+'：門片超出門洞寬度');
      if(Math.abs(zin(pl)-f(wf))>0.003) bad.push(r.id+'：門牌沒貼在牆面（差 '+(zin(pl)-f(wf)).toFixed(4)+'）');
      const wall=Ly.walls.find(w=>(w.lv|0)===(r.lv|0)&&Math.abs(w.z0-dz)<1e-6&&Math.abs(w.z1-dz)<1e-6&&Math.min(w.x0,w.x1)<=pl.min.x&&Math.max(w.x0,w.x1)>=pl.max.x);
      if(!wall) bad.push(r.id+'：門牌不在那一道牆的範圍裡'); else if((wall.gaps||[]).some(([a,b])=>pl.max.x>Math.min(a,b)&&pl.min.x<Math.max(a,b))) bad.push(r.id+'：門牌在牆的開口上');
      if(fr.max.y>y0+(r.lv?(Ly.roofY-Ly.floors[1].y):Ly.ceil0)) bad.push(r.id+'：門框高過天花板');
      const tx=texts.find(t=>t.position.distanceTo(pl.getCenter(new THREE.Vector3()))<0.05); if(!tx) bad.push(r.id+'：門牌沒有字'); else { const want=String(r.plate||r.label).replace(/（.*?）/g,'').trim(); const key=Object.keys(W3).length&&tx.material.map&&tx.material.map.image?'':''; if(f(tx.position.z)<zout(pl)-0.0005) bad.push(r.id+'：字在門牌面後面'); tx.userData.want=want; } }
    check('門片貼在走廊那一面（不插進牆）、凹進門框、門框和背面的把手沒凸到房間裡、門片在門洞寬度裡、門牌貼在牆上（不在開口上）、門框低於天花板、門牌有字',!bad.length,bad.slice(0,4).join('；')||(doors.length+' 扇'));
    if(id==='gongtong'){ const want=['洗手間','洗手間','共同 203']; const got=texts.map(t=>t.userData.want).sort(); check('門牌的字：'+want.join('、'),JSON.stringify(got)===JSON.stringify(want.slice().sort()),got.join('、')); }
    const navAfter=doors.map(r=>{ const dz=r.doorZ!=null?r.doorZ:r.z0, out=Math.abs(dz-r.z1)<1e-6?1:-1; return E.canStand((r.door[0]+r.door[1])/2,dz+out*0.9,0.32,r.lv); });
    check('門口站得住、互動點數量不變（門模組不改導航和互動）',JSON.stringify(navBefore)===JSON.stringify(navAfter)&&navAfter.every(Boolean)&&E.interactables.length===itBefore,`站得住 ${navAfter.filter(Boolean).length}/${navAfter.length}、互動點 ${itBefore}→${E.interactables.length}`);
    const under=glbs.every(g=>{ for(let p=g.parent;p;p=p.parent) if(p.name==='fallback0'||p.name==='fallback1') return true; return false; });
    check('門模組放在備用模型群組（fallback0／fallback1）裡：正式室內殼載入後跟著藏起來',under&&glbs.length>0);
  }
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})();
