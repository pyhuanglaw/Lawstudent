// BUG-CARD-BOHAN-WALK-1103（BB f606）：第一堂民總 classScene 叫玩家走到第 1 排第 3 個位子，玩家自己先坐在第 2 排第 3 個 (−0.75, 0.40)，
// 劇情的自動走路卡 4 秒才被保險放到目的地（walkFallbacks=1）。修法：GM.walkTo 遇到坐著的人（sitAt 設的 seat＋frozen＋pose sit）先 standUp 再走。
// 檢查：1. walkTo 開頭（turbo 之前）有「坐著就起身」；2. standUp 會清掉 frozen、pose 換回 idle（不然起身以後還是不動）。用法：node tests/walk_seated_standup_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const w=src.match(/function walkTo\(ent,x,z,opts\)\{[^\n]*/); const head=w?w[0].slice(0,w[0].indexOf('if(GM.turbo)')):'';
check('1. walkTo 在 turbo 之前：坐著（seat＋frozen＋pose sit）先 standUp',/ent\.seat&&ent\.frozen&&ent\.pose==='sit'\)\s*standUp\(ent\)/.test(head));
const su=src.match(/function standUp\(ent\)\{[^\n]*/);
check('2. standUp 清掉 frozen、pose 換回 idle',!!su&&/ent\.pose='idle'/.test(su[0])&&/ent\.frozen=false/.test(su[0]));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
