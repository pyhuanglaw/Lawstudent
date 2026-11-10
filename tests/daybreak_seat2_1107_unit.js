// BUG-DAYBREAK-SEAT2-1107（BB-B 11-07 電腦重現）：別人正走過去要坐的位子，不出「坐…」按鈕（和 game3d.js freeSeat 同一個判斷）——不需要瀏覽器。
// 起因：engine3d.js nearestInteractable 的 occupied 只算「還沒坐下、正在走」(!n.seat) 而且 0.35 m；freeSeat 不看 n.seat、0.4 m。
// 正在從別的位子起身走過來的人（n.seat 還在、n.seatTarget＝#2）、或 seatTarget 離座位 0.35～0.4 m：按鈕照出，按了「有人坐了。」。
// 用法：node tests/daybreak_seat2_1107_unit.js（修改前 FAIL 2）
const fs=require('fs'), path=require('path'); const ROOT=path.join(__dirname,'..');
let fail=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(d!==undefined?'　'+d:'')); if(!ok) fail++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'), gsrc=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const m=src.match(/const occupied=\(st\)=>([^;]*\)\));/); check('0. 找得到 nearestInteractable 的 occupied',!!m);
const occ=m?new Function('E','st','return '+m[1]+';'):()=>false;
const g=gsrc.match(/function freeSeat\(st\)\{ const occ=q=>([^;]*);/); const focc=g?new Function('E','q','return '+g[1]+';'):()=>false;
const seat={x:-2.15,z:3.45,yaw:0,lv:0};
const cases=[['正在走過去、還沒坐（n.seat null）',{seat:null,seatTarget:{x:-2.15,z:3.45,lv:0}}],
  ['從別的位子起身走過來（n.seat 還是舊位子）',{seat:{x:1,z:1,lv:0},seatTarget:{x:-2.15,z:3.45,lv:0}}],
  ['seatTarget 離座位 0.37 m',{seat:null,seatTarget:{x:-2.15+0.37,z:3.45,lv:0}}],
  ['已經坐在 #2',{seat:{x:-2.15,z:3.45,lv:0},seatTarget:null}]];
for(const [nm,n] of cases){ const E={npcs:[n]}; check('1. '+nm+'：按鈕不出（occupied）、freeSeat 也不讓坐——兩邊一致',occ(E,seat)===true&&focc(E,seat)===true,JSON.stringify([occ(E,seat),focc(E,seat)])); }
{ const E={npcs:[{seat:{x:-2.15,z:3.45,lv:1},seatTarget:null}]}; check('2. 別的樓層同一個位置有人坐：這一層照出按鈕',occ(E,seat)===false); }
{ const E={npcs:[{seat:null,seatTarget:{x:0,z:0,lv:0}}]}; check('2. 別人走去別的位子：照出按鈕',occ(E,seat)===false); }
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);
