const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.');   /* 用法：node spawn_exit_scan.js <repo 根目錄> */
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); const clog=console.log; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,50)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
clog('loadErr',loadErr.length,loadErr.slice(0,6).join(' | '));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const R=0.32;
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0,radius:R}; return z; }


const ents=[]; const exitsBy={};
for(const id of Object.keys(Z3.ZONES)){ let z; try{ z=build(id); }catch(e){ continue; } exitsBy[id]=E.interactables.filter(it=>it.exit&&!it.hidden).map(it=>({x:it.x,z:it.z,r:it.radius||1,lv:it.lv|0,label:it.label}));
  for(const it of E.interactables){ if(it.exit&&it.exit.to&&it.exit.spawn) ents.push({from:id,via:it.label,to:it.exit.to,sp:it.exit.spawn}); } }
const out=[]; for(const e of ents){ const X=exitsBy[e.to]; if(!X) continue; const lv=e.sp.lv|0; for(const x of X){ if(x.lv!==lv) continue; const d=Math.hypot(x.x-e.sp.x,x.z-e.sp.z); if(d<=x.r) out.push([e.to,'從 '+e.from+'「'+e.via+'」進來',[+e.sp.x.toFixed(2),+e.sp.z.toFixed(2)],'在「'+x.label+'」範圍內',+d.toFixed(2)+'/'+x.r]); } }
clog('entries',ents.length,'inside exit radius',out.length); for(const o of out) clog('  ',JSON.stringify(o));
process.exit(0);
