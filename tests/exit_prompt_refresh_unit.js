// BUG-EXIT-PROMPT-STALE-1112（BB_379 SSB_gg_fnexit）：對話結束、換完區域都要立刻重算互動鍵——不等玩家動一下。
//   ① GM.refreshInteract 存在：忘掉上一個互動點和字（nearIt／nearLb）再 updateInteract；
//   ② sceneEnd（busyDepth 回到 0）叫它；③ enter 的 finally（entering=false 以後）叫它。
// 只看原始碼（瀏覽器行為由 CC 的 SSB_gg_fnexit 重跑）。用法：node tests/exit_prompt_refresh_unit.js
const fs=require('fs'), path=require('path'); const s=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok)=>{ console.log((ok?'PASS ':'FAIL ')+n); if(!ok) fails++; };
check('① GM.refreshInteract：nearIt=null、nearLb=null 再 updateInteract', /GM\.refreshInteract=function\(\)\{ nearIt=null; nearLb=null; try\{ updateInteract\(\); \}/.test(s));
const se=s.slice(s.indexOf('function sceneEnd(){'), s.indexOf('GM.sceneBegin=sceneBegin'));
check('② sceneEnd：對話全部結束（busyDepth 0）那一段叫 refreshInteract', /if\(D\.busyDepth===0\)\{[\s\S]*ADV\.end\(\); if\(GM\.refreshInteract\) GM\.refreshInteract\(\); \} \}/.test(se));
check('③ enter：finally 裡 entering=false 以後叫 refreshInteract', /\} finally \{ entering=false; if\(GM\.refreshInteract\) GM\.refreshInteract\(\);/.test(s));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
