// SHOP-FIRST-APPROACH r8（LAWWW2-C 2026-11-13；CC r7 0b32cab5cc：整間一次先畫＝pre 自己就是長幀，公館 G03 153 ms、新生南路 shanlan 115 ms）：
// 先畫要分幀（一幀只畫 PRE_V 個頂點以內的零件）、光照貼圖排在貼圖上傳那一段先傳。這支只查程式結構（瀏覽器的時間由 CC 在電腦上量 FIRST_*）。
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'..','src','zones3d.js'),'utf8');
let fails=0; const check=(n,ok)=>{ console.log((ok?'PASS ':'FAIL ')+n); if(!ok) fails++; };
check('1. PRE_V（一幀先畫的頂點上限）有定義、在 4000～40000 之間', (m=>!!m&&+m[1]>=4000&&+m[1]<=40000)(src.match(/PRE_V=(\d+)/)));
check('2. preParts 照頂點數把零件分組', /const preParts=s=>\{[^]*?position[^]*?PRE_V[^]*?return out; \};/.test(src));
check('3. 佇列放的是一組一組（{s,pre:p}），不是整間一次（{s,pre:true}）', /for\(const p of preParts\(s\)\) warmQ\.push\(\{s,pre:p\}\)/.test(src)&&!/warmQ\.push\(\{s,pre:true\}\)/.test(src));
check('4. preDraw 只畫這一組：其他零件暫時藏起來、畫完照原樣還原', /const preDraw=\(s,part\)=>[^]*?o\.visible=part\.has\(o\)[^]*?o\.visible=keep\[i\]/.test(src));
check('5. warmStep 把那一組傳給 preDraw', /if\(j\.pre\)\{ preDraw\(j\.s,j\.pre===true\?null:j\.pre\); return; \}/.test(src));
check('6. 光照貼圖（白天、晚上）排進貼圖上傳', /if\(s\.lm\) for\(const t of \[s\.lm\.day,s\.lm\.night\]\)[^\n]*warmQ\.push\(\{s,t\}\)/.test(src));
check('7. ?noshoppre 照舊可以關掉（CC 對照）', /noshoppre/.test(src)&&/if\(PRE\) for\(const p of preParts/.test(src));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
