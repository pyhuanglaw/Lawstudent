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
// CG（adv3d.js 的 CG_REGISTRY）：每一張的檔案都在；BCG-04、BCG-11 接在 BB_117 寫的那一拍
{ const src=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=src.match(/const CG_REGISTRY=\{[\s\S]*?\};/); const reg=m?vm.runInThisContext('('+m[0].slice('const CG_REGISTRY='.length,-1)+')'):{};
  check('4. CG_REGISTRY 每一張的檔案都在',Object.keys(reg).length>0&&Object.values(reg).every(r=>fs.existsSync(path.join(ROOT,r.file))),Object.entries(reg).filter(([k,r])=>!fs.existsSync(path.join(ROOT,r.file))).map(([k])=>k).join(' '));
  const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
  const z3=ev.indexOf("text:'熱可可。加一份濃縮。'"), c4=ev.indexOf("{cg:'cg_own_drink_heroine02'}"), q5=ev.indexOf("text:'（對著麥克風）這個 bug 我下次修。'"), c11=ev.indexOf("{cg:'cg_bug_fix_heroine04'}");
  check('5. BCG-04 在「熱可可。加一份濃縮。」之後、BCG-11 在「這個 bug 我下次修」之前（BB_117）',!!reg.cg_own_drink_heroine02&&!!reg.cg_bug_fix_heroine04&&z3>0&&c4>z3&&c4-z3<160&&c11>0&&q5>c11&&q5-c11<200); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
