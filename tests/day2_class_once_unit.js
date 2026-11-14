// BUG-CARD-BOHAN-WALK-1103 根因（CC 讀程式，BB 11-04 00:47）：第一堂民總的劇情課 classScene（網拍相機）進 201 的條件只看「週四、!classDone、12:30～15:12」，
// 沒檢查主線第 2 天＝9/4 沒上到的局之後每個週四進 201 都重演一次，還和一般課的選座位（goClass → seatPick）搶玩家，劇情的 walkTo 4 秒後把人放到第 1 排（f606 9/11 那一次）。
// 檢查（讀程式）：1. onEnter 的 classScene、霖澤館的提示、201 的周老師、校園的阿哲都要 mainDay===2 2. tick：過了第 2 天還沒上＝記 classDone、classAnswer 'absent'
// 修改前第 1、2 項 FAIL。用法：node tests/day2_class_once_unit.js
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'..','src/story3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
check('1. 進 201 演 classScene：要 mainDay===2',/zoneId==='classroom'&&isThu\(G\)&&S\.mainDay\(G\)===2&&!F\.classDone&&h\(G\)>=12\.5&&h\(G\)<15\.2\)\{ await classScene\(GM\)/.test(src));
// CANON-NO-ECON-1112：經濟系那一年拿掉（程式裡 !S.isEcon(G)&& 拿掉了，比對的字跟著拿掉）
check('1. 201 的周老師（inClass）、霖澤館的提示、校園的阿哲：mainDay===2',/inClass=\(\(isThu\(G\)&&S\.mainDay\(G\)===2&&!F\.classDone/.test(src)&&/zoneId==='linze'&&isThu\(G\)&&S\.mainDay\(G\)===2&&!F\.classDone/.test(src)&&/isThu\(G\)&&S\.mainDay\(G\)===2&&!F\.classDone&&hr>=12\.5&&hr<13\.4\)\{ GM\.spawnNPC\('zhe'/.test(src));
check('1. 沒有別的「週四、!classDone」不看 mainDay 就演 classScene',(src.match(/await classScene\(GM\)/g)||[]).length===1);
const t=src.slice(src.indexOf('S.tick=function(GM,dt)'));
check('2. tick：法律系過了第 2 天還沒上＝classDone、classAnswer absent（不覆蓋已經有的答案）',/if\(!F\.classDone&&S\.mainDay\(G\)>2\)\{ F\.classDone=true; if\(F\.classAnswer==null\) F\.classAnswer='absent'; \}/.test(t.slice(0,60000)));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
