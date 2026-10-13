// 舊版關係 G.rel（第一、二天的劇情 story3d.js 用 GM.rel 加）和新版關係 SOCIAL 要一致——不需要瀏覽器。
// 2026-10-13 批次 3 發現：SOCIAL 只在第一次綁定時從 G.rel 搬一次（新遊戲一開始就綁定），之後 GM.rel 加的關係（第一天和阿哲吃麵 +3 等）都沒進 SOCIAL，
// 第三天約阿哲吃飯，他還是「認識」。修正：GM.rel 兩邊一起加（熟悉度 d、信任 0.6d，和搬家的換算一樣）；之前的存檔在讀檔時補一次（只補一次）。
// 檢查：新遊戲綁定後的值；GM.rel（game3d.js 裡真正的那一段程式）會加到 SOCIAL；舊存檔補一次、之後不會再被拉回來。修改前第 2、3 段會失敗。
// 用法：node tests/social_rel_sync_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'global.SOCIAL='),{filename:'src/social3d.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const defRel=JSON.parse(g3.match(/rel:(\{an:\d+,zhe:\d+,sis:\d+,kai:\d+,yu:\d+\})/)[1].replace(/(\w+):/g,'"$1":'));
// 1. 新遊戲：綁定後 SOCIAL 的熟悉度＝G.rel 的初始值
{ const G={rel:Object.assign({},defRel),flags:{},social:null}; SOCIAL.bind(G);
  check('新遊戲：綁定後阿哲的熟悉度＝舊版初始值 '+defRel.zhe+'、小安（heroine_01）＝'+defRel.an,SOCIAL.rel('zhe').fam===defRel.zhe&&SOCIAL.rel('heroine_01').fam===defRel.an,JSON.stringify([SOCIAL.rel('zhe'),SOCIAL.rel('heroine_01')])); }
// 2. GM.rel（從 game3d.js 取出真正的程式）：舊版、新版一起加
{ const G={rel:Object.assign({},defRel),flags:{},social:null}; SOCIAL.bind(G); const toasts=[];
  const cid=g3.match(/const CID=(\{[^}]*\});/)[1], fn=g3.match(/  function rel\(id,d\)\{[^\n]*\}\n/)[0];
  const rel=vm.runInThisContext('(function(G,SOCIAL,toast){ const CID='+cid+'; const NPCNAME={}; '+fn+' return rel; })')(G,SOCIAL,t=>toasts.push(t));
  const f0=SOCIAL.rel('zhe').fam, a0=SOCIAL.rel('heroine_01').fam;
  rel('zhe',1); rel('zhe',2); rel('zhe',1); rel('zhe',3); rel('an',3); rel('an',-1);   /* 第一、二天劇情裡阿哲、小安的那幾次 */
  check('GM.rel 加的關係也進 SOCIAL：阿哲 +7（第一天上課、吃麵…）',SOCIAL.rel('zhe').fam===f0+7&&G.rel.zhe===defRel.zhe+7,`SOCIAL ${f0}→${SOCIAL.rel('zhe').fam}、G.rel ${G.rel.zhe}`);
  check('小安（an → heroine_01）+3−1',SOCIAL.rel('heroine_01').fam===a0+2,`${a0}→${SOCIAL.rel('heroine_01').fam}`);
  check('信任也照搬家的換算加（0.6 倍）',SOCIAL.rel('zhe').trust>=Math.round(defRel.zhe*0.6)+4,JSON.stringify(SOCIAL.rel('zhe'))); }
// 3. 修正之前的存檔：SOCIAL 的熟悉度停在搬家當時（12），G.rel 已經 19 → 讀檔補一次；之後關係變淡不會又被拉回來
{ const G={rel:Object.assign({},defRel,{zhe:19}),flags:{},social:{rel:{zhe:{fam:12,trust:7,aff:0,resp:0,comf:0,rom:0,npcRom:0,seen:3,talked:2,_migrated:true}},mem:{},reveal:{},prof:{},grad:{interest:'NONE',field:null,prep:0}}};
  SOCIAL.bind(G); check('舊存檔讀檔：阿哲的熟悉度補到 19（G.rel）、信任 ≥ 11',SOCIAL.rel('zhe').fam===19&&SOCIAL.rel('zhe').trust>=11,JSON.stringify(SOCIAL.rel('zhe')));
  check('補過了（_relSync）',G.social._relSync===1);
  SOCIAL.rel('zhe').fam=10; SOCIAL.bind(G); check('只補一次：之後關係變淡（10），再讀檔不會又被拉回 19',SOCIAL.rel('zhe').fam===10,String(SOCIAL.rel('zhe').fam));
  check('其他欄位不變（見過、聊過的次數）',SOCIAL.rel('zhe').seen===3&&SOCIAL.rel('zhe').talked===2); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
