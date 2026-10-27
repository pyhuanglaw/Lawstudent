// 羽球小短片接進約會（BADMINTON-CLIP-1027，使用者 X106；AA_485 第 2 節；LAWWW-C 2026-10-27）——不需要瀏覽器。
//   invites3d.js 見面那一段：答應、第一次那一句（FAof）→ 短片（S.badClip）→「一起的時候」→ 時間往前 →「結束」。
//   第一次和這個人打＝完整版；之後只演鏡頭 2；最後一個鏡頭的一句只在完整版演完、沒跳過時說；不在新體育館不演；演的時候收 ADV、演完開回來。
//   game3d.js 的卡住偵測：短片播的時候（BADCLIP.busy）不算卡住（完整版約 13 秒，超過偵測的 10 秒）。
// 修改前（int-l2-1027 套完 LAWWW2 的 patch、還沒接）：第 0 項 FAIL。用法：node tests/badclip_wire_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const INV=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'), GAME=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const m=INV.match(/\n  S\.badClip=async function\(GM,iv,who\)\{[\s\S]*?return ok; \};\n/);
check('0. 抽得到 S.badClip',!!m);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 1. 順序
check('1. 見面：第一次那一句 → 短片 → 一起的時候',/if\(sp\)\{ const FA=FAof\(\); if\(FA\) await S\.playLines\(GM,who,FA\); if\(P\.id==='gym_badminton'\) await S\.badClip\(GM,iv,who\); if\(sp\.during\.length\) await S\.playLines\(GM,who,sp\.during\);/.test(INV));
check('1. 卡住偵測：BADCLIP.busy 算還在動',/live=[^\n]*\(typeof BADCLIP!=='undefined'&&BADCLIP\.busy\)/.test(GAME));
function run(o){ const log=[]; const ADV={active:o.adv!==false,end(){ this.active=false; log.push('adv.end'); },begin(op){ this.active=true; log.push('adv.begin:'+op.right); }};
  const BADCLIP={LINES:{heroine_03:'……你說不笑的。'},play:async(GM,op)=>{ log.push('play:'+op.who+':'+(op.full?'full':'short')+':adv='+ADV.active); return o.skip?false:true; }};
  const ctx={ADV,BADCLIP}; vm.createContext(ctx); vm.runInContext('const S={};'+m[0]+'\nthis.S=S;',ctx);
  const GM={E:{zone:{id:o.zone||'gym'}},G:{invites:o.invites||[]},say:async(w,t)=>log.push('say:'+t)};
  const iv=o.iv||{who:'heroine_03',place:'gym_badminton',state:'done'}; if(!o.invites) GM.G.invites=[iv];
  return ctx.S.badClip(GM,iv,{name:'陳語彤'}).then(r=>({r,log})); }
(async()=>{
  let x=await run({});
  check('2. 第一次：完整版、收 ADV 演、演完開回來、說最後一句',x.log.join('|')==='adv.end|play:heroine_03:full:adv=false|adv.begin:heroine_03|say:……你說不笑的。',x.log.join('|'));
  const iv={who:'heroine_03',place:'gym_badminton',state:'done'};
  x=await run({iv,invites:[{who:'heroine_03',place:'gym_badminton',state:'done',day:3},iv]});
  check('3. 之前打過：只演鏡頭 2、不說最後一句',x.log.join('|')==='adv.end|play:heroine_03:short:adv=false|adv.begin:heroine_03',x.log.join('|'));
  x=await run({iv,invites:[{who:'heroine_01',place:'gym_badminton',state:'done'},{who:'heroine_03',place:'gym_badminton',state:'missed'},iv]});
  check('3. 別人打過、她上次沒來：還是第一次（完整版）',/play:heroine_03:full/.test(x.log.join('|')),x.log.join('|'));
  x=await run({skip:true});
  check('4. 跳過：不說最後一句、ADV 照樣開回來',x.log.join('|')==='adv.end|play:heroine_03:full:adv=false|adv.begin:heroine_03',x.log.join('|'));
  x=await run({zone:'campus'});
  check('5. 不在新體育館：不演',x.r===false&&x.log.length===0,x.log.join('|'));
  x=await run({adv:false});
  check('6. 本來沒有 ADV：不去開 ADV',x.log.join('|')==='play:heroine_03:full:adv=false|say:……你說不笑的。',x.log.join('|'));
  x=await run({iv:{who:'heroine_02',place:'gym_badminton',state:'done'}});
  check('7. 沒有最後一句的人（芷若）：只演短片',x.log.join('|')==='adv.end|play:heroine_02:full:adv=false|adv.begin:heroine_02',x.log.join('|'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
