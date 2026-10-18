// C1 即興劇社的熱身已拿掉——AA_293 第 1 節（使用者 2026-10-18 選擇題：「可昕加入即興劇社太怪」→「她不加社團，劇社的戲拿掉」）：事件標 retired、邀約不再發。
// 原本的完整測試在 git 歷史（這個檔案 2026-10-18 以前的版本）。用法：node tests/v0_c1_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8').replace(/^const STORY_EVENTS\s*=/m,'global.STORY_EVENTS='));
let fails=0; const check=(n,ok)=>{ console.log((ok?'PASS ':'FAIL ')+n); if(!ok) fails++; };
const e=STORY_EVENTS.find(x=>x.id==='ev_y0_c1'); check('ev_y0_c1 還在（舊存檔演過的讀得到）、標 retired（不會再觸發）',!!e&&!!e.retired);
const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('story3d.js 的邀約關掉（if(false&&…)）',/if\(false&&[^\n]*y0_c1_ask/.test(s));
const ff=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8'); check('事件接事件沒有這一步',!ff.includes("'ev_y0_c1'"));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
