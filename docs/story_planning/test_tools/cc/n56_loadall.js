// N5／N6 共用載入器（CC）：module.exports(ROOT)＝照 index.html 順序載入 src/（game3d.js 除外；3D 繪圖模組載不進 Node 會記在 failed）
// 載入 index.html 裡 src/ 的所有 script（game3d.js 除外），不需要瀏覽器。ROOT 由環境變數 LW_ROOT 或第一個參數給
const fs=require('fs'), vm=require('vm'), path=require('path');
module.exports=function(ROOT,opts){ opts=opts||{};
  global.window=global; global.self=global; global.P3={CAST:{}};
  const stubEl=()=>new Proxy(function(){},{get:(t,k)=>k==='style'||k==='dataset'?{}:(k==='classList'?{add(){},remove(){},contains:()=>false,toggle(){}}:(k===Symbol.toPrimitive?()=>'':stubEl())),apply:()=>stubEl(),set:()=>true});
  global.document={ getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, createElement:()=>stubEl(), body:stubEl(), head:stubEl(), documentElement:stubEl() };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'',href:''}; global.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
  global.requestAnimationFrame=()=>0; global.performance=global.performance||{now:()=>Date.now()};
  global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
  global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},narrate(){}}; global.CHAR={setExpr(){}};
  global.CG_REGISTRY=global.CG_REGISTRY||{};
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const files=[...idx.matchAll(/src="(src\/[^"?]+)/g)].map(m=>m[1]).filter(f=>!/game3d\.js$/.test(f)&&!(opts.skip||[]).some(r=>r.test(f)));
  const loaded=[], failed=[];
  for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ failed.push([f,'不存在']); continue; }
    let src=fs.readFileSync(p,'utf8'); src=src.replace(/^(const|let) (\w+)\s*=/mg,(m,k,n)=>'globalThis.'+n+'=');
    try{ vm.runInThisContext(src,{filename:f}); loaded.push(f); }catch(e){ failed.push([f,String(e&&e.message||e).slice(0,120)]); } }
  return {files,loaded,failed}; };
