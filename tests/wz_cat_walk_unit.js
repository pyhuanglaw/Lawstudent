// 溫州街的貓會走動（WZ-CAT-LIFE-1023／USER_WANTS J13；LAWWW2-C 2026-10-27）：bldg.wz_cat 的 CAT_walk 有骨架和四段動畫；src/wzcat3d.js 讓貓白天在公園幾個點之間走。
// 檢查：GLB 的骨架、動畫、fat；醒著的時段；貓會去的點站得住、走得到、玩家摸得到；坐→站→看→走→坐、速度、互動點跟著貓；玩家走近停下、劇情時坐著；接線。不需要瀏覽器。用法：node tests/wz_cat_walk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wzpark3d.js'),'utf8').replace(/^const PARK\s*=/m,'global.PARK='),{filename:'src/wzpark3d.js'}); if(fs.existsSync(path.join(ROOT,'src/wzcat3d.js'))) vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wzcat3d.js'),'utf8').replace(/^const WZCAT\s*=/m,'global.WZCAT='),{filename:'src/wzcat3d.js'}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/aa_support/wz_cat.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString());
const node=n=>J.nodes.find(q=>q.name===n);
{ const m=node('CAT_walk_mesh'), sk=m&&m.skin!=null?J.skins[m.skin]:null, an={}; for(const a of (J.animations||[])) an[a.name]=J.accessors[a.samplers[0].input].max[0];
  check('① GLB：CAT_walk 有骨架（CAT_walk_mesh 綁 24 根骨頭）',!!sk&&sk.joints.length===24,sk?sk.joints.length+' 根':'沒有骨架');
  check('① 四段動畫：cat_walk 1 秒、cat_idle 4 秒、cat_sit 約 0.75 秒、cat_sit_idle 4 秒',Math.abs((an.cat_walk||0)-1)<0.01&&Math.abs((an.cat_idle||0)-4)<0.01&&an.cat_sit>0.5&&an.cat_sit<1&&Math.abs((an.cat_sit_idle||0)-4)<0.01,JSON.stringify(an));
  const tg=node('CAT_walk_tag'), bd=node('CAT_walk_bandage'); check('① 項圈名牌、繃帶也綁在骨架上（走路時跟著脖子、左前腳）',!!tg&&tg.skin!=null&&!!bd&&bd.skin!=null);
  const mm=m&&J.meshes[m.mesh]; check('① 身體還是有 fat（大二上胖）',!!mm&&(mm.extras&&mm.extras.targetNames||[]).includes('fat'));
  const cnt=n=>{ const q=node(n); if(!q||q.mesh==null) return 1e9; return J.meshes[q.mesh].primitives.reduce((a,p)=>a+J.accessors[p.indices].count/3,0); };
  check('① 三角形：每個姿勢（身體＋名牌＋繃帶）≤ 3000',['sit','lie','curl'].every(p=>cnt('CAT_'+p)+cnt('CAT_'+p+'_tag')+cnt('CAT_'+p+'_bandage')<=3000)&&cnt('CAT_walk_mesh')+cnt('CAT_walk_tag')+cnt('CAT_walk_bandage')<=3000); }
check('② WZCAT 存在（attach、update、awake、SPOTS）',typeof WZCAT!=='undefined'&&typeof WZCAT.attach==='function'&&typeof WZCAT.update==='function');
if(typeof WZCAT==='undefined'){ console.log('FAILED '+(fails)); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
{ const G=h=>({day:dayOf('2025-10-15'),hour:h,weather:'sunny',flags:{},daily:{}});
  check('② 醒著：10:00 晴天是；06:30、18:00、下雨、颱風不是',WZCAT.awake(G(10))&&!WZCAT.awake(G(6.5))&&!WZCAT.awake(G(18))&&!WZCAT.awake(Object.assign(G(10),{weather:'rain'}))&&!WZCAT.awake(Object.assign(G(10),{weather:'typhoon'}))); }
/* 真的溫州街區域（導航格）*/
global.GAME={G:{day:dayOf('2025-10-15'),hour:10,weather:'sunny',flags:{},daily:{}},E:E3}; E3.interactables=[]; E3.colliders=[]; E3.lampGlows=[]; E3.seats=[]; E3.npcs=[];
const z=Z3.ZONES.wenzhou.build(E3); E3.nav=z.nav; E3.levels=z.levels;
{ const bad=WZCAT.SPOTS.filter(s=>!E3.canStand(s.x,s.z,0.18,0)); check('③ 貓會去的 '+WZCAT.SPOTS.length+' 個點都站得住（導航格）',!bad.length,JSON.stringify(bad));
  const s0=WZCAT.SPOTS[0], nopath=WZCAT.SPOTS.slice(1).filter(s=>{ const p=E3.pathTo(s0.x,s0.z,0,s.x,s.z,0); return !p||!p.length||Math.hypot(p[p.length-1][0]-s.x,p[p.length-1][1]-s.z)>0.3; });
  check('③ 從老樹圓椅前走得到每一個點（公園的導航格找路）',!nopath.length,JSON.stringify(nopath));
  const ent={x:26,z:5.6}, far=WZCAT.SPOTS.filter(s=>{ for(let a=0;a<16;a++){ const x=s.x+Math.cos(a*Math.PI/8)*0.9, q=s.z+Math.sin(a*Math.PI/8)*0.9; if(!E3.canStand(x,q,0.33,0)) continue; const p=E3.pathTo(ent.x,ent.z,0,x,q,0); if(p&&p.length&&Math.hypot(p[p.length-1][0]-x,p[p.length-1][1]-q)<0.3) return false; } return true; });
  check('③ 玩家從公園入口 A 走得到每一個點旁邊 0.9 m（摸得到貓；互動半徑 1.4 m）',!far.length,JSON.stringify(far));
  const up=z.update; let called=0; const keep=WZCAT.update; WZCAT.update=()=>{ called++; }; if(up) up.call(z,0.1,E3); WZCAT.update=keep;
  check('④ 溫州街區域每一格呼叫 WZCAT.update（zones3d.js buildWenzhou 的 zone.update）',called===1); }
/* 模擬載入的 GLB：同樣的名字、動畫片段（空的軌道）*/
const fakeGLB=(anims)=>{ const sc=new THREE.Group(); for(const p of ['sit','lie','curl']){ const m=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({name:'cat_fur'})); m.name='CAT_'+p; sc.add(m); }
  const w=new THREE.Group(); w.name='CAT_walk'; const body=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({name:'cat_fur'})); body.name='CAT_walk_mesh'; body.morphTargetDictionary={fat:0}; body.morphTargetInfluences=[0]; w.add(body);
  for(const k of ['tag','bandage']){ const a=new THREE.Mesh(new THREE.BufferGeometry(),body.material); a.name='CAT_walk_'+k; w.add(a); } sc.add(w);
  return {scene:sc,animations:anims?['cat_walk','cat_idle','cat_sit','cat_sit_idle'].map(n=>new THREE.AnimationClip(n,n==='cat_walk'?1:(n==='cat_sit'?0.75:4),[])):[]}; };
{ const scene=new THREE.Scene(), par=new THREE.Group(); scene.add(par);
  check('⑤ 舊的 GLB（沒有動畫）：不接手（照舊放趴著的貓）',WZCAT.attach(E3,par,fakeGLB(false),{G:GAME.G})===false);
  GAME.G.hour=19; check('⑤ 晚上 19:00：不接手（趴在圓椅上）',WZCAT.attach(E3,par,fakeGLB(true),{G:GAME.G})===false); GAME.G.hour=10;
  const it={park:'cat',x:26,z:22.85,radius:1.4}; E3.interactables=[it]; E3.player={obj:new THREE.Object3D(),busy:false}; E3.player.obj.position.set(40,0,40); scene.add(E3.player.obj);
  let r=0.3; const rnd=()=>{ r=(r*9301+49297)%233280/233280; return r; };
  check('⑤ 白天：接手（坐在老樹圓椅前）',WZCAT.attach(E3,par,fakeGLB(true),{G:GAME.G,rnd})===true&&WZCAT.state().state==='sit'&&WZCAT.state().x===26);
  const c=WZCAT._cat(); let maxV=0, prev={x:c.obj.position.x,z:c.obj.position.z}, left=-1, arrived=-1, itOK=true, states=new Set();
  for(let i=0;i<3000;i++){ WZCAT.update(0.1,E3); const o=c.obj.position, v=Math.hypot(o.x-prev.x,o.z-prev.z)/0.1; maxV=Math.max(maxV,v); prev={x:o.x,z:o.z}; states.add(c.state);
    if(left<0&&Math.hypot(o.x-26,o.z-23.3)>0.05) left=i*0.1; if(left>=0&&arrived<0&&c.state==='sit') arrived=i*0.1; if(Math.abs(it.x-o.x)>1e-9||Math.abs(it.z-o.z)>1e-9) itOK=false; if(arrived>=0) break; }
  check('⑥ 坐一陣子以後站起來、看一下、走到另一個點坐下（坐→站起來→看→走→坐）',left>0&&arrived>left&&['sit','rise','look','walk'].every(s=>states.has(s)),JSON.stringify({left,arrived,states:[...states]}));
  check('⑥ 走路速度不超過 0.32 m/s（一步一秒、腳不滑）',maxV<=0.3201,maxV.toFixed(3));
  check('⑥ 到的地方是貓會去的點之一（不是出發點）',WZCAT.SPOTS.some(s=>s!==WZCAT.SPOTS[0]&&Math.hypot(s.x-c.obj.position.x,s.z-c.obj.position.z)<0.05),JSON.stringify(WZCAT.state()));
  check('⑥ 「摸摸」的互動點一直跟著貓',itOK);
  /* 玩家走近：走路中的貓停下來 */
  c.t=0; let walking=false; for(let i=0;i<400&&!walking;i++){ WZCAT.update(0.1,E3); walking=c.state==='walk'&&c.path&&c.path.length>0; }
  const o=c.obj.position; E3.player.obj.position.set(o.x+0.8,0,o.z); WZCAT.update(0.1,E3); const at={x:o.x,z:o.z}; for(let i=0;i<20;i++) WZCAT.update(0.1,E3);
  check('⑦ 玩家走到 1.6 m 內：走路的貓停下來看玩家',walking&&c.state==='look'&&Math.hypot(o.x-at.x,o.z-at.z)<1e-6,JSON.stringify(WZCAT.state()));
  E3.player.busy=true; for(let i=0;i<5;i++) WZCAT.update(0.1,E3);
  check('⑦ 劇情在演（玩家忙）：貓坐下、不走',c.state==='sit');
  E3.player.busy=false; scene.remove(par); WZCAT.update(0.1,E3); check('⑧ 離開溫州街（貓不在場景裡）：不再更新',WZCAT.state()===null); }
{ const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('⑨ zones3d.js：正式模型載入後先問 WZCAT.attach（下雨、寒流的石桌底下不接手），接手就不放趴著的貓',/if\(!under&&typeof WZCAT!=='undefined'&&WZCAT\.attach\(E,catG,c,\{G:G0\}\)\)\{ cg\.visible=false; return; \}/.test(zs));
  check('⑨ index.html 在 wzpark3d.js 後面載入 src/wzcat3d.js',ix.indexOf('src/wzcat3d.js')>ix.indexOf('src/wzpark3d.js')&&ix.indexOf('src/wzpark3d.js')>0); }
delete global.GAME;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
