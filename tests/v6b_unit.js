// 多段感情交接包 v6（BB 人物）還沒進遊戲的四件（V6-B2、V6-B5，任務 feat-v6b-1101；src/v6b_3d.js）——不需要瀏覽器。
//   （施工中的骨架：之後補完各節）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
const okNew=L3('src/v6b_3d.js');
check('0. 新檔 src/v6b_3d.js 載得到',okNew&&typeof V6B!=='undefined');
H.done();
