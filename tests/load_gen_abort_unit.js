// LOAD-GEN-ABORT-1028（BB-C 2026-10-28 07:31 sh_reload）：讀檔時收掉舊劇情。
//   起因：【捷徑】對話框開著時 GAME.applySave 讀另一個存檔，舊的對話框還開著（D.active／D.resolve 沒清），點下去舊劇情（阿姨諮詢）在新的一局接著演、
//   演完把旗標寫進新的 G。正常 UI 走不到（loadFrom 在 busyDepth>0 時擋、stale 排除對話框開著），但卡住 30 秒（stale）讀檔時，
//   舊劇情如果卡在 GM.sleep、走路到達這類「之後還會自己醒來」的等待，醒來以後一樣會在新的一局接著演。
//   做法（src/game3d.js）：GM.loadGen＝讀檔世代，applySave 加一；sleep、walkTo 的等待醒來時世代不同＝不 resolve（舊流程停在那裡，不再往下跑、不寫旗標）；
//   applySave 收掉開著的對話框（D.active／D.resolve 清掉、#dlg 藏起來）和選項（#choices 藏起來、清空；GM.chooseReset 照舊）。
//   不需要瀏覽器：從 game3d.js 抽出 sleep、walkTo 那幾行，用假的 GM、E 跑；applySave 看原始碼（它的相依太多）。
// 用法：node tests/load_gen_abort_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const lineOf=k=>{ const i=SRC.indexOf(k); if(i<0) return null; const a=SRC.lastIndexOf('\n',i)+1, b=SRC.indexOf('\n',i); return SRC.slice(a,b); };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const settled=(p,ms)=>Promise.race([p.then(()=>'resolved'),wait(ms).then(()=>'pending')]);
(async()=>{
  /* ---------- 1 sleep：讀檔以後舊的 sleep 不醒 ---------- */
  const sl=lineOf('const sleep=ms=>');
  check('1. game3d.js 找得到 sleep',!!sl);
  if(sl){ const GM={turbo:false,loadGen:0}; const sleep=vm.runInThisContext('(function(GM){ '+sl+' return sleep; })')(GM);
    const a=sleep(30); const ra=await settled(a,120);
    const b=sleep(30); GM.loadGen++; const rb=await settled(b,120);
    const c=sleep(30); const rc=await settled(c,120);
    check('1. 平常 sleep 照常醒；sleep 中間讀檔（GM.loadGen 加一）＝舊的那個不醒；讀檔以後新的 sleep 照常醒',ra==='resolved'&&rb==='pending'&&rc==='resolved',JSON.stringify({ra,rb,rc})); }
  /* ---------- 2 walkTo：讀檔以後舊的走路到達不 resolve ---------- */
  const w0=SRC.indexOf('  function walkTo(ent,x,z,opts){'), w1=SRC.indexOf('  GM.walkTo=walkTo;');
  check('2. game3d.js 找得到 walkTo',w0>0&&w1>w0);
  if(w0>0&&w1>w0){ const body=SRC.slice(w0,w1);
    const GM={turbo:false,loadGen:0}; const arrive=[]; const E={moveTo:(ent,x,z,cb)=>{ arrive.push(cb); return true; },placeAt:()=>{}};
    const walkTo=vm.runInThisContext('(function(GM,E){ '+body+' return walkTo; })')(GM,E);   /* 抽出來的那一段自己有 const walks＝new Set()、updateWalks */
    const ent={obj:{position:{x:0,z:0}}};
    const p1=walkTo(ent,1,1,{}); arrive.shift()(); const r1=await settled(p1,60);
    const p2=walkTo(ent,2,2,{}); GM.loadGen++; arrive.shift()(); const r2=await settled(p2,60);
    const p3=walkTo(ent,3,3,{}); arrive.shift()(); const r3=await settled(p3,60);
    check('2. 平常走到了照常 resolve；走路中間讀檔＝走到了也不 resolve（舊劇情不往下跑）；讀檔以後新的走路照常',r1==='resolved'&&r2==='pending'&&r3==='resolved',JSON.stringify({r1,r2,r3})); }
  /* ---------- 3 applySave：加世代、收掉對話框和選項（在換 G 之前）---------- */
  const a0=SRC.indexOf('  async function applySave(s){'), a1=SRC.indexOf('  GM.applySave=applySave;');
  const ap=a0>0&&a1>a0?SRC.slice(a0,a1):'';
  const gi=ap.indexOf('GM.loadGen='), gset=ap.indexOf('G=s; GM.G=G;');
  check('3. applySave：GM.loadGen 加一（在 G=s 換存檔之前）',gi>0&&gset>gi);
  check('3. applySave：開著的對話框收掉（D.active＝false、D.resolve＝null、#dlg 藏起來）、選項收掉（#choices 藏起來）——都在換 G 之前',
    /D\.active=false/.test(ap.slice(gi,gset))&&/D\.resolve=null/.test(ap.slice(gi,gset))&&/'dlg'/.test(ap.slice(gi,gset))&&/'choices'/.test(ap.slice(gi,gset)));
  check('3. GM.loadGen 一開始是 0（舊存檔、第一次開遊戲都一樣）',/GM\.loadGen=0;/.test(SRC));
  /* ---------- 4 回標題「新遊戲」（不走 applySave；LOADGEN-LOCKS-1028 子代理回報的缺口）---------- */
  const na0=SRC.indexOf('  function newGameAbort(){'), na=na0>0?SRC.slice(na0,SRC.indexOf('GM.newGameAbort=newGameAbort;',na0)):'';
  check('4. newGameAbort：讀檔世代加一、舊對話框和選項收掉、loadRelease、場景深度歸零（同 applySave 那一段）',/GM\.loadGen=\(GM\.loadGen\|0\)\+1/.test(na)&&/D\.active=false/.test(na)&&/'choices'/.test(na)&&/loadRelease\(\)/.test(na)&&/D\.busyDepth=0/.test(na));
  const calls=(SRC.match(/await waitChars\(\); if\(G\) newGameAbort\(\); const name=/g)||[]).length;
  check('4. 三個新遊戲按鈕（btnNew、btnNewLaw、btnNewEcon）都先 newGameAbort——只有之前玩過（G 不是 null）才做',calls===3,String(calls));
  console.log(fails?'FAILED '+fails:'ALL PASS');
  process.exit(fails?1:0);
})();
