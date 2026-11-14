// 店裡一開跑會頓（BUG-RUN-STUTTER-1112，使用者回報「跑步會頓」）——不需要瀏覽器。
// CC 在使用者電腦量（東南大聯，區域 tz_dongnan）：店內一開跑，renderer 的 programs 多 16 支——路人 VRM 的材質（眼睛、臉、毛衣、裙子＋外框）＋VIEWPANE（窗景片）＋店內牆 tzs_vc；
//   另外跑到一半才 CHAR.build＋addNPC 生路人（一幀 116 ms）。站著、走路沒有超過 50 ms 的幀。
// 原因：
//   A 進店的預熱（Z3.prewarm，黑畫面裡）和之後的背景預熱（Z3.warmup）都只編「看得到的」物件。進店那一刻在鏡頭外的人（引擎每一格照視錐設 obj.visible）、
//     鏡頭這一側淡出的牆（E.hideFaded）、跟著牆藏的窗景片（zone.winParts）visible 都是 false——沒編到，鏡頭一轉第一次畫到才編 shader、傳貼圖。
//   B 店裡的客人照時段表一個一個來，時段一到就當場 CHAR.build（複製一個 VRM）。
// 改法：
//   A src/zones3d.js Z3.revealList：這一刻只是鏡頭看不到才藏的東西（鏡頭外的人、淡出的牆、窗景片、先生好的客人）prewarm、warmup 都當成看得到的；
//     故意藏的人（n.hidden）、被正式模型取代的備用模型照舊不編。
//   B src/crowd3d.js：進店黑畫面裡先生好接下來 0.3 小時會來的（最多 3 個），站著的時候每 1.5 秒補一個（手上最多 6 個）；時段到了用先生好的；
//     沒有先生好的、玩家正在移動＝等他停下來（最多 20 秒）。人數、時段一個都沒少。
// 這裡用假的 renderer（記錄編了哪些材質、傳了哪些貼圖）和真的 zones3d.js／crowd3d.js。實際的幀時間只能在使用者電腦量（CC 的 DN_PROGRAMS）。
// 修改前：A 的「鏡頭外的人／淡出的牆／窗景片有編到」、B 全部 FAIL。用法：node tests/run_stutter_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAYMS=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAYMS)+1; };
let builds=0, releases=0; const built=[];
global.CHAR={build:spec=>{ builds++; const g=new THREE.Group(); g.userData.spec=spec; g.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'vrm_'+spec.id}))); built.push(g); return g; },release(o){ releases++; o.userData.released=true; },setProp(){ return false; }};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,dayOfKey:dayOf,noodleDay:()=>false};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_shops_layout.js','src/data/lin_layout.js','src/data/lane118_layout.js',
  'src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/calendar.js','src/data/places.js','src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/noodle_closed3d.js','src/crowd3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tex=(name,w,h)=>{ const t=new THREE.Texture({width:w||256,height:h||256}); t.name=name; return t; };
const mesh=(name,map)=>new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name,map:map||null}));

(async()=>{
/* ================= A1 進店的預熱（Z3.prewarm）================= */
{ check('A0. 有 Z3.revealList',typeof Z3.revealList==='function');
  /* 假的 renderer：compileAsync 和 three.js 一樣走過「所有」物件（包括藏起來的）；material 不是真的材質就丟例外 */
  const R={compiled:null,inited:[],compileAsync(scene){ const names=[]; scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)) return; const m=o.material; if(!m) return; for(const x of [].concat(m)){ if(typeof x.customProgramCacheKey!=='function') throw new TypeError('not a material'); names.push(x.name); } }); R.compiled=names; return Promise.resolve(); }, initTexture(t){ R.inited.push(t.name); }, info:{programs:[]} };
  const S=new THREE.Scene(); S.add(mesh('room_floor',tex('floor_tex')));
  const person=(nm)=>{ const g=new THREE.Group(); g.add(mesh(nm+'_face',tex(nm+'_face_tex'))); g.add(mesh(nm+'_sweater')); const far=mesh(nm+'_far'); far.name='npc_far'; far.visible=false; g.add(far); return g; };
  const inView=person('seen'), culled=person('culled'), keeper=person('keeper'), preObj=person('prebuilt'), gone=person('prebuilt_removed');
  culled.visible=false; keeper.visible=false; preObj.visible=false; gone.visible=false; S.add(inView,culled,keeper,preObj);   /* gone：不在場景裡（已經拿走）*/
  const wallShown=mesh('wall_back'), wallFaded=mesh('wall_front_tzs_vc',tex('wall_front_tex')); wallFaded.visible=false; S.add(wallShown,wallFaded);
  const pane=mesh('VIEWPANE_mat',tex('viewpane_tex',1024,512)); pane.name='VIEWPANE_tz_dongnan'; pane.visible=false; S.add(pane);
  const frame=new THREE.Group(); frame.visible=false; frame.add(mesh('window_frame')); S.add(frame);
  const fb=new THREE.Group(); fb.name='fallback'; fb.visible=false; const fbWall=mesh('fallback_wall',tex('fallback_tex')); fbWall.visible=false; fb.add(fbWall); fb.add(mesh('fallback_box')); S.add(fb);   /* 被正式模型取代的備用模型：牆在 zone.walls 裡也不算 */
  const paint=new THREE.Mesh(new THREE.CylinderGeometry(),{isPaint:true,color:'#777'}); paint.visible=false; S.add(paint);
  const E={renderer:R,scene:S,camera:new THREE.PerspectiveCamera(46,2,0.1,100),npcs:[{obj:inView},{obj:culled},{obj:keeper,hidden:true}],preObjs:[preObj,gone],
    zone:{walls:[wallShown,wallFaded,fbWall],winParts:[{obj:pane},{obj:frame}],def:{id:'tz_dongnan'}}};
  const L=Z3.revealList?Z3.revealList(E):[];
  check('A1. 列得出來的：鏡頭外的人、先生好的客人、淡出的牆（兩面，其中一面在備用模型裡）、窗景片、窗框共 6 個——故意藏的人（n.hidden）、不在場景裡的不列',L.length===6&&[culled,preObj,wallFaded,fbWall,pane,frame].every(o=>L.includes(o))&&!L.includes(keeper)&&!L.includes(gone)&&!L.includes(inView)&&!L.includes(wallShown),String(L.length));
  let err=''; try{ await Z3.prewarm(E,{cap:500}); }catch(e){ err=String(e); }
  const C=R.compiled||[];
  check('A1. 預熱跑得完（藏著的套件零件 material 不是材質也不丟例外）',!err&&Array.isArray(R.compiled),err);
  check('A1. 鏡頭外的人編到了（臉、毛衣）——修改前：沒有',C.includes('culled_face')&&C.includes('culled_sweater'),J(C));
  check('A1. 鏡頭這一側淡出的牆（店內牆）、窗景片、窗框編到了——修改前：沒有',C.includes('wall_front_tzs_vc')&&C.includes('VIEWPANE_mat')&&C.includes('window_frame'),J(C));
  check('A1. 先生好、還沒進場的客人編到了',C.includes('prebuilt_face'));
  check('A1. 原本看得到的照舊編',C.includes('room_floor')&&C.includes('seen_face')&&C.includes('wall_back'));
  check('A1. 故意藏的人（n.hidden）、被取代的備用模型（整組藏著，連裡面的牆）、藏著的遠距離版本照舊不編',!C.includes('keeper_face')&&!C.includes('fallback_wall')&&!C.includes('fallback_box')&&!C.some(n=>/_far$/.test(n)),J(C));
  check('A1. 貼圖也先傳：鏡頭外的人、淡出的牆、窗景片；備用模型、故意藏的人的不傳',['culled_face_tex','wall_front_tex','viewpane_tex','prebuilt_face_tex','floor_tex'].every(t=>R.inited.includes(t))&&!R.inited.includes('fallback_tex')&&!R.inited.includes('keeper_face_tex'),J(R.inited));
  check('A1. 做完以後藏著的還是藏著（顯示照舊交給引擎、牆的淡出）',culled.visible===false&&wallFaded.visible===false&&pane.visible===false&&frame.visible===false&&preObj.visible===false&&keeper.visible===false&&fbWall.visible===false&&inView.visible===true);
  check('A1. E.lastPrewarm.revealed 記有幾樣',!!E.lastPrewarm&&E.lastPrewarm.revealed===6,J(E.lastPrewarm&&E.lastPrewarm.revealed)); }
/* ================= A2 之後的背景預熱（Z3.warmup）：之後才進來、還在鏡頭外的人 ================= */
{ const props=new WeakMap(), progs=new Set(); const R={ compiledNames:[], inited:[], info:{programs:[]}, properties:{get(o){ if(!props.has(o)) props.set(o,{}); return props.get(o); }}, extensions:{get:()=>null}, shadowMap:{enabled:false,needsUpdate:false},
    compile(scene){ scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.material) return; for(const m of [].concat(o.material)){ R.properties.get(m).currentProgram={}; R.compiledNames.push(m.name); if(!progs.has(m.name)){ progs.add(m.name); R.info.programs.push({name:m.name,getUniforms(){ return {}; },isReady(){ return true; }}); } } }); },
    initTexture(t){ R.inited.push(t.name); R.properties.get(t).__webglTexture={}; } };
  const S=new THREE.Scene(); S.add(mesh('w_floor'));
  const late=new THREE.Group(); late.add(mesh('late_face',tex('late_face_tex'))); late.visible=false; S.add(late);   /* 剛從門口進來、在鏡頭後面 */
  const kp=new THREE.Group(); kp.add(mesh('w_keeper')); kp.visible=false; S.add(kp);
  const wf=mesh('w_wall_faded'); wf.visible=false; S.add(wf); const pn=mesh('w_viewpane'); pn.visible=false; S.add(pn);
  const fb=new THREE.Group(); fb.visible=false; fb.add(mesh('w_fallback')); S.add(fb);
  const E={renderer:R,scene:S,camera:new THREE.PerspectiveCamera(46,2,0.1,100),npcs:[{obj:late},{obj:kp,hidden:true}],zone:{walls:[wf],winParts:[{obj:pn}],def:{id:'tz_dongnan',size:[10,10]}},render(){}};
  const cache0=ASSETS.cache; ASSETS.cache={}; const tc0=ASSETS.texCap; ASSETS.texCap=null;
  const out=Z3.warmup(E,{delay:0,gap:5,idleScans:2,watch:20}); await sleep(250); const N=R.compiledNames;
  check('A2. 背景預熱：鏡頭外的人、淡出的牆、窗景片也編（修改前：只編看得到的，鏡頭轉過去那一格才編）',!!out&&N.includes('late_face')&&N.includes('w_wall_faded')&&N.includes('w_viewpane')&&N.includes('w_floor'),J(N));
  check('A2. 故意藏的人、備用模型照舊不編；鏡頭外的人的貼圖也先傳',!N.includes('w_keeper')&&!N.includes('w_fallback')&&R.inited.includes('late_face_tex'),J([N,R.inited]));
  /* 做完以後才走進來、還在鏡頭外的人：下一輪掃到就編 */
  const later=new THREE.Group(); later.add(mesh('later_face')); later.visible=false; S.add(later); E.npcs.push({obj:later}); await sleep(200);
  check('A2. 之後才走進來、還在鏡頭外的人：下一輪掃到就編（不等他走進畫面）',R.compiledNames.includes('later_face'),J(R.compiledNames));
  E.zone=null; ASSETS.cache=cache0; ASSETS.texCap=tc0; await sleep(40); }
/* ================= B 店裡之後才來的客人 ================= */
{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); if(CHAR.release) CHAR.release(n.obj); };
  global.GAME={G:null}; let GM=null;
  const mkG=(d,h)=>({day:typeof d==='string'?dayOf(d):d,hour:h,flags:{},stage:'law'});
  const enter=(id,G)=>{ GAME.G=G; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null;
    E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null,speed:0,path:null}; E.camera=null; E.time=100; E.cam={ctl:false}; G.zone=id;
    GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); }}; CROWD.enter(GM,id); return z; };
  const ppl=()=>E.npcs.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd));
  check('B0. 有 CROWD.shopPrebuild／playerMoving／deferSpawn（修改前：沒有）',typeof CROWD.shopPrebuild==='function'&&typeof CROWD.playerMoving==='function'&&typeof CROWD.deferSpawn==='function');
  if(typeof CROWD.shopPrebuild==='function'){
    /* 找一間店、一個時刻：接下來 0.3 小時內有客人會來 */
    const ZN='wz_teishoku', D0=dayOf('2025-10-18'); let pick=null;
    for(let h=11.2;h<20&&!pick;h+=0.1){ const G=mkG(D0,+h.toFixed(2)); const spots=CROWD.SPOTS.filter(s=>s.zone===ZN&&s.shop); const nx=[]; for(const sp of spots) for(const sl of sp.slots(G)) if(sl.t0>G.hour+0.02&&sl.t0<=G.hour+0.25) nx.push([sp,sl]); if(nx.length>=1) pick={h:G.hour,nx}; }
    check('B1. 找得到「等一下有客人會來」的時刻（巷子裡定食 10/18）',!!pick,J(pick&&pick.h));
    if(pick){ builds=0; releases=0; built.length=0; const G=mkG(D0,pick.h); enter(ZN,G); const n0=ppl().length, b0=builds, preN=CROWD.pre.size;
      check('B1. 進店那一刻（黑畫面裡）：現在的客人照舊生好，另外先生好接下來要來的（最多 '+CROWD.PRE_ENTER_MAX+' 個）',n0>=0&&preN>=1&&preN<=CROWD.PRE_ENTER_MAX&&b0===n0+preN,J([n0,preN,b0]));
      const P0=E.preObjs.slice(); check('B1. 先生好的掛在場景裡、不顯示、記在 E.preObjs（Z3.prewarm 一起編）；不在 E.npcs',P0.length===preN&&P0.every(o=>o.parent===E.scene&&o.visible===false&&!E.npcs.some(n=>n.obj===o))&&Z3.revealList(E).filter(o=>P0.includes(o)).length===preN,J(P0.length));
      /* 時間走到那一段：站著（每 1.5 秒看一次）——用先生好的，不再 CHAR.build */
      const first=pick.nx.slice().sort((a,b)=>a[1].t0-b[1].t0)[0]; const keys=Array.from(CROWD.pre.keys());
      const savedPrebuild=CROWD.shopPrebuild; CROWD.shopPrebuild=()=>0;   /* 這一段先不補生，只看「時段到了用不用先生好的」*/
      G.hour=first[1].t0+0.01; const bA=builds; CROWD.tick(GM,1.6); const came=ppl().length-n0, used=P0.filter(o=>E.npcs.some(n=>n.obj===o));
      check('B2. 時段到了：客人進來（人數照表），用的是先生好的那幾個（這一次 CHAR.build 0 次）——修改前：當場複製模型',came>=1&&used.length>=1&&builds===bA&&used.every(o=>o.visible===true&&!E.preObjs.includes(o)),J([came,used.length,builds-bA,keys.length]));
      CROWD.shopPrebuild=savedPrebuild;
      /* 站著的時候補生之後會來的（一次一個）；移動中不補 */
      const bB=builds, pB=CROWD.pre.size; E.player.speed=1.4; E.player.lastMoveT=E.time; CROWD.tick(GM,1.6); const movingBuilt=builds-bB;
      E.player.speed=0; E.time+=5; CROWD.tick(GM,1.6); const idleBuilt=builds-bB-movingBuilt;
      check('B3. 待在店裡：移動中不補生（0 個）；站著不動 1 秒以上每 1.5 秒最多補一個',movingBuilt===0&&idleBuilt<=1&&CROWD.pre.size<=CROWD.PRE_MAX,J([movingBuilt,idleBuilt,pB,CROWD.pre.size]));
      /* 換區域：沒用到的還回去 */
      const left=CROWD.pre.size, r0=releases, objs=E.preObjs.slice(); enter('wz_lin',mkG(D0,15.2));
      check('B4. 換區域：上一間沒用到的先生好的客人從場景拿掉、還給 VRM pool（CHAR.release '+left+' 次）',releases-r0===left&&objs.every(o=>o.parent===null&&o.userData.released)&&E.preObjs.every(o=>!objs.includes(o)),J([left,releases-r0])); }
    /* 沒有先生好的、玩家在跑：先不生，停下來才生；等太久也生 */
    { let pick2=null; for(let h=11.2;h<20&&!pick2;h+=0.1){ const G=mkG(D0,+h.toFixed(2)); for(const sp of CROWD.SPOTS.filter(s=>s.zone===ZN&&s.shop)) for(const sl of sp.slots(G)) if(sl.t0>G.hour+0.4&&sl.t0<=G.hour+0.6&&!pick2) pick2={h:G.hour,sp,sl}; }
      check('B5. 找得到「進店 0.4 小時以後才來、進店時不會先生好」的客人',!!pick2);
      if(pick2){ const G=mkG(D0,pick2.h); const sp0=CROWD.shopPrebuild; CROWD.shopPrebuild=()=>0; enter(ZN,G); const n0=ppl().length; CROWD.preClear(E);
        G.hour=pick2.sl.t0+0.01; CROWD.keep(G); E.player.speed=3.2; E.player.lastMoveT=E.time; const b0=builds; CROWD.tick(GM,1.6); CROWD.tick(GM,1.6);
        const whileRun=builds-b0, n1=ppl().length;
        E.player.speed=0; E.time+=3; CROWD.tick(GM,1.6); const afterStop=builds-b0, n2=ppl().length;
        check('B5. 時段到了、沒有先生好的、玩家正在跑：這時候不生（CHAR.build 0 次、人還沒來）——修改前：當場生，那一幀 116 ms',whileRun===0&&n1===n0,J([whileRun,n0,n1]));
        check('B5. 玩家一停下來：下一拍就生、客人進來（一個人都沒少）',afterStop>=1&&n2>n0,J([afterStop,n0,n2]));
        /* 一直跑：最多等 SPAWN_DEFER 秒 */
        enter(ZN,mkG(D0,pick2.h)); CROWD.preClear(E); const n3=ppl().length; GM.G.hour=pick2.sl.t0+0.01; CROWD.keep(GM.G); E.player.speed=3.2; E.player.lastMoveT=E.time; const d0=CROWD.SPAWN_DEFER; CROWD.SPAWN_DEFER=0.05; const b1=builds;
        CROWD.tick(GM,1.6); const t1=builds-b1; await sleep(80); E.player.lastMoveT=E.time; CROWD.tick(GM,1.6); const t2=builds-b1; CROWD.SPAWN_DEFER=d0; CROWD.shopPrebuild=sp0;
        check('B5. 玩家一直在跑：等超過上限（SPAWN_DEFER，正式 '+d0+' 秒）照樣讓客人進來，不會永遠不來',t1===0&&t2>=1&&ppl().length>n3,J([t1,t2])); } }
    /* 人數沒有少：同一天同一時刻，進店的人數和原本的表一樣（先生好的不算在場的人） */
    { const G=mkG(D0,18.4); enter(ZN,G); const there=ppl().length; let plan=0; for(const sp of CROWD.SPOTS.filter(s=>s.zone===ZN&&s.shop)){ const sl=CROWD.slotAt(G,sp); if(sl) plan+=CROWD.group(G,sp,sl,E).length; }
      check('B6. 進店當下在場的客人數照時段表（'+there+' 位；先生好的另外算、還沒進場）',there>0&&there<=plan&&E.preObjs.every(o=>!E.npcs.some(n=>n.obj===o)),J([there,plan])); } } }
/* ================= C 接線 ================= */
{ const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  const en=g.slice(g.indexOf('async function enter(zoneId,spawn,opts)'),g.indexOf('GM.isEntering='));
  check('C1. 進區域（室內也一樣）：STORY.populate（→ CROWD.enter：先生好客人）在 Z3.prewarm 前面，prewarm 在淡入前面、warmup 在淡入後面',en.indexOf('STORY.populate(zoneId,GM)')>0&&en.indexOf('STORY.populate(zoneId,GM)')<en.indexOf('await Z3.prewarm(E')&&en.indexOf('await Z3.prewarm(E')<en.indexOf('await fade(false)')&&en.indexOf('await fade(false)')<en.indexOf('Z3.warmup(E)')&&/CROWD\.enter\(GM,zoneId\)/.test(st)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
