// 經濟系那一年休學以後（Y0_LEFT），手機課表頁的日期行寫「休學中」，不寫經濟系的學期週次（AA-C 10-18）——不需要瀏覽器。用法：node tests/econ_daylabel_unit.js
// 修改前：休學以後還寫「3/5 週三・經濟系大一下 第 3 週」（第 2 項失敗）
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-500; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
const d1=dayOf('2024-10-01'), d2=dayOf('2025-03-05');
const a=CLS.dayLabel({stage:'econ',day:d1,flags:{}},d1); check('休學前照舊寫學期週次', /經濟系/.test(a)&&/第 \d+ 週/.test(a), a);
const b=CLS.dayLabel({stage:'econ',day:d2,flags:{Y0_LEFT:true}},d2); check('休學以後寫「休學中」、不寫週次', /休學中$/.test(b)&&!/第 \d+ 週/.test(b), b);
const c=CLS.dayLabel({stage:'law',day:dayOf('2025-10-01'),flags:{Y0_LEFT:true}}); check('進法律系以後照舊（舊旗標不影響）', /第 \d+ 週/.test(c)&&!/休學中/.test(c), c);
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
