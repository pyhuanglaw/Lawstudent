// 118 巷街景：BB_341（企劃線 docs/story_planning/BB_341_118巷3D第1輪_美術判定_1111.md）四項裡資料查得到的三項（L118-STREET-FIX-1111，2026-11-11；LAWWW 的子代理代 LAWWW2）
//   3. 路燈不站在十一間店的店門、招牌正前方（原本一支在迪倫窯烤披薩招牌的「烤」字和店門中間）
//   4. 外帶飲料店（喝不喝咖啡、果茶社）整個店面前面沒有機車；每間店的店門＋左右各 0.5 m、店的正中間（進店的互動點）±2.4 m 沒有機車，車身只壓到店面最外側 1 m；
//      從巷子中間走到兩間飲料店的點餐位置沒有東西擋（遊戲真正的區域導航格＋玩家半徑）
//   1. 九間店「隔著玻璃看進去」的圖（tools/blender/env_second/l118_peek_tex.py）九間都有、範圍在貼圖集裡
//   2. 九間店門外的照片（W3.VIEW_LAYERS，tools/shots/shop_views_layers.py）四張都在、景深表九間都有——照片裡有沒有舊店名要用眼睛看（docs/art-rebuild/second_ai/wip/l118_street_fix_1111/README.md）
// 這是資料和導航格的檢查，不是畫面（D131）。用法：node tests/l118_street_fix_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lane118_layout.js','src/data/lane118_props.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
const SRC={};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); SRC[f]=src; src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|L118S|LANE118_LAYOUT|LANE118_PROPS|L118_SHOP_LAYOUTS|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const L=LANE118_LAYOUT, LP=LANE118_PROPS, FW=L.facade.west, FE=L.facade.east, HALF=1.95/2;
/* 店門在店面的本地 x、門寬（tools/blender/env_second/wz_shopkit.py SF_L118 的 door_x、door_w；lane118_props.py 的 DOOR_X 同一張表）。西側的店本地 +x＝北（−z），東側＝南（+z）*/
const DOOR_X={dian:[0,2.7],self:[0,1.8],tea:[-0.45,0.95],home:[2.2,1.9],cafe2:[1.3,1.8],pasta:[1.9,1.3],korea:[1.7,1.8],omu:[1.2,1.2],noodle2:[2.0,1.6]};
const doorZ=q=>{ const d=DOOR_X[q.id]; if(!d) return null; const cz=(q.z0+q.z1)/2, dz=q.side==='W'?cz-d[0]:cz+d[0]; return [dz-d[1]/2,dz+d[1]/2]; };
check('0. 配置有十一間店（九間＋兩間外帶）',L.shops.length===11&&L.shops.filter(q=>q.takeout).length===2);

/* ---- 3. 路燈 ---- */
const m=/for\(const z of \[([-\d.,\s]+)\]\)\{ const lp=W3\.lampPost\(\)/.exec(SRC['src/zones3d.js']);
const lamps=m?m[1].split(',').map(Number):[];
check('3a. 118 巷的路燈位置讀得到（zones3d.js buildLane118，東側 x＝立面－0.35）',lamps.length===4,JSON.stringify(lamps));
{ const bad=[]; for(const z of lamps) for(const q of L.shops.filter(q=>q.side==='E')){ if(z>q.z0+0.3&&z<q.z1-0.3) bad.push([z,q.name,'店面正前方']); const d=doorZ(q); if(d&&z>d[0]-0.5&&z<d[1]+0.5) bad.push([z,q.name,'店門前']); }
  check('3b. 路燈不在東側六間店的店面正前方（只能在兩棟之間的壁柱前 ±0.3 m 或沒有店的那幾段）',bad.length===0,JSON.stringify(bad));
  check('3c. 原本擋住迪倫窯烤披薩的那一支（z −10）移走了',!lamps.includes(-10)); }

/* ---- 4. 機車 ---- */
const mid=LP.scooters.filter(s=>Math.abs(Math.abs(s[0])-(L.lane.x1-0.62))<0.01);   /* 中間那一段靠路邊順著停的（車身沿 z，長 1.95 m）*/
check('4a. 機車讀得到（中間那一段）',mid.length>=6,mid.length+' 台／全部 '+LP.scooters.length+' 台');
{ const bad=[]; for(const q of L.shops){ const sx=q.side==='W'?-1:1, cz=(q.z0+q.z1)/2;
    for(const s of mid){ if(Math.sign(s[0])!==sx) continue; const a=s[1]-HALF, b=s[1]+HALF;
      if(q.takeout&&b>q.z0&&a<q.z1) bad.push([q.name,'店面前',s[1]]);
      if(Math.abs(s[1]-cz)<2.4) bad.push([q.name,'正中間',s[1]]);
      if(!q.takeout&&b>q.z0+1.0+1e-6&&a<q.z1-1.0-1e-6) bad.push([q.name,'玻璃前（車身超過店面最外側 1 m）',s[1]]);
      const d=doorZ(q); if(d&&b>d[0]-0.5&&a<d[1]+0.5) bad.push([q.name,'店門前',s[1]]); } }
  check('4b. 十一間店：外帶店整個店面、店門＋左右 0.5 m、正中間 ±2.4 m 都沒有機車；其他九間車身只壓到店面最外側 1 m（兩間店交界）',bad.length===0,JSON.stringify(bad)); }
{ const bad=[]; for(const [x,z,w,d] of LP.scooter_blocks) for(const q of L.shops.filter(q=>q.takeout)){ if(Math.sign(x)===(q.side==='W'?-1:1)&&Math.abs(Math.abs(x)-(L.lane.x1-0.62))<0.01&&z+d/2>q.z0&&z-d/2<q.z1) bad.push([q.name,x,z,d]); }
  check('4c. 機車的導航阻擋沒有壓在外帶店的店面前',bad.length===0,JSON.stringify(bad)); }
{ const near=(a,b)=>Math.abs(a-b)<1.95-1e-6; const bad=[]; for(const sx of [-1,1]){ const zs=mid.filter(s=>Math.sign(s[0])===sx).map(s=>s[1]).sort((a,b)=>a-b); for(let i=1;i<zs.length;i++) if(near(zs[i],zs[i-1])) bad.push([sx,zs[i-1],zs[i]]); }
  check('4d. 移過的機車沒有和別台疊在一起（同一側中心相距 ≥ 1.95 m）',bad.length===0,JSON.stringify(bad)); }
/* 遊戲真正的區域：從巷子中間直直走到兩間飲料店的點餐位置（立面往巷子 0.9 m、店的正中間），每 0.25 m 都站得住 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const zone=Z3.ZONES.lane118.build(E); E.zone=zone; E.levels=zone.levels||null; E.nav=zone.nav; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
for(const q of L.shops.filter(q=>q.takeout)){ const cz=(q.z0+q.z1)/2, px=q.side==='W'?FW+0.9:FE-0.9, bad=[]; const it=E.interactables.find(i=>i.shop118===q.id);
  for(let x=0;Math.abs(x)<=Math.abs(px)+1e-6;x+=Math.sign(px)*0.25) if(!E.canStand(x,cz,0.32,0)) bad.push(+x.toFixed(2));
  for(let z=q.z0+0.4;z<=q.z1-0.4;z+=0.25) for(const x of [Math.sign(px)*(L.lane.x1-0.62),Math.sign(px)*(L.lane.x1+0.9)]) if(!E.canStand(x,z,0.32,0)) bad.push([+x.toFixed(2),+z.toFixed(2)]);
  check('4e. '+q.name+'：從巷子中間到點餐位置、店面前的路邊和人行道都站得住（有點餐的互動點）',bad.length===0&&!!it&&Math.abs(it.x-px)<0.01&&Math.abs(it.z-cz)<0.01,JSON.stringify(bad)); }

/* ---- 1. 隔著玻璃看進去的圖 ---- */
const IDS=['dian','self','tea','home','cafe2','pasta','korea','omu','noodle2'];
{ const jp=path.join(ROOT,'tools/blender/env_second/textures/gen/l118_peek_atlas.json'), ip=jp.replace(/json$/,'jpg'); const ok=fs.existsSync(jp)&&fs.existsSync(ip); const J=ok?JSON.parse(fs.readFileSync(jp,'utf8')):{};
  const bad=IDS.filter(id=>{ const p=J[id]; return !p||p.uv.some(v=>v<0||v>1)||!(p.uv[2]>p.uv[0]&&p.uv[3]>p.uv[1])||!/^#[0-9a-f]{6}$/.test(p.floor)||!/^#[0-9a-f]{6}$/.test(p.wall); });
  check('1a. 九間店都有從新室內算的圖（l118_peek_atlas）',ok&&bad.length===0,JSON.stringify(bad));
  const kit=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/wz_shopkit.py'),'utf8');
  check('1b. 街景腳本：九間店的淺店內走新室內那一套（l118_peek_interior），不走舊店型（紅紙菜單那一排）',/if SET == 'lane118' and spec\.get\('lane118'\) in l118_peek\(\): return l118_peek_interior/.test(kit)); }

/* ---- 2. 門外的照片 ---- */
{ const dir=path.join(ROOT,'assets/models/env/views'), miss=[]; for(const id of IDS) for(const s of ['day','night','near_day','near_night']){ const f=path.join(dir,'l118_'+id+'_'+s+'.webp'); if(!fs.existsSync(f)||fs.statSync(f).size<2000) miss.push(id+'_'+s); }
  check('2a. 九間店門外的照片各四張都在',miss.length===0,miss.join());
  const J=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/shots/shop_views_layers.json'),'utf8')), bad=[];
  for(const id of IDS){ const v=W3.VIEW_LAYERS&&W3.VIEW_LAYERS['l118_'+id], d=J['l118_'+id+'_day']; if(!v||!d||Math.abs(v.far-d.far)>0.011||Math.abs(v.near-d.near)>0.011) bad.push([id,v,d&&[d.far,d.near]]); }
  check('2b. 景深表（src/l118_shops3d.js）和這次拍的量測（tools/shots/shop_views_layers.json）一樣',bad.length===0,JSON.stringify(bad)); }

console.log(fails?('\nFAIL '+fails+' 項'):'\n全部 PASS'); process.exit(fails?1:0);
