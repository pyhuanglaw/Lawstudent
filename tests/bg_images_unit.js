// 2D 對話背景（src/outings3d.js S.BG）：寫了圖的檔案都在；BB-B 通過、放進 assets/bg 的四張（riverside、xiaofu、soc_hall、soc_classroom；企劃線 bg_approved/）有接上。
// 用法：node tests/bg_images_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const B=OUT.BG||{}; const withImg=Object.entries(B).filter(([k,v])=>v.image);
check('1. 寫了圖的背景，檔案都在 repo 裡',withImg.length>0&&withImg.every(([k,v])=>fs.existsSync(path.join(ROOT,v.image))),withImg.filter(([k,v])=>!fs.existsSync(path.join(ROOT,v.image))).map(([k])=>k).join(' '));
check('2. riverside、xiaofu、soc_hall、soc_classroom 都有圖（BB-B 第 19、20 組）',['riverside','xiaofu','soc_hall','soc_classroom'].every(k=>B[k]&&B[k].image==='assets/bg/'+k+'.webp'),['riverside','xiaofu','soc_hall','soc_classroom'].map(k=>k+':'+(B[k]&&B[k].image)).join(' '));
check('3. OUT.bg(id)：有圖＝{image:路徑}、沒有圖＝深色底',OUT.bg('riverside').image==='assets/bg/riverside.webp'&&OUT.bg('car')==='dark',JSON.stringify([OUT.bg('riverside'),OUT.bg('car')]));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
