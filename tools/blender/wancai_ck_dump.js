// 匯出遊戲裡萬才館大樓梯的外緣（CK.lawhall 的 ck.wancai）給 Blender 比對：tools/blender/wancai_exterior.py --check <輸出的 JSON>
// 導航的台階高度（zones3d.js 的 wancaiStairs）就是用這一組外緣；Blender 模型的台階必須和它一樣，人物的腳才會踩在畫出來的踏面上。
// 用法：node tools/blender/wancai_ck_dump.js <輸出.json>
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null };
global.navigator={userAgent:'node'};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/townkit3d.js','src/campuskit3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8'),{filename:f});
const g=CK.lawhall({entry:'stairs',w:30,d:20,floors:9,entryX:-1,brick:'#b06a4a',winBox:true,roofFrame:true}), W=g.userData.ck.wancai;   // 參數和 zones3d.js 的校園一樣
const out={outl:W.outl,PF:W.PF,z0:W.z0,L:W.L,SX:W.SX,LX0:W.LX0,LX1:W.LX1,BX1:W.BX1,NS:W.NS,RS:W.RS,TR:W.TR};
fs.writeFileSync(process.argv[2]||'wancai_ck.json',JSON.stringify(out)); console.log('wrote',process.argv[2],W.outl.length,'steps');
