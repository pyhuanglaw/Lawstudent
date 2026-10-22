// 經濟系重考期 7/10 看考場（RH-O6）有背景：考場高中的教室（BB 帳號 A 10-21 22:4x 決定，D110；原本深色底）——不需要瀏覽器。
// 檢查：1. src/data/retake_home.js 的 RH-O6 bg＝exam_hs_classroom（tools/story/import_retake_home.py 匯入時套用）；2. 那張圖在 OUT.BG、檔案存在；
//       3. 演出時第一段是地點字幕＋那張背景（econff3d.js rhDialogue）；4. 其他段的背景不變（只有 RH-M0、RH-C0～C5、RH-O6 有 bg）。
// 修改前：第 1、3、4 項 FAIL。用法：node tests/retake_bg_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/retake_home.js','src/outings3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const all=[...RETAKE_HOME.short,...RETAKE_HOME.long], e=all.find(x=>x.id==='RH-O6');
check('1. RH-O6（7/10 看考場）bg＝exam_hs_classroom',!!e&&e.bg==='exam_hs_classroom',JSON.stringify(e&&e.bg));
const B=OUT.BG&&OUT.BG.exam_hs_classroom;
check('2. exam_hs_classroom 在 OUT.BG、圖檔存在',!!B&&!!B.image&&fs.existsSync(path.join(ROOT,B.image)),JSON.stringify(B));
const src=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8'), m=src.match(/const rhDialogue=e=>\{ const out=\[\]; if\(e\.place\) out\.push\(\{scene:e\.place,bg:e\.bg\|\|false\}\);/);
check('3. 演出第一段：地點字幕＋那一段的 bg（econff3d.js rhDialogue）',!!m&&!!e&&e.place==='考場的高中');
const withBg=all.filter(x=>x.bg).map(x=>x.id+':'+x.bg).sort();
check('4. 有背景的只有 RH-M0、RH-C0～C5、RH-O6',JSON.stringify(withBg)===JSON.stringify(['RH-C0:cram_class','RH-C1:cram_class','RH-C2:cram_class','RH-C3:cram_class','RH-C4:cram_class','RH-C5:cram_class','RH-M0:home_living','RH-O6:exam_hs_classroom']),JSON.stringify(withBg));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
