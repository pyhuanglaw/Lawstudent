// 公館捷運站口的花攤「晨露花舖」（GG-FLOWER-STALL-1110；LAWWW 11-10 派：GIFT-HOLIDAY-1110 AA_732 有 gg_flower「公館站口花攤」，遊戲裡沒有這個攤位）——不需要瀏覽器（D131）。
// 在 Node 建出遊戲真正的公館區域（導航、互動點、E.simWalk），模型直接讀 GLB：
//   1 有花攤的正式模型（ASSETS bldg.gg_flower_stall、檔案在、zone_assets 公館有它）
//   2 模型（GLB 的所有頂點）在 gg_flower_stall.json 的範圍 rect 裡，rect 的每一格導航都擋住（人不會走進花台）
//   3 互動點 kind gg_flower 在攤子正面、站得住，從捷運入口、騎樓、往溫州街的巷口都走得到（E.simWalk）
//   4 沒有擋到原本的東西：捷運入口的互動點照舊走得到；路人那一條 (−60,10)→(−48,14.5) 每一點站得住；攤子和捷運出口之間留 1.5 m 以上走得過去
//   5 晚上亮的材質 ggf_lit_bulb 在模型裡
// 修改前（開發分支 28df8a85c）：1、2、3、5 FAIL。用法：node tests/gg_flower_stall_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
const KEY='bldg.gg_flower_stall', man=ASSETS.manifest[KEY], url=man&&man.url, glbF=url&&path.join(ROOT,url), jsF=glbF&&glbF.replace(/\.glb$/,'.json');
const ZA=fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8'), zaGG=(ZA.match(/"gongguan":\[[^\]]*\]/)||[''])[0];
check('1 有花攤的正式模型（manifest、檔案、zone_assets 公館）', !!man&&fs.existsSync(glbF)&&fs.existsSync(jsF)&&zaGG.includes(KEY), url||'manifest 沒有 '+KEY);
const J=(jsF&&fs.existsSync(jsF))?JSON.parse(fs.readFileSync(jsF,'utf8')):null;
/* GLB 的頂點範圍、材質名 */
let bb=null, mats=[];
if(glbF&&fs.existsSync(glbF)){ const b=fs.readFileSync(glbF), jl=b.readUInt32LE(12), G=JSON.parse(b.slice(20,20+jl).toString('utf8')); mats=(G.materials||[]).map(m=>m.name);
  for(const nd of G.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0]; for(const pr of G.meshes[nd.mesh].primitives){ const a=G.accessors[pr.attributes.POSITION]; const mn=a.min.map((v,i)=>v+t[i]), mx=a.max.map((v,i)=>v+t[i]);
      if(!bb) bb={min:mn.slice(),max:mx.slice()}; else for(let i=0;i<3;i++){ bb.min[i]=Math.min(bb.min[i],mn[i]); bb.max[i]=Math.max(bb.max[i],mx[i]); } } } }
/* 遊戲真正的公館區域 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>new Promise(()=>{});
global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'gongguan',day:1};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.nav=z.nav; E.levels=z.levels||null; z.group.updateMatrixWorld(true);
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const nav=z.nav, blocked=(x,zz)=>{ const [cx,cz]=nav.toCell(x,zz); return !!nav.b[nav.idx(cx,cz)]; };
{ const R=J&&J.stall&&J.stall.rect; let inR=false, open=[];
  if(R&&bb){ inR=bb.min[0]>=R[0]-0.12&&bb.max[0]<=R[2]+0.12&&bb.min[2]>=R[1]-0.12&&bb.max[2]<=R[3]+0.12;   /* 雨棚比攤子寬一點（0.1 m），在範圍＋0.12 裡 */
    for(let x=R[0]+0.1;x<R[2];x+=0.25) for(let zz=R[1]+0.1;zz<R[3]-0.3;zz+=0.25) if(!blocked(x,zz)) open.push([+x.toFixed(2),+zz.toFixed(2)]); }   /* 前面 0.3 m 是地上的橡膠墊，可以站 */
  check('2 模型在 json 的範圍裡、範圍裡的導航都擋住', !!R&&!!bb&&inR&&!open.length, bb?`模型 x ${bb.min[0].toFixed(2)}～${bb.max[0].toFixed(2)}、z ${bb.min[2].toFixed(2)}～${bb.max[2].toFixed(2)}、高 ${bb.max[1].toFixed(2)}；範圍 ${JSON.stringify(R)}`+(open.length?`；沒擋住 ${open.length} 格，例 ${JSON.stringify(open.slice(0,3))}`:''):'沒有模型'); }
const it=E.interactables.find(q=>q.kind==='gg_flower');
{ const res=[]; let ok=!!it&&!!J&&Math.hypot(it.x-J.interact.x,it.z-J.interact.z)<0.01&&nav.clear(it.x,it.z,0.33);
  if(it) for(const [nm,x,zz] of [['捷運入口',-35.6,12.6],['騎樓',-47,20.5],['往溫州街的巷口',-70,16]]){ const r=E.simWalk(x,zz,it.x,it.z); res.push(nm+(r.ok?' OK':' '+r.reason)); if(!r.ok) ok=false; }
  check('3 互動點 gg_flower 在攤子正面、站得住、走得到', ok, it?`(${it.x}, ${it.z}) 「${it.label}」；`+res.join('、'):'沒有 kind gg_flower 的互動點'); }
{ const mrt=E.interactables.find(q=>q.mrt), r=mrt?E.simWalk(-47,20.5,mrt.x,mrt.z):{ok:false,reason:'no-mrt'}; const bad=[];
  for(let t=0;t<=1.0001;t+=0.05){ const x=-60+12*t, zz=10+4.5*t; if(!nav.clear(x,zz,0.33)) bad.push([+x.toFixed(1),+zz.toFixed(1)]); }
  let gap=0; for(let x=-45.5;x<=-43;x+=0.25){ if(!blocked(x,11.6)) gap+=0.25; }
  check('4 沒擋到原本的東西：捷運入口走得到、路人那條線站得住、攤子和捷運出口中間走得過去', r.ok&&!bad.length&&gap>=1.5, `捷運入口 ${r.ok?'OK':r.reason}；路人線站不住 ${bad.length} 點${bad.length?JSON.stringify(bad.slice(0,3)):''}；z 11.6 攤子東邊到捷運出口的空隙 ${gap} m`); }
check('5 晚上亮的燈泡材質 ggf_lit_bulb 在模型裡', mats.includes('ggf_lit_bulb'), mats.filter(m=>/lit/.test(m)).join('、'));
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
