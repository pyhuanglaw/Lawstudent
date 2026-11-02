// 醉月湖晚上（ART-ECON-3D-GAP-1021 D，LAWWW2-B 2026-11-01）——不需要瀏覽器。
// 起因：經濟系那一年 E12「長頸鹿的尾巴」11/6 17:45 在南岸步道，對白「湖對面的燈一盞一盞亮起來」；那時已經天黑（傍晚照日期：臺北 11/6 17:17 日落），
//   可是北岸一盞燈都沒有、湖心亭沒有燈、水面沒有燈的倒影（10-24 路線巡查「20:00 水面很暗、湖心亭沒有燈」）。
// 做法：src/zones3d.js 的 lake() 北岸加四盞路燈（燈臂朝湖）；水面 shader 加燈的倒影（南岸兩盞＋北岸四盞＋宮燈，入夜才有）；
//   湖心亭正中間吊一盞宮燈（campus_lake.glb 的 lake_lantern_paper，attachLakeGLB 讓燈紙晚上發光），旁邊一團光暈、平台上一圈光（E.lampGlows）。
// 檢查：
//   ① 北岸（湖中心往北 6 m 以外、湖岸外 5 m 內）有 4 盞路燈，燈臂朝湖，每一盞底下有光圈（E.lampGlows、白天藏著），燈桿擋住導航、旁邊站得住
//      （中間兩盞在北邊界 z −124 那排矮灌木後面＝地圖外的背景，本來就走不到）
//   ② 水面的倒影：7 個燈的位置（南岸 2＋北岸 4＋宮燈 1），每一個離某一盞路燈的燈頭或宮燈 0.1 m 內
//   ③ 倒影只在晚上：E.lampsOn 是 false 時 lampK＝0、true 時 1（updateLake）
//   ④ 宮燈的光暈＋平台上的光圈在 E.lampGlows、白天藏著，位置在亭子中間
//   ⑤ campus_lake.glb 有 lake_lantern_paper：在亭子中間（湖本地座標 (−3, 0.6)）、燈身 2.0～2.48 m（柱頭之間的額枋 2.48～2.84 m 下面，從亭子外面看得到；
//      第一版掛在 2.62～3.02，整個被額枋擋住）
//   ⑥ 正式模型接上以後，燈紙的材質會發光、登記在 TK 的夜間材質（和路燈同一個開關）；白天不亮
// 修改前（開發 f812b45c3）：6 項都 FAIL（③ 水面沒有 lampK）。用法：node tests/lake_night_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const CX=-36, CZ=-112, PX=CX-3, PZ=CZ+0.6;   // zones3d.js lake(g,nav,-36,-112,…)；湖心亭中心 (cx−3, cz+0.6)
// 正式模型：換成一個只有燈紙網格的小場景（Node 裡讀不到 GLB），看 attachLakeGLB 怎麼接
const fakeLake=new THREE.Group(); const paperMat=new THREE.MeshStandardMaterial({color:0xf0d6a2}); paperMat.name='lk_lantern_paper';
const paper=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.5),paperMat); paper.name='lake_lantern_paper'; paper.position.set(-3,2.28,0.6); fakeLake.add(paper);
const lo0=ASSETS.loadOne; ASSETS.loadOne=k=>k==='bldg.campus_lake'?Promise.resolve({scene:fakeLake}):Promise.reject(new Error('node：不載 '+k));
const made=[]; const lp0=W3.lampPost; W3.lampPost=(...a)=>{ const l=lp0(...a); made.push(l); return l; };
let wmat=null; const SM=THREE.ShaderMaterial; THREE.ShaderMaterial=function(p){ const m=new SM(p); if(p&&p.uniforms&&p.uniforms.deep&&p.uniforms.skyLo) wmat=m; return m; }; THREE.ShaderMaterial.prototype=SM.prototype;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); W3.lampPost=lp0; THREE.ShaderMaterial=SM; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
z.group.updateMatrixWorld(true);
(async()=>{
await new Promise(r=>setTimeout(r,50)); z.group.updateMatrixWorld(true); ASSETS.loadOne=lo0;
const post=l=>l.getWorldPosition(new THREE.Vector3()), head=l=>l.localToWorld(new THREE.Vector3(0,3.95,0.75));
// 湖岸外形（和 lake() 一樣）：點到湖中心的「橢圓半徑比」
const A=16.5, B=9.2, rad=t=>1+0.10*Math.sin(3*t+0.6)+0.05*Math.cos(5*t+1.3);
const outside=(x,z)=>{ const t=Math.atan2((z-CZ)/B,(x-CX)/A), r=rad(t); return Math.hypot((x-CX)/(A*r),(z-CZ)/(B*r)); };
const north=made.filter(l=>l.parent&&(()=>{ const p=post(l); return p.z<CZ-6&&Math.abs(p.x-CX)<22&&outside(p.x,p.z)>1&&outside(p.x,p.z)<1.5; })());
const glows=new Set(E.lampGlows);
const bad=north.filter(l=>{ const p=post(l), h=head(l); const armIn=Math.hypot(h.x-CX,h.z-CZ)<Math.hypot(p.x-CX,p.z-CZ); let pool=false; l.traverse(o=>{ if(o.isMesh&&glows.has(o)&&o.visible===false){ const w=o.getWorldPosition(new THREE.Vector3()); if(w.y<0.1) pool=true; } });
  const blocked=!E.canStand(p.x,p.z,0.32,0), around=p.z<-124||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>E.canStand(p.x+dx*1.2,p.z+dz*1.2,0.32,0)); return !(armIn&&pool&&blocked&&around); });   /* z −124 以北是地圖邊界外（北邊那排矮灌木後面，走不到）：在那裡的不用看旁邊站不站得住 */
check('① 北岸有 4 盞路燈，燈臂朝湖、有地上的光圈（入夜才開）、燈桿擋住、旁邊站得住（在邊界 z −124 外的除外）',north.length===4&&!bad.length,north.length+' 盞 '+JSON.stringify(north.map(l=>{ const p=post(l); return [+p.x.toFixed(1),+p.z.toFixed(1)]; }))+(bad.length?'；不對的 '+bad.length:''));
const U=wmat&&wmat.uniforms, n=U&&U.lampN?U.lampN.value:0, P=n?U.lampP.value.slice(0,n):[];
const lakeHeads=made.filter(l=>l.parent&&Math.hypot(post(l).x-CX,post(l).z-CZ)<26).map(head), targets=lakeHeads.concat([new THREE.Vector3(PX,2.28,PZ)]);
const lost=P.filter(p=>!targets.some(t=>t.distanceTo(p)<0.1));
check('② 水面有 7 個燈的倒影（南岸 2＋北岸 4＋宮燈），位置對得上燈頭',n===7&&!lost.length&&/lampP\[i\]/.test(wmat.fragmentShader),'lampN '+n+(lost.length?'；對不上的 '+JSON.stringify(lost.map(p=>[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)])):''));
E.sky={material:{uniforms:{bot:{value:new THREE.Color(0.1,0.1,0.2)},mid:{value:new THREE.Color(0.1,0.1,0.2)},top:{value:new THREE.Color(0.05,0.05,0.1)},sunDir:{value:new THREE.Vector3(0,-1,0)}}}}; E.sun=E.sun||{color:new THREE.Color(1,1,1),intensity:0};
E.lampsOn=false; z.update(0.016,E); const kDay=U&&U.lampK?U.lampK.value:null; E.lampsOn=true; z.update(0.016,E); const kNight=U&&U.lampK?U.lampK.value:null;
check('③ 倒影只在晚上：白天 lampK 0、路燈開了 1',kDay===0&&kNight===1,'白天 '+kDay+'、晚上 '+kNight);
const lg=E.lampGlows.filter(o=>{ const w=o.getWorldPosition(new THREE.Vector3()); return Math.hypot(w.x-PX,w.z-PZ)<0.3; });
const spr=lg.find(o=>o.isSprite&&Math.abs(o.getWorldPosition(new THREE.Vector3()).y-2.28)<0.2), pool=lg.find(o=>o.isMesh&&o.getWorldPosition(new THREE.Vector3()).y<0.1);
check('④ 宮燈的光暈（亭子中間 2.3 m）＋平台上的光圈，登記在 E.lampGlows、白天藏著',!!spr&&!!pool&&!spr.visible&&!pool.visible,'光暈 '+!!spr+'、光圈 '+!!pool);
{ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lake.glb')), nn=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+nn).toString('utf8'));
  const nd=J.nodes.find(x=>x.name==='lake_lantern_paper'), acc=nd&&nd.mesh!=null?J.accessors[J.meshes[nd.mesh].primitives[0].attributes.POSITION]:null, t=(nd&&nd.translation)||[0,0,0];
  const mn=acc&&acc.min.map((v,i)=>v+t[i]), mx=acc&&acc.max.map((v,i)=>v+t[i]);
  check('⑤ campus_lake.glb 有宮燈 lake_lantern_paper：在亭子中間、燈身在額枋（2.48 m）下面、2.0 m 以上',!!acc&&Math.abs((mn[0]+mx[0])/2+3)<0.1&&Math.abs((mn[2]+mx[2])/2-0.6)<0.1&&mn[1]>2.0&&mx[1]<2.48,acc?('x '+mn[0].toFixed(2)+'～'+mx[0].toFixed(2)+'、y '+mn[1].toFixed(2)+'～'+mx[1].toFixed(2)+'、z '+mn[2].toFixed(2)+'～'+mx[2].toFixed(2)):'沒有這個節點'); }
const attached=!!z.group.getObjectByName('campus_lake_glb'), inNight=TK.nightMats.indexOf(paperMat)>=0;
TK.setNight(0); const eDay=paperMat.emissiveIntensity; TK.setNight(1); const eNight=paperMat.emissiveIntensity;
check('⑥ 正式模型接上以後，燈紙晚上發光、白天不亮（TK 的夜間材質，和路燈同一個開關）',attached&&inNight&&paperMat.emissive.getHex()!==0&&eDay===0&&eNight>0.5,'接上 '+attached+'、登記 '+inNight+'、白天 '+eDay+'、晚上 '+eNight);
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})();
