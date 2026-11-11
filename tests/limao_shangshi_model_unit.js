// 禮貌生財上師的 3D 模型（LIMAO-SHANGSHI-3D-1111，X332；LAWWW2 帳號 A 11-11；使用者 11-10 的人物圖 docs/handoff/user_specs/limao_ref/shangshi_character.png）——不需要瀏覽器（D131）。
//   1 manifest：char.limao_shangshi 是 VRM、檔案在、身高 1.69、lazy、不是路人池；眼鏡的 GLB 在
//   2 模型檔裡有帽子、帽舌、八字鬍、山羊鬍、圍巾（一圈＋兩條＋流蘇）的網格（做在 VRM 裡、跟著骨頭動），配件材質一個
//   3 CHAR.build 用 VRM；量出來的身高（含帽子）1.66～1.80 m；配件只有圓框細金屬眼鏡（prop.glasses_shangshi）
//   4 眼鏡：GLB 換上；在兩眼前面 2～9 cm、高度差 ≤ 2 cm、左右置中 ≤ 1 cm
// 修改前（開發分支沒有這個模型）：1 就 FAIL。用法：node tests/limao_shangshi_model_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const KEY='char.limao_shangshi', cm=v=>(v*100).toFixed(1)+' cm', tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  const m=ASSETS.manifest[KEY], g=ASSETS.manifest['prop.glasses_shangshi'];
  check('1. manifest：char.limao_shangshi 是 VRM、檔案在、身高 1.69、lazy、不是路人池',!!m&&m.type==='vrm'&&fs.existsSync(path.join(ROOT,m.url))&&m.height===1.69&&m.lazy===true&&!m.ambient&&!m.anon,m?m.url:'沒有');
  check('1. manifest：圓框細金屬眼鏡的 GLB 在',!!g&&fs.existsSync(path.join(ROOT,g.url)));
  if(!m||!g){ console.log('FAILED: '+(fails+4)); process.exit(1); }
  { const d=fs.readFileSync(path.join(ROOT,m.url)), jl=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+jl).toString('utf8')), names=(J.meshes||[]).map(x=>x.name).concat((J.nodes||[]).map(x=>x.name||'')), mats=(J.materials||[]).map(x=>x.name);
    const need=['Acc_Cap','Acc_CapBrim','Acc_Curls','Acc_Mustache','Acc_Goatee','Acc_BeardLink','Acc_LapelL','Acc_LapelR','Acc_ShirtV','Acc_VneckRib','Acc_ScarfBack','Acc_ScarfTailL','Acc_ScarfTailR']   /* 第 2 版：加捲髮、鬍子連起來的兩條、西裝翻領、V 領的襯衫；圍巾改成掛在脖子後面＋兩邊垂下 */, miss=need.filter(n=>!names.some(x=>x.indexOf(n)===0));
    check('2. 模型裡有帽子、鬍子、圍巾（做在 VRM 裡）',mats.some(x=>/SHANGSHI_Acc/.test(x))&&!miss.length,'材質：'+mats.filter(x=>/Acc/.test(x)).join(',')+(miss.length?'；缺 '+miss.join(','):'')); }
  await preload([KEY,'prop.glasses_shangshi']);
  const scene=new THREE.Scene(); const h=CHAR.build({model:KEY,height:1.69}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
  for(let i=0;i<10;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); await tick(); }
  for(let i=0;i<50;i++){ let gl=false; h.traverse(x=>{ if(x.name==='glasses_glb') gl=true; }); if(gl) break; await new Promise(r=>setTimeout(r,20)); }
  scene.updateMatrixWorld(true);
  const u=h.userData, V=u.vrm, R=n=>V.humanoid.getRawBoneNode(n), L=p=>h.worldToLocal(p.clone());
  const box=new THREE.Box3(); h.traverse(x=>{ if(x.isSkinnedMesh&&x.visible) box.expandByObject(x); });
  const props=u.props||{}, names=Object.keys(props), plist=CHAR.MODEL_PROPS[KEY]||[], gItem=plist.find(p=>p&&p.name==='glasses');
  check('3. CHAR.build 用 VRM（不是備用）',u.driver==='vrm'&&u.key===KEY,u.driver+' '+u.key);
  check('3. 量出來的身高（含帽子）1.66～1.80 m',box.max.y>=1.66&&box.max.y<=1.80,cm(box.max.y));
  { /* 第 3 版：帽子是扁的（LAWWW 01:07：第 2 版高度幾乎和臉一樣高、像頭盔）——帽頂比頭的骨頭（head）高不到 21 cm、比兩眼高不到 15 cm */
    const hd=L(R('head').getWorldPosition(new THREE.Vector3())), eL0=L(R('leftEye').getWorldPosition(new THREE.Vector3()));
    check('3. 帽子是扁的：帽頂比兩眼高不到 16 cm',box.max.y-eL0.y<=0.16&&box.max.y-eL0.y>=0.07,'帽頂比眼睛高 '+cm(box.max.y-eL0.y)+'、比 head 骨頭高 '+cm(box.max.y-hd.y)); }
  check('3. 配件只有眼鏡，是 prop.glasses_shangshi',names.join()==='glasses'&&!!gItem&&gItem.glb==='prop.glasses_shangshi',names.join(',')+' '+JSON.stringify(gItem||null));
  { let glb=null; if(props.glasses) props.glasses.traverse(x=>{ if(x.name==='glasses_glb') glb=x; }); const proc=props.glasses&&props.glasses.children[0];
    const eL=L(R('leftEye').getWorldPosition(new THREE.Vector3())), eR=L(R('rightEye').getWorldPosition(new THREE.Vector3())), mid=eL.clone().add(eR).multiplyScalar(0.5);
    const gp=glb?L(glb.getWorldPosition(new THREE.Vector3())):null;
    check('4. 眼鏡：GLB 換上了（程式產生的版本藏起來）',!!glb&&glb.visible&&proc&&proc.visible===false);
    /* 第 2 版：眼鏡的網格在模型裡自己往前 1.7 cm、往下 0.5 cm（這個人物的臉比眼睛骨頭前面 7.4 cm，固定放 6.8 cm 會陷進臉）：量鏡框網格的中心 */
    { let fr=null; if(glb) glb.traverse(x=>{ if(x.isMesh&&/frame/.test(x.name)) fr=x; }); const fb=fr&&new THREE.Box3().setFromObject(fr), fc=fb&&L(fb.getCenter(new THREE.Vector3())), fmax=fb&&Math.max(L(fb.min.clone()).z,L(fb.max.clone()).z);
      check('4. 鏡框（網格）最前面在兩眼骨頭前 7.5～10 cm（不陷進臉）',!!fb&&fmax-mid.z>=0.075&&fmax-mid.z<=0.10,fb?cm(fmax-mid.z):'沒有'); }
    check('4. 眼鏡：在兩眼前面 2～9 cm、高度差 ≤ 2 cm、左右置中 ≤ 1 cm',!!gp&&gp.z-mid.z>=0.02&&gp.z-mid.z<=0.09&&Math.abs(gp.y-mid.y)<=0.02&&Math.abs(gp.x-mid.x)<=0.01,gp?`前 ${cm(gp.z-mid.z)}、高差 ${cm(gp.y-mid.y)}、左右 ${cm(gp.x-mid.x)}`:'沒有'); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
