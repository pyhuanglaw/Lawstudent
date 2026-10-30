// 男一舍門廳的光照貼圖與擺設（DORM-HALL-LM-1028，LAWWW2-C 2026-10-28；不需要瀏覽器）：
//   1. 正式模型（assets/models/env/dorm_hall.glb）：場景 extras.lightmap 指到的兩張貼圖在 repo 裡、L0_root／L1_root 在、地板和牆有第二套 UV（TEXCOORD_1）、日光燈沒有；
//      只在烘焙時擋光的板子（BAKEONLY_）沒有留在模型裡。
//   2. 宿舍真正的建區域流程（src/dorm3d.js → B3.attachFormal），ASSETS.loadOne 換成讀這個 GLB 的 JSON 做的假場景：
//      有第二套 UV 的材質接上 lightMap、zone.update 照時段換白天／晚上那張。
//   3. 地上的新擺設（dorm_layout.js 的 prop：包裹架、傘架、滅火器、洗衣籃）擋住導航；出生點、交誼廳的劇情站位、走樓梯路人的路線、每一扇門口照舊站得住，
//      而且從大門（一樓）、從自己的房門（二樓）走得到每一扇門口。
//   4. 202 門上的社團貼紙（模型裡單獨一塊 L1_deco_r202_…）：大一看得到；大四住 409、用的是 202 那扇門（DM3.HOMES.y4.rep），那一年藏起來。
// 用法：node tests/dorm_hall_lightmap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
Z3.ZONES.dorm_hall=DM3.dorm_hall;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};

// ---- 1. 正式模型的內容（只讀 GLB 的 JSON）----
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/dorm_hall.glb')); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const lm=J.scenes[J.scene|0].extras&&J.scenes[J.scene|0].extras.lightmap;
check('GLB 場景有 extras.lightmap', !!(lm&&lm.day&&lm.night&&lm.intensity>0), JSON.stringify(lm));
if(lm) for(const k of ['day','night']) check('光照貼圖檔案在 repo 裡：'+lm[k], fs.existsSync(path.join(ROOT,lm[k])));
const names=J.nodes.map(n=>n.name||''); check('L0_root、L1_root 在', names.includes('L0_root')&&names.includes('L1_root'));
check('只在烘焙時擋光的板子（BAKEONLY_）沒有留在模型裡', !names.some(n=>/BAKEONLY/.test(n)), names.filter(n=>/BAKEONLY/.test(n)).join('、'));
const uv1=n=>J.meshes[n.mesh].primitives.every(p=>'TEXCOORD_1' in p.attributes);
const meshNode=rx=>J.nodes.find(n=>'mesh' in n&&rx.test(n.name||''));
for(const [label,rx] of [['一樓地板',/^L0_.*(floor|terrazzo)/],['二樓地板',/^L1_.*(floor|terrazzo)/],['一樓天花板',/^L0_ceiling/],['樓梯',/^L0_dm_stair/],['走廊北牆',/^L0_dm_plaster_hN/]]){ const n=meshNode(rx); check('有第二套 UV：'+label+'（'+(n&&n.name)+'）', !!(n&&uv1(n))); }
for(const n of J.nodes.filter(n=>'mesh' in n&&/dm_tube/.test(n.name||''))) check('沒有第二套 UV（照舊即時光）：'+n.name, !uv1(n));
const withUv1=J.nodes.filter(n=>'mesh' in n&&uv1(n)).length; check('有第二套 UV 的網格不少於 30 個', withUv1>=30, withUv1+' 個');

// ---- 2. 宿舍真正的建區域流程（假場景：照 GLB 的節點名、材質名、有沒有第二套 UV 做，幾何是小平面）----
function fakeFromGLB(){
  const root=new THREE.Group(); root.name=J.scenes[J.scene|0].name||'scene'; if(lm) root.userData.lightmap=Object.assign({},lm);
  const build=(i,parent)=>{ const n=J.nodes[i]; let o;
    if('mesh' in n){ const prim=J.meshes[n.mesh].primitives[0]; const g=new THREE.PlaneGeometry(1,1); if('TEXCOORD_1' in prim.attributes) g.setAttribute('uv1',g.attributes.uv.clone());
      o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({name:J.materials[prim.material].name})); }
    else o=new THREE.Group();
    o.name=n.name||''; Object.assign(o.userData,n.extras||{}); parent.add(o); for(const c of n.children||[]) build(c,o); };
  for(const i of J.scenes[J.scene|0].nodes) build(i,root); return root; }
(async()=>{
  const orig=ASSETS.loadOne; const root=fakeFromGLB();
  ASSETS.loadOne=(k)=>k==='bldg.dorm_hall'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.dorm_hall.build(E); E.zone=z; await new Promise(r=>setTimeout(r,0)); ASSETS.loadOne=orig;
  check('正式模型接上（zone.formal）', z.formal===true);
  const nmat=z.formalInfo&&z.formalInfo.lightmapped; check('接光照貼圖的材質不少於 10 個', nmat>=10, JSON.stringify(z.formalInfo));
  let fl=null; z.group.traverse(o=>{ if(!fl&&o.isMesh&&/^L0_.*(floor|terrazzo)/.test(o.name)) fl=o; });
  check('一樓地板：lightMap、強度 2π', !!(fl&&fl.material.lightMap&&Math.abs(fl.material.lightMapIntensity-Math.PI*2)<1e-6), fl&&fl.name);
  if(fl){ const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; fl.material.onBeforeCompile(sh,null);
    const at=h=>{ z.update(1/30,{hour:h}); return +sh.uniforms.lmMix.value.toFixed(3); };
    check('12:00 白天那張、20:00 晚上那張', at(12)===0&&at(20)===1, at(12)+'/'+at(20)); }

  // ---- 3. 新擺設擋住導航；站位、門口照舊站得住、走得到 ----
  const L=DORM_LAYOUT, nav=z.levels||[z.nav], props=L.furniture.filter(f=>f.type==='prop');
  const stand=props.filter(f=>{ const c=f.nav||[f.x,f.z]; return nav[f.lv|0].free(c[0],c[1]); });
  check('地上的新擺設擋住導航（包裹架、傘架、滅火器、洗衣籃）', props.length>=7&&stand.length===0, props.length+' 筆'+(stand.length?'；站得上去的：'+stand.map(f=>f.kind+'('+f.x+','+f.z+')').join('、'):''));
  const CO=L.corridor, front=d=>d.side==='N'?[d.x,CO.z0+0.75]:d.side==='S'?[d.x,CO.z1-0.75]:[CO.x1-0.75,0];
  const spots=[['出生點',0,0,5.6],['交誼廳劇情站位 CW_LOUNGE',0,7.6,4.6],['走樓梯路人 門廳',0,0,4.6],['走樓梯路人 樓梯口',0,-0.8,0],['一樓走廊西端',0,-12.4,0],['一樓走廊東端',0,12.4,0],['自己房門前（二樓）',1,L.home.x,0.4],['二樓走廊西端',1,-9.5,0.2],['二樓走廊東端',1,9.5,-0.2]]
    .concat(L.doors.map(d=>['門口 '+d.id,d.lv|0].concat(front(d))))
    .concat(Object.entries(DM3.HOMES).map(([k,h])=>['自己的房門前 '+k+'（'+h.plate+'）',h.lv|0,h.x,0.4]));
  const bad=spots.filter(([n,lv,x,zz])=>!nav[lv].free(x,zz));
  check('出生點、劇情站位、路人路線、每一扇門口照舊站得住', bad.length===0, bad.length?bad.map(s=>s[0]).join('、'):spots.length+' 個');
  const reach=(n,x0,z0)=>{ const [c0,r0]=n.toCell(x0,z0), seen=new Uint8Array(n.cols*n.rows), q=[[c0,r0]]; seen[r0*n.cols+c0]=1;
    while(q.length){ const [c,r]=q.pop(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const cc=c+dc, rr=r+dr; if(cc<0||rr<0||cc>=n.cols||rr>=n.rows||seen[rr*n.cols+cc]||n.blocked(cc,rr)) continue; seen[rr*n.cols+cc]=1; q.push([cc,rr]); } }
    return (x,zz)=>{ const [c,r]=n.toCell(x,zz); return !!seen[r*n.cols+c]; }; };
  const R=[reach(nav[0],0,5.6), reach(nav[1],L.home.x,0.4)];
  const cut=spots.filter(([n,lv,x,zz])=>!R[lv](x,zz));
  check('從大門（一樓）、自己的房門（二樓）走得到每一扇門口和站位', cut.length===0, cut.length?cut.map(s=>s[0]).join('、'):'全部');

  // ---- 4. 202 門上的社團貼紙：大四那一年（住 409＝202 那扇門）藏起來 ----
  check('模型裡 202 門上的貼紙單獨一塊（L1_deco_r202_…）', names.some(n=>/^L1_deco_r202_/.test(n)), names.filter(n=>/deco/.test(n)).join('、'));
  const deco=zz=>{ let d=null; zz.group.traverse(o=>{ if(!d&&/^L1_deco_r202_/.test(o.name)) d=o; }); return d; };
  const d1=deco(z); check('大一（住 203）：202 門上的貼紙看得到', !!(d1&&d1.visible), d1?d1.name:'找不到');
  ASSETS.loadOne=(k)=>k==='bldg.dorm_hall'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
  global.GAME={G:{flags:{ROOM_Y4:true}}}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z4=Z3.ZONES.dorm_hall.build(E); E.zone=z4; await new Promise(r=>setTimeout(r,0)); ASSETS.loadOne=orig; delete global.GAME;
  const d4=deco(z4); check('大四（住 409，用 202 那扇門）：202 門上的貼紙藏起來', z4.formal===true&&!!d4&&d4.visible===false, (d4?d4.name+' visible='+d4.visible:'找不到')+'；HOMES.y4.rep='+DM3.HOMES.y4.rep);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
