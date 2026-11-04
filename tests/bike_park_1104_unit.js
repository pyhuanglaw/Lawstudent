// 腳踏車停車架（BIKE-PARK-1104；AA_646 第 3 節「每棟有出口的建築……標一個停車處」；LAWWW2 11-04）——不需要瀏覽器。
// 建出遊戲真正的區域（校園、公館、溫州街、新生南路、118 巷）和每一棟建築，照 bike3d.js 真正的 legalSpot 算：
//   ① 從每一棟建築走出來的地方、從別的戶外區域走進來的地方，到最近的合法停車處多遠；
//   ② zones3d.js 的 BIKE_RACKS（新加的停車架）：導航擋住的範圍和畫面上架子的方向一致（萬才館那一座轉 42°）、不在台階平台上、不壓到出入口；
//   ③ 加了架子以後，每一個出入口從區域的出生點都還走得到。
// 修改前（開發分支 03713452b）：zones3d.js 沒有 BIKE_RACKS（② ③ 失敗）；從博雅出來最近的停車處 54 m、體育館 37 m、萬才館 34 m、普通 33 m、社科院圖書館 33 m、
//   從新生南路側門走進校園 76 m、新生南路完全沒有停車處（① 失敗）。
// 用法：node tests/bike_park_1104_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
// 載入 index.html 到 teach3d.js 為止的區域檔（不要人物、劇情），再加上 118 巷、溫州街小店、腳踏車
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
for(const f of ['src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzpark3d.js','src/wzshops3d.js','src/bike3d.js','src/bikeshop3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; return z; }
const OUT=['campus','gongguan','wenzhou','xinsheng','lane118'];
check('zones3d.js 有 BIKE_RACKS（新加的停車架）',!!(Z3.BIKE_RACKS&&Z3.BIKE_RACKS.campus&&Z3.BIKE_RACKS.xinsheng));
// ---- 出來的地方：每一棟建築走出來、別的戶外區域走進來 ----
const outs=[];
for(const id of Object.keys(Z3.ZONES)){ let z; try{ z=loadZone(id); }catch(e){ continue; }
  for(const it of E.interactables){ const x=it.exit; if(!x||!OUT.includes(x.to)||!x.spawn) continue; if(!outs.some(o=>o.from===id&&o.to===x.to&&o.sx===x.spawn.x&&o.sz===x.spawn.z)) outs.push({from:id,to:x.to,sx:x.spawn.x,sz:x.spawn.z}); } }
// 上限：一般 12 m；總圖（前面是大草坪和台階平台，停車架放在椰林大道兩側）18 m；118 巷從校園後門進來的那一頭、公館從校門出來的那一頭 15 m
const LIMIT=o=>o.from==='library_hall'?18:((o.to==='lane118'&&o.from==='campus')||(o.to==='gongguan'&&o.from==='campus')?15:12);
const byZone={}; for(const o of outs) (byZone[o.to]=byZone[o.to]||[]).push(o);
for(const id of OUT){ if(!byZone[id]) continue; loadZone(id); const far=[];
  for(const o of byZone[id]){ const L=BIKE.legalSpot(E,id,o.sx,o.sz); o.d=L?+L.d.toFixed(1):null; if(o.d==null||o.d>LIMIT(o)) far.push(o); }
  const worst=byZone[id].reduce((a,o)=>o.d!=null&&o.d>a.d?o:a,{d:0});
  check('① '+id+'：'+byZone[id].length+' 個出來的地方，最近的合法停車處都在 12 m 以內（總圖 18 m、校門外和 118 巷口 15 m）；最遠 '+worst.d+' m（從 '+worst.from+'）',!far.length,J(far)); }
// ---- 新加的停車架 ----
for(const id of ['campus','gongguan','xinsheng']){ loadZone(id); const N=E.nav; const R=Z3.BIKE_RACKS[id]; const bad=[];
  for(const [x,z,ry] of R){ const c=Math.cos(ry), s=Math.sin(ry), at=(a,b)=>[x+a*c+b*s, z-a*s+b*c];   // 畫面上的架子（three.js 的 rotation.y）：本地 x 是架子的長邊；取點離邊 0.3 m（導航格 0.5 m，格子中心最多差 0.25 m）
    const inside=[[-2.0,-0.5],[2.0,-0.5],[-2.0,0.5],[2.0,0.5],[0,0]].map(([a,b])=>at(a,b)), outside=[[-2.0,1.6],[2.0,1.6],[-2.0,-1.6],[2.0,-1.6]].map(([a,b])=>at(a,b)).filter(([px,pz])=>{ const [cx,cz]=N.toCell(px,pz); return cx>=0&&cz>=0&&cx<N.cols&&cz<N.rows; });
    const blocked=([px,pz])=>{ const [cx,cz]=N.toCell(px,pz); return !!N.b[N.idx(cx,cz)]; };
    if(!inside.every(blocked)) bad.push(['架子底下沒擋住（導航和畫面方向不一致）',x,z]);
    if(!outside.some(p=>!blocked(p))) bad.push(['架子前後都被擋住（停不了車）',x,z]);
    if(inside.some(([px,pz])=>Math.abs(N.heightAt(px,pz)-N.y0)>0.05)) bad.push(['在台階或平台上',x,z]);
    for(const it of E.interactables) if(it.exit&&Math.hypot(it.x-x,it.z-z)<(it.radius||1.5)+2.3) bad.push(['壓到出入口 '+(it.label||it.exit.to),x,z]); }
  check('② '+id+'：'+R.length+' 座新停車架，導航擋住的範圍和畫面一致、前後至少一邊停得下車、不在台階平台上、不壓到出入口',!bad.length,J(bad));
  // ③ 每一個出入口（第 0 層）從出生點都還走得到
  const sp=E.zone.spawn; const seen=new Uint8Array(N.cols*N.rows); const [c0,r0]=N.toCell(sp.x,sp.z); const st=[[c0,r0]]; seen[N.idx(c0,r0)]=1;
  while(st.length){ const [c,r]=st.pop(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const C=c+dc, Rr=r+dr; if(C<0||Rr<0||C>=N.cols||Rr>=N.rows) continue; const k=N.idx(C,Rr); if(seen[k]||N.b[k]) continue; seen[k]=1; st.push([C,Rr]); } }
  const cut=[]; for(const it of E.interactables){ if(!it.exit||(it.lv|0)!==0) continue; const rr=(it.radius||1.5); let ok=false;
    for(let dx=-rr;dx<=rr&&!ok;dx+=N.cell) for(let dz=-rr;dz<=rr&&!ok;dz+=N.cell){ if(dx*dx+dz*dz>rr*rr) continue; const [cx,cz]=N.toCell(it.x+dx,it.z+dz); if(cx>=0&&cz>=0&&cx<N.cols&&cz<N.rows&&seen[N.idx(cx,cz)]) ok=true; }
    if(!ok) cut.push(it.label||it.exit.to); }
  check('③ '+id+'：加了停車架以後，每一個出入口從出生點都走得到',!cut.length,J(cut)); }
// ---- 溫州街、新生南路的單一停車位（巷子窄，不放架子）都站得住、不擋門 ----
for(const id of ['wenzhou','xinsheng']){ loadZone(id); const S=(BIKE.PARKS[id].spots||[]); const bad=S.filter(([x,z,yaw])=>!BIKE.parkOK(E,{x,z,yaw}));
  check('④ '+id+'：'+S.length+' 個單一停車位都站得住、不擋出入口',S.length>0&&!bad.length,J(bad)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
