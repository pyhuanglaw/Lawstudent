// 室內的無名路人 7 m 外換遠距離版本（LAWWW2-B 2026-10-24，LAWWW-B 同意）——不需要瀏覽器。
//   博雅一樓階梯教室下午一整班坐著的路人：361 calls、76 萬三角形；6 m 外換低面數 271、50 萬，後排幾乎看不出來（test_shots/crowd_lod_indoor_1024/）。
//   1. character3d.js：室外照舊 30／28 m；室內 7／6.5 m；
//   2. engine3d.js 的 farWant：室內 7 m 外換、6.9 m 不換；換了以後 6.6 m 照舊（不會在邊界一直切換）、6.4 m 換回來；
//   3. 室外：7.1 m、29 m 都不換；30.5 m 換；換了以後 28.5 m 照舊、27.5 m 換回來；
//   4. NPC 迴圈只換無名路人（isExtra），有名字的角色不換；用 farWant、室內看 E.indoor；
//   5. 室內 7 m 內：剛換回來的距離（6.5 m）以內一定是原本的模型（來回走幾趟）。
// 修改前 1、2、4 FAIL。用法：node tests/crowd_far_indoor_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cs=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), es=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const num=re=>{ const m=cs.match(re); return m?parseFloat(m[1]):NaN; };
const CHAR={FAR_OUT:num(/C\.FAR_OUT=([\d.]+);/), FAR_IN:num(/C\.FAR_IN=([\d.]+);/), FAR_OUT_IN:num(/C\.FAR_OUT_IN=([\d.]+);/), FAR_IN_IN:num(/C\.FAR_IN_IN=([\d.]+);/)};
check('1. character3d.js：室外 30／28 m、室內 7／6.5 m', CHAR.FAR_OUT===30&&CHAR.FAR_IN===28&&CHAR.FAR_OUT_IN===7&&CHAR.FAR_IN_IN===6.5, JSON.stringify(CHAR));
const m=es.match(/function farWant\(isFar,cd,indoor\)\{[^\n]*\}/);
check('2. engine3d.js 有 farWant', !!m);
if(m){ const ctx={CHAR}; vm.createContext(ctx); vm.runInContext(m[0]+'\nthis.farWant=farWant;',ctx); const fw=ctx.farWant;
  check('2. 室內：7.1 m 換、6.9 m 不換', fw(false,7.1,true)===true&&fw(false,6.9,true)===false);
  check('2. 室內：換了以後 6.6 m 照舊、6.4 m 換回來', fw(true,6.6,true)===true&&fw(true,6.4,true)===false);
  check('3. 室外：7.1 m、29 m 不換，30.5 m 換', fw(false,7.1,false)===false&&fw(false,29,false)===false&&fw(false,30.5,false)===true);
  check('3. 室外：換了以後 28.5 m 照舊、27.5 m 換回來', fw(true,28.5,false)===true&&fw(true,27.5,false)===false);
  { let far=false, bad=0, flips=0; const path=[]; for(let k=0;k<3;k++){ for(let d=3;d<=10;d+=0.05) path.push(d); for(let d=10;d>=3;d-=0.05) path.push(d); }
    for(const d of path){ const nf=fw(far,d,true); if(nf!==far) flips++; far=nf; if(far&&d<=6.5) bad++; }
    check('5. 室內來回走三趟：6.5 m 以內一定是原本的模型、每趟只換兩次', bad===0&&flips===6, JSON.stringify({bad,flips})); } }
check('4. NPC 迴圈只換無名路人、用 farWant、室內看 E.indoor', /if\(n\.isExtra&&o\.userData\.farLOD\) CHAR\.setFar\(o,farWant\(!!o\.userData\.isFar,cd,!!E\.indoor\)\);/.test(es));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
