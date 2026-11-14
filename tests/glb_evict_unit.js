// BUG-IOS-RELOAD（LAWWW-C 11-13）：離開區域後放掉用不到的建築 GLB（src/assets3d.js A.zoneUse／A.evictBuildings、src/game3d.js enter）——不需要瀏覽器。
//   ① 預設不做（沒有 ?glbevict）：A.evictOn()＝false；game3d.js enter 只在 evictOn() 時呼叫 evictBuildings；
//   ② 現在這一區、前 2 個區域用過的建築 GLB 留著；更早的放掉（A.cache、A.status 都拿掉）；
//   ③ 放掉的：幾何、材質、自己的貼圖 dispose；跨模型共用的貼圖（A.texShare）不 dispose；userData.shared 的幾何不碰；
//   ④ 不是建築（character、vrm…）、manifest 標 keep 的不放；
//   ⑤ 換區域以後在區域裡才載的（loadOne）也算這一區用過（A.zoneUsed）；
//   ⑥ A.lastEvict 記放了幾個、哪幾個。
// 用法：node tests/glb_evict_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node',maxTouchPoints:0};
global.document={ createElementNS:()=>({getContext:()=>null,style:{}}), createElement:()=>({width:1,height:1,style:{},getContext:()=>null}), getElementById:()=>null, addEventListener(){} };
global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/assets3d.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const A=ASSETS;
check('① 沒有 ?glbevict：A.evictOn()＝false', A.evictOn()===false);
location.search='?dev&glbevict'; check('① 網址 ?glbevict：A.evictOn()＝true', A.evictOn()===true); location.search='';
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('① game3d.js enter：reqTake 以後 zoneUse，evictOn() 才 evictBuildings', /reqTake\(\):\[\];\s*if\(typeof ASSETS!=='undefined'&&ASSETS\.zoneUse\)\{ ASSETS\.zoneUse\(GM\._zoneReq\); if\(ASSETS\.evictOn&&ASSETS\.evictOn\(\)\)/.test(g3));
// 假的建築：一個 mesh，材質有自己的貼圖＋一張共用貼圖
const disposed=new Set(); const track=o=>{ const d=o.dispose.bind(o); o.dispose=()=>{ disposed.add(o); d(); }; return o; };
const sharedTex=track(new THREE.Texture()); A.texShare.set('k-shared',sharedTex);
function bldg(key,type,extra){ const own=track(new THREE.Texture()); const geo=track(new THREE.BufferGeometry()); const mat=track(new THREE.MeshStandardMaterial({map:own,normalMap:sharedTex}));
  const sc=new THREE.Group(); sc.add(new THREE.Mesh(geo,mat)); A.manifest[key]=Object.assign({type,url:key+'.glb'},extra||{}); A.cache[key]={scene:sc,gltf:{scene:sc},animations:[]}; A.status[key]=Promise.resolve(A.cache[key]); return {own,geo,mat}; }
const B={}; for(const k of ['z1','z2','z3','z4','later']) B[k]=bldg('bldg.'+k,'building');
B.ch=bldg('char.x','character'); B.keep=bldg('bldg.keepme','building',{keep:true});
const sg=track(new THREE.BufferGeometry()); sg.userData.shared=true; A.cache['bldg.z1'].scene.add(new THREE.Mesh(sg,new THREE.MeshBasicMaterial()));
// 依序進 z1→z2→z3→z4；每一區只用自己那一棟
A.zoneUse(['bldg.z1']); A.zoneUse(['bldg.z2']); A.zoneUse(['bldg.z3']); A.zoneUse(['bldg.z4']);
A.loadOne('bldg.later');   /* 在 z4 裡才載的（已在 cache：直接回傳） */
check('⑤ 區域裡才載的也算這一區用過', A.zoneUsed.has('bldg.later'));
const r=A.evictBuildings();
check('② z4（現在）、z3、z2（前兩區）留著', !!A.cache['bldg.z4']&&!!A.cache['bldg.z3']&&!!A.cache['bldg.z2']&&!!A.cache['bldg.later']);
check('② z1（三區以前）放掉：cache、status 都拿掉', !A.cache['bldg.z1']&&!A.status['bldg.z1']);
check('③ 放掉的那一棟：幾何、材質、自己的貼圖 dispose', disposed.has(B.z1.geo)&&disposed.has(B.z1.mat)&&disposed.has(B.z1.own));
check('③ 共用貼圖（A.texShare）不 dispose', !disposed.has(sharedTex));
check('③ userData.shared 的幾何不碰', !disposed.has(sg));
check('③ 留著的那幾棟沒有被 dispose', ![B.z2,B.z3,B.z4,B.later].some(b=>disposed.has(b.geo)||disposed.has(b.mat)||disposed.has(b.own)));
check('④ 不是建築、標 keep 的不放', !!A.cache['char.x']&&!!A.cache['bldg.keepme']&&!disposed.has(B.ch.geo)&&!disposed.has(B.keep.geo));
check('⑥ A.lastEvict 記結果', r&&r.n===1&&r.keys.length===1&&r.keys[0]==='bldg.z1'&&A.lastEvict===r&&A.evicted>=1, JSON.stringify(r));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
