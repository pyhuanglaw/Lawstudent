// shopmap2：店家室內的配置用遊戲真正的導航格（room() 0.4 m、牆內 0.4 m、家具 pad 0.05、人半徑 0.33）檢查——LAWWW2 11-04 給 AA／BB／CC 用（不需要瀏覽器）。
// 用法：node tools/dev_scratch/shopmap2.js <開發分支的 checkout> <區域 id> <WZ_SHOPS_LAYOUT 的 key> <配置檔.js> <配置變數名> x0 x1 z0 z1
// 結果：shopchk2＝每個座位／互動點「站得到、而且最近的互動就是它」，NG 的列出來；shopmap2＝印出格子圖（. 走得到、o 空的但站不住或走不到、# 擋住）
// 腳踏車停車架（BIKE-PARK-1104；AA_646 第 3 節「每棟有出口的建築……標一個停車處」；LAWWW2 11-04）——不需要瀏覽器。
// 建出遊戲真正的區域（校園、公館、溫州街、新生南路、118 巷）和每一棟建築，照 bike3d.js 真正的 legalSpot 算：
//   ① 從每一棟建築走出來的地方、從別的戶外區域走進來的地方，到最近的合法停車處多遠；
//   ② zones3d.js 的 BIKE_RACKS（新加的停車架）：導航擋住的範圍和畫面上架子的方向一致（萬才館那一座轉 42°）、不在台階平台上、不壓到出入口；
//   ③ 加了架子以後，每一個出入口從區域的出生點都還走得到。
// 修改前（開發分支 03713452b）：zones3d.js 沒有 BIKE_RACKS（② ③ 失敗）；從博雅出來最近的停車處 54 m、體育館 37 m、萬才館 34 m、普通 33 m、社科院圖書館 33 m、
//   從新生南路側門走進校園 76 m、新生南路完全沒有停車處（① 失敗）。
// 用法：node tests/bike_park_1104_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.argv[2];
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
function reachSet(z){ const N=E.nav; const sp=z.spawn; const seen=new Uint8Array(N.cols*N.rows); const [c0,r0]=N.toCell(sp.x,sp.z); const st=[[c0,r0]]; seen[N.idx(c0,r0)]=1;
  const ok=(c,r)=>{ const [x,zz]=N.toWorld(c,r); return E.canStand(x,zz,0.33,0); };
  while(st.length){ const [c,r]=st.pop(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const C=c+dc,Rr=r+dr; if(C<0||Rr<0||C>=N.cols||Rr>=N.rows) continue; const k=N.idx(C,Rr); if(seen[k]||!ok(C,Rr)) continue; seen[k]=1; st.push([C,Rr]); } } return seen; }
{ const [zid,key,file,gvar,x0,x1,z0,z1]=process.argv.slice(3); let s=require('fs').readFileSync(file,'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1='); eval(s); WZ_SHOPS_LAYOUT[key]=globalThis[gvar];
  const z=loadZone(zid); const N=E.nav; const seen=reachSet(z); let out=''; for(let zz=+z0;zz<=+z1;zz+=0.2){ let r=zz.toFixed(1).padStart(5)+' '; for(let x=+x0;x<=+x1;x+=0.2){ const [c,q]=N.toCell(x,zz); r+=seen[N.idx(c,q)]?'.':(N.b[N.idx(c,q)]?'#':'o'); } out+=r+'\n'; } console.log('x '+x0+'..'+x1+'\n'+out);
  for(const it of E.interactables) if(Math.hypot(it.x-3.05,it.z-3.45)<1.6) console.log(it.label,it.x,it.z,it.radius); }
