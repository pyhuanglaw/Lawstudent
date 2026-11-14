// STUCK-WALKSELF-1114（BB_458／CC T1 種子 4，2025-11-10 12:00 卡住）：推門那 0.45 秒鎖住玩家（P.busy=true），演完原本「還原成推門前的值」。
// 推門前如果有段落開著（INV.goPrompt「直接過去／自己走過去」選單，sceneBegin＝busy=true），推門途中段落結束（sceneEnd＝busy=false），
// 推門演完又把 busy 還原成 true＝沒有任何段落開著卻永遠鎖住。改成：演完時看現在的段落深度。
// 用法：node tests/door_busy_restore_1114_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'lib/three.bundle.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/door3d.js'),'utf8').replace(/^const DOOR\s*=/m,'global.DOOR='),{filename:'src/door3d.js'});
const IT={x:0,z:2,label:'進入舊路書房',exit:{to:'bookstore'}};
/* 跟 game3d.js sceneBegin／sceneEnd 一樣的段落鎖 */
const mk=(withDepth)=>{ const o={position:{x:0,z:0},rotation:{y:0},userData:{}}; const D={busyDepth:0};
  const GM={G:{zone:'gongguan'},E:{player:{obj:o,busy:false}}};
  GM.sceneBegin=()=>{ D.busyDepth++; GM.E.player.busy=true; }; GM.sceneEnd=()=>{ D.busyDepth=Math.max(0,D.busyDepth-1); if(!D.busyDepth) GM.E.player.busy=false; };
  if(withDepth) GM.sceneDepth=()=>D.busyDepth; return GM; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  { const GM=mk(true); GM.sceneBegin(); const p=DOOR.open(GM,IT); await wait(120); GM.sceneEnd(); await p;
    check('① 推門前選單開著、推門途中選了「自己走過去」（段落收了）→ 演完放開（原本這裡卡住）',GM.E.player.busy===false,'busy='+GM.E.player.busy); }
  { const GM=mk(true); const p=DOOR.open(GM,IT); await wait(120); GM.sceneBegin(); await p;
    check('② 推門前沒段落、推門途中開了段落 → 演完還是鎖著（段落自己會放開）',GM.E.player.busy===true); GM.sceneEnd(); check('②b 段落結束 → 放開',GM.E.player.busy===false); }
  { const GM=mk(true); const p=DOOR.open(GM,IT); await p; check('③ 平常推門：演完放開',GM.E.player.busy===false); }
  { const GM=mk(true); GM.sceneBegin(); const p=DOOR.open(GM,IT); await p; check('④ 推門前段落開著、演完還開著 → 還是鎖著',GM.E.player.busy===true); }
  { const GM=mk(false); GM.E.player.busy=true; const p=DOOR.open(GM,IT); await p; check('⑤ 沒有 sceneDepth（舊介面、測試替身）→ 照舊還原推門前的值',GM.E.player.busy===true); }
  { const GM=mk(false); const p=DOOR.open(GM,IT); await p; check('⑤b 沒有 sceneDepth、推門前沒鎖 → 放開',GM.E.player.busy===false); }
  { const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('⑥ game3d.js 有 GM.sceneDepth（door3d 靠它看段落深度）',/GM\.sceneDepth\s*=/.test(src)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
