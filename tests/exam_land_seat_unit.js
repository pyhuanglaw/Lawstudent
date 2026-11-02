// 手機橫向的考試版面（CC K2、BB 10:15）——不需要瀏覽器（看 CSS 與 renderChoose 的字串；真正的版面請 CC 用瀏覽器＋iPhone 實機確認）
//   1. BUG-EXAM-LAND-SEAT-1102：非 ADV（座位上考試）、橫向、選項放不下：題目不收，加 .side 移到選單左邊那一欄（寬＝100% − 選單寬 − 42 − 左右 safe-area）；ADV 照舊收（有「紀錄」）；選完把 side 拿掉
//   2. BUG-ADV-CHOICES-SAFEAREA-1102：.adv-on #choices 的寬度扣掉左右兩邊的 safe-area（原本 100%−28 再加 safe-left，瀏海機超出約 19 px）
// 修改前（e27dd033e）：1、2 FAIL。用法：node tests/exam_land_seat_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
const G=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ADV=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
check('1. CSS：#dlg.static.side 靠左、寬度扣掉選單和左右 safe-area',/#dlg\.static\.side\{left:max\(14px,env\(safe-area-inset-left\)\);transform:none;width:calc\(100% - min\(400px,calc\(100% - 28px\)\) - 42px - env\(safe-area-inset-left\) - env\(safe-area-inset-right\)\)\}/.test(HTML));
check('1. renderChoose：放不下時非 ADV、寬 600 以上、左欄 ≥260 px＝加 side（不收）；其他照舊收',/if\(!document\.body\.classList\.contains\('adv-on'\)&&W>H_SIDE_MIN&&W-bw-42>=260\)\{ dlg\.classList\.add\('side'\); \}/.test(G)&&/else \{ dlg\.classList\.add\('hide'\); dlg\.classList\.remove\('static'\); \}/.test(G));
check('1. 選完、下一次出選項：side 拿掉',/dlg\.classList\.remove\('static','side'\)/.test(G)&&/function renderChoose\(c\)\{ const \{options,opt,res\}=c; \$\('dlg'\)\.classList\.remove\('side'\);/.test(G));
check('2. .adv-on #choices 寬度扣掉左右 safe-area（直向單欄、橫向兩欄都是）',/\.adv-on #choices\{right:auto;left:max\(14px,env\(safe-area-inset-left\)\);width:min\(400px,calc\(100% - max\(14px,env\(safe-area-inset-left\)\) - max\(14px,env\(safe-area-inset-right\)\)\)\);/.test(ADV)&&/grid-template-columns:1fr 1fr;align-content:start;width:calc\(100% - max\(14px,env\(safe-area-inset-left\)\) - max\(14px,env\(safe-area-inset-right\)\)\);max-width:860px\}/.test(ADV)&&!/width:calc\(100% - 28px\);max-width:860px/.test(ADV));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
