// 美國：法學院圖書館 2F 書庫（AA_399 第 8 節；LAWWW-B 10-24 任務 #82 第七間的另一半；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、模型登記了（Z3.ZONES.us_lawlib_2f；建築借一樓的 bldg.us_lawlib 往下 4.6 m，自己的 bldg.us_lawlib_2f 只放二樓才有的東西）
//   2. 一樓樓梯口：只有「上 2F（書庫）」（落點＝配置的 spawn），「樓梯（樓上書庫）」那句整理中不再出現；其他互動點照舊
//   3. 一樓：回來的落點（back_spawn）站得住、從一樓的出生點走得到；正式模型載入以後紅絨繩、小立牌、黃銅柱藏起來
//   4. 二樓：正式模型＝一樓那一個往下 4.6 m、紅絨繩藏起來，二樓自己的東西另外加進來；書架的旁白照 AA_399
//   5. 二樓的導航（E.simWalk）：出生點站得住、不在出口範圍裡；下樓、書架、三樓樓梯口、木梯、四邊迴廊、學姊和玩家的位置都走得到；中庭挑空、樓梯站不上去
// 修改前：沒有 us_lawlib_2f（第 1 項就失敗）。用法：node tests/us_lawlib_2f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const GAME_G={v:{day:1098,hour:11,flags:{},stage:'law'}}; global.GAME={get G(){ return GAME_G.v; }};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/characters.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|PORTRAIT_ONLY|ROOM_GLB_LAYOUTS|US3|US_\w+_LAYOUT|AIRPORT_T2_LAYOUT|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
/* 假的正式模型：記下載入了哪幾個，一樓那一個有紅絨繩、小立牌、一面牆 */
const asked=[]; const fake=key=>{ const g=new THREE.Group(); const mk=n=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial()); m.name=n; g.add(m); return m; };
  if(key==='bldg.us_lawlib'){ mk('usll_rope'); mk('usll_rope_sign'); mk('usll_stanchions'); const w=mk('WALL_N_wall'); w.userData.dir=[0,0,1]; } else mk('us_lawlib_2f_props'); return {scene:g}; };
ASSETS.loadOne=k=>{ asked.push(k); return Promise.resolve(fake(k)); };
const tick=()=>new Promise(r=>setTimeout(r,0));

(async()=>{
const L=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS.us_lawlib_2f:null;
check('1. 區域、模型登記了（us_lawlib_2f；借 bldg.us_lawlib 往下 4.6 m、自己的 bldg.us_lawlib_2f）', !!L&&!!Z3.ZONES.us_lawlib_2f&&L.glb==='us_lawlib'&&Math.abs(L.glb_y+4.6)<1e-6&&!!ASSETS.manifest['bldg.us_lawlib']&&!!ASSETS.manifest['bldg.us_lawlib_2f']&&/us_lawlib_2f\.glb$/.test(ASSETS.manifest['bldg.us_lawlib_2f'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const LL=US_LAWLIB_LAYOUT, R=LL.interact.find(q=>q.id==='stair_rope');
{ asked.length=0; const z=loadZone('us_lawlib'); const at=E.interactables.filter(i=>Math.abs(i.x-R.x)<0.01&&Math.abs(i.z-R.z)<0.01); const vis=at.filter(i=>!i.hidden);
  check('2. 一樓樓梯口只有「上 2F（書庫）」', vis.length===1&&vis[0].label==='上 2F（書庫）', vis.map(i=>i.label).join('、'));
  const up=vis[0]; check('2. 上樓的落點＝配置的 spawn', !!up&&up.exit&&up.exit.to==='us_lawlib_2f'&&Math.abs(up.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(up.exit.spawn.z-L.spawn.z)<1e-6);
  const others=LL.interact.filter(q=>q.id!=='stair_rope'); check('2. 其他互動點照舊（服務台、彩色玻璃窗、書架、查詢電腦）', others.every(q=>E.interactables.some(i=>i.label===q.label&&!i.hidden&&Math.abs(i.x-q.x)<0.01)));
  const B=L.back_spawn, sp=[LL.spawn.x,LL.spawn.z];
  check('3. 一樓：回來的落點站得住、從一樓的出生點走得到', E.canStand(B.x,B.z,0.3,0)&&E.simWalk(sp[0],sp[1],B.x,B.z,{lv0:0,lv1:0,dt:0.1,speed:4.1}).ok, JSON.stringify(B));
  await tick(); await tick(); const g=z.group; const rope=[]; g.traverse(o=>{ if(/^usll_rope/.test(o.name)) rope.push(o); });
  let st=null; g.traverse(o=>{ if(o.name==='usll_stanchions') st=o; });
  check('3. 一樓的正式模型載入以後紅絨繩、小立牌、黃銅柱都藏起來', rope.length===2&&rope.every(o=>!o.visible)&&!!st&&!st.visible); }
{ asked.length=0; const z=loadZone('us_lawlib_2f'); await tick(); await tick(); await tick(); let base=null, extra=null; z.group.traverse(o=>{ if(o.name==='usll_rope') base=o.parent; if(o.name==='us_lawlib_2f_props') extra=o; });
  check('4. 二樓：正式模型＝一樓那一個往下 4.6 m、紅絨繩藏起來', asked[0]==='bldg.us_lawlib'&&!!base&&Math.abs(base.position.y+4.6)<1e-6&&base.children.filter(o=>/^usll_rope/.test(o.name)).every(o=>!o.visible)&&z.formal===true, asked.join(','));
  check('4. 二樓自己的東西另外加進來（bldg.us_lawlib_2f）', asked.includes('bldg.us_lawlib_2f')&&!!extra);
  check('4. 書架的旁白照 AA_399', Z3.roomGlbLook('us_lawlib_2f',L.interact.find(q=>q.id==='stacks'))==='（書架很高，最上層要用梯子。整排都是很舊的判例彙編。）');
  const sp=[z.spawn.x,z.spawn.z], X=L.exits[0]; const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  check('5. 出生點站得住、不在「下樓」的範圍裡', E.canStand(sp[0],sp[1],0.3,0)&&Math.hypot(sp[0]-X.x,sp[1]-X.z)>X.r);
  const bad=[]; for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label); if(!reachNear(X.x,X.z,X.r)) bad.push('下樓');
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='us_lawlib'); if(!(ex&&ex.label==='下樓（一樓）'&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6)) bad.push('下樓的落點');
  check('5. 下樓、書架、三樓樓梯口、木梯都走得到', !bad.length, bad.join('、'));
  const G4=[['東',8.35,6.0],['西',-8.35,-3.0],['北',-3.9,-6.3],['南',2.0,6.3],['東邊的走道裡',10.7,-0.9],['西南角',-8.35,8.5]].filter(([n,x,zz])=>!(E.canStand(x,zz,0.3,0)&&walk(sp,[x,zz]).ok)).map(q=>q[0]);
  check('5. 四邊的迴廊、書架之間的走道都走得到', !G4.length, G4.join('、'));
  const S=L.spots; check('5. 學姊、玩家的位置站得住、走得到', [S.sis,S.player].every(p=>E.canStand(p.x,p.z,0.3,0)&&walk(sp,[p.x,p.z]).ok));
  check('5. 中庭挑空（中間、欄杆邊）、兩座樓梯站不上去', [[0,0],[0,-5.45],[6.4,-3],[-6.4,-3],[7.45,2]].every(([x,zz])=>!E.canStand(x,zz,0.3,0))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
