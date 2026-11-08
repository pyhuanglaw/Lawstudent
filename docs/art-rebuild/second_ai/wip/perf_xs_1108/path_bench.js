// 各店找路一次要多久（Node；建出遊戲真正的區域，用 E.pathTo 隨機起訖點）。用法：node path_bench.js <repo 根目錄>
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):()=>{}))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.GAME={G:null}; global.STORY={interact:async()=>false};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/shanlan_layout.js','src/shanlan3d.js','src/data/dakou_layout.js','src/dakou3d.js',
  'src/data/dabu_layout.js','src/data/haopai_layout.js','src/xsshop3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
for(const id of ['xs_haopai','xs_shanlan','xs_dakou']){
  const z=loadZone(id), Ls=z.levels||[z.nav], G=Ls[0];
  const free=Ls.map(n=>{ const a=[]; for(let r=0;r<n.rows;r++) for(let c=0;c<n.cols;c++) if(!n.blocked(c,r)&&!n.near(c,r)) a.push([c,r]); return a; });
  const pt=(lv)=>{ const a=free[lv]; const [c,r]=a[Math.floor(rnd()*a.length)]; const n=Ls[lv]; const w=n.toWorld?n.toWorld(c,r):[n.x0+(c+0.5)*n.cell, n.z0+(r+0.5)*n.cell]; return w; };
  const res={same:[],cross:[]};
  for(let i=0;i<60;i++){ for(const kind of ['same','cross']){ if(kind==='cross'&&Ls.length<2) continue; const l0=Ls.length>1?(i%2):0, l1=kind==='cross'?1-l0:l0; const a=pt(l0), b=pt(l1);
      const t=process.hrtime.bigint(); const p=E.pathTo(a[0],a[1],l0,b[0],b[1],l1); const ms=Number(process.hrtime.bigint()-t)/1e6; res[kind].push({ms,ok:!!(p&&p.length)}); } }
  const st=a=>{ if(!a.length) return '—'; const v=a.map(x=>x.ms).sort((x,y)=>x-y); return `平均 ${(v.reduce((s,x)=>s+x,0)/v.length).toFixed(1)} ms、中位 ${v[v.length>>1].toFixed(1)}、最慢 ${v[v.length-1].toFixed(1)}、找不到 ${a.filter(x=>!x.ok).length}/${a.length}`; };
  console.log(`${id}：${Ls.length} 層、每層 ${G.cols}×${G.rows}＝${G.cols*G.rows} 格（${G.cell} m）、可走 ${free.map(a=>a.length).join('／')}`);
  console.log('   同一層：'+st(res.same)); console.log('   跨層：  '+st(res.cross));
}
