// 校園套件的「看得到的東西都在導航阻擋裡」檢查（不需要瀏覽器）：在 Node 裡載入 three.js、townkit3d.js、campuskit3d.js，
// 建霖澤館、萬才館（CK.lawhall，參數和 zones3d.js 一樣），把建築正面以外（z > d/2 + 0.3）、高於地面的每個頂點，
// 和套件回傳的導航阻擋（userData.ck.blocks，含邊距）比對。台階、石牆、端塊如果有一部分不在阻擋裡，玩家會走進去（腳陷進台階）。
// v9.3 第二十一批：萬才館台階原本有 73 個頂點在阻擋外（石牆外側的台階），改完是 0。
// 用法：node tools/dev_scratch/kit_nav_check.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null };
global.navigator={userAgent:'node'};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/townkit3d.js','src/campuskit3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
let fail=0;
for(const [name,opts] of [['霖澤館',{w:40,d:18,floors:8}],['萬才館',{entry:'stairs',w:30,d:20,floors:9,entryX:-8.5,annex:true}]]){
  const g=CK.lawhall(opts), ck=g.userData.ck, B=ck.blocks; let tris=0, out=0, worst=0, at=null;
  g.traverse(o=>{ if(!o.isMesh) return; const p=o.geometry.attributes.position, ix=o.geometry.index; tris+=(ix?ix.count:p.count)/3;
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); if(z<=ck.d/2+0.3||y<=0.01||y>=3.5) continue;
      if(B.some(([bx,bz,bw,bd,m])=>Math.abs(x-bx)<=bw/2+m+1e-3&&Math.abs(z-bz)<=bd/2+m+1e-3)) continue;
      out++; let dm=1e9; for(const [bx,bz,bw,bd,m] of B){ const dx=Math.max(0,Math.abs(x-bx)-bw/2-m), dz=Math.max(0,Math.abs(z-bz)-bd/2-m); dm=Math.min(dm,Math.hypot(dx,dz)); } if(dm>worst){ worst=dm; at=[x,y,z].map(v=>+v.toFixed(2)); } } });
  console.log(`${name}：三角形 ${tris}，入口互動點 (${ck.doorX}, ${ck.doorZ.toFixed(2)})，正面外的頂點在導航阻擋外：${out} 個`+(out?`（最遠 ${worst.toFixed(2)} m，在 ${JSON.stringify(at)}）`:''));
  if(out) fail++;
}
console.log(fail?'FAIL':'ALL PASS'); process.exit(fail?1:0);
