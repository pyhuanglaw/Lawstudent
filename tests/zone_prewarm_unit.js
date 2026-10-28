// 換區域不卡（PERF-ZONE-ENTER-1018，使用者 X14「電腦換畫面卡一兩秒（溫州街、咖啡廳）」，LAWWW2 2026-10-21）——不需要瀏覽器。
// 原本：GAME.enter 在畫面全黑時建區域、畫第一格，已經載過的正式模型在淡入時（await fade(false)）才接上，淡入那幾格才編 shader、傳貼圖 → 畫面停住。
// 修正（src/zones3d.js 的 Z3.prewarm＋src/game3d.js 的 enter）：淡入之前先讓已載過的正式模型接上，再 compileAsync、把貼圖傳上 GPU，最多等 cap 毫秒。
// 這支測試用假的 renderer（記錄 compileAsync 看到哪些材質、initTexture 傳了哪些貼圖）：
//   ① Z3.prewarm 存在；② 「已載過的正式模型」（和 zones3d.js 一樣用 ASSETS.loadOne().then 接上）在編 shader 之前就接上了；
//   ③ 場景裡每張貼圖都傳上 GPU（材質的 map／normalMap／emissiveMap、ShaderMaterial 的 uniform、程序化的 canvas 貼圖），render target 的不傳；
//   ④ compileAsync 一直沒好也不會卡住：cap 毫秒內回來、標 timedOut；⑤ 大貼圖分批，中間讓出主執行緒；
//   ⑥ game3d.js 的 enter：淡入之前、E.update 之後、E.render 之前 await Z3.prewarm；noFade（搭電梯換區域）不等。
//   ⑧ 下一個區域的建築模型在背景先載（電腦才做；一次一個；換區域就停）。
//   ⑨ 等的時候主迴圈先不畫（畫面是黑的；不然那一格會停下來等還沒編好的 shader），做完還原 E.renderSkip。
//   ⑩ 手機（ASSETS.texCap）不預熱，照原本的做法；?prewarm 強制、?noprewarm 關掉。
//   ⑦ 藏起來的物件不編、不傳（three.js 的 compile 會走到藏起來的物件：溫州街有三個藏起來的套件零件 material 是 TK paint 描述，編下去丟例外——2026-10-21 遊戲內量測抓到）。
//   ⑪ 編譯結果先讀一次（X14 第二輪，LAWWW2-C 2026-10-27）：已經編好的 shader 在黑畫面時呼叫 getUniforms（three.js 第一次畫到時讀編譯結果的那一步），
//      淡入第一格不再等；還沒好的不讀；cap 到了就停；?prewarmcap=毫秒（量測用）。
// 用法：node tests/zone_prewarm_unit.js
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
const tex=(name,w,h)=>{ const t=new THREE.Texture({width:w,height:h}); t.name=name; return t; };
// 假的 renderer：compileAsync 和 three.js 的 compile 一樣走過「所有」物件（包括藏起來的），material 不是真的材質（customProgramCacheKey 不是函式）就丟 TypeError
function fakeRenderer(compileMs){ const R={compiled:null,inited:[],compileAsync(scene){ const names=[]; scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)) return; const m=o.material; if(!m) return; for(const x of [].concat(m)){ if(typeof x.customProgramCacheKey!=='function') throw new TypeError('material.customProgramCacheKey is not a function'); names.push(x.name); } }); R.compiled=names; return compileMs<0?new Promise(()=>{}):new Promise(r=>setTimeout(r,compileMs)); }, initTexture(t){ R.inited.push(t.name); } }; return R; }
function scene(){ const S=new THREE.Scene(); const proc=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'proc_mat',map:tex('canvas_sign',512,256)})); S.add(proc);
  const sh=new THREE.ShaderMaterial({name:'shader_mat',uniforms:{tDiffuse:{value:tex('uniform_tex',256,256)},k:{value:1}}}); S.add(new THREE.Mesh(new THREE.BoxGeometry(),sh));
  const rt=new THREE.WebGLRenderTarget(64,64); rt.texture.name='rt_tex'; S.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({name:'rt_mat',map:rt.texture})));
  // 藏起來的東西（被正式模型取代的套件備用模型）：一個是真的材質＋貼圖、一個的 material 是 TK 的 paint 描述（溫州街真的有三個）、一個是藏起來的群組底下「自己 visible」的子物件
  const fb=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'hidden_fallback',map:tex('hidden_tex',1024,1024)})); fb.visible=false; S.add(fb);
  const paint=new THREE.Mesh(new THREE.CylinderGeometry(),{isPaint:true,color:'#777777',key:'p1'}); paint.visible=false; S.add(paint); S.userData.paint=paint;
  const hg=new THREE.Group(); hg.visible=false; hg.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'hidden_child',map:tex('hidden_child_tex',512,512)}))); S.add(hg); return S; }
const glbTpl=()=>{ const g=new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'glb_mat',map:tex('glb_base',1024,1024),normalMap:tex('glb_nor',1024,1024),emissiveMap:tex('glb_emit',512,512)}))); return g; };
(async()=>{
  check('① Z3.prewarm 存在',typeof Z3.prewarm==='function');
  if(typeof Z3.prewarm==='function'){
    // ②③：和 zones3d.js 一樣，區域建好時對已載過的模型呼叫 loadOne().then(c=>attach)——這時候 promise 已經完成，.then 是 microtask
    const R=fakeRenderer(20), E={renderer:R,scene:scene(),camera:new THREE.PerspectiveCamera()}; const cached=Promise.resolve({scene:glbTpl()});
    cached.then(c=>{ E.scene.add(c.scene.clone(true)); });
    const skip0=()=>false; E.renderSkip=skip0; let skipDuring=null; setTimeout(()=>{ skipDuring=E.renderSkip(); },5);   /* 主迴圈在等的時候會呼叫 E.render → E.renderSkip */
    let out=null, err=null; try{ out=await Z3.prewarm(E,{cap:2000}); }catch(e){ err=e; }
    check('⓪ Z3.prewarm 不丟例外（藏起來的物件 material 不是真材質也一樣）',!err,err?String(err&&err.message||err):'');
    if(err){ console.log(`${fails} FAIL`); process.exit(1); }
    check('② 已載過的正式模型在編 shader 之前接上（compileAsync 看得到 glb_mat）',!!R.compiled&&R.compiled.includes('glb_mat'),JSON.stringify(R.compiled));
    const want=['canvas_sign','uniform_tex','glb_base','glb_nor','glb_emit'];
    check('③ 場景裡每張貼圖都傳上 GPU（材質的貼圖、ShaderMaterial uniform、程序化 canvas）',want.every(n=>R.inited.includes(n)),JSON.stringify(R.inited));
    check('③ render target 的貼圖不傳',!R.inited.includes('rt_tex'));
    check('⑨ 等的時候主迴圈先不畫（E.renderSkip 回 true），做完還原成原本的',skipDuring===true&&E.renderSkip===skip0,`等的時候 ${skipDuring}、做完 ${E.renderSkip===skip0?'還原':'沒還原'}`);
    check('⑦ 藏起來的物件不編 shader、貼圖不傳（套件備用模型、藏起來的群組底下的子物件）',!R.compiled.includes('hidden_fallback')&&!R.compiled.includes('hidden_child')&&!R.inited.includes('hidden_tex')&&!R.inited.includes('hidden_child_tex'),JSON.stringify({compiled:R.compiled,inited:R.inited}));
    const pm=E.scene.userData.paint; check('⑦ material 不是真材質的藏起來物件（TK paint 描述）：不丟例外，編完 material 放回原本那個',pm&&pm.material&&pm.material.isPaint===true);
    check('③ 回傳數字（貼圖數、百萬像素、沒有逾時）',out&&out.textures===5&&Math.abs(out.mpix-(0.131+0.066+1.049+1.049+0.262))<0.01&&!out.timedOut,JSON.stringify(out));
    // ④ compileAsync 一直沒好
    const R2=fakeRenderer(-1), E2={renderer:R2,scene:scene(),camera:new THREE.PerspectiveCamera()}; const t0=Date.now(); const out2=await Z3.prewarm(E2,{cap:300}); const dt=Date.now()-t0;
    check('④ shader 一直沒編好：cap 300 ms 內回來、標 timedOut',dt<600&&out2&&out2.timedOut,`${dt} ms ${JSON.stringify(out2)}`);
    // ⑤ 分批：12 張 2048² 貼圖、每批 400 萬像素 → 中間至少讓出 2 次（用一個 setTimeout 計數器看主執行緒有沒有空檔）
    const R3=fakeRenderer(0), E3s={renderer:R3,scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera()};
    for(let i=0;i<12;i++) E3s.scene.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'big'+i,map:tex('big'+i,2048,2048)})));
    let yields=0, initsAtYield=[]; const origInit=R3.initTexture; R3.initTexture=t=>{ origInit(t); };
    let stop=false; const spin=()=>{ if(stop) return; yields++; initsAtYield.push(R3.inited.length); setTimeout(spin,0); }; setTimeout(spin,0);
    await Z3.prewarm(E3s,{cap:5000}); stop=true;
    const mid=initsAtYield.filter(n=>n>0&&n<12).length;
    check('⑤ 大貼圖分批傳（傳到一半的時候主執行緒有空檔）',R3.inited.length===12&&mid>=2,`傳了 ${R3.inited.length} 張；傳到一半時讓出 ${mid} 次`);
  }
  // ⑧ 下一個區域的建築模型在背景先載（Z3.prefetchNext）：一次一個、已載過的跳過、換區域就停；手機（ASSETS.texCap）不做；?noprefetch 關掉、?prefetch 強制
  check('⑧ Z3.prefetchNext 存在',typeof Z3.prefetchNext==='function');
  if(typeof Z3.prefetchNext==='function'){
    const realLoad=ASSETS.loadOne, realCap=ASSETS.texCap; let pending=0, maxPending=0; const calls=[];
    ASSETS.loadOne=k=>{ calls.push(k); pending++; maxPending=Math.max(maxPending,pending); return new Promise(r=>setTimeout(()=>{ pending--; ASSETS.cache[k]={scene:new THREE.Group()}; r(ASSETS.cache[k]); },15)); };
    const wait=ms=>new Promise(r=>setTimeout(r,ms)), wz=['bldg.wenzhou_street','bldg.wz_park','bldg.wz_props','bldg.wz_jphouse','bldg.cafe_exterior','bldg.wz_scooter'].filter(k=>ASSETS.manifest[k]);
    const clear=()=>{ for(const k of wz.concat(['bldg.cafe_interior'])) delete ASSETS.cache[k]; calls.length=0; };
    clear(); ASSETS.cache['bldg.wz_park']={scene:new THREE.Group()}; const E1={zone:{def:{id:'gongguan'}}}; ASSETS.texCap=null;
    const o1=Z3.prefetchNext(E1,{delay:5,gap:5}); await wait(400);
    const want=wz.filter(k=>k!=='bldg.wz_park');
    check('⑧ 在公館：溫州街的建築模型一個一個載（已經載過的小公園跳過）',JSON.stringify(calls)===JSON.stringify(want)&&maxPending===1,`載了 ${JSON.stringify(calls)}；同時最多 ${maxPending} 個`);
    clear(); const E2={zone:{def:{id:'gongguan'}}}; Z3.prefetchNext(E2,{delay:5,gap:40}); await wait(30); E2.zone={def:{id:'wenzhou'}}; await wait(300);
    check('⑧ 換了區域就停（只載了第一個）',calls.length===1,JSON.stringify(calls));
    clear(); ASSETS.texCap={color:1024,data:512}; const o3=Z3.prefetchNext({zone:{def:{id:'gongguan'}}},{delay:5,gap:5}); await wait(200);
    check('⑧ 手機（ASSETS.texCap）不預先載',o3===null&&calls.length===0,JSON.stringify(calls));
    clear(); global.location={search:'?prefetch'}; const o4=Z3.prefetchNext({zone:{def:{id:'wenzhou'}}},{delay:5,gap:5}); await wait(200);
    check('⑧ ?prefetch：手機模擬也預先載（量測用；溫州街 → 咖啡廳室內）',!!o4&&JSON.stringify(calls)===JSON.stringify(['bldg.cafe_interior']),JSON.stringify(calls));
    clear(); ASSETS.texCap=null; global.location={search:'?noprefetch'}; const o5=Z3.prefetchNext({zone:{def:{id:'gongguan'}}},{delay:5,gap:5}); await wait(150);
    check('⑧ ?noprefetch 關掉',o5===null&&calls.length===0,JSON.stringify(calls));
    global.location={search:''}; clear();
    const R5=fakeRenderer(0), E5={renderer:R5,scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),zone:{def:{id:'wenzhou'}}}; await Z3.prewarm(E5,{cap:500});
    check('⑧ prewarm 做完會排下一個區域的預先載入（溫州街 → 咖啡廳室內）',!!E5.lastPrefetch&&JSON.stringify(E5.lastPrefetch.keys)===JSON.stringify(['bldg.cafe_interior']),JSON.stringify(E5.lastPrefetch||null));
    E5.zone=null; ASSETS.loadOne=realLoad; ASSETS.texCap=realCap; clear();
  }
  // ⑩ 手機（ASSETS.texCap）不預熱，照原本的做法；?prewarm 強制做（量測用）、?noprewarm 關掉
  if(typeof Z3.prewarm==='function'){ const cap0=ASSETS.texCap; ASSETS.texCap={color:1024,data:512};
    const R=fakeRenderer(0), E={renderer:R,scene:scene(),camera:new THREE.PerspectiveCamera()}; const s0=()=>false; E.renderSkip=s0; const o=await Z3.prewarm(E,{cap:300});
    check('⑩ 手機（ASSETS.texCap）不預熱：回 null、不編、不傳、E.renderSkip 不動',o===null&&R.compiled===null&&R.inited.length===0&&E.renderSkip===s0,JSON.stringify({o,compiled:R.compiled,inited:R.inited}));
    global.location={search:'?prewarm'}; const R2=fakeRenderer(0), E2={renderer:R2,scene:scene(),camera:new THREE.PerspectiveCamera()}; const o2=await Z3.prewarm(E2,{cap:300});
    check('⑩ ?prewarm：手機模擬也預熱（量測用）',!!o2&&Array.isArray(R2.compiled),JSON.stringify(o2));
    ASSETS.texCap=null; global.location={search:'?noprewarm'}; const R3=fakeRenderer(0), E3={renderer:R3,scene:scene(),camera:new THREE.PerspectiveCamera()}; const o3=await Z3.prewarm(E3,{cap:300});
    check('⑩ ?noprewarm 關掉（電腦也照原本的做法）',o3===null&&R3.compiled===null,JSON.stringify(o3));
    global.location={search:''}; ASSETS.texCap=cap0; }
  // ⑪ 編譯結果先讀一次（X14，LAWWW2-C 2026-10-27）：黑畫面時對已經好的 program 呼叫 getUniforms（three.js 第一次畫到時的 onFirstUse）；還沒好的（isReady false）不讀、不等；
  //    cap 用完就停（剩下的照舊淡入第一格讀）；?prewarmcap=毫秒 改 cap（量測用）
  if(typeof Z3.prewarm==='function'){
    const mk=(ready,ms)=>{ const p={reads:0,isReady:()=>ready,getUniforms(){ const t=Date.now(); while(Date.now()-t<(ms||0)); p.reads++; return {}; }}; return p; };
    const R=fakeRenderer(0), P=[mk(true),mk(true),mk(false),mk(true)]; R.info={programs:P};
    const o=await Z3.prewarm({renderer:R,scene:scene(),camera:new THREE.PerspectiveCamera()},{cap:2000});
    check('⑪ 黑畫面時已經編好的 shader 先讀一次（getUniforms），還沒好的不讀',P[0].reads===1&&P[1].reads===1&&P[2].reads===0&&P[3].reads===1&&!!o&&o.settled===3,JSON.stringify({reads:P.map(p=>p.reads),settled:o&&o.settled}));
    const R2=fakeRenderer(0), P2=Array.from({length:40},()=>mk(true,30)); R2.info={programs:P2}; const t0=Date.now();
    const o2=await Z3.prewarm({renderer:R2,scene:scene(),camera:new THREE.PerspectiveCamera()},{cap:300}); const dt=Date.now()-t0, n2=P2.filter(p=>p.reads).length;
    check('⑪ 讀不完的時候 cap 到了就停（剩下的照舊淡入第一格讀）、標 timedOut',dt<700&&n2>0&&n2<40&&!!o2&&o2.timedOut,`${dt} ms、讀了 ${n2}／40`);
    global.location={search:'?prewarmcap=150'}; const R3=fakeRenderer(0), P3=Array.from({length:40},()=>mk(true,30)); R3.info={programs:P3}; const t1=Date.now();
    const o3=await Z3.prewarm({renderer:R3,scene:scene(),camera:new THREE.PerspectiveCamera()},{cap:5000}); const dt3=Date.now()-t1;
    check('⑪ 網址 ?prewarmcap=毫秒 改黑畫面最多等多久（量測用）',dt3<500&&!!o3&&o3.timedOut,`${dt3} ms`);
    global.location={search:''}; }
  // ⑥ game3d.js：enter() 在淡入之前 await Z3.prewarm（E.update 之後、E.render 之前；noFade 不等）
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const m=g.match(/async function enter\(zoneId,spawn,opts\)\{[\s\S]*?\n/); const body=m?m[0]:'';
  const iU=body.indexOf('E.update(0.016)'), iP=body.search(/if\(!opts\.noFade&&Z3\.prewarm\) await Z3\.prewarm\(E/), iR=body.indexOf('E.render()'), iF=body.indexOf('await fade(false)');
  check('⑥ GAME.enter：淡入之前 await Z3.prewarm（E.update 之後、E.render 之前；noFade 不等）',iU>=0&&iP>iU&&iR>iP&&iF>iR,`update ${iU}、prewarm ${iP}、render ${iR}、fade ${iF}`);
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})();
