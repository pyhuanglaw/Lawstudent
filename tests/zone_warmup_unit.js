// 走起來不卡（X79 PERF-CAMPUS-DAY-1027，使用者「校園白天走起來還是會卡」，LAWWW2-C 2026-10-27）——不需要瀏覽器。
// 原本：three.js 第一次畫到才編 shader；prewarm（電腦、剛進區域）只編那時候已經接上、看得到的。SwiftShader 手機模擬沿經濟系路線第一次走，
//   路上 13 次「這一格編新的 shader」（每次 0.5～2.2 秒）：畫面外的建築材質、晚接上的正式模型、路人遠距離版本（藏著）、陰影的深度 shader。
// 修正（src/zones3d.js 的 Z3.warmup＋src/game3d.js 的 enter）：淡入以後在背景一小批一小批編好。這支測試用假的 renderer：
//   ① Z3.warmup 存在；② 看得到但沒編過的都編（不管在不在畫面裡），晚接上的（warmup 開始以後才加進場景）也編；
//   ③ 藏起來的不編（套件備用模型、藏起來的群組底下的子物件）、material 不是真材質的（TK paint）不碰；路人遠距離版本（npc_far，自己藏著、人看得到）要編；
//   ④ 子樹裡有燈的不編（compile 會把那盞燈多算一次，編出來對不上）；⑤ 沒有平行編譯一批最多 1 個新 shader，有的最多 8 個；
//   ⑥ 都編完、連續幾次沒有新的以後，陰影相機放大到整個區域畫一格（陰影的深度 shader），畫完相機還原、下一格重畫陰影；
//   ⑦ 電腦把這些物件的貼圖傳上 GPU（MToon 放在 uniforms 的也傳），手機（ASSETS.texCap）不傳；⑧ 換了區域就停；?nowarmup 關掉；⑨ GAME.enter 淡入以後呼叫；
//   ⑩ 還沒放進場景的路人底模（ASSETS 快取的 VRM 樣板）、遠距離版本的 toon 材質也編（量測：等一下才生出來的路人臉、頭髮、第一個走到 18 m 外的人，各停 1.5～2 秒）；
//   ⑪ 做完以後隔一段時間再看，有新的（之後才載完的底模、正式模型）照樣編，記在 later；
//   ⑫ 編好的 shader 主動讀一次（getUniforms＝第一次畫到的 onFirstUse；只送出編譯不夠，第一次讀結果時照樣要等——第二版量測抓到）：做完的時候每一個都讀過；
//      有平行編譯時只讀已經好的（isReady），還沒好的不讀（不會等）。
// 用法：node tests/zone_warmup_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tex=(name,w,h)=>{ const t=new THREE.Texture({width:w,height:h}); t.name=name; return t; };
// 假的 renderer：compile(物件, 鏡頭, 目標場景) 和 three.js 一樣走過子樹「所有」物件；同一個材質名＝同一個 shader（第一次才算新的）
function fakeRenderer(parallel){ const props=new WeakMap(), progs=new Set(); const R={ compiledNames:[], compileCalls:[], usedOrder:[], inited:[], renders:0, renderCams:[],
  info:{programs:[]}, properties:{get(o){ if(!props.has(o)) props.set(o,{}); return props.get(o); }}, extensions:{get:k=>k==='KHR_parallel_shader_compile'&&parallel?{}:null},
  shadowMap:{enabled:true,needsUpdate:false},
  compile(scene,camera,target){ R.compileCalls.push({scene,target}); scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.material) return; for(const m of [].concat(o.material)){ if(typeof m.customProgramCacheKey!=='function') throw new TypeError('material.customProgramCacheKey is not a function'); R.properties.get(m).currentProgram={}; R.compiledNames.push(m.name); if(!progs.has(m.name)){ progs.add(m.name); const pg={name:m.name,used:false,readyAt:Date.now()+(parallel?15:0),getUniforms(){ pg.used=true; R.usedOrder.push(m.name); return {}; },isReady(){ return Date.now()>=pg.readyAt; }}; R.info.programs.push(pg); } } }); },
  initTexture(t){ R.inited.push(t.name); R.properties.get(t).__webglTexture={}; } }; return R; }
const mesh=(name,map)=>new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name,map:map||null}));
function world(R,mobile){ const S=new THREE.Scene(), cam=new THREE.PerspectiveCamera(50,2,0.1,100);
  S.add(mesh('in_view',tex('in_view_tex',512,512)));
  const far=mesh('out_of_view',tex('out_of_view_tex',512,512)); far.position.set(0,0,500); S.add(far);   /* 鏡頭看不到的地方 */
  const fb=mesh('hidden_fallback',tex('hidden_tex',512,512)); fb.visible=false; S.add(fb);
  const hg=new THREE.Group(); hg.visible=false; hg.add(mesh('hidden_child')); S.add(hg);
  const paint=new THREE.Mesh(new THREE.CylinderGeometry(),{isPaint:true,color:'#777'}); S.add(paint); S.userData.paint=paint;
  const human=new THREE.Group(); human.name='human'; const nf=mesh('npc_far_toon'); nf.name='npc_far'; nf.visible=false; human.add(nf); S.add(human);
  const ghost=new THREE.Group(); ghost.visible=false; const nf2=mesh('npc_far_of_hidden_person'); nf2.name='npc_far'; nf2.visible=false; ghost.add(nf2); S.add(ghost);
  const lamp=mesh('lamp_with_light'); lamp.add(new THREE.PointLight()); S.add(lamp);
  for(let i=0;i<6;i++) S.add(mesh('bldg'+i));
  const sun=new THREE.DirectionalLight(); sun.castShadow=true; const sc=sun.shadow.camera; sc.left=-22; sc.right=22; sc.top=22; sc.bottom=-22; sc.near=1; sc.far=120;
  const E={renderer:R,scene:S,camera:cam,sun,zone:{def:{id:'campus',size:[260,170]}},render(){ R.renders++; R.renderCams.push([sc.left,sc.right,sc.near,sc.far]); }};
  const tpl=new THREE.Group(); tpl.add(mesh('tpl_face')); const hid=mesh('tpl_hidden'); hid.visible=false; tpl.add(hid);
  const used=new THREE.Group(); used.add(mesh('tpl_in_use')); S.add(used);   /* 借出去的樣板在場景裡：照場景的規則 */
  const mt=new THREE.ShaderMaterial({name:'mtoon_uniform',uniforms:{map:{value:tex('mtoon_tex',256,256)}}}); const mtm=new THREE.Mesh(new THREE.BoxGeometry(),mt); S.add(mtm);
  global.ASSETS.cache={npc_a:{tpl:{vrm:{scene:tpl}},lod:{parts:[{geo:new THREE.BoxGeometry(),toon:new THREE.MeshToonMaterial({name:'lod_toon'})}]}},npc_b:{tpl:{vrm:{scene:used}}},bldg:{}};
  global.ASSETS.texCap=mobile?1024:null; return E; }
(async()=>{
  check('① Z3.warmup 存在',typeof Z3.warmup==='function');
  if(typeof Z3.warmup!=='function'){ console.log('FAILED'); process.exit(1); }
  // 電腦、沒有平行編譯
  let R=fakeRenderer(false), E=world(R,false); let err=null, out=null;
  try{ out=Z3.warmup(E,{gap:5,delay:0,idleScans:3}); }catch(e){ err=e; }
  check('⓪ 不丟例外（material 不是真材質的物件也一樣）',!err&&out,err?String(err.message||err):'');
  await sleep(30); const late=mesh('late_glb',tex('late_tex',1024,1024)); E.scene.add(late);   /* 正式模型晚到 */
  for(let i=0;i<200&&!out.done;i++) await sleep(10);
  check('⓪ 做完（done）',out.done,JSON.stringify(out));
  const N=R.compiledNames;
  check('② 看得到但沒編過的都編，鏡頭外的也編',['in_view','out_of_view','bldg0','bldg5'].every(n=>N.includes(n)),JSON.stringify(N));
  check('② 晚接上的正式模型也編',N.includes('late_glb'));
  check('③ 藏起來的不編（套件備用模型、藏起來的群組底下的子物件）',!N.includes('hidden_fallback')&&!N.includes('hidden_child'));
  check('③ 路人遠距離版本（npc_far）要編；人整個藏起來的不編',N.includes('npc_far_toon')&&!N.includes('npc_far_of_hidden_person'));
  check('③ TK paint 描述不碰（material 原封不動）',E.scene.userData.paint.material.isPaint===true);
  check('④ 子樹裡有燈的不編',!N.includes('lamp_with_light'));
  check('④ 每次 compile 的燈光、霧照區域的（目標場景＝E.scene）',R.compileCalls.length>0&&R.compileCalls.every(c=>c.target===E.scene&&c.scene!==E.scene));
  const per=[]; { let ticks=0; const R5=fakeRenderer(false), E5=world(R5,false); const o5=Z3.warmup(E5,{gap:5,delay:0,idleScans:3}); let last=0; for(let i=0;i<120&&!o5.done;i++){ await sleep(4); const n=R5.info.programs.length; if(n!==last){ per.push(n-last); last=n; } } }
  check('⑤ 沒有平行編譯：一批最多 1 個新 shader',per.length>0&&per.every(d=>d<=1),JSON.stringify(per));
  const R6=fakeRenderer(true), E6=world(R6,false); const o6=Z3.warmup(E6,{gap:40,delay:0,idleScans:3}); await sleep(20); const first=R6.info.programs.length;
  check('⑤ 有平行編譯：第一批就編好幾個（最多 8 個）',first>1&&first<=8,`第一批 ${first} 個；parallel=${o6.parallel}`);
  check('⑥ 都編完以後畫一格（陰影的深度 shader）：陰影相機放大到整個區域',out.depth&&R.renders===1&&R.renderCams[0][0]<=-300&&R.renderCams[0][1]>=300&&R.renderCams[0][2]<0,JSON.stringify(R.renderCams));
  const sc=E.sun.shadow.camera; check('⑥ 畫完陰影相機還原、下一格重畫陰影',sc.left===-22&&sc.right===22&&sc.near===1&&sc.far===120&&R.shadowMap.needsUpdate===true);
  check('⑦ 電腦：這些物件的貼圖傳上 GPU（MToon uniforms 的也傳；藏起來的不傳）',['in_view_tex','out_of_view_tex','late_tex','mtoon_tex'].every(n=>R.inited.includes(n))&&!R.inited.includes('hidden_tex'),JSON.stringify(R.inited));
  check('⑩ 還沒放進場景的路人底模也編（藏起來的零件不編）',N.includes('tpl_face')&&!N.includes('tpl_hidden')&&N.filter(n=>n==='tpl_in_use').length===1,JSON.stringify(N.filter(n=>/^tpl/.test(n))));
  check('⑩ 遠距離版本的 toon 材質也編（用 SkinnedMesh：和遊戲裡一樣有 skinning）',N.includes('lod_toon')&&R.compileCalls.some(c=>c.scene.isSkinnedMesh&&c.scene.material.name==='lod_toon'));
  const R11=fakeRenderer(false), E11=world(R11,false); const o11=Z3.warmup(E11,{gap:3,delay:0,idleScans:2,watch:15}); for(let i=0;i<200&&!o11.done;i++) await sleep(5);
  E11.scene.add(mesh('after_done')); await sleep(80);
  check('⑪ 做完以後新加的照樣編（later）',R11.compiledNames.includes('after_done')&&o11.later>=1,JSON.stringify(o11));
  const R7=fakeRenderer(false), E7=world(R7,true); const o7=Z3.warmup(E7,{gap:3,delay:0,idleScans:3}); for(let i=0;i<200&&!o7.done;i++) await sleep(5);
  check('⑦ 手機（ASSETS.texCap）：shader 照樣編、貼圖不傳',R7.compiledNames.includes('out_of_view')&&R7.inited.length===0,JSON.stringify(R7.inited));
  const R8=fakeRenderer(false), E8=world(R8,false); Z3.warmup(E8,{gap:5,delay:0}); await sleep(8); E8.zone={def:{id:'wenzhou'}}; const n8=R8.compiledNames.length; await sleep(60);
  check('⑧ 換了區域就停',R8.compiledNames.length===n8,`換區域時 ${n8}、之後 ${R8.compiledNames.length}`);
  global.location={search:'?nowarmup'}; const R9=fakeRenderer(false), E9=world(R9,false); const o9=Z3.warmup(E9,{gap:5,delay:0}); await sleep(30); global.location={search:''};
  check('⑧ ?nowarmup 關掉',o9===null&&R9.compiledNames.length===0);
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const m=g.match(/async function enter\(zoneId,spawn,opts\)\{[\s\S]*?\n/); const body=m?m[0]:'';
  const iF=body.indexOf('await fade(false)'), iW=body.indexOf('Z3.warmup(E)'), iFin=body.indexOf('finally');
  check('⑨ GAME.enter：淡入以後呼叫 Z3.warmup（noFade 也呼叫）',iF>=0&&iW>iF&&iW<iFin&&!/if\(!opts\.noFade\)\{ await fade\(false\); if\(Z3\.warmup/.test(body),`fade ${iF}、warmup ${iW}、finally ${iFin}`);
  check('⑫ 做完的時候每個新編的 shader 都主動讀過一次（getUniforms）',out.done&&R.info.programs.length>0&&R.info.programs.every(pg=>pg.used),JSON.stringify(R.info.programs.filter(pg=>!pg.used).map(pg=>pg.name)));
  { const R12=fakeRenderer(true), E12=world(R12,false); let early=null; const o12=Z3.warmup(E12,{gap:2,delay:0,idleScans:2}); await sleep(6); early=R12.info.programs.filter(pg=>pg.used&&pg.readyAt>Date.now()).length;
    let bad=0; const orig=R12.info.programs; for(let i=0;i<300&&!o12.done;i++){ await sleep(3); }
    check('⑫ 有平行編譯：還沒好的不讀（不會等），最後都讀過',early===0&&o12.done&&R12.info.programs.every(pg=>pg.used),`提早讀 ${early}；${JSON.stringify(o12)}`); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
