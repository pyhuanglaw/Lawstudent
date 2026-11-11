// 在 Node 照 index.html 的順序載入全部 script，把「執行時真的會用到的資產路徑」印成 JSON（REL-PACKAGING-1111）。
// 做法和 tools/gen_zone_assets.js 一樣（假的 document／window，不開瀏覽器、不抓網路）；只讀檔，不寫任何東西。
// 用法：node tools/release/runtime_manifest.js [repo 根目錄]      → stdout 一份 JSON
//   manifest：ASSETS.manifest 每個 key 的 url、blUrl、遠距離版本（A.lodUrl）與其他寫成 assets/ 路徑的欄位（含別的模組在載入時加進 manifest 的）
//   data：各資料表（頂層 const）裡寫成完整 assets/ 路徑的字串（立繪表、CG、背景…）
//   portraits：PORTRAIT_FILES 展開的立繪路徑
// 這份只補「靜態掃描看不出來」的部分；打包規則不會因為這裡沒列就排除模型（docs/RELEASE_PACKAGING.md 第 4 節）。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||path.join(__dirname,'..','..'));
const out={ok:false,root:ROOT,manifest:[],data:[],portraits:[],zones:{},errors:[],scripts:0};
const realLog=process.stdout.write.bind(process.stdout);
try{
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains(){ return false; }},appendChild(){},addEventListener(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
  global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
  try{ global.navigator={userAgent:'node'}; }catch(e){ Object.defineProperty(global,'navigator',{value:{userAgent:'node'},configurable:true}); }
  global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
  process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
  console.warn=()=>{}; console.log=()=>{}; console.error=()=>{};
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1].split('?')[0]).filter(f=>!/^https?:/.test(f));
  const names=new Set();
  for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ out.errors.push(f+'（沒有這個檔）'); continue; } let src=fs.readFileSync(p,'utf8');
    for(const m of src.matchAll(/^const (\w+)\s*=/mg)) names.add(m[1]);
    src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1=');
    try{ vm.runInThisContext(src,{filename:f}); out.scripts++; }catch(e){ out.errors.push(f+'：'+String(e&&e.message).slice(0,120)); } }
  const get=n=>{ try{ return vm.runInThisContext('typeof '+n+'!=="undefined"?'+n+':undefined'); }catch(e){ return undefined; } };
  const isAsset=s=>typeof s==='string'&&/^assets\/[\w\-./]+\.[A-Za-z0-9]+$/.test(s);
  // 1) ASSETS.manifest（含 rooms_glb3d.js 等在載入時加進去的）
  const A=get('ASSETS');
  if(A&&A.manifest){ for(const key of Object.keys(A.manifest)){ const m=A.manifest[key]; const seen=new Set();
      const walk=(v,field,d)=>{ if(d>3||v==null) return; if(isAsset(v)){ if(!seen.has(v)){ seen.add(v); out.manifest.push({key,field,url:v}); } return; } if(Array.isArray(v)){ v.forEach(x=>walk(x,field,d+1)); return; } if(typeof v==='object'){ for(const k of Object.keys(v)) walk(v[k],field?field+'.'+k:k,d+1); } };
      walk(m,'',0);
      try{ const lu=A.lodUrl&&A.lodUrl(key); if(isAsset(lu)&&!seen.has(lu)) out.manifest.push({key,field:'lod(A.lodUrl)',url:lu}); }catch(e){} } }
  else out.errors.push('沒有 ASSETS.manifest');
  // 2) 各資料表裡的完整路徑（只走純物件與陣列，不走 three.js 物件）
  const dataSeen=new Map();
  const plain=v=>{ if(Array.isArray(v)) return true; const p=Object.getPrototypeOf(v); return p===Object.prototype||p===null; };
  for(const n of names){ if(n==='ASSETS'||n==='THREE'||/^THREE/.test(n)) continue; const root=get(n); if(root==null||typeof root!=='object'&&typeof root!=='function') continue;
    const visited=new Set(); let budget=200000;
    const walk=(v,d)=>{ if(budget--<=0||d>8||v==null) return; if(isAsset(v)){ if(!dataSeen.has(v)) dataSeen.set(v,n); return; } if(typeof v!=='object'||visited.has(v)) return; if(d>0&&!plain(v)) return; visited.add(v);
      if(Array.isArray(v)){ for(const x of v) walk(x,d+1); return; } let keys; try{ keys=Object.keys(v); }catch(e){ return; } for(const k of keys){ let x; try{ x=v[k]; }catch(e){ continue; } walk(x,d+1); } };
    walk(root,0); }
  out.data=[...dataSeen].map(([url,from])=>({url,from}));
  // 3) 立繪表
  const PF=get('PORTRAIT_FILES'); if(PF){ for(const id of Object.keys(PF)) for(const of of Object.keys(PF[id]||{})) for(const ex of PF[id][of]||[]) out.portraits.push('assets/portraits/'+id+'/'+of+'/'+ex+'.webp'); }
  // 4) 每一區預先下載的清單（src/data/zone_assets.js）對到 manifest
  const ZA=get('ZONE_ASSETS'); if(ZA&&A){ for(const z of Object.keys(ZA)) out.zones[z]=(ZA[z]||[]).map(k=>({key:k,url:(A.manifest[k]||{}).url||null})); }
  out.ok=out.errors.length===0;
}catch(e){ out.errors.push('例外：'+String(e&&e.stack||e).slice(0,400)); }
realLog(JSON.stringify(out),()=>process.exit(0));   /* 寫完才結束：直接 exit 的話接管線時只會出來前 64 KB */
