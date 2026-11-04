// 在 Node 建公館區域（GLB 全部載入失敗＝?nobldg 的樣子），數看得到的網格（一個網格／材質＝一次 draw call，不算視錐裁切），照最上層群組列出
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]); const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'?nobldg'};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{}; const log=console.log; console.log=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const extra=['src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/lane118_props.js','src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js','src/gg2shops3d.js'];
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),...extra])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ log('ERR',f,e.message); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>Promise.reject(new Error('no GLB'));
global.GAME={G:{zone:'gongguan',day:30,hour:15,flags:{},money:5000,weather:'clear'}};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
const z=Z3.ZONES.gongguan.build(E); const root=z.group; const skip=new Set(E.lampGlows||[]);
const shown=m=>{ for(let p=m;p&&p!==root;p=p.parent) if(!p.visible) return false; return true; };
const per={}; let tot=0;
for(const c of root.children){ let n=0; c.traverse(m=>{ if((m.isMesh||m.isSprite||m.isLine||m.isPoints)&&!skip.has(m)&&shown(m)) n+=Array.isArray(m.material)?m.material.length:1; }); const k=(c.name||c.type)+(c.userData&&c.userData.dyn?'*':''); per[k]=(per[k]||0)+n; tot+=n; }
log(JSON.stringify({tot,per}));
