// 樓梯上、電梯裡的人不能被上一層的樓板擋住（2026-10-11 v9.5 審查：換樓層看到天空的修正讓「人在樓梯上就顯示上一層」，
// 鏡頭比上一層地板高的時候，總圖大廳的連廊與兩翼、萬才館北側走廊的樓板擋住樓梯上的人；電梯運鏡也一樣）。
// 不需要瀏覽器：在 Node 建出遊戲真正的區域（程序化備用模型＝和正式模型同一份配置），沿著引擎找的路（入口 → 二樓）每 0.25 m 取一點，
// 照引擎的跟隨鏡頭公式（區域的 camDist、室內俯角 0.38，另外測 0.22／0.6）算鏡頭位置，四個方向（鏡頭在南／東／北／西），
// 再用引擎的 slabClip（engine3d.js，看頭和腳兩條線）拉近、用引擎的 displayLv 決定上一層畫不畫，從鏡頭對人的腳、胸、頭各打一條線，看會不會打到上一層的東西（牆除外：牆會淡出）。
// 失敗條件只算「人在樓梯上」的點（這次的回歸）；人站在一樓或二樓地板上時被牆擋住是修改前就有的另一個問題，只印出來。
// 電梯：game3d.js elevatorRide 的運鏡（鏡頭 (cx-3.4, y+2.6, cz+4.2) 看 (cx, y+1.2, cz)），車廂從一樓到二樓每 0.25 m。
// 同一個測試也用 E.noSlabClip＝true（修改前的行為）跑一次：總圖大廳、萬才館一定要抓得到被擋住的點（證明這個測試抓得到這個 bug）。
// 這是模擬（幾何遮擋），不是截圖；畫面另外用 tests/levels_no_sky.py 在瀏覽器檢查。
// 用法：node tests/stairs_cam_slab_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'?nobldg'};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('引擎有 E.slabClip、E.displayLv',typeof E.slabClip==='function'&&typeof E.displayLv==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
function opaqueMeshes(grp,skip){ const out=[]; grp.updateMatrixWorld(true); grp.traverse(o=>{ if(!o.isMesh||skip.has(o)) return; const m=o.material; if(!m||Array.isArray(m)||m.visible===false) return; if(m.transparent&&(m.opacity===undefined||m.opacity<0.9)) return; let p=o, vis=true; while(p&&p!==grp){ if(p.visible===false){ vis=false; break; } p=p.parent; } if(vis) out.push(o); }); return out; }
const ray=new THREE.Raycaster();
// 鏡頭照 engine3d.js updateCamera：desired＝target＋(sin yaw·d·cos p, sin p·d＋0.2, cos yaw·d·cos p)，最低 腳＋0.6，然後 slabClip
function camAt(tgt,py,yaw,dist,pitch){ const c=new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),Math.sin(pitch)*dist+0.2,Math.cos(yaw)*dist*Math.cos(pitch)).add(tgt); if(c.y<py+0.6) c.y=py+0.6; E.slabClip(tgt,c,1.15); return c; }
/* 被擋住的線：hidden＝打到上一層的樓板（打到的點在某一塊樓板的範圍與厚度裡，±5 cm）；other＝打到上一層別的東西（欄杆、牆、量體） */
function onSlab(p){ for(const s of E.zone.slabs||[]) if(p.x>s.x0-0.05&&p.x<s.x1+0.05&&p.z>s.z0-0.05&&p.z<s.z1+0.05&&p.y>s.y-s.t-0.05&&p.y<s.y+0.05) return true; /* 樓板範圍扣掉了電梯井：打到井口位置的地板（備用模型的地板沒挖洞）也算樓板 */ return p.y>E.zone.levelGroups[1].y-0.4&&p.y<E.zone.levelGroups[1].y+0.05; }
function hidden(cam,pts,up){ let n=0; HID.other=0; for(const q of pts){ const dir=q.clone().sub(cam); const len=dir.length(); dir.normalize(); ray.set(cam,dir); ray.near=0; ray.far=len-0.05; const hs=ray.intersectObjects(up,false); if(hs.length){ if(onSlab(hs[0].point)) n++; else HID.other++; } } return n; }
const HID={other:0};
function survey(id,from,to,clip){ const z=loadZone(id); E.noSlabClip=!clip; const LG=z.levelGroups; const up=opaqueMeshes(LG[1].group,new Set(z.walls||[])); const dist=Z3.ZONES[id].camDist||3.8;
  const p=E.pathTo(from[0],from[1],from[2],to[0],to[1],to[2]); if(!p) return {err:'找不到路'};
  const pts=[[from[0],from[1],from[2]]].concat(p); let n=0, bad=0, ex=null, nFloor=0, badFloor=0, otherStairs=0; const Y1=LG[1].y;
  for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1]; const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const m=Math.max(1,Math.ceil(L/0.25));
    for(let k=0;k<m;k++){ const t=k/m; const x=a[0]+(b[0]-a[0])*t, zz=a[1]+(b[1]-a[1])*t, lv=(t<0.5?a[2]:b[2])|0; const py=E.navOf(lv).visualHeightAt(x,zz); E.player.obj.position.set(x,py,zz); E.player.lv=lv;
      const tgt=new THREE.Vector3(x,py+1.45,zz); const probes=[0.3,0.9,1.5].map(h=>new THREE.Vector3(x,py+h,zz));
      const onStairs=py>=0.5&&py<Y1-0.01;   /* 在樓梯上（換層中）：這次修的情況。站在一樓或二樓的地板上時被牆擋住是另一個問題（只記錄，不算失敗） */
      for(const pitch of [0.22,0.38,0.6]) for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){ if(onStairs) n++; else nFloor++; const cam=camAt(tgt,py,yaw,dist,pitch); const dl=E.displayLv(LG,py); const vis1=1<=dl||cam.y<LG[1].y-0.15; if(!vis1) continue;
        const h=hidden(cam,probes,up); if(onStairs&&HID.other>=2) otherStairs++; if(h>=2){ if(!onStairs){ badFloor++; continue; } bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),py:+py.toFixed(2),yaw:+yaw.toFixed(2),pitch,camY:+cam.y.toFixed(2)}; } } } }
  E.noSlabClip=false; return {n,bad,ex,nFloor,badFloor,otherStairs}; }
function elevator(id,clip){ const z=loadZone(id); E.noSlabClip=!clip; const LG=z.levelGroups; const up=opaqueMeshes(LG[1].group,new Set(z.walls||[])); const el=z.elev, Y1=LG[1].y; let n=0, bad=0, ex=null;
  for(let y=0;y<=Y1+1e-6;y+=0.25){ n++; E.player.obj.position.set(el.cx,y,el.cz); const cam=new THREE.Vector3(el.cx-3.4,y+2.6,el.cz+4.2), look=new THREE.Vector3(el.cx,y+1.2,el.cz); E.slabClip(look,cam,0.9);
    const vis1=1<=E.displayLv(LG,y)||cam.y<Y1-0.15; if(!vis1) continue; const h=hidden(cam,[0.3,0.9,1.5].map(hh=>new THREE.Vector3(el.cx,y+hh,el.cz)),up); if(h>=2){ bad++; if(!ex) ex={y:+y.toFixed(2),camY:+cam.y.toFixed(2)}; } }
  E.noSlabClip=false; return {n,bad,ex}; }
const LL=LINZE_LAYOUT, WL=WANCAI_LAYOUT, BL=LIBRARY_LAYOUT;
const routes=[
  ['總圖大廳：入口 → 中央大樓梯 → 二樓西側','library_hall',[BL.entrance.spawn.x,BL.entrance.spawn.z,0],[-8.6,1.5,1]],
  ['總圖大廳：入口 → 中央大樓梯 → 二樓東側','library_hall',[BL.entrance.spawn.x,BL.entrance.spawn.z,0],[8.6,1.5,1]],
  ['萬才館：大廳 → 西側樓梯 → 二樓門廳','wancai',[0,5,0],[WL.upperDoor.spawn.x,WL.upperDoor.spawn.z,1]],
  ['霖澤館：入口 → 雙跑樓梯 → 201 門口','linze',[LL.entrance.spawn.x,LL.entrance.spawn.z,0],null],
];
const base={};
for(const [name,id,from,to0] of routes){ let to=to0; if(!to){ loadZone(id); const c=E.interactables.find(i=>i.exit&&i.exit.to==='classroom'); to=[c.x,c.z+0.3,1]; }
  const b=survey(id,from,to,false), f=survey(id,from,to,true); if(b.err||f.err){ check(name,false,b.err||f.err); continue; }
  base[id]=(base[id]||0)+b.bad;
  check(name+'：在樓梯上時，人被上一層的樓板擋住（三條線擋住兩條以上）的鏡頭位置＝0',f.bad===0,`修改後 ${f.bad}/${f.n}（修改前 ${b.bad}/${b.n}）`+(f.ex?' 例：'+JSON.stringify(f.ex):''));
  console.log(`  （記錄）站在地板上時被上一層的樓板擋住：${f.badFloor}/${f.nFloor}（修改前 ${b.badFloor}/${b.nFloor}）；在樓梯上時被欄杆、牆等別的東西擋住兩條線以上：${f.otherStairs}/${f.n}（修改前 ${b.otherStairs}/${b.n}）`); }
for(const id of ['library_hall','wancai','linze']){ const b=elevator(id,false), f=elevator(id,true); base[id+'_elev']=b.bad;
  check(Z3.ZONES[id].name+'：電梯運鏡（一樓 → 二樓）車廂裡的人不被上一層的樓板擋住',f.bad===0,`修改後 ${f.bad}/${f.n}（修改前 ${b.bad}/${b.n}）`+(f.ex?' 例：'+JSON.stringify(f.ex):'')); }
// 測試本身抓得到 bug：修改前的行為在總圖大廳、萬才館一定有被擋住的點
check('（測試有效）修改前的行為：總圖大廳樓梯有被擋住的點',(base.library_hall||0)>0,String(base.library_hall));
check('（測試有效）修改前的行為：萬才館樓梯有被擋住的點',(base.wancai||0)>0,String(base.wancai));
// 剖面視角不變：人在一樓、鏡頭拉高到二樓地板以上時，二樓照舊整層藏起來，不拉近鏡頭
{ const z=loadZone('library_hall'); const LG=z.levelGroups; E.player.obj.position.set(0,0,4); const tgt=new THREE.Vector3(0,1.45,4); const c=new THREE.Vector3(0,7.5,9); const c0=c.clone(); const clipped=E.slabClip(tgt,c);
  check('人在一樓、鏡頭在二樓地板以上：不拉近（上一層整層藏起來的剖面視角不變）',!clipped&&c.distanceTo(c0)<1e-6&&!(1<=E.displayLv(LG,0)||c.y<LG[1].y-0.15)); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
