// 舊序章人物己自己的 3D 模型（US-LONG-3D-1110，LAWWW2 帳號 A 11-10；LAWWW 15:45 派；企劃 AA_80 5-2、AA_145 3-5）——不需要瀏覽器（D131）。
// 兩個行程：
//   主行程：spring_sim harness（真正的 three.js、three-vrm、ASSETS、CHAR、PROPS），載入 char.us_long、眼鏡、鑰匙圈的 GLB，量：
//     1 manifest：char.us_long 是 VRM、檔案在、身高 1.76、lazy、不是路人池（沒有 ambient／anon）；眼鏡、鑰匙圈的 GLB 在
//     2 CHAR.build：用 VRM（不是備用）；量出來的身高（頭頂）1.70～1.82 m；配件有圓框眼鏡（prop.glasses_long，不是芷若的）、後背包、奶茶杯鑰匙圈
//     3 眼鏡：GLB 換上（程式產生的版本藏起來）；在兩眼前面 2～9 cm、高度和眼睛差 ≤ 2 cm、左右置中 ≤ 1 cm
//     4 鑰匙圈：GLB 換上；在背後（比背包的前袋外側再後面）、不插進前袋（杯子的每一點都在前袋外面）、在前袋的高度範圍裡（不垂到背包下面）、在背包左右寬度以內
//   --wiring 子行程：pg_harness＋美國篇的檔案（us_life3d.js），量 USL.specOf：
//     5 舊序章人物己（教室、會所都走 specOf）要 char.us_long、開始下載（loadOne 一次）；其他有名字的人（韓國同學）不受影響
//     6 下載失敗：之後的舊序章人物己不再要那個模型（用路人的樣子）；已經在場、藏起來等模型的人露出來
// 修改前（開發分支 97979ca46）：1～6 FAIL（沒有這個模型、配件、接線）。用法：node tests/us_long_model_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

/* ============ 接線（另一個行程：pg_harness 把 CHAR 換成假的）============ */
if(process.argv[2]==='--wiring'){
  const vm=require('vm');
  const H=require('./pg_harness.js');
  global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
  const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|ROM|PORTRAIT_ONLY|US_CLASSROOM)$/;
  const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  const out={err:[]};
  for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_classroom_layout.js','src/y34b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js']){ try{ load(f); }catch(e){ out.err.push(f+'：'+e.message); } }
  (async()=>{
    const loads=[]; let fail=false;
    global.ASSETS={manifest:{'char.us_long':{url:'x.vrm',type:'vrm'}},has:()=>false,loadOne:k=>{ loads.push(k); return fail?Promise.reject(new Error('404')):new Promise(()=>{}); }};
    const sp=typeof USL!=='undefined'&&USL.specOf;
    if(!sp){ out.noSpecOf=true; process.stdout.write(JSON.stringify(out)); return; }
    const L1=sp({who:'long'},0,'lw'), L2=sp({who:'long'},3,'lw'), K=sp({who:'korean'},1,'intro');
    out.ok5={long:L1.model||null,long2:L2.model||null,korean:K.model||null,loads:loads.slice(),hasOutfit:!!(L1.outfit&&L1.hair)};
    // 下載失敗
    USL._longFail=false; USL._longLoading=false; fail=true; loads.length=0;
    const kid={visible:false}, n={obj:{children:[kid],userData:{wantModel:'char.us_long',degradedHidden:true}}};
    global.GAME={E:{npcs:[n]}};
    sp({who:'long'},0,'lw'); for(let i=0;i<5;i++) await new Promise(r=>setTimeout(r,0));
    const L3=sp({who:'long'},0,'lw');
    out.ok6={loads:loads.slice(),after:L3.model||null,revealed:kid.visible===true&&n.obj.userData.degradedHidden===false&&n.obj.userData.wantModel===null};
    process.stdout.write(JSON.stringify(out));
  })();
  return;
}

const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const KEY='char.us_long', cm=v=>(v*100).toFixed(1)+' cm';
const tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  // 1 manifest
  const m=ASSETS.manifest[KEY], g=ASSETS.manifest['prop.glasses_long'], k=ASSETS.manifest['prop.keychain_milktea'];
  check('1. manifest：char.us_long 是 VRM、檔案在、身高 1.76、lazy、不是路人池',!!m&&m.type==='vrm'&&fs.existsSync(path.join(ROOT,m.url))&&m.height===1.76&&m.lazy===true&&!m.ambient&&!m.anon,m?m.url:'沒有');
  check('1. manifest：圓框眼鏡、奶茶杯鑰匙圈的 GLB 在',!!g&&!!k&&fs.existsSync(path.join(ROOT,g.url))&&fs.existsSync(path.join(ROOT,k.url)));
  if(!m||!g||!k){ console.log('FAILED: '+(fails+5)); process.exit(1); }
  await preload([KEY,'prop.glasses_long','prop.keychain_milktea']);
  // 2 build
  const scene=new THREE.Scene(); const h=CHAR.build({model:KEY,height:1.76}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
  for(let i=0;i<10;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); await tick(); }
  for(let i=0;i<50;i++){ let gl=false, kc=false; h.traverse(x=>{ if(x.name==='glasses_glb') gl=true; if(x.name==='keychain_milktea'&&x.children.length) kc=true; }); if(gl&&kc) break; await new Promise(r=>setTimeout(r,20)); }
  scene.updateMatrixWorld(true);
  const u=h.userData, V=u.vrm, R=n=>V.humanoid.getRawBoneNode(n), L=p=>h.worldToLocal(p.clone());
  const box=new THREE.Box3(); h.traverse(x=>{ if(x.isSkinnedMesh&&x.visible) box.expandByObject(x); });   /* 人物本身（不含配件）*/
  const props=u.props||{}, names=Object.keys(props);
  check('2. CHAR.build 用 VRM（不是備用）',u.driver==='vrm'&&u.key===KEY,u.driver+' '+u.key);
  check('2. 量出來的身高 1.70～1.82 m',box.max.y>=1.70&&box.max.y<=1.82,cm(box.max.y));
  check('2. 配件：眼鏡、後背包、奶茶杯鑰匙圈',['glasses','backpack','keychain_milktea'].every(n=>names.includes(n)),names.join(','));
  const plist=CHAR.MODEL_PROPS[KEY]||[], gItem=plist.find(p=>p&&p.name==='glasses');
  check('2. 眼鏡是 prop.glasses_long（不是芷若的 prop.glasses_zhiruo）',!!gItem&&gItem.glb==='prop.glasses_long',JSON.stringify(gItem||null));
  // 3 眼鏡
  { let glb=null; if(props.glasses) props.glasses.traverse(x=>{ if(x.name==='glasses_glb') glb=x; }); const proc=props.glasses&&props.glasses.children[0];
    const eL=L(R('leftEye').getWorldPosition(new THREE.Vector3())), eR=L(R('rightEye').getWorldPosition(new THREE.Vector3())), mid=eL.clone().add(eR).multiplyScalar(0.5);
    const gp=glb?L(glb.getWorldPosition(new THREE.Vector3())):null;
    check('3. 眼鏡：GLB 換上了（程式產生的版本藏起來）',!!glb&&glb.visible&&proc&&proc.visible===false);
    /* 人物座標：前方 +z（VRM 轉 180° 以後）；眼睛骨頭在眼球中心，臉表面在前面約 6 cm（props3d attach 的註解）*/
    check('3. 眼鏡：在兩眼前面 2～9 cm、高度差 ≤ 2 cm、左右置中 ≤ 1 cm',!!gp&&gp.z-mid.z>=0.02&&gp.z-mid.z<=0.09&&Math.abs(gp.y-mid.y)<=0.02&&Math.abs(gp.x-mid.x)<=0.01,gp?`前 ${cm(gp.z-mid.z)}、高差 ${cm(gp.y-mid.y)}、左右 ${cm(gp.x-mid.x)}`:'沒有'); }
  // 4 鑰匙圈：前袋＝backpack() 的第二個 mesh（roundBox 0.24×0.17×0.06）
  { const bp=props.backpack, kc=props.keychain_milktea; const meshes=[]; if(bp) bp.traverse(x=>{ if(x.isMesh) meshes.push(x); });
    const body=meshes[0], pk=meshes[1]; const bb=body&&new THREE.Box3().setFromObject(body), pb=pk&&new THREE.Box3().setFromObject(pk);
    let cup=null; if(kc) kc.traverse(x=>{ if(x.isMesh&&/tea|clear|lid|pearl/.test(x.name)) (cup=cup||new THREE.Box3()).expandByObject(x); });
    const all=kc&&new THREE.Box3().setFromObject(kc);
    check('4. 鑰匙圈：GLB 換上了（看得到杯子）',!!cup&&kc.visible);
    if(cup&&pb&&bb){
      const back=pb.min.z<0?-1:1;   /* 背包在人物的後面（前方 +z：背包的 z 是負的）*/
      /* 杯子的每一點都在前袋外面：把杯子的網格點逐一換到前袋自己的座標，量離前袋的倒角方塊多深（|x|≤0.12、|y|≤0.085、|z|≤0.03 以內＝插進去）*/
      const inv=new THREE.Matrix4().copy(pk.matrixWorld).invert(); let deep=0;
      kc.traverse(x=>{ if(!x.isMesh||!/tea|clear|lid|pearl/.test(x.name)) return; const P=x.geometry.attributes.position, v=new THREE.Vector3();
        for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(x.matrixWorld).applyMatrix4(inv); const dx=0.12-Math.abs(v.x), dy=0.085-Math.abs(v.y), dz=0.03-Math.abs(v.z); if(dx>0&&dy>0&&dz>0) deep=Math.max(deep,Math.min(dx,dy,dz)); } });
      check('4. 鑰匙圈：在背後、比前袋外側更後面（杯子中心）',back<0&&(cup.min.z+cup.max.z)/2<pb.min.z+0.012,`杯子中心 z ${cm((cup.min.z+cup.max.z)/2)}、前袋外側 ${cm(pb.min.z)}`);
      check('4. 鑰匙圈：杯子不插進前袋（插進去 ≤ 2 mm）',deep<=0.002,`最深 ${cm(deep)}`);
      check('4. 鑰匙圈：整串在背包的高度、寬度以內（不垂到背包下面）',all.min.y>=bb.min.y-0.005&&all.max.y<=bb.max.y&&all.min.x>=bb.min.x&&all.max.x<=bb.max.x,`鑰匙圈 y ${cm(all.min.y)}～${cm(all.max.y)}、背包 ${cm(bb.min.y)}～${cm(bb.max.y)}`); }
    else check('4. 鑰匙圈：量得到前袋和杯子',false); }
  // 5、6 接線（子行程）
  let W=null; try{ W=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--wiring'],{cwd:ROOT,maxBuffer:1<<24}).toString()); }catch(e){ check('5. 接線的子行程跑得起來',false,String(e.message).slice(0,300)); }
  if(W){
    check('5. 美國篇的檔案載得到、USL.specOf 存在',!W.err.length&&!W.noSpecOf,W.err.join('；')||(W.noSpecOf?'沒有 USL.specOf':''));
    const a=W.ok5||{};
    check('5. 舊序章人物己（教室、會所）要 char.us_long、開始下載一次；路人的穿搭留著當備用',a.long==='char.us_long'&&a.long2==='char.us_long'&&JSON.stringify(a.loads)==='["char.us_long"]'&&a.hasOutfit,JSON.stringify(a));
    check('5. 其他有名字的人（韓國同學）不受影響',!!W.ok5&&a.korean===null,String(a.korean));
    const b=W.ok6||{};
    check('6. 下載失敗：之後的舊序章人物己不再要那個模型、藏起來等的人露出來',b.after===null&&b.revealed===true&&JSON.stringify(b.loads)==='["char.us_long"]',JSON.stringify(b)); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
