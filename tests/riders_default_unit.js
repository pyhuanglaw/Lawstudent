// 路上的腳踏車（2026-10-14 使用者試玩 v9.6：「邊走路邊牽腳踏車的人還是很奇怪跟腳踏車重疊」）：
//   1. 走路的路人不再掛一台腳踏車在旁邊（spawnExtra 的 bike：手沒握把手，看起來重疊）；
//   2. 騎腳踏車的人（BIKE.rider：腳踩踏板、手握把手，和玩家騎車同一套）預設出現，網址加 ?noriders 才關掉（原本要加 ?riders 才出現）。
// 只看原始碼（騎姿本身在 tests/bike_unit.js 第 13 節、瀏覽器 tests/flow_bike.py）。修正前這個測試會失敗。用法：node tests/riders_default_unit.js
const fs=require('fs'), path=require('path');
const s=fs.readFileSync(path.join(__dirname,'..','src/story3d.js'),'utf8');
let fails=0; const check=(name,ok)=>{ console.log((ok?'PASS ':'FAIL ')+name); if(!ok) fails++; };
const ex=s.slice(s.indexOf('const extras=(n,pockets)=>'),s.indexOf('const riders=(n)=>'));
check('1. 走路的路人不掛腳踏車（spawnExtra 沒有 bike）',ex.length>0&&!/bike:/.test(ex));
const rd=s.slice(s.indexOf('const riders=(n)=>'),s.indexOf('const riders=(n)=>')+200);
check('2. 騎腳踏車的人預設出現（只有 ?noriders 才關）',/noriders/.test(rd)&&!/if\(!\/\[\?&\]riders/.test(rd));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
