// 美國篇的季節（ART-US-SEASON，src/us3d.js 的 usSeasonKey／usSeason；LAWWW2-C 2026-10-18）：不需要瀏覽器。
//   日期 → 季節 key（AA_213：summer 8/2～10/8、autumn 10/9～10/31、bare 11/1～12/1、snow 12/2～3/15、bare 3/16～4/15）
//   換材質（SEASON_MATS 底下的「<原材質名>__S_<季節>」）、季節網格（userData.seasons）開關，換回夏天時材質還原
//   正式 GLB（us_community.glb）裡的節點、材質名稱照約定（直接讀 GLB 的 JSON，不載貼圖）
// 用法：node tests/us_season_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
global.GAME={G:{day:1}};
// 交換那一年（大四上：2028/8～12；1～4 月是下一年）：找日曆上的那一天
function dayOf(y,m,d){ for(let k=-400;k<1800;k++){ const x=CALENDAR.dateOf(k); if(x.y===y&&x.m===m&&x.d===d) return k; } for(let k=-400;k<1800;k++){ const x=CALENDAR.dateOf(k); if(x.m===m&&x.d===d&&x.y==null) return k; } return null; }
const y0=CALENDAR.dateOf(1).y;
const CASES=[[8,2,'summer'],[9,15,'summer'],[10,8,'summer'],[10,9,'autumn'],[10,31,'autumn'],[11,1,'bare'],[12,1,'bare'],[12,2,'snow'],[12,23,'snow'],[1,20,'snow'],[3,15,'snow'],[3,16,'bare'],[4,15,'bare'],[4,16,'summer'],[7,1,'summer']];
for(const [m,d,want] of CASES){ const day=dayOf(m>=8?y0+2:y0+3,m,d)!=null?dayOf(m>=8?y0+2:y0+3,m,d):dayOf(y0,m,d); GAME.G.day=day; const got=US3.usSeasonKey(); check(`${m}/${d} → ${want}`,day!=null&&got===want,`day ${day}：${got}`); }
// 換材質、季節網格
const mat=n=>Object.assign(new THREE.MeshStandardMaterial(),{name:n});
const root=new THREE.Group(), car=new THREE.Group(); car.name='SEASON_MATS'; root.add(car);
const alt={autumn:mat('leaf__S_autumn'),snow:mat('leaf__S_snow'),gsnow:mat('grass__S_snow')};
for(const m of Object.values(alt)) car.add(new THREE.Mesh(new THREE.BufferGeometry(),m));
const leaf=mat('leaf'), grass=mat('grass'), roof=mat('roof');
const mLeaf=new THREE.Mesh(new THREE.BufferGeometry(),leaf), mGrass=new THREE.Mesh(new THREE.BufferGeometry(),grass), mRoof=new THREE.Mesh(new THREE.BufferGeometry(),roof);
const twigs=new THREE.Group(); twigs.name='SEASON_GEO_twig_inner'; twigs.userData.seasons='bare,snow'; twigs.add(new THREE.Mesh(new THREE.BufferGeometry(),mat('twig')));
root.add(mLeaf,mGrass,mRoof,twigs);
const at=(m,d)=>{ GAME.G.day=dayOf(m>=8?y0+2:y0+3,m,d)!=null?dayOf(m>=8?y0+2:y0+3,m,d):dayOf(y0,m,d); US3.usSeason(root); };
at(9,1); check('夏天：原材質、細枝藏起來、載體藏起來',mLeaf.material===leaf&&mGrass.material===grass&&!twigs.visible&&car.visible===false);
at(10,15); check('秋天：葉子換秋天的、草沒有秋天的替換＝原材質',mLeaf.material===alt.autumn&&mGrass.material===grass&&!twigs.visible);
at(12,10); check('雪天：葉子、草換雪的，屋頂沒有替換＝原材質，細枝看得到',mLeaf.material===alt.snow&&mGrass.material===alt.gsnow&&mRoof.material===roof&&twigs.visible);
at(8,20); check('換回夏天：材質還原',mLeaf.material===leaf&&mGrass.material===grass&&!twigs.visible);
check('載體底下的網格不被換材質',car.children.every((c,i)=>c.material===Object.values(alt)[i]));
// 正式 GLB：節點、材質照約定
const glb=path.join(ROOT,'assets/models/env/second_ai/us_community.glb');
if(fs.existsSync(glb)){ const b=fs.readFileSync(glb), n=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+n).toString('utf8'));
  const names=new Set((J.materials||[]).map(m=>m.name)), alts=[...names].filter(n=>n.includes('__S_'));
  check('us_community.glb 有 SEASON_MATS 和替換材質',J.nodes.some(nd=>nd.name==='SEASON_MATS')&&alts.length>0,`${alts.length} 個`);
  check('每個替換材質的原材質都在 GLB 裡、季節名稱正確',alts.every(a=>{ const [b0,s]=a.split('__S_'); return names.has(b0)&&['summer','autumn','bare','snow'].includes(s); }),alts.filter(a=>!names.has(a.split('__S_')[0])).join(','));
  const geos=J.nodes.filter(nd=>/^SEASON_GEO_/.test(nd.name||''));
  check('季節網格都有 seasons',geos.length>0&&geos.every(nd=>nd.extras&&typeof nd.extras.seasons==='string'),geos.map(g=>g.name+':'+(g.extras&&g.extras.seasons)).join(' ')); }
else check('us_community.glb 存在',false);
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
