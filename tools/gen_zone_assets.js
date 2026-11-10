// 產生 src/data/zone_assets.js：每個區域建立時要用的正式模型（PERF-COLD-1107 (B)，LAWWW2-B 2026-11-07）。
// 在 Node 照 index.html 的順序載入全部 script，建每一個區域（Z3.ZONES[id].build），用 ASSETS.reqStart／reqTake 記下建的時候 loadOne 了哪些 key
// （和遊戲 enter() 等模型的是同一份清單，但只有區域本身的，不含 STORY.populate 放的人物 VRM）。每一區照檔案大小由大到小排（大的先下載）。
// 用法：node tools/gen_zone_assets.js           寫入 src/data/zone_assets.js
//       node tools/gen_zone_assets.js --check   只比對，過期就 exit 1（tests/zone_prefetch_unit.js 用）
// 改了區域用哪些正式模型（zones3d.js 等的 A.loadOne／A.get('bldg.…')、新區域、新 GLB）以後重跑。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), OUT=path.join(ROOT,'src/data/zone_assets.js'), CHECK=process.argv.includes('--check');
function collect(){
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains(){ return false; }},appendChild(){},addEventListener(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
  global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
  process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
  console.warn=()=>{}; console.log=()=>{}; console.error=()=>{};   /* 區域載入失敗的提示（Node 沒有 fetch）不印；自己的結果用 process.stdout／stderr */
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1].split('?')[0]).filter(f=>!/^https?:/.test(f)&&f!=='src/data/zone_assets.js');
  const bad=[];
  for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ bad.push(f+'（沒有這個檔）'); continue; } let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1=');
    try{ vm.runInThisContext(src,{filename:f}); }catch(e){ bad.push(f+'：'+e.message.slice(0,80)); } }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const out={}, errs=[];
  for(const id of Object.keys(Z3.ZONES)){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; ASSETS.reqStart();
    try{ const z=Z3.ZONES[id].build(E); E.zone=z; }catch(e){ errs.push(id+'：'+e.message.slice(0,100)); } out[id]=ASSETS.reqTake().filter(k=>ASSETS.manifest[k]); }
  const size=k=>{ try{ return fs.statSync(path.join(ROOT,ASSETS.manifest[k].url)).size; }catch(e){ return 0; } };
  for(const id in out) out[id].sort((a,b)=>size(b)-size(a)||(a<b?-1:1));
  return {out,bad,errs};
}
const {out,bad,errs}=collect();
const body='/* 每個區域建立時要用的正式模型（PERF-COLD-1107 (B)，LAWWW2-B 2026-11-07）：玩家走到出口附近，先把出口那一區的模型下載進瀏覽器快取\n'+
  '   （assets3d.js 的 A.prefetchNear；只下載、不解析）。自動產生，不要手改：node tools/gen_zone_assets.js——改了區域用哪些正式模型以後重跑；\n'+
  '   tests/zone_prefetch_unit.js 會檢查有沒有過期。每一區照檔案大小由大到小（大的先下載）。 */\n'+
  'const ZONE_ASSETS={\n'+Object.keys(out).sort().map(id=>'  '+JSON.stringify(id)+':'+JSON.stringify(out[id])).join(',\n')+'\n};\n';
const say=(t,code)=>{ (code?process.stderr:process.stdout).write(t+'\n'); process.exit(code); };
if(bad.length||errs.length) say('載入或建區域失敗：\n'+bad.concat(errs).join('\n'),2);
if(CHECK){ const cur=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8'):''; if(cur===body) say('zone_assets.js 是最新的（'+Object.keys(out).length+' 個區域）',0);
  say('zone_assets.js 過期了：node tools/gen_zone_assets.js 重新產生',1); }
fs.writeFileSync(OUT,body); say('寫入 '+path.relative(ROOT,OUT)+'：'+Object.keys(out).length+' 個區域、'+new Set(Object.values(out).flat()).size+' 個正式模型',0);
