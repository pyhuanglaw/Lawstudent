// 在 Node 裡載入遊戲的 three.js / three-vrm / ASSETS / CHAR（不算圖）：診斷彈簧骨（頭髮、馬尾）、配件位置等。
// 只 stub 了載入貼圖需要的 DOM（圖片一律當成 4×4 載入成功）。用法見 sim_hair.js。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'../../..');
global.window=global; global.self=global;
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(()=>{}))});
global.document={ createElementNS:(ns,n)=>n==='img'?new FakeImg():{getContext:()=>ctx2d,style:{}}, createElement:(n)=>n==='canvas'?{width:1,height:1,getContext:()=>ctx2d,style:{}}:new FakeImg(), getElementById:()=>null };
global.navigator={userAgent:'node'};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','lib/three-vrm.bundle.js','src/people3d.js','src/assets3d.js','src/character3d.js','src/props3d.js']){
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
}
const origWarn=console.warn; console.warn=(...a)=>{ if(String(a[0]).includes('Missing min/max')) return; origWarn(...a); };
// 把要用的模型讀進 ASSET_DATA（ASSETS 會優先用它，不走 fetch）
function preload(keys){ window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of keys.concat(['char.mixamo_clips'])){ const u=ASSETS.manifest[k].url; window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); } return Promise.all(keys.concat(['char.mixamo_clips']).map(k=>ASSETS.loadOne(k))); }
module.exports={ROOT,preload};
